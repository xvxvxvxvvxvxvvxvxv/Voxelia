// Premio giornaliero: /giornaliero una volta al giorno, con premi che crescono nei giorni consecutivi.
// I premi si cambiano in giornaliero.config.json (uno per giorno della serie; dopo l'ultimo si ricomincia dal primo).
module.exports = {
  name: 'Premio giornaliero',
  version: '1.0',
  author: 'Voxelia',
  description: 'Un premio al giorno con /giornaliero: più giorni di fila, premi più ricchi',
  defaults: {
    premi: [
      { oro: 100, pozioni: 1 },
      { oro: 150, pozioni: 1 },
      { oro: 200, pozioni: 2 },
      { oro: 250, pozioni: 2, xp: 200 },
      { oro: 300, pozioni: 3 },
      { oro: 400, pozioni: 3, xp: 400 },
      { oro: 600, pozioni: 5, oggetto: 2 }
    ],
    promemoria: true,   // all'ingresso ricorda il premio non ancora ritirato
    unoPerIp: true      // un solo premio al giorno per connessione, anche cambiando nome all'eroe
  },

  setup(api) {
    const oggi = () => { const d = new Date(); return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5); };
    const chiave = nome => String(nome).toLowerCase();
    const st = () => { const s = api.store; s.eroi = s.eroi || {}; s.ip = s.ip || { giorno: 0, lista: [] }; return s; };
    const premi = () => Array.isArray(api.config.premi) && api.config.premi.length ? api.config.premi : module.exports.defaults.premi;
    const RARITA = ['comune', 'non comune', 'raro', 'epico'];

    // serie attuale: si interrompe se è passato più di un giorno dall'ultimo ritiro
    const serieDi = (e, g) => (e && g - e.ultimo <= 1 ? e.serie : 0);
    const testo = pr => [pr.oro && pr.oro + ' oro', pr.pozioni && pr.pozioni + (pr.pozioni > 1 ? ' pozioni' : ' pozione'), pr.xp && pr.xp + ' XP',
      pr.oggetto != null && 'un oggetto ' + (RARITA[pr.oggetto] || 'raro')].filter(Boolean).join(', ');

    function dai(p, pr) {
      // avvisa il Guardiano (se attivo) che oro e livello stanno per salire per un premio legittimo
      if (globalThis.VoxeliaGuardiano) globalThis.VoxeliaGuardiano.grazia(p.name);
      if (pr.oro > 0) p.give('gold', pr.oro);
      if (pr.pozioni > 0) p.give('pot', pr.pozioni);
      if (pr.xp > 0) p.give('xp', pr.xp);
      if (pr.oggetto != null) p.give('item', 1, pr.oggetto);
    }

    api.command('giornaliero', 'ritira il premio di oggi', p => {
      const s = st(), g = oggi(), k = chiave(p.name), e = s.eroi[k];
      if (e && e.ultimo === g) return 'Hai già ritirato il premio di oggi. Torna domani per il giorno ' + (e.serie + 1) + ' della serie!';
      if (api.config.unoPerIp && p.ip) {
        if (s.ip.giorno !== g) s.ip = { giorno: g, lista: [] };
        if (s.ip.lista.includes(p.ip)) return 'Da questa connessione il premio di oggi è già stato ritirato con un altro eroe.';
        s.ip.lista.push(p.ip);
      }
      const serie = serieDi(e, g) + 1, L = premi(), pr = L[(serie - 1) % L.length];
      s.eroi[k] = { nome: p.name, ultimo: g, serie, totale: ((e && e.totale) || 0) + 1 };
      api.save();
      dai(p, pr);
      if (serie % L.length === 0) api.announce(p.name + ' ha completato ' + L.length + ' giorni di fila e riceve il premio più ricco!', p.room);
      return 'Premio del giorno ' + serie + ': ' + testo(pr) + '. ' + (serie % L.length ? 'Domani: ' + testo(L[serie % L.length]) + '.' : 'Serie completata, domani si ricomincia!');
    });

    api.command('serie', 'i tuoi giorni di fila col premio giornaliero', p => {
      const g = oggi(), e = st().eroi[chiave(p.name)], n = serieDi(e, g);
      if (!e) return 'Non hai ancora ritirato nessun premio. Scrivi /giornaliero!';
      return 'Serie: ' + n + (n === 1 ? ' giorno' : ' giorni') + ' di fila, ' + e.totale + ' premi in tutto. ' +
        (e.ultimo === g ? 'Il premio di oggi è già ritirato.' : 'Il premio di oggi ti aspetta: /giornaliero');
    });

    api.on('join', p => {
      if (!api.config.promemoria) return;
      const e = st().eroi[chiave(p.name)];
      if (!e || e.ultimo !== oggi()) api.after(3000, () => { if (p.online) p.tell('Il premio di oggi ti aspetta: scrivi /giornaliero!'); });
    });
  }
};
