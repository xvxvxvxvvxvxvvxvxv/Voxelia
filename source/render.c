// Voxelia 3DS - renderer GPU del mondo (citro3d) e del testo (citro2d).
//
// Il gioco originale disegna ogni fotogramma migliaia di poligoni su una tela 2D in ordine
// "dal fondo verso lo spettatore". Sulla 3DS il mondo isometrico è trattato come una vera
// proiezione ortografica 3D: la GPU PICA200 usa il depth buffer, quindi niente ordinamento
// sulla CPU, la geometria fissa della zona sta in memoria video a blocchi di 8x8 caselle
// (si disegnano solo quelli inquadrati) e luci, notte e 3D stereoscopico costano quasi nulla.
#include "voxelia.h"
#include "world_shbin.h"
#include "flat_shbin.h"

typedef struct { float x, y, z, e; u8 r, g, b, a; } Vtx;

#define SQ_MAX 76000      // quadrilateri della geometria fissa
#define DQ_MAX 22000      // quadrilateri dinamici opachi
#define TQ_MAX 6000       // quadrilateri trasparenti
#define QPB 16380         // quadrilateri per chiamata (indici a 16 bit)
#define CHS 8             // lato di un blocco in caselle
#define NCH ((MAXN + CHS - 1) / CHS)

static DVLB_s *vshDVLB, *flatDVLB;
static shaderProgram_s prog, progFlat;
static int uProj, uAmb, uLpos, uLcol, fProj, fAmb;
static bool useFlat = false;
static C3D_AttrInfo attr;
static Vtx *SVB, *DVB, *TVB;
static u16 *IDX;
static int SQ, DQ, TQ;
typedef struct { int q0, nA, nq; float zmax; } Chunk;
typedef struct { int q0, n; } TRange;
static TRange OCC[MAXN][MAXN];
static Chunk CH[NCH][NCH];
static int curStream = 0;   // 0 fisso, 1 dinamico, 2 trasparente
float gEmit = 0;
float camX = 0, camY = 0, camS = .62f, camTX = 0, camTY = 0;
static float stereoK = 0, dFocus = 0, dMin = -200, dMax = 3000;

C3D_RenderTarget *topL, *topR, *bot;
C2D_TextBuf TBUF;
static C2D_Font sysFont = NULL;

u32 shade(u32 c, float f) {
	int r = (int)(((c >> 16) & 255) * f), g = (int)(((c >> 8) & 255) * f), b = (int)((c & 255) * f);
	if (r > 255) r = 255; if (g > 255) g = 255; if (b > 255) b = 255; if (r < 0) r = 0; if (g < 0) g = 0; if (b < 0) b = 0;
	return (r << 16) | (g << 8) | b;
}

static inline Vtx *quadAlloc(void) {
	if (curStream == 0) { if (SQ >= SQ_MAX) return NULL; return SVB + 4 * SQ++; }
	if (curStream == 1) { if (DQ >= DQ_MAX) return NULL; return DVB + 4 * DQ++; }
	if (TQ >= TQ_MAX) return NULL; return TVB + 4 * TQ++;
}
static inline void sv(Vtx *v, float x, float y, float z, u32 c, u8 a) {
	v->x = x; v->y = y; v->z = z; v->e = gEmit; v->r = c >> 16; v->g = (c >> 8) & 255; v->b = c & 255; v->a = a;
}
static float curZmax = 0;
static inline void quad(float ax, float ay, float az, float bx, float by, float bz, float cx, float cy, float cz, float dx, float dy, float dz, u32 c, u8 a) {
	Vtx *v = quadAlloc(); if (!v) return;
	sv(v, ax, ay, az, c, a); sv(v + 1, bx, by, bz, c, a); sv(v + 2, cx, cy, cz, c, a); sv(v + 3, dx, dy, dz, c, a);
}
// Un parallelepipedo voxel: si vedono solo il tetto e le due facce rivolte verso lo spettatore
// (+y in basso a sinistra, ombra 0,78; +x in basso a destra, ombra 0,58), come nell'originale.
void boxA(float x, float y, float z, float w, float d, float h, u32 c, float f, u8 a) {
	float T = z + h;
	if (curStream == 0 && T > curZmax) curZmax = T;
	if (h > 0) {
		quad(x, y + d, T, x + w, y + d, T, x + w, y + d, z, x, y + d, z, shade(c, .78f * f), a);
		quad(x + w, y, T, x + w, y + d, T, x + w, y + d, z, x + w, y, z, shade(c, .58f * f), a);
	}
	quad(x, y, T, x + w, y, T, x + w, y + d, T, x, y + d, T, shade(c, f), a);
}
void box(float x, float y, float z, float w, float d, float h, u32 c, float f) { boxA(x, y, z, w, d, h, c, f, 255); }
// come rbox() dell'originale: il box (x,y,w,d) in coordinate locali, girato di 45° attorno a (ox,oy)
void boxR(float ox, float oy, float x, float y, float z, float w, float d, float h, u32 c, float f, u8 a) {
	const float k = .70710678f;
	float U[4] = {x, x + w, x + w, x}, V[4] = {y, y, y + d, y + d}, QX[4], QY[4];
	for (int i = 0; i < 4; i++) { QX[i] = ox + U[i] * k - V[i] * k; QY[i] = oy + U[i] * k + V[i] * k; }
	float T = z + h;
	if (h > 0) for (int i = 0; i < 4; i++) {
		int j = (i + 1) & 3;
		float nx = QY[j] - QY[i], ny = QX[i] - QX[j];
		if (nx + ny <= 1e-6f) continue;
		float l = nx * nx + ny * ny; if (l < 1e-9f) l = 1;
		float sf = (.58f * nx * fmaxf(0, nx) + .78f * ny * fmaxf(0, ny)) / l + .68f * (fminf(0, nx) * fminf(0, nx) + fminf(0, ny) * fminf(0, ny)) / l;
		quad(QX[i], QY[i], T, QX[j], QY[j], T, QX[j], QY[j], z, QX[i], QY[i], z, shade(c, sf * f), a);
	}
	quad(QX[0], QY[0], T, QX[1], QY[1], T, QX[2], QY[2], T, QX[3], QY[3], T, shade(c, f), a);
}
// solo il tetto (pavimenti interni, senza lati)
static void topOnly(float x, float y, float z, float w, float d, u32 c) {
	if (curStream == 0 && z > curZmax) curZmax = z;
	quad(x, y, z, x + w, y, z, x + w, y + d, z, x, y + d, z, c, 255);
}
void flatEllipse(float cx, float cy, float z, float rx, float ry, u32 c, u8 a) {
	const int n = 12;
	for (int i = 0; i < n; i += 2) {
		float a0 = i * 2 * PI_F / n, a1 = (i + 1) * 2 * PI_F / n, a2 = (i + 2) * 2 * PI_F / n;
		quad(cx, cy, z, cx + cosf(a0) * rx, cy + sinf(a0) * ry, z, cx + cosf(a1) * rx, cy + sinf(a1) * ry, z, cx + cosf(a2) * rx, cy + sinf(a2) * ry, z, c, a);
	}
}
void flatRing(float cx, float cy, float z, float rx, float ry, float th, u32 c, u8 a) {
	const int n = 20;
	for (int i = 0; i < n; i++) {
		float a0 = i * 2 * PI_F / n, a1 = (i + 1) * 2 * PI_F / n;
		float c0 = cosf(a0), s0 = sinf(a0), c1 = cosf(a1), s1 = sinf(a1);
		quad(cx + c0 * rx, cy + s0 * ry, z, cx + c1 * rx, cy + s1 * ry, z, cx + c1 * (rx + th), cy + s1 * (ry + th), z, cx + c0 * (rx + th), cy + s0 * (ry + th), z, c, a);
	}
}
void rStream(int s) { curStream = s; }

/* ---------------- testo (carattere di sistema, con accenti italiani) ---------------- */
void txtO(float x, float y, float sc, u32 col, const char *s, int align) {
	C2D_Text t;
	C2D_TextFontParse(&t, sysFont, TBUF, s);
	C2D_TextOptimize(&t);
	u32 fl = C2D_WithColor | (align == 1 ? C2D_AlignCenter : align == 2 ? C2D_AlignRight : 0);
	C2D_DrawText(&t, fl, x, y, 0, sc, sc, col);
}
void txt(float x, float y, float sc, u32 col, const char *s) { txtO(x, y, sc, col, s, 0); }
void txtC(float x, float y, float sc, u32 col, const char *s) { txtO(x, y, sc, col, s, 1); }
void txtR(float x, float y, float sc, u32 col, const char *s) { txtO(x, y, sc, col, s, 2); }
// larghezze dei caratteri del font di sistema, per misurare e andare a capo senza analizzare il testo
static u8 CW[512];
static bool cwOk = false;
static float LF = 30;
static void cwInit(void) {
	for (int i = 0; i < 512; i++) {
		int gi = C2D_FontGlyphIndexFromCodePoint(NULL, i);
		charWidthInfo_s *w = C2D_FontGetCharWidthInfo(NULL, gi);
		CW[i] = w ? w->charWidth : 12;
	}
	FINF_s *fi = C2D_FontGetInfo(NULL);
	if (fi) LF = fi->lineFeed;
	cwOk = true;
}
static const char *u8next(const char *s, u32 *cp) {
	u8 c = (u8)*s;
	if (c < 0x80) { *cp = c; return s + 1; }
	if ((c & 0xE0) == 0xC0 && s[1]) { *cp = ((c & 0x1F) << 6) | (s[1] & 0x3F); return s + 2; }
	if ((c & 0xF0) == 0xE0 && s[1] && s[2]) { *cp = ((c & 0x0F) << 12) | ((s[1] & 0x3F) << 6) | (s[2] & 0x3F); return s + 3; }
	*cp = '?'; return s + 1;
}
static float cwOf(u32 cp) {
	if (cp < 512) return CW[cp];
	return C2D_FontGetCharWidthInfo(NULL, C2D_FontGlyphIndexFromCodePoint(NULL, cp))->charWidth;
}
float txtW(const char *s, float sc) {
	if (!cwOk) cwInit();
	float w = 0; u32 cp;
	while (*s) { s = u8next(s, &cp); if (cp == '\n') break; w += cwOf(cp); }
	return w * sc;
}
float lineH(float sc) { if (!cwOk) cwInit(); return LF * sc; }
// testo a capo sulle parole; restituisce l'altezza occupata. y<-1000 misura soltanto. Con maxH si ferma
// all'ultima riga che ci sta e la chiude con «…».
static float wrapMax = 0;
float txtWrapMax(float x, float y, float w, float sc, u32 col, const char *s, float maxH) {
	wrapMax = maxH; float h = txtWrap(x, y, w, sc, col, s); wrapMax = 0; return h;
}
float txtWrap(float x, float y, float w, float sc, u32 col, const char *s) {
	if (!cwOk) cwInit();
	char line[256];
	float lh = LF * sc, yy = y;
	const char *p = s;
	while (*p) {
		const char *ls = p, *lastSp = NULL, *q = p; float lw = 0; u32 cp;
		while (*q) {
			const char *nq = u8next(q, &cp);
			if (cp == '\n') break;
			float cw = cwOf(cp) * sc;
			if (lw + cw > w && q > ls) { if (lastSp) q = lastSp; break; }
			if (cp == ' ') lastSp = q;
			lw += cw; q = nq;
		}
		int n = q - ls; if (n > 250) n = 250;
		memcpy(line, ls, n); line[n] = 0;
		if (wrapMax > 0 && yy - y + 2 * lh > wrapMax && *q) {   // ultima riga disponibile
			while (n > 0 && txtW(line, sc) > w - txtW("…", sc)) { n--; while (n > 0 && (line[n] & 0xC0) == 0x80) n--; line[n] = 0; }
			strcat(line, "…");
			if (y > -1000) txt(x, yy, sc, col, line);
			return yy + lh - y;
		}
		if (y > -1000) txt(x, yy, sc, col, line);
		yy += lh;
		p = q;
		if (*p == ' ' || *p == '\n') p++;
	}
	return yy - y;
}
void rect(float x, float y, float w, float h, u32 c) { C2D_DrawRectSolid(x, y, 0, w, h, c); }
u32 RGBA(u32 rgb, u8 a) { return C2D_Color32((rgb >> 16) & 255, (rgb >> 8) & 255, rgb & 255, a); }

/* ---------------- avvio ---------------- */
void rInit(void) {
	gfxInitDefault();
	gfxSet3D(true);
	C3D_Init(C3D_DEFAULT_CMDBUF_SIZE * 2);
	C2D_Init(C2D_DEFAULT_MAX_OBJECTS * 2);
	C2D_Prepare();
	topL = C3D_RenderTargetCreate(240, 400, GPU_RB_RGBA8, GPU_RB_DEPTH24_STENCIL8);
	C3D_RenderTargetSetOutput(topL, GFX_TOP, GFX_LEFT, GX_TRANSFER_FLIP_VERT(0) | GX_TRANSFER_OUT_TILED(0) | GX_TRANSFER_RAW_COPY(0) | GX_TRANSFER_IN_FORMAT(GX_TRANSFER_FMT_RGBA8) | GX_TRANSFER_OUT_FORMAT(GX_TRANSFER_FMT_RGB8) | GX_TRANSFER_SCALING(GX_TRANSFER_SCALE_NO));
	topR = C3D_RenderTargetCreate(240, 400, GPU_RB_RGBA8, GPU_RB_DEPTH24_STENCIL8);
	C3D_RenderTargetSetOutput(topR, GFX_TOP, GFX_RIGHT, GX_TRANSFER_FLIP_VERT(0) | GX_TRANSFER_OUT_TILED(0) | GX_TRANSFER_RAW_COPY(0) | GX_TRANSFER_IN_FORMAT(GX_TRANSFER_FMT_RGBA8) | GX_TRANSFER_OUT_FORMAT(GX_TRANSFER_FMT_RGB8) | GX_TRANSFER_SCALING(GX_TRANSFER_SCALE_NO));
	bot = C2D_CreateScreenTarget(GFX_BOTTOM, GFX_LEFT);
	TBUF = C2D_TextBufNew(12000);
	sysFont = NULL;   // carattere di sistema

	vshDVLB = DVLB_ParseFile((u32 *)world_shbin, world_shbin_size);
	shaderProgramInit(&prog);
	shaderProgramSetVsh(&prog, &vshDVLB->DVLE[0]);
	uProj = shaderInstanceGetUniformLocation(prog.vertexShader, "projection");
	uAmb = shaderInstanceGetUniformLocation(prog.vertexShader, "ambient");
	uLpos = shaderInstanceGetUniformLocation(prog.vertexShader, "lpos");
	uLcol = shaderInstanceGetUniformLocation(prog.vertexShader, "lcol");
	flatDVLB = DVLB_ParseFile((u32 *)flat_shbin, flat_shbin_size);
	shaderProgramInit(&progFlat);
	shaderProgramSetVsh(&progFlat, &flatDVLB->DVLE[0]);
	fProj = shaderInstanceGetUniformLocation(progFlat.vertexShader, "projection");
	fAmb = shaderInstanceGetUniformLocation(progFlat.vertexShader, "ambient");
	AttrInfo_Init(&attr);
	AttrInfo_AddLoader(&attr, 0, GPU_FLOAT, 4);
	AttrInfo_AddLoader(&attr, 1, GPU_UNSIGNED_BYTE, 4);

	SVB = linearAlloc(sizeof(Vtx) * 4 * SQ_MAX);
	DVB = linearAlloc(sizeof(Vtx) * 4 * DQ_MAX);
	TVB = linearAlloc(sizeof(Vtx) * 4 * TQ_MAX);
	IDX = linearAlloc(sizeof(u16) * 6 * QPB);
	for (int i = 0; i < QPB; i++) {
		IDX[i * 6] = i * 4; IDX[i * 6 + 1] = i * 4 + 1; IDX[i * 6 + 2] = i * 4 + 2;
		IDX[i * 6 + 3] = i * 4; IDX[i * 6 + 4] = i * 4 + 2; IDX[i * 6 + 5] = i * 4 + 3;
	}
	GSPGPU_FlushDataCache(IDX, sizeof(u16) * 6 * QPB);
}
void rExit(void) {
	linearFree(SVB); linearFree(DVB); linearFree(TVB); linearFree(IDX);
	shaderProgramFree(&prog); DVLB_Free(vshDVLB);
	shaderProgramFree(&progFlat); DVLB_Free(flatDVLB);
	C2D_TextBufDelete(TBUF);
	C2D_Fini(); C3D_Fini(); gfxExit();
}

/* ---------------- geometria fissa della zona ---------------- */
static int TS[MAXN * MAXN + 1];
static void emitQ(const QBox *q) {
	gEmit = emissiveQ(q) ? .85f : 0;
	boxA(q->x / 256.f, q->y / 256.f, q->z / 8.f, q->w / 256.f, q->d / 256.f, q->h / 8.f, (q->r << 16) | (q->g << 8) | q->b, q->f / 100.f, q->a < 250 ? q->a : 255);
}
void rBuildZone(const QBox *B, int nb) {
	SQ = 0; curStream = 0;
	int nc = (N + CHS - 1) / CHS;
	for (int cy = 0; cy < NCH; cy++) for (int cx = 0; cx < NCH; cx++) CH[cy][cx] = (Chunk){0, 0, 0, 0};
	memset(OCC, 0, sizeof OCC);
	// i voxel sono ordinati per casella: inizio di ogni casella
	int j = 0;
	for (int t = 0; t <= N * N; t++) { while (j < nb && B[j].tile < t) j++; TS[t] = j; }
	for (int cy = 0; cy < nc; cy++) for (int cx = 0; cx < nc; cx++) {
		int q0 = SQ; curZmax = 0;
		for (int y = cy * CHS; y < cy * CHS + CHS && y < N; y++)
			for (int x = cx * CHS; x < cx * CHS + CHS && x < N; x++) {
				if (OCCT[y][x]) continue;
				int t = y * N + x;
				for (int i = TS[t]; i < TS[t + 1]; i++) emitQ(&B[i]);
			}
		int nA = SQ - q0;
		for (int y = cy * CHS; y < cy * CHS + CHS && y < N; y++)
			for (int x = cx * CHS; x < cx * CHS + CHS && x < N; x++) {
				if (!OCCT[y][x]) continue;
				int t = y * N + x, t0 = SQ;
				for (int i = TS[t]; i < TS[t + 1]; i++) emitQ(&B[i]);
				OCC[y][x] = (TRange){t0, SQ - t0};
			}
		CH[cy][cx] = (Chunk){q0, nA, SQ - q0, curZmax};
	}
	gEmit = 0;
	GSPGPU_FlushDataCache(SVB, sizeof(Vtx) * 4 * (SQ ? SQ : 1));
	dMin = -400; dMax = 16 * 2 * N + 600;
}

static void drawQuads(Vtx *base, int q0, int nq) {
	while (nq > 0) {
		int n = nq > QPB ? QPB : nq;
		C3D_BufInfo *bi = C3D_GetBufInfo();
		BufInfo_Init(bi);
		BufInfo_Add(bi, base + q0 * 4, sizeof(Vtx), 2, 0x10);
		C3D_DrawElements(GPU_TRIANGLES, n * 6, C3D_UNSIGNED_SHORT, IDX);
		q0 += n; nq -= n;
	}
}

void worldToScreen(float x, float y, float z, float *sx, float *sy) {
	float d = 16 * (x + y) + 1.5f * z;   // profondità per il 3D: l'altezza conta di più, così gli oggetti alti escono dallo schermo
	*sx = 200 + camS * (32 * (x - y) - camX) + stereoK * (d - dFocus);
	*sy = 120 + camS * (16 * (x + y) - z - camY);
}

static void setProj(void) {
	C3D_Mtx T, W, F;
	Mtx_OrthoTilt(&T, 0, 400, 240, 0, 1, -1, true);
	T.r[2].x = 0; T.r[2].y = 0; T.r[2].z = 1; T.r[2].w = 0;
	Mtx_Zeros(&W);
	float S = camS, k = stereoK, D = dMax - dMin;
	W.r[0].x = 32 * S + 16 * k; W.r[0].y = -32 * S + 16 * k; W.r[0].z = 1.5f * k; W.r[0].w = 200 - S * camX - k * dFocus;
	W.r[1].x = 16 * S; W.r[1].y = 16 * S; W.r[1].z = -S; W.r[1].w = 120 - S * camY;
	W.r[2].x = -16 / D; W.r[2].y = -16 / D; W.r[2].z = -.5f / D; W.r[2].w = dMin / D;
	W.r[3].w = 1;
	Mtx_Multiply(&F, &T, &W);
	C3D_FVUnifMtx4x4(GPU_VERTEX_SHADER, useFlat ? fProj : uProj, &F);
}

/* ---------------- luci: ambiente e 8 luci puntiformi ---------------- */
Light SLIGHT[256];
int NSLIGHT = 0;
void addSLight(float x, float y, float z, float r, u32 c, float a) {
	if (NSLIGHT >= 256) return;
	SLIGHT[NSLIGHT++] = (Light){x, y, z / 32, r, ((c >> 16) & 255) / 255.f * a, ((c >> 8) & 255) / 255.f * a, (c & 255) / 255.f * a};
}
static void setLights(float ar, float ag, float ab, bool dark) {
	if (useFlat) { C3D_FVUnifSet(GPU_VERTEX_SHADER, fAmb, ar, ag, ab, 1); return; }
	C3D_FVUnifSet(GPU_VERTEX_SHADER, uAmb, ar, ag, ab, 1);
	Light L[8]; int nl = 0;
	if (dark) {
		// l'eroe porta sempre un po' di luce con sé
		L[nl++] = (Light){P.px, P.py, .6f, 4.2f, .55f, .5f, .4f};
		// le luci fisse più vicine al centro dell'inquadratura
		float cx = P.px, cy = P.py;
		float bd[7]; int bi[7]; int nb = 0;
		for (int i = 0; i < NSLIGHT; i++) {
			float d = fabsf(SLIGHT[i].x - cx) + fabsf(SLIGHT[i].y - cy);
			if (d > 16) continue;
			if (nb < 7) { bd[nb] = d; bi[nb] = i; nb++; }
			else { int w = 0; for (int j = 1; j < 7; j++) if (bd[j] > bd[w]) w = j; if (d < bd[w]) { bd[w] = d; bi[w] = i; } }
		}
		for (int j = 0; j < nb; j++) L[nl++] = SLIGHT[bi[j]];
	}
	for (int i = 0; i < 8; i++) {
		if (i < nl) {
			C3D_FVUnifSet(GPU_VERTEX_SHADER, uLpos + i, L[i].x, L[i].y, L[i].z, 1.f / (L[i].r * L[i].r));
			C3D_FVUnifSet(GPU_VERTEX_SHADER, uLcol + i, L[i].cr, L[i].cg, L[i].cb, 0);
		} else {
			C3D_FVUnifSet(GPU_VERTEX_SHADER, uLpos + i, -999, -999, 0, 1);
			C3D_FVUnifSet(GPU_VERTEX_SHADER, uLcol + i, 0, 0, 0, 0);
		}
	}
}

static void bindWorld(void) {
	C3D_BindProgram(useFlat ? &progFlat : &prog);
	C3D_SetAttrInfo(&attr);
	C3D_TexEnv *env = C3D_GetTexEnv(0);
	C3D_TexEnvInit(env);
	C3D_TexEnvSrc(env, C3D_Both, GPU_PRIMARY_COLOR, 0, 0);
	C3D_TexEnvFunc(env, C3D_Both, GPU_REPLACE);
	for (int i = 1; i < 6; i++) C3D_TexEnvInit(C3D_GetTexEnv(i));
	C3D_CullFace(GPU_CULL_NONE);
	C3D_AlphaTest(false, GPU_ALWAYS, 0);
	C3D_StencilTest(false, GPU_ALWAYS, 0, 0, 0);
	C3D_AlphaBlend(GPU_BLEND_ADD, GPU_BLEND_ADD, GPU_SRC_ALPHA, GPU_ONE_MINUS_SRC_ALPHA, GPU_SRC_ALPHA, GPU_ONE_MINUS_SRC_ALPHA);
}

/* ---------------- dinamica: acqua, fiamme, entità, effetti ---------------- */
// muri e arredi alti davanti all'eroe diventano trasparenti (come nell'originale)
static bool faded(int x, int y) {
	float d = (x + y) - (P.px + P.py), w = (x - y) - (P.px - P.py);
	return d > 0 && d < 5.5f && fabsf(w) < 3.5f;
}
static int heroQ0, heroQ1;
static void buildDynamic(void) {
	DQ = 0; TQ = 0;
	curStream = 1;
	// entità
	for (int i = 0; i < NENT; i++) {
		Ent *e = &ents[i];
		if (!e->k) continue;
		float sx, sy; worldToScreen(e->px, e->py, 0, &sx, &sy);
		if (sx < -120 || sx > 520 || sy < -60 || sy > 360) continue;
		drawEntity(e);
	}
	// copie trasparenti dei muri davanti all'eroe
	{
		int x0 = (int)(P.px) - 5, x1 = (int)(P.px) + 7, y0 = (int)(P.py) - 5, y1 = (int)(P.py) + 7;
		for (int y = y0; y <= y1; y++) for (int x = x0; x <= x1; x++) {
			if (x < 0 || y < 0 || x >= N || y >= N || !OCC[y][x].n || !faded(x, y)) continue;
			int n = OCC[y][x].n; if (TQ + n >= TQ_MAX - 2000) continue;
			memcpy(TVB + 4 * TQ, SVB + 4 * OCC[y][x].q0, sizeof(Vtx) * 4 * n);
			for (int i = 0; i < n * 4; i++) TVB[4 * TQ + i].a = 92;
			TQ += n;
		}
	}
	heroQ0 = DQ;
	drawHero();
	drawPeers();
	heroQ1 = DQ;
	drawFx();
	// sagoma dell'eroe dietro i muri: copia trasparente disegnata solo dove è nascosto
	int hq = heroQ1 - heroQ0;
	if (hq > 0 && TQ + hq < TQ_MAX) {
		memcpy(TVB + 4 * TQ, DVB + 4 * heroQ0, sizeof(Vtx) * 4 * hq);
		// spostata appena verso lo spettatore lungo la direzione di vista (1,1,32): stessa posizione sullo schermo,
		// ma più vicina, così la sagoma non copre l'eroe quando è già visibile
		for (int i = 0; i < hq * 4; i++) { Vtx *v = TVB + 4 * TQ + i; v->x += .03f; v->y += .03f; v->z += .96f; v->r = 0x9a; v->g = 0xdc; v->b = 0xff; v->a = 110; v->e = 1; }
	}
	GSPGPU_FlushDataCache(DVB, sizeof(Vtx) * 4 * (DQ ? DQ : 1));
	GSPGPU_FlushDataCache(TVB, sizeof(Vtx) * 4 * (TQ + hq + 1));
	curStream = 0;
}
static int xrayQ0, xrayN;

static void drawWorld(float ar, float ag, float ab, bool dark) {
	useFlat = !dark;
	bindWorld();
	setProj();
	setLights(ar, ag, ab, dark);
	C3D_DepthTest(true, GPU_GREATER, GPU_WRITE_ALL);
	// blocchi fissi inquadrati
	int nc = (N + CHS - 1) / CHS;
	for (int cy = 0; cy < nc; cy++) for (int cx = 0; cx < nc; cx++) {
		Chunk *c = &CH[cy][cx];
		if (!c->nq) continue;
		float x0 = cx * CHS, y0 = cy * CHS, x1 = x0 + CHS, y1 = y0 + CHS;
		float ax, ay, bx, by, qx, qy, dx, dy;
		worldToScreen(x0, y1, 0, &ax, &ay);   // estremo sinistro
		worldToScreen(x1, y0, 0, &bx, &by);   // estremo destro
		worldToScreen(x0, y0, c->zmax, &qx, &qy); // in alto
		worldToScreen(x1, y1, -12, &dx, &dy);  // in basso
		if (ax > 420 || bx < -20 || qy > 250 || dy < -10) continue;
		// il blocco tocca la zona davanti all'eroe? allora i muri si disegnano a tratti, saltando quelli trasparenti
		float px = P.px, py = P.py;
		bool near = x1 + 1 > px - 6 && x0 - 1 < px + 8 && y1 + 1 > py - 6 && y0 - 1 < py + 8;
		if (!near) { drawQuads(SVB, c->q0, c->nq); continue; }
		drawQuads(SVB, c->q0, c->nA);
		int run0 = -1, runN = 0;
		for (int y = (int)y0; y < (int)y1 && y < N; y++) for (int x = (int)x0; x < (int)x1 && x < N; x++) {
			TRange r = OCC[y][x];
			if (!r.n) continue;
			if (faded(x, y)) { if (runN) drawQuads(SVB, run0, runN); run0 = -1; runN = 0; continue; }
			if (run0 < 0) { run0 = r.q0; runN = r.n; }
			else if (run0 + runN == r.q0) runN += r.n;
			else { drawQuads(SVB, run0, runN); run0 = r.q0; runN = r.n; }
		}
		if (runN) drawQuads(SVB, run0, runN);
	}
	if (heroQ0) drawQuads(DVB, 0, heroQ0);
	// sagoma dell'eroe dove il mondo lo copre: disegnata prima dell'eroe, così conta solo la profondità
	// del mondo (il mantello dietro al busto non accende la sagoma)
	if (xrayN) {
		C3D_DepthTest(true, GPU_LESS, GPU_WRITE_COLOR);
		drawQuads(TVB, xrayQ0, xrayN);
		C3D_DepthTest(true, GPU_GREATER, GPU_WRITE_ALL);
	}
	if (DQ > heroQ0) drawQuads(DVB, heroQ0, DQ - heroQ0);
	// trasparenze: ombre, cerchi d'avviso, muri davanti all'eroe (senza scrivere la profondità)
	C3D_DepthTest(true, GPU_GREATER, GPU_WRITE_COLOR);
	if (TQ) drawQuads(TVB, 0, TQ);
}

static u32 bgColor(void) {
	u32 c = ZBG;
	float nk = NK;
	int r = (c >> 16) & 255, g = (c >> 8) & 255, b = c & 255;
	r = (int)(r * (1 - nk) + 10 * nk); g = (int)(g * (1 - nk) + 14 * nk); b = (int)(b * (1 - nk) + 40 * nk);
	return (r << 16) | (g << 8) | b;
}

extern bool TITLE_MODE;
void rFrame(void) {
	float sl = osGet3DSliderState();
	bool stereo = sl > 0.01f;
	C3D_FrameBegin(C3D_FRAME_SYNCDRAW);
	C2D_TextBufClear(TBUF);
	// luce ambiente: giorno, alba/tramonto, notte; sotterranei e interni più raccolti
	float ar = 1, ag = 1, ab = 1;
	bool dark = false;
	bool outdoor = ZOUT;
	if (outdoor) {
		float nk = NK, dk = DK;
		ar = 1 - nk * .7f; ag = 1 - nk * .66f; ab = 1 - nk * .42f;
		ar = ar * (1 - dk * .05f) + dk * .12f * (1 - nk); ag *= 1 - dk * .1f; ab *= 1 - dk * .22f;
		dark = nk > .05f;
	} else if (ZDG >= 0) { ar = .8f; ag = .78f; ab = .8f; dark = true; }
	else { ar = .95f; ag = .93f; ab = .9f; dark = true; }
	// la profondità dello schermo segue l'eroe: lui resta sul piano dello schermo, il resto esce o rientra
	dFocus = 16 * (P.px + P.py) + 15;
	stereoK = 0;
	xrayN = 0;
	buildDynamic();
	xrayQ0 = TQ; xrayN = heroQ1 - heroQ0;
	if (TQ + xrayN >= TQ_MAX) xrayN = 0;
	for (int eye = 0; eye < (stereo ? 2 : 1); eye++) {
		C3D_RenderTarget *tg = eye ? topR : topL;
		stereoK = stereo ? (eye ? -1 : 1) * sl * .045f * (camS / .72f) : 0;
		C3D_RenderTargetClear(tg, C3D_CLEAR_ALL, (bgColor() << 8) | 0xff, 0);
		C3D_FrameDrawOn(tg);
		drawWorld(ar, ag, ab, dark);
		C2D_Prepare();
		C3D_DepthTest(false, GPU_ALWAYS, GPU_WRITE_COLOR);
		C2D_SceneBegin(tg);
		uiDrawTopOverlay(stereoK);
		C2D_Flush();
	}
	C2D_Prepare();
	C3D_DepthTest(false, GPU_ALWAYS, GPU_WRITE_COLOR);
	C2D_TargetClear(bot, C2D_Color32(16, 19, 26, 255));
	C2D_SceneBegin(bot);
	uiDrawBottom();
	C2D_Flush();
	C3D_FrameEnd(0);
}

int rStats(char *b) { extern int dbgMsgs, dbgS, dbgFail; extern char dbgLast[24]; int np = 0; for (int i = 0; i < MAXPEER; i++) if (PEERS[i].used) np++;
	char rk[64]; rmKey(rk, sizeof rk); const char *prm = ""; for (int i = 0; i < MAXPEER; i++) if (PEERS[i].used) { prm = PEERS[i].rm; break; }
	return sprintf(b, "m%d s%d f%d %s np%d [%s|%s] ok%d %s", dbgMsgs, dbgS, dbgFail, dbgLast, np, rk, prm, netOk, netStatus); }
