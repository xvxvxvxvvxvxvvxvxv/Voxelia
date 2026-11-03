// Voxelia DS - multigiocatore: client WebSocket (ws:// o wss:// con mbedtls) verso il server.js di Voxelia,
// con lo stesso protocollo del gioco per browser e del port 3DS: hello, posizione 10 volte al secondo ('p'),
// stato degli altri ('s'), chat, ping, ora del mondo condivisa, arena PvP, cicli dei dungeon, plugin.
// La rete gira in un thread a priorità più bassa del gioco: lavora mentre il gioco aspetta il VBlank, così
// l'handshake TLS (circa 2 secondi sul processore del DS) non blocca lo schermo.
// Wi-Fi: prima le reti salvate nelle impostazioni della console; se non basta, una rete scelta dal menu
// (anche WPA2), che il gioco ricorda.
#include "voxelia.h"
#include <dswifi9.h>
#include <wfc.h>
#include <sys/socket.h>
#include <sys/ioctl.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <netdb.h>
#include <errno.h>
#include <mbedtls/ssl.h>
#include <mbedtls/entropy.h>
#include <mbedtls/ctr_drbg.h>
#include <mbedtls/error.h>
#define MBEDTLS_ERR_NET_SEND_FAILED -0x004E
#define MBEDTLS_ERR_NET_RECV_FAILED -0x004C

NetCfg NETC = {"https://otboi2kx101p-production-9y6zqlkz.europe-west1.suga.run", "aldoria", false};
bool netOk = false;
char netStatus[64] = "non collegato";
float netPing = -1;
Peer PEERS[MAXPEER];
static char myId[16];
static int runsN[10];
static float pT = 0;
static int hitSeq = 0;
static char HITS[14][48]; static int NHITS = 0;
static char sayS[64]; static int sayN = 0;
static bool pvpOn = true;

/* ---------------- code di messaggi tra i thread ---------------- */
#define QN 48
typedef struct { char *m[QN]; int h, t; } MQ;
static MQ qin, qout;
static Mutex qlock;
static void qpush(MQ *q, char *s) {
	mutexLock(&qlock);
	int n = (q->t + 1) % QN;
	if (n == q->h) { free(q->m[q->h]); q->h = (q->h + 1) % QN; }   // piena: si scarta il più vecchio
	q->m[q->t] = s; q->t = n;
	mutexUnlock(&qlock);
}
static char *qpop(MQ *q) {
	mutexLock(&qlock);
	char *s = NULL;
	if (q->h != q->t) { s = q->m[q->h]; q->h = (q->h + 1) % QN; }
	mutexUnlock(&qlock);
	return s;
}
static void qclear(MQ *q) { char *s; while ((s = qpop(q))) free(s); }
void netSendRaw(const char *json) { if (netOk || strstr(json, "\"hello\"")) qpush(&qout, strdup(json)); }

/* ---------------- Wi-Fi ---------------- */
// rete scelta dal menu (salvata con le impostazioni)
typedef struct { char ssid[33]; u8 auth; u8 key[32]; u8 ok; } WifiSaved;
WifiSaved WSAV;
WlanBssDesc WSCAN[16]; int NWSCAN = 0;
volatile int wifiReq = 0;   // 1 = cerca le reti, 2 = collegati alla rete WSEL con la chiave WKEY
int WSEL = -1; char WKEY[64];
static volatile bool wifiUp = false, wifiInitDone = false;
static void setSt(const char *s) { snprintf(netStatus, sizeof netStatus, "%s", s); }
static bool waitAssoc(int sec) {
	for (int i = 0; i < sec * 10; i++) {
		int st = Wifi_AssocStatus();
		if (st == ASSOCSTATUS_ASSOCIATED) return true;
		if (st == ASSOCSTATUS_DISCONNECTED && i > 20) return false;
		threadSleep(100000);
	}
	return false;
}
int wifiWpaHidden = 0;
static int doScan(void) {
	wifiWpaHidden = 0;
	static const WlanBssScanFilter filter = {.channel_mask = UINT32_MAX, .target_bssid = {0xff, 0xff, 0xff, 0xff, 0xff, 0xff}};
	if (!wfcBeginScan(&filter)) return 0;
	WlanBssDesc *L = NULL; unsigned n = 0;
	for (int i = 0; i < 100 && !(L = wfcGetScanBssList(&n)); i++) threadSleep(100000);
	NWSCAN = 0;
	if (L) for (unsigned i = 0; i < n && NWSCAN < 16; i++) {
		// DS e DS Lite: il chip Wi-Fi arriva al WEP; il WPA/WPA2 c'è solo sul DSi (in modalità DSi)
		if (!isDSiMode() && (L[i].auth_mask & ~0xF)) { wifiWpaHidden++; continue; }
		WSCAN[NWSCAN++] = L[i];
	}
	return NWSCAN;
}
static bool connectBss(WlanBssDesc *b, const u8 *key) {
	static WlanAuthData auth;   // nella RAM principale, non nello stack
	memset(&auth, 0, sizeof auth);
	b->auth_type = b->auth_mask ? (WlanBssAuthType)(31 - __builtin_clz(b->auth_mask)) : WlanBssAuthType_Open;
	if (key) memcpy(&auth, key, sizeof auth);
	return wfcBeginConnect(b, &auth) && waitAssoc(25);
}
// chiave della rete dalla password (WPA: si calcola una volta sola, poi si ricorda)
static void keyFor(WlanBssDesc *b, const char *pw, u8 *out) {
	memset(out, 0, 32);
	unsigned mask = b->auth_mask, t = mask ? 31 - __builtin_clz(mask) : 0;
	if (t >= WlanBssAuthType_WPA_PSK_TKIP) { WlanAuthData a; wfcDeriveWpaKey(&a, b->ssid, b->ssid_len, pw, strlen(pw)); memcpy(out, &a, 32); }
	else memcpy(out, pw, strlen(pw) > 16 ? 16 : strlen(pw));
}
static bool wifiConnect(void) {
	if (Wifi_AssocStatus() == ASSOCSTATUS_ASSOCIATED) return true;
	// 1) la rete scelta dal menu, se c'è
	if (WSAV.ok) {
		setSt("cerco la rete Wi-Fi…");
		doScan();
		for (int i = 0; i < NWSCAN; i++) if (WSCAN[i].ssid_len == strlen(WSAV.ssid) && !memcmp(WSCAN[i].ssid, WSAV.ssid, WSCAN[i].ssid_len)) {
			setSt("collegamento al Wi-Fi…");
			if (connectBss(&WSCAN[i], WSAV.key)) return true;
		}
	}
	// 2) le reti salvate nelle impostazioni della console
	setSt("collegamento al Wi-Fi…");
	static bool nv = false; if (!nv) { wfcLoadFromNvram(); nv = true; }
	if (wfcGetNumSlots() > 0 && wfcBeginAutoConnect() && waitAssoc(25)) return true;
	setSt("nessuna rete Wi-Fi: sceglila nel menu");
	return false;
}

/* ---------------- TLS e WebSocket ---------------- */
static int sock = -1;
static mbedtls_ssl_context ssl;
static mbedtls_ssl_config conf;
static mbedtls_entropy_context ent;
static mbedtls_ctr_drbg_context drbg;
static bool tls = false, tlsInit = false;
static volatile bool nRun = false, nQuit = false;

static int entSrc(void *d, unsigned char *out, size_t len, size_t *olen) {
	(void)d; static u32 x = 0x9E3779B9u;
	extern volatile u32 VBL;
	for (size_t i = 0; i < len; i++) { x ^= (u32)REG_VCOUNT << 7 ^ (u32)tickGetCount() ^ VBL * 2654435761u; x = x * 1664525u + 1013904223u; touchPosition t; (void)t; out[i] = (u8)(x >> 24); }
	*olen = len; return 0;
}
static int bsend(void *c, const unsigned char *b, size_t n) { (void)c; int r = send(sock, b, n, 0); if (r < 0) return (errno == EWOULDBLOCK || errno == EAGAIN) ? MBEDTLS_ERR_SSL_WANT_WRITE : MBEDTLS_ERR_NET_SEND_FAILED; return r; }
static int brecv(void *c, unsigned char *b, size_t n) { (void)c; int r = recv(sock, b, n, 0); if (r < 0) return (errno == EWOULDBLOCK || errno == EAGAIN) ? MBEDTLS_ERR_SSL_WANT_READ : MBEDTLS_ERR_NET_RECV_FAILED; if (r == 0) return MBEDTLS_ERR_SSL_CONN_EOF; return r; }
static int nsend(const u8 *b, size_t n) {
	size_t o = 0; int tries = 0;
	while (o < n) {
		int r = tls ? mbedtls_ssl_write(&ssl, b + o, n - o) : send(sock, b + o, n - o, 0);
		if (r == MBEDTLS_ERR_SSL_WANT_WRITE || r == MBEDTLS_ERR_SSL_WANT_READ || (!tls && r < 0 && (errno == EWOULDBLOCK || errno == EAGAIN))) { if (++tries > 3000) return -1; threadSleep(2000); continue; }
		if (r <= 0) return -1;
		o += r;
	}
	return 0;
}
// 0 = niente per ora, -1 = connessione chiusa
static int nrecv(u8 *b, size_t n) {
	int r = tls ? mbedtls_ssl_read(&ssl, b, n) : recv(sock, b, n, 0);
	if (tls) { if (r == MBEDTLS_ERR_SSL_WANT_READ || r == MBEDTLS_ERR_SSL_WANT_WRITE) return 0; if (r <= 0) return -1; return r; }
	if (r < 0) return (errno == EWOULDBLOCK || errno == EAGAIN) ? 0 : -1;
	if (r == 0) return -1;
	return r;
}
static void b64(const u8 *in, int n, char *out) {
	static const char T[] = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
	int j = 0;
	for (int i = 0; i < n; i += 3) {
		u32 v = in[i] << 16 | (i + 1 < n ? in[i + 1] << 8 : 0) | (i + 2 < n ? in[i + 2] : 0);
		out[j++] = T[v >> 18 & 63]; out[j++] = T[v >> 12 & 63];
		out[j++] = i + 1 < n ? T[v >> 6 & 63] : '='; out[j++] = i + 2 < n ? T[v & 63] : '=';
	}
	out[j] = 0;
}
static void rnd(u8 *o, int n) { size_t k; entSrc(NULL, o, n, &k); }
static int wsSend(int op, const char *s, size_t n) {
	u8 hd[14]; int h = 0;
	hd[h++] = 0x80 | op;
	if (n < 126) hd[h++] = 0x80 | n;
	else if (n < 65536) { hd[h++] = 0x80 | 126; hd[h++] = n >> 8; hd[h++] = n & 255; }
	else return -1;
	u8 mk[4]; rnd(mk, 4);
	memcpy(hd + h, mk, 4); h += 4;
	u8 *buf = malloc(h + n); if (!buf) return -1;
	memcpy(buf, hd, h);
	for (size_t i = 0; i < n; i++) buf[h + i] = s[i] ^ mk[i & 3];
	int r = nsend(buf, h + n);
	free(buf);
	return r;
}
static void disconnect(void) {
	if (tls) { mbedtls_ssl_close_notify(&ssl); mbedtls_ssl_session_reset(&ssl); }
	if (sock >= 0) { shutdown(sock, 0); closesocket(sock); }
	sock = -1;
}
static bool connectWs(void) {
	char host[100] = "", port[8] = "80", path[64] = "/ws";
	const char *u = NETC.url;
	tls = false;
	if (!strncmp(u, "https://", 8) || !strncmp(u, "wss://", 6)) { tls = true; strcpy(port, "443"); u = strchr(u, '/') + 2; }
	else if (!strncmp(u, "http://", 7) || !strncmp(u, "ws://", 5)) u = strchr(u, '/') + 2;
	int i = 0; while (*u && *u != '/' && *u != ':' && i < 99) host[i++] = *u++; host[i] = 0;
	if (*u == ':') { u++; i = 0; while (*u >= '0' && *u <= '9' && i < 6) port[i++] = *u++; port[i] = 0; }
	if (!host[0]) { setSt("indirizzo non valido"); return false; }
	struct sockaddr_in a; memset(&a, 0, sizeof a); a.sin_family = AF_INET; a.sin_port = htons(atoi(port));
#ifdef VOX_CONNECT
	// solo per le prove: TCP verso un inoltro locale, ma nome del server (SNI e Host) invariato
	a.sin_addr.s_addr = inet_addr(VOX_CONNECT); a.sin_port = htons(atoi(VOX_CONNECT_PORT));
#else
	setSt("cerco il server…");
	if ((a.sin_addr.s_addr = inet_addr(host)) == INADDR_NONE) {
		struct hostent *he = gethostbyname(host);
		if (!he || !he->h_addr_list[0]) { setSt("server non trovato (DNS)"); return false; }
		a.sin_addr.s_addr = *(u32 *)he->h_addr_list[0];
	}
#endif
	setSt("connessione…");
	sock = socket(AF_INET, SOCK_STREAM, 0);
	if (sock < 0 || connect(sock, (struct sockaddr *)&a, sizeof a) < 0) { setSt("server non raggiungibile"); return false; }
	int one = 1; ioctl(sock, FIONBIO, &one);
	if (tls) {
		setSt("connessione sicura…");
		if (!tlsInit) {
			mbedtls_ssl_init(&ssl); mbedtls_ssl_config_init(&conf); mbedtls_ctr_drbg_init(&drbg); mbedtls_entropy_init(&ent);
			mbedtls_entropy_add_source(&ent, entSrc, NULL, 32, MBEDTLS_ENTROPY_SOURCE_STRONG);
			if (mbedtls_ctr_drbg_seed(&drbg, mbedtls_entropy_func, &ent, (const u8 *)"voxeliads", 9) ||
				mbedtls_ssl_config_defaults(&conf, MBEDTLS_SSL_IS_CLIENT, MBEDTLS_SSL_TRANSPORT_STREAM, MBEDTLS_SSL_PRESET_DEFAULT)) { setSt("errore TLS"); return false; }
			// nessuna autorità di certificazione a bordo: la connessione è cifrata ma il certificato non viene verificato
			mbedtls_ssl_conf_authmode(&conf, MBEDTLS_SSL_VERIFY_NONE);
			mbedtls_ssl_conf_rng(&conf, mbedtls_ctr_drbg_random, &drbg);
			if (mbedtls_ssl_setup(&ssl, &conf)) { setSt("errore TLS"); return false; }
			tlsInit = true;
		}
		mbedtls_ssl_session_reset(&ssl);
		mbedtls_ssl_set_hostname(&ssl, host);
		mbedtls_ssl_set_bio(&ssl, NULL, bsend, brecv, NULL);
		int r, w = 0;
		while ((r = mbedtls_ssl_handshake(&ssl)) != 0) {
			if (r != MBEDTLS_ERR_SSL_WANT_READ && r != MBEDTLS_ERR_SSL_WANT_WRITE) { char e[40]; snprintf(e, sizeof e, "TLS fallito (-0x%04x)", -r); setSt(e); return false; }
			if (nQuit || !nRun || ++w > 6000) { setSt("il server non risponde"); return false; }
			threadSleep(5000);
		}
	}
	u8 key[16]; char kb[32]; rnd(key, 16); b64(key, 16, kb);
	char req[512];
	int n = snprintf(req, sizeof req, "GET %s HTTP/1.1\r\nHost: %s\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: %s\r\nSec-WebSocket-Version: 13\r\nOrigin: %s://%s\r\nUser-Agent: VoxeliaDS/" GAME_VER "\r\n\r\n",
		path, host, kb, tls ? "https" : "http", host);
	if (nsend((u8 *)req, n)) { setSt("handshake fallito"); return false; }
	char resp[1024]; int rl = 0; u32 t0 = 0;
	while (rl < (int)sizeof resp - 1) {
		int r = nrecv((u8 *)resp + rl, 1);
		if (r < 0) { setSt("handshake fallito"); return false; }
		if (r == 0) { if (++t0 > 2500) { setSt("il server non risponde"); return false; } threadSleep(4000); continue; }
		rl++; resp[rl] = 0;
		if (rl >= 4 && !memcmp(resp + rl - 4, "\r\n\r\n", 4)) break;
	}
	if (!strstr(resp, " 101")) { setSt("il server ha rifiutato la connessione"); return false; }
	return true;
}

/* ---------------- thread di rete ---------------- */
static Thread nth;
static u8 nstack[24 * 1024] __attribute__((aligned(8)));
static int netLoop(void *arg) {
	(void)arg;
	static u8 rb[40000]; size_t rn = 0;
	if (!Wifi_InitDefault(false)) { setSt("Wi-Fi non disponibile"); }
	wifiInitDone = true;
	while (!nQuit) {
		// richieste dal menu: cerca reti o collegati a una rete
		if (wifiReq == 1) { setSt("cerco le reti Wi-Fi…"); doScan(); wifiReq = 0; setSt(NWSCAN ? "scegli una rete" : "nessuna rete trovata"); }
		if (wifiReq == 2) {
			wifiReq = 0;
			if (WSEL >= 0 && WSEL < NWSCAN) {
				WlanBssDesc *b = &WSCAN[WSEL]; u8 k[32];
				setSt("calcolo la chiave della rete…"); keyFor(b, WKEY, k);
				setSt("collegamento al Wi-Fi…");
				if (connectBss(b, k)) { memset(&WSAV, 0, sizeof WSAV); memcpy(WSAV.ssid, b->ssid, b->ssid_len < 32 ? b->ssid_len : 32); memcpy(WSAV.key, k, 32); WSAV.ok = 1; setSt("Wi-Fi collegato"); }
				else setSt("collegamento al Wi-Fi fallito");
			}
			memset(WKEY, 0, sizeof WKEY);
		}
		if (!nRun) { threadSleep(100000); continue; }
		if (!wifiConnect()) { for (int i = 0; i < 50 && nRun && !nQuit && !wifiReq; i++) threadSleep(100000); continue; }
		wifiUp = true;
		if (!connectWs()) { disconnect(); for (int i = 0; i < 30 && nRun && !nQuit; i++) threadSleep(100000); continue; }
		rn = 0;
		setSt("collegato, in attesa del server…");
		// saluto: codice della stanza e nome
		{ char b[160]; JW w = {b, 0, sizeof b}; jwRaw(&w, "{\"t\":\"hello\",\"code\":"); jwStr(&w, NETC.code); jwRaw(&w, ",\"name\":"); jwStr(&w, P.name); jwRaw(&w, "}");
		  wsSend(1, b, w.n); }
		bool ok = true;
		while (ok && nRun && !nQuit) {
			char *s;
			while ((s = qpop(&qout))) { if (wsSend(1, s, strlen(s))) ok = false; free(s); }
			int r = nrecv(rb + rn, sizeof rb - rn);
			if (r < 0) { ok = false; break; }
			if (r == 0) { threadSleep(8000); continue; }
			rn += r;
			for (;;) {
				if (rn < 2) break;
				int op = rb[0] & 15; size_t l = rb[1] & 127, o = 2;
				if (l == 126) { if (rn < 4) break; l = rb[2] << 8 | rb[3]; o = 4; }
				else if (l == 127) { if (rn < 10) break; l = 0; for (int i = 2; i < 10; i++) l = l << 8 | rb[i]; o = 10; }
				if (l > sizeof rb - 16) { ok = false; break; }
				if (rn < o + l) break;
				if (op == 1) { char *m = malloc(l + 1); if (m) { memcpy(m, rb + o, l); m[l] = 0; qpush(&qin, m); } }
				else if (op == 9) wsSend(10, (char *)rb + o, l);
				else if (op == 8) ok = false;
				memmove(rb, rb + o + l, rn - o - l); rn -= o + l;
			}
		}
		disconnect();
		netOk = false;
		if (nRun && !nQuit) { setSt("riconnessione…"); threadSleep(2000000); }
	}
	return 0;
}

void netInit(void) {
	threadPrepare(&nth, netLoop, NULL, &nstack[sizeof nstack], MAIN_THREAD_PRIO + 1);
	threadStart(&nth);
}
void netExit(void) { nQuit = true; nRun = false; }
void netStart(void) {
	if (!NETC.code[0]) { msg("Scrivi un codice stanza per giocare con gli altri"); return; }
	memset(PEERS, 0, sizeof PEERS);
	qclear(&qin); qclear(&qout);
	nRun = true; NETC.on = true; setSt("connessione…");
}
void netStop(void) { nRun = false; NETC.on = false; netOk = false; memset(PEERS, 0, sizeof PEERS); setSt("non collegato"); }
void netWifiScan(void) { if (wifiInitDone) wifiReq = 1; }
void netWifiJoin(int i, const char *pw) { WSEL = i; snprintf(WKEY, sizeof WKEY, "%s", pw ? pw : ""); wifiReq = 2; }
bool netWifiSecure(int i) { return i >= 0 && i < NWSCAN && WSCAN[i].auth_mask > 1; }
int netWifiCount(void) { return wifiReq == 1 ? 0 : NWSCAN; }
const char *netWifiName(int i, char *out, int n) {
	if (i < 0 || i >= NWSCAN) { out[0] = 0; return out; }
	static const char *AT[8] = {"aperta", "WEP", "WEP", "WEP", "WPA", "WPA2", "WPA", "WPA2"};
	unsigned m = WSCAN[i].auth_mask, t = m ? 31 - __builtin_clz(m) : 0;
	snprintf(out, n, "%.*s|%s · %d/3", WSCAN[i].ssid_len, WSCAN[i].ssid, AT[t & 7], wlanCalcSignalStrength(WSCAN[i].rssi));
	return out;
}
const char *netWifiSaved(void) { return WSAV.ok ? WSAV.ssid : NULL; }
void netWifiSave(FILE *f) { fwrite(&WSAV, sizeof WSAV, 1, f); }
void netWifiLoad(FILE *f) { WifiSaved w; if (fread(&w, sizeof w, 1, f) == 1) { WSAV = w; WSAV.ssid[32] = 0; } }
int netRuns(const char *d) { int i = dgIdx(d); return i >= 0 && i < 10 ? runsN[i] : 0; }

/* ---------------- messaggi in uscita ---------------- */
static const char *TYW[8] = {"swd", "dag", "axe", "ham", "spr", "tri", "stf", "scy"}, *TYH[4] = {"helm", "crn", "hood", "mask"}, *TYC[3] = {"plate", "mail", "robe"}, *TYS[3] = {"kite", "buck", "pav"};
static int tyIdx(const char *s, const char **L, int n, int def) { for (int i = 0; i < n; i++) if (!strcmp(L[i], s)) return i; return def; }
void netSendChat(const char *s) {
	if (!netOk || !s || !*s) return;
	char b[400]; JW w = {b, 0, sizeof b};
	jwRaw(&w, "{\"t\":\"chat\",\"s\":"); jwStr(&w, s); jwRaw(&w, ",\"z\":"); jwStr(&w, Zk); jwRaw(&w, "}");
	netSendRaw(b);
	if (s[0] != '/') { snprintf(sayS, sizeof sayS, "%.60s", s); sayN = (int)(osGetTime() % 1000000); }
	chatLog(P.name, s, 0);
}
// messaggi per i plugin del server: {t:'x', pl, e, d} (d è già JSON)
void netSendX(const char *pl, const char *e, const char *d) {
	if (!netOk) return;
	// il server accetta al massimo 30 messaggi ai plugin al secondo: si resta sotto
	static u64 sec = 0; static int cnt = 0; u64 now = osGetTime() / 1000;
	if (now != sec) { sec = now; cnt = 0; }
	if (++cnt > 24) return;
	char b[1024]; JW w = {b, 0, sizeof b};
	jwRaw(&w, "{\"t\":\"x\",\"pl\":"); jwStr(&w, pl); jwRaw(&w, ",\"e\":"); jwStr(&w, e); jwRaw(&w, ",\"d\":"); jwRaw(&w, d && *d ? d : "null"); jwRaw(&w, "}");
	if (w.n < (int)sizeof b - 1) netSendRaw(b);
}
const char *netMyId(void) { return netOk ? myId : ""; }
void netSendHit(const char *to, int d, bool cr) {
	char b[96]; snprintf(b, sizeof b, "{\"t\":\"hit\",\"to\":\"%s\",\"d\":%d,\"cr\":%s}", to, d, cr ? "true" : "false"); netSendRaw(b);
}
void netSendKo(const char *by) { char b[64]; snprintf(b, sizeof b, "{\"t\":\"ko\",\"by\":\"%s\"}", by); netSendRaw(b); }
void netSendDgDone(const char *d, int run) { char b[96]; snprintf(b, sizeof b, "{\"t\":\"dgdone\",\"d\":\"%s\",\"run\":%d}", d, run); netSendRaw(b); }
// danni ai nemici condivisi: [id del nemico, frazione della vita, numero progressivo], come NET.hits dell'originale
void netEnemyHit(int id, float frac) {
	if (!netOk) return;
	if (NHITS >= 14) { memmove(HITS, HITS + 1, sizeof HITS[0] * 13); NHITS = 13; }
	snprintf(HITS[NHITS++], 48, "[%d,%.4f,%d]", id, frac, ++hitSeq);
}
static void sendState(void) {
	char b[1400]; JW w = {b, 0, sizeof b};
	char rk[64]; rmKey(rk, sizeof rk);
	int c, h, ww, s, tw, th, tc, ts; heroEqPack(&c, &h, &ww, &s, &tw, &th, &tc, &ts);
	jwRaw(&w, "{\"t\":\"p\",\"d\":{\"rm\":"); jwStr(&w, rk);
	jwRaw(&w, ",\"zk\":"); jwStr(&w, Zk);
	jwRaw(&w, ",\"n\":"); jwStr(&w, P.name);
	jwf(&w, ",\"df\":%d,\"g\":%d,\"x\":%.2f,\"y\":%.2f,\"hp\":%d,\"mx\":%d,\"lv\":%d,\"fa\":%d,\"c\":%d,\"h\":%d,\"w\":%d,\"wv\":%d,\"s\":%d",
		P.df, P.g, P.px, P.py, (int)fmaxf(0, P.hp), P.mx, P.lv, P.face & 7, c, h, ww, P.eq[SL_W].used ? iv(&P.eq[SL_W]) : 3, s);
	jwf(&w, ",\"ty\":\"%s.%s.%s.%s\",\"sw\":%d,\"hit\":[", TYW[clampi(tw, 0, 7)], h < 0 ? "-" : TYH[clampi(th, 0, 3)], c < 0 ? "-" : TYC[clampi(tc, 0, 2)], s < 0 ? "-" : TYS[clampi(ts, 0, 2)], P.swc);
	for (int i = 0; i < NHITS; i++) { if (i) jwRaw(&w, ","); jwRaw(&w, HITS[i]); }
	jwRaw(&w, "]");
	if (sayN) { jwRaw(&w, ",\"say\":{\"s\":"); jwStr(&w, sayS); jwf(&w, ",\"n\":%d}", sayN); }
	{ extern void levPack(char *, int); char lp[64]; levPack(lp, sizeof lp); jwRaw(&w, lp); }
	jwRaw(&w, "}}");
	netSendRaw(b);
}

/* ---------------- messaggi in arrivo ---------------- */
static JArena NA;
int dbgMsgs, dbgS, dbgFail; char dbgLast[24];
static Peer *peerGet(const char *id, bool make) {
	for (int i = 0; i < MAXPEER; i++) if (PEERS[i].used && !strcmp(PEERS[i].id, id)) return &PEERS[i];
	if (!make) return NULL;
	for (int i = 0; i < MAXPEER; i++) if (!PEERS[i].used) { memset(&PEERS[i], 0, sizeof(Peer)); PEERS[i].used = true; snprintf(PEERS[i].id, sizeof PEERS[i].id, "%s", id); return &PEERS[i]; }
	return NULL;
}
extern void enemyNetHit(int id, float frac);
extern char WHO[24][96]; extern int NWHO;
extern int arPts[4];
static void setTime(J *gm) { if (gm && gm->t == JNUM) P.gt = (float)gm->d; }
static void onMsg(J *m) {
	const char *t = jgs(m, "t", "");
	if (!strcmp(t, "id")) {
		netOk = true; snprintf(myId, sizeof myId, "%s", jgs(m, "id", "")); setSt("collegato");
		memset(runsN, 0, sizeof runsN);
		JFOR(r, jget(m, "runs")) { int i = dgIdx(r->key); if (i >= 0) runsN[i] = (int)jnum(r, 0); }
		J *ar = jget(m, "ar"); arPts[0] = (int)jgn(ar, "w", 0); arPts[1] = (int)jgn(ar, "l", 0); arPts[2] = (int)jgn(ar, "pts", 0); arPts[3] = (int)jgn(ar, "ap", 0);
		setTime(jget(m, "gm"));
		chatLog("", "Collegato al server di Voxelia", 1);
		plOnConnect();
	} else if (!strcmp(t, "s")) {
		J *p = jget(m, "p");
		bool seen[MAXPEER] = {0};
		JFOR(q, p) {
			Peer *o = peerGet(q->key, true); if (!o) continue;
			seen[o - PEERS] = true;
			bool fresh = !o->n[0];
			snprintf(o->rm, sizeof o->rm, "%s", jgs(q, "rm", ""));
			snprintf(o->n, sizeof o->n, "%.14s", jgs(q, "n", "Eroe"));
			o->tx = jgn(q, "x", o->tx); o->ty = jgn(q, "y", o->ty);
			if (fresh) { o->x = o->tx; o->y = o->ty; char rk[64]; rmKey(rk, sizeof rk); if (!strcmp(o->rm, rk)) msg("%s è qui", o->n); }
			o->hp = (int)jgn(q, "hp", 1); o->mx = (int)jgn(q, "mx", 1); o->lv = (int)jgn(q, "lv", 1); o->fa = (int)jgn(q, "fa", 0) & 7;
			o->c = (int)jgn(q, "c", -1); o->h = (int)jgn(q, "h", -1); o->w = (int)jgn(q, "w", 0); o->s = (int)jgn(q, "s", -1); o->wv = (int)jgn(q, "wv", 3);
			const char *ty = jgs(q, "ty", "swd.-.-.-");
			char tb[48]; snprintf(tb, sizeof tb, "%s", ty);
			char *parts[4] = {tb, NULL, NULL, NULL}; int np = 1;
			for (char *c2 = tb; *c2 && np < 4; c2++) if (*c2 == '.') { *c2 = 0; parts[np++] = c2 + 1; }
			o->tw = tyIdx(parts[0] ? parts[0] : "swd", TYW, 8, 0); o->th = parts[1] ? tyIdx(parts[1], TYH, 4, 0) : 0; o->tc = parts[2] ? tyIdx(parts[2], TYC, 3, 0) : 0; o->ts = parts[3] ? tyIdx(parts[3], TYS, 3, 0) : 0;
			int sw = (int)jgn(q, "sw", 0); if (sw != o->swc) { o->swc = sw; o->sw = .2f; }
			J *say = jget(q, "say");
			if (say) { int n = (int)jgn(say, "n", 0); if (n != o->sayN) { o->sayN = n; snprintf(o->bub, sizeof o->bub, "%.60s", jgs(say, "s", "")); o->bt = fmaxf(5, marqueeTime(o->bub, .38f, 150) + 1.5f); } }
			// danni ai nemici fatti dagli altri: valgono anche qui
			static int lastSeq[MAXPEER];
			int pi = o - PEERS; if (fresh) lastSeq[pi] = 0;
			JFOR(h, jget(q, "hit")) {
				int id = (int)jnum(jat(h, 0), -1), seq = (int)jnum(jat(h, 2), 0);
				if (seq <= lastSeq[pi]) continue;
				char rk[64]; rmKey(rk, sizeof rk);
				if (!fresh && !strcmp(o->rm, rk)) enemyNetHit(id, (float)jnum(jat(h, 1), 0));
				lastSeq[pi] = seq;
			}
		}
		for (int i = 0; i < MAXPEER; i++) if (PEERS[i].used && !seen[i]) PEERS[i].used = false;
		// le leve tirate dai compagni dello stesso piano
		{ extern bool levPeer[2], levPeerOpen; levPeer[0] = levPeer[1] = levPeerOpen = false; char rk[64]; rmKey(rk, sizeof rk);
		  JFOR(q, p) { if (strcmp(jgs(q, "rm", ""), rk)) continue; JFOR(l, jget(q, "lvr")) { const char *id = jstr(l, ""); if (!strcmp(id, "L1")) levPeer[0] = true; if (!strcmp(id, "L2")) levPeer[1] = true; } if (jgn(q, "lvo", 0)) levPeerOpen = true; } }
	} else if (!strcmp(t, "pi")) {
		char b[64]; snprintf(b, sizeof b, "{\"t\":\"po\",\"s\":%.0f}", jgn(m, "s", 0)); netSendRaw(b);
		netPing = jgn(m, "me", -1); setTime(jget(m, "gm"));
	} else if (!strcmp(t, "time")) { setTime(jget(m, "gm")); if (jget(m, "s")) msg("%s", jgs(m, "s", "")); }
	else if (!strcmp(t, "chat")) {
		const char *z = jgs(m, "z", "");
		char who[64]; if (z[0] && strcmp(z, Zk)) snprintf(who, sizeof who, "%s (%s)", jgs(m, "n", "?"), zoneTitle(z)); else snprintf(who, sizeof who, "%s", jgs(m, "n", "?"));
		if (!plChatFilter(jgs(m, "n", ""), jgs(m, "s", ""), jgn(m, "adm", 0) != 0)) chatLog(who, jgs(m, "s", ""), jgn(m, "adm", 0) ? 1 : 0);
	} else if (!strcmp(t, "x")) plOnMsg(jgs(m, "pl", ""), jgs(m, "e", ""), jget(m, "d")); else if (!strcmp(t, "join")) { char b[80]; snprintf(b, sizeof b, "%s %s", jgs(m, "n", "?"), jgn(m, "j", 0) ? "è entrato nella stanza" : "ha lasciato la stanza"); chatLog("", b, 1); }
	else if (!strcmp(t, "ann")) { msg("%s", jgs(m, "s", "")); chatLog("", jgs(m, "s", ""), 1); tone(660, .12f, W_TRIANGLE, .05f); }
	else if (!strcmp(t, "err")) { msg("%s", jgs(m, "s", "")); tone(150, .15f, W_SQUARE, .05f); }
	else if (!strcmp(t, "cfg")) { pvpOn = jgn(jget(m, "c"), "pvp", 1) != 0; }
	else if (!strcmp(t, "kick")) { netStop(); uiOpenText("Disconnesso dal server", jgs(m, "s", "Sei stato disconnesso dal server."), "I progressi restano salvati sulla scheda SD."); }
	else if (!strcmp(t, "runs")) { memset(runsN, 0, sizeof runsN); JFOR(r, jget(m, "runs")) { int i = dgIdx(r->key); if (i >= 0) runsN[i] = (int)jnum(r, 0); } }
	else if (!strcmp(t, "hit")) { if (pvpOn) hurtPvp((int)jgn(m, "d", 1), jgn(m, "cr", 0) != 0, jgs(m, "from", ""), jgs(m, "n", "?")); }
	else if (!strcmp(t, "ar")) {
		J *ar = jget(m, "ar"); arPts[0] = (int)jgn(ar, "w", 0); arPts[1] = (int)jgn(ar, "l", 0); arPts[2] = (int)jgn(ar, "pts", 0); arPts[3] = (int)jgn(ar, "ap", 0);
		if (jget(m, "gain")) { char b[96]; snprintf(b, sizeof b, "Hai battuto %s · +%d punti arena", jgs(m, "vs", "?"), (int)jgn(m, "gain", 0)); banner("Vittoria nella fossa!", b); JINGLE(.09f, W_SQUARE, 72, 76, 79, 84, 88); }
		else if (jget(m, "lost")) { char b[80]; snprintf(b, sizeof b, "%s ha vinto il duello", jgs(m, "lost", "?")); banner("Sconfitta", b); }
	} else if (!strcmp(t, "bought")) {
		J *ar = jget(m, "ar"); arPts[3] = (int)jgn(ar, "ap", arPts[3]);
		extern Item arItem(int k, int lv); Item it = arItem((int)jgn(m, "k", 0), P.lv);
		if (P.ninv < INV) P.inv[P.ninv++] = it; msg("Acquistato: %s", it.n); JINGLE(.08f, W_SQUARE, 67, 72, 76, 79); saveGame();
	} else if (!strcmp(t, "who")) {
		NWHO = 0;
		JFOR(q, jget(m, "list")) { if (NWHO >= 24) break; snprintf(WHO[NWHO++], 96, "%s · Lv %d · %s%s", jgs(q, "n", "?"), (int)jgn(q, "lv", 1), zoneTitle(jgs(q, "z", "town")), jgn(q, "me", 0) ? " (tu)" : ""); }
	} else if (!strcmp(t, "profq")) {
		char b[200]; snprintf(b, sizeof b, "{\"t\":\"profr\",\"to\":\"%s\",\"d\":{\"lv\":%d,\"df\":%d,\"hp\":%d,\"mx\":%d,\"g\":%d,\"k\":%d,\"z\":\"3DS\"}}", jgs(m, "from", ""), P.lv, P.df, (int)P.hp, P.mx, P.g, P.kills); netSendRaw(b);
	} else if (!strcmp(t, "adm")) {
		const char *a = jgs(m, "a", ""); int n = (int)jgn(m, "n", 1); if (n < 1) n = 1;
		char b[80] = "";
		if (!strcmp(a, "gold")) { P.g += n; snprintf(b, sizeof b, "+%d oro", n); }
		else if (!strcmp(a, "xp")) { gainXP(n); snprintf(b, sizeof b, "+%d XP", n); }
		else if (!strcmp(a, "pot")) { P.pot += n; snprintf(b, sizeof b, "+%d pozioni", n); }
		else if (!strcmp(a, "lv")) { for (int i = 0; i < n; i++) gainXP(needXP() - P.xp > 0 ? needXP() - P.xp : 1); snprintf(b, sizeof b, "+%d livelli", n); }
		else if (!strcmp(a, "item")) { Item it = mkItem(P.lv + 1, clampi((int)jgn(m, "r", 0), 0, 3), -1); gain(it); snprintf(b, sizeof b, "un oggetto: %s", it.n); }
		else if (!strcmp(a, "heal")) { P.hp = P.mx; snprintf(b, sizeof b, "cura completa"); }
		else if (!strcmp(a, "tp")) { goZone("town"); snprintf(b, sizeof b, "teletrasporto ad Aldoria"); }
		if (b[0]) { msg("Dall'admin: %s", b); chatLog("", b, 1); JINGLE(.09f, W_TRIANGLE, 72, 79, 84); saveGame(); }
	}
}

void netTick(float dt) {
	if (!NA.cap) jaInit(&NA, 256 * 1024);
	char *s;
	int n = 0;
	while ((s = qpop(&qin)) && n < 40) {
		jaReset(&NA);
		J *m = jParse(&NA, s, strlen(s));
		dbgMsgs++; if (!m) dbgFail++;
		if (m && m->t == JOBJ) { snprintf(dbgLast, sizeof dbgLast, "%s", jgs(m, "t", "?")); if (!strcmp(dbgLast, "s")) dbgS++; onMsg(m); }
		free(s); n++;
	}
	// gli altri si muovono morbidi verso l'ultima posizione ricevuta
	for (int i = 0; i < MAXPEER; i++) {
		Peer *o = &PEERS[i]; if (!o->used) continue;
		float k = fminf(1, dt * 10), ox = o->x, oy = o->y;
		o->x += (o->tx - o->x) * k; o->y += (o->ty - o->y) * k;
		o->mv = hyp(o->x - ox, o->y - oy) > .002f ? .2f : o->mv - dt;
		o->sw -= dt; o->bt -= dt; o->fl -= dt;
	}
	if (!netOk || !started) return;
	if ((pT += dt) >= .1f) { pT = 0; sendState(); }
}
