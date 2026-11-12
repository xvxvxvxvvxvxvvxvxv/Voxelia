// Voxelia 3DS 1.5 - gli incroci dei compagni (7.47, src/8zzzp_incroci.js) e le varianti (7.54, src/8zzzz_compagni.js).
// Due compagni dal livello 5 fanno un uovo che si schiude in tre minuti: il piccolo ha la forma del primo genitore,
// la media della forza dei due (un po' di più, molto di più con una mutazione) e a volte una variante di colore.
#include "voxelia.h"

#define C_TXT C2D_Color32(232, 236, 244, 255)
#define C_MU C2D_Color32(154, 164, 184, 255)
#define C_GOLD C2D_Color32(245, 185, 66, 255)
typedef struct { const char *k, *n; u8 r; float w; } Var;
static const Var PVR[14] = {{"cromatica", "Cromatica", 0, 26}, {"perla", "Perla", 0, 12}, {"corallo", "Corallo", 0, 10}, {"smeraldo", "Smeraldo", 1, 8}, {"ghiaccio", "Ghiaccio", 1, 8},
	{"ombra", "Ombra", 1, 7}, {"neon", "Neon", 1, 6}, {"tempesta", "Tempesta", 2, 5}, {"magma", "Magma", 2, 5}, {"spettro", "Spettro", 2, 4}, {"oro", "Oro", 3, 3.4f}, {"stellare", "Stellare", 3, 2.6f},
	{"diamante", "Diamante", 4, 1.2f}, {"rgb", "RGB", 4, .8f}};
static const float PVT[5] = {.05f, .08f, .12f, .18f, .25f};
const char *pvName(int v) { return v >= 1 && v <= 14 ? PVR[v - 1].n : ""; }
float pvBonus(const XPet *p) { return p->vr >= 1 && p->vr <= 14 ? PVT[PVR[p->vr - 1].r] : 0; }
int pvKey(const char *k) { for (int i = 0; i < 14; i++) if (k && !strcmp(PVR[i].k, k)) return i + 1; return 0; }
const char *pvKeyOf(int v) { return v >= 1 && v <= 14 ? PVR[v - 1].k : ""; }
// il colore della variante (stesse formule HSL del browser), usato da drawModelFrame quando gVar è acceso
u8 gVar; s16 gVarH;
void pvSet(int v, int vh) { gVar = (u8)v; gVarH = (s16)vh; }
static void rgb2hsl(u32 c, float *h, float *s, float *l) {
	float r = ((c >> 16) & 255) / 255.f, g = ((c >> 8) & 255) / 255.f, b = (c & 255) / 255.f, mx = fmaxf(r, fmaxf(g, b)), mn = fminf(r, fminf(g, b));
	*l = (mx + mn) / 2; if (mx == mn) { *h = *s = 0; return; }
	float d = mx - mn; *s = *l > .5f ? d / (2 - mx - mn) : d / (mx + mn);
	*h = mx == r ? (g - b) / d + (g < b ? 6 : 0) : mx == g ? (b - r) / d + 2 : (r - g) / d + 4; *h *= 60;
}
static float hue(float p, float q, float t) { if (t < 0) t += 1; if (t > 1) t -= 1; if (t < 1 / 6.f) return p + (q - p) * 6 * t; if (t < .5f) return q; if (t < 2 / 3.f) return p + (q - p) * (2 / 3.f - t) * 6; return p; }
static u32 hsl2rgb(float h, float s, float l) {
	h = fmodf(fmodf(h, 360) + 360, 360) / 360; s = clampf(s, 0, 1); l = clampf(l, 0, 1);
	float r, g, b; if (s == 0) r = g = b = l; else { float q = l < .5f ? l * (1 + s) : l + s - l * s, p = 2 * l - q; r = hue(p, q, h + 1 / 3.f); g = hue(p, q, h); b = hue(p, q, h - 1 / 3.f); }
	return ((u32)(r * 255) << 16) | ((u32)(g * 255) << 8) | (u32)(b * 255);
}
u32 pvColor(u32 c) {
	if (!gVar) return c;
	float h, s, l; rgb2hsl(c, &h, &s, &l); float H = h, S = s, L = l;
	switch (gVar) {
	case 1: H = h + (gVarH ? gVarH : 180); S = fminf(1, s * 1.15f + .1f); break;
	case 2: S = s * .12f; L = .74f + .2f * l; break;
	case 3: H = 8 + l * 14; S = .78f; L = .42f + .36f * l; break;
	case 4: H = 145; S = .68f; L = .16f + .46f * l; break;
	case 5: H = 198; S = .58f; L = .52f + .4f * l; break;
	case 6: H = 270; S = .42f; L = .05f + .2f * l; break;
	case 7: H = fmodf(h + 150, 360); S = 1; L = .5f + .12f * l; break;
	case 8: H = 218; S = .2f; L = .12f + .42f * l; break;
	case 9: if (l < .45f) { H = 12; S = .32f; L = .07f + .18f * l; } else { H = 18 + 50 * (l - .45f); S = 1; L = .5f; } break;
	case 10: H = 176; S = .45f; L = .7f + .22f * l; break;
	case 11: H = 44; S = .86f; L = .28f + .46f * l; break;
	case 12: H = 235; S = .62f; L = .09f + .26f * l; break;
	case 13: H = 188; S = .55f; L = .66f + .3f * l; break;
	case 14: H = fmodf(((int)(gtime * 4) % 12) * 30 + l * 140, 360); S = .95f; L = .48f + .16f * l; break;
	}
	return hsl2rgb(H, S, L);
}
static int pvRoll(int va, int vb) {
	float r = frnd(); if (va && va == vb && r < .5f) return va; if (va && r < .25f) return va; if (vb && r > .75f) return vb;
	if (frnd() > .45f) return 0;
	float tot = 0; for (int i = 0; i < 14; i++) tot += PVR[i].w; float x = frnd() * tot; for (int i = 0; i < 14; i++) if ((x -= PVR[i].w) < 0) return i + 1; return 1;
}
static void incName(const char *a, const char *b, char *out, int n) {
	char x[24], y[24]; snprintf(x, sizeof x, "%s", a); char *sp = strchr(x, ' '); if (sp) *sp = 0;
	const char *yb = strrchr(b, ' '); snprintf(y, sizeof y, "%s", yb ? yb + 1 : b);
	int lx = (int)strlen(x), hx = lx / 2 + (lx & 1); if (hx < 2) hx = 2; if (hx > lx) hx = lx; int ly = (int)strlen(y);
	snprintf(out, n, "%.*s%s", hx, x, y + ly / 2); if (out[0] >= 'a' && out[0] <= 'z') out[0] -= 32; if ((int)strlen(out) > 16) out[16] = 0;
}
static int IA = -1, IB = -1;
static int incCost(const XPet *p, const XPet *q) { return (int)roundf(300 + 25 * (p->lv + q->lv)); }
void incTick(float dt) {
	(void)dt;
	if (!X.egA[0] || xNowUTC() < X.egT || !started || X.npet >= 12) return;
	XPet *p = &X.pets[X.npet]; memset(p, 0, sizeof *p);
	bool mu = frnd() < .15f;
	snprintf(p->t, sizeof p->t, "%s", X.egA); snprintf(p->tb, sizeof p->tb, "%s", X.egB); p->mu = mu ? 2 : 1;
	char nm[24]; incName(X.egNa, X.egNb, nm, sizeof nm); snprintf(p->n, sizeof p->n, "%s%s", nm, mu ? " *" : "");
	p->lv = 1; p->elv = 1; p->sz = .9f + frnd() * .25f; p->hp = 1e6f;
	int v = pvRoll(X.egVa, X.egVb); p->vr = (u8)v; if (v == 1) p->vh = (s16)(60 + fri(0, 239));
	X.npet++; X.egA[0] = 0;
	char t[64]; snprintf(t, sizeof t, "È nato %s!", p->n);
	char b[96]; snprintf(b, sizeof b, "%s%s%s", mu ? "Una mutazione rara! " : "", v ? "Variante: " : "Lo trovi tra i compagni", v ? pvName(v) : "");
	banner(t, b); JINGLE(.08f, W_TRIANGLE, 60, 64, 67, 72, 76, 79, 84); sparks(P.px, P.py, 30, 0xffe28a, 110); saveGame();
}
static char IBD[400];
int incBuild(int page) {
	if (page != XP_INC) return crtBuild(page);
	snprintf(IBD, sizeof IBD, "Si scelgono due compagni domati (dal livello 5 in su) e, pagando, nasce un uovo che si schiude in tre minuti. Il piccolo prende la forma e la mossa del primo genitore, la forza di tutti e due e a volte una variante di colore.%s",
		X.egA[0] ? "\nC'è già un uovo che aspetta di schiudersi." : "");
	uiXTitle("Incroci", IBD);
	if (X.egA[0]) { double s = X.egT - xNowUTC(); char l[64]; snprintf(l, sizeof l, "L'uovo si schiude fra %d secondi%s", s > 0 ? (int)s : 0, X.npet >= 12 ? " (stalla piena)" : ""); uiXOpt(l, "", 0, C_MU, false); }
	for (int i = 0; i < X.npet; i++) { XPet *p = &X.pets[i]; char l[64]; snprintf(l, sizeof l, "%s (Lv %d)%s%s", p->n, p->lv, p->vr ? " · " : "", pvName(p->vr)); uiXOpt(l, i == IA ? "primo" : i == IB ? "secondo" : p->lv < 5 ? "Lv 5" : "", XARG(150, i), i == IA || i == IB ? C_GOLD : C_TXT, p->lv < 5); }
	if (IA >= 0 && IB >= 0 && IA < X.npet && IB < X.npet) { char r[24]; snprintf(r, sizeof r, "%d oro", incCost(&X.pets[IA], &X.pets[IB])); uiXOpt("Fai nascere l'uovo", r, XARG(151, 0), C_GOLD, X.egA[0] || P.g < incCost(&X.pets[IA], &X.pets[IB])); }
	uiXOpt("Chiudi", "", XARG(1, 0), 0, false);
	return 1;
}
int incAct(int a, int i) {
	if (a == 150) { if (i == IA) IA = -1; else if (i == IB) IB = -1; else if (IA < 0) IA = i; else IB = i; return 0; }
	if (a == 151) {
		if (IA < 0 || IB < 0 || IA == IB || X.egA[0]) return 0; XPet *p = &X.pets[IA], *q = &X.pets[IB]; int c = incCost(p, q);
		if (p->lv < 5 || q->lv < 5) { msg("I genitori devono essere almeno di livello 5"); return 0; } if (!pay(c)) return 0;
		snprintf(X.egA, sizeof X.egA, "%s", p->t); snprintf(X.egB, sizeof X.egB, "%s", q->t); snprintf(X.egNa, sizeof X.egNa, "%s", p->n); snprintf(X.egNb, sizeof X.egNb, "%s", q->n);
		X.egVa = p->vr; X.egVb = q->vr; X.egT = xNowUTC() + 180; IA = IB = -1;
		banner("Un uovo!", "Si schiude fra tre minuti"); JINGLE(.1f, W_TRIANGLE, 64, 67, 71); saveGame(); return 0;
	}
	return crtAct(a, i);
}
