# Client desktop di Voxelia

*[Read in English](README.md)*

Una piccola app [Neutralinojs](https://neutralino.js.org) che apre Voxelia in una finestra tutta sua, collegata al
server online. Mostra una schermata di caricamento mentre il server si sveglia, riprova da solo se la connessione cade
e supporta F11 per lo schermo intero. Il client è in inglese.

| File | Sistema |
|---|---|
| `Voxelia.exe` | Windows 10/11 (usa Microsoft Edge WebView2, già incluso in Windows) |
| `Voxelia-linux-x64.tar.gz` | Linux x64 (serve WebKitGTK 4.1) |

## Scheda video

Il client preferisce la **GPU dedicata** e ripiega su quella integrata quando non c'è.

- **Windows**: WebView2 parte con `--force_high_performance_gpu` (`webviewArgs` in `neutralino.config.json`).
- **Linux**: il launcher `voxelia` cerca due GPU. Con il driver NVIDIA attiva il PRIME render offload, altrimenti
  imposta `DRI_PRIME=1` (Mesa: AMD, Intel, nouveau). La voce di menu creata da `install.sh` ha anche
  `PrefersNonDefaultGPU=true`. `VOXELIA_GPU=integrated ./voxelia` resta sulla GPU integrata, `VOXELIA_GPU=dedicated`
  forza il passaggio.

## Un altro server

`Voxelia.exe --server=https://mio-server.example/` (oppure `./voxelia --server=...`) apre un altro server Voxelia.

## Compilare

Servono Node.js, `curl`, `unzip` e `tar`:

```sh
sh build.sh
```

Scarica Neutralinojs 6.5.0 e gli strumenti di build, poi scrive in `dist/release/`:

- `Voxelia.exe`, con icona e informazioni di versione;
- `Voxelia-linux-x64/` e `Voxelia-linux-x64.tar.gz` (launcher `voxelia`, `voxelia-bin`, `icon.png`, `install.sh`,
  `README.txt`).

La versione è il campo `version` di `neutralino.config.json`.
