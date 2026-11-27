#!/bin/sh
# Installs Voxelia for the current user (no root needed).
# Run again to update. Uninstall: sh install.sh --uninstall
set -e
HERE=$(dirname "$(readlink -f "$0")")
DEST="$HOME/.local/share/voxelia"
APPS="$HOME/.local/share/applications"
BINDIR="$HOME/.local/bin"

if [ "$1" = "--uninstall" ]; then
  rm -rf "$DEST" "$APPS/voxelia.desktop" "$BINDIR/voxelia"
  echo "Voxelia has been removed."
  exit 0
fi

mkdir -p "$DEST" "$APPS" "$BINDIR"
cp "$HERE/voxelia" "$HERE/voxelia-bin" "$HERE/icon.png" "$DEST/"
chmod +x "$DEST/voxelia" "$DEST/voxelia-bin"
ln -sf "$DEST/voxelia" "$BINDIR/voxelia"

cat > "$APPS/voxelia.desktop" <<DESKTOP
[Desktop Entry]
Type=Application
Name=Voxelia
GenericName=Adventure game
Comment=Voxelia – The Lost Kingdom
Exec="$DEST/voxelia" %U
Icon=$DEST/icon.png
Terminal=false
Categories=Game;AdventureGame;
StartupWMClass=voxelia-bin
PrefersNonDefaultGPU=true
X-KDE-RunOnDiscreteGpu=true
DESKTOP
chmod +x "$APPS/voxelia.desktop"
command -v update-desktop-database >/dev/null 2>&1 && update-desktop-database "$APPS" >/dev/null 2>&1 || true

echo "Voxelia is installed! Find it in your app menu, or run: voxelia"
