// Voxelia 3DS - plugin del server (modalità storia).
// Nel browser i plugin aggiungono al gioco il loro codice JavaScript (api.client) e parlano con il server con
// messaggi {t:'x', pl, e, d}. Sulla 3DS quel codice non può girare: qui c'è la sua versione nativa, con gli stessi
// messaggi, per i plugin ufficiali che riguardano la modalità storia:
//   boss (boss del mondo), tesoro (caccia al tesoro), taglie, notti (notte di caccia), emote, tpa (teletrasporto),
//   hub (ritorno ad Aldoria), gruppi (gruppi d'avventura), torneo, sindaco, guardieladri, pesca, speedrun e albo.
// Housing, discoteca e mercato hanno finestre e mappe proprie del browser: dalla 3DS restano i loro comandi in chat.
#include "voxelia.h"

extern const char *netMyId(void);
extern void netSendX(const char *pl, const char *e, const char *d);
extern bool zoneBusy(void);
extern void goZoneAt(const char *to, float x, float y);
extern void uiPlugTitle(const char *ti, const char *body);
extern void uiPlugOpt(const char *l, const char *r, int arg, u32 col, bool dis);
extern void uiOpenPlug(void);
extern int uiChatHist(int i, const char **s, int *sys);

#define C_TXT C2D_Color32(232, 236, 244, 255)
#define C_MU C2D_Color32(154, 164, 184, 255)
#define C_GOLD C2D_Color32(245, 185, 66, 255)
#define C_GREEN C2D_Color32(125, 255, 176, 255)
#define C_RED C2D_Color32(255, 140, 120, 255)

static float clk = 0;          // orologio dei plugin (secondi)
static float lastHit = -99;    // ultima volta che l'eroe ha perso vita (per /hub)
static float lastHp = -1;

static void sendStr(const char *pl, const char *e, const char *k, const char *v) {
	char b[200]; JW w = {b, 0, sizeof b}; jwRaw(&w, "{"); jwStr(&w, k); jwRaw(&w, ":"); jwStr(&w, v); jwRaw(&w, "}"); netSendX(pl, e, b);
}
static bool inZone(const char *zk) { return started && zk[0] && !strcmp(Zk, zk); }
static float dist2(float x, float y) { return hyp(P.px - x, P.py - y); }

/* =====================================================================================================
   Boss del mondo (boss.js): un boss enorme in una zona selvaggia, con la vita tenuta dal server.
   I colpi dell'eroe non lo uccidono qui: vanno al server in «vite» (1 vita = il boss come lo farebbe il gioco
   in quella zona); il server manda a tutti la vita aggiornata e la fine.                                     */
#define WB_ID 990001
#ifdef VOX_TEST
#define WB_MIN 3
#else
#define WB_MIN 6
#endif
static struct { bool on; char k[48], zk[32], nome[48], base[24]; float scala, forza, max, hp; } WB;
static float wbPend = 0, wbSendT = 0;
static Ent *wbEnt(void) { for (int i = 0; i < NENT; i++) if (ents[i].k == K_EN && ents[i].wb) return &ents[i]; return NULL; }
static bool wbHere(void) { return WB.on && inZone(WB.zk) && !zoneBusy(); }
static void wbSpawn(void) {
	if (!wbHere() || wbEnt()) return;
	int t = enemyIdx(WB.base); if (t < 0) t = enemyIdx("troll"); if (t < 0) return;
	// la casella raggiungibile più vicina al centro della mappa, ad almeno 6 passi dall'eroe
	static s16 d[MAXN * MAXN];
	int sx = (int)P.px, sy = (int)P.py; bfs(sx, sy, d);
	float c = N / 2.f, bd = 1e9f; int bx = sx, by = sy;
	for (int y = 1; y < N - 1; y++) for (int x = 1; x < N - 1; x++) {
		int v = d[y * N + x]; if (v < WB_MIN || !WK(M[y][x])) continue;
		float s = hyp(x - c, y - c);
#ifdef VOX_TEST
		s = fabsf(v - 3);   // nelle prove compare a pochi passi dall'eroe
#endif
		if (s < bd) { bd = s; bx = x; by = y; }
	}
	Ent *e = mkEn(t, bx, by); if (!e) return;
	e->id = WB_ID; e->wb = 1; e->vb = e->mx;
	e->mx = fmaxf(1, roundf(e->vb * WB.max)); e->hp = fmaxf(1, roundf(e->vb * WB.hp));
	e->at *= WB.forza; e->xp = 0;
	e->scl = WB.scala > 0 ? WB.scala : 1; e->r *= fminf(1.5f, fmaxf(1, e->scl));
	snprintf(e->name, sizeof e->name, "%s", WB.nome);
	msg("%s è qui!", WB.nome);
}
static void wbRemove(bool festa) {
	Ent *e = wbEnt(); if (!e) return;
	if (festa) { JINGLE(.11f, W_SQUARE, 60, 64, 67, 72, 76, 79); sparks(e->px, e->py, 50, 0xffd84a, 140); fxRing(e->px, e->py, 3, .9f, 0xffd84a); shake = .5f; }
	else sparks(e->px, e->py, 30, 0xc8b8d8, 80);
	if (LOCK == e) LOCK = NULL;
	if (TGT == e) TGT = NULL;
	entDel(e);
}
// chiamata da hurtE() per il boss del mondo
void plBossHurt(Ent *e, int d, bool cr) {
	if (d <= 0) return;
	e->hp = fmaxf(1, e->hp - d); e->fl = .12f; e->al = 1;
	char b[16]; snprintf(b, sizeof b, cr ? "%d!" : "%d", d);
	flt(e->px, e->py, b, cr ? 0xffd84a : 0xffffff);
	tone(cr ? 330 : 220, .05f, W_SQUARE, .05f);
	sparks(e->px, e->py, cr ? 8 : 4, cr ? 0xffd84a : 0xffffff, 60);
	if (cr) shake = fmaxf(shake, .12f);
	wbPend += d / fmaxf(1, e->vb);
}
static void wbMsg(const char *ev, J *d) {
	if (!strcmp(ev, "stato")) {
		const char *k = jgs(d, "k", ""); if (!k[0]) return;
		if (WB.on && strcmp(WB.k, k)) wbRemove(false);
		WB.on = true;
		snprintf(WB.k, sizeof WB.k, "%s", k); snprintf(WB.zk, sizeof WB.zk, "%s", jgs(d, "zk", ""));
		snprintf(WB.nome, sizeof WB.nome, "%s", jgs(d, "nome", "Boss del mondo")); snprintf(WB.base, sizeof WB.base, "%s", jgs(d, "base", "troll"));
		WB.scala = jgn(d, "scala", 1); WB.forza = jgn(d, "forza", 1); WB.max = jgn(d, "max", 1); WB.hp = jgn(d, "hp", WB.max);
		wbSpawn();
	} else if (!strcmp(ev, "vita")) {
		if (!WB.on || strcmp(jgs(d, "k", ""), WB.k)) return;
		WB.hp = jgn(d, "hp", WB.hp); if (jgn(d, "max", 0) > 0) WB.max = jgn(d, "max", 0);
		Ent *e = wbEnt();
		if (e) { e->mx = fmaxf(1, roundf(WB.max * e->vb)); e->hp = fmaxf(1, roundf(WB.hp * e->vb) - roundf(wbPend * e->vb)); }
	} else if (!strcmp(ev, "fine")) {
		if (!WB.on || strcmp(jgs(d, "k", ""), WB.k)) return;
		bool qui = wbEnt() != NULL, vinto = jgn(d, "vinto", 0) != 0;
		wbRemove(vinto); WB.on = false; wbPend = 0;
		const char *tuo = jgs(d, "tuo", "");
		if (vinto && (qui || tuo[0])) { char b[120]; if (tuo[0]) snprintf(b, sizeof b, "%s", tuo); else snprintf(b, sizeof b, "%s è caduto", jgs(d, "nome", WB.nome)); banner("Boss sconfitto!", b); }
	}
}
static void wbTick(float dt) {
	if ((wbSendT -= dt) > 0) return;
	wbSendT = .3f;
	if (wbPend > 0 && WB.on) { char b[96]; snprintf(b, sizeof b, "{\"k\":\"%s\",\"v\":%.4f}", WB.k, wbPend); netSendX("boss", "colpo", b); wbPend = 0; }
	if (wbHere()) wbSpawn();
	else if (wbEnt()) wbRemove(false);
}

/* =====================================================================================================
   Caccia al tesoro (tesoro.js): il server decide chi lo trova dalla posizione; qui scintille e titoli.        */
static struct { bool on; char zk[32]; int x, y; bool said; } TS;
static float tsT = 0;
static void tsMsg(const char *ev, J *d) {
	if (!strcmp(ev, "vicino")) {
		const char *zk = jgs(d, "zk", ""); int x = (int)jgn(d, "x", 0), y = (int)jgn(d, "y", 0);
		if (!TS.on || strcmp(TS.zk, zk) || TS.x != x || TS.y != y) TS.said = false;
		TS.on = true; snprintf(TS.zk, sizeof TS.zk, "%s", zk); TS.x = x; TS.y = y;
		if (!TS.said) { TS.said = true; msg("Qualcosa luccica qui vicino..."); }
	} else if (!strcmp(ev, "fine")) TS.on = TS.said = false;
	else if (!strcmp(ev, "trovato")) {
		if (TS.on && inZone(TS.zk)) { sparks(TS.x + .5f, TS.y + .5f, 40, 0xffd700, 120); fxRing(TS.x + .5f, TS.y + .5f, 2, .8f, 0xffd700); }
		TS.on = TS.said = false;
		if (jgn(d, "tuo", 0)) { banner("Tesoro trovato!", jgs(d, "testo", "")); JINGLE(.14f, W_TRIANGLE, 72, 76, 79, 84); }
	}
}
static void tsTick(float dt) {
	if ((tsT -= dt) > 0) return;
	tsT = .3f;
	if (TS.on && inZone(TS.zk) && dist2(TS.x + .5f, TS.y + .5f) < 9) sparks(TS.x + .5f, TS.y + .5f, 4, (frnd() < .5f ? 0xffd700 : 0xfff6a0), 60);
}

/* =====================================================================================================
   Taglie (taglie.js): il gioco dice al server se la cripta del Borgo delle Ceneri è aperta per questo eroe.  */
static int tgLast = -1; static char tgId[16]; static float tgT = 0;
static void tgTick(float dt) {
	if ((tgT -= dt) > 0) return;
	tgT = 2;
	int v = hasUnl("rovine");
	if (v != tgLast || strcmp(tgId, netMyId())) { tgLast = v; snprintf(tgId, sizeof tgId, "%s", netMyId()); netSendX("taglie", "cripta", v ? "{\"aperta\":true}" : "{\"aperta\":false}"); }
}

/* =====================================================================================================
   Emote (emote.js): fumetti sopra la testa e la ruota delle emote.                                           */
static const char *EMO[12][2] = {{"saluta", "saluta"}, {"ridi", "ride"}, {"applaudi", "applaude"}, {"arrabbiato", "si arrabbia"}, {"cuore", "manda un cuore"}, {"balla", "balla"},
	{"triste", "è triste"}, {"ok", "è d'accordo"}, {"dubbio", "ha un dubbio"}, {"dormi", "si addormenta"}, {"forza", "mostra i muscoli"}, {"brindisi", "brinda"}};
static const char *EMOB[12] = {"Ciao!", "Ah ah ah!", "Bravo!", "Grrr!", "<3", "~ balla ~", "Sigh...", "Ok!", "?", "Zzz...", "Forza!", "Salute!"};
static int emoIdx(const char *k) { for (int i = 0; i < 12; i++) if (!strcmp(EMO[i][0], k)) return i; return -1; }
typedef struct { bool ready; int tries; float t; } Hello;
static Hello HE, HG;                       // emote e gruppi aspettano un «ciao» dal gioco
static int myEmo = -1; static float myEmoT = 0;
static void helloTick(Hello *h, const char *pl, float dt) {
	if ((h->t -= dt) > 0) return;
	h->t = 1.5f;
	if (!h->ready && h->tries < 8) { h->tries++; netSendX(pl, "ciao", "1"); }
}
static int plPage = 0;
static void emMsg(const char *ev, J *d) {
	if (!strcmp(ev, "pronto")) HE.ready = true;
	else if (!strcmp(ev, "emote")) {
		int k = emoIdx(jgs(d, "e", "")); const char *id = jgs(d, "id", ""); if (k < 0 || !id[0]) return;
		if (!strcmp(id, netMyId())) { myEmo = k; myEmoT = 4; return; }
		for (int i = 0; i < MAXPEER; i++) if (PEERS[i].used && !strcmp(PEERS[i].id, id)) { snprintf(PEERS[i].bub, sizeof PEERS[i].bub, "%s", EMOB[k]); PEERS[i].bt = 4; }
	} else if (!strcmp(ev, "ruota")) { if (started && PM == PM_NONE) { plPage = 1; uiOpenPlug(); } }
}

/* =====================================================================================================
   Avvisi sullo schermo touch con Accetta e Rifiuta (teletrasporto e inviti nei gruppi).                     */
static struct { int kind; char ti[48], tx[120], id[40]; float t; } CARD;   // kind: 0 nessuno, 1 tpa, 2 gruppo
bool plCard(const char **ti, const char **tx) { if (!CARD.kind) return false; *ti = CARD.ti; *tx = CARD.tx; return true; }
static void cardClose(void) { CARD.kind = 0; }
void plCardAnswer(bool yes) {
	if (CARD.kind == 1) { char b[96]; snprintf(b, sizeof b, "{\"id\":\"%s\",\"si\":%s}", CARD.id, yes ? "true" : "false"); netSendX("tpa", "risposta", b); }
	else if (CARD.kind == 2) { char b[120]; JW w = {b, 0, sizeof b}; jwRaw(&w, "{\"da\":"); jwStr(&w, CARD.id); jwf(&w, ",\"si\":%s}", yes ? "true" : "false"); netSendX("gruppi", "risposta", b); }
	cardClose(); tone(yes ? 880 : 300, .06f, W_TRIANGLE, .05f);
}

/* =====================================================================================================
   Teletrasporto (tpa.js): /tpa nome. Il gioco di chi chiede controlla se può entrare nella zona dell'altro
   come fa il browser (cancelli delle missioni, punto della storia, livello) e poi ci va.                     */
static const char *INT_OUT[][2] = {{"in_palazzo", "nord"}, {"in_banca", "nord"}, {"in_fattoria", "campi"}, {"in_segheria", "campi"}, {"in_cappella", "rovine"},
	{"in_locanda", "porto"}, {"in_capitaneria", "porto"}, {"in_motel", "town"}, {"in_motel2", "in_motel"}, {"in_capanna", "forest"}, {"in_tenda", "desert"}, {"in_rifugio", "peaks"}};
static char gateSeen[24][2][24]; static int nGate = 0;
static const char *gateOf(const char *b) { for (int i = 0; i < nGate; i++) if (!strcmp(gateSeen[i][0], b)) return gateSeen[i][1]; return NULL; }
static void zbase(const char *zk, char *out, int n) { snprintf(out, n, "%s", zk); char *a = strchr(out, '@'); if (a) *a = 0; a = strchr(out, '#'); if (a) *a = 0; }
static const char *zparent(const char *b) {
	if (!strcmp(b, "culto")) return "vecchia";
	if (!strcmp(b, "occhio")) return "culto";
	if (!strcmp(b, "cella")) return "in_castle";
	int d = dgIdx(b); if (d >= 0) return DG[d].ent;
	if (!strncmp(b, "in_", 3)) { for (unsigned i = 0; i < sizeof INT_OUT / sizeof INT_OUT[0]; i++) if (!strcmp(INT_OUT[i][0], b)) return INT_OUT[i][1]; return "town"; }
	return NULL;
}
static const char *zname(const char *b) { const char *t = zoneTitle(b); static char n[64]; snprintf(n, sizeof n, "%s", t); char *s = strstr(n, " · "); if (s) *s = 0; return n; }
static void inZ(const char *n, char *out, int m) {
	static const char *A[][2] = {{"La ", "nella "}, {"Il ", "nel "}, {"Lo ", "nello "}, {"Le ", "nelle "}, {"I ", "nei "}, {"Gli ", "negli "}};
	for (int i = 0; i < 6; i++) if (!strncmp(n, A[i][0], strlen(A[i][0]))) { snprintf(out, m, "%s%s", A[i][1], n + strlen(A[i][0])); return; }
	if (!strncmp(n, "L'", 2)) { snprintf(out, m, "nell'%s", n + 2); return; }
	snprintf(out, m, "in %s", n);
}
// la regola di una zona: dal config del plugin, dai cancelli scoperti, dalle missioni che la aprono; "" se libera
static void tpRule(const char *b, J *R, J *S, char *no, int n) {
	no[0] = 0;
	char where[80]; inZ(zname(b), where, sizeof where);
	J *r = R ? jget(R, b) : NULL;
	if (r && jgn(r, "libera", 0)) return;
	if (!r) {
		if (!strcmp(b, "cella")) { snprintf(no, n, "Non ci si può teletrasportare %s.", where); return; }
		if (!strcmp(b, "vecchia") || !strcmp(b, "culto") || !strcmp(b, "occhio")) { snprintf(no, n, "Non puoi ancora entrare %s: sulla 3DS non c'è ancora la strada per Aldoria Vecchia.", where); return; }
	}
	const char *unl = NULL;
	if (r) unl = jgs(r, "sblocco", NULL);
	if (!r && S && jget(S, b)) unl = jgs(S, b, NULL);
	if (!r && !unl) unl = gateOf(b);
	if (!r && !unl) for (int i = 0; i < NQT; i++) if (QT[i].unl && !strcmp(QT[i].unl, b)) { unl = b; break; }
	if (unl && !hasUnl(unl)) {
		int q = -1; for (int i = 0; i < NQT; i++) if (QT[i].unl && !strcmp(QT[i].unl, unl)) { q = i; break; }
		if (q >= 0) snprintf(no, n, "Non puoi ancora entrare %s: prima completa la missione «%s».", where, QT[q].ti);
		else snprintf(no, n, "Non puoi ancora entrare %s.", where);
		return;
	}
	if (r && jget(r, "storia") && P.st < (int)jgn(r, "storia", 0)) { snprintf(no, n, "Non puoi ancora entrare %s: %s.", where, jgs(r, "testo", "prima devi andare avanti nella missione del Re")); return; }
	if (r && jgn(r, "livello", 0) > 0 && P.lv < (int)jgn(r, "livello", 0)) { snprintf(no, n, "Non puoi ancora entrare %s: serve il livello %d.", where, (int)jgn(r, "livello", 0)); return; }
}
static void tpCheck(J *d, char *no, int n) {
	no[0] = 0;
	if (!started) { snprintf(no, n, "Il gioco non è ancora pronto."); return; }
	if (zoneBusy()) { snprintf(no, n, "Stai già cambiando zona."); return; }
	if (!strcmp(Zk, "cella")) { snprintf(no, n, "Sei chiuso in una cella: da qui non puoi teletrasportarti."); return; }
	const char *zk = jgs(d, "zk", "");
	if (!zoneExists(zk)) { snprintf(no, n, "La zona in cui si trova non esiste nella versione 3DS."); return; }
	char b[32]; zbase(zk, b, sizeof b);
	char seen[10][32]; int ns = 0;
	for (const char *z = b; z && ns < 10; z = zparent(z)) {
		bool loop = false; for (int i = 0; i < ns; i++) if (!strcmp(seen[i], z)) loop = true;
		if (loop) break;
		snprintf(seen[ns++], 32, "%s", z);
		tpRule(z, jget(d, "regole"), jget(d, "cancelli"), no, n); if (no[0]) return;
	}
}
static void tpGates(void) {
	char b[600]; JW w = {b, 0, sizeof b}; int k = 0;
	jwRaw(&w, "[");
	for (int i = 0; i < NENT; i++) {
		Ent *e = &ents[i]; if (e->k != K_PO || !e->lock[0] || !e->to[0]) continue;
		char bb[32]; zbase(e->to, bb, sizeof bb);
		const char *g = gateOf(bb); if (g && !strcmp(g, e->lock)) continue;
		if (!g && nGate < 24) { snprintf(gateSeen[nGate][0], 24, "%s", bb); snprintf(gateSeen[nGate][1], 24, "%s", e->lock); nGate++; }
		if (k) jwRaw(&w, ",");
		jwRaw(&w, "["); jwStr(&w, bb); jwRaw(&w, ","); jwStr(&w, e->lock); jwRaw(&w, "]"); k++;
		if (w.n > 500) break;
	}
	jwRaw(&w, "]");
	if (k) netSendX("tpa", "cancelli", b);
}
static void tpMsg(const char *ev, J *d) {
	const char *id = jgs(d, "id", "");
	if (!strcmp(ev, "verifica")) {
		char no[200]; tpCheck(d, no, sizeof no);
		char b[300]; JW w = {b, 0, sizeof b}; jwRaw(&w, "{\"id\":"); jwStr(&w, id); jwRaw(&w, ",\"perche\":"); jwStr(&w, no); jwRaw(&w, "}");
		netSendX("tpa", "verifica", b);
	} else if (!strcmp(ev, "vai")) {
		char no[200]; tpCheck(d, no, sizeof no);
		char b[300]; JW w = {b, 0, sizeof b}; jwRaw(&w, "{\"id\":"); jwStr(&w, id); jwRaw(&w, ",\"perche\":"); jwStr(&w, no); jwRaw(&w, "}");
		netSendX("tpa", "esito", b);
		if (no[0]) { msg("%s", no); return; }
		const char *zk = jgs(d, "zk", "town"); float x = jgn(d, "x", 0), y = jgn(d, "y", 0);
		// nella fossa del Colosseo no: si resta nella sala d'attesa
		if (!strcmp(zk, "arena") && ({ float a = (x - 19.5f) / 12, c = (y - 23.5f) / 9; sqrtf(a * a + c * c) < .96f; })) x = y = 0;
		goZoneAt(zk, x, y);
		msg("Ti sei teletrasportato da %s", jgs(d, "da", "?"));
	} else if (!strcmp(ev, "richiesta")) {
		CARD.kind = 1; snprintf(CARD.id, sizeof CARD.id, "%s", id);
		snprintf(CARD.ti, sizeof CARD.ti, "Teletrasporto");
		snprintf(CARD.tx, sizeof CARD.tx, "%s vuole teletrasportarsi da te. Scade tra %d secondi.", jgs(d, "da", "?"), (int)jgn(d, "sec", 60));
		CARD.t = jgn(d, "sec", 60);
		tone(660, .08f, W_TRIANGLE, .05f);
		msg("%s vuole teletrasportarsi da te: rispondi sullo schermo touch", jgs(d, "da", "?"));
	} else if (!strcmp(ev, "chiudi")) { if (CARD.kind == 1 && (!id[0] || !strcmp(id, CARD.id))) cardClose(); }
}

/* =====================================================================================================
   Ritorno ad Aldoria (hub.js): /hub.                                                                         */
static void hubMsg(const char *ev, J *d) {
	if (strcmp(ev, "vai")) return;
	char no[160] = "";
	extern int nearestEnemy(float maxd);
	int sec = (int)ceilf(jgn(d, "combattimentoSec", 0) - (clk - lastHit));
	if (!started) snprintf(no, sizeof no, "Il gioco non è ancora pronto.");
	else if (zoneBusy()) snprintf(no, sizeof no, "Stai già cambiando zona.");
	else if (!strcmp(Zk, "town")) snprintf(no, sizeof no, "Sei già ad Aldoria.");
	else if (!strcmp(Zk, "cella")) snprintf(no, sizeof no, "Sei chiuso in una cella: da qui non puoi andartene.");
	else if (inPit(P.px, P.py)) snprintf(no, sizeof no, "Sei nella fossa del Colosseo: esci prima dal combattimento.");
	else {
		for (int i = 0; i < NENT; i++) { Ent *e = &ents[i]; if (e->k == K_EN && e->al && e->hp > 0 && dist2(e->px, e->py) < 7) { snprintf(no, sizeof no, "Ci sono nemici vicini: allontanati o sconfiggili prima di tornare ad Aldoria."); break; } }
		if (!no[0] && sec > 0) snprintf(no, sizeof no, "Sei stato colpito da poco: aspetta ancora %d %s", sec, sec == 1 ? "secondo." : "secondi.");
	}
	char b[300]; JW w = {b, 0, sizeof b};
	jwRaw(&w, "{\"id\":"); J *idn = jget(d, "id"); if (idn && idn->t == JNUM) jwf(&w, "%.0f", idn->d); else jwStr(&w, jgs(d, "id", ""));
	jwRaw(&w, ",\"perche\":"); jwStr(&w, no); jwRaw(&w, ",\"da\":"); jwStr(&w, Zk); jwRaw(&w, "}");
	netSendX("hub", "esito", b);
	if (no[0]) { msg("%s", no); return; }
	goZone("town"); msg("Sei tornato ad Aldoria");
}

/* =====================================================================================================
   Gruppi d'avventura (gruppi.js): riquadro dei compagni, chat del gruppo, inviti.                            */
typedef struct { char id[16], n[16], z[32]; int on, lv, hp, mx, capo, io; } Mate;
static struct { bool on; int max, n; Mate m[8]; } GR;
bool plMate(const char *id) { if (!GR.on || !id[0]) return false; for (int i = 0; i < GR.n; i++) if (!GR.m[i].io && !strcmp(GR.m[i].id, id)) return true; return false; }
static void grMsg(const char *ev, J *d) {
	if (!strcmp(ev, "pronto")) HG.ready = true;
	else if (!strcmp(ev, "stato")) {
		J *L = d ? jget(d, "membri") : NULL;
		if (!L || L->t != JARR) { GR.on = false; GR.n = 0; return; }
		GR.on = true; GR.max = (int)jgn(d, "max", 4); GR.n = 0;
		JFOR(q, L) {
			if (GR.n >= 8) break;
			Mate *m = &GR.m[GR.n++];
			snprintf(m->id, sizeof m->id, "%s", jgs(q, "id", "")); snprintf(m->n, sizeof m->n, "%.14s", jgs(q, "n", "?")); snprintf(m->z, sizeof m->z, "%s", jgs(q, "z", ""));
			m->on = (int)jgn(q, "on", 0); m->lv = (int)jgn(q, "lv", 1); m->hp = (int)jgn(q, "hp", 0); m->mx = (int)jgn(q, "mx", 1); m->capo = (int)jgn(q, "capo", 0); m->io = (int)jgn(q, "io", 0);
		}
	} else if (!strcmp(ev, "chat")) {
		const char *n = jgs(d, "n", "?");
		char who[40]; snprintf(who, sizeof who, "[gruppo] %s", n);
		chatLog(who, jgs(d, "s", ""), 2);
		if (strcmp(n, P.name)) tone(660, .05f, W_TRIANGLE, .04f);
	} else if (!strcmp(ev, "invito")) {
		const char *da = jgs(d, "da", ""); if (!da[0]) return;
		CARD.kind = 2; snprintf(CARD.id, sizeof CARD.id, "%s", da);
		snprintf(CARD.ti, sizeof CARD.ti, "Invito in un gruppo");
		int n = (int)jgn(d, "n", 1);
		if (n > 1) snprintf(CARD.tx, sizeof CARD.tx, "%s ti invita nel suo gruppo d'avventura (%d eroi).", da, n);
		else snprintf(CARD.tx, sizeof CARD.tx, "%s ti invita nel suo gruppo d'avventura.", da);
		CARD.t = fmaxf(5, jgn(d, "sec", 60));
		tone(520, .08f, W_TRIANGLE, .05f);
		msg("%s ti invita nel suo gruppo: rispondi sullo schermo touch", da);
	} else if (!strcmp(ev, "chiudiInvito")) { const char *da = jgs(d, "da", ""); if (CARD.kind == 2 && (!da[0] || !strcmp(da, CARD.id))) cardClose(); }
}

/* =====================================================================================================
   Guardie e ladri (guardieladri.js): nascondino a squadre in un quartiere.                                  */
static struct { bool on; char fase[12], ruolo[12], quart[48]; int liberi, tot; float fine, vista; char ids[16][16]; int nids; } GL;
static void glMsg(const char *ev, J *d) {
	if (!strcmp(ev, "stato")) {
		if (!d || d->t != JOBJ) return;
		GL.on = true;
		snprintf(GL.fase, sizeof GL.fase, "%s", jgs(d, "fase", "")); snprintf(GL.ruolo, sizeof GL.ruolo, "%s", jgs(d, "ruolo", ""));
		snprintf(GL.quart, sizeof GL.quart, "%s", jgs(d, "quartiere", ""));
		GL.liberi = (int)jgn(d, "liberi", 0); GL.tot = (int)jgn(d, "totale", 0);
		GL.fine = clk + jgn(d, "resta", 0) / 1000.f; GL.vista = jgn(d, "vista", 6);
		GL.nids = 0; JFOR(q, jget(d, "ids")) if (GL.nids < 16) snprintf(GL.ids[GL.nids++], 16, "%s", jstr(q, ""));
	} else if (!strcmp(ev, "evento")) {
		const char *bn = jgs(d, "banner", ""), *tx = jgs(d, "testo", "");
		if (bn[0]) banner(bn, tx); else if (tx[0]) msg("%s", tx);
		J *s = jget(d, "suono"); if (s && s->t == JARR) { int ns[8], n = 0; JFOR(q, s) if (n < 8) ns[n++] = (int)jnum(q, 60); jingle(ns, n, .12f, W_TRIANGLE); }
	} else if (!strcmp(ev, "fine")) { GL.on = false; const char *bn = jgs(d, "banner", ""); if (bn[0]) banner(bn, jgs(d, "testo", "")); }
}
static bool glActive(void) { return GL.on && (!strcmp(GL.fase, "nascondi") || !strcmp(GL.fase, "caccia")); }
// una guardia non vede i ladri mentre contano, né quelli lontani durante la caccia
bool plHidePeer(const Peer *o) {
	if (!glActive() || strcmp(GL.ruolo, "guardia")) return false;
	bool thief = false; for (int i = 0; i < GL.nids; i++) if (!strcmp(GL.ids[i], o->id)) thief = true;
	if (!thief) return false;
	return !strcmp(GL.fase, "nascondi") || hyp(o->x - P.px, o->y - P.py) > GL.vista;
}

/* =====================================================================================================
   Messaggi in arrivo                                                                                         */
static bool toldWeb[4];
static void webOnly(int i, const char *what) {
	msg("%s si usa dal gioco nel browser: dalla 3DS restano i comandi in chat.", what);
	if (!toldWeb[i]) { toldWeb[i] = true; char b[160]; snprintf(b, sizeof b, "%s ha finestre del browser che la 3DS non può mostrare. /aiuto elenca i comandi.", what); chatLog("", b, 1); }
}
void plOnMsg(const char *pl, const char *ev, J *d) {
	if (!strcmp(pl, "boss")) wbMsg(ev, d);
	else if (!strcmp(pl, "tesoro")) tsMsg(ev, d);
	else if (!strcmp(pl, "emote")) emMsg(ev, d);
	else if (!strcmp(pl, "tpa")) tpMsg(ev, d);
	else if (!strcmp(pl, "hub")) hubMsg(ev, d);
	else if (!strcmp(pl, "gruppi")) grMsg(ev, d);
	else if (!strcmp(pl, "guardieladri")) glMsg(ev, d);
	else if (!strcmp(pl, "notti")) {
		if (!strcmp(ev, "inizio")) { char b[64]; snprintf(b, sizeof b, "XP x%g fino all'alba", jgn(d, "xp", 2)); banner("Notte di caccia", b); JINGLE(.12f, W_TRIANGLE, 60, 67, 72); }
		else if (!strcmp(ev, "fine")) banner("L'alba", "La notte di caccia è finita");
	} else if (!strcmp(pl, "torneo")) {
		if (!strcmp(ev, "chiamata")) {
			char b[120]; snprintf(b, sizeof b, "Contro %s · entra nel Colosseo entro %d min", jgs(d, "contro", "?"), (int)jgn(d, "minuti", 3)); banner("Torneo: tocca a te!", b);
			snprintf(b, sizeof b, "Torneo: tocca a te contro %s! Vai nella fossa del Colosseo.", jgs(d, "contro", "?")); chatLog("", b, 1);
			JINGLE(.1f, W_SQUARE, 67, 72, 76);
		} else if (!strcmp(ev, "iscrizioni")) banner("Torneo dell'arena", "Iscrizioni aperte · scrivi /torneo iscrivi");
		else if (!strcmp(ev, "vincitore")) { char b[80]; snprintf(b, sizeof b, "%s vince il torneo", jgs(d, "nome", "?")); banner("Campione dell'arena", b); }
	} else if (!strcmp(pl, "sindaco")) {
		if (!strcmp(ev, "eletto")) { char b[80]; int v = (int)jgn(d, "voti", 0); snprintf(b, sizeof b, "%s · %d %s", jgs(d, "nome", "?"), v, v == 1 ? "voto" : "voti"); banner(jgn(d, "tu", 0) ? "Sei il sindaco!" : "Nuovo sindaco", b); }
		else if (!strcmp(ev, "discorso")) { char b[200]; snprintf(b, sizeof b, "%s: «%s»", jgs(d, "nome", "?"), jgs(d, "testo", "")); chatLog("Sindaco", b, 1); }
		else if (!strcmp(ev, "decreto")) banner("Decreto del sindaco", jgs(d, "nome", ""));
		else if (!strcmp(ev, "festa")) { char b[80]; snprintf(b, sizeof b, "Il portale è in piazza · %d minuti", (int)jgn(d, "min", 10)); banner("Festa in discoteca!", b); }
	} else if (!strcmp(pl, "pesca")) {
		if (!strcmp(ev, "avviso")) msg("%s", jgs(d, "testo", ""));
		else if (!strcmp(ev, "banner")) banner(jgs(d, "titolo", "Pesca"), jgs(d, "testo", ""));
	} else if (!strcmp(pl, "speedrun") || !strcmp(pl, "albo")) {
		if (!strcmp(ev, "origine?")) { extern void plOrigin(const char *pl); plOrigin(pl); }
	} else if (!strcmp(pl, "housing")) { if (!strcmp(ev, "vai") || !strcmp(ev, "apri")) webOnly(0, "Il Borgo delle case"); }
	else if (!strcmp(pl, "discoteca")) { if (!strcmp(ev, "entra")) webOnly(1, "La Discoteca"); }
	else if (!strcmp(pl, "mercato")) { if (!strcmp(ev, "apri")) webOnly(2, "Il Mercatino"); }
}

// l'indirizzo del server, per i link dei plugin (speedrun, albo)
void plOrigin(const char *pl) {
	char o[140]; snprintf(o, sizeof o, "%s", NETC.url);
	char *s = strstr(o, "://"); if (s) { char *p = strchr(s + 3, '/'); if (p) *p = 0; }
	if (!strncmp(o, "wss://", 6)) { memmove(o + 1, o, strlen(o) + 1); memcpy(o, "https", 5); }
	else if (!strncmp(o, "ws://", 5)) { memmove(o + 2, o, strlen(o) + 1); memcpy(o, "http", 4); }
	sendStr(pl, "origine", "o", o);
}
// appena collegati (o ricollegati con un nuovo id)
void plOnConnect(void) {
	HE = (Hello){0}; HG = (Hello){0}; tgLast = -1; GR.on = false; GL.on = false; cardClose();
	plOrigin("speedrun"); plOrigin("albo");
}
void plOnDisconnect(void) {
	if (WB.on) wbRemove(false);
	WB.on = false; TS.on = false; GR.on = false; GL.on = false; HE.ready = HG.ready = false; cardClose();
}
// entrando in una zona
static char lastZk[32];
void plOnZone(void) { if (netOk) tpGates(); }

void plTick(float dt) {
	clk += dt;
	if (lastHp >= 0 && P.hp < lastHp) lastHit = clk;
	lastHp = P.hp;
	if (myEmoT > 0) myEmoT -= dt;
	if (CARD.kind && (CARD.t -= dt) <= 0) cardClose();
	if (!netOk) { if (WB.on || GR.on || GL.on || CARD.kind) plOnDisconnect(); return; }
	helloTick(&HE, "emote", dt); helloTick(&HG, "gruppi", dt);
	if (!started) return;
	if (strcmp(lastZk, Zk) && !zoneBusy()) { snprintf(lastZk, sizeof lastZk, "%s", Zk); plOnZone(); }
	wbTick(dt); tsTick(dt); tgTick(dt);
}

/* =====================================================================================================
   Disegno sullo schermo superiore                                                                            */
static void lab(float x, float y, float sc, u32 c, const char *s) { txtC(x + 1, y + 1, sc, C2D_Color32(0, 0, 0, 200), s); txtC(x, y, sc, c, s); }
static void zshort(const char *zk, char *out, int n) {
	if (!zk[0]) { snprintf(out, n, "fuori dal gioco"); return; }
	if (!strcmp(zk, Zk)) { snprintf(out, n, "qui con te"); return; }
	snprintf(out, n, "%s", zoneTitle(zk));
}
void plDrawTop(void) {
	// barra del boss del mondo, solo nella sua zona
	Ent *e = WB.on ? wbEnt() : NULL;
	if (e) {
		float f = clampf(e->hp / fmaxf(1, e->mx), 0, 1);
		char b[80]; snprintf(b, sizeof b, "%s · %d%%", WB.nome, (int)ceilf(f * 100));
		rect(60, 22, 280, 10, C2D_Color32(0, 0, 0, 180));
		rect(61, 23, 278 * f, 8, C2D_Color32(220, 80, 40, 255));
		rect(60, 22, 280, 1, C2D_Color32(255, 216, 74, 160));
		lab(200, 6, .45f, C2D_Color32(255, 230, 200, 255), b);
	}
	// il riquadro del gruppo, in alto a sinistra
	if (GR.on) {
		int n = 0; for (int i = 0; i < GR.n; i++) if (!GR.m[i].io) n++;
		float h = 14 + n * 22 + (n ? 0 : 12), y = 36;
		rect(4, y, 124, h, C2D_Color32(14, 22, 20, 200));
		rect(4, y, 124, 1, C2D_Color32(62, 224, 122, 200));
		char b[64]; snprintf(b, sizeof b, "Gruppo %d/%d", GR.n, GR.max);
		txt(8, y + 1, .38f, C_GREEN, b); y += 14;
		if (!n) txt(8, y - 1, .32f, C_MU, "/gruppo invita nome");
		for (int i = 0; i < GR.n; i++) {
			Mate *m = &GR.m[i]; if (m->io) continue;
			snprintf(b, sizeof b, "%s%s Lv%d", m->capo ? "* " : "", m->n, m->lv);
			txt(8, y - 2, .34f, C_TXT, b);
			float k = m->on && m->mx ? clampf(m->hp / (float)m->mx, 0, 1) : 0;
			rect(8, y + 9, 60, 3, C2D_Color32(0, 0, 0, 160)); rect(8, y + 9, 60 * k, 3, k < .3f ? C2D_Color32(255, 90, 74, 255) : C2D_Color32(62, 224, 122, 255));
			char z[64]; zshort(m->on ? m->z : "", z, sizeof z);
			while (strlen(z) > 4 && txtW(z, .3f) > 54) { int l = strlen(z) - 1; while (l > 0 && (z[l] & 0xC0) == 0x80) l--; z[l] = 0; }
			txt(70, y + 6, .3f, C_MU, z);
			y += 22;
		}
	}
	// guardie e ladri: stato in alto, e la benda della guardia che conta
	if (GL.on) {
		int s = (int)fmaxf(0, ceilf(GL.fine - clk));
		bool guard = !strcmp(GL.ruolo, "guardia");
		if (!strcmp(GL.fase, "nascondi") && guard) {
			rect(0, 0, 400, 240, C2D_Color32(4, 6, 12, 242));
			lab(200, 80, .6f, C_TXT, "Sei una guardia: conta mentre i ladri si nascondono!");
			char c[8]; snprintf(c, sizeof c, "%d", s); lab(200, 110, 1.4f, C_GOLD, c);
		}
		char b[140]; const char *ru = guard ? "Guardia" : !strcmp(GL.ruolo, "ladro") ? "Ladro" : "Fuori dal gioco";
		const char *fa = !strcmp(GL.fase, "nascondi") ? (guard ? "Conta: " : "Nasconditi: ") : !strcmp(GL.fase, "caccia") ? "Caccia: " : "";
		snprintf(b, sizeof b, "%s · %s%d:%02d · ladri liberi %d/%d%s%s", ru, fa, s / 60, s % 60, GL.liberi, GL.tot, GL.quart[0] ? " · " : "", GL.quart);
		float w = txtW(b, .4f) + 16; float y = e ? 36 : 4;
		rect(200 - w / 2, y, w, 16, C2D_Color32(10, 14, 24, 210)); txtC(200, y + 1, .4f, C_TXT, b);
	}
	// la mia emote
	if (myEmoT > 0 && myEmo >= 0) { float sx, sy; worldToScreen(P.px, P.py, 44, &sx, &sy); lab(sx, sy - 26, .42f, C2D_Color32(255, 227, 138, 255), EMOB[myEmo]); }
}

/* =====================================================================================================
   Pannello «Funzioni del server» (schermo touch)                                                            */
static void cmd(const char *s) {
	char b[120]; JW w = {b, 0, sizeof b}; jwRaw(&w, "{\"t\":\"chat\",\"s\":"); jwStr(&w, s); jwRaw(&w, ",\"z\":"); jwStr(&w, Zk); jwRaw(&w, "}"); netSendRaw(b);
}
enum { PA_PAGE = 1, PA_CMD, PA_EMO, PA_GREXIT, PA_GRTPA, PA_CARD };
static const char *CMDS[][2] = {{"Boss del mondo", "/boss"}, {"Caccia al tesoro", "/tesoro"}, {"Taglie del giorno", "/taglie"}, {"Notte di caccia", "/evento"},
	{"Torneo dell'arena", "/torneo"}, {"Classifiche", "/classifiche"}, {"Ricompensa del giorno", "/giornaliero"}, {"Tutti i comandi", "/aiuto"}};
#define NCMDS (int)(sizeof CMDS / sizeof CMDS[0])
static int plArg(int kind, int i) { return kind * 100 + i; }
void plBuildPanel(void) {
	char b[200];
	if (plPage == 1) {
		uiPlugTitle("Emote", "Un fumetto sopra la testa, visto da chi è nella tua zona.");
		for (int i = 0; i < 12; i++) { char l[48]; snprintf(l, sizeof l, "/%s", EMO[i][0]); uiPlugOpt(l, EMO[i][1], plArg(PA_EMO, i), C_TXT, !netOk); }
	} else if (plPage == 2) {
		if (GR.on) snprintf(b, sizeof b, "Gruppo %d/%d. Esperienza e oro dei boss dei dungeon si dividono tra i compagni nello stesso dungeon. /gr testo scrive solo al gruppo.", GR.n, GR.max);
		else snprintf(b, sizeof b, "Non sei in un gruppo. Invita qualcuno con /gruppo invita nome (fino a 4 eroi).");
		uiPlugTitle("Gruppo d'avventura", b);
		for (int i = 0; i < GR.n && GR.on; i++) {
			Mate *m = &GR.m[i]; char l[48], r[48], z[64]; zshort(m->on ? m->z : "", z, sizeof z);
			snprintf(l, sizeof l, "%s%s · Lv %d%s", m->capo ? "* " : "", m->n, m->lv, m->io ? " (tu)" : "");
			if (m->io) snprintf(r, sizeof r, "%d/%d", (int)P.hp, P.mx); else snprintf(r, sizeof r, "%.30s", z);
			bool far = !m->io && m->on && strcmp(m->z, Zk);
			uiPlugOpt(l, r, far ? plArg(PA_GRTPA, i) : 0, m->io ? C_GOLD : m->on ? C_GREEN : C_MU, false);
		}
		if (GR.on) uiPlugOpt("Raggiungi un compagno: tocca il suo nome", "/tpa", 0, C_MU, true);
		if (GR.on) uiPlugOpt("Esci dal gruppo", "", plArg(PA_GREXIT, 0), C_RED, false);
		uiPlugOpt("Indietro", "", plArg(PA_PAGE, 0), C_TXT, false);
	} else if (plPage == 3) {
		uiPlugTitle("Registro della chat", NULL);
		const char *s; int sys, n = 0;
		for (int i = 0; uiChatHist(i, &s, &sys) && n < 44; i++) {
			// righe lunghe divise per la larghezza dello schermo
			char line[160]; snprintf(line, sizeof line, "%s", s); char *p = line;
			while (*p && n < 44) {
				char seg[80]; int k = 0, lastSp = -1;
				while (p[k] && k < 78) { seg[k] = p[k]; seg[k + 1] = 0; if (txtW(seg, .46f) > 280) break; if (p[k] == ' ') lastSp = k; k++; }
				if (p[k] && lastSp > 8) k = lastSp + 1;
				while (k > 0 && (p[k] & 0xC0) == 0x80) k--;
				memcpy(seg, p, k); seg[k] = 0; p += k;
				uiPlugOpt(seg, "", 0, sys == 2 ? C_GREEN : sys ? C2D_Color32(255, 216, 120, 255) : C_TXT, false);
				n++;
			}
		}
		if (!n) uiPlugOpt("Ancora nessun messaggio", "", 0, C_MU, true);
	} else {
		snprintf(b, sizeof b, netOk ? "I plugin del server: boss del mondo, caccia al tesoro, taglie, notti di caccia, emote, teletrasporto, gruppi, tornei. Le risposte arrivano in chat." : "Collegati a un server dal menu Multigiocatore.");
		uiPlugTitle("Funzioni del server", b);
		uiPlugOpt("Emote", "fumetti", plArg(PA_PAGE, 1), C_GOLD, !netOk);
		uiPlugOpt("Gruppo d'avventura", GR.on ? "nel gruppo" : "", plArg(PA_PAGE, 2), C_GOLD, !netOk);
		uiPlugOpt("Torna ad Aldoria", "/hub", plArg(PA_CMD, 99), C_TXT, !netOk);
		for (int i = 0; i < NCMDS; i++) uiPlugOpt(CMDS[i][0], CMDS[i][1], plArg(PA_CMD, i), C_TXT, !netOk);
		uiPlugOpt("Registro della chat", "", plArg(PA_PAGE, 3), C_TXT, false);
		if (CARD.kind) uiPlugOpt(CARD.tx, "Accetta", plArg(PA_CARD, 1), C_GREEN, false);
	}
}
// restituisce 1 se il pannello va chiuso, 0 se va ridisegnato
int plPanelAct(int arg) {
	int k = arg / 100, i = arg % 100;
	switch (k) {
	case PA_PAGE: plPage = i; return 0;
	case PA_CMD:
		if (i == 99) { cmd("/hub"); return 1; }
		if (i < NCMDS) { cmd(CMDS[i][1]); plPage = 3; }
		return 0;
	case PA_EMO: if (i < 12) { char b[24]; snprintf(b, sizeof b, "/%s", EMO[i][0]); cmd(b); } return 1;
	case PA_GREXIT: netSendX("gruppi", "esci", "1"); plPage = 0; return 0;
	case PA_GRTPA: if (i < GR.n) { char b[40]; snprintf(b, sizeof b, "/tpa %s", GR.m[i].n); cmd(b); chatLog(P.name, b, 0); } return 1;
	case PA_CARD: plCardAnswer(i == 1); return 0;
	}
	return 0;
}
bool plPanelBack(void) { if (plPage != 0) { plPage = 0; return true; } return false; }
void plPanelPage(int p) { plPage = p; }
