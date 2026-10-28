/* ================= 7.45: il meteo e le stagioni di Tomorrow =================
   Le stagioni cambiano ogni settimana (vera), uguali per tutti: primavera, estate, autunno, inverno. Ognuna ha i suoi
   colori, il suo tempo più frequente e i suoi effetti sui borghi (in autunno si raccoglie di più, d'inverno di meno).
   Il tempo cambia ogni giorno del gioco ed è lo stesso in tutto il mondo (adattato al bioma: nel deserto non nevica):
   sereno, pioggia, temporale, neve, nebbia, siccità, tempesta di sabbia. Conta davvero:
   - pioggia: i campi rendono il 20% in più e le cisterne si riempiono;
   - temporale: lampi e tuoni, metà del raccolto va perso;
   - siccità: il cibo cala del 30% e l'acqua del 40%;
   - neve: i campi rendono meno e le carovane vanno più piano.
   Si vede nell'orologio (in alto a destra) e nel registro del borgo. */
const MET={k:'',fl:0,nt:0};
const SSN=[{k:'primavera',n:'Primavera',ic:'🌱',fp:1.1,f:3,fx:''},{k:'estate',n:'Estate',ic:'☀',fp:1.2,f:5,fx:'saturate(1.12)'},
  {k:'autunno',n:'Autunno',ic:'🍂',fp:1.25,f:0,fx:'sepia(.16) saturate(1.15) hue-rotate(-8deg)'},{k:'inverno',n:'Inverno',ic:'❄',fp:.7,f:-5,fx:'saturate(.72) brightness(1.06)'}];
const WXT={sereno:{n:'Sereno',ic:'☀'},pioggia:{n:'Pioggia',ic:'🌧',fp:1.2,wp:1.3},temporale:{n:'Temporale',ic:'⛈',fp:.5,f:-5},neve:{n:'Neve',ic:'🌨',fp:.8,wp:1.1,car:1.5},
  nebbia:{n:'Nebbia',ic:'🌫'},siccita:{n:'Siccità',ic:'🔥',fp:.7,wp:.6,f:-3},sabbia:{n:'Tempesta di sabbia',ic:'🌪',fp:.85,car:1.25}};
const WXTAB={primavera:[['sereno',.45],['pioggia',.35],['temporale',.1],['nebbia',.1]],estate:[['sereno',.55],['siccita',.2],['temporale',.15],['pioggia',.1]],
  autunno:[['sereno',.35],['pioggia',.3],['nebbia',.25],['temporale',.1]],inverno:[['sereno',.35],['neve',.4],['nebbia',.15],['pioggia',.1]]};
// la stagione: una settimana ciascuna, dal lunedì (UTC), uguale per tutti
function ssnNow(){const w=Math.floor((Date.now()/86400000+3)/7);return SSN[((w%4)+4)%4]}
// il tempo di oggi nel mondo, e com'è nel bioma di una regione
function wxWorld(){const s=ssnNow(),r=sd(hs('meteo|'+(typeof twWorld==='function'?twWorld():'')+'|'+gDay()+'|'+s.k))();let a=0;for(const[k,p]of WXTAB[s.k]){a+=p;if(r<a)return k}return'sereno'}
function wxAt(k){const w=wxWorld(),p=twP(k);if(!p)return w;const b=twBio(p[0],p[1]);
  if(b==='deserto'||b==='cenere')return w==='neve'||w==='pioggia'?(b==='deserto'?'sabbia':'sereno'):w==='nebbia'?'sereno':w;
  if(b==='neve')return w==='pioggia'?'neve':w==='siccita'?'sereno':w;return w}
const wxHere=()=>typeof twOn==='function'&&twOn()&&String(Zk).startsWith('tw:')&&!!SKY[Zk]&&!(ZZ&&(ZZ.int||ZZ.dg));
// gli effetti sui borghi: raccolto, acqua, umore
{const x0=typeof setStatsX==='function'?setStatsX:null;setStatsX=function(S,st){if(x0)x0(S,st);if(!S||!S.k)return;const s=ssnNow(),W=WXT[wxAt(S.k)]||{};
  st.fp=Math.max(0,Math.round(st.fp*(s.fp||1)*(W.fp||1)));st.wp=Math.max(0,Math.round(st.wp*(W.wp||1)));st.wx=wxAt(S.k);st.ssn=s.k}}
CITMOD.push(S=>{const s=ssnNow(),W=WXT[wxAt(S.k)]||{},v=(s.f||0)+(W.f||0)+(wxAt(S.k)==='sereno'?3:0);return v<0?{v,s:s.k==='inverno'?'fa freddo e le giornate sono corte':'il tempo è brutto'}:v});
// in autunno, la domenica è festa del raccolto: più felicità
CITMOD.push(()=>ssnNow().k==='autunno'&&new Date().getUTCDay()===0?10:0);
// la pioggia, la neve, la sabbia, la nebbia e la siccità sullo schermo (in 2D e in 3D)
const _partUpd744=partUpd;partUpd=function(dt){if(!wxHere()){_partUpd744(dt);return}const w=wxAt(Zk),pt=w==='pioggia'||w==='temporale'?'rain':w==='neve'?'snow':w==='sabbia'?'dust':null;
  if(!pt){_partUpd744(dt);return}const z=ZZ,o=z.pt;z.pt=pt;try{_partUpd744(dt)}finally{z.pt=o}};
const _partDraw744=partDraw;partDraw=function(){if(!wxHere()){_partDraw744();return}const w=wxAt(Zk),pt=w==='pioggia'||w==='temporale'?'rain':w==='neve'?'snow':w==='sabbia'?'dust':null,z=ZZ,o=z.pt;
  if(pt)z.pt=pt;try{_partDraw744()}finally{z.pt=o}g.setTransform(DPR,0,0,DPR,0,0);
  if(w==='nebbia'&&typeof fogDraw==='function')fogDraw();else if(w==='siccita'){g.fillStyle='rgba(255,170,60,.08)';g.fillRect(0,0,W,H)}else if(w==='sabbia'){g.fillStyle='rgba(210,170,100,.14)';g.fillRect(0,0,W,H)}else if(w==='temporale'){g.fillStyle='rgba(20,24,40,.12)';g.fillRect(0,0,W,H)}
  if(MET.fl>0){g.fillStyle=`rgba(240,245,255,${Math.min(.75,MET.fl)})`;g.fillRect(0,0,W,H)}};
// i lampi e i tuoni del temporale
const _upd744m=upd;upd=function(dt){_upd744m(dt);MET.fl=Math.max(0,MET.fl-dt*2.6);if(!wxHere()||wxAt(Zk)!=='temporale')return;if((MET.nt-=dt)>0)return;MET.nt=6+Math.random()*9;MET.fl=.55;
  setTimeout(()=>{try{tone(48,.9,'sawtooth',.06);tone(70,.6,'square',.03)}catch(_){}},400+Math.random()*900);if(typeof shake==='function')shake(.3)};
// i colori della stagione, sopra quelli scelti nelle impostazioni
{const u0=uFx;uFx=function(){u0();if(!wxHere())return;const s=ssnNow();if(!s.fx)return;const add=f=>(f?f+' ':'')+s.fx;cv.style.filter=add(cv.style.filter);if(typeof D3!=='undefined'&&D3.cv)D3.cv.style.filter=add(D3.cv.style.filter)}}
// nell'orologio: il tempo e la stagione; quando cambia la stagione, un cartello
function wxHud(){const c=$('clk');if(!c)return;let el=$('wx44');if(!el){el=document.createElement('div');el.id='wx44';c.appendChild(el)}const on=typeof twOn==='function'&&twOn()&&String(Zk).startsWith('tw:');el.hidden=!on;document.body.classList.toggle('wx44',on);if(!on)return;
  const s=ssnNow(),w=WXT[wxAt(Zk)]||WXT.sereno,k=s.k+'|'+wxAt(Zk)+'|'+gDay();if(el.dataset.k===k)return;el.dataset.k=k;el.textContent=w.ic+' '+w.n+' · '+s.ic+' '+s.n;el.title='Il tempo di oggi e la stagione (cambia ogni settimana)'}
const _loadPost744m=loadPost;loadPost=function(k){_loadPost744m(k);try{uFx();wxHud();if(typeof twOn==='function'&&twOn()&&P.tw){const s=ssnNow();if(P.tw.ssn!==s.k){const first=!P.tw.ssn;P.tw.ssn=s.k;if(!first)setTimeout(()=>banner(s.ic+' '+{primavera:'È arrivata la primavera',estate:'È arrivata l\'estate',autunno:'È arrivato l\'autunno',inverno:'È arrivato l\'inverno'}[s.k],{primavera:'I campi rendono un po\' di più',estate:'Raccolti ricchi, ma attenti alla siccità',autunno:'È il tempo del raccolto: la domenica si fa festa',inverno:'Neve e freddo: i campi rendono meno'}[s.k],'sole'),1800)}}}catch(e){console.warn('meteo',e)}};
setInterval(()=>{try{if(started)wxHud()}catch(_){}},3000);
// nel registro del borgo: il tempo e la stagione, e che effetto fanno
{const h0=setHTML2;setHTML2=function(){let h=h0();const S=P.tw.set;if(!S)return h;const s=ssnNow(),wk=wxAt(S.k),w=WXT[wk]||WXT.sereno,eff=[];
  if(s.fp!==1)eff.push('raccolto '+(s.fp>1?'+':'')+Math.round((s.fp-1)*100)+'% ('+s.n.toLowerCase()+')');if(w.fp&&w.fp!==1)eff.push('raccolto '+(w.fp>1?'+':'')+Math.round((w.fp-1)*100)+'% ('+w.n.toLowerCase()+')');if(w.wp&&w.wp!==1)eff.push('acqua '+(w.wp>1?'+':'')+Math.round((w.wp-1)*100)+'%');if(w.car)eff.push('carovane più lente');
  const card=`<div class="rgcard wxc"><div><b>${w.ic} ${w.n} · ${s.ic} ${s.n}</b><p class="mu">${eff.length?eff.join(' · '):'Nessun effetto sul borgo oggi.'} La stagione cambia ogni lunedì, il tempo ogni giorno.</p></div></div>`;
  const i=h.indexOf('<div class="srow">');return i<0?h+card:h.slice(0,i)+card+h.slice(i)}}
(function(){const st=document.createElement('style');st.textContent=`body.wx44 #qt{margin-top:17px}#wx44{font:12px Georgia,serif;color:#f4ecd8;text-shadow:0 1px 2px #000;text-align:center;margin-top:2px;pointer-events:auto}`;document.head.appendChild(st)})();
