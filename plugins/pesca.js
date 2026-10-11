// Gara di pesca: albo dei record del server, gare a tempo e annunci dei pesci leggendari.
// Nel gioco il plugin "avvolge" fishLand() (la pesca della 7.3) e manda al server specie e peso di ogni pesce preso.
// Il server conosce già nome, rarità e peso possibile di ogni specie (vedi SPECIE): scarta i pesi impossibili, i pesci
// del mare aperto presi fuori dalla barca, i leggendari presi nel mare sbagliato e le catture troppo ravvicinate.
// Resta un limite: i dati arrivano dal gioco del giocatore, quindi chi modifica il proprio gioco può ancora mandare
// catture finte ma plausibili. Anche i nomi degli eroi non sono verificati: "organizzatori" si fida del nome.
//
// Comandi: /pesca (aiuto e gara in corso), /pesca record, /pesca gara, /pesca io, /pesca via [minuti], /pesca stop.
// Pagine: /plugins/pesca/ (albo e classifica, per tutti), /plugins/pesca/admin (avvia e ferma le gare), /plugins/pesca/dati (JSON).

// specie del gioco 7.3.2: nome, rarità (0 comune … 4 leggendario), peso minimo e massimo in kg, mare = solo dalla barca
const SPECIE = {
  sardina: ['Sardina', 0, .05, .15], sgombro: ['Sgombro', 0, .2, .7], orata: ['Orata', 1, .4, 1.8], branzino: ['Branzino', 1, .5, 3],
  polpo: ['Polpo', 2, .8, 4], calamaro: ['Calamaro', 1, .3, 1.5], pesce_spada: ['Pesce spada', 3, 20, 80], trota_dorata: ['Trota dorata', 3, 1, 4],
  stivale: ['Stivale vecchio', 0, .4, .9],
  acciuga: ['Acciuga', 0, .02, .06, 1], merluzzo: ['Merluzzo', 0, .8, 4, 1], dentice: ['Dentice', 1, 1, 6, 1], ricciola: ['Ricciola', 1, 3, 15, 1],
  lampuga: ['Lampuga', 2, 4, 18, 1], razza: ['Razza', 2, 2, 10, 1], cernia: ['Cernia', 2, 5, 25, 1], tonno: ['Tonno', 2, 15, 90, 1],
  murena: ['Murena', 2, 1, 6, 1], pesce_lanterna: ['Pesce lanterna', 3, .3, 1.2, 1], verdesca: ['Verdesca', 3, 20, 60, 1],
  re_spada: ['Re Spada', 4, 120, 300, 1], tonno_rosso: ['Tonno Rosso Gigante', 4, 250, 600, 1], murena_abissi: ['Murena degli Abissi', 4, 30, 80, 1],
  luna_argento: ['Luna d\'Argento', 4, 200, 900, 1], vecchio_testardo: ['Il Vecchio Testardo', 4, 300, 500, 1]
};
// i cinque mari della Puledra: cosa ci si pesca e il leggendario di ognuno
const MARI = {
  mare_scogliera: ['Scogliera dei Gabbiani', 're_spada', 'acciuga merluzzo dentice ricciola orata sgombro razza pesce_spada'],
  mare_banco: ['Banco dei Tonni', 'tonno_rosso', 'sgombro ricciola lampuga tonno acciuga pesce_spada verdesca'],
  mare_fossa: ['Fossa Profonda', 'murena_abissi', 'merluzzo cernia murena razza polpo pesce_lanterna verdesca'],
  mare_grotta: ['Grotta Marina', 'luna_argento', 'calamaro pesce_lanterna polpo murena dentice acciuga'],
  mare_naufragio: ['Punta del Naufragio', 'vecchio_testardo', 'cernia polpo murena stivale verdesca tonno merluzzo']
};
const RARITA = ['Comune', 'Non comune', 'Raro', 'Epico', 'Leggendario'];

// codice nel gioco: avvolge fishLand e manda ogni pesce preso al server
function nelGioco(ID) {
  if (typeof fishLand !== 'function') { console.warn('[pesca] questa versione del gioco non ha fishLand: la gara di pesca non vede le catture'); return; }
  const vecchia = fishLand;
  fishLand = function (F) {
    const r = vecchia.apply(this, arguments);
    try { const x = F && F.res; if (x && x.f) VXP.send(ID, 'preso', { id: x.f.id, kg: x.kg }); } catch (e) {}
    return r;
  };
  VXP.on(ID, 'avviso', d => { try { msg(d.testo); } catch (e) {} });
  VXP.on(ID, 'banner', d => { try { banner(d.titolo, d.testo, 'stella'); } catch (e) {} });
}

module.exports = {
  name: 'Gara di pesca',
  version: '1.0',
  author: 'Voxelia',
  description: 'Albo dei record per ogni specie, gare di pesca a tempo con premi e annuncio dei pesci leggendari',
  defaults: {
    durataMinuti: 30,                // durata di una gara
    orari: [],                       // gare automatiche all'ora del server, es. ["18:00", "21:30"]
    premi: [{ oro: 3000, xp: 400 }, { oro: 1500, xp: 200 }, { oro: 750, xp: 100 }],   // primo, secondo, terzo (oro, xp, pozioni)
    organizzatori: [],               // nomi degli eroi che possono scrivere /pesca via e /pesca stop (oltre al pannello admin)
    annunciaLeggendari: true,        // annuncio a tutti quando qualcuno prende un leggendario
    annunciaRecordDa: 2,             // rarità minima per annunciare a tutti un nuovo record del server (0 comune … 4 leggendario, -1 mai)
    secondiTraCatture: 4             // catture più ravvicinate di così vengono scartate
  },

  setup(api) {
    const C = api.config, S = api.store;
    S.rec = S.rec || {}; S.pes = S.pes || {}; S.premi = S.premi || {};
    if (S.gara === undefined) S.gara = null;
    const K = s => String(s || '').trim().toLowerCase();
    const kgS = k => k >= 10 ? k.toFixed(0) + ' kg' : k >= 1 ? k.toFixed(1) + ' kg' : Math.round(k * 1000) + ' g';
    const tempo = ms => { const m = Math.max(0, Math.ceil(ms / 60000)); return m >= 60 ? Math.floor(m / 60) + ' h ' + (m % 60) + ' min' : m + ' min'; };
    const ultima = new Map();       // nome → ora dell'ultima cattura accettata
    let capoAnnunciato = 0, capo = '';

    // ---------- la gara ----------
    const classifica = () => S.gara ? Object.values(S.gara.tot).filter(t => t.kg > 0).sort((a, b) => b.kg - a.kg || a.t - b.t) : [];
    function avvia(minuti, da) {
      if (S.gara) return 'C\'è già una gara in corso: finisce tra ' + tempo(S.gara.fine - Date.now()) + '.';
      const m = Math.max(1, Math.min(600, Math.round(+minuti || C.durataMinuti || 30)));
      S.gara = { inizio: Date.now(), fine: Date.now() + m * 60000, da: da || 'il server', tot: {}, avvisi: {} };
      capo = ''; capoAnnunciato = 0; api.save();
      api.announce('🎣 Gara di pesca! Per ' + m + ' minuti vince chi pesca più chili. Classifica: /pesca gara');
      api.broadcast('banner', { titolo: 'Gara di pesca!', testo: m + ' minuti: vince chi pesca più chili' });
      api.log('gara avviata da ' + (da || 'il server') + ' per ' + m + ' minuti');
      return 'Gara avviata per ' + m + ' minuti.';
    }
    function premia(p, pr, pos) {
      if (pr.oro > 0) p.give('gold', pr.oro);
      if (pr.xp > 0) p.give('xp', pr.xp);
      if (pr.pozioni > 0) p.give('pot', pr.pozioni);
      p.tell('Premio della gara di pesca (' + pos + '° posto): ' + [pr.oro > 0 && pr.oro + ' oro', pr.xp > 0 && pr.xp + ' xp', pr.pozioni > 0 && pr.pozioni + ' pozioni'].filter(Boolean).join(', ') + '.');
    }
    function chiudi(perche) {
      const g = S.gara; if (!g) return 'Non c\'è nessuna gara in corso.';
      const L = classifica(), premi = Array.isArray(C.premi) ? C.premi : [];
      S.gara = null;
      if (!perche) S.ultima = { fine: Date.now(), podio: L.slice(0, 3).map(t => ({ nome: t.nome, kg: t.kg, n: t.n })), pescatori: L.length };
      if (perche) { api.announce('🎣 La gara di pesca è stata annullata (' + perche + ').'); api.save(); return 'Gara annullata.'; }
      if (!L.length) api.announce('🎣 La gara di pesca è finita: nessuno ha preso niente!');
      else {
        api.announce('🏆 Gara di pesca finita! Vince ' + L[0].nome + ' con ' + kgS(L[0].kg) + (L[1] ? ' · 2° ' + L[1].nome + ' (' + kgS(L[1].kg) + ')' : '') + (L[2] ? ' · 3° ' + L[2].nome + ' (' + kgS(L[2].kg) + ')' : ''));
        api.broadcast('banner', { titolo: 'Vince ' + L[0].nome + '!', testo: 'Gara di pesca: ' + kgS(L[0].kg) });
        L.slice(0, premi.length).forEach((t, i) => {
          const pr = premi[i] || {}, p = api.player(t.nome);
          if (p) premia(p, pr, i + 1); else (S.premi[K(t.nome)] = S.premi[K(t.nome)] || []).push(Object.assign({ pos: i + 1 }, pr));
        });
      }
      api.save(); api.log('gara finita: ' + (L.length ? L.slice(0, 3).map(t => t.nome + ' ' + kgS(t.kg)).join(', ') : 'nessuna cattura'));
      return 'Gara chiusa.';
    }
    api.on('join', p => {
      const P = S.premi[K(p.name)]; if (!P) return;
      delete S.premi[K(p.name)]; api.save();
      api.after(3000, () => { const q = api.player(p.name); if (q) for (const pr of P) premia(q, pr, pr.pos); });
    });
    // ogni 15 secondi: fine della gara, avvisi degli ultimi minuti e gare automatiche
    let orarioFatto = '';
    api.every(15000, () => {
      const now = Date.now(), g = S.gara;
      if (g) {
        const resta = g.fine - now;
        if (resta <= 0) return chiudi();
        for (const m of [10, 5, 1]) if (resta <= m * 60000 && resta > (m * 60000 - 60000) && !g.avvisi[m] && g.fine - g.inizio > m * 60000 * 2) {
          g.avvisi[m] = 1; api.save(); const L = classifica();
          api.announce('🎣 Gara di pesca: ' + (m === 1 ? 'manca 1 minuto' : 'mancano ' + m + ' minuti') + (L.length ? '! In testa ' + L[0].nome + ' con ' + kgS(L[0].kg) : '! Nessuno ha ancora preso niente'));
        }
      }
      const d = new Date(), hm = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'), chiave = d.toDateString() + ' ' + hm;
      if (Array.isArray(C.orari) && C.orari.some(o => String(o).trim().padStart(5, '0') === hm) && orarioFatto !== chiave) { orarioFatto = chiave; if (!S.gara) avvia(C.durataMinuti, 'orario ' + hm); }
    });

    // ---------- le catture dal gioco ----------
    function valida(p, d) {
      const id = d && String(d.id || ''), s = Object.prototype.hasOwnProperty.call(SPECIE, id) && SPECIE[id], kg = d && +d.kg;
      if (!s) return 'specie sconosciuta ' + id.slice(0, 30);
      if (!isFinite(kg) || kg < s[2] - .01 || kg > s[3] + .01) return s[0] + ' di ' + kg + ' kg';
      const z = String(p.zone || '').split('@')[0], mare = MARI[z];
      if (s[4] && !mare) return s[0] + ' fuori dal mare (' + z + ')';
      if (mare && id !== mare[1] && !mare[2].split(' ').includes(id)) return s[0] + ' in ' + mare[0];
      if (s[1] === 4 && (!mare || mare[1] !== id)) return s[0] + ' nel mare sbagliato (' + z + ')';
      const t = ultima.get(K(p.name)) || 0;
      if (Date.now() - t < (C.secondiTraCatture || 0) * 1000) return 'catture troppo ravvicinate';
      return null;
    }
    api.onClient('preso', (p, d) => {
      const no = valida(p, d);
      if (no) { api.log('cattura scartata di ' + p.name + ': ' + no); return; }
      const id = d.id, s = SPECIE[id], kg = Math.round(+d.kg * 100) / 100, k = K(p.name), now = Date.now();
      ultima.set(k, now);
      if (id === 'stivale') return;   // uno stivale non è un pesce: niente record né chili in gara
      // statistiche dell'eroe
      const me = S.pes[k] = S.pes[k] || { nome: p.name, n: 0, kg: 0, leg: {} };
      me.nome = p.name; me.n++; me.kg = Math.round((me.kg + kg) * 100) / 100;
      if (!me.best || kg > me.best.kg) me.best = { id, kg };
      if (s[1] === 4) me.leg[id] = Math.max(me.leg[id] || 0, kg);
      // leggendario
      if (s[1] === 4 && C.annunciaLeggendari !== false) api.announce('🐉 ' + p.name + ' ha pescato ' + s[0] + ' (' + kgS(kg) + ')!');
      // record del server
      const r = S.rec[id];
      if (!r || kg > r.kg) {
        S.rec[id] = { kg, nome: p.name, t: now };
        const da = C.annunciaRecordDa == null ? 2 : +C.annunciaRecordDa;
        if (r && da >= 0 && s[1] >= da && s[1] < 4) api.announce('📏 Nuovo record del server: ' + s[0] + ' di ' + kgS(kg) + ', preso da ' + p.name + (r.nome !== p.name ? ' (prima: ' + r.nome + ', ' + kgS(r.kg) + ')' : '') + '!');
        else p.send('avviso', { testo: (r ? 'Nuovo record del server: ' : 'Primo ' + s[0] + ' dell\'albo: ') + s[0] + ' di ' + kgS(kg) + '!' });
      }
      // gara
      const g = S.gara;
      if (g && now < g.fine) {
        const t = g.tot[k] = g.tot[k] || { nome: p.name, kg: 0, n: 0 };
        t.nome = p.name; t.kg = Math.round((t.kg + kg) * 100) / 100; t.n++; t.t = now;
        if (!t.best || kg > t.best.kg) t.best = { id, kg };
        const L = classifica(), pos = L.indexOf(t) + 1;
        p.tell('Gara: +' + kgS(kg) + ' · totale ' + kgS(t.kg) + ' · sei ' + pos + '° di ' + L.length + ' · mancano ' + tempo(g.fine - now));
        if (L[0] === t && capo !== k) { capo = k; if (now - capoAnnunciato > 60000 && L.length > 1) { capoAnnunciato = now; api.announce('🎣 ' + p.name + ' passa in testa alla gara di pesca con ' + kgS(t.kg) + '!'); } }
      }
      api.save();
    });

    // ---------- comandi ----------
    function testoRecord() {
      const R = Object.keys(SPECIE).filter(id => id !== 'stivale' && S.rec[id]).map(id => SPECIE[id][0] + ' ' + kgS(S.rec[id].kg) + ' (' + S.rec[id].nome + ')');
      if (!R.length) return 'L\'albo dei record è ancora vuoto: pesca qualcosa!';
      const righe = []; let riga = '';
      for (const r of R) { if (riga && (riga + ' · ' + r).length > 190) { righe.push(riga); riga = r; } else riga = riga ? riga + ' · ' + r : r; }
      if (riga) righe.push(riga);
      return ('Albo dei record (' + R.length + ' specie su ' + (Object.keys(SPECIE).length - 1) + '):\n' + righe.join('\n')).split('\n').slice(0, 12).join('\n');
    }
    function testoGara(p) {
      const g = S.gara;
      if (!g) {
        const u = S.ultima, o = (C.orari || []).length ? ' Gare automatiche alle ' + C.orari.join(', ') + '.' : '';
        return 'Nessuna gara in corso.' + o + (u && u.podio.length ? '\nUltima gara: ' + u.podio.map((t, i) => (i + 1) + '° ' + t.nome + ' ' + kgS(t.kg)).join(' · ') : '');
      }
      const L = classifica(), io = L.findIndex(t => K(t.nome) === K(p.name));
      return 'Gara di pesca: mancano ' + tempo(g.fine - Date.now()) + '\n' +
        (L.length ? L.slice(0, 5).map((t, i) => (i + 1) + '° ' + t.nome + ' · ' + kgS(t.kg) + ' (' + t.n + (t.n === 1 ? ' pesce)' : ' pesci)')).join('\n') : 'Nessuno ha ancora preso niente.') +
        (io >= 5 ? '\n…\n' + (io + 1) + '° tu · ' + kgS(L[io].kg) : io < 0 && L.length ? '\nTu non hai ancora preso niente.' : '');
    }
    function testoIo(p) {
      const me = S.pes[K(p.name)];
      if (!me) return 'Non hai ancora pescato niente su questo server.';
      const rec = Object.keys(S.rec).filter(id => K(S.rec[id].nome) === K(p.name)).map(id => SPECIE[id] ? SPECIE[id][0] : id);
      const leg = Object.keys(me.leg).map(id => SPECIE[id][0] + ' ' + kgS(me.leg[id]));
      return p.name + ': ' + me.n + ' pesci, ' + kgS(me.kg) + ' in tutto' + (me.best ? ' · il più grosso: ' + SPECIE[me.best.id][0] + ' di ' + kgS(me.best.kg) : '') +
        '\nLeggendari: ' + (leg.length ? leg.join(', ') : 'nessuno') + ' (' + leg.length + '/5)' +
        (rec.length ? '\nRecord del server: ' + rec.join(', ') : '');
    }
    const puoOrganizzare = p => (C.organizzatori || []).map(K).includes(K(p.name));
    api.command('pesca', 'gara di pesca: /pesca record, /pesca gara, /pesca io', (p, args) => {
      const a = K(args[0]);
      if (a === 'record' || a === 'albo') return testoRecord();
      if (a === 'gara' || a === 'classifica') return testoGara(p);
      if (a === 'io' || a === 'me') return testoIo(p);
      if (a === 'via' || a === 'avvia') return puoOrganizzare(p) ? avvia(args[1], p.name) : 'Solo gli organizzatori possono avviare una gara.';
      if (a === 'stop' || a === 'ferma') return puoOrganizzare(p) ? chiudi(args[1] === 'annulla' ? 'decisione di ' + p.name : undefined) : 'Solo gli organizzatori possono fermare una gara.';
      return '🎣 Gara di pesca\n/pesca record — il pesce più grosso di ogni specie\n/pesca gara — la classifica della gara in corso\n/pesca io — i tuoi pesci e i tuoi leggendari' +
        (puoOrganizzare(p) ? '\n/pesca via [minuti] — avvia una gara · /pesca stop [annulla] — la chiude' : '') + '\n' + testoGara(p).split('\n')[0];
    });

    // ---------- pagine web ----------
    const e = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
    const dati = () => ({
      gara: S.gara ? { inizio: S.gara.inizio, fine: S.gara.fine, classifica: classifica().map(t => ({ nome: t.nome, kg: t.kg, n: t.n })) } : null,
      ultima: S.ultima || null,
      record: Object.keys(SPECIE).filter(id => id !== 'stivale').map(id => ({ id, nome: SPECIE[id][0], rarita: SPECIE[id][1], record: S.rec[id] || null })),
      pescatori: Object.values(S.pes).sort((a, b) => b.kg - a.kg).slice(0, 20).map(m => ({ nome: m.nome, n: m.n, kg: m.kg, leggendari: Object.keys(m.leg).length }))
    });
    const STILE = '<style>body{font:14px system-ui,sans-serif;background:#10202c;color:#e8f0f4;margin:0;padding:16px;max-width:900px;margin:auto}h1{font-size:22px}h2{font-size:17px;margin-top:24px}table{border-collapse:collapse;width:100%}td,th{padding:6px 8px;border-bottom:1px solid #fff2;text-align:left}th{color:#9fb8c8;font-weight:600}.r0{color:#c8ccd4}.r1{color:#5ad65a}.r2{color:#4aa3ff}.r3{color:#b866ff}.r4{color:#ffae2b;font-weight:700}.m{color:#9fb8c8}button{padding:8px 12px;border-radius:6px;border:0;cursor:pointer;margin:2px;font:inherit}input{padding:7px;width:70px;font:inherit}.box{background:#ffffff10;border-radius:8px;padding:10px 14px}</style>';
    function pagina(admin) {
      const D = dati(), g = D.gara;
      return '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Gara di pesca</title>' + STILE +
        '<h1>🎣 Gara di pesca' + (admin ? ' · admin' : '') + '</h1>' +
        (admin ? '<div class="box">' + (g ? 'Gara in corso, finisce alle ' + new Date(g.fine).toLocaleTimeString('it-IT') + '. <button onclick="fai(\'stop\')">Chiudi e premia</button><button onclick="if(confirm(\'Annullare la gara senza premi?\'))fai(\'annulla\')" style="background:#a33;color:#fff">Annulla</button>'
          : 'Nessuna gara in corso. Durata <input id="min" type="number" min="1" max="600" value="' + (+C.durataMinuti || 30) + '"> minuti <button onclick="fai(\'via\')">Avvia gara</button>') +
          '<p class="m">Premi, orari automatici e organizzatori si cambiano in pesca.config.json (poi Plugin → Ricarica).</p></div>' +
          '<script>function fai(a){fetch("admin/"+a,{method:"POST",headers:{"x-voxelia":"1","Content-Type":"application/json"},body:JSON.stringify({min:+((document.getElementById("min")||{}).value||0)})}).then(r=>r.json()).then(j=>{if(j.err)alert(j.err);else location.reload()})}</script>' : '') +
        (g ? '<h2>Gara in corso · finisce alle ' + new Date(g.fine).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }) + '</h2>' +
          (g.classifica.length ? '<table><tr><th>#</th><th>Eroe</th><th>Chili</th><th>Pesci</th></tr>' + g.classifica.map((t, i) => '<tr><td>' + (i + 1) + '</td><td>' + e(t.nome) + '</td><td>' + kgS(t.kg) + '</td><td>' + t.n + '</td></tr>').join('') + '</table>' : '<p class="m">Nessuno ha ancora preso niente.</p>')
          : D.ultima && D.ultima.podio.length ? '<h2>Ultima gara</h2><p>' + D.ultima.podio.map((t, i) => ['🥇', '🥈', '🥉'][i] + ' ' + e(t.nome) + ' · ' + kgS(t.kg)).join(' &nbsp; ') + '</p>' : '') +
        '<h2>Albo dei record</h2><table><tr><th>Specie</th><th>Rarità</th><th>Record</th><th>Preso da</th><th>Quando</th></tr>' +
        D.record.sort((a, b) => b.rarita - a.rarita).map(r => '<tr><td class="r' + r.rarita + '">' + e(r.nome) + '</td><td class="m">' + RARITA[r.rarita] + '</td>' +
          (r.record ? '<td>' + kgS(r.record.kg) + '</td><td>' + e(r.record.nome) + '</td><td class="m">' + new Date(r.record.t).toLocaleDateString('it-IT') + '</td>' : '<td class="m">—</td><td></td><td></td>') + '</tr>').join('') + '</table>' +
        (D.pescatori.length ? '<h2>Pescatori</h2><table><tr><th>Eroe</th><th>Pesci</th><th>Chili in tutto</th><th>Leggendari</th></tr>' + D.pescatori.map(m => '<tr><td>' + e(m.nome) + '</td><td>' + m.n + '</td><td>' + kgS(m.kg) + '</td><td>' + m.leggendari + '/5</td></tr>').join('') + '</table>' : '');
    }
    api.route('GET', '/', (req, res, x) => x.send(pagina(false)));
    api.route('GET', 'dati', (req, res, x) => x.json(dati()));
    api.route('GET', 'admin', (req, res, x) => x.send(pagina(true)), { admin: true });
    api.route('POST', 'admin/*', (req, res, x) => x.body(j => {
      if (x.path === '/admin/via') { if (S.gara) return x.json(409, { err: 'C\'è già una gara in corso' }); avvia(j.min, 'il pannello admin'); return x.json({ ok: 1 }); }
      if (x.path === '/admin/stop' || x.path === '/admin/annulla') { if (!S.gara) return x.json(409, { err: 'Nessuna gara in corso' }); chiudi(x.path === '/admin/annulla' ? 'decisione dell\'admin' : undefined); return x.json({ ok: 1 }); }
      x.json(404, { err: 'Azione sconosciuta' });
    }), { admin: true });

    // ---------- codice nel gioco ----------
    api.client('(' + nelGioco.toString() + ')(' + JSON.stringify(api.id) + ');');

    // una gara rimasta aperta da prima di un riavvio
    api.on('start', () => { if (S.gara && Date.now() >= S.gara.fine) chiudi(); });
  }
};
