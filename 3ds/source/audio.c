// Voxelia 3DS - audio: la musica procedurale e gli effetti dell'originale, sintetizzati sul momento.
// Un thread riempie i buffer del DSP (ndsp) con onde quadre, triangolari, a dente di sega,
// sinusoidi e rumore filtrato: nessun file audio, come nel gioco per browser.
#include "voxelia.h"

#define SR 22050
#define BUFN 1024
#define NBUF 4
#define MAXV 40

float VOL_MUS = .5f, VOL_SFX = .7f;
bool MUS_ON = true;
static bool auOk = false, auQuit = false;
static ndspWaveBuf wbuf[NBUF];
static s16 *abuf;
static Thread auThread;
static LightEvent auEv;
static LightLock auLock;

typedef struct {
	u8 on, wave, mus;
	float ph, inc, inc1, sweepK;
	float g, peak, att, attS, decayK;
	int delay, len, pos;
	float lp, lpA, hpA, x1, y1;   // filtro del rumore
	u8 band;
} Voice;
static Voice V[MAXV];
static u32 nzS = 22222;

static float mtof(float m) { return 440.f * powf(2.f, (m - 69) / 12.f); }
static Voice *vAlloc(void) {
	for (int i = 0; i < MAXV; i++) if (!V[i].on) return &V[i];
	// ruba la voce più vecchia
	int b = 0; for (int i = 1; i < MAXV; i++) if (V[i].pos > V[b].pos) b = i;
	return &V[b];
}
// nota con attacco lineare e decadimento esponenziale fino a 0,0001 (come le rampe Web Audio)
static void vNote(float freq, float delay, float dur, int wave, float vol, float att, bool mus) {
	Voice *v = vAlloc();
	memset(v, 0, sizeof *v);
	v->on = 1; v->wave = wave; v->mus = mus;
	v->inc = freq / SR; v->inc1 = v->inc; v->sweepK = 1;
	v->delay = (int)(delay * SR);
	if (att < .002f) att = .002f;
	if (dur < att + .02f) dur = att + .02f;
	v->attS = att * SR; v->peak = vol;
	v->len = (int)((dur + .05f) * SR);
	v->decayK = powf(.0001f / (vol > .0002f ? vol : .0002f), 1.f / ((dur - att) * SR));
	v->g = 0;
}
static void vKick(float delay, float vol) {
	Voice *v = vAlloc(); memset(v, 0, sizeof *v);
	v->on = 1; v->wave = W_SINE; v->mus = 1; v->delay = (int)(delay * SR);
	v->inc = 130.f / SR; v->sweepK = powf(40.f / 130.f, 1.f / (.12f * SR));
	v->attS = 1; v->peak = vol; v->g = vol; v->len = (int)(.22f * SR);
	v->decayK = powf(.0001f / vol, 1.f / (.2f * SR));
}
static void vNoise(float delay, float dur, float vol, float freq, bool band, bool mus) {
	Voice *v = vAlloc(); memset(v, 0, sizeof *v);
	v->on = 1; v->wave = W_NOISE; v->mus = mus; v->delay = (int)(delay * SR);
	v->attS = 1; v->peak = vol; v->g = vol; v->len = (int)((dur + .02f) * SR);
	v->decayK = powf(.0001f / vol, 1.f / (dur * SR));
	v->band = band;
	float fh = band ? freq * .6f : freq, fl = freq * 1.6f;
	float rc = 1.f / (2 * PI_F * fh), dts = 1.f / SR;
	v->hpA = rc / (rc + dts);                          // passa-alto a un polo
	v->lpA = 1 - expf(-2 * PI_F * fl / SR);           // passa-basso (solo per il passa-banda)
}

/* ---------------- i brani: tempo, tonica, scala, giro di accordi, solista, densità, batteria ---------------- */
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
// le zone della 7.50 indicano il brano per nome: si usano i temi procedurali più vicini
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
static double nextStep = 0, sampleT = 0;
static float fade = 1, fadeDir = 0;

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
	if (T->dr == 1) { if (s == 0 || s == 8) vKick(0, .16f); if (s % 4 == 2) vNoise(0, .03f, .03f, 8000, false, 1); }
	else if (T->dr == 2) { if (s == 0) vKick(0, .2f); if (s == 10 && b % 2) vKick(0, .12f); if (s == 6) vNoise(0, .08f, .025f, 3000, true, 1); }
	else if (T->dr == 3) { if (s == 0 || s == 8 || s == 10) vKick(0, .24f); if (s == 4 || s == 12) vNoise(0, .12f, .09f, 1800, true, 1); if (s % 2 == 0) vNoise(0, .03f, .035f, 8000, false, 1); }
}

/* ---------------- sintesi ---------------- */
static inline float osc(Voice *v) {
	float p = v->ph;
	switch (v->wave) {
	case W_SQUARE: return p < .5f ? 1 : -1;
	case W_TRIANGLE: return p < .5f ? 4 * p - 1 : 3 - 4 * p;
	case W_SAW: return 2 * p - 1;
	case W_SINE: return sinf(p * 2 * PI_F);
	default: {
		nzS ^= nzS << 13; nzS ^= nzS >> 17; nzS ^= nzS << 5;
		float x = (float)(s32)nzS / 2147483648.f;
		if (v->band) { v->lp += v->lpA * (x - v->lp); x = v->lp * 2.5f; }
		float y = v->hpA * (v->y1 + x - v->x1); v->x1 = x; v->y1 = y; return y;
	}
	}
}
static void render(s16 *out, int n) {
	LightLock_Lock(&auLock);
	float mv = MUS_ON ? VOL_MUS : 0, sv = VOL_SFX;
	const Track *T = curTr >= 0 ? &TRK[curTr] : NULL;
	float dt = T ? 60.f / T->bpm / 4 : .1f;
	for (int i = 0; i < n; i++) {
		if (T && sampleT >= nextStep) {
			mstep(T, st, bar, dt);
			nextStep += dt * SR;
			if (++st >= T->spb) { st = 0; bar++; }
		}
		sampleT += 1;
		if (fadeDir != 0) {
			fade += fadeDir / (SR * .5f);
			if (fade <= 0) {
				fade = 0; fadeDir = 1; curTr = wantTr; st = 0; bar = 0; nextStep = sampleT + 100;
				for (int k = 0; k < MAXV; k++) if (V[k].mus) V[k].on = 0;
				T = curTr >= 0 ? &TRK[curTr] : NULL; dt = T ? 60.f / T->bpm / 4 : .1f;
			} else if (fade >= 1) { fade = 1; fadeDir = 0; }
		}
		float sm = 0, ss = 0;
		for (int k = 0; k < MAXV; k++) {
			Voice *v = &V[k];
			if (!v->on) continue;
			if (v->delay > 0) { v->delay--; continue; }
			if (v->pos < v->attS) v->g = v->peak * (v->pos / v->attS); else v->g *= v->decayK;
			float s = osc(v) * v->g;
			if (v->wave != W_NOISE) { v->ph += v->inc; if (v->ph >= 1) v->ph -= 1; v->inc *= v->sweepK; }
			if (v->mus) sm += s; else ss += s;
			if (++v->pos >= v->len) v->on = 0;
		}
		float o = (sm * mv * fade + ss * sv) * 1.6f;
		if (o > 1) o = 1; if (o < -1) o = -1;
		out[i] = (s16)(o * 32000);
	}
	LightLock_Unlock(&auLock);
}
static void auCallback(void *d) { (void)d; LightEvent_Signal(&auEv); }
static void auLoop(void *arg) {
	(void)arg;
	while (!auQuit) {
		for (int i = 0; i < NBUF; i++) {
			if (wbuf[i].status == NDSP_WBUF_DONE) {
				render(wbuf[i].data_pcm16, BUFN);
				DSP_FlushDataCache(wbuf[i].data_pcm16, BUFN * 2);
				ndspChnWaveBufAdd(0, &wbuf[i]);
			}
		}
		LightEvent_Wait(&auEv);
	}
}

void auInit(void) {
	VOL_MUS = SET.mu; VOL_SFX = SET.sf; MUS_ON = SET.muOn;
	if (R_FAILED(ndspInit())) { auOk = false; return; }   // serve sdmc:/3ds/dspfirm.cdc
	auOk = true;
	LightLock_Init(&auLock);
	LightEvent_Init(&auEv, RESET_ONESHOT);
	ndspSetOutputMode(NDSP_OUTPUT_STEREO);
	ndspChnReset(0);
	ndspChnSetInterp(0, NDSP_INTERP_LINEAR);
	ndspChnSetRate(0, SR);
	ndspChnSetFormat(0, NDSP_FORMAT_MONO_PCM16);
	float mix[12] = {0}; mix[0] = mix[1] = 1;
	ndspChnSetMix(0, mix);
	abuf = linearAlloc(BUFN * NBUF * 2);
	memset(abuf, 0, BUFN * NBUF * 2);
	memset(wbuf, 0, sizeof wbuf);
	for (int i = 0; i < NBUF; i++) {
		wbuf[i].data_pcm16 = abuf + i * BUFN;
		wbuf[i].nsamples = BUFN;
		wbuf[i].status = NDSP_WBUF_DONE;
	}
	ndspSetCallback(auCallback, NULL);
	s32 prio = 0x30; svcGetThreadPriority(&prio, CUR_THREAD_HANDLE);
	auThread = threadCreate(auLoop, NULL, 16 * 1024, prio - 1, -2, false);
	LightEvent_Signal(&auEv);
}
void auExit(void) {
	if (!auOk) return;
	auQuit = true; LightEvent_Signal(&auEv);
	threadJoin(auThread, U64_MAX); threadFree(auThread);
	ndspChnReset(0); ndspExit(); linearFree(abuf);
	auOk = false;
}
void music(int track) {
	if (!auOk) return;
	LightLock_Lock(&auLock);
	if (wantTr != track) {
		wantTr = track;
		if (curTr < 0) { curTr = track; st = 0; bar = 0; nextStep = sampleT + 100; fade = 0; fadeDir = 1; }
		else fadeDir = -1;
	}
	VOL_MUS = SET.mu; VOL_SFX = SET.sf; MUS_ON = SET.muOn;
	LightLock_Unlock(&auLock);
}
void tone(float f, float d, int wave, float v) {
	if (!auOk) return;
	LightLock_Lock(&auLock);
	Voice *x = vAlloc(); memset(x, 0, sizeof *x);
	x->on = 1; x->wave = wave; x->mus = 0; x->inc = f / SR; x->sweepK = 1;
	x->attS = 1; x->peak = v; x->g = v; x->len = (int)((d + .02f) * SR);
	x->decayK = powf(.0001f / v, 1.f / (d * SR));
	LightLock_Unlock(&auLock);
}
void jingle(const int *ns, int n, float sp, int wave) {
	if (!auOk) return;
	LightLock_Lock(&auLock);
	for (int i = 0; i < n; i++) if (ns[i]) vNote(mtof(ns[i]), i * sp, sp * 1.8f, wave, .05f, .01f, 0);
	LightLock_Unlock(&auLock);
}
void whoosh(void) {
	if (!auOk) return;
	LightLock_Lock(&auLock);
	vNoise(0, .35f, .08f, 900, true, 0);
	LightLock_Unlock(&auLock);
}
