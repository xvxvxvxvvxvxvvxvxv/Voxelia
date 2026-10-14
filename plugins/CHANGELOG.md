# Changelog dei plugin di Voxelia

Stato al 14 ottobre 2026. Versioni prese dal campo `version` di ogni file, date e modifiche dai thread del progetto.
Dove una modifica non ha cambiato il numero di versione, è segnata come «senza cambio di versione».

## Compatibilità con la 7.8

- L'API dei plugin è la stessa della 7.3.2: in `server.js` si aggiungono solo i Mondi della community (cartella `mondi/`, `/api/mondi`, pagina Mondi del pannello), e il ponte `VXP` nel gioco è uguale riga per riga. Zone, dungeon e missioni sono gli stessi della 7.3.2.
- I Mondi della community si giocano senza server (il gioco esce dalla stanza) e le loro mappe hanno nomi `ed_…`: nessun plugin li vede né li tocca.
- Tutti i plugin si caricano sul server 7.8 senza errori (controllo del 10 ottobre, nel gioco vero).
- Due plugin andavano adattati: **Discoteca 1.3** e **Case 1.3**. Dalla 7.4 il gioco disegna le caselle ferme una volta sola («rendering veloce») e non passa più dal disegno che i due plugin usano per i loro oggetti. Le correzioni non cambiano niente sulle versioni precedenti.
- **Guardiano** non va cambiato: la modalità sviluppatore della 7.7 (oro, livelli, teletrasporti dal pannello 🛠) usata in una partita online viene già segnalata come oro e livelli senza spiegazione e piani saltati.

## Compatibilità con la 7.0 e la 7.3.2

- L'API dei plugin è identica dalla 7.0 alla 7.3.2: in `server.js` cambia solo il numero di versione, e il ponte `VXP` nel gioco è uguale riga per riga.
- Tutti i plugin si caricano sul server 7.3.2 senza errori (controllo del 9 ottobre, poi ripetuto con lo stress test insieme a tutti gli altri).
- Due plugin andavano adattati alla 7.3.x e sono già corretti: **Discoteca 1.2** (aspetto del DJ) e **Case 1.1** (mobili della 7.3.1, ora 1.2). Le correzioni non cambiano niente sulla 7.0, quindi vanno bene su tutte e due le versioni.
- **Teletrasporto 1.2** blocca le due zone nuove della 7.3.2 (stanza dell'Occhio e cella); sulle versioni più vecchie, dove non esistono, si comporta come prima.
- **Taglie 1.1** legge la versione del gioco: prima della 7.2 la Cripta era in città e la taglia esce a tutti.
- **Gara di pesca** usa la pesca della 7.3 (`fishLand`): su un gioco che non ce l'ha non vede le catture e lo scrive nella console.
- Caccia al tesoro, Gara di pesca, Torneo, Posta e Stress test sono stati scritti e provati sulla 7.3.2. Premio giornaliero, Guardiano 1.0, Taglie 1.0 e Notti di caccia sono nati su una copia del server 5.3, con la stessa API.
- Discoteca, Case e Teletrasporto si spengono con un avviso («non funziona con questa versione del gioco») se un aggiornamento futuro toglie qualcosa che usano, invece di rompere il gioco.

---

## Il Sindaco di Aldoria (`sindaco.js`) — 1.0

**1.0** — 14 ottobre 2026 (scritto e provato sulla 7.8, insieme a tutti gli altri plugin)
- Ogni settimana si elegge il sindaco con `/vota nome`: un voto a testa, si può cambiare fino allo spoglio (`giornoElezione` e `oraElezione`, di base domenica alle 21 ora del server). Vota solo chi ha giocato almeno `minutiPerVotare` (30) minuti nella settimana; niente voto per sé (`votoPerSe`), un voto per IP facoltativo (`unVotoPerIp`). A pari voti vince chi ci è arrivato prima; senza voti il sindaco resta in carica.
- `/discorso testo` (e `/discorso + altro` per continuarlo, perché la chat taglia a 60 caratteri): il discorso del vincitore viene annunciato a tutti allo spoglio; chi è eletto senza discorso lo scrive e lo legge con `/discorso leggi`. Titolo grande con la corona nel gioco.
- Il sindaco ha 🎩 davanti ai messaggi in chat (`cappello`) e una volta al giorno emana un decreto dalla lista `decreti` con `/decreto numero`: Esperienza doppia e Oro doppio (moltiplicatori del server per `minuti`), Festa in discoteca (solo con la Discoteca accesa: annuncio e regalo a chi entra, `regalo`). Con Notti di caccia 1.1 e Mercatino 1.1 anche Notte di caccia anticipata (parte subito e dura quanto una notte del mondo) e Sconto al Mercatino (la tassa sulle vendite scende di `percento` punti per `minuti`; con la tassa di base del 5% diventa zero); se uno dei due plugin è spento, il sindaco riceve un avviso.
- L'esperienza doppia non parte durante una notte di caccia (anche anticipata); se una notte comincia durante il decreto, alla fine il moltiplicatore torna giusto. Con Ricarica o riavvio a metà decreto il moltiplicatore torna com'era e il decreto riprende.
- `/sindaco` dice chi è il sindaco, i decreti in vigore e i voti della settimana. Pagina pubblica `/plugins/sindaco/`, pagina admin `/plugins/sindaco/admin` (chi ha votato chi, Fai lo spoglio adesso, Togli il sindaco, Ridai il decreto di oggi). Tutto è salvato in `voxelia-data.json`, quindi resta anche dopo un rebuild su suga.app.

## Emote e fumetti (`emote.js`) — 1.0

**1.0** — 14 ottobre 2026 (scritto e provato sulla 7.8)
- `/saluta`, `/ridi`, `/applaudi`, `/arrabbiato`, `/cuore`, `/balla`, `/triste`, `/ok`, `/dubbio`, `/dormi`, `/forza`, `/brindisi` mostrano per `durataSec` (4) secondi un fumetto con un'icona voxel della 7.8 sopra la testa dell'eroe, visibile a chi è nella stessa zona. Ridi, arrabbiato e triste sono facce nuove disegnate a cubetti come le altre. Con `/balla` l'eroe saltella. Fra due emote passano almeno `attesaSec` (2) secondi; `spente` toglie quelle che non vuoi.
- Ruota delle emote con il tasto G (`tasto`): si sceglie col mouse o coi numeri, Esc la chiude. `/emote` elenca le emote e apre la ruota, anche da telefono.
- I messaggi di chat compaiono come fumetto sopra chi li scrive, al posto della scritta gialla del gioco (`fumettiChat`). Il fumetto compare solo se il server ha consegnato il messaggio: chi è silenziato dall'admin o dal Guardiano non ha più la scritta sopra la testa, che il gioco mostrava lo stesso.
- Funziona insieme ai Gruppi d'avventura (nome verde e barra della vita restano) e col «rendering veloce». Chi non ha ricaricato la pagina dopo l'installazione non vede i fumetti e `/saluta` glielo dice.

## Speedrun dei dungeon (`speedrun.js`) — 1.0

**1.0** — 14 ottobre 2026 (scritto e provato sulla 7.8, insieme a tutti gli altri plugin)
- Il cronometro parte quando l'eroe entra nel primo piano di un dungeon e si ferma quando ne sconfigge il boss; a ogni piano nuovo arriva il tempo parziale. Tutto misurato sul server.
- Classifiche separate per stanza (i piani cambiano con il codice della stanza), con ciclo e difficoltà di ogni tempo. Chi è nello stesso dungeon col cronometro acceso quando un compagno abbatte il boss ha il suo tempo.
- Non vale: uscire dal dungeon (anche morendo), scollegarsi, saltare un piano o fare meno di `tempoMinimoSec` (30). Il Guardiano blocca già due boss troppo ravvicinati.
- Record della stanza annunciato alla stanza, record del server a tutti (un annuncio solo per gruppo).
- **Sfida della settimana**: ogni lunedì un dungeon scelto da `sfidaDungeon`; alla fine della settimana il più veloce di ogni stanza riceve `sfidaPremioOro` (500) e un oggetto di rarità `sfidaPremioOggetto` (raro), se l'hanno finita almeno `sfidaMinimoEroi` (2) eroi. Chi è offline lo riceve al rientro.
- `/speedrun` (cronometro, sfida, i tuoi record), `/speedrun tana`, `/speedrun sfida`, `/speedrun server`, `/speedrun annulla`. Pagina pubblica `/plugins/speedrun/`: senza `?stanza=` mostra solo i record di tutte le stanze, senza codici; il link con la stanza lo dà `/speedrun`.

## Ritorno ad Aldoria (`hub.js`) — 1.0

**1.0** — 10 ottobre 2026 (scritto e provato sulla 7.8, insieme a tutti gli altri plugin)
- `/hub` riporta l'eroe ad Aldoria, al punto d'arrivo della città, da qualunque zona, con la stessa transizione del Teletrasporto.
- Non funziona: durante uno scambio, un cambio di zona o una scena; dalla cella delle prigioni; dalla fossa del Colosseo; con mostri che ti attaccano entro 7 caselle; per `combattimentoSec` (8) secondi dopo un colpo subito; durante una partita di Guardie e ladri; dalle zone in `vietate`. Fra un `/hub` e l'altro passano almeno `attesaSec` (30) secondi.
- Come il Teletrasporto, se un aggiornamento del gioco toglie qualcosa che usa, si spegne con un avviso invece di rompere il gioco.

## Boss del mondo (`boss.js`) — 1.0

**1.0** — 10 ottobre 2026 (scritto e provato sulla 7.8, insieme a tutti gli altri plugin)
- Ogni `ogniMin` (60) un boss enorme compare in ogni stanza con eroi online, al centro di Foresta, Deserto o Picchi, annunciato a tutti. Se nessuno lo sconfigge in `durataMin` (15) se ne va. `/boss` dice dove si trova e quanta vita gli resta, `/boss classifica` i più valorosi.
- La vita sta sul server: ogni gioco manda i danni che fa e riceve la vita aggiornata, con una barra in alto nella zona del boss. Più eroi nella stanza, più vite (`vite`, `vitePerEroe`).
- Premio a chi ha fatto almeno il 3% dei danni: 40% del premio più il 60% in proporzione ai danni (`premio`), oggetto epico al più valoroso, raro a chi fa almeno il 15%.
- Nel gioco il boss nasce con `mk()` da un boss esistente (aspetto e attacchi del gioco), con nome, misura e forza dal config. I colpi passano da `hurtE`, che il plugin intercetta solo per il boss del mondo: niente `kill()`, quindi niente missioni o bottino del gioco.
- Contro i trucchi il server accetta al massimo `dannoMaxSec` + `dannoMaxLivello` × livello vite al secondo per eroe. La pagina admin `/plugins/boss/admin` mostra i danni scartati, ed evoca o manda via il boss; pagina pubblica `/plugins/boss/`.
- Per gli altri plugin: `globalThis.VoxeliaBoss.attivi()` e `globalThis.VoxeliaBoss.onSconfitto(fn)`, con i nomi e la parte di danni di ogni eroe.
- Il comando `/boss` di `esempio.js` viene ignorato, perché quello del Boss del mondo si carica prima.

## Mercatino di Aldoria (`mercato.js`) — 1.1

**1.1** — 14 ottobre 2026 (provato sulla 7.8)
- Aggancio per il decreto «Sconto al Mercatino» del Sindaco di Aldoria (`globalThis.VoxeliaMercato.sconto`): per la durata del decreto la tassa sulle vendite scende, e il mercatino mostra subito quella nuova. Lo sconto è salvato nel file dei dati, quindi resta dopo un riavvio. Senza il Sindaco non cambia niente.


**1.0** — 10 ottobre 2026 (provato sulla 7.8, insieme a tutti gli altri plugin)
- `/mercato` apre la bancarella nel gioco con tre schede: In vendita (filtro per armi, elmi, corazze, scudi; Compra e Conferma), Vendi (prezzo per ogni oggetto dello zaino) e I miei banchi (oggetti sul banco, da ritirare, ultime vendite). `/mercato cerca nome` elenca in chat.
- Gli oggetti in vendita li tiene il server, come il deposito delle Case. Si compra anche quando il venditore è offline: l'oro (meno la tassa, `tassaPercento`, di base 5%) arriva con `p.give` subito o al rientro.
- Invenduti dopo `giorniScadenza` (7) tornano al venditore. Oggetti premio dell'arena e oggetti bloccati non si vendono.
- Il banco è legato al browser con una chiave segreta: chi entra con lo stesso nome da un altro browser non ritira né incassa (`/mercato chiave` per spostarlo).
- Contro i trucchi: l'oro lo toglie il gioco, quindi il plugin controlla che dopo la consegna l'oro del compratore scenda davvero del prezzo; se no lo segna come sospetto e (di base) lo blocca. Pagina pubblica `/plugins/mercato/`, pagina admin `/plugins/mercato/admin`.

## Gruppi d'avventura (`gruppi.js`) — 1.0

**1.0** — 10 ottobre 2026 (scritto e provato sulla 7.8)
- Gruppi fino a 4 eroi della stessa stanza: `/gruppo invita nome`, `/gruppo accetta`, `/gruppo rifiuta`, `/gruppo esci`, `/gruppo caccia nome` (solo il capo); `/gruppo` dice chi c'è, con vita e zona di ognuno. Il gruppo si scioglie quando resta un eroe solo.
- Chat di gruppo con `/gr testo`, in verde nel registro della chat.
- Boss di dungeon: i compagni nello stesso dungeon (qualunque piano) ricevono il 30% dell'esperienza del boss e 5 monete per livello del dungeon, +25% per ogni ciclo già completato, moltiplicati per gli eventi XP e oro del server.
- Nel gioco: riquadro del gruppo sotto l'HUD (sotto quello della Discoteca, se c'è) con vita, livello, zona e pulsante «Raggiungi» (`/tpa`); invito con Accetta e Rifiuta; nome verde e barra della vita sopra i compagni anche con i nomi spenti, sia col disegno classico sia col «rendering veloce»; compagni in verde sulla minimappa.
- Chi chiude il gioco resta nel gruppo per 5 minuti (`assenzaMin`); i gruppi restano anche dopo un riavvio. Pagina admin `/plugins/gruppi/` con i gruppi attivi.

## Case (`housing.js`) — 1.4

**1.4** — 14 ottobre 2026
- Case molto più care: dalla tenda a 1000 monete alla villa a 8000 (prima da 50 a 280). Il trasloco resta a metà prezzo del nuovo modello; colori, arredi e cibo del pet costano come prima.

**1.3** — 10 ottobre 2026 (provato sulla 7.8)
- Nelle case si vedono di nuovo tappeti, acquario e cuccia del pet, e i muri davanti tornano bassi: dalla 7.4 il «rendering veloce» del gioco li saltava. Nel Borgo e nelle case il plugin usa il disegno classico, fuori il gioco torna veloce.

**1.2** — 9 ottobre 2026
- Il riquadro del Borgo e delle case non copre più l'HUD in alto a sinistra: si mette sotto e lo segue quando diventa più alto (livello alto, tante righe di statistiche); su telefono si stringe come l'HUD.

**1.1** — 9 ottobre 2026
- Dalla 7.3.1 negli interni alcuni simboli disegnano mobili diversi: nelle case erano sparite le colonne della villa, i pupazzi di neve dell'igloo e gli arredi «Colonna», «Cristalli» e «Pupazzo di neve». Ora si vedono di nuovo.
- Aspetto fisso per il custode del Borgo (dalla 7.3 il gioco ne dava uno a caso).

**1.0, seconda versione** — 8 ottobre 2026 (senza cambio di versione)
- Pannelli nello stile di Voxelia, con schede, tasto Chiudi ed Esc.
- Icone in pixel art al posto delle emoji, con la testina di ogni pet nel suo colore.
- Prezzi: casa da 50 (tenda) a 280 monete (villa) pet compreso, trasloco a metà prezzo, ridipingere 8, arredi da 5 a 40, cibo del pet 3. Si può pagare con l'oro del deposito. `prezzoPercento` li scala tutti.

**1.0** — 8 ottobre 2026
- Prima versione, provata sulla 7.0: 10 modelli di casa, colori, musica e nome, 34 arredi.
- Deposito di oggetti e oro sul server, aperto solo con il codice segreto della casa (`/casa chiave`).
- Pet tamagotchi a scelta tra 10 specie; gli ospiti possono coccolarlo e giocarci ma non vedono il deposito.
- Borgo delle Case con portale in città, `/borgo`, `/visita`, `/case`, `/pet`; pagina admin `/plugins/housing/admin`.

## Discoteca (`discoteca.js`) — 1.4

**1.4** — 13 ottobre 2026 (provato sulla 7.8)
- Le luci seguono il BPM vero di ogni brano: il plugin lo cerca per titolo su Deezer (gratis, senza chiave) e lo ricorda per le volte dopo. Con una chiave gratuita di getsongbpm.com (`chiaveGetSongBpm`) cerca anche lì quando Deezer non trova il brano. Chi chiede il brano può ancora scriverlo a mano (/dj link 128); se non si trova, resta 124. Nel pannello del DJ si vede il BPM del brano (con ~ davanti quando è quello predefinito). Config `cercaBpm` per spegnere la ricerca.

**1.3** — 10 ottobre 2026 (provato sulla 7.8)
- Pista luminosa, casse, consolle del DJ e pali dei fari si vedono di nuovo: dalla 7.4 il «rendering veloce» del gioco li saltava e restavano solo fasci e laser. Nella sala il plugin usa il disegno classico, fuori il gioco torna veloce.
- La consolle con i piatti ora sta davanti al DJ, che è dietro, tra la consolle e il muro. Per parlargli ci si mette davanti alla consolle, in qualunque punto, e si preme R o si clicca.

**1.2** — 9 ottobre 2026
- La scheda del DJ in alto a sinistra ora sta sempre sotto l'HUD e lo segue quando diventa più alto; sul telefono è più stretta e non copre l'orologio.
- Aspetto del DJ per la 7.3 (cappellino rosa, occhiali e collana): prima il gioco gliene dava uno a caso e scuro, e nella sala non si vedeva quasi.

**Portale in piazza** — 9 ottobre 2026 (il numero di versione di questo passaggio non risulta dai thread)
- Portale «Discoteca Voxel» in piazza, a sud della fontana, di fronte a quello del Borgo delle Case. Uscendo dalla porta si torna accanto al portale. Config `posPortale` e `portaleInCitta`.

**1.0** — 8 ottobre 2026
- Prima versione per la 7.0: `/discoteca`, sala con pista, fari e laser a tempo, DJ con coda per stanza da YouTube e SoundCloud, voti per skip e pausa, volume, base house quando il DJ è libero. Comandi `/dj`, `/coda`, `/skip`, `/pausa`.


## Teletrasporto (`tpa.js`) — 1.2

**1.2** — 9 ottobre 2026
- Stanza dell'Occhio: ci si arriva solo con la chiave di Malakar e dopo l'arresto, come per la porta di pietra del gioco.
- Cella delle prigioni: mai raggiungibile con `/tpa` (blocco sul server), e chi è in cella non può usare `/tpa` per uscire.
- Aldoria Vecchia e la stanza del culto: ora serve il passaggio scavato nel muro crepato (il buco c'era già dalla 7.0).

**1.1** — 8 ottobre 2026
- Riconosce da solo le zone chiuse: dai portali con cancello (`lock`, ricordati anche dopo un riavvio) e dalle missioni che aprono una zona con lo stesso nome (`unl`). Edifici e dungeon dentro una zona chiusa sono chiusi anche loro.
- In `regole` restano solo i blocchi che non sono cancelli (come la Cittadella); `{ "libera": true }` riapre una zona.
- Si spegne con un avviso se il gioco non ha più qualcosa che usa.

**1.0** — 8 ottobre 2026
- `/tpa`, `/tpaccetta`, `/tparifiuta`, `/tpannulla`, `/tpblocco`, riquadro con Accetta e Rifiuta, scadenza dopo 60 secondi, controllo di accesso alla zona alla richiesta e all'accettazione.

## Taglie del giorno (`taglie.js`) — 1.1

**1.1** — 9 ottobre 2026
- La taglia «Libera la Cripta Dimenticata» esce solo a chi ha aperto il Borgo delle Ceneri; agli altri ne arriva un'altra, uguale per tutti nella stessa situazione. La scelta vale per tutta la giornata.
- La pagina pubblica mostra anche la taglia sostitutiva. Prima della 7.2 la cripta esce a tutti come prima.
- I bot dello stress test vengono ignorati (senza cambio di versione).

**1.0** — 8 ottobre 2026
- Prima versione: 3 taglie al giorno uguali per tutti, premi e bonus, `/taglie` e pagina `/plugins/taglie/`.

## Guardiano (`guardiano.js`) — 2.3

**2.3** — 14 ottobre 2026 (provato sulla 7.3.2)
- Il pulsante Accendi/Spegni dell'automoderazione salva la scelta nel file dei dati (`voxelia-data.json`) invece che in `guardiano.config.json`: su suga.app i dati stanno nel volume `/data` e la scelta resta dopo riavvii e rebuild, mentre la cartella dei plugin torna com'è nel repository.
- Senza una scelta dalla pagina vale la variabile d'ambiente `GUARDIANO_AUTOMODERAZIONE` (`1` o `0`), poi `attiva` in config. La pagina admin dice da dove viene lo stato.

**2.2** — 10 ottobre 2026 (provato sulla 7.3.2)
- Automoderazione configurabile, spenta di base: si accende e si spegne dalla pagina admin o in `guardiano.config.json` (`automoderazione`). Ogni segnalazione dà punti all'eroe (alta 10, media 3, bassa 0; Cheat Menu 30), che scadono dopo 72 ore.
- Regole a soglia, modificabili: 10 punti avviso, 20 ripristino, 30 espulsione, 60 sospensione di 24 ore, 120 sospensione di 7 giorni. Azioni disponibili: avvisa, ripristina, citta, silenzia (chat bloccata per N ore), espelli, sospendi (N ore o per sempre), con un messaggio facoltativo.
- Chi è sospeso viene rifiutato appena entra (anche per IP con `sospendiIp`); annuncio facoltativo nella stanza; nomi esenti.
- Pagina admin: punti degli eroi, ultime sanzioni, sospesi e silenziati, con i pulsanti Azzera i punti, Togli la sospensione, Togli il silenzio.
- Quando è accesa prende il posto di `azione`, `azioneDa` ed `espelliDopo`.

**2.1** — 9 ottobre 2026 (provato sulla 7.3.2 nel gioco vero)
- Guadagni per ora di gioco: per ogni eroe si contano oro ed esperienza guadagnati giocando (non regali, scambi o deposito), per fascia di 10 livelli. Chi supera 5 volte la mediana della fascia dopo almeno un'ora viene segnalato (al massimo una volta al giorno). Tabella nella pagina admin. Opzioni `statistiche`, `statMultiplo`, `statOreMin`, `statGiocatoriMin`.
- Copia dell'eroe sul server (livello, oro, esperienza, oggetti con il deposito, frammenti), salvata ogni minuto e all'uscita e confrontata con la prima foto del sensore al rientro. Con `copia: "rimetti"` toglie solo quello che c'è in più (non aggiunge mai niente, quindi chi usa il nome di un altro non riceve la sua roba). Predefinito `"segnala"`.
- I bot dello stress test restano esclusi da statistiche e copie.

**2.0** — 9 ottobre 2026 (provato sulla 7.3.2, anche nel gioco vero con il Cheat Menu dell'addon)
- Sensore nella pagina del gioco: riconosce il Cheat Menu e le funzioni del gioco sostituite, controlla vita massima, esperienza, pozioni di forza/pietra, zaino, frammenti della Corona senza boss, oggetti impossibili, colpi sui mostri oltre 9,7 volte l'attacco, eroe dentro i muri, mostri a raffica. Se smette di mandare le foto lo segnala.
- Oro e livelli si confrontano con quello che li spiega: regali del pannello admin e di tutti i plugin (visti dal server, senza `grazia`), scambi, deposito delle case, vendite di oggetti, risorse e pesci, casinò. Finestre di 1 secondo, 1 minuto e 10 minuti.
- Dal server: vita massima impossibile o sotto il minimo del livello, livello oltre 150, teletrasporti, piani dei dungeon saltati, offerte con oro che non si ha e oggetti impossibili negli scambi e a terra (bloccati), grossi passaggi d'oro, progressi fatti fuori dal server tra due sessioni.
- Ogni segnalazione ha una gravità (alta, media, bassa) e le prove. Nuova azione `ripristina` (toglie oro, livelli, oggetti e frammenti illeciti) e `azioneDa`; pagina admin con giocatori online, filtri e pulsanti Ripristina, In città, Espelli.
- `VoxeliaGuardiano.credito(nome, oro, livelli)` per i plugin che regalano in altri modi; `grazia` resta.

- Aggiunta una riga che ignora i bot dello stress test — 9 ottobre 2026 (senza cambio di versione).

**1.0** — 8 ottobre 2026
- Segnala salti di oro e livello, velocità impossibili, boss di dungeon fuori dal dungeon o troppo ravvicinati (questi li blocca), colpi PvP esagerati. Pagina admin `/plugins/guardiano/`. Di base segnala e basta; `azione` in config per riportare in città o espellere. `VoxeliaGuardiano.grazia(nome)` per i regali degli altri plugin.

## Stress test (`stress.js`) — 1.2

**1.2** — 9 ottobre 2026
- Più stanze: i bot si dividono all'inizio tra più stanze (stresstest1, stresstest2…). Con «cambio stanza» escono dalla loro stanza e, come nel gioco, si ricollegano in un'altra o ne creano una nuova (`nuoveStanze`, `maxStanze`). La pagina mostra i bot per stanza, quante volte hanno cambiato stanza e quanto ci mettono a rientrare.
- Scambi, duelli e `/tpa` avvengono solo tra bot della stessa stanza. I cicli dei dungeon di tutte le stanze usate tornano com'erano a fine test.
- 8 preset pronti nella pagina (config `preset`, modificabile): Prova veloce, Serata normale, Via vai di stanze, Tante stanze piccole, Tutti in piazza, Raffica di chat e comandi, Server pieno, Resistenza (1 ora).
- Corretto: un messaggio di chat scritto da un bot rimasto solo nella sua stanza non viene più contato come perso.

**1.1** — 9 ottobre 2026
- Modalità «partita completa» (predefinita): i bot giocano davvero. Scendono nei dungeon piano per piano fino al boss, che fa avanzare il ciclo della stanza come nel gioco. Cacciano mostri nelle zone aperte, usano le pozioni e a volte muoiono. Fanno duelli nella fossa del Colosseo, con le vittorie contate dal server. Si scambiano oggetti, gettano e raccolgono oggetti a terra e si teletrasportano tra loro con `/tpa`.
- I bot usano i comandi dei plugin (lista `comandi` in stress.config.json, solo comandi che non salvano niente). La pagina misura il tempo di risposta e mostra gli errori dei plugin e i comandi sconosciuti.
- La pagina mostra dal vivo cosa fanno i bot (dungeon, città, duelli…) e i conteggi della partita. La modalità «leggera» (la 1.0) resta disponibile.
- Pulizia: a fine test anche i cicli dei dungeon della stanza tornano com'erano.
- Notti di caccia, Esempio, `/amici` (Posta) e `/taglie` ignorano i bot. Provato con il Guardiano 2.0 nella configurazione più severa: nessuna segnalazione né espulsione.

**1.0** — 9 ottobre 2026
- Fino a 200 bot WebSocket nella stanza `stresstest`, avviati solo dalla pagina admin `/plugins/stress/`. Misura latenza di chat e `who`, intervallo degli aggiornamenti di stato, ritardo del ciclo di Node, memoria, CPU, messaggi al secondo ed errori.
- Pulizia a fine test: i bot escono dalla classifica dell'arena e il limite di giocatori torna com'era. `globalThis.VoxeliaStress.bot(p)` per farli ignorare agli altri plugin.

## Posta e amici (`posta.js`) — 1.0

- Ignora i bot dello stress test, anche in `/amici` — 9 ottobre 2026 (senza cambio di versione).

**1.0** — 9 ottobre 2026
- `/posta nome testo`, `/posta`, `/posta cancella`; `/amici aggiungi|togli` con avvisi di entrata e uscita. Limiti contro lo spam in config, messaggi che scadono dopo 30 giorni.

## Notti di caccia (`notti.js`) — 1.1

**1.1** — 14 ottobre 2026 (provato sulla 7.8)
- Aggancio per il decreto «Notte di caccia anticipata» del Sindaco di Aldoria (`globalThis.VoxeliaNotti`): la notte di caccia parte subito, con la stessa XP e la stessa gara, e dura quanto una notte del mondo (7 minuti con le ore di base). `/evento` dice quanto manca. Se c'è già una notte di caccia, il decreto viene rifiutato. Senza il Sindaco non cambia niente.

- Niente punti ai bot dello stress test — 9 ottobre 2026 (senza cambio di versione).

**1.0** — 8 ottobre 2026
- Una notte del mondo ogni 3 con XP ×2 e gara a punti tra boss e Colosseo, premio all'alba. `/evento`.

## Gara di pesca (`pesca.js`) — 1.0

**1.0** — 9 ottobre 2026
- Albo dei record per specie, gare a tempo (pagina admin, `/pesca via`, o a orari fissi), annunci dei leggendari, `/pesca io`. Il server scarta pesi impossibili, pesci presi nel mare sbagliato e catture troppo ravvicinate.

## Torneo dell'arena (`torneo.js`) — 1.0

**1.0** — 9 ottobre 2026
- Tabellone a eliminazione diretta per stanza, iscrizioni da pagina admin o a orario, passaggio del turno con iscritti dispari, finale per il terzo posto, sconfitta a tavolino, colpi degli spettatori scartati, albo d'oro.

## Caccia al tesoro (`tesoro.js`) — 1.0

**1.0** — 9 ottobre 2026
- Un tesoro ogni 40 minuti in 21 nascondigli, indizi a tappe, scintille quando si è vicini, premio al primo che arriva. Solo zone aperte dall'inizio e con mappa uguale in ogni stanza (verificate sulla 7.3.2).

## Premio giornaliero (`giornaliero.js`) — 1.0

**1.0** — 8 ottobre 2026
- `/giornaliero` e `/serie`: 7 premi crescenti nei giorni di fila, un premio al giorno per connessione, promemoria all'ingresso.

## Albo degli eroi (`albo.js`) — 1.0

**1.0** — 9 ottobre 2026
- Pagina web pubblica `/plugins/albo/` con una scheda per eroe: livello, ultima volta online, ore di gioco (contate dall'Albo con l'ingresso e l'uscita, più un controllo al minuto), punti e posizione nell'arena. Ricerca per nome e ordinamento per livello, ore, arena, visti di recente o nome; si aggiorna da sola e va bene su telefono.
- Aggiunge quello che sanno gli altri plugin, letto in sola lettura da `voxelia-data.json`: pesci e record della Gara di pesca, tornei vinti, tesori trovati, serie del Premio giornaliero, casa e pet. Non legge Guardiano, Posta e amici, Teletrasporto e Taglie, e non mostra stanze, codici, IP, depositi o statistiche dei pet.
- `/albo nome` in gioco mostra la scheda in breve. `/albo nascondi` toglie la propria scheda dalla pagina web (`/albo mostra` la rimette); l'admin può nascondere dei nomi con `nascosti` nel config.
- I bot dello stress test e chi si chiama ancora «Eroe» non compaiono. Provato sulla 7.3.2 insieme a tutti gli altri plugin, anche con Ricarica e uno stress test in corso.

## Guardie e ladri (`guardieladri.js`) — 1.1

**1.1** — 10 ottobre 2026
- Durante la partita blocca anche `/hub`, pure su un server che ha già `guardieladri.config.json` con la lista vecchia di `comandiBloccati`.
- Per gli altri plugin: `globalThis.VoxeliaGuardieLadri.gioca(p)` dice se un eroe sta giocando una partita in corso.

**1.0** — 9 ottobre 2026
- Nascondino a squadre in un quartiere, una partita per stanza. Si apre con `/guardie apri` (o dalla pagina admin `/plugins/guardieladri/admin`), si entra con `/guardie entra`, anche chiedendo `ladro` o `guardia`. Le squadre si fanno a caso: una guardia ogni due ladri, almeno 3 giocatori.
- I ladri hanno un minuto per nascondersi mentre le guardie hanno lo schermo oscurato, poi 5 minuti di caccia. Il server cattura un ladro quando una guardia è nella sua zona a 2 caselle o meno. In chat si legge solo quanti ladri restano, i nomi escono alla fine.
- Quattro quartieri pronti: Aldoria con tutti i suoi edifici (di base), Quartiere Nobile, Campi e Mestieri, Porto. Chi ne esce è squalificato. Durante la partita `/tpa`, `/borgo`, `/visita` e `/discoteca` sono bloccati per chi gioca.
- Le guardie vedono i ladri solo entro 6 caselle, anche sulla minimappa. Nella lista dei giocatori, nella chat e nel profilo non compare la zona dei ladri.
- Contro i trucchi: ogni cambio di zona deve passare da una porta vera (mappa dei portali letta dal gioco 7.3.2) e nessuno può andare oltre 9 caselle al secondo. Dopo un movimento impossibile la guardia non cattura per 5 secondi, al terzo si è squalificati. Limite: un gioco modificato riceve comunque dal server la posizione di tutti.
- Premi: 150 oro e 100 XP a ogni ladro rimasto libero, 100 oro e 80 XP alle guardie se li prendono tutti, 25 oro per ogni cattura (sotto i 3 giocatori niente premi). Classifica con `/guardie classifica` e pagina pubblica `/plugins/guardieladri/`. I bot dello stress test non entrano in classifica.
- Provato sulla 7.3.2 con giocatori finti e con tre eroi nel gioco vero (Chromium), anche su schermo da telefono, con Ricarica a partita in corso e insieme a tutti gli altri plugin.

## Esempio (`esempio.js`) — 1.0

- I bot dello stress test non vengono contati in `/boss` — 9 ottobre 2026 (senza cambio di versione).
- Plugin dimostrativo fornito con il server: saluto, `/dado`, `/ora`, `/boss`, `/festa` e una pagina web.
