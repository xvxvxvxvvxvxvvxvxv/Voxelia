# Voxelia 3DS · novità

Il port ha una versione sua. In ogni versione è indicata anche la versione di Voxelia (il gioco per browser)
da cui arrivano mappe, modelli, nemici, personaggi e missioni.

## 1.6.1 · contenuti di Voxelia 8.3

**Il nome dell'eroe in rete.** All'accensione il gioco prende il nome della console. Se ti collegavi al server
prima di caricare la partita (o cambiavi nome dopo), il server teneva quel nome: in chat, nel pannello admin e nella
lista dei giocatori compariva il nome della console invece di quello dell'eroe. Ora, quando il nome dell'eroe cambia,
il gioco lo comunica subito al server.

## 1.6 · contenuti di Voxelia 8.3

**La difficoltà della Storia è quella del browser.**
- **I nemici seguono due livelli (8.3):** quello del dungeon o della zona (i nemici partono 2 livelli sopra) e il
  tuo (se sei più in alto recuperano il 60% della distanza). Vale nei dungeon e nelle zone aperte, non in città,
  negli interni o nella Torre. Oro e oggetti seguono il livello dei nemici.
- **Avviso all'ingresso dei dungeon:** il livello dei nemici e quello consigliato; se sei sotto, con il punto
  esclamativo e «vai piano».
- **Il regno più difficile (7.11), che sul 3DS non c'era:** nemici più forti secondo la difficoltà, i **Campioni**
  (più grossi, più forti, più bottino), i branchi (un nemico che ti vede chiama i vicini) e l'ultima furia dei boss.
- **I Campioni (8.1/8.3):** al massimo 2 per piano più 1 ogni 10 livelli (uno in più sul piano del boss); la
  probabilità sale con il tuo livello, fino al +12%.
- **Il mercato segue il livello (8.3):** dal livello 5 i prezzi salgono del 2% a livello; in cima al negozio di
  Ugo c'è scritto di quanto.
- **Bilanciamento (8.1/8.3):** Cripta, Fucina e Tempio di Giada con i valori del browser; dati riesportati dalla 8.3.
- Le novità della 8.0 (il Cuore della Corona) e della 8.2 (lo spazio di Aldoria 3026) sono di altre modalità e
  restano solo nel browser.

## 1.5 · contenuti di Voxelia 7.57

**La Modalità Storia è quella del browser.** Prima il port aveva i contenuti della 7.50 e quasi nessuna delle
meccaniche arrivate dopo: in rete chi giocava dal browser vedeva cose che sulla 3DS mancavano, e viceversa.
- **Contenuti della 7.57:** mappe, personaggi, missioni e nemici riesportati (Thalassa e la giungla rifatte, il
  Serraglio, i dungeon «dimensionali», i nuovi interni di Thalassa). Botteghe, stallo, Torre, Viandante e Casa
  degli alleati stanno dove li mette il browser.
- **Nemici condivisi in rete (7.41):** gli stessi nemici per tutti, nello stesso posto, guidati da un solo giocatore;
  i colpi e le cadute arrivano a tutti. Provato con il browser 7.57 in locale in tutti e due i sensi.
- **In rete si vedono** cavallo, animale, compagno (con nome, livello, variante) e titolo degli altri, e i tuoi.
- **Cavalli e corsa**, **animali da compagnia** (con i ritrovamenti), **compagni domati** (sigilli, cattura, mossa
  speciale, livelli ed evoluzione, stalla), **Serraglio** (potenzia, modifica, muta forma, pensione, uova chimera),
  **incroci e varianti** (14 varianti con i loro colori).
- **Elementi:** ogni mostro ha il suo elemento; armi elementali con gli effetti (bruciatura, gelo, fulmine, ...),
  debolezze, Essenze dai mostri, infusione alla Fucina.
- **Scelte:** i boss si arrendono (da soli) e si risparmiano o si finiscono; il Viandante e il suo dilemma del
  giorno; la Casa degli alleati; le tre vie (prezzi e vita) e i titoli sopra l'eroe; la Cronaca.
- **Il regno oltre il mare:** il capitolo completo, dalla Capitana Marina alla Corona di Corallo.
- **Boss a fasi**, **armi che crescono**, **maledizioni dei dungeon**, **scavi**, **eventi a orario**, **diario delle
  scoperte**, **Bottega dei mestieri**, **Torre della Corona**, **duello delle carte**.
- I salvataggi della 1.4 si caricano: le novità si salvano in coda al file.

## 1.4 · contenuti di Voxelia 7.50

**La musica è quella del gioco per browser.** Prima il port generava tutti i brani con il vecchio generatore
procedurale; il browser invece suona brani scritti. Ora:
- **Brani scritti.** Città, menu, foresta, deserto, zone, taverne, notte, boss e arena hanno le stesse note del
  browser: melodia, seconda voce, armonia una terza sotto, basso, batteria e accordi, parte per parte, con le
  variazioni di strumento e volume di ogni parte.
- **Strumenti originali.** Due oscillatori, filtro con apertura, vibrato, attacco e rilascio come le rampe Web
  Audio, batteria con cassa, rullante, piatti e tom, e il riverbero di 2,6 secondi.
- **Brani procedurali dei dungeon** (cripta, tana, piramide, cristallo, fucina, abisso, cittadella, motel…) con il
  seme e i parametri del browser, quindi la stessa sequenza.
- **Cambio di brano** come nell'originale: musica notturna in città e nelle zone vicine, musica del boss quando
  è vicino, dissolvenze tra un brano e l'altro.
- Le note vengono estratte da `voxelia.html` con `tools/songs.js` (in `romfs/music.json`), quindi un aggiornamento
  del gioco si porta sul 3DS rigenerando il file.

**Prestazioni.** Il sintetizzatore gira su un core diverso da quello del gioco (il core 2 sui New 3DS, il core 1
sui 3DS), quindi la musica non toglie fotogrammi; se quel core non è disponibile, torna sul core del gioco. Usa circa
il 10% di un core a 268 MHz.

Confronto con il browser (ogni brano registrato dal codice originale con Web Audio e dal sintetizzatore del
port): somiglianza delle note tra 0,91 e 0,99, volume tra 0,87 e 1,05 di quello originale.

## 1.3 · contenuti di Voxelia 7.50

**Plugin più stabili, anche quelli futuri.**
- **Eventi generici.** C'è un piccolo protocollo che la 3DS capisce da qualunque plugin, anche se non lo conosce:
  `banner`, `avviso`, `chat`, `suono`, `domanda` (con due pulsanti sul touch), `riquadro` (in alto a destra, con
  una barra), `punto` (scintille e scritta su una casella), `menu` (un elenco di scelte o di comandi) e `chiudi`.
  È spiegato in [PLUGIN.md](PLUGIN.md), con un esempio.
- **Aggiornamenti dei plugin conosciuti.** Se un plugin aggiunge un evento che il port non conosce, l'evento
  passa dal protocollo generico. Gli eventi interni sconosciuti si ignorano senza errori; i numeri scritti come
  testo vengono letti lo stesso.
- **La 3DS si presenta ai plugin.** Il plugin può accorgersene con il messaggio `client` (tipo, versione, eventi
  capiti) e scegliere cosa mandare.
- **Comandi letti dal server.** All'avvio la 3DS chiede `/aiuto` senza mostrarlo e la pagina «Funzioni del
  server» elenca i comandi che il server ha davvero, con la loro descrizione. Un plugin nuovo compare lì da solo.
  A usa un comando; Y lo apre nella tastiera, per aggiungere un nome. C'è anche «Scrivi un comando».
- **Più avvisi insieme.** Richieste di teletrasporto, inviti e domande dei plugin si mettono in coda invece di
  sostituirsi.
- **Limite dei messaggi.** La 3DS resta sotto il limite di messaggi ai plugin che il server accetta.

**Testi lunghi e chat.**
- **Testi che scorrono.** I messaggi lunghi non vengono più tagliati con «…»: le lettere scorrono in avanti fino
  alla fine, poi il testo ricomincia. Vale per:
  - le righe della chat sullo schermo superiore, che restano visibili finché non sono scorse tutte;
  - i fumetti sopra gli altri eroi;
  - il testo sotto i titoli grandi e i riquadri dei plugin;
  - la riga scelta nei menu.
- **Registro della chat.** Il pulsante **Chat** sul touch apre il registro della chat, con i messaggi più recenti
  in alto e «Scrivi in chat» come prima riga (anche con Y). Il registro si apre anche dal menu di pausa.

## 1.2 · contenuti di Voxelia 7.50

**I plugin del server per la modalità storia.** Nel browser ogni plugin aggiunge al gioco un suo pezzo di codice
JavaScript, che sulla 3DS non può girare. Ora il port ha la sua versione nativa di quel codice e usa gli stessi
messaggi del server (`{t:'x', pl, e, d}`):

- **Boss del mondo** (`boss`). Il boss compare nella sua zona, più grande e più forte, con la barra della vita in
  alto. I colpi vanno al server: la vita e la vittoria sono quelle di tutta la stanza, e il premio arriva a chi
  l'ha colpito.
- **Caccia al tesoro** (`tesoro`). Vicino al nascondiglio compaiono l'avviso «Qualcosa luccica qui vicino...» e le
  scintille, poi il titolo quando lo trovi.
- **Taglie** (`taglie`). Il gioco dice al server se la cripta del Borgo delle Ceneri è aperta, come fa il browser.
- **Teletrasporto** (`tpa`). Le richieste arrivano sullo schermo touch, con **Accetta** e **Rifiuta**. Con
  `/tpa nome` il gioco controlla, come nel browser, se puoi entrare nella zona dell'altro (cancelli delle missioni,
  punto della storia, livello) e poi ti porta vicino a lui.
- **Ritorno ad Aldoria** (`hub`). `/hub` funziona, con gli stessi controlli: niente nemici vicini, niente colpi
  subiti da poco, niente fossa del Colosseo.
- **Gruppi d'avventura** (`gruppi`). C'è il riquadro dei compagni in alto a sinistra, con vita e zona. Gli inviti
  arrivano sul touch e la chat del gruppo è in verde. Sopra la testa i compagni hanno il nome in verde. Dal
  pannello del gruppo li raggiungi con un tocco.
- **Emote** (`emote`). Le emote compaiono come fumetti sopra gli eroi, e c'è la ruota delle emote.
- **Annunci.** Ci sono i titoli della notte di caccia (`notti`), del torneo (`torneo`), del sindaco (`sindaco`) e
  della gara di pesca (`pesca`).
- **Guardie e ladri** (`guardieladri`). C'è il riquadro della partita. La guardia ha la benda mentre conta e non
  vede i ladri lontani.
- **Link dei plugin.** Lo speedrun e l'albo ricevono l'indirizzo del server, per i link in chat.
- **Pagina «Funzioni del server».** Si apre dal menu di pausa o da Multigiocatore e raccoglie:
  - le emote e il gruppo;
  - Torna ad Aldoria;
  - i comandi dei plugin (`/boss`, `/tesoro`, `/taglie`, `/evento`, `/torneo`, `/classifiche`, `/giornaliero`,
    `/aiuto`);
  - il **registro della chat**, dove si leggono per intero le risposte lunghe dei comandi.
- Le emoji dei messaggi del server, che il font della console non ha, non compaiono più come «?».
- Casa, Discoteca e Mercatino hanno finestre e mappe del browser: dalla 3DS restano i loro comandi in chat, e il
  gioco lo dice invece di non fare nulla.

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
