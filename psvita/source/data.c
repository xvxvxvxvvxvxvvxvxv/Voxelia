// Voxelia PS Vita (motore del port 3DS) - tabelle del gioco lette da romfs:/data.json (esportato dalla versione browser 7.50),
// oggetti e modelli animati (romfs:/models.bin, romfs:/hero.bin).
#include "voxelia.h"

static JArena DA;
static J *DROOT;

/* ================= casualità ================= */
static u32 FSEED = 0x9E3779B9;
static float mulberry(u32 *a) {
	*a = *a + 0x6D2B79F5u;
	u32 t = *a;
	t = (t ^ (t >> 15)) * (1u | t);
	t = (t + ((t ^ (t >> 7)) * (61u | t))) ^ t;
	return (float)((t ^ (t >> 14)) >> 8) / 16777216.0f;
}
float frnd(void) { return mulberry(&FSEED); }
u32 rngSwap(u32 s) { u32 o = FSEED; FSEED = s; return o; }
J *dataRoot(void) { return DROOT; }
int fri(int a, int b) { int v = a + (int)floorf(frnd() * (b - a + 1)); return v > b ? b : v; }
u32 hs(const char *s) { u32 h = 2166136261u; for (; *s; s++) h = (h ^ (u8)*s) * 16777619u; return h; }

/* ================= oggetti ================= */
u32 RC[5] = {0xc8ccd4, 0x4aa3ff, 0xb866ff, 0xffae2b, 0xff4d6d};
const char *RN[5] = {"Comune", "Raro", "Epico", "Leggendario", "Arena"};
static const char *RS[4] = {"", " d'Acciaio", " delle Rune", " del Drago"};
static const float RM[5] = {1, 1.4f, 1.9f, 2.8f, 3.3f};
const char *SN[4] = {"Arma", "Elmo", "Corazza", "Scudo"};
static const char *SLW[] = {"Pugnale", "Spada", "Ascia", "Martello", "Lancia", "Bastone", "Falce", "Stocco"};
static const char *SLH[] = {"Elmo", "Cappuccio", "Corona", "Celata"};
static const char *SLC[] = {"Corazza", "Giaco", "Tunica", "Cotta di maglia"};
static const char *SLS[] = {"Scudo", "Brocchiere", "Pavese"};
static float ibase(int s, int lv) { return (s == SL_W ? 5 : s == SL_C ? 4 : 2.5f) + lv * (s == SL_W ? 2 : 1.4f); }

Item mkItem(int lv, int minR, int slot) {
	Item it; memset(&it, 0, sizeof it);
	int s = slot >= 0 ? slot : fri(0, 3);
	int r = frnd() < .03f ? 3 : frnd() < .12f ? 2 : frnd() < .35f ? 1 : 0;
	if (r < minR) r = minR;
	int v = (int)roundf(ibase(s, lv) * RM[r] * (.85f + frnd() * .3f));
	const char **a; int na;
	switch (s) { case SL_W: a = SLW; na = 8; break; case SL_H: a = SLH; na = 4; break; case SL_C: a = SLC; na = 4; break; default: a = SLS; na = 3; }
	it.s = s; it.r = r; it.v = v; it.p = v * 5; it.used = 1;
	snprintf(it.n, sizeof it.n, "%s%s", a[fri(0, na - 1)], RS[r > 3 ? 3 : r]);
	if (r >= 2 && frnd() < .6f) { if (s == SL_W) it.cr = fri(2, 4 + r * 2); else it.hp = (int)roundf(fri(5, 12) * (r - 1) + lv * 2); }
	itemRollEl(&it);   // 7.55: le armi rare in su a volte nascono con un elemento
	return it;
}
int iv(const Item *it) { if (!it || !it->used) return 0; return (int)roundf(it->v * (1 + .12f * it->up)); }
void iname(const Item *it, char *out, int n) { if (it->up) snprintf(out, n, "%s +%d", it->n, it->up); else snprintf(out, n, "%s", it->n); }
// oggetti unici dei boss: tabella UQ della versione browser [slot, nome, critico, vita]
Item mkUniq(int et, int lv) {
	J *q = jget(jget(DROOT, "UQ"), E[et].id);
	if (!q || q->n < 4) return mkItem(lv + 1, 3, -1);
	const char *sl = jstr(jat(q, 0), "w");
	Item it; memset(&it, 0, sizeof it);
	it.s = sl[0] == 'w' ? SL_W : sl[0] == 'h' ? SL_H : sl[0] == 'c' ? SL_C : SL_S;
	it.r = 3; it.v = (int)roundf(ibase(it.s, lv + 1) * RM[3] * 1.15f); it.p = it.v * 6; it.used = 1;
	snprintf(it.n, sizeof it.n, "%s", jstr(jat(q, 1), "Oggetto unico"));
	it.cr = (u8)jnum(jat(q, 2), 0);
	int hp = (int)jnum(jat(q, 3), 0); if (hp) it.hp = hp + lv * 3;
	return it;
}
// tipo del modello dal nome, come itype() dell'originale: arma 0..7 (swd dag axe ham spr tri stf scy), elmo 0..3 (helm crn hood mask),
// corazza 0..2 (plate mail robe), scudo 0..2 (kite buck pav)
int itemType(const Item *it) {
	const char *n = it->n;
	switch (it->s) {
	case SL_W:
		if (strstr(n, "Pugnale") || strstr(n, "Daga") || strstr(n, "Coltello")) return 1;
		if (strstr(n, "Ascia") || strstr(n, "Mannaia")) return 2;
		if (strstr(n, "Martello") || strstr(n, "Clava") || strstr(n, "Mazza") || strstr(n, "Maglio") || strstr(n, "Randello")) return 3;
		if (strstr(n, "Lancia") || strstr(n, "Alabarda") || strstr(n, "Picca")) return 4;
		if (strstr(n, "Tridente")) return 5;
		if (strstr(n, "Bastone") || strstr(n, "Scettro") || strstr(n, "Bacchetta") || strstr(n, "Verga")) return 6;
		if (strstr(n, "Falce")) return 7;
		return 0;
	case SL_H:
		if (strstr(n, "Corona") || strstr(n, "Diadema")) return 1;
		if (strstr(n, "Cappuccio")) return 2;
		if (strstr(n, "Maschera") || strstr(n, "Celata")) return 3;
		return 0;
	case SL_C:
		if (strstr(n, "Cotta") || strstr(n, "Giaco")) return 1;
		if (strstr(n, "Tunica") || strstr(n, "Veste")) return 2;
		return 0;
	default:
		if (strstr(n, "Brocchiere")) return 1;
		if (strstr(n, "Pavese")) return 2;
		return 0;
	}
}

/* ================= tabelle ================= */
EnemyDef E[100]; int NE = 0;
NpcDef NPCS[260]; int NNPC = 0;
QuestDef QT[200]; int NQT = 0;
DungeonDef DG[10]; int NDG = 0;
Diff DFS[4] = {{"Facile", .7f, .6f, 1.4f, 1.25f, 0}, {"Normale", 1, 1, 1, 1, 0}, {"Difficile", 1.5f, 1.4f, .9f, 1.2f, 0}, {"Incubo", 2.2f, 2, .8f, 1.5f, 1}};
const char *SHARDS[6] = {"tana", "cripta", "piramide", "cristallo", "fucina", "abisso"};
Lore LORE[24]; const char *LOREID[24]; int NLORE = 0;
const char *STORY_INTRO = "", *STORY_FORGE = "", *STORY_END = "";
const char *SHT[6];
const char *DGH[10];
const char *VLINES[16]; int NVLINES = 0;

int enemyIdx(const char *id) { if (!id) return -1; for (int i = 0; i < NE; i++) if (!strcmp(E[i].id, id)) return i; return -1; }
int npcIdx(const char *id) { if (!id) return -1; for (int i = 0; i < NNPC; i++) if (!strcmp(NPCS[i].id, id)) return i; return -1; }
int questIdx(const char *id) { if (!id) return -1; for (int i = 0; i < NQT; i++) if (!strcmp(QT[i].id, id)) return i; return -1; }
int dgIdx(const char *id) { if (!id) return -1; for (int i = 0; i < NDG; i++) if (!strcmp(DG[i].id, id)) return i; return -1; }
bool zoneExists(const char *k) {
	J *z = jget(DROOT, "zones");
	if (strchr(k, '@')) { char b[48]; snprintf(b, sizeof b, "%s#0", k); return jget(z, b) != NULL; }
	return jget(z, k) != NULL;
}
int zoneCount(void) { J *z = jget(DROOT, "zones"); return z ? z->n : 0; }
const char *zoneKeyAt(int i) { J *z = jget(DROOT, "zones"); int k = 0; JFOR(c, z) { if (k++ == i) return c->key; } return NULL; }
const char *zoneTitle(const char *k) {
	static char b[96];
	char key[48]; snprintf(key, sizeof key, "%s", k);
	char *at = strchr(key, '@');
	if (at) { *at = 0; int d = dgIdx(key); if (d >= 0) return DG[d].n; }
	J *z = jget(jget(DROOT, "Z"), k);
	snprintf(b, sizeof b, "%s", jgs(z, "n", k));
	return b;
}
static int roleOf(const char *r) {
	static const char *R[] = {"", "king", "sage", "inn", "bard", "smith", "alch", "heal", "shop", "cat", "casino", "arena", "buyer", "fisher", "motel", "naval", "dim", "master"};
	if (!r) return 0;
	for (int i = 1; i < (int)(sizeof R / sizeof R[0]); i++) if (!strcmp(R[i], r)) return i;
	return 0;
}
static int qtype(const char *t) {
	static const char *T[] = {"kill", "col", "boss", "talk", "fish", "gat", "step", "bat"};
	for (int i = 0; i < 8; i++) if (t && !strcmp(T[i], t)) return i;
	return QK_KILL;
}

static char *readFile(const char *path, size_t *len) {
	FILE *f = fopen(path, "rb"); if (!f) return NULL;
	fseek(f, 0, SEEK_END); long n = ftell(f); fseek(f, 0, SEEK_SET);
	char *b = malloc(n + 1); if (!b) { fclose(f); return NULL; }
	fread(b, 1, n, f); b[n] = 0; fclose(f);
	if (len) *len = n;
	return b;
}

void dataInit(void) {
	FSEED ^= (u32)osGetTime();
	size_t len; char *txt = readFile(DATA_DIR "data.json", &len);
	if (!txt) return;
	jaInit(&DA, len * 4 + (1 << 20));
	DROOT = jParse(&DA, txt, len);
	free(txt);
	if (!DROOT) return;
	J *rc = jget(DROOT, "RC"); for (int i = 0; i < 5; i++) RC[i] = jcolor(jstr(jat(rc, i), NULL), RC[i]);
	// nemici
	JFOR(e, jget(DROOT, "E")) {
		if (NE >= 100) break;
		EnemyDef *d = &E[NE++];
		d->id = e->key; d->n = jgs(e, "n", e->key);
		d->hp = jgn(e, "hp", 20); d->at = jgn(e, "at", 5); d->xp = jgn(e, "xp", 5); d->sp = jgn(e, "sp", 2); d->r = jgn(e, "r", 1.1); d->cd = jgn(e, "cd", 1.2); d->ag = jgn(e, "ag", 7);
		d->boss = jgn(e, "boss", 0) != 0; d->slam = jgn(e, "slam", 0) != 0; d->np = jgn(e, "np", 0) != 0;
		d->rng = jcolor(jgs(e, "rng", NULL), 0);
		d->mdl = (int)jgn(e, "mdl", -1);
		d->sum = -1;
		d->kind = jgs(e, "kind", "");
		{ J *xe = jget(jget(DROOT, "XM"), "el"), *xh = jget(jget(DROOT, "XM"), "elh"); d->el = (u8)elKey(jgs(xe, e->key, "")); d->elh = (u8)elKey(jgs(xh, e->key, "")); }
	}
	xModels(jget(DROOT, "XM"));
	{ int i = 0; JFOR(e, jget(DROOT, "E")) { if (i >= NE) break; E[i].sum = enemyIdx(jgs(e, "sum", NULL)); i++; } }
	// personaggi
	JFOR(n, jget(DROOT, "NPCS")) {
		if (NNPC >= 260) break;
		NpcDef *d = &NPCS[NNPC++];
		memset(d, 0, sizeof *d);
		d->id = n->key; d->n = jgs(n, "n", n->key); d->role = roleOf(jgs(n, "role", NULL));
		d->c = jcolor(jgs(n, "c", NULL), 0x888888); d->hat = jcolor(jgs(n, "hat", NULL), 0x555555);
		JFOR(q, jget(n, "qs")) if (d->nqs < 12) d->qs[d->nqs++] = jstr(q, "");
		JFOR(l, jget(n, "ln")) if (d->nln < 10) d->ln[d->nln++] = jstr(l, "...");
		d->buy = jgs(n, "buy", NULL);
	}
	// dungeon
	J *th = jget(DROOT, "TH");
	JFOR(g, jget(DROOT, "DG")) {
		if (NDG >= 10) break;
		DungeonDef *d = &DG[NDG++];
		memset(d, 0, sizeof *d);
		d->id = g->key; d->n = jgs(g, "n", g->key); d->lv = (int)jgn(g, "lv", 1); d->fls = (int)jgn(g, "fls", 2);
		JFOR(x, jget(g, "en")) if (d->nen < 6) { int k = enemyIdx(jstr(x, "")); if (k >= 0) d->en[d->nen++] = k; }
		d->boss = enemyIdx(jgs(g, "boss", NULL));
		d->ent = jgs(g, "ent", "town"); d->fin = jgn(g, "fin", 0) != 0;
		J *t = jget(th, jgs(g, "th", ""));
		d->tc = jcolor(jgs(t, "tc", NULL), 0xffb04a); d->bg = jcolor(jgs(t, "bg", NULL), 0x0a0806);
	}
	// missioni
	JFOR(q, jget(DROOT, "QT")) {
		if (NQT >= 200) break;
		QuestDef *d = &QT[NQT++];
		memset(d, 0, sizeof *d);
		d->id = q->key; d->t = qtype(jgs(q, "t", "kill"));
		JFOR(x, jget(q, "e")) if (d->ne < 6) { int k = enemyIdx(jstr(x, "")); if (k >= 0) d->e[d->ne++] = k; }
		d->n = (int)jgn(q, "n", 1); d->lv = (int)jgn(q, "lv", 0);
		d->it = jgs(q, "it", NULL); d->to = jgs(q, "to", NULL); d->ti = jgs(q, "ti", q->key); d->tx = jgs(q, "tx", "");
		d->r = jgs(q, "r", NULL); d->unl = jgs(q, "unl", NULL); d->req = jgs(q, "req", NULL); d->f = jgs(q, "f", NULL);
		d->ch = jgn(q, "ch", 0); d->g = (int)jgn(q, "g", 10); d->x = (int)jgn(q, "x", 8); d->once = jgn(q, "once", 0) != 0;
	}
	// storia
	J *st = jget(DROOT, "STORY");
	STORY_INTRO = jgs(st, "intro", ""); STORY_FORGE = jgs(st, "forge", ""); STORY_END = jgs(st, "end", "");
	for (int i = 0; i < 6; i++) SHT[i] = jgs(jget(DROOT, "SHT"), SHARDS[i], "");
	for (int i = 0; i < NDG && i < 10; i++) DGH[i] = jgs(jget(DROOT, "DGH"), DG[i].id, "");
	JFOR(l, jget(DROOT, "LORE")) { if (NLORE >= 24) break; LOREID[NLORE] = l->key; LORE[NLORE].ti = jstr(jat(l, 0), ""); LORE[NLORE].tx = jstr(jat(l, 1), ""); NLORE++; }
	JFOR(v, jget(DROOT, "VLINES")) if (NVLINES < 16) VLINES[NVLINES++] = jstr(v, "");
	J *df = jget(DROOT, "DFS");
	for (int i = 0; i < 4; i++) { J *d = jat(df, i); if (!d) continue; DFS[i].hp = jgn(d, "hp", DFS[i].hp); DFS[i].dm = jgn(d, "dm", DFS[i].dm); DFS[i].lt = jgn(d, "lt", DFS[i].lt); DFS[i].x = jgn(d, "x", DFS[i].x); }
	modelsLoad();
}

/* ================= modelli animati ================= */
AModel *MDL = NULL; int NMDL = 0;
QBox *HERO[1280]; u8 HERON[1280];
void modelsLoad(void) {
	size_t len; u8 *b = (u8 *)readFile(DATA_DIR "models.bin", &len);
	if (b && len > 6 && !memcmp(b, "VXM1", 4)) {
		NMDL = b[4] | b[5] << 8;
		MDL = calloc(NMDL, sizeof(AModel));
		size_t o = 6;
		for (int i = 0; i < NMDL && o + 2 <= len; i++) {
			AModel *m = &MDL[i];
			m->nfr = b[o]; m->fpd = b[o + 1]; o += 2;
			m->fr = calloc(m->nfr, sizeof(QBox *)); m->nb = calloc(m->nfr, sizeof(u16));
			for (int f = 0; f < m->nfr && o + 2 <= len; f++) {
				int nb = b[o] | b[o + 1] << 8; o += 2;
				m->nb[f] = nb; m->fr[f] = (QBox *)(b + o);   // il file resta in memoria
				o += nb * sizeof(QBox);
			}
		}
	}
	u8 *h = (u8 *)readFile(DATA_DIR "hero.bin", &len);
	if (h && len > 6 && !memcmp(h, "VXH1", 4)) {
		int n = h[4] | h[5] << 8; size_t o = 6;
		for (int i = 0; i < n && i < 1280 && o < len; i++) {
			HERON[i] = h[o];
			HERO[i] = malloc(sizeof(QBox) * (h[o] ? h[o] : 1));   // copia allineata (nel file i blocchi iniziano a indirizzi dispari)
			memcpy(HERO[i], h + o + 1, sizeof(QBox) * h[o]);
			o += 1 + h[o] * sizeof(QBox);
		}
		free(h);
	}
}
