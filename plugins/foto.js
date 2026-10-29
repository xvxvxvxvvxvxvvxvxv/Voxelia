// Galleria delle foto (Voxelia 7.47).
// Con la modalità foto del gioco (tasto F8) si scatta; dalla galleria del gioco la foto si «appende» qui, nella Galleria
// del server, dove la vedono tutti: nel gioco (Galleria → Galleria del server) e nella pagina web del plugin.
// Le foto arrivano piccole (JPEG sotto i 58 KB). Ogni eroe ne tiene al massimo maxPerEroe: la più vecchia lascia il posto.
// Le foto stanno nel file dei dati del server: maxFoto (40) le tiene sotto i 2,5 MB.
// Comandi: /foto (quante foto ci sono). L'admin toglie una foto da /plugins/foto/via?num=<numero> (il numero è nella pagina).
module.exports = {
  name: 'Foto',
  version: '1.0',
  description: 'Galleria del server per le foto scattate con la modalità foto del gioco',
  defaults: { maxFoto: 40, maxPerEroe: 8, pausaSecondi: 20 },

  setup(api) {
    const S = api.store; S.f = Array.isArray(S.f) ? S.f : []; S.n = S.n | 0;
    const C = () => api.config;
    const K = n => String(n || '').trim().toLowerCase().slice(0, 24);
    const bot = p => globalThis.VoxeliaStress && globalThis.VoxeliaStress.bot(p);
    const ultimo = {};
    const lista = () => S.f.slice().sort((a, b) => b.at - a.at).slice(0, 48).map(f => ({ id: f.id, n: f.n, zn: f.zn, at: f.at }));

    api.onClient('up', (p, d) => {
      if (bot(p) || !d) return;
      const img = String(d.img || '');
      if (!/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(img) || img.length > 60000) { p.tell('La foto non va bene per la galleria.'); return; }
      const now = Date.now(), k = K(p.name);
      if (ultimo[k] && now - ultimo[k] < (C().pausaSecondi | 0) * 1000) { p.tell('Aspetta un po\' prima di appendere un\'altra foto.'); return; }
      ultimo[k] = now;
      const mie = S.f.filter(f => K(f.n) === k).sort((a, b) => a.at - b.at);
      while (mie.length >= Math.max(1, C().maxPerEroe | 0)) { const v = mie.shift(); S.f.splice(S.f.indexOf(v), 1); }
      S.n++;
      S.f.push({ id: S.n.toString(36) + now.toString(36).slice(-4), num: S.n, n: String(p.name).slice(0, 24), zn: String(d.zn || '').replace(/[<>]/g, '').slice(0, 40), at: now, img });
      while (S.f.length > Math.max(1, C().maxFoto | 0)) { let o = 0; for (let i = 1; i < S.f.length; i++) if (S.f[i].at < S.f[o].at) o = i; S.f.splice(o, 1); }
      api.save();
      p.tell('Foto appesa nella Galleria del server!');
      api.broadcast('list', { L: lista() });
    });
    api.onClient('list', p => p.send('list', { L: lista() }));

    api.command('foto', 'quante foto ci sono nella galleria del server', () => S.f.length + ' foto nella galleria del server.');
    api.route('GET', '/via', (req, res, x) => {
      const i = S.f.findIndex(f => f.num === (+x.query.num | 0)); if (i < 0) { x.send(404, 'Nessuna foto con quel numero.', 'text/plain'); return; }
      S.f.splice(i, 1); api.save(); api.broadcast('list', { L: lista() }); x.send('Foto tolta.', 'text/plain');
    }, { admin: true });
    api.route('GET', '/img', (req, res, x) => {
      const f = S.f.find(q => q.id === String(x.query.id || ''));
      if (!f) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); res.end('Foto non trovata'); return; }
      const b = Buffer.from(f.img.slice(f.img.indexOf(',') + 1), 'base64');
      res.writeHead(200, { 'Content-Type': 'image/jpeg', 'Content-Length': b.length, 'Cache-Control': 'public, max-age=86400' }); res.end(b);
    });
    api.route('GET', '/', (req, res, x) => {
      const e = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
      const L = S.f.slice().sort((a, b) => b.at - a.at);
      x.send('<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Galleria di Voxelia</title><style>body{font:16px Georgia,serif;background:#10131a;color:#e8ecf4;max-width:1100px;margin:0 auto;padding:20px}h1{color:#f5b942}main{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:14px}figure{margin:0;background:#1c2130;border-radius:8px;padding:6px}img{width:100%;border-radius:6px;display:block}figcaption{font-size:13px;padding:4px 2px;opacity:.9}small{opacity:.6}</style></head><body><h1>📷 Galleria di Voxelia</h1>' +
        (L.length ? '<main>' + L.map(f => '<figure><a href="img?id=' + e(f.id) + '"><img loading="lazy" src="img?id=' + e(f.id) + '" alt=""></a><figcaption><b>' + e(f.n) + '</b> · ' + e(f.zn) + '<br><small>n. ' + f.num + ' · ' + new Date(f.at).toLocaleString('it-IT') + '</small></figcaption></figure>').join('') + '</main>' : '<p>Ancora nessuna foto.</p>') + '</body></html>');
    });
  }
};
