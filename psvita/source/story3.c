// Voxelia PS Vita (motore del port 3DS) - armi che crescono e boss a fasi (7.44), diario delle scoperte (7.46), scavi (7.44),
// maledizioni dei dungeon (7.44) ed eventi del mondo a orario (7.46).
// Regole e numeri da src/8zzx_armi.js, 8zzu_boss.js, 8zzzi_scoperte.js, 8zzz_scavo.js, 8zzw_maledizioni.js e
// 8zzzh_eventi.js della versione browser.
#include "voxelia.h"
#include <time.h>

#define C_TXT C2D_Color32(232, 236, 244, 255)
#define C_MU C2D_Color32(154, 164, 184, 255)
#define C_GOLD C2D_Color32(245, 185, 66, 255)
#define C_GREEN C2D_Color32(122, 255, 138, 255)
static inline float dst(float ax, float ay, float bx, float by) { return hyp(ax - bx, ay - by); }
typedef struct { u32 a; } Sd;
static float sdNext(Sd *s) {
	s->a = s->a + 0x6D2B79F5u; u32 t = s->a;
	t = (t ^ (t >> 15)) * (1u | t);
	t = (t + ((t ^ (t >> 7)) * (61u | t))) ^ t;
	return (float)((t ^ (t >> 14)) / 4294967296.0);
}
static Sd sdOf(const char *s) { Sd r = {hs(s)}; return r; }

/* ================= l'ora vera (UTC), per gli eventi e i giorni uguali per tutti ================= */
static double srvOff; static bool srvKnown;
void xSetServerTime(double ms) { srvOff = ms / 1000.0 - (double)time(NULL); srvKnown = true; }
// senza server: l'orologio della console è l'ora italiana (CET, CEST dall'ultima domenica di marzo all'ultima di ottobre)
double xNowUTC(void) {
	time_t t = time(NULL);
	if (srvKnown) return (double)t + srvOff;
	struct tm *g = gmtime(&t); int m = g->tm_mon + 1, d = g->tm_mday, wd = g->tm_wday;
	int lastSun = d - wd; while (lastSun + 7 <= 31) lastSun += 7;   // ultima domenica del mese (approssimata a 31 giorni)
	bool dst = (m > 3 && m < 10) || (m == 3 && d >= lastSun && (d > lastSun || g->tm_hour >= 2)) || (m == 10 && (d < lastSun || (d == lastSun && g->tm_hour < 3)));
	return (double)t - (dst ? 7200 : 3600);
}
static void dayKeyU(char *out) { time_t t = (time_t)xNowUTC(); struct tm *g = gmtime(&t); snprintf(out, 12, "%04d-%02d-%02d", g->tm_year + 1900, g->tm_mon + 1, g->tm_mday); }

/* ================= ARMI CHE CRESCONO (7.44) ================= */
static const char *WPN43N[40] = {"Morso d'Inverno", "Ultima Parola", "Canto della Tempesta", "Zanna del Lupo", "Promessa dell'Alba", "Sentenza di Ferro", "Giuramento del Re", "Eco dei Morti", "Respiro del Drago",
	"Sussurro Antico", "Fiamma di Brace", "Ombra del Vuoto", "Lacrima delle Stelle", "Sete di Sangue", "Furia della Marea", "Lama Lucente", "Cuore di Pietra", "Spina della Rosa", "Vento del Nord",
	"Ultimo Saluto", "Luna Spezzata", "Voce del Tuono", "Silenzio d'Argento", "Alba Rossa", "Gelo Eterno", "Lingua di Fuoco", "Pianto della Montagna", "Sigillo del Sole", "Coda della Cometa",
	"Dente del Leviatano", "Corona di Spine", "Passo dell'Ombra", "Ruggito del Grifone", "Ala della Fenice", "Pugno del Gigante", "Bacio del Ghiaccio", "Ira del Cielo", "Patto di Sangue",
	"Faro nella Notte", "Speranza Ostinata"};
typedef struct { const char *n, *d; } WSpec;
static const WSpec WPN43[4] = {{"Lama del vento", "un fendente d'aria che taglia tutto davanti a te"}, {"Terremoto", "il suolo trema intorno a te e i nemici restano storditi"},
	{"Mulinello", "un giro completo che respinge chi ti sta intorno"}, {"Nova arcana", "un'onda di magia che colpisce lontano"}};
extern int itemType(const Item *it);
static int wpnKind(const Item *w) { int t = itemType(w); return t == 2 || t == 3 ? 1 : t == 4 || t == 7 ? 2 : t == 6 ? 3 : 0; }
static u32 wmKey(const Item *w) { return hs(w->n) ^ ((u32)w->v * 2654435761u) ^ ((u32)w->r << 28); }
static int wmSlot(const Item *w, bool make) {
	if (!w->used || w->s != SL_W) return -1;
	u32 k = wmKey(w); for (int i = 0; i < 24; i++) if (X.wm[i].key == k) return i;
	if (!make) return -1;
	int b = 0; for (int i = 0; i < 24; i++) { if (!X.wm[i].key) { b = i; break; } if (X.wm[i].ml < X.wm[b].ml) b = i; }
	memset(&X.wm[b], 0, sizeof X.wm[b]); X.wm[b].key = k; return b;
}
const char *wmTitle(const Item *it, int *ml) {
	int s = wmSlot(it, false); *ml = s >= 0 ? X.wm[s].ml : 0;
	if (*ml < 3) return NULL;
	char b[48]; snprintf(b, sizeof b, "%s|titolo", it->n); Sd r = sdOf(b); return WPN43N[(int)(sdNext(&r) * 40) % 40];
}
float wmMul(void) { int s = wmSlot(&P.eq[SL_W], false); return 1 + .04f * (s >= 0 ? X.wm[s].ml : 0); }
static float wmBanT = -1; static char wmBanA[48], wmBanB[160];
void wmHit(void) {
	Item *w = &P.eq[SL_W]; int s = wmSlot(w, true); if (s < 0) return;
	X.wm[s].wx++; int ml = X.wm[s].ml; if (ml >= 10) return;
	int need = (int)roundf(20 * powf(ml + 1, 1.5f));
	if (X.wm[s].wx < need) return;
	X.wm[s].wx -= need; X.wm[s].ml = ++ml;
	char a[40], b[96]; snprintf(a, sizeof a, "Maestria +%d", ml); snprintf(b, sizeof b, "%s colpisce più forte (+%d%%)", w->n, ml * 4);
	banner(a, b); sparks(P.px, P.py, 16, 0xffd84a, 70); JINGLE(.08f, W_TRIANGLE, 67, 71, 74, 79);
	if (ml == 3) { int m2; snprintf(wmBanA, sizeof wmBanA, "Un nome per l'arma"); snprintf(wmBanB, sizeof wmBanB, "La tua arma ha un nome: «%s»", wmTitle(w, &m2)); wmBanT = gtime + .9f; }
	if (ml == 5) { const WSpec *S = &WPN43[wpnKind(w)]; snprintf(wmBanA, sizeof wmBanA, "Mossa speciale"); snprintf(wmBanB, sizeof wmBanB, "%s: %s. Parte insieme all'affondo.", S->n, S->d); wmBanT = gtime + 2.6f; }
	if (ml == 10) { snprintf(wmBanA, sizeof wmBanA, "Arma leggendaria"); snprintf(wmBanB, sizeof wmBanB, "%s è leggendaria: la mossa speciale colpisce più forte e più lontano", w->n); wmBanT = gtime + 4.2f; }
	saveGame();
}
static float wmSpecT = -1;
void wmLunge(void) { int s = wmSlot(&P.eq[SL_W], false); if (s >= 0 && X.wm[s].ml >= 5) wmSpecT = gtime + .14f; }
static void wpnSpecial(void) {
	Item *w = &P.eq[SL_W]; int s = wmSlot(w, false); if (s < 0) return;
	int k = wpnKind(w); float lg = X.wm[s].ml >= 10 ? 1.35f : 1; float fx = P.dr[0], fy = P.dr[1], l = hyp(fx, fy); if (l < .01f) { fx = 0; fy = 1; } else { fx /= l; fy /= l; }
	char b[32]; snprintf(b, sizeof b, "%s!", WPN43[k].n); flt(P.px, P.py, b, 0x7affea);
	extern void xHeroHit(Ent *e, float m);
	for (int i = 0; i < NENT; i++) {
		Ent *e = &ents[i]; if (e->k != K_EN || e->hp <= 0) continue;
		float dx = e->px - P.px, dy = e->py - P.py, d = hyp(dx, dy);
		if (k == 0) { float a = dx * fx + dy * fy, c = fabsf(dx * fy - dy * fx); if (a > 0 && a < 4.5f * lg && c < 1.1f) xHeroHit(e, 1.4f * lg); }
		else if (k == 1) { if (d < 3 * lg) { if (!e->boss) e->cdt = fmaxf(e->cdt, 1.2f); xHeroHit(e, 1.2f * lg); } }
		else if (k == 2) { if (d < 2.6f * lg) { if (!e->boss && d > .05f) mv(&e->px, &e->py, dx / d * .9f, dy / d * .9f); xHeroHit(e, 1.5f * lg); } }
		else if (d < 4.5f * lg) xHeroHit(e, 1.1f * lg);
	}
	if (k == 0) { for (int i = 1; i <= 6; i++) sparks(P.px + fx * i * 4.5f * lg / 6, P.py + fy * i * 4.5f * lg / 6, 3, 0xbffff4, 40); whoosh(); }
	else if (k == 1) { fxRing(P.px, P.py, 3 * lg, .4f, 0xc8a070); shake = fmaxf(shake, .5f); tone(60, .3f, W_SAW, .08f); }
	else { fxRing(P.px, P.py, (k == 2 ? 2.6f : 4.5f) * lg, .5f, k == 3 ? 0xbe8cff : 0xdcf0ff); if (k == 2) whoosh(); else tone(700, .2f, W_TRIANGLE, .05f); }
}

/* ================= BOSS A FASI (7.44) ================= */
static const float GAP[3] = {1, .85f, .68f};
static bool b43Seen;
bool bossStunned(Ent *e) { return e->bstn > gtime; }
static int bPh(Ent *e) { return e->hp > e->mx * .66f ? 1 : e->hp > e->mx * .33f ? 2 : 3; }
void bossTick(float dt) {
	(void)dt;
	for (int i = 0; i < NENT; i++) {
		Ent *e = &ents[i]; if (e->k != K_EN || !e->boss || e->pup || e->wb || e->hp <= 0) continue;
		if (!e->al) { e->bwkN = 0; continue; }
		int ph = bPh(e); if (!e->bph) e->bph = 1;
		if (ph > e->bph) {
			e->cd *= GAP[ph - 1] / GAP[e->bph - 1]; e->bph = ph;
			e->bshd = gtime + 1.4f; e->bwkO = 0; e->bstn = 0; e->bstg = 0;
			char b[16]; snprintf(b, sizeof b, "FASE %d!", ph); flt(e->px, e->py, b, 0xff6a4a); tone(70, .6f, W_SAW, .08f); shake = .9f;
			fxRing(e->px, e->py, 3.2f, .9f, 0xff5a3c); sparks(e->px, e->py, 26, 0xff6a4a, 90);
			msg(ph == 2 ? "%s cambia modo di combattere!" : "%s è allo stremo: attacca senza sosta!", e->name);
			if (ph == 3 && E[e->t].sum >= 0) { int ne = 0; for (int k = 0; k < NENT; k++) if (ents[k].k == K_EN) ne++;
				if (ne < 16) for (int k = 0; k < 2; k++) { float a = k * 3.14f + gtime; int x, y; nearFree(clampi((int)floorf(e->px + cosf(a) * 2), 1, N - 2), clampi((int)floorf(e->py + sinf(a) * 2), 1, N - 2), &x, &y); if (WK(M[y][x])) { Ent *m = mkEn(E[e->t].sum, x, y); if (m) m->al = 1; e = &ents[i]; } } }
		}
		if (!e->bwkN) e->bwkN = gtime + 4;
		if (!(e->bwkO > gtime) && !bossStunned(e) && gtime >= e->bwkN && !(e->bshd > gtime)) {
			e->bwkO = gtime + 3; e->bwkN = gtime + 3 + 8 + frnd() * 2; e->bstg = 0; flt(e->px, e->py, "Punto debole!", 0x7affea); tone(880, .12f, W_TRIANGLE, .05f);
			if (!b43Seen) { b43Seen = true; msg("Il nucleo luminoso sopra %s è il suo punto debole: colpiscilo finché brilla!", e->name); }
		}
		if (bossStunned(e)) { e->cbs = fmaxf(e->cbs, e->bstn); e->cdt = fmaxf(e->cdt, .4f); }
	}
}
// i colpi: immune mentre ruggisce, doppi sul punto debole, una volta e mezzo sul boss stordito
int bossDmg(Ent *e, int d) {
	if (!e->boss || e->pup || e->wb) return d;
	if (e->bshd > gtime) { flt(e->px, e->py, "Immune", 0x9adcff); return 0; }
	if (e->bwkO > gtime) { d *= 2; if (++e->bstg >= 4) { e->bwkO = 0; e->bstn = gtime + 3; e->bstg = 0; flt(e->px, e->py, "STORDITO!", 0xffd84a); tone(200, .4f, W_SQUARE, .06f); shake = .6f; sparks(e->px, e->py, 20, 0xffd84a, 70); } }
	else if (bossStunned(e)) d = (int)roundf(d * 1.5f);
	return d;
}
static void bossDraw(void) {
	for (int i = 0; i < NENT; i++) {
		Ent *e = &ents[i]; if (e->k != K_EN || !e->boss) continue;
		float top = 82;
		if (e->bwkO > gtime) { float p = 1 + sinf(gtime * 14) * .12f, s = .22f * p; boxA(e->px - s / 2, e->py - s / 2, top + sinf(gtime * 5) * 2, s, s, 10 * p, 0x7affea, 1.6f, 255); boxA(e->px - .05f, e->py - .05f, top - 6, .1f, .1f, 6, 0xbffff4, 1.4f, 255); }
		if (bossStunned(e)) for (int k = 0; k < 3; k++) { float a = gtime * 4 + k * 2.09f; boxA(e->px + cosf(a) * .45f - .05f, e->py + sinf(a) * .45f - .05f, top - 4, .1f, .1f, 4, 0xffd84a, 1.4f, 255); }
	}
}

/* ================= DIARIO DELLE SCOPERTE (7.46) ================= */
static bool dscSkip(const char *k) {
	static const char *P0[] = {"cava43", "ass:", "tw", "dim_", "sogno", "arrembaggio", "stiva", "ed:"};
	if (!strncmp(k, "torre", 5) && k[5] >= '0' && k[5] <= '9') return true;
	if (!strcmp(k, "mare")) return true;
	for (int i = 0; i < 8; i++) if (!strncmp(k, P0[i], strlen(P0[i]))) return true;
	return false;
}
static bool hasH(const u32 *L, int n, u32 h) { for (int i = 0; i < n; i++) if (L[i] == h) return true; return false; }
static int dscTotZ(void) { int n = 0; JFOR(z, jget(dataRoot(), "Z")) if (!dscSkip(z->key)) n++; return n + NDG; }
static int dscGotZ(void) { int n = 0; JFOR(z, jget(dataRoot(), "Z")) { if (dscSkip(z->key)) continue; char b[48]; snprintf(b, sizeof b, "z:%s", z->key); if (hasH(X.dZ, X.ndZ, hs(b))) n++; } for (int i = 0; i < NDG; i++) { char b[40]; snprintf(b, sizeof b, "d:%s", DG[i].id); if (hasH(X.dZ, X.ndZ, hs(b))) n++; } return n; }
static int dscTotE(void) { int n = 0; for (int i = 0; i < NE; i++) if (!strchr(E[i].id, '.')) n++; return n; }
static int dscGotE(void) { int n = 0; for (int i = 0; i < NE; i++) if (!strchr(E[i].id, '.') && hasH(X.dE, X.ndE, hs(E[i].id))) n++; return n; }
static int dscTotR(void) { int n = 0; JFOR(q, jget(dataRoot(), "RESN")) { (void)q; n++; } return n; }
static bool dscHasR(const char *k) { return resGet(k) > 0 || hasH(X.dR, X.ndR, hs(k)); }
static int dscGotR(void) { int n = 0; JFOR(r, jget(dataRoot(), "RESN")) if (dscHasR(r->key)) n++; return n; }
static int dscCount(void) { return dscGotZ() + dscGotE() + dscGotR(); }
static float dscBanT = -1; static char dscBanA[48], dscBanB[96];
static void dscCheck(void) {
	int n = dscCount(), m = n / 10;
	if (m > X.dM) { X.dM = m; int g = (int)roundf(80 * m * (1 + P.lv * .05f)), xp = 40 * m; P.g += g; gainXP(xp); char b[80]; snprintf(b, sizeof b, "%d scoperte · +%d oro, +%d XP", n, g, xp); banner("Diario delle scoperte", b); JINGLE(.1f, W_TRIANGLE, 64, 67, 71, 76); }
	int tot[3] = {dscTotZ(), dscTotE(), dscTotR()}, got[3] = {dscGotZ(), dscGotE(), dscGotR()}; static const char *PN[3] = {"Luoghi", "Creature", "Risorse"};
	for (int c = 0; c < 3; c++) if (!(X.dPg & (1 << c)) && tot[c] && got[c] >= tot[c]) { X.dPg |= 1 << c; int g = (int)roundf(1500 * (1 + P.lv * .05f)); P.g += g; gainXP(800); snprintf(dscBanA, sizeof dscBanA, "Pagina completa: %s", PN[c]); snprintf(dscBanB, sizeof dscBanB, "Hai scoperto tutto! +%d oro", g); dscBanT = gtime + 1.2f; }
}
void discZone(void) {
	char b[48]; bool nw = false;
	if (ZDG >= 0) { snprintf(b, sizeof b, "d:%s", DG[ZDG].id); if (!hasH(X.dZ, X.ndZ, hs(b)) && X.ndZ < 200) { X.dZ[X.ndZ++] = hs(b); nw = true; } }
	else if (!dscSkip(Zk)) { snprintf(b, sizeof b, "z:%s", Zk); if (!hasH(X.dZ, X.ndZ, hs(b)) && X.ndZ < 200) { X.dZ[X.ndZ++] = hs(b); nw = true; } }
	if (nw) { flt(P.px, P.py, "Nuovo luogo", 0xffe08a); dscCheck(); }
}
void discKill(int t) { if (t < 0 || strchr(E[t].id, '.')) return; u32 h = hs(E[t].id); if (hasH(X.dE, X.ndE, h) || X.ndE >= 128) return; X.dE[X.ndE++] = h; flt(P.px, P.py, E[t].n, 0xffe08a); dscCheck(); }
void discRes(const char *k) { u32 h = hs(k); if (hasH(X.dR, X.ndR, h) || X.ndR >= 40) return; X.dR[X.ndR++] = h; dscCheck(); }
static int DTAB = 0;

/* ================= SCAVI (7.44) ================= */
static bool digZoneOk(void) { return ZOUT && !ZINT && ZDG < 0 && strcmp(Zk, "arena") && strncmp(Zk, "mare", 4) && strncmp(Zk, "dim_", 4) && strcmp(Zk, "thal48") && strcmp(Zk, "giungla48") && N >= 24; }
static bool freeTile(Sd *r, bool (*ok)(int, int), int tries, int *ox, int *oy) {
	for (int k = 0; k < tries; k++) { int x = 1 + (int)floorf(sdNext(r) * (N - 2)), y = 1 + (int)floorf(sdNext(r) * (N - 2)); if (M[y][x] != 0 || OCCT[y][x]) continue; if (ok && !ok(x, y)) continue; *ox = x; *oy = y; return true; }
	return false;
}
static s16 DIGD[MAXN * MAXN];
static bool digOk(int x, int y) { if (DIGD[y * N + x] < 0) return false; for (int i = 0; i < NENT; i++) if (ents[i].k == K_PO && fabsf(ents[i].px - x) < 4 && fabsf(ents[i].py - y) < 4) return false; return true; }
void digZoneLoad(void) {
	if (!digZoneOk()) return;
	char d[12]; dayKeyU(d); if (strcmp(X.dugDay, d)) { snprintf(X.dugDay, sizeof X.dugDay, "%s", d); X.ndug = 0; }
	char b[96]; snprintf(b, sizeof b, "scavo|%s|%s|%s", d, NETC.code, Zk); Sd r = sdOf(b);
	bfs((int)P.px, (int)P.py, DIGD);
	for (int i = 0; i < 3; i++) {
		int x, y; if (!freeTile(&r, digOk, 300, &x, &y)) continue;
		float rl = sdNext(&r); char id[64]; snprintf(id, sizeof id, "%s|%s|%d", d, Zk, i);
		if (hasH(X.dug, X.ndug, hs(id))) continue;
		Ent *e = xEntNew(XK_DIG, x + .5f, y + .5f); if (!e) continue;
		e->ph = rl; e->ptg = hs(id); snprintf(e->name, sizeof e->name, "Terra smossa");
	}
}
static u32 digU; static float digAt = -1;
void digAct(Ent *e) { if (digAt > 0) return; digU = e->uid; digAt = gtime + .65f; tone(120, .12f, W_SQUARE, .05f); sparks(e->px, e->py, 14, 0x7a5a3a, 60); }
static void digDone(void) {
	Ent *e = NULL; for (int i = 0; i < NENT; i++) if (ents[i].k == K_X && ents[i].uid == digU) e = &ents[i];
	if (!e) return;
	float rl = e->ph, x = e->px, y = e->py; u32 id = e->ptg; entDel(e);
	if (X.ndug < 24) X.dug[X.ndug++] = id;
	int lv = ZLV ? ZLV : P.lv; if (lv < 1) lv = 1;
	extern void dropItemAt(Item it, float x, float y);
	if (rl < .07f) { Item it = mkItem(lv + 3, 3, -1); dropItemAt(it, x, y); banner("Un passaggio segreto!", "Sotto la terra si apriva una scala, ma è crollata: tra le macerie c'è un tesoro"); JINGLE(.12f, W_TRIANGLE, 60, 63, 67, 70, 74); }
	else if (rl < .15f) { Item it = mkItem(lv + 3, 3, -1); dropItemAt(it, x, y); msg("Hai dissotterrato un tesoro: %s!", it.n); JINGLE(.09f, W_SQUARE, 72, 76, 79, 84, 88); }
	else if (rl < .35f) { Item it = mkItem(lv + 1, rl < .22f ? 2 : rl < .29f ? 1 : 0, -1); dropItemAt(it, x, y); msg("Sotto la terra c'era %s", it.n); JINGLE(.1f, W_SQUARE, 67, 72, 76); }
	else if (rl < .55f) { int n = rl < .45f ? 1 : 2; P.pot += n; msg(n == 1 ? "Hai trovato una pozione sepolta" : "Hai trovato due pozioni sepolte"); tone(520, .1f, W_TRIANGLE, .05f); }
	else { int g = (int)roundf((15 + rl * 45) * (1 + lv * .3f)); P.g += g; char b[24]; snprintf(b, sizeof b, "+%d oro", g); flt(x, y, b, 0xffd84a); msg("Hai dissotterrato %d monete", g); }
	saveGame();
}

/* ================= MALEDIZIONI (7.44) ================= */
typedef struct { const char *n, *d; float b; } MalDef;
static const MalDef MAL43[5] = {{"Nemici veloci", "I nemici corrono e colpiscono più in fretta.", .2f}, {"Furia", "I nemici fanno il 30% di danni in più.", .3f},
	{"Orda", "Metà dei nemici in più in ogni piano.", .25f}, {"Gola secca", "Niente pozioni finché sei nel dungeon.", .35f}, {"Fragile", "La tua vita massima scende del 30%.", .3f}};
static u8 MALSEL; static Ent *MALPO; static u32 MALPOU;
bool malOn(int k) { return X.malDg && ZDG >= 0 && ZDG == X.malDg - 1 && (k < 0 || (X.malK & (1 << k))); }
float malBonus(void) { if (!malOn(-1)) return 0; float b = 0; for (int i = 0; i < 5; i++) if (X.malK & (1 << i)) b += MAL43[i].b; return b; }
// entrando in un dungeon dal piano 1: si possono accettare le maledizioni
bool malAsk(Ent *po) {
	if (X.malNoAsk || ZDG >= 0 || po->lock[0] || !strstr(po->to, "@1")) return false;
	char d[24]; snprintf(d, sizeof d, "%.*s", (int)(strchr(po->to, '@') - po->to), po->to);
	bool isDg = false; for (int i = 0; i < NDG; i++) if (!strcmp(DG[i].id, d)) isDg = true;
	if (!isDg) return false;
	MALPO = po; MALPOU = po->uid; MALSEL = X.malK; xOpen(XP_MAL); tone(200, .12f, W_TRIANGLE, .05f); return true;
}

/* ================= EVENTI DEL MONDO A ORARIO (7.46) ================= */
#define EV_SLOT 1800.0
#define EV_DUR 720.0
typedef struct { u32 s; int ty; char zk[16]; double t0, end; } Ev;
enum { EV_DRAGO, EV_METEORA, EV_MERC };
static bool evOf(u32 s, Ev *V) {
	char b[32]; snprintf(b, sizeof b, "evento|%u", (unsigned)s); Sd r = sdOf(b); float x = sdNext(&r);
	V->s = s; V->ty = x < .4f ? EV_DRAGO : x < .75f ? EV_METEORA : EV_MERC;
	static const char *L1[1] = {"town"}, *L2[4] = {"forest", "desert", "peaks", "campi"}, *L3[5] = {"forest", "desert", "peaks", "campi", "nord"};
	const char **L = V->ty == EV_MERC ? L1 : V->ty == EV_DRAGO ? L2 : L3; int n = V->ty == EV_MERC ? 1 : V->ty == EV_DRAGO ? 4 : 5;
	snprintf(V->zk, sizeof V->zk, "%s", L[(int)floorf(sdNext(&r) * n) % n]);
	V->t0 = s * EV_SLOT; V->end = V->t0 + EV_DUR; return true;
}
static bool evNow(Ev *V) { double now = xNowUTC(); u32 s = (u32)floor(now / EV_SLOT); if (now > s * EV_SLOT + EV_DUR) return false; return evOf(s, V); }
static bool evDone(u32 s) { for (int i = 0; i < 8; i++) if (X.evDone[i] == s) return true; return false; }
static void evMark(u32 s) { int b = 0; for (int i = 0; i < 8; i++) if (X.evDone[i] < X.evDone[b]) b = i; X.evDone[b] = s; saveGame(); }
static u32 evSpawned; static char evSpawnZ[32]; static u32 evAnn;
extern bool syncIsHost(void); extern bool syncOn(void);
static bool evMine(void) { return !(syncOn() && !syncIsHost()); }
static bool evFar(int x, int y) { return hyp(x + .5f - P.px, y + .5f - P.py) > 9; }
static const char *evZoneName(const char *k) { if (!strcmp(k, "town")) return "Aldoria"; J *z = jget(jget(dataRoot(), "Z"), k); return jgs(z, "n", k); }
static void evSpawn(Ev *V) {
	if (strcmp(V->zk, Zk) || evDone(V->s) || (evSpawned == V->s && !strcmp(evSpawnZ, Zk))) return;
	evSpawned = V->s; snprintf(evSpawnZ, sizeof evSpawnZ, "%s", Zk);
	char b[40]; snprintf(b, sizeof b, "evento|%u|posto", (unsigned)V->s); Sd r = sdOf(b);
	if (V->ty == EV_MERC) { int x, y; nearFree(36, 38, &x, &y); Ent *e = xEntNew(XK_MERC, x + .5f, y + .5f); if (e) { snprintf(e->name, sizeof e->name, "Mercante delle terre lontane"); e->ptg = V->s; e->model = -1; } return; }
	int x0, y0; if (!freeTile(&r, evFar, 600, &x0, &y0)) return;
	if (V->ty == EV_DRAGO) {
		if (!evMine()) return;
		static const char *B[3] = {"drago_brina", "ignis", "leviatano"}; int t = enemyIdx(B[(int)floorf(sdNext(&r) * 3) % 3]); if (t < 0) t = enemyIdx("troll");
		Ent *e = mkEn(t, x0, y0); if (!e) return;
		e->hp = e->mx = roundf(e->mx * 2.5f); e->at *= 1.15f; e->xp *= 3; e->xk = 98; e->uid = V->s;
		snprintf(e->name, sizeof e->name, "%s", !strcmp(E[t].id, "drago_brina") ? "Drago Errante dei Ghiacci" : !strcmp(E[t].id, "ignis") ? "Drago di Fuoco" : "Serpente del Diluvio");
		return;
	}
	Ent *c = entNew(K_CH, x0 + .5f, y0 + .5f); if (c) { c->rich = 1; c->xk = 98; c->uid = V->s; }
	Ent *m = xEntNew(XK_MET, x0 + .5f, y0 + .5f); if (m) snprintf(m->name, sizeof m->name, "Cratere della meteora");
	static const int OF[3][2] = {{2, 0}, {-2, 1}, {0, -2}};
	for (int k = 0; k < 3; k++) { int x = x0 + OF[k][0], y = y0 + OF[k][1]; if (x > 0 && y > 0 && x < N - 1 && y < N - 1 && WK(M[y][x])) { Ent *q = entNew(K_RES, x + .5f, y + .5f); if (q) { snprintf(q->res, sizeof q->res, "ferro"); snprintf(q->name, sizeof q->name, "Ferro"); } } }
	if (evMine()) { static const char *C[4] = {"golem_magma", "elem_ghiaccio", "imp", "golem_cr"}; for (int i = 0; i < 3; i++) { int t = enemyIdx(C[(i + V->s) % 4]); if (t < 0) t = enemyIdx("slime"); int x, y; nearFree(x0 + (i - 1) * 3, y0 + 3, &x, &y); if (WK(M[y][x])) mkEn(t, x, y); } }
}
void evZoneLoad(void) { evSpawned = 0; Ev V; if (evNow(&V)) evSpawn(&V); }
static float evT;
static Ev EVC; static bool EVON;
void evTick(float dt) {
	if (wmBanT > 0 && gtime >= wmBanT) { wmBanT = -1; banner(wmBanA, wmBanB); }
	if (dscBanT > 0 && gtime >= dscBanT) { dscBanT = -1; banner(dscBanA, dscBanB); }
	if (wmSpecT > 0 && gtime >= wmSpecT) { wmSpecT = -1; if (P.hp > 0) wpnSpecial(); }
	if (digAt > 0 && gtime >= digAt) { digAt = -1; digDone(); }
	if ((evT -= dt) > 0) return; evT = 2;
	EVON = evNow(&EVC) && !evDone(EVC.s);
	if (!EVON) return;
	if (evAnn != EVC.s) {
		evAnn = EVC.s; static const char *T[3] = {"Un drago attacca", "Una meteora è caduta su", "Un mercante raro è arrivato a"};
		char a[96], b[120]; snprintf(a, sizeof a, "%s %s", T[EVC.ty], evZoneName(EVC.zk));
		snprintf(b, sizeof b, "Per dodici minuti: %s", EVC.ty == EV_DRAGO ? "abbattilo per un grande premio" : EVC.ty == EV_METEORA ? "nel cratere c'è il forziere della stella" : "ha tre oggetti rari da vendere");
		banner(a, b); chatLog("", a, 1);
	}
	evSpawn(&EVC);
}
void evOnKill(Ent *dead) {
	if (dead->xk != 98 || evDone(dead->uid)) return;
	int lv = ZLV ? ZLV : P.lv, g = (int)roundf(300 + lv * 60); P.g += g; gainXP((int)roundf(200 + lv * 40));
	extern void dropItemAt(Item it, float x, float y); dropItemAt(mkItem(lv + 3, 3, -1), dead->px + .5f, dead->py);
	evMark(dead->uid); char b[64]; snprintf(b, sizeof b, "+%d oro e un oggetto epico", g); banner("Il drago è caduto!", b); JINGLE(.09f, W_SQUARE, 60, 64, 67, 72, 76, 79, 84);
}
void evOnChest(Ent *e) {
	if (e->xk != 98 || evDone(e->uid)) return;
	int lv = ZLV ? ZLV : P.lv; P.pot += 2; Item it = mkItem(lv + 2, 2, -1); gain(it); evMark(e->uid);
	char b[80]; snprintf(b, sizeof b, "Dentro c'era %s e due pozioni", it.n); banner("Il forziere della stella", b);
}
static void evStock(u32 s, Item *L) { char b[32]; snprintf(b, sizeof b, "mercante|%u", (unsigned)s); u32 o = rngSwap(hs(b)); int lv = P.lv > 1 ? P.lv : 1; L[0] = mkItem(lv + 2, 2, -1); L[1] = mkItem(lv + 3, 2, -1); L[2] = mkItem(lv + 4, 3, -1); rngSwap(o); }
void x3DrawLabels(void) {
	if (EVON) { static const char *T[3] = {"Drago", "Meteora", "Mercante raro"}; double left = EVC.end - xNowUTC(); if (left < 0) left = 0;
		char b[96]; snprintf(b, sizeof b, "%s · %s · %d:%02d%s", T[EVC.ty], evZoneName(EVC.zk), (int)left / 60, (int)left % 60, !strcmp(Zk, EVC.zk) ? " · sei qui!" : "");
		uiLabel(topCX(), 30, .38f, C2D_Color32(255, 216, 120, 255), b); }
	if (malOn(-1)) { char b[48]; snprintf(b, sizeof b, "Maledetto · bottino +%d%%", (int)roundf(malBonus() * 100)); uiLabel(topCX(), 64, .36f, C2D_Color32(196, 107, 255, 255), b); }
	bossDraw();
}

/* ================= le finestre ================= */
static char BODY3[700];
int xBuild3(int page) {
	switch (page) {
	case XP_DISC: {
		static const char *PN[3] = {"Luoghi", "Creature", "Risorse"};
		int tot[3] = {dscTotZ(), dscTotE(), dscTotR()}, got[3] = {dscGotZ(), dscGotE(), dscGotR()};
		char ti[64]; snprintf(ti, sizeof ti, "Diario delle scoperte · %d", got[0] + got[1] + got[2]);
		snprintf(BODY3, sizeof BODY3, "Ogni dieci scoperte c'è un premio, una pagina completa vale 1500 oro.\n%s: %d su %d%s", PN[DTAB], got[DTAB], tot[DTAB], X.dPg & (1 << DTAB) ? " · pagina completa" : "");
		uiXTitle(ti, BODY3);
		for (int c = 0; c < 3; c++) { char l[48], r[24]; snprintf(l, sizeof l, "%s%s", c == DTAB ? "> " : "", PN[c]); snprintf(r, sizeof r, "%d/%d", got[c], tot[c]); uiXOpt(l, r, XARG(100, c), c == DTAB ? C_GOLD : C_TXT, false); }
		int shown = 0;
		if (DTAB == 0) { JFOR(z, jget(dataRoot(), "Z")) { if (dscSkip(z->key) || shown > 50) continue; char b[48]; snprintf(b, sizeof b, "z:%s", z->key); bool h = hasH(X.dZ, X.ndZ, hs(b)); uiXOpt(h ? jgs(z, "n", z->key) : "???", "", 0, h ? C_TXT : C_MU, false); shown++; } }
		else if (DTAB == 1) { for (int i = 0; i < NE && shown < 60; i++) { if (strchr(E[i].id, '.')) continue; bool h = hasH(X.dE, X.ndE, hs(E[i].id)); uiXOpt(h ? E[i].n : "???", "", 0, h ? C_TXT : C_MU, false); shown++; } }
		else { JFOR(r, jget(dataRoot(), "RESN")) { bool h = dscHasR(r->key); uiXOpt(h ? jstr(r, r->key) : "???", "", 0, h ? C_TXT : C_MU, false); } }
		uiXOpt("Chiudi", "", XARG(1, 0), 0, false);
		return 1; }
	case XP_MAL: {
		float tot = 0; for (int i = 0; i < 5; i++) if (MALSEL & (1 << i)) tot += MAL43[i].b;
		snprintf(BODY3, sizeof BODY3, "Puoi entrare maledetto: il dungeon sarà più duro, ma oro, esperienza e oggetti aumentano. Le maledizioni valgono finché resti nel dungeon.\n%s%s",
			MALSEL ? "Bottino in più: " : "Nessuna maledizione", "");
		if (MALSEL) { int o = strlen(BODY3); snprintf(BODY3 + o, sizeof BODY3 - o, "+%d%%%s", (int)roundf(tot * 100), tot >= .6f ? " · il boss lascerà anche un oggetto epico in più" : ""); }
		uiXTitle("Maledizioni", BODY3);
		for (int i = 0; i < 5; i++) { char l[80], r[24]; snprintf(l, sizeof l, "%s: %s", MAL43[i].n, MAL43[i].d); snprintf(r, sizeof r, "%s +%d%%", MALSEL & (1 << i) ? "[x]" : "[ ]", (int)roundf(MAL43[i].b * 100)); uiXOpt(l, r, XARG(101, i), MALSEL & (1 << i) ? C2D_Color32(196, 107, 255, 255) : C_TXT, false); }
		uiXOpt(MALSEL ? "Entra maledetto" : "Entra", "", XARG(102, 1), C_GOLD, false);
		uiXOpt("Entra senza maledizioni", "", XARG(102, 0), C_TXT, false);
		uiXOpt("Non chiedermelo più", "", XARG(103, 0), C_MU, false);
		uiXOpt("Resta fuori", "", XARG(1, 0), 0, false);
		return 1; }
	case XP_MERC: {
		u32 s = 0; for (int i = 0; i < NENT; i++) if (ents[i].k == K_X && ents[i].xk == XK_MERC) s = ents[i].ptg;
		Item L[3]; evStock(s, L);
		char ti[64]; snprintf(ti, sizeof ti, "Mercante delle terre lontane · %d oro", P.g);
		uiXTitle(ti, "«Resto solo finché suona la campana. Merce che non si trova da nessun'altra parte!»");
		for (int i = 0; i < 3; i++) { bool got = X.evBS == s && (X.evBM & (1 << i)); int pr = (int)roundf(L[i].p * 3); char r[24]; snprintf(r, sizeof r, got ? "venduto" : "%d oro", pr); extern u32 xRarCol(int r); uiXOpt(L[i].n, r, XARG(104, i), xRarCol(L[i].r), got || P.g < pr); }
		uiXOpt("Chiudi", "", XARG(1, 0), 0, false);
		return 1; }
	}
	return xBuild4(page);
}
int xPanelAct3(int a, int i) {
	switch (a) {
	case 100: DTAB = i; return 0;
	case 101: MALSEL ^= 1 << i; tone(MALSEL & (1 << i) ? 260 : 420, .06f, W_TRIANGLE, .05f); return 0;
	case 102: {
		Ent *po = MALPO && MALPO->k == K_PO && MALPO->uid == MALPOU ? MALPO : NULL; uiClose();
		if (!po) return 1;
		char d[24]; snprintf(d, sizeof d, "%.*s", (int)(strchr(po->to, '@') - po->to), po->to);
		int di = -1; for (int k = 0; k < NDG; k++) if (!strcmp(DG[k].id, d)) di = k;
		if (i && MALSEL && di >= 0) { X.malDg = di + 1; X.malK = MALSEL; { float tb = 0; for (int k = 0; k < 5; k++) if (MALSEL & (1 << k)) tb += MAL43[k].b; msg("Entri con %d maledizioni: bottino +%d%%", __builtin_popcount(MALSEL), (int)roundf(tb * 100)); } tone(80, .5f, W_SAW, .06f); }
		else { X.malDg = 0; X.malK = 0; }
		extern void actNoAsk(Ent *e); actNoAsk(po); return 1; }
	case 103: X.malNoAsk = 1; saveGame(); msg("Non te lo chiederò più (si riattiva dalle Impostazioni della storia)"); return 0;
	case 104: {
		u32 s = 0; for (int k = 0; k < NENT; k++) if (ents[k].k == K_X && ents[k].xk == XK_MERC) s = ents[k].ptg;
		Item L[3]; evStock(s, L); int pr = (int)roundf(L[i].p * 3);
		if (X.evBS != s) { X.evBS = s; X.evBM = 0; }
		if (X.evBM & (1 << i)) return 0; if (P.ninv >= INV) { msg("Zaino pieno"); return 0; } if (!pay(pr)) return 0;
		X.evBM |= 1 << i; gain(L[i]); tone(880, .08f, W_TRIANGLE, .05f); saveGame(); return 0; }
	}
	return xPanelAct4(a, i);
}
