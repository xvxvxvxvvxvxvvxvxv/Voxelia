// Gruppi d'avventura: fino a 4 eroi della stessa stanza giocano insieme per un po'. Un gruppo è temporaneo,
// diverso da una gilda: nasce quando qualcuno accetta un invito e si scioglie quando ne resta uno solo.
// /gruppo invita <nome>, /gruppo accetta, /gruppo rifiuta, /gruppo esci, /gruppo caccia <nome> (solo il capo),
// /gruppo da solo dice chi c'è e in che zona è ognuno; /gr <testo> scrive solo ai compagni.
// Quando un membro sconfigge il boss di un dungeon, i compagni che sono nello stesso dungeon (su qualunque piano)
// ricevono una parte dell'esperienza del boss e un po' d'oro. Chi chiude il gioco resta nel gruppo per
// assenzaMin minuti, così una disconnessione non lo fa uscire.
// Nel gioco: riquadro del gruppo sotto l'HUD (vita, livello e zona di ogni compagno, pulsante per raggiungerlo
// con /tpa se c'è il plugin Teletrasporto), nome dei compagni in verde con la barra della vita sopra la testa
// anche con i nomi spenti, compagni in verde sulla minimappa, riquadro con Accetta e Rifiuta per gli inviti.

// esperienza dei boss nel gioco (necromante, sfinge…) e livello dei dungeon: servono a calcolare la parte dei compagni
const BOSS_XP = { tana: 180, cripta: 260, piramide: 360, cristallo: 450, fucina: 560, abisso: 700, cittadella: 1200 };
const DG_LV = { tana: 2, cripta: 4, piramide: 6, cristallo: 8, fucina: 10, abisso: 12, cittadella: 15 };
const DG_DEL = { tana: 'della Tana dei Goblin', cripta: 'della Cripta Dimenticata', piramide: 'della Piramide di Khem', cristallo: 'delle Caverne di Cristallo',
  fucina: 'della Fucina Infernale', abisso: "dell'Abisso Sommerso", cittadella: 'della Cittadella del Vuoto' };
// nomi delle zone per /gruppo (le altre si mostrano con la loro chiave, come town o in_tavern)
const ZONE = { town: 'Aldoria', arena: 'Colosseo', forest: 'Foresta di Elmwood', desert: 'Deserto di Khem', peaks: 'Picchi Gelidi', nord: 'Aldoria Nord',
  campi: 'Aldoria Est', rovine: 'Borgo delle Ceneri', porto: 'Porto', vecchia: 'Aldoria Vecchia', tana: 'Tana dei Goblin', cripta: 'Cripta Dimenticata',
  piramide: 'Piramide di Khem', cristallo: 'Caverne di Cristallo', fucina: 'Fucina Infernale', abisso: 'Abisso Sommerso', cittadella: 'Cittadella del Vuoto' };
const zona = z => { const [b, f] = String(z || '').split('@'); return (ZONE[b] || b) + (f ? ' (piano ' + f + ')' : ''); };

// codice nel gioco: riquadro del gruppo, inviti, chat di gruppo, compagni evidenziati sopra la testa e sulla minimappa
function nelGioco(ID, OPZ) {
  const opz = f => { try { return f(); } catch (e) { return undefined; } };
  const LS = {
    get(k, d) { try { const v = localStorage.getItem('vxp_gruppi_' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('vxp_gruppi_' + k, JSON.stringify(v)); } catch (e) {} }
  };
  const VERDE = '#7dffb0', BARRA = '#3ee07a';
  let G = null, ids = new Set(), pronto = false, tentativi = 0, wid = null, inv = null, ridotto = LS.get('mini', false);
  const BTN = 'padding:1px 6px;border:1px solid #ffffff33;border-radius:4px;background:#0006;color:#e8ecf4;font:11px Georgia,serif;cursor:pointer';
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const nomeZona = z => { if (!z) return ''; const b = String(z).split('@')[0], f = String(z).split('@')[1];
    const n = opz(() => Z[b] && Z[b].n.split(' · ')[0]) || opz(() => DG[b] && DG[b].n) || b; return f ? n + ' · piano ' + f : n; };
  const icona = (n, s) => opz(() => typeof ico === 'function' ? ico(n, s || 14) : '') || '';

  // il server deve sapere che questo gioco ha il codice del plugin, per mandargli chat e stato del gruppo
  setInterval(() => {
    if (!opz(() => NET.ok)) { pronto = false; tentativi = 0; if (G) { G = null; ids = new Set(); disegna(); } return; }
    if (!pronto && tentativi < 8) { tentativi++; VXP.send(ID, 'ciao', 1); }
  }, 1500);
  VXP.on(ID, 'pronto', () => { pronto = true; });
  VXP.on(ID, 'stato', d => { G = d && Array.isArray(d.membri) ? d : null; ids = new Set(G ? G.membri.filter(m => !m.io && m.id).map(m => m.id) : []); disegna(); });
  VXP.on(ID, 'chat', d => {
    if (!d) return; clog(d.n, d.s, { z: 'gruppo' });
    const box = opz(() => document.getElementById('cl')), r = box && box.lastElementChild; if (r) r.style.color = VERDE;
    if (d.n !== opz(() => NET.name)) opz(() => tone(660, .05, 'triangle'));
  });
  VXP.on(ID, 'invito', d => mostraInvito(d));
  VXP.on(ID, 'chiudiInvito', d => { if (inv && (!d || !d.da || d.da === inv.da)) chiudiInvito(); });

  // ---------- il riquadro del gruppo, sotto l'HUD in alto a sinistra ----------
  const CSS = 'position:fixed;z-index:6;background:rgba(14,22,20,.9);color:#e8ecf4;border:1px solid ' + BARRA + '88;border-radius:8px;font:12px Georgia,serif;box-shadow:0 4px 16px rgba(0,0,0,.5);text-shadow:0 1px 2px #000';
  function crea() {
    const el = document.createElement('div');
    el.id = 'vxgruppo';
    el.style.cssText = CSS + ';left:10px;top:118px;width:200px;padding:6px 8px;display:none';
    for (const ev of ['mousedown', 'mouseup', 'click', 'dblclick', 'touchstart', 'touchend', 'pointerdown', 'pointerup', 'wheel']) el.addEventListener(ev, e => e.stopPropagation());
    el.addEventListener('click', e => {
      const b = e.target.closest('[data-a]'); if (!b) return;
      const a = b.getAttribute('data-a'), n = b.getAttribute('data-n');
      if (a === 'mini') { ridotto = !ridotto; LS.set('mini', ridotto); disegna(); }
      else if (a === 'esci') { if (confirm('Uscire dal gruppo?')) VXP.send(ID, 'esci', 1); }
      else if (a === 'tpa' && n) { opz(() => clog(NET.name, '/tpa ' + n, { me: 1 })); NET.send({ t: 'chat', s: '/tpa ' + n, z: Zk }); }
    });
    document.body.appendChild(el);
    wid = { el };
  }
  function disegna() {
    if (!wid) crea();
    if (!G) { wid.el.style.display = 'none'; return; }
    const io = G.membri.find(m => m.io), mz = io && io.z;
    let h = '<div style="display:flex;align-items:center;gap:5px;font-weight:bold;color:' + VERDE + '">' + icona('gente') + '<span>Gruppo ' + G.membri.length + '/' + G.max + '</span>' +
      '<span style="margin-left:auto;display:flex;gap:3px">' +
      '<button data-a="esci" title="Esci dal gruppo" style="' + BTN + '">Esci</button>' +
      '<button data-a="mini" title="' + (ridotto ? 'Mostra' : 'Riduci') + '" style="' + BTN + '">' + (ridotto ? '▴' : '▾') + '</button></span></div>';
    if (!ridotto) for (const m of G.membri) {
      if (m.io) continue;
      const pc = m.on && m.mx ? Math.max(0, Math.min(100, m.hp / m.mx * 100)) : 0, lontano = m.on && m.z !== mz;
      h += '<div style="margin-top:5px">' +
        '<div style="display:flex;align-items:center;gap:4px"><b style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:110px">' + (m.capo ? '★ ' : '') + esc(m.n) + '</b>' +
        '<span style="opacity:.7">Lv' + (m.lv | 0) + '</span>' +
        (lontano && OPZ.tpa ? '<button data-a="tpa" data-n="' + esc(m.n) + '" title="Chiedi a ' + esc(m.n) + ' di raggiungerlo (/tpa)" style="' + BTN + ';margin-left:auto">Raggiungi</button>' : '') + '</div>' +
        '<div style="height:5px;background:#0008;border-radius:2px;overflow:hidden;margin:2px 0"><i style="display:block;height:100%;width:' + pc + '%;background:' + (pc < 30 ? '#ff5a4a' : BARRA) + '"></i></div>' +
        '<div style="opacity:.75;font-size:11px">' + (m.on ? (m.z === mz ? 'qui con te' : esc(nomeZona(m.z))) : 'fuori dal gioco') + '</div></div>';
    }
    if (!ridotto && G.membri.length < 2) h += '<div style="opacity:.75;margin-top:4px">Invita qualcuno con /gruppo invita nome</div>';
    wid.el.innerHTML = h;
    posiziona();
  }
  // segue l'altezza dell'HUD (cresce con livello, oro, missioni…) e si nasconde quando l'HUD non c'è (menu, scene, editor)
  function posiziona() {
    if (!wid || !G) return;
    const b = document.body.classList, vis = b.contains('ig') && !b.contains('abin') && !b.contains('edcine') && opz(() => MODE) !== 'ed';
    wid.el.style.display = vis ? 'block' : 'none'; if (!vis) return;
    const hud = document.getElementById('hud'), r = hud && hud.getBoundingClientRect();
    const top = r && r.height ? Math.round(r.bottom + 8) : 118, left = r && r.height ? Math.max(8, Math.round(r.left)) : 10;
    if (wid.top !== top) { wid.top = top; wid.el.style.top = top + 'px'; }
    if (wid.left !== left) { wid.left = left; wid.el.style.left = left + 'px'; }
    // sotto il riquadro della Discoteca o del Borgo, se c'è
    const altri = [...document.querySelectorAll('body > div')].filter(d => d !== wid.el && d.style.position === 'fixed' && d.style.display !== 'none' && Math.abs(parseInt(d.style.top) - top) < 4 && parseInt(d.style.left) < 40);
    if (altri.length) { const r2 = altri[0].getBoundingClientRect(); wid.el.style.top = Math.round(r2.bottom + 8) + 'px'; wid.top = -1; }
  }
  setInterval(posiziona, 300);

  // ---------- l'invito, con Accetta e Rifiuta ----------
  function chiudiInvito() { if (inv) { clearTimeout(inv.t); inv.el.remove(); inv = null; } }
  function mostraInvito(d) {
    if (!d || !d.da) return; chiudiInvito();
    const el = document.createElement('div');
    el.id = 'vxgruppo-invito';
    el.style.cssText = CSS + ';left:50%;top:84px;transform:translateX(-50%);width:min(300px,calc(100vw - 32px));padding:10px 12px;text-align:center;border-color:' + BARRA;
    el.innerHTML = '<div style="font-weight:bold;color:' + VERDE + ';margin-bottom:4px">' + icona('gente', 16) + ' Invito in un gruppo</div>' +
      '<div><b>' + esc(d.da) + '</b> ti invita nel suo gruppo d\'avventura' + (d.n > 1 ? ' (' + d.n + ' eroi)' : '') + '.</div>' +
      '<div style="display:flex;gap:6px;margin-top:8px"><button data-r="1" style="' + BTN + ';flex:1;padding:6px;background:#2a6a46;font-size:13px">Accetta</button>' +
      '<button data-r="0" style="' + BTN + ';flex:1;padding:6px;font-size:13px">Rifiuta</button></div>';
    for (const ev of ['mousedown', 'mouseup', 'click', 'touchstart', 'touchend', 'pointerdown', 'pointerup', 'wheel']) el.addEventListener(ev, e => e.stopPropagation());
    el.addEventListener('click', e => { const b = e.target.closest('[data-r]'); if (!b) return; VXP.send(ID, 'risposta', { da: d.da, si: b.getAttribute('data-r') === '1' }); chiudiInvito(); });
    document.body.appendChild(el);
    inv = { el, da: d.da, t: setTimeout(chiudiInvito, Math.max(5, d.sec | 0) * 1000) };
    opz(() => tone(520, .08, 'triangle'));
  }

  // ---------- compagni evidenziati: nome verde e barra della vita sopra la testa, anche con i nomi spenti ----------
  // ent() disegna ogni personaggio sia col disegno classico sia col «rendering veloce» della 7.4, quindi basta avvolgere lei
  const USA = { ent: () => ent, label: () => label, PX: () => PX, PY: () => PY, SET: () => SET, NET: () => NET };
  const manca = Object.keys(USA).filter(k => opz(USA[k]) === undefined);
  if (manca.length) { console.warn('[plugin ' + ID + '] compagni sopra la testa spenti: il gioco non ha ' + manca.join(', ')); return; }
  const entPrima = ent;
  ent = function (e) {
    if (!e || e.k !== 'pl' || !ids.has(e.id)) return entPrima.apply(this, arguments);
    const nomi = SET.names; SET.names = 0;
    try { entPrima.apply(this, arguments); } finally { SET.names = nomi; }
    if (opz(() => OCC && OCC.intro)) return;
    const sx = PX(e.px, e.py), sy = PY(e.px, e.py, 0), top = 36;
    g.textAlign = 'center'; g.font = 'bold 11px Georgia,serif';
    label('◆ ' + e.n + ' Lv' + e.lv, sx, sy - top - 8, VERDE);
    g.fillStyle = '#000a'; g.fillRect(sx - 15, sy - top, 30, 5);
    g.fillStyle = BARRA; g.fillRect(sx - 15, sy - top, 30 * Math.max(0, Math.min(1, e.hp / (e.mx || 1))), 5);
  };
  // sulla minimappa i compagni sono quadratini verdi, più grandi degli altri eroi
  const miniPrima = opz(() => window.mini);
  if (typeof miniPrima === 'function') window.mini = function () {
    miniPrima.apply(this, arguments);
    if (!ids.size || !opz(() => SET.mini && MC)) return;
    if (SET.fast !== 0 && (opz(() => MINIF) & 1)) return;   // fotogramma saltato dalla minimappa veloce
    const s = 130 / N;
    for (const o of NET.list) if (ids.has(o.id)) { mm.fillStyle = '#000'; mm.fillRect(o.px * s - 4, o.py * s - 4, 8, 8); mm.fillStyle = BARRA; mm.fillRect(o.px * s - 3, o.py * s - 3, 6, 6); }
  };
}

module.exports = {
  name: "Gruppi d'avventura",
  version: '1.0',
  author: 'Voxelia',
  description: "Gruppi fino a 4 eroi: /gruppo, /gr per la chat, esperienza e oro condivisi sui boss",
  defaults: {
    massimo: 4,               // eroi per gruppo
    scadenzaInvitoSec: 60,    // dopo quanti secondi un invito senza risposta scade
    assenzaMin: 5,            // minuti fuori dal gioco prima di uscire dal gruppo
    quotaXp: 0.3,             // parte dell'esperienza del boss data a ogni compagno nello stesso dungeon
    oroPerLivello: 5,         // oro a ogni compagno: livello del dungeon × questo
    bonusCiclo: 0.25,         // premio in più per ogni ciclo del dungeon già completato (0.25 = +25%)
    pulsanteRaggiungi: true   // nel riquadro, "Raggiungi" manda /tpa (serve il plugin Teletrasporto)
  },

  setup(api) {
    const ID = api.id, C = () => api.config;
    const S = api.store; if (!S.gruppi || typeof S.gruppi !== 'object') S.gruppi = {};
    const key = n => String(n || '').toLowerCase();
    const bot = p => !!(globalThis.VoxeliaStress && globalThis.VoxeliaStress.bot(p));
    const inviti = new Map();        // chiave dell'invitato → [{ da: chiave, n: nome, t: scadenza }]
    const pronti = new Set();        // id dei giochi che hanno il codice del plugin
    const max = () => Math.max(2, Math.min(8, C().massimo | 0 || 4));

    const gruppoDi = k => { for (const id in S.gruppi) if (S.gruppi[id].membri[k]) return S.gruppi[id]; return null; };
    const membri = g => Object.keys(g.membri);
    const online = (g, k) => { const p = api.player(g.membri[k].n); return p && p.room === g.stanza ? p : null; };
    const aTutti = (g, testo, tranne) => { for (const k of membri(g)) if (k !== tranne) { const p = online(g, k); if (p) p.tell(testo); } };

    function stato(g) {
      const L = membri(g).map(k => { const p = online(g, k); return { k, id: p ? p.id : '', n: g.membri[k].n, on: p ? 1 : 0, lv: p ? p.lv : g.membri[k].lv | 0, hp: p ? p.hp : 0, mx: p ? p.maxHp : 0, z: p ? p.zone : '', capo: k === g.capo ? 1 : 0 }; });
      for (const m of L) { if (!m.on) continue; const p = online(g, m.k); if (!p || !pronti.has(p.id)) continue;
        p.send('stato', { max: max(), membri: L.map(x => ({ id: x.id, n: x.n, on: x.on, lv: x.lv, hp: x.hp, mx: x.mx, z: x.z, capo: x.capo, io: x.k === m.k ? 1 : 0 })) }); }
    }
    const nessuno = p => { if (p && pronti.has(p.id)) p.send('stato', null); };

    function sciogli(g, perche) {
      for (const k of membri(g)) { const p = online(g, k); if (p) { p.tell(perche || 'Il gruppo si è sciolto.'); nessuno(p); } }
      delete S.gruppi[g.id]; api.save(); api.log('gruppo sciolto: ' + membri(g).map(k => g.membri[k].n).join(', '));
    }
    function togli(g, k, testoAgliAltri) {
      const n = g.membri[k].n; delete g.membri[k];
      if (membri(g).length < 2) { sciogli(g, testoAgliAltri ? testoAgliAltri + ' Il gruppo si è sciolto.' : 'Il gruppo si è sciolto.'); return; }
      if (g.capo === k) { g.capo = membri(g).find(x => online(g, x)) || membri(g)[0]; aTutti(g, testoAgliAltri ? testoAgliAltri + ' Ora il capo è ' + g.membri[g.capo].n + '.' : 'Ora il capo è ' + g.membri[g.capo].n + '.'); }
      else if (testoAgliAltri) aTutti(g, testoAgliAltri);
      api.save(); stato(g); return n;
    }

    function invita(p, nome) {
      if (!nome) return 'Scrivi chi invitare: /gruppo invita nome';
      const q = api.player(nome);
      if (!q || q.room !== p.room) return nome + ' non è nella tua stanza in questo momento.';
      if (q.id === p.id) return 'Non puoi invitare te stesso.';
      if (bot(q)) return q.name + ' non risponde agli inviti.';
      const kp = key(p.name), kq = key(q.name), g = gruppoDi(kp);
      if (g && membri(g).length >= max()) return 'Il gruppo è già al completo (' + max() + ' eroi).';
      const gq = gruppoDi(kq);
      if (gq && g && gq === g) return q.name + ' è già nel tuo gruppo.';
      if (gq) return q.name + ' è già in un altro gruppo.';
      const L = (inviti.get(kq) || []).filter(i => i.da !== kp && i.t > Date.now());
      const sec = Math.max(10, C().scadenzaInvitoSec | 0 || 60);
      L.push({ da: kp, n: p.name, t: Date.now() + sec * 1000 }); inviti.set(kq, L);
      q.tell(p.name + ' ti invita nel suo gruppo d\'avventura: /gruppo accetta oppure /gruppo rifiuta.');
      if (pronti.has(q.id)) q.send('invito', { da: p.name, n: g ? membri(g).length : 1, sec });
      return 'Invito mandato a ' + q.name + '.';
    }

    function rispondi(p, da, si) {
      const kp = key(p.name), L = (inviti.get(kp) || []).filter(i => i.t > Date.now());
      const i = da ? L.find(x => x.da === key(da)) : L[L.length - 1];
      if (!i) { inviti.set(kp, L); return da ? 'Nessun invito da ' + da + ' (forse è scaduto).' : 'Non hai inviti in sospeso.'; }
      inviti.set(kp, L.filter(x => x !== i));
      if (pronti.has(p.id)) p.send('chiudiInvito', { da: i.n });
      const q = api.player(i.n);
      if (!si) { if (q) q.tell(p.name + ' ha rifiutato l\'invito nel gruppo.'); return 'Hai rifiutato l\'invito di ' + i.n + '.'; }
      if (!q || q.room !== p.room) return i.n + ' non è più nella tua stanza: l\'invito non vale più.';
      if (gruppoDi(kp)) return 'Sei già in un gruppo: prima /gruppo esci.';
      let g = gruppoDi(i.da);
      if (g && membri(g).length >= max()) return 'Il gruppo di ' + i.n + ' è già al completo.';
      if (!g) {
        const id = 'g' + Date.now().toString(36) + Math.floor(Math.random() * 1296).toString(36);
        g = S.gruppi[id] = { id, stanza: p.room, capo: i.da, nato: Date.now(), membri: {} };
        g.membri[i.da] = { n: q.name, lv: q.lv, via: 0 };
      }
      aTutti(g, p.name + ' si unisce al gruppo.');
      g.membri[kp] = { n: p.name, lv: p.lv, via: 0 };
      inviti.delete(kp); api.save(); stato(g);
      api.log(p.name + ' è entrato nel gruppo di ' + g.membri[g.capo].n);
      return 'Sei nel gruppo di ' + g.membri[g.capo].n + ': ' + membri(g).map(k => g.membri[k].n).join(', ') + '. Scrivi ai compagni con /gr testo.';
    }

    function esci(p) {
      const kp = key(p.name), g = gruppoDi(kp);
      if (!g) return 'Non sei in un gruppo.';
      togli(g, kp, p.name + ' ha lasciato il gruppo.'); nessuno(p);
      return 'Hai lasciato il gruppo.';
    }

    function descrivi(p) {
      const g = gruppoDi(key(p.name));
      if (!g) return 'Non sei in un gruppo. /gruppo invita nome per formarne uno (fino a ' + max() + ' eroi), /gr testo per la chat del gruppo.';
      const righe = membri(g).map(k => { const q = online(g, k), m = g.membri[k];
        return (k === g.capo ? '★ ' : '· ') + m.n + (q ? ' Lv' + q.lv + ' · ' + q.hp + '/' + q.maxHp + ' vita · ' + (q.id === p.id ? 'tu' : q.zone === p.zone ? 'qui con te' : 'in ' + zona(q.zone)) : ' · fuori dal gioco'); });
      return 'Il tuo gruppo (' + membri(g).length + '/' + max() + '):\n' + righe.join('\n') + (C().pulsanteRaggiungi ? '\nPer raggiungere un compagno: /tpa nome' : '');
    }

    api.command('gruppo', 'gruppo d\'avventura: invita, accetta, rifiuta, esci, caccia (/gruppo da solo dice chi c\'è)', (p, args) => {
      const sub = key(args[0]), nome = args.slice(1).join(' ').trim();
      if (!sub) return descrivi(p);
      if (sub === 'invita' || sub === 'inv') return invita(p, nome);
      if (sub === 'accetta' || sub === 'si' || sub === 'sì') return rispondi(p, nome, true);
      if (sub === 'rifiuta' || sub === 'no') return rispondi(p, nome, false);
      if (sub === 'esci' || sub === 'lascia') return esci(p);
      if (sub === 'caccia') {
        const g = gruppoDi(key(p.name));
        if (!g) return 'Non sei in un gruppo.';
        if (g.capo !== key(p.name)) return 'Solo il capo (' + g.membri[g.capo].n + ') può allontanare qualcuno.';
        const k = key(nome); if (!k || !g.membri[k] || k === g.capo) return 'Scrivi chi allontanare: /gruppo caccia nome';
        const q = online(g, k), n = g.membri[k].n;
        togli(g, k, 'Il capo ha allontanato ' + n + ' dal gruppo.'); if (q) { q.tell(p.name + ' ti ha allontanato dal gruppo.'); nessuno(q); }
        return n + ' non è più nel gruppo.';
      }
      if (sub === 'aiuto') return '/gruppo invita nome · /gruppo accetta · /gruppo rifiuta · /gruppo esci · /gruppo caccia nome (capo) · /gr testo';
      // "/gruppo nome" come scorciatoia per invitare
      return invita(p, args.join(' ').trim());
    });

    api.command('gr', 'scrivi ai compagni del tuo gruppo', (p, args, testo) => {
      const g = gruppoDi(key(p.name));
      if (!g) return 'Non sei in un gruppo: /gruppo invita nome per formarne uno.';
      const t = String(testo || '').trim().slice(0, 200);
      if (!t) return 'Scrivi il messaggio: /gr testo';
      for (const k of membri(g)) { const q = online(g, k); if (!q) continue;
        if (pronti.has(q.id)) q.send('chat', { n: p.name, s: t }); else q.tell('[gruppo] ' + p.name + ': ' + t); }
    });

    // dal gioco
    api.onClient('ciao', p => { if (!p) return; pronti.add(p.id); p.send('pronto', 1); const g = gruppoDi(key(p.name)); if (g) stato(g); });
    api.onClient('risposta', (p, d) => { if (!p || !d) return; const r = rispondi(p, String(d.da || '').slice(0, 24), !!d.si); if (r) p.tell(r); });
    api.onClient('esci', p => { if (p) p.tell(esci(p)); });

    api.on('join', p => {
      const k = key(p.name), g = gruppoDi(k); if (!g) return;
      if (g.stanza !== p.room) { togli(g, k, p.name + ' ha cambiato stanza e lascia il gruppo.'); p.tell('Hai cambiato stanza: non fai più parte del gruppo.'); return; }
      g.membri[k].via = 0; g.membri[k].n = p.name; api.save();
      aTutti(g, p.name + ' è di nuovo in gioco.', k);
      p.tell('Sei ancora nel gruppo: ' + membri(g).map(x => g.membri[x].n).join(', ') + '. /gruppo per vedere dove sono.');
    });
    api.on('leave', p => {
      pronti.delete(p.id);
      const k = key(p.name), g = gruppoDi(k);
      for (const [kq, L] of inviti) inviti.set(kq, L.filter(i => i.da !== k));
      inviti.delete(k);
      if (!g) return;
      g.membri[k].via = Date.now(); g.membri[k].lv = p.lv; api.save();
      const min = Math.max(0, +C().assenzaMin || 0);
      aTutti(g, p.name + ' ha chiuso il gioco' + (min ? ': resta nel gruppo per ' + min + (min === 1 ? ' minuto.' : ' minuti.') : '.'), k);
      if (!min) togli(g, k);
    });

    // bottino condiviso: i compagni nello stesso dungeon ricevono una parte dell'esperienza del boss e un po' d'oro
    api.on('dungeon', (p, d, ciclo) => {
      const g = gruppoDi(key(p.name)); if (!g || g.stanza !== p.room || !BOSS_XP[d]) return;
      const cfg = api.server.cfg, k = 1 + Math.max(0, +C().bonusCiclo || 0) * Math.max(0, (ciclo | 0) - 2);
      const xp = Math.round(BOSS_XP[d] * Math.max(0, +C().quotaXp || 0) * k * (cfg.xpm || 1));
      const oro = Math.round(DG_LV[d] * Math.max(0, +C().oroPerLivello || 0) * k * (cfg.gm || 1));
      if (!xp && !oro) return;
      const presi = [];
      for (const kq of membri(g)) {
        const q = online(g, kq); if (!q || q.id === p.id || String(q.zone).split('@')[0] !== d) continue;
        if (xp) q.give('xp', xp); if (oro) q.give('gold', oro); presi.push(q.name);
      }
      const premio = [xp ? '+' + xp + ' XP' : '', oro ? '+' + oro + ' oro' : ''].filter(Boolean).join(' e ');
      if (presi.length) {
        aTutti(g, p.name + ' ha sconfitto il boss ' + DG_DEL[d] + '! ' + premio + ' a ' + presi.join(', ') + '.');
        api.log(p.name + ' ha sconfitto il boss di ' + d + ': ' + premio + ' a ' + presi.join(', '));
      } else p.tell('Nessun compagno era nel dungeon con te: la parte del gruppo va solo a chi è dentro.');
    });

    // stato ai compagni ogni secondo; ogni 20 secondi escono quelli fuori dal gioco da troppo, e gli inviti scaduti
    api.every(1000, () => { for (const id in S.gruppi) stato(S.gruppi[id]); });
    api.every(20000, () => {
      const lim = Math.max(0, +C().assenzaMin || 0) * 60000, now = Date.now();
      for (const id in S.gruppi) { const g = S.gruppi[id];
        for (const k of membri(g)) { const m = g.membri[k]; if (!S.gruppi[id]) break;
          if (m.via && now - m.via >= lim && !online(g, k)) togli(g, k, 'Dopo ' + C().assenzaMin + ' minuti fuori dal gioco, ' + m.n + ' lascia il gruppo.'); } }
      for (const [k, L] of inviti) { const v = L.filter(i => i.t > now); if (v.length) inviti.set(k, v); else inviti.delete(k); }
    });

    // dopo un riavvio o un Ricarica: chi non è online parte da adesso a contare l'assenza
    for (const id in S.gruppi) { const g = S.gruppi[id]; if (!g || !g.membri) { delete S.gruppi[id]; continue; }
      for (const k of membri(g)) if (!online(g, k) && !g.membri[k].via) g.membri[k].via = Date.now(); }
    api.save();

    api.client('(' + nelGioco.toString() + ')(' + JSON.stringify(ID) + ',' + JSON.stringify({ tpa: !!C().pulsanteRaggiungi }) + ');');

    // per l'admin: i gruppi di adesso
    api.route('GET', '/', (req, res, x) => x.json(Object.values(S.gruppi).map(g => ({ stanza: g.stanza, capo: g.membri[g.capo] && g.membri[g.capo].n,
      membri: membri(g).map(k => ({ nome: g.membri[k].n, online: !!online(g, k), fuoriDa: g.membri[k].via ? Math.round((Date.now() - g.membri[k].via) / 1000) + ' s' : null })) }))), { admin: true });
  }
};
