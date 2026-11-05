// Voxelia 3DS - Il Regno Perduto
// Ciclo principale: comandi, telecamera, titolo e passaggio tra le schermate.
//
// Comandi:
//   Circle Pad / D-pad  muovi        A  attacca (insegue il nemico) o interagisci
//   L  interagisci                    B  schivata          R  affondo dell'arma
//   Y  colpo ad area                  X  pozione
//   ZL/ZR o C-stick (New 3DS) zoom    START pausa          SELECT mappa
//   Schermo touch: HUD, minimappa, zaino, missioni, diario, menu.
#include "voxelia.h"

bool TITLE_MODE = true;
bool IS_NEW3DS = false;
float FPS = 60;
float stickX = 0, stickY = 0;
bool runHeld = false; static float bT = 9, rT = 9; static bool rLocked = false;
bool attackHeld = false;
extern bool wantKeyboard;
void uiTick(float dt);
void uiAfterKeyboard(const char *name);

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
	SwkbdState sw;
	char buf[130] = {0};
	int max = kbMode == 0 ? 14 : kbMode == 1 ? 120 : kbMode == 2 ? 16 : kbMode == 4 ? 22 : 60;
	swkbdInit(&sw, SWKBD_TYPE_NORMAL, 2, max);
	swkbdSetHintText(&sw, kbMode == 0 ? "Il tuo nome da eroe" : kbMode == 1 ? "Indirizzo del server" : kbMode == 2 ? "Codice stanza (lettere e numeri)" : kbMode == 4 ? "Nuovo nome" : "Messaggio per la stanza");
	extern char kbInit[64];
	swkbdSetInitialText(&sw, kbMode == 0 ? P.name : kbMode == 1 ? NETC.url : kbMode == 2 ? NETC.code : kbInit);
	kbInit[0] = 0;
	swkbdSetValidation(&sw, SWKBD_NOTEMPTY_NOTBLANK, 0, 0);
	SwkbdButton b = swkbdInputText(&sw, buf, max + 1);
	if (b == SWKBD_BUTTON_CONFIRM) uiAfterKeyboard(buf);
}

int main(int argc, char **argv) {
	(void)argc; (void)argv;

	romfsInit();
	cfguInit();
	APT_CheckNew3DS(&IS_NEW3DS);
	if (IS_NEW3DS) osSetSpeedupEnable(true);   // 804 MHz e cache L2 sui New 3DS
	rInit();
	dataInit();
	gameInit();
	uiInit();
	auInit();
	netInit();
	snprintf(P.name, sizeof P.name, "Eroe");
	// il nome dell'eroe parte da quello della console
	{
		u16 un[0x1C / 2 + 1] = {0};
		if (R_SUCCEEDED(CFGU_GetConfigInfoBlk2(0x1C, 0x000A0000, (u8 *)un))) {
			char nm[16] = {0}; int j = 0;
			for (int i = 0; i < 10 && un[i] && j < 14; i++) if (un[i] < 128) nm[j++] = (char)un[i];
			if (j) snprintf(P.name, sizeof P.name, "%s", nm);
		}
	}
	titleStart();
	camS = SET.zoom;

	u64 last = osGetTime();
	float fpsAcc = 0; int fpsN = 0;
	while (aptMainLoop()) {
		u64 now = osGetTime();
		float dt = (now - last) / 1000.f; last = now;
		if (dt > .1f) dt = .1f;
		fpsAcc += dt; fpsN++; if (fpsAcc > 1) { FPS = fpsN / fpsAcc; fpsAcc = 0; fpsN = 0; }

		hidScanInput();
		u32 kd = hidKeysDown(), kh = hidKeysHeld();
		touchPosition tp; hidTouchRead(&tp);
		bool touched = kh & KEY_TOUCH, tdown = kd & KEY_TOUCH;
		TITLE_MODE = !started;

		bool panel = uiBlocking();
		uiInput(kd, kh, &tp, touched, tdown);
		if (wantKeyboard) runKeyboard();

		// movimento: Circle Pad analogico, oppure D-pad
		stickX = stickY = 0; attackHeld = false;
		if (started && !panel && !uiBlocking()) {
			circlePosition cp; hidCircleRead(&cp);
			float cx = cp.dx / 150.f, cy = -cp.dy / 150.f;
			if (kh & KEY_DLEFT) cx = -1; if (kh & KEY_DRIGHT) cx = 1;
			if (kh & KEY_DUP) cy = -1; if (kh & KEY_DDOWN) cy = 1;
			float m = hyp(cx, cy); if (m > 1) { cx /= m; cy /= m; }
			stickX = cx; stickY = cy;
			if (kd & KEY_A) heroAttackBtn();
			attackHeld = (kh & KEY_A) != 0;
			if (kd & KEY_L) heroInteractBtn();
			// B premuto e lasciato subito = capriola; tenuto premuto mentre ti muovi = corsa
			if (kd & KEY_B) bT = 0;
			if (kh & KEY_B) bT += dt;
			runHeld = (kh & KEY_B) && bT >= .24f;
			if ((hidKeysUp() & KEY_B) && bT < .24f) dodge();
			// R toccato = affondo dell'arma; R tenuto premuto = blocca il bersaglio (R di nuovo, tenuto, passa al seguente)
			if (kd & KEY_R) { rT = 0; rLocked = false; }
			if (kh & KEY_R) { rT += dt; if (rT >= .35f && !rLocked) { rLocked = true; lockNext(); } }
			if ((hidKeysUp() & KEY_R) && !rLocked) lunge();
			if (hidKeysUp() & KEY_A) heroAttackRelease();
			if (kd & KEY_Y) areaAtk();
			if (kd & KEY_X) potion();
			// zoom
			if (kh & KEY_ZL) SET.zoom = clampf(SET.zoom - dt * .6f, .4f, 1.1f);
			if (kh & KEY_ZR) SET.zoom = clampf(SET.zoom + dt * .6f, .4f, 1.1f);
			if (kh & KEY_CSTICK_UP) SET.zoom = clampf(SET.zoom + dt * .6f, .4f, 1.1f);
			if (kh & KEY_CSTICK_DOWN) SET.zoom = clampf(SET.zoom - dt * .6f, .4f, 1.1f);
			if (kd & KEY_ZL || kd & KEY_ZR) setSave();
		}

		gameUpdate(dt);
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
		rFrame();
		camX = sx; camY = sy;
	}
	saveGame();
	netExit();
	auExit();
	rExit();
	cfguExit();
	romfsExit();

	return 0;
}
