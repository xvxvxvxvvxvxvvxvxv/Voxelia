// Voxelia PS4 - rasterizzatore software a più thread (vedi sw.h).
//
// Fase A (in parallelo): i vertici del mondo passano per la stessa matrice e le stesse luci degli shader del port
//   Vita (ambiente + luci puntiformi con caduta 1 - d²/r², luce propria dei materiali che brillano); per ogni
//   quadrilatero si annotano le righe dello schermo che tocca.
// Fase B (in parallelo): lo schermo è diviso in fasce di righe; ogni thread prende la fascia libera seguente e
//   ci esegue tutti i comandi in ordine (sfondo, mondo, interfaccia). Ogni pixel ha un solo proprietario, quindi
//   niente blocchi, e l'ordine dei comandi è quello del gioco: trasparenze e interfaccia vengono giuste.
// I triangoli si riempiono riga per riga con la regola del centro del pixel: i bordi in comune tra due
// triangoli si calcolano sempre con gli stessi numeri, così tra i voxel non restano fessure né pixel doppi.
#include "sw.h"
#include <math.h>
#include <stdlib.h>
#include <string.h>
#include <stdio.h>

typedef struct { float x, y, z; u32 c; } TV;                 // vertice trasformato: pixel, profondità, colore RGBA
typedef struct { s16 y0, y1; } QY;                            // righe toccate dal quadrilatero [y0, y1)
typedef struct { float x, y, u, v, s; u32 c; } S2;            // vertice dell'interfaccia in pixel
typedef struct { bool lit; float amb[3]; float lp[12 * 4], lc[12 * 4]; int nl; } LightSet;
enum { C_CLEAR, C_WORLD, C_2D };
typedef struct {
	u8 type, dfunc, dwrite;
	int light, proj;
	const Vtx *src; int base, nq;      // mondo: vertici d'origine, primo quadrilatero nel buffer trasformato, quanti
	int t0, nv, tex; float su, sv;     // interfaccia: vertici, texture, punto "pieno" dell'atlante
	u32 clear;
} Cmd;

static int W, H, T;
static u32 *COL; static float *DEP;
static Cmd *CMD; static int NCMD, CAPCMD;
static TV *TVB; static QY *QYB; static int NQT;
static S2 *S2B; static int NS2, CAPS2;
typedef struct { s16 y0, y1; u8 solid; } T2;                  // righe toccate dal triangolo, e se è "pieno"
static T2 *T2B; static int CAPT2;
static LightSet *LS; static int NLS, CAPLS;
typedef struct { float m[12]; } Proj;
static Proj *PJ; static int NPJ, CAPPJ;
static int curLight = -1, curProj = -1; static u8 curDF = SW_GREATER, curDW = 1;
static float k2D = 1;
static u32 *OUT; static int OUTP;   // buffer dello schermo dove ogni fascia finita si copia (o NULL)
int swStatQuads = 0, swStatTris2D = 0; float swStatMs = 0;

typedef struct { int w, h; u32 *px; bool nearest; } Tex;
#define MAXTEX 24
static Tex TX[MAXTEX]; static int NTX = 0;
static u8 *FA; static int FAW = 1, FAH = 1;

#define GROW(p, cap, n, T_) do { if ((n) > (cap)) { int nc = (cap) ? (cap) : 256; while (nc < (n)) nc *= 2; p = (T_ *)realloc(p, sizeof(T_) * nc); cap = nc; } } while (0)

static Cmd *newCmd(u8 type) {
	GROW(CMD, CAPCMD, NCMD + 1, Cmd);
	Cmd *c = &CMD[NCMD++]; memset(c, 0, sizeof *c); c->type = type; return c;
}

int swW(void) { return W; }
int swH(void) { return H; }
int swThreads(void) { return T; }
u32 *swPixels(void) { return COL; }

void swClear(u32 rgb) { Cmd *c = newCmd(C_CLEAR); c->clear = rgb & 0xffffff; }
void swProj(const float R[4][4]) {
	GROW(PJ, CAPPJ, NPJ + 1, Proj);
	for (int r = 0; r < 3; r++) for (int k = 0; k < 4; k++) PJ[NPJ].m[r * 4 + k] = R[r][k];
	curProj = NPJ++;
}
void swLights(bool lit, float ar, float ag, float ab, const float *lp, const float *lc, int nl) {
	GROW(LS, CAPLS, NLS + 1, LightSet);
	LightSet *L = &LS[NLS]; memset(L, 0, sizeof *L);
	L->lit = lit; L->amb[0] = ar; L->amb[1] = ag; L->amb[2] = ab;
	if (lit && lp && lc) {
		for (int i = 0; i < nl && i < 12; i++) {
			if (lp[i * 4] < -900 || (lc[i * 4] <= 0 && lc[i * 4 + 1] <= 0 && lc[i * 4 + 2] <= 0)) continue;
			memcpy(L->lp + L->nl * 4, lp + i * 4, 16); memcpy(L->lc + L->nl * 4, lc + i * 4, 16); L->nl++;
		}
	}
	curLight = NLS++;
}
void swDepth(int func, bool write) { curDF = (u8)func; curDW = write; }
void swQuads(const Vtx *v, int nq) {
	if (nq <= 0 || curProj < 0 || curLight < 0) return;
	// quadrilateri consecutivi dallo stesso buffer con lo stesso stato: un solo comando
	if (NCMD && CMD[NCMD - 1].type == C_WORLD) {
		Cmd *p = &CMD[NCMD - 1];
		if (p->src + 4 * p->nq == v && p->light == curLight && p->proj == curProj && p->dfunc == curDF && p->dwrite == curDW) {
			p->nq += nq; NQT += nq; return;
		}
	}
	Cmd *c = newCmd(C_WORLD);
	c->dfunc = curDF; c->dwrite = curDW; c->light = curLight; c->proj = curProj;
	c->src = v; c->base = NQT; c->nq = nq;
	NQT += nq;
}
void sw2DScale(float k) { k2D = k; }
void swTris2D(const V2 *v, int nv, int tex, float su, float sv) {
	nv -= nv % 3;
	if (nv <= 0) return;
	GROW(S2B, CAPS2, NS2 + nv, S2);
	S2 *o = S2B + NS2;
	for (int i = 0; i < nv; i++) { o[i].x = v[i].x * k2D; o[i].y = v[i].y * k2D; o[i].u = v[i].u; o[i].v = v[i].v; o[i].s = v[i].s; o[i].c = v[i].c; }
	GROW(T2B, CAPT2, (NS2 + nv) / 3, T2);
	for (int i = 0; i < nv; i += 3) {
		const S2 *a = o + i, *b = o + i + 1, *d = o + i + 2;
		float ymin = fminf(a->y, fminf(b->y, d->y)), ymax = fmaxf(a->y, fmaxf(b->y, d->y));
		float xmin = fminf(a->x, fminf(b->x, d->x)), xmax = fmaxf(a->x, fmaxf(b->x, d->x));
		T2 *r = T2B + (NS2 + i) / 3;
		int y0 = (int)ceilf(ymin - .5f), y1 = (int)ceilf(ymax - .5f);
		if (y0 < 0) y0 = 0; if (y1 > H) y1 = H;
		if (xmax < 0 || xmin > W || y0 >= y1) y0 = y1 = 0;
		r->y0 = (s16)y0; r->y1 = (s16)y1;
		r->solid = a->u == su && a->v == sv && b->u == su && b->v == sv && d->u == su && d->v == sv;
	}
	Cmd *c = newCmd(C_2D);
	c->t0 = NS2; c->nv = nv; c->tex = tex; c->su = su; c->sv = sv;
	NS2 += nv;
}

int swTexCreate(int w, int h, const u32 *rgba, bool nearest) {
	if (NTX >= MAXTEX) return -1;
	Tex *t = &TX[NTX]; t->w = w; t->h = h; t->nearest = nearest;
	t->px = malloc(sizeof(u32) * w * h);
	if (rgba) memcpy(t->px, rgba, sizeof(u32) * w * h); else memset(t->px, 0, sizeof(u32) * w * h);
	return NTX++;
}
void swTexUpdate(int i, int w, int h, const u32 *rgba) {
	if (i < 0 || i >= NTX) return;
	Tex *t = &TX[i];
	if (w > t->w || h > t->h) return;
	for (int y = 0; y < h; y++) memcpy(t->px + y * t->w, rgba + y * w, sizeof(u32) * w);
}
void swFontAtlas(int w, int h, const u8 *alpha) {
	free(FA); FA = malloc(w * h); memcpy(FA, alpha, w * h); FAW = w; FAH = h;
}

/* ---------------- fase A: vertici ---------------- */
static inline u8 sat8(float f) { return f >= 255.f ? 255 : f <= 0 ? 0 : (u8)(f + .5f); }
static void transformRange(int c0, int g0, int g1) {
	// quadrilateri globali [g0, g1), a partire dal comando c0
	for (int ci = c0; ci < NCMD && g0 < g1; ci++) {
		Cmd *c = &CMD[ci];
		if (c->type != C_WORLD) continue;
		int a = c->base, b = c->base + c->nq;
		if (b <= g0) continue;
		if (a >= g1) break;
		int s = g0 > a ? g0 : a, e = g1 < b ? g1 : b;
		const float *M = PJ[c->proj].m; const LightSet *L = &LS[c->light];
		const float hw = W * .5f, hh = H * .5f;
		for (int q = s; q < e; q++) {
			const Vtx *v = c->src + (q - a) * 4;
			TV *o = TVB + q * 4;
			float y0 = 1e9f, y1 = -1e9f, x0 = 1e9f, x1 = -1e9f;
			for (int k = 0; k < 4; k++) {
				const Vtx *p = v + k;
				float nx = M[0] * p->x + M[1] * p->y + M[2] * p->z + M[3];
				float ny = M[4] * p->x + M[5] * p->y + M[6] * p->z + M[7];
				float nz = M[8] * p->x + M[9] * p->y + M[10] * p->z + M[11];
				float sx = (nx + 1) * hw, sy = (1 - ny) * hh;
				o[k].x = sx; o[k].y = sy; o[k].z = nz * .5f + .5f;
				if (sy < y0) y0 = sy; if (sy > y1) y1 = sy; if (sx < x0) x0 = sx; if (sx > x1) x1 = sx;
				float lr = L->amb[0], lg = L->amb[1], lb = L->amb[2];
				if (L->lit) {
					float pz = p->z * .03125f;
					for (int i = 0; i < L->nl; i++) {
						const float *lp = L->lp + i * 4;
						float dx = lp[0] - p->x, dy = lp[1] - p->y, dz = lp[2] - pz;
						float f = 1 - (dx * dx + dy * dy + dz * dz) * lp[3];
						if (f > 0) { lr += L->lc[i * 4] * f; lg += L->lc[i * 4 + 1] * f; lb += L->lc[i * 4 + 2] * f; }
					}
				}
				lr += p->e; lg += p->e; lb += p->e;
				if (lr > 1) lr = 1; if (lg > 1) lg = 1; if (lb > 1) lb = 1;
				o[k].c = (u32)sat8(p->r * lr) | ((u32)sat8(p->g * lg) << 8) | ((u32)sat8(p->b * lb) << 16) | ((u32)p->a << 24);
			}
			QY *r = QYB + q;
			if (x1 < 0 || x0 > W || y1 < 0 || y0 > H) { r->y0 = r->y1 = 0; continue; }
			int a0 = (int)ceilf(y0 - .5f), a1 = (int)ceilf(y1 - .5f);
			if (a0 < 0) a0 = 0; if (a1 > H) a1 = H;
			r->y0 = (s16)a0; r->y1 = (s16)a1;
		}
		g0 = e;
	}
}

/* ---------------- fase B: triangoli ---------------- */
// bordo canonico: estremi ordinati, così due triangoli che lo condividono calcolano la stessa x
typedef struct { float px, py, sl; } Edge;
static inline void edgeOf(Edge *e, float ax, float ay, float bx, float by) {
	if (ay > by || (ay == by && ax > bx)) { float t = ax; ax = bx; bx = t; t = ay; ay = by; by = t; }
	e->px = ax; e->py = ay; e->sl = by != ay ? (bx - ax) / (by - ay) : 0;
}
static inline float edgeX(const Edge *e, float yc) { return e->px + (yc - e->py) * e->sl; }

static inline u32 blendPx(u32 dst, u32 r, u32 g, u32 b, u32 a) {
	u32 ia = 255 - a;
	u32 dr = (dst >> 16) & 255, dg = (dst >> 8) & 255, db = dst & 255;
	dr = (r * a + dr * ia + 127) / 255; dg = (g * a + dg * ia + 127) / 255; db = (b * a + db * ia + 127) / 255;
	return (dr << 16) | (dg << 8) | db;
}

static void triWorld(const TV *A, const TV *B, const TV *C, int by0, int by1, int df, int dw) {
	const TV *a = A, *b = B, *c = C, *t;
	if (b->y < a->y) { t = a; a = b; b = t; }
	if (c->y < a->y) { t = a; a = c; c = t; }
	if (c->y < b->y) { t = b; b = c; c = t; }
	float area = (B->x - A->x) * (C->y - A->y) - (C->x - A->x) * (B->y - A->y);
	if (area > -1e-4f && area < 1e-4f) return;
	int ys = (int)ceilf(a->y - .5f), ye = (int)ceilf(c->y - .5f);
	if (ys < by0) ys = by0; if (ye > by1) ye = by1;
	if (ys >= ye) return;
	float ia = 1.f / area;
	float e1x = B->x - A->x, e1y = B->y - A->y, e2x = C->x - A->x, e2y = C->y - A->y;
#define GRAD(va, vb, vc, gx, gy) { float d1 = (vb) - (va), d2 = (vc) - (va); gx = (d1 * e2y - d2 * e1y) * ia; gy = (d2 * e1x - d1 * e2x) * ia; }
	float dzx, dzy; GRAD(A->z, B->z, C->z, dzx, dzy);
	Edge eac, eab, ebc;
	edgeOf(&eac, a->x, a->y, c->x, c->y); edgeOf(&eab, a->x, a->y, b->x, b->y); edgeOf(&ebc, b->x, b->y, c->x, c->y);
	bool flat = A->c == B->c && B->c == C->c;
	float drx = 0, dry = 0, dgx = 0, dgy = 0, dbx = 0, dby = 0, dax = 0, day = 0;
	if (!flat) {
		GRAD((float)(A->c & 255), (float)(B->c & 255), (float)(C->c & 255), drx, dry);
		GRAD((float)((A->c >> 8) & 255), (float)((B->c >> 8) & 255), (float)((C->c >> 8) & 255), dgx, dgy);
		GRAD((float)((A->c >> 16) & 255), (float)((B->c >> 16) & 255), (float)((C->c >> 16) & 255), dbx, dby);
		GRAD((float)(A->c >> 24), (float)(B->c >> 24), (float)(C->c >> 24), dax, day);
	}
	u32 fr = A->c & 255, fg = (A->c >> 8) & 255, fb = (A->c >> 16) & 255, fa = A->c >> 24;
	u32 fcol = (fr << 16) | (fg << 8) | fb;
	for (int y = ys; y < ye; y++) {
		float yc = y + .5f;
		float xa = edgeX(&eac, yc), xb = yc < b->y ? edgeX(&eab, yc) : edgeX(&ebc, yc);
		float xl = xa < xb ? xa : xb, xr = xa < xb ? xb : xa;
		int xs = (int)ceilf(xl - .5f), xe = (int)ceilf(xr - .5f);
		if (xs < 0) xs = 0; if (xe > W) xe = W;
		if (xs >= xe) continue;
		float fx = xs + .5f - A->x, fy = yc - A->y;
		float z = A->z + dzx * fx + dzy * fy;
		u32 *cp = COL + y * W; float *zp = DEP + y * W;
		if (flat) {
			if (fa >= 255) {
				if (df == SW_GREATER) {
					if (dw) { for (int x = xs; x < xe; x++, z += dzx) if (z > zp[x]) { zp[x] = z; cp[x] = fcol; } }
					else { for (int x = xs; x < xe; x++, z += dzx) if (z > zp[x]) cp[x] = fcol; }
				} else {
					for (int x = xs; x < xe; x++, z += dzx) if (z < zp[x]) { if (dw) zp[x] = z; cp[x] = fcol; }
				}
			} else {
				for (int x = xs; x < xe; x++, z += dzx) {
					bool pass = df == SW_GREATER ? z > zp[x] : z < zp[x];
					if (!pass) continue;
					if (dw) zp[x] = z;
					cp[x] = blendPx(cp[x], fr, fg, fb, fa);
				}
			}
			continue;
		}
		float r = (A->c & 255) + drx * fx + dry * fy, g = ((A->c >> 8) & 255) + dgx * fx + dgy * fy;
		float bl = ((A->c >> 16) & 255) + dbx * fx + dby * fy, al = (A->c >> 24) + dax * fx + day * fy;
		for (int x = xs; x < xe; x++, z += dzx, r += drx, g += dgx, bl += dbx, al += dax) {
			bool pass = df == SW_GREATER ? z > zp[x] : z < zp[x];
			if (!pass) continue;
			if (dw) zp[x] = z;
			u32 ir = sat8(r), ig = sat8(g), ib = sat8(bl), iA = sat8(al);
			cp[x] = iA >= 255 ? (ir << 16) | (ig << 8) | ib : blendPx(cp[x], ir, ig, ib, iA);
		}
	}
}

// interfaccia: i pixel del testo leggono l'atlante con coordinate in virgola fissa (16.16); i quattro valori del
// campo decidono subito se il pixel è vuoto o pieno, e solo il bordo fa i conti della copertura
static inline u32 bil8(u32 a, u32 b, u32 c, u32 d, u32 fx, u32 fy) {
	u32 t = a * 256 + (b - a) * fx, u = c * 256 + (d - c) * fx;   // (b - a) negativo: aritmetica modulo 2^32 corretta
	return (t * 256 + (u - t) * fy) >> 16;
}
static void tri2D(const S2 *A, const S2 *B, const S2 *C, int by0, int by1, int tex, bool solid) {
	const S2 *a = A, *b = B, *c = C, *t;
	if (b->y < a->y) { t = a; a = b; b = t; }
	if (c->y < a->y) { t = a; a = c; c = t; }
	if (c->y < b->y) { t = b; b = c; c = t; }
	float area = (B->x - A->x) * (C->y - A->y) - (C->x - A->x) * (B->y - A->y);
	if (area > -1e-4f && area < 1e-4f) return;
	int ys = (int)ceilf(a->y - .5f), ye = (int)ceilf(c->y - .5f);
	if (ys < by0) ys = by0; if (ye > by1) ye = by1;
	if (ys >= ye) return;
	float ia = 1.f / area;
	float e1x = B->x - A->x, e1y = B->y - A->y, e2x = C->x - A->x, e2y = C->y - A->y;
	Edge eac, eab, ebc;
	edgeOf(&eac, a->x, a->y, c->x, c->y); edgeOf(&eab, a->x, a->y, b->x, b->y); edgeOf(&ebc, b->x, b->y, c->x, c->y);
	bool flat = A->c == B->c && B->c == C->c;
	float drx = 0, dry = 0, dgx = 0, dgy = 0, dbx = 0, dby = 0, dax = 0, day = 0, dux = 0, duy = 0, dvx = 0, dvy = 0;
	if (!flat) {
		GRAD((float)(A->c & 255), (float)(B->c & 255), (float)(C->c & 255), drx, dry);
		GRAD((float)((A->c >> 8) & 255), (float)((B->c >> 8) & 255), (float)((C->c >> 8) & 255), dgx, dgy);
		GRAD((float)((A->c >> 16) & 255), (float)((B->c >> 16) & 255), (float)((C->c >> 16) & 255), dbx, dby);
		GRAD((float)(A->c >> 24), (float)(B->c >> 24), (float)(C->c >> 24), dax, day);
	}
	if (!solid) { GRAD(A->u, B->u, C->u, dux, duy); GRAD(A->v, B->v, C->v, dvx, dvy); }
	const Tex *tx = tex >= 0 && tex < NTX ? &TX[tex] : NULL;
	int TW = tx ? tx->w : FAW, TH = tx ? tx->h : FAH;
	// testo: soglie del campo (0..255) sotto cui il pixel è vuoto e sopra cui è pieno
	float sharp = A->s < 1 ? 1 : A->s;
	int dLo = (int)floorf(255 * (.5f - .5f / sharp)), dHi = (int)ceilf(255 * (.5f + .5f / sharp));
	float kMul = sharp / 255.f, kAdd = .5f - .5f * sharp;
	u32 cr = A->c & 255, cg = (A->c >> 8) & 255, cb = (A->c >> 16) & 255, ca = A->c >> 24;
	for (int y = ys; y < ye; y++) {
		float yc = y + .5f;
		float xa = edgeX(&eac, yc), xb = yc < b->y ? edgeX(&eab, yc) : edgeX(&ebc, yc);
		float xl = xa < xb ? xa : xb, xr = xa < xb ? xb : xa;
		int xs = (int)ceilf(xl - .5f), xe = (int)ceilf(xr - .5f);
		if (xs < 0) xs = 0; if (xe > W) xe = W;
		if (xs >= xe) continue;
		float fx = xs + .5f - A->x, fy = yc - A->y;
		u32 *cp = COL + y * W;
		if (solid && flat) {
			if (ca >= 255) { u32 col = (cr << 16) | (cg << 8) | cb; for (int x = xs; x < xe; x++) cp[x] = col; }
			else if (ca) for (int x = xs; x < xe; x++) cp[x] = blendPx(cp[x], cr, cg, cb, ca);
			continue;
		}
		float r = cr + drx * fx + dry * fy, g = cg + dgx * fx + dgy * fy;
		float bl = cb + dbx * fx + dby * fy, al = ca + dax * fx + day * fy;
		if (solid) {
			for (int x = xs; x < xe; x++, r += drx, g += dgx, bl += dbx, al += dax) {
				u32 iA = sat8(al); if (!iA) continue;
				u32 ir = sat8(r), ig = sat8(g), ib = sat8(bl);
				cp[x] = iA >= 255 ? (ir << 16) | (ig << 8) | ib : blendPx(cp[x], ir, ig, ib, iA);
			}
			continue;
		}
		// coordinate della texture in texel, virgola fissa 16.16 (centro del texel a +0,5)
		float u = A->u + dux * fx + duy * fy, v = A->v + dvx * fx + dvy * fy;
		int U = (int)((u * TW - .5f) * 65536.f), V = (int)((v * TH - .5f) * 65536.f);
		int dU = (int)(dux * TW * 65536.f), dV = (int)(dvx * TH * 65536.f);
		if (!tx) {
			for (int x = xs; x < xe; x++, U += dU, V += dV, r += drx, g += dgx, bl += dbx, al += dax) {
				int x0 = U >> 16, y0 = V >> 16; u32 ffx = (U >> 8) & 255, ffy = (V >> 8) & 255;
				int x1 = x0 + 1, y1 = y0 + 1;
				if ((unsigned)x0 >= (unsigned)(FAW - 1) || (unsigned)y0 >= (unsigned)(FAH - 1)) {
					if (x0 < 0) x0 = 0; if (y0 < 0) y0 = 0; if (x0 > FAW - 1) x0 = FAW - 1; if (y0 > FAH - 1) y0 = FAH - 1;
					x1 = x0 + 1 < FAW ? x0 + 1 : x0; y1 = y0 + 1 < FAH ? y0 + 1 : y0;
				}
				const u8 *r0 = FA + y0 * FAW, *r1 = FA + y1 * FAW;
				u32 p0 = r0[x0], p1 = r0[x1], p2 = r1[x0], p3 = r1[x1];
				u32 mx = p0 > p1 ? p0 : p1, m2 = p2 > p3 ? p2 : p3; if (m2 > mx) mx = m2;
				if ((int)mx <= dLo) continue;
				u32 mn = p0 < p1 ? p0 : p1, n2 = p2 < p3 ? p2 : p3; if (n2 < mn) mn = n2;
				float k;
				if ((int)mn >= dHi) k = 1;
				else { u32 d = bil8(p0, p1, p2, p3, ffx, ffy); k = d * kMul + kAdd; if (k <= 0) continue; if (k > 1) k = 1; }
				u32 iA = flat ? (u32)(ca * k + .5f) : sat8(al * k);
				if (!iA) continue;
				u32 ir = flat ? cr : sat8(r), ig = flat ? cg : sat8(g), ib = flat ? cb : sat8(bl);
				cp[x] = iA >= 255 ? (ir << 16) | (ig << 8) | ib : blendPx(cp[x], ir, ig, ib, iA);
			}
		} else {
			for (int x = xs; x < xe; x++, U += dU, V += dV, r += drx, g += dgx, bl += dbx, al += dax) {
				u32 s;
				if (tx->nearest) {
					int px = (U + 32768) >> 16, py = (V + 32768) >> 16;
					if (px < 0) px = 0; if (py < 0) py = 0; if (px >= TW) px = TW - 1; if (py >= TH) py = TH - 1;
					s = tx->px[py * TW + px];
				} else {
					int x0 = U >> 16, y0 = V >> 16; u32 ffx = (U >> 8) & 255, ffy = (V >> 8) & 255;
					if (x0 < 0) { x0 = 0; ffx = 0; } if (y0 < 0) { y0 = 0; ffy = 0; }
					if (x0 >= TW - 1) { x0 = TW - 1; ffx = 0; } if (y0 >= TH - 1) { y0 = TH - 1; ffy = 0; }
					int x1 = x0 + 1 < TW ? x0 + 1 : x0, y1 = y0 + 1 < TH ? y0 + 1 : y0;
					u32 q0 = tx->px[y0 * TW + x0], q1 = tx->px[y0 * TW + x1], q2 = tx->px[y1 * TW + x0], q3 = tx->px[y1 * TW + x1];
					s = 0;
					for (int sh = 0; sh < 32; sh += 8) s |= bil8((q0 >> sh) & 255, (q1 >> sh) & 255, (q2 >> sh) & 255, (q3 >> sh) & 255, ffx, ffy) << sh;
				}
				u32 sa = s >> 24; if (!sa) continue;
				u32 iA, ir, ig, ib;
				if (flat) { iA = (sa * ca + 127) / 255; ir = ((s & 255) * cr + 127) / 255; ig = (((s >> 8) & 255) * cg + 127) / 255; ib = (((s >> 16) & 255) * cb + 127) / 255; }
				else { iA = sat8(al * sa / 255); ir = sat8(r * (s & 255) / 255); ig = sat8(g * ((s >> 8) & 255) / 255); ib = sat8(bl * ((s >> 16) & 255) / 255); }
				if (!iA) continue;
				cp[x] = iA >= 255 ? (ir << 16) | (ig << 8) | ib : blendPx(cp[x], ir, ig, ib, iA);
			}
		}
	}
}

static void runBand(int y0, int y1) {
	for (int ci = 0; ci < NCMD; ci++) {
		const Cmd *c = &CMD[ci];
		if (c->type == C_CLEAR) {
			for (int y = y0; y < y1; y++) {
				u32 *p = COL + y * W; float *z = DEP + y * W;
				for (int x = 0; x < W; x++) { p[x] = c->clear; z[x] = 0; }
			}
		} else if (c->type == C_WORLD) {
			const QY *r = QYB + c->base; const TV *v = TVB + c->base * 4;
			for (int q = 0; q < c->nq; q++, v += 4) {
				if (r[q].y0 >= y1 || r[q].y1 <= y0) continue;
				triWorld(v, v + 1, v + 2, y0, y1, c->dfunc, c->dwrite);
				triWorld(v, v + 2, v + 3, y0, y1, c->dfunc, c->dwrite);
			}
		} else {
			const S2 *s = S2B + c->t0; const T2 *r = T2B + c->t0 / 3;
			for (int i = 0; i < c->nv / 3; i++) {
				if (r[i].y0 >= y1 || r[i].y1 <= y0) continue;
				tri2D(s + 3 * i, s + 3 * i + 1, s + 3 * i + 2, y0, y1, c->tex, r[i].solid);
			}
		}
	}
}

/* ---------------- thread ---------------- */
static pthread_mutex_t mx = PTHREAD_MUTEX_INITIALIZER;
static pthread_cond_t cvGo = PTHREAD_COND_INITIALIZER, cvDone = PTHREAD_COND_INITIALIZER;
static int gen = 0, nDone = 0; static bool quitting = false;
static volatile int barrierA = 0, nextBand = 0;
static int NBAND = 1, BANDH = 1;
static pthread_t *TH;

static void frameWork(int id) {
	// fase A: una parte dei quadrilateri per thread
	int g0 = (int)((long long)NQT * id / T), g1 = (int)((long long)NQT * (id + 1) / T);
	if (g1 > g0) transformRange(0, g0, g1);
	__atomic_add_fetch(&barrierA, 1, __ATOMIC_ACQ_REL);
	int spins = 0;
	while (__atomic_load_n(&barrierA, __ATOMIC_ACQUIRE) < T) {
		if (++spins > 2000) { plSleepMs(0); spins = 0; }
#if defined(__x86_64__)
		__builtin_ia32_pause();
#endif
	}
	// fase B: fasce di righe, la prima libera
	for (;;) {
		int b = __atomic_fetch_add(&nextBand, 1, __ATOMIC_ACQ_REL);
		if (b >= NBAND) break;
		int y0 = b * BANDH, y1 = y0 + BANDH; if (y1 > H) y1 = H;
		runBand(y0, y1);
		// la fascia è finita: la copia nel buffer dello schermo la fa lo stesso thread (alfa a 255)
		if (OUT) for (int y = y0; y < y1; y++) {
			const u32 *s = COL + y * W; u32 *d = OUT + y * OUTP;
			for (int x = 0; x < W; x++) d[x] = s[x] | 0xff000000u;
		}
	}
}
static void worker(void *arg) {
	int id = (int)(intptr_t)arg, my = 0;
	for (;;) {
		pthread_mutex_lock(&mx);
		while (gen == my && !quitting) pthread_cond_wait(&cvGo, &mx);
		if (quitting) { pthread_mutex_unlock(&mx); return; }
		my = gen;
		pthread_mutex_unlock(&mx);
		frameWork(id);
		pthread_mutex_lock(&mx); nDone++; pthread_cond_signal(&cvDone); pthread_mutex_unlock(&mx);
	}
}

bool swInit(int w, int h, int threads) {
	W = w; H = h; T = threads < 1 ? 1 : threads > 16 ? 16 : threads;
	COL = malloc(sizeof(u32) * W * H); DEP = malloc(sizeof(float) * W * H);
	if (!COL || !DEP) return false;
	memset(COL, 0, sizeof(u32) * W * H);
	BANDH = 24; NBAND = (H + BANDH - 1) / BANDH;
	// il carattere manca finché g2Init non lo carica: un pixel pieno
	FA = malloc(1); FA[0] = 255;
	TH = calloc(T, sizeof(pthread_t));
	for (int i = 1; i < T; i++) if (!plThreadStart(worker, (void *)(intptr_t)i, 256, &TH[i])) { T = i; break; }
	return true;
}
void swExit(void) {
	pthread_mutex_lock(&mx); quitting = true; pthread_cond_broadcast(&cvGo); pthread_mutex_unlock(&mx);
	for (int i = 1; i < T; i++) pthread_join(TH[i], NULL);
}

void swSetOutput(u32 *dst, int pitch) { OUT = dst; OUTP = pitch; }
void swFinish(void) {
	u64 t0 = osGetTime();
	{
		static int capTV = 0; static int capQY = 0;
		if (NQT * 4 > capTV) { int nc = capTV ? capTV : 4096; while (nc < NQT * 4) nc *= 2; TVB = realloc(TVB, sizeof(TV) * nc); capTV = nc; }
		if (NQT > capQY) { int nc = capQY ? capQY : 1024; while (nc < NQT) nc *= 2; QYB = realloc(QYB, sizeof(QY) * nc); capQY = nc; }
	}
	swStatQuads = NQT; swStatTris2D = NS2 / 3;
	barrierA = 0; nextBand = 0;
	if (T > 1) {
		pthread_mutex_lock(&mx); nDone = 0; gen++; pthread_cond_broadcast(&cvGo); pthread_mutex_unlock(&mx);
		frameWork(0);
		pthread_mutex_lock(&mx); while (nDone < T - 1) pthread_cond_wait(&cvDone, &mx); pthread_mutex_unlock(&mx);
	} else frameWork(0);
	NCMD = 0; NQT = 0; NS2 = 0; NLS = 0; NPJ = 0; curLight = curProj = -1;
	swStatMs = swStatMs * .9f + (osGetTime() - t0) * .1f;
}
