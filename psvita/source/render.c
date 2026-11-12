// Voxelia PS Vita - renderer del mondo (OpenGL / vitaGL).
//
// Il gioco originale disegna ogni fotogramma migliaia di poligoni su una tela 2D in ordine "dal fondo verso lo
// spettatore". Come nel port 3DS, il mondo isometrico è una vera proiezione ortografica 3D con il depth buffer:
// niente ordinamento sulla CPU. Sulla Vita la geometria fissa della zona sta in un vertex buffer in memoria
// video, divisa in blocchi di 8x8 caselle (si disegnano solo quelli inquadrati); le luci (giorno, notte,
// torce, lampioni, fuochi e la luce dell'eroe) si calcolano nello shader, fino a 12 per vertice, con l'MSAA 4x
// della GPU SGX543 sullo schermo intero a 960x544.
#include "voxelia.h"
#include "glinc.h"

typedef struct { float x, y, z, e; u8 r, g, b, a; } Vtx;

#define SQ_MAX 200000     // quadrilateri della geometria fissa
#define DQ_MAX 60000      // quadrilateri dinamici opachi
#define TQ_MAX 24000      // quadrilateri trasparenti
#define QPB 16380         // quadrilateri per chiamata (indici a 16 bit)
#define CHS 8             // lato di un blocco in caselle
#define NCH ((MAXN + CHS - 1) / CHS)
#define NL 12             // luci puntiformi per vertice

static GLuint progLit, progFlat;
static GLint uProjL, uAmbL, uLposL, uLcolL, uProjF, uAmbF;
// Tre flussi (fisso, dinamico, trasparente), ognuno con DUE vertex buffer: posizioni (x, y, z, emissione) e colori.
// Su vitaGL gli attributi interleaved nello stesso VBO finiscono in un offset GXM a 16 bit: oltre i primi 64 KB il
// disegno andava a pescare dati sbagliati (mondo invisibile, solo il cielo). Con buffer separati l'offset è un
// puntatore a 32 bit.
enum { ST_STATIC, ST_DYN, ST_TR };
static GLuint vboPos[3], vboCol[3], ibo;
static float *splitPos; static u32 *splitCol; static int splitCap = 0;
static bool useFlat = false;
static Vtx *SVB, *DVB, *TVB;
static int SQ, DQ, TQ;
typedef struct { int q0, nA, nq; float zmax; } Chunk;
typedef struct { int q0, n; } TRange;
static TRange OCC[MAXN][MAXN];
static Chunk CH[NCH][NCH];
static int curStream = 0;   // 0 fisso, 1 dinamico, 2 trasparente
float gEmit = 0;
float camX = 0, camY = 0, camS = .62f, camTX = 0, camTY = 0;
static float dMin = -200, dMax = 3000;

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
void flatEllipse(float cx, float cy, float z, float rx, float ry, u32 c, u8 a) {
	const int n = 16;
	for (int i = 0; i < n; i += 2) {
		float a0 = i * 2 * PI_F / n, a1 = (i + 1) * 2 * PI_F / n, a2 = (i + 2) * 2 * PI_F / n;
		quad(cx, cy, z, cx + cosf(a0) * rx, cy + sinf(a0) * ry, z, cx + cosf(a1) * rx, cy + sinf(a1) * ry, z, cx + cosf(a2) * rx, cy + sinf(a2) * ry, z, c, a);
	}
}
void flatRing(float cx, float cy, float z, float rx, float ry, float th, u32 c, u8 a) {
	const int n = 28;
	for (int i = 0; i < n; i++) {
		float a0 = i * 2 * PI_F / n, a1 = (i + 1) * 2 * PI_F / n;
		float c0 = cosf(a0), s0 = sinf(a0), c1 = cosf(a1), s1 = sinf(a1);
		quad(cx + c0 * rx, cy + s0 * ry, z, cx + c1 * rx, cy + s1 * ry, z, cx + c1 * (rx + th), cy + s1 * (ry + th), z, cx + c0 * (rx + th), cy + s0 * (ry + th), z, c, a);
	}
}
void rStream(int s) { curStream = s; }
void rFlat(float x, float y, float z, float w, float d, u32 c, u8 a) { quad(x, y, z, x + w, y, z, x + w, y + d, z, x, y + d, z, c, a); }

/* ---------------- shader ---------------- */
// Gli shader sono in GLSL semplice: vitaGL li traduce in CG e li compila sulla console (serve libshacccg.suprx),
// Mesa li compila sul PC. La luce è quella del port 3DS: ambiente + luci puntiformi con caduta 1 - d²/r².
static const char *VS_LIT =
	"attribute vec4 aPos;\n"
	"attribute vec4 aCol;\n"
	"uniform mat4 uProj;\n"
	"uniform vec4 uAmb;\n"
	"uniform vec4 uLpos[12];\n"
	"uniform vec4 uLcol[12];\n"
	"varying vec4 vCol;\n"
	"void main() {\n"
	"  gl_Position = uProj * vec4(aPos.xyz, 1.0);\n"
	"  vec3 p = vec3(aPos.x, aPos.y, aPos.z * 0.03125);\n"
	"  vec3 l = uAmb.xyz;\n"
	"  for (int i = 0; i < 12; i++) {\n"
	"    vec3 d = uLpos[i].xyz - p;\n"
	"    l += uLcol[i].xyz * max(0.0, 1.0 - dot(d, d) * uLpos[i].w);\n"
	"  }\n"
	"  l = min(l + vec3(aPos.w), vec3(1.0));\n"
	"  vCol = vec4(aCol.xyz * l, aCol.w);\n"
	"}\n";
static const char *VS_FLAT =
	"attribute vec4 aPos;\n"
	"attribute vec4 aCol;\n"
	"uniform mat4 uProj;\n"
	"uniform vec4 uAmb;\n"
	"varying vec4 vCol;\n"
	"void main() {\n"
	"  gl_Position = uProj * vec4(aPos.xyz, 1.0);\n"
	"  vec3 l = min(uAmb.xyz + vec3(aPos.w), vec3(1.0));\n"
	"  vCol = vec4(aCol.xyz * l, aCol.w);\n"
	"}\n";
static const char *FS_COL =
	"varying vec4 vCol;\n"
	"void main() { gl_FragColor = vCol; }\n";

void rInit(void) {
	static const char *AT[2] = {"aPos", "aCol"};
	progLit = glProgram(VS_LIT, FS_COL, AT, 2);
	progFlat = glProgram(VS_FLAT, FS_COL, AT, 2);
	uProjL = glGetUniformLocation(progLit, "uProj"); uAmbL = glGetUniformLocation(progLit, "uAmb");
	uLposL = glGetUniformLocation(progLit, "uLpos"); uLcolL = glGetUniformLocation(progLit, "uLcol");
	// alcuni driver vogliono il nome del primo elemento dell'array
	if (uLposL < 0) uLposL = glGetUniformLocation(progLit, "uLpos[0]");
	if (uLcolL < 0) uLcolL = glGetUniformLocation(progLit, "uLcol[0]");
	uProjF = glGetUniformLocation(progFlat, "uProj"); uAmbF = glGetUniformLocation(progFlat, "uAmb");
	SVB = malloc(sizeof(Vtx) * 4 * SQ_MAX);
	DVB = malloc(sizeof(Vtx) * 4 * DQ_MAX);
	TVB = malloc(sizeof(Vtx) * 4 * TQ_MAX);
	u16 *IDX = malloc(sizeof(u16) * 6 * QPB);
	for (int i = 0; i < QPB; i++) {
		IDX[i * 6] = i * 4; IDX[i * 6 + 1] = i * 4 + 1; IDX[i * 6 + 2] = i * 4 + 2;
		IDX[i * 6 + 3] = i * 4; IDX[i * 6 + 4] = i * 4 + 2; IDX[i * 6 + 5] = i * 4 + 3;
	}
	glGenBuffers(1, &ibo); glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, ibo);
	glBufferData(GL_ELEMENT_ARRAY_BUFFER, sizeof(u16) * 6 * QPB, IDX, GL_STATIC_DRAW);
	glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, 0);
	free(IDX);
	glGenBuffers(3, vboPos); glGenBuffers(3, vboCol);
}
void rExit(void) {
	glDeleteBuffers(3, vboPos); glDeleteBuffers(3, vboCol); glDeleteBuffers(1, &ibo);
	free(splitPos); free(splitCol);
	free(SVB); free(DVB); free(TVB);
}

// divide i vertici in posizioni e colori e li carica nei due buffer del flusso
static void upload(int st, const Vtx *v, int nq, GLenum usage) {
	int nv = nq * 4;
	if (nv > splitCap) {
		free(splitPos); free(splitCol);
		splitCap = nv;
		splitPos = malloc(sizeof(float) * 4 * nv); splitCol = malloc(sizeof(u32) * nv);
	}
	for (int i = 0; i < nv; i++) {
		splitPos[i * 4] = v[i].x; splitPos[i * 4 + 1] = v[i].y; splitPos[i * 4 + 2] = v[i].z; splitPos[i * 4 + 3] = v[i].e;
		memcpy(&splitCol[i], &v[i].r, 4);
	}
	glBindBuffer(GL_ARRAY_BUFFER, vboPos[st]);
	glBufferData(GL_ARRAY_BUFFER, sizeof(float) * 4 * nv, splitPos, usage);
	glBindBuffer(GL_ARRAY_BUFFER, vboCol[st]);
	glBufferData(GL_ARRAY_BUFFER, sizeof(u32) * nv, splitCol, usage);
	glBindBuffer(GL_ARRAY_BUFFER, 0);
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
	upload(ST_STATIC, SVB, SQ ? SQ : 1, GL_STATIC_DRAW);
	dMin = -400; dMax = 16 * 2 * N + 900;
}

static void drawQuads(int st, int q0, int nq) {
	if (nq <= 0) return;
	while (nq > 0) {
		int n = nq > QPB ? QPB : nq;
		glBindBuffer(GL_ARRAY_BUFFER, vboPos[st]);
		glVertexAttribPointer(0, 4, GL_FLOAT, GL_FALSE, 16, (void *)(intptr_t)(q0 * 4 * 16));
		glBindBuffer(GL_ARRAY_BUFFER, vboCol[st]);
		glVertexAttribPointer(1, 4, GL_UNSIGNED_BYTE, GL_TRUE, 4, (void *)(intptr_t)(q0 * 4 * 4));
		glDrawElements(GL_TRIANGLES, n * 6, GL_UNSIGNED_SHORT, 0);
		q0 += n; nq -= n;
	}
}

// coordinate virtuali dell'interfaccia (VW x VH): sono quelle in cui l'interfaccia scrive nomi, barre e numeri
void worldToScreen(float x, float y, float z, float *sx, float *sy) {
	float S = camS * 1.8f / UIS;   // lo zoom del mondo non dipende dalla grandezza dell'interfaccia
	*sx = VW / 2 + S * (32 * (x - y) - camX);
	*sy = VH / 2 + S * (16 * (x + y) - z - camY);
}

static void setProj(void) {
	float S = camS * 1.8f / UIS, D = dMax - dMin;
	// righe della matrice: x e y in caselle, z in pixel di altezza -> coordinate normalizzate dello schermo;
	// la profondità cresce verso lo spettatore (test GL_GREATER, come la GPU del 3DS)
	float R[4][4] = {
		{64 * S / VW, -64 * S / VW, 0, -2 * S * camX / VW},
		{-32 * S / VH, -32 * S / VH, 2 * S / VH, 2 * S * camY / VH},
		{32 / D, 32 / D, 1 / D, -2 * dMin / D - 1},
		{0, 0, 0, 1}};
	float M[16];
	for (int c = 0; c < 4; c++) for (int r = 0; r < 4; r++) M[c * 4 + r] = R[r][c];
	glUniformMatrix4fv(useFlat ? uProjF : uProjL, 1, GL_FALSE, M);
}

/* ---------------- luci: ambiente e 12 luci puntiformi ---------------- */
Light SLIGHT[256];
int NSLIGHT = 0;
void addSLight(float x, float y, float z, float r, u32 c, float a) {
	if (NSLIGHT >= 256) return;
	SLIGHT[NSLIGHT++] = (Light){x, y, z / 32, r, ((c >> 16) & 255) / 255.f * a, ((c >> 8) & 255) / 255.f * a, (c & 255) / 255.f * a};
}
static void setLights(float ar, float ag, float ab, bool dark) {
	if (useFlat) { glUniform4f(uAmbF, ar, ag, ab, 1); return; }
	glUniform4f(uAmbL, ar, ag, ab, 1);
	Light L[NL]; int nl = 0;
	if (dark) {
		// l'eroe porta sempre un po' di luce con sé
		L[nl++] = (Light){P.px, P.py, .6f, 4.2f, .55f, .5f, .4f};
		// le luci fisse più vicine al centro dell'inquadratura (lo schermo della Vita ne mostra di più)
		float cx = P.px, cy = P.py;
		float bd[NL - 1]; int bi[NL - 1]; int nb = 0;
		for (int i = 0; i < NSLIGHT; i++) {
			float d = fabsf(SLIGHT[i].x - cx) + fabsf(SLIGHT[i].y - cy);
			if (d > 22) continue;
			if (nb < NL - 1) { bd[nb] = d; bi[nb] = i; nb++; }
			else { int w = 0; for (int j = 1; j < NL - 1; j++) if (bd[j] > bd[w]) w = j; if (d < bd[w]) { bd[w] = d; bi[w] = i; } }
		}
		for (int j = 0; j < nb; j++) L[nl++] = SLIGHT[bi[j]];
	}
	float lp[NL * 4], lc[NL * 4];
	for (int i = 0; i < NL; i++) {
		if (i < nl) {
			lp[i * 4] = L[i].x; lp[i * 4 + 1] = L[i].y; lp[i * 4 + 2] = L[i].z; lp[i * 4 + 3] = 1.f / (L[i].r * L[i].r);
			lc[i * 4] = L[i].cr; lc[i * 4 + 1] = L[i].cg; lc[i * 4 + 2] = L[i].cb; lc[i * 4 + 3] = 0;
		} else {
			lp[i * 4] = -999; lp[i * 4 + 1] = -999; lp[i * 4 + 2] = 0; lp[i * 4 + 3] = 1;
			lc[i * 4] = lc[i * 4 + 1] = lc[i * 4 + 2] = lc[i * 4 + 3] = 0;
		}
	}
	glUniform4fv(uLposL, NL, lp);
	glUniform4fv(uLcolL, NL, lc);
}

/* ---------------- dinamica: acqua, fiamme, entità, effetti ---------------- */
// muri e arredi alti davanti all'eroe diventano trasparenti (come nell'originale)
static bool faded(int x, int y) {
	float d = (x + y) - (P.px + P.py), w = (x - y) - (P.px - P.py);
	return d > 0 && d < 5.5f && fabsf(w) < 3.5f;
}
static int heroQ0, heroQ1;
static int xrayQ0, xrayN;
static void buildDynamic(void) {
	DQ = 0; TQ = 0;
	curStream = 1;
	// entità
	for (int i = 0; i < NENT; i++) {
		Ent *e = &ents[i];
		if (!e->k) continue;
		float sx, sy; worldToScreen(e->px, e->py, 0, &sx, &sy);
		if (sx < -140 || sx > VW + 140 || sy < -80 || sy > VH + 140) continue;
		drawEntity(e);
	}
	// copie trasparenti dei muri davanti all'eroe
	{
		int x0 = (int)(P.px) - 5, x1 = (int)(P.px) + 7, y0 = (int)(P.py) - 5, y1 = (int)(P.py) + 7;
		for (int y = y0; y <= y1; y++) for (int x = x0; x <= x1; x++) {
			if (x < 0 || y < 0 || x >= N || y >= N || !OCC[y][x].n || !faded(x, y)) continue;
			int n = OCC[y][x].n; if (TQ + n >= TQ_MAX - 4000) continue;
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
	xDrawWorld();
	curStream = 2; devDrawWorld(); curStream = 1;
	// sagoma dell'eroe dietro i muri: copia trasparente disegnata solo dove è nascosto
	xrayQ0 = TQ; xrayN = heroQ1 - heroQ0;
	if (xrayN > 0 && TQ + xrayN < TQ_MAX) {
		memcpy(TVB + 4 * TQ, DVB + 4 * heroQ0, sizeof(Vtx) * 4 * xrayN);
		// spostata appena verso lo spettatore lungo la direzione di vista (1,1,32): stessa posizione sullo schermo,
		// ma più vicina, così la sagoma non copre l'eroe quando è già visibile
		for (int i = 0; i < xrayN * 4; i++) { Vtx *v = TVB + 4 * TQ + i; v->x += .03f; v->y += .03f; v->z += .96f; v->r = 0x9a; v->g = 0xdc; v->b = 0xff; v->a = 110; v->e = 1; }
	} else xrayN = 0;
	upload(ST_DYN, DVB, DQ ? DQ : 1, GL_STREAM_DRAW);
	upload(ST_TR, TVB, TQ + xrayN + 1, GL_STREAM_DRAW);
	curStream = 0;
}

static void drawWorld(float ar, float ag, float ab, bool dark) {
	useFlat = !dark;
	glUseProgram(useFlat ? progFlat : progLit);
	setProj();
	setLights(ar, ag, ab, dark);
	glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, ibo);
	glEnableVertexAttribArray(0); glEnableVertexAttribArray(1);
	glEnable(GL_BLEND); glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
	glDisable(GL_CULL_FACE);
	glEnable(GL_DEPTH_TEST); glDepthFunc(GL_GREATER); glDepthMask(GL_TRUE);
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
		if (ax > VW + 20 || bx < -20 || qy > VH + 10 || dy < -10) continue;
		// il blocco tocca la zona davanti all'eroe? allora i muri si disegnano a tratti, saltando quelli trasparenti
		float px = P.px, py = P.py;
		bool near = x1 + 1 > px - 6 && x0 - 1 < px + 8 && y1 + 1 > py - 6 && y0 - 1 < py + 8;
		if (!near) { drawQuads(ST_STATIC, c->q0, c->nq); continue; }
		drawQuads(ST_STATIC, c->q0, c->nA);
		int run0 = -1, runN = 0;
		for (int y = (int)y0; y < (int)y1 && y < N; y++) for (int x = (int)x0; x < (int)x1 && x < N; x++) {
			TRange r = OCC[y][x];
			if (!r.n) continue;
			if (faded(x, y)) { if (runN) drawQuads(ST_STATIC, run0, runN); run0 = -1; runN = 0; continue; }
			if (run0 < 0) { run0 = r.q0; runN = r.n; }
			else if (run0 + runN == r.q0) runN += r.n;
			else { drawQuads(ST_STATIC, run0, runN); run0 = r.q0; runN = r.n; }
		}
		if (runN) drawQuads(ST_STATIC, run0, runN);
	}
	if (heroQ0) drawQuads(ST_DYN, 0, heroQ0);
	// sagoma dell'eroe dove il mondo lo copre: disegnata prima dell'eroe, così conta solo la profondità del mondo
	if (xrayN) {
		glDepthFunc(GL_LESS); glDepthMask(GL_FALSE);
		drawQuads(ST_TR, xrayQ0, xrayN);
		glDepthFunc(GL_GREATER); glDepthMask(GL_TRUE);
	}
	if (DQ > heroQ0) drawQuads(ST_DYN, heroQ0, DQ - heroQ0);
	// trasparenze: ombre, cerchi d'avviso, muri davanti all'eroe (senza scrivere la profondità)
	glDepthMask(GL_FALSE);
	if (xrayQ0) drawQuads(ST_TR, 0, xrayQ0);
	glDepthMask(GL_TRUE);
	glDisable(GL_DEPTH_TEST);
	glDisableVertexAttribArray(0); glDisableVertexAttribArray(1);
	glBindBuffer(GL_ARRAY_BUFFER, 0); glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, 0);
}

static u32 bgColor(void) {
	u32 c = ZBG;
	float nk = NK;
	int r = (c >> 16) & 255, g = (c >> 8) & 255, b = c & 255;
	r = (int)(r * (1 - nk) + 10 * nk); g = (int)(g * (1 - nk) + 14 * nk); b = (int)(b * (1 - nk) + 40 * nk);
	return (r << 16) | (g << 8) | b;
}

extern bool TITLE_MODE;
int rQuads(void) { return SQ + DQ + TQ; }
void rFrame(void) {
	// luce ambiente: giorno, alba/tramonto, notte; sotterranei e interni più raccolti
	float ar = 1, ag = 1, ab = 1;
	bool dark = false;
	if (ZOUT) {
		float nk = NK, dk = DK;
		ar = 1 - nk * .7f; ag = 1 - nk * .66f; ab = 1 - nk * .42f;
		ar = ar * (1 - dk * .05f) + dk * .12f * (1 - nk); ag *= 1 - dk * .1f; ab *= 1 - dk * .22f;
		dark = nk > .05f;
	} else if (ZDG >= 0) { ar = .8f; ag = .78f; ab = .8f; dark = true; }
	else { ar = .95f; ag = .93f; ab = .9f; dark = true; }
	u32 bg = bgColor();
	glViewport(0, 0, SCR_W, SCR_H);
	glClearColor(((bg >> 16) & 255) / 255.f, ((bg >> 8) & 255) / 255.f, (bg & 255) / 255.f, 1);
	glClearDepth(0);
	glDepthMask(GL_TRUE);
	glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
	buildDynamic();
	drawWorld(ar, ag, ab, dark);
	g2Begin();
	uiDraw();
	g2Flush();
	plSwap();
}
