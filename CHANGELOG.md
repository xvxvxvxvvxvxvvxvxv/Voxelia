# Voxelia DS · novità

Il port ha una versione sua. In ogni versione c'è anche la versione di Voxelia (il gioco per browser) da cui
arrivano mappe, modelli, nemici, personaggi e missioni.

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
