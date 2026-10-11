// Mercatino di Aldoria: si mette in vendita un oggetto dello zaino a un prezzo, e gli altri lo comprano anche quando il venditore non c'è.
// - /mercato apre la bancarella nel gioco: In vendita, Vendi, I miei banchi (con gli oggetti da ritirare e gli incassi).
// - Gli oggetti in vendita li tiene il server, come il deposito delle Case: partono dallo zaino solo quando il server li ha presi.
// - Il venditore riceve l'oro (meno la tassa del mercatino) subito se è online, altrimenti al suo prossimo ingresso (p.give).
// - Invenduti dopo giorniScadenza: tornano al venditore, che li ritira dal pannello.
// - Il banco è legato al browser con una chiave segreta (come il codice delle Case): chi entra con lo stesso nome da un altro
//   browser non può ritirare oggetti né incassare. Per spostarsi: /mercato chiave (mostra il codice), /mercato chiave CODICE.
// Pagamenti: il server non può togliere oro, quindi l'oro lo toglie il codice nel gioco quando consegna l'oggetto comprato.
// Chi usa i trucchi potrebbe non toglierlo: il plugin guarda l'oro che il gioco manda al server (ogni decimo di secondo) e,
// se dopo la consegna non è sceso del prezzo, segna il compratore come sospetto nella pagina admin e (di base) lo blocca.
// L'oro dato al venditore passa da p.give, che il Guardiano vede da solo come regalo di un plugin.
// Pagina pubblica: /plugins/mercato/ · pagina admin: /plugins/mercato/admin

// ======================= nel gioco =======================
function nelGioco(ID, CFG) {
  const opz = f => { try { return f(); } catch (e) { return undefined; } };
  // nomi del gioco che il plugin usa: se un aggiornamento ne toglie uno, il mercatino si spegne con un avviso
  const USA = { P: () => P, NET: () => NET, INV: () => INV, fmt: () => fmt, iname: () => iname, save: () => save, hud: () => hud, msg: () => msg, pn: () => pn, cl: () => cl };
  const mancanti = Object.keys(USA).filter(k => { try { return USA[k]() === undefined; } catch (e) { return true; } });
  if (mancanti.length) { console.warn('[plugin ' + ID + '] mancano: ' + mancanti.join(', ')); VXP.on(ID, 'apri', () => { opz(() => msg('Il mercatino non funziona con questa versione del gioco: avvisa l\'admin del server.')); VXP.send(ID, 'rotto', mancanti); }); return; }

  const e2 = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const avvisa = s => opz(() => msg(s));
  const suono = (f, d) => opz(() => tone(f, d || .08, 'triangle'));
  const collegato = () => !!(NET.ok && NET.ws && NET.ws.readyState === 1);
  const ic = (n, px) => opz(() => ico(n, px || 16, 'hi')) || '';
  const ORO = n => '<b class="vmo">' + (+n || 0).toLocaleString('it-IT') + '</b> ' + ic('oro', 14);
  const TIPI = { w: 'Armi', h: 'Elmi', c: 'Corazze', s: 'Scudi' };
  const giorni = ms => { const h = Math.max(0, Math.round(ms / 3600000)); return h < 24 ? h + ' h' : Math.round(h / 24) + ' g'; };

  // la chiave del banco: una per nome in questo browser
  const LSK = () => 'vxp_mercato_' + String(NET.name || '').toLowerCase();
  function chiave() {
    let k = opz(() => localStorage.getItem(LSK()));
    if (!k) { const a = new Uint8Array(12); crypto.getRandomValues(a); k = Array.from(a, b => b.toString(16).padStart(2, '0')).join('').toUpperCase(); opz(() => localStorage.setItem(LSK(), k)); }
    return k;
  }

  let ST = null;            // quello che il server ha detto: banchi, miei, consegne, incassi
  const PEND = {};          // oggetti partiti dallo zaino verso il banco: u → { it, t }
  let pan = null, ultimoId = null;

  const CSS = document.createElement('style');
  CSS.textContent = '#pn[data-m=vxm] h3{display:flex;align-items:center;gap:6px;flex-wrap:wrap}#pn[data-m=vxm] h3 .mu{margin-left:auto;font-weight:normal}' +
    '#pn[data-m=vxm] h4{display:flex;align-items:center;gap:5px;margin-top:12px}#pn[data-m=vxm] button img{vertical-align:-3px;margin-right:3px}' +
    '#pn[data-m=vxm] .vtab{display:flex;flex-wrap:wrap;gap:3px;margin:2px 0 8px}#pn[data-m=vxm] .vtab button.on,#pn[data-m=vxm] .vflt button.on,#pn[data-m=vxm] .it button.on{border-color:var(--ac);background:var(--ac);color:#1b1408}' +
    '#pn[data-m=vxm] .vflt{display:flex;flex-wrap:wrap;gap:2px;margin:0 0 6px}#pn[data-m=vxm] .vflt button{padding:2px 8px;font-size:12px}' +
    '#pn[data-m=vxm] .it{display:flex;justify-content:space-between;align-items:center;gap:8px}#pn[data-m=vxm] .it>span:last-child{display:flex;align-items:center;gap:6px;flex:none}' +
    '#pn[data-m=vxm] .vda{font-size:11px;opacity:.7;display:block}#pn[data-m=vxm] .vmo{color:#ffd84a}#pn[data-m=vxm] .vno .vmo{color:#e55}' +
    '#pn[data-m=vxm] input[type=number]{width:84px;box-sizing:border-box;padding:3px 5px}#pn[data-m=vxm] .vfondo{display:flex;justify-content:flex-end;margin-top:10px}' +
    '#pn[data-m=vxm] .qb{background:#f5b94222;border-left:3px solid var(--ac);padding:6px 8px}';
  document.head.appendChild(CSS);

  const PN = () => document.getElementById('pn');
  const aperto = () => { const pe = PN(); return !!pe && pe.style.display === 'block' && pe.dataset.m === 'vxm'; };
  // se il gioco ridisegna il riquadro mentre è aperto il mercatino, lo ridisegna il plugin (il wrapper delle Case passa avanti 'vxm')
  opz(() => { const pn0 = pn; pn = function (m) { if (m === 'vxm') { if (pan) disegna(); return; } return pn0.apply(this, arguments); }; });
  function chiudi() { const era = pan; pan = null; if (era && aperto()) opz(() => cl()); }
  function apri(tab) { pan = { tab: tab || (pan && pan.tab) || 'compra', tipo: '', conf: null, bozza: {}, nuovo: 1 }; disegna(); if (collegato()) VXP.send(ID, 'stato?', {}); }

  function disegna() {
    if (!pan) return;
    const pe = PN(); if (!pe) return;
    if (!pan.nuovo && !aperto()) { pan = null; return; }
    if (!pan.nuovo) pe.querySelectorAll('input[data-k]').forEach(i => { pan.bozza[i.dataset.k] = i.value; });
    const foc = pe.querySelector('input:focus'), quale = foc && foc.dataset.k;
    const nuovo = pan.nuovo; pan.nuovo = 0;
    opz(() => { PM = 'vxm'; }); pe.classList.remove('fishp');
    const sc = pe.scrollTop;
    pe.innerHTML = html(); pe.style.display = 'block'; pe.dataset.m = 'vxm';
    if (nuovo) opz(() => { if (cineOK()) { pe.classList.remove('pop'); void pe.offsetWidth; pe.classList.add('pop'); } }); else pe.scrollTop = sc;
    pe.querySelectorAll('input[data-k]').forEach(i => {
      if (pan.bozza[i.dataset.k] != null) i.value = pan.bozza[i.dataset.k];
      i.onkeydown = e => { e.stopPropagation(); if (e.key === 'Enter' && i.dataset.enter) clic(i.dataset.enter, i.dataset.v); if (e.key === 'Escape') chiudi(); };
    });
    if (quale) { const i = pe.querySelector('input[data-k="' + quale + '"]'); if (i) i.focus(); }
    pe.querySelectorAll('[data-a]').forEach(b => { b.onclick = () => clic(b.dataset.a, b.dataset.v); });
  }
  const btn = (a, v, txt, o) => '<button class="' + (o && o.on ? 'on' : '') + '" data-a="' + a + '" data-v="' + e2(v) + '"' + (o && o.dis ? ' disabled' : '') + (o && o.ti ? ' title="' + e2(o.ti) + '"' : '') + '>' + txt + '</button>';
  const riga = (it, sotto, destra) => '<div class="it"><span>' + (opz(() => fmt(it)) || e2(it.n)) + (sotto ? '<span class="vda">' + sotto + '</span>' : '') + '</span><span>' + destra + '</span></div>';
  const prezzoDi = u => Math.floor(+(pan.bozza['p' + u] || 0));
  const consigliato = it => Math.max(CFG.prezzoMin, Math.round((+it.p || 1) * CFG.consigliato));

  function html() {
    const S0 = ST || { banchi: [], miei: [], cons: [], vendite: [], oro: 0 }, t = pan.tab;
    let h = '<h3>' + ic('forziere', 24) + ' <span>' + e2(CFG.nome) + '</span><span class="mu">' + ic('oro', 14) + ' ' + ((P.g | 0).toLocaleString('it-IT')) + '</span></h3>';
    const n2 = S0.cons.length;
    h += '<div class="vtab">' + btn('tab', 'compra', ic('oro') + 'In vendita (' + S0.banchi.length + ')', { on: t === 'compra' }) + btn('tab', 'vendi', ic('zaino') + 'Vendi', { on: t === 'vendi' }) +
      btn('tab', 'miei', ic('pergamena') + 'I miei banchi (' + S0.miei.length + (n2 ? ' · ' + n2 + ' da ritirare' : '') + ')', { on: t === 'miei' }) + '</div>';
    if (!ST) return h + '<p class="mu">Apro il mercatino…</p>' + fondo();
    if (ST.bloccato) h += '<p class="qb">Il mercatino ti ha bloccato: un acquisto non risultava pagato. Se è un errore, chiedi all\'admin del server.</p>';
    else if (!ST.proprio) h += '<p class="qb">Il banco di ' + e2(NET.name) + ' è legato a un altro browser. Da lì scrivi <b>/mercato chiave</b> per vedere il codice, poi qui <b>/mercato chiave CODICE</b>.</p>';
    if (t === 'compra') {
      h += '<div class="vflt">' + btn('tipo', '', 'Tutto', { on: !pan.tipo }) + Object.keys(TIPI).map(k => btn('tipo', k, TIPI[k], { on: pan.tipo === k })).join('') + '</div>';
      const L = S0.banchi.filter(b => !pan.tipo || b.it.s === pan.tipo);
      if (!L.length) h += '<p class="mu">' + (S0.banchi.length ? 'Niente di questo tipo.' : 'Per ora nessuno vende niente. Metti in vendita qualcosa tu!') + '</p>';
      const pieno = P.inv.length >= INV;
      h += L.slice(0, 80).map(b => {
        const poco = (P.g | 0) < b.prezzo, conf = pan.conf === b.id;
        const dis = !ST.proprio || ST.bloccato || poco || pieno;
        return riga(b.it, 'da ' + e2(b.da) + ' · scade tra ' + giorni(b.scade), '<span class="' + (poco ? 'vno' : '') + '">' + ORO(b.prezzo) + '</span>' +
          btn(conf ? 'compra' : 'conf', b.id, conf ? 'Conferma' : 'Compra', { dis, on: conf, ti: poco ? 'Non hai abbastanza oro' : pieno ? 'Lo zaino è pieno' : '' }));
      }).join('');
      if (pieno) h += '<p class="mu">Lo zaino è pieno: libera un posto per comprare.</p>';
    } else if (t === 'vendi') {
      h += '<p class="mu">Scegli il prezzo e metti l\'oggetto sul banco: lo tiene il mercatino finché qualcuno lo compra, anche se non sei online. ' +
        (ST.tassa ? 'Il mercatino tiene il ' + ST.tassa + '% di ogni vendita. ' : '') + 'Dopo ' + ST.giorni + ' giorni gli invenduti tornano da te. Banchi: ' + S0.miei.length + '/' + ST.max + '.</p>';
      if (!P.inv.length) h += '<p class="mu">Lo zaino è vuoto.</p>';
      h += P.inv.map((it, i) => {
        if (PEND[it.u]) return '';
        const no = it.ar ? 'vincolato' : it.lk ? 'bloccato (sbloccalo dallo zaino)' : '';
        if (no) return riga(it, '', '<span class="mu">' + no + '</span>');
        const v = pan.bozza['p' + it.u] != null ? pan.bozza['p' + it.u] : consigliato(it);
        pan.bozza['p' + it.u] = v;
        const netto = Math.floor(+v || 0) - Math.floor((+v || 0) * ST.tassa / 100);
        return riga(it, 'dal mercante ' + (+it.p || 0) + ' · ti restano ' + Math.max(0, netto), '<input type="number" min="' + CFG.prezzoMin + '" max="' + ST.prezzoMax + '" data-k="p' + e2(it.u) + '" data-enter="vendi" data-v="' + i + '" value="' + e2(v) + '">' +
          btn('vendi', i, 'Vendi', { dis: !ST.proprio || ST.bloccato || S0.miei.length >= ST.max }));
      }).join('');
    } else {
      if (S0.oro > 0) h += '<p class="qb">Hai ' + ORO(S0.oro) + ' da incassare: arrivano appena il banco è di nuovo tuo.</p>';
      h += '<h4>' + ic('forziere') + ' Sul banco</h4>' + (S0.miei.length ? S0.miei.map(b => riga(b.it, 'scade tra ' + giorni(b.scade), ORO(b.prezzo) + btn('ritira', b.id, 'Ritira', { dis: !ST.proprio }))).join('') : '<p class="mu">Non hai niente in vendita.</p>');
      if (S0.cons.length) {
        const pieno = P.inv.length >= INV, perche = { acquisto: 'comprato', ritirato: 'ritirato dal banco', scaduto: 'invenduto', tolto: 'tolto dall\'admin', 'non ritirato': 'il compratore non l\'ha preso' };
        h += '<h4>' + ic('zaino') + ' Da ritirare</h4>' + S0.cons.map(c => riga(c.it, perche[c.perche] || '', (c.paga ? ORO(c.paga) : '') + btn('prendi', c.id, c.paga ? 'Paga e prendi' : 'Prendi', { dis: !ST.proprio || pieno || (c.paga && (P.g | 0) < c.paga) }))).join('');
        if (pieno) h += '<p class="mu">Lo zaino è pieno.</p>';
      }
      if (S0.vendite.length) h += '<h4>' + ic('oro') + ' Ultime vendite</h4>' + S0.vendite.map(v => '<div class="it"><span>' + e2(v.n) + '<span class="vda">a ' + e2(v.a) + ' · ' + new Date(v.t).toLocaleString('it-IT', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) + '</span></span><span>' + ORO(v.netto) + '</span></div>').join('');
    }
    return h + fondo();
  }
  const fondo = () => '<div class="vfondo">' + btn('chiudi', '', 'Chiudi') + '</div>';

  function clic(a, v) {
    if (!pan) return;
    if (a === 'chiudi') { chiudi(); return; }
    if (a === 'tab') { pan.tab = v; pan.conf = null; disegna(); if (collegato()) VXP.send(ID, 'stato?', {}); return; }
    if (a === 'tipo') { pan.tipo = v; pan.conf = null; disegna(); return; }
    if (!collegato()) { avvisa('Non sei collegato al server.'); return; }
    if (a === 'conf') { pan.conf = v; disegna(); return; }
    if (a === 'compra') {
      const b = ST && ST.banchi.find(x => x.id === v); pan.conf = null;
      if (!b) { disegna(); return; }
      if (P.inv.length >= INV) { avvisa('Lo zaino è pieno.'); disegna(); return; }
      if ((P.g | 0) < b.prezzo) { avvisa('Non hai abbastanza oro.'); disegna(); return; }
      VXP.send(ID, 'compra', { id: b.id, prezzo: b.prezzo }); disegna(); return;
    }
    if (a === 'vendi') {
      const pe = PN(); if (pe) pe.querySelectorAll('input[data-k]').forEach(i => { pan.bozza[i.dataset.k] = i.value; });
      const it = P.inv[+v]; if (!it || it.ar || it.lk) return;
      const pr = prezzoDi(it.u);
      if (!(pr >= CFG.prezzoMin) || pr > ST.prezzoMax) { avvisa('Il prezzo va da ' + CFG.prezzoMin + ' a ' + ST.prezzoMax + ' monete.'); return; }
      P.inv.splice(+v, 1); PEND[it.u] = { it, t: Date.now() }; opz(() => save()); opz(() => hud());
      VXP.send(ID, 'vendi', { it, prezzo: pr }); disegna(); return;
    }
    if (a === 'ritira') { VXP.send(ID, 'ritira', { id: v }); return; }
    if (a === 'prendi') {
      const c = ST && ST.cons.find(x => x.id === v); if (!c) return;
      if (P.inv.length >= INV) { avvisa('Lo zaino è pieno.'); return; }
      if (c.paga && (P.g | 0) < c.paga) { avvisa('Non hai abbastanza oro.'); return; }
      VXP.send(ID, 'prendi', { id: v });
    }
  }
  function rimetti(u) { const q = PEND[u]; if (!q) return; delete PEND[u]; P.inv.push(q.it); opz(() => save()); opz(() => hud()); }

  // ---------- messaggi dal server ----------
  VXP.on(ID, 'apri', d => apri(d && d.tab));
  VXP.on(ID, 'stato', d => {
    ST = d || null;
    // gli oggetti partiti da un po' che il banco non ha ricevuto tornano nello zaino
    if (ST) for (const u of Object.keys(PEND)) { if (ST.miei.some(b => b.it.u === u)) delete PEND[u]; else if (Date.now() - PEND[u].t > 8000) rimetti(u); }
    if (pan) disegna();
  });
  VXP.on(ID, 'vendiOk', d => { if (d && PEND[d.u]) { delete PEND[d.u]; suono(520, .06); } });
  VXP.on(ID, 'vendiKo', d => { if (!d) return; rimetti(d.u); avvisa(d.testo || 'Il mercatino non l\'ha preso.'); if (pan) disegna(); });
  // un oggetto da mettere nello zaino: comprato (con il prezzo da pagare), ritirato o invenduto
  VXP.on(ID, 'ricevi', d => {
    if (!d || !d.it) return;
    if (!P.inv.some(x => x.u === d.it.u)) {   // già arrivato una volta (conferma persa): non si paga di nuovo
      if (P.inv.length >= INV) { avvisa('Lo zaino è pieno: l\'oggetto ti aspetta al mercatino.'); VXP.send(ID, 'pieno', { id: d.id }); return; }
      const paga = Math.max(0, d.paga | 0);
      if (paga) P.g = Math.max(0, (P.g | 0) - paga);
      P.inv.push(d.it); opz(() => itemFly(d.it)); opz(() => save()); opz(() => hud());
      suono(paga ? 880 : 620, .06); if (paga) setTimeout(() => suono(660, .06), 70);
      avvisa(paga ? 'Hai comprato ' + opz(() => iname(d.it)) + ' per ' + paga + ' monete.' : 'Hai ritirato ' + opz(() => iname(d.it)) + '.');
    }
    VXP.send(ID, 'preso', { id: d.id });
  });
  VXP.on(ID, 'esito', d => { if (d && d.testo) avvisa(d.testo); });
  VXP.on(ID, 'chiave', d => {
    if (d && d.k) { opz(() => localStorage.setItem(LSK(), String(d.k))); VXP.send(ID, 'ciao', { k: chiave() }); return; }
    opz(() => clog('', 'Codice del tuo banco al mercatino: ' + chiave() + ' (da un altro browser scrivi /mercato chiave ' + chiave() + ')', { sys: 1 }));
  });
  VXP.on(ID, 'spegni', () => chiudi());
  VXP.on(ID, 'ciao?', () => { if (NET.name) VXP.send(ID, 'ciao', { k: chiave() }); });

  window.VXP_MERCATO = { stato: () => ({ ST, PEND, pan }) };

  // a ogni nuova connessione si presenta al plugin con la chiave del banco; poi controlla gli oggetti in viaggio
  let tSt = 0;
  setInterval(() => {
    try {
      if (NET.ok && NET.id && NET.id !== ultimoId && NET.name) { ultimoId = NET.id; VXP.send(ID, 'ciao', { k: chiave() }); }
      if (Object.keys(PEND).length && Date.now() - tSt > 4000 && collegato()) { tSt = Date.now(); VXP.send(ID, 'stato?', {}); }
      if (pan && !aperto() && !pan.nuovo) pan = null;
    } catch (err) { console.error('[plugin ' + ID + ']', err); }
  }, 500);
}

// ======================= server =======================
const crypto = require('crypto');
const K = n => String(n || '').toLowerCase();
const testo = (v, n) => (typeof v === 'string' ? v : '').replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, n);
const lim = (v, a, b) => Math.max(a, Math.min(b, v));
const impronta = k => crypto.createHash('sha256').update('mercato:' + String(k || '').toUpperCase().replace(/[^A-Z0-9]/g, '')).digest('hex');
const GIORNO = 24 * 3600 * 1000;
const RARITA = ['comune', 'raro', 'epico', 'leggendario'], TIPO = { w: 'arma', h: 'elmo', c: 'corazza', s: 'scudo' };

// un oggetto del gioco ricevuto dal browser: solo campi semplici, solo equipaggiamento normale (niente premi dell'arena)
function pulisciOggetto(o) {
  if (!o || typeof o !== 'object' || Array.isArray(o)) return null;
  const r = {}; let n = 0;
  for (const k of Object.keys(o)) {
    if (++n > 30) break;
    if (!/^[a-zA-Z]{1,8}$/.test(k)) continue;
    const v = o[k];
    if (typeof v === 'number' && isFinite(v)) r[k] = lim(v, -1e7, 1e7);
    else if (typeof v === 'string') r[k] = testo(v, 60);
    else if (typeof v === 'boolean') r[k] = v;
  }
  if (!['w', 'h', 'c', 's'].includes(r.s) || !r.n || r.ar || r.lk || !(r.r >= 0 && r.r <= 3)) return null;
  r.u = testo(String(r.u || ''), 12); if (!r.u) return null;
  return r;
}
const descr = it => it.n + (it.up ? ' +' + it.up : '');

module.exports = {
  name: 'Mercatino di Aldoria',
  version: '1.0',
  author: 'Voxelia',
  description: '/mercato: metti in vendita gli oggetti dello zaino e compra quelli degli altri, anche quando il venditore non è online',
  defaults: {
    nome: 'Mercatino di Aldoria',
    tassaPercento: 5,          // parte di ogni vendita che il mercatino tiene (oro che esce dal gioco); 0 = niente tassa
    giorniScadenza: 7,         // dopo quanti giorni un oggetto invenduto torna al venditore
    banchiPerEroe: 8,          // oggetti in vendita per eroe al massimo
    banchiTotali: 400,         // oggetti in vendita sul server al massimo
    prezzoMin: 1,
    prezzoMax: 100000,
    prezzoConsigliato: 2,      // prezzo proposto nel pannello: quanto paga il mercante del gioco × questo numero
    bloccaSospetti: true,      // blocca dal mercatino chi riceve un oggetto senza che il suo oro scenda (trucchi)
    attesaCompraSec: 2,        // secondi tra due acquisti dello stesso eroe
    vietateDa: ['arena', 'mare', 'arrembaggio', 'stiva', 'sogno', 'cella'],   // zone da cui /mercato non si apre
    ancheNeiDungeon: false     // se il mercatino si apre anche dentro i dungeon
  },

  setup(api) {
    const C = api.config, S = api.store;
    for (const k of ['cons', 'incassi', 'chiavi', 'bloccati']) if (!S[k] || typeof S[k] !== 'object' || Array.isArray(S[k])) S[k] = {};
    for (const k of ['banchi', 'storia', 'sospetti']) if (!Array.isArray(S[k])) S[k] = [];
    if (!(S.n > 0)) S.n = 1;
    if (!(S.tasse >= 0)) S.tasse = 0;
    const aut = new Map();       // id della connessione → nome (minuscolo) se questo browser ha la chiave del banco
    const visti = new Set();     // connessioni il cui gioco si è presentato (ha il codice del plugin)
    const chiaviNuove = new Map(); // id → chiave mandata dal browser, per legare il banco alla prima vendita
    const ultimoAcquisto = new Map();
    const controlli = new Map(); // id consegna → controllo del pagamento in corso
    const finto = p => !!(globalThis.VoxeliaStress && globalThis.VoxeliaStress.bot(p));
    const esito = (p, t) => p.send('esito', { testo: t });
    const nuovoId = () => 'm' + (S.n++);
    // il banco di un nome è di questo browser: se il nome non ha ancora una chiave, di chiunque abbia mandato la sua
    const proprio = p => !!p && aut.get(p.id) === K(p.name);
    const durata = () => (+C.giorniScadenza > 0 ? +C.giorniScadenza : 7) * GIORNO;
    const scade = b => b.t + durata() - Date.now();
    const tassa = n => Math.floor(n * Math.max(0, Math.min(100, +C.tassaPercento || 0)) / 100);
    const vietata = p => (C.vietateDa || []).some(z => String(p.zone).split('@')[0] === z) || (!C.ancheNeiDungeon && String(p.zone).includes('@'));
    const consDi = k => S.cons[k] || (S.cons[k] = []);
    const online = k => api.players().filter(o => K(o.name) === k && proprio(o));

    api.client('(' + nelGioco.toString() + ')(' + JSON.stringify(api.id) + ',' + JSON.stringify({ nome: String(C.nome), prezzoMin: Math.max(1, C.prezzoMin | 0), consigliato: Math.max(0, +C.prezzoConsigliato || 0) }) + ');');

    // ---------- quello che vede un giocatore ----------
    function stato(p) {
      const k = K(p.name), pub = b => ({ id: b.id, it: b.it, prezzo: b.prezzo, da: b.nome, scade: scade(b) });
      const inc = S.incassi[k], mio = proprio(p);   // oggetti da ritirare e vendite solo a chi ha la chiave del banco
      p.send('stato', {
        banchi: S.banchi.filter(b => b.k !== k).sort((a, b) => b.t - a.t).slice(0, 150).map(pub),
        miei: S.banchi.filter(b => b.k === k).map(pub),
        cons: (mio && S.cons[k] || []).map(c => ({ id: c.id, it: c.it, paga: c.paga || 0, perche: c.perche })),
        vendite: S.storia.filter(v => mio && v.dk === k).slice(-8).reverse().map(v => ({ n: v.n, a: v.a, netto: v.netto, t: v.t })),
        oro: inc && mio ? inc.oro : 0, tassa: Math.max(0, Math.min(100, +C.tassaPercento || 0)), giorni: +(durata() / GIORNO).toFixed(1),
        max: C.banchiPerEroe | 0, prezzoMax: Math.max(1, C.prezzoMax | 0), proprio: mio, bloccato: !!S.bloccati[k]
      });
    }
    // chi guarda il mercatino vede subito i banchi cambiati (solo chi ha chiesto lo stato da poco)
    const guarda = new Map();
    function aggiornaTutti() { const ora = Date.now(); for (const p of api.players()) if ((guarda.get(p.id) || 0) > ora - 120000) stato(p); }

    // ---------- oro al venditore ----------
    function paga(o, n) { while (n > 0) { const q = Math.min(n, 1e6); o.give('gold', q); n -= q; } }
    function accredita(k, nome, netto, riga) {
      if (!(netto > 0)) return;
      const o = online(k)[0];
      if (o) { paga(o, netto); o.tell('🪙 ' + riga + ': +' + netto + ' monete.'); return; }
      const inc = S.incassi[k] || (S.incassi[k] = { nome, oro: 0, righe: [] });
      inc.oro += netto; inc.righe.push(riga); if (inc.righe.length > 20) inc.righe.splice(0, inc.righe.length - 20);
    }
    function incassa(p) {
      const k = K(p.name), inc = S.incassi[k]; if (!inc || !proprio(p)) return;
      delete S.incassi[k]; api.save();
      paga(p, inc.oro);
      p.tell('🪙 Mentre non c\'eri, al mercatino: ' + inc.righe.slice(-6).join('; ') + (inc.righe.length > 6 ? '…' : '') + '. Incassi ' + inc.oro + ' monete.');
    }

    // ---------- consegne: l'oggetto resta nella lista finché il gioco non dice di averlo nello zaino ----------
    function consegna(p, c) {
      if (c.paga > 0) {
        if (p.gold < c.paga) { esito(p, 'Servono ' + c.paga + ' monete per prendere ' + descr(c.it) + '.'); return; }
        controlli.set(c.id, { id: c.id, pid: p.id, k: K(p.name), nome: p.name, ip: p.ip, prima: p.gold, n: c.paga, min: p.gold, t0: Date.now(), tAck: 0, it: c.it });
      }
      p.send('ricevi', { id: c.id, it: c.it, paga: c.paga || 0 });
    }
    // dopo la consegna di un oggetto pagato, l'oro dell'eroe (che il gioco manda ogni decimo di secondo) deve scendere del prezzo
    function valuta(q) {
      controlli.delete(q.id);
      const atteso = q.prima - q.n, tolleranza = Math.max(3, Math.ceil(q.n * .02));
      if (q.min <= atteso + tolleranza) return;
      const s = { t: Date.now(), nome: q.nome, ip: q.ip, oggetto: descr(q.it), prezzo: q.n, prima: q.prima, dopo: q.min };
      S.sospetti.push(s); if (S.sospetti.length > 300) S.sospetti.splice(0, S.sospetti.length - 300);
      api.log('sospetto: ' + q.nome + ' ha preso ' + s.oggetto + ' per ' + q.n + ' monete ma il suo oro non è sceso (' + q.prima + ' → ' + q.min + ')');
      if (C.bloccaSospetti) { S.bloccati[q.k] = { t: Date.now(), perche: s.oggetto + ' non pagato' }; const p = api.player(q.pid); if (p) { esito(p, 'Il mercatino non ha visto il pagamento: sei bloccato finché non controlla l\'admin.'); stato(p); } }
      api.save();
    }
    api.every(200, () => {
      const ora = Date.now();
      for (const q of [...controlli.values()]) {
        const p = api.player(q.pid);
        if (p) q.min = Math.min(q.min, p.gold);
        if (q.tAck && (ora - q.tAck > 2500 || !p)) valuta(q);
        else if (!q.tAck && (ora - q.t0 > 30000 || !p)) controlli.delete(q.id);   // non è arrivato: resta da ritirare
      }
    });

    // ---------- scadenze ----------
    function pulisci() {
      const ora = Date.now(), giorni = durata();
      let n = 0;
      S.banchi = S.banchi.filter(b => {
        if (ora - b.t < giorni) return true;
        consDi(b.k).push({ id: nuovoId(), it: b.it, perche: 'scaduto', t: ora }); n++;
        for (const o of online(b.k)) o.tell('Al mercatino nessuno ha comprato ' + descr(b.it) + ': ritiralo con /mercato.');
        return false;
      });
      // oggetti comprati e mai presi: tornano al venditore (che non è stato pagato)
      for (const k of Object.keys(S.cons)) {
        S.cons[k] = S.cons[k].filter(c => {
          if (!(c.paga > 0) || ora - c.t < giorni || controlli.has(c.id)) return true;
          consDi(c.dk).push({ id: nuovoId(), it: c.it, perche: 'non ritirato', t: ora }); n++;
          return false;
        });
        if (!S.cons[k].length) delete S.cons[k];
      }
      if (n) { api.save(); aggiornaTutti(); }
    }
    api.every(3600 * 1000, pulisci); api.after(1000, pulisci);

    // ---------- dal gioco ----------
    api.onClient('ciao', (p, d) => {
      if (finto(p)) return;
      const k = K(p.name), ch = d && typeof d.k === 'string' && /^[A-Za-z0-9-]{8,40}$/.test(d.k) ? d.k : '';
      aut.delete(p.id); chiaviNuove.delete(p.id); visti.add(p.id);
      if (S.chiavi[k] ? ch && impronta(ch) === S.chiavi[k] : ch) aut.set(p.id, k);
      if (!S.chiavi[k] && ch) chiaviNuove.set(p.id, ch);
      if (guarda.has(p.id)) stato(p);
      if (!proprio(p)) { if (S.chiavi[k] && (S.cons[k] || S.incassi[k] || S.banchi.some(b => b.k === k))) p.tell('Il tuo banco al mercatino è legato a un altro browser: /mercato chiave CODICE per usarlo qui.'); return; }
      incassa(p);
      const n = (S.cons[k] || []).length;
      if (n) p.tell('Al mercatino hai ' + (n === 1 ? 'un oggetto' : n + ' oggetti') + ' da ritirare: /mercato');
    });
    api.onClient('stato?', p => { guarda.set(p.id, Date.now()); stato(p); });
    api.onClient('rotto', (p, L) => api.log('il gioco non ha più ' + [].concat(L).join(', ') + ': il mercatino va aggiornato per questa versione'));

    // si può usare il mercatino? restituisce il motivo per cui no
    function no(p) {
      const k = K(p.name);
      if (finto(p)) return 'I bot non usano il mercatino.';
      if (!p.name || k === 'eroe') return 'Scegli un nome per il tuo eroe prima di usare il mercatino.';
      if (S.bloccati[k]) return 'Sei bloccato dal mercatino: chiedi all\'admin del server.';
      if (!visti.has(p.id)) return 'Ricarica la pagina del gioco per usare il mercatino.';
      if (!proprio(p)) return 'Il tuo banco è legato a un altro browser: scrivi /mercato chiave CODICE.';
      if (vietata(p)) return 'Da qui il mercatino non si apre.';
      return '';
    }

    api.onClient('vendi', (p, d) => {
      const k = K(p.name), it = pulisciOggetto(d && d.it), u = d && d.it && testo(String(d.it.u || ''), 12);
      const ko = t => p.send('vendiKo', { u, testo: t });
      const e = no(p); if (e) return ko(e);
      if (!it) return ko('Questo oggetto non si può vendere.');
      if (S.banchi.some(b => b.it.u === it.u && b.k === k)) { p.send('vendiOk', { u }); stato(p); return; }   // già arrivato (messaggio ripetuto)
      const pr = Math.floor(+(d && d.prezzo) || 0), max = Math.max(1, C.prezzoMax | 0), min = Math.max(1, C.prezzoMin | 0);
      if (!(pr >= min && pr <= max)) return ko('Il prezzo va da ' + min + ' a ' + max + ' monete.');
      if (S.banchi.filter(b => b.k === k).length >= (C.banchiPerEroe | 0)) return ko('Hai già ' + (C.banchiPerEroe | 0) + ' oggetti in vendita.');
      if (S.banchi.length >= (C.banchiTotali | 0)) return ko('Il mercatino è pieno: riprova più tardi.');
      if (!S.chiavi[k]) { const ch = chiaviNuove.get(p.id); if (!ch) return ko('Ricarica la pagina del gioco per usare il mercatino.'); S.chiavi[k] = impronta(ch); chiaviNuove.delete(p.id); }
      const b = { id: nuovoId(), k, nome: p.name, it, prezzo: pr, t: Date.now() };
      S.banchi.push(b); api.save();
      api.log(p.name + ' vende ' + descr(it) + ' per ' + pr);
      p.send('vendiOk', { u }); stato(p); aggiornaTutti();
      esito(p, descr(it) + ' è sul banco per ' + pr + ' monete.');
    });

    api.onClient('compra', (p, d) => {
      const k = K(p.name), e = no(p); if (e) { esito(p, e); return; }
      const ora = Date.now(); if (ora - (ultimoAcquisto.get(p.id) || 0) < Math.max(0, +C.attesaCompraSec || 0) * 1000) { esito(p, 'Un attimo…'); return; }
      const i = S.banchi.findIndex(b => b.id === (d && d.id)), b = S.banchi[i];
      if (!b) { esito(p, 'Qualcuno l\'ha già comprato.'); stato(p); return; }
      if (b.k === k) { esito(p, 'È un tuo banco.'); return; }
      if ((d.prezzo | 0) !== b.prezzo) { esito(p, 'Il prezzo è cambiato.'); stato(p); return; }
      if (p.gold < b.prezzo) { esito(p, 'Servono ' + b.prezzo + ' monete.'); return; }
      ultimoAcquisto.set(p.id, ora);
      S.banchi.splice(i, 1);
      const c = { id: nuovoId(), it: b.it, paga: b.prezzo, perche: 'acquisto', t: ora, dk: b.k, dn: b.nome };
      consDi(k).push(c); api.save();
      api.log(p.name + ' compra ' + descr(b.it) + ' da ' + b.nome + ' per ' + b.prezzo);
      consegna(p, c); aggiornaTutti();
    });

    // il gioco ha messo l'oggetto nello zaino (e, se era comprato, ha tolto l'oro)
    api.onClient('preso', (p, d) => {
      const k = K(p.name), L = S.cons[k] || [], i = L.findIndex(c => c.id === (d && d.id)); if (i < 0) return;
      const c = L.splice(i, 1)[0]; if (!L.length) delete S.cons[k];
      const q = controlli.get(c.id); if (q) q.tAck = Date.now();
      if (c.paga > 0) {
        const t = tassa(c.paga), netto = c.paga - t;
        S.tasse += t;
        S.storia.push({ t: Date.now(), n: descr(c.it), r: c.it.r, prezzo: c.paga, tassa: t, netto, da: c.dn, dk: c.dk, a: p.name });
        if (S.storia.length > 500) S.storia.splice(0, S.storia.length - 500);
        accredita(c.dk, c.dn, netto, p.name + ' ha comprato ' + descr(c.it));
      }
      api.save(); stato(p);
    });
    api.onClient('pieno', (p, d) => { const q = controlli.get(d && d.id); if (q) controlli.delete(q.id); stato(p); });

    api.onClient('ritira', (p, d) => {
      const k = K(p.name), e = no(p); if (e) { esito(p, e); return; }
      const i = S.banchi.findIndex(b => b.id === (d && d.id) && b.k === k); if (i < 0) { stato(p); return; }
      const b = S.banchi.splice(i, 1)[0], c = { id: nuovoId(), it: b.it, perche: 'ritirato', t: Date.now() };
      consDi(k).push(c); api.save();
      consegna(p, c); aggiornaTutti();
    });
    api.onClient('prendi', (p, d) => {
      const k = K(p.name), e = no(p); if (e) { esito(p, e); return; }
      const c = (S.cons[k] || []).find(x => x.id === (d && d.id)); if (!c) { stato(p); return; }
      if (controlli.has(c.id)) return;
      consegna(p, c);
    });

    api.on('leave', p => { aut.delete(p.id); visti.delete(p.id); chiaviNuove.delete(p.id); guarda.delete(p.id); ultimoAcquisto.delete(p.id); });
    // dopo una Ricarica del plugin il server ha dimenticato chi ha la chiave: chi è già collegato si ripresenta
    api.after(500, () => { for (const p of api.players()) p.send('ciao?', {}); });

    // ---------- comandi ----------
    api.command('mercato', 'il ' + C.nome + ': /mercato apre la bancarella, /mercato cerca nome, /mercato chiave', (p, args) => {
      const sub = K(args[0] || '');
      if (sub === 'chiave' || sub === 'codice') {
        const k = K(p.name);
        if (!args[1]) { if (!proprio(p)) return 'Su questo browser non c\'è la chiave del tuo banco: scrivi /mercato chiave CODICE (il codice lo vedi dal browser dove hai venduto).'; p.send('chiave', {}); return; }
        const ch = args.slice(1).join('').toUpperCase();
        if (S.chiavi[k] && impronta(ch) !== S.chiavi[k]) { api.log('codice sbagliato per il banco di ' + p.name + ' (' + p.ip + ')'); return 'Codice sbagliato.'; }
        aut.set(p.id, k); p.send('chiave', { k: ch }); return 'Codice giusto: da questo browser il banco è di nuovo tuo.';
      }
      if (sub === 'cerca') {
        const q = K(args.slice(1).join(' ')); if (!q) return 'Scrivi cosa cerchi: /mercato cerca spada';
        const L = S.banchi.filter(b => K(b.it.n).includes(q)).sort((a, b) => a.prezzo - b.prezzo);
        if (!L.length) return 'Al mercatino non c\'è niente che si chiama così.';
        return [L.length + (L.length === 1 ? ' oggetto' : ' oggetti') + ' (/mercato per comprare):'].concat(L.slice(0, 10).map(b => '• ' + descr(b.it) + ' (' + RARITA[b.it.r] + ') ' + b.prezzo + ' oro, da ' + b.nome)).join('\n');
      }
      if (vietata(p)) return 'Da qui il mercatino non si apre.';
      p.send('apri', {});
    });

    // ---------- pagine web ----------
    const e = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
    const COL = ['#c8ccd4', '#4aa3ff', '#b866ff', '#ffae2b'];
    const STILE = '<style>body{font:15px Georgia,serif;background:#1b1610;color:#f1e6cf;margin:0;padding:16px;max-width:980px;margin:auto}h1{font-size:26px;margin:4px 0 2px}' +
      'table{border-collapse:collapse;width:100%}td,th{padding:6px 8px;border-bottom:1px solid #f5b94233;text-align:left;vertical-align:top}th{color:#f5b942;font-weight:normal;font-size:13px}' +
      '.mu{opacity:.7;font-size:13px}.oro{color:#ffd84a;white-space:nowrap}button{padding:4px 8px;border-radius:4px;border:0;cursor:pointer;margin:1px}.wrap{overflow-x:auto}</style>';
    const stat = it => (it.s === 'w' ? 'ATT ' : 'DIF ') + it.v + (it.cr ? ' · crit +' + it.cr + '%' : '') + (it.hp ? ' · PV +' + it.hp : '');
    const riga = b => '<tr><td><b style="color:' + COL[b.it.r] + '">' + e(descr(b.it)) + '</b><br><span class="mu">' + TIPO[b.it.s] + ' ' + RARITA[b.it.r] + ' · ' + stat(b.it) + '</span></td><td class="oro">' + b.prezzo.toLocaleString('it-IT') + ' oro</td><td>' + e(b.nome) + '</td><td class="mu">' + Math.max(0, Math.ceil(scade(b) / GIORNO)) + ' g</td>';
    api.route('GET', '/', (req, res, x) => {
      const L = S.banchi.slice().sort((a, b) => b.t - a.t);
      x.send('<!doctype html><html lang="it"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' + e(C.nome) + '</title>' + STILE +
        '<h1>🪙 ' + e(C.nome) + '</h1><p class="mu">' + L.length + (L.length === 1 ? ' oggetto in vendita' : ' oggetti in vendita') + '. Per comprare, nel gioco scrivi /mercato.</p>' +
        (L.length ? '<div class="wrap"><table><tr><th>Oggetto</th><th>Prezzo</th><th>Venditore</th><th>Scade</th></tr>' + L.map(b => riga(b) + '</tr>').join('') + '</table></div>' : '<p>Il mercatino è vuoto.</p>') +
        '<script>setTimeout(()=>location.reload(),60000)</script>');
    });
    api.route('GET', 'dati', (req, res, x) => x.json({ banchi: S.banchi.map(b => ({ id: b.id, oggetto: b.it, prezzo: b.prezzo, venditore: b.nome, scade: b.t + durata() })) }));

    api.route('GET', 'admin', (req, res, x) => {
      const L = S.banchi.slice().sort((a, b) => b.t - a.t), d = t => new Date(t).toLocaleString('it-IT');
      const bl = Object.entries(S.bloccati), ch = Object.keys(S.chiavi).sort();
      x.send('<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Mercatino · admin</title>' + STILE +
        '<h1>Mercatino · admin</h1><p class="mu">' + L.length + ' in vendita · ' + S.storia.length + ' vendite registrate · ' + S.tasse.toLocaleString('it-IT') + ' monete di tasse tolte dal gioco</p>' +
        '<h2>Sospetti (' + S.sospetti.length + ')</h2><p class="mu">Eroi che hanno ricevuto un oggetto comprato senza che il loro oro scendesse del prezzo: di solito un trucco che salta il pagamento.</p>' +
        (S.sospetti.length ? '<div class="wrap"><table><tr><th>Quando</th><th>Eroe</th><th>Oggetto</th><th>Oro prima → dopo</th></tr>' + S.sospetti.slice().reverse().map(s => '<tr><td>' + d(s.t) + '</td><td>' + e(s.nome) + '<br><span class="mu">' + e(s.ip) + '</span></td><td>' + e(s.oggetto) + ' (' + s.prezzo + ' oro)</td><td>' + s.prima + ' → ' + s.dopo + '</td></tr>').join('') + '</table></div><button onclick="fai(\'svuota\',{})">Svuota la lista</button>' : '<p>Nessuno.</p>') +
        '<h2>Bloccati (' + bl.length + ')</h2>' + (bl.length ? '<table>' + bl.map(([k, v]) => '<tr><td>' + e(k) + '</td><td class="mu">' + e(v.perche || '') + ' · ' + d(v.t) + '</td><td><button onclick="fai(\'sblocca\',{k:' + e(JSON.stringify(k)) + '})">Sblocca</button></td></tr>').join('') + '</table>' : '<p>Nessuno.</p>') +
        '<h2>In vendita</h2>' + (L.length ? '<div class="wrap"><table><tr><th>Oggetto</th><th>Prezzo</th><th>Venditore</th><th>Scade</th><th></th></tr>' + L.map(b => riga(b) + '<td><button onclick="fai(\'togli\',{id:\'' + e(b.id) + '\'})">Togli</button></td></tr>').join('') + '</table></div><p class="mu">«Togli» rimanda l\'oggetto al venditore, che lo ritira dal pannello.</p>' : '<p>Niente.</p>') +
        '<h2>Ultime vendite</h2>' + (S.storia.length ? '<div class="wrap"><table><tr><th>Quando</th><th>Oggetto</th><th>Da → a</th><th>Prezzo</th><th>Tassa</th></tr>' + S.storia.slice(-100).reverse().map(v => '<tr><td>' + d(v.t) + '</td><td>' + e(v.n) + '</td><td>' + e(v.da) + ' → ' + e(v.a) + '</td><td class="oro">' + v.prezzo + '</td><td>' + v.tassa + '</td></tr>').join('') + '</table></div>' : '<p>Nessuna.</p>') +
        '<h2>Chiavi dei banchi</h2><p class="mu">Se un eroe ha perso il browser con cui vendeva, togli la sua chiave: il primo browser con cui rivende diventa il suo.</p>' +
        (ch.length ? '<p>' + ch.map(k => e(k) + ' <button onclick="fai(\'chiave\',{k:' + e(JSON.stringify(k)) + '})">Togli chiave</button>').join(' · ') + '</p>' : '<p>Nessuna.</p>') +
        '<script>function fai(a,b){fetch("admin/"+a,{method:"POST",headers:{"x-voxelia":"1","Content-Type":"application/json"},body:JSON.stringify(b)}).then(r=>r.json()).then(j=>{if(j.ok)location.reload();else alert(j.err||"Errore")})}</script>');
    }, { admin: true });
    api.route('POST', 'admin/*', (req, res, x) => x.body(b => {
      let j = {}; try { j = typeof b === 'string' ? JSON.parse(b) : b || {}; } catch (er) {}
      const a = x.path.replace(/^\/admin\//, '');
      if (a === 'svuota') S.sospetti = [];
      else if (a === 'sblocca') { if (!S.bloccati[j.k]) return x.json(404, { err: 'Non è bloccato' }); delete S.bloccati[j.k]; api.log('sbloccato ' + j.k); }
      else if (a === 'chiave') { if (!S.chiavi[j.k]) return x.json(404, { err: 'Nessuna chiave' }); delete S.chiavi[j.k]; for (const [id, k] of aut) if (k === j.k) aut.delete(id); api.log('tolta la chiave del banco di ' + j.k); }
      else if (a === 'togli') {
        const i = S.banchi.findIndex(q => q.id === j.id); if (i < 0) return x.json(404, { err: 'Non è più in vendita' });
        const q = S.banchi.splice(i, 1)[0]; consDi(q.k).push({ id: nuovoId(), it: q.it, perche: 'tolto', t: Date.now() });
        api.log('l\'admin ha tolto dal mercatino ' + descr(q.it) + ' di ' + q.nome); aggiornaTutti();
      } else return x.json(404, { err: 'Azione sconosciuta' });
      api.save(); x.json({ ok: 1 });
    }), { admin: true });
  },

  stop(api) { for (const p of api.players()) p.send('spegni', {}); }
};
