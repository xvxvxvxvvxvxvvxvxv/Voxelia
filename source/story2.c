// Voxelia 3DS 1.5 - elementi ed Essenze (7.55), scelte, alleati, vie e titoli (7.48).
// Regole e numeri da src/8zzzzb_elementi.js e src/8zzzq_scelte.js della versione browser.
#include "voxelia.h"
#include "story.h"
#include <time.h>

#define C_TXT C2D_Color32(232, 236, 244, 255)
#define C_MU C2D_Color32(154, 164, 184, 255)
#define C_GOLD C2D_Color32(245, 185, 66, 255)
#define C_GREEN C2D_Color32(122, 255, 138, 255)
static inline float dst(float ax, float ay, float bx, float by) { return hyp(ax - bx, ay - by); }

/* ================= ELEMENTI (7.55) ================= */
static const char *ELN[10] = {"", "Fuoco", "Ghiaccio", "Fulmine", "Acqua", "Veleno", "Terra", "Vento", "Ombra", "Luce"};
static const char *ELK[10] = {"", "fuoco", "ghiaccio", "fulmine", "acqua", "veleno", "terra", "vento", "ombra", "luce"};
static const u32 ELC[10] = {0xffffff, 0xff7a2a, 0x9adcff, 0xfff36a, 0x3a9adf, 0x7ae05a, 0xb8864a, 0xbff4e0, 0x9a5ad0, 0xffe9a0};
static const char *ELD[10] = {"", "incendia il nemico: brucia per qualche secondo", "rallenta il nemico; dal livello 3 a volte lo congela", "un fulmine salta sui nemici vicini (doppio su chi è bagnato)",
	"bagna e spinge indietro il nemico, e ti rinfresca un poco", "avvelena il nemico: perde vita per cinque secondi", "il colpo stordisce: il nemico resta fermo per un attimo",
	"una raffica respinge il nemico e ti fa colpire più in fretta", "ruba vita: una parte del danno ti cura", "il colpo sacro cura te e il compagno, e brucia l'ombra"};
static const char *ROMAN[6] = {"", "I", "II", "III", "IV", "V"};
const char *elName(int k) { return ELN[clampi(k, 0, 9)]; }
u32 elCol(int k) { return ELC[clampi(k, 0, 9)]; }
int elKey(const char *s) { for (int i = 1; i < 10; i++) if (s && !strcmp(s, ELK[i])) return i; return 0; }
// fuoco > ghiaccio > vento > terra > fulmine > acqua > fuoco; veleno > acqua; luce e ombra a vicenda
static int elBeats(int a) { switch (a) { case EL_FUOCO: return EL_GHIACCIO; case EL_GHIACCIO: return EL_VENTO; case EL_VENTO: return EL_TERRA; case EL_TERRA: return EL_FULMINE; case EL_FULMINE: return EL_ACQUA; case EL_ACQUA: return EL_FUOCO; case EL_VELENO: return EL_ACQUA; case EL_LUCE: return EL_OMBRA; case EL_OMBRA: return EL_LUCE; } return 0; }
static float elMul(int a, int b) { if (!a || !b) return 1; if (elBeats(a) == b) return 1.3f; if (a == b) return .7f; if (elBeats(b) == a) return .85f; return 1; }
int itemEl(const Item *it) { return it && it->used && it->s == SL_W ? (it->el >> 3) % 10 : 0; }
int itemElLv(const Item *it) { return clampi(it ? (it->el & 7) : 1, 1, 5); }
// le armi rare in su a volte nascono con un elemento
void itemRollEl(Item *it) {
	if (!it || it->s != SL_W || itemEl(it)) { if (it && it->s != SL_W) it->el = 0; return; }
	static const float PR[5] = {0, .18f, .45f, .7f, .85f};
	it->el = 0;
	if (frnd() < PR[clampi(it->r, 0, 4)]) { int k = fri(1, 9), lv = 1 + (it->r >= 3 ? 1 : 0) + (frnd() < .2f ? 1 : 0); it->el = (u8)((k << 3) | lv); it->p = (u32)roundf(it->p * 1.2f + lv * 20); }
}
// l'elemento di un mostro: quello della specie, poi quello del tema della zona
extern int ZELZ;
int elOfEnemy(int t) { if (t < 0) return 0; if (E[t].el) return E[t].el; return ZELZ ? ZELZ : E[t].elh; }
void elSetEnemy(Ent *e) { e->el = (u8)elOfEnemy(e->t); }
static Ent *elSrc;   // chi ha colpito: NULL l'eroe, altrimenti il compagno
static int elDepth;
extern void hurtEnemyRaw(Ent *e, int d, bool cr);
static void elHit(Ent *e, float d) { int q = (int)fmaxf(1, roundf(d)); elDepth++; hurtEnemyRaw(e, q, false); elDepth--; }
static void elProc(Ent *e, int k, int lv, int d) {
	if (e->k != K_EN || e->hp <= 0) return;
	bool boss = e->boss; float sx = elSrc ? elSrc->px : P.px, sy = elSrc ? elSrc->py : P.py;
	switch (k) {
	case EL_FUOCO: if (e->eFz > gtime) { e->eFz = 0; e->cbs = 0; elHit(e, d * .5f); flt(e->px, e->py, "Vapore!", 0xffffff); } e->eBu = gtime + 2.5f + lv * .5f; flt(e->px, e->py, "Fuoco", 0xff9a3a); break;
	case EL_GHIACCIO: e->eSl = gtime + 1.6f + lv * .3f; e->eSlK = .6f - lv * .04f;
		if (lv >= 3 && frnd() < .25f + lv * .05f && !boss) { e->cbs = gtime + 1; e->eFz = gtime + 1; flt(e->px, e->py, "Congelato!", 0xcfefff); } else flt(e->px, e->py, "Gelo", 0x9adcff); break;
	case EL_FULMINE: {
		bool wet = e->eWe > gtime; if (wet) { elHit(e, d * .6f); flt(e->px, e->py, "Scossa!", 0xfff36a); }
		int n = 1 + lv / 2; float r = 3.4f + lv * .3f;
		for (int c = 0; c < n; c++) { Ent *b = NULL; float bd = r; for (int i = 0; i < NENT; i++) { Ent *o = &ents[i]; if (o->k != K_EN || o == e || o->hp <= 0 || E[o->t].np || o->eZp == (u8)(gtime * 10)) continue; float q = dst(o->px, o->py, e->px, e->py); if (q < bd) { bd = q; b = o; } }
			if (!b) break; b->eZp = (u8)(gtime * 10); fxRing(b->px, b->py, .6f, .15f, 0xfff36a); elHit(b, d * (b->eWe > gtime ? 1 : .5f)); flt(b->px, b->py, "Fulmine", 0xfff36a); }
		break; }
	case EL_ACQUA: { e->eWe = gtime + 4; if (!boss) { float dx = e->px - sx, dy = e->py - sy, l = fmaxf(hyp(dx, dy), .01f); mv(&e->px, &e->py, dx / l * .55f, dy / l * .55f); }
		if (e->eBu > gtime) { e->eBu = 0; flt(e->px, e->py, "Spento", 0xbfefff); }
		int h = (int)fmaxf(1, roundf(d * .04f * lv));
		if (!elSrc && P.hp < P.mx) { P.hp = fminf(P.mx, P.hp + h); char b[8]; snprintf(b, sizeof b, "+%d", h); flt(P.px, P.py, b, 0x7fd0ff); } else if (elSrc) elSrc->hp = fminf(elSrc->mx, elSrc->hp + h);
		flt(e->px, e->py, "Acqua", 0x7fd0ff); break; }
	case EL_VELENO: e->ePo = gtime + 3 + lv * .6f; flt(e->px, e->py, "Veleno", 0x8aff6a); break;
	case EL_TERRA: e->cbs = fmaxf(e->cbs, gtime + (boss ? .25f : .6f + lv * .12f)); flt(e->px, e->py, "Stordito", 0xe8c890); if (!elSrc) shake = fmaxf(shake, .15f); break;
	case EL_VENTO: { if (!boss) { float dx = e->px - sx, dy = e->py - sy, l = fmaxf(hyp(dx, dy), .01f); mv(&e->px, &e->py, dx / l * (.6f + lv * .12f), dy / l * (.6f + lv * .12f)); }
		if (!elSrc) P.at = fmaxf(0, P.at - .12f - lv * .03f); flt(e->px, e->py, "Vento", 0xdffff4); break; }
	case EL_OMBRA: { int h = (int)fmaxf(1, roundf(d * (.06f + lv * .02f))); if (!elSrc) { if (P.hp < P.mx) { P.hp = fminf(P.mx, P.hp + h); char b[8]; snprintf(b, sizeof b, "+%d", h); flt(P.px, P.py, b, 0xc89aff); } } else elSrc->hp = fminf(elSrc->mx, elSrc->hp + h);
		flt(e->px, e->py, "Ombra", 0xc89aff); break; }
	case EL_LUCE: { int h = (int)fmaxf(1, roundf((elSrc ? elSrc->mx : P.mx) * (.012f + lv * .006f))); if (P.hp > 0 && P.hp < P.mx) { P.hp = fminf(P.mx, P.hp + h); char b[8]; snprintf(b, sizeof b, "+%d", h); flt(P.px, P.py, b, 0xfff2a0); }
		if (elSrc) elSrc->hp = fminf(elSrc->mx, elSrc->hp + h);
		if (e->el == EL_OMBRA) elHit(e, d * .3f); flt(e->px, e->py, "Luce", 0xfff2a0); break; }
	}
	sparks(e->px, e->py, 6 + lv * 2, ELC[k], 60 + lv * 8);
}
// un colpo con un elemento (dell'arma dell'eroe o del compagno): debolezze, poi a volte l'effetto
void xHurtEnemy(Ent *e, int d, bool cr, int el) {
	extern Ent *xPetSrc(void);
	if (elDepth || e->k != K_EN || !el) { hurtEnemyRaw(e, d, cr); return; }
	int k = el >> 3, lv = clampi(el & 7, 1, 5);
	float m = elMul(k, e->el);
	if (m != 1) { d = (int)fmaxf(1, roundf(d * m)); if (frnd() < .35f) flt(e->px, e->py + .2f, m > 1 ? "Debole!" : "Resiste", m > 1 ? 0xffd84a : 0x9aa4b8); }
	float hp0 = e->hp;
	hurtEnemyRaw(e, d, cr);
	if (e->k != K_EN || e->hp <= 0) return;
	if (frnd() < .18f + lv * .06f) { int q = (int)fmaxf(1, hp0 - e->hp); elDepth++; elProc(e, k, lv, q ? q : d); elDepth--; }
}
void xHurtFromPet(Ent *pet, Ent *e, int d) { elSrc = pet; xHurtEnemy(e, d, false, pet->el ? (pet->el << 3) | clampi(pet->xs, 1, 5) : 0); elSrc = NULL; }
// bruciature, veleno, gelo e sanguinamento: ogni mezzo secondo, come nel browser
static float elT;
void elTick(float dt) {
	elT += dt; if (elT < .5f) return; elT = 0;
	extern int atkV(void); float k = fmaxf(1, atkV());
	for (int i = 0; i < NENT; i++) {
		Ent *e = &ents[i]; if (e->k != K_EN || e->hp <= 0 || e->pup) continue;
		if (e->eBu > gtime) { elHit(e, k * .12f); if (e->k == K_EN && frnd() < .5f) sparks(e->px, e->py, 3, 0xff9a3a, 40); }
		if (e->k == K_EN && e->ePo > gtime) elHit(e, k * .07f);
		if (e->k == K_EN && e->sBl > gtime) { elHit(e, e->sBd); if (e->k == K_EN) sparks(e->px, e->py, 3, 0xc0202a, 40); }
	}
}
// le Essenze dai mostri
void elOnKill(Ent *dead) {
	int k = dead->el; if (!k) return;
	int n = dead->boss ? 4 + fri(0, 3) : frnd() < .28f ? 1 : 0;
	if (!n) return;
	X.ess[k] = (u16)clampi(X.ess[k] + n, 0, 60000);
	char b[32]; snprintf(b, sizeof b, "+%d Essenza %s", n, ELN[k]); flt(dead->px, dead->py - .3f, b, ELC[k]);
	if (n > 1) msg("Essenze di %s: +%d", ELK[k], n);
}
// la Fucina di Borin: l'infusione elementale
static void infCost(const Item *w, bool fresh, int *g, int *e) { int l = !fresh && itemEl(w) ? itemElLv(w) : 0; *g = (int)roundf(120 + l * 140 + w->r * 60); *e = 3 + l * 3; }
void xSmithOpts(void) {
	Item *w = &P.eq[SL_W]; if (!w->used) return;
	char l[80], r[40]; int cur = itemEl(w), g, e;
	if (cur && itemElLv(w) < 5) { infCost(w, false, &g, &e); snprintf(l, sizeof l, "Infusione: %s %s", ELN[cur], ROMAN[itemElLv(w) + 1]); snprintf(r, sizeof r, "%d oro · %d ess.", g, e); uiXOpt(l, r, XARG(60, cur), ELC[cur] ? C2D_Color32((ELC[cur] >> 16) & 255, (ELC[cur] >> 8) & 255, ELC[cur] & 255, 255) : C_TXT, P.g < g || X.ess[cur] < e); }
	for (int k = 1; k < 10; k++) { if (k == cur) continue; infCost(w, true, &g, &e);
		snprintf(l, sizeof l, "Infondi %s (%d ess.: ne hai %d)", ELN[k], e, X.ess[k]); snprintf(r, sizeof r, "%d oro", g);
		uiXOpt(l, r, XARG(61, k), C2D_Color32((ELC[k] >> 16) & 255, (ELC[k] >> 8) & 255, ELC[k] & 255, 255), P.g < g || X.ess[k] < e); }
}
static void infDo(int k, bool fresh) {
	Item *w = &P.eq[SL_W]; if (!w->used || k < 1 || k > 9) return;
	int g, e; infCost(w, fresh, &g, &e);
	if (P.g < g) { msg("Servono %d monete", g); return; } if (X.ess[k] < e) { msg("Servono %d essenze di %s", e, ELK[k]); return; }
	P.g -= g; X.ess[k] -= e;
	int lv = (fresh || itemEl(w) != k) ? 1 : itemElLv(w) + 1; w->el = (u8)((k << 3) | lv); w->p += (u32)roundf(g * .3f);
	char a[48], b[96]; snprintf(a, sizeof a, "%s %s", ELN[k], ROMAN[lv]); snprintf(b, sizeof b, "%s: %s", w->n, ELD[k]); banner(a, b);
	JINGLE(.07f, W_TRIANGLE, 64, 71, 76, 83); sparks(P.px, P.py, 30, ELC[k], 120); saveGame();
}

/* ================= SCELTE, ALLEATI, VIE E TITOLI (7.48) ================= */
typedef struct { const char *n, *d, *t; } PathDef;
static const PathDef STP[3] = {{"Via della misericordia", "I mercanti ti stimano: prezzi -10%. Gli alleati ti fanno doni più ricchi.", "il Misericordioso"},
	{"Via della spada", "Temprato dalle battaglie: vita massima +6%. Ma i mercanti ti temono: prezzi +10%.", "la Spada di Aldoria"},
	{"Via dell'equilibrio", "Né troppo buono né troppo duro: il regno non sa ancora che cosa aspettarsi da te.", "il Custode dell'Equilibrio"}};
enum { PATH_PACE, PATH_SPADA, PATH_EQUI };
static const char *TITN[8] = {"il Misericordioso", "la Spada di Aldoria", "il Custode dell'Equilibrio", "Eroe di Thalassa", "", "", "", ""};
static int karma(void) { int a = 0; for (int i = 0; i < 12; i++) a += X.bossCh[i]; return a + clampi(X.dilSum, -5, 5); }
static int stPath(void) { int k = karma(); return k >= 3 ? PATH_PACE : k <= -3 ? PATH_SPADA : PATH_EQUI; }
static int lastPath = -1;
static void stCheck(void) { int p = stPath(); if (lastPath >= 0 && lastPath != p) banner(STP[p].n, STP[p].d); lastPath = p; recalc(); }
float xPriceMul(void) { int p = stPath(); return p == PATH_PACE ? .9f : p == PATH_SPADA ? 1.1f : 1; }
float xHpMul(void) { return (stPath() == PATH_SPADA && (karma() || X.dilN) ? 1.06f : 1) * (malOn(4) ? .7f : 1) * mestHpMul() * torHpMul(); }
const char *titleNow(void) { return X.title >= 0 && X.title < 8 && (X.titles & (1u << X.title)) ? TITN[X.title] : ""; }
void titleAdd(int id) { if (X.titles & (1u << id)) return; X.titles |= 1u << id; if (X.title < 0) X.title = id; char b[64]; snprintf(b, sizeof b, "Nuovo titolo: %s", TITN[id]); banner(b, "Si sceglie nella Cronaca (menu)"); saveGame(); }
static void dayKey(char *out) { time_t t = time(NULL); struct tm *g = gmtime(&t); snprintf(out, 12, "%04d-%02d-%02d", g->tm_year + 1900, g->tm_mon + 1, g->tm_mday); }
// il boss si arrende (solo da soli: in rete i boss cadono come sempre)
static u32 surU; static int surI = -1; static float surT = -1;
bool chBossDown(Ent *e) {
	if (e->k != K_EN || !e->boss || ZDG < 0 || DG[ZDG].fin || DG[ZDG].boss != e->t || netOk || e->cho >= 2) return false;
	e->hp = 1; e->cbs = gtime + 1e6f; e->ag = 0; e->al = 0;
	if (!e->cho) { e->cho = 1; surI = e - ents; surU = e->id + 1; flt(e->px, e->py, "Si arrende!", 0xffe08a); tone(300, .4f, W_SINE, .05f); sparks(e->px, e->py, 16, 0xffe08a, 80); surT = gtime + .5f; }
	else if (PM == PM_NONE) xOpen(XP_SPARE);
	return true;
}
static Ent *surEnt(void) { if (surI < 0) return NULL; Ent *e = &ents[surI]; return e->k == K_EN && e->id + 1 == surU ? e : NULL; }
extern void killEnemy(Ent *e);
static void stEnd(int v) {
	Ent *e = surEnt(); if (!e) return;
	bool first = X.bossCh[clampi(ZDG, 0, 11)] == 0;
	X.bossCh[clampi(ZDG, 0, 11)] = (s8)v; e->cho = v > 0 ? 2 : 3; e->cbs = 0; surI = -1;
	char n[48]; snprintf(n, sizeof n, "%s", e->name); float x = e->px, y = e->py;
	uiClose(); killEnemy(e);
	char a[80];
	if (v > 0) { if (e->k == K_DEAD) e->k = K_NONE, entDel(e); sparks(x, y, 30, 0xffe08a, 140); fxRing(x, y, 2.2f, .7f, 0xc8e6ff); snprintf(a, sizeof a, "Hai risparmiato %s", n); banner(a, "Lo ritroverai nella Casa degli alleati, ad Aldoria"); }
	else { snprintf(a, sizeof a, "Hai finito %s", n); banner(a, "Il regno è più sicuro, e la tua fama di guerriero cresce"); }
	(void)first; stCheck(); saveGame();
}
// i dilemmi del Viandante: uno al giorno (giorno vero), uguale per tutti
typedef struct { const char *q, *a, *b; char ta, tb; int va, vb; } Dil;
static const Dil DIL48[7] = {
	{"Un ragazzino affamato ha rubato una mela al mercato e la fruttivendola lo tiene per un orecchio.", "Paga tu la mela e lascialo andare", "Consegnalo alle guardie", 'g', 'g', -20, 30},
	{"Una vedova ti chiede aiuto per riparare il tetto prima della pioggia.", "Aiutala senza chiedere niente", "Aiutala, ma fatti pagare", 'p', 'g', 1, 60},
	{"Fuori dalle mura un goblin ferito chiede pietà: dice che il suo clan lo ha cacciato.", "Curalo e lascialo andare", "Finiscilo", 'p', 'x', -1, 60},
	{"Un mercante ti offre a metà prezzo una spada che, sei quasi sicuro, è stata rubata.", "Rifiuta e avvisa il proprietario", "Comprala per 120 monete", 'g', 'i', 50, -120},
	{"Un bambino ha perso il suo cane vicino al porto e piange sulla banchina.", "Cercalo insieme a lui", "Non hai tempo: tira dritto", 'x', 0, 50, 0},
	{"Due contadini litigano per l'acqua del pozzo e tutti e due ti chiedono di decidere.", "Dividi l'acqua in parti uguali", "Dai ragione a chi ti paga", 'x', 'g', 30, 80},
	{"Un vecchio soldato ubriaco ha rotto una finestra della taverna e non ha i soldi per ripagarla.", "Paga tu la finestra", "Lascia che lo arrestino", 'g', 'g', -40, 20}};
static const Dil *dilToday(void) { char k[12], b[24]; dayKey(k); snprintf(b, sizeof b, "dil48|%s", k); return &DIL48[hs(b) % 7]; }
static bool dilDone(void) { char k[12]; dayKey(k); return !strcmp(X.dilDay, k); }
static void dilPick(int side) {
	if (dilDone()) return;
	const Dil *D = dilToday(); char ty = side > 0 ? D->ta : D->tb; int v = side > 0 ? D->va : D->vb;
	if (ty == 'g' && v < 0 && P.g < -v) { msg("Non hai abbastanza oro"); return; }
	if (ty == 'i' && P.g < -v) { msg("Servono %d monete", -v); return; }
	if (ty == 'i' && P.ninv >= INV) { msg("Lo zaino è pieno"); return; }
	if (ty == 'p' && v < 0 && P.pot < 1) { msg("Non hai pozioni da dargli"); return; }
	dayKey(X.dilDay); X.dilLast = (s8)side; X.dilSum = (s16)(X.dilSum + side); X.dilN++; if (side > 0) X.dilGen++;
	if (ty == 'g') P.g += v; else if (ty == 'p') P.pot += v; else if (ty == 'x') gainXP(v * (P.lv / 4 > 1 ? P.lv / 4 : 1));
	else if (ty == 'i') { P.g += v; Item it = mkItem(P.lv > 1 ? P.lv : 1, 1, SL_W); gain(it); msg("Hai comprato %s", it.n); }
	tone(side > 0 ? 660 : 330, .1f, W_TRIANGLE, .05f);
	msg(side > 0 ? "Il Viandante sorride: «Il regno ha bisogno di gente come te.»" : "Il Viandante annuisce piano: «Anche questa è una scelta.»");
	stCheck(); saveGame();
}
// la Casa degli alleati
static int allies(int *out) { int n = 0; for (int i = 0; i < NDG && i < 12; i++) if (X.bossCh[i] > 0 && DG[i].boss >= 0) out[n++] = i; return n; }
static void alGift(int d) {
	char k[12]; dayKey(k); if (strcmp(X.giftDay, k)) { snprintf(X.giftDay, sizeof X.giftDay, "%s", k); X.giftMask = 0; }
	if (X.giftMask & (1 << d)) return; X.giftMask |= 1 << d;
	int g = (int)roundf((80 + P.lv * 15) * (stPath() == PATH_PACE ? 1.5f : 1)); P.g += g; P.pot++;
	msg("%s ti regala %d monete e una pozione", E[DG[d].boss].n, g); tone(700, .08f, W_TRIANGLE, .05f); saveGame();
}
static int MD_VIAND = -1, MD_ALLY = -1;
int MD_SIG48 = -1; static int MD_NEREA = -1;
void xModels2(J *xm) { J *p = jget(xm, "props"); MD_VIAND = (int)jgn(p, "dil48", -1); MD_ALLY = (int)jgn(p, "al48", -1); MD_SIG48 = (int)jgn(p, "sig48", -1); MD_NEREA = (int)jgn(xm, "nerea", -1); }
void chZoneLoad(void) {
	if (P.st >= 0 && lastPath < 0) lastPath = stPath();
	if (strcmp(Zk, "town")) return;
	(void)MD_VIAND; (void)MD_ALLY;   // il Viandante e la Casa degli alleati arrivano dall'esportazione (world.c)
}
void chTick(float dt) {
	(void)dt;
	{ extern void olTick(void); olTick(); }
	if (surT > 0 && gtime >= surT) { surT = -1; if (surEnt() && PM == PM_NONE) xOpen(XP_SPARE); }
	for (int i = 0; i < NENT; i++) { Ent *e = &ents[i]; if (e->k == K_X && e->xk == XK_VIAND) { e->face = faceOf(P.px - e->px, P.py - e->py); e->qm = dilDone() ? 0 : '!'; } }
}

/* ================= le finestre ================= */
static char BODY[900];
static int olBuild(int page);
static void olReward(void);
static float olBanT; static const char *olBanA, *olBanB;
const char *olStatus(void);
int xBuild2(int page) {
	char ti[96];
	if (olBuild(page)) return 1;
	switch (page) {
	case XP_SPARE: {
		Ent *e = surEnt(); if (!e) { uiXTitle("", "Non c'è nessuno da giudicare."); uiXOpt("Chiudi", "", XARG(1, 0), 0, false); return 1; }
		s8 old = X.bossCh[clampi(ZDG, 0, 11)];
		snprintf(ti, sizeof ti, "%s si arrende", e->name);
		snprintf(BODY, sizeof BODY, "«Basta... hai vinto. Fa' di me quello che vuoi.» La sua arma è a terra. Il bottino è lo stesso, ma quello che scegli resta nella storia%s.\nVia di adesso: %s (%+d)",
			old ? (old > 0 ? " (l'ultima volta lo hai risparmiato)" : " (l'ultima volta lo hai finito)") : "", STP[stPath()].n, karma());
		uiXTitle(ti, BODY);
		uiXOpt("Risparmialo: diventerà un tuo alleato ad Aldoria", "", XARG(70, 1), C_GREEN, false);
		uiXOpt("Finiscilo: il regno sarà più sicuro", "", XARG(70, 0), C2D_Color32(255, 140, 120, 255), false);
		return 1; }
	case XP_VIAND: {
		const Dil *D = dilToday();
		if (dilDone()) snprintf(BODY, sizeof BODY, "«Ogni giorno il regno ti mette davanti a una scelta. Oggi è questa.»\n%s\nHai già scelto: %s. Torna domani per un'altra storia.\n%s", D->q, X.dilLast > 0 ? D->a : D->b, STP[stPath()].n);
		else snprintf(BODY, sizeof BODY, "«Ogni giorno il regno ti mette davanti a una scelta. Oggi è questa.»\n%s\n%s", D->q, STP[stPath()].n);
		uiXTitle("Il Viandante", BODY);
		if (!dilDone()) { uiXOpt(D->a, "", XARG(71, 1), C_GREEN, false); uiXOpt(D->b, "", XARG(71, 0), C2D_Color32(255, 160, 120, 255), false); }
		uiXOpt("Cronaca delle tue scelte", "", XARG(XA_GO, XP_CRON), C_GOLD, false);
		uiXOpt("Chiudi", "", XARG(1, 0), 0, false);
		return 1; }
	case XP_ALLY: {
		int L[12], n = allies(L); char k[12]; dayKey(k); bool today = !strcmp(X.giftDay, k);
		snprintf(BODY, sizeof BODY, "Qui vivono i nemici che hai risparmiato. Ogni giorno ognuno ti fa un dono%s.%s", stPath() == PATH_PACE ? " (più ricco, per la tua via)" : "", n ? "" : "\nLa casa è vuota: quando un boss si arrende, risparmialo.");
		uiXTitle("Casa degli alleati", BODY);
		for (int i = 0; i < n; i++) { char l[80]; snprintf(l, sizeof l, "%s · da %s", E[DG[L[i]].boss].n, DG[L[i]].n); bool got = today && (X.giftMask & (1 << L[i])); uiXOpt(l, got ? "ci vediamo domani" : "Ritira il dono", XARG(72, L[i]), got ? C_MU : C_GOLD, got); }
		uiXOpt("Chiudi", "", XARG(1, 0), 0, false);
		return 1; }
	case XP_CRON: {
		int p = stPath(), k = karma(), L[12], na = allies(L);
		int o = snprintf(BODY, sizeof BODY, "Il regno oltre il mare: %s\n%s (%+d)\n%s\nDilemmi del Viandante: %d (%d generosi, %d duri) · alleati: %d\nEssenze:", olStatus(), STP[p].n, k, STP[p].d, X.dilN, X.dilGen, X.dilN - X.dilGen, na);
		for (int i = 1; i < 10 && o < (int)sizeof BODY - 24; i++) o += snprintf(BODY + o, sizeof BODY - o, " %s %d%s", ELN[i], X.ess[i], i < 9 ? " ·" : "");
		uiXTitle("Cronaca delle tue scelte", BODY);
		for (int i = 0; i < NDG && i < 12; i++) { if (DG[i].fin || DG[i].boss < 0) continue; char l[80]; snprintf(l, sizeof l, "%s · %s", E[DG[i].boss].n, DG[i].n); uiXOpt(l, X.bossCh[i] > 0 ? "risparmiato" : X.bossCh[i] < 0 ? "finito" : "non ancora", 0, X.bossCh[i] > 0 ? C_GREEN : X.bossCh[i] < 0 ? C2D_Color32(255, 140, 120, 255) : C_MU, false); }
		bool any = false;
		for (int i = 0; i < 8; i++) if (X.titles & (1u << i)) { any = true; char l[64]; snprintf(l, sizeof l, "Titolo: %s", TITN[i]); uiXOpt(l, X.title == i ? "sopra l'eroe" : "scegli", XARG(73, i), X.title == i ? C_GOLD : C_TXT, false); }
		if (!any) uiXOpt("Nessun titolo, per ora: si vincono con il regno oltre il mare", "", 0, C_MU, false);
		uiXOpt("Chiudi", "", XARG(1, 0), 0, false);
		return 1; }
	}
	return xBuild3(page);
}
int xPanelAct2(int a, int i) {
	extern void xSetPage(int p);
	switch (a) {
	case 105: X.malNoAsk = 0; saveGame(); msg("Le maledizioni ti saranno di nuovo proposte"); return 0;
	case XA_GO: xSetPage(i); return 0;
	case 60: infDo(i, false); return 2;
	case 61: infDo(i, true); return 2;
	case 70: stEnd(i ? 1 : -1); return 1;
	case 71: dilPick(i ? 1 : -1); return 0;
	case 72: alGift(i); return 0;
	case 80: domBuy(i); return 0;
	case 90: uiClose(); if (i) { if (X.olS == 0) X.olS = 1; goZone("thal48"); if (X.olS == 1) { olBanT = gtime + 1.2f; olBanA = "Thalassa"; olBanB = "Il regno oltre il mare · parla con il Cancelliere Oreste"; } } else goZone("porto"); saveGame(); return 1;
	case 91: olReward(); return 1;
	case 73: X.title = X.title == i ? -1 : i; saveGame(); return 0;
	}
	return xPanelAct3(a, i);
}

/* ================= IL REGNO OLTRE IL MARE (7.48, src/8zzzs_oltremare.js) ================= */
static const char *OLS[6] = {"Al Porto di Aldoria la Capitana Marina cerca chi la accompagni a Thalassa (dal livello 10).", "A Thalassa, parla con il Cancelliere Oreste nel palazzo.",
	"Trova i tre Sigilli di Giada nei santuari della Giungla di Smeraldo", "Entra nel Tempio di Giada e affronta Quetzal, il Serpente di Giada.", "Torna a Thalassa: la Regina Nerea ti aspetta.", "Capitolo completato: sei l'Eroe di Thalassa."};
static int olSigN(void) { return X.olSig[0] + X.olSig[1] + X.olSig[2]; }
const char *olStatus(void) { static char b[160]; int s = X.olS > 5 ? 5 : X.olS; if (s == 2) snprintf(b, sizeof b, "%s (%d/3).", OLS[2], olSigN()); else snprintf(b, sizeof b, "%s", OLS[s]); return b; }
bool xNpcStory(const char *nid) {
	if (!strcmp(nid, "capitanomarina48")) { uiXOpt(Zk[0] && !strcmp(Zk, "thal48") ? "Torna al Porto di Aldoria" : "Parla della traversata per Thalassa", "", XARG(XA_GO, XP_MARINA), C_GOLD, false); return true; }
	if (!strcmp(nid, "oreste48")) { uiXOpt("Ascolta il Cancelliere", "", XARG(XA_GO, XP_ORESTE), C_GOLD, false); return true; }
	if (!strcmp(nid, "selene55")) { uiXOpt("Il Serraglio: potenzia, modifica, muta forma, pensione, uova", "", XARG(XA_GO, XP_SERR), C_GOLD, false); return true; }
	if (!strcmp(nid, "nerea48")) { uiXOpt("Parla con la Regina", "", XARG(XA_GO, XP_NEREA), C_GOLD, false); return true; }
	return false;
}
void olZoneLoad(void) {
	if (!strcmp(Zk, "in_pal48") && X.olS >= 4) {
		bool has = false; for (int i = 0; i < NENT; i++) if (ents[i].k == K_NPC && ents[i].nid >= 0 && !strcmp(NPCS[ents[i].nid].id, "nerea48")) has = true;
		Ent *e; if (!has && (e = entNew(K_NPC, 7.5f, 2.5f))) { extern int npcIdx(const char *); e->nid = npcIdx("nerea48"); e->model = MD_NEREA; snprintf(e->name, sizeof e->name, "Regina Nerea"); e->face = 0; }
	}
}
void olShrine(Ent *e) {
	int i = e->xs % 3;
	if (X.olS < 2) { msg("Un antico santuario di giada. Un'iscrizione dice: «Solo chi è mandato dalla Regina può prendere il sigillo»."); return; }
	if (X.olSig[i]) { msg("Il sigillo di questo santuario è già tuo"); return; }
	if (!e->xo) {
		e->xo = 1; int t = enemyIdx("guerriero48");
		for (int k = 0; k < 2; k++) { int x, y; nearFree((int)e->px + (k ? 2 : -2), (int)e->py + 1, &x, &y); Ent *m = mkEn(t, x, y); if (m) { m->hp = m->mx = roundf(m->mx * 1.15f); snprintf(m->name, sizeof m->name, "Custode di Giada"); m->xk = 99; m->xs = i + 1; m->al = 1; } }
		banner("I custodi si svegliano!", "Sconfiggili per prendere il sigillo"); tone(200, .3f, W_SAW, .05f); return;
	}
	for (int k = 0; k < NENT; k++) if (ents[k].k == K_EN && ents[k].xk == 99 && ents[k].xs == i + 1) { msg("I custodi del santuario sono ancora in piedi"); tone(150, .1f, W_SQUARE, .04f); return; }
	X.olSig[i] = 1; int n = olSigN(); JINGLE(.1f, W_TRIANGLE, 64, 67, 71, 76); sparks(e->px, e->py, 26, 0x6affc0, 120);
	if (n >= 3) { if (X.olS < 3) X.olS = 3; addUnl("tempio48"); for (int k = 0; k < NENT; k++) if (ents[k].k == K_PO && !strcmp(ents[k].lock, "tempio48")) ents[k].lock[0] = 0; banner("Hai i tre Sigilli di Giada!", "Le porte del Tempio, a nord, si aprono"); }
	else { char a[40], b[32]; snprintf(a, sizeof a, "Sigillo di Giada %d/3", n); snprintf(b, sizeof b, "Ne mancano %d", 3 - n); banner(a, b); }
	saveGame();
}
void olOnKill(Ent *dead) {
	if (strcmp(E[dead->t].id, "quetzal48") || X.olS >= 4) return;
	X.olS = 4; saveGame(); olBanT = gtime + 3.2f; olBanA = "La Regina Nerea è libera!"; olBanB = "Torna a Thalassa: ti aspetta nel palazzo";
}
void olTick(void) { if (olBanT > 0 && gtime >= olBanT) { olBanT = -1; banner(olBanA, olBanB); } }
static int olBuild(int page) {
	switch (page) {
	case XP_MARINA:
		if (!strcmp(Zk, "thal48")) { uiXTitle("La Stella del Sud", "«Si torna ad Aldoria? Il vento è buono.»"); uiXOpt("Torna al Porto di Aldoria", "", XARG(90, 0), C_GOLD, false); }
		else if (P.lv < 10) uiXTitle("Capitana Marina", "«Laggiù, oltre l'orizzonte, c'è Thalassa. Ma il mare è pericoloso e il viaggio lungo: torna quando sarai più forte (livello 10).»");
		else if (X.olS == 0) { uiXTitle("Capitana Marina", "«Stamattina è arrivata una barca da Thalassa, il regno oltre il mare. Il marinaio era stremato: il Serpente di Giada si è risvegliato nella giungla, e la Regina Nerea è scomparsa. Thalassa chiede aiuto ad Aldoria. Tu verresti?»"); uiXOpt("Salpa per Thalassa", "", XARG(90, 1), C_GOLD, false); }
		else { uiXTitle("Capitana Marina", "«La Stella del Sud è pronta. Thalassa ci aspetta.»"); uiXOpt("Salpa per Thalassa", "", XARG(90, 1), C_GOLD, false); }
		uiXOpt("Chiudi", "", XARG(1, 0), 0, false); return 1;
	case XP_ORESTE: {
		const char *tx;
		if (X.olS <= 1) { tx = "«Grazie al mare sei arrivato. Ascolta: nel cuore della Giungla di Smeraldo c'è il Tempio di Giada, dove dorme Quetzal, il Serpente. Per secoli ha protetto la giungla. Poi, una notte, si è svegliato furioso. La Regina Nerea è andata al tempio per calmarlo... e non è tornata. Le porte del tempio si aprono solo con i tre Sigilli di Giada, custoditi nei santuari della giungla. Trovali, ti prego.»";
			if (X.olS < 2) { X.olS = 2; saveGame(); olBanT = gtime + .3f; olBanA = "Nuova missione"; olBanB = "Trova i tre Sigilli di Giada nella giungla"; } }
		else if (X.olS == 2) { static char b[160]; snprintf(b, sizeof b, "«I santuari sono tre: a ovest, a est e a sud-ovest della giungla. Hai %d sigilli su 3.»", olSigN()); tx = b; }
		else if (X.olS == 3) tx = "«Hai i sigilli! Il tempio è a nord della giungla. Che il mare ti protegga.»";
		else if (X.olS == 4) tx = "«La Regina è tornata! Ti aspetta qui, nel palazzo.»";
		else tx = "«Thalassa non dimenticherà mai il tuo nome.»";
		uiXTitle("Cancelliere Oreste", tx); uiXOpt("Chiudi", "", XARG(1, 0), 0, false); return 1; }
	case XP_NEREA: {
		int ti = -1; for (int i = 0; i < NDG; i++) if (!strcmp(DG[i].id, "tempio48")) ti = i;
		bool sp = ti >= 0 && X.bossCh[ti] > 0;
		if (X.olS >= 5) uiXTitle("Regina Nerea", sp ? "«Quetzal veglia di nuovo sulla giungla, come un tempo. Grazie a te. Torna quando vuoi: questa è anche casa tua.»" : "«La giungla è più silenziosa, senza il Serpente. Ma Thalassa è salva. Torna quando vuoi: questa è anche casa tua.»");
		else { uiXTitle("Regina Nerea", sp ? "«Quando Quetzal si è arreso, i suoi occhi sono tornati verdi, come quando ero bambina. Qualcuno aveva rubato la Perla del tempio e lui era impazzito di dolore. Hai fatto bene a risparmiarlo: ora veglierà di nuovo sulla giungla. Thalassa ha un debito con te, eroe di Aldoria.»" : "«Hai fatto quello che andava fatto. Il Serpente non avrebbe più smesso di distruggere. Ma mi chiedo se ci fosse un'altra via... Thalassa ha un debito con te, eroe di Aldoria.»");
			if (X.olS == 4) uiXOpt("Ricevi i doni della Regina", "", XARG(91, 0), C_GOLD, false); }
		uiXOpt("Chiudi", "", XARG(1, 0), 0, false); return 1; }
	}
	return 0;
}
static void olReward(void) {
	if (X.olS != 4) return; X.olS = 5;
	Item it = mkItem(P.lv > 16 ? P.lv : 16, 3, SL_H); snprintf(it.n, sizeof it.n, "Corona di Corallo"); it.hp += 120;
	gain(it); P.g += 4000; gainXP(3000); P.pot += 5;
	banner("Eroe di Thalassa", "4000 oro, la Corona di Corallo e cinque pozioni"); JINGLE(.09f, W_TRIANGLE, 60, 64, 67, 72, 76, 79, 84);
	titleAdd(3); saveGame();
}
