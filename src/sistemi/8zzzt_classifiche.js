/* ================= 7.48: le classifiche della settimana =================
   Quattro gare che ripartono ogni lunedì: 🎣 Pesca (i chili pescati), ⚔ Colosseo (le vittorie nell'arena), 🗝 Dungeon (i dungeon
   completati) e 🏰 Città (il valore delle tue città di Tomorrow). Si guardano dall'Albo dei campioni davanti al Colosseo e
   dal Diario (K). A settimana finita i primi tre di ogni gara vincono un titolo da mostrare sopra l'eroe, e il primo anche
   un mantello che non si trova da nessun'altra parte (del mare, di fiamma, stellato, d'avorio).
   Serve il server con il plugin «classifiche». */
XSV.add('unl48');
const CLS={tab:'pesca',d:null};
const CLSN={pesca:{i:'🎣',n:'Pesca',u:'kg'},colosseo:{i:'⚔',n:'Colosseo',u:'vittorie'},dungeon:{i:'🗝',n:'Dungeon',u:'dungeon'},citta:{i:'🏰',n:'Città',u:'punti'}};
const CLST={pesca:['Re della pesca','Pescatore d\'argento','Pescatore di bronzo'],colosseo:['Campione del Colosseo','Gladiatore d\'argento','Gladiatore di bronzo'],
  dungeon:['Signore dei dungeon','Esploratore d\'argento','Esploratore di bronzo'],citta:['Grande costruttore','Costruttore d\'argento','Costruttore di bronzo']};
// i mantelli dei campioni: in fondo alla lista dei mantelli, uguali per tutti (così gli altri giocatori li vedono), ma si indossano solo vinti
const CLSM={pesca:['Mantello del mare','#3ae8e8'],colosseo:['Mantello di fiamma','#ff8a1a'],dungeon:['Mantello stellato','#7a4aff'],citta:['Mantello d\'avorio','#f4f0ff']};
const CLSM0=APO.ca.c.length;Object.keys(CLSM).forEach(k=>APO.ca.c.push(CLSM[k][1]));
const clsMi=k=>CLSM0+Object.keys(CLSM).indexOf(k);
const clsHas=i=>i<CLSM0||!!(P&&P.unl48&&P.unl48['m'+i]);
{const lh0=lookHTML;lookHTML=function(){lh0.apply(this,arguments);const el=$('look');if(!el)return;for(const b of el.querySelectorAll('button.sw')){const m=/LKA\.ca=(\d+);/.exec(b.getAttribute('onclick')||'');if(!m)continue;const i=+m[1];if(i<CLSM0)continue;
  const k=Object.keys(CLSM)[i-CLSM0];if(!clsHas(i)){b.disabled=true;b.style.opacity='.35';b.title=CLSM[k][0]+': il premio del primo nella classifica settimanale ('+CLSN[k].n+')'}else b.title=CLSM[k][0]}}}
{const lr0=lookRandom;lookRandom=function(){lr0.apply(this,arguments);if(!clsHas(LKA.ca)){LKA.ca=0;lookHTML()}}}
const clsNet=()=>typeof NET!=='undefined'&&NET.ok&&typeof VXP!=='undefined';
if(typeof VXP!=='undefined'){VXP.on('classifiche','top',d=>{CLS.d=d||null;if(PM==='cls48')pn('cls48')});
  VXP.on('classifiche','premi',d=>{if(!d||!Array.isArray(d.L)||!P)return;const got=[];P.unl48=P.unl48||{};
    for(const q of d.L){if(!q||!CLST[q.cat]||!(q.pos>=1&&q.pos<=3))continue;got.push({wk:q.wk,cat:q.cat});const tn=CLST[q.cat][q.pos-1];if(typeof titAdd==='function')titAdd('cls_'+q.cat+'_'+q.pos,tn);
      if(q.pos===1){const i=clsMi(q.cat);if(!P.unl48['m'+i]){P.unl48['m'+i]=1;setTimeout(()=>banner('Nuovo mantello: '+CLSM[q.cat][0],'Lo indossi dall\'aspetto (C)','corona'),2200)}}
      clog('','🏅 Classifica della settimana '+String(q.wk).slice(6)+', '+CLSN[q.cat].n+': '+q.pos+'° posto!',{sys:1})}
    if(got.length){save();VXP.send('classifiche','presi',{L:got})}})}
// la pesca: i chili di ogni pesce tirato su
{const fl0=fishLand;fishLand=function(F){fl0(F);try{const r=F&&F.res;if(r&&r.f&&r.f.id!=='stivale'&&clsNet()&&+r.kg>0)VXP.send('classifiche','pesca',{kg:Math.round(+r.kg*10)/10})}catch(_){}}}
// le città di Tomorrow: la somma dei livelli degli edifici
function clsCity(){if(!(typeof twOn==='function'&&twOn())||typeof csSets!=='function')return 0;let v=0;for(const S of csSets()){if(!S||!S.b)continue;for(const k in S.b){const n=+S.b[k];if(n>0)v+=n}}return v}
setInterval(()=>{try{if(!started||!P||!clsNet())return;const v=clsCity();if(v>0&&v!==CLS.lc){CLS.lc=v;VXP.send('classifiche','citta',{v})}}catch(_){}},60000);
X43P.cls48=()=>{let h=`<h3>🏅 Classifiche della settimana</h3>`;if(!clsNet())return h+`<p class="mu">Le classifiche sono di tutti i giocatori del server: serve la partita in rete, con il plugin «classifiche».</p><button onclick="cl()">Chiudi</button>`;
  if(!CLS.d){VXP.send('classifiche','top',{});setTimeout(()=>{if(PM==='cls48'&&!CLS.d){CLS.d={none:1};pn('cls48')}},3000);return h+`<p class="mu">Apro l'albo…</p><button onclick="cl()">Chiudi</button>`}
  if(CLS.d.none)return h+`<p class="mu">Il server non ha il plugin «classifiche».</p><button onclick="cl()">Chiudi</button>`;
  const d=CLS.d,c=CLS.tab,N=CLSN[c],L=(d.L&&d.L[c])||[],me=String(NET.name||'').toLowerCase(),mi=d.me&&d.me[c];
  h+=`<p class="x43t">Settimana ${esc(String(d.wk||'').slice(6))} · si chiude domenica a mezzanotte (UTC). I primi tre vincono un titolo, il primo anche il ${CLSM[c][0]}.</p>`;
  h+=`<div class="srow">${Object.keys(CLSN).map(k=>`<button class="${k===c?'on':''}" onclick="CLS.tab='${k}';pn('cls48')">${CLSN[k].i} ${CLSN[k].n}</button>`).join('')}</div>`;
  h+=L.length?L.map((q,i)=>`<div class="x43r${String(q.n).toLowerCase()===me?' cls48me':''}"><span>${['🥇','🥈','🥉'][i]||(i+1)+'.'} <b>${esc(q.n)}</b></span><span>${q.v} ${N.u}</span></div>`).join(''):'<p class="mu">Nessuno in classifica, per ora: tocca a te!</p>';
  h+=`<p class="x43t">${mi?'Tu sei '+mi[0]+'° con '+mi[1]+' '+N.u+'.':'Non sei ancora in classifica.'} ${c==='pesca'?'Conta ogni pesce che tiri su.':c==='colosseo'?'Contano le vittorie nell\'arena del Colosseo.':c==='dungeon'?'Conta ogni dungeon completato.':'Conta la somma dei livelli degli edifici delle tue città di Tomorrow.'}</p>`;
  const pv=d.prev&&d.prev[c];if(pv&&pv.length)h+=`<h4>I campioni della settimana scorsa</h4><p class="x43t">${pv.map((q,i)=>['🥇','🥈','🥉'][i]+' '+esc(q.n)+' ('+q.v+')').join(' · ')}</p>`;
  return h+`<button onclick="CLS.d=null;pn('cls48')">↻ Aggiorna</button><button onclick="cl()">Chiudi</button>`};
function clsPlace(){if(!ZZ||!started||Zk!=='town'||(typeof OW!=='undefined'&&OW.on)||ents.some(e=>e.k==='cls48b'))return;const q=spot47([44,12],2);if(q)ents.push({k:'cls48b',px:q[0]+.5,py:q[1]+.5,n:'Albo dei campioni della settimana'})}
const _loadPost748t=loadPost;loadPost=function(k){_loadPost748t(k);try{clsPlace()}catch(e){console.warn('classifiche',e)}};
ITK.add('cls48b');
const _act748t=act;act=function(e){if(e&&e.k==='cls48b'){CLS.d=null;pn('cls48');return}_act748t(e)};
const _ent748t=ent;ent=function(e){if(e.k==='cls48b'){drawL([[-.4,-.1,0,.8,.2,6,'#8a8a94'],[-.34,-.08,6,.68,.16,26,'#e8e0c8'],[-.38,-.1,32,.76,.2,3,'#d4af37']],e.px,e.py,0);
  [['#ffd84a',20],['#d8d8e8',14],['#d08a4a',8]].forEach(([c,z],i)=>box(e.px-.25+i*.18,e.py-.12,z+6,.12,.02,3,c,1.2));return}_ent748t(e)};
{const p0=pn;pn=function(m,arg){p0(m,arg);if(m==='dia'&&PM==='dia'){const pe=$('pn');if(pe&&!pe.querySelector('.cls48b'))pe.insertAdjacentHTML('afterbegin',`<button class="cls48b" onclick="CLS.d=null;pn('cls48')">🏅 Classifiche della settimana</button>`)}}}
(function(){const st=document.createElement('style');st.textContent=`button.cls48b{width:100%;margin-bottom:6px}.cls48me{background:#ffd27a22;border-radius:4px}`;document.head.appendChild(st)})();
