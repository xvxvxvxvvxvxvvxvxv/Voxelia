/* ================= 7.43: le maledizioni, a scelta, prima di entrare in un dungeon =================
   Sulla soglia di un dungeon si possono accettare una o più maledizioni: rendono il dungeon più duro ma danno più oro,
   più esperienza e più oggetti. Valgono fino a quando si esce dal dungeon. Si può entrare anche senza, e si può smettere
   di farsi chiedere (la scelta resta nelle Impostazioni → Gioco del pannello). */
const MAL43=[
  {k:'veloci',i:'💨',n:'Nemici veloci',d:'I nemici corrono e colpiscono più in fretta.',b:.2},
  {k:'furia',i:'🔥',n:'Furia',d:'I nemici fanno il 30% di danni in più.',b:.3},
  {k:'orda',i:'👥',n:'Orda',d:'Metà dei nemici in più in ogni piano.',b:.25},
  {k:'secco',i:'🚱',n:'Gola secca',d:'Niente pozioni finché sei nel dungeon.',b:.35},
  {k:'fragile',i:'💔',n:'Fragile',d:'La tua vita massima scende del 30%.',b:.3}];
if(SET.mal43==null)SET.mal43=1;
XSV.add("mal");
const malOn=k=>!!(P&&P.mal&&ZZ&&ZZ.dg&&ZZ.dg===P.mal.dg&&(!k||P.mal.k.includes(k)));
const malB=()=>malOn()?P.mal.k.reduce((a,k)=>a+((MAL43.find(c=>c.k===k)||{}).b||0),0):0;
let MALSEL=[];
X43P.mal43=()=>{const po=PA&&PA.po,id=po?String(po.to).split('@')[0]:'',D=DG[id];const tot=MALSEL.reduce((a,k)=>a+MAL43.find(c=>c.k===k).b,0);
  return`<h3>☠ Maledizioni · ${esc(D?D.n:'Dungeon')}</h3><p class="x43t">Puoi entrare maledetto: il dungeon sarà più duro, ma oro, esperienza e oggetti aumentano. Le maledizioni valgono finché resti nel dungeon.</p>
  <div class="x43c">${MAL43.map(c=>`<button class="${MALSEL.includes(c.k)?'on':''}" onclick="malTog('${c.k}')"><i>${c.i}</i><b>${c.n}</b><small>${c.d}</small><small>Bottino +${Math.round(c.b*100)}%</small></button>`).join('')}</div>
  <p><b>${MALSEL.length?'Bottino +'+Math.round(tot*100)+'%':'Nessuna maledizione'}</b>${tot>=.6?' · il boss lascerà anche un oggetto epico in più':''}</p>
  <div class="row"><label for="s_mal43">Chiedimelo ogni volta che entro in un dungeon</label><input type="checkbox" id="s_mal43" ${SET.mal43?'checked':''} onchange="setv('mal43',this.checked?1:0)"></div>
  <button onclick="malGo(1)">☠ Entra ${MALSEL.length?'maledetto':''}</button><button onclick="malGo(0)">Entra senza maledizioni</button><button onclick="cl()">Resta fuori</button>`};
function malTog(k){const i=MALSEL.indexOf(k);if(i<0)MALSEL.push(k);else MALSEL.splice(i,1);tone(i<0?260:420,.06,'triangle');pn('mal43')}
function malGo(w){const po=PA&&PA.po;if(!po){cl();return}const id=String(po.to).split('@')[0];P.mal=w&&MALSEL.length?{dg:id,k:MALSEL.slice()}:null;cl();
  if(P.mal){msg('Entri con '+P.mal.k.length+(P.mal.k.length===1?' maledizione':' maledizioni')+': bottino +'+Math.round(P.mal.k.reduce((a,k)=>a+MAL43.find(c=>c.k===k).b,0)*100)+'%');tone(80,.5,'sawtooth',.06)}
  po.mal43ok=1;try{act(po)}finally{po.mal43ok=0}}
const _act743c=act;act=function(e){if(e&&e.k==='po'&&!e.mal43ok&&SET.mal43&&typeof e.to==='string'&&/@1$/.test(e.to)&&!(ZZ&&ZZ.dg)&&DG[e.to.split('@')[0]]&&!e.lock){MALSEL=(P.mal&&P.mal.k)||[];pn('mal43',{po:e});tone(200,.12,'triangle');return}
  const g0=P.g,k0=e&&e.k;_act743c(e);if(k0==='ch'&&malOn()&&P.g>g0){const x=Math.round((P.g-g0)*malB());if(x>0){P.g+=x;flt(P,'+'+x+' ☠','#c46bff');hud()}}};
// gli effetti sui nemici, sull'eroe e sul bottino
const _mk743c=mk;mk=function(t2,x,y,id){const e=_mk743c(t2,x,y,id);if(malOn()){if(malOn('veloci')){e.sp*=1.3;e.cd*=.85;e.cdt=e.cd}if(malOn('furia'))e.at*=1.3}return e};
const _zd743c=zd;zd=function(k){const z=_zd743c(k);if(z&&z.dg&&P&&P.mal&&z.dg===P.mal.dg&&P.mal.k.includes('orda')&&!Z[k])return Object.assign({},z,{c:Math.round(z.c*1.5)});return z};
const _pot743c=pot;pot=function(){if(malOn('secco')&&started&&P.pot>0&&P.hp<P.mx){if(!(P.pcm>t)){P.pcm=t+.8;flt(P,'Gola secca: niente pozioni','#c46bff');tone(150,.12)}return}_pot743c()};
const _recalc743c=recalc;recalc=function(){_recalc743c();if(malOn('fragile')&&P){P.mx=Math.max(1,Math.round(P.mx*.7));P.hp=Math.min(P.hp,P.mx)}};
const _gainXP743c=gainXP;gainXP=function(x){_gainXP743c(malOn()?Math.round(x*(1+malB())):x)};
const _kill743c=kill;kill=function(e){const g0=P.g,cu=malOn()&&e&&e.k==='en'&&ents.includes(e);_kill743c(e);if(!cu)return;const b=malB(),x=Math.round((P.g-g0)*b);if(x>0)P.g+=x;
  if(!e.boss&&Math.random()<b*.35)ents.push(dropOk({k:'dr',px:e.px+.4,py:e.py+.2,it:item((ZZ.lv||1)+1,b>=.6?1:0)}))};
const _dgClear743c=dungeonClear;dungeonClear=function(e){_dgClear743c(e);if(!malOn())return;const b=malB();if(b>=.6)ents.push(dropOk({k:'dr',px:e.px-.6,py:e.py+.4,it:item((ZZ.lv||1)+2,2)}));
  setTimeout(()=>banner('Maledizioni vinte',P.mal.k.length+' maledizioni · bottino +'+Math.round(b*100)+'%','teschio'),1400)};
// fuori dal dungeon le maledizioni finiscono
let MALFR=false;
const _loadPost743c=loadPost;loadPost=function(k){_loadPost743c(k);if(P&&P.mal&&!(ZZ&&ZZ.dg&&ZZ.dg===P.mal.dg)){P.mal=null}const fr=malOn('fragile');if(fr!==MALFR){MALFR=fr;recalc()}malHud()};
function malHud(){let el=$('mal43');if(!el){el=document.createElement('div');el.id='mal43';document.body.appendChild(el)}const on=malOn();el.hidden=!on;if(on)el.innerHTML=P.mal.k.map(k=>MAL43.find(c=>c.k===k).i).join(' ')+` <b>+${Math.round(malB()*100)}%</b>`;el.title=on?'Maledizioni: '+P.mal.k.map(k=>MAL43.find(c=>c.k===k).n).join(', '):''}
(function(){const st=document.createElement('style');st.textContent=`#mal43{position:fixed;left:50%;top:44px;transform:translateX(-50%);z-index:30;font:13px Georgia,serif;color:#e8d8ff;background:rgba(40,10,60,.78);border:1px solid #c46bff;border-radius:12px;padding:2px 10px;pointer-events:none}body:not(.ig) #mal43{display:none}`;document.head.appendChild(st)})();
