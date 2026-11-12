// Voxelia DS - Il Regno Perduto
// Ciclo principale: comandi, telecamera, titolo e tastiera sullo schermo touch.
//
// Comandi:
//   D-pad  muovi                     A  attacca (insegue il nemico) o interagisci; tieni premuto: colpo caricato
//   L  interagisci                   B  schivata; tieni premuto mentre ti muovi: corsa
//   R  affondo (tenuto: blocca il bersaglio)    Y  colpo ad area      X  pozione
//   START  pausa                     SELECT  mappa
//   Schermo touch: HUD, minimappa, zaino, missioni, diario, chat, menu.
#include "voxelia.h"
#include <filesystem.h>
#include <fat.h>
#include <time.h>

bool TITLE_MODE = true;
float FPS = 60;
float stickX = 0, stickY = 0;
bool runHeld = false; static float bT = 9, rT = 9; static bool rLocked = false;
bool attackHeld = false;
extern bool wantKeyboard;
void uiTick(float dt);
void uiAfterKeyboard(const char *name);
bool fatOk = false;

u64 osGetTime(void) {
	// millisecondi dal 1900, come sul 3DS (i salvataggi tengono gli orari dei forzieri)
	static u64 base = 0; static u32 vbl0 = 0;
	if (!base) { base = ((u64)time(NULL) + 2208988800ULL) * 1000ULL; vbl0 = 0; }
	extern volatile u32 VBL; return base + (u64)(VBL - vbl0) * 1000 / 60;
}
volatile u32 VBL = 0;
static void onVBlank(void) { VBL++; }

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

/* ---------------- tastiera sullo schermo touch ---------------- */
extern int kbMode;
extern char kbInit[64];
static const char *KROW[2][4] = {
	{"1234567890", "qwertyuiop", "asdfghjkl'", "zxcvbnm,.?"},
	{"!\"/()=+-:;", "QWERTYUIOP", "ASDFGHJKL@", "ZXCVBNM_<>"}};
static const char *KACC[6] = {"\xC3\xA0", "\xC3\xA8", "\xC3\xA9", "\xC3\xAC", "\xC3\xB2", "\xC3\xB9"};
static void kbDraw(const char *hint, const char *buf, int shift) {
	gfxTarget(0); gfxClear(0);
	rect(0, 0, 320, 240, C2D_Color32(20, 24, 36, 255));
	txt(6, 4, .45f, C2D_Color32(245, 185, 66, 255), hint);
	rect(4, 22, 312, 22, C2D_Color32(40, 48, 72, 255));
	char b[140]; snprintf(b, sizeof b, "%s_", buf);
	float w = txtW(b, .45f); txt(w > 300 ? 310 - w : 8, 26, .45f, C2D_Color32(240, 240, 240, 255), b);
	for (int r = 0; r < 4; r++) for (int c = 0; c < 10; c++) {
		float x = 4 + c * 31.2f, y = 52 + r * 32;
		rect(x, y, 29, 29, C2D_Color32(52, 62, 92, 255));
		char k[2] = {KROW[shift][r][c], 0}; txtC(x + 14.5f, y + 7, .5f, C2D_Color32(240, 240, 240, 255), k);
	}
	for (int i = 0; i < 6; i++) { float x = 4 + i * 31.2f; rect(x, 182, 29, 26, C2D_Color32(52, 62, 92, 255)); txtC(x + 14.5f, 187, .5f, C2D_Color32(240, 240, 240, 255), KACC[i]); }
	rect(191, 182, 60, 26, C2D_Color32(70, 70, 90, 255)); txtC(221, 187, .45f, C2D_Color32(240, 240, 240, 255), "Maiusc");
	rect(254, 182, 62, 26, C2D_Color32(110, 60, 60, 255)); txtC(285, 187, .45f, C2D_Color32(240, 240, 240, 255), "Cancella");
	rect(4, 211, 150, 26, C2D_Color32(52, 62, 92, 255)); txtC(79, 216, .45f, C2D_Color32(240, 240, 240, 255), "spazio");
	rect(158, 211, 76, 26, C2D_Color32(90, 50, 50, 255)); txtC(196, 216, .45f, C2D_Color32(240, 240, 240, 255), "Annulla");
	rect(238, 211, 78, 26, C2D_Color32(50, 110, 70, 255)); txtC(277, 216, .45f, C2D_Color32(240, 240, 240, 255), "OK");
	gfxPresent();
}
static void runKeyboard(void) {
	wantKeyboard = false;
	int max = kbMode == 0 ? 14 : kbMode == 1 ? 120 : kbMode == 2 ? 16 : kbMode == 4 ? 63 : kbMode == 5 ? 22 : 60;
	const char *hint = kbMode == 0 ? "Il tuo nome da eroe" : kbMode == 1 ? "Indirizzo del server" : kbMode == 2 ? "Codice stanza (lettere e numeri)" : kbMode == 4 ? "Password della rete Wi-Fi" : kbMode == 5 ? "Nuovo nome" : "Messaggio o comando (START per inviare)";
	char buf[130] = "";
	snprintf(buf, sizeof buf, "%s", kbMode == 0 ? P.name : kbMode == 1 ? NETC.url : kbMode == 2 ? NETC.code : kbMode == 4 ? "" : kbInit);
	kbInit[0] = 0;
	int shift = 0; bool ok = false;
	kbDraw(hint, buf, shift);
	while (pmMainLoop()) {
		swiWaitForVBlank(); scanKeys();
		u32 kd = keysDown();
		if (kd & KEY_START) { ok = true; break; }
		if (kd & KEY_B) { int n = strlen(buf); if (n) { n--; while (n > 0 && ((u8)buf[n] & 0xC0) == 0x80) n--; buf[n] = 0; kbDraw(hint, buf, shift); } else break; }
		if (!(kd & KEY_TOUCH)) continue;
		touchPosition tp; touchRead(&tp);
		float x = tp.px / .8f, y = tp.py / .8f;
		const char *add = NULL; char k1[2] = {0, 0};
		if (y >= 52 && y < 180) { int r = (int)((y - 52) / 32), c = (int)((x - 4) / 31.2f); if (r >= 0 && r < 4 && c >= 0 && c < 10) { k1[0] = KROW[shift][r][c]; add = k1; } }
		else if (y >= 182 && y < 208) { if (x < 190) { int i = (int)((x - 4) / 31.2f); if (i >= 0 && i < 6) add = KACC[i]; } else if (x < 252) shift ^= 1; else { int n = strlen(buf); if (n) { n--; while (n > 0 && ((u8)buf[n] & 0xC0) == 0x80) n--; buf[n] = 0; } } }
		else if (y >= 211) { if (x < 156) add = " "; else if (x < 236) break; else { ok = true; break; } }
		if (add && (int)strlen(buf) + (int)strlen(add) <= max && strlen(buf) + strlen(add) < sizeof buf - 1) { strcat(buf, add); if (shift && add == k1) shift = 0; }
		tone(700, .02f, W_TRIANGLE, .03f);
		kbDraw(hint, buf, shift);
	}
	if (ok && buf[0]) uiAfterKeyboard(buf);
}

int main(int argc, char **argv) {
	(void)argc; (void)argv;
	defaultExceptionHandler();
	irqSet(IRQ_VBLANK, onVBlank); irqEnable(IRQ_VBLANK);
	rInit();
	gfxTarget(0); rect(0, 0, 320, 240, C2D_Color32(20, 24, 36, 255)); txtC(160, 110, .5f, C2D_Color32(245, 185, 66, 255), "Voxelia DS: caricamento..."); gfxPresent();
	if (!nitroFSInit(NULL)) {
		gfxClear(0); txtC(160, 100, .45f, C2D_Color32(255, 120, 120, 255), "File del gioco non trovati (NitroFS)."); txtC(160, 120, .4f, C2D_Color32(220, 220, 220, 255), "Avvia voxelia.nds da una scheda o da un emulatore"); txtC(160, 136, .4f, C2D_Color32(220, 220, 220, 255), "che supporta i file dentro la ROM."); gfxPresent();
		for (;;) swiWaitForVBlank();
	}
	fatOk = fatInitDefault();
	dataInit();
	gameInit();
	uiInit();
	auInit();
	netInit();
	setLoad();
	// il nome dell'eroe parte da quello della console
	{ char nm[16] = {0}; int j = 0;
	  for (int i = 0; i < PersonalData->nameLen && i < 10 && j < 14; i++) { u16 c = PersonalData->name[i]; if (c >= 32 && c < 127) nm[j++] = (char)c; }
	  if (j) snprintf(P.name, sizeof P.name, "%s", nm); }
	titleStart();
	camS = .5f;

	u32 last = VBL;
	float fpsAcc = 0; int fpsN = 0;
	while (pmMainLoop()) {
		u32 nowV = VBL; float dt = (nowV - last) / 60.f; last = nowV;
		if (dt <= 0) dt = 1 / 60.f;
		if (dt > .1f) dt = .1f;
		fpsAcc += dt; fpsN++; if (fpsAcc > 1) { FPS = fpsN / fpsAcc; fpsAcc = 0; fpsN = 0; }

		scanKeys();
		u32 kd = keysDown(), kh = keysHeld(), ku = keysUp();
		touchPosition tp; touchRead(&tp);
		bool touched = kh & KEY_TOUCH, tdown = kd & KEY_TOUCH;
		TITLE_MODE = !started;

		bool panel = uiBlocking();
		// l'interfaccia (dal port 3DS) ragiona in coordinate 320x240: il tocco del DS è in 256x192
		touchPosition tu = tp; tu.px = (u16)(tp.px * 5 / 4); tu.py = (u16)(tp.py * 5 / 4);
		uiInput(kd, kh, &tu, touched, tdown);
		if (wantKeyboard) runKeyboard();

		// movimento: D-pad (otto direzioni)
		stickX = stickY = 0; attackHeld = false;
		if (started && !panel && !uiBlocking()) {
			float cx = 0, cy = 0;
			if (kh & KEY_LEFT) cx = -1; if (kh & KEY_RIGHT) cx = 1;
			if (kh & KEY_UP) cy = -1; if (kh & KEY_DOWN) cy = 1;
			float m = hyp(cx, cy); if (m > 1) { cx /= m; cy /= m; }
			stickX = cx; stickY = cy;
			if (kd & KEY_A) heroAttackBtn();
			attackHeld = (kh & KEY_A) != 0;
			if (kd & KEY_L) heroInteractBtn();
			if (kd & KEY_B) bT = 0;
			if (kh & KEY_B) bT += dt;
			runHeld = (kh & KEY_B) && bT >= .24f;
			if ((ku & KEY_B) && bT < .24f) dodge();
			if (kd & KEY_R) { rT = 0; rLocked = false; }
			if (kh & KEY_R) { rT += dt; if (rT >= .35f && !rLocked) { rLocked = true; lockNext(); } }
			if ((ku & KEY_R) && !rLocked) lunge();
			if (ku & KEY_A) heroAttackRelease();
			if (kd & KEY_Y) areaAtk();
			if (kd & KEY_X) potion();
		}

		extern u32 PROF[6]; u32 g0 = (u32)tickGetCount();
		gameUpdate(dt);
		netTick(dt);
		PROF[0] = ((u32)tickGetCount() - g0) / 52;
		uiTick(dt);
		auTick(dt);

		// sullo sfondo del titolo la telecamera gira per Aldoria
		TITLE_MODE = !started;
		if (TITLE_MODE) {
			float a = gtime * .045f;
			P.px = 35.5f + cosf(a) * 15; P.py = 38.5f + sinf(a) * 12;
			NK = 0; DK = 0;
		}
		float k = 1 - powf(.88f, dt * 60);
		camTX = 32 * (P.px - P.py); camTY = 16 * (P.px + P.py) - 10;
		camX += (camTX - camX) * k; camY += (camTY - camY) * k;
		float sx = camX, sy = camY;
		if (shake > 0) { camX += (frnd() - .5f) * shake * 24; camY += (frnd() - .5f) * shake * 24; }
		rFrame();
		camX = sx; camY = sy;
	}
	saveGame();
	netExit();
	auExit();
	return 0;
}
