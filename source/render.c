// Voxelia DS - renderer 3D sul motore del DS (2048 poligoni per fotogramma).
// Ogni casella della zona è un pavimento e al massimo un blocco (tools/dsassets.py li ricava dai voxel del 3DS):
// si disegnano solo le caselle inquadrate, con la luce calcolata per casella (giorno, tramonto, notte, torce,
// la luce intorno all'eroe). La proiezione è la stessa isometrica del 3DS, a metà scala.
// Personaggi e nemici sono sprite (draw.c) disegnati come quadrati con texture e profondità, quindi i muri
// davanti li coprono; i blocchi alti davanti all'eroe diventano trasparenti, come sul 3DS.
#include "voxelia.h"

float camX = 0, camY = 0, camS = .5f, camTX = 0, camTY = 0;
float gEmit = 0;
Light SLIGHT[256];
int NSLIGHT = 0;
static const float S = .5f;   // scala: una casella è larga 32 pixel
u32 PROF[6];   // tempi dell'ultimo fotogramma (gioco, mondo 3D, interfaccia sopra, sotto, attesa) in decimi di ms
static inline u32 tnow(void) { return (u32)tickGetCount(); }   // 523 kHz (calico)

typedef struct { u16 fc; s8 fz; u8 fl, a, b, z0, z1; u16 tc, sc; } TRec;   // 12 byte, come nel file .dsz
static TRec *TR = NULL;
static u8 TLIT[MAXN * MAXN];      // luce delle torce e dei lampioni per casella (0..255)
static float CSUM = 0;            // x+y al centro dell'inquadratura (per la profondità)
static int NPOLY = 0;
bool TITLE_MODE_EXT = false;
#define MAXPOLY 1480   // il DS ha 6144 vertici per fotogramma: 1536 quadrilateri

void addSLight(float x, float y, float z, float r, u32 c, float a) {
	(void)z; (void)c;
	if (NSLIGHT >= 256) return;
	SLIGHT[NSLIGHT++] = (Light){x, y, z, r, ((c >> 16) & 255) / 255.f, ((c >> 8) & 255) / 255.f, (c & 255) / 255.f};
	SLIGHT[NSLIGHT - 1].cr *= a;
}
u32 shade(u32 c, float f) {
	int r = (int)(((c >> 16) & 255) * f), g = (int)(((c >> 8) & 255) * f), b = (int)((c & 255) * f);
	if (r > 255) r = 255; if (g > 255) g = 255; if (b > 255) b = 255; if (r < 0) r = 0; if (g < 0) g = 0; if (b < 0) b = 0;
	return (r << 16) | (g << 8) | b;
}
static inline u32 c15to24(u16 c) { return ((c & 31) << 19) | (((c >> 5) & 31) << 11) | (((c >> 10) & 31) << 3); }

void rBuildZone(const u8 *recs, int n) {
	free(TR); TR = malloc(sizeof(TRec) * n * n);
	memcpy(TR, recs, sizeof(TRec) * n * n);
	memset(TLIT, 0, sizeof TLIT);
	for (int i = 0; i < NSLIGHT; i++) {
		Light *l = &SLIGHT[i]; int r = (int)ceilf(l->r);
		for (int y = (int)l->y - r; y <= (int)l->y + r; y++) for (int x = (int)l->x - r; x <= (int)l->x + r; x++) {
			if (x < 0 || y < 0 || x >= n || y >= n) continue;
			float d = hyp(x + .5f - l->x, y + .5f - l->y); if (d >= l->r) continue;
			int v = TLIT[y * n + x] + (int)((1 - d / l->r) * 230 * fminf(1, l->cr + .3f)); TLIT[y * n + x] = v > 255 ? 255 : v;
		}
	}
	// colori della minimappa: il tetto del blocco, altrimenti il pavimento
	for (int y = 0; y < n; y++) for (int x = 0; x < n; x++) { TRec *t = &TR[y * n + x]; TCOL[y][x] = c15to24((t->fl & 1) ? t->tc : t->fc); }
}

/* ---------------- proiezione ---------------- */
void worldToScreen(float x, float y, float z, float *sx, float *sy) {
	// in coordinate dello schermo superiore del 3DS (400x240), per l'interfaccia condivisa
	float X = 128 + S * (32 * (x - y) - camX), Y = 96 + S * (16 * (x + y) - z - camY);
	*sx = X / .64f; *sy = Y / .8f;
}
static inline int clampv(int v) { return v < -32760 ? -32760 : v > 32760 ? 32760 : v; }
// vertice in pixel dello schermo (rispetto al centro) e profondità (più grande = più vicino)
static inline void vS(float sx, float sy, float d) { glVertex3v16(clampv((int)(sx * 128)), clampv((int)(-sy * 128)), clampv((int)(d * 1024))); }
static inline void vW(float x, float y, float z) { vS(S * (32 * (x - y) - camX), S * (16 * (x + y) - z - camY), (x + y - CSUM) + z / 32.f); }
static inline u16 col15(u32 rgb) { return RGB15((rgb >> 19) & 31, (rgb >> 11) & 31, (rgb >> 3) & 31); }

/* ---------------- luce ---------------- */
static float AMB, TINTR, TINTG, TINTB, HEROL;
static void lightSetup(void) {
	bool dg = ZDG >= 0;
	AMB = dg ? .62f : ZINT ? .9f : 1 - .5f * NK - .12f * DK;
	TINTR = 1 - .3f * NK + .05f * DK; TINTG = 1 - .22f * NK - .08f * DK; TINTB = 1 + .05f * NK - .15f * DK;
	HEROL = AMB < .9f ? (1 - AMB) * .9f : 0;
}
float lightAt(float x, float y, bool emis) {
	if (emis && (AMB < .95f)) return 1.05f;
	int tx = (int)x, ty = (int)y;
	float f = AMB;
	if (tx >= 0 && ty >= 0 && tx < N && ty < N) f += (1 - AMB) * fminf(1, TLIT[ty * N + tx] / 200.f);
	if (HEROL > 0) { float d = hyp(x - P.px, y - P.py); if (d < 4.5f) f += HEROL * (1 - d / 4.5f); }
	return fminf(1.1f, f);
}
static inline u16 litC(u16 c, float f) {
	int r = (int)((c & 31) * f * TINTR), g = (int)(((c >> 5) & 31) * f * TINTG), b = (int)(((c >> 10) & 31) * f * TINTB);
	return RGB15(r > 31 ? 31 : r, g > 31 ? 31 : g, b > 31 ? 31 : b);
}
u16 litRGB(u32 rgb, float f) { return litC(col15(rgb), f); }

/* ---------------- primitive per draw.c ---------------- */
static inline bool roomFor(int n) { return NPOLY + n <= MAXPOLY; }
static void quadW(u16 c, float ax, float ay, float az, float bx, float by, float bz, float cx, float cy, float cz, float dx, float dy, float dz) {
	glColor(c); vW(ax, ay, az); vW(bx, by, bz); vW(cx, cy, cz); vW(dx, dy, dz); NPOLY++;
}
static int curAlpha = 31;
static void polyfmt(int a, int id) { curAlpha = a; glPolyFmt(POLY_ALPHA(a) | POLY_CULL_NONE | POLY_ID(id)); }
// box con le tre facce visibili, come sul 3DS (+y ombra 0,78, +x ombra 0,58)
void boxA(float x, float y, float z, float w, float d, float h, u32 c, float f, u8 a) {
	if (!roomFor(3)) return;
	bool tr = a < 250;
	if (tr) { glEnd(); polyfmt(a >> 3 ? a >> 3 : 1, 3); glBindTexture(0, 0); glBegin(GL_QUADS); }
	float L = lightAt(x + w / 2, y + d / 2, gEmit > .5f) * f;
	u16 c0 = col15(c), T = 0; (void)T;
	float zt = z + h;
	if (h > 0) {
		quadW(litC(c0, L * .78f), x, y + d, zt, x + w, y + d, zt, x + w, y + d, z, x, y + d, z);
		quadW(litC(c0, L * .58f), x + w, y, zt, x + w, y + d, zt, x + w, y + d, z, x + w, y, z);
	}
	quadW(litC(c0, L), x, y, zt, x + w, y, zt, x + w, y + d, zt, x, y + d, zt);
	if (tr) { glEnd(); polyfmt(31, 0); glBegin(GL_QUADS); }
}
void box(float x, float y, float z, float w, float d, float h, u32 c, float f) { boxA(x, y, z, w, d, h, c, f, 255); }
void boxR(float ox, float oy, float x, float y, float z, float w, float d, float h, u32 c, float f, u8 a) { boxA(ox + x, oy + y, z, w, d, h, c, f, a); }
// anello e disco piatti (effetti, ombre): ottagoni
void flatRing(float cx, float cy, float z, float rx, float ry, float th, u32 c, u8 a) {
	if (!roomFor(8) || rx <= .01f) return;
	glEnd(); polyfmt(a >> 3 ? a >> 3 : 1, 4); glBindTexture(0, 0); glBegin(GL_QUADS);
	glColor(col15(c));
	for (int i = 0; i < 8; i++) {
		float a0 = i * PI_F / 4, a1 = (i + 1) * PI_F / 4;
		float ix = rx - th, iy = ry - th; if (ix < 0) ix = 0; if (iy < 0) iy = 0;
		vW(cx + cosf(a0) * rx, cy + sinf(a0) * ry, z); vW(cx + cosf(a1) * rx, cy + sinf(a1) * ry, z);
		vW(cx + cosf(a1) * ix, cy + sinf(a1) * iy, z); vW(cx + cosf(a0) * ix, cy + sinf(a0) * iy, z);
		NPOLY++;
	}
	glEnd(); polyfmt(31, 0); glBegin(GL_QUADS);
}
void flatEllipse(float cx, float cy, float z, float rx, float ry, u32 c, u8 a) { flatRing(cx, cy, z, rx, ry, fmaxf(rx, ry), c, a); }
void rStream(int s) { (void)s; }

// sprite: quadrato con texture, in piedi sul punto (x, y); profondità che sale con l'altezza
void spriteQuad(int tex, int w, int h, int ax, int ay, float k, float x, float y, float zo, bool mirror, u16 tint, int alpha) {
	if (!tex || !roomFor(1)) return;
	float fx = S * (32 * (x - y) - camX), fy = S * (16 * (x + y) - zo - camY);
	if (fx < -170 || fx > 170 || fy < -140 || fy > 180) return;
	float L = (w / 2.f + ax) * k, top = ay * k, wd = w * k, bot = (h - ay) * k;
	float d0 = x + y - CSUM + zo / 32.f, dTop = d0 + top / S / 32.f, dBot = d0 - .02f;
	glEnd();
	polyfmt(alpha, alpha < 31 ? 5 : 0);
	glBindTexture(0, tex);
	glBegin(GL_QUADS);
	glColor(tint);
	int u0 = mirror ? w * 16 : 0, u1 = mirror ? 0 : w * 16;
	glTexCoord2t16(u0, 0); vS(fx - L, fy - top, dTop + .05f);
	glTexCoord2t16(u1, 0); vS(fx - L + wd, fy - top, dTop + .05f);
	glTexCoord2t16(u1, h * 16); vS(fx - L + wd, fy + bot, dBot + .05f);
	glTexCoord2t16(u0, h * 16); vS(fx - L, fy + bot, dBot + .05f);
	NPOLY++;
	glEnd();
	glBindTexture(0, 0);
	if (alpha < 31) polyfmt(31, 0);
	glBegin(GL_QUADS);
}

/* ---------------- la zona ---------------- */
static inline TRec *tr(int x, int y) { return (x >= 0 && y >= 0 && x < N && y < N) ? &TR[y * N + x] : NULL; }
/* ---- caselle in aritmetica intera: l'ARM9 del DS non ha la virgola mobile ----
   x, y in sedicesimi di casella, z in unità da 2 pixel (come nel file .dsz).
   vx = 128 (X - Y) - 64 camX, vy = -(64 (X + Y) - 128 z - 64 camY), profondità = 64 (X + Y) + 64 z - 1024 CSUM */
static int ICX, ICY, ICS, IAMB, IHER, IHX, IHY, ITR, ITG, ITB, IEMI;
static inline void vI(int X, int Y, int Z) {
	int vx = 128 * (X - Y) - ICX, vy = ICY - 64 * (X + Y) + 128 * Z, vz = 64 * (X + Y) + 64 * Z - ICS;
	glVertex3v16(clampv(vx), clampv(vy), clampv(vz));
}
static inline u16 litI(u16 c, int f) {   // f: 256 = luce piena
	int r = ((c & 31) * f * ITR) >> 16, g = (((c >> 5) & 31) * f * ITG) >> 16, b = (((c >> 10) & 31) * f * ITB) >> 16;
	return RGB15(r > 31 ? 31 : r, g > 31 ? 31 : g, b > 31 ? 31 : b);
}
static int lightI(int x, int y) {
	int f = IAMB;
	if (IAMB < 256) {
		f += ((256 - IAMB) * TLIT[y * N + x]) / 200;
		if (IHER) { int dx = x * 16 + 8 - IHX, dy = y * 16 + 8 - IHY, d2 = dx * dx + dy * dy; if (d2 < 5184) f += IHER * (5184 - d2) / 5184; }   // 4,5 caselle
	}
	return f > 282 ? 282 : f;
}
static void intSetup(void) {
	ICX = (int)(64 * camX); ICY = (int)(64 * camY); ICS = (int)(1024 * CSUM);
	IAMB = (int)(AMB * 256); IHER = (int)(HEROL * 256); IHX = (int)(P.px * 16); IHY = (int)(P.py * 16);
	ITR = (int)(TINTR * 256); ITG = (int)(TINTG * 256); ITB = (int)(TINTB * 256); IEMI = AMB < .95f ? 269 : 0;
}
#define QI(c, ax, ay, az, bx, by, bz, cx, cy, cz, dx, dy, dz) do { glColor(c); vI(ax, ay, az); vI(bx, by, bz); vI(cx, cy, cz); vI(dx, dy, dz); NPOLY++; } while (0)
static void drawTileObj(int x, int y, TRec *t, int L) {
	int X = x * 16, Y = y * 16;
	int x0 = X + (t->a & 15), y0 = Y + (t->a >> 4), x1 = X + (t->b & 15) + 1, y1 = Y + (t->b >> 4) + 1, z0 = t->z0, z1 = t->z1;
	int Lo = (t->fl & 2) && IEMI > L ? IEMI : L;
	QI(litI(t->sc, Lo * 200 >> 8), x0, y1, z1, x1, y1, z1, x1, y1, z0, x0, y1, z0);
	QI(litI(t->sc, Lo * 148 >> 8), x1, y0, z1, x1, y1, z1, x1, y1, z0, x1, y0, z0);
	QI(litI(t->tc, Lo), x0, y0, z1, x1, y0, z1, x1, y1, z1, x0, y1, z1);
}
static void drawTile(int x, int y, bool obj) {
	TRec *t = &TR[y * N + x];
	if (M[y][x] == 9 && !(t->fl & 1)) return;   // vuoto fuori dalla mappa
	if (!roomFor(6)) return;
	int L = lightI(x, y);
	int X = x * 16, Y = y * 16, fz = t->fz;
	QI(litI(t->fc, (t->fl & 4) && IEMI > L ? IEMI : L), X, Y, fz, X + 16, Y, fz, X + 16, Y + 16, fz, X, Y + 16, fz);
	// gradini verso i vicini più bassi (acqua, fossati, piattaforme)
	int z1 = y + 1 < N ? TR[(y + 1) * N + x].fz : fz - 4, z2 = x + 1 < N ? TR[y * N + x + 1].fz : fz - 4;
	if (z1 < fz) QI(litI(t->fc, L * 200 >> 8), X, Y + 16, fz, X + 16, Y + 16, fz, X + 16, Y + 16, z1, X, Y + 16, z1);
	if (z2 < fz) QI(litI(t->fc, L * 148 >> 8), X + 16, Y, fz, X + 16, Y + 16, fz, X + 16, Y + 16, z2, X + 16, Y, z2);
	if (obj && (t->fl & 1)) drawTileObj(x, y, t, L);
}
// i blocchi alti appena davanti all'eroe si disegnano trasparenti, per vederlo dietro muri e case
static bool ghostTile(int x, int y) {
	if (TITLE_MODE_EXT) return false;
	TRec *t = &TR[y * N + x];
	if (!(t->fl & 1) || t->z1 * 2 < 22) return false;
	int hs = (int)floorf(P.px) + (int)floorf(P.py), hd = (int)floorf(P.px) - (int)floorf(P.py);
	int s = x + y, d = x - y;
	return s > hs && s <= hs + 5 && abs(d - hd) <= 2 + (s - hs) / 3;
}

/* ---------------- fotogramma ---------------- */
void uiDrawTopOverlay(float eyeShift);
extern bool TITLE_MODE;
extern float zoneFade;
void drawWorldEntities(void);   // draw.c

void rInit(void) {
	videoSetMode(MODE_5_3D | DISPLAY_BG3_ACTIVE);
	videoSetModeSub(MODE_5_2D | DISPLAY_BG3_ACTIVE);
	vramSetBankA(VRAM_A_TEXTURE); vramSetBankB(VRAM_B_TEXTURE); vramSetBankC(VRAM_C_TEXTURE); vramSetBankD(VRAM_D_TEXTURE);
	vramSetBankE(VRAM_E_MAIN_BG); vramSetBankF(VRAM_F_TEX_PALETTE);
	vramSetBankH(VRAM_H_SUB_BG); vramSetBankI(VRAM_I_SUB_BG_0x06208000);
	int bg = bgInit(3, BgType_Bmp8, BgSize_B8_256x256, 0, 0); bgSetPriority(bg, 0);
	int bs = bgInitSub(3, BgType_Bmp8, BgSize_B8_256x256, 0, 0); bgSetPriority(bs, 0);
	REG_BG0CNT = (REG_BG0CNT & ~3) | 1;   // il 3D sotto la bitmap dell'interfaccia
	glInit();
	glEnable(GL_TEXTURE_2D | GL_BLEND | GL_ANTIALIAS);
	glClearColor(2, 3, 5, 31); glClearPolyID(63); glClearDepth(GL_MAX_DEPTH);
	glViewport(0, 0, 255, 191);
	extern void gfxInit(void); gfxInit();
}
void rExit(void) {}

void rFrame(void) {
	u32 t0 = tnow();
	TITLE_MODE_EXT = TITLE_MODE;
	lightSetup();
	CSUM = (camY + 10) / 16.f;
	intSetup();
	u32 bgc = shade(ZBG, ZDG >= 0 ? .6f : AMB);
	glClearColor((bgc >> 19) & 31, (bgc >> 11) & 31, (bgc >> 3) & 31, 31);
	glMatrixMode(GL_PROJECTION); glLoadIdentity();
	glOrthof32(-(4 << 12), 4 << 12, -(3 << 12), 3 << 12, -(8 << 12), 8 << 12);   // 32 pixel = 1 unità
	glMatrixMode(GL_MODELVIEW); glLoadIdentity();
	NPOLY = 0;
	polyfmt(31, 0); glBindTexture(0, 0);
	glBegin(GL_QUADS);
	if (TR && N > 0) {
		// caselle inquadrate: x+y (righe) e x-y (colonne) intorno al centro, più le righe sotto per i blocchi alti
		float cd = camX / 32.f;
		int cs = (int)floorf(CSUM), c0 = (int)floorf(cd);
		static u16 GH[96]; int ng = 0;
		for (int s = cs - 13; s <= cs + 24; s++) {
			for (int d = c0 - 10; d <= c0 + 10; d++) {
				if (((s + d) & 1)) continue;
				int x = (s + d) / 2, y = (s - d) / 2;
				if (x < 0 || y < 0 || x >= N || y >= N) continue;
				TRec *t = &TR[y * N + x];
				// le righe molto in basso servono solo per i blocchi che salgono fin dentro lo schermo
				int sy = 8 * (s + 1) - ICY / 128 + 96;
				if (sy > 210 && (!(t->fl & 1) || sy - t->z1 > 200)) continue;
				if (ghostTile(x, y) && ng < 96) { GH[ng++] = y * N + x; drawTile(x, y, false); continue; }
				drawTile(x, y, true);
			}
		}
		// fantasmi: prima il pavimento sopra, poi il blocco trasparente
		if (ng) {
			glEnd(); polyfmt(13, 2); glBegin(GL_QUADS);
			for (int i = 0; i < ng; i++) {
				int x = GH[i] % N, y = GH[i] / N; TRec *t = &TR[GH[i]];
				if (!(t->fl & 1) || !roomFor(3)) continue;
				drawTileObj(x, y, t, lightI(x, y));
			}
			glEnd(); polyfmt(31, 0); glBegin(GL_QUADS);
		}
	}
	drawWorldEntities();
	glEnd();
	glFlush(0);
	u32 t1 = tnow();

	// interfaccia: sopra il 3D e sullo schermo touch
	gfxClear(1); gfxTarget(1);
	uiDrawTopOverlay(0);
	u32 t2 = tnow();
	// lo schermo touch si ridisegna a fotogrammi alterni (HUD e finestre cambiano piano)
	static int bfr = 0;
	if ((++bfr & 1) == 0) { gfxClear(0); gfxTarget(0); uiDrawBottom(); }
	u32 t3 = tnow();
	PROF[1] = (t1 - t0) / 52; PROF[2] = (t2 - t1) / 52; PROF[3] = (t3 - t2) / 52;
	swiWaitForVBlank();
	gfxPresent();
}
int rStats(char *out) { return sprintf(out, "p%d f%d g%lu w%lu t%lu b%lu %s", NPOLY, (int)FPS, PROF[0], PROF[1], PROF[2], PROF[3], netStatus); }

