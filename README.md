# Voxelia – i port per console

Questo branch raccoglie i **port per console** di *Voxelia – Il Regno Perduto*, il gioco di ruolo voxel isometrico
per browser. Ogni port è un programma nativo in C, con la sua cartella, il suo README e il suo CHANGELOG, e gioca la
**Modalità Storia**: Aldoria e i suoi quartieri, i dungeon, le missioni, Thalassa. In rete tutti i port parlano con
lo stesso server del browser, quindi chi gioca da una console e chi gioca dal browser con lo stesso codice stanza è
nello stesso mondo.

Il gioco per browser, il server e i plugin aggiornati stanno nel branch `main`.

![Aldoria sulla PS Vita](psvita/screenshots/aldoria.jpg)

## I port

| Console | Versione | Contenuti | Cartella | Scarica | Branch a parte |
|---|---|---|---|---|---|
| **Nintendo 3DS** / New 3DS / 2DS | 1.7 | Voxelia 8.5 | [`3ds/`](3ds) | [`voxelia_3ds_v1.7.zip`](releases/voxelia_3ds_v1.7.zip) | [`3ds`](../../tree/3ds) |
| **Nintendo DS** / DS Lite / DSi | 1.3 | Voxelia 8.5 | [`nds/`](nds) | [`voxelia_nds_v1.3.zip`](releases/voxelia_nds_v1.3.zip) | [`nds`](../../tree/nds) |
| **PlayStation Vita** / PS TV | 1.0.2 | Voxelia 8.5 | [`psvita/`](psvita) | [`voxelia_psvita_v1.0.2.zip`](releases/voxelia_psvita_v1.0.2.zip) | — |
| **PlayStation 4** | 1.0 | Voxelia 8.5 | [`ps4/`](ps4) | [`voxelia_ps4_v1.0.zip`](releases/voxelia_ps4_v1.0.zip) | — |
| **PlayStation Portable** | — | Voxelia 7.50 | [`psp/`](psp) | [`voxelia_v7.50_psp.zip`](releases/voxelia_v7.50_psp.zip) | — |

Le versioni precedenti di ogni port sono in [`releases/`](releases), accanto alle build complete del gioco per browser
(`voxelia_v<versione>.html`, descritte in [`releases/LEGGIMI.md`](releases/LEGGIMI.md)).

## Come sono fatti

- **3DS** è il port di partenza: i dati (mappe, voxel, modelli animati, personaggi, missioni, musiche) non sono
  riscritti a mano, ma esportati dal `voxelia.html` del browser con `3ds/tools/export.js`. Ha le meccaniche della
  Storia fino alla 8.5: nemici condivisi in rete, cavalli, animali, compagni domati, elementi, scelte e titoli,
  Thalassa, boss a fasi, mestieri, Torre della Corona, carte, la difficoltà della 8.3.
- **DS** usa lo stesso codice di gioco del 3DS e la stessa rete; grafica, testo, audio e comandi sono riscritti per
  il DS (mondo a blocchi, personaggi come sprite). I dati si ricavano da quelli del 3DS con `nds/tools/dsassets.py`.
- **PS Vita** è costruito sul motore del port 3DS, su un solo schermo a 960x544 con vitaGL.
- **PS4** è costruito sul port PS Vita, a 1920x1080 con la toolchain OpenOrbis.
- **PSP** è un port a parte, con il suo motore e le zone generate da sé: è fermo ai contenuti della 7.50.

## Installazione in breve

I dettagli, i comandi e i limiti di ogni console sono nel README della sua cartella.

| Console | Cosa serve | Come si installa |
|---|---|---|
| 3DS | Homebrew Launcher (custom firmware, per esempio Luma3DS) | `voxelia.3dsx` in `sdmc:/3ds/`; per l'audio serve `sdmc:/3ds/dspfirm.cdc` |
| DS | flashcart o DSi con TWiLight Menu++ | `voxelia.nds` sulla scheda; in rete il DS e il DS Lite vanno solo su reti aperte o WEP |
| PS Vita | HENkaku/Ensō, VitaShell e `ur0:data/libshacccg.suprx` | `voxelia.vpk` con VitaShell |
| PS4 | firmware con homebrew (per esempio GoldHEN) e Debug Settings | `voxelia.pkg` con il Package Installer |
| PSP | firmware personalizzato | `EBOOT.PBP` in `PSP/GAME/VOXELIA/` (vedi `psp/LEGGIMI.txt`) |

## Multigiocatore

Dal menu **Multigiocatore** di ogni port si sceglie il codice stanza e il server: quello ufficiale è già impostato.
I port 3DS, DS, PS Vita e PS4 usano il protocollo del browser (WebSocket con TLS) e capiscono i plugin del server
della Modalità Storia: come funzionano è spiegato nei `PLUGIN.md` delle cartelle.

## Compilare

Ogni cartella ha il suo `Makefile` (o `CMakeLists.txt`) e le istruzioni nel suo README:

| Port | Toolchain |
|---|---|
| 3DS, DS | devkitPro (devkitARM con `3ds-dev` o `nds-dev`), anche con Docker: `docker run --rm -v "$PWD":/p -w /p devkitpro/devkitarm make` |
| PS Vita | VitaSDK con vitaGL (`psvita/build.sh`) |
| PS4 | OpenOrbis Toolchain (`ps4/build.sh`) |
| PSP | PSPSDK di pspdev (`cd psp && make`) |

## Gli altri file di questo branch

Nella radice c'è anche una copia del gioco per browser e del server alla **7.50** (`voxelia.html`, `src/`,
`server.js`, `plugins/`, `admin.html`, `Dockerfile`), con il suo [CHANGELOG.md](CHANGELOG.md): serve per provare i
port in rete con un server in locale (`node server.js`). Per giocare dal browser o mettere online un server, usa la
versione aggiornata del branch `main`.
