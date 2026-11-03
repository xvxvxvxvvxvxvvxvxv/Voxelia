// Voxelia DS - grafica 2D: due bitmap a 8 bit (sopra il 3D nello schermo superiore, e lo schermo touch).
// Le funzioni usano le coordinate del port 3DS (400x240 sopra, 320x240 sotto) e le riportano ai 256x192 del DS,
// così l'interfaccia del 3DS (HUD, finestre, menu) si usa quasi senza modifiche.
// La tavolozza (256 colori, comune ai due schermi) si riempie con i colori che servono: i colori dell'interfaccia
// restano esatti; quando è piena si usa il più vicino. La trasparenza parziale diventa un retino.
#include "voxelia.h"
#include "font_data.h"

static u8 BUF[2][256 * 192] __attribute__((aligned(32)));
static bool dirty[2];
static int tgt = 0;                  // 1 = sopra
static float SX = .8f, SY = .8f;     // da coordinate 3DS a pixel DS
static u8 LUT[32768];                // colore a 15 bit -> indice (0 = non ancora assegnato)
static u16 PAL[256];
static int NPAL = 1;

static inline u16 to15(u32 rgb) { return ((rgb >> 3) & 31) | (((rgb >> 11) & 31) << 5) | (((rgb >> 19) & 31) << 10); }
static u8 idx15(u16 c) {
	c &= 0x7fff;
	u8 i = LUT[c];
	if (i) return i;
	if (NPAL < 256) {
		i = NPAL++; PAL[i] = c; BG_PALETTE[i] = c; BG_PALETTE_SUB[i] = c;
	} else {
		int r = c & 31, g = (c >> 5) & 31, b = (c >> 10) & 31, bd = 1 << 30;
		for (int k = 1; k < 256; k++) { int dr = r - (PAL[k] & 31), dg = g - ((PAL[k] >> 5) & 31), db = b - ((PAL[k] >> 10) & 31), d = dr * dr * 3 + dg * dg * 4 + db * db * 2; if (d < bd) { bd = d; i = k; } }
	}
	LUT[c] = i;
	return i;
}
// colori in formato C2D_Color32 (r | g<<8 | b<<16 | a<<24)
static inline u8 cidx(u32 c) { return idx15((c & 0xf8) >> 3 | (((c >> 8) & 0xf8) << 2) | (((c >> 16) & 0xf8) << 7)); }
u8 gfxIndex(u32 rgb) { return idx15(to15(rgb)); }
u32 RGBA(u32 rgb, u8 a) { return C2D_Color32((rgb >> 16) & 255, (rgb >> 8) & 255, rgb & 255, a); }

void gfxInit(void) {
	memset(LUT, 0, sizeof LUT);
	NPAL = 1; BG_PALETTE[0] = 0; BG_PALETTE_SUB[0] = 0;
	memset(BUF, 0, sizeof BUF);
}
void gfxTarget(int top) { tgt = top ? 1 : 0; SX = top ? .64f : .8f; SY = .8f; }
void gfxClear(int top) { memset(BUF[top ? 1 : 0], 0, 256 * 192); dirty[top ? 1 : 0] = true; }
void gfxPresent(void) {
	DC_FlushRange(BUF, sizeof BUF);
	if (dirty[1]) dmaCopyWords(3, BUF[1], BG_GFX, 256 * 192);
	if (dirty[0]) dmaCopyWords(3, BUF[0], BG_GFX_SUB, 256 * 192);
	dirty[0] = dirty[1] = false;
}

/* ---------------- primitive ---------------- */
static void fillPx(int x0, int y0, int x1, int y1, u8 ci, u8 a) {
	if (a < 64) return;   // quasi trasparente: niente (il retino coprirebbe il 3D)
	if (x0 < 0) x0 = 0; if (y0 < 0) y0 = 0; if (x1 > 256) x1 = 256; if (y1 > 192) y1 = 192;
	if (x1 <= x0 || y1 <= y0) return;
	u8 *B = BUF[tgt]; dirty[tgt] = true;
	if (a >= 200) { for (int y = y0; y < y1; y++) memset(B + y * 256 + x0, ci, x1 - x0); return; }
	// trasparenza: retino (a scacchi, o un pixel su quattro se molto trasparente)
	bool light = a < 110;
	for (int y = y0; y < y1; y++) {
		u8 *r = B + y * 256;
		for (int x = x0; x < x1; x++) {
			if (light ? ((x & 1) || (y & 1)) : ((x ^ y) & 1)) continue;
			r[x] = ci;
		}
	}
}
void rect(float x, float y, float w, float h, u32 c) {
	u8 a = c >> 24;
	int x0 = (int)floorf(x * SX), y0 = (int)floorf(y * SY), x1 = (int)ceilf((x + w) * SX), y1 = (int)ceilf((y + h) * SY);
	if (w > 0 && x1 <= x0) x1 = x0 + 1;
	if (h > 0 && y1 <= y0) y1 = y0 + 1;
	fillPx(x0, y0, x1, y1, cidx(c), a);
}
void gfxBlitPal(float x, float y, int w, int h, const u8 *pix, int stride) {
	int X = (int)(x * SX), Y = (int)(y * SY);
	u8 *B = BUF[tgt]; dirty[tgt] = true;
	for (int j = 0; j < h; j++) {
		int yy = Y + j; if (yy < 0 || yy >= 192) continue;
		for (int i = 0; i < w; i++) { int xx = X + i; if (xx < 0 || xx >= 256) continue; u8 v = pix[j * stride + i]; if (v) B[yy * 256 + xx] = v; }
	}
}

/* ---------------- testo ---------------- */
static const char *u8next(const char *s, u32 *cp) {
	const u8 *p = (const u8 *)s;
	if (p[0] < 0x80) { *cp = p[0]; return s + 1; }
	if ((p[0] & 0xE0) == 0xC0 && p[1]) { *cp = ((p[0] & 31) << 6) | (p[1] & 63); return s + 2; }
	if ((p[0] & 0xF0) == 0xE0 && p[1] && p[2]) { *cp = ((p[0] & 15) << 12) | ((p[1] & 63) << 6) | (p[2] & 63); return s + 3; }
	if ((p[0] & 0xF8) == 0xF0 && p[1] && p[2] && p[3]) { *cp = '?'; return s + 4; }
	*cp = '?'; return s + 1;
}
static short GI[256];
static bool giOk = false;
static int glyph(u32 cp) {
	if (!giOk) { for (int i = 0; i < 256; i++) GI[i] = -1; for (int i = 0; i < FONT_N; i++) if (FONT_CP[i] < 256) GI[FONT_CP[i]] = i; giOk = true; }
	if (cp < 256) return GI[cp] >= 0 ? GI[cp] : GI['?'];
	for (int i = 0; i < FONT_N; i++) if (FONT_CP[i] == cp) return i;
	if (cp == 0x2190 || cp == 0x2192) return GI['-'];
	return GI['?'];
}
typedef struct { const u8 *W; const u32 *B; int H, lh, top; } Font;
static const Font FO[3] = {{F0_W, F0_B, F0_H, 11, 1}, {F1_W, F1_B, F1_H, 13, 1}, {F2_W, F2_B, F2_H, 22, 1}};
static const Font *fontFor(float sc) { return sc < .5f ? &FO[0] : sc < 1.0f ? &FO[1] : &FO[2]; }
static int pxW(const char *s, const Font *f) {
	int w = 0; u32 cp;
	while (*s) { s = u8next(s, &cp); if (cp == '\n') break; w += f->W[glyph(cp)]; }
	return w;
}
float txtW(const char *s, float sc) { return pxW(s, fontFor(sc)) / SX; }
float lineH(float sc) { return fontFor(sc)->lh / SY; }
static void drawStr(int X, int Y, const Font *f, u8 ci, u8 a, const char *s) {
	if (a < 60) return;
	u8 *B = BUF[tgt]; dirty[tgt] = true;
	u32 cp;
	while (*s) {
		s = u8next(s, &cp); if (cp == '\n') break;
		int g = glyph(cp), w = f->W[g];
		if (X + w > 0 && X < 256) {
			const u32 *rows = f->B + g * f->H;
			for (int r = f->top; r < f->H; r++) {
				int yy = Y + r - f->top; if (yy < 0 || yy >= 192) continue;
				u32 bits = rows[r]; if (!bits) continue;
				u8 *row = B + yy * 256;
				for (int c = 0; bits && c < 32; c++, bits >>= 1) {
					if (!(bits & 1)) continue;
					int xx = X + c; if (xx < 0 || xx >= 256) continue;
					if (a < 160 && ((xx ^ yy) & 1)) continue;
					row[xx] = ci;
				}
			}
		}
		X += w;
	}
}
void txtO(float x, float y, float sc, u32 col, const char *s, int align) {
	const Font *f = fontFor(sc);
	int w = pxW(s, f), X = (int)lroundf(x * SX), Y = (int)lroundf(y * SY);
	if (align == 1) X -= w / 2; else if (align == 2) X -= w;
	drawStr(X, Y, f, cidx(col), col >> 24, s);
}
void txt(float x, float y, float sc, u32 col, const char *s) { txtO(x, y, sc, col, s, 0); }
void txtC(float x, float y, float sc, u32 col, const char *s) { txtO(x, y, sc, col, s, 1); }
void txtR(float x, float y, float sc, u32 col, const char *s) { txtO(x, y, sc, col, s, 2); }

// testo a capo sulle parole; restituisce l'altezza occupata (coordinate 3DS). y < -1000 misura soltanto.
// Con maxH si ferma all'ultima riga che ci sta e la chiude con «…».
static float wrapMax = 0;
float txtWrap(float x, float y, float w, float sc, u32 col, const char *s) {
	const Font *f = fontFor(sc);
	int W = (int)(w * SX), lh = f->lh;
	float lh3 = lh / SY, yy = y;
	const char *p = s;
	char line[256];
	while (*p) {
		const char *ls = p, *lastSp = NULL, *q = p; int lw = 0; u32 cp;
		while (*q) {
			const char *nq = u8next(q, &cp);
			if (cp == '\n') break;
			int cw = f->W[glyph(cp)];
			if (lw + cw > W && q > ls) break;
			if (cp == ' ') lastSp = q;
			lw += cw; q = nq;
		}
		const char *end = q;
		if (*q && *q != '\n' && lastSp && lastSp > ls) end = lastSp;
		int n = end - ls; if (n > 255) n = 255;
		memcpy(line, ls, n); line[n] = 0;
		bool last = wrapMax > 0 && yy + 2 * lh3 - y > wrapMax && *end;
		if (last) { while (n > 0 && pxW(line, f) + f->W[glyph(0x2026)] > W) { n--; while (n > 0 && ((u8)line[n] & 0xC0) == 0x80) n--; line[n] = 0; } strcat(line, "\xE2\x80\xA6"); }
		if (y > -1000) drawStr((int)lroundf(x * SX), (int)lroundf(yy * SY), f, cidx(col), col >> 24, line);
		yy += lh3;
		if (last) break;
		p = end;
		if (*p == '\n' || *p == ' ') p++;
	}
	return yy - y;
}
float txtWrapMax(float x, float y, float w, float sc, u32 col, const char *s, float maxH) {
	wrapMax = maxH; float h = txtWrap(x, y, w, sc, col, s); wrapMax = 0; return h;
}

/* ---------------- testo che scorre (come sul 3DS) ---------------- */
#define MQ_A 1.2f
#define MQ_S .11f
#define MQ_B 1.6f
// quanti caratteri togliere davanti perché il resto entri in maxW (in un solo passaggio)
static int mqSteps(const char *s, float sc, float maxW) {
	const Font *f = fontFor(sc); int W = pxW(s, f), lim = (int)(maxW * SX), k = 0; const char *p = s; u32 cp;
	while (*p && W > lim) { const char *q = u8next(p, &cp); W -= f->W[glyph(cp)]; p = q; k++; }
	return k;
}
// byte del prefisso più lungo che entra in lim pixel
static int fitBytes(const char *s, const Font *f, int lim) {
	int w = 0; const char *p = s; u32 cp;
	while (*p) { const char *q = u8next(p, &cp); if (cp == '\n') break; w += f->W[glyph(cp)]; if (w > lim) break; p = q; }
	return p - s;
}
float marqueeTime(const char *s, float sc, float maxW) {
	int k = mqSteps(s, sc, maxW);
	return k ? MQ_A + k * MQ_S + MQ_B : 0;
}
const char *marqueeStr(const char *s, float sc, float maxW, float t, char *buf, int n) {
	const Font *f = fontFor(sc); int lim = (int)(maxW * SX);
	if (pxW(s, f) <= lim) { snprintf(buf, n, "%s", s); return buf; }
	int kmax = mqSteps(s, sc, maxW);
	float u = fmodf(fmaxf(0, t), MQ_A + kmax * MQ_S + MQ_B);
	int k = u < MQ_A ? 0 : u >= MQ_A + kmax * MQ_S ? kmax : (int)((u - MQ_A) / MQ_S);
	const char *q = s; u32 cp;
	for (int i = 0; i < k && *q; i++) q = u8next(q, &cp);
	int nb = fitBytes(q, f, lim); if (nb > n - 1) nb = n - 1;
	memcpy(buf, q, nb); buf[nb] = 0;
	return buf;
}
void txtMarquee(float x, float y, float sc, u32 col, const char *s, float maxW, float t) {
	char b[256]; txt(x, y, sc, col, marqueeStr(s, sc, maxW, t, b, sizeof b));
}
