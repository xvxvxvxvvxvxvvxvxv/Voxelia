// Taglie del giorno: ogni giorno il server estrae alcune taglie uguali per tutti (boss, arena, scambi, esplorazione).
// /taglie mostra quelle di oggi e i tuoi progressi. Premi e numero di taglie si cambiano in taglie.config.json.
// La Cripta Dimenticata dalla 7.2 si raggiunge solo dal Borgo delle Ceneri: chi non l'ha ancora aperto riceve al suo posto
// un'altra taglia (la stessa per tutti quelli nella sua situazione). Il gioco dice al plugin se il Borgo è aperto.
const DUNGEON = { tana: 'Tana dei Goblin', cripta: 'Cripta Dimenticata', piramide: 'Piramide di Khem', cristallo: 'Caverne di Cristallo',
  fucina: 'Fucina Infernale', abisso: 'Abisso Sommerso', cittadella: 'Cittadella del Vuoto' };
const ZONE = { forest: 'Foresta di Elmwood', desert: 'Deserto di Khem', peaks: 'Picchi Gelidi', in_library: 'Biblioteca Arcana', in_temple: 'Tempio della Luce', in_castle: 'Castello di Aldoria' };

// tutte le taglie possibili: ev è l'evento che le fa avanzare, ok decide se quell'evento conta,
// fam raggruppa le taglie simili (ne esce al massimo una per gruppo)
const POOL = [
  { id: 'boss2', fam: 'boss', testo: 'Sconfiggi 2 boss di dungeon', ev: 'dungeon', n: 2 },
  { id: 'boss4', fam: 'boss', testo: 'Sconfiggi 4 boss di dungeon', ev: 'dungeon', n: 4, extra: 1 },
  ...Object.entries(DUNGEON).map(([d, nome]) => ({ id: 'dg_' + d, testo: 'Libera ' + nome, ev: 'dungeon', n: 1, ok: (p, dg) => dg === d })),
  { id: 'arena1', fam: 'arena', testo: 'Vinci un incontro nel Colosseo', ev: 'arena', n: 1 },
  { id: 'arena3', fam: 'arena', testo: 'Vinci 3 incontri nel Colosseo', ev: 'arena', n: 3, extra: 1 },
  { id: 'scambio', testo: 'Concludi uno scambio con un altro eroe', ev: 'trade', n: 1 },
  ...Object.entries(ZONE).map(([z, nome]) => ({ id: 'zona_' + z, testo: 'Visita ' + nome, ev: 'zone', n: 1, ok: (p, zona) => zona === z })),
  { id: 'dungeon_entra', testo: 'Entra in 3 dungeon diversi', ev: 'zone', n: 3, unico: true, ok: (p, zona) => zona.split('@')[0] in DUNGEON && zona.split('@')[0] }
];

module.exports = {
  name: 'Taglie del giorno',
  version: '1.1',
  author: 'Voxelia',
  description: 'Ogni giorno nuove taglie per tutti: /taglie per vederle',
  defaults: {
    quante: 3,
    premio: { oro: 300, xp: 300 },               // per ogni taglia
    premioDifficile: { oro: 600, xp: 600 },      // per le taglie più lunghe
    premioTutte: { oro: 500, oggetto: 2 },       // bonus quando le completi tutte
    promemoria: true
  },

  setup(api) {
    const C = api.config, chiave = n => String(n).toLowerCase();
    const oggi = () => { const d = new Date(); return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5); };

    // estrazione uguale per tutti, decisa dal giorno: niente da salvare, e dopo un riavvio restano le stesse
    // senzaCripta: la cripta viene saltata e si pesca una taglia in più; le altre restano le stesse
    function taglie(g, senzaCripta) {
      let s = g * 2654435761 % 4294967296; const rnd = () => (s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296;
      const L = POOL.slice(), out = [], usati = new Set();
      while (out.length < Math.max(1, Math.min(6, C.quante | 0 || 3)) && L.length) {
        const t = L.splice(Math.floor(rnd() * L.length), 1)[0], fam = t.fam || t.id;
        if (usati.has(fam) || (senzaCripta && t.id === 'dg_cripta')) continue;                 // non due taglie quasi uguali nello stesso giorno
        usati.add(fam); out.push(t);
      }
      return out;
    }

    function scheda(p) {
      if (globalThis.VoxeliaStress && globalThis.VoxeliaStress.bot(p)) return { nome: p.name, prog: {}, visti: {}, fatte: [] };   // i bot dello Stress test non si salvano
      const s = api.store, g = oggi(); s.eroi = s.eroi || {};
      if (s.giorno !== g) { s.giorno = g; s.eroi = {}; }     // nuovo giorno: progressi azzerati
      const k = chiave(p.name);
      return s.eroi[k] || (s.eroi[k] = { nome: p.name, prog: {}, visti: {}, fatte: [] });
    }

    // il gioco dice se il Borgo delle Ceneri (e quindi la cripta) è aperto per questo eroe
    const aperta = new Map();   // id del giocatore -> true/false
    api.client('(' + function (ID) {
      let ultimo = null, ultimoId = null;
      const cripta = () => { try { return !!(P && P.unl && P.unl.rovine); } catch (e) { return false; } };
      setInterval(() => {
        try {
          if (!P || !NET.ok || !NET.id) return;
          const v = cripta();
          if (v !== ultimo || NET.id !== ultimoId) { ultimo = v; ultimoId = NET.id; VXP.send(ID, 'cripta', { aperta: v }); }
        } catch (e) {}
      }, 2000);
    }.toString() + ')(' + JSON.stringify(api.id) + ');');
    api.onClient('cripta', (p, d) => {
      const v = !!(d && d.aperta); aperta.set(p.id, v);
      // la scelta resta fissa per tutto il giorno, così i progressi non cambiano taglia a metà
      const e = scheda(p); if (e.cripta == null) { e.cripta = v; api.save(); }
    });
    api.on('leave', p => aperta.delete(p.id));
    // le taglie di oggi per questo eroe; finché il gioco non ha risposto conta come Borgo chiuso
    // prima della 7.2 la cripta aveva l'ingresso in città: aperta per tutti
    const [ma, mi] = String(api.gameVersion || '').split('.').map(Number), criptaInCitta = ma < 7 || (ma === 7 && mi < 2);
    const sue = p => {
      if (criptaInCitta) return taglie(oggi());
      const e = scheda(p);
      if (e.cripta == null && aperta.has(p.id)) { e.cripta = aperta.get(p.id); api.save(); }   // nuovo giorno: si fissa con l'ultima risposta
      return taglie(oggi(), !e.cripta);
    };

    const RARITA = ['comune', 'non comune', 'raro', 'epico'];
    const testo = pr => [pr.oro && pr.oro + ' oro', pr.pozioni && pr.pozioni + ' pozioni', pr.xp && pr.xp + ' XP', pr.oggetto != null && 'un oggetto ' + (RARITA[pr.oggetto] || 'raro')].filter(Boolean).join(', ');
    function dai(p, pr) {
      if (!pr) return;
      if (globalThis.VoxeliaGuardiano) globalThis.VoxeliaGuardiano.grazia(p.name);
      if (pr.oro > 0) p.give('gold', pr.oro);
      if (pr.pozioni > 0) p.give('pot', pr.pozioni);
      if (pr.xp > 0) p.give('xp', pr.xp);
      if (pr.oggetto != null) p.give('item', 1, pr.oggetto);
    }

// i bot del plugin Stress test non si salvano
    const finto = p => !!(globalThis.VoxeliaStress && globalThis.VoxeliaStress.bot(p));
    function avanza(p, ev, ...dati) {
      if (!p || finto(p)) return;
      const T = sue(p), e = scheda(p); let cambiato = false;
      for (const t of T) {
        if (t.ev !== ev || e.fatte.includes(t.id)) continue;
        const r = t.ok ? t.ok(p, ...dati) : true; if (!r) continue;
        if (t.unico) { const v = e.visti[t.id] || (e.visti[t.id] = []); if (v.includes(r)) continue; v.push(r); }
        e.prog[t.id] = (e.prog[t.id] || 0) + 1; cambiato = true;
        if (e.prog[t.id] >= t.n) {
          e.fatte.push(t.id);
          const pr = t.extra ? C.premioDifficile : C.premio;
          dai(p, pr);
          p.tell('Taglia completata: ' + t.testo + '! Premio: ' + testo(pr) + '.');
          api.announce('🎯 ' + p.name + ' ha completato la taglia "' + t.testo + '"', p.room);
          if (e.fatte.length === T.length) {
            dai(p, C.premioTutte);
            api.announce('🏆 ' + p.name + ' ha completato tutte le taglie di oggi!', p.room);
            p.tell('Tutte le taglie di oggi completate! Bonus: ' + testo(C.premioTutte) + '.');
          }
        } else p.tell('Taglia "' + t.testo + '": ' + e.prog[t.id] + '/' + t.n);
      }
      if (cambiato) api.save();
    }

    api.on('dungeon', (p, d) => avanza(p, 'dungeon', d));
    api.on('arena', vincitore => avanza(vincitore, 'arena'));
    api.on('trade', (a, b) => { avanza(a, 'trade'); avanza(b, 'trade'); });
    api.on('zone', (p, zona) => avanza(p, 'zone', String(zona || '')));

    api.command('taglie', 'le taglie di oggi e i tuoi progressi', p => {
      const T = sue(p), e = scheda(p);
      return 'Taglie di oggi (' + e.fatte.length + '/' + T.length + ' completate):\n' +
        T.map(t => (e.fatte.includes(t.id) ? '✔ ' : '• ') + t.testo + ' — ' + (e.fatte.includes(t.id) ? 'fatta' : (e.prog[t.id] || 0) + '/' + t.n)).join('\n') +
        '\nPremio per taglia: ' + testo(C.premio) + '. Tutte e ' + T.length + ': ' + testo(C.premioTutte) + ' in più.';
    });

    api.on('join', p => {
      if (!C.promemoria || finto(p)) return;
      const e = scheda(p), n = sue(p).length;
      if (e.fatte.length < n) api.after(5000, () => { if (p.online) p.tell('Ci sono taglie da completare oggi (' + e.fatte.length + '/' + n + '): scrivi /taglie'); });
    });

    // pagina pubblica con le taglie di oggi e chi le ha completate
    api.route('GET', '/', (req, res, x) => {
      const T = taglie(oggi()), s = api.store, E = s.giorno === oggi() ? Object.values(s.eroi || {}) : [];
      const alt = !criptaInCitta && T.some(t => t.id === 'dg_cripta') && taglie(oggi(), true).find(t => !T.includes(t));
      const esc = v => String(v).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
      x.send('<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Taglie del giorno</title>' +
        '<style>body{font:15px system-ui,sans-serif;margin:0;padding:16px;background:#1a1712;color:#efe6d4}li{margin:6px 0}small{color:#b4a88f}</style>' +
        '<h1>🎯 Taglie del giorno</h1><ul>' + T.map(t => '<li>' + esc(t.testo) + ' <small>(' + E.filter(e => e.fatte.includes(t.id)).length + ' eroi)</small>' +
          (t.id === 'dg_cripta' && alt ? '<br><small>Chi non ha ancora aperto il Borgo delle Ceneri: ' + esc(alt.testo) + ' (' + E.filter(e => e.fatte.includes(alt.id)).length + ' eroi)</small>' : '') + '</li>').join('') + '</ul>' +
        '<h2>Chi le ha completate tutte</h2><p>' + (E.filter(e => e.fatte.length >= T.length).map(e => esc(e.nome)).join(', ') || 'Ancora nessuno.') + '</p>');
    });
  }
};
