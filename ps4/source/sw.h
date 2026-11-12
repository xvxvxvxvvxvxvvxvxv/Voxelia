// Voxelia PS4 - rasterizzatore software a più thread.
//
// La PS4 ha una GPU potente, ma per un homebrew usarla vuol dire passare per Piglet (OpenGL ES) e per il
// compilatore di shader della console, che senza patch del sistema non si può caricare. Il port quindi disegna
// con gli otto core Jaguar: il mondo (quadrilateri voxel con depth buffer, luci per vertice come gli shader del
// port Vita) e l'interfaccia (triangoli con il testo SDF e le immagini) finiscono in un elenco di comandi; a fine
// fotogramma i thread trasformano e illuminano i vertici in parallelo, poi si dividono lo schermo a fasce e
// disegnano ognuno le sue righe, nello stesso ordine dei comandi. Il risultato è un'immagine 0x00RRGGBB che la
// piattaforma copia nel buffer dello schermo (sceVideoOut sulla console, SDL nella build di prova per PC).
#ifndef SW_H
#define SW_H
#include "plat.h"

// vertice del mondo: posizione in caselle (x, y) e pixel di altezza (z), luce propria (e), colore
typedef struct { float x, y, z, e; u8 r, g, b, a; } Vtx;
// vertice dell'interfaccia: coordinate virtuali, coordinate della texture, nitidezza del bordo SDF, colore RGBA
typedef struct { float x, y, u, v, s; u32 c; } V2;

enum { SW_GREATER = 0, SW_LESS = 1 };

bool swInit(int w, int h, int threads);
void swExit(void);
int swW(void);
int swH(void);
int swThreads(void);
u32 *swPixels(void);                 // immagine finita (dopo swFinish)

void swClear(u32 rgb);               // colore di sfondo e profondità a 0
// matrice del mondo: righe (x, y, z, 1) -> coordinate normalizzate, come uProj del port Vita
void swProj(const float R[4][4]);
// luci: ambiente e fino a 12 luci (posizione x, y, z, 1/r² e colore); lit = false: solo ambiente
void swLights(bool lit, float ar, float ag, float ab, const float *lp, const float *lc, int nl);
void swDepth(int func, bool write);
void swQuads(const Vtx *v, int nq);  // nq quadrilateri (4 vertici l'uno), i vertici devono restare validi fino a swFinish
// interfaccia: k = scala da coordinate virtuali a pixel; tex < 0 = atlante SDF del carattere
void sw2DScale(float k);
void swTris2D(const V2 *v, int nv, int tex, float solidU, float solidV);
int swTexCreate(int w, int h, const u32 *rgba, bool nearest);
void swTexUpdate(int t, int w, int h, const u32 *rgba);
void swFontAtlas(int w, int h, const u8 *alpha);

void swFinish(void);                 // esegue tutti i comandi del fotogramma
// dove copiare l'immagine finita, fascia per fascia, durante swFinish (il buffer di sceVideoOut); NULL = da nessuna parte
void swSetOutput(u32 *dst, int pitch);
// statistiche dell'ultimo fotogramma (pannello sviluppatore)
extern int swStatQuads, swStatTris2D;
extern float swStatMs;
#endif
