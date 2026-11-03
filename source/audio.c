// Voxelia DS - audio sui canali PSG del DS (6 onde quadre e 2 di rumore), con la stessa musica procedurale e gli
// stessi suoni del port 3DS: stessi brani, scale, accordi, melodia seminata, basso, arpeggi, pad e batteria.
// Come il sintetizzatore del 3DS (e le rampe Web Audio del browser), ogni nota ha un attacco e un decadimento
// esponenziale: qui il volume del canale si aggiorna a ogni fotogramma, e la cassa scende di frequenza.
// Nota: il PSG del DS genera onde di 8 passi, quindi per una nota di frequenza F il timer va impostato a 8*F.
#include "voxelia.h"

float VOL_MUS = .5f, VOL_SFX = .7f;
bool MUS_ON = true;
static bool auOk = false;

// livello: ampiezza del sintetizzatore 3DS (0..1) -> volume del canale PSG (0..127)
#define AMP 520.f
typedef struct { float at, dur, freq, vol, att, sweep; u8 wave, noise, mus; } Note;
#define MAXN_Q 64
static Note Q[MAXN_Q]; static int NQ = 0;
typedef struct { int id; float t, end, g, peak, att, k, f, sweepK; u8 mus, noise; } Live;
static Live LV[16]; static int NLV = 0;
static float now = 0;

static float mtof(float m) { return 440.f * powf(2.f, (m - 69) / 12.f); }
static void qAdd(float delay, float dur, float freq, int wave, float vol, float att, bool mus, bool noise, float sweep) {
	if (!auOk || NQ >= MAXN_Q) return;
	Q[NQ++] = (Note){now + delay, dur, freq, vol, att, sweep, (u8)wave, noise, mus};
}
// nota come vNote() del 3DS: attacco lineare, poi decadimento fino a 0,0001
static void vNote(float freq, float delay, float dur, int wave, float vol, float att, bool mus) { qAdd(delay, dur, freq, wave, vol, att, mus, 0, 1); }
// cassa come vKick() del 3DS: sinusoide da 130 a 40 Hz in 0,12 s, decadimento in 0,2 s
static void vKick(float delay, float vol) { qAdd(delay, .2f, 130, W_SINE, vol, 0, 1, 0, 40.f / 130.f); }
// rumore come vNoise() del 3DS (piatti e rullante)
static void vNoise(float delay, float dur, float vol, float freq, bool mus) { qAdd(delay, dur, freq, W_NOISE, vol, 0, mus, 1, 1); }

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
static int curTr = -1, wantTr = -1, st = 0, bar = 0;
static float nextStep = 0;
static u32 hsS(const char *s) { u32 h = 2166136261u; for (; *s; s++) h = (h ^ (u8)*s) * 16777619u; return h; }
static float mb(u32 *a) {
	*a += 0x6D2B79F5u; u32 t = *a;
	t = (t ^ (t >> 15)) * (1u | t);
	t = (t + ((t ^ (t >> 7)) * (61u | t))) ^ t;
	return (float)((t ^ (t >> 14)) >> 8) / 16777216.f;
}
static int midN(const Track *T, int k) { int m = ((k % 7) + 7) % 7; return T->root + T->sc[m] + 12 * (int)floorf(k / 7.f); }
// un passo da 1/16, identico a mstep() del port 3DS
static void mstep(const Track *T, int s, int b, float dt) {
	int spb = T->spb, deg = T->pr[b % T->npr];
#define CN(i) midN(T, deg + (i) * 2)
	if (T->pad && s == 0) for (int i = 0; i < 3; i++) vNote(mtof(CN(i) + 12), 0, dt * spb * .98f, W_SINE, .018f, .25f, 1);
	for (int i = 0; i < T->nbs; i++) if (T->bs[i] == s) vNote(mtof(CN(0) - 12), 0, dt * (spb == 12 ? 4 : 3), W_TRIANGLE, .09f, .01f, 1);
	if (T->waltz && (s == 4 || s == 8)) for (int i = 0; i < 3; i++) vNote(mtof(CN(i)), 0, dt * 2, W_TRIANGLE, .022f, .01f, 1);
	if (T->arp && s % 2 == 0) vNote(mtof(CN((s >> 1) % 3) + 24), 0, dt * 1.6f, W_TRIANGLE, .016f, .01f, 1);
	if (s % 2 == 0) {
		u32 r = hsS(T->name) + (b % 4) * 977 + ((b >> 2) & 1) * 7919 + s * 131;
		float a = mb(&r), c = mb(&r), e = mb(&r);
		if (a < T->dn && !(b % 8 == 7 && s >= spb / 2)) {
			int k = s % 4 == 0 ? deg + 2 * (int)floorf(c * 3) : deg + (int)floorf(c * 7) - 1;
			vNote(mtof(midN(T, k) + 12), 0, dt * (2 + (int)floorf(e * 3)), T->ld, (T->ld == W_SQUARE || T->ld == W_SAW) ? .02f : .045f, .01f, 1);
		}
	}
	if (T->dr == 1) { if (s == 0 || s == 8) vKick(0, .16f); if (s % 4 == 2) vNoise(0, .03f, .03f, 8000, 1); }
	else if (T->dr == 2) { if (s == 0) vKick(0, .2f); if (s == 10 && b % 2) vKick(0, .12f); if (s == 6) vNoise(0, .08f, .025f, 3000, 1); }
	else if (T->dr == 3) { if (s == 0 || s == 8 || s == 10) vKick(0, .24f); if (s == 4 || s == 12) vNoise(0, .12f, .09f, 1800, 1); if (s % 2 == 0) vNoise(0, .03f, .035f, 8000, 1); }
}
static void killMusic(void) {
	for (int i = 0; i < NLV;) { if (LV[i].mus) { soundKill(LV[i].id); LV[i] = LV[--NLV]; } else i++; }
	for (int i = 0; i < NQ;) { if (Q[i].mus) Q[i] = Q[--NQ]; else i++; }
}
void music(int track) {
	VOL_MUS = SET.mu; VOL_SFX = SET.sf; MUS_ON = SET.muOn;
	if (track != wantTr) { wantTr = track; killMusic(); curTr = track; st = 0; bar = 0; nextStep = now + .3f; }
}
void tone(float f, float d, int wave, float v) { qAdd(0, d, f, wave, v, .002f, 0, wave == W_NOISE, 1); }
void jingle(const int *ns, int n, float sp, int wave) { for (int i = 0; i < n; i++) if (ns[i]) vNote(mtof(ns[i]), i * sp, sp * 1.8f, wave, .05f, .01f, 0); }
void whoosh(void) { vNoise(0, .35f, .08f, 900, 0); }

void auInit(void) { soundEnable(); auOk = true; }
void auExit(void) { for (int i = 0; i < NLV; i++) soundKill(LV[i].id); NLV = 0; auOk = false; }

// onde: il PSG ha solo onde quadre; le forme morbide (seno, triangolo) usano la quadra più piena e più piano
static DutyCycle dutyOf(int w) { return w == W_SAW ? DutyCycle_25 : DutyCycle_50; }
static float waveGain(int w) { return w == W_SINE ? .55f : w == W_TRIANGLE ? .7f : 1; }
static void startNote(Note *n) {
	float mv = n->mus ? (MUS_ON ? VOL_MUS : 0) : VOL_SFX;
	float peak = n->vol * mv * waveGain(n->wave) * AMP;
	if (peak < .5f) return;
	if (peak > 127) peak = 127;
	int id;
	float f = n->freq;
	if (n->noise) id = soundPlayNoise((u16)clampi((int)(f * 4), 200, 65000), n->att > .003f ? 1 : (u8)peak, 64);   // rumore: timer più alto = fruscio più acuto
	else id = soundPlayPSG(dutyOf(n->wave), (u16)clampi((int)(f * 8), 64, 65000), n->att > .003f ? 1 : (u8)peak, 64);
	if (id < 0) return;
	if (NLV >= 16) { soundKill(id); return; }
	// decadimento come sul 3DS: dal picco a 0,0001 (in ampiezza) nella durata della nota
	float dec = n->dur - n->att; if (dec < .02f) dec = .02f;
	float k = powf(.0001f / (n->vol > .0002f ? n->vol : .0002f), 1.f / (dec * 60));
	float sk = n->sweep != 1 ? powf(n->sweep, 1.f / (.12f * 60)) : 1;
	LV[NLV++] = (Live){id, 0, n->dur + .05f, n->att > .003f ? 0 : peak, peak, n->att, k, f, sk, n->mus, n->noise};
}
void auTick(float dt) {
	if (!auOk) return;
	now += dt;
	// musica: sedicesimi, come sul 3DS (60 / bpm / 4)
	if (curTr >= 0 && MUS_ON && VOL_MUS > .01f) {
		const Track *T = &TRK[curTr];
		float step = 60.f / T->bpm / 4;
		while (nextStep <= now) { mstep(T, st, bar, step); nextStep += step; if (++st >= T->spb) { st = 0; bar++; } }
	} else nextStep = now;
	// note arrivate
	for (int i = 0; i < NQ;) {
		if (Q[i].at > now) { i++; continue; }
		startNote(&Q[i]);
		Q[i] = Q[--NQ];
	}
	// inviluppo e discesa di frequenza, a ogni fotogramma
	float fr = dt * 60;
	for (int i = 0; i < NLV;) {
		Live *l = &LV[i];
		l->t += dt;
		if (l->t >= l->end) { soundKill(l->id); LV[i] = LV[--NLV]; continue; }
		if (l->t < l->att) l->g = l->peak * (l->t / l->att);
		else l->g *= powf(l->k, fr);
		soundSetVolume(l->id, (u8)clampi((int)l->g, 0, 127));
		if (l->sweepK != 1 && l->t < .12f) { l->f *= powf(l->sweepK, fr); soundSetFreq(l->id, (u16)clampi((int)(l->f * 8), 64, 65000)); }
		i++;
	}
}
