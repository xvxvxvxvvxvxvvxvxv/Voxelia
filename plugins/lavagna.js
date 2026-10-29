// Lavagna di casa (Voxelia 7.47): i messaggi lasciati in casa.
// In ogni casa (la stanza del Motel, la tua casa di Tomorrow, le case del Borgo) c'è una lavagna: chi entra ci scrive un
// messaggio, il padrone di casa (e i suoi coinquilini) li fissano in alto o li cancellano. Il padrone sceglie i coinquilini.
// - Una lavagna appartiene a chi la «reclama» per primo dalla sua casa (il gioco lo fa da solo quando entri in casa tua);
//   la lavagna della stanza del Motel è sempre di chi ha quel nome.
// - Le lavagne delle case di Tomorrow sono separate per mondo (codice stanza).
// Comandi: /lavagna (quante lavagne e messaggi) · pagina web con le ultime scritte: /plugins/lavagna/
module.exports = {
  name: 'Lavagna',
  version: '1.0',
  description: 'Lavagna dei messaggi nelle case: chi visita scrive, il padrone e i coinquilini fissano e cancellano',
  defaults: { maxMessaggi: 40, maxLunghezza: 160, maxCoinquilini: 6, pausaSecondi: 4, maxLavagne: 3000 },

  setup(api) {
    const S = api.store; S.b = S.b || {};
    const C = () => api.config;
    const K = n => String(n || '').trim().toLowerCase().slice(0, 24);
    const bot = p => globalThis.VoxeliaStress && globalThis.VoxeliaStress.bot(p);
    const pulito = (s, n) => String(s || '').replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, n);
    const mondo = p => String(p.room || '').split('-')[0].toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 16);
    // la chiave vera: «m:nome» (Motel), «h123» (Borgo), «tw:…» (Tomorrow, per mondo)
    const chiave = (p, k) => { k = String(k || '').slice(0, 80); if (!/^(m:|h\d+$|tw:)/.test(k)) return null; return k.startsWith('tw:') ? mondo(p) + '|' + k : k.startsWith('m:') ? 'm:' + K(k.slice(2)) : k; };
    const lav = (k, crea) => S.b[k] || (crea ? (S.b[k] = { o: null, co: [], L: [], at: Date.now() }) : null);
    const capo = (B, k, p) => !!B && (k.startsWith('m:') ? k.slice(2) === K(p.name) : B.o === K(p.name)) || !!B && B.co.includes(K(p.name));
    const vista = (k0, k, B, p) => ({ k: k0, L: B ? B.L : [], co: B ? B.co : [], o: B ? (k.startsWith('m:') ? k.slice(2) : B.o) : null, capo: capo(B, k, p), mio: !!B && (k.startsWith('m:') ? k.slice(2) === K(p.name) : B.o === K(p.name)) });
    const ultimo = {}, dove = {};                                      // dove: quale lavagna guarda ogni giocatore (per id)
    const pulisci = () => { const ks = Object.keys(S.b); if (ks.length <= C().maxLavagne) return; ks.sort((a, b) => S.b[a].at - S.b[b].at); for (const k of ks.slice(0, ks.length - C().maxLavagne)) delete S.b[k]; };
    const manda = (p, k0, k) => p.send('board', vista(k0, k, lav(k), p));
    const atutti = (k0, k) => { for (const q of api.players()) if (dove[q.id] === k) manda(q, k0, k); };

    api.on('leave', p => { delete dove[p.id]; });
    api.onClient('get', (p, d) => { const k = chiave(p, d && d.k); if (!k) return; dove[p.id] = k; manda(p, d.k, k); });
    api.onClient('claim', (p, d) => {                                   // il padrone di casa, la prima volta che entra
      const k = chiave(p, d && d.k); if (!k || bot(p)) return; dove[p.id] = k; if (k.startsWith('m:')) { manda(p, d.k, k); return; } const B = lav(k, true);
      if (!B.o) { B.o = K(p.name); B.at = Date.now(); pulisci(); api.save(); } manda(p, d.k, k);
    });
    api.onClient('post', (p, d) => {
      const k = chiave(p, d && d.k); if (!k || bot(p)) return; const t = pulito(d.t, C().maxLunghezza | 0 || 160); if (!t) return;
      const now = Date.now(); if (ultimo[K(p.name)] && now - ultimo[K(p.name)] < (C().pausaSecondi | 0) * 1000) { p.tell('Aspetta un momento prima di scrivere ancora sulla lavagna.'); return; }
      ultimo[K(p.name)] = now; const B = lav(k, true);
      B.L.push({ id: now.toString(36) + Math.random().toString(36).slice(2, 6), n: String(p.name).slice(0, 24), t, at: now, pin: 0 });
      const mx = C().maxMessaggi | 0 || 40; while (B.L.length > mx) { const i = B.L.findIndex(m => !m.pin); B.L.splice(i < 0 ? 0 : i, 1); }
      B.at = now; pulisci(); api.save(); atutti(d.k, k); if (dove[p.id] !== k) manda(p, d.k, k);
    });
    api.onClient('del', (p, d) => {                                     // chi l'ha scritto, il padrone, i coinquilini
      const k = chiave(p, d && d.k), B = k && lav(k); if (!B) return; const i = B.L.findIndex(m => m.id === d.id); if (i < 0) return;
      if (!capo(B, k, p) && K(B.L[i].n) !== K(p.name)) return; B.L.splice(i, 1); api.save(); atutti(d.k, k);
    });
    api.onClient('pin', (p, d) => {
      const k = chiave(p, d && d.k), B = k && lav(k); if (!B || !capo(B, k, p)) return; const m = B.L.find(q => q.id === d.id); if (!m) return;
      m.pin = m.pin ? 0 : 1; api.save(); atutti(d.k, k);
    });
    api.onClient('co', (p, d) => {                                      // i coinquilini li sceglie solo il padrone
      const k = chiave(p, d && d.k), B = k && lav(k, k && k.startsWith('m:')); if (!B) return;
      const mio = k.startsWith('m:') ? k.slice(2) === K(p.name) : B.o === K(p.name); if (!mio) return;
      B.co = (Array.isArray(d.co) ? d.co : []).map(K).filter((n, i, a) => n && n !== K(p.name) && a.indexOf(n) === i).slice(0, C().maxCoinquilini | 0 || 6);
      api.save(); atutti(d.k, k);
    });

    api.command('lavagna', 'quante lavagne e messaggi ci sono nelle case', () => {
      const B = Object.values(S.b); return B.length + ' lavagne, ' + B.reduce((s, b) => s + b.L.length, 0) + ' messaggi.';
    });
    api.route('GET', '/', (req, res, x) => {
      const e = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
      const L = []; for (const k in S.b) for (const m of S.b[k].L) L.push(m); L.sort((a, b) => b.at - a.at);
      x.send('<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Lavagne di casa</title><style>body{font:16px Georgia,serif;background:#10131a;color:#e8ecf4;max-width:760px;margin:0 auto;padding:20px}h1{color:#9adc8a}.m{background:#1e3a2a;border:1px solid #3a6a4a;border-radius:6px;padding:8px 12px;margin:8px 0}.m b{color:#ffd27a}small{opacity:.7}</style></head><body><h1>Lavagne di casa</h1>' +
        (L.length ? L.slice(0, 60).map(m => '<div class="m"><b>' + e(m.n) + '</b> <small>' + new Date(m.at).toLocaleString('it-IT') + '</small><br>' + e(m.t) + '</div>').join('') : '<p>Ancora nessun messaggio.</p>') + '</body></html>');
    });
  }
};
