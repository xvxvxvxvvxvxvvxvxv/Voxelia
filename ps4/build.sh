#!/bin/sh
# Voxelia PS4 - compila voxelia.pkg con l'immagine Docker ufficiale di OpenOrbis (niente da installare).
# Uso: ./build.sh            -> voxelia.pkg (e build/voxelia.elf, build/eboot.bin)
# L'immagine ha clang 10, ld.lld e la toolchain v0.5.1. Il container gira con il tuo utente, così i file
# che crea in build/ sono tuoi.
set -e
cd "$(dirname "$0")"
docker run --rm -u "$(id -u):$(id -g)" -e HOME=/tmp -e DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=1 \
  -v "$PWD":/src -w /src openorbisofficial/toolchain:latest make -j4
ls -la voxelia.pkg
