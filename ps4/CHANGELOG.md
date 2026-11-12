# Voxelia PS4 · novità

Il port ha una versione sua. In ogni versione è indicata anche la versione di Voxelia (il gioco per browser)
da cui arrivano mappe, modelli, nemici, personaggi, missioni e musiche.

## 1.0 · contenuti di Voxelia 8.5

**Il primo port per PlayStation 4**, in un pacchetto PKG. Nasce dal motore del port PS Vita 1.0 (che segue la
Modalità Storia del browser fino alla 8.5), ma è pensato per la PS4 e per il televisore, come il gioco per browser
su un monitor grande.

- **Dati della 8.5**: 134 zone, 324 modelli animati, 78 nemici e 14 boss, 196 personaggi, 130 missioni e 70 brani,
  gli stessi del port Vita esportati da `voxelia.html` 8.5.
- **1920x1080 a schermo intero** con un quarto di mondo in più in larghezza rispetto alla Vita e l'interfaccia del
  browser sopra il mondo, in tre grandezze per il divano.
- **Rasterizzatore software su sei core** (`source/sw.c`) al posto di vitaGL: depth buffer, luci per vertice (fino
  a 12), trasparenze, sagoma dell'eroe dietro i muri, testo SDF con i simboli del DualShock 4; lo schermo è diviso
  in fasce di righe tra i thread, che copiano le loro righe finite nei tre buffer di `sceVideoOut` a 60 Hz.
  Niente GPU vuol dire niente Piglet né compilatore di shader: funziona su ogni firmware che apre gli homebrew.
- **DualShock 4**: L1 interagisci, R1 affondo, L2 e R2 zoom, OPTIONS pausa, clic del touchpad mappa;
  **il touchpad è il mouse del browser** (scorri per il puntatore, tocco leggero o R3 per cliccare il terreno,
  i nemici, le persone, i pulsanti e le finestre). La barra luminosa diventa d'oro.
- **Tastiera a schermo** del gioco per nome, chat, server e codice stanza (accenti e simboli compresi).
- **Audio a 48 kHz** in stereo su un thread a parte, con il sintetizzatore e i brani del browser.
- **Multigiocatore** con `ws://` e `wss://` (sceNet con il risolutore DNS della console, mbedtls 2.28 incluso nel
  port); la PS4 si presenta ai plugin come `ps4`.
- **Il pannello sviluppatore della 8.5**: trucchi, tempo, zone, missioni, musica, griglia delle collisioni,
  riquadro di debug e prova della zona.
- Salvataggi, impostazioni e registro di avvio in `/data/voxelia/`.
- **Build di prova per PC** (SDL2) con lo stesso rasterizzatore e le prove automatiche: tutte le 134 zone,
  combattimento, dungeon, finestre, tastiera a schermo e rete con due giocatori, anche con AddressSanitizer.
