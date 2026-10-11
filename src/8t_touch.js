/* ================= 7.9: comandi touch per telefoni e tablet =================
   Joystick a sinistra, pulsanti d'azione a destra (colpo, affondo, schiva, pozione, abilità, interagisci),
   menu a griglia al posto della ruota, chat a scomparsa, zoom con due dita.
   Si accendono da soli sugli schermi touch (Impostazioni → Comandi per sceglierlo a mano). */
const TCH={on:0,vis:0,jid:null,jx:0,jy:0,ox:0,oy:0,mag:0,pinch:new Map(),pd:0,menu:0,chat:0,lastIT:null,cdk:''};
const touchDev=()=>matchMedia('(pointer:coarse)').matches||(navigator.maxTouchPoints>0&&matchMedia('(hover:none)').matches);
const touchWanted=()=>SET.tch===1||(SET.tch!==2&&touchDev());
const icoU=n=>ICOS[n]?ICON(n,3).u:edIcoURL(n);
const tvib=ms=>{if(SET.tvib&&navigator.vibrate)try{navigator.vibrate(ms)}catch(e){}};
// direzione del joystick sullo schermo → direzione nel mondo isometrico (una casella è larga 64 e alta 32)
function touchDir(){if(!TCH.on||!TCH.vis||TCH.jid==null||TCH.mag<.18)return null;const wx=TCH.jx+2*TCH.jy,wy=2*TCH.jy-TCH.jx,d=Math.hypot(wx,wy);return d?[wx/d,wy/d]:null}
const _keyDir79=keyDir;keyDir=function(){return touchDir()||_keyDir79()};

function touchBuild(){if($('tc'))return;const el=document.createElement('div');el.id='tc';el.className='noico';
  const B=(id,ic,lab,cls='')=>`<button id="${id}" class="tb ${cls}" aria-label="${lab}"><img src="${ICON(ic,3).u}" alt=""><b>${lab}</b><i class="tcd"></i></button>`;
  el.innerHTML=`<div id="tjz"><div id="tjb"><div id="tjk"></div></div></div>
  <div id="tact">${B('t-area','esplosione','Colpo','big')}${B('t-lunge','pugnale','Affondo')}${B('t-dodge','vortice','Schiva')}${B('t-pot','pozione','Pozione')}<span id="t-potn"></span></div>
  <div id="tsk"></div>
  <button id="t-use" class="tuse" hidden><img alt=""><b></b></button>
  <button id="t-menu" class="tmenu" aria-label="Menu"><img src="${ICON('zaino',3).u}" alt=""><b>Menu</b></button>
  <div id="tmn" hidden><div class="tmb"></div></div>`;
  document.body.appendChild(el);
  const hold=(id,down,up)=>{const b=$(id);b.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();auInit();b.classList.add('pr');tvib(12);down()});
    const u=()=>{b.classList.remove('pr');if(up)up()};b.addEventListener('pointerup',u);b.addEventListener('pointercancel',u);b.addEventListener('pointerleave',u);b.addEventListener('contextmenu',e=>e.preventDefault())};
  hold('t-area',()=>area(),()=>{if(typeof NAV!=='undefined'&&NAV&&Zk==='mare')navHold(0);if(FSH&&PM==='fish')fishKey(0)});
  hold('t-lunge',()=>lunge());hold('t-dodge',()=>dodge());hold('t-pot',()=>pot());
  hold('t-use',()=>{const e=TCH.lastIT;if(e&&ents.includes(e)){P.path=[];P.tg=null;act(e)}});
  hold('t-menu',()=>touchMenu(!TCH.menu));
  $('tmn').addEventListener('pointerdown',e=>{if(e.target.id==='tmn')touchMenu(0)});
  // joystick: si tocca un punto qualsiasi della zona in basso a sinistra e il joystick parte da lì
  const z=$('tjz');z.addEventListener('pointerdown',e=>{if(TCH.jid!=null)return;e.preventDefault();e.stopPropagation();auInit();z.setPointerCapture(e.pointerId);TCH.jid=e.pointerId;
    const r=z.getBoundingClientRect(),R=touchR();TCH.ox=clamp(e.clientX,r.left+R,r.right-R);TCH.oy=clamp(e.clientY,r.top+R,r.bottom-R);TCH.jx=TCH.jy=TCH.mag=0;P.path=[];P.tg=null;touchStick(e);z.classList.add('on')});
  z.addEventListener('pointermove',e=>{if(e.pointerId===TCH.jid)touchStick(e)});
  const end=e=>{if(e.pointerId!==TCH.jid)return;TCH.jid=null;TCH.jx=TCH.jy=TCH.mag=0;z.classList.remove('on');touchStick(null)};
  z.addEventListener('pointerup',end);z.addEventListener('pointercancel',end);
  // chat: si apre dal menu e si richiude dopo l'invio
  $('ch').addEventListener('blur',()=>{if(TCH.on)setTimeout(()=>{if(document.activeElement!==$('ch'))touchChat(0)},150)})}
const touchR=()=>Math.round(52*(SET.tsz||100)/100);
function touchStick(e){const b=$('tjb'),k=$('tjk'),z=$('tjz');if(!b)return;const R=touchR();
  if(!e){b.style.transform='';k.style.transform='';return}
  let dx=e.clientX-TCH.ox,dy=e.clientY-TCH.oy;const d=Math.hypot(dx,dy);if(d>R){dx*=R/d;dy*=R/d}
  TCH.jx=dx/R;TCH.jy=dy/R;TCH.mag=Math.min(1,d/R);const r=z.getBoundingClientRect();
  b.style.transform=`translate(${TCH.ox-r.left-R}px,${TCH.oy-r.top-R}px)`;b.style.left=b.style.top='0';k.style.transform=`translate(${dx}px,${dy}px)`}

// menu a griglia (le stesse voci della ruota, più la chat e l'aspetto dell'eroe)
const TMENU=[['zaino','Zaino',()=>tog('inv')],['pergamena','Missioni',()=>tog('q')],['libro','Diario',()=>tog('dia')],['mappa','Mappa',()=>openMap()],
  ['pennello','Aspetto',()=>openLook()],['trofeo','Classifica',()=>tog('lb')],['gente','Giocatori',()=>tog('who')],['speech','Chat',()=>touchChat(1)],['ingranaggio','Opzioni',()=>openSet()]];
function touchMenu(on){TCH.menu=on?1:0;const m=$('tmn');if(!m)return;if(on){const b=m.querySelector('.tmb');
    b.innerHTML=TMENU.map(([ic,n],i)=>`<button data-i="${i}"><img src="${icoU(ic)}" alt=""><b>${n}</b></button>`).join('');
    b.querySelectorAll('button').forEach(x=>x.onclick=ev=>{ev.stopPropagation();touchMenu(0);TMENU[+x.dataset.i][2]()})}
  m.hidden=!on;document.body.classList.toggle('tmenu-on',!!on)}
function touchChat(on){TCH.chat=on?1:0;document.body.classList.toggle('tchat',!!on);if(on){const c=$('ch');c.focus();$('cl').classList.add('on')}}

// abilità imparate: un pulsante ciascuna, con la ricarica
function touchSkills(){const el=$('tsk');if(!el||!P||!P.skl)return;const L=SKL.filter(s=>P.skl[s.id]);P.skc=P.skc||{};
  const sig=L.map(s=>s.id).join();if(el.dataset.sig!==sig){el.dataset.sig=sig;el.innerHTML=L.map(s=>`<button class="tb sm" data-s="${SKL.indexOf(s)}" aria-label="${esc(s.n)}"><img src="${ICON('stella',3).u}" alt=""><b>${esc(s.n.split(' ')[0])}</b><i class="tcd"></i></button>`).join('');
    el.querySelectorAll('button').forEach(b=>b.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();tvib(12);useSkill(+b.dataset.s)}))}
  el.querySelectorAll('button').forEach(b=>{const s=SKL[+b.dataset.s],v=Math.max(0,(P.skc[s.id]||0)-t);touchCd(b,v,s.cd)})}
function touchCd(b,v,m){const p=v>0?Math.min(100,v/m*100):0,lab=v>0?(v>=1?Math.ceil(v)+'':v.toFixed(1)):'';const key=Math.round(p)+lab;if(b._k===key)return;b._k=key;b.style.setProperty('--cd',p+'%');b.querySelector('.tcd').textContent=lab;b.classList.toggle('cool',v>0)}

// cosa dice il pulsante «usa» in base a quello che hai vicino
const TUSE={npc:['Parla','gente'],po:['Entra','vortice'],ch:['Apri','forziere'],dr:['Raccogli','mano'],shard:['Prendi','frammento'],lore:['Leggi','pagina'],board:['Leggi','pergamena'],res:['Raccogli','mano'],fs:['Pesca','fish'],stash:['Baule','forziere'],letto:['Dormi','luna'],c100:['Prendi','oro'],reliq:['Prendi','frammento'],shard7:['Prendi','frammento']};
function touchTick(){if(!TCH.on)return;const hide=!started||PM||document.body.classList.contains('dlgo')||document.body.classList.contains('tour')||document.body.classList.contains('abin')||document.body.classList.contains('batt')||document.body.classList.contains('edcine')||document.body.classList.contains('edm')
    ||(typeof CN!=='undefined'&&CN)||(typeof INTRO!=='undefined'&&INTRO)||(typeof DREAM!=='undefined'&&DREAM)||($('mappa')&&$('mappa').style.display==='flex')||$('set').style.display==='block'||$('look').style.display==='block';
  const vis=hide?0:1;if(vis!==TCH.vis){TCH.vis=vis;document.body.classList.toggle('tcoff',!vis);if(!vis){TCH.jid=null;TCH.jx=TCH.jy=TCH.mag=0;touchStick(null);if(TCH.menu)touchMenu(0)}}
  if(!vis)return;
  for(const[id,f,m]of CDB){const b=$('t'+id.slice(1));if(b)touchCd(b,Math.max(0,f()||0),m())}
  const pn2=$('t-potn');if(pn2&&pn2.textContent!==String(P.pot))pn2.textContent=P.pot;$('t-pot').classList.toggle('dis',P.pot<=0);
  touchSkills();
  const u=$('t-use'),e=typeof IT!=='undefined'?IT:null;if(e!==TCH.lastIT){TCH.lastIT=e;if(!e)u.hidden=true;else{const d=TUSE[e.k]||['Usa','mano'];u.hidden=false;u.querySelector('img').src=icoU(d[1]);
      u.querySelector('b').textContent=d[0]+(e.n&&e.k!=='dr'?' · '+String(e.n).split(' · ')[0].slice(0,22):'')}}}
setInterval(touchTick,100);

// zoom con due dita sulla mappa del gioco
(function(){const pts=TCH.pinch;let d0=0,s0=1;
  cv.addEventListener('pointerdown',e=>{if(!TCH.on||e.pointerType!=='touch')return;pts.set(e.pointerId,[e.clientX,e.clientY]);if(pts.size===2){const[a,b]=[...pts.values()];d0=Math.hypot(a[0]-b[0],a[1]-b[1]);s0=SZ;P.path=[];P.tg=null}},true);
  cv.addEventListener('pointermove',e=>{if(!pts.has(e.pointerId))return;pts.set(e.pointerId,[e.clientX,e.clientY]);if(pts.size===2&&d0>10){const[a,b]=[...pts.values()];SZ=clamp(s0*Math.hypot(a[0]-b[0],a[1]-b[1])/d0,.55,1.9)}});
  const up=e=>{pts.delete(e.pointerId);if(pts.size<2)d0=0};addEventListener('pointerup',up);addEventListener('pointercancel',up)})();
// tocco sulla minimappa: apre la mappa grande
(function(){const m=$('mm');if(m)m.addEventListener('click',()=>{if(TCH.on&&started)openMap()})})();

function touchApply(){const on=touchWanted()?1:0;TCH.on=on;document.body.classList.toggle('touch',!!on);document.body.classList.toggle('tlh',!!(on&&SET.tlh));
  document.documentElement.style.setProperty('--tsz',(SET.tsz||100)/100);if(on)touchBuild();else{touchMenu(0);touchChat(0)}TCH.vis=-1;
  if(typeof wheelApply==='function')wheelApply()}
const _applySet79=applySet;applySet=function(k){_applySet79(k);if(!k||/^t(ch|sz|lh|vib)$/.test(k))touchApply()};
const _wheelApply79=wheelApply;wheelApply=function(){_wheelApply79();if(TCH.on){const r=$('ruota'),b=$('bar');if(r)r.style.display='none';if(b)b.style.display='none'}};
matchMedia('(pointer:coarse)').addEventListener?.('change',()=>touchApply());
touchApply();
// l'ultima tappa del giro della città spiega i comandi touch invece dei tasti
(function(){const s=TOURS&&TOURS.find(x=>x.ti==='Pronto a partire');if(s){const k=s.tx;Object.defineProperty(s,'tx',{get:()=>TCH.on?'Menu: zaino, missioni, diario, mappa, chat e opzioni. Il joystick in basso a sinistra ti muove, i pulsanti a destra combattono. Il primo passo è il castello del Re. Buona avventura!':k})}})();

(function(){const st=document.createElement('style');st.textContent=`
#tc{display:none}body.touch.ig #tc{display:block}body.touch.tcoff #tc{display:none}
body.touch #ruota,body.touch #bar{display:none!important}
#tc{--s:var(--tsz,1);position:fixed;inset:0;pointer-events:none;z-index:6;font:12px Georgia,serif;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}
#tc button{pointer-events:auto;touch-action:none;-webkit-tap-highlight-color:transparent;margin:0}
#tjz{position:absolute;left:0;bottom:0;width:calc(48vw);max-width:330px;height:calc(170px * var(--s) + env(safe-area-inset-bottom,0px));pointer-events:auto;touch-action:none}
#tjb{position:absolute;left:calc(24px * var(--s));top:calc(100% - 136px * var(--s) - env(safe-area-inset-bottom,0px));width:calc(104px * var(--s));height:calc(104px * var(--s));border-radius:50%;
  background:radial-gradient(circle,#1b2030aa 55%,#1b203066);border:2px solid #f5b94299;box-shadow:0 4px 0 #0007,inset 0 0 18px #0008;opacity:.75;transition:opacity .2s}
#tjz.on #tjb{opacity:1;transition:none}
#tjk{position:absolute;left:50%;top:50%;width:calc(46px * var(--s));height:calc(46px * var(--s));margin:calc(-23px * var(--s));border-radius:50%;background:radial-gradient(circle at 35% 30%,#ffe3a0,#f5b942 55%,#b8801a);border:2px solid #fff3c4;box-shadow:0 3px 0 #6a4a16,0 4px 10px #0008}
.tb{position:absolute;width:calc(56px * var(--s));height:calc(56px * var(--s));border-radius:50%;padding:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0;
  background:radial-gradient(circle at 50% 35%,#3b4770,#1b2030);border:2px solid #f5b942bb;color:#fff;box-shadow:0 4px 0 #0009,0 6px 14px #0006;overflow:hidden}
.tb img{width:calc(26px * var(--s));height:calc(26px * var(--s));image-rendering:pixelated;position:relative;z-index:1}.tb b{font-size:calc(9.5px * var(--s));font-weight:normal;line-height:1;margin-top:1px;position:relative;z-index:1;text-shadow:0 1px 2px #000}
.tb.big{width:calc(84px * var(--s));height:calc(84px * var(--s));background:radial-gradient(circle at 50% 35%,#b8402c,#6a1c14);border-color:#ffd27a}.tb.big img{width:calc(38px * var(--s));height:calc(38px * var(--s))}.tb.big b{font-size:calc(11px * var(--s))}
.tb.pr{transform:translateY(3px) scale(.96);box-shadow:0 1px 0 #0009}
.tb::before{content:'';position:absolute;inset:0;background:conic-gradient(#000a var(--cd,0%),transparent 0);z-index:2;pointer-events:none}
.tb .tcd{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font:bold calc(17px * var(--s)) Georgia,serif;font-style:normal;color:#fff;text-shadow:0 2px 3px #000;z-index:3;pointer-events:none}
.tb.cool img{opacity:.55}.tb.dis{filter:grayscale(1) brightness(.7)}
#tact{position:absolute;right:calc(14px + env(safe-area-inset-right,0px));bottom:calc(18px + env(safe-area-inset-bottom,0px));width:calc(170px * var(--s));height:calc(170px * var(--s))}
#t-area{right:calc(6px * var(--s));bottom:calc(6px * var(--s))}
#t-lunge{right:calc(100px * var(--s));bottom:calc(4px * var(--s))}
#t-dodge{right:calc(92px * var(--s));bottom:calc(68px * var(--s))}
#t-pot{right:calc(30px * var(--s));bottom:calc(100px * var(--s))}
#t-potn{position:absolute;right:calc(24px * var(--s));bottom:calc(144px * var(--s));min-width:18px;padding:0 5px;border-radius:9px;background:#e8484f;color:#fff;font:bold 11px Georgia,serif;text-align:center;line-height:18px;box-shadow:0 2px 0 #0008;z-index:4}
#tsk{position:absolute;right:calc(14px + env(safe-area-inset-right,0px));bottom:calc(200px * var(--s) + env(safe-area-inset-bottom,0px));display:flex;flex-direction:column;gap:6px;align-items:flex-end}
#tsk .tb{position:relative;width:calc(48px * var(--s));height:calc(48px * var(--s));background:radial-gradient(circle at 50% 35%,#5a3a8a,#24163c);border-color:#c8a8ff}
.tuse{position:absolute;right:calc(14px + env(safe-area-inset-right,0px));bottom:calc(196px * var(--s) + env(safe-area-inset-bottom,0px));max-width:min(62vw,300px);display:flex;align-items:center;gap:6px;padding:6px 14px 6px 8px;border-radius:24px;
  background:linear-gradient(180deg,#4cd07a,#2a8a4a);border:2px solid #c8ffd8;color:#fff;font:bold calc(14px * var(--s)) Georgia,serif;box-shadow:0 4px 0 #0f4a24,0 8px 16px #0007;animation:tuse .25s ease-out}
.tuse img{width:calc(24px * var(--s));height:calc(24px * var(--s));image-rendering:pixelated;flex-shrink:0}.tuse b{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-shadow:0 1px 2px #0008}
.tuse[hidden]{display:none}@keyframes tuse{from{transform:scale(.7);opacity:0}}
body.touch #tsk:not(:empty)~.tuse{right:calc(78px * var(--s) + env(safe-area-inset-right,0px))}
.tmenu{position:absolute;left:50%;bottom:calc(14px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);width:calc(58px * var(--s));height:calc(58px * var(--s));border-radius:14px;padding:0;display:flex;flex-direction:column;align-items:center;justify-content:center;
  background:linear-gradient(180deg,#86603b,#5e3f25 60%,#4a301b);border:2px solid #f5b942;color:#ffd27a;box-shadow:0 4px 0 #2e1d10,0 6px 14px #0007}
.tmenu img{width:calc(28px * var(--s));height:calc(28px * var(--s));image-rendering:pixelated}.tmenu b{font-size:calc(10px * var(--s));font-weight:normal}
#tmn{position:fixed;inset:0;background:#05070fa6;pointer-events:auto;display:flex;align-items:flex-end;justify-content:center;padding-bottom:calc(84px * var(--s) + env(safe-area-inset-bottom,0px));z-index:7}#tmn[hidden]{display:none}
.tmb{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;width:min(340px,92vw);padding:12px;background:var(--pn);border:2px solid var(--ac);border-radius:6px;box-shadow:0 0 0 3px #4a301b,0 8px 0 3px #2e1d10,0 18px 40px #000b;animation:tmn .2s ease-out}
.tmb button{display:flex;flex-direction:column;align-items:center;gap:4px;padding:10px 4px;margin:0;border-radius:4px;color:#fff;box-shadow:0 3px 0 #0009}.tmb img{width:32px;height:32px;image-rendering:pixelated}.tmb b{font-weight:normal;font-size:13px}
@keyframes tmn{from{transform:translateY(30px);opacity:0}}
body.touch #ch{display:none}body.touch.tchat #ch{display:block}
body.touch #chw{left:calc(10px + env(safe-area-inset-left,0px))!important;top:auto!important;right:auto!important;bottom:calc(178px * var(--tsz,1) + env(safe-area-inset-bottom,0px))!important;width:min(62vw,280px)!important;transform:none!important}
body.touch #cl{max-height:84px;font-size:11px}
body.touch.tchat #chw{bottom:calc(50vh)!important;z-index:8}
body.touch.tlh #tjz{left:auto;right:0}body.touch.tlh #tjb{left:auto;right:calc(24px * var(--s))}
body.touch.tlh #tact{right:auto;left:calc(14px + env(safe-area-inset-left,0px));transform:scaleX(-1)}body.touch.tlh #tact .tb,body.touch.tlh #t-potn{transform:scaleX(-1)}body.touch.tlh #tact .tb.pr{transform:scaleX(-1) translateY(3px) scale(.96)}
body.touch.tlh #tsk,body.touch.tlh .tuse{right:auto;left:calc(14px + env(safe-area-inset-left,0px))}body.touch.tlh #tsk{align-items:flex-start}body.touch.tlh #tsk:not(:empty)~.tuse{right:auto;left:calc(78px * var(--s))}
body.touch.tlh #chw{left:auto!important;right:calc(10px + env(safe-area-inset-right,0px))!important}
@media (orientation:landscape) and (max-height:500px){#tc{--s:calc(var(--tsz,1) * .82)}body.touch #chw{bottom:calc(8px + env(safe-area-inset-bottom,0px))!important;left:calc(150px * var(--tsz,1))!important;width:min(34vw,260px)!important}
  body.touch #cl{max-height:64px}#tjz{height:calc(150px * var(--s))}}
body.touch kbd{display:none}
@media (orientation:portrait),(max-width:560px){.tmenu{left:calc(10px + env(safe-area-inset-left,0px));bottom:auto;top:calc(108px + env(safe-area-inset-top,0px));transform:none;width:calc(48px * var(--s));height:calc(48px * var(--s));border-radius:10px}.tmenu img{width:calc(24px * var(--s));height:calc(24px * var(--s))}
  #tmn{align-items:flex-start;padding:calc(164px + env(safe-area-inset-top,0px)) 0 0}body.touch.tlh .tmenu{left:auto;right:calc(10px + env(safe-area-inset-right,0px))}}
body.touch #devfab{bottom:auto;right:auto;top:calc(108px + env(safe-area-inset-top,0px));left:calc(70px * var(--tsz,1))}
@media (orientation:landscape) and (min-width:561px){body.touch #devfab{top:auto;left:auto;right:10px;bottom:auto;top:calc(8px + env(safe-area-inset-top,0px));right:calc(50% - 300px)}}
@media (prefers-reduced-motion:reduce){.tuse,.tmb{animation:none}}
`;document.head.appendChild(st)})();
