// Voxelia PS4 - interfaccia su un solo schermo, come nel browser: HUD sopra il mondo (eroe, minimappa,
// obiettivi, menu, abilità), finestre di dialogo, negozi, zaino, missioni, diario, menu di pausa e titolo al
// centro; nomi, barre e numeri sopra i personaggi. Tutto si usa con i tasti o toccando lo schermo.
#include "voxelia.h"

#define G_A "\xEE\x80\x80"
#define G_B "\xEE\x80\x81"
#define G_X "\xEE\x80\x82"
#define G_Y "\xEE\x80\x83"
#define G_L "\xEE\x80\x84"
#define G_R "\xEE\x80\x85"
#define G_DPAD "\xEE\x80\x86"
#define G_PAD "\xEE\x81\xB7"
#define G_ST "\xEE\x80\x87"
#define G_SE "\xEE\x80\x88"
#define G_L2 "\xEE\x80\x8A"
#define G_R2 "\xEE\x80\x8B"
#define G_R3 "\xEE\x80\x8C"

#define COL(r, g, b) C2D_Color32(r, g, b, 255)
#define C_PANEL C2D_Color32(27, 32, 48, 255)
#define C_PANEL2 C2D_Color32(36, 43, 64, 255)
#define C_GOLD C2D_Color32(245, 185, 66, 255)
#define C_TXT C2D_Color32(232, 236, 244, 255)
#define C_MU C2D_Color32(154, 164, 184, 255)
#define C_SEL C2D_Color32(90, 67, 32, 255)

int PM = PM_NONE;
static int PMback = PM_NONE;
extern float zoneFade;
extern bool TITLE_MODE;
bool wantKeyboard = false;
static int wantDiff = 1;

/* ---------------- messaggi e annunci ---------------- */
// il font della console non ha le emoji che i plugin mettono nei messaggi: si tolgono (e gli spazi rimasti in testa)
static void noEmoji(char *s) {
	char *o = s; const unsigned char *p = (const unsigned char *)s;
	while (*p) {
		if (*p >= 0xF0) { p++; while (*p && (*p & 0xC0) == 0x80) p++; continue; }
		if (p[0] == 0xEF && p[1] == 0xB8 && p[2] == 0x8F) { p += 3; continue; }   // selettore di variante
		if (p[0] == 0xE2 && p[1] == 0x80 && p[2] == 0x8D) { p += 3; continue; }   // unione di emoji
		*o++ = *p++;
	}
	*o = 0;
	char *a = s; while (*a == ' ') a++;
	if (a != s) memmove(s, a, strlen(a) + 1);
}
static char MSG[160]; static float msgT = 0;
void msg(const char *fmt, ...) {
	va_list ap; va_start(ap, fmt); vsnprintf(MSG, sizeof MSG, fmt, ap); va_end(ap);
	noEmoji(MSG); msgT = 3.5f;
}
typedef struct { char a[48], b[120]; float t; } Ban;
static float banT0 = -1;   // quando è comparso il titolo in cima alla coda
static Ban BAN[4]; static int NBAN = 0;
void banner(const char *a, const char *b) {
	if (NBAN >= 4) { memmove(BAN, BAN + 1, sizeof(Ban) * 3); NBAN = 3; }
	Ban *x = &BAN[NBAN++]; snprintf(x->a, sizeof x->a, "%s", a); snprintf(x->b, sizeof x->b, "%s", b ? b : ""); noEmoji(x->a); noEmoji(x->b); x->t = 2.6f + marqueeTime(x->b, .42f, 308);
}
static char ZBAN[96]; static float zbanT = 0;
typedef struct { char s[140]; float t, tt; u8 sys; } ChatL;
static ChatL CHL[8]; static int NCHL = 0;
static ChatL HIST[40]; static int NHIST = 0;
void chatLog(const char *who, const char *s, int sys) {
	if (NCHL >= 8) { memmove(CHL, CHL + 1, sizeof(ChatL) * 7); NCHL = 7; }
	ChatL *c = &CHL[NCHL++];
	if (who && *who) snprintf(c->s, sizeof c->s, "%s: %s", who, s); else snprintf(c->s, sizeof c->s, "%s", s);
	noEmoji(c->s);
	// le righe lunghe restano finché non sono scorse tutte
	c->tt = fmaxf(9, marqueeTime(c->s, .36f, 228) + 2);
	c->t = c->tt; c->sys = sys;
#ifndef __PS4__
	if (getenv("VOX_AUTO")) printf("[chat] %s\n", c->s);   // prove automatiche sul PC
#endif
	// registro della chat (Funzioni del server -> Registro della chat)
	if (NHIST >= 40) { memmove(HIST, HIST + 1, sizeof(ChatL) * 39); NHIST = 39; }
	HIST[NHIST++] = *c;
}
// i-esimo messaggio dal più recente
int uiChatHist(int i, const char **s, int *sys) { if (i < 0 || i >= NHIST) return 0; ChatL *c = &HIST[NHIST - 1 - i]; *s = c->s; *sys = c->sys; return 1; }

/* ---------------- minimappa: una texture aggiornata solo quando cambia la zona ---------------- */
static int mmTex = -1;
static u32 mmPx[128 * 128];
static bool mmDirty = true;
void uiMinimapDirty(void) { mmDirty = true; snprintf(ZBAN, sizeof ZBAN, "%s", ZNAME); zbanT = 2.6f; }
static u32 tileCol(int x, int y) {
	u32 c = TCOL[y][x];
	if (M[y][x] == 9) return 0;
	return WK(M[y][x]) ? shade(c, .8f) : shade(c, .62f);
}
static void mmBuild(void) {
	for (int y = 0; y < 128; y++) for (int x = 0; x < 128; x++) {
		u32 rgba = 0;
		if (x < N && y < N && M[y][x] != 9) { u32 c = tileCol(x, y); rgba = C2D_Color32((c >> 16) & 255, (c >> 8) & 255, c & 255, 255); }
		mmPx[y * 128 + x] = rgba;
	}
	if (mmTex < 0) mmTex = texCreate(128, 128, mmPx, true); else texUpdate(mmTex, 128, 128, mmPx);
	mmDirty = false;
}
static void drawMinimap(float X, float Y, float S, bool legend) {
	if (mmDirty) mmBuild();
	rectR(X - 3, Y - 3, S + 6, S + 6, 4, C2D_Color32(0, 0, 0, 170));
	float k = S / N;
	imageDraw(mmTex, X, Y, S, S, 0, 0, N / 128.f, N / 128.f, 0xffffffff);
	for (int i = 0; i < NENT; i++) {
		Ent *e = &ents[i];
		u32 c; float r = 2;
		switch (e->k) {
		case K_EN: c = e->boss ? COL(255, 0, 255) : COL(255, 68, 68); if (e->boss) r = 4; break;
		case K_PO: c = COL(68, 238, 255); r = 3; break;
		case K_CH: c = COL(255, 170, 51); break;
		case K_NPC: c = e->qm ? COL(255, 216, 74) : COL(238, 238, 153); if (e->qm) r = 3; break;
		case K_SHARD: case K_LORE: c = COL(255, 255, 255); r = 3; break;
		case K_DR: c = COL(220, 220, 220); break;
		default: continue;
		}
		if (S > 150) r *= 1.5f;
		rect(X + e->px * k - r / 2, Y + e->py * k - r / 2, r, r, c);
	}
	// l'eroe: freccia nella direzione in cui guarda
	float hx = X + P.px * k, hy = Y + P.py * k, a = atan2f(P.dr[1], P.dr[0]);
	float ca = cosf(a), sa = sinf(a), z = S > 150 ? 1.6f : 1;
	tri(hx + ca * 5 * z, hy + sa * 5 * z, hx - (ca * 3.5f + sa * 3.5f) * z, hy + (-sa * 3.5f + ca * 3.5f) * z, hx + (-ca * 3.5f + sa * 3.5f) * z, hy - (sa * 3.5f + ca * 3.5f) * z, C2D_Color32(255, 255, 255, 255));
	// bussola
	txtC(X + S / 2, Y - 2, .34f, C2D_Color32(255, 138, 122, 255), "N");
	if (legend) {
		float lx = X + S + 12, ly = Y;
		const char *L[] = {"Tu", "Nemici", "Boss", "Portali", "Forzieri", "Personaggi", "Missioni"};
		u32 C[] = {COL(255, 255, 255), COL(255, 68, 68), COL(255, 0, 255), COL(68, 238, 255), COL(255, 170, 51), COL(238, 238, 153), COL(255, 216, 74)};
		for (int i = 0; i < 7; i++) { rect(lx, ly + 6 + i * 17, 7, 7, C[i]); txt(lx + 12, ly + i * 17, .42f, C_TXT, L[i]); }
	}
}

/* ---------------- liste di opzioni (finestre) ---------------- */
enum {
	A_CLOSE = 1, A_BACK, A_STORY, A_QACCEPT, A_QTURN, A_OPEN, A_HEAL, A_REST, A_SONG, A_BUY, A_SELL, A_SELLALL, A_FORGE, A_UPG,
	A_EQUIP, A_DROPIT, A_QABANDON, A_LORE, A_RESUME, A_SAVE, A_SETTING, A_TITLE, A_CONT, A_NEW, A_PROLOG, A_HELP, A_DIFF,
	A_EXITSTAY, A_EXITGO, A_BET, A_CPLAY, A_CONFIRM, A_NOP, A_NAME, A_NETTOG, A_NETURL, A_NETCODE, A_CHAT, A_WHO, A_ARBUY, A_SELLRES, A_SAIL, A_PLUG, A_OPENPLUG, A_X, A_DEV, A_OPENDEV
};
typedef struct { char l[72]; char r[40]; u32 col; int act, arg; bool dis; } Opt;
static Opt OPT[72]; static int NOPT = 0, SEL = 0, SCR = 0;
static char PT[80], PB[900], PS[120];
static Ent *PNPC = NULL;
static int npcLine = 0;
static const char *txtTi, *txtTx, *txtSub;
static int confirmStep = 0;
static int CB = 10; static char CR[96];

static Opt *opt(const char *l, int act, int arg) {
	if (NOPT >= 72) return &OPT[71];
	Opt *o = &OPT[NOPT++]; memset(o, 0, sizeof *o);
	snprintf(o->l, sizeof o->l, "%s", l); o->act = act; o->arg = arg; o->col = C_TXT; return o;
}
static void itemDesc(const Item *it, char *out, int n) {
	char cr[16] = "", hp[16] = "";
	if (it->cr) snprintf(cr, sizeof cr, " · CRIT +%d%%", it->cr);
	if (it->hp) snprintf(hp, sizeof hp, " · PV +%d", it->hp);
	char el[32] = ""; { static const char *R[6] = {"", "I", "II", "III", "IV", "V"}; int k = itemEl(it); if (k) snprintf(el, sizeof el, " · %s %s", elName(k), R[itemElLv(it)]); }
	if (it->s == SL_W) { int ml; const char *t = wmTitle(it, &ml); int o = strlen(el); if (t) snprintf(el + o, sizeof el - o, " · «%.14s»", t); }
	snprintf(out, n, "%s %d%s%s%s", it->s == SL_W ? "ATT" : "DIF", iv(it), cr, hp, el);
}
static u32 rarCol(int r) { u32 c = RC[r]; return C2D_Color32((c >> 16) & 255, (c >> 8) & 255, c & 255, 255); }
u32 xRarCol(int r) { return rarCol(clampi(r, 0, 4)); }

static void buildPanel(void);
bool uiBlocking(void) { return PM != PM_NONE; }
void uiOpenPanel(int m) {
	if (m != PM && m != PM_TXT) PMback = PM;
	PM = m; SEL = 0; SCR = 0; buildPanel();
	tone(560, .03f, W_TRIANGLE, .04f);
}
void uiClose(void) { PM = PM_NONE; PNPC = NULL; }
void uiOpenNpc(Ent *e) { PNPC = e; npcLine = fri(0, 4); PMback = PM_NONE; PM = PM_NPC; SEL = 0; SCR = 0; buildPanel(); }
static int txtBack = PM_NONE;
void uiOpenText(const char *ti, const char *tx, const char *sub) {
	txtTi = ti; txtTx = tx; txtSub = sub;
	txtBack = (PM == PM_DIARY) ? PM_DIARY : PM_NONE;
	PM = PM_TXT; SEL = 0; SCR = 0; buildPanel();
}

static const char *npcLineText(Ent *e) {
	static char b[300];
	int id = e->nid;
	if (id < 0) return NVLINES ? VLINES[npcLine % NVLINES] : "...";
	const NpcDef *d = &NPCS[id];
	if (!strcmp(d->id, "re")) {
		static const char *K[] = {"Avvicinati, eroe. Il regno ha bisogno di te.", NULL, "Li hai trovati tutti! Presto, consegnameli.",
			"Il portale per la Cittadella è aperto qui, nella sala del trono. Vai, e riporta la pace.", "Malakar... è caduto? Raccontami tutto, Campione.",
			"Aldoria ti sarà per sempre grata, Campione. Non mi sono mai sentito così forte: sento il regno intero tra le mani."};
		if (P.st == 1) {
			char miss[200] = ""; int n = 0;
			for (int i = 0; i < NSHARD; i++) if (!(P.sh & (1u << i))) { if (n) strcat(miss, ", "); strcat(miss, DG[i].n); n++; }
			snprintf(b, sizeof b, "Hai recuperato %d frammenti su 6. Ti mancano: %s.", 6 - n, miss);
			return b;
		}
		return K[P.st > 5 ? 5 : P.st];
	}
	if (d->role == R_SAGE) {
		int nx = -1; for (int i = 0; i < NSHARD; i++) if (!(P.sh & (1u << i))) { nx = i; break; }
		if (P.st == 0) return "Il Re ti attende al castello. Poi torna da me: conosco ogni angolo di questo regno.";
		if (nx >= 0 && P.st == 1) { snprintf(b, sizeof b, "Il prossimo frammento? Cerca %s, %s. Le pagine del diario di Malakar sono sparse nei dungeon: raccontano la sua storia.", DG[nx].n, DGH[nx]); return b; }
		return "La Corona è quasi salva. Ricorda: ogni dungeon rinasce più forte quando il suo signore cade, e lascia tesori migliori.";
	}
	if (d->role == R_CAT) return "Miao! Briciola fa le fusa e si struscia contro le tue gambe.";
	return d->nln ? d->ln[npcLine % d->nln] : "...";
}

static void buildNpc(void) {
	Ent *e = PNPC; if (!e) { PM = PM_NONE; return; }
	int id = e->nid;
	snprintf(PT, sizeof PT, "%s", e->name);
	snprintf(PB, sizeof PB, "«%s»", npcLineText(e));
	PS[0] = 0;
	const NpcDef *d = id >= 0 ? &NPCS[id] : NULL;
	if (d && !strcmp(d->id, "re")) {
		if (P.st == 0) opt("Accetta la missione del Re", A_STORY, 1)->col = C_GOLD;
		else if (P.st == 2) opt("Consegna i sei frammenti (+1000 oro)", A_STORY, 3)->col = C_GOLD;
		else if (P.st == 4) opt("Ricevi la ricompensa del Re (+5000 oro e i suoi doni)", A_STORY, 5)->col = C_GOLD;
	}
	if (id >= 0) {
		int aq = -1; for (int i = 0; i < P.nq; i++) if (P.q[i].npc == id) aq = i;
		if (aq >= 0) {
			const QuestDef *T = &QT[P.q[aq].id];
			if (qReady(&P.q[aq])) {
				int g, x; qRew(P.q[aq].id, &g, &x);
				char b[80]; snprintf(b, sizeof b, "Consegna «%s» (+%d oro, +%d XP)", T->ti, g, x);
				opt(b, A_QTURN, aq)->col = COL(122, 255, 122);
			} else {
				char pr[48]; qProg(&P.q[aq], pr, sizeof pr);
				char b[400]; snprintf(b, sizeof b, "\n\n%s — in corso: %s\n%s", T->ti, pr, T->tx);
				strncat(PB, b, sizeof PB - strlen(PB) - 1);
			}
		} else {
			int av = qAvail(id);
			if (av >= 0) {
				const QuestDef *T = &QT[av]; int g, x; qRew(av, &g, &x);
				char b[420]; snprintf(b, sizeof b, "\n\nMissione: %s\n%s\nRicompensa: %d oro · %d XP", T->ti, T->tx, g, x);
				strncat(PB, b, sizeof PB - strlen(PB) - 1);
				char l[80]; snprintf(l, sizeof l, "Accetta «%s»", T->ti);
				opt(l, A_QACCEPT, av)->col = C_GOLD;
			} else if (d->nqs && P.nq >= MAXQ) strncat(PB, "\n\nHai già 5 missioni attive: completane qualcuna.", sizeof PB - strlen(PB) - 1);
		}
		switch (d->role) {
		case R_SHOP: opt("Commercia", A_OPEN, PM_SHOP); break;
		case R_SMITH: opt("Forgia e potenzia", A_OPEN, PM_SMITH); break;
		case R_ALCH: opt("Pozioni ed elisir", A_OPEN, PM_ALCH); break;
		case R_HEAL: opt("Cura completa (gratis)", A_HEAL, 0); break;
		case R_INN: { char b[40]; snprintf(b, sizeof b, "Riposa (10 oro)"); opt(b, A_REST, 0); break; }
		case R_BARD: opt("Chiedi una canzone", A_SONG, 0); break;
		case R_CASINO: opt("Gioca al casinò", A_OPEN, PM_CASINO); break;
		case R_SAGE: opt("Diario e frammenti", A_OPEN, PM_DIARY); break;
		case R_ARENA: opt("Negozio dell'Arena", A_OPEN, PM_ARENA); opt("Giocatori e classifica", A_WHO, 0); break;
		case R_BUYER: opt("Vendi i raccolti", A_OPEN, PM_SELLRES); break;
		case R_FISHER: case R_NAVAL: case R_DIM: case R_MOTEL: case R_MASTER: break;
		}
	}
	if (id >= 0 && xNpcStory(NPCS[id].id)) {}   // 7.48: Capitana Marina, Cancelliere Oreste, Regina Nerea
	opt("Arrivederci", A_CLOSE, 0);
}
/* ---------------- multigiocatore ---------------- */
extern bool wantKeyboard; extern int kbMode;
extern char WHO[24][96]; extern int NWHO;
extern int arPts[4];
extern const char *arName(int k, int *cost);
static void buildNet(void) {
	snprintf(PT, sizeof PT, "Multigiocatore");
	snprintf(PB, sizeof PB, "Stato: %s%s\nChi usa lo stesso codice stanza gioca nello stesso mondo, anche dal browser. Nel Colosseo si combatte fra eroi.",
		netStatus, netOk && netPing >= 0 ? "" : "");
	Opt *o;
	o = opt(NETC.on ? "Disconnetti" : "Collegati al server", A_NETTOG, 0); o->col = NETC.on ? COL(255, 140, 120) : C_GOLD;
	o = opt("Codice stanza", A_NETCODE, 0); snprintf(o->r, sizeof o->r, "%s", NETC.code[0] ? NETC.code : "—");
	o = opt("Server", A_NETURL, 0); { const char *u = strstr(NETC.url, "://"); snprintf(o->r, sizeof o->r, "%.30s", u ? u + 3 : NETC.url); }
	if (netOk) { opt("Scrivi in chat", A_CHAT, 0); o = opt("Funzioni del server", A_OPENPLUG, 0); snprintf(o->r, sizeof o->r, "plugin"); o->col = C_GOLD; o = opt("Giocatori nella stanza", A_WHO, 0); if (netPing >= 0) snprintf(o->r, sizeof o->r, "ping %d ms", (int)netPing); }
	opt("Indietro", A_BACK, 0);
}
static void buildPlayers(void) {
	snprintf(PT, sizeof PT, "Giocatori · stanza %s", NETC.code);
	snprintf(PB, sizeof PB, "Arena: %d vittorie · %d sconfitte · %d punti (%d da spendere)", arPts[0], arPts[1], arPts[2], arPts[3]);
	if (!NWHO) opt(netOk ? "Caricamento…" : "Non sei collegato", A_NOP, 0)->col = C_MU;
	for (int i = 0; i < NWHO; i++) opt(WHO[i], A_NOP, 0);
	opt("Aggiorna", A_WHO, 0);
	opt("Indietro", A_BACK, 0);
}
static void buildArena(void) {
	snprintf(PT, sizeof PT, "Negozio dell'Arena · %d punti", arPts[3]);
	snprintf(PB, sizeof PB, netOk ? "Vinci i duelli nella fossa per guadagnare punti arena. Equipaggiamento vincolato." : "I punti arena li tiene il server: collegati dal menu Multigiocatore.");
	for (int k = 0; k < 8; k++) { int c; const char *n = arName(k, &c); Opt *o = opt(n, A_ARBUY, k); o->col = rarCol(4); snprintf(o->r, sizeof o->r, "%d punti", c); o->dis = !netOk || arPts[3] < c; }
	opt("Indietro", A_BACK, 0);
}
static void buildSellRes(void) {
	snprintf(PT, sizeof PT, "Compro raccolti · %d oro", P.g);
	snprintf(PB, sizeof PB, "Grano, legna, mele, uova, rose e cimeli si raccolgono nei quartieri e nelle zone aperte.");
	int any = 0;
	for (int i = 0; i < 16; i++) if (P.res[i].k[0] && P.res[i].n) { any = 1; char b[48]; snprintf(b, sizeof b, "%s ×%d", P.res[i].k, P.res[i].n); Opt *o = opt(b, A_SELLRES, i); snprintf(o->r, sizeof o->r, "%d oro", P.res[i].n * 8); }
	if (!any) opt("Non hai raccolti da vendere.", A_NOP, 0)->col = C_MU;
	opt("Indietro", A_BACK, 0);
}
static void buildShop(void) {
	snprintf(PT, sizeof PT, "Mercante Ugo · %d oro", P.g);
	int ev = dayEvent();
	// 8.3.1: i prezzi rispetto a un eroe di livello 1
	{ extern float priceMulAll(void); int m = (int)roundf((priceMulAll() / 1.012f - 1) * 100); if (m > 0) snprintf(PS, sizeof PS, "Al livello %d i prezzi sono più alti del %d%% rispetto a un eroe all'inizio", P.lv, m); }
	snprintf(PB, sizeof PB, "Giorno %d. %s", gDay(), ev == 1 ? "Saldi di stagione: tutto costa il 20% in meno!" : ev == 2 ? "Mercato in rialzo: tutto costa il 20% in più." : "I prezzi cambiano ogni giorno, a mezzanotte.");
	char b[72];
	Opt *o;
	o = opt("Pozione", A_BUY, 0); snprintf(o->r, sizeof o->r, "%d oro%s", px("pot", 25), isOffer("pot") ? " OFFERTA" : "");
	o = opt("Scorta di 5 pozioni", A_BUY, 1); snprintf(o->r, sizeof o->r, "%d oro%s", px("pot5", 110), isOffer("pot5") ? " OFFERTA" : "");
	o = opt("Equipaggiamento a sorpresa", A_BUY, 2); snprintf(o->r, sizeof o->r, "%d oro%s", px("rnd", 60 + P.lv * 20), isOffer("rnd") ? " OFFERTA" : "");
	{ char r[32]; snprintf(r, sizeof r, "60 oro · ne hai %d", X.seal); uiXOpt("Sigillo di doma (per domare un mostro)", r, XARG(80, 1), C_GOLD, P.g < 60); uiXOpt("5 Sigilli di doma", "270 oro", XARG(80, 5), C_GOLD, P.g < 270); }
	opt("Vendi tutti gli oggetti comuni", A_SELLALL, 0);
	opt("Vendi tutto lo zaino", A_SELLALL, 1);
	for (int i = 0; i < P.ninv; i++) {
		char nm[40]; iname(&P.inv[i], nm, sizeof nm);
		snprintf(b, sizeof b, "Vendi: %s", nm);
		o = opt(b, A_SELL, i); o->col = rarCol(P.inv[i].r); snprintf(o->r, sizeof o->r, "%u oro", (unsigned)P.inv[i].p);
	}
	opt("Indietro", A_BACK, 0);
}
static void buildSmith(void) {
	snprintf(PT, sizeof PT, "Fucina di Borin · %d oro", P.g);
	snprintf(PB, sizeof PB, "Forgia su misura un pezzo raro o epico, oppure potenzia l'equipaggiamento che indossi (fino a +5).");
	char b[72]; Opt *o;
	for (int s = 0; s < 4; s++) {
		snprintf(b, sizeof b, "Forgia: %s rara", SN[s]); o = opt(b, A_FORGE, s * 2 + 1); o->col = rarCol(1); snprintf(o->r, sizeof o->r, "%d oro", px("fr1", 100 + P.lv * 32));
		snprintf(b, sizeof b, "Forgia: %s epica", SN[s]); o = opt(b, A_FORGE, s * 2 + 2); o->col = rarCol(2); snprintf(o->r, sizeof o->r, "%d oro", px("fr2", 300 + P.lv * 85));
	}
	for (int s = 0; s < 4; s++) {
		Item *it = &P.eq[s]; if (!it->used) continue;
		char nm[40]; iname(it, nm, sizeof nm);
		snprintf(b, sizeof b, "Potenzia: %s", nm); o = opt(b, A_UPG, s); o->col = rarCol(it->r);
		if (it->up >= 5) { snprintf(o->r, sizeof o->r, "massimo"); o->dis = true; } else snprintf(o->r, sizeof o->r, "+%d · %d oro", it->up + 1, px("upg", upc(it)));
	}
	xSmithOpts();   // 7.55: infusione elementale con le Essenze
	opt("Indietro", A_BACK, 0);
}
static void buildAlch(void) {
	snprintf(PT, sizeof PT, "Bottega di Mira · %d oro", P.g);
	snprintf(PB, sizeof PB, "Pozioni nello zaino: %d. Una pozione cura il 35%% della vita (una ogni 2,5 secondi).", P.pot);
	Opt *o;
	o = opt("Pozione", A_BUY, 0); snprintf(o->r, sizeof o->r, "%d oro", px("pot", 25));
	o = opt("Scorta di 5 pozioni", A_BUY, 1); snprintf(o->r, sizeof o->r, "%d oro", px("pot5", 110));
	o = opt("Elisir di forza (+25% ATT, 90s)", A_BUY, 3); snprintf(o->r, sizeof o->r, "%d oro", px("ela", 120));
	o = opt("Elisir di pietra (+25% DIF, 90s)", A_BUY, 4); snprintf(o->r, sizeof o->r, "%d oro", px("eld", 120));
	opt("Indietro", A_BACK, 0);
}
static void buildInv(void) {
	snprintf(PT, sizeof PT, "Zaino (%d/%d) · %d oro · %d pozioni", P.ninv, INV, P.g, P.pot);
	snprintf(PB, sizeof PB, "ATT %d · DIF %d · CRIT %d%% · Vita %d/%d · Livello %d\n" G_A " equipaggia · " G_Y " getta a terra · " G_B " chiudi", atkV(), defV(), critV(), (int)P.hp, P.mx, P.lv);
	char b[72], d[48]; Opt *o;
	for (int s = 0; s < 4; s++) {
		Item *it = &P.eq[s];
		if (it->used) { char nm[40]; iname(it, nm, sizeof nm); snprintf(b, sizeof b, "[%s] %s", SN[s], nm); itemDesc(it, d, sizeof d); }
		else { snprintf(b, sizeof b, "[%s] —", SN[s]); d[0] = 0; }
		o = opt(b, A_NOP, s); o->col = it->used ? rarCol(it->r) : C_MU; snprintf(o->r, sizeof o->r, "%s", d);
	}
	if (!P.ninv) opt("Lo zaino è vuoto.", A_NOP, 0)->col = C_MU;
	for (int i = 0; i < P.ninv; i++) {
		Item *it = &P.inv[i]; char nm[40]; iname(it, nm, sizeof nm);
		itemDesc(it, d, sizeof d);
		Item *cur = &P.eq[it->s];
		int diff = iv(it) - (cur->used ? iv(cur) : 0);
		snprintf(b, sizeof b, "%s%s", nm, diff > 0 ? "  \xE2\x96\xB2" : "");
		o = opt(b, A_EQUIP, i); o->col = rarCol(it->r); snprintf(o->r, sizeof o->r, "%s", d);
	}
	opt("Chiudi", A_CLOSE, 0);
}
static void buildQuest(void) {
	snprintf(PT, sizeof PT, "Missioni");
	char so[200]; storyObj(so, sizeof so);
	snprintf(PB, sizeof PB, "Storia: %s", so);
	if (!P.nq) opt("Nessuna missione secondaria: cerca chi ha il ! sopra la testa", A_NOP, 0)->col = C_MU;
	for (int i = 0; i < P.nq; i++) {
		const QuestDef *T = &QT[P.q[i].id]; char pr[48], b[96];
		if (qReady(&P.q[i])) snprintf(pr, sizeof pr, "pronta: torna da %s", NPCS[P.q[i].npc].n); else qProg(&P.q[i], pr, sizeof pr);
		snprintf(b, sizeof b, "%s (%s)", T->ti, pr);
		Opt *o = opt(b, A_QABANDON, i); o->col = qReady(&P.q[i]) ? COL(122, 255, 122) : C_TXT; snprintf(o->r, sizeof o->r, G_A " abbandona");
	}
	if (P.st == 1) for (int i = 0; i < NSHARD; i++) {
		Opt *o = opt(DG[i].n, A_NOP, 0); bool got = P.sh & (1u << i);
		o->col = got ? C_GOLD : C_MU; snprintf(o->r, sizeof o->r, "%s", got ? "frammento preso" : "frammento da trovare");
	}
	opt("Chiudi", A_CLOSE, 0);
}
static void buildDiary(void) {
	int n = 0; for (int i = 0; i < 6; i++) if (P.sh & (1u << i)) n++;
	int ln = 0; for (int i = 0; i < NLORE; i++) if (P.lore & (1u << i)) ln++;
	int qd = 0; for (int i = 0; i < NQT; i++) qd += P.qd[i];
	snprintf(PT, sizeof PT, "Diario · frammenti %d/6 · pagine %d/%d", n, ln, NLORE);
	snprintf(PB, sizeof PB, "Nemici sconfitti: %d · Missioni completate: %d · Giorno %d", P.kills, qd, gDay());
	char b[80]; Opt *o;
	for (int i = 0; i < NDG; i++) {
		snprintf(b, sizeof b, "%s%s", i < 6 ? ((P.sh & (1u << i)) ? "[x] " : "[ ] ") : "", DG[i].n);
		o = opt(b, A_NOP, i); o->col = (i < 6 && (P.sh & (1u << i))) ? C_GOLD : C_TXT;
		snprintf(o->r, sizeof o->r, "Lv %d · ciclo %d · vinto %d", DG[i].lv + P.runs[i] * 3, P.runs[i] + 1, P.done[i]);
	}
	for (int i = 0; i < NLORE; i++) {
		if (P.lore & (1u << i)) { o = opt(LORE[i].ti, A_LORE, i); snprintf(o->r, sizeof o->r, "Leggi"); }
		else { char d[24]; snprintf(d, sizeof d, "%s", LOREID[i]); for (char *c = d; *c; c++) if (*c >= '0' && *c <= '9') { *c = 0; break; } int g = dgIdx(d); snprintf(b, sizeof b, "??? — in %s", g >= 0 ? DG[g].n : "un luogo lontano"); o = opt(b, A_NOP, 0); o->col = C_MU; }
	}
	opt("Chiudi", A_CLOSE, 0);
}
static void buildPause(void) {
	snprintf(PT, sizeof PT, "Pausa · Voxelia %s", GAME_VER);
	char so[200]; storyObj(so, sizeof so);
	snprintf(PB, sizeof PB, "%s · %s · Livello %d\n%s", P.name, DFS[P.df].n, P.lv, so);
	Opt *o;
	opt("Riprendi", A_RESUME, 0);
	opt("Salva la partita", A_SAVE, 0);
	xPauseOpts();
	o = opt("Musica", A_SETTING, 0); snprintf(o->r, sizeof o->r, "%s", SET.muOn ? "sì" : "no");
	o = opt("Volume musica", A_SETTING, 1); snprintf(o->r, sizeof o->r, "< %d%% >", (int)roundf(SET.mu * 100));
	o = opt("Volume effetti", A_SETTING, 2); snprintf(o->r, sizeof o->r, "< %d%% >", (int)roundf(SET.sf * 100));
	o = opt("Zoom della telecamera", A_SETTING, 3); snprintf(o->r, sizeof o->r, "< %d%% >", (int)roundf(SET.zoom * 100));
	o = opt("Nomi sopra i personaggi", A_SETTING, 4); snprintf(o->r, sizeof o->r, "%s", SET.names ? "sì" : "no");
	o = opt("Numeri dei danni", A_SETTING, 5); snprintf(o->r, sizeof o->r, "%s", SET.dmg ? "sì" : "no");
	o = opt("Ombre", A_SETTING, 6); snprintf(o->r, sizeof o->r, "%s", SET.shad ? "sì" : "no");
	o = opt("Inseguimento automatico del bersaglio", A_SETTING, 7); snprintf(o->r, sizeof o->r, "%s", SET.autoAtk ? "sì" : "no");
	o = opt("Clic sul terreno: l'eroe ci va", A_SETTING, 8); snprintf(o->r, sizeof o->r, "%s", SET.tapMove ? "sì" : "no");
	{ static const char *U[3] = {"piccola", "media", "grande"}; o = opt("Grandezza dell'interfaccia", A_SETTING, 9); snprintf(o->r, sizeof o->r, "< %s >", U[clampi(SET.uiSize, 0, 2)]); }
	o = opt("Fotogrammi al secondo", A_SETTING, 10); snprintf(o->r, sizeof o->r, "%s", SET.fps ? "sì" : "no");
	{ Opt *o = opt("Multigiocatore", A_OPEN, PM_NET); snprintf(o->r, sizeof o->r, "%s", netOk ? "collegato" : NETC.on ? "…" : "spento"); }
	if (netOk) { Opt *o = opt("Funzioni del server", A_OPENPLUG, 0); snprintf(o->r, sizeof o->r, "emote, gruppo, /hub"); o->col = C_GOLD; }
	opt("Registro della chat", A_OPENPLUG, 3);
	opt("Comandi", A_HELP, 0);
	{ Opt *o = opt("Pannello sviluppatore", A_OPENDEV, 0); snprintf(o->r, sizeof o->r, "8.5"); o->col = C2D_Color32(255, 160, 80, 255); }
	opt("Salva e torna al titolo", A_TITLE, 0);
}
static void buildTitle(void) {
	snprintf(PT, sizeof PT, "VOXELIA %s", GAME_VER);
	bool sv = hasSave();
	if (sv) opt("Continua la partita", A_CONT, 0)->col = C_GOLD;
	opt("Nuova partita", A_NEW, 0);
	opt("Prologo", A_PROLOG, 0);
	{ Opt *o = opt("Multigiocatore", A_OPEN, PM_NET); snprintf(o->r, sizeof o->r, "%s", netOk ? "collegato" : NETC.on ? "…" : "spento"); }
	opt("Comandi", A_HELP, 0);
	Opt *o = opt("Nome dell'eroe", A_NAME, 0); snprintf(o->r, sizeof o->r, "%s", P.name[0] ? P.name : "Eroe");
}
static void buildDiff(void) {
	snprintf(PT, sizeof PT, "Nuova partita · %s", P.name[0] ? P.name : "Eroe");
	snprintf(PB, sizeof PB, "Scegli la difficoltà.");
	const char *D[4] = {"Facile — nemici deboli, più bottino", "Normale — l'esperienza bilanciata", "Difficile — nemici resistenti, meno bottino", "Incubo — morte permanente"};
	for (int i = 0; i < 4; i++) { Opt *o = opt(D[i], A_DIFF, i); if (i == 3) o->col = COL(255, 106, 106); }
	opt("Indietro", A_BACK, 0);
}
static void buildHelp(void) {
	snprintf(PT, sizeof PT, "Comandi");
	snprintf(PB, sizeof PB,
		G_PAD " / " G_DPAD "  muovi l'eroe\n"
		G_A "  colpo: la mossa seguente della catena dell'arma · tienilo premuto per il colpo caricato\n"
		G_L "  interagisci: parla, apri, raccogli, entra\n"
		G_B "  capriola (premi e lascia) · corsa (tieni premuto mentre ti muovi)\n"
		G_R "  affondo · tenuto premuto: blocca il bersaglio (di nuovo: il seguente)\n"
		G_Y "  colpo ad area · " G_X "  pozione\n"
		"Levetta destra, " G_L2 " " G_R2 " zoom · " G_ST " pausa · " G_SE " mappa (premi il touchpad)\n"
		"Touchpad: scorri per il puntatore; tocco leggero o " G_R3 " = clic (terreno, nemici, persone, pulsanti).");
	opt("Indietro", A_BACK, 0);
}
static void buildCasino(void) {
	snprintf(PT, sizeof PT, "Casinò Fortuna d'Oro · %d oro", P.g);
	snprintf(PB, sizeof PB, "Gioca con moderazione: la casa vince più spesso di quanto perde.%s%s", CR[0] ? "\n\n" : "", CR);
	Opt *o = opt("Puntata", A_BET, 0); snprintf(o->r, sizeof o->r, "< %d oro >", CB);
	opt("Slot machine (tris fino a x100)", A_CPLAY, 0);
	opt("Dadi: sotto 7 (x2,2)", A_CPLAY, 1);
	opt("Dadi: esatto 7 (x5)", A_CPLAY, 2);
	opt("Dadi: sopra 7 (x2,2)", A_CPLAY, 3);
	opt("Roulette: rosso (x2)", A_CPLAY, 4);
	opt("Roulette: nero (x2)", A_CPLAY, 5);
	opt("Roulette: zero (x36)", A_CPLAY, 6);
	opt("Esci dal tavolo", A_BACK, 0);
}
static void buildPanel(void) {
	NOPT = 0; PT[0] = PB[0] = PS[0] = 0;
	switch (PM) {
	case PM_NPC: buildNpc(); break;
	case PM_TXT:
		snprintf(PT, sizeof PT, "%s", txtTi ? txtTi : "");
		snprintf(PB, sizeof PB, "%s", txtTx ? txtTx : "");
		snprintf(PS, sizeof PS, "%s", txtSub ? txtSub : "");
		opt(txtBack == PM_DIARY ? "Indietro" : "Continua", A_CLOSE, 0);
		break;
	case PM_SHOP: buildShop(); break;
	case PM_SMITH: buildSmith(); break;
	case PM_ALCH: buildAlch(); break;
	case PM_INV: buildInv(); break;
	case PM_QUEST: buildQuest(); break;
	case PM_DIARY: buildDiary(); break;
	case PM_PAUSE: buildPause(); break;
	case PM_TITLE: buildTitle(); break;
	case PM_DIFF: buildDiff(); break;
	case PM_HELP: buildHelp(); break;
	case PM_CASINO: buildCasino(); break;
	case PM_DEAD:
		snprintf(PT, sizeof PT, "Sei morto");
		snprintf(PB, sizeof PB, "In modalità Incubo la morte è permanente: il salvataggio è stato cancellato.");
		opt("Torna al titolo", A_TITLE, 1);
		break;
	case PM_EXITASK:
		snprintf(PT, sizeof PT, "Uscire dal dungeon?");
		snprintf(PB, sizeof PB, "A terra c'è ancora del bottino (un frammento, oggetti o un forziere ricco). Se esci adesso lo lasci qui.");
		opt("Resta e raccogli", A_EXITSTAY, 0)->col = C_GOLD;
		opt("Esci comunque", A_EXITGO, 0);
		break;
	case PM_CONFIRM:
		snprintf(PT, sizeof PT, confirmStep == 0 ? "Sovrascrivere la partita?" : "Sei proprio sicuro?");
		snprintf(PB, sizeof PB, confirmStep == 0 ? "C'è già una partita salvata. Iniziandone una nuova verrà cancellata." : "Seconda conferma: la vecchia partita andrà persa per sempre.");
		opt("No, torna indietro", A_BACK, 0);
		opt(confirmStep == 0 ? "Sì, continua" : "Sì, cancella e inizia", A_CONFIRM, 0)->col = COL(255, 106, 106);
		break;
	case PM_NET: buildNet(); break;
	case PM_PLAYERS: buildPlayers(); break;
	case PM_ARENA: buildArena(); break;
	case PM_SELLRES: buildSellRes(); break;
	case PM_PLUG: plBuildPanel(); break;
	case PM_X: xBuild(); break;
	case PM_DEV: devBuild(); break;
	case PM_MAP:
		snprintf(PT, sizeof PT, "%s", ZNAME);
		opt("Chiudi", A_CLOSE, 0);
		break;
	}
	if (SEL >= NOPT) SEL = NOPT - 1;
	if (SEL < 0) SEL = 0;
}

/* ---------------- pannello dei plugin del server (plugins.c) ---------------- */
void uiPlugTitle(const char *ti, const char *body) { snprintf(PT, sizeof PT, "%s", ti ? ti : ""); snprintf(PB, sizeof PB, "%s", body ? body : ""); }
void uiPlugOpt(const char *l, const char *r, int arg, u32 col, bool dis) { Opt *o = opt(l, arg ? A_PLUG : A_NOP, arg); snprintf(o->r, sizeof o->r, "%s", r ? r : ""); o->col = col; o->dis = dis; }
void uiOpenPlug(void) { uiOpenPanel(PM_PLUG); }

/* ---------------- finestre della storia (story.c) ---------------- */
void uiXTitle(const char *ti, const char *body) { snprintf(PT, sizeof PT, "%s", ti ? ti : ""); snprintf(PB, sizeof PB, "%s", body ? body : ""); }
void uiDevOpt(const char *l, const char *r, int arg, u32 col, bool dis) { Opt *o = opt(l, A_DEV, arg); snprintf(o->r, sizeof o->r, "%s", r ? r : ""); o->col = col ? col : C_TXT; o->dis = dis; }
void uiXOpt(const char *l, const char *r, int arg, u32 col, bool dis) { Opt *o = opt(l, arg ? A_X : A_NOP, arg); snprintf(o->r, sizeof o->r, "%s", r ? r : ""); o->col = col ? col : C_TXT; o->dis = dis; }
void uiLabel(float x, float y, float sc, u32 c, const char *s);
extern char kbInit[64];
void uiKeyboardFor(int mode, const char *init) { snprintf(kbInit, sizeof kbInit, "%s", init ? init : ""); kbMode = mode; wantKeyboard = true; }

/* ---------------- azioni ---------------- */
extern void titleStart(void);
static void doCasino(int g) {
	if (!pay(CB)) return;
	int b = CB, win = 0;
	if (g == 0) {
		static const char *SY[6] = {"Ciliegia", "Limone", "Campana", "Stella", "Sette", "Diamante"};
		static const int W[6] = {30, 25, 20, 13, 8, 4}, MU[6] = {5, 8, 12, 20, 50, 100};
		int r[3];
		for (int i = 0; i < 3; i++) { float x = frnd() * 100; r[i] = 0; for (int k = 0; k < 6; k++) { if ((x -= W[k]) < 0) { r[i] = k; break; } } }
		if (r[0] == r[1] && r[1] == r[2]) { win = b * MU[r[0]]; snprintf(CR, sizeof CR, "%s %s %s — TRIS! +%d oro", SY[r[0]], SY[r[1]], SY[r[2]], win); }
		else if (r[0] == r[1] || r[1] == r[2] || r[0] == r[2]) { win = b; snprintf(CR, sizeof CR, "%s %s %s — coppia: puntata restituita", SY[r[0]], SY[r[1]], SY[r[2]]); }
		else snprintf(CR, sizeof CR, "%s %s %s — nessuna vincita", SY[r[0]], SY[r[1]], SY[r[2]]);
	} else if (g <= 3) {
		int a = fri(1, 6), c = fri(1, 6), sm = a + c;
		bool w = g == 1 ? sm < 7 : g == 3 ? sm > 7 : sm == 7;
		if (w) win = (int)roundf(b * (g == 2 ? 5 : 2.2f));
		snprintf(CR, sizeof CR, "Dadi: %d + %d = %d — %s", a, c, sm, w ? "hai vinto!" : "perso");
	} else {
		static const int REDS[18] = {1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36};
		int n = fri(0, 36); bool red = false; for (int i = 0; i < 18; i++) if (REDS[i] == n) red = true;
		const char *col = n == 0 ? "verde" : red ? "rosso" : "nero";
		bool w = g == 6 ? n == 0 : g == 4 ? (n && red) : (n && !red);
		if (w) win = b * (g == 6 ? 36 : 2);
		snprintf(CR, sizeof CR, "Roulette: esce %d (%s) — %s", n, col, w ? "hai vinto!" : "perso");
	}
	P.g += win;
	if (win > b) JINGLE(.1f, W_TRIANGLE, 72, 76, 79, 84); else if (win) tone(700, .1f, W_TRIANGLE, .05f); else tone(150, .2f, W_SQUARE, .05f);
}
void uiApplyScale(void) {
	static const float K[3] = {2.8f, 3.2f, 3.6f};   // sul televisore: come la Vita a 1,6 / 1,8 / 2,0 sul doppio dei pixel
	UIS = K[clampi(SET.uiSize, 0, 2)]; VW = SCR_W / UIS; VH = SCR_H / UIS;
}
static void setAdj(int k, int dir) {
	switch (k) {
	case 0: SET.muOn = !SET.muOn; break;
	case 1: SET.mu = clampf(SET.mu + dir * .1f, 0, 1); break;
	case 2: SET.sf = clampf(SET.sf + dir * .1f, 0, 1); break;
	case 3: SET.zoom = clampf(SET.zoom + dir * .05f, .4f, 1.1f); break;
	case 4: SET.names = !SET.names; break;
	case 5: SET.dmg = !SET.dmg; break;
	case 6: SET.shad = !SET.shad; break;
	case 7: SET.autoAtk = !SET.autoAtk; break;
	case 8: SET.tapMove = !SET.tapMove; break;
	case 9: SET.uiSize = (u8)((SET.uiSize + (dir < 0 ? 2 : 1)) % 3); uiApplyScale(); break;
	case 10: SET.fps = !SET.fps; break;
	}
	VOL_MUS = SET.mu; VOL_SFX = SET.sf; MUS_ON = SET.muOn;
	setSave();
}
static void doAct(Opt *o, int dir) {
	if (o->dis) { tone(150, .1f, W_SQUARE, .04f); return; }
	int a = o->arg;
	switch (o->act) {
	case A_CLOSE:
		if (PM == PM_TXT && txtBack == PM_DIARY) { PM = PM_DIARY; buildPanel(); return; }
		uiClose(); return;
	case A_BACK:
		if (PM == PM_PLAYERS) { PM = PNPC ? PM_NPC : PM_NET; buildPanel(); return; }
		if (PM == PM_DEV) { PM = PM_PAUSE; SEL = 0; SCR = 0; buildPanel(); return; }
		if (PM == PM_PLUG) { if (plPanelBack()) { SEL = 0; SCR = 0; buildPanel(); return; } if (PMback == PM_NET || PMback == PM_PAUSE) { PM = PMback; SEL = 0; buildPanel(); return; } uiClose(); return; }
		if (PM == PM_NET) { PM = started ? PM_PAUSE : PM_TITLE; SEL = 0; buildPanel(); return; }
		if (PM == PM_X) { uiClose(); return; }
		if (PM == PM_SHOP || PM == PM_SMITH || PM == PM_ALCH || PM == PM_CASINO || PM == PM_ARENA || PM == PM_SELLRES) { if (PNPC) { PM = PM_NPC; buildPanel(); } else uiClose(); return; }
		if (PM == PM_DIFF || PM == PM_CONFIRM || (PM == PM_HELP && !started)) { PM = PM_TITLE; SEL = 0; buildPanel(); return; }
		if (PM == PM_HELP) { PM = PM_PAUSE; buildPanel(); return; }
		uiClose(); return;
	case A_STORY: storyStep(a); return;
	case A_QACCEPT: if (PNPC) qAccept(PNPC->nid, a); break;
	case A_QTURN: qTurn(a); break;
	case A_OPEN: PM = a; SEL = 0; SCR = 0; CR[0] = 0; break;
	case A_HEAL: domRestAll(); P.hp = P.mx; msg("La Luce ti ristora completamente."); JINGLE(.1f, W_TRIANGLE, 72, 79, 84); break;
	case A_REST: if (pay(10)) { domRestAll(); P.hp = P.mx; msg("Dormi profondamente. Sei completamente ristorato."); } break;
	case A_SONG: JINGLE(.18f, W_TRIANGLE, 67, 69, 71, 72, 74, 72, 71, 69, 67, 0, 64, 67, 72); msg("Lino intona la Ballata dell'Eroe di Aldoria..."); break;
	case A_BUY:
		if (a == 0 && pay(px("pot", 25))) P.pot++;
		else if (a == 1 && pay(px("pot5", 110))) P.pot += 5;
		else if (a == 2) { if (P.ninv >= INV) msg("Zaino pieno: libera un posto prima di comprare"); else if (pay(px("rnd", 60 + P.lv * 20))) gain(mkItem(P.lv + 2, 0, -1)); }
		else if (a == 3 && pay(px("ela", 120))) { P.bA = 90; msg("Ti senti più forte! (+25%% attacco)"); }
		else if (a == 4 && pay(px("eld", 120))) { P.bD = 90; msg("La tua pelle è dura come la pietra! (+25%% difesa)"); }
		break;
	case A_SELL: sellItem(a); break;
	case A_SELLALL: { int n = sellAll(a); msg("Venduti %d oggetti", n); break; }
	case A_FORGE: {
		int s = (a - 1) / 2, r = (a - 1) % 2 + 1;
		if (P.ninv >= INV) { msg("Zaino pieno: libera un posto prima di comprare"); break; }
		if (pay(r == 1 ? px("fr1", 100 + P.lv * 32) : px("fr2", 300 + P.lv * 85))) { gain(mkItem(P.lv + 1, r, s)); sparks(P.px, P.py, 12, 0xff8a2a, 60); JINGLE(.08f, W_SQUARE, 60, 67, 72); }
		break;
	}
	case A_UPG: {
		Item *it = &P.eq[a];
		if (it->used && it->up < 5 && pay(px("upg", upc(it)))) { it->up++; it->p = (u32)roundf(it->p * 1.15f); char nm[40]; iname(it, nm, sizeof nm); msg("%s potenziato!", nm); JINGLE(.08f, W_SQUARE, 60, 67, 72); recalc(); }
		break;
	}
	case A_EQUIP: eqp(a); break;
	case A_DROPIT: break;
	case A_QABANDON: if (a < P.nq) { memmove(&P.q[a], &P.q[a + 1], sizeof(Quest) * (P.nq - a - 1)); P.nq--; npcMarks(); } break;
	case A_LORE: uiOpenText(LORE[a].ti, LORE[a].tx, NULL); txtBack = PM_DIARY; buildPanel(); return;
	case A_RESUME: uiClose(); return;
	case A_SAVE: saveGame(); msg("Partita salvata"); tone(880, .08f, W_TRIANGLE, .05f); break;
	case A_SETTING: setAdj(a, dir ? dir : 1); break;
	case A_HELP: PM = PM_HELP; SEL = 0; SCR = 0; break;
	case A_TITLE: saveGame(); started = false; MODE_DEAD = 0; titleStart(); return;
	case A_CONT: if (loadGame()) uiClose(); else msg("Salvataggio non valido"); return;
	case A_NEW: if (hasSave()) { confirmStep = 0; PM = PM_CONFIRM; } else PM = PM_DIFF; SEL = 0; break;
	case A_CONFIRM: if (confirmStep == 0) { confirmStep = 1; SEL = 0; } else { deleteSave(); PM = PM_DIFF; SEL = 0; } break;
	case A_PROLOG: uiOpenText("Prologo", "Il Re Lich Malakar ha spezzato la Corona di Voxel in sei frammenti. Esplora Aldoria, accetta missioni, conquista sette dungeon che rinascono a ogni vittoria e riporta la pace nel regno.\n\nUn tempo Malakar era il mago di corte, fratello del Re Aldric. Nei libri proibiti della Biblioteca trovò un nome: il Vuoto. E il Vuoto gli rispose.\n\nOra i frammenti della Corona sono custoditi dai mostri più temibili del regno, e solo un eroe può riunirli.", NULL); txtBack = PM_NONE; return;
	case A_NAME: kbMode = 0; wantKeyboard = true; return;
	case A_DIFF: wantDiff = a; uiClose(); newGame(a, P.name); return;
	case A_EXITSTAY: uiClose(); return;
	case A_EXITGO: { Ent *p = TGT; uiClose(); if (p && p->k == K_PO) dungeonClearExit(p); return; }
	case A_BET: { static const int B[4] = {10, 50, 100, 500}; int i = 0; for (int k = 0; k < 4; k++) if (B[k] == CB) i = k; i = (i + (dir ? dir : 1) + 4) % 4; CB = B[i]; break; }
	case A_CPLAY: doCasino(a); break;
	case A_NETTOG: if (NETC.on) netStop(); else netStart(); setSave(); break;
	case A_NETURL: kbMode = 1; wantKeyboard = true; return;
	case A_NETCODE: kbMode = 2; wantKeyboard = true; return;
	case A_CHAT: kbMode = 3; wantKeyboard = true; return;
	case A_WHO: NWHO = 0; netSendRaw("{\"t\":\"who\"}"); PM = PM_PLAYERS; SEL = 0; break;
	case A_ARBUY: { char b[48]; snprintf(b, sizeof b, "{\"t\":\"buy\",\"k\":%d}", a); netSendRaw(b); break; }
	case A_SELLRES: if (a < 16) { P.g += P.res[a].n * 8; msg("Venduti %d %s", P.res[a].n, P.res[a].k); P.res[a].n = 0; tone(1200, .06f, W_TRIANGLE, .05f); } break;
	case A_PLUG: if (plPanelAct(a)) { uiClose(); return; } SEL = 0; SCR = 0; break;
	case A_X: { int pm0 = PM, r = xPanelAct(a); if (r == 1) { if (PM == pm0) uiClose(); return; } if (PM == PM_NONE) return; break; }
	case A_OPENPLUG: plPanelPage(a); PMback = PM; PM = PM_PLUG; SEL = 0; SCR = 0; break;
	case A_SAIL: uiClose(); goZone("thal48"); banner("Thalassa", "Il regno oltre il mare · parla con il Cancelliere Oreste"); return;
	case A_DEV: { int r = devAct(a, dir); if (r == 1) { uiClose(); return; } if (r == 2) { PM = PM_PAUSE; SEL = 0; SCR = 0; break; } if (r == 3) { SEL = 0; SCR = 0; } break; }
	case A_OPENDEV: devOpen(); return;
	case A_NOP: if (PM == PM_INV) tone(300, .03f, W_TRIANGLE, .03f); return;
	}
	if (PM != PM_NONE) buildPanel();
}

/* ---------------- disegno delle finestre ---------------- */
// Come sulla Vita c'è un solo schermo: le finestre (dialoghi, negozi, zaino, menu) stanno al centro sopra il mondo,
// che resta visibile e scurito dietro, come le finestre del gioco per browser. Le righe sono grandi da toccare.
#define ROWH 19
static float bodyH = 0;
static float selT = 0;   // da quando è scelta la riga (per far scorrere il testo lungo)
static float PX0 = 0, PY0 = 0, PW = 320, PH = 240, rowTop = 0;
static int visRows = 1;
static void panelRect(void) {
	if (PM == PM_TITLE || ((PM == PM_DIFF || PM == PM_CONFIRM || PM == PM_NET || (PM == PM_HELP)) && !started)) {
		PW = fminf(400, VW - 24); PH = VH - 112; PX0 = (VW - PW) / 2; PY0 = 104;
	} else {
		PW = fminf(470, VW - 20); PH = VH - 16; PX0 = (VW - PW) / 2; PY0 = 8;
	}
	// finestre con poco dentro (dialoghi, conferme): alte quanto serve, al centro
	if (PM != PM_MAP) {
		float bodyMax = (PM == PM_TXT || PM == PM_HELP) ? PH - 70 : (PH - 50) * .5f;
		float need = 28 + (PS[0] ? 13 : 0) + (PB[0] ? txtWrapMax(-2000, -2000, PW - 20, .45f, 0, PB, bodyMax) + 5 : 0) + NOPT * ROWH + 19;
		if (need < PH) { if (PM != PM_TITLE) PY0 += (PH - need) / 2; PH = need; }
	}
}
static void glyphHint(float x, float y, const char *s) { txt(x, y, .36f, C_MU, s); }
static void drawPanel(void) {
	{ static int lastSel = -1, lastPM = -1; if (SEL != lastSel || PM != lastPM) { lastSel = SEL; lastPM = PM; selT = gtime; } }
	panelRect();
	if (started) rect(0, 0, VW, VH, C2D_Color32(0, 0, 0, 110));
	float X = PX0, Y = PY0, W = PW;
	rectR(X - 1, Y - 1, W + 2, PH + 2, 7, C2D_Color32(245, 185, 66, 90));
	rectR(X, Y, W, PH, 6, C2D_Color32(24, 29, 44, 255));
	rectG(X + 2, Y + 2, W - 4, 22, C2D_Color32(44, 52, 78, 255), C2D_Color32(32, 38, 58, 255));
	rect(X + 2, Y + 24, W - 4, 1, C2D_Color32(245, 185, 66, 150));
	char ti[96]; marqueeStr(PT, .55f, W - 40, gtime - selT, ti, sizeof ti);
	txt(X + 8, Y + 4, .55f, C_GOLD, ti);
	// pulsante di chiusura (tocco), come ○
	if (PM != PM_TITLE && PM != PM_DEAD) { rectR(X + W - 22, Y + 4, 18, 18, 4, C2D_Color32(90, 40, 40, 230)); txtC(X + W - 13, Y + 5, .5f, C_TXT, "\xC3\x97"); }
	float y = Y + 28;
	if (PS[0]) { txt(X + 10, y, .4f, C_MU, PS); y += 13; }
	if (PM == PM_MAP) {
		float S = fminf(PH - 50, W - 140);
		drawMinimap(X + 16, y + 6, S, true);
		glyphHint(X + 10, Y + PH - 15, G_B " chiudi · " G_SE " mappa · tocca per chiudere");
		rowTop = Y + PH; visRows = 0;
		return;
	}
	float bodyMax = (PM == PM_TXT || PM == PM_HELP) ? PH - 70 : (PH - 50) * .5f;
	if (PB[0]) { bodyH = txtWrapMax(X + 10, y, W - 20, .45f, C_TXT, PB, bodyMax); y += bodyH + 5; }
	else bodyH = 0;
	float top = y, bottom = Y + PH - 17;
	rowTop = top;
	int vis = (int)((bottom - top) / ROWH);
	if (vis < 1) vis = 1;
	visRows = vis;
	if (SEL < SCR) SCR = SEL;
	if (SEL >= SCR + vis) SCR = SEL - vis + 1;
	if (SCR > NOPT - vis) SCR = NOPT - vis;
	if (SCR < 0) SCR = 0;
	float rw0 = W - 8;
	for (int i = SCR; i < NOPT && i < SCR + vis; i++) {
		Opt *o = &OPT[i];
		float ry = top + (i - SCR) * ROWH;
		if (i == SEL) { rectR(X + 4, ry, rw0, ROWH - 2, 3, C_SEL); rect(X + 4, ry, 3, ROWH - 2, C_GOLD); }
		else rectR(X + 4, ry, rw0, ROWH - 2, 3, C2D_Color32(40, 48, 74, 235));
		u32 c = o->dis ? C_MU : o->col;
		float rw = o->r[0] ? txtW(o->r, .42f) : 0;
		// accorcia l'etichetta se si sovrappone al testo a destra
		char lab[80]; float lw = rw0 - rw - 20;
		if (i == SEL) marqueeStr(o->l, .46f, lw, gtime - selT, lab, sizeof lab);
		else { snprintf(lab, sizeof lab, "%s", o->l);
			if (txtW(lab, .46f) > lw) { int n = strlen(lab); while (n > 1 && txtW(lab, .46f) > lw - 10) { n--; while (n > 0 && (lab[n] & 0xC0) == 0x80) n--; lab[n] = 0; } strcat(lab, "…"); } }
		txt(X + 11, ry + 2, .46f, c, lab);
		if (o->r[0]) txtR(X + W - 9, ry + 3, .42f, C_MU, o->r);
	}
	if (SCR > 0) txtR(X + W - 6, top - 12, .4f, C_GOLD, "\xE2\x96\xB2");
	if (SCR + vis < NOPT) txtR(X + W - 6, Y + PH - 16, .4f, C_GOLD, "\xE2\x96\xBC");
	// in fondo: cosa fanno i tasti
	const char *h = PM == PM_INV ? G_A " equipaggia · " G_Y " getta · " G_B " chiudi · " G_L G_R " scorri"
		: PM == PM_TITLE ? G_A " conferma · " G_DPAD " scegli · tocca una riga due volte"
		: PM == PM_PAUSE ? G_A " conferma · " G_DPAD " \xE2\x86\x90\xE2\x86\x92 regola · " G_B " / " G_ST " riprendi"
		: G_A " conferma · " G_B " indietro · " G_DPAD " scegli · " G_L G_R " scorri";
	glyphHint(X + 10, Y + PH - 15, h);
}

/* ---------------- HUD in gioco ---------------- */
// Come nel browser: in alto a sinistra l'eroe (vita, esperienza, stamina, oro), in alto a destra la minimappa
// con l'ora, sotto gli obiettivi; a sinistra i pulsanti dei menu, in basso a destra le abilità.
static void bar(float x, float y, float w, float h, float k, u32 c, const char *label) {
	rectR(x, y, w, h, h / 2, C2D_Color32(0, 0, 0, 170));
	if (k > 0) rectR(x, y, w * clampf(k, 0, 1), h, h / 2, c);
	if (label) txtC(x + w / 2, y + h / 2 - 7.5f * (.38f / .5f) - 1, .38f, C_TXT, label);
}
typedef struct { const char *l; int m; } Btn;
static const Btn BTN[6] = {{"Zaino", PM_INV}, {"Missioni", PM_QUEST}, {"Diario", PM_DIARY}, {"Mappa", PM_MAP}, {"Chat", -1}, {"Menu", PM_PAUSE}};
#define BTNX 6
#define BTNW 58
#define BTNH 17
static float btnY0(void) { return 78; }
// abilità in basso a destra: Schiva (○), Affondo (R), Area (□), Pozione (△)
#define SKW 60
#define SKH 26
static float skX(int i) { return VW - 4 - (4 - i) * (SKW + 3); }
static float skY(void) { return VH - SKH - 5; }
static void skillBox(float x, float y, const char *g, const char *n, int cost, float cd, float mx, bool off) {
	rectR(x, y, SKW, SKH, 5, C2D_Color32(24, 30, 48, 215));
	if (cd > 0) rectR(x, y, SKW * clampf(cd / mx, 0, 1), SKH, 5, C2D_Color32(120, 30, 30, 200));
	rectO(x, y, SKW, SKH, 1, C2D_Color32(245, 185, 66, off || cd > 0 ? 40 : 110));
	txt(x + 4, y + 2, .44f, off || cd > 0 ? C_MU : C_GOLD, g);
	txt(x + 19, y + 4, .36f, off || cd > 0 ? C_MU : C_TXT, n);
	char c[8] = "";
	if (cd > 0) snprintf(c, sizeof c, "%d", (int)ceilf(cd)); else if (cost > 0) snprintf(c, sizeof c, "%d", cost);
	if (c[0]) txtR(x + SKW - 4, y + 14, .3f, cd > 0 ? C_GOLD : C2D_Color32(120, 220, 150, 255), c);
}
static int storyBtns(const char **L, int *K) {
	int n = 0; L[n] = "Comp."; K[n++] = 0;
	if (domNear() && X.seal > 0) { L[n] = "Doma"; K[n++] = 1; }
	if (X.cavOwn) { L[n] = cavOn() ? "Scendi" : "Sella"; K[n++] = 2; }
	return n;
}
#define SBW 44
static float sbX(int i, int n) { return VW - 4 - (n - i) * (SBW + 3); }
static float sbY(void) { return skY() - 21; }
static bool cardFocus = false;
#define CARDW 210
static float cardX(void) { return VW - CARDW - 8; }
#define CARDY 150
static void drawHud(void) {
	char b[120];
	// eroe
	float x = 6, y = 6, w = 176;
	rectR(x - 2, y - 2, w + 4, 66, 6, C2D_Color32(10, 14, 24, 165));
	snprintf(b, sizeof b, "%s · Lv %d", P.name, P.lv);
	txt(x + 3, y, .46f, C_GOLD, b);
	if (P.bA > 0 || P.bD > 0) txtR(x + w - 2, y + 2, .32f, C2D_Color32(255, 196, 120, 255), P.bA > 0 && P.bD > 0 ? "Forza · Pietra" : P.bA > 0 ? "Forza" : "Pietra");
	snprintf(b, sizeof b, "Vita %d/%d", (int)fmaxf(0, P.hp), P.mx);
	bar(x, y + 15, w, 12, P.hp / P.mx, P.hp < P.mx * .3f ? C2D_Color32(230, 60, 40, 255) : C2D_Color32(205, 50, 50, 255), b);
	snprintf(b, sizeof b, "XP %d/%d", P.xp, needXP());
	bar(x, y + 29, w, 9, P.xp / (float)needXP(), C2D_Color32(68, 170, 221, 255), NULL);
	txtC(x + w / 2, y + 28, .28f, C_TXT, b);
	{ extern float STA; extern bool STEX; extern int stMax(void);
	  float k = STA / stMax();
	  bar(x, y + 40, w, 7, k, STEX ? C2D_Color32(192, 80, 64, 255) : k < .25f ? C2D_Color32(192, 160, 64, 255) : C2D_Color32(76, 192, 112, 255), NULL);
	  if (STEX) txtC(x + w / 2, y + 38, .26f, C_TXT, "Senza fiato"); }
	snprintf(b, sizeof b, "\xE2\x97\x8F %d oro · %d pozioni · ATT %d · DIF %d", P.g, P.pot, atkV(), defV());
	txt(x + 3, y + 49, .34f, C_TXT, b);
	// pulsanti dei menu
	for (int i = 0; i < 6; i++) {
		float by = btnY0() + i * (BTNH + 3);
		rectR(BTNX, by, BTNW, BTNH, 4, C2D_Color32(24, 30, 48, 205));
		rect(BTNX + 2, by, BTNW - 4, 1, C2D_Color32(245, 185, 66, 110));
		txtC(BTNX + BTNW / 2, by + 2, .4f, C_TXT, BTN[i].l);
	}
	// minimappa, ora e zona
	float S = 92, mx = VW - S - 8, my = 8;
	drawMinimap(mx, my, S, false);
	char clk[8]; gClock(clk);
	snprintf(b, sizeof b, "Giorno %d · %s%s", gDay(), clk, NK > .5f ? " · notte" : DK > .3f ? " · tramonto" : "");
	txtR(VW - 8, my + S + 4, .34f, C_MU, b);
	// obiettivi
	{
		float ow = 158, ox = VW - ow - 8, oy = my + S + 18;
		char so[200]; storyObj(so, sizeof so);
		float h = 4 + lineH(.4f) * (txtW(ZNAME, .4f) > ow - 8 ? 2 : 1) + txtWrapMax(-2000, -2000, ow - 8, .34f, 0, so, 40) + 4;
		int nq = 0; for (int i = 0; i < P.nq && nq < 5; i++) nq++;
		h += nq * 11;
		rectR(ox, oy, ow, h, 5, C2D_Color32(10, 14, 24, 150));
		float yy = oy + 3;
		yy += txtWrap(ox + 4, yy, ow - 8, .4f, C_GOLD, ZNAME);
		yy += txtWrapMax(ox + 4, yy, ow - 8, .34f, C_TXT, so, 40) + 2;
		for (int i = 0; i < P.nq && i < 5; i++) {
			const QuestDef *T = &QT[P.q[i].id]; char pr[48];
			if (qReady(&P.q[i])) snprintf(pr, sizeof pr, "pronta!"); else qProg(&P.q[i], pr, sizeof pr);
			snprintf(b, sizeof b, "%s: %s", T->ti, pr);
			while (strlen(b) > 4 && txtW(b, .32f) > ow - 8) { int n = strlen(b) - 1; while (n > 0 && (b[n] & 0xC0) == 0x80) n--; b[n] = 0; }
			txt(ox + 4, yy, .32f, qReady(&P.q[i]) ? C2D_Color32(122, 255, 122, 255) : C_MU, b); yy += 11;
		}
	}
	// avviso di un plugin (teletrasporto, invito in un gruppo): con Accetta e Rifiuta
	{ const char *ti, *tx, *si, *no;
	  if (plCard(&ti, &tx, &si, &no)) {
		float cx = cardX(), cy = CARDY;
		rectR(cx, cy, CARDW, 92, 6, C2D_Color32(20, 28, 26, 245)); rect(cx + 3, cy, CARDW - 6, 2, C2D_Color32(62, 224, 122, 255));
		if (cardFocus) rectO(cx - 2, cy - 2, CARDW + 4, 96, 2, C_GOLD);
		txt(cx + 6, cy + 4, .44f, C2D_Color32(125, 255, 176, 255), ti);
		txtWrapMax(cx + 6, cy + 20, CARDW - 12, .36f, C_TXT, tx, 34);
		rectR(cx + 6, cy + 60, 96, 26, 4, C2D_Color32(42, 106, 70, 255)); txtC(cx + 54, cy + 65, .42f, C_TXT, si);
		rectR(cx + CARDW - 102, cy + 60, 96, 26, 4, C2D_Color32(106, 46, 46, 255)); txtC(cx + CARDW - 54, cy + 65, .42f, C_TXT, no);
		if (cardFocus) { txt(cx + 8, cy + 48, .3f, C_GOLD, G_A " accetta · " G_B " rifiuta"); }
	  } else cardFocus = false; }
	// abilità e ricariche
	{ extern float STA; extern bool STEX;
	  int cd = P.moving ? 20 : 12;
	  skillBox(skX(0), skY(), G_B, "Schiva", cd, 0, 1, STEX || STA < 1);
	  skillBox(skX(1), skY(), G_R, "Affondo", 40, 0, 1, STEX || STA < 1 || P.at > 0);
	  skillBox(skX(2), skY(), G_Y, "Area", 45, 0, 1, STEX || STA < 1 || P.at > 0);
	  skillBox(skX(3), skY(), G_X, "Pozione", 0, P.pc, 2.5f, P.pot <= 0); }
	// pulsanti della storia: compagni, doma (quando c'è un mostro da domare), sella (con un cavallo)
	{ const char *L[3]; int K[3]; int n = storyBtns(L, K);
	  for (int i = 0; i < n; i++) { float bx = sbX(i, n); bool hi = K[i] == 1; rectR(bx, sbY(), SBW, 17, 4, hi ? C2D_Color32(110, 86, 30, 235) : C2D_Color32(24, 30, 48, 205)); txtC(bx + SBW / 2, sbY() + 2, .38f, hi ? C_GOLD : C_TXT, L[i]); } }
	// cosa fa ✕ adesso (o L)
	float py = VH - 18;
	if (IT) {
		const char *v = IT->k == K_X ? xVerb(IT) : IT->k == K_LEV ? "Tira la" : IT->k == K_NPC ? "Parla con" : IT->k == K_PO ? "Vai a" : IT->k == K_CH ? "Apri il forziere" : IT->k == K_DR ? "Raccogli" : "Raccogli";
		snprintf(b, sizeof b, G_L " %s %s", v, IT->k == K_CH ? "" : IT->k == K_DR ? IT->it.n : IT->name);
		float w2 = txtW(b, .44f) + 12; rectR(4, py - 2, w2, 17, 4, C2D_Color32(0, 0, 0, 140));
		txt(10, py - 1, .44f, C_GOLD, b);
	} else {
		int ne = nearestEnemy(4.2f);
		float ch = cbCharge();
		if (ch >= 0) { snprintf(b, sizeof b, G_A " %s %d%%", cbHeavyName(), (int)(ch * 100)); rectR(4, py - 2, 220, 17, 4, C2D_Color32(0, 0, 0, 140)); rectR(4, py - 2, 220 * ch, 17, 4, C2D_Color32(245, 185, 66, 120)); txt(10, py - 1, .44f, C_GOLD, b); }
		else if (ne >= 0) { if (cbHeavyCd() > 0) snprintf(b, sizeof b, G_A " %s · tieni: %s tra %ds", cbMoveName(), cbHeavyName(), (int)ceilf(cbHeavyCd())); else snprintf(b, sizeof b, G_A " %s · tieni: %s", cbMoveName(), cbHeavyName());
			float w2 = txtW(b, .42f) + 12; rectR(4, py - 2, w2, 17, 4, C2D_Color32(0, 0, 0, 140)); txt(10, py - 1, .42f, C_TXT, b); }
		else {
			const char *h = G_PAD " muovi · tocca per andare · " G_ST " menu · " G_SE " mappa";
			if (txtW(h, .38f) > skX(0) - 16) h = G_PAD " muovi · " G_ST " menu · " G_SE " mappa";
			if (txtW(h, .38f) <= skX(0) - 16) txt(10, py - 1, .38f, C2D_Color32(220, 226, 236, 190), h);
		}
	}
	if (SET.fps) { snprintf(b, sizeof b, "%.0f fps", FPS); txtC(VW / 2, VH - 14, .34f, C2D_Color32(255, 255, 120, 255), b); }
}

/* ---------------- sopra il mondo: nomi, barre, numeri, annunci ---------------- */
// la striscia libera in alto, tra il riquadro dell'eroe e la minimappa
float topCX(void) { return started ? (190 + VW - 106) / 2 : VW / 2; }
float topW(void) { return started ? VW - 106 - 190 - 8 : VW - 40; }
static void label(float x, float y, float sc, u32 c, const char *s) {
	txtC(x + .8f, y + .8f, sc, C2D_Color32(0, 0, 0, 200), s);
	txtC(x, y, sc, c, s);
}
void uiLabel(float x, float y, float sc, u32 c, const char *s) { label(x, y, sc, c, s); }
static void drawOverlay(void) {
	if (!TITLE_MODE) {
		for (int i = 0; i < NENT; i++) {
			Ent *e = &ents[i];
			if (e->k != K_EN && e->k != K_NPC && e->k != K_DR && e->k != K_SHARD && e->k != K_PO) continue;
			float top = e->k == K_EN ? (e->boss ? 74 : 42) : e->k == K_NPC ? 42 : e->k == K_PO ? 46 : 26;
			float sx, sy; worldToScreen(e->px, e->py, top, &sx, &sy);
			if (sx < -40 || sx > VW + 40 || sy < -20 || sy > VH + 20) continue;
			if (e->k == K_EN) {
				float w = e->boss ? 50 : 26;
				rect(sx - w / 2, sy, w, 4, C2D_Color32(0, 0, 0, 170));
				rect(sx - w / 2, sy, w * clampf(e->hp / e->mx, 0, 1), 4, e->enr ? C2D_Color32(255, 122, 42, 255) : C2D_Color32(238, 51, 51, 255));
				if (e->boss) label(sx, sy - 14, .42f, C2D_Color32(255, 200, 200, 255), e->name);
				if (e == TGT || e == LOCK) { rect(sx - w / 2 - 2, sy - 1, 2, 6, C_GOLD); rect(sx + w / 2, sy - 1, 2, 6, C_GOLD); }
			} else if (e->k == K_NPC) {
				if (SET.names && hyp(e->px - P.px, e->py - P.py) < 9) label(sx, sy - 12, .38f, C_TXT, e->name);
				if (e->qm) {
					char q[2] = {e->qm == '.' ? '.' : e->qm, 0};
					float bob = fabsf(sinf(gtime * 4)) * 3;
					label(sx, sy - (SET.names ? 30 : 18) - bob, .7f, e->qm == '?' ? C2D_Color32(122, 255, 122, 255) : C_GOLD, e->qm == '.' ? "..." : q);
				}
			} else if (e->k == K_DR && hyp(e->px - P.px, e->py - P.py) < 6) {
				label(sx, sy - 8, .36f, rarCol(e->it.r), e->it.n);
			} else if (e->k == K_SHARD) label(sx, sy - 8, .42f, C_GOLD, e->name);
			else if (e->k == K_PO && e == IT) label(sx, sy - 8, .4f, C2D_Color32(140, 230, 255, 255), e->name);
		}
		xDrawLabels();
		// barra dell'eroe
		{
			float sx, sy; worldToScreen(P.px, P.py, 44 + xHeroZ(), &sx, &sy);
			{ const char *tt = titleNow(); if (tt[0]) { char tb[48]; snprintf(tb, sizeof tb, "« %s »", tt); label(sx, sy - 12, .34f, C2D_Color32(255, 210, 122, 255), tb); } }
			rect(sx - 13, sy, 26, 4, C2D_Color32(0, 0, 0, 170));
			rect(sx - 13, sy, 26 * clampf(P.hp / P.mx, 0, 1), 4, C2D_Color32(68, 204, 68, 255));
			if (P.iv > 0) label(sx, sy - 12, .34f, C2D_Color32(140, 231, 255, 255), "invulnerabile");
		}
		// prompt d'interazione
		if (IT && PM == PM_NONE) {
			float top = IT->k == K_NPC ? 26 : IT->k == K_PO ? 22 : 12;
			float sx, sy; worldToScreen(IT->px, IT->py, top, &sx, &sy);
			circ(sx + 22, sy - 1, 9, C2D_Color32(0, 0, 0, 150));
			txtC(sx + 22, sy - 9, .5f, C_GOLD, G_L);
		}
		// numeri dei danni
		if (SET.dmg) for (int i = 0; i < NPOP; i++) {
			Pop *p = &POP[i];
			float sx, sy; worldToScreen(p->x, p->y, 44, &sx, &sy);
			sy -= (1 - p->t) * 28;
			u32 c = p->c; u8 a = (u8)(clampf(p->t * 2, 0, 1) * 255);
			txtC(sx + 1, sy + 1, .5f, C2D_Color32(0, 0, 0, a), p->s);
			txtC(sx, sy, .5f, C2D_Color32((c >> 16) & 255, (c >> 8) & 255, c & 255, a), p->s);
		}
		// boss: barra grande in alto
		for (int i = 0; i < NENT; i++) {
			Ent *e = &ents[i];
			if (e->k == K_EN && e->boss && !e->wb && e->al && hyp(e->px - P.px, e->py - P.py) < 14) {
				float bw = topW(), bx = topCX() - bw / 2;
				rectR(bx, 22, bw, 9, 4, C2D_Color32(0, 0, 0, 180));
				rectR(bx + 1, 23, (bw - 2) * clampf(e->hp / e->mx, 0, 1), 7, 3, e->enr ? C2D_Color32(255, 122, 42, 255) : C2D_Color32(200, 30, 50, 255));
				label(topCX(), 6, .45f, C2D_Color32(255, 220, 220, 255), e->name);
				break;
			}
		}
		// vita bassa: bordo rosso
		if (started && P.hp > 0 && P.hp < P.mx * .3f) {
			u8 a = (u8)(60 + sinf(gtime * 5) * 30);
			rect(0, 0, VW, 4, C2D_Color32(200, 0, 0, a)); rect(0, VH - 4, VW, 4, C2D_Color32(200, 0, 0, a));
			rect(0, 0, 4, VH, C2D_Color32(200, 0, 0, a)); rect(VW - 4, 0, 4, VH, C2D_Color32(200, 0, 0, a));
		}
		// chat della stanza (in basso a sinistra, sopra il suggerimento dei tasti) e fumetti sopra gli altri eroi
		{ float y = VH - 36; int shown = 0;
		  for (int i = NCHL - 1; i >= 0 && shown < 4; i--) { ChatL *c = &CHL[i]; if (c->t <= 0) continue; u8 a = (u8)(clampf(c->t, 0, 1) * 255);
			char line[160]; marqueeStr(c->s, .36f, 250, c->tt - c->t, line, sizeof line);
			float w = txtW(line, .36f) + 8; rectR(4, y, w, 13, 3, C2D_Color32(0, 0, 0, (u8)(a * .5f))); txt(8, y, .36f, c->sys == 2 ? C2D_Color32(125, 255, 176, a) : c->sys ? C2D_Color32(255, 216, 120, a) : C2D_Color32(235, 240, 250, a), line);
			y -= 14; shown++; } }
		if (netOk) { char rk[64]; rmKey(rk, sizeof rk);
			for (int i = 0; i < MAXPEER; i++) { Peer *o = &PEERS[i]; if (!o->used || strcmp(o->rm, rk) || plHidePeer(o)) continue;
				float sx, sy; worldToScreen(o->x, o->y, 44, &sx, &sy); if (sx < -40 || sx > VW + 40 || sy < -20 || sy > VH + 20) continue;
				rect(sx - 13, sy, 26, 4, C2D_Color32(0, 0, 0, 170)); rect(sx - 13, sy, 26 * clampf(o->hp / (float)(o->mx ? o->mx : 1), 0, 1), 4, C2D_Color32(68, 170, 255, 255));
				bool mate = plMate(o->id);
				if (o->cavB >= 0) sy -= 20;
				if (o->tt[0]) { char tb[48]; snprintf(tb, sizeof tb, "« %s »", o->tt); label(sx, sy - 24, .34f, C2D_Color32(255, 210, 122, 255), tb); }
				char nm[40]; snprintf(nm, sizeof nm, "%s%s Lv%d", mate ? "+ " : "", o->n, o->lv); label(sx, sy - 12, .38f, inPit(o->x, o->y) ? C2D_Color32(255, 154, 154, 255) : mate ? C2D_Color32(125, 255, 176, 255) : C2D_Color32(154, 220, 255, 255), nm);
				if (o->bt > 0 && o->bub[0]) { char bb[80]; float tot = fmaxf(5, marqueeTime(o->bub, .38f, 150) + 1.5f); marqueeStr(o->bub, .38f, 150, tot - o->bt, bb, sizeof bb); label(sx, sy - 26, .38f, C2D_Color32(255, 227, 138, 255), bb); } } }
		plDrawTop();
		devDrawOverlay();
		if (msgT > 0) {
			// i messaggi lunghi vanno su due righe, sempre dentro lo schermo
			u8 al = (u8)(clampf(msgT, 0, 1) * 255);
			float my = VH - 62, mw = VW - 290;
			if (txtW(MSG, .45f) <= mw) { float w = txtW(MSG, .45f) + 16; rectR(VW / 2 - w / 2 - 40, my, w, 18, 4, C2D_Color32(0, 0, 0, (u8)(al * .7f))); txtC(VW / 2 - 40, my + 1, .45f, C2D_Color32(255, 255, 255, al), MSG); }
			else { float h = txtWrapMax(-2000, -2000, mw, .42f, 0, MSG, 30); rectR(VW / 2 - mw / 2 - 46, my + 16 - h, mw + 12, h + 4, 4, C2D_Color32(0, 0, 0, (u8)(al * .7f))); txtWrapMax(VW / 2 - mw / 2 - 40, my + 18 - h, mw, .42f, C2D_Color32(255, 255, 255, al), MSG, 30); }
		}
		if (zbanT > 0) {
			u8 a = (u8)(clampf(zbanT, 0, 1) * 255);
			char zb[96]; marqueeStr(ZBAN, .62f, topW(), 0, zb, sizeof zb);
			txtC(topCX() + 1, 41, .62f, C2D_Color32(0, 0, 0, a), zb);
			txtC(topCX(), 40, .62f, C2D_Color32(255, 240, 200, a), zb);
		}
		if (NBAN) {
			Ban *b = &BAN[0];
			u8 a = (u8)(clampf(b->t * 2, 0, 1) * 255);
			float bw = topW(), bx = topCX() - bw / 2;
			rectR(bx, 66, bw, 48, 6, C2D_Color32(10, 12, 20, (u8)(a * .78f)));
			rect(bx + 4, 66, bw - 8, 2, C2D_Color32(245, 185, 66, a));
			txtC(topCX(), 70, .6f, C2D_Color32(245, 185, 66, a), b->a);
			if (banT0 < 0) banT0 = gtime;
			char bb[160]; marqueeStr(b->b, .42f, bw - 14, gtime - banT0, bb, sizeof bb);
			txtC(topCX(), 93, .42f, C2D_Color32(240, 240, 240, a), bb);
		}
	} else {
		// titolo
		float bob = sinf(gtime * 1.5f) * 3;
		rect(0, 0, VW, VH, C2D_Color32(0, 0, 0, 40));
		rectG(0, 0, VW, 100, C2D_Color32(0, 0, 0, 120), C2D_Color32(0, 0, 0, 0));
		txtC(VW / 2 + 2, 14 + bob, 1.75f, C2D_Color32(0, 0, 0, 160), "VOXELIA");
		txtC(VW / 2, 12 + bob, 1.75f, C2D_Color32(255, 216, 74, 255), "VOXELIA");
		txtC(VW / 2 + 1, 70, .7f, C2D_Color32(0, 0, 0, 160), "Il Regno Perduto");
		txtC(VW / 2, 69, .7f, C2D_Color32(240, 236, 224, 255), "Il Regno Perduto");
		txtR(VW - 6, 4, .32f, C2D_Color32(230, 230, 230, 200), "PS4 " PORT_VER " · contenuti di Voxelia " DATA_VER);
		txt(6, 4, .32f, C2D_Color32(230, 230, 230, 200), "Gioco di ruolo in grafica voxel isometrica");
	}
	if (zoneFade > 0) rect(0, 0, VW, VH, C2D_Color32(0, 0, 0, (u8)(clampf(zoneFade, 0, 1) * 255)));
}

static void refreshPanels(void) {
	static char lastSt[64]; static bool lastOk = false;
	if ((PM == PM_NET || PM == PM_PLAYERS || PM == PM_TITLE || PM == PM_PAUSE) && (strcmp(lastSt, netStatus) || lastOk != netOk)) { int sel = SEL, scr = SCR; buildPanel(); SEL = sel < NOPT ? sel : NOPT - 1; SCR = scr; }
	snprintf(lastSt, sizeof lastSt, "%s", netStatus); lastOk = netOk;
	// il pannello dei plugin si aggiorna da solo (gruppo, chat)
	{ static int fr = 0; if (PM == PM_PLUG && ++fr % 30 == 0) { int sel = SEL, scr = SCR; buildPanel(); SEL = sel < NOPT ? sel : NOPT - 1; SCR = scr; } }
}
bool uiHidden = false;   // solo per le immagini delle prove automatiche
void uiDraw(void) {
	refreshPanels();
	if (uiHidden) return;
	drawOverlay();
	if (PM == PM_NONE && started) drawHud();
	else if (PM != PM_NONE) drawPanel();
}

void uiTick(float dt) {
	for (int i = 0; i < NCHL; i++) CHL[i].t -= dt;
	if (msgT > 0) msgT -= dt;
	if (zbanT > 0) zbanT -= dt;
	if (NBAN) { BAN[0].t -= dt; if (BAN[0].t <= 0) { memmove(BAN, BAN + 1, sizeof(Ban) * (NBAN - 1)); NBAN--; banT0 = -1; } }
}

/* ---------------- ingresso ---------------- */
static int rptT = 0;
bool uiTouchUsed = false;   // il tocco è finito sull'interfaccia (non è un "vai lì" nel mondo)
static u32 heldKeys = 0;
static inline bool inR(float px, float py, float x, float y, float w, float h) { return px >= x && px < x + w && py >= y && py < y + h; }
static void hudTouch(float tx, float ty) {
	{ const char *ti, *tx2, *si, *no;
	  if (plCard(&ti, &tx2, &si, &no)) {
		float cx = cardX(), cy = CARDY;
		if (inR(tx, ty, cx + 6, cy + 60, 96, 26)) { plCardAnswer(true); cardFocus = false; uiTouchUsed = true; return; }
		if (inR(tx, ty, cx + CARDW - 102, cy + 60, 96, 26)) { plCardAnswer(false); cardFocus = false; uiTouchUsed = true; return; }
		if (inR(tx, ty, cx, cy, CARDW, 92)) { uiTouchUsed = true; return; }
	  } }
	for (int i = 0; i < 6; i++) {
		if (inR(tx, ty, BTNX - 2, btnY0() + i * (BTNH + 3) - 1, BTNW + 4, BTNH + 2)) {
			uiTouchUsed = true;
			if (BTN[i].m < 0) { plPanelPage(3); uiOpenPanel(PM_PLUG); }   // Chat: registro della chat, con «Scrivi»
			else uiOpenPanel(BTN[i].m);
			return;
		}
	}
	if (inR(tx, ty, 2, 2, 184, 70)) { uiTouchUsed = true; uiOpenPanel(PM_INV); return; }
	// tocco sulla minimappa: mappa grande
	if (inR(tx, ty, VW - 104, 2, 100, 100)) { uiTouchUsed = true; uiOpenPanel(PM_MAP); return; }
	// abilità
	for (int k = 0; k < 4; k++) if (inR(tx, ty, skX(k) - 1, skY() - 2, SKW + 2, SKH + 4)) {
		uiTouchUsed = true;
		if (k == 0) dodge(); else if (k == 1) lunge(); else if (k == 2) areaAtk(); else potion();
		return;
	}
	{ const char *L[3]; int K[3]; int n = storyBtns(L, K);
	  for (int i = 0; i < n; i++) if (inR(tx, ty, sbX(i, n), sbY() - 1, SBW, 19)) { uiTouchUsed = true; if (K[i] == 0) xOpen(XP_PETS); else if (K[i] == 1) domTry(); else cavToggle(); return; } }
	if (IT && inR(tx, ty, 2, VH - 22, 240, 22)) { uiTouchUsed = true; act(IT); return; }
}
void uiInput(const PlInput *in) {
	u32 kd = in->kd, kh = in->kh;
	heldKeys = kh;
	bool tdown = in->tdown;
	float tx = in->tx / UIS, ty = in->ty / UIS;
	uiTouchUsed = false;
	if (PM == PM_NONE) {
		if (!started) return;
		// riquadro di un plugin: SELECT lo sceglie, poi ✕ accetta e ○ rifiuta
		{ const char *ti, *tx2, *si, *no;
		  if (plCard(&ti, &tx2, &si, &no)) {
			if (kd & KEY_SELECT) { cardFocus = !cardFocus; return; }
			if (cardFocus && (kd & KEY_A)) { plCardAnswer(true); cardFocus = false; return; }
			if (cardFocus && (kd & KEY_B)) { plCardAnswer(false); cardFocus = false; return; }
		  } }
		if (tdown) hudTouch(tx, ty);
		if (kd & KEY_START) { uiOpenPanel(PM_PAUSE); return; }
		if (kd & KEY_SELECT) { uiOpenPanel(PM_MAP); return; }
		return;
	}
	if (cardFocus) cardFocus = false;
	uiTouchUsed = in->touch;
	// finestre
	if (PM == PM_MAP && (kd & (KEY_B | KEY_SELECT | KEY_A | KEY_START))) { uiClose(); return; }
	int dir = 0;
	if (kd & (KEY_DUP | KEY_CPAD_UP)) dir = -1;
	if (kd & (KEY_DDOWN | KEY_CPAD_DOWN)) dir = 1;
	if (kh & (KEY_DUP | KEY_DDOWN | KEY_CPAD_UP | KEY_CPAD_DOWN)) { if (++rptT > 22 && rptT % 5 == 0) dir = (kh & (KEY_DUP | KEY_CPAD_UP)) ? -1 : 1; } else rptT = 0;
	if (dir && NOPT) { SEL = (SEL + dir + NOPT) % NOPT; tone(700, .02f, W_TRIANGLE, .03f); }
	if (kd & (KEY_L | KEY_ZL)) { SEL -= visRows > 1 ? visRows - 1 : 6; if (SEL < 0) SEL = 0; }
	if (kd & (KEY_R | KEY_ZR)) { SEL += visRows > 1 ? visRows - 1 : 6; if (SEL >= NOPT) SEL = NOPT - 1; }
	if (NOPT && (kd & (KEY_DLEFT | KEY_DRIGHT | KEY_CPAD_LEFT | KEY_CPAD_RIGHT))) {
		Opt *o = &OPT[SEL];
		if (o->act == A_SETTING || o->act == A_BET || o->act == A_DEV) doAct(o, (kd & (KEY_DLEFT | KEY_CPAD_LEFT)) ? -1 : 1);
	}
	bool back = false;
	if (NOPT && (kd & KEY_A)) doAct(&OPT[SEL], 0);
	else if (kd & KEY_Y && PM == PM_INV && NOPT && OPT[SEL].act == A_EQUIP) {
		int i = OPT[SEL].arg;
		if (i >= 0 && i < P.ninv) {
			Item it = P.inv[i];
			memmove(&P.inv[i], &P.inv[i + 1], sizeof(Item) * (P.ninv - i - 1)); P.ninv--;
			Ent *d = entNew(K_DR, P.px + .5f, P.py + .4f); if (d) d->it = it;
			msg("Hai gettato a terra: %s", it.n);
			buildPanel();
		}
	} else if (kd & KEY_Y && PM == PM_PLUG && NOPT && OPT[SEL].act == A_PLUG) {
		if (plPanelAlt(OPT[SEL].arg)) uiClose();
	} else if (kd & KEY_B) back = true;
	else if (kd & KEY_START && PM == PM_PAUSE) uiClose();
	if (tdown && PM != PM_MAP && PM != PM_NONE) {
		panelRect();
		// pulsante di chiusura in alto a destra
		if (PM != PM_TITLE && PM != PM_DEAD && inR(tx, ty, PX0 + PW - 26, PY0, 26, 26)) back = true;
		else if (inR(tx, ty, PX0, rowTop, PW, PY0 + PH - rowTop - 16)) {
			int i = SCR + (int)((ty - rowTop) / ROWH);
			if (i >= 0 && i < NOPT && i < SCR + visRows) {
				if (i == SEL) doAct(&OPT[i], 0); else { SEL = i; tone(700, .02f, W_TRIANGLE, .03f); }
			}
		} else if (!inR(tx, ty, PX0, PY0, PW, PH) && started && PM != PM_DEAD && PM != PM_EXITASK && PM != PM_CONFIRM) back = true;   // tocco fuori dalla finestra
		else if (ty > PY0 + PH - 16 && SCR + visRows < NOPT) { SCR++; SEL = SCR; }
	} else if (tdown && PM == PM_MAP) uiClose();
	if (back && PM != PM_NONE) {
		if (PM == PM_TITLE) return;
		if (PM == PM_DEAD) return;
		Opt bk = {{0}, {0}, 0, A_BACK, 0, false};
		if (PM == PM_TXT || PM == PM_NPC || PM == PM_INV || PM == PM_QUEST || PM == PM_DIARY || PM == PM_PAUSE || PM == PM_EXITASK) bk.act = A_CLOSE;
		if (PM == PM_TXT && txtBack == PM_DIARY) bk.act = A_CLOSE;
		doAct(&bk, 0);
	}
}
void uiInit(void) { CR[0] = 0; }
void uiTestSel(int i) { if (i >= 0 && i < NOPT) { SEL = i; doAct(&OPT[i], 0); } }
void uiTitleInit(void) { PM = PM_TITLE; SEL = 0; SCR = 0; buildPanel(); }
int kbMode = 0;
char kbInit[64];
// tastiera della chat con un testo iniziale (per esempio "/tpa ")
void uiKeyboard(const char *init) { snprintf(kbInit, sizeof kbInit, "%s", init ? init : ""); kbMode = 3; wantKeyboard = true; }
void uiAfterKeyboard(const char *s) {
	if (!s || !*s) return;
	if (kbMode == 0) {
		snprintf(P.name, sizeof P.name, "%s", s);
		saveGame();
		// collegati: il server riceve il nuovo nome (non è un messaggio di chat)
		if (netOk) { char b[160]; JW w = {b, 0, sizeof b}; jwRaw(&w, "{\"t\":\"hello\",\"code\":"); jwStr(&w, NETC.code); jwRaw(&w, ",\"name\":"); jwStr(&w, P.name); jwRaw(&w, "}"); netSendRaw(b); }
		msg("Ora ti chiami %s", P.name);
	}
	else if (kbMode == 1) { if (strstr(s, "://")) snprintf(NETC.url, sizeof NETC.url, "%s", s); else snprintf(NETC.url, sizeof NETC.url, "https://%s", s); setSave(); }
	else if (kbMode == 2) { int j = 0; for (const char *p = s; *p && j < 16; p++) { char c = *p; if (c >= 'A' && c <= 'Z') c += 32; if ((c >= 'a' && c <= 'z') || (c >= '0' && c <= '9')) NETC.code[j++] = c; } NETC.code[j] = 0; setSave(); }
	else if (kbMode == 3) netSendChat(s);
	else if (kbMode == 4) xKbDone(s);
	if (PM != PM_NONE) buildPanel();
}
bool uiHeldY(void) { return (heldKeys & KEY_Y) != 0; }
