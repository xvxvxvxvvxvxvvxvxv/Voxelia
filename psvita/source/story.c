// Voxelia PS Vita (motore del port 3DS) - le meccaniche della Modalità Storia arrivate nel browser dopo la 7.50 (fino alla 7.57):
// cavalli e corsa (7.46), animali da compagnia (7.47/7.49), compagni domati (7.20/7.54), elementi ed Essenze (7.55),
// scelte, alleati, vie e titoli (7.48), con gli stessi messaggi di rete del browser, così chi gioca dal browser
// vede sulla 3DS quello che vede dagli altri browser (e viceversa).
// Le regole e i numeri sono quelli del codice originale (src/8zzzf_cavalli.js, 8zzzn_animali.js, 8zv_domare.js,
// 8zzzz_compagni.js, 8zzzzb_elementi.js, 8zzzq_scelte.js); i modelli arrivano da tools/export.js (data.json → XM).
#include "voxelia.h"
#include "story.h"

#define C_TXT C2D_Color32(232, 236, 244, 255)
#define C_MU C2D_Color32(154, 164, 184, 255)
#define C_GOLD C2D_Color32(245, 185, 66, 255)
#define C_GREEN C2D_Color32(122, 255, 138, 255)

HeroX X;
static float XT;   // orologio delle animazioni
static inline float dst(float ax, float ay, float bx, float by) { return hyp(ax - bx, ay - by); }
static u32 xuidN = 1;

/* ================= casualità con seme (sd e hs del browser) ================= */
typedef struct { u32 a; } Sd;
static float sdNext(Sd *s) {
	s->a = s->a + 0x6D2B79F5u; u32 t = s->a;
	t = (t ^ (t >> 15)) * (1u | t);
	t = (t + ((t ^ (t >> 7)) * (61u | t))) ^ t;
	return (float)((t ^ (t >> 14)) / 4294967296.0);
}

/* ================= modelli esportati ================= */
static int MD_CAV[5] = {-1, -1, -1, -1, -1}, MD_ANI[8] = {-1, -1, -1, -1, -1, -1, -1, -1}, MD_STALLA = -1, MD_GARA = -1, MD_ANIS = -1;
static const char *CAVK[5] = {"baio", "morello", "grigio", "pezzato", "corsiero"};
static const char *CAVCN[4] = {"Baio", "Morello", "Grigio", "Pezzato"};
typedef struct { const char *k, *n, *d; float v; int p; } CavDef;
static const CavDef CAV46[3] = {{"puledro", "Puledro", "Un cavallino giovane e vivace", 1.45f, 300}, {"destriero", "Destriero", "Forte, veloce e coraggioso", 1.7f, 1200}, {"corsiero", "Corsiero d'oro", "Il più veloce del regno: corre come il vento", 2, 4000}};
typedef struct { const char *k, *n, *fi, *d; int p; } AniDef;
static const AniDef ANI47[8] = {
	{"cane", "Cane", "oro", "Trova monete e, a volte, un oggetto", 400}, {"gatto", "Gatto", "pesce", "Ti porta i pesci", 400},
	{"volpe", "Volpe", "ris", "Fiuta legna, pietra, ferro e rame", 700}, {"coniglio", "Coniglio", "cibo", "Trova mele, grano e uova", 500},
	{"gufo", "Gufo", "pot", "Ti porta pozioni (di più di notte)", 900}, {"maialino", "Maialino", "tartufo", "Scava tartufi: valgono tanto oro", 900},
	{"pinguino", "Pinguino", "mare", "Conchiglie, ghiaccio e qualche pesce", 1100}, {"draghetto", "Draghetto", "gemma", "Trova gemme e pepite d'oro", 3500}};
int aniIdx(const char *k) { for (int i = 0; i < 8; i++) if (k && !strcmp(ANI47[i].k, k)) return i; return -1; }
int cavIdx(const char *k) { for (int i = 0; i < 3; i++) if (k && !strcmp(CAV46[i].k, k)) return i; return -1; }
static int coatIdx(const char *k) { for (int i = 0; i < 4; i++) if (k && !strcmp(CAVK[i], k)) return i; return 0; }

static J *XPROPS;
int xPropKind(const char *k) {
	static const char *K[] = {"stalla46", "gara46", "ani47s", "dil48", "al48", "mest47", "torre43", "carte47"}; static const u8 V[] = {XK_STALLA, XK_GARA, XK_ANISHOP, XK_VIAND, XK_ALLY, XK_MEST, XK_TORRE, XK_CARTE};
	for (int i = 0; i < 8; i++) if (!strcmp(k, K[i])) return V[i]; return 0;
}
int xPropModel(const char *k) { return (int)jgn(XPROPS, k, -1); }
void xModels(J *xm) {
	XPROPS = jget(xm, "props");
	J *c = jget(xm, "cav"); for (int i = 0; i < 5; i++) MD_CAV[i] = (int)jgn(c, CAVK[i], -1);
	J *a = jget(xm, "ani"); for (int i = 0; i < 8; i++) MD_ANI[i] = (int)jgn(a, ANI47[i].k, -1);
	extern void xModels2(J *); xModels2(xm);
	J *p = jget(xm, "props"); MD_STALLA = (int)jgn(p, "stalla46", -1); MD_GARA = (int)jgn(p, "gara46", -1); MD_ANIS = (int)jgn(p, "ani47s", -1);
}

/* ================= salvataggio ================= */
void xNew(void) { memset(&X, 0, sizeof X); X.pet = -1; X.aniOn = -1; X.title = -1; }
void xSave(FILE *f) { X.magic = XMAGIC; X.size = sizeof X; fwrite(&X, sizeof X, 1, f); }
bool xLoad(FILE *f) {
	static HeroX h; xNew();
	if (!f || fread(&h, 1, 8, f) != 8 || h.magic != XMAGIC) return false;
	u32 sz = h.size; if (sz > sizeof h) sz = sizeof h;
	memset((u8 *)&h + 8, 0, sizeof h - 8);
	if (fread((u8 *)&h + 8, 1, sz - 8, f) != sz - 8) return false;
	X = h;
	if (X.npet > XPETS) X.npet = 0;
	if (X.pet >= X.npet) X.pet = -1;
	if (X.nani > 8) X.nani = 0;
	if (X.aniOn >= X.nani) X.aniOn = -1;
	for (int i = 0; i < X.npet; i++) X.pets[i].n[sizeof X.pets[i].n - 1] = 0, X.pets[i].t[sizeof X.pets[i].t - 1] = 0;
	if (X.ndep > 30) X.ndep = 0;
	return true;
}

/* ================= entità della storia ================= */
Ent *xEntNew(u8 xk, float x, float y) {
	Ent *e = entNew(K_X, x, y); if (!e) return NULL;
	e->xk = xk; e->uid = xuidN++; return e;
}
static bool alive(Ent *e, u32 uid) { return e && e->k == K_X && e->uid == uid; }
static bool freeAt(int x, int y, float gap) {
	if (x < 2 || y < 2 || x >= N - 2 || y >= N - 2) return false;
	if (!(M[y][x] == 0 || M[y][x] == 4) || OCCT[y][x]) return false;
	for (int i = 0; i < NENT; i++) { Ent *e = &ents[i]; if (!e->k) continue; if (fabsf(e->px - x - .5f) < gap && fabsf(e->py - y - .5f) < gap) return false; }
	return true;
}
// spot47 del browser: la prima casella libera intorno a (cx, cy)
bool xSpot(int cx, int cy, float gap, int *ox, int *oy) {
	for (int r = 0; r < 10; r++) for (int dy = -r; dy <= r; dy++) for (int dx = -r; dx <= r; dx++) {
		if (abs(dx) != r && abs(dy) != r) continue;
		if (freeAt(cx + dx, cy + dy, gap)) { *ox = cx + dx; *oy = cy + dy; return true; }
	}
	return false;
}

/* ================= CAVALLI (7.46) ================= */
static bool cavOk(void) { return ZOUT && !ZINT && ZDG < 0 && strcmp(Zk, "arena") && strncmp(Zk, "mare", 4); }
bool cavOn(void) { return X.cavOn && X.cavOwn && cavOk(); }
static int cavBreed(void) { int s = clampi(X.cavSel, 0, 2); if (X.cavOwn & (1 << s)) return s; for (int i = 0; i < 3; i++) if (X.cavOwn & (1 << i)) return i; return 0; }
float xSpeedMul(void) { return cavOn() && !P.dmk ? CAV46[cavBreed()].v : 1; }
float xHeroZ(void) { return cavOn() ? 16 : 0; }
void cavToggle(void) {
	if (!started) return;
	if (!X.cavOwn) { msg("Non hai un cavallo: lo compri allo Stallo dei Campi (Aldoria Est)"); return; }
	if (!X.cavOn && !cavOk()) { msg("Qui non si può andare a cavallo"); return; }
	X.cavOn = !X.cavOn;
	tone(X.cavOn ? 520 : 300, .08f, W_TRIANGLE, .05f);
	if (X.cavOn) { msg("In sella al tuo %s (pulsante Sella per scendere)", CAV46[cavBreed()].n); whoosh(); }
	saveGame();
}
static int cavModel(int breed, int coat) { return breed == 2 ? MD_CAV[4] : MD_CAV[clampi(coat, 0, 3)]; }
// il cavallo sotto un eroe: fermo o al passo, girato dove guarda l'eroe
void cavDrawAt(int breed, int coat, float x, float y, int fc, bool mov, float ph) {
	int m = cavModel(breed, coat); if (m < 0) return;
	int fr = mov ? ((int)(ph / 2.1f)) % 3 : 3;
	drawModelFrame(m, (fc & 7) * 4 + fr, x, y, 0, 0, 255);
}
// la corsa: otto porte di luce intorno alla zona, nello stesso ordine per tutti (stesso seme del browser)
static struct { bool on; char zk[32]; float cp[9][2]; int n, i; float t0; } CR;
static void cavCourse(Ent *st) {
	Sd r = {hs(Zk) ^ 0}; { char b[48]; snprintf(b, sizeof b, "%s|corsa", Zk); r.a = hs(b); }
	float c = N / 2.f, R0 = N * .33f; static s16 d[MAXN * MAXN];
	bfs((int)st->px, (int)st->py, d);
	float L[8][2]; int nl = 0;
	for (int i = 0; i < 8; i++) {
		float a = (i / 8.f) * 6.283f + sdNext(&r) * .4f - .2f, k1 = .8f + sdNext(&r) * .35f; float tx = c + cosf(a) * R0 * k1;
		float k2 = .8f + sdNext(&r) * .35f; float ty = c + sinf(a) * R0 * k2;
		float bd = 1e9f; int bx = -1, by = -1;
		for (int y = 2; y < N - 2; y++) for (int x = 2; x < N - 2; x++) { if (d[y * N + x] < 0 || (M[y][x] != 0 && M[y][x] != 4)) continue; float q = hyp(x - tx, y - ty); if (q < bd) { bd = q; bx = x; by = y; } }
		if (bx >= 0) { L[nl][0] = bx + .5f; L[nl][1] = by + .5f; nl++; }
	}
	int k0 = 0; float b0 = 1e9f; for (int i = 0; i < nl; i++) { float q = dst(L[i][0], L[i][1], st->px, st->py); if (q < b0) { b0 = q; k0 = i; } }
	CR.n = 0; for (int i = 0; i < nl; i++) { CR.cp[CR.n][0] = L[(k0 + i) % nl][0]; CR.cp[CR.n][1] = L[(k0 + i) % nl][1]; CR.n++; }
	CR.cp[CR.n][0] = st->px; CR.cp[CR.n][1] = st->py; CR.n++;
}
static float *cavBestP(void) { for (int i = 0; i < 6; i++) if (!strcmp(X.cavBestZ[i], Zk)) return &X.cavBest[i]; return NULL; }
static void cavRace(Ent *st) {
	cavCourse(st); if (CR.n < 5) { msg("Qui la corsa non si può fare"); return; }
	CR.on = true; snprintf(CR.zk, sizeof CR.zk, "%s", Zk); CR.i = 0; CR.t0 = gtime;
	banner("3... 2... 1... via!", "Attraversa le porte di luce in ordine");
	JINGLE(.25f, W_SQUARE, 60, 60, 60, 72);
}
static void cavRaceTick(void) {
	if (!CR.on) return;
	if (strcmp(CR.zk, Zk)) { CR.on = false; return; }
	float *p = CR.cp[CR.i];
	if (dst(P.px, P.py, p[0], p[1]) < 1.7f) {
		CR.i++; tone(600 + CR.i * 60, .08f, W_TRIANGLE, .05f);
		if (CR.i >= CR.n) {
			float s = roundf((gtime - CR.t0) * 10) / 10; CR.on = false;
			float *b = cavBestP();
			if (!b) { for (int i = 0; i < 6; i++) if (!X.cavBestZ[i][0]) { snprintf(X.cavBestZ[i], 16, "%s", Zk); b = &X.cavBest[i]; *b = 0; break; } }
			if (b && (!*b || s < *b)) { *b = s; char m[64]; snprintf(m, sizeof m, "Corsa finita in %.1f secondi", s); banner("Nuovo record!", m); JINGLE(.09f, W_TRIANGLE, 67, 72, 76, 79, 84); }
			else msg("Traguardo! %.1f secondi (record: %.1f)", s, b ? *b : s);
			saveGame();
		} else if (CR.i == CR.n - 1) msg("Ultima porta passata: torna al traguardo!");
	}
}
static __attribute__((unused)) void cavPlace(void) {
	if (strcmp(Zk, "campi")) return;
	int ax = -1, ay = -1, bx = -1, by = -1;
	for (int r = 0; r < 10 && bx < 0; r++) for (int dy = -r; dy <= r && bx < 0; dy++) for (int dx = -r; dx <= r && bx < 0; dx++) {
		int x = 22 + dx, y = 40 + dy; if (!freeAt(x, y, 1.6f)) continue;
		if (ax < 0) { ax = x; ay = y; } else if (hyp(x - ax, y - ay) >= 2.5f) { bx = x; by = y; }
	}
	Ent *e;
	if (ax >= 0 && (e = xEntNew(XK_STALLA, ax + .5f, ay + .5f))) { snprintf(e->name, sizeof e->name, "Stallo dei cavalli"); e->model = MD_STALLA; }
	if (bx >= 0 && (e = xEntNew(XK_GARA, bx + .5f, by + .5f))) { snprintf(e->name, sizeof e->name, "Corsa a cavallo"); e->model = MD_GARA; }
}

/* ================= ANIMALI DA COMPAGNIA (7.47, 7.49, 7.54.2) ================= */
enum { AS_WALK, AS_IDLE, AS_SIT, AS_SLEEP, AS_HAPPY, AS_DIG, AS_SNIFF, AS_LOOK };
typedef struct { bool on; u32 uid; float ox, oy, it, stT, dg, hrt, mv, ph; int st, fc; } AniSt;
static AniSt AME;              // il mio animale
static float aniHid, aniLX, aniLY, aniNx;
static Ent *aniEnt(u32 *uid, int t, const char *n, float x, float y) {
	for (int i = 0; i < NENT; i++) if (ents[i].k == K_X && ents[i].uid == *uid) { Ent *e = &ents[i]; e->xs = t; snprintf(e->name, sizeof e->name, "%s", n); return e; }
	Ent *e = xEntNew(XK_ANI, x, y); if (!e) return NULL; e->xs = t; snprintf(e->name, sizeof e->name, "%s", n); *uid = e->uid; e->ph = frnd() * 6; return e;
}
static void aniState(Ent *e, float dt, float ox, float oy, float hx, float hy) {
	bool moved = dst(e->px, e->py, ox, oy) > .004f; int st;
	if (moved) { e->face = faceOf(e->px - ox, e->py - oy); st = AS_WALK; e->ait = 0; }
	else { e->ait += dt; if (e->ait > .6f && dst(hx, hy, e->px, e->py) < 4) e->face = faceOf(hx - e->px, hy - e->py); }
	if (!moved) {
		if (e->adg > 0 && XT - e->adg < 1.4f) st = AS_DIG;
		else if (e->hrt > 0 && XT - e->hrt < 1.4f) st = AS_HAPPY;
		else if (aniHid > 14 && e->ait > 5 && e->xs >= 0) st = AS_SLEEP;
		else if (e->ait > 2.5f) {
			int cyc = ((int)floorf((e->ait + e->ph * 3) / 4)) % 4; int A = e->xs;
			if (A == 0 || A == 1 || A == 2) st = cyc == 1 ? AS_LOOK : cyc == 3 ? AS_SNIFF : AS_SIT;
			else if (A == 3 || A == 5) st = cyc % 2 ? AS_SNIFF : AS_LOOK;
			else st = cyc == 2 ? AS_LOOK : AS_IDLE;
		} else st = AS_IDLE;
	}
	if (st != e->ast) { e->ast = st; e->stT = XT; }
}
// dietro all'eroe, un po' di lato (dalla parte opposta del compagno domato), come nella 7.54.2
static void aniFollowMe(Ent *e, float dt) {
	float l = hyp(P.dr[0], P.dr[1]); float fx = l > 0 ? P.dr[0] / l : 0, fy = l > 0 ? P.dr[1] / l : 1;
	float gx = P.px - fx * 1.25f - fy * .75f, gy = P.py - fy * 1.25f + fx * .75f;
	if (blk(gx, gy)) { gx = P.px - fx * 1.25f; gy = P.py - fy * 1.25f; if (blk(gx, gy)) { gx = P.px - .6f; gy = P.py + .5f; } }
	float dx = gx - e->px, dy = gy - e->py, d = hyp(dx, dy), dp = dst(P.px, P.py, e->px, e->py);
	if (d > 8 || dp > 9) { e->px = gx; e->py = gy; e->mvT = 0; return; }
	if (d > .35f) { float s = fminf(d - .2f, (d > 3 ? 7 : dp < .9f ? 5 : 3.6f) * dt); e->px += dx / d * s; e->py += dy / d * s; e->mvT = .2f; }
	else e->mvT = fmaxf(0, e->mvT - dt);
}
static void aniFollow(Ent *e, float tx, float ty, float dt) {
	float dx = tx - e->px, dy = ty - e->py, d = hyp(dx, dy);
	if (d > 8) { e->px = tx; e->py = ty; return; }
	if (d > 1.1f) { float s = fminf(d - 1, (d > 3 ? 7 : 3.6f) * dt); e->px += dx / d * s; e->py += dy / d * s; }
}
static void aniFind(int t, Ent *e) {
	const AniDef *A = &ANI47[t]; int lv = ZLV ? ZLV : P.lv; char s[48] = "";
	float r = frnd();
	static const char *RIS[6] = {"legna", "pietra", "ferro", "rame", "legna", "pietra"}, *CIBO[3] = {"mela", "grano", "uova"};
	if (r < .05f && P.ninv < INV) { Item it = mkItem(lv, 1, -1); gain(it); snprintf(s, sizeof s, "%s", it.n); }
	else if (!strcmp(A->fi, "oro")) { int g = (int)roundf(12 + lv * 4 + frnd() * 20); P.g += g; snprintf(s, sizeof s, "%d monete", g); }
	else if (!strcmp(A->fi, "pesce")) { resAdd("pesce", 1); snprintf(s, sizeof s, "un pesce"); }
	else if (!strcmp(A->fi, "ris")) { const char *k = RIS[fri(0, 5)]; resAdd(k, 1); snprintf(s, sizeof s, "%s", k); }
	else if (!strcmp(A->fi, "cibo")) { const char *k = CIBO[fri(0, 2)]; resAdd(k, 1); snprintf(s, sizeof s, "%s", k); }
	else if (!strcmp(A->fi, "pot")) { int n = (NK > .5f || frnd() < .3f) ? 2 : 1; P.pot += n; snprintf(s, sizeof s, n > 1 ? "%d pozioni" : "%d pozione", n); }
	else if (!strcmp(A->fi, "tartufo")) { int g = (int)roundf(30 + lv * 8 + frnd() * 40); P.g += g; snprintf(s, sizeof s, "un tartufo (%d monete)", g); }
	else if (!strcmp(A->fi, "mare")) { if (frnd() < .4f) { resAdd("pesce", 1); snprintf(s, sizeof s, "un pesce"); } else { const char *k = frnd() < .5f ? "conchiglia" : "ghiaccio"; resAdd(k, 1); snprintf(s, sizeof s, "%s", k); } }
	else { const char *k = frnd() < .4f ? "gemma" : "pepita"; resAdd(k, 1); snprintf(s, sizeof s, "%s", k); }
	X.aniF++;
	char b[64]; snprintf(b, sizeof b, "%s", s); flt(e->px, e->py, b, 0xffe08a);
	msg("%s ha trovato: %s", X.ani[X.aniOn].n, s); tone(880, .06f, W_TRIANGLE, .05f);
	saveGame();
}
static float aniDigAt = -1;
static void aniTick(float dt) {
	{ bool mv = dst(P.px, P.py, aniLX, aniLY) > .002f; aniHid = mv ? 0 : aniHid + dt; aniLX = P.px; aniLY = P.py; }
	Ent *me = NULL; for (int i = 0; i < NENT; i++) if (ents[i].k == K_X && ents[i].uid == AME.uid) me = &ents[i];
	if (X.aniOn >= 0 && X.aniOn < X.nani && started) {
		XAni *a = &X.ani[X.aniOn];
		Ent *e = aniEnt(&AME.uid, a->t, a->n, P.px - .6f, P.py + .5f); if (!e) return;
		e->xo = 1;   // il mio
		float ox = e->px, oy = e->py;
		if (!(e->adg > 0 && XT - e->adg < 1.4f)) aniFollowMe(e, dt);
		aniState(e, dt, ox, oy, P.px, P.py);
		if (!aniNx) aniNx = XT + 50 + frnd() * 40;
		if (XT > aniNx && P.hp > 0 && PM == PM_NONE) { aniNx = XT + 60 + frnd() * 60; e->adg = XT; aniDigAt = XT + 1.3f; }
		if (aniDigAt > 0 && XT >= aniDigAt) { aniDigAt = -1; aniFind(a->t, e); }
	} else if (me) { entDel(me); AME.uid = 0; }
}
static void aniBuy(int k) {
	const AniDef *A = &ANI47[k];
	for (int i = 0; i < X.nani; i++) if (X.ani[i].t == k) { msg("Ce l'hai già"); return; }
	if (X.nani >= 8) return;
	if (P.g < A->p) { msg("Servono %d monete", A->p); tone(150, .1f, W_SQUARE, .04f); return; }
	P.g -= A->p; XAni *q = &X.ani[X.nani]; q->t = k; snprintf(q->n, sizeof q->n, "%s", A->n); X.aniOn = X.nani; X.nani++;
	banner("Hai un nuovo amico!", "Ti seguirà dappertutto");
	JINGLE(.09f, W_TRIANGLE, 67, 72, 76, 79); aniNx = 0; saveGame();
}
static __attribute__((unused)) void aniShop(void) {
	if (strcmp(Zk, "town")) return;
	int x, y; if (xSpot(40, 36, 2, &x, &y)) { Ent *e = xEntNew(XK_ANISHOP, x + .5f, y + .5f); if (e) { snprintf(e->name, sizeof e->name, "Negozio degli animali"); e->model = MD_ANIS; } }
}
static int aniFrame(Ent *e) {
	switch (e->ast) {
	case AS_WALK: return ((int)(XT * 12 / 2.1f)) % 3;
	case AS_SIT: return 4; case AS_SLEEP: return 5; case AS_HAPPY: return 6; case AS_DIG: return 7;
	default: return 3;
	}
}

/* ================= COMPAGNI DOMATI (7.20, 7.54) ================= */
typedef struct { const char *n, *sp, *d; } FamDef;
static const FamDef DOMF[6] = {{"Belva", "Morso feroce", "fa sanguinare"}, {"Guerriero", "Colpo tremendo", "stordisce"}, {"Artropode", "Veleno", "rallenta e logora"},
	{"Creatura magica", "Dardo arcano", "colpisce da lontano"}, {"Melma", "Cura", "ti cura"}, {"Volante", "Picchiata", "colpo rapido e preciso"}};
enum { F_BES, F_GUE, F_ART, F_MAG, F_MEL, F_VOL };
#define DOMSEAL 60
static int domMax(void) { return 12; }
static int domFam(int t) {
	if (t < 0) return F_GUE;
	const char *k = E[t].kind;
	if (E[t].rng || !strcmp(k, "ghost") || !strcmp(k, "elem") || !strcmp(k, "eye") || !strcmp(k, "jelly")) return F_MAG;
	if (!strcmp(k, "q")) return F_BES; if (!strcmp(k, "a")) return F_ART; if (!strcmp(k, "slime")) return F_MEL;
	if (!strcmp(k, "bat") || !strcmp(k, "eel")) return F_VOL;
	return F_GUE;
}
typedef struct { int mx; float at, sp, cd; int ev; } DStat;
static DStat domStats(const XPet *p) {
	int t = enemyIdx(p->t); DStat s;
	float hp = t >= 0 ? E[t].hp : 40, at = t >= 0 ? E[t].at : 6, sp = t >= 0 ? E[t].sp : 2, cd = t >= 0 ? E[t].cd : 1.2f;
	int tb = p->mu ? enemyIdx(p->tb) : -1;   // incrocio: la media dei due genitori, un po' di più (molto di più se è mutato)
	if (tb >= 0) { float m = p->mu == 2 ? 1.15f : 1.05f; hp = (hp + E[tb].hp) / 2 * m; at = (at + E[tb].at) / 2 * m; sp = (sp + E[tb].sp) / 2; cd = (cd + E[tb].cd) / 2; }
	at *= 1 + pvBonus(p);
	s.ev = p->lv >= 20 ? 2 : p->lv >= 10 ? 1 : 0;
	float k = (1 + p->lv * .12f + s.ev * .25f) * (1 + X.srvB[0] * 0);   // la Pensione/Allevamento non c'è ancora
	s.mx = (int)roundf(fmaxf(30, hp * .9f) * k * (1 + P.lv * .02f) * (1 + p->up[1] * .07f));   // Serraglio: Vita +7% a gradino
	s.at = fmaxf(3, at * .85f) * k * (1 + P.lv * .02f) * (1 + p->up[0] * .07f);                  // Forza +7%
	s.sp = fmaxf(2.4f, fminf(4.2f, (sp ? sp : 2) * 1.15f));
	s.cd = fmaxf(.7f, cd ? cd : 1.2f) * (1 - p->up[2] * .05f);                                  // Rapidità -5%
	return s;
}
static const char *DOMEV[3] = {"", "Grande ", "Antico "};
void domName(const XPet *p, char *out, int n) { if (p->vr) snprintf(out, n, "%s%s · %s", DOMEV[domStats(p).ev], p->n, pvName(p->vr)); else snprintf(out, n, "%s%s", DOMEV[domStats(p).ev], p->n); }
static struct { u32 eu; int ei; float t0, ch; bool ok, brk; int sh; } CAP;   // la cattura in corso
static u32 PETU;   // il compagno in campo
bool xPetAlive(u32 uid) { for (int i = 0; i < NENT; i++) if (ents[i].k == K_X && ents[i].xk == XK_PET && ents[i].uid == uid) return true; return false; }
static Ent *petEnt(void) { for (int i = 0; i < NENT; i++) if (ents[i].k == K_X && ents[i].xk == XK_PET && ents[i].uid == PETU) return &ents[i]; return NULL; }
static bool domCanTake(Ent *e) { return e && e->k == K_EN && !e->boss && !E[e->t].np && !e->wb && !e->pup && e->hp > 0 && e->hp <= e->mx * .34f; }
Ent *domNear(void) { Ent *b = NULL; float bd = 4.2f; for (int i = 0; i < NENT; i++) { Ent *e = &ents[i]; if (!domCanTake(e)) continue; float d = dst(e->px, e->py, P.px, P.py); if (d < bd) { bd = d; b = e; } } return b; }
static bool bstHas(const char *t) { u32 h = hs(t); for (int i = 0; i < X.nbst; i++) if (X.bst[i] == h) return true; return false; }
static void bstAdd(const char *t) { if (bstHas(t) || X.nbst >= 128) return; X.bst[X.nbst++] = hs(t); }
void domTry(void) {
	if (!started || PM != PM_NONE || CAP.eu || P.hp <= 0) return;
	Ent *e = domNear();
	if (!e) { bool w = false; for (int i = 0; i < NENT; i++) if (ents[i].k == K_EN && !ents[i].boss && dst(ents[i].px, ents[i].py, P.px, P.py) < 5) w = true; msg(w ? "Indebolisci prima il mostro: sotto un terzo della vita" : "Non c'è nessun mostro da domare qui vicino"); tone(150, .1f, W_SQUARE, .04f); return; }
	if (X.seal <= 0) { msg("Non hai Sigilli di doma: li vende il Mercante Ugo"); tone(150, .1f, W_SQUARE, .04f); return; }
	X.seal--;
	float dl = fmaxf(0, ZLV - P.lv * .5f), fr = e->hp / e->mx;
	CAP.ch = clampf(.38f + (.34f - fr) * 1.6f - dl * .03f + (bstHas(E[e->t].id) ? .08f : 0), .12f, .92f);
	CAP.eu = e->id + 1; CAP.ei = e - ents; CAP.t0 = XT; CAP.ok = frnd() < CAP.ch; CAP.brk = false; CAP.sh = 0;
	e->cbs = gtime + 2.4f; e->al = 0;
	fxRing(e->px, e->py, 1.4f, .5f, 0xffe68c);
	flt(P.px, P.py, "Sigillo!", 0xffe28a); tone(660, .12f, W_TRIANGLE, .05f);
}
static void domSummon(void);
static void domDismiss(void) { Ent *e = petEnt(); if (e) { if (X.pet >= 0 && X.pet < X.npet) X.pets[X.pet].hp = fmaxf(0, e->hp); entDel(e); } PETU = 0; }
static void domTick(void) {
	if (!CAP.eu) return;
	Ent *e = &ents[CAP.ei];
	if (e->k != K_EN || e->id + 1 != CAP.eu) { CAP.eu = 0; return; }
	e->cbs = fmaxf(e->cbs, gtime + .2f);
	float k = XT - CAP.t0;
	if (frnd() < .3f) sparks(e->px + frnd() * .6f - .3f, e->py + frnd() * .6f - .3f, 1, 0xffe28a, 50);
	int sh = (int)(k / .6f);
	if (sh > CAP.sh && sh <= 3) { CAP.sh = sh; fxRing(e->px, e->py, 1.2f, .4f, 0xffe68c); tone(400 + sh * 120, .08f, W_SQUARE, .04f); if (!CAP.ok && sh == 2 && frnd() < .5f) CAP.brk = true; }
	if (k >= 2.1f || (CAP.brk && k >= 1.3f)) {
		CAP.eu = 0;
		if (CAP.ok && !CAP.brk) {
			sparks(e->px, e->py, 30, 0xffe28a, 120);
			if (X.npet >= domMax()) { msg("La stalla è piena: libera un compagno (Compagni) per domarne altri"); X.seal++; return; }
			XPet *p = &X.pets[X.npet]; memset(p, 0, sizeof *p);
			snprintf(p->t, sizeof p->t, "%s", E[e->t].id);
			const char *nm = E[e->t].n; if (!strncmp(nm, "Campione · ", 12)) nm += 12; else if (!strncmp(nm, "Campione ", 9)) nm += 9; else if (!strncmp(nm, "Elite ", 6)) nm += 6;
			snprintf(p->n, sizeof p->n, "%s", nm);
			p->lv = clampi(ZLV ? ZLV : 1, 1, P.lv); p->hp = domStats(p).mx; p->el = elOfEnemy(e->t); p->elv = 1; p->sz = 1;
			bool nw = !bstHas(p->t); bstAdd(p->t);
			e->k = K_NONE; entDel(e);
			X.npet++;
			JINGLE(.09f, W_TRIANGLE, 60, 64, 67, 72, 76, 79);
			char t[64]; snprintf(t, sizeof t, "Hai domato %s!", p->n);
			banner(t, nw ? "Specie nuova nel bestiario · Compagni nel menu o con il pulsante Comp." : "Compagni nel menu o con il pulsante Comp.");
			if (X.pet < 0 || !petEnt()) { X.pet = X.npet - 1; domSummon(); }
			saveGame();
		} else {
			e->al = 1; e->cbs = 0; flt(e->px, e->py, "Si è liberato!", 0xff9a7a); tone(160, .2f, W_SAW, .05f);
			e->hp = fminf(e->mx, e->hp + roundf(e->mx * .08f));
		}
	}
}
static void domSummon(void) {
	domDismiss();
	if (X.pet < 0 || X.pet >= X.npet || ZINT) return;
	XPet *p = &X.pets[X.pet]; if (p->ko) return;
	int t = enemyIdx(p->t); if (t < 0) return;
	DStat st = domStats(p); if (p->hp <= 0 || p->hp > st.mx) p->hp = st.mx;
	int x, y; nearFree((int)P.px + 1, (int)P.py, &x, &y);
	Ent *e = xEntNew(XK_PET, x + .5f, y + .5f); if (!e) return;
	int sh = p->sh[0] ? enemyIdx(p->sh) : -1;
	e->t = t; e->model = E[sh >= 0 ? sh : t].mdl; e->hp = p->hp; e->mx = st.mx; e->at = st.at; e->sp = st.sp; e->cd = st.cd; e->cdt = .5f;
	e->r = domFam(t) == F_MAG ? 4.2f : 1.15f; e->scl = (1 + .15f * st.ev) * (p->sz > .5f ? p->sz : 1); e->ept = gtime + 4; e->el = p->el; e->xs = p->elv ? p->elv : 1;
	domName(p, e->name, sizeof e->name);
	PETU = e->uid;
	fxRing(e->px, e->py, 1.4f, .5f, 0x96ffaa);
}
static void domXP(XPet *p, Ent *tg) {
	p->xp += (u16)fmaxf(2, roundf(tg->xp * .6f)); bool up = false;
	while (p->xp >= 40 + p->lv * p->lv * 14 && p->lv < 40) {
		p->xp -= 40 + p->lv * p->lv * 14; p->lv++; up = true;
		if (p->lv == 10 || p->lv == 20) { char a[64], b[64]; snprintf(a, sizeof a, "%s si è evoluto!", p->n); char nm[40]; domName(p, nm, sizeof nm); snprintf(b, sizeof b, "Ora è %s", nm); banner(a, b); JINGLE(.1f, W_TRIANGLE, 60, 67, 72, 79, 84); if (petEnt()) domSummon(); }
	}
	if (up) { Ent *e = petEnt(); DStat st = domStats(p); if (e) { e->mx = st.mx; e->at = st.at; e->hp = fminf(st.mx, e->hp + st.mx * .3f); domName(p, e->name, sizeof e->name); }
		char b[48]; snprintf(b, sizeof b, "%s livello %d", p->n, p->lv); flt(e ? e->px : P.px, e ? e->py : P.py, b, 0x9aff9a); }
}
void domRestAll(void) { for (int i = 0; i < X.npet; i++) { X.pets[i].ko = 0; X.pets[i].kt = 0; X.pets[i].hp = domStats(&X.pets[i]).mx; } Ent *e = petEnt(); if (e) e->hp = e->mx; }
static void domPetTick(float dt) {
	for (int i = 0; i < X.npet; i++) { XPet *p = &X.pets[i]; if (i == X.pet && petEnt()) continue; DStat st = domStats(p);
		if (p->ko) { p->kt += dt; if (p->kt > 60) { p->ko = 0; p->kt = 0; p->hp = roundf(st.mx * .3f); } } else p->hp = fminf(st.mx, p->hp + st.mx * .01f * dt); }
	Ent *e = petEnt();
	if (!e) { if (X.pet >= 0 && X.pet < X.npet && !X.pets[X.pet].ko && !ZINT && started) domSummon(); return; }
	XPet *p = &X.pets[X.pet]; int fam = domFam(e->t);
	e->cdt -= dt; e->fl -= dt;
	// il bersaglio: quello che colpisci tu, o il nemico più vicino a te
	Ent *tg = (TGT && TGT->k == K_EN && dst(TGT->px, TGT->py, P.px, P.py) < 9) ? TGT : NULL;
	if (!tg) { float bd = 7; for (int i = 0; i < NENT; i++) { Ent *o = &ents[i]; if (o->k != K_EN || o->wb || (CAP.eu && o->id + 1 == CAP.eu)) continue; if (!(o->al || dst(o->px, o->py, P.px, P.py) < 4.5f)) continue; float d = dst(o->px, o->py, e->px, e->py); if (d < bd && dst(o->px, o->py, P.px, P.py) < 9) { bd = d; tg = o; } } }
	float dP = dst(e->px, e->py, P.px, P.py);
	if (dP > 14) { int x, y; nearFree((int)P.px, (int)P.py + 1, &x, &y); e->px = x + .5f; e->py = y + .5f; return; }
	if (tg) {
		float d = dst(e->px, e->py, tg->px, tg->py), reach = e->r + (tg->boss ? .6f : .3f);
		e->face = faceOf(tg->px - e->px, tg->py - e->py);
		if (d > reach) { float k = fminf(1, e->sp * dt / d); mv(&e->px, &e->py, (tg->px - e->px) * k, (tg->py - e->py) * k); e->mvT = gtime; }
		else if (e->cdt <= 0) {
			e->cdt = e->cd; e->atkT = gtime; e->atkD[0] = (tg->px - e->px) / fmaxf(d, .01f); e->atkD[1] = (tg->py - e->py) / fmaxf(d, .01f);
			int dm = (int)roundf(e->at * (.85f + frnd() * .3f));
			if (gtime >= e->ept) {
				e->ept = gtime + 8; dm = (int)roundf(dm * 1.8f);
				char b[40]; snprintf(b, sizeof b, "%s!", DOMF[fam].sp); flt(e->px, e->py, b, 0x9aff9a);
				if (fam == F_BES) { tg->sBl = gtime + 4; tg->sBd = fmaxf(1, roundf(dm * .15f)); }
				else if (fam == F_GUE) tg->cbs = gtime + (tg->boss ? .5f : 1.4f);
				else if (fam == F_ART) tg->sSl = gtime + 4;
				else if (fam == F_MEL) { int h = (int)roundf(P.mx * .12f); P.hp = fminf(P.mx, P.hp + h); char hb[12]; snprintf(hb, sizeof hb, "+%d", h); flt(P.px, P.py, hb, 0x66ff88); sparks(P.px, P.py, 14, 0x9aff9a, 70); }
				fxRing(tg->px, tg->py, 1.1f, .35f, 0x96ffaa);
			}
			xHurtFromPet(e, tg, dm);
			if (tg->k == K_EN) { tg->al = 1; tg->ptg = e->uid; }
		}
	} else {
		float fx = P.dr[0], fy = P.dr[1]; float gx = P.px - fx * 1.4f + fy * .6f, gy = P.py - fy * 1.4f - fx * .6f, d = dst(gx, gy, e->px, e->py);
		if (d > .6f) { float k = fminf(1, e->sp * dt * (dP > 4 ? 1.6f : 1) / d); mv(&e->px, &e->py, (gx - e->px) * k, (gy - e->py) * k); e->mvT = gtime; e->face = faceOf(gx - e->px, gy - e->py); }
	}
	// i nemici che lo hanno preso di mira lo attaccano
	for (int i = 0; i < NENT; i++) {
		Ent *o = &ents[i]; if (o->k != K_EN || o->ptg != e->uid || o->pup) continue;
		float d = dst(o->px, o->py, e->px, e->py);
		if (d > 6 || (dst(o->px, o->py, P.px, P.py) < d - .5f && o->al)) { o->ptg = 0; continue; }
		o->cdt = fmaxf(o->cdt, .15f);
		if (d > o->r + .2f) { if (!(o->cbs > gtime)) { float k = fminf(1, o->sp * dt / d); mv(&o->px, &o->py, (e->px - o->px) * k, (e->py - o->py) * k); o->face = faceOf(e->px - o->px, e->py - o->py); } }
		else { o->pcd -= dt; if (o->pcd <= 0 && !(o->cbs > gtime)) { o->pcd = o->cd; o->atkT = gtime; o->atkD[0] = (e->px - o->px) / fmaxf(d, .01f); o->atkD[1] = (e->py - o->py) / fmaxf(d, .01f);
			int dm = (int)fmaxf(1, roundf(o->at * .8f)); e->hp -= dm; e->fl = .12f; char b[12]; snprintf(b, sizeof b, "%d", dm); flt(e->px, e->py, b, 0xffb0a0); } }
	}
	if (e->hp <= 0) { char nm[40]; domName(p, nm, sizeof nm); p->hp = 0; p->ko = 1; p->kt = 0; domDismiss(); msg("%s è stremato: si riprenderà fra poco (o alla locanda, al santuario)", nm); tone(180, .3f, W_TRIANGLE, .05f); }
	else p->hp = e->hp;
}
void domRefresh(void) { if (petEnt()) domSummon(); }
void xPetRemove(int i, XPet *out) {
	if (i < 0 || i >= X.npet) return;
	if (X.pet == i) domDismiss();
	*out = X.pets[i];
	memmove(&X.pets[i], &X.pets[i + 1], sizeof(XPet) * (X.npet - i - 1)); X.npet--;
	if (X.pet == i) X.pet = -1; else if (X.pet > i) X.pet--;
}
static int RENK;
void xRename(int k) { RENK = k; if (k >= 100 && k - 100 < X.npet) uiKeyboardFor(4, X.pets[k - 100].n); }
void domBuy(int n) { int pr = n == 5 ? DOMSEAL * 5 - 30 : DOMSEAL * n; if (!pay(pr)) return; X.seal += n; tone(800, .08f, W_TRIANGLE, .05f); saveGame(); }

/* ================= il compagno, l'animale e il cavallo degli altri (in rete) ================= */
// cp:[tipo, nome, x, y, lv, variante, tinta, attacca, fdx, fdy, vita, ...] · a47:[tipo, nome] · cav:[razza, mantello] · tt:"titolo"
void xPeerParse(Peer *o, J *q, bool fresh) {
	J *c = jget(q, "cav"); o->cavB = c ? (s8)clampi((int)jnum(jat(c, 0), 0), 0, 2) : -1; o->cavC = c ? (s8)coatIdx(jstr(jat(c, 1), "baio")) : 0;
	J *a = jget(q, "a47"); o->aniT = a ? (s8)aniIdx(jstr(jat(a, 0), "")) : -1; if (a) snprintf(o->aniN, sizeof o->aniN, "%.14s", jstr(jat(a, 1), ""));
	if (fresh || o->aniT < 0) { o->ax = o->tx - .6f; o->ay = o->ty + .5f; }
	J *p = jget(q, "cp");
	if (p && p->t == JARR && p->n >= 11) {
		int t = enemyIdx(jstr(jat(p, 0), ""));
		if (t != o->cpT) { o->cpT = t; o->cx = (float)jnum(jat(p, 2), o->tx); o->cy = (float)jnum(jat(p, 3), o->ty); }
		snprintf(o->cpN, sizeof o->cpN, "%.23s", jstr(jat(p, 1), "Compagno"));
		o->ctx = (float)jnum(jat(p, 2), o->cx); o->cty = (float)jnum(jat(p, 3), o->cy); o->clv = (u8)clampi((int)jnum(jat(p, 4), 1), 1, 40);
		bool atk = jnum(jat(p, 7), 0) != 0; if (atk && !o->catk) { o->catkT = gtime; o->cfd[0] = (float)jnum(jat(p, 8), 0); o->cfd[1] = (float)jnum(jat(p, 9), 1); } o->catk = atk;
		o->chp = clampf((float)jnum(jat(p, 10), 1), 0, 1);
		{ extern int pvKey(const char *); o->cvr = (u8)pvKey(jstr(jat(p, 5), "")); o->cvh = (s16)jnum(jat(p, 6), 0); }
		// un incrocio del browser ("x47.id"): si disegna con la forma del primo genitore
		if (o->cpT < 0) { J *df = jat(p, 11); if (df && df->t == JOBJ) { JFOR(q2, df) { o->cpT = enemyIdx(jgs(q2, "a", "")); if (o->cpT >= 0) break; } } }
	} else o->cpT = -1;
	snprintf(o->tt, sizeof o->tt, "%.30s", jgs(q, "tt", ""));
	o->crb = (float)jgn(q, "crb", 0);
	o->sy = jgn(q, "sy", 0) != 0; o->za = (float)jgn(q, "za", 0);
}
// quello che mando io (in coda al messaggio "p")
void xPack(char *out, int n) {
	int k = 0; out[0] = 0;
	if (cavOn()) k += snprintf(out + k, n - k, ",\"cav\":[%d,\"%s\"]", cavBreed(), CAVK[clampi(X.cavCol, 0, 3)]);
	float *b = cavBestP(); if (b && *b > 0 && k < n) k += snprintf(out + k, n - k, ",\"crb\":%.1f", *b);
	if (X.aniOn >= 0 && X.aniOn < X.nani && k < n) { JW w = {out + k, 0, n - k}; jwRaw(&w, ",\"a47\":[\""); jwRaw(&w, ANI47[X.ani[X.aniOn].t].k); jwRaw(&w, "\","); jwStr(&w, X.ani[X.aniOn].n); jwRaw(&w, "]"); k += w.n; }
	Ent *e = petEnt();
	if (e && X.pet >= 0 && k < n) {
		XPet *p = &X.pets[X.pet]; char nm[40]; domName(p, nm, sizeof nm);
		JW w = {out + k, 0, n - k}; jwRaw(&w, ",\"cp\":["); jwStr(&w, p->t); jwRaw(&w, ","); jwStr(&w, nm);
		bool a = gtime - e->atkT < .3f;
		extern const char *pvKeyOf(int v); jwf(&w, ",%.2f,%.2f,%d,\"%s\",%d,%d,%.2f,%.2f,%.2f,0]", e->px, e->py, p->lv, pvKeyOf(p->vr), p->vh, a ? 1 : 0, e->atkD[0], e->atkD[1], fmaxf(0, e->hp) / fmaxf(1, e->mx));
		k += w.n;
	}
	const char *tt = titleNow(); if (tt && tt[0] && k < n) { JW w = {out + k, 0, n - k}; jwRaw(&w, ",\"tt\":"); jwStr(&w, tt); k += w.n; }
}
static void peerTick(float dt) {
	if (!netOk) return;
	char rk[64]; rmKey(rk, sizeof rk);
	for (int i = 0; i < MAXPEER; i++) {
		Peer *o = &PEERS[i]; if (!o->used || strcmp(o->rm, rk)) continue;
		if (o->aniT >= 0) { float tx = o->x - .6f, ty = o->y + .5f, dx = tx - o->ax, dy = ty - o->ay, d = hyp(dx, dy); float ox = o->ax, oy = o->ay;
			if (d > 8) { o->ax = tx; o->ay = ty; } else if (d > 1.1f) { float s = fminf(d - 1, (d > 3 ? 7 : 3.6f) * dt); o->ax += dx / d * s; o->ay += dy / d * s; }
			bool mvd = dst(o->ax, o->ay, ox, oy) > .004f; if (mvd) { o->afc = faceOf(o->ax - ox, o->ay - oy); o->ait = 0; } else o->ait += dt; }
		if (o->cpT >= 0) { float dx = o->ctx - o->cx, dy = o->cty - o->cy, d = hyp(dx, dy);
			if (d > 7) { o->cx = o->ctx; o->cy = o->cty; } else if (d > .01f) { float k = fminf(1, dt * 10); o->cx += dx * k; o->cy += dy * k; o->cmvT = gtime; o->cfc = faceOf(dx, dy); } }
	}
}
void xDrawPeerExtras(Peer *o, int i) {
	if (o->aniT >= 0 && MD_ANI[o->aniT] >= 0) { int fr = o->ait < .1f ? ((int)(XT * 12 / 2.1f + i)) % 3 : o->ait > 2.5f ? 4 : 3; drawModelFrame(MD_ANI[o->aniT], (o->afc & 7) * 8 + fr, o->ax, o->ay, 0, 0, 255); }
	if (o->cpT >= 0) {
		int m = E[o->cpT].mdl; float s0 = gMS; gMS = o->clv >= 20 ? 1.3f : o->clv >= 10 ? 1.15f : 1;
		int fr = gtime - o->catkT < .3f ? 3 : gtime - o->cmvT < .2f ? ((int)(gtime * 8)) % 3 : 0;
		pvSet(o->cvr, o->cvh); drawModelFrame(m, (o->cfc & 7) * 4 + fr, o->cx, o->cy, 0, 0, o->cvr == 10 ? 140 : 255); gMS = s0; pvSet(0, 0);
		for (int k = 0; k < 10; k++) { float a = k / 10.f * 6.283f + gtime; boxA(o->cx + cosf(a) * .42f - .03f, o->cy + sinf(a) * .42f - .03f, .3f, .06f, .06f, .3f, 0x7aff8a, 1.2f, 255); }
	}
}
bool xPeerMounted(Peer *o) { return o->cavB >= 0; }
void xDrawPeerHorse(Peer *o, bool mv, float ph) { if (o->cavB >= 0) cavDrawAt(o->cavB, o->cavC, o->x, o->y, o->fa, mv, ph); }

/* ================= agganci dal resto del gioco ================= */
void xZoneLoad(void) {
	CAP.eu = 0; PETU = 0; AME.uid = 0;
	extern void syncZoneLoad(void); syncZoneLoad();
	chZoneLoad(); olZoneLoad(); discZone(); digZoneLoad(); evZoneLoad(); mestZoneLoad();
	if (malOn(2)) { int n0 = NENT; for (int i = 0; i < n0; i++) { Ent *e = &ents[i]; if (e->k != K_EN || e->boss || frnd() >= .5f) continue; int x, y, t = e->t; nearFree((int)e->px + 1, (int)e->py, &x, &y); if (WK(M[y][x])) mkEn(t, x, y); } }   // orda
	if (X.cavOn && !cavOk()) {}   // si scende da soli dove non si può andare a cavallo (resta in sella per dopo)
	if (CR.on && strcmp(CR.zk, Zk)) CR.on = false;
	if (X.pet >= 0 && X.pet < X.npet && !X.pets[X.pet].ko && !ZINT) domSummon();
	if (X.aniOn >= 0) { AME.uid = 0; }
}
void xTick(float dt) {
	XT += dt;
	if (!started) return;
	extern void syncTick(float); syncTick(dt);
	bossTick(dt); evTick(dt);
	hardTick(dt);
	serrTick(dt); mestTick(dt); torTick(dt); incTick(dt);
	cavRaceTick(); aniTick(dt); domTick(); domPetTick(dt); peerTick(dt); elTick(dt); chTick(dt);
}
void xOnKill(Ent *dead) {
	Ent *e = petEnt();
	if (e && X.pet >= 0 && dst(dead->px, dead->py, e->px, e->py) < 9) domXP(&X.pets[X.pet], dead);
	elOnKill(dead);
	olOnKill(dead);
	torKill(dead);
}
bool xInteractable(Ent *e) { return e->k == K_X && (e->xk == XK_CARTE || e->xk == XK_TORRE || e->xk == XK_MEST || e->xk == XK_DIG || e->xk == XK_MERC || e->xk == XK_SIG || e->xk == XK_STALLA || e->xk == XK_GARA || e->xk == XK_ANISHOP || (e->xk == XK_ANI && e->xo) || e->xk == XK_VIAND || e->xk == XK_ALLY); }
const char *xVerb(Ent *e) { return e->xk == XK_CARTE ? "Siediti al" : e->xk == XK_TORRE ? "Entra nella" : e->xk == XK_MEST ? "Entra nella" : e->xk == XK_DIG ? "Scava la" : e->xk == XK_MERC ? "Parla con il" : e->xk == XK_SIG ? "Esamina il" : e->xk == XK_ANI ? "Accarezza" : e->xk == XK_VIAND || e->xk == XK_ALLY ? "Parla con" : "Apri"; }
void xAct(Ent *e) {
	switch (e->xk) {
	case XK_STALLA: xOpen(XP_STALLA); break;
	case XK_GARA: xOpen(XP_GARA); break;
	case XK_ANISHOP: xOpen(XP_ANI); break;
	case XK_ANI: e->hrt = XT; e->ait = 0; tone(660, .08f, W_SINE, .05f); msg("%s è felice!", e->name); break;
	case XK_VIAND: xOpen(XP_VIAND); break;
	case XK_ALLY: xOpen(XP_ALLY); break;
	case XK_SIG: olShrine(e); break;
	case XK_DIG: digAct(e); break;
	case XK_MERC: xOpen(XP_MERC); break;
	case XK_MEST: xOpen(XP_MEST); break;
	case XK_CARTE: xOpen(XP_CARTE); break;
	case XK_TORRE: { extern void torDoor(void); torDoor(); break; }
	}
}
void xDraw(Ent *e) {
	switch (e->xk) {
	case XK_STALLA: case XK_GARA: case XK_ANISHOP: drawModelFrame(e->model, 0, e->px, e->py, 0, 0, 255); break;
	case XK_ANI: if (e->xs >= 0 && MD_ANI[e->xs] >= 0) drawModelFrame(MD_ANI[e->xs], (e->face & 7) * 8 + aniFrame(e), e->px, e->py, 0, 0, 255);
		if (e->ast == AS_SLEEP) for (int i = 0; i < 2; i++) { float q = fmodf(XT * .5f + i / 2.f, 1); boxA(e->px + .1f + q * .2f, e->py - .05f, 10 + q * 14, .05f + q * .03f, .02f, .8f, 0xffffff, 1, (u8)(255 * (1 - q))); }
		if (e->hrt > 0 && XT - e->hrt < 1.4f) for (int i = 0; i < 3; i++) { float q = (XT - e->hrt) / 1.4f + i * .2f; boxA(e->px - .05f + sinf(i * 2 + q * 6) * .15f, e->py - .05f, 12 + q * 16, .1f, .1f, 2, 0xff5a7a, 1.4f, 255); }
		break;
	case XK_PET: {
		float s0 = gMS; gMS = e->scl > 0 ? e->scl : 1;
		int fr = gtime - e->atkT < .3f ? 3 : gtime - e->mvT < .18f ? ((int)(gtime * 8)) % 3 : 0;
		if (X.pet >= 0 && X.pet < X.npet) pvSet(X.pets[X.pet].vr, X.pets[X.pet].vh);
		drawModelFrame(e->model, (e->face & 7) * 4 + fr, e->px, e->py, 0, e->fl > 0 ? 1 : 0, X.pet >= 0 && X.pet < X.npet && X.pets[X.pet].vr == 10 ? 140 : 255); gMS = s0; pvSet(0, 0);
		for (int k = 0; k < 10; k++) { float a = k / 10.f * 6.283f + gtime; boxA(e->px + cosf(a) * .42f - .03f, e->py + sinf(a) * .42f - .03f, .3f, .06f, .06f, .3f, 0x7aff8a, 1.2f, 255); }
		break; }
	case XK_VIAND: case XK_ALLY: drawModelFrame(e->model, (e->face & 7) * 3, e->px, e->py, 0, 0, 255); break;
	case XK_DIG: { float d = dst(e->px, e->py, P.px, P.py); if (d > 5) break; u8 a = (u8)(255 * clampf(1 - (d - 2) / 3, .15f, 1)); float u = .5f + .5f * sinf(gtime * 5 + e->px);
		boxA(e->px - .25f, e->py - .2f, 0, .5f, .4f, 2, 0x6a4e32, 1, a); boxA(e->px - .15f, e->py - .12f, 2, .3f, .24f, 1.5f, 0x7a5a3a, 1, a); if (u > .55f) boxA(e->px - .04f, e->py - .04f, 4 + u * 3, .08f, .08f, 3, 0xfff6c0, 1.6f, a); break; }
	case XK_MET: boxA(e->px - .9f, e->py - .9f, 0, 1.8f, 1.8f, .6f, 0x3a2a22, 1, 255); boxA(e->px - .5f, e->py - .5f, .6f, 1, 1, .4f, 0x5a3a2a, 1, 255); if (frnd() < .2f) sparks(e->px, e->py, 1, 0x888888, 20); break;
	case XK_MERC: boxA(e->px - .45f, e->py - .3f, 0, .9f, .6f, 12, 0x8a5a2a, 1, 255); boxA(e->px - .5f, e->py - .35f, 12, 1, .7f, 3, 0xc86a2a, 1, 255); boxA(e->px - .5f, e->py - .35f, 15, 1, .7f, 2, 0xe8d8a0, 1, 255);
		boxA(e->px - .12f, e->py + .35f, 0, .24f, .2f, 16, 0x6a3a8a, 1, 255); boxA(e->px - .1f, e->py + .36f, 16, .2f, .18f, 6, 0xe0b090, 1, 255); boxA(e->px - .13f, e->py + .34f, 22, .26f, .22f, 3, 0xd4af37, 1, 255); break;
	case XK_MEST: case XK_TORRE: drawModelFrame(e->model, 0, e->px, e->py, 0, 0, 255); break;
	case XK_CARTE: break;   // il tavolo è nella geometria della taverna
	case XK_SIG: drawModelFrame(e->model, 0, e->px, e->py, 0, 0, 255);
		if (X.olSig[e->xs % 3]) boxA(e->px - .07f, e->py - .07f, 26 + sinf(gtime * 2 + e->xs) * 1.5f, .14f, .14f, 5, 0x6affc0, 1.4f, 255);
		break;
	}
}
// il cerchio di luce della cattura, la stella sopra i mostri domabili e le porte della corsa
void xDrawWorld(void) {
	if (CAP.eu) { Ent *e = &ents[CAP.ei]; if (e->k == K_EN) flatRing(e->px, e->py, .4f, .7f, .7f, .08f, 0xffe68c, 200); }
	if (X.seal > 0 && PM == PM_NONE) { Ent *e = domNear(); if (e && !CAP.eu) boxA(e->px - .07f, e->py - .07f, 50 + sinf(gtime * 5) * 1.5f, .14f, .14f, 3, 0xffe28a, 1.4f, 255); }
	if (CR.on) for (int j = CR.i; j < CR.n && j < CR.i + 2; j++) {
		float x = CR.cp[j][0], y = CR.cp[j][1]; u8 a = j == CR.i ? 255 : 115; u32 c = j == CR.n - 1 ? 0xffd84a : 0x7affea; float u = sinf(gtime * 4) * 2;
		boxA(x - .6f, y - .05f, 0, .12f, .12f, 40, c, 1.4f, a); boxA(x + .48f, y - .05f, 0, .12f, .12f, 40, c, 1.4f, a); boxA(x - .6f, y - .05f, 40 + u, 1.2f, .12f, 4, c, 1.5f, a);
	}
}
void xDrawLabels(void) {
	for (int i = 0; i < NENT; i++) {
		Ent *e = &ents[i]; if (e->k != K_X) continue;
		float top = e->xk == XK_PET ? 46 * (e->scl > 0 ? e->scl : 1) : e->xk == XK_ANI ? 22 : 46;
		float sx, sy; worldToScreen(e->px, e->py, top, &sx, &sy);
		if (sx < -40 || sx > VW + 40 || sy < -20 || sy > VH + 20) continue;
		if (e->xk == XK_PET) {
			rect(sx - 13, sy, 26, 4, C2D_Color32(0, 0, 0, 170)); rect(sx - 13, sy, 26 * clampf(e->hp / fmaxf(1, e->mx), 0, 1), 4, C2D_Color32(90, 208, 106, 255));
			uiLabel(sx, sy - 12, .36f, C2D_Color32(184, 255, 184, 255), e->name);
		} else if ((e->xk == XK_ANI && dst(e->px, e->py, P.px, P.py) < 6) || ((e->xk == XK_TORRE || e->xk == XK_MEST || e->xk == XK_MERC || e->xk == XK_STALLA || e->xk == XK_GARA || e->xk == XK_ANISHOP || e->xk == XK_VIAND || e->xk == XK_ALLY || e->xk == XK_SIG) && SET.names && dst(e->px, e->py, P.px, P.py) < 9))
			uiLabel(sx, sy - 10, .36f, e->xk == XK_ANI ? C2D_Color32(255, 224, 138, 255) : C_TXT, e->name);
		if (e->xk == XK_VIAND && e->qm) uiLabel(sx, sy - 30 - fabsf(sinf(gtime * 4)) * 3, .7f, C_GOLD, "!");
	}
	if (netOk) { char rk[64]; rmKey(rk, sizeof rk);
		for (int i = 0; i < MAXPEER; i++) { Peer *o = &PEERS[i]; if (!o->used || strcmp(o->rm, rk) || plHidePeer(o)) continue;
			if (o->cpT >= 0) { float sx, sy; worldToScreen(o->cx, o->cy, 46, &sx, &sy); if (sx > -40 && sx < VW + 40 && sy > -20 && sy < VH + 20) {
				rect(sx - 13, sy, 26, 4, C2D_Color32(0, 0, 0, 170)); rect(sx - 13, sy, 26 * o->chp, 4, C2D_Color32(90, 208, 106, 255)); uiLabel(sx, sy - 12, .34f, C2D_Color32(184, 255, 184, 255), o->cpN); } }
			if (o->aniT >= 0 && dst(o->ax, o->ay, P.px, P.py) < 6) { float sx, sy; worldToScreen(o->ax, o->ay, 22, &sx, &sy); if (sx > -40 && sx < VW + 40 && sy > -20 && sy < VH + 20) uiLabel(sx, sy - 10, .34f, C2D_Color32(255, 224, 138, 255), o->aniN); } } }
	x3DrawLabels();
	if (CR.on) { char b[48]; snprintf(b, sizeof b, "Corsa: porta %d/%d · %.1f s", CR.i + 1 > CR.n ? CR.n : CR.i + 1, CR.n, gtime - CR.t0); uiLabel(topCX(), 52, .45f, C2D_Color32(122, 255, 234, 255), b); }
	if (CAP.eu) uiLabel(topCX(), 52, .45f, C2D_Color32(255, 226, 138, 255), "Il sigillo tiene...");
}
// il mio cavallo sotto l'eroe
void xDrawHeroHorse(void) { if (cavOn()) cavDrawAt(cavBreed(), X.cavCol, P.px, P.py, P.face, P.moving, gtime * 13); }

/* ================= finestre (pannello PM_X) ================= */
static int XPAGE = 0, XSELP = -1;
void xOpen(int page) { XPAGE = page; uiOpenPanel(PM_X); }
static void o2(const char *l, const char *r, int arg, u32 col, bool dis) { uiXOpt(l, r, arg, col, dis); }
enum { XA_CLOSE = 1, XA_BACK, XA_CAVBUY, XA_CAVCOL, XA_CAVTOG, XA_RACE, XA_ANIBUY, XA_ANISET, XA_ANIREN, XA_PETSEL, XA_PETCALL, XA_PETBACK, XA_PETREN, XA_PETFREE, XA_PETFREE2, XA_SEAL1, XA_SEAL5 };
void xSetPage(int p) { XPAGE = p; XSELP = -1; if (PM != PM_X) uiOpenPanel(PM_X); }
static void buildStalla(void) {
	char b[96]; snprintf(b, sizeof b, "Stallo dei cavalli · %d oro", P.g);
	uiXTitle(b, "Con un cavallo si corre molto più in fretta. Si sale e si scende con il pulsante Sella in basso a destra (all'aperto).");
	for (int i = 0; i < 3; i++) {
		bool own = X.cavOwn & (1 << i), sel = own && cavBreed() == i;
		char l[64], r[40]; snprintf(l, sizeof l, "%s · velocità x%.2g", CAV46[i].n, CAV46[i].v);
		if (own) snprintf(r, sizeof r, "%s", sel ? "il tuo cavallo" : "tuo: sceglilo"); else snprintf(r, sizeof r, "%d oro", CAV46[i].p);
		o2(l, r, XARG(XA_CAVBUY, i), sel ? C_GREEN : C_GOLD, false);
	}
	for (int i = 0; i < 4; i++) { char l[48]; snprintf(l, sizeof l, "Mantello: %s", CAVCN[i]); o2(l, X.cavCol == i ? "scelto" : "", XARG(XA_CAVCOL, i), X.cavCol == i ? C_GREEN : C_TXT, false); }
	if (X.cavOwn) o2(X.cavOn ? "Scendi da cavallo" : "Monta in sella", "", XARG(XA_CAVTOG, 0), C_GOLD, false);
	o2("Chiudi", "", XARG(XA_CLOSE, 0), 0, false);
}
static void buildGara(void) {
	static char body[400]; float *b = cavBestP(); int k = 0;
	k += snprintf(body + k, sizeof body - k, "Otto porte di luce da attraversare in ordine, poi di nuovo qui al traguardo. Si può correre anche a piedi, ma a cavallo è un'altra storia.\nIl tuo record qui: ");
	if (b && *b > 0) k += snprintf(body + k, sizeof body - k, "%d:%04.1f", (int)(*b / 60), fmodf(*b, 60)); else k += snprintf(body + k, sizeof body - k, "-");
	if (netOk) { char rk[64]; rmKey(rk, sizeof rk); for (int i = 0; i < MAXPEER && k < (int)sizeof body - 40; i++) { Peer *o = &PEERS[i]; if (o->used && !strcmp(o->rm, rk) && o->crb > 0) k += snprintf(body + k, sizeof body - k, "\n%s: %d:%04.1f", o->n, (int)(o->crb / 60), fmodf(o->crb, 60)); } }
	uiXTitle("Corsa a cavallo", body);
	o2("Via!", "", XARG(XA_RACE, 0), C_GOLD, false);
	o2("Chiudi", "", XARG(XA_CLOSE, 0), 0, false);
}
static void buildAni(void) {
	static char body[200]; snprintf(body, sizeof body, "Ti seguono dappertutto e ogni tanto scavano qualcosa per te%s. Si accarezzano con L quando non c'è altro lì vicino.", X.aniF ? "" : "");
	char ti[64]; snprintf(ti, sizeof ti, "Animali da compagnia · %d oro", P.g);
	uiXTitle(ti, body);
	bool shop = false; for (int i = 0; i < NENT; i++) if (ents[i].k == K_X && ents[i].xk == XK_ANISHOP && dst(ents[i].px, ents[i].py, P.px, P.py) < 4) shop = true;
	for (int i = 0; i < X.nani; i++) { char l[64]; snprintf(l, sizeof l, "%s (%s)", X.ani[i].n, ANI47[X.ani[i].t].n); o2(l, X.aniOn == i ? "con te" : "portalo con te", XARG(XA_ANISET, i), X.aniOn == i ? C_GREEN : C_TXT, false); }
	for (int i = 0; i < X.nani; i++) { char l[64]; snprintf(l, sizeof l, "Rinomina %s", X.ani[i].n); o2(l, "", XARG(XA_ANIREN, i), C_MU, false); }
	for (int k = 0; k < 8; k++) {
		bool got = false; for (int i = 0; i < X.nani; i++) if (X.ani[i].t == k) got = true;
		char l[80], r[24]; snprintf(l, sizeof l, "%s · %s", ANI47[k].n, ANI47[k].d); snprintf(r, sizeof r, got ? "è tuo" : "%d oro", ANI47[k].p);
		o2(l, r, XARG(XA_ANIBUY, k), got ? C_MU : C_GOLD, got || !shop);
	}
	o2("Chiudi", "", XARG(XA_CLOSE, 0), 0, false);
}
static void buildPets(void) {
	static char body[300];
	snprintf(body, sizeof body, "Sigilli di doma: %d · nella stalla %d/%d · bestiario: %d specie.%s", X.seal, X.npet, domMax(), X.nbst,
		X.npet ? "" : "\nIndebolisci un mostro sotto un terzo della vita, poi tocca Doma in basso a destra per lanciare un Sigillo. Più è debole, più è facile. I boss non si domano.");
	uiXTitle("I tuoi compagni", body);
	for (int i = 0; i < X.npet; i++) {
		XPet *p = &X.pets[i]; DStat st = domStats(p); char nm[40]; domName(p, nm, sizeof nm);
		char l[72], r[40]; snprintf(l, sizeof l, "%s · %s Lv%d%s", nm, DOMF[domFam(enemyIdx(p->t))].n, p->lv, p->ko ? " (stremato)" : "");
		snprintf(r, sizeof r, "%d/%d", (int)fmaxf(0, p->hp), st.mx);
		o2(l, r, XARG(XA_PETSEL, i), i == X.pet ? C_GREEN : p->ko ? C_MU : C_TXT, false);
	}
	if (XSELP >= 0 && XSELP < X.npet) {
		XPet *p = &X.pets[XSELP]; DStat st = domStats(p); int f = domFam(enemyIdx(p->t));
		char l[96]; snprintf(l, sizeof l, "  ATT %.1f · %s: %s · XP %d/%d%s", st.at, DOMF[f].sp, DOMF[f].d, p->xp, 40 + p->lv * p->lv * 14, st.ev < 2 ? (st.ev ? " · si evolve al 20" : " · si evolve al 10") : " · forma finale");
		o2(l, "", 0, C_MU, false);
		if (XSELP == X.pet) o2("  Richiama nella stalla", "", XARG(XA_PETBACK, XSELP), C_GOLD, false);
		else o2("  Chiama in campo", "", XARG(XA_PETCALL, XSELP), C_GOLD, p->ko);
		o2("  Rinomina", "", XARG(XA_PETREN, XSELP), 0, false);
		o2("  Libera (non lo rivedrai)", "", XARG(XA_PETFREE, XSELP), C2D_Color32(255, 140, 120, 255), false);
	}
	o2("Chiudi", "", XARG(XA_CLOSE, 0), 0, false);
}
void xKbDone(const char *s) {
	char b[24]; int j = 0; for (const char *p = s; *p && j < 22; p++) if (*p != '<' && *p != '>') b[j++] = *p; b[j] = 0;
	if (!b[0]) return;
	if (RENK >= 100 && RENK - 100 < X.npet) { snprintf(X.pets[RENK - 100].n, sizeof X.pets[0].n, "%s", b); Ent *e = petEnt(); if (e && X.pet == RENK - 100) domName(&X.pets[X.pet], e->name, sizeof e->name); }
	else if (RENK >= 0 && RENK < X.nani) { snprintf(X.ani[RENK].n, sizeof X.ani[0].n, "%.14s", b); for (int i = 0; i < NENT; i++) if (ents[i].k == K_X && ents[i].uid == AME.uid) snprintf(ents[i].name, sizeof ents[i].name, "%s", X.ani[RENK].n); }
	msg("Ora si chiama %s", b); saveGame();
}
void xBuild(void) {
	switch (XPAGE) {
	case XP_STALLA: buildStalla(); break;
	case XP_GARA: buildGara(); break;
	case XP_ANI: buildAni(); break;
	case XP_PETS: buildPets(); break;
	default: if (!xBuild2(XPAGE)) { uiXTitle("", ""); o2("Chiudi", "", XARG(XA_CLOSE, 0), 0, false); }
	}
}
static int freeAsk = -1;
// 0: ricostruisci la finestra · 1: chiudila
int xPanelAct(int arg) {
	int a = arg / 256, i = arg % 256;
	switch (a) {
	case XA_CLOSE: return 1;
	case XA_CAVBUY:
		if (X.cavOwn & (1 << i)) { X.cavSel = i; saveGame(); return 0; }
		if (P.g < CAV46[i].p) { msg("Servono %d monete", CAV46[i].p); tone(150, .1f, W_SQUARE, .04f); return 0; }
		P.g -= CAV46[i].p; X.cavOwn |= 1 << i; X.cavSel = i;
		JINGLE(.09f, W_TRIANGLE, 67, 71, 74, 79); banner("Un cavallo tutto tuo!", "Tocca Sella in basso a destra per montare"); saveGame(); return 0;
	case XA_CAVCOL: X.cavCol = i; saveGame(); return 0;
	case XA_CAVTOG: cavToggle(); return 1;
	case XA_RACE: { Ent *st = NULL; for (int k = 0; k < NENT; k++) if (ents[k].k == K_X && ents[k].xk == XK_GARA) st = &ents[k]; if (st) cavRace(st); return 1; }
	case XA_ANIBUY: aniBuy(i); return 0;
	case XA_ANISET: X.aniOn = X.aniOn == i ? -1 : i; aniNx = 0; for (int k = 0; k < NENT; k++) if (ents[k].k == K_X && ents[k].uid == AME.uid) entDel(&ents[k]); AME.uid = 0; saveGame(); return 0;
	case XA_ANIREN: RENK = i; uiKeyboardFor(4, X.ani[i].n); return 0;
	case XA_PETSEL: XSELP = XSELP == i ? -1 : i; freeAsk = -1; return 0;
	case XA_PETCALL: X.pet = i; domSummon(); { char nm[40]; domName(&X.pets[i], nm, sizeof nm); msg("%s è con te", nm); } saveGame(); return 0;
	case XA_PETBACK: domDismiss(); X.pet = -1; msg("Il compagno torna nella stalla"); saveGame(); return 0;
	case XA_PETREN: RENK = 100 + i; uiKeyboardFor(4, X.pets[i].n); return 0;
	case XA_PETFREE:
		if (freeAsk != i) { freeAsk = i; msg("Tocca di nuovo «Libera» per lasciarlo andare per sempre"); return 0; }
		freeAsk = -1; if (X.pet == i) domDismiss();
		memmove(&X.pets[i], &X.pets[i + 1], sizeof(XPet) * (X.npet - i - 1)); X.npet--;
		if (X.pet == i) X.pet = -1; else if (X.pet > i) X.pet--;
		XSELP = -1; saveGame(); return 0;
	default: return xPanelAct2(a, i);
	}
}
// le voci della storia nel menu di pausa e nei personaggi
void xPauseOpts(void) {
	o2("Compagni", "", XARG(XA_GO, XP_PETS), C_GOLD, false);
	o2("Animali da compagnia", "", XARG(XA_GO, XP_ANI), C_GOLD, false);
	o2("Incroci dei compagni", "", XARG(XA_GO, XP_INC), C_GOLD, false);
	if (X.cavOwn) o2(X.cavOn ? "Scendi da cavallo" : "Monta a cavallo", "", XARG(XA_CAVTOG, 0), C_GOLD, false);
	o2("Cronaca, vie e titoli", "", XARG(XA_GO, XP_CRON), C_GOLD, false);
	o2("Diario delle scoperte", "", XARG(XA_GO, XP_DISC), C_GOLD, false);
	if (X.malNoAsk) o2("Proponimi di nuovo le maledizioni", "", XARG(105, 0), C_MU, false);
}
