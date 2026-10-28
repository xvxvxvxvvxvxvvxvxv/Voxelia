/* ================= 7.46: gli eventi del mondo, a orario =================
   Ogni mezz'ora (all'ora in punto e alla mezza, ora vera) nel mondo succede qualcosa, per dodici minuti, uguale per
   tutti i giocatori nello stesso momento:
   - 🐉 un drago attacca una zona: è un boss fortissimo, chi lo abbatte (o combatte vicino) prende un premio grande;
   - ☄ una meteora cade in una zona: nel cratere c'è un forziere della stella e del ferro da raccogliere, ma anche le
     creature arrivate con lei;
   - 🛒 un mercante raro arriva in piazza, con tre oggetti preziosi da comprare finché resta.
   In alto si vede che cosa succede, dove e per quanto. Nella storia gli eventi sono intorno ad Aldoria; in Tomorrow
   arrivano nella tua città. */
XSV.add('ev46d');
const EV46={sp:{},ann:0,T:{drago:{i:'🐉',n:'Un drago attacca'},meteora:{i:'☄',n:'Una meteora è caduta su'},mercante:{i:'🛒',n:'Un mercante raro è arrivato a'}}};
const EV_SLOT=1800000,EV_DUR=720000;
function evNow(){const s=Math.floor(Date.now()/EV_SLOT),t0=s*EV_SLOT;if(Date.now()>t0+EV_DUR)return null;return evOf(s)}
function evOf(s){const r=sd(hs('evento|'+s)),x=r(),ty=x<.4?'drago':x<.75?'meteora':'mercante';let zk;
  if(typeof twOn==='function'&&twOn()&&P&&P.tw){zk=typeof csCap==='function'?csCap():null;if(!zk)return null}
  else{const L=ty==='mercante'?['town']:ty==='drago'?['forest','desert','peaks','campi']:['forest','desert','peaks','campi','nord'];zk=L[Math.floor(r()*L.length)]}
  return{s,ty,zk,t0:s*EV_SLOT,end:s*EV_SLOT+EV_DUR,r:r()}}
const evDone=s=>!!(P&&P.ev46d&&P.ev46d[s]);
function evMark(s){P.ev46d=P.ev46d||{};P.ev46d[s]=1;for(const k in P.ev46d)if(+k<s-96)delete P.ev46d[k];save()}
const evMine=()=>!(typeof NET!=='undefined'&&NET.ok&&typeof syncOn==='function'&&syncOn()&&typeof syncIsHost==='function'&&!syncIsHost());
function evSpawn(V){if(!V||Zk!==V.zk||EV46.sp[V.s+'|'+Zk]||evDone(V.s)||!started)return;EV46.sp[V.s+'|'+Zk]=1;const r=sd(hs('evento|'+V.s+'|posto'));
  const far=(x,y)=>Math.hypot(x+.5-P.px,y+.5-P.py)>9;
  if(V.ty==='mercante'){const c=Zk==='town'?[36,38]:ZZ.shub?[ZZ.shub[0]-3,ZZ.shub[1]-3]:[N>>1,N>>1];const q=nearFree(c[0],c[1]);ents.push({k:'merc46',px:q[0]+.5,py:q[1]+.5,n:'Mercante delle terre lontane',s:V.s});return}
  const q=freeTile(r,far,600);if(!q)return;
  if(V.ty==='drago'){if(!evMine())return;const B=['drago_brina','ignis','leviatano'].filter(k=>E[k]),t2=B[Math.floor(r()*B.length)]||'troll',e=mk(t2,q[0],q[1]);
    e.hp=e.mx=Math.round(e.mx*2.5);e.at*=1.15;e.xp*=3;e.n=t2==='drago_brina'?'Drago Errante dei Ghiacci':t2==='ignis'?'Drago di Fuoco':'Serpente del Diluvio';e.ev46=V.s;ents.push(e);return}
  // la meteora: un cratere fumante, il forziere della stella, il ferro e le creature
  const[x0,y0]=q;for(let y=y0-2;y<=y0+2;y++)for(let x=x0-2;x<=x0+2;x++)if(x>0&&y>0&&x<N-1&&y<N-1&&M[y][x]===0&&Math.hypot(x-x0,y-y0)<2.6)DEC[y][x]='ç';
  ents.push({k:'ch',px:x0+.5,py:y0+.5,rich:1,ev46:V.s},{k:'met46',px:x0+.5,py:y0+.5});
  for(const[a,b]of[[2,0],[-2,1],[0,-2]]){const x=x0+a,y=y0+b;if(M[y]&&WK(M[y][x]))ents.push({k:'res',r:'ferro',n:RESN.ferro||'Ferro',px:x+.5,py:y+.5})}
  if(evMine()){const C=['golem_magma','elem_ghiaccio','imp','golem_cr'].filter(k=>E[k]);for(let i=0;i<3;i++){const[x,y]=nearFree(x0+(i-1)*3,y0+3);if(WK(M[y][x])){const m=mk(C[(i+V.s)%C.length]||'slime',x,y);m.ev46=-1;ents.push(m)}}}}
const _loadPost746e=loadPost;loadPost=function(k){_loadPost746e(k);try{evSpawn(evNow())}catch(e){console.warn('evento',e)}};
// il giro dell'orologio: annunci, comparse e cartello in alto
setInterval(()=>{try{if(!started||!P)return;const V=evNow();evHud(V);if(!V)return;if(EV46.ann!==V.s&&!evDone(V.s)){EV46.ann=V.s;const T=EV46.T[V.ty];
    banner(T.i+' '+T.n+' '+evZone(V.zk),'Per dodici minuti: '+(V.ty==='drago'?'abbattilo per un grande premio':V.ty==='meteora'?'nel cratere c\'è il forziere della stella':'ha tre oggetti rari da vendere'),'stella');clog('',T.i+' '+T.n+' '+evZone(V.zk)+'!',{sys:1})}
  evSpawn(V)}catch(e){}},2000);
const evZone=k=>k==='town'?'Aldoria':typeof zname==='function'?(()=>{try{return zname(k)}catch(_){return k}})():k;
function evHud(V){let el=$('ev46');const on=V&&!evDone(V.s)&&started;if(!on){if(el)el.hidden=true;return}if(!el){el=document.createElement('div');el.id='ev46';document.body.appendChild(el)}el.hidden=false;
  const T=EV46.T[V.ty],s=Math.max(0,Math.round((V.end-Date.now())/1000));el.textContent=T.i+' '+T.n+' '+evZone(V.zk)+' · '+Math.floor(s/60)+':'+String(s%60).padStart(2,'0')+(Zk===V.zk?' · sei qui!':'')}
// i premi
const _kill746e=kill;kill=function(e){const ev=e&&e.k==='en'&&e.ev46>0&&ents.includes(e)?e.ev46:0;_kill746e(e);if(!ev||evDone(ev))return;const lv=Math.max(1,ZZ.lv||P.lv),g2=Math.round((300+lv*60)*(NET.cfg&&NET.cfg.gm||1));
  P.g+=g2;goldFly(g2,e.px,e.py);gainXP(Math.round(200+lv*40));ents.push(dropOk({k:'dr',px:e.px+.5,py:e.py,it:item(lv+3,3)}));evMark(ev);banner('Il drago è caduto!','+'+g2+' oro e un oggetto epico','corona');jingle([60,64,67,72,76,79,84],.09);hud()};
const _act746e=act;act=function(e){const ev=e&&e.k==='ch'&&e.ev46;_act746e(e);if(ev&&!evDone(ev)){P.pot+=2;const it=item(Math.max(1,ZZ.lv||P.lv)+2,2);gain(it);evMark(ev);banner('Il forziere della stella','Dentro c\'era '+iname(it)+' e due pozioni','stella')}
  if(e&&e.k==='merc46')pn('merc46',e)};
ITK.add('merc46');
function evStock(s){const r=sd(hs('mercante|'+s)),R0=R;let L=[];try{R=r;const lv=Math.max(1,P.lv);L=[item(lv+2,2),item(lv+3,2),item(lv+4,3)]}finally{R=R0}return L.map((it,i)=>(it.u='m'+s+'_'+i,it))}
X43P.merc46=()=>{const e=PA,s=e&&e.s,L=evStock(s),b=P.ev46b||{};return`<h3>🛒 Mercante delle terre lontane · 💰${P.g}</h3><p class="x43t">«Resto solo finché suona la campana. Merce che non si trova da nessun'altra parte!»</p>
  ${L.map((it,i)=>{const pr=Math.round((it.p||100)*3),got=b[it.u];return`<div class="it"><span>${fmt(it)}</span><span>${got?'<i class="mu">venduto</i>':`<button onclick="evBuy(${s},${i})">${pr} 💰</button>`}</span></div>`}).join('')}<button onclick="cl()">Chiudi</button>`};
function evBuy(s,i){const it=evStock(s)[i];if(!it)return;P.ev46b=P.ev46b||{};if(P.ev46b[it.u])return;const pr=Math.round((it.p||100)*3);if(P.g<pr){msg('Servono '+pr+' monete');tone(150,.1);return}if(P.inv.length>=INV){msg('Lo zaino è pieno');return}
  P.g-=pr;P.ev46b[it.u]=1;it.u=uid();P.inv.push(it);msg('Comprato: '+iname(it));tone(700,.08,'triangle');hud();save();pn('merc46',PA)}
XSV.add('ev46b');
// i disegni: il mercante con il carretto, il fumo della meteora
const _ent746e=ent;ent=function(e){if(e.k==='merc46'){drawL([[-.45,-.25,4,.9,.5,10,'#5a2a6a'],[-.48,-.28,14,.96,.56,3,'#d4af37'],[-.4,-.3,0,.12,.06,8,'#3a2a1a'],[.28,-.3,0,.12,.06,8,'#3a2a1a'],[-.4,-.22,17,.8,.4,10,'#7a3a8a'],[-.1,-.1,27,.2,.2,6,'#ffd84a',1.3]],e.px,e.py,0);
    if(typeof nlight==='function')nlight(e.px,e.py,20,90,'255,200,255',.5);return}
  if(e.k==='met46'){const u=(t*.6)%1;g.globalAlpha=.45*(1-u);box(e.px-.3+u*.2,e.py-.3,8+u*40,.6,.6,6,'#8a8a8a');g.globalAlpha=1;box(e.px-.2,e.py-.2,0,.4,.4,6,'#3a2a2a');box(e.px-.12,e.py-.12,6,.24,.24,3,'#ff6a2a',1.4);return}
  _ent746e(e)};
(function(){const st=document.createElement('style');st.textContent=`#ev46{position:fixed;left:50%;top:88px;transform:translateX(-50%);z-index:30;font:13px Georgia,serif;color:#fff4d0;background:rgba(40,24,6,.85);border:1px solid #ffd84a;border-radius:12px;padding:3px 12px;pointer-events:none;white-space:nowrap;max-width:94vw;overflow:hidden;text-overflow:ellipsis}body:not(.ig) #ev46{display:none}`;document.head.appendChild(st)})();
