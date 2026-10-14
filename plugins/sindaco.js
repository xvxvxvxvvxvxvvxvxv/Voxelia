// Il Sindaco di Aldoria: ogni settimana gli eroi eleggono il sindaco con /vota nome.
// Vota solo chi ha giocato almeno `minutiPerVotare` minuti nella settimana; un voto a testa, si può cambiare fino allo spoglio.
// Il sindaco ha il cappello in chat, fa un discorso annunciato a tutti e una volta al giorno emana un decreto
// scelto dalla lista `decreti` del config. I decreti che toccano altri plugin valgono solo se quel plugin è acceso.
// Tutto lo stato sta in api.store (voxelia-data.json), quindi resta anche dopo un rebuild su suga.app.
const http = require('http'), path = require('path'), fs = require('fs');

module.exports = {
  name: 'Il Sindaco di Aldoria',
  version: '1.0',
  author: 'Voxelia',
  description: 'Elezione settimanale del sindaco e decreti: /vota, /sindaco, /decreto, /discorso',
  defaults: {
    giornoElezione: 0,       // giorno dello spoglio: 0 domenica, 1 lunedì … 6 sabato (ora del server)
    oraElezione: 21,         // ora dello spoglio (ora del server)
    minutiPerVotare: 30,     // minuti di gioco nella settimana per poter votare
    votoPerSe: false,        // si può votare per sé?
    unVotoPerIp: false,      // un solo voto per indirizzo IP (attenzione: chi gioca dalla stessa casa ha lo stesso IP)
    minVoti: 1,              // voti minimi per eleggere qualcuno; se no il sindaco resta in carica
    cappello: '🎩 ',          // prima dei messaggi del sindaco in chat ('' = niente)
    decreti: [
      { id: 'xp', nome: 'Esperienza doppia', tipo: 'xp', per: 2, minuti: 60 },
      { id: 'oro', nome: 'Oro doppio', tipo: 'oro', per: 2, minuti: 60 },
      { id: 'festa', nome: 'Festa in discoteca', tipo: 'festa', minuti: 30, regalo: { oro: 25, pozioni: 1 } },
      { id: 'notte', nome: 'Notte di caccia anticipata', tipo: 'notte' },
      { id: 'sconto', nome: 'Sconto al Mercatino', tipo: 'sconto', percento: 10, minuti: 120 }
    ]
  },

  setup(api) {
    const C = api.config, chiave = n => String(n || '').toLowerCase();
    const bot = p => !!(globalThis.VoxeliaStress && globalThis.VoxeliaStress.bot(p));
    // S.voti = { elettore: { nome, per, perNome, t, ip } }, S.minuti = { eroe: minuti }, S.visti = { eroe: nome },
    // S.discorsi = { eroe: testo }, S.sindaco = { nome, dal, voti, detto, giorno }, S.attivi = [{ id, tipo, fino, … }]
    const st = () => { const s = api.store; for (const k of ['voti', 'minuti', 'visti', 'discorsi']) if (!s[k] || typeof s[k] !== 'object') s[k] = {}; if (!Array.isArray(s.attivi)) s.attivi = []; if (!Array.isArray(s.storia)) s.storia = []; return s; };
    const sindaco = () => st().sindaco || null;
    const eSindaco = p => !!(sindaco() && chiave(sindaco().nome) === chiave(p.name));
    const oggi = () => { const d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); };
    const GIORNI = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];
    const quando = t => { const d = new Date(t); return GIORNI[d.getDay()] + ' alle ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); };
    function prossimaElezione(da) {
      const d = new Date(da); d.setHours(Math.max(0, Math.min(23, C.oraElezione | 0)), 0, 0, 0);
      d.setDate(d.getDate() + ((((C.giornoElezione | 0) % 7) + 7 - d.getDay()) % 7));
      if (d.getTime() <= da) d.setDate(d.getDate() + 7);
      return d.getTime();
    }
    function conta() {
      const per = {};
      for (const v of Object.values(st().voti)) { const r = per[v.per] || (per[v.per] = { nome: v.perNome, n: 0, t: 0 }); r.n++; r.t = Math.max(r.t, v.t); }
      return Object.values(per).sort((a, b) => b.n - a.n || a.t - b.t);   // a pari voti vince chi ci è arrivato prima
    }
    function dai(p, pr) {
      if (!p || !pr) return;
      if (globalThis.VoxeliaGuardiano) globalThis.VoxeliaGuardiano.grazia(p.name);
      if (pr.oro > 0) p.give('gold', pr.oro);
      if (pr.pozioni > 0) p.give('pot', pr.pozioni);
    }

    // un altro plugin è acceso? Lo chiede al server stesso: /plugins/<id>/ risponde «Plugin non trovato» solo se è spento
    function acceso(id, cb) {
      const r = http.get({ host: '127.0.0.1', port: api.port, path: '/plugins/' + encodeURIComponent(id) + '/', timeout: 2000 }, res => {
        let b = ''; res.on('data', d => { if (b.length < 200) b += d; }); res.on('end', () => cb(!/^Plugin non trovato/.test(b)));
      });
      r.on('timeout', () => r.destroy()); r.on('error', () => cb(false));
    }
    // c'è una notte di caccia adesso? (stessa regola di notti.js, letta dal suo config). Serve a non mescolare due moltiplicatori di XP.
    function notteDiCaccia() {
      if (globalThis.VoxeliaNotti && typeof globalThis.VoxeliaNotti.inCorso === 'function') return globalThis.VoxeliaNotti.inCorso();
      let N = {}; try { N = Object.assign({}, require(path.join(api.dir, 'notti.js')).defaults || {}); } catch (e) { return false; }
      try { Object.assign(N, JSON.parse(fs.readFileSync(path.join(api.dir, 'notti.config.json'), 'utf8'))); } catch (e) {}
      const c = api.server.clock(), m = ((c.min % 1440) + 1440) % 1440, h = m / 60, ini = N.oraInizio, fin = N.oraFine;
      const notte = ini > fin ? h >= ini || h < fin : h >= ini && h < fin; if (!notte) return false;
      const n = Math.floor(c.min / 1440) + 1 - (ini > fin && h < fin ? 1 : 0);
      return n > 0 && n % Math.max(1, N.ogniNotti | 0) === 0;
    }

    // ---------- elezione ----------
    function elezione() {
      const s = st(), cl = conta(), vecchio = sindaco(), min = Math.max(1, C.minVoti | 0);
      s.storia.unshift({ t: Date.now(), vincitore: cl[0] && cl[0].n >= min ? cl[0].nome : null, voti: cl.slice(0, 5).map(r => r.nome + ' ' + r.n), elettori: Object.keys(s.voti).length });
      s.storia.length = Math.min(s.storia.length, 30);
      if (cl[0] && cl[0].n >= min) {
        const v = cl[0], rieletto = vecchio && chiave(vecchio.nome) === chiave(v.nome);
        s.sindaco = { nome: v.nome, dal: Date.now(), voti: v.n, detto: false, giorno: '' };
        api.announce('🎩 ' + (rieletto ? v.nome + ' è rieletto sindaco di Aldoria' : 'Aldoria ha un nuovo sindaco: ' + v.nome) + ' con ' + v.n + (v.n === 1 ? ' voto!' : ' voti!') + (cl[1] ? ' Secondo: ' + cl[1].nome + ' (' + cl[1].n + ').' : ''));
        api.broadcast('eletto', { nome: v.nome, voti: v.n });
        const d = s.discorsi[chiave(v.nome)];
        if (d) api.after(4000, () => parla(d));
        const p = api.player(v.nome); if (p) benvenuto(p);
      } else if (vecchio) api.announce('🎩 Nessun voto questa settimana: ' + vecchio.nome + ' resta sindaco di Aldoria.');
      else api.announce('🎩 Nessun voto questa settimana: Aldoria resta senza sindaco. Votate con /vota nome!');
      api.log('spoglio: ' + (cl.length ? cl.map(r => r.nome + ' ' + r.n).join(', ') : 'nessun voto') + ' → ' + (sindaco() ? sindaco().nome : 'nessuno'));
      s.voti = {}; s.minuti = {}; s.discorsi = {};
      s.prossima = prossimaElezione(Date.now()); api.save();
    }
    function parla(testo) {
      const sd = sindaco(); if (!sd) return;
      sd.detto = true; api.save();
      api.announce('🎩 Discorso del sindaco ' + sd.nome + ': «' + String(testo).slice(0, 110) + '»');
      api.broadcast('discorso', { nome: sd.nome, testo: String(testo).slice(0, 160) });
    }
    function benvenuto(p) {
      const sd = sindaco(); if (!sd || chiave(sd.nome) !== chiave(p.name)) return;
      api.after(3000, () => {
        if (!p.online) return;
        p.send('eletto', { nome: sd.nome, voti: sd.voti, tu: true });
        p.tell('Sei il sindaco di Aldoria! ' + (sd.detto ? '' : 'Scrivi il discorso con /discorso testo e leggilo a tutti con /discorso leggi. ') + (sd.giorno === oggi() ? 'Il decreto di oggi l\'hai già emanato.' : 'Puoi emanare un decreto al giorno: /decreto'));
      });
    }

    // ---------- decreti ----------
    const lista = () => (Array.isArray(C.decreti) ? C.decreti : []).filter(d => d && d.tipo);
    const durata = d => Math.max(1, +d.minuti || 60) * 60000;
    const BOOST = { xp: 'xpm', oro: 'gm' };
    function trova(q) { const L = lista(), n = parseInt(q, 10); return n >= 1 && n <= L.length ? L[n - 1] : L.find(d => chiave(d.id) === chiave(q) || chiave(d.nome) === chiave(q)) || null; }
    // fa partire il decreto; cb(errore) se non si può
    function emana(d, p, cb) {
      const s = st(), fino = Date.now() + durata(d), m = Math.round(durata(d) / 60000), min = m + (m === 1 ? ' minuto' : ' minuti');
      if (BOOST[d.tipo]) {
        const k = BOOST[d.tipo];
        if (s.attivi.some(a => a.k === k)) return cb('È già in vigore un decreto così.');
        const go = () => {
          const prima = api.server.cfg[k], val = Math.min(5, Math.round(prima * Math.max(1, +d.per || 2) * 10) / 10);
          if (val <= prima) return cb('Il moltiplicatore è già al massimo.');
          api.server.setCfg({ [k]: val });
          s.attivi.push({ id: d.id, tipo: d.tipo, k, prima, val, fino }); api.save();
          cb(null, (d.tipo === 'xp' ? 'Esperienza ×' : 'Oro ×') + val + ' per ' + min);
        };
        if (k !== 'xpm') return go();
        return acceso('notti', on => on && notteDiCaccia() ? cb('C\'è una notte di caccia in corso: emana il decreto dopo l\'alba.') : go());
      }
      if (d.tipo === 'festa') return acceso('discoteca', on => {
        if (!on) return cb('La Discoteca non è accesa su questo server.');
        if (s.attivi.some(a => a.tipo === 'festa')) return cb('La festa è già in corso.');
        s.attivi.push({ id: d.id, tipo: 'festa', fino, regalo: d.regalo || null, presi: {} }); api.save();
        api.broadcast('festa', { min: Math.round(durata(d) / 60000) });
        cb(null, 'Festa in discoteca per ' + min + ': il portale è in piazza, scrivi /discoteca' + (d.regalo ? '. Regalo all\'ingresso!' : ''));
      });
      // questi due si appoggiano all'aggancio di Notti di caccia 1.1 e Mercatino 1.1 (globalThis.VoxeliaNotti / VoxeliaMercato)
      if (d.tipo === 'notte') {
        const N = globalThis.VoxeliaNotti;
        if (!N || typeof N.anticipa !== 'function') return cb('Le Notti di caccia di questo server non accettano decreti.');
        const e = N.anticipa(p.name); return typeof e === 'string' ? cb(e) : cb(null, (e && e.testo) || 'notte di caccia adesso');
      }
      if (d.tipo === 'sconto') {
        const M = globalThis.VoxeliaMercato;
        if (!M || typeof M.sconto !== 'function') return cb('Il Mercatino di questo server non accetta decreti.');
        const e = M.sconto(Math.max(1, Math.min(100, +d.percento || 10)), durata(d), p.name); return typeof e === 'string' ? cb(e) : cb(null, (e && e.testo) || 'sconto al Mercatino per ' + min);
      }
      cb('Decreto sconosciuto: ' + d.tipo);
    }
    // fine dei decreti a tempo. Se nel frattempo il moltiplicatore è cambiato (una notte di caccia, l'admin), si aspetta
    // che torni al valore del decreto per rimettere quello di prima; dopo un'ora si lascia la scelta di chi l'ha cambiato.
    function scadenze() {
      const s = st(), ora = Date.now(); let cambiato = false;
      s.attivi = s.attivi.filter(a => {
        if (a.fino > ora) { if (a.sospeso) { a.sospeso = false; api.server.setCfg({ [a.k]: a.val }); cambiato = true; } return true; }   // ripresa dopo Ricarica o riavvio
        if (a.k && a.sospeso) { cambiato = true; return false; }
        if (a.k) {
          if (api.server.cfg[a.k] === a.val) { api.server.setCfg({ [a.k]: a.prima }); api.announce('🎩 Finito il decreto del sindaco: ' + (a.tipo === 'xp' ? 'esperienza' : 'oro') + ' di nuovo ×' + a.prima + '.'); cambiato = true; return false; }
          if (ora - a.fino < 3600000) return true;
          api.log('decreto ' + a.id + ': moltiplicatore cambiato da altri, lasciato com\'è');
        }
        if (a.tipo === 'festa') api.announce('🎩 La festa del sindaco è finita. Grazie a tutti!');
        cambiato = true; return false;
      });
      if (cambiato) api.save();
    }

    // ---------- tempo di gioco, chat, ingressi ----------
    api.every(60000, () => {
      const s = st();
      for (const p of api.players()) if (!bot(p)) { const k = chiave(p.name); s.minuti[k] = (s.minuti[k] || 0) + 1; s.visti[k] = p.name; }
      const v = Object.keys(s.visti); if (v.length > 3000) for (const k of v.slice(0, v.length - 3000)) delete s.visti[k];
      api.save();
    });
    api.every(15000, () => { const s = st(); if (!s.prossima) { s.prossima = prossimaElezione(Date.now()); api.save(); } if (Date.now() >= s.prossima) elezione(); scadenze(); });
    api.on('start', () => { const s = st(); if (!s.prossima) { s.prossima = prossimaElezione(Date.now()); api.save(); } if (Date.now() >= s.prossima) elezione(); scadenze(); });

    api.on('join', p => {
      if (bot(p)) return;
      st().visti[chiave(p.name)] = p.name; api.save();
      if (eSindaco(p)) benvenuto(p);
      const f = st().attivi.find(a => a.tipo === 'festa');
      if (f) api.after(3500, () => { if (p.online) p.tell('🎩 Il sindaco ha indetto una festa in discoteca! Scrivi /discoteca.'); });
    });
    api.on('chat', (p, testo) => { if (C.cappello && eSindaco(p) && testo.length + C.cappello.length <= 60) return C.cappello + testo; });
    api.on('zone', (p, z) => {
      if (z !== 'in_discoteca' || bot(p)) return;
      const f = st().attivi.find(a => a.tipo === 'festa'), k = chiave(p.name);
      if (!f || !f.regalo || f.presi[k]) return;
      f.presi[k] = 1; api.save(); dai(p, f.regalo); p.tell('🎩 Regalo della festa del sindaco!');
    });

    // ---------- comandi ----------
    api.command('vota', 'vota il sindaco di Aldoria: /vota nome', (p, args) => {
      const s = st(), k = chiave(p.name), mio = s.voti[k], min = Math.max(0, C.minutiPerVotare | 0), fatti = s.minuti[k] || 0;
      if (!args.length) return (mio ? 'Hai votato ' + mio.perNome + '. ' : '') + 'Scrivi /vota nome. Spoglio ' + quando(s.prossima || prossimaElezione(Date.now())) + '.';
      if (bot(p)) return 'I bot non votano.';
      if (fatti < min) return 'Per votare devi giocare almeno ' + min + (min === 1 ? ' minuto' : ' minuti') + ' in questa settimana: finora ' + fatti + '.';
      const ck = chiave(args.join(' ')), nome = s.visti[ck];
      if (!nome) return 'Non conosco nessun eroe che si chiama «' + args.join(' ') + '».';
      if (ck === k && !C.votoPerSe) return 'Non puoi votare per te stesso.';
      if (C.unVotoPerIp && Object.entries(s.voti).some(([e, v]) => e !== k && v.ip === p.ip)) return 'Da questa rete ha già votato un altro eroe.';
      if (mio && mio.per === ck) return 'Hai già votato ' + nome + '.';
      s.voti[k] = { nome: p.name, per: ck, perNome: nome, t: Date.now(), ip: p.ip }; api.save();
      api.log(p.name + ' vota ' + nome);
      return (mio ? 'Hai cambiato il voto: ora voti ' : 'Hai votato ') + nome + '. Spoglio ' + quando(s.prossima) + '.';
    });

    api.command('sindaco', 'chi è il sindaco, i voti della settimana e i decreti', p => {
      const s = st(), sd = sindaco(), cl = conta(), a = s.attivi.filter(x => x.fino > Date.now());
      return (sd ? '🎩 Sindaco di Aldoria: ' + sd.nome + ' (eletto con ' + sd.voti + (sd.voti === 1 ? ' voto' : ' voti') + ').' : 'Aldoria non ha ancora un sindaco.') +
        (a.length ? '\nIn vigore: ' + a.map(x => (lista().find(d => d.id === x.id) || {}).nome || x.id).join(', ') + '.' : '') +
        '\nVoti di questa settimana: ' + (cl.length ? cl.slice(0, 5).map(r => r.nome + ' ' + r.n).join(', ') : 'ancora nessuno') + '.' +
        '\nSpoglio ' + quando(s.prossima || prossimaElezione(Date.now())) + '.' + ((C.minutiPerVotare | 0) > 0 ? ' Hai giocato ' + (s.minuti[chiave(p.name)] || 0) + ' minuti su ' + (C.minutiPerVotare | 0) + ' per votare.' : '') + ' Vota con /vota nome';
    });

    api.command('decreto', 'i decreti del sindaco: /decreto numero (solo il sindaco)', (p, args) => {
      const L = lista(), sd = sindaco();
      if (!eSindaco(p)) return (sd ? 'Solo il sindaco (' + sd.nome + ') emana decreti.' : 'Aldoria non ha un sindaco: votalo con /vota nome.') + ' Decreti possibili: ' + L.map(d => d.nome).join(', ') + '.';
      if (!args.length) return 'Decreti (uno al giorno' + (sd.giorno === oggi() ? ', oggi già fatto' : '') + '):\n' + L.map((d, i) => (i + 1) + '. ' + d.nome).join('\n') + '\nScrivi /decreto numero.';
      if (sd.giorno === oggi()) return 'Hai già emanato il decreto di oggi. Il prossimo da domani.';
      const d = trova(args.join(' ')); if (!d) return 'Non c\'è questo decreto: scrivi /decreto per la lista.';
      emana(d, p, (e, cosa) => {
        if (e) return p.tell(e);
        const s2 = sindaco(); if (s2) { s2.giorno = oggi(); api.save(); }
        cosa = cosa.charAt(0).toUpperCase() + cosa.slice(1);
        api.announce('🎩 Decreto del sindaco ' + p.name + ': ' + d.nome + '! ' + cosa + (/[.!?]$/.test(cosa) ? '' : '.'));
        api.broadcast('decreto', { nome: d.nome, cosa });
        api.log(p.name + ' emana il decreto ' + d.id);
      });
    });

    api.command('discorso', 'il discorso che leggerai se diventi sindaco: /discorso testo', (p, args, testo) => {
      const s = st(), k = chiave(p.name), sd = sindaco(); let t = String(testo || '').trim();
      if (!t) return s.discorsi[k] ? 'Il tuo discorso: «' + s.discorsi[k] + '»' : 'Scrivi /discorso testo (e /discorso + altro testo per continuarlo): se vinci, lo leggeranno tutti allo spoglio.';
      if (bot(p)) return;
      if (chiave(t) === 'leggi') {
        if (!eSindaco(p)) return 'Solo il sindaco legge il suo discorso a tutti; il tuo verrà letto se vinci.';
        if (sd.detto) return 'Hai già fatto il discorso di questo mandato.';
        if (!s.discorsi[k]) return 'Scrivi prima il discorso con /discorso testo.';
        parla(s.discorsi[k]); return 'Hai letto il tuo discorso a tutta Aldoria.';
      }
      // un messaggio di chat è lungo al massimo 60 caratteri: con "/discorso + …" il discorso continua
      if (t[0] === '+') t = ((s.discorsi[k] || '') + ' ' + t.slice(1).trim()).trim();
      t = t.slice(0, 110);
      s.discorsi[k] = t; api.save();
      if (eSindaco(p) && !sd.detto) return 'Discorso pronto: «' + t + '». Continualo con /discorso + testo, o leggilo a tutti con /discorso leggi.';
      return 'Discorso salvato: «' + t + '». Se vinci l\'elezione, lo leggeranno tutti allo spoglio.';
    });

    // ---------- nel gioco: titoli grandi ----------
    const ID = JSON.stringify(api.id);
    api.client('VXP.on(' + ID + ', "eletto", d => banner(d.tu ? "Sei il sindaco!" : "Nuovo sindaco", d.nome + " · " + d.voti + (d.voti === 1 ? " voto" : " voti"), "corona"));' +
      'VXP.on(' + ID + ', "discorso", d => typeof clog === "function" && clog("🎩 " + d.nome + ": «" + d.testo + "»"));' +
      'VXP.on(' + ID + ', "decreto", d => banner("Decreto del sindaco", d.nome, "corona"));' +
      'VXP.on(' + ID + ', "festa", d => banner("Festa in discoteca!", "Il portale è in piazza · " + d.min + " minuti", "nota"));');

    // ---------- pagine web ----------
    const e = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const stile = '<meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font-family:system-ui,sans-serif;background:#16181d;color:#e8e6e1;max-width:760px;margin:0 auto;padding:16px}h1{font-size:22px}td,th{padding:6px 8px;border-bottom:1px solid #2c303a;text-align:left}th{color:#9aa0ab}button{background:#2a2f3a;color:#e8e6e1;border:1px solid #444b5a;border-radius:6px;padding:6px 12px;cursor:pointer;margin:2px}.n{color:#9aa0ab}</style>';
    function pagina(admin) {
      const s = st(), sd = sindaco(), cl = conta();
      return '<!doctype html><meta charset="utf-8"><title>Sindaco di Aldoria</title>' + stile + '<h1>🎩 Il Sindaco di Aldoria</h1>' +
        '<p>' + (sd ? '<b>' + e(sd.nome) + '</b>, eletto ' + e(new Date(sd.dal).toLocaleDateString('it-IT')) + ' con ' + sd.voti + ' voti.' : 'Nessun sindaco.') + '</p>' +
        '<p class="n">Prossimo spoglio: ' + e(quando(s.prossima || prossimaElezione(Date.now()))) + '. Elettori finora: ' + Object.keys(s.voti).length + '.</p>' +
        '<h3>Voti della settimana</h3><table><tr><th>Candidato</th><th>Voti</th></tr>' + (cl.map(r => '<tr><td>' + e(r.nome) + '</td><td>' + r.n + '</td></tr>').join('') || '<tr><td colspan=2 class="n">Nessun voto</td></tr>') + '</table>' +
        (admin ? '<h3>Chi ha votato chi</h3><table><tr><th>Elettore</th><th>Voto</th><th>IP</th></tr>' + Object.values(s.voti).map(v => '<tr><td>' + e(v.nome) + '</td><td>' + e(v.perNome) + '</td><td class="n">' + e(v.ip) + '</td></tr>').join('') + '</table>' +
          '<p><button onclick="f(\'spoglio\')">Fai lo spoglio adesso</button><button onclick="f(\'togli\')">Togli il sindaco</button><button onclick="f(\'decreto\')">Ridai il decreto di oggi</button></p>' +
          '<script>function f(a){if(!confirm("Sicuro?"))return;fetch("admin/"+a,{method:"POST",headers:{"x-voxelia":"1"}}).then(r=>r.json()).then(j=>{alert(j.ok||j.err);location.reload()})}</script>' : '') +
        '<h3>Elezioni passate</h3><table><tr><th>Data</th><th>Eletto</th><th>Voti</th></tr>' + (s.storia.map(h => '<tr><td>' + e(new Date(h.t).toLocaleDateString('it-IT')) + '</td><td>' + e(h.vincitore || '—') + '</td><td class="n">' + e(h.voti.join(', ')) + '</td></tr>').join('') || '<tr><td colspan=3 class="n">Nessuna</td></tr>') + '</table>';
    }
    api.route('GET', '/', (req, res, x) => x.send(pagina(false)));
    api.route('GET', 'admin', (req, res, x) => x.send(pagina(true)), { admin: true });
    api.route('POST', 'admin/*', (req, res, x) => {
      const a = x.path.split('/').pop(), s = st();
      if (a === 'spoglio') { elezione(); return x.json({ ok: 'Spoglio fatto: ' + (sindaco() ? sindaco().nome : 'nessun sindaco') }); }
      if (a === 'togli') { const v = sindaco(); delete s.sindaco; api.save(); if (v) api.announce('🎩 ' + v.nome + ' non è più sindaco di Aldoria.'); return x.json({ ok: 'Sindaco tolto' }); }
      if (a === 'decreto') { if (s.sindaco) { s.sindaco.giorno = ''; api.save(); } return x.json({ ok: 'Il sindaco può emanare un altro decreto oggi' }); }
      x.json({ err: 'Azione sconosciuta' });
    }, { admin: true });
  },

  // spegnendo il plugin, i moltiplicatori dei decreti tornano come prima; se riparte prima della scadenza, il decreto riprende
  stop(api) {
    const s = api.store; if (!Array.isArray(s.attivi)) return;
    for (const a of s.attivi) if (a.k && !a.sospeso && api.server.cfg[a.k] === a.val) { api.server.setCfg({ [a.k]: a.prima }); a.sospeso = true; }
    api.save();
  }
};
