// Voxelia PS4 - la tastiera a schermo del gioco (nome dell'eroe, chat, indirizzo del server, codice stanza) e il
// puntatore del touchpad. Sulla Vita c'era la tastiera di sistema; sulla PS4 il port ne disegna una sua, così
// funziona allo stesso modo su ogni firmware e anche nella build per PC (dove si può scrivere con la tastiera vera).
//   croce direzionale / levetta sinistra  scegli il tasto     Croce  scrivi      Quadrato  cancella
//   Triangolo  spazio      L2  maiuscole      R2 / OPTIONS  conferma      Cerchio  annulla
//   il puntatore del touchpad (o il mouse) tocca i tasti
#include "voxelia.h"
#include "sw.h"

#define G_A "\xEE\x80\x80"
#define G_B "\xEE\x80\x81"
#define G_X "\xEE\x80\x82"
#define G_Y "\xEE\x80\x83"
#define G_ST "\xEE\x80\x87"
#define G_L2 "\xEE\x80\x8A"
#define G_R2 "\xEE\x80\x8B"

static const char *LAY[3][4] = {
	{"1234567890", "qwertyuiop", "asdfghjkl@", "zxcvbnm.-_"},
	{"1234567890", "QWERTYUIOP", "ASDFGHJKL@", "ZXCVBNM.-_"},
	{"!?\"'()/:;&", "àèéìòù+=*#", "%$€<>[]{}~", ",|\\^°§£«»·"},
};
// i caratteri di una riga (UTF-8): l'i-esimo
static const char *keyAt(const char *row, int i, char *out) {
	const char *p = row;
	for (int k = 0; *p; k++) {
		int l = 1; u8 c = (u8)*p;
		if (c >= 0xF0) l = 4; else if (c >= 0xE0) l = 3; else if (c >= 0xC0) l = 2;
		if (k == i) { memcpy(out, p, l); out[l] = 0; return out; }
		p += l;
	}
	out[0] = 0; return out;
}
static int u8len(const char *s) { int n = 0; for (; *s; s++) if (((u8)*s & 0xC0) != 0x80) n++; return n; }
static void backspace(char *b) { int l = strlen(b); while (l > 0 && ((u8)b[l - 1] & 0xC0) == 0x80) l--; if (l > 0) b[l - 1] = 0; }
// tasti speciali dell'ultima riga: colonne occupate [c0, c1]
static const struct { int c0, c1; const char *t; } SP[5] = {{0, 1, "Maiusc"}, {2, 3, "Simboli"}, {4, 6, "Spazio"}, {7, 8, "Cancella"}, {9, 9, "OK"}};
static int spOf(int col) { for (int i = 0; i < 5; i++) if (col >= SP[i].c0 && col <= SP[i].c1) return i; return 4; }

bool oskRun(const char *hint, const char *init, int max, char *out, int outn) {
	char buf[256]; snprintf(buf, sizeof buf, "%s", init ? init : "");
	while (u8len(buf) > max) backspace(buf);
	int row = 1, col = 0, layer = 0;
	float hold = 0; u32 lastDir = 0; u64 last = osGetTime(); float blink = 0;
	PlInput in;
	plPoll(&in);   // i tasti che hanno aperto la tastiera non contano
	for (;;) {
		u64 now = osGetTime(); float dt = (now - last) / 1000.f; last = now; if (dt > .1f) dt = .1f;
		blink += dt;
		plPoll(&in);
		if (in.quit) return false;
		const char *ty = plTypedText();
		if (ty) { char t[8]; for (const char *p = ty; *p;) { int l = 1; u8 c = (u8)*p; if (c >= 0xF0) l = 4; else if (c >= 0xE0) l = 3; else if (c >= 0xC0) l = 2; memcpy(t, p, l); t[l] = 0; p += l; if (u8len(buf) < max && strlen(buf) + l < sizeof buf - 1) strcat(buf, t); } }
		u32 kd = in.kd, kh = in.kh;
		// spostamenti con ripetizione
		u32 dir = kh & (KEY_DUP | KEY_DDOWN | KEY_DLEFT | KEY_DRIGHT | KEY_CPAD_UP | KEY_CPAD_DOWN | KEY_CPAD_LEFT | KEY_CPAD_RIGHT);
		u32 step = 0;
		if (dir && dir != lastDir) { step = dir; hold = 0; }
		else if (dir) { hold += dt; if (hold > .38f) { step = dir; hold -= .07f; } }
		lastDir = dir;
		if (step & (KEY_DUP | KEY_CPAD_UP)) { row = (row + 4) % 5; if (row == 4) col = SP[spOf(col)].c0; }
		if (step & (KEY_DDOWN | KEY_CPAD_DOWN)) { row = (row + 1) % 5; if (row == 4) col = SP[spOf(col)].c0; }
		if (step & (KEY_DLEFT | KEY_CPAD_LEFT)) { if (row == 4) { int s = spOf(col); col = SP[(s + 4) % 5].c0; } else col = (col + 9) % 10; }
		if (step & (KEY_DRIGHT | KEY_CPAD_RIGHT)) { if (row == 4) { int s = spOf(col); col = SP[(s + 1) % 5].c0; } else col = (col + 1) % 10; }

		// disposizione (coordinate virtuali)
		float PW = fminf(VW - 16, 470), KW = (PW - 20) / 10, KH = 30;
		float PH = 64 + 5 * (KH + 4) + 26, X = (VW - PW) / 2, Y = (VH - PH) / 2;
		float GX = X + 10, GY = Y + 62;
		bool press = (kd & KEY_A) != 0;
		if (in.tdown) {
			float tx = in.tx / UIS, ty = in.ty / UIS;
			int r = (int)floorf((ty - GY) / (KH + 4)), c = (int)floorf((tx - GX) / KW);
			if (r >= 0 && r < 5 && c >= 0 && c < 10) { row = r; col = r == 4 ? SP[spOf(c)].c0 : c; press = true; }
		}
		int act = -1;   // 0 maiusc, 1 simboli, 2 spazio, 3 cancella, 4 ok
		if (press) {
			if (row < 4) {
				char k[8]; keyAt(LAY[layer][row], col, k);
				if (k[0] && u8len(buf) < max && strlen(buf) + strlen(k) < sizeof buf - 1) strcat(buf, k);
				if (layer == 1) layer = 0;   // la maiuscola vale per una lettera
				tone(880, .03f, W_SQUARE, .03f);
			} else act = spOf(col);
		}
		if (kd & KEY_Y) act = 3;
		if (kd & KEY_X) act = 2;
		if (kd & KEY_ZL) act = 0;
		if (kd & (KEY_ZR | KEY_START)) act = 4;
		if (kd & KEY_B) { plPoll(&in); return false; }
		if (act == 0) layer = layer == 1 ? 0 : 1;
		else if (act == 1) layer = layer == 2 ? 0 : 2;
		else if (act == 2) { if (u8len(buf) < max) strcat(buf, " "); }
		else if (act == 3) backspace(buf);
		else if (act == 4) { snprintf(out, outn, "%s", buf); return true; }

		// disegno: il gioco resta fermo dietro la tastiera
		swClear(0x0d0f1a);
		g2Begin();
		rectR(X, Y, PW, PH, 8, C2D_Color32(24, 29, 44, 252));
		rectO(X, Y, PW, PH, 1.5f, C2D_Color32(245, 185, 66, 140));
		txt(X + 12, Y + 8, .45f, C2D_Color32(245, 185, 66, 255), hint);
		rect(X + 10, Y + 30, PW - 20, 24, C2D_Color32(10, 12, 20, 255));
		char sh[300]; snprintf(sh, sizeof sh, "%s%s", buf, fmodf(blink, 1) < .55f ? "_" : " ");
		float tw = txtW(sh, .5f);
		txt(X + 15 - fmaxf(0, tw - (PW - 32)), Y + 32, .5f, C2D_Color32(240, 240, 240, 255), sh);
		char cnt[24]; snprintf(cnt, sizeof cnt, "%d/%d", u8len(buf), max); txtR(X + PW - 12, Y + 10, .32f, C2D_Color32(154, 164, 184, 255), cnt);
		for (int r = 0; r < 5; r++) {
			if (r < 4) for (int c = 0; c < 10; c++) {
				float kx = GX + c * KW, ky = GY + r * (KH + 4);
				bool sel = r == row && c == col;
				rectR(kx + 1.5f, ky, KW - 3, KH, 4, sel ? C2D_Color32(245, 185, 66, 255) : C2D_Color32(40, 48, 70, 255));
				char k[8]; keyAt(LAY[layer][r], c, k);
				txtC(kx + KW / 2, ky + 5, .55f, sel ? C2D_Color32(20, 20, 20, 255) : C2D_Color32(232, 236, 244, 255), k);
			}
			else for (int s = 0; s < 5; s++) {
				float kx = GX + SP[s].c0 * KW, ky = GY + r * (KH + 4), kw = (SP[s].c1 - SP[s].c0 + 1) * KW;
				bool sel = row == 4 && spOf(col) == s;
				bool on = (s == 0 && layer == 1) || (s == 1 && layer == 2);
				u32 bg = sel ? C2D_Color32(245, 185, 66, 255) : on ? C2D_Color32(90, 67, 32, 255) : s == 4 ? C2D_Color32(40, 90, 60, 255) : C2D_Color32(52, 60, 86, 255);
				rectR(kx + 1.5f, ky, kw - 3, KH, 4, bg);
				txtC(kx + kw / 2, ky + 8, .4f, sel ? C2D_Color32(20, 20, 20, 255) : C2D_Color32(232, 236, 244, 255), SP[s].t);
			}
		}
		txt(X + 12, Y + PH - 21, .32f, C2D_Color32(154, 164, 184, 255),
			G_A " scrivi · " G_Y " cancella · " G_X " spazio · " G_L2 " maiuscole · " G_R2 " / " G_ST " conferma · " G_B " annulla");
		g2Flush();
#ifndef __PS4__
		// prove automatiche: VOX_OSKSHOT=file salva un'immagine della tastiera e la chiude
		{ static int fr = 0; const char *sh = getenv("VOX_OSKSHOT"); extern char plShotFile[512];
		  if (sh && ++fr == 3) snprintf(plShotFile, sizeof plShotFile, "%s", sh);
		  if (sh && fr > 3) { plSwap(); fr = 0; return false; } }
#endif
		plSwap();
	}
}

/* ---------------- puntatore del touchpad ---------------- */
// una freccia bianca con il bordo scuro, scritta direttamente nell'immagine finita (dopo swFinish)
static const char *ARROW[] = {
	"X",
	"XX",
	"X.X",
	"X..X",
	"X...X",
	"X....X",
	"X.....X",
	"X......X",
	"X.......X",
	"X........X",
	"X.........X",
	"X......XXXXX",
	"X...X..X",
	"X..XX..X",
	"X.X  X..X",
	"XX   X..X",
	"X     X..X",
	"      X..X",
	"       XX",
};
void plCursorPixels(u32 *px, int w, int h, float fx, float fy) {
	int x0 = (int)fx, y0 = (int)fy, S = 2;   // a 1080p ogni punto della freccia è 2x2 pixel
	for (unsigned r = 0; r < sizeof ARROW / sizeof ARROW[0]; r++)
		for (int c = 0; ARROW[r][c]; c++) {
			char ch = ARROW[r][c]; if (ch == ' ') continue;
			u32 col = ch == 'X' ? 0x101010 : 0xffffff;
			for (int dy = 0; dy < S; dy++) for (int dx = 0; dx < S; dx++) {
				int x = x0 + c * S + dx, y = y0 + (int)r * S + dy;
				if (x >= 0 && y >= 0 && x < w && y < h) px[y * w + x] = col;
			}
		}
}
