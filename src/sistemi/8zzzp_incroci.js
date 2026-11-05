/* ================= 7.47: gli incroci dei compagni =================
   Nel pannello dei compagni (tasto N) c'è «🥚 Incroci»: si scelgono due compagni domati (dal livello 5 in su) e, pagando,
   nasce un uovo che si schiude in tre minuti. Il piccolo è una specie nuova, solo tua: prende la forma e la mossa del
   primo genitore, metà della forza di ciascuno (con un po' di più), il nome mescolato dei due e un colore nuovo. A volte
   c'è una mutazione: colori strani e statistiche più alte (✦). Si possono incrociare anche gli incroci. */
XSV.add('x47');XSV.add('egg47');
const INC={a:null,b:null};
const EGGT=180000;
// le specie nate dagli incroci diventano tipi veri (prima che i compagni vengano controllati)
function x47Reg(){if(!P||!P.x47)return;for(const id in P.x47){const d=P.x47[id],k='x47.'+id;if(E[k])continue;for(const q of[d.a,d.b])if(!E[q]&&String(q).startsWith('tw.')&&typeof twType==='function')twType(q);
  const A=E[d.a],B=E[d.b];if(!A||!B)continue;const m=d.mu?1.15:1.05,av=f=>(+(A[f]||0)+ +(B[f]||0))/2;
  const o=Object.assign({},A,{n:d.n,hp:Math.max(8,Math.round(av('hp')*m)),at:+(av('at')*m).toFixed(2),sp:+(av('sp')||A.sp||2).toFixed(2),cd:+(av('cd')||A.cd||1.2).toFixed(2),xp:Math.round(av('xp')||A.xp||5),x47:1,boss:0,
    m:typeof twModel==='function'?twModel(A.m,d.dh,d.mu?1.35:1,d.mu?1.12:1,d.sc||1):A.m});if(d.rg&&B.rng){o.rng=B.rng;o.r=B.r;o.cd=Math.max(o.cd,B.cd||1.5)}E[k]=o}}
{const df0=domFix;domFix=function(){try{x47Reg()}catch(e){console.warn('incroci',e)}return df0()}}
const incName=(a,b)=>{const x=String(a).split(/\s+/)[0],y=String(b).split(/\s+/).pop(),h=s=>s.slice(0,Math.max(2,Math.ceil(s.length/2)));return(h(x)+y.slice(Math.floor(y.length/2))).replace(/^./,c=>c.toUpperCase()).slice(0,16)};
const incCost=(p,q)=>Math.round(300+25*((p.lv|0)+(q.lv|0)));
function incStart(){domFix();const p=P.pets[INC.a],q=P.pets[INC.b];if(!p||!q||INC.a===INC.b){msg('Scegli due compagni diversi');return}if(P.egg47){msg('C\'è già un uovo che aspetta di schiudersi');return}
  if(p.lv<5||q.lv<5){msg('I genitori devono essere almeno di livello 5');tone(150,.1);return}const c=incCost(p,q);if(P.g<c){msg('Servono '+c+' monete');tone(150,.1);return}
  P.g-=c;P.egg47={a:p.t,b:q.t,na:p.n,nb:q.n,t:Date.now()+EGGT};INC.a=INC.b=null;banner('Un uovo!','Si schiude fra tre minuti','stella');jingle([64,67,71],.1,'triangle');hud();save();pn('inc47')}
function incHatch(){const g=P.egg47;if(!g||Date.now()<g.t)return;domFix();if(P.pets.length>=domMax()){if(!INC.full){INC.full=1;msg('L\'uovo è pronto, ma la stalla è piena: libera un posto')}return}INC.full=0;
  const id=uid(),mu=Math.random()<.15,dh=mu?120+Math.random()*120:(Math.random()<.5?-1:1)*(40+Math.random()*70),sc=.9+Math.random()*.25,n=incName(g.na,g.nb)+(mu?' ✦':'');P.x47=P.x47||{};P.x47[id]={a:g.a,b:g.b,dh,sc:+sc.toFixed(2),mu:mu?1:0,rg:Math.random()<.5?1:0,n};P.egg47=null;
  x47Reg();const k='x47.'+id;if(!E[k]){msg('L\'uovo non si è schiuso…');save();return}const p={id:uid(),t:k,n,lv:1,xp:0,hp:0,bd:typeof gDay==='function'?gDay():0};p.hp=domStats(p).mx;P.pets.push(p);P.bst[k]=(P.bst[k]|0)+1;
  banner('È nato '+n+'!',(mu?'Una mutazione rara! ':'')+'Lo trovi tra i compagni (N)','corona');jingle([60,64,67,72,76,79,84],.08,'triangle');if(cineOK())sparks(P.px,P.py,30,['#ffe28a','#ffffff','#ff9ad8'],110);save();hud();if(PM==='inc47')pn('inc47')}
setInterval(()=>{try{if(started&&P&&P.egg47)incHatch()}catch(e){}},2000);
X43P.inc47=()=>{domFix();const L=P.pets,g=P.egg47;let h=`<h3>🥚 Incroci dei compagni · 💰${P.g}</h3><p class="x43t">Scegli due compagni dal livello 5 in su: il piccolo prende la forma del primo, la forza di tutti e due e un colore nuovo. A volte c'è una mutazione ✦.</p>`;
  if(g){const s=Math.max(0,Math.ceil((g.t-Date.now())/1000));h+=`<div class="inc47e"><span>🥚</span><b>${esc(g.na)} × ${esc(g.nb)}</b><br>${s>0?'Si schiude fra '+Math.floor(s/60)+':'+String(s%60).padStart(2,'0'):'Sta per schiudersi!'}</div>`;if(s>0)setTimeout(()=>{if(PM==='inc47')pn('inc47')},1000)}
  else if(L.length<2)h+=`<p class="mu">Ti servono almeno due compagni domati.</p>`;
  else{const pk=(w,i)=>`<button class="${INC[w]===i?'on':''}" ${L[i].lv<5?'disabled':''} onclick="INC.${w}=${i};pn('inc47')">${esc(domName(L[i]))} · liv. ${L[i].lv}</button>`;
    h+=`<h4>Primo genitore (la forma)</h4><div class="srow">${L.map((_,i)=>pk('a',i)).join('')}</div><h4>Secondo genitore</h4><div class="srow">${L.map((_,i)=>pk('b',i)).join('')}</div>`;
    const p=L[INC.a],q=L[INC.b];if(p&&q&&INC.a!==INC.b)h+=`<p class="x43t">Nascerà <b>${esc(incName(p.n,q.n))}</b> · costa ${incCost(p,q)} 💰</p><button onclick="incStart()">🥚 Fai nascere l'uovo</button>`}
  const X=P.x47?Object.values(P.x47):[];if(X.length)h+=`<h4>Specie nate da te · ${X.length}</h4><p class="x43t">${X.map(d=>esc(d.n)).join(' · ')}</p>`;
  return h+`<button onclick="pn('pets')">Compagni</button><button onclick="cl()">Chiudi</button>`};
// il pulsante nel pannello dei compagni
{const p0=pn;pn=function(m,arg){p0(m,arg);if(m==='pets'&&PM==='pets'){const pe=$('pn');if(pe&&!pe.querySelector('.inc47b'))pe.insertAdjacentHTML('afterbegin',`<button class="inc47b" onclick="pn('inc47')">🥚 Incroci${P.egg47?' · c\'è un uovo':''}</button>`)}}}
(function(){const st=document.createElement('style');st.textContent=`.inc47b{width:100%;margin-bottom:6px}.inc47e{text-align:center;padding:12px;background:#ffffff10;border-radius:8px;margin:8px 0}.inc47e span{font-size:44px;display:block;animation:inc47 1s ease-in-out infinite alternate}@keyframes inc47{from{transform:rotate(-8deg)}to{transform:rotate(8deg)}}`;document.head.appendChild(st)})();
