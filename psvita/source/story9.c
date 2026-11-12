// Voxelia PS Vita (motore del port 3DS) - la difficoltà della Modalità Storia del browser:
// - 7.11 (src/storia/8v_sfida.js): nemici più forti per difficoltà, i Campioni, i branchi, l'ultima furia dei boss;
// - 8.1 (src/combattimento/8zzzzk_bilancio.js): al massimo 2 Campioni per piano (3 con il boss), niente chimere-Campioni;
// - 8.3: i nemici partono 2 livelli sopra il dungeon e recuperano il 60% della distanza dal tuo livello; più Campioni
//   ai livelli alti (fino al +12%, limite 2 + 1 ogni 10 livelli); i prezzi salgono del 2% a livello dal 5.
#include "voxelia.h"

static const float HARD[4][2] = {{1.1f, 1.1f}, {1.2f, 1.2f}, {1.3f, 1.3f}, {1.3f, 1.3f}};
// le zone che seguono il tuo livello: dungeon e zone aperte (non la città, l'arena, gli interni, la Torre)
static bool scala83(const char *k, int lv0) {
	if (!strcmp(k, "town") || !strcmp(k, "arena") || !strncmp(k, "torre", 5) || ZINT) return false;
	return ZDG >= 0 || lv0 > 0;
}
int lv83(const char *k, int lv0) {
	if (!scala83(k, lv0)) return lv0;
	int b = lv0 + 2, pl = P.lv;
	return pl > b ? (int)roundf(b + (pl - b) * .6f) : b;
}
static int camp83(void) { return 2 + P.lv / 10; }
static float eliteP(void) {
	if (ZINT || !strcmp(Zk, "town") || !strcmp(Zk, "arena") || !strncmp(Zk, "torre", 5)) return 0;
	float p = 0;
	if (ZDG >= 0) { bool bossFl = ZDN >= DG[ZDG].fls; p = fminf(.2f, .08f + .025f * ZRUN + (bossFl ? .02f : 0)); }
	else if (ZOUT && ZLV0 > 0) p = .04f;
	if (p > 0) p = fminf(.32f, p + fminf(.12f, fmaxf(0, P.lv - 5) * .004f));
	return p;
}
static void eliteMk(Ent *e) {
	e->hp = e->mx = roundf(e->mx * 1.9f); e->at *= 1.3f; e->sp *= 1.1f; e->cd *= .92f; e->xp *= 2.5f; e->scl = 1.14f; e->champ = 1;
	char b[48]; snprintf(b, sizeof b, "Campione · %s", e->name); snprintf(e->name, sizeof e->name, "%s", b);
}
void hardMk(Ent *e) {
	bool dg = ZDG >= 0; const float *k = HARD[clampi(P.df, 0, 3)];
	float qh = dg ? k[0] : 1 + (k[0] - 1) * .75f, qa = dg ? k[1] : 1 + (k[1] - 1) * .75f;
	e->hp = e->mx = roundf(e->mx * qh * (e->boss ? 1.15f : 1)); e->at *= qa; e->ag *= dg ? 1.15f : 1.08f;
	float p = eliteP();
	if (p > 0 && !e->boss) { char h[64]; snprintf(h, sizeof h, "%s|%d|%d|%s", Zk, ZRUN, e->id, E[e->t].id); if ((hs(h) % 1000) / 1000.f < p) eliteMk(e); }
}
static float banT = -1; static char banA[48], banB[96];
// dopo il caricamento: il limite dei Campioni e l'avviso con il livello dei nemici
void hardZone(void) {
	bool boss = false; for (int i = 0; i < NENT; i++) if (ents[i].k == K_EN && ents[i].boss) boss = true;
	int max = camp83() + (boss ? 1 : 0), n = 0;
	for (int i = 0; i < NENT; i++) { Ent *e = &ents[i]; if (e->k != K_EN || !e->champ) continue;
		if (++n > max) { e->champ = 0; e->hp = e->mx = roundf(e->mx / 1.9f); e->at /= 1.3f; e->sp /= 1.1f; e->cd /= .92f; e->xp /= 2.5f; e->scl = 0; snprintf(e->name, sizeof e->name, "%s", E[e->t].n); } }
	if (ZDG >= 0 && ZLV != ZLV0) {
		int rec = ZLV0 + 3; bool low = P.lv < rec;
		snprintf(banA, sizeof banA, "%sNemici di livello %d", low ? "! " : "", ZLV);
		if (low) snprintf(banB, sizeof banB, "Livello consigliato %d · sei sotto: vai piano", rec);
		else snprintf(banB, sizeof banB, "Livello consigliato %d · Campioni fino a %d per piano", rec, max);
		banT = gtime + 3.2f;
	} else if (ZDG >= 0) {
		int rec = ZLV0 + 3; bool low = P.lv < rec;
		snprintf(banA, sizeof banA, "%sNemici di livello %d", low ? "! " : "", ZLV);
		snprintf(banB, sizeof banB, low ? "Livello consigliato %d · sei sotto: vai piano" : "Livello consigliato %d", rec);
		banT = gtime + 3.2f;
	}
}
// i branchi e l'ultima furia dei boss
void hardTick(float dt) {
	(void)dt;
	if (banT > 0 && gtime >= banT) { banT = -1; banner(banA, banB); }
	float R2 = ZDG >= 0 ? 4.5f : 3.2f;
	for (int i = 0; i < NENT; i++) {
		Ent *e = &ents[i]; if (e->k != K_EN || e->pup) continue;
		if (e->al && !e->pk) { e->pk = 1; for (int k = 0; k < NENT; k++) { Ent *o = &ents[k]; if (o != e && o->k == K_EN && !o->al && !o->pup && !E[o->t].np && hyp(o->px - e->px, o->py - e->py) < R2) { o->al = 1; o->pk = 1; } } }
		if (e->boss && e->enr && !e->cho && e->hp <= e->mx * .25f && !e->fury) { e->fury = 1; e->sp *= 1.12f; e->cd *= .85f; flt(e->px, e->py, "Ultima furia!", 0xff4a3a); }
	}
}
// 8.3: il mercato segue il tuo livello (+2% a livello dal 5)
float mer83(void) { return 1 + fmaxf(0, P.lv - 5) * .02f; }
