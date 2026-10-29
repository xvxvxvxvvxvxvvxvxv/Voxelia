/* ================= 7.47: gli animali da compagnia =================
   Al Negozio degli animali (ad Aldoria vicino alla piazza, e nelle città di Tomorrow) si prende un amico: cane, gatto,
   volpe, coniglio, gufo, maialino, pinguino o draghetto. Ti segue dappertutto (e lo vedono anche gli altri giocatori),
   e ogni tanto si mette a fiutare e scava: ogni animale trova cose diverse (il cane monete e oggetti, il gatto pesci,
   la volpe risorse, il coniglio frutta e grano, il gufo pozioni, il maialino tartufi preziosi, il pinguino conchiglie e
   ghiaccio, il draghetto gemme). Non combatte: per quello ci sono i compagni domati. Si accarezza toccandolo. */
XSV.add('ani47');
const ANI47={
  cane:{n:'Cane',p:400,c:['#a8743a','#6a4422','#f4e8d0'],q:1,fi:'oro',d:'Trova monete e, a volte, un oggetto'},
  gatto:{n:'Gatto',p:400,c:['#e0a050','#a86a2a','#ffffff'],q:1,fi:'pesce',d:'Ti porta i pesci'},
  volpe:{n:'Volpe',p:700,c:['#e0702a','#ffffff','#2a1a10'],q:1,fi:'ris',d:'Fiuta legna, pietra, ferro e rame'},
  coniglio:{n:'Coniglio',p:500,c:['#e8e0d8','#c8b8a8','#ff9aa8'],q:2,fi:'cibo',d:'Trova mele, grano e uova'},
  gufo:{n:'Gufo',p:900,c:['#8a6a4a','#d8c8a0','#ffd84a'],q:3,fi:'pot',d:'Ti porta pozioni (di più di notte)'},
  maialino:{n:'Maialino',p:900,c:['#f4a8b8','#e08898','#5a3a3a'],q:1,fi:'tartufo',d:'Scava tartufi: valgono tanto oro'},
  pinguino:{n:'Pinguino',p:1100,c:['#2a2a3a','#ffffff','#ffa82a'],q:4,fi:'mare',d:'Conchiglie, ghiaccio e qualche pesce'},
  draghetto:{n:'Draghetto',p:3500,c:['#4aa86a','#2a6a3a','#ffd84a'],q:5,fi:'gemma',d:'Trova gemme e pepite d\'oro'}};
const ANI={e:{},nx:0,sel:null};
function aniFix(){P.ani47=P.ani47||{own:[],on:null,f:0};const a=P.ani47;a.own=Array.isArray(a.own)?a.own.filter(q=>q&&ANI47[q.t]):[];if(a.on&&!a.own.some(q=>q.id===a.on))a.on=null;return a}
const aniCur=()=>{const a=P&&P.ani47;return a&&a.on?a.own.find(q=>q.id===a.on):null};
// il modello: piccolo e semplice, con le zampe che si muovono quando cammina
function aniL(t0,mv,ph,dig){const A=ANI47[t0],[c,c2,c3]=A.c,w=mv?Math.sin(t*12+ph):0,tl=Math.sin(t*(mv?10:4)+ph)*.04,dz=dig?Math.abs(Math.sin(t*14))*1.5:0;
  if(t0==='gufo'){const f=Math.sin(t*(mv?14:3)+ph)*.08,z=mv?10+Math.sin(t*3)*2:2;return[[-.1,-.08,z,.2,.16,8,c],[-.09,-.06,z+8,.18,.14,5,c],[-.07,-.08,z+9,.05,.02,2,c3],[.02,-.08,z+9,.05,.02,2,c3],[-.02,-.09,z+7.5,.04,.02,1.5,'#ffa82a'],[-.17-f,-.06,z+2,.07,.12,5,c2],[.1+f,-.06,z+2,.07,.12,5,c2]]}
  if(t0==='pinguino'){const s=mv?Math.sin(t*10+ph)*.03:0;return[[-.09+s,-.08,0,.18,.16,11,c],[-.06+s,-.09,1,.12,.04,8,c2],[-.08+s,-.07,11,.16,.14,4,c],[-.02+s,-.1,12,.04,.04,1,c3],[-.13+s,-.04,4,.04,.08,5,c],[.09+s,-.04,4,.04,.08,5,c],[-.07,-.08,0,.06,.06,1,c3],[.01,-.08,0,.06,.06,1,c3]]}
  const big=t0==='maialino'?1.15:t0==='coniglio'?.8:1,h=4*big,L=[[-.16*big,-.07*big,3+dz*0,.32*big,.14*big,h,c],[.1*big,-.06*big,4+h*.6-dz,.14*big,.12*big,4,c],[.2*big,-.03*big,4+h*.6-dz,.04,.06,1.4,c3]];
  for(const[x,y,k]of[[-.13,-.06,1],[-.13,.04,-1],[.1,-.06,-1],[.1,.04,1]])L.push([x*big,y*big,0,.05,.04,3+w*k*.8,c2]);
  if(t0==='coniglio')L.push([.12,-.05,9.5-dz,.03,.03,5,c],[.12,.01,9.5-dz,.03,.03,5,c],[-.2,-.03,5,.06,.06,3,'#ffffff']);
  else if(t0==='maialino')L.push([.24*big,-.04,5.5-dz,.04,.08,2,c2],[.12,-.07,9.6-dz,.04,.03,1.5,c2],[.12,.03,9.6-dz,.04,.03,1.5,c2],[-.22,-.01,6,.04,.03,2,c2]);
  else if(t0==='draghetto')L.push([.12,-.05,9.5-dz,.03,.03,2.5,c3],[.12,.03,9.5-dz,.03,.03,2.5,c3],[-.05,-.2,6+Math.abs(w)*2,.14,.13,1,c2],[-.05,.07,6+Math.abs(w)*2,.14,.13,1,c2],[-.3,-.02+tl,4,.14,.04,2,c],[.25,-.02,6.5-dz,.04,.04,1.5,'#ff7a2a',1.2]);
  else{L.push([.12,-.06,9.5-dz,.035,.03,2,c],[.12,.03,9.5-dz,.035,.03,2,c]);const fx=t0==='volpe'?.16:t0==='gatto'?.04:.12,tz=t0==='gatto'?6:4.5;L.push([-.16-fx,-.02+tl,tz,fx+.02,.04,t0==='gatto'?4:2,t0==='volpe'?c3:c]);if(t0==='volpe')L.push([-.32,-.02+tl,tz,.04,.04,2,c2])}
  return L}
function aniDraw(e){const mv=e.mv>0,dig=e.dg&&t-e.dg<1.4;drawL(aniL(e.t,mv,e.ph||0,dig),e.px,e.py,0);
  if(dig&&cineOK()&&Math.random()<.3)sparks(e.px+.15,e.py,2,['#8a6a42','#6a4a2a'],30);if(e.hrt&&t-e.hrt<1.2)box(e.px-.05,e.py-.05,14+(t-e.hrt)*10,.1,.1,2,'#ff5a7a',1.4)}
// il tuo animale e quelli degli altri, come entità che seguono il loro padrone
function aniEnt(key,t0,n){let e=ANI.e[key];if(e&&ents.includes(e)){e.t=t0;e.n=n;return e}e={k:'ani47',key,t:t0,n,px:P.px,py:P.py,mv:0,ph:Math.random()*6};ANI.e[key]=e;ents.push(e);return e}
function aniFollow(e,tx,ty,dt){const dx=tx-e.px,dy=ty-e.py,d=Math.hypot(dx,dy);if(d>8){e.px=tx;e.py=ty;e.mv=0;return}if(d>1.1){const s=Math.min(d-1,(d>3?7:3.6)*dt);e.px+=dx/d*s;e.py+=dy/d*s;e.mv=.2}else e.mv=Math.max(0,e.mv-dt)}
const aniOkZone=()=>!!(ZZ&&!(ZZ.sub46)&&Zk!=='abissi46');
const _upd747a=upd;upd=function(dt){_upd747a(dt);if(!P||!started)return;const c=aniCur(),me=ANI.e.me;
  if(c&&aniOkZone()){const e=aniEnt('me',c.t,c.n);if(!(e.dg&&t-e.dg<1.4))aniFollow(e,P.px-.6,P.py+.5,dt);
    if(!ANI.nx)ANI.nx=t+50+Math.random()*40;if(t>ANI.nx&&P.hp>0&&!PM){ANI.nx=t+60+Math.random()*60;e.dg=t;setTimeout(()=>{try{aniFind(c,e)}catch(_){}},1300)}}
  else if(me){const i=ents.indexOf(me);if(i>=0)ents.splice(i,1);delete ANI.e.me}
  // gli animali degli altri giocatori nella stessa stanza
  if(typeof NET!=='undefined'&&NET.ok&&NET.peers){for(const id in NET.peers){const q=NET.peers[id],pl=NET.pl&&NET.pl[id];if(q&&q.a47&&ANI47[q.a47[0]]&&pl){const e=aniEnt('p'+id,q.a47[0],String(q.a47[1]||'').slice(0,14));aniFollow(e,pl.px-.6,pl.py+.5,dt)}}
    for(const k in ANI.e)if(k!=='me'){const id=k.slice(1),q=NET.peers[id];if(!q||!q.a47||!(NET.pl&&NET.pl[id])){const e=ANI.e[k],i=ents.indexOf(e);if(i>=0)ents.splice(i,1);delete ANI.e[k]}}}};
const _loadPost747a=loadPost;loadPost=function(k){ANI.e={};_loadPost747a(k);try{aniShop()}catch(e){console.warn('animali',e)}};
{const sp0=syncPack;syncPack=function(){const o=sp0()||{};const c=aniCur();if(c&&aniOkZone())o.a47=[c.t,c.n];return o}}
// i ritrovamenti
function aniFind(c,e){if(!started||!ents.includes(e))return;const A=ANI47[c.t],a=aniFix(),lv=Math.max(1,ZZ.lv||P.lv),r=Math.random(),pick=L=>L[Math.floor(Math.random()*L.length)];let s='';
  const res=k=>{P.res[k]=(P.res[k]|0)+1;s=RESN[k]||k},fish=()=>{const F=(typeof FISHT!=='undefined'?FISHT:[]).filter(f=>f.w>=10);const f=pick(F.length?F:[{id:'sardina',n:'Sardina'}]);P.fish=P.fish||{};P.fish[f.id]=(P.fish[f.id]|0)+1;s=f.n};
  if(r<.05&&P.inv.length<INV){const it=item(lv,1);P.inv.push(it);s=iname(it)}
  else if(A.fi==='oro'){const g2=Math.round(12+lv*4+Math.random()*20);P.g+=g2;goldFly(g2,e.px,e.py);s=g2+' monete'}
  else if(A.fi==='pesce')fish();else if(A.fi==='ris')res(pick(['legna','pietra','ferro','rame','legna','pietra']));
  else if(A.fi==='cibo')res(pick(['mela','grano','uova']));else if(A.fi==='pot'){const n=(typeof isNight==='function'&&isNight())||Math.random()<.3?2:1;P.pot+=n;s=n+(n>1?' pozioni':' pozione')}
  else if(A.fi==='tartufo'){const g2=Math.round(30+lv*8+Math.random()*40);P.g+=g2;goldFly(g2,e.px,e.py);s='un tartufo ('+g2+' monete)'}
  else if(A.fi==='mare'){if(Math.random()<.4)fish();else res(pick(['conchiglia','ghiaccio']))}else if(A.fi==='gemma')res(Math.random()<.4?'gemma':'pepita');
  a.f=(a.f|0)+1;flt(e,'🐾 '+s,'#ffe08a');msg(c.n+' ha trovato: '+s);tone(880,.06,'triangle');hud();save()}
// il negozio
function aniShop(){if(!ZZ||!started||ents.some(e=>e.k==='ani47s'))return;let c=null;if(Zk==='town'&&!(typeof OW!=='undefined'&&OW.on))c=[40,36];else if(typeof twOn==='function'&&twOn()&&ZZ.set&&ZZ.shub)c=[ZZ.shub[0]-4,ZZ.shub[1]-4];if(!c)return;
  const q=spot47(c,2);if(q)ents.push({k:'ani47s',px:q[0]+.5,py:q[1]+.5,n:'Negozio degli animali'})}
ITK.add('ani47s');ITK.add('ani47');
const _act747a=act;act=function(e){if(e&&e.k==='ani47s'){pn('ani47');return}if(e&&e.k==='ani47'){e.hrt=t;tone(660,.08,'sine',.05);msg(e.key==='me'?e.n+' è felice!':'Accarezzi '+e.n);return}_act747a(e)};
function aniBuy(k){const A=ANI47[k],a=aniFix();if(!A)return;if(a.own.some(q=>q.t===k)){msg('Ce l\'hai già');return}if(P.g<A.p){msg('Servono '+A.p+' monete');tone(150,.1);return}
  P.g-=A.p;const q={id:uid(),t:k,n:A.n};a.own.push(q);a.on=q.id;banner('Hai un nuovo amico!',A.n+' ti seguirà dappertutto','stella');jingle([67,72,76,79],.09,'triangle');hud();save();pn('ani47')}
function aniSet(id){const a=aniFix();a.on=a.on===id?null:id;ANI.nx=0;save();pn('ani47')}
function aniName(id){const a=aniFix(),q=a.own.find(x=>x.id===id),el=$('ani47n_'+id);if(!q||!el)return;const n=String(el.value||'').replace(/[<>]/g,'').trim().slice(0,14);if(n){q.n=n;save();msg('Ora si chiama '+n)}pn('ani47')}
X43P.ani47=()=>{const a=aniFix();let h=`<h3>🐾 Animali da compagnia · 💰${P.g}</h3><p class="x43t">Ti seguono dappertutto e ogni tanto scavano qualcosa per te${a.f?' · finora hanno trovato '+a.f+' cose':''}.</p>`;
  if(a.own.length)h+=`<h4>I tuoi</h4>`+a.own.map(q=>`<div class="x43r"><span><b>${esc(q.n)}</b> <small class="mu">${ANI47[q.t].n}</small> <input id="ani47n_${q.id}" maxlength="14" value="${esc(q.n)}" style="width:96px" onkeydown="event.stopPropagation()"><button onclick="aniName('${q.id}')">Nome</button></span><button class="${a.on===q.id?'on':''}" onclick="aniSet('${q.id}')">${a.on===q.id?'Con te ✓':'Portalo con te'}</button></div>`).join('');
  const shop=ents.some(e=>e.k==='ani47s'&&dist(e,P)<4);
  h+=`<h4>${shop?'Il negozio':'Al Negozio degli animali'}</h4><div class="x43c">${Object.keys(ANI47).map(k=>{const A=ANI47[k],got=a.own.some(q=>q.t===k);return`<button ${got||!shop?'disabled':''} onclick="aniBuy('${k}')"><b>${A.n}</b><small>${A.d}</small><small>${got?'✓ è tuo':A.p+' 💰'}</small></button>`}).join('')}</div>`;
  return h+`<button onclick="cl()">Chiudi</button>`};
const _ent747a=ent;ent=function(e){if(e.k==='ani47'){aniDraw(e);return}if(e.k==='ani47s'){drawL([[-.45,-.3,0,.9,.6,12,'#c8a070'],[-.5,-.35,12,1,.7,3,'#e05a5a'],[-.5,-.35,15,1,.7,2,'#ffffff'],[-.3,-.31,3,.25,.02,7,'#3a2a1a'],[.08,-.31,5,.28,.02,5,'#9adcff']],e.px,e.py,0);
  drawL(aniL('cane',0,1,0),e.px-.25,e.py+.55,0);drawL(aniL('gatto',0,2,0),e.px+.3,e.py+.5,0);return}_ent747a(e)};
// nel Diario
{const p0=pn;pn=function(m,arg){p0(m,arg);if(m==='dia'&&PM==='dia'){const pe=$('pn');if(pe&&!pe.querySelector('.ani47b'))pe.insertAdjacentHTML('afterbegin',`<button class="ani47b" onclick="pn('ani47')">🐾 Animali da compagnia</button>`)}}}
(function(){const st=document.createElement('style');st.textContent=`.ani47b{width:100%;margin-bottom:6px}`;document.head.appendChild(st)})();
