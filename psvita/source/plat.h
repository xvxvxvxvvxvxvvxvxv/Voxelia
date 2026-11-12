// Voxelia PS Vita - livello di piattaforma.
// Il motore del gioco (arrivato dal port 3DS, che a sua volta segue la versione per browser) usa queste poche
// funzioni per il tempo, i file, i thread, i comandi, l'audio e la tastiera. Ci sono due realizzazioni:
//   plat_vita.c  la console (vitaGL, sceCtrl, sceTouch, sceAudioOut, sceImeDialog, sceNet)
//   plat_sdl.c   una build di prova per PC (SDL2 + OpenGL), usata per le prove automatiche e le immagini
#ifndef PLAT_H
#define PLAT_H

#include <stdint.h>
#include <stdbool.h>
#include <stddef.h>
#include <pthread.h>

typedef uint8_t u8;
typedef uint16_t u16;
typedef uint32_t u32;
typedef uint64_t u64;
typedef int8_t s8;
typedef int16_t s16;
typedef int32_t s32;
typedef int64_t s64;

#ifdef __vita__
#define DATA_DIR "app0:data/"
#define SAVE_ROOT "ux0:data/voxelia"
#define PLATFORM_NAME "PS Vita"
#else
#define DATA_DIR "data/"
#define SAVE_ROOT "save"
#define PLATFORM_NAME "PC (prova)"
#endif

// schermo della console: 960x544, l'interfaccia lavora in coordinate virtuali (SCR_W / UIS)
#define SCR_W 960
#define SCR_H 544

// colore come in citro2d: rosso nel byte basso, alfa nel byte alto
#define C2D_Color32(r, g, b, a) ((u32)(r) | ((u32)(g) << 8) | ((u32)(b) << 16) | ((u32)(a) << 24))

/* ---------------- tempo, thread ---------------- */
u64 osGetTime(void);                 // millisecondi
void plSleepMs(int ms);
typedef struct { pthread_mutex_t m; } plMutex;
void plMutexInit(plMutex *m);
void plMutexLock(plMutex *m);
void plMutexUnlock(plMutex *m);
typedef void (*plThreadFn)(void *);
bool plThreadStart(plThreadFn fn, void *arg, int stackKb, pthread_t *out);
void plRandom(void *buf, size_t n);
void plMkdirs(void);                 // cartella dei salvataggi
void plUserName(char *out, int n);   // nome dell'utente della console

/* ---------------- comandi ---------------- */
// nomi dei tasti presi dal port 3DS: sulla Vita A = Croce, B = Cerchio, Y = Quadrato, X = Triangolo
enum {
	KEY_A = 1 << 0, KEY_B = 1 << 1, KEY_SELECT = 1 << 2, KEY_START = 1 << 3,
	KEY_DRIGHT = 1 << 4, KEY_DLEFT = 1 << 5, KEY_DUP = 1 << 6, KEY_DDOWN = 1 << 7,
	KEY_R = 1 << 8, KEY_L = 1 << 9, KEY_X = 1 << 10, KEY_Y = 1 << 11,
	KEY_ZL = 1 << 14, KEY_ZR = 1 << 15,
	KEY_TOUCH = 1 << 20,
	KEY_CSTICK_RIGHT = 1 << 24, KEY_CSTICK_LEFT = 1 << 25, KEY_CSTICK_UP = 1 << 26, KEY_CSTICK_DOWN = 1 << 27,
	KEY_CPAD_RIGHT = 1 << 28, KEY_CPAD_LEFT = 1 << 29, KEY_CPAD_UP = 1 << 30, KEY_CPAD_DOWN = 1u << 31,
};
typedef struct { u16 px, py; } touchPosition;   // in coordinate virtuali dell'interfaccia
typedef struct {
	u32 kd, kh, ku;          // premuti ora, tenuti, lasciati
	float lx, ly, rx, ry;    // levette analogiche, -1..1
	bool touch, tdown, tup;  // schermo frontale
	float tx, ty;            // tocco in pixel dello schermo (960x544)
	int ntouch;              // dita sullo schermo frontale
	float t2x, t2y;          // seconda dita (pizzico per lo zoom)
	bool quit;
} PlInput;
void plPoll(PlInput *in);

/* ---------------- grafica ---------------- */
bool plGfxInit(void);
void plLog(const char *fmt, ...);        // registro di avvio: SAVE_ROOT/log.txt
void plFatal(const char *msg);           // messaggio di errore e uscita, invece di un crash
void plGfxExit(void);
void plSwap(void);
// tastiera di sistema (bloccante): true se confermato
bool plKeyboard(const char *hint, const char *init, int max, char *out, int outn);

/* ---------------- audio ---------------- */
bool plAudioStart(int rate);         // chiama auRender() da un thread suo
void plAudioStop(void);
void auRender(s16 *out, int n);      // n campioni stereo

/* ---------------- rete ---------------- */
bool plNetInit(void);
void plNetExit(void);

#endif
