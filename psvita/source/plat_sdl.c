// Voxelia PS Vita - build di prova per PC (SDL2 + OpenGL 2.1).
// Serve a provare il port senza la console: stessa finestra 960x544, tastiera e mouse al posto di tasti e touch,
// audio con SDL, prove automatiche con VOX_AUTO (vedi main.c) e immagini dello schermo.
// Tasti: frecce/WASD muovi · J/Spazio Croce · K Cerchio · U Quadrato · I Triangolo · Q L · E R · Invio START ·
//        Tab SELECT · +/- zoom · clic = tocco (Ctrl+clic = seconda dita per il pizzico)
#ifndef __vita__
#include "voxelia.h"
#include "glinc.h"
#include <SDL2/SDL.h>
#include <sys/stat.h>
#include <sys/time.h>
#include <unistd.h>

static SDL_Window *win;
static SDL_GLContext ctx;
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
	if (SDL_Init(SDL_INIT_VIDEO | SDL_INIT_AUDIO | SDL_INIT_EVENTS) != 0) { printf("SDL: %s\n", SDL_GetError()); return false; }
	SDL_GL_SetAttribute(SDL_GL_CONTEXT_MAJOR_VERSION, 2);
	SDL_GL_SetAttribute(SDL_GL_CONTEXT_MINOR_VERSION, 1);
	SDL_GL_SetAttribute(SDL_GL_DEPTH_SIZE, 24);
	SDL_GL_SetAttribute(SDL_GL_DOUBLEBUFFER, 1);
	if (!getenv("VOX_NOMSAA")) { SDL_GL_SetAttribute(SDL_GL_MULTISAMPLEBUFFERS, 1); SDL_GL_SetAttribute(SDL_GL_MULTISAMPLESAMPLES, 4); }
	win = SDL_CreateWindow("Voxelia - prova del port PS Vita", SDL_WINDOWPOS_CENTERED, SDL_WINDOWPOS_CENTERED, SCR_W, SCR_H, SDL_WINDOW_OPENGL);
	if (!win) { SDL_GL_SetAttribute(SDL_GL_MULTISAMPLEBUFFERS, 0); SDL_GL_SetAttribute(SDL_GL_MULTISAMPLESAMPLES, 0); win = SDL_CreateWindow("Voxelia", 0, 0, SCR_W, SCR_H, SDL_WINDOW_OPENGL); }
	if (!win) { printf("finestra: %s\n", SDL_GetError()); return false; }
	ctx = SDL_GL_CreateContext(win);
	if (!ctx) { printf("GL: %s\n", SDL_GetError()); return false; }
	SDL_GL_SetSwapInterval(getenv("VOX_AUTO") ? 0 : 1);
	printf("GL %s · %s\n", glGetString(GL_VERSION), glGetString(GL_RENDERER));
	return true;
}
void plGfxExit(void) { SDL_GL_DeleteContext(ctx); SDL_DestroyWindow(win); SDL_Quit(); }
void plSwap(void) {
	if (plShotFile[0]) {
		static u8 px[SCR_W * SCR_H * 4];
		glReadPixels(0, 0, SCR_W, SCR_H, GL_RGBA, GL_UNSIGNED_BYTE, px);
		FILE *f = fopen(plShotFile, "wb");
		if (f) {
			fprintf(f, "P6\n%d %d\n255\n", SCR_W, SCR_H);
			for (int y = SCR_H - 1; y >= 0; y--) for (int x = 0; x < SCR_W; x++) fwrite(px + (y * SCR_W + x) * 4, 1, 3, f);
			fclose(f); printf("[prova] immagine %s\n", plShotFile);
		}
		plShotFile[0] = 0;
	}
	SDL_GL_SwapWindow(win);
}

static u32 prevKeys = 0;
static bool prevTouch = false;
void plPoll(PlInput *in) {
	memset(in, 0, sizeof *in);
	SDL_Event ev;
	while (SDL_PollEvent(&ev)) if (ev.type == SDL_QUIT) in->quit = true;
	const u8 *k = SDL_GetKeyboardState(NULL);
	u32 h = 0;
	if (k[SDL_SCANCODE_J] || k[SDL_SCANCODE_SPACE]) h |= KEY_A;
	if (k[SDL_SCANCODE_K] || k[SDL_SCANCODE_ESCAPE] || k[SDL_SCANCODE_BACKSPACE]) h |= KEY_B;
	if (k[SDL_SCANCODE_U]) h |= KEY_Y;
	if (k[SDL_SCANCODE_I]) h |= KEY_X;
	if (k[SDL_SCANCODE_Q]) h |= KEY_L;
	if (k[SDL_SCANCODE_E]) h |= KEY_R;
	if (k[SDL_SCANCODE_RETURN]) h |= KEY_START;
	if (k[SDL_SCANCODE_TAB]) h |= KEY_SELECT;
	if (k[SDL_SCANCODE_UP]) h |= KEY_DUP;
	if (k[SDL_SCANCODE_DOWN]) h |= KEY_DDOWN;
	if (k[SDL_SCANCODE_LEFT]) h |= KEY_DLEFT;
	if (k[SDL_SCANCODE_RIGHT]) h |= KEY_DRIGHT;
	if (k[SDL_SCANCODE_W]) in->ly -= 1;
	if (k[SDL_SCANCODE_S]) in->ly += 1;
	if (k[SDL_SCANCODE_A]) in->lx -= 1;
	if (k[SDL_SCANCODE_D]) in->lx += 1;
	if (k[SDL_SCANCODE_EQUALS] || k[SDL_SCANCODE_KP_PLUS]) in->ry = -1;
	if (k[SDL_SCANCODE_MINUS] || k[SDL_SCANCODE_KP_MINUS]) in->ry = 1;
	// la levetta sinistra genera anche le direzioni "digitali" per i menu, come sulla console
	if (in->ly < -.5f) h |= KEY_CPAD_UP; if (in->ly > .5f) h |= KEY_CPAD_DOWN;
	if (in->lx < -.5f) h |= KEY_CPAD_LEFT; if (in->lx > .5f) h |= KEY_CPAD_RIGHT;
	int mx, my; u32 mb = SDL_GetMouseState(&mx, &my);
	bool t = (mb & SDL_BUTTON(SDL_BUTTON_LEFT)) != 0;
	in->kh = h; in->kd = h & ~prevKeys; in->ku = prevKeys & ~h; prevKeys = h;
	in->touch = t; in->tdown = t && !prevTouch; in->tup = !t && prevTouch; prevTouch = t;
	in->tx = mx; in->ty = my; in->ntouch = t ? 1 : 0;
	if (t && (SDL_GetModState() & KMOD_CTRL)) { in->ntouch = 2; in->t2x = SCR_W / 2; in->t2y = SCR_H / 2; }
}

// tastiera: una piccola finestra di testo disegnata con l'interfaccia del gioco
bool plKeyboard(const char *hint, const char *init, int max, char *out, int outn) {
	const char *auto_ = getenv("VOX_KB");
	if (auto_ || getenv("VOX_AUTO")) { snprintf(out, outn, "%s", auto_ ? auto_ : init); return auto_ != NULL; }
	char buf[256]; snprintf(buf, sizeof buf, "%s", init);
	SDL_StartTextInput();
	bool done = false, ok = false;
	while (!done) {
		SDL_Event ev;
		while (SDL_PollEvent(&ev)) {
			if (ev.type == SDL_QUIT) done = true;
			else if (ev.type == SDL_TEXTINPUT) { if ((int)strlen(buf) + (int)strlen(ev.text.text) <= max) strncat(buf, ev.text.text, sizeof buf - strlen(buf) - 1); }
			else if (ev.type == SDL_KEYDOWN) {
				if (ev.key.keysym.sym == SDLK_RETURN) { ok = true; done = true; }
				else if (ev.key.keysym.sym == SDLK_ESCAPE) done = true;
				else if (ev.key.keysym.sym == SDLK_BACKSPACE) { int l = strlen(buf); while (l > 0 && (buf[l - 1] & 0xC0) == 0x80) l--; if (l > 0) buf[l - 1] = 0; }
			}
		}
		glViewport(0, 0, SCR_W, SCR_H); glClearColor(.05f, .06f, .1f, 1); glClear(GL_COLOR_BUFFER_BIT);
		g2Begin();
		rectR(VW / 2 - 200, VH / 2 - 40, 400, 80, 6, C2D_Color32(24, 29, 44, 250));
		txt(VW / 2 - 190, VH / 2 - 34, .45f, C2D_Color32(245, 185, 66, 255), hint);
		rect(VW / 2 - 190, VH / 2 - 10, 380, 22, C2D_Color32(10, 12, 20, 255));
		char sh[300]; snprintf(sh, sizeof sh, "%s_", buf); txt(VW / 2 - 185, VH / 2 - 8, .5f, C2D_Color32(240, 240, 240, 255), sh);
		txt(VW / 2 - 190, VH / 2 + 18, .34f, C2D_Color32(154, 164, 184, 255), "Invio conferma · Esc annulla");
		g2Flush();
		SDL_GL_SwapWindow(win);
		SDL_Delay(16);
	}
	SDL_StopTextInput();
	prevKeys = ~0u;   // i tasti premuti nella finestra non valgono per il gioco
	if (ok) snprintf(out, outn, "%s", buf);
	return ok;
}

static SDL_AudioDeviceID adev = 0;
static void acb(void *u, Uint8 *stream, int len) { (void)u; auRender((s16 *)stream, len / 4); }
bool plAudioStart(int rate) {
	if (getenv("VOX_NOAUDIO")) return true;
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
#endif
