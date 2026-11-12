// Voxelia PS4 (motore dei port 3DS e Vita) - il duello delle carte (7.47/7.49, src/8zzzo_carte.js), al Tavolo della Taverna del Drago Ubriaco.
// Ogni carta è un personaggio di Aldoria con un elemento e un valore: fuoco batte natura, natura batte acqua, acqua
// batte fuoco (+3 a chi ha l'elemento giusto). Il Re (10), il giullare (vince solo contro il 9 e il 10) e il Saggio
// (ha sempre l'elemento giusto). Cinque mani con cinque carte della tua collezione: vince chi ne prende di più.
#include "voxelia.h"

#define C_TXT C2D_Color32(232, 236, 244, 255)
#define C_MU C2D_Color32(154, 164, 184, 255)
#define C_GOLD C2D_Color32(245, 185, 66, 255)
// stesso ordine del browser: 18 di fuoco, 18 d'acqua, 18 di natura, poi re, attore (giullare), saggio (arcobaleno)
static const char *CID[57] = {"recluta", "sguattero", "fornaio", "stefano", "mv_pane", "gemma", "cuoca", "guardia_porta", "gilda", "ryan", "gladiatore", "gladiatrice", "marcus", "ruggero", "maestro_armi", "kael", "borin", "generale",
	"pippo", "ubriaco", "rocco", "retaio", "nella", "ida", "nino", "gino", "ernesto", "cantastorie", "nostromo", "doganiere", "armatore", "anselmo", "baldo", "ferro", "lia", "ammiraglio",
	"tommaso", "lucia", "bruno_b", "lia_r", "marta", "elio", "mv_fiori", "mv_frutta", "giacomo", "rosa_f", "pietro", "ettore", "astronomo", "gerald", "mira", "giardiniere", "cacciatore", "ada",
	"re", "attore", "saggio"};
static int cV(int i) { return i < 54 ? (i % 18) / 2 + 1 : i == 54 ? 10 : i == 55 ? 1 : 6; }
static int cE(int i) { return i < 18 ? 0 : i < 36 ? 1 : i < 54 ? 2 : -1; }   // 0 fuoco, 1 acqua, 2 natura
static const char *EN[3] = {"Fuoco", "Acqua", "Natura"};
static const char *cName(int i) { extern int npcIdx(const char *); int n = npcIdx(CID[i]); return n >= 0 ? NPCS[n].n : CID[i]; }
static int cPow(int a, int b) {
	if (a == 55) return cV(b) >= 9 ? 99 : 0;
	if (b == 55 && cV(a) >= 9) return 0;
	int v = cV(a), ea = cE(a), eb = cE(b);
	bool adv = a == 56 || (ea >= 0 && eb >= 0 && ((ea == 0 && eb == 2) || (ea == 2 && eb == 1) || (ea == 1 && eb == 0)));
	if (adv && b != 56) v += 3; return v;
}
static int cWin(int a, int b) { int x = cPow(a, b), y = cPow(b, a); return x > y ? 1 : x < y ? -1 : 0; }
typedef struct { const char *n, *d, *l0, *l1; u8 lv, min; } Foe;
static const Foe CRTA[4] = {{"Bardo Lino", "Gioca a caso, e canta mentre perde", "Una mano a carte? Se perdo ti dedico una ballata.", "Hai vinto tu, ma la mia canzone sarà più bella!", 1, 0},
	{"Oste Gilda", "Gioca sempre le carte più alte", "Al mio tavolo si paga da bere e si gioca sul serio.", "Brava gente: chi vince offre il giro!", 2, 0},
	{"Il Moreau", "Conosce gli elementi", "Le carte, come le persone, hanno sempre un punto debole.", "Interessante. Molto interessante.", 3, 15},
	{"Conte Lucrezio", "Non sbaglia quasi mai", "Il Conte non perde. Il Conte, al massimo, concede.", "Una rivincita. Subito. Pretendo una rivincita.", 4, 28}};
static const int BETS[4] = {0, 50, 200, 1000};
static struct { bool on, end; int a, lv, bet, ph[5], nph, fh[5], nfh, sc[2], last[3]; char res[160], why[96]; const char *say; } G;
static int betI;
static void fix(void) {
	if (X.crtSt) return; X.crtSt = 1;
	for (int i = 0; i < 10; i++) { int e = i % 3, k = fri(0, 9); X.crt[e * 18 + k] = (u8)clampi(X.crt[e * 18 + k] + 1, 0, 99); }   // valori 1-5
}
static int count(void) { int n = 0; for (int i = 0; i < 57; i++) n += X.crt[i]; return n; }
static int kinds(void) { int n = 0; for (int i = 0; i < 57; i++) if (X.crt[i]) n++; return n; }
static void drawHand(int *out) { int L[600], n = 0; for (int i = 0; i < 57; i++) for (int k = 0; k < X.crt[i] && n < 600; k++) L[n++] = i; for (int i = n - 1; i > 0; i--) { int j = fri(0, i); int t = L[i]; L[i] = L[j]; L[j] = t; } for (int i = 0; i < 5; i++) out[i] = L[i % (n ? n : 1)]; }
static void foeHand(int lv, int *out) {
	for (int i = 0; i < 5; i++) {
		if (lv >= 3 && frnd() < .08f * lv) { out[i] = 54 + fri(0, 2); continue; }
		int e = fri(0, 2), lo = (int[]){1, 2, 3, 4}[lv - 1], hi = (int[]){5, 7, 8, 9}[lv - 1];
		int L[18], n = 0; for (int k = 0; k < 18; k++) { int v = k / 2 + 1; if (v >= lo && v <= hi) L[n++] = e * 18 + k; } out[i] = L[fri(0, n - 1)];
	}
}
static int ai(void) {
	if (G.lv <= 1) return fri(0, G.nfh - 1);
	if (G.lv == 2) { int b = 0; for (int i = 1; i < G.nfh; i++) if (cV(G.fh[i]) > cV(G.fh[b])) b = i; return b; }
	int best = 0; float bs = -1e9f;
	for (int i = 0; i < G.nfh; i++) { float s = 0; for (int k = 0; k < G.nph; k++) s += cWin(G.fh[i], G.ph[k]); s = s / (G.nph ? G.nph : 1) - cV(G.fh[i]) * .02f * (G.lv == 4 ? 0 : 1) + (G.lv == 3 ? frnd() * .6f : frnd() * .15f); if (s > bs) { bs = s; best = i; } }
	return best;
}
static void start(int i) {
	fix(); const Foe *A = &CRTA[i];
	if (count() < 5) { msg("Ti servono almeno cinque carte"); return; }
	if (kinds() < A->min) { msg("%s gioca solo con chi ha almeno %d carte diverse", A->n, A->min); return; }
	int bet = BETS[betI]; if (P.g < bet) { msg("Non hai abbastanza oro per questa posta"); return; } P.g -= bet;
	memset(&G, 0, sizeof G); G.on = true; G.a = i; G.lv = A->lv; G.bet = bet; drawHand(G.ph); G.nph = 5; foeHand(A->lv, G.fh); G.nfh = 5; G.say = A->l0; G.last[0] = -1;
	tone(500, .06f, W_TRIANGLE, .05f);
}
static void endGame(void) {
	const Foe *A = &CRTA[G.a]; int x = G.sc[0], y = G.sc[1]; G.end = true;
	if (x > y) {
		X.crtV++; int pr = G.bet * 2; P.g += pr; G.say = A->l1; bool nw = !X.crtW[G.a]; X.crtW[G.a] = (u8)clampi(X.crtW[G.a] + 1, 0, 255);
		int card = -1; if (nw && G.a >= 1) card = (int[]){56, 55, 54}[G.a - 1];   // il primo successo contro Gilda, il Moreau e il Conte: Saggio, giullare, Re
		else if (frnd() < .45f) { int hi = (int[]){5, 7, 8, 9}[A->lv - 1], L[54], n = 0; for (int k = 0; k < 54; k++) { int v = cV(k); if (v <= hi && v >= hi - 3) L[n++] = k; } card = L[fri(0, n - 1)]; }
		char s[64] = ""; if (card >= 0) { X.crt[card] = (u8)clampi(X.crt[card] + 1, 0, 99); snprintf(s, sizeof s, " · nuova carta: %s", cName(card)); }
		snprintf(G.res, sizeof G.res, "Hai vinto %d a %d%s%s", x, y, pr ? "" : "", s); if (pr) { int o = strlen(G.res); snprintf(G.res + o, sizeof G.res - o, " · +%d oro", pr); }
		char t[48]; snprintf(t, sizeof t, "Hai battuto %s!", A->n); banner(t, G.res); JINGLE(.08f, W_TRIANGLE, 60, 64, 67, 72, 76); gainXP(15 * A->lv);
	} else if (x < y) { X.crtN++; snprintf(G.res, sizeof G.res, "Ha vinto %s, %d a %d%s", A->n, y, x, G.bet ? " · perdi la posta" : ""); G.say = "Ritenta, eroe. Le carte girano."; tone(150, .2f, W_SAW, .04f); }
	else { P.g += G.bet; snprintf(G.res, sizeof G.res, "Pareggio %d a %d%s", x, y, G.bet ? " · riprendi la posta" : ""); G.say = "Pari e patta. Un'altra?"; }
	saveGame();
}
static void play(int k) {
	if (!G.on || G.end || k >= G.nph) return;
	int a = G.ph[k]; memmove(&G.ph[k], &G.ph[k + 1], sizeof(int) * (G.nph - k - 1)); G.nph--;
	int j = ai(), b = G.fh[j]; memmove(&G.fh[j], &G.fh[j + 1], sizeof(int) * (G.nfh - j - 1)); G.nfh--;
	int w = cWin(a, b); G.last[0] = a; G.last[1] = b; G.last[2] = w;
	if (w > 0) G.sc[0]++; else if (w < 0) G.sc[1]++;
	tone(w > 0 ? 720 : w < 0 ? 220 : 440, .08f, w > 0 ? W_TRIANGLE : W_SQUARE, .05f);
	int pa = cPow(a, b), pb = cPow(b, a); if (a == 55 || b == 55) { pa = cV(a); pb = cV(b); }
	if (!w) snprintf(G.why, sizeof G.why, "Pari: %d contro %d", pa, pb);
	else snprintf(G.why, sizeof G.why, "%s vince: %d contro %d%s", cName(w > 0 ? a : b), w > 0 ? pa : pb, w > 0 ? pb : pa, (w > 0 ? a : b) == 55 ? " (il giullare beffa i grandi)" : (w > 0 ? cPow(a, b) > cV(a) : cPow(b, a) > cV(b)) ? " (elemento giusto, +3)" : "");
	if (!G.nph) endGame();
}
static void buyPack(void) {
	if (P.g < 150) { msg("Una busta costa 150 monete"); return; } P.g -= 150; fix();
	char s[120]; int o = snprintf(s, sizeof s, "Nella busta:");
	for (int i = 0; i < 3; i++) { float r = frnd(); int id; if (r < .04f) id = 54 + fri(0, 2); else { int e = fri(0, 2), mx = r < .3f ? 9 : 6, L[18], n = 0; for (int k = 0; k < 18; k++) if (k / 2 + 1 <= mx) L[n++] = e * 18 + k; id = L[fri(0, n - 1)]; }
		X.crt[id] = (u8)clampi(X.crt[id] + 1, 0, 99); o += snprintf(s + o, sizeof s - o, "%s %s", i ? "," : "", cName(id)); }
	msg("%s", s); tone(800, .06f, W_TRIANGLE, .05f); saveGame();
}
static void cardLabel(int i, char *out, int n) { if (i >= 54) snprintf(out, n, "%s (%s)", cName(i), i == 54 ? "Re, 10" : i == 55 ? "giullare" : "arcobaleno, 6"); else snprintf(out, n, "%s · %s %d", cName(i), EN[cE(i)], cV(i)); }
static char CB[600];
int crtBuild(int page) {
	if (page != XP_CARTE) return 0;
	fix();
	if (G.on) {
		const Foe *A = &CRTA[G.a]; char ti[64]; snprintf(ti, sizeof ti, "Carte · tu %d - %d %s", G.sc[0], G.sc[1], A->n);
		int o = snprintf(CB, sizeof CB, "«%s»", G.say ? G.say : "");
		if (G.last[0] >= 0) { char a[48], b[48]; cardLabel(G.last[0], a, sizeof a); cardLabel(G.last[1], b, sizeof b); o += snprintf(CB + o, sizeof CB - o, "\nTu: %s · %s: %s\n%s", a, A->n, b, G.why); }
		if (G.end) snprintf(CB + o, sizeof CB - o, "\n%s", G.res);
		uiXTitle(ti, CB);
		if (!G.end) for (int k = 0; k < G.nph; k++) { char l[64]; cardLabel(G.ph[k], l, sizeof l); uiXOpt(l, "gioca", XARG(160, k), C_GOLD, false); }
		else { uiXOpt("Un'altra partita", "", XARG(161, G.a), C_GOLD, false); uiXOpt("Torna al tavolo", "", XARG(162, 0), C_TXT, false); }
	} else {
		snprintf(CB, sizeof CB, "Fuoco batte natura, natura batte acqua, acqua batte fuoco (+3 a chi ha l'elemento giusto). Il Re vale 10, il giullare vince solo contro il 9 e il 10, il Saggio ha sempre l'elemento giusto. Cinque mani: vince chi ne prende di più.\nCarte: %d (%d diverse) · vittorie %d · sconfitte %d", count(), kinds(), X.crtV, X.crtN);
		uiXTitle("Tavolo delle carte", CB);
		char r[24]; snprintf(r, sizeof r, "%d oro", BETS[betI]); uiXOpt("Posta", r, XARG(163, 0), C_TXT, false);
		for (int i = 0; i < 4; i++) { char l[80], rr[32]; snprintf(l, sizeof l, "Sfida %s: %s", CRTA[i].n, CRTA[i].d); if (kinds() < CRTA[i].min) snprintf(rr, sizeof rr, "%d carte diverse", CRTA[i].min); else snprintf(rr, sizeof rr, X.crtW[i] ? "vinto %d volte" : "", X.crtW[i]); uiXOpt(l, rr, XARG(161, i), C_GOLD, kinds() < CRTA[i].min || P.g < BETS[betI]); }
		uiXOpt("Compra una busta da tre carte", "150 oro", XARG(164, 0), C_TXT, P.g < 150);
		uiXOpt("La tua collezione:", "", 0, C_MU, false);
		for (int i = 0; i < 57; i++) if (X.crt[i]) { char l[64], rr[8]; cardLabel(i, l, sizeof l); snprintf(rr, sizeof rr, "x%d", X.crt[i]); uiXOpt(l, rr, 0, C_TXT, false); }
	}
	uiXOpt("Chiudi", "", XARG(1, 0), 0, false);
	return 1;
}
int crtAct(int a, int i) {
	switch (a) {
	case 160: play(i); return 0;
	case 161: start(i); return 0;
	case 162: G.on = false; return 0;
	case 163: betI = (betI + 1) % 4; return 0;
	case 164: buyPack(); return 0;
	}
	return -1;
}
