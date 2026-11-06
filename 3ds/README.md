# Voxelia 3DS 1.6 — Il Regno Perduto

Versione del port: **1.6** (contenuti di Voxelia **8.3**, le novità sono in [CHANGELOG.md](CHANGELOG.md)).

Port per **Nintendo 3DS / 3DS XL** (e New 3DS / 2DS) di *Voxelia 8.3 – Il Regno Perduto*,
il gioco di ruolo voxel isometrico per browser. È riscritto da zero in C con devkitARM,
libctru, citro3d e citro2d, e pensato per l'hardware della console.

## Installazione

1. Serve una console con l'Homebrew Launcher (custom firmware, per esempio Luma3DS).
2. Copia `voxelia.3dsx` nella cartella `sdmc:/3ds/` della scheda SD.
3. Avvialo dall'Homebrew Launcher.
4. Per l'audio serve il firmware del DSP (`sdmc:/3ds/dspfirm.cdc`), che si ricava con *DSP1*.
   Senza il firmware il gioco funziona lo stesso, ma senza suono.

I salvataggi vanno in `sdmc:/3ds/voxelia/save.dat` e le impostazioni in `sdmc:/3ds/voxelia/settings.dat`.
La partita si salva da sola ogni 30 secondi e a ogni cambio di zona.

## Comandi

| Tasto | Azione |
|---|---|
| Circle Pad / D-pad | Muovi l'eroe (analogico: le direzioni dello schermo diventano quelle isometriche) |
| **A** | Premi: la mossa successiva della catena dell'arma (tre colpi diversi per spada, pugnale, ascia, martello, lancia, tridente, bastone e falce, come nella 7.19). Ripremi proprio quando la mossa finisce: «Perfetto!» (+30%). Tieni premuto e lascia: colpo caricato (Turbine, Danza delle lame, Salto del boia, Terremoto, Carica, Maremoto, Nova arcana, Danza della morte): più carichi, più è forte. Se il nemico è lontano l'eroe lo raggiunge e colpisce da solo. Senza nemici vicini, interagisci |
| **L** | Interagisci: parla, apri forzieri, raccogli, entra nelle porte |
| **B** | Premi e lascia: capriola (invulnerabile per un attimo; da fermo è un passo indietro). Tieni premuto mentre ti muovi: corsa |
| **R** | Blocca il bersaglio (7.32): l'eroe resta girato verso il nemico e ogni colpo va su di lui; R di nuovo passa al nemico successivo |
| **Y** | Colpo ad area |
| **X** | Pozione (cura il 35%, una ogni 2,5 secondi) |
| Stamina | La barra verde sullo schermo touch, come nella 7.32. Attacchi (da 10 a 22 secondo l'arma), capriola (20), passo indietro (12), colpo caricato (da 26 a 40 secondo la carica), colpo ad area (45) e corsa (16 al secondo) la consumano. A zero resti senza fiato finché non torna al 30%; si ricarica quando ti fermi |
| ZL / ZR o C-stick (New 3DS) | Zoom |
| START | Pausa: salvataggio, volumi, zoom, opzioni, comandi |
| SELECT | Mappa grande della zona |
| Schermo touch | HUD sempre visibile: vita, XP, oro, minimappa, obiettivi, ricariche delle abilità; pulsanti Zaino, Missioni, Diario, Mappa, Chat (registro della chat, da cui si scrive), Menu. Toccando un'abilità la usi; toccando la minimappa apri la mappa. In rete, le richieste di teletrasporto e gli inviti nei gruppi compaiono qui con Accetta e Rifiuta |

Nei menu: D-pad su/giù per scegliere, A per confermare, B per tornare indietro, L/R per scorrere
più velocemente, sinistra/destra per cambiare volumi, zoom e puntate. Le righe si possono anche toccare
(primo tocco seleziona, secondo tocco conferma). Nello zaino, Y getta a terra l'oggetto scelto.

## Ottimizzazioni per la 3DS

- **Rendering sulla GPU PICA200 con depth buffer.** L'originale disegna ogni fotogramma migliaia di poligoni
  su una tela 2D, dal fondo verso lo spettatore. Qui il mondo isometrico è una vera proiezione ortografica 3D:
  niente ordinamento sulla CPU e niente fessure tra le facce.
- **Geometria fissa in memoria video.** Pavimenti, muri, edifici e arredi di ogni zona si costruiscono una volta sola
  in blocchi di 8×8 caselle, e la GPU disegna solo quelli inquadrati. Ogni fotogramma si ricostruiscono solo
  acqua, fiamme, bandiere, personaggi ed effetti.
- **Luci calcolate nello shader.** Giorno, tramonto e notte, i lampioni, le torce dei dungeon, i fuochi e la luce
  intorno all'eroe arrivano a 8 luci per vertice, calcolate sulla GPU. Di giorno all'aperto si usa uno shader
  più leggero che calcola solo la luce ambiente.
- **3D stereoscopico.** Si regola con il cursore 3D. L'eroe resta sul piano dello schermo, alberi e torri escono
  verso di te e il paesaggio lontano rientra.
- **Muri trasparenti e sagoma.** Come nell'originale, muri e arredi alti davanti all'eroe diventano trasparenti.
  Se l'eroe resta comunque coperto, ne vedi la sagoma azzurra.
- **Due schermi.** In alto c'è solo il mondo; in basso, sullo schermo touch, HUD, minimappa (una texture che si
  aggiorna solo quando cambi zona), finestre di dialogo e negozi.
- **New 3DS:** attiva la modalità a 804 MHz con la cache L2.
- **Audio sintetizzato sul DSP.** La musica è quella del browser, suonata nota per nota in un thread a parte,
  senza file audio:
  - i **brani scritti** (città, menu, foresta, deserto, taverne, notte, boss, arena…) con melodia, seconda voce,
    armonia, basso, batteria, accordi e gli strumenti originali (onde, filtro, vibrato, riverbero);
  - i **brani procedurali** dei dungeon (cripta, tana, fucina, cittadella…), con lo stesso seme del browser;
  - il cambio di brano come nell'originale: musica notturna in città, musica del boss quando è vicino, dissolvenze.
  Le note sono estratte da `voxelia.html` con `tools/songs.js` in `romfs/music.json`.

## Contenuti: sincronizzati con la 8.3

Mappe, modelli, nemici, personaggi e missioni non sono più riscritti a mano: arrivano direttamente dalla versione
browser più recente. `tools/export.js` esegue `voxelia.html` 8.3 in Node (jsdom, senza grafica), carica ogni
zona con il codice originale e registra ogni voxel che il renderer disegna (`box`/`rbox`), oltre a collisioni,
luci ed entità. Poi cattura in 8 direzioni i fotogrammi di camminata e di attacco dei modelli animati della 7.18
e compone l'eroe per ogni tipo d'arma, elmo, corazza e scudo. Il risultato (circa 12 MB) sta nella romfs.

- **129 zone esportate**:
  - Aldoria 7.50 con i quartieri Nord, Campi, Borgo delle Ceneri e Porto;
  - Foresta, Deserto e Picchi rifatti nella 7.12;
  - il Colosseo;
  - 81 interni, tra cui le stanze del castello, ville, teatro, mulino, faro e galeone;
  - Thalassa e la Giungla di Smeraldo;
  - gli 8 dungeon, compreso il Tempio di Thalassa, con due varianti per ogni piano.
- **78 nemici e 14 boss**, con i modelli animati e le statistiche della 7.50.
- **190 personaggi**, ognuno con il proprio modello unico.
- **130 missioni**: caccia, raccolta dai nemici, boss, consegne e raccolta di risorse nei quartieri.
  Le missioni di pesca, tappe e battaglie non vengono proposte.
- **Le tabelle della 7.50**: storia, pagine del diario, sblocchi (per esempio il Borgo delle Ceneri) e oggetti unici dei boss.

Quando esce una nuova versione basta rigenerare i dati:

```bash
cd tools && npm install && VOXELIA_HTML=/percorso/di/voxelia.html node export.js ../romfs   # voxelia.html dal branch main
```

## Multigiocatore

Menu → **Multigiocatore** (anche dal titolo):
1. Scegli il **codice stanza**.
2. Il server di default è quello ufficiale, `https://otboi2kx101p-production-9y6zqlkz.europe-west1.suga.run`;
   puoi cambiarlo.
3. Premi **Collegati**.

Il protocollo è quello di `server.js` (WebSocket su `/ws`, `wss://` con mbedtls), quindi chi gioca dalla 3DS
e chi gioca dal browser con lo stesso codice stanza stanno nello stesso mondo. Funziona:
- gli altri eroi, con il loro equipaggiamento, il nome, il livello e la vita;
- la chat (pulsante **Chat** sul touch, tastiera della console) e i fumetti sopra gli eroi;
- l'ora del mondo condivisa, il ping e i comandi `/` dei plugin;
- i danni ai nemici condivisi e i cicli dei dungeon della stanza;
- l'**arena PvP** nella fossa del Colosseo, con vittorie, punti arena e negozio dell'Arena da Kael;
- l'elenco dei giocatori della stanza, i messaggi e i regali dell'admin, il kick;
- i **plugin del server** della modalità storia (vedi sotto).

### Plugin del server

Nel browser i plugin del server aggiungono al gioco un loro pezzo di JavaScript, che la 3DS non può eseguire.
Il port ne ha una versione nativa che usa gli stessi messaggi (`{t:'x', pl, e, d}`, in `source/plugins.c`):

| Plugin | Sulla 3DS |
|---|---|
| Boss del mondo (`boss`) | Il boss compare nella sua zona, più grande, con la barra in alto. I colpi vanno al server: la vita è quella di tutta la stanza |
| Caccia al tesoro (`tesoro`) | Avviso e scintille vicino al nascondiglio, titolo e premio a chi lo trova |
| Taglie (`taglie`) | Il gioco dice al server se la cripta del Borgo delle Ceneri è aperta |
| Teletrasporto (`tpa`) | Le richieste arrivano sul touch con Accetta e Rifiuta. Con `/tpa nome` il gioco controlla se puoi entrare nella zona dell'altro, poi ci vai |
| Ritorno ad Aldoria (`hub`) | `/hub`, con gli stessi controlli del browser |
| Gruppi d'avventura (`gruppi`) | Riquadro dei compagni in alto a sinistra, inviti sul touch, chat del gruppo in verde, nomi verdi sopra la testa |
| Emote (`emote`) | Fumetti sopra gli eroi e ruota delle emote |
| Notti di caccia, Torneo, Sindaco, Gara di pesca | Titoli e annunci |
| Guardie e ladri (`guardieladri`) | Riquadro della partita, benda della guardia, ladri lontani nascosti |
| Speedrun, Albo | L'indirizzo del server per i link in chat |

**Menu → Funzioni del server** (anche da Multigiocatore) apre una pagina con:
- emote e gruppo;
- Torna ad Aldoria;
- i comandi dei plugin;
- il **registro della chat**, per leggere per intero le risposte lunghe dei comandi.

I comandi si possono anche scrivere in chat. Casa, Discoteca e Mercatino hanno finestre e mappe proprie del
browser: dalla 3DS restano i loro comandi in chat.

**Plugin nuovi e aggiornati.** Il port funziona anche con plugin che non conosce:
- i comandi della pagina «Funzioni del server» arrivano da `/aiuto`, quindi un plugin nuovo compare lì da solo;
- c'è un protocollo di eventi generici (`banner`, `avviso`, `chat`, `suono`, `domanda`, `riquadro`, `punto`,
  `menu`, `chiudi`) che la 3DS mostra da qualunque plugin;
- un evento nuovo di un plugin conosciuto passa da quel protocollo.

Chi scrive plugin trova tutto in [PLUGIN.md](PLUGIN.md).

Provato sul server ufficiale (nell'emulatore Azahar): collegamento `wss://` attraverso Cloudflare, un giocatore dal
browser visto in città con il suo equipaggiamento, chat, annunci dei plugin (boss del mondo, caccia al tesoro,
taglie) e ora del mondo condivisa.

Il server ufficiale ha il plugin anti-trucchi **Guardiano**. Il client 3DS manda statistiche calcolate come nel
browser, quindi non viene segnalato. Il Guardiano però confronta i progressi tra una sessione e l'altra: se si
guadagnano molti livelli giocando da soli e poi ci si collega, può segnalare la partita, come succede nel browser.

Limiti:
- **Il certificato del server non viene verificato.** La connessione è cifrata, ma sulla console non c'è un
  archivio di autorità di certificazione.
- **Alcune mappe possono non coincidere con quelle del browser.** Nel browser le zone aperte e i dungeon si generano
  a partire dal codice stanza; sulla 3DS sono quelli esportati. Città, quartieri, interni e Colosseo coincidono;
  nelle zone aperte e nei dungeon gli altri eroi possono sembrare camminare dentro un albero o un muro.
- **Mancano alcune funzioni online:**
  - scambi, oggetti gettati a terra, profili dettagliati e mondi della community;
  - le finestre di Casa, Discoteca e Mercatino;
  - il sensore del Guardiano nel gioco: il Guardiano controlla comunque i progressi dal server.

## La Modalità Storia della 8.3

Dalla 1.5 la console ha le meccaniche della Storia arrivate nel browser dopo la 7.50, con le stesse regole e gli
stessi messaggi di rete (`story*.c`, `sync.c`):
- **Nemici condivisi (7.41):** in rete i nemici della zona li guida chi ci è da più tempo, gli altri ne vedono la
  copia; i colpi arrivano al padrone e quando un nemico cade, cade per tutti. Vale tra 3DS e browser.
- **Cavalli e corsa (7.46)**, **animali da compagnia (7.47)**, **compagni domati (7.20/7.54)** con il Serraglio,
  gli incroci e le varianti (7.47/7.54/7.55): si vedono anche quelli degli altri giocatori, e loro vedono i tuoi.
- **Elementi ed Essenze (7.55)**, infusione alla Fucina di Borin.
- **Scelte (7.48):** risparmiare o finire i boss, il Viandante, la Casa degli alleati, le vie e i titoli.
- **Il regno oltre il mare (7.48):** Capitana Marina, Cancelliere Oreste, i Sigilli di Giada, Quetzal, la Regina Nerea.
- **Combattimento (7.44):** boss a fasi con il punto debole, armi che crescono (nome e mossa speciale), maledizioni.
- **Mondo (7.44/7.46):** scavi, eventi a orario (drago, meteora, mercante), diario delle scoperte.
- **Difficoltà (7.11, 8.1, 8.3):** nemici più forti, Campioni, branchi e ultima furia dei boss; i nemici partono 2
  livelli sopra il dungeon e seguono il tuo livello; all'ingresso compare il livello consigliato; i prezzi crescono
  con il livello.
- **Bottega dei mestieri (7.47)**, **Torre della Corona (7.44/7.49)** con le sale generate sulla console,
  **duello delle carte (7.47)**.

Comandi: sul touch ci sono **Comp.** (i compagni), **Doma** (quando un mostro indebolito si può domare) e
**Sella/Scendi** (con un cavallo). Dal menu di pausa: compagni, animali, incroci, cronaca, diario delle scoperte.

## Cosa non c'è ancora

- **Modalità a sé:** Tomorrow, Aldoria 2026/3026 (anche lo spazio della 8.2) e la Cronoporta, il Cuore della
  Corona della 8.0 (servono i frammenti di tutte le modalità), Voxelia Studio, realtà virtuale.
- **Storia:** pesca, miniere, battaglia navale, la casa (lavagna e trofei), le classifiche della settimana,
  i filmati, il vero finale (Aldoria Vecchia, l'Abominio), l'editor dell'aspetto e il file dell'eroe.
- **Semplificazioni:** le chimere hanno il corpo di una specie (la testa dell'altra resta nel nome); il passaggio
  segreto degli scavi è crollato (dà un tesoro, non la grotta); le armi chimera degli altri si vedono con la loro testa.

## Compilare

Serve devkitPro con `3ds-dev` (devkitARM, libctru, citro3d e citro2d):

```bash
make
```

Con Docker, senza installare nulla:

```bash
docker run --rm -v "$PWD":/p -w /p devkitpro/devkitarm make
```

Struttura del codice (`source/`):

| File | Contenuto |
|---|---|
| `main.c` | ciclo principale, comandi, telecamera, titolo |
| `render.c` | renderer citro3d: VBO a blocchi, matrice isometrica, stereoscopia, luci, testo |
| `world.v.pica`, `flat.v.pica` | vertex shader (con luci e solo ambiente) |
| `draw.c` | modelli animati, eroe componibile, altri giocatori, effetti |
| `world.c` | caricamento delle zone esportate (collisioni, voxel, luci, entità); percorsi |
| `game.c` | eroe, combattimento, IA dei nemici, bottino, missioni, storia, negozi, salvataggi |
| `ui.c` | HUD, minimappa, finestre e menu (schermo touch), scritte sullo schermo superiore |
| `audio.c` | sintetizzatore (strumenti, batteria, riverbero) su ndsp |
| `music.c` | sequencer dei brani del browser (`music.json`), condiviso con il port DS |
| `data.c` | tabelle lette da `romfs:/data.json`, oggetti, modelli animati (`models.bin`, `hero.bin`) |
| `net.c` | multigiocatore: WebSocket/TLS (mbedtls), protocollo di `server.js` |
| `plugins.c` | plugin del server (modalità storia): boss del mondo, tesoro, teletrasporto, gruppi, emote… |
| `json.c` | lettore e scrittore JSON (dati e rete) |
| `tools/export.js` | esportatore dei dati dalla versione browser |
