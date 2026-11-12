// Voxelia PS4 - il pannello sviluppatore della 8.5 ("Il pannello sviluppatore prova tutto"), nella versione
// che ha senso sulla console: trucchi di combattimento, equipaggiamento leggendario, tempo (velocità, pausa, ora,
// giorni), qualunque zona del gioco, tutte le 130 missioni da accettare, completare o azzerare, tutti i brani da
// ascoltare, la griglia delle collisioni sopra il mondo, il riquadro di debug e la prova della zona (passaggi,
// personaggi e nemici raggiungibili). Si apre dal menu di pausa.
#include "voxelia.h"
#define C_GOLD_DEV C2D_Color32(245, 185, 66, 255)

DevState DEV = {.speed = 1};
static int DPAGE = 0, DSCR = 0;
static char DRES[600];
static const float SPEEDS[6] = {.25f, .5f, 1, 2, 4, 8};

enum { D_GOD = 1, D_ONE, D_STA, D_NOCD, D_GHOST, D_LEG, D_HEAL, D_GOLD, D_LVL, D_SPEED, D_PAUSE, D_HOUR, D_DAY, D_GRID, D_INFO,
	D_PZONES, D_PQUEST, D_PMUS, D_TEST, D_BACK, D_ZONE, D_QUEST, D_QALL, D_QRESET, D_MUS, D_MUSZ, D_TOP };
#define DARG(k, i) ((k) * 1000 + (i))

static void on(const char *l, bool v, int k) { uiDevOpt(l, v ? "sì" : "no", DARG(k, 0), v ? C2D_Color32(125, 255, 176, 255) : 0, false); }
static int speedIdx(void) { for (int i = 0; i < 6; i++) if (fabsf(SPEEDS[i] - DEV.speed) < .01f) return i; return 2; }
static int giverOf(int q) {
	for (int n = 0; n < NNPC; n++) for (int k = 0; k < NPCS[n].nqs; k++) if (NPCS[n].qs[k] && !strcmp(NPCS[n].qs[k], QT[q].id)) return n;
	return -1;
}
static int activeQ(int q) { for (int i = 0; i < P.nq; i++) if (P.q[i].id == q) return i; return -1; }

// "Prova questa zona": dall'eroe, quante caselle si raggiungono e chi resta chiuso fuori
static void zoneTest(void) {
	static s16 D[MAXN * MAXN];
	int sx = clampi((int)P.px, 0, N - 1), sy = clampi((int)P.py, 0, N - 1);
	bfs(sx, sy, D);
	int reach = 0, walk = 0; for (int i = 0; i < N * N; i++) { if (D[i] >= 0) reach++; if (WK(M[i / N][i % N])) walk++; }
	int po = 0, poK = 0, np = 0, npK = 0, en = 0, enK = 0;
	char miss[300] = "";
	for (int i = 0; i < NENT; i++) {
		Ent *e = &ents[i]; if (e->k != K_PO && e->k != K_NPC && e->k != K_EN) continue;
		int x = clampi((int)e->px, 0, N - 1), y = clampi((int)e->py, 0, N - 1);
		bool ok = false;
		for (int dy = -1; dy <= 1 && !ok; dy++) for (int dx = -1; dx <= 1 && !ok; dx++) { int u = x + dx, v = y + dy; if (u >= 0 && v >= 0 && u < N && v < N && D[v * N + u] >= 0) ok = true; }
		if (e->k == K_PO) { po++; poK += ok; } else if (e->k == K_NPC) { np++; npK += ok; } else { en++; enK += ok; }
		if (!ok && strlen(miss) < 240) { char b[48]; snprintf(b, sizeof b, "%s%s", miss[0] ? ", " : "", e->name[0] ? e->name : e->to); strncat(miss, b, sizeof miss - strlen(miss) - 1); }
	}
	snprintf(DRES, sizeof DRES, "%s: %d caselle raggiungibili su %d calpestabili. Passaggi %d/%d, personaggi %d/%d, nemici %d/%d raggiungibili.%s%s",
		ZNAME, reach, walk, poK, po, npK, np, enK, en, miss[0] ? "\nDa guardare: " : "\nTutto a posto.", miss);
}

void devBuild(void) {
	char t[96], r[48];
	if (DPAGE == 0) {
		uiXTitle("Pannello sviluppatore · 8.5", DRES[0] ? DRES : "Trucchi, tempo, zone, missioni e musica, come nel pannello del browser. Le prove valgono anche per il salvataggio: salva solo se vuoi tenerle.");
		on("Invincibile", DEV.god, D_GOD);
		on("Un colpo e via", DEV.oneHit, D_ONE);
		on("Stamina infinita", DEV.sta, D_STA);
		on("Abilità senza attesa", DEV.nocd, D_NOCD);
		on("Nemici che non ti vedono", DEV.ghost, D_GHOST);
		uiDevOpt("Equipaggiamento leggendario completo", "", DARG(D_LEG, 0), C2D_Color32(245, 185, 66, 255), false);
		uiDevOpt("Cura completa e 5 pozioni", "", DARG(D_HEAL, 0), 0, false);
		uiDevOpt("Oro", "+1000", DARG(D_GOLD, 0), 0, false);
		snprintf(r, sizeof r, "%d → %d", P.lv, P.lv + 1); uiDevOpt("Sali di livello", r, DARG(D_LVL, 0), 0, false);
		snprintf(r, sizeof r, "< ×%g >", DEV.speed); uiDevOpt("Velocità del tempo", r, DARG(D_SPEED, 0), 0, false);
		on("Gioco in pausa (il mondo si ferma)", DEV.pause, D_PAUSE);
		char clk[8]; gClock(clk); snprintf(r, sizeof r, "< %s >", clk); uiDevOpt("Ora del giorno", r, DARG(D_HOUR, 0), 0, false);
		snprintf(r, sizeof r, "giorno %d", gDay()); uiDevOpt("Salta al giorno dopo", r, DARG(D_DAY, 0), 0, false);
		on("Debug: griglia delle collisioni", DEV.grid, D_GRID);
		on("Debug: riquadro con zona e conteggi", DEV.info, D_INFO);
		uiDevOpt("Prova questa zona", "", DARG(D_TEST, 0), 0, false);
		uiDevOpt("Vai in una zona…", "", DARG(D_PZONES, 0), C2D_Color32(154, 220, 255, 255), false);
		snprintf(r, sizeof r, "%d", NQT); uiDevOpt("Storia e missioni…", r, DARG(D_PQUEST, 0), C2D_Color32(154, 220, 255, 255), false);
		uiDevOpt("Musica…", "", DARG(D_PMUS, 0), C2D_Color32(154, 220, 255, 255), false);
		uiDevOpt("Indietro", "", DARG(D_TOP, 0), 0, false);
	} else if (DPAGE == 1) {
		uiXTitle("Vai in una zona", "Tutte le zone esportate dalla versione browser, con i piani dei dungeon.");
		uiDevOpt("Indietro", "", DARG(D_BACK, 0), 0, false);
		int n = zoneCount();
		for (int i = 0; i < n; i++) { const char *k = zoneKeyAt(i); if (!k) continue; char kk[48]; snprintf(kk, sizeof kk, "%s", k); char *h = strchr(kk, '#'); if (h) { if (h[1] != '0') continue; *h = 0; }
			snprintf(t, sizeof t, "%s", zoneTitle(kk)); if (strchr(kk, '@')) { snprintf(r, sizeof r, "piano %s", strchr(kk, '@') + 1); } else snprintf(r, sizeof r, "%s", kk);
			uiDevOpt(t, r, DARG(D_ZONE, i), !strcmp(kk, Zk) ? C2D_Color32(245, 185, 66, 255) : 0, false); }
	} else if (DPAGE == 2) {
		snprintf(t, sizeof t, "Storia: fase %d · frammenti %d", P.st, __builtin_popcount(P.sh));
		uiXTitle("Storia e missioni", "Accetta una missione (dal suo personaggio), completala subito o azzerala. Le missioni complete si consegnano a chi le ha date.");
		uiDevOpt(t, "fase +1", DARG(D_QALL, 1), C_GOLD_DEV, false);
		uiDevOpt("Completa tutte le missioni attive", "", DARG(D_QALL, 0), 0, false);
		uiDevOpt("Azzera le missioni fatte", "", DARG(D_QRESET, 0), 0, false);
		uiDevOpt("Indietro", "", DARG(D_BACK, 0), 0, false);
		for (int i = 0; i < NQT; i++) {
			int a = activeQ(i);
			if (a >= 0) snprintf(r, sizeof r, qReady(&P.q[a]) ? "pronta" : "in corso: completa");
			else if (P.qd[i]) snprintf(r, sizeof r, "fatta ×%d", P.qd[i]);
			else snprintf(r, sizeof r, giverOf(i) >= 0 ? "accetta" : "—");
			uiDevOpt(QT[i].ti ? QT[i].ti : QT[i].id, r, DARG(D_QUEST, i), a >= 0 ? C2D_Color32(125, 255, 176, 255) : P.qd[i] ? C_GOLD_DEV : 0, false);
		}
	} else {
		uiXTitle("Musica", "Tutti i brani del gioco, scritti nota per nota o generati come nel browser.");
		uiDevOpt("Torna alla musica della zona", "", DARG(D_MUSZ, 0), 0, false);
		uiDevOpt("Indietro", "", DARG(D_BACK, 0), 0, false);
		for (int i = 0; i < musCount(); i++) uiDevOpt(musName(i), "", DARG(D_MUS, i), 0, false);
	}
}
void devOpen(void) { DPAGE = 0; DSCR = 0; DRES[0] = 0; uiOpenPanel(PM_DEV); }

// 0 = ricostruisci, 1 = chiudi la finestra, 2 = torna al menu di pausa
int devAct(int arg, int dir) {
	int k = arg / 1000, i = arg % 1000;
	if (!dir) dir = 1;
	switch (k) {
	case D_GOD: DEV.god = !DEV.god; break;
	case D_ONE: DEV.oneHit = !DEV.oneHit; break;
	case D_STA: DEV.sta = !DEV.sta; break;
	case D_NOCD: DEV.nocd = !DEV.nocd; break;
	case D_GHOST: DEV.ghost = !DEV.ghost; break;
	case D_LEG:
		for (int s = 0; s < 4; s++) { Item it = mkItem(P.lv + 3, 3, s); it.r = 3; P.eq[s] = it; P.eq[s].used = 1; }
		recalc(); P.hp = P.mx; msg("Equipaggiamento leggendario indossato"); tone(880, .1f, W_TRIANGLE, .05f); break;
	case D_HEAL: P.hp = P.mx; P.pot += 5; break;
	case D_GOLD: P.g += 1000; break;
	case D_LVL: gainXP(needXP() - P.xp); break;
	case D_SPEED: DEV.speed = SPEEDS[clampi(speedIdx() + dir, 0, 5)]; break;
	case D_PAUSE: DEV.pause = !DEV.pause; break;
	case D_HOUR: P.gt = fmodf(P.gt + dir * 60 + 1440 * 100, 1440) + floorf(P.gt / 1440) * 1440; break;
	case D_DAY: P.gt = (floorf(P.gt / 1440) + 1) * 1440 + 8 * 60; break;
	case D_GRID: DEV.grid = !DEV.grid; break;
	case D_INFO: DEV.info = !DEV.info; break;
	case D_TEST: zoneTest(); break;
	case D_PZONES: DPAGE = 1; return 3;
	case D_PQUEST: DPAGE = 2; return 3;
	case D_PMUS: DPAGE = 3; return 3;
	case D_BACK: DPAGE = 0; return 3;
	case D_TOP: return 2;
	case D_ZONE: { const char *z = zoneKeyAt(i); if (!z) break; char kk[48]; snprintf(kk, sizeof kk, "%s", z); char *h = strchr(kk, '#'); if (h) *h = 0;
		DPAGE = 0; goZone(kk); return 1; }
	case D_QUEST: {
		int a = activeQ(i);
		if (a >= 0) { P.q[a].c = QT[i].n ? QT[i].n : 1; npcMarks(); msg("«%s» pronta da consegnare", QT[i].ti); }
		else { int g = giverOf(i); if (g < 0) { msg("Nessun personaggio dà questa missione"); break; } if (P.nq >= MAXQ) { msg("Hai già 5 missioni attive"); break; } qAccept(g, i); npcMarks(); }
		break; }
	case D_QALL:
		if (i == 1) { if (P.st < 5) storyStep(P.st + 1); break; }
		for (int q = 0; q < P.nq; q++) P.q[q].c = QT[P.q[q].id].n ? QT[P.q[q].id].n : 1;
		npcMarks(); break;
	case D_QRESET: memset(P.qd, 0, sizeof P.qd); npcMarks(); break;
	case D_MUS: music(i); break;
	case D_MUSZ: music(zoneMusic(ZMUS)); break;
	}
	return 0;
}

/* ---------------- sopra il mondo ---------------- */
void devDrawWorld(void) {
	if (!DEV.grid) return;
	int x0 = (int)P.px - 12, x1 = (int)P.px + 12, y0 = (int)P.py - 12, y1 = (int)P.py + 12;
	for (int y = y0; y <= y1; y++) for (int x = x0; x <= x1; x++) {
		if (x < 0 || y < 0 || x >= N || y >= N || M[y][x] == 9) continue;
		u32 c = M[y][x] == 2 ? 0x3a7aff : WK(M[y][x]) ? 0x3aff6a : 0xff3a3a;
		rFlat(x + .06f, y + .06f, .6f, .88f, .88f, c, 70);
	}
}
void devDrawOverlay(void) {
	if (DEV.god || DEV.oneHit || DEV.ghost || DEV.pause || DEV.speed != 1) {
		char b[96]; snprintf(b, sizeof b, "SVILUPPO%s%s%s%s", DEV.god ? " · invincibile" : "", DEV.oneHit ? " · un colpo" : "", DEV.ghost ? " · invisibile" : "", DEV.pause ? " · pausa" : "");
		if (DEV.speed != 1) { int l = strlen(b); snprintf(b + l, sizeof b - l, " · ×%g", DEV.speed); }
		txtR(VW - 8, VH - 64, .32f, C2D_Color32(255, 160, 80, 230), b);
	}
	if (!DEV.info || !started) return;
	char b[300]; int ne = 0, nn = 0, np = 0; for (int i = 0; i < NENT; i++) { if (ents[i].k == K_EN) ne++; else if (ents[i].k == K_NPC) nn++; else if (ents[i].k == K_PO) np++; }
	extern int rQuads(void);
	snprintf(b, sizeof b, "%s (%s)\nposizione %.2f, %.2f · casella %d,%d (%d)\nentità %d: nemici %d, personaggi %d, passaggi %d\nluci %d · quadrilateri %d · %.0f fps\nlivello zona %d · ciclo %d",
		ZNAME, Zk, P.px, P.py, (int)P.px, (int)P.py, M[clampi((int)P.py, 0, N - 1)][clampi((int)P.px, 0, N - 1)], NENT, ne, nn, np, NSLIGHT, rQuads(), FPS, ZLV, ZRUN);
	float h = txtWrap(-2000, -2000, 240, .32f, 0, b);
	float x = 70, y = VH - 60 - h;
	rectR(x - 4, y - 3, 248, h + 6, 4, C2D_Color32(0, 0, 0, 180));
	txtWrap(x, y, 240, .32f, C2D_Color32(255, 255, 160, 255), b);
}
