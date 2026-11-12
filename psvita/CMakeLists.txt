# Voxelia PS Vita - build per la console con VitaSDK (https://vitasdk.org).
#   mkdir build && cd build && cmake .. && make      ->  voxelia_psvita_v<versione>.vpk
# Oppure, senza installare niente, con Docker:  ./build.sh
cmake_minimum_required(VERSION 3.16)

if(NOT DEFINED CMAKE_TOOLCHAIN_FILE)
  if(DEFINED ENV{VITASDK})
    set(CMAKE_TOOLCHAIN_FILE "$ENV{VITASDK}/share/vita.toolchain.cmake" CACHE PATH "toolchain file")
  else()
    message(FATAL_ERROR "Imposta VITASDK nell'ambiente (export VITASDK=/usr/local/vitasdk)")
  endif()
endif()

project(voxelia C)
include("${VITASDK}/share/vita.cmake" REQUIRED)

# la versione del port è una sola, in source/voxelia.h (PORT_VER): da lì il nome del pacchetto
file(STRINGS ${CMAKE_SOURCE_DIR}/source/voxelia.h PORT_VER_LINE REGEX "^#define PORT_VER ")
string(REGEX REPLACE ".*\"([0-9.]+)\".*" "\\1" PORT_VER "${PORT_VER_LINE}")
set(VPK_NAME "voxelia_psvita_v${PORT_VER}.vpk")
message(STATUS "Voxelia PS Vita ${PORT_VER} -> ${VPK_NAME}")

set(VITA_APP_NAME "Voxelia")
set(VITA_TITLEID  "VXLA00001")
set(VITA_VERSION  "01.05")
set(VITA_MKSFOEX_FLAGS "${VITA_MKSFOEX_FLAGS} -d ATTRIBUTE2=12")   # memoria estesa (+ 109 MB) per le zone e la GPU

set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -O2 -g -Wall -Wno-unused-function -Wno-misleading-indentation -Wno-format-truncation -Wno-stringop-truncation -Wno-unused-result -ffast-math -mcpu=cortex-a9 -mfpu=neon")

file(GLOB SRC source/*.c)
add_executable(voxelia ${SRC})

target_link_libraries(voxelia
  vitaGL vitashark SceShaccCgExt mathneon taihen_stub SceShaccCg_stub SceKernelDmacMgr_stub
  mbedtls mbedx509 mbedcrypto
  SceLibKernel_stub SceAppMgr_stub SceAppUtil_stub SceCommonDialog_stub SceGxm_stub SceDisplay_stub
  SceSysmodule_stub SceCtrl_stub SceTouch_stub SceAudio_stub ScePower_stub SceNet_stub SceNetCtl_stub
  SceIofilemgr_stub SceRtc_stub
  pthread m c stdc++
)

vita_create_self(eboot.bin voxelia UNSAFE)

# tutti i dati del gioco (zone, modelli, tabelle, musiche, carattere) dentro il VPK, in app0:data/
file(GLOB DATA_FILES RELATIVE ${CMAKE_SOURCE_DIR} ${CMAKE_SOURCE_DIR}/data/*)
set(DATA_ARGS "")
foreach(f ${DATA_FILES})
  list(APPEND DATA_ARGS FILE ${CMAKE_SOURCE_DIR}/${f} ${f})
endforeach()

vita_create_vpk(${VPK_NAME} ${VITA_TITLEID} eboot.bin
  VERSION ${VITA_VERSION}
  NAME ${VITA_APP_NAME}
  FILE ${CMAKE_SOURCE_DIR}/sce_sys/icon0.png sce_sys/icon0.png
  FILE ${CMAKE_SOURCE_DIR}/sce_sys/pic0.png sce_sys/pic0.png
  FILE ${CMAKE_SOURCE_DIR}/sce_sys/livearea/contents/bg.png sce_sys/livearea/contents/bg.png
  FILE ${CMAKE_SOURCE_DIR}/sce_sys/livearea/contents/startup.png sce_sys/livearea/contents/startup.png
  FILE ${CMAKE_SOURCE_DIR}/sce_sys/livearea/contents/template.xml sce_sys/livearea/contents/template.xml
  ${DATA_ARGS}
)
