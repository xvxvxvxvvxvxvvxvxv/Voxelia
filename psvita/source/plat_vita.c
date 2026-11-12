// Voxelia PS Vita - la console: vitaGL (GPU SGX543MP4+, MSAA 4x a 960x544), levette e tasti (sceCtrl), schermo
// frontale (sceTouch), audio a 44,1 kHz su un thread (sceAudioOut), tastiera di sistema (sceImeDialog),
// rete (sceNet + socket BSD per mbedtls) e il nome dell'utente (sceAppUtil).
#ifdef __vita__
#include "voxelia.h"
#include "glinc.h"
#include <psp2/kernel/processmgr.h>
#include <psp2/kernel/threadmgr.h>
#include <psp2/kernel/rng.h>
#include <psp2/kernel/sysmem.h>
#include <psp2/ctrl.h>
#include <psp2/touch.h>
#include <psp2/audioout.h>
#include <psp2/apputil.h>
#include <psp2/system_param.h>
#include <psp2/ime_dialog.h>
#include <psp2/common_dialog.h>
#include <psp2/sysmodule.h>
#include <psp2/net/net.h>
#include <psp2/net/netctl.h>
#include <psp2/power.h>
#include <psp2/io/stat.h>
#include <psp2/message_dialog.h>
#include <stdarg.h>

// memoria: il gioco usa il heap di newlib (zone, modelli, geometria), vitaGL il resto per la GPU
int _newlib_heap_size_user = 160 * 1024 * 1024;
const SceSize sceUserMainThreadStackSize = 1024 * 1024;   // il motore usa qualche buffer sullo stack: 1 MB invece di 256 KB

u64 osGetTime(void) { return sceKernelGetProcessTimeWide() / 1000; }
void plSleepMs(int ms) { sceKernelDelayThread(ms * 1000); }
void plMutexInit(plMutex *m) { pthread_mutex_init(&m->m, NULL); }
void plMutexLock(plMutex *m) { pthread_mutex_lock(&m->m); }
void plMutexUnlock(plMutex *m) { pthread_mutex_unlock(&m->m); }
typedef struct { plThreadFn fn; void *arg; } TA;
static void *thTramp(void *p) { TA a = *(TA *)p; free(p); a.fn(a.arg); return NULL; }
bool plThreadStart(plThreadFn fn, void *arg, int stackKb, pthread_t *out) {
	TA *a = malloc(sizeof *a); a->fn = fn; a->arg = arg;
	pthread_attr_t at; pthread_attr_init(&at); pthread_attr_setstacksize(&at, stackKb * 1024);
	bool ok = pthread_create(out, &at, thTramp, a) == 0;
	pthread_attr_destroy(&at);
	return ok;
}
void plRandom(void *buf, size_t n) {
	u8 *b = buf;
	while (n) { size_t k = n > 64 ? 64 : n; sceKernelGetRandomNumber(b, k); b += k; n -= k; }
}
void plMkdirs(void) { sceIoMkdir("ux0:data", 0777); sceIoMkdir(SAVE_ROOT, 0777); }
void plUserName(char *out, int n) {
	SceChar8 nm[SCE_SYSTEM_PARAM_USERNAME_MAXSIZE] = "";
	if (sceAppUtilSystemParamGetString(SCE_SYSTEM_PARAM_ID_USERNAME, nm, sizeof nm) < 0) nm[0] = 0;
	// solo lettere, numeri e pochi segni, come il nome dell'eroe nel browser
	int j = 0; for (int i = 0; nm[i] && j < n - 1 && j < 14; i++) { unsigned char c = nm[i]; if (c >= 32 && c < 127) out[j++] = c; }
	out[j] = 0;
}

/* ---------------- registro di avvio ed errori ---------------- */
// Ogni passo dell'avvio finisce in ux0:data/voxelia/log.txt: se il gioco si chiude, l'ultima riga dice dove.
void plLog(const char *fmt, ...) {
	static bool first = true;
	if (first) plMkdirs();
	FILE *f = fopen(SAVE_ROOT "/log.txt", first ? "w" : "a");
	first = false;
	if (!f) return;
	va_list ap; va_start(ap, fmt); vfprintf(f, fmt, ap); va_end(ap);
	fputc('\n', f); fclose(f);
}
static bool vglOk = false;
void plFatal(const char *msg) {
	plLog("ERRORE: %s", msg);
	if (vglOk) {
		SceMsgDialogUserMessageParam up; memset(&up, 0, sizeof up);
		up.buttonType = SCE_MSG_DIALOG_BUTTON_TYPE_OK; up.msg = (const SceChar8 *)msg;
		SceMsgDialogParam p; sceMsgDialogParamInit(&p);
		p.mode = SCE_MSG_DIALOG_MODE_USER_MSG; p.userMsgParam = &up;
		if (sceMsgDialogInit(&p) >= 0) {
			while (sceMsgDialogGetStatus() != SCE_COMMON_DIALOG_STATUS_FINISHED) {
				glClearColor(.05f, .06f, .1f, 1); glClear(GL_COLOR_BUFFER_BIT);
				vglSwapBuffers(GL_TRUE);
			}
			sceMsgDialogTerm();
		}
	}
	sceKernelExitProcess(0);
}
static bool fileExists(const char *p) { SceIoStat st; return sceIoGetstat(p, &st) >= 0; }

bool plGfxInit(void) {
	plLog("Voxelia PS Vita " PORT_VER " (dati " DATA_VER "): avvio");
	// la CPU a 444 MHz e la GPU a 222 MHz, come i giochi che ne hanno bisogno
	scePowerSetArmClockFrequency(444); scePowerSetBusClockFrequency(222);
	scePowerSetGpuClockFrequency(222); scePowerSetGpuXbarClockFrequency(166);
	SceAppUtilInitParam ip; SceAppUtilBootParam bp; memset(&ip, 0, sizeof ip); memset(&bp, 0, sizeof bp);
	sceAppUtilInit(&ip, &bp);
	SceCommonDialogConfigParam cp; sceCommonDialogConfigParamInit(&cp);
	sceAppUtilSystemParamGetInt(SCE_SYSTEM_PARAM_ID_LANG, (int *)&cp.language);
	cp.enterButtonAssign = SCE_SYSTEM_PARAM_ENTER_BUTTON_CROSS;
	sceCommonDialogSetConfigParam(&cp);
	SceKernelFreeMemorySizeInfo mi; mi.size = sizeof mi;
	if (sceKernelGetFreeMemorySize(&mi) >= 0) plLog("memoria libera: utente %d KB, cdram %d KB, phycont %d KB", mi.size_user / 1024, mi.size_cdram / 1024, mi.size_phycont / 1024);
	// la GPU prende quasi tutta la memoria che resta: 24 MB restano per thread, rete, moduli e tastiera
	if (!vglInitExtended(0, SCR_W, SCR_H, 24 * 1024 * 1024, SCE_GXM_MULTISAMPLE_4X)) {
		plLog("vitaGL con MSAA 4x non parte: riprovo senza");
		if (!vglInitExtended(0, SCR_W, SCR_H, 24 * 1024 * 1024, SCE_GXM_MULTISAMPLE_NONE)) { plLog("ERRORE: vitaGL non parte"); return false; }
	}
	vglOk = true;
	plLog("vitaGL pronto");
	// vitaGL compila gli shader sulla console con il compilatore di sistema: senza, il gioco non può disegnare
	bool sh1 = fileExists("ur0:data/libshacccg.suprx"), sh2 = fileExists("ur0:data/external/libshacccg.suprx");
	plLog("libshacccg.suprx: ur0:data %s, ur0:data/external %s", sh1 ? "sì" : "no", sh2 ? "sì" : "no");
	if (!sh1 && !sh2)
		plFatal("Manca il compilatore di shader della console (ur0:data/libshacccg.suprx).\n\n"
			"Voxelia, come quasi tutti gli homebrew in 3D, ne ha bisogno per disegnare il mondo. "
			"Estrailo con ShaRKBR33D (cerca \"extract libshacccg.suprx\" nella Vita Troubleshooting Guide), poi riavvia il gioco.");
	vglSetupRuntimeShaderCompiler(SHARK_OPT_UNSAFE, GL_TRUE, GL_FALSE, GL_TRUE);
	vglWaitVblankStart(GL_TRUE);
	sceCtrlSetSamplingMode(SCE_CTRL_MODE_ANALOG_WIDE);
	sceTouchSetSamplingState(SCE_TOUCH_PORT_FRONT, SCE_TOUCH_SAMPLING_STATE_START);
	sceTouchEnableTouchForce(SCE_TOUCH_PORT_FRONT);
	return true;
}
void plGfxExit(void) { sceKernelExitProcess(0); }
void plSwap(void) { vglSwapBuffers(GL_FALSE); }

static u32 prevKeys = 0;
static bool prevTouch = false;
static float axis(u8 v) {
	float f = (v - 127.5f) / 127.5f;
	if (fabsf(f) < .14f) return 0;   // zona morta
	return f > 0 ? (f - .14f) / .86f : (f + .14f) / .86f;
}
void plPoll(PlInput *in) {
	memset(in, 0, sizeof *in);
	sceKernelPowerTick(SCE_KERNEL_POWER_TICK_DISABLE_AUTO_SUSPEND);
	SceCtrlData pad; memset(&pad, 0, sizeof pad);
	sceCtrlPeekBufferPositive(0, &pad, 1);
	u32 h = 0, b = pad.buttons;
	if (b & SCE_CTRL_CROSS) h |= KEY_A;
	if (b & SCE_CTRL_CIRCLE) h |= KEY_B;
	if (b & SCE_CTRL_SQUARE) h |= KEY_Y;
	if (b & SCE_CTRL_TRIANGLE) h |= KEY_X;
	if (b & SCE_CTRL_LTRIGGER) h |= KEY_L;
	if (b & SCE_CTRL_RTRIGGER) h |= KEY_R;
	if (b & SCE_CTRL_START) h |= KEY_START;
	if (b & SCE_CTRL_SELECT) h |= KEY_SELECT;
	if (b & SCE_CTRL_UP) h |= KEY_DUP;
	if (b & SCE_CTRL_DOWN) h |= KEY_DDOWN;
	if (b & SCE_CTRL_LEFT) h |= KEY_DLEFT;
	if (b & SCE_CTRL_RIGHT) h |= KEY_DRIGHT;
	in->lx = axis(pad.lx); in->ly = axis(pad.ly);
	in->rx = axis(pad.rx); in->ry = axis(pad.ry);
	// la levetta sinistra genera anche le direzioni "digitali" per i menu
	if (in->ly < -.5f) h |= KEY_CPAD_UP; if (in->ly > .5f) h |= KEY_CPAD_DOWN;
	if (in->lx < -.5f) h |= KEY_CPAD_LEFT; if (in->lx > .5f) h |= KEY_CPAD_RIGHT;
	in->kh = h; in->kd = h & ~prevKeys; in->ku = prevKeys & ~h; prevKeys = h;
	SceTouchData td; memset(&td, 0, sizeof td);
	sceTouchPeek(SCE_TOUCH_PORT_FRONT, &td, 1);
	bool t = td.reportNum > 0;
	in->touch = t; in->tdown = t && !prevTouch; in->tup = !t && prevTouch; prevTouch = t;
	in->ntouch = td.reportNum;
	if (t) { in->tx = td.report[0].x / 2.f; in->ty = td.report[0].y / 2.f; }   // il pannello misura 1920x1088
	if (td.reportNum > 1) { in->t2x = td.report[1].x / 2.f; in->t2y = td.report[1].y / 2.f; }
}

/* ---------------- tastiera di sistema ---------------- */
static int u8to16(const char *s, u16 *o, int n) {
	int j = 0;
	while (*s && j < n - 1) {
		u8 c = *s; u32 cp;
		if (c < 0x80) { cp = c; s++; }
		else if ((c & 0xE0) == 0xC0 && s[1]) { cp = ((c & 0x1F) << 6) | (s[1] & 0x3F); s += 2; }
		else if ((c & 0xF0) == 0xE0 && s[1] && s[2]) { cp = ((c & 0x0F) << 12) | ((s[1] & 0x3F) << 6) | (s[2] & 0x3F); s += 3; }
		else { s++; continue; }
		o[j++] = (u16)cp;
	}
	o[j] = 0; return j;
}
static void u16to8(const u16 *s, char *o, int n) {
	int j = 0;
	for (; *s; s++) {
		u32 c = *s;
		if (c < 0x80) { if (j + 1 >= n) break; o[j++] = c; }
		else if (c < 0x800) { if (j + 2 >= n) break; o[j++] = 0xC0 | (c >> 6); o[j++] = 0x80 | (c & 63); }
		else { if (j + 3 >= n) break; o[j++] = 0xE0 | (c >> 12); o[j++] = 0x80 | ((c >> 6) & 63); o[j++] = 0x80 | (c & 63); }
	}
	o[j] = 0;
}
bool plKeyboard(const char *hint, const char *init, int max, char *out, int outn) {
	static u16 ti[128], tx[SCE_IME_DIALOG_MAX_TEXT_LENGTH + 1], buf[SCE_IME_DIALOG_MAX_TEXT_LENGTH + 1];
	u8to16(hint, ti, 128); u8to16(init, tx, max + 1);
	memset(buf, 0, sizeof buf);
	SceImeDialogParam p; sceImeDialogParamInit(&p);
	p.supportedLanguages = 0;
	p.languagesForced = SCE_FALSE;
	p.type = SCE_IME_TYPE_DEFAULT;
	p.option = 0;
	p.textBoxMode = SCE_IME_DIALOG_TEXTBOX_MODE_DEFAULT;
	p.title = ti;
	p.maxTextLength = max;
	p.initialText = tx;
	p.inputTextBuffer = buf;
	if (sceImeDialogInit(&p) < 0) return false;
	bool ok = false;
	for (;;) {
		SceCommonDialogStatus st = sceImeDialogGetStatus();
		if (st == SCE_COMMON_DIALOG_STATUS_FINISHED) {
			SceImeDialogResult r; memset(&r, 0, sizeof r);
			sceImeDialogGetResult(&r);
			ok = r.button == SCE_IME_DIALOG_BUTTON_ENTER;
			break;
		}
		// il gioco resta fermo dietro la tastiera
		glViewport(0, 0, SCR_W, SCR_H); glClearColor(.05f, .06f, .1f, 1); glClear(GL_COLOR_BUFFER_BIT);
		vglSwapBuffers(GL_TRUE);
	}
	sceImeDialogTerm();
	if (ok) u16to8(buf, out, outn);
	prevKeys = ~0u;   // il tasto che ha chiuso la tastiera non vale per il gioco
	return ok;
}

/* ---------------- audio ---------------- */
#define AUN 1024
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
	aport = sceAudioOutOpenPort(SCE_AUDIO_OUT_PORT_TYPE_BGM, AUN, rate, SCE_AUDIO_OUT_MODE_STEREO);
	if (aport < 0) return false;
	int vol[2] = {SCE_AUDIO_OUT_MAX_VOL, SCE_AUDIO_OUT_MAX_VOL};
	sceAudioOutSetVolume(aport, SCE_AUDIO_VOLUME_FLAG_L_CH | SCE_AUDIO_VOLUME_FLAG_R_CH, vol);
	aQuit = false;
	athOk = plThreadStart(audioLoop, NULL, 128, &ath);
	return athOk;
}
void plAudioStop(void) {
	aQuit = true;
	if (athOk) pthread_join(ath, NULL);
	athOk = false;
	if (aport >= 0) sceAudioOutReleasePort(aport);
	aport = -1;
}

/* ---------------- rete ---------------- */
static void *netMem = NULL;
bool plNetInit(void) {
	if (sceSysmoduleLoadModule(SCE_SYSMODULE_NET) < 0) return false;
	SceNetInitParam np;
	int sz = 1 * 1024 * 1024;
	netMem = malloc(sz);
	np.memory = netMem; np.size = sz; np.flags = 0;
	int r = sceNetInit(&np);
	if (r < 0 && r != (int)SCE_NET_ERROR_EBUSY) return false;
	sceNetCtlInit();
	return true;
}
void plNetExit(void) { sceNetCtlTerm(); sceNetTerm(); sceSysmoduleUnloadModule(SCE_SYSMODULE_NET); free(netMem); netMem = NULL; }
#endif
