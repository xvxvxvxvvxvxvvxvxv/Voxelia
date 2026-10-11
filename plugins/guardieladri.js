// Guardie e ladri: nascondino a squadre in un quartiere (di base Aldoria con i suoi edifici), una partita per stanza.
// Si apre con /guardie apri (o dalla pagina admin /plugins/guardieladri/admin) e chi vuole giocare scrive /guardie entra.
// Alla chiusura delle iscrizioni il plugin divide i giocatori in guardie e ladri: i ladri hanno un minuto per nascondersi
// mentre le guardie hanno lo schermo oscurato, poi le guardie li cercano. Il server cattura un ladro quando una guardia
// è nella sua stessa zona a "raggio" caselle. Durante la partita la chat dice solo quanti ladri restano, mai chi o dove.
// Chi esce dal quartiere è squalificato. Vincono i ladri ancora liberi allo scadere del tempo, o le guardie se li prendono tutti.
// Nel gioco delle guardie i ladri si vedono (anche sulla minimappa) solo entro "vista" caselle, e la lista dei giocatori,
// la chat e il profilo non dicono in che zona sono.
// Contro i trucchi: la posizione arriva dal gioco del giocatore, quindi il server controlla che ogni cambio di zona passi
// da una porta vera (mappa dei portali del gioco 7.3.2 qui sotto) e che nessuno vada più veloce di "velocitaMax".
// Dopo un movimento impossibile una guardia non può catturare per "pausaSec" secondi; alla "sospettiMax"-esima volta
// guardie e ladri sono squalificati. Durante la partita /tpa, /borgo, /visita, /discoteca e /hub sono bloccati per chi gioca.
// Limite: un gioco modificato riceve comunque dal server la posizione di tutti quelli della stanza, quindi una guardia
// che bara può vedere i ladri; e chi cammina attraverso i muri a velocità normale non si distingue da chi gira l'angolo.

// portali del gioco 7.3.2 (zona=misura=destinazione:x:y,…), letti dal gioco caricato in Chromium. Restano fuori le zone
// chiuse (stanze del motel, passaggio segreto del castello). Chi entra in una zona compare entro 3 caselle dalla porta.
const GRAFO = 'town=72=in_castle:9:13,in_library:24:10,arena:47:13,in_tavern:7:27,in_house1:21:24,in_alch:27:24,in_smith:42:25,in_temple:51:27,in_house2:21:44,in_casino:24:51,in_house3:27:31,in_panetteria:22:31,in_sartoria:28:44,in_caserma:9:34,in_scuderia:63:46,in_osservatorio:64:10,in_municipio:62:27,in_motel:31:62,nord:17:2,campi:71:17,porto:55:71|' +
  'nord=56=in_palazzo:28:13,in_banca:10:25,in_teatro:46:27,in_villa1:9:11,in_villa2:47:11,in_villa3:9:41,in_villa4:48:41,in_villa5:10:53,in_villa6:47:53,town:28:55|' +
  'campi=56=in_mulino:18:11,in_segheria:39:22,in_fattoria:9:38,in_fienile:19:38,town:2:27|' +
  'porto=56=in_faro:49:44,in_locanda:10:24,in_capitaneria:45:23,in_magazzino1:21:24,in_magazzino2:35:24,in_pescheria:22:12,in_cantiere:51:12,in_casa_p1:7:10,in_casa_p2:14:10,in_casa_p3:34:10,in_casa_p4:42:10,in_galeone:27:39,town:28:2|' +
  'in_castle=16=town:8:16,cas_galleria:2:9,cas_consiglio:15:9,cas_cucine:2:14,cas_appartamenti:15:14|in_library=12=town:6:12,lib_archivio:11:10|arena=30=town:16:2|' +
  'in_tavern=14=town:7:14,tav_camere:13:12,tav_cantina:2:12|in_house1=8=town:4:8|in_alch=10=town:5:10|in_smith=11=town:5:11|in_temple=13=town:7:13,tem_cripta:12:12|' +
  'in_house2=8=town:5:8|in_casino=16=town:8:16,casino_vip:15:3|in_house3=8=town:4:8|in_panetteria=12=town:6:12|in_sartoria=12=town:6:12|in_caserma=16=town:8:16,bar_dorm:2:14|' +
  'in_scuderia=14=town:7:14|in_osservatorio=12=town:6:12,oss_cupola:11:9|in_municipio=16=town:8:16,mun_piano:15:14|in_motel=16=town:8:16,in_motel2:2:8,in_motel2:15:8|' +
  'in_palazzo=16=nord:8:16|in_banca=14=nord:7:14|in_teatro=16=nord:8:16|in_villa1=16=nord:8:16|in_villa2=16=nord:8:16|in_villa3=16=nord:8:16|in_villa4=16=nord:8:16|' +
  'in_villa5=16=nord:8:16|in_villa6=16=nord:8:16|in_mulino=14=campi:7:14|in_segheria=14=campi:7:14|in_fattoria=14=campi:7:14|in_fienile=14=campi:7:14|' +
  'in_faro=10=porto:5:10|in_locanda=16=porto:8:16|in_capitaneria=14=porto:7:14|in_magazzino1=14=porto:7:14|in_magazzino2=14=porto:7:14|in_pescheria=14=porto:7:14|' +
  'in_cantiere=14=porto:7:14|in_casa_p1=12=porto:6:12|in_casa_p2=12=porto:6:12|in_casa_p3=12=porto:6:12|in_casa_p4=12=porto:6:12|in_galeone=16=porto:8:16|' +
  'cas_galleria=14=in_castle:13:8,cas_armeria:2:7|cas_consiglio=14=in_castle:2:8,cas_archivio:13:3|cas_cucine=12=in_castle:11:6|cas_appartamenti=14=in_castle:13:3|' +
  'lib_archivio=12=in_library:11:11|tav_camere=12=in_tavern:11:6|tav_cantina=12=in_tavern:2:11|tem_cripta=12=in_temple:11:10|casino_vip=12=in_casino:11:3|' +
  'bar_dorm=12=in_caserma:11:5|oss_cupola=12=in_osservatorio:11:11|mun_piano=12=in_municipio:11:11|in_motel2=18=in_motel:2:16,in_motel:17:16|' +
  'cas_armeria=12=cas_galleria:11:5,cas_prigioni:2:10|cas_archivio=12=cas_consiglio:11:3|cas_prigioni=13=cas_armeria:2:7';
const MAPPA = {};
for (const r of GRAFO.split('|')) {
  const [k, n, po] = r.split('=');
  MAPPA[k] = { N: +n, po: po ? po.split(',').map(s => { const [t, x, y] = s.split(':'); return [t, +x, +y]; }) : [] };
}
const PORTA = 4;   // caselle di tolleranza tra la porta e il punto in cui si compare entrando
const SEC = 1000, MIN = 60000;

// codice nel gioco: riquadro con ruolo e tempo, schermo oscurato per le guardie mentre i ladri si nascondono,
// e per le guardie niente ladri lontani (mondo, minimappa, lista dei giocatori, zona nella chat)
function nelGioco(ID) {
  const opz = f => { try { return f(); } catch (e) { return undefined; } };
  let S = null, fineT = 0, box = null, benda = null;
  const attiva = () => S && (S.fase === 'nascondi' || S.fase === 'caccia');
  const guardia = () => attiva() && S.ruolo === 'guardia' ? S : null;
  if (typeof netMsg === 'function') {
    const vecchio = netMsg;
    netMsg = function (m) {
      const G = guardia();
      if (G && m && typeof m === 'object') {
        if (m.t === 's' && m.p && typeof m.p === 'object') {
          const q = Object.assign({}, m.p), rk = opz(rmKey);
          for (const id of G.ids || []) {
            const o = q[id]; if (!o) continue;
            if (G.fase === 'nascondi' || o.rm !== rk || !(Math.hypot(o.x - P.px, o.y - P.py) <= G.vista)) delete q[id];
          }
          m = Object.assign({}, m, { p: q });
        } else if (m.t === 'who' && Array.isArray(m.list)) {
          m = Object.assign({}, m, { list: m.list.map(o => o && (G.ids || []).includes(o.id) ? Object.assign({}, o, { z: '', x: 0, y: 0 }) : o) });
        } else if (m.t === 'chat' && (G.nomi || []).includes(m.n)) m = Object.assign({}, m, { z: '' });
      }
      return vecchio.call(this, m);
    };
  } else console.warn('[guardie e ladri] questa versione del gioco non ha netMsg: le guardie vedranno i ladri anche lontano');
  // il profilo di un ladro non dice dove si trova
  if (typeof myProf === 'function') {
    const vp = myProf;
    myProf = function () { const r = vp.apply(this, arguments); if (attiva() && S.ruolo === 'ladro' && r && typeof r === 'object') r.z = ''; return r; };
  }
  const css = (el, s) => { el.style.cssText = s; return el; };
  function disegna() {
    if (!S) { if (box) box.remove(); if (benda) benda.remove(); box = benda = null; return; }
    if (!box) { box = css(document.createElement('div'), 'position:fixed;top:8px;left:50%;transform:translateX(-50%);z-index:60;pointer-events:none;background:rgba(10,14,24,.82);color:#fff;font:600 13px system-ui,sans-serif;padding:6px 12px;border-radius:8px;border:1px solid rgba(255,255,255,.18);text-align:center;max-width:calc(100vw - 24px);box-sizing:border-box'); document.body.appendChild(box); }
    const s = Math.max(0, Math.ceil((fineT - Date.now()) / 1000)), mm = Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
    const ruolo = S.ruolo === 'guardia' ? '👮 Guardia' : S.ruolo === 'ladro' ? '🦹 Ladro' : '👀 Fuori dal gioco';
    const fase = S.fase === 'nascondi' ? (S.ruolo === 'guardia' ? 'Conta: ' : 'Nasconditi: ') + mm : S.fase === 'caccia' ? 'Caccia: ' + mm : '';
    box.textContent = ruolo + ' · ' + fase + ' · ladri liberi ' + S.liberi + '/' + S.totale + (S.quartiere ? ' · ' + S.quartiere : '');
    // in alto al centro; se tocca l'HUD in alto a sinistra (telefono) va sotto di lui
    const h = document.getElementById('hud'), r = h && h.getBoundingClientRect(), w = box.offsetWidth;
    const top = r && r.height && (innerWidth - w) / 2 < r.right + 8 ? Math.round(r.bottom + 8) : 8;
    if (box.style.top !== top + 'px') box.style.top = top + 'px';
    const buio = S.fase === 'nascondi' && S.ruolo === 'guardia';
    if (buio && !benda) {
      benda = css(document.createElement('div'), 'position:fixed;inset:0;z-index:59;pointer-events:none;background:rgba(4,6,12,.95);color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;font:600 20px system-ui,sans-serif;text-align:center;padding:16px');
      document.body.appendChild(benda);
    }
    if (benda && !buio) { benda.remove(); benda = null; }
    if (benda) benda.innerHTML = '<div style="font-size:42px">🙈</div><div>Sei una guardia: conta mentre i ladri si nascondono!</div><div style="font-size:48px;margin-top:8px">' + s + '</div>';
  }
  VXP.on(ID, 'stato', d => { if (!d || typeof d !== 'object') return; S = d; fineT = Date.now() + (+d.resta || 0); disegna(); });
  VXP.on(ID, 'evento', d => {
    if (!d) return;
    if (d.banner) opz(() => banner(d.banner, d.testo || '', d.icona || 'stella')); else if (d.testo) opz(() => msg(d.testo));
    if (d.suono) opz(() => jingle(d.suono, .12, 'triangle'));
  });
  VXP.on(ID, 'fine', d => { S = null; disegna(); if (d && d.banner) opz(() => banner(d.banner, d.testo || '', 'trofeo')); });
  setInterval(() => { if (S) disegna(); }, 250);
}

module.exports = {
  name: 'Guardie e ladri',
  version: '1.1',
  author: 'Voxelia',
  description: 'Nascondino a squadre in un quartiere: i ladri si nascondono, le guardie li cercano (/guardie)',
  defaults: {
    iscrizioniSec: 90,          // durata delle iscrizioni
    nascondiSec: 60,            // tempo dei ladri per nascondersi (le guardie hanno lo schermo oscurato)
    cacciaMin: 5,               // durata della caccia
    minGiocatori: 3,            // sotto questo numero la partita non parte
    maxGiocatori: 30,
    ladriPerGuardia: 2,         // es. 2: con 9 giocatori 3 guardie e 6 ladri (almeno una guardia)
    raggio: 2,                  // caselle tra guardia e ladro, nella stessa zona, per la cattura
    vista: 6,                   // le guardie vedono i ladri solo entro queste caselle (anche sulla minimappa)
    aperturaDaiGiocatori: true, // se false le partite si aprono solo dalla pagina admin
    quartiereBase: 'aldoria',   // quello usato da /guardie apri senza altro
    velocitaMax: 9,             // caselle al secondo oltre le quali un movimento è impossibile (l'eroe ne fa 3,9)
    pausaSec: 5,                // dopo un movimento impossibile la guardia non cattura per questi secondi
    sospettiMax: 3,             // al terzo movimento impossibile si è squalificati (guardie e ladri)
    comandiBloccati: ['tpa', 'borgo', 'visita', 'discoteca', 'hub'],   // comandi vietati a chi gioca, durante la partita
    premi: {
      ladro: { oro: 150, xp: 100 },     // a ogni ladro ancora libero alla fine
      guardie: { oro: 100, xp: 80 },    // a ogni guardia, se prendono tutti i ladri
      cattura: { oro: 25, xp: 0 }       // alla guardia, per ogni ladro preso
    },
    premiMinGiocatori: 3,       // sotto questo numero di giocatori si gioca senza premi
    // zone di ogni quartiere: uscire da queste squalifica. Le zone devono essere collegate da porte (vedi GRAFO).
    quartieri: {
      aldoria: { nome: 'Aldoria e i suoi edifici', zone: ['town', 'arena', 'in_castle', 'in_library', 'in_tavern', 'in_house1', 'in_alch', 'in_smith', 'in_temple', 'in_house2', 'in_casino', 'in_house3', 'in_panetteria', 'in_sartoria', 'in_caserma', 'in_scuderia', 'in_osservatorio', 'in_municipio', 'in_motel', 'in_motel2', 'cas_galleria', 'cas_consiglio', 'cas_cucine', 'cas_appartamenti', 'cas_armeria', 'cas_archivio', 'cas_prigioni', 'lib_archivio', 'tav_camere', 'tav_cantina', 'tem_cripta', 'casino_vip', 'bar_dorm', 'oss_cupola', 'mun_piano'] },
      nobile: { nome: 'Quartiere Nobile', zone: ['nord', 'in_palazzo', 'in_banca', 'in_teatro', 'in_villa1', 'in_villa2', 'in_villa3', 'in_villa4', 'in_villa5', 'in_villa6'] },
      campi: { nome: 'Campi e Mestieri', zone: ['campi', 'in_mulino', 'in_segheria', 'in_fattoria', 'in_fienile'] },
      porto: { nome: 'Porto di Aldoria', zone: ['porto', 'in_faro', 'in_locanda', 'in_capitaneria', 'in_magazzino1', 'in_magazzino2', 'in_pescheria', 'in_cantiere', 'in_casa_p1', 'in_casa_p2', 'in_casa_p3', 'in_casa_p4', 'in_galeone'] }
    }
  },

  setup(api) {
    const C = api.config, ID = api.id, K = s => String(s || '').toLowerCase();
    const S = api.store;
    if (!S.g || typeof S.g !== 'object') S.g = {};                // nome in minuscolo → statistiche
    if (!Array.isArray(S.storico)) S.storico = [];                // ultime partite
    const salva = () => api.save();
    const num = (v, d, a, b) => { const n = +v; return isFinite(n) ? Math.max(a, Math.min(b, n)) : d; };
    const bot = p => !!(globalThis.VoxeliaStress && globalThis.VoxeliaStress.bot(p));
    const partite = {};                                           // stanza → partita (solo in memoria)
    // per gli altri plugin (es. /hub): true se l'eroe sta giocando una partita in corso nella sua stanza
    globalThis.VoxeliaGuardieLadri = {
      gioca: p => { const G = p && partite[p.room]; if (!G || G.fase === 'iscrizioni') return false; const g = G.gioc.get(p.id); return !!g && (g.stato === 'libero' || g.stato === 'in gioco'); }
    };

    // ---------- quartieri ----------
    function quartieri() {
      const Q = {}, src = C.quartieri && typeof C.quartieri === 'object' ? C.quartieri : module.exports.defaults.quartieri;
      for (const [k, q] of Object.entries(src)) {
        if (!q || !Array.isArray(q.zone) || !q.zone.length) { api.log('quartiere "' + k + '" ignorato: manca l\'elenco delle zone'); continue; }
        const ignote = q.zone.filter(z => !MAPPA[z]);
        if (ignote.length) api.log('quartiere "' + k + '": zone senza mappa dei portali (' + ignote.join(', ') + '), lì non si controllano le porte');
        Q[K(k)] = { k: K(k), nome: String(q.nome || k).slice(0, 40), zone: new Set(q.zone.map(String)) };
      }
      return Q;
    }
    let Q = quartieri();
    const quartiere = k => Q[K(k)] || null;

    // ---------- utilità ----------
    const online = id => { const p = api.player(id); return p && p.online ? p : null; };
    const premio = pr => { pr = pr && typeof pr === 'object' ? pr : {}; return { oro: num(pr.oro, 0, 0, 1e6) | 0, xp: num(pr.xp, 0, 0, 1e6) | 0 }; };
    const testoPremio = pr => [pr.oro > 0 && pr.oro + ' oro', pr.xp > 0 && pr.xp + ' XP'].filter(Boolean).join(' e ');
    function dai(p, pr, perche) {
      if (!p || !(pr.oro > 0 || pr.xp > 0)) return '';
      try { if (pr.oro > 0) p.give('gold', pr.oro); if (pr.xp > 0) p.give('xp', pr.xp); }
      catch (e) { api.log('premio non consegnato a ' + p.name + ': ' + (e && e.message || e)); return ''; }
      p.tell('Guardie e ladri: ' + perche + ', ricevi ' + testoPremio(pr) + '.');
      return testoPremio(pr);
    }
    const stat = n => { const k = K(n); return S.g[k] || (S.g[k] = { nome: n, partite: 0, fughe: 0, catture: 0, vinteGuardia: 0, preso: 0 }); };
    const conPremi = G => G.gioc.size >= num(C.premiMinGiocatori, 3, 0, 100);
    const mm = ms => { const s = Math.max(0, Math.ceil(ms / SEC)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };

    // ---------- stato mandato ai giocatori ----------
    const lista = G => [...G.gioc.values()];
    const ladri = G => lista(G).filter(g => g.ruolo === 'ladro');
    const liberi = G => ladri(G).filter(g => g.stato === 'libero');
    const guardieAttive = G => lista(G).filter(g => g.ruolo === 'guardia' && g.stato === 'in gioco');
    function statoPer(G, g, now) {
      const d = { fase: G.fase, resta: Math.max(0, G.fine - now), liberi: liberi(G).length, totale: ladri(G).length, quartiere: G.q.nome };
      if (g.ruolo === 'guardia' && g.stato === 'in gioco') {
        const L = liberi(G);
        return Object.assign(d, { ruolo: 'guardia', ids: L.map(x => x.id), nomi: L.map(x => x.nome), vista: num(C.vista, 6, 1, 80) });
      }
      return Object.assign(d, { ruolo: g.ruolo === 'ladro' && g.stato === 'libero' ? 'ladro' : 'fuori' });
    }
    function aggiorna(G) {
      const now = Date.now();
      for (const g of G.gioc.values()) { if (g.via) continue; const p = online(g.id); if (p) p.send('stato', statoPer(G, g, now)); }
    }
    const evento = (g, d) => { const p = online(g.id); if (p) p.send('evento', d); };

    // ---------- apertura e iscrizioni ----------
    function apri(room, qk, chi) {
      if (!room) return 'Guardie e ladri si gioca solo in una stanza del server.';
      if (partite[room]) return 'C\'è già una partita di Guardie e ladri in questa stanza. Scrivi /guardie per vederla.';
      const q = quartiere(qk || C.quartiereBase) || Object.values(Q)[0];
      if (!q) return 'Nessun quartiere valido in guardieladri.config.json.';
      if (qk && !quartiere(qk)) return 'Quartiere sconosciuto: ' + qk + '. Quartieri: ' + Object.keys(Q).join(', ') + '.';
      const sec = num(C.iscrizioniSec, 90, 10, 1800);
      partite[room] = { room, q, fase: 'iscrizioni', fine: Date.now() + sec * SEC, iscritti: [], gioc: new Map(), avviso: 0, aperta: chi || '' };
      api.announce('🚨 Guardie e ladri nel quartiere «' + q.nome + '»: iscrizioni aperte per ' + mm(sec * SEC) + '! Scrivi /guardie entra (oppure /guardie entra ladro o guardia).', room);
      api.log('iscrizioni aperte nella stanza ' + room + ' (' + q.k + ')' + (chi ? ' da ' + chi : ''));
      return '';
    }
    function entra(p, pref) {
      const G = partite[p.room];
      if (!G) return 'Non c\'è una partita aperta. ' + (C.aperturaDaiGiocatori !== false ? 'Aprila tu con /guardie apri.' : 'Le apre l\'admin.');
      if (G.fase !== 'iscrizioni') return 'La partita è già cominciata: aspetta la prossima.';
      const io = G.iscritti.find(x => x.id === p.id || K(x.nome) === K(p.name));
      const pf = /^(ladr|l$)/i.test(pref || '') ? 'ladro' : /^(guard|g$)/i.test(pref || '') ? 'guardia' : '';
      if (io) { io.id = p.id; io.pref = pf || io.pref; return 'Sei già iscritto' + (io.pref ? ' (preferisci fare ' + (io.pref === 'ladro' ? 'il ladro' : 'la guardia') + ')' : '') + '. Iscritti: ' + G.iscritti.length + '.'; }
      if (G.iscritti.length >= num(C.maxGiocatori, 30, 2, 200)) return 'La partita è piena.';
      G.iscritti.push({ id: p.id, nome: p.name, pref: pf });
      api.say(p.room, p.name + ' gioca a Guardie e ladri (' + G.iscritti.length + ' iscritti).');
      return 'Iscritto! Quando la partita parte devi essere nel quartiere «' + G.q.nome + '»: chi ne esce durante la partita è squalificato.';
    }

    // ---------- inizio ----------
    function avvia(G) {
      const now = Date.now(), fuori = [];
      const pronti = G.iscritti.map(x => ({ x, p: online(x.id) })).filter(o => o.p && o.p.room === G.room);
      const qui = pronti.filter(o => G.q.zone.has(o.p.zone));
      for (const o of pronti) if (!G.q.zone.has(o.p.zone)) { fuori.push(o.x.nome); o.p.tell('Guardie e ladri è cominciata, ma non eri nel quartiere «' + G.q.nome + '»: sei rimasto fuori.'); }
      const min = num(C.minGiocatori, 3, 2, 100);
      if (qui.length < min) {
        api.announce('Guardie e ladri annullata: servivano almeno ' + min + ' giocatori nel quartiere, ce ne sono ' + qui.length + '.', G.room);
        api.log('partita annullata nella stanza ' + G.room + ': ' + qui.length + ' giocatori pronti');
        delete partite[G.room]; return;
      }
      // squadre: prima chi preferisce un ruolo, poi a caso
      const mischia = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
      const nG = Math.max(1, Math.min(qui.length - 1, Math.round(qui.length / (1 + num(C.ladriPerGuardia, 2, .2, 20)))));
      const ordine = mischia(qui.slice()).sort((a, b) => (a.x.pref === 'guardia' ? 0 : a.x.pref === 'ladro' ? 2 : 1) - (b.x.pref === 'guardia' ? 0 : b.x.pref === 'ladro' ? 2 : 1));
      ordine.forEach((o, i) => G.gioc.set(o.p.id, {
        id: o.p.id, nome: o.p.name, ruolo: i < nG ? 'guardia' : 'ladro', stato: i < nG ? 'in gioco' : 'libero', catture: 0, sospetti: 0, pausa: 0,
        tr: { zona: o.p.zone, x: o.p.x, y: o.p.y, t: now }
      }));
      G.fase = 'nascondi'; G.fine = now + num(C.nascondiSec, 60, 5, 600) * SEC; G.inizio = now;
      const gu = lista(G).filter(g => g.ruolo === 'guardia').map(g => g.nome);
      api.announce('🚨 Guardie e ladri comincia! Guardie: ' + gu.join(', ') + '. ' + ladri(G).length + ' ladri hanno ' + mm(G.fine - now) + ' per nascondersi nel quartiere «' + G.q.nome + '».', G.room);
      for (const g of G.gioc.values()) evento(g, g.ruolo === 'guardia'
        ? { banner: 'Sei una guardia', testo: 'Conta mentre i ladri si nascondono, poi trovali!', icona: 'spade' }
        : { banner: 'Sei un ladro', testo: 'Nasconditi nel quartiere: hai ' + mm(G.fine - now) + '!', icona: 'stella' });
      if (!conPremi(G)) api.say(G.room, 'Partita senza premi: servono almeno ' + num(C.premiMinGiocatori, 3, 0, 100) + ' giocatori.');
      api.log('partita iniziata nella stanza ' + G.room + ' (' + G.q.k + '): ' + gu.length + ' guardie, ' + ladri(G).length + ' ladri' + (fuori.length ? ', fuori dal quartiere: ' + fuori.join(', ') : ''));
      aggiorna(G);
    }
    function caccia(G) {
      const now = Date.now();
      G.fase = 'caccia'; G.fine = now + num(C.cacciaMin, 5, .2, 120) * MIN;
      const n = liberi(G).length;
      api.announce('🔦 Pronti o no, le guardie arrivano! ' + (n === 1 ? 'Un ladro' : n + ' ladri') + ' da trovare in ' + mm(G.fine - now) + '.', G.room);
      for (const g of G.gioc.values()) evento(g, { testo: g.ruolo === 'guardia' ? 'Via! Trova i ladri.' : 'Le guardie ti cercano!', suono: [64, 67, 72] });
      aggiorna(G);
    }

    // ---------- uscite, catture e fine ----------
    function togli(G, g, stato, motivo, pubblico) {
      if (g.stato !== 'libero' && g.stato !== 'in gioco') return;
      g.stato = stato; g.motivo = motivo;
      const p = online(g.id);
      if (p) p.tell('Guardie e ladri: ' + motivo + '.');
      if (pubblico) api.say(G.room, pubblico + (g.ruolo === 'ladro' ? resto(G) : ''));
      api.log(g.nome + ' (' + g.ruolo + ', stanza ' + G.room + '): ' + motivo);
      controlla(G);
      if (partite[G.room] === G) aggiorna(G);
      if (p && partite[G.room] === G) p.send('evento', { banner: stato === 'preso' ? 'Preso!' : 'Fuori dal gioco', testo: motivo, icona: 'spade' });
    }
    const resto = G => { const n = liberi(G).length; return n === 1 ? 'Resta 1 ladro.' : n ? 'Restano ' + n + ' ladri.' : 'Non resta nessun ladro.'; };
    function squalifica(G, g, motivo) {
      togli(G, g, 'squalificato', 'squalificato: ' + motivo, g.ruolo === 'ladro' ? 'Un ladro è stato squalificato. ' : 'Una guardia è stata squalificata.');
    }
    function cattura(G, gd, l) {
      if (l.stato !== 'libero') return;
      gd.catture++; l.stato = 'preso'; l.motivo = 'preso da ' + gd.nome;
      api.log(gd.nome + ' ha preso ' + l.nome + ' (stanza ' + G.room + ')');
      api.say(G.room, '🚨 Una guardia ha preso un ladro! ' + resto(G));
      const pg = online(gd.id), pl = online(l.id);
      if (pl) { pl.tell('Guardie e ladri: ' + gd.nome + ' ti ha preso!'); pl.send('evento', { banner: 'Preso!', testo: gd.nome + ' ti ha trovato', icona: 'spade' }); }
      if (pg) {
        pg.send('evento', { banner: 'Ladro preso!', testo: 'Hai preso ' + l.nome, icona: 'trofeo', suono: [72, 76, 79] });
        if (conPremi(G)) dai(pg, premio(C.premi && C.premi.cattura), 'per aver preso ' + l.nome);
      }
      controlla(G);
      if (partite[G.room] === G) aggiorna(G);
    }
    // la partita finisce quando non restano ladri liberi o guardie
    function controlla(G) {
      if (G.fase !== 'nascondi' && G.fase !== 'caccia') return;
      if (!liberi(G).length) fine(G, 'guardie');
      else if (!guardieAttive(G).length) fine(G, 'ladri', 'non ci sono più guardie');
    }
    function fine(G, vince, perche) {
      if (partite[G.room] !== G) return;
      delete partite[G.room];
      const premi = conPremi(G), L = ladri(G), liberiFine = liberi(G), gu = lista(G).filter(g => g.ruolo === 'guardia');
      let titolo, testo;
      if (vince === 'guardie') { titolo = 'Vincono le guardie!'; testo = L.length === 1 ? 'Il ladro è stato preso.' : 'Nessuno dei ' + L.length + ' ladri è rimasto libero.'; }
      else if (vince === 'ladri') { titolo = 'Vincono i ladri!'; testo = liberiFine.length + ' ' + (liberiFine.length === 1 ? 'ladro è rimasto libero' : 'ladri sono rimasti liberi') + (perche ? ' (' + perche + ')' : '') + ': ' + liberiFine.map(g => g.nome).join(', ') + '.'; }
      else { titolo = 'Partita annullata'; testo = perche || ''; }
      const prese = gu.filter(g => g.catture).map(g => g.nome + ' (' + g.catture + ')');
      api.announce('🏁 Guardie e ladri: ' + titolo + ' ' + testo + (prese.length ? ' Catture: ' + prese.join(', ') + '.' : ''), G.room);
      if (vince) {
        for (const g of G.gioc.values()) {
          const p = online(g.id);
          if (!bot(p || g.nome)) {
            const s = stat(g.nome); s.nome = g.nome; s.partite++; s.catture += g.catture;
            if (g.ruolo === 'ladro' && g.stato === 'libero') s.fughe++;
            if (g.ruolo === 'ladro' && g.stato === 'preso') s.preso++;
            if (g.ruolo === 'guardia' && vince === 'guardie' && g.stato === 'in gioco') s.vinteGuardia++;
          }
          if (!premi || !p) continue;
          if (g.ruolo === 'ladro' && g.stato === 'libero') dai(p, premio(C.premi && C.premi.ladro), 'sei rimasto libero');
          if (g.ruolo === 'guardia' && vince === 'guardie' && g.stato === 'in gioco') dai(p, premio(C.premi && C.premi.guardie), 'le guardie hanno vinto');
        }
        S.storico.unshift({ quando: Date.now(), quartiere: G.q.nome, vince, guardie: gu.map(g => g.nome), ladri: L.map(g => ({ nome: g.nome, stato: g.stato })), durata: Date.now() - G.inizio });
        S.storico = S.storico.slice(0, 30); salva();
      }
      for (const g of G.gioc.values()) { const p = online(g.id); if (p) p.send('fine', { banner: titolo, testo }); }
      api.log('partita finita nella stanza ' + G.room + ': ' + titolo + ' ' + testo);
    }
    function annulla(G, perche) {
      if (G.fase === 'iscrizioni') { delete partite[G.room]; api.announce('Guardie e ladri annullata' + (perche ? ': ' + perche : '') + '.', G.room); return; }
      fine(G, null, perche);
    }

    // ---------- movimenti: porte vere e velocità possibile ----------
    function sospetto(G, g, cosa) {
      api.log('movimento impossibile di ' + g.nome + ' (' + g.ruolo + ', stanza ' + G.room + '): ' + cosa);
      if (++g.sospetti >= num(C.sospettiMax, 3, 1, 50)) return squalifica(G, g, 'movimenti impossibili (' + cosa + ')');
      if (g.ruolo === 'guardia') {
        g.pausa = Date.now() + num(C.pausaSec, 5, 0, 120) * SEC;
        const p = online(g.id); if (p) p.tell('Guardie e ladri: movimento impossibile, per qualche secondo non puoi catturare.');
      }
    }
    function cambioZona(G, g, p, nuova, vecchia) {
      if (!G.q.zone.has(nuova)) return squalifica(G, g, 'sei uscito dal quartiere «' + G.q.nome + '»');
      const now = Date.now(), M = MAPPA[nuova];
      if (M && MAPPA[vecchia]) {
        const porte = M.po.filter(d => d[0] === vecchia);
        if (!porte.length) {
          // in città si torna anche senza porta: sconfitta o teletrasporto dell'admin o di un plugin
          if (nuova !== 'town') sospetto(G, g, 'da ' + vecchia + ' a ' + nuova + ' senza una porta');
          else if (g.ruolo === 'guardia') g.pausa = now + num(C.pausaSec, 5, 0, 120) * SEC;
        } else {
          const d = Math.min(...porte.map(q => Math.hypot(p.x - (q[1] + .5), p.y - (q[2] + .5))));
          if (d > PORTA) sospetto(G, g, 'entrato in ' + nuova + ' a ' + d.toFixed(1) + ' caselle dalla porta');
        }
      }
      g.tr = { zona: nuova, x: p.x, y: p.y, t: now };
    }
    function traccia(G, g, p, now) {
      const tr = g.tr;
      if (!tr || tr.zona !== p.zone) { g.tr = { zona: p.zone, x: p.x, y: p.y, t: now }; return; }
      const dt = (now - tr.t) / SEC;
      if (dt < .3) return;
      const v = Math.hypot(p.x - tr.x, p.y - tr.y) / dt;
      g.tr = { zona: p.zone, x: p.x, y: p.y, t: now };
      if (p.zone !== 'arena' && v > num(C.velocitaMax, 9, 4, 100)) sospetto(G, g, v.toFixed(1) + ' caselle al secondo in ' + p.zone);
    }

    // ---------- ogni mezzo secondo ----------
    api.every(500, () => {
      const now = Date.now();
      for (const G of Object.values(partite)) {
        if (G.fase === 'iscrizioni') {
          if (now >= G.fine) { avvia(G); continue; }
          if (G.fine - now <= 15 * SEC && !G.avviso) { G.avviso = 1; api.say(G.room, 'Guardie e ladri: ultimi 15 secondi per iscriversi con /guardie entra (' + G.iscritti.length + ' iscritti). Andate nel quartiere «' + G.q.nome + '»!'); }
          continue;
        }
        for (const g of G.gioc.values()) {
          if (g.stato !== 'libero' && g.stato !== 'in gioco') continue;
          const p = online(g.id);
          if (!p) { togli(G, g, 'uscito', 'sei uscito dal gioco', g.ruolo === 'ladro' ? 'Un ladro ha lasciato il gioco. ' : 'Una guardia ha lasciato il gioco.'); if (partite[G.room] !== G) break; continue; }
          traccia(G, g, p, now);
          if (partite[G.room] !== G) break;
        }
        if (partite[G.room] !== G) continue;
        if (G.fase === 'nascondi') { if (now >= G.fine) caccia(G); continue; }
        // catture: guardia e ladro nella stessa zona, entro il raggio
        const R = num(C.raggio, 2, .5, 10);
        for (const gd of guardieAttive(G)) {
          if (gd.pausa > now) continue;
          const pg = online(gd.id); if (!pg) continue;
          for (const l of liberi(G)) {
            const pl = online(l.id);
            if (pl && pl.zone === pg.zone && Math.hypot(pl.x - pg.x, pl.y - pg.y) <= R) cattura(G, gd, l);
            if (partite[G.room] !== G) break;
          }
          if (partite[G.room] !== G) break;
        }
        if (partite[G.room] === G && now >= G.fine) fine(G, 'ladri');
      }
    });

    api.on('zone', (p, nuova, vecchia) => {
      const G = partite[p.room]; if (!G || G.fase === 'iscrizioni') return;
      const g = G.gioc.get(p.id); if (!g || (g.stato !== 'libero' && g.stato !== 'in gioco')) return;
      cambioZona(G, g, p, nuova, vecchia);
    });
    api.on('leave', p => {
      const G = partite[p.room]; if (!G) return;
      if (G.fase === 'iscrizioni') { G.iscritti = G.iscritti.filter(x => x.id !== p.id); return; }
      const g = G.gioc.get(p.id);
      if (g && (g.stato === 'libero' || g.stato === 'in gioco')) togli(G, g, 'uscito', 'sei uscito dal gioco', g.ruolo === 'ladro' ? 'Un ladro ha lasciato il gioco. ' : 'Una guardia ha lasciato il gioco.');
    });
    // durante la partita chi gioca non può teletrasportarsi con i comandi degli altri plugin
    api.on('message', (p, j) => {
      if (j.t !== 'chat' || typeof j.s !== 'string' || j.s[0] !== '/') return;
      const G = partite[p.room]; if (!G || G.fase === 'iscrizioni') return;
      const g = G.gioc.get(p.id); if (!g || (g.stato !== 'libero' && g.stato !== 'in gioco')) return;
      const k = K(j.s.slice(1).trim().split(/\s+/)[0]);
      const vietati = Array.isArray(C.comandiBloccati) ? C.comandiBloccati.map(K) : [];
      if (vietati.includes(k)) { p.tell('Durante Guardie e ladri non puoi usare /' + k + '.'); return false; }
    });
    // chi rientra nella pagina dopo la fine non ha più il riquadro: niente da fare. Agli altri si dice se c'è una partita aperta
    api.on('join', p => api.after(3000, () => {
      const G = partite[p.room], o = api.player(p.id);
      if (G && o && G.fase === 'iscrizioni' && !G.iscritti.some(x => x.id === o.id)) o.tell('Sono aperte le iscrizioni a Guardie e ladri: scrivi /guardie entra.');
    }));
    api.on('stop', () => { for (const G of Object.values(partite)) annulla(G, 'il plugin è stato spento o ricaricato'); delete globalThis.VoxeliaGuardieLadri; });

    // ---------- comando ----------
    function stato(p) {
      const G = partite[p.room];
      if (!G) return 'Nessuna partita di Guardie e ladri in questa stanza. ' + (C.aperturaDaiGiocatori !== false ? 'Aprila con /guardie apri' + (Object.keys(Q).length > 1 ? ' (quartieri: ' + Object.keys(Q).join(', ') + ')' : '') + '.' : 'Le partite le apre l\'admin.');
      const resta = mm(G.fine - Date.now());
      if (G.fase === 'iscrizioni') return 'Guardie e ladri nel quartiere «' + G.q.nome + '»: iscrizioni aperte ancora per ' + resta + '. Iscritti (' + G.iscritti.length + '): ' + (G.iscritti.map(x => x.nome).join(', ') || 'nessuno') + '. Scrivi /guardie entra.';
      const g = G.gioc.get(p.id), io = g ? (g.ruolo === 'guardia' ? 'Sei una guardia' : g.stato === 'libero' ? 'Sei un ladro' : 'Sei fuori') + (g.stato !== 'libero' && g.stato !== 'in gioco' ? ' (' + g.motivo + ')' : '') + '. ' : '';
      return io + 'Guardie e ladri nel quartiere «' + G.q.nome + '»: ' + (G.fase === 'nascondi' ? 'i ladri si nascondono, mancano ' : 'caccia in corso, mancano ') + resta + '. ' + resto(G);
    }
    api.command('guardie', 'Guardie e ladri: /guardie, /guardie apri, /guardie entra [ladro|guardia], /guardie esci, /guardie classifica', (p, args) => {
      const a = K(args[0]);
      if (a === 'apri') {
        if (C.aperturaDaiGiocatori === false) return 'Su questo server le partite di Guardie e ladri le apre l\'admin.';
        const r = apri(p.room, args[1], p.name); if (r) return r;
        return entra(p, args[2]);
      }
      if (a === 'entra' || a === 'iscrivi' || a === 'gioca') return entra(p, args[1]);
      if (a === 'esci' || a === 'ritira' || a === 'abbandona') {
        const G = partite[p.room]; if (!G) return 'Non c\'è nessuna partita.';
        if (G.fase === 'iscrizioni') {
          const n = G.iscritti.length; G.iscritti = G.iscritti.filter(x => x.id !== p.id && K(x.nome) !== K(p.name));
          return n === G.iscritti.length ? 'Non eri iscritto.' : 'Non sei più iscritto.';
        }
        const g = G.gioc.get(p.id); if (!g || (g.stato !== 'libero' && g.stato !== 'in gioco')) return 'Non stai giocando.';
        togli(G, g, 'uscito', 'hai abbandonato la partita', g.ruolo === 'ladro' ? 'Un ladro si è arreso. ' : 'Una guardia ha abbandonato la partita.');
        return '';
      }
      if (a === 'quartieri') return 'Quartieri: ' + Object.values(Q).map(q => q.k + ' (' + q.nome + ')').join(', ') + '.';
      if (a === 'classifica' || a === 'top') {
        const L = Object.values(S.g).sort((x, y) => (y.fughe + y.catture) - (x.fughe + x.catture) || y.partite - x.partite).slice(0, 10);
        return L.length ? 'Guardie e ladri, i migliori (fughe riuscite · ladri presi):\n' + L.map((v, i) => (i + 1) + '. ' + v.nome + ' — ' + v.fughe + (v.fughe === 1 ? ' fuga · ' : ' fughe · ') + v.catture + (v.catture === 1 ? ' cattura' : ' catture')).join('\n') : 'Nessuna partita giocata finora.';
      }
      return stato(p);
    });

    // ---------- pagine web ----------
    api.client('(' + nelGioco.toString() + ')(' + JSON.stringify(ID) + ');');
    const e = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
    const STILE = '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font:14px system-ui,sans-serif;background:#141822;color:#e8ecf4;margin:16px;max-width:820px}' +
      'h1,h2{font-family:Georgia,serif;color:#ffd84a}table{border-collapse:collapse;width:100%}td,th{padding:5px 8px;border-bottom:1px solid #fff2;text-align:left}small{opacity:.7}' +
      '.box{background:#0003;border-radius:8px;padding:10px 12px;margin:10px 0}button,select{padding:5px 9px;border-radius:4px;border:0;margin:2px;font:inherit}button{cursor:pointer;background:#f5b942}a{color:#ffd84a}</style>';
    const quando = t => new Date(t).toLocaleString('it-IT');
    function classifica() {
      const L = Object.values(S.g).sort((x, y) => (y.fughe + y.catture) - (x.fughe + x.catture) || y.partite - x.partite).slice(0, 25);
      return '<h2>Classifica</h2>' + (L.length ? '<table><tr><th></th><th>Eroe</th><th>Partite</th><th>Fughe riuscite</th><th>Ladri presi</th><th>Vittorie da guardia</th></tr>' +
        L.map((v, i) => '<tr><td>' + (i + 1) + '</td><td>' + e(v.nome) + '</td><td>' + v.partite + '</td><td>' + v.fughe + '</td><td>' + v.catture + '</td><td>' + v.vinteGuardia + '</td></tr>').join('') + '</table>' : '<p>Nessuna partita giocata finora.</p>') +
        '<h2>Ultime partite</h2>' + (S.storico.length ? '<table>' + S.storico.slice(0, 15).map(h => '<tr><td><small>' + e(quando(h.quando)) + '</small></td><td>' + e(h.quartiere) + '</td><td>' +
          (h.vince === 'guardie' ? '👮 vincono le guardie' : '🦹 vincono i ladri') + '</td><td><small>guardie: ' + e(h.guardie.join(', ')) + ' · ladri liberi: ' + e(h.ladri.filter(l => l.stato === 'libero').map(l => l.nome).join(', ') || 'nessuno') + '</small></td></tr>').join('') + '</table>' : '<p>Ancora nessuna partita.</p>');
    }
    function inCorso(adm) {
      const L = Object.values(partite);
      if (!L.length) return '<div class=box>Nessuna partita in corso.</div>';
      return L.map((G, i) => {
        const fase = G.fase === 'iscrizioni' ? 'iscrizioni' : G.fase === 'nascondi' ? 'i ladri si nascondono' : 'caccia';
        let h = '<div class=box><b>🚨 ' + (adm ? 'Stanza ' + e(G.room) : 'Partita ' + (i + 1)) + '</b> · ' + e(G.q.nome) + ' · ' + fase + ' · mancano ' + mm(G.fine - Date.now());
        if (G.fase === 'iscrizioni') h += '<br>Iscritti: ' + (e(G.iscritti.map(x => x.nome).join(', ')) || 'nessuno');
        else if (adm) h += '<table>' + lista(G).map(g => { const p = online(g.id); return '<tr><td>' + (g.ruolo === 'guardia' ? '👮' : '🦹') + ' ' + e(g.nome) + '</td><td>' + e(g.stato) + (g.motivo ? ' <small>(' + e(g.motivo) + ')</small>' : '') + '</td><td><small>' + (p ? e(p.zone) + ' ' + p.x.toFixed(1) + ',' + p.y.toFixed(1) : '') + '</small></td><td>' + (g.catture ? g.catture + ' catture' : '') + (g.sospetti ? ' <small>' + g.sospetti + ' sospetti</small>' : '') + '</td></tr>'; }).join('') + '</table>';
        else h += '<br>' + e(resto(G));
        if (adm) h += '<button style="background:#a33;color:#fff" onclick=\'if(confirm("Annullare la partita?"))fai("annulla",{room:' + JSON.stringify(G.room).replace(/'/g, '&#39;') + '})\'>Annulla</button>';
        return h + '</div>';
      }).join('');
    }
    api.route('GET', '/', (req, res, x) => x.send(STILE + '<title>Guardie e ladri</title><h1>🚨 Guardie e ladri</h1>' + inCorso(false) + classifica() + '<script>setTimeout(()=>location.reload(),30000)</script>'));
    api.route('GET', 'admin', (req, res, x) => {
      const stanze = Object.entries(api.rooms()).filter(([r]) => r && !partite[r]);
      x.send(STILE + '<title>Guardie e ladri · admin</title><h1>🚨 Guardie e ladri · admin</h1><p>Iscrizioni ' + mm(num(C.iscrizioniSec, 90, 10, 1800) * SEC) + ', nascondino ' + mm(num(C.nascondiSec, 60, 5, 600) * SEC) +
        ', caccia ' + mm(num(C.cacciaMin, 5, .2, 120) * MIN) + ' · si cambia in guardieladri.config.json. <a href="./">Pagina pubblica</a></p>' + inCorso(true) +
        (stanze.length ? '<div class=box>Apri le iscrizioni nella stanza <select id=r>' + stanze.map(([r, n]) => '<option value="' + e(r) + '">' + e(r) + ' (' + n.length + ' online)</option>').join('') + '</select> quartiere <select id=q>' +
          Object.values(Q).map(q => '<option value="' + e(q.k) + '"' + (q.k === K(C.quartiereBase) ? ' selected' : '') + '>' + e(q.nome) + '</option>').join('') + '</select> <button onclick=\'fai("apri",{room:document.getElementById("r").value,q:document.getElementById("q").value})\'>Apri</button></div>'
          : '<div class=box><small>Nessuna stanza libera con giocatori online.</small></div>') +
        classifica() + '<script>function fai(a,b){fetch("admin/"+a,{method:"POST",headers:{"x-voxelia":"1","Content-Type":"application/json"},body:JSON.stringify(b)}).then(r=>r.json()).then(j=>{if(j.ok)location.reload();else alert(j.err||"Errore")})}setTimeout(()=>location.reload(),15000)</script>');
    }, { admin: true });
    api.route('POST', 'admin/*', (req, res, x) => x.body(b => {
      b = b && typeof b === 'object' ? b : {};
      const room = String(b.room || '');
      if (x.path === '/admin/apri') { const r = apri(room, b.q, 'admin'); return r ? x.json(400, { err: r }) : x.json({ ok: 1 }); }
      if (x.path === '/admin/annulla') {
        const G = partite[room]; if (!G) return x.json(400, { err: 'Nessuna partita in quella stanza' });
        annulla(G, 'annullata dall\'admin'); return x.json({ ok: 1 });
      }
      x.json(404, { err: 'Azione sconosciuta' });
    }), { admin: true });
  },

  stop(api) { api.broadcast('fine', {}); }
};
