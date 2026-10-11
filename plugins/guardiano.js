// Guardiano: cerca i segni dei trucchi e li elenca, con le prove, nella pagina admin /plugins/guardiano/.
// Controlla dal server: oro e livelli che crescono senza una spiegazione, vita massima impossibile per il livello, velocità
// e teletrasporti, piani dei dungeon saltati, boss a raffica, colpi PvP esagerati, scambi con oro che non si ha od oggetti
// impossibili, progressi fatti fuori dal server tra una sessione e l'altra.
// Nel tempo: confronta l'oro e l'esperienza guadagnati per ora di gioco con gli altri giocatori dello stesso livello
// (scopre chi bara poco alla volta) e tiene sul server una copia dell'eroe, confrontata al rientro.
// Mette anche un sensore nella pagina del gioco: riconosce il Cheat Menu (addon voxelia-cheats) e le funzioni del gioco
// sostituite, controlla statistiche, oggetti e frammenti dell'eroe, colpi impossibili sui mostri, eroe dentro i muri.
// Il sensore gira nel browser del giocatore, quindi un baro esperto può zittirlo: il Guardiano segnala anche quello.
// Regali che NON vanno segnalati: quelli del pannello admin e di tutti i plugin (p.give) li vede da solo, gli scambi pure.
// globalThis.VoxeliaGuardiano.grazia(nome, sec) resta per i plugin che regalano in altri modi.
// Di base segnala e basta: le azioni (ripristino, riporto in città, disconnessione) si accendono in guardiano.config.json.
// Automoderazione (spenta di base, si accende dalla pagina admin o in config): ogni segnalazione dà punti all'eroe,
// e superate le soglie scattano le sanzioni scelte (avviso, ripristino, città, silenzio, espulsione, sospensione a tempo).
const net = require('net');

// formule del gioco 7.3.2 (rarità, oggetti, vita, esperienza, dungeon)
const RM = [1, 1.4, 1.9, 2.8], SHARDS = ['tana', 'cripta', 'piramide', 'cristallo', 'fucina', 'abisso'];
const DG = { tana: [2, 2], cripta: [4, 3], piramide: [6, 3], cristallo: [8, 3], fucina: [10, 3], abisso: [12, 3], cittadella: [15, 4] };
const ibase = (s, lv) => (s === 'w' ? 5 : s === 'c' ? 4 : 2.5) + lv * (s === 'w' ? 2 : 1.4);
const need = lv => 20 + lv * lv * 11.5;
const vitaMin = lv => 60 + lv * 15;
const BUFF_MAX = 90, CASINO_MAX = 50000, GRAV = { bassa: 1, media: 2, alta: 3 };

// Il server non passa ai plugin i messaggi che manda: per vedere i regali (pannello admin e p.give di ogni plugin)
// il Guardiano legge i frame WebSocket in uscita {"t":"id"} e {"t":"adm"}. Uno solo per processo, tolto allo stop.
function tap() {
  if (globalThis.__guardianoTap) return globalThis.__guardianoTap;
  const proto = net.Socket.prototype, own = Object.prototype.hasOwnProperty.call(proto, 'write'), orig = proto.write;
  const T = { h: null, restore() { if (proto.write === w) { if (own) proto.write = orig; else delete proto.write; } delete globalThis.__guardianoTap; } };
  const w = function (d) {
    // frame di testo del server (non mascherato), piccolo: si guarda solo l'inizio
    if (T.h && Buffer.isBuffer(d) && d.length > 10 && d.length < 70000 && d[0] === 0x81 && !(d[1] & 128)) {
      const l = d[1] & 127, o = l === 126 ? 4 : l === 127 ? 10 : 2;
      if (d[o] === 123 && d[o + 1] === 34 && d[o + 2] === 116 && d[o + 5] === 34) try { T.h(this, d, o); } catch (e) {}
    }
    return orig.apply(this, arguments);
  };
  proto.write = w;
  return (globalThis.__guardianoTap = T);
}

// Sensore nella pagina del gioco (diventa testo con toString: niente variabili esterne)
function sensore(ID, INT) {
  if (window.__vxgSensore) return; window.__vxgSensore = 1;
  const WATCH = ['upd', 'hurtP', 'hurtE', 'die', 'kill', 'gainXP', 'recalc', 'roll', 'blk', 'mv', 'pay', 'sell', 'sellAll', 'pot', 'keyDir', 'load'];
  const SIG = /C\.god|C\.onehit|C\.nocd|C\.speed|C\.noclip|C\.aura|C\.magnet|C\.reach|__vxc|\[Cheat\]/;
  let ref = null, colpi = 0, colpiMax = 0, muri = 0, raffica = 0, k0 = null, kt = 0, zk0 = null, zt = 0, ultimo = '';
  const vivo = () => typeof P !== 'undefined' && P && typeof started !== 'undefined' && started && (typeof MODE === 'undefined' || MODE !== 'dim');
  function cattura() {
    // i colpi sui mostri passano da qui: il più forte possibile è l'Ombra (2,5 × 1,8 × critico 1,8 × tiro 1,2 = 9,72 volte l'attacco)
    const o = window.hurtE;
    if (typeof o === 'function') window.hurtE = function (e, d, rem) {
      try { if (!rem && e && e.k === 'en' && vivo() && typeof atk === 'function') { const a = Math.max(1, atk()); if (d > a * 9.72 * 1.05 + 2) { colpi++; colpiMax = Math.max(colpiMax, d / a); } } } catch (x) {}
      return o.apply(this, arguments);
    };
    ref = {}; for (const n of WATCH) ref[n] = window[n];
  }
  function segni() {
    const s = [];
    if (window.__vxc) s.push('oggetto __vxc del Cheat Menu');
    if (document.getElementById('vxc')) s.push('finestra #vxc del Cheat Menu');
    try { if (localStorage.getItem('voxelia-cheats') != null) s.push('impostazioni "voxelia-cheats" salvate nel browser'); } catch (e) {}
    for (const n of WATCH) { const f = window[n]; try { if (typeof f === 'function' && SIG.test(Function.prototype.toString.call(f))) s.push('funzione ' + n + ' riscritta dal Cheat Menu'); } catch (e) {} }
    return s;
  }
  // valore (abbondante) di risorse e pesci: se calano, l'oro che sale può venire dalla loro vendita
  function risorse() { let v = 0; try { for (const k in (P.res || {})) v += (P.res[k] | 0) * ((typeof RESP !== 'undefined' && RESP[k]) || 10); for (const k in (P.fish || {})) { const f = typeof FISHT !== 'undefined' && FISHT.find(q => q.id === k); v += (P.fish[k] | 0) * (f ? f.p : 30); } } catch (e) {} return v * 2; }
  const sostituite = () => ref ? WATCH.filter(n => window[n] !== ref[n]) : [];
  const ogg = i => i && typeof i === 'object' ? { u: String(i.u || '').slice(0, 16), s: i.s, r: +i.r || 0, v: +i.v || 0, n: String(i.n || '').slice(0, 40), p: +i.p || 0, hp: +i.hp || 0, cr: +i.cr || 0, up: +i.up || 0, ml: +i.ml || 0, ar: i.ar ? 1 : 0 } : null;
  function foto() {
    const eq = P.eq || {}, d = {};
    for (const k in (P.done || {})) if (P.done[k] > 0) d[k] = P.done[k] | 0;
    const f = { lv: P.lv, xp: P.xp, g: P.g, hp: P.hp, mx: P.mx, pot: P.pot, bA: P.bA || 0, bD: P.bD || 0, inv: typeof INV === 'number' ? INV : 24,
      eq: { w: ogg(eq.w), h: ogg(eq.h), c: ogg(eq.c), s: ogg(eq.s) }, it: (P.inv || []).slice(0, 80).map(ogg), ds: (P.stash || []).slice(0, 80).map(ogg), sh: (P.sh || []).slice(0, 20).map(String), done: d,
      rs: risorse(), z: typeof Zk === 'string' ? Zk : '', segni: segni(), fn: sostituite(), colpi, colpiMax: Math.round(colpiMax * 10) / 10, muri, raffica };
    colpi = 0; colpiMax = 0; muri = 0; raffica = 0;
    return f;
  }
  function invia() { try { if (vivo() && typeof NET !== 'undefined' && NET.ok && typeof VXP !== 'undefined') VXP.send(ID, 'foto', foto()); } catch (e) {} }
  const parti = () => { if (!ref) { cattura(); setInterval(invia, INT * 1000); } };
  if (document.readyState === 'complete') setTimeout(parti, 2000); else addEventListener('load', () => setTimeout(parti, 2000));
  // 4 volte al secondo: eroe dentro un muro (a parte i primi istanti dopo un cambio di zona) e mostri uccisi in un secondo
  setInterval(() => {
    try {
      if (!vivo()) return; const now = performance.now();
      if (Zk !== zk0) { zk0 = Zk; zt = now; }
      const b = ref && ref.blk || window.blk;
      if (typeof b === 'function' && now - zt > 2500 && Zk !== 'mare' && !P.dm && b(P.px, P.py)) muri++;
      if (k0 == null || now - kt > 3000) { k0 = P.kills | 0; kt = now; }
      else if (now - kt >= 1000) { raffica = Math.max(raffica, (P.kills | 0) - k0); k0 = P.kills | 0; kt = now; }
      // il Cheat Menu appena aperto si segnala subito, senza aspettare la foto successiva
      const s = segni().join('|'); if (s && s !== ultimo) { ultimo = s; invia(); }
    } catch (e) {}
  }, 250);
  // ripristino chiesto dal server (solo se l'admin lo ha acceso, o con il pulsante della pagina admin)
  if (typeof VXP !== 'undefined') VXP.on(ID, 'ripristina', d => {
    try {
      if (!vivo() || !d) return; const fatto = [];
      if (d.togli > 0) { P.g = Math.max(0, P.g - (d.togli | 0)); fatto.push('oro'); }
      if (d.oro != null && P.g > d.oro) { P.g = Math.max(0, d.oro | 0); fatto.push('oro'); }
      if (d.lv != null && P.lv > d.lv) { P.lv = Math.max(1, d.lv | 0); P.xp = Math.max(0, Math.min(d.xp | 0, need() - 1)); fatto.push('livello'); }
      if (Array.isArray(d.u) && d.u.length) {
        P.inv = P.inv.filter(i => !d.u.includes(i.u)); if (P.stash) P.stash = P.stash.filter(i => !d.u.includes(i.u));
        for (const s in P.eq) if (P.eq[s] && d.u.includes(P.eq[s].u)) P.eq[s] = s === 'w' ? { u: uid(), s: 'w', r: 0, v: 3, n: 'Pugnale', p: 0 } : null;
        fatto.push('oggetti');
      }
      if (d.sh) P.sh = P.sh.filter(s => P.done && P.done[s] > 0);
      if (Array.isArray(d.shTieni)) P.sh = P.sh.filter(s => d.shTieni.includes(s));
      if (P.bA > 90) P.bA = 90; if (P.bD > 90) P.bD = 90;
      recalc(); P.hp = Math.min(P.hp, P.mx); hud(); save();
      msg('Il Guardiano ha ripristinato ' + (fatto.length ? [...new Set(fatto)].join(', ') : 'le statistiche') + ': ' + (d.perche || 'valori non validi'));
    } catch (e) {}
  });
}

module.exports = {
  name: 'Guardiano',
  version: '2.2',
  author: 'Voxelia',
  description: 'Riconosce oro, livelli, statistiche e oggetti ottenuti con trucchi o cheat esterni; pagina admin con le prove',
  defaults: {
    azione: 'segnala',      // cosa fare alle segnalazioni abbastanza gravi: 'segnala', 'ripristina' (toglie oro, livelli, oggetti), 'citta' o 'espelli'
    azioneDa: 'alta',       // gravità minima per l'azione: 'alta' (prove sicure) o 'media' (anche i sospetti)
    espelliDopo: 0,         // disconnette dopo questo numero di segnalazioni gravi nella stessa sessione (0 = mai)
    oroSecondo: 12000,      // oro guadagnato in un secondo senza spiegazione (regali, scambi, vendite) oltre il quale si segnala
    oroMinuto: 20000,       // oro senza spiegazione in un minuto: oroMinuto + oroMinutoPerLivello × livello (per il moltiplicatore d'oro del server)
    oroMinutoPerLivello: 2000,
    livelliSecondo: 2,      // livelli guadagnati in un secondo senza un regalo
    livelli10Minuti: 8,     // livelli in 10 minuti (dal livello 10 in su)
    livelloMax: 150,        // nessuno può arrivare oltre
    velocitaMax: 9,         // caselle al secondo per 3 secondi di fila (l'eroe ne fa 3,9)
    salto: 15,              // caselle in un colpo solo nella stessa zona = teletrasporto
    bossPausaSec: 60,       // secondi minimi tra due boss di dungeon dello stesso eroe
    bloccaBossSospetti: true, // un boss troppo ravvicinato o fuori dal dungeon non fa avanzare il ciclo
    dannoPvpMax: 3000,      // danno massimo di un colpo PvP, più dannoPvpPerLivello per livello
    dannoPvpPerLivello: 400,
    bloccaColpiEccessivi: false,
    bloccaScambiSospetti: true, // blocca offerte con oro che non si ha e oggetti impossibili (scambi e oggetti a terra)
    travasoOro: 100000,     // oro dato in un solo scambio oltre il quale si annota (spesso un conto baro che passa oro a un altro)
    livelliFuori: 5,        // tra una sessione e l'altra: livelli in più rispetto all'ultima uscita (0 = non controllare)
    oroFuori: 100000,       //   e oro in più
    statistiche: true,      // confronta i guadagni per ora di gioco con gli altri giocatori della stessa fascia di 10 livelli
    statMultiplo: 5,        //   segnala chi guadagna più di tante volte la mediana della fascia
    statOreMin: 1,          //   dopo almeno tante ore di gioco nella fascia
    statGiocatoriMin: 3,    //   e solo se nella fascia ci sono almeno tanti altri giocatori con mezz'ora di gioco
    copia: 'segnala',       // copia dell'eroe sul server, confrontata al rientro: 'segnala', 'rimetti' (toglie quanto c'è in più) o 'spento'
    sensore: true,          // sensore nella pagina del gioco (arriva a chi ricarica la pagina)
    sensoreSec: 5,          // ogni quanti secondi il sensore manda la foto dell'eroe
    senzaSensore: 'ignora', // chi gioca senza sensore dopo 60 secondi: 'ignora', 'segnala' o 'espelli'
    graziaSec: 30,          // dopo VoxeliaGuardiano.grazia(nome) per quanti secondi non si guardano oro e livelli
    maxSegnalazioni: 500,
    // Automoderazione: quando è attiva prende il posto di azione/azioneDa/espelliDopo.
    // punti: quanti ne vale una segnalazione per gravità; puntiTipo: valori diversi per tipi precisi (es. "cheat menu").
    // I punti scadono dopo scadenzaOre. Ogni regola scatta una volta quando i punti la raggiungono; se i punti scendono
    // sotto la soglia (scadono o l'admin li azzera) può scattare di nuovo. Azioni: avvisa, ripristina, citta, silenzia (ore),
    // espelli, sospendi (ore, 0 = per sempre). Un messaggio facoltativo arriva al giocatore.
    automoderazione: {
      attiva: false,
      punti: { alta: 10, media: 3, bassa: 0 },
      puntiTipo: { 'cheat menu': 30 },
      scadenzaOre: 72,
      regole: [
        { punti: 10, azione: 'avvisa', messaggio: 'Il Guardiano ha notato qualcosa di strano nella tua partita. Se continua scatteranno delle sanzioni.' },
        { punti: 20, azione: 'ripristina' },
        { punti: 30, azione: 'espelli' },
        { punti: 60, azione: 'sospendi', ore: 24 },
        { punti: 120, azione: 'sospendi', ore: 168 }
      ],
      sospendiIp: false,  // la sospensione vale anche per l'indirizzo IP (attenzione: case e scuole condividono l'IP)
      annuncia: false,    // annuncia nella stanza espulsioni e sospensioni
      esenti: []          // nomi a cui non si applica (admin, tester)
    }
  },

  setup(api) {
    const C = api.config, stato = new Map(), grazie = new Map(), chiave = n => String(n).toLowerCase();
    const st = () => { const s = api.store; if (!Array.isArray(s.lista)) s.lista = []; for (const k of ['storico', 'stat', 'statSegn', 'copie', 'mod', 'sospesi', 'silenziati']) if (!s[k] || typeof s[k] !== 'object') s[k] = {}; return s; };
    const X = p => { let x = stato.get(p.id); if (!x) stato.set(p.id, x = { id: p.id, nome: p.name, crediti: [], guadagni: [], livelli: [], chiavi: new Set(), gravi: 0, entrato: Date.now() }); return x; };
    const fmt = n => Math.round(n).toLocaleString('it-IT');

    globalThis.VoxeliaGuardiano = {
      grazia: (nome, sec) => grazie.set(chiave(nome), Date.now() + 1000 * (sec || C.graziaSec || 30)),
      // per i plugin che vogliono dire esattamente quanto hanno dato
      credito: (nome, oro, livelli) => { const p = api.player(nome); if (p) credita(X(p), oro, livelli); }
    };
    const inGrazia = p => (grazie.get(chiave(p.name)) || 0) > Date.now();
    // i bot del plugin Stress test non si salvano
    const finto = p => !!(globalThis.VoxeliaStress && globalThis.VoxeliaStress.bot(p));
    const credita = (x, oro, livelli, fonte) => x.crediti.push({ t: Date.now(), oro: Math.max(0, +oro || 0), lv: Math.max(0, +livelli || 0), fonte: fonte || 'plugin' });

    function segnala(p, tipo, dettaglio, o) {
      o = o || {}; if (finto(p)) return;
      const x = X(p), g = o.g || 'media';
      if (o.chiave) { if (x.chiavi.has(o.chiave)) return; x.chiavi.add(o.chiave); }
      const s = st();
      let prove = o.prove; try { if (prove && JSON.stringify(prove).length > 3000) prove = { nota: 'prove troppo lunghe, tagliate', inizio: JSON.stringify(prove).slice(0, 2500) }; } catch (e) { prove = null; }
      s.lista.push({ t: Date.now(), nome: p.name, ip: p.ip, stanza: p.room, zona: p.zone, lv: p.lv, oro: p.gold, tipo, g, dettaglio, prove });
      if (s.lista.length > (C.maxSegnalazioni || 500)) s.lista.splice(0, s.lista.length - (C.maxSegnalazioni || 500));
      api.save();
      api.log(p.name + ': ' + tipo + ' [' + g + '] (' + dettaglio + ')');
      if (AM().attiva) { automodera(p, tipo, g); return; }
      if (GRAV[g] < (GRAV[C.azioneDa] || 3)) return;
      x.gravi++;
      if (C.espelliDopo > 0 && x.gravi >= C.espelliDopo) { p.kick('comportamento sospetto'); return; }
      if (C.azione === 'espelli') p.kick('comportamento sospetto (' + tipo + ')');
      else if (C.azione === 'citta') { p.toTown(); p.tell('Il Guardiano ti ha riportato ad Aldoria: ' + tipo + '.'); }
      else if (C.azione === 'ripristina') { if (o.rip) ripristina(p, Object.assign({ perche: tipo }, o.rip)); if (o.citta) p.toTown(); }
    }
    function ripristina(p, d) { if (C.sensore) p.send('ripristina', d); }
    // ripristino completo: oro e livello di inizio sessione, oggetti impossibili, frammenti senza boss
    function ripristinoCompleto(p, perche) {
      const s = stato.get(p.id) || {}; if (!s.foto) return false;
      const u = []; for (const i of ['w', 'h', 'c', 's'].map(k => s.foto.eq && s.foto.eq[k]).concat(s.foto.it || [], s.foto.ds || [])) if (i && oggettoStrano(i, p.lv)) u.push(String(i.u));
      ripristina(p, Object.assign({ perche, sh: 1, u }, s.inizio ? { oro: s.inizio.oro, lv: s.inizio.lv, xp: s.inizio.xp } : {}));
      return s.inizio || true;
    }

    // ---------- automoderazione ----------
    const AMD = module.exports.defaults.automoderazione;
    const AM = () => { const a = Object.assign({}, AMD, C.automoderazione || {}); a.punti = Object.assign({}, AMD.punti, a.punti || {}); a.puntiTipo = Object.assign({}, a.puntiTipo || {}); if (!Array.isArray(a.regole)) a.regole = AMD.regole; if (!Array.isArray(a.esenti)) a.esenti = []; return a; };
    const oreTxt = n => n === 1 ? '1 ora' : n + ' ore';
    const quando = t => new Date(t).toLocaleString('it-IT', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
    function puntiDi(nome) {
      const s = st(), m = s.mod[chiave(nome)]; if (!m) return 0;
      const lim = Date.now() - AM().scadenzaOre * 3600000; m.punti = m.punti.filter(q => q.t >= lim);
      return m.punti.reduce((a, q) => a + q.p, 0);
    }
    function automodera(p, tipo, g) {
      const a = AM(); if (a.esenti.some(n => chiave(n) === chiave(p.name))) return;
      const pt = Math.max(0, +(tipo in a.puntiTipo ? a.puntiTipo[tipo] : a.punti[g]) || 0); if (!pt) return;
      const s = st(), k = chiave(p.name), m = s.mod[k] || (s.mod[k] = { nome: p.name, punti: [], fatte: [], storia: [] });
      const prima = puntiDi(p.name); m.punti.push({ t: Date.now(), p: pt, tipo }); const ora = prima + pt;
      // una regola già applicata torna libera se i punti sono scesi sotto la sua soglia
      m.fatte = m.fatte.filter(i => a.regole[i] && prima >= +a.regole[i].punti);
      const da = a.regole.map((r, i) => ({ r, i })).filter(({ r, i }) => ora >= +r.punti && !m.fatte.includes(i)).sort((x, y) => x.r.punti - y.r.punti);
      for (const { r, i } of da) { m.fatte.push(i); sanziona(p, r, ora, tipo, m, a); if (!p.online) break; }
      if (m.storia.length > 50) m.storia.splice(0, m.storia.length - 50);
      api.save();
    }
    function sanziona(p, r, punti, tipo, m, a) {
      const s = st(), k = chiave(p.name), ore = Math.max(0, +r.ore || 0), msgp = r.messaggio ? String(r.messaggio).slice(0, 200) : '';
      let fatto = '';
      if (r.azione === 'avvisa') { p.tell('🛡 ' + (msgp || 'Il Guardiano ti tiene d\'occhio: ' + tipo + '.')); fatto = 'avvisato'; }
      else if (r.azione === 'ripristina') { const ok = ripristinoCompleto(p, 'automoderazione (' + tipo + ')'); if (msgp) p.tell('🛡 ' + msgp); fatto = ok ? 'ripristinato a inizio sessione' : 'ripristino non possibile (senza sensore)'; }
      else if (r.azione === 'citta') { p.toTown(); p.tell('🛡 ' + (msgp || 'Il Guardiano ti ha riportato ad Aldoria.')); fatto = 'riportato in città'; }
      else if (r.azione === 'silenzia') { const fino = ore ? Date.now() + ore * 3600000 : 0; s.silenziati[k] = { nome: p.name, fino, motivo: tipo, t: Date.now() }; p.tell('🛡 ' + (msgp || 'Non puoi scrivere in chat ' + (fino ? 'fino al ' + quando(fino) : 'finché l\'admin non lo decide') + '.')); fatto = 'silenziato ' + (ore ? 'per ' + oreTxt(ore) : 'senza scadenza'); }
      else if (r.azione === 'espelli') { if (a.annuncia) api.announce('🛡 ' + p.name + ' è stato espulso dal Guardiano.', p.room); p.kick(msgp || 'espulso dal Guardiano (' + tipo + ')'); fatto = 'espulso'; }
      else if (r.azione === 'sospendi') {
        const fino = ore ? Date.now() + ore * 3600000 : 0;
        s.sospesi[k] = { nome: p.name, ip: a.sospendiIp ? p.ip : '', fino, motivo: tipo, punti, t: Date.now() };
        if (a.annuncia) api.announce('🛡 ' + p.name + ' è stato sospeso dal Guardiano' + (fino ? ' fino al ' + quando(fino) : '') + '.', p.room);
        p.kick(msgp || 'sospeso dal Guardiano ' + (fino ? 'fino al ' + quando(fino) : 'senza scadenza') + ' (' + tipo + ')');
        fatto = 'sospeso ' + (ore ? 'per ' + oreTxt(ore) : 'per sempre');
      } else fatto = 'azione sconosciuta: ' + r.azione;
      m.storia.push({ t: Date.now(), azione: fatto, punti, tipo });
      api.log('automoderazione: ' + p.name + ' ' + fatto + ' (' + punti + ' punti, ultima segnalazione: ' + tipo + ')');
    }
    // sospesi: fuori appena entrano; silenziati: la chat non passa
    const sospeso = p => { const s = st(), ora = Date.now();
      for (const [k, v] of Object.entries(s.sospesi)) if (v.fino && v.fino < ora) { delete s.sospesi[k]; api.save(); }
      return s.sospesi[chiave(p.name)] || Object.values(s.sospesi).find(v => v.ip && v.ip === p.ip); };
    api.on('join', p => {
      if (finto(p)) return; const v = sospeso(p); if (!v) return;
      api.log('automoderazione: rifiutato ' + p.name + ' (sospeso' + (v.fino ? ' fino al ' + quando(v.fino) : '') + ')');
      p.kick('sei sospeso da questo server ' + (v.fino ? 'fino al ' + quando(v.fino) : 'senza scadenza') + ' (' + v.motivo + ')');
    });
    api.on('chat', p => {
      const s = st(), v = s.silenziati[chiave(p.name)]; if (!v) return;
      if (v.fino && v.fino < Date.now()) { delete s.silenziati[chiave(p.name)]; api.save(); return; }
      p.tell('🛡 Sei silenziato dal Guardiano ' + (v.fino ? 'fino al ' + quando(v.fino) : 'senza scadenza') + '.'); return false;
    });

    // ---------- regali visti in uscita: pannello admin e p.give di tutti i plugin ----------
    const T = tap();
    T.h = (sock, d, o) => {
      const s = d.toString('utf8', o, Math.min(d.length, o + 400));
      if (s.startsWith('{"t":"id","id":"')) { sock.__vxgId = s.slice(16, s.indexOf('"', 16)); return; }
      const adm = s.startsWith('{"t":"adm"'), dep = s.startsWith('{"t":"x"') && s.includes('"e":"oro"');
      if (!(adm || dep) || !sock.__vxgId) return;
      let j; try { j = JSON.parse(d.toString('utf8', o)); } catch (e) { return; }
      const p = api.player(sock.__vxgId); if (!p) return;
      // oro ritirato dal deposito di casa (plugin housing) o restituito perché il deposito non l'ha preso
      if (dep) { const q = j.d || {}, n = Math.max(0, (+q.ricevi || 0) + (+q.ko || 0)); if (n) credita(X(p), n, 0, 'deposito di ' + j.pl); return; }
      const x = X(p), n = Math.max(0, j.n | 0), fonte = j.by ? 'regalo di ' + j.by : 'regalo dal pannello admin';
      if (j.a === 'gold') credita(x, n, 0, fonte);
      else if (j.a === 'lv') credita(x, 0, n, fonte);
      else if (j.a === 'xp') credita(x, 0, livelliDaXp(p.lv, x.foto ? x.foto.xp : 0, n), fonte);
      else if (j.a === 'tp') x.tp = Date.now();
    };
    function livelliDaXp(lv, xp, n) { let k = 0; xp = (+xp || 0) + n; while (xp >= need(lv + k) && k < 60) { xp -= need(lv + k); k++; } return k; }
    // consuma i crediti tra 10 s prima e 8 s dopo il guadagno; restituisce quanto spiegano
    function spiega(x, t, campo, quanto) {
      let tot = 0; const fonti = {};
      for (const c of x.crediti) if (c[campo] > 0 && c.t >= t - 10000 && c.t <= t + 8000 && tot < quanto) { const u = Math.min(c[campo], quanto - tot); c[campo] -= u; tot += u; fonti[c.fonte] = (fonti[c.fonte] || 0) + u; }
      return { tot, fonti };
    }

    // il livello più alto che una zona può avere ora (cicli dei dungeon delle stanze viste): serve per i limiti degli oggetti
    const zonaMax = () => { const s = st(); return Math.max(20, s.zonaMax || 0); };
    function aggiornaZone() {
      const s = st(); let m = s.zonaMax || 0;
      for (const room of Object.keys(api.rooms())) { const r = api.server.runs(room); for (const d in DG) m = Math.max(m, DG[d][0] + 3 * (r[d] || 0) + DG[d][1] - 1 + 3); }
      if (m !== s.zonaMax) { s.zonaMax = m; api.save(); }
    }
    const lvOggettiMax = lv => Math.max(2 * lv + 10, zonaMax() + 4);
    // vita massima più alta possibile: 60 + 15/livello + elmo, corazza e scudo migliori (unici e arena: base + 3 × livello oggetto)
    const vitaMax = lv => { const L = lvOggettiMax(lv); return vitaMin(lv) + 420 + 9 * L; };

    // un oggetto che il gioco non può creare: restituisce il motivo, o '' se va bene
    function oggettoStrano(it, lv) {
      if (!it || typeof it !== 'object') return 'oggetto non valido';
      const s = it.s, r = +it.r, v = +it.v, p = +it.p || 0, hp = +it.hp || 0, cr = +it.cr || 0, up = +it.up || 0, ml = +it.ml || 0;
      if (!['w', 'h', 'c', 's'].includes(s)) return 'tipo di oggetto sconosciuto';
      if (it.ar ? r !== 4 : !(r >= 0 && r <= 3 && r % 1 === 0)) return 'rarità ' + r + ' inesistente';
      if (!(v >= 1) || !isFinite(v)) return 'valore ' + v + ' non valido';
      if (up < 0 || up > 5 || up % 1) return 'potenziamento +' + up + ' (il fabbro arriva a +5)';
      if (ml < 0 || ml > 10 || ml % 1) return 'maestria ' + ml + ' (massimo 10)';
      if (cr < 0 || cr > 20) return 'critico +' + cr + '% (il massimo nel gioco è 20%)';
      if (hp < 0 || p < 0) return 'valori negativi';
      // livello dell'oggetto ricavato dal valore: il minimo (tiro migliore da unico) e il massimo (tiro peggiore)
      const k = s === 'w' ? 2 : 1.4, b = ibase(s, 0), alto = it.ar ? 3.9 : RM[r] * 1.15 * 1.15, basso = it.ar ? 3.2 : RM[r] * .85;
      const lvMin = (v / alto - b) / k, lvTop = (v / basso - b) / k + 1, L = lvOggettiMax(lv);
      if (lvMin > L) return 'valore ' + v + ' possibile solo da un oggetto di livello ' + Math.ceil(lvMin) + ' (ora al massimo ' + L + ')';
      if (hp > 160 + 3 * Math.max(0, lvTop)) return 'punti vita +' + hp + ' troppo alti per un oggetto di valore ' + v;
      if (p > v * 6 * Math.pow(1.15, up) + 5 + up) return 'prezzo di vendita ' + p + ' troppo alto per un oggetto di valore ' + v;
      return '';
    }
    const descr = it => (it && it.n ? it.n : 'oggetto') + (it && it.up ? ' +' + it.up : '') + ' (' + ['comune', 'raro', 'epico', 'leggendario', 'arena'][+it.r] + ', valore ' + it.v + (it.hp ? ', vita +' + it.hp : '') + (it.cr ? ', critico +' + it.cr + '%' : '') + ')';
    const pulito = it => it && typeof it === 'object' ? { n: String(it.n || '').slice(0, 40), s: it.s, r: it.r, v: it.v, p: it.p, hp: it.hp, cr: it.cr, up: it.up, ml: it.ml, ar: it.ar ? 1 : 0 } : it;

    // ---------- ogni secondo: oro, livelli, vita, posizione ----------
    api.every(1000, () => {
      const ora = Date.now(), visti = new Set(), gm = Math.max(.5, +api.server.cfg.gm || 1);
      for (const p of api.players()) {
        if (finto(p)) continue;
        visti.add(p.id);
        const x = X(p), prima = x.ultimo;
        if (!x.inizio && p.lv > 0) x.inizio = { oro: p.gold, lv: p.lv, t: ora };
        if (!x.storico && p.lv > 0) { x.storico = 1; confrontaStorico(p, x); if (C.statistiche) confrontaGuadagni(p); }
        if (prima && p.lv > 0 && prima.lv > 0) {
          const a = acc(x, p.lv); a.sec += (ora - prima.t) / 1000;
          if (p.gold > prima.oro) x.guadagni.push({ t: ora, d: p.gold - prima.oro, prima: prima.oro, zona: p.zone, grazia: inGrazia(p) });
          if (p.lv > prima.lv) x.livelli.push({ t: ora, d: p.lv - prima.lv, da: prima.lv, grazia: inGrazia(p) });
          // movimento: solo nella stessa zona
          if (prima.zona === p.zone && p.zone && p.zone !== 'mare') {
            const dt = (ora - prima.t) / 1000, dist = Math.hypot(p.x - prima.x, p.y - prima.y), v = dist / Math.max(dt, .2);
            x.veloci = v > C.velocitaMax ? (x.veloci || 0) + 1 : 0;
            if (x.veloci === 3) segnala(p, 'velocità', v.toFixed(1) + ' caselle al secondo per 3 secondi in ' + p.zone + ' (normale 3,9)', { g: 'media', prove: { velocita: +v.toFixed(1), zona: p.zone } });
            // salto lungo: non conta l'arena (si rinasce nella sala), la morte (vita di nuovo piena) e il teletrasporto dato da un admin o plugin
            const rinato = prima.hp < prima.mx * .35 && p.hp >= p.maxHp;
            if (dist > C.salto && dt < 2.5 && p.zone !== 'arena' && !rinato && ora - (x.tp || 0) > 5000 && ora - (x.saltoT || 0) > 30000 && (x.saltoT = ora))
              segnala(p, 'teletrasporto', fmt(dist) + ' caselle in ' + dt.toFixed(1) + ' s nella stessa zona (' + p.zone + ')', { g: 'media', prove: { da: [prima.x, prima.y], a: [p.x, p.y], zona: p.zone } });
          } else x.veloci = 0;
          // vita: per 2 secondi di fila (il gioco aggiorna vita e livello insieme)
          const strana = p.hp > p.maxHp + 1 ? 'vita ' + p.hp + ' sopra la vita massima ' + p.maxHp
            : p.maxHp < vitaMin(p.lv) - 1 ? 'vita massima ' + p.maxHp + ' sotto il minimo del livello ' + p.lv + ' (' + vitaMin(p.lv) + '): livello cambiato a mano'
            : p.maxHp > vitaMax(p.lv) ? 'vita massima ' + p.maxHp + ' impossibile al livello ' + p.lv + ' (al massimo ' + vitaMax(p.lv) + ')' : '';
          x.vitaStrana = strana ? (x.vitaStrana || 0) + 1 : 0;
          if (x.vitaStrana === 2) segnala(p, 'statistiche', strana, { g: 'alta', chiave: 'vita:' + p.lv + ':' + p.maxHp, prove: { lv: p.lv, vita: p.hp, vitaMax: p.maxHp, minimo: vitaMin(p.lv), massimo: vitaMax(p.lv) },
            rip: x.inizio && p.lv > x.inizio.lv ? { lv: x.inizio.lv, xp: 0 } : null });
          if (p.lv > C.livelloMax) segnala(p, 'livello', 'livello ' + p.lv + ' oltre il massimo ' + C.livelloMax, { g: 'alta', chiave: 'lvmax', rip: x.inizio ? { lv: Math.min(x.inizio.lv, C.livelloMax), xp: 0 } : null });
        }
        valuta(p, x, ora, gm);
        if (C.sensore && C.senzaSensore !== 'ignora' && !x.foto && !x.avvisato && ora - x.entrato > 60000) {
          x.avvisato = 1;
          if (C.senzaSensore === 'espelli') p.kick('ricarica la pagina del gioco per giocare su questo server');
          else segnala(p, 'senza sensore', 'nessuna foto dal sensore dopo 60 secondi (pagina vecchia o sensore bloccato)', { g: 'bassa' });
        }
        // sensore zittito: mandava le foto e ha smesso
        if (x.foto && ora - x.fotoT > Math.max(30, C.sensoreSec * 5) * 1000) segnala(p, 'sensore zittito', 'il sensore mandava le foto e ha smesso da ' + Math.round((ora - x.fotoT) / 1000) + ' s', { g: 'media', chiave: 'zitto:' + x.fotoT });
        x.ultimo = { t: ora, oro: p.gold, lv: p.lv, x: p.x, y: p.y, zona: p.zone, hp: p.hp, mx: p.maxHp };
        if (ora - (x.salvato || 0) > 60000) { x.salvato = ora; ricorda(p, x); }
      }
      for (const [id, x] of stato) if (!visti.has(id)) stato.delete(id);
      for (const [k, t] of grazie) if (t < ora) grazie.delete(k);
      if (!api.__zt || ora - api.__zt > 60000) { api.__zt = ora; aggiornaZone(); }
      if (C.statistiche && (!api.__st || ora - api.__st > 600000)) { api.__st = ora; confrontaGuadagni(); }
    });

    // oro e livelli si giudicano 6 secondi dopo: così arrivano i crediti (regali, scambi) e la foto del sensore (vendite)
    function valuta(p, x, ora, gm) {
      while (x.guadagni.length && ora - x.guadagni[0].t > 6000) {
        const q = x.guadagni.shift();
        const sp = q.grazia ? { tot: q.d, fonti: { grazia: q.d } } : spiega(x, q.t, 'oro', q.d), resto = q.d - sp.tot;
        // per le statistiche conta quello che si guadagna giocando (anche vendendo), non i regali, gli scambi e il deposito
        acc(x, p.lv).oro += q.d - Object.entries(sp.fonti).filter(([k]) => /^(regalo|scambio|deposito|grazia|plugin)/.test(k)).reduce((a, [, v]) => a + v, 0);
        if (resto <= 0) continue;
        const soglia = q.zona === 'in_casino' ? Math.max(C.oroSecondo, CASINO_MAX) : C.oroSecondo * gm;
        // quello già segnalato qui non si ripete nella finestra di un minuto
        (x.inspiegato || (x.inspiegato = [])).push({ t: q.t, d: resto > soglia ? 0 : resto, casino: q.zona === 'in_casino' });
        if (resto > soglia) segnala(p, 'oro', '+' + fmt(q.d) + ' oro in un secondo, ' + fmt(resto) + ' senza spiegazione', { g: x.foto && resto > 2 * soglia ? 'alta' : 'media',
          prove: { prima: q.prima, dopo: q.prima + q.d, guadagno: q.d, spiegato: sp.fonti, inspiegato: resto, zona: q.zona, sensore: !!x.foto }, rip: { togli: resto } });
      }
      while (x.livelli.length && ora - x.livelli[0].t > 6000) {
        const q = x.livelli.shift();
        const sp = q.grazia ? { tot: q.d, fonti: { grazia: q.d } } : spiega(x, q.t, 'lv', q.d), resto = q.d - sp.tot;
        for (let l = q.da + sp.tot; l < q.da + q.d; l++) acc(x, p.lv).xp += need(l);
        if (resto <= 0) continue;
        (x.livInsp || (x.livInsp = [])).push({ t: q.t, d: resto > C.livelliSecondo ? 0 : resto, da: q.da });
        if (resto > C.livelliSecondo) segnala(p, 'livello', 'dal livello ' + q.da + ' al ' + (q.da + q.d) + ' in un secondo', { g: 'alta', prove: { da: q.da, a: q.da + q.d, spiegato: sp.fonti }, rip: { lv: q.da, xp: 0 } });
      }
      // finestre lunghe
      const I = x.inspiegato || [], L = x.livInsp || [];
      while (I.length && ora - I[0].t > 600000) I.shift();
      while (L.length && ora - L[0].t > 600000) L.shift();
      if (ora - (x.finestra || 0) > 5000) {
        x.finestra = ora;
        const min = I.filter(q => ora - q.t <= 60000 && !q.casino).reduce((a, q) => a + q.d, 0), lim = (C.oroMinuto + C.oroMinutoPerLivello * p.lv) * gm;
        if (min > lim && ora - (x.oroMinT || 0) > 60000) { x.oroMinT = ora; segnala(p, 'oro', fmt(min) + ' oro senza spiegazione nell\'ultimo minuto (soglia ' + fmt(lim) + ')', { g: 'media', prove: { minuto: min, soglia: lim, sensore: !!x.foto } }); }
        const lv10 = L.reduce((a, q) => a + q.d, 0);
        if (L.length && L[0].da >= 10 && lv10 > C.livelli10Minuti && ora - (x.lvMinT || 0) > 600000) { x.lvMinT = ora; segnala(p, 'livello', lv10 + ' livelli in 10 minuti (dal ' + L[0].da + ')', { g: 'media', prove: { livelli: lv10, da: L[0].da } }); }
      }
      x.crediti = x.crediti.filter(c => ora - c.t < 30000 && (c.oro > 0 || c.lv > 0));
    }

    // ---------- guadagni per ora di gioco, per fascia di 10 livelli ----------
    const fascia = lv => Math.floor(lv / 10);
    const nomeFascia = b => 'livelli ' + (b * 10 || 1) + '-' + (b * 10 + 9);
    function acc(x, lv) { const b = fascia(lv); if (!x.acc || x.acc.b !== b) { versa(x); x.acc = { b, sec: 0, oro: 0, xp: 0 }; } return x.acc; }
    // passa i conteggi della sessione nello store (ogni minuto e all'uscita)
    function versa(x) {
      const a = x.acc; if (!a || a.sec < 1) return; const s = st(), k = chiave(x.nome), b = s.stat[k] || (s.stat[k] = {}), v = b[a.b] || (b[a.b] = { sec: 0, oro: 0, xp: 0 });
      v.sec += a.sec; v.oro += Math.max(0, a.oro); v.xp += a.xp; v.t = Date.now(); v.n = x.nome;
      // si ricordano circa le ultime 50 ore per fascia: oltre, i conteggi si dimezzano
      if (v.sec > 180000) { v.sec /= 2; v.oro /= 2; v.xp /= 2; }
      a.sec = 0; a.oro = 0; a.xp = 0;
    }
    function tabellaGuadagni() {
      const s = st(), per = {};
      for (const [n, bb] of Object.entries(s.stat)) for (const [b, v] of Object.entries(bb)) if (v.sec >= 1800) (per[b] || (per[b] = [])).push({ n, nome: v.n || n, ore: v.sec / 3600, oro: v.oro / (v.sec / 3600), xp: v.xp / (v.sec / 3600) });
      const med = a => { const q = a.slice().sort((x, y) => x - y); return q.length ? q[Math.floor(q.length / 2)] : 0; };
      return Object.entries(per).map(([b, L]) => ({ b: +b, L, oro: med(L.map(r => r.oro)), xp: med(L.map(r => r.xp)) })).sort((a, b) => a.b - b.b);
    }
    // ogni 10 minuti per tutti, e per chi entra appena il server vede il suo eroe
    function confrontaGuadagni(solo) {
      const s = st(), oggi = Date.now(), online = new Map(api.players().filter(p => !finto(p) && (!solo || p.id === solo.id)).map(p => [chiave(p.name), p]));
      for (const F of tabellaGuadagni()) {
        if (F.L.length < C.statGiocatoriMin + 1) continue;
        for (const r of F.L) {
          const p = online.get(r.n); if (!p || r.ore < C.statOreMin) continue;
          const fuori = [];
          if (F.oro > 0 && r.oro > F.oro * C.statMultiplo) fuori.push(fmt(r.oro) + ' oro all\'ora (la mediana è ' + fmt(F.oro) + ')');
          if (F.xp > 0 && r.xp > F.xp * C.statMultiplo) fuori.push(fmt(r.xp) + ' esperienza all\'ora (la mediana è ' + fmt(F.xp) + ')');
          const k = r.n + ':' + F.b;
          if (!fuori.length || oggi - (s.statSegn[k] || 0) < 86400000) continue;
          s.statSegn[k] = oggi; api.save();
          segnala(p, 'guadagni fuori scala', fuori.join('; ') + ' in ' + r.ore.toFixed(1) + ' ore di gioco nella fascia ' + nomeFascia(F.b) + ', confrontato con ' + (F.L.length - 1) + ' altri giocatori',
            { g: 'media', prove: { fascia: nomeFascia(F.b), ore: +r.ore.toFixed(2), oroOra: Math.round(r.oro), xpOra: Math.round(r.xp), medianaOro: Math.round(F.oro), medianaXp: Math.round(F.xp), giocatori: F.L.length } });
        }
      }
    }

    // ---------- copia dell'eroe sul server, confrontata al rientro ----------
    function salvaCopia(x, nome) {
      const f = x.foto; if (!f || !x.copiaFatta || C.copia === 'spento') return;
      const s = st(), u = [];
      for (const i of ['w', 'h', 'c', 's'].map(k => f.eq && f.eq[k]).concat(f.it || [], f.ds || [])) if (i && i.u) u.push(String(i.u).slice(0, 16));
      s.copie[chiave(nome)] = { t: Date.now(), lv: +f.lv || 0, xp: +f.xp || 0, g: +f.g || 0, u: u.slice(0, 200), sh: Array.isArray(f.sh) ? f.sh.map(String).slice(0, 10) : [] };
      const k = Object.keys(s.copie); if (k.length > 2000) for (const n of k.sort((a, b) => s.copie[a].t - s.copie[b].t).slice(0, k.length - 2000)) delete s.copie[n];
    }
    function confrontaCopia(p, x, f) {
      x.copiaFatta = 1;
      const c = C.copia !== 'spento' && st().copie[chiave(p.name)]; if (!c) return;
      const tutti = ['w', 'h', 'c', 's'].map(k => f.eq && f.eq[k]).concat(f.it || [], f.ds || []).filter(i => i && i.u), noti = new Set(c.u);
      const nuovi = tutti.filter(i => !noti.has(String(i.u))), sh = (Array.isArray(f.sh) ? f.sh.map(String) : []).filter(q => !c.sh.includes(q));
      const lv = (+f.lv || 0) - c.lv, oro = (+f.g || 0) - c.g, diff = [];
      if (lv > 0) diff.push('livello ' + f.lv + ' invece di ' + c.lv);
      if (oro > Math.max(500, c.g * .05)) diff.push(fmt(f.g) + ' oro invece di ' + fmt(c.g));
      if (nuovi.length) diff.push(nuovi.length + (nuovi.length === 1 ? ' oggetto che non aveva' : ' oggetti che non aveva') + ' (' + nuovi.slice(0, 3).map(descr).join(', ') + (nuovi.length > 3 ? '…' : '') + ')');
      if (sh.length) diff.push('frammenti in più: ' + sh.join(', '));
      if (!diff.length) return;
      const rimetti = C.copia === 'rimetti';
      segnala(p, 'diverso dalla copia', 'rispetto a quando è uscito il ' + new Date(c.t).toLocaleString('it-IT') + ': ' + diff.join('; ') + (rimetti ? '. Tolto quello in più.' : ''),
        { g: 'media', prove: { copia: { lv: c.lv, oro: c.g, oggetti: c.u.length, frammenti: c.sh }, ora: { lv: f.lv, oro: f.g, oggetti: tutti.length, frammenti: f.sh }, nuovi: nuovi.slice(0, 8).map(pulito) } });
      if (rimetti) ripristina(p, { oro: c.g, lv: c.lv, xp: c.xp, u: nuovi.map(i => String(i.u)), shTieni: c.sh, perche: 'l\'eroe era diverso dalla copia del server' });
    }

    // ---------- tra una sessione e l'altra (per nome) ----------
    function ricorda(p, x) { if (finto(p) || !(p.lv > 0)) return; const s = st(); if (x) { versa(x); salvaCopia(x, p.name); } s.storico[chiave(p.name)] = { lv: p.lv, oro: p.gold, t: Date.now() }; const k = Object.keys(s.storico); if (k.length > 3000) for (const n of k.sort((a, b) => s.storico[a].t - s.storico[b].t).slice(0, k.length - 3000)) delete s.storico[n]; api.save(); }
    function confrontaStorico(p, x) {
      // con la copia dell'eroe ci pensa confrontaCopia, quando arriva la prima foto del sensore
      const v = st().storico[chiave(p.name)]; if (!v || (C.copia !== 'spento' && st().copie[chiave(p.name)])) return;
      const dl = p.lv - v.lv, dg = p.gold - v.oro, quando = new Date(v.t).toLocaleString('it-IT');
      if ((C.livelliFuori > 0 && dl > C.livelliFuori) || (C.oroFuori > 0 && dg > C.oroFuori))
        segnala(p, 'progressi fuori dal server', 'rientra con livello ' + p.lv + ' e ' + fmt(p.gold) + ' oro; era uscito il ' + quando + ' con livello ' + v.lv + ' e ' + fmt(v.oro) + ' oro (partita modificata o giocata da soli)',
          { g: 'bassa', prove: { prima: v, ora: { lv: p.lv, oro: p.gold } } });
    }
    api.on('leave', p => { const x = stato.get(p.id); if (x && x.ultimo) ricorda(Object.assign({}, p, { lv: x.ultimo.lv, gold: x.ultimo.oro, name: p.name }), x); stato.delete(p.id); });

    // ---------- foto dal sensore nel gioco ----------
    api.onClient('foto', (p, f) => {
      if (finto(p) || !f || typeof f !== 'object') return;
      const x = X(p), ora = Date.now(), num = v => +v || 0, lv = num(f.lv) | 0;
      const eq = f.eq && typeof f.eq === 'object' ? f.eq : {}, inv = Array.isArray(f.it) ? f.it.slice(0, 120) : [];
      const ds = Array.isArray(f.ds) ? f.ds.slice(0, 120) : [];
      const tutti = ['w', 'h', 'c', 's'].map(k => eq[k]).concat(inv, ds).filter(i => i && typeof i === 'object');
      // vendite: oggetti spariti dallo zaino dalla foto precedente (spiegano l'oro che sale)
      if (x.foto) {
        const ora_u = new Set(tutti.map(i => String(i.u))); let v = 0;
        for (const i of x.oggetti || []) if (!ora_u.has(String(i.u))) v += Math.max(0, Math.min(num(i.p), 1e6));
        if (v > 0) credita(x, v, 0, 'oggetti venduti');
        const dr = num(x.foto.rs) - num(f.rs); if (dr > 0) credita(x, Math.min(dr, 1e6), 0, 'risorse e pesci venduti');
      }
      x.oggetti = tutti.map(i => ({ u: i.u, p: i.p }));
      if (!x.inizio || x.inizio.xp == null) x.inizio = Object.assign(x.inizio || { oro: num(f.g), lv, t: ora }, { xp: num(f.xp) });
      x.foto = f; x.fotoT = ora;
      if (!x.copiaFatta) confrontaCopia(p, x, f);

      // Cheat Menu e funzioni del gioco sostituite
      const segni = Array.isArray(f.segni) ? f.segni.map(s => String(s).slice(0, 80)).slice(0, 20) : [], fn = Array.isArray(f.fn) ? f.fn.map(s => String(s).slice(0, 30)).slice(0, 20) : [];
      if (segni.length) segnala(p, 'cheat menu', segni.join('; '), { g: 'alta', chiave: 'cheat', prove: { segni, funzioniSostituite: fn },
        rip: x.inizio ? { oro: x.inizio.oro, lv: x.inizio.lv, xp: x.inizio.xp, sh: 1, perche: 'Cheat Menu: tolto quanto guadagnato in questa sessione' } : null });
      else if (fn.length) segnala(p, 'gioco modificato', 'funzioni del gioco sostituite dopo l\'avvio: ' + fn.join(', '), { g: 'media', chiave: 'fn:' + fn.join(','), prove: { funzioni: fn } });

      // statistiche: la vita massima è 60 + 15 per livello + la vita degli oggetti indossati (due foto di fila)
      const atteso = vitaMin(lv) + ['w', 'h', 'c', 's'].reduce((a, k) => a + (eq[k] ? Math.max(0, num(eq[k].hp)) : 0), 0);
      const st1 = [];
      if (Math.abs(num(f.mx) - atteso) > 1) st1.push('vita massima ' + num(f.mx) + ' invece di ' + atteso + ' (livello ' + lv + ' e oggetti indossati)');
      if (num(f.hp) > num(f.mx) + 1) st1.push('vita ' + num(f.hp) + ' sopra la massima ' + num(f.mx));
      if (num(f.xp) >= need(lv) + 1 || num(f.xp) < 0) st1.push('esperienza ' + Math.round(num(f.xp)) + ' impossibile al livello ' + lv + ' (si passa di livello a ' + need(lv) + ')');
      if (num(f.bA) > BUFF_MAX + 1 || num(f.bD) > BUFF_MAX + 1) st1.push('pozioni di forza/pietra per ' + Math.round(Math.max(num(f.bA), num(f.bD))) + ' s (al massimo ' + BUFF_MAX + ')');
      if (num(f.inv) > 48) st1.push('zaino da ' + num(f.inv) + ' posti (il più grande ne ha 48)');
      const chiaveSt = st1.join('|');
      if (st1.length && chiaveSt === x.statPrima) segnala(p, 'statistiche', st1.join('; '), { g: 'alta', chiave: 'st:' + chiaveSt, prove: { lv, xp: f.xp, vita: f.hp, vitaMax: f.mx, atteso, forza: f.bA, pietra: f.bD, zaino: f.inv },
        rip: x.inizio && lv > x.inizio.lv ? { lv: x.inizio.lv, xp: x.inizio.xp } : {} });
      x.statPrima = chiaveSt;

      // frammenti della Corona: ognuno si prende solo dopo il boss del suo dungeon
      const done = f.done && typeof f.done === 'object' ? f.done : {}, sh = Array.isArray(f.sh) ? f.sh.map(String) : [];
      const senza = sh.filter(s => !SHARDS.includes(s) || !(done[s] > 0));
      if (senza.length) segnala(p, 'frammenti', 'frammenti della Corona senza aver battuto il boss: ' + senza.join(', '), { g: 'alta', chiave: 'sh:' + senza.join(','), prove: { frammenti: sh, bossBattuti: done }, rip: { sh: 1 } });

      // oggetti impossibili (indossati e nello zaino)
      const brutti = []; for (const i of tutti) { const m = oggettoStrano(i, lv); if (m) brutti.push({ u: String(i.u), m, it: pulito(i) }); }
      const nuovi = brutti.filter(b => !x.chiavi.has('ogg:' + b.u));
      if (nuovi.length) segnala(p, 'oggetti impossibili', nuovi.slice(0, 3).map(b => descr(b.it) + ': ' + b.m).join('; ') + (nuovi.length > 3 ? ' e altri ' + (nuovi.length - 3) : ''),
        { g: 'alta', chiave: 'ogg:' + nuovi.map(b => b.u).join(','), prove: { oggetti: nuovi.slice(0, 8) }, rip: { u: nuovi.map(b => b.u) } });
      for (const b of nuovi) x.chiavi.add('ogg:' + b.u);

      if (num(f.colpi) > 0) segnala(p, 'colpi impossibili', f.colpi + ' colpi sui mostri fino a ' + num(f.colpiMax) + ' volte l\'attacco (il massimo possibile è 9,7)', { g: 'alta', chiave: 'colpi:' + Math.floor(ora / 300000), prove: { colpi: f.colpi, voltePiuDellAttacco: f.colpiMax } });
      if (num(f.muri) >= 8) segnala(p, 'dentro i muri', 'eroe dentro un muro per ' + (num(f.muri) / 4).toFixed(1) + ' s in ' + String(f.z || p.zone), { g: 'media', chiave: 'muri:' + Math.floor(ora / 300000), prove: { secondi: num(f.muri) / 4, zona: f.z } });
      if (num(f.raffica) > 12) segnala(p, 'mostri a raffica', num(f.raffica) + ' mostri sconfitti in un secondo', { g: 'media', chiave: 'raffica:' + Math.floor(ora / 300000), prove: { mostri: f.raffica, zona: f.z } });
    });
    if (C.sensore) api.client('(' + sensore.toString() + ')(' + JSON.stringify(api.id) + ',' + Math.max(2, +C.sensoreSec || 5) + ');');

    // ---------- cambi di zona: niente piani dei dungeon saltati ----------
    api.on('zone', (p, nz, oz) => {
      if (finto(p) || !oz) return;
      const [d, f] = String(nz).split('@'), k = +f;
      if (!DG[d] || !(k >= 2)) return;
      const [od, of] = String(oz).split('@');
      if (od === d && Math.abs(+of - k) <= 1) return;
      segnala(p, 'piano saltato', 'arrivato al piano ' + k + ' di ' + d + ' direttamente da ' + oz, { g: 'alta', prove: { da: oz, a: nz }, citta: 1 });
    });

    // ---------- messaggi del gioco da controllare prima che il server li accetti ----------
    api.on('message', (p, m) => {
      if (finto(p)) return;
      // un ciclo già chiuso viene comunque ignorato dal server: si controllano solo i boss che lo farebbero avanzare
      if (m.t === 'dgdone' && (api.server.runs(p.room)[m.d] || 0) === (m.run | 0)) {
        const x = X(p), d = String(m.d || ''), ora = Date.now(), zona = String(p.zone || '').split('@')[0];
        let perche = '';
        if (zona !== d) perche = 'boss di ' + d + ' dichiarato mentre era in ' + (p.zone || 'nessuna zona');
        else if (x.boss && ora - x.boss < C.bossPausaSec * 1000) perche = 'due boss in ' + Math.round((ora - x.boss) / 1000) + ' s';
        if (perche) { segnala(p, 'dungeon', perche, { g: 'alta' }); if (C.bloccaBossSospetti) return false; }
        x.boss = ora;
      }
      if (m.t === 'hit') {
        const max = C.dannoPvpMax + C.dannoPvpPerLivello * p.lv, d = Math.round(+m.d || 0);
        if (d > max) { segnala(p, 'colpo PvP', d + ' danni (massimo previsto ' + max + ')', { g: 'alta' }); if (C.bloccaColpiEccessivi) return false; }
      }
      // scambi e oggetti a terra: oro che non si ha, oggetti che il gioco non sa creare
      if ((m.t === 'tr' && m.a === 'off') || m.t === 'drop') {
        const its = m.t === 'drop' ? [m.it] : (Array.isArray(m.it) ? m.it.slice(0, 12) : []), brutti = [];
        for (const i of its) { const e = oggettoStrano(i, p.lv); if (e) brutti.push({ it: pulito(i), m: e }); }
        const oro = m.t === 'tr' ? Math.max(0, +m.g || 0) : 0, senzaOro = oro > p.gold + 100;
        if (brutti.length) segnala(p, 'oggetti impossibili', (m.t === 'drop' ? 'gettato a terra: ' : 'offerto in uno scambio: ') + brutti.map(b => descr(b.it) + ': ' + b.m).join('; '), { g: 'alta', prove: { oggetti: brutti } });
        if (senzaOro) segnala(p, 'scambio', 'offre ' + fmt(oro) + ' oro ma ne ha ' + fmt(p.gold), { g: 'alta', prove: { offerto: oro, posseduto: p.gold } });
        if ((brutti.length || senzaOro) && C.bloccaScambiSospetti) { p.tell('Il Guardiano ha bloccato ' + (m.t === 'drop' ? 'questo oggetto' : 'questa offerta') + '.'); return false; }
      }
    });
    // l'oro ricevuto con uno scambio non è un guadagno sospetto; i grossi passaggi di oro si annotano
    api.on('trade', (a, b, da, db) => {
      const ga = Math.max(0, da && da.gold | 0), gb = Math.max(0, db && db.gold | 0);
      if (!finto(b) && ga) credita(X(b), ga, 0, 'scambio con ' + a.name);
      if (!finto(a) && gb) credita(X(a), gb, 0, 'scambio con ' + b.name);
      for (const [chi, a2, g] of [[a, b, ga], [b, a, gb]]) if (C.travasoOro > 0 && g >= C.travasoOro) segnala(chi, 'travaso di oro', 'ha dato ' + fmt(g) + ' oro a ' + a2.name + ' in uno scambio', { g: 'bassa', prove: { a: a2.name, oro: g } });
    });

    // ---------- pagina admin ----------
    const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const GC = { alta: '#ff6b6b', media: '#f2b84b', bassa: '#8fb3ff' };
    api.route('GET', '/', (req, res, x) => {
      const q = x.query, tutte = st().lista.slice().reverse();
      const L = tutte.filter(r => (!q.nome || chiave(r.nome) === chiave(q.nome)) && (!q.g || (GRAV[r.g || 'media'] || 2) >= (GRAV[q.g] || 1)));
      const per = {}; for (const r of tutte) if ((r.g || 'media') !== 'bassa') per[r.nome] = (per[r.nome] || 0) + 1;
      const top = Object.entries(per).sort((a, b) => b[1] - a[1]).slice(0, 10);
      const online = api.players().filter(p => !finto(p)).map(p => { const s = stato.get(p.id) || {}; return { p, sens: !!s.foto, n: tutte.filter(r => r.nome === p.name && r.t >= (s.entrato || 0)).length }; });
      const G = C.statistiche ? tabellaGuadagni() : [];
      const link = (o) => '?' + Object.entries(Object.assign({ nome: q.nome || '', g: q.g || '' }, o)).filter(([, v]) => v).map(([k, v]) => k + '=' + encodeURIComponent(v)).join('&');
      x.send(`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Guardiano</title>
<style>body{font:14px system-ui,sans-serif;margin:0;padding:16px;background:#14161c;color:#e8e6e1}h1{font-size:20px}h2{font-size:16px;margin-top:22px}table{border-collapse:collapse;width:100%}
td,th{padding:6px 8px;border-bottom:1px solid #2c303a;text-align:left;vertical-align:top}th{color:#9aa0ab;font-weight:600}.t{font-weight:600}a{color:#9cc4ff}
button{background:#2a2f3a;color:#e8e6e1;border:1px solid #444b5a;border-radius:6px;padding:4px 10px;cursor:pointer;margin:1px}button.r{background:#3a2a2a;color:#ffd2d2;border-color:#6a3a3a}
.wrap{overflow-x:auto}p{color:#9aa0ab}.b{display:inline-block;border-radius:10px;padding:1px 8px;font-size:12px;font-weight:600;color:#14161c}pre{white-space:pre-wrap;font-size:12px;color:#c9c6bf;margin:4px 0}
summary{cursor:pointer;color:#9aa0ab}.ok{color:#7bd88f}.no{color:#9aa0ab}</style>
<h1>🛡 Guardiano ${esc(api.gameVersion ? '· Voxelia ' + api.gameVersion : '')}</h1>
<p>${AM().attiva ? 'Automoderazione <b>accesa</b> (sostituisce l\'azione qui sotto) ·' : ''} Azione: <b>${esc(C.azione)}</b>${C.azione !== 'segnala' ? ' dalle segnalazioni di gravità <b>' + esc(C.azioneDa) + '</b>' : ''}${C.espelliDopo > 0 ? ' · espulsione dopo ' + C.espelliDopo + ' segnalazioni gravi' : ''} · sensore nel gioco: <b>${C.sensore ? 'acceso' : 'spento'}</b> · copia dell'eroe: <b>${esc(C.copia)}</b> · ${tutte.length} segnalazioni salvate. Le soglie si cambiano in guardiano.config.json.</p>
<p><span class="b" style="background:${GC.alta}">alta</span> prova sicura di un trucco · <span class="b" style="background:${GC.media}">media</span> sospetto da controllare · <span class="b" style="background:${GC.bassa}">bassa</span> da sapere (progressi fuori dal server, grossi passaggi d'oro)</p>
<h2>In gioco ora (${online.length})</h2>
<div class="wrap"><table><tr><th>Eroe</th><th>Stanza / zona</th><th>Lv</th><th>Oro</th><th>Vita</th><th>Sensore</th><th>Segnalazioni</th><th></th></tr>
${online.map(({ p, sens, n }) => `<tr><td><a href="${link({ nome: p.name })}">${esc(p.name)}</a></td><td>${esc(p.room)} / ${esc(p.zone)}</td><td>${p.lv}</td><td>${fmt(p.gold)}</td><td>${p.hp}/${p.maxHp}</td><td>${sens ? '<span class="ok">sì</span>' : '<span class="no">no</span>'}</td><td>${n}</td>
<td><button onclick="az('${esc(p.id)}','ripristina','Riportare ${esc(p.name)} a oro e livello di inizio sessione e togliere gli oggetti impossibili?')">Ripristina</button><button onclick="az('${esc(p.id)}','citta')">In città</button><button class="r" onclick="az('${esc(p.id)}','espelli','Disconnettere ${esc(p.name)}?')">Espelli</button></td></tr>`).join('') || '<tr><td colspan="8">Nessuno.</td></tr>'}
</table></div>
${C.statistiche ? `<h2>Guadagni per ora di gioco</h2>
<p>Per ogni fascia di livelli: la mediana dei giocatori con almeno mezz'ora di gioco e i 5 che guadagnano di più. Si segnala chi supera ${C.statMultiplo} volte la mediana dopo ${C.statOreMin} ${C.statOreMin == 1 ? 'ora' : 'ore'}, se nella fascia ci sono almeno ${C.statGiocatoriMin + 1} giocatori.</p>
<div class="wrap"><table><tr><th>Fascia</th><th>Giocatori</th><th>Oro/ora (mediana)</th><th>Esperienza/ora (mediana)</th><th>Chi guadagna di più (oro/ora · volte la mediana · ore)</th></tr>
${G.map(F => `<tr><td>${F.b * 10 || 1}-${F.b * 10 + 9}</td><td>${F.L.length}</td><td>${fmt(F.oro)}</td><td>${fmt(F.xp)}</td><td>${F.L.slice().sort((a, b) => b.oro - a.oro).slice(0, 5).map(r => `<a href="${link({ nome: r.nome })}">${esc(r.nome)}</a> ${fmt(r.oro)} · ${F.oro > 0 ? (r.oro / F.oro).toFixed(1) + '×' : '–'} · ${r.ore.toFixed(1)} h`).join('<br>')}</td></tr>`).join('') || '<tr><td colspan="5">Ancora pochi dati: servono almeno 30 minuti di gioco a testa.</td></tr>'}
</table></div>` : ''}
${(() => { const a = AM(), s = st(), ora = Date.now(), M = Object.entries(s.mod).map(([k, m]) => ({ k, m, pt: puntiDi(k) })).filter(r => r.pt > 0 || (r.m.storia.length && ora - r.m.storia[r.m.storia.length - 1].t < 7 * 86400000)).sort((x, y) => y.pt - x.pt).slice(0, 50);
  const Sp = Object.entries(s.sospesi).filter(([, v]) => !v.fino || v.fino > ora), Si = Object.entries(s.silenziati).filter(([, v]) => !v.fino || v.fino > ora);
  const mb = (a2, nome, t, c) => `<button${c ? ' class="r"' : ''} onclick="md('${a2}','${esc(String(nome).replace(/'/g, ''))}')">${t}</button>`;
  return `<h2>Automoderazione: ${a.attiva ? '<span class="ok">accesa</span>' : '<span class="no">spenta</span>'} ${a.attiva ? mb('spegni', '', 'Spegni', 1) : mb('accendi', '', 'Accendi')}</h2>
<p>Punti per segnalazione: alta ${a.punti.alta}, media ${a.punti.media}, bassa ${a.punti.bassa}${Object.keys(a.puntiTipo).length ? ' · ' + Object.entries(a.puntiTipo).map(([t, v]) => esc(t) + ' ' + v).join(', ') : ''} · scadono dopo ${a.scadenzaOre} ore${a.esenti.length ? ' · esenti: ' + a.esenti.map(esc).join(', ') : ''}.<br>
Regole: ${a.regole.map(r => r.punti + ' punti → ' + esc(r.azione) + (r.ore != null && (r.azione === 'sospendi' || r.azione === 'silenzia') ? (+r.ore ? ' ' + oreTxt(+r.ore) : ' per sempre') : '')).join(' · ')}. Si cambiano in guardiano.config.json (automoderazione).</p>
<div class="wrap"><table><tr><th>Eroe</th><th>Punti ora</th><th>Ultime sanzioni</th><th></th></tr>
${M.map(({ k, m, pt }) => `<tr><td><a href="${link({ nome: m.nome })}">${esc(m.nome)}</a></td><td>${pt}</td><td>${m.storia.slice(-3).reverse().map(h => quando(h.t) + ': ' + esc(h.azione) + (h.tipo ? ' (' + esc(h.tipo) + ', ' + h.punti + ' punti)' : '')).join('<br>') || '–'}</td><td>${pt ? mb('azzera', m.nome, 'Azzera i punti') : ''}</td></tr>`).join('') || '<tr><td colspan="4">Nessun eroe con punti.</td></tr>'}
</table></div>
${Sp.length || Si.length ? `<p>${Sp.map(([, v]) => '⛔ <b>' + esc(v.nome) + '</b> sospeso ' + (v.fino ? 'fino al ' + quando(v.fino) : 'per sempre') + (v.ip ? ' (anche IP ' + esc(v.ip) + ')' : '') + ' per ' + esc(v.motivo) + ' ' + mb('riammetti', v.nome, 'Togli la sospensione', 1)).concat(Si.map(([, v]) => '🔇 <b>' + esc(v.nome) + '</b> silenziato ' + (v.fino ? 'fino al ' + quando(v.fino) : 'senza scadenza') + ' ' + mb('parla', v.nome, 'Togli il silenzio'))).join('<br>')}</p>` : ''}`; })()}
<h2>Segnalazioni${q.nome ? ' di ' + esc(q.nome) + ' · <a href="' + link({ nome: '' }) + '">tutti</a>' : ''}</h2>
<p>Mostra: <a href="${link({ g: '' })}">tutte</a> · <a href="${link({ g: 'media' })}">media e alta</a> · <a href="${link({ g: 'alta' })}">solo alta</a>
${top.length ? ' · Più segnalati: ' + top.map(([n, c]) => '<a href="' + link({ nome: n }) + '">' + esc(n) + '</a> (' + c + ')').join(', ') : ''}</p>
<p><button class="r" onclick="if(confirm('Cancellare tutte le segnalazioni?'))fetch('pulisci',{method:'POST',headers:{'x-voxelia':'1'}}).then(()=>location.reload())">Cancella le segnalazioni</button></p>
<div class="wrap"><table><tr><th>Quando</th><th>Eroe</th><th>Gravità</th><th>Tipo</th><th>Dettaglio e prove</th><th>Stanza / zona</th><th>Lv</th><th>Oro</th><th>IP</th></tr>
${L.slice(0, 400).map(r => { const g = r.g || 'media'; return `<tr><td>${new Date(r.t).toLocaleString('it-IT')}</td><td><a href="${link({ nome: r.nome })}">${esc(r.nome)}</a></td><td><span class="b" style="background:${GC[g]}">${g}</span></td><td class="t">${esc(r.tipo)}</td>
<td>${esc(r.dettaglio)}${r.prove ? '<details><summary>prove</summary><pre>' + esc(JSON.stringify(r.prove, null, 1)) + '</pre></details>' : ''}</td><td>${esc(r.stanza)} / ${esc(r.zona)}</td><td>${r.lv}</td><td>${r.oro == null ? '' : fmt(r.oro)}</td><td>${esc(r.ip)}</td></tr>`; }).join('') || '<tr><td colspan="9">Nessuna segnalazione.</td></tr>'}
</table></div>
<script>function md(a,nome){if((a==='accendi'||a==='riammetti')&&!confirm(a==='accendi'?'Accendere l’automoderazione? Le sanzioni scatteranno da sole.':'Togliere la sospensione a '+nome+'?'))return;fetch('moderazione',{method:'POST',headers:{'x-voxelia':'1','Content-Type':'application/json'},body:JSON.stringify({a,nome})}).then(r=>r.json()).then(j=>{alert(j.ok||j.err);location.reload()})}
function az(id,a,c){if(c&&!confirm(c))return;fetch('azione',{method:'POST',headers:{'x-voxelia':'1','Content-Type':'application/json'},body:JSON.stringify({id,a})}).then(r=>r.json()).then(j=>{alert(j.ok||j.err);location.reload()})}</script>`);
    }, { admin: true });
    api.route('GET', '/segnalazioni', (req, res, x) => x.json({ lista: st().lista }), { admin: true });
    api.route('POST', '/pulisci', (req, res, x) => { st().lista = []; api.save(); x.json({ ok: 1 }); }, { admin: true });
    // automoderazione dalla pagina: accendere/spegnere, azzerare i punti, togliere sospensioni e silenzi
    api.route('POST', '/moderazione', (req, res, x) => x.body(j => {
      const s = st(), k = chiave(j.nome || '');
      if (j.a === 'accendi' || j.a === 'spegni') { C.automoderazione = Object.assign({}, AM(), { attiva: j.a === 'accendi' }); api.saveConfig(); api.log('automoderazione ' + (j.a === 'accendi' ? 'accesa' : 'spenta') + ' dalla pagina admin'); return x.json({ ok: 'Automoderazione ' + (j.a === 'accendi' ? 'accesa' : 'spenta') }); }
      if (j.a === 'azzera') { if (s.mod[k]) { s.mod[k].punti = []; s.mod[k].fatte = []; s.mod[k].storia.push({ t: Date.now(), azione: 'punti azzerati dall\'admin', punti: 0, tipo: '' }); } api.save(); return x.json({ ok: 'Punti azzerati' }); }
      if (j.a === 'riammetti') { delete s.sospesi[k]; api.save(); api.log('automoderazione: sospensione tolta a ' + j.nome); return x.json({ ok: 'Sospensione tolta' }); }
      if (j.a === 'parla') { delete s.silenziati[k]; api.save(); return x.json({ ok: 'Silenzio tolto' }); }
      x.json({ err: 'Azione sconosciuta' });
    }), { admin: true });
    api.route('POST', '/azione', (req, res, x) => x.body(j => {
      const p = api.player(String(j.id || '')); if (!p) return x.json({ err: 'Giocatore non più connesso' });
      const s = stato.get(p.id) || {};
      if (j.a === 'espelli') { p.kick('disconnesso dall\'admin'); return x.json({ ok: p.name + ' disconnesso' }); }
      if (j.a === 'citta') { p.toTown(); return x.json({ ok: p.name + ' riportato ad Aldoria' }); }
      if (j.a === 'ripristina') {
        if (!ripristinoCompleto(p, 'deciso dall\'admin')) return x.json({ err: p.name + ' non ha il sensore (pagina vecchia o bloccato): il ripristino non può arrivare' });
        api.log('ripristino manuale di ' + p.name);
        return x.json({ ok: 'Ripristino mandato a ' + p.name + (s.inizio ? ' (livello ' + s.inizio.lv + ', ' + fmt(s.inizio.oro) + ' oro al massimo)' : '') });
      }
      x.json({ err: 'Azione sconosciuta' });
    }), { admin: true });
  },

  stop() { delete globalThis.VoxeliaGuardiano; if (globalThis.__guardianoTap) { globalThis.__guardianoTap.h = null; globalThis.__guardianoTap.restore(); } }
};
