// Case: ogni eroe ha una piccola casa tutta sua nel Borgo delle Case.
// - /casa la prima volta apre la scelta: dieci modelli di casa, colori di muri e pavimento, il pet e il suo nome.
//   Poi porta a casa. Dal riquadro ⚙ Casa si cambia modello, colori, musica, nome e cartello, e si arreda
//   mettendo letti, tavoli, piante, lanterne, tappeti… sul pavimento.
// - In ogni casa c'è un deposito per oggetti e oro. Lo tiene il server e lo apre solo il padrone di casa:
//   alla costruzione il browser riceve un codice segreto della casa e il server ne conserva solo l'impronta,
//   così chi si dà lo stesso nome da un altro computer non può aprirlo. /casa chiave <codice> lo porta su un altro browser.
// - Il pet (cane, gatto, coniglio, volpe, pinguino, gufo, tartaruga, draghetto, maialino, pulcino) va accudito
//   come un tamagotchi: sazietà, allegria, energia e pulizia calano col tempo; dargli da mangiare, giocarci,
//   lavarlo, coccolarlo e insegnargli giochi lo fa crescere di livello. Le statistiche sono calcolate sul server.
// - Nel Borgo (portale in città, oppure /borgo) le porte portano alle case degli altri; il custode le elenca tutte.
//   Chi visita una casa aperta può coccolare il pet, giocarci, dargli un biscotto e spazzolarlo (e ne guadagna un po'
//   di esperienza), ma non vede né apre il deposito.
// - Le case costano poco (dalla tenda a 50 monete alla villa a 280, pet compreso); traslochi, colori, arredi nuovi e cibo per il pet
//   hanno piccoli prezzi. Il padrone di casa può pagare anche con l'oro del deposito. prezzoPercento li scala tutti (0 = gratis).
// Comandi: /casa · /casa chiave [codice] · /visita <nome> · /borgo · /case · /pet
// Pagina per l'admin (codici persi, case da eliminare): /plugins/housing/admin

// ======================= dati condivisi (server e gioco) =======================
// Segni nelle piante: # muro · . pavimento · spazio = fuori · D porta · ■ deposito · ⌂ cuccia del pet · ◍ ciotola
// Gli altri segni sono arredi del gioco (B letto, T tavolo, S libreria, p pianta…) o del plugin (▤ ▥ tappeti, ◫ acquario).
const DATI = {
  modelli: {
    casetta: { n: 'Casetta di legno', d: 'Piccola e accogliente, perfetta per cominciare.', muro: 0, pav: 0, mus: 'inter', lay: [
      '############',
      '#BB.S■...pS#',
      '#..........#',
      '#.........⌂#',
      '#nT.......◍#',
      '#nT........#',
      '#..........#',
      '#ł.........#',
      '#..........#',
      '#k.......pb#',
      '#..........#',
      '#####D######'] },
    cottage: { n: 'Cottage di pietra', d: 'Camera da letto separata e un caminetto in soggiorno.', muro: 2, pav: 3, mus: 'inter', lay: [
      '##############',
      '#BB..#S■....S#',
      '#....#.......#',
      '#S...#...T...#',
      '#.......nTn..#',
      '#p...#.......#',
      '######.#######',
      '#............#',
      '#⌂◍......F...#',
      '#............#',
      '#k...........#',
      '#p.........b.#',
      '#............#',
      '######D#######'] },
    villetta: { n: 'Villetta con giardino', d: 'Tre stanze e un giardinetto interno con alberi da frutto.', muro: 3, pav: 0, mus: 'inter', lay: [
      '################',
      '#BB..S#S■S#..o.#',
      '#.....#...#....#',
      '#p....#...#.a..#',
      '#...........o..#',
      '#.....#...#....#',
      '###.#####.###.##',
      '#..............#',
      '#.n..T....T..n.#',
      '#.n..T....T..n.#',
      '#..............#',
      '#⌂◍..........ł.#',
      '#..............#',
      '#S...........k.#',
      '#p............p#',
      '#######D########'] },
    baita: { n: 'Baita di montagna', d: 'Un grande camino, legna da ardere e un tappeto caldo.', muro: 1, pav: 1, mus: 'inter', lay: [
      '#############',
      '#LL.FF.■.SS.#',
      '#...........#',
      '#B..........#',
      '#B...▤▤▤....#',
      '#....▤▤▤..T.#',
      '#....▤▤▤..n.#',
      '#...........#',
      '#⌂◍.........#',
      '#.........b.#',
      '#k..........#',
      '#p.........p#',
      '######D######'] },
    torre: { n: 'Torre del mago', d: 'Pianta ottagonale, cristalli che brillano e librerie piene di segreti.', muro: 8, pav: 10, mus: 'notte', lay: [
      '    #####    ',
      '  ###.■.###  ',
      ' ##...S...## ',
      ' #.8.....8.# ',
      '##.........##',
      '#S....<....S#',
      '#...........#',
      '##....*....##',
      ' #.⌂◍......# ',
      ' ##.......## ',
      '  ###...###  ',
      '   ###D###   ',
      '             '] },
    pescatore: { n: 'Casa del pescatore', d: 'Botti, reti, vasche per i pesci e un acquario.', muro: 5, pav: 1, mus: 'inter', lay: [
      '##############',
      '#bb..k■k..bb.#',
      '#............#',
      '#..:......:..#',
      '#............#',
      '#B....TT.....#',
      '#B....nn.....#',
      '#............#',
      '#◫...........#',
      '#⌂◍........ł.#',
      '#............#',
      '#k..b........#',
      '#............#',
      '######D#######'] },
    villa: { n: 'Villa nobiliare', d: 'Salone con colonne e tappeto, sala da pranzo e camera padronale.', muro: 4, pav: 4, mus: 'inter', lay: [
      '##################',
      '#SS.SS..■..SS.SS.#',
      '#................#',
      '#.6....K.K....6..#',
      '#................#',
      '#.6..▤▤▤▤▤▤▤..6..#',
      '#....▤▤▤▤▤▤▤.....#',
      '#.6..▤▤▤▤▤▤▤..6..#',
      '#................#',
      '####.########.####',
      '#BB.....#........#',
      '#.......#..TTT...#',
      '#p......#..nnn...#',
      '#.......#........#',
      '#⌂◍.....#.....*..#',
      '#..............ł.#',
      '#X..............p#',
      '########D#########'] },
    tenda: { n: 'Tenda del deserto', d: 'Tappeti, un falò e sacchi di spezie, come a Khem.', muro: 10, pav: 7, mus: 'inter', lay: [
      '   #######   ',
      '  ##.■...##  ',
      ' ##.......## ',
      '##..▤▤▤▤▤..##',
      '#...▤▤▤▤▤...#',
      '#y..▤▤▤▤▤..ƒ#',
      '#...▤▤▤▤▤...#',
      '#i.........b#',
      '##.⌂◍.....## ',
      ' ##.......## ',
      '  ##.....##  ',
      '   ###D###   ',
      '             '] },
    igloo: { n: 'Igloo dei Picchi', d: 'Ghiaccio fuori, braciere dentro. Il pupazzo di neve è compreso.', muro: 9, pav: 8, mus: 'inter', lay: [
      '   ######   ',
      '  ##.■..##  ',
      ' ##......## ',
      '##..9.....##',
      '#.........ł#',
      '#..B.......#',
      '#..B....,..#',
      '##........##',
      ' #⌂◍.....#  ',
      ' ##......## ',
      '  ###D###   ',
      '            '] },
    fattoria: { n: 'Casale di campagna', d: 'Orto interno, fieno, sacchi di farina e un abbeveratoio.', muro: 3, pav: 11, mus: 'inter', lay: [
      '################',
      '#BB.S.■.#.ooo..#',
      '#.......#......#',
      '#p......#.a..a.#',
      '#...........o..#',
      '#.......#......#',
      '#####.#####.####',
      '#..............#',
      '#yy....TT....ii#',
      '#y.....nn.....i#',
      '#..............#',
      '#⌂◍..........F.#',
      '#..............#',
      '#:.L.......k.b.#',
      '#..............#',
      '#######D########'] }
  },
  muri: [['Legno chiaro', '#c8a070'], ['Legno scuro', '#6b4a2b'], ['Pietra', '#8b8f99'], ['Mattoni', '#a0503a'], ['Calce bianca', '#e8e0d0'],
    ['Azzurro', '#6a9ac8'], ['Verde salvia', '#7a9a6a'], ['Rosa antico', '#c88a8a'], ['Viola', '#6a4a8a'], ['Ghiaccio', '#d8ecf4'], ['Sabbia', '#d8c08a'], ['Notte', '#2a2a3a']],
  pavimenti: [['Parquet', '#8a6a4a', '#806244'], ['Tavole scure', '#5a4030', '#523a2b'], ['Pietra', '#8a8a8a', '#7e7e7e'], ['Cotto', '#b8704a', '#ac6844'],
    ['Marmo', '#e8e4dc', '#d8d4cc'], ['Moquette rossa', '#8a2a2a', '#822828'], ['Erba', '#5a8a3a', '#548236'], ['Sabbia', '#d8c08a', '#d0b882'],
    ['Neve', '#eef4f8', '#e4ecf2'], ['Scacchiera', '#e8e4dc', '#3a3a3a'], ['Blu notte', '#2a3a5a', '#26344f'], ['Paglia', '#d8b84a', '#ccae44']],
  musiche: [['inter', 'Valzer della taverna'], ['motel', 'Motel'], ['notte', 'Notturno'], ['town', 'Aldoria'], ['forest', 'Foresta'], ['sogno', 'Sogno'], ['', 'Silenzio']],
  // arredi che il proprietario può mettere sul pavimento: [segno, nome, calpestabile]
  arredi: [['T', 'Tavolo'], ['n', 'Panca'], ['m', 'Sgabello'], ['B', 'Letto'], ['S', 'Libreria'], ['k', 'Cassa'], ['b', 'Botte'], ['C', 'Bancone'],
    ['p', 'Pianta'], ['o', 'Aiuola'], ['e', 'Rose'], ['r', 'Alberello'], ['a', 'Melo'], ['¢', 'Cactus'], ['ł', 'Lanterna'], ['l', 'Lampione'], ['ċ', 'Candele'],
    ['F', 'Camino'], ['ƒ', 'Falò'], [',', 'Braciere'], ['K', 'Poltrona'], ['X', 'Altare'], ['6', 'Colonna'], ['8', 'Cristalli'], ['9', 'Pupazzo di neve'],
    ['W', 'Pozzo'], [':', 'Vasca'], ['y', 'Fieno'], ['i', 'Sacchi'], ['L', 'Legna'], ['Ø', 'Tesoro'], ['◫', 'Acquario'],
    ['▤', 'Tappeto rosso', 1], ['▥', 'Tappeto blu', 1]],
  // prezzi di listino in monete (l'admin li può scalare con prezzoPercento)
  listino: {
    modelli: { tenda: 50, igloo: 70, casetta: 90, cottage: 120, pescatore: 130, baita: 140, fattoria: 160, villetta: 180, torre: 220, villa: 280 },
    arredi: { T: 12, n: 8, m: 5, B: 20, S: 18, k: 8, b: 8, C: 15, p: 6, o: 8, e: 8, r: 15, a: 20, '¢': 6, 'ł': 10, l: 14, 'ċ': 6, F: 30, 'ƒ': 15, ',': 12, K: 15,
      X: 25, 6: 18, 8: 25, 9: 10, W: 30, ':': 15, y: 5, i: 5, L: 5, 'Ø': 40, '◫': 35, '▤': 12, '▥': 12 },
    colore: 8,          // ridipingere muri o pavimento
    trasloco: 50,       // cambiare modello: questa percentuale del prezzo del nuovo modello
    cibo: 3             // una ciotola per il pet
  },
  specie: {
    cane: { n: 'Cane', c: [['Miele', '#c89a5a'], ['Nero', '#3a3030'], ['Bianco', '#f0ece4'], ['Marrone', '#8a5a32']] },
    gatto: { n: 'Gatto', c: [['Rosso', '#e09a40'], ['Nero', '#3a3a3a'], ['Bianco', '#f4f0e8'], ['Grigio', '#9a9aa4']] },
    coniglio: { n: 'Coniglio', c: [['Bianco', '#f4f0e8'], ['Nocciola', '#b8a088'], ['Cioccolato', '#6a5a4a']] },
    volpe: { n: 'Volpe', c: [['Rossa', '#e0702a'], ['Artica', '#f0f0f0'], ['Bruna', '#8a4a2a']] },
    pinguino: { n: 'Pinguino', c: [['Classico', '#2a2a3a'], ['Blu', '#3a4a6a']] },
    gufo: { n: 'Gufo', c: [['Bruno', '#8a6a42'], ['Delle nevi', '#e8e4dc'], ['Grigio', '#6a6a72']] },
    tartaruga: { n: 'Tartaruga', c: [['Verde', '#4a8a3a'], ['Ambra', '#8a6a2a'], ['Marina', '#3a6a8a']] },
    draghetto: { n: 'Draghetto', c: [['Smeraldo', '#4ab04a'], ['Rubino', '#c0392b'], ['Ametista', '#6a4ac8'], ['Oro', '#d4af37']] },
    maialino: { n: 'Maialino', c: [['Rosa', '#f0a8a8'], ['Cinghialetto', '#8a6a5a']] },
    pulcino: { n: 'Pulcino', c: [['Giallo', '#ffd84a'], ['Bianco', '#f4f0e0']] }
  },
  // giochi che il pet impara salendo di livello
  trucchi: [[1, 'si mette seduto'], [3, 'dà la zampa'], [5, 'fa una giravolta'], [8, 'fa un salto'], [12, 'rotola per terra'], [16, 'fa un inchino'], [20, 'balla'], [25, 'fa una capriola']],
  // il Borgo delle Case: dodici porte per le case (in alto, a sinistra, a destra), il custode al centro, l'uscita in basso
  borgo: { lay: [
    '######################',
    '#....................#',
    '#.r................r.#',
    '#....................#',
    '#...o..ł......ł..o...#',
    '#....................#',
    '#....................#',
    '#.ł......nWn......ł..#',
    '#....................#',
    '#....................#',
    '#....o..........o....#',
    '#....................#',
    '#.r................r.#',
    '#.......ł....ł.......#',
    '#....................#',
    '#....................#',
    '#....................#',
    '#.o................o.#',
    '#....................#',
    '#.r......ł..ł......r.#',
    '#....................#',
    '##########D###########'],
    porte: [[3, 1], [6, 1], [9, 1], [12, 1], [15, 1], [18, 1], [1, 5], [1, 9], [1, 14], [20, 5], [20, 9], [20, 14]],
    custode: [11, 15] }
};
const CAMMINA = new Set(DATI.arredi.filter(a => a[2]).map(a => a[0]));

// Pianta di una casa con gli arredi del proprietario; trova deposito, cuccia, porta. Controlla che si possa ancora camminare.
function pianta(model, arr) {
  const M = DATI.modelli[model]; if (!M) return null;
  const N = M.lay.length, L = M.lay.map(r => [...r.padEnd(N, ' ')]);
  let dep = null, cuc = null, porta = null;
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const c = L[y][x];
    if (c === '■') { dep = [x, y]; L[y][x] = '.'; } else if (c === '⌂') cuc = [x, y]; else if (c === 'D') porta = [x, y];
  }
  const base = L.map(r => r.slice());
  for (const k in arr || {}) { const [x, y] = k.split(',').map(Number); if (L[y] && L[y][x] === '.') L[y][x] = arr[k]; }
  const libero = (x, y) => L[y] && (L[y][x] === '.' || L[y][x] === 'D' || CAMMINA.has(L[y][x]));
  return { N, L, base, dep, cuc, porta, libero };
}
// '' se gli arredi vanno bene, altrimenti il motivo
function controllaArredi(model, arr, max) {
  const P0 = pianta(model, {}); if (!P0) return 'Modello sconosciuto.';
  if (!arr || typeof arr !== 'object' || Array.isArray(arr)) return 'Arredi non validi.';
  const keys = Object.keys(arr); if (keys.length > max) return 'Al massimo ' + max + ' arredi per casa.';
  const ok = new Set(DATI.arredi.map(a => a[0])), [px, py] = P0.porta, [dx, dy] = P0.dep;
  for (const k of keys) {
    const m = /^(\d{1,2}),(\d{1,2})$/.exec(k); if (!m) return 'Posizione non valida.';
    const x = +m[1], y = +m[2];
    if (!ok.has(arr[k])) return 'Arredo sconosciuto.';
    if (!P0.base[y] || P0.base[y][x] !== '.') return 'Lì non si può mettere niente.';
    if ((x === dx && y === dy) || (Math.abs(x - px) <= 1 && y >= py - 2)) return 'Lascia libero l\'ingresso e il deposito.';
  }
  const P = pianta(model, arr), N = P.N, vis = new Set(), q = [[px, py - 1]]; vis.add(px + ',' + (py - 1));
  while (q.length) { const [x, y] = q.shift(); for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const u = x + a, v = y + b, k = u + ',' + v; if (u < 0 || v < 0 || u >= N || v >= N || vis.has(k) || !P.libero(u, v)) continue; vis.add(k); q.push([u, v]); } }
  if (!vis.has(dx + ',' + dy)) return 'Così il deposito non si raggiunge più.';
  const [cx, cy] = P.cuc; let pet = false;
  for (let b = -1; b <= 1; b++) for (let a = -1; a <= 1; a++) if (vis.has((cx + a) + ',' + (cy + b))) pet = true;
  if (!pet) return 'Così il pet non arriva più alla sua cuccia.';
  return '';
}

// quanto costa passare dagli arredi vecchi a quelli nuovi: si pagano solo i pezzi in più di ogni tipo (spostarli è gratis)
function costoArredi(vecchi, nuovi, pct) {
  const conta = a => { const n = {}; for (const k in a || {}) n[a[k]] = (n[a[k]] || 0) + 1; return n; };
  const v = conta(vecchi), w = conta(nuovi); let t = 0;
  for (const c in w) t += Math.max(0, w[c] - (v[c] || 0)) * Math.round((DATI.listino.arredi[c] || 10) * pct / 100);
  return t;
}
// ======================= codice nel gioco =======================
// Gira nella pagina del gioco: definisce il Borgo e le case come zone del gioco, disegna arredi e pet, mostra i pannelli.
// Tutto quello che conta (chi possiede cosa, il deposito, le statistiche del pet) lo decide il server.
function nelGioco(ID, CFG) {
  const ZB = 'in_vxborgo', ZC = 'in_vxcasa_';
  const opz = f => { try { return f(); } catch (e) { return undefined; } };
  // nomi del gioco che il plugin usa: se un aggiornamento ne toglie uno, le case si spengono con un avviso invece di rompere il gioco
  const USA = { Z: () => Z, NPCS: () => NPCS, load: () => load, irisGo: () => irisGo, act: () => act, tile: () => tile, genInterior: () => genInterior,
    genTown: () => genTown, zd: () => zd, po: () => po, box: () => box, PX: () => PX, PY: () => PY, msg: () => msg, flt: () => flt, toWorld: () => toWorld,
    nearFree: () => nearFree, scl: () => scl, save: () => save, fmt: () => fmt, iname: () => iname, cv: () => cv, lights: () => lights, WK: () => WK, music: () => music };
  const mancanti = Object.keys(USA).filter(k => { try { return USA[k]() === undefined; } catch (e) { return true; } });
  const ROTTO = 'Le case non funzionano con questa versione del gioco: avvisa l\'admin del server.';
  if (mancanti.length) { console.warn('[plugin ' + ID + '] mancano: ' + mancanti.join(', ')); VXP.on(ID, 'vai', () => { opz(() => msg(ROTTO)); VXP.send(ID, 'rotto', mancanti); }); return; }

  const e2 = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const avvisa = s => opz(() => msg(s));
  const suono = (f, d, tp) => opz(() => tone(f, d || .08, tp || 'triangle'));
  const collegato = () => !!(NET.ok && NET.ws && NET.ws.readyState === 1);
  const LS = { get(k, d) { try { const v = localStorage.getItem('vxp_casa_' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem('vxp_casa_' + k, JSON.stringify(v)); } catch (e) {} } };
  const chiaveMia = () => LS.get('chiave_' + String(NET.name || '').toLowerCase(), '');

  let IO = null;            // { casa, mia } la casa di chi gioca, se ce l'ha
  const CASE = {};          // hid → casa vista dal server
  const PET = {};           // hid → stato del pet dal server
  let DEP = null;           // il mio deposito { items, oro, cap }
  const PEND = {};          // oggetti in viaggio verso il deposito: u → { it, t }
  let pendOro = 0;
  let BORGO = [];           // le case del borgo
  let pan = null, wid = null, EDIT = null, ultimoId = null;

  // ---------- personaggi ----------
  NPCS.vxp_custode = { n: CFG.custode, c: '#4a6a3a', hat: '#8a5a2a', ln: ['Benvenuto nel Borgo!'] };
  NPCS.vxpet = { n: 'Pet', c: '#888', ln: ['…'] };
  // dalla 7.3 il gioco disegna ogni personaggio con una descrizione in NPS: senza, il custode avrebbe un aspetto a caso
  opz(() => { if (typeof NPS === 'object' && !NPS.vxp_custode) NPS.vxp_custode = 'b|short|stubble|cap|none|none|idle|n'; });

  // ---------- modelli dei pet (rivolti verso +x; [x, y, z, larghezza, profondità, altezza, colore]) ----------
  const scuro = (c, k) => { const n = parseInt(c.slice(1), 16), f = v => Math.max(0, Math.min(255, Math.round(v * k))); return '#' + [n >> 16, (n >> 8) & 255, n & 255].map(v => f(v).toString(16).padStart(2, '0')).join(''); };
  const zampe = (c, x0, x1, y0, y1, h) => [[x0, y0, 0, .07, .07, h, c], [x0, y1, 0, .07, .07, h, c], [x1, y0, 0, .07, .07, h, c], [x1, y1, 0, .07, .07, h, c]];
  const occhi = (x, y0, y1, z, c) => [[x, y0, z, .03, .04, 2.5, c || '#111'], [x, y1, z, .03, .04, 2.5, c || '#111']];
  const FORME = {
    cane: c => { const d = scuro(c, .7); return [[-.24, -.12, 5, .46, .24, 8, c], [.16, -.12, 9, .22, .24, 9, c], [.36, -.06, 10, .08, .12, 4, scuro(c, 1.15)], [.43, -.03, 13, .03, .06, 2, '#111'],
      ...occhi(.37, -.1, .06, 15), [.16, -.14, 17, .07, .06, 6, d], [.16, .08, 17, .07, .06, 6, d], ...zampe(c, -.22, .1, -.1, .04, 5), [-.36, -.03, 11, .12, .05, 4, c]]; },
    gatto: c => { const d = scuro(c, .75); return [[-.2, -.1, 4, .36, .2, 7, c], [.12, -.11, 8, .2, .22, 8, c], [.14, -.1, 16, .06, .05, 4, d], [.14, .06, 16, .06, .05, 4, d],
      ...occhi(.31, -.08, .04, 12, '#3a8a3a'), [.32, -.02, 10, .02, .04, 1.5, '#e08a8a'], ...zampe(c, -.18, .06, -.08, .03, 4), [-.27, -.02, 8, .06, .05, 11, c]]; },
    coniglio: c => [[-.16, -.12, 0, .3, .24, 10, c], [.1, -.1, 6, .18, .2, 9, c], [.12, -.08, 15, .05, .05, 11, c], [.12, .03, 15, .05, .05, 11, c], [.13, -.07, 17, .02, .03, 7, '#f0b0b8'],
      ...occhi(.27, -.08, .04, 11), [.28, -.02, 9, .02, .04, 1.5, '#e08a8a'], [-.21, -.03, 4, .06, .06, 5, '#ffffff']],
    volpe: c => { const d = '#2a2020'; return [[-.22, -.1, 5, .42, .2, 7, c], [.14, -.11, 8, .2, .22, 8, c], [.32, -.05, 8, .1, .1, 4, '#f4f0e8'], [.41, -.02, 10, .03, .04, 2, '#111'],
      ...occhi(.33, -.09, .05, 13), [.15, -.11, 16, .06, .05, 6, c], [.15, .06, 16, .06, .05, 6, c], [.1, -.07, 5, .06, .14, 6, '#f4f0e8'], ...zampe(d, -.2, .08, -.09, .03, 5),
      [-.4, -.06, 8, .2, .12, 6, c], [-.48, -.05, 9, .08, .1, 5, '#f4f0e8']]; },
    pinguino: c => [[-.12, -.12, 1, .24, .24, 18, c], [.11, -.08, 3, .03, .16, 12, '#f4f4f4'], [.13, -.03, 12, .08, .06, 2.5, '#f0a020'], ...occhi(.12, -.07, .04, 15, '#ffffff'),
      [-.02, -.1, 0, .14, .08, 1.5, '#f0a020'], [-.02, .03, 0, .14, .08, 1.5, '#f0a020'], [-.06, -.16, 6, .12, .04, 9, c], [-.06, .12, 6, .12, .04, 9, c]],
    gufo: c => [[-.13, -.13, 0, .26, .26, 16, c], [.12, -.09, 2, .02, .18, 9, scuro(c, 1.25)], [.13, -.1, 10, .02, .08, 5, '#ffd84a'], [.13, .02, 10, .02, .08, 5, '#ffd84a'],
      [.15, -.07, 11, .01, .04, 3, '#111'], [.15, .04, 11, .01, .04, 3, '#111'], [.14, -.02, 8, .04, .04, 2.5, '#d0902a'], [-.02, -.12, 16, .06, .05, 4, c], [-.02, .07, 16, .06, .05, 4, c]],
    tartaruga: c => [[-.2, -.16, 2, .38, .32, 6, c], [-.14, -.1, 8, .26, .2, 3, scuro(c, .75)], [.18, -.05, 3, .12, .1, 5, '#8ab06a'], ...occhi(.29, -.04, .02, 6),
      ...zampe('#8ab06a', -.18, .1, -.18, .12, 3), [-.26, -.02, 3, .06, .04, 2, '#8ab06a']],
    draghetto: c => { const d = scuro(c, .65); return [[-.22, -.11, 5, .42, .22, 9, c], [.07, -.06, 6, .1, .12, 7, '#f0d070'], [.14, -.1, 10, .22, .2, 9, c], [.35, -.06, 11, .06, .12, 4, c],
      ...occhi(.33, -.08, .04, 16, '#ffd84a'), [.16, -.08, 19, .04, .04, 5, '#f4f0e0'], [.16, .04, 19, .04, .04, 5, '#f4f0e0'], ...zampe(d, -.2, .06, -.09, .02, 5),
      [-.1, -.26, 13, .22, .14, 2, d], [-.1, .12, 13, .22, .14, 2, d], [-.42, -.03, 9, .22, .06, 4, c], [-.48, -.05, 11, .07, .1, 3, d], [-.1, -.02, 14, .05, .04, 3, d], [-.02, -.02, 14, .05, .04, 3, d]]; },
    maialino: c => [[-.24, -.13, 4, .44, .26, 10, c], [.16, -.11, 7, .18, .22, 9, c], [.33, -.06, 8, .05, .12, 5, scuro(c, .85)], [.37, -.04, 10, .01, .03, 1.5, '#5a3030'], [.37, .01, 10, .01, .03, 1.5, '#5a3030'],
      ...occhi(.32, -.09, .05, 13), [.17, -.12, 16, .07, .05, 3, scuro(c, .9)], [.17, .07, 16, .07, .05, 3, scuro(c, .9)], ...zampe(scuro(c, .85), -.2, .1, -.11, .05, 4), [-.3, -.02, 10, .06, .04, 4, c]],
    pulcino: c => [[-.1, -.1, 0, .2, .2, 9, c], [-.02, -.08, 9, .14, .16, 7, c], [.12, -.02, 12, .06, .04, 2, '#f08a20'], ...occhi(.12, -.06, .03, 14), [-.13, -.04, 5, .05, .08, 3, scuro(c, .9)], [0, -.06, 0, .04, .04, 1, '#f08a20'], [0, .02, 0, .04, .04, 1, '#f08a20']]
  };
  const TESTA = { cane: [.2, -.02, 18], gatto: [.16, -.02, 16], coniglio: [.14, -.02, 15], volpe: [.18, -.02, 16], pinguino: [-.02, -.02, 19], gufo: [-.02, -.02, 16],
    tartaruga: [.2, 0, 8], draghetto: [.18, -.02, 19], maialino: [.2, -.02, 16], pulcino: [0, -.02, 16] };
  function modelloPet(p) {
    const sp = DATI.specie[p.specie] ? p.specie : 'cane', col = (DATI.specie[sp].c[p.colore | 0] || DATI.specie[sp].c[0])[1];
    let L = FORME[sp](col);
    const tt = TESTA[sp];
    if (p.lv >= 10) L.push([tt[0] - .04, tt[1] + .07, tt[2] - 1, .07, .07, 3, '#e04a6a'], [tt[0] - .02, tt[1] + .13, tt[2] - 1, .04, .04, 3, '#e04a6a']);
    if (p.lv >= 20) L.push([tt[0] - .06, tt[1] - .04, tt[2], .12, .12, 3, '#d4af37'], [tt[0] - .03, tt[1] - .01, tt[2] + 3, .06, .06, 2, '#ffe680']);
    L = scl(L, 1.45 + Math.min(30, p.lv | 0) * .015);
    if (p.dorme) L = L.map(b => [b[0], b[1], b[2] * .55 + 5, b[3], b[4], b[5] * .65, b[6]]);
    return L;
  }

  // ---------- zone: il Borgo e le case ----------
  function defBorgo() {
    const B = DATI.borgo, po = [];
    BORGO.slice(0, B.porte.length).forEach((c, i) => { const [x, y] = B.porte[i]; po.push([x, y, ZC + c.hid, (c.mia ? 'La tua casa' : c.nome ? c.nome + ' · ' + c.owner : 'Casa di ' + c.owner) + (c.aperta || c.mia ? '' : ' (chiusa)')]); });
    const z = Z[ZB] || (Z[ZB] = {});
    Object.assign(z, { n: CFG.nomeBorgo, lv: 0, N: B.lay.length, bg: '#16241a', mus: 'town', int: 1, fl: '#5f8f3f', fl2: '#588a3a', wall: '#3f6a2f',
      np: [['vxp_custode', B.custode[0], B.custode[1]]], lay: B.lay, po, out: 'town', pt: 'petal', vxb: 1 });
  }
  defBorgo();
  function defCasa(d) {
    const P0 = pianta(d.model, d.arr); if (!P0) return null;
    const k = ZC + d.hid, mu = DATI.muri[d.muro] || DATI.muri[0], pv = DATI.pavimenti[d.pav] || DATI.pavimenti[0];
    const z = Z[k] || (Z[k] = {});
    for (const q of Object.keys(z)) delete z[q];
    Object.assign(z, { n: d.nome || ('Casa di ' + d.owner), lv: 0, N: P0.N, bg: '#141820', mus: d.mus || 'inter', int: 1, fl: pv[1], fl2: pv[2], wall: mu[1], np: [],
      lay: P0.L.map(r => r.join('')), out: ZB, vx: d, P0,
      ex: [{ k: 'stash', n: d.mia ? 'Il tuo deposito' : 'Deposito di ' + d.owner + ' (chiuso)', px: P0.dep[0] + .5, py: P0.dep[1] + .5, vxdep: 1 }] });
    CASE[d.hid] = d; if (d.pet) PET[d.hid] = d.pet;
    return k;
  }
  // una casa che il gioco chiede prima che il server l'abbia descritta (non dovrebbe succedere): un segnaposto
  const zd0 = zd;
  zd = function (k) {
    if (typeof k === 'string' && k.startsWith(ZC) && !Z[k]) defCasa({ hid: +k.slice(ZC.length) || 0, owner: '?', nome: 'Casa', model: 'casetta', muro: 0, pav: 0, mus: 'inter', arr: {}, pet: null, mia: false });
    return zd0.apply(this, arguments);
  };
  // dopo che il gioco ha costruito la casa: tappeti calpestabili e il pet
  const genInterior0 = genInterior;
  genInterior = function (z) {
    const sp = genInterior0.apply(this, arguments);
    if (z && z.vx) try {
      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (CAMMINA.has(DEC[y][x])) M[y][x] = 0;
      const p = PET[z.vx.hid]; if (p) ents.push(entPet(z, p));
    } catch (e) { console.error('[plugin ' + ID + ']', e); }
    return sp;
  };
  function postoPet(z, dorme) {
    const [cx, cy] = z.P0.cuc;
    if (dorme) return [cx + .5, cy + .5];
    for (const [a, b] of [[1, 0], [0, 1], [1, 1], [-1, 0], [0, -1], [1, -1], [-1, 1], [-1, -1]]) { const x = cx + a, y = cy + b; if (M[y] && M[y][x] === 0) return [x + .5, y + .5]; }
    const f = nearFree(cx, cy); return [f[0] + .5, f[1] + .5];
  }
  function entPet(z, p) {
    const [px, py] = postoPet(z, p.dorme);
    return { k: 'npc', nid: 'vxpet', n: p.nome + ' · liv ' + p.lv, px, py, role: '', fl: 0, m: modelloPet(p), wd: p.dorme ? 0 : 1, wg: 1, wt: 1 + Math.random() * 2, path: [], vxpet: 1, hid: z.vx.hid, dorme: !!p.dorme };
  }
  const petQui = () => ents.find(e => e.vxpet);
  function aggiornaPet(hid) {
    const p = PET[hid], e = petQui(); if (!p || !e || e.hid !== hid || !ZZ || !ZZ.vx) return;
    e.n = p.nome + ' · liv ' + p.lv; e.m = modelloPet(p);
    if (!!p.dorme !== e.dorme) { e.dorme = !!p.dorme; e.wd = p.dorme ? 0 : 1; e.path = []; const [x, y] = postoPet(ZZ, p.dorme); e.px = x; e.py = y; }
  }

  // ---------- la porta del Borgo in città ----------
  if (CFG.portaInCitta) {
    const genTown0 = genTown;
    genTown = function () {
      const sp = genTown0.apply(this, arguments);
      try {
        let [x, y] = CFG.posPorta;
        if (!(M[y] && WK(M[y][x]))) [x, y] = nearFree(x, y);
        ents.push(Object.assign(po(x, y, ZB, { n: CFG.nomeBorgo }), { col: '#8fe07a' }));
      } catch (e) { console.error('[plugin ' + ID + ']', e); }
      return sp;
    };
  }

  // ---------- disegno: arredi del plugin, muri davanti bassi, cursore per arredare ----------
  const DIS = {
    '⌂': (x, y) => { box(x + .1, y + .1, 0, .8, .8, 4, '#7a4a2a'); box(x + .16, y + .16, 4, .68, .68, 2, '#c0504a'); box(x + .1, y + .1, 4, .8, .1, 9, '#6a3a20'); box(x + .1, y + .1, 4, .1, .8, 9, '#6a3a20'); },
    '◍': (x, y) => { box(x + .3, y + .3, 0, .4, .4, 3, '#c0392b'); box(x + .34, y + .34, 3, .32, .32, 1, '#b8864a'); },
    '▤': (x, y) => { box(x + .02, y + .02, -.4, .96, .96, .5, '#9a2a32'); box(x + .12, y + .12, -.3, .76, .76, .5, '#c8a040'); box(x + .18, y + .18, -.2, .64, .64, .5, '#9a2a32'); },
    '▥': (x, y) => { box(x + .02, y + .02, -.4, .96, .96, .5, '#2a4a8a'); box(x + .12, y + .12, -.3, .76, .76, .5, '#e8e0c8'); box(x + .18, y + .18, -.2, .64, .64, .5, '#2a4a8a'); },
    '◫': (x, y) => { box(x + .08, y + .18, 0, .84, .64, 7, '#5a3a22'); box(x + .1, y + .2, 7, .8, .6, 12, '#5ab8e8', 1.05); const s = Math.sin(t * 1.5 + x);
      box(x + .4 + s * .25, y + .45, 11, .12, .06, 3, '#ff8a2a', 1.2); box(x + .3 - s * .2, y + .6, 14, .1, .05, 2, '#ffd84a', 1.2); box(x + .1, y + .2, 19, .8, .6, 1, '#3a2a1a'); }
  };
  const pav = c => c === 0 || c === 6 || c === 8;
  // nelle case non quadrate (torre, tenda, igloo) i muri che non hanno pavimento dietro di sé verso chi guarda restano bassi, come quelli in fondo alla stanza
  const muroDavanti = (x, y) => !((M[y] && pav(M[y][x + 1])) || (M[y + 1] && pav(M[y + 1][x])) || (M[y + 1] && pav(M[y + 1][x + 1])));
  const tile0 = tile;
  tile = function (x, y) {
    if (!ZZ || !(ZZ.vx || ZZ.vxb)) return tile0.apply(this, arguments);
    try {
      const c = M[y][x], ch = DEC[y][x];
      if (ch && DIS[ch] && (c === 0 || c === 6)) { if (!FC) opz(() => floor(x, y, 0, hh(x, y))); DIS[ch](x, y); return; }
      if (c === 1 && ZZ.vx && x < N - 1 && y < N - 1 && muroDavanti(x, y)) { box(x, y, 0, 1, 1, 6, ZZ.wall, .9 + opz(() => hh(x, y)) * .08); return; }
    } catch (e) {}
    return tile0.apply(this, arguments);
  };
  // dalla 7.3.1 negli interni i simboli dei dungeon (cifre e !%?<>) diventano mobili diversi: nelle case restano
  // gli arredi di prima (colonne della villa, cristalli, pupazzi di neve dell'igloo…)
  opz(() => {
    if (typeof DUP52 !== 'string' || typeof dec !== 'function') return;
    const dec0 = dec;
    dec = function (x, y, c) {
      if (!(ZZ && ZZ.vx && ZZ.int && DUP52.includes(c))) return dec0.apply(this, arguments);
      const z = ZZ, i = z.int; z.int = 0;
      try { return dec0.apply(this, arguments); } finally { z.int = i; }
    };
  });
  let mouse = null;
  addEventListener('pointermove', e => { mouse = [e.clientX, e.clientY]; }, true);
  function sottoMouse() { if (!mouse) return null; const [mx, my] = toWorld(mouse[0], mouse[1]); const x = Math.floor((mx / 32 + my / 16) / 2), y = Math.floor((my / 16 - mx / 32) / 2); return [x, y]; }
  // dalla 7.4 il gioco disegna le caselle ferme una volta sola («rendering veloce») senza passare da tile():
  // nelle case sparivano tappeti, acquario e cuccia, e i muri davanti restavano alti. Nel Borgo e nelle case
  // si torna al disegno classico (sono zone piccole), fuori si rimette com'era.
  let lento = 0;
  function disegnoClassico() {
    if (typeof FAST !== 'object' || !FAST) return;
    if (ZZ && (ZZ.vx || ZZ.vxb)) { if (!lento && FAST.ok) { FAST.ok = 0; lento = 1; } }
    else if (lento) { FAST.ok = 1; lento = 0; }
  }
  const lights0 = lights;
  lights = function () {
    opz(disegnoClassico);
    const r = lights0.apply(this, arguments);
    if (EDIT && Zk === EDIT.zk) try {
      const q = sottoMouse(); if (q) {
        const [x, y] = q, ok = !motivoNo(x, y);
        g.save(); g.setTransform(S * DPR, 0, 0, S * DPR, (W / 2 - camX * S) * DPR, (H / 2 - camY * S) * DPR);
        g.fillStyle = ok ? 'rgba(120,255,140,.35)' : 'rgba(255,90,90,.3)'; g.strokeStyle = ok ? '#8f8' : '#f88'; g.lineWidth = 1.5;
        g.beginPath(); g.moveTo(PX(x, y), PY(x, y, 0)); g.lineTo(PX(x + 1, y), PY(x + 1, y, 0)); g.lineTo(PX(x + 1, y + 1), PY(x + 1, y + 1, 0)); g.lineTo(PX(x, y + 1), PY(x, y + 1, 0)); g.closePath(); g.fill(); g.stroke();
        g.restore();
      }
    } catch (e) { opz(() => g.restore()); }
    return r;
  };

  // ---------- interazioni: pet, deposito, custode, porte delle case ----------
  const act0 = act;
  act = function (e) {
    try {
      if (e && e.vxpet) { apriPet(e.hid); return; }
      if (e && e.vxdep) { apriDeposito(); return; }
      if (e && e.k === 'npc' && e.nid === 'vxp_custode') { suono(520); apriBorgo(); return; }
      if (e && e.k === 'po' && typeof e.to === 'string' && e.to.startsWith(ZC)) { visita(+e.to.slice(ZC.length)); return; }
    } catch (err) { console.error('[plugin ' + ID + ']', err); }
    return act0.apply(this, arguments);
  };
  function impegnato() {
    if (!P || !opz(() => started)) return 'Il gioco non è ancora pronto.';
    if (!collegato()) return 'Non sei collegato al server.';
    if (opz(() => MODE) === 'dim') return 'Da Voxelia Dimension non si torna a casa.';
    if (opz(() => PM) === 'trade') return 'Stai facendo uno scambio: finiscilo prima.';
    if (opz(() => IRB)) return 'Stai già cambiando zona.';
    if (opz(() => NAV)) return 'Prima scendi dalla nave.';
    if (EDIT) return 'Finisci prima di arredare.';
    if ((CFG.vietateDa || []).some(z => Zk === z || String(Zk).split('@')[0] === z)) return 'Da qui non puoi andare a casa.';
    return '';
  }
  function viaggia(k, da) {
    opz(() => whoosh());
    const v = () => { try { load(k, da); } catch (e) { console.error('[plugin ' + ID + ']', e); try { load('town'); } catch (e2) {} } };
    try { irisGo(v); } catch (e) { v(); }
  }
  function visita(hid) { const no = impegnato(); if (no) { avvisa(no); return; } VXP.send(ID, 'visita', { hid }); }

  // ---------- icone in pixel art (stessa griglia 16×16 e stessa cottura delle icone del gioco) ----------
  const G = '#f5b942', Gs = '#c98a1a', LEGNO = '#a07040', NERO = '#1a1414';
  const fetta = (a0, a1, col) => ['p', [[8, 8]].concat(Array.from({ length: 7 }, (_, i) => { const a = a0 + (a1 - a0) * i / 6; return [8 + Math.cos(a) * 6.4, 8 + Math.sin(a) * 6.4]; })), col];
  const MIE = {
    vx_casa: [['p', [[11, 2.4], [12.8, 2.4], [12.8, 6], [11, 5]], '#8a4a3a'], ['p', [[3, 7.4], [13, 7.4], [13, 14.6], [3, 14.6]], '#e8d4a8'], ['p', [[.8, 8.2], [8, 1.6], [15.2, 8.2]], '#c0504a'],
      ['p', [[6.6, 9.8], [9.4, 9.8], [9.4, 14.6], [6.6, 14.6]], '#8a5a2a'], ['p', [[10.4, 9.4], [12, 9.4], [12, 11], [10.4, 11]], '#8ac8f0'], ['c', 8.8, 12.2, .45, G]],
    vx_borgo: [['p', [[1.6, 6.6], [8, 6.6], [8, 13], [1.6, 13]], '#d8c8a0'], ['p', [[.4, 7.2], [4.8, 2.4], [9.2, 7.2]], '#4a7ad8'], ['p', [[3.6, 9], [5.4, 9], [5.4, 13], [3.6, 13]], '#6a4a2a'],
      ['p', [[7, 8.8], [14.8, 8.8], [14.8, 14.8], [7, 14.8]], '#e8d4a8'], ['p', [[6, 9.4], [10.9, 4.4], [15.8, 9.4]], '#c0504a'], ['p', [[9.8, 11], [12, 11], [12, 14.8], [9.8, 14.8]], '#8a5a2a']],
    vx_zampa: [['c', 8, 10.8, 3.4, '#f0a0b8'], ['c', 3.4, 6.8, 1.7, '#f0a0b8'], ['c', 6.3, 3.6, 1.7, '#f0a0b8'], ['c', 9.7, 3.6, 1.7, '#f0a0b8'], ['c', 12.6, 6.8, 1.7, '#f0a0b8']],
    vx_ciotola: [['c', 5.4, 7.4, 2, '#b8783a'], ['c', 8.4, 6.4, 2.2, '#d0904a'], ['c', 11, 7.6, 1.8, '#b8783a'], ['p', [[1.4, 8.4], [14.6, 8.4], [12.2, 14], [3.8, 14]], '#c0504a'], ['s', 1.6, 8.6, 14.4, 8.6, .55, '#e8807a']],
    vx_palla: [['c', 8, 8, 6.2, '#4a7ad8'], fetta(-Math.PI / 2, 0, '#e8484f'), fetta(Math.PI / 2, Math.PI, '#ffd84a'), ['c', 8, 8, 1.2, '#ffffff'], ['c', 5.2, 5, .9, '#ffffff']],
    vx_bagno: [['c', 6, 9.8, 4.2, '#8ad0f0'], ['c', 11.6, 5, 2.8, '#a8e0f8'], ['c', 12.4, 12.2, 1.7, '#8ad0f0'], ['c', 4.4, 8.2, 1.1, '#ffffff'], ['c', 10.8, 4.2, .8, '#ffffff']],
    vx_tocco: [['p', [[4, 7.4], [12, 7.4], [12, 11.2], [8, 12.8], [4, 11.2]], '#2a2a3a'], ['p', [[.8, 6], [8, 2.6], [15.2, 6], [8, 9.4]], '#3e3e52'], ['s', 13.6, 6.2, 13.6, 11.4, .4, G], ['c', 13.6, 12, .9, G]],
    vx_biscotto: [['c', 8, 8.4, 6.2, '#d8a050'], ['c', 13.8, 2.8, 2.6, null], ['c', 5.4, 6.4, .9, '#5a3420'], ['c', 9.6, 5.6, .9, '#5a3420'], ['c', 8.6, 10, .9, '#5a3420'], ['c', 4.8, 10.8, .9, '#5a3420'], ['c', 11.8, 10.2, .8, '#5a3420']],
    vx_spazzola: [['s', 2, 14, 6.6, 9.4, 1, LEGNO], ['p', [[5.6, 7], [11, 1.6], [14.4, 5], [9, 10.4]], '#c0504a'], ['s', 8.8, 11.4, 15, 5.2, .5, '#f0e0c0'], ['s', 10.2, 12.4, 15.4, 7.2, .3, '#f0e0c0']],
    vx_fulmine: [['p', [[9.6, .8], [3, 9], [7.4, 9], [5.8, 15.2], [13, 6.4], [8.4, 6.4]], '#ffd84a']],
    vx_chiave: [['o', 4.6, 8, 2.8, 1.5, G], ['s', 7.2, 8, 14.6, 8, .8, G], ['s', 11.8, 8, 11.8, 11, .6, G], ['s', 14, 8, 14, 10.4, .6, G]],
    vx_lucchetto: [['o', 8, 6.4, 3.4, 1.4, '#b8c2ce'], ['p', [[3, 7.4], [13, 7.4], [13, 14.6], [3, 14.6]], G], ['c', 8, 10.2, 1.1, '#3a2a10'], ['s', 8, 10.6, 8, 12.8, .45, '#3a2a10']],
    vx_aperto: [['o', 11.6, 4.6, 3.2, 1.4, '#b8c2ce'], ['p', [[12.6, 4.8], [16, 4.8], [16, 7.3], [12.6, 7.3]], null], ['p', [[1.6, 7.4], [11.6, 7.4], [11.6, 14.6], [1.6, 14.6]], G], ['c', 6.6, 10.2, 1.1, '#3a2a10'], ['s', 6.6, 10.6, 6.6, 12.8, .45, '#3a2a10']],
    vx_porta: [['p', [[3.4, 1.4], [12.6, 1.4], [12.6, 14.8], [3.4, 14.8]], '#8a5a2a'], ['p', [[5, 3.2], [11, 3.2], [11, 7.2], [5, 7.2]], '#a8703a'], ['p', [[5, 8.8], [11, 8.8], [11, 13.2], [5, 13.2]], '#a8703a'], ['c', 10.2, 8, .8, G]],
    vx_sedia: [['p', [[3.4, 1.4], [5.8, 1.4], [5.8, 14.8], [3.4, 14.8]], '#a8703a'], ['p', [[3.4, 7.4], [12.8, 7.4], [12.8, 9.6], [3.4, 9.6]], '#c8925a'], ['s', 11.8, 9.6, 11.8, 14.8, .8, '#8a5a2a'], ['s', 4.6, 3.6, 4.6, 6, .4, '#c8925a']],
    vx_martello: [['s', 2.6, 14.2, 9.6, 7.2, 1, LEGNO], ['p', [[6.2, 4.4], [10.4, .4], [15.2, 5.2], [11.2, 9.2]], '#9aa4b8'], ['s', 10.4, 2.6, 13.2, 5.4, .3, '#d8dde6']],
    vx_carro: [['p', [[1, 3.6], [10.4, 3.6], [10.4, 11.4], [1, 11.4]], '#c8925a'], ['s', 1.4, 6.6, 10, 6.6, .3, '#8a5a2a'], ['p', [[10.4, 6.2], [13.2, 6.2], [15.2, 8.8], [15.2, 11.4], [10.4, 11.4]], '#4a7ad8'],
      ['p', [[11.4, 7], [12.8, 7], [14, 8.8], [11.4, 8.8]], '#a8d8f8'], ['c', 4.2, 12.4, 1.9, '#2a2a32'], ['c', 12, 12.4, 1.9, '#2a2a32'], ['c', 4.2, 12.4, .6, '#9aa4b8'], ['c', 12, 12.4, .6, '#9aa4b8']],
    vx_gomma: [['p', [[1.6, 10.2], [8.4, 3.4], [14.4, 9.4], [7.6, 16]], '#f08aa0'], ['p', [[1.6, 10.2], [4.8, 7], [10.8, 13], [7.6, 16]], '#8ac8f0']],
    vx_annulla: [['o', 8.4, 8.8, 5, 1.6, '#9aa4b8'], ['p', [[8.4, 1], [8.4, 3.8], [16, 3.8], [16, 8.6], [8.4, 8.6]], null], ['p', [[3.4, 3.4], [9.6, 1], [8.6, 6.6]], '#9aa4b8']],
    vx_cartello: [['s', 8, 9, 8, 15, .9, LEGNO], ['p', [[1.6, 2], [14.4, 2], [14.4, 9.6], [1.6, 9.6]], '#c8925a'], ['s', 3.6, 4.6, 12.4, 4.6, .35, '#6a4422'], ['s', 3.6, 7, 10, 7, .35, '#6a4422']],
    vx_musica: [['c', 5, 12.2, 2.5, '#c8a8ff'], ['c', 11.6, 10.6, 2.5, '#c8a8ff'], ['p', [[6.4, 12.2], [7.6, 12.2], [7.6, 4.4], [6.4, 4.8]], '#c8a8ff'], ['p', [[13, 10.6], [14.2, 10.6], [14.2, 2.4], [13, 2.8]], '#c8a8ff'], ['p', [[6.4, 4.8], [14.2, 2.2], [14.2, 4.8], [6.4, 7.4]], '#a07ae8']],
    vx_mappa: [['p', [[1.4, 3], [5.4, 1.4], [10.6, 3], [14.6, 1.4], [14.6, 13], [10.6, 14.6], [5.4, 13], [1.4, 14.6]], '#f0e2b8'], ['s', 5.4, 1.6, 5.4, 12.8, .3, '#c8a870'], ['s', 10.6, 3.2, 10.6, 14.4, .3, '#c8a870'],
      ['s', 3, 10, 7.6, 7, .35, '#c0504a'], ['s', 7.6, 7, 12.6, 9.2, .35, '#c0504a'], ['c', 12.6, 9.2, 1, '#c0504a']]
  };
  // teste dei pet, nel colore scelto
  const TESTE = {
    cane: c => [['c', 8, 8.8, 5.4, c], ['p', [[2.4, 3], [5.4, 3.6], [4.8, 10.4], [1.4, 9.2]], scuro(c, .7)], ['p', [[13.6, 3], [10.6, 3.6], [11.2, 10.4], [14.6, 9.2]], scuro(c, .7)],
      ['c', 8, 11.4, 2.8, '#f0e2c8'], ['c', 8, 10.2, 1.2, NERO], ['c', 5.9, 7.4, .9, NERO], ['c', 10.1, 7.4, .9, NERO], ['c', 8, 13.6, .8, '#e8606a']],
    gatto: c => [['p', [[2.2, 1.2], [7, 4.4], [2.8, 8]], c], ['p', [[13.8, 1.2], [9, 4.4], [13.2, 8]], c], ['c', 8, 9.2, 5.6, c], ['p', [[3.4, 3.2], [5.4, 4.8], [3.6, 6]], '#f0a0b0'], ['p', [[12.6, 3.2], [10.6, 4.8], [12.4, 6]], '#f0a0b0'],
      ['c', 5.7, 8.6, 1.1, '#5ac85a'], ['c', 10.3, 8.6, 1.1, '#5ac85a'], ['s', 5.7, 7.8, 5.7, 9.4, .2, NERO], ['s', 10.3, 7.8, 10.3, 9.4, .2, NERO], ['p', [[7.1, 10.8], [8.9, 10.8], [8, 11.9]], '#f08a9a'],
      ['s', .6, 11, 4, 11.6, .2, '#ffffff'], ['s', 15.4, 11, 12, 11.6, .2, '#ffffff']],
    coniglio: c => [['p', [[4.2, .4], [6.6, .4], [7, 7], [4.6, 7]], c], ['p', [[11.8, .4], [9.4, .4], [9, 7], [11.4, 7]], c], ['s', 5.6, 1.8, 5.8, 5.8, .45, '#f0b0b8'], ['s', 10.4, 1.8, 10.2, 5.8, .45, '#f0b0b8'],
      ['c', 8, 10.2, 5, c], ['c', 6, 9.4, .9, NERO], ['c', 10, 9.4, .9, NERO], ['p', [[7.2, 11], [8.8, 11], [8, 12]], '#f08a9a'], ['p', [[7.3, 12.4], [8.7, 12.4], [8.7, 13.6], [7.3, 13.6]], '#ffffff']],
    volpe: c => [['p', [[1.6, .8], [6.8, 4.4], [3.2, 7.6]], c], ['p', [[14.4, .8], [9.2, 4.4], [12.8, 7.6]], c], ['p', [[3, 2.6], [5.4, 4.6], [3.6, 5.8]], '#2a2020'], ['p', [[13, 2.6], [10.6, 4.6], [12.4, 5.8]], '#2a2020'],
      ['c', 8, 7.6, 5, c], ['p', [[1.4, 6.4], [14.6, 6.4], [8, 15.2]], c], ['p', [[2.2, 7.6], [7.4, 10.4], [8, 14.8]], '#f4f0e8'], ['p', [[13.8, 7.6], [8.6, 10.4], [8, 14.8]], '#f4f0e8'],
      ['c', 8, 14, .9, NERO], ['c', 5.9, 7.6, .9, NERO], ['c', 10.1, 7.6, .9, NERO]],
    pinguino: c => [['c', 8, 8.4, 6.2, c], ['c', 6.2, 8.8, 2.6, '#f4f4f4'], ['c', 9.8, 8.8, 2.6, '#f4f4f4'], ['c', 8, 11.4, 2.6, '#f4f4f4'], ['c', 6.2, 8.2, .8, NERO], ['c', 9.8, 8.2, .8, NERO],
      ['p', [[6.6, 10], [9.4, 10], [8, 12.6]], '#f0a020']],
    gufo: c => [['p', [[1.6, 1], [5.8, 3.8], [2.6, 6.4]], c], ['p', [[14.4, 1], [10.2, 3.8], [13.4, 6.4]], c], ['c', 8, 9, 6, c], ['c', 5.3, 8, 2.6, '#f4ecd0'], ['c', 10.7, 8, 2.6, '#f4ecd0'],
      ['c', 5.3, 8, 1.4, '#ffb02a'], ['c', 10.7, 8, 1.4, '#ffb02a'], ['c', 5.3, 8, .6, NERO], ['c', 10.7, 8, .6, NERO], ['p', [[7.1, 9.8], [8.9, 9.8], [8, 12.2]], '#d0902a'], ['s', 4.6, 13, 11.4, 13, .4, scuro(c, .7)]],
    tartaruga: c => [['c', 13, 9.2, 2.4, '#8ab06a'], ['c', 7, 9.8, 5.6, c], ['p', [[0, 11.4], [16, 11.4], [16, 16], [0, 16]], null], ['o', 7, 9.8, 2.6, .7, scuro(c, .65)], ['s', 2, 6.6, 4.6, 8.2, .3, scuro(c, .65)], ['s', 12, 6.6, 9.4, 8.2, .3, scuro(c, .65)],
      ['p', [[1.4, 10.6], [12.6, 10.6], [12.6, 12.2], [1.4, 12.2]], '#c8b070'], ['c', 13.8, 8.6, .6, NERO], ['c', 3.6, 13, 1.3, '#8ab06a'], ['c', 10.4, 13, 1.3, '#8ab06a']],
    draghetto: c => [['s', 3.8, 1, 5.4, 5, .7, '#f4f0e0'], ['s', 12.2, 1, 10.6, 5, .7, '#f4f0e0'], ['c', 8, 8.4, 5.4, c], ['p', [[4.2, 10], [11.8, 10], [11, 14.4], [5, 14.4]], scuro(c, 1.2)],
      ['c', 6.6, 12, .55, NERO], ['c', 9.4, 12, .55, NERO], ['c', 5.6, 7.2, 1.2, '#ffd84a'], ['c', 10.4, 7.2, 1.2, '#ffd84a'], ['s', 5.6, 6.4, 5.6, 8, .2, NERO], ['s', 10.4, 6.4, 10.4, 8, .2, NERO], ['s', 1, 8, 2.8, 9, .5, scuro(c, .65)], ['s', 15, 8, 13.2, 9, .5, scuro(c, .65)]],
    maialino: c => [['p', [[2, 1.6], [6.2, 3.6], [3.2, 6.8]], scuro(c, .85)], ['p', [[14, 1.6], [9.8, 3.6], [12.8, 6.8]], scuro(c, .85)], ['c', 8, 9, 5.8, c], ['c', 8, 11, 2.6, scuro(c, .85)],
      ['c', 7, 11, .6, '#5a3030'], ['c', 9, 11, .6, '#5a3030'], ['c', 5.4, 7.4, .85, NERO], ['c', 10.6, 7.4, .85, NERO]],
    pulcino: c => [['s', 8, 1.4, 8.8, 3.8, .6, c], ['s', 8, 2, 6.8, 3.6, .5, c], ['c', 8, 9.4, 5.8, c], ['p', [[6.6, 9.6], [9.4, 9.6], [8, 11.8]], '#f08a20'], ['c', 5.8, 7.8, .9, NERO], ['c', 10.2, 7.8, .9, NERO],
      ['c', 4.4, 10.2, .9, '#f8a0a0'], ['c', 11.6, 10.2, .9, '#f8a0a0']]
  };
  const ICONE = opz(() => typeof ICOS === 'object' && typeof ico === 'function' && typeof ICON === 'function');
  if (ICONE) Object.assign(ICOS, MIE);
  const ic = (n, px) => (ICONE && opz(() => ico(n, px || 16, (px || 16) > 16 ? 'vxi' : 'hi'))) || '';
  function icPet(sp, col, px) {
    const q = DATI.specie[sp]; if (!ICONE || !q || !TESTE[sp]) return '';
    const k = 'vxp_' + sp + '_' + (col | 0); if (!ICOS[k]) ICOS[k] = TESTE[sp]((q.c[col | 0] || q.c[0])[1]);
    return ic(k, px);
  }
  const ORO = n => '<span class="vgold">' + n + ' ' + ic('oro', 14) + '</span>';
  const PR = CFG.prezzi || { pct: 0, modelli: {}, colore: 0, trasloco: 50, cibo: 0 };
  const costoModello = k => PR.modelli[k] || 0, costoTrasloco = k => Math.round(costoModello(k) * PR.trasloco / 100);
  // quanto oro si può spendere: lo zaino, e per il padrone di casa anche il deposito
  const borsa = () => (P.g | 0) + (IO && IO.mia ? IO.oro | 0 : 0);
  const prezzo = (n, pre) => n > 0 ? (pre == null ? ' · ' : pre) + '<span class="vprz' + (borsa() < n ? ' vno' : '') + '">' + n + ' ' + ic('oro', 14) + '</span>' : '';

  // ---------- pannelli: si aprono nel riquadro del gioco (#pn), come il mercante o lo zaino ----------
  const CSS = document.createElement('style');
  CSS.textContent = '.vxi{vertical-align:middle;image-rendering:pixelated}#pn[data-m=vx] h3{display:flex;align-items:center;gap:6px;flex-wrap:wrap}#pn[data-m=vx] h3 .mu{margin-left:auto;font-weight:normal}' +
    '#pn[data-m=vx] h4{display:flex;align-items:center;gap:5px;margin-top:12px}' +
    '#pn[data-m=vx] button img,#vxw button img,#vxe button img{vertical-align:-3px;margin-right:3px}' +
    '#pn[data-m=vx] .vgr{display:grid;grid-template-columns:repeat(auto-fill,minmax(104px,1fr));gap:6px;margin:4px 0 8px}' +
    '#pn[data-m=vx] .vcard{background:#0003;border:1px solid #ffffff22;border-radius:6px;padding:6px 4px;cursor:pointer;text-align:center;animation:vxin .3s ease-out both}' +
    '#pn[data-m=vx] .vcard:hover{border-color:#f5b94288}#pn[data-m=vx] .vcard.on{border-color:var(--ac);box-shadow:0 0 0 1px var(--ac) inset;background:#f5b94222}' +
    '#pn[data-m=vx] .vcard b{display:block;font-size:12px}#pn[data-m=vx] .vcard canvas{display:block;margin:0 auto 4px;image-rendering:pixelated}' +
    '#pn[data-m=vx] .vsw{display:inline-block;width:24px;height:24px;border-radius:4px;border:2px solid #0006;margin:2px;cursor:pointer;vertical-align:middle;padding:0}' +
    '#pn[data-m=vx] .vsw.on{border-color:#fff;box-shadow:0 0 0 2px var(--ac)}' +
    '#pn[data-m=vx] input[type=text],#pn[data-m=vx] input[type=number]{box-sizing:border-box;padding:5px 7px;border-radius:3px;border:1px solid #f5b94288;background:#0002;color:var(--fg);font:inherit}' +
    '#pn[data-m=vx] input[type=text]{flex:1;min-width:0}' +
    '#pn[data-m=vx] .vbar{height:8px;background:#0006;border:1px solid #8886;border-radius:3px;overflow:hidden;flex:1}#pn[data-m=vx] .vbar i{display:block;height:100%}' +
    '#pn[data-m=vx] .vrow{display:flex;align-items:center;gap:8px;margin:4px 0}#pn[data-m=vx] .vrow>span:first-child{width:104px;flex:none;display:flex;align-items:center;gap:4px}' +
    '#pn[data-m=vx] .vkey{font:700 16px ui-monospace,monospace;letter-spacing:2px;background:#0003;border:1px solid #f5b94288;padding:8px;border-radius:3px;text-align:center;user-select:all}' +
    '#pn[data-m=vx] .vfondo{display:flex;justify-content:flex-end;flex-wrap:wrap;gap:2px;margin-top:10px}' +
    '#pn[data-m=vx] .vprz.vno,#vxe .vprz.vno{color:#e55}#pn[data-m=vx] .vgold{white-space:nowrap}' +
    '#pn[data-m=vx] .vpet{display:flex;align-items:center;gap:10px;margin:4px 0}#pn[data-m=vx] .vpet img{flex:none}' +
    '#vxe,#vxw{position:fixed;background:var(--pn);color:var(--fg);border:2px solid var(--ac);box-sizing:border-box;box-shadow:0 10px 40px #0009;font:13px Georgia,serif}' +
    '#vxe{z-index:16;left:50%;bottom:8px;transform:translateX(-50%);width:min(760px,calc(100vw - 24px));max-height:30vh;overflow:auto;padding:6px 10px}' +
    '#vxe .vhd{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:4px;margin-bottom:2px}#vxe .vhd b{display:flex;align-items:center;gap:5px}' +
    '#vxe button{padding:3px 8px;margin:2px}#vxe .vprz{font-size:11px;opacity:.85}' +
    '#vxw{z-index:12;left:12px;top:118px;width:min(214px,calc(100vw - 32px));padding:8px 10px;border-radius:3px}' +
    '#vxw b{display:flex;align-items:center;gap:5px;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#vxw .mu{margin:2px 0 4px}' +
    '#vxw button{padding:4px 8px;margin:2px 2px 0 0}';
  document.head.appendChild(CSS);
  // i riquadri del plugin fuori da #pn non devono far muovere l'eroe quando ci si clicca
  const ferma = el => { for (const ev of ['mousedown', 'mouseup', 'click', 'touchstart', 'touchend', 'pointerdown', 'pointerup', 'wheel']) el.addEventListener(ev, e => e.stopPropagation()); };
  const PN = () => document.getElementById('pn');
  const aperto = () => { const pe = PN(); return !!pe && pe.style.display === 'block' && pe.dataset.m === 'vx'; };
  // se il gioco ridisegna il riquadro (pn(PM)) mentre è aperto un pannello delle case, lo ridisegna il plugin
  opz(() => { const pn0 = pn; pn = function (m) { if (m === 'vx') { if (pan) disegna(); return; } return pn0.apply(this, arguments); }; });
  function chiudi() { const era = pan; pan = null; if (era && aperto()) opz(() => cl()); }
  function apri(tipo, dati) { pan = { tipo, d: dati || {}, nuovo: 1 }; disegna(); }
  function disegna() {
    if (!pan) return;
    const pe = PN(); if (!pe) return;
    if (!pan.nuovo && !aperto()) { pan = null; return; }   // il giocatore l'ha chiuso o il gioco ha aperto altro
    const inp = pe.querySelector('input:focus'), quale = inp && inp.dataset.k, sel = inp && [inp.selectionStart, inp.selectionEnd];
    const bozza = {}; if (!pan.nuovo) pe.querySelectorAll('input[data-k]').forEach(i => { bozza[i.dataset.k] = i.value; });
    pan.bozza = Object.assign(pan.bozza || {}, bozza);
    const f = { crea: hCrea, casa: hCasa, pet: hPet, dep: hDep, borgo: hBorgo }[pan.tipo];
    const nuovo = pan.nuovo; pan.nuovo = 0;
    opz(() => { PM = 'vx'; }); opz(() => { $('ztc').className = ''; }); pe.classList.remove('fishp');
    const st = pe.scrollTop;
    pe.innerHTML = f ? f(pan.d) : ''; pe.style.display = 'block'; pe.dataset.m = 'vx';
    if (nuovo) opz(() => { if (cineOK()) { pe.classList.remove('pop'); void pe.offsetWidth; pe.classList.add('pop'); } }); else pe.scrollTop = st;
    pe.querySelectorAll('input[data-k]').forEach(i => { if (pan.bozza[i.dataset.k] != null) i.value = pan.bozza[i.dataset.k]; });
    if (quale) { const i = pe.querySelector('input[data-k="' + quale + '"]'); if (i) { i.focus(); opz(() => i.setSelectionRange(sel[0], sel[1])); } }
    pe.querySelectorAll('canvas[data-pianta]').forEach(c => disegnaPianta(c, c.dataset.pianta, +c.dataset.muro, +c.dataset.pav));
    pe.querySelectorAll('[data-a]').forEach(b => { b.onclick = () => clic(b.dataset.a, b.dataset.v, b); });
    pe.querySelectorAll('select[data-a]').forEach(s => { s.onclick = null; s.onchange = () => clic(s.dataset.a, s.value, s); });
    pe.querySelectorAll('input[data-enter]').forEach(i => { i.onkeydown = e => { e.stopPropagation(); if (e.key === 'Enter') clic(i.dataset.enter, i.value, i); if (e.key === 'Escape') chiudi(); }; });
  }
  const val = k => { const pe = PN(), i = pe && aperto() && pe.querySelector('input[data-k="' + k + '"]'); return i ? i.value : (pan && pan.bozza && pan.bozza[k]) || ''; };
  const testa = (icona, ti, extra) => '<h3>' + icona + ' <span>' + ti + '</span>' + (extra ? '<span class="mu">' + extra + '</span>' : '') + '</h3>';
  const btn = (a, v, txt, o) => '<button class="' + (o && o.on ? 'on' : '') + '" data-a="' + a + '" data-v="' + e2(v) + '"' + (o && o.dis ? ' disabled' : '') + (o && o.ti ? ' title="' + e2(o.ti) + '"' : '') + '>' + txt + '</button>';
  const fondo = (...b) => '<div class="vfondo">' + b.join('') + btn('chiudi', '', 'Chiudi') + '</div>';
  const tasca = () => ic('oro', 14) + ' ' + (P.g | 0);

  // pianta vista dall'alto, per scegliere il modello
  function disegnaPianta(c, model, muro, pv) {
    const P0 = pianta(model, {}); if (!P0) return;
    const s = Math.floor(96 / P0.N), x = c.getContext('2d'); c.width = c.height = s * P0.N;
    const mu = (DATI.muri[muro] || DATI.muri[0])[1], fl = DATI.pavimenti[pv] || DATI.pavimenti[0];
    for (let y = 0; y < P0.N; y++) for (let i = 0; i < P0.N; i++) {
      const ch = P0.L[y][i]; if (ch === ' ') continue;
      x.fillStyle = ch === '#' ? mu : (i + y) & 1 ? fl[1] : fl[2]; x.fillRect(i * s, y * s, s, s);
      if (ch === '#') { x.fillStyle = '#00000033'; x.fillRect(i * s, y * s + s - 2, s, 2); }
      else if (ch === 'D') { x.fillStyle = '#ffd84a'; x.fillRect(i * s + 1, y * s + 1, s - 2, s - 2); }
      else if (ch === '⌂' || ch === '◍') { x.fillStyle = '#d0504a'; x.fillRect(i * s + 1, y * s + 1, s - 2, s - 2); }
      else if (CAMMINA.has(ch)) { x.fillStyle = '#9a2a3299'; x.fillRect(i * s, y * s, s, s); }
      else if (ch !== '.') { x.fillStyle = '#2a1e16cc'; x.fillRect(i * s + 1, y * s + 1, s - 2, s - 2); }
    }
    const [dx, dy] = P0.dep; x.fillStyle = '#b07ad8'; x.fillRect(dx * s + 1, dy * s + 1, s - 2, s - 2);
  }
  const sw = (a, i, col, on, ti) => '<button class="vsw' + (on ? ' on' : '') + '" style="background:' + col + '" data-a="' + a + '" data-v="' + i + '" title="' + e2(ti) + '"></button>';
  const swPav = (a, i, p, on) => '<button class="vsw' + (on ? ' on' : '') + '" style="background:linear-gradient(135deg,' + p[1] + ' 50%,' + p[2] + ' 50%)" data-a="' + a + '" data-v="' + i + '" title="' + e2(p[0]) + '"></button>';

  // --- creazione della casa (o trasloco in un altro modello) ---
  function hCrea(d) {
    const nuovo = !d.trasloco, m = DATI.modelli[d.model] || {};
    const costo = k => nuovo ? costoModello(k) : costoTrasloco(k);
    let h = testa(ic(nuovo ? 'vx_martello' : 'vx_carro', 24), nuovo ? 'Costruisci la tua casa' : 'Cambia modello', tasca());
    if (nuovo) h += '<p class="mu">Scegli un modello: potrai cambiarlo, ridipingerlo e arredarlo quando vuoi. Il deposito è solo tuo; gli altri eroi possono venirti a trovare e giocare con il tuo pet.</p>';
    else h += '<p class="mu">Il trasloco costa metà del prezzo del modello. Il deposito e il pet restano come sono; gli arredi che hai aggiunto tu vengono tolti, perché le stanze cambiano.</p>';
    h += '<div class="vgr">' + Object.entries(DATI.modelli).map(([k, q]) => '<div class="vcard' + (k === d.model ? ' on' : '') + '" data-a="modello" data-v="' + k + '"><canvas data-pianta="' + k + '" data-muro="' + (k === d.model ? d.muro : q.muro) + '" data-pav="' + (k === d.model ? d.pav : q.pav) + '"></canvas><b>' + e2(q.n) + '</b>' +
      (!nuovo && IO && IO.casa && IO.casa.model === k ? '<span class="mu">la tua</span>' : costo(k) ? prezzo(costo(k), '') : '<span class="mu">gratis</span>') + '</div>').join('') + '</div>';
    if (m.d) h += '<p><b>' + e2(m.n) + '</b>: ' + e2(m.d) + '</p>';
    if (nuovo) {
      h += '<h4>' + ic('pennello') + ' Muri</h4>' + DATI.muri.map((q, i) => sw('cmuro', i, q[1], i === d.muro, q[0])).join('');
      h += '<h4>' + ic('pennello') + ' Pavimento</h4>' + DATI.pavimenti.map((q, i) => swPav('cpav', i, q, i === d.pav)).join('');
      h += '<h4>' + ic('vx_zampa') + ' Il tuo pet</h4><div class="vgr">' + Object.entries(DATI.specie).map(([k, q]) => '<div class="vcard' + (k === d.specie ? ' on' : '') + '" data-a="specie" data-v="' + k + '">' + icPet(k, k === d.specie ? d.colore : 0, 32) + '<b>' + e2(q.n) + '</b></div>').join('') + '</div>';
      const sp = DATI.specie[d.specie];
      h += '<p>Colore: ' + sp.c.map((q, i) => sw('pcol', i, q[1], i === d.colore, q[0])).join('') + '</p>';
      h += '<div class="vrow"><span>Nome del pet</span><input type="text" maxlength="14" data-k="petnome" placeholder="' + e2(sp.n) + '"></div>';
      h += '<div class="vrow"><span>Nome della casa</span><input type="text" maxlength="28" data-k="casanome" placeholder="Casa di ' + e2(NET.name) + '"></div>';
      h += '<p class="mu">Il pet è compreso nel prezzo. Ridipingere costa ' + (PR.colore ? PR.colore + ' monete' : 'niente') + ', ogni arredo nuovo da ' + Math.round(5 * PR.pct / 100) + ' a ' + Math.round(40 * PR.pct / 100) + ' monete' + (PR.cibo ? ', una ciotola per il pet ' + PR.cibo : '') + '.</p>';
      h += fondo(btn('costruisci', '', ic('vx_martello') + 'Costruisci' + prezzo(costo(d.model)), { dis: d.invio }));
    } else h += fondo(btn('trasloca', '', ic('vx_carro') + 'Trasloca qui' + prezzo(costo(d.model)), { dis: d.model === (IO && IO.casa && IO.casa.model) }));
    return h;
  }
  // --- gestione della propria casa ---
  function hCasa(d) {
    const c = IO && IO.casa; if (!c) return testa(ic('vx_casa', 24), 'Casa') + '<p>Non hai ancora una casa.</p>' + fondo(btn('crea', '', ic('vx_martello') + 'Costruisci la tua casa'));
    const tab = d.tab || 'aspetto', inCasa = Zk === ZC + c.hid;
    let h = testa(ic('vx_casa', 24), e2(c.nome || 'Casa di ' + c.owner), tasca() + (IO.mia && IO.oro ? ' · ' + ic('forziere', 14) + ' ' + IO.oro : ''));
    h += '<div class="tabs">' + [['aspetto', 'pennello', 'Aspetto'], ['dettagli', 'vx_cartello', 'Dettagli'], ['pet', 'vx_zampa', 'Pet'], ['chiave', 'vx_chiave', 'Chiave']].map(([k, i, n]) => btn('tab', k, ic(i) + n, { on: k === tab })).join('') + '</div>';
    if (!IO.mia) h += '<p class="qb">Questa casa è legata a un altro browser o computer: per cambiarla o aprire il deposito scrivi <b>/casa chiave</b> seguito dal codice della casa.</p>';
    if (tab === 'aspetto') {
      const m = DATI.modelli[c.model];
      h += '<div class="vrow"><span>' + ic('vx_casa') + ' Modello</span><b style="flex:1">' + e2(m ? m.n : c.model) + '</b>' + btn('traslocoApri', '', ic('vx_carro') + 'Cambia', { dis: !IO.mia }) + '</div>';
      h += '<h4>' + ic('pennello') + ' Muri' + (PR.colore ? ' <span class="mu">· ridipingere costa ' + ORO(PR.colore) + '</span>' : '') + '</h4>' + DATI.muri.map((q, i) => sw('muro', i, q[1], i === c.muro, q[0])).join('');
      h += '<h4>' + ic('pennello') + ' Pavimento</h4>' + DATI.pavimenti.map((q, i) => swPav('pav', i, q, i === c.pav)).join('');
      h += '<div class="vrow"><span>' + ic('vx_musica') + ' Musica</span><select data-a="mus">' + DATI.musiche.map(([k, n]) => '<option value="' + k + '"' + (k === c.mus ? ' selected' : '') + '>' + e2(n) + '</option>').join('') + '</select></div>';
      h += '<h4>' + ic('vx_sedia') + ' Arredi</h4><p class="mu">' + Object.keys(c.arr || {}).length + ' arredi aggiunti su ' + CFG.maxArredi + '. ' + (inCasa ? 'Scegli un arredo e clicca sul pavimento: paghi solo i pezzi nuovi quando salvi, spostarli è gratis.' : 'Per arredare devi essere in casa.') + '</p>';
      h += fondo(btn('arreda', '', ic('vx_sedia') + 'Arreda', { dis: !inCasa || !IO.mia }));
    } else if (tab === 'dettagli') {
      h += '<div class="vrow"><span>' + ic('vx_casa') + ' Nome</span><input type="text" maxlength="28" data-k="nome" data-enter="nome" value="' + e2(c.nome) + '" placeholder="Casa di ' + e2(c.owner) + '"></div>';
      h += '<div class="vrow"><span>' + ic('vx_cartello') + ' Cartello</span><input type="text" maxlength="80" data-k="cartello" data-enter="cartello" value="' + e2(c.msg) + '" placeholder="Un saluto per chi viene a trovarti"></div>';
      h += '<p style="text-align:right">' + btn('salvaDettagli', '', ic('spunta') + 'Salva', { dis: !IO.mia }) + '</p>';
      h += '<h4>' + ic(c.aperta ? 'vx_aperto' : 'vx_lucchetto') + ' Visite</h4><p class="mu">' + (c.aperta ? 'La casa è aperta: chiunque può entrare e giocare con il tuo pet. Il deposito resta sempre chiuso a chiave.' : 'La casa è chiusa: entri solo tu.') + '</p>';
      h += fondo(btn('aperta', c.aperta ? '0' : '1', c.aperta ? ic('vx_lucchetto') + 'Chiudi la casa' : ic('vx_aperto') + 'Apri la casa', { dis: !IO.mia }));
    } else if (tab === 'pet') {
      const p = PET[c.hid] || c.pet, sp = DATI.specie[p.specie];
      h += '<div class="vpet">' + icPet(p.specie, p.colore, 48) + '<div><b>' + e2(p.nome) + '</b><br><span class="mu">' + e2(sp.n) + ' · livello ' + p.lv + '</span></div></div>';
      h += '<div class="vrow"><span>Nome</span><input type="text" maxlength="14" data-k="petnome2" data-enter="petNome" value="' + e2(p.nome) + '">' + btn('petNome', '', ic('spunta') + 'Salva', { dis: !IO.mia }) + '</div>';
      h += '<p>Colore: ' + sp.c.map((q, i) => sw('petColore', i, q[1], i === p.colore, q[0])).join('') + '</p>';
      h += fondo(btn('pet', c.hid, ic('vx_zampa') + 'Stato e cure'));
    } else {
      const k = chiaveMia();
      h += '<p>Il codice della casa serve per aprirla da un altro browser o computer. Tienilo per te: chi lo conosce può aprire il tuo deposito.</p>';
      if (IO.mia && k) h += '<div class="vkey">' + e2(k) + '</div><p class="mu">Sull\'altro computer, con lo stesso nome dell\'eroe, scrivi in chat: /casa chiave ' + e2(k) + '</p>';
      else h += '<p class="mu">Su questo browser il codice non c\'è. Scrivi /casa chiave seguito dal codice. Se l\'hai perso, chiedi all\'admin del server di generarne uno nuovo.</p>';
      h += fondo();
    }
    return h;
  }
  // --- il pet ---
  const COL = { fame: '#e8a040', gioia: '#f0d040', energia: '#5ab8e8', pulizia: '#7ad87a', aff: '#ff7a9a' };
  const NOMI = { fame: 'Sazietà', gioia: 'Allegria', energia: 'Energia', pulizia: 'Pulizia', aff: 'Affetto' };
  const ICS = { fame: 'vx_ciotola', gioia: 'vx_palla', energia: 'vx_fulmine', pulizia: 'vx_bagno', aff: 'cuore' };
  const AZI = { nutri: ['vx_ciotola', 'Dai da mangiare'], gioca: ['vx_palla', 'Gioca'], lava: ['vx_bagno', 'Lava'], coccola: ['cuore', 'Coccola'], addestra: ['vx_tocco', 'Insegna un gioco'],
    biscotto: ['vx_biscotto', 'Dai un biscotto'], spazzola: ['vx_spazzola', 'Spazzola'] };
  const AZP = ['nutri', 'gioca', 'lava', 'coccola', 'addestra'], AZV = ['coccola', 'gioca', 'biscotto', 'spazzola'];
  const mmss = ms => { const s = Math.ceil(ms / 1000); return s >= 60 ? Math.ceil(s / 60) + ' min' : s + ' s'; };
  function umore(p) {
    const m = (p.st.fame + p.st.gioia + p.st.energia + p.st.pulizia) / 4;
    return m > 85 ? ['Felicissimo', '#4cd07a'] : m > 65 ? ['Contento', '#8ac84a'] : m > 40 ? ['Così così', '#e8b040'] : m > 20 ? ['Triste', '#e8803a'] : ['Ha bisogno di te', '#e55'];
  }
  function bisogni(p) {
    const b = []; if (p.st.fame < 30) b.push('ha fame'); if (p.st.gioia < 30) b.push('si annoia'); if (p.st.pulizia < 30) b.push('è sporco'); if (p.st.energia < 20) b.push('è stanco');
    return b;
  }
  const barra = (i, n, v, col, dx) => '<div class="vrow"><span>' + ic(i) + ' ' + n + '</span><div class="vbar"><i style="width:' + v + '%;background:' + col + '"></i></div><span style="width:44px;text-align:right"' + (dx ? ' class="mu"' : '') + '>' + (dx || v) + '</span></div>';
  function hPet(d) {
    const c = CASE[d.hid], p = PET[d.hid]; if (!c || !p) return testa(ic('vx_zampa', 24), 'Pet') + '<p class="mu">Un momento…</p>' + fondo();
    const io = c.mia, sp = DATI.specie[p.specie], ora = Date.now(), [um, uc] = umore(p);
    let h = testa(icPet(p.specie, p.colore, 24), e2(p.nome), e2(sp.n) + ' · liv ' + p.lv);
    if (!io) h += '<p class="mu">Il pet di ' + e2(c.owner) + '. Puoi prenderti cura di lui: ogni gesto lo aiuta a crescere.</p>';
    const bb = bisogni(p);
    h += '<p>' + (p.dorme ? ic('luna') + ' <b>Sta dormendo</b>' : '<b style="color:' + uc + '">' + um + '</b>') + (bb.length && !p.dorme ? ' · <span style="color:#e8803a">' + bb.join(', ') + '</span>' : '') + '</p>';
    for (const k of ['fame', 'gioia', 'energia', 'pulizia']) h += barra(ICS[k], NOMI[k], p.st[k], COL[k]);
    if (io) h += barra(ICS.aff, NOMI.aff, p.aff, COL.aff);
    h += barra('stella', 'Livello ' + p.lv, p.lv >= 30 ? 100 : Math.round(p.xp / p.xpNext * 100), '#b07ad8', p.lv >= 30 ? 'max' : p.xp + '/' + p.xpNext);
    if (p.trucchi.length) h += '<p class="mu">Sa fare: ' + p.trucchi.map(e2).join(', ') + '.</p>';
    h += '<h4>' + ic(io ? 'cuore' : 'vx_palla') + ' ' + (io ? 'Prenditi cura di ' + e2(p.nome) : 'Gioca con ' + e2(p.nome)) + '</h4>';
    h += (io ? AZP : AZV).map(a => {
      const w = (p.cd && p.cd[a] || 0) - (ora - (pan.d.ricevuto || ora));
      return btn('azione', a, ic(AZI[a][0]) + AZI[a][1] + (w > 0 ? ' <span class="mu">· ' + mmss(w) + '</span>' : a === 'nutri' ? prezzo(PR.cibo) : ''), { dis: w > 0 || p.dorme });
    }).join('');
    if (io) h += btn('azione', p.dorme ? 'sveglia' : 'dormi', p.dorme ? ic('sole') + 'Sveglia' : ic('luna') + 'Mettilo a nanna');
    if (io && p.ultime && p.ultime.length) {
      const AN = { coccola: 'ha coccolato', gioca: 'ha giocato con', biscotto: 'ha dato un biscotto a', spazzola: 'ha spazzolato' };
      h += '<h4>' + ic('gente') + ' Visite recenti</h4>' + p.ultime.slice(0, 8).map(u => '<div class="mu">' + ic(AZI[u.a] ? AZI[u.a][0] : 'cuore', 14) + ' ' + new Date(u.t).toLocaleString('it-IT', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) + ' · <b>' + e2(u.chi) + '</b> ' + (AN[u.a] || u.a) + ' ' + e2(p.nome) + '</div>').join('');
    }
    if (io && p.amici && p.amici.length) h += '<p class="mu">Amici di ' + e2(p.nome) + ': ' + p.amici.map(([n, v]) => e2(n) + ' (' + v + ')').join(', ') + '</p>';
    return h + fondo();
  }
  // --- il deposito ---
  function hDep() {
    if (!DEP) return testa(ic('forziere', 24), 'Deposito') + '<p class="mu">Apro il deposito…</p>' + fondo();
    let h = testa(ic('forziere', 24), 'Deposito', DEP.items.length + '/' + DEP.cap + ' oggetti');
    h += '<p class="mu">Quello che metti qui resta al sicuro sul server. Lo puoi aprire solo tu: chi viene a trovarti non lo vede.</p>';
    h += '<div class="vrow"><span>' + ic('oro') + ' <b>' + DEP.oro + '</b></span><input type="number" min="1" data-k="oro" data-enter="depOro" placeholder="quanto">' +
      btn('depOro', '', 'Deposita') + btn('prelOro', '', 'Preleva') + btn('depOro', 'tutto', 'Tutto il mio') + '</div>';
    h += '<h4>' + ic('forziere') + ' Nel deposito</h4>' + (DEP.items.length ? DEP.items.map(it => '<div class="it"><span>' + opz(() => fmt(it)) + '</span><span>' + btn('preleva', it.u, 'Prendi') + '</span></div>').join('') : '<p class="mu">Vuoto.</p>');
    h += '<h4>' + ic('zaino') + ' Zaino <span class="mu">' + P.inv.length + '/' + INV + '</span></h4>' + (P.inv.length ? P.inv.map((it, i) => '<div class="it"><span>' + opz(() => fmt(it)) + '</span><span>' + btn('deposita', i, 'Deposita', { dis: DEP.items.length >= DEP.cap }) + '</span></div>').join('') : '<p class="mu">Lo zaino è vuoto.</p>');
    return h + fondo();
  }
  // --- il borgo ---
  function hBorgo() {
    let h = testa(ic('vx_borgo', 24), e2(CFG.nomeBorgo), BORGO.length + ' case');
    h += '<p class="mu">«Ogni eroe ha qui la sua casa. Bussa pure: se la porta è aperta, il padrone di casa non si offende. Il deposito però è chiuso a chiave.»</p>';
    const vv = Object.values(PR.modelli).filter(v => v > 0);
    if (!(IO && IO.casa)) h += '<p class="qb">' + ic('vx_martello') + ' ' + (vv.length ? 'Una casa tutta tua costa da ' + ORO(Math.min(...vv)) + ' a ' + ORO(Math.max(...vv)) + ', pet compreso.' : 'Costruire una casa è gratis.') + '</p>';
    h += '<h4>' + ic('vx_mappa') + ' Le case</h4>';
    if (!BORGO.length) h += '<p class="mu">Ancora nessuna casa.</p>';
    h += BORGO.map(c => '<div class="it"><span>' + (c.pet ? icPet(c.pet.specie, c.pet.colore, 20) + ' ' : '') + '<b>' + e2(c.nome || 'Casa di ' + c.owner) + '</b>' + (c.on ? ' <span style="color:#4cd07a" title="online">●</span>' : '') + '<br><span class="mu">' + e2(c.owner) + ' · ' + e2((DATI.modelli[c.model] || {}).n || '') +
      (c.pet ? ' · ' + e2(c.pet.nome) + ' (liv ' + c.pet.lv + ')' : '') + '</span></span><span>' + (c.mia ? btn('visita', c.hid, ic('vx_casa') + 'Entra') : c.aperta ? btn('visita', c.hid, ic('vx_porta') + 'Visita') : btn('visita', c.hid, ic('vx_lucchetto') + 'Chiusa', { dis: 1 })) + '</span></div>').join('');
    return h + fondo(IO && IO.casa ? btn('vaiCasa', '', ic('vx_casa') + 'Vai a casa tua') : btn('crea', '', ic('vx_martello') + 'Costruisci la tua casa'));
  }

  // ---------- clic nei pannelli ----------
  function clic(a, v, el) {
    const d = pan ? pan.d : {};
    switch (a) {
      case 'chiudi': chiudi(); break;
      case 'tab': d.tab = v; disegna(); break;
      case 'modello': d.model = v; const m = DATI.modelli[v]; if (!d.trasloco) { d.muro = m.muro; d.pav = m.pav; } disegna(); break;
      case 'cmuro': d.muro = +v; disegna(); break;
      case 'cpav': d.pav = +v; disegna(); break;
      case 'specie': d.specie = v; d.colore = 0; disegna(); break;
      case 'pcol': d.colore = +v; disegna(); break;
      case 'costruisci': {
        const no = collegato() ? '' : 'Non sei collegato al server.'; if (no) { avvisa(no); break; }
        const n = costoModello(d.model); if (P.g < n) { avvisa('Ti servono ' + n + ' monete: ne hai ' + (P.g | 0) + '.'); suono(150, .12, 'square'); break; }
        VXP.send(ID, 'crea', { model: d.model, muro: d.muro, pav: d.pav, nome: val('casanome').trim(), pet: { specie: d.specie, colore: d.colore, nome: val('petnome').trim() }, oro: P.g | 0 });
        d.invio = 1; el.disabled = true; break;
      }
      case 'crea': apriCrea(); break;
      case 'traslocoApri': apri('crea', { trasloco: 1, model: IO.casa.model, muro: IO.casa.muro, pav: IO.casa.pav }); break;
      case 'trasloca': VXP.send(ID, 'modifica', { model: d.model, oro: P.g | 0 }); chiudi(); break;
      case 'muro': case 'pav': if (IO && IO.casa && IO.casa[a] !== +v) VXP.send(ID, 'modifica', { [a]: +v, oro: P.g | 0 }); break;
      case 'mus': VXP.send(ID, 'modifica', { mus: v }); break;
      case 'aperta': VXP.send(ID, 'modifica', { aperta: v === '1' }); break;
      case 'nome': case 'cartello': case 'salvaDettagli': VXP.send(ID, 'modifica', { nome: val('nome').trim(), msg: val('cartello').trim() }); avvisa('Salvato.'); break;
      case 'petNome': VXP.send(ID, 'modifica', { petNome: val('petnome2').trim() }); avvisa('Salvato.'); break;
      case 'petColore': VXP.send(ID, 'modifica', { petColore: +v }); break;
      case 'pet': apriPet(+v); break;
      case 'arreda': chiudi(); iniziaArredo(); break;
      case 'azione': VXP.send(ID, 'pet', { hid: d.hid, a: v, oro: P.g | 0 }); break;
      case 'deposita': deposita(+v); break;
      case 'preleva': preleva(v); break;
      case 'depOro': depOro(v === 'tutto' ? P.g : Math.floor(+val('oro') || 0)); break;
      case 'prelOro': { const n = Math.floor(+val('oro') || 0); if (n > 0) VXP.send(ID, 'prelOro', { n }); else avvisa('Scrivi quanto oro vuoi prendere.'); break; }
      case 'visita': chiudi(); visita(+v); break;
      case 'vaiCasa': chiudi(); vaiCasa(); break;
    }
  }
  function apriCrea() { const m0 = 'casetta', q = DATI.modelli[m0]; apri('crea', { model: m0, muro: q.muro, pav: q.pav, specie: 'cane', colore: 0 }); }
  function apriPet(hid) { apri('pet', { hid, ricevuto: Date.now() }); VXP.send(ID, 'pet?', { hid }); }
  function apriDeposito() {
    const c = ZZ && ZZ.vx; if (!c) return;
    if (!c.mia) { avvisa('Il deposito di ' + c.owner + ' è chiuso a chiave.'); suono(150, .2, 'square'); return; }
    if (!collegato()) { avvisa('Non sei collegato al server.'); return; }
    suono(300, .12); apri('dep'); VXP.send(ID, 'dep?', {});
  }
  function apriBorgo() { apri('borgo'); VXP.send(ID, 'borgo?', {}); }
  function vaiCasa() { const no = impegnato(); if (no) { avvisa(no); return; } VXP.send(ID, 'casa', {}); }

  // ---------- deposito: gli oggetti partono dallo zaino solo quando il server li ha presi ----------
  function deposita(i) {
    const it = P.inv[i]; if (!it) return;
    if (!collegato()) { avvisa('Non sei collegato al server.'); return; }
    if (DEP && DEP.items.length >= DEP.cap) { avvisa('Il deposito è pieno.'); return; }
    P.inv.splice(i, 1); PEND[it.u] = { it, t: Date.now() }; opz(() => save()); opz(() => hud());
    VXP.send(ID, 'deposita', { it }); disegna();
  }
  function preleva(u) {
    if (P.inv.length >= INV) { avvisa('Lo zaino è pieno.'); return; }
    VXP.send(ID, 'preleva', { u });
  }
  function depOro(n) {
    n = Math.floor(n); if (!(n > 0)) { avvisa('Scrivi quanto oro vuoi depositare.'); return; }
    if (n > P.g) { avvisa('Non hai tutto quell\'oro.'); return; }
    if (!collegato()) { avvisa('Non sei collegato al server.'); return; }
    P.g -= n; pendOro += n; opz(() => save()); opz(() => hud()); VXP.send(ID, 'depOro', { n });
  }
  function rimetti(u) { const q = PEND[u]; if (!q) return; delete PEND[u]; P.inv.push(q.it); opz(() => save()); opz(() => hud()); }

  // ---------- modalità arredo ----------
  function motivoNo(x, y) {
    if (!EDIT) return 'no';
    const z = Z[EDIT.zk], P0 = z && z.P0; if (!P0 || !P0.base[y] || P0.base[y][x] !== '.') return 'Lì non si può mettere niente.';
    const [dx, dy] = P0.dep, [px, py] = P0.porta;
    if ((x === dx && y === dy) || (Math.abs(x - px) <= 1 && y >= py - 2)) return 'Lascia libero l\'ingresso e il deposito.';
    return '';
  }
  function iniziaArredo() {
    const c = IO && IO.casa; if (!c || Zk !== ZC + c.hid) { avvisa('Per arredare devi essere in casa.'); return; }
    EDIT = { zk: Zk, hid: c.hid, model: c.model, arr: Object.assign({}, c.arr), orig: Object.assign({}, c.arr), sel: DATI.arredi[0][0] };
    const el = document.createElement('div'); el.id = 'vxe'; ferma(el); document.body.appendChild(el); EDIT.el = el; barraArredo();
    avvisa('Clicca sul pavimento per mettere l\'arredo scelto, o su un arredo per toglierlo con la gomma.');
  }
  function barraArredo() {
    if (!EDIT) return;
    const n = Object.keys(EDIT.arr).length, conto = costoArredi(EDIT.orig, EDIT.arr, PR.pct);
    EDIT.el.innerHTML = '<div class="vhd"><b>' + ic('vx_sedia', 20) + ' Arreda · ' + n + '/' + CFG.maxArredi + (conto ? ' · da pagare' + prezzo(conto, ' ') : '') + '</b><span>' +
      btn('gomma', '', ic('vx_gomma') + 'Gomma', { on: EDIT.sel === '' }) + btn('annulla', '', ic('vx_annulla') + 'Annulla') + btn('fine', '', ic('spunta') + 'Salva' + prezzo(conto), {}) + '</span></div>' +
      DATI.arredi.map(([c, nome]) => btn('sel', c, e2(nome) + (PR.pct ? ' <span class="vprz">' + Math.round((DATI.listino.arredi[c] || 10) * PR.pct / 100) + '</span>' : ''), { on: EDIT.sel === c })).join('');
    EDIT.el.querySelectorAll('[data-a]').forEach(b => b.onclick = () => {
      const a = b.dataset.a;
      if (a === 'sel') EDIT.sel = b.dataset.v; else if (a === 'gomma') EDIT.sel = '';
      else if (a === 'annulla') { mettiArredi(EDIT.orig); fineArredo(); return; }
      else if (a === 'fine') {
        const t = costoArredi(EDIT.orig, EDIT.arr, PR.pct);
        if (t > borsa()) { avvisa('Ti servono ' + t + ' monete: togli qualche arredo nuovo o torna quando ne hai di più.'); suono(150, .12, 'square'); return; }
        VXP.send(ID, 'arredi', { arr: EDIT.arr, oro: P.g | 0 }); fineArredo(); return;
      }
      barraArredo();
    });
  }
  function fineArredo() { if (EDIT && EDIT.el) EDIT.el.remove(); EDIT = null; }
  // mette gli arredi nella casa in cui si è, senza ricaricarla
  function mettiArredi(arr) {
    const z = ZZ; if (!z || !z.P0) return;
    const B = z.P0.base;
    for (let y = 0; y < B.length; y++) for (let x = 0; x < B.length; x++) {
      if (B[y][x] !== '.') continue;
      const c = arr[x + ',' + y] || '';
      if (DEC[y][x] === c) continue;
      DEC[y][x] = c; M[y][x] = !c || CAMMINA.has(c) ? 0 : 6;
    }
    FC = null;
  }
  addEventListener('pointerdown', e => {
    if (!EDIT || e.target !== cv) return;
    e.stopPropagation(); e.preventDefault();
    if (Zk !== EDIT.zk) { fineArredo(); return; }
    mouse = [e.clientX, e.clientY];
    const q = sottoMouse(); if (!q) return;
    const [x, y] = q, k = x + ',' + y, no = motivoNo(x, y);
    if (no) { avvisa(no); suono(150, .12, 'square'); return; }
    const nuovo = Object.assign({}, EDIT.arr);
    if (!EDIT.sel || nuovo[k] === EDIT.sel) delete nuovo[k]; else nuovo[k] = EDIT.sel;
    if (nuovo[k] && !CAMMINA.has(nuovo[k]) && (P.px | 0) === x && (P.py | 0) === y) { avvisa('Spostati: ci sei sopra tu.'); return; }
    const err = controllaArredi(EDIT.model, nuovo, CFG.maxArredi);
    if (err) { avvisa(err); suono(150, .12, 'square'); return; }
    EDIT.arr = nuovo; mettiArredi(nuovo); suono(nuovo[k] ? 600 : 400, .06); barraArredo();
  }, true);

  // ---------- riquadro in alto a sinistra (nel Borgo e nelle case) ----------
  function riquadro() {
    const inCasa = ZZ && ZZ.vx, inBorgo = Zk === ZB;
    if (!inCasa && !inBorgo) { if (wid) wid.style.display = 'none'; return; }
    if (!wid) {
      wid = document.createElement('div'); wid.id = 'vxw'; ferma(wid); document.body.appendChild(wid);
      wid.onclick = e => { const b = e.target.closest('button'); if (!b) return; const a = b.dataset.w;
        if (a === 'pet') apriPet(ZZ.vx.hid); else if (a === 'dep') apriDeposito(); else if (a === 'casa') apri('casa', {}); else if (a === 'borgo') apriBorgo();
        else if (a === 'esci') viaggia(ZB, Zk); else if (a === 'mia') vaiCasa(); };
    }
    const chiave = inCasa ? 'c' + ZZ.vx.hid + ZZ.vx.mia + ZZ.n + (IO && IO.casa ? 1 : 0) : 'b' + (IO && IO.casa ? 1 : 0);
    if (wid.dataset.k !== chiave) {
      wid.dataset.k = chiave;
      if (inCasa) { const c = ZZ.vx;
        wid.innerHTML = '<b>' + ic('vx_casa', 20) + ' ' + e2(ZZ.n) + '</b><div class="mu">' + (c.mia ? 'La tua casa' : 'Di ' + e2(c.owner)) + '</div><button data-w="pet">' + ic('vx_zampa') + 'Pet</button>' +
          (c.mia ? '<button data-w="dep">' + ic('forziere') + 'Deposito</button><button data-w="casa">' + ic('ingranaggio') + 'Casa</button>' : '') + '<button data-w="esci">' + ic('vx_porta') + 'Esci</button>';
      } else wid.innerHTML = '<b>' + ic('vx_borgo', 20) + ' ' + e2(CFG.nomeBorgo) + '</b><div class="mu">Parla con il custode o bussa a una porta</div><button data-w="borgo">' + ic('vx_mappa') + 'Case</button>' +
        (IO && IO.casa ? '<button data-w="mia">' + ic('vx_casa') + 'Casa mia</button>' : '<button data-w="borgo">' + ic('vx_martello') + 'Costruisci</button>');
    }
    wid.style.display = EDIT ? 'none' : 'block';
    if (!EDIT) sottoHud();
  }
  // il riquadro sta sotto l'HUD in alto a sinistra, che cresce con le righe (livello, oro, gente, ping…): si segue la sua altezza,
  // e si stringe come l'HUD su schermi piccoli per non coprire l'orologio
  function sottoHud() {
    const h = document.getElementById('hud'), r = h && h.getBoundingClientRect(), c = wid.dataset;
    const top = r && r.height ? Math.round(r.bottom + 10) : 118, left = r && r.height ? Math.max(8, Math.round(r.left)) : 12;
    const larg = r && r.width ? Math.min(220, Math.max(160, Math.round(r.width + 5))) : 214;
    if (c.top !== String(top)) { c.top = top; wid.style.top = top + 'px'; }
    if (c.left !== String(left)) { c.left = left; wid.style.left = left + 'px'; }
    if (c.larg !== String(larg)) { c.larg = larg; wid.style.width = 'min(' + larg + 'px,calc(100vw - 32px))'; }
  }

  // ---------- messaggi dal server ----------
  VXP.on(ID, 'io', d => {
    IO = d || null;
    if (IO && IO.casa) { CASE[IO.casa.hid] = IO.casa; if (Z[ZC + IO.casa.hid]) defCasa(IO.casa); }
    if (pan && (pan.tipo === 'casa' || pan.tipo === 'borgo')) disegna();
  });
  // il server ha fatto quello che si è pagato: si tolgono le monete
  VXP.on(ID, 'paga', d => {
    if (!d) return;
    if (d.n > 0) { P.g = Math.max(0, (P.g | 0) - d.n); opz(() => save()); opz(() => hud()); avvisa('Hai speso ' + d.n + ' monete.'); }
    if (d.dep > 0) { if (DEP) DEP.oro = Math.max(0, DEP.oro - d.dep); if (IO) IO.oro = Math.max(0, (IO.oro | 0) - d.dep); avvisa('Hai pagato ' + d.dep + ' monete con l\'oro del deposito.'); }
    suono(880, .05); setTimeout(() => suono(660, .06), 70);
    if (pan) disegna();
  });
  VXP.on(ID, 'chiave', d => { if (d && d.k && d.nome) { LS.set('chiave_' + String(d.nome).toLowerCase(), d.k); if (d.nuova) clog('', 'Codice della tua casa: ' + d.k + ' (serve per aprirla da un altro computer; lo trovi anche in Casa, scheda Chiave)', { sys: 1 }); } });
  VXP.on(ID, 'borgo', d => {
    BORGO = Array.isArray(d && d.case) ? d.case : [];
    const prima = JSON.stringify((Z[ZB] || {}).po || []); defBorgo();
    // se si è nel borgo e le porte sono cambiate, si aggiornano subito
    if (Zk === ZB && JSON.stringify(Z[ZB].po) !== prima) {
      ents = ents.filter(e => !(e.k === 'po' && typeof e.to === 'string' && e.to.startsWith(ZC)));
      for (const [x, y, to, n] of Z[ZB].po) { M[y][x] = 0; DEC[y][x] = ''; const face = M[y - 1] && M[y - 1][x] === 1 ? 'n' : M[y + 1] && M[y + 1][x] === 1 ? 's' : M[y][x - 1] === 1 ? 'w' : 'e'; ents.push(Object.assign(po(x, y, to, { st: 'door', n }), { face })); }
    }
    if (pan && pan.tipo === 'borgo') disegna();
  });
  VXP.on(ID, 'apri', d => {
    if (!d) return;
    if (d.p === 'crea') { if (!(pan && pan.tipo === 'crea' && aperto())) apriCrea(); } else if (d.p === 'casa') apri('casa', { tab: d.tab }); else if (d.p === 'borgo') apriBorgo(); else if (d.p === 'pet' && d.hid) apriPet(d.hid);
  });
  VXP.on(ID, 'vai', d => {
    if (!d) return;
    const no = impegnato(); if (no) { avvisa(no); return; }
    chiudi();
    if (d.borgo) { if (Zk !== ZB) viaggia(ZB, Zk); return; }
    const k = defCasa(d.casa); if (!k) return;
    if (Zk === k) { avvisa('Sei già qui.'); return; }
    viaggia(k, ZB);
  });
  VXP.on(ID, 'casa', d => {
    if (!d || !d.casa) return;
    const c = d.casa, k = ZC + c.hid, z = Z[k], primo = z && z.vx;
    if (IO && IO.casa && IO.casa.hid === c.hid) { IO.casa = c; IO.mia = c.mia; }
    if (!z) { CASE[c.hid] = c; return; }
    const cambioModello = primo && primo.model !== c.model;
    defCasa(c);
    if (Zk === k) {
      if (cambioModello) { fineArredo(); viaggia(k, ZB); }
      else { mettiArredi(c.arr || {}); const s = ents.find(e => e.vxdep); if (s) s.n = c.mia ? 'Il tuo deposito' : 'Deposito di ' + c.owner + ' (chiuso)'; aggiornaPet(c.hid); FC = null; opz(() => music(ZZ.mus)); opz(() => { $('zn').textContent = ZZ.n; }); }
    }
    if (pan && (pan.tipo === 'casa' || pan.tipo === 'pet')) disegna();
  });
  VXP.on(ID, 'pet', d => {
    if (!d || !d.pet) return;
    PET[d.hid] = d.pet; if (CASE[d.hid]) CASE[d.hid].pet = d.pet;
    aggiornaPet(d.hid);
    if (pan && pan.tipo === 'pet' && pan.d.hid === d.hid) { pan.d.ricevuto = Date.now(); disegna(); }
  });
  VXP.on(ID, 'petfx', d => {
    if (!d) return;
    const e = petQui(); if (!e || e.hid !== d.hid) return;
    const cuori = { coccola: '♥', gioca: '★', nutri: 'gnam!', biscotto: 'gnam!', lava: '✦', spazzola: '✦', addestra: 'bravo!', dormi: 'Zz', sveglia: '!' };
    opz(() => flt(e, (cuori[d.a] || '♥') + (d.chi && d.chi !== NET.name ? ' ' + d.chi : ''), '#ffb0c8'));
    if (d.a !== 'dormi') opz(() => sparks(e.px, e.py, 12, ['#ff6a8a', '#ffd0dc', '#ffffff']));
    if (d.a === 'gioca' && !e.dorme) { e.path = []; e.wt = 0; }
    if (d.lv) { opz(() => banner(d.nome + ' è salito di livello!', 'Ora è al livello ' + d.lv + (d.trucco ? ' e ' + d.trucco : ''), 'trofeo')); opz(() => jingle([72, 76, 79, 84], .1, 'triangle')); }
    else suono(d.a === 'dormi' ? 300 : 700, .08);
    if (d.testo) opz(() => clog('', d.testo, { sys: 1 }));
  });
  VXP.on(ID, 'dep', d => {
    DEP = d || null; if (DEP && IO) IO.oro = DEP.oro;
    // gli oggetti partiti da un po' che il deposito non ha ricevuto tornano nello zaino
    if (DEP) for (const u of Object.keys(PEND)) { if (DEP.items.some(it => it.u === u)) delete PEND[u]; else if (Date.now() - PEND[u].t > 8000) rimetti(u); }
    if (pan && pan.tipo === 'dep') disegna();
  });
  VXP.on(ID, 'depOk', d => { if (d && PEND[d.u]) { delete PEND[d.u]; suono(500, .06); } });
  VXP.on(ID, 'depKo', d => { if (!d) return; rimetti(d.u); avvisa(d.testo || 'Il deposito non l\'ha preso.'); if (pan && pan.tipo === 'dep') disegna(); });
  VXP.on(ID, 'ricevi', d => {
    if (!d || !d.it) return;
    P.inv.push(d.it); opz(() => itemFly(d.it)); opz(() => save()); opz(() => hud()); suono(620, .06);
    avvisa('Hai preso ' + opz(() => iname(d.it)) + ' dal deposito.'); if (pan && pan.tipo === 'dep') disegna();
  });
  VXP.on(ID, 'oro', d => {
    if (!d) return;
    if (d.ok) pendOro = Math.max(0, pendOro - d.ok);
    if (d.ko) { pendOro = Math.max(0, pendOro - d.ko); P.g += d.ko; avvisa(d.testo || 'Il deposito non ha preso l\'oro.'); }
    if (d.ricevi) { P.g += d.ricevi; opz(() => goldFly(d.ricevi)); }
    opz(() => save()); opz(() => hud());
  });
  VXP.on(ID, 'fuori', d => { if (Zk && String(Zk).startsWith(ZC)) { avvisa((d && d.testo) || 'Il padrone di casa ha chiuso la porta.'); fineArredo(); chiudi(); viaggia(ZB, Zk); } });
  VXP.on(ID, 'esito', d => { if (d && d.testo) avvisa(d.testo); if (d && d.crea === false && pan && pan.tipo === 'crea') { pan.d.invio = 0; disegna(); } });
  VXP.on(ID, 'spegni', () => { fineArredo(); chiudi(); if (wid) wid.style.display = 'none'; });

  // per guardare dalla console del browser: VXP_CASE.stato()
  window.VXP_CASE = { stato: () => ({ IO, CASE, PET, DEP, BORGO, EDIT, PEND }), modello: modelloPet };

  // ---------- ogni fotogramma ----------
  let zPrima = null, tChiac = 0, tDep = 0;
  function giro() {
    try {
      // a ogni nuova connessione si presenta al plugin, con il codice della casa se c'è
      if (NET.ok && NET.id && NET.id !== ultimoId) { ultimoId = NET.id; VXP.send(ID, 'ciao', { k: chiaveMia() }); }
      const z = typeof Zk === 'undefined' ? null : Zk;
      if (z !== zPrima) {
        const era = zPrima; zPrima = z;
        if (EDIT && z !== EDIT.zk) fineArredo();
        if (pan && (pan.tipo === 'dep' || pan.tipo === 'pet') && era && String(era).startsWith(ZC)) chiudi();
        if (z && String(z).startsWith(ZC) && ZZ && ZZ.vx) { const c = ZZ.vx; avvisa((c.mia ? 'Bentornato a casa!' : 'Sei a casa di ' + c.owner + '.') + (c.msg ? ' «' + c.msg + '»' : '')); }
        if (z === ZB) VXP.send(ID, 'borgo?', {});
      }
      riquadro();
      const n = performance.now();
      // il pet chiede quello che gli serve, o russa
      const e = ZZ && ZZ.vx ? petQui() : null;
      if (e && n - tChiac > 6000) {
        tChiac = n; const p = PET[e.hid];
        if (p && p.dorme) opz(() => flt(e, 'z z z', '#c8d8ff'));
        else if (p && Math.random() < .5) { const b = bisogni(p); if (b.length) opz(() => flt(e, b[Math.floor(Math.random() * b.length)] + '!', '#ffd0a0')); }
      }
      if (Object.keys(PEND).length && n - tDep > 5000 && collegato()) { tDep = n; VXP.send(ID, 'dep?', {}); }
      if (pan && pan.tipo === 'pet' && n - (pan.tick || 0) > 1000) { pan.tick = n; const p = PET[pan.d.hid]; if (p && p.cd && Object.values(p.cd).some(v => v > 0)) disegna(); }
    } catch (err) { console.error('[plugin ' + ID + ']', err); }
    requestAnimationFrame(giro);
  }
  requestAnimationFrame(giro);
}

// ======================= server =======================
const crypto = require('crypto');
const ZB = 'in_vxborgo', ZC = 'in_vxcasa_';
const ALFA = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const nuovaChiave = () => { const b = crypto.randomBytes(16); let s = ''; for (let i = 0; i < 16; i++) s += ALFA[b[i] % 32] + (i % 4 === 3 && i < 15 ? '-' : ''); return s; };
const normChiave = s => String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const impronta = (sale, k) => crypto.createHash('sha256').update(sale + ':' + normChiave(k)).digest('hex');
const K = n => String(n || '').toLowerCase();
const testo = (v, n) => (typeof v === 'string' ? v : '').replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, n);
const lim = (v, a, b) => Math.max(a, Math.min(b, v));

// un oggetto del gioco ricevuto dal browser: si tengono solo campi semplici, con nomi e valori di misura ragionevole
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
  if (!/^[a-z]$/.test(r.s || '') || !r.n) return null;
  r.u = testo(String(r.u || ''), 12) || crypto.randomBytes(4).toString('hex');
  return r;
}

// cose che si possono fare al pet: chi = p (proprietario) e/o v (visitatore)
const AZ = {
  nutri: { chi: 'p', fx: { fame: 35 }, xp: 8, no: q => q.st.fame >= 95 && 'non ha fame', t: (n) => n + ' mangia di gusto.' },
  gioca: { chi: 'pv', fx: { gioia: 22, energia: -10 }, xp: 8, no: q => q.st.energia < 15 && 'è troppo stanco per giocare', t: (n, c) => (c ? c + ' gioca con ' + n : n + ' corre dietro alla palla') + '!' },
  lava: { chi: 'p', fx: { pulizia: 45 }, xp: 6, no: q => q.st.pulizia >= 95 && 'è già pulitissimo', t: n => n + ' è tutto pulito e profumato.' },
  coccola: { chi: 'pv', fx: { gioia: 10 }, xp: 4, aff: 4, t: (n, c) => (c ? c + ' coccola ' + n : n + ' si gode le coccole') + '.' },
  addestra: { chi: 'p', fx: { energia: -15, gioia: 5 }, xp: 14, no: q => (q.st.energia < 20 && 'è troppo stanco') || (q.st.gioia < 40 && 'non ha voglia: prima fallo giocare') },
  biscotto: { chi: 'v', fx: { fame: 15 }, xp: 5, no: q => q.st.fame >= 95 && 'non ha fame', t: (n, c) => c + ' dà un biscotto a ' + n + '.' },
  spazzola: { chi: 'v', fx: { pulizia: 15 }, xp: 5, no: q => q.st.pulizia >= 95 && 'è già pulitissimo', t: (n, c) => c + ' spazzola ' + n + '.' }
};
const xpServe = lv => 40 + lv * 20;
const LV_MAX = 30;

module.exports = {
  name: 'Case',
  version: '1.3',
  author: 'Voxelia',
  description: '/casa: ogni eroe ha una casa da scegliere, colorare e arredare, con un deposito che apre solo lui e un pet da accudire; nel Borgo delle Case si visitano le case degli altri',
  defaults: {
    nomeBorgo: 'Borgo delle Case',
    custode: 'Custode Ilario',
    maxCase: 300,               // case sul server al massimo
    capienzaDeposito: 30,       // oggetti nel deposito di ogni casa
    oroMaxDeposito: 1000000,    // oro nel deposito al massimo
    maxArredi: 40,              // arredi che si possono aggiungere in una casa
    prezzoPercento: 100,        // prezzi di case, traslochi, colori, arredi e cibo: 100 = di listino, 50 = metà, 0 = tutto gratis
    attesaVisitatoreMin: 20,    // minuti prima che lo stesso visitatore possa rifare la stessa cosa allo stesso pet
    attesaProprietarioSec: 10,  // secondi tra due cure uguali del proprietario
    xpVisitatore: 10,           // esperienza per chi si prende cura del pet di un altro (0 = niente)
    regaloLivello: 20,          // oro che il pet mette nel deposito quando sale di livello (per livello raggiunto)
    caloOrario: { fame: 5, gioia: 4, pulizia: 3, energia: 3 },   // quanto calano le statistiche del pet ogni ora
    depositoSoloInCasa: true,   // il deposito si apre solo stando in casa
    portaInCitta: true,         // un portale per il Borgo in città
    posPorta: [38, 44],         // dove (in caselle della città; se è occupato, il primo posto libero vicino)
    vietateDa: ['arena', 'mare', 'arrembaggio', 'stiva', 'sogno']   // zone da cui /casa e /visita non funzionano
  },

  setup(api) {
    const C = api.config, ID = api.id;
    const S = api.store;
    if (!S.case || typeof S.case !== 'object') S.case = {};
    if (!(S.n > 0)) S.n = 1;
    const perHid = new Map(); for (const k in S.case) perHid.set(S.case[k].hid, S.case[k]);
    const autentici = new Map();   // id della connessione → nome (minuscolo) della casa che ha aperto con il codice
    const tentativi = new Map();   // nome → { n, t } per i codici sbagliati
    const attesaProp = new Map();  // hid|azione → ora
    const avvisato = new Map();    // hid → ultima volta che il proprietario è stato avvisato di una visita
    const zona = h => ZC + h.hid;
    const hidDi = z => typeof z === 'string' && z.startsWith(ZC) ? +z.slice(ZC.length) || 0 : 0;
    const casaDi = p => S.case[K(p.name)] || null;
    const mia = (p, h) => !!(p && h) && autentici.get(p.id) === K(h.owner) && K(p.name) === K(h.owner);
    const dentro = h => api.players().filter(p => p.zone === zona(h));
    const vietata = p => (C.vietateDa || []).some(z => p.zone === z || String(p.zone).split('@')[0] === z);
    const esito = (p, t) => p.send('esito', { testo: t });
    // ---------- prezzi ----------
    // L'oro dell'eroe sta nel browser: il server controlla quanto dice di averne e, a cosa fatta, gli dice quanto togliere.
    // Se nello zaino non basta, il padrone di casa paga con l'oro del deposito, che invece è tutto sul server.
    const PCT = () => Math.max(0, Number(C.prezzoPercento == null ? 100 : C.prezzoPercento) || 0);
    const prezzo = base => Math.round((base || 0) * PCT() / 100);
    const prezzi = () => ({ pct: PCT(), modelli: Object.fromEntries(Object.keys(DATI.modelli).map(k => [k, prezzo(DATI.listino.modelli[k])])),
      colore: prezzo(DATI.listino.colore), trasloco: DATI.listino.trasloco, cibo: prezzo(DATI.listino.cibo) });
    // controlla se si può pagare n: restituisce una funzione che incassa, oppure il motivo per cui non si può
    function cassa(p, h, n, oro) {
      if (!(n > 0)) return [() => {}, ''];
      const z = Math.max(0, Math.floor(Number(oro) || 0));
      if (z >= n) return [() => p.send('paga', { n }), ''];
      if (h && mia(p, h) && h.dep.oro >= n) return [() => { h.dep.oro -= n; p.send('paga', { dep: n }); }, ''];
      return [null, 'Servono ' + n + ' monete: nello zaino ne hai ' + z + (h && mia(p, h) && h.dep.oro ? ' e nel deposito ' + h.dep.oro : '') + '.'];
    }

    api.client('(function(){const DATI=' + JSON.stringify(DATI) + ';const CAMMINA=new Set(' + JSON.stringify([...CAMMINA]) + ');' + pianta.toString() + controllaArredi.toString() + costoArredi.toString() +
      '(' + nelGioco.toString() + ')(' + JSON.stringify(ID) + ',' + JSON.stringify({ nomeBorgo: String(C.nomeBorgo), custode: String(C.custode), maxArredi: C.maxArredi | 0,
      prezzi: prezzi(), portaInCitta: !!C.portaInCitta, posPorta: [].concat(C.posPorta || [38, 44]).map(Number), vietateDa: [].concat(C.vietateDa || []) }) + ')})();');

    // ---------- il pet ----------
    // le statistiche calano col tempo (anche quando nessuno guarda): si ricalcolano a ogni lettura
    function aggiorna(q) {
      const ora = Date.now(), h = Math.max(0, (ora - (q.t || ora)) / 3600000); q.t = ora;
      if (!h) return;
      const c = C.caloOrario || {}, st = q.st;
      if (q.dorme) {
        st.energia = lim(st.energia + 25 * h, 0, 100); st.fame = lim(st.fame - (+c.fame || 0) * .4 * h, 0, 100); st.pulizia = lim(st.pulizia - (+c.pulizia || 0) * .3 * h, 0, 100);
        if (st.energia >= 100) q.dorme = false;
      } else for (const k of ['fame', 'gioia', 'pulizia', 'energia']) st[k] = lim(st[k] - (+c[k] || 0) * h, 0, 100);
    }
    function attese(h, p) {
      const q = h.pet, o = {}, ora = Date.now();
      if (mia(p, h)) { for (const a in AZ) if (AZ[a].chi.includes('p')) o[a] = Math.max(0, (attesaProp.get(h.hid + '|' + a) || 0) + (C.attesaProprietarioSec | 0) * 1000 - ora); }
      else for (const a in AZ) if (AZ[a].chi.includes('v')) o[a] = Math.max(0, ((q.cd || {})[K(p.name) + '|' + a] || 0) + (+C.attesaVisitatoreMin || 0) * 60000 - ora);
      return o;
    }
    function petPub(h, p) {
      const q = h.pet; if (!q) return null;
      aggiorna(q);
      const o = { specie: q.specie, colore: q.colore, nome: q.nome, lv: q.lv, xp: Math.floor(q.xp), xpNext: xpServe(q.lv), dorme: !!q.dorme, aff: Math.round(q.aff),
        st: { fame: Math.round(q.st.fame), gioia: Math.round(q.st.gioia), energia: Math.round(q.st.energia), pulizia: Math.round(q.st.pulizia) },
        trucchi: DATI.trucchi.filter(x => x[0] <= q.lv).map(x => x[1]) };
      if (p) {
        o.cd = attese(h, p);
        if (mia(p, h)) { o.ultime = (q.ultime || []).slice(-12).reverse(); o.amici = Object.entries(q.amici || {}).sort((a, b) => b[1] - a[1]).slice(0, 5); }
      }
      return o;
    }
    function inviaPet(h) { for (const p of dentro(h)) p.send('pet', { hid: h.hid, pet: petPub(h, p) }); }

    // ---------- la casa vista da un giocatore ----------
    function pubCasa(h, p) {
      return { hid: h.hid, owner: h.owner, nome: h.nome, model: h.model, muro: h.muro, pav: h.pav, mus: h.mus, msg: h.msg, aperta: h.aperta, arr: h.arr,
        pet: petPub(h, p), mia: mia(p, h) };
    }
    function inviaIo(p) { const h = casaDi(p); p.send('io', h ? { casa: pubCasa(h, p), mia: mia(p, h), oro: mia(p, h) ? h.dep.oro : 0 } : null); }
    function inviaCasa(h) {
      for (const p of dentro(h)) p.send('casa', { casa: pubCasa(h, p) });
      const o = api.player(h.owner); if (o && o.zone !== zona(h)) inviaIo(o);
    }
    function lista(p) {
      const online = new Set(api.players().map(x => K(x.name))), stanza = new Set(api.players(p.room).map(x => K(x.name))), me = K(p.name);
      return Object.values(S.case).map(h => ({ h, k: K(h.owner) }))
        .sort((a, b) => (b.k === me) - (a.k === me) || stanza.has(b.k) - stanza.has(a.k) || online.has(b.k) - online.has(a.k) || (b.h.ultima || 0) - (a.h.ultima || 0))
        .slice(0, 100)
        .map(({ h, k }) => ({ hid: h.hid, owner: h.owner, nome: h.nome, model: h.model, aperta: h.aperta, on: online.has(k), mia: k === me && mia(p, h),
          pet: h.pet ? { specie: h.pet.specie, nome: h.pet.nome, lv: h.pet.lv } : null }));
    }
    const inviaBorgo = p => p.send('borgo', { case: lista(p) });
    function aggiornaBorghi() { for (const p of api.players()) if (p.zone === ZB) inviaBorgo(p); }
    function inviaDep(p, h) { p.send('dep', { items: h.dep.items, oro: h.dep.oro, cap: C.capienzaDeposito | 0 }); }

    // ---------- muoversi ----------
    function vai(p, h) {
      if (vietata(p)) return 'Da qui non si può andare nelle case.';
      if (!mia(p, h) && !h.aperta) return 'La casa di ' + h.owner + ' è chiusa.';
      if (!mia(p, h) && K(p.name) === K(h.owner)) p.tell('Questa casa è legata a un altro browser o computer: per aprire il deposito scrivi /casa chiave seguito dal codice della casa.');
      p.send('vai', { casa: pubCasa(h, p) });
      return '';
    }
    function cercaCasa(q) {
      q = String(q || '').trim(); if (!q) return null;
      if (/^\d+$/.test(q) && perHid.get(+q)) return perHid.get(+q);
      if (S.case[K(q)]) return S.case[K(q)];
      const L = Object.values(S.case).filter(h => K(h.owner).startsWith(K(q)));
      return L.length === 1 ? L[0] : null;
    }

    // ---------- il codice della casa ----------
    function provaChiave(p, k) {
      const h = casaDi(p); if (!h) return 'Non hai una casa: scrivi /casa per costruirla.';
      const n = K(p.name), tt = tentativi.get(n) || { n: 0, t: 0 };
      if (Date.now() - tt.t > 600000) { tt.n = 0; tt.t = Date.now(); }
      if (tt.n >= 5) return 'Troppi tentativi: riprova tra qualche minuto.';
      if (!normChiave(k) || impronta(h.sale, k) !== h.chiave) { tt.n++; tentativi.set(n, tt); api.log('codice sbagliato per la casa di ' + h.owner + ' (' + p.ip + ')'); return 'Codice sbagliato.'; }
      tentativi.delete(n); autentici.set(p.id, n);
      p.send('chiave', { k: normChiave(k).replace(/(.{4})(?=.)/g, '$1-'), nome: p.name });
      inviaIo(p);
      if (p.zone === zona(h)) p.send('casa', { casa: pubCasa(h, p) });
      return '';
    }

    // ---------- costruire e cambiare ----------
    function crea(p, d) {
      if (!d || typeof d !== 'object') return 'Richiesta non valida.';
      if (casaDi(p)) return 'Hai già una casa: scrivi /casa per andarci.';
      if (Object.keys(S.case).length >= (C.maxCase | 0)) return 'Il Borgo è pieno: chiedi all\'admin del server.';
      if (!p.name || K(p.name) === 'eroe') return 'Scegli un nome per il tuo eroe prima di costruire una casa.';
      const model = DATI.modelli[d.model] ? d.model : 'casetta', m = DATI.modelli[model];
      const pt = d.pet && typeof d.pet === 'object' ? d.pet : {}, specie = DATI.specie[pt.specie] ? pt.specie : 'cane';
      const [incassa, noOro] = cassa(p, null, prezzo(DATI.listino.modelli[model]), d.oro); if (noOro) return noOro;
      const chiave = nuovaChiave(), sale = crypto.randomBytes(8).toString('hex');
      const h = { hid: S.n++, owner: p.name, nome: testo(d.nome, 28), model, muro: lim(d.muro | 0, 0, DATI.muri.length - 1), pav: lim(d.pav | 0, 0, DATI.pavimenti.length - 1),
        mus: m.mus, msg: '', aperta: true, arr: {}, sale, chiave: impronta(sale, chiave), creata: Date.now(), ultima: Date.now(), visite: 0,
        dep: { items: [], oro: 0 },
        pet: { specie, colore: lim(pt.colore | 0, 0, DATI.specie[specie].c.length - 1), nome: testo(pt.nome, 14) || DATI.specie[specie].n, nato: Date.now(),
          st: { fame: 80, gioia: 80, energia: 90, pulizia: 90 }, aff: 10, xp: 0, lv: 1, dorme: false, t: Date.now(), cd: {}, ultime: [], amici: {} } };
      S.case[K(p.name)] = h; perHid.set(h.hid, h); api.save();
      autentici.set(p.id, K(p.name)); incassa();
      api.log(p.name + ' ha costruito la sua casa (' + m.n + ') con ' + h.pet.nome);
      p.send('chiave', { k: chiave, nome: p.name, nuova: 1 });
      inviaIo(p); aggiornaBorghi();
      const e = vai(p, h); if (e) esito(p, e);
      return '';
    }
    function modifica(p, d) {
      const h = casaDi(p); if (!h) return 'Non hai una casa.';
      if (!mia(p, h)) return 'Questa casa è legata a un altro browser: scrivi /casa chiave seguito dal codice.';
      if (!d || typeof d !== 'object') return '';
      let borgo = false;
      const nuovoModello = DATI.modelli[d.model] && d.model !== h.model;
      const conto = (nuovoModello ? Math.round(prezzo(DATI.listino.modelli[d.model]) * DATI.listino.trasloco / 100) : 0) +
        (d.muro != null && (d.muro | 0) !== h.muro ? prezzo(DATI.listino.colore) : 0) + (d.pav != null && (d.pav | 0) !== h.pav ? prezzo(DATI.listino.colore) : 0);
      const [incassa, noOro] = cassa(p, h, conto, d.oro); if (noOro) { inviaCasa(h); return noOro; }
      incassa();
      if (nuovoModello) { h.model = d.model; h.arr = {}; api.log(p.name + ' ha traslocato in: ' + DATI.modelli[d.model].n); borgo = true; }
      if (d.muro != null) h.muro = lim(d.muro | 0, 0, DATI.muri.length - 1);
      if (d.pav != null) h.pav = lim(d.pav | 0, 0, DATI.pavimenti.length - 1);
      if (d.mus != null && DATI.musiche.some(m => m[0] === d.mus)) h.mus = d.mus;
      if (d.nome != null) { h.nome = testo(d.nome, 28); borgo = true; }
      if (d.msg != null) h.msg = testo(d.msg, 80);
      if (d.petNome != null && testo(d.petNome, 14)) { h.pet.nome = testo(d.petNome, 14); borgo = true; }
      if (d.petColore != null) h.pet.colore = lim(d.petColore | 0, 0, DATI.specie[h.pet.specie].c.length - 1);
      if (d.aperta != null && !!d.aperta !== h.aperta) {
        h.aperta = !!d.aperta; borgo = true;
        if (!h.aperta) for (const v of dentro(h)) if (!mia(v, h)) v.send('fuori', { testo: h.owner + ' ha chiuso la casa.' });
        esito(p, h.aperta ? 'La tua casa è aperta alle visite.' : 'La tua casa è chiusa: entri solo tu.');
      }
      api.save(); inviaCasa(h); inviaIo(p); if (borgo) aggiornaBorghi();
      return '';
    }
    function arredi(p, d) {
      const h = casaDi(p); if (!h || !mia(p, h)) return 'Puoi arredare solo la tua casa.';
      const arr = d && d.arr, e = controllaArredi(h.model, arr, C.maxArredi | 0);
      if (e) { inviaCasa(h); return e; }
      const [incassa, noOro] = cassa(p, h, costoArredi(h.arr, arr, PCT()), d.oro); if (noOro) { inviaCasa(h); return noOro; }
      incassa();
      h.arr = {}; for (const k of Object.keys(arr)) h.arr[k] = arr[k];
      api.save(); inviaCasa(h); inviaIo(p);
      return 'Arredi salvati.';
    }

    // ---------- cure al pet ----------
    function cura(p, hid, a, oro) {
      const h = perHid.get(+hid); if (!h || !h.pet) return 'Questa casa non c\'è più.';
      if (p.zone !== zona(h)) return 'Devi essere nella casa per prenderti cura del pet.';
      const io = mia(p, h), q = h.pet, ora = Date.now();
      if (!io && !h.aperta) return 'La casa è chiusa.';
      aggiorna(q);
      if (a === 'dormi' || a === 'sveglia') {
        if (!io) return 'Solo il padrone di casa può mettere a nanna ' + q.nome + '.';
        q.dorme = a === 'dormi'; api.save();
        for (const v of dentro(h)) v.send('petfx', { hid: h.hid, a, chi: p.name });
        inviaPet(h); return q.dorme ? q.nome + ' si acciambella nella cuccia.' : q.nome + ' si stiracchia.';
      }
      const A = AZ[a]; if (!A) return '';
      if (!A.chi.includes(io ? 'p' : 'v')) return io ? 'Questo lo fanno gli ospiti.' : 'Questo lo può fare solo il padrone di casa.';
      if (q.dorme) return q.nome + ' sta dormendo: lascialo riposare.';
      const att = attese(h, p)[a]; if (att > 0) return 'Aspetta ancora ' + (att > 60000 ? Math.ceil(att / 60000) + ' minuti' : Math.ceil(att / 1000) + ' secondi') + '.';
      const no = A.no && A.no(q); if (no) return q.nome + ' ' + no + '.';
      const [incassa, noOro] = cassa(p, h, a === 'nutri' ? prezzo(DATI.listino.cibo) : 0, oro); if (noOro) return noOro;
      incassa();
      let utile = 0;
      for (const k in A.fx) { const prima = q.st[k]; q.st[k] = lim(prima + A.fx[k], 0, 100); if (A.fx[k] > 0) utile += q.st[k] - prima; }
      if (io) { attesaProp.set(h.hid + '|' + a, ora); q.aff = lim(q.aff + (A.aff || 1), 0, 100); }
      else {
        q.cd = q.cd || {}; q.cd[K(p.name) + '|' + a] = ora;
        for (const k of Object.keys(q.cd)) if (ora - q.cd[k] > 86400000) delete q.cd[k];
        q.ultime = (q.ultime || []).concat([{ t: ora, chi: p.name, a }]).slice(-30);
        q.amici = q.amici || {}; q.amici[p.name] = (q.amici[p.name] || 0) + 1;
        const ks = Object.keys(q.amici); if (ks.length > 60) { ks.sort((x, y) => q.amici[x] - q.amici[y]); for (const k of ks.slice(0, ks.length - 60)) delete q.amici[k]; }
        if ((C.xpVisitatore | 0) > 0) try { p.give('xp', C.xpVisitatore | 0); } catch (e) {}
        const o = api.player(h.owner), ul = avvisato.get(h.hid) || 0;
        if (o && o.zone !== zona(h) && ora - ul > 60000) { avvisato.set(h.hid, ora); o.tell(p.name + ' è passato a trovare ' + q.nome + ' nella tua casa.'); }
      }
      let t = a === 'addestra' ? null : A.t(q.nome, io ? '' : p.name), lvSu = 0, trucco = '';
      if (a === 'addestra') { const L = DATI.trucchi.filter(x => x[0] <= q.lv); t = q.nome + ' ' + L[Math.floor(Math.random() * L.length)][1] + '!'; utile = 1; }
      if (utile > 0 && q.lv < LV_MAX) {
        q.xp += A.xp * (1 + q.aff / 200);
        while (q.lv < LV_MAX && q.xp >= xpServe(q.lv)) {
          q.xp -= xpServe(q.lv); q.lv++; lvSu = q.lv;
          const nuovo = DATI.trucchi.find(x => x[0] === q.lv); if (nuovo) trucco = 'ora ' + nuovo[1];
          const oro = (C.regaloLivello | 0) * q.lv;
          if (oro > 0) { h.dep.oro = Math.min(+C.oroMaxDeposito || 1e6, h.dep.oro + oro); const o = api.player(h.owner); if (o) o.tell(q.nome + ' è al livello ' + q.lv + ' e ha trovato ' + oro + ' monete: sono nel tuo deposito.'); }
        }
        if (q.lv >= LV_MAX) q.xp = 0;
      }
      api.save();
      for (const v of dentro(h)) v.send('petfx', { hid: h.hid, a, chi: p.name, testo: v.id === p.id ? '' : t, lv: lvSu, nome: q.nome, trucco });
      inviaPet(h);
      return t;
    }

    // ---------- deposito ----------
    function puoDep(p) {
      const h = casaDi(p);
      if (!h) return [null, 'Non hai una casa.'];
      if (!mia(p, h)) return [null, 'Questo deposito non si apre: serve il codice della casa (/casa chiave).'];
      if (C.depositoSoloInCasa && p.zone !== zona(h)) return [null, 'Il deposito si apre solo stando in casa.'];
      return [h, ''];
    }

    // ---------- dal gioco ----------
    api.onClient('ciao', (p, d) => {
      const h = casaDi(p);
      if (h && d && d.k && impronta(h.sale, d.k) === h.chiave) autentici.set(p.id, K(p.name)); else autentici.delete(p.id);
      inviaIo(p);
      if (p.zone === ZB) inviaBorgo(p);
      if (h && p.zone === zona(h)) p.send('casa', { casa: pubCasa(h, p) });
    });
    api.onClient('borgo?', p => inviaBorgo(p));
    api.onClient('casa', p => {
      const h = casaDi(p); if (!h) { p.send('apri', { p: 'crea' }); return; }
      const e = vai(p, h); if (e) esito(p, e);
    });
    api.onClient('visita', (p, d) => {
      const h = perHid.get(+(d && d.hid)); if (!h) { esito(p, 'Questa casa non c\'è più.'); inviaBorgo(p); return; }
      const e = vai(p, h); if (e) esito(p, e);
    });
    api.onClient('crea', (p, d) => { const e = crea(p, d); if (e) p.send('esito', { testo: e, crea: false }); });
    api.onClient('modifica', (p, d) => { const e = modifica(p, d); if (e) esito(p, e); });
    api.onClient('arredi', (p, d) => { const e = arredi(p, d); if (e) esito(p, e); });
    api.onClient('pet?', (p, d) => { const h = perHid.get(+(d && d.hid)); if (h && h.pet) p.send('pet', { hid: h.hid, pet: petPub(h, p) }); });
    api.onClient('pet', (p, d) => { const e = cura(p, d && d.hid, String(d && d.a || ''), d && d.oro); if (e) esito(p, e); });
    api.onClient('dep?', p => { const [h, e] = puoDep(p); if (h) inviaDep(p, h); else esito(p, e); });
    api.onClient('deposita', (p, d) => {
      const it = pulisciOggetto(d && d.it), u = d && d.it && testo(String(d.it.u || ''), 12);
      const [h, e] = puoDep(p);
      if (!h || !it) { p.send('depKo', { u, testo: e || 'Questo oggetto non si può depositare.' }); return; }
      if (h.dep.items.length >= (C.capienzaDeposito | 0)) { p.send('depKo', { u, testo: 'Il deposito è pieno.' }); return; }
      if (h.dep.items.some(x => x.u === it.u)) { p.send('depOk', { u }); inviaDep(p, h); return; }   // già arrivato (messaggio ripetuto)
      h.dep.items.push(it); api.save();
      p.send('depOk', { u }); inviaDep(p, h);
    });
    api.onClient('preleva', (p, d) => {
      const [h, e] = puoDep(p); if (!h) { esito(p, e); return; }
      const i = h.dep.items.findIndex(x => x.u === (d && d.u)); if (i < 0) { inviaDep(p, h); return; }
      const it = h.dep.items.splice(i, 1)[0]; api.save();
      p.send('ricevi', { it }); inviaDep(p, h);
    });
    api.onClient('depOro', (p, d) => {
      const n = Math.floor(+(d && d.n) || 0), [h, e] = puoDep(p);
      if (!(n > 0) || n > 1e9) return;
      if (!h) { p.send('oro', { ko: n, testo: e }); return; }
      const posto = Math.max(0, (+C.oroMaxDeposito || 1e6) - h.dep.oro), m = Math.min(n, posto);
      if (m < n) p.send('oro', { ko: n - m, testo: 'Il deposito tiene al massimo ' + C.oroMaxDeposito + ' monete.' });
      if (m > 0) { h.dep.oro += m; api.save(); p.send('oro', { ok: m }); }
      inviaDep(p, h);
    });
    api.onClient('prelOro', (p, d) => {
      const n = Math.floor(+(d && d.n) || 0), [h, e] = puoDep(p);
      if (!h) { esito(p, e); return; }
      const m = Math.min(Math.max(0, n), h.dep.oro); if (!m) { esito(p, 'Nel deposito non c\'è oro.'); return; }
      h.dep.oro -= m; api.save(); p.send('oro', { ricevi: m }); inviaDep(p, h);
    });
    api.onClient('rotto', (p, L) => api.log('il gioco non ha più ' + [].concat(L).join(', ') + ': il plugin delle case va aggiornato per questa versione'));

    // ---------- chi entra nelle case ----------
    api.on('zone', (p, z, era) => {
      const hid = hidDi(z);
      if (hid) {
        const h = perHid.get(hid); if (!h) { p.send('fuori', { testo: 'Questa casa non c\'è più.' }); return; }
        if (!mia(p, h) && !h.aperta) { p.send('fuori', { testo: 'La casa di ' + h.owner + ' è chiusa.' }); return; }
        h.ultima = Date.now();
        if (!mia(p, h)) { h.visite = (h.visite || 0) + 1; const o = api.player(h.owner); if (o && o.zone !== zona(h)) o.tell('🏠 ' + p.name + ' è entrato nella tua casa.'); }
        p.send('pet', { hid, pet: petPub(h, p) });
        for (const v of dentro(h)) if (v.id !== p.id) v.tell(p.name + ' è entrato.');
      }
      if (z === ZB) inviaBorgo(p);
    });
    api.on('leave', p => { autentici.delete(p.id); });
    // il pet cambia anche quando nessuno lo tocca: chi è in casa vede le statistiche aggiornate
    api.every(30000, () => {
      const viste = new Set();
      for (const p of api.players()) { const h = perHid.get(hidDi(p.zone)); if (h && !viste.has(h)) { viste.add(h); inviaPet(h); } }
    });
    // dopo una Ricarica del plugin chi è già collegato si ripresenta da solo solo ricaricando la pagina: intanto gli si manda lo stato
    api.after(500, () => { for (const p of api.players()) { inviaIo(p); const h = perHid.get(hidDi(p.zone)); if (h) p.send('casa', { casa: pubCasa(h, p) }); } });

    // ---------- comandi ----------
    api.command('casa', 'vai a casa tua (la prima volta la costruisci). /casa chiave per il codice della casa', (p, args) => {
      const sub = K(args[0] || '');
      if (sub === 'chiave' || sub === 'codice') {
        if (args[1]) return provaChiave(p, args.slice(1).join('')) || 'Codice giusto: da questo browser la casa è di nuovo tua.';
        const h = casaDi(p); if (!h) return 'Non hai una casa: scrivi /casa per costruirla.';
        if (!mia(p, h)) return 'Su questo browser il codice della casa non c\'è. Scrivi /casa chiave seguito dal codice; se l\'hai perso, chiedi all\'admin.';
        p.send('apri', { p: 'casa', tab: 'chiave' }); return;
      }
      if (sub === 'gestisci' || sub === 'impostazioni') { p.send('apri', { p: 'casa' }); return; }
      const h = casaDi(p); if (!h) { p.send('apri', { p: 'crea' }); return 'Scegli il modello della tua casa e il tuo pet.'; }
      return vai(p, h) || undefined;
    });
    api.command('visita', 'entra nella casa di un altro eroe: /visita <nome>', (p, args) => {
      if (!args[0]) { p.send('apri', { p: 'borgo' }); return; }
      const h = cercaCasa(args.join(' ')); if (!h) return 'Non trovo la casa di ' + args.join(' ') + '. Scrivi /case per vederle tutte.';
      return vai(p, h) || undefined;
    });
    api.command('borgo', 'vai al ' + C.nomeBorgo, p => { if (vietata(p)) return 'Da qui non si può andare al Borgo.'; p.send('vai', { borgo: 1 }); });
    api.command('case', 'le case del ' + C.nomeBorgo, p => {
      const L = lista(p); if (!L.length) return 'Ancora nessuna casa. Scrivi /casa per costruire la tua.';
      return 'Case (' + L.length + '): ' + L.slice(0, 25).map(c => (c.on ? '● ' : '') + c.owner + (c.aperta ? '' : ' 🔒') + (c.pet ? ' (' + c.pet.nome + ')' : '')).join(' · ') + '. Per entrare: /visita <nome>';
    });
    api.command('pet', 'come sta il tuo pet', p => {
      const h = casaDi(p); if (!h) return 'Non hai ancora un pet: scrivi /casa per costruire la casa e sceglierlo.';
      const q = petPub(h);
      return q.nome + ' (liv ' + q.lv + ')' + (q.dorme ? ' dorme' : '') + ' · sazietà ' + q.st.fame + ' · allegria ' + q.st.gioia + ' · energia ' + q.st.energia + ' · pulizia ' + q.st.pulizia;
    });

    // ---------- pagina per l'admin: /plugins/<id>/admin ----------
    api.route('GET', 'admin', (req, res, x) => {
      const L = Object.values(S.case).sort((a, b) => a.hid - b.hid), e = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
      x.send('<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Case · admin</title>' +
        '<style>body{font:14px system-ui,sans-serif;background:#141822;color:#e8ecf4;margin:16px}table{border-collapse:collapse;width:100%}td,th{padding:6px 8px;border-bottom:1px solid #fff2;text-align:left}button{padding:4px 8px;border-radius:4px;border:0;cursor:pointer;margin:1px}.k{font:700 15px monospace;background:#0006;padding:8px;border-radius:4px;display:inline-block;margin-top:6px}</style>' +
        '<h2>Case del ' + e(C.nomeBorgo) + ' (' + L.length + ')</h2><p>Se un giocatore perde il codice della sua casa, generane uno nuovo e daglielo: lo scrive in chat con /casa chiave &lt;codice&gt;.</p><div id="out"></div>' +
        '<table><tr><th>#</th><th>Eroe</th><th>Casa</th><th>Pet</th><th>Deposito</th><th>Visite</th><th>Costruita</th><th></th></tr>' +
        L.map(h => '<tr><td>' + h.hid + '</td><td>' + e(h.owner) + '</td><td>' + e(h.nome || '—') + '<br><small>' + e((DATI.modelli[h.model] || {}).n) + (h.aperta ? '' : ' · chiusa') + '</small></td><td>' + e(h.pet.nome) + ' <small>(' + e(DATI.specie[h.pet.specie].n) + ', liv ' + h.pet.lv + ')</small></td><td>' + h.dep.items.length + ' oggetti · ' + h.dep.oro + ' oro</td><td>' + (h.visite || 0) + '</td><td>' + new Date(h.creata).toLocaleDateString('it-IT') + '</td>' +
          '<td><button onclick="fai(\'chiave\',' + h.hid + ')">Nuovo codice</button><button onclick="if(confirm(\'Eliminare la casa di ' + e(h.owner).replace(/'/g, '') + ' con deposito e pet?\'))fai(\'elimina\',' + h.hid + ')" style="background:#a33;color:#fff">Elimina</button></td></tr>').join('') + '</table>' +
        '<script>function fai(a,hid){fetch("admin/"+a,{method:"POST",headers:{"x-voxelia":"1","Content-Type":"application/json"},body:JSON.stringify({hid})}).then(r=>r.json()).then(j=>{if(j.k)document.getElementById("out").innerHTML="Nuovo codice per "+j.owner+": <span class=k>"+j.k+"</span>";else if(j.ok)location.reload();else alert(j.err||"Errore")})}</script>');
    }, { admin: true });
    api.route('POST', 'admin/*', (req, res, x) => x.body(b => {
      let j = {}; try { j = typeof b === 'string' ? JSON.parse(b) : b || {}; } catch (e) {}
      const h = perHid.get(+j.hid); if (!h) return x.json(404, { err: 'Casa non trovata' });
      if (x.path === '/admin/chiave') {
        const k = nuovaChiave(); h.chiave = impronta(h.sale, k); api.save();
        for (const [id, n] of autentici) if (n === K(h.owner)) autentici.delete(id);
        const o = api.player(h.owner); if (o) inviaIo(o);
        api.log('nuovo codice per la casa di ' + h.owner);
        return x.json({ k, owner: h.owner });
      }
      if (x.path === '/admin/elimina') {
        for (const v of dentro(h)) v.send('fuori', { testo: 'Questa casa non c\'è più.' });
        delete S.case[K(h.owner)]; perHid.delete(h.hid); api.save(); aggiornaBorghi();
        const o = api.player(h.owner); if (o) inviaIo(o);
        api.log('eliminata la casa di ' + h.owner);
        return x.json({ ok: 1 });
      }
      x.json(404, { err: 'Azione sconosciuta' });
    }), { admin: true });
  },

  stop(api) { for (const p of api.players()) p.send('spegni', {}); }
};
