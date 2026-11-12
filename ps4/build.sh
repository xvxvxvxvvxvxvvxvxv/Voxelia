#!/bin/sh
# Voxelia PS4 - compila voxelia.pkg con l'immagine Docker ufficiale di OpenOrbis (niente da installare).
# Uso: ./build.sh            -> voxelia.pkg (e build/voxelia.elf, build/eboot.bin)
# L'immagine ha clang 10 e la toolchain v0.5.1; servono anche python3 e llvm-ar, che si installano al volo.
set -e
cd "$(dirname "$0")"
docker run --rm -v "$PWD":/src -w /src -e DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=1 openorbisofficial/toolchain:latest sh -c \
  'command -v python3 >/dev/null || (apt-get update -qq && apt-get install -y -qq python3 >/dev/null); make -j4'
ls -la voxelia.pkg
