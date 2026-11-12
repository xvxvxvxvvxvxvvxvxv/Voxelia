// Voxelia PS4 - build di prova per PC (SDL2): lo stesso gioco e lo stesso rasterizzatore software della console,
// in una finestra. Serve a provare il port senza la PS4: prove automatiche con VOX_AUTO (vedi main.c) e immagini.
// Tasti: frecce/WASD muovi · J/Spazio Croce · K Cerchio · U Quadrato · I Triangolo · Q L1 · E R1 · Invio OPTIONS ·
//        Tab touchpad (mappa) · +/- zoom · il mouse è il puntatore del touchpad (clic = tocco)
// La finestra è grande metà dello schermo della console (VOX_WIN=1 per 1920x1080); l'immagine resta a 1920x1080.
#ifndef __PS4__
#include "voxelia.h"
#include "sw.h"
#include <SDL2/SDL.h>
#include <sys/stat.h>
#include <sys/time.h>
#include <unistd.h>
#include <errno.h>
#include <poll.h>
#include <netdb.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <netinet/tcp.h>

static SDL_Window *win;
static SDL_Renderer *ren;
static SDL_Texture *tex;
static int winW = SCR_W / 2, winH = SCR_H / 2;
char plShotFile[512] = "";

u64 osGetTime(void) { struct timeval tv; gettimeofday(&tv, NULL); return (u64)tv.tv_sec * 1000 + tv.tv_usec / 1000; }
void plSleepMs(int ms) { usleep(ms * 1000); }
void plMutexInit(plMutex *m) { pthread_mutex_init(&m->m, NULL); }
void plMutexLock(plMutex *m) { pthread_mutex_lock(&m->m); }
void plMutexUnlock(plMutex *m) { pthread_mutex_unlock(&m->m); }
typedef struct { plThreadFn fn; void *arg; } TA;
static void *thTramp(void *p) { TA a = *(TA *)p; free(p); a.fn(a.arg); return NULL; }
bool plThreadStart(plThreadFn fn, void *arg, int stackKb, pthread_t *out) {
	(void)stackKb; TA *a = malloc(sizeof *a); a->fn = fn; a->arg = arg;
	return pthread_create(out, NULL, thTramp, a) == 0;
}
void plRandom(void *buf, size_t n) {
	FILE *f = fopen("/dev/urandom", "rb");
	if (f) { size_t r = fread(buf, 1, n, f); fclose(f); if (r == n) return; }
	for (size_t i = 0; i < n; i++) ((u8 *)buf)[i] = (u8)rand();
}
void plMkdirs(void) { mkdir(SAVE_ROOT, 0777); }
void plUserName(char *out, int n) { const char *u = getenv("VOX_NAME"); snprintf(out, n, "%s", u ? u : ""); }

bool plGfxInit(void) {
	int th = getenv("VOX_THREADS") ? atoi(getenv("VOX_THREADS")) : (int)sysconf(_SC_NPROCESSORS_ONLN);
	if (!swInit(SCR_W, SCR_H, th)) return false;
	if (getenv("VOX_HEADLESS")) return true;
	if (SDL_Init(SDL_INIT_VIDEO | SDL_INIT_AUDIO | SDL_INIT_EVENTS) != 0) { printf("SDL: %s\n", SDL_GetError()); return false; }
	if (getenv("VOX_WIN")) { winW = SCR_W; winH = SCR_H; }
	win = SDL_CreateWindow("Voxelia - prova del port PS4", SDL_WINDOWPOS_CENTERED, SDL_WINDOWPOS_CENTERED, winW, winH, 0);
	if (!win) { printf("finestra: %s\n", SDL_GetError()); return false; }
	ren = SDL_CreateRenderer(win, -1, getenv("VOX_AUTO") ? 0 : SDL_RENDERER_PRESENTVSYNC);
	if (!ren) { printf("renderer: %s\n", SDL_GetError()); return false; }
	SDL_SetHint(SDL_HINT_RENDER_SCALE_QUALITY, "linear");
	tex = SDL_CreateTexture(ren, SDL_PIXELFORMAT_RGB888, SDL_TEXTUREACCESS_STREAMING, SCR_W, SCR_H);
	printf("rasterizzatore software: %dx%d, %d thread\n", SCR_W, SCR_H, swThreads());
	return true;
}
void plGfxExit(void) { swExit(); if (ren) { SDL_DestroyTexture(tex); SDL_DestroyRenderer(ren); SDL_DestroyWindow(win); } SDL_Quit(); }

static bool curOn = false; static float curX = SCR_W / 2, curY = SCR_H / 2;
static void drawCursor(u32 *px) {
	// il puntatore come sulla console (vedi plat_ps4.c): una freccia bianca con il bordo scuro
	if (!curOn) return;
	extern void plCursorPixels(u32 *px, int w, int h, float x, float y);
	plCursorPixels(px, SCR_W, SCR_H, curX, curY);
}
void plSwap(void) {
	swFinish();
	u32 *px = swPixels();
	drawCursor(px);
	if (plShotFile[0]) {
		FILE *f = fopen(plShotFile, "wb");
		if (f) {
			fprintf(f, "P6\n%d %d\n255\n", SCR_W, SCR_H);
			static u8 row[SCR_W * 3];
			for (int y = 0; y < SCR_H; y++) {
				for (int x = 0; x < SCR_W; x++) { u32 c = px[y * SCR_W + x]; row[x * 3] = c >> 16; row[x * 3 + 1] = c >> 8; row[x * 3 + 2] = c; }
				fwrite(row, 1, sizeof row, f);
			}
			fclose(f); printf("[prova] immagine %s\n", plShotFile);
		}
		plShotFile[0] = 0;
	}
	if (!ren) return;
	SDL_UpdateTexture(tex, NULL, px, SCR_W * 4);
	SDL_RenderClear(ren);
	SDL_RenderCopy(ren, tex, NULL, NULL);
	SDL_RenderPresent(ren);
}

static u32 prevKeys = 0;
static bool prevTouch = false;
static char typed[64];
const char *plTypedText(void) { return typed[0] ? typed : NULL; }
void plPoll(PlInput *in) {
	memset(in, 0, sizeof *in);
	typed[0] = 0;
	if (!ren) { in->kh = 0; prevKeys = 0; return; }
	SDL_Event ev;
	while (SDL_PollEvent(&ev)) {
		if (ev.type == SDL_QUIT) in->quit = true;
		else if (ev.type == SDL_TEXTINPUT) { if (strlen(typed) + strlen(ev.text.text) < sizeof typed) strcat(typed, ev.text.text); }
	}
	const u8 *k = SDL_GetKeyboardState(NULL);
	u32 h = 0;
	bool text = SDL_IsTextInputActive();
	if (!text) {
		if (k[SDL_SCANCODE_J] || k[SDL_SCANCODE_SPACE]) h |= KEY_A;
		if (k[SDL_SCANCODE_K]) h |= KEY_B;
		if (k[SDL_SCANCODE_U]) h |= KEY_Y;
		if (k[SDL_SCANCODE_I]) h |= KEY_X;
		if (k[SDL_SCANCODE_Q]) h |= KEY_L;
		if (k[SDL_SCANCODE_E]) h |= KEY_R;
		if (k[SDL_SCANCODE_W]) in->ly -= 1;
		if (k[SDL_SCANCODE_S]) in->ly += 1;
		if (k[SDL_SCANCODE_A]) in->lx -= 1;
		if (k[SDL_SCANCODE_D]) in->lx += 1;
		if (k[SDL_SCANCODE_EQUALS] || k[SDL_SCANCODE_KP_PLUS]) in->r2 = 1;
		if (k[SDL_SCANCODE_MINUS] || k[SDL_SCANCODE_KP_MINUS]) in->l2 = 1;
	}
	if (k[SDL_SCANCODE_ESCAPE]) h |= KEY_B;
	if (k[SDL_SCANCODE_BACKSPACE]) h |= KEY_Y;
	if (k[SDL_SCANCODE_RETURN]) h |= KEY_START;
	if (k[SDL_SCANCODE_TAB]) h |= KEY_SELECT;
	if (k[SDL_SCANCODE_UP]) h |= KEY_DUP;
	if (k[SDL_SCANCODE_DOWN]) h |= KEY_DDOWN;
	if (k[SDL_SCANCODE_LEFT]) h |= KEY_DLEFT;
	if (k[SDL_SCANCODE_RIGHT]) h |= KEY_DRIGHT;
	if (in->ly < -.5f) h |= KEY_CPAD_UP; if (in->ly > .5f) h |= KEY_CPAD_DOWN;
	if (in->lx < -.5f) h |= KEY_CPAD_LEFT; if (in->lx > .5f) h |= KEY_CPAD_RIGHT;
	int mx, my; u32 mb = SDL_GetMouseState(&mx, &my);
	bool t = (mb & SDL_BUTTON(SDL_BUTTON_LEFT)) != 0;
	in->kh = h; in->kd = h & ~prevKeys; in->ku = prevKeys & ~h; prevKeys = h;
	float fx = mx * (float)SCR_W / winW, fy = my * (float)SCR_H / winH;
	if (fx != curX || fy != curY || t) curOn = true;
	curX = fx; curY = fy;
	in->touch = t; in->tdown = t && !prevTouch; in->tup = !t && prevTouch; prevTouch = t;
	in->tx = fx; in->ty = fy; in->ntouch = t ? 1 : 0;
	in->cursor = curOn; in->cx = fx; in->cy = fy;
}

bool plKeyboard(const char *hint, const char *init, int max, char *out, int outn) {
	const char *auto_ = getenv("VOX_KB");
	if (getenv("VOX_OSKSHOT")) return oskRun(hint, init, max, out, outn);
	if (auto_ || getenv("VOX_AUTO")) { snprintf(out, outn, "%s", auto_ ? auto_ : init); return auto_ != NULL; }
	if (ren) SDL_StartTextInput();
	bool ok = oskRun(hint, init, max, out, outn);
	if (ren) SDL_StopTextInput();
	prevKeys = ~0u;
	return ok;
}

static SDL_AudioDeviceID adev = 0;
static void acb(void *u, Uint8 *stream, int len) { (void)u; auRender((s16 *)stream, len / 4); }
bool plAudioStart(int rate) {
	if (getenv("VOX_NOAUDIO") || !ren) return true;
	SDL_AudioSpec want = {0}, got;
	want.freq = rate; want.format = AUDIO_S16SYS; want.channels = 2; want.samples = 1024; want.callback = acb;
	adev = SDL_OpenAudioDevice(NULL, 0, &want, &got, 0);
	if (!adev) { printf("audio: %s\n", SDL_GetError()); return true; }
	SDL_PauseAudioDevice(adev, 0);
	return true;
}
void plAudioStop(void) { if (adev) SDL_CloseAudioDevice(adev); adev = 0; }
bool plNetInit(void) { return true; }
void plNetExit(void) {}
int plTcpConnect(const char *host, int port) {
	struct addrinfo hints, *res = NULL; memset(&hints, 0, sizeof hints);
	hints.ai_family = AF_UNSPEC; hints.ai_socktype = SOCK_STREAM;
	char ps[8]; snprintf(ps, sizeof ps, "%d", port);
	if (getaddrinfo(host, ps, &hints, &res) || !res) return -2;
	int s = -1;
	for (struct addrinfo *a = res; a; a = a->ai_next) {
		s = socket(a->ai_family, a->ai_socktype, a->ai_protocol);
		if (s < 0) continue;
		if (connect(s, a->ai_addr, a->ai_addrlen) == 0) break;
		close(s); s = -1;
	}
	freeaddrinfo(res);
	if (s >= 0) { int one = 1; setsockopt(s, IPPROTO_TCP, TCP_NODELAY, &one, sizeof one); }
	return s < 0 ? -1 : s;
}
int plTcpSend(int s, const void *b, size_t n) {
	ssize_t r = send(s, b, n, MSG_NOSIGNAL);
	if (r < 0) return errno == EAGAIN || errno == EINTR ? 0 : -1;
	return (int)r;
}
int plTcpRecv(int s, void *b, size_t n, int ms) {
	struct pollfd p = {s, POLLIN, 0};
	int k = poll(&p, 1, ms);
	if (k == 0) return 0;
	if (k < 0) return errno == EINTR ? 0 : -1;
	ssize_t r = recv(s, b, n, 0);
	if (r == 0) return -1;
	if (r < 0) return errno == EAGAIN || errno == EINTR ? 0 : -1;
	return (int)r;
}
void plTcpClose(int s) { close(s); }
#endif
