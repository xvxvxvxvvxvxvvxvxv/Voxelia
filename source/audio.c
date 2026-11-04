// Voxelia DS - audio: le musiche e gli effetti del gioco originale sui 16 canali del DS.
// Il sequencer (musiche scritte e procedurali, come nel browser) è music.c, comune al port 3DS. Qui ogni nota
// diventa un canale che suona in loop una tabella d'onda (seno, triangolo, dente di sega, quadra): il filtro
// passa-basso degli strumenti si imita scegliendo una tabella con meno armoniche, il secondo oscillatore usa un
// altro canale quando ce n'è uno libero. Inviluppi (rampe lineari ed esponenziali, tenuta), vibrato e discese di
// frequenza si aggiornano a ogni fotogramma; la batteria usa rumore campionato. Manca solo il riverbero.
#include "voxelia.h"

float VOL_MUS = .5f, VOL_SFX = .7f;
bool MUS_ON = true;
static bool auOk = false;
static double now = 0;

/* ---------------- tabelle d'onda (8 bit, nella RAM principale, viste dall'ARM7) ---------------- */
#define NH 9
static const u8 HARM[NH] = {1, 2, 3, 4, 6, 8, 12, 16, 24};
static s8 T64[4][NH][64] __attribute__((aligned(32)));   // [onda][armoniche]
static s8 T16[4][NH][16] __attribute__((aligned(32)));
static s8 NOISE[8192] __attribute__((aligned(32)));
static void tabMake(s8 *t, int L, int w, int h) {
	float b[64], mx = 0;
	for (int i = 0; i < L; i++) {
		float p = (float)i / L, v = 0;
		if (w == W_SINE) v = sinf(2 * PI_F * p);
		else if (w == W_TRIANGLE) v = p < .5f ? 4 * p - 1 : 3 - 4 * p;
		else for (int k = 1; k <= h && k < L / 2; k++) {
			if (w == W_SAW) v += sinf(2 * PI_F * k * p) / k * (k & 1 ? 1 : -1);
			else if (k & 1) v += sinf(2 * PI_F * k * p) / k;
		}
		b[i] = v; if (fabsf(v) > mx) mx = fabsf(v);
	}
	for (int i = 0; i < L; i++) t[i] = (s8)lroundf(b[i] / (mx > 0 ? mx : 1) * 120);
}
static int widx(int w) { return w == W_SQUARE ? 0 : w == W_TRIANGLE ? 1 : w == W_SAW ? 2 : 3; }
static const s8 *table(int w, float f, float lp, int *len) {
	int h = NH - 1;
	if (w == W_SAW || w == W_SQUARE) { int want = lp > 0 ? (int)(lp / f) : 24; for (h = 0; h < NH - 1 && HARM[h + 1] <= want; h++); }
	int wi = widx(w);
	if (f * 64 < 65000) { *len = 64; return T64[wi][h]; }
	*len = 16; return T16[wi][h];
}

/* ---------------- voci ---------------- */
enum { SEG_LIN, SEG_EXP, SEG_TGT };
typedef struct { float n, to, tau; u8 mode; } Seg;
typedef struct {
	u8 on, mus, noise, playing;
	int id, id2; double t0; float t, len;
	const s8 *tab; int L; float f, f2, g2; s8 w2;
	float sweepK, sweepT, vibD;
	float rate, rsw[3], rswT[2];          // rumore: velocità (al posto del filtro) e sua spazzata
	float g, k; int seg, nseg; float segT; Seg S[4];
} Voice;
#define MAXV 40
static Voice V[MAXV];
static Voice *vNew(double t0, bool mus, float len) {
	Voice *v = NULL;
	for (int i = 0; i < MAXV; i++) if (!V[i].on) { v = &V[i]; break; }
	if (!v) return NULL;
	memset(v, 0, sizeof *v);
	v->on = 1; v->mus = mus; v->t0 = t0 < now ? now : t0; v->len = len; v->id = v->id2 = -1; v->sweepK = 1;
	return v;
}
static void segAdd(Voice *v, float sec, float to, u8 mode) { if (v->nseg < 4) v->S[v->nseg++] = (Seg){sec < .001f ? .001f : sec, to, 0, mode}; }
static void segTgt(Voice *v, float sec, float to, float tau) { if (v->nseg < 4) v->S[v->nseg++] = (Seg){sec < .001f ? .001f : sec, to, tau, SEG_TGT}; }
static inline float mtof(float m) { return 440.f * powf(2.f, (m - 69) / 12.f); }

// ins() del browser
void synIns(double t0, float midi, float d, int k, float v, bool rv) {
	(void)rv;
	const InsDef *I = musIns(k);
	float f = mtof(midi), a = I->a > 0 ? I->a : .01f, end;
	bool pl = I->s == 0;
	if (pl) end = fmaxf(a + .03f, fminf(I->dec > 0 ? I->dec : .4f, d * 2.5f));
	else end = fmaxf(a + .01f, d) + (I->r > 0 ? I->r : .08f);
	Voice *x = vNew(t0, 1, end + .02f); if (!x) return;
	int w = I->w < 0 ? W_TRIANGLE : I->w;
	x->f = f; x->tab = table(w, f, I->lp, &x->L);
	if (I->w2 >= 0 && I->v2 >= .2f) { x->f2 = f * (I->m2 > 0 ? I->m2 : 1) * powf(2.f, I->det / 1200.f); x->g2 = I->v2; x->w2 = I->w2; }
	if (I->vib && d > .3f) x->vibD = .006f;
	segAdd(x, a, v, SEG_LIN);
	if (pl) segAdd(x, end - a, .0001f, SEG_EXP);
	else { float sus = fmaxf(a + .01f, d); segTgt(x, sus - a, v * I->s, .09f); segAdd(x, end - sus, .0001f, SEG_EXP); }
}
// note() del browser (brani procedurali)
void synNote(double t0, float midi, float d, int wave, float v, float att) {
	if (att < .002f) att = .002f;
	float dur = fmaxf(d, att + .02f);
	Voice *x = vNew(t0, 1, dur + .05f); if (!x) return;
	x->f = mtof(midi); x->tab = table(wave, x->f, 0, &x->L);
	segAdd(x, att, v, SEG_LIN); segAdd(x, dur - att, .0001f, SEG_EXP);
}
static Voice *kick(double t0, float v, float f0, float f1, float sw, float dec, bool mus, int wave) {
	Voice *x = vNew(t0, mus, dec + .03f); if (!x) return NULL;
	x->f = f0; x->tab = table(wave, f0, 0, &x->L); x->sweepT = sw; x->sweepK = logf(f1 / f0) / sw;
	x->g = v; segAdd(x, dec, .0001f, SEG_EXP);
	return x;
}
// rumore filtrato: la velocità del campione fa da filtro (più veloce = più acuto)
static float nzRate(float f, char type) { return type == 'h' ? fminf(32000, f * 3.5f) : type == 'l' ? f * 2.5f : f * 3.f; }
static Voice *nz(double t0, float d, float v, float f, char type, bool mus) {
	Voice *x = vNew(t0, mus, d + .02f); if (!x) return NULL;
	x->noise = 1; x->rate = nzRate(f, type); x->g = v * (type == 'h' ? 1.4f : 1.f);
	segAdd(x, d, .0001f, SEG_EXP);
	return x;
}
// drm() del browser; K, H, B, S sono la batteria dei brani procedurali
void synDrum(double t0, char c, float v) {
	switch (c) {
	case 'x': case 'k': kick(t0, .21f * v, 130, 40, .12f, .2f, 1, W_SINE); break;
	case 'K': kick(t0, v, 130, 40, .12f, .2f, 1, W_SINE); break;
	case 's': nz(t0, .13f, .1f * v, 1900, 'b', 1); kick(t0, .07f * v, 200, 120, .08f, .1f, 1, W_TRIANGLE); break;
	case 'h': nz(t0, .028f, .03f * v, 8500, 'h', 1); break;
	case 'o': nz(t0, .16f, .026f * v, 7000, 'h', 1); break;
	case 'r': nz(t0, .05f, .032f * v, 5500, 'b', 1); break;
	case 't': kick(t0, .12f * v, 150, 80, .18f, .22f, 1, W_SINE); break;
	case 'T': kick(t0, .2f * v, 82, 60, .6f, .8f, 1, W_SINE); nz(t0, .08f, .04f * v, 400, 'l', 1); break;
	case 'c': for (int i = 0; i < 3; i++) nz(t0 + i * .011, .05f, .05f * v, 1500, 'b', 1); break;
	case 'a': { static const float F[3][2] = {{1180, .05f}, {1760, .034f}, {2650, .02f}};
		for (int i = 0; i < 3; i++) kick(t0, F[i][1] * v, F[i][0], F[i][0], .35f, .35f, 1, W_SINE);
		nz(t0, .02f, .05f * v, 6000, 'h', 1); break; }
	case 'w': kick(t0, .09f * v, 1250, 1250, .07f, .07f, 1, W_TRIANGLE); break;
	case 'n': { Voice *x = nz(t0, .45f, 0, 900, 'b', 1); if (!x) break; x->nseg = 0; x->g = 0;
		segAdd(x, .05f, .05f * v, SEG_LIN); segAdd(x, .4f, .0001f, SEG_LIN);
		x->rsw[0] = nzRate(900, 'b'); x->rsw[1] = nzRate(2200, 'b'); x->rsw[2] = nzRate(900, 'b'); x->rswT[0] = x->rswT[1] = .22f; break; }
	case 'W': { Voice *x = nz(t0, 2.6f, 0, 500, 'l', 1); if (!x) break; x->nseg = 0; x->g = 0;
		segAdd(x, 1.1f, .045f * v, SEG_LIN); segAdd(x, 1.5f, .0001f, SEG_LIN);
		x->rsw[0] = nzRate(500, 'l'); x->rsw[1] = nzRate(900, 'l'); x->rsw[2] = nzRate(400, 'l'); x->rswT[0] = x->rswT[1] = 1.2f; break; }
	case 'H': nz(t0, .03f, v, 8000, 'h', 1); break;
	case 'B': nz(t0, .08f, v, 3000, 'b', 1); break;
	case 'S': nz(t0, .12f, v, 1800, 'b', 1); break;
	}
}
static void vKill(Voice *v) { if (v->id >= 0) soundKill(v->id); if (v->id2 >= 0) soundKill(v->id2); v->on = 0; }
void synStopMusic(void) { for (int i = 0; i < MAXV; i++) if (V[i].on && V[i].mus) vKill(&V[i]); }

/* ---------------- effetti sonori del gioco ---------------- */
void tone(float f, float d, int wave, float v) {
	if (wave == W_NOISE) { nz(now, d, v, 3000, 'b', 0); return; }
	Voice *x = vNew(now, 0, d + .02f); if (!x) return;
	x->f = f; x->tab = table(wave, f, 0, &x->L); x->g = v; segAdd(x, d, .0001f, SEG_EXP);
}
void jingle(const int *ns, int n, float sp, int wave) {
	for (int i = 0; i < n; i++) if (ns[i]) {
		Voice *x = vNew(now + i * sp, 0, sp * 1.8f + .05f); if (!x) return;
		x->f = mtof(ns[i]); x->tab = table(wave, x->f, 0, &x->L);
		segAdd(x, .01f, .05f, SEG_LIN); segAdd(x, sp * 1.8f - .01f, .0001f, SEG_EXP);
	}
}
void whoosh(void) { nz(now, .35f, .08f, 900, 'b', 0); }
void music(int track) { musicSet(track); }

void auInit(void) {
	soundEnable();
	for (int w = 0; w < 4; w++) for (int h = 0; h < NH; h++) {
		int wv = w == 0 ? W_SQUARE : w == 1 ? W_TRIANGLE : w == 2 ? W_SAW : W_SINE;
		tabMake(T64[w][h], 64, wv, HARM[h]); tabMake(T16[w][h], 16, wv, HARM[h] < 7 ? HARM[h] : 7);
	}
	u32 r = 0x12345678; for (int i = 0; i < 8192; i++) { r ^= r << 13; r ^= r >> 17; r ^= r << 5; NOISE[i] = (s8)(r >> 24); }
	DC_FlushRange(T64, sizeof T64); DC_FlushRange(T16, sizeof T16); DC_FlushRange(NOISE, sizeof NOISE);
	musInit(DATADIR "music.json");
	auOk = true;
}
void auExit(void) { for (int i = 0; i < MAXV; i++) if (V[i].on) vKill(&V[i]); auOk = false; }

// volume: ampiezza del Web Audio -> volume del canale a 11 bit (0..2047, con il divisore del DS), così le code
// delle note piano sfumano senza scalini. Con la musica al 50% un'ampiezza A esce a 4·A del fondo scala.
#define KVOL 8188.f
static inline void chVol(int id, int v) { if (id >= 0) soundChSetVolume(id, (unsigned)clampi(v, 0, 2047)); }
static int startCh(const s8 *tab, int L, float rate, int vol) {
	int id = soundPlaySample(tab, SoundFormat_8Bit, L, (u16)clampi((int)rate, 64, 65000), 0, 64, true, 0);
	if (id < 0) {   // tutti i canali occupati: si libera la nota di musica più vecchia
		Voice *o = NULL; for (int i = 0; i < MAXV; i++) if (V[i].on && V[i].playing && V[i].mus && (!o || V[i].t > o->t)) o = &V[i];
		if (o) { vKill(o); id = soundPlaySample(tab, SoundFormat_8Bit, L, (u16)clampi((int)rate, 64, 65000), 0, 64, true, 0); }
	}
	chVol(id, vol);
	return id;
}
void auTick(float dt) {
	if (!auOk) return;
	now += dt;
	musAdvance(now, dt + .02);
	float fade = musFade(now), mv = (MUS_ON ? VOL_MUS : 0) * 2 * fade, sv = VOL_SFX * 1.4f;
	int freeCh = 0; for (int i = 0; i < MAXV; i++) if (V[i].on && V[i].playing) freeCh += 1 + (V[i].id2 >= 0); freeCh = 16 - freeCh;
	for (int i = 0; i < MAXV; i++) {
		Voice *v = &V[i];
		if (!v->on || now < v->t0) continue;
		float tt = (float)(now - v->t0);
		float step = tt - v->t; v->t = tt;
		// inviluppo, passo dopo passo come sul 3DS
		while (v->seg < v->nseg && step > 0) {
			Seg *s = &v->S[v->seg];
			float left = s->n - v->segT, h = step < left ? step : left;
			if (v->segT == 0 && s->mode == SEG_EXP) { float a = v->g > 1e-5f ? v->g : 1e-5f, b = s->to > 1e-5f ? s->to : 1e-5f; v->k = logf(b / a) / s->n; }
			if (v->segT == 0 && s->mode == SEG_LIN) v->k = (s->to - v->g) / s->n;
			if (s->mode == SEG_EXP) v->g *= expf(v->k * h); else if (s->mode == SEG_LIN) v->g += v->k * h; else v->g = s->to + (v->g - s->to) * expf(-h / s->tau);
			v->segT += h; step -= h;
			if (v->segT >= s->n - 1e-4f) { if (s->mode != SEG_TGT) v->g = s->to; v->seg++; v->segT = 0; }
		}
		if (tt >= v->len) { vKill(v); continue; }
		float bus = v->mus ? mv : sv;
		int vol = (int)(v->g * KVOL * bus);
		// frequenza: discesa (casse) e vibrato
		float f = v->f;
		if (v->sweepT > 0) f = v->f * expf(v->sweepK * fminf(tt, v->sweepT));
		if (v->vibD > 0) f *= 1 + sinf(2 * PI_F * 5.3f * tt) * v->vibD * fminf(1, tt / .3f);
		float rate = v->noise ? v->rate : f * v->L;
		if (v->noise && v->rswT[0] > 0) rate = tt < v->rswT[0] ? v->rsw[0] + (v->rsw[1] - v->rsw[0]) * tt / v->rswT[0] : v->rsw[1] + (v->rsw[2] - v->rsw[1]) * fminf(1, (tt - v->rswT[0]) / v->rswT[1]);
		if (!v->playing) {
			v->playing = 1;
			v->id = v->noise ? startCh(NOISE, 8192, rate, vol) : startCh(v->tab, v->L, rate, vol);
			if (v->id < 0) { v->on = 0; continue; }
			// secondo oscillatore, se c'è un canale libero (lasciandone qualcuno per gli effetti)
			if (v->f2 > 0 && freeCh > 4) { int L2; const s8 *t2 = table(v->w2, v->f2, 0, &L2); v->id2 = startCh(t2, L2, v->f2 * L2, (int)(vol * v->g2)); freeCh--; }
			freeCh--;
			continue;
		}
		chVol(v->id, vol);
		if (v->sweepT > 0 || v->vibD > 0 || v->rswT[0] > 0) soundSetFreq(v->id, (u16)clampi((int)rate, 64, 65000));
		if (v->id2 >= 0) chVol(v->id2, (int)(vol * v->g2));
	}
}
