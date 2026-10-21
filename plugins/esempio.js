// Plugin di esempio, da cui partire per scriverne uno nuovo. Si spegne dalla pagina Plugin del pannello admin
// (oppure rinominando il file con il trattino basso davanti, _esempio.js).
module.exports = {
  name: 'Esempio',
  version: '1.1',
  description: 'Saluta chi entra, aggiunge /dado, /ora, /vittorie e /festa e una pagina web',
  defaults: { benvenuto: 'Benvenuto, {nome}! Scrivi /aiuto per i comandi del server.' },

  setup(api) {
    // saluto personale a chi entra
    api.on('join', p => p.tell(api.config.benvenuto.replace('{nome}', p.name)));

    // comandi di chat
    api.command('dado', 'tira un dado (es. /dado 20)', (p, args) => {
      const f = Math.max(2, Math.min(1000, parseInt(args[0]) || 6));
      api.say(p.room, p.name + ' tira un d' + f + ': ' + (1 + Math.floor(Math.random() * f)));
    });
    api.command('ora', "l'ora del mondo", () => { const c = api.server.clock(); return 'Giorno ' + c.day + ', ore ' + c.time; });
    // (non /boss: quel comando è del plugin Boss del mondo, e i comandi doppi vengono ignorati)
    api.command('vittorie', 'quanti boss dei dungeon hai sconfitto', p => (api.store[p.name] || 0) + ' boss sconfitti da ' + p.name);

    // dati che restano tra un riavvio e l'altro
    api.on('dungeon', (p, dungeon, ciclo) => {
      if (globalThis.VoxeliaStress && globalThis.VoxeliaStress.bot(p)) return;   // i bot dello Stress test non si salvano
      api.store[p.name] = (api.store[p.name] || 0) + 1; api.save();
      api.announce(p.name + ' ha liberato ' + dungeon + '! Ora è al ciclo ' + ciclo, p.room);
    });

    // codice nel gioco: quando il plugin manda l'evento "festa", ogni giocatore della stanza vede un titolo grande
    api.client('VXP.on(' + JSON.stringify(api.id) + ', "festa", d => banner("Festa!", d.testo, "stella"));');
    api.command('festa', 'festeggia con tutta la stanza', p => { api.broadcast('festa', { testo: p.name + ' ha dato il via alla festa!' }, p.room); });

    // una pagina web: http://localhost:3000/plugins/esempio/ (il nome del file senza .js)
    api.route('GET', '/', (req, res, x) => x.send('<h1>Eroi online: ' + api.players().length + '</h1>'));
  }
};
