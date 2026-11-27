VOXELIA – THE LOST KINGDOM (Linux)

Play right away:     ./voxelia
Install to your menu: sh install.sh
Uninstall:           sh install.sh --uninstall

Needs WebKitGTK (already there on most desktops). If the window doesn't open:
  Debian/Ubuntu:  sudo apt install libwebkit2gtk-4.1-0
  Fedora:         sudo dnf install webkit2gtk4.1
  Arch:           sudo pacman -S webkit2gtk-4.1

Graphics card: on PCs with two GPUs Voxelia uses the dedicated one and falls
back to the integrated one if there isn't a dedicated GPU. To keep it on the
integrated GPU:  VOXELIA_GPU=integrated ./voxelia
