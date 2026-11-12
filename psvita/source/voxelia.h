// Voxelia PS Vita - Il Regno Perduto
// Port per PlayStation Vita di "Voxelia 8.5". Mappe, modelli, nemici, personaggi, missioni e musiche arrivano
// dalla versione browser (tools/export.js e tools/songs.js -> data/); il motore nasce dal port 3DS ed è
// riscritto per la Vita: un solo schermo a 960x544, GPU con vitaGL, touch, levette e audio a 44,1 kHz.
#ifndef VOXELIA_H
#define VOXELIA_H

#include "plat.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>
#include <stdbool.h>
#include <sys/stat.h>
#include <stdarg.h>
#include "json.h"

#define PORT_VER "1.0.3"            // versione del port per PS Vita
#define DATA_VER "8.5"            // versione di Voxelia da cui arrivano mappe, modelli, testi e musiche
#define GAME_VER "Vita " PORT_VER
#define MAXN 96
#define MAXE 640
#define INV 24
#define MAXQ 5
#define PI_F 3.14159265f

static inline float clampf(float v, float a, float b) { return v < a ? a : v > b ? b : v; }
static inline int clampi(int v, int a, int b) { return v < a ? a : v > b ? b : v; }
static inline float hyp(float a, float b) { return sqrtf(a * a + b * b); }

/* ---------------- casualità ---------------- */
float frnd(void);
int fri(int a, int b);
u32 hs(const char *s);

/* ---------------- oggetti ---------------- */
enum { SL_W, SL_H, SL_C, SL_S };
typedef struct {
	u8 s, r, up, cr;
	u16 v, hp;
	u32 p;
	char n[30];
	u8 used;
	u8 el;            // 3DS 1.5: elemento dell'arma, (elemento << 3) | livello (7.55); stava nel byte di riempimento
} Item;
extern u32 RC[5];
extern const char *RN[5];
extern const char *SN[4];
int iv(const Item *it);
void iname(const Item *it, char *out, int n);
Item mkItem(int lv, int minR, int slot);
Item mkUniq(int et, int lv);
int itemType(const Item *it);    // tipo del modello (spada, ascia, elmo, corona, piastre, scudo a goccia...)

/* ---------------- tabelle (romfs:/data.json) ---------------- */
typedef struct {
	const char *id, *n;
	float hp, at, xp, sp, r, cd, ag;
	u8 boss, slam, np;
	u32 rng;
	int sum, mdl;
	const char *kind;   // forma del modello (q, h, a, slime...): la famiglia dei compagni
	u8 el, elh;         // elemento della specie (0 = dal tema della zona) e quello di riserva
} EnemyDef;
extern EnemyDef E[];
extern int NE;
int enemyIdx(const char *id);

typedef struct { const char *n; float hp, dm, lt, x; u8 pm; } Diff;
extern Diff DFS[4];

enum { R_NONE, R_KING, R_SAGE, R_INN, R_BARD, R_SMITH, R_ALCH, R_HEAL, R_SHOP, R_CAT, R_CASINO, R_ARENA, R_BUYER, R_FISHER, R_MOTEL, R_NAVAL, R_DIM, R_MASTER };
typedef struct {
	const char *id, *n;
	int role;
	u32 c, hat;
	const char *qs[12]; int nqs;
	const char *ln[10]; int nln;
	const char *buy;
} NpcDef;
extern NpcDef NPCS[];
extern int NNPC;
int npcIdx(const char *id);

enum { QK_KILL, QK_COL, QK_BOSS, QK_TALK, QK_FISH, QK_GAT, QK_STEP, QK_BAT };
typedef struct {
	const char *id;
	int t;
	int e[6], ne;
	int n, lv;
	const char *it, *to, *ti, *tx, *r, *unl, *req, *f;
	float ch;
	int g, x;
	u8 once;
} QuestDef;
extern QuestDef QT[];
extern int NQT;
int questIdx(const char *id);

typedef struct {
	const char *id, *n;
	int lv, fls;
	int en[6], nen;
	int boss;
	const char *ent;
	u8 fin;
	u32 tc, bg;
} DungeonDef;
extern DungeonDef DG[];
extern int NDG;
int dgIdx(const char *id);
#define NSHARD 6
extern const char *SHARDS[6];

typedef struct { const char *ti, *tx; } Lore;
extern Lore LORE[24];
extern const char *LOREID[24];
extern int NLORE;
extern const char *STORY_INTRO, *STORY_FORGE, *STORY_END;
extern const char *SHT[6];
extern const char *DGH[10];
extern const char *VLINES[16];
extern int NVLINES;
void dataInit(void);
bool zoneExists(const char *k);
const char *zoneTitle(const char *k);

/* ---------------- modelli animati (romfs:/models.bin, hero.bin) ---------------- */
typedef struct { s16 x, y, z, h; u16 w, d; u8 r, g, b, f, a, fl; u16 tile; } QBox;
typedef struct { u8 nfr, fpd; QBox **fr; u16 *nb; } AModel;
extern AModel *MDL;
extern int NMDL;
void modelsLoad(void);
static inline bool emissiveQ(const QBox *q) {
	u32 c = (q->r << 16) | (q->g << 8) | q->b;
	switch (c) { case 0xffd27a: case 0xffe9a8: case 0xffe08a: case 0xffcc33: case 0xfff2a0: case 0xff8a2a: case 0xff7a2a: case 0xffd84a: case 0xfff6c0: case 0xffd890: case 0xff6a1a: case 0xffb04a: return true; }
	return q->f >= 118;   // il pavimento varia la luminosità fino a 1,08: non è una luce
}


/* ---------------- entità ---------------- */
enum { K_NONE, K_EN, K_NPC, K_PO, K_CH, K_DR, K_SHARD, K_LORE, K_TC, K_DEAD, K_CHO, K_RES, K_PEER, K_LEV, K_X };
enum { PO_DOOR, PO_EXIT, PO_GATE, PO_DUN, PO_DOWN, PO_UP, PO_VOID, PO_OTHER };

typedef struct {
	u8 k;
	float px, py;
	int model, face;
	float fl, t0;
	// nemico
	int t, id;
	float hp, mx, at, xp, sp, r, cd, ag, cdt, slt, stk, epw, ept, atkT, atkD[2], mvT;
	u8 boss, al, enr, intro;
	u8 path[24][2];
	u8 pn, pi;
	// personaggio
	int nid;
	char qm;
	u8 wd, slp;
	float wt;
	char name[48];
	// portale
	char to[32];
	u8 st, dgx, ok;
	u32 col;
	const char *lockMsg;
	char lock[16];
	u8 seal;          // scala chiusa dalla grata delle leve
	char lev[4];      // id della leva (L1, L2)
	// forziere, risorse
	u8 rich;
	int hc;
	char res[16];
	float rt;
	// oggetto a terra
	Item it;
	char gid[16];
	// frammento / pagina
	int sid;
	// boss del mondo (plugin boss): vb = una «vita», scl = grandezza del modello
	u8 wb; float vb, scl;
	// 3DS 1.5 (story.c): entità della storia, compagni, elementi, scelte, nemici condivisi in rete
	u8 xk, xs, xo, ast, el, cho, pup, zn, eZp;
	u32 uid, ptg;
	float ait, stT, adg, hrt, ph, pcd, cbs, sBl, sBd, sSl;
	float eBu, ePo, eSl, eSlK, eFz, eWe, hme, ntx, nty;
	char sg[24]; s8 own;
	u8 bph, bstg; float bshd, bwkO, bwkN, bstn;   // boss a fasi (7.44)
	u8 pk, fury, champ;                           // branco, ultima furia, Campione (7.11)
} Ent;
extern Ent ents[MAXE];
extern int NENT;
Ent *entNew(u8 k, float x, float y);
void entDel(Ent *e);

/* ---------------- eroe ---------------- */
typedef struct { int id, npc, c; } Quest;
typedef struct { char k[16]; u16 n; } ResCount;
typedef struct {
	float px, py;
	float hp; int mx, lv, xp, g, pot;
	Item eq[4];
	Item inv[INV]; int ninv;
	Quest q[MAXQ]; int nq;
	u16 qd[200];
	u8 qi[240];
	int st;
	u32 sh, lore;
	u8 runs[10], done[10], seen[10];
	int kills;
	float gt;
	u32 hcK[24]; u64 hcT[24];
	char unl[12][16];
	ResCount res[16];
	// combattimento
	float at, sk, pc, sw, bA, bD, iv, dgc, lgc, pf, fl;
	float dr[2];
	int face;
	u8 dmk; float dmt, dmv, dmx, dmy, dmm; int dmh[16]; int ndmh;
	u8 moving;
	char name[16];
	int df;
	int swc;
} Hero;
extern Hero P;
extern bool started;
extern int MODE_DEAD;
bool hasUnl(const char *k);
void addUnl(const char *k);
int resGet(const char *k);
void resAdd(const char *k, int n);

/* ---------------- mondo ---------------- */
extern int N;
extern u8 M[MAXN][MAXN];
extern u8 OCCT[MAXN][MAXN];
extern u32 TCOL[MAXN][MAXN];
extern char Zk[32];
extern char ZNAME[96];
extern int ZLV, ZRUN, ZMUS, ZINT, ZOUT, ZDG, ZDN;
extern u32 ZBG, ZTC;
extern float gtime;

bool WK(int c);
bool blk(float x, float y);
void loadZone(const char *k, const char *from);
int bfs(int sx, int sy, s16 *d);
bool nearFree(int x, int y, int *ox, int *oy);
int pathFind(int sx, int sy, int gx, int gy, u8 (*out)[2], int maxn);
Ent *mkEn(int t, int x, int y);
Ent *mkPo(float x, float y, const char *to, int st, const char *name);
void rmKey(char *out, int n);

/* ---------------- luci ---------------- */
typedef struct { float x, y, z, r; float cr, cg, cb; } Light;
extern Light SLIGHT[256];
extern int NSLIGHT;
void addSLight(float x, float y, float z, float r, u32 c, float a);
extern float NK, DK;

/* ---------------- rendering ---------------- */
void rInit(void);
void rExit(void);
void rBuildZone(const QBox *B, int nb);
void rFrame(void);
void box(float x, float y, float z, float w, float d, float h, u32 c, float f);
void boxA(float x, float y, float z, float w, float d, float h, u32 c, float f, u8 a);
void boxR(float ox, float oy, float x, float y, float z, float w, float d, float h, u32 c, float f, u8 a);
void flatEllipse(float cx, float cy, float z, float rx, float ry, u32 c, u8 a);
void flatRing(float cx, float cy, float z, float rx, float ry, float th, u32 c, u8 a);
void rStream(int s);
extern float gEmit;
extern float camX, camY, camS, camTX, camTY;
void worldToScreen(float x, float y, float z, float *sx, float *sy);
void drawEntity(Ent *e);
void drawHero(void);
void drawPeers(void);
void drawFx(void);
void drawModelFrame(int mdl, int frame, float px, float py, float zo, int white, u8 alpha);
void drawHeroModel(float px, float py, float zo, int fc, int c, int h, int w, int s, int tyw, int tyh, int tyc, int tys, bool walk, float ph, bool sw, u8 alpha);
u32 shade(u32 c, float f);
int faceOf(float dx, float dy);

/* ---------------- testo e interfaccia ---------------- */
void txt(float x, float y, float sc, u32 col, const char *s);
void txtC(float x, float y, float sc, u32 col, const char *s);
void txtR(float x, float y, float sc, u32 col, const char *s);
void txtO(float x, float y, float sc, u32 col, const char *s, int align);
float txtW(const char *s, float sc);
float txtWrap(float x, float y, float w, float sc, u32 col, const char *s);
float lineH(float sc);
float txtWrapMax(float x, float y, float w, float sc, u32 col, const char *s, float maxH);
float marqueeTime(const char *s, float sc, float maxW);
const char *marqueeStr(const char *s, float sc, float maxW, float t, char *buf, int n);
void txtMarquee(float x, float y, float sc, u32 col, const char *s, float maxW, float t);
void rect(float x, float y, float w, float h, u32 c);
void rectG(float x, float y, float w, float h, u32 top, u32 bot);          // sfumatura verticale
void rectR(float x, float y, float w, float h, float r, u32 c);            // angoli arrotondati
void rectO(float x, float y, float w, float h, float t, u32 c);            // solo il bordo
void tri(float ax, float ay, float bx, float by, float cx, float cy, u32 c);
void circ(float x, float y, float r, u32 c);
void imageDraw(int tex, float x, float y, float w, float h, float u0, float v0, float u1, float v1, u32 tint);
int texCreate(int w, int h, const u32 *rgba, bool nearest);
void texUpdate(int tex, int w, int h, const u32 *rgba);
void g2Begin(void);
void g2Flush(void);
void g2Init(void);
extern float UIS, VW, VH;   // scala dell'interfaccia e dimensioni virtuali (VW x VH)
float topCX(void);         // centro e larghezza della striscia libera in alto (barre dei boss, annunci)
float topW(void);
void uiApplyScale(void);
u32 RGBA(u32 rgb, u8 a);

void uiInit(void);
void uiDraw(void);
void uiInput(const PlInput *in);
bool uiBlocking(void);
void uiOpenNpc(Ent *e);
void uiOpenText(const char *ti, const char *tx, const char *sub);
void uiOpenPanel(int m);
void uiClose(void);
void msg(const char *fmt, ...);
void banner(const char *a, const char *b);
void chatLog(const char *who, const char *s, int sys);
void uiMinimapDirty(void);
void uiTitleInit(void);
extern int PM;
enum { PM_NONE, PM_NPC, PM_TXT, PM_SHOP, PM_SMITH, PM_ALCH, PM_INV, PM_QUEST, PM_DIARY, PM_PAUSE, PM_TITLE, PM_DIFF, PM_DEAD, PM_EXITASK, PM_CASINO, PM_MAP, PM_HELP, PM_CONFIRM, PM_NET, PM_CHAT, PM_PLAYERS, PM_SELLRES, PM_ARENA, PM_PLUG, PM_X, PM_DEV };

/* ---------------- gioco ---------------- */
void gameInit(void);
void gameUpdate(float dt);
void newGame(int df, const char *name);
bool loadGame(void);
void saveGame(void);
bool hasSave(void);
void deleteSave(void);
int atkV(void), defV(void), critV(void), maxHP(void), needXP(void);
void recalc(void);
void gainXP(int x);
void act(Ent *e);
void npcMarks(void);
int qAvail(int nid);
bool qReady(const Quest *q);
void qRew(int id, int *g, int *x);
void qAccept(int nid, int id);
void qTurn(int qi);
void qProg(const Quest *q, char *out, int n);
void storyStep(int s);
void storyObj(char *out, int n);
bool pay(int c);
void gain(Item it);
int px(const char *k, int b);
int upc(const Item *it);
void eqp(int i);
void sellItem(int i);
int sellAll(bool all);
void heroAttackBtn(void);
void heroInteractBtn(void);
void dodge(void);
void lunge(void);
void areaAtk(void);
void potion(void);
extern Ent *IT;
extern Ent *TGT;
extern float shake;
void flt(float x, float y, const char *s, u32 c);
void fxRing(float x, float y, float r, float t, u32 c);
void dungeonClearExit(Ent *po);
void goZone(const char *to);
int gDay(void);
float gHour(void);
void gClock(char *out);
int nearestEnemy(float maxd);
int nearestPeer(float maxd);
const char *lgName(void);
float potCD(void);
int dayEvent(void);
bool isOffer(const char *k);
bool inPit(float x, float y);
void hurtPvp(int d, bool cr, const char *from, const char *n);
void heroEqPack(int *c, int *h, int *w, int *s, int *tw, int *th, int *tc, int *ts);

typedef struct { u8 k; float x, y, r, t, mx, dmg, x2, y2; u32 c; } Fx;
typedef struct { float x, y, t; u32 c; char s[24]; } Pop;
typedef struct { float x, y, vx, vy, t, d; u32 c; } Proj;
typedef struct { float x, y, z, vx, vy, vz, t, mx; u32 c; float s; } Part;
enum { FX_RING, FX_WARN, FX_BOOM, FX_TRAIL, FX_AREA, FX_ARC };
extern Ent *LOCK;
void lockNext(void);
void heroAttackRelease(void);
const char *cbMoveName(void);
const char *cbHeavyName(void);
float cbCharge(void);
float cbHeavyCd(void);
extern Fx FX[64]; extern int NFX;
extern Pop POP[48]; extern int NPOP;
extern Proj PJ[64]; extern int NPJ;
extern Part PARTS[256]; extern int NPARTS;
void sparks(float x, float y, int n, u32 c, float sp);

/* ---------------- multigiocatore ---------------- */
typedef struct {
	bool used;
	char id[16], n[16], rm[64];
	float x, y, tx, ty, mv;
	int hp, mx, lv, fa, c, h, w, s, wv, swc;
	int tw, th, tc, ts;
	float sw, fl, bt;
	char bub[64]; int sayN;
	// 3DS 1.5: cavallo, animale, compagno, titolo e record della corsa degli altri (come li manda il browser)
	s8 cavB, cavC, aniT; char aniN[16]; float ax, ay, ait; int afc;
	int cpT; char cpN[24]; float cx, cy, ctx, cty, chp, catkT, cmvT, cfd[2]; u8 clv, catk; int cfc;
	char tt[32]; float crb;
	// nemici condivisi (7.41)
	bool sy; float za; int ehSeq;
	u8 cvr; s16 cvh;
} Peer;
#define MAXPEER 24
extern Peer PEERS[MAXPEER];
typedef struct { char url[128]; char code[20]; bool on; } NetCfg;
extern NetCfg NETC;
extern bool netOk;
extern char netStatus[64];
extern float netPing;
void netInit(void);
void netExit(void);
void netStart(void);
void netStop(void);
void netTick(float dt);
void netSendChat(const char *s);
void netSendHit(const char *to, int d, bool cr);
void netSendKo(const char *by);
void netSendDgDone(const char *d, int run);
void netSendRaw(const char *json);
int netRuns(const char *d);

/* ---------------- plugin del server (plugins.c) ---------------- */
void plOnMsg(const char *pl, const char *ev, J *d);
void plOnConnect(void);
void plTick(float dt);
void plDrawTop(void);
void plBossHurt(Ent *e, int d, bool cr);
bool plMate(const char *id);
bool plHidePeer(const Peer *o);
bool plCard(const char **ti, const char **tx, const char **si, const char **no);
bool plPanelAlt(int arg);
bool plChatFilter(const char *n, const char *s, bool adm);
void plCardAnswer(bool yes);
void plBuildPanel(void);
int plPanelAct(int arg);
bool plPanelBack(void);
void plPanelPage(int p);
extern float gMS;

/* ---------------- audio ---------------- */
void auInit(void);
void auExit(void);
void music(int track);
int musicFor(const char *mus);
// musiche del gioco originale (music.c, da romfs:/music.json) e sintetizzatore (audio.c)
typedef struct { s8 w, w2; float m2, v2, det, a, s, dec, lp, r; u8 le, vib; } InsDef;
void musInit(const char *path);
void musicSet(int track);
int zoneMusic(int zmus);
float musFade(double now);
void musAdvance(double now, double ahead);
const InsDef *musIns(int i);
void synIns(double t0, float midi, float dur, int ins, float vol, bool rv);
void synNote(double t0, float midi, float dur, int wave, float vol, float att);
void synDrum(double t0, char c, float v);
extern int MUS_MENU, MUS_BOSS, MUS_TOWN, MUS_NOTTE;
void tone(float f, float d, int wave, float v);
void jingle(const int *ns, int n, float sp, int wave);
void whoosh(void);
enum { W_SQUARE, W_TRIANGLE, W_SAW, W_SINE, W_NOISE };
#define JINGLE(sp, wave, ...) do { static const int _j[] = {__VA_ARGS__}; jingle(_j, sizeof(_j)/sizeof(int), sp, wave); } while (0)
extern float VOL_MUS, VOL_SFX;
extern bool MUS_ON;

/* ---------------- impostazioni ---------------- */
typedef struct { u8 names, dmg, mini, muOn; float mu, sf; float zoom; u8 lefty, autoAtk, shad; u8 tapMove, fps, uiSize, vib; } Settings;   // Vita: tocca per muoverti, fotogrammi, grandezza interfaccia
extern Settings SET;
void setSave(void);
void setLoad(void);

int enemyIdx(const char *id);
extern int NDG;
#include "story.h"
/* ---------------- pannello sviluppatore (dev.c, 8.5) ---------------- */
typedef struct { bool god, oneHit, sta, nocd, ghost, pause, grid, info; float speed; } DevState;
extern DevState DEV;
void devOpen(void);
void devBuild(void);
int devAct(int arg, int dir);
void devDrawWorld(void);
void devDrawOverlay(void);
void uiDevOpt(const char *l, const char *r, int arg, u32 col, bool dis);
void uiXTitle(const char *ti, const char *body);
void rFlat(float x, float y, float z, float w, float d, u32 c, u8 a);
int zoneCount(void);
const char *zoneKeyAt(int i);
int musCount(void);
const char *musName(int i);
extern float FPS;
#endif
