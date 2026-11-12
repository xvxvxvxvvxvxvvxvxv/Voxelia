// Voxelia 3DS 1.5 - il Serraglio di Aldoria (7.55, src/8zzzzd_serraglio.js): la Domatrice Selene potenzia e
// modifica i compagni, cambia loro forma, li tiene in pensione e vende le uova chimera.
// Sulla console la chimera ha il corpo di una specie (i modelli sono quelli esportati): la testa dell'altra resta nel nome.
#include "voxelia.h"

#define C_TXT C2D_Color32(232, 236, 244, 255)
#define C_MU C2D_Color32(154, 164, 184, 255)
#define C_GOLD C2D_Color32(245, 185, 66, 255)
#define C_GREEN C2D_Color32(122, 255, 138, 255)
static const char *UPN[3] = {"Forza", "Vita", "Rapidità"}; static const int UPMX[3] = {10, 10, 5};
static const float SZV[6] = {.8f, .9f, 1, 1.12f, 1.25f, 1.35f}; static const char *SZN[6] = {"Piccolo", "Minuto", "Normale", "Robusto", "Grande", "Enorme"};
#define SRMAX 30
#define EGGC 1200
#define EGGT 90.0
static int SSEL = 0, STAB = 0;   // compagno scelto e scheda: 0 potenzia, 1 modifica, 2 forma, 3 pensione, 4 uova
extern int elOfEnemy(int t);
static int petEl(XPet *p) { if (p->el) return p->el; int t = enemyIdx(p->t); return t >= 0 ? (E[t].el ? E[t].el : E[t].elh) : 1; }
static int petElLv(XPet *p) { return clampi(p->elv ? p->elv : 1, 1, 5); }
static void upCost(XPet *p, int k, int *g, int *e) { int n = p->up[k]; *g = (int)roundf((150 + n * 120) * (1 + p->lv / 30.f)); *e = 1 + n; }
static bool bst(const char *id) { u32 h = hs(id); for (int i = 0; i < X.nbst; i++) if (X.bst[i] == h) return true; return false; }
extern void domRefresh(void);
// la pensione: guariscono e si allenano da soli, piano piano (mai oltre il tuo livello + 2)
void serrTick(float dt) {
	X.depT += dt;
	if (X.depT >= 60) { X.depT = 0; for (int i = 0; i < X.ndep; i++) { XPet *p = &X.dep[i]; p->ko = 0; p->xp += 6; if (p->xp >= 40 + p->lv * p->lv * 14 && p->lv < (P.lv + 2 < 40 ? P.lv + 2 : 40)) { p->xp = 0; p->lv++; } } }
	if (X.eggA[0] && xNowUTC() >= X.eggT && X.npet < 12 && started) {
		XPet *p = &X.pets[X.npet]; memset(p, 0, sizeof *p);
		int a = enemyIdx(X.eggA), b = enemyIdx(X.eggB);
		snprintf(p->t, sizeof p->t, "%s", X.eggA);
		const char *na = a >= 0 ? E[a].n : "Chimera", *nb = b >= 0 ? E[b].n : "";
		int la = (int)strlen(na), lb = (int)strlen(nb); char nm[24]; snprintf(nm, sizeof nm, "%.*s%s", la / 2 + 1, na, lb > 2 ? nb + lb / 2 : "");
		snprintf(p->n, sizeof p->n, "%s", nm); p->lv = P.lv > 2 ? P.lv - 2 : 1; p->el = X.eggEl ? X.eggEl : 1; p->elv = 1; p->hp = 1e6f;
		X.npet++; X.eggA[0] = 0;
		char t[64]; snprintf(t, sizeof t, "L'uovo si è schiuso: %s!", p->n); banner(t, "È nella tua stalla · Compagni"); JINGLE(.09f, W_TRIANGLE, 60, 64, 67, 72, 76, 79);
		saveGame();
	}
}
static char SB[700];
int xBuild4(int page) {
	if (page != XP_SERR) return xBuild5(page);
	static const char *TAB[5] = {"Potenzia", "Modifica", "Muta forma", "Pensione", "Uova chimera"};
	if (SSEL >= X.npet) SSEL = X.npet - 1; if (SSEL < 0) SSEL = 0;
	XPet *p = X.npet ? &X.pets[SSEL] : NULL;
	char ti[80]; snprintf(ti, sizeof ti, "Il Serraglio · %d oro", P.g);
	int k = p ? petEl(p) : 0;
	if (p) { char nm[40]; extern void domName(const XPet *, char *, int); domName(p, nm, sizeof nm); snprintf(SB, sizeof SB, "Compagno: %s (Lv %d) · elemento %s %d · Essenze di %s: %d", nm, p->lv, elName(k), petElLv(p), elName(k), X.ess[k]); }
	else snprintf(SB, sizeof SB, "Nella stalla non hai compagni. Domane uno, fai nascere un Uovo chimera o ritirane uno dalla pensione.");
	uiXTitle(ti, SB);
	for (int t = 0; t < 5; t++) { char l[32]; snprintf(l, sizeof l, "%s%s", t == STAB ? "> " : "", TAB[t]); uiXOpt(l, "", XARG(110, t), t == STAB ? C_GOLD : C_TXT, false); }
	if (p && X.npet > 1 && STAB < 3) uiXOpt("Cambia compagno", "", XARG(111, 0), C_MU, false);
	char l[96], r[40];
	switch (STAB) {
	case 0: if (!p) break;
		for (int q = 0; q < 3; q++) { int g, e; upCost(p, q, &g, &e); snprintf(l, sizeof l, "%s %d/%d (%s%d%%)", UPN[q], p->up[q], UPMX[q], q == 2 ? "-" : "+", (int)roundf((q == 2 ? 5 : 7) * p->up[q]));
			if (p->up[q] >= UPMX[q]) snprintf(r, sizeof r, "massimo"); else snprintf(r, sizeof r, "%d oro · %d ess.", g, e);
			uiXOpt(l, r, XARG(112, q), C_TXT, p->up[q] >= UPMX[q] || P.g < g || X.ess[k] < e); }
		break;
	case 1: if (!p) break;
		uiXOpt("Rinomina", "", XARG(113, 0), C_TXT, false);
		if (petElLv(p) < 5) { int lv = petElLv(p); snprintf(l, sizeof l, "%s: livello %d", elName(k), lv + 1); snprintf(r, sizeof r, "%d oro · %d ess.", 200 * lv + 100, 3 * lv); uiXOpt(l, r, XARG(114, 0), C_TXT, P.g < 200 * lv + 100 || X.ess[k] < 3 * lv); }
		for (int q = 1; q < 10; q++) { if (q == k) continue; snprintf(l, sizeof l, "Elemento: %s (ne hai %d)", elName(q), X.ess[q]); uiXOpt(l, "300 oro · 6 ess.", XARG(115, q), C_TXT, P.g < 300 || X.ess[q] < 6); }
		for (int q = 0; q < 6; q++) { float sz = p->sz > .5f ? p->sz : 1; bool cur = fabsf(sz - SZV[q]) < .01f; snprintf(l, sizeof l, "Taglia: %s", SZN[q]); uiXOpt(l, cur ? "attuale" : "150 oro", XARG(116, q), cur ? C_GREEN : C_TXT, cur || P.g < 150); }
		break;
	case 2: if (!p) break;
		uiXOpt("Torna alla forma di prima (gratis)", "", XARG(117, 255), C_TXT, !p->sh[0]);
		{ int n = 0; for (int i = 0; i < NE && n < 30; i++) { if (E[i].boss || !bst(E[i].id) || !strcmp(E[i].id, p->t)) continue; snprintf(l, sizeof l, "Forma di %s", E[i].n); uiXOpt(l, "400 oro", XARG(117, i), !strcmp(p->sh, E[i].id) ? C_GREEN : C_TXT, P.g < 400); n++; }
		  if (!n) uiXOpt("Le forme sono quelle delle specie del tuo bestiario: domane altre", "", 0, C_MU, false); }
		break;
	case 3:
		snprintf(l, sizeof l, "In pensione: %d/%d · crescono piano, mai oltre il livello %d", X.ndep, SRMAX, P.lv + 2 < 40 ? P.lv + 2 : 40); uiXOpt(l, "", 0, C_MU, false);
		for (int i = 0; i < X.ndep; i++) { snprintf(l, sizeof l, "Ritira %s (Lv %d)", X.dep[i].n, X.dep[i].lv); uiXOpt(l, "", XARG(118, i), C_TXT, X.npet >= 12); }
		for (int i = 0; i < X.npet; i++) { snprintf(l, sizeof l, "Lascia in pensione %s (Lv %d)%s", X.pets[i].n, X.pets[i].lv, i == X.pet ? " · è con te" : ""); uiXOpt(l, "", XARG(119, i), C_TXT, X.ndep >= SRMAX); }
		break;
	case 4:
		if (X.eggA[0]) { double s = X.eggT - xNowUTC(); snprintf(l, sizeof l, "L'uovo si schiude fra %d secondi%s", s > 0 ? (int)s : 0, X.npet >= 12 ? " (libera un posto nella stalla)" : ""); uiXOpt(l, "", 0, C_MU, false); }
		else { uiXOpt("Compra un Uovo chimera: nasce un compagno che non esiste in natura", "1200 oro", XARG(120, 0), C_GOLD, P.g < EGGC); }
		break;
	}
	uiXOpt("Chiudi", "", XARG(1, 0), 0, false);
	return 1;
}
int xPanelAct4(int a, int i) {
	XPet *p = X.npet && SSEL < X.npet ? &X.pets[SSEL] : NULL;
	int k = p ? petEl(p) : 0;
	switch (a) {
	case 110: STAB = i; return 0;
	case 111: if (X.npet) SSEL = (SSEL + 1) % X.npet; return 0;
	case 112: { if (!p || p->up[i] >= UPMX[i]) return 0; int g, e; upCost(p, i, &g, &e); if (P.g < g || X.ess[k] < e) return 0; P.g -= g; X.ess[k] -= e; p->up[i]++; JINGLE(.06f, W_TRIANGLE, 67, 71, 74, 79); msg("%s: %s %d/%d", p->n, UPN[i], p->up[i], UPMX[i]); domRefresh(); saveGame(); return 0; }
	case 113: { extern void xRename(int k); xRename(100 + SSEL); return 0; }
	case 114: { if (!p) return 0; int lv = petElLv(p); if (lv >= 5 || P.g < 200 * lv + 100 || X.ess[k] < 3 * lv) return 0; P.g -= 200 * lv + 100; X.ess[k] -= 3 * lv; p->el = (u8)k; p->elv = (u8)(lv + 1); msg("%s: %s %d", p->n, elName(k), lv + 1); domRefresh(); saveGame(); return 0; }
	case 115: { if (!p || P.g < 300 || X.ess[i] < 6) return 0; P.g -= 300; X.ess[i] -= 6; p->el = (u8)i; p->elv = 1; msg("%s ora è di %s", p->n, elName(i)); sparks(P.px, P.py, 20, elCol(i), 90); domRefresh(); saveGame(); return 0; }
	case 116: { if (!p || P.g < 150) return 0; P.g -= 150; p->sz = SZV[i]; domRefresh(); saveGame(); return 0; }
	case 117: { if (!p) return 0; if (i == 255) { p->sh[0] = 0; domRefresh(); saveGame(); return 0; } if (P.g < 400 || i >= NE) return 0; P.g -= 400; snprintf(p->sh, sizeof p->sh, "%s", E[i].id); msg("%s prende la forma di %s", p->n, E[i].n); domRefresh(); saveGame(); return 0; }
	case 118: { if (i >= X.ndep || X.npet >= 12) return 0; X.pets[X.npet++] = X.dep[i]; memmove(&X.dep[i], &X.dep[i + 1], sizeof(XPet) * (X.ndep - i - 1)); X.ndep--; saveGame(); return 0; }
	case 119: { if (i >= X.npet || X.ndep >= SRMAX) return 0; extern void xPetRemove(int i, XPet *out); XPet q; xPetRemove(i, &q); X.dep[X.ndep++] = q; if (SSEL >= X.npet) SSEL = 0; saveGame(); return 0; }
	case 120: {
		if (X.eggA[0] || P.g < EGGC) return 0;
		int L[100], n = 0; for (int q = 0; q < NE && n < 100; q++) if (!E[q].boss && !E[q].np && E[q].mdl >= 0 && !strchr(E[q].id, '.')) L[n++] = q;
		if (n < 2) return 0;
		int x = L[fri(0, n - 1)], y = x; while (y == x) y = L[fri(0, n - 1)];
		P.g -= EGGC; snprintf(X.eggA, sizeof X.eggA, "%s", E[x].id); snprintf(X.eggB, sizeof X.eggB, "%s", E[y].id); X.eggEl = (u8)fri(1, 9); X.eggT = xNowUTC() + EGGT;
		banner("Un uovo misterioso", "Si schiude fra un minuto e mezzo, nel nido del Serraglio"); JINGLE(.1f, W_TRIANGLE, 64, 67, 71); saveGame(); return 0; }
	}
	return xPanelAct5(a, i);
}
