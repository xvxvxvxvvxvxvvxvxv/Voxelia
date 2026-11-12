# Voxelia PS4 - build per la console con la toolchain OpenOrbis (https://github.com/OpenOrbis/OpenOrbis-PS4-Toolchain).
#   make                 -> build/voxelia.elf, build/eboot.bin e voxelia.pkg (servono create-eboot e PkgTool.Core)
#   make elf             -> solo build/voxelia.elf (basta clang + ld.lld e la cartella della toolchain)
# Oppure, senza installare niente, con Docker:  ./build.sh
# Serve OO_PS4_TOOLCHAIN (la cartella della toolchain). Il compilatore è il clang del sistema (10 o più recente).
TOOLCHAIN ?= $(OO_PS4_TOOLCHAIN)
ifeq ($(TOOLCHAIN),)
$(error Imposta OO_PS4_TOOLCHAIN, per esempio: export OO_PS4_TOOLCHAIN=/opt/OpenOrbis/PS4Toolchain)
endif
CC := $(shell command -v clang-18 || command -v clang)
LD := $(shell command -v ld.lld-18 || command -v ld.lld || command -v ld.lld-10)
AR := $(shell command -v llvm-ar-18 || command -v llvm-ar || command -v llvm-ar-10 || command -v ar)

TITLE      := Voxelia
TITLE_ID   := VXLA00001
CONTENT_ID := IV0000-VXLA00001_00-VOXELIAPS4000001
VERSION    := 01.00

B := build
MBED := mbedtls-2.28.8
TARGET_FLAGS := --target=x86_64-pc-freebsd12-elf -fPIC -funwind-tables -isysroot $(TOOLCHAIN) -isystem $(TOOLCHAIN)/include
CFLAGS := $(TARGET_FLAGS) -D__PS4__ -O2 -ffast-math -march=btver2 -Wall -Wno-unused-function -Wno-misleading-indentation \
	-Wno-unknown-warning-option -Wno-unused-but-set-variable -Wno-format-truncation \
	-I$(B)/$(MBED)/include -DMBEDTLS_USER_CONFIG_FILE='"$(CURDIR)/third_party/mbedtls_ps4.h"'
SRC := $(filter-out source/plat_sdl.c,$(wildcard source/*.c))
OBJ := $(SRC:source/%.c=$(B)/obj/%.o)
LIBS := -lc -lkernel -lSceVideoOut -lSceUserService -lSceSystemService -lScePad -lSceAudioOut -lSceNet -lSceRandom -lSceSysmodule

all: voxelia.pkg
elf: $(B)/voxelia.elf

# mbedtls dalle sorgenti in third_party (licenza Apache 2.0)
$(B)/$(MBED)/.ok: third_party/$(MBED)-lib.tar.gz
	@mkdir -p $(B)
	tar xzf $< -C $(B)
	touch $@
$(B)/libmbed.a: $(B)/$(MBED)/.ok third_party/mbedtls_ps4.h
	@mkdir -p $(B)/mbedobj
	for f in $(B)/$(MBED)/library/*.c; do $(CC) $(CFLAGS) -w -c $$f -o $(B)/mbedobj/$$(basename $$f .c).o || exit 1; done
	rm -f $@; $(AR) rcs $@ $(B)/mbedobj/*.o

$(B)/obj/%.o: source/%.c source/*.h $(B)/$(MBED)/.ok
	@mkdir -p $(B)/obj
	$(CC) $(CFLAGS) -c $< -o $@

$(B)/voxelia.elf: $(OBJ) $(B)/libmbed.a
	$(LD) -m elf_x86_64 -pie --script $(TOOLCHAIN)/link.x --eh-frame-hdr -L$(TOOLCHAIN)/lib -L$(B) \
		$(TOOLCHAIN)/lib/crt1.o $(OBJ) -lmbed $(LIBS) -o $@

# eboot.bin (fself) e il pacchetto con la toolchain di OpenOrbis
$(B)/eboot.bin: $(B)/voxelia.elf
	cd $(B) && $(TOOLCHAIN)/bin/linux/create-eboot -in=voxelia.elf -out=voxelia.oelf --paid 0x3800000000000011
	test -f $@   # create-eboot scrive eboot.bin accanto all'ELF (nella cartella in cui gira)

$(B)/pkg/sce_sys/param.sfo: Makefile
	@mkdir -p $(B)/pkg/sce_sys
	rm -f $@
	$(TOOLCHAIN)/bin/linux/PkgTool.Core sfo_new $@
	$(TOOLCHAIN)/bin/linux/PkgTool.Core sfo_setentry $@ APP_TYPE --type Integer --maxsize 4 --value 1
	$(TOOLCHAIN)/bin/linux/PkgTool.Core sfo_setentry $@ APP_VER --type Utf8 --maxsize 8 --value '$(VERSION)'
	$(TOOLCHAIN)/bin/linux/PkgTool.Core sfo_setentry $@ ATTRIBUTE --type Integer --maxsize 4 --value 0
	$(TOOLCHAIN)/bin/linux/PkgTool.Core sfo_setentry $@ CATEGORY --type Utf8 --maxsize 4 --value 'gd'
	$(TOOLCHAIN)/bin/linux/PkgTool.Core sfo_setentry $@ CONTENT_ID --type Utf8 --maxsize 48 --value '$(CONTENT_ID)'
	$(TOOLCHAIN)/bin/linux/PkgTool.Core sfo_setentry $@ DOWNLOAD_DATA_SIZE --type Integer --maxsize 4 --value 0
	$(TOOLCHAIN)/bin/linux/PkgTool.Core sfo_setentry $@ SYSTEM_VER --type Integer --maxsize 4 --value 0
	$(TOOLCHAIN)/bin/linux/PkgTool.Core sfo_setentry $@ TITLE --type Utf8 --maxsize 128 --value '$(TITLE)'
	$(TOOLCHAIN)/bin/linux/PkgTool.Core sfo_setentry $@ TITLE_ID --type Utf8 --maxsize 12 --value '$(TITLE_ID)'
	$(TOOLCHAIN)/bin/linux/PkgTool.Core sfo_setentry $@ VERSION --type Utf8 --maxsize 8 --value '$(VERSION)'

voxelia.pkg: $(B)/eboot.bin $(B)/pkg/sce_sys/param.sfo tools/mkgp4.sh $(wildcard data/*) $(wildcard sce_sys/*)
	rm -rf $(B)/pkg/data && mkdir -p $(B)/pkg/data $(B)/pkg/sce_sys
	cp $(B)/eboot.bin $(B)/pkg/eboot.bin
	cp data/* $(B)/pkg/data/
	cp sce_sys/icon0.png sce_sys/pic0.png sce_sys/pic1.png $(B)/pkg/sce_sys/
	sh tools/mkgp4.sh $(B)/pkg $(CONTENT_ID) > $(B)/voxelia.gp4 && mv $(B)/voxelia.gp4 $(B)/pkg/
	cd $(B)/pkg && $(TOOLCHAIN)/bin/linux/PkgTool.Core pkg_build voxelia.gp4 .
	mv $(B)/pkg/$(CONTENT_ID).pkg $@
	ls -la $@

clean:
	rm -rf $(B) voxelia.pkg

.PHONY: all elf clean
