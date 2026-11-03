// Voxelia 3DS - un piccolo lettore e scrittore JSON: per i dati esportati dalla versione browser
// (romfs) e per i messaggi del server multigiocatore.
#include "json.h"
#include <stdlib.h>
#include <string.h>
#include <stdio.h>

void jaInit(JArena *a, size_t cap) { a->buf = malloc(cap); a->cap = a->buf ? cap : 0; a->used = 0; }
void jaReset(JArena *a) { a->used = 0; }
void jaFree(JArena *a) { free(a->buf); a->buf = NULL; a->cap = a->used = 0; }
static void *jaAlloc(JArena *a, size_t n) {
	n = (n + 7) & ~(size_t)7;
	if (a->used + n > a->cap) return NULL;
	void *p = a->buf + a->used; a->used += n; return p;
}

typedef struct { const char *s, *e; JArena *a; int err; } P_;
static void ws(P_ *p) { while (p->s < p->e && (*p->s == ' ' || *p->s == '\n' || *p->s == '\r' || *p->s == '\t')) p->s++; }
static J *node(P_ *p, u8 t) { J *n = jaAlloc(p->a, sizeof(J)); if (!n) { p->err = 1; return NULL; } memset(n, 0, sizeof *n); n->t = t; return n; }
static void putU8(char **o, unsigned cp) {
	char *q = *o;
	if (cp < 0x80) *q++ = cp;
	else if (cp < 0x800) { *q++ = 0xC0 | (cp >> 6); *q++ = 0x80 | (cp & 63); }
	else { *q++ = 0xE0 | (cp >> 12); *q++ = 0x80 | ((cp >> 6) & 63); *q++ = 0x80 | (cp & 63); }
	*o = q;
}
static char *pstr(P_ *p) {
	p->s++;   // "
	const char *st = p->s; size_t n = 0;
	while (p->s < p->e && *p->s != '"') { if (*p->s == '\\') p->s++; p->s++; n++; }
	char *out = jaAlloc(p->a, n * 3 + 1), *o = out;
	if (!out) { p->err = 1; return NULL; }
	const char *q = st;
	while (q < p->s) {
		if (*q != '\\') { *o++ = *q++; continue; }
		q++;
		switch (*q) {
		case 'n': *o++ = '\n'; q++; break; case 't': *o++ = '\t'; q++; break; case 'r': q++; break;
		case 'b': case 'f': q++; break;
		case 'u': { unsigned cp = 0; for (int i = 1; i <= 4 && q + i < p->s; i++) { char c = q[i]; cp = cp * 16 + (c >= 'a' ? c - 'a' + 10 : c >= 'A' ? c - 'A' + 10 : c - '0'); }
			q += 5;
			if (cp >= 0xD800 && cp < 0xDC00) cp = '?';   // emoji: niente
			else if (cp >= 0xDC00 && cp < 0xE000) break;
			putU8(&o, cp); break; }
		default: *o++ = *q++;
		}
	}
	*o = 0;
	if (p->s < p->e) p->s++;
	return out;
}
static J *pval(P_ *p, int depth);
static J *pval(P_ *p, int depth) {
	ws(p);
	if (p->s >= p->e || depth > 40) { p->err = 1; return NULL; }
	char c = *p->s;
	if (c == '{' || c == '[') {
		J *n = node(p, c == '{' ? JOBJ : JARR); if (!n) return NULL;
		char close = c == '{' ? '}' : ']';
		p->s++; J *last = NULL;
		for (;;) {
			ws(p);
			if (p->s >= p->e) { p->err = 1; return n; }
			if (*p->s == close) { p->s++; break; }
			char *key = NULL;
			if (n->t == JOBJ) {
				if (*p->s != '"') { p->err = 1; return n; }
				key = pstr(p); ws(p);
				if (p->s < p->e && *p->s == ':') p->s++;
			}
			J *v = pval(p, depth + 1);
			if (!v) return n;
			v->key = key;
			if (last) last->next = v; else n->kid = v;
			last = v; n->n++;
			ws(p);
			if (p->s < p->e && *p->s == ',') p->s++;
		}
		return n;
	}
	if (c == '"') { J *n = node(p, JSTR); if (n) n->s = pstr(p); return n; }
	if (c == 't' || c == 'f') { J *n = node(p, JNUM); if (n) n->d = c == 't'; p->s += c == 't' ? 4 : 5; if (n) n->t = JBOOL; return n; }
	if (c == 'n') { J *n = node(p, JNULL); p->s += 4; return n; }
	J *n = node(p, JNUM); if (!n) return NULL;
	char *end; n->d = strtod(p->s, &end);
	if (end == p->s) { p->err = 1; p->s++; } else p->s = end;
	return n;
}
J *jParse(JArena *a, const char *s, size_t len) {
	P_ p = {s, s + len, a, 0};
	J *r = pval(&p, 0);
	return p.err && !r ? NULL : r;
}
J *jget(const J *o, const char *k) {
	if (!o || o->t != JOBJ) return NULL;
	for (J *c = o->kid; c; c = c->next) if (c->key && !strcmp(c->key, k)) return c;
	return NULL;
}
J *jat(const J *a, int i) { if (!a || (a->t != JARR && a->t != JOBJ)) return NULL; J *c = a->kid; while (c && i--) c = c->next; return c; }
double jnum(const J *n, double def) { return n && (n->t == JNUM || n->t == JBOOL) ? n->d : def; }
const char *jstr(const J *n, const char *def) { return n && n->t == JSTR ? n->s : def; }
double jgn(const J *o, const char *k, double def) { return jnum(jget(o, k), def); }
const char *jgs(const J *o, const char *k, const char *def) { return jstr(jget(o, k), def); }
u32 jcolor(const char *c, u32 def) {
	if (!c) return def;
	if (c[0] == '#') {
		unsigned v = 0; int n = strlen(c + 1);
		for (int i = 1; i <= n && i <= 6; i++) { char h = c[i]; v = v * 16 + (h >= 'a' ? h - 'a' + 10 : h >= 'A' ? h - 'A' + 10 : h - '0'); }
		if (n == 3) return ((v >> 8 & 15) * 17) << 16 | ((v >> 4 & 15) * 17) << 8 | (v & 15) * 17;
		return v;
	}
	int r = 0, g = 0, b = 0;
	if (sscanf(c, "rgb(%d,%d,%d", &r, &g, &b) == 3 || sscanf(c, "rgba(%d,%d,%d", &r, &g, &b) == 3) return (r << 16) | (g << 8) | b;
	return def;
}

/* ---------------- scrittura ---------------- */
void jwStr(JW *w, const char *s) {
	jwRaw(w, "\"");
	for (; s && *s && w->n < w->cap - 8; s++) {
		unsigned char c = *s;
		if (c == '"' || c == '\\') { w->b[w->n++] = '\\'; w->b[w->n++] = c; }
		else if (c < 32) { w->n += snprintf(w->b + w->n, w->cap - w->n, "\\u%04x", c); }
		else w->b[w->n++] = c;
	}
	jwRaw(w, "\"");
}
void jwRaw(JW *w, const char *s) { while (*s && w->n < w->cap - 1) w->b[w->n++] = *s++; w->b[w->n] = 0; }
void jwf(JW *w, const char *fmt, ...) {
	va_list ap; va_start(ap, fmt);
	int k = vsnprintf(w->b + w->n, w->cap - w->n, fmt, ap);
	va_end(ap);
	if (k > 0) { w->n += k; if (w->n > w->cap - 1) w->n = w->cap - 1; }
}
