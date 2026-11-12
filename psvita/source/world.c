// Voxelia PS Vita (motore del port 3DS) - il mondo: ogni zona arriva dalla versione browser 7.50 (romfs:/z_<zona>.bin e .json):
// collisioni, geometria voxel esatta, luci ed entità. I piani dei dungeon esistono in due varianti per ciclo.
#include "voxelia.h"

int N = 40;
u8 M[MAXN][MAXN];
u8 OCCT[MAXN][MAXN];
u32 TCOL[MAXN][MAXN];
char Zk[32] = "town";
char ZNAME[96];
int ZELZ, ZLV0;
int ZLV, ZRUN, ZMUS, ZINT, ZOUT, ZDG = -1, ZDN = 0;
u32 ZBG = 0x7fb6e6, ZTC = 0xffb04a;
Ent ents[MAXE];
int NENT = 0;
float NK = 0, DK = 0;
static JArena ZA;
static float spX = 1.5f, spY = 1.5f;

bool WK(int c) { return c == 0 || c == 4 || c == 8; }
bool blk(float x, float y) {
	int i = (int)floorf(x), j = (int)floorf(y);
	return i < 0 || j < 0 || i >= N || j >= N || !WK(M[j][i]);
}
Ent *entNew(u8 k, float x, float y) {
	int i;
	for (i = 0; i < NENT; i++) if (!ents[i].k) break;
	if (i == NENT) { if (NENT >= MAXE) return NULL; NENT++; }
	Ent *e = &ents[i];
	memset(e, 0, sizeof *e);
	e->k = k; e->px = x; e->py = y; e->model = -1; e->nid = -1; e->t = -1; e->face = 0; e->sid = -1;
	return e;
}
void entDel(Ent *e) { e->k = K_NONE; while (NENT > 0 && !ents[NENT - 1].k) NENT--; }

// chiave di stanza per la rete: codice + zona (+ ciclo nei dungeon), come rmKey() dell'originale
void rmKey(char *out, int n) {
	if (ZDG >= 0) snprintf(out, n, "%s-%s#%d", NETC.code, Zk, ZRUN);
	else snprintf(out, n, "%s-%s", NETC.code, Zk);
}

/* ---------------- percorsi ---------------- */
static int Q[MAXN * MAXN];
int bfs(int sx, int sy, s16 *d) {
	for (int i = 0; i < N * N; i++) d[i] = -1;
	int qh = 0, qt = 0;
	if (sx < 0 || sy < 0 || sx >= N || sy >= N) return 0;
	Q[qt++] = sy * N + sx; d[sy * N + sx] = 0;
	static const int D4[4][2] = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
	while (qh < qt) {
		int c = Q[qh++], x = c % N, y = c / N;
		for (int k = 0; k < 4; k++) {
			int u = x + D4[k][0], v = y + D4[k][1];
			if (u < 0 || v < 0 || u >= N || v >= N || !WK(M[v][u]) || d[v * N + u] >= 0) continue;
			d[v * N + u] = d[c] + 1; Q[qt++] = v * N + u;
		}
	}
	return qt;
}
static s16 PR[MAXN * MAXN];
int pathFind(int sx, int sy, int gx, int gy, u8 (*out)[2], int maxn) {
	if (gx < 0 || gy < 0 || gx >= N || gy >= N || !WK(M[gy][gx])) return 0;
	if (sx < 0 || sy < 0 || sx >= N || sy >= N) return 0;
	for (int i = 0; i < N * N; i++) PR[i] = -2;
	int qh = 0, qt = 0;
	Q[qt++] = sy * N + sx; PR[sy * N + sx] = -1;
	while (qh < qt) {
		int c = Q[qh++], x = c % N, y = c / N;
		if (x == gx && y == gy) break;
		for (int a = -1; a < 2; a++) for (int b = -1; b < 2; b++) {
			int u = x + a, v = y + b;
			if ((!a && !b) || u < 0 || v < 0 || u >= N || v >= N || !WK(M[v][u]) || PR[v * N + u] != -2) continue;
			if (a && b && (!WK(M[y][u]) || !WK(M[v][x]))) continue;
			PR[v * N + u] = c; Q[qt++] = v * N + u;
		}
	}
	int c = gy * N + gx;
	if (PR[c] == -2) return 0;
	static int tmp[MAXN * MAXN]; int n = 0;
	while (PR[c] != -1) { tmp[n++] = c; c = PR[c]; }
	int m = n < maxn ? n : maxn;
	for (int i = 0; i < m; i++) { int q = tmp[n - 1 - i]; out[i][0] = q % N; out[i][1] = q / N; }
	return m;
}
bool nearFree(int x, int y, int *ox, int *oy) {
	if (x > 0 && y > 0 && x < N && y < N && WK(M[y][x])) { bool busy = false; for (int i = 0; i < NENT; i++) if ((ents[i].k == K_PO || ents[i].k == K_NPC) && (int)ents[i].px == x && (int)ents[i].py == y) busy = true; if (!busy) { *ox = x; *oy = y; return true; } }
	for (int r = 1; r < 8; r++) for (int dy = -r; dy <= r; dy++) for (int dx = -r; dx <= r; dx++) {
		if (abs(dx) != r && abs(dy) != r) continue;
		int u = x + dx, v = y + dy;
		if (u > 0 && v > 0 && u < N - 1 && v < N - 1 && WK(M[v][u])) {
			bool busy = false;
			for (int i = 0; i < NENT; i++) { Ent *e = &ents[i]; if ((e->k == K_PO || e->k == K_NPC) && (int)e->px == u && (int)e->py == v) { busy = true; break; } }
			if (!busy) { *ox = u; *oy = v; return true; }
		}
	}
	*ox = x; *oy = y; return false;
}

/* ---------------- entità ---------------- */
static float stHP(const EnemyDef *b) { int s = P.st; return 1 + .07f * s + (b->boss ? .06f * s : 0); }
static float stAT(const EnemyDef *b) { int s = P.st; return 1 + .05f * s + (b->boss ? .04f * s : 0); }
static int eidN = 0;
Ent *mkEn(int t, int x, int y) {
	if (t < 0) return NULL;
	Ent *e = entNew(K_EN, x + .5f, y + .5f); if (!e) return NULL;
	const EnemyDef *b = &E[t];
	float s = (1 + ZLV * .15f) * (b->np ? 1 : stHP(b));
	const Diff *df = &DFS[P.df];
	e->t = t; e->id = eidN++;
	e->hp = e->mx = roundf(b->hp * s * df->hp);
	e->at = b->at * (1 + ZLV * .1f) * df->dm * (b->np ? 1 : stAT(b));
	e->xp = b->xp * (1 + ZLV * .3f);
	e->sp = b->sp; e->r = b->r; e->cd = b->cd; e->ag = b->ag; e->cdt = b->cd; e->slt = 4;
	e->boss = b->boss; e->model = b->mdl; e->face = fri(0, 7);
	e->uid = 0x80000000u | (u32)e->id; elSetEnemy(e);
	if (malOn(0)) { e->sp *= 1.3f; e->cd *= .85f; e->cdt = e->cd; }   // maledizioni: nemici veloci
	if (malOn(1)) e->at *= 1.3f;                                          // furia
	snprintf(e->name, sizeof e->name, "%s", b->n);
	if (!b->np) hardMk(e);   // 7.11/8.3: il regno più difficile, i Campioni
	return e;
}
static int poSt(const char *s) {
	if (!s) return PO_OTHER;
	if (!strcmp(s, "door")) return PO_DOOR;
	if (!strcmp(s, "exit")) return PO_EXIT;
	if (!strcmp(s, "cancello") || !strcmp(s, "gate")) return PO_GATE;
	if (!strcmp(s, "dun")) return PO_DUN;
	if (!strcmp(s, "down")) return PO_DOWN;
	if (!strcmp(s, "up")) return PO_UP;
	if (!strcmp(s, "void")) return PO_VOID;
	return PO_OTHER;
}
Ent *mkPo(float x, float y, const char *to, int st, const char *name) {
	Ent *e = entNew(K_PO, x, y); if (!e) return NULL;
	snprintf(e->to, sizeof e->to, "%s", to); e->st = st;
	snprintf(e->name, sizeof e->name, "%s", name ? name : zoneTitle(to));
	return e;
}

/* ---------------- caricamento ---------------- */
static void fileName(const char *k, int run, char *out, int n) {
	char b[48]; int j = 0;
	for (const char *p = k; *p && j < 46; p++) b[j++] = (*p == '@' || *p == '#') ? '_' : *p;
	b[j] = 0;
	if (strchr(k, '@')) snprintf(out, n, DATA_DIR "z_%s_%d", b, run & 1); else snprintf(out, n, DATA_DIR "z_%s", b);
}
static QBox *ZBOX = NULL; static int ZNB = 0;
// 3DS 1.5: zone generate sulla console (la Torre della Corona): la geometria arriva già fatta da story6.c
void worldAdopt(int n, QBox *boxes, int nb, float sx, float sy) {
	N = n; free(ZBOX); ZBOX = boxes; ZNB = nb; spX = sx; spY = sy;
	static s16 top[MAXN * MAXN]; for (int i = 0; i < n * n; i++) { top[i] = -32000; TCOL[i / n][i % n] = 0; }
	for (int i = 0; i < nb; i++) { QBox *q = &ZBOX[i]; if (q->tile >= n * n || q->a < 128) continue; int tz = q->z + q->h; if (tz >= top[q->tile]) { top[q->tile] = tz; TCOL[q->tile / n][q->tile % n] = (q->r << 16) | (q->g << 8) | q->b; } }
}
static bool loadFiles(const char *k, int run) {
	char base[80], fn[96];
	fileName(k, run, base, sizeof base);
	snprintf(fn, sizeof fn, "%s.bin", base);
	FILE *f = fopen(fn, "rb"); if (!f) return false;
	u8 hd[10];
	if (fread(hd, 1, 10, f) != 10 || memcmp(hd, "VXZ1", 4)) { fclose(f); return false; }
	int n = hd[4] | hd[5] << 8, nb = hd[6] | hd[7] << 8, nl = hd[8] | hd[9] << 8;
	if (n > MAXN) { fclose(f); return false; }
	N = n;
	static u8 row[MAXN * MAXN];
	fread(row, 1, n * n, f); for (int y = 0; y < n; y++) memcpy(M[y], row + y * n, n);
	fread(row, 1, n * n, f); for (int y = 0; y < n; y++) memcpy(OCCT[y], row + y * n, n);
	free(ZBOX); ZBOX = malloc(sizeof(QBox) * (nb ? nb : 1)); ZNB = nb;
	fread(ZBOX, sizeof(QBox), nb, f);
	// colore di ogni casella vista dall'alto, per la minimappa: il voxel più alto
	{ static s16 top[MAXN * MAXN]; for (int i = 0; i < n * n; i++) { top[i] = -32000; TCOL[i / n][i % n] = 0; }
	  for (int i = 0; i < nb; i++) { QBox *q = &ZBOX[i]; if (q->tile >= n * n || q->a < 128) continue; int tz = q->z + q->h; if (tz >= top[q->tile]) { top[q->tile] = tz; TCOL[q->tile / n][q->tile % n] = (q->r << 16) | (q->g << 8) | q->b; } } }
	NSLIGHT = 0;
	for (int i = 0; i < nl; i++) {
		u8 l[12]; if (fread(l, 1, 12, f) != 12) break;
		s16 x = l[0] | l[1] << 8, y = l[2] | l[3] << 8; s16 z = l[4] | l[5] << 8; u16 r = l[6] | l[7] << 8;
		addSLight(x / 256.f, y / 256.f, z, fmaxf(1.2f, r / 45.f), (l[8] << 16) | (l[9] << 8) | l[10], l[11] / 255.f);
	}
	fclose(f);
	// metadati ed entità
	snprintf(fn, sizeof fn, "%s.json", base);
	f = fopen(fn, "rb"); if (!f) return false;
	fseek(f, 0, SEEK_END); long len = ftell(f); fseek(f, 0, SEEK_SET);
	char *txt = malloc(len + 1); fread(txt, 1, len, f); txt[len] = 0; fclose(f);
	if (ZA.cap < (size_t)len * 4 + 65536) { jaFree(&ZA); jaInit(&ZA, len * 4 + 65536); }
	jaReset(&ZA);
	J *z = jParse(&ZA, txt, len);
	free(txt);
	if (!z) return false;
	snprintf(ZNAME, sizeof ZNAME, "%s", jgs(z, "n", k));
	{ extern int ZELZ; ZELZ = elKey(jgs(z, "elz", "")); }
	ZLV = (int)jgn(z, "lv", 0); ZINT = jgn(z, "int", 0) != 0; ZOUT = jgn(z, "out", 0) != 0;
	ZLV0 = ZLV; ZLV = lv83(k, ZLV);   // 8.3: i nemici seguono il livello del dungeon e il tuo
	ZBG = jcolor(jgs(z, "bg", NULL), 0x141820);
	ZTC = jcolor(jgs(z, "tc", NULL), 0xffb04a);
	ZMUS = musicFor(jgs(z, "mus", ""));
	if (ZDG >= 0 && ZRUN) { char b[96]; snprintf(b, sizeof b, "%s · ciclo %d", ZNAME, ZRUN + 1); snprintf(ZNAME, sizeof ZNAME, "%s", b); }
	J *sp = jget(z, "sp"); spX = jnum(jat(sp, 0), 1.5); spY = jnum(jat(sp, 1), 1.5);
	JFOR(e, jget(z, "ents")) {
		const char *k2 = jgs(e, "k", "");
		float x = jgn(e, "x", 0), y = jgn(e, "y", 0);
		Ent *q = NULL;
		if (!strcmp(k2, "npc")) {
			q = entNew(K_NPC, x, y); if (!q) continue;
			q->nid = npcIdx(jgs(e, "nid", "")); snprintf(q->name, sizeof q->name, "%s", jgs(e, "n", "?"));
			q->wd = jgn(e, "wd", 0) != 0; q->model = (int)jgn(e, "mdl", -1); q->slp = jgn(e, "slp", 0) != 0;
			q->wt = 1 + frnd() * 3; q->face = 0;
		} else if (!strcmp(k2, "en")) {
			q = mkEn(enemyIdx(jgs(e, "t", "")), (int)x, (int)y); if (q) { q->px = x; q->py = y; }
		} else if (!strcmp(k2, "po")) {
			q = mkPo(x, y, jgs(e, "to", "town"), poSt(jgs(e, "st", NULL)), jgs(e, "n", NULL));
			if (q) { q->seal = jgn(e, "seal", 0) != 0; q->col = jcolor(jgs(e, "col", NULL), 0x5fe0ff); const char *lk = jgs(e, "lock", NULL); if (lk) { snprintf(q->lock, sizeof q->lock, "%s", lk); q->lockMsg = jgs(e, "lockMsg", NULL); } }
		} else if (!strcmp(k2, "ch")) {
			const char *hc = jgs(e, "hc", NULL);
			u32 hk = hc ? hs(hc) : 0;
			bool looted = false;
			if (hk) for (int i = 0; i < 24; i++) if (P.hcK[i] == hk && P.hcT[i] + 600000ULL > osGetTime()) looted = true;
			if (looted) continue;
			q = entNew(K_CH, x, y); if (q) { q->rich = jgn(e, "rich", 0) != 0; q->hc = (int)hk; }
		} else if (!strcmp(k2, "tc")) {
			q = entNew(K_TC, x, y); addSLight(x, y, 26, 3.6f, ZTC, .9f);
		} else if (!strcmp(k2, "lore")) {
			const char *id = jgs(e, "id", "");
			int li = -1; for (int i = 0; i < NLORE; i++) if (!strcmp(LOREID[i], id)) li = i;
			if (li < 0 || (P.lore & (1u << li))) continue;
			q = entNew(K_LORE, x, y); if (q) { q->sid = li; snprintf(q->name, sizeof q->name, "Pagina di diario"); }
		} else if (xPropKind(k2) > 0) {
			// 3DS 1.5: botteghe, stallo, Viandante, Casa degli alleati, Torre... dove li mette il browser
			q = xEntNew((u8)xPropKind(k2), x, y); if (q) { q->model = xPropModel(k2); snprintf(q->name, sizeof q->name, "%s", jgs(e, "n", "")); }
		} else if (!strcmp(k2, "sig48")) {
			static int sigN; extern int MD_SIG48; if (!strcmp(Zk, "giungla48")) { int i = 0; for (int k = 0; k < NENT; k++) if (ents[k].k == K_X && ents[k].xk == XK_SIG) i++; sigN = i; }
			q = xEntNew(XK_SIG, x, y); if (q) { q->xs = sigN; q->model = MD_SIG48; snprintf(q->name, sizeof q->name, "Santuario del Sigillo di Giada"); }
		} else if (!strcmp(k2, "trag48b")) {
			q = mkPo(x, y, "porto", PO_OTHER, "La Stella del Sud · per Aldoria");
		} else if (!strcmp(k2, "lev")) {
			q = entNew(K_LEV, x, y); if (q) { snprintf(q->lev, sizeof q->lev, "%s", jgs(e, "id", "L1")); snprintf(q->name, sizeof q->name, "%s", jgs(e, "n", "Leva antica")); }
		} else if (!strcmp(k2, "res")) {
			q = entNew(K_RES, x, y); if (q) { snprintf(q->res, sizeof q->res, "%s", jgs(e, "r", "?")); snprintf(q->name, sizeof q->name, "%s", jgs(e, "n", q->res)); }
		}
	}
	// il portale per la Cittadella del Vuoto compare quando la corona è riforgiata
	if (!strcmp(k, "in_castle") && P.st >= 3) { J *vp = jget(z, "vp"); if (vp) mkPo(jnum(jat(vp, 0), 14.5), jnum(jat(vp, 1), 12.5), "cittadella@1", PO_VOID, "Cittadella del Vuoto"); }
	return true;
}

void loadZone(const char *k, const char *from) {
	plLog("zona %s (da %s)", k, from ? from : "-");
	float relx = P.px / (N ? N : 1), rely = P.py / (N ? N : 1);
	char key[32]; snprintf(key, sizeof key, "%s", k);
	extern bool torIsZone(const char *k); bool gen = torIsZone(key);
	if (!gen && !zoneExists(key)) { msg("Questo luogo non è disponibile sulla Vita"); return; }
	ZDG = -1; ZDN = 0; ZRUN = 0;
	char *at = strchr(key, '@');
	if (at) {
		char d[24]; snprintf(d, sizeof d, "%.*s", (int)(at - key), key);
		ZDG = dgIdx(d); ZDN = atoi(at + 1);
		ZRUN = netOk ? netRuns(d) : (ZDG >= 0 ? P.runs[ZDG] : 0);
		if (ZDG >= 0) P.seen[ZDG] = 1;
	}
	NENT = 0; eidN = 0;
	NFX = NPOP = NPJ = NPARTS = 0;
	IT = NULL; TGT = NULL;
	snprintf(Zk, sizeof Zk, "%s", key);
	if (gen) { extern void torGen(const char *k); NSLIGHT = 0; torGen(key); }
	else if (!loadFiles(key, ZRUN)) { msg("Errore nel caricare %s", key); return; }
	float sx = spX, sy = spY;
	if (from && *from) {
		Ent *best = NULL; float bd = 1e9f;
		for (int i = 0; i < NENT; i++) {
			Ent *e = &ents[i];
			if (e->k != K_PO || strcmp(e->to, from)) continue;
			float d = hyp(e->px / N - relx, e->py / N - rely);
			if (d < bd) { bd = d; best = e; }
		}
		if (best) { int u, v; nearFree((int)best->px, (int)best->py, &u, &v); sx = u + .5f; sy = v + .5f; }
	}
	if (blk(sx, sy)) { int u, v; nearFree((int)sx, (int)sy, &u, &v); sx = u + .5f; sy = v + .5f; }
	{ extern void levLoad(void); levLoad(); }
	P.px = sx; P.py = sy;
	P.ndmh = 0; P.dmk = 0;
	{ extern float STA; extern bool STEX; extern int stMax(void); STA = stMax(); STEX = false; }
	camX = 32 * (P.px - P.py); camY = 16 * (P.px + P.py) - 10;
	hardZone();
	xZoneLoad();
	npcMarks();
	rBuildZone(ZBOX, ZNB);
	uiMinimapDirty();
	music(ZMUS);
	saveGame();
}
