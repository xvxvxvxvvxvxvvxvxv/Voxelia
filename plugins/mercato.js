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
  version: '1.2',
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
    // tassa del momento: quella del config, meno lo sconto di un decreto del Sindaco se è in corso
    const scontoOra = () => S.sconto && S.sconto.fino > Date.now() ? S.sconto : null;
    const tassaPc = () => { const t = Math.max(0, Math.min(100, +C.tassaPercento || 0)), sc = scontoOra(); return sc ? Math.max(0, t - sc.pc) : t; };
    const tassa = n => Math.floor(n * tassaPc() / 100);
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
        oro: inc && mio ? inc.oro : 0, tassa: tassaPc(), giorni: +(durata() / GIORNO).toFixed(1),
        max: C.banchiPerEroe | 0, prezzoMax: Math.max(1, C.prezzoMax | 0), proprio: mio, bloccato: !!S.bloccati[k]
      });
    }
    // chi guarda il mercatino vede subito i banchi cambiati (solo chi ha chiesto lo stato da poco)
    const guarda = new Map();
    function aggiornaTutti() { const ora = Date.now(); for (const p of api.players()) if ((guarda.get(p.id) || 0) > ora - 120000) stato(p); }

    // aggancio per il Sindaco di Aldoria: decreto «sconto» = tassa più bassa di pc punti per ms millisecondi
    globalThis.VoxeliaMercato = {
      sconto(pc, ms, chi) {
        if (scontoOra()) return 'C\'è già uno sconto in corso al ' + C.nome + '.';
        const prima = Math.max(0, Math.min(100, +C.tassaPercento || 0));
        if (!prima) return 'Il ' + C.nome + ' non ha tasse da scontare.';
        pc = Math.max(1, Math.min(100, +pc || 0)); S.sconto = { pc, fino: Date.now() + Math.max(60000, +ms || 0), da: String(chi || '') }; api.save();
        api.log('sconto di ' + pc + ' punti sulla tassa' + (chi ? ' (decreto di ' + chi + ')' : ''));
        aggiornaTutti();
        const ora = tassaPc(), min = Math.round((S.sconto.fino - Date.now()) / 60000);
        return { testo: (ora ? 'tassa del ' + C.nome + ' al ' + ora + '% invece del ' + prima + '%' : C.nome + ' senza tassa sulle vendite') + ' per ' + min + (min === 1 ? ' minuto' : ' minuti') };
      }
    };

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
    // Stesso aspetto della guida e dei menu di Voxelia: Georgia, oro con l'ombra ruggine, barra di legno coi chiodi,
    // pannelli col bordo e l'ombra piena sotto, icone voxel disegnate dal gioco (edIcoURL), tema chiaro/scuro.
    const e = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
    const ICONE = {stall: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADMAAAAzCAYAAAA6oTAqAAADn0lEQVR4AeyZS0hVURSG1z3Rg8Swlwa9jEAUDRpEUKk4qEGjSBTDohcIDYKQsEEohGkDuTloGAVBKIhikyhEjBApMKLUzMq6pfl+5NsU05P/xi3nHNc+0uDmPnKF7+7HWuue/z/rso96DbL8ZO7aY7qRnpFpuuFWi5hbLWLIcQM5biyayY9LMGPDN5GKfZeyKCYmTsmBxkZlLd4z2PXoiTADI1iomE7LUIXE/vqKMjGqXoJdL69rmGlnzbzDR4kjZVsk5X5sooL8XJbE5BQqaPnE1uL9/ke9NILRwMtgfx9xIAZ+dA4RB2KAq8UeYoCrxR5iALkciAHkciBmRZixbnh5HjKja/dWTWfKy0p9q8JM4e08Hz4tRnnbd3oxf5pxIOFxSQXVvqxhQXyl66URaDE2z5gU61vHUtfZTVXXswUPr16hC+fSfVZOnkjyrXQ9TEjEx6xxfJQ4ZBLG2uFB0UrMnXC12LPmBaM+KT7KtCLMWC/KzUt7O5RGuHznXjDqzyTvM3du3UgSXNOo/tXPdkXe2eWErEQ9jEC8EyPlcjRlZMcJwpPDqT16VvA6fIxuBlqW7UhR+1efimDUP7t13Mw5nUAgfk+EzY+BVVPbEAHMvQC0AqdWYca56dV1yIyOnYMm185Yz3Bd5hCtQmlGnt+6jSoj2FeaQdBr2Mzs3hYmzm+c4brSNzylvMc2M8jC+a0z0KhiiRlVohf2l5jRuSvQ5nZTbWZ+DkyQvySO/JWHWM5f3EL+NQfJv+kYy6mBKOp7kEWTlTdY3mcmkv9aFPnv7GVJPbKWRnI+0FwxT3PyI4qM2KD0YzOzmPW5n4hjIYH7Hxf2FsLU2/CNRcZHGoaJQ8a7300Th4yrRt6MKlvz/SVmqkrbqKqunwVelvubP1D2hnpfzXeGAfWVVT1UM98ZDsRbnz+d70o1C+Ju2MzgObN9bAep+BOIoP2ZW5WEpYbRvelRJUUdXRQduV/JhrW7qXjLfSWFlE+h54xbO3WNGU5hOMt1xqnXuraZwXOmc3CSQP2XAbr7pNmnG5H//Jyx2vXQ3NYZD+lmpYbMsLdlBTflpUOdkXdCtzHUGd06IvUoO9MzOC5zPDFCL2sm0DHsCQNSpNRr1DR0i28A8PsYgjKAuY646TVmJ3/TxrkZwduWHh312zS56RUfs86hKQLWqtaeCZ91rdMcWoFVE/QKM9ZNzOsDQ9oagT4nUq/R0jUuuiKdyoCzQJe1m96/AAAA///iebxnAAAABklEQVQDADMLTS1Yob79AAAAAElFTkSuQmCC', coin: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAB40lEQVR4AexWoU7EQBAdCIogz2MRJDhA4bGgji+4L0HwGQhQaDwGkCSEYBEoKskpEphtM81ruxOW3ZZub/fSdzO3N53umzeddp0m/skExhYwSIHZ1sZ3HwgpQhCBkAv3dW4aBLQ2+Xg/IV+83RyRQMvvolIaCrhUYqwYVQGUVWuT5UNBvkDCmF/ayljcA8ajrxLAoJj99Ahgyzw/vVIfwJy3jwUJWsrP+beA3epIT4GKdzzfDQXwrsfJgBJjy+wvzsmG3b0d+g1YAsx5fDAjgZlEAt7blQDPbRDAP6biZwK+SmGLaTlkGhnbipFpNM8KtCrz7z//oEB3b8v7S7KhGzncShCB4bblnjkTcK/VMJFZgWHq6p41K+Beq2EiV1cBfIXWaoevwVqMth5yLuZcXQWQZcx+Q4Hi82tNsH16R4LNwxkJtNdgbAkXH4uCOc2rs2Bx8UIC3teZAM9tEMA/puKnQQAnkshrLEof4ptcAkflrzmuRBoKMNtoD1UBvuOtE0mmgrHISlrAx5pcNvAerJMHr6sSwKCY/TQIsJR1O7FfyyoPOmMbLQAPIJd1zIl+S/ly6vCasWyqIw0FKq5xfvsoYCQswXJbW4vX6zZz8VulKXPzWtvyUvfwIdDNMuLK5An8AAAA//+Wh7xaAAAABklEQVQDANLAbcGXoGvwAAAAAElFTkSuQmCC', sword: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAACZklEQVR4AeyZvU7cUBCFJ6uUSUcRKVLSJUqVF4jyCCmSKmnSRkqKVHmEFDxIUtFAQY8ooKCgQQhEARJQsCWiQoI5a76rWdZXWDL+gfXKx2c8Hl97Zo7u9cqjhWdPr8DuwckVwCe2Hv9GPX62So/28BNY3z4yEFPGJ5aMQIzpg/3wO9CHKtZ5htGH968MWOYnGQGkJM6Et+oeJNRquUtuNhqfXz4BSElcEjtxISWxZAQmJzvYDRLqoOhTt5zqAFISS0Zg6opwIBkBpCQOIY2bUwk0frcGbvB4E5CMAFIS54qIlMSSEcjFRz+x4uivYj/eDlTJvg8xlTqAlMSSEcglIBkByQLEeHziw6WPBnQMYnzOrpRA7uI++OcpgaLekhFASuLi7OweKYmRhvjs+LOBeBVSEisOxJhoz18HYvZ9sGt1ACmJJSOQSwzJiC82xgZWN8cGXn9ZM+DjfgM+5tcAN4utVgLFEN3uhwSov7e69J/d24XfBpCM+NfffQM/FncM+DhRNgwv/u874GaxDR0o6tDd/t46wIIj1iwDJBeAZMTvXj438OfTGwN+/T/gZUEyYj+c3e4tgdmh2/HMdwLe6vRxRO8uAMmIWaDEK1unBnL9QUriOH4ufr47kKtKm/5aHfBFJy1evL+IYwIsUGKPT4vU4vKegRj/8/sLA0hSnJNTrQTijbuyhwSovMujVE7uT7IhVuz+FI+UxDoHNHMBfDecXq2HDtxUpDNqpAPj8NHkVmZ6pwHpVJSTZjGgmQt4TKkUG0kgPVkLxpBAhSIjGfGd4S6VNDu5XSobH0RjTTB0wKvR6XYNAAD//0xOBbYAAAAGSURBVAMAEQzrhu6MrsIAAAAASUVORK5CYII=', helmet: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADMAAAAzCAYAAAA6oTAqAAADWUlEQVR4AeyYy2tTQRTGTwKCS7OQWmstURBFxUpXbhRcKf4D4kZREBQXPlDRhQtd+Vi7F1FcCG4EpcUHhS4URLEWU+sjbY2xovWBInST9gs5l5O5c+fObTO5k5LAx5zcOXPm/O6ck+QmS4vo1Ybx9TDbJ8Mns33n7opL8T6247xPZt/+o5VV3XlyJVsA6TcvGIDIIL7YiWH6h8YqZy9cIxfatKVvQfclEQz6A7u9fvWcXAixWR3Lc4T9pHguarSGQWmhP6ICNfJ6fnUnLVm6rK4fbeJbwQCEgw08vOfkVHDS2AMgnybKMBMrFkb2CGr68sXTdMWRtm5eRzt27Q36EfslITLCoF4RDHcNgg0VSz/JhRAbwl4QbJZND0XCoLSa1SOccNSI0rPpIS0MQDiw7BG+5nJU9wOIbQ+FYEw9cu7EQRqfKzFXMOs3bKzrx6Q9FIJBoqhXCDYk+wPvXUq3F3KB4vbVwsQt8nW+DePjySCnupPh7xVMtIKQr1QAg49jX75XbG4kcpXCmioMQPBGp5u37tLg00epSJeP6VpWfq/gGWXqaynw7+5ZS73b9qSmlWv6SM0HObLU327Vk8FnOCsgqRl8Pa2xlkYwyDyCizWjClOzW34IwUhyH23THa+DmRz/QP9naO4pL+elRguj1LGiK5Inq5spTX4kH6XLVV7TwkiHVrJDMIU3L7w8FVRK3I0NwfTfv0MDNZ06fozKX8r04/u0lcYKIyTXcxweFxrvyOEDRp4QDLz5mQI29O/vb7IRfCFer46Yg2xiwQe+EMeBbZIWxrTA57lYmF/TU1anIu+kCbjR8eReRhg8k38uFshWxffDxv8IGh1PgsA2wsCB69V2xBqTbOOwnymWnBt8/CATCyMX+GrfvnE9g9yy6v9U6vMLnNKUfJZCHmq+DIK57NVLZzKs8ycPZTrzvcHzS+nbH+rpysEvFRXejpDM5+XwOypNFKt6NvSEkC8SY2nLjH8ts1Paoy4f9IialxZGdfLtvSwtmVsIRq1JtYdkDbu2kaiaTxQIfEMw3D8YUZOyZpv9f0BcjwBAKgQjJ9nmmm32yPtj1PUIrktZwcgFadim0pL5xMLImk3jZGxBABULg95JS+hZJGmrWBjbQD74tWF8OAVdDrMAAAD//2o1OyAAAAAGSURBVAMA7tK/wYHx/GoAAAAASUVORK5CYII=', armor: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADMAAAAzCAYAAAA6oTAqAAAC4klEQVR4AeyYsWsVQRDGN5J/QRENgljZWAmKNtb2djbWNiIiiGCR5lWCKSzt7Cy0Emw0jQhqYyER9CGokWBrYfnkdzAy7u3t7rzZy0v0Bb7s7s3sN/Pt3t68uwPhH/pbitmrm/n/7sz5CxdnOXh3LMeNrcRfvTOXLl+dHVk7HoZQClSyt+CvEkOgUjIeeyv+opgnm9PZtdt3QwonT532aOjmtuTPipH79P271yGFLhv1D38NZUp28cWQ4uYaNg38NbSN/qAYtp7zgVMN8NUozRmDPymGQKVkPPax+Hti4nv4x872YN5rx078dZZqztCY/D0xZM79KmCcg/jRxn76/pY+PvgKGOcgfrQ5P2xJMRi80OdH9728uflFMayIRo6shU3Hom/hzIr59mUafv5aDbPVgx0+bH0Mhw4fHeSPz1CqNuXOoDVenEhWjDjvbE8DkHGuZTVzyM0VG7GAjGvbKjG1ZIv2W4pZ9A6k4nNt3+7My82nKwjQ2JdiHj283xOCqJ6YF88e//mFjMOnrTfdk2yepwvzrYjjxfkMCSFOT8zG5MaKYP3mlZXrt9bD5N6DDncmGyFXJyD0gDolsWjPnDsbvn/93OHtq+eBfHL8PTEpZ103UvaW1zyxqsS0THZMLrMYvXL0vcnBoeHhM4nx/naKE23NZxIjyfBkAzL2tnABL89cYrxBx5pvFhPXAW9iLflMYuI64K07rflMYtgF/eShzzUP4NDwcJnFeIKNPdcsRq8ifW+CcGh4+ExiWteF1nwmMbJq1AQgY28LF/DyzCXGG3Ss+WYxLesColrymcS0rgut+FgUYBLDBP3koc81D+DQGOJKvfPHvmYxMcFujHOvyjp+UYx+B2cF9eQx+sQQwF8rBN+iGPkeIG3uWzOEHlB3LO/8cayimHjCbo1rzkicy54UY7m1tCCzmPgMyf3doiWxeYUw1yxGzs4Ybem7GAnnYBaTI1u0bSlm0TswFP83AAAA//8F/Z7IAAAABklEQVQDAKITxYVkP/NtAAAAAElFTkSuQmCC', shield: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAABxklEQVR4AexXoU4EMRAdCBJJEHiCAYs9gcWugD+ABDSfgIYABo/gA5DkLBYMOYO+IHGQwEw2D3qkk85lr9vubi/3dnq9dmbfvJdmd5k6/ikEUguoKrC2uvKdGpbmqAQsm3NY0y8CrmX2Lz8pBXZPXwhw70dTu18KaCxznjcpMJ280jy42tgjH2w5HrlWjX+NO+DfAA/rr4lAvTTPayGQWpeiQOcUuB8dUwgaqdA++V/bq80XC2mdaWvepIBIC8S+sbOdGwIstUwELIlSrekvAfe5pRpfUzW2Q1PDkuf8+YgALY87318FXJY5j2cUeP/4WgKeLrYJ6AyBnG9Uu7cZBbRFOc+rBGAlibCSxBhkppP6DUzi28MJAVz7ENDqqgS0DbnND4MAy+g9ndY3twiYVxmxCwDLSORamm3uuAbAw/o7DAVqrnleGyngPi9FogfLSPSWaETAm7HlyeER4FPCeyJZGo9TR6KcOADn1E6eYNrhKRBsScsLGinA0nvt5L55jW4rAmAZibxXs42cOECwHY0IBLO3sKAQQJPZEn92ct7mxC4Ar1mIbVBTYlFAupASURRgq/zaiccLt43bsCgE3AKxx50n8AMAAP//jFKZ6AAAAAZJREFUAwAfcd+G6VDRBQAAAABJRU5ErkJggg==', scroll: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAB1klEQVR4AexZsUoDQRAdDyuxEfwAS/9A8Ass7AVrsbIWO7ELFlZiIdaKvYgfIEKa1FZir2AjVoLOQmZ5u7lN7ti922x2Qx47d7m9mTfvcYG5ihyf9dXlv3mCo0xyEnBtmLfzi0UALfMxuqDYeLg5IgHWhi5YLAWQWSpxhdKgZYajN4oNbKJYSa1Yc7EQdilGbCiAlnlmCwn6LExy2uvuwSUJPr9/9wUGgT4LDZUrfQIsxZJAJFLr4OqRBFt7pyTY3N6h0Hj/WSOB5LRXrlHbBtVLXwFkk2JsKMAyaTs1IXM9OKcQcOXiemptw9ffCQwCfDK5byHQo2TaNpizKIDdiBG3UGCyvMOTYwqByTs3P+NFoHma7q7Mj0CIPy77Hj765KeAT7e62NtagRBPHfsePsRaE/BJ1sXevAnYT5NZx0WBmg7kbSH7aTLruKaBU0/xCPEWoF+44Ka8FcBOxIoNBVguLZMxqb4/o+EYry9PFBobK18kwLwYq6m0AOs0CMTqok/e9AmgHCKRWnFS7dOhtnsxL8Y4rcZ7pq8Askkxrnh8p8eJaiotQDIoX6MYXo6Euh6n1VyzHjkWC6FSMWJDAZam1k4oX6yYa9O2wUYZBPCHVOLkCfwDAAD//zwYj+YAAAAGSURBVAMAvBVAkPtdJ5YAAAAASUVORK5CYII=', warn: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADMAAAAzCAYAAAA6oTAqAAACiklEQVR4AeyZv0oDQRDG13QKAQtLsRMRwUYQsfcFxBew8gEiiE+ggq2VhZ2lfXqfwEYCFlHSSEAUNZYn38rJ3GZu/2RnvTOcMJvb3ZnZ+d3KfrlLSyX8299dzGwmvXQymPOj1Wxtua3KTBoE+ZLAAATJ/9rEYbLRXtY53VSc7WwvJOUTh9HV9oZKcaYn0zVpYNLVa83cwFhvT4WTojsDTQlhgT+1kFjOVwwGxzE0hVuEG4MvNc4ndEwEBiChC6fwj4YxdUU9jUrrXF9pF/RHWneiYXTlVFP0gKUJ8bWk4aZkYLjMFYyJw3Rvh8pmKRlFYe5676pzMauOL+dZOzj5UmppLhlPFAw0gqvs8+NNccb50jHko0bnfK4nhsFxDJ3wWcTHB7mo+cSYPhPBAMRMVId+MEyIrrgAJXUHawXDIKjwrKIHIhpB3ZkMJqL2lKENTMq7G5M7aGegATGLhcZiPWqueG8YHMfQAVdCqXmsRc0nrxcMQHySVe3jhJHUFRdsrO44YXQBglqg89maiLX8YGyL12iuganRZhRKse4MzviCd8Ud1EPNLKcUBscxznkzoKo+aqHG1cHCAIRz9hl7fXlmnzLx5OkTH+MzBhOjK9CJQX9LlVn/YUPZ3quZIMhHf+dxvWcbg9EJI876wrMOzZNf6wUCmjwOn44wHsYRVNdpcRjbOzPMpbwRojBVvTfLb1ABBmd4PhHziZOLs5icXCzqpfYLg+MY5zgXVMcx1EoNNWoYgKAjYZXqTIyumPDQhTKNwXioznD5bbqjd6agDWaG0D70wGah+Ux/mtuY+4ExBv9rt4Gp685Nzc5c3QxmpgLm8Ox+Bv8tre71o/U3SHyfqqsBIAfB9TcAAAD//4FLTQcAAAAGSURBVAMAWlsvO9EslLAAAAAASUVORK5CYII=', lock: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADMAAAAzCAYAAAA6oTAqAAADIklEQVR4AeyZPWgUQRTH3wqKCsGAGCwSURDFU85ChEBANI2kjV0ULCwES4VIjNooBtRK0MZK0HRqFz1FPcQUCkIMKAQtzqAQDUgOPxuz2f/CHJPZ2dnZnZmbC1zIf2d23sx77zcfye7dKrL4c6B/IDSRaSrWYIaOnwq7e7ZRUZmCYLwVGIDAmW8ZwzyZ/BievXidimjP3n1W+Y1gcD6QzfTUGyoijGV6+fxRAH+8mE23LAyDrYXzoRtI1W/8zq2A+YNPSNU/zVYIBoGZw6ePHxZaFawkfDAQ1E2VG4Y/I9jzX2drBL2efEHXLg0HeXTu9IlA9GcClAsG+xnBMKsQ6kzY86yet4QviB8Hf4jHi7fL6tow2FppexlbRea8aBv8sXiICen40oKBY+aMPyNoQ2CURSXzx8fL4zcTRtzTOB8Qzgj2fJ5gsr78GYM/MZ5sTFpbJgwGYj9DqDdDiAXljaUFk9epr/5tGF8znxVXuTJHD3aFaQ56Ft8S7LaVJ57YNxXm8rGt4a7u9WL/+L70f4Jgc6E4gHCRxRO6xLdSGIDE1ugi/h+A46jZ2a9JvARMWO0PR0dLxHR1qEpMIwP3G+3MbrtksVCK8Q6VO1MnEYYEDBrr7xaoFYXcVJLCqAa0si0T5lm0Sj6VZ/KUMO9n/9DghRINXtnvRdt7N9KGzWu1eZQwDS8z80Q+1EhAr6IHo+fLey/rMJVX86SSS2KrMNMzP+nMzXU0crtTqpNjf4m2yJ8qbEBahWEJ/f5VJ5mY3VXpBMZVsll+2zBZM+TL3l4ZXzOfFdf6yiz8+LbsL1lWAjbtVmHKOzvoS623oYkbXbR6jf6zlSmYVZg4Gf4ZLm5o3sU+TPNyT0RyDsOfoUR0yw1OYcQzVPsUfYcZvSNZZiDmzylMHIQ/Q6jHjW4u7mHc5C31mglTGf+sfD9RvbuY2qQZKxqVMLujd4/DfZvIl8o7Oqg+90+R/nKTEgZdfX9+hhxkulf9HojtmTDigFa4P3+3lgBBXgmYB5U58vk5mSo2Ek4DgS0Bc2TsQ9Cq6huekq4IQKAEDBpXqtowrbpySwAAAP//tBIWygAAAAZJREFUAwBf33qjOdZluQAAAABJRU5ErkJggg==', key: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADMAAAAzCAYAAAA6oTAqAAAC9klEQVR4AexWTWsUQRCtWSTExUUxKIpBBCNiAgHBL8hFvaxe16NeBP9BwMvqTdTf4FkFLzkKexByEDx4URElePEDUYwExRAlHib7htSkpme6u3Y2O5kss/Do7ql61f26quit0RD9KjFlTWaVmSozBdxAVWYFXHKuLXrKzNXz+8NekOtEfZDUYu5cOxKeGK+TFn2cKTdVJQZCcu9QINErJpy/GLbbk6TBhek9BR49vZVTDPoDlN+vf5EG8GWM7B0h8CXYNqjRKgalhf7Is/HooZ10tL4j0V954vTKyRQDIRxorvOdnnUzowE4EPLv619MC0dKjOwR9EDr9iS17p5WYdfxBs1ePhj3F/hFKkqIQX1jc+4PzCMsLBJpEDlT3F/ry3hA/EEiFoPSytsj8WkdE8QeJLB1JAZCsABkj2DdefyJOs8XrYBPWVBz9Qh64O2HZQKePP1Gl268DEzQ4bpVy1TXpnmf8vrInsQhosxYewQefYJjD2I0jxaJMT9u1/Wmi5E9p3mbevVxXfSmipnuvjPaNymP38S5Mdp9YNSqRy1mdWmVrrfGQxOpyJr3KK9ParPkB5UY/D05eXaMpo41UkiG29pVTdY4jiLfFawhBP+3MNfA9SZl2cyYpo9pd61rV+69CxgzN18FzYkGNWf2RVhe+EPtB6do9v4ZK+jzShz/Tddf8pvrcWxjY+k/yXfK5Jv2eCPLJLPM+E2IOa4aj502Jsz3jRuM5Ix5ya/u1aP5H0GmGDetfNZbDz8GOFVKjKuHzHo21wgo+b43BP5mj0q+xs5C4JsSw/2D0ewhW+3zd/TY+y8rBMy9+EmI4YIZ3+Rr7BDBSIlhgxy5hn2j5KCG5do157jSR/J9duapxLCzdpSp13Kkn49vs3vFyBrW9IBtI3lYOZfx8d3k++zgMLxiXDVv2lDjHFg7yhhZfJ9d7uMVI53LPq/ElDVDQ5EZvtxKDN9E2cYqM2XLCJ+nygzfRNnGKjNlywifp8oM30TZxqHKzBoAAAD//yYlVPMAAAAGSURBVAMApTGzlNH0p9gAAAAASUVORK5CYII=', users: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAACO0lEQVR4AexYPUsDQRAdRTtLwR9ga2GlYC1W+gOUlHaihdjY+Qss1NJStLFXRBBBBEUkYBBEBCvxqzJ2Cjqb8x3vwu65Cfm4vSTcu5nMzn68fcPmLr0S+KdLoN0C1qzA4EDfjw0+RGz90mI+Y9ZMwGfQVuZ0BgGW+a18K8DD+Y4AnOPy38pX2jcdpeNtAXgcl6qdoYCLfRbiTgVYPpSMsR831wIwAdMGoKyM5Rz2Xy6KYgPnoJSM5fVwjpMAJ2XZzxcBlgnlYCxKxliXGqYN4BwjP8Alwzku/+isKEBVzqx+ryBfCiir4K6mKHB4ei3AyOS8AEPjowI0aqeaQqBRi/MZJ78EcKIY67MTPjl8CuF0SbPLa1sCvH9+zwE8V34VYJZZ9hMKqEQ9wPBEQYCIQHTH6ZJmF1bXBdDxYulxGhmL0kiz3DeaPb7vqVdBgoAGg7vyS0Dls5YTSiPNat+4bHwk3Z+cEoDz9dlsF9B4pWT+rJroyq8CEb/s3xMKqFz//uczvfklNowtlQTQcWLp2X8qFMQG3iZuR1kZq+PEa+P8BAFuCMUPnwBLYyuN6tjr/Z3YwIpV98H38+dXsYH7cjvHTRkBvObwFWCWIfpOBWxlYmI+JE2eDT59XTmu0nIScA2UtXiXQLsV6SrQsQrwqeLjuzaqW0KunWlVPKFA8sfnRJ956sS9vd9K/4wA66Wi1At+40sQaNWuNXKe8AmoHPHL++XGiACPB4vSTOi88Yt/rT4rGL4CzCZE/xcAAP//23c96QAAAAZJREFUAwDd1gqBiwgYlAAAAABJRU5ErkJggg=='};
    const ICO_TIPO = { w: 'sword', h: 'helmet', c: 'armor', s: 'shield' };
    const vi = n => '<i class="vi v-' + n + '" aria-hidden="true"></i>';
    const STILE = '<style>' + Object.entries(ICONE).map(([k, u]) => '.v-' + k + '{background-image:url(' + u + ')}').join('') + `
:root{--bg:#10131a;--pan:#1b2030;--pan2:#232a40;--btn:#2a3350;--btnh:#3b4770;--fg:#e8ecf4;--mu:#9aa4b8;--ac:#f5b942;--hi:#ffd27a;--lo:#c98a1a;
  --ember:#ff8a5a;--title:#f5b942;--tshadow:#8a3b12;--frame:#8a6a3a;--drop:#2e1d10;--line:#f5b94230;--line2:#f5b94266;--rowh:#f5b9420f;--wd3:#4a301b;
  --good:#4cd07a;--bad:#e8484f;--r0:#c8ccd4;--r1:#4aa3ff;--r2:#b866ff;--r3:#ffae2b;--oro:#ffd84a;--f:Georgia,'Times New Roman',serif;color-scheme:dark}
:root[data-theme=light]{--bg:#e8dfc8;--pan:#fbf3df;--pan2:#f3e8cc;--btn:#fff8e6;--btnh:#f6e7c2;--fg:#2a1a0a;--mu:#6a5a3a;--ac:#8a5a0a;--hi:#6a2a1a;--lo:#b9832a;
  --title:#6a2a1a;--tshadow:#e0c48a;--frame:#b89a62;--drop:#a37a4f;--line:#8a6a3a33;--line2:#8a6a3a77;--rowh:#8a5a0a12;
  --r0:#5a5e68;--r1:#1f6ab8;--r2:#7a2ec0;--r3:#a8560a;--oro:#8a5a0a;color-scheme:light}
@media(prefers-color-scheme:light){:root:not([data-theme=dark]):not([data-theme=light]){--bg:#e8dfc8;--pan:#fbf3df;--pan2:#f3e8cc;--btn:#fff8e6;--btnh:#f6e7c2;--fg:#2a1a0a;--mu:#6a5a3a;--ac:#8a5a0a;--hi:#6a2a1a;--lo:#b9832a;
  --title:#6a2a1a;--tshadow:#e0c48a;--frame:#b89a62;--drop:#a37a4f;--line:#8a6a3a33;--line2:#8a6a3a77;--rowh:#8a5a0a12;
  --r0:#5a5e68;--r1:#1f6ab8;--r2:#7a2ec0;--r3:#a8560a;--oro:#8a5a0a;color-scheme:light}}
*{box-sizing:border-box}
body{margin:0;min-height:100vh;color:var(--fg);font:400 16px/1.55 var(--f);display:flex;flex-direction:column;
  background:radial-gradient(ellipse 90% 50% at 50% -10%,#24305466,transparent 70%),repeating-linear-gradient(26.565deg,transparent 0 46px,var(--line) 46px 47px),
  repeating-linear-gradient(-26.565deg,transparent 0 46px,var(--line) 46px 47px),var(--bg)}
a{color:var(--ac)}a:hover{color:var(--hi)}
.vi{display:inline-block;width:1.25em;height:1.25em;vertical-align:-.25em;background-position:center;background-size:contain;background-repeat:no-repeat;flex-shrink:0;image-rendering:pixelated;filter:drop-shadow(0 1px 0 #0008)}
.top{position:sticky;top:0;z-index:10;display:flex;align-items:center;gap:12px;padding:12px clamp(16px,4vw,40px) 13px;
  background:repeating-linear-gradient(180deg,#0000 0 17px,#0000002a 17px 19px),linear-gradient(180deg,#86603b,#5e3f25 55%,#4a301b);
  border-bottom:3px solid #3a2414;box-shadow:inset 0 2px 0 #a37a4f,inset 0 -2px 0 #2e1d1055,0 5px 0 #00000066}
.top::before,.top::after{content:'';position:absolute;top:50%;width:6px;height:6px;margin-top:-3px;background:#d9b36a;box-shadow:inset -2px -2px 0 #8a6420;border-radius:1px}
.top::before{left:6px}.top::after{right:6px}
.brand{display:flex;align-items:center;gap:10px;min-width:0;text-decoration:none;font:bold 1.3rem/1.1 var(--f);font-variant:small-caps;letter-spacing:.04em;
  color:#ffd27a;text-shadow:2px 2px 0 #8a3b12,0 0 14px #f5b94244}
.brand:hover{color:#ffe7a8}.brand .vi{width:38px;height:38px}
.brand small{display:block;font:italic 400 .74rem var(--f);font-variant:normal;letter-spacing:0;color:#f4e2b8;text-shadow:1px 1px 0 #0008;margin-top:3px}
.top .sp{flex:1}
.gbtn{font:14px var(--f);color:#fff;background:#2a3350;border:1px solid #f5b94288;border-radius:3px;padding:.45em .85em;cursor:pointer;text-decoration:none;
  box-shadow:0 3px 0 #00000080;transition:transform .08s,box-shadow .08s,background .15s;display:inline-flex;align-items:center;gap:6px;white-space:nowrap}
.gbtn:hover{background:#3b4770;color:#fff}.gbtn:active{transform:translateY(2px);box-shadow:0 1px 0 #00000080}
.gbtn.on{background:linear-gradient(180deg,#ffd27a,#e0a634 55%,#c98a1a);border-color:#fff0c0;color:#2a1a06;font-weight:bold;text-shadow:0 1px 0 #fff5}
.gbtn.no{background:#5a1f22;border-color:#e8484f99;color:#ffd8d4}.gbtn.no:hover{background:#7a2a2e}
.gbtn[disabled]{opacity:.55;cursor:wait}.gbtn small{opacity:.75;font:inherit}
:root[data-theme=light] .gbtn:not(.on):not(.no){background:var(--btn);color:var(--fg);border-color:var(--frame);box-shadow:0 3px 0 var(--drop)}
:root[data-theme=light] .gbtn:not(.on):not(.no):hover{background:var(--btnh)}
@media(prefers-color-scheme:light){:root:not([data-theme=dark]) .gbtn:not(.on):not(.no){background:var(--btn);color:var(--fg);border-color:var(--frame);box-shadow:0 3px 0 var(--drop)}
  :root:not([data-theme=dark]) .gbtn:not(.on):not(.no):hover{background:var(--btnh)}}
.top .gbtn{background:#2a3350;color:#fff;border-color:#f5b94288;box-shadow:0 3px 0 #00000080}
button:focus-visible,a:focus-visible,input:focus-visible{outline:2px solid var(--ac);outline-offset:2px}
main{flex:1;width:100%;max-width:1080px;margin:0 auto;padding:22px clamp(16px,4vw,40px) 48px}
.kick{display:flex;align-items:center;gap:10px;font:bold .74rem var(--f);text-transform:uppercase;letter-spacing:.16em;color:var(--ember);margin:0}
.kick::after{content:'';width:60px;height:2px;background:linear-gradient(90deg,var(--line2),transparent)}
h1{font:bold clamp(1.9rem,5vw,2.8rem)/1.05 var(--f);letter-spacing:.06em;text-transform:uppercase;color:var(--title);text-shadow:3px 3px 0 var(--tshadow);margin:.2em 0 .35em;text-wrap:balance}
h2{display:flex;align-items:center;gap:.4em;font:bold clamp(1.35rem,3vw,1.75rem)/1.15 var(--f);color:var(--title);text-shadow:2px 2px 0 var(--tshadow);margin:0 0 .35em}
h2 .vi{width:1.1em;height:1.1em}
h2 .n{font-size:.6em;color:var(--mu);text-shadow:none;font-weight:normal}
.ch{position:relative;padding-top:26px;margin-top:26px}
.ch::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,var(--lo),var(--line2) 40%,transparent);border-radius:2px}
.mu{color:var(--mu)}p{margin:.4em 0 .8em;max-width:74ch}
.stats{display:flex;flex-wrap:wrap;gap:8px;list-style:none;margin:0 0 16px;padding:0}
.stats li{display:flex;align-items:center;gap:7px;color:var(--mu);font-size:.92rem;background:var(--pan);border:2px solid var(--frame);border-radius:4px;padding:.3em .75em;box-shadow:0 4px 0 var(--drop)}
.stats b{font:bold 1.3rem var(--f);color:var(--hi);font-variant-numeric:tabular-nums}
.callout{display:flex;align-items:center;gap:12px;background:var(--pan2);border:3px solid var(--lo);border-radius:6px;box-shadow:0 0 0 3px var(--wd3),0 7px 0 3px var(--drop),0 16px 30px #0006;
  padding:.8em 1.1em;margin:6px 3px 22px;max-width:74ch}
.callout .vi{width:34px;height:34px}.callout p{margin:0}
kbd,code{font:bold .82rem var(--f);background:var(--btn);border:1px solid var(--line2);border-radius:3px;box-shadow:0 2px 0 #0009;padding:.1em .5em;color:var(--fg);white-space:nowrap}
.filt{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin:0 0 12px}
.filt input{flex:1 1 220px;max-width:360px;font:15px var(--f);margin:0;padding:.55em .8em;border-radius:3px;border:2px solid #3a2414;background:#f4ecd6;color:#2a2010;box-shadow:inset 0 2px 0 #0002,0 2px 0 #a37a4f66}
.filt input::placeholder{color:#8a7a5a}.filt input:focus{outline:none;border-color:var(--ac);box-shadow:0 0 0 2px #f5b94266}
.chips{display:flex;flex-wrap:wrap;gap:6px}
.tw{overflow:auto;border:2px solid var(--frame);border-radius:4px;background:var(--pan);margin:.4em 0 1em;box-shadow:0 5px 0 var(--drop),0 10px 20px #0005}
table{border-collapse:collapse;width:100%;font-size:.95rem}
th{position:sticky;top:0;text-align:left;font:bold .7rem var(--f);text-transform:uppercase;letter-spacing:.1em;color:#ffd27a;text-shadow:1px 1px 0 #0008;padding:.75em .7em;white-space:nowrap;
  background:repeating-linear-gradient(180deg,#0000 0 13px,#00000022 13px 14px),linear-gradient(180deg,#86603b,#5e3f25);border-bottom:2px solid #3a2414}
td{padding:.55em .7em;border-bottom:1px solid var(--line);vertical-align:middle}
tbody tr:nth-child(even){background:var(--rowh)}tbody tr:hover{background:var(--line)}
td.n,th.n{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}
td.b{text-align:right;white-space:nowrap;width:1%}
.it{display:flex;align-items:center;gap:10px;min-width:210px}.it .vi{width:30px;height:30px}
.it b{font-size:1.02rem}.it small{display:block;color:var(--mu);font-size:.83rem;line-height:1.35}
.r0{color:var(--r0)}.r1{color:var(--r1)}.r2{color:var(--r2)}.r3{color:var(--r3)}
.tag{display:inline-block;margin-left:.45em;font:bold .6rem var(--f);text-transform:uppercase;letter-spacing:.08em;border:1px solid currentColor;border-radius:2px;padding:.08em .4em;vertical-align:.15em;background:var(--pan2)}
.oro{color:var(--oro);font-weight:bold;white-space:nowrap}.oro .vi{width:1.1em;height:1.1em;margin-right:.3em}
.ip{font-size:.83rem;color:var(--mu)}
.empty{display:flex;align-items:center;gap:10px;background:var(--pan);border:2px dashed var(--line2);border-radius:4px;padding:.8em 1em;color:var(--mu);font-style:italic;margin:.4em 0 1em}
.keys{display:flex;flex-wrap:wrap;gap:8px;list-style:none;padding:0;margin:.4em 0 1em}
.keys li{display:flex;align-items:center;gap:10px;background:var(--pan);border:2px solid var(--frame);border-radius:4px;padding:.3em .4em .3em .75em;box-shadow:0 4px 0 var(--drop)}
.keys b{color:var(--hi)}
.foot{text-align:center;color:var(--mu);font:italic .82rem var(--f);padding:14px 16px 22px}
.toast{position:fixed;left:50%;bottom:22px;transform:translateX(-50%);z-index:20;max-width:calc(100% - 32px);background:#5a1f22;color:#ffe0dc;border:2px solid #e8484f;border-radius:4px;
  box-shadow:0 5px 0 #2e1010,0 12px 24px #0008;padding:.6em 1em;font-size:.95rem;display:none}.toast.on{display:block}
tr.via{display:none}
@media(max-width:640px){.brand{font-size:1.1rem}.brand .vi{width:30px;height:30px}.brand small{display:none}.thm span{display:none}.it{min-width:180px}}
@media(prefers-reduced-motion:reduce){.gbtn{transition:none}}
</style>`;
    // tema come nella guida: automatico → scuro → chiaro, ricordato nel browser
    const TEMA = '<script>(function(){var R=document.documentElement,b=document.getElementById("thm"),N={auto:"automatico",dark:"scuro",light:"chiaro"},m="auto";' +
      'try{m=localStorage.getItem("codice_tema")||"auto"}catch(x){}' +
      'function set(v){m=N[v]?v:"auto";if(m==="auto")R.removeAttribute("data-theme");else R.setAttribute("data-theme",m);b.innerHTML="◐ <span>Tema: "+N[m]+"</span>";b.title="Tema: "+N[m];try{localStorage.setItem("codice_tema",m)}catch(x){}}' +
      'set(m);b.addEventListener("click",function(){set(m==="auto"?"dark":m==="dark"?"light":"auto")})})()</script>';
    const pagina = (titolo, sotto, corpo, script) => '<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
      '<title>' + e(titolo) + '</title><link rel="icon" href="' + ICONE.stall + '">' + STILE + '</head><body>' +
      '<header class="top"><a class="brand" href="./">' + vi('stall') + '<span>' + e(C.nome) + '<small>' + e(sotto) + '</small></span></a><span class="sp"></span>' +
      '<button class="gbtn thm" id="thm" type="button" aria-label="Cambia tema">◐ <span>Tema: automatico</span></button></header>' +
      '<main>' + corpo + '</main><footer class="foot">' + e(C.nome) + ' ' + module.exports.version + ' · un plugin di Voxelia</footer><div class="toast" id="toast" role="alert"></div>' + TEMA + (script || '') + '</body></html>';
    const vuoto = (ico, t) => '<div class="empty">' + vi(ico) + '<span>' + t + '</span></div>';
    const stat = it => (it.s === 'w' ? 'ATT ' : 'DIF ') + it.v + (it.cr ? ' · crit +' + it.cr + '%' : '') + (it.hp ? ' · PV +' + it.hp : '');
    const oro = n => '<span class="oro">' + vi('coin') + Number(n || 0).toLocaleString('it-IT') + '</span>';
    const oggetto = it => '<div class="it">' + vi(ICO_TIPO[it.s] || 'stall') + '<span><b class="r' + it.r + '">' + e(descr(it)) + '</b><span class="tag r' + it.r + '">' + RARITA[it.r] + '</span>' +
      '<small>' + TIPO[it.s] + ' · ' + stat(it) + '</small></span></div>';
    const giorni = b => { const g = Math.max(0, Math.ceil(scade(b) / GIORNO)); return g + (g === 1 ? ' giorno' : ' giorni'); };
    const riga = b => '<tr data-s="' + b.it.s + '" data-n="' + e(K(descr(b.it) + ' ' + b.nome)) + '"><td>' + oggetto(b.it) + '</td><td class="n">' + oro(b.prezzo) + '</td><td>' + e(b.nome) + '</td><td class="n mu">' + giorni(b) + '</td>';
    const testa = extra => '<thead><tr><th>Oggetto</th><th class="n">Prezzo</th><th>Venditore</th><th class="n">Scade fra</th>' + (extra || '') + '</tr></thead>';
    const tabella = (righe, extra) => '<div class="tw"><table>' + testa(extra) + '<tbody>' + righe + '</tbody></table></div>';

    api.route('GET', '/', (req, res, x) => {
      const L = S.banchi.slice().sort((a, b) => b.t - a.t), vend = new Set(L.map(b => b.nome)).size;
      const quanti = s => L.filter(b => b.it.s === s).length;
      const chips = '<div class="chips" role="group" aria-label="Tipo"><button class="gbtn on" type="button" data-f="">Tutto <small>' + L.length + '</small></button>' +
        [['w', 'Armi'], ['h', 'Elmi'], ['c', 'Corazze'], ['s', 'Scudi']].map(([s, n]) => '<button class="gbtn" type="button" data-f="' + s + '">' + vi(ICO_TIPO[s]) + n + ' <small>' + quanti(s) + '</small></button>').join('') + '</div>';
      x.send(pagina(C.nome, 'Le bancarelle degli eroi', '<p class="kick">Aldoria · bancarelle aperte</p><h1>Al mercatino</h1>' +
        '<ul class="stats"><li>' + vi('stall') + '<b>' + L.length + '</b>' + (L.length === 1 ? 'oggetto in vendita' : 'oggetti in vendita') + '</li><li>' + vi('users') + '<b>' + vend + '</b>' + (vend === 1 ? 'venditore' : 'venditori') + '</li></ul>' +
        '<div class="callout">' + vi('coin') + '<p>Per comprare, nel gioco scrivi <kbd>/mercato</kbd>. Per cercare un oggetto: <kbd>/mercato cerca spada</kbd>.</p></div>' +
        (L.length ? '<div class="filt"><input id="q" type="search" placeholder="Cerca un oggetto o un venditore…" aria-label="Cerca">' + chips + '</div>' +
          tabella(L.map(b => riga(b) + '</tr>').join('')) + '<div class="empty" id="nessuno" hidden>' + vi('stall') + '<span>Nessun oggetto corrisponde alla ricerca.</span></div>'
          : vuoto('stall', 'Il mercatino è vuoto: nessuno ha ancora messo in vendita qualcosa.')),
      '<script>(function(){var q=document.getElementById("q");if(!q)return;var f="",B=document.querySelectorAll("[data-f]"),R=document.querySelectorAll("tbody tr"),z=document.getElementById("nessuno");' +
        'function K(s){return s.toLowerCase().normalize("NFD").replace(/[\\u0300-\\u036f]/g,"").trim()}' +
        'function go(){var t=K(q.value),n=0;R.forEach(function(r){var ok=(!f||r.dataset.s===f)&&(!t||K(r.dataset.n).indexOf(t)>=0);r.classList.toggle("via",!ok);if(ok)n++});z.hidden=n>0;' +
        'B.forEach(function(b){b.classList.toggle("on",b.dataset.f===f)});try{sessionStorage.setItem("mercato_filtro",JSON.stringify([q.value,f]))}catch(x){}}' +
        'try{var s=JSON.parse(sessionStorage.getItem("mercato_filtro")||"null");if(s){q.value=s[0]||"";f=s[1]||""}}catch(x){}' +
        'q.addEventListener("input",go);B.forEach(function(b){b.addEventListener("click",function(){f=b.dataset.f;go()})});go()})();' +
        // si aggiorna da solo ogni minuto, ma non mentre stai scrivendo nella ricerca
        'setInterval(function(){if(document.activeElement&&document.activeElement.id==="q")return;location.reload()},60000)</script>'));
    });
    api.route('GET', 'dati', (req, res, x) => x.json({ banchi: S.banchi.map(b => ({ id: b.id, oggetto: b.it, prezzo: b.prezzo, venditore: b.nome, scade: b.t + durata() })) }));

    api.route('GET', 'admin', (req, res, x) => {
      const L = S.banchi.slice().sort((a, b) => b.t - a.t), d = t => new Date(t).toLocaleString('it-IT');
      const bl = Object.entries(S.bloccati), ch = Object.keys(S.chiavi).sort();
      const btn = (az, dati, testo, cls) => '<button class="gbtn' + (cls ? ' ' + cls : '') + '" type="button" onclick="fai(this,\'' + az + '\',' + e(JSON.stringify(dati)) + ')">' + testo + '</button>';
      const sez = (ico, titolo, n, corpo) => '<section class="ch"><h2>' + vi(ico) + titolo + (n == null ? '' : ' <span class="n">(' + n + ')</span>') + '</h2>' + corpo + '</section>';
      x.send(pagina(C.nome + ' · admin', 'Pannello dell\'admin', '<p class="kick">Pannello dell\'admin</p><h1>Il mercatino</h1>' +
        '<ul class="stats"><li>' + vi('stall') + '<b>' + L.length + '</b>in vendita</li><li>' + vi('scroll') + '<b>' + S.storia.length.toLocaleString('it-IT') + '</b>' + (S.storia.length === 1 ? 'vendita registrata' : 'vendite registrate') + '</li>' +
        '<li>' + vi('coin') + '<b>' + S.tasse.toLocaleString('it-IT') + '</b>monete di tasse tolte dal gioco</li>' + (S.sospetti.length ? '<li>' + vi('warn') + '<b>' + S.sospetti.length + '</b>' + (S.sospetti.length === 1 ? 'sospetto' : 'sospetti') + '</li>' : '') + '</ul>' +
        sez('warn', 'Sospetti', S.sospetti.length, '<p class="mu">Eroi che hanno ricevuto un oggetto comprato senza che il loro oro scendesse del prezzo: di solito un trucco che salta il pagamento.</p>' +
          (S.sospetti.length ? '<div class="tw"><table><thead><tr><th>Quando</th><th>Eroe</th><th>Oggetto</th><th class="n">Oro prima → dopo</th></tr></thead><tbody>' +
            S.sospetti.slice().reverse().map(s => '<tr><td class="mu">' + d(s.t) + '</td><td><b>' + e(s.nome) + '</b><br><span class="ip">' + e(s.ip) + '</span></td><td>' + e(s.oggetto) + '<br>' + oro(s.prezzo) + '</td><td class="n">' + oro(s.prima) + ' → ' + oro(s.dopo) + '</td></tr>').join('') +
            '</tbody></table></div>' + btn('svuota', {}, 'Svuota la lista') : vuoto('warn', 'Nessuno.'))) +
        sez('lock', 'Bloccati', bl.length, bl.length ? '<div class="tw"><table><thead><tr><th>Eroe</th><th>Perché</th><th>Da quando</th><th></th></tr></thead><tbody>' +
          bl.map(([k, v]) => '<tr><td><b>' + e(k) + '</b></td><td>' + e(v.perche || '') + '</td><td class="mu">' + d(v.t) + '</td><td class="b">' + btn('sblocca', { k }, 'Sblocca') + '</td></tr>').join('') + '</tbody></table></div>' : vuoto('lock', 'Nessuno.')) +
        sez('stall', 'In vendita', L.length, L.length ? tabella(L.map(b => riga(b) + '<td class="b">' + btn('togli', { id: b.id }, 'Togli', 'no') + '</td></tr>').join(''), '<th></th>') +
          '<p class="mu">«Togli» rimanda l\'oggetto al venditore, che lo ritira dal pannello.</p>' : vuoto('stall', 'Niente.')) +
        sez('scroll', 'Ultime vendite', null, S.storia.length ? '<div class="tw"><table><thead><tr><th>Quando</th><th>Oggetto</th><th>Da → a</th><th class="n">Prezzo</th><th class="n">Tassa</th></tr></thead><tbody>' +
          S.storia.slice(-100).reverse().map(v => '<tr><td class="mu">' + d(v.t) + '</td><td>' + e(v.n) + '</td><td>' + e(v.da) + ' → ' + e(v.a) + '</td><td class="n">' + oro(v.prezzo) + '</td><td class="n mu">' + Number(v.tassa || 0).toLocaleString('it-IT') + '</td></tr>').join('') +
          '</tbody></table></div>' : vuoto('scroll', 'Nessuna.')) +
        sez('key', 'Chiavi dei banchi', ch.length, '<p class="mu">Se un eroe ha perso il browser con cui vendeva, togli la sua chiave: il primo browser con cui rivende diventa il suo.</p>' +
          (ch.length ? '<ul class="keys">' + ch.map(k => '<li>' + vi('key') + '<b>' + e(k) + '</b>' + btn('chiave', { k }, 'Togli chiave', 'no') + '</li>').join('') + '</ul>' : vuoto('key', 'Nessuna.'))),
      '<script>function fai(el,a,b){el.disabled=true;fetch("admin/"+a,{method:"POST",headers:{"x-voxelia":"1","Content-Type":"application/json"},body:JSON.stringify(b)})' +
        '.then(function(r){return r.json()}).then(function(j){if(j.ok)location.reload();else no(j.err||"Errore")}).catch(function(){no("Il server non risponde")});' +
        'function no(t){el.disabled=false;var m=document.getElementById("toast");m.textContent=t;m.classList.add("on");clearTimeout(no.t);no.t=setTimeout(function(){m.classList.remove("on")},4000)}}</script>'));
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

  stop(api) { delete globalThis.VoxeliaMercato; for (const p of api.players()) p.send('spegni', {}); }
};
