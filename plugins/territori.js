// Territori e guerre di Tomorrow (Voxelia 7.22).
// I giocatori che giocano nello stesso mondo di Tomorrow (stesso codice stanza) condividono le terre conquistate:
// il plugin le ricorda, le manda a tutti e decide chi le possiede. Le terre di un altro eroe si prendono con un assedio;
// gli insediamenti non si conquistano ma si saccheggiano, e chi viene saccheggiato lo scopre anche se era offline.
module.exports = {
  name: 'Territori',
  version: '1.1',
  description: 'Terre, insediamenti e guerre fra i giocatori di Tomorrow nello stesso mondo',
  defaults: { maxRegioni: 400, registro: 40 },

  setup(api) {
    const S = api.store;
    S.w = S.w || {};          // mondo -> { r: { regione: { o, f, s, d } }, log: [] }
    S.pend = S.pend || {};    // eroe -> saccheggi e perdite da raccontare
    const bot = p => globalThis.VoxeliaStress && globalThis.VoxeliaStress.bot(p);
    const mondo = w => { w = String(w || '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 16); if (!w) return null; return S.w[w] || (S.w[w] = { r: {}, log: [] }); };
    const chiave = k => /^tw:-?\d{1,4},-?\d{1,4}$/.test(String(k || '')) ? String(k) : null;
    const pulisci = f => {
      if (!f || typeof f !== 'object') return null;
      const cr = f.cr && typeof f.cr === 'object' ? f.cr : {};
      const col = c => /^#[0-9a-f]{6}$/i.test(String(c || '')) ? c : '#d4af37';
      return { n: String(f.n || '').replace(/[<>]/g, '').slice(0, 30), cr: { sh: (cr.sh | 0) % 4, dv: (cr.dv | 0) % 5, c1: col(cr.c1), c2: col(cr.c2), sy: (cr.sy | 0) % 12 } };
    };
    const registra = (M, testo) => { M.log.unshift({ t: Date.now(), testo }); M.log.length = Math.min(M.log.length, api.config.registro || 40); };
    const giocatori = w => api.players().filter(q => String(q.room || '').split('-')[0] === w);
    const manda = w => { const M = S.w[w]; if (!M) return; for (const q of giocatori(w)) q.send('map', { w, r: M.r, log: M.log.slice(0, 12) }); };
    const racconta = p => { const L = S.pend[p.name]; if (L && L.length) { p.send('fatti', L); delete S.pend[p.name]; api.save(); } };

    // il gioco manda le terre dell'eroe: si aggiungono quelle libere, si tolgono quelle che non ha più
    api.onClient('sync', (p, d) => {
      if (bot(p) || !d) return; const w = String(d.w || '').toLowerCase(), M = mondo(w); if (!M) return;
      const mie = d.mine && typeof d.mine === 'object' ? d.mine : {}, f = pulisci(d.f);
      for (const k of Object.keys(M.r)) if (M.r[k].o === p.name && !mie[k]) delete M.r[k];
      let n = Object.values(M.r).filter(x => x.o === p.name).length;
      for (const k0 of Object.keys(mie)) {
        const k = chiave(k0); if (!k) continue; const r = M.r[k];
        if (r && r.o !== p.name) { p.send('negato', { k, o: r.o }); continue; }       // l'ha già un altro: si prende solo con un assedio
        if (!r && n >= (api.config.maxRegioni || 400)) continue;
        const s = mie[k0] && mie[k0].s ? { n: String(mie[k0].s.n || '').replace(/[<>]/g, '').slice(0, 28), lv: Math.max(1, Math.min(5, mie[k0].s.lv | 0)), dif: Math.max(0, Math.min(12, mie[k0].s.dif | 0)), pow: Math.max(0, Math.min(100000, mie[k0].s.pow | 0)) } : null;
        M.r[k] = { o: p.name, f, s, d: r ? r.d : Date.now() }; if (!r) n++;
      }
      api.save(); manda(w); racconta(p);
    });
    api.onClient('hello', (p, d) => { if (!d) return; const w = String(d.w || '').toLowerCase(), M = mondo(w); if (!M) return; p.send('map', { w, r: M.r, log: M.log.slice(0, 12) }); racconta(p); });
    // un assedio vinto: la terra passa di mano
    api.onClient('capture', (p, d) => {
      if (bot(p) || !d) return; const w = String(d.w || '').toLowerCase(), M = mondo(w), k = chiave(d.k); if (!M || !k) return; const r = M.r[k];
      if (!r || r.o === p.name || r.s) return;
      const vecchio = r.o; M.r[k] = { o: p.name, f: pulisci(d.f), s: null, d: Date.now() };
      registra(M, p.name + ' ha conquistato ' + String(d.n || k).slice(0, 30) + ' a ' + vecchio);
      (S.pend[vecchio] = S.pend[vecchio] || []).push({ tipo: 'persa', k, da: p.name, n: String(d.n || '').slice(0, 30), t: Date.now() });
      const v = api.player(vecchio); if (v) racconta(v);
      api.announce('⚔ ' + p.name + ' ha strappato ' + String(d.n || k).slice(0, 30) + ' a ' + vecchio + '!', p.room);
      api.save(); manda(w);
    });
    // un insediamento saccheggiato: chi lo possiede perde una parte del tesoro
    api.onClient('raid', (p, d) => {
      if (bot(p) || !d) return; const w = String(d.w || '').toLowerCase(), M = mondo(w), k = chiave(d.k); if (!M || !k) return; const r = M.r[k];
      if (!r || !r.s || r.o === p.name) return; const quota = Math.max(.05, Math.min(.4, +d.q || .2));
      registra(M, p.name + ' ha saccheggiato ' + r.s.n + ' di ' + r.o);
      (S.pend[r.o] = S.pend[r.o] || []).push({ tipo: 'sacco', k, da: p.name, n: r.s.n, q: quota, t: Date.now() });
      const v = api.player(r.o); if (v) racconta(v);
      api.announce('🔥 ' + p.name + ' ha saccheggiato ' + r.s.n + '!', p.room); api.save(); manda(w);
    });
    api.command('terre', 'le terre di Tomorrow in questo mondo', p => {
      const w = String(p.room || '').split('-')[0], M = S.w[w]; if (!M) return 'Nessuna terra in questo mondo';
      const per = {}; for (const r of Object.values(M.r)) per[r.o] = (per[r.o] || 0) + 1;
      return Object.keys(per).sort((a, b) => per[b] - per[a]).map(o => o + ': ' + per[o]).join(' · ') || 'Nessuna terra';
    });
    api.route('GET', '/', (req, res, x) => x.json(Object.fromEntries(Object.entries(S.w).map(([w, M]) => [w, { regioni: Object.keys(M.r).length, registro: M.log.slice(0, 10) }]))), { admin: true });
  }
};
