// Voxelia PS4 - Il Regno Perduto
// Ciclo principale: comandi, telecamera, titolo e passaggio tra le schermate.
//
// Comandi (come le scorciatoie del browser, sul DualShock 4):
//   levetta sinistra / croce direzionale  muovi        Croce  colpo (catena dell'arma; tenuto: colpo caricato)
//   L1  interagisci          Cerchio  capriola (premi e lascia) / corsa (tieni premuto)
//   R1  affondo; tenuto: blocca il bersaglio         Quadrato  colpo ad area      Triangolo  pozione
//   levetta destra, L2 e R2  zoom                    OPTIONS  pausa               clic del touchpad  mappa
//   touchpad: muove il puntatore (come il mouse del browser); un tocco leggero o R3 "clicca": sul terreno per
//   andarci, su un nemico per attaccarlo, su una persona o un forziere per usarli; menu, abilità e finestre.
#include "voxelia.h"
#include "sw.h"

bool TITLE_MODE = true;
float FPS = 60;
float stickX = 0, stickY = 0;
bool runHeld = false; static float bT = 9, rT = 9; static bool rLocked = false;
bool attackHeld = false;
extern bool wantKeyboard;
extern bool uiTouchUsed;
void uiTick(float dt);
void uiAfterKeyboard(const char *name);
void rFrame(void);

void titleStart(void) {
	TITLE_MODE = true; started = false;
	char nm[16]; snprintf(nm, sizeof nm, "%s", P.name[0] ? P.name : "Eroe");
	memset(&P, 0, sizeof P);
	snprintf(P.name, sizeof P.name, "%s", nm);
	P.lv = 1; P.mx = 75; P.hp = 75; P.gt = 600; P.df = 1;
	loadZone("town", NULL);
	music(MUS_MENU);
	uiTitleInit();
}

extern int kbMode;
static void runKeyboard(void) {
	wantKeyboard = false;
	char buf[130] = {0};
	int max = kbMode == 0 ? 14 : kbMode == 1 ? 120 : kbMode == 2 ? 16 : kbMode == 4 ? 22 : 60;
	const char *hint = kbMode == 0 ? "Il tuo nome da eroe" : kbMode == 1 ? "Indirizzo del server" : kbMode == 2 ? "Codice stanza (lettere e numeri)" : kbMode == 4 ? "Nuovo nome" : "Messaggio per la stanza";
	extern char kbInit[64];
	const char *init = kbMode == 0 ? P.name : kbMode == 1 ? NETC.url : kbMode == 2 ? NETC.code : kbInit;
	char ini[130]; snprintf(ini, sizeof ini, "%s", init);
	kbInit[0] = 0;
	if (plKeyboard(hint, ini, max, buf, sizeof buf)) {
		char *p = buf; while (*p == ' ') p++;
		if (*p) uiAfterKeyboard(buf);
	}
}

/* ---------------- tocca per muoverti (come il clic sul terreno del browser) ---------------- */
// Il tocco sul mondo diventa un punto sul terreno; se lì c'è un nemico, diventa il bersaglio; se c'è una persona,
// un forziere, una porta o un oggetto, l'eroe ci va e lo usa. Il cammino lo trova pathFind() del gioco e
// l'eroe lo segue con la stessa "levetta" dei comandi.
static struct { bool on; float gx, gy; u8 path[64][2]; int n, i; Ent *use; float t; } TAP;
static void screenToWorld(float sx, float sy, float *wx, float *wy) {
	float S = camS * WORLD_PX / UIS;
	float a = ((sx - VW / 2) / S + camX) / 32, b = ((sy - VH / 2) / S + camY) / 16;   // a = x - y, b = x + y
	*wx = (a + b) / 2; *wy = (b - a) / 2;
}
static Ent *entAtScreen(float sx, float sy, bool enemies) {
	Ent *best = NULL; float bd = 18;
	for (int i = 0; i < NENT; i++) {
		Ent *e = &ents[i];
		bool en = e->k == K_EN && e->hp > 0;
		if (enemies != en) continue;
		if (!en && e->k != K_NPC && e->k != K_CH && e->k != K_DR && e->k != K_PO && e->k != K_SHARD && e->k != K_LORE && e->k != K_LEV && e->k != K_RES && e->k != K_X) continue;
		float ex, ey; worldToScreen(e->px, e->py, e->k == K_EN || e->k == K_NPC ? 18 : 8, &ex, &ey);
		float d = hyp(ex - sx, ey - sy);
		if (d < bd) { bd = d; best = e; }
	}
	return best;
}
static void tapAt(float sx, float sy) {
	Ent *en = entAtScreen(sx, sy, true);
	if (en) { TGT = en; TAP.on = false; return; }
	Ent *u = entAtScreen(sx, sy, false);
	float wx, wy;
	if (u) { wx = u->px; wy = u->py; } else screenToWorld(sx, sy, &wx, &wy);
	if (wx < 0 || wy < 0 || wx >= N || wy >= N) return;
	int gx = (int)wx, gy = (int)wy;
	if (!u && blk(wx, wy)) { int ox, oy; if (!nearFree(gx, gy, &ox, &oy)) return; gx = ox; gy = oy; wx = ox + .5f; wy = oy + .5f; }
	TAP.n = pathFind((int)P.px, (int)P.py, gx, gy, TAP.path, 64);
	TAP.gx = wx; TAP.gy = wy; TAP.i = 0; TAP.use = u; TAP.on = true; TAP.t = 0;
	if (TAP.n <= 0 && hyp(wx - P.px, wy - P.py) > 1.5f && !u) TAP.on = false;
	sparks(wx, wy, 4, 0xffd84a, 30);
}
static void tapFollow(float dt) {
	if (!TAP.on) return;
	TAP.t += dt;
	if (TAP.t > 12) { TAP.on = false; return; }
	if (TAP.use) {
		bool alive = false; for (int i = 0; i < NENT; i++) if (&ents[i] == TAP.use && TAP.use->k) alive = true;
		if (!alive) { TAP.on = false; return; }
		if (IT == TAP.use || hyp(TAP.use->px - P.px, TAP.use->py - P.py) < 1.2f) { Ent *e = TAP.use; TAP.on = false; if (IT == e) act(e); return; }
	}
	float tx, ty;
	while (TAP.i < TAP.n && hyp(TAP.path[TAP.i][0] + .5f - P.px, TAP.path[TAP.i][1] + .5f - P.py) < .3f) TAP.i++;
	if (TAP.i < TAP.n) { tx = TAP.path[TAP.i][0] + .5f; ty = TAP.path[TAP.i][1] + .5f; if (TAP.i == TAP.n - 1 && !TAP.use) { tx = TAP.gx; ty = TAP.gy; } }
	else { tx = TAP.gx; ty = TAP.gy; }
	float dx = tx - P.px, dy = ty - P.py, d = hyp(dx, dy);
	if (d < .12f && TAP.i >= TAP.n) { TAP.on = false; return; }
	dx /= d; dy /= d;
	// direzione nel mondo -> "levetta" (il gioco fa dx = kx + ky, dy = ky - kx)
	stickX = (dx - dy) / 2; stickY = (dx + dy) / 2;
	float m = hyp(stickX, stickY); stickX /= m; stickY /= m;
}

/* ---------------- prove automatiche (solo nella build per PC) ---------------- */
#ifndef __PS4__
static int autoZ = -1;   // "allzones": tutte le zone, una dopo l'altra
static const char *AUTO = NULL; static float autoWait = 0; static u32 autoKey = 0, autoHold = 0; static float autoHoldT = 0;
static float autoSX = 0, autoSY = 0, autoST = 0; static int autoTapX = -1, autoTapY = -1;
extern char plShotFile[512];   // plat_sdl.c: salvata subito prima dello scambio dei buffer
static u32 keyNamed(const char *k) {
	static const struct { const char *n; u32 v; } K[] = {{"A", KEY_A}, {"B", KEY_B}, {"X", KEY_X}, {"Y", KEY_Y}, {"L", KEY_L}, {"R", KEY_R}, {"START", KEY_START}, {"SELECT", KEY_SELECT},
		{"UP", KEY_DUP}, {"DOWN", KEY_DDOWN}, {"LEFT", KEY_DLEFT}, {"RIGHT", KEY_DRIGHT}};
	for (unsigned i = 0; i < sizeof K / sizeof K[0]; i++) if (!strcmp(K[i].n, k)) return K[i].v;
	return 0;
}
// comandi separati da ';': wait s · press K · hold K s · stick x y s · tap x y · shot file · new · zone k · time min ·
// open pause|inv|quest|diary|map|net · scale 0..2 · zoom z · log · quit
static bool autoStep(PlInput *in, float dt) {
	if (!AUTO) return true;
	if (autoHold) { in->kh |= autoHold; autoHoldT -= dt; if (autoHoldT <= 0) { in->ku |= autoHold; autoHold = 0; } }
	if (autoST > 0) { in->lx = autoSX; in->ly = autoSY; autoST -= dt; }
	if (autoTapX >= 0) { in->tdown = in->touch = true; in->tx = autoTapX; in->ty = autoTapY; in->ntouch = 1; autoTapX = -1; return true; }
	if (autoWait > 0) { autoWait -= dt; return true; }
	if (autoZ >= 0) {
		const char *z = zoneKeyAt(autoZ);
		if (!z) { printf("[prova] tutte le zone: %d caricate\n", autoZ); autoZ = -1; return true; }
		char kk[48]; snprintf(kk, sizeof kk, "%s", z); char *h = strchr(kk, '#'); int run = 0; if (h) { run = atoi(h + 1); *h = 0; }
		if (strchr(kk, '@')) { int d = dgIdx(strtok(strdup(kk), "@")); if (d >= 0) P.runs[d] = run; }
		loadZone(kk, NULL);
		extern int rQuads(void);
		printf("[prova] zona %d %s: %s N=%d entità %d luci %d\n", autoZ, z, ZNAME, N, NENT, NSLIGHT);
		autoZ++; autoWait = .12f; return true;
	}
	if (autoKey) { in->ku |= autoKey; autoKey = 0; }
	while (*AUTO == ' ' || *AUTO == ';') AUTO++;
	if (!*AUTO) return true;
	char cmd[400]; int n = 0; while (*AUTO && *AUTO != ';' && n < 399) cmd[n++] = *AUTO++; cmd[n] = 0;
	char a[200] = "", b[200] = "", c[200] = "", d[200] = ""; sscanf(cmd, "%199s %199s %199s %199s", a, b, c, d);
	printf("[prova] %s\n", cmd);
	if (!strcmp(a, "wait")) autoWait = atof(b);
	else if (!strcmp(a, "press")) { u32 k = keyNamed(b); in->kd |= k; in->kh |= k; autoKey = k; }
	else if (!strcmp(a, "hold")) { u32 k = keyNamed(b); in->kd |= k; in->kh |= k; autoHold = k; autoHoldT = atof(c); }
	else if (!strcmp(a, "stick")) { autoSX = atof(b); autoSY = atof(c); autoST = atof(d); }
	else if (!strcmp(a, "tap")) { autoTapX = atoi(b); autoTapY = atoi(c); }
	else if (!strcmp(a, "shot")) snprintf(plShotFile, sizeof plShotFile, "%s", b);
	else if (!strcmp(a, "new")) { uiClose(); newGame(1, b[0] ? b : "Prova"); }
	else if (!strcmp(a, "zone")) loadZone(b, c[0] ? c : NULL);
	else if (!strcmp(a, "time")) P.gt = atof(b);
	else if (!strcmp(a, "open")) { int m = !strcmp(b, "pause") ? PM_PAUSE : !strcmp(b, "inv") ? PM_INV : !strcmp(b, "quest") ? PM_QUEST : !strcmp(b, "diary") ? PM_DIARY : !strcmp(b, "map") ? PM_MAP : !strcmp(b, "net") ? PM_NET : !strcmp(b, "help") ? PM_HELP : PM_NONE; if (m) uiOpenPanel(m); else uiClose(); }
	else if (!strcmp(a, "scale")) { SET.uiSize = atoi(b); uiApplyScale(); }
	else if (!strcmp(a, "zoom")) SET.zoom = camS = atof(b);
	else if (!strcmp(a, "gold")) P.g = atoi(b);
	else if (!strcmp(a, "level")) { P.lv = atoi(b); recalc(); P.hp = P.mx; }
	else if (!strcmp(a, "log")) printf("[prova] zona %s (%s) N=%d ent=%d eroe %.2f %.2f vita %.0f/%d lv %d oro %d fps %.1f quad %d raster %.1f ms\n", Zk, ZNAME, N, NENT, P.px, P.py, P.hp, P.mx, P.lv, P.g, FPS, ({ extern int rQuads(void); rQuads(); }), ({ extern float swStatMs; swStatMs; }));
	else if (!strcmp(a, "talk")) {   // va dal personaggio (per nome, o il più vicino) e gli parla
		Ent *best = NULL; float bd = 1e9f;
		for (int i = 0; i < NENT; i++) { Ent *e = &ents[i]; if (e->k != K_NPC) continue; if (b[0] && !strstr(e->name, b)) continue; float d = hyp(e->px - P.px, e->py - P.py); if (d < bd) { bd = d; best = e; } }
		if (best) { int ox, oy; if (nearFree((int)best->px, (int)best->py + 1, &ox, &oy)) { P.px = ox + .5f; P.py = oy + .5f; } act(best); }
	}
	else if (!strcmp(a, "dev")) devOpen();
	else if (!strcmp(a, "allzones")) autoZ = 0;
	else if (!strcmp(a, "hud")) { extern bool uiHidden; uiHidden = !atoi(b); }
	else if (!strcmp(a, "net")) { snprintf(NETC.url, sizeof NETC.url, "%s", b); snprintf(NETC.code, sizeof NETC.code, "%s", c); netStart(); }
	else if (!strcmp(a, "chat")) netSendChat(cmd + 5);
	else if (!strcmp(a, "netlog")) { int np = 0; for (int i = 0; i < MAXPEER; i++) if (PEERS[i].used) { np++; printf("[prova] altro eroe: %s lv %d in %s a %.1f,%.1f\n", PEERS[i].n, PEERS[i].lv, PEERS[i].rm, PEERS[i].x, PEERS[i].y); } printf("[prova] rete: %s · ok %d · ping %.0f · altri %d\n", netStatus, netOk, netPing, np); }
	else if (!strcmp(a, "sel")) { extern void uiTestSel(int); uiTestSel(atoi(b)); }
	else if (!strcmp(a, "quit")) { in->quit = true; }
	return true;
}
#endif

// schermata di caricamento (come nel port Vita 1.0.2): ogni passo dell'avvio finisce nel registro e sullo
// schermo, così se qualcosa si ferma su una console si vede dove
static bool bootG2 = false;
static void boot(const char *step) {
	plLog("avvio: %s…", step);
	swClear(0x0f0b07);
	if (bootG2) {
		g2Begin();
		txtC(VW / 2, VH / 2 - 60, 1.4f, C2D_Color32(255, 216, 74, 255), "VOXELIA");
		txtC(VW / 2, VH / 2 - 14, .5f, C2D_Color32(240, 236, 224, 255), "Il Regno Perduto · " GAME_VER);
		char b[96]; snprintf(b, sizeof b, "%s…", step);
		txtC(VW / 2, VH / 2 + 30, .45f, C2D_Color32(154, 164, 184, 255), b);
		g2Flush();
	}
	plSwap();
}
int main(int argc, char **argv) {
	(void)argc; (void)argv;
	if (!plGfxInit()) { plLog("ERRORE: lo schermo non si avvia"); return 1; }
	boot("impostazioni");
	setLoad();
	uiApplyScale();
	boot("carattere e interfaccia");
	g2Init();
	bootG2 = true;
	boot("mondo");
	rInit();
	boot("tabelle, modelli ed eroe");
	dataInit();
	plLog("dati: %d nemici, %d personaggi, %d missioni", NE, NNPC, NQT);
	if (!NE || !NNPC) plFatal("Mancano i dati del gioco (/app0/data/data.json). Reinstalla voxelia.pkg.");
	boot("gioco");
	gameInit();
	uiInit();
	boot("audio e musiche");
	auInit();
	boot("rete");
	netInit();
	snprintf(P.name, sizeof P.name, "Eroe");
	// il nome dell'eroe parte da quello dell'utente della console
	{ char nm[16] = ""; plUserName(nm, sizeof nm); if (nm[0]) snprintf(P.name, sizeof P.name, "%s", nm); }
	boot("Aldoria");
	titleStart();
	plLog("titolo pronto");
	camS = SET.zoom;
#ifndef __PS4__
	AUTO = getenv("VOX_AUTO");
	bool fixedDt = AUTO != NULL;
#endif

	u64 last = osGetTime();
	float fpsAcc = 0; int fpsN = 0;
	float pinch0 = 0, zoom0 = 0, zoomT = 0;
	for (;;) {
		u64 now = osGetTime();
		float dt = (now - last) / 1000.f; last = now;
		if (dt > .1f) dt = .1f;
		fpsAcc += dt; fpsN++; if (fpsAcc > 1) { FPS = fpsN / fpsAcc; fpsAcc = 0; fpsN = 0; }

		PlInput in; plPoll(&in);
#ifndef __PS4__
		if (fixedDt) dt = 1 / 60.f;
		autoStep(&in, dt);
#endif
		if (in.quit) break;
		u32 kd = in.kd, kh = in.kh, ku = in.ku;
		TITLE_MODE = !started;

		bool panel = uiBlocking();
		uiInput(&in);
		if (wantKeyboard) { runKeyboard(); last = osGetTime(); }

		// movimento: levetta analogica, oppure croce direzionale
		stickX = stickY = 0; attackHeld = false;
		if (started && !panel && !uiBlocking()) {
			float cx = in.lx, cy = in.ly;
			if (kh & KEY_DLEFT) cx = -1; if (kh & KEY_DRIGHT) cx = 1;
			if (kh & KEY_DUP) cy = -1; if (kh & KEY_DDOWN) cy = 1;
			float m = hyp(cx, cy); if (m > 1) { cx /= m; cy /= m; }
			if (m > .2f) TAP.on = false;   // la levetta ha la precedenza sul tocco
			stickX = cx; stickY = cy;
			if (kd & KEY_A) { TAP.on = false; heroAttackBtn(); }
			attackHeld = (kh & KEY_A) != 0;
			if (kd & KEY_L) heroInteractBtn();
			// Cerchio premuto e lasciato subito = capriola; tenuto premuto mentre ti muovi = corsa
			if (kd & KEY_B) bT = 0;
			if (kh & KEY_B) bT += dt;
			runHeld = (kh & KEY_B) && bT >= .24f;
			if ((ku & KEY_B) && bT < .24f) dodge();
			// R toccato = affondo dell'arma; R tenuto premuto = blocca il bersaglio (R di nuovo, tenuto, passa al seguente)
			if (kd & KEY_R) { rT = 0; rLocked = false; }
			if (kh & KEY_R) { rT += dt; if (rT >= .35f && !rLocked) { rLocked = true; lockNext(); } }
			if ((ku & KEY_R) && !rLocked) lunge();
			if (ku & KEY_A) heroAttackRelease();
			if (kd & KEY_Y) areaAtk();
			if (kd & KEY_X) potion();
			// zoom: levetta destra, oppure L2 (allontana) e R2 (avvicina)
			if (fabsf(in.ry) > .25f) { SET.zoom = clampf(SET.zoom - in.ry * dt * .7f, .4f, 1.2f); }
			if (in.l2 > .1f || in.r2 > .1f) { SET.zoom = clampf(SET.zoom + (in.r2 - in.l2) * dt * .7f, .4f, 1.2f); zoomT = .5f; }
			else if (zoomT > 0) { zoomT -= dt; if (zoomT <= 0) setSave(); }
			if (in.ntouch >= 2) {
				float d = hyp(in.tx - in.t2x, in.ty - in.t2y);
				if (pinch0 <= 0) { pinch0 = d; zoom0 = SET.zoom; }
				else SET.zoom = clampf(zoom0 * d / fmaxf(20, pinch0), .4f, 1.2f);
				TAP.on = false;
			} else {
				if (pinch0 > 0) setSave();
				pinch0 = 0;
				// tocca per muoverti
				if (in.tdown && !uiTouchUsed && SET.tapMove) tapAt(in.tx / UIS, in.ty / UIS);
			}
			if (m <= .2f && !(kh & (KEY_DLEFT | KEY_DRIGHT | KEY_DUP | KEY_DDOWN))) tapFollow(dt);
			if (TAP.on) runHeld = runHeld || hyp(TAP.gx - P.px, TAP.gy - P.py) > 9;
		} else TAP.on = false;

		// pannello sviluppatore: velocità del tempo e pausa del mondo (l'interfaccia e la rete vanno avanti)
		gameUpdate(DEV.pause && started ? 0 : dt * (started ? DEV.speed : 1));
		netTick(dt);
		uiTick(dt);

		// sullo sfondo del titolo la telecamera gira per Aldoria
		TITLE_MODE = !started;
		if (TITLE_MODE) {
			float a = gtime * .045f;
			P.px = 35.5f + cosf(a) * 15; P.py = 38.5f + sinf(a) * 12;
			NK = 0; DK = 0;
		}
		// telecamera morbida con un piccolo tremolio sui colpi forti
		float k = 1 - powf(.88f, dt * 60);
		camTX = 32 * (P.px - P.py); camTY = 16 * (P.px + P.py) - 10;
		camX += (camTX - camX) * k; camY += (camTY - camY) * k;
		camS += (SET.zoom - camS) * k;
		float sx = camX, sy = camY;
		if (shake > 0) { camX += (frnd() - .5f) * shake * 30; camY += (frnd() - .5f) * shake * 30; }
		{ static int fr = 0; if (fr < 2) plLog("fotogramma %d: inizio", fr + 1); rFrame(); if (fr < 2) plLog("fotogramma %d: disegnato", fr + 1); if (fr == 600) plLog("10 secondi di gioco: tutto bene (%.0f fps, disegno %.1f ms)", FPS, ({ extern float swStatMs; swStatMs; })); fr++; }
		camX = sx; camY = sy;
	}
	saveGame();
	setSave();
	netExit();
	auExit();
	rExit();
	plGfxExit();
	return 0;
}
