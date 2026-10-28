/* ================= 7.43: aiuti comuni per le novità dalla 7.43 in poi =================
   - XSV: i campi dell'eroe da mettere nel salvataggio (storia e Tomorrow), basta aggiungerne il nome;
   - X43P: pannelli nuovi (nome → funzione che dà l'HTML), aperti con pn(nome) come tutti gli altri;
   - dayKey(): il giorno di oggi (UTC), uguale per tutti i giocatori: serve per le sfide del giorno. */
const XSV=new Set();
const _save743=save;save=function(){if(!P||!started||MODE!=='story'){_save743();return}const s0=LS.set;
  LS.set=function(k,v){if(v&&v.p&&(k===SAVEK||(typeof OWK!=='undefined'&&k===OWK)))for(const f of XSV)if(P[f]!==undefined)v.p[f]=P[f];return s0.call(LS,k,v)};try{_save743()}finally{LS.set=s0}};
const X43P={};
const _pn743=pn;pn=function(m,arg){if(X43P[m]&&started){if(arg!==undefined)PA=arg;edPanel(m,X43P[m]());return}_pn743(m,arg)};
const dayKey=()=>new Date().toISOString().slice(0,10);
const dayName=k=>{const[y,m,d]=String(k).split('-').map(Number);return d+' '+['gennaio','febbraio','marzo','aprile','maggio','giugno','luglio','agosto','settembre','ottobre','novembre','dicembre'][(m-1)|0]};
// una casella libera (camminabile, senza arredi, lontana da portali e personaggi) scelta con il generatore r
function freeTile(r,ok,tries){for(let k=0;k<(tries||300);k++){const x=1+Math.floor(r()*(N-2)),y=1+Math.floor(r()*(N-2));if(M[y][x]!==0||DEC[y][x]&&DEC[y][x][0]!=='₪')continue;
    if(ents.some(e=>e.k!=='tc'&&Math.abs(e.px-x-.5)<1.6&&Math.abs(e.py-y-.5)<1.6))continue;if(ok&&!ok(x,y))continue;return[x,y]}return null}
// piccolo stile in comune per i pannelli nuovi
(function(){const st=document.createElement('style');st.textContent=`
.x43c{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px;margin:8px 0}
.x43c button{display:flex;flex-direction:column;align-items:flex-start;text-align:left;gap:3px;padding:10px 12px;margin:0;min-height:86px;white-space:normal}
.x43c button b{font-size:15px}.x43c button small{opacity:.85;line-height:1.35}.x43c button.on{outline:2px solid #ffd27a;background:#3b4770}
.x43c button i{font-style:normal;font-size:22px}.x43t{font-size:13px;opacity:.85;margin:4px 0}
.x43r{display:flex;justify-content:space-between;gap:8px;padding:4px 0;border-bottom:1px solid #ffffff18}.x43r:last-child{border:0}`;document.head.appendChild(st)})();
