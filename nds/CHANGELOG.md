# Voxelia DS · novità

Il port ha una versione sua. In ogni versione c'è anche la versione di Voxelia (il gioco per browser) da cui
arrivano mappe, modelli, nemici, personaggi e missioni.

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
