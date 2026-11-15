// Voxelia 3DS 1.8 / DS 1.4 - la Storia della 8.12.1 del browser:
// - i segreti di Aldoria e la verità su Aldoria Vecchia, il settimo cuore, l'arresto, il fantasma di Malakar, l'Abominio
//   in cinque fasi e il vero finale (6.9 e 7.11: src/base/8_main.js, src/base/4_render.js, src/storia/8v_abominio.js);
// - il passaggio nel muro della missione del Moreau (6.x), le reliquie del quartiere;
// - l'Atto II · La città sepolta (8.8: src/storia/8zzzzs_atto2.js).
// La Minaccia del Regno, le notti e le invasioni (8.6) sono in story11.c.
// I testi arrivano dal gioco per browser (data.json: TRU, A88, FILMS), le figure da XM (abo, npc88).
#include "voxelia.h"
#include "story.h"
#define C_TXT C2D_Color32(232, 236, 244, 255)
#define C_MU C2D_Color32(154, 164, 184, 255)
#define C_GOLD C2D_Color32(245, 185, 66, 255)
#define RGB32(c) C2D_Color32((c) >> 16, ((c) >> 8) & 255, (c) & 255, 255)

#define XK_SECRET 30
#define XK_RELIQ 31
#define XK_BOTOLA 32
#define XK_PORTAP 33
#define XK_SHARD7 34
#define XK_INS 35
#define XK_ABO 36
#define XK_HOLE 37
#define XK_MKG 38
enum { XP_QA = 40, XP_VER = 42 };

extern J *dataRoot(void);
extern void gain(Item it);
extern int gDay(void);
extern void fxWarn(float x, float y, float r, float t, float dmg);
extern void projAdd(float x, float y, float vx, float vy, float t, float d, u32 c);
extern void hurtPfrom(float at);
extern void xSetPage(int p);
extern void uiOpenPanel(int pm);
static inline float dst(float ax, float ay, float bx, float by) { return hyp(ax - bx, ay - by); }

static J *TRU, *A88, *FILMS, *SECD, *XABO, *XNPC;
static int NSEC;
static void tData(void) {
	if (TRU) return;
	J *r = dataRoot(); TRU = jget(r, "TRU"); A88 = jget(r, "A88"); FILMS = jget(r, "FILMS"); SECD = jget(TRU, "SECD");
	J *xm = jget(r, "XM"); XABO = jget(xm, "abo"); XNPC = jget(xm, "npc88");
	NSEC = 0; JFOR(s, SECD) NSEC++;
}
static int secIdx(const char *sid) { tData(); int i = 0; JFOR(s, SECD) { if (!strcmp(s->key, sid)) return i; i++; } return -1; }
static J *secAt(int i) { int k = 0; JFOR(s, SECD) { if (k == i) return s; k++; } return NULL; }
static int secN(void) { tData(); int n = 0; for (int i = 0; i < NSEC && i < 32; i++) if (X.sec & (1u << i)) n++; return n; }
static bool truthDone(void) { return NSEC > 0 && secN() >= NSEC; }
static int npcModel88(const char *id) { tData(); return (int)jgn(XNPC, id, -1); }

/* ================= pagine di testo una dopo l'altra (filmati, racconti lunghi) ================= */
#define SEQN 28
typedef struct { char ti[64], sub[72], tx[600]; } Pg;
static Pg SEQ[SEQN]; static int SEQn, SEQi; static int SEQend;   // SEQend: che cosa fare alla fine
enum { SE_NONE, SE_CELLA, SE_FINALE, SE_A2GO, SE_A2ELDORA, SE_A2ALBA, SE_PANEL };
static void seqReset(void) { SEQn = SEQi = 0; SEQend = SE_NONE; }
// una pagina per paragrafo (o più paragrafi brevi insieme): sul touch ci stanno circa 560 caratteri
static void seqAdd(const char *ti, const char *sub, const char *tx) {
	if (!tx) return;
	const char *p = tx;
	while (*p && SEQn < SEQN) {
		Pg *g = &SEQ[SEQn]; snprintf(g->ti, sizeof g->ti, "%s", ti ? ti : ""); snprintf(g->sub, sizeof g->sub, "%s", sub ? sub : "");
		int o = 0; g->tx[0] = 0;
		while (*p) {
			const char *q = strstr(p, "\n\n"); int len = q ? (int)(q - p) : (int)strlen(p);
			if (o && o + 2 + len > 560) break;
			if (!o && len > 560) {   // un paragrafo troppo lungo: si taglia dopo un punto
				int cut = 540; while (cut > 200 && !(p[cut] == ' ' && (p[cut - 1] == '.' || p[cut - 1] == ',' || p[cut - 1] == ':'))) cut--;
				if (cut <= 200) { cut = 540; while (cut > 0 && (p[cut] & 0xC0) == 0x80) cut--; }
				memcpy(g->tx, p, cut); g->tx[cut] = 0; o = cut; p += cut; while (*p == ' ') p++; break;
			}
			if (o) { g->tx[o++] = '\n'; g->tx[o++] = '\n'; }
			memcpy(g->tx + o, p, len); o += len; g->tx[o] = 0;
			p += len; if (q) p += 2;
		}
		SEQn++;
	}
}
static void seqShow(void) { if (SEQi < SEQn) { Pg *g = &SEQ[SEQi]; uiOpenText(g->ti, g->tx, g->sub[0] ? g->sub : NULL); } }
static void seqDone(int what);
static void seqPlay(int end) { SEQend = end; SEQi = 0; if (SEQn) seqShow(); else seqDone(end); }
// il «Continua» della pagina: true se c'è un'altra pagina (o un seguito) da mostrare
bool tSeqNext(void) {
	if (!SEQn) return false;
	if (++SEQi < SEQn) { seqShow(); return true; }
	int e = SEQend; seqReset(); if (e == SE_NONE) return false;
	uiClose(); seqDone(e); return PM != PM_NONE;
}
// un filmato del browser, come pagine: chi parla, il titolo, il testo
static void filmAdd(const char *id) {
	tData(); J *f = jget(FILMS, id); if (!f) return;
	const char *n = jgs(f, "n", "");
	JFOR(s, jget(f, "L")) {
		const char *ti = jgs(s, "ti", ""), *sb = jgs(s, "sub", ""), *who = jgs(s, "who", ""), *tx = jgs(s, "tx", "");
		char sub[72]; if (who[0]) snprintf(sub, sizeof sub, "%s", who); else if (ti[0]) snprintf(sub, sizeof sub, "%s%s%s", ti, sb[0] ? " · " : "", sb); else sub[0] = 0;
		if (tx[0]) seqAdd(n, sub, tx);
	}
}
// i filmati visti (X.film): 0 ricordo, 1 verita, 2 settimo, 3 arresto, 4 verofinale, 5 a88_inizio, 6 a88_eldora, 7 a88_alba
static bool filmSeen(int i) { return X.film & (1u << i); }
static void filmMark(int i) { X.film |= 1u << i; }

/* ================= i segreti ================= */
static void secretFind(const char *sid) {
	int i = secIdx(sid); if (i < 0) return; J *d = secAt(i);
	const char *ti = jstr(jat(d, 4), ""), *tx = jstr(jat(d, 5), "");
	bool was = X.sec & (1u << i);
	seqReset(); seqAdd(ti, "Segreto di Aldoria", tx);
	if (!was) {
		X.sec |= 1u << i; gainXP(25); int n = secN();
		char b[80]; snprintf(b, sizeof b, "%s · %d/%d", ti, n, NSEC); banner("Segreto scoperto", b); tone(520, .12f, W_SINE, .05f);
		// i segreti del castello (c1..c14)
		bool allc = true; int k = 0; JFOR(s, SECD) { if (s->key[0] == 'c' && !(X.sec & (1u << k))) allc = false; k++; }
		if (allc && !X.secR1) { X.secR1 = 1; P.g += 400; msg("I segreti del castello: hai scoperto tutto ciò che il castello nascondeva · +400 oro"); }
		if (n >= NSEC && !X.secR2) { X.secR2 = 1; P.g += 1000; msg("Custode dei segreti di Aldoria: hai trovato tutti i %d segreti · +1000 oro", NSEC); }
		// l'ultimo pezzo della verità
		if (!X.tru && truthDone()) {
			X.tru = 1;
			if (!filmSeen(1)) { filmMark(1); filmAdd("verita"); }
			char tt[3000]; snprintf(tt, sizeof tt, "Hai riunito tutti i pezzi della verità.\n\n%s", jgs(TRU, "TRUTHT", ""));
			seqAdd("La verità su Aldoria Vecchia", NULL, tt);
			banner("La verità", "Malakar voleva salvare Aldoria Vecchia");
			if (!strcmp(Zk, "vecchia") && !X.s7) { extern void t10Shard7Spawn(void); t10Shard7Spawn(); }
		}
		saveGame();
	}
	seqPlay(SE_NONE);
	if (!strcmp(sid, "c14")) JINGLE(.2f, W_TRIANGLE, 76, 79, 84, 83, 79, 76, 74, 76, 72);
}

/* ================= Aldoria Vecchia: il muro, le reliquie, la botola, il culto ================= */
static const u32 RELC[5] = {0xc8a84a, 0xa8a8b0, 0x8a5a3a, 0xd4af37, 0x6a8ab8};
static void reliqTake(Ent *e) {
	if (X.vld != gDay()) { X.vld = gDay(); X.vl = 0; }
	X.vl |= 1u << (e->xs & 31); float x = e->px, y = e->py; entDel(e); tone(700, .08f, W_TRIANGLE, .05f);
	float r = frnd(); J *vn = jget(TRU, "VNOTES"); int nv = vn ? vn->n : 0;
	if (r < .35f) { int gd = fri(20, 70); P.g += gd; char b[24]; snprintf(b, sizeof b, "+%d oro", gd); flt(x, y, b, 0xffd84a); msg("Una borsa di monete annerite dal fuoco."); }
	else if (r < .55f) { resAdd("cimelio", 1); flt(x, y, "+1 Cimelio", 0xffe08a); msg("Un cimelio di famiglia, ancora intatto."); }
	else if (r < .78f && nv && (X.vn & ((1u << nv) - 1)) != (1u << nv) - 1) {
		int i = 0; while (i < nv && (X.vn & (1u << i))) i++;
		X.vn |= 1u << i; char b[1200]; snprintf(b, sizeof b, "%s\n\n(Aggiunto al diario)", jstr(jat(vn, i), ""));
		seqReset(); seqAdd("Un oggetto del passato", NULL, b); seqPlay(SE_NONE);
	} else { extern void dropItemAt(Item, float, float); dropItemAt(mkItem(P.lv > 4 ? P.lv : 4, frnd() < .3f ? 2 : 1, -1), x, y); msg("Tra la cenere brilla qualcosa."); }
	saveGame();
}
static void cultDoor(void) {
	if (X.key && X.te >= 1) { tone(90, .6f, W_SAW, .06f); loadZone("occhio", "culto"); return; }
	seqReset(); seqAdd("La porta di pietra", NULL, "Una lastra di pietra nera, liscia come vetro. Al centro è scolpito un grande occhio, aperto.\n\nSotto, incise in lettere antiche:\n\n«La verità sarà nei tuoi occhi, a tempo debito.»\n\nLa porta non si muove. Non ancora."); seqPlay(SE_NONE);
	if (!X.vcult) {
		X.vcult = 1; int q = questIdx("mo6"); for (int i = 0; i < P.nq; i++) if (P.q[i].id == q) P.q[i].c = 1;
		banner("La porta di pietra", "«La verità sarà nei tuoi occhi, a tempo debito»"); saveGame();
	}
	JINGLE(.3f, W_SAW, 48, 51, 55, 50);
}
// il muro crepato dietro le casse, vicino al porto: si scava a colpi (sul 3DS senza il minigioco del piccone)
static void holeDig(Ent *e) {
	int q = questIdx("mo5"); bool on = false; for (int i = 0; i < P.nq; i++) if (P.q[i].id == q) on = true;
	if (!on) { msg("Il muro è crepato e la pietra si sbriciola... ma perché scavare qui?"); return; }
	X.vdp += 20; shake = .25f; tone(120 + X.vdp, .12f, W_SQUARE, .05f); sparks(e->px, e->py, 14, 0x8a8e98, 70);
	char b[32]; snprintf(b, sizeof b, "Scavo %d%%", X.vdp > 100 ? 100 : X.vdp); flt(e->px, e->py, b, 0xffe08a);
	if (X.vdp >= 100) {
		X.vdug = 1; for (int i = 0; i < P.nq; i++) if (P.q[i].id == q) P.q[i].c = 1;
		float x = e->px, y = e->py; entDel(e); mkPo(x, y, "vecchia", PO_OTHER, "Passaggio per Aldoria Vecchia");
		tone(60, 1, W_SAW, .08f); banner("Il passaggio è aperto", "Dall'altra parte, il silenzio. Torna dal Moreau, poi entra.");
	}
	saveGame();
}
void t10Shard7Spawn(void) {
	J *w = jget(TRU, "WELL"); float x = jnum(jat(w, 0), 80) + .5f, y = jnum(jat(w, 1), 14) + 1.5f;
	for (int i = 0; i < NENT; i++) if (ents[i].k == K_X && ents[i].xk == XK_SHARD7) return;
	Ent *e = xEntNew(XK_SHARD7, x, y); if (e) snprintf(e->name, sizeof e->name, "Il settimo cuore");
}
static void shard7Take(Ent *e) {
	entDel(e); X.s7 = 1; JINGLE(.2f, W_SAW, 57, 60, 64, 69, 72); shake = .4f;
	seqReset();
	if (!filmSeen(2)) { filmMark(2); filmAdd("settimo"); }
	seqAdd("Il settimo cuore della Corona", NULL, P.st >= 5
		? "In fondo al pozzo prosciugato della vecchia piazza, avvolto in un panno nero, c'è un frammento che nessuno ha mai visto. È più scuro degli altri sei, e caldo come qualcosa di vivo.\n\nÈ il settimo cuore della Corona: la serratura dell'Occhio.\n\nIl Re Aldric deve saperlo."
		: "In fondo al pozzo prosciugato della vecchia piazza, avvolto in un panno nero, c'è un frammento che nessuno ha mai visto. È più scuro degli altri sei, e caldo come qualcosa di vivo.\n\nÈ il settimo cuore della Corona: la serratura dell'Occhio.\n\nIl Re Aldric deve saperlo, ma prima la Corona va riunita.");
	seqPlay(SE_NONE); banner("Il settimo frammento", "La serratura dell'Occhio"); saveGame();
}

/* ================= l'arresto, la cella, il fantasma, la chiave ================= */
static void arrestHero(void) {
	X.te = 1; X.s7 = 2; saveGame();
	seqReset();
	if (!filmSeen(3)) { filmMark(3); filmAdd("arresto"); }
	if (!SEQn) JFOR(c, jget(TRU, "ARRC")) seqAdd("L'arresto", NULL, jstr(c, ""));
	seqPlay(SE_CELLA);
}
static Ent *ghostSpawn(float x, float y) {
	for (int i = 0; i < NENT; i++) if (ents[i].k == K_NPC && ents[i].nid >= 0 && !strcmp(NPCS[ents[i].nid].id, "malakar_g")) return &ents[i];
	Ent *e = entNew(K_NPC, x + .5f, y + .5f); if (!e) return NULL;
	e->nid = npcIdx("malakar_g"); e->model = npcModel88("malakar_g"); snprintf(e->name, sizeof e->name, "Fantasma di Malakar"); e->face = 0;
	return e;
}
static void ghostGate(void) {
	for (int i = 0; i < NENT; i++) if (ents[i].k == K_PO && !strcmp(ents[i].to, "culto")) return;
	Ent *g = NULL; for (int i = 0; i < NENT; i++) if (ents[i].k == K_NPC && ents[i].nid >= 0 && !strcmp(NPCS[ents[i].nid].id, "malakar_g")) g = &ents[i];
	int x, y; nearFree(g ? (int)g->px + 1 : (int)P.px, g ? (int)g->py : (int)P.py, &x, &y);
	Ent *p = mkPo(x + .5f, y + .5f, "culto", PO_VOID, "Il varco di Malakar"); if (p) p->col = 0x9ad0ff;
}
static void takeKey(void) { X.key = 1; banner("La Chiave dell'Occhio", "Malakar ti ha liberato: la porta di pietra ora si aprirà"); JINGLE(.18f, W_TRIANGLE, 60, 63, 67, 72); ghostGate(); saveGame(); }

/* ================= l'Abominio: cinque fasi ================= */
static const float ARMS[4][2] = {{7.5f, 8.5f}, {20.5f, 8.5f}, {11.5f, 13.5f}, {16.5f, 13.5f}};
#define BX 14
#define BY 6.5f
static const float ABC[2] = {14, 18.4f};
typedef struct { float x, y, r, t, d, k; } Pool;
typedef struct { float t; u8 k; float x, y; } Job;
static struct {
	bool on; int ph, arms; float t, nx, sw, sm, bm, cl, vm, gz, tp, ms, fz, R, win, fr, closed, mks, mkf; bool elb, enr, frOn;
	float gzA; int gzDir, gzN; float gzK; bool gzOn;
	Pool pool[12]; int npool; Job job[24]; int njob;
} OC;
bool t10Occ(void) { return OC.on && !strcmp(Zk, "occhio"); }
static float abAt(void) { return (ZLV * .1f + 1) * DFS[P.df].dm; }
static int partN(const char *id) { int t = enemyIdx(id), n = 0; for (int i = 0; i < NENT; i++) if (ents[i].k == K_EN && ents[i].t == t && ents[i].hp > 0) n++; return n; }
static Ent *partFirst(const char *id) { int t = enemyIdx(id); for (int i = 0; i < NENT; i++) if (ents[i].k == K_EN && ents[i].t == t && ents[i].hp > 0) return &ents[i]; return NULL; }
static Ent *abPart(const char *id, float x, float y) {
	Ent *e = mkEn(enemyIdx(id), (int)x, (int)y); if (!e) return NULL;
	e->px = e->t1.ax = x; e->py = e->t1.ay = y; e->t1.anc = 1; e->al = 1; return e;
}
static void abWarn(float x, float y, float r, float t, float d) { if (x < 1 || y < 1 || x > N - 2 || y > N - 2) return; fxWarn(x, y, r, t, d); }
static void abSweep(float cx, float cy, float a0, float a1, int n, float r0, float rad, float d, float t0) { for (int i = 0; i < n; i++) { float a = a0 + (a1 - a0) * i / (n - 1); abWarn(cx + cosf(a) * r0, cy + sinf(a) * r0, rad, t0 + i * .12f, d); } }
static void abRay(float cx, float cy, float a, int n, float st, float rad, float d, float t0, float dt2) { for (int i = 1; i <= n; i++) abWarn(cx + cosf(a) * i * st, cy + sinf(a) * i * st, rad, t0 + i * dt2, d); }
static void abLater(float t, u8 k, float x, float y) { if (OC.njob < 24) OC.job[OC.njob++] = (Job){t, k, x, y}; }
static void spawnSouls(int n, int cap, float cx, float cy, float rx, float ry) {
	if (partN("anima") >= cap) return;
	for (int i = 0; i < n; i++) { int x, y; nearFree((int)(cx + (frnd() - .5f) * 2 * rx), (int)(cy + (frnd() - .5f) * 2 * ry), &x, &y); Ent *m = mkEn(enemyIdx("anima"), x, y); if (m) m->al = 1; }
}
static void occEnter(void) {
	memset(&OC, 0, sizeof OC);
	if (X.te != 1) return;
	OC.on = true; OC.ph = 1; OC.arms = 4; OC.nx = 3; OC.sw = 7; OC.sm = 5; OC.bm = 4; OC.cl = 9; OC.vm = 7; OC.gz = 9; OC.tp = 5; OC.ms = 3; OC.R = 14;
	for (int i = 0; i < 4; i++) { Ent *e = abPart("abo_braccio", ARMS[i][0], ARMS[i][1]); if (e) e->xs = i; }
	banner("L'Abominio", "Ciò che dormiva sotto Aldoria"); shake = .6f; tone(28, 1.6f, W_SAW, .08f);
	msg("Malakar: «Colpisci prima le braccia, poi il ventre, poi la testa. Io sarò con te.»");
}
static void abPhase(int n) {
	OC.ph = n; OC.t = 0; OC.nx = 2.4f; OC.sm = 4; OC.bm = 3; OC.sw = 6; OC.cl = 8; OC.vm = 5; OC.gz = 6; OC.tp = 4; OC.ms = 2;
	shake = 1.2f; tone(40, 1.2f, W_SAW, .08f);
	if (n == 2) { abPart("abo_ventre", 14, 12.6f); banner("Il ventre si apre", "Le braccia sono cadute: ora colpisci il ventre"); msg("Malakar: «Il ventre! Quando si chiude, allontanati dall'acido e aspetta.»"); }
	if (n == 3) {
		Ent *e = mkEn(enemyIdx("elara_ombra"), 14, 17); if (e) { e->px = 14; e->py = 17.2f; e->al = 1; e->t1.shd = gtime + 2.2f; }
		banner("L'eco della Regina", "Dal ventre squarciato esce l'ombra della Regina Elara");
		msg("Malakar: «Elara... È lei. L'Abominio l'ha presa quella notte. Liberala, eroe: non è più lei.»");
	}
	if (n == 4) { abPart("abo_testa", 14, 12.6f); banner("L'Occhio si apre", "La testa si abbassa: colpiscila, e non restare davanti allo sguardo"); msg("Malakar: «Lo sguardo gira! Corrigli dietro, non davanti!»"); }
	if (n == 5) {
		abPart("abo_cuore", 14, 12.6f); OC.R = 14;
		banner("Il cuore dell'Abominio", "La nebbia si stringe: distruggi il cuore prima che ti soffochi");
		int x, y; nearFree((int)P.px - 2, (int)P.py + 1, &x, &y); Ent *g = xEntNew(XK_MKG, x + .5f, y + .5f); if (g) { g->model = npcModel88("malakar_g"); snprintf(g->name, sizeof g->name, "Fantasma di Malakar"); }
		msg("Malakar: «Ora! Il cuore! Ti proteggo io, finché posso!»");
	}
}
static void trueEnding(void);
static void occTick(float dt) {
	if (!t10Occ()) return;
	OC.t += dt;
	// i ritardi della battaglia
	for (int i = 0; i < OC.njob; i++) {
		Job *j = &OC.job[i]; j->t -= dt; if (j->t > 0) continue;
		float A = abAt();
		if (j->k == 1 && OC.npool < 12) OC.pool[OC.npool++] = (Pool){j->x, j->y, OC.ph == 5 ? 1 : 1.1f, OC.ph == 5 ? 5 : 6, 40 * A, 0};
		if (j->k == 2 && OC.ph == 1) abWarn(P.px + P.dr[0] * 1.8f, P.py + P.dr[1] * 1.8f, 1.5f, .95f, 230 * A);
		if (j->k == 3) msg("Elara: «I bambini sono al sicuro... Di' a Malakar che gli ho sempre creduto.»");
		OC.job[i--] = OC.job[--OC.njob];
	}
	// le parti stanno ferme al loro posto
	for (int i = 0; i < NENT; i++) if (ents[i].k == K_EN && ents[i].t1.anc) { ents[i].px = ents[i].t1.ax; ents[i].py = ents[i].t1.ay; }
	for (int i = 0; i < OC.npool; i++) { Pool *p = &OC.pool[i]; p->t -= dt; p->k -= dt; if (p->k <= 0 && dst(P.px, P.py, p->x, p->y) < p->r) { p->k = .5f; hurtPfrom(p->d); } if (p->t <= 0) OC.pool[i--] = OC.pool[--OC.npool]; }
	if (OC.win > 0) { OC.win -= dt; if (OC.win <= 0) { OC.on = false; trueEnding(); } return; }
	float A = abAt();
	int arms = partN("abo_braccio"), ven = partN("abo_ventre"), ela = partN("elara_ombra"), tes = partN("abo_testa"), cuo = partN("abo_cuore");
	if (arms < OC.arms) { OC.arms = arms; shake = .9f; tone(50, .5f, W_SAW, .07f); }
	if (OC.ph == 1 && !arms) { abPhase(2); return; }
	if (OC.ph == 2 && !ven && OC.t > 1) { abPhase(3); return; }
	if (OC.ph == 3 && !ela && !OC.elb && OC.t > 3) { OC.elb = true; OC.frOn = true; OC.fr = .6f; }
	if (OC.ph == 3 && OC.frOn) { OC.fr -= dt; if (OC.fr <= 0) { OC.frOn = false; abPhase(4); return; } }
	if (OC.ph == 4 && !tes && OC.t > 1) { abPhase(5); return; }
	if (OC.ph == 5 && !cuo && OC.t > 1) {
		OC.win = 2.4f; shake = 2; tone(30, 2, W_SAW, .1f);
		for (int i = 0; i < NENT; i++) if (ents[i].k == K_EN) killEnemy(&ents[i]);
		for (int i = 0; i < NENT; i++) if (ents[i].k == K_X && ents[i].xk == XK_MKG) entDel(&ents[i]);
		return;
	}
	float anger = OC.ph == 1 ? 1 + (4 - arms) * .16f : 1;
	if ((OC.nx -= dt * anger) <= 0) {
		if (OC.ph == 1) { OC.nx = arms <= 2 ? 2.2f : 2.8f; abWarn(P.px, P.py, 1.6f, .95f, 230 * A); shake = .25f; if (arms <= 2) abLater(.55f, 2, 0, 0); }
		else if (OC.ph == 2) { OC.nx = 2.5f; for (int i = 0; i < 5; i++) { float x = P.px + (frnd() - .5f) * 4.4f, y = P.py + (frnd() - .5f) * 4.4f; abWarn(x, y, 1.3f, 1, 190 * A); abLater(1, 1, x, y); } }
		else if (OC.ph == 3) { OC.nx = 5; abWarn(P.px, P.py, 1.8f, 1.15f, 200 * A); shake = .3f; }
		else if (OC.ph == 4) { OC.nx = 3.4f; abRay(14, 12.6f, atan2f(P.py - 12.6f, P.px - 14), 12, 1.1f, .65f, 210 * A, .65f, .055f); }
		else { OC.nx = 3; float r = frnd(); if (r < .4f) { abWarn(P.px, P.py, 1.6f, 1, 230 * A); shake = .25f; } else if (r < .75f) abRay(14, 12.6f, atan2f(P.py - 12.6f, P.px - 14), 12, 1.1f, .65f, 210 * A, .7f, .05f);
			else for (int i = 0; i < 3; i++) { float x = P.px + (frnd() - .5f) * 4, y = P.py + (frnd() - .5f) * 4; abWarn(x, y, 1.2f, 1, 190 * A); abLater(1, 1, x, y); } }
	}
	if (OC.ph == 1 && (OC.sw -= dt * anger) <= 0) { OC.sw = 6.2f; bool L = frnd() < .5f; abSweep(BX, BY + 1, L ? .15f : 2.99f, L ? 2.99f : .15f, 10, 6.4f, 1.4f, 190 * A, .9f); flt(P.px, P.py, "Spazzata!", 0xff8a6a); }
	if (OC.ph == 2) {
		Ent *v = partFirst("abo_ventre");
		if (v && (OC.cl -= dt) <= 0) { OC.cl = 10; v->t1.shd = gtime + 3; OC.closed = gtime + 3; flt(v->px, v->py, "Si chiude!", 0x9adcff); spawnSouls(3, 7, 14, 19, 6, 4); }
		if ((OC.vm -= dt) <= 0) { OC.vm = 9; float a0 = atan2f(P.py - 13.4f, P.px - 14); for (int k = -2; k <= 2; k++) abRay(14, 13.4f, a0 + k * .33f, 9, 1.15f, .6f, 175 * A, .8f, .06f); flt(P.px, P.py, "Vomito!", 0x9aff6a); }
	}
	if (OC.ph == 3) {
		Ent *e = partFirst("elara_ombra");
		if (e) {
			if ((OC.tp -= dt) <= 0) { OC.tp = 5.5f; for (int k = 0; k < 20; k++) { float an = frnd() * 6.283f; int x = (int)floorf(P.px + cosf(an) * 2.4f), y = (int)floorf(P.py + sinf(an) * 2.4f);
				if (x > 0 && y > 0 && x < N - 1 && y < N - 1 && WK(M[y][x])) { sparks(e->px, e->py, 14, 0xc8c0ff, 60); e->px = x + .5f; e->py = y + .5f; e->cdt = .6f; sparks(e->px, e->py, 14, 0xc8c0ff, 60); break; } } }
			if ((OC.bm -= dt) <= 0) { OC.bm = 8; for (int i = 0; i < 14; i++) { float an = i * 6.283f / 14; projAdd(e->px, e->py, cosf(an) * 5.2f, sinf(an) * 5.2f, 2.2f, 105 * A, 0xc8c0ff); } flt(e->px, e->py, "Lamento!", 0xc8c0ff); }
			if ((OC.sm -= dt) <= 0) { OC.sm = 11; spawnSouls(2, 6, e->px, e->py, 2, 2); }
		}
	}
	if (OC.ph == 4) {
		if ((OC.gz -= dt) <= 0) { OC.gz = 9; float ap = atan2f(P.py - 12.6f, P.px - 14); OC.gzA = ap + (frnd() < .5f ? -1.2f : 1.2f); OC.gzDir = OC.gzA < ap ? 1 : -1; OC.gzN = 0; OC.gzK = 0; OC.gzOn = true; flt(P.px, P.py, "Lo sguardo!", 0xff5a4a); }
		if ((OC.bm -= dt) <= 0) { OC.bm = 5; for (int i = 0; i < 16; i++) { float an = i * 6.283f / 16 + gtime; projAdd(14, 12.6f, cosf(an) * 5, sinf(an) * 5, 2.6f, 105 * A, 0xff3a3a); } }
		if ((OC.sm -= dt) <= 0) { OC.sm = 7.5f; spawnSouls(3, 6, 14, 18, 8, 4); }
	}
	if (OC.gzOn) { OC.gzK += dt; int steps = (int)(OC.gzK / .14f); while (OC.gzN < steps && OC.gzN < 18) { OC.gzN++; abRay(14, 12.6f, OC.gzA + OC.gzDir * OC.gzN * .17f, 11, 1.1f, .62f, 140 * A, .5f, .015f); } if (OC.gzN >= 18) OC.gzOn = false; }
	if (OC.ph == 5) {
		OC.R = fmaxf(4.6f, 14 - OC.t * .15f); float enr = OC.t > 75 ? 1.5f : 1;
		if (OC.t > 75 && !OC.enr) { OC.enr = true; banner("L'Abominio impazzisce", "Ogni colpo fa più male: finiscilo!"); }
		if ((OC.fz -= dt) <= 0) { OC.fz = .5f; if (dst(P.px, P.py, ABC[0], ABC[1]) > OC.R) hurtPfrom(55 * A * enr); }
		if ((OC.bm -= dt) <= 0) { OC.bm = 7; for (int i = 0; i < 12; i++) { float an = i * 6.283f / 12 - gtime; projAdd(14, 12.6f, cosf(an) * 4.4f, sinf(an) * 4.4f, 2.6f, 105 * A * enr, 0xff6a3a); } }
		if ((OC.sm -= dt) <= 0) { OC.sm = 9; spawnSouls(2, 5, ABC[0], ABC[1], OC.R * .7f, OC.R * .6f); }
		if ((OC.ms -= dt) <= 0) { OC.ms = 14; OC.mks = gtime + 2.2f; fxRing(P.px, P.py, 1, 1.6f, 0xa0d2ff); msg("Lo scudo di Malakar ti avvolge"); tone(780, .12f, W_TRIANGLE, .05f); }
	}
}
// lo scudo di Malakar: per un attimo nessun colpo ti tocca
bool t10Shield(void) {
	if (!t10Occ() || OC.mks <= gtime) return false;
	if (OC.mkf <= gtime) { OC.mkf = gtime + .4f; flt(P.px, P.py, "Scudo di Malakar", 0x9adcff); }
	return true;
}
// la benedizione della Regina: colpi più forti fino alla fine
float t10AtkMul(void) { return t10Occ() && OC.elb ? 1.2f : 1; }
static void elaraFree(Ent *dead) {
	OC.elb = true; OC.frOn = true; OC.fr = 3.6f;
	sparks(dead->px, dead->py, 30, 0xe8e0ff, 120); JINGLE(.16f, W_TRIANGLE, 64, 67, 71, 76);
	banner("La Regina Elara è libera", "La sua benedizione: i tuoi colpi sono più forti fino alla fine"); abLater(1.8f, 3, 0, 0);
}
static void trueEnding(void) {
	X.te = 2; P.g += 10000; gainXP(6000); P.pot += 10;
	int lv = P.lv > 16 ? P.lv : 16;
	Item a = mkItem(lv, 3, SL_W), b = mkItem(lv, 3, SL_H);
	snprintf(a.n, sizeof a.n, "Lama dell'Alba"); a.cr = 20; snprintf(b.n, sizeof b.n, "Diadema della Verità"); b.hp = 150;
	gain(a); gain(b); saveGame();
	seqReset();
	if (!filmSeen(4)) { filmMark(4); filmAdd("verofinale"); }
	if (!SEQn) JFOR(c, jget(TRU, "ENDC")) seqAdd("Il vero finale", NULL, jstr(c, ""));
	seqPlay(SE_FINALE);
}

/* ================= l'Atto II · La città sepolta ================= */
static const char *A88C[3] = {"brunilde88", "ysolde88", "orsolo88"};
bool a2On(void) { return X.te >= 2; }
int a2N(void) { return (X.a2b & 1) + ((X.a2b >> 1) & 1) + ((X.a2b >> 2) & 1); }
float a2Pts(void) { if (!a2On()) return 0; return a2N() * .3f + (X.a2s >= 6 ? .3f : 0); }
static int insN(void) { int n = 0; for (int i = 0; i < 12; i++) if (X.a2ins & (1 << i)) n++; return n; }
static const char *a2Who(void) { J *w = jat(jget(A88, "A88WHO"), X.a2s); return w && w->t == JSTR ? w->s : NULL; }
static void a2Obj(char *out, int n) {
	J *s = jget(A88, "A88S");
	if (X.a2s == 5) { snprintf(out, n, "%s: %d/3", jstr(jat(s, 5), ""), a2N()); return; }
	snprintf(out, n, "%s", jstr(jat(s, X.a2s > 8 ? 8 : X.a2s), ""));
}
static void a2Reward(void) {
	int lv = P.lv > 28 ? P.lv : 28; P.g += 18000; gainXP(9000); P.pot += 10;
	Item a = mkItem(lv, 3, SL_W), b = mkItem(lv, 3, SL_H);
	snprintf(a.n, sizeof a.n, "Lama della Memoria"); if (a.cr < 18) a.cr = 18; snprintf(b.n, sizeof b.n, "Corona di Eldora"); if (b.hp < 170) b.hp = 170;
	gain(a); gain(b); titleAdd(5);
	banner("Atto II completato", "18000 oro, 9000 esperienza, la Lama della Memoria, la Corona di Eldora e il titolo «Custode della Memoria»");
	JINGLE(.12f, W_TRIANGLE, 60, 64, 67, 72, 76, 79, 84);
}
static void a2Talk(void) {
	J *T = jget(jget(A88, "A88T"), (char[4]){'0' + (X.a2s % 10), 0});
	if (!T) return;
	int s = X.a2s;
	seqReset();
	if (s == 0 && !filmSeen(5)) { filmMark(5); filmAdd("a88_inizio"); }
	seqAdd(jstr(jat(T, 0), ""), jstr(jat(T, 1), ""), jstr(jat(T, 2), ""));
	if (s == 0) X.a2s = 1; else if (s == 1) X.a2s = 2; else if (s == 3) X.a2s = 4;
	else if (s == 4) { X.a2s = 5; banner("I tre Custodi di Eldora", "La Fonderia a ovest, i Giardini a est, l'Archivio a nord-ovest"); }
	else if (s == 7) { X.a2s = 8; a2Reward(); }
	saveGame(); seqPlay(SE_NONE);
}
static void insRead(int i) {
	J *S = jat(jget(A88, "INS88"), i); if (!S) return;
	char sub[48]; snprintf(sub, sizeof sub, "Pietra della Memoria · %d/12", i + 1);
	seqReset(); seqAdd(jstr(jat(S, 2), ""), sub, jstr(jat(S, 3), "")); seqPlay(SE_NONE); tone(520, .12f, W_SINE, .05f);
	if (X.a2ins & (1 << i)) return;
	X.a2ins |= 1 << i; gainXP(60); int n = insN();
	char b[48]; snprintf(b, sizeof b, "Pietre della Memoria: %d/12", n); banner(jstr(jat(S, 2), ""), b);
	if (n >= 12 && !X.a2insR) { X.a2insR = 1; P.g += 3000; gainXP(1500); titleAdd(4); msg("Conosci tutta la storia di Eldora: 3000 oro, 1500 esperienza e il titolo «Lettore di Eldora»"); }
	saveGame();
}
// i Custodi e il Re di Pietra: le parole, le fasi, le mosse
static J *b88(const char *t) { return jget(jget(A88, "B88"), t); }
static bool isB88(int t) { if (t < 0) return false; const char *id = E[t].id; return !strcmp(id, "brunilde88") || !strcmp(id, "ysolde88") || !strcmp(id, "orsolo88") || !strcmp(id, "aldric88"); }
static void w88(float x, float y, float r, float t, float d) { int ix = (int)x, iy = (int)y; if (ix < 1 || iy < 1 || ix >= N - 1 || iy >= N - 1 || !WK(M[iy][ix])) return; fxWarn(x, y, r, t, d); }
static void b88Ring(Ent *e, float R0, float t, float d) { int n = (int)fmaxf(8, roundf(R0 * 5)); for (int i = 0; i < n; i++) { float a = i / (float)n * 6.283f; w88(e->px + cosf(a) * R0, e->py + sinf(a) * R0, .62f, t, d); } }
static void b88Adds(Ent *boss, const char *k, int n, float R0, bool ink) {
	int t = enemyIdx(k); if (t < 0) return; float bx = boss->px, by = boss->py;
	for (int i = 0; i < n; i++) { float a = i / (float)n * 6.283f + gtime; int x, y; nearFree(clampi((int)floorf(bx + cosf(a) * R0), 1, N - 2), clampi((int)floorf(by + sinf(a) * R0), 1, N - 2), &x, &y); if (WK(M[y][x])) { Ent *m = mkEn(t, x, y); if (m) { m->al = 1; m->t1.ink = ink; } } }
}
typedef struct { float t; u32 uid; u8 k; float a; } BJob;
static BJob BJ[16]; static int NBJ;
static void bLater(float t, Ent *e, u8 k, float a) { if (NBJ < 16) BJ[NBJ++] = (BJob){t, e->uid, k, a}; }
static Ent *byUid(u32 u) { for (int i = 0; i < NENT; i++) if (ents[i].k == K_EN && ents[i].uid == u && ents[i].hp > 0) return &ents[i]; return NULL; }
static void ysMirror(Ent *e) {
	fxRing(e->px, e->py, 1, 3, 0x96ffdc); int t = enemyIdx("ninfa88"); if (t < 0) return; u32 uid = e->uid;
	for (int i = 0; i < 2; i++) { float a = i * 3.14f + gtime; int x, y; Ent *b = byUid(uid); if (!b) return; nearFree(clampi((int)floorf(b->px + cosf(a) * 3), 1, N - 2), clampi((int)floorf(b->py + sinf(a) * 3), 1, N - 2), &x, &y); if (!WK(M[y][x])) continue;
		Ent *m = mkEn(t, x, y); b = byUid(uid); if (!m || !b) continue; m->model = b->model; snprintf(m->name, sizeof m->name, "%s", b->name); m->mx = m->hp = roundf(b->mx * .04f); m->at = roundf(b->at * .55f); m->t1.mir = 1; m->xp = 0; m->al = 1; }
}
static void boss88Tick(float dt) {
	for (int i = 0; i < NBJ; i++) { BJob *j = &BJ[i]; j->t -= dt; if (j->t > 0) continue; Ent *e = byUid(j->uid);
		if (e) { if (j->k == 1) b88Ring(e, j->a, .95f, e->at * .72f); else if (j->k == 2) w88(P.px + (frnd() - .5f) * .6f, P.py + (frnd() - .5f) * .6f, .85f, .9f, e->at * .8f); else if (j->k == 3) w88(P.px, P.py, .9f, 1, e->at * .8f); else if (j->k == 4) msg("%s", jgs(b88("aldric88"), "help", "")); }
		BJ[i--] = BJ[--NBJ]; }
	if (ZDG < 0) return;
	for (int i = 0; i < NENT; i++) {
		Ent *e = &ents[i]; if (e->k != K_EN || !isB88(e->t) || e->hp <= 0 || e->pup) continue;
		const char *id = E[e->t].id; J *B = b88(id); float k = e->hp / e->mx, d = dst(e->px, e->py, P.px, P.py);
		if (!e->t1.i88) {
			if (!(e->al || d < 7)) continue;
			e->t1.i88 = 1; e->al = 1; e->t1.n88 = gtime + 4;
			J *pre = jget(B, "pre");
			if (pre) { seqReset(); seqAdd(jstr(jat(pre, 0), ""), jstr(jat(pre, 1), ""), jstr(jat(pre, 2), "")); seqPlay(SE_NONE); }
			else { flt(e->px, e->py, "!", 0xffe8b0); msg("%s", jgs(B, "hi", "")); }
			continue;
		}
		if (PM == PM_TXT) continue;
		if (!strcmp(id, "brunilde88")) {
			if (!e->t1.p88 && k <= .5f) { e->t1.p88 = 1; e->bshd = gtime + 2.2f; flt(e->px, e->py, "Immune", 0xffb04a); msg("%s", jgs(B, "ph", "")); shake = .9f; tone(70, 1, W_SQUARE, .07f); b88Adds(e, "automa88", 2, 2.4f, false); e = &ents[i]; b88Ring(e, 2.6f, 1.1f, e->at * .9f); }
			if (gtime > e->t1.n88) { e->t1.n88 = gtime + (e->t1.p88 ? 6 : 7.5f); tone(196, .9f, W_TRIANGLE, .07f); flt(e->px, e->py, "Rintocco!", 0xffd84a); for (int j = 0; j < 3; j++) bLater(j * .52f, e, 1, 1.6f + j * 1.7f); }
		} else if (!strcmp(id, "ysolde88")) {
			if (!e->t1.p88 && k <= .7f) { e->t1.p88 = 1; msg("%s", jgs(B, "ph", "")); ysMirror(e); e = &ents[i]; }
			if (e->t1.p88 == 1 && k <= .35f) { e->t1.p88 = 2; msg("%s", jgs(B, "ph2", "")); ysMirror(e); e = &ents[i]; e->bshd = gtime + 1.5f; }
			if (gtime > e->t1.n88) { e->t1.n88 = gtime + (e->t1.p88 ? 4.2f : 5.5f); flt(e->px, e->py, "Radici!", 0x9affd8); tone(130, .4f, W_SAW, .04f); for (int j = 0; j < 3; j++) bLater(j * .45f, e, 2, 0); }
		} else if (!strcmp(id, "orsolo88")) {
			int ink = 0; for (int q = 0; q < NENT; q++) if (ents[q].k == K_EN && ents[q].t1.ink && ents[q].hp > 0) ink++;
			if (!e->t1.p88 && k <= .5f) { e->t1.p88 = 1; e->t1.inkT = gtime + 9; msg("%s", jgs(B, "ph", "")); shake = .6f; b88Adds(e, "inchiostro88", 4, 2.6f, true); e = &ents[i]; flt(e->px, e->py, "Protetto dall'inchiostro", 0x8a7aff); }
			if (e->t1.p88 == 1) { if (ink > 0 && gtime < e->t1.inkT) e->bshd = gtime + .3f; else { e->t1.p88 = 2; e->bshd = 0; flt(e->px, e->py, "L'inchiostro si scioglie", 0xbfe6ff); } }
			if (gtime > e->t1.n88) { e->t1.n88 = gtime + (e->t1.p88 ? 4.6f : 6); flt(e->px, e->py, "Cancellatura!", 0x8a7aff); tone(300, .3f, W_SAW, .04f); for (int j = 0; j < 3; j++) bLater(j * .7f, e, 3, 0); }
		} else {
			if (!e->t1.p88 && k <= .66f) { e->t1.p88 = 1; e->bshd = gtime + 3; flt(e->px, e->py, "Immune", 0xbfe6ff); msg("%s", jgs(B, "ph", "")); shake = 1; tone(55, 1.2f, W_SAW, .08f); b88Adds(e, "guardia88", 2, 2.5f, false); e = &ents[i]; fxRing(e->px, e->py, 1.4f, 4, 0xa0c8ff); }
			if (e->t1.p88 == 1 && k <= .33f) { e->t1.p88 = 2; e->t1.vul = 1; msg("%s", jgs(B, "ph2", "")); bLater(1.8f, e, 4, 0); e->cd *= 1.35f; e->sp *= .75f; }
			if (gtime > e->t1.n88) { e->t1.n88 = gtime + (e->t1.p88 == 2 ? 6.5f : e->t1.p88 ? 4.5f : 6); flt(e->px, e->py, "Crollo!", 0xbfe6ff); shake = .5f; tone(60, .8f, W_SAW, .06f);
				int n = e->t1.p88 ? 7 : 5; for (int j = 0; j < n; j++) { float a = frnd() * 6.283f, r0 = 1 + frnd() * 4.5f; w88(P.px + cosf(a) * r0 * (j ? 1 : 0), P.py + sinf(a) * r0 * (j ? 1 : 0), .9f, 1.1f, e->at * .72f); } }
		}
	}
}
static void a2BossDown(Ent *dead) {
	if (!a2On() || dead->t < 0) return;
	const char *id = E[dead->t].id;
	for (int i = 0; i < 3; i++) if (!strcmp(id, A88C[i]) && !(X.a2b & (1 << i))) {
		X.a2b |= 1 << i; int n = a2N(); J *B = b88(id); J *end = jget(B, "end");
		seqReset(); seqAdd(jstr(jat(end, 0), ""), E[dead->t].n, jstr(jat(end, 1), "")); seqPlay(SE_NONE);
		char nm[48]; snprintf(nm, sizeof nm, "%s", E[dead->t].n); char *c = strchr(nm, ','); if (c) *c = 0;
		char a[64], b[96]; snprintf(a, sizeof a, "%s %s", nm, i == 2 ? "è libero" : "è libera");
		if (n < 3) snprintf(b, sizeof b, "Custodi liberati: %d/3", n); else snprintf(b, sizeof b, "I tre Custodi sono liberi: le porte del Palazzo Sepolto si sono aperte");
		banner(a, b);
		if (n >= 3) { addUnl("trono88"); if (X.a2s < 6) X.a2s = 6; } else if (X.a2s < 5) X.a2s = 5;
		saveGame();
	}
	if (!strcmp(id, "aldric88") && X.a2s < 7) {
		X.a2s = 7; extern void thSubAt(float); thSubAt(1.5f); saveGame();
		seqReset(); if (!filmSeen(7)) { filmMark(7); filmAdd("a88_alba"); }
		seqPlay(SE_A2ALBA);
	}
}

/* ================= fine delle pagine ================= */
static void seqDone(int what) {
	if (what == SE_CELLA) {
		loadZone("cella", "in_castle");
		seqReset(); seqAdd("Le prigioni del castello", NULL, "Ti hanno tolto il settimo frammento e ti hanno gettato in una cella. Fuori è notte. Il freddo arriva prima della luce."); seqPlay(SE_NONE);
	} else if (what == SE_FINALE) {
		loadZone("in_castle", "town");
		banner("Il vero finale", "L'Occhio è chiuso per sempre · Re Malakar regna su Aldoria");
		seqReset(); seqAdd("Il vero finale", NULL, "Hai scoperto la verità e hai chiuso l'Occhio per sempre.\n\nRe Malakar ti attende nella sala del trono. Aldric è nelle prigioni del castello: a tutti e due puoi chiedere ciò che vuoi sapere.\n\nRicompense: 10.000 oro, 6.000 esperienza, 10 pozioni, la Lama dell'Alba e il Diadema della Verità.\n\nAtto II · La città sepolta: quando sei pronto, Re Malakar ti aspetta nel castello.");
		seqPlay(SE_NONE);
	} else if (what == SE_A2ALBA) {
		banner("Eldora ricorda", "La Minaccia del Regno scende. Torna da Re Malakar nel castello.");
	}
}

/* ================= le zone ================= */
// prima che l'eroe sia messo al suo posto: le porte che compaiono con la storia, i personaggi che cambiano
void t10ZonePre(void) {
	tData();
	if (!strcmp(Zk, "town") && (X.vdug || ({ int q = questIdx("mo5"), on = 0; for (int i = 0; i < P.nq; i++) if (P.q[i].id == q) on = 1; on; }))) {
		if (X.vdug) mkPo(1.3f, 59.5f, "vecchia", PO_OTHER, "Passaggio per Aldoria Vecchia");
		else { Ent *e = xEntNew(XK_HOLE, 1.3f, 59.5f); if (e) snprintf(e->name, sizeof e->name, "Muro crepato"); }
	}
	if (!strcmp(Zk, "vecchia") && a2On() && X.a2s >= 2) { J *w = jget(TRU, "WELL"); int x, y; nearFree((int)jnum(jat(w, 0), 80) + 2, (int)jnum(jat(w, 1), 14) + 2, &x, &y); mkPo(x + .5f, y + .5f, "eldora88", PO_DOWN, "La scala nel pozzo · Eldora"); }
	if (!strcmp(Zk, "cas_prigioni") && a2On() && X.a2s >= 3) { int x, y; nearFree(9, 7, &x, &y); Ent *p = mkPo(x + .5f, y + .5f, "eldora88", PO_VOID, "Il passaggio dei re · Eldora"); if (p) p->col = 0x9ab8ff; }
	if (!strcmp(Zk, "eldora88") && !(a2On() && X.a2s >= 3)) for (int i = 0; i < NENT; i++) if (ents[i].k == K_PO && !strcmp(ents[i].to, "cas_prigioni")) entDel(&ents[i]);
	if (!strcmp(Zk, "cella") && X.te == 1) { ghostSpawn(4, 3); if (X.key) ghostGate(); }
	if (!strcmp(Zk, "cas_prigioni")) {
		if (X.te == 1 && !X.key) ghostSpawn(6, 5);
		if (X.te >= 2) {
			for (int i = 0; i < NENT; i++) if (ents[i].k == K_NPC && ents[i].nid >= 0 && !strcmp(NPCS[ents[i].nid].id, "prigioniero")) entDel(&ents[i]);
			Ent *e = entNew(K_NPC, 2.5f, 2.5f); if (e) { e->nid = npcIdx("aldric_p"); e->model = npcModel88("aldric_p"); snprintf(e->name, sizeof e->name, "Aldric, il Re deposto"); e->face = 0; }
		}
	}
	if (!strcmp(Zk, "in_castle") && X.te >= 2) for (int i = 0; i < NENT; i++) {
		Ent *e = &ents[i]; if (e->k != K_NPC || e->nid < 0) continue;
		if (!strcmp(NPCS[e->nid].id, "re")) { e->nid = npcIdx("malakar_re"); int m = npcModel88("malakar_re"); if (m >= 0) e->model = m; snprintf(e->name, sizeof e->name, "Re Malakar"); }
		else if (!strcmp(NPCS[e->nid].id, "ciambellano")) entDel(e);
	}
}
void t10Zone(void) {
	OC.on = false; NBJ = 0;
	if (!strcmp(Zk, "vecchia") && X.tru && !X.s7) t10Shard7Spawn();
	if (!strcmp(Zk, "occhio")) { occEnter(); }
	if (!strcmp(Zk, "cas_passaggio")) { int i = secIdx("c2"); if (i >= 0 && !(X.sec & (1u << i))) secretFind("c2"); }
	// la prima volta ad Aldoria Vecchia: il ricordo del Moreau
	if (!strcmp(Zk, "vecchia") && !filmSeen(0)) { filmMark(0); seqReset(); filmAdd("ricordo"); seqPlay(SE_NONE);
		int q = questIdx("mo6"); (void)q; }
	if (!strcmp(Zk, "eldora88") && a2On() && X.a2s == 2) {
		X.a2s = 3; saveGame(); seqReset(); if (!filmSeen(6)) { filmMark(6); filmAdd("a88_eldora"); } seqPlay(SE_NONE);
		banner("Eldora, la città sepolta", "Qualcuno ha acceso un fuoco accanto alla scala");
	}
	if (!strcmp(Zk, "eldora88")) {   // il Palazzo si apre con i tre Custodi
		for (int i = 0; i < NENT; i++) if (ents[i].k == K_PO && !strcmp(ents[i].lock, "trono88") && hasUnl("trono88")) ents[i].lock[0] = 0;
	}
}
// le entità nuove dei file delle zone
bool t10Json(const char *k, J *e, float x, float y) {
	tData();
	Ent *q = NULL;
	if (!strcmp(k, "secret") || !strcmp(k, "portac")) {
		const char *sid = jgs(e, "sid", ""); int i = secIdx(sid); if (i < 0) return true;
		q = xEntNew(XK_SECRET, x, y); if (!q) return true;
		snprintf(q->res, sizeof q->res, "%s", sid); snprintf(q->name, sizeof q->name, "%s", jstr(jat(secAt(i), 4), "?"));
	} else if (!strcmp(k, "reliq")) {
		int li = (int)jgn(e, "li", 0); if (X.vld == gDay() && (X.vl & (1u << li))) return true;
		q = xEntNew(XK_RELIQ, x, y); if (q) { q->xs = li; snprintf(q->name, sizeof q->name, "Oggetto del passato"); }
	} else if (!strcmp(k, "botola")) { q = xEntNew(XK_BOTOLA, x, y); if (q) snprintf(q->name, sizeof q->name, "Botola"); }
	else if (!strcmp(k, "portap")) { q = xEntNew(XK_PORTAP, x, y); if (q) snprintf(q->name, sizeof q->name, "Porta di pietra"); }
	else if (!strcmp(k, "ins88")) { q = xEntNew(XK_INS, x, y); if (q) { q->xs = (int)jgn(e, "i", 0); snprintf(q->name, sizeof q->name, "Pietra della Memoria"); } }
	else if (!strcmp(k, "abo")) { q = xEntNew(XK_ABO, x, y); }
	else if (!strcmp(k, "figura") || !strcmp(k, "shard7") || !strcmp(k, "mkghost") || !strcmp(k, "elara_free")) return true;
	else return false;
	return true;
}

/* ================= i personaggi: le domande e i passi ================= */
static char QID[24]; static int QSEL = -1; static char QB[1400];
// le domande di un personaggio: [domanda, risposta] dal browser (QA della verità e QA88 dell'Atto II)
static int qaList(const char *id, const char **Q, const char **A, int max) {
	int n = 0; J *QA = jget(TRU, "QA");
	#define ADDQ(L) JFOR(q, L) if (n < max) { Q[n] = jstr(jat(q, 0), ""); A[n] = jstr(jat(q, 1), ""); n++; }
	if (!strcmp(id, "re")) { ADDQ(jget(QA, "re")); if (P.st >= 5) ADDQ(jget(QA, "re5")); }
	else if (!strcmp(id, "malakar_g")) { ADDQ(jget(QA, "malakar")); ADDQ(jget(QA, "malakar_g")); }
	else if (!strcmp(id, "malakar_re")) { ADDQ(jget(QA, "malakar")); ADDQ(jget(QA, "malakar_re")); }
	else if (!strcmp(id, "aldric_p")) ADDQ(jget(QA, "aldric_p"));
	#undef ADDQ
	if (a2On()) JFOR(q, jget(jget(A88, "QA88"), id)) {
		if (n >= max) break; int from = (int)jnum(jat(q, 2), 0); const char *c = jstr(jat(q, 3), "");
		if (X.a2s < from) continue;
		if (!strcmp(c, "ins") && insN() < 12) continue;
		if (c[0] == 'b' && !(X.a2b & (1 << (c[1] - '0')))) continue;
		Q[n] = jstr(jat(q, 0), ""); A[n] = jstr(jat(q, 1), ""); n++;
	}
	return n;
}
bool t10Npc(const char *nid) {
	tData();
	bool any = false;
	if (!strcmp(nid, "re") && X.s7 == 1 && !X.te) {
		if (P.st >= 5) uiXOpt("Mostra al Re il settimo cuore della Corona", "", XARG(200, 0), C_GOLD, false);
		else msg("Re Aldric: «Un settimo frammento? La Corona ne ha sei. Portameli prima, poi parleremo di favole.»");
		any = true;
	}
	if (!strcmp(nid, "malakar_g") && !X.key) { uiXOpt("Prendi la chiave della porta di pietra", "", XARG(201, 0), C_GOLD, false); any = true; }
	if (a2On()) {
		const char *w = a2Who();
		char k[4]; snprintf(k, sizeof k, "%d", X.a2s);
		if (w && !strcmp(w, nid) && jget(jget(A88, "A88T"), k)) { char l[96]; snprintf(l, sizeof l, "Ascolta · %s", jstr(jat(jget(jget(A88, "A88T"), k), 0), "")); uiXOpt(l, "", XARG(202, 0), C_GOLD, false); any = true; }
	}
	const char *Q[24], *A[24];
	if (qaList(nid, Q, A, 24)) { char l[64]; snprintf(l, sizeof l, "Domande (%d)", qaList(nid, Q, A, 24)); snprintf(QID, sizeof QID, "%s", nid); uiXOpt(l, "", XARG(203, 0), C_TXT, false); any = true; }
	return any;
}
// la Cronaca della verità e dell'Atto II
static char VB[1600];
int t10Build(int page) {
	tData();
	if (page == XP_QA) {
		const char *Q[24], *A[24]; int n = qaList(QID, Q, A, 24);
		int ni = npcIdx(QID); const char *who = ni >= 0 ? NPCS[ni].n : QID;
		if (QSEL >= 0 && QSEL < n) snprintf(QB, sizeof QB, "%s\n\n«%s»", Q[QSEL], A[QSEL]); else snprintf(QB, sizeof QB, "Scegli una domanda.");
		uiXTitle(who, QB);
		for (int i = 0; i < n; i++) uiXOpt(Q[i], "", XARG(204, i), i == QSEL ? C_GOLD : C_TXT, false);
		uiXOpt("Chiudi", "", XARG(1, 0), 0, false);
		return 1;
	}
	if (page == XP_VER) {
		int n = secN(), o = 0;
		o += snprintf(VB + o, sizeof VB - o, "Segreti di Aldoria: %d/%d.", n, NSEC);
		if (!X.tru) o += snprintf(VB + o, sizeof VB - o, n ? " Qualcosa non torna nella storia di Aldoria Vecchia." : "");
		else {
			const char *st = X.te >= 2 ? "L'Occhio è chiuso. Re Malakar regna su Aldoria." : X.te == 1 ? (X.key ? "Malakar ti ha dato la chiave: apri la porta di pietra nella stanza del culto." : "Sei stato arrestato. Aspetta, nella cella.")
				: X.s7 ? (P.st >= 5 ? "Hai il settimo cuore della Corona. Portalo al Re." : "Hai il settimo cuore della Corona. Portalo al Re, quando la Corona sarà riunita.") : "Il settimo cuore è ad Aldoria Vecchia, dove la vecchia piazza beveva.";
			o += snprintf(VB + o, sizeof VB - o, "\n%s", st);
		}
		if (a2On()) { char ob[160]; a2Obj(ob, sizeof ob); o += snprintf(VB + o, sizeof VB - o, "\n\nAtto II · La città sepolta: %s.", ob);
			if (X.a2s >= 5) o += snprintf(VB + o, sizeof VB - o, " Custodi: %s Brunilde, %s Ysolde, %s Orsolo.", X.a2b & 1 ? "✔" : "○", X.a2b & 2 ? "✔" : "○", X.a2b & 4 ? "✔" : "○");
			if (X.a2s >= 3) o += snprintf(VB + o, sizeof VB - o, " Pietre della Memoria: %d/12.", insN()); }
		uiXTitle("La verità su Aldoria Vecchia", VB);
		if (X.tru) uiXOpt("Rileggi la verità", "", XARG(205, 0), C_GOLD, false);
		int k = 0; JFOR(s, SECD) { if (X.sec & (1u << k)) uiXOpt(jstr(jat(s, 4), ""), "", XARG(206, k), C_TXT, false); k++; }
		uiXOpt("Chiudi", "", XARG(1, 0), 0, false);
		return 1;
	}
	extern int thBuild(int page); return thBuild(page);
}
int t10Act(int a, int i) {
	switch (a) {
	case 200: uiClose(); arrestHero(); return 1;
	case 201: takeKey(); return 1;
	case 202: uiClose(); a2Talk(); return 1;
	case 203: QSEL = -1; xSetPage(XP_QA); return 0;
	case 204: QSEL = QSEL == i ? -1 : i; return 0;
	case 205: { uiClose(); seqReset(); seqAdd("La verità su Aldoria Vecchia", NULL, jgs(TRU, "TRUTHT", "")); seqPlay(SE_NONE); return 1; }
	case 206: { J *d = secAt(i); uiClose(); seqReset(); seqAdd(jstr(jat(d, 4), ""), "Segreto di Aldoria", jstr(jat(d, 5), "")); seqPlay(SE_NONE); return 1; }
	}
	extern int thAct(int a, int i); return thAct(a, i);
}
void t10Pause(void) { if (X.sec || X.te || X.vcult) uiXOpt("La verità su Aldoria Vecchia", "", XARG(XA_GO, XP_VER), C_GOLD, false); }
// l'obiettivo sotto il nome della zona
bool t10Obj(char *out, int n) {
	if (a2On() && X.a2s < 8) { char ob[160]; a2Obj(ob, sizeof ob); snprintf(out, n, "Atto II · %s", ob); return true; }
	if (X.te == 1) { snprintf(out, n, X.key ? "Apri la porta di pietra nella stanza del culto, sotto Aldoria Vecchia, e affronta l'Abominio." : "Sei in cella. Aspetta: nel buio arriva una luce fredda."); return true; }
	if (X.s7 == 1 && !X.te && P.st >= 5) { snprintf(out, n, "Mostra al Re il settimo cuore della Corona, nel castello."); return true; }
	if (X.tru && !X.s7) { snprintf(out, n, "Il settimo cuore è ad Aldoria Vecchia, dove la vecchia piazza beveva."); return true; }
	return false;
}

/* ================= interazione e disegno ================= */
bool t10Interactable(Ent *e) { return e->xk == XK_SECRET || e->xk == XK_RELIQ || e->xk == XK_BOTOLA || e->xk == XK_PORTAP || e->xk == XK_SHARD7 || e->xk == XK_INS || e->xk == XK_HOLE; }
const char *t10Verb(Ent *e) {
	switch (e->xk) { case XK_SECRET: return "Esamina"; case XK_RELIQ: return "Raccogli"; case XK_BOTOLA: return "Scendi dalla"; case XK_PORTAP: return "Esamina la";
	case XK_SHARD7: return "Prendi"; case XK_INS: return "Leggi la"; case XK_HOLE: return X.vdp ? "Continua a scavare il" : "Scava il"; }
	return NULL;
}
bool t10ActEnt(Ent *e) {
	switch (e->xk) {
	case XK_SECRET: secretFind(e->res); return true;
	case XK_RELIQ: reliqTake(e); return true;
	case XK_BOTOLA: tone(90, .6f, W_SAW, .06f); loadZone("culto", "vecchia"); return true;
	case XK_PORTAP: cultDoor(); return true;
	case XK_SHARD7: shard7Take(e); return true;
	case XK_INS: insRead(e->xs); return true;
	case XK_HOLE: holeDig(e); return true;
	}
	return false;
}
static void boxes(const float (*L)[7], int n, float x, float y, float zo, const u32 *col, const float *lit) {
	for (int i = 0; i < n; i++) boxA(x + L[i][0], y + L[i][1], L[i][2] + zo, L[i][3], L[i][4], L[i][5], col[i], lit[i], 255);
}
bool t10Draw(Ent *e) {
	switch (e->xk) {
	case XK_RELIQ: { float u = sinf(gtime * 2 + e->px);
		boxA(e->px - .14f, e->py - .1f, 0, .28f, .2f, 3, 0x5a4a3a, 1, 255); boxA(e->px - .08f, e->py - .06f, 3, .16f, .12f, 3, RELC[e->xs % 5], 1, 255); boxA(e->px - .03f, e->py - .03f, 7 + u, .06f, .06f, 2, 0xfff2c0, 1.5f, 255); return true; }
	case XK_SHARD7: { float u = sinf(gtime * 2) * 1.5f; boxA(e->px - .1f, e->py - .1f, 2 + u, .2f, .2f, 8, 0x8a1020, 1.2f, 255); boxA(e->px - .05f, e->py - .05f, 10 + u, .1f, .1f, 3, 0xffd0d0, 1.5f, 255); return true; }
	case XK_SECRET: { int i = secIdx(e->res); if (i >= 0 && !(X.sec & (1u << i)) && dst(e->px, e->py, P.px, P.py) < 3.6f) { float u = sinf(gtime * 4 + e->px) * 2; boxA(e->px - .03f, e->py - .03f, 7 + u, .06f, .06f, .06f, 0xfff6c0, 1.6f, 255); boxA(e->px - .08f, e->py - .01f, 7.5f + u, .16f, .02f, .02f, 0xfff6c0, 1.4f, 255); } return true; }
	case XK_INS: { if (!(X.a2ins & (1 << e->xs))) { float g = .9f + .4f * fmaxf(0, sinf(gtime * 2 + e->xs)); boxA(e->px - .04f, e->py + .17f, 12, .08f, .02f, 6, 0xbfe6ff, g, 255); } return true; }
	case XK_HOLE: { float x0 = -.34f; boxA(e->px + x0, e->py - .38f, 0, .04f, .76f, 20 * fminf(1, .15f + X.vdp / 100.f), 0x050505, 1, 255); boxA(e->px - .25f, e->py - .25f, 0, .25f, .5f, 3, 0x7b7f89, 1, 255); return true; }
	case XK_ABO: {
#ifdef ARM9
		// sul DS il mostro è fatto di blocchi disegnati qui (un'immagine così grande non ci starebbe): i gradoni di carne,
		// il ventre, l'occhio e le braccia che restano
		{ static const float T[4][4] = {{3.5f, 0, 42, 0x2a1418}, {3.2f, 42, 50, 0x4a2026}, {2.8f, 92, 46, 0x5a2a30}, {2.2f, 138, 44, 0x4a2026}};
		  int ph = OC.on ? OC.ph : X.te >= 2 ? 6 : 1; float br = 1 + sinf(gtime * 1.6f) * .03f, dr = ph >= 4 && ph <= 5 ? -10 : 0;
		  for (int i = 0; i < 4; i++) boxA(e->px - T[i][0], e->py - T[i][0], (T[i][1] + (i == 3 ? dr : 0)) * br, T[i][0] * 2, T[i][0] * 2, T[i][2] * br, (u32)T[i][3], 1, 255);
		  bool open = ph == 2 || ph == 3; if (OC.closed > gtime) open = false;
		  boxA(e->px - 1.6f, e->py + 3.22f, 52 * br, 3.2f, .06f, open ? 34 : 2, open ? 0x6a0a0a : 0x140404, open ? 1.3f : 1, 255);
		  bool eye = ph == 4 || ph == 5; boxA(e->px - 1.55f, e->py + 2.24f, (150 + dr) * br, 3.1f, .05f, eye ? 22 : 2, eye ? 0xe8dcc8 : 0x1a0808, 1.1f, 255);
		  if (eye) boxA(e->px - .55f, e->py + 2.27f, (154 + dr) * br, 1.1f, .04f, 14, 0x8a0a0a, 1.4f, 255);
		  if (ph == 5) boxA(e->px - .9f, e->py + 3.3f, 48, 1.8f, .18f, 22 * (1 + fmaxf(0, sinf(gtime * 5)) * .18f), 0xb0101a, 1.3f, 255);
		  if (ph == 1) for (int i = 0; i < NENT; i++) { Ent *a = &ents[i]; if (a->k != K_EN || !a->t1.anc || a->xs >= 4 || a->t != enemyIdx("abo_braccio")) continue;
			for (int k = 0; k <= 8; k++) { float u = k / 8.f, w = sinf(gtime * 2.2f + a->xs * 1.7f + u * 5) * .45f * (1 - u), x = e->px + (a->px - e->px) * u + w, y = e->py + 1 + (a->py - e->py - 1) * u, z = 90 * (1 - u) + sinf(u * 3.14f) * 30, sz = 1.05f - u * .6f;
				boxA(x - sz / 2, y - sz / 2, z, sz, sz, 10, a->fl > 0 ? 0xff8a8a : (k & 1) ? 0x4a2026 : 0x5a2a30, 1, 255); } }
		  for (int i = 0; i < OC.npool; i++) boxA(OC.pool[i].x - OC.pool[i].r * .7f, OC.pool[i].y - OC.pool[i].r * .7f, .2f, OC.pool[i].r * 1.4f, OC.pool[i].r * 1.4f, .4f, 0x5ac83c, 1.2f, 150);
		  if (OC.on && OC.ph == 5) for (int i = 0; i < 16; i++) { float a = i / 16.f * 6.283f; boxA(ABC[0] + cosf(a) * OC.R - .1f, ABC[1] + sinf(a) * OC.R - .1f, 0, .2f, .2f, 10, 0xc8c8d4, 1.2f, 255); }
		  return true; }
#endif
		tData(); if (X.te >= 2 && !OC.on) { drawModelFrame((int)jgn(XABO, "b0", -1), 0, e->px, e->py, 0, 0, 255); return true; }
		int ph = OC.on ? OC.ph : 1;
		const char *b = ph == 1 ? "b1" : ph <= 3 ? (OC.closed > gtime ? "b2c" : "b2") : ph == 4 ? "b4" : "b5";
		drawModelFrame((int)jgn(XABO, b, -1), 0, e->px, e->py, 0, 0, 255);
		if (ph == 1) for (int i = 0; i < NENT; i++) if (ents[i].k == K_EN && ents[i].t1.anc && ents[i].xs < 4 && ents[i].t == enemyIdx("abo_braccio")) { char k[4] = {'a', (char)('0' + ents[i].xs), 0}; drawModelFrame((int)jgn(XABO, k, -1), 0, e->px, e->py, 0, ents[i].fl > 0, 255); }
		// le pozze di acido e la nebbia della fase 5
		for (int i = 0; i < OC.npool; i++) boxA(OC.pool[i].x - OC.pool[i].r * .7f, OC.pool[i].y - OC.pool[i].r * .7f, .2f, OC.pool[i].r * 1.4f, OC.pool[i].r * 1.4f, .4f, 0x5ac83c, 1.2f, 150);
		if (OC.on && OC.ph == 5) for (int i = 0; i < 24; i++) { float a = i / 24.f * 6.283f; boxA(ABC[0] + cosf(a) * OC.R - .1f, ABC[1] + sinf(a) * OC.R - .1f, 0, .2f, .2f, 10, 0xc8c8d4, 1.2f, 160); }
		if (OC.mks > gtime) boxA(P.px - .45f, P.py - .45f, 1, .9f, .9f, 30, 0xa0d7ff, 1.3f, 70);
		return true; }
	case XK_MKG: { float dx = P.px - e->px, dy = P.py - e->py;
		extern int faceOf(float, float); drawModelFrame(e->model, faceOf(dx, dy) * 3, e->px, e->py, 8 + sinf(gtime * 1.7f) * 3, 0, 170); return true; }
	case XK_BOTOLA: case XK_PORTAP: return true;
	}
	return false;
}
// i colpi: le parti dell'Abominio chiuse, i Custodi, il Re di Pietra trattenuto
int t10Hit(Ent *e, int d) {
	if (e->t1.shd > gtime) { flt(e->px, e->py, "Immune", 0x9adcff); return 0; }
	if (e->t1.vul && !(e->bshd > gtime)) d = (int)roundf(d * 1.4f);
	if (e->t1.mir && e->hp > 0) { sparks(e->px, e->py, 14, 0x9affd8, 60); return (int)e->hp + 1; }
	return d;
}
// un nemico è caduto: la Regina si libera, i Custodi ricordano
void t10Kill(Ent *dead) {
	if (dead->t >= 0 && !strcmp(E[dead->t].id, "elara_ombra") && t10Occ()) elaraFree(dead);
	a2BossDown(dead);
}
// la camera guarda anche il mostro: è troppo grande per stare nello schermo
void t10Cam(float *x, float *y) { if (!strcmp(Zk, "occhio") && X.te == 1) { *x += (BX - *x) * .4f - 2; *y += (BY + 1 - *y) * .4f - 2; } }
void t10Tick(float dt) {
	occTick(dt); boss88Tick(dt);
#ifdef VOX_TEST
	if (VOX_TEST == 37 && t10Occ() && PM == PM_NONE) { static float k; if ((k += dt) > 4) { k = 0; for (int i = 0; i < NENT; i++) if (ents[i].k == K_EN && ents[i].hp > 0) killEnemy(&ents[i]); } }
#endif
}
