# Voxelia – Il Regno Perduto

**Un gioco di ruolo punta e clicca in grafica voxel isometrica, che gira nel browser.** Si gioca da soli o con gli amici, si
esplora la città di Aldoria e il regno intorno, si combatte nei dungeon e si costruiscono mondi propri con l'editor
**Voxelia Studio**.

Versione attuale: **7.37** · tutte le modifiche, versione per versione, sono in [CHANGELOG.md](CHANGELOG.md) (anche nel
gioco, nel menu **Novità**).

![Aldoria, la città](docs/aldoria.jpg)

> *Il Re Lich Malakar ha spezzato la Corona di Voxel in sei frammenti. Esplora Aldoria, accetta missioni, conquista sette
> dungeon che rinascono a ogni vittoria e sfida gli altri eroi nel Colosseo.*

---

## Indice

- [In breve](#in-breve)
- [Come si gioca subito](#come-si-gioca-subito)
- [Comandi](#comandi)
- [La vista 3D](#la-vista-3d)
- [Le modalità](#le-modalità)
- [La Modalità Storia](#la-modalità-storia)
- [Tomorrow (anteprima)](#tomorrow-anteprima)
- [Il mondo](#il-mondo)
- [L'eroe e l'equipaggiamento](#leroe-e-lequipaggiamento)
- [Cose da fare ad Aldoria](#cose-da-fare-ad-aldoria)
- [Musica](#musica)
- [Voxelia Studio](#voxelia-studio)
- [Mondi della community](#mondi-della-community)
- [Multigiocatore: il server](#multigiocatore-il-server)
- [Plugin del server](#plugin-del-server)
- [Pubblicare il server online](#pubblicare-il-server-online)
- [Impostazioni, lingue e salvataggi](#impostazioni-lingue-e-salvataggi)
- [Struttura del progetto](#struttura-del-progetto)
- [Sviluppo](#sviluppo)

---

## In breve

- **Un solo file.** Il gioco intero è `voxelia.html`: grafica, musica, testi e logica. Non servono installazioni,
  librerie o connessione a internet per giocare da soli.
- **Vista classica o vista 3D**, da alternare in qualsiasi momento: in 3D luce del sole, ombre, materiali, acqua che
  riflette, torce che illuminano davvero e un orizzonte che arriva fino alle montagne.
- **Grafica voxel isometrica** disegnata in tempo reale su canvas, con giorno e notte, luci, meteo e particelle,
  e qualità regolabile da «leggera» a «Ultra».
- **Musica procedurale e scritta nota per nota**: 57 brani scritti a mano, fra cui uno diverso per ogni edificio di
  Aldoria, suonati in tempo reale dal sintetizzatore del gioco (Web Audio).
- **Un regno grande**: 102 zone (70 interni da esplorare), 7 dungeon a più piani, 173 personaggi, 130 missioni,
  71 tipi di nemici di cui 13 boss.
- **Una storia raccontata da filmati** girati nei luoghi veri del gioco, con i suoi personaggi e l'eroe vestito con il
  suo equipaggiamento.
- **Tomorrow** (anteprima): un mondo nuovo e senza confini, generato mentre cammini, con villaggi, dungeon e mostri
  sempre diversi, contratti nati da zero e oggetti unici da trovare e da scambiare con gli altri eroi.
- **Multigiocatore** con un server Node.js **senza dipendenze**: stanze, chat, scambi, arena PvP con classifica,
  pannello admin e plugin.
- **Voxelia Studio**: un editor completo per creare mondi con mappe, personaggi, dialoghi, missioni, oggetti, musiche
  e cinematiche, e **pubblicarli** sul server per farli giocare agli altri.
- **Telefoni e tablet**: joystick e pulsanti sullo schermo, che si adattano da soli al dispositivo.
- Tutto in **italiano**, con l'interfaccia anche in inglese e in eldoriano, la lingua antica del regno.

---

## Come si gioca subito

### Da soli, nel browser
1. Scarica o apri `voxelia.html` con un browser recente (Chrome, Edge, Firefox, Safari).
2. Nel menu scegli **Modalità Storia**, crea l'eroe e scegli la difficoltà.

La partita si salva da sola nel browser. Funziona anche offline.

### Con gli amici, sulla stessa rete
Serve [Node.js](https://nodejs.org) 16 o più recente:

```sh
node server.js
```

Il server chiede la password del pannello admin, oppure la legge da `ADMIN_PASSWORD`. Poi stampa gli indirizzi da aprire,
per esempio `http://192.168.1.20:3000`. Chi apre quell'indirizzo gioca con il server. Gli eroi che scrivono lo **stesso
codice stanza** nel menu (campo «Stanza») giocano insieme. Lasciando il campo vuoto si gioca da soli.

Per giocare con amici su reti diverse si espone la porta con un tunnel (per esempio cloudflared o ngrok), oppure si
pubblica il server online: vedi [Pubblicare il server online](#pubblicare-il-server-online).

---

## Comandi

### Tastiera e mouse

| Tasto | Azione |
|---|---|
| Clic sul terreno, **W A S D** o frecce | Muoversi |
| Clic su nemici, forzieri, oggetti, personaggi | Attaccare, aprire, raccogliere, parlare |
| **R** | Interagire con ciò che hai vicino |
| **Spazio** o **X** | Attacco: ogni pressione fa la mossa seguente della catena dell'arma; tenuto premuto, il colpo caricato |
| **Shift** o **E** | Schivata |
| **F** | Affondo (diverso per ogni tipo di arma) |
| **1 2 3 4** | Abilità delle arti marziali |
| **Q** | Bere una pozione |
| **I** | Zaino |
| **J** | Missioni |
| **K** | Diario |
| **L** | Classifica |
| **P** | Giocatori |
| **M** | Mappa di Aldoria (in Tomorrow, la mappa del mondo) |
| **Z** | Domare: lancia un Sigillo di doma sul mostro indebolito più vicino |
| **N** | I compagni (la stalla) |
| **U** | In Tomorrow: territorio, conquista e il tuo insediamento |
| **V** | In Tomorrow, nel tuo insediamento: l'editor del borgo |
| **Maiusc** | Capriola (premuto e lasciato) · corsa (tenuto mentre ti muovi) |
| **Tab** | Blocca il bersaglio · il nemico dopo |
| **Y** | In Tomorrow: le fazioni e la tua fazione con il suo stemma |
| **T** | In Tomorrow, accamparsi |
| **G** | In Tomorrow, le gemme del teletrasporto |
| **C** | Aspetto dell'eroe |
| **O** | Opzioni |
| **V** | Ruota delle azioni (il tasto si può cambiare) |
| **Invio** | Chat |
| **Esc** | Chiude la finestra aperta; con niente di aperto, il menu di pausa |
| Rotella del mouse | Zoom (in 3D avvicina la telecamera) |
| **B** | Vista classica o vista 3D |
| Tasto destro del mouse, trascinando | In 3D, gira la telecamera |

Ogni tasto delle finestre le apre e le chiude. Si apre una finestra alla volta: aprendone una si chiudono le altre.

### Il combattimento (dalla 7.19)

Ogni arma ha le sue mosse. **Spazio**, **X**, il pulsante grande sul telefono o un clic sul nemico a portata fanno la
mossa seguente della **catena** di tre colpi; premere di nuovo appena la mossa finisce dà un **colpo perfetto** (+30%).
Chi clicca il bersaglio e basta ripete solo il primo colpo, più lentamente. **Tenendo premuto** si carica il **colpo
caricato** dell'arma: più è carico, più fa male. Le mosse colpiscono tutti i nemici nella loro forma.

| Arma | Catena | Colpo caricato |
|---|---|---|
| Pugnale, stocco | Taglio · Rovescio · Doppia pugnalata (sanguinamento) | Danza delle lame: scatto che trafigge e fa sanguinare |
| Spada | Fendente · Montante · Colpo del cavaliere (spinge lontano) | Turbine: due giri tutto intorno |
| Ascia | Fendente pesante · Rovescio · Spaccascudi (corazza spezzata: +30% danni) | Salto del boia: salto con onda d'urto |
| Martello, mazza | Colpo · Montante · Schianto (stordisce) | Terremoto: colpo a terra che stordisce tutto intorno |
| Lancia | Stoccata · Stoccata alta · Spazzata | Carica: scatto lungo che trafigge |
| Tridente | Affondo · Affondo · Tre punte (tira a te) | Maremoto: onda che travolge e rallenta |
| Bastone, scettro | Dardo arcano · Dardo arcano · Catena di fulmini | Nova arcana: esplosione sul bersaglio che rallenta |
| Falce | Mietitura · Rovescio · Raccolto (ruba vita) | Danza della morte: due giri che rubano vita |

Le mosse dell'arma sono scritte anche nella sua scheda, nello zaino.

### Domare i mostri (dalla 7.20)

Un mostro sotto un terzo della vita si può domare con un **Sigillo di doma** (tasto **Z** o il pulsante «Doma»; i
sigilli si comprano dai mercanti). Più è debole, più è facile; i boss non si domano. I compagni (tasto **N**, fino a
12 nella stalla) combattono al tuo fianco uno alla volta, con una mossa speciale secondo la loro natura (belva,
guerriero, artropode, creatura magica, melma, volante). Crescono con le vittorie e si evolvono ai livelli 10 e 20.
Se cadono si riprendono in un minuto, o subito al campo, al santuario o alla locanda.

### Il tuo regno in Tomorrow (dalla 7.21)

- **Conquista** (tasto **U**): pianta lo stendardo in una regione selvaggia e abbatti i suoi mostri. Al 100% la regione è
  tua e i mostri non tornano più. Le terre delle fazioni sono difese dalle loro guardie.
- **Insediamento**: in una regione conquistata fondi il tuo borgo. Cresce fino al livello 5 e ci costruisci mercato,
  fucina, tempio, locanda, stalla, granaio, palizzata e torri. Raccoglie tasse e raccolto ogni giorno e si
  personalizza con nome, colori e decorazioni.
- **Fazioni** (tasto **Y**): sei fazioni con stemma, città sede, emissario e terre. Puoi unirti a una o fondare la tua,
  con lo stemma che disegni (forma, partizione, colori, simbolo).

### Le guerre (dalla 7.22)

Le fazioni attaccano le tue terre: hai fino al giorno dopo per difendere lo stendardo dalle loro ondate, altrimenti la
terra passa a loro o il borgo viene saccheggiato. Con il server e il plugin **Territori**, gli eroi dello stesso mondo
(stesso codice stanza) si contendono le terre: quelle di un altro si prendono con un assedio, i suoi insediamenti si
saccheggiano. La cronaca è nel registro (U → Guerra).

### Il reset dell'universo (dalla 7.23)

All'inizio di Tomorrow un filmato racconta i mille anni dopo Aldoria: la Corona distrutta, il mondo che si scioglie e si
ricompone in terre nuove, i sopravvissuti che ricostruiscono. Si rivede dal menu di Tomorrow. Nelle rovine, nei forzieri
e nei dungeon si trovano i dodici **cimeli di Aldoria**, oggetti leggendari e reperti del vecchio mondo, ognuno con la
sua storia (pausa → Cimeli di Aldoria).

### Villaggi e città di Tomorrow (dalla 7.24)

I villaggi hanno una strada maestra, i vicoli, la piazza con la fontana e il mercato, le case lungo le strade con gli orti
dietro, la locanda, la forgia e i campi intorno. Le città sono divise in isolati con viali, cortili, il tempio in fondo al
viale, il mercato, il parco e le mura. La gente si muove: va in piazza, al mercato, nei campi, la sera alla locanda e di
notte a casa. Le guardie fanno la ronda e i mercanti restano al loro banco.

### Il prologo (dalla 7.25)

Il prologo della Storia racconta in quattordici scene la fondazione di Aldoria, la Corona e le sei terre, la caduta di
Malakar, la Corona in frantumi e l'arrivo dell'eroe, con tre musiche nuove. Si rivede dal menu delle scene.

### L'editor del borgo (dalla 7.26)

Nel tuo insediamento apri l'editor (tasto **V**, o Registro → Insediamento): sposti gli edifici, aggiungi e demolisci le
case, cambi i colori, disegni strade e piazze e metti alberi, fontane, lampioni, panchine, statue, bancarelle, campi e
staccionate. Scegli anche dove sta il banco del mercante e lo stendardo. La gente del borgo va in giro e il mercante
resta al suo banco.

### La vista 3D voxel (dalla 7.27)

La vista 3D usa lo stile voxel: cubi con gli spigoli netti, la grana a cubetti di ogni materiale e l'erba fatta di cubetti,
con luci, ombre e orizzonte di prima. Nelle opzioni della vista 3D si torna allo stile liscio.

### La gestione del borgo (dalla 7.28)

Per costruire nel tuo insediamento servono legna, pietra, argilla e ferro, che si raccolgono nelle terre selvagge o si
producono con la Segheria e la Cava. Nel registro ci sono le statistiche del borgo: abitanti, cibo, acqua, monete,
potenza dell'esercito e materiali. Ogni giorno gli abitanti mangiano e bevono: se per due giorni cibo o acqua non
bastano, una parte se ne va e torna solo quando le condizioni migliorano. Cibo e acqua vengono da Fattoria, Granaio,
Cisterna, campi, pozzi e fontane, o dal cibo che porti tu.

### L'editor con tutti i materiali (dalla 7.29)

Nell'editor del borgo ci sono tutti i pavimenti, i muri (con il colore che vuoi) e gli arredi del gioco, con la ricerca.
Gli edifici si fanno su misura: stile, colore dei muri e del tetto, altezza, camino. Ogni cosa costa le sue risorse.

### La caserma e l'esercito (dalla 7.30)

Nel borgo si costruisce la Caserma e si addestrano i soldati (monete, ferro e cibo). Potenziare la caserma porta più
soldati e più forti. La potenza dell'esercito difende il borgo e le terre: se non arrivi in tempo a un assalto combatte
l'esercito, e con un esercito più debole del nemico la probabilità di vincere è bassa. Se sei lì, i soldati combattono
con te; negli assedi fra giocatori le guardie sono forti quanto l'esercito di chi difende.

### Le miniere (dalla 7.31)

Nel borgo si costruisce la Miniera: dentro si scava a mano cliccando sulla roccia, e si trovano pietra, carbone, ferro,
rame, marmo, pepite d'oro e gemme, sempre più preziosi man mano che si scende. Potenziandola si scava più in fondo e dal
livello 3 si trovano i reperti storici di prima del reset (al livello 5 anche i cimeli di Aldoria). Le gallerie restano
e ogni giorno i minatori portano un po' di minerali al magazzino.

### Il combattimento d'azione (dalla 7.32)

Si combatte cliccando dove si vuole colpire: l'eroe si gira verso il cursore e fa la mossa della sua arma; tenendo premuto
si carica il colpo pesante. Attacchi, capriola (Maiusc o E) e corsa (Maiusc tenuto) consumano la stamina, che si
ricarica da sola. Tab blocca il bersaglio: l'eroe lo guarda sempre e ogni colpo va su di lui. Lontano dai nemici il clic
fa camminare. Il combattimento classico si riattiva in Impostazioni → Comandi.

### La tua casa e le mura (dalla 7.33)

Nel borgo si costruisce la propria casa, con il deposito per oggetti e monete. Ogni casa del borgo si arreda da dentro
(tasto V): uno dei dieci modelli della storia, colori e materiali di muri e pavimento, tutti gli arredi del gioco, nome
e musica. Dall'editor del borgo (scheda Mura) si cambiano le mura: tipo, colore, porte e torri.

### Le tue città (dalla 7.34)

Conquistando altre regioni si fondano altre città (fino a 8), ognuna con livello, edifici, tesoro, abitanti ed esercito
suoi. Si parte sempre dalla capitale, scelta nel registro. Al mercato della tua città si compra la sua gemma del
teletrasporto; nelle altre città e nei villaggi i materiali da costruzione hanno prezzi che cambiano ogni giorno.

### Il legno e la città grande (dalla 7.35)

Gli alberi di Tomorrow si abbattono con 5 colpi e lasciano 2 legna; ricrescono dopo qualche giorno. Il legno ora serve in
quantità per costruire. La città arriva al livello 15 e, potenziandola molte volte, copre tutta la regione.

### La Pietra del viaggio (dalla 7.36)

Nelle tue città e nelle città con il Custode delle Gemme c'è una Pietra del viaggio che elenca tutti i luoghi con una
gemma del teletrasporto. Ogni gemma si compra una volta sola, in quel luogo: poi ci si viaggia quando si vuole, dalla
pietra o con il tasto G.

### Fluidità e grafica (dalla 7.37)

L'acqua si disegna poche volte al secondo e la risoluzione dinamica tiene il gioco fluido sui computer meno potenti.
In Impostazioni → Grafica si regolano luminosità, contrasto, colori, particelle, scossoni e risoluzione (fino al 150%);
per la vista 3D risoluzione interna con upscaling e nitidezza in stile FSR, campo visivo, nebbia, ombre e luci.
Il DLSS di NVIDIA non è possibile in un browser.

### Telefoni e tablet
Sui dispositivi touch compaiono:
- il **joystick** in basso a sinistra, che parte dal punto in cui si tocca;
- i pulsanti **Colpo**, **Affondo**, **Schiva**, **Pozione** e le abilità;
- il pulsante verde **usa**, quando c'è qualcosa vicino;
- il **Menu** a griglia con zaino, missioni, diario, mappa, aspetto, classifica, giocatori, chat e opzioni.

Lo zoom si fa con due dita. Comandi e pulsanti si adattano da soli a telefoni, pieghevoli e tablet, in verticale e in
orizzontale, e si possono spostare e ridimensionare con l'**editor dell'HUD** (Impostazioni → Interfaccia).

### Meta Quest (realtà virtuale)
Nel browser del Quest compare il pulsante **Entra in VR** (nel menu e, durante la partita, in basso a destra). Il gioco
appare su un grande schermo sospeso davanti a te; la pagina deve essere aperta da un indirizzo **https** (o da `localhost`),
altrimenti il browser non offre la realtà virtuale.

| Comando | Controller |
|---|---|
| Puntare e cliccare / scorrere una finestra | Raggio del controller + grilletto / levetta destra su e giù |
| Muoversi | Levetta sinistra |
| Zoom | Levetta destra (avanti e indietro) |
| Interagire (R) / Schivata (o chiudi finestra) | A / B |
| Pozione / Zaino | X / Y |
| Colpo ad area / Affondo | Impugnatura sinistra / destra |
| Mappa / Rimettere lo schermo davanti | Premere la levetta sinistra / destra |

#### Prima persona
Entrando in VR si gioca **in prima persona**: vedi il mondo con gli occhi dell'eroe, a grandezza naturale, costruito con gli
stessi modelli del gioco; in mano hai l'arma equipaggiata e sul braccio lo scudo. Si attacca muovendo il controller.
L'interfaccia del gioco è un pannello sotto lo sguardo, da guardare (i suoi pulsanti sono nel menu della VR); zaino, dialoghi, negozi e mappa si aprono su un pannello davanti a te.
Durante filmati, visita guidata, navigazione e minigiochi si torna da soli allo schermo sospeso.

| Comando | Controller |
|---|---|
| Attaccare | Fendente con il controller destro · grilletto destro (nemico davanti) |
| Affondo / Colpo ad area | Stoccata in avanti · impugnatura destra / le due mani giù insieme · impugnatura sinistra |
| Camminare / Girarsi | Levetta sinistra (si cammina dove guardi, o davvero nella stanza) / levetta destra |
| Interagire / Schivata o chiudi | A (con chi ti sta davanti, o con chi punti col raggio) · grilletto puntato su una persona, porta o oggetto / B |
| Pozione / Zaino / Mappa | X / Y / premere la levetta sinistra |
| Menu della VR | Grilletto sinistro puntato nel vuoto: pulsanti della barra, prima persona sì/no, rotazione a scatti o continua, vignetta (da nessuna a forte), distanza di visuale, velocità, altezza degli occhi |

---

## La vista 3D

Dalla 7.15 il gioco si può guardare in vero 3D. Si passa dalla vista classica alla vista 3D in qualsiasi momento, con il
tasto **B**, con il pulsante **3D** in alto o dal menu di pausa, e la partita continua uguale.

- **Telecamera:** segue l'eroe da dietro. Con il tasto destro del mouse (o due dita sul telefono) si gira; con la rotellina
  (o il pizzico) si avvicina. Ci sono anche i pulsanti ⟲ ⟳ in alto. WASD e la levetta si muovono rispetto alla telecamera.
  Il clic funziona come sempre: si cammina, si attacca, si parla, si raccoglie. Muri e alberi fra la telecamera e l'eroe
  diventano trasparenti, così l'eroe si vede sempre.
- **Luce:** il sole segue l'ora del giorno e proietta le ombre; al tramonto la luce si fa arancione, di notte compaiono le
  stelle, e lampioni, torce e bracieri illuminano davvero le strade e i sotterranei.
- **Materiali:** i modelli sono quelli del gioco, ma con gli spigoli arrotondati e la loro grana: erba, pietra, legno,
  sabbia, neve, metallo lucido (armi e armature brillano al sole). L'acqua si muove e riflette il cielo, la lava pulsa. I fili
  d'erba si muovono col vento.
- **Orizzonte:** attorno a ogni zona all'aperto il mondo continua: campi e casolari, boschi, dune, laghi e catene di
  montagne innevate fino all'orizzonte, sfumati dalla foschia.
- **Opzioni** (menu di pausa o Impostazioni → Vista 3D): dettaglio Basso, Medio o Alto, ombre, erba, orizzonte lontano,
  velocità della telecamera. Se il gioco rallenta, la vista 3D abbassa da sola la risoluzione e poi il dettaglio. Sui telefoni
  parte con il dettaglio Basso.
- Nei filmati, durante la pesca, la navigazione, le battaglie navali e nell'editor si torna da soli alla vista classica.
- Serve WebGL 2, che hanno tutti i browser recenti; se manca, il gioco lo dice e resta nella vista classica.

### Il menu di pausa

L'ingranaggio in alto (o **Esc** quando non c'è niente di aperto) apre il menu di pausa: riprendi, vista classica o 3D con le
sue opzioni, impostazioni, aspetto dell'eroe, comandi, salva ora e ritorno al menu principale.

---

## Le modalità

![Il menu](docs/menu.jpg)

| Modalità | Che cos'è |
|---|---|
| **Modalità Storia** | Il Regno Perduto: l'avventura principale, con quattro difficoltà, il prologo e le scene della storia. |
| **Tomorrow** *(anteprima)* | Un mondo senza confini oltre il regno, generato a regioni mentre cammini: villaggi, dungeon e mostri sempre nuovi, contratti dalle bacheche dei villaggi, bottino di oggetti unici. Ha un eroe e un salvataggio suoi. |
| **Parco giochi · Voxelia Studio** | L'editor per costruire e giocare i propri mondi. |
| **Mondi della community** | I mondi pubblicati dagli altri giocatori sul server: si giocano, si votano e si commentano. |
| **Voxelia Dimension** | Un'avventura a parte attraverso le epoche (Far West, Londra vittoriana, Rivoluzione francese, Grande Guerra). Per ora è nascosta dal menu ed è raggiungibile dal pannello sviluppatore. |

---

## La Modalità Storia

Re Aldric affida all'eroe la missione di ritrovare i **sei frammenti della Corona di Voxel**, custoditi dai signori dei
dungeon. Poi c'è la **Cittadella del Vuoto**, dove aspetta il Re Lich Malakar. Aldoria nasconde anche segreti, pagine di
diario, un quartiere murato e più di un finale: il vero finale si conquista sotto Aldoria Vecchia, contro l'**Abominio**,
in una battaglia lunga e molto difficile divisa in cinque fasi (le braccia, il ventre, l'eco della Regina Elara, l'Occhio e
il cuore).

### Scene della storia
Il viaggio è raccontato da **filmati girati nei luoghi veri del gioco**: la sala del trono, la piazza, la porta ovest, il
porto, Aldoria Vecchia, la cappella, le prigioni, la fucina di Borin, i dungeon e la stanza dell'Occhio, con i loro arredi,
le luci e gli abitanti. I personaggi camminano lungo le strade, entrano in scena camminando o con una dissolvenza e
parlano con i sottotitoli. Ci sono il **prologo** (la storia della Corona dall'inizio), il giuramento, i sei ricordi dei
frammenti, la forgia della Corona, la caduta di Malakar, la festa del Campione, il settimo cuore, la verità su Aldoria
Vecchia, l'arresto, il vero finale e le scene della battaglia navale. Ogni filmato si vede una volta durante la partita
(si salta con «Salta») e poi si rivede dal menu, in **Scene della storia**.

### Difficoltà

| Difficoltà | Nemici | Bottino | Quando si cade |
|---|---|---|---|
| **Facile** | vita −30%, danni −40% | più ricco | si rinasce in città |
| **Normale** | equilibrati | normale | si rinasce in città perdendo il 15% dell'oro |
| **Difficile** | vita +50%, danni +40% | meno ricco | si rinasce in città perdendo il 25% dell'oro |
| **Incubo** | vita ×2,2, danni ×2 | povero | **morte permanente**: il salvataggio viene cancellato |

Dalla 7.11 la Modalità Storia è più impegnativa a ogni difficoltà:
- nei dungeon i nemici hanno un altro 10% (Facile), 20% (Normale) o 30% (Difficile e Incubo) di vita e di danni; fuori
  dai dungeon l'aumento è di tre quarti;
- i nemici lavorano in **branco**: chi ti vede o viene colpito chiama quelli che gli stanno vicino;
- compaiono i **Campioni**, nemici più grossi con un alone dorato ai piedi: quasi il doppio della vita, più danni, più
  velocità, e un bottino sicuro. Nei dungeon aumentano a ogni ciclo;
- i boss usano le abilità più spesso e, sotto un quarto della vita, entrano nell'**ultima furia**;
- le pozioni curano il 35% e se ne beve una ogni 2,5 secondi, l'armatura protegge un po' meno e i falò curano più piano.

I mondi di Voxelia Studio tengono l'equilibrio scelto dal loro autore.

---

## Tomorrow (anteprima)

Dalla 7.16 (era il «Mondo aperto» della 7.14). Oltre i confini del regno si apre una terra che nessuna mappa ha mai
disegnato. Si sceglie dal menu, con un eroe e un salvataggio tutti suoi (`voxelia_ow`): la partita della storia non viene
toccata. Un eroe del vecchio Mondo aperto passa a Tomorrow con livello, oggetti, reperti e reputazione.

### Un mondo che non finisce

- Il mondo è fatto di **regioni** di 96×96 caselle, generate mentre cammini. Cammina oltre il bordo e sei nella regione
  accanto (nella 7.18 le regioni erano unite senza passaggio; dalla 7.19.1 si torna al passaggio con la transizione).
- Il terreno dipende dalle coordinate del mondo: fiumi, laghi, boschi, dune e pareti di roccia continuano da una
  regione all'altra, e i sentieri si incontrano sempre sul bordo comune.
- **Cinque biomi:** prati fioriti, boschi, deserti con mese e oasi, vette innevate, lande di cenere.
- **Villaggi** (uno ogni sette regioni circa, più quello di partenza): case, abitanti con nome, mercante, fabbro, erborista,
  guaritrice, locanda e la Bacheca dei Contratti. Si rinasce nell'ultimo villaggio visitato.
- **Città** (dalla 7.17; la prima è sempre a due regioni dalla partenza): mura con torri e porte sulle strade, vie
  lastricate, piazza con fontana, statue, lampioni, mercato e la bacheca, fino a 22 case, guardie e cittadini a passeggio.
- **Case in cui si entra:** ogni casa di villaggi e città ha il suo interno con chi ci abita. Ci sono la locanda, la
  bottega, la fucina, il tempio della guaritrice e, in alcune città, il Custode delle Gemme.
- **Borghi** (dalla 7.18): dove si incrociano i sentieri di ogni regione ci sono da due a quattro case con i loro
  abitanti, il focolare o il pozzo e un orto.
- **Vita lungo le strade:** recinti con animali, orti, viandanti e mercanti, falò, e santuari che una volta al giorno curano
  e danno difesa +25% per 5 minuti.
- **Dungeon** con nome proprio (Grotte, Cripte, Tombe, Caverne, Forge, Grotte sommerse, Abissi), da 2 a 5 piani, mostri del
  loro tema e un **boss con nome e abilità mescolate**.
- **Mostri sempre diversi:** ogni zona del mondo ha le sue specie, varianti dei mostri del regno con colori, taglia, forza,
  velocità e nome propri («Lupo delle Ceneri», «Scheletro d'Ambra»...). Alcune colpiscono a distanza.
- **Livello senza limite:** più ti allontani dal villaggio di partenza, più il livello sale. I mostri diventano più forti e
  il bottino più prezioso.
- Accampamenti con un Campione, rovine con un forziere, raccolte del bioma. I forzieri aperti restano aperti.
- **Mappa del mondo** (tasto **M**), dipinta dal terreno vero, con strade, città, villaggi, dungeon e le terre mai viste
  velate. Si trascina, si avvicina con la rotellina o i pulsanti, e un clic su una regione apre la sua scheda (livello,
  pericolo, luoghi, contratti, direzione). Dalla scheda la regione diventa la **destinazione**, segnata sulla mappa e nel
  resoconto in alto a destra fino all'arrivo.

### Campo, gemme e battaglie

- **Campo** (tasto **T** o pulsante ⛺, fuori dai villaggi e senza nemici vicini): tenda e fuoco fanno una zona sicura in
  cui i nemici non entrano, la vita torna in fretta e le pozioni si ricaricano prima. Al fuoco si riposa (cura completa,
  due ore), si dorme fino all'alba, si cucina (forza +25% per 3 minuti) o si smonta il campo.
- **Gemme del teletrasporto:** in alcune città il Custode delle Gemme vende la gemma della città (il prezzo sale con il
  livello). Tasto **G** o pulsante 💎: una colonna di luce, poi il filmato del volo sulla mappa fino alla città.
- **Battaglie:** le città possono essere assediate, da sole (dal livello 3) o con un contratto «La battaglia di…». Si
  combatte a ondate insieme a 13–21 soldati alleati; l'ultima porta un signore della guerra.
- In **vista 3D** l'orizzonte mostra il mondo vero: le regioni che vedi in lontananza sono quelle in cui puoi camminare.

### La Bacheca dei Contratti

In piazza in ogni villaggio. Ogni giorno di gioco propone quattro contratti nuovi (da «Stimato» in su anche
un **contratto d'onore**, più duro e pagato meglio) e se ne possono tenere tre alla volta. Ogni contratto nasce da un seme
ed è unico:
- un **committente** di una delle sei fazioni di Tomorrow: Lega dei Villaggi, Compagnia dei Cartografi, Ordine della
  Fiamma, Mercanti di Strada, Custodi delle Rovine, Clan dei Cacciatori;
- un **tipo**, con le sue tappe:

| Tipo | Tappe |
|---|---|
| Taglia | un testimone in un villaggio, poi la caccia a un bersaglio con nome in un'altra regione |
| Infestazione | sterminare una specie in una regione, poi il capobranco |
| Spedizione | il guardiano del primo piano di un dungeon, poi la reliquia in fondo all'ultimo |
| Reliquia perduta | uno studioso, poi la reliquia in un dungeon, custodita da un Campione |
| Assedio | difendere il villaggio da 3-5 ondate di mostri delle terre vicine, l'ultima guidata da un capo |
| Commissione rara | raccogliere materiali in una regione, poi il trofeo di una bestia |
| Messaggio | portare una lettera a un abitante di un villaggio lontano, poi la risposta a un altro |
| Esplorazione | raggiungere due regioni lontane |
| Battaglia | difendere una città insieme ai soldati, a ondate, fino al signore della guerra, poi la paga |

Ogni tappa dice in che direzione andare («3 regioni a nord-est»).

- **Bersagli con nome** (Grakk Spaccaossa, Morva Ombralunga…): sono Campioni, più forti a ogni stella, con da 1 a 3
  tratti fra corazzato, furioso, rapido, rigenerante, evocatore, spinato e scudato. **I testimoni te li raccontano prima
  dello scontro.** Una colonna di luce indica bersagli, reliquie, testimoni e luoghi da difendere.
- **Patti** che alzano la posta (e la paga): tempo limitato, niente pozioni nella zona del contratto, scorta di
  Campioni, orda.
- **Stelle** da 1 a 5, secondo zona, livello, tratti e patti.
- **Ricompense**: oro, esperienza, un **oggetto unico** (raro con 2 stelle, epico con 4, leggendario con 5), un
  **reperto** da collezione e la **reputazione** con la fazione (Sconosciuto, Conosciuto, Stimato, Onorato,
  Leggendario), che fa crescere le paghe.

I contratti in corso si seguono in alto a destra e nel pannello delle missioni (J).

### Oggetti unici

Nel Mondo aperto bottino, forzieri, fabbro e bottega danno solo **oggetti unici**. Ogni oggetto nasce da un seme che
decide tutto: la forma (15 armi, 6 elmi, 6 corazze, 5 scudi), la rarità, la qualità (dal 60 al 100%), da 1 a 3 poteri
fra 19 (fuoco, gelo, fulmine, veleno, vampiro, ferocia, precisione, caccia, rapidità, mietitura, saggezza, fortuna,
robustezza, spine, agilità, rigenerazione, alchimia, guardia, buona stella) con la loro forza, il nome, una riga di storia
e il numero di serie. I leggendari hanno un nome proprio e un potere firmato: Eco, Sete di sangue, Tempesta, Baluardo,
Seconda pelle, Fenice. Lo zaino mostra tutto nella scheda dell'oggetto, compresa la **provenienza** (chi l'ha trovato e
chi l'ha avuto dopo).

Nel salvataggio e negli scambi viaggia solo il seme: il gioco ricalcola il resto, così un oggetto non si può gonfiare a
mano. I poteri funzionano in tutte le modalità tranne l'editor.

### Scambi

Gli oggetti unici sono la moneta degli scambi fra eroi. Dalla finestra di scambio si scambiano armi e armature (con poteri
e provenienza in vista), **reperti**, oro e, dalla 7.14, anche **pozioni**. Chi riceve un unico lo ritrova identico, e il
suo nome si aggiunge alla provenienza. Mercatino e Case (plugin) conservano gli unici.

---

## Il mondo

### Aldoria e i suoi quartieri
- **Aldoria, la città**: la piazza con la fontana e il mercato (aperto dalle 7 alle 19), il castello del Re, la biblioteca,
  la taverna, le botteghe, il tempio, il casinò, il motel, la caserma, la banca e decine di case che si possono visitare.
- **Aldoria Nord, il Quartiere Nobile**: il palazzo del Conte, il teatro dell'opera, l'osservatorio e sei ville.
- **Aldoria Est, Campi e Mestieri**: fattorie, mulino, fienile, segheria, scuderia e campi da raccogliere.
- **Porto di Aldoria**: il molo, la pescheria, il cantiere navale, il faro, i magazzini e le barche.
- **Borgo delle Ceneri**: la periferia bruciata di **Aldoria Vecchia**, con banditi, spettri e il cimitero.
- **Il Colosseo**: un vero anfiteatro con tre ordini di arcate; dentro, la sala d'ingresso e la fossa dell'arena PvP con le gradinate e la classifica.

![La Taverna del Drago Ubriaco](docs/taverna.jpg)

Ogni giorno di gioco dura **24 minuti**: un secondo reale è un minuto di gioco. Di giorno i cittadini sono in giro e i
mercanti alle bancarelle. Di sera tornano a casa, di notte in strada restano le guardie di ronda, e l'esperienza vale il 20%
in più.

### Fuori dalle mura

| Zona | Livello | Boss |
|---|---|---|
| Foresta di Elmwood | 1 | Troll della Foresta |
| Deserto di Khem | 4 | Faraone Eterno |
| Picchi Gelidi | 7 | Drago di Brina |

Le tre zone sono grandi 64×64 caselle e hanno una pianta fissa, con i sentieri che dalla porta portano ai luoghi da visitare:
- **Foresta di Elmwood**: la radura delle lucciole, il cerchio di pietre con l'Erba Lunare, la capanna del Cacciatore Ulrico,
  la torre di guardia in rovina, il lago con il ruscello, l'accampamento dei goblin davanti alla Tana e la Grande Quercia del Troll.
- **Deserto di Khem**: l'oasi con la tenda del Mercante Amir, la Piramide a gradoni con la Sfinge, la città sepolta con gli
  Scarabei dorati, l'accampamento della carovana e la necropoli del Faraone.
- **Picchi Gelidi**: il rifugio dell'Esploratrice Ilva, il villaggio congelato dal Drago, il lago ghiacciato, le grotte di
  cristallo, la bocca della Fucina, il santuario con le bandierine e il covo del Drago di Brina.

### I sette dungeon
I dungeon cambiano forma a ogni discesa e **rinascono a ogni vittoria**: ogni nuovo ciclo è più forte e più ricco, e con
più **Campioni**. Nei piani ci sono forzieri, pagine di diario e **falò** dove la vita torna piano piano.

| Dungeon | Ingresso | Livello | Piani | Boss |
|---|---|---|---|---|
| Tana dei Goblin | Foresta di Elmwood | 2 | 2 | Re Goblin Grugnak |
| Cripta Dimenticata | Borgo delle Ceneri | 4 | 3 | Necromante Velka |
| Piramide di Khem | Deserto di Khem | 6 | 3 | Sfinge Antica |
| Caverne di Cristallo | Picchi Gelidi | 8 | 3 | Regina dei Ragni |
| Fucina Infernale | Picchi Gelidi | 10 | 3 | Signore della Fiamma Ignis |
| Abisso Sommerso | Porto (pozzo delle alghe) | 12 | 3 | Leviatano |
| Cittadella del Vuoto | Castello di Aldoria | 15 | 4 | Re Lich Malakar |

Ogni boss ha il suo stile: carica, terremoto, pioggia di colpi, esplosioni, teletrasporto, rigenerazione, scudo,
rinforzi. Quando si infuria diventa più veloce, e sotto un quarto della vita entra nell'**ultima furia**: attacca ancora di
più e usa un'abilità ogni tre o quattro secondi.

![Nella Cripta Dimenticata](docs/dungeon.jpg)

### Il mare e le battaglie
- **Battaglia navale** contro la *Vedova Nera* del Capitano Scarlatto: cannonate, arrembaggio e stiva.
- **La Puledra**, la barca di Stefano: cinque posti di pesca in mare aperto.
- **I campi di battaglia di Ryan il Pelato**: cinque battaglie in cui si comanda un esercito (fanti, lancieri, arcieri,
  cavalieri, catapulte), si scelgono corsia e ordini e si distrugge l'accampamento nemico. Le truppe aggirano gli ostacoli
  da sole, anche quando nascono accanto alla base.

---

## L'eroe e l'equipaggiamento

- **Aspetto** (tasto C): pelle, capelli, occhi, barba, tunica, pantaloni, mantello e corporatura. L'elmo si può nascondere.
- **Statistiche**: attacco, difesa, critico e vita, che crescono con il livello e l'equipaggiamento.
- **Quattro posti**: arma, elmo, corazza e scudo. Ogni oggetto si vede addosso all'eroe con il suo modello, lo stesso delle
  icone dello zaino.

![Icone dello zaino e oggetti indossati](docs/equipaggiamento.png)

| Posto | Tipi |
|---|---|
| Arma | spada, pugnale, stocco, ascia, martello, lancia, tridente, bastone, falce |
| Elmo | elmo, celata, corona, cappuccio, maschera |
| Corazza | corazza a piastre, giaco e cotta di maglia, tunica |
| Scudo | scudo, brocchiere, pavese |

- **Rarità**: Comune, Raro, Epico, Leggendario e Arena. I boss lasciano anche **oggetti unici** come la Clava del Troll, la
  Maschera del Faraone e la Falce di Malakar.
- **Fucina di Borin**: compra set completi, forgia oggetti rari ed epici e **potenzia** l'equipaggiamento fino a **+5**.
- **Maestria delle armi**: l'arma che usi cresce combattendo, fino a ★10 (+4% di danno per livello).
- **Affondo** (tasto F), diverso per ogni arma:

| Arma | Affondo | Portata | Ricarica |
|---|---|---|---|
| Pugnale | Fendente rapido | 2,4 | 4,5 s |
| Spada | Affondo | 2,8 | 6 s |
| Stocco | Affondo di stocco | 3,4 | 6 s |
| Lancia e tridente | Stoccata | 4 | 7 s |
| Ascia | Fendente | 2,2 | 8 s |
| Martello e clava | Schianto | 2,2 | 9,5 s |
| Bastone | Colpo di bastone | 3 | 6 s |
| Falce | Falciata | 2,6 | 7 s |

- **Arti marziali** del Maestro Dino, in caserma (tasti 1–4): **Palmo del Drago** (livello 3), **Calcio del Tornado**
  (livello 5), **Passo dell'Ombra** (livello 8), **Respiro della Tigre** (livello 10).
- **Zaini**: da 24 posti fino a 48 (Zaino da viaggio, da esploratore e del Mercante Reale). Gli oggetti si possono
  bloccare, gettare a terra, vendere o distruggere.
- **Pozioni** (tasto Q): ognuna ridà il 35% della vita, e tra un sorso e l'altro passano 2,5 secondi. Si comprano
  dall'Erborista.

---

## Cose da fare ad Aldoria

- **130 missioni** di molti tipi: caccia, raccolta, boss, consegne, pesca, raccolto, battaglie. I punti esclamativi
  gialli indicano chi ne ha una.
- **Pesca**: 25 specie, dal molo e dalla barca. Le prede si vendono o servono per le missioni.
- **Raccolta**: grano, legna, mele, uova, rose, cimeli antichi, conchiglie, Erba Lunare, Scarabei dorati e Fiori di ghiaccio, che ricrescono col tempo.
- **Casinò Fortuna d'Oro**: slot machine, dadi, roulette e blackjack.
- **Motel della Rosa dei Venti**: una stanza in affitto con il baule e il letto per dormire fino al mattino… e per sognare.
- **Diario** (tasto K): le pagine ritrovate, la storia, i luoghi e le missioni completate.
- **Mappa** (tasto M): in città la mappa di Aldoria, fuori la pianta della zona in cui ti trovi (con uscite, personaggi, boss e forzieri); una guida ai luoghi, con temi chiaro e scuro.
- **Prezzi del giorno**: nei negozi cambiano a ogni mezzanotte del gioco.

---

## Musica

Tutta la musica è generata in tempo reale dal sintetizzatore del gioco:
- **57 brani scritti** nota per nota, ognuno con melodia, accordi, basso, accompagnamento e batteria;
- **brani procedurali** per le zone speciali.

Il tema della città, **«Le vie di Aldoria»** (7.14), è un brano in cinque sezioni che cresce come una giornata in
piazza: l'apertura d'arpa, il tema al flauto, il tema ripreso con il violino che risponde, un ponte allo zufolo e il
ritornello di festa agli ottoni, un tono sopra. Suona in città, nei quartieri, nei filmati girati ad Aldoria e nelle
mappe di Voxelia Studio. Il motore dei brani scritti ora permette a ogni sezione di cambiare strumento, accompagnamento,
basso, batteria e tonalità, e ha una seconda voce e l'armonia a una terza.

Ogni zona ha il suo tema, e dalla 7.10 anche **ogni edificio** ha il suo brano a tema. La taverna balla una giga, la
fucina batte sull'incudine, il tempio canta in coro, il faro suona sopra le onde. Gli strumenti sono 19 (flauto, ottoni,
archi, arpa celtica, organo, carillon, liuto, clavicembalo, fisarmonica, zufolo, coro, violino, banjo e altri), con
riverbero, eco e batterie diverse per ogni stile.

---

## Voxelia Studio

![Voxelia Studio](docs/studio.jpg)

Il **Parco giochi** è un editor completo per creare avventure con gli stessi blocchi, arredi, personaggi, nemici e musiche
del gioco, provarle al volo (**▶ Prova**) e giocarle dall'inizio alla fine.

- **Mappe** da 16×16 a 96×96, collegate da porte, con 14 modelli di partenza: prato, bosco, isola, grotta, dungeon,
  villaggio, deserto, neve, labirinto e altri. Per ogni mappa si scelgono cielo, luce, liquidi, particelle e musica.
- **Strumenti**: terreno, muri, acqua e lava, decorazioni e arredi, edifici con interno creato con un clic, personaggi,
  nemici, oggetti, porte, zone evento. Ci sono pennelli e forme, annulla e rifai, e il salvataggio automatico.
- **Personaggi** con aspetto completo, dialoghi a nodi con condizioni e azioni, mestieri (mercante, fabbro, locandiere…),
  passeggiate, ronde e compagni che seguono l'eroe.
- **Missioni** con 9 tipi di passo, ricompense, condizioni e ripetibilità.
- **Oggetti e armi** su tutte le basi del gioco, con rarità ed effetti speciali (fuoco, gelo, vampiro, fulmine, veleno,
  spinta).
- **Eventi**: zone evento, variabili, 9 tipi di condizione e 26 azioni (messaggi, oro, oggetti, missioni, teletrasporto,
  cinematiche, musica, nemici, vittoria, sconfitta…).
- **Compositore di brani**: melodia a note, scale, strumenti, bassi, accompagnamenti e batterie, anche personalizzate.
- **Cinematiche** con inquadrature, battute, movimenti e musica.
- **Controllo del mondo** (🩺): trova porte senza destinazione, missioni impossibili, oggetti irraggiungibili.
- I mondi si salvano nel browser e si **esportano** in un file `.voxelia.json` da regalare o importare. C'è anche un
  **mondo di esempio**, «La Valle di Pratofiorito», da giocare o studiare.

---

## Mondi della community

Con un server, i mondi creati con Voxelia Studio si **pubblicano** (pulsante **Pubblica** nell'editor) e compaiono nel
**browser dei mondi**:
- una prima pagina con i mondi **in evidenza** (quelli che ricevono tante partite e recensioni in poco tempo);
- le sezioni di tendenza, appena pubblicati, più votati e più giocati;
- ricerca e filtri per genere;
- schede con galleria di immagini e video, statistiche, stelle, recensioni e commenti.

Gli amministratori possono nascondere mondi, rispondere alle segnalazioni e bloccare gli autori dal pannello admin.

---

## Multigiocatore: il server

`server.js` è un solo file per Node.js 16+ **senza dipendenze npm**. Fa queste cose:
- serve il gioco (il file `voxelia*.html` più recente nella sua cartella) e il pannello admin;
- tiene le **stanze**: chi scrive lo stesso codice gioca insieme e si vede nel mondo, con il proprio aspetto e
  l'equipaggiamento;
- gestisce **chat** (con i link cliccabili, che si aprono in una nuova finestra), **scambi** tra giocatori e oggetti a terra condivisi;
- gestisce l'**arena PvP** nel Colosseo, con vittorie verificate dal server, punti arena e il **negozio dell'arena**;
- tiene la **classifica** e i **cicli dei dungeon** condivisi, e un **orologio del mondo** uguale per tutti;
- raccoglie i **Mondi della community**: pubblicazione, recensioni, commenti e segnalazioni;
- carica i **plugin**.

### Variabili d'ambiente

| Variabile | Predefinito | A cosa serve |
|---|---|---|
| `PORT` | `3000` | Porta HTTP e WebSocket |
| `TLS_CERT` / `TLS_KEY` | (nessuno) | Percorsi di certificato e chiave PEM. Se ci sono entrambi il server parla **https** e i WebSocket passano in **wss** sulla stessa porta. |
| `ADMIN_PASSWORD` | (chiesta all'avvio) | Password del pannello admin. Se manca e non c'è un terminale, ne viene generata una casuale e stampata nel registro. |
| `DATA_FILE` | `voxelia-data.json` | Classifica, punti arena, cicli dei dungeon, impostazioni, ban, dati dei plugin |
| `MONDI_DIR` | `mondi/` | Cartella dei mondi pubblicati |
| `PLUGINS_DIR` | `plugins/` | Cartella dei plugin |

### Giocare dal Meta Quest
Il browser del Quest offre la realtà virtuale solo su pagine **https** o su `localhost`, e il gioco si collega al
WebSocket con lo stesso protocollo della pagina (`wss://` da https). Con il server in `http` sulla rete di casa il gioco
si apre, ma il pulsante **Entra in VR** non compare. Ci sono tre strade:

1. **Server online o tunnel** (la più semplice). Sul server pubblicato (vedi [Pubblicare il server online](#pubblicare-il-server-online))
   l'https c'è già. In casa basta un tunnel verso la porta 3000, poi si apre sul Quest l'indirizzo `https://` che stampa:
   ```sh
   cloudflared tunnel --url http://localhost:3000
   # oppure: ngrok http 3000
   ```
2. **HTTPS dal server, in rete locale.** Crea un certificato per l'indirizzo del PC (quello stampato all'avvio, ad
   esempio `192.168.1.20`) e avvia il server con `TLS_CERT` e `TLS_KEY`:
   ```sh
   # con mkcert (certificato riconosciuto dai browser del PC dove è installata la sua CA)
   mkcert 192.168.1.20 localhost
   TLS_CERT=192.168.1.20+1.pem TLS_KEY=192.168.1.20+1-key.pem node server.js
   # oppure autofirmato con openssl
   openssl req -x509 -newkey rsa:2048 -nodes -days 365 -keyout key.pem -out cert.pem \
     -subj /CN=192.168.1.20 -addext "subjectAltName=IP:192.168.1.20,DNS:localhost"
   TLS_CERT=cert.pem TLS_KEY=key.pem node server.js
   ```
   Sul Quest apri `https://192.168.1.20:3000`: il browser avvisa che il certificato non è attendibile, scegli
   **Avanzate → Procedi**. Una volta accettato, funzionano anche il multigiocatore (`wss`) e la realtà virtuale. Gli altri
   giocatori sulla stessa rete usano lo stesso indirizzo `https`.
3. **Cavo USB con `adb reverse`** (per chi sviluppa, con la modalità sviluppatore del Quest attiva). Il Quest vede la
   porta del PC come se fosse sua, e `localhost` vale come indirizzo sicuro anche in `http`:
   ```sh
   adb reverse tcp:3000 tcp:3000
   ```
   Poi sul Quest apri `http://localhost:3000`.

### Il pannello admin
Si apre su `http://indirizzo:porta/admin` (o `https://` se il server usa `TLS_CERT`/`TLS_KEY`). Ha queste pagine:

| Pagina | Cosa fa |
|---|---|
| **Panoramica** | Stato del server |
| **Giocatori** | Lista dei giocatori, con cura, teletrasporto ed espulsione |
| **Stanze** | Stanze aperte e dungeon |
| **Chat** | Chat e annunci |
| **Classifica** | La classifica |
| **Ban e silenzi** | Ban e silenzi |
| **Impostazioni** | Numero massimo di giocatori, stanze chiuse, PvP, scambi e chat accesi o spenti, messaggio del giorno, moltiplicatori di esperienza e oro, mondi della community |
| **Registro** | Il registro degli eventi |
| **Plugin** | Plugin accesi e spenti, errori, comandi e pagine |
| **Mondi** | Moderazione dei mondi pubblicati |
| **Server** | Memoria, carico e backup dei dati |

---

## Plugin del server

I plugin sono file `.js` nella cartella `plugins/`. Si caricano all'avvio o con **Plugin → Ricarica** nel pannello admin,
e si accendono e spengono senza riavviare. Come scriverne uno è spiegato in [plugins/LEGGIMI.md](plugins/LEGGIMI.md).

| Plugin | Cosa fa |
|---|---|
| **Albo degli eroi** (`albo.js`) | Pagina web con la scheda di ogni eroe e il comando `/albo` |
| **Boss del mondo** (`boss.js`) | Un boss enorme da affrontare tutti insieme, con premi in base al contributo (`/boss`) |
| **Emote e fumetti** (`emote.js`) | Emote con il fumetto sopra la testa (`/saluta`, `/ridi`, `/balla`…) e ruota delle emote col tasto G |
| **Discoteca** (`discoteca.js`) | Una discoteca con DJ, brani da YouTube e SoundCloud, coda, voti e luci (`/discoteca`) |
| **Premio giornaliero** (`giornaliero.js`) | Un premio al giorno, più ricco giorno dopo giorno (`/giornaliero`) |
| **Gruppi d'avventura** (`gruppi.js`) | Gruppi fino a 4 eroi con chat ed esperienza e oro condivisi sui boss (`/gruppo`) |
| **Guardiano** (`guardiano.js`) | Riconosce oro, livelli e oggetti ottenuti con trucchi, con una pagina admin delle prove |
| **Guardie e ladri** (`guardieladri.js`) | Nascondino a squadre in un quartiere (`/guardie`) |
| **Case** (`housing.js`) | Una casa per ogni eroe da arredare, con deposito, pet e il Borgo delle Case (`/casa`) |
| **Ritorno ad Aldoria** (`hub.js`) | `/hub` riporta ad Aldoria da qualunque zona |
| **Mercatino di Aldoria** (`mercato.js`) | Compravendita di oggetti tra giocatori, anche offline (`/mercato`) |
| **Notti di caccia** (`notti.js`) | Eventi notturni con esperienza moltiplicata e gara a punti (`/evento`) |
| **Gara di pesca** (`pesca.js`) | Albo dei record, gare a tempo e annunci dei pesci leggendari |
| **Posta e amici** (`posta.js`) | Messaggi per chi è offline (`/posta`) e avvisi sugli amici (`/amici`) |
| **Il Sindaco di Aldoria** (`sindaco.js`) | Elezione settimanale del sindaco e decreti (`/vota`, `/sindaco`) |
| **Speedrun dei dungeon** (`speedrun.js`) | Cronometro dei dungeon, classifiche, record e sfida della settimana (`/speedrun`) |
| **Stress test** (`stress.js`) | Bot finti che giocano sul server per misurare latenza, memoria ed errori |
| **Taglie del giorno** (`taglie.js`) | Nuove taglie ogni giorno (`/taglie`) |
| **Territori** (`territori.js`) | Le terre di Tomorrow condivise fra gli eroi dello stesso mondo: assedi, saccheggi e cronaca (`/terre`) |
| **Caccia al tesoro** (`tesoro.js`) | Un tesoro nascosto in città con indizi a tappe (`/tesoro`) |
| **Torneo dell'arena** (`torneo.js`) | Tornei a eliminazione diretta nel Colosseo, con tabellone e premi |
| **Teletrasporto** (`tpa.js`) | `/tpa <nome>` per raggiungere un altro eroe, se accetta |
| **Esempio** (`esempio.js`) | Un plugin di prova da cui partire |

> Un plugin è codice che gira sul server con tutti i permessi: installa solo plugin di cui ti fidi.

---

## Pubblicare il server online

### Docker
Il `Dockerfile` crea un'immagine con server, gioco, pannello admin e plugin, partendo da `node:20-alpine`, con un utente
non root e un controllo di salute. I dati persistenti stanno in `/data`.

```sh
docker build -t voxelia .
docker run -d -p 3000:3000 \
  -e ADMIN_PASSWORD='la-tua-password' \
  -v voxelia-data:/data \
  --name voxelia voxelia
```

### Docker Compose
`docker-compose.yml` avvia l'immagine pubblicata su GitHub Container Registry (`ghcr.io/xvxvxvxvvxvxvvxvxv/voxelia`), con il
volume `voxelia-data` per i dati:

```sh
ADMIN_PASSWORD='la-tua-password' docker compose up -d
```

Per l'https direttamente dal container (ad esempio per il Meta Quest in rete locale), metti `cert.pem` e `key.pem` in
una cartella `certs/` e togli i commenti alle righe `TLS_CERT`, `TLS_KEY` e al volume `./certs` in `docker-compose.yml`.
Con `docker run` si aggiunge `-v "$PWD/certs:/certs:ro" -e TLS_CERT=/certs/cert.pem -e TLS_KEY=/certs/key.pem`. Il
controllo di salute segue da solo il protocollo.

L'immagine la pubblica il workflow `.github/workflows/docker.yml` a ogni push su `main`: il nome segue il proprietario del
repository e l'etichetta è la versione del gioco (`GAME_VER`), più `latest`.

### Suga
Il server ufficiale gira su [Suga](https://suga.app):
- il container costruisce l'immagine **direttamente da questo repository** con il `Dockerfile`, a ogni push su `main`;
- un **endpoint HTTPS** punta alla porta **3000** (qui `TLS_CERT`/`TLS_KEY` non servono: l'https lo fa l'endpoint, e
  dal Quest si gioca in VR aprendo direttamente l'indirizzo pubblico);
- un **volume** è montato su `/data`;
- `ADMIN_PASSWORD` è impostata come **variabile sensibile**.

Dopo il push la nuova versione è online in un paio di minuti. Nel registro compare `Voxelia <versione> in ascolto sulla
porta 3000`.

---

## Impostazioni, lingue e salvataggi

- **Impostazioni** divise in 8 categorie:
  - **Generale**: lingua, aspetto e novità;
  - **Audio**: volume, musica ed effetti;
  - **Grafica**: qualità, effetti e cielo;
  - **Prestazioni**: fotogrammi al secondo, V-Sync e rendering;
  - **Animazioni**: scene e inquadrature;
  - **Interfaccia**: HUD, ruota delle azioni, mappa, nomi e minimappa;
  - **Comandi**: movimento, tasti e comandi touch;
  - **Cursore**: stile, colore e grandezza.
- **Lingue**:
  - **Italiano**;
  - **English**, che traduce menu, comandi, impostazioni e la maggior parte dei pulsanti (dialoghi e missioni restano in
    italiano);
  - **Eldoriano**, la lingua antica del regno, che trasforma tutti i testi.
- **Salvataggi**: tutto resta nel `localStorage` del browser. Ci sono la partita, Tomorrow (a parte), le impostazioni, l'aspetto dell'eroe,
  i mondi di Voxelia Studio e i filmati già visti. Il salvataggio si aggiorna da solo, anche chiudendo la pagina.

---

## Struttura del progetto

```
voxelia.html            il gioco completo, generato da build.sh (non si modifica a mano)
server.js               server multigiocatore, pannello admin, plugin e mondi della community
admin.html              interfaccia del pannello admin
build.sh                unisce i sorgenti in voxelia.html
CHANGELOG.md            tutte le modifiche, dalla più recente (finisce anche dentro il gioco)
src/                    i sorgenti del gioco
plugins/                plugin del server (con LEGGIMI.md)
releases/               le build delle versioni pubblicate, dalla 7.4.1 alla 7.37 (voxelia_orig75.html è la 7.5)
docs/                   immagini di questo README
Dockerfile              immagine del server
docker-compose.yml      avvio con Docker Compose
.github/workflows/      pubblicazione dell'immagine su GitHub Container Registry
```

### I sorgenti (`src/`)
`build.sh` mette in fila `src/head.html` e i file `src/[numero]_*.js` in ordine alfabetico (ordinamento `LC_ALL=C`, per
cui `75_tempo.js` viene prima di `7_net.js`). Tutto il codice condivide un unico ambito globale: i file successivi possono
estendere o sostituire le funzioni di quelli precedenti.

| File | Contenuto |
|---|---|
| `head.html` | Pagina, stili, menu e struttura dell'interfaccia |
| `1_core.js` | Utilità, proiezione isometrica, disegno delle scatole voxel, motore audio, versione (`GAME_VER`) |
| `2_data.js` | Modelli voxel, oggetti e rarità, nemici, zone, dungeon, personaggi, missioni, interni |
| `3_world.js` | Generazione del mondo: città, zone aperte, dungeon, interni, porte |
| `4_render.js` | Disegno del mondo e degli arredi, scene, pesca, battaglia navale, mappa, sogni, Dimension, traduzioni, icone degli oggetti |
| `4a_aldoria.js` | Aldoria più grande: edifici nuovi e arredi degli interni |
| `4b_fast.js` | Grafica più veloce: muri e arredi fermi disegnati una volta sola in fogli di sprite |
| `5_game.js` | Eroe, combattimento, bottino, missioni, interazioni, aggiornamento del mondo, salvataggio |
| `6_ui.js` | HUD, finestre (zaino, missioni, negozi, dialoghi, casinò…), impostazioni, novità |
| `75_tempo.js` | Giorno e notte |
| `76_icone.js` | Icone dell'HUD in pixel art |
| `77_scene.js` | Animazioni sceniche: inquadrature, iride, stendardi, oggetti che volano |
| `78_aspetto.js` | Aspetto dell'eroe, modelli dell'equipaggiamento indossato, ritratti |
| `79_hudedit.js` | Editor dell'HUD |
| `7_net.js` | Multigiocatore (WebSocket verso `server.js`) |
| `8_main.js` | Menu, musiche scritte, storia, personaggi e routine della città, castello, battaglie, Voxelia Studio, abilità, ciclo principale e tastiera |
| `8t_touch.js` | Comandi touch per telefoni e tablet |
| `8u_musiche.js` | Le canzoni degli edifici, gli strumenti e le batterie nuove |
| `8v_abominio.js` | Il vero finale: l'Abominio in cinque fasi, l'ombra della Regina Elara, lo scudo di Malakar |
| `8v_sfida.js` | La difficoltà della Modalità Storia: nemici più forti, branco, Campioni, ultima furia dei boss |
| `8w_icone.js` | Icone voxel in tutto il gioco |
| `8x_dev.js` | Pannello sviluppatore |
| `8y_film.js` | Il motore dei filmati: luoghi veri costruiti a parte, attori che camminano lungo le strade, telecamera, sottotitoli |
| `8y_film2.js` | I filmati della storia, della battaglia navale e di Voxelia Dimension, e le scene disegnate apposta |
| `8y_film3.js` | La scena del prologo sotto la città: gli strati della terra, il pozzo, l'Occhio |
| `8z_mondi.js` | Mondi della community: browser, schede e pubblicazione |
| `8za_mondo.js` | Arredi nuovi, il Colosseo vero (fuori e dentro) |
| `8zb_mappa.js` | La mappa della zona in cui ti trovi (tasto M) |
| `8zc_prova.js` | Pannello sviluppatore: prova di tutte le boss fight, senza salvare e senza toccare le statistiche |
| `8zd_biomi.js` | Foresta, deserto e picchi più grandi: la pianta, i luoghi, le raccolte |
| `8zd_biomi2.js` | Come si disegnano i biomi (alberi, rocce, piramide, arredi, edifici), gli interni e i loro personaggi |
| `8ze_ricordo.js` | Il ricordo del Moreau: Aldoria Vecchia intatta, prima della nebbia (filmato flashback) |
| `8zf_xr.js` | Realtà virtuale (WebXR) per Meta Quest: schermo sospeso, controller, levette |
| `8zg_xrui.js` | Realtà virtuale: l'interfaccia HTML del gioco (HUD, finestre, dialoghi) fotografata e mostrata nel visore |
| `8zh_xr3d.js` | Realtà virtuale: il mondo in 3D sul tavolo (diorama), con gli stessi modelli del gioco |
| `8zi_xrfp.js` | Realtà virtuale in prima persona: il mondo a grandezza naturale, attacchi con il movimento dei controller, pannelli e menu fluttuanti |
| `8zj_citta.js` | «Le vie di Aldoria», il nuovo tema della città, e le sezioni dinamiche del motore dei brani scritti |
| `8zk_unici.js` | Oggetti unici: generatore dal seme, poteri, scheda, provenienza; scambi di unici, reperti e pozioni |
| `8zl_aperto.js` | Tomorrow, la base: menu, salvataggio a parte, Bacheca dei Contratti, tappe dei contratti, bersagli, assedi, reputazione |
| `8zm_3d.js` | La vista 3D: registra i disegni del gioco e li rende in WebGL 2 con luce, ombre, materiali, cielo e l'orizzonte oltre i confini, in stile voxel o liscio; telecamera, clic e movimento in 3D |
| `8zn_pausa.js` | Il pulsante delle impostazioni, il menu di pausa (anche con Esc) e la sezione «Vista 3D» delle impostazioni |
| `8zo_tomorrow.js` | Tomorrow, il mondo: regioni generate senza fine, biomi, villaggi, dungeon e specie generati, contratti nuovi, mappa del mondo, orizzonte 3D |
| `8zp_vivo.js` | Tomorrow vivo: città con mura e piazza, case con interni, abitanti, animali, viandanti, santuari; il campo, le gemme del teletrasporto e le battaglie con gli alleati |
| `8zq_mappa.js` | Tomorrow: la mappa del mondo interattiva e le nuove finestre dei contratti (bacheca, pannello J, resoconto) |
| `8zr_caricamento.js` | Le schermate di caricamento di ogni modalità e il filmato del viaggio con la gemma |
| `8zs_modelli.js` | I modelli nuovi (con scheletro e animazioni) dei boss e degli animali rimasti alla grafica vecchia: drago, sfinge, piovra, spettro, signore della fiamma, cavalcalupi, nido di mitragliatrice, animali da cortile e cavalli |
| `8zt_mondo.js` | Tomorrow: le regioni generate e ricordate, il campo che resta dove l'hai montato, il pavimento a blocchi, i borghi (la finestra senza passaggi della 7.18 è spenta dalla 7.19.1) |
| `8zu_combattimento.js` | Il combattimento nuovo: catene di colpi, colpo perfetto, colpi caricati e mosse proprie di ogni arma, effetti sui nemici, pose dell'eroe |
| `8zv_domare.js` | Domare i mostri: sigilli, cattura, compagni in campo con la loro mossa speciale, livelli ed evoluzioni, la stalla, il bestiario |
| `8zw_regno.js` | Tomorrow: conquista delle regioni, insediamento con edifici e tesoro, fazioni con sedi, emissari e stemmi, la tua fazione, le terre sulla mappa |
| `8zx_guerre.js` | Le guerre: assalti delle fazioni alle tue terre, assedi e saccheggi fra giocatori con il plugin Territori, la cronaca |
| `8zy_tw_film.js` | Il filmato del reset dell'universo all'inizio di Tomorrow, le sue musiche e i cimeli di Aldoria |
| `8zz_borghi.js` | Villaggi e città di Tomorrow con strade, lotti, piazza, mercato, cortili e parco; la gente che si muove con le sue abitudini |
| `8zza_prologo.js` | Il nuovo prologo della Storia: le scene nuove (il mare, la fondazione, le sei terre, Malakar, la Corona in frantumi, l'alba) e le sue tre musiche |
| `8zzb_editborgo.js` | L'editor dell'insediamento: edifici, case, strade, arredi, fontane, banco del mercante e stendardo; la gente che va in giro nel borgo |
| `8zzc_gestione.js` | La gestione del borgo: risorse da raccogliere e costi degli edifici, Cisterna, Fattoria, Segheria e Cava, statistiche, cibo, acqua e abitanti che vanno e vengono |
| `8zzd_editor2.js` | L'editor del borgo completo: tutti i pavimenti, i muri e gli arredi del gioco, edifici su misura, costi in risorse |
| `8zze_esercito.js` | La Caserma, i soldati, la potenza dell'esercito, le battaglie risolte con le probabilità e i soldati in campo con te |
| `8zzf_miniere.js` | Le miniere del borgo: la zona sotto terra, lo scavo a mano, i minerali e le vene, i reperti storici, la produzione dei minatori |
| `8zzg_azione.js` | Il combattimento d'azione: clic verso il cursore, stamina, capriola, corsa e blocco del bersaglio |
| `8zzh_casa.js` | 7.33: la tua casa con il deposito, gli interni su misura (modelli, colori, materiali, arredi, nome, musica) e le mura del borgo (tipo, colore, porte, torri) |
| `8zzi_citta.js` | 7.34: più città (fino a 8) ognuna con le sue statistiche, la capitale da cui si riparte, la gemma della tua città al mercato, i materiali a prezzi del giorno nelle altre città |
| `8zzj_legna.js` | 7.35: gli alberi si abbattono (5 colpi, 2 legna, ricrescono), il legno in quantità, la città fino al livello 15 su tutta la regione |
| `8zzk_viaggio.js` | 7.36: la Pietra del viaggio con tutti i luoghi che hanno una gemma del teletrasporto; ogni gemma si compra una volta sola |
| `8zzl_grafica.js` | 7.37: l'acqua su un foglio a parte, la risoluzione dinamica, le opzioni grafiche nuove e l'upscaling con nitidezza in stile FSR per la vista 3D |
| `9_changelog.js` | Generato da `build.sh` a partire da `CHANGELOG.md`: non si modifica a mano |

---

## Sviluppo

### Costruire il gioco
```sh
sh build.sh        # rigenera src/9_changelog.js e voxelia.html
```
Poi si apre `voxelia.html` nel browser, oppure si avvia `node server.js` per provarlo con il server.

### Pubblicare una versione nuova
1. Aggiorna il numero di versione in tre posti:
   - `GAME_VER` in `src/1_core.js`;
   - `<title>` e `<sup id="ver">` in `src/head.html`;
   - `VER` e il commento iniziale in `server.js`.
2. Scrivi la voce in cima a `CHANGELOG.md`, in italiano, dalla più recente.
3. Esegui `sh build.sh` e copia la build in `releases/voxelia_v<versione>.html`.
4. Fai commit e push su `main`: Suga ricostruisce e pubblica da solo.

### Convenzioni
- Nessuna dipendenza esterna: niente framework né librerie, solo JavaScript, Canvas 2D e Web Audio.
- Testi, commenti e changelog in italiano.
- I salvataggi devono restare compatibili tra una versione e l'altra.
- Le versioni seguono lo schema `7.9` → `7.9.1` → … → `7.10` → `7.11`: il secondo numero per gli aggiornamenti con novità, il terzo
  per le correzioni.

---

Voxelia è sviluppato da **TeamVoxelia**.
