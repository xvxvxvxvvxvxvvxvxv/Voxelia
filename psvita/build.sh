#!/bin/sh
# Voxelia PS Vita - compila voxelia.vpk con l'immagine Docker ufficiale di VitaSDK (niente da installare).
# Uso: ./build.sh            -> build/voxelia.vpk
set -e
cd "$(dirname "$0")"
docker run --rm -v "$PWD":/src -w /src vitasdk/vitasdk:latest sh -c \
  'mkdir -p build && cd build && cmake .. -DCMAKE_BUILD_TYPE=Release > /dev/null && make -j4'
ls -la build/voxelia.vpk
