// Albo degli eroi: una pagina web pubblica (/plugins/albo/) con la scheda di ogni eroe, e /albo <nome> in gioco.
// Il plugin conta da solo livello, primo e ultimo accesso e ore di gioco (eventi join/leave, più un controllo ogni
// minuto così un riavvio fa perdere al massimo un minuto). Arena dalla classifica del server; il resto lo legge, in sola
// lettura, dai dati degli altri plugin dentro voxelia-data.json, quando ci sono: Gara di pesca, Torneo dell'arena,
// Caccia al tesoro, Premio giornaliero e Case (casa e pet). Non scrive mai i dati degli altri plugin.
// Privacy: non legge Guardiano, Posta e amici, Teletrasporto e Taglie; non mostra stanze, codici, IP, depositi né
// statistiche dei pet. Ogni eroe può togliersi dalla pagina pubblica con /albo nascondi (e tornare con /albo mostra);
// l'admin può nascondere dei nomi con "nascosti" nel config.
// Se un altro plugin cambia il modo in cui salva i dati, va aggiornata qui solo la funzione extra().
const fs = require('fs'), path = require('path');

// nomi da mostrare per i modelli di casa e le specie dei pet (dal plugin Case)
const MODELLI = { casetta: 'Casetta di legno', cottage: 'Cottage di pietra', villetta: 'Villetta con giardino', baita: 'Baita di montagna', torre: 'Torre del mago',
  pescatore: 'Casa del pescatore', villa: 'Villa nobiliare', tenda: 'Tenda del deserto', igloo: 'Igloo dei Picchi', fattoria: 'Casale di campagna' };
const SPECIE = { cane: 'Cane', gatto: 'Gatto', coniglio: 'Coniglio', volpe: 'Volpe', pinguino: 'Pinguino', gufo: 'Gufo', tartaruga: 'Tartaruga',
  draghetto: 'Draghetto', maialino: 'Maialino', pulcino: 'Pulcino' };
// nomi dei pesci: presi da pesca.js se c'è (sola lettura), altrimenti dal codice della specie
function nomiPesci(dir) {
  const o = {};
  try { const src = fs.readFileSync(path.join(dir, 'pesca.js'), 'utf8'); for (const m of src.matchAll(/(\w+): \['((?:[^'\\]|\\.)*)', \d/g)) o[m[1]] = m[2].replace(/\\(.)/g, '$1'); } catch (e) {}
  return id => o[id] || (id.charAt(0).toUpperCase() + id.slice(1)).replace(/_/g, ' ');
}

module.exports = {
  name: 'Albo degli eroi',
  version: '1.1',
  author: 'Voxelia',
  description: 'Pagina web con la scheda di ogni eroe (livello, ore di gioco, arena e i dati degli altri plugin) e /albo <nome>',
  defaults: {
    titolo: 'Albo degli eroi',
    nascosti: [],              // nomi da non mostrare mai sulla pagina pubblica
    minutiMinimi: 0,           // sulla pagina solo gli eroi con almeno tanti minuti di gioco contati dall'Albo (0 = tutti)
    indirizzo: ''              // indirizzo pubblico del server per i link in chat, es. https://voxelia.example.it (vuoto = quello da cui gioca ogni eroe)
  },

  setup(api) {
    const C = api.config, K = n => String(n || '').trim().toLowerCase(), MIN = 60000;
    const S = api.store; if (!S.eroi || typeof S.eroi !== 'object') S.eroi = {}; if (!S.privati || typeof S.privati !== 'object') S.privati = {};
    const pesce = nomiPesci(__dirname);
    const bot = p => !!(globalThis.VoxeliaStress && globalThis.VoxeliaStress.bot(p));
    const valido = n => !!K(n) && K(n) !== 'eroe';   // "Eroe" è il nome di chi non l'ha ancora scelto

    // ---------- indirizzo completo per i link in chat (dalla 7.11.1 i link in chat si cliccano) ----------
    // "indirizzo" nel config vince; se è vuoto si usa l'indirizzo da cui ogni eroe ha aperto il gioco
    const origini = new Map();   // id della connessione → es. https://voxelia.example.it
    api.client('(function(){const ID=' + JSON.stringify(api.id) + ';let u=0;const di=()=>VXP.send(ID,"origine",{o:location.origin});' +
      'VXP.on(ID,"origine?",di);setInterval(()=>{try{if(NET.ok&&NET.id&&NET.id!==u){u=NET.id;di()}}catch(e){}},1000)})();');
    api.onClient('origine', (p, d) => { const o = String(d && d.o || ''); if (/^https?:\/\/[A-Za-z0-9.:\[\]-]{1,200}$/.test(o)) origini.set(p.id, o); });
    api.after(500, () => { for (const p of api.players()) p.send('origine?', {}); });   // dopo una Ricarica del plugin
    const linkPagina = (p, resto) => (String(C.indirizzo || '').trim().replace(/\/+$/, '') || origini.get(p.id) || '') + '/plugins/' + api.id + '/' + (resto || '');

    // ---------- ore di gioco ----------
    const visto = new Map();   // id della connessione → ultima volta che il tempo è stato contato
    function conta(p, fine) {
      if (!valido(p.name) || bot(p)) return;
      const k = K(p.name), ora = Date.now(), e = S.eroi[k] || (S.eroi[k] = { nome: p.name, lv: 0, primo: ora, visto: ora, ms: 0, accessi: 0 });
      const da = visto.get(p.id);
      if (da) e.ms += Math.max(0, Math.min(ora - da, 5 * MIN));   // al massimo 5 minuti per controllo (es. server sospeso)
      if (fine) visto.delete(p.id); else visto.set(p.id, ora);
      e.nome = p.name; e.visto = ora; if (p.lv > 0) e.lv = p.lv;
      return e;
    }
    api.on('join', p => { visto.delete(p.id); const e = conta(p); if (e) { e.accessi++; api.save(); } });
    api.on('leave', p => { origini.delete(p.id); if (conta(p, true)) api.save(); });
    api.every(MIN, () => { let n = 0; for (const p of api.players()) if (conta(p)) n++; if (n) api.save(); });
    api.on('start', () => { for (const p of api.players()) conta(p); });   // dopo Ricarica: riprende chi è già online
    api.on('stop', () => { for (const p of api.players()) conta(p, true); api.save(); });

    // ---------- dati degli altri plugin (sola lettura da voxelia-data.json) ----------
    const FILE = process.env.DATA_FILE || path.join(path.dirname((require.main && require.main.filename) || path.join(api.dir, '..', 'server.js')), 'voxelia-data.json');
    let cache = { t: 0, m: 0, plug: {} };
    function plug() {
      const ora = Date.now(); if (ora - cache.t < 5000) return cache.plug;
      cache.t = ora;
      try {
        const m = fs.statSync(FILE).mtimeMs;
        if (m !== cache.m) { const j = JSON.parse(fs.readFileSync(FILE, 'utf8')); cache.m = m; cache.plug = j && j.plug && typeof j.plug === 'object' ? j.plug : {}; }
      } catch (e) { if (cache.m !== -1) api.log('non riesco a leggere ' + FILE + ': ' + e.message); cache.m = -1; }
      return cache.plug;
    }
    const ob = v => v && typeof v === 'object' ? v : {};
    const oggi = () => { const d = new Date(); return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5); };
    const kg = k => k >= 10 ? k.toFixed(0) + ' kg' : k >= 1 ? k.toFixed(1) + ' kg' : Math.round(k * 1000) + ' g';
    // tutto quello che gli altri plugin sanno di un eroe, già pronto da mostrare (solo dati pubblici)
    function extra(k) {
      const P = plug(), o = {};
      const pe = ob(P.pesca), me = ob(pe.pes)[k];
      const rec0 = Object.entries(ob(pe.rec)).filter(([id, r]) => r && K(r.nome) === k && id !== 'stivale');
      if (me || rec0.length) {
        const rec = rec0.map(([id, r]) => pesce(id) + ' ' + kg(+r.kg || 0));
        o.pesca = { pesci: (me || {}).n | 0, kg: Math.round((+(me || {}).kg || 0) * 10) / 10, leggendari: Object.keys(ob((me || {}).leg)).length, record: rec };
      }
      const tv = ob(ob(P.torneo).vittorie)[k]; if (tv && tv.n) o.tornei = tv.n | 0;
      const ts = ob(ob(P.tesoro).vinti)[k]; if (ts && ts.n) o.tesori = ts.n | 0;
      const gi = ob(ob(P.giornaliero).eroi)[k];
      if (gi) o.giornaliero = { serie: oggi() - gi.ultimo <= 1 ? gi.serie | 0 : 0, totale: gi.totale | 0 };
      const h = ob(ob(P.housing).case)[k];
      if (h) {
        o.casa = { nome: String(h.nome || '').slice(0, 28), modello: MODELLI[h.model] || String(h.model || ''), aperta: !!h.aperta };
        if (h.pet) o.pet = { nome: String(h.pet.nome || '').slice(0, 14), specie: SPECIE[h.pet.specie] || String(h.pet.specie || ''), lv: h.pet.lv | 0 };
      }
      return o;
    }
    const nascosto = k => !!S.privati[k] || (Array.isArray(C.nascosti) && C.nascosti.some(n => K(n) === k));

    // ---------- l'elenco degli eroi ----------
    function eroi(pubblica) {
      for (const p of api.players()) conta(p);   // livello e minuti aggiornati per chi è online
      const ar = api.server.leaderboard().filter(s => s.w || s.l), pos = {}, L = {}, on = new Set(api.players().filter(p => !bot(p)).map(p => K(p.name)));
      ar.forEach((s, i) => { pos[K(s.n)] = { pos: i + 1, punti: s.pts | 0, vinte: s.w | 0, perse: s.l | 0 }; });
      const add = (n, base) => { const k = K(n); if (!valido(n) || L[k] || globalThis.VoxeliaStress && globalThis.VoxeliaStress.bot(n)) return; L[k] = Object.assign({ nome: String(n) }, base || {}); };
      for (const k in S.eroi) { const e = S.eroi[k]; add(e.nome, { lv: e.lv, primo: e.primo, visto: e.visto, minuti: Math.floor(e.ms / MIN), accessi: e.accessi }); }
      // eroi che l'Albo non ha ancora visto ma che compaiono altrove (arena e altri plugin)
      for (const s of ar) add(s.n);
      const P = plug();
      for (const o of [ob(ob(P.pesca).pes), ob(ob(P.torneo).vittorie), ob(ob(P.tesoro).vinti), ob(ob(P.giornaliero).eroi)]) for (const v of Object.values(o)) if (v && v.nome) add(v.nome);
      for (const h of Object.values(ob(ob(P.housing).case))) if (h && h.owner) add(h.owner);
      return Object.entries(L).filter(([k, e]) => !pubblica || (!nascosto(k) && (e.minuti || 0) >= (+C.minutiMinimi || 0)))
        .map(([k, e]) => Object.assign(e, { online: on.has(k), arena: pos[k] || null }, extra(k)));
    }
    const ordina = L => L.sort((a, b) => (b.lv || 0) - (a.lv || 0) || (b.minuti || 0) - (a.minuti || 0) || a.nome.localeCompare(b.nome));

    // ---------- /albo ----------
    const ore = m => m >= 60 ? Math.floor(m / 60) + ' h ' + (m % 60) + ' min' : m + ' min';
    const quando = t => { if (!t) return '?'; const m = Math.floor((Date.now() - t) / MIN); return m < 2 ? 'adesso' : m < 60 ? m + ' min fa' : m < 1440 ? Math.floor(m / 60) + ' h fa' : Math.floor(m / 1440) + ' giorni fa'; };
    function scheda(e) {
      const r = [e.nome + (e.lv ? ' · livello ' + e.lv : '') + (e.online ? ' · online ora' : e.visto ? ' · visto ' + quando(e.visto) : '') + (e.minuti != null ? ' · ' + ore(e.minuti) + ' di gioco' : '')];
      if (e.arena) r.push('Arena: ' + e.arena.punti + ' punti (' + e.arena.pos + '° posto), ' + e.arena.vinte + (e.arena.vinte === 1 ? ' vinta' : ' vinte') + ' e ' + e.arena.perse + (e.arena.perse === 1 ? ' persa' : ' perse'));
      const x = [e.tornei && e.tornei + (e.tornei > 1 ? ' tornei vinti' : ' torneo vinto'), e.tesori && e.tesori + (e.tesori > 1 ? ' tesori trovati' : ' tesoro trovato'),
        e.giornaliero && 'premio giornaliero: ' + (e.giornaliero.serie > 1 ? e.giornaliero.serie + ' giorni di fila, ' : '') + e.giornaliero.totale + ' ritirati'].filter(Boolean);
      if (x.length) r.push(x.join(' · '));
      if (e.pesca) r.push('Pesca: ' + [e.pesca.pesci && e.pesca.pesci + ' pesci, ' + kg(e.pesca.kg), e.pesca.leggendari && e.pesca.leggendari + (e.pesca.leggendari > 1 ? ' leggendari' : ' leggendario'),
        e.pesca.record.length && 'record: ' + e.pesca.record.join(', ')].filter(Boolean).join(' · '));
      if (e.casa) r.push('Casa: ' + (e.casa.nome || e.casa.modello) + (e.casa.nome ? ' (' + e.casa.modello + ')' : '') + (e.pet ? ' · pet: ' + e.pet.nome + ', ' + e.pet.specie.toLowerCase() + ' di livello ' + e.pet.lv : ''));
      return r.join('\n');
    }
    api.command('albo', 'la scheda di un eroe (/albo nome). /albo nascondi per toglierti dalla pagina web', (p, args) => {
      const a = K(args[0]);
      if (a === 'nascondi' || a === 'mostra') {
        if (!valido(p.name)) return 'Scegli prima un nome per il tuo eroe.';
        if (a === 'nascondi') S.privati[K(p.name)] = 1; else delete S.privati[K(p.name)];
        api.save();
        return a === 'nascondi' ? 'La tua scheda non compare più sulla pagina dell\'Albo. In gioco /albo ' + p.name + ' funziona ancora. Per tornare: /albo mostra' : 'La tua scheda è di nuovo sulla pagina dell\'Albo.';
      }
      const chi = args.join(' ').trim() || p.name, k = K(chi);
      if (k !== K(p.name) && nascosto(k)) return chi + ' non compare nell\'Albo.';
      const e = eroi(false).find(e => K(e.nome) === k);
      if (!e) return 'Nell\'Albo non c\'è nessun eroe di nome ' + chi + '.';
      return scheda(e) + (k === K(p.name) ? '\nLa pagina con tutti gli eroi: ' + linkPagina(p) : '');
    });

    // ---------- pagina web ----------
    const e = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
    const STILE = '<style>body{font:14px system-ui,sans-serif;background:#141822;color:#e8ecf4;margin:16px}h1{font-family:Georgia,serif;color:#ffd84a;margin:0 0 4px}' +
      '.su{opacity:.7;margin:0 0 12px}.bar{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 12px}input,select{padding:6px 9px;border-radius:6px;border:0;font:inherit;background:#232a38;color:#e8ecf4}input{flex:1;min-width:160px}' +
      '.g{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:10px}.c{background:#1d2330;border:1px solid #fff1;border-radius:10px;padding:10px 12px}.c:target{border-color:#ffd84a}' +
      '.c h2{font:600 16px Georgia,serif;margin:0;color:#ffd84a;overflow-wrap:anywhere}.lv{float:right;font:600 13px system-ui;background:#ffd84a;color:#141822;border-radius:20px;padding:1px 8px}' +
      '.on{color:#9ff0a0}.m{opacity:.7;font-size:12px;margin:2px 0 6px}.r{margin:3px 0}.r b{color:#c9d2e3;font-weight:600}.vu{opacity:.6}</style>';
    const DISEGNA = 'function nn(s){return String(s==null?"":s).replace(/[&<>"\']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\\"":"&quot;","\'":"&#39;"})[c])}' +
      'function kg(k){return k>=10?k.toFixed(0)+" kg":k>=1?k.toFixed(1)+" kg":Math.round(k*1000)+" g"}function ore(m){return m>=60?Math.floor(m/60)+" h "+(m%60)+" min":m+" min"}' +
      'function fa(t){const m=Math.floor((Date.now()-t)/60000);return m<2?"adesso":m<60?m+" min fa":m<1440?Math.floor(m/60)+" h fa":Math.floor(m/1440)+" giorni fa"}' +
      'function R(i,s){return"<div class=r>"+i+" "+s+"</div>"}' +
      'function card(x){let h="<div class=c id=\\"e-"+encodeURIComponent(x.nome.toLowerCase())+"\\">"+(x.lv?"<span class=lv>liv "+x.lv+"</span>":"")+"<h2>"+nn(x.nome)+"</h2><div class=m>"+' +
      '(x.online?"<span class=on>● online ora</span>":x.visto?"visto "+fa(x.visto):"")+(x.minuti!=null?" · "+ore(x.minuti)+" di gioco":"")+(x.primo?" · dal "+new Date(x.primo).toLocaleDateString("it-IT"):"")+"</div>";' +
      'if(x.arena)h+=R("⚔️","<b>Arena</b> "+x.arena.punti+" punti · "+x.arena.pos+"° posto · "+x.arena.vinte+" vinte · "+x.arena.perse+" perse");' +
      'if(x.tornei)h+=R("🏆","<b>Tornei vinti</b> "+x.tornei);if(x.tesori)h+=R("🗝","<b>Tesori trovati</b> "+x.tesori);' +
      'if(x.giornaliero)h+=R("📅","<b>Premio giornaliero</b> "+(x.giornaliero.serie>1?x.giornaliero.serie+" giorni di fila · ":"")+x.giornaliero.totale+" ritirati");' +
      'if(x.pesca)h+=R("🎣","<b>Pesca</b> "+(x.pesca.pesci?x.pesca.pesci+" pesci · "+kg(x.pesca.kg):"")+(x.pesca.leggendari?" · "+x.pesca.leggendari+(x.pesca.leggendari>1?" leggendari":" leggendario"):"")+(x.pesca.record.length?"<br><small>Record: "+x.pesca.record.map(nn).join(", ")+"</small>":""));' +
      'if(x.casa)h+=R("🏠","<b>"+nn(x.casa.nome||"Casa")+"</b> "+nn(x.casa.modello)+(x.casa.aperta?"":" · chiusa"));if(x.pet)h+=R("🐾","<b>"+nn(x.pet.nome)+"</b> "+nn(x.pet.specie).toLowerCase()+" di livello "+x.pet.lv);' +
      'if(h.indexOf("class=r")<0)h+="<div class=\'r vu\'>Nessuna impresa, per ora.</div>";return h+"</div>"}' +
      'let D=[];function mostra(){const q=document.getElementById("q").value.trim().toLowerCase(),o=document.getElementById("o").value;' +
      'const f={lv:(a,b)=>(b.lv||0)-(a.lv||0),ore:(a,b)=>(b.minuti||0)-(a.minuti||0),arena:(a,b)=>((b.arena||{}).punti||0)-((a.arena||{}).punti||0),visto:(a,b)=>(b.online-a.online)||(b.visto||0)-(a.visto||0),nome:(a,b)=>a.nome.localeCompare(b.nome)}[o];' +
      'const L=D.filter(x=>!q||x.nome.toLowerCase().includes(q)).sort((a,b)=>f(a,b)||a.nome.localeCompare(b.nome));' +
      'document.getElementById("n").textContent=D.length+(D.length===1?" eroe":" eroi")+" · "+D.filter(x=>x.online).length+" online";' +
      'document.getElementById("g").innerHTML=L.length?L.map(card).join(""):"<p>Nessun eroe trovato.</p>"}' +
      'function va(){fetch("dati").then(r=>r.json()).then(j=>{D=j.eroi;mostra();if(location.hash&&!va.f){va.f=1;const el=document.getElementById(location.hash.slice(1));if(el)el.scrollIntoView()}}).catch(()=>{})}' +
      'document.getElementById("q").oninput=mostra;document.getElementById("o").onchange=mostra;va();setInterval(va,30000);';
    api.route('GET', 'dati', (req, res, x) => x.json({ eroi: ordina(eroi(true)) }));
    api.route('GET', '/', (req, res, x) => x.send('<!doctype html><html lang="it"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' + e(C.titolo) + '</title>' + STILE +
      '<h1>📜 ' + e(C.titolo) + '</h1><p class="su" id="n"></p><div class="bar"><input id="q" type="search" placeholder="Cerca un eroe"><select id="o" aria-label="Ordina">' +
      '<option value="lv">Per livello</option><option value="ore">Per ore di gioco</option><option value="arena">Per punti arena</option><option value="visto">Visti di recente</option><option value="nome">Per nome</option></select></div>' +
      '<div class="g" id="g"><p>Caricamento…</p></div><p class="su" style="margin-top:14px">Le ore di gioco si contano da quando c\'è l\'Albo. In gioco: /albo nome · per toglierti da questa pagina: /albo nascondi</p><script>' + DISEGNA + '</script></html>'));
  }
};
