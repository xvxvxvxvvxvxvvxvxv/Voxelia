// Voxelia PS4 (motore dei port 3DS e Vita) - audio: le musiche e gli effetti del gioco originale, sintetizzati sul momento.
// Il sequencer delle musiche (scritte e procedurali) è in music.c, comune al port DS; qui c'è il sintetizzatore,
// che fa ciò che fa il Web Audio nel browser: strumenti a due oscillatori con filtro passa-basso, vibrato e
// inviluppi (rampe lineari ed esponenziali, avvicinamento al valore di tenuta), batteria con rumore filtrato e
// casse che scendono di frequenza, e un riverbero (Schroeder) al posto della convoluzione di 2,6 secondi.
// PS4: un thread a parte riempie la porta audio principale (sceAudioOut) a 48 kHz; nella build di prova per PC
// la stessa funzione auRender() la chiama SDL. Nessun file audio, come nel gioco per browser.
#include "voxelia.h"

#define SR 48000   // la PS4 suona a 48 kHz (anche la build per PC)
#define RVK (SR / 22050)   // il riverbero era tarato a 22050 Hz: stesse durate in secondi
#define MAXV 96

float VOL_MUS = .5f, VOL_SFX = .7f;
bool MUS_ON = true;
static bool auOk = false;
static plMutex auLock;
static s64 sampleT = 0;

/* ---------------- voci ---------------- */
enum { SEG_LIN, SEG_EXP, SEG_TGT };
typedef struct { int n; float to; u8 mode; float tau; } Seg;
enum { F_NONE, F_LP, F_HP, F_BP };
typedef struct {
	u8 on, mus, rv, noise, w1, w2, ft;
	s64 start; int pos, len;
	float ph1, ph2, inc1, inc2, g2;
	float sweepK; int sweepN;              // discesa di frequenza (casse, tom)
	float vibD, vibPh, vibR;               // vibrato: profondità relativa raggiunta in vibR campioni
	float fc, fcK; int fcN; float fa, lp1, lp2, hpA, hx, hy, bpG;   // filtro
	float fsw[3]; int fswN[2];              // spazzata del passa-banda (sega, onde)
	float g, k; int seg, segPos, nseg; Seg S[4];
} Voice;
static Voice V[MAXV];
static u32 nzS = 22222;
static float SINT[1024];

static Voice *vAlloc(bool mus) {
	for (int i = 0; i < MAXV; i++) if (!V[i].on) return &V[i];
	// piena: si ruba la voce di musica più vecchia (gli effetti hanno la precedenza)
	int b = -1; for (int i = 0; i < MAXV; i++) if (V[i].mus && (b < 0 || V[i].pos > V[b].pos)) b = i;
	if (b < 0) { b = 0; for (int i = 1; i < MAXV; i++) if (V[i].pos > V[b].pos) b = i; }
	(void)mus; return &V[b];
}
static Voice *vNew(double t0, bool mus, float lenS) {
	Voice *v = vAlloc(mus); memset(v, 0, sizeof *v);
	v->on = 1; v->mus = mus; v->start = (s64)(t0 * SR); if (v->start < sampleT) v->start = sampleT;
	v->len = (int)(lenS * SR) + 2; v->sweepK = 1; v->fcK = 1;
	return v;
}
static void segAdd(Voice *v, float sec, float to, u8 mode) { if (v->nseg < 4) { int n = (int)(sec * SR); v->S[v->nseg++] = (Seg){n < 1 ? 1 : n, to, mode, 0}; } }
static void segTgt(Voice *v, float sec, float to, float tau) { if (v->nseg < 4) { int n = (int)(sec * SR); v->S[v->nseg++] = (Seg){n < 1 ? 1 : n, to, SEG_TGT, tau}; } }
static void segBegin(Voice *v) {
	if (v->seg >= v->nseg) return;
	Seg *s = &v->S[v->seg];
	if (s->mode == SEG_EXP) { float a = v->g > 1e-5f ? v->g : 1e-5f, b = s->to > 1e-5f ? s->to : 1e-5f; v->k = powf(b / a, 1.f / s->n); }
	else if (s->mode == SEG_LIN) v->k = (s->to - v->g) / s->n;
	else v->k = 1 - expf(-1.f / (s->tau * SR));
}
static inline float fcA(float fc) { if (fc > SR * .45f) fc = SR * .45f; return 1 - expf(-2 * PI_F * fc / SR); }
static inline float osc(u8 w, float p) {
	switch (w) {
	case W_SQUARE: return p < .5f ? 1 : -1;
	case W_TRIANGLE: return p < .5f ? 4 * p - 1 : 3 - 4 * p;
	case W_SAW: return 2 * p - 1;
	default: return SINT[(int)(p * 1024) & 1023];
	}
}
static inline float mtof(float m) { return 440.f * powf(2.f, (m - 69) / 12.f); }

/* ---------------- strumenti, note, batteria (come nel browser) ---------------- */
// ins() di 8_main.js
void synIns(double t0, float midi, float d, int k, float v, bool rv) {
	const InsDef *I = musIns(k);
	float f = mtof(midi), a = I->a > 0 ? I->a : .01f, end;
	bool pl = I->s == 0;
	if (pl) end = fmaxf(a + .03f, fminf(I->dec > 0 ? I->dec : .4f, d * 2.5f));
	else end = fmaxf(a + .01f, d) + (I->r > 0 ? I->r : .08f);
	Voice *x = vNew(t0, 1, end + .02f);
	x->rv = rv; x->w1 = I->w < 0 ? W_TRIANGLE : I->w;
	x->inc1 = f / SR;
	if (I->w2 >= 0) { x->w2 = I->w2 + 1; x->inc2 = f * (I->m2 > 0 ? I->m2 : 1) * powf(2.f, I->det / 1200.f) / SR; x->g2 = I->v2; }
	if (I->lp > 0) {
		x->ft = F_LP; x->fc = I->lp * (I->le ? 2 : 1); x->fa = fcA(x->fc);
		if (I->le) { float T = fminf(.5f, fmaxf(.05f, d)); x->fcN = (int)(T * SR); x->fcK = powf(.35f, 1.f / x->fcN); }
	}
	if (I->vib && d > .3f) { x->vibD = .006f; x->vibR = .3f * SR; }
	segAdd(x, a, v, SEG_LIN);
	if (pl) segAdd(x, end - a, .0001f, SEG_EXP);
	else { float sus = fmaxf(a + .01f, d); segTgt(x, sus - a, v * I->s, .09f); segAdd(x, end - sus, .0001f, SEG_EXP); }
	segBegin(x);
}
// note() di 1_core.js (brani procedurali)
void synNote(double t0, float midi, float d, int wave, float v, float att) {
	if (att < .002f) att = .002f;
	float dur = fmaxf(d, att + .02f);
	Voice *x = vNew(t0, 1, dur + .05f);
	x->w1 = wave; x->inc1 = mtof(midi) / SR;
	segAdd(x, att, v, SEG_LIN); segAdd(x, dur - att, .0001f, SEG_EXP); segBegin(x);
}
static Voice *kick(double t0, float v, float f0, float f1, float sw, float dec, bool mus, u8 wave) {
	Voice *x = vNew(t0, mus, dec + .03f);
	x->w1 = wave; x->inc1 = f0 / SR; x->sweepN = (int)(sw * SR); x->sweepK = powf(f1 / f0, 1.f / x->sweepN);
	x->g = v; segAdd(x, dec, .0001f, SEG_EXP); segBegin(x);
	return x;
}
static Voice *nz(double t0, float d, float v, float f, u8 type, bool mus) {
	Voice *x = vNew(t0, mus, d + .02f);
	x->noise = 1; x->ft = type; x->g = v;
	float rc = 1.f / (2 * PI_F * f), dts = 1.f / SR;
	x->hpA = rc / (rc + dts);
	if (type == F_LP) x->fa = fcA(f);
	if (type == F_BP) { x->fa = fcA(f * 1.6f); x->hpA = 1.f / (2 * PI_F * f * .6f); x->hpA = x->hpA / (x->hpA + dts); x->bpG = 2.5f; }
	segAdd(x, d, .0001f, SEG_EXP); segBegin(x);
	return x;
}
// drm() di 8_main.js; K, H, B, S sono la batteria dei brani procedurali (1_core.js)
void synDrum(double t0, char c, float v) {
	switch (c) {
	case 'x': case 'k': kick(t0, .21f * v, 130, 40, .12f, .2f, 1, W_SINE); break;
	case 'K': kick(t0, v, 130, 40, .12f, .2f, 1, W_SINE); break;
	case 's': nz(t0, .13f, .1f * v, 1900, F_BP, 1); kick(t0, .07f * v, 200, 120, .08f, .1f, 1, W_TRIANGLE); break;
	case 'h': nz(t0, .028f, .03f * v, 8500, F_HP, 1); break;
	case 'o': nz(t0, .16f, .026f * v, 7000, F_HP, 1); break;
	case 'r': nz(t0, .05f, .032f * v, 5500, F_BP, 1); break;
	case 't': kick(t0, .12f * v, 150, 80, .18f, .22f, 1, W_SINE); break;
	case 'T': { kick(t0, .2f * v, 82, 60, .6f, .8f, 1, W_SINE)->rv = 1; nz(t0, .08f, .04f * v, 400, F_LP, 1); break; }
	case 'c': for (int i = 0; i < 3; i++) nz(t0 + i * .011, .05f, .05f * v, 1500, F_BP, 1); break;
	case 'a': { static const float F[3][2] = {{1180, .05f}, {1760, .034f}, {2650, .02f}};
		for (int i = 0; i < 3; i++) { Voice *x = vNew(t0, 1, .37f); x->rv = 1; x->w1 = W_SINE; x->inc1 = F[i][0] / SR; x->g = F[i][1] * v; segAdd(x, .35f, .0001f, SEG_EXP); segBegin(x); }
		nz(t0, .02f, .05f * v, 6000, F_HP, 1); break; }
	case 'w': kick(t0, .09f * v, 1250, 1250, .07f, .07f, 1, W_TRIANGLE); break;
	case 'n': { Voice *x = nz(t0, .45f, 0, 900, F_BP, 1); x->nseg = 0; x->seg = 0; x->g = 0;
		segAdd(x, .05f, .05f * v, SEG_LIN); segAdd(x, .4f, .0001f, SEG_LIN); segBegin(x);
		x->fsw[0] = 900; x->fsw[1] = 2200; x->fsw[2] = 900; x->fswN[0] = (int)(.22f * SR); x->fswN[1] = (int)(.22f * SR); break; }
	case 'W': { Voice *x = nz(t0, 2.6f, 0, 500, F_LP, 1); x->rv = 1; x->nseg = 0; x->seg = 0; x->g = 0;
		segAdd(x, 1.1f, .045f * v, SEG_LIN); segAdd(x, 1.5f, .0001f, SEG_LIN); segBegin(x);
		x->fsw[0] = 500; x->fsw[1] = 900; x->fsw[2] = 400; x->fswN[0] = (int)(1.2f * SR); x->fswN[1] = (int)(1.2f * SR); break; }
	case 'H': nz(t0, .03f, v, 8000, F_HP, 1); break;
	case 'B': nz(t0, .08f, v, 3000, F_BP, 1); break;
	case 'S': nz(t0, .12f, v, 1800, F_BP, 1); break;
	}
}
void synStopMusic(void) { for (int i = 0; i < MAXV; i++) if (V[i].mus) V[i].on = 0; }

/* ---------------- riverbero (Schroeder: 4 pettini e 2 passa-tutto, coda di circa 2,6 s) ---------------- */
#define NCB 4
static const int CBL[NCB] = {778 * RVK, 808 * RVK, 745 * RVK, 711 * RVK}, APL[2] = {278 * RVK, 112 * RVK};
static float CB[NCB][808 * RVK], AP[2][278 * RVK], cbS[NCB], cbG[NCB];
static int cbP[NCB], apP[2];
static void rvInit(void) { for (int i = 0; i < NCB; i++) cbG[i] = powf(10.f, -3.f * CBL[i] / (2.6f * SR)); }
static inline float reverb(float x) {
	float o = 0;
	for (int i = 0; i < NCB; i++) {
		float y = CB[i][cbP[i]];
		cbS[i] = y * .75f + cbS[i] * .25f;   // smorzamento degli acuti
		CB[i][cbP[i]] = x + cbS[i] * cbG[i];
		if (++cbP[i] >= CBL[i]) cbP[i] = 0;
		o += y;
	}
	o *= .25f;
	for (int i = 0; i < 2; i++) { float b = AP[i][apP[i]], y = -o + b; AP[i][apP[i]] = o + b * .5f; if (++apP[i] >= APL[i]) apP[i] = 0; o = y; }
	return o;
}

/* ---------------- sintesi ---------------- */
// n campioni stereo (a coppie sinistra/destra) nel buffer out
void auRender(s16 *out, int n) {
	if (!auOk) { memset(out, 0, n * 4); return; }
	plMutexLock(&auLock);
	double now = (double)sampleT / SR;
	musAdvance(now, (double)n / SR + .03);
	float mv = MUS_ON ? VOL_MUS : 0, sv = VOL_SFX;
	// solo le voci accese: durante il buffer non se ne aggiungono (il lucchetto è nostro), al massimo si spengono
	Voice *act[MAXV]; int na = 0;
	for (int k = 0; k < MAXV; k++) if (V[k].on && V[k].start < sampleT + n) act[na++] = &V[k];
	for (int i = 0; i < n; i++) {
		float fade = musFade((double)sampleT / SR);
		float sm = 0, ss = 0, srv = 0;
		for (int k = 0; k < na; k++) {
			Voice *v = act[k];
			if (!v->on || sampleT < v->start) continue;
			// inviluppo
			if (v->seg < v->nseg) {
				Seg *s = &v->S[v->seg];
				if (s->mode == SEG_EXP) v->g *= v->k; else if (s->mode == SEG_LIN) v->g += v->k; else v->g += (s->to - v->g) * v->k;
				if (++v->segPos >= s->n) { if (s->mode != SEG_TGT) v->g = s->to; v->seg++; v->segPos = 0; segBegin(v); }
			}
			float x;
			if (v->noise) {
				nzS ^= nzS << 13; nzS ^= nzS >> 17; nzS ^= nzS << 5;
				x = (float)(s32)nzS / 2147483648.f;
				if (v->fswN[0]) {   // spazzata del filtro (8 campioni alla volta)
					if ((v->pos & 7) == 0) {
						float f = v->pos < v->fswN[0] ? v->fsw[0] + (v->fsw[1] - v->fsw[0]) * v->pos / v->fswN[0] : v->fsw[1] + (v->fsw[2] - v->fsw[1]) * fminf(1, (float)(v->pos - v->fswN[0]) / v->fswN[1]);
						v->fa = fcA(v->ft == F_BP ? f * 1.6f : f);
						if (v->ft == F_BP) { float rc = 1.f / (2 * PI_F * f * .6f); v->hpA = rc / (rc + 1.f / SR); }
					}
				}
				if (v->ft == F_LP) { v->lp1 += v->fa * (x - v->lp1); x = v->lp1; }
				else if (v->ft == F_BP) { v->lp1 += v->fa * (x - v->lp1); float y = v->hpA * (v->hy + v->lp1 - v->hx); v->hx = v->lp1; v->hy = y; x = y * v->bpG; }
				else if (v->ft == F_HP) { float y = v->hpA * (v->hy + x - v->hx); v->hx = x; v->hy = y; x = y; }
			} else {
				x = osc(v->w1, v->ph1);
				if (v->w2) x += osc(v->w2 - 1, v->ph2) * v->g2;
				float vf = 1;
				if (v->vibD > 0) { v->vibPh += 5.3f / SR; if (v->vibPh >= 1) v->vibPh -= 1; vf = 1 + SINT[(int)(v->vibPh * 1024) & 1023] * v->vibD * fminf(1, v->pos / v->vibR); }
				v->ph1 += v->inc1 * vf; if (v->ph1 >= 1) v->ph1 -= 1;
				if (v->w2) { v->ph2 += v->inc2 * vf; if (v->ph2 >= 1) v->ph2 -= 1; }
				if (v->sweepN > 0 && v->pos < v->sweepN) v->inc1 *= v->sweepK;
				if (v->ft == F_LP) {
					if (v->fcN > 0 && v->pos < v->fcN && (v->pos & 15) == 0) { v->fc *= powf(v->fcK, 16); v->fa = fcA(v->fc); }
					v->lp1 += v->fa * (x - v->lp1); v->lp2 += v->fa * (v->lp1 - v->lp2); x = v->lp2;
				}
			}
			float s = x * v->g;
			if (v->mus) { sm += s; if (v->rv) srv += s; } else ss += s;
			if (++v->pos >= v->len) v->on = 0;
		}
		float wet = reverb(srv) * .3f;
		float o = ((sm + wet) * mv * fade + ss * sv) * 2.2f;
		if (o > 1) o = 1; if (o < -1) o = -1;
		out[2 * i] = out[2 * i + 1] = (s16)(o * 32000);
		sampleT++;
	}
	plMutexUnlock(&auLock);
}

/* ---------------- effetti sonori del gioco ---------------- */
void tone(float f, float d, int wave, float v) {
	if (!auOk) return;
	plMutexLock(&auLock);
	if (wave == W_NOISE) nz((double)sampleT / SR, d, v, 3000, F_BP, 0);
	else { Voice *x = vNew((double)sampleT / SR, 0, d + .02f); x->w1 = wave; x->inc1 = f / SR; x->g = v; segAdd(x, d, .0001f, SEG_EXP); segBegin(x); }
	plMutexUnlock(&auLock);
}
void jingle(const int *ns, int n, float sp, int wave) {
	if (!auOk) return;
	plMutexLock(&auLock);
	double t = (double)sampleT / SR;
	for (int i = 0; i < n; i++) if (ns[i]) { Voice *x = vNew(t + i * sp, 0, sp * 1.8f + .05f); x->w1 = wave; x->inc1 = mtof(ns[i]) / SR; segAdd(x, .01f, .05f, SEG_LIN); segAdd(x, sp * 1.8f - .01f, .0001f, SEG_EXP); segBegin(x); }
	plMutexUnlock(&auLock);
}
void whoosh(void) {
	if (!auOk) return;
	plMutexLock(&auLock);
	nz((double)sampleT / SR, .35f, .08f, 900, F_BP, 0);
	plMutexUnlock(&auLock);
}
void music(int track) {
	if (!auOk) { musicSet(track); return; }
	plMutexLock(&auLock); musicSet(track); plMutexUnlock(&auLock);
}

void auInit(void) {
	for (int i = 0; i < 1024; i++) SINT[i] = sinf(i * 2 * PI_F / 1024);
	rvInit();
	musInit(DATA_DIR "music.json");
	VOL_MUS = SET.mu; VOL_SFX = SET.sf; MUS_ON = SET.muOn;
	plMutexInit(&auLock);
	auOk = true;
	// la porta audio della console (o di SDL) chiama auRender() da un thread suo
	if (!plAudioStart(SR)) auOk = false;
}
void auExit(void) {
	if (!auOk) return;
	plAudioStop();
	auOk = false;
}
