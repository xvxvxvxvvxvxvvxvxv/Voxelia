// Boss del mondo: a intervalli un boss enorme compare in una zona selvaggia di ogni stanza, annunciato a tutti.
// La sua vita sta sul server: il gioco di ogni eroe manda i danni che fa, il server li somma e rimanda la vita a tutti,
// e quando il boss cade premia chi l'ha colpito in base al contributo (/boss per lo stato, /boss classifica).
//
// Come nasce il boss nel gioco (verificato sulla 7.8): il gioco non ha una funzione pubblica per creare un nemico, ma tutti
// i nemici nascono da mk(tipo, x, y, id) e finiscono in ents (le dimensioni temporali fanno lo stesso con dimSpawn).
// Il plugin usa mk() con il tipo di un boss esistente (aspetto, attacchi di bossAI e minimappa restano quelli del gioco),
// poi cambia nome, misura e forza e lo segna con wb=1. Ogni colpo dell'eroe passa da hurtE(): per il boss del mondo il plugin
// lo intercetta, mostra il colpo e lo manda al server invece di togliere vita da solo; il boss non passa mai da kill(),
// quindi niente missioni completate per sbaglio, niente bottino doppio e niente dungeonClear. Gli altri nemici non cambiano.
// Ogni gioco muove la sua copia del boss (come gli altri nemici condivisi): conta solo la vita, che è quella del server.
//
// Limiti: i danni arrivano dal gioco del giocatore; il server ne accetta al massimo dannoMaxSec al secondo per eroe,
// così chi usa i trucchi non lo abbatte in un colpo, ma può comunque arrivare a quel tetto. Il server non può togliere
// niente (p.give solo in positivo), quindi il boss non fa perdere oro a nessuno.

// zone selvagge aperte a tutti dall'inizio, con i nemici (verificate sulla 7.8)
const ZONE = { forest: 'Foresta di Elmwood', desert: 'Deserto di Khem', peaks: 'Picchi Gelidi' };
// boss del gioco che si possono usare come base (aspetto e attacchi)
const BASI = ['troll', 'faraone', 'drago_brina', 're_goblin', 'necromante', 'sfinge', 'regina', 'ignis', 'leviatano', 'lich'];
const MIN = 60000;

// codice nel gioco: crea il boss quando sei nella sua zona, manda i tuoi colpi al server e mostra la barra della vita
function nelGioco(ID) {
  const opz = f => { try { return f(); } catch (e) { return undefined; } };
  const USA = { mk: () => mk, ents: () => ents, E: () => E, hurtE: () => hurtE, bfs: () => bfs, WK: () => WK, flt: () => flt, scl: () => scl, msg: () => msg, banner: () => banner };
  const mancanti = Object.keys(USA).filter(k => { try { return USA[k]() === undefined; } catch (e) { return true; } });
  if (mancanti.length) {
    console.warn('[plugin ' + ID + '] mancano: ' + mancanti.join(', '));
    VXP.on(ID, 'stato', () => { opz(() => msg('Il boss del mondo non funziona con questa versione del gioco: avvisa l\'admin del server.')); VXP.send(ID, 'rotto', mancanti); });
    return;
  }
  const EID = 990001;            // id fisso, lontano da quelli del gioco (zone da 0, dimensioni 30000+, evocati 20000+)
  let B = null;                  // il boss attivo nella mia stanza: { k, zk, nome, base, scala, forza, max, hp, fine }
  let pend = 0;                  // danni (in vite) non ancora mandati al server
  const boss = () => opz(() => ents.find(e => e.wb)) || null;
  const qui = () => B && opz(() => Zk) === B.zk && opz(() => started) && opz(() => MODE) === 'story';

  // la casella libera più vicina al centro della mappa tra quelle che l'eroe può raggiungere (stessa mappa → stesso posto)
  function posto() {
    const sx = P.px | 0, sy = P.py | 0, d = bfs(sx, sy), c = N / 2;
    let best = null, bd = Infinity;
    for (let y = 1; y < N - 1; y++) for (let x = 1; x < N - 1; x++) {
      const v = d[y * N + x]; if (v < 0 || !WK(M[y][x]) || v < 6) continue;
      const s = Math.hypot(x - c, y - c); if (s < bd) { bd = s; best = [x, y]; }
    }
    return best || [sx, sy];
  }
  function evoca() {
    if (!qui() || boss()) return;
    const base = E[B.base] ? B.base : 'troll';
    const [x, y] = posto();
    const e = mk(base, x, y, EID);
    e.wb = 1; e.wk = B.k; e.n = B.nome; e.vb = e.mx;                 // vb: una «vita» del boss, come la farebbe il gioco per questa zona
    e.mx = Math.max(1, Math.round(e.vb * B.max)); e.hp = Math.max(1, Math.round(e.vb * B.hp));
    e.at *= B.forza; e.xp = 0;
    if (B.scala !== 1 && e.m) { const m2 = scl(e.m, B.scala); for (const q of Object.keys(e.m)) if (isNaN(q)) m2[q] = e.m[q]; e.m = m2; e.r = (e.r || 1) * Math.min(1.5, B.scala); }
    ents.push(e);
    opz(() => msg('⚔ ' + B.nome + ' è qui!'));
  }
  function via(festa) {
    const e = boss(); if (!e) return;
    const i = ents.indexOf(e); if (i >= 0) ents.splice(i, 1);
    if (festa) {
      opz(() => { if (cineOK() && e.m) ents.push({ k: 'dead', m: e.m, px: e.px, py: e.py, t0: t, boss: 1, fc: e.m.rg ? faceOf(...(e.fd || [0, 1])) : null }); });
      opz(() => jingle([60, 64, 67, 72, 76, 79], .11));
      opz(() => { if (cineOK()) { flash('#fff', .5, 800); burst(e.px, e.py, 50, ['#ffffff', '#ffd84a', '#ff6a2a'], { v: 2, up: 240, gr: 300, d: 1.8, s: 5 }); pillar(e.px, e.py, '255,216,74', 1.6, 80); } });
    } else opz(() => { if (cineOK()) sparks(e.px, e.py, 30, ['#c8b8d8', '#ffffff'], 80); });
  }

  // i colpi dell'eroe al boss del mondo vanno al server; gli altri nemici restano al gioco
  const hurt0 = hurtE;
  hurtE = function (e, d, rem, cr) {
    if (!e || !e.wb) return hurt0.apply(this, arguments);
    // rem=1 qui sono solo i danni nel tempo dei tuoi colpi (bruciature, veleno): i colpi degli altri eroi arrivano dal server,
    // perché per il boss del mondo il gioco non li mette nei messaggi di presenza (NET.hits)
    if (e.shd && e.shd > t) { flt(e, 'Immune', '#9adcff'); return; }
    if (!rem) { opz(() => wmHit()); const d2 = opz(() => tryParry(e, d, rem)); if (typeof d2 === 'number') d = d2; }
    if (!(d > 0)) return;
    e.hp = Math.max(1, e.hp - d); e.fl = .12; e.al = 1;
    flt(e, (cr ? '💥' : '') + d, cr ? '#ffd84a' : '#ffffff'); opz(() => tone(cr ? 330 : 220, .05));
    pend += d / (e.vb || 1);
  };

  // barra della vita in alto, solo nella zona del boss
  const bar = document.createElement('div');
  bar.style.cssText = 'position:fixed;left:50%;top:54px;transform:translateX(-50%);width:min(420px,70vw);z-index:40;pointer-events:none;display:none;' +
    'font:600 13px system-ui,sans-serif;color:#fff;text-shadow:0 1px 2px #000;text-align:center';
  bar.innerHTML = '<div class=n></div><div style="height:10px;margin-top:3px;background:#0009;border:1px solid #ffd84a88;border-radius:5px;overflow:hidden"><div class=v style="height:100%;width:100%;background:linear-gradient(90deg,#c0392b,#ff8a3a);transition:width .3s"></div></div>';
  document.body.appendChild(bar);
  // sui telefoni la barra al centro finirebbe sopra l'HUD e la minimappa (comandi touch della 7.9): se non c'è spazio
  // va sotto l'HUD in alto a sinistra, come la scheda della Discoteca, e il riquadro dei Gruppi si mette sotto
  let pos = '';
  function posizionaBarra() {
    const h = document.getElementById('hud'), r = h && h.getBoundingClientRect();
    const larga = Math.min(420, innerWidth * .7), sotto = !!(r && r.height && r.right + 8 > (innerWidth - larga) / 2);
    const p = sotto ? [Math.round(r.bottom + 8), Math.max(8, Math.round(r.left)), Math.min(240, Math.max(180, Math.round(r.width + 25)))].join() : 'centro';
    if (p === pos) return; pos = p;
    if (!sotto) { Object.assign(bar.style, { left: '50%', top: '54px', transform: 'translateX(-50%)', width: 'min(420px,70vw)', textAlign: 'center' }); return; }
    const [top, left, larg] = p.split(',');
    Object.assign(bar.style, { left: left + 'px', top: top + 'px', transform: 'none', width: 'min(' + larg + 'px,calc(100vw - 32px))', textAlign: 'left' });
  }
  function disegna() {
    const e = boss();
    if (!qui() || !e) { bar.style.display = 'none'; return; }
    const f = Math.max(0, Math.min(1, e.hp / e.mx));
    bar.style.display = 'block'; posizionaBarra();
    bar.querySelector('.n').textContent = '⚔ ' + B.nome + ' · ' + Math.ceil(f * 100) + '%';
    bar.querySelector('.v').style.width = (f * 100) + '%';
  }

  VXP.on(ID, 'stato', d => {
    if (!d || !d.k) return;
    if (B && B.k !== d.k) via(false);
    B = d; evoca(); disegna();
  });
  VXP.on(ID, 'vita', d => {
    if (!B || !d || d.k !== B.k) return;
    B.hp = d.hp; if (d.max > 0) B.max = d.max;
    const e = boss();
    if (e) { const mx = Math.max(1, Math.round(B.max * e.vb)), hp = Math.round(d.hp * e.vb); e.hp = Math.max(1, hp - Math.round(pend * e.vb)); e.mx = mx; }
    disegna();
  });
  VXP.on(ID, 'fine', d => {
    if (!B || !d || d.k !== B.k) return;
    const c = qui(); via(!!d.vinto); B = null; pend = 0; disegna();
    if (d.vinto && (c || d.tuo)) opz(() => banner('Boss sconfitto!', d.tuo || (d.nome + ' è caduto'), 'corona'));
  });
  setInterval(() => {
    if (pend > 0 && B) { VXP.send(ID, 'colpo', { k: B.k, v: +pend.toFixed(4) }); pend = 0; }
    if (qui()) evoca();
    else if (boss()) via(false);
    disegna();
  }, 300);
}

module.exports = {
  name: 'Boss del mondo',
  version: '1.1',
  author: 'Voxelia',
  description: 'Un boss enorme compare in una zona selvaggia: si affronta tutti insieme e il premio va in base al contributo (/boss)',
  defaults: {
    ogniMin: 60,            // minuti tra la fine di un boss e l'arrivo del successivo
    primaMin: 10,           // minuti dall'avvio del server al primo boss
    durataMin: 15,          // se nessuno lo sconfigge entro questi minuti, il boss se ne va
    minGiocatori: 1,        // il boss compare solo nelle stanze con almeno questi eroi online
    vite: 6,                // quanto è resistente con un solo eroe nella stanza, in «vite» (1 vita = il boss come lo farebbe il gioco in quella zona)
    vitePerEroe: 3,         // vite in più per ogni altro eroe: quelli online nella stanza quando compare, più chi arriva dopo e lo colpisce
    dannoMaxSec: 0.1,       // danni massimi accettati per eroe, in vite al secondo (contro i trucchi: 0.1 = almeno 10 secondi per vita)...
    dannoMaxLivello: 0.01,  // ...più questo per ogni livello dell'eroe (al livello 20: 0.3 vite al secondo)
    quotaMin: 0.03,         // parte minima dei danni totali per avere il premio (0.03 = 3%)
    premio: { oro: 1200, xp: 900 },   // premio pieno: ognuno riceve il 40% più il 60% in proporzione ai suoi danni
    // a chi fa più danni un oggetto epico (3), a chi fa almeno il 15% uno raro (2), agli altri uno non comune (1); -1 = nessuno
    oggetti: { primo: 3, bravi: 2, altri: 1 },
    // un boss per zona: nome, boss del gioco da cui prende aspetto e attacchi, misura e forza dei colpi
    boss: [
      { zona: 'forest', nome: 'Vecchio Tronco, il Troll Millenario', base: 'troll', scala: 1.6, forza: 1.2 },
      { zona: 'desert', nome: 'Sfinge delle Sabbie Rosse', base: 'sfinge', scala: 1.4, forza: 1.15 },
      { zona: 'peaks', nome: 'Vermigelo, il Drago Antico', base: 'drago_brina', scala: 1.4, forza: 1.1 }
    ]
  },

  setup(api) {
    const C = api.config, ID = api.id, S = api.store;
    if (!S.eroi || typeof S.eroi !== 'object') S.eroi = {};       // nome in minuscolo → { nome, vittorie, primi, danni }
    if (!Array.isArray(S.storico)) S.storico = [];                // ultimi boss: { quando, nome, zona, stanza, vinto, top: [nomi] }
    const ATT = new Map();                                        // stanza → boss attivo
    const ascolta = [];                                           // funzioni di altri plugin (globalThis.VoxeliaBoss.onSconfitto)

    const num = (v, d, a, b) => { const n = +v; return isFinite(n) ? Math.max(a, Math.min(b, n)) : d; };
    const finto = p => !!(globalThis.VoxeliaStress && globalThis.VoxeliaStress.bot(p));
    const lista = (Array.isArray(C.boss) ? C.boss : []).filter((b, i) => {
      const err = !b || typeof b !== 'object' ? 'non è un oggetto' : !ZONE[b.zona] ? 'zona "' + b.zona + '" non valida (si può usare: ' + Object.keys(ZONE).join(', ') + ')'
        : !BASI.includes(b.base) ? 'base "' + b.base + '" non valida (si può usare: ' + BASI.join(', ') + ')' : '';
      if (err) api.log('boss ' + (i + 1) + ' ignorato: ' + err);
      return !err;
    });
    if (!lista.length) api.log('nessun boss valido in boss.config.json: non comparirà nessun boss');
    if (!(S.prossima > 0)) { S.prossima = Date.now() + num(C.primaMin, 10, 0, 1440) * MIN; api.save(); }

    const vista = A => ({ k: A.k, zk: A.zk, nome: A.nome, base: A.base, scala: A.scala, forza: A.forza, max: +A.max.toFixed(3), hp: +Math.max(0, A.hp).toFixed(3), fine: A.fine });
    const pct = A => Math.max(0, Math.ceil(A.hp / A.max * 100));
    const minuti = ms => Math.max(1, Math.ceil(ms / MIN));
    const classifica = A => [...A.danni.values()].sort((a, b) => b.v - a.v);

    function evoca(room, scelta, chi) {
      if (ATT.has(room)) return 'In questa stanza c\'è già un boss.';
      const b = scelta || lista[Math.floor(Math.random() * lista.length)];
      if (!b) return 'Nessun boss valido nel config.';
      const n = api.players(room).filter(p => !finto(p)).length;
      const ora = Date.now();
      const A = {
        k: ID + ':' + room + ':' + ora, room, zk: b.zona, nome: String(b.nome || 'Boss del mondo').slice(0, 40), base: b.base,
        scala: num(b.scala, 1.4, .5, 2.5), forza: num(b.forza, 1, .2, 5),
        max: num(C.vite, 6, .2, 100) + num(C.vitePerEroe, 3, 0, 50) * Math.max(0, n - 1),
        contati: Math.max(1, n), inizio: ora, fine: ora + num(C.durataMin, 15, 1, 600) * MIN, danni: new Map(), cambiata: false, avvisi: {}
      };
      A.hp = A.max;
      ATT.set(room, A);
      api.broadcast('stato', vista(A), room);
      api.announce('🐉 ' + A.nome + ' è apparso: ' + ZONE[A.zk] + '! Affrontatelo insieme entro ' + minuti(A.fine - ora) + ' min (/boss)', room);
      api.log('boss evocato nella stanza ' + room + ': ' + A.nome + ' (' + A.zk + ', ' + A.max.toFixed(1) + ' vite)' + (chi ? ' da ' + chi : ''));
      return '';
    }
    function chiudi(A, vinto) {
      ATT.delete(A.room);
      const top = classifica(A), tot = top.reduce((a, x) => a + x.v, 0) || 1;
      const premiati = [];
      if (vinto) {
        const P0 = C.premio && typeof C.premio === 'object' ? C.premio : {}, O = C.oggetti && typeof C.oggetti === 'object' ? C.oggetti : {};
        const oro = num(P0.oro, 0, 0, 1e6), xp = num(P0.xp, 0, 0, 1e6), qmin = num(C.quotaMin, .03, 0, 1);
        top.forEach((x, i) => {
          const q = x.v / tot; if (q < qmin) return;
          const r = Math.round(num(i === 0 ? O.primo : q >= .15 ? O.bravi : O.altri, -1, -1, 3));
          const g = Math.round(oro * (.4 + .6 * q)), e = Math.round(xp * (.4 + .6 * q));
          premiati.push({ id: x.id, nome: x.nome, q, testo: [g > 0 && g + ' oro', e > 0 && e + ' XP', r >= 0 && 'un oggetto ' + ['comune', 'non comune', 'raro', 'epico'][r]].filter(Boolean).join(', ') });
          const p = api.player(x.id) || api.player(x.nome);
          if (!p || p.room !== A.room) return;               // uscito prima della fine: niente premio
          try { if (g > 0) p.give('gold', g); if (e > 0) p.give('xp', e); if (r >= 0) p.give('item', 1, r); }
          catch (err) { api.log('premio non consegnato a ' + p.name + ': ' + (err && err.message || err)); }
          if (finto(p)) return;
          const k = x.nome.toLowerCase(), s = S.eroi[k] || (S.eroi[k] = { nome: x.nome, vittorie: 0, primi: 0, danni: 0 });
          s.nome = x.nome; s.vittorie++; s.danni = +(s.danni + x.v).toFixed(3); if (i === 0) s.primi++;
        });
      }
      S.storico.unshift({ quando: Date.now(), nome: A.nome, zona: A.zk, stanza: A.room, vinto: !!vinto, top: top.slice(0, 3).map(x => x.nome) });
      S.storico = S.storico.slice(0, 30);
      if (!ATT.size) S.prossima = Date.now() + num(C.ogniMin, 60, .2, 1440) * MIN;
      api.save();
      for (const o of api.players(A.room)) {
        const me = premiati.find(x => x.id === o.id);
        o.send('fine', { k: A.k, vinto: !!vinto, nome: A.nome, tuo: me ? 'Il tuo contributo: ' + Math.round(me.q * 100) + '% · ' + me.testo : '' });
      }
      if (vinto) {
        api.announce('🏆 ' + A.nome + ' è stato sconfitto! ' + (top.length ? 'I più valorosi: ' + top.slice(0, 3).map(x => x.nome + ' ' + Math.round(x.v / tot * 100) + '%').join(', ') : ''), A.room);
        const info = { nome: A.nome, zona: A.zk, stanza: A.room, eroi: top.map(x => ({ id: x.id, nome: x.nome, quota: x.v / tot })) };
        for (const fn of ascolta) try { fn(info); } catch (e) { api.log('errore in un ascoltatore di VoxeliaBoss: ' + (e && e.message || e)); }
      } else api.announce(A.nome + ' se n\'è andato senza essere sconfitto (vita rimasta ' + pct(A) + '%).', A.room);
      api.log('boss ' + (vinto ? 'sconfitto' : 'andato via') + ' nella stanza ' + A.room + ': ' + A.nome + (top.length ? ' · ' + top.map(x => x.nome + ' ' + x.v.toFixed(2)).join(', ') : ''));
    }

    // i colpi dal gioco: solo dalla stanza e dalla zona del boss, con un tetto al secondo per eroe
    api.onClient('colpo', (p, d) => {
      const A = ATT.get(p.room);
      if (!A || !d || d.k !== A.k || p.zone !== A.zk || !(A.hp > 0)) return;
      let v = +d.v; if (!isFinite(v) || v <= 0) return;
      const ora = Date.now(), cap = num(C.dannoMaxSec, .1, .001, 10) + num(C.dannoMaxLivello, .01, 0, 1) * Math.max(0, p.lv);
      const x = A.danni.get(p.id) || { id: p.id, nome: p.name, v: 0, tok: cap * 2, t: ora, scarti: 0 };
      if (!A.danni.has(p.id)) {
        A.danni.set(p.id, x);
        // un eroe in più rispetto a quelli contati quando è apparso: il boss diventa più resistente
        if (!finto(p) && A.danni.size > A.contati) { const per = num(C.vitePerEroe, 3, 0, 50); A.max += per; A.hp += per; A.contati++; }
      }
      x.tok = Math.min(cap * 2, x.tok + cap * (ora - x.t) / 1000); x.t = ora;
      if (v > x.tok) { x.scarti += v - x.tok; v = x.tok; }
      if (v <= 0) return;
      x.tok -= v; x.v += v; A.hp -= v; A.cambiata = true;
      if (A.hp <= 1e-6) chiudi(A, true);
    });
    api.onClient('rotto', (p, d) => api.log('il gioco di ' + p.name + ' non ha: ' + (Array.isArray(d) ? d.join(', ') : d)));

    api.every(500, () => {
      const ora = Date.now();
      for (const A of [...ATT.values()]) {
        if (ora >= A.fine) { chiudi(A, false); continue; }
        if (A.cambiata) { A.cambiata = false; api.broadcast('vita', { k: A.k, hp: +Math.max(0, A.hp).toFixed(3), max: +A.max.toFixed(3) }, A.room); }
        const resta = A.fine - ora;
        if (resta < 2 * MIN && A.fine - A.inizio > 5 * MIN && !A.avvisi.fine) { A.avvisi.fine = 1; api.announce('⏳ ' + A.nome + ' se ne va tra 2 minuti! Vita rimasta ' + pct(A) + '%', A.room); }
        if (A.hp <= A.max / 2 && !A.avvisi.meta) { A.avvisi.meta = 1; api.announce('⚔ ' + A.nome + ' è a metà vita! (' + ZONE[A.zk] + ')', A.room); }
      }
      if (ATT.size || ora < S.prossima || !lista.length) return;
      const min = num(C.minGiocatori, 1, 1, 100), stanze = api.rooms();
      for (const room of Object.keys(stanze)) if (api.players(room).filter(p => !finto(p)).length >= min) evoca(room);
    });

    api.client('(' + nelGioco.toString() + ')(' + JSON.stringify(ID) + ');');

    // chi entra in una stanza col boss lo riceve (e lo vede appena va nella sua zona)
    api.on('join', p => api.after(2500, () => { const o = api.player(p.id), A = o && ATT.get(o.room); if (A) { o.send('stato', vista(A)); o.tell(stato(o)); } }));
    api.on('zone', (p, z) => { const A = ATT.get(p.room); if (A && z === A.zk) p.send('stato', vista(A)); });

    function stato(p) {
      const A = ATT.get(p.room);
      if (!A) {
        const m = Math.ceil((S.prossima - Date.now()) / MIN);
        return 'Nessun boss del mondo in questo momento. ' + (ATT.size ? 'Ce n\'è uno in un\'altra stanza.' : m > 0 ? 'Il prossimo arriva tra circa ' + m + ' min.' : 'Il prossimo arriva appena ci sono abbastanza eroi online.');
      }
      const top = classifica(A), tot = top.reduce((a, x) => a + x.v, 0) || 1, mio = A.danni.get(p.id);
      return '🐉 ' + A.nome + ' · ' + ZONE[A.zk] + ' · vita ' + pct(A) + '% · se ne va tra ' + minuti(A.fine - Date.now()) + ' min' +
        (top.length ? '\nI più valorosi: ' + top.slice(0, 3).map(x => x.nome + ' ' + Math.round(x.v / tot * 100) + '%').join(', ') : '') +
        (mio ? '\nIl tuo contributo: ' + Math.round(mio.v / tot * 100) + '%' : '\nVai ' + (p.zone === A.zk ? 'a cercarlo al centro della zona!' : 'in ' + ZONE[A.zk] + ' e cercalo al centro della mappa.'));
    }
    api.command('boss', 'il boss del mondo: dove si trova e quanta vita gli resta (/boss classifica per i più valorosi)', (p, args) => {
      if (/^(classifica|top)$/i.test(args[0] || '')) {
        const L = Object.values(S.eroi).sort((a, b) => b.vittorie - a.vittorie || b.danni - a.danni).slice(0, 10);
        return L.length ? 'Cacciatori di boss:\n' + L.map((v, k) => (k + 1) + '. ' + v.nome + ' · ' + v.vittorie + ' boss' + (v.primi ? ', ' + (v.primi === 1 ? 'una volta' : v.primi + ' volte') + ' il più valoroso' : '')).join('\n') : 'Nessun boss del mondo è ancora stato sconfitto.';
      }
      return stato(p);
    });

    // per gli altri plugin (per esempio i Gruppi d'avventura): stato e avviso quando un boss cade
    globalThis.VoxeliaBoss = {
      attivi: () => [...ATT.values()].map(A => Object.assign(vista(A), { stanza: A.room })),
      onSconfitto: fn => { if (typeof fn === 'function') ascolta.push(fn); }
    };
    api.on('stop', () => { for (const A of ATT.values()) api.broadcast('fine', { k: A.k, vinto: false }, A.room); ATT.clear(); if (globalThis.VoxeliaBoss) delete globalThis.VoxeliaBoss; });

    // pagine web: pubblica con i boss in corso e la classifica, admin con i pulsanti
    const e = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
    const STILE = '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font:14px system-ui,sans-serif;background:#141822;color:#e8ecf4;margin:16px;max-width:760px}' +
      'h1,h2{font-family:Georgia,serif;color:#ffd84a}table{border-collapse:collapse;width:100%}td,th{padding:5px 8px;border-bottom:1px solid #fff2;text-align:left}small{opacity:.7}' +
      '.box{background:#0003;border-radius:8px;padding:10px 12px;margin:10px 0}.bar{height:10px;background:#0006;border-radius:5px;overflow:hidden;margin:6px 0}.bar i{display:block;height:100%;background:linear-gradient(90deg,#c0392b,#ff8a3a)}' +
      'button,select{padding:5px 9px;border-radius:4px;border:0;margin:2px;font:inherit}button{cursor:pointer;background:#f5b942}a{color:#ffd84a}</style>';
    const quando = t => new Date(t).toLocaleString('it-IT');
    function inCorso(adm) {
      if (!ATT.size) { const m = Math.ceil((S.prossima - Date.now()) / MIN); return '<div class=box>Nessun boss in giro. ' + (m > 0 ? 'Il prossimo tra circa ' + m + ' min.' : 'Il prossimo appena ci sono abbastanza eroi online.') + '</div>'; }
      return [...ATT.values()].map(A => {
        const top = classifica(A), tot = top.reduce((a, x) => a + x.v, 0) || 1;
        return '<div class=box><b>🐉 ' + e(A.nome) + '</b> · ' + e(ZONE[A.zk]) + (adm ? ' · stanza <b>' + e(A.room) + '</b> · ' + A.max.toFixed(1) + ' vite' : '') + ' · se ne va tra ' + minuti(A.fine - Date.now()) + ' min' +
          '<div class=bar><i style="width:' + pct(A) + '%"></i></div>' + pct(A) + '% di vita' +
          (top.length ? '<br><small>' + top.slice(0, adm ? 20 : 5).map(x => e(x.nome) + ' ' + Math.round(x.v / tot * 100) + '%' + (adm && x.scarti > .01 ? ' (scartati ' + x.scarti.toFixed(2) + ' vite oltre il tetto)' : '')).join(' · ') + '</small>' : '') +
          (adm ? '<br><button style="background:#a33;color:#fff" onclick=\'if(confirm("Mandare via il boss?"))fai("annulla",{stanza:' + e(JSON.stringify(A.room)) + '})\'>Mandalo via</button>' : '') + '</div>';
      }).join('');
    }
    function albo() {
      const L = Object.values(S.eroi).sort((a, b) => b.vittorie - a.vittorie || b.danni - a.danni).slice(0, 20);
      return '<h2>Cacciatori di boss</h2>' + (L.length ? '<table><tr><th></th><th>Eroe</th><th>Boss</th><th>Più valoroso</th></tr>' + L.map((v, k) => '<tr><td>' + (k + 1) + '</td><td>' + e(v.nome) + '</td><td>' + v.vittorie + '</td><td>' + v.primi + '</td></tr>').join('') + '</table>' : '<p>Nessun boss del mondo è ancora stato sconfitto.</p>') +
        '<h2>Ultimi boss</h2>' + (S.storico.length ? '<table>' + S.storico.slice(0, 15).map(h => '<tr><td><small>' + e(quando(h.quando)) + '</small></td><td>' + e(h.nome) + '<br><small>' + e(ZONE[h.zona] || h.zona) + '</small></td><td>' + (h.vinto ? '🏆 ' + e(h.top.join(', ')) : '<small>se n\'è andato</small>') + '</td></tr>').join('') + '</table>' : '<p>Ancora nessun boss.</p>');
    }
    api.route('GET', '/', (req, res, x) => x.send(STILE + '<title>Boss del mondo</title><h1>🐉 Boss del mondo</h1>' + inCorso(false) + albo() + '<script>setTimeout(()=>location.reload(),15000)</script>'));
    api.route('GET', 'admin', (req, res, x) => {
      const stanze = Object.keys(api.rooms());
      x.send(STILE + '<title>Boss del mondo · admin</title><h1>🐉 Boss del mondo · admin</h1>' +
        '<p>Un boss ogni ' + num(C.ogniMin, 60, .2, 1440) + ' min, resta ' + num(C.durataMin, 15, 1, 600) + ' min · ' + lista.length + ' boss validi (si cambiano in boss.config.json). <a href="./">Pagina pubblica</a></p>' +
        inCorso(true) +
        (stanze.length ? '<div class=box>Evoca ora: <select id=r>' + stanze.map(r => '<option>' + e(r) + '</option>').join('') + '</select> <select id=b><option value="">a caso</option>' +
          lista.map((b, i) => '<option value="' + i + '">' + e(b.nome) + ' (' + e(ZONE[b.zona]) + ')</option>').join('') + '</select> <button onclick=\'fai("evoca",{stanza:r.value,i:b.value})\'>Evoca</button></div>' : '<p><small>Nessuna stanza con eroi online.</small></p>') +
        albo() +
        '<script>function fai(a,b){fetch("admin/"+a,{method:"POST",headers:{"x-voxelia":"1","Content-Type":"application/json"},body:JSON.stringify(b)}).then(r=>r.json()).then(j=>{if(j.ok)location.reload();else alert(j.err||"Errore")})}setTimeout(()=>location.reload(),15000)</script>');
    }, { admin: true });
    api.route('POST', 'admin/*', (req, res, x) => x.body(b => {
      b = b && typeof b === 'object' ? b : {};
      const room = String(b.stanza || '');
      if (x.path === '/admin/evoca') {
        if (!api.rooms()[room]) return x.json(400, { err: 'Nessun eroe online in quella stanza.' });
        const i = b.i === '' || b.i == null ? -1 : parseInt(b.i, 10);
        const r = evoca(room, lista[i] || null, 'admin'); return r ? x.json(400, { err: r }) : x.json({ ok: 1 });
      }
      if (x.path === '/admin/annulla') { const A = ATT.get(room); if (!A) return x.json(400, { err: 'Nessun boss in quella stanza.' }); chiudi(A, false); return x.json({ ok: 1 }); }
      x.json(404, { err: 'azione sconosciuta' });
    }), { admin: true });
  }
};
