# Voxelia 7.9.3: server di gioco + pannello admin in un container.
# Nessuna dipendenza npm: serve solo Node.js 16+.
FROM node:20-alpine

ENV NODE_ENV=production \
    PORT=3000 \
    DATA_FILE=/data/voxelia-data.json \
    MONDI_DIR=/data/mondi \
    PLUGINS_DIR=/data/plugins

WORKDIR /app
COPY server.js admin.html voxelia.html ./

# I dati persistenti (classifica, dungeon, ban, mondi, plugin) stanno in /data: montarlo come volume.
RUN mkdir -p /data && chown -R node:node /data /app
USER node

VOLUME ["/data"]
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:${PORT}/ >/dev/null || exit 1

# Imposta ADMIN_PASSWORD a runtime (non nel Dockerfile) per evitare di salvare segreti nell'immagine.
CMD ["node", "server.js"]
