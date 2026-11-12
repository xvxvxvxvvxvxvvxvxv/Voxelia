// Voxelia 3DS 1.5 - meccaniche della Storia arrivate dopo la 7.50 (story.c, story2.c)
#ifndef STORY_H
#define STORY_H

#define XMAGIC 0x31585856u   // "VXX1": estensione del salvataggio, scritta dopo l'eroe
#define XPETS 16

typedef struct { char t[24]; char n[24]; u8 lv, ko, el, elv; u16 xp; float hp, kt; u8 up[3], pad; char sh[24]; float sz; char tb[24]; u8 mu, vr; s16 vh; } XPet;
typedef struct { u8 t; char n[16]; } XAni;
typedef struct {
	u32 magic, size;
	// cavalli
	u8 cavOwn, cavSel, cavCol, cavOn;
	float cavBest[6]; char cavBestZ[6][16];
	// animali
	XAni ani[8]; u8 nani; s8 aniOn; u16 aniF;
	// compagni
	XPet pets[XPETS]; u8 npet; s8 pet; u16 seal;
	u32 bst[128]; u16 nbst; u16 srvB[2];
	// elementi
	u16 ess[10];
	// scelte: boss risparmiati (+1) o finiti (-1) per dungeon, dilemmi (somma, conteggi), doni degli alleati
	s8 bossCh[12]; s16 dilSum; u16 dilN, dilGen; char dilDay[12]; s8 dilLast;
	char giftDay[12]; u16 giftMask;
	// titoli: bit per titolo noto, quello scelto (-1 nessuno)
	u32 titles; s8 title;
	// il regno oltre il mare (7.48): punto del capitolo e i tre Sigilli di Giada
	u8 olS, olSig[3];
	// armi che crescono (7.44): maestria per arma (chiave dal nome e dal valore)
	struct { u32 key; u16 wx; u8 ml, fl; } wm[24];
	// diario delle scoperte (7.46)
	u32 dZ[200]; u16 ndZ; u32 dE[128]; u16 ndE; u32 dR[40]; u16 ndR; u16 dM; u8 dPg;
	// scavi del giorno (7.44), maledizioni (7.44), eventi a orario fatti (7.46)
	char dugDay[12]; u32 dug[24]; u8 ndug; u8 malDg, malK, malNoAsk; u32 evDone[8]; u32 evBS; u8 evBM;
	// il Serraglio (7.55): la pensione e l'uovo chimera
	XPet dep[30]; u8 ndep; char eggA[24], eggB[24]; u8 eggEl; double eggT; float depT;
	// i mestieri (7.47): ricette note, esperienza per mestiere, dispensa, pasto ed elisir in corso, tempra, risorse in più
	char egA[24], egB[24], egNa[24], egNb[24]; u8 egVa, egVb; double egT;   // incroci (7.47)
	u8 crt[57], crtSt, crtW[4]; u16 crtV, crtN;   // carte (7.47)
	u32 mkK; u16 mxp[3]; u8 cib[24]; s8 meal, eli; double mealU, eliU; struct { u32 key; u8 tp; } tmp[8]; ResCount xres[24];
	// spazio per le versioni dopo
	u8 future[64];
} HeroX;
extern HeroX X;

enum { XK_STALLA = 1, XK_GARA, XK_ANISHOP, XK_ANI, XK_PET, XK_VIAND, XK_ALLY, XK_SIG, XK_DIG, XK_MERC, XK_MET, XK_MEST, XK_TORRE, XK_CARTE };
enum { XP_STALLA = 1, XP_GARA, XP_ANI, XP_PETS, XP_CRON, XP_VIAND, XP_ALLY, XP_SPARE, XP_INF, XP_MARINA, XP_ORESTE, XP_NEREA, XP_DISC, XP_MAL, XP_MERC, XP_SERR, XP_MEST, XP_TORRE, XP_TORB, XP_INC, XP_CARTE };
#define XA_GO 40
#define XARG(a, i) ((a) * 256 + (i))
enum { EL_NONE, EL_FUOCO, EL_GHIACCIO, EL_FULMINE, EL_ACQUA, EL_VELENO, EL_TERRA, EL_VENTO, EL_OMBRA, EL_LUCE };

// story.c
void xNew(void);
void xSave(FILE *f);
bool xLoad(FILE *f);
void xModels(J *xm);
void xZoneLoad(void);
void xTick(float dt);
void xOnKill(Ent *dead);
bool xInteractable(Ent *e);
const char *xVerb(Ent *e);
void xAct(Ent *e);
void xDraw(Ent *e);
void xDrawWorld(void);
void xDrawLabels(void);
void xDrawHeroHorse(void);
void xDrawPeerExtras(Peer *o, int i);
void xDrawPeerHorse(Peer *o, bool mv, float ph);
bool xPeerMounted(Peer *o);
void xPeerParse(Peer *o, J *q, bool fresh);
void xPack(char *out, int n);
float xSpeedMul(void);
float xHeroZ(void);
bool cavOn(void);
void cavToggle(void);
void domTry(void);
Ent *domNear(void);
void domBuy(int n);
void domRestAll(void);
bool xPetAlive(u32 uid);
void xOpen(int page);
void xBuild(void);
int xPanelAct(int arg);
void xPauseOpts(void);
void xKbDone(const char *s);
int xPropKind(const char *k);
int xPropModel(const char *k);
// story2.c
int elOfEnemy(int t);
void elSetEnemy(Ent *e);
void elTick(float dt);
void elOnKill(Ent *dead);
const char *elName(int k);
u32 elCol(int k);
int itemEl(const Item *it);
int itemElLv(const Item *it);
void itemRollEl(Item *it);
float xPriceMul(void);
float xHpMul(void);
void chZoneLoad(void);
void chTick(float dt);
const char *titleNow(void);
bool chBossDown(Ent *e);
int xBuild2(int page);
int xPanelAct2(int a, int i);
void xSmithOpts(void);
bool xNpcStory(const char *nid);
void olOnKill(Ent *dead);
void olZoneLoad(void);
void olShrine(Ent *e);
const char *olStatus(void);
u32 rngSwap(u32 s);
J *dataRoot(void);
int heroRoll(float m, bool *cr);
// story3.c
double xNowUTC(void);
void xSetServerTime(double ms);
float wmMul(void);
void wmHit(void);
void wmLunge(void);
const char *wmTitle(const Item *it, int *ml);
int bossDmg(Ent *e, int d);
void bossTick(float dt);
bool bossStunned(Ent *e);
void discZone(void);
void discKill(int t);
void discRes(const char *k);
void digZoneLoad(void);
void digAct(Ent *e);
bool malAsk(Ent *po);
bool malOn(int k);
float malBonus(void);
void evZoneLoad(void);
void evTick(float dt);
void evOnKill(Ent *dead);
void evOnChest(Ent *e);
int xBuild3(int page);
int xBuild4(int page);
int xPanelAct4(int a, int i);
void serrTick(float dt);
int xBuild5(int page);
int xPanelAct5(int a, int i);
void mestTick(float dt);
void mestZoneLoad(void);
float mestXpMul(void);
float mestGoldMul(void);
float mestHpMul(void);
// story6.c: la Torre della Corona
bool torOn(void); bool torIsZone(const char *k); void torTick(float dt); void torKill(Ent *e); bool torDie(void); bool torExit(Ent *po);
float torDmgMul(void); float torCritAdd(void); float torHpMul(void); float torHurtMul(void); float torGoldMul(void); float torCdMul(void); void torOnHit(int d);
int torBuild(int page); int torAct(int a, int i);
// story7.c: incroci e varianti
int crtBuild(int page); int crtAct(int a, int i);
int incBuild(int page); int incAct(int a, int i); void incTick(float dt); float pvBonus(const XPet *p); const char *pvName(int v); void pvSet(int v, int vh); extern u8 gVar; extern s16 gVarH; bool zonePendingTor(void);
int xPanelAct3(int a, int i);
void x3DrawLabels(void);
// story9.c: la difficoltà della Storia (7.11, 8.1, 8.3)
int lv83(const char *k, int lv0); void hardMk(Ent *e); void hardZone(void); void hardTick(float dt); float mer83(void); extern int ZLV0;
// ui.c
void uiXTitle(const char *ti, const char *body);
void uiXOpt(const char *l, const char *r, int arg, u32 col, bool dis);
void uiLabel(float x, float y, float sc, u32 c, const char *s);
void uiKeyboardFor(int mode, const char *init);
void xHurtEnemy(Ent *e, int d, bool cr, int el);
void xHurtFromPet(Ent *pet, Ent *e, int d);
void titleAdd(int id);
int elKey(const char *s);
bool xSpot(int cx, int cy, float gap, int *ox, int *oy);
Ent *xEntNew(u8 xk, float x, float y);
// game.c
void hurtEnemyRaw(Ent *e, int d, bool cr);
void mv(float *px, float *py, float dx, float dy);
void killEnemy(Ent *e);
#endif
