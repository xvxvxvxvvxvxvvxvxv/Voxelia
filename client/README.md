# Voxelia desktop client

*[Leggi in italiano](README.it.md)*

A small [Neutralinojs](https://neutralino.js.org) app that opens Voxelia in its own window, connected to the online
server. It shows a loading screen while the server wakes up, retries by itself if the connection drops, and supports
F11 for fullscreen.

| File | System |
|---|---|
| `Voxelia.exe` | Windows 10/11 (uses Microsoft Edge WebView2, already part of Windows) |
| `Voxelia-linux-x64.tar.gz` | Linux x64 (needs WebKitGTK 4.1) |

## Graphics card

The client prefers the **dedicated GPU** and falls back to the integrated one when there isn't one.

- **Windows**: WebView2 is started with `--force_high_performance_gpu` (`webviewArgs` in `neutralino.config.json`).
- **Linux**: the `voxelia` launcher looks for two GPUs. With the NVIDIA driver it turns on PRIME render offload,
  otherwise it sets `DRI_PRIME=1` (Mesa: AMD, Intel, nouveau). The menu entry made by `install.sh` also has
  `PrefersNonDefaultGPU=true`. `VOXELIA_GPU=integrated ./voxelia` keeps the integrated GPU, and `VOXELIA_GPU=dedicated`
  forces the switch.

## Another server

`Voxelia.exe --server=https://my-server.example/` (or `./voxelia --server=...`) opens a different Voxelia server.

## Building

Needs Node.js, `curl`, `unzip` and `tar`:

```sh
sh build.sh
```

It downloads Neutralinojs 6.5.0 and the build tools, then writes to `dist/release/`:

- `Voxelia.exe`, with the icon and version info set;
- `Voxelia-linux-x64/` and `Voxelia-linux-x64.tar.gz` (`voxelia` launcher, `voxelia-bin`, `icon.png`, `install.sh`,
  `README.txt`).

The version is the `version` field in `neutralino.config.json`.

| Path | What it is |
|---|---|
| `resources/index.html`, `launcher.js`, `screen.css` | the connection screen |
| `resources/cover.js` | injected into the game page: loading cover and F11 |
| `linux/` | Linux launcher with GPU selection, installer and readme |
| `tools/set-exe-icon.js` | puts the icon and version info into the `.exe` |
| `icon.ico` | Windows icon |
