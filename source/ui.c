// Voxelia 3DS - interfaccia: HUD e minimappa sullo schermo inferiore (touch), finestre di dialogo,
// negozi, zaino, missioni, diario, menu di pausa e titolo; nomi, barre e numeri sullo schermo superiore.
#include "voxelia.h"

#define G_A "\xEE\x80\x80"
#define G_B "\xEE\x80\x81"
#define G_X "\xEE\x80\x82"
#define G_Y "\xEE\x80\x83"
#define G_L "\xEE\x80\x84"
#define G_R "\xEE\x80\x85"
#define G_DPAD "\xEE\x80\x86"
#define G_PAD "\xEE\x81\xB7"

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
static char MSG[160]; static float msgT = 0;
void msg(const char *fmt, ...) {
	va_list ap; va_start(ap, fmt); vsnprintf(MSG, sizeof MSG, fmt, ap); va_end(ap);
	msgT = 3.5f;
}
typedef struct { char a[48], b[120]; float t; } Ban;
static Ban BAN[4]; static int NBAN = 0;
void banner(const char *a, const char *b) {
	if (NBAN >= 4) { memmove(BAN, BAN + 1, sizeof(Ban) * 3); NBAN = 3; }
	Ban *x = &BAN[NBAN++]; snprintf(x->a, sizeof x->a, "%s", a); snprintf(x->b, sizeof x->b, "%s", b ? b : ""); x->t = 2.6f;
}
static char ZBAN[96]; static float zbanT = 0;
typedef struct { char s[140]; float t; u8 sys; } ChatL;
static ChatL CHL[8]; static int NCHL = 0;
void chatLog(const char *who, const char *s, int sys) {
	if (NCHL >= 8) { memmove(CHL, CHL + 1, sizeof(ChatL) * 7); NCHL = 7; }
	ChatL *c = &CHL[NCHL++];
	if (who && *who) snprintf(c->s, sizeof c->s, "%s: %s", who, s); else snprintf(c->s, sizeof c->s, "%s", s);
	c->t = 9; c->sys = sys;
}

/* ---------------- minimappa: una texture aggiornata solo quando cambia la zona ---------------- */
static C3D_Tex mmTex;
static C2D_Image mmImg;
static Tex3DS_SubTexture mmSub;
static bool mmDirty = true, mmInit = false;
void uiMinimapDirty(void) { mmDirty = true; snprintf(ZBAN, sizeof ZBAN, "%s", ZNAME); zbanT = 2.6f; }
static inline u32 morton(u32 x, u32 y) {
	return (x & 1) | ((y & 1) << 1) | ((x & 2) << 1) | ((y & 2) << 2) | ((x & 4) << 2) | ((y & 4) << 3);
}
static u32 tileCol(int x, int y) {
	u32 c = TCOL[y][x];
	if (M[y][x] == 9) return 0;
	return WK(M[y][x]) ? shade(c, .8f) : shade(c, .62f);
}
static void mmBuild(void) {
	if (!mmInit) {
		C3D_TexInit(&mmTex, 128, 128, GPU_RGBA8);
		C3D_TexSetFilter(&mmTex, GPU_NEAREST, GPU_NEAREST);
		mmInit = true;
	}
	u32 *px = (u32 *)mmTex.data;
	for (int y = 0; y < 128; y++) for (int x = 0; x < 128; x++) {
		u32 rgba = 0x00000000;
		if (x < N && y < N) { u32 c = tileCol(x, y); rgba = (c << 8) | (M[y][x] == 9 ? 0 : 0xff); }
		px[((y >> 3) * 16 + (x >> 3)) * 64 + morton(x & 7, y & 7)] = rgba;
	}
	C3D_TexFlush(&mmTex);
	mmSub = (Tex3DS_SubTexture){(u16)N, (u16)N, 0, 1, N / 128.f, 1 - N / 128.f};
	mmImg.tex = &mmTex; mmImg.subtex = &mmSub;
	mmDirty = false;
}
static void drawMinimap(float X, float Y, float S, bool legend) {
	if (mmDirty) mmBuild();
	rect(X - 2, Y - 2, S + 4, S + 4, C2D_Color32(0, 0, 0, 170));
	float k = S / N;
	C2D_DrawImageAt(mmImg, X, Y, 0, NULL, k, k);
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
		rect(X + e->px * k - r / 2, Y + e->py * k - r / 2, r, r, c);
	}
	// l'eroe: freccia nella direzione in cui guarda
	float hx = X + P.px * k, hy = Y + P.py * k, a = atan2f(P.dr[1], P.dr[0]);
	float ca = cosf(a), sa = sinf(a);
	C2D_DrawTriangle(hx + ca * 5, hy + sa * 5, C2D_Color32(255, 255, 255, 255),
		hx - ca * 3.5f - sa * 3.5f, hy - sa * 3.5f + ca * 3.5f, C2D_Color32(255, 255, 255, 255),
		hx - ca * 3.5f + sa * 3.5f, hy - sa * 3.5f - ca * 3.5f, C2D_Color32(255, 255, 255, 255), 0);
	// bussola
	txtC(X + S / 2, Y - 1, .38f, C2D_Color32(255, 138, 122, 255), "N");
	if (legend) {
		float lx = X + S + 8, ly = Y;
		const char *L[] = {"Tu", "Nemici", "Boss", "Portali", "Forzieri", "Personaggi", "Missioni"};
		u32 C[] = {COL(255, 255, 255), COL(255, 68, 68), COL(255, 0, 255), COL(68, 238, 255), COL(255, 170, 51), COL(238, 238, 153), COL(255, 216, 74)};
		for (int i = 0; i < 7; i++) { rect(lx, ly + 5 + i * 16, 6, 6, C[i]); txt(lx + 10, ly + i * 16, .42f, C_TXT, L[i]); }
	}
}

/* ---------------- liste di opzioni (finestre) ---------------- */
enum {
	A_CLOSE = 1, A_BACK, A_STORY, A_QACCEPT, A_QTURN, A_OPEN, A_HEAL, A_REST, A_SONG, A_BUY, A_SELL, A_SELLALL, A_FORGE, A_UPG,
	A_EQUIP, A_DROPIT, A_QABANDON, A_LORE, A_RESUME, A_SAVE, A_SETTING, A_TITLE, A_CONT, A_NEW, A_PROLOG, A_HELP, A_DIFF,
	A_EXITSTAY, A_EXITGO, A_BET, A_CPLAY, A_CONFIRM, A_NOP, A_NAME, A_NETTOG, A_NETURL, A_NETCODE, A_CHAT, A_WHO, A_ARBUY, A_SELLRES, A_SAIL
};
typedef struct { char l[72]; char r[40]; u32 col; int act, arg; bool dis; } Opt;
static Opt OPT[48]; static int NOPT = 0, SEL = 0, SCR = 0;
static char PT[80], PB[900], PS[120];
static Ent *PNPC = NULL;
static int npcLine = 0;
static const char *txtTi, *txtTx, *txtSub;
static int confirmStep = 0;
static int CB = 10; static char CR[96];

static Opt *opt(const char *l, int act, int arg) {
	if (NOPT >= 48) return &OPT[47];
	Opt *o = &OPT[NOPT++]; memset(o, 0, sizeof *o);
	snprintf(o->l, sizeof o->l, "%s", l); o->act = act; o->arg = arg; o->col = C_TXT; return o;
}
static void itemDesc(const Item *it, char *out, int n) {
	char cr[16] = "", hp[16] = "";
	if (it->cr) snprintf(cr, sizeof cr, " · CRIT +%d%%", it->cr);
	if (it->hp) snprintf(hp, sizeof hp, " · PV +%d", it->hp);
	snprintf(out, n, "%s %d%s%s", it->s == SL_W ? "ATT" : "DIF", iv(it), cr, hp);
}
static u32 rarCol(int r) { u32 c = RC[r]; return C2D_Color32((c >> 16) & 255, (c >> 8) & 255, c & 255, 255); }

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
	if (id >= 0 && !strcmp(NPCS[id].id, "capitanomarina48")) opt("Salpa per Thalassa, il regno oltre il mare", A_SAIL, 0)->col = C_GOLD;
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
	if (netOk) { opt("Scrivi in chat", A_CHAT, 0); o = opt("Giocatori nella stanza", A_WHO, 0); if (netPing >= 0) snprintf(o->r, sizeof o->r, "ping %d ms", (int)netPing); }
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
	snprintf(PB, sizeof PB, "Giorno %d. %s", gDay(), ev == 1 ? "Saldi di stagione: tutto costa il 20% in meno!" : ev == 2 ? "Mercato in rialzo: tutto costa il 20% in più." : "I prezzi cambiano ogni giorno, a mezzanotte.");
	char b[72];
	Opt *o;
	o = opt("Pozione", A_BUY, 0); snprintf(o->r, sizeof o->r, "%d oro%s", px("pot", 25), isOffer("pot") ? " OFFERTA" : "");
	o = opt("Scorta di 5 pozioni", A_BUY, 1); snprintf(o->r, sizeof o->r, "%d oro%s", px("pot5", 110), isOffer("pot5") ? " OFFERTA" : "");
	o = opt("Equipaggiamento a sorpresa", A_BUY, 2); snprintf(o->r, sizeof o->r, "%d oro%s", px("rnd", 60 + P.lv * 20), isOffer("rnd") ? " OFFERTA" : "");
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
	o = opt("Musica", A_SETTING, 0); snprintf(o->r, sizeof o->r, "%s", SET.muOn ? "sì" : "no");
	o = opt("Volume musica", A_SETTING, 1); snprintf(o->r, sizeof o->r, "< %d%% >", (int)roundf(SET.mu * 100));
	o = opt("Volume effetti", A_SETTING, 2); snprintf(o->r, sizeof o->r, "< %d%% >", (int)roundf(SET.sf * 100));
	o = opt("Zoom della telecamera", A_SETTING, 3); snprintf(o->r, sizeof o->r, "< %d%% >", (int)roundf(SET.zoom * 100));
	o = opt("Nomi sopra i personaggi", A_SETTING, 4); snprintf(o->r, sizeof o->r, "%s", SET.names ? "sì" : "no");
	o = opt("Numeri dei danni", A_SETTING, 5); snprintf(o->r, sizeof o->r, "%s", SET.dmg ? "sì" : "no");
	o = opt("Ombre", A_SETTING, 6); snprintf(o->r, sizeof o->r, "%s", SET.shad ? "sì" : "no");
	o = opt("Inseguimento automatico del bersaglio", A_SETTING, 7); snprintf(o->r, sizeof o->r, "%s", SET.autoAtk ? "sì" : "no");
	{ Opt *o = opt("Multigiocatore", A_OPEN, PM_NET); snprintf(o->r, sizeof o->r, "%s", netOk ? "collegato" : NETC.on ? "…" : "spento"); }
	opt("Comandi", A_HELP, 0);
	opt("Salva e torna al titolo", A_TITLE, 0);
}
static void buildTitle(void) {
	snprintf(PT, sizeof PT, "VOXELIA %s", GAME_VER);
	snprintf(PB, sizeof PB, "Il Regno Perduto — gioco di ruolo in grafica voxel isometrica, per Nintendo 3DS. Port " PORT_VER " · contenuti di Voxelia " DATA_VER ".");
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
		G_A "  attacca il nemico più vicino (lo insegue e colpisce) · se non ci sono nemici, interagisce\n"
		G_L "  interagisci: parla, apri, raccogli, entra\n"
		G_B "  schivata (invulnerabile per un attimo: schivare un colpo rende critico il prossimo)\n"
		G_R "  affondo dell'arma (diverso per pugnale, spada, lancia, martello...)\n"
		G_Y "  colpo ad area · " G_X "  pozione\n"
		"ZL / ZR o C-stick (New 3DS)  zoom · START  pausa · SELECT  mappa\n"
		"Schermo touch: zaino, missioni, diario, mappa e menu. Cursore 3D: profondità.");
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
	case PM_MAP:
		snprintf(PT, sizeof PT, "%s", ZNAME);
		opt("Chiudi", A_CLOSE, 0);
		break;
	}
	if (SEL >= NOPT) SEL = NOPT - 1;
	if (SEL < 0) SEL = 0;
}

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
		if (PM == PM_NET) { PM = started ? PM_PAUSE : PM_TITLE; SEL = 0; buildPanel(); return; }
		if (PM == PM_SHOP || PM == PM_SMITH || PM == PM_ALCH || PM == PM_CASINO || PM == PM_ARENA || PM == PM_SELLRES) { if (PNPC) { PM = PM_NPC; buildPanel(); } else uiClose(); return; }
		if (PM == PM_DIFF || PM == PM_CONFIRM || (PM == PM_HELP && !started)) { PM = PM_TITLE; SEL = 0; buildPanel(); return; }
		if (PM == PM_HELP) { PM = PM_PAUSE; buildPanel(); return; }
		uiClose(); return;
	case A_STORY: storyStep(a); return;
	case A_QACCEPT: if (PNPC) qAccept(PNPC->nid, a); break;
	case A_QTURN: qTurn(a); break;
	case A_OPEN: PM = a; SEL = 0; SCR = 0; CR[0] = 0; break;
	case A_HEAL: P.hp = P.mx; msg("La Luce ti ristora completamente."); JINGLE(.1f, W_TRIANGLE, 72, 79, 84); break;
	case A_REST: if (pay(10)) { P.hp = P.mx; msg("Dormi profondamente. Sei completamente ristorato."); } break;
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
	case A_SAVE: saveGame(); msg("Partita salvata sulla scheda SD"); tone(880, .08f, W_TRIANGLE, .05f); break;
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
	case A_SAIL: uiClose(); goZone("thal48"); banner("Thalassa", "Il regno oltre il mare · parla con il Cancelliere Oreste"); return;
	case A_NOP: if (PM == PM_INV) tone(300, .03f, W_TRIANGLE, .03f); return;
	}
	if (PM != PM_NONE) buildPanel();
}

/* ---------------- disegno delle finestre ---------------- */
#define ROWH 19
static float bodyH = 0;
static void drawPanel(void) {
	rect(0, 0, 320, 240, C_PANEL);
	rect(0, 0, 320, 22, C_PANEL2);
	rect(0, 22, 320, 1, C2D_Color32(245, 185, 66, 140));
	txt(6, 3, .55f, C_GOLD, PT);
	float y = 26;
	if (PS[0]) { txt(8, y, .42f, C_MU, PS); y += 14; }
	if (PM == PM_MAP) {
		drawMinimap(20, 30, 180, true);
		txt(8, 222, .42f, C_MU, G_B " chiudi · SELECT mappa");
		return;
	}
	if (PB[0]) { bodyH = txtWrapMax(8, y, 304, .45f, C_TXT, PB, PM == PM_TXT || PM == PM_HELP ? 180 : 118); y += bodyH + 4; }
	float top = y, bottom = 238;
	int vis = (int)((bottom - top) / ROWH);
	if (vis < 1) vis = 1;
	if (SEL < SCR) SCR = SEL;
	if (SEL >= SCR + vis) SCR = SEL - vis + 1;
	if (SCR > NOPT - vis) SCR = NOPT - vis;
	if (SCR < 0) SCR = 0;
	for (int i = SCR; i < NOPT && i < SCR + vis; i++) {
		Opt *o = &OPT[i];
		float ry = top + (i - SCR) * ROWH;
		if (i == SEL) { rect(2, ry, 316, ROWH - 1, C_SEL); rect(2, ry, 3, ROWH - 1, C_GOLD); }
		else rect(2, ry, 316, ROWH - 1, C2D_Color32(42, 51, 80, 255));
		u32 c = o->dis ? C_MU : o->col;
		float rw = o->r[0] ? txtW(o->r, .42f) : 0;
		// accorcia l'etichetta se si sovrappone al testo a destra
		char lab[72]; snprintf(lab, sizeof lab, "%s", o->l);
		while (strlen(lab) > 4 && txtW(lab, .46f) > 300 - rw - 14) { int n = strlen(lab); lab[n - 4] = '.'; lab[n - 3] = '.'; lab[n - 2] = 0; }
		txt(9, ry + 2, .46f, c, lab);
		if (o->r[0]) txtR(313, ry + 3, .42f, C_MU, o->r);
	}
	if (SCR > 0) txtR(316, top - 13, .4f, C_GOLD, "\xE2\x96\xB2");
	if (SCR + vis < NOPT) txtR(316, 226, .4f, C_GOLD, "\xE2\x96\xBC");
}

/* ---------------- HUD in gioco ---------------- */
static void bar(float x, float y, float w, float h, float k, u32 c, const char *label) {
	rect(x, y, w, h, C2D_Color32(0, 0, 0, 160));
	rect(x, y, w * clampf(k, 0, 1), h, c);
	if (label) txtC(x + w / 2, y - 1, .4f, C_TXT, label);
}
typedef struct { float x, y, w, h; const char *l; int m; } Btn;
static const Btn BTN[6] = {{2, 214, 52, 24, "Zaino", PM_INV}, {55, 214, 52, 24, "Missioni", PM_QUEST}, {108, 214, 52, 24, "Diario", PM_DIARY}, {161, 214, 52, 24, "Mappa", PM_MAP}, {214, 214, 52, 24, "Chat", -1}, {267, 214, 51, 24, "Menu", PM_PAUSE}};
// pulsante di un'abilità: simbolo e nome a sinistra, a destra il costo in stamina (o i secondi d'attesa)
static void skillBox(float x, float y, const char *g, const char *n, int cost, float cd, float mx, bool off) {
	rect(x, y, 76, 22, C2D_Color32(42, 51, 80, 255));
	if (cd > 0) rect(x, y, 76 * clampf(cd / mx, 0, 1), 22, C2D_Color32(120, 30, 30, 200));
	char b[32]; snprintf(b, sizeof b, "%s %s", g, n);
	txt(x + 3, y + 4, .38f, off || cd > 0 ? C_MU : C_TXT, b);
	char c[8] = "";
	if (cd > 0) snprintf(c, sizeof c, "%d", (int)ceilf(cd)); else if (cost > 0) snprintf(c, sizeof c, "%d", cost);
	if (c[0]) txtR(x + 74, y + 5, .34f, cd > 0 ? C_GOLD : C2D_Color32(120, 220, 150, 255), c);
}
static void drawHud(void) {
	rect(0, 0, 320, 240, C2D_Color32(16, 19, 26, 255));
	char b[96];
	snprintf(b, sizeof b, "%s · Lv %d", P.name, P.lv);
	txt(4, 1, .5f, C_GOLD, b);
	char clk[8]; gClock(clk);
	snprintf(b, sizeof b, "Giorno %d · %s %s", gDay(), clk, NK > .5f ? "(notte)" : DK > .3f ? "(tramonto)" : "");
	txtR(316, 2, .44f, C_MU, b);
	snprintf(b, sizeof b, "Vita %d/%d", (int)fmaxf(0, P.hp), P.mx);
	bar(4, 19, 152, 13, P.hp / P.mx, P.hp < P.mx * .3f ? C2D_Color32(230, 60, 40, 255) : C2D_Color32(205, 50, 50, 255), b);
	snprintf(b, sizeof b, "XP %d/%d", P.xp, needXP());
	bar(164, 19, 152, 13, P.xp / (float)needXP(), C2D_Color32(68, 170, 221, 255), b);
	snprintf(b, sizeof b, "Oro %d · Pozioni %d · ATT %d · DIF %d%s%s", P.g, P.pot, atkV(), defV(), P.bA > 0 ? " · Forza" : "", P.bD > 0 ? " · Pietra" : "");
	txt(4, 33, .42f, C_TXT, b);
	// stamina, sotto la riga dell'oro e sopra la minimappa
	{ extern float STA; extern bool STEX; extern int stMax(void);
	  char b2[48]; float k = STA / stMax();
	  snprintf(b2, sizeof b2, "%s %d/%d", STEX ? "Senza fiato" : "Stamina", (int)STA, stMax());
	  bar(4, 48, 312, 10, k, STEX ? C2D_Color32(192, 80, 64, 255) : k < .25f ? C2D_Color32(192, 160, 64, 255) : C2D_Color32(76, 192, 112, 255), NULL);
	  txtC(160, 47, .34f, C_TXT, b2); }
	// minimappa
	drawMinimap(6, 62, 104, false);
	// zona e obiettivi
	float x = 120, y = 60;
	txtWrap(x, y, 196, .42f, C_GOLD, ZNAME); y += lineH(.42f) * (txtW(ZNAME, .42f) > 196 ? 2 : 1) + 2;
	char so[200]; storyObj(so, sizeof so);
	y += txtWrapMax(x, y, 196, .38f, C_TXT, so, 46) + 3;
	for (int i = 0; i < P.nq && y < 156; i++) {
		const QuestDef *T = &QT[P.q[i].id]; char pr[48];
		if (qReady(&P.q[i])) snprintf(pr, sizeof pr, "pronta!"); else qProg(&P.q[i], pr, sizeof pr);
		snprintf(b, sizeof b, "%s: %s", T->ti, pr);
		while (strlen(b) > 4 && txtW(b, .38f) > 196) { int n = strlen(b) - 1; while (n > 0 && (b[n] & 0xC0) == 0x80) n--; b[n] = 0; }
		txt(x, y, .38f, qReady(&P.q[i]) ? C2D_Color32(122, 255, 122, 255) : C_MU, b); y += 12;
	}
	// abilità e ricariche
	{ extern float STA; extern bool STEX;
	  int cd = P.moving ? 20 : 12;
	  skillBox(4, 170, G_B, "Schiva", cd, 0, 1, STEX || STA < 1);
	  skillBox(83, 170, G_R, "Affondo", 40, 0, 1, STEX || STA < 1 || P.at > 0);
	  skillBox(162, 170, G_Y, "Area", 45, 0, 1, STEX || STA < 1 || P.at > 0);
	  skillBox(241, 170, G_X, "Pozione", 0, P.pc, 2.5f, P.pot <= 0); }
	if (IT) {
		const char *v = IT->k == K_LEV ? "Tira la" : IT->k == K_NPC ? "Parla con" : IT->k == K_PO ? "Vai a" : IT->k == K_CH ? "Apri il forziere" : IT->k == K_DR ? "Raccogli" : "Raccogli";
		snprintf(b, sizeof b, G_L " %s %s", v, IT->k == K_CH ? "" : IT->k == K_DR ? IT->it.n : IT->name);
		txt(6, 195, .44f, C_GOLD, b);
	} else {
		int ne = nearestEnemy(4.2f);
		float ch = cbCharge();
		if (ch >= 0) { snprintf(b, sizeof b, G_A " %s %d%%", cbHeavyName(), (int)(ch * 100)); rect(6, 196, 200 * ch, 14, C2D_Color32(245, 185, 66, 120)); txt(6, 195, .44f, C_GOLD, b); }
		else if (ne >= 0) { if (cbHeavyCd() > 0) snprintf(b, sizeof b, G_A " %s · tieni: %s tra %ds", cbMoveName(), cbHeavyName(), (int)ceilf(cbHeavyCd())); else snprintf(b, sizeof b, G_A " %s · tieni: %s", cbMoveName(), cbHeavyName()); txt(6, 195, .42f, C2D_Color32(255, 140, 120, 255), b); }
		else txt(6, 195, .42f, C_MU, G_PAD " muovi · START pausa · SELECT mappa");
	}
	for (int i = 0; i < 6; i++) {
		const Btn *bt = &BTN[i];
		rect(bt->x, bt->y, bt->w, bt->h, C2D_Color32(42, 51, 80, 255));
		rect(bt->x, bt->y, bt->w, 1, C2D_Color32(245, 185, 66, 120));
		txtC(bt->x + bt->w / 2, bt->y + 5, .44f, C_TXT, bt->l);
	}
}

void uiDrawBottom(void) {
	static char lastSt[64]; static bool lastOk = false;
	if ((PM == PM_NET || PM == PM_PLAYERS || PM == PM_TITLE || PM == PM_PAUSE) && (strcmp(lastSt, netStatus) || lastOk != netOk)) { int sel = SEL, scr = SCR; buildPanel(); SEL = sel < NOPT ? sel : NOPT - 1; SCR = scr; }
	snprintf(lastSt, sizeof lastSt, "%s", netStatus); lastOk = netOk;
	if (PM == PM_NONE && started) drawHud();
	else if (PM == PM_NONE) { rect(0, 0, 320, 240, C_PANEL); }
	else drawPanel();
}

/* ---------------- schermo superiore: nomi, barre, numeri, annunci ---------------- */
static void label(float x, float y, float sc, u32 c, const char *s) {
	txtC(x + 1, y + 1, sc, C2D_Color32(0, 0, 0, 200), s);
	txtC(x, y, sc, c, s);
}
void uiDrawTopOverlay(float eyeShift) {
	(void)eyeShift;
	if (!TITLE_MODE) {
		for (int i = 0; i < NENT; i++) {
			Ent *e = &ents[i];
			if (e->k != K_EN && e->k != K_NPC && e->k != K_DR && e->k != K_SHARD && e->k != K_PO) continue;
			float top = e->k == K_EN ? (e->boss ? 74 : 42) : e->k == K_NPC ? 42 : e->k == K_PO ? 46 : 26;
			float sx, sy; worldToScreen(e->px, e->py, top, &sx, &sy);
			if (sx < -40 || sx > 440 || sy < -20 || sy > 260) continue;
			if (e->k == K_EN) {
				float w = e->boss ? 50 : 26;
				rect(sx - w / 2, sy, w, 4, C2D_Color32(0, 0, 0, 170));
				rect(sx - w / 2, sy, w * clampf(e->hp / e->mx, 0, 1), 4, e->enr ? C2D_Color32(255, 122, 42, 255) : C2D_Color32(238, 51, 51, 255));
				if (e->boss) label(sx, sy - 14, .42f, C2D_Color32(255, 200, 200, 255), e->name);
				if (e == TGT) { rect(sx - w / 2 - 2, sy - 1, 2, 6, C_GOLD); rect(sx + w / 2, sy - 1, 2, 6, C_GOLD); }
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
		// barra dell'eroe
		{
			float sx, sy; worldToScreen(P.px, P.py, 44, &sx, &sy);
			rect(sx - 13, sy, 26, 4, C2D_Color32(0, 0, 0, 170));
			rect(sx - 13, sy, 26 * clampf(P.hp / P.mx, 0, 1), 4, C2D_Color32(68, 204, 68, 255));
			if (P.iv > 0) label(sx, sy - 12, .34f, C2D_Color32(140, 231, 255, 255), "invulnerabile");
		}
		// prompt d'interazione
		if (IT && PM == PM_NONE) {
			float top = IT->k == K_NPC ? 26 : IT->k == K_PO ? 22 : 12;
			float sx, sy; worldToScreen(IT->px, IT->py, top, &sx, &sy);
			rect(sx + 14, sy - 9, 16, 16, C2D_Color32(0, 0, 0, 150));
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
			if (e->k == K_EN && e->boss && e->al && hyp(e->px - P.px, e->py - P.py) < 14) {
				rect(60, 22, 280, 9, C2D_Color32(0, 0, 0, 180));
				rect(61, 23, 278 * clampf(e->hp / e->mx, 0, 1), 7, e->enr ? C2D_Color32(255, 122, 42, 255) : C2D_Color32(200, 30, 50, 255));
				label(200, 6, .45f, C2D_Color32(255, 220, 220, 255), e->name);
				break;
			}
		}
		// vita bassa: bordo rosso
		if (started && P.hp > 0 && P.hp < P.mx * .3f) {
			u8 a = (u8)(60 + sinf(gtime * 5) * 30);
			rect(0, 0, 400, 4, C2D_Color32(200, 0, 0, a)); rect(0, 236, 400, 4, C2D_Color32(200, 0, 0, a));
			rect(0, 0, 4, 240, C2D_Color32(200, 0, 0, a)); rect(396, 0, 4, 240, C2D_Color32(200, 0, 0, a));
		}
		// chat della stanza e fumetti sopra gli altri eroi
		{ float y = 194; int shown = 0;
		  for (int i = NCHL - 1; i >= 0 && shown < 3; i--) { ChatL *c = &CHL[i]; if (c->t <= 0) continue; u8 a = (u8)(clampf(c->t, 0, 1) * 255);
			char line[140]; snprintf(line, sizeof line, "%s", c->s);
			if (txtW(line, .36f) > 236) { int n = strlen(line); while (n > 4 && txtW(line, .36f) > 228) { n--; while (n > 0 && (line[n] & 0xC0) == 0x80) n--; line[n] = 0; } strcat(line, "…"); }
			float w = txtW(line, .36f) + 8; rect(2, y, w, 12, C2D_Color32(0, 0, 0, (u8)(a * .5f))); txt(5, y, .36f, c->sys ? C2D_Color32(255, 216, 120, a) : C2D_Color32(235, 240, 255, a), line); y -= 13; shown++; } }
		if (netOk) { char rk[64]; rmKey(rk, sizeof rk);
			for (int i = 0; i < MAXPEER; i++) { Peer *o = &PEERS[i]; if (!o->used || strcmp(o->rm, rk)) continue;
				float sx, sy; worldToScreen(o->x, o->y, 44, &sx, &sy); if (sx < -40 || sx > 440 || sy < -20 || sy > 260) continue;
				rect(sx - 13, sy, 26, 4, C2D_Color32(0, 0, 0, 170)); rect(sx - 13, sy, 26 * clampf(o->hp / (float)(o->mx ? o->mx : 1), 0, 1), 4, C2D_Color32(68, 170, 255, 255));
				char nm[32]; snprintf(nm, sizeof nm, "%s Lv%d", o->n, o->lv); label(sx, sy - 12, .38f, inPit(o->x, o->y) ? C2D_Color32(255, 154, 154, 255) : C2D_Color32(170, 210, 255, 255), nm);
				if (o->bt > 0 && o->bub[0]) { char bb[64]; snprintf(bb, sizeof bb, "%s", o->bub); if (txtW(bb, .38f) > 150) { int n = strlen(bb); while (n > 4 && txtW(bb, .38f) > 142) { n--; while (n > 0 && (bb[n] & 0xC0) == 0x80) n--; bb[n] = 0; } strcat(bb, "…"); } label(sx, sy - 26, .38f, C2D_Color32(255, 227, 138, 255), bb); } } }
		if (msgT > 0) {
			// i messaggi lunghi vanno su due righe, sempre dentro lo schermo
			u8 al = (u8)(clampf(msgT, 0, 1) * 255);
			if (txtW(MSG, .45f) <= 384) { float w = txtW(MSG, .45f) + 16; rect(200 - w / 2, 212, w, 20, C2D_Color32(0, 0, 0, (u8)(al * .7f))); txtC(200, 214, .45f, C2D_Color32(255, 255, 255, al), MSG); }
			else { float h = txtWrapMax(-2000, -2000, 380, .42f, 0, MSG, 30); rect(4, 234 - h - 4, 392, h + 4, C2D_Color32(0, 0, 0, (u8)(al * .7f))); txtWrapMax(10, 234 - h - 2, 380, .42f, C2D_Color32(255, 255, 255, al), MSG, 30); }
		}
		if (zbanT > 0) {
			u8 a = (u8)(clampf(zbanT, 0, 1) * 255);
			txtC(201, 41, .62f, C2D_Color32(0, 0, 0, a), ZBAN);
			txtC(200, 40, .62f, C2D_Color32(255, 240, 200, a), ZBAN);
		}
		if (NBAN) {
			Ban *b = &BAN[0];
			u8 a = (u8)(clampf(b->t * 2, 0, 1) * 255);
			rect(40, 68, 320, 46, C2D_Color32(10, 12, 20, (u8)(a * .75f)));
			rect(40, 68, 320, 2, C2D_Color32(245, 185, 66, a));
			txtC(200, 72, .6f, C2D_Color32(245, 185, 66, a), b->a);
			txtC(200, 94, .42f, C2D_Color32(240, 240, 240, a), b->b);
		}
	} else {
		// titolo
		float bob = sinf(gtime * 1.5f) * 3;
		rect(0, 0, 400, 240, C2D_Color32(0, 0, 0, 40));
		txtC(202, 54 + bob, 1.6f, C2D_Color32(0, 0, 0, 160), "VOXELIA");
		txtC(200, 52 + bob, 1.6f, C2D_Color32(255, 216, 74, 255), "VOXELIA");
		txtC(201, 109, .7f, C2D_Color32(0, 0, 0, 160), "Il Regno Perduto");
		txtC(200, 108, .7f, C2D_Color32(240, 236, 224, 255), "Il Regno Perduto");
		txtC(200, 214, .42f, C2D_Color32(230, 230, 230, 220), "Usa lo schermo inferiore · " G_A " conferma");
	}
	if (zoneFade > 0) rect(0, 0, 400, 240, C2D_Color32(0, 0, 0, (u8)(clampf(zoneFade, 0, 1) * 255)));
#ifdef VOX_TEST
	{ extern int rStats(char *); char b[96]; rStats(b); txt(2, 226, .4f, C2D_Color32(255, 255, 0, 255), b); }
#endif
}

void uiTick(float dt) {
	for (int i = 0; i < NCHL; i++) CHL[i].t -= dt;
	if (msgT > 0) msgT -= dt;
	if (zbanT > 0) zbanT -= dt;
	if (NBAN) { BAN[0].t -= dt; if (BAN[0].t <= 0) { memmove(BAN, BAN + 1, sizeof(Ban) * (NBAN - 1)); NBAN--; } }
}

/* ---------------- ingresso ---------------- */
static int rptT = 0;
void uiInput(u32 kd, u32 kh, touchPosition *tp, bool touched, bool tdown) {
	if (PM == PM_NONE) {
		if (!started) return;
		if (tdown) {
			for (int i = 0; i < 6; i++) {
				const Btn *b = &BTN[i];
				if (tp->px >= b->x && tp->px < b->x + b->w && tp->py >= b->y && tp->py < b->y + b->h) {
					if (b->m < 0) { if (netOk) { kbMode = 3; wantKeyboard = true; } else uiOpenPanel(PM_NET); }
					else uiOpenPanel(b->m);
					return;
				}
			}
			// tocco sulla minimappa: mappa grande
			if (tp->px < 122 && tp->py > 50 && tp->py < 168) { uiOpenPanel(PM_MAP); return; }
			// tocco sulle abilità
			if (tp->py >= 170 && tp->py < 192) {
				int k = tp->px / 79;
				if (k == 0) dodge(); else if (k == 1) lunge(); else if (k == 2) areaAtk(); else potion();
				return;
			}
			if (tp->py >= 192 && tp->py < 210 && IT) { act(IT); return; }
		}
		if (kd & KEY_START) { uiOpenPanel(PM_PAUSE); return; }
		if (kd & KEY_SELECT) { uiOpenPanel(PM_MAP); return; }
		return;
	}
	// finestre
	if (PM == PM_MAP && (kd & (KEY_B | KEY_SELECT | KEY_A | KEY_START))) { uiClose(); return; }
	int dir = 0;
	if (kd & (KEY_DUP | KEY_CPAD_UP)) dir = -1;
	if (kd & (KEY_DDOWN | KEY_CPAD_DOWN)) dir = 1;
	if (kh & (KEY_DUP | KEY_DDOWN | KEY_CPAD_UP | KEY_CPAD_DOWN)) { if (++rptT > 22 && rptT % 5 == 0) dir = (kh & (KEY_DUP | KEY_CPAD_UP)) ? -1 : 1; } else rptT = 0;
	if (dir && NOPT) { SEL = (SEL + dir + NOPT) % NOPT; tone(700, .02f, W_TRIANGLE, .03f); }
	if (kd & (KEY_L | KEY_ZL)) { SEL -= 6; if (SEL < 0) SEL = 0; }
	if (kd & (KEY_R | KEY_ZR)) { SEL += 6; if (SEL >= NOPT) SEL = NOPT - 1; }
	if (NOPT && (kd & (KEY_DLEFT | KEY_DRIGHT))) {
		Opt *o = &OPT[SEL];
		if (o->act == A_SETTING || o->act == A_BET) doAct(o, (kd & KEY_DLEFT) ? -1 : 1);
	}
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
	} else if (kd & KEY_B) {
		if (PM == PM_TITLE) return;
		if (PM == PM_DEAD) return;
		Opt back = {{0}, {0}, 0, A_BACK, 0, false};
		if (PM == PM_TXT || PM == PM_NPC || PM == PM_INV || PM == PM_QUEST || PM == PM_DIARY || PM == PM_PAUSE || PM == PM_EXITASK) back.act = A_CLOSE;
		if (PM == PM_TXT && txtBack == PM_DIARY) back.act = A_CLOSE;
		doAct(&back, 0);
	} else if (kd & KEY_START && PM == PM_PAUSE) uiClose();
	// tocco sulle righe
	if (tdown && PM != PM_MAP) {
		float y = 26 + (PS[0] ? 14 : 0) + (PB[0] ? bodyH + 4 : 0);
		if (tp->py >= y) {
			int i = SCR + (int)((tp->py - y) / ROWH);
			if (i >= 0 && i < NOPT) {
				if (i == SEL) doAct(&OPT[i], 0); else { SEL = i; tone(700, .02f, W_TRIANGLE, .03f); }
			}
		}
	} else if (tdown && PM == PM_MAP) uiClose();
	(void)touched;
}
void uiInit(void) { CR[0] = 0; }
void uiTitleInit(void) { PM = PM_TITLE; SEL = 0; SCR = 0; buildPanel(); }
int kbMode = 0;
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
	if (PM != PM_NONE) buildPanel();
}
