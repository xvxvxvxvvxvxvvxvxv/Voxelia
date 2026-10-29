// Classifiche della settimana (Voxelia 7.48).
// Quattro gare che ripartono ogni lunedì (settimana ISO, ora UTC):
// - 🎣 Pesca: i chili di pesce pescati nella settimana (li manda il gioco a ogni pesce tirato su);
// - ⚔ Colosseo: le vittorie nell'arena del Colosseo (le conta il server);
// - 🗝 Dungeon: i dungeon completati (li conta il server);
// - 🏰 Città: il valore delle tue città di Tomorrow (la somma dei livelli degli edifici; vale il migliore della settimana).
// Quando la settimana finisce, i primi tre di ogni gara vincono un premio estetico: un titolo da mostrare sopra l'eroe e,
// per il primo, un mantello speciale. Il premio arriva al gioco la prossima volta che l'eroe entra (o apre la classifica).
// Comando /classifiche. Pagina web /plugins/classifiche/.
module.exports = {
  name: 'Classifiche',
  version: '1.0',
  description: 'Classifiche della settimana (pesca, Colosseo, dungeon, città) con titoli e mantelli per i primi tre',
  defaults: { settimane: 8, inClassifica: 10, annuncia: true },

  setup(api) {
    const S = api.store; S.w = S.w || {}; S.paid = S.paid || {}; S.prem = S.prem || {};
    const CATS = ['pesca', 'colosseo', 'dungeon', 'citta'], NOMI = { pesca: 'Pesca', colosseo: 'Colosseo', dungeon: 'Dungeon', citta: 'Città' };
    const K = n => String(n || '').trim().toLowerCase().slice(0, 24);
    const bot = p => globalThis.VoxeliaStress && globalThis.VoxeliaStress.bot(p);
    // la settimana ISO (lunedì-domenica, UTC): «2026-W44»
    const sett = (d = new Date()) => { const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())), g = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - g);
      const y0 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1)), w = Math.ceil(((t - y0) / 864e5 + 1) / 7); return t.getUTCFullYear() + '-W' + String(w).padStart(2, '0'); };
    const prima = () => sett(new Date(Date.now() - 7 * 864e5));
    const tab = (wk, cat) => { const W = S.w[wk] || (S.w[wk] = {}); return W[cat] || (W[cat] = {}); };
    const lista = (wk, cat, n) => Object.values((S.w[wk] || {})[cat] || {}).filter(q => q.v > 0).sort((a, b) => b.v - a.v || a.at - b.at).slice(0, n || 10);
    const add = (cat, p, v, max) => {
      if (!p || bot(p) || !(v > 0)) return; chiudi(); const T = tab(sett(), cat), k = K(p.name), q = T[k] || (T[k] = { n: String(p.name).slice(0, 24), v: 0, at: Date.now() });
      const nv = max ? Math.max(q.v, v) : Math.round((q.v + v) * 10) / 10; if (nv !== q.v) { q.v = nv; q.at = Date.now(); api.save(); }
    };
    // a settimana finita: i premi ai primi tre di ogni gara
    function chiudi() {
      const now = sett(); let ch = false;
      for (const wk of Object.keys(S.w)) {
        if (wk >= now || S.paid[wk]) continue; S.paid[wk] = 1; ch = true; const ann = [];
        for (const cat of CATS) lista(wk, cat, 3).forEach((q, i) => { (S.prem[K(q.n)] || (S.prem[K(q.n)] = [])).push({ wk, cat, pos: i + 1 }); if (i === 0) ann.push(NOMI[cat] + ': ' + q.n); });
        if (ann.length && api.config.annuncia) api.announce('Classifiche della settimana ' + wk.slice(6) + ' — i campioni: ' + ann.join(' · '));
      }
      const ks = Object.keys(S.w).sort(); while (ks.length > Math.max(2, api.config.settimane | 0)) { const k = ks.shift(); delete S.w[k]; delete S.paid[k]; }
      if (ch) api.save();
    }
    const premi = p => { const L = S.prem[K(p.name)]; if (L && L.length) p.send('premi', { L }); };
    const stato = p => {
      chiudi(); const wk = sett(), pw = prima(), me = K(p.name), L = {}, prev = {}, mio = {};
      for (const cat of CATS) { L[cat] = lista(wk, cat, api.config.inClassifica | 0 || 10); prev[cat] = lista(pw, cat, 3);
        const all = lista(wk, cat, 1e6), i = all.findIndex(q => K(q.n) === me); mio[cat] = i >= 0 ? [i + 1, all[i].v] : null; }
      p.send('top', { wk, pw, L, prev, me: mio }); premi(p);
    };
    api.every(60000, chiudi);
    api.on('join', p => { chiudi(); premi(p); });
    api.on('arena', k => add('colosseo', k, 1));
    api.on('dungeon', c => add('dungeon', c, 1));
    const ultimo = {};
    api.onClient('pesca', (p, d) => { const kg = +(d && d.kg); if (!(kg > 0 && kg <= 400)) return; const k = K(p.name), now = Date.now(); if (ultimo[k] && now - ultimo[k] < 1500) return; ultimo[k] = now; add('pesca', p, kg); });
    api.onClient('citta', (p, d) => { const v = Math.round(+(d && d.v)); if (!(v > 0 && v <= 100000)) return; add('citta', p, v, true); });
    api.onClient('top', p => stato(p));
    api.onClient('presi', (p, d) => {                                 // il gioco ha ricevuto i premi
      const k = K(p.name), L = S.prem[k]; if (!L || !d || !Array.isArray(d.L)) return;
      S.prem[k] = L.filter(q => !d.L.some(x => x && x.wk === q.wk && x.cat === q.cat)); if (!S.prem[k].length) delete S.prem[k]; api.save();
    });

    api.command('classifiche', 'i primi della settimana in pesca, Colosseo, dungeon e città', () => {
      chiudi(); const wk = sett();
      return 'Classifiche della settimana ' + wk.slice(6) + ':\n' + CATS.map(c => { const L = lista(wk, c, 3); return NOMI[c] + ': ' + (L.length ? L.map((q, i) => (i + 1) + '. ' + q.n + ' (' + q.v + ')').join(', ') : 'nessuno'); }).join('\n');
    });
    api.route('GET', '/', (req, res, x) => {
      chiudi(); const e = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
      const sez = wk => '<h2>Settimana ' + e(wk) + '</h2><div class="g">' + CATS.map(c => { const L = lista(wk, c, 10); return '<section><h3>' + NOMI[c] + '</h3>' + (L.length ? '<ol>' + L.map(q => '<li>' + e(q.n) + ' <small>' + q.v + '</small></li>').join('') + '</ol>' : '<p>—</p>') + '</section>'; }).join('') + '</div>';
      x.send('<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Classifiche della settimana</title><style>body{font:16px Georgia,serif;background:#10131a;color:#e8ecf4;max-width:900px;margin:0 auto;padding:20px}h1{color:#f5b942}h2{color:#ffd27a}.g{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:12px}section{background:#1c2130;border-radius:8px;padding:8px 14px}small{opacity:.7}</style></head><body><h1>🏅 Classifiche della settimana</h1>' + sez(sett()) + sez(prima()) + '</body></html>');
    });
  }
};
