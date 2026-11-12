// Voxelia PS4 - livello di piattaforma.
// Il motore del gioco (arrivato dai port 3DS e Vita, che seguono la versione per browser) usa queste poche
// funzioni per il tempo, i file, i thread, i comandi, l'audio, lo schermo e la rete. Ci sono due realizzazioni:
//   plat_ps4.c   la console (OpenOrbis: sceVideoOut, scePad con il touchpad, sceAudioOut, sceNet, sceUserService)
//   plat_sdl.c   una build di prova per PC (SDL2), usata per le prove automatiche e le immagini
// Tutte e due disegnano con lo stesso rasterizzatore software (sw.c) e mostrano la sua immagine.
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

#ifdef __PS4__
#define DATA_DIR "/app0/data/"
#define SAVE_ROOT "/data/voxelia"
#define PLATFORM_NAME "PS4"
#else
#define DATA_DIR "data/"
#define SAVE_ROOT "save"
#define PLATFORM_NAME "PC (prova)"
#endif

// schermo: 1920x1080, l'interfaccia lavora in coordinate virtuali (SCR_W / UIS)
#define SCR_W 1920
#define SCR_H 1080
// pixel dello schermo per pixel del mondo dell'originale a zoom 1 (sulla Vita 1,8 su 960x544): sul televisore
// si vede un quarto di mondo in più in larghezza rispetto alla Vita
#define WORLD_PX 2.9f

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
// nomi dei tasti presi dal port 3DS: sulla PS4 A = Croce, B = Cerchio, Y = Quadrato, X = Triangolo,
// L e R = L1 e R1, START = OPTIONS, SELECT = clic del touchpad; ZL e ZR = L2 e R2
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
	bool touch, tdown, tup;  // "tocco": il puntatore del touchpad (tocco leggero o R3) o il mouse sul PC
	float tx, ty;            // punto del tocco in pixel dello schermo (1920x1080)
	int ntouch;              // 1 durante il tocco
	float t2x, t2y;          // (seconda dita: non c'è sulla PS4)
	bool cursor;             // il puntatore è da mostrare (in cx, cy)
	float cx, cy;
	float l2, r2;            // grilletti analogici 0..1
	bool quit;
} PlInput;
void plPoll(PlInput *in);

/* ---------------- grafica ---------------- */
bool plGfxInit(void);                // schermo e rasterizzatore (swInit)
void plLog(const char *fmt, ...);    // registro di avvio: SAVE_ROOT/log.txt sulla console, VOX_LOG=1 sul PC
void plFatal(const char *msg);       // messaggio di errore sullo schermo invece di un crash
void plGfxExit(void);
void plSwap(void);                   // swFinish e immagine sullo schermo
// tastiera (bloccante): true se confermato. Sulla PS4 è la tastiera a schermo del gioco (osk.c)
bool plKeyboard(const char *hint, const char *init, int max, char *out, int outn);
bool oskRun(const char *hint, const char *init, int max, char *out, int outn);
const char *plTypedText(void);       // testo scritto con una tastiera vera dall'ultimo plPoll (o NULL)

/* ---------------- audio ---------------- */
bool plAudioStart(int rate);         // chiama auRender() da un thread suo
void plAudioStop(void);
void auRender(s16 *out, int n);      // n campioni stereo

/* ---------------- rete ---------------- */
bool plNetInit(void);
void plNetExit(void);
// TCP: connessione (-1 non raggiungibile, -2 nome non trovato), invio (byte inviati, <0 errore),
// ricezione con attesa massima in ms (byte ricevuti, 0 = niente entro l'attesa, <0 chiusa o errore)
int plTcpConnect(const char *host, int port);
int plTcpSend(int s, const void *b, size_t n);
int plTcpRecv(int s, void *b, size_t n, int timeoutMs);
void plTcpClose(int s);

#endif
