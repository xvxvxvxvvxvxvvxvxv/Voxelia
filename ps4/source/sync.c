// Voxelia PS4 (motore dei port 3DS e Vita) - in rete tutti vedono gli stessi nemici (7.41, src/8zzp_sync.js della versione browser).
// Ogni nemico ha un «padrone» che lo muove e combatte; gli altri ne vedono la copia esatta:
// - i nemici della zona li guida chi è nella zona da più tempo; se esce, li prende chi resta;
// - i nemici attaccano l'eroe più vicino e i colpi arrivano a chi li prende; i colpi di tutti arrivano al padrone;
// - quando un nemico cade, cade per tutti: chi ha combattuto (o era vicino) prende la sua parte.
// Stessi campi del browser nel messaggio "p": sy, za, es, dd, eh.
#include "voxelia.h"

extern const char *netMyId(void);
extern void hurtEnemyRaw(Ent *e, int d, bool cr);
static struct { bool on, host; float age; char rk[64]; int n; } SY;
static struct { char g[24]; float t; } DD[24]; static int NDD;
static struct { char pid[16]; float at; int seq; float t; } EH[16]; static int NEH, EHS;
static int lastEh[MAXPEER];

bool syncOn(void) { return netOk && NETC.code[0] && started; }
static bool peerHere(Peer *o, const char *rk) { return o->used && o->sy && !strcmp(o->rm, rk); }
// chi guida i nemici della zona: chi c'è da più tempo (a parità, l'id più piccolo)
static bool isHostId(const char *id, float za) {
	char rk[64]; rmKey(rk, sizeof rk);
	const char *best = netMyId(); float ba = SY.age;
	for (int i = 0; i < MAXPEER; i++) { Peer *o = &PEERS[i]; if (!peerHere(o, rk)) continue; if (o->za > ba + .6f || (fabsf(o->za - ba) <= .6f && strcmp(o->id, best) < 0)) { ba = o->za; best = o->id; } }
	(void)za; return !strcmp(best, id);
}
static void gidOf(Ent *e) { if (!e->sg[0]) snprintf(e->sg, sizeof e->sg, "%s.%x", netMyId(), ++SY.n); }
// un nemico mio che cade: lo sanno tutti
void syncKilled(Ent *e) {
	if (!syncOn() || !e->sg[0] || e->pup || e->own == -2) return;
	if (NDD >= 24) { memmove(DD, DD + 1, sizeof DD[0] * 23); NDD = 23; }
	snprintf(DD[NDD].g, sizeof DD[0].g, "%s", e->sg); DD[NDD].t = gtime; NDD++;
}
// un nemico che guido io colpisce un altro eroe
void syncEH(const char *pid, float at) {
	if (!syncOn()) return;
	if (NEH >= 16) { memmove(EH, EH + 1, sizeof EH[0] * 15); NEH = 15; }
	snprintf(EH[NEH].pid, sizeof EH[0].pid, "%s", pid); EH[NEH].at = roundf(at * 10) / 10; EH[NEH].seq = ++EHS; EH[NEH].t = gtime; NEH++;
}
// i nemici della zona sono quelli che ci sono quando si entra
void syncZoneLoad(void) {
	rmKey(SY.rk, sizeof SY.rk); SY.age = 0;
	for (int i = 0; i < NENT; i++) if (ents[i].k == K_EN && !ents[i].wb) ents[i].zn = 1;
	memset(lastEh, 0, sizeof lastEh);
}
// quello che il gioco manda agli altri, insieme alla posizione dell'eroe
void syncPack(char *out, int n) {
	out[0] = 0; if (!syncOn()) return;
	JW w = {out, 0, n};
	jwf(&w, ",\"sy\":1,\"za\":%.1f,\"es\":[", SY.age);
	int k = 0;
	for (int i = 0; i < NENT && w.n < n - 200; i++) {
		Ent *e = &ents[i];
		if (e->k != K_EN || e->pup || e->hp <= 0 || e->wb) continue;
		if (e->zn && (!SY.host || SY.age < 1.5f)) continue;
		gidOf(e);
		int fl = (e->boss ? 1 : 0) | (e->al ? 2 : 0) | (gtime - e->atkT < .3f ? 4 : 0) | (e->enr ? 8 : 0) | (e->zn ? 16 : 0);
		if (k++) jwRaw(&w, ",");
		jwRaw(&w, "["); jwStr(&w, e->sg); jwRaw(&w, ","); jwStr(&w, E[e->t].id);
		jwf(&w, ",%.2f,%.2f,%d,%d,%d,", e->px, e->py, (int)fmaxf(0, roundf(e->hp)), (int)roundf(e->mx), fl);
		if (strcmp(e->name, E[e->t].n)) jwStr(&w, e->name); else jwRaw(&w, "0");
		jwf(&w, ",%.2f,%.2f,%d]", gtime - e->atkT < .3f ? e->atkD[0] : 0, gtime - e->atkT < .3f ? e->atkD[1] : 0, ZLV);
	}
	jwRaw(&w, "],\"dd\":[");
	int m = 0; for (int i = 0; i < NDD; i++) if (gtime - DD[i].t < 3) { if (m++) jwRaw(&w, ","); jwStr(&w, DD[i].g); }
	jwRaw(&w, "],\"eh\":[");
	m = 0; for (int i = 0; i < NEH; i++) if (gtime - EH[i].t < 3) { if (m++) jwRaw(&w, ","); jwRaw(&w, "["); jwStr(&w, EH[i].pid); jwf(&w, ",%.1f,%d]", EH[i].at, EH[i].seq); }
	jwRaw(&w, "]");
}
static Ent *byGid(const char *g) { for (int i = 0; i < NENT; i++) if (ents[i].k == K_EN && ents[i].sg[0] && !strcmp(ents[i].sg, g)) return &ents[i]; return NULL; }
extern void hurtPfrom(float at);
// lo stato dei nemici degli altri (dal messaggio "s" del server)
void syncOnState(J *peers) {
	if (!syncOn()) return;
	char rk[64]; rmKey(rk, sizeof rk);
	if (strcmp(rk, SY.rk)) return;   // appena cambiato zona: aspetto il caricamento
	const char *me = netMyId();
	// i colpi dei nemici degli altri che arrivano a me
	JFOR(q, peers) {
		Peer *o = NULL; for (int i = 0; i < MAXPEER; i++) if (PEERS[i].used && !strcmp(PEERS[i].id, q->key)) o = &PEERS[i];
		if (!o || strcmp(o->rm, rk)) continue;
		int pi = o - PEERS;
		JFOR(h, jget(q, "eh")) { int seq = (int)jnum(jat(h, 2), 0); if (seq <= lastEh[pi]) continue; lastEh[pi] = seq; if (!strcmp(jstr(jat(h, 0), ""), me) && P.hp > 0) hurtPfrom((float)jnum(jat(h, 1), 1)); }
	}
	// chi guida la zona e i nemici morti
	J *hostEs = NULL; static char dead[48][24]; int nd = 0;
	JFOR(q, peers) {
		Peer *o = NULL; for (int i = 0; i < MAXPEER; i++) if (PEERS[i].used && !strcmp(PEERS[i].id, q->key)) o = &PEERS[i];
		if (!o || strcmp(o->rm, rk) || !o->sy) continue;
		JFOR(g, jget(q, "dd")) if (nd < 48) snprintf(dead[nd++], 24, "%s", jstr(g, ""));
		if (!SY.host && isHostId(o->id, o->za) && o->za >= 1.5f && jget(q, "es")) hostEs = jget(q, "es");
	}
	// non guido più la zona: i miei nemici della zona lasciano il posto a quelli di chi la guida
	if (!SY.host && hostEs) for (int i = 0; i < NENT; i++) { Ent *e = &ents[i]; if (e->k == K_EN && e->zn && !e->pup && !e->wb) entDel(e); }
	// le copie
	JFOR(q, peers) {
		Peer *o = NULL; for (int i = 0; i < MAXPEER; i++) if (PEERS[i].used && !strcmp(PEERS[i].id, q->key)) o = &PEERS[i];
		if (!o || strcmp(o->rm, rk) || !o->sy) continue;
		JFOR(r, jget(q, "es")) {
			if (r->t != JARR || r->n < 7) continue;
			const char *g = jstr(jat(r, 0), ""); if (!g[0]) continue;
			bool isDead = false; for (int k = 0; k < nd; k++) if (!strcmp(dead[k], g)) isDead = true;
			if (isDead) continue;
			Ent *e = byGid(g);
			if (e && !e->pup) continue;   // è mio
			if (!e) {
				int t = enemyIdx(jstr(jat(r, 1), "")); if (t < 0) continue;
				float x = (float)jnum(jat(r, 2), 0), y = (float)jnum(jat(r, 3), 0);
				int lv0 = ZLV, lv = (int)jnum(jat(r, 10), ZLV); ZLV = lv;
				e = mkEn(t, clampi((int)x, 0, N - 1), clampi((int)y, 0, N - 1)); ZLV = lv0;
				if (!e) continue;
				e->champ = 0; e->scl = 0; snprintf(e->name, sizeof e->name, "%s", E[t].n);   // il Campione lo dice il padrone (nel nome)
				snprintf(e->sg, sizeof e->sg, "%s", g); e->pup = 1; e->px = x; e->py = y; e->ntx = x; e->nty = y;
				const char *nm = jstr(jat(r, 7), NULL); if (nm && jat(r, 7)->t == JSTR) snprintf(e->name, sizeof e->name, "%s", nm);
				e->zn = ((int)jnum(jat(r, 6), 0) & 16) ? 1 : 0;
			}
			int fl = (int)jnum(jat(r, 6), 0);
			e->ntx = (float)jnum(jat(r, 2), e->ntx); e->nty = (float)jnum(jat(r, 3), e->nty);
			float mx = (float)jnum(jat(r, 5), e->mx), hp = (float)jnum(jat(r, 4), e->hp);
			if (mx > 0) e->mx = mx;
			if (hp < e->hp || e->hme <= 0 || gtime - e->hme > .6f) e->hp = fmaxf(1, hp);
			e->al = (fl & 2) != 0; e->enr = (fl & 8) != 0; if (fl & 1) e->boss = 1;
			if ((fl & 4) && !(gtime - e->atkT < .3f)) { e->atkT = gtime; e->atkD[0] = (float)jnum(jat(r, 8), 0); e->atkD[1] = (float)jnum(jat(r, 9), 0); e->face = faceOf(e->atkD[0], e->atkD[1]); }
			snprintf(e->res, sizeof e->res, "%.15s", o->id);   // il padrone
			e->rt = gtime;   // visto adesso
		}
	}
	// le copie dei nemici caduti: cadono anche qui (con la tua parte, se hai combattuto o eri vicino)
	for (int i = 0; i < NENT; i++) {
		Ent *e = &ents[i]; if (e->k != K_EN || !e->pup) continue;
		bool isDead = false; for (int k = 0; k < nd; k++) if (!strcmp(dead[k], e->sg)) isDead = true;
		if (!isDead) continue;
		bool near = hyp(e->px - P.px, e->py - P.py) < 10 || (e->hme > 0 && gtime - e->hme < 20);
		if (near) { e->hp = 0; e->pup = 0; e->own = -2; extern void killEnemy(Ent *); killEnemy(e); } else entDel(e);
	}
}
void syncTick(float dt) {
	if (!syncOn()) {
		if (SY.on) { SY.on = false; for (int i = 0; i < NENT; i++) if (ents[i].k == K_EN && ents[i].pup) entDel(&ents[i]); }
		return;
	}
	char rk[64]; rmKey(rk, sizeof rk);
	if (strcmp(rk, SY.rk)) { snprintf(SY.rk, sizeof SY.rk, "%s", rk); SY.age = 0; }
	SY.age += dt; SY.on = true;
	bool was = SY.host; SY.host = isHostId(netMyId(), SY.age);
	for (int i = 0; i < NENT; i++) {
		Ent *e = &ents[i]; if (e->k != K_EN || !e->pup) continue;
		e->fl -= dt;
		// il padrone c'è ancora?
		bool ownHere = false; for (int k = 0; k < MAXPEER; k++) if (peerHere(&PEERS[k], rk) && !strcmp(PEERS[k].id, e->res)) ownHere = true;
		float miss = gtime - e->rt;
		if (ownHere && miss > .6f) { entDel(e); continue; }
		if (!ownHere) { if (e->zn && SY.host) { e->pup = 0; e->res[0] = 0; e->cdt = e->cd; continue; } if (!e->zn && miss > .8f) { entDel(e); continue; } continue; }
		float dx = e->ntx - e->px, dy = e->nty - e->py, d = hyp(dx, dy);
		if (d > 6) { e->px = e->ntx; e->py = e->nty; }
		else if (d > .01f) { float k = fminf(1, dt * 12); e->px += dx * k; e->py += dy * k; e->face = faceOf(dx, dy); e->mvT = gtime; }
		if (e->boss && e->al && !e->intro && hyp(e->px - P.px, e->py - P.py) < e->ag) { e->intro = 1; banner(e->name, "Un nemico potente ti sbarra la strada!"); }
	}
	if (was != SY.host && SY.host) for (int i = 0; i < NENT; i++) { Ent *e = &ents[i]; if (e->k == K_EN && e->pup && e->zn) { bool ownHere = false; for (int k = 0; k < MAXPEER; k++) if (peerHere(&PEERS[k], rk) && !strcmp(PEERS[k].id, e->res)) ownHere = true; if (!ownHere) { e->pup = 0; e->res[0] = 0; } } }
}
// i miei nemici attaccano l'eroe più vicino: anche un altro giocatore
Peer *syncNearestPeer(Ent *e, float dMe) {
	if (!syncOn()) return NULL;
	char rk[64]; rmKey(rk, sizeof rk); Peer *b = NULL; float bd = dMe;
	for (int i = 0; i < MAXPEER; i++) { Peer *o = &PEERS[i]; if (!o->used || strcmp(o->rm, rk) || o->hp <= 0) continue; float d = hyp(o->x - e->px, o->y - e->py); if (d < bd) { bd = d; b = o; } }
	return b;
}
bool syncIsHost(void) { return SY.host; }
