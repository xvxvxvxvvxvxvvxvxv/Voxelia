// Torneo dell'arena: tabellone a eliminazione diretta nella fossa del Colosseo, uno per stanza.
// Le iscrizioni si aprono dalla pagina admin (/plugins/torneo/admin), a orari fissi ("orari" nel config) o, se
// permesso, con /torneo apri. Chi è iscritto scrive /torneo iscrivi; alla chiusura il tabellone si estrae a caso.
// Gli incontri si giocano uno alla volta (o "incontriInsieme" alla volta): i due sfidanti vengono chiamati e hanno
// "attesaMinuti" per entrare nel Colosseo; chi non c'è perde a tavolino. L'incontro si chiude da solo con l'evento
// "arena" del server (la vittoria nella fossa); chi esce dal Colosseo o dal gioco durante l'incontro perde.
// Durante un incontro i due sfidanti possono colpire solo l'avversario e nessun altro può colpire loro (il server
// scarta quei colpi). Con un numero dispari un giocatore sorteggiato passa il turno (mai due volte, se si può).
// Con quattro o più iscritti c'è la finale per il terzo posto tra i perdenti delle semifinali.
// Limiti: i nomi e la posizione dei giocatori arrivano dal loro gioco, quindi chi modifica il gioco può falsificarli;
// le vittorie invece sono quelle verificate dal server per i punti arena (colpo recente dell'avversario).
// Il server conta una sola vittoria ogni 30 secondi sulla stessa coppia: se due sfidanti si erano appena battuti
// fuori dal torneo, devono semplicemente combattere di nuovo.
module.exports = {
  name: 'Torneo dell\'arena',
  version: '1.0',
  author: 'Voxelia',
  description: 'Tornei a eliminazione diretta nel Colosseo, con tabellone, premi e albo d\'oro',
  defaults: {
    iscrizioniMinuti: 5,       // durata delle iscrizioni
    minIscritti: 2,            // sotto questo numero il torneo viene annullato
    maxIscritti: 32,
    attesaMinuti: 3,           // tempo per presentarsi nel Colosseo dopo la chiamata
    durataMaxMinuti: 8,        // poi vince chi è rimasto, o si decide a sorte
    incontriInsieme: 1,        // incontri giocati nello stesso momento
    accendiPvp: true,          // all'inizio del torneo riaccende il PvP se l'admin l'aveva spento
    orari: [],                 // es. ["21:00"]: apre le iscrizioni in ogni stanza con almeno minIscritti giocatori online
    aperturaDaiGiocatori: false, // se true chiunque può aprire le iscrizioni nella sua stanza con /torneo apri
    premi: [
      { oro: 1000, xp: 500, oggetto: 3 },
      { oro: 500, xp: 250, oggetto: 2 },
      { oro: 250, pozioni: 3 }
    ],
    nomiStanze: {}             // nomi da mostrare sulla pagina pubblica, es. { "abc123": "Server di Kyu" } (i codici restano nascosti)
  },

  setup(api) {
    const C = api.config, K = n => String(n || '').toLowerCase(), MIN = 60000;
    const S = api.store; S.t = S.t || {}; S.albo = S.albo || []; S.vittorie = S.vittorie || {}; S.sospesi = S.sospesi || {};
    const num = (v, a, b, d) => { v = Math.round(+v); return isFinite(v) ? Math.max(a, Math.min(b, v)) : d; };
    const cfg = {
      get isc() { return num(C.iscrizioniMinuti, 1, 120, 5) * MIN; }, get min() { return num(C.minIscritti, 2, 256, 2); },
      get max() { return num(C.maxIscritti, 2, 256, 32); }, get attesa() { return num(C.attesaMinuti, 1, 30, 3) * MIN; },
      get durata() { return num(C.durataMaxMinuti, 1, 60, 8) * MIN; }, get insieme() { return num(C.incontriInsieme, 1, 16, 1); }
    };
    const RARITA = ['comune', 'non comune', 'raro', 'epico'], POSTI = ['primo', 'secondo', 'terzo'], MED = ['🥇', '🥈', '🥉'];
    const premi = () => Array.isArray(C.premi) ? C.premi : module.exports.defaults.premi;
    const testoPremio = pr => [pr.oro && pr.oro + ' oro', pr.pozioni && pr.pozioni + ' pozioni', pr.xp && pr.xp + ' XP',
      pr.oggetto != null && 'un oggetto ' + (RARITA[pr.oggetto] || 'raro')].filter(Boolean).join(', ');
    const etichetta = room => room ? 'stanza ' + room : 'senza stanza';
    const nomePubblico = room => (C.nomiStanze && C.nomiStanze[room]) || 'Stanza ' + (Object.keys(S.t).sort().indexOf(room) + 1 || '');
    const mischia = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
    const salva = () => api.save();

    // ---------- giocatori ----------
    const online = (room, n) => api.players(room).find(p => K(p.name) === K(n)) || null;
    const presente = (T, n) => { const p = online(T.room, n); return p && p.zone === 'arena' ? p : null; };
    const dire = (T, n, s) => { const p = online(T.room, n); if (p) p.tell(s); };
    const annuncia = (T, s) => api.announce(s, T.room);

    function dai(p, pr) {
      if (globalThis.VoxeliaGuardiano) globalThis.VoxeliaGuardiano.grazia(p.name);
      if (pr.oro > 0) p.give('gold', pr.oro);
      if (pr.pozioni > 0) p.give('pot', pr.pozioni);
      if (pr.xp > 0) p.give('xp', pr.xp);
      if (pr.oggetto != null) p.give('item', 1, pr.oggetto);
    }
    function premia(T, n, i) {
      const pr = premi()[i]; if (!pr || !testoPremio(pr)) return;
      const p = online(T.room, n);
      if (p) { dai(p, pr); p.tell('Premio del torneo (' + POSTI[i] + ' posto): ' + testoPremio(pr)); }
      else { (S.sospesi[K(n)] = S.sospesi[K(n)] || []).push({ pr, posto: i }); }
    }

    // ---------- tabellone ----------
    const turno = T => T.turni[T.turni.length - 1] || [];
    function nomeTurno(n) { return n <= 2 ? 'Finale' : n <= 4 ? 'Semifinali' : n <= 8 ? 'Quarti di finale' : n <= 16 ? 'Ottavi di finale' : 'Primo turno'; }
    function nuovoTurno(T, nomi) {
      const L = nomi.slice(), M = [];
      if (L.length % 2) { // dispari: passa il turno un sorteggiato che non l'ha ancora avuto
        const liberi = L.filter(n => !T.bye.includes(K(n))), b = (liberi.length ? liberi : L)[Math.floor(Math.random() * (liberi.length || L.length))];
        L.splice(L.indexOf(b), 1); T.bye.push(K(b));
        M.push({ a: b, b: null, stato: 'fatto', vince: b, come: 'passa il turno' });
      }
      for (let i = 0; i < L.length; i += 2) M.push({ a: L[i], b: L[i + 1], stato: 'attesa' });
      M.sort((x, y) => (x.b ? 0 : 1) - (y.b ? 0 : 1));
      if (nomi.length === 2) { // finale: prima si gioca il terzo posto tra i perdenti delle semifinali
        const prima = T.turni[T.turni.length - 1] || [], persi = prima.filter(m => m.b && m.perde).map(m => m.perde);
        if (persi.length === 2) M.unshift({ a: persi[0], b: persi[1], stato: 'attesa', terzo: true });
        else if (persi.length === 1) T.terzoDiretto = persi[0];
      }
      T.turni.push(M); T.nomi.push(nomeTurno(nomi.length));
      annuncia(T, '⚔ Torneo: ' + T.nomi[T.nomi.length - 1] + '! ' + M.filter(m => m.b).map(m => (m.terzo ? '(3° posto) ' : '') + m.a + ' contro ' + m.b).join(' · ') +
        (M.some(m => !m.b) ? ' · passa il turno: ' + M.find(m => !m.b).a : ''));
    }
    function avvia(T) {
      if (T.iscritti.length < cfg.min) {
        annuncia(T, 'Torneo annullato: servivano almeno ' + cfg.min + ' iscritti, ce ne sono ' + T.iscritti.length + '.');
        api.log('torneo annullato (' + etichetta(T.room) + '): pochi iscritti'); delete S.t[T.room]; salva(); return;
      }
      if (C.accendiPvp !== false && !api.server.cfg.pvp) { api.server.setCfg({ pvp: 1 }); api.log('PvP riacceso per il torneo'); }
      T.stato = 'in corso'; T.iniziato = Date.now(); T.turni = []; T.nomi = []; T.bye = [];
      annuncia(T, '🏟 Il torneo dell\'arena comincia con ' + T.iscritti.length + ' eroi! Quando vi chiamano andate nella fossa del Colosseo.');
      api.log('torneo iniziato (' + etichetta(T.room) + ') con ' + T.iscritti.length + ' iscritti');
      nuovoTurno(T, mischia(T.iscritti.slice())); salva();
    }
    function apri(room, minuti, chi) {
      if (S.t[room] && S.t[room].stato !== 'finito') return 'C\'è già un torneo in questa stanza.';
      const ms = minuti ? num(minuti, 1, 120, 5) * MIN : cfg.isc;
      const T = S.t[room] = { room, stato: 'iscrizioni', aperto: Date.now(), fine: Date.now() + ms, iscritti: [], turni: [], nomi: [], bye: [], avvisi: 0 };
      annuncia(T, '🏟 Torneo dell\'arena: iscrizioni aperte per ' + Math.round(ms / MIN) + ' minuti! Scrivi /torneo iscrivi.');
      api.broadcast('iscrizioni', { minuti: Math.round(ms / MIN) }, room);
      api.log('iscrizioni aperte (' + etichetta(room) + ')' + (chi ? ' da ' + chi : '')); salva();
      return '';
    }
    function fine(T, campione) {
      const ultimo = turno(T), fin = campione && ultimo.find(m => !m.terzo && m.b && K(m.vince) === K(campione)), terzo = ultimo.find(m => m.terzo);
      const podio = [campione || null, fin ? fin.perde || null : null, terzo ? terzo.vince || null : T.terzoDiretto || null];
      T.stato = 'finito'; T.finito = Date.now(); T.podio = podio;
      if (campione) {
        annuncia(T, '🏆 ' + campione + ' vince il torneo dell\'arena!' + (podio[1] ? ' Secondo: ' + podio[1] + '.' : '') + (podio[2] ? ' Terzo: ' + podio[2] + '.' : ''));
        api.broadcast('vincitore', { nome: campione }, T.room);
        S.vittorie[K(campione)] = { n: ((S.vittorie[K(campione)] || {}).n || 0) + 1, nome: campione };
      } else annuncia(T, 'Il torneo dell\'arena finisce senza vincitore: nessuno si è presentato agli ultimi incontri.');
      podio.forEach((n, i) => n && premia(T, n, i));
      S.albo.unshift({ quando: T.finito, room: T.room, podio, iscritti: T.iscritti.length }); S.albo.length = Math.min(S.albo.length, 50);
      api.log('torneo finito (' + etichetta(T.room) + '): ' + podio.map((n, i) => MED[i] + ' ' + (n || '—')).join(' ')); salva();
    }
    function avanza(T) {
      const M = turno(T); if (M.some(m => m.stato !== 'fatto')) return;
      const vinti = M.filter(m => !m.terzo && m.vince).map(m => m.vince);
      if (vinti.length <= 1 || M.some(m => m.terzo) || T.nomi[T.nomi.length - 1] === 'Finale') return fine(T, vinti[0]);
      nuovoTurno(T, vinti); salva();
    }

    // ---------- un incontro ----------
    const attivi = T => turno(T).filter(m => m.stato === 'chiamato' || m.stato === 'in corso');
    const dentro = (m, n) => K(m.a) === K(n) || K(m.b) === K(n);
    const incontroDi = (T, n) => T && T.stato === 'in corso' ? attivi(T).find(m => dentro(m, n)) : null;
    function chiudi(T, m, vince, come) {
      m.stato = 'fatto'; m.come = come; m.chiuso = Date.now();
      m.vince = vince || null; m.perde = vince ? (K(vince) === K(m.a) ? m.b : m.a) : null;
      if (vince) annuncia(T, (m.terzo ? '🥉 ' : '⚔ ') + vince + ' batte ' + m.perde + (come === 'ko' ? '' : ' (' + come + ')') + (m.terzo ? ' e conquista il terzo posto.' : '.'));
      else annuncia(T, '⚔ ' + m.a + ' e ' + m.b + ' non si sono presentati: eliminati tutti e due.');
      api.broadcast('duelli', { list: attivi(T).filter(x => x.stato === 'in corso').map(x => [x.a, x.b]) }, T.room);
      salva(); avanza(T);
    }
    function chiama(T, m) {
      m.stato = 'chiamato'; m.chiamato = Date.now();
      const min = Math.round(cfg.attesa / MIN);
      annuncia(T, '📣 Torneo: ' + (m.terzo ? 'per il terzo posto, ' : '') + m.a + ' contro ' + m.b + '! Avete ' + min + (min > 1 ? ' minuti' : ' minuto') + ' per entrare nel Colosseo.');
      for (const [io, lui] of [[m.a, m.b], [m.b, m.a]]) { const p = online(T.room, io); if (p) p.send('chiamata', { contro: lui, minuti: min }); }
      salva();
    }
    function controlla(T, m, now) {
      const pa = presente(T, m.a), pb = presente(T, m.b);
      if (m.stato === 'chiamato') {
        if (pa && pb) {
          m.stato = 'in corso'; m.iniziato = now;
          annuncia(T, '🔔 Via! ' + m.a + ' contro ' + m.b + ' nella fossa. Nessun altro può colpirli finché il duello non finisce.');
          api.broadcast('duelli', { list: attivi(T).filter(x => x.stato === 'in corso').map(x => [x.a, x.b]) }, T.room);
          salva();
        } else if (now - m.chiamato >= cfg.attesa) chiudi(T, m, pa ? m.a : pb ? m.b : null, 'a tavolino');
      } else if (m.stato === 'in corso') {
        if (!online(T.room, m.a) || !online(T.room, m.b)) return chiudi(T, m, online(T.room, m.a) ? m.a : online(T.room, m.b) ? m.b : null, 'a tavolino');
        if (now - m.iniziato >= cfg.durata) {
          if (pa && pb) chiudi(T, m, Math.random() < .5 ? m.a : m.b, 'tempo scaduto, deciso a sorte');
          else chiudi(T, m, pa ? m.a : pb ? m.b : null, 'tempo scaduto');
        }
      }
    }
    function giro() {
      const now = Date.now();
      for (const T of Object.values(S.t)) {
        if (T.stato === 'iscrizioni') {
          const resta = T.fine - now;
          if (resta <= 0) { avvia(T); continue; }
          if (resta <= MIN && T.avvisi < 1) { T.avvisi = 1; annuncia(T, 'Torneo dell\'arena: ultimo minuto per iscriversi con /torneo iscrivi (' + T.iscritti.length + ' iscritti).'); }
        } else if (T.stato === 'in corso') {
          for (const m of attivi(T)) { if (T.stato !== 'in corso') break; controlla(T, m, now); }
          if (T.stato !== 'in corso') continue;
          let liberi = cfg.insieme - attivi(T).length;
          for (const m of turno(T)) if (liberi > 0 && m.stato === 'attesa') { chiama(T, m); liberi--; }
          avanza(T);
        } else if (T.stato === 'finito' && now - T.finito > 30 * MIN) { delete S.t[T.room]; salva(); }
      }
      // apertura a orari fissi (ora del server)
      if (Array.isArray(C.orari) && C.orari.length) {
        const d = new Date(Date.now()), hh = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'), id = d.toDateString() + ' ' + hh;
        if (C.orari.includes(hh) && S.ultimoOrario !== id) {
          S.ultimoOrario = id; salva();
          for (const [room, nomi] of Object.entries(api.rooms())) if (nomi.length >= cfg.min && !(S.t[room] && S.t[room].stato !== 'finito')) apri(room, 0, 'orario ' + hh);
        }
      }
    }
    api.every(2000, giro);

    // la vittoria nella fossa chiude l'incontro dei due sfidanti
    api.on('arena', (v, s) => {
      const T = S.t[v.room], m = incontroDi(T, v.name);
      if (m && dentro(m, s.name)) chiudi(T, m, m.a && K(m.a) === K(v.name) ? m.a : m.b, 'ko');
    });
    // durante un incontro: chi esce dal gioco o dal Colosseo perde
    api.on('leave', p => { const T = S.t[p.room], m = incontroDi(T, p.name); if (m && m.stato === 'in corso') chiudi(T, m, K(m.a) === K(p.name) ? m.b : m.a, 'avversario uscito dal gioco'); });
    api.on('zone', (p, nuova, vecchia) => {
      const T = S.t[p.room], m = incontroDi(T, p.name);
      if (m && m.stato === 'in corso' && vecchia === 'arena' && nuova !== 'arena') chiudi(T, m, K(m.a) === K(p.name) ? m.b : m.a, 'avversario uscito dal Colosseo');
    });
    // nessuno disturba i duelli: il server scarta i colpi tra chi duella e chi no
    const avvisato = {};
    api.on('message', (p, j) => {
      if (j.t !== 'hit') return;
      const T = S.t[p.room]; if (!T || T.stato !== 'in corso') return;
      const v = api.player(j.to); if (!v) return;
      const mio = attivi(T).find(m => m.stato === 'in corso' && dentro(m, p.name)), suo = attivi(T).find(m => m.stato === 'in corso' && dentro(m, v.name));
      if (mio === suo) return; // stesso duello, oppure nessuno dei due duella
      if (!avvisato[p.id] || Date.now() - avvisato[p.id] > 5000) { avvisato[p.id] = Date.now(); p.tell(mio ? 'Nel torneo puoi colpire solo ' + (K(mio.a) === K(p.name) ? mio.b : mio.a) + '.' : v.name + ' sta combattendo un incontro del torneo: non puoi colpirlo.'); }
      return false;
    });
    // premi rimasti in sospeso per chi non era online
    api.on('join', p => {
      const L = S.sospesi[K(p.name)]; if (!L) return;
      delete S.sospesi[K(p.name)]; salva();
      for (const x of L) { dai(p, x.pr); p.tell('Premio del torneo (' + POSTI[x.posto] + ' posto): ' + testoPremio(x.pr)); }
    });

    // ---------- comandi ----------
    function tabellone(T) {
      if (T.stato === 'iscrizioni') return 'Torneo dell\'arena: iscrizioni aperte ancora per ' + Math.max(1, Math.ceil((T.fine - Date.now()) / MIN)) + ' min. Iscritti (' + T.iscritti.length + '): ' + (T.iscritti.join(', ') || 'nessuno') + '. Scrivi /torneo iscrivi.';
      if (T.stato === 'finito') return 'Ultimo torneo: ' + T.podio.map((n, i) => MED[i] + ' ' + (n || '—')).join('  ');
      const righe = ['Torneo dell\'arena — ' + T.nomi[T.nomi.length - 1] + ' (turno ' + T.turni.length + ')'];
      for (const m of turno(T)) {
        const t = (m.terzo ? '3° posto: ' : '') + (m.b ? m.a + ' contro ' + m.b : m.a + ' passa il turno');
        righe.push(m.stato === 'fatto' ? '✔ ' + t + (m.b ? ' → ' + (m.vince || 'nessuno') : '') : m.stato === 'in corso' ? '⚔ ' + t + ' (in corso)' : m.stato === 'chiamato' ? '📣 ' + t + ' (chiamati)' : '· ' + t);
      }
      return righe.slice(0, 12).join('\n');
    }
    api.command('torneo', 'il torneo dell\'arena: /torneo, /torneo iscrivi, /torneo ritira, /torneo albo', (p, args) => {
      const a = K(args[0]), T = S.t[p.room];
      if (a === 'iscrivi' || a === 'iscriviti') {
        if (!T || T.stato !== 'iscrizioni') return 'Ora non ci sono iscrizioni aperte. ' + (T ? tabellone(T) : '');
        if (T.iscritti.some(n => K(n) === K(p.name))) return 'Sei già iscritto. Iscritti: ' + T.iscritti.length + '.';
        if (T.iscritti.length >= cfg.max) return 'Il torneo è pieno (' + cfg.max + ' iscritti).';
        T.iscritti.push(p.name); salva();
        annuncia(T, p.name + ' si iscrive al torneo dell\'arena (' + T.iscritti.length + ' iscritti).');
        return 'Iscritto! Quando tocca a te riceverai una chiamata: avrai ' + Math.round(cfg.attesa / MIN) + ' minuti per entrare nel Colosseo.';
      }
      if (a === 'ritira' || a === 'ritirati') {
        if (!T || T.stato !== 'iscrizioni') return 'Puoi ritirarti solo durante le iscrizioni.';
        const i = T.iscritti.findIndex(n => K(n) === K(p.name)); if (i < 0) return 'Non sei iscritto.';
        T.iscritti.splice(i, 1); salva(); return 'Ti sei ritirato dal torneo.';
      }
      if (a === 'apri') {
        if (!C.aperturaDaiGiocatori) return 'Le iscrizioni le apre l\'admin del server.';
        return apri(p.room, 0, p.name) || undefined;
      }
      if (a === 'albo') {
        const top = Object.values(S.vittorie).sort((x, y) => y.n - x.n).slice(0, 5);
        const ult = S.albo.filter(x => x.room === p.room).slice(0, 3);
        if (!top.length) return 'Ancora nessun torneo concluso.';
        return 'Albo d\'oro: ' + top.map(x => x.nome + ' (' + x.n + ')').join(', ') + (ult.length ? '\nUltimi tornei qui: ' + ult.map(x => new Date(x.quando).toLocaleDateString('it-IT') + ' ' + MED[0] + ' ' + (x.podio[0] || '—')).join(' · ') : '');
      }
      if (!T) return 'Nessun torneo in corso in questa stanza.' + (C.aperturaDaiGiocatori ? ' Aprilo con /torneo apri.' : '') + ' /torneo albo per i campioni.';
      return tabellone(T);
    });

    // ---------- codice nel gioco: stendardi per chiamata e vittoria ----------
    api.client('(function(){const ID=' + JSON.stringify(api.id) + ';' +
      'VXP.on(ID,"chiamata",d=>{banner("Torneo: tocca a te!","Contro "+d.contro+" · entra nel Colosseo entro "+d.minuti+" min","spade");if(typeof clog==="function")clog("","Torneo: tocca a te contro "+d.contro+"! Vai nella fossa del Colosseo.",{sys:1,adm:1})});' +
      'VXP.on(ID,"iscrizioni",d=>banner("Torneo dell\'arena","Iscrizioni aperte · scrivi /torneo iscrivi","trofeo"));' +
      'VXP.on(ID,"vincitore",d=>banner("Campione dell\'arena",d.nome+" vince il torneo","trofeo"));})();');

    // ---------- pagine web ----------
    const e = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', '\'': '&#39;' })[c]);
    const vista = (T, pubblica) => ({ stanza: pubblica ? nomePubblico(T.room) : T.room, stato: T.stato, fine: T.fine, iscritti: T.iscritti, podio: T.podio || null,
      turni: T.turni.map((M, i) => ({ nome: T.nomi[i], incontri: M.map(m => ({ a: m.a, b: m.b, stato: m.stato, vince: m.vince || null, come: m.come || '', terzo: !!m.terzo })) })) });
    const STILE = '<style>body{font:14px system-ui,sans-serif;background:#141822;color:#e8ecf4;margin:16px}h1,h2{font-family:Georgia,serif;color:#ffd84a}' +
      '.tab{display:flex;gap:14px;overflow-x:auto;padding-bottom:8px}.col{min-width:190px}.col h3{font-size:13px;color:#f5b942;margin:4px 0}' +
      '.m{background:#fff1;border-radius:6px;padding:6px 8px;margin:6px 0;border-left:3px solid #fff3}.m.on{border-color:#ff6a3d}.m.ch{border-color:#ffd84a}.m.ok{border-color:#5fd068}' +
      '.w{font-weight:700;color:#9ff0a0}.l{opacity:.55;text-decoration:line-through}small{opacity:.7}table{border-collapse:collapse}td,th{padding:5px 8px;border-bottom:1px solid #fff2;text-align:left}' +
      'button,input{padding:5px 9px;border-radius:4px;border:0;margin:2px;font:inherit}button{cursor:pointer;background:#f5b942}.box{background:#0003;border-radius:8px;padding:10px 12px;margin:10px 0}</style>';
    const DISEGNA = 'function nn(s){return String(s==null?"":s).replace(/[&<>"\']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\\"":"&quot;","\'":"&#39;"})[c])}' +
      'function tab(T,adm){if(T.stato==="iscrizioni")return"<p>Iscrizioni aperte ancora per "+Math.max(1,Math.ceil((T.fine-Date.now())/60000))+" min · iscritti ("+T.iscritti.length+"): "+(T.iscritti.map(nn).join(", ")||"nessuno")+"</p>";' +
      'let h=T.podio?"<p>"+["🥇","🥈","🥉"].map((m,i)=>m+" "+nn(T.podio[i]||"—")).join(" &nbsp; ")+"</p>":"";h+="<div class=tab>";' +
      'T.turni.forEach((R,r)=>{h+="<div class=col><h3>"+nn(R.nome)+"</h3>";R.incontri.forEach((m,i)=>{const c={"in corso":"on","chiamato":"ch","fatto":"ok"}[m.stato]||"";' +
      'const n=x=>x?"<span class="+(m.vince?(m.vince===x?"w":"l"):"")+">"+nn(x)+"</span>":"<small>—</small>";' +
      'h+="<div class=\'m "+c+"\'>"+(m.terzo?"<small>3° posto</small><br>":"")+n(m.a)+(m.b?" <small>vs</small> "+n(m.b):" <small>passa il turno</small>")+"<br><small>"+nn(m.stato==="fatto"?m.come:m.stato)+"</small>"+' +
      '(adm&&m.b&&m.stato!=="fatto"?"<br><button onclick=\'fai(\\"vince\\",{room:"+JSON.stringify(T.stanza).replace(/\'/g,"")+",turno:"+r+",i:"+i+",chi:\\"a\\"})\'>Vince "+nn(m.a)+"</button><button onclick=\'fai(\\"vince\\",{room:"+JSON.stringify(T.stanza).replace(/\'/g,"")+",turno:"+r+",i:"+i+",chi:\\"b\\"})\'>Vince "+nn(m.b)+"</button>":"")+"</div>"});h+="</div>"});return h+"</div>"}';

    api.route('GET', 'stato', (req, res, x) => x.json({ tornei: Object.values(S.t).map(T => vista(T, true)),
      albo: S.albo.slice(0, 20).map(a => ({ quando: a.quando, stanza: nomePubblico(a.room), podio: a.podio, iscritti: a.iscritti })),
      campioni: Object.values(S.vittorie).sort((a, b) => b.n - a.n).slice(0, 10) }));
    api.route('GET', '/', (req, res, x) => x.send('<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Torneo dell\'arena</title>' + STILE +
      '<h1>🏟 Torneo dell\'arena</h1><div id="t"></div><h2>Albo d\'oro</h2><div id="a"></div><script>' + DISEGNA +
      'function va(){fetch("stato").then(r=>r.json()).then(j=>{document.getElementById("t").innerHTML=j.tornei.length?j.tornei.map(T=>"<div class=box><h2>"+nn(T.stanza)+"</h2>"+tab(T)+"</div>").join(""):"<p>Nessun torneo in corso.</p>";' +
      'document.getElementById("a").innerHTML=(j.campioni.length?"<p>"+j.campioni.map(c=>nn(c.nome)+" ("+c.n+")").join(" · ")+"</p>":"<p>Ancora nessun campione.</p>")+(j.albo.length?"<table><tr><th>Data</th><th>Stanza</th><th>🥇</th><th>🥈</th><th>🥉</th><th>Iscritti</th></tr>"+j.albo.map(a=>"<tr><td>"+new Date(a.quando).toLocaleString("it-IT")+"</td><td>"+nn(a.stanza)+"</td>"+[0,1,2].map(i=>"<td>"+nn(a.podio[i]||"—")+"</td>").join("")+"<td>"+a.iscritti+"</td></tr>").join("")+"</table>":"")})}va();setInterval(va,4000)</script>'));

    api.route('GET', 'admin', (req, res, x) => {
      const stanze = api.rooms(), tutte = [...new Set([...Object.keys(stanze), ...Object.keys(S.t)])].sort();
      x.send('<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Torneo · admin</title>' + STILE +
        '<h1>🏟 Torneo dell\'arena · admin</h1><p>Un torneo per stanza. Iscrizioni: ' + Math.round(cfg.isc / MIN) + ' min · attesa ' + Math.round(cfg.attesa / MIN) + ' min · durata massima ' + Math.round(cfg.durata / MIN) + ' min (si cambiano in torneo.config.json). PvP del server: <b>' + (api.server.cfg.pvp ? 'acceso' : 'spento') + '</b>. <a href="./" style="color:#ffd84a">Pagina pubblica</a></p>' +
        (tutte.length ? tutte.map(room => {
          const T = S.t[room], R = JSON.stringify(room).replace(/'/g, '');
          return '<div class=box><h2>' + e(etichetta(room)) + ' <small>(' + (stanze[room] || []).length + ' online)</small></h2>' +
            (!T || T.stato === 'finito' ? '<input id="m' + e(room) + '" type=number min=1 max=120 value=' + Math.round(cfg.isc / MIN) + ' style="width:60px"> min <button onclick=\'fai("apri",{room:' + R + ',minuti:document.getElementById("m' + e(room) + '").value})\'>Apri le iscrizioni</button>' : '') +
            (T && T.stato === 'iscrizioni' ? '<button onclick=\'fai("inizia",{room:' + R + '})\'>Chiudi le iscrizioni e inizia</button>' : '') +
            (T && T.stato !== 'finito' ? '<button style="background:#a33;color:#fff" onclick=\'if(confirm("Annullare il torneo?"))fai("annulla",{room:' + R + '})\'>Annulla il torneo</button>' : '') +
            '<div id="v' + e(room) + '"></div></div>';
        }).join('') : '<p>Nessuna stanza con giocatori online.</p>') +
        '<script>' + DISEGNA + 'const D=' + JSON.stringify(Object.values(S.t).map(T => vista(T, false))).replace(/</g, '\\u003c') + ';D.forEach(T=>{const el=document.getElementById("v"+T.stanza);if(el)el.innerHTML=tab(T,1)});' +
        'function fai(a,b){fetch("admin/"+a,{method:"POST",headers:{"x-voxelia":"1","Content-Type":"application/json"},body:JSON.stringify(b)}).then(r=>r.json()).then(j=>{if(j.ok)location.reload();else alert(j.err||"Errore")})}setTimeout(()=>location.reload(),15000)</script>');
    }, { admin: true });
    api.route('POST', 'admin/*', (req, res, x) => x.body(b => {
      const room = typeof b.room === 'string' ? b.room : '', T = S.t[room];
      if (x.path === '/admin/apri') { const r = apri(room, b.minuti, 'admin'); return r ? x.json(400, { err: r }) : x.json({ ok: 1 }); }
      if (!T || T.stato === 'finito') return x.json(404, { err: 'Nessun torneo in corso in questa stanza' });
      if (x.path === '/admin/inizia') { if (T.stato !== 'iscrizioni') return x.json(400, { err: 'Il torneo è già iniziato' }); avvia(T); return x.json({ ok: 1 }); }
      if (x.path === '/admin/annulla') { annuncia(T, 'Il torneo dell\'arena è stato annullato dall\'admin.'); api.broadcast('duelli', { list: [] }, room); delete S.t[room]; salva(); api.log('torneo annullato dall\'admin (' + etichetta(room) + ')'); return x.json({ ok: 1 }); }
      if (x.path === '/admin/vince') {
        const m = (T.turni[b.turno] || [])[b.i];
        if (!m || !m.b || m.stato === 'fatto' || T.stato !== 'in corso') return x.json(400, { err: 'Incontro non valido' });
        chiudi(T, m, b.chi === 'b' ? m.b : m.a, 'deciso dall\'admin'); return x.json({ ok: 1 });
      }
      x.json(404, { err: 'Azione sconosciuta' });
    }), { admin: true });
  }
};
