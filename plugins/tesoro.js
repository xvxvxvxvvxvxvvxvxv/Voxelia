// Caccia al tesoro: a intervalli il plugin nasconde un tesoro in uno dei nascondigli di tesoro.config.json
// e lo annuncia a tutti con un primo indizio; col passare del tempo arrivano indizi più precisi.
// Il server guarda dove sono i giocatori online e premia il primo che arriva abbastanza vicino.
// Quando un eroe è a pochi passi, nel suo gioco la casella del tesoro manda scintille dorate.
// Il tesoro si nasconde solo in zone che tutti possono raggiungere dall'inizio, senza missioni né cancelli
// (stesso criterio del Teletrasporto 1.2), e con una mappa che non cambia da una stanza all'altra:
// Foresta, Deserto, Picchi e dungeon sono esclusi perché le loro caselle cambiano in ogni stanza.
// Limite: la posizione arriva dal gioco del giocatore, quindi chi modifica il proprio gioco potrebbe falsificarla.

// zone dove il tesoro può stare, con la loro misura (verificate sul gioco 7.3.2: si raggiungono da Aldoria
// senza cancelli chiusi e la mappa è la stessa in ogni stanza; Nord, Est e Porto cambiano solo qualche cespuglio)
const APERTE = {
  town: 72, arena: 30, nord: 56, campi: 56, porto: 56,
  in_castle: 16, in_library: 12, in_tavern: 14, in_house1: 8, in_alch: 10, in_smith: 11, in_temple: 13, in_house2: 8, in_casino: 16,
  in_house3: 8, in_panetteria: 12, in_sartoria: 12, in_caserma: 16, in_scuderia: 14, in_osservatorio: 12, in_municipio: 16, in_motel: 16, in_motel2: 18,
  cas_galleria: 14, cas_consiglio: 14, cas_cucine: 12, cas_appartamenti: 14, cas_armeria: 12, cas_archivio: 12, cas_prigioni: 13,
  lib_archivio: 12, tav_camere: 12, tav_cantina: 12, tem_cripta: 12, casino_vip: 12, bar_dorm: 12, oss_cupola: 12, mun_piano: 12,
  in_palazzo: 16, in_banca: 14, in_teatro: 16, in_villa1: 16, in_villa2: 16, in_villa3: 16, in_villa4: 16, in_villa5: 16, in_villa6: 16,
  in_segheria: 14, in_fattoria: 14, in_fienile: 14,
  in_faro: 10, in_locanda: 16, in_capitaneria: 14, in_magazzino1: 14, in_magazzino2: 14, in_pescheria: 14, in_cantiere: 14,
  in_casa_p1: 12, in_casa_p2: 12, in_casa_p3: 12, in_casa_p4: 12, in_galeone: 16
};
const MIN = 60000;

// codice nel gioco: scintille sulla casella del tesoro quando il server dice che sei vicino, e la festa per chi lo trova
function nelGioco(ID) {
  const opz = f => { try { return f(); } catch (e) { return undefined; } };
  let qui = null, detto = false;
  VXP.on(ID, 'vicino', d => { if (!qui || qui.zk !== d.zk || qui.x !== d.x || qui.y !== d.y) detto = false; qui = d; if (!detto) { detto = true; opz(() => msg('✨ Qualcosa luccica qui vicino...')); } });
  VXP.on(ID, 'fine', () => { qui = null; detto = false; });
  VXP.on(ID, 'trovato', d => {
    if (qui && opz(() => Zk) === qui.zk) opz(() => burst(qui.x + .5, qui.y + .5, 40, ['#ffd700', '#fff6a0', '#ffb030'], { v: 1.4, up: 200, gr: 40 }));
    qui = null; detto = false;
    if (d && d.tuo) { opz(() => banner('Tesoro trovato!', d.testo || '', 'stella')); opz(() => jingle([72, 76, 79, 84], .14, 'triangle')); }
  });
  setInterval(() => {
    if (!qui || opz(() => Zk) !== qui.zk || !opz(() => started)) return;
    const dx = opz(() => P.px) - (qui.x + .5), dy = opz(() => P.py) - (qui.y + .5);
    if (!(Math.hypot(dx, dy) < 9)) return;
    opz(() => sparks(qui.x + .5, qui.y + .5, 4, ['#ffd700', '#fff6a0', '#ffffff'], 60));
  }, 300);
}

// nascondigli predefiniti: casella (x, y) libera in ogni stanza, nome per gli annunci, tre indizi dal più vago al più preciso
const NASCONDIGLI = [
  { zona: 'town', x: 42, y: 29, nome: 'il pozzo del mercato', indizi: ['Il tesoro è in città, dove i mercanti gridano i prezzi.', 'Cerca a est della fontana, tra le bancarelle del mercato.', 'È proprio sotto il pozzo del mercato, sul lato sud.'] },
  { zona: 'town', x: 47, y: 47, nome: 'il grande albero del parco', indizi: ['Il tesoro riposa all\'ombra, nel verde della città.', 'Cerca nel parco a sud-est della piazza della fontana.', 'È ai piedi del grande albero al centro del parco, appena a sud.'] },
  { zona: 'town', x: 6, y: 13, nome: 'il cortile del castello', indizi: ['Il tesoro è dove abita chi porta la corona.', 'Cerca nel cortile davanti al Castello, a nord-ovest di Aldoria.', 'È tra i due alberi del cortile, a sinistra della Guardia del Castello.'] },
  { zona: 'town', x: 62, y: 12, nome: 'le aiuole dell\'Osservatorio', indizi: ['Il tesoro passa le notti a guardare le stelle.', 'Cerca nell\'angolo nord-est di Aldoria, davanti all\'Osservatorio.', 'È tra i cannocchiali e le aiuole, tre passi sotto la porta dell\'Osservatorio.'] },
  { zona: 'town', x: 15, y: 62, nome: 'l\'ancora del lungomare', indizi: ['Il tesoro sente l\'odore del mare, ma non è al Porto.', 'Cerca sul lungomare di Aldoria, nella parte ovest.', 'È accanto all\'ancora più a ovest del lungomare, verso l\'acqua.'] },
  { zona: 'town', x: 65, y: 49, nome: 'il recinto di Saetta', indizi: ['Il tesoro ha visto passare più zoccoli che stivali.', 'Cerca vicino alla Scuderia, nella parte est di Aldoria.', 'È dentro il recinto dei cavalli, dove pascola Saetta.'] },
  { zona: 'town', x: 8, y: 45, nome: 'il vecchio cimitero', indizi: ['Il tesoro dorme accanto a chi non si sveglia più.', 'Cerca a sud-ovest di Aldoria, dietro una recinzione.', 'È tra le lapidi del vecchio cimitero, appena sotto la piccola cripta.'] },
  { zona: 'town', x: 61, y: 30, nome: 'il giardino del Municipio', indizi: ['Il tesoro è dove si scrivono le leggi della città.', 'Cerca nel giardino davanti al Municipio, a est di Aldoria.', 'È appena a sud dell\'albero, tra le siepi del giardino del Municipio.'] },
  { zona: 'town', x: 40, y: 13, nome: 'l\'ingresso del Colosseo', indizi: ['Il tesoro sente le grida della folla.', 'Cerca fuori dal Colosseo, a nord di Aldoria.', 'È all\'angolo sud-ovest del Colosseo, a pochi passi dal Tabellone dell\'Arena.'] },
  { zona: 'town', x: 22, y: 11, nome: 'il giardino della Biblioteca', indizi: ['Il tesoro ama il silenzio e i libri.', 'Cerca davanti alla Biblioteca Arcana, a nord di Aldoria.', 'È tra le due panchine del giardino, appena sotto la porta della Biblioteca.'] },
  { zona: 'porto', x: 47, y: 44, nome: 'il Faro', indizi: ['Il tesoro aspetta dove finisce la terra.', 'Cerca al Porto, sulla punta del molo a est.', 'È ai piedi del Faro di Aldoria, appena sotto la sua porta.'] },
  { zona: 'porto', x: 47, y: 23, nome: 'le reti dei pescatori', indizi: ['Il tesoro è rimasto impigliato.', 'Cerca al Porto, vicino alla Capitaneria.', 'È appena sopra le reti stese ad asciugare, a est della Capitaneria.'] },
  { zona: 'porto', x: 4, y: 26, nome: 'l\'ancora del molo ovest', indizi: ['Il tesoro ha gettato l\'ancora.', 'Cerca al Porto, all\'estremità ovest della banchina.', 'È accanto alla grande ancora a ovest, sotto la Locanda del Gabbiano.'] },
  { zona: 'nord', x: 18, y: 50, nome: 'il roseto', indizi: ['Il tesoro profuma di rose.', 'Cerca nel Quartiere Nobile, nella parte sud-ovest.', 'È nel roseto del Giardiniere Fiore, tra le aiuole.'] },
  { zona: 'nord', x: 28, y: 28, nome: 'la vasca del Quartiere Nobile', indizi: ['Il tesoro si specchia nell\'acqua dei nobili.', 'Cerca nella piazza al centro del Quartiere Nobile.', 'È appena a sud della grande vasca della piazza.'] },
  { zona: 'nord', x: 33, y: 37, nome: 'il giardino delle siepi', indizi: ['Il tesoro si è perso tra le siepi.', 'Cerca nel Quartiere Nobile, nei giardini a sud della piazza.', 'È nel giardino di siepi a est, vicino all\'albero.'] },
  { zona: 'campi', x: 36, y: 36, nome: 'il frutteto', indizi: ['Il tesoro è maturo al punto giusto.', 'Cerca ad Aldoria Est, nei Campi e Mestieri.', 'È in mezzo al frutteto, tra i meli.'] },
  { zona: 'campi', x: 18, y: 43, nome: 'il pollaio', indizi: ['Il tesoro è stato covato con cura.', 'Cerca ad Aldoria Est, vicino alla Casa della Fattoria.', 'È dentro il pollaio, tra le galline e le uova.'] },
  { zona: 'in_tavern', x: 11, y: 2, nome: 'il camino della Taverna', indizi: ['Il tesoro si scalda vicino al fuoco.', 'Cerca alla Taverna del Drago Ubriaco.', 'È accanto al camino, in fondo a destra dietro il bancone.'] },
  { zona: 'in_library', x: 5, y: 1, nome: 'gli scaffali della Biblioteca', indizi: ['Il tesoro è nascosto tra le pagine.', 'Cerca dentro la Biblioteca Arcana.', 'È in fondo alla sala, tra i due scaffali centrali, dietro il Saggio Elandor.'] },
  { zona: 'in_temple', x: 10, y: 1, nome: 'l\'altare del Tempio', indizi: ['Il tesoro è stato benedetto.', 'Cerca dentro il Tempio della Luce.', 'È in fondo al tempio, a destra dell\'altare, vicino alla pianta.'] }
];

module.exports = {
  name: 'Caccia al tesoro',
  version: '1.0',
  author: 'Voxelia',
  description: 'Un tesoro nascosto in città, indizi a tappe e un premio al primo che lo trova (/tesoro)',
  defaults: {
    ogniMin: 40,              // minuti tra la fine di una caccia e l'inizio della successiva
    primaMin: 5,              // minuti dall'avvio del server alla prima caccia
    durataMin: 15,            // dopo quanti minuti, se nessuno l'ha trovato, il tesoro sparisce
    indiziMin: [0, 5, 10],    // quando esce ciascun indizio, in minuti dall'inizio della caccia
    minGiocatori: 1,          // la caccia parte solo con almeno questi eroi online
    raggio: 1.6,              // quanto vicino (in caselle) bisogna arrivare per trovarlo
    premio: { oro: 300, xp: 200, rarita: 2 },   // rarità dell'oggetto in regalo: 0-3, oppure -1 per nessun oggetto
    // zona, casella (x, y), nome mostrato quando la caccia finisce e indizi dal più vago al più preciso.
    // Valgono solo le zone aperte a tutti con una mappa uguale in ogni stanza (vedi APERTE in tesoro.js).
    nascondigli: NASCONDIGLI
  },

  setup(api) {
    const C = api.config, ID = api.id;
    const S = api.store;
    if (!S.vinti || typeof S.vinti !== 'object') S.vinti = {};    // nome in minuscolo → { nome, n }
    if (!Array.isArray(S.storico)) S.storico = [];                // ultime cacce: { quando, dove, chi }
    if (!Array.isArray(S.ultimi)) S.ultimi = [];                  // nascondigli usati di recente (per non ripeterli)
    const vicini = new Map();                                     // id giocatore → chiave del tesoro di cui ha già le coordinate

    const num = (v, d, a, b) => { const n = +v; return isFinite(n) ? Math.max(a, Math.min(b, n)) : d; };
    const ogni = () => num(C.ogniMin, 40, .2, 1440) * MIN, durata = () => num(C.durataMin, 15, .2, 600) * MIN;
    const tappe = () => (Array.isArray(C.indiziMin) && C.indiziMin.length ? C.indiziMin : [0, 5, 10]).map(m => num(m, 0, 0, 600) * MIN);
    const raggio = () => num(C.raggio, 1.6, .8, 6);

    // un nascondiglio vale solo in una zona aperta a tutti, dentro la mappa e con almeno un indizio
    function problema(s) {
      if (!s || typeof s !== 'object') return 'non è un oggetto';
      if (!APERTE[s.zona]) return 'la zona "' + s.zona + '" non è aperta a tutti fin dall\'inizio o cambia da una stanza all\'altra';
      const n = APERTE[s.zona];
      if (!Number.isInteger(s.x) || !Number.isInteger(s.y) || s.x < 1 || s.y < 1 || s.x > n - 2 || s.y > n - 2) return 'casella fuori dalla mappa (' + s.zona + ' va da 1 a ' + (n - 2) + ')';
      if (!Array.isArray(s.indizi) || !s.indizi.some(t => typeof t === 'string' && t.trim())) return 'manca almeno un indizio';
      return '';
    }
    const lista = Array.isArray(C.nascondigli) ? C.nascondigli : [];
    const validi = [];
    lista.forEach((s, i) => { const p = problema(s); if (p) api.log('nascondiglio ' + (i + 1) + ' ignorato: ' + p); else validi.push(i); });
    if (!validi.length) api.log('nessun nascondiglio valido in tesoro.config.json: la caccia non partirà');
    const nomeDi = s => String(s.nome || s.zona).slice(0, 60);
    const indizi = s => s.indizi.filter(t => typeof t === 'string' && t.trim()).map(t => t.trim().slice(0, 130));

    const salva = () => api.save();
    const caccia = () => S.attiva && lista[S.attiva.i] && !problema(lista[S.attiva.i]) ? S.attiva : null;
    if (S.attiva && !caccia()) { S.attiva = null; salva(); }   // il nascondiglio è stato tolto o cambiato nel config
    if (!(S.prossima > 0)) { S.prossima = Date.now() + num(C.primaMin, 5, 0, 1440) * MIN; salva(); }

    // gli indizi usciti finora, con quanto manca alla fine
    function stato() {
      const A = caccia();
      if (!A) {
        const m = Math.max(0, Math.ceil((S.prossima - Date.now()) / MIN));
        return 'Nessun tesoro nascosto in questo momento. ' + (m > 0 ? 'La prossima caccia inizia tra circa ' + m + ' min.' : 'La prossima caccia inizia appena ci sono abbastanza eroi online.');
      }
      const s = lista[A.i], L = indizi(s).slice(0, A.dati), m = Math.max(1, Math.ceil((A.fine - Date.now()) / MIN));
      return '🗝 C\'è un tesoro nascosto! Sparisce tra ' + m + ' min.\n' + L.map((t, k) => 'Indizio ' + (k + 1) + ': ' + t).join('\n');
    }

    function nascondi(scelta, chi) {
      if (caccia()) return 'C\'è già una caccia in corso.';
      let i = scelta;
      if (i == null) {
        if (!validi.length) return 'Nessun nascondiglio valido nel config.';
        const lib = validi.filter(k => !S.ultimi.includes(k)), pool = lib.length ? lib : validi;
        i = pool[Math.floor(Math.random() * pool.length)];
      } else if (!validi.includes(i)) return 'Nascondiglio non valido.';
      const ora = Date.now();
      S.attiva = { i, inizio: ora, fine: ora + durata(), dati: 0, k: ID + ':' + ora };
      S.ultimi = [i].concat(S.ultimi.filter(k => k !== i)).slice(0, Math.min(5, Math.max(0, validi.length - 1)));
      salva(); vicini.clear();
      api.log('tesoro nascosto: ' + nomeDi(lista[i]) + ' (' + lista[i].zona + ' ' + lista[i].x + ',' + lista[i].y + ')' + (chi ? ' da ' + chi : ''));
      indizia(true);
      return '';
    }
    // esce l'indizio successivo quando è il suo momento
    function indizia(primo) {
      const A = caccia(); if (!A) return;
      const L = indizi(lista[A.i]), T = tappe(), dopo = Date.now() - A.inizio;
      let nuovo = -1;
      while (A.dati < L.length && (A.dati === 0 || dopo >= (T[A.dati] != null ? T[A.dati] : T[T.length - 1] + (A.dati - T.length + 1) * MIN * 5))) { nuovo = A.dati; A.dati++; }
      if (nuovo < 0) return;
      salva();
      const t = L[nuovo];
      if (primo) api.announce('🗝 Caccia al tesoro! Primo indizio: ' + t);
      else api.announce('🗝 Indizio ' + (nuovo + 1) + (nuovo === L.length - 1 ? ' (l\'ultimo)' : '') + ': ' + t);
    }
    function chiudi() { S.attiva = null; S.prossima = Date.now() + ogni(); salva(); vicini.clear(); api.broadcast('fine', {}); }
    function scaduta() {
      const A = caccia(); if (!A) return;
      const s = lista[A.i];
      S.storico.unshift({ quando: Date.now(), dove: nomeDi(s), chi: null }); S.storico = S.storico.slice(0, 30);
      chiudi();
      api.announce('Nessuno ha trovato il tesoro: era nascosto presso ' + nomeDi(s) + '. Prossima caccia tra ' + Math.round(ogni() / MIN) + ' min.');
    }
    function trovato(p) {
      const A = caccia(); if (!A) return;
      const s = lista[A.i], P = C.premio && typeof C.premio === 'object' ? C.premio : {};
      const oro = num(P.oro, 0, 0, 1e6) | 0, xp = num(P.xp, 0, 0, 1e6) | 0, r = num(P.rarita, -1, -1, 3) | 0;
      try { if (oro > 0) p.give('gold', oro); if (xp > 0) p.give('xp', xp); if (r >= 0) p.give('item', 1, r); }
      catch (e) { api.log('premio non consegnato a ' + p.name + ': ' + (e && e.message || e)); }
      const k = p.name.toLowerCase(), v = S.vinti[k] || (S.vinti[k] = { nome: p.name, n: 0 }); v.nome = p.name; v.n++;
      S.storico.unshift({ quando: Date.now(), dove: nomeDi(s), chi: p.name }); S.storico = S.storico.slice(0, 30);
      const premio = [oro > 0 && oro + ' oro', xp > 0 && xp + ' XP', r >= 0 && 'un oggetto ' + ['comune', 'non comune', 'raro', 'epico'][r]].filter(Boolean).join(', ');
      for (const o of api.players()) o.send('trovato', o.id === p.id ? { tuo: 1, testo: premio ? 'Hai vinto ' + premio : '' } : {});
      chiudi();
      api.announce('🏆 ' + p.name + ' ha trovato il tesoro presso ' + nomeDi(s) + '!' + (premio ? ' Premio: ' + premio + '.' : ''));
      api.log(p.name + ' ha trovato il tesoro (' + nomeDi(s) + ')');
    }

    // ogni secondo: indizi, scadenza, chi è vicino e chi l'ha trovato
    api.every(1000, () => {
      const A = caccia(), ora = Date.now();
      if (!A) { if (ora >= S.prossima && validi.length && api.players().length >= num(C.minGiocatori, 1, 0, 100)) nascondi(); return; }
      if (ora >= A.fine) { scaduta(); return; }
      indizia(false);
      const s = lista[A.i], R = raggio();
      let primo = null, d0 = Infinity;
      for (const p of api.players()) {
        if (p.zone !== s.zona) continue;
        const d = Math.hypot(p.x - (s.x + .5), p.y - (s.y + .5));
        if (d <= R && d < d0) { primo = p; d0 = d; }
        // a pochi passi il gioco riceve la casella per le scintille (una volta per giocatore e per caccia)
        if (d <= 7 && vicini.get(p.id) !== A.k) { vicini.set(p.id, A.k); p.send('vicino', { zk: s.zona, x: s.x, y: s.y }); }
      }
      if (primo) trovato(primo);
    });

    api.client('(' + nelGioco.toString() + ')(' + JSON.stringify(ID) + ');');

    api.on('join', p => { if (caccia()) api.after(3000, () => { const o = api.player(p.id); if (o && caccia()) o.tell(stato()); }); });
    api.on('leave', p => vicini.delete(p.id));

    api.command('tesoro', 'la caccia al tesoro: indizi usciti finora (/tesoro classifica per i migliori cercatori)', (p, args) => {
      if (/^(classifica|top)$/i.test(args[0] || '')) {
        const L = Object.values(S.vinti).sort((a, b) => b.n - a.n).slice(0, 10);
        return L.length ? 'Migliori cercatori di tesori:\n' + L.map((v, k) => (k + 1) + '. ' + v.nome + ' (' + v.n + ')').join('\n') : 'Nessuno ha ancora trovato un tesoro.';
      }
      return stato();
    });

    // pagine web: pubblica con gli indizi usciti e la classifica, admin con il nascondiglio e i pulsanti
    const e = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
    const STILE = '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font:14px system-ui,sans-serif;background:#141822;color:#e8ecf4;margin:16px;max-width:760px}' +
      'h1,h2{font-family:Georgia,serif;color:#ffd84a}table{border-collapse:collapse;width:100%}td,th{padding:5px 8px;border-bottom:1px solid #fff2;text-align:left}small{opacity:.7}' +
      '.box{background:#0003;border-radius:8px;padding:10px 12px;margin:10px 0}button,select{padding:5px 9px;border-radius:4px;border:0;margin:2px;font:inherit}button{cursor:pointer;background:#f5b942}.no{color:#ff8a7a}a{color:#ffd84a}</style>';
    const quando = t => new Date(t).toLocaleString('it-IT');
    function albo() {
      const L = Object.values(S.vinti).sort((a, b) => b.n - a.n).slice(0, 20);
      return '<h2>Migliori cercatori</h2>' + (L.length ? '<table>' + L.map((v, k) => '<tr><td>' + (k + 1) + '</td><td>' + e(v.nome) + '</td><td>' + v.n + '</td></tr>').join('') + '</table>' : '<p>Nessuno ha ancora trovato un tesoro.</p>') +
        '<h2>Ultime cacce</h2>' + (S.storico.length ? '<table>' + S.storico.slice(0, 15).map(h => '<tr><td><small>' + e(quando(h.quando)) + '</small></td><td>' + e(h.dove) + '</td><td>' + (h.chi ? '🏆 ' + e(h.chi) : '<small>nessuno</small>') + '</td></tr>').join('') + '</table>' : '<p>Ancora nessuna caccia.</p>');
    }
    function inCorso(adm) {
      const A = caccia(); if (!A) return '<div class=box>' + e(stato()) + '</div>';
      const s = lista[A.i];
      return '<div class=box><b>🗝 Caccia in corso</b> · sparisce tra ' + Math.max(1, Math.ceil((A.fine - Date.now()) / MIN)) + ' min' +
        (adm ? '<br>Nascondiglio: <b>' + e(nomeDi(s)) + '</b> <small>(' + e(s.zona) + ' ' + s.x + ',' + s.y + ')</small>' : '') +
        '<ol>' + indizi(s).map((t, k) => k < A.dati ? '<li>' + e(t) + '</li>' : adm ? '<li><small>' + e(t) + ' (non ancora uscito)</small></li>' : '').join('') + '</ol></div>';
    }
    api.route('GET', '/', (req, res, x) => x.send(STILE + '<title>Caccia al tesoro</title><h1>🗝 Caccia al tesoro</h1>' + inCorso(false) + albo() + '<script>setTimeout(()=>location.reload(),30000)</script>'));
    api.route('GET', 'admin', (req, res, x) => {
      const opz = validi.map(i => '<option value="' + i + '">' + e(nomeDi(lista[i])) + ' (' + e(lista[i].zona) + ')</option>').join('');
      const scarti = lista.map((s, i) => [i, problema(s)]).filter(z => z[1]);
      x.send(STILE + '<title>Caccia al tesoro · admin</title><h1>🗝 Caccia al tesoro · admin</h1>' +
        '<p>Una caccia ogni ' + Math.round(ogni() / MIN) + ' min, dura ' + Math.round(durata() / MIN) + ' min · ' + validi.length + ' nascondigli validi (si cambiano in tesoro.config.json). <a href="./">Pagina pubblica</a></p>' +
        inCorso(true) +
        (caccia() ? '<button style="background:#a33;color:#fff" onclick=\'if(confirm("Annullare la caccia?"))fai("annulla",{})\'>Annulla la caccia</button>'
          : '<select id=s><option value="">a caso</option>' + opz + '</select> <button onclick=\'fai("nascondi",{i:document.getElementById("s").value})\'>Nascondi il tesoro ora</button>') +
        (scarti.length ? '<div class=box><b class=no>Nascondigli ignorati</b><ul>' + scarti.map(z => '<li>' + (z[0] + 1) + '. ' + e(z[1]) + '</li>').join('') + '</ul></div>' : '') +
        albo() +
        '<script>function fai(a,b){fetch("admin/"+a,{method:"POST",headers:{"x-voxelia":"1","Content-Type":"application/json"},body:JSON.stringify(b)}).then(r=>r.json()).then(j=>{if(j.ok)location.reload();else alert(j.err||"Errore")})}setTimeout(()=>location.reload(),20000)</script>');
    }, { admin: true });
    api.route('POST', 'admin/*', (req, res, x) => x.body(b => {
      b = b && typeof b === 'object' ? b : {};
      if (x.path === '/admin/nascondi') {
        const i = b.i === '' || b.i == null ? null : parseInt(b.i, 10);
        const r = nascondi(Number.isInteger(i) ? i : null, 'admin'); return r ? x.json(400, { err: r }) : x.json({ ok: 1 });
      }
      if (x.path === '/admin/annulla') {
        if (!caccia()) return x.json(400, { err: 'Nessuna caccia in corso' });
        chiudi(); api.announce('La caccia al tesoro è stata annullata.'); api.log('caccia annullata dall\'admin'); return x.json({ ok: 1 });
      }
      x.json(404, { err: 'Azione sconosciuta' });
    }), { admin: true });
  },

  stop(api) { api.broadcast('fine', {}); }
};
