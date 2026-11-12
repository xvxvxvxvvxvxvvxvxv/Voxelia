// Voxelia PS Vita - disegno 2D dell'interfaccia: rettangoli, triangoli, immagini e testo.
// Il testo usa un atlante "signed distance field" (data/font.bin, tools/mkfont.py): resta nitido a ogni
// grandezza. Tutto lavora in coordinate virtuali (VW x VH = 960x544 / UIS) e finisce in pochi lotti di triangoli.
// Le funzioni di testo (txt, txtW, txtWrap, scorrimento dei testi lunghi) hanno gli stessi nomi e la stessa
// misura del port 3DS: a scala 1 una riga è alta 30 unità.
#include "voxelia.h"
#include "glinc.h"

float UIS = 1.8f, VW = SCR_W / 1.8f, VH = SCR_H / 1.8f;

/* ---------------- programmi ---------------- */
GLuint glProgram(const char *vs, const char *fs, const char **attrs, int nattr) {
	const char *pre =
#ifdef __vita__
		"";
#else
		"#version 120\n";
#endif
	GLuint p = glCreateProgram();
	const char *src[2][2] = {{pre, vs}, {pre, fs}};
	for (int i = 0; i < 2; i++) {
		GLuint s = glCreateShader(i ? GL_FRAGMENT_SHADER : GL_VERTEX_SHADER);
		glShaderSource(s, 2, src[i], NULL);
		glCompileShader(s);
		GLint ok = 0; glGetShaderiv(s, GL_COMPILE_STATUS, &ok);
		if (!ok) { char log[1024] = ""; glGetShaderInfoLog(s, sizeof log, NULL, log); printf("shader: %s\n", log); }
		glAttachShader(p, s);
	}
	for (int i = 0; i < nattr; i++) glBindAttribLocation(p, i, attrs[i]);
	glLinkProgram(p);
	GLint ok = 0; glGetProgramiv(p, GL_LINK_STATUS, &ok);
	if (!ok) { char log[1024] = ""; glGetProgramInfoLog(p, sizeof log, NULL, log); printf("programma: %s\n", log); }
	return p;
}

static const char *VS2 =
	"attribute vec2 aPos;\n"
	"attribute vec3 aUv;\n"
	"attribute vec4 aCol;\n"
	"uniform vec4 uView;\n"
	"varying vec3 vUv;\n"
	"varying vec4 vCol;\n"
	"void main() {\n"
	"  gl_Position = vec4(aPos.x * uView.x + uView.z, aPos.y * uView.y + uView.w, 0.0, 1.0);\n"
	"  vUv = aUv; vCol = aCol;\n"
	"}\n";
// testo e forme: il campo di distanza diventa copertura, con un bordo morbido largo un pixel dello schermo
static const char *FS_SDF =
	"uniform sampler2D uTex;\n"
	"varying vec3 vUv;\n"
	"varying vec4 vCol;\n"
	"void main() {\n"
	"  float d = texture2D(uTex, vUv.xy).w;\n"
	"  float a = clamp((d - 0.5) * vUv.z + 0.5, 0.0, 1.0);\n"
	"  gl_FragColor = vec4(vCol.xyz, vCol.w * a);\n"
	"}\n";
static const char *FS_IMG =
	"uniform sampler2D uTex;\n"
	"varying vec3 vUv;\n"
	"varying vec4 vCol;\n"
	"void main() { gl_FragColor = texture2D(uTex, vUv.xy) * vCol; }\n";

typedef struct { float x, y, u, v, s; u32 c; } V2;
#define V2MAX 24000
static V2 VB[V2MAX];
static int NV = 0;
static GLuint prSdf, prImg, vbo2;
static GLint uViewS, uViewI, uTexS, uTexI;
static int curTex = -1;   // -1 = atlante del carattere
static GLuint fontTex;

/* ---------------- textures ---------------- */
#define MAXTEX 16
static GLuint TEX[MAXTEX]; static int NTEX = 0;
int texCreate(int w, int h, const u32 *rgba, bool nearest) {
	if (NTEX >= MAXTEX) return 0;
	GLuint t; glGenTextures(1, &t); glBindTexture(GL_TEXTURE_2D, t);
	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, nearest ? GL_NEAREST : GL_LINEAR);
	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, nearest ? GL_NEAREST : GL_LINEAR);
	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
	glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA, w, h, 0, GL_RGBA, GL_UNSIGNED_BYTE, rgba);
	TEX[NTEX] = t;
	return NTEX++;
}
void texUpdate(int tex, int w, int h, const u32 *rgba) {
	if (tex < 0 || tex >= NTEX) return;
	g2Flush();
	glBindTexture(GL_TEXTURE_2D, TEX[tex]);
	glTexSubImage2D(GL_TEXTURE_2D, 0, 0, 0, w, h, GL_RGBA, GL_UNSIGNED_BYTE, rgba);
}

/* ---------------- carattere ---------------- */
typedef struct { u16 x, y, w, h; float adv, ox; } Glyph;
static Glyph *GL_; static int NG = 0;
static u16 *GIDX;          // codice -> glifo + 1 (0 = manca)
static int ATW = 1024, ATH = 1024;
static float FLH = 36, FTOP = 6;   // riga e margine della cella, in pixel dell'atlante
static float solidU, solidV;

static void fontLoad(void) {
	FILE *f = fopen(DATA_DIR "font.bin", "rb");
	if (!f) { printf("manca %sfont.bin\n", DATA_DIR); return; }
	char mg[4]; u16 hd[3]; float m[2];
	if (fread(mg, 4, 1, f) != 1 || memcmp(mg, "VXF1", 4)) { fclose(f); return; }
	if (fread(hd, 2, 3, f) != 3 || fread(m, 4, 2, f) != 2) { fclose(f); return; }
	ATW = hd[0]; ATH = hd[1]; NG = hd[2]; FLH = m[0]; FTOP = m[1];
	GL_ = calloc(NG, sizeof(Glyph)); GIDX = calloc(65536, sizeof(u16));
	for (int i = 0; i < NG; i++) {
		u32 cp; u16 r[4]; float a[2];
		if (fread(&cp, 4, 1, f) != 1 || fread(r, 2, 4, f) != 4 || fread(a, 4, 2, f) != 2) break;
		GL_[i] = (Glyph){r[0], r[1], r[2], r[3], a[0], a[1]};
		if (cp < 65536) GIDX[cp] = i + 1;
	}
	u8 *al = malloc(ATW * ATH);
	if (fread(al, 1, ATW * ATH, f) != (size_t)(ATW * ATH)) memset(al, 0, ATW * ATH);
	fclose(f);
	u32 *px = malloc(ATW * ATH * 4);
	for (int i = 0; i < ATW * ATH; i++) px[i] = 0x00ffffffu | ((u32)al[i] << 24);
	free(al);
	glGenTextures(1, &fontTex); glBindTexture(GL_TEXTURE_2D, fontTex);
	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
	glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA, ATW, ATH, 0, GL_RGBA, GL_UNSIGNED_BYTE, px);
	free(px);
	solidU = (ATW - 2) / (float)ATW; solidV = (ATH - 2) / (float)ATH;
}
static const Glyph *glyphOf(u32 cp) {
	if (!NG) return NULL;
	if (cp == 0xFF5C) cp = '|';
	if (cp == 0x23F1 || cp == 0x23F3) cp = 0x25F7;   // clessidre e cronometri: un quadrante
	int i = cp < 65536 ? GIDX[cp] : 0;
	if (!i) i = GIDX['?'];
	return i ? &GL_[i - 1] : NULL;
}

void g2Init(void) {
	static const char *AT[3] = {"aPos", "aUv", "aCol"};
	prSdf = glProgram(VS2, FS_SDF, AT, 3);
	prImg = glProgram(VS2, FS_IMG, AT, 3);
	uViewS = glGetUniformLocation(prSdf, "uView"); uTexS = glGetUniformLocation(prSdf, "uTex");
	uViewI = glGetUniformLocation(prImg, "uView"); uTexI = glGetUniformLocation(prImg, "uTex");
	glGenBuffers(1, &vbo2);
	fontLoad();
}

/* ---------------- lotti ---------------- */
void g2Flush(void) {
	if (!NV) return;
	bool img = curTex >= 0;
	GLuint pr = img ? prImg : prSdf;
	glUseProgram(pr);
	glUniform4f(img ? uViewI : uViewS, 2.f / VW, -2.f / VH, -1, 1);
	glUniform1i(img ? uTexI : uTexS, 0);
	glActiveTexture(GL_TEXTURE0);
	glBindTexture(GL_TEXTURE_2D, img ? TEX[curTex] : fontTex);
	glBindBuffer(GL_ARRAY_BUFFER, vbo2);
	glBufferData(GL_ARRAY_BUFFER, sizeof(V2) * NV, VB, GL_STREAM_DRAW);
	glEnableVertexAttribArray(0); glEnableVertexAttribArray(1); glEnableVertexAttribArray(2);
	glVertexAttribPointer(0, 2, GL_FLOAT, GL_FALSE, sizeof(V2), (void *)0);
	glVertexAttribPointer(1, 3, GL_FLOAT, GL_FALSE, sizeof(V2), (void *)8);
	glVertexAttribPointer(2, 4, GL_UNSIGNED_BYTE, GL_TRUE, sizeof(V2), (void *)20);
	glDrawArrays(GL_TRIANGLES, 0, NV);
	glDisableVertexAttribArray(0); glDisableVertexAttribArray(1); glDisableVertexAttribArray(2);
	glBindBuffer(GL_ARRAY_BUFFER, 0);
	NV = 0;
}
void g2Begin(void) {
	NV = 0; curTex = -1;
	glDisable(GL_DEPTH_TEST); glDisable(GL_CULL_FACE);
	glEnable(GL_BLEND); glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
}
static inline void useTex(int t) { if (t != curTex) { g2Flush(); curTex = t; } }
static inline V2 *vAlloc(int n) { if (NV + n > V2MAX) g2Flush(); V2 *v = VB + NV; NV += n; return v; }
static inline void vset(V2 *v, float x, float y, float u, float w, float s, u32 c) { v->x = x; v->y = y; v->u = u; v->v = w; v->s = s; v->c = c; }
// i colori arrivano come C2D_Color32 (rosso nel byte basso): è già l'ordine RGBA dei byte in memoria
static void solidTri(float ax, float ay, float bx, float by, float cx, float cy, u32 ca, u32 cb, u32 cc) {
	useTex(-1);
	V2 *v = vAlloc(3);
	vset(v, ax, ay, solidU, solidV, 1, ca); vset(v + 1, bx, by, solidU, solidV, 1, cb); vset(v + 2, cx, cy, solidU, solidV, 1, cc);
}
void tri(float ax, float ay, float bx, float by, float cx, float cy, u32 c) { solidTri(ax, ay, bx, by, cx, cy, c, c, c); }
void rectG(float x, float y, float w, float h, u32 top, u32 bot) {
	if (w <= 0 || h <= 0) return;
	solidTri(x, y, x + w, y, x + w, y + h, top, top, bot);
	solidTri(x, y, x + w, y + h, x, y + h, top, bot, bot);
}
void rect(float x, float y, float w, float h, u32 c) { rectG(x, y, w, h, c, c); }
void rectO(float x, float y, float w, float h, float t, u32 c) {
	rect(x, y, w, t, c); rect(x, y + h - t, w, t, c); rect(x, y + t, t, h - 2 * t, c); rect(x + w - t, y + t, t, h - 2 * t, c);
}
static void fan(float cx, float cy, float r, float a0, float a1, int n, u32 c) {
	for (int i = 0; i < n; i++) {
		float u = a0 + (a1 - a0) * i / n, w = a0 + (a1 - a0) * (i + 1) / n;
		tri(cx, cy, cx + cosf(u) * r, cy + sinf(u) * r, cx + cosf(w) * r, cy + sinf(w) * r, c);
	}
}
void circ(float x, float y, float r, u32 c) { fan(x, y, r, 0, 2 * PI_F, 24, c); }
void rectR(float x, float y, float w, float h, float r, u32 c) {
	if (r > w / 2) r = w / 2; if (r > h / 2) r = h / 2;
	if (r < .5f) { rect(x, y, w, h, c); return; }
	rect(x + r, y, w - 2 * r, h, c);
	rect(x, y + r, r, h - 2 * r, c); rect(x + w - r, y + r, r, h - 2 * r, c);
	fan(x + r, y + r, r, PI_F, 1.5f * PI_F, 5, c); fan(x + w - r, y + r, r, 1.5f * PI_F, 2 * PI_F, 5, c);
	fan(x + w - r, y + h - r, r, 0, .5f * PI_F, 5, c); fan(x + r, y + h - r, r, .5f * PI_F, PI_F, 5, c);
}
void imageDraw(int tex, float x, float y, float w, float h, float u0, float v0, float u1, float v1, u32 tint) {
	useTex(tex);
	V2 *v = vAlloc(6);
	vset(v, x, y, u0, v0, 1, tint); vset(v + 1, x + w, y, u1, v0, 1, tint); vset(v + 2, x + w, y + h, u1, v1, 1, tint);
	vset(v + 3, x, y, u0, v0, 1, tint); vset(v + 4, x + w, y + h, u1, v1, 1, tint); vset(v + 5, x, y + h, u0, v1, 1, tint);
}
u32 RGBA(u32 rgb, u8 a) { return C2D_Color32((rgb >> 16) & 255, (rgb >> 8) & 255, rgb & 255, a); }

/* ---------------- testo ---------------- */
static const char *u8next(const char *s, u32 *cp) {
	u8 c = (u8)*s;
	if (c < 0x80) { *cp = c; return s + 1; }
	if ((c & 0xE0) == 0xC0 && s[1]) { *cp = ((c & 0x1F) << 6) | (s[1] & 0x3F); return s + 2; }
	if ((c & 0xF0) == 0xE0 && s[1] && s[2]) { *cp = ((c & 0x0F) << 12) | ((s[1] & 0x3F) << 6) | (s[2] & 0x3F); return s + 3; }
	if ((c & 0xF8) == 0xF0 && s[1] && s[2] && s[3]) { *cp = ((c & 0x07) << 18) | ((s[1] & 0x3F) << 12) | ((s[2] & 0x3F) << 6) | (s[3] & 0x3F); return s + 4; }
	*cp = '?'; return s + 1;
}
static inline float kOf(float sc) { return sc * 30.f / FLH; }   // unità virtuali per pixel dell'atlante
static float cwOf(u32 cp) { if (cp == 0xFE0F || cp == 0x200D) return 0; const Glyph *g = glyphOf(cp); return g ? g->adv : 10; }
float txtW(const char *s, float sc) {
	float w = 0; u32 cp;
	while (*s) { s = u8next(s, &cp); if (cp == '\n') break; w += cwOf(cp); }
	return w * kOf(sc);
}
float lineH(float sc) { return 30 * sc; }
void txtO(float x, float y, float sc, u32 col, const char *s, int align) {
	if (!NG) return;
	float k = kOf(sc);
	if (align == 1) x -= txtW(s, sc) / 2; else if (align == 2) x -= txtW(s, sc);
	// la nitidezza del bordo: 12 livelli del campo per pixel dell'atlante (vedi mkfont.py), per i pixel veri
	float sharp = 12 * k * UIS; if (sharp < 1) sharp = 1;
	useTex(-1);
	u32 cp; float cx = x;
	while (*s) {
		s = u8next(s, &cp);
		if (cp == '\n') break;
		if (cp == 0xFE0F || cp == 0x200D) continue;
		const Glyph *g = glyphOf(cp); if (!g) continue;
		if (cp != ' ') {
			float gx = cx - g->ox * k, gy = y - FTOP * k + 1.5f * sc, gw = g->w * k, gh = g->h * k;
			float u0 = g->x / (float)ATW, v0 = g->y / (float)ATH, u1 = (g->x + g->w) / (float)ATW, v1 = (g->y + g->h) / (float)ATH;
			V2 *v = vAlloc(6);
			vset(v, gx, gy, u0, v0, sharp, col); vset(v + 1, gx + gw, gy, u1, v0, sharp, col); vset(v + 2, gx + gw, gy + gh, u1, v1, sharp, col);
			vset(v + 3, gx, gy, u0, v0, sharp, col); vset(v + 4, gx + gw, gy + gh, u1, v1, sharp, col); vset(v + 5, gx, gy + gh, u0, v1, sharp, col);
		}
		cx += g->adv * k;
	}
}
void txt(float x, float y, float sc, u32 col, const char *s) { txtO(x, y, sc, col, s, 0); }
void txtC(float x, float y, float sc, u32 col, const char *s) { txtO(x, y, sc, col, s, 1); }
void txtR(float x, float y, float sc, u32 col, const char *s) { txtO(x, y, sc, col, s, 2); }

// testo più largo di maxW: invece di tagliarlo, le lettere scorrono in avanti. Ferma all'inizio per MQ_A secondi,
// poi un carattere ogni MQ_S secondi fino a mostrare la fine, ferma MQ_B secondi e ricomincia.
#define MQ_A 1.2f
#define MQ_S .11f
#define MQ_B 1.6f
static int mqSteps(const char *s, float sc, float maxW) {
	int k = 0; const char *p = s; u32 cp;
	while (*p && txtW(p, sc) > maxW) { p = u8next(p, &cp); k++; }
	return k;
}
float marqueeTime(const char *s, float sc, float maxW) {
	int k = mqSteps(s, sc, maxW);
	return k ? MQ_A + k * MQ_S + MQ_B : 0;
}
const char *marqueeStr(const char *s, float sc, float maxW, float t, char *buf, int n) {
	if (txtW(s, sc) <= maxW) { snprintf(buf, n, "%s", s); return buf; }
	int kmax = mqSteps(s, sc, maxW);
	float u = fmodf(fmaxf(0, t), MQ_A + kmax * MQ_S + MQ_B);
	int k = u < MQ_A ? 0 : u >= MQ_A + kmax * MQ_S ? kmax : (int)((u - MQ_A) / MQ_S);
	const char *q = s; u32 cp;
	for (int i = 0; i < k && *q; i++) q = u8next(q, &cp);
	snprintf(buf, n, "%s", q);
	int l = strlen(buf);
	while (l > 1 && txtW(buf, sc) > maxW) { l--; while (l > 0 && (buf[l] & 0xC0) == 0x80) l--; buf[l] = 0; }
	return buf;
}
void txtMarquee(float x, float y, float sc, u32 col, const char *s, float maxW, float t) {
	char b[256]; txt(x, y, sc, col, marqueeStr(s, sc, maxW, t, b, sizeof b));
}
// testo a capo sulle parole; restituisce l'altezza occupata. y<-1000 misura soltanto. Con maxH si ferma
// all'ultima riga che ci sta e la chiude con «…».
static float wrapMax = 0;
float txtWrapMax(float x, float y, float w, float sc, u32 col, const char *s, float maxH) {
	wrapMax = maxH; float h = txtWrap(x, y, w, sc, col, s); wrapMax = 0; return h;
}
float txtWrap(float x, float y, float w, float sc, u32 col, const char *s) {
	char line[256];
	float lh = 30 * sc, yy = y, k = kOf(sc);
	const char *p = s;
	while (*p) {
		const char *ls = p, *lastSp = NULL, *q = p; float lw = 0; u32 cp;
		while (*q) {
			const char *nq = u8next(q, &cp);
			if (cp == '\n') break;
			float cw = cwOf(cp) * k;
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
