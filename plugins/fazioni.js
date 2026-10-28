// Fazioni dei giocatori (Voxelia 7.39).
// In un mondo di Tomorrow (stesso codice stanza) i giocatori fondano una fazione e costruiscono insieme un insediamento.
// - Il capo fonda la fazione, invita gli altri (o accoglie chi chiede di entrare) e mette in comune una delle sue città.
// - Chi entra parte come «recluta», con il potere limitato: visita la città e combatte con gli altri, ma non costruisce.
// - Solo il capo decide i permessi dei ruoli e crea ruoli nuovi; lo «staff» fa il lavoro al posto suo (inviti, richieste,
//   ruoli dei membri, espulsioni) e, come tutti, può fare quello che i permessi del suo ruolo gli lasciano fare.
// - La città comune la tiene il server: chi ha il permesso la cambia (edifici, pianta, interni, tesoro, esercito, nome) e
//   tutti i membri online la vedono cambiare subito. Le parti che un ruolo non può toccare restano come erano.
// - Ogni membro ha una chiave segreta che il gioco tiene nel browser: un altro giocatore con lo stesso nome non può
//   agire al suo posto.
const crypto = require('crypto');
const PERMS = ['costruire', 'arredare', 'tesoro', 'esercito', 'gestire', 'invitare', 'espellere'];
// quale permesso serve per cambiare ogni parte della città (le altre parti, la vita di tutti i giorni, le cambia il capo)
const KEYP = { lay: 'costruire', b: 'costruire', lv: 'costruire', dec: 'costruire', col: 'costruire', int: 'arredare', cash: 'tesoro', mag: 'tesoro', army: 'esercito', n: 'gestire' };
const RUOLI0 = () => ({ staff: { p: PERMS.slice() }, membro: { p: ['costruire', 'arredare', 'esercito'] }, recluta: { p: [] } });

module.exports = {
  name: 'Fazioni',
  version: '1.1',
  description: 'Fazioni dei giocatori di Tomorrow: ruoli, permessi, un insediamento da costruire insieme e le guerre programmate',
  defaults: { maxMembri: 30, maxFazioni: 80, maxRuoli: 10, maxCittaKB: 1500, guerraMinuti: 20, bottinoGuerra: 0.3, pausaGuerraOre: 2, preavvisoMinimo: 5 },

  setup(api) {
    const S = api.store;
    S.w = S.w || {};
    const C = () => api.config;
    const bot = p => globalThis.VoxeliaStress && globalThis.VoxeliaStress.bot(p);
    const pw = w => String(w || '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 16);
    const mondo = w => { w = pw(w); if (!w) return null; return S.w[w] || (S.w[w] = { f: {}, chi: {}, inv: {} }); };
    const wDi = p => pw(String(p.room || '').split('-')[0]);
    const H = s => crypto.createHash('sha256').update('vxfz:' + String(s || '')).digest('hex');
    const K = n => String(n || '').trim().toLowerCase().slice(0, 24);
    const pulito = (s, n) => String(s || '').replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, n);
    const reg = (F, testo) => { F.log.unshift({ t: Date.now(), testo }); F.log.length = Math.min(F.log.length, 30); };
    const online = w => api.players().filter(q => wDi(q) === w);
    const ilMembro = (F, n) => F.m[K(n)];
    const puo = (F, m, perm) => !!m && (m.r === 'capo' || !!(F.ru[m.r] && F.ru[m.r].p.includes(perm)));
    const chi = (p, d) => {                                                    // chi è, e se la chiave è giusta
      const w = pw(d && d.w) || wDi(p), M = mondo(w); if (!M) return {};
      const fid = M.chi[K(p.name)], F = fid && M.f[fid], m = F && ilMembro(F, p.name);
      if (!F || !m || m.h !== H(d && d.tk)) return { w, M };
      return { w, M, F, m };
    };
    const pubblica = F => ({ id: F.id, n: F.n, capo: F.capo, nm: Object.keys(F.m).length, citta: F.set ? { n: F.set.n, lv: F.set.lv } : null });
    const stato = (p, w, M) => {
      const fid = M.chi[K(p.name)], F = fid && M.f[fid], m = F && ilMembro(F, p.name), on = new Set(online(w).map(q => K(q.name)));
      if (!F || !m) {
        const inv = Object.entries(M.inv[K(p.name)] || {}).filter(([id]) => M.f[id]).map(([id, x]) => ({ id, n: M.f[id].n, da: x.da }));
        const L = Object.values(M.f).map(pubblica).map(x => Object.assign(x, { chiesto: !!(M.f[x.id].req[K(p.name)]) }));
        p.send('stato', { w, fz: null, inv, lista: L }); return;
      }
      const me = { r: m.r, p: m.r === 'capo' ? PERMS.slice() : (F.ru[m.r] ? F.ru[m.r].p.slice() : []) };
      p.send('stato', { w, me, perms: PERMS, fz: { id: F.id, n: F.n, capo: F.capo, ru: F.ru, log: F.log.slice(0, 14),
        m: Object.values(F.m).map(x => ({ n: x.n, r: x.r, on: on.has(K(x.n)), j: x.j })),
        req: puo(F, m, 'invitare') ? Object.values(F.req).map(x => ({ n: x.n, t: x.t })) : [],
        set: F.set ? { k: F.set.k, n: F.set.n, lv: F.set.lv, v: F.set.v } : null } });
    };
    const aggiorna = (w, M, F) => { for (const q of online(w)) { const id = M.chi[K(q.name)]; if (!F || id === F.id || M.inv[K(q.name)] || !id) stato(q, w, M); } };
    const mandaCitta = (w, M, F, solo) => { if (!F.set || !F.set.S) return; const d = { fid: F.id, k: F.set.k, v: F.set.v, by: F.set.by, capo: F.capo, S: F.set.S };
      for (const q of solo ? [solo] : online(w)) if (M.chi[K(q.name)] === F.id) q.send('citta', d); };
    const fallo = (p, testo) => { p.send('esito', { testo }); };
    const togli = (M, F, n) => { delete F.m[K(n)]; delete M.chi[K(n)]; };
    const sciogli = (w, M, F) => { for (const k of Object.keys(F.m)) delete M.chi[k]; delete M.f[F.id]; for (const k in M.inv) { delete M.inv[k][F.id]; if (!Object.keys(M.inv[k]).length) delete M.inv[k]; } };
    const entra = (M, F, n, h) => { F.m[K(n)] = { n, r: 'recluta', h, j: Date.now() }; M.chi[K(n)] = F.id; delete F.req[K(n)]; if (M.inv[K(n)]) delete M.inv[K(n)][F.id]; };
    const pezzi = new Map();                                                   // la città arriva a pezzi (un messaggio non può essere troppo grande)

    api.onClient('stato', (p, d) => {
      if (bot(p)) return; const x = chi(p, d); if (!x.M) return; stato(p, x.w, x.M);
      if (x.F && x.F.set && x.F.set.S && (d && d.v) !== x.F.set.v) mandaCitta(x.w, x.M, x.F, p);
    });
    api.onClient('crea', (p, d) => {
      if (bot(p)) return; const x = chi(p, d); if (!x.M) return; const M = x.M;
      if (M.chi[K(p.name)] && M.f[M.chi[K(p.name)]]) return fallo(p, 'Sei già in una fazione: prima esci da quella.');
      const n = pulito(d && d.n, 28); if (n.length < 3) return fallo(p, 'Il nome della fazione deve avere almeno 3 lettere.');
      if (Object.keys(M.f).length >= C().maxFazioni) return fallo(p, 'In questo mondo ci sono già troppe fazioni.');
      if (Object.values(M.f).some(F => F.n.toLowerCase() === n.toLowerCase())) return fallo(p, 'C\'è già una fazione con questo nome.');
      if (!d.tk || String(d.tk).length < 16) return;
      const id = crypto.randomBytes(5).toString('hex');
      const F = M.f[id] = { id, n, capo: p.name, m: {}, ru: RUOLI0(), req: {}, log: [], set: null, t: Date.now() };
      F.m[K(p.name)] = { n: p.name, r: 'capo', h: H(d.tk), j: Date.now() }; M.chi[K(p.name)] = id; delete M.inv[K(p.name)];
      reg(F, p.name + ' ha fondato la fazione'); api.save(); api.log(p.name + ' ha fondato la fazione ' + n + ' nel mondo ' + x.w); aggiorna(x.w, M, null);
    });
    api.onClient('invita', (p, d) => {
      const x = chi(p, d); if (!x.F) return; const { F, M } = x; if (!puo(F, x.m, 'invitare')) return fallo(p, 'Non hai il permesso di invitare.');
      const n = pulito(d && d.n, 24); if (!n) return; if (ilMembro(F, n)) return fallo(p, n + ' è già nella fazione.');
      if (M.chi[K(n)] && M.f[M.chi[K(n)]]) return fallo(p, n + ' è già in un\'altra fazione.');
      if (Object.keys(F.m).length >= C().maxMembri) return fallo(p, 'La fazione è al completo.');
      (M.inv[K(n)] = M.inv[K(n)] || {})[F.id] = { da: p.name, t: Date.now() }; reg(F, p.name + ' ha invitato ' + n); api.save();
      const q = online(x.w).find(q => K(q.name) === K(n)); if (q) { q.send('invito', { id: F.id, n: F.n, da: p.name }); stato(q, x.w, M); }
      fallo(p, 'Invito mandato a ' + n + (q ? '' : ' (lo vedrà quando entra)')); aggiorna(x.w, M, F);
    });
    api.onClient('rispondi', (p, d) => {                                       // chi è stato invitato accetta o rifiuta
      if (bot(p)) return; const x = chi(p, d); if (!x.M) return; const M = x.M, id = String(d && d.id || ''), F = M.f[id], I = M.inv[K(p.name)];
      if (!F || !I || !I[id]) return; delete I[id];
      if (!d.si) { reg(F, p.name + ' ha rifiutato l\'invito'); api.save(); aggiorna(x.w, M, F); return; }
      if (M.chi[K(p.name)] && M.f[M.chi[K(p.name)]]) return fallo(p, 'Sei già in una fazione.');
      if (!d.tk || String(d.tk).length < 16 || Object.keys(F.m).length >= C().maxMembri) return;
      entra(M, F, p.name, H(d.tk)); reg(F, p.name + ' è entrato nella fazione'); api.save(); aggiorna(x.w, M, F); mandaCitta(x.w, M, F, p);
    });
    api.onClient('chiedi', (p, d) => {                                         // chiedere di entrare
      if (bot(p)) return; const x = chi(p, d); if (!x.M) return; const M = x.M, F = M.f[String(d && d.id || '')];
      if (!F || (M.chi[K(p.name)] && M.f[M.chi[K(p.name)]]) || !d.tk || String(d.tk).length < 16) return;
      F.req[K(p.name)] = { n: p.name, h: H(d.tk), t: Date.now() }; reg(F, p.name + ' chiede di entrare'); api.save();
      fallo(p, 'Richiesta mandata a ' + F.n + ': il capo o lo staff ti risponderanno.'); aggiorna(x.w, M, F);
    });
    api.onClient('accogli', (p, d) => {                                        // il capo o lo staff rispondono a una richiesta
      const x = chi(p, d); if (!x.F) return; const { F, M } = x; if (!puo(F, x.m, 'invitare')) return fallo(p, 'Non hai il permesso di accogliere.');
      const R = F.req[K(d && d.n)]; if (!R) return; delete F.req[K(d.n)];
      if (d.si && !(M.chi[K(R.n)] && M.f[M.chi[K(R.n)]]) && Object.keys(F.m).length < C().maxMembri) { entra(M, F, R.n, R.h); reg(F, p.name + ' ha accolto ' + R.n); const q = online(x.w).find(q => K(q.name) === K(R.n)); if (q) mandaCitta(x.w, M, F, q); }
      else reg(F, p.name + ' ha respinto ' + R.n);
      api.save(); aggiorna(x.w, M, F);
    });
    api.onClient('ruolo', (p, d) => {
      const x = chi(p, d); if (!x.F) return; const { F, M, m } = x; const t = ilMembro(F, d && d.n), r = String(d && d.r || '');
      if (!t || t.r === 'capo' || !F.ru[r]) return; if (!puo(F, m, 'espellere')) return fallo(p, 'Non hai il permesso di cambiare i ruoli.');
      if (m.r !== 'capo' && (t.r === 'staff' || r === 'staff')) return fallo(p, 'Solo il capo nomina e toglie lo staff.');
      t.r = r; reg(F, p.name + ' ha dato a ' + t.n + ' il ruolo ' + r); api.save(); aggiorna(x.w, M, F);
    });
    api.onClient('caccia', (p, d) => {
      const x = chi(p, d); if (!x.F) return; const { F, M, m } = x; const t = ilMembro(F, d && d.n);
      if (!t || t.r === 'capo' || K(t.n) === K(p.name)) return; if (!puo(F, m, 'espellere')) return fallo(p, 'Non hai il permesso di espellere.');
      if (m.r !== 'capo' && t.r === 'staff') return fallo(p, 'Solo il capo può espellere lo staff.');
      togli(M, F, t.n); reg(F, p.name + ' ha espulso ' + t.n); api.save(); aggiorna(x.w, M, F);
      const q = online(x.w).find(q => K(q.name) === K(t.n)); if (q) { q.send('fuori', { id: F.id, n: F.n }); stato(q, x.w, M); }
    });
    api.onClient('permessi', (p, d) => {                                       // solo il capo: i permessi di un ruolo
      const x = chi(p, d); if (!x.F || x.m.r !== 'capo') return; const { F, M } = x; const r = String(d && d.r || '');
      if (!F.ru[r]) return; F.ru[r].p = (Array.isArray(d.p) ? d.p : []).filter(k => PERMS.includes(k)); reg(F, 'Il capo ha cambiato i permessi del ruolo ' + r); api.save(); aggiorna(x.w, M, F);
    });
    api.onClient('nuovoRuolo', (p, d) => {
      const x = chi(p, d); if (!x.F || x.m.r !== 'capo') return; const { F, M } = x; const r = pulito(d && d.r, 18).toLowerCase();
      if (!r || r === 'capo' || F.ru[r]) return fallo(p, 'Questo ruolo c\'è già, o il nome non va bene.'); if (Object.keys(F.ru).length >= C().maxRuoli) return fallo(p, 'Troppi ruoli.');
      F.ru[r] = { p: (Array.isArray(d.p) ? d.p : []).filter(k => PERMS.includes(k)) }; reg(F, 'Il capo ha creato il ruolo ' + r); api.save(); aggiorna(x.w, M, F);
    });
    api.onClient('togliRuolo', (p, d) => {
      const x = chi(p, d); if (!x.F || x.m.r !== 'capo') return; const { F, M } = x; const r = String(d && d.r || '');
      if (!F.ru[r] || r === 'recluta' || r === 'staff') return; delete F.ru[r]; for (const k in F.m) if (F.m[k].r === r) F.m[k].r = 'recluta';
      reg(F, 'Il capo ha tolto il ruolo ' + r); api.save(); aggiorna(x.w, M, F);
    });
    api.onClient('capo', (p, d) => {                                           // passare il comando
      const x = chi(p, d); if (!x.F || x.m.r !== 'capo') return; const { F, M, m } = x; const t = ilMembro(F, d && d.n); if (!t || t === m) return;
      t.r = 'capo'; m.r = 'staff'; F.capo = t.n; if (F.set) F.set.capo = t.n; reg(F, p.name + ' ha passato il comando a ' + t.n); api.save(); aggiorna(x.w, M, F); mandaCitta(x.w, M, F);
    });
    api.onClient('esci', (p, d) => {
      const x = chi(p, d); if (!x.F) return; const { F, M, m } = x;
      if (m.r === 'capo') { const L = Object.values(F.m).filter(q => q !== m).sort((a, b) => (b.r === 'staff') - (a.r === 'staff') || a.j - b.j);
        if (!L.length) { sciogli(x.w, M, F); api.save(); stato(p, x.w, M); return } L[0].r = 'capo'; F.capo = L[0].n; reg(F, L[0].n + ' è il nuovo capo'); }
      togli(M, F, p.name); reg(F, p.name + ' è uscito dalla fazione'); api.save(); stato(p, x.w, M); aggiorna(x.w, M, F); mandaCitta(x.w, M, F);
    });
    api.onClient('sciogli', (p, d) => {
      const x = chi(p, d); if (!x.F || x.m.r !== 'capo') return; const { F, M } = x; const L = online(x.w).filter(q => M.chi[K(q.name)] === F.id);
      sciogli(x.w, M, F); api.save(); for (const q of L) { q.send('fuori', { id: F.id, n: F.n }); stato(q, x.w, M); }
    });
    api.onClient('nonCondividere', (p, d) => {
      const x = chi(p, d); if (!x.F || x.m.r !== 'capo' || !x.F.set) return; const { F, M } = x; reg(F, 'Il capo ha ripreso per sé ' + F.set.n); F.set = null; api.save();
      for (const q of online(x.w)) if (M.chi[K(q.name)] === F.id) q.send('citta', { fid: F.id, k: null }); aggiorna(x.w, M, F);
    });
    // la città comune: arriva a pezzi; il capo la mette in comune, gli altri la cambiano dove il loro ruolo lo permette
    api.onClient('citta', (p, d) => {
      const x = chi(p, d); if (!x.F || !d) return; const { F, M, m } = x;
      const id = String(d.id || '').slice(0, 16), i = d.i | 0, n = d.n | 0, s = String(d.s || ''); if (!id || n < 1 || n > 80 || i < 0 || i >= n) return;
      const key = p.name + '|' + id; let B = pezzi.get(key); if (!B) { B = { n, p: [], t: Date.now() }; pezzi.set(key, B); } B.p[i] = s;
      for (const [k, b] of pezzi) if (Date.now() - b.t > 60000) pezzi.delete(k);
      if (B.p.filter(v => v != null).length < n) return; pezzi.delete(key); const txt = B.p.join('');
      if (txt.length > C().maxCittaKB * 1024) return fallo(p, 'La città è troppo grande per essere messa in comune.');
      let N; try { N = JSON.parse(txt); } catch (e) { return; } if (!N || typeof N !== 'object' || !/^tw:-?\d{1,4},-?\d{1,4}$/.test(String(N.k || ''))) return;
      if (d.nuova) N = N.S || N;
      if (!F.set || d.nuova) {
        if (m.r !== 'capo') return fallo(p, 'Solo il capo mette in comune una città.');
        N.fz = F.id; F.set = { k: N.k, n: pulito(N.n, 28), lv: N.lv | 0, v: 1, by: p.name, capo: F.capo, S: N }; reg(F, p.name + ' ha messo in comune ' + F.set.n);
      } else {
        if (N.k !== F.set.k) return; const O = F.set.S, out = Object.assign({}, O), set = N.set && typeof N.set === 'object' ? N.set : {}, del = Array.isArray(N.del) ? N.del : []; let ch = 0, no = 0;
        // arrivano solo le parti cambiate da chi scrive: ognuna passa se il suo ruolo la può toccare
        for (const k of Object.keys(set).concat(del)) {
          if (k === 'k' || k === 'fz' || k === 'fzo') continue; const pk = KEYP[k], ok = m.r === 'capo' || (pk && puo(F, m, pk));
          if (!ok) { if (pk) no++; continue; }
          if (del.includes(k) && !(k in set)) delete out[k]; else out[k] = set[k]; ch++;
        }
        if (no && !ch) return fallo(p, 'Il tuo ruolo non permette questa modifica: chiedi il permesso al capo.');
        if (!ch) return; F.set.S = out; F.set.v++; F.set.by = p.name; F.set.n = pulito(out.n, 28); F.set.lv = out.lv | 0;
      }
      api.save(); mandaCitta(x.w, M, F); aggiorna(x.w, M, F);
    });
    api.on('join', p => { if (!bot(p)) api.after(2500, () => { const w = wDi(p), M = w && S.w[w]; if (M && (M.chi[K(p.name)] || M.inv[K(p.name)])) stato(p, w, M); }); });
    api.command('fazione', 'la tua fazione di Tomorrow (si gestisce dal registro, tasto U)', p => {
      const w = wDi(p), M = S.w[w], id = M && M.chi[K(p.name)], F = id && M.f[id];
      if (!F) return 'Non sei in una fazione. Nel registro (tasto U → Fazione) puoi fondarne una o chiedere di entrare.';
      return 'Fazione ' + F.n + ' · capo ' + F.capo + ' · ' + Object.keys(F.m).length + ' membri' + (F.set ? ' · città comune: ' + F.set.n : '');
    });
    // 1.1 (gioco 7.45): le guerre programmate. Il capo (o chi può addestrare l'esercito) dichiara guerra a una fazione che ha
    // una città comune, con qualche minuto di preavviso. All'ora stabilita la città diventa un campo di battaglia per
    // guerraMinuti: gli attaccanti abbattono le mura con le catapulte e devono tenere la piazza (30 secondi senza difensori
    // vicini). Se ce la fanno prendono bottinoGuerra del tesoro della città; se no vincono i difensori.
    const guerre = M => (M.g = M.g || []);
    const vistaG = G => ({ id: G.id, a: G.a, an: G.an, d: G.d, dn: G.dn, k: G.k, cn: G.cn, at: G.at, end: G.end, st: G.st, presa: G.presa, win: G.win, bot: G.bot || 0, mura: Object.keys(G.mura) });
    const elencoF = M => Object.values(M.f).map(F => ({ id: F.id, n: F.n, citta: F.set ? { k: F.set.k, n: F.set.n } : null }));
    const mandaG = (w, M, solo) => { const d = { w, L: guerre(M).map(vistaG), fz: elencoF(M), now: Date.now() }; for (const q of solo ? [solo] : online(w)) q.send('guerre', d); };
    const diAMondo = (w, testo) => { for (const q of online(w)) q.tell(testo); };
    api.onClient('guerre', (p, d) => { if (bot(p)) return; const x = chi(p, d); if (!x.M) return; mandaG(x.w, x.M, p); });
    api.onClient('guerra', (p, d) => {
      const x = chi(p, d); if (!x.F) return; const { F, M, m } = x;
      if (!(m.r === 'capo' || puo(F, m, 'esercito'))) return fallo(p, 'Solo il capo (o chi comanda l\'esercito) può dichiarare guerra.');
      const T = M.f[String(d && d.id || '')]; if (!T || T === F) return; if (!T.set) return fallo(p, T.n + ' non ha una città comune da assediare.');
      if (!F.set) return fallo(p, 'Prima la tua fazione deve mettere in comune una città.');
      const now = Date.now(), L = guerre(M);
      if (L.some(G => G.st !== 'fine' && (G.a === F.id || G.d === F.id))) return fallo(p, 'La tua fazione è già in guerra (o ne ha una in programma).');
      if (L.some(G => G.st !== 'fine' && (G.a === T.id || G.d === T.id))) return fallo(p, T.n + ' è già in guerra con qualcun altro.');
      const pausa = (+C().pausaGuerraOre || 0) * 3600000; if (L.some(G => G.st === 'fine' && ((G.a === F.id && G.d === T.id) || (G.a === T.id && G.d === F.id)) && now - G.end < pausa)) return fallo(p, 'Avete già combattuto da poco: aspettate qualche ora.');
      const pm = Math.max(0, +C().preavvisoMinimo || 0), min = Math.max(pm, Math.min(180, Math.round(d.min == null ? 15 : +d.min))), at = now + min * 60000, dur = Math.max(5, +C().guerraMinuti || 20) * 60000;
      const G = { id: crypto.randomBytes(4).toString('hex'), a: F.id, an: F.n, d: T.id, dn: T.n, k: T.set.k, cn: T.set.n, at, end: at + dur, st: 'attesa', mura: {}, presa: 0, win: null, t: now, by: p.name };
      L.push(G); reg(F, p.name + ' ha dichiarato guerra a ' + T.n + ' (assedio di ' + T.set.n + ' fra ' + min + ' minuti)'); reg(T, F.n + ' ci ha dichiarato guerra: assedio di ' + T.set.n + ' fra ' + min + ' minuti');
      api.save(); diAMondo(x.w, '⚔ ' + F.n + ' ha dichiarato guerra a ' + T.n + ': l\'assedio di ' + T.set.n + ' comincia fra ' + min + ' minuti.'); mandaG(x.w, M); aggiorna(x.w, M, F); aggiorna(x.w, M, T);
    });
    const ultimo = new Map();
    api.onClient('colpo', (p, d) => {
      const x = chi(p, d); if (!x.F || !d) return; const G = guerre(x.M).find(g => g.id === String(d.id || '')); if (!G || G.st !== 'corso' || G.a !== x.F.id) return;
      const L = (Array.isArray(d.c) ? d.c : []).map(String).filter(c => /^\d{1,3},\d{1,3}$/.test(c)).slice(0, 6), k = p.name + '|c', now = Date.now();
      if (!L.length || now - (ultimo.get(k) || 0) < 2500 || Object.keys(G.mura).length > 500) return; ultimo.set(k, now);
      for (const c of L) G.mura[c] = 1; for (const q of online(x.w)) q.send('mura', { w: x.w, id: G.id, c: L });
    });
    api.onClient('ripara', (p, d) => {
      const x = chi(p, d); if (!x.F || !d) return; const G = guerre(x.M).find(g => g.id === String(d.id || '')); if (!G || G.st !== 'corso' || G.d !== x.F.id) return;
      const c = String(d.c || ''), k = p.name + '|r', now = Date.now(); if (!G.mura[c] || now - (ultimo.get(k) || 0) < 1500) return; ultimo.set(k, now);
      delete G.mura[c]; for (const q of online(x.w)) q.send('mura', { w: x.w, id: G.id, r: [c] });
    });
    api.onClient('presa', (p, d) => {
      const x = chi(p, d); if (!x.F || !d) return; const M = x.M, G = guerre(M).find(g => g.id === String(d.id || '')); if (!G || G.st !== 'corso' || G.a !== x.F.id) return;
      const now = Date.now(); if (d.dif) { if (G.presa > 0) { G.presa = Math.max(0, G.presa - 2); mandaG(x.w, M); } return; }
      if (now - (G.ultP || 0) < 1800) return; G.ultP = now; G.presa = Math.min(30, G.presa + 2);
      if (G.presa >= 30) {
        G.st = 'fine'; G.win = 'a'; G.end = now; const D = M.f[G.d], A = M.f[G.a]; let bot = 0;
        if (D && D.set && D.set.S) { const c = D.set.S.cash | 0; bot = Math.floor(c * Math.max(0, Math.min(1, +C().bottinoGuerra || 0))); D.set.S.cash = c - bot; D.set.v++; reg(D, 'Assedio perduto: ' + G.an + ' ha preso ' + bot + ' monete dal tesoro'); }
        if (A && A.set && A.set.S && bot) { A.set.S.cash = (A.set.S.cash | 0) + bot; A.set.v++; } if (A) reg(A, 'Assedio vinto contro ' + G.dn + (bot ? ': +' + bot + ' monete' : ''));
        G.bot = bot; api.save(); diAMondo(x.w, '🏴 ' + G.an + ' ha conquistato la piazza di ' + G.cn + '!' + (bot ? ' Bottino: ' + bot + ' monete.' : ''));
        if (D) mandaCitta(x.w, M, D); if (A) mandaCitta(x.w, M, A);
      }
      mandaG(x.w, M);
    });
    api.every(5000, () => {
      const now = Date.now();
      for (const w in S.w) {
        const M = S.w[w], L = guerre(M); let ch = false;
        for (const G of L) {
          if (G.st === 'attesa' && now >= G.at) { G.st = 'corso'; ch = true; diAMondo(w, '⚔ È cominciato l\'assedio di ' + G.cn + ': ' + G.an + ' contro ' + G.dn + '!'); }
          else if (G.st === 'corso' && now >= G.end) { G.st = 'fine'; G.win = 'd'; ch = true; const D = M.f[G.d]; if (D) reg(D, 'Assedio respinto: ' + G.an + ' si ritira'); const A = M.f[G.a]; if (A) reg(A, 'Assedio fallito contro ' + G.dn); diAMondo(w, '🛡 ' + G.dn + ' ha respinto l\'assedio di ' + G.an + '!'); }
        }
        const keep = L.filter(G => G.st !== 'fine' || now - G.end < 86400000); if (keep.length !== L.length) { M.g = keep; ch = true; }
        if (ch) { api.save(); mandaG(w, M); }
      }
    });
    // pagina per l'admin
    api.route('GET', 'admin', (req, res, x) => {
      const rows = []; for (const w in S.w) for (const F of Object.values(S.w[w].f)) rows.push('<tr><td>' + w + '</td><td>' + F.n + '</td><td>' + F.capo + '</td><td>' + Object.keys(F.m).length + '</td><td>' + (F.set ? F.set.n + ' (v' + F.set.v + ')' : '—') + '</td></tr>');
      x.send('<h2>Fazioni</h2><table border="1" cellpadding="4"><tr><th>Mondo</th><th>Fazione</th><th>Capo</th><th>Membri</th><th>Città comune</th></tr>' + rows.join('') + '</table>');
    }, { admin: true });
  }
};
