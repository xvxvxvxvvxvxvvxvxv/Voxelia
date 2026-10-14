// Emote e fumetti: i giocatori si parlano anche senza guardare la chat.
// /saluta, /ridi, /applaudi, /arrabbiato, /cuore, /balla, /triste, /ok, /dubbio, /dormi, /forza, /brindisi mostrano
// per qualche secondo un fumetto con un'icona voxel (quelle della 7.8) sopra la testa dell'eroe, visibile a chi è nella
// stessa zona. Con /balla l'eroe saltella anche. /emote elenca le emote e apre la ruota.
// Nel gioco: ruota delle emote con il tasto G (si sceglie col mouse o coi numeri), e i messaggi di chat compaiono come
// fumetto vero sopra chi li scrive, al posto della scritta gialla del gioco. Il fumetto della chat compare solo quando il
// messaggio arriva davvero dal server: chi è silenziato (dall'admin o dal Guardiano) o scrive con la chat spenta non ha
// più la scritta sopra la testa, che il gioco invece mostrava lo stesso.

// emote: comando → [icona voxel del gioco o del plugin, emoji se il gioco non ha le icone voxel, cosa fa]
const EMOTE = {
  saluta: ['hand', '👋', 'saluta'],
  ridi: ['vxe_ridi', '😄', 'ride'],
  applaudi: ['party', '👏', 'applaude'],
  arrabbiato: ['vxe_rabbia', '😠', 'si arrabbia'],
  cuore: ['heart', '❤', 'manda un cuore'],
  balla: ['note', '♪', 'balla'],
  triste: ['vxe_triste', '😢', 'è triste'],
  ok: ['ok', '✔', 'è d\'accordo'],
  dubbio: ['help', '?', 'ha un dubbio'],
  dormi: ['zzz', 'z', 'si addormenta'],
  forza: ['muscle', '💪', 'mostra i muscoli'],
  brindisi: ['beer', '🍺', 'brinda']
};

// codice nel gioco: fumetti sopra la testa, ruota delle emote, fumetti della chat
function nelGioco(ID, OPZ) {
  const opz = f => { try { return f(); } catch (e) { return undefined; } };
  // tre facce che mancano tra le icone del gioco, disegnate a cubetti 12×12 come quelle di Voxelia Studio
  const FACCE = {
    vxe_ridi: ['...oooooo...', '..oyyyyyyo..', '.oyyyyyyyyo.', 'oyykyyyykyyo', 'oykykyykykyo', 'oyyyyyyyyyyo',
      'oykkkkkkkkyo', 'oykwwwwwwkyo', 'oyykrrrrkyyo', '.oyykkkkyyo.', '..oyyyyyyo..', '...oooooo...'],
    vxe_rabbia: ['...RRRRRR...', '..RrrrrrrR..', '.RrrrrrrrrR.', 'RrkrrrrrrkrR', 'RrrkkrrkkrrR', 'RrrwkrrkwrrR',
      'RrrrrrrrrrrR', 'RrrrkkkkrrrR', 'RrrkrrrrkrrR', '.RrrrrrrrrR.', '..RrrrrrrR..', '...RRRRRR...'],
    vxe_triste: ['...oooooo...', '..oyyyyyyo..', '.oyyyyyyyyo.', 'oyyyyyyyyyyo', 'oyykyyyykyyo', 'oyykyyyykyyo',
      'oybyyyyyyyyo', 'oybykkkkyyyo', 'oycykyykyyyo', '.oyyyyyyyyo.', '..oyyyyyyo..', '...oooooo...']
  };
  if (opz(() => EDICO) && typeof edIcoC === 'function') for (const k in FACCE) if (!EDICO[k]) EDICO[k] = FACCE[k];
  const voxel = typeof edIcoC === 'function';
  const tela = n => voxel ? opz(() => edIcoC(n)) : null;
  const E = OPZ.emote, DUR = Math.max(1, OPZ.durataSec || 4) * 1000;
  const bolle = new Map();   // id del giocatore (o "@nome" per la chat) → { e: emote, s: testo, t0 }
  let pronto = false, tentativi = 0;

  setInterval(() => {
    if (!opz(() => NET.ok)) { pronto = false; tentativi = 0; return; }
    if (!pronto && tentativi < 8) { tentativi++; VXP.send(ID, 'ciao', 1); }
  }, 1500);
  VXP.on(ID, 'pronto', () => { pronto = true; });
  VXP.on(ID, 'emote', d => { if (d && d.id && E[d.e]) bolle.set(d.id, { e: d.e, t0: performance.now() }); });
  VXP.on(ID, 'ruota', () => apri());

  // ---------- fumetti della chat: solo per i messaggi che il server ha davvero consegnato ----------
  // il gioco manda il testo anche con la posizione dell'eroe e lo scrive in giallo sopra la testa; qui lo si nasconde
  // e si disegna il fumetto quando il messaggio arriva in chat (stessa zona: senza nome della zona accanto)
  const clogPrima = opz(() => clog);
  if (OPZ.chat && typeof clogPrima === 'function') clog = function (n, s, o) {
    const r = clogPrima.apply(this, arguments);
    try {
      o = o || {};
      if (n && s && !o.adm && !o.sys && !o.z && String(s)[0] !== '/' && NET.ok) {
        const io = o.me || n === NET.name;
        bolle.set(io ? NET.id : '@' + String(n).slice(0, 14), { s: String(s).slice(0, 60), t0: performance.now() });
      }
    } catch (e) {}
    return r;
  };

  // ---------- disegno: l'eroe che balla saltella, i fumetti vanno sopra tutto ----------
  const USA = { ent: () => ent, draw: () => draw, scr: () => scr, NET: () => NET, P: () => P };
  const manca = Object.keys(USA).filter(k => opz(USA[k]) === undefined);
  if (manca.length) { console.warn('[plugin ' + ID + '] fumetti spenti: il gioco non ha ' + manca.join(', ')); return; }
  const bollaDi = e => {
    const now = performance.now(), chiavi = e === P ? [NET.id] : [e.id, '@' + e.n];
    let b = null;
    for (const k of chiavi) { const x = bolle.get(k); if (!x) continue; if (now - x.t0 > (x.s ? Math.max(DUR, 2500 + x.s.length * 60) : DUR)) { bolle.delete(k); continue; } if (!b || x.t0 > b.t0) b = x; }
    return b;
  };
  const entPrima = ent;
  ent = function (e) {
    if (!e || !(e === P || e.k === 'pl')) return entPrima.apply(this, arguments);
    const b = bollaDi(e), bub = e.bub, az = e.az;
    if (OPZ.chat) e.bub = '';
    if (b && b.e === 'balla') e.az = (az || 0) + Math.abs(Math.sin(performance.now() / 95)) * 6;
    try { return entPrima.apply(this, arguments); } finally { e.bub = bub; e.az = az; }
  };
  const drawPrima = draw;
  draw = function () {
    const r = drawPrima.apply(this, arguments);
    try { fumetti(); } catch (e) {}
    return r;
  };

  function tondo(x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
  function righe(s, max) {
    const parole = s.split(/\s+/), L = []; let riga = '';
    for (const p of parole) { const prova = riga ? riga + ' ' + p : p; if (riga && g.measureText(prova).width > max) { L.push(riga); riga = p; } else riga = prova; }
    if (riga) L.push(riga);
    if (L.length > 3) { L.length = 3; L[2] = L[2].replace(/.?.?.?$/, '…'); }
    return L.map(l => { while (g.measureText(l).width > max && l.length > 2) l = l.slice(0, -2) + '…'; return l; });
  }
  function fumetti() {
    if (!bolle.size || !NET.ok || opz(() => OCC && OCC.intro) || opz(() => MODE) === 'ed') return;
    const now = performance.now(), f = Math.max(.85, Math.min(1.35, opz(() => S) || 1));
    g.save(); g.setTransform(DPR, 0, 0, DPR, 0, 0);
    for (const e of [P].concat(NET.list || [])) {
      const b = e && bollaDi(e); if (!b) continue;
      const vita = (b.s ? Math.max(DUR, 2500 + b.s.length * 60) : DUR), dt = now - b.t0;
      const sc = Math.min(1, dt / 140) * (1 + .12 * Math.max(0, 1 - dt / 260)), al = Math.min(1, (vita - dt) / 350);
      const [X, Y0] = scr(e.px, e.py, OPZ.altezza || 62);
      if (X < -100 || Y0 < -100 || X > W + 100 || Y0 > H + 100) continue;
      let w, h, L = null; const tl = b.s ? null : tela(E[b.e][0]);
      if (b.s) { g.font = (12 * f).toFixed(1) + 'px Georgia,serif'; L = righe(b.s, 150 * f); w = Math.max(...L.map(l => g.measureText(l).width)) + 16 * f; h = L.length * 15 * f + 10 * f; }
      else { w = h = 38 * f; }
      const Y = Y0 - (b.e === 'balla' ? Math.abs(Math.sin(now / 95)) * 6 * f : 0) - Math.sin(dt / 400) * 1.5;
      g.globalAlpha = Math.max(0, al);
      g.translate(X, Y); g.scale(sc, sc);
      const x = -w / 2, y = -h - 8 * f;
      g.fillStyle = 'rgba(0,0,0,.35)'; tondo(x + 3, y + 3, w, h, 7 * f); g.fill();   // ombra a cubetto
      g.fillStyle = '#f7f2e4'; g.strokeStyle = '#262b36'; g.lineWidth = 2;
      tondo(x, y, w, h, 7 * f); g.fill(); g.stroke();
      g.beginPath(); g.moveTo(-6 * f, y + h - 1); g.lineTo(0, -1); g.lineTo(6 * f, y + h - 1); g.closePath(); g.fill();
      g.beginPath(); g.moveTo(-6 * f, y + h); g.lineTo(0, -1); g.lineTo(6 * f, y + h); g.stroke();
      if (L) { g.fillStyle = '#262b36'; g.textAlign = 'center'; g.textBaseline = 'middle'; L.forEach((l, i) => g.fillText(l, 0, y + 5 * f + (i + .5) * 15 * f)); }
      else if (tl) { g.imageSmoothingEnabled = false; const s = 28 * f; g.drawImage(tl, -s / 2, y + (h - s) / 2, s, s * tl.height / tl.width); }
      else { g.fillStyle = '#262b36'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = 'bold ' + (20 * f).toFixed(0) + 'px Georgia,serif'; g.fillText(E[b.e][1], 0, y + h / 2 + 1); }
      g.setTransform(DPR, 0, 0, DPR, 0, 0); g.globalAlpha = 1; g.textBaseline = 'alphabetic';
    }
    g.restore();
  }

  // ---------- la ruota delle emote ----------
  const NOMI = Object.keys(E);
  let ruota = null;
  const manda = k => { chiudi(); if (opz(() => NET.ok)) NET.send({ t: 'chat', s: '/' + k, z: Zk }); };
  function chiudi() { if (ruota) { ruota.remove(); ruota = null; } }
  function apri() {
    if (ruota) { chiudi(); return; }
    if (!opz(() => NET.ok) || !started) return;
    const el = document.createElement('div');
    el.id = 'vxemote';
    el.style.cssText = 'position:fixed;inset:0;z-index:40;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.18)';
    const R = Math.min(118, innerWidth / 2 - 44, innerHeight / 2 - 44), D = 2 * R + 92;
    let h = '<div style="position:relative;width:' + D + 'px;height:' + D + 'px;border-radius:50%;background:radial-gradient(rgba(14,18,28,.55),rgba(14,18,28,.9) 70%);border:2px solid #d4af3799;box-shadow:0 6px 24px rgba(0,0,0,.6)">'
      + '<div data-l style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:110px;text-align:center;color:#f4e8c8;font:bold 14px Georgia,serif;text-shadow:0 1px 2px #000">Emote</div>';
    NOMI.forEach((k, i) => {
      const a = -Math.PI / 2 + i * 2 * Math.PI / NOMI.length, x = D / 2 + Math.cos(a) * R, y = D / 2 + Math.sin(a) * R, c = tela(E[k][0]);
      const ic = c ? '<img src="' + c.toDataURL() + '" width="30" style="image-rendering:pixelated;pointer-events:none">' : '<span style="font:22px Georgia,serif;pointer-events:none">' + E[k][1] + '</span>';
      h += '<button data-k="' + k + '" title="/' + k + '" style="position:absolute;left:' + (x - 25) + 'px;top:' + (y - 25) + 'px;width:50px;height:50px;border-radius:12px;border:2px solid #262b36;background:#f7f2e4;box-shadow:3px 3px 0 rgba(0,0,0,.4);cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0">' + ic
        + '<b style="position:absolute;right:-4px;bottom:-6px;font:bold 10px Georgia,serif;color:#f4e8c8;background:#262b36;border-radius:6px;padding:0 4px;pointer-events:none">' + (i < 9 ? i + 1 : i === 9 ? 0 : '') + '</b></button>';
    });
    el.innerHTML = h + '</div>';
    const lab = el.querySelector('[data-l]');
    for (const ev of ['mousedown', 'mouseup', 'dblclick', 'touchstart', 'touchend', 'pointerdown', 'pointerup', 'wheel']) el.addEventListener(ev, e => e.stopPropagation());
    el.addEventListener('pointerover', e => { const b = e.target.closest('[data-k]'); lab.textContent = b ? E[b.dataset.k][2] : 'Emote'; if (b) b.style.background = '#ffe9a8'; });
    el.addEventListener('pointerout', e => { const b = e.target.closest('[data-k]'); if (b) b.style.background = '#f7f2e4'; });
    el.addEventListener('click', e => { e.stopPropagation(); const b = e.target.closest('[data-k]'); if (b) manda(b.dataset.k); else chiudi(); });
    document.body.appendChild(el); ruota = el;
    opz(() => tone(520, .05, 'triangle'));
  }
  const TASTO = String(OPZ.tasto || '').toLowerCase();
  addEventListener('keydown', e => {
    const tg = e.target; if (tg && (tg.tagName === 'INPUT' || tg.tagName === 'TEXTAREA' || tg.tagName === 'SELECT' || tg.isContentEditable)) return;
    const k = String(e.key || '').toLowerCase();
    if (ruota) {
      if (k === 'escape' || k === TASTO) { chiudi(); e.preventDefault(); e.stopImmediatePropagation(); return; }
      if (/^[0-9]$/.test(k)) { const i = k === '0' ? 9 : +k - 1; if (NOMI[i]) manda(NOMI[i]); e.preventDefault(); e.stopImmediatePropagation(); }
      return;
    }
    if (!TASTO || k !== TASTO || e.ctrlKey || e.metaKey || e.altKey) return;
    if (!started || PM || opz(() => SET.rk) === TASTO || opz(() => MODE) === 'ed' || document.body.classList.contains('dlgo')) return;
    e.preventDefault(); e.stopImmediatePropagation(); apri();
  }, true);
  setInterval(() => { if (ruota && (!started || !opz(() => NET.ok) || PM)) chiudi(); }, 500);
}

module.exports = {
  name: 'Emote e fumetti',
  version: '1.0',
  author: 'Voxelia',
  description: 'Emote con fumetti sopra la testa (/saluta, /ridi, /balla…), ruota delle emote col tasto G, chat come fumetto',
  defaults: {
    durataSec: 4,       // quanto resta il fumetto di un'emote (quello della chat dura di più se il messaggio è lungo)
    attesaSec: 2,       // secondi minimi fra due emote dello stesso eroe
    tasto: 'g',         // tasto della ruota delle emote ('' per nessun tasto: resta /emote)
    fumettiChat: true,  // i messaggi di chat compaiono come fumetto sopra chi li scrive
    spente: []          // emote da togliere, per esempio ["dormi", "brindisi"]
  },

  setup(api) {
    const ID = api.id, C = () => api.config;
    const attive = () => { const no = Array.isArray(C().spente) ? C().spente.map(s => String(s).toLowerCase()) : []; return Object.keys(EMOTE).filter(k => !no.includes(k)); };
    const pronti = new Set(), ultima = new Map();

    function emote(p, k) {
      const now = Date.now(), att = Math.max(0, +C().attesaSec || 0) * 1000;
      if (now - (ultima.get(p.id) || 0) < att) return;   // troppo presto: niente fumetto, niente messaggi
      ultima.set(p.id, now);
      for (const q of api.players(p.room)) if (q.zone === p.zone && pronti.has(q.id)) q.send('emote', { id: p.id, e: k });
      if (!pronti.has(p.id)) return 'Ricarica la pagina del gioco per vedere i fumetti delle emote.';
    }
    for (const k of attive()) api.command(k, 'emote: ' + EMOTE[k][2] + ' (fumetto sopra la testa)', p => emote(p, k));
    api.command('emote', 'le emote con il fumetto sopra la testa; apre la ruota delle emote', p => {
      if (pronti.has(p.id)) p.send('ruota', 1);
      return 'Emote: ' + attive().map(k => '/' + k).join(' ') + (C().tasto ? '. Ruota delle emote: tasto ' + String(C().tasto).toUpperCase() + '.' : '');
    });

    api.onClient('ciao', p => { if (!p) return; pronti.add(p.id); p.send('pronto', 1); });
    api.on('leave', p => { pronti.delete(p.id); ultima.delete(p.id); });

    const emo = {}; for (const k of attive()) emo[k] = EMOTE[k];
    api.client('(' + nelGioco.toString() + ')(' + JSON.stringify(ID) + ',' + JSON.stringify({ emote: emo, durataSec: +C().durataSec || 4, tasto: C().tasto, chat: C().fumettiChat !== false }) + ');');
  }
};
