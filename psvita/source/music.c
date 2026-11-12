// Voxelia - musiche del gioco originale, comuni ai port 3DS e DS.
// romfs:/music.json (nitro:/music.json sul DS) arriva da tools/songs.js, che lo estrae dalla versione browser:
//  - le musiche scritte (6.8+): parti e forma, melodia nota per nota con l'eco, bassi, accompagnamenti, batterie;
//  - i brani ancora procedurali (dungeon, motel...), con i loro parametri.
// Qui c'è il sequencer del browser (songStep e mstep di 8_main.js e 1_core.js), passo per passo; la sintesi
// (strumenti, batteria, riverbero) è del port: synIns, synNote e synDrum in audio.c.
#include "voxelia.h"

#define MAXI 24
#define MAXT 96
enum { CP_PAD = 1, CP_ENS = 2, CP_ARP = 4, CP_BELL = 8, CP_DRONE = 16, CP_STRUM = 32, CP_STRUM6 = 64, CP_WALTZ = 128, CP_STAB = 256 };
typedef struct { s8 s, deg, len, acc; } MEv;
typedef struct { char k; char pat[20]; } DPat;
// battuta; nei brani «dinamici» (7.14) la parte può cambiare strumento, accompagnamento, basso, batteria,
// volume e tonalità, e aggiungere una seconda voce e un'armonia una terza sotto
typedef struct {
	s8 deg; u8 ne, ne2, dyn, hm; MEv *ev, *ev2;
	s16 ld, root, ld2; s32 cp; s8 echo, fill, ndr; float lv, dv, bv, hmv, lv2; char *bs; DPat *dr;
} MBar;
typedef struct {
	char name[20]; u8 sng; int bpm, root, spb; s8 sc[7];
	// scritti
	int ld; float lv, bv, dv; u8 echo, fill; char bs[24]; u16 cp; DPat dr[5]; int ndr; int nb; MBar *bars;
	// procedurali
	s8 pr[8]; int npr, pld; float dn; u8 pdr, arp, pad, waltz; s8 pbs[16]; int npbs;
} MTrack;
static InsDef INSD[MAXI]; static char INSN[MAXI][12]; static int NINS = 0;
static MTrack TR[MAXT]; static int NTR = 0;
static float SGV = .52f;
static char NIGHTZ[8][16]; static int NNZ = 0;
int MUS_MENU = -1, MUS_BOSS = -1, MUS_TOWN = -1, MUS_NOTTE = -1;

static int waveOf(const char *s) {
	if (!s) return -1;
	if (!strcmp(s, "sine")) return W_SINE; if (!strcmp(s, "triangle")) return W_TRIANGLE;
	if (!strcmp(s, "sawtooth")) return W_SAW; if (!strcmp(s, "square")) return W_SQUARE;
	return -1;
}
static int insIdx(const char *k) { for (int i = 0; i < NINS; i++) if (!strcmp(INSN[i], k)) return i; return 0; }
const InsDef *musIns(int i) { return &INSD[i >= 0 && i < NINS ? i : 0]; }
static void scaleOf(J *root, const char *k, s8 *out) {
	J *a = jget(jget(root, "scl"), k ? k : "maj");
	for (int i = 0; i < 7; i++) out[i] = (s8)jnum(jat(a, i), (int[]){0, 2, 4, 5, 7, 9, 11}[i]);
}

static JArena MA;
static u16 cpFlags(const char *cp) {
	static const char *CPN[9] = {"pad", "ens", "arp", "bell", "drone", "strum", "strum6", "waltz", "stab"};
	u16 f = 0; char tk[24]; const char *p = cp;
	while (p && *p) { int n = 0; while (*p == ' ') p++; while (*p && *p != ' ' && n < 23) tk[n++] = *p++; tk[n] = 0; for (int i = 0; i < 9; i++) if (!strcmp(tk, CPN[i])) f |= 1 << i; }
	return f;
}
static int drumsOf(J *DR, const char *name, DPat *out) {
	int n = 0; JFOR(c, jget(DR, name)) if (n < 5) { out[n].k = c->key[0]; snprintf(out[n].pat, 20, "%s", jstr(c, "")); n++; }
	return n;
}
// note di una battuta: "passo:grado:durata:alterazione" separate da spazi
static void evList(J *ev, MEv **out, u8 *n) {
	const char *s = jstr(ev, ""); int c = 0;
	for (const char *p = s; *p; p++) if (*p == ':') c++;
	c /= 3; *out = calloc(c ? c : 1, sizeof(MEv)); *n = 0;
	const char *p = s;
	while (*p && *n < c && *n < 255) {
		int a, d, l, x, used = 0;
		if (sscanf(p, "%d:%d:%d:%d%n", &a, &d, &l, &x, &used) != 4) break;
		(*out)[(*n)++] = (MEv){(s8)a, (s8)d, (s8)l, (s8)x};
		p += used; while (*p == ' ') p++;
	}
}
void musInit(const char *path) {
	FILE *f = fopen(path, "rb"); if (!f) return;
	fseek(f, 0, SEEK_END); long len = ftell(f); fseek(f, 0, SEEK_SET);
	char *txt = malloc(len + 1); if (!txt) { fclose(f); return; }
	fread(txt, 1, len, f); txt[len] = 0; fclose(f);
	jaInit(&MA, len * 6 + 65536);
	J *R = jParse(&MA, txt, len);
	free(txt);
	if (!R) return;
	SGV = jgn(R, "sgv", .52);
	JFOR(n, jget(R, "nightz")) if (NNZ < 8) snprintf(NIGHTZ[NNZ++], 16, "%s", jstr(n, ""));
	JFOR(i, jget(R, "ins")) {
		if (NINS >= MAXI) break;
		InsDef *d = &INSD[NINS]; snprintf(INSN[NINS++], 12, "%s", i->key);
		d->w = waveOf(jgs(i, "w", "triangle")); d->w2 = waveOf(jgs(i, "w2", NULL));
		d->m2 = jgn(i, "m2", 1); d->v2 = jgn(i, "v2", .5); d->det = jgn(i, "det", 0);
		d->a = jgn(i, "a", .01); d->s = jgn(i, "s", -1); d->dec = jgn(i, "dec", .4); d->lp = jgn(i, "lp", 0); d->r = jgn(i, "r", .08);
		d->le = jgn(i, "le", 0) != 0; d->vib = jgn(i, "vib", 0) != 0;
		if (d->s < 0) d->s = 1;   // senza "s" il browser tiene la nota (s undefined, quindi non 0)
	}
	J *BS = jget(R, "bass"), *DR = jget(R, "drums"), *CP = jget(R, "comp"); (void)CP;
	JFOR(t, jget(R, "songs")) {
		if (NTR >= MAXT) break;
		MTrack *T = &TR[NTR++]; memset(T, 0, sizeof *T);
		snprintf(T->name, sizeof T->name, "%s", t->key); T->sng = 1;
		T->bpm = (int)jgn(t, "bpm", 100); T->root = (int)jgn(t, "root", 60); T->spb = (int)jgn(t, "spb", 16);
		scaleOf(R, jgs(t, "sc", "maj"), T->sc);
		T->ld = insIdx(jgs(t, "ld", "pluck")); T->lv = jgn(t, "lv", .05); T->bv = jgn(t, "bv", .09); T->dv = jgn(t, "dv", 1);
		T->echo = jgn(t, "echo", 0) != 0; T->fill = jgn(t, "fill", 0) != 0;
		snprintf(T->bs, sizeof T->bs, "%s", jgs(BS, jgs(t, "bs", "root"), "r......."));
		T->cp = cpFlags(jgs(t, "cp", ""));
		T->ndr = drumsOf(DR, jgs(t, "dr", "none"), T->dr);
		J *bars = jget(t, "bars"); T->nb = bars ? bars->n : 0;
		T->bars = calloc(T->nb ? T->nb : 1, sizeof(MBar));
		int bi = 0;
		JFOR(b, bars) {
			MBar *B = &T->bars[bi++]; B->deg = (s8)jnum(jat(b, 0), 0);
			evList(jat(b, 1), &B->ev, &B->ne);
			B->ld = B->root = -1; B->cp = -1; B->echo = B->fill = B->ndr = -1; B->lv = B->dv = B->bv = -1;
			J *x = jat(b, 2);
			if (x && x->t == JOBJ) {
				B->dyn = 1; J *o = jget(x, "o");
				if (jget(o, "ld")) B->ld = insIdx(jgs(o, "ld", "pluck"));
				if (jget(o, "cp")) B->cp = cpFlags(jgs(o, "cp", ""));
				if (jget(o, "bs")) B->bs = strdup(jgs(BS, jgs(o, "bs", "root"), "r......."));
				if (jget(o, "dr")) { B->dr = calloc(5, sizeof(DPat)); B->ndr = drumsOf(DR, jgs(o, "dr", "none"), B->dr); }
				if (jget(o, "lv")) B->lv = jgn(o, "lv", .05); if (jget(o, "dv")) B->dv = jgn(o, "dv", 1); if (jget(o, "bv")) B->bv = jgn(o, "bv", .09);
				if (jget(o, "root")) B->root = (s16)jgn(o, "root", 60);
				if (jget(o, "echo")) B->echo = jgn(o, "echo", 0) != 0; if (jget(o, "fill")) B->fill = jgn(o, "fill", 0) != 0;
				B->hm = jgn(x, "hm", 0) != 0; B->hmv = jgn(x, "hmv", .42);
				evList(jget(x, "m2"), &B->ev2, &B->ne2);
				B->ld2 = insIdx(jgs(x, "ld2", "fiddle")); B->lv2 = jgn(x, "lv2", .03);
			}
		}
	}
	JFOR(t, jget(R, "proc")) {
		if (NTR >= MAXT) break;
		MTrack *T = &TR[NTR++]; memset(T, 0, sizeof *T);
		snprintf(T->name, sizeof T->name, "%s", t->key);
		T->bpm = (int)jgn(t, "bpm", 100); T->root = (int)jgn(t, "root", 50); T->spb = (int)jgn(t, "spb", 16);
		scaleOf(R, jgs(t, "sc", "maj"), T->sc);
		JFOR(p, jget(t, "pr")) if (T->npr < 8) T->pr[T->npr++] = (s8)jnum(p, 0);
		T->pld = waveOf(jgs(t, "ld", "triangle")); T->dn = jgn(t, "dn", .5); T->pdr = (u8)jgn(t, "dr", 0);
		T->arp = jgn(t, "arp", 0) != 0; T->pad = jgn(t, "pad", 0) != 0; T->waltz = jgn(t, "waltz", 0) != 0;
		JFOR(b, jget(t, "bs")) if (T->npbs < 16) T->pbs[T->npbs++] = (s8)jnum(b, 0);
	}
	MUS_MENU = musicFor("menu"); MUS_BOSS = musicFor("boss"); MUS_TOWN = musicFor("town"); MUS_NOTTE = musicFor("notte");
	jaFree(&MA);   // tutto è stato copiato: la memoria del parser serve al resto del gioco
}
int musCount(void) { return NTR; }
const char *musName(int i) { return i >= 0 && i < NTR ? TR[i].name : ""; }
int musicFor(const char *m) {
	if (m && *m) for (int i = 0; i < NTR; i++) if (!strcmp(TR[i].name, m)) return i;
	// come il browser: un brano che non c'è diventa quello della città (i dungeon senza brano usano "dungeon")
	if (m && strchr(m, '@')) { int d = musicFor("dungeon"); if (d >= 0) return d; }
	for (int i = 0; i < NTR; i++) if (!strcmp(TR[i].name, "town")) return i;
	return NTR ? 0 : -1;
}
// in città, nei quartieri e al porto, di notte suona il notturno (zoneMus del browser)
int zoneMusic(int zmus) {
	for (int i = 0; i < NNZ; i++) if (!strcmp(NIGHTZ[i], Zk)) return NK > .55f && MUS_NOTTE >= 0 ? MUS_NOTTE : zmus;
	return zmus;
}

/* ---------------- sequencer ---------------- */
static inline int mod7(int k) { return ((k % 7) + 7) % 7; }
static inline int fl7(int k) { return k >= 0 ? k / 7 : -((6 - k) / 7); }
static inline int midN(const MTrack *T, int k) { return T->root + T->sc[mod7(k)] + 12 * fl7(k); }
static u32 hsS(const char *s) { u32 h = 2166136261u; for (; *s; s++) h = (h ^ (u8)*s) * 16777619u; return h; }
static float mb(u32 *a) {
	*a += 0x6D2B79F5u; u32 t = *a;
	t = (t ^ (t >> 15)) * (1u | t);
	t = (t + ((t ^ (t >> 7)) * (61u | t))) ^ t;
	return (float)((t ^ (t >> 14)) >> 8) / 16777216.f;
}
static void drm(double t0, char c, float v) { synDrum(t0, c, v * SGV); }
static void ins(double t0, int m, float d, int k, float v, bool rv) { synIns(t0, (float)m, d, k, v * SGV, rv); }
// songStep di 8_main.js
static void songStep(const MTrack *T, int s, int b, double t0, float dt) {
	if (!T->nb) return;
	const MBar *B = &T->bars[b % T->nb], *NX = &T->bars[(b + 1) % T->nb];
	int deg = B->deg, spb = T->spb, bo = T->root >= 57 ? -24 : -12;
#define CN(i) midN(T, deg + (i) * 2)
	for (int i = 0; i < B->ne; i++) if (B->ev[i].s == s) {
		const MEv *e = &B->ev[i]; int m = midN(T, e->deg) + e->acc;
		ins(t0, m, dt * e->len * .94f, T->ld, T->lv, 1);
		if (T->echo) ins(t0 + dt * 3, m, dt * e->len * .8f, T->ld, T->lv * .26f, 1);
	}
	int bl = strlen(T->bs);
	if (bl) {
		char bc = T->bs[s % bl];
		if (bc && bc != '.') {
			int l = 1; while (s + l < spb && T->bs[(s + l) % bl] == '.') l++;
			int r = CN(0) + bo, n = bc == '3' ? CN(1) + bo : bc == '5' ? CN(2) + bo : bc == 'o' ? r + 12 : bc == 'a' ? midN(T, NX->deg) + bo - 1 : r;
			ins(t0, n, dt * l * .9f, insIdx("bass"), T->bv, 0);
		}
	}
	int pad = insIdx("pad"), str = insIdx("str"), pluck = insIdx("pluck"), bell = insIdx("bell"), reed = insIdx("reed"), brass = insIdx("brass");
	if ((T->cp & CP_PAD) && s == 0) for (int i = 0; i < 3; i++) ins(t0, CN(i), dt * spb * .98f, pad, .016f, 1);
	if ((T->cp & CP_ENS) && s == 0) for (int i = 0; i < 3; i++) ins(t0, CN(i), dt * spb * .98f, str, .012f, 1);
	if ((T->cp & CP_ARP) && s % 2 == 0) ins(t0, CN((s >> 1) % 3) + 12, dt * 2, pluck, .022f, 1);
	if ((T->cp & CP_BELL) && s % 4 == 0) ins(t0, CN((s >> 2) % 3) + 24, dt * 4, bell, .014f, 1);
	if ((T->cp & CP_DRONE) && s == 0) { ins(t0, T->root - 12, dt * spb, reed, .008f, 1); ins(t0, T->root - 5, dt * spb, reed, .006f, 1); }
	static const char *COMP[4] = {"....x.......x...", "x..x..x..x..", "....x...x...", "..x...x...x..x.."};
	static const u16 CPB[4] = {CP_STRUM, CP_STRUM6, CP_WALTZ, CP_STAB};
	for (int c = 0; c < 4; c++) if ((T->cp & CPB[c]) && s < (int)strlen(COMP[c]) && COMP[c][s] == 'x') {
		bool st = c == 3;
		for (int i = 0; i < 3; i++) ins(t0 + i * .012f, CN(i) + (st ? 0 : 12), st ? dt * 1.2f : dt * 2.4f, st ? brass : pluck, st ? .013f : .02f, 1);
	}
	for (int i = 0; i < T->ndr; i++) { int pl = strlen(T->dr[i].pat); if (!pl) continue; char ch = T->dr[i].pat[s % pl]; if (ch && ch != '.') drm(t0, ch, T->dv); }
	if (T->fill && b % 4 == 3 && s >= 12) drm(t0, 's', .8f);
#undef CN
}
// songStep della 7.14 (8zj_citta.js) per i brani dinamici
static void songStepDyn(const MTrack *T0, int s, int b, double t0, float dt) {
	const MBar *B = &T0->bars[b % T0->nb];
	if (!B->dyn) { songStep(T0, s, b, t0, dt); return; }
	MTrack T = *T0;
	if (B->ld >= 0) T.ld = B->ld; if (B->cp >= 0) T.cp = B->cp; if (B->bs) snprintf(T.bs, sizeof T.bs, "%s", B->bs);
	if (B->ndr >= 0) { T.ndr = B->ndr; memcpy(T.dr, B->dr, sizeof(DPat) * B->ndr); }
	if (B->lv >= 0) T.lv = B->lv; if (B->dv >= 0) T.dv = B->dv; if (B->bv >= 0) T.bv = B->bv;
	if (B->root >= 0) T.root = B->root; if (B->echo >= 0) T.echo = B->echo; if (B->fill >= 0) T.fill = B->fill;
	songStep(&T, s, b, t0, dt);
	for (int i = 0; i < B->ne; i++) if (B->ev[i].s == s && B->hm) { const MEv *e = &B->ev[i]; ins(t0 + .008, midN(&T, e->deg - 2) + e->acc, dt * e->len * .9f, T.ld, T.lv * B->hmv, 1); }
	for (int i = 0; i < B->ne2; i++) if (B->ev2[i].s == s) { const MEv *e = &B->ev2[i]; ins(t0, midN(&T, e->deg) + e->acc, dt * e->len * .92f, B->ld2, B->lv2, 1); }
}
// mstep procedurale di 1_core.js
static void procStep(const MTrack *T, int s, int b, double t0, float dt) {
	int spb = T->spb, deg = T->npr ? T->pr[b % T->npr] : 0;
#define CN(i) midN(T, deg + (i) * 2)
	if (T->pad && s == 0) for (int i = 0; i < 3; i++) synNote(t0, CN(i) + 12, dt * spb * .98f, W_SINE, .018f, .25f);
	for (int i = 0; i < T->npbs; i++) if (T->pbs[i] == s) synNote(t0, CN(0) - 12, dt * (spb == 12 ? 4 : 3), W_TRIANGLE, .09f, .01f);
	if (T->waltz && (s == 4 || s == 8)) for (int i = 0; i < 3; i++) synNote(t0, CN(i), dt * 2, W_TRIANGLE, .022f, .01f);
	if (T->arp && s % 2 == 0) synNote(t0, CN((s >> 1) % 3) + 24, dt * 1.6f, W_TRIANGLE, .016f, .01f);
	if (s % 2 == 0) {
		u32 r = hsS(T->name) + (b % 4) * 977 + ((b >> 2) & 1) * 7919 + s * 131;
		float a = mb(&r), c = mb(&r), e = mb(&r);
		if (a < T->dn && !(b % 8 == 7 && s >= spb / 2)) {
			int k = s % 4 == 0 ? deg + 2 * (int)floorf(c * 3) : deg + (int)floorf(c * 7) - 1;
			synNote(t0, midN(T, k) + 12, dt * (2 + (int)floorf(e * 3)), T->pld, (T->pld == W_SQUARE || T->pld == W_SAW) ? .02f : .045f, .01f);
		}
	}
	if (T->pdr == 1) { if (s == 0 || s == 8) synDrum(t0, 'K', .16f); if (s % 4 == 2) synDrum(t0, 'H', .03f); }
	else if (T->pdr == 2) { if (s == 0) synDrum(t0, 'K', .2f); if (s == 10 && b % 2) synDrum(t0, 'K', .12f); if (s == 6) synDrum(t0, 'B', .025f); }
	else if (T->pdr == 3) { if (s == 0 || s == 8 || s == 10) synDrum(t0, 'K', .24f); if (s == 4 || s == 12) synDrum(t0, 'S', .09f); if (s % 2 == 0) synDrum(t0, 'H', .035f); }
#undef CN
}

/* ---------------- tempo, cambio di brano ---------------- */
static int cur = -1, want = -1, st = 0, bar = 0;
static double nt = 0, fadeT0 = 0; static int fadeMode = 0;   // 0 fermo, 1 sfuma via, 2 entra
void musicSet(int track) {
	VOL_MUS = SET.mu; VOL_SFX = SET.sf; MUS_ON = SET.muOn;
	if (track == want) return;
	want = track;
	fadeMode = cur < 0 ? 3 : 1; fadeT0 = -1;   // il tempo lo fissa musAdvance
}
// guadagno della musica: sfuma via in 0,5 s, cambia dopo 0,55 s, entra in 0,8 s (come music() del browser)
float musFade(double now) {
	if (fadeMode == 1) return fadeT0 < 0 ? 1 : fmaxf(0, 1 - (float)(now - fadeT0) / .5f);
	if (fadeMode == 2) return fminf(1, (float)(now - fadeT0) / .8f);
	return cur >= 0 ? 1 : 0;
}
bool musIsCurrent(int track) { return track == cur; }
void musAdvance(double now, double ahead) {
	if (fadeMode == 3) { cur = want; st = 0; bar = 0; nt = now + .06; fadeMode = 2; fadeT0 = now; }
	if (fadeMode == 1) {
		if (fadeT0 < 0) fadeT0 = now;
		if (now - fadeT0 >= .55) { cur = want; st = 0; bar = 0; nt = now + .06; fadeMode = 2; fadeT0 = now; extern void synStopMusic(void); synStopMusic(); }
	}
	if (fadeMode == 2 && now - fadeT0 >= .8) fadeMode = 0;
	if (cur < 0 || cur >= NTR) return;
	const MTrack *T = &TR[cur];
	float dt = 60.f / T->bpm / 4;
	if (nt < now) nt = now + .06;
	int guard = 0;
	while (nt < now + ahead && guard++ < 64) {
		if (T->sng) songStepDyn(T, st, bar, nt, dt); else procStep(T, st, bar, nt, dt);
		nt += dt;
		if (++st >= T->spb) { st = 0; bar++; }
	}
}
