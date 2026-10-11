// Stress test del server: bot finti che si collegano a questo stesso server come giocatori veri (WebSocket su /ws) e giocano.
// Modalità "partita" (predefinita): i bot vanno nei dungeon piano per piano, combattono mostri e boss (il boss sconfitto
// fa avanzare il ciclo come nel gioco vero), cacciano nelle zone aperte, fanno duelli nella fossa del Colosseo, si scambiano
// oggetti, gettano e raccolgono oggetti a terra, si teletrasportano con /tpa e usano i comandi dei plugin (config "comandi").
// Modalità "leggera": camminano tra poche zone, chattano e chiedono la lista dei giocatori.
// Si avvia SOLO dalla pagina admin /plugins/stress/ (serve l'accesso al pannello): da solo non fa niente.
// Misure: latenza della chat e dei comandi, risposta di "who", durata degli scambi, intervallo tra due aggiornamenti di stato
// (il server li manda ogni 100 ms), ritardo del ciclo di Node, memoria, CPU, messaggi al secondo, errori dei plugin e delle connessioni.
// I bot stanno in una stanza a parte (config "stanza", predefinita "stresstest") e si chiamano StressBot01, StressBot02…
// Con più stanze si dividono tra stresstest1, stresstest2…; con "cambio stanza" escono, entrano in un'altra stanza o ne creano una nuova.
// Nella pagina ci sono dei preset pronti (config "preset", modificabili).
// Pulizia: alla fine i bot escono dalla classifica dell'arena e i cicli dei dungeon della stanza tornano com'erano (con l'accesso
// admin di chi ha avviato il test). Gli altri plugin li riconoscono con globalThis.VoxeliaStress.bot(p) e non li salvano.
// Nota: i bot girano nello stesso processo del server, quindi anche il loro lavoro pesa sulla CPU misurata.
const http = require('http'), crypto = require('crypto');
let monitorEventLoopDelay = null; try { ({ monitorEventLoopDelay } = require('perf_hooks')); } catch (e) {}

const K = n => String(n == null ? '' : n).toLowerCase();
// elenco condiviso dei bot (resta anche dopo una Ricarica, finché i bot non sono usciti del tutto)
const G = globalThis.VoxeliaStress || (globalThis.VoxeliaStress = (() => {
  const bots = new Set();
  return { bots, bot: p => bots.has(K(p && typeof p === 'object' ? p.name : p)) };
})());

const FRASI = ['ciao a tutti', 'qualcuno va nella foresta?', 'vendo spada rara', 'che ore sono?', 'andiamo in taverna',
  'chi viene al colosseo?', 'bel server!', 'mi serve una pozione', 'ci vediamo in piazza', 'test test', 'gg', 'lag?'];

// percentile di un elenco di numeri (q tra 0 e 1)
function pct(a, q) { if (!a.length) return null; const s = a.slice().sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(q * s.length))]; }
const r1 = v => v == null ? null : Math.round(v * 10) / 10;
// raccoglie fino a 20000 campioni scelti a caso (per i percentili dell'intero test)
function serbatoio() { const a = []; let n = 0; return { a, add(v) { n++; if (a.length < 20000) a.push(v); else { const i = Math.floor(Math.random() * n); if (i < 20000) a[i] = v; } } }; }

// client WebSocket minimo (stesso protocollo del server: frame di testo, mascherati come vuole lo standard)
function wsClient(port, h) {
  const req = http.request({ host: '127.0.0.1', port, path: '/ws', headers: { Connection: 'Upgrade', Upgrade: 'websocket', 'Sec-WebSocket-Key': crypto.randomBytes(16).toString('base64'), 'Sec-WebSocket-Version': '13' } });
  let sock = null, buf = Buffer.alloc(0), chiuso = false;
  const fine = perche => { if (chiuso) return; chiuso = true; clearTimeout(to); try { if (sock) sock.destroy(); else req.destroy(); } catch (e) {} h.close(perche); };
  const to = setTimeout(() => { if (!sock) fine('nessuna risposta in 10 secondi'); }, 10000);
  const dati = d => {
    h.bytes(d.length); buf = buf.length ? Buffer.concat([buf, d]) : d;
    for (;;) {
      if (buf.length < 2) return;
      const op = buf[0] & 15; let l = buf[1] & 127, o = 2;
      if (l === 126) { if (buf.length < 4) return; l = buf.readUInt16BE(2); o = 4; }
      else if (l === 127) { if (buf.length < 10) return; l = Number(buf.readBigUInt64BE(2)); o = 10; }
      if (buf.length < o + l) return;
      const p = buf.subarray(o, o + l); buf = buf.subarray(o + l);
      if (op === 1) h.text(p); else if (op === 8) return fine('chiusa dal server');
    }
  };
  req.on('upgrade', (res, s, head) => {
    sock = s; clearTimeout(to); s.setNoDelay(true);
    s.on('data', dati); s.on('close', () => fine('connessione chiusa')); s.on('error', e => fine(e.message));
    if (head && head.length) dati(head);
    h.open();
  });
  req.on('response', r => { r.resume(); fine('il server ha risposto ' + r.statusCode + ' invece di aprire il WebSocket'); });
  req.on('error', e => fine(e.message));
  req.end();
  return {
    send(s) {
      if (!sock || chiuso) return false;
      const b = Buffer.from(s), l = b.length, m = crypto.randomBytes(4); let hd;
      if (l < 126) hd = Buffer.from([0x81, 0x80 | l]);
      else if (l < 65536) { hd = Buffer.alloc(4); hd[0] = 0x81; hd[1] = 0x80 | 126; hd.writeUInt16BE(l, 2); }
      else { hd = Buffer.alloc(10); hd[0] = 0x81; hd[1] = 0x80 | 127; hd.writeBigUInt64BE(BigInt(l), 2); }
      for (let i = 0; i < l; i++) b[i] ^= m[i & 3];
      try { sock.write(Buffer.concat([hd, m, b])); } catch (e) { return false; }
      return true;
    },
    close(perche) { fine(perche || 'chiusa dal test'); },
    get aperto() { return !!sock && !chiuso; }
  };
}

// richiesta al pannello admin del server, con l'accesso di chi ha avviato il test
function admin(port, cookie, corpo) {
  return new Promise(ok => {
    const s = JSON.stringify(corpo);
    const req = http.request({ host: '127.0.0.1', port, path: '/admin/api/act', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(s), 'x-voxelia': '1', Cookie: 'vxadm=' + cookie } }, res => {
      let d = ''; res.on('data', x => d += x); res.on('end', () => { let j = {}; try { j = JSON.parse(d); } catch (e) {} ok({ code: res.statusCode, j }); });
    });
    req.on('error', e => ok({ code: 0, j: { err: e.message } })); req.end(s);
  });
}

// ---------- il mondo del gioco, come lo vede il server ----------
// I mostri del gioco vivono solo nel browser di chi gioca: al server arrivano la posizione, la vita, i colpi (campo "hit" della
// presenza) e, quando cade un boss, il messaggio "dgdone". I bot fanno lo stesso con mostri simulati in proprio.
const DG = {
  tana: { lv: 2, fls: 2, ent: 'forest' }, cripta: { lv: 4, fls: 3, ent: 'rovine' }, piramide: { lv: 6, fls: 3, ent: 'desert' },
  cristallo: { lv: 8, fls: 3, ent: 'peaks' }, fucina: { lv: 10, fls: 3, ent: 'peaks' }, abisso: { lv: 12, fls: 3, ent: 'porto' },
  cittadella: { lv: 15, fls: 4, ent: 'in_castle' }
};
const CACCIA = ['forest', 'desert', 'peaks', 'nord', 'campi', 'porto'];
const SOCIALI = ['in_tavern', 'in_library'];
const OGGETTI = { w: ['Spada', 'Ascia', 'Lancia', 'Arco'], h: ['Elmo', 'Cappuccio'], c: ['Corazza', 'Tunica'], s: ['Scudo', 'Brocchiero'] };
const caso = a => a[Math.floor(Math.random() * a.length)];
const tra = (a, b) => a + Math.random() * (b - a);
const dgDi = z => { const m = /^([a-z]+)@(\d+)$/.exec(z || ''); return m && DG[m[1]] ? { d: m[1], f: +m[2] } : null; };
// zona in cui si muovono i bot: [minimo, massimo] delle coordinate
function area(z) { if (z === 'town') return [28, 44]; if (z === 'arena') return [3, 27]; if (/^in_/.test(z)) return [2, 13]; const g = dgDi(z); if (g) return [4, 40 + g.f * 4]; return [8, 56]; }
function oggetto(lv) { const s = caso(['w', 'h', 'c', 's']), r = Math.random() < .7 ? 0 : Math.random() < .7 ? 1 : 2; return { u: crypto.randomBytes(4).toString('hex'), s, r, v: Math.max(1, lv | 0), n: caso(OGGETTI[s]) + ' di prova', p: 5 + lv * 3, hp: 0, cr: 0, up: 0 }; }

let fermaCorrente = null;   // per fermare il test quando il plugin viene spento o ricaricato
const PS = Buffer.from('{"t":"s",'), PI = Buffer.from('{"t":"pi",');
const inizia = (b, p) => b.length >= p.length && b.compare(p, 0, p.length, 0, p.length) === 0;

module.exports = {
  name: 'Stress test',
  version: '1.2',
  author: 'Voxelia',
  description: 'Bot finti che giocano su questo server, anche su più stanze (dungeon, boss, arena, scambi, comandi), per misurare latenza, tick, memoria ed errori. Pagina admin /plugins/stress/',
  defaults: {
    bot: 20,                 // bot predefiniti nel modulo della pagina
    durataSec: 120,          // durata predefinita
    modo: 'partita',         // "partita": giocano davvero (dungeon, mostri, boss, arena, scambi); "leggera": camminano e basta
    rampaSec: 10,            // i bot entrano a poco a poco in questo tempo
    chatOgniSec: 15,         // ogni bot scrive in chat in media ogni N secondi (0 = mai)
    whoOgniSec: 20,          // ogni bot chiede la lista dei giocatori in media ogni N secondi (0 = mai)
    comandiOgniSec: 25,      // ogni bot usa un comando dei plugin in media ogni N secondi (0 = mai)
    scambioOgniSec: 90,      // in città ogni bot propone uno scambio a un altro bot in media ogni N secondi (0 = mai)
    // comandi che i bot usano (solo quelli che non salvano niente); "tpa *" chiede il teletrasporto da un altro bot
    comandi: ['aiuto', 'plugin', 'taglie', 'serie', 'evento', 'pesca gara', 'pesca record', 'tesoro', 'tesoro classifica',
      'torneo', 'torneo albo', 'coda', 'case', 'pet', 'amici', 'posta', 'tpa *'],
    attivita: { dungeon: 40, caccia: 25, arena: 20, svago: 15 },   // cosa scelgono i bot quando sono in città (pesi)
    cambioZonaSec: 40,       // solo modo "leggera": ogni bot cambia zona in media ogni N secondi (0 = mai)
    zone: ['town', 'in_tavern', 'forest'],   // solo modo "leggera"
    velocita: 3,             // caselle al secondo (il Guardiano segnala sopra 14)
    stanza: 'stresstest',    // codice della stanza dei bot: metti quello di una stanza vera per vederli in gioco
    stanze: 1,               // in quante stanze si dividono i bot all'inizio (stresstest1, stresstest2…; con 1 resta "stanza")
    cambioStanzaSec: 0,      // ogni bot cambia stanza in media ogni N secondi, con una nuova connessione come nel gioco (0 = mai)
    nuoveStanze: 25,         // % dei cambi in cui il bot crea una stanza nuova invece di entrare in una che c'è già
    maxStanze: 50,
    // preset della pagina: i campi mancanti restano come sono nel modulo
    preset: [
      { nome: 'Prova veloce', nota: 'pochi bot per un minuto: controlla che tutto funzioni', bot: 5, durata: 60, modo: 'partita', stanze: 1, cambioStanza: 0, chat: 15, comandi: 10, scambio: 60, who: 20 },
      { nome: 'Serata normale', nota: 'una ventina di giocatori in tre stanze', bot: 20, durata: 300, modo: 'partita', stanze: 3, cambioStanza: 0, chat: 20, comandi: 30, scambio: 90, who: 30 },
      { nome: 'Via vai di stanze', nota: 'i bot escono, entrano e creano stanze di continuo', bot: 40, durata: 300, modo: 'partita', stanze: 4, cambioStanza: 30, chat: 15, comandi: 20, scambio: 90, who: 20 },
      { nome: 'Tante stanze piccole', nota: '100 bot sparsi in 25 stanze', bot: 100, durata: 300, modo: 'partita', stanze: 25, cambioStanza: 120, chat: 20, comandi: 30, scambio: 90, who: 30 },
      { nome: 'Tutti in piazza', nota: '80 bot nella stessa stanza e zona: il caso più pesante per il server', bot: 80, durata: 180, modo: 'leggera', stanze: 1, cambioStanza: 0, chat: 10, comandi: 20, scambio: 0, who: 15 },
      { nome: 'Raffica di chat e comandi', nota: 'chat ogni 2 s e comandi ogni 4 s per bot', bot: 50, durata: 120, modo: 'leggera', stanze: 2, cambioStanza: 0, chat: 2, comandi: 4, scambio: 0, who: 5 },
      { nome: 'Server pieno', nota: '200 bot in 10 stanze, partita completa con cambi di stanza', bot: 200, durata: 600, modo: 'partita', stanze: 10, cambioStanza: 90, chat: 15, comandi: 20, scambio: 60, who: 20 },
      { nome: 'Resistenza (1 ora)', nota: '30 bot per un\'ora: cerca perdite di memoria e rallentamenti', bot: 30, durata: 3600, modo: 'partita', stanze: 3, cambioStanza: 300, chat: 20, comandi: 30, scambio: 90, who: 30 }
    ],
    maxBot: 200,
    maxDurataSec: 3600,
    alzaMaxGiocatori: true   // alza per il test il limite di giocatori del server, poi lo rimette com'era
  },

  setup(api) {
    const C = api.config, PORT = +api.port || 3000;
    const S = api.store; S.storico = Array.isArray(S.storico) ? S.storico : []; S.daPulire = Array.isArray(S.daPulire) ? S.daPulire : [];
    if (!Array.isArray(S.cicli)) S.cicli = [];   // cicli dei dungeon da rimettere com'erano: [{ stanza, runs }]
    let T = null;          // test in corso (o appena finito, finché non se ne avvia un altro)
    let ultimo = null;     // risultato dell'ultimo test

    const cookieDi = req => { const m = (req.headers.cookie || '').match(/(?:^|;\s*)vxadm=([^;]+)/); return m ? m[1] : ''; };
    const conta = (o, k, n) => { o[k] = (o[k] || 0) + (n || 1); };

    // ---------- avvio ----------
    function avvia(o, cookie) {
      if (T && T.attivo) return 'C\'è già un test in corso';
      const cfg = api.server.cfg;
      if (cfg.lock) return 'Il server è in manutenzione (lock): i bot verrebbero rifiutati';
      const n = Math.max(1, Math.min(+C.maxBot || 200, Math.round(+o.bot || 0)));
      const durata = Math.max(10, Math.min(+C.maxDurataSec || 3600, Math.round(+o.durata || C.durataSec)));
      const stanza = String(o.stanza || C.stanza || 'stresstest').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 16) || 'stresstest';
      const num = v => (v === '' || v == null || !isFinite(+v)) ? null : Math.max(0, +v);
      const chat = num(o.chat) ?? +C.chatOgniSec, who = num(o.who) ?? +C.whoOgniSec, zona = num(o.zona) ?? +C.cambioZonaSec;
      const cmd = num(o.comandi) ?? +C.comandiOgniSec, scambio = num(o.scambio) ?? +C.scambioOgniSec;
      const modo = (o.modo || C.modo) === 'leggera' ? 'leggera' : 'partita';
      const maxSt = Math.max(1, Math.min(200, +C.maxStanze || 50)), nSt = Math.max(1, Math.min(maxSt, n, Math.round(num(o.stanze) ?? +C.stanze ?? 1) || 1));
      const cambio = num(o.cambioStanza) ?? (+C.cambioStanzaSec || 0), base = stanza.slice(0, 13);
      const stanze = nSt === 1 ? [stanza] : Array.from({ length: nSt }, (_, i) => base + (i + 1));
      const zone = (Array.isArray(C.zone) && C.zone.length ? C.zone : ['town']).map(String);
      // nomi liberi: niente bot con il nome di un giocatore online o già in classifica
      const occupati = new Set([...api.players().map(p => K(p.name)), ...api.server.leaderboard().map(s => K(s.n))]);
      const nomi = []; for (let i = 1; nomi.length < n && i < 10000; i++) { const nm = 'StressBot' + String(i).padStart(n >= 100 ? 3 : 2, '0'); if (!occupati.has(K(nm))) nomi.push(nm); }
      const reali = api.players().filter(p => !G.bot(p)).length;
      T = {
        attivo: true, inizio: Date.now(), durata, n, stanza, modo, chat, who, zona, zone, cmd, scambio, cookie, nomi,
        bots: [], timers: [], serie: [], motivo: '', eid: 0, attesaArena: [], runs: {},
        stanze, base, maxSt, cambio, cambi: 0, latRientro: serbatoio(), pvp: cfg.pvp, trade: cfg.trade, chatOn: cfg.chat,
        maxpPrima: cfg.maxp, maxpMessa: null, reali,
        // contatori
        conn: 0, picco: 0, falliti: 0, cadute: 0, espulsi: {}, errori: {}, rifiuti: {}, inMsg: 0, inB: 0, outMsg: 0, outB: 0,
        chatInv: 0, chatRic: 0, chatPerse: 0, attesa: new Map(), seq: 0,
        latChat: serbatoio(), latWho: serbatoio(), latCmd: serbatoio(), latScambio: serbatoio(), tick: serbatoio(), loop: serbatoio(),
        g: { mostri: 0, boss: 0, dgdone: 0, cicli: 0, morti: 0, pozioni: 0, dungeon: 0, duelli: 0, vittorie: 0, scambi: 0, scambiNo: 0, gettati: 0, raccolti: 0, tp: 0, livelli: 0 },
        c: { inviati: 0, risposte: 0, sconosciuti: 0, bloccati: 0, senza: 0, perComando: {}, erroriPlugin: {} },
        sec: { chat: [], who: [], tick: [], cmd: [], inMsg: 0, inB: 0, outMsg: 0 },
        mem0: process.memoryUsage(), rssMax: 0, heapMax: 0, cpuT: process.cpuUsage(), cpuOra: Date.now(), cpuMax: 0, cpuSomma: 0, cpuN: 0
      };
      for (const st of stanze) registra(T, st);
      if (C.alzaMaxGiocatori !== false && reali + n > cfg.maxp) {
        const m = Math.min(500, reali + n + 1); api.server.setCfg({ maxp: m }); T.maxpMessa = m;
      }
      for (const nm of nomi) G.bots.add(K(nm));
      if (monitorEventLoopDelay) { try { T.h = monitorEventLoopDelay({ resolution: 10 }); T.h.enable(); } catch (e) { T.h = null; } }
      // ingresso graduale dei bot
      const passo = n > 1 ? (Math.max(0, +C.rampaSec || 0) * 1000) / (n - 1) : 0;
      nomi.forEach((nm, i) => T.timers.push(setTimeout(() => { if (T && T.attivo) nuovoBot(T, nm, stanze[i % stanze.length]); }, Math.round(i * passo))));
      T.timers.push(setInterval(() => passoBot(T), 100));
      T.timers.push(setInterval(() => secondo(T), 1000));
      T.timers.push(setTimeout(() => ferma(T, 'durata raggiunta'), durata * 1000));
      api.log('test avviato (' + modo + '): ' + n + ' bot per ' + durata + ' s ' + (stanze.length > 1 ? 'in ' + stanze.length + ' stanze (' + stanze[0] + '…)' : 'nella stanza ' + stanza) + (cambio > 0 ? ', cambio stanza ogni ' + cambio + ' s' : '') + (T.maxpMessa ? ' (limite giocatori alzato a ' + T.maxpMessa + ')' : ''));
      return '';
    }
    // i cicli dei dungeon di ogni stanza usata dai bot tornano com'erano a fine test
    function registra(t, st) {
      if (t.modo === 'partita' && !S.cicli.some(x => x.stanza === st)) { S.cicli.push({ stanza: st, runs: api.server.runs(st) }); api.save(); }
    }

    // ---------- un bot ----------
    function nuovoBot(t, nome, stanza) {
      const lv = 1 + Math.floor(Math.random() * 30), mx = 100 + lv * 20;
      const b = { nome, stanza, zona: 'town', run: null, x: 0, y: 0, tx: 0, ty: 0, on: false, sid: '', lastS: 0, whoT: 0, lc: 0, say: null,
        lv, mx, hp: mx, g: 50 + lv * 30, pot: 5, kill: 0, hits: [], seq: 0, runs: {}, terra: new Map(), prendi: null,
        att: 'giro', fino: 0, piano: [], passo: null, mostri: [], target: null, cdA: 0, ultimoBoss: 0,
        duello: null, duelli: 0, arenaDa: 0, tr: null, cmdAtteso: null, coda: [],
        ap: [Math.floor(Math.random() * 6), Math.floor(Math.random() * 6), Math.floor(Math.random() * 9), Math.floor(Math.random() * 6), Math.floor(Math.random() * 4), Math.floor(Math.random() * 8), Math.floor(Math.random() * 6), Math.floor(Math.random() * 7), Math.floor(Math.random() * 3), 0] };
      if (t.modo === 'leggera') b.zona = caso(t.zone);
      posto(b); b.fino = Date.now() + tra(3000, 10000); t.bots.push(b);
      collega(t, b);
    }
    function collega(t, b) {
      const nome = b.nome;
      b.ws = wsClient(PORT, {
        open() { b.ws.send(JSON.stringify({ t: 'hello', code: b.stanza, name: nome })); t.outMsg++; },
        bytes(n) { t.inB += n; t.sec.inB += n; },
        text(p) {
          t.inMsg++; t.sec.inMsg++;
          if (inizia(p, PS)) { const ora = Date.now(); if (b.lastS) { const d = ora - b.lastS; t.tick.add(d); if (t.sec.tick.length < 5000) t.sec.tick.push(d); } b.lastS = ora; return; }
          let m; try { m = JSON.parse(p.toString()); } catch (e) { return; }
          if (!m || typeof m !== 'object') return;
          if (inizia(p, PI)) { invia(t, b, { t: 'po', s: m.s }); return; }
          try { messaggio(t, b, m); } catch (e) { conta(t.errori, 'errore nel bot: ' + e.message); }
        },
        close(perche) {
          if (b.on) t.conn--; const era = b.on; b.on = false; b.chiuso = true;
          if (b.duello) fineDuello(t, b, Date.now());
          if (!t.attivo || b.kick || b.cambio) return;  // gli espulsi sono già contati; il cambio di stanza è voluto
          if (era) { t.cadute++; conta(t.errori, 'disconnesso: ' + perche); }
          else { t.falliti++; conta(t.errori, 'connessione non riuscita: ' + perche); }
        }
      });
    }
    // il bot esce dalla sua stanza e entra in un'altra (o ne crea una nuova), con una nuova connessione come fa il gioco
    function cambiaStanza(t, b, ora) {
      let dove;
      if (t.stanze.length < t.maxSt && Math.random() * 100 < Math.max(0, +C.nuoveStanze || 0)) {
        for (let i = t.stanze.length + 1; !dove && i < 1000; i++) if (!t.stanze.includes(t.base + i)) dove = t.base + i;
        if (dove) { t.stanze.push(dove); registra(t, dove); }
      } else dove = caso(t.stanze.filter(s => s !== b.stanza));
      if (!dove) return;
      t.attesaArena = t.attesaArena.filter(x => x !== b);
      if (b.tr) invia(t, b, { t: 'tr', a: 'x' });
      Object.assign(b, { cambio: 1, tr: null, piano: [], passo: null, att: 'giro', zona: t.modo === 'leggera' ? caso(t.zone) : 'town', run: null, cmdAtteso: null, coda: [], mostri: [], target: null, prendi: null, whoT: 0 });
      b.terra.clear(); posto(b); b.lastS = 0; b.ws.close('cambio stanza');
      setTimeout(() => { if (!t.attivo) return; b.cambio = 0; b.stanza = dove; b.cambioDa = Date.now(); b.fino = Date.now() + tra(3000, 10000); collega(t, b); }, Math.round(tra(300, 1500)));
    }
    function invia(t, b, o) { const s = JSON.stringify(o); if (b.ws && b.ws.send(s)) { t.outMsg++; t.sec.outMsg++; t.outB += s.length; } }
    const rmDi = (t, b) => b.stanza + '-' + b.zona + (b.run != null ? '#' + b.run : '');
    function posto(b) { const [a, c] = area(b.zona); b.x = tra(a, c); b.y = tra(a, c); if (b.zona === 'arena') b.y = tra(3, 6); b.tx = b.x; b.ty = b.y; }
    // cambio di zona, come quando nel gioco si attraversa un portale
    function vai(t, b, z) {
      if (z === b.zona && b.run == null) return;
      const g = dgDi(z); b.zona = z; b.run = g ? (b.runs[g.d] || 0) : null;
      posto(b); b.lastS = 0; b.terra.clear(); b.prendi = null; b.mostri = []; b.target = null;
      invia(t, b, { t: 'gget', rm: rmDi(t, b) });
    }

    // risposte del server e dei plugin
    function messaggio(t, b, m) {
      const ora = Date.now();
      switch (m.t) {
        case 'id': if (!b.on) { b.on = true; b.sid = m.id; t.conn++; if (t.conn > t.picco) t.picco = t.conn; if (b.cambioDa) { t.cambi++; t.latRientro.add(Date.now() - b.cambioDa); b.cambioDa = 0; } runs(t, b, m.runs); invia(t, b, { t: 'gget', rm: rmDi(t, b) }); } break;
        case 'runs': runs(t, b, m.runs); break;
        case 'kick': { b.kick = 1; conta(t.espulsi, String(m.s || 'espulso').slice(0, 120)); break; }
        case 'err': case 'gerr': {
          const s = String(m.s || 'errore').slice(0, 120);
          if (b.cmdAtteso) { t.c.bloccati++; b.cmdAtteso = null; conta(t.rifiuti, 'comando: ' + s); } else conta(t.rifiuti, s);
          break;
        }
        case 'chat': {
          if (m.adm && m.n !== 'Admin' && b.cmdAtteso) rispostaComando(t, b, String(m.s || ''), ora);
          const g = /#(\d+)$/.exec(String(m.s || '')), a = g && t.attesa.get(+g[1]);
          if (a && !a.ok) { a.ok = 1; const l = ora - a.t; t.chatRic++; t.latChat.add(l); t.sec.chat.push(l); }
          break;
        }
        case 'x': if (b.cmdAtteso) rispostaComando(t, b, '', ora); daPlugin(t, b, m, ora); break;
        case 'who': if (b.whoT) { const l = ora - b.whoT; b.whoT = 0; t.latWho.add(l); t.sec.who.push(l); } break;
        // oggetti a terra nella stessa zona
        case 'glist': if (m.rm === rmDi(t, b) && Array.isArray(m.list)) for (const g of m.list) b.terra.set(g.gid, g); break;
        case 'gadd': if (m.rm === rmDi(t, b) && m.g) { b.terra.set(m.g.gid, m.g); if (!b.prendi && !b.duello && Math.hypot(m.g.x - b.x, m.g.y - b.y) < 12 && Math.random() < .5) b.prendi = m.g.gid; } break;
        case 'gdel': b.terra.delete(m.id); if (b.prendi === m.id) b.prendi = null; break;
        case 'ggot': t.g.raccolti++; break;
        // arena: un colpo ricevuto da un altro bot
        case 'hit': {
          if (b.zona !== 'arena' || !b.duello || b.hp <= 0) break;
          b.hp -= Math.max(1, m.d | 0);
          if (b.hp <= 0) { invia(t, b, { t: 'ko', by: m.from }); t.g.duelli++; b.hp = b.mx; fineDuello(t, b, ora); }
          break;
        }
        case 'ar': if (m.gain) t.g.vittorie++; break;
        case 'tr': scambio(t, b, m, ora); break;
      }
    }
    function runs(t, b, r) {
      if (!r || typeof r !== 'object') return; b.runs = Object.assign({}, r);
      for (const d in r) { const k = b.stanza + ':' + d; if ((r[d] | 0) > (t.runs[k] | 0)) { if (k in t.runs) t.g.cicli += (r[d] | 0) - t.runs[k]; t.runs[k] = r[d] | 0; } }
    }

    // ---------- comandi dei plugin ----------
    function comando(t, b, ora) {
      let s = b.coda.shift();
      if (!s) {
        const L = Array.isArray(C.comandi) ? C.comandi : []; if (!L.length) return;
        s = String(caso(L));
        if (/\*/.test(s)) { const o = caso(t.bots.filter(x => x !== b && x.on && x.stanza === b.stanza)); if (!o) return; s = s.replace('*', o.nome); }
      }
      const k = s.split(/\s+/)[0];
      b.lc = ora; b.cmdAtteso = { t: ora, k }; t.c.inviati++; conta(t.c.perComando, '/' + k);
      invia(t, b, { t: 'chat', s: '/' + s, z: b.zona });
    }
    function rispostaComando(t, b, s, ora) {
      const a = b.cmdAtteso; b.cmdAtteso = null; const l = ora - a.t;
      t.c.risposte++; t.latCmd.add(l); t.sec.cmd.push(l);
      if (/^Comando sconosciuto/.test(s)) t.c.sconosciuti++;
      const e = /errore nel plugin (.+?)\.?$/.exec(s); if (e) conta(t.c.erroriPlugin, e[1] + ' (/' + a.k + ')');
    }
    // messaggi che i plugin mandano al loro codice nel gioco: i bot rispondono come farebbe il gioco
    function daPlugin(t, b, m, ora) {
      const d = m.d || {};
      if (m.pl === 'tpa') {
        if (m.e === 'verifica') invia(t, b, { t: 'x', pl: m.pl, e: 'verifica', d: { id: d.id } });
        else if (m.e === 'richiesta') b.coda.push('tpaccetta');
        else if (m.e === 'vai') {
          const libero = !b.duello && !b.tr && !dgDi(b.zona) && !dgDi(d.zk) && d.zk !== 'arena';
          if (!libero) { invia(t, b, { t: 'x', pl: m.pl, e: 'esito', d: { id: d.id, perche: 'Il bot è occupato in questo momento.' } }); return; }
          if (d.zk && d.zk !== b.zona) vai(t, b, String(d.zk));
          if (isFinite(+d.x) && isFinite(+d.y)) { b.x = b.tx = +d.x; b.y = b.ty = +d.y; }
          b.piano = []; b.passo = null; b.att = 'giro'; b.fino = ora + tra(4000, 10000);
          invia(t, b, { t: 'x', pl: m.pl, e: 'esito', d: { id: d.id } }); t.g.tp++;
        }
      }
    }

    // ---------- scambi tra bot ----------
    function scambio(t, b, m, ora) {
      if (m.a === 'req') {
        if (b.tr || b.duello || b.att !== 'giro') { invia(t, b, { t: 'tr', a: 'no', to: m.from }); return; }
        b.tr = { da: ora }; invia(t, b, { t: 'tr', a: 'acc', to: m.from });
      } else if (m.a === 'st' && b.tr) {
        if (!b.tr.offerto) { b.tr.offerto = 1; invia(t, b, { t: 'tr', a: 'off', it: [oggetto(b.lv)], g: Math.floor(tra(0, 50)) }); }
        else if (m.you && m.them && m.you.it && m.you.it.length && m.them.it && m.them.it.length && !m.you.ok && !b.tr.ok) { b.tr.ok = 1; invia(t, b, { t: 'tr', a: 'ok' }); }
      } else if (m.a === 'done') {
        if (b.tr && b.tr.io) { t.g.scambi++; t.latScambio.add(ora - b.tr.da); }
        b.tr = null; b.fino = Math.max(b.fino, ora + 2000);
      } else if (m.a === 'end') {
        if (b.tr && b.tr.io) { t.g.scambiNo++; conta(t.rifiuti, 'scambio: ' + String(m.s || '').slice(0, 80)); }
        b.tr = null;
      }
    }
    function proponiScambio(t, b, ora) {
      const o = caso(t.bots.filter(x => x !== b && x.on && x.stanza === b.stanza && x.zona === b.zona && x.att === 'giro' && !x.tr && Math.hypot(x.x - b.x, x.y - b.y) < 12));
      if (!o) return;
      b.tr = { da: ora, io: 1 }; invia(t, b, { t: 'tr', a: 'req', to: o.sid });
    }

    // ---------- arena ----------
    function fineDuello(t, b, ora) {
      const o = b.duello && b.duello.opp; b.duello = null;
      for (const x of [b, o]) if (x) {
        if (x !== b) x.duello = null;
        x.duelli--; x.hp = x.mx; x.arenaDa = ora; x.tx = tra(4, 26); x.ty = tra(3, 6);
      }
    }
    function arena(t, b, ora, v) {
      if (b.duello) {
        const o = b.duello.opp;
        if (!o.on || o.zona !== 'arena' || ora > b.duello.fino) { fineDuello(t, b, ora); return; }
        b.tx = o.x + (b.x < o.x ? -1 : 1); b.ty = o.y; muovi(b, v);
        if (Math.hypot(o.x - b.x, o.y - b.y) < 2.5 && ora > b.cdA) {
          b.cdA = ora + tra(600, 900);
          invia(t, b, { t: 'hit', to: o.sid, d: Math.round(tra(25, 65) + b.lv), cr: Math.random() < .15 });
        }
        return;
      }
      if (b.duelli <= 0 || ora - b.arenaDa > 25000) { t.attesaArena = t.attesaArena.filter(x => x !== b); prossimo(t, b, ora); return; }
      if (!t.attesaArena.includes(b)) t.attesaArena.push(b);
      muovi(b, v * .5); if (Math.hypot(b.tx - b.x, b.ty - b.y) < .3) { b.tx = tra(4, 26); b.ty = tra(3, 6); }
    }
    // coppie per i duelli tra chi aspetta nella sala del Colosseo
    function accoppia(t, ora) {
      t.attesaArena = t.attesaArena.filter(b => b.on && b.zona === 'arena' && !b.duello && b.duelli > 0);
      for (;;) {
        const a = t.attesaArena.find(x => t.attesaArena.some(y => y !== x && y.stanza === x.stanza)); if (!a) break;
        const c = t.attesaArena.find(y => y !== a && y.stanza === a.stanza), f = ora + 40000;
        t.attesaArena = t.attesaArena.filter(x => x !== a && x !== c);
        a.duello = { opp: c, fino: f }; c.duello = { opp: a, fino: f };
        a.x = a.tx = 12.5; c.x = c.tx = 18.5; a.y = a.ty = c.y = c.ty = 19.5; a.hp = a.mx; c.hp = c.mx;
      }
    }

    // ---------- mostri e boss ----------
    function nuovoMostro(t, b, boss) {
      const [a, c] = area(b.zona), g = dgDi(b.zona), lvz = g ? DG[g.d].lv + (b.runs[g.d] | 0) * 3 + g.f : Math.max(1, b.lv - 2);
      const mx = Math.round((40 + lvz * 15) * (boss ? 10 : 1));
      b.mostri.push({ id: 'sb' + (++t.eid), x: tra(a, c), y: tra(a, c), hp: mx, mx, boss: boss || null, cd: 0, at: lvz });
    }
    function lotta(t, b, ora, v) {
      const p = b.passo;
      if (!b.mostri.length && !p.pronti) {
        p.pronti = 1; const n = p.n || Math.round(tra(3, 6));
        for (let i = 0; i < n; i++) nuovoMostro(t, b, null);
        if (p.boss) nuovoMostro(t, b, p.boss);
      }
      // prima i mostri normali, il boss per ultimo
      if (!b.target || b.target.hp <= 0) {
        const vivi = b.mostri.filter(e => e.hp > 0), norm = vivi.filter(e => !e.boss), L = norm.length ? norm : vivi;
        b.target = L.sort((e1, e2) => Math.hypot(e1.x - b.x, e1.y - b.y) - Math.hypot(e2.x - b.x, e2.y - b.y))[0] || null;
      }
      const e = b.target;
      if (!e) {
        if (p.s) { b.mostri = []; p.pronti = 0; return; }                    // caccia a tempo: nuovi mostri
        if (!p.fine) p.fine = ora + tra(800, 2000); else if (ora > p.fine) prossimo(t, b, ora);
        return;
      }
      if (b.prendi && b.terra.has(b.prendi)) { raccogli(t, b, v); return; }
      const dist = Math.hypot(e.x - b.x, e.y - b.y);
      if (dist > 1.2) { b.tx = e.x; b.ty = e.y; muovi(b, v * 1.3); }
      else if (ora > b.cdA) {
        b.cdA = ora + tra(450, 750);
        let dmg = Math.max(1, Math.round(e.mx * (e.boss ? tra(.03, .06) : tra(.15, .35)) * (1 + b.lv / 60)));
        // il Guardiano vuole almeno 60 secondi tra due boss dello stesso eroe: il bot "tiene duro" finché non sono passati
        if (e.boss && e.hp - dmg <= 0 && ora - b.ultimoBoss < 65000) dmg = Math.max(0, e.hp - 1);
        if (dmg > 0) {
          b.hits.push([e.id, +(dmg / e.mx).toFixed(4), ++b.seq]); if (b.hits.length > 14) b.hits.shift();
          e.hp -= dmg;
        }
        if (e.hp <= 0) uccidi(t, b, e, ora);
      }
      // i mostri vicini attaccano
      for (const m of b.mostri) if (m.hp > 0 && ora > m.cd && Math.hypot(m.x - b.x, m.y - b.y) < 1.6) {
        m.cd = ora + tra(1000, 1500); b.hp -= Math.round(b.mx * tra(.03, .07) * (m.boss ? 1.8 : 1));
        if (b.hp < b.mx * .35 && b.pot > 0) { b.pot--; b.hp = b.mx; t.g.pozioni++; }
        if (b.hp <= 0) { t.g.morti++; b.hp = b.mx; b.pot = 5; b.piano = []; vai(t, b, 'town'); b.att = 'giro'; b.passo = null; b.fino = ora + tra(5000, 12000); return; }
      } else if (m.hp > 0 && m !== e && Math.random() < .02) { m.x += tra(-1, 1); m.y += tra(-1, 1); }
    }
    function uccidi(t, b, e, ora) {
      t.g.mostri++; b.kill++; b.target = null; b.g += Math.round(3 + e.at * tra(1, 3));
      if (b.kill % 6 === 0 && b.lv < 50) { b.lv++; b.mx += 20; b.hp = b.mx; t.g.livelli++; }
      if (Math.random() < .1 && b.pot < 9) b.pot++;
      if (Math.random() < .12) { invia(t, b, { t: 'drop', it: oggetto(b.lv), x: +e.x.toFixed(2), y: +e.y.toFixed(2), rm: rmDi(t, b) }); t.g.gettati++; }
      if (e.boss) {
        t.g.boss++; b.ultimoBoss = ora; b.g += 100 + e.at * 10;
        invia(t, b, { t: 'dgdone', d: e.boss, run: b.run | 0 }); t.g.dgdone++;
      }
    }
    function raccogli(t, b, v) {
      const g = b.terra.get(b.prendi); if (!g) { b.prendi = null; return; }
      b.tx = g.x; b.ty = g.y; muovi(b, v);
      if (Math.hypot(g.x - b.x, g.y - b.y) < 1.5) { invia(t, b, { t: 'gtake', id: g.gid, rm: rmDi(t, b) }); b.terra.delete(g.gid); b.prendi = null; }
    }
    function muovi(b, v) { const dx = b.tx - b.x, dy = b.ty - b.y, d = Math.hypot(dx, dy); if (d < 1e-3) return; const s = Math.min(v, d); b.x += dx / d * s; b.y += dy / d * s; }

    // ---------- cosa fa un bot: un piano di passi (zona + attività) ----------
    function nuovoPiano(t, b) {
      if (t.modo === 'leggera') return [{ z: t.zone.length > 1 ? caso(t.zone.filter(z => z !== b.zona)) || b.zona : b.zona, a: 'giro', s: t.zona > 0 ? tra(t.zona * .5, t.zona * 1.5) : 1e9 }];
      if (b.zona !== 'town') return [{ z: 'town', a: 'giro', s: tra(5, 12) }];
      const W = Object.assign({ dungeon: 40, caccia: 25, arena: 20, svago: 15 }, C.attivita || {});
      let r = Math.random() * Object.values(W).reduce((a, x) => a + Math.max(0, +x || 0), 0), scelta = 'svago';
      for (const k of ['dungeon', 'caccia', 'arena', 'svago']) { r -= Math.max(0, +W[k] || 0); if (r < 0) { scelta = k; break; } }
      const ritorno = { z: 'town', a: 'giro', s: tra(6, 15) };
      if (scelta === 'dungeon') {
        const ok = Object.keys(DG).filter(d => DG[d].lv <= b.lv + 3), d = caso(ok.length ? ok : ['tana']), D = DG[d], P = [];
        if (D.ent !== 'town') P.push({ z: D.ent, a: 'giro', s: tra(2, 5) });
        for (let f = 1; f <= D.fls; f++) P.push({ z: d + '@' + f, a: 'lotta', n: 2 + f + Math.floor(Math.random() * 3), boss: f === D.fls ? d : null, dg: d });
        if (D.ent !== 'town') P.push({ z: D.ent, a: 'giro', s: tra(2, 5) });
        P.push(ritorno); return P;
      }
      if (scelta === 'caccia') return [{ z: caso(CACCIA), a: 'lotta', s: tra(25, 60) }, ritorno];
      if (scelta === 'arena' && t.pvp) return [{ z: 'arena', a: 'arena', duelli: 1 + Math.floor(Math.random() * 3) }, ritorno];
      return [{ z: caso(SOCIALI), a: 'giro', s: tra(10, 25) }, ritorno];
    }
    function prossimo(t, b, ora) {
      if (!b.piano.length) b.piano = nuovoPiano(t, b);
      const p = b.passo = b.piano.shift();
      if (p.dg && p.z.endsWith('@1')) t.g.dungeon++;
      vai(t, b, p.z); b.att = p.a; b.target = null;
      if (p.a === 'giro') b.fino = ora + p.s * 1000;
      if (p.a === 'lotta' && p.s) p.fino = ora + p.s * 1000;
      if (p.a === 'arena') { b.duelli = p.duelli; b.arenaDa = ora; }
    }

    // ogni 100 ms, come il gioco vero: movimento, combattimenti e presenza, più chat, "who", comandi e scambi
    function passoBot(t) {
      if (!t.attivo) return;
      const dt = 0.1, v = Math.min(10, Math.max(0, +C.velocita || 3)) * dt, ora = Date.now();
      accoppia(t, ora);
      for (const b of t.bots) {
        if (!b.on) continue;
        if (b.tr && ora - b.tr.da > 20000) { invia(t, b, { t: 'tr', a: 'x' }); b.tr = null; }
        if (b.att === 'giro') {
          if (b.prendi) raccogli(t, b, v);
          else if (!b.tr) { muovi(b, v); if (Math.hypot(b.tx - b.x, b.ty - b.y) < .3) { const [a, c] = area(b.zona); b.tx = tra(a, c); b.ty = tra(a, c); } }
          if (t.modo === 'partita' && t.scambio > 0 && t.trade && !b.tr && b.zona === 'town' && Math.random() < dt / t.scambio) proponiScambio(t, b, ora);
          if (t.cambio > 0 && !b.tr && Math.random() < dt / t.cambio && (t.stanze.length > 1 || t.maxSt > 1)) { cambiaStanza(t, b, ora); continue; }
          if (ora > b.fino && !b.tr) prossimo(t, b, ora);
        } else if (b.att === 'lotta') { lotta(t, b, ora, v); if (b.passo && b.passo.s && b.passo.fino && ora > b.passo.fino && b.att === 'lotta') prossimo(t, b, ora); }
        else if (b.att === 'arena') arena(t, b, ora, v);
        if (!b.on) continue;
        invia(t, b, { t: 'p', d: { rm: rmDi(t, b), zk: b.zona, df: 1, g: b.g, n: b.nome, x: +b.x.toFixed(2), y: +b.y.toFixed(2), hp: Math.max(0, b.hp | 0), mx: b.mx, lv: b.lv, ap: b.ap, fa: 0, c: -1, h: -1, w: 0, wv: 3, s: -1, sw: 0, hit: b.hits, say: b.say } });
        // il server accetta un messaggio di chat (o un comando) ogni 400 ms per giocatore
        if (b.cmdAtteso && ora - b.cmdAtteso.t > 5000) { t.c.senza++; b.cmdAtteso = null; }
        if (ora - b.lc > 450 && !b.cmdAtteso && (b.coda.length || (t.cmd > 0 && Math.random() < dt / t.cmd))) comando(t, b, ora);
        else if (t.chat > 0 && ora - b.lc > 450 && Math.random() < dt / t.chat) {
          const k = ++t.seq, s = FRASI[Math.floor(Math.random() * FRASI.length)] + ' #' + k;
          b.lc = ora; b.say = { s, n: ora % 1000000 }; t.attesa.set(k, { t: ora, ok: 0, altri: t.bots.some(x => x !== b && x.on && x.stanza === b.stanza) }); t.chatInv++;
          invia(t, b, { t: 'chat', s, z: b.zona });
        }
        if (t.who > 0 && !b.whoT && Math.random() < dt / t.who) { b.whoT = ora; invia(t, b, { t: 'who' }); }
      }
    }

    // ogni secondo: un punto per i grafici
    function secondo(t) {
      if (!t.attivo) return;
      const ora = Date.now(), mem = process.memoryUsage(), c = process.cpuUsage(t.cpuT), el = (ora - t.cpuOra) * 1000;
      const cpu = el > 0 ? (c.user + c.system) / el * 100 : 0; t.cpuT = process.cpuUsage(); t.cpuOra = ora;
      t.cpuMax = Math.max(t.cpuMax, cpu); t.cpuSomma += cpu; t.cpuN++; t.rssMax = Math.max(t.rssMax, mem.rss); t.heapMax = Math.max(t.heapMax, mem.heapUsed);
      let loop99 = null, loopMax = null;
      // il campionamento ogni 10 ms aggiunge 10 ms a ogni misura
      if (t.h) { loop99 = Math.max(0, t.h.percentile(99) / 1e6 - 10); loopMax = Math.max(0, t.h.max / 1e6 - 10); t.h.reset(); if (isFinite(loop99)) t.loop.add(loop99); else loop99 = null; }
      // chat non arrivata a nessuno entro 5 secondi (conta solo se nella stanza c'era un altro bot a riceverla)
      for (const [k, a] of t.attesa) if (a.ok || ora - a.t > 5000) { if (!a.ok && a.altri && t.chatOn) t.chatPerse++; t.attesa.delete(k); }
      const ping = api.players().filter(p => G.bot(p) && p.ping >= 0).map(p => p.ping);
      const s = t.sec;
      t.serie.push({ s: Math.round((ora - t.inizio) / 1000), bot: t.conn, inMsg: s.inMsg, inKB: r1(s.inB / 1024), outMsg: s.outMsg,
        chat: r1(pct(s.chat, .95)), who: r1(pct(s.who, .95)), cmd: r1(pct(s.cmd, .95)), tick: r1(pct(s.tick, .95)), loop: r1(loop99), loopMax: r1(loopMax),
        rss: r1(mem.rss / 1048576), heap: r1(mem.heapUsed / 1048576), cpu: r1(cpu), ping: ping.length ? Math.round(ping.reduce((a, b) => a + b, 0) / ping.length) : null });
      if (t.serie.length > 3600) t.serie.shift();
      t.sec = { chat: [], who: [], tick: [], cmd: [], inMsg: 0, inB: 0, outMsg: 0 };
    }

    // ---------- fine del test ----------
    function ferma(t, motivo, subito) {
      if (!t || !t.attivo) return;
      if (!subito) secondo(t);
      t.attivo = false; t.motivo = motivo; t.fine = Date.now();
      for (const x of t.timers) { clearTimeout(x); clearInterval(x); } t.timers = [];
      if (t.h) try { t.h.disable(); } catch (e) {}
      for (const b of t.bots) if (b.ws) b.ws.close('fine del test');
      if (t.maxpMessa != null && api.server.cfg.maxp === t.maxpMessa) api.server.setCfg({ maxp: t.maxpPrima });
      ultimo = riassunto(t);
      S.storico.unshift(ultimo); S.storico.length = Math.min(S.storico.length, 10); api.save();
      api.log('test finito (' + motivo + '): ' + ultimo.giudizio + ' · chat p95 ' + ultimo.chat.p95 + ' ms, tick p95 ' + ultimo.tick.p95 + ' ms, ' + ultimo.picco + '/' + ultimo.bot + ' bot');
      // i nomi dei bot restano riconoscibili finché il server non ha chiuso le loro uscite, poi si fa pulizia
      const nomi = t.nomi.slice(), cookie = t.cookie;
      setTimeout(() => {
        for (const nm of nomi) G.bots.delete(K(nm));
        for (const nm of nomi) if (!S.daPulire.includes(nm)) S.daPulire.push(nm);
        pulisci(cookie);
      }, 3000);
    }
    // toglie i bot dalla classifica dell'arena e rimette i cicli dei dungeon della stanza com'erano (dati in voxelia-data.json)
    let pulendo = false;
    async function pulisci(cookie) {
      if (pulendo || !cookie || (!S.daPulire.length && !S.cicli.length)) return; pulendo = true;
      try {
        const presenti = new Set(api.server.leaderboard().map(s => K(s.n)));
        for (const nm of S.daPulire.slice()) {
          if (api.player(nm)) continue;                          // c'è un giocatore vero con quel nome: lo si lascia stare
          if (presenti.has(K(nm))) { const r = await admin(PORT, cookie, { a: 'lbdel', n: nm }); if (r.code === 401) return; }
          S.daPulire.splice(S.daPulire.indexOf(nm), 1);
        }
        for (const x of S.cicli.slice()) {
          if (T && T.attivo && T.stanze.includes(x.stanza)) continue;   // test ancora in corso in quella stanza
          const ora = api.server.runs(x.stanza), prima = x.runs || {};
          if (JSON.stringify(ora) !== JSON.stringify(prima)) {
            const r = await admin(PORT, cookie, { a: 'runsreset', code: x.stanza }); if (r.code === 401) return;
            for (const d in prima) await admin(PORT, cookie, { a: 'runs', code: x.stanza, d, v: prima[d] });
          }
          S.cicli.splice(S.cicli.indexOf(x), 1);
        }
      } finally { api.save(); pulendo = false; }
    }

    function riassunto(t) {
      const ms = v => v == null ? null : Math.round(v), mb = v => Math.round(v / 1048576);
      const q = s => ({ p50: ms(pct(s.a, .5)), p95: ms(pct(s.a, .95)), p99: ms(pct(s.a, .99)), max: ms(s.a.length ? Math.max(...s.a) : null), n: s.a.length });
      const sec = Math.max(1, ((t.fine || Date.now()) - t.inizio) / 1000), mem = process.memoryUsage();
      const R = {
        quando: t.inizio, durata: Math.round(sec), motivo: t.motivo, bot: t.n, picco: t.picco, stanza: t.stanza, stanze: t.stanze.length, cambi: t.cambi, rientro: q(t.latRientro), reali: t.reali, modo: t.modo,
        ritmo: { chat: t.chat, who: t.who, comandi: t.cmd, scambio: t.scambio, zona: t.zona },
        chat: q(t.latChat), who: q(t.latWho), cmd: q(t.latCmd), scambio: q(t.latScambio), tick: q(t.tick),
        loop: { p99medio: ms(t.loop.a.length ? t.loop.a.reduce((a, b) => a + b, 0) / t.loop.a.length : null), p99max: ms(t.loop.a.length ? Math.max(...t.loop.a) : null) },
        chatInviate: t.chatInv, chatArrivate: t.chatRic, chatPerse: t.chatPerse,
        msgRicevutiSec: Math.round(t.inMsg / sec), kbRicevutiSec: Math.round(t.inB / 1024 / sec), msgInviatiSec: Math.round(t.outMsg / sec),
        memoria: { rssPrima: mb(t.mem0.rss), rssPicco: mb(Math.max(t.rssMax, t.mem0.rss)), rssDopo: mb(mem.rss), heapPrima: mb(t.mem0.heapUsed), heapPicco: mb(Math.max(t.heapMax, t.mem0.heapUsed)) },
        cpu: { media: t.cpuN ? Math.round(t.cpuSomma / t.cpuN) : null, picco: Math.round(t.cpuMax) },
        gioco: Object.assign({}, t.g), comandi: { inviati: t.c.inviati, risposte: t.c.risposte, sconosciuti: t.c.sconosciuti, bloccati: t.c.bloccati, senzaRisposta: t.c.senza, perComando: t.c.perComando, erroriPlugin: t.c.erroriPlugin },
        falliti: t.falliti, cadute: t.cadute, espulsi: t.espulsi, errori: t.errori, rifiuti: t.rifiuti
      };
      const problemi = [], ep = Object.values(t.c.erroriPlugin).reduce((a, b) => a + b, 0);
      if (t.picco < t.n) problemi.push('solo ' + t.picco + ' bot su ' + t.n + ' collegati');
      if (R.tick.p95 != null && R.tick.p95 > 250) problemi.push('aggiornamenti di stato in ritardo');
      if (R.chat.p95 != null && R.chat.p95 > 500) problemi.push('chat lenta');
      if (R.cmd.p95 != null && R.cmd.p95 > 500) problemi.push('comandi lenti');
      if (R.loop.p99max != null && R.loop.p99max > 200) problemi.push('ciclo di Node bloccato a tratti');
      if (t.chatPerse > 0) problemi.push(t.chatPerse + ' messaggi di chat persi');
      if (ep) problemi.push(ep + ' errori nei plugin');
      if (t.cadute || t.falliti) problemi.push((t.cadute + t.falliti) + ' connessioni cadute o non riuscite');
      const lieve = (R.tick.p95 != null && R.tick.p95 > 150) || (R.chat.p95 != null && R.chat.p95 > 200) || (R.cmd.p95 != null && R.cmd.p95 > 200) || (R.loop.p99max != null && R.loop.p99max > 50);
      R.giudizio = problemi.length ? 'In difficoltà: ' + problemi.join(', ') : lieve ? 'Al limite: regge, ma con ritardi' : 'Regge bene';
      return R;
    }

    function vista() {
      const base = { ultimo, storico: S.storico.slice(0, 10), daPulire: S.daPulire.length + S.cicli.filter(x => !(T && T.attivo && T.stanze.includes(x.stanza))).length, config: C };
      if (!T) return Object.assign({ attivo: false }, base);
      const t = T, ora = Date.now(), dove = {}, perStanza = {};
      for (const b of t.bots) if (b.on) conta(perStanza, b.stanza);
      for (const b of t.bots) if (b.on) conta(dove, b.duello ? 'in duello' : b.att === 'arena' ? 'al Colosseo' : dgDi(b.zona) ? 'nei dungeon' : b.att === 'lotta' ? 'a caccia' : b.tr ? 'in uno scambio' : b.zona === 'town' ? 'in città' : 'in giro');
      return Object.assign({
        attivo: t.attivo, inizio: t.inizio, durata: t.durata, passati: Math.round(((t.fine || ora) - t.inizio) / 1000), bot: t.n, conn: t.conn, picco: t.picco, stanza: t.stanza, modo: t.modo, stanze: t.stanze.length, perStanza, cambi: t.cambi,
        serie: t.serie.slice(-600), errori: t.errori, espulsi: t.espulsi, falliti: t.falliti, cadute: t.cadute, chatPerse: t.chatPerse,
        dove, gioco: t.g, comandi: { inviati: t.c.inviati, risposte: t.c.risposte, sconosciuti: t.c.sconosciuti, erroriPlugin: t.c.erroriPlugin }
      }, base);
    }

    // ---------- pagina admin ----------
    api.route('GET', '/', (req, res, x) => x.send(PAGINA.replace('__DEF__', () => JSON.stringify({ bot: C.bot, durata: C.durataSec, modo: C.modo, chat: C.chatOgniSec, who: C.whoOgniSec, comandi: C.comandiOgniSec, scambio: C.scambioOgniSec, zona: C.cambioZonaSec, stanza: C.stanza, stanze: C.stanze, cambioStanza: C.cambioStanzaSec, max: C.maxBot, maxDurata: C.maxDurataSec, maxStanze: C.maxStanze, preset: Array.isArray(C.preset) ? C.preset : [] }).replace(/</g, '\\u003c'))), { admin: true });
    api.route('GET', '/stato', (req, res, x) => x.json(vista()), { admin: true });
    api.route('POST', '/avvia', (req, res, x) => x.body(j => {
      const cookie = cookieDi(req);
      pulisci(cookie);                                         // avanzi di un test interrotto (es. server spento a metà)
      const e = avvia(j, cookie); if (e) return x.json(409, { err: e });
      x.json({ ok: 1 });
    }), { admin: true });
    api.route('POST', '/ferma', (req, res, x) => { if (!T || !T.attivo) return x.json(409, { err: 'Nessun test in corso' }); T.cookie = cookieDi(req) || T.cookie; ferma(T, 'fermato dall\'admin'); x.json({ ok: 1 }); }, { admin: true });
    api.route('POST', '/pulisci', (req, res, x) => { pulisci(cookieDi(req)).then(() => x.json({ ok: 1, rimasti: S.daPulire.length + S.cicli.length })); }, { admin: true });

    fermaCorrente = () => { if (T && T.attivo) ferma(T, 'plugin spento o ricaricato', true); };
  },

  stop() { if (fermaCorrente) fermaCorrente(); fermaCorrente = null; }
};

const PAGINA = `<!doctype html><html lang="it"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Stress test</title>
<style>
body{font:14px system-ui,sans-serif;margin:0;padding:16px;background:#14161c;color:#e8e6e1;max-width:1100px}
h1{font-size:20px;margin:0 0 4px}h2{font-size:16px;margin:22px 0 8px}p{color:#9aa0ab;margin:6px 0}
.box{background:#1c1f27;border:1px solid #2c303a;border-radius:10px;padding:12px 14px;margin:10px 0}
label{display:inline-flex;flex-direction:column;gap:3px;margin:0 12px 10px 0;color:#9aa0ab;font-size:12px}
input,select{background:#101218;color:#e8e6e1;border:1px solid #3a3f4b;border-radius:6px;padding:6px 8px;width:110px;font:inherit}
select{width:auto}
button{background:#2a6a3a;color:#fff;border:0;border-radius:6px;padding:8px 16px;cursor:pointer;font:inherit;font-weight:600}
button.no{background:#8a2f2f}button:disabled{opacity:.4;cursor:default}
.kpi{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px}
.k{background:#1c1f27;border:1px solid #2c303a;border-radius:10px;padding:10px}.k b{display:block;font-size:22px;color:#fff}.k span{color:#9aa0ab;font-size:12px}
.g{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:10px}
.c{background:#1c1f27;border:1px solid #2c303a;border-radius:10px;padding:8px 10px}.c div{color:#9aa0ab;font-size:12px;display:flex;justify-content:space-between}
svg{width:100%;height:70px;display:block}
table{border-collapse:collapse;width:100%}td,th{padding:5px 8px;border-bottom:1px solid #2c303a;text-align:left;vertical-align:top}th{color:#9aa0ab;font-weight:600}
.pr{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 12px}.pr button{background:#262a34;color:#e8e6e1;font-weight:500;padding:7px 12px;border:1px solid #3a3f4b}.pr button:hover{border-color:#6ab0ff}.pr button.on{border-color:#6ab0ff;background:#1d3550}
.ok{color:#7ad48a}.mid{color:#f2b84b}.bad{color:#ff8080}.wrap{overflow-x:auto}.pill{display:inline-block;background:#262a34;border-radius:12px;padding:3px 10px;margin:2px 4px 2px 0;color:#e8e6e1}
</style>
<h1>🧪 Stress test del server</h1>
<p>I bot si collegano a questo server come giocatori veri, in una stanza a parte. In modalità partita entrano nei dungeon, combattono mostri e boss, fanno duelli al Colosseo, si scambiano oggetti e usano i comandi dei plugin.
Non restano nei dati dei giocatori: alla fine escono dalla classifica dell'arena e i cicli dei dungeon della stanza tornano com'erano.</p>
<div class="box" id="form">
<div style="color:#9aa0ab;font-size:12px;margin-bottom:6px">Preset pronti (riempiono il modulo, poi premi Avvia)</div><div class="pr" id="preset"></div><p id="nota" style="margin:-4px 0 10px"></p>
<label>Modalità<select id="modo"><option value="partita">Partita completa</option><option value="leggera">Leggera (camminano e chattano)</option></select></label>
<label>Bot<input id="bot" type="number" min="1"></label>
<label>Durata (secondi)<input id="durata" type="number" min="10"></label>
<label>Chat ogni (s, per bot)<input id="chat" type="number" min="0" step="any"></label>
<label>Comandi ogni (s)<input id="comandi" type="number" min="0" step="any"></label>
<label>Scambio ogni (s)<input id="scambio" type="number" min="0" step="any"></label>
<label>"Chi c'è" ogni (s)<input id="who" type="number" min="0" step="any"></label>
<label>Stanza<input id="stanza"></label>
<label>Stanze all'inizio<input id="stanze" type="number" min="1"></label>
<label>Cambio stanza ogni (s, 0 = mai)<input id="cambioStanza" type="number" min="0" step="any"></label>
<div><button id="via" onclick="via()">Avvia il test</button> <button id="stop" class="no" onclick="ferma()" disabled>Ferma</button> <span id="msg"></span></div>
</div>
<div id="live"></div>
<h2>Test precedenti</h2><div class="wrap" id="storico"></div>
<script>
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const D=__DEF__,$=id=>document.getElementById(id),F=['modo','bot','durata','chat','comandi','scambio','who','stanza','stanze','cambioStanza'];
for(const k of F)if(D[k]!=null)$(k).value=D[k];
$('bot').max=D.max;$('durata').max=D.maxDurata;$('stanze').max=D.maxStanze;
$('preset').innerHTML=(D.preset||[]).map((p,i)=>'<button type="button" data-i="'+i+'" title="'+esc(p.nota||'')+'">'+esc(p.nome||('Preset '+(i+1)))+'</button>').join('');
$('preset').onclick=e=>{const b=e.target.closest('button');if(!b)return;const p=D.preset[+b.dataset.i];for(const k of F)if(p[k]!=null)$(k).value=p[k];
 for(const x of $('preset').children)x.classList.toggle('on',x===b);$('nota').textContent=(p.nome||'')+': '+(p.nota||'')};
const post=(u,b)=>fetch(u,{method:'POST',headers:{'x-voxelia':'1','Content-Type':'application/json'},body:JSON.stringify(b||{})}).then(r=>r.json());
function via(){const b={};for(const k of F)b[k]=$(k).value;
 if(+b.bot>50&&!confirm('Avviare '+b.bot+' bot? Il server sarà sotto sforzo per '+b.durata+' secondi.'))return;
 post('avvia',b).then(j=>{$('msg').textContent=j.err||'';agg()})}
function ferma(){post('ferma').then(j=>{$('msg').textContent=j.err||'';agg()})}
const v=(x,u)=>x==null?'—':x+(u||'');
const col=(x,a,b)=>x==null?'':x<=a?'ok':x<=b?'mid':'bad';
function spark(S,k,u,a,b){const P=S.map(p=>p[k]).filter(x=>x!=null);if(!P.length)return '<div class="c"><div><span>'+u+'</span><span>—</span></div><svg></svg></div>';
 const mx=Math.max(...P,1),n=S.length,pts=S.map((p,i)=>p[k]==null?null:[(n<2?0:i/(n-1))*300,68-(p[k]/mx)*64]).filter(Boolean).map(p=>p[0].toFixed(1)+','+p[1].toFixed(1)).join(' ');
 const last=P[P.length-1];return '<div class="c"><div><span>'+u+'</span><span class="'+col(last,a,b)+'">'+last+' · max '+Math.round(mx*10)/10+'</span></div><svg viewBox="0 0 300 70" preserveAspectRatio="none"><polyline fill="none" stroke="#6ab0ff" stroke-width="1.5" vector-effect="non-scaling-stroke" points="'+pts+'"/></svg></div>'}
function lista(o){const e=Object.entries(o||{});return e.length?e.sort((a,b)=>b[1]-a[1]).map(([s,n])=>esc(s)+' ×'+n).join('<br>'):'nessuno'}
function pills(o){return Object.entries(o||{}).sort((a,b)=>b[1]-a[1]).map(([s,n])=>'<span class="pill">'+esc(s)+': '+n+'</span>').join('')}
function gioco(g){if(!g)return '';return '<p>'+g.mostri+' mostri sconfitti · '+g.boss+' boss · '+g.dungeon+' dungeon iniziati, '+g.dgdone+' boss segnalati al server, '+g.cicli+' cicli avanzati · '+g.morti+' morti · '+g.pozioni+' pozioni · '+g.livelli+' livelli</p>'+
 '<p>Colosseo: '+g.duelli+' duelli finiti, '+g.vittorie+' vittorie contate dal server · Scambi: '+g.scambi+' conclusi, '+g.scambiNo+' non riusciti · Oggetti: '+g.gettati+' gettati, '+g.raccolti+' raccolti · Teletrasporti: '+g.tp+'</p>'}
function comandi(c){if(!c)return '';const ep=Object.keys(c.erroriPlugin||{}).length;
 return '<p>Comandi: '+c.inviati+' usati, '+c.risposte+' con risposta'+(c.sconosciuti?', '+c.sconosciuti+' sconosciuti':'')+(c.bloccati?', '+c.bloccati+' bloccati dal server':'')+(c.senzaRisposta?', '+c.senzaRisposta+' senza risposta':'')+'</p>'+
 (ep?'<p class="bad">Errori nei plugin: '+lista(c.erroriPlugin)+'</p>':'<p class="ok">Nessun errore nei plugin.</p>')}
function riass(R){if(!R)return '';const g=R.giudizio.startsWith('Regge')?'ok':R.giudizio.startsWith('Al limite')?'mid':'bad';
 const riga=(n,q)=>q?'<tr><td>'+n+'</td><td>'+v(q.p50)+'</td><td>'+v(q.p95)+'</td><td>'+v(q.p99)+'</td><td>'+v(q.max)+'</td></tr>':'';
 return '<div class="box"><b class="'+g+'">'+esc(R.giudizio)+'</b><p>'+R.picco+'/'+R.bot+' bot per '+R.durata+' s '+(R.stanze>1?'in '+R.stanze+' stanze':'nella stanza '+esc(R.stanza))+(R.cambi?' con '+R.cambi+' cambi di stanza':'')+(R.modo==='leggera'?' (modalità leggera)':'')+' ('+esc(R.motivo)+'), con '+R.reali+' giocatori veri online.</p>'+
 '<table><tr><th>Misura (ms)</th><th>p50</th><th>p95</th><th>p99</th><th>max</th></tr>'+riga('Latenza chat',R.chat)+riga('Risposta ai comandi',R.cmd)+riga('Risposta "chi c\\'è"',R.who)+riga('Scambio completo',R.scambio&&R.scambio.n?R.scambio:null)+riga('Cambio di stanza (uscita → dentro)',R.rientro&&R.rientro.n?R.rientro:null)+riga('Intervallo stato, ideale 100',R.tick)+'</table>'+
 '<p>Ritardo del ciclo di Node (p99): medio '+v(R.loop.p99medio,' ms')+', peggiore '+v(R.loop.p99max,' ms')+' · CPU media '+v(R.cpu.media,'%')+', picco '+v(R.cpu.picco,'%')+
 ' · Memoria '+R.memoria.rssPrima+' → picco '+R.memoria.rssPicco+' → '+R.memoria.rssDopo+' MB · '+R.msgRicevutiSec+' msg/s ricevuti dai bot ('+R.kbRicevutiSec+' KB/s), '+R.msgInviatiSec+' msg/s inviati</p>'+
 (R.gioco?gioco(R.gioco):'')+(R.comandi?comandi(R.comandi):'')+
 '<p>Chat: '+R.chatInviate+' inviate, '+R.chatArrivate+' arrivate, '+R.chatPerse+' perse · Connessioni non riuscite: '+R.falliti+' · cadute: '+R.cadute+'</p>'+
 '<p>Espulsioni: '+lista(R.espulsi)+'</p><p>Errori: '+lista(R.errori)+'</p>'+(R.rifiuti?'<p>Risposte negative del server (normali durante il gioco): '+lista(R.rifiuti)+'</p>':'')+'</div>'}
function agg(){fetch('stato').then(r=>r.json()).then(s=>{
 $('via').disabled=!!s.attivo;$('stop').disabled=!s.attivo;let h='';
 if(s.serie){const S=s.serie,L=S[S.length-1]||{};
  h+='<h2>'+(s.attivo?'Test in corso: '+s.passati+' / '+s.durata+' s':'Ultimo test')+'</h2><div class="kpi">'+
   '<div class="k"><b>'+s.conn+' / '+s.bot+'</b><span>bot collegati (picco '+s.picco+')</span></div>'+
   '<div class="k"><b class="'+col(L.chat,200,500)+'">'+v(L.chat,' ms')+'</b><span>latenza chat p95</span></div>'+
   '<div class="k"><b class="'+col(L.cmd,200,500)+'">'+v(L.cmd,' ms')+'</b><span>risposta ai comandi p95</span></div>'+
   '<div class="k"><b class="'+col(L.tick,150,250)+'">'+v(L.tick,' ms')+'</b><span>intervallo stato p95</span></div>'+
   '<div class="k"><b class="'+col(L.loop,50,200)+'">'+v(L.loop,' ms')+'</b><span>ritardo ciclo p99</span></div>'+
   '<div class="k"><b>'+v(L.rss,' MB')+'</b><span>memoria (RSS)</span></div>'+
   '<div class="k"><b>'+v(L.cpu,'%')+'</b><span>CPU del processo</span></div>'+
   '<div class="k"><b class="'+(s.falliti+s.cadute?'bad':'ok')+'">'+(s.falliti+s.cadute+Object.values(s.espulsi||{}).reduce((a,b)=>a+b,0))+'</b><span>connessioni perse o rifiutate</span></div></div>';
  if(s.attivo){h+='<p style="margin-top:10px">'+pills(s.dove)+'</p>'+(s.stanze>1||s.cambi?'<p>'+s.stanze+' stanze'+(s.cambi?' · '+s.cambi+' cambi di stanza':'')+': '+pills(s.perStanza)+'</p>':'')+gioco(s.gioco)+comandi(s.comandi)}
  h+='<div class="g" style="margin-top:10px">'+spark(S,'bot','Bot collegati',1e9,1e9)+spark(S,'chat','Latenza chat p95 (ms)',200,500)+spark(S,'cmd','Risposta ai comandi p95 (ms)',200,500)+
   spark(S,'who','Risposta "chi c\\'è" p95 (ms)',200,500)+spark(S,'tick','Intervallo stato p95 (ms)',150,250)+spark(S,'loop','Ritardo ciclo p99 (ms)',50,200)+
   spark(S,'rss','Memoria RSS (MB)',1e9,1e9)+spark(S,'cpu','CPU (%)',60,90)+spark(S,'inKB','Ricevuti dai bot (KB/s)',1e9,1e9)+'</div>';
  if(s.attivo&&Object.keys(s.errori||{}).length)h+='<p>Errori: '+lista(s.errori)+'</p>'}
 if(!s.attivo&&s.ultimo)h+=riass(s.ultimo);
 if(s.daPulire)h+='<p class="mid">Un test interrotto ha lasciato dati dei bot (classifica dell\\'arena o cicli dei dungeon). <button onclick="post(\\'pulisci\\').then(agg)">Pulisci</button></p>';
 $('live').innerHTML=h;
 $('storico').innerHTML=(s.storico||[]).length?'<table><tr><th>Quando</th><th>Bot</th><th>Stanze</th><th>Durata</th><th>Chat p95</th><th>Comandi p95</th><th>Stato p95</th><th>Ciclo p99 max</th><th>RSS picco</th><th>Esito</th></tr>'+s.storico.map(R=>'<tr><td>'+new Date(R.quando).toLocaleString('it-IT')+'</td><td>'+R.picco+'/'+R.bot+'</td><td>'+(R.stanze||1)+'</td><td>'+R.durata+' s</td><td>'+v(R.chat.p95,' ms')+'</td><td>'+v(R.cmd?R.cmd.p95:null,' ms')+'</td><td>'+v(R.tick.p95,' ms')+'</td><td>'+v(R.loop.p99max,' ms')+'</td><td>'+R.memoria.rssPicco+' MB</td><td>'+esc(R.giudizio)+'</td></tr>').join('')+'</table>':'<p>Nessun test ancora.</p>';
}).catch(()=>{})}
agg();setInterval(agg,1000);
</script></html>`;
