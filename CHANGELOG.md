# Voxelia 3DS · novità

Il port ha una versione sua. In ogni versione è indicata anche la versione di Voxelia (il gioco per browser)
da cui arrivano mappe, modelli, nemici, personaggi e missioni.

## 1.1 · contenuti di Voxelia 7.50

- **Leve dei dungeon (7.44).** Nei piani dei dungeon, tranne quello del boss, la scala per il piano di sotto è
  chiusa da una grata. Servono le due leve del piano tirate insieme: ognuna resta giù 18 secondi e quando la tiri
  escono dei guardiani. In rete contano anche le leve tirate dai compagni.
- **Torna l'affondo.** R toccato fa l'affondo dell'arma. Tenuto premuto blocca il bersaglio, oppure passa al
  nemico successivo.
- **Notte.** Le caselle di pavimento più chiare non brillano più come se fossero luci: di notte brillano solo
  fiamme, lampade e finestre accese.
- **Schermo touch.**
  - La barra della stamina sta sotto la riga dell'oro e non copre più la minimappa.
  - I pulsanti delle abilità mostrano il costo senza uscire dal bordo.
- **Missioni.** Nella finestra delle missioni la storia occupa al massimo poche righe; missioni e frammenti sono
  righe che scorrono, quindi restano leggibili anche con molte missioni attive. Lo stesso limite vale per i testi
  lunghi delle altre finestre.
- **Multigiocatore.** Lo stato della connessione («connessione…», «collegato») si aggiorna mentre la finestra è
  aperta.

## 1.0 · contenuti di Voxelia 7.50

La prima versione del port per Nintendo 3DS / 3DS XL / New 3DS / 2DS.

- **Rendering**: motore citro3d con depth buffer, geometria della zona in memoria video a blocchi 8×8 e luci
  calcolate nello shader. C'è il 3D stereoscopico; sui New 3DS gira a 804 MHz.
- **Contenuti della 7.50**, esportati con `tools/export.js`:
  - 129 zone, tra cui Aldoria con i quartieri, Thalassa e gli 8 dungeon;
  - 78 nemici (14 boss) con i modelli animati;
  - 190 personaggi e 130 missioni.
- **Combattimento**:
  - catena di tre colpi per ogni arma e colpo caricato (7.19);
  - stamina, corsa e blocco del bersaglio (7.32).
- **Multigiocatore** sul server ufficiale o su qualunque `server.js`, con `wss://` (mbedtls):
  - altri eroi, chat e ora del mondo condivisa;
  - arena PvP con il negozio dell'Arena;
  - cicli dei dungeon della stanza e comandi dell'admin.
- **Due schermi**: HUD, minimappa, finestre e menu sul touch; musica procedurale sintetizzata sul DSP.
