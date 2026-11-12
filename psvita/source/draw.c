// Voxelia PS Vita (motore del port 3DS) - entità: modelli animati della 7.50 (fotogrammi esportati, 8 direzioni), eroe componibile,
// altri giocatori, forzieri, torce, oggetti a terra ed effetti.
#include "voxelia.h"

#define EMIT(v, stmt) do { float _e = gEmit; gEmit = (v); stmt; gEmit = _e; } while (0)
extern bool TITLE_MODE;
extern QBox *HERO[1280];
extern u8 HERON[1280];

// direzione 0..7 come faceOf() dell'originale: 0 = +y, 2 = -x, 4 = -y, 6 = +x
int faceOf(float dx, float dy) {
	if (fabsf(dx) < 1e-6f && fabsf(dy) < 1e-6f) return 0;
	float a = atan2f(dy, dx) * 180 / PI_F - 90;
	int f = (int)lroundf(a / 45);
	return ((f % 8) + 8) % 8;
}

static void shadowAt(float x, float y, float r) {
	if (!SET.shad) return;
	rStream(2); flatEllipse(x, y, .35f, r, r, 0x000000, 70); rStream(1);
}

float gMS = 1;   // grandezza dei modelli (il boss del mondo è più grande)
void drawModelFrame(int mdl, int frame, float px, float py, float zo, int white, u8 alpha) {
	if (mdl < 0 || mdl >= NMDL) return;
	AModel *m = &MDL[mdl];
	if (!m->nfr) return;
	if (frame < 0 || frame >= m->nfr) frame = 0;
	const QBox *B = m->fr[frame];
	for (int i = 0; i < m->nb[frame]; i++) {
		const QBox *q = &B[i];
		u32 c = white == 1 ? 0xffffff : (q->r << 16) | (q->g << 8) | q->b;
		if (gVar && white != 1) { extern u32 pvColor(u32); c = pvColor(c); }   // varianti dei compagni (7.54)
		gEmit = emissiveQ(q) ? .85f : 0;
		u8 a = alpha < 255 ? alpha : (q->a < 250 ? q->a : 255);
		float s = gMS;
		if (q->fl & 2) boxR(px, py, q->x / 256.f * s, q->y / 256.f * s, q->z / 8.f * s + zo, q->w / 256.f * s, q->d / 256.f * s, q->h / 8.f * s, c, q->f / 100.f, a);
		else boxA(px + q->x / 256.f * s, py + q->y / 256.f * s, q->z / 8.f * s + zo, q->w / 256.f * s, q->d / 256.f * s, q->h / 8.f * s, c, q->f / 100.f, a);
	}
	gEmit = 0;
}

// eroe: corpo, corazza, elmo, scudo e arma dal tipo dell'oggetto; i colori segnaposto diventano quelli della rarità
void drawHeroModel(float px, float py, float zo, int fc, int c, int h, int w, int s, int tyw, int tyh, int tyc, int tys, bool walk, float ph, bool sw, u8 alpha) {
	int ci = c < 0 ? 0 : clampi(tyc, 0, 2) + 1, hi = h < 0 ? 0 : clampi(tyh, 0, 3) + 1, si = s < 0 ? 0 : clampi(tys, 0, 2) + 1;
	int idx = ((((ci * 5 + hi) * 4 + si) * 8 + clampi(tyw, 0, 7)) * 2 + (sw ? 1 : 0));
	const QBox *B = HERO[idx]; int n = HERON[idx];
	if (!B) return;
	float sn = sinf(ph), la = fmaxf(0, sn) * 2.6f, lb = fmaxf(0, -sn) * 2.6f;
	int rot = (fc >> 1) & 3; bool odd = fc & 1;
	for (int i = 0; i < n; i++) {
		const QBox *q = &B[i];
		float x = q->x / 256.f, y = q->y / 256.f, z = q->z / 8.f, bw = q->w / 256.f, bd = q->d / 256.f, bh = q->h / 8.f;
		u32 col = (q->r << 16) | (q->g << 8) | q->b;
		if (q->r == 0xfe && q->b == 0 && q->g >= 1 && q->g <= 4) {
			int slot = q->g, r = slot == 1 ? c : slot == 2 ? h : slot == 3 ? w : s;
			col = r >= 0 ? RC[clampi(r, 0, 4)] : 0x3a6ea5;
		}
		// passo: le gambe si alzano a turno (walkLegs dell'originale)
		if (walk && z < .5f && bh > 3) { float lift = x + bw / 2 < 0 ? la : lb; z += lift; bh = fmaxf(1, bh - lift); }
		for (int r2 = 0; r2 < rot; r2++) { float nx = -(y + bd), ny = x, nw = bd, nd = bw; x = nx; y = ny; bw = nw; bd = nd; }
		if (odd) boxR(px, py, x, y, z + zo, bw, bd, bh, col, 1, alpha);
		else boxA(px + x, py + y, z + zo, bw, bd, bh, col, 1, alpha);
	}
}

void heroEqPack(int *c, int *h, int *w, int *s, int *tw, int *th, int *tc, int *ts) {
	*c = P.eq[SL_C].used ? P.eq[SL_C].r : -1; *h = P.eq[SL_H].used ? P.eq[SL_H].r : -1;
	*w = P.eq[SL_W].used ? P.eq[SL_W].r : 0; *s = P.eq[SL_S].used ? P.eq[SL_S].r : -1;
	*tw = P.eq[SL_W].used ? itemType(&P.eq[SL_W]) : 1; *th = P.eq[SL_H].used ? itemType(&P.eq[SL_H]) : 0;
	*tc = P.eq[SL_C].used ? itemType(&P.eq[SL_C]) : 0; *ts = P.eq[SL_S].used ? itemType(&P.eq[SL_S]) : 0;
}

void drawHero(void) {
	if (TITLE_MODE) return;
	if (P.hp <= 0 && MODE_DEAD) return;
	shadowAt(P.px, P.py, .33f);
	int c, h, w, s, tw, th, tc, ts; heroEqPack(&c, &h, &w, &s, &tw, &th, &tc, &ts);
	float z = P.moving ? fabsf(sinf(gtime * 17)) * 2 : 0;
	if (P.dmk == 1) z += 3;
	if (cavOn()) { xDrawHeroHorse(); z = xHeroZ(); }   // in sella (7.46)
	drawHeroModel(P.px, P.py, z, P.face, c, h, w, s, tw, th, tc, ts, P.moving, gtime * 17, P.sw > 0, P.fl > 0 ? 200 : 255);
	if (P.bA > 0 || P.bD > 0) { rStream(2); flatRing(P.px, P.py, .5f, .42f, .42f, .06f, P.bA > 0 ? 0xff7a3a : 0x9a9aaa, 140); rStream(1); }
}

void drawPeers(void) {
	if (!netOk || TITLE_MODE) return;
	char rk[64]; rmKey(rk, sizeof rk);
	for (int i = 0; i < MAXPEER; i++) {
		Peer *p = &PEERS[i];
		if (!p->used || strcmp(p->rm, rk) || plHidePeer(p)) continue;
		float sx, sy; worldToScreen(p->x, p->y, 0, &sx, &sy);
		if (sx < -80 || sx > VW + 80 || sy < -60 || sy > VH + 80) continue;
		shadowAt(p->x, p->y, .33f);
		bool mv = p->mv > 0;
		xDrawPeerExtras(p, i);
		if (xPeerMounted(p)) xDrawPeerHorse(p, mv, gtime * 13 + i);
		drawHeroModel(p->x, p->y, xPeerMounted(p) ? 16 : mv ? fabsf(sinf(gtime * 17 + i)) * 2 : 0, p->fa & 7, p->c, p->h, p->w, p->s, p->tw, p->th, p->tc, p->ts, mv, gtime * 17 + i, p->sw > 0, p->fl > 0 ? 200 : 255);
	}
}

void drawEntity(Ent *e) {
	float u;
	switch (e->k) {
	case K_X: xDraw(e); return;
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
		box(e->px - .3f, e->py - .22f, 0, .6f, .44f, 9, c, 1); box(e->px - .32f, e->py - .24f, 9, .64f, .48f, 1, 0x3a2410, 1);
		if (k < 1) box(e->px - .3f, e->py - .22f, 9 + k * 10, .6f, .44f, 4 - k * 2, 0xf5c342, 1);
		else box(e->px - .3f, e->py - .26f, 9, .6f, .06f, 12, 0xf5c342, 1);
		if (gtime - e->t0 < 1.4f) EMIT(1, box(e->px - .18f, e->py - .12f, 10, .36f, .24f, 2, 0xfff2a0, 1));
		return;
	}
	case K_DR: {
		u = sinf(gtime * 4 + e->px * 1.7f) * 2.5f;
		shadowAt(e->px, e->py, .2f);
		EMIT(e->it.r >= 2 ? .6f : .2f, box(e->px - .15f, e->py - .15f, 6 + u, .3f, .3f, 10, RC[e->it.r], 1));
		if (e->it.s == SL_W) box(e->px - .03f, e->py - .03f, 16 + u, .06f, .06f, 10, 0xdddddd, 1);
		return;
	}
	case K_SHARD: {
		u = sinf(gtime * 3) * 4;
		EMIT(1, box(e->px - .12f, e->py - .12f, 12 + u, .24f, .24f, 18, 0xffd84a, 1));
		EMIT(1, box(e->px - .06f, e->py - .06f, 30 + u, .12f, .12f, 6, 0xfff6c0, 1));
		EMIT(1, box(e->px - .2f, e->py - .04f, 18 + u, .4f, .08f, 6, 0xffcc33, 1));
		if (fmodf(gtime, 6.28f) > 3) EMIT(1, box(e->px - .04f, e->py - .2f, 18 + u, .08f, .4f, 6, 0xffcc33, 1));
		return;
	}
	case K_LORE:
		u = sinf(gtime * 3) * 3;
		EMIT(.5f, box(e->px - .2f, e->py - .08f, 8 + u, .4f, .16f, 3, 0xf4e8c8, 1));
		box(e->px - .24f, e->py - .1f, 8 + u, .06f, .2f, 4, 0xa0703a, 1); box(e->px + .18f, e->py - .1f, 8 + u, .06f, .2f, 4, 0xa0703a, 1);
		return;
	case K_RES:
		if (e->rt > gtime) return;
		u = sinf(gtime * 3 + e->px) * 1.5f;
		EMIT(1, box(e->px - .05f, e->py - .05f, 26 + u, .1f, .1f, 3, 0xfff2a0, 1));
		return;
	case K_LEV: {
		extern bool levIsDown(Ent *); extern float levLeft(Ent *);
		bool on = levIsDown(e); float k = levLeft(e);
		shadowAt(e->px, e->py, .28f);
		box(e->px - .22f, e->py - .16f, 0, .44f, .32f, 5, 0x5a5652, 1); box(e->px - .18f, e->py - .12f, 5, .36f, .24f, 3, 0x6e6a64, 1); box(e->px - .05f, e->py - .05f, 8, .1f, .1f, 4, 0x3a3a3a, 1);
		if (on) { box(e->px, e->py - .04f, 8, .34f, .08f, 3, 0x8a6a42, 1); box(e->px + .3f, e->py - .06f, 8, .1f, .12f, 4, 0xc0392b, 1); }
		else { box(e->px - .04f, e->py - .04f, 12, .08f, .08f, 16, 0x8a6a42, 1); box(e->px - .06f, e->py - .06f, 28, .12f, .12f, 4, 0xc0392b, 1); }
		if (on) EMIT(1, box(e->px - .07f, e->py + .12f, 6, .14f, .04f, 3, k >= 1 ? 0x7affea : k > .3f ? 0x7aff7a : 0xffd84a, 1.5f));
		return;
	}
	case K_PO:
		if (e->seal) {   // la grata davanti alla scala
			for (int i = 0; i < 5; i++) box(e->px - .42f + i * .2f, e->py + .38f, 0, .05f, .05f, 40, 0x5a5a62, 1);
			box(e->px - .46f, e->py + .37f, 12, .92f, .06f, 3, 0x3a3a42, 1); box(e->px - .46f, e->py + .37f, 30, .92f, .06f, 3, 0x3a3a42, 1);
		}
		if (e->st == PO_VOID) {
			float r = fmodf(gtime * 2, 6.28f);
			box(e->px - .45f, e->py - .1f, 0, .12f, .2f, 40, 0x2a1a3a, 1); box(e->px + .33f, e->py - .1f, 0, .12f, .2f, 40, 0x2a1a3a, 1);
			EMIT(1, box(e->px - .33f, e->py - .05f, 4, .66f, .1f, 32, 0xc46bff, 1));
			EMIT(1, box(e->px - .2f + cosf(r) * .15f, e->py - .03f, 14 + sinf(r) * 8, .1f, .06f, 8, 0xffffff, 1));
		} else if (e->dgx) {
			EMIT(.9f, box(e->px - .18f, e->py - .18f, 6 + sinf(gtime * 3) * 3, .36f, .36f, 16, ZTC, 1.1f));
			box(e->px - .4f, e->py - .4f, 0, .14f, .14f, 34, 0x99aabb, 1); box(e->px + .26f, e->py + .26f, 0, .14f, .14f, 34, 0x99aabb, 1);
		}
		return;   // gli altri portali sono già nella geometria della zona
	case K_DEAD: {
		float k = (gtime - e->t0) / .7f;
		if (k >= 1) return;
		rStream(2);
		drawModelFrame(e->model, (e->face & 7) * 4, e->px, e->py, -k * 16, k < .15f, (u8)(255 * (1 - k)));
		rStream(1);
		return;
	}
	case K_EN: {
		bool boss = e->boss;
		if (e == LOCK) { rStream(2); EMIT(1, flatRing(e->px, e->py, .6f, boss ? .75f : .45f, boss ? .75f : .45f, .07f, 0xff5a4a, 230)); rStream(1); }
		float sc = e->scl > 0 ? e->scl : 1;
		shadowAt(e->px, e->py, (boss ? .62f : .33f) * sc);
		int fr;
		if (e->atkT > 0 && gtime - e->atkT < .3f) fr = 3;
		else fr = (e->mvT > gtime - .2f) ? ((int)(gtime * 6 + e->id) % 3) : 0;
		gMS = sc;
		drawModelFrame(e->model, (e->face & 7) * 4 + fr, e->px, e->py, 0, e->fl > 0 ? 1 : 0, 255);
		gMS = 1;
		if (e->enr && boss) { rStream(2); EMIT(1, boxA(e->px - .7f, e->py - .7f, 0, 1.4f, 1.4f, 1, 0xff3a2a, 1, 60 + (u8)(sinf(gtime * 6) * 30))); rStream(1); }
		return;
	}
	case K_NPC: {
		shadowAt(e->px, e->py, .33f);
		bool mv = e->pn > e->pi;
		int fr = mv ? 1 + ((int)(gtime * 5) & 1) : 0;
		drawModelFrame(e->model, (e->face & 7) * 3 + fr, e->px, e->py, 0, 0, 255);
		if (e->nid >= 0 && !strcmp(NPCS[e->nid].id, "re") && P.st >= 3) EMIT(1, box(e->px - .2f, e->py - .17f, 47, .4f, .34f, 3, 0xffd84a, 1.2f));
		return;
	}
	}
}

void drawFx(void) {
	for (int i = 0; i < NPJ; i++) { Proj *p = &PJ[i]; EMIT(1, box(p->x - .08f, p->y - .08f, 18, .16f, .16f, 8, p->c, 1.2f)); }
	for (int i = 0; i < NPARTS; i++) { Part *q = &PARTS[i]; float s = q->s; EMIT(.8f, box(q->x - s / 2, q->y - s / 2, q->z, s, s, s * 30, q->c, 1)); }
	rStream(2);
	for (int i = 0; i < NFX; i++) {
		Fx *f = &FX[i];
		switch (f->k) {
		case FX_RING: { float p = fmaxf(0, 1 - f->t / f->mx); EMIT(1, flatRing(f->x, f->y, 1, f->r * p, f->r * p, .12f, f->c, (u8)(clampf(f->t / f->mx, 0, 1) * 220))); break; }
		case FX_AREA: { float p = 1 - f->t / f->mx; EMIT(1, flatRing(f->x, f->y, 1, f->r * (.3f + .7f * p), f->r * (.3f + .7f * p), .18f, 0xffffff, (u8)(200 * (1 - p)))); break; }
		case FX_WARN: { float p = 1 - f->t / f->mx; EMIT(.7f, flatEllipse(f->x, f->y, .6f, f->r, f->r, 0xff281e, (u8)(40 + p * 64))); EMIT(1, flatRing(f->x, f->y, .7f, f->r * p, f->r * p, .08f, 0xff5028, 230)); break; }
		case FX_BOOM: { float p = 1 - f->t / .4f; EMIT(1, flatRing(f->x, f->y, .8f, f->r * p, f->r * p, .2f, 0xff783c, (u8)(clampf(f->t * 2.5f, 0, 1) * 255))); break; }
		case FX_ARC: { float a = clampf(f->t / f->mx, 0, 1), sp = f->dmg, a0 = f->x2; int n = 9;
			for (int k = 0; k <= n; k++) { float an = a0 + sp * k / n, rr = f->r * (.75f + .25f * (1 - a)); EMIT(1, boxA(f->x + cosf(an) * rr - .07f, f->y + sinf(an) * rr - .07f, 12, .14f, .14f, 5, f->c, 1, (u8)(a * 210))); } break; }
		case FX_TRAIL: { float a = clampf(f->t * 4, 0, 1); float dx = f->x2 - f->x, dy = f->y2 - f->y;
			for (int k = 0; k < 6; k++) { float q = k / 6.f; EMIT(1, boxA(f->x + dx * q - .06f, f->y + dy * q - .06f, 8, .12f, .12f, 8, 0xc8f0ff, 1, (u8)(a * 150 * q))); } break; }
		}
	}
	rStream(1);
}
