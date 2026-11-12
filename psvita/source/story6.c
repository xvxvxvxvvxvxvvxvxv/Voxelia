// Voxelia PS Vita (motore del port 3DS) - la Torre della Corona (7.44/7.49, src/8zzy_torre.js): dieci piani di sale generate a caso,
// sempre più difficili; ripulita la sala si sceglie una di tre benedizioni e si sale. Ai piani 5 e 10 c'è un boss.
// Cadere nella Torre non costa niente: la prova finisce e si prende il premio dei piani fatti.
// Sulla console le sale si costruiscono qui, casella per casella (pavimento, muri, fosse, lava).
#include "voxelia.h"

#define C_TXT C2D_Color32(232, 236, 244, 255)
#define C_MU C2D_Color32(154, 164, 184, 255)
#define C_GOLD C2D_Color32(245, 185, 66, 255)
#define TOR_N 10
typedef struct { u32 a; } Sd;
static float sdNext(Sd *s) {
	s->a = s->a + 0x6D2B79F5u; u32 t = s->a;
	t = (t ^ (t >> 15)) * (1u | t);
	t = (t + ((t ^ (t >> 7)) * (61u | t))) ^ t;
	return (float)((t ^ (t >> 14)) / 4294967296.0);
}
typedef struct { const char *k, *n, *d; } Bless;
static const Bless TORB[10] = {{"forza", "Forza", "+20% danni"}, {"vita", "Vigore", "+25% vita massima"}, {"vampiro", "Sete", "Ti curi del 5% dei danni che fai"},
	{"fortuna", "Fortuna", "+50% oro dai nemici"}, {"pozioni", "Scorta", "+2 pozioni subito"}, {"scudo", "Pelle di pietra", "-20% danni subiti"},
	{"esplosione", "Scoppio", "Chi cade esplode e ferisce chi gli sta vicino"}, {"critico", "Occhio fino", "+12% probabilità di colpo critico"},
	{"rigenera", "Rigenerazione", "Recuperi l'1% della vita al secondo"}, {"riflessi", "Riflessi", "Schivata e affondo si ricaricano molto prima"}};
static const char *TORT[7][2] = {{"cerchio", "Sala rotonda"}, {"quadrata", "Sala delle colonne"}, {"croce", "Sala a croce"}, {"anello", "Sala ad anello"}, {"stanze", "Le quattro stanze"}, {"labirinto", "Il labirinto"}, {"ponti", "La sala dei ponti"}};
static const char *TORL[6][2] = {{"veloci", "I nemici sono più veloci"}, {"corazzati", "I nemici hanno la corazza: più vita"}, {"furiosi", "I nemici colpiscono più forte"},
	{"sciame", "Uno sciame: tanti nemici, più deboli"}, {"rinforzi", "A metà sala arrivano i rinforzi"}, {"campioni", "Tutti campioni"}};
static const u32 TORC[6][4] = {{0x4a4258, 0x433b50, 0x6e6480, 0xffd84a}, {0x3a4a5a, 0x344454, 0x5a7088, 0x9adcff}, {0x3a5a52, 0x34544c, 0x5a8a7a, 0x6affc0},
	{0x5a3a3a, 0x523434, 0x8a5a5a, 0xff7a3a}, {0x5a2a3a, 0x502434, 0x8a3a4a, 0xff4a6a}, {0x6a5a2a, 0x625226, 0xa8904a, 0xffe84a}};
static struct { bool on; int f, lv, done, law, ty, n0; u32 seed; char from[32]; u8 b[12]; int nb; double t0; bool clr, sp, w2, bf; int stx, sty; int spots[10][2], nsp; int tys[5], ntys; } TR;
static int torN(int k) { int n = 0; for (int i = 0; i < TR.nb; i++) if (TR.b[i] == k) n++; return n; }
bool torOn(void) { return TR.on && !strncmp(Zk, "torre", 5); }
bool torIsZone(const char *k) { return !strncmp(k, "torre", 5) && k[5] >= '1' && k[5] <= '9' && TR.on; }
static int torTier(int f) { return f >= 10 ? 5 : f >= 8 ? 4 : f >= 6 ? 3 : f >= 4 ? 2 : f >= 2 ? 1 : 0; }
// gli effetti delle benedizioni (agganci dal resto del gioco)
float torDmgMul(void) { return torOn() ? 1 + .2f * torN(0) : 1; }
float torCritAdd(void) { return torOn() ? 12 * torN(7) : 0; }
float torHpMul(void) { return torOn() ? 1 + .25f * torN(1) : 1; }
float torHurtMul(void) { return torOn() ? powf(.8f, torN(5)) : 1; }
float torGoldMul(void) { return torOn() ? 1 + .5f * torN(3) : 1; }
float torCdMul(void) { return torOn() && torN(9) ? .55f : 1; }
void torOnHit(int d) { if (torOn() && torN(2) && P.hp > 0) P.hp = fminf(P.mx, P.hp + d * .05f * torN(2)); }

/* ---------------- la sala ---------------- */
static Sd R;
static void F(int x, int y, u8 v) { if (x > 0 && y > 0 && x < N - 1 && y < N - 1) M[y][x] = v; }
static void disk(float cx, float cy, float rr, u8 v) { for (int y = 0; y < N; y++) for (int x = 0; x < N; x++) if (hyp(x + .5f - cx, y + .5f - cy) < rr) F(x, y, v); }
static void trect(int x0, int y0, int w, int h, u8 v) { for (int y = y0; y < y0 + h; y++) for (int x = x0; x < x0 + w; x++) F(x, y, v); }
static void lay(int ty, int c) {
	for (int y = 0; y < N; y++) for (int x = 0; x < N; x++) M[y][x] = 9;
	int n = N;
	if (ty == 0) { disk(c, c, 12, 0); int np = (int[]){4, 6, 8}[(int)floorf(sdNext(&R) * 3) % 3]; float pr = 4 + sdNext(&R) * 4, ph = sdNext(&R) * 6.283f; for (int i = 0; i < np; i++) { float a = ph + i * 6.283f / np; F((int)floorf(c + cosf(a) * pr), (int)floorf(c + sinf(a) * pr), 1); } }
	else if (ty == 1) { trect(3, 3, n - 6, n - 6, 0); int st = 3 + (int)floorf(sdNext(&R) * 2); for (int y = 6; y < n - 6; y += st) for (int x = 6; x < n - 6; x += st) if (sdNext(&R) < .75f && hyp(x - c, y - c) > 2.5f) { F(x, y, 1); if (sdNext(&R) < .3f) F(x + 1, y, 1); } }
	else if (ty == 2) { int w = 7 + (int)floorf(sdNext(&R) * 3); trect(c - w / 2, 3, w, n - 6, 0); trect(3, c - w / 2, n - 6, w, 0); disk(c, c, w * .8f, 0); }
	else if (ty == 3) { disk(c, c, 12.5f, 0); disk(c, c, 4.5f + sdNext(&R) * 1.5f, 9); int nb = 2 + (int)floorf(sdNext(&R) * 3); float ph = sdNext(&R) * 6.283f; for (int i = 0; i < nb; i++) { float a = ph + i * 6.283f / nb; for (int k = 0; k < 7; k++) F((int)floorf(c + cosf(a) * k), (int)floorf(c + sinf(a) * k), 0); } disk(c, c, 2, 0); }
	else if (ty == 4) { int q[4][2] = {{4, 4}, {n - 13, 4}, {4, n - 13}, {n - 13, n - 13}}; for (int i = 0; i < 4; i++) trect(q[i][0], q[i][1], 9, 9, 0); trect(c - 2, 6, 4, n - 12, 0); trect(6, c - 2, n - 12, 4, 0); disk(c, c, 4, 0); for (int i = 0; i < 4; i++) if (sdNext(&R) < .6f) F(q[i][0] + 4, q[i][1] + 4, 1); }
	else if (ty == 5) {
		const int cs = 4, cw = 6, o0 = 3; static u8 V[6][6]; memset(V, 0, sizeof V); int st[40][2], ns = 0;
		#define CELL(i, j) trect(o0 + (i) * cs, o0 + (j) * cs, cs - 1, cs - 1, 0)
		V[0][cw - 1] = 1; st[ns][0] = 0; st[ns][1] = cw - 1; ns++; CELL(0, cw - 1);
		while (ns) { int i = st[ns - 1][0], j = st[ns - 1][1], nb[4][2], k = 0; static const int D[4][2] = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
			for (int d = 0; d < 4; d++) { int a = i + D[d][0], b = j + D[d][1]; if (a >= 0 && b >= 0 && a < cw && b < cw && !V[a][b]) { nb[k][0] = a; nb[k][1] = b; k++; } }
			if (!k) { ns--; continue; } int p = (int)floorf(sdNext(&R) * k) % k, a = nb[p][0], b = nb[p][1]; V[a][b] = 1; CELL(a, b);
			if (a > i) trect(o0 + i * cs + cs - 1, o0 + j * cs, 1, cs - 1, 0); else if (a < i) trect(o0 + a * cs + cs - 1, o0 + j * cs, 1, cs - 1, 0); else if (b > j) trect(o0 + i * cs, o0 + j * cs + cs - 1, cs - 1, 1, 0); else trect(o0 + i * cs, o0 + b * cs + cs - 1, cs - 1, 1, 0);
			if (ns < 40) { st[ns][0] = a; st[ns][1] = b; ns++; } }
		for (int k = 0; k < 5; k++) { int i = (int)floorf(sdNext(&R) * (cw - 1)), j = (int)floorf(sdNext(&R) * cw); trect(o0 + i * cs + cs - 1, o0 + j * cs, 1, cs - 1, 0); }
		disk(c, c, 2.2f, 0);
	}
	else { trect(3, 3, n - 6, n - 6, 0); for (int k = 0; k < 5; k++) { int x = 4 + (int)floorf(sdNext(&R) * (n - 12)), y = 4 + (int)floorf(sdNext(&R) * (n - 12)), w = 3 + (int)floorf(sdNext(&R) * 4), h = 3 + (int)floorf(sdNext(&R) * 4); if (fabsf(x + w / 2.f - c) < 4 && fabsf(y + h / 2.f - c) < 4) continue; trect(x, y, w, h, 9); } disk(c, c, 2.5f, 0); }
}
static void walls(int ty, int c) {
	for (int y = 1; y < N - 1; y++) for (int x = 1; x < N - 1; x++) {
		if (M[y][x] != 9) continue; bool t = false;
		for (int a = -1; a <= 1; a++) for (int b = -1; b <= 1; b++) if (M[y + b][x + a] == 0) t = true;
		if (t && !(ty == 3 && hyp(x + .5f - c, y + .5f - c) < 7.5f) && !(ty == 6 && x > 3 && y > 3 && x < N - 4 && y < N - 4)) M[y][x] = 1;
	}
}
static QBox qb(float x, float y, float z, float w, float d, float h, u32 c, int f, int fl, int tile) {
	QBox q; q.x = (s16)roundf(x * 256); q.y = (s16)roundf(y * 256); q.z = (s16)roundf(z * 8); q.h = (s16)roundf(h * 8); q.w = (u16)roundf(w * 256); q.d = (u16)roundf(d * 256);
	q.r = (c >> 16) & 255; q.g = (c >> 8) & 255; q.b = c & 255; q.f = (u8)f; q.a = 255; q.fl = (u8)fl; q.tile = (u16)tile; return q;
}
extern void worldAdopt(int n, QBox *boxes, int nb, float sx, float sy);
extern int musicFor(const char *mus);
extern int ZELZ;
extern Ent *mkPo(float x, float y, const char *to, int st, const char *name);
static Ent *pump(Ent *m) {
	int f = TR.f; float k = 1 + .1f * (f - 1);
	m->hp = m->mx = roundf(m->mx * k * (TR.law == 1 ? 1.35f : TR.law == 3 ? .7f : 1));
	m->at *= (1 + .06f * (f - 1)) * (TR.law == 2 ? 1.25f : 1); if (TR.law == 0) m->sp *= 1.3f;
	if ((TR.law == 5 || (f >= 3 && sdNext(&R) < .06f * f)) && !m->boss) { m->hp = m->mx = roundf(m->mx * 1.6f); m->at *= 1.3f; char b[48]; snprintf(b, sizeof b, "Campione %s", m->name); snprintf(m->name, sizeof m->name, "%s", b); }
	return m;
}
void torGen(const char *k) {
	int f = atoi(k + 5); if (f < 1) f = 1; if (f > TOR_N) f = TOR_N;
	char b[48]; snprintf(b, sizeof b, "torre|%u|%d", (unsigned)TR.seed, f); R.a = hs(b);
	TR.f = f; TR.clr = false; TR.sp = false; TR.w2 = false; TR.bf = false;
	N = 30; int c = N / 2;
	int ty = f == TOR_N ? 0 : (int)floorf(sdNext(&R) * 7) % 7; TR.ty = ty;
	lay(ty, c);
	int spx = c, spy = N - 4; for (int y = N - 5; y <= N - 3; y++) for (int x = c - 2; x <= c + 2; x++) M[y][x] = 0;
	static s16 d[MAXN * MAXN]; bfs(spx, spy, d);
	if (d[c * N + c] < 0) { for (int y = c; y < N - 3; y++) for (int x = c - 1; x <= c + 1; x++) if (M[y][x] != 0) M[y][x] = 0; bfs(spx, spy, d); }
	for (int y = 1; y < N - 1; y++) for (int x = 1; x < N - 1; x++) if (M[y][x] == 0 && d[y * N + x] < 0) M[y][x] = 9;
	walls(ty, c); for (int x = 0; x < N; x++) { if (M[0][x] == 0) M[0][x] = 1; if (M[N - 1][x] == 0) M[N - 1][x] = 1; }
	// dal piano 6 qualche pozza di lava, ma mai che tagli la sala
	if (f >= 6 && ty != 5) for (int q = 0; q < 3; q++) {
		int x = 4 + (int)floorf(sdNext(&R) * (N - 8)), y = 4 + (int)floorf(sdNext(&R) * (N - 10)); if (hyp(x - c, y - c) < 4 || hyp(x - spx, y - spy) < 6) continue;
		int pc[4][2], np = 0; static const int O[4][2] = {{0, 0}, {1, 0}, {0, 1}, {1, 1}};
		for (int i = 0; i < 4; i++) if (M[y + O[i][1]][x + O[i][0]] == 0) { M[y + O[i][1]][x + O[i][0]] = 2; pc[np][0] = x + O[i][0]; pc[np][1] = y + O[i][1]; np++; }
		bfs(spx, spy, d); bool cut = false; for (int v = 1; v < N - 1 && !cut; v++) for (int u = 1; u < N - 1; u++) if (M[v][u] == 0 && d[v * N + u] < 0) { cut = true; break; }
		if (cut) for (int i = 0; i < np; i++) M[pc[i][1]][pc[i][0]] = 0;
	}
	// la geometria: pavimento a scacchi, muri alti con un bordo, lava che brilla; le fosse restano nere
	const u32 *C = TORC[torTier(f)];
	int cap = N * N * 2 + 64; QBox *B = malloc(sizeof(QBox) * cap); int nb = 0;
	for (int y = 0; y < N; y++) for (int x = 0; x < N; x++) {
		int t = y * N + x; u8 v = M[y][x]; OCCT[y][x] = v == 1 ? 1 : 0;
		if (v == 0) B[nb++] = qb(x, y, -6, 1, 1, 6, (x + y) & 1 ? C[1] : C[0], 100, 0, t);
		else if (v == 2) B[nb++] = qb(x, y, -6, 1, 1, 5, f >= 6 ? 0xff6a1a : 0x3a6ab0, 140, 1, t);
		else if (v == 1) { float h = 36 + ((x * 7 + y * 13) % 5); B[nb++] = qb(x, y, 0, 1, 1, h, C[2], 100, 0, t); B[nb++] = qb(x - .02f, y - .02f, h, 1.04f, 1.04f, 2, C[0], 110, 0, t); }
	}
	// le torce lungo i muri
	NENT = 0; int nt = 0;
	for (int y = 2; y < N - 2 && nt < 16; y++) for (int x = 2; x < N - 2 && nt < 16; x++)
		if (M[y][x] == 0 && (x * 7 + y * 11) % 9 == 0 && (M[y][x + 1] == 1 || M[y][x - 1] == 1 || M[y + 1][x] == 1 || M[y - 1][x] == 1)) { Ent *e = entNew(K_TC, x + .5f, y + .5f); if (e) addSLight(x + .5f, y + .5f, 26, 3.6f, C[3], .9f); nt++; }
	worldAdopt(N, B, nb, spx + .5f, spy + .5f);
	snprintf(ZNAME, sizeof ZNAME, "Torre della Corona · piano %d", f);
	ZLV = TR.lv + (int)roundf((f - 1) * 1.4f); ZINT = 1; ZOUT = 0; ZBG = 0x05040a; ZTC = C[3]; ZMUS = musicFor("dungeon"); ZELZ = 0;
	{ Ent *e = mkPo(c + .5f, N - 2.5f, TR.from[0] ? TR.from : "town", PO_EXIT, "Esci dalla Torre"); if (e) e->xk = 97; }
	TR.stx = c; TR.sty = c;
	// la legge del piano e i nemici (quelli dei dungeon della storia)
	TR.law = f >= 4 && f != TOR_N ? (int)floorf(sdNext(&R) * 6) % 6 : -1;
	int en[40], ne = 0, bo[12], nbo = 0;
	for (int i = 0; i < NDG; i++) { if (strcmp(DG[i].id, "cittadella") && DG[i].boss >= 0 && nbo < 12) bo[nbo++] = DG[i].boss; for (int q = 0; q < DG[i].nen; q++) { bool h = false; for (int z = 0; z < ne; z++) if (en[z] == DG[i].en[q]) h = true; if (!h && ne < 40) en[ne++] = DG[i].en[q]; } }
	bool boss = f == 5 || f == TOR_N; int nT = 2 + f / 3 > 5 ? 5 : 2 + f / 3; TR.ntys = nT; for (int i = 0; i < nT; i++) TR.tys[i] = en[(int)floorf(sdNext(&R) * ne) % (ne ? ne : 1)];
	int n = boss ? 2 + f / 3 : 4 + (int)roundf(f * 1.2f); if (TR.law == 3) n = (int)roundf(n * 1.6f); if (TR.law == 4) n = (int)roundf(n * .7f);
	static int sp[MAXN * MAXN][2]; int ns = 0;
	for (int y = 2; y < N - 2; y++) for (int x = 2; x < N - 2; x++) if (M[y][x] == 0 && hyp(x - spx, y - spy) > 7) { sp[ns][0] = x; sp[ns][1] = y; ns++; }
	for (int i = ns - 1; i > 0; i--) { int j = (int)floorf(sdNext(&R) * (i + 1)); int t0 = sp[i][0], t1 = sp[i][1]; sp[i][0] = sp[j][0]; sp[i][1] = sp[j][1]; sp[j][0] = t0; sp[j][1] = t1; }
	if (boss && nbo) {
		int b1 = bo[(int)floorf(sdNext(&R) * nbo) % nbo]; int x, y; if (M[c - 3][c] == 0) { x = c; y = c - 3; } else nearFree(c, c - 3, &x, &y);
		Ent *m = mkEn(b1, x, y); if (m) pump(m);
		if (f == TOR_N && nbo > 1) { int b2 = b1; while (b2 == b1) b2 = bo[(int)floorf(sdNext(&R) * nbo) % nbo]; if (M[c - 1][c + 3] == 0) { x = c + 3; y = c - 1; } else nearFree(c + 3, c - 1, &x, &y); Ent *m2 = mkEn(b2, x, y); if (m2) { pump(m2); m2->hp = m2->mx = roundf(m2->mx * .6f); } }
	}
	for (int i = 0; i < n && ns > 0; i++) { ns--; Ent *m = mkEn(TR.tys[i % nT], sp[ns][0], sp[ns][1]); if (m) pump(m); }
	TR.nsp = 0; for (int i = 0; i < 10 && ns > 0; i++) { ns--; TR.spots[TR.nsp][0] = sp[ns][0]; TR.spots[TR.nsp][1] = sp[ns][1]; TR.nsp++; }
	TR.n0 = 0; for (int i = 0; i < NENT; i++) if (ents[i].k == K_EN) TR.n0++;
	char a2[64], b2[96]; snprintf(a2, sizeof a2, "Piano %d · %s", f, TORT[ty][1]);
	snprintf(b2, sizeof b2, "%s%s", TR.law >= 0 ? "Legge del piano: " : "", TR.law >= 0 ? TORL[TR.law][1] : boss ? "Il guardiano del piano ti aspetta" : f >= 3 ? "I nemici sono più forti" : "Ripulisci la sala");
	banner(a2, b2);
	TR.sp = true;
}

/* ---------------- la prova ---------------- */
void torDoor(void) { xOpen(XP_TORRE); tone(330, .1f, W_TRIANGLE, .05f); }
static void torStart(void) {
	memset(&TR, 0, sizeof TR); TR.on = true; TR.f = 1; TR.lv = P.lv > 1 ? P.lv : 1; snprintf(TR.from, sizeof TR.from, "%s", Zk);
	TR.seed = (u32)(osGetTime() ^ hs(P.name)); TR.t0 = xNowUTC(); recalc(); P.hp = P.mx;
	uiClose(); goZone("torre1");
}
static void torEnd(bool win) {
	if (!TR.on) return;
	int done = win ? TOR_N : TR.done, sec = (int)(xNowUTC() - TR.t0), lv = TR.lv;
	int gold = (int)roundf(done * done * 18 * (1 + lv * .12f)), xp = (int)roundf(done * done * 9 * (1 + lv * .2f));
	TR.on = false; recalc();
	P.g += gold; gainXP(xp);
	char its[96] = ""; if (done >= 5) { Item it = mkItem(lv + 3, 2, -1); gain(it); snprintf(its, sizeof its, " e %s", it.n); } if (done >= TOR_N) { Item it = mkItem(lv + 4, 3, -1); gain(it); int o = strlen(its); snprintf(its + o, sizeof its - o, ", %s", it.n); }
	if (netOk && done > 0) { char d[12]; time_t t = (time_t)xNowUTC(); struct tm *g = gmtime(&t); snprintf(d, sizeof d, "%04d-%02d-%02d", g->tm_year + 1900, g->tm_mon + 1, g->tm_mday);
		char m[160]; snprintf(m, sizeof m, "{\"t\":\"x\",\"pl\":\"torre\",\"e\":\"score\",\"d\":{\"d\":\"%s\",\"c\":%d,\"t\":%d,\"lv\":%d}}", d, done, sec, lv); netSendRaw(m); }
	static char tx[400]; int o = snprintf(tx, sizeof tx, "%s\nTempo: %d min %d s · benedizioni:", win ? "Hai conquistato tutti e dieci i piani della Torre di oggi!" : "", sec / 60, sec % 60);
	if (!win) o = snprintf(tx, sizeof tx, "Piani superati: %d di %d.\nTempo: %d min %d s · benedizioni:", done, TOR_N, sec / 60, sec % 60);
	if (!TR.nb) o += snprintf(tx + o, sizeof tx - o, " nessuna"); for (int i = 0; i < TR.nb && o < (int)sizeof tx - 40; i++) o += snprintf(tx + o, sizeof tx - o, "%s %s", i ? "," : "", TORB[TR.b[i]].n);
	snprintf(tx + o, sizeof tx - o, "\n\nPremio: +%d oro, +%d XP%s.\nLa Torre di domani sarà diversa.", gold, xp, its);
	P.hp = P.mx;
	goZone(TR.from[0] ? TR.from : "town");
	uiOpenText(win ? "La Torre è tua!" : "La prova della Torre è finita", tx, NULL);
	if (win) banner("Torre conquistata!", "Dieci piani");
	saveGame();
}
bool torDie(void) { if (!torOn()) return false; P.hp = P.mx; torEnd(false); return true; }
bool torExit(Ent *po) { if (!torOn() || po->xk != 97) return false; torEnd(false); return true; }
static float tT;
void torTick(float dt) {
	if (!torOn()) { if (TR.on && strncmp(Zk, "torre", 5) && !zonePendingTor()) TR.on = false; return; }
	if (torN(8) && P.hp > 0 && P.hp < P.mx) P.hp = fminf(P.mx, P.hp + P.mx * .01f * torN(8) * dt);
	if ((tT -= dt) > 0) return; tT = .3f;
	int alive = 0; for (int i = 0; i < NENT; i++) if (ents[i].k == K_EN && ents[i].hp > 0) alive++;
	// legge «rinforzi»: a metà sala arriva un'altra ondata
	if (TR.law == 4 && !TR.w2 && TR.sp && alive <= TR.n0 / 2) { TR.w2 = true; for (int i = 0; i < TR.nsp && i < 4 + TR.f / 2; i++) { Ent *m = mkEn(TR.tys[fri(0, TR.ntys - 1)], TR.spots[i][0], TR.spots[i][1]); if (m) { m->hp = m->mx = roundf(m->mx * (1 + .1f * (TR.f - 1))); m->at *= 1 + .06f * (TR.f - 1); m->al = 1; } } banner("Rinforzi!", "Un'altra ondata sale le scale"); return; }
	if (TR.clr || !TR.sp || alive) return;
	TR.clr = true; if (TR.f > TR.done) TR.done = TR.f; JINGLE(.1f, W_TRIANGLE, 67, 72, 76, 79);
	if (TR.f >= TOR_N) { torEnd(true); return; }
	xOpen(XP_TORB);
}
void torKill(Ent *e) {
	if (!torOn()) return;
	if (torN(6)) { fxRing(e->px, e->py, 2.2f, .4f, 0xffa040); for (int i = 0; i < NENT; i++) { Ent *o = &ents[i]; if (o->k == K_EN && o != e && o->hp > 0 && hyp(o->px - e->px, o->py - e->py) < 2.2f) { extern void hurtEnemyRaw(Ent *, int, bool); hurtEnemyRaw(o, (int)fmaxf(1, roundf(e->mx * .25f * torN(6))), false); } } }
}
// le finestre: l'ingresso e la scelta della benedizione
static char TB[500];
int torBuild(int page) {
	if (page == XP_INC) return incBuild(page);
	if (page == XP_TORRE) {
		snprintf(TB, sizeof TB, "Dieci piani: in ognuno una sala con i nemici; ripulita la sala si sceglie una di tre benedizioni (valgono solo nella Torre) e si sale. Ai piani 5 e 10 aspetta un boss. Le sale cambiano a ogni salita e ogni piano è più difficile.\nCadere nella Torre non costa niente: la prova finisce e si prende il premio dei piani fatti.");
		uiXTitle("Torre della Corona", TB);
		uiXOpt("Entra nella Torre", "", XARG(140, 0), C_GOLD, false);
		uiXOpt("Resta fuori", "", XARG(1, 0), 0, false);
		return 1;
	}
	if (page == XP_TORB) {
		if (!TR.on || TR.bf) return 0;
		char ti[64]; snprintf(ti, sizeof ti, "Piano %d ripulito · scegli una benedizione", TR.f);
		int o = snprintf(TB, sizeof TB, "Vale fino a quando resti nella Torre e si somma a quelle che hai già.");
		if (TR.nb) { o += snprintf(TB + o, sizeof TB - o, " Hai:"); for (int i = 0; i < TR.nb; i++) o += snprintf(TB + o, sizeof TB - o, "%s %s", i ? "," : "", TORB[TR.b[i]].n); }
		uiXTitle(ti, TB);
		char b[64]; snprintf(b, sizeof b, "torre|%u|benedizioni%d", (unsigned)TR.seed, TR.f); Sd r = {hs(b)}; int L[10]; for (int i = 0; i < 10; i++) L[i] = i;
		for (int i = 9; i > 0; i--) { int j = (int)floorf(sdNext(&r) * (i + 1)); int t = L[i]; L[i] = L[j]; L[j] = t; }
		for (int i = 0; i < 3; i++) { char l[80]; int n = torN(L[i]); snprintf(l, sizeof l, "%s%s: %s", TORB[L[i]].n, n ? " (ancora)" : "", TORB[L[i]].d); uiXOpt(l, "", XARG(141, L[i]), C_GOLD, false); }
		return 1;
	}
	return 0;
}
int torAct(int a, int i) {
	if (a == 140) { torStart(); return 1; }
	if (a == 141) {
		if (!TR.on || TR.bf) return 1; TR.bf = true; if (TR.nb < 12) TR.b[TR.nb++] = (u8)i;
		if (i == 4) { P.pot += 2; flt(P.px, P.py, "+2 pozioni", 0x88ff88); }
		if (i == 1) { recalc(); P.hp = fminf(P.mx, P.hp + roundf(P.mx * .25f)); }
		char nx[16]; snprintf(nx, sizeof nx, "torre%d", TR.f + 1); char nm[40]; snprintf(nm, sizeof nm, "Sali al piano %d", TR.f + 1);
		Ent *e = mkPo(TR.stx + .5f, TR.sty + .5f, nx, PO_UP, nm); (void)e;
		fxRing(TR.stx + .5f, TR.sty + .5f, 2.4f, .9f, 0xffd84a);
		msg("Benedizione: %s. La scala per il piano %d è al centro della sala.", TORB[i].n, TR.f + 1);
		return 1;
	}
	return incAct(a, i);
}
