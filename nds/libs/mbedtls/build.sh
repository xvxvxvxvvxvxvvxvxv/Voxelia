#!/bin/sh
# Compila mbedtls 2.28 per l'ARM9 del DS (usato da docker devkitpro/devkitarm). src/ e include/ sono di mbedtls v2.28.8.
set -e
cd "$(dirname "$0")"
CC=$DEVKITARM/bin/arm-none-eabi-gcc; AR=$DEVKITARM/bin/arm-none-eabi-ar
FL="-march=armv5te -mtune=arm946e-s -O2 -ffunction-sections -fdata-sections -Iinclude -I. -DMBEDTLS_CONFIG_FILE=\"ds_config.h\""
rm -rf obj && mkdir obj
for f in src/*.c; do
  n=$(basename $f .c)
  # aritmetica dei grandi numeri e curve in modalità ARM (più veloce), il resto in Thumb (più piccolo)
  case $n in bignum|ecp|ecp_curves|ecdh|ecdsa|aes|gcm|chacha20|poly1305|sha256|sha512|sha1) M=-marm;; *) M=-mthumb;; esac
  $CC $FL $M -c $f -o obj/$n.o
done
mkdir -p lib && rm -f lib/libmbedtls_ds.a && $AR rcs lib/libmbedtls_ds.a obj/*.o && rm -rf obj
ls -la lib/libmbedtls_ds.a
