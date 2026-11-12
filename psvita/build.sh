#!/bin/sh
# Voxelia PS Vita - compila voxelia_psvita_v<versione>.vpk con l'immagine Docker ufficiale di VitaSDK (niente da installare).
# Uso: ./build.sh            -> build/voxelia_psvita_v<versione>.vpk (la versione è PORT_VER in source/voxelia.h)
set -e
cd "$(dirname "$0")"
docker run --rm -v "$PWD":/src -w /src vitasdk/vitasdk:latest sh -c \
  'mkdir -p build && cd build && cmake .. -DCMAKE_BUILD_TYPE=Release > /dev/null && make -j4'
V=$(sed -n 's/^#define PORT_VER "\(.*\)".*/\1/p' source/voxelia.h)
ls -la "build/voxelia_psvita_v$V.vpk"
