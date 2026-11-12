/* Voxelia PS4 - configurazione di mbedtls 2.28 per la console (si aggiunge a quella di serie).
 * La connessione TCP la fa il gioco con sceNet (plat_ps4.c), l'entropia arriva da sceRandom (net.c): niente
 * socket, orologi o /dev/urandom dentro mbedtls. Il certificato del server non viene verificato (come sulla Vita),
 * quindi non serve l'ora del sistema. */
#undef MBEDTLS_NET_C
#undef MBEDTLS_TIMING_C
#undef MBEDTLS_HAVE_TIME_DATE
#undef MBEDTLS_FS_IO
#undef MBEDTLS_PSA_ITS_FILE_C
#undef MBEDTLS_PSA_CRYPTO_STORAGE_C
#undef MBEDTLS_PSA_CRYPTO_C
#undef MBEDTLS_SELF_TEST
#undef MBEDTLS_AESNI_C
#undef MBEDTLS_PADLOCK_C
#define MBEDTLS_NO_PLATFORM_ENTROPY
#define MBEDTLS_NO_UDBL_DIVISION   /* niente divisioni a 128 bit (__udivti3 non c'è nella libc di OpenOrbis) */
