// Voxelia DS - audio sui canali PSG del DS (onde quadre con duty diversi e rumore), con la stessa musica
// procedurale del 3DS (scale, giri di accordi, melodia seminata, basso, batteria) ridotta ai canali che ci sono.
#include "voxelia.h"

float VOL_MUS = .5f, VOL_SFX = .7f;
bool MUS_ON = true;
static bool auOk = false;

typedef struct { float at, dur, freq; u8 duty, vol, noise, mus; } Note;
#define MAXN_Q 48
static Note Q[MAXN_Q]; static int NQ = 0;
typedef struct { int id; float end; u8 mus; } Live;
static Live LV[16]; static int NLV = 0;
static float now = 0;

static float mtof(float m) { return 440.f * powf(2.f, (m - 69) / 12.f); }
static DutyCycle dutyOf(int wave) { return wave == W_SQUARE ? DutyCycle_50 : wave == W_SAW ? DutyCycle_37 : wave == W_TRIANGLE ? DutyCycle_25 : DutyCycle_12; }
static void qNote(float delay, float dur, float freq, int wave, float vol, bool mus, bool noise) {
	if (!auOk || NQ >= MAXN_Q) return;
	float v = vol * (mus ? (MUS_ON ? VOL_MUS : 0) : VOL_SFX);
	if (v <= .001f) return;
	Q[NQ++] = (Note){now + delay, dur, freq, dutyOf(wave), (u8)clampi((int)(v * 127 * 6), 1, 127), noise, mus};
}

/* ---------------- musica (la stessa del 3DS) ---------------- */
static const s8 SC_MAJ[7] = {0, 2, 4, 5, 7, 9, 11}, SC_MIN[7] = {0, 2, 3, 5, 7, 8, 10}, SC_DOR[7] = {0, 2, 3, 5, 7, 9, 10}, SC_PHR[7] = {0, 1, 4, 5, 7, 8, 10}, SC_HM[7] = {0, 2, 3, 5, 7, 8, 11};
typedef struct { const char *name; int bpm, root; const s8 *sc; s8 pr[8]; int npr, ld; float dn; u8 arp, dr, pad, spb, waltz; s8 bs[8]; int nbs; } Track;
static const Track TRK[MUS_COUNT] = {
	{"menu", 88, 50, SC_MAJ, {0, 5, 3, 4}, 4, W_SQUARE, .5f, 1, 0, 1, 16, 0, {0, 8}, 2},
	{"town", 100, 53, SC_MAJ, {0, 3, 4, 0, 5, 3, 1, 4}, 8, W_TRIANGLE, .6f, 0, 1, 0, 16, 0, {0, 6, 8, 12}, 4},
	{"forest", 104, 50, SC_DOR, {0, 6, 3, 0}, 4, W_TRIANGLE, .55f, 1, 1, 0, 16, 0, {0, 8}, 2},
	{"desert", 94, 52, SC_PHR, {0, 1, 0, 6}, 4, W_SQUARE, .45f, 0, 1, 0, 16, 0, {0, 3, 8, 11}, 4},
	{"peaks", 72, 49, SC_MIN, {0, 5, 2, 6}, 4, W_SINE, .35f, 1, 0, 1, 16, 0, {0, 8}, 2},
	{"inter", 126, 55, SC_MAJ, {0, 4, 5, 3}, 4, W_TRIANGLE, .6f, 0, 0, 0, 12, 1, {0}, 1},
	{"dungeon", 80, 45, SC_MIN, {0, 0, 5, 4}, 4, W_TRIANGLE, .28f, 0, 2, 1, 16, 0, {0, 8}, 2},
	{"boss", 150, 45, SC_HM, {0, 1, 0, 4}, 4, W_SAW, .66f, 0, 3, 0, 16, 0, {0, 2, 4, 6, 8, 10, 12, 14}, 8},
	{"arena", 136, 47, SC_HM, {0, 5, 3, 4}, 4, W_SQUARE, .62f, 0, 3, 0, 16, 0, {0, 3, 6, 8, 11, 14}, 6},
};
int musicFor(const char *m) {
	if (!m || !*m) return MUS_TOWN;
	static const char *K[] = {"menu", "town", "forest", "desert", "peaks", "inter", "dungeon", "boss", "arena"};
	for (int i = 0; i < MUS_COUNT; i++) if (!strcmp(K[i], m)) return i;
	if (strstr(m, "tana") || strstr(m, "cripta") || strstr(m, "piramide") || strstr(m, "cristallo") || strstr(m, "fucina") || strstr(m, "abisso") || strstr(m, "cittadella") || strstr(m, "tempio")) return MUS_DUNGEON;
	if (strstr(m, "giungla") || strstr(m, "campi") || strstr(m, "nord")) return MUS_FOREST;
	if (strstr(m, "rovine") || strstr(m, "ceneri")) return MUS_PEAKS;
	if (strstr(m, "porto") || strstr(m, "mare")) return MUS_DESERT;
	return MUS_INTER;
}
static int curTr = -1, st = 0, bar = 0;
static float nextStep = 0;
static u32 hsS(const char *s) { u32 h = 2166136261u; for (; *s; s++) h = (h ^ (u8)*s) * 16777619u; return h; }
static float mb(u32 *a) {
	*a += 0x6D2B79F5u; u32 t = *a;
	t = (t ^ (t >> 15)) * (1u | t);
	t = (t + ((t ^ (t >> 7)) * (61u | t))) ^ t;
	return (float)((t ^ (t >> 14)) >> 8) / 16777216.f;
}
static int midN(const Track *T, int k) { int m = ((k % 7) + 7) % 7; return T->root + T->sc[m] + 12 * (int)floorf(k / 7.f); }
static void mstep(const Track *T, int s, int b, float dt) {
	int spb = T->spb, deg = T->pr[b % T->npr];
#define CN(i) midN(T, deg + (i) * 2)
	for (int i = 0; i < T->nbs; i++) if (T->bs[i] == s) qNote(0, dt * (spb == 12 ? 4 : 3), mtof(CN(0) - 12), W_TRIANGLE, .09f, 1, 0);
	if (T->arp && s % 2 == 0) qNote(0, dt * 1.6f, mtof(CN((s >> 1) % 3) + 24), W_SINE, .02f, 1, 0);
	if (s % 2 == 0) {
		u32 r = hsS(T->name) + (b % 4) * 977 + ((b >> 2) & 1) * 7919 + s * 131;
		float a = mb(&r), c = mb(&r), e = mb(&r);
		if (a < T->dn && !(b % 8 == 7 && s >= spb / 2)) {
			int k = s % 4 == 0 ? deg + 2 * (int)floorf(c * 3) : deg + (int)floorf(c * 7) - 1;
			qNote(0, dt * (2 + (int)floorf(e * 3)), mtof(midN(T, k) + 12), T->ld, .045f, 1, 0);
		}
	}
	if (T->dr == 1) { if (s == 0 || s == 8) qNote(0, .06f, 60, W_SQUARE, .1f, 1, 0); if (s % 4 == 2) qNote(0, .03f, 8000, 0, .025f, 1, 1); }
	else if (T->dr >= 2) { if (s == 0) qNote(0, .07f, 55, W_SQUARE, .12f, 1, 0); if (T->dr == 3 && (s == 4 || s == 12)) qNote(0, .08f, 1800, 0, .06f, 1, 1); }
}
void music(int track) {
	VOL_MUS = SET.mu; VOL_SFX = SET.sf; MUS_ON = SET.muOn;
	if (track != curTr) { curTr = track; st = 0; bar = 0; nextStep = now + .2f; }
}
void tone(float f, float d, int wave, float v) { qNote(0, d, f, wave, v * 1.4f, 0, wave == W_NOISE); }
void jingle(const int *ns, int n, float sp, int wave) { for (int i = 0; i < n; i++) if (ns[i]) qNote(i * sp, sp * 1.8f, mtof(ns[i]), wave, .05f, 0, 0); }
void whoosh(void) { qNote(0, .3f, 1200, 0, .07f, 0, 1); }

void auInit(void) { soundEnable(); auOk = true; }
void auExit(void) { for (int i = 0; i < NLV; i++) soundKill(LV[i].id); NLV = 0; auOk = false; }
void auTick(float dt) {
	if (!auOk) return;
	now += dt;
	// musica: passi da 1/16 (o 1/12)
	if (curTr >= 0 && MUS_ON && VOL_MUS > .01f) {
		const Track *T = &TRK[curTr];
		float step = 60.f / T->bpm / (T->spb / 4.f);
		while (nextStep <= now) { mstep(T, st, bar, step); nextStep += step; if (++st >= T->spb) { st = 0; bar++; } }
	} else nextStep = now;
	// note arrivate: canali PSG (8-13) e rumore (14-15)
	for (int i = 0; i < NQ;) {
		Note *n = &Q[i];
		if (n->at > now) { i++; continue; }
		int id = n->noise ? soundPlayNoise((u16)clampi((int)n->freq, 100, 30000), n->vol, 64) : soundPlayPSG((DutyCycle)n->duty, (u16)clampi((int)n->freq, 30, 30000), n->vol, 64);
		if (id >= 0 && NLV < 16) LV[NLV++] = (Live){id, now + n->dur, n->mus};
		else if (id >= 0) soundKill(id);
		Q[i] = Q[--NQ];
	}
	for (int i = 0; i < NLV;) { if (LV[i].end <= now) { soundKill(LV[i].id); LV[i] = LV[--NLV]; } else i++; }
}
