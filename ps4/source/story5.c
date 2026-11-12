// Voxelia PS4 (motore dei port 3DS e Vita) - la Bottega dei mestieri (7.47/7.49, src/8zzzk_mestieri.js): Fornello (pasti), Alambicco
// (pozioni, sigilli, elisir), Incudine (forgia, tempra, fusione), la Dispensa e il banco del Mercato.
// Sulla console non si pesca: per le ricette con il pesce vale il pesce che portano il gatto e il pinguino.
#include "voxelia.h"

#define C_TXT C2D_Color32(232, 236, 244, 255)
#define C_MU C2D_Color32(154, 164, 184, 255)
#define C_GOLD C2D_Color32(245, 185, 66, 255)
#define C_GREEN C2D_Color32(122, 255, 138, 255)
typedef struct { const char *id; char m; u8 lv; const char *a, *b; u8 na, nb; const char *n, *fx; u8 v; char s; u8 sec; const char *d; } Rec;
// stesse ricette del browser (MSRC47); "pesce" al posto dei pesci della pesca
static const Rec RC47[20] = {
	{"pane", 'c', 1, "grano", "uova", 1, 1, "Pane dolce", "vita", 0, 0, 0, "Vita massima +15% e cura subito il 30%"},
	{"torta", 'c', 1, "grano", "mela", 1, 1, "Torta di mele", "forza", 0, 0, 0, "Attacco +25%"},
	{"zuppa", 'c', 2, "grano", "pesce", 1, 1, "Zuppa del pescatore", "rigenera", 0, 0, 0, "Rigenera l'1,5% della vita al secondo"},
	{"frittata", 'c', 3, "uova", "pesce", 2, 1, "Frittata di mare", "difesa", 0, 0, 0, "Difesa +25%"},
	{"orata", 'c', 4, "mela", "pesce", 1, 1, "Orata alle mele", "xp", 0, 0, 0, "Esperienza +25%"},
	{"banchetto", 'c', 6, "uova", "mela", 2, 2, "Banchetto del cavaliere", "tutto", 0, 0, 0, "Attacco e difesa +25%, vita massima +10%"},
	{"sidro", 'c', 1, "lunare", "mela", 1, 1, "Sidro di luna", "oro", 0, 0, 1, "Oro dai nemici +30%"},
	{"pozrosa", 'a', 1, "rosa", "mela", 1, 1, "Pozioni di rosa", "pozioni", 3, 0, 0, "Tre pozioni curative"},
	{"sigillo", 'a', 2, "lunare", "rosa", 1, 1, "Sigilli di doma", "sigilli", 2, 0, 0, "Due Sigilli per domare i mostri"},
	{"vigore", 'a', 3, "conchiglia", "rosa", 2, 1, "Elisir di vigore", "rigenera", 0, 0, 0, "Elisir: rigenera la vita"},
	{"ritorno", 'a', 4, "ghiaccio", "lunare", 1, 1, "Pietra del ritorno", "ritorno", 0, 0, 0, "Ti riporta subito ad Aldoria"},
	{"fortuna", 'a', 5, "scarab", "rosa", 2, 1, "Elisir della fortuna", "oro", 0, 0, 0, "Elisir: oro dai nemici +30%"},
	{"saggio", 'a', 7, "gemma", "lunare", 1, 2, "Essenza del saggio", "xp2", 0, 0, 0, "Elisir: esperienza +50%"},
	{"arcobaleno", 'a', 1, "conchiglia", "scarab", 1, 1, "Pozione dell'arcobaleno", "pozioni", 6, 0, 1, "Sei pozioni in un colpo solo"},
	{"lama", 'f', 1, "ferro", "carbone", 3, 2, "Forgia un'arma", NULL, 0, 'w', 0, "Un'arma con il tuo nome"},
	{"scudo", 'f', 2, "ferro", "legna", 3, 2, "Forgia uno scudo", NULL, 0, 's', 0, "Uno scudo con il tuo nome"},
	{"elmo", 'f', 3, "ferro", "rame", 2, 2, "Forgia un elmo", NULL, 0, 'h', 0, "Un elmo con il tuo nome"},
	{"corazza", 'f', 4, "ferro", "rame", 4, 2, "Forgia una corazza", NULL, 0, 'c', 0, "Una corazza con il tuo nome"},
	{"capo", 'f', 8, "gemma", "ferro", 1, 4, "Capolavoro", NULL, 0, 0, 0, "Un oggetto epico, di qualunque tipo"},
	{"drago", 'f', 1, "gemma", "carbone", 2, 3, "Lama del drago", NULL, 0, 'w', 1, "Un'arma epica con il fuoco dentro"}};
#define NREC 20
static const char *MSTM[8] = {"grano", "uova", "mela", "rosa", "ferro", "carbone", "rame", "legna"}; static const int MSTMP[8] = {6, 8, 6, 10, 25, 14, 30, 5};
static int mIdx(char m) { return m == 'c' ? 0 : m == 'a' ? 1 : 2; }
static int mLv(char m) { int x = X.mxp[mIdx(m)]; int l = 1 + (int)floorf(sqrtf(x / 12.f)); return l > 10 ? 10 : l; }
static bool known(int r) { return RC47[r].sec ? (X.mkK >> r) & 1 : (mLv(RC47[r].m) >= RC47[r].lv || ((X.mkK >> r) & 1)); }
static const char *resName(const char *k) { J *r = jget(jget(dataRoot(), "RESN"), k); return jstr(r, k); }
static void take(const char *k, int n) { resAdd(k, -n); }
static void gainM(char m, int n) {
	int l0 = mLv(m); X.mxp[mIdx(m)] += n; int l1 = mLv(m);
	if (l1 > l0) { static const char *MN[3] = {"Cucina", "Alchimia", "Fabbro"}; char a[48], b[120] = "Le tue creazioni migliorano"; snprintf(a, sizeof a, "%s: livello %d", MN[mIdx(m)], l1);
		int o = 0; for (int r = 0; r < NREC; r++) if (RC47[r].m == m && !RC47[r].sec && RC47[r].lv == l1) o += snprintf(b + o, sizeof b - o, "%s%s", o ? ", " : "Nuova ricetta: ", RC47[r].n);
		banner(a, b); JINGLE(.09f, W_TRIANGLE, 60, 64, 67, 72); }
}
static bool make(int ri) {
	const Rec *r = &RC47[ri]; int lv = mLv(r->m);
	if (resGet(r->a) < r->na || resGet(r->b) < r->nb) { msg("Servono %d %s e %d %s", r->na, resName(r->a), r->nb, resName(r->b)); tone(150, .1f, W_SQUARE, .04f); return false; }
	if (r->m == 'f' && P.ninv >= INV) { msg("Lo zaino è pieno"); return false; }
	take(r->a, r->na); take(r->b, r->nb);
	if (r->m == 'f') {
		int L2 = P.lv + 1 + lv / 3, mr = !strcmp(r->id, "capo") || !strcmp(r->id, "drago") ? 3 : lv >= 6 && frnd() < .25f + lv * .03f ? 3 : lv >= 3 ? 2 : 1;
		int sl = r->s == 'w' ? SL_W : r->s == 's' ? SL_S : r->s == 'h' ? SL_H : r->s == 'c' ? SL_C : -1;
		Item it = mkItem(L2, mr, sl); char base[30]; snprintf(base, sizeof base, "%s", !strcmp(r->id, "drago") ? "Lama del drago" : it.n);
		snprintf(it.n, sizeof it.n, "%.*s di %s", 28 - (int)strlen(P.name) - 4 > 4 ? 28 - (int)strlen(P.name) - 4 : 4, base, P.name);
		if (!strcmp(r->id, "drago")) { it.cr += 10; it.el = (EL_FUOCO << 3) | 2; }
		gain(it); msg("Hai forgiato: %s", it.n); tone(220, .08f, W_SQUARE, .06f); sparks(P.px, P.py, 18, 0xffb04a, 80);
	} else if (!strcmp(r->fx, "pozioni")) { int n = r->v + (lv >= 5 ? 1 : 0); P.pot += n; msg("+%d pozioni", n); }
	else if (!strcmp(r->fx, "sigilli")) { int n = r->v + (lv >= 6 ? 1 : 0); X.seal += n; msg("+%d Sigilli di doma", n); }
	else { int n = r->m == 'c' && lv >= 4 ? 2 : 1; X.cib[ri] = (u8)clampi(X.cib[ri] + n, 0, 99); msg("Pronto: %s%s (nella Dispensa)", r->n, n > 1 ? " x2" : ""); }
	gainM(r->m, r->m == 'f' ? 14 : 8); tone(700, .07f, W_TRIANGLE, .05f); saveGame(); return true;
}
// sperimentare con due ingredienti: si scoprono le ricette (anche quelle segrete)
static char SELA[16], SELB[16];
static void tryMix(char m) {
	if (!SELA[0] || !SELB[0]) { msg("Scegli due ingredienti"); return; }
	if (!strcmp(SELA, SELB) && resGet(SELA) < 2) { msg("Ne serve un altro"); return; }
	int f = -1; for (int r = 0; r < NREC; r++) if (RC47[r].m == m && ((!strcmp(RC47[r].a, SELA) && !strcmp(RC47[r].b, SELB)) || (!strcmp(RC47[r].a, SELB) && !strcmp(RC47[r].b, SELA)))) f = r;
	if (f < 0) { take(SELA, 1); take(SELB, 1); gainM(m, 2); msg("Non è venuto niente di buono... ma hai imparato qualcosa"); tone(160, .15f, W_SAW, .04f); SELA[0] = SELB[0] = 0; saveGame(); return; }
	if (!((X.mkK >> f) & 1)) { X.mkK |= 1u << f; gainM(m, 25); char a[64]; snprintf(a, sizeof a, "%s%s", RC47[f].sec ? "Ricetta segreta: " : "Ricetta scoperta: ", RC47[f].n); banner(a, RC47[f].d); }
	make(f); SELA[0] = SELB[0] = 0;
}
// pasti ed elisir: uno alla volta per tipo, dieci minuti (un po' di più con il mestiere alto)
static const Rec *active(int slot) { int i = slot ? X.eli : X.meal; double u = slot ? X.eliU : X.mealU; if (i < 0 || i >= NREC || u < xNowUTC()) return NULL; return &RC47[i]; }
static bool has(const char *fx) { const Rec *a = active(0), *b = active(1); return (a && !strcmp(a->fx, fx)) || (b && !strcmp(b->fx, fx)); }
float mestXpMul(void) { return has("xp2") ? 1.5f : has("xp") ? 1.25f : 1; }
float mestGoldMul(void) { return has("oro") ? 1.3f : 1; }
float mestHpMul(void) { return has("vita") ? 1.15f : has("tutto") ? 1.1f : 1; }
static void eat(int ri) {
	if (!X.cib[ri]) return; const Rec *r = &RC47[ri]; double dur = 600 * (1 + .05f * (mLv(r->m) - 1));
	X.cib[ri]--;
	if (!strcmp(r->fx, "ritorno")) { uiClose(); msg("La Pietra del ritorno brilla..."); goZone("town"); saveGame(); return; }
	if (r->m == 'c') { X.meal = (s8)ri; X.mealU = xNowUTC() + dur; } else { X.eli = (s8)ri; X.eliU = xNowUTC() + dur; }
	recalc();
	if (!strcmp(r->fx, "vita")) P.hp = fminf(P.mx, P.hp + roundf(P.mx * .3f));
	else if (!strcmp(r->fx, "forza") || !strcmp(r->fx, "tutto")) { P.bA = fmaxf(P.bA, dur); if (!strcmp(r->fx, "tutto")) P.bD = fmaxf(P.bD, dur); }
	else if (!strcmp(r->fx, "difesa")) P.bD = fmaxf(P.bD, dur);
	msg("%s%s · %s", r->m == 'c' ? "Hai mangiato: " : "Hai bevuto: ", r->n, r->d); tone(520, .08f, W_SINE, .05f); saveGame();
}
static float mT; static bool hpBoost;
void mestTick(float dt) {
	if (has("rigenera") && P.hp > 0 && P.hp < P.mx) P.hp = fminf(P.mx, P.hp + P.mx * .015f * dt);
	if ((mT -= dt) > 0) return; mT = .5f;
	bool hb = mestHpMul() > 1; if (hb != hpBoost) { hpBoost = hb; recalc(); }
}
// l'Incudine: tempra (fino a tre volte, +7%) e fusione
static int tmpSlot(const Item *it, bool make) { u32 k = hs(it->n) ^ ((u32)it->r << 24) ^ it->s; for (int i = 0; i < 8; i++) if (X.tmp[i].key == k) return i; if (!make) return -1; for (int i = 0; i < 8; i++) if (!X.tmp[i].key) { X.tmp[i].key = k; X.tmp[i].tp = 0; return i; } X.tmp[0].key = k; X.tmp[0].tp = 0; return 0; }
static int tpOf(const Item *it) { int s = tmpSlot(it, false); return s >= 0 ? X.tmp[s].tp : 0; }
static void temper(int sl) {
	Item *it = &P.eq[sl]; if (!it->used) return; int n = tpOf(it) + 1; if (n > 3) { msg("Più di così non si tempra"); return; }
	int fe = 1 + n, ca = n, ra = n >= 3 ? 1 : 0;
	if (resGet("ferro") < fe || resGet("carbone") < ca || resGet("rame") < ra) { msg("Servono %d ferro, %d carbone%s", fe, ca, ra ? " e 1 rame" : ""); tone(150, .1f, W_SQUARE, .04f); return; }
	take("ferro", fe); take("carbone", ca); if (ra) take("rame", ra);
	it->v = (u16)roundf(it->v * 1.07f); it->p = (u32)roundf(it->p * 1.1f);
	int s = tmpSlot(it, true); X.tmp[s].tp = (u8)n; gainM('f', 10); recalc();
	msg("%s temprato (%d/3): +7%%", it->n, n); tone(260, .08f, W_SQUARE, .06f); saveGame();
}
static void smelt(int i) {
	if (i < 0 || i >= P.ninv) return; Item it = P.inv[i];
	if (it.r >= 4) { msg("Questo oggetto è vincolato: non si può fondere"); return; }
	memmove(&P.inv[i], &P.inv[i + 1], sizeof(Item) * (P.ninv - i - 1)); P.ninv--;
	int r = it.r; resAdd("ferro", 1 + r); resAdd("carbone", 1); if (r >= 2) resAdd("rame", 1); if (r >= 3) resAdd("gemma", 1);
	gainM('f', 4); msg("Fuso: %s → %d ferro, 1 carbone%s%s", it.n, 1 + r, r >= 2 ? ", 1 rame" : "", r >= 3 ? ", 1 gemma" : ""); tone(180, .15f, W_SAW, .04f); saveGame();
}
static int MDL_MEST = -1;
void mestZoneLoad(void) {
	if (MDL_MEST < 0) MDL_MEST = (int)jgn(jget(jget(dataRoot(), "XM"), "props"), "mest47", -1);
	// la Bottega arriva dall'esportazione, dove la mette il browser (piazza di Aldoria, Cucine del castello)
}
/* ---------------- la finestra ---------------- */
static int MTAB = 0;   // 0 Fornello, 1 Alambicco, 2 Incudine, 3 Dispensa, 4 Mercato
static char MB[600];
int xBuild5(int page) {
	if (page != XP_MEST) return torBuild(page);
	static const char *TAB[5] = {"Fornello (cucina)", "Alambicco (alchimia)", "Incudine (fabbro)", "Dispensa", "Mercato del banco"};
	static const char ML[3] = {'c', 'a', 'f'};
	char ti[64]; snprintf(ti, sizeof ti, "Bottega dei mestieri · %d oro", P.g);
	const Rec *a = active(0), *b = active(1); double now = xNowUTC();
	int o = snprintf(MB, sizeof MB, "Cucina %d · Alchimia %d · Fabbro %d", mLv('c'), mLv('a'), mLv('f'));
	if (a) o += snprintf(MB + o, sizeof MB - o, "\nPasto: %s · %d:%02d", a->n, (int)(X.mealU - now) / 60, (int)(X.mealU - now) % 60);
	if (b) o += snprintf(MB + o, sizeof MB - o, "\nElisir: %s · %d:%02d", b->n, (int)(X.eliU - now) / 60, (int)(X.eliU - now) % 60);
	if (MTAB < 3 && (SELA[0] || SELB[0])) o += snprintf(MB + o, sizeof MB - o, "\nIngredienti scelti: %s %s", SELA[0] ? resName(SELA) : "-", SELB[0] ? resName(SELB) : "-");
	uiXTitle(ti, MB);
	for (int t = 0; t < 5; t++) { char l[40]; snprintf(l, sizeof l, "%s%s", t == MTAB ? "> " : "", TAB[t]); uiXOpt(l, "", XARG(130, t), t == MTAB ? C_GOLD : C_TXT, false); }
	char l[96], r[48];
	if (MTAB < 3) {
		char m = ML[MTAB];
		for (int i = 0; i < NREC; i++) { if (RC47[i].m != m) continue; bool k = known(i);
			if (!k) { snprintf(l, sizeof l, RC47[i].sec ? "??? (ricetta segreta)" : "??? (si impara al livello %d)", RC47[i].lv); uiXOpt(l, "", 0, C_MU, false); continue; }
			snprintf(l, sizeof l, "%s: %s", RC47[i].n, RC47[i].d); snprintf(r, sizeof r, "%d %s + %d %s", RC47[i].na, resName(RC47[i].a), RC47[i].nb, resName(RC47[i].b));
			uiXOpt(l, r, XARG(131, i), C_TXT, resGet(RC47[i].a) < RC47[i].na || resGet(RC47[i].b) < RC47[i].nb); }
		uiXOpt("Sperimenta con due ingredienti:", "", 0, C_MU, false);
		for (int i = 0; i < 16; i++) if (P.res[i].k[0] && P.res[i].n > 0) { snprintf(l, sizeof l, "  %s x%d", resName(P.res[i].k), P.res[i].n); uiXOpt(l, !strcmp(SELA, P.res[i].k) || !strcmp(SELB, P.res[i].k) ? "scelto" : "", XARG(132, i), C_TXT, false); }
		for (int i = 0; i < 24; i++) if (X.xres[i].k[0] && X.xres[i].n > 0) { snprintf(l, sizeof l, "  %s x%d", resName(X.xres[i].k), X.xres[i].n); uiXOpt(l, !strcmp(SELA, X.xres[i].k) || !strcmp(SELB, X.xres[i].k) ? "scelto" : "", XARG(133, i), C_TXT, false); }
		uiXOpt("Prova a mescolarli", "", XARG(134, MTAB), C_GOLD, !SELA[0] || !SELB[0]);
		if (m == 'f') {
			for (int s = 0; s < 4; s++) { Item *it = &P.eq[s]; if (!it->used) continue; int n = tpOf(it); snprintf(l, sizeof l, "Tempra %s (%d/3)", it->n, n); uiXOpt(l, n >= 3 ? "al massimo" : "+7%", XARG(135, s), C_TXT, n >= 3); }
			for (int i = 0; i < P.ninv; i++) { snprintf(l, sizeof l, "Fondi %s", P.inv[i].n); uiXOpt(l, "", XARG(136, i), C_MU, P.inv[i].r >= 4); }
		}
	} else if (MTAB == 3) {
		bool any = false;
		for (int i = 0; i < NREC; i++) if (X.cib[i]) { any = true; snprintf(l, sizeof l, "%s x%d: %s", RC47[i].n, X.cib[i], RC47[i].d); uiXOpt(l, RC47[i].m == 'c' ? "mangia" : "bevi", XARG(137, i), C_TXT, false); }
		if (!any) uiXOpt("La dispensa è vuota: cucina al Fornello o distilla all'Alambicco", "", 0, C_MU, false);
	} else {
		for (int i = 0; i < 8; i++) { int c = px("mst", MSTMP[i]); snprintf(l, sizeof l, "%s (ne hai %d)", resName(MSTM[i]), resGet(MSTM[i])); snprintf(r, sizeof r, "x1 %d · x5 %d oro", c, c * 5); uiXOpt(l, r, XARG(138, i), C_TXT, P.g < c); }
		uiXOpt("Compra 5 di quello scelto con A tenendo premuto Y", "", 0, C_MU, false);
	}
	uiXOpt("Chiudi", "", XARG(1, 0), 0, false);
	return 1;
}
static void pick(const char *k) { if (!strcmp(SELA, k)) { SELA[0] = 0; return; } if (!strcmp(SELB, k)) { SELB[0] = 0; return; } if (!SELA[0]) snprintf(SELA, sizeof SELA, "%s", k); else snprintf(SELB, sizeof SELB, "%s", k); }
int xPanelAct5(int a, int i) {
	static const char ML[3] = {'c', 'a', 'f'};
	switch (a) {
	case 130: MTAB = i; SELA[0] = SELB[0] = 0; return 0;
	case 131: make(i); return 0;
	case 132: if (i < 16) pick(P.res[i].k); return 0;
	case 133: if (i < 24) pick(X.xres[i].k); return 0;
	case 134: tryMix(ML[clampi(i, 0, 2)]); return 0;
	case 135: temper(i); return 0;
	case 136: smelt(i); return 0;
	case 137: eat(i); return PM == PM_NONE ? 1 : 0;
	case 138: { int c = px("mst", MSTMP[i]); extern bool uiHeldY(void); int n = uiHeldY() ? 5 : 1; if (P.g < c * n) { msg("Servono %d monete", c * n); return 0; } P.g -= c * n; resAdd(MSTM[i], n); tone(700, .06f, W_TRIANGLE, .05f); saveGame(); return 0; }
	}
	{ int r = torAct(a, i); return r < 0 ? 0 : r; }
}
