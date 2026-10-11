// Discoteca: /discoteca porta l'eroe in una discoteca generata dal plugin, con un DJ a cui chiedere i brani.
// Dentro, chiunque può parlare con il DJ (o scrivere /dj <link>) e mettere in coda un brano da YouTube o da SoundCloud.
// La coda è una sola per ogni stanza del server ed è condivisa da tutti quelli che sono in discoteca: tutti sentono
// lo stesso brano nello stesso punto. Mentre suona un brano la musica del gioco tace; quando il DJ è libero
// suona una base house del gioco. Pista, fari, laser e casse vanno a tempo con la musica.
// In città c'è un portale per la discoteca, in piazza accanto alla strada sud (di fronte a quello del Borgo delle Case).
// Mentre il DJ è occupato, parlandogli si vede la coda, si vota per saltare o mettere in pausa il brano
// e si regola il volume. Si esce dalla porta: si torna nel punto da cui si era partiti.
// I fari seguono il tempo del brano (124 battiti al minuto, o quelli scritti dopo il link): YouTube e
// SoundCloud non lasciano leggere l'audio alla pagina, quindi il ritmo non si può ricavare dal suono.

// ======================= codice nel gioco =======================
function nelGioco(ID, CFG) {
  const ZK = 'in_discoteca';
  const opz = f => { try { return f(); } catch (e) { return undefined; } };
  // nomi del gioco che il plugin usa: se un aggiornamento ne toglie uno, la discoteca si spegne con un avviso invece di rompere il gioco
  const USA = { Z: () => Z, NPCS: () => NPCS, TRK: () => TRK, AU: () => AU, load: () => load, irisGo: () => irisGo, act: () => act, tile: () => tile,
    lights: () => lights, mstep: () => mstep, genTown: () => genTown, po: () => po, nearFree: () => nearFree, box: () => box, PX: () => PX, PY: () => PY, WK: () => WK, msg: () => msg, auVol: () => auVol };
  const mancanti = Object.keys(USA).filter(k => { try { return USA[k]() === undefined; } catch (e) { return true; } });
  const ROTTO = 'La discoteca non funziona con questa versione del gioco: avvisa l\'admin del server.';
  if (mancanti.length) { console.warn('[plugin ' + ID + '] mancano: ' + mancanti.join(', ')); VXP.on(ID, 'entra', () => { opz(() => msg(ROTTO)); VXP.send(ID, 'rotto', mancanti); }); return; }

  // ---------- la sala ----------
  // ♫ cassa · ◘ consolle del DJ · ¡ palo dei fari · C bancone · b botte · n panca · T tavolo · p pianta · la pista va da (4,4) a (13,12)
  const LAY = [
    '##################',
    '#♫♫............♫♫#',
    '#♫♫...◘◘◘◘◘◘...♫♫#',
    '#¡..............¡#',
    '#n.............Cb#',
    '#nT............Cb#',
    '#n.............Cb#',
    '#¡.............Cb#',
    '#n.............Cb#',
    '#nT............Cb#',
    '#n.............Cb#',
    '#¡..............¡#',
    '#................#',
    '#p..............p#',
    '#................#',
    '#p..............p#',
    '#................#',
    '########D#########'];
  const PISTA = [4, 4, 13, 12];
  const inPista = (x, y) => x >= PISTA[0] && x <= PISTA[2] && y >= PISTA[1] && y <= PISTA[3];
  NPCS.vxp_dj = { n: CFG.nomeDj, c: '#1e1a2a', hat: '#ff3fbf', ln: ['Dammi un link e faccio ballare tutti!'] };
  // dalla 7.3 il gioco disegna ogni personaggio con una descrizione in NPS (pelle|capelli|barba|cappello|dettagli|attrezzo|movimento|corpo):
  // senza, il DJ avrebbe un aspetto a caso e scuro, e al buio della sala non si vedrebbe
  opz(() => { if (typeof NPS === 'object' && !NPS.vxp_dj) NPS.vxp_dj = 'b|spiky:#ff3fbf|none|cap|glasses,necklace,stars|none|dance|n'; });
  Z[ZK] = { n: CFG.nome, lv: 0, N: LAY.length, bg: '#06040a', mus: 'vxp_disco', int: 1, fl: '#1a1522', fl2: '#1f1929', wall: '#2a2238', np: [['vxp_dj', 8, 1]], lay: LAY };
  // base house per quando il DJ è libero: il motore del gioco suona basso e accordi, la cassa in quattro la aggiungiamo noi
  TRK.vxp_disco = { bpm: 124, root: 45, sc: 'min', pr: [0, 5, 2, 6], ld: 'triangle', dn: .3, arp: 1, pad: 1, dr: 0, bs: [2, 6, 10, 14] };
  const mstep0 = mstep;
  mstep = function (T, s, b, t0, dt, spb) {
    mstep0.apply(this, arguments);
    if (T === TRK.vxp_disco) try {
      if (s % 4 === 0) kick(t0, .26);
      if (s % 4 === 2) nz(t0, .04, .05, 9000, 'highpass');
      if (s === 4 || s === 12) nz(t0, .1, .07, 1500, 'bandpass');
    } catch (e) {}
  };

  // ---------- stato dal server ----------
  let ST = null, OFF = 0, PL = null, dentro = false, back = null, muto = false, pan = null, wid = null, ultimoN = 0;
  const LS = { get(k, d) { try { const v = localStorage.getItem('vxp_disco_' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem('vxp_disco_' + k, JSON.stringify(v)); } catch (e) {} } };
  let VOL = LS.get('vol', 70), FX = LS.get('fx', 'pieni');
  const ora = () => Date.now() + OFF;
  const pos = () => !ST || !ST.cur ? 0 : ST.cur.pausa ? ST.cur.pos : Math.max(0, ora() - ST.cur.t0);
  const avvisa = s => { try { msg(s); } catch (e) {} };
  const e2 = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const mmss = ms => { const s = Math.max(0, Math.round(ms / 1000)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };

  // ---------- ritmo ----------
  // battiti dall'inizio: dal brano del DJ, dalla base house del gioco, o lenti se non suona niente
  function battito() {
    if (ST && ST.cur && PL && PL.suona && !ST.cur.pausa) return { b: pos() / 60000 * (ST.cur.bpm || CFG.bpm), e: 1 };
    const ac = AU.ac;
    if (ac && !muto && AU.tr === 'vxp_disco' && ac.state === 'running' && SET.muOn && SET.mu > 0) {
      const dt = 60 / TRK.vxp_disco.bpm / 4, passi = AU.bar * 16 + AU.st - (AU.nt - ac.currentTime) / dt;
      return { b: passi / 4, e: .75 };
    }
    return { b: performance.now() / 1000 * .5, e: .25 };
  }
  let RB = { b: 0, e: 0, p: 0, n: 0 };
  function aggiornaRitmo() { const r = battito(), f = r.b - Math.floor(r.b); RB = { b: r.b, e: r.e, p: Math.exp(-f * 5) * r.e, n: Math.floor(r.b) }; }
  const hsl = (h, s, l, a) => 'hsla(' + (((h % 360) + 360) % 360) + ',' + s + '%,' + l + '%,' + a + ')';

  // ---------- disegno: pista, casse, consolle, fari ----------
  function rombo(x, y, z, k, col) {
    const a = (1 - k) / 2;
    g.fillStyle = col; g.beginPath();
    g.moveTo(PX(x + a, y + a), PY(x + a, y + a, z)); g.lineTo(PX(x + 1 - a, y + a), PY(x + 1 - a, y + a, z));
    g.lineTo(PX(x + 1 - a, y + 1 - a), PY(x + 1 - a, y + 1 - a, z)); g.lineTo(PX(x + a, y + 1 - a), PY(x + a, y + 1 - a, z)); g.closePath(); g.fill();
  }
  function piastra(x, y) {
    const n = RB.n, schema = Math.floor(n / 16) % 4, cx = (PISTA[0] + PISTA[2]) / 2 + .5, cy = (PISTA[1] + PISTA[3]) / 2 + .5;
    let h, acc;
    if (schema === 0) { h = ((x + y + n) % 2) * 180 + n * 23; acc = (x + y + n) % 2 === 0; }
    else if (schema === 1) { const d = Math.round(Math.hypot(x + .5 - cx, y + .5 - cy)); h = d * 40 + n * 30; acc = d % 3 === n % 3; }
    else if (schema === 2) { h = x * 30 + n * 15; acc = (x + n) % 4 < 2; }
    else { const r = Math.sin((x * 12.9898 + y * 78.233 + n * 3.1) * 43758.5) * 1e4; h = (r - Math.floor(r)) * 360; acc = (r - Math.floor(r)) > .45; }
    const l = FX === 'spenti' ? 18 : acc ? 30 + RB.p * 32 : 14 + RB.p * 6;
    rombo(x, y, 0, .92, hsl(h, 85, l, 1));
    if (acc && FX !== 'spenti') { g.globalCompositeOperation = 'lighter'; rombo(x, y, .2, .6, hsl(h, 100, 60, .25 + RB.p * .35)); g.globalCompositeOperation = 'source-over'; }
  }
  function cassa(x, y) {
    box(x + .08, y + .08, 0, .84, .84, 36, '#16121e');
    const p = FX === 'spenti' ? 0 : RB.p, X = PX(x + .5, y + .92), Y = PY(x + .5, y + .92, 12);
    for (const [dz, r] of [[0, 7], [16, 4]]) {
      g.fillStyle = '#0a0810'; g.beginPath(); g.ellipse(X, Y - dz, r + p * 1.6, (r + p * 1.6) * .8, 0, 0, 6.3); g.fill();
      g.strokeStyle = hsl(300 + RB.n * 10, 90, 55, .5 + p * .5); g.lineWidth = 1.2; g.stroke();
    }
  }
  function consolle(x, y) {
    box(x, y + .05, 0, 1, .9, 15, '#1c1826'); box(x - .02, y + .03, 15, 1.04, .94, 2, '#2c2638');
    if (x % 2 === 0) { box(x + .2, y + .2, 17, .6, .55, 1.5, '#0c0a10'); g.fillStyle = '#3a3448'; g.beginPath(); g.ellipse(PX(x + .5, y + .47), PY(x + .5, y + .47, 18.6), 9, 5, 0, 0, 6.3); g.fill(); }
    if (FX !== 'spenti') { g.globalCompositeOperation = 'lighter'; box(x + .02, y + .96, 3, .96, .02, 3, hsl(RB.n * 25 + x * 30, 100, 45 + RB.p * 25)); g.globalCompositeOperation = 'source-over'; }
  }
  function palo(x, y) {
    box(x + .42, y + .42, 0, .16, .16, 58, '#2a2a33');
    box(x + .3, y + .3, 58, .4, .4, 8, '#1a1a22');
    const c = hsl(RB.n * 37 + x * 50, 100, 55, 1);
    box(x + .36, y + .36, 66, .28, .28, 2, FX === 'spenti' ? '#444' : c);
  }
  const tile0 = tile;
  tile = function (x, y) {
    if (Zk !== ZK) return tile0.apply(this, arguments);
    const ch = DEC[y] && DEC[y][x];
    if (inPista(x, y) && M[y][x] === 0 && !ch) { tile0.apply(this, arguments); try { piastra(x, y); } catch (e) {} return; }
    if (ch === '♫' || ch === '◘' || ch === '¡') { try { (ch === '♫' ? cassa : ch === '◘' ? consolle : palo)(x, y); } catch (e) {} return; }
    return tile0.apply(this, arguments);
  };
  // luci sopra tutto: buio, fasci dei fari, laser dalla consolle, lampo sul battere
  const PALI = [], CASSE = [];
  LAY.forEach((r, y) => [...r].forEach((c, x) => { if (c === '¡') PALI.push([x, y]); }));
  function luci() {
    g.setTransform(S * DPR, 0, 0, S * DPR, (W / 2 - camX * S) * DPR, (H / 2 - camY * S) * DPR);
    g.fillStyle = 'rgba(4,2,12,' + (FX === 'spenti' ? .25 : .42 - RB.p * .1) + ')';
    g.fillRect(camX - W / S, camY - H / S, 2 * W / S, 2 * H / S);
    if (FX === 'spenti') return;
    g.globalCompositeOperation = 'lighter';
    const tt = performance.now() / 1000, cx = (PISTA[0] + PISTA[2]) / 2 + .5, cy = (PISTA[1] + PISTA[3]) / 2 + .5;
    PALI.forEach(([x, y], i) => {
      const a = tt * (.6 + i * .13) + i * 1.7 + RB.b * .25, tx = cx + Math.cos(a) * 3.5, ty = cy + Math.sin(a * 1.3) * 3;
      const X0 = PX(x + .5, y + .5), Y0 = PY(x + .5, y + .5, 64), X1 = PX(tx, ty), Y1 = PY(tx, ty, 0), r = 30 + RB.p * 10;
      const h = RB.n * 37 + i * 70, gr = g.createLinearGradient(X0, Y0, X1, Y1);
      gr.addColorStop(0, hsl(h, 100, 60, .5)); gr.addColorStop(1, hsl(h, 100, 55, .06 + RB.p * .12));
      g.fillStyle = gr; g.beginPath(); g.moveTo(X0 - 3, Y0); g.lineTo(X1 - r, Y1); g.lineTo(X1 + r, Y1); g.lineTo(X0 + 3, Y0); g.closePath(); g.fill();
      g.fillStyle = hsl(h, 100, 60, .18 + RB.p * .25); g.beginPath(); g.ellipse(X1, Y1, r, r * .5, 0, 0, 6.3); g.fill();
    });
    if (FX === 'pieni') {
      const X0 = PX(9, 1.6), Y0 = PY(9, 1.6, 22), n = 6, ap = RB.e > .5 ? .35 + RB.p * .5 : .15;
      for (let i = 0; i < n; i++) {
        const a = Math.PI * (.15 + .7 * i / (n - 1)) + Math.sin(tt * 1.3 + i) * .25, L = 13, tx = 9 + Math.cos(a) * L * .2 + (i - n / 2) * 1.8, ty = 1.6 + Math.sin(a) * L;
        g.strokeStyle = hsl(120 + RB.n * 45 + i * 25, 100, 55, ap); g.lineWidth = 1.4;
        g.beginPath(); g.moveTo(X0, Y0); g.lineTo(PX(tx, ty), PY(tx, ty, 2)); g.stroke();
      }
    }
    g.globalCompositeOperation = 'source-over';
    // lampo sul primo battito di ogni quattro battute, solo con gli effetti pieni e quando suona davvero qualcosa
    if (FX === 'pieni' && RB.e > .5 && RB.n % 16 === 0 && RB.p > .75) {
      g.setTransform(DPR, 0, 0, DPR, 0, 0); g.fillStyle = 'rgba(255,255,255,' + ((RB.p - .75) * .6) + ')'; g.fillRect(0, 0, W, H);
    }
  }
  // dalla 7.4 il gioco disegna le caselle ferme una volta sola («rendering veloce») senza passare da tile():
  // pista, casse, consolle e pali sparivano. Nella sala si torna al disegno classico (la sala è piccola), fuori si rimette com'era.
  let lento = 0;
  function disegnoClassico() {
    if (typeof FAST !== 'object' || !FAST) return;
    if (Zk === ZK) { if (!lento && FAST.ok) { FAST.ok = 0; lento = 1; } }
    else if (lento) { FAST.ok = 1; lento = 0; }
  }
  const lights0 = lights;
  lights = function () {
    opz(disegnoClassico);
    if (Zk === ZK) try { aggiornaRitmo(); g.save(); luci(); g.restore(); } catch (e) { g.restore(); }
    return lights0.apply(this, arguments);
  };

  // ---------- il DJ e la porta ----------
  // punti invisibili davanti alla consolle per parlare col DJ: il gioco li vede come cose con cui interagire, ma non li disegna
  opz(() => ITK.add('vxdj'));
  const ent0 = ent;
  ent = function (e) { if (e && e.k === 'vxdj') return; return ent0.apply(this, arguments); };
  const act0 = act;
  act = function (e) {
    if (Zk === ZK && e && (e.k === 'vxdj' || (e.k === 'npc' && e.nid === 'vxp_dj'))) { opz(() => tone(880, .06, 'triangle')); apriPannello(); return; }
    if (Zk === ZK && e && e.k === 'po') { esci(); return; }
    if (e && e.vxdisco) { entra(true); return; }
    return act0.apply(this, arguments);
  };
  function esci() {
    if (opz(() => IRB)) return;
    const b = back && (Z[back.zk] || opz(() => zd(back.zk))) ? back : { zk: 'town' };
    opz(() => whoosh());
    const viaggio = () => {
      try {
        load(b.zk, ZK);
        if (Zk === b.zk && b.x) {
          const x = b.x | 0, y = b.y | 0;
          if (x > 0 && y > 0 && x < N - 1 && y < N - 1 && WK(M[y][x])) { P.px = b.x; P.py = b.y; P.path = []; P.tg = null; opz(() => { camX = PX(P.px, P.py); camY = PY(P.px, P.py, 10); }); }
        }
      } catch (err) { console.error('[plugin ' + ID + ']', err); try { load('town'); } catch (e2) {} }
    };
    try { irisGo(viaggio); } catch (e) { viaggio(); }
  }
  function impegnato() {
    if (!P || !opz(() => started)) return 'Il gioco non è ancora pronto.';
    if (Zk === ZK) return 'Sei già in discoteca. Per uscire usa la porta.';
    if (opz(() => MODE) === 'dim') return 'Da Voxelia Dimension non si va in discoteca.';
    if (opz(() => PM) === 'trade') return 'Stai facendo uno scambio: finiscilo prima.';
    if (opz(() => IRB)) return 'Stai già cambiando zona.';
    if (opz(() => NAV)) return 'Prima scendi dalla nave.';
    if ((CFG.vietateDa || []).some(z => Zk === z || String(Zk).split('@')[0] === z)) return 'Da qui non puoi andare in discoteca.';
    return '';
  }
  // dal portale si torna accanto al portale; con /discoteca nel punto esatto da cui si è partiti
  function entra(daPortale) {
    const no = impegnato(); if (no) { avvisa(no); return; }
    back = daPortale === true ? { zk: Zk } : { zk: Zk, x: P.px, y: P.py };
    opz(() => whoosh());
    const viaggio = () => { try { load(ZK, Zk); } catch (e) { console.error('[plugin ' + ID + ']', e); } };
    try { irisGo(viaggio); } catch (e) { viaggio(); }
  }
  VXP.on(ID, 'entra', () => entra(false));

  // ---------- il portale in piazza ----------
  if (CFG.portaleInCitta) {
    const genTown0 = genTown;
    genTown = function () {
      const sp = genTown0.apply(this, arguments);
      try {
        let [x, y] = CFG.posPortale;
        if (!(M[y] && WK(M[y][x])) || ents.some(e => e.k === 'po' && (e.px | 0) === x && (e.py | 0) === y)) [x, y] = nearFree(x, y);
        ents.push(Object.assign(po(x, y, ZK, { n: CFG.nome }), { col: '#ff3fbf', vxdisco: 1 }));
      } catch (e) { console.error('[plugin ' + ID + ']', e); }
      return sp;
    };
  }
  VXP.on(ID, 'esci', () => { if (Zk === ZK) esci(); });

  function entrato() {
    dentro = true;
    try {
      for (const e of ents) {
        if (e.k === 'po') e.n = 'Esci: ' + (back ? opz(() => zname(back.zk)) || 'Aldoria' : 'Aldoria');
        if (e.k === 'npc' && e.nid === 'vxp_dj') { e.sh = CFG.frasiDj; e.nsh = 0; }
      }
      // il DJ sta dietro la consolle: si parla con lui dal bordo davanti della consolle, in qualunque punto
      if (!ents.some(e => e.k === 'vxdj')) for (let x = 6; x <= 11; x++) ents.push({ k: 'vxdj', px: x + .5, py: 3.05, n: CFG.nomeDj });
    } catch (e) {}
    VXP.send(ID, 'ciao', {});
    mostraWidget();
  }
  function uscito() {
    dentro = false; distruggi(); chiudiPannello(); nascondiWidget(); ST = null; smuta();
  }

  // ---------- musica del gioco ----------
  function smuta() { if (muto) { muto = false; opz(() => auVol()); } }
  function gestisciMuto() {
    const zitto = dentro && ST && ST.cur;
    if (zitto && AU.ac && AU.mu) { if (AU.mu.gain.value !== 0) AU.mu.gain.value = 0; muto = true; }
    else smuta();
  }

  // ---------- lettori YouTube e SoundCloud ----------
  const api = { yt: { src: 'https://www.youtube.com/iframe_api', ok: () => window.YT && YT.Player, q: [], st: 0 }, sc: { src: 'https://w.soundcloud.com/player/api.js', ok: () => window.SC && SC.Widget, q: [], st: 0 } };
  function carica(k, cb) {
    const A = api[k]; if (A.ok()) { cb(); return; }
    A.q.push(cb); if (A.st) return; A.st = 1;
    const fatto = () => { if (!A.ok()) return; const q = A.q.splice(0); q.forEach(f => { try { f(); } catch (e) { console.error(e); } }); };
    if (k === 'yt') { const prima = window.onYouTubeIframeAPIReady; window.onYouTubeIframeAPIReady = function () { try { if (prima) prima(); } catch (e) {} fatto(); }; }
    const s = document.createElement('script'); s.src = A.src; s.async = true;
    s.onload = () => { if (k === 'sc') fatto(); };
    s.onerror = () => { A.st = 0; A.q.length = 0; avvisa('Non riesco a caricare il lettore di ' + (k === 'yt' ? 'YouTube' : 'SoundCloud') + ': controlla la connessione.'); };
    document.head.appendChild(s);
  }
  function distruggi() {
    if (!PL) return;
    try { if (PL.yt && PL.yt.destroy) PL.yt.destroy(); } catch (e) {}
    try { if (PL.sc) PL.sc.pause(); } catch (e) {}
    if (PL.el) PL.el.remove();
    PL = null; if (wid) wid.vid.innerHTML = '';
  }
  function crea(c) {
    distruggi(); mostraWidget();
    PL = { n: c.n, tipo: c.tipo, pronto: 0, suona: 0, durOk: 0, t: performance.now() };
    const el = PL.el = document.createElement('div'); el.style.cssText = 'width:100%;height:100%'; wid.vid.appendChild(el);
    const me = PL;
    if (c.tipo === 'yt') {
      const d = document.createElement('div'); el.appendChild(d);
      carica('yt', () => {
        if (PL !== me) return;
        me.yt = new YT.Player(d, { width: '100%', height: '100%', videoId: c.vid,
          playerVars: { autoplay: 1, playsinline: 1, controls: 0, disablekb: 1, rel: 0, fs: 0, iv_load_policy: 3, start: Math.floor(pos() / 1000) },
          events: {
            onReady: () => { if (PL !== me) return; me.pronto = 1; volume(); sincronizza(true); },
            onStateChange: ev => {
              if (PL !== me) return;
              me.suona = ev.data === 1 ? 1 : ev.data === 2 || ev.data === 0 ? 0 : me.suona;
              if (ev.data === 1) { tocca(false); const du = opz(() => me.yt.getDuration()); if (du > 0 && !me.durOk) { me.durOk = 1; VXP.send(ID, 'durata', { n: me.n, ms: Math.round(du * 1000) }); } }
              if (ev.data === 0) VXP.send(ID, 'fine', { n: me.n });
            },
            onError: ev => { if (PL === me) VXP.send(ID, 'errore', { n: me.n, code: String(ev.data) }); }
          } });
      });
    } else {
      const f = document.createElement('iframe');
      f.allow = 'autoplay'; f.style.cssText = 'width:100%;height:100%;border:0';
      f.src = 'https://w.soundcloud.com/player/?url=' + encodeURIComponent(c.url) + '&auto_play=false&visual=true&hide_related=true&show_comments=false&show_reposts=false&show_teaser=false&buying=false&sharing=false&download=false';
      el.appendChild(f);
      carica('sc', () => {
        if (PL !== me) return;
        const w = me.sc = SC.Widget(f), E = SC.Widget.Events;
        w.bind(E.READY, () => {
          if (PL !== me) return; me.pronto = 1; volume();
          w.getDuration(du => { if (PL === me && du > 0 && !me.durOk) { me.durOk = 1; VXP.send(ID, 'durata', { n: me.n, ms: Math.round(du) }); } });
          sincronizza(true);
        });
        w.bind(E.PLAY, () => { if (PL === me) { me.suona = 1; tocca(false); } });
        w.bind(E.PAUSE, () => { if (PL === me) me.suona = 0; });
        w.bind(E.FINISH, () => { if (PL === me) { me.suona = 0; VXP.send(ID, 'fine', { n: me.n }); } });
        w.bind(E.ERROR, () => { if (PL === me) VXP.send(ID, 'errore', { n: me.n, code: 'sc' }); });
      });
    }
  }
  function volume() {
    if (!PL || !PL.pronto) return;
    try { if (PL.yt) { PL.yt.setVolume(VOL); if (VOL > 0) PL.yt.unMute(); } if (PL.sc) PL.sc.setVolume(VOL); } catch (e) {}
  }
  // porta il lettore dove deve essere: stesso punto e stesso stato (pausa o no) per tutti
  let ultimoTentativo = 0;
  function sincronizza(forza) {
    if (!PL || !PL.pronto || !ST || !ST.cur || ST.cur.n !== PL.n) return;
    const c = ST.cur, voglio = pos() / 1000;
    try {
      if (PL.yt) {
        const y = PL.yt, s = y.getPlayerState();
        if (c.pausa) { if (s === 1 || s === 3) y.pauseVideo(); return; }
        const qui = y.getCurrentTime() || 0;
        if (forza || Math.abs(qui - voglio) > 2.5) y.seekTo(voglio, true);
        if (s !== 1 && s !== 3) y.playVideo();
      } else if (PL.sc) {
        const w = PL.sc;
        if (c.pausa) { w.pause(); return; }
        w.getPosition(qui => { if (forza || Math.abs(qui / 1000 - voglio) > 2.5) w.seekTo(voglio * 1000); });
        w.isPaused(p => { if (p) w.play(); });
      }
    } catch (e) {}
    // se il browser blocca l'audio senza un clic, compare il pulsante per farlo partire
    const adesso = performance.now();
    if (!c.pausa && adesso - ultimoTentativo > 2500) { ultimoTentativo = adesso; setTimeout(() => { if (PL && PL.pronto && ST && ST.cur && !ST.cur.pausa && !PL.suona) tocca(true); }, 2500); }
  }

  // ---------- riquadro del brano (in alto a destra) ----------
  const CSS = 'position:fixed;z-index:60;background:rgba(14,10,24,.94);color:#f2eee6;border:1px solid #ff3fbf;border-radius:10px;font:13px system-ui,sans-serif;box-shadow:0 6px 24px rgba(0,0,0,.55)';
  const btn = (t, bg) => '<button style="margin:2px;padding:6px 10px;border-radius:6px;border:0;cursor:pointer;font:600 13px system-ui,sans-serif;color:#fff;background:' + (bg || '#4a3a6a') + '"' + t + '</button>';
  function mostraWidget() {
    if (wid) { wid.el.style.display = dentro ? 'block' : 'none'; return; }
    const el = document.createElement('div');
    el.style.cssText = CSS + ';left:12px;top:118px;width:min(240px,calc(100vw - 32px));padding:8px;display:' + (dentro ? 'block' : 'none');
    el.innerHTML = '<div data-v style="width:100%;aspect-ratio:16/9;background:#000;border-radius:6px;overflow:hidden;display:none"></div>' +
      '<div data-t style="margin:6px 2px 2px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis"></div>' +
      '<div data-s style="opacity:.75;font-size:12px;margin:0 2px 6px"></div>' +
      '<div style="height:4px;background:#2c2440;border-radius:2px;overflow:hidden;margin:0 2px 6px"><div data-b style="height:100%;width:0;background:#ff3fbf"></div></div>' +
      '<button data-tap style="display:none;width:100%;margin-bottom:6px;padding:8px;border:0;border-radius:6px;background:#ff3fbf;color:#fff;font:700 13px system-ui,sans-serif;cursor:pointer">🔊 Tocca per ascoltare</button>' +
      '<div style="display:flex;gap:4px"><button data-dj style="flex:1;padding:6px;border:0;border-radius:6px;background:#4a3a6a;color:#fff;font:600 12px system-ui,sans-serif;cursor:pointer">🎧 Parla col DJ</button>' +
      '<button data-min title="Nascondi il video" style="padding:6px 9px;border:0;border-radius:6px;background:#2c2440;color:#fff;cursor:pointer">▾</button></div>';
    document.body.appendChild(el);
    const q = s => el.querySelector('[data-' + s + ']');
    wid = { el, vid: q('v'), t: q('t'), s: q('s'), b: q('b'), tap: q('tap'), min: q('min'), mini: LS.get('mini', false) };
    for (const ev of ['mousedown', 'mouseup', 'click', 'touchstart', 'touchend', 'pointerdown', 'pointerup', 'wheel']) el.addEventListener(ev, e => e.stopPropagation());
    q('dj').onclick = () => apriPannello();
    wid.tap.onclick = () => { try { if (PL && PL.yt) { PL.yt.unMute(); PL.yt.playVideo(); } if (PL && PL.sc) PL.sc.play(); } catch (e) {} opz(() => auInit()); setTimeout(() => sincronizza(true), 300); tocca(false); };
    wid.min.onclick = () => { wid.mini = !wid.mini; LS.set('mini', wid.mini); disegnaWidget(); };
    disegnaWidget();
  }
  // la scheda sta sotto l'HUD in alto a sinistra, che cresce con le righe (livello, oro, missioni…): si segue la sua altezza
  function sottoHud() {
    if (!wid || wid.el.style.display === 'none') return;
    const h = document.getElementById('hud'), r = h && h.getBoundingClientRect();
    const top = r && r.height ? Math.round(r.bottom + 10) : 118, left = r && r.height ? Math.max(8, Math.round(r.left)) : 12;
    if (wid.top !== top) { wid.top = top; wid.el.style.top = top + 'px'; }
    if (wid.left !== left) { wid.left = left; wid.el.style.left = left + 'px'; }
    const larg = r && r.width ? Math.min(240, Math.max(180, Math.round(r.width + 25))) : 240;
    if (wid.larg !== larg) { wid.larg = larg; wid.el.style.width = 'min(' + larg + 'px,calc(100vw - 32px))'; }
  }
  function nascondiWidget() { if (wid) wid.el.style.display = 'none'; }
  function tocca(si) { if (wid) wid.tap.style.display = si ? 'block' : 'none'; }
  function disegnaWidget() {
    if (!wid) return;
    const c = ST && ST.cur;
    // il video resta nella pagina anche "nascosto": lo rimpiccioliamo invece di toglierlo, così la musica continua
    wid.vid.style.display = c ? 'block' : 'none';
    wid.vid.style.cssText += c && wid.mini ? ';height:1px;aspect-ratio:auto;opacity:0' : ';height:auto;aspect-ratio:16/9;opacity:1';
    wid.min.textContent = wid.mini ? '▴' : '▾'; wid.min.style.display = c ? '' : 'none';
    if (!c) { wid.t.textContent = '🎧 ' + CFG.nomeDj + ' è libero'; wid.s.textContent = 'Parlagli per mettere un brano'; wid.b.style.width = '0'; return; }
    wid.t.textContent = (c.tipo === 'yt' ? '▶ ' : '☁ ') + c.titolo;
    wid.s.textContent = (c.pausa ? '⏸ In pausa · ' : '') + 'chiesto da ' + c.by + (ST.coda.length ? ' · ' + ST.coda.length + ' in coda' : '');
  }
  function barra() {
    if (!wid || !ST || !ST.cur) return;
    const c = ST.cur, p = pos(), d = c.dur || 0;
    wid.b.style.width = d ? Math.min(100, p / d * 100) + '%' : '0';
    if (pan && pan.tempo) pan.tempo.textContent = mmss(p) + (d ? ' / ' + mmss(d) : '');
  }

  // ---------- il pannello del DJ ----------
  function chiudiPannello() { if (pan) pan.el.remove(); pan = null; }
  function apriPannello() {
    if (!dentro) return;
    if (!pan) {
      const el = document.createElement('div');
      el.style.cssText = CSS + ';left:50%;top:50%;transform:translate(-50%,-50%);width:min(420px,calc(100vw - 32px));max-height:calc(100vh - 32px);overflow:auto;padding:14px 16px';
      for (const ev of ['mousedown', 'mouseup', 'click', 'touchstart', 'touchend', 'pointerdown', 'pointerup', 'wheel', 'keydown', 'keyup']) el.addEventListener(ev, e => { e.stopPropagation(); if (ev === 'keydown' && e.key === 'Escape') chiudiPannello(); });
      document.body.appendChild(el);
      pan = { el, bozza: '' };
    }
    disegnaPannello();
  }
  function disegnaPannello() {
    if (!pan) return;
    const inp = pan.el.querySelector('input[type=text]'), foc = inp && document.activeElement === inp;
    if (inp) pan.bozza = inp.value;
    const c = ST && ST.cur, v = ST && ST.voti, coda = ST ? ST.coda : [];
    let h = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><b style="font-size:16px">🎧 ' + e2(CFG.nomeDj) + '</b>' +
      '<button data-x style="background:none;border:0;color:#f2eee6;font-size:20px;cursor:pointer;line-height:1">✕</button></div>';
    if (!ST) h += '<p style="opacity:.75">Un momento, il DJ sta arrivando…</p>';
    else if (!c) h += '<p style="margin:0 0 10px">«La consolle è libera! Incolla un link di YouTube o di SoundCloud e lo metto subito.»</p>';
    else {
      h += '<div style="background:#221a34;border-radius:8px;padding:8px 10px;margin-bottom:10px">' +
        '<div style="font-size:11px;opacity:.7;text-transform:uppercase;letter-spacing:.05em">' + (c.pausa ? '⏸ In pausa' : '♪ Sta suonando') + '</div>' +
        '<div style="font-weight:600;margin:2px 0">' + e2(c.titolo) + '</div>' +
        '<div style="font-size:12px;opacity:.75">' + (c.tipo === 'yt' ? 'YouTube' : 'SoundCloud') + ' · chiesto da ' + e2(c.by) + ' · <span data-tempo></span></div></div>';
      const tuo = c.mio && CFG.richiedenteDecide;
      h += '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:10px">' +
        btn(' data-voto="skip">⏭ ' + (tuo ? 'Salta' : (v.mioSkip ? 'Togli il voto' : 'Vota per saltare') + ' (' + v.skip + '/' + v.serve + ')'), v.mioSkip ? '#8a3a5a' : '#6a3a8a') +
        btn(' data-voto="pausa">' + (c.pausa ? '▶ ' : '⏸ ') + (tuo ? (c.pausa ? 'Riprendi' : 'Pausa') : (v.mioPausa ? 'Togli il voto' : (c.pausa ? 'Vota per riprendere' : 'Vota la pausa')) + ' (' + v.pausa + '/' + v.serve + ')'), v.mioPausa ? '#8a3a5a' : '#3a5a8a') + '</div>';
      if (!tuo) h += '<div style="font-size:11px;opacity:.6;margin:-6px 0 10px">Servono ' + v.serve + ' voti su ' + v.presenti + ' in discoteca.</div>';
    }
    h += '<label style="display:flex;align-items:center;gap:8px;margin-bottom:10px"><span>🔊</span><input data-vol type="range" min="0" max="100" value="' + VOL + '" style="flex:1;accent-color:#ff3fbf"><span data-vn style="width:34px;text-align:right">' + VOL + '%</span></label>';
    h += '<div style="display:flex;gap:6px;margin-bottom:4px"><input type="text" placeholder="Link di YouTube o SoundCloud" style="flex:1;min-width:0;padding:7px 9px;border-radius:6px;border:1px solid #5a4a7a;background:#120e1c;color:#f2eee6;font:13px system-ui,sans-serif">' + btn(' data-chiedi>Chiedi', '#ff3fbf') + '</div>';
    h += '<div data-esito style="font-size:12px;min-height:16px;margin-bottom:6px;color:#ffb0d8"></div>';
    h += '<div style="font-weight:600;margin:4px 0">Coda' + (coda.length ? ' (' + coda.length + ')' : '') + '</div>';
    if (!coda.length) h += '<div style="opacity:.6;font-size:12px">Nessun brano in coda.</div>';
    else h += '<ol style="margin:0;padding-left:22px">' + coda.map(q => '<li style="margin:3px 0"><span style="opacity:.6">' + (q.tipo === 'yt' ? '▶' : '☁') + '</span> ' + e2(q.titolo) + ' <span style="opacity:.6;font-size:12px">· ' + e2(q.by) + '</span>' +
      (q.mio ? ' <button data-togli="' + q.n + '" title="Togli dalla coda" style="background:none;border:0;color:#ff8ab8;cursor:pointer">✕</button>' : '') + '</li>').join('') + '</ol>';
    h += '<div style="margin-top:10px;font-size:12px;opacity:.75">Luci: ' + ['pieni', 'leggeri', 'spenti'].map(m => '<button data-fx="' + m + '" style="margin-left:4px;padding:2px 8px;border-radius:10px;border:1px solid #5a4a7a;cursor:pointer;color:#fff;background:' + (FX === m ? '#5a3a8a' : 'transparent') + '">' + m + '</button>').join('') + '</div>';
    pan.el.innerHTML = h;
    const q = s => pan.el.querySelector(s);
    pan.tempo = q('[data-tempo]'); barra();
    q('[data-x]').onclick = chiudiPannello;
    const vol = q('[data-vol]'); vol.oninput = () => { VOL = +vol.value; q('[data-vn]').textContent = VOL + '%'; volume(); }; vol.onchange = () => LS.set('vol', VOL);
    const ti = q('input[type=text]'); ti.value = pan.bozza || '';
    const chiedi = () => { const u = ti.value.trim(); if (!u) { ti.focus(); return; } VXP.send(ID, 'richiesta', { url: u.slice(0, 400) }); q('[data-esito]').textContent = 'Il DJ controlla il link…'; };
    q('[data-chiedi]').onclick = chiedi; ti.onkeydown = e => { e.stopPropagation(); if (e.key === 'Enter') chiedi(); if (e.key === 'Escape') chiudiPannello(); };
    if (foc) ti.focus();
    pan.el.querySelectorAll('[data-voto]').forEach(b => b.onclick = () => VXP.send(ID, 'voto', { tipo: b.dataset.voto }));
    pan.el.querySelectorAll('[data-togli]').forEach(b => b.onclick = () => VXP.send(ID, 'togli', { n: +b.dataset.togli }));
    pan.el.querySelectorAll('[data-fx]').forEach(b => b.onclick = () => { FX = b.dataset.fx; LS.set('fx', FX); disegnaPannello(); });
  }

  // ---------- messaggi dal server ----------
  VXP.on(ID, 'stato', d => {
    if (!dentro || !d) return;
    OFF = (d.ora || Date.now()) - Date.now();
    ST = d; mostraWidget();
    const c = d.cur;
    if (!c) distruggi();
    else if (!PL || PL.n !== c.n) crea(c);
    else sincronizza(false);
    gestisciMuto(); disegnaWidget(); disegnaPannello();
  });
  VXP.on(ID, 'esito', d => {
    if (!d) return;
    if (pan) { const el = pan.el.querySelector('[data-esito]'); if (el) el.textContent = d.testo || ''; if (d.ok) { const ti = pan.el.querySelector('input[type=text]'); if (ti) ti.value = ''; pan.bozza = ''; } }
    else avvisa(d.testo);
  });
  VXP.on(ID, 'spegni', () => { if (dentro) { uscito(); dentro = true; } });

  // per chi vuole guardare dalla console del browser: VXP_DISCO.stato()
  window.VXP_DISCO = { stato: () => ST, lettore: () => PL };

  // ---------- ogni fotogramma ----------
  let zPrima = null, tSync = 0;
  function giro() {
    try {
      const z = typeof Zk === 'undefined' ? null : Zk;
      if (z !== zPrima) { const era = zPrima; zPrima = z; if (z === ZK) entrato(); else if (era === ZK) uscito(); }
      if (dentro) {
        gestisciMuto(); barra(); sottoHud();
        const n = performance.now(); if (n - tSync > 2000) { tSync = n; sincronizza(false); }
      }
    } catch (e) {}
    requestAnimationFrame(giro);
  }
  requestAnimationFrame(giro);
}

// ======================= server =======================
const https = require('https');

// riconosce i link: YouTube (video, shorts, live, youtu.be, music) e SoundCloud (brani, anche privati con il codice s-…)
function leggiLink(s) {
  s = String(s || '').trim();
  if (!/^https?:\/\//i.test(s)) s = 'https://' + s;
  let u; try { u = new URL(s); } catch (e) { return null; }
  const h = u.hostname.toLowerCase().replace(/^(www|m|music)\./, ''), parti = u.pathname.split('/').filter(Boolean);
  const idYt = v => /^[\w-]{11}$/.test(v || '') ? v : null;
  if (h === 'youtu.be') { const v = idYt(parti[0]); return v ? { tipo: 'yt', vid: v } : null; }
  if (h === 'youtube.com' || h === 'youtube-nocookie.com') {
    let v = idYt(u.searchParams.get('v'));
    if (!v && ['shorts', 'live', 'embed', 'v'].includes(parti[0])) v = idYt(parti[1]);
    if (v) return { tipo: 'yt', vid: v };
    if (u.searchParams.get('list')) return { err: 'Questo è il link di una playlist: mandami il link di un solo brano.' };
    return null;
  }
  if (h === 'on.soundcloud.com' && parti.length === 1) return { tipo: 'sc', corto: 'https://on.soundcloud.com/' + parti[0] };
  if (h === 'soundcloud.com') {
    if (parti.length < 2 || ['discover', 'search', 'you', 'stations', 'charts', 'upload', 'pages', 'settings', 'messages'].includes(parti[0])) return null;
    if (parti[1] === 'sets' || parti[1] === 'albums') return { err: 'Questo è il link di una playlist: mandami il link di un solo brano.' };
    if (['likes', 'tracks', 'reposts', 'followers', 'following', 'popular-tracks', 'comments'].includes(parti[1])) return null;
    if (parti.length > 3 || (parti.length === 3 && !/^s-\w+$/.test(parti[2]))) return null;
    return { tipo: 'sc', url: 'https://soundcloud.com/' + parti.map(encodeURIComponent).join('/') };
  }
  return null;
}

// GET con pochi kB di risposta e un tempo massimo; segue i reindirizzamenti
function prendi(url, cb, giri = 0) {
  let fatto = false; const fine = (e, r) => { if (!fatto) { fatto = true; cb(e, r); } };
  try {
    const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Voxelia discoteca)', Accept: 'application/json,text/html' }, timeout: 7000 }, res => {
      if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location && giri < 4) {
        res.resume(); prendi(new URL(res.headers.location, url).href, fine, giri + 1); return;
      }
      let b = ''; res.setEncoding('utf8');
      res.on('data', d => { b += d; if (b.length > 65536) { req.destroy(); fine(null, { stato: res.statusCode, corpo: b, url }); } });
      res.on('end', () => fine(null, { stato: res.statusCode, corpo: b, url }));
    });
    req.on('timeout', () => req.destroy(new Error('tempo scaduto')));
    req.on('error', e => fine(e));
  } catch (e) { fine(e); }
}

module.exports = {
  name: 'Discoteca',
  version: '1.3',
  author: 'Voxelia',
  description: '/discoteca: una discoteca con DJ, brani da YouTube e SoundCloud, coda, voti e luci a tempo',
  defaults: {
    nome: 'Discoteca Voxel',
    nomeDj: 'DJ Voxel',
    bpm: 124,                  // tempo delle luci quando chi chiede il brano non lo scrive (es. /dj <link> 128)
    sogliaVoto: 0.5,           // frazione dei presenti da superare per saltare o mettere in pausa (0.5 = più della metà)
    richiedenteDecide: true,   // chi ha chiesto il brano può saltarlo o metterlo in pausa senza voto
    maxCoda: 25,               // brani in coda al massimo
    maxPerEroe: 3,             // brani in coda per ogni eroe
    durataMaxMin: 10,          // un brano più lungo viene interrotto dopo questi minuti
    attesaSec: 5,              // secondi minimi tra due richieste dello stesso eroe
    portaleInCitta: true,      // un portale per la discoteca in piazza
    posPortale: [33, 44],      // dove (in caselle della città; se è occupato, il primo posto libero vicino)
    vietateDa: ['arena', 'mare', 'arrembaggio', 'stiva', 'sogno'],   // zone da cui /discoteca non funziona
    frasiDj: ['Mettete un link e si balla!', 'Questo pezzo spacca!', 'Mani in alto!', 'Chi ha la prossima richiesta?']
  },

  setup(api) {
    const C = api.config, ID = api.id, ZK = 'in_discoteca';
    const sale = new Map();   // stanza → { cur, coda, n, timer }
    const ultima = new Map(); // id giocatore → ora dell'ultima richiesta
    let rottoDetto = false;
    const sala = r => { let s = sale.get(r); if (!s) sale.set(r, s = { cur: null, coda: [], n: 0, timer: null, attese: 0 }); return s; };
    const presenti = r => api.players(r).filter(p => p.zone === ZK);
    const dentro = p => p.zone === ZK;
    const maxMs = () => Math.max(1, +C.durataMaxMin || 10) * 60000;
    const serve = n => Math.max(1, Math.min(n, Math.floor(n * Math.min(.99, Math.max(0, +C.sogliaVoto || .5))) + 1));

    api.client('(' + nelGioco.toString() + ')(' + JSON.stringify(ID) + ',' + JSON.stringify({
      nome: String(C.nome), nomeDj: String(C.nomeDj), bpm: +C.bpm || 124, richiedenteDecide: !!C.richiedenteDecide,
      vietateDa: [].concat(C.vietateDa || []), portaleInCitta: C.portaleInCitta !== false, posPortale: [].concat(C.posPortale || [33, 44]).map(Number), frasiDj: [].concat(C.frasiDj || []).map(String).slice(0, 20)
    }) + ');');

    // ---- stato verso il gioco: uguale per tutti, più quello che riguarda chi lo riceve ----
    function invia(r, solo) {
      const s = sala(r), qui = presenti(r), adesso = Date.now(), c = s.cur;
      const base = c && { n: c.n, tipo: c.tipo, vid: c.vid, url: c.url, titolo: c.titolo, by: c.by, bpm: c.bpm, dur: c.dur ? Math.min(c.dur, maxMs()) : 0,
        pausa: c.pausa != null, pos: c.pausa != null ? c.pausa : adesso - c.t0, t0: c.t0 };
      for (const p of solo ? [solo] : qui) {
        const k = p.name.toLowerCase();
        p.send('stato', {
          ora: adesso,
          cur: base ? Object.assign({ mio: c.byKey === k }, base) : null,
          coda: s.coda.map(q => ({ n: q.n, tipo: q.tipo, titolo: q.titolo, by: q.by, mio: q.byKey === k })),
          voti: c ? { skip: c.skip.size, pausa: c.pz.size, serve: serve(qui.length), presenti: qui.length, mioSkip: c.skip.has(k), mioPausa: c.pz.has(k) } : null
        });
      }
    }
    const dici = (r, testo) => { for (const p of presenti(r)) p.tell('🎧 ' + testo); };

    // ---- tempi del brano ----
    function programma(r) {
      const s = sala(r); api.cancel(s.timer); s.timer = null;
      const c = s.cur; if (!c || c.pausa != null) return;
      const lungo = c.dur ? Math.min(c.dur, maxMs()) + 1500 : maxMs();
      s.timer = api.after(Math.max(500, c.t0 + lungo - Date.now()), () => {
        if (s.cur !== c) return;
        if (c.dur && c.dur > maxMs()) dici(r, 'Il brano supera i ' + C.durataMaxMin + ' minuti: passo al prossimo.');
        prossimo(r);
      });
    }
    function prossimo(r) {
      const s = sala(r); api.cancel(s.timer); s.timer = null;
      const q = s.coda.shift();
      if (!q) { s.cur = null; invia(r); return; }
      s.cur = Object.assign(q, { t0: Date.now() + 1500, pausa: null, dur: 0, skip: new Set(), pz: new Set(), sentito: false });
      if (!presenti(r).length) { s.cur.pausa = 0; s.cur.vuota = true; }
      dici(r, 'Ora suona «' + q.titolo + '», chiesto da ' + q.by + '.');
      programma(r); invia(r);
    }
    function pausa(r, si) {
      const c = sala(r).cur; if (!c) return;
      if (si && c.pausa == null) c.pausa = Math.max(0, Date.now() - c.t0);
      else if (!si && c.pausa != null) { c.t0 = Date.now() - c.pausa + 800; c.pausa = null; c.vuota = false; }
      c.pz.clear(); programma(r); invia(r);
    }
    // con meno gente i voti già dati possono bastare: si ricontrollano a ogni cambio
    function contaVoti(r) {
      const s = sala(r), c = s.cur; if (!c) return;
      const qui = presenti(r), nomi = new Set(qui.map(p => p.name.toLowerCase()));
      for (const k of [...c.skip]) if (!nomi.has(k)) c.skip.delete(k);
      for (const k of [...c.pz]) if (!nomi.has(k)) c.pz.delete(k);
      if (!qui.length) return;
      if (c.skip.size >= serve(qui.length)) { dici(r, 'Votato: salto «' + c.titolo + '».'); prossimo(r); return true; }
      if (c.pz.size >= serve(qui.length)) { const era = c.pausa != null; dici(r, era ? 'Votato: si riparte!' : 'Votato: pausa.'); pausa(r, !era); return true; }
    }

    // ---- richieste ----
    function chiedi(p, testo) {
      if (!dentro(p)) return 'Per chiedere un brano devi essere in discoteca: scrivi /discoteca.';
      const m = String(testo || '').trim().match(/^(\S+)(?:\s+(\d{2,3}))?\s*$/);
      if (!m) return 'Mandami un link di YouTube o di SoundCloud.';
      const L = leggiLink(m[1]);
      if (!L) return 'Non riconosco il link: deve essere un brano di YouTube o di SoundCloud.';
      if (L.err) return L.err;
      const s = sala(p.room), k = p.name.toLowerCase();
      const att = Math.max(0, C.attesaSec | 0) * 1000 - (Date.now() - (ultima.get(p.id) || 0));
      if (att > 0) return 'Aspetta ancora ' + Math.ceil(att / 1000) + ' secondi.';
      if (s.coda.length >= Math.max(1, C.maxCoda | 0)) return 'La coda è piena: aspetta che finisca qualche brano.';
      if (s.coda.filter(q => q.byKey === k).length >= Math.max(1, C.maxPerEroe | 0)) return 'Hai già ' + C.maxPerEroe + ' brani in coda.';
      if (s.attese > 20) return 'Il DJ è sommerso di richieste: riprova tra poco.';
      ultima.set(p.id, Date.now());
      const bpm = m[2] ? Math.max(60, Math.min(200, +m[2])) : 0;
      s.attese++;
      const pronto = (err, q) => {
        s.attese--;
        const o = api.player(p.id);
        if (err) { if (o) o.send('esito', { testo: err }); return; }
        if (s.cur && ((q.vid && s.cur.vid === q.vid) || (q.url && s.cur.url === q.url))) { if (o) o.send('esito', { testo: 'Questo brano sta già suonando.' }); return; }
        if ((q.vid && s.coda.some(x => x.vid === q.vid)) || (q.url && s.coda.some(x => x.url === q.url))) { if (o) o.send('esito', { testo: 'Questo brano è già in coda.' }); return; }
        Object.assign(q, { n: ++s.n, by: p.name, byKey: k, bpm: bpm || (+C.bpm || 124) });
        s.coda.push(q);
        api.log(p.name + ' ha chiesto ' + (q.url || 'https://youtu.be/' + q.vid) + ' («' + q.titolo + '»)');
        if (o) o.send('esito', { ok: 1, testo: s.cur ? '«' + q.titolo + '» è in coda, al posto ' + s.coda.length + '.' : 'Arriva «' + q.titolo + '»!' });
        if (!s.cur) prossimo(p.room);
        else { dici(p.room, p.name + ' ha messo in coda «' + q.titolo + '».'); invia(p.room); }
      };
      // il titolo (e se il brano esiste) lo dicono YouTube e SoundCloud; senza internet si usa il link
      if (L.tipo === 'yt') {
        const link = 'https://www.youtube.com/watch?v=' + L.vid;
        prendi('https://www.youtube.com/oembed?format=json&url=' + encodeURIComponent(link), (e, r) => {
          if (e || !r) return pronto(null, { tipo: 'yt', vid: L.vid, titolo: 'Video ' + L.vid });
          if (r.stato === 401) return pronto('Questo video non si può riprodurre fuori da YouTube.');
          if (r.stato === 404 || r.stato === 400) return pronto('Non trovo questo video: forse è privato o è stato tolto.');
          let j = null; try { j = JSON.parse(r.corpo); } catch (x) {}
          pronto(null, { tipo: 'yt', vid: L.vid, titolo: String(j && j.title || 'Video ' + L.vid).slice(0, 120) });
        });
      } else {
        const conTitolo = url => prendi('https://soundcloud.com/oembed?format=json&url=' + encodeURIComponent(url), (e, r) => {
          if (e || !r) return pronto(null, { tipo: 'sc', url, titolo: url.replace(/^https:\/\/soundcloud\.com\//, '') });
          if (r.stato === 404) return pronto('Non trovo questo brano su SoundCloud: forse è privato o è stato tolto.');
          let j = null; try { j = JSON.parse(r.corpo); } catch (x) {}
          const t = j && j.title ? String(j.title) : url.replace(/^https:\/\/soundcloud\.com\//, '');
          pronto(null, { tipo: 'sc', url, titolo: t.slice(0, 120) });
        });
        if (!L.corto) conTitolo(L.url);
        else prendi(L.corto, (e, r) => {
          const fin = r && leggiLink(r.url);
          if (e || !fin || fin.tipo !== 'sc' || !fin.url) return pronto('Non riesco ad aprire questo link corto di SoundCloud: incolla il link intero del brano.');
          conTitolo(fin.url);
        });
      }
      return '';
    }
    function vota(p, tipo) {
      const r = p.room, s = sala(r), c = s.cur, k = p.name.toLowerCase();
      if (!dentro(p)) return 'Devi essere in discoteca.';
      if (!c) return 'Il DJ non sta suonando niente.';
      if (C.richiedenteDecide && c.byKey === k) {
        if (tipo === 'skip') { dici(r, p.name + ' ha saltato il suo brano.'); prossimo(r); }
        else { const era = c.pausa != null; dici(r, p.name + (era ? ' ha fatto ripartire' : ' ha messo in pausa') + ' il suo brano.'); pausa(r, !era); }
        return '';
      }
      const S = tipo === 'skip' ? c.skip : c.pz;
      if (S.has(k)) S.delete(k); else S.add(k);
      if (!contaVoti(r)) invia(r);
      return '';
    }

    // ---- dal gioco ----
    api.onClient('ciao', p => invia(p.room, p));
    api.onClient('richiesta', (p, d) => { const e = chiedi(p, d && d.url); if (e) p.send('esito', { testo: e }); else p.send('esito', { testo: 'Il DJ controlla il link…' }); });
    api.onClient('voto', (p, d) => { const e = vota(p, d && d.tipo === 'skip' ? 'skip' : 'pausa'); if (e) p.send('esito', { testo: e }); });
    api.onClient('togli', (p, d) => {
      const s = sala(p.room), i = s.coda.findIndex(q => q.n === (d && d.n) && q.byKey === p.name.toLowerCase());
      if (i < 0) return; const q = s.coda.splice(i, 1)[0]; p.send('esito', { testo: 'Hai tolto «' + q.titolo + '» dalla coda.' }); invia(p.room);
    });
    api.onClient('durata', (p, d) => {
      const s = sala(p.room), c = s.cur; if (!c || !d || d.n !== c.n || !dentro(p)) return;
      c.sentito = true;
      const ms = +d.ms; if (!(ms > 1000) || ms > 6 * 3600000 || c.dur) return;
      c.dur = ms; programma(p.room); invia(p.room);
    });
    api.onClient('fine', (p, d) => {
      const s = sala(p.room), c = s.cur; if (!c || !d || d.n !== c.n || c.pausa != null) return;
      if (c.dur && Date.now() - c.t0 >= c.dur - 5000) prossimo(p.room);
    });
    // un brano che non parte da nessuna parte (video non incorporabile, tolto…) si salta; se qualcuno lo sente già, no
    api.onClient('errore', (p, d) => {
      const s = sala(p.room), c = s.cur; if (!c || !d || d.n !== c.n || c.sentito || !dentro(p)) return;
      const code = String(d.code || '');
      dici(p.room, (code === '101' || code === '150' ? '«' + c.titolo + '» non si può ascoltare fuori da YouTube' : 'Non riesco a far partire «' + c.titolo + '»') + ': passo al prossimo.');
      prossimo(p.room);
    });
    api.onClient('rotto', (p, L) => { if (!rottoDetto) { rottoDetto = true; api.log('il gioco non ha più ' + [].concat(L).join(', ') + ': la discoteca va aggiornata per questa versione'); } });

    // ---- comandi ----
    api.command('discoteca', 'vai in discoteca (/discoteca esci per uscire)', (p, args) => {
      if (/^esci$/i.test(args[0] || '')) { if (!dentro(p)) return 'Non sei in discoteca.'; p.send('esci', {}); return; }
      if (dentro(p)) return 'Sei già in discoteca: parla con ' + C.nomeDj + ' per chiedere un brano.';
      p.send('entra', {});
    });
    api.command('dj', 'chiedi un brano al DJ: /dj <link YouTube o SoundCloud> [bpm]', (p, args, testo) => {
      if (!String(testo || '').trim()) return 'Scrivi /dj seguito dal link, oppure parla con ' + C.nomeDj + ' in discoteca.';
      return chiedi(p, testo) || 'Il DJ controlla il link…';
    });
    api.command('coda', 'i brani in coda in discoteca', p => {
      const s = sala(p.room);
      if (!s.cur && !s.coda.length) return C.nomeDj + ' è libero: nessun brano in coda.';
      return (s.cur ? 'Suona: «' + s.cur.titolo + '» (' + s.cur.by + '). ' : '') + (s.coda.length ? 'In coda: ' + s.coda.map((q, i) => (i + 1) + '. ' + q.titolo + ' (' + q.by + ')').join(' · ') : 'Coda vuota.');
    });
    api.command('skip', 'vota per saltare il brano in discoteca', p => vota(p, 'skip') || undefined);
    api.command('pausa', 'vota per mettere in pausa (o far ripartire) il brano in discoteca', p => vota(p, 'pausa') || undefined);

    // ---- chi entra ed esce ----
    function cambio(r) {
      const s = sala(r), c = s.cur, n = presenti(r).length;
      // nessuno in sala: il brano si ferma dov'è e riparte quando entra qualcuno
      if (c && !n && c.pausa == null) { c.vuota = true; c.pausa = Math.max(0, Date.now() - c.t0); programma(r); }
      else if (c && n && c.vuota && c.pausa != null) { c.vuota = false; c.t0 = Date.now() - c.pausa + 1500; c.pausa = null; programma(r); }
      if (!contaVoti(r)) invia(r);
    }
    api.on('zone', (p, z, era) => { if (z === ZK || era === ZK) cambio(p.room); });
    // dopo una Ricarica del plugin la sala riparte vuota: chi è già dentro lo sa subito
    api.after(500, () => { for (const p of api.players()) if (dentro(p)) invia(p.room, p); });
    api.on('leave', p => { ultima.delete(p.id); if (p.zone === ZK) api.after(50, () => cambio(p.room)); });
  },

  stop(api) { for (const p of api.players()) p.send('spegni', {}); }
};
