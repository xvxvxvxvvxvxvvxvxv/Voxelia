// Posta e amici: messaggi per chi non è online e avvisi quando un amico entra o esce.
// /posta nome testo  lascia un messaggio (se è online lo riceve subito); /posta legge la casella; /posta cancella la svuota.
// /amici aggiungi|togli nome, /amici (o /amici lista) mostra chi è online e dove.
// Si scrive solo a eroi già passati dal server, con i limiti di posta.config.json contro lo spam.
// I comandi dei plugin sono già bloccati dal server per chi è silenziato e quando la chat è spenta, quindi
// un giocatore silenziato non può mandare posta. I nomi in Voxelia non hanno password: come per la classifica
// dell'arena, chi entra con lo stesso nome vede la stessa casella.
const ZONE = {
  town: 'Aldoria', forest: 'la Foresta di Elmwood', desert: 'il Deserto di Khem', peaks: 'i Picchi Gelidi', arena: 'il Colosseo',
  nord: 'Aldoria Nord', campi: 'Aldoria Est', rovine: 'il Borgo delle Ceneri', porto: 'il Porto', vecchia: 'Aldoria Vecchia',
  arrembaggio: 'la Vedova Nera', cittadella: 'la Cittadella del Vuoto', occhio: 'la stanza dell\'Occhio', culto: 'un luogo nascosto',
  cella: 'le prigioni del castello',
  tana: 'la Tana dei Goblin', cripta: 'la Cripta Dimenticata', piramide: 'la Piramide di Khem', cristallo: 'le Caverne di Cristallo',
  fucina: 'la Fucina Infernale', abisso: 'l\'Abisso Sommerso',
  in_castle: 'il Castello', in_library: 'la Biblioteca Arcana', in_tavern: 'la Taverna del Drago Ubriaco', in_smith: 'la Fucina di Borin',
  in_alch: 'la Bottega dell\'Erborista', in_temple: 'il Tempio della Luce', in_palazzo: 'il Palazzo del Conte', in_banca: 'la Banca',
  in_fattoria: 'la Casa della Fattoria', in_segheria: 'la Segheria', in_cappella: 'la Cappella in rovina', in_locanda: 'la Locanda del Gabbiano',
  in_capitaneria: 'la Capitaneria', in_motel: 'il Motel della Rosa dei Venti', in_panetteria: 'la Panetteria', in_sartoria: 'la Sartoria',
  in_caserma: 'la Caserma', in_scuderia: 'la Scuderia', in_osservatorio: 'l\'Osservatorio', in_municipio: 'il Municipio'
};
// "cripta@2" → "nella Cripta Dimenticata (piano 2)"; zone sconosciute (per esempio quelle di altri plugin) restano vaghe
const PREP = { la: 'nella', il: 'nel', i: 'nei', le: 'nelle', un: 'in un' };
function dove(z) {
  if (!z) return '';
  const [b, piano] = String(z).split('@'), n = ZONE[b];
  if (!n) return 'da qualche parte';
  const m = /^(la|il|i|le|un) (.*)$/.exec(n), q = m ? PREP[m[1]] + ' ' + m[2] : /^l'/.test(n) ? 'nell\'' + n.slice(2) : 'in ' + n;
  return q + (piano ? ' (piano ' + piano + ')' : '');
}
const key = n => String(n || '').toLowerCase();
const GIORNO = 24 * 3600 * 1000;

module.exports = {
  name: 'Posta e amici',
  version: '1.0',
  description: 'Messaggi per chi non è online (/posta) e avvisi quando un amico entra o esce (/amici)',
  defaults: {
    casellaMax: 20,          // messaggi che una casella può tenere
    stessoMittenteMax: 5,    // messaggi non letti dallo stesso mittente nella stessa casella
    lunghezzaMax: 45,        // caratteri di un messaggio (la chat del gioco ne accetta 60 in tutto, comando compreso)
    attesaSec: 10,           // secondi tra un messaggio e l'altro dello stesso giocatore
    giorniScadenza: 30,      // dopo quanti giorni un messaggio viene buttato
    amiciMax: 30,
    avvisoUscita: true,      // avvisa anche quando un amico esce
    zonaSoloReciproci: true  // la zona di un amico in un'altra stanza si vede solo se siete amici a vicenda
  },

  setup(api) {
    const C = api.config, S = api.store;
    S.posta = S.posta || {}; S.amici = S.amici || {}; S.nomi = S.nomi || {}; S.visto = S.visto || {};
    const ultimo = {}; // ultimo invio per giocatore (non serve salvarlo)

    const nome = k => S.nomi[k] || k;
    const online = k => api.players().filter(p => key(p.name) === k);
    const amiciDi = k => S.amici[k] || (globalThis.VoxeliaStress && globalThis.VoxeliaStress.bot(k) ? [] : (S.amici[k] = []));   // i bot dello Stress test non si salvano
    const reciproci = (a, b) => (S.amici[a] || []).includes(b) && (S.amici[b] || []).includes(a);
    const quando = t => {
      const m = Math.round((Date.now() - t) / 60000);
      return m < 1 ? 'ora' : m < 60 ? m + ' min fa' : m < 1440 ? Math.round(m / 60) + ' h fa' : Math.round(m / 1440) + ' g fa';
    };
    // dove si trova p, detto a chi (k): la stanza se è diversa, la zona se lo stesso gruppo o amici a vicenda
    function posizione(p, chi) {
      const io = online(chi)[0], stessa = io && io.room === p.room;
      if (!stessa && C.zonaSoloReciproci && !reciproci(chi, key(p.name))) return io ? ' (in un\'altra stanza)' : '';
      const z = dove(p.zone);
      return (z ? ' ' + z : '') + (stessa || !p.room ? '' : ' (stanza ' + p.room + ')');
    }

    // butta i messaggi scaduti e i giocatori non visti da un anno senza posta né amici
    function pulisci() {
      const lim = Date.now() - Math.max(1, +C.giorniScadenza || 30) * GIORNO;
      for (const k of Object.keys(S.posta)) { S.posta[k] = S.posta[k].filter(m => m.t > lim); if (!S.posta[k].length) delete S.posta[k]; }
      for (const k of Object.keys(S.visto)) if (S.visto[k] < Date.now() - 365 * GIORNO && !S.posta[k] && !(S.amici[k] || []).length) { delete S.visto[k]; delete S.nomi[k]; delete S.amici[k]; }
      api.save();
    }
    pulisci(); api.every(3600 * 1000, pulisci);

    function leggi(p) {
      const k = key(p.name), L = S.posta[k] || [];
      if (!L.length) return 'La tua casella è vuota. Per scrivere: /posta nome testo';
      const righe = L.map(m => (m.letto ? '  ' : '★ ') + m.da + ' (' + quando(m.t) + '): ' + m.s);
      L.forEach(m => { m.letto = 1; }); api.save();
      // tell mostra al massimo 12 righe: le più recenti
      return ['Posta (' + L.length + '/' + C.casellaMax + ', /posta cancella per svuotare):'].concat(righe.slice(-11)).join('\n');
    }

    api.command('posta', 'posta per chi non è online: /posta nome testo, /posta per leggere, /posta cancella', (p, args) => {
      const k = key(p.name);
      if (!args.length || args[0] === 'leggi') return leggi(p);
      if (args[0] === 'cancella' || args[0] === 'svuota') { const n = (S.posta[k] || []).length; delete S.posta[k]; api.save(); return n ? 'Casella svuotata (' + (n === 1 ? '1 messaggio' : n + ' messaggi') + ').' : 'La tua casella era già vuota.'; }

      const a = key(args[0]), testo = args.slice(1).join(' ').trim();
      if (!testo) return 'Scrivi anche il messaggio: /posta ' + args[0] + ' testo';
      if (a === k) return 'Non puoi scrivere a te stesso.';
      if (!S.visto[a]) return 'Nessun eroe chiamato ' + args[0] + ' è mai passato da questo server.';
      if (testo.length > C.lunghezzaMax) return 'Messaggio troppo lungo: massimo ' + C.lunghezzaMax + ' caratteri.';
      const ora = Date.now(), att = Math.max(0, +C.attesaSec || 0) * 1000;
      if (ultimo[k] && ora - ultimo[k] < att) return 'Aspetta ' + Math.ceil((att - (ora - ultimo[k])) / 1000) + ' secondi prima di mandare un altro messaggio.';
      const box = S.posta[a] || (S.posta[a] = []);
      if (box.filter(m => !m.letto && key(m.da) === k).length >= C.stessoMittenteMax) return nome(a) + ' ha già ' + C.stessoMittenteMax + ' tuoi messaggi da leggere: aspetta che li legga.';
      if (box.length >= C.casellaMax) {
        // casella piena: si fa posto buttando il messaggio letto più vecchio, altrimenti niente
        const i = box.findIndex(m => m.letto);
        if (i < 0) return 'La casella di ' + nome(a) + ' è piena.';
        box.splice(i, 1);
      }
      ultimo[k] = ora;
      const dest = online(a), m = { da: p.name, t: ora, s: testo, letto: dest.length ? 1 : 0 };
      box.push(m); api.save();
      api.log(p.name + ' → ' + nome(a) + ': ' + testo);
      if (dest.length) { dest.forEach(d => d.tell('✉ Posta da ' + p.name + ': ' + testo)); return 'Messaggio consegnato subito: ' + nome(a) + ' è online.'; }
      return 'Messaggio lasciato per ' + nome(a) + ': lo leggerà quando entra.';
    });

    api.command('amici', 'amici: /amici aggiungi nome, /amici togli nome, /amici per vedere chi è online', (p, args) => {
      const k = key(p.name), L = amiciDi(k), az = (args[0] || 'lista').toLowerCase(), a = key(args[1]);
      if (az === 'aggiungi' || az === 'togli') {
        if (!a) return 'Scrivi il nome: /amici ' + az + ' nome';
        if (az === 'togli') {
          const i = L.indexOf(a); if (i < 0) return nome(a) + ' non è tra i tuoi amici.';
          L.splice(i, 1); api.save(); return 'Hai tolto ' + nome(a) + ' dagli amici.';
        }
        if (a === k) return 'Sei già il miglior amico di te stesso.';
        if (!S.visto[a]) return 'Nessun eroe chiamato ' + args[1] + ' è mai passato da questo server.';
        if (L.includes(a)) return nome(a) + ' è già tra i tuoi amici.';
        if (L.length >= C.amiciMax) return 'Hai già ' + C.amiciMax + ' amici: togline uno prima.';
        L.push(a); api.save();
        if (!(S.amici[a] || []).includes(k)) online(a).forEach(d => d.tell(p.name + ' ti ha aggiunto agli amici. Ricambia con /amici aggiungi ' + p.name));
        const o = online(a)[0];
        return 'Hai aggiunto ' + nome(a) + ' agli amici. Ti avviso quando entra' + (C.avvisoUscita ? ' o esce' : '') + '.' + (o ? ' Ora è online' + posizione(o, k) + '.' : '');
      }
      if (az !== 'lista') return 'Uso: /amici, /amici aggiungi nome, /amici togli nome';
      if (!L.length) return 'Non hai ancora amici. Aggiungine uno con /amici aggiungi nome';
      const on = [], off = [];
      for (const f of L) { const o = online(f)[0]; if (o) on.push('• ' + o.name + posizione(o, k)); else off.push(nome(f) + (S.visto[f] ? ' (' + quando(S.visto[f]) + ')' : '')); }
      return ['Amici online: ' + (on.length ? on.length : 'nessuno')].concat(on.slice(0, 9), off.length ? ['Offline: ' + off.join(', ')] : []).join('\n');
    });

    // chi ha k tra gli amici e ora è online (tranne k stesso)
    const chiMiSegue = k => api.players().filter(o => key(o.name) !== k && (S.amici[key(o.name)] || []).includes(k));

// i bot del plugin Stress test non si salvano
    const finto = p => !!(globalThis.VoxeliaStress && globalThis.VoxeliaStress.bot(p));
    api.on('join', p => {
      if (finto(p)) return;
      const k = key(p.name);
      S.nomi[k] = p.name; S.visto[k] = Date.now(); api.save();
      // la zona arriva dal gioco poco dopo l'ingresso: aspetto un attimo per dirla agli amici
      api.after(4000, () => {
        const io = api.player(p.id); if (!io) return;
        for (const o of chiMiSegue(k)) o.tell('★ Il tuo amico ' + io.name + ' è entrato' + posizione(io, key(o.name)) + '.');
        const L = S.posta[k] || [], nuovi = L.filter(m => !m.letto);
        if (nuovi.length) io.tell('✉ Hai ' + (nuovi.length === 1 ? 'un messaggio nuovo' : nuovi.length + ' messaggi nuovi') + ':\n' + leggi(io).split('\n').slice(1).filter(r => r[0] === '★').join('\n'));
        const amici = (S.amici[k] || []).map(online).filter(x => x.length).map(x => x[0].name);
        if (amici.length) io.tell('Amici online: ' + amici.join(', ') + ' (/amici per sapere dove)');
      });
    });

    api.on('leave', p => {
      if (finto(p)) return;
      const k = key(p.name); S.visto[k] = Date.now(); api.save();
      if (!C.avvisoUscita || online(k).length) return;
      for (const o of chiMiSegue(k)) o.tell('Il tuo amico ' + p.name + ' è uscito.');
    });
  }
};
