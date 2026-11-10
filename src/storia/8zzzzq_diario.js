/* ================= 8.6: IL DIARIO DELLE MISSIONI, LA GUIDA E I PRIMI PASSI =================
   - IL DIARIO (tasto delle missioni): la storia e ogni missione in corso con la barra di avanzamento, la ricompensa e
     soprattutto DOVE ANDARE (in che zona sono i nemici, dov'è la persona da cui tornare). Sotto, le missioni che puoi
     prendere adesso e da chi.
   - LA GUIDA: «📍 Segui» su una missione (o sulla storia) e ai piedi dell'eroe compare una scia d'oro che punta alla
     meta: la persona, il nemico più vicino, oppure la porta o il cancello da prendere per arrivarci.
   - I PRIMI PASSI: per gli eroi nuovi, un cartellino con sette cose da provare, una alla volta, con un premio alla fine.
   - LO ZAINO: «Equipaggia il meglio» e l'ordinamento per rarità o per potenza.
   - LA MAPPA di Aldoria: i nomi dei quartieri, del fiume e del ponte.
   Tutto solo nella Storia. */
XSV.add('gd86');
const JR86={trk:'s',tg:null,tt:0};
const jrStory=()=>MODE==='story'&&!(typeof OW!=='undefined'&&OW.on)&&started&&P;
const JRW={re:'in_castle',saggio:'in_library',gilda:'in_tavern',borin:'in_smith',mira:'in_alch',lia:'in_temple',rosa:'in_house1',gerald:'in_house3',marcus:'town',tommaso:'town',ugo:'town',nino:'town',araldo:'town',moreau:'town',olmo:'town',remo:'town',ines:'town',leandro:'town',bruna:'town',celeste:'town',pia:'town'};
const jrSeen=()=>LS.get('voxelia_dove86',{})||{};
{const l0=loadPost;loadPost=function(k){l0(k);try{if(!jrStory()||(ZZ&&ZZ.dg))return;const L=jrSeen();let c=0;for(const e of ents)if(e.k==='npc'&&e.nid&&NPCS[e.nid]&&(NPCS[e.nid].qs||NPCS[e.nid].role)&&L[e.nid]!==k){L[e.nid]=k;c=1}if(c)LS.set('voxelia_dove86',L)}catch(e){}}}
const jrZn=k=>k?(DG[k]?DG[k].n:(Z[k]&&Z[k].n)||k):'';
function jrNpcZone(nid){if(ents.some(e=>e.k==='npc'&&e.nid===nid))return Zk;return jrSeen()[nid]||JRW[nid]||''}
// dove vivono i nemici di una missione: le zone aperte e i dungeon che li hanno
function jrFoeZones(T){const R=[];for(const k of['forest','desert','peaks','nord','campi','rovine'])if(Z[k]&&((Z[k].en||[]).some(e=>T.e.includes(e))||T.e.includes(Z[k].boss)))R.push(k);for(const k in DG){if(k.startsWith('twd_'))continue;if((DG[k].en||[]).some(e=>T.e.includes(e))||T.e.includes(DG[k].boss))R.push(k)}
  return R.sort((a,b)=>((DG[a]||Z[a]).lv|0)-((DG[b]||Z[b]).lv|0))}
// la meta di quello che stai seguendo: {tx: la frase, z: la zona (o il dungeon), nid / foes: chi cercare là}
function jrGoal(k){if(k==='s'){const s=P.st|0;if(s===1){const nx=SHARDS.find(d=>!P.sh.includes(d));return nx?{tx:DG[nx].n+' ('+DGH[nx]+')',z:nx,foes:[DG[nx].boss].concat(DG[nx].en)}:null}
    if(s===3)return{tx:'Il portale nella sala del trono, al castello',z:'in_castle',nid:'re'};if(s>=5)return null;return{tx:'Il Re Aldric, nel castello a nord-ovest',z:'in_castle',nid:'re'}}
  if(k&&k[0]==='n'&&k[1]===':'){const nid=k.slice(2),z=jrNpcZone(nid);return NPCS[nid]?{tx:NPCS[nid].n+(z?' · '+jrZn(z):''),z,nid}:null}
  const q=P.q.find(x=>x.id===k);if(!q)return null;const T=QT[q.id];
  if(qReady(q)){const z=jrNpcZone(q.npc);return{tx:'Torna da '+NPCS[q.npc].n+(z?' · '+jrZn(z):''),z,nid:q.npc}}
  if(T.t==='talk'){const z=jrNpcZone(T.to);return{tx:'Parla con '+NPCS[T.to].n+(z?' · '+jrZn(z):''),z,nid:T.to}}
  const Zs=jrFoeZones(T);return{tx:Zs.length?'Li trovi qui: '+Zs.slice(0,3).map(jrZn).join(', '):'Cerca nei dungeon e fuori dalle mura',z:Zs.find(z=>Zk===z||Zk.startsWith(z+'@'))||Zs[0]||'',foes:T.e}}
// il punto da indicare nella zona dove sei: la persona, il nemico più vicino, oppure il passaggio da prendere
function jrTarget(){const G=jrGoal(JR86.trk);if(!G||!G.z)return null;const near=L=>{let b=null,bd=1e9;for(const e of L){const d=Math.hypot(e.px-P.px,e.py-P.py);if(d<bd){bd=d;b=e}}return b};
  const here=Zk===G.z||Zk.startsWith(G.z+'@');
  if(here){if(G.nid){const e=ents.find(q=>q.k==='npc'&&q.nid===G.nid);if(e)return e}if(G.foes){const e=near(ents.filter(q=>q.k==='en'&&q.hp>0&&G.foes.includes(q.t)));if(e)return e;const d=near(ents.filter(q=>q.k==='po'&&q.to&&q.to.startsWith(G.z+'@')&&q.st!=='up'));if(d)return d}return null}
  const po=to=>near(ents.filter(q=>q.k==='po'&&q.to&&(q.to===to||q.to.startsWith(to+'@'))));let e=po(G.z);if(e)return e;
  if(DG[G.z]&&DG[G.z].ent!==Zk){e=po(DG[G.z].ent);if(e)return e}if(Zk!=='town'){e=po('town');if(e)return e;e=near(ents.filter(q=>q.k==='po'&&q.st==='door'));if(e)return e}return null}
function jrTrack(k){JR86.trk=JR86.trk===k&&k!=='s'?'s':k;JR86.tt=0;tone(660,.06,'triangle');if(PM)pn('q')}
{const u0=upd;upd=function(dt){u0(dt);if(!jrStory())return;JR86.tt-=dt;if(JR86.tt<=0){JR86.tt=.4;if(JR86.trk!=='s'&&JR86.trk[0]!=='n'&&!P.q.some(q=>q.id===JR86.trk))JR86.trk='s';try{JR86.tg=SET.jrguide===0?null:jrTarget()}catch(e){JR86.tg=null}gdTick()}}}
{const d0=draw;draw=function(){d0();const T=JR86.tg;if(!T||!jrStory()||PM||(typeof D3B!=='undefined'&&D3B)||!ents.includes(T))return;try{
  g.save();g.setTransform(S*DPR,0,0,S*DPR,(W/2-camX*S)*DPR,(H/2-camY*S)*DPR);const dx=T.px-P.px,dy=T.py-P.py,d=Math.hypot(dx,dy);
  if(d>2.2){const ux=dx/d,uy=dy/d,n=Math.min(4,Math.floor(d-1));for(let i=0;i<n;i++){const k=1.2+i*.62+((t*1.6)%0.62),x=P.px+ux*k,y=P.py+uy*k,a=Math.max(0,1-(k-1.2)/(n*.62+.3));g.globalAlpha=a*.9;g.fillStyle='#ffd84a';g.strokeStyle='#7a4a00';g.lineWidth=.8;
      const px=PX(x,y),py=PY(x,y,1),fx=PX(x+ux*.28,y+uy*.28)-px,fy=PY(x+ux*.28,y+uy*.28,1)-py,sx=PX(x-uy*.2,y+ux*.2)-px,sy=PY(x-uy*.2,y+ux*.2,1)-py;g.beginPath();g.moveTo(px+fx,py+fy);g.lineTo(px+sx,py+sy);g.lineTo(px-fx*.3,py-fy*.3);g.lineTo(px-sx,py-sy);g.closePath();g.fill();g.stroke()}}
  g.globalAlpha=.55+Math.sin(t*4)*.3;g.strokeStyle='#ffd84a';g.lineWidth=2;const r=.55+((t*.8)%.5);g.beginPath();g.ellipse(PX(T.px,T.py),PY(T.px,T.py,0),r*45.25,r*22.6,0,0,6.283);g.stroke();g.restore()}catch(e){try{g.restore()}catch(_){}}}}
/* ---- il diario ---- */
function jrCard(k,ti,sub,tx,G,extra){const on=JR86.trk===k;return`<div class="qb jr86 ${on?'on':''}"><b>${ti}</b> ${sub?`<span class="mu">${sub}</span>`:''}<br>${tx}${G?`<div class="jrw">📍 ${esc(G.tx)}</div>`:''}${extra||''}<div class="jrb">${G&&G.z?`<button class="${on?'gold':''}" onclick="jrTrack('${k}')">${on?'✔ La stai seguendo':'📍 Segui'}</button>`:''}`}
X43P.jr86=()=>{const done=Object.keys(P.qd||{}).length,tot=Object.keys(QT).length;let h=`<h3>📜 Diario delle missioni <span class="mu">${done}/${tot} completate</span></h3>`;
  const Gs=jrGoal('s');h+=jrCard('s','⚜ Storia','',esc(storyObj())+(P.st===1?'<div class="jrs">'+SHARDS.map(id=>`<span class="${P.sh.includes(id)?'ok':''}">${P.sh.includes(id)?'✔':'◻'} ${esc(DG[id].n)}</span>`).join('')+'</div>':''),Gs)+'</div></div>';
  h+=`<h4>In corso <span class="mu">${P.q.length}/5</span></h4>`;if(!P.q.length)h+='<p class="mu">Nessuna missione secondaria. Qui sotto trovi quelle che puoi prendere.</p>';
  P.q.forEach((q,i)=>{const T=QT[q.id],n=T.n||1,r=qRew(T),G=jrGoal(q.id),pc=Math.min(100,Math.round(q.c/n*100));
    h+=jrCard(q.id,esc(T.ti),'da '+esc(NPCS[q.npc]?NPCS[q.npc].n:'?'),esc(T.tx),G,`<div class="jrp"><i style="width:${pc}%"></i><span>${qReady(q)?'✔ Pronta da consegnare':esc(qProg(q))}</span></div><small class="mu">Ricompensa: ${r.g} oro · ${r.x} XP</small>`)+`<button onclick="P.q.splice(${i},1);npcMarks();hud();pn('q')">Abbandona</button></div></div>`});
  const A=[];if(P.q.length<5)for(const nid in NPCS){if(!NPCS[nid].qs)continue;let id=null;try{id=qAvail(nid)}catch(e){}if(id&&QT[id])A.push([nid,id])}
  h+=`<h4>Da prendere adesso <span class="mu">${A.length>14?"le prime 14 di "+A.length:A.length}</span></h4>`;if(P.q.length>=5)h+='<p class="mu">Hai già cinque missioni: finiscine una per prenderne altre.</p>';else if(!A.length)h+='<p class="mu">Nessuna per ora: sali di livello o prosegui la storia.</p>';
  h+='<div class="jra">'+A.slice(0,14).map(([nid,id])=>{const z=jrNpcZone(nid),k='n:'+nid,on=JR86.trk===k;return`<div><span><b style="color:#c8860b">❗</b> <b>${esc(QT[id].ti)}</b><br><small class="mu">${esc(NPCS[nid].n)}${z?' · '+esc(jrZn(z)):''}</small></span><button class="${on?'gold':''}" onclick="jrTrack('${k}')">${on?'✔':'📍 Portami'}</button></div>`}).join('')+'</div>';
  return h+`<div class="row"><label for="s_jrg">Scia d'oro verso la meta</label><input type="checkbox" id="s_jrg" ${SET.jrguide!==0?'checked':''} onchange="setv('jrguide',this.checked?1:0)"></div><button onclick="cl()">Chiudi</button>`};
{const p0=pn;pn=function(m,arg){if(m==='q'&&jrStory()&&MODE!=='ed'){p0('jr86',arg);PM='q';return}p0(m,arg)}}
/* ---- i primi passi ---- */
const GD86=[['mv','Muoviti: clicca sul terreno, oppure usa WASD'],['re','Parla con il Re Aldric, nel castello a nord-ovest'],['inv','Apri lo zaino (tasto I)'],['q','Accetta una missione: cerca chi ha il ! sopra la testa'],['map','Apri la mappa (tasto M)'],['kill','Esci dalla porta nord e sconfiggi un nemico'],['pot','Bevi una pozione quando sei ferito (tasto Q)']];
function gdFix(){if(!P.gd86){P.gd86=(P.lv|0)>3||(P.st|0)>1||(P.kills|0)>20?{done:1}:{d:0}}return P.gd86}
function gdSet(k){if(!jrStory())return;const G=gdFix();if(G.done||G[k])return;G[k]=1;tone(880,.07,'triangle',.04);if(GD86.every(([q])=>G[q])){G.done=1;P.g+=150;P.pot+=2;hud();banner('Primi passi completati','+150 oro e 2 pozioni · il Diario delle missioni ti dice sempre dove andare','stella');jingle([67,72,76,79],.09,'triangle')}gdDraw()}
function gdTick(){const G=gdFix();if(G.done){gdDraw();return}G.d=(G.d||0)+Math.abs(P.px-(JR86.gx||P.px))+Math.abs(P.py-(JR86.gy||P.py));JR86.gx=P.px;JR86.gy=P.py;if(G.d>6)gdSet('mv');if((P.st|0)>=1)gdSet('re');if(P.q.length||Object.keys(P.qd||{}).length)gdSet('q');if((P.kills|0)>(G.k0==null?(G.k0=P.kills|0):G.k0))gdSet('kill');gdDraw()}
function gdDraw(){let el=$('gd86');const G=P&&P.gd86,show=jrStory()&&G&&!G.done&&!PM&&SET.gd86!==0;if(!show){if(el)el.hidden=true;return}if(!el){el=document.createElement('div');el.id='gd86';document.body.appendChild(el)}
  const nx=GD86.find(([k])=>!G[k]),n=GD86.filter(([k])=>G[k]).length,h=`<b>🌟 Primi passi <span>${n}/${GD86.length}</span></b>${GD86.map(([k,tx])=>`<div class="${G[k]?'ok':nx&&nx[0]===k?'nx':''}">${G[k]?'✔':'◻'} ${tx}</div>`).join('')}<button onclick="P.gd86={done:1};gdDraw()">Non mi serve</button>`;
  if(el.dataset.h!==h){el.dataset.h=h;el.innerHTML=h}el.hidden=false;const q=$('qt'),r=q&&q.getBoundingClientRect();el.style.top=Math.round((r&&r.height?r.bottom:150)+8)+'px'}
{const p0=pn;pn=function(m,arg){p0(m,arg);try{if(m==='inv')gdSet('inv');if(P&&P.gd86&&!P.gd86.done)gdDraw()}catch(e){}}}
if(typeof openMap==='function'){const o0=openMap;openMap=function(){o0();try{gdSet('map')}catch(e){}}}
{const p0=pot;pot=function(){const n=P?P.pot:0;p0();if(P&&P.pot<n)gdSet('pot')}}
/* ---- lo zaino: equipaggia il meglio, ordina ---- */
function invBest(){let n=0;for(const s of 'whcs'){let bi=-1,bv=P.eq[s]?P.eq[s].v:-1;P.inv.forEach((it,i)=>{if(it.s===s&&it.v>bv){bv=it.v;bi=i}});if(bi>=0){const it=P.inv.splice(bi,1)[0];if(P.eq[s])P.inv.push(P.eq[s]);P.eq[s]=it;n++}}recalc();hud();if(n){try{sceneEquip()}catch(e){}msg('Equipaggiati '+n+(n===1?' oggetto migliore':' oggetti migliori'))}else msg('Hai già addosso il meglio che c\'è nello zaino');pn('inv')}
function invSort(by){const o='whcs';P.inv.sort((a,b)=>by==='r'?(b.r|0)-(a.r|0)||(b.v|0)-(a.v|0):by==='v'?(b.v|0)-(a.v|0):o.indexOf(a.s)-o.indexOf(b.s)||(b.v|0)-(a.v|0));tone(520,.05);pn('inv')}
{const p0=pn;pn=function(m,arg){p0(m,arg);try{if(m!=='inv'||PM!=='inv'||!started||!P)return;const el=$('pn'),h3=el&&el.querySelector('h3');if(!h3||el.querySelector('.iv86'))return;
  h3.insertAdjacentHTML('afterend',`<div class="iv86"><button class="gold" onclick="invBest()">⚔ Equipaggia il meglio</button><span class="mu">Ordina:</span><button onclick="invSort('r')">Rarità</button><button onclick="invSort('v')">Potenza</button><button onclick="invSort('s')">Tipo</button></div>`)}catch(e){}}}
/* ---- la mappa: i nomi dei quartieri ---- */
if(typeof mapDraw==='function'){const m0=mapDraw;mapDraw=function(){m0();try{if(!jrStory()||!TOWNMAP||!AL86.st)return;const cv2=$('mapcv');if(!cv2)return;const q=cv2.getContext('2d'),n=TOWNMAP.N,L=[[35.5,31,'Piazza della Fontana'],[46.5,53.2,'Giardini della Regina'],[30,66.5,'Porto'],[8,15.6,'Castello'],[46,27,'Artigiani'],[63,31,'Oltrefiume'],[24,36,'Vicoli'],[59.5,10,'Fiume Argento'],[58.5,36,'Ponte Grande']];
  q.save();q.setTransform(MV.dp,0,0,MV.dp,0,0);q.textAlign='center';q.font=`italic bold ${Math.max(9,Math.min(15,MV.k*.022))}px Georgia,serif`;for(const[x,y,tx]of L){const[sx,sy]=w2s(x/n-.5,y/n-.5);q.lineWidth=3;q.strokeStyle=mapDark()?'#000c':'#fff9';q.strokeText(tx,sx,sy);q.fillStyle=mapDark()?'#ffe8b0':'#4a2a0a';q.fillText(tx,sx,sy)}
  const T=JR86.tg;if(T&&Zk==='town'){const[sx,sy]=w2s(T.px/n-.5,T.py/n-.5);q.fillStyle='#ffd84a';q.strokeStyle='#7a4a00';q.lineWidth=2;q.beginPath();q.arc(sx,sy,6+Math.sin(performance.now()/200)*1.5,0,6.3);q.fill();q.stroke()}q.restore()}catch(e){}}}
document.head.insertAdjacentHTML('beforeend',`<style>.jr86{border-left:3px solid #ffffff22}.jr86.on{border-left-color:#c8860b;background:#c8860b1c}.jrw{margin:5px 0 3px;padding:4px 8px;border-radius:6px;background:#c8860b26;color:inherit;font-weight:bold;font-size:13px}.jrb{display:flex;gap:6px;flex-wrap:wrap;margin-top:6px}
.jrp{position:relative;height:16px;border-radius:8px;background:#00000030;overflow:hidden;margin:5px 0 2px}.jrp i{position:absolute;left:0;top:0;bottom:0;background:linear-gradient(90deg,#3a8a4a,#5ad07a)}.jrp span{position:relative;display:block;text-align:center;font:bold 11px/16px system-ui,sans-serif;color:#fff;text-shadow:0 1px 2px #000}
.jrs{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:2px 10px;margin-top:5px;font-size:13px}.jrs .ok{color:#2a8a4a;font-weight:bold}.jra{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:5px}.jra>div{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:5px 8px;border-radius:7px;background:#00000012}
.iv86{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin:4px 0 8px}
#gd86{position:fixed;right:10px;z-index:9;width:min(290px,70vw);padding:8px 10px;border-radius:10px;background:rgba(10,12,28,.86);border:1px solid #f5b94288;color:#e8ecf4;font:12px/1.5 system-ui,sans-serif;pointer-events:auto}#gd86[hidden]{display:none}#gd86 b{display:flex;justify-content:space-between;color:#ffd98a;font:bold 13px Georgia,serif;margin-bottom:3px}#gd86 div{opacity:.6}#gd86 div.ok{opacity:.55;color:#7aff9a;text-decoration:line-through}#gd86 div.nx{opacity:1;color:#fff;font-weight:bold}#gd86 button{margin-top:5px;padding:2px 8px;font-size:11px;opacity:.7}body:not(.ig) #gd86{display:none}</style>`);
