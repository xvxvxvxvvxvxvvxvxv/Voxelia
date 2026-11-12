// Voxelia PS4 - la console (OpenOrbis): schermo con sceVideoOut (tre buffer a 1920x1080, l'immagine del
// rasterizzatore software ci arriva fascia per fascia), DualShock 4 con scePad (levette, grilletti analogici e il
// touchpad come puntatore), audio a 48 kHz su un thread (sceAudioOut), rete con sceNet (socket e risolutore DNS
// della console) e il nome dell'utente (sceUserService).
//
// Le funzioni del sistema sono dichiarate qui con i tipi giusti invece di usare le intestazioni di OpenOrbis,
// alcune delle quali le dichiarano senza argomenti.
#ifdef __PS4__
#include "voxelia.h"
#include "sw.h"
#include <stdarg.h>
#include <sys/stat.h>
#include <sys/types.h>

/* ---------------- funzioni di sistema ---------------- */
typedef uint64_t SceKernelEqueue;
typedef struct { uintptr_t ident; short filter; unsigned short flags; unsigned int fflags; intptr_t data; void *udata; } SceKernelEvent;
typedef struct { int32_t format, tmode, aspect; uint32_t width, height, pitch; uint64_t reserved[2]; } VoAttr;
typedef struct { uint64_t num, ptime, stime; int64_t flipArg; uint64_t reserved[2]; int32_t numGpuFlipPending, numFlipPending, currentBuffer; uint32_t reserved1; } VoFlipStatus;
typedef struct {
	uint32_t buttons; uint8_t lx, ly, rx, ry; uint8_t l2, r2; uint16_t pad0;
	float quat[4], vel[3], acc[3];
	uint8_t touchNum, tres[3]; uint32_t tres1;
	struct { uint16_t x, y; uint8_t id, res[3]; } touch[2];
	uint8_t connected; uint64_t timestamp; uint8_t ext[16]; uint8_t count; uint8_t unknown[15];
} PadData;
typedef struct { uint8_t r, g, b, a; } PadColor;
typedef struct { uint8_t len, family; uint16_t port; uint32_t addr; uint8_t zero[8]; } NetSockaddrIn;

uint64_t sceKernelGetProcessTime(void);
int sceKernelUsleep(unsigned int us);
int sceKernelAllocateDirectMemory(off_t start, off_t end, size_t len, size_t align, int type, off_t *out);
int sceKernelMapDirectMemory(void **addr, size_t len, int prot, int flags, off_t off, size_t align);
size_t sceKernelGetDirectMemorySize(void);
int sceKernelCreateEqueue(SceKernelEqueue *eq, const char *name);
int sceKernelWaitEqueue(SceKernelEqueue eq, SceKernelEvent *ev, int num, int *out, unsigned int *timeoutUs);
int sceVideoOutOpen(int user, int bus, int index, const void *param);
void sceVideoOutSetBufferAttribute(void *attr, unsigned int format, unsigned int tmode, unsigned int aspect, unsigned int w, unsigned int h, unsigned int pitch);
int sceVideoOutRegisterBuffers(int h, int start, void *const *bufs, int n, const void *attr);
int sceVideoOutSetFlipRate(int h, int rate);
int sceVideoOutAddFlipEvent(SceKernelEqueue eq, int h, void *udata);
int sceVideoOutSubmitFlip(int h, int buf, unsigned int mode, int64_t arg);
int sceVideoOutGetFlipStatus(int h, VoFlipStatus *st);
int sceUserServiceInitialize(void *p);
int sceUserServiceGetInitialUser(int *user);
int sceUserServiceGetUserName(int user, char *name, size_t n);
int sceSystemServiceHideSplashScreen(void);
int scePadInit(void);
int scePadOpen(int user, int type, int index, void *param);
int scePadReadState(int h, PadData *d);
int scePadSetLightBar(int h, PadColor *c);
int sceAudioOutInit(void);
int sceAudioOutOpen(int user, int type, int index, unsigned int len, unsigned int freq, unsigned int format);
int sceAudioOutOutput(int h, const void *buf);
int sceAudioOutClose(int h);
int sceRandomGetRandomNumber(void *buf, size_t n);
int sceNetInit(void);
int sceNetPoolCreate(const char *name, int size, int flags);
int sceNetResolverCreate(const char *name, int pool, int flags);
int sceNetResolverStartNtoa(int rid, const char *host, uint32_t *addr, int timeoutUs, int retry, int flags);
int sceNetResolverDestroy(int rid);
int sceNetInetPton(int af, const char *src, void *dst);
int sceNetSocket(const char *name, int family, int type, int proto);
int sceNetConnect(int s, const NetSockaddrIn *a, unsigned int len);
int sceNetSend(int s, const void *b, size_t n, int flags);
int sceNetRecv(int s, void *b, size_t n, int flags);
int sceNetSetsockopt(int s, int level, int opt, const void *v, unsigned int len);
int sceNetSocketClose(int s);
uint16_t sceNetHtons(uint16_t v);

#define VO_FORMAT_A8R8G8B8_SRGB 0x80000000u
#define VO_TILING_LINEAR 1
#define VO_FLIP_VSYNC 1
#define DMEM_WC_GARLIC 3
#define PROT_CPU_RW 0x03
#define PROT_GPU_RW 0x30
#define NET_EAGAIN ((int)0x80410123)
#define NET_EINTR ((int)0x80410104)
#define PAD_L3 0x0002
#define PAD_R3 0x0004
#define PAD_OPTIONS 0x0008
#define PAD_UP 0x0010
#define PAD_RIGHT 0x0020
#define PAD_DOWN 0x0040
#define PAD_LEFT 0x0080
#define PAD_L2 0x0100
#define PAD_R2 0x0200
#define PAD_L1 0x0400
#define PAD_R1 0x0800
#define PAD_TRIANGLE 0x1000
#define PAD_CIRCLE 0x2000
#define PAD_CROSS 0x4000
#define PAD_SQUARE 0x8000
#define PAD_TOUCHPAD 0x100000

static int userId = -1;
static FILE *logF = NULL;
// registro di avvio in /data/voxelia/log.txt: sulla console non c'è altro modo di vedere cosa succede
void plLog(const char *fmt, ...) {
	if (!logF) return;
	va_list ap; va_start(ap, fmt); vfprintf(logF, fmt, ap); va_end(ap);
	fputc('\n', logF); fflush(logF);
}

/* ---------------- tempo, thread ---------------- */
u64 osGetTime(void) { return sceKernelGetProcessTime() / 1000; }
void plSleepMs(int ms) { sceKernelUsleep(ms > 0 ? ms * 1000 : 100); }
void plMutexInit(plMutex *m) { pthread_mutex_init(&m->m, NULL); }
void plMutexLock(plMutex *m) { pthread_mutex_lock(&m->m); }
void plMutexUnlock(plMutex *m) { pthread_mutex_unlock(&m->m); }
typedef struct { plThreadFn fn; void *arg; } TA;
static void *thTramp(void *p) { TA a = *(TA *)p; free(p); a.fn(a.arg); return NULL; }
bool plThreadStart(plThreadFn fn, void *arg, int stackKb, pthread_t *out) {
	TA *a = malloc(sizeof *a); a->fn = fn; a->arg = arg;
	pthread_attr_t at; pthread_attr_init(&at); pthread_attr_setstacksize(&at, (stackKb < 256 ? 256 : stackKb) * 1024);
	bool ok = pthread_create(out, &at, thTramp, a) == 0;
	pthread_attr_destroy(&at);
	if (!ok) free(a);
	return ok;
}
void plRandom(void *buf, size_t n) {
	u8 *b = buf;
	while (n) {
		size_t k = n > 64 ? 64 : n;
		if (sceRandomGetRandomNumber(b, k) < 0) { static u64 x = 88172645463325252ull; x ^= sceKernelGetProcessTime(); for (size_t i = 0; i < k; i++) { x ^= x << 13; x ^= x >> 7; x ^= x << 17; b[i] = (u8)x; } }
		b += k; n -= k;
	}
}
void plMkdirs(void) { mkdir("/data", 0777); mkdir(SAVE_ROOT, 0777); }
void plUserName(char *out, int n) {
	char nm[32] = "";
	if (userId < 0 || sceUserServiceGetUserName(userId, nm, sizeof nm) < 0) nm[0] = 0;
	// solo lettere, numeri e pochi segni, come il nome dell'eroe nel browser
	int j = 0; for (int i = 0; nm[i] && j < n - 1 && j < 14; i++) { unsigned char c = nm[i]; if (c >= 32 && c < 127) out[j++] = c; }
	out[j] = 0;
}

/* ---------------- schermo ---------------- */
#define NFB 3
static int video = -1;
static SceKernelEqueue flipQ;
static u32 *FB[NFB];
static int fbCur = 0;
static int64_t flipN = 0;
static int pad = -1;

bool plGfxInit(void) {
	plMkdirs();
	logF = fopen(SAVE_ROOT "/log.txt", "w");
	plLog("Voxelia PS4 %s (contenuti di Voxelia %s): avvio", PORT_VER, DATA_VER);
	sceUserServiceInitialize(NULL);
	if (sceUserServiceGetInitialUser(&userId) < 0) userId = -1;
	plLog("utente %d", userId);
	// memoria dello schermo: tre buffer 1920x1080 a 32 bit, allineati a 2 MB, nella memoria diretta "garlic"
	size_t fbSize = (size_t)SCR_W * SCR_H * 4, fbAl = (fbSize + 0x1FFFFF) & ~(size_t)0x1FFFFF, total = fbAl * NFB;
	off_t off = 0; void *mem = NULL;
	int r = sceKernelAllocateDirectMemory(0, sceKernelGetDirectMemorySize(), total, 0x200000, DMEM_WC_GARLIC, &off);
	if (r < 0) { plLog("memoria diretta: errore %08x", r); return false; }
	r = sceKernelMapDirectMemory(&mem, total, PROT_CPU_RW | PROT_GPU_RW, 0, off, 0x200000);
	if (r < 0) { plLog("mappatura della memoria dello schermo: errore %08x", r); return false; }
	for (int i = 0; i < NFB; i++) { FB[i] = (u32 *)((u8 *)mem + fbAl * i); memset(FB[i], 0, fbSize); }
	video = sceVideoOutOpen(0xFF, 0, 0, NULL);
	if (video < 0) { plLog("sceVideoOutOpen: errore %08x", video); return false; }
	sceVideoOutSetFlipRate(video, 0);   // 60 Hz
	if (sceKernelCreateEqueue(&flipQ, "voxelia flip") < 0 || sceVideoOutAddFlipEvent(flipQ, video, NULL) < 0) plLog("coda dei flip non disponibile");
	VoAttr at; memset(&at, 0, sizeof at);
	sceVideoOutSetBufferAttribute(&at, VO_FORMAT_A8R8G8B8_SRGB, VO_TILING_LINEAR, 0, SCR_W, SCR_H, SCR_W);
	r = sceVideoOutRegisterBuffers(video, 0, (void *const *)FB, NFB, &at);
	if (r < 0) { plLog("sceVideoOutRegisterBuffers: errore %08x", r); return false; }
	// il rasterizzatore: sei thread (il gioco ne ha a disposizione sei dei sette core della CPU)
	if (!swInit(SCR_W, SCR_H, 6)) { plLog("memoria per il rasterizzatore insufficiente"); return false; }
	plLog("schermo %dx%d, %d thread di disegno", SCR_W, SCR_H, swThreads());
	scePadInit();
	pad = scePadOpen(userId, 0, 0, NULL);
	if (pad >= 0) { PadColor c = {245, 185, 66, 255}; scePadSetLightBar(pad, &c); }
	plLog("controller %d", pad);
	sceSystemServiceHideSplashScreen();
	return true;
}
void plGfxExit(void) { swExit(); if (logF) fclose(logF); logF = NULL; }

static bool curOn = false; static float curX = SCR_W / 2, curY = SCR_H / 2; static u64 curT = 0;
void plCursorPixels(u32 *px, int w, int h, float x, float y);
void plSwap(void) {
	// al più un flip in attesa: il buffer in cui si scrive non è né sullo schermo né in coda
	for (int tries = 0; tries < 50; tries++) {
		VoFlipStatus st; memset(&st, 0, sizeof st);
		if (sceVideoOutGetFlipStatus(video, &st) < 0 || st.numFlipPending < 2) break;
		SceKernelEvent ev; int n = 0; unsigned int to = 20000;
		sceKernelWaitEqueue(flipQ, &ev, 1, &n, &to);
	}
	u32 *dst = FB[fbCur];
	swSetOutput(dst, SCR_W);
	swFinish();
	swSetOutput(NULL, 0);
	if (curOn) plCursorPixels(dst, SCR_W, SCR_H, curX, curY);
	sceVideoOutSubmitFlip(video, fbCur, VO_FLIP_VSYNC, ++flipN);
	fbCur = (fbCur + 1) % NFB;
	static bool first = true;
	if (first) { first = false; plLog("primo fotogramma sullo schermo"); }
}

/* ---------------- comandi ---------------- */
static u32 prevKeys = 0;
static float axis(u8 v) {
	float f = (v - 127.5f) / 127.5f;
	if (fabsf(f) < .14f) return 0;   // zona morta
	return f > 0 ? (f - .14f) / .86f : (f + .14f) / .86f;
}
// touchpad: il dito che scorre sposta il puntatore; un tocco breve (o R3) è il clic
static struct { bool down, clicked; int id; float lx, ly, moved; u64 t0; } TP;
static bool tapPending = false, tapUp = false, r3Prev = false;
void plPoll(PlInput *in) {
	memset(in, 0, sizeof *in);
	PadData d; memset(&d, 0, sizeof d);
	if (pad < 0 || scePadReadState(pad, &d) < 0 || !d.connected) memset(&d, 0, sizeof d), d.lx = d.ly = d.rx = d.ry = 128;
	u32 h = 0, b = d.buttons;
	if (b & PAD_CROSS) h |= KEY_A;
	if (b & PAD_CIRCLE) h |= KEY_B;
	if (b & PAD_SQUARE) h |= KEY_Y;
	if (b & PAD_TRIANGLE) h |= KEY_X;
	if (b & PAD_L1) h |= KEY_L;
	if (b & PAD_R1) h |= KEY_R;
	if (b & PAD_L2) h |= KEY_ZL;
	if (b & PAD_R2) h |= KEY_ZR;
	if (b & PAD_OPTIONS) h |= KEY_START;
	if (b & PAD_TOUCHPAD) h |= KEY_SELECT;
	if (b & PAD_UP) h |= KEY_DUP;
	if (b & PAD_DOWN) h |= KEY_DDOWN;
	if (b & PAD_LEFT) h |= KEY_DLEFT;
	if (b & PAD_RIGHT) h |= KEY_DRIGHT;
	in->lx = axis(d.lx); in->ly = axis(d.ly);
	in->rx = axis(d.rx); in->ry = axis(d.ry);
	in->l2 = d.l2 / 255.f; in->r2 = d.r2 / 255.f;
	if (in->ly < -.5f) h |= KEY_CPAD_UP; if (in->ly > .5f) h |= KEY_CPAD_DOWN;
	if (in->lx < -.5f) h |= KEY_CPAD_LEFT; if (in->lx > .5f) h |= KEY_CPAD_RIGHT;
	in->kh = h; in->kd = h & ~prevKeys; in->ku = prevKeys & ~h; prevKeys = h;

	u64 now = osGetTime();
	// il touchpad del DualShock 4 misura 1920x943: il puntatore si muove come con un mouse, un po' più veloce
	if (d.touchNum > 0) {
		float x = d.touch[0].x, y = d.touch[0].y;
		if (!TP.down || TP.id != d.touch[0].id) { TP.down = true; TP.id = d.touch[0].id; TP.lx = x; TP.ly = y; TP.moved = 0; TP.t0 = now; TP.clicked = false; }
		else {
			float dx = (x - TP.lx) * 1.35f, dy = (y - TP.ly) * 1.35f * 1.1f;
			TP.moved += fabsf(dx) + fabsf(dy); TP.lx = x; TP.ly = y;
			if (dx || dy) {
				curX = fminf(SCR_W - 1, fmaxf(0, curX + dx)); curY = fminf(SCR_H - 1, fmaxf(0, curY + dy));
				curOn = true; curT = now;
			}
		}
		if (b & PAD_TOUCHPAD) TP.clicked = true;
	} else if (TP.down) {
		TP.down = false;
		// tocco leggero: breve, quasi fermo, senza premere il touchpad
		if (!TP.clicked && now - TP.t0 < 260 && TP.moved < 40) { if (!curOn) { curOn = true; } curT = now; tapPending = true; }
	}
	bool r3 = (b & PAD_R3) != 0;
	if (r3 && !r3Prev) { curOn = true; curT = now; tapPending = true; }
	r3Prev = r3;
	if (curOn && now - curT > 6000) curOn = false;   // dopo sei secondi fermo il puntatore sparisce
	if (in->lx || in->ly) { if (now - curT > 800) curOn = false; }
	in->cursor = curOn; in->cx = curX; in->cy = curY;
	in->tx = curX; in->ty = curY;
	if (tapUp) { in->tup = true; tapUp = false; }
	if (tapPending) { in->touch = in->tdown = true; in->ntouch = 1; tapPending = false; tapUp = true; }
}
const char *plTypedText(void) { return NULL; }
bool plKeyboard(const char *hint, const char *init, int max, char *out, int outn) {
	bool ok = oskRun(hint, init, max, out, outn);
	prevKeys = ~0u;   // il tasto che ha chiuso la tastiera non vale per il gioco
	return ok;
}

/* ---------------- audio ---------------- */
#define AUN 512
static int aport = -1;
static volatile bool aQuit = false;
static pthread_t ath; static bool athOk = false;
static void audioLoop(void *arg) {
	(void)arg;
	static s16 buf[2][AUN * 2]; int k = 0;
	while (!aQuit) {
		auRender(buf[k], AUN);
		sceAudioOutOutput(aport, buf[k]);   // aspetta che la porta sia pronta: è il ritmo del thread
		k ^= 1;
	}
}
bool plAudioStart(int rate) {
	sceAudioOutInit();
	aport = sceAudioOutOpen(0xFF, 0, 0, AUN, rate, 1);   // utente di sistema, porta principale, 16 bit stereo
	plLog("audio: porta %d a %d Hz", aport, rate);
	if (aport < 0) return false;
	aQuit = false;
	athOk = plThreadStart(audioLoop, NULL, 256, &ath);
	return athOk;
}
void plAudioStop(void) {
	aQuit = true;
	if (athOk) pthread_join(ath, NULL);
	athOk = false;
	if (aport >= 0) sceAudioOutClose(aport);
	aport = -1;
}

/* ---------------- rete ---------------- */
static int netPool = -1;
bool plNetInit(void) {
	int r = sceNetInit();
	netPool = sceNetPoolCreate("voxelia", 64 * 1024, 0);
	plLog("rete: init %08x, pool %d", r, netPool);
	return true;
}
void plNetExit(void) {}
int plTcpConnect(const char *host, int port) {
	uint32_t addr = 0;
	if (sceNetInetPton(2, host, &addr) != 1) {
		int rid = sceNetResolverCreate("voxelia-dns", netPool, 0);
		if (rid < 0) { plLog("DNS: risolutore %08x", rid); return -2; }
		int r = sceNetResolverStartNtoa(rid, host, &addr, 0, 0, 0);
		sceNetResolverDestroy(rid);
		if (r < 0) { plLog("DNS %s: %08x", host, r); return -2; }
	}
	int s = sceNetSocket("voxelia", 2, 1, 0);
	if (s < 0) { plLog("socket: %08x", s); return -1; }
	NetSockaddrIn sa; memset(&sa, 0, sizeof sa);
	sa.len = sizeof sa; sa.family = 2; sa.port = sceNetHtons((uint16_t)port); sa.addr = addr;
	int r = sceNetConnect(s, &sa, sizeof sa);
	if (r < 0) { plLog("connect %s:%d: %08x", host, port, r); sceNetSocketClose(s); return -1; }
	int one = 1;
	sceNetSetsockopt(s, 6, 1, &one, sizeof one);            // TCP_NODELAY
	sceNetSetsockopt(s, 0xffff, 0x1200, &one, sizeof one);  // SO_NBIO: le attese le fa plTcpRecv
	plLog("collegato a %s:%d", host, port);
	return s;
}
int plTcpSend(int s, const void *b, size_t n) {
	int r = sceNetSend(s, b, n, 0);
	if (r == NET_EAGAIN || r == NET_EINTR) { plSleepMs(1); return 0; }
	return r < 0 ? -1 : r;
}
int plTcpRecv(int s, void *b, size_t n, int ms) {
	u64 t0 = osGetTime();
	for (;;) {
		int r = sceNetRecv(s, b, n, 0);
		if (r > 0) return r;
		if (r == 0) return -1;   // chiusa dall'altra parte
		if (r != NET_EAGAIN && r != NET_EINTR) return -1;
		if ((int)(osGetTime() - t0) >= ms) return 0;
		plSleepMs(2);
	}
}
void plTcpClose(int s) { sceNetSocketClose(s); }
#endif
