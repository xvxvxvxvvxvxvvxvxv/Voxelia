#ifndef VX_JSON_H
#define VX_JSON_H
#include <nds/ndstypes.h>
#include <stddef.h>
#include <stdarg.h>

enum { JNULL, JBOOL, JNUM, JSTR, JARR, JOBJ };
typedef struct J {
	u8 t;
	int n;            // figli (array/oggetto)
	double d;
	char *s;
	char *key;
	struct J *kid, *next;
} J;
typedef struct { char *buf; size_t cap, used; } JArena;

void jaInit(JArena *a, size_t cap);
void jaReset(JArena *a);
void jaFree(JArena *a);
J *jParse(JArena *a, const char *s, size_t len);
J *jget(const J *o, const char *k);
J *jat(const J *a, int i);
double jnum(const J *n, double def);
const char *jstr(const J *n, const char *def);
double jgn(const J *o, const char *k, double def);
const char *jgs(const J *o, const char *k, const char *def);
u32 jcolor(const char *c, u32 def);
#define JFOR(c, o) for (J *c = (o) ? (o)->kid : NULL; c; c = c->next)

typedef struct { char *b; int n, cap; } JW;
void jwRaw(JW *w, const char *s);
void jwStr(JW *w, const char *s);
void jwf(JW *w, const char *fmt, ...);
#endif
