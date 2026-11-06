# Voxelia DS · novità

Il port ha una versione sua. In ogni versione c'è anche la versione di Voxelia (il gioco per browser) da cui
arrivano mappe, modelli, nemici, personaggi e missioni.

## 1.2.1 · contenuti di Voxelia 7.50

**Il nome dell'eroe in rete.** All'accensione il gioco prende il nome della console. Se ti collegavi al server
prima di caricare la partita (o cambiavi nome dopo), il server teneva quel nome: in chat, nel pannello admin e nella
lista dei giocatori compariva il nome della console invece di quello dell'eroe. Ora, quando il nome dell'eroe cambia,
il gioco lo comunica subito al server.

## 1.2 · contenuti di Voxelia 7.50

**La musica è quella del gioco per browser.** Prima anche la 1.1 usava il vecchio generatore procedurale, mentre
il browser suona brani scritti. Ora il DS usa lo stesso sequencer del port 3DS 1.4:
- **brani scritti** di città, menu, zone, taverne, notte, boss e arena, con melodia, seconda voce, armonia, basso,
  batteria e accordi come nel browser;
- **brani procedurali dei dungeon** con il seme e i parametri del browser;
- **cambio di brano** come nell'originale (notte, boss vicino, dissolvenze).

Il suono non usa più i canali PSG (solo onde quadre): ogni strumento è un'onda campionata (sinusoide, triangolo,
dente di sega o quadra) suonata alla frequenza giusta, con il secondo oscillatore quando ci sono canali liberi, e
il volume a 11 bit per code delle note senza scalini. Il basso ha di nuovo il timbro morbido dell'originale.

## 1.1 · contenuti di Voxelia 7.50

**La musica è di nuovo quella del gioco.**
- **Altezza delle note.** Prima le note uscivano tre ottave più basse. Il PSG del DS genera onde di 8 passi, quindi
  per una nota di frequenza F il timer va impostato a 8×F; ora la frequenza è giusta.
- **Inviluppo.** Ogni nota ha di nuovo l'attacco e il decadimento esponenziale del sintetizzatore del 3DS
  (le rampe Web Audio del browser). Prima basso e cassa restavano a volume pieno fino alla fine.
- **Batteria come nell'originale:**
  - la cassa è una nota che scende da 130 a 40 Hz in 0,12 secondi, piano, al posto del colpo secco e forte;
  - piatti e rullante sono rumore leggero.
- **Tempo e parti.**
  - Ogni brano avanza a sedicesimi come nell'originale (prima i brani a 12 passi andavano più lenti).
  - Tornano il pad e gli accordi del valzer.

**Mappa.** La mappa grande (SELECT o il pulsante Mappa) riempie di nuovo tutto il suo riquadro: prima l'immagine era
limitata alla misura della minimappa e veniva più piccola.

## 1.0 · contenuti di Voxelia 7.50

La prima versione per Nintendo DS / DS Lite / DSi, sulla stessa base del port 3DS 1.3.

- **Grafica.**
  - Mondo isometrico sul 3D del DS: ogni casella è un pavimento più al massimo un blocco, ricavato dai voxel.
  - Luce per casella: giorno, tramonto, notte, torce e la luce intorno all'eroe.
  - I blocchi davanti all'eroe diventano trasparenti.
- **Personaggi e nemici come sprite**, ricavati dai modelli animati; l'eroe mostra arma ed equipaggiamento con i
  colori della rarità.
- **Contenuti e gioco** del port 3DS: zone, dungeon con le leve, missioni, storia, combattimento con catene,
  colpo caricato e stamina, negozi, diario.
- **Multigiocatore** sul server ufficiale o su qualunque `server.js`:
  - Wi-Fi: reti aperte e WEP su DS e DS Lite (WPA/WPA2 sul DSi in modalità DSi), con la scelta della rete dal menu;
  - TLS con mbedtls in un thread a parte;
  - stesso protocollo, stessi plugin e stesso protocollo generico del 3DS.
- **Interfaccia** del 3DS su due bitmap a 8 bit:
  - testo proporzionale con accenti;
  - testi lunghi che scorrono;
  - registro della chat dal pulsante Chat;
  - tastiera sullo schermo touch.
- **Audio:** la musica procedurale del 3DS sui canali PSG.
