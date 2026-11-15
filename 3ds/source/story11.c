// Voxelia 3DS 1.8 / DS 1.4 - la Minaccia del Regno, le notti pericolose e le invasioni (8.6 del browser:
// src/combattimento/8zzzzq_minaccia.js e 8zzzzr_notti.js).
// La Minaccia va da 0 (Quieta) a 10 (Il Crepuscolo): sale con la storia (frammenti, Malakar, il vero finale, i Custodi
// dell'Atto II) e con i giorni di gioco passati con l'eroe (24 minuti veri l'uno, fino a +4). A Facile sale al 60%.
// Vale nei dungeon e nelle zone aperte della Storia. Le mosse nuove dei nemici sono tutte annunciate (cerchi rossi).
#include "voxelia.h"
#include "story.h"
#define C_TXT C2D_Color32(232, 236, 244, 255)
#define C_MU C2D_Color32(154, 164, 184, 255)
#define C_GOLD C2D_Color32(245, 185, 66, 255)
#define RGB32(c) C2D_Color32((c) >> 16, ((c) >> 8) & 255, (c) & 255, 255)

extern J *dataRoot(void);
extern void fxWarn(float x, float y, float r, float t, float dmg);
extern void projAdd(float x, float y, float vx, float vy, float t, float d, u32 c);
extern void hurtPfrom(float at);
extern void dropItemAt(Item it, float x, float y);
extern void xSetPage(int p);
extern float a2Pts(void);
extern int faceOf(float dx, float dy);
static inline float dst(float ax, float ay, float bx, float by) { return hyp(ax - bx, ay - by); }
enum { XP_TH = 41 };

static const char *THN[11] = {"Quieta", "Inquieta", "Agitata", "Ostile", "Minacciosa", "Pericolosa", "Feroce", "Spietata", "Terribile", "Apocalittica", "Il Crepuscolo"};
static const u32 THC[11] = {0x9ad08a, 0xc8d070, 0xe8c060, 0xf0a050, 0xf08a40, 0xf06a3a, 0xe8503a, 0xd83a4a, 0xc02a5a, 0xa01a6a, 0x7a2ad0};
static const char *thDesc(int i) { J *d = jget(jget(dataRoot(), "TH86"), "D"); return jstr(jat(d, i), ""); }

/* ---- il livello ---- */
static bool easy(void) { return P.df == 0; }
static float thStory(void) {
	int st = P.st, sh = 0; for (int i = 0; i < 6; i++) if (P.sh & (1u << i)) sh++;
	static const float S[6] = {0, 0, 2.5f, 3, 3.5f, 4};
	float s = st >= 5 ? 4 : st == 1 ? fminf(2.3f, .5f + .3f * sh) : S[st < 0 ? 0 : st];
	if (X.te >= 2) s += 1;
	return s + a2Pts();
}
static float thDays(void) { return fminf(4, X.thD * .25f); }
static float thVal(void) { float v = thStory() + thDays() - X.thSub; if (easy()) v *= .6f; return v < 0 ? 0 : v > 10 ? 10 : v; }
int thLevel(void) { return (int)floorf(thVal() + 1e-6f); }
void thSubAt(float s) { if (X.thSub < s) X.thSub = s; }
// dove vale: i dungeon e le zone aperte (non la città, l'arena, gli interni, la Torre, le dimensioni)
static bool thHere(void) {
	if (!strcmp(Zk, "town") || !strcmp(Zk, "arena") || ZINT || !strncmp(Zk, "torre", 5) || !strncmp(Zk, "dim_", 4) || !strncmp(Zk, "mare", 4)) return false;
	extern int ZLV0; return ZDG >= 0 || ZLV0 > 0 || ZOUT;
}
int thCur(void) { return thHere() ? thLevel() : 0; }

/* ---- i ritardi (le mosse annunciate che arrivano dopo un attimo) ---- */
typedef struct { float t; u32 uid; u8 k; } TJ;
static TJ JB[24]; static int NJB;
static void later(float t, Ent *e, u8 k) { if (NJB < 24) JB[NJB++] = (TJ){t, e ? e->uid : 0, k}; }
static Ent *byUid(u32 u) { for (int i = 0; i < NENT; i++) if (ents[i].k == K_EN && ents[i].uid == u && ents[i].hp > 0) return &ents[i]; return NULL; }

/* ---- i ruoli ---- */
enum { RO_NONE = 1, RO_PLAIN, RO_RNG, RO_HEAVY, RO_AGILE, RO_GUARD };
static int role(Ent *e) {
	if (e->t1.role) return e->t1.role;
	const EnemyDef *b = &E[e->t]; int r = RO_PLAIN;
	if (e->boss || b->np) r = RO_NONE; else if (b->rng) r = RO_RNG; else if (b->hp >= 110 && b->sp <= 1.7f) r = RO_HEAVY; else if (b->sp >= 2.4f) r = RO_AGILE; else if (b->kind && !strcmp(b->kind, "h") && b->hp >= 30) r = RO_GUARD;
	return e->t1.role = r;
}
static bool busy(Ent *e) { return e->t1.wu > gtime || e->t1.ds > 0 || e->t1.gb > gtime || e->cbs > gtime; }
static void line(float x0, float y0, float x1, float y1, float t, float d) {
	float L = hyp(x1 - x0, y1 - y0); int n = (int)fmaxf(2, roundf(L / .7f));
	for (int i = 1; i <= n; i++) { float u = i / (float)n, x = x0 + (x1 - x0) * u, y = y0 + (y1 - y0) * u; int ix = (int)x, iy = (int)y; if (ix < 0 || iy < 0 || ix >= N || iy >= N || !WK(M[iy][ix])) break; fxWarn(x, y, .62f, t, d); }
}

/* ---- i Campioni: i poteri ---- */
enum { AF_SCUDO = 1, AF_VELOCE = 2, AF_VAMPIRO = 4, AF_ESPL = 8, AF_EVOC = 16 };
static const char *AFN[5] = {"Scudo", "Veloce", "Vampiro", "Esplosivo", "Evocatore"};
static void afGive(Ent *e, int L) {
	if (e->t1.af || !e->champ || e->boss) return;
	int n = L >= 9 ? 3 : L >= 5 ? 2 : L >= 1 ? 1 : 0; if (!n) return;
	char sk[64]; snprintf(sk, sizeof sk, "af86|%s|%d|%s", Zk, e->id, E[e->t].id); u32 s = hs(sk);
	int K[5] = {0, 1, 2, 3, 4};
	for (int i = 4; i > 0; i--) { s = s * 1664525u + 1013904223u; int j = (s >> 8) % (i + 1); int t = K[i]; K[i] = K[j]; K[j] = t; }
	char nm[48]; int o = snprintf(nm, sizeof nm, "%s ·", e->name);
	for (int i = 0; i < n; i++) { e->t1.af |= 1 << K[i]; o += snprintf(nm + o, sizeof nm - o, "%s%s", i ? ", " : " ", AFN[K[i]]); }
	snprintf(e->name, sizeof e->name, "%s", nm);
	e->hp = e->mx = roundf(e->mx * (n >= 2 ? .8f : .88f)); e->at *= n >= 2 ? .88f : .94f;
	if (e->t1.af & AF_SCUDO) { e->t1.bar = e->t1.bmx = (u16)fminf(60000, roundf(e->mx * .2f)); e->t1.bt = 0; e->t1.brf = 1; }
	if (e->t1.af & AF_VELOCE) { e->sp *= 1.25f; e->cd *= .82f; }
}
// un nemico nuovo: più vita e più attacco con la Minaccia, e i poteri ai Campioni
void thMk(Ent *e) {
	if (!thHere() || E[e->t].np) return;
	int L = thLevel(); if (L <= 0) return;
	e->hp = e->mx = roundf(e->mx * (1 + .02f * L)); if (!e->boss) e->at *= 1 + .015f * L;
	if (L >= 4 && !e->boss) e->cd *= fmaxf(.88f, 1 - .02f * (L - 3));
	e->t1.lv = L;
	if (e->champ) afGive(e, L);
}

/* ---- i colpi dell'eroe: lo scudo dei Campioni, la guardia, la schivata ---- */
int thHit(Ent *e, int d) {
	if (e->pup || d <= 0) return d;
	int L = e->t1.lv > thCur() ? e->t1.lv : thCur();
	if (e->t1.bar > 0) {
		int a = d < e->t1.bar ? d : e->t1.bar; e->t1.bar -= a; d -= a; e->t1.bt = gtime;
		if (e->t1.bar <= 0) { flt(e->px, e->py, "Scudo infranto!", 0x9ad0ff); tone(1500, .08f, W_SQUARE, .04f); sparks(e->px, e->py, 16, 0x9ad0ff, 70); }
		else { char b[16]; snprintf(b, sizeof b, "-%d", a); flt(e->px, e->py, b, 0x9ad0ff); }
		if (d <= 0) { e->al = 1; return 0; }
	}
	if (L <= 0) return d;
	if (e->t1.gd > gtime) {
		int need = L >= 6 ? 3 : 2;
		if (++e->t1.gh >= need) { e->t1.gd = 0; e->t1.gh = 0; e->t1.gb = gtime + 1.3f; e->cdt = fmaxf(e->cdt, 1.4f); flt(e->px, e->py, "Guardia rotta!", 0xffd84a); tone(260, .12f, W_SQUARE, .05f); sparks(e->px, e->py, 14, 0xffd84a, 70); return (int)roundf(d * 1.25f); }
		flt(e->px, e->py, "Parata!", 0xd8e0ff); tone(1300, .05f, W_SQUARE, .04f); return d * .2f < 1 ? 1 : (int)roundf(d * .2f);
	}
	if (role(e) == RO_AGILE && L >= 2 && !busy(e) && e->t1.dg <= gtime && dst(e->px, e->py, P.px, P.py) < 3.2f && frnd() < fminf(.24f, .12f + .02f * (L - 2))) {
		e->t1.dg = gtime + (L >= 6 ? 3 : 4);
		float dx = e->px - P.px, dy = e->py - P.py, dd = fmaxf(.01f, hyp(dx, dy)), s = frnd() < .5f ? 1 : -1;
		for (int i = 0; i < 6; i++) mv(&e->px, &e->py, -dy / dd * s * .16f + dx / dd * .05f, dx / dd * s * .16f + dy / dd * .05f);
		flt(e->px, e->py, "Schiva!", 0x8ce7ff); e->al = 1; return 0;
	}
	return d;
}

/* ---- l'intelligenza nuova: true se il nemico questa volta non fa il giro normale ---- */
bool thAI(Ent *e, float d, float dt) {
	if (e->boss || e->pup) return false;
	int L0 = thCur(); if (!L0 && !e->t1.lv) return false;
	int R = role(e); if (R == RO_NONE) return false;
	int L = e->t1.lv > L0 ? e->t1.lv : L0;
	T86 *t = &e->t1;
	if (t->ds > 0) {   // lo scatto della carica
		t->ds -= dt; float s = 9 * dt, x0 = e->px, y0 = e->py; mv(&e->px, &e->py, t->wdx * s, t->wdy * s); e->face = faceOf(t->wdx, t->wdy); e->mvT = gtime;
		if (t->ds <= 0 || hyp(e->px - x0, e->py - y0) < s * .3f) { t->ds = 0; e->cdt = fmaxf(e->cdt, .6f); }
		return true;
	}
	if (t->wu > 0) {
		if (t->wu > gtime) { e->cdt = fmaxf(e->cdt, .3f); return true; }
		t->wu = 0; if (t->wk == 1) t->ds = t->wlen / 9; else if (t->wk == 2) e->cdt = e->cd * 1.2f;
		return true;
	}
	if (t->gb > gtime) { e->cdt = fmaxf(e->cdt, .3f); return true; }
	if (!e->al || d > 9 || P.hp <= 0) return false;
	if (t->gd > gtime) {   // in guardia: avanza piano e non attacca
		if (d > e->r * .9f) { float k = e->sp * .35f * dt / fmaxf(d, .01f); mv(&e->px, &e->py, (P.px - e->px) * k, (P.py - e->py) * k); e->face = faceOf(P.px - e->px, P.py - e->py); }
		e->cdt = fmaxf(e->cdt, .25f); return true;
	}
	if (R == RO_GUARD && L >= 1 && d < 3.2f && t->gn <= gtime) {
		int gdn = 0; for (int i = 0; i < NENT; i++) if (ents[i].k == K_EN && ents[i].t1.gd > gtime) gdn++;
		if (gdn < (L >= 6 ? 3 : 2)) { t->gn = gtime + fmaxf(3.2f, 6.5f - L * .3f) + frnd() * 2;
			if (frnd() < .65f) { t->gd = gtime + 1.7f; t->gh = 0; flt(e->px, e->py, "In guardia", 0x9ad0ff); tone(700, .04f, W_SQUARE, .03f); return true; } }
	}
	if (L >= 3 && (R == RO_AGILE || R == RO_GUARD || R == RO_PLAIN) && d > 2.6f && d < 6.2f && t->cn <= gtime) {
		t->cn = gtime + fmaxf(4.5f, 9.5f - L * .45f) + frnd() * 2;
		if (frnd() < .55f) { float dx = (P.px - e->px) / d, dy = (P.py - e->py) / d, len = fminf(d + 1.2f, 6.6f), tt = L >= 6 ? .55f : .7f;
			t->wu = gtime + tt; t->wk = 1; t->wdx = dx; t->wdy = dy; t->wlen = len; line(e->px, e->py, e->px + dx * len, e->py + dy * len, tt + len / 9 * .6f, e->at * 1.05f);
			flt(e->px, e->py, "Carica!", 0xff8a5a); tone(140, .25f, W_SAW, .04f); return true; }
	}
	if (R == RO_HEAVY && L >= 3 && d <= e->r * 1.1f && e->cdt <= 0) {
		if (++t->hv % 2 == 0) { float dx = (P.px - e->px) / fmaxf(d, .01f), dy = (P.py - e->py) / fmaxf(d, .01f);
			t->wu = gtime + .85f; t->wk = 2; fxWarn(e->px + dx * .8f, e->py + dy * .8f, 1.55f, .85f, e->at * 1.4f); e->atkT = gtime + .65f; e->atkD[0] = dx; e->atkD[1] = dy;
			flt(e->px, e->py, "Colpo pesante!", 0xff8a5a); tone(90, .3f, W_SAW, .05f); return true; }
	}
	if (R == RO_RNG && L >= 1 && d < 2.3f && t->kp <= gtime) {
		if (t->kt < gtime - 2.4f) t->kt = gtime;
		if (gtime - t->kt < .9f) { float s = e->sp * .95f * dt / fmaxf(d, .01f); mv(&e->px, &e->py, (e->px - P.px) * s, (e->py - P.py) * s); e->cdt = fmaxf(e->cdt, .35f); return true; }
		t->kp = gtime + 2.6f;
	}
	return false;
}
// arcieri e maghi: dal livello 5 a ventaglio
void thShoot(Ent *e) {
	if (e->boss || e->pup || thCur() < 5 || frnd() >= .45f || !NPJ) return;
	Proj p = PJ[NPJ - 1]; float a = atan2f(p.vy, p.vx), v = hyp(p.vx, p.vy);
	for (int k = -1; k <= 1; k += 2) projAdd(p.x, p.y, cosf(a + k * .26f) * v, sinf(a + k * .26f) * v, p.t, roundf(p.d * .5f), p.c);
}

/* ---- i boss: la Croce, l'Anello, l'Ultimo Respiro ---- */
static void cross(Ent *e, float t) { e->t1.ph += .4f; for (int k = 0; k < 4; k++) { float a = k * 1.5708f + e->t1.ph; line(e->px, e->py, e->px + cosf(a) * 7, e->py + sinf(a) * 7, t, e->at * 1.1f); } }
static void ring(Ent *e, float t) { int gap = fri(0, 11); for (int i = 0; i < 12; i++) { if (i == gap || i == (gap + 1) % 12) continue; float a = i / 12.f * 6.283f; fxWarn(P.px + cosf(a) * 2.4f, P.py + sinf(a) * 2.4f, .95f, t, e->at * 1.2f); } }
static void thBossTick(void) {
	int L = thCur(); if (L < 3) return;
	extern bool t10Occ(void); if (t10Occ()) return;
	for (int i = 0; i < NENT; i++) {
		Ent *e = &ents[i]; if (e->k != K_EN || !e->boss || e->pup || !e->al || e->hp <= 0 || E[e->t].np || e->wb) continue;
		if (dst(e->px, e->py, P.px, P.py) > 14 || e->bstn > gtime || e->bshd > gtime) continue;
		int ph = e->hp > e->mx * .66f ? 1 : e->hp > e->mx * .33f ? 2 : 3;
		if (L >= 8 && !e->t1.lb && e->hp < e->mx * .12f) {
			e->t1.lb = 1; e->bshd = gtime + 1.4f; flt(e->px, e->py, "Ultimo respiro!", 0xff3a6a); msg("%s raccoglie le ultime forze!", e->name); tone(60, .8f, W_SAW, .08f); shake = .8f; fxRing(e->px, e->py, 1.2f, 3.5f, 0xff3c64);
			later(1.4f, e, 1); continue;
		}
		if (ph < 2) continue;
		if (!e->t1.bx) e->t1.bx = gtime + 3;
		if (gtime < e->t1.bx) continue;
		e->t1.bx = gtime + fmaxf(5, 9 - L * .35f) + frnd() * 2;
		if (ph >= 3 && L >= 5 && frnd() < .55f) { ring(e, 1.1f); flt(e->px, e->py, "Anello!", 0xff8a5a); } else { cross(e, 1.05f); flt(e->px, e->py, "Croce!", 0xff8a5a); }
		tone(110, .3f, W_SAW, .05f);
	}
}
/* ---- i poteri dei Campioni mentre combattono, la furia del branco che passa ---- */
static void afTick(void) {
	for (int i = 0; i < NENT; i++) {
		Ent *e = &ents[i]; if (e->k != K_EN || e->pup || e->hp <= 0) continue;
		if (e->t1.fu > 0 && e->t1.fu < gtime) { e->t1.fu = 0; e->sp /= 1.15f; e->at /= 1.15f; }
		if (!e->t1.af) continue;
		if (e->t1.bmx && e->t1.brf > 0 && e->t1.bar <= 0 && gtime - e->t1.bt > 7) { e->t1.brf--; e->t1.bar = e->t1.bmx; flt(e->px, e->py, "Scudo", 0x9ad0ff); fxRing(e->px, e->py, .6f, 1.2f, 0x96d2ff); }
		if ((e->t1.af & AF_VAMPIRO) && e->al && dst(e->px, e->py, P.px, P.py) < 1.9f && P.hp > 0 && e->t1.vp <= gtime) {
			e->t1.vp = gtime + 1.2f; float h0 = P.hp; hurtPfrom(e->at * .25f); float got = fmaxf(0, h0 - P.hp) * .8f;
			if (got > 0) { e->hp = fminf(e->mx, e->hp + got); char b[16]; snprintf(b, sizeof b, "+%d", (int)roundf(got)); flt(e->px, e->py, b, 0xff6a7a); }
		}
		if (e->t1.af & AF_EVOC) {
			int st = e->hp < e->mx * .5f ? 1 : 0;
			if (st > e->t1.ev) { e->t1.ev = st; int ne = 0; for (int k = 0; k < NENT; k++) if (ents[k].k == K_EN) ne++;
				if (ne < 18) { flt(e->px, e->py, "Evoca rinforzi!", 0xc46bff); fxRing(e->px, e->py, .8f, 1.8f, 0xc46bff); int t = e->t; float ex = e->px, ey = e->py;
					for (int k = 0; k < 2; k++) { float an = k * 3.14f + gtime; int x, y; nearFree(clampi((int)floorf(ex + cosf(an) * 1.6f), 1, N - 2), clampi((int)floorf(ey + sinf(an) * 1.6f), 1, N - 2), &x, &y); if (WK(M[y][x])) { Ent *m = mkEn(t, x, y); if (m) m->al = 1; } }
					e = &ents[i]; } }
		}
	}
}
void thKill(Ent *dead) {
	if (dead->pup || dead->t < 0) return;
	int L = thCur();
	if (dead->t1.af & AF_ESPL) { fxWarn(dead->px, dead->py, 2.2f, 1.1f, dead->at * 1.8f); flt(dead->px, dead->py, "Sta per esplodere!", 0xff8a2a); tone(200, .4f, W_SQUARE, .04f); }
	if (L >= 7 && !dead->boss) for (int i = 0; i < NENT; i++) {
		Ent *o = &ents[i]; if (o->k != K_EN || o->boss || o->pup || o->t1.fu > 0 || dst(o->px, o->py, dead->px, dead->py) >= 3.5f) continue;
		o->t1.fu = gtime + 5; o->sp *= 1.15f; o->at *= 1.15f; flt(o->px, o->py, "Furia!", 0xff5a3a);
	}
	if (dead->t1.iv && X.ivOn) {}   // l'invasione conta i suoi nemici da sola
}

/* ---- i guerrieri in guardia e gli scudi dei Campioni si riconoscono ---- */
void thDraw(Ent *e) {
	if (e->k != K_EN) return;
	if (e->t1.gd > gtime) { boxA(e->px - .13f, e->py - .03f, 44, .26f, .06f, 9, 0x9ad0ff, 1.3f, 255); boxA(e->px - .05f, e->py - .04f, 47, .1f, .06f, 3, 0xffffff, 1.4f, 255); }
	if (e->t1.bar > 0 && e->t1.bmx) { int n = 10; float k = e->t1.bar / (float)e->t1.bmx; for (int i = 0; i < n && i / (float)n <= k; i++) { float a = i / (float)n * 6.283f + gtime * 1.2f; boxA(e->px + cosf(a) * .46f - .04f, e->py + sinf(a) * .46f - .04f, 10, .08f, .08f, 5, 0x9ad0ff, 1.4f, 255); } }
	if (e->t1.wu > gtime && sinf(gtime * 30) > 0) boxA(e->px - .04f, e->py - .04f, 46, .08f, .08f, 8, 0xff5a3a, 1.5f, 255);
}

/* ---- le notti pericolose ---- */
static float ntNext; static bool ntSaid;
static s16 BD[MAXN * MAXN];
static int zonePool(int *T, int max) {   // le specie che vivono qui (dai nemici della zona)
	int n = 0; for (int i = 0; i < NENT && n < max; i++) { Ent *e = &ents[i]; if (e->k != K_EN || e->boss || e->pup || E[e->t].np || e->t1.nt || e->t1.iv) continue; bool has = false; for (int k = 0; k < n; k++) if (T[k] == e->t) has = true; if (!has) T[n++] = e->t; }
	return n;
}
static int ZPOOL[12], NZPOOL;
static void ntTick(void) {
	if (P.hp <= 0 || ZDG >= 0 || NK <= .5f) return;
	if (strcmp(Zk, "forest") && strcmp(Zk, "desert") && strcmp(Zk, "peaks") && strcmp(Zk, "giungla48")) return;
	int L = thCur(); if (L < 2) return;
	if (!X.ntSaid && !ntSaid) { ntSaid = true; X.ntSaid = 1; banner("Una notte pericolosa", "Con la Minaccia del Regno, di notte dal buio arrivano altre creature. Torna di giorno, o resta vicino alla luce."); }
	if (gtime < ntNext) return;
	ntNext = gtime + fmaxf(16, 40 - L * 2.4f) + frnd() * 8;
	if (!NZPOOL) return;
	int mine = 0, all = 0; for (int i = 0; i < NENT; i++) if (ents[i].k == K_EN) { all++; if (ents[i].t1.nt) mine++; }
	if (mine >= 2 + L / 3 || all > 70) return;
	bfs((int)P.px, (int)P.py, BD);
	int n = L >= 6 ? 2 : 1;
	for (int k = 0; k < n; k++) for (int tries = 0; tries < 200; tries++) {
		int x = fri(1, N - 2), y = fri(1, N - 2); int v = BD[y * N + x]; if (v < 0 || v >= 22 || M[y][x] != 0 || !WK(M[y][x])) continue;
		float q = hyp(x - P.px, y - P.py); if (q < 8 || q > 13) continue;
		Ent *e = mkEn(ZPOOL[fri(0, NZPOOL - 1)], x, y); if (!e) break;
		e->t1.nt = 1; e->al = 1; e->ag *= 1.6f; e->at *= 1.1f; char b[48]; snprintf(b, sizeof b, "%s della notte", e->name); snprintf(e->name, sizeof e->name, "%s", b); sparks(e->px, e->py, 10, 0x9a8aff, 40);
		break;
	}
}

/* ---- le invasioni ---- */
static const char *IVZ[3] = {"porto", "campi", "nord"};
static const char *IVZN[3] = {"Il Porto", "I Campi dell'Est", "Il Quartiere Nobile"};
static const char *IVP[3][4] = {{"bandito", "teppista", "goblin", "lupo"}, {"bandito", "cavaliere", "ghoul", "pirata"}, {"cavaliere_vuoto", "ombra", "cavaliere", "demone"}};
static bool ivAct(void) { return X.ivOn && X.ivZ < 3; }
static float ivSp; static float ivWt;
static void ivWave(void);
static void ivStart(int z) {
	X.ivN++; X.ivZ = z; X.ivSt = X.thD; X.ivEnd = X.thD + .25f; X.ivW = 0; X.ivOn = 1; X.ivId = X.ivN; ivSp = 0;
	char b[64]; snprintf(b, sizeof b, "Invasione! %s", IVZN[z]); banner(b, "I predoni attaccano il quartiere: hai 6 ore di gioco per difenderlo.");
	JINGLE(.16f, W_SAW, 55, 58, 62, 55); saveGame();
}
static void ivLose(void) {
	X.ivOn = 0; X.ivLost++; X.ivPen = X.thD + 1;
	for (int i = 0; i < NENT; i++) if (ents[i].k == K_EN && ents[i].t1.iv) entDel(&ents[i]);
	char b[64]; snprintf(b, sizeof b, "%s saccheggiato", IVZN[X.ivZ]); banner(b, "Nessuno ha fermato i predoni: per un giorno i prezzi dei negozi sono più alti del 10%."); saveGame();
}
static void ivWin(void) {
	X.ivOn = 0; X.ivWon++; int lv = P.lv > 1 ? P.lv : 1, gd = 150 + lv * 25, xp = 100 + lv * 30; P.g += gd; gainXP(xp);
	dropItemAt(mkItem(lv > ZLV ? lv : ZLV, 2, -1), P.px + .6f, P.py + .3f);
	char a[64], b[128]; snprintf(a, sizeof a, "%s è salvo!", IVZN[X.ivZ]); snprintf(b, sizeof b, "Hai respinto l'invasione: +%d oro, +%d esperienza e un oggetto raro. Invasioni respinte: %d", gd, xp, X.ivWon);
	banner(a, b); JINGLE(.12f, W_TRIANGLE, 60, 64, 67, 72, 76); saveGame();
}
static void ivSched(void) {
	if (P.st < 1 || thLevel() < 3) return;
	if (ivAct()) { if (X.thD >= X.ivEnd) ivLose(); return; }
	int slot = (int)floorf((X.thD - .35f) / 2); if (slot < 1 || slot <= X.ivLs) return;
	X.ivLs = slot; char k[48]; snprintf(k, sizeof k, "iv86|%s|%d", P.name, slot); ivStart(hs(k) % 3);
}
static void ivWave(void) {
	if (!ivAct() || strcmp(Zk, IVZ[X.ivZ])) return;
	X.ivW++; int L = thLevel(), n = 3 + X.ivW + L / 3; if (n > 9) n = 9;
	int pi = L >= 7 ? 2 : L >= 5 ? 1 : 0, T[4], nt = 0; for (int i = 0; i < 4; i++) { int t = enemyIdx(IVP[pi][i]); if (t >= 0) T[nt++] = t; }
	if (!nt) return;
	bfs((int)P.px, (int)P.py, BD);
	int cx = -1, cy = -1, best = -1;
	for (int k = 0; k < 300; k++) { int x = fri(1, N - 2), y = fri(1, N - 2), v = BD[y * N + x]; if (v < 0 || !WK(M[y][x])) continue; float q = hyp(x - P.px, y - P.py); if (q < 7 || q > 15) continue; if (v > best) { best = v; cx = x; cy = y; } }
	if (cx < 0) return;
	for (int i = 0; i < n; i++) {
		int x, y; nearFree(cx + fri(-2, 2), cy + fri(-2, 2), &x, &y); if (!WK(M[y][x])) continue;
		Ent *e = mkEn(T[i % nt], x, y); if (!e) break; e->t1.iv = 1; e->al = 1; e->ag = 30;
		if (X.ivW == 3 && i == 0) { e->hp = e->mx = roundf(e->mx * 1.9f); e->at *= 1.3f; e->sp *= 1.1f; e->xp *= 2.5f; e->scl = 1.14f; e->champ = 1; snprintf(e->name, sizeof e->name, "Capitano dei predoni"); e->t1.af = 0; afGive(e, L > 4 ? L : 4); }
	}
	ivSp = 1; msg(X.ivW < 3 ? "Arrivano i predoni: ondata %d di 3!" : "L'ultima ondata: c'è il loro Capitano!", X.ivW); tone(110, .4f, W_SAW, .06f); shake = .4f;
}
static void ivTick(float dt) {
	if (!ivAct() || strcmp(Zk, IVZ[X.ivZ])) return;
	if (!ivSp) { ivWave(); return; }
	for (int i = 0; i < NENT; i++) if (ents[i].k == K_EN && ents[i].t1.iv) { ivWt = 0; return; }
	if (X.ivW < 3) { ivWt += dt; if (ivWt > 2.5f) { ivWt = 0; ivWave(); } return; }
	ivWin();
}
float thPriceMul(void) { return X.ivPen > X.thD ? 1.1f : 1; }

/* ---- il giro: i giorni, l'annuncio, le notti, le invasioni, i ritardi ---- */
static int thLast = -1; static float thSc;
void thZone(void) {
	ntNext = gtime + 8; NJB = 0; NZPOOL = zonePool(ZPOOL, 12);
	if (ivAct() && !strcmp(Zk, IVZ[X.ivZ])) { ivSp = 0; ivWt = 0; if (X.ivW > 0) X.ivW--; }
}
void thTick(float dt) {
	if (!started) return;
	if (dt > 0 && dt < 1) X.thD += dt / 1440;
	int L = thLevel();
	if (thLast < 0) { thLast = L; if (L > X.thMax) X.thMax = L; if (!X.thIntro && L >= 1) { X.thIntro = 1; char b[160]; snprintf(b, sizeof b, "Adesso è %d · %s. Sale con la storia e con i giorni: la vedi sul touch, sotto la zona.", L, THN[L]); banner("Novità: la Minaccia del Regno", b); } }
	else if (L > X.thMax) { X.thMax = L; X.thIntro = 1; char a[64]; snprintf(a, sizeof a, "Minaccia del Regno: %s", THN[L]); banner(a, thDesc(L)); tone(80, .5f, W_SAW, .05f); saveGame(); }
	thLast = L;
	for (int i = 0; i < NJB; i++) { TJ *j = &JB[i]; j->t -= dt; if (j->t > 0) continue; Ent *e = byUid(j->uid);
		if (e && j->k == 1) { cross(e, 1); for (int k = 0; k < 18; k++) { float an = k * 6.283f / 18; projAdd(e->px, e->py, cosf(an) * 5.5f, sinf(an) * 5.5f, 2.2f, e->at * .8f, 0xff3a6a); } }
		JB[i--] = JB[--NJB]; }
	if (thCur()) { thBossTick(); }
	afTick();
	ntTick(); ivTick(dt);
	if ((thSc += dt) > 1) { thSc = 0; ivSched(); }
}
// sul touch, sotto la zona
const char *thHud(u32 *col) {
	static char b[96]; int L = thLevel();
	if (ivAct()) { float m = (X.ivEnd - X.thD) * 1440; if (m < 0) m = 0; snprintf(b, sizeof b, "Minaccia %d · %s%s  ·  Invasione: %s %d:%02d", L, THN[L], thHere() ? "" : " (qui no)", IVZN[X.ivZ], (int)m / 60, (int)m % 60); *col = 0xff9a6a; return b; }
	snprintf(b, sizeof b, "Minaccia %d · %s%s", L, THN[L], thHere() ? "" : " (qui no)"); *col = THC[L]; return b;
}
static char TB[2400];
int thBuild(int page) {
	if (page != XP_TH) return 0;
	int L = thLevel(), dd = (int)X.thD; float k = easy() ? .6f : 1;
	int o = snprintf(TB, sizeof TB, "Più vai avanti nella storia e più giorni passano, più il regno diventa pericoloso: i nemici imparano mosse nuove, i Campioni hanno poteri, i boss diventano più duri. Vale nei dungeon e nelle zone aperte.\n\nAdesso: %d · %s. Dalla storia +%.1f, dai giorni passati (%d) +%.1f (massimo +%s)%s%s",
		L, THN[L], thStory() * k, dd, thDays() * k, easy() ? "2.4" : "4", X.thSub > 0 ? ", l'alba di Eldora −1.5" : "", easy() ? ". A Facile sale più piano." : ".");
	if (X.ivN) o += snprintf(TB + o, sizeof TB - o, "\nInvasioni respinte %d, perse %d.", X.ivWon, X.ivLost);
	uiXTitle("La Minaccia del Regno", TB);
	for (int i = 0; i <= 10; i++) { char l[96]; snprintf(l, sizeof l, "%d %s", i, THN[i]); uiXOpt(l, "", XARG(210, i), i <= L ? RGB32(THC[i]) : C_MU, false); }
	uiXOpt("Chiudi", "", XARG(1, 0), 0, false);
	return 1;
}
int thAct(int a, int i) {
	if (a == 210) { msg("%d · %s: %s", i, THN[i], thDesc(i)); return 0; }
	return -1;
}
void thPause(void) { uiXOpt("La Minaccia del Regno", "", XARG(XA_GO, XP_TH), C_GOLD, false); }
