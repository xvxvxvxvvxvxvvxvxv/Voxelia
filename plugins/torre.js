// Torre della Corona (Voxelia 7.43): la classifica della sfida del giorno.
// La Torre ha dieci piani, uguali per tutti i giocatori nello stesso giorno (UTC). Il gioco manda qui, alla fine di ogni
// salita, quanti piani sono stati superati e in quanto tempo; il plugin tiene il miglior risultato di ogni eroe per ogni
// giorno (gli ultimi 14 giorni), lo rimanda a chi apre l'ingresso della Torre e lo mostra in /torre e nella pagina web.
// Chi arriva in cima per primo nel giorno viene annunciato a tutti.
module.exports = {
  name: 'Torre',
  version: '1.0',
  description: 'Classifica giornaliera della Torre della Corona: piani superati e tempo',
  defaults: { giorni: 14, inClassifica: 20, annunciaVetta: true },

  setup(api) {
    const S = api.store; S.d = S.d || {};
    const oggi = () => new Date().toISOString().slice(0, 10);
    const K = n => String(n || '').trim().toLowerCase().slice(0, 24);
    const bot = p => globalThis.VoxeliaStress && globalThis.VoxeliaStress.bot(p);
    const lista = d => Object.values(S.d[d] || {}).sort((a, b) => b.c - a.c || a.t - b.t);
    const pulisci = () => { const ks = Object.keys(S.d).sort(); while (ks.length > Math.max(1, api.config.giorni | 0)) delete S.d[ks.shift()]; };
    const tempo = s => Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');

    api.onClient('score', (p, d) => {
      if (bot(p) || !d || typeof d !== 'object') return;
      const g = oggi();
      if (d.d !== g) return;                       // solo la sfida di oggi
      const c = Math.round(+d.c), t = Math.round(+d.t), lv = Math.round(+d.lv) || 1;
      if (!(c >= 1 && c <= 10) || !(t >= c * 15 && t < 6 * 3600)) return;   // dieci piani al massimo, e non in un lampo
      const day = S.d[g] || (S.d[g] = {}), k = K(p.name), old = day[k];
      const primo = c === 10 && !Object.values(day).some(q => q.c === 10);
      if (!old || c > old.c || (c === old.c && t < old.t)) { day[k] = { n: String(p.name).slice(0, 24), c, t, lv, at: Date.now() }; pulisci(); api.save(); }
      if (primo && api.config.annunciaVetta) api.announce(p.name + ' è il primo ad arrivare in cima alla Torre della Corona oggi! (' + tempo(t) + ')');
      p.send('top', { d: g, L: lista(g).slice(0, api.config.inClassifica | 0 || 20) });
    });
    api.onClient('top', p => { const g = oggi(); p.send('top', { d: g, L: lista(g).slice(0, api.config.inClassifica | 0 || 20) }); });

    api.command('torre', 'la classifica di oggi della Torre della Corona', () => {
      const L = lista(oggi()).slice(0, 5);
      return L.length ? 'Torre della Corona, oggi:\n' + L.map((q, i) => (i + 1) + '. ' + q.n + ' — ' + q.c + '/10 piani in ' + tempo(q.t)).join('\n') : 'Oggi nessuno è ancora salito sulla Torre della Corona.';
    });

    api.route('GET', '/', (req, res, x) => {
      const e = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
      const giorni = Object.keys(S.d).sort().reverse();
      const tab = d => { const L = lista(d); return '<h2>' + e(d) + '</h2>' + (L.length ? '<table><tr><th>#</th><th>Eroe</th><th>Piani</th><th>Tempo</th><th>Livello</th></tr>' +
        L.map((q, i) => '<tr><td>' + (i + 1) + '</td><td>' + e(q.n) + '</td><td>' + q.c + '/10</td><td>' + tempo(q.t) + '</td><td>' + q.lv + '</td></tr>').join('') + '</table>' : '<p>Nessuna salita.</p>'); };
      x.send('<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Torre della Corona</title><style>body{font:16px Georgia,serif;background:#10131a;color:#e8ecf4;max-width:760px;margin:0 auto;padding:20px}h1{color:#f5b942;text-shadow:3px 3px 0 #8a3b12}h2{color:#ffd27a}table{border-collapse:collapse;width:100%}td,th{padding:6px 8px;border-bottom:1px solid #f5b94230;text-align:left}th{color:#ffd27a}</style></head><body><h1>🗼 Torre della Corona</h1><p>La sfida del giorno: dieci piani, uguali per tutti. In gioco: /torre</p>' +
        (giorni.length ? giorni.map(tab).join('') : '<p>Ancora nessuna salita.</p>') + '</body></html>');
    });
  }
};
