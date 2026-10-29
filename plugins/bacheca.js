// Bacheca delle missioni (Voxelia 7.48): le missioni che i giocatori di Tomorrow si danno tra loro.
// Nelle città di Tomorrow c'è la Bacheca: un eroe appende una missione con un premio in oro, un altro la prende e la porta
// a termine. Le missioni sono di due tipi:
// - Consegna: «portami 20 legna» — chi la prende consegna le risorse dalla bacheca; il premio gli arriva subito, le risorse
//   arrivano al committente (anche se è offline: le ritira dalla bacheca);
// - Caccia: «abbatti 10 lupi» — il gioco conta le vittime di chi l'ha presa; finita la caccia si ritira il premio.
// Il premio lo tiene il server dal momento in cui la missione è appesa: se nessuno la prende entro `giorni`, torna indietro.
// Le missioni sono separate per mondo (codice stanza). Comando /bacheca. Pagina web /plugins/bacheca/.
module.exports = {
  name: 'Bacheca',
  version: '1.0',
  description: 'Le missioni dei giocatori di Tomorrow: consegne e cacce con un premio in oro',
  defaults: { giorni: 3, oreCaccia: 24, maxAperte: 3, maxPrese: 2, maxMondo: 40, premioMin: 10, premioMax: 50000 },

  setup(api) {
    const S = api.store; S.w = S.w || {};
    const C = () => api.config;
    const K = n => String(n || '').trim().toLowerCase().slice(0, 24);
    const bot = p => globalThis.VoxeliaStress && globalThis.VoxeliaStress.bot(p);
    const pw = w => String(w || '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 16);
    const wDi = p => pw(String(p.room || '').split('-')[0]) || 'solo';
    const mondo = w => S.w[w] || (S.w[w] = { m: [], pend: {}, n: 0 });
    const pulito = (s, n) => String(s || '').replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, n);
    const RIS = ['legna', 'pietra', 'ferro', 'grano', 'mela', 'uova', 'rame', 'carbone', 'argilla', 'marmo', 'conchiglia', 'rosa'];
    const pend = (M, n) => M.pend[K(n)] || (M.pend[K(n)] = { g: 0, res: {}, msg: [] });
    const vista = (M, p) => {
      const me = K(p.name), q = M.pend[me];
      return { L: M.m.map(m => Object.assign({}, m, { mia: K(m.o) === me, presa: K(m.by) === me })), pend: q ? { g: q.g, res: q.res, msg: q.msg } : null };
    };
    const tutti = w => { const M = mondo(w); for (const q of api.players()) if (wDi(q) === w) q.send('list', vista(M, q)); };
    // missioni scadute: le aperte da troppo tempo tornano al committente, le cacce prese da troppo tornano aperte
    const pulisci = M => {
      const now = Date.now(), d = (C().giorni || 3) * 864e5, h = (C().oreCaccia || 24) * 36e5; let ch = false;
      for (let i = M.m.length - 1; i >= 0; i--) {
        const m = M.m[i];
        if (m.st === 'aperta' && now - m.at > d) { const q = pend(M, m.o); q.g += m.g; q.msg.push('La missione «' + m.rn + '» è scaduta: ti tornano ' + m.g + ' monete.'); M.m.splice(i, 1); ch = true; }
        else if (m.st === 'presa' && now - m.t0 > h) { m.st = 'aperta'; m.by = ''; m.at = now; ch = true; }
        else if (m.st === 'fatta' && now - m.t0 > d) { M.m.splice(i, 1); ch = true; }
      }
      if (ch) api.save(); return M;
    };
    // quello che spetta a chi entra (o apre la bacheca): oro rimborsato, risorse consegnate, avvisi
    const consegna = (M, p) => {
      const q = M.pend[K(p.name)]; if (!q) return;
      if (q.g > 0) { p.give('gold', q.g); p.tell('Dalla bacheca: ' + q.g + ' monete.'); }
      if (Object.keys(q.res).length) p.send('pacco', { res: q.res });
      for (const t of q.msg) p.tell(t);
      delete M.pend[K(p.name)]; api.save();
    };

    api.on('join', p => { const M = S.w[wDi(p)]; if (M) { pulisci(M); consegna(M, p); } });
    api.onClient('list', p => { const M = pulisci(mondo(wDi(p))); consegna(M, p); p.send('list', vista(M, p)); });
    api.onClient('post', (p, d) => {
      if (bot(p) || !d) return; const w = wDi(p), M = pulisci(mondo(w)), me = K(p.name);
      const k = d.k === 'caccia' ? 'caccia' : 'consegna', n = Math.round(+d.n), g = Math.round(+d.g), r = pulito(d.r, 24);
      if (!(n >= 1 && n <= 200)) return p.tell('Quantità non valida (da 1 a 200).');
      if (!(g >= C().premioMin && g <= C().premioMax)) return p.tell('Il premio va da ' + C().premioMin + ' a ' + C().premioMax + ' monete.');
      if (k === 'consegna' && !RIS.includes(r)) return p.tell('Questa risorsa non si può chiedere.');
      if (k === 'caccia' && !/^[a-z_0-9]{2,24}$/.test(r)) return;
      if (typeof p.gold === 'number' && p.gold < g) return p.tell('Non hai abbastanza oro per questo premio.');
      if (M.m.filter(m => K(m.o) === me && m.st !== 'fatta').length >= C().maxAperte) return p.tell('Hai già ' + C().maxAperte + ' missioni sulla bacheca.');
      if (M.m.filter(m => m.st !== 'fatta').length >= C().maxMondo) return p.tell('La bacheca è piena: riprova più tardi.');
      M.n = (M.n | 0) + 1;
      const m = { id: M.n.toString(36) + Date.now().toString(36).slice(-3), k, r, rn: pulito(d.rn, 40) || r, n, g, o: String(p.name).slice(0, 24), at: Date.now(), st: 'aperta', by: '', t0: 0 };
      M.m.push(m); api.save(); p.send('posted', { id: m.id, g }); tutti(w);
    });
    api.onClient('take', (p, d) => {
      const w = wDi(p), M = pulisci(mondo(w)), m = M.m.find(q => q.id === (d && d.id)), me = K(p.name); if (!m || m.st !== 'aperta') return;
      if (K(m.o) === me) return p.tell('Non puoi prendere una tua missione.');
      if (M.m.filter(q => K(q.by) === me && q.st === 'presa').length >= C().maxPrese) return p.tell('Hai già ' + C().maxPrese + ' missioni in corso.');
      m.st = 'presa'; m.by = String(p.name).slice(0, 24); m.t0 = Date.now(); api.save(); tutti(w);
    });
    api.onClient('drop', (p, d) => {                                     // chi l'ha presa ci rinuncia
      const w = wDi(p), M = mondo(w), m = M.m.find(q => q.id === (d && d.id)); if (!m || m.st !== 'presa' || K(m.by) !== K(p.name)) return;
      m.st = 'aperta'; m.by = ''; m.at = Date.now(); api.save(); tutti(w);
    });
    api.onClient('done', (p, d) => {                                     // consegna fatta o caccia finita
      const w = wDi(p), M = mondo(w), m = M.m.find(q => q.id === (d && d.id)); if (!m || m.st !== 'presa' || K(m.by) !== K(p.name)) return;
      m.st = 'fatta'; m.t0 = Date.now(); p.give('gold', m.g); p.send('paid', { id: m.id, g: m.g, k: m.k, r: m.r, n: m.n });
      const q = pend(M, m.o); if (m.k === 'consegna') q.res[m.r] = (q.res[m.r] | 0) + m.n;
      q.msg.push(m.by + ' ha completato la tua missione «' + m.rn + '».'); api.save();
      const o = api.players().find(x => K(x.name) === K(m.o) && wDi(x) === w); if (o) consegna(M, o);
      tutti(w);
    });
    api.onClient('cancel', (p, d) => {                                   // il committente ritira una missione non ancora presa
      const w = wDi(p), M = mondo(w), i = M.m.findIndex(q => q.id === (d && d.id)); if (i < 0) return; const m = M.m[i];
      if (K(m.o) !== K(p.name) || m.st !== 'aperta') return;
      M.m.splice(i, 1); p.give('gold', m.g); api.save(); tutti(w);
    });

    api.command('bacheca', 'le missioni aperte sulla bacheca del tuo mondo', p => {
      const M = S.w[wDi(p)]; const L = M ? M.m.filter(m => m.st === 'aperta') : [];
      return L.length ? 'Bacheca, ' + L.length + ' missioni aperte:\n' + L.slice(0, 6).map(m => '· ' + m.rn + ' — ' + m.g + ' monete (da ' + m.o + ')').join('\n') : 'Nessuna missione aperta sulla bacheca.';
    });
    api.route('GET', '/', (req, res, x) => {
      const e = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
      let h = '';
      for (const w in S.w) { const L = S.w[w].m; if (!L.length) continue; h += '<h2>Mondo ' + e(w) + '</h2><table><tr><th>Missione</th><th>Premio</th><th>Da</th><th>Stato</th></tr>' + L.map(m => '<tr><td>' + e(m.rn) + '</td><td>' + m.g + '</td><td>' + e(m.o) + '</td><td>' + (m.st === 'presa' ? 'presa da ' + e(m.by) : e(m.st)) + '</td></tr>').join('') + '</table>'; }
      x.send('<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Bacheca delle missioni</title><style>body{font:16px Georgia,serif;background:#10131a;color:#e8ecf4;max-width:760px;margin:0 auto;padding:20px}h1{color:#f5b942}h2{color:#ffd27a}table{border-collapse:collapse;width:100%}td,th{padding:6px;border-bottom:1px solid #333;text-align:left}</style></head><body><h1>📌 Bacheca delle missioni</h1>' + (h || '<p>Nessuna missione.</p>') + '</body></html>');
    });
  }
};
