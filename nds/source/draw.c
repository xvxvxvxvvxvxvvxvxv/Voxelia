// Voxelia DS - entità: personaggi e nemici come sprite (nitro:/spr.pak, ricavati dai modelli animati della 7.50),
// l'eroe e gli altri giocatori con corazza, elmo, scudo e arma (nitro:/hero.pak, colori della rarità nella
// tavolozza), forzieri, leve, portali, oggetti a terra ed effetti come piccoli box, come sul 3DS.
#include "voxelia.h"

#define EMIT(v, stmt) do { float _e = gEmit; gEmit = (v); stmt; gEmit = _e; } while (0)
extern bool TITLE_MODE;
extern float lightAt(float x, float y, bool emis);
extern void spriteQuad(int tex, int w, int h, int ax, int ay, float k, float x, float y, float zo, bool mirror, u16 tint, int alpha);

// direzione 0..7 come faceOf() dell'originale: 0 = +y, 2 = -x, 4 = -y, 6 = +x
int faceOf(float dx, float dy) {
	if (fabsf(dx) < 1e-6f && fabsf(dy) < 1e-6f) return 0;
	float a = atan2f(dy, dx) * 180 / PI_F - 90;
	int f = (int)lroundf(a / 45);
	return ((f % 8) + 8) % 8;
}
// le direzioni salvate sono 0, 1, 2, 3, 7: le altre sono le stesse specchiate (scambiando x e y)
static const u8 FI[8] = {0, 1, 2, 3, 2, 1, 0, 4}, FM[8] = {0, 0, 0, 0, 1, 1, 1, 0};

/* ---------------- sprite dei modelli ---------------- */
typedef struct { u32 off; u8 lw, lh, nfr, fpd; s8 ax, ay; u8 sc; u8 tried; int *tex; } Spr;
static Spr *SP = NULL;
int NMDL = 0;
static FILE *SPF = NULL, *HPF = NULL;
static int HN = 0; static u8 HLW, HLH, HSC; static s8 HAX, HAY; static u32 *HOFF = NULL;
void modelsLoad(void) {
	SPF = fopen(DATADIR "spr.pak", "rb");
	if (SPF) {
		u8 hd[6]; fread(hd, 1, 6, SPF);
		if (!memcmp(hd, "VXS1", 4)) {
			NMDL = hd[4] | hd[5] << 8;
			SP = calloc(NMDL, sizeof(Spr));
			u32 *offs = malloc(4 * NMDL); fread(offs, 4, NMDL, SPF);
			for (int i = 0; i < NMDL; i++) {
				SP[i].off = offs[i]; if (!offs[i]) continue;
				u8 h[8]; fseek(SPF, offs[i], SEEK_SET); fread(h, 1, 8, SPF);
				SP[i].lw = h[0]; SP[i].lh = h[1]; SP[i].nfr = h[2]; SP[i].fpd = h[3]; SP[i].ax = (s8)h[4]; SP[i].ay = (s8)h[5]; SP[i].sc = h[6] ? h[6] : 100;
			}
			free(offs);
		}
	}
	HPF = fopen(DATADIR "hero.pak", "rb");
	if (HPF) {
		u8 hd[11]; fread(hd, 1, 11, HPF);
		if (!memcmp(hd, "VXE1", 4)) {
			HN = hd[4] | hd[5] << 8; HLW = hd[6]; HLH = hd[7]; HAX = (s8)hd[8]; HAY = (s8)hd[9]; HSC = hd[10] ? hd[10] : 100;
			HOFF = malloc(4 * HN); fread(HOFF, 4, HN, HPF);
		}
	}
}
static u8 TEXBUF[64 * 64 * 20 / 2 + 64];
static void sprLoad(int m) {
	Spr *s = &SP[m];
	if (s->tried || !s->off) return;
	s->tried = 1;
	int w = 8 << s->lw, h = 8 << s->lh, sz = w * h / 2, n = s->nfr;
	if (sz * n > (int)sizeof TEXBUF - 32) n = (sizeof TEXBUF - 32) / sz;
	fseek(SPF, s->off + 8, SEEK_SET);
	fread(TEXBUF, 1, 32 + sz * n, SPF);
	s->tex = calloc(s->nfr, sizeof(int));
	for (int f = 0; f < n; f++) {
		int t = 0; glGenTextures(1, &t); glBindTexture(0, t);
		if (!glTexImage2D(0, 0, GL_RGB16, s->lw, s->lh, 0, TEXGEN_TEXCOORD | GL_TEXTURE_COLOR0_TRANSPARENT, TEXBUF + 32 + f * sz)) { glDeleteTextures(1, &t); break; }
		if (f == 0) glColorTableEXT(0, 0, 16, 0, 0, (u16 *)TEXBUF); else glAssignColorTable(0, s->tex[0]);
		s->tex[f] = t;
	}
	glBindTexture(0, 0);
}
// per la zona appena caricata: si libera la memoria video e si caricano i modelli presenti
static void heroCacheClear(void);
void sprZone(void) {
	glResetTextures();
	for (int i = 0; i < NMDL; i++) { SP[i].tried = 0; free(SP[i].tex); SP[i].tex = NULL; }
	heroCacheClear();
	for (int i = 0; i < NENT; i++) if ((ents[i].k == K_EN || ents[i].k == K_NPC) && ents[i].model >= 0 && ents[i].model < NMDL) sprLoad(ents[i].model);
	if (ZDG >= 0) { const DungeonDef *d = &DG[ZDG]; for (int i = 0; i < d->nen; i++) if (d->en[i] >= 0 && E[d->en[i]].mdl >= 0 && E[d->en[i]].mdl < NMDL) sprLoad(E[d->en[i]].mdl); }
}
static void drawModel(int m, int face, int fr, float x, float y, float zo, float k, u16 tint, int alpha) {
	if (m < 0 || m >= NMDL || !SP[m].off) return;
	Spr *s = &SP[m];
	if (!s->tried) sprLoad(m);
	if (!s->tex) return;
	int fi = FI[face & 7], idx = fi * s->fpd + clampi(fr, 0, s->fpd - 1);
	if (idx >= s->nfr || !s->tex[idx]) idx = 0;
	if (!s->tex[idx]) return;
	spriteQuad(s->tex[idx], 8 << s->lw, 8 << s->lh, s->ax, s->ay, k * 100.f / s->sc, x, y, zo, FM[face & 7], tint, alpha);
}

/* ---------------- eroi: varianti di equipaggiamento in una piccola cache ---------------- */
typedef struct { u32 key; int tex[15]; int n; u32 used; } HCache;
static HCache HC[8]; static u32 hcClock = 0;
static void heroCacheClear(void) { memset(HC, 0, sizeof HC); }
static u16 rar15(int r, float f) { u32 c = r >= 0 ? RC[clampi(r, 0, 4)] : 0x3a6ea5; c = shade(c, f); return RGB15((c >> 19) & 31, (c >> 11) & 31, (c >> 3) & 31); }
static HCache *heroVariant(int c, int h, int w, int s, int tw, int tc, bool sw) {
	if (!HPF || !HN) return NULL;
	int ci = c < 0 ? 0 : clampi(tc, 0, 2) + 1, hp = h >= 0, sp = s >= 0;
	int v = ((((ci * 2 + hp) * 2 + sp) * 8 + clampi(tw, 0, 7)) * 2 + (sw ? 1 : 0));
	if (v >= HN) return NULL;
	u32 key = (u32)v << 16 | (u32)((c + 1) & 7) << 9 | (u32)((h + 1) & 7) << 6 | (u32)((w + 1) & 7) << 3 | (u32)((s + 1) & 7);
	key |= 0x80000000u;
	HCache *best = &HC[0];
	for (int i = 0; i < 8; i++) { if (HC[i].key == key) { HC[i].used = ++hcClock; return &HC[i]; } if (HC[i].used < best->used) best = &HC[i]; }
	// carica la variante nella voce meno usata
	if (best->key) { for (int f = 0; f < best->n; f++) if (best->tex[f]) glDeleteTextures(1, &best->tex[f]); }
	memset(best, 0, sizeof *best);
	int W = 8 << HLW, H = 8 << HLH, sz = W * H / 2, n = sw ? 5 : 15;
	fseek(HPF, HOFF[v], SEEK_SET);
	fread(TEXBUF, 1, 32 + sz * n, HPF);
	u16 *pal = (u16 *)TEXBUF;
	// segnaposto: 1-3 corazza, 4-6 arma, 7-9 elmo o scudo (come sul 3DS, «niente» è azzurro)
	int hs = h >= 0 ? h : s;
	for (int k = 0; k < 3; k++) { float f = k == 0 ? 1 : k == 1 ? .78f : .58f; pal[1 + k] = rar15(c, f); pal[4 + k] = rar15(w, f); pal[7 + k] = rar15(hs, f); }
	for (int f = 0; f < n; f++) {
		int t = 0; glGenTextures(1, &t); glBindTexture(0, t);
		if (!glTexImage2D(0, 0, GL_RGB16, HLW, HLH, 0, TEXGEN_TEXCOORD | GL_TEXTURE_COLOR0_TRANSPARENT, TEXBUF + 32 + f * sz)) { glDeleteTextures(1, &t); break; }
		if (f == 0) glColorTableEXT(0, 0, 16, 0, 0, pal); else glAssignColorTable(0, best->tex[0]);
		best->tex[f] = t; best->n = f + 1;
	}
	glBindTexture(0, 0);
	best->key = key; best->used = ++hcClock;
	return best;
}
static void drawHeroSprite(float x, float y, float zo, int face, int c, int h, int w, int s, int tw, int tc, bool walk, float ph, bool sw, u16 tint, int alpha) {
	HCache *v = heroVariant(c, h, w, s, tw, tc, sw);
	if (!v || !v->n) return;
	int fi = FI[face & 7], fr = sw ? fi : fi * 3 + (walk ? 1 + (sinf(ph) > 0) : 0);
	if (fr >= v->n) fr = 0;
	spriteQuad(v->tex[fr], 8 << HLW, 8 << HLH, HAX, HAY, 100.f / HSC, x, y, zo, FM[face & 7], tint, alpha);
}
void heroEqPack(int *c, int *h, int *w, int *s, int *tw, int *th, int *tc, int *ts) {
	*c = P.eq[SL_C].used ? P.eq[SL_C].r : -1; *h = P.eq[SL_H].used ? P.eq[SL_H].r : -1;
	*w = P.eq[SL_W].used ? P.eq[SL_W].r : 0; *s = P.eq[SL_S].used ? P.eq[SL_S].r : -1;
	*tw = P.eq[SL_W].used ? itemType(&P.eq[SL_W]) : 1; *th = P.eq[SL_H].used ? itemType(&P.eq[SL_H]) : 0;
	*tc = P.eq[SL_C].used ? itemType(&P.eq[SL_C]) : 0; *ts = P.eq[SL_S].used ? itemType(&P.eq[SL_S]) : 0;
}
static u16 tintAt(float x, float y, bool flash) {
	if (flash) return RGB15(31, 12, 12);
	float f = lightAt(x, y, false); int v = (int)(31 * fminf(1, f));
	return RGB15(v, v, v);
}
static void shadowAt(float x, float y, float r) { if (SET.shad) flatEllipse(x, y, .5f, r, r * .8f, 0x000000, 80); }

void drawHero(void) {
	if (TITLE_MODE) return;
	if (P.hp <= 0 && MODE_DEAD) return;
	shadowAt(P.px, P.py, .3f);
	int c, h, w, s, tw, th, tc, ts; heroEqPack(&c, &h, &w, &s, &tw, &th, &tc, &ts);
	float z = P.moving ? fabsf(sinf(gtime * 17)) * 2 : 0;
	if (P.dmk == 1) z += 3;
	drawHeroSprite(P.px, P.py, z, P.face, c, h, w, s, tw, tc, P.moving, gtime * 9, P.sw > 0, tintAt(P.px, P.py, P.fl > 0), P.iv > 0 ? 18 : 31);
}
void drawPeers(void) {
	if (!netOk || TITLE_MODE) return;
	char rk[64]; rmKey(rk, sizeof rk);
	for (int i = 0; i < MAXPEER; i++) {
		Peer *p = &PEERS[i];
		if (!p->used || strcmp(p->rm, rk) || plHidePeer(p)) continue;
		if (fabsf((p->x - p->y) - (P.px - P.py)) > 12 || fabsf((p->x + p->y) - (P.px + P.py)) > 22) continue;
		shadowAt(p->x, p->y, .3f);
		bool mv = p->mv > 0;
		drawHeroSprite(p->x, p->y, mv ? fabsf(sinf(gtime * 17 + i)) * 2 : 0, p->fa & 7, p->c, p->h, p->w, p->s, p->tw, p->tc, mv, gtime * 9 + i, p->sw > 0, tintAt(p->x, p->y, p->fl > 0), 31);
	}
}

void drawEntity(Ent *e) {
	float u;
	switch (e->k) {
	case K_TC: {
		box(e->px - .05f, e->py - .05f, 10, .1f, .1f, 14, 0x4a3a2a, 1);
		float fl = 1 + sinf(gtime * 12 + e->px * 5) * .15f;
		EMIT(1, box(e->px - .09f, e->py - .09f, 24, .18f, .18f, 6 * fl, ZTC, 1.2f));
		return;
	}
	case K_CH:
		shadowAt(e->px, e->py, .32f);
		box(e->px - .3f, e->py - .22f, 0, .6f, .44f, 9, e->rich ? 0x5a2a8a : 0x8a5a2a, 1);
		box(e->px - .3f, e->py - .22f, 9, .6f, .44f, 4, 0xf5c342, 1);
		return;
	case K_CHO: {
		float k = clampf((gtime - e->t0) / .35f, 0, 1);
		u32 c = e->rich ? 0x5a2a8a : 0x8a5a2a;
		box(e->px - .3f, e->py - .22f, 0, .6f, .44f, 9, c, 1);
		if (k < 1) box(e->px - .3f, e->py - .22f, 9 + k * 10, .6f, .44f, 4 - k * 2, 0xf5c342, 1);
		else box(e->px - .3f, e->py - .26f, 9, .6f, .06f, 12, 0xf5c342, 1);
		return;
	}
	case K_DR: {
		u = sinf(gtime * 4 + e->px * 1.7f) * 2.5f;
		shadowAt(e->px, e->py, .2f);
		EMIT(e->it.r >= 2 ? .6f : .2f, box(e->px - .15f, e->py - .15f, 6 + u, .3f, .3f, 10, RC[e->it.r], 1));
		return;
	}
	case K_SHARD: {
		u = sinf(gtime * 3) * 4;
		EMIT(1, box(e->px - .12f, e->py - .12f, 12 + u, .24f, .24f, 18, 0xffd84a, 1));
		EMIT(1, box(e->px - .2f, e->py - .04f, 18 + u, .4f, .08f, 6, 0xffcc33, 1));
		return;
	}
	case K_LORE:
		u = sinf(gtime * 3) * 3;
		EMIT(.5f, box(e->px - .2f, e->py - .08f, 8 + u, .4f, .16f, 3, 0xf4e8c8, 1));
		return;
	case K_RES:
		if (e->rt > gtime) return;
		u = sinf(gtime * 3 + e->px) * 1.5f;
		EMIT(1, box(e->px - .05f, e->py - .05f, 26 + u, .1f, .1f, 3, 0xfff2a0, 1));
		return;
	case K_LEV: {
		extern bool levIsDown(Ent *); extern float levLeft(Ent *);
		bool on = levIsDown(e); float k = levLeft(e);
		box(e->px - .22f, e->py - .16f, 0, .44f, .32f, 5, 0x5a5652, 1);
		if (on) box(e->px, e->py - .04f, 8, .34f, .08f, 3, 0x8a6a42, 1);
		else { box(e->px - .04f, e->py - .04f, 8, .08f, .08f, 18, 0x8a6a42, 1); box(e->px - .06f, e->py - .06f, 26, .12f, .12f, 4, 0xc0392b, 1); }
		if (on) EMIT(1, box(e->px - .07f, e->py + .12f, 6, .14f, .04f, 3, k >= 1 ? 0x7affea : k > .3f ? 0x7aff7a : 0xffd84a, 1.5f));
		return;
	}
	case K_PO:
		if (e->seal) {   // la grata davanti alla scala
			box(e->px - .46f, e->py + .37f, 0, .92f, .06f, 40, 0x5a5a62, 1);
		}
		if (e->st == PO_VOID) {
			EMIT(1, box(e->px - .33f, e->py - .05f, 4, .66f, .1f, 32, 0xc46bff, 1));
		} else if (e->dgx) {
			EMIT(.9f, box(e->px - .18f, e->py - .18f, 6 + sinf(gtime * 3) * 3, .36f, .36f, 16, ZTC, 1.1f));
		}
		return;   // gli altri portali sono già nei blocchi della zona
	case K_DEAD: {
		float k = (gtime - e->t0) / .7f;
		if (k >= 1) return;
		drawModel(e->model, e->face, 0, e->px, e->py, -k * 16, e->scl > 0 ? e->scl : 1, RGB15(31, 31, 31), (int)(31 * (1 - k)) | 1);
		return;
	}
	case K_EN: {
		bool boss = e->boss; float sc = e->scl > 0 ? e->scl : 1;
		if (e == LOCK) flatRing(e->px, e->py, .6f, (boss ? .75f : .45f) * sc, (boss ? .75f : .45f) * sc, .07f, 0xff5a4a, 230);
		shadowAt(e->px, e->py, (boss ? .55f : .3f) * sc);
		int fr;
		if (e->atkT > 0 && gtime - e->atkT < .3f) fr = 3;
		else fr = (e->mvT > gtime - .2f) ? ((int)(gtime * 6 + e->id) % 3) : 0;
		if (e->model >= 0 && e->model < NMDL && SP[e->model].fpd < 4 && fr == 3) fr = 0;
		drawModel(e->model, e->face, fr, e->px, e->py, 0, sc, tintAt(e->px, e->py, e->fl > 0), 31);
		if (e->enr && boss) flatEllipse(e->px, e->py, .8f, .8f * sc, .8f * sc, 0xff3a2a, 60 + (u8)(sinf(gtime * 6) * 30));
		return;
	}
	case K_NPC: {
		shadowAt(e->px, e->py, .3f);
		bool mv = e->pn > e->pi;
		int fr = mv ? 1 + ((int)(gtime * 5) & 1) : 0;
		drawModel(e->model, e->face, fr, e->px, e->py, 0, 1, tintAt(e->px, e->py, false), 31);
		return;
	}
	}
}

void drawFx(void) {
	for (int i = 0; i < NPJ; i++) { Proj *p = &PJ[i]; EMIT(1, box(p->x - .08f, p->y - .08f, 18, .16f, .16f, 8, p->c, 1.2f)); }
	for (int i = 0; i < NPARTS && i < 40; i++) { Part *q = &PARTS[i]; float s = fmaxf(.06f, q->s); EMIT(.8f, boxA(q->x - s / 2, q->y - s / 2, q->z, s, s, 0, q->c, 1, 255)); }
	for (int i = 0; i < NFX; i++) {
		Fx *f = &FX[i];
		switch (f->k) {
		case FX_RING: { float p = fmaxf(0, 1 - f->t / f->mx); flatRing(f->x, f->y, 1, f->r * p, f->r * p, .12f, f->c, (u8)(clampf(f->t / f->mx, 0, 1) * 220)); break; }
		case FX_AREA: { float p = 1 - f->t / f->mx; flatRing(f->x, f->y, 1, f->r * (.3f + .7f * p), f->r * (.3f + .7f * p), .18f, 0xffffff, (u8)(200 * (1 - p))); break; }
		case FX_WARN: { float p = 1 - f->t / f->mx; flatEllipse(f->x, f->y, .6f, f->r, f->r, 0xff281e, (u8)(40 + p * 64)); flatRing(f->x, f->y, .7f, f->r * p, f->r * p, .08f, 0xff5028, 230); break; }
		case FX_BOOM: { float p = 1 - f->t / .4f; flatRing(f->x, f->y, .8f, f->r * p, f->r * p, .2f, 0xff783c, (u8)(clampf(f->t * 2.5f, 0, 1) * 255)); break; }
		case FX_ARC: { float a = clampf(f->t / f->mx, 0, 1), sp = f->dmg, a0 = f->x2; int n = 5;
			for (int k = 0; k <= n; k++) { float an = a0 + sp * k / n, rr = f->r * (.75f + .25f * (1 - a)); EMIT(1, boxA(f->x + cosf(an) * rr - .07f, f->y + sinf(an) * rr - .07f, 12, .14f, .14f, 0, f->c, 1, 255)); } break; }
		case FX_TRAIL: break;
		}
	}
}
// tutte le entità inquadrate
void drawWorldEntities(void) {
	if (TITLE_MODE && !started) { /* sul titolo si vedono solo la città e i suoi abitanti */ }
	float hs = P.px + P.py, hd = P.px - P.py;
	if (TITLE_MODE) { hs = (camY + 10) / 16.f; hd = camX / 32.f; }
	for (int i = 0; i < NENT; i++) {
		Ent *e = &ents[i]; if (!e->k) continue;
		if (fabsf((e->px - e->py) - hd) > 11 || (e->px + e->py) - hs > 22 || (e->px + e->py) - hs < -16) continue;
		drawEntity(e);
	}
	drawPeers();
	drawHero();
	drawFx();
}
