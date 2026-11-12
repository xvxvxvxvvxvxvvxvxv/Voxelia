# Voxelia PS Vita · novità

Il port ha una versione sua. In ogni versione è indicata anche la versione di Voxelia (il gioco per browser)
da cui arrivano mappe, modelli, nemici, personaggi, missioni e musiche.

## 1.0.1 · contenuti di Voxelia 8.5

**Avvio più sicuro sulla console.** La 1.0 si chiudeva all'avvio con l'errore C2-12828-1 su alcune console.
- Se manca il compilatore di shader della console (`ur0:data/libshacccg.suprx`), il gioco lo dice con un messaggio
  e spiega come estrarlo, invece di chiudersi. Lo cerca anche in `ur0:data/external/`.
- Se gli shader non si compilano o mancano i dati, un messaggio lo dice.
- **Registro di avvio** in `ux0:data/voxelia/log.txt`: memoria libera, ogni passo dell'avvio, le zone caricate e i
  primi fotogrammi. Se il gioco si chiude, l'ultima riga dice dove.
- Stack del thread principale da 1 MB (era quello predefinito), più memoria lasciata a rete, moduli e tastiera,
  e se l'antialiasing 4x non parte il gioco riprova senza.

## 1.0 · contenuti di Voxelia 8.5

**Il primo port per PlayStation Vita.** Nasce dal motore del port 3DS 1.6.1 (che segue la Modalità Storia del
browser), ma è pensato per l'hardware della Vita e per un solo schermo, come il gioco per browser.

- **Dati della 8.5**: 134 zone, 324 modelli animati, 78 nemici e 14 boss, 196 personaggi, 130 missioni e 70 brani,
  riesportati da `voxelia.html` 8.5 con `tools/export.js` e `tools/songs.js`.
- **Grafica con vitaGL** sulla GPU della Vita: proiezione ortografica con il depth buffer, geometria fissa della
  zona in un vertex buffer (fino a 200.000 quadrilateri) divisa in blocchi di 8x8 caselle, luci nello shader
  (fino a 12 per vertice), muri trasparenti davanti all'eroe e la sua sagoma dietro i muri, MSAA 4x a 960x544.
- **Interfaccia su un solo schermo**, come nel browser: HUD sopra il mondo, finestre al centro, tutto si tocca,
  in tre grandezze. Testo con un atlante SDF nitido a ogni grandezza e i simboli dei tasti della Vita.
- **Tocca per muoverti** (come il clic sul terreno del browser: tocca un nemico per attaccarlo, una persona o un
  forziere per usarli), **zoom** con la levetta destra o con due dita.
- **Audio a 44,1 kHz** in stereo su un thread a parte, con il sintetizzatore e i brani del browser.
- **Multigiocatore** con `ws://` e `wss://` (mbedtls), compresi i plugin del server; la Vita si presenta ai plugin
  come `psvita`. Tastiera di sistema per nome, chat, server e codice stanza.
- **Il pannello sviluppatore della 8.5**: trucchi, tempo, zone, missioni, musica, griglia delle collisioni,
  riquadro di debug e prova della zona.
- **La riga dei prezzi nel negozio (8.3.1)** fa il conto giusto, come nel port 3DS 1.7.
- **Build di prova per PC** (SDL2 + OpenGL) con le prove automatiche: tutte le 134 zone, combattimento, dungeon,
  boss, salvataggi, rete in chiaro e TLS, anche con AddressSanitizer.
