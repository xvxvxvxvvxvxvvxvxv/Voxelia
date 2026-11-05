// Voxelia 3DS - logica di gioco: eroe, combattimento, nemici, missioni, storia, negozi, salvataggi.
#include "voxelia.h"

Hero P;
bool started = false;
int MODE_DEAD = 0;
Ent *IT = NULL, *TGT = NULL;
float shake = 0;
float gtime = 0;
Fx FX[64]; int NFX = 0;
Pop POP[48]; int NPOP = 0;
Proj PJ[64]; int NPJ = 0;
Part PARTS[256]; int NPARTS = 0;
Settings SET = {1, 1, 1, 1, .5f, .7f, .72f, 0, 1, 1};
static float saveT = 20, bossT = 0;
static int lastDay = 0;
float zoneFade = 0; static int zonePending = 0; static char zoneTo[32], zoneFrom[32];
int arPts[4];
char WHO[24][96]; int NWHO = 0;

#define SAVEDIR "sdmc:/3ds/voxelia"
#define SAVEF SAVEDIR "/save.dat"
#define SETF SAVEDIR "/settings.dat"
#define SAVE_MAGIC 0x56584C33u
#define SAVE_VER 4

/* ---------------- statistiche dell'eroe ---------------- */
int atkV(void) { return (int)roundf((4 + P.lv * 2 + iv(&P.eq[SL_W])) * (P.bA > 0 ? 1.25f : 1)); }
int defV(void) { return (int)roundf((iv(&P.eq[SL_H]) + iv(&P.eq[SL_C]) + iv(&P.eq[SL_S])) * (P.bD > 0 ? 1.25f : 1)); }
int critV(void) { int c = 5; for (int i = 0; i < 4; i++) if (P.eq[i].used) c += P.eq[i].cr; return c; }
int maxHP(void) { int h = 60 + P.lv * 15; for (int i = 0; i < 4; i++) if (P.eq[i].used) h += P.eq[i].hp; return h; }
int needXP(void) { return (int)roundf(20 + P.lv * P.lv * 11.5f); }
void recalc(void) { P.mx = (int)roundf(maxHP() * xHpMul()); if (P.hp > P.mx) P.hp = P.mx; }

void flt(float x, float y, const char *s, u32 c) {
	if (NPOP >= 48) { memmove(POP, POP + 1, sizeof(Pop) * 47); NPOP = 47; }
	Pop *p = &POP[NPOP++]; p->x = x; p->y = y; p->t = 1; p->c = c; snprintf(p->s, sizeof p->s, "%s", s);
}
void fxRing(float x, float y, float r, float t, u32 c) {
	if (NFX >= 64) return;
	FX[NFX++] = (Fx){FX_RING, x, y, r, t, t, 0, 0, 0, c};
}
static void fxAdd(u8 k, float x, float y, float r, float t, float dmg) {
	if (NFX >= 64) return;
	FX[NFX++] = (Fx){k, x, y, r, t, t, dmg, 0, 0, 0};
}
void sparks(float x, float y, int n, u32 c, float sp) {
	for (int i = 0; i < n && NPARTS < 256; i++) {
		float a = frnd() * 6.283f, v = (.5f + frnd()) * sp / 60.f;
		PARTS[NPARTS++] = (Part){x, y, 10 + frnd() * 10, cosf(a) * v, sinf(a) * v, 20 + frnd() * 40, .5f + frnd() * .4f, .9f, c, .06f + frnd() * .05f};
	}
}

/* ---------------- tempo del gioco: un giorno dura 24 minuti ---------------- */
int gDay(void) { return (int)floorf(P.gt / 1440) + 1; }
float gHour(void) { float m = fmodf(P.gt, 1440); if (m < 0) m += 1440; return m / 60; }
void gClock(char *out) { float m = fmodf(P.gt, 1440); int mm = (int)m; sprintf(out, "%02d:%02d", mm / 60, mm % 60); }
static float nightK(float h) { if (h < 5 || h >= 21) return 1; if (h < 7) return 1 - (h - 5) / 2; if (h >= 18.5f) return (h - 18.5f) / 2.5f; return 0; }
static float duskK(float h) { float a = 1 - fabsf(h - 6.2f) / 1.3f, b = 1 - fabsf(h - 19.3f) / 1.5f; float m = a > b ? a : b; return m > 0 ? m : 0; }
static bool outdoor(void) { return ZOUT; }
static float nightXP(void) { return outdoor() && NK > .5f ? 1.2f : 1; }

/* ---------------- prezzi che cambiano ogni giorno ---------------- */
static float h01(const char *s) {
	u32 h = 2166136261u; for (; *s; s++) { h ^= (u8)*s; h *= 16777619u; }
	h ^= h >> 13; h *= 0x5bd1e995u; h ^= h >> 15; return (float)h / 4294967296.f;
}
static int dayEv(int d) { char b[16]; sprintf(b, "ev%d", d); float u = h01(b); return u < .14f ? 1 : u > .88f ? 2 : 0; }
static bool offerQ(const char *k, int d) { char b[48]; sprintf(b, "of%s%d", k, d); return h01(b) < .2f; }
static float pf(const char *k, int d) {
	char b[48]; sprintf(b, "%s:%d", k, d);
	float f = .75f + h01(b) * .6f; int e = dayEv(d);
	if (e == 1) f *= .8f; else if (e == 2) f *= 1.2f;
	if (offerQ(k, d)) f *= .65f;
	return f;
}
static float priceMul(void) { return (1 + .08f * P.st) * (1 + P.lv * .012f) * xPriceMul(); }
int px(const char *k, int b) { int v = (int)roundf(b * pf(k, gDay()) * priceMul()); return v < 1 ? 1 : v; }
int dayEvent(void) { return dayEv(gDay()); }
bool isOffer(const char *k) { return offerQ(k, gDay()); }
int upc(const Item *it) { return (int)roundf((40 + iv(it) * 3) * (1 + it->up * .8f)); }

/* ---------------- oggetti ---------------- */
bool pay(int c) {
	if (P.g < c) { msg("Oro insufficiente"); tone(150, .15f, W_SQUARE, .05f); return false; }
	P.g -= c; tone(1200, .06f, W_TRIANGLE, .05f); return true;
}
static void dropAt(Item it, float x, float y);
void dropItemAt(Item it, float x, float y) { dropAt(it, x, y); }
static void dropAt(Item it, float x, float y) {
	if (blk(x, y)) { int u, v; nearFree((int)x, (int)y, &u, &v); if (!blk(u + .5f, v + .5f)) { x = u + .5f; y = v + .5f; } }
	Ent *d = entNew(K_DR, x, y); if (d) d->it = it;
}
void gain(Item it) {
	char nm[40]; iname(&it, nm, sizeof nm);
	if (P.ninv < INV) { P.inv[P.ninv++] = it; msg("Raccolto: %s", nm); return; }
	dropAt(it, P.px + .4f, P.py + .3f);
	msg("Zaino pieno: %s è rimasto a terra", nm);
}
void eqp(int i) {
	if (i < 0 || i >= P.ninv) return;
	Item it = P.inv[i];
	Item old = P.eq[it.s];
	memmove(&P.inv[i], &P.inv[i + 1], sizeof(Item) * (P.ninv - i - 1)); P.ninv--;
	if (old.used) P.inv[P.ninv++] = old;
	P.eq[it.s] = it;
	recalc();
	JINGLE(.06f, W_TRIANGLE, 67, 72);
	char nm[40]; iname(&it, nm, sizeof nm); msg("Equipaggiato: %s", nm);
}
void sellItem(int i) {
	if (i < 0 || i >= P.ninv) return;
	P.g += P.inv[i].p;
	memmove(&P.inv[i], &P.inv[i + 1], sizeof(Item) * (P.ninv - i - 1)); P.ninv--;
	tone(1200, .06f, W_TRIANGLE, .05f);
}
int sellAll(bool all) {
	int n = 0, j = 0;
	for (int i = 0; i < P.ninv; i++) {
		if (!all && P.inv[i].r > 0) { P.inv[j++] = P.inv[i]; continue; }
		P.g += P.inv[i].p; n++;
	}
	P.ninv = j;
	if (n) tone(1200, .06f, W_TRIANGLE, .05f);
	return n;
}

/* ---------------- esperienza ---------------- */
void gainXP(int x) {
	P.xp += x;
	while (P.xp >= needXP()) {
		P.xp -= needXP(); P.lv++; recalc(); P.hp = P.mx;
		char b[64]; snprintf(b, sizeof b, "Attacco e vita aumentati. Ora sei al livello %d.", P.lv);
		banner("Livello superiore!", b);
		JINGLE(.1f, W_SQUARE, 72, 76, 79, 84);
		fxRing(P.px, P.py, 1.6f, .5f, 0xffc850);
		sparks(P.px, P.py, 18, 0xffd84a, 90);
	}
}
typedef struct { int d; bool cr; } Roll;
static Roll roll(float m) {
	float d = atkV() * m * wmMul() * torDmgMul() * (.8f + frnd() * .4f); bool cr = false;   // 7.44: +4% per livello di maestria; benedizioni della Torre
	if (P.pf > 0 || frnd() * 100 < critV() + torCritAdd()) { d *= 1.8f; cr = true; P.pf = 0; }
	Roll r = {(int)roundf(d), cr}; if (r.d < 1) r.d = 1; return r;
}

/* ---------------- combattimento ---------------- */
static float dist(Ent *a, float x, float y) { return hyp(a->px - x, a->py - y); }
void mv(float *px, float *py, float dx, float dy) { if (!blk(*px + dx, *py)) *px += dx; if (!blk(*px, *py + dy)) *py += dy; }
static void killEnt(Ent *e);
extern void netEnemyHit(int id, float frac);
static void killEnt(Ent *e);
void hurtEnemyRaw(Ent *e, int d, bool cr) {
	if (e->wb) { plBossHurt(e, d, cr); return; }   // il boss del mondo: la vita la tiene il server
	{ extern void netEnemyHitE(Ent *, float); netEnemyHitE(e, d / fmaxf(1, e->mx)); }
	e->hp -= d; e->fl = .12f; e->al = 1;
	if (e->pup) { e->hme = gtime; if (e->hp < 1) e->hp = 1; }   // copia di un nemico di un altro: cade quando cade per il padrone
	char b[16]; snprintf(b, sizeof b, cr ? "%d!" : "%d", d);
	flt(e->px, e->py, b, cr ? 0xffd84a : 0xffffff);
	tone(cr ? 330 : 220, .05f, W_SQUARE, .05f);
	if (cr) shake = fmaxf(shake, .12f);
	sparks(e->px, e->py, cr ? 8 : 4, cr ? 0xffd84a : 0xffffff, 60);
	if (e->hp <= 0) killEnt(e);
}
// i colpi dell'eroe: con l'elemento dell'arma (7.55)
static void hurtE(Ent *e, int d, bool cr) { d = bossDmg(e, d); if (d <= 0) return; wmHit(); torOnHit(d); const Item *w = &P.eq[SL_W]; int k = itemEl(w); xHurtEnemy(e, d, cr, k ? (k << 3) | itemElLv(w) : 0); }
void xHeroHit(Ent *e, float m) { Roll r = roll(m); hurtE(e, r.d, r.cr); }
static void die(void);
static void hurtP(float at);
void hurtPfrom(float at) { hurtP(at); }
static void hurtP(float at) {
	at *= torHurtMul();
	if (P.hp <= 0) return;
	if (P.iv > 0) { flt(P.px, P.py, "Schivata!", 0x8ce7ff); P.pf = 3; tone(900, .05f, W_TRIANGLE, .05f); return; }
	int d = (int)roundf(at * (.8f + frnd() * .4f) * 100 / (100 + defV() * 2));
	if (d < 1) d = 1;
	P.hp -= d; P.fl = .15f;
	char b[16]; snprintf(b, sizeof b, "%d", d); flt(P.px, P.py, b, 0xff6666);
	tone(110, .08f, W_SQUARE, .05f);
	shake = fmaxf(shake, .18f);
	if (d > P.mx * .15f && SET.shad) { u8 dummy = 0; (void)dummy; }
	if (P.hp <= 0) die();
}

// stima di dove far comparire il portale d'uscita: lontano dal bottino e dall'eroe
static void exitSpot(int x, int y, int *ox, int *oy) {
	static s16 d[MAXN * MAXN];
	bfs((int)P.px, (int)P.py, d);
	int bx = -1, by = -1; float bs = -1e9f;
	for (int v = y - 8; v <= y + 8; v++) for (int u = x - 8; u <= x + 8; u++) {
		if (u < 1 || v < 1 || u >= N - 1 || v >= N - 1 || !WK(M[v][u]) || d[v * N + u] < 0) continue;
		float r = hyp(u - x, v - y), rp = hyp(u + .5f - P.px, v + .5f - P.py);
		if (r < 3 || rp < 3) continue;
		bool busy = false;
		for (int i = 0; i < NENT; i++) { Ent *e = &ents[i]; if ((e->k == K_PO || e->k == K_NPC || e->k == K_CH || e->k == K_SHARD || e->k == K_DR) && fabsf(e->px - (u + .5f)) < 1.7f && fabsf(e->py - (v + .5f)) < 1.7f) { busy = true; break; } }
		if (busy) continue;
		int fr = 0; if (WK(M[v][u + 1])) fr++; if (WK(M[v][u - 1])) fr++; if (WK(M[v + 1][u])) fr++; if (WK(M[v - 1][u])) fr++;
		float sc = -fabsf(r - 4) * 2 + fminf(rp, 6) * .6f + fr;
		if (sc > bs) { bs = sc; bx = u; by = v; }
	}
	if (bx < 0) nearFree(x, y, &bx, &by);
	*ox = bx; *oy = by;
}
static float pendingMsgT = 0; static char pendingMsg[120];

/* ---------------- 7.44: le leve dei dungeon, da tirare insieme ----------------
   Nei piani dei dungeon (non in quello del boss) la scala che scende è chiusa da una grata: servono due leve tirate
   insieme. Ogni leva resta giù 18 secondi; tirandola escono dei guardiani. In rete contano anche quelle dei compagni. */
#define LVR_T 18
float levOn[2];
static char levOpen[16][40]; static int nLevOpen = 0;
bool levPeer[2], levPeerOpen;
static bool levIsOpen(void) { char rk[64]; rmKey(rk, sizeof rk); for (int i = 0; i < nLevOpen; i++) if (!strcmp(levOpen[i], rk)) return true; return false; }
static Ent *levDown(void) { for (int i = 0; i < NENT; i++) if (ents[i].k == K_PO && ents[i].seal) return &ents[i]; return NULL; }
static void levUnseal(bool quiet) {
	Ent *d = levDown();
	if (!levIsOpen() && nLevOpen < 16) { rmKey(levOpen[nLevOpen], 40); nLevOpen++; }
	if (!d) return;
	d->seal = 0;
	if (!quiet) { msg("Le leve scattano insieme: la grata si alza!"); JINGLE(.1f, W_TRIANGLE, 60, 67, 72, 79); sparks(d->px, d->py, 24, 0xffd84a, 80); fxRing(d->px, d->py, 2.2f, .9f, 0xffdc78); }
}
void levLoad(void) {
	levOn[0] = levOn[1] = -99; levPeer[0] = levPeer[1] = levPeerOpen = false;
	if (!levDown()) return;
	if (levIsOpen()) { levUnseal(true); return; }
	bool hasLev = false; for (int i = 0; i < NENT; i++) if (ents[i].k == K_LEV) hasLev = true;
	if (!hasLev) { levDown()->seal = 0; return; }
	snprintf(pendingMsg, sizeof pendingMsg, "La scala per il piano di sotto è chiusa da una grata: cerca le due leve e tirale insieme.");
	pendingMsgT = 2.6f;
}
bool levIsDown(Ent *e) { int i = e->lev[1] == '2'; return levOn[i] > gtime || levPeer[i] || !levDown(); }
float levLeft(Ent *e) { int i = e->lev[1] == '2'; return levOn[i] > gtime ? (levOn[i] - gtime) / LVR_T : levPeer[i] ? 1 : 0; }
static void levPull(Ent *e) {
	int i = e->lev[1] == '2';
	if (!levDown()) { msg("La leva è già bloccata: la grata è aperta."); return; }
	if (levOn[i] > gtime) { msg("La leva è già giù: %d secondi", (int)ceilf(levOn[i] - gtime)); return; }
	levOn[i] = gtime + LVR_T;
	tone(140, .25f, W_SQUARE, .06f); sparks(e->px, e->py, 10, 0xffd84a, 50);
	// i guardiani escono dall'ombra intorno alla leva
	if (ZDG >= 0 && DG[ZDG].nen) {
		int n = 0, ne = 0; for (int k = 0; k < NENT; k++) if (ents[k].k == K_EN) ne++;
		for (int k = 0; k < 3 && ne + n < 40; k++) {
			float a = k * 2.1f + frnd(); int x, y;
			nearFree(clampi((int)floorf(e->px + cosf(a) * 3), 1, N - 2), clampi((int)floorf(e->py + sinf(a) * 3), 1, N - 2), &x, &y);
			if (WK(M[y][x])) { Ent *m = mkEn(DG[ZDG].en[k % DG[ZDG].nen], x, y); if (m) { m->al = 1; n++; } }
		}
		if (n) flt(e->px, e->py, "Guardiani!", 0xff8a5a);
	}
	int o = !i;
	if (levOn[o] > gtime || levPeer[o]) msg("Leva tirata!");
	else msg("Leva tirata: hai %d secondi per tirare l'altra (o fatti aiutare da un compagno)!", LVR_T);
}
static void levTick(void) {
	if (ZDG < 0 || !levDown()) return;
	if (levPeerOpen) { levUnseal(false); return; }
	if ((levOn[0] > gtime || levPeer[0]) && (levOn[1] > gtime || levPeer[1])) levUnseal(false);
}
// le mie leve per la rete: "lvr":["L1"], "lvo":1 quando il piano è aperto
void levPack(char *out, int n) {
	out[0] = 0; if (ZDG < 0) return;
	char b[48] = ""; int k = 0;
	if (levOn[0] > gtime) k += snprintf(b + k, sizeof b - k, "\"L1\"");
	if (levOn[1] > gtime) k += snprintf(b + k, sizeof b - k, "%s\"L2\"", k ? "," : "");
	snprintf(out, n, "%s%s%s%s", k ? ",\"lvr\":[" : "", b, k ? "]" : "", levIsOpen() ? ",\"lvo\":1" : "");
}

static void dungeonClear(Ent *e) {
	int id = ZDG; const DungeonDef *d = &DG[id];
	int x = (int)e->px, y = (int)e->py, u, v;
	nearFree(x, y, &u, &v);
	Ent *c = entNew(K_CH, u + .5f, v + .5f); if (c) { c->rich = 1; c->hc = -1; }
	if (id < NSHARD && !(P.sh & (1u << id))) {
		nearFree(x + 1, y + 1, &u, &v);
		Ent *s = entNew(K_SHARD, u + .5f, v + .5f);
		if (s) { s->sid = id; snprintf(s->name, sizeof s->name, "Frammento della Corona"); }
	}
	exitSpot(x, y, &u, &v);
	char nm[96]; snprintf(nm, sizeof nm, "Uscita: %s", zoneTitle(d->ent));
	Ent *ep = mkPo(u + .5f, v + .5f, d->ent, PO_EXIT, nm); if (ep) ep->dgx = 1;
	if (P.done[id] < 250) P.done[id]++;
	if (netOk) netSendDgDone(d->id, ZRUN);   // in rete il ciclo è della stanza: lo aggiorna il server
	else if (P.runs[id] < 250) P.runs[id] = ZRUN + 1;
	snprintf(pendingMsg, sizeof pendingMsg, "Dungeon completato! Al prossimo ingresso si rigenererà, più forte (ciclo %d).", ZRUN + 2);
	pendingMsgT = 2.9f;
	if (d->fin && P.st == 3) {
		P.st = 4;
		uiOpenText("La caduta di Malakar", "Il Re Lich si dissolve in una nube di voxel neri. Torna dal Re Aldric al castello.", NULL);
	}
	saveGame();
}
static void questKill(Ent *e);
void killEnemy(Ent *e) { killEnt(e); }
bool zonePendingTor(void) { return zonePending; }
void actNoAsk(Ent *e) { e->xo = 1; act(e); }
static void killEnt(Ent *e) {
	if (chBossDown(e)) return;   // 7.48: il boss del dungeon si arrende (da soli)
	int lv = ZLV;
	const Diff *df = &DFS[P.df];
	Ent dead = *e;
	e->k = K_DEAD; e->t0 = gtime; e->fl = 0;
	float mb = 1 + malBonus();   // 7.44: le maledizioni danno più oro ed esperienza
	gainXP((int)roundf(dead.xp * df->x * nightXP() * mb * mestXpMul()));
	int gd = (int)roundf(fri(2, 6 + lv * 3) * (dead.boss ? 6 : 1) * (1 + ZRUN * .25f) * mb * mestGoldMul() * torGoldMul());
	P.g += gd;
	char b[24]; snprintf(b, sizeof b, "+%d oro", gd); flt(dead.px, dead.py + .3f, b, 0xffd84a);
	if (dead.boss) {
		dropAt(mkUniq(dead.t, lv), dead.px, dead.py);
		dropAt(mkItem(lv + 1, 2, -1), dead.px + .7f, dead.py + .2f);
		if (malBonus() >= .6f) dropAt(mkItem(lv + 1, 2, -1), dead.px - .6f, dead.py + .3f);
	} else if (frnd() < .4f * df->lt * mb) dropAt(mkItem(lv + 1, 0, -1), dead.px, dead.py);
	if (frnd() < .08f) { P.pot++; flt(P.px, P.py, "+1 pozione", 0x88ff88); }
	P.kills++;
	questKill(&dead);
	xOnKill(&dead);
	discKill(dead.t); evOnKill(&dead);
	{ extern void syncKilled(Ent *); syncKilled(&dead); }
	if (dead.boss) {
		JINGLE(.11f, W_SQUARE, 60, 64, 67, 72, 76, 79);
		char m[80]; snprintf(m, sizeof m, "Hai sconfitto %s!", dead.name);
		banner("Boss sconfitto!", m);
		shake = .5f;
		sparks(dead.px, dead.py, 40, 0xffd84a, 120);
		if (ZDG >= 0) dungeonClear(&dead);
	}
	sparks(dead.px, dead.py, 10, E[dead.t].rng ? E[dead.t].rng : 0xdddddd, 70);
}
static void die(void) {
	if (torDie()) return;   // cadere nella Torre non costa niente
	JINGLE(.2f, W_TRIANGLE, 64, 60, 57, 52);
	if (DFS[P.df].pm) {
		MODE_DEAD = 1;
		deleteSave();
		uiOpenPanel(PM_DEAD);
		return;
	}
	P.hp = P.mx;
	if (P.df > 0) P.g = (int)(P.g * (P.df >= 2 ? .75f : .85f));
	P.dmk = 0; P.iv = 0;
	zoneFade = 0; zonePending = 1; snprintf(zoneTo, sizeof zoneTo, "town"); snprintf(zoneFrom, sizeof zoneFrom, "%s", Zk);
	banner("Sei stato sconfitto", "Ti risvegli ad Aldoria.");
}

/* ---------------- armi: affondo per tipo ---------------- */
typedef struct { const char *k; float r, m, cd; const char *n; } LgDef;
static const LgDef LG[] = {{"Pugnale", 2.4f, 1.3f, 4.5f, "Fendente rapido"}, {"Spada", 2.8f, 1.6f, 6, "Affondo"}, {"Stocco", 3.4f, 1.7f, 6, "Affondo di stocco"},
	{"Lancia", 4, 1.8f, 7, "Stoccata"}, {"Ascia", 2.2f, 2.1f, 8, "Fendente"}, {"Martello", 2.2f, 2.3f, 9.5f, "Schianto"}, {"Bastone", 3, 1.5f, 6, "Colpo di bastone"}, {"Falce", 2.6f, 1.8f, 7, "Falciata"}};
static const char *LGA[][2] = {{"Lama", "Spada"}, {"Clava", "Martello"}, {"Tridente", "Lancia"}, {"Mannaia", "Ascia"}, {"Pungiglione", "Stocco"}, {"Daga", "Pugnale"}, {"Coltello", "Pugnale"},
	{"Mazza", "Martello"}, {"Randello", "Martello"}, {"Maglio", "Martello"}, {"Alabarda", "Lancia"}, {"Picca", "Lancia"}, {"Scettro", "Bastone"}, {"Bacchetta", "Bastone"}, {"Verga", "Bastone"}};
static const LgDef *lgType(void) {
	const char *n = P.eq[SL_W].used ? P.eq[SL_W].n : "Pugnale";
	for (unsigned i = 0; i < sizeof LG / sizeof LG[0]; i++) if (strstr(n, LG[i].k)) return &LG[i];
	for (unsigned i = 0; i < sizeof LGA / sizeof LGA[0]; i++) if (strstr(n, LGA[i][0])) for (unsigned j = 0; j < sizeof LG / sizeof LG[0]; j++) if (!strcmp(LG[j].k, LGA[i][1])) return &LG[j];
	return &LG[1];
}
const char *lgName(void) { return lgType()->n; }
float potCD(void) { return P.pc > 0 ? P.pc : 0; }


int nearestEnemy(float maxd) {
	int best = -1; float bd = maxd;
	for (int i = 0; i < NENT; i++) { Ent *e = &ents[i]; if (e->k != K_EN) continue; float d = dist(e, P.px, P.py); if (d < bd) { bd = d; best = i; } }
	return best;
}
/* ---------------- stamina (7.32): attacchi, capriole e corsa la consumano secondo l'arma ---------------- */
float STA = 100; bool STEX = false; static float stT = -9; bool RUNNING = false;
extern bool runHeld;
int stMax(void) { return 100 + (P.lv < 60 ? P.lv : 60); }
static void stUse(float n) { STA = fmaxf(0, STA - n); stT = gtime; if (STA <= 0) STEX = true; }
static float tiredT = -9;
// arrivati a zero si resta senza fiato finché la stamina non torna almeno al 30%
static bool stTired(void) {
	if (STEX && STA >= stMax() * .3f) STEX = false;
	if (!STEX && STA > 0) return false;
	if (gtime - tiredT > .8f) { tiredT = gtime; flt(P.px, P.py, "Senza fiato", 0x9adcff); tone(200, .05f, W_TRIANGLE, .03f); }
	return true;
}
// costo di un attacco: dipende dall'arma (pugnale 10, spada 14, ascia 18, martello 22...)
float atkCost(void) { static const float STW[8] = {14, 10, 18, 22, 14, 15, 10, 16}; return STW[P.eq[SL_W].used ? itemType(&P.eq[SL_W]) : 1]; }
void dodge(void) {
	if (!started || P.dgc > 0 || P.dmk || P.hp <= 0) return;
	if (stTired()) return;
	float dx = P.dr[0], dy = P.dr[1];
	if (!dx && !dy) dy = 1;
	float d = hyp(dx, dy); dx /= d; dy /= d;
	// in movimento una capriola; da fermo un passo indietro
	if (P.moving) { P.dmk = 1; P.dmt = .34f; P.dmv = 7.6f; P.iv = .36f; stUse(20); }
	else { dx = -dx; dy = -dy; P.dmk = 1; P.dmt = .18f; P.dmv = 7; P.iv = .22f; stUse(12); }
	P.dmx = dx; P.dmy = dy; P.dmm = 1; P.ndmh = 0;
	P.dgc = .42f * torCdMul();
	if (NFX < 64) FX[NFX++] = (Fx){FX_TRAIL, P.px, P.py, 0, .3f, .3f, 0, P.px + dx * 2.6f, P.py + dy * 2.6f, 0};
	whoosh();
}
void lunge(void) {
	if (!started || P.dmk || P.hp <= 0 || P.at > 0) return;
	if (stTired()) return;
	stUse(40);   // colpo pesante: 26 + 14
	wmLunge();   // 7.44: la mossa speciale dell'arma parte insieme all'affondo
	const LgDef *T = lgType();
	int ti = nearestEnemy(7);
	float dx, dy;
	if (ti >= 0) { dx = ents[ti].px - P.px; dy = ents[ti].py - P.py; } else { dx = P.dr[0]; dy = P.dr[1]; if (!dx && !dy) dy = 1; }
	float d = hyp(dx, dy); if (d < .001f) d = 1; dx /= d; dy /= d;
	float dur = .16f;
	P.dmk = 2; P.dmt = dur; P.dmv = T->r / dur; P.dmx = dx; P.dmy = dy; P.dmm = T->m; P.ndmh = 0;
	P.at = .55f; P.sw = .25f; P.dr[0] = dx; P.dr[1] = dy; P.face = faceOf(dx, dy);
	if (NFX < 64) FX[NFX++] = (Fx){FX_TRAIL, P.px, P.py, 0, .25f, .25f, 0, P.px + dx * T->r, P.py + dy * T->r, 0};
	char b[32]; snprintf(b, sizeof b, "%s!", T->n); flt(P.px, P.py, b, 0xffd84a);
	tone(500, .08f, W_SAW, .05f);
}
void areaAtk(void) {
	if (!started || P.hp <= 0 || P.at > 0) return;
	if (stTired()) return;
	stUse(45); P.at = .7f;
	fxAdd(FX_AREA, P.px, P.py, 2.6f, .35f, 0);
	tone(300, .15f, W_SQUARE, .05f);
	shake = fmaxf(shake, .15f);
	for (int i = 0; i < NENT; i++) { Ent *e = &ents[i]; if (e->k == K_EN && dist(e, P.px, P.py) < 2.6f) { Roll r = roll(1.7f); hurtE(e, r.d, r.cr); } }
	P.swc++;
	if (netOk && inPit(P.px, P.py)) for (int i = 0; i < MAXPEER; i++) { Peer *o = &PEERS[i]; char rk[64]; rmKey(rk, sizeof rk);
		if (o->used && !strcmp(o->rm, rk) && inPit(o->x, o->y) && hyp(o->x - P.px, o->y - P.py) < 2.6f) { Roll r = roll(1.7f); netSendHit(o->id, r.d, r.cr); o->fl = .12f; } }
}
void potion(void) {
	if (!started || P.hp <= 0) return;
	if (P.pot <= 0) { msg("Non hai pozioni: comprale da Mira o da Ugo"); tone(150, .12f, W_SQUARE, .05f); return; }
	if (P.hp >= P.mx) { msg("Sei già in piena salute"); return; }
	if (P.pc > 0) { char b[40]; snprintf(b, sizeof b, "Pozione tra %ds", (int)ceilf(P.pc)); flt(P.px, P.py, b, 0x9adcff); return; }
	if (malOn(3)) { flt(P.px, P.py, "Gola secca: niente pozioni", 0xc46bff); tone(150, .12f, W_SQUARE, .05f); return; }
	P.pot--; P.pc = 2.5f;
	int h = (int)roundf(P.mx * .35f);
	P.hp = fminf(P.mx, P.hp + h);
	char b[16]; snprintf(b, sizeof b, "+%d", h); flt(P.px, P.py, b, 0x66ff66);
	tone(520, .1f, W_TRIANGLE, .05f);
	sparks(P.px, P.py, 10, 0x66ff66, 50);
}
static void shoot(Ent *e) {
	int n = e->boss && e->enr ? 3 : 1;
	float a0 = atan2f(P.py - e->py, P.px - e->px);
	for (int i = 0; i < n && NPJ < 64; i++) {
		float a = a0 + (i - (n - 1) / 2.f) * .25f;
		PJ[NPJ++] = (Proj){e->px, e->py, cosf(a) * 7, sinf(a) * 7, 1.6f, e->at, E[e->t].rng};
	}
	tone(600, .05f, W_TRIANGLE, .03f);
}

/* ---------------- missioni ---------------- */
static const NpcDef *ndef(int nid) { return nid >= 0 && nid < NNPC ? &NPCS[nid] : NULL; }
int qAvail(int nid) {
	const NpcDef *d = ndef(nid);
	if (!d || !d->nqs || P.nq >= MAXQ) return -1;
	for (int i = 0; i < P.nq; i++) if (P.q[i].npc == nid) return -1;
	int n = d->nqs;
	for (int k = 0; k < n; k++) {
		int qi = questIdx(d->qs[(P.qi[nid] + k) % n]);
		if (qi < 0) continue;
		const QuestDef *T = &QT[qi];
		if (T->once && P.qd[qi]) continue;
		if (T->lv > P.lv + 1) continue;
		if (T->t == QK_FISH || T->t == QK_STEP || T->t == QK_BAT) continue;   // pesca, tappe e battaglie: non ci sono su 3DS
		if (T->req && !hasUnl(T->req)) continue;
		return qi;
	}
	return -1;
}
bool qReady(const Quest *q) { return q->c >= (QT[q->id].n ? QT[q->id].n : 1); }
void qRew(int id, int *g, int *x) { const QuestDef *T = &QT[id]; *g = (int)roundf(T->g * (1 + P.lv * .06f)); *x = (int)roundf(T->x * (1 + P.lv * .085f)); }
void qAccept(int nid, int id) {
	if (P.nq >= MAXQ) return;
	P.q[P.nq++] = (Quest){id, nid, 0};
	const NpcDef *d = ndef(nid);
	int n = d->nqs;
	for (int i = 0; i < n; i++) if (!strcmp(d->qs[i], QT[id].id)) P.qi[nid] = (i + 1) % n;
	banner("Missione accettata", QT[id].ti);
	JINGLE(.12f, W_SQUARE, 67, 71, 74);
	npcMarks(); saveGame();
}
void qTurn(int qi) {
	if (qi < 0 || qi >= P.nq) return;
	Quest q = P.q[qi];
	int g, x; qRew(q.id, &g, &x);
	memmove(&P.q[qi], &P.q[qi + 1], sizeof(Quest) * (P.nq - qi - 1)); P.nq--;
	P.g += g; gainXP(x);
	if (P.qd[q.id] < 60000) P.qd[q.id]++;
	if (QT[q.id].unl) { addUnl(QT[q.id].unl); banner("Nuovo passaggio aperto", "Un luogo prima sbarrato ora è raggiungibile"); }
	char b[96]; snprintf(b, sizeof b, "%s · +%d oro, +%d XP", QT[q.id].ti, g, x);
	banner("Missione completata", b);
	JINGLE(.09f, W_SQUARE, 72, 76, 79, 84, 88);
	npcMarks(); saveGame();
}
void qProg(const Quest *q, char *out, int n) {
	const QuestDef *T = &QT[q->id];
	if (T->t == QK_TALK) snprintf(out, n, "%s", q->c ? "Fatto: torna indietro" : "Da consegnare");
	else if (T->t == QK_COL) snprintf(out, n, "%s: %d/%d", T->it, q->c, T->n);
	else snprintf(out, n, "%d/%d", q->c, T->n);
}
static void questKill(Ent *e) {
	for (int i = 0; i < P.nq; i++) {
		Quest *q = &P.q[i]; const QuestDef *T = &QT[q->id];
		if (qReady(q) || T->t == QK_TALK) continue;
		bool match = false;
		for (int k = 0; k < T->ne; k++) if (T->e[k] == e->t) match = true;
		if (!match) continue;
		if (T->t == QK_KILL || T->t == QK_BOSS) { q->c++; msg("%s: %d/%d", T->ti, q->c, T->n); }
		else if (T->t == QK_COL && frnd() < (T->ch > 0 ? T->ch : .55f)) {
			q->c++; char b[40]; snprintf(b, sizeof b, "+%s", T->it); flt(e->px, e->py, b, 0x7aff7a); msg("%s: %d/%d", T->it, q->c, T->n);
		}
		if (qReady(q)) JINGLE(.12f, W_SQUARE, 67, 72);
	}
}
static void questTalk(int nid) {
	if (nid < 0) return;
	for (int i = 0; i < P.nq; i++) {
		Quest *q = &P.q[i]; const QuestDef *T = &QT[q->id];
		if (T->t == QK_TALK && T->to && !strcmp(T->to, NPCS[nid].id) && q->c < 1) {
			q->c = 1; msg("Missione aggiornata: %s — torna da %s", T->ti, NPCS[q->npc].n); JINGLE(.12f, W_SQUARE, 67, 72);
		}
	}
}
void npcMarks(void) {
	for (int i = 0; i < NENT; i++) {
		Ent *e = &ents[i]; if (e->k != K_NPC) continue;
		int id = e->nid; char m = 0;
		if (id < 0) { e->qm = 0; continue; }
		if (!strcmp(NPCS[id].id, "re")) m = P.st == 0 ? '!' : (P.st == 2 || P.st == 4) ? '?' : 0;
		else {
			for (int k = 0; k < P.nq; k++) if (P.q[k].npc == id && qReady(&P.q[k])) m = '?';
			if (!m && qAvail(id) >= 0) m = '!';
			if (!m) for (int k = 0; k < P.nq; k++) { const QuestDef *T = &QT[P.q[k].id]; if (T->t == QK_TALK && T->to && !strcmp(T->to, NPCS[id].id) && P.q[k].c < 1) m = '.'; }
		}
		e->qm = m;
	}
}

/* ---------------- storia ---------------- */
static int shardCount(void) { int n = 0; for (int i = 0; i < NSHARD; i++) if (P.sh & (1u << i)) n++; return n; }
void storyObj(char *out, int n) {
	switch (P.st) {
	case 0: snprintf(out, n, "Parla con il Re Aldric, nel castello di Aldoria (a nord-ovest della città)."); break;
	case 1: snprintf(out, n, "Recupera i frammenti della Corona di Voxel (%d/6) nei sei dungeon del regno.", shardCount()); break;
	case 2: snprintf(out, n, "Hai tutti e sei i frammenti: riportali al Re Aldric, nel castello."); break;
	case 3: snprintf(out, n, "Attraversa il portale nella sala del trono e sconfiggi Malakar nella Cittadella del Vuoto."); break;
	case 4: snprintf(out, n, "Malakar è caduto: torna dal Re Aldric al castello."); break;
	default: snprintf(out, n, "Sei il Campione di Aldoria. I dungeon rinascono più forti a ogni ciclo: continua la tua leggenda."); break;
	}
}
static void kingGifts(void) {
	P.pot += 10;
	int lv = P.lv > 12 ? P.lv : 12;
	Item a = mkItem(lv, 3, SL_W), b = mkItem(lv, 3, SL_C);
	snprintf(a.n, sizeof a.n, "Spada del Campione"); if (a.cr < 10) a.cr = 10;
	snprintf(b.n, sizeof b.n, "Corazza del Re"); if (b.hp < 90) b.hp = 90;
	gain(a); gain(b);
}
void storyStep(int s) {
	if (s == 1 && P.st == 0) { P.st = 1; uiOpenText("La missione del Re", STORY_INTRO, NULL); }
	else if (s == 3 && P.st == 2) {
		P.st = 3; P.g += 1000; gainXP(800);
		uiOpenText("La Corona di Voxel", STORY_FORGE, NULL);
		if (!strcmp(Zk, "in_castle")) {
			bool has = false; for (int i = 0; i < NENT; i++) if (ents[i].k == K_PO && ents[i].st == PO_VOID) has = true;
			if (!has) mkPo(14.5f, 12.5f, "cittadella@1", PO_VOID, "Cittadella del Vuoto");
		}
		shake = .4f;
	} else if (s == 5 && P.st == 4) { P.st = 5; P.g += 5000; gainXP(3000); kingGifts(); uiOpenText("Campione di Aldoria", STORY_END, NULL); }
	JINGLE(.15f, W_TRIANGLE, 60, 67, 72, 76);
	npcMarks(); saveGame();
}

/* ---------------- interazioni ---------------- */
static bool dgLeft(void) {
	for (int i = 0; i < NENT; i++) { Ent *e = &ents[i]; if (e->k == K_SHARD || e->k == K_DR || (e->k == K_CH && e->rich)) return true; }
	return false;
}
static float zoneAtX = 0, zoneAtY = 0;
bool zoneBusy(void) { return zonePending != 0; }
// teletrasporto (plugin tpa): nella zona, vicino alla casella data
void goZoneAt(const char *to, float x, float y) {
	if (zonePending) return;
	goZone(to); zoneAtX = x; zoneAtY = y;
}
void goZone(const char *to) {
	if (zonePending) return;
	zoneAtX = zoneAtY = 0;
	zonePending = 1; zoneFade = 0; snprintf(zoneTo, sizeof zoneTo, "%s", to); snprintf(zoneFrom, sizeof zoneFrom, "%s", Zk);
	whoosh();
}
void dungeonClearExit(Ent *po) { po->ok = 1; act(po); }
void act(Ent *e) {
	if (!e) return;
	switch (e->k) {
	case K_NPC:
		if (e->wd) { e->pn = e->pi = 0; e->wt = 6; }
		// si gira verso l'eroe
		e->face = faceOf(P.px - e->px, P.py - e->py);
		questTalk(e->nid);
		npcMarks();
		uiOpenNpc(e);
		return;
	case K_CH: {
		e->k = K_CHO; e->t0 = gtime;
		int lv = ZLV ? ZLV : (P.lv > 1 ? P.lv - 1 : 1);
		int n = e->rich ? 3 : fri(1, 2);
		for (int i = 0; i < n; i++) dropAt(mkItem(lv + 1, e->rich ? 1 : 0, -1), e->px + i * .5f - .4f, e->py + .5f);
		int gd = (int)roundf(fri(10, 30) * (1 + lv) * (e->rich ? 3 : 1) * (1 + malBonus()));
		evOnChest(e);
		P.g += gd;
		if (e->hc) { int w = 0; for (int i = 1; i < 24; i++) if (P.hcT[i] < P.hcT[w]) w = i; P.hcK[w] = (u32)e->hc; P.hcT[w] = osGetTime(); }
		tone(800, .1f, W_SQUARE, .05f);
		sparks(e->px, e->py, 14, 0xffd84a, 70);
		msg("Forziere aperto! +%d oro", gd);
		return;
	}
	case K_LEV: levPull(e); return;
	case K_X: xAct(e); return;
	case K_RES: {
		if (e->rt > gtime) { msg("Qui non c'è più niente da raccogliere: torna più tardi"); return; }
		e->rt = gtime + 60;
		resAdd(e->res, 1); discRes(e->res);
		char b[48]; snprintf(b, sizeof b, "+1 %s", e->res); flt(e->px, e->py, b, 0x7aff7a);
		tone(760, .07f, W_TRIANGLE, .05f);
		for (int i = 0; i < P.nq; i++) { Quest *q = &P.q[i]; const QuestDef *T = &QT[q->id]; if (T->t == QK_GAT && T->r && !strcmp(T->r, e->res) && !qReady(q)) { q->c++; msg("%s: %d/%d", T->ti, q->c, T->n); if (qReady(q)) JINGLE(.12f, W_SQUARE, 67, 72); } }
		npcMarks();
		return;
	}
	case K_PO:
		if (e->seal) { msg("Una grata di ferro chiude la scala. Tira le due leve del piano nello stesso momento."); tone(150, .2f, W_SQUARE, .05f); return; }
		if (e->lock[0] && !hasUnl(e->lock)) { msg("%s", e->lockMsg ? e->lockMsg : "Il passaggio è sbarrato."); tone(150, .2f, W_SQUARE, .05f); return; }
		if (torExit(e)) return;   // 7.44: uscire dalla Torre chiude la prova
		if (!e->xo && malAsk(e)) return;   // 7.44: le maledizioni, prima di entrare in un dungeon
		e->xo = 0;
		if (!zoneExists(e->to) && !torIsZone(e->to)) { msg("%s: questo luogo non è ancora disponibile su 3DS", e->name); tone(150, .2f, W_SQUARE, .05f); return; }
		if (e->dgx && !e->ok && dgLeft()) { TGT = e; uiOpenPanel(PM_EXITASK); tone(330, .08f, W_TRIANGLE, .05f); return; }
		goZone(e->to);
		return;
	case K_DR: {
		if (P.ninv >= INV) { msg("Zaino pieno (%d/%d): vendi o getta qualcosa", INV, INV); tone(150, .15f, W_SQUARE, .05f); return; }
		Item it = e->it; entDel(e); gain(it);
		tone(700 + it.r * 120, .07f, W_TRIANGLE, .05f);
		return;
	}
	case K_SHARD: {
		int id = e->sid; entDel(e);
		P.sh |= 1u << id;
		JINGLE(.14f, W_TRIANGLE, 72, 79, 84, 91);
		sparks(P.px, P.py, 30, 0xffd84a, 100);
		int n = shardCount();
		char ti[64]; snprintf(ti, sizeof ti, "Frammento della Corona (%d/6)", n);
		static char tx[400];
		snprintf(tx, sizeof tx, "%s%s", SHT[id], n == 6 ? "\n\nHai tutti e sei i frammenti! Riportali al Re Aldric, nel castello di Aldoria." : "");
		if (n >= 6 && P.st == 1) P.st = 2;
		uiOpenText(ti, tx, NULL);
		saveGame();
		return;
	}
	case K_LORE: {
		int id = e->sid; entDel(e);
		P.lore |= 1u << id;
		JINGLE(.12f, W_TRIANGLE, 64, 67, 71);
		int n = 0; for (int i = 0; i < NLORE; i++) if (P.lore & (1u << i)) n++;
		static char sub[64]; snprintf(sub, sizeof sub, "Pagina %d/%d · la ritrovi nel Diario", n, NLORE);
		uiOpenText(LORE[id].ti, LORE[id].tx, sub);
		saveGame();
		return;
	}
	}
}
void heroInteractBtn(void) { if (IT) act(IT); }
/* ---------------- 7.19: ogni arma ha le sue mosse (catena di tre colpi e colpo caricato) ---------------- */
enum { SH_ARC, SH_LINE, SH_CIRC, SH_PROJ, SH_CHAIN };
enum { HV_DASH, HV_SPIN, HV_LEAP, HV_SLAM, HV_WAVE, HV_NOVA };
typedef struct { const char *n; u8 sh; float r, a, w, m, d, h, kb, stn; } CMove;
typedef struct { const char *n; CMove c3[3]; struct { const char *n; u8 k; float r, m, cd, ar, a, kb, stn; u8 n2; } hv; u32 col; } CWeap;
// stesso ordine dei tipi d'arma: spada, pugnale, ascia, martello, lancia, tridente, bastone, falce
static const CWeap CBW[8] = {
	{"Spada", {{"Fendente", SH_ARC, 1.75f, 140, 0, 1, .34f, .48f, .25f}, {"Montante", SH_ARC, 1.75f, 110, 0, 1.1f, .34f, .48f, .25f}, {"Colpo del cavaliere", SH_LINE, 2.2f, 0, 1, 1.6f, .42f, .5f, 1.1f}},
		{"Turbine", HV_SPIN, 2.3f, 1.05f, 5, 0, 0, 0, 0, 2}, 0xe6f0ff},
	{"Pugnale", {{"Taglio", SH_ARC, 1.5f, 110, 0, .85f, .24f, .45f, .1f}, {"Rovescio", SH_ARC, 1.5f, 110, 0, .85f, .24f, .45f, .1f}, {"Doppia pugnalata", SH_LINE, 1.9f, 0, .8f, 1.45f, .34f, .5f, .2f}},
		{"Danza delle lame", HV_DASH, 3.4f, 1.1f, 4.5f}, 0xe6ebff},
	{"Ascia", {{"Fendente pesante", SH_ARC, 1.7f, 130, 0, 1.3f, .42f, .55f, .4f}, {"Rovescio", SH_ARC, 1.7f, 130, 0, 1.3f, .42f, .55f, .4f}, {"Spaccascudi", SH_ARC, 1.85f, 70, 0, 1.9f, .5f, .58f, .6f}},
		{"Salto del boia", HV_LEAP, 3.6f, 2.3f, 6.5f, 2.2f}, 0xffdcbe},
	{"Martello", {{"Colpo", SH_ARC, 1.6f, 120, 0, 1.45f, .48f, .58f, .8f}, {"Montante", SH_ARC, 1.6f, 100, 0, 1.55f, .48f, .58f, .8f}, {"Schianto", SH_CIRC, 2, 0, 0, 2.1f, .6f, .6f, .9f, 1.2f}},
		{"Terremoto", HV_SLAM, 3.3f, 2.3f, 7, 0, 0, 0, 1.8f}, 0xffd296},
	{"Lancia", {{"Stoccata", SH_LINE, 2.7f, 0, .7f, 1, .3f, .45f, .3f}, {"Stoccata alta", SH_LINE, 2.7f, 0, .7f, 1.1f, .3f, .45f, .3f}, {"Spazzata", SH_ARC, 2.4f, 220, 0, 1.3f, .46f, .55f, 1.2f}},
		{"Carica", HV_DASH, 4.4f, 1.9f, 5.5f, 0, 0, 1}, 0xdcf0ff},
	{"Tridente", {{"Affondo", SH_LINE, 2.4f, 0, .8f, 1, .32f, .45f, .2f}, {"Affondo", SH_LINE, 2.4f, 0, .8f, 1.1f, .32f, .45f, .2f}, {"Tre punte", SH_ARC, 2.5f, 80, 0, 1.35f, .44f, .52f, -.9f}},
		{"Maremoto", HV_WAVE, 4.3f, 1.6f, 6, 0, 75, 1.3f}, 0x96dcff},
	{"Bastone", {{"Dardo arcano", SH_PROJ, 7, 0, 0, .95f, .3f, .45f}, {"Dardo arcano", SH_PROJ, 7, 0, 0, .95f, .3f, .45f}, {"Catena di fulmini", SH_CHAIN, 6, 0, 0, 1.25f, .44f, .5f}},
		{"Nova arcana", HV_NOVA, 2.7f, 2.05f, 5.5f}, 0xc8a0ff},
	{"Falce", {{"Mietitura", SH_ARC, 2.1f, 160, 0, 1.05f, .38f, .5f, .3f}, {"Rovescio", SH_ARC, 2.1f, 160, 0, 1.05f, .38f, .5f, .3f}, {"Raccolto", SH_CIRC, 2.3f, 0, 0, 1.45f, .5f, .55f, 0}},
		{"Danza della morte", HV_SPIN, 2.6f, 1.3f, 6, 0, 0, 0, 0, 2}, 0xdcdcf0},
};
typedef struct { bool on; int step; float t0, d; bool hit, perf, autoMv; float dx, dy; } CCur;
static CCur CUR;
static float spinM;
static int cbStep = -1; static float cbEnd = -9, cbBufT = -9, pressT = -9, hvCd = 0, spin2T = -1;
static bool cbBuf = false, charging = false;
Ent *LOCK = NULL;
static const CWeap *cbW(void) { return &CBW[P.eq[SL_W].used ? itemType(&P.eq[SL_W]) : 1]; }
const char *cbMoveName(void) { const CWeap *W = cbW(); int st = CUR.on ? CUR.step : (gtime - cbEnd < .65f ? (cbStep + 1) % 3 : 0); return W->c3[clampi(st, 0, 2)].n; }
const char *cbHeavyName(void) { return cbW()->hv.n; }
float cbCharge(void) { return charging ? clampf((gtime - pressT - .25f) / .9f, 0, 1) : -1; }
float cbHeavyCd(void) { return hvCd; }
static float eRad(Ent *e) { return e->boss ? .6f : .3f; }
static bool inShape(float ex, float ey, float rad, u8 sh, float r, float a, float w, float ox, float oy, float dx, float dy) {
	float vx = ex - ox, vy = ey - oy, d = hyp(vx, vy);
	if (sh == SH_CIRC) return d < r + rad;
	if (sh == SH_LINE) { float al = vx * dx + vy * dy, pe = fabsf(vx * dy - vy * dx); return al > -rad && al < r + rad && pe < w / 2 + rad; }
	if (d > r + rad) return false;
	if (d < .35f) return true;
	float c = (vx * dx + vy * dy) / d;
	return c >= cosf(a * PI_F / 360) - rad / fmaxf(d, .5f);
}
// direzione del colpo: verso il bersaglio bloccato, oppure il nemico nel cono davanti all'eroe
static void cbDir(float r, float *ox, float *oy) {
	if (LOCK && LOCK->k == K_EN && dist(LOCK, P.px, P.py) < r + 7) { float dx = LOCK->px - P.px, dy = LOCK->py - P.py, d = hyp(dx, dy); if (d < .01f) d = 1; *ox = dx / d; *oy = dy / d; return; }
	float ax = P.dr[0], ay = P.dr[1], ad = hyp(ax, ay); if (ad < .01f) { ax = 0; ay = 1; ad = 1; } ax /= ad; ay /= ad;
	Ent *best = NULL; float bs = -1;
	for (int i = 0; i < NENT; i++) { Ent *e = &ents[i]; if (e->k != K_EN) continue; float dx = e->px - P.px, dy = e->py - P.py, d = hyp(dx, dy); if (d > r + 1.3f || d < .01f) continue; float c = (dx * ax + dy * ay) / d - d * .02f; if (c > .7f && c > bs) { bs = c; best = e; } }
	if (!best) { int k = nearestEnemy(r + 1.3f); if (k >= 0) best = &ents[k]; }
	if (best) { float dx = best->px - P.px, dy = best->py - P.py, d = hyp(dx, dy); if (d < .01f) d = 1; *ox = dx / d; *oy = dy / d; return; }
	*ox = ax; *oy = ay;
}
static void fxArc(float x, float y, float a0, float sp, float r, u32 c) { if (NFX < 64) FX[NFX++] = (Fx){FX_ARC, x, y, r, .28f, .28f, sp, a0, 0, c}; }
static void cbHurt(Ent *e, float m, float kb, float stn, float dx, float dy) {
	Roll r = roll(m); hurtE(e, r.d, r.cr);
	if (e->k != K_EN) return;
	if (kb && !e->boss) mv(&e->px, &e->py, dx * kb * .5f, dy * kb * .5f);
	if (stn > 0) { e->cdt = fmaxf(e->cdt, stn); flt(e->px, e->py, "Stordito", 0xffe08a); }
}
static void cbPvp(float m, u8 sh, float r, float a, float w, float ox, float oy, float dx, float dy) {
	if (!netOk || !inPit(P.px, P.py)) return;
	char rk[64]; rmKey(rk, sizeof rk);
	for (int i = 0; i < MAXPEER; i++) { Peer *o = &PEERS[i]; if (!o->used || strcmp(o->rm, rk) || !inPit(o->x, o->y)) continue;
		if (!inShape(o->x, o->y, .3f, sh, r, a, w, ox, oy, dx, dy)) continue;
		Roll q = roll(m); netSendHit(o->id, q.d, q.cr); o->fl = .12f;
		char b[16]; snprintf(b, sizeof b, q.cr ? "%d!" : "%d", q.d); flt(o->x, o->y, b, q.cr ? 0xffd84a : 0xffaaaa); }
}
static void cbStrike(void) {
	const CWeap *W = cbW(); const CMove *mv0 = &W->c3[CUR.step];
	float cr = CUR.perf ? 1.3f : 1, dx = CUR.dx, dy = CUR.dy, ox = P.px, oy = P.py; int n = 0;
	if (mv0->sh == SH_PROJ) {
		if (NPJ < 64) PJ[NPJ++] = (Proj){ox + dx * .4f, oy + dy * .4f, dx * 12, dy * 12, mv0->r / 12, -atkV() * mv0->m * cr, W->col};
		whoosh(); tone(720, .06f, W_SINE, .05f); return;
	}
	if (mv0->sh == SH_CHAIN) {
		Ent *tg = NULL; float bd = mv0->r;
		for (int i = 0; i < NENT; i++) { Ent *e = &ents[i]; if (e->k != K_EN) continue; float d = dist(e, ox, oy); if (d < bd) { bd = d; tg = e; } }
		float fx = ox, fy = oy; Ent *done[3] = {0};
		for (int k = 0; tg && k < 3; k++) {
			done[k] = tg;
			if (NFX < 64) FX[NFX++] = (Fx){FX_TRAIL, fx, fy, 0, .35f, .35f, 0, tg->px, tg->py, 0};
			float tx = tg->px, ty = tg->py;
			cbHurt(tg, mv0->m * cr * (k ? .7f : 1), 0, 0, dx, dy);
			fx = tx; fy = ty; Ent *nx = NULL; float b2 = 3.6f;
			for (int i = 0; i < NENT; i++) { Ent *e = &ents[i]; if (e->k != K_EN || e == done[0] || e == done[1] || e == done[2]) continue; float d = dist(e, fx, fy); if (d < b2) { b2 = d; nx = e; } }
			tg = nx;
		}
		tone(1200, .08f, W_SAW, .04f); return;
	}
	for (int i = 0; i < NENT; i++) { Ent *e = &ents[i]; if (e->k != K_EN) continue;
		if (inShape(e->px, e->py, eRad(e), mv0->sh, mv0->r, mv0->a, mv0->w, ox, oy, dx, dy)) { cbHurt(e, mv0->m * cr, mv0->kb, mv0->stn, dx, dy); n++; } }
	cbPvp(mv0->m * cr, mv0->sh, mv0->r, mv0->a, mv0->w, ox, oy, dx, dy);
	float A = atan2f(dy, dx);
	if (mv0->sh == SH_ARC) fxArc(ox, oy, A - mv0->a * PI_F / 360, mv0->a * PI_F / 180, mv0->r * .85f, W->col);
	else if (mv0->sh == SH_LINE) { if (NFX < 64) FX[NFX++] = (Fx){FX_TRAIL, ox, oy, 0, .24f, .24f, 0, ox + dx * mv0->r, oy + dy * mv0->r, 0}; }
	else fxAdd(FX_AREA, ox, oy, mv0->r, .35f, 0);
	if (n) { tone(mv0->m > 1.5f ? 140 : 260, .06f, W_SQUARE, .05f); if (mv0->m >= 1.4f) shake = fmaxf(shake, .12f); } else whoosh();
}
static void cbDo(int step, bool perf, bool autoMv) {
	const CWeap *W = cbW(); const CMove *mv0 = &W->c3[step];
	if (!autoMv) { if (stTired()) { cbBuf = false; return; } stUse(atkCost() * (step == 2 ? 1.3f : 1)); }
	float dx, dy; cbDir(mv0->r, &dx, &dy);
	CUR = (CCur){true, step, gtime, mv0->d, false, perf, autoMv, dx, dy};
	cbStep = step;
	P.dr[0] = dx; P.dr[1] = dy; P.face = faceOf(dx, dy); P.sw = .2f; P.swc++;
	if (!autoMv) { float s = .22f; if (!blk(P.px + dx * s, P.py)) P.px += dx * s; if (!blk(P.px, P.py + dy * s)) P.py += dy * s; }
	if (perf) { flt(P.px, P.py, "Perfetto!", 0xffe28a); tone(980, .05f, W_TRIANGLE, .05f); }
}
// premere A: la mossa seguente della catena (entro 0,65 s dalla fine della precedente; entro 0,2 s è «perfetta»)
static void cbPress(void) {
	if (P.dmk) return;
	if (CUR.on) { float k = (gtime - CUR.t0) / CUR.d; if (k > .35f && !cbBuf) { cbBuf = true; cbBufT = gtime; } return; }
	float since = gtime - cbEnd; bool chain = cbStep >= 0 && since < .65f;
	cbDo(chain ? (cbStep + 1) % 3 : 0, chain && since < .2f, false);
}
// il colpo caricato: più a lungo tieni premuto, più è forte
static void cbHeavy(float lv) {
	const CWeap *W = cbW();
	if (hvCd > 0) { char b[40]; snprintf(b, sizeof b, "%s tra %ds", W->hv.n, (int)ceilf(hvCd)); flt(P.px, P.py, b, 0x9adcff); return; }
	if (stTired()) return;
	stUse(26 + lv * 14);
	CUR.on = false; cbBuf = false;
	float cm = .65f + .85f * lv, dx, dy; cbDir(W->hv.r, &dx, &dy);
	P.dr[0] = dx; P.dr[1] = dy; P.face = faceOf(dx, dy); P.sw = .3f; P.swc++;
	hvCd = W->hv.cd;
	char b[40]; snprintf(b, sizeof b, "%s!", W->hv.n); flt(P.px, P.py, b, 0xffd84a);
	float ox = P.px, oy = P.py;
	switch (W->hv.k) {
	case HV_DASH: case HV_LEAP: {
		float dur = .2f;
		P.dmk = 2; P.dmt = dur; P.dmv = W->hv.r / dur; P.dmx = dx; P.dmy = dy; P.dmm = W->hv.m * cm; P.ndmh = 0;
		if (NFX < 64) FX[NFX++] = (Fx){FX_TRAIL, ox, oy, 0, .3f, .3f, 0, ox + dx * W->hv.r, oy + dy * W->hv.r, 0};
		if (W->hv.k == HV_LEAP) spin2T = gtime + dur;   // all'atterraggio, colpo ad area
		tone(500, .08f, W_SAW, .05f);
		break;
	}
	case HV_WAVE:
		for (int i = 0; i < NENT; i++) { Ent *e = &ents[i]; if (e->k == K_EN && inShape(e->px, e->py, eRad(e), SH_ARC, W->hv.r, W->hv.a, 0, ox, oy, dx, dy)) cbHurt(e, W->hv.m * cm, W->hv.kb, 0, dx, dy); }
		cbPvp(W->hv.m * cm, SH_ARC, W->hv.r, W->hv.a, 0, ox, oy, dx, dy);
		fxArc(ox, oy, atan2f(dy, dx) - W->hv.a * PI_F / 360, W->hv.a * PI_F / 180, W->hv.r * .9f, W->col);
		tone(300, .2f, W_SAW, .05f);
		break;
	default:
		for (int i = 0; i < NENT; i++) { Ent *e = &ents[i]; if (e->k == K_EN && dist(e, ox, oy) < W->hv.r + eRad(e)) cbHurt(e, W->hv.m * cm, .6f, W->hv.stn, (e->px - ox) / fmaxf(.1f, dist(e, ox, oy)), (e->py - oy) / fmaxf(.1f, dist(e, ox, oy))); }
		cbPvp(W->hv.m * cm, SH_CIRC, W->hv.r, 0, 0, ox, oy, dx, dy);
		fxAdd(FX_AREA, ox, oy, W->hv.r, .4f, 0);
		if (W->hv.k == HV_SLAM) shake = fmaxf(shake, .3f);
		if (W->hv.n2 > 1) spin2T = gtime + .25f;
		tone(200, .15f, W_SQUARE, .05f);
	}
	spinM = W->hv.m * cm;
}
void heroAttackRelease(void) {
	if (!charging) return;
	float lv = clampf((gtime - pressT - .25f) / .9f, 0, 1);
	charging = false;
	if (!P.dmk && P.hp > 0) cbHeavy(lv);
}
// blocco del bersaglio (R): l'eroe resta girato verso il nemico scelto; R di nuovo passa al seguente
void lockNext(void) {
	Ent *L[64]; int n = 0;
	for (int i = 0; i < NENT && n < 64; i++) if (ents[i].k == K_EN && dist(&ents[i], P.px, P.py) < 12) L[n++] = &ents[i];
	if (!n) { LOCK = NULL; msg("Nessun nemico da bloccare"); return; }
	for (int i = 1; i < n; i++) for (int j = i; j > 0 && dist(L[j], P.px, P.py) < dist(L[j - 1], P.px, P.py); j--) { Ent *t = L[j]; L[j] = L[j - 1]; L[j - 1] = t; }
	int cur = -1; for (int i = 0; i < n; i++) if (L[i] == LOCK) cur = i;
	if (cur >= 0 && n == 1) { LOCK = NULL; return; }
	LOCK = L[(cur + 1) % n];
	tone(880, .04f, W_TRIANGLE, .04f);
}
static void cbUpdate(float dt, bool aHeld) {
	if (hvCd > 0) hvCd -= dt;
	if (LOCK && (LOCK->k != K_EN || dist(LOCK, P.px, P.py) > 15)) LOCK = NULL;
	// tenendo premuto A si carica il colpo pesante
	if (aHeld && !charging && !P.dmk && pressT > 0 && gtime - pressT > .25f && !CUR.on) { charging = true; stT = gtime; }
	if (charging) { stT = gtime; if (fmodf(gtime, .15f) < dt) sparks(P.px, P.py, 1, cbW()->col, 30); }
	if (spin2T > 0 && gtime >= spin2T) {
		spin2T = -1;
		const CWeap *W = cbW(); float r = W->hv.k == HV_LEAP ? W->hv.ar : W->hv.r;
		for (int i = 0; i < NENT; i++) { Ent *e = &ents[i]; if (e->k == K_EN && dist(e, P.px, P.py) < r + eRad(e)) cbHurt(e, spinM, .5f, 0, P.dr[0], P.dr[1]); }
		fxAdd(FX_AREA, P.px, P.py, r, .35f, 0); shake = fmaxf(shake, .2f);
	}
	if (!CUR.on) return;
	stT = gtime;
	float k = (gtime - CUR.t0) / CUR.d;
	if (!CUR.hit && k >= cbW()->c3[CUR.step].h) { CUR.hit = true; cbStrike(); }
	if (k >= 1) {
		CUR.on = false; cbEnd = gtime;
		if (cbBuf && gtime - cbBufT < .6f) { cbBuf = false; cbDo((CUR.step + 1) % 3, gtime - cbBufT < .22f, false); }
		else cbBuf = false;
	}
}
bool cbBusy(void) { return CUR.on || charging; }
void heroAttackBtn(void) {
	pressT = gtime;
	// vicino a una persona, una porta o un forziere, e senza nemici a portata, A interagisce
	int ti = nearestEnemy(4.2f);
	if (ti < 0 && nearestPeer(3) < 0) { if (IT) { act(IT); pressT = -9; } else cbPress(); return; }
	// nemico lontano: l'eroe ci va e colpisce da solo (solo il primo colpo, più lento)
	if (ti >= 0 && !LOCK) {
		const CMove *m0 = &cbW()->c3[0];
		if (dist(&ents[ti], P.px, P.py) > m0->r + eRad(&ents[ti]) + .3f) { TGT = &ents[ti]; return; }
	}
	TGT = NULL;
	cbPress();
}
/* ---------------- arena PvP e rete ---------------- */
bool inPit(float x, float y) { if (strcmp(Zk, "arena")) return false; float a = (x - 19.5f) / 12, b = (y - 23.5f) / 9; return sqrtf(a * a + b * b) < .96f; }
int nearestPeer(float maxd) {
	if (!netOk || !inPit(P.px, P.py)) return -1;
	char rk[64]; rmKey(rk, sizeof rk);
	int best = -1; float bd = maxd;
	for (int i = 0; i < MAXPEER; i++) { Peer *o = &PEERS[i]; if (!o->used || strcmp(o->rm, rk) || !inPit(o->x, o->y)) continue; float d = hyp(o->x - P.px, o->y - P.py); if (d < bd) { bd = d; best = i; } }
	return best;
}
void hurtPvp(int d, bool cr, const char *from, const char *n) {
	if (!inPit(P.px, P.py) || P.hp <= 0) return;
	if (P.iv > 0) { flt(P.px, P.py, "Schivata!", 0x8ce7ff); P.pf = 3; return; }
	int dd = (int)roundf(d * 100.f / (100 + defV() * 2.5f)); if (dd < 1) dd = 1;
	P.hp -= dd; P.fl = .15f;
	char b[16]; snprintf(b, sizeof b, cr ? "%d!" : "%d", dd); flt(P.px, P.py, b, 0xff6666);
	tone(110, .08f, W_SQUARE, .05f); shake = fmaxf(shake, .18f);
	if (P.hp <= 0) {
		netSendKo(from);
		P.hp = P.mx; P.px = 19.5f; P.py = 4.5f;
		msg("Sei stato sconfitto da %s! Torni nella sala d'attesa.", n);
	}
}
// 7.41: il colpo di un altro su un nemico che guido io
void enemyNetHitG(const char *g, float frac) {
	for (int i = 0; i < NENT; i++) {
		Ent *e = &ents[i];
		if (e->k != K_EN || e->pup || !e->sg[0] || strcmp(e->sg, g)) continue;
		int d = (int)roundf(frac * e->mx); if (d < 1) d = 1;
		e->hp -= d; e->fl = .12f; e->al = 1;
		char b[16]; snprintf(b, sizeof b, "%d", d); flt(e->px, e->py, b, 0xaaddff);
		if (e->hp <= 0) killEnt(e);
		return;
	}
}
void enemyNetHit(int id, float frac) {
	for (int i = 0; i < NENT; i++) {
		Ent *e = &ents[i];
		if (e->k != K_EN || e->id != id || e->wb) continue;
		int d = (int)roundf(frac * e->mx); if (d < 1) d = 1;
		e->hp -= d; e->fl = .12f; e->al = 1;
		char b[16]; snprintf(b, sizeof b, "%d", d); flt(e->px, e->py, b, 0xaaddff);
		if (e->hp <= 0) killEnt(e);
		return;
	}
}
// equipaggiamento del negozio dell'arena (tabella AR dell'originale)
typedef struct { int s; const char *n; int c; float m; int cr, hp; } ArDef;
const ArDef AR[8] = {{SL_W, "Lama del Gladiatore", 40, 3.2f, 8, 0}, {SL_H, "Elmo del Campione", 25, 3.2f, 0, 30}, {SL_C, "Corazza del Colosseo", 35, 3.2f, 0, 50}, {SL_S, "Scudo dell'Arena", 25, 3.2f, 0, 30},
	{SL_W, "Tridente dei Mille Duelli", 120, 3.9f, 15, 0}, {SL_C, "Armatura del Gran Campione", 150, 3.9f, 0, 120}, {SL_H, "Corona del Vincitore", 90, 3.9f, 0, 80}, {SL_S, "Egida Insanguinata", 90, 3.9f, 0, 80}};
Item arItem(int k, int lv) {
	const ArDef *a = &AR[clampi(k, 0, 7)];
	Item it; memset(&it, 0, sizeof it);
	float ib = (a->s == SL_W ? 5 : a->s == SL_C ? 4 : 2.5f) + lv * (a->s == SL_W ? 2 : 1.4f);
	it.s = a->s; it.r = 4; it.v = (int)roundf(ib * a->m); it.p = it.v * 2; it.used = 1; it.cr = a->cr; it.hp = a->hp ? a->hp + lv * 3 : 0;
	snprintf(it.n, sizeof it.n, "%s", a->n);
	return it;
}
const char *arName(int k, int *cost) { *cost = AR[clampi(k, 0, 7)].c; return AR[clampi(k, 0, 7)].n; }
/* ---------------- sblocchi e risorse ---------------- */
bool hasUnl(const char *k) { for (int i = 0; i < 12; i++) if (P.unl[i][0] && !strcmp(P.unl[i], k)) return true; return false; }
void addUnl(const char *k) { if (hasUnl(k)) return; for (int i = 0; i < 12; i++) if (!P.unl[i][0]) { snprintf(P.unl[i], 16, "%s", k); return; } }
int resGet(const char *k) { for (int i = 0; i < 16; i++) if (P.res[i].k[0] && !strcmp(P.res[i].k, k)) return P.res[i].n; for (int i = 0; i < 24; i++) if (X.xres[i].k[0] && !strcmp(X.xres[i].k, k)) return X.xres[i].n; return 0; }
void resAdd(const char *k, int n) {
	for (int i = 0; i < 16; i++) if (P.res[i].k[0] && !strcmp(P.res[i].k, k)) { P.res[i].n = clampi(P.res[i].n + n, 0, 60000); return; }
	for (int i = 0; i < 16; i++) if (!P.res[i].k[0]) { snprintf(P.res[i].k, 16, "%s", k); P.res[i].n = clampi(n, 0, 60000); return; }
	// 3DS 1.5: le risorse nuove (mestieri) quando i 16 posti dell'eroe sono pieni
	for (int i = 0; i < 24; i++) if (X.xres[i].k[0] && !strcmp(X.xres[i].k, k)) { X.xres[i].n = clampi(X.xres[i].n + n, 0, 60000); return; }
	for (int i = 0; i < 24; i++) if (!X.xres[i].k[0]) { snprintf(X.xres[i].k, 16, "%s", k); X.xres[i].n = clampi(n, 0, 60000); return; }
}

/* ---------------- aggiornamento ---------------- */
static bool interactable(Ent *e) { return e->k == K_LEV || e->k == K_NPC || e->k == K_PO || e->k == K_CH || e->k == K_DR || e->k == K_SHARD || e->k == K_LORE; }
extern float stickX, stickY;
extern bool attackHeld;
static void enMove(Ent *e, float d, float dt) {
	float s = e->sp * dt;
	if (e->pn > e->pi && e->ept > gtime) {
		float dx = e->path[e->pi][0] + .5f - e->px, dy = e->path[e->pi][1] + .5f - e->py, dd = hyp(dx, dy);
		if (dd < .25f) e->pi++;
		else mv(&e->px, &e->py, dx / dd * fminf(s, dd), dy / dd * fminf(s, dd));
		if (hyp(P.px - e->px, P.py - e->py) < 1.2f) e->pn = e->pi = 0;
		if (fabsf(dx) > .01f || fabsf(dy) > .01f) e->face = faceOf(dx, dy);
		return;
	}
	float x0 = e->px, y0 = e->py;
	float dx = (P.px - e->px) / d, dy = (P.py - e->py) / d;
	mv(&e->px, &e->py, dx * s, dy * s);
	e->face = faceOf(dx, dy);
	if (hyp(e->px - x0, e->py - y0) < s * .55f) {
		e->stk += dt;
		if (e->stk > .3f && !(e->epw > gtime)) {
			e->stk = 0; e->epw = gtime + .8f;
			int n = pathFind((int)e->px, (int)e->py, (int)P.px, (int)P.py, e->path, 24);
			if (n) { e->pn = n; e->pi = 0; e->ept = gtime + 9; }
		}
	} else e->stk = 0;
}

static void zoneTick(float dt) {
	if (!zonePending) { if (zoneFade > 0) zoneFade = fmaxf(0, zoneFade - dt * 4); return; }
	zoneFade += dt * 4;
	if (zoneFade >= 1) {
		zoneFade = 1; zonePending = 0;
		loadZone(zoneTo, zoneFrom);
		if (zoneAtX > 0 && zoneAtY > 0 && !strcmp(Zk, zoneTo) && zoneAtX < N - 1 && zoneAtY < N - 1) {
			int x, y;
			if (nearFree((int)zoneAtX, (int)zoneAtY, &x, &y) && WK(M[y][x])) { P.px = x + .5f; P.py = y + .5f; P.dmk = 0; camX = camTX = 32 * (P.px - P.py); camY = camTY = 16 * (P.px + P.py) - 10; }
		}
		zoneAtX = zoneAtY = 0;
	}
}

void gameUpdate(float dt) {
	if (dt > .1f) dt = .1f;
	gtime += dt;
	zoneTick(dt);
	plTick(dt);
	if (!started) return;
	// tempo del giorno
	P.gt += dt;
	float h = gHour();
	NK = outdoor() ? nightK(h) : 0; DK = outdoor() ? duskK(h) : 0;
	int d = gDay();
	if (lastDay && d != lastDay) { char b[32]; snprintf(b, sizeof b, "Giorno %d", d); banner(b, "Un nuovo giorno ad Aldoria: i mercanti hanno cambiato i prezzi"); JINGLE(.14f, W_TRIANGLE, 60, 64, 67, 72); }
	lastDay = d;
	if (pendingMsgT > 0 && (pendingMsgT -= dt) <= 0) msg("%s", pendingMsg);
	if (shake > 0) shake = fmaxf(0, shake - dt);
	if (uiBlocking() || zonePending) { P.moving = 0; return; }

	P.at -= dt; P.sk -= dt; P.pc -= dt; P.fl -= dt; P.sw -= dt; P.bA -= dt; P.bD -= dt;
	if (!(P.moving && RUNNING) && !P.dmk && gtime - stT > .65f) { STA = fminf(stMax(), STA + dt * (P.moving ? 30 : 42)); if (STEX && STA >= stMax() * .3f) STEX = false; }
	if (P.moving == 0) RUNNING = false;
	P.iv = fmaxf(0, P.iv - dt); P.dgc = fmaxf(0, P.dgc - dt); P.lgc = fmaxf(0, P.lgc - dt); P.pf = fmaxf(0, P.pf - dt);
	if (P.hp <= 0) return;
	// schivata e affondo
	if (P.dmk) {
		P.dmt -= dt;
		float sp = P.dmv * dt;
		mv(&P.px, &P.py, P.dmx * sp, P.dmy * sp);
		if (P.dmk == 2) {
			for (int i = 0; i < NENT; i++) {
				Ent *e = &ents[i]; if (e->k != K_EN) continue;
				bool hit = false; for (int k = 0; k < P.ndmh; k++) if (P.dmh[k] == e->id) hit = true;
				if (hit || dist(e, P.px, P.py) >= 1.4f || P.ndmh >= 16) continue;
				P.dmh[P.ndmh++] = e->id;
				Roll r = roll(P.dmm); hurtE(e, r.d, r.cr);
				if (e->k == K_EN && !e->boss) mv(&e->px, &e->py, P.dmx * .5f, P.dmy * .5f);
			}
		}
		if (P.dmt <= 0) P.dmk = 0;
	}
	// movimento con la levetta: le direzioni dello schermo diventano direzioni isometriche
	P.moving = 0;
	float kx = stickX, ky = stickY, mag = hyp(kx, ky);
	if (mag > .18f && !P.dmk && !cbBusy()) {
		float dx = kx + ky, dy = ky - kx, dd = hyp(dx, dy);
		dx /= dd; dy /= dd;
		RUNNING = runHeld && STA > 0 && !STEX;
		float s = (3.9f + (RUNNING ? 1.95f : 0)) * dt * fminf(1, mag) * xSpeedMul(), r = .24f;
		if (RUNNING) { STA = fmaxf(0, STA - 16 * dt); stT = gtime; if (STA <= 0) { STEX = true; stTired(); } }
		float sgx = dx > 0 ? 1 : dx < 0 ? -1 : 0, sgy = dy > 0 ? 1 : dy < 0 ? -1 : 0;
		if (!blk(P.px + dx * s + sgx * r, P.py)) P.px += dx * s;
		if (!blk(P.px, P.py + dy * s + sgy * r)) P.py += dy * s;
		P.dr[0] = dx; P.dr[1] = dy; P.moving = 1;
		P.face = faceOf(dx, dy);
		TGT = NULL;
	}
	// oggetto con cui interagire
	IT = NULL;
	{ float bd = 2.0f; for (int i = 0; i < NENT; i++) { Ent *e = &ents[i]; if (!interactable(e) && !(e->k == K_X && e->xk != XK_ANI && xInteractable(e))) continue; float q = dist(e, P.px, P.py); if (q < bd) { bd = q; IT = e; } }
	  // l'animale si accarezza solo quando lì vicino non c'è altro (7.54.2)
	  if (!IT) { bd = 1.7f; for (int i = 0; i < NENT; i++) { Ent *e = &ents[i]; if (e->k != K_X || e->xk != XK_ANI || !xInteractable(e)) continue; float q = dist(e, P.px, P.py); if (q < bd) { bd = q; IT = e; } } } }
	cbUpdate(dt, attackHeld);
	if (TGT && TGT->k != K_EN) TGT = NULL;
	if (TGT && !P.dmk && !cbBusy()) {
		const CMove *m0 = &cbW()->c3[0];
		float dd = dist(TGT, P.px, P.py), rg = m0->r + eRad(TGT) - .05f;
		if (dd > 6.5f) TGT = NULL;
		else if (dd <= rg) { if (gtime - cbEnd > .35f) cbDo(0, false, true); }
		else if (!P.moving) {
			float dx = (TGT->px - P.px) / dd, dy = (TGT->py - P.py) / dd, sp = 3.9f * dt * xSpeedMul();
			mv(&P.px, &P.py, dx * sp, dy * sp);
			P.dr[0] = dx; P.dr[1] = dy; P.face = faceOf(dx, dy); P.moving = 1;
		}
	}
	// il bersaglio bloccato: l'eroe lo guarda sempre
	if (LOCK && !P.dmk) { float dx = LOCK->px - P.px, dy = LOCK->py - P.py; P.face = faceOf(dx, dy); if (!P.moving) { P.dr[0] = dx; P.dr[1] = dy; } }
	// personaggi che passeggiano
	for (int i = 0; i < NENT; i++) {
		Ent *e = &ents[i]; if (e->k != K_NPC || !e->wd) continue;
		if (e->pn > e->pi) {
			float dx = e->path[e->pi][0] + .5f - e->px, dy = e->path[e->pi][1] + .5f - e->py, dd = hyp(dx, dy), s = 1.6f * dt;
			if (dd <= s) { e->px = e->path[e->pi][0] + .5f; e->py = e->path[e->pi][1] + .5f; e->pi++; }
			else { e->px += dx / dd * s; e->py += dy / dd * s; e->face = faceOf(dx, dy); }
		} else if ((e->wt -= dt) <= 0) {
			e->wt = 2 + frnd() * 5;
			int x = (int)e->px + fri(0, 12) - 6, y = (int)e->py + fri(0, 12) - 6;
			if (x > 0 && y > 0 && x < N - 1 && y < N - 1 && (M[y][x] == 4 || (ZINT && M[y][x] == 0))) { e->pn = pathFind((int)e->px, (int)e->py, x, y, e->path, 14); e->pi = 0; }
		}
	}
	// nemici
	char zk0[32]; snprintf(zk0, sizeof zk0, "%s", Zk);
	for (int i = 0; i < NENT; i++) {
		Ent *e = &ents[i];
		if (strcmp(Zk, zk0)) break;
		if (e->k == K_DEAD && gtime - e->t0 > .7f) { entDel(e); continue; }
		if (e->k != K_EN) continue;
		e->fl -= dt; e->cdt -= dt; e->slt -= dt;
		if (e->pup) continue;                               // copia del nemico di un altro giocatore (7.41)
		if (e->cbs > gtime) continue;                       // stordito, congelato o preso dal sigillo
		if (e->ptg) { if (xPetAlive(e->ptg)) continue; e->ptg = 0; }   // insegue il compagno
		float spK = e->eSl > gtime ? e->eSlK : 1;
		float d = dist(e, P.px, P.py);
		// 7.41: un altro eroe più vicino: il nemico va da lui, e il colpo glielo manda il gioco
		{ extern Peer *syncNearestPeer(Ent *, float); extern void syncEH(const char *, float); Peer *tp = (e->al || d < e->ag) ? syncNearestPeer(e, d) : NULL;
		  if (tp) { float pd = hyp(tp->x - e->px, tp->y - e->py);
			if (pd > e->r * .9f) { float k = fminf(1, e->sp * dt * spK / fmaxf(pd, .01f)); mv(&e->px, &e->py, (tp->x - e->px) * k, (tp->y - e->py) * k); e->face = faceOf(tp->x - e->px, tp->y - e->py); }
			else if (e->cdt <= 0) { e->cdt = e->cd; e->atkT = gtime; e->atkD[0] = (tp->x - e->px) / fmaxf(pd, .01f); e->atkD[1] = (tp->y - e->py) / fmaxf(pd, .01f); e->face = faceOf(e->atkD[0], e->atkD[1]); syncEH(tp->id, e->at); }
			e->al = 1; continue; } }
		if (d < e->ag || e->al) {
			e->al = d < e->ag * 2.5f;
			const EnemyDef *b = &E[e->t];
			if (e->boss && !e->intro) {
				e->intro = 1;
				banner(e->name, "Un nemico potente ti sbarra la strada!");
				tone(70, .5f, W_SAW, .07f); shake = .3f;
			}
			if (e->boss && !e->enr && e->hp < e->mx * .5f) {
				e->enr = 1; e->sp *= 1.3f; e->cd *= .7f;
				msg("%s si infuria!", e->name); tone(90, .4f, W_SAW, .08f); shake = .35f;
				if (b->sum >= 0) for (int k = 0; k < 3; k++) {
					float a = k * 2.1f; int x, y;
					nearFree(clampi((int)floorf(e->px + cosf(a) * 1.7f), 1, N - 2), clampi((int)floorf(e->py + sinf(a) * 1.7f), 1, N - 2), &x, &y);
					if (WK(M[y][x])) { Ent *m = mkEn(b->sum, x, y); if (m) m->al = 1; e = &ents[i]; }
				}
			}
			if (b->slam && e->slt <= 0 && d < 5) {
				e->slt = e->enr ? 5 : 7;
				fxAdd(FX_WARN, e->px, e->py, 2.6f, 1.1f, e->at * 1.5f);
				tone(70, .3f, W_SAW, .05f);
			}
			if (d > e->r * .9f) enMove(e, d, dt * spK);
			else if (e->cdt <= 0) {
				e->cdt = e->cd;
				float dd = d > .001f ? d : 1;
				e->atkT = gtime; e->atkD[0] = (P.px - e->px) / dd; e->atkD[1] = (P.py - e->py) / dd;
				e->face = faceOf(e->atkD[0], e->atkD[1]);
				if (b->rng) shoot(e); else hurtP(e->at);
				if (P.hp <= 0 && !started) return;
			}
		}
	}
	// proiettili
	for (int i = 0; i < NPJ; i++) {
		Proj *p = &PJ[i];
		p->t -= dt; p->x += p->vx * dt; p->y += p->vy * dt;
		if (blk(p->x, p->y)) p->t = 0;
		else if (p->d < 0) {
			for (int k = 0; k < NENT; k++) { Ent *e = &ents[k]; if (e->k != K_EN || dist(e, p->x, p->y) > eRad(e) + .2f) continue;
				int d = (int)roundf(-p->d * (.8f + frnd() * .4f)); bool cr = frnd() * 100 < critV(); if (cr) d = (int)(d * 1.8f); hurtE(e, d < 1 ? 1 : d, cr); p->t = 0; break; }
		}
		else if (hyp(p->x - P.px, p->y - P.py) < .45f) { p->t = 0; hurtP(p->d); }
	}
	{ int j = 0; for (int i = 0; i < NPJ; i++) if (PJ[i].t > 0) PJ[j++] = PJ[i]; NPJ = j; }
	// effetti
	for (int i = 0; i < NFX; i++) {
		Fx *f = &FX[i]; f->t -= dt;
		if (f->k == FX_WARN && f->t <= 0) {
			fxAdd(FX_BOOM, f->x, f->y, f->r, .4f, 0);
			tone(60, .25f, W_SAW, .08f); shake = fmaxf(shake, .25f);
			if (hyp(P.px - f->x, P.py - f->y) < f->r) hurtP(f->dmg);
		}
	}
	{ int j = 0; for (int i = 0; i < NFX; i++) if (FX[i].t > 0) FX[j++] = FX[i]; NFX = j; }
	for (int i = 0; i < NPOP; i++) POP[i].t -= dt;
	{ int j = 0; for (int i = 0; i < NPOP; i++) if (POP[i].t > 0) POP[j++] = POP[i]; NPOP = j; }
	for (int i = 0; i < NPARTS; i++) {
		Part *q = &PARTS[i]; q->t -= dt; q->x += q->vx * dt * 60 / 60; q->y += q->vy * dt; q->z += q->vz * dt; q->vz -= 120 * dt;
		if (q->z < 0) { q->z = 0; q->vz *= -.3f; }
	}
	{ int j = 0; for (int i = 0; i < NPARTS; i++) if (PARTS[i].t > 0) PARTS[j++] = PARTS[i]; NPARTS = j; }
	levTick();
	// musica del boss
	if ((bossT -= dt) <= 0) {
		bossT = .5f;
		bool b = false;
		for (int i = 0; i < NENT; i++) { Ent *e = &ents[i]; if (e->k == K_EN && e->boss && e->al && dist(e, P.px, P.py) < 14) b = true; }
		music(b ? MUS_BOSS : zoneMusic(ZMUS));   // di notte in città il notturno, come nel browser
		npcMarks();
	}
	xTick(dt);
	if ((saveT -= dt) <= 0) { saveT = 30; saveGame(); }
}

/* ---------------- nuova partita e salvataggi ---------------- */
void newGame(int df, const char *name) {
	char nm[16]; snprintf(nm, sizeof nm, "%s", name && *name ? name : "Eroe");   // name può puntare a P.name
	memset(&P, 0, sizeof P); xNew();
	STA = 100 + 1; STEX = false;
	P.hp = 75; P.mx = 75; P.lv = 1; P.g = 30; P.pot = 3; P.gt = 480;
	P.eq[SL_W] = (Item){SL_W, 0, 0, 0, 3, 0, 0, "Pugnale", 1};
	P.df = df; P.face = 1; P.dr[1] = 1;
	snprintf(P.name, sizeof P.name, "%s", nm);
	MODE_DEAD = 0;
	started = true;
	lastDay = 0;
	recalc();
	loadZone("town", NULL);
#ifdef VOX_TEST
	P.lv = 6; P.pot = 9; P.g = 5000; recalc(); P.hp = P.mx;
	P.eq[SL_W] = mkItem(6, 2, SL_W);
	if (VOX_TEST == 1) loadZone("forest", "town");
	if (VOX_TEST == 2) { loadZone("tana@1", NULL); for (int i = 0; i < NENT; i++) if (ents[i].k == K_LEV && ents[i].lev[1] == '1') { int u, v; nearFree((int)ents[i].px + 1, (int)ents[i].py + 1, &u, &v); P.px = u + .5f; P.py = v + .5f; }
		for (int i = 0; i < NENT; i++) if (ents[i].k == K_EN && hyp(ents[i].px - P.px, ents[i].py - P.py) < 8) entDel(&ents[i]);
		for (int q = 0; q < 5; q++) { int k = questIdx((const char *[]){"c1", "m1", "b1", "g1", "l1"}[q]); if (k >= 0) P.q[P.nq++] = (Quest){k, npcIdx("marcus"), 0}; } }
	if (VOX_TEST == 3) { P.gt = 1320; loadZone("in_castle", "town"); }
	if (VOX_TEST == 4) { P.gt = 1320; }
	if (VOX_TEST == 5) loadZone("porto", "town");
	if (VOX_TEST == 6) loadZone("arena", "town");
	if (VOX_TEST == 7) loadZone("thal48", NULL);
	if (VOX_TEST == 8) { P.gt = 1340; loadZone("peaks", "town"); }
	// 3DS 1.5: cavallo, animale e compagno; la Casa degli alleati e il Viandante; un mostro da domare
	if (VOX_TEST >= 20 && VOX_TEST <= 26) {
		X.cavOwn = 3; X.cavSel = 1; X.cavCol = 1; X.cavOn = 1; X.seal = 5;
		X.ani[0].t = 0; snprintf(X.ani[0].n, 16, "Fido"); X.nani = 1; X.aniOn = 0;
		XPet *p = &X.pets[0]; memset(p, 0, sizeof *p); snprintf(p->t, sizeof p->t, "lupo"); snprintf(p->n, sizeof p->n, "Lupo"); p->lv = 12; X.npet = 1; X.pet = 0;
		X.bossCh[0] = 1; X.titles = 1; X.title = 0; X.ess[1] = 9;
		P.eq[SL_W].el = (1 << 3) | 2;
	}
	if (VOX_TEST == 20) loadZone("campi", "town");
	if (VOX_TEST == 23) loadZone("forest", "town");
	if (VOX_TEST == 24) { X.cavOn = 0; resAdd("grano", 5); resAdd("uova", 5); resAdd("mela", 3); resAdd("ferro", 6); resAdd("carbone", 4); loadZone("town", NULL); P.px = 32.5f; P.py = 41.5f; xOpen(XP_MEST); }
	if (VOX_TEST == 26) { X.cavOn = 0; loadZone("town", NULL); xOpen(XP_TORRE); }
	if (VOX_TEST == 25) { X.cavOn = 0; X.ess[6] = 20; loadZone("in_serraglio", "town"); xOpen(XP_SERR); }
	if (VOX_TEST == 21) { X.cavOn = 0; loadZone("town", NULL); P.px = 34.5f; P.py = 37.4f; }
	if (VOX_TEST == 22) { X.pet = -1; loadZone("forest", "town"); for (int i = 0; i < NENT; i++) if (ents[i].k == K_EN && !ents[i].boss) { ents[i].px = P.px + 2; ents[i].py = P.py + 1; ents[i].hp = ents[i].mx * .2f; break; } }
#ifdef VOX_URL
	snprintf(NETC.url, sizeof NETC.url, "%s", VOX_URL); snprintf(NETC.code, sizeof NETC.code, "test3ds"); netStart();
#endif
#endif
	char b[120]; snprintf(b, sizeof b, "Benvenuto ad Aldoria, %s. Il Re Aldric ti attende al castello.", P.name);
	banner("Il Regno Perduto", b);
}
void gameInit(void) {
	mkdir("sdmc:/3ds", 0777);
	mkdir(SAVEDIR, 0777);
	// 7.2: le missioni che pagano molto ora pagano un po' meno, in proporzione
	for (int i = 0; i < NQT; i++) {
		QuestDef *T = &QT[i]; int g = T->g, x = T->x;
		T->g = (int)fmaxf(10, roundf(g * (.9f - .3f * fminf(1, fmaxf(0, (g - 60) / 840.f)))));
		T->x = (int)fmaxf(8, roundf(x * (.88f - .26f * fminf(1, fmaxf(0, (x - 50) / 600.f)))));
	}
	setLoad();
}
typedef struct { u32 magic, ver, size; Hero p; } SaveFile;
void saveGame(void) {
	if (!started || MODE_DEAD) return;
	FILE *f = fopen(SAVEF, "wb"); if (!f) return;
	SaveFile s; s.magic = SAVE_MAGIC; s.ver = SAVE_VER; s.size = sizeof(Hero); s.p = P;
	fwrite(&s, sizeof s, 1, f); xSave(f); fclose(f);
}
bool hasSave(void) {
	FILE *f = fopen(SAVEF, "rb"); if (!f) return false;
	u32 m = 0; fread(&m, 4, 1, f); fclose(f); return m == SAVE_MAGIC;
}
bool loadGame(void) {
	FILE *f = fopen(SAVEF, "rb"); if (!f) return false;
	static SaveFile s;
	size_t n = fread(&s, sizeof s, 1, f);
	if (n != 1 || s.magic != SAVE_MAGIC || s.ver != SAVE_VER || s.size != sizeof(Hero)) { fclose(f); return false; }
	bool hasX = xLoad(f); fclose(f);
	P = s.p;
	// salvataggio di prima della 1.5: il byte dell'elemento delle armi era riempimento, va azzerato
	if (!hasX) { for (int i = 0; i < 4; i++) P.eq[i].el = 0; for (int i = 0; i < INV; i++) P.inv[i].el = 0; }
	P.dmk = 0; P.iv = P.at = P.sk = P.pc = P.sw = P.dgc = P.lgc = P.pf = P.fl = 0;
	if (P.hp <= 0) P.hp = P.mx;
	MODE_DEAD = 0; started = true; lastDay = 0;
	recalc();
	loadZone("town", NULL);
	char b[80]; snprintf(b, sizeof b, "Bentornato, %s.", P.name);
	banner("Partita caricata", b);
	return true;
}
void deleteSave(void) { remove(SAVEF); }
void setSave(void) { FILE *f = fopen(SETF, "wb"); if (!f) return; fwrite(&SET, sizeof SET, 1, f); fwrite(&NETC, sizeof NETC, 1, f); fclose(f); }
void setLoad(void) {
	FILE *f = fopen(SETF, "rb"); if (!f) return;
	Settings s; if (fread(&s, sizeof s, 1, f) == 1) SET = s;
	NetCfg nc; if (fread(&nc, sizeof nc, 1, f) == 1) { NETC = nc; NETC.url[sizeof NETC.url - 1] = 0; NETC.code[sizeof NETC.code - 1] = 0; NETC.on = false; }
	fclose(f);
	SET.zoom = clampf(SET.zoom, .4f, 1.1f);
	SET.mu = clampf(SET.mu, 0, 1); SET.sf = clampf(SET.sf, 0, 1);
}
