// Speedrun dei dungeon: il cronometro parte quando l'eroe entra nel primo piano di un dungeon (evento zone, "tana@1") e si
// ferma quando ne sconfigge il boss (evento dungeon). Tutto sul server: il gioco non manda tempi, quindi non li può truccare.
// Classifiche separate per stanza, perché i piani dei dungeon sono generati dal codice della stanza e cambiano del tutto
// da una stanza all'altra. Ogni ciclo di un dungeon si completa una volta sola per stanza (poi il dungeon si rigenera),
// quindi la classifica è per dungeon e ogni tempo dice in che ciclo e a che difficoltà è stato fatto.
// Non vale: uscire dal dungeon (anche morendo), scollegarsi, saltare un piano (es. teletrasporto della modalità
// sviluppatore) o fare meno di tempoMinimoSec. Chi è nello stesso dungeon della stessa stanza con il cronometro acceso
// quando il boss cade ha il suo tempo anche se il colpo finale l'ha dato un compagno.
// Sfida della settimana: ogni lunedì il server sceglie un dungeon; alla fine della settimana il più veloce di ogni stanza
// riceve il premio (subito se è online, se no al prossimo accesso).
const DG = { tana: ['Tana dei Goblin', 2], cripta: ['Cripta Dimenticata', 3], piramide: ['Piramide di Khem', 3], cristallo: ['Caverne di Cristallo', 3],
  fucina: ['Fucina Infernale', 3], abisso: ['Abisso Sommerso', 3], cittadella: ['Cittadella del Vuoto', 4] };   // nome e piani, come DG nel gioco
const DIFF = ['Facile', 'Normale', 'Difficile', 'Incubo'], RAR = ['comune', 'non comune', 'raro', 'epico'];

// pagina web: stesso aspetto dei menu del gioco e della guida (Georgia, oro con l'ombra ruggine, barre di legno, pannelli con l'ombra piena)
const PAGINA = String.raw`<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Speedrun dei dungeon</title>
<style>
:root{--bg:#10131a;--pan:#1b2030;--pan2:#232a40;--btn:#2a3350;--btnh:#3b4770;--fg:#e8ecf4;--mu:#9aa4b8;--ac:#f5b942;--hi:#ffd27a;--lo:#c98a1a;
  --title:#f5b942;--tshadow:#8a3b12;--frame:#8a6a3a;--drop:#2e1d10;--line:#f5b94230;--line2:#f5b94266;--wd3:#4a301b;--ember:#ff8a5a;--rowh:#f5b9420f;
  --f:Georgia,'Times New Roman',serif;color-scheme:dark}
@media(prefers-color-scheme:light){:root{--bg:#e8dfc8;--pan:#fbf3df;--pan2:#f3e8cc;--btn:#fff8e6;--btnh:#f6e7c2;--fg:#2a1a0a;--mu:#6a5a3a;--ac:#8a5a0a;--hi:#6a2a1a;--lo:#b9832a;
  --title:#6a2a1a;--tshadow:#e0c48a;--frame:#b89a62;--drop:#a37a4f;--line:#8a6a3a33;--line2:#8a6a3a77;--rowh:#8a5a0a12;--ember:#b4461c;color-scheme:light}}
*{box-sizing:border-box}
body{margin:0;color:var(--fg);font:400 16px/1.55 var(--f);min-height:100vh;
  background:radial-gradient(ellipse 90% 50% at 50% -10%,#24305466,transparent 70%),repeating-linear-gradient(26.565deg,transparent 0 46px,var(--line) 46px 47px),
  repeating-linear-gradient(-26.565deg,transparent 0 46px,var(--line) 46px 47px),var(--bg)}
.top{position:relative;display:flex;align-items:center;gap:12px;padding:14px clamp(22px,4vw,56px) 15px;font:bold 1.2rem/1.1 var(--f);font-variant:small-caps;letter-spacing:.04em;
  color:#ffd27a;text-shadow:2px 2px 0 #8a3b12,0 0 14px #f5b94244;background:repeating-linear-gradient(180deg,#0000 0 17px,#0000002a 17px 19px),linear-gradient(180deg,#86603b,#5e3f25 55%,#4a301b);
  border-bottom:3px solid #3a2414;box-shadow:inset 0 2px 0 #a37a4f,inset 0 -2px 0 #2e1d1055,0 5px 0 #00000066}
.top::before,.top::after{content:'';position:absolute;top:50%;width:6px;height:6px;margin-top:-3px;background:#d9b36a;box-shadow:inset -2px -2px 0 #8a6420;border-radius:1px}
.top::before{left:8px}.top::after{right:8px}
.top small{display:block;font:italic 400 .74rem var(--f);font-variant:normal;letter-spacing:0;color:#f4e2b8;text-shadow:1px 1px 0 #0008;margin-top:3px}
main{max-width:1080px;margin:0 auto;padding:22px clamp(16px,4vw,56px) 50px}
h1{font:bold clamp(1.9rem,5.5vw,3.2rem)/1 var(--f);letter-spacing:.08em;text-transform:uppercase;color:var(--title);text-shadow:3px 3px 0 var(--tshadow);margin:.2em 0 .25em;text-wrap:balance}
.sub{color:var(--mu);margin:0 0 18px;max-width:70ch}
h2{display:flex;align-items:center;gap:8px;font:bold .95rem/1.25 var(--f);text-transform:uppercase;letter-spacing:.1em;color:var(--hi);margin:0 0 .6em}
h2::after{content:'';flex:1;min-width:30px;height:2px;background:linear-gradient(90deg,var(--line2),transparent)}
.callout{background:var(--pan2);border:3px solid var(--lo);border-radius:6px;box-shadow:0 0 0 3px var(--wd3),0 7px 0 3px var(--drop),0 16px 30px #0007;padding:.9em 1.15em;margin:6px 3px 26px}
.callout>b:first-child{color:var(--hi)}
.callout .tw{margin-bottom:.2em}
.chips{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 18px}
.chips button{font:15px var(--f);color:#fff;background:#2a3350;border:1px solid #f5b94288;border-radius:3px;padding:.45em .85em;cursor:pointer;box-shadow:0 3px 0 #00000080;
  transition:transform .08s,box-shadow .08s,background .15s;display:inline-flex;align-items:center;gap:6px}
.chips button:hover{background:#3b4770}.chips button:active{transform:translateY(2px);box-shadow:0 1px 0 #00000080}
.chips button small{opacity:.75;font-size:.8em}
.chips button.on{background:linear-gradient(180deg,#ffd27a,#e0a634 55%,#c98a1a);border-color:#fff0c0;color:#2a1a06;font-weight:bold;text-shadow:0 1px 0 #fff5}
@media(prefers-color-scheme:light){.chips button:not(.on){background:var(--btn);color:var(--fg);border-color:var(--frame);box-shadow:0 3px 0 var(--drop)}.chips button:not(.on):hover{background:var(--btnh)}}
button:focus-visible{outline:2px solid var(--ac);outline-offset:2px}
.cols{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,340px),1fr));gap:22px;align-items:start}.cols>*{min-width:0}
.card{background:var(--pan);border:2px solid var(--frame);border-radius:4px;box-shadow:0 5px 0 var(--drop),0 10px 20px #0005;padding:.85em 1em 1em}
.tw{overflow:auto;border:2px solid var(--frame);border-radius:4px;background:var(--pan);margin:.6em 0 0;box-shadow:0 4px 0 var(--drop)}
table{border-collapse:collapse;width:100%;font-size:.93rem}
th{text-align:left;font:bold .7rem var(--f);text-transform:uppercase;letter-spacing:.1em;color:#ffd27a;text-shadow:1px 1px 0 #0008;padding:.7em .7em;white-space:nowrap;
  background:repeating-linear-gradient(180deg,#0000 0 13px,#00000022 13px 14px),linear-gradient(180deg,#86603b,#5e3f25);border-bottom:2px solid #3a2414}
td{padding:.5em .7em;border-bottom:1px solid var(--line);vertical-align:top}
tbody tr:nth-child(even){background:var(--rowh)}tbody tr:hover{background:var(--line)}tbody tr:last-child td{border-bottom:0}
td.n{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}
th:first-child,td:first-child{width:2.6em;text-align:center}
@media(max-width:520px){th,td{padding:.5em .45em}th{letter-spacing:.05em}.card{padding:.75em .7em .8em}.callout{padding:.8em .8em}}
td.t{font-weight:bold;color:var(--ac);font-variant-numeric:tabular-nums;white-space:nowrap}
tr.p1 td.t{color:var(--hi)}
td small{display:block;color:var(--mu);font-size:.8rem;line-height:1.3}
.tag{display:inline-block;font:bold .6rem var(--f);text-transform:uppercase;letter-spacing:.06em;border-radius:2px;padding:.15em .45em;box-shadow:0 2px 0 #0006;white-space:nowrap;background:#2a3452;color:#e8ecf4}
.tag.d0{background:#24461f;color:#c8f0c0}.tag.d1{background:#1d3d5e;color:#c0e0ff}.tag.d2{background:#5a3a14;color:#ffd8a8}.tag.d3{background:#5a1f22;color:#ffc8c0}
.vuoto{color:var(--mu);font-style:italic;margin:.5em 0 0}
.vinte{list-style:none;margin:0;padding:0}.vinte li{display:flex;flex-wrap:wrap;gap:4px 10px;align-items:baseline;padding:.45em 0;border-bottom:1px solid var(--line)}.vinte li:last-child{border-bottom:0}
.vinte b{color:var(--hi)}.vinte .t{color:var(--ac);font-weight:bold;font-variant-numeric:tabular-nums}.vinte small{color:var(--mu);margin-left:auto}
.foot{margin-top:28px;color:var(--mu);font-size:.92rem}
kbd{font:bold .78rem var(--f);background:var(--btn);border:1px solid var(--line2);border-radius:3px;box-shadow:0 2px 0 #0009;padding:.1em .5em;color:var(--fg);white-space:nowrap}
.sec{margin-top:26px}
@media(prefers-color-scheme:light){body{background:repeating-linear-gradient(26.565deg,transparent 0 46px,var(--line) 46px 47px),repeating-linear-gradient(-26.565deg,transparent 0 46px,var(--line) 46px 47px),var(--bg)}}
</style></head><body>
<header class="top"><span aria-hidden="true">⏱</span><div>Speedrun dei dungeon<small>Classifiche dei dungeon di Voxelia</small></div></header>
<main><h1>Speedrun</h1><p class="sub" id="su">Caricamento delle classifiche…</p>
<div class="callout" id="sf" hidden></div>
<div class="chips" id="tb" role="tablist" aria-label="Dungeon"></div>
<div class="cols" id="cl"></div>
<section class="card sec"><h2>Sfide vinte</h2><div id="vi" class="vuoto"></div></section>
<p class="foot">In gioco: <kbd>/speedrun</kbd> · il cronometro parte entrando nel primo piano e si ferma sconfiggendo il boss.</p></main>
<script>
function nn(s){return String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c])}
function tm(ms){const s=ms/1000,m=Math.floor(s/60);return(m>=60?Math.floor(m/60)+":"+String(m%60).padStart(2,"0"):m)+":"+(s%60).toFixed(1).padStart(4,"0")}
const DF=["Facile","Normale","Difficile","Incubo"],MED=["🥇","🥈","🥉"],Q=new URLSearchParams(location.search).get("stanza")||"";let D=null,sel="tana";
try{sel=localStorage.getItem("sr_d")||"tana"}catch(e){}
const $=id=>document.getElementById(id);
function tab(L){if(!L||!L.length)return'<p class="vuoto">Nessun tempo, per ora.</p>';
  return'<div class="tw"><table><thead><tr><th>#</th><th>Eroe</th><th>Tempo</th><th>Ciclo</th><th>Difficoltà</th></tr></thead><tbody>'+L.map((e,i)=>'<tr class="p'+(i+1)+'"><td class="n">'+(MED[i]||i+1)+'</td><td>'+nn(e.n)+(e.con.length?"<small>con "+e.con.map(nn).join(", ")+"</small>":"")+'</td><td class="t">'+tm(e.ms)+'</td><td class="n">'+nn(e.c)+'</td><td><span class="tag d'+(DF[e.df]?e.df:"")+'">'+(DF[e.df]||"?")+"</span></td></tr>").join("")+"</tbody></table></div>"}
function mostra(){const d=D.dungeon.find(x=>x.id===sel)||D.dungeon[0];sel=d.id;
  $("tb").innerHTML=D.dungeon.map(x=>'<button role="tab" aria-selected="'+(x.id===sel)+'" class="'+(x.id===sel?"on":"")+'" data-d="'+nn(x.id)+'">'+nn(x.n)+" <small>"+x.piani+" piani</small></button>").join("");
  document.querySelectorAll("#tb button").forEach(b=>b.onclick=()=>{sel=b.dataset.d;try{localStorage.setItem("sr_d",sel)}catch(e){}mostra()});
  $("cl").innerHTML=(D.stanza?'<section class="card"><h2>Nella tua stanza</h2>'+tab(d.stanza)+"</section>":"")+'<section class="card"><h2>Tutte le stanze</h2>'+tab(d.server)+"</section>";
  const s=D.sfida;$("sf").hidden=false;$("sf").innerHTML=s?"📅 <b>Sfida della settimana:</b> "+nn(s.n)+", fino al "+new Date(s.fine).toLocaleString("it-IT",{weekday:"long",day:"numeric",month:"long",hour:"2-digit",minute:"2-digit"})+(s.tempi?tab(s.tempi):'<p class="vuoto">Apri questa pagina con /speedrun in gioco per vedere i tempi della tua stanza.</p>'):"📅 Nessuna sfida questa settimana.";
  $("su").textContent=D.stanza?"Classifiche della tua stanza e di tutto il server. I piani cambiano da una stanza all'altra.":"Record di tutto il server. I piani cambiano da una stanza all'altra: per la tua stanza apri il link di /speedrun.";
  $("vi").className=D.vinte.length?"":"vuoto";
  $("vi").innerHTML=D.vinte.length?'<ul class="vinte">'+D.vinte.map(v=>"<li><b>"+nn(v.n)+"</b> "+nn(v.d)+' <span class="t">'+tm(v.ms)+"</span><small>settimana fino al "+new Date(v.fine).toLocaleDateString("it-IT")+"</small></li>").join("")+"</ul>":"Nessuna, per ora."}
function va(){fetch("dati?stanza="+encodeURIComponent(Q)).then(r=>r.json()).then(j=>{D=j;mostra()}).catch(()=>{})}va();setInterval(va,30000);
</script></body></html>`;

module.exports = {
  name: 'Speedrun dei dungeon',
  version: '1.2',
  author: 'Voxelia',
  description: 'Cronometro dei dungeon, classifiche per stanza, record annunciati, sfida della settimana e /speedrun',
  defaults: {
    tempoMinimoSec: 30,           // tempi più brevi vengono scartati
    righeClassifica: 10,          // quante righe mostra /speedrun <dungeon>
    annunciaRecord: true,         // record della stanza annunciato alla stanza, record del server a tutti
    tempiParziali: true,          // a ogni piano nuovo l'eroe riceve il tempo parziale
    sfidaDungeon: ['tana', 'cripta', 'piramide', 'cristallo', 'fucina', 'abisso'],   // fra questi si sceglie la sfida della settimana
    sfidaMinimoEroi: 2,           // la sfida di una stanza dà il premio solo se l'hanno finita almeno tanti eroi diversi
    sfidaPremioOro: 500,
    sfidaPremioOggetto: 2,        // rarità 0-3 (comune, non comune, raro, epico); -1 = nessun oggetto
    indirizzo: ''                 // indirizzo pubblico del server per i link in chat, es. https://voxelia.example.it (vuoto = quello da cui gioca ogni eroe)
  },

  setup(api) {
    const C = api.config, K = n => String(n || '').trim().toLowerCase();
    const S = api.store; for (const k of ['r', 'premi']) if (!S[k] || typeof S[k] !== 'object') S[k] = {};
    if (!Array.isArray(S.vinte)) S.vinte = [];
    const bot = p => !!(globalThis.VoxeliaStress && globalThis.VoxeliaStress.bot(p));
    const valido = p => !!K(p.name) && K(p.name) !== 'eroe' && !bot(p);
    const tempo = ms => { const s = ms / 1000, m = Math.floor(s / 60); return (m >= 60 ? Math.floor(m / 60) + ':' + String(m % 60).padStart(2, '0') : m) + ':' + (s % 60).toFixed(1).padStart(4, '0'); };
    const nome = d => DG[d][0];
    const zona = z => { const m = /^([a-z]+)@(\d+)$/.exec(z || ''); return m && DG[m[1]] ? { d: m[1], f: +m[2] } : null; };
    const ciclo = (room, d) => ((api.server.runs(room) || {})[d] || 0) + 1;

    // ---------- indirizzo completo per i link in chat (dalla 7.11.1 i link in chat si cliccano) ----------
    // "indirizzo" nel config vince; se è vuoto si usa l'indirizzo da cui ogni eroe ha aperto il gioco
    const origini = new Map();   // id della connessione → es. https://voxelia.example.it
    api.client('(function(){const ID=' + JSON.stringify(api.id) + ';let u=0;const di=()=>VXP.send(ID,"origine",{o:location.origin});' +
      'VXP.on(ID,"origine?",di);setInterval(()=>{try{if(NET.ok&&NET.id&&NET.id!==u){u=NET.id;di()}}catch(e){}},1000)})();');
    api.onClient('origine', (p, d) => { const o = String(d && d.o || ''); if (/^https?:\/\/[A-Za-z0-9.:\[\]-]{1,200}$/.test(o)) origini.set(p.id, o); });
    api.after(500, () => { for (const p of api.players()) p.send('origine?', {}); });   // dopo una Ricarica del plugin
    const linkPagina = (p, resto) => (String(C.indirizzo || '').trim().replace(/\/+$/, '') || origini.get(p.id) || '') + '/plugins/' + api.id + '/' + (resto || '');

    // ---------- cronometro ----------
    const T = new Map();   // id della connessione → { d, room, c, t0, f, sp, salto }
    api.on('zone', (p, nz, oz) => {
      const z = zona(nz), t = T.get(p.id);
      if (!z) { if (t) { T.delete(p.id); p.tell('⏱ Sei uscito da ' + nome(t.d) + ': cronometro fermato, il tempo non vale.'); } return; }
      if (!valido(p)) return;
      const da = zona(oz);
      if (z.f === 1 && !(da && da.d === z.d)) {   // ingresso dal mondo: si parte (anche se c'era un cronometro di un altro dungeon)
        T.set(p.id, { d: z.d, room: p.room, c: ciclo(p.room, z.d), t0: Date.now(), f: 1, sp: [], salto: false });
        p.tell('⏱ Cronometro partito: ' + nome(z.d) + ' (ciclo ' + ciclo(p.room, z.d) + '). Ferma il tempo sconfiggendo il boss. /speedrun per i record.');
        return;
      }
      if (!t || t.d !== z.d) return;
      if (z.f > t.f + 1) t.salto = true;
      if (z.f > t.f) {
        t.f = z.f; t.sp.push(Date.now() - t.t0);
        if (C.tempiParziali && !t.salto) p.tell('⏱ Piano ' + z.f + ' di ' + DG[z.d][1] + ': ' + tempo(Date.now() - t.t0));
      }
    });
    api.on('leave', p => { T.delete(p.id); origini.delete(p.id); });

    api.on('dungeon', (p, d, nuovo) => {
      const ora = Date.now(), fatto = nuovo - 1, chi = [];
      for (const o of api.players(p.room)) {
        const t = T.get(o.id), z = zona(o.zone);
        if (t && t.d === d && t.room === p.room && t.c === fatto && (o.id === p.id || (z && z.d === d))) chi.push([o, t]);
      }
      const buoni = [];
      for (const [o, t] of chi) {
        T.delete(o.id);
        const ms = ora - t.t0;
        if (t.salto || t.f < DG[d][1]) o.tell('⏱ ' + tempo(ms) + ', ma non vale: hai saltato un piano.');
        else if (ms < C.tempoMinimoSec * 1000) o.tell('⏱ ' + tempo(ms) + ': troppo veloce per essere vero, il tempo non vale.');
        else buoni.push({ o, ms, t });
      }
      if (!buoni.length) return;
      // i record si confrontano con i tempi di prima: un gruppo fa un annuncio solo, a nome del più veloce
      const nomi = buoni.map(b => b.o.name), sv = recordServer(d)[0], st = ordina((S.r[p.room] || {})[d])[0];
      for (const b of buoni) registra(b.o, d, { n: b.o.name, ms: b.ms, c: fatto, df: b.o.difficulty, lv: b.o.lv, t: ora, sp: b.t.sp, con: nomi.filter(n => n !== b.o.name) });
      const m = buoni.reduce((a, b) => b.ms < a.ms ? b : a), chi2 = m.o.name + (nomi.length > 1 ? ' (con ' + nomi.filter(n => n !== m.o.name).join(', ') + ')' : '');
      if (C.annunciaRecord) {
        if (!sv || m.ms < sv.ms) api.announce('🏆 Record del server! ' + chi2 + ' finisce ' + nome(d) + ' in ' + tempo(m.ms) + (sv ? ' (prima: ' + sv.n + ', ' + tempo(sv.ms) + ')' : ''));
        else if (!st || m.ms < st.ms) api.announce('🏁 Record della stanza! ' + chi2 + ' finisce ' + nome(d) + ' in ' + tempo(m.ms), p.room);
      }
      api.save();
    });

    // migliore tempo di ogni eroe in una lista {chiave: tempo}, ordinati
    const ordina = L => Object.values(L || {}).sort((a, b) => a.ms - b.ms || a.t - b.t);
    function recordServer(d) {   // il migliore di ogni eroe fra tutte le stanze
      const M = {};
      for (const R of Object.values(S.r)) for (const [k, e] of Object.entries(R[d] || {})) if (!M[k] || e.ms < M[k].ms) M[k] = e;
      return ordina(M);
    }
    function registra(p, d, e) {
      const k = K(p.name), R = S.r[p.room] || (S.r[p.room] = {}), L = R[d] || (R[d] = {});
      const prima = L[k];
      if (!prima || e.ms < prima.ms) L[k] = e;
      const pos = ordina(L).findIndex(x => K(x.n) === k) + 1;
      p.tell('🏁 ' + nome(d) + ' in ' + tempo(e.ms) + ' (ciclo ' + e.c + ', ' + (DIFF[e.df] || '?') + ')' +
        (!prima ? '. Primo tempo: sei ' + pos + '° nella stanza.' : e.ms < prima.ms ? '. Record personale! Ora sei ' + pos + '° nella stanza.' : '. Il tuo record resta ' + tempo(prima.ms) + '.'));
      // al massimo 100 tempi per dungeon e stanza
      const tutti = ordina(L); if (tutti.length > 100) for (const x of tutti.slice(100)) delete L[K(x.n)];
      // sfida della settimana
      const W = S.sfida;
      if (W && W.d === d) {
        const L2 = W.tempi[p.room] || (W.tempi[p.room] = {}), p2 = L2[k];
        if (!p2 || e.ms < p2.ms) L2[k] = e;
        const i = ordina(L2).findIndex(x => K(x.n) === k) + 1;
        p.tell('📅 Sfida della settimana: sei ' + i + '° nella stanza con ' + tempo(L2[k].ms) + '.');
      }
    }

    // ---------- sfida della settimana ----------
    function settimana(t) {   // numero della settimana, da lunedì a lunedì (ora del server)
      const d = new Date(t || Date.now()), m = new Date(d.getFullYear(), d.getMonth(), d.getDate() - (d.getDay() + 6) % 7);
      return Math.round((m - new Date(1970, 0, 5)) / 864e5 / 7);
    }
    const fineSett = s => new Date(1970, 0, 5 + (s + 1) * 7).getTime();
    function scegli(s, prima) {
      const L = (Array.isArray(C.sfidaDungeon) ? C.sfidaDungeon : []).filter(d => DG[d]);
      if (!L.length) return null;
      const altri = L.length > 1 ? L.filter(d => d !== prima) : L;
      return altri[Math.abs(Math.imul(s + 7, 2654435761) >> 7) % altri.length];
    }
    function premio(nomeEroe, motivo) {
      const k = K(nomeEroe); (S.premi[k] || (S.premi[k] = [])).push({ oro: Math.max(0, C.sfidaPremioOro | 0), ogg: C.sfidaPremioOggetto | 0, motivo });
      const p = api.players().find(o => K(o.name) === k); if (p) consegna(p);
    }
    function consegna(p) {
      const k = K(p.name), L = S.premi[k]; if (!L || !L.length || !valido(p)) return;
      delete S.premi[k]; api.save();
      for (const x of L) {
        try { if (x.oro > 0) p.give('gold', x.oro); if (x.ogg >= 0 && x.ogg <= 3) p.give('item', 1, x.ogg); } catch (e) { api.log('premio non consegnato a ' + p.name + ': ' + e.message); }
        p.tell('🎁 ' + x.motivo + ': ' + [x.oro > 0 && x.oro + ' oro', x.ogg >= 0 && x.ogg <= 3 && 'un oggetto ' + RAR[x.ogg]].filter(Boolean).join(' e ') + '.');
      }
    }
    function controllaSfida() {
      const s = settimana(); if (S.sfida && S.sfida.s === s) return;
      const W = S.sfida;
      if (W && DG[W.d]) for (const [room, L] of Object.entries(W.tempi)) {
        const o = ordina(L); if (!o.length || o.length < Math.max(1, C.sfidaMinimoEroi | 0)) continue;
        S.vinte.unshift({ s: W.s, d: W.d, n: o[0].n, ms: o[0].ms, eroi: o.length }); S.vinte.length = Math.min(S.vinte.length, 30);
        premio(o[0].n, 'Premio della sfida della settimana (' + nome(W.d) + ', ' + tempo(o[0].ms) + ')');
        api.announce('📅 Sfida della settimana chiusa: ' + o[0].n + ' è il più veloce della stanza in ' + nome(W.d) + ' con ' + tempo(o[0].ms) + '!', room);
      }
      const d = scegli(s, W && W.d);
      S.sfida = d ? { s, d, tempi: {} } : null; api.save();
      if (d) { api.log('sfida della settimana: ' + d); if (W) api.announce('📅 Nuova sfida della settimana: ' + nome(d) + '! Il più veloce della stanza vince un premio. /speedrun sfida'); }
    }
    api.on('start', controllaSfida); api.every(60000, controllaSfida); controllaSfida();
    api.on('join', p => api.after(3000, () => { const o = api.player(p.id); if (o) consegna(o); }));
    const resta = () => { const h = Math.max(0, Math.floor((fineSett(S.sfida.s) - Date.now()) / 36e5)); return h >= 48 ? Math.floor(h / 24) + ' giorni' : h + ' ore'; };

    // ---------- /speedrun ----------
    function trova(a) {
      a = K(a); if (!a) return null;
      return Object.keys(DG).find(d => d === a) || Object.keys(DG).find(d => d.startsWith(a)) || Object.keys(DG).find(d => K(nome(d)).includes(a));
    }
    const riga = (e, i) => (i + 1) + '. ' + e.n + ' ' + tempo(e.ms) + ' · ciclo ' + e.c + ' · ' + (DIFF[e.df] || '?') + (e.con && e.con.length ? ' · con ' + e.con.join(', ') : '');
    api.command('speedrun', 'record dei dungeon: /speedrun [dungeon | sfida | server | annulla]', (p, args) => {
      const a = K(args[0]), N = Math.max(3, C.righeClassifica | 0);
      if (a === 'annulla') return T.delete(p.id) ? 'Cronometro fermato.' : 'Nessun cronometro acceso.';
      if (a === 'sfida') {
        if (!S.sfida) return 'Questa settimana non c\'è nessuna sfida.';
        const o = ordina(S.sfida.tempi[p.room]);
        return '📅 Sfida della settimana: ' + nome(S.sfida.d) + ', finisce tra ' + resta() + '. Premio al più veloce della stanza: ' +
          [C.sfidaPremioOro > 0 && C.sfidaPremioOro + ' oro', C.sfidaPremioOggetto >= 0 && 'un oggetto ' + RAR[C.sfidaPremioOggetto]].filter(Boolean).join(' e ') +
          (C.sfidaMinimoEroi > 1 ? ' (se la finiscono almeno ' + C.sfidaMinimoEroi + ' eroi)' : '') + '.\n' + (o.length ? o.slice(0, N).map(riga).join('\n') : 'Nessun tempo nella tua stanza, per ora.');
      }
      if (a === 'server') return '🏆 Record del server:\n' + Object.keys(DG).map(d => { const e = recordServer(d)[0]; return nome(d) + ': ' + (e ? e.n + ' ' + tempo(e.ms) + ' (' + (DIFF[e.df] || '?') + ')' : '—'); }).join('\n');
      if (a) {
        const d = trova(args.join(' ')); if (!d) return 'Dungeon sconosciuto. Prova: ' + Object.keys(DG).join(', ') + '.';
        const o = ordina((S.r[p.room] || {})[d]);
        return '🏁 ' + nome(d) + ' nella tua stanza:\n' + (o.length ? o.slice(0, N).map(riga).join('\n') : 'Nessun tempo, per ora.');
      }
      const r = [], t = T.get(p.id);
      if (t) r.push('⏱ ' + nome(t.d) + ', piano ' + t.f + ' di ' + DG[t.d][1] + ': ' + tempo(Date.now() - t.t0) + (t.salto ? ' (non vale: piano saltato)' : ''));
      if (S.sfida) r.push('📅 Sfida della settimana: ' + nome(S.sfida.d) + ', finisce tra ' + resta() + ' (/speedrun sfida)');
      const miei = Object.keys(DG).map(d => { const e = ((S.r[p.room] || {})[d] || {})[K(p.name)]; return e && nome(d) + ' ' + tempo(e.ms); }).filter(Boolean);
      r.push(miei.length ? 'I tuoi record in questa stanza: ' + miei.join(' · ') : 'Nessun tempo in questa stanza: entra in un dungeon e il cronometro parte da solo.');
      r.push('/speedrun tana per una classifica, /speedrun server per i record di tutte le stanze. Pagina web: ' + linkPagina(p, '?stanza=' + encodeURIComponent(p.room || '')));
      return r.join('\n');
    });

    // ---------- pagina web ----------
    // senza ?stanza= mostra solo i record di tutte le stanze, senza i codici delle stanze
    api.route('GET', 'dati', (req, res, x) => {
      const room = String(x.query.stanza || '').slice(0, 16), R = room && S.r[room], pub = e => ({ n: e.n, ms: e.ms, c: e.c, df: e.df, lv: e.lv, t: e.t, con: e.con || [] });
      const o = { dungeon: Object.keys(DG).map(d => ({ id: d, n: nome(d), piani: DG[d][1], server: recordServer(d).slice(0, 20).map(pub), stanza: R ? ordina(R[d]).slice(0, 50).map(pub) : null })) };
      if (S.sfida) o.sfida = { d: S.sfida.d, n: nome(S.sfida.d), fine: fineSett(S.sfida.s), tempi: R ? ordina(S.sfida.tempi[room]).slice(0, 20).map(pub) : null };
      o.vinte = S.vinte.slice(0, 10).map(v => ({ n: v.n, d: nome(v.d), ms: v.ms, fine: fineSett(v.s) }));
      o.stanza = !!R; x.json(o);
    });
    api.route('GET', '/', (req, res, x) => x.send(PAGINA));
  }
};
