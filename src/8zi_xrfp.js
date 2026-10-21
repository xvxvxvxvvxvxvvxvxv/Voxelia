/* ================= realtà virtuale: prima persona =================
   Nel visore la telecamera sta negli occhi dell'eroe: il mondo è a grandezza naturale intorno a te, costruito con gli stessi
   modelli del gioco (le box() che il diorama annota, src/8zh_xr3d.js), con il cielo e la nebbia nei colori della zona.
   La levetta sinistra cammina nella direzione in cui guardi, la destra gira a scatti (o in modo continuo); camminare
   davvero nella stanza sposta l'eroe, e i muri lo fermano. In mano destra c'è l'arma equipaggiata (il suo modello del gioco),
   sul braccio sinistro lo scudo. Si attacca muovendo il controller: un fendente colpisce il nemico davanti, una stoccata
   in avanti è l'affondo, le due mani giù insieme sono il colpo ad area. L'interfaccia HTML del gioco (8zg_xrui.js) è un
   pannello sotto lo sguardo; finestre, dialoghi, negozi e mappa si aprono su un pannello davanti agli occhi e si usano
   con il raggio e il grilletto. Il menu della VR (grilletto sinistro nel vuoto) ha i pulsanti della barra e le opzioni di comfort.
   Durante i filmati, la navigazione e i minigiochi disegnati sul canvas si torna da soli allo schermo sospeso. */
const FP=Object.assign({on:1,rot:'s30',vig:1,spd:1,hud:1,seen:0,vd:24},LS.get('voxelia_xrfp',{}),
  {mode:'',menu:0,th:0,G:0,cal:1,hp:[0,1.6,0],hf:[0,-1],tf:[0,1],lh:null,sr:1,fid:0,dfid:-1,lt:0,dt:0,ax:null,mv:0,vv:0,snapT:0,
   win:0,wt:0,wp:null,hy:null,hfol:0,grip:{},hs:new Map(),pb:new Map(),gl:null,mdl:new Float32Array(16),vis:[],dn:0,fn:0,sn:0,ln:0,pn:0,spn:0,wk:'',sk:'',ut:0,uok:0,atl:null,ast:0,spr:[]});
const FPS=1.6,FPZ=.05,FPR=24;  // 1 casella = 1,6 m, 1 pixel d'altezza = 5 cm (l'eroe è alto circa 1,7 m), raggio di vista di base 24 caselle (FP.vd)
const FPI=new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]);
const fpSave=()=>LS.set('voxelia_xrfp',{on:FP.on,rot:FP.rot,vig:FP.vig,spd:FP.spd,hud:FP.hud,seen:FP.seen,vd:FP.vd});
const fpLive=()=>!!XR.s&&FP.mode==='fp';
// la prima persona vale quando si gioca a piedi; filmati, visita guidata, nave, pesca, scavi, duelli ed editor si vedono sullo schermo sospeso
const fpWant=()=>!!(FP.on&&started&&P&&M&&!(NAV&&Zk==='mare')&&!(FSH&&PM==='fish')&&PM!=='dig'&&PM!=='duel'&&!(typeof EDIT!=='undefined'&&EDIT)&&!(typeof TOUR!=='undefined'&&TOUR)&&!(typeof OCC!=='undefined'&&OCC&&OCC.intro));
const fpEye=()=>26.5*FPZ*([.92,1,1.08][P&&P.ap?P.ap.sz|0:1]||1);  // gli occhi dell'eroe sono a 26,5 pixel da terra

/* ---- da gioco a stanza: casella (x,y) e altezza z in pixel → metri nello spazio del visore, con la testa sopra l'eroe ---- */
function fpMat(){const c=Math.cos(FP.th),s=Math.sin(FP.th),m=FP.mdl,hx=FP.hp[0],hz=FP.hp[2];
  m[0]=c*FPS;m[1]=0;m[2]=-s*FPS;m[3]=0;m[4]=s*FPS;m[5]=0;m[6]=c*FPS;m[7]=0;m[8]=0;m[9]=FPZ;m[10]=0;m[11]=0;
  m[12]=hx-m[0]*P.px-m[4]*P.py;m[13]=FP.G;m[14]=hz-m[2]*P.px-m[6]*P.py;m[15]=1}
const fpRef=(x,y,z)=>{const m=FP.mdl;return[m[0]*x+m[4]*y+m[12],m[9]*z+m[13],m[2]*x+m[6]*y+m[14]]};
// direzione nella stanza (orizzontale) → direzione in caselle
const fpTileDir=(X,Z)=>{const c=Math.cos(FP.th),s=Math.sin(FP.th);return[(c*X-s*Z)/FPS,(s*X+c*Z)/FPS]};
function fpMul(a,b,o){for(let i=0;i<4;i++)for(let j=0;j<4;j++){let v=0;for(let k=0;k<4;k++)v+=a[k*4+j]*b[i*4+k];o[i*4+j]=v}return o}

/* ---- levetta sinistra: cammina dove guardi (avanti = sguardo), con la velocità analogica della levetta ---- */
function fpDir(){if(!fpLive())return null;const a=FP.ax;FP.mv=0;if(!a)return null;const m=Math.hypot(a[0],a[1]);if(m<.18)return null;
  const k=Math.min(1,(m-.18)/.72)*FP.spd,fx=FP.hf[0],fz=FP.hf[1],X=(-fz*a[0]-fx*a[1])/m,Z=(fx*a[0]-fz*a[1])/m,d=fpTileDir(X,Z),l=Math.hypot(d[0],d[1])||1;
  FP.mv=k;return[d[0]/l*k,d[1]/l*k]}
const _keyDirFP=keyDir;keyDir=function(){return fpDir()||_keyDirFP()};
// in prima persona il canvas isometrico non si disegna (e resta minuscolo): il mondo lo disegna WebGL
const _drawFP=draw;draw=function(){if(fpLive())return;_drawFP()};
const _rsFP=rs;rs=function(){_rsFP();if(fpLive()){cv.width=cv.height=4;lc=null;FC=null}};
// un clic del raggio che finisce sul canvas (zone vuote dell'interfaccia) non deve diventare «cammina fin lì»
const _xrClickFP=xrClick;xrClick=function(x,y){if(fpLive()&&!fpUiEl(x,y))return;_xrClickFP(x,y)};
const fpUiEl=(x,y)=>{const e=xrTarget(x,y);return e&&e!==cv&&e!==document.body&&e!==document.documentElement?e:null};
const fpOnUI=h=>!!(h&&h.in&&fpUiEl(h.x,h.y));
// l'affondo va verso il nemico davanti a te (o dritto avanti), non verso quello più vicino alle tue spalle
const _lungeFP=lunge;lunge=function(){if(!fpLive())return _lungeFP();const e=fpTarget(()=>7,35),f=FP.tf;
  P.tg=e||{k:'fp',px:P.px+f[0]*3,py:P.py+f[1]*3};try{_lungeFP()}finally{P.tg=null}};
const _xrStartFP=xrStart;xrStart=function(s){_xrStartFP(s);s.addEventListener('end',fpEnd)};
function fpEnd(){FP.mode='';FP.menu=0;FP.hs.clear();FP.pb.clear();FP.grip={};XR.noPan=0;fpMenuShow()}

/* ---- il nemico (o l'avversario nella fossa) davanti allo sguardo: entro la portata r(e), entro cono° dal centro ---- */
function fpTarget(r,cone){let best=null,bs=1e9;const f=FP.tf,fl=Math.hypot(f[0],f[1])||1,ca=Math.cos(cone*Math.PI/180),pit=inPit(P.px,P.py);
  const L=ents.filter(e=>e.k==='en');if(pit)for(const o of NET.list)if(inPit(o.px,o.py))L.push(o);
  for(const e of L){const dx=e.px-P.px,dy=e.py-P.py,d=Math.hypot(dx,dy);if(d>r(e))continue;const k=d>.05?(dx*f[0]+dy*f[1])/d/fl:1;if(d>.7&&k<ca)continue;
    const sc=d+(1-k)*3;if(sc<bs){bs=sc;best=e}}
  return best}
const fpReach=e=>MODE==='dim'?dimW().r:(e.boss||e.b&&e.b.pt?2.2:1.5)+.35;
// un colpo normale, come quando l'eroe attacca da solo il bersaglio cliccato (stessa cadenza, stessi danni)
function fpStrike(gp){if(!started||!P||P.hp<=0||P.dm)return;const e=fpTarget(fpReach,70);
  if(!e){if(!(P.wh>t)){P.wh=t+.3;whoosh()}xrPulse(gp,.12,12);return}
  if(P.at>0){xrPulse(gp,.1,10);return}
  const d=Math.hypot(e.px-P.px,e.py-P.py)||1;P.dr=[(e.px-P.px)/d,(e.py-P.py)/d];let cr=false;
  if(e.k==='pl'){P.at=.55;P.sw=.2;P.swc++;const r=roll();cr=r.cr;pvpHit(e,r.d,r.cr)}
  else if(MODE==='dim')dimShoot(e);
  else{P.at=.55;P.sw=.2;P.swc++;const r=roll();cr=r.cr;hurtE(e,r.d,0,r.cr)}
  xrPulse(gp,cr?1:.7,cr?90:45)}

/* ---- gesti: la velocità della mano (impugnatura del controller) decide fendente, stoccata e colpo ad area ---- */
function fpGesture(src,gp,fr,now){const sp=src.gripSpace&&fr.getPose(src.gripSpace,XR.ref);if(!sp){FP.grip[src.handedness]=null;return}
  const m=sp.transform.matrix,p=[m[12],m[13],m[14]];FP.grip[src.handedness]=m;let s=FP.hs.get(src);if(!s){s={p,t:now,v:[0,0,0],arm:1,sl:0};FP.hs.set(src,s)}
  const dt=(now-s.t)/1000;if(dt>0&&dt<.1)for(let i=0;i<3;i++)s.v[i]=s.v[i]*.45+(p[i]-s.p[i])/dt*.55;else s.v=[0,0,0];s.p=p;s.t=now;
  const v=s.v,spd=Math.hypot(v[0],v[1],v[2]);if(spd<.9){s.arm=1;return}if(!s.arm||!started||!P||P.hp<=0)return;
  // due mani giù insieme (entro un quarto di secondo): colpo ad area
  if(v[1]<-2&&-v[1]/spd>.8){s.sl=now;for(const[o,q]of FP.hs)if(o!==src&&now-q.sl<250){q.sl=0;s.sl=0;s.arm=q.arm=0;area();xrPulse(gp,.9,80);xrPulse(o.gamepad,.9,80);return}}
  // stoccata: la mano corre lungo il controller, in avanti
  const fw=[-m[8],-m[9],-m[10]],al=v[0]*fw[0]+v[1]*fw[1]+v[2]*fw[2];
  if(al>2.4&&al/spd>.8){s.arm=0;if(P.lgc>0){fpStrike(gp);return}lunge();xrPulse(gp,.8,60);return}
  if(spd>2.2){s.arm=0;fpStrike(gp)}}

/* ---- comandi in prima persona (per controller; rendono true così i comandi dello schermo sospeso non si applicano) ----
   grilletto: clic sull'interfaccia; nel vuoto il destro attacca e il sinistro apre il menu della VR
   levetta sinistra: cammina (premuta: mappa) · levetta destra: gira, su e giù su una finestra la scorre (premuta: rimette davanti i pannelli)
   impugnatura sinistra / destra: colpo ad area / affondo · X / Y: pozione / zaino · A / B: interagisci / chiudi o schiva */
const _xrHookFP=typeof xrInputHook==='function'?xrInputHook:null;
window.xrInputHook=function(src,gp,B,B0,ray,fr){const dn=i=>B[i]&&!B0[i],hd=src.handedness;
  if(!fpLive()){
    // anche sullo schermo sospeso il grilletto sinistro fuori dallo schermo apre il menu della VR (per tornare in prima persona)
    if(XR.s&&hd==='left'&&dn(0)&&!(ray&&ray.h&&ray.h.in)&&started){fpMenu(!FP.menu);xrPulse(gp,.3,20)}
    return _xrHookFP?_xrHookFP(src,gp,B,B0,ray,fr):false}
  // l'interfaccia sotto lo sguardo si guarda soltanto (i suoi comandi sono nel menu della VR): il raggio usa solo le finestre aperte
  if(ray){ray.h=FP.win?xrHit(ray.o,ray.d):null;const h=ray.h,on=h&&h.in;ray.ck=on?xrClickable(xrTarget(h.x,h.y)):null;ray.pk=on?null:fpPick(ray);
    ray.vis=ray.ck?h.t:ray.pk?ray.pk.t:0}
  const now=performance.now(),ax=gp.axes.length>=4?[gp.axes[2],gp.axes[3]]:[gp.axes[0]||0,gp.axes[1]||0],pk=ray&&ray.pk;
  if(dn(0)){const h=ray&&ray.h;if(fpOnUI(h)){XR.act=src;xrClick(h.x,h.y);xrPulse(gp)}else if(pk&&!(pk.e.k==='en'&&hd==='right')){fpUse(pk.e);xrPulse(gp,.3,25)}else if(hd==='left'){fpMenu(!FP.menu);xrPulse(gp,.3,20)}else fpStrike(gp)}
  if(hd==='left'){FP.ax=ax;
    if(dn(1))area();if(dn(4))pot();if(dn(5)){fpMenu(0);tog('inv')}if(dn(3)){$('mappa')&&$('mappa').style.display==='flex'?closeMap():(fpMenu(0),openMap())}}
  else{const x=ax[0];if(Math.abs(ax[1])>.25&&fpOnUI(ray&&ray.h))xrScroll(ray.h.x,ray.h.y,ax[1]);
    if(FP.rot==='lib'){if(Math.abs(x)>.2){FP.th+=Math.sign(x)*(Math.abs(x)-.2)/.8*2.2*FP.dt;FP.turn=Math.abs(x)}}
    else if(Math.abs(x)>.7&&FP.sr){FP.sr=0;FP.th+=Math.sign(x)*(FP.rot==='s45'?Math.PI/4:Math.PI/6);FP.snapT=now;xrPulse(gp,.15,10)}else if(Math.abs(x)<.35)FP.sr=1;
    if(dn(1))lunge();if(dn(4)){const e=pk&&pk.e.k!=='en'?pk.e:FP.ait;if(e)fpUse(e)}if(dn(5))fpBack();if(dn(3)){fpRecenter();xrPulse(gp,.5,40)}}
  if(dn(1)||dn(4)||dn(5))xrPulse(gp,.2,15);
  if(!fpOnUI(ray&&ray.h))fpGesture(src,gp,fr,now);else FP.grip[hd]=src.gripSpace&&fr.getPose(src.gripSpace,XR.ref)?fr.getPose(src.gripSpace,XR.ref).transform.matrix:null;
  return true};
/* ---- puntare il mondo: la persona, la porta o l'oggetto (o il nemico) più vicino al raggio, entro 9 caselle ---- */
function fpPick(r){if(!r||!P)return null;let best=null;
  for(const e of ents){if(!(ITK.has(e.k)||e.k==='en'))continue;if(Math.abs(e.px-P.px)>9||Math.abs(e.py-P.py)>9)continue;
    const c=fpRef(e.px,e.py,e.k==='npc'||e.k==='en'?26:e.k==='po'?30:12),q=[c[0]-r.o[0],c[1]-r.o[1],c[2]-r.o[2]],t=dot3(q,r.d);if(t<.2)continue;
    const d=Math.hypot(q[0]-r.d[0]*t,q[1]-r.d[1]*t,q[2]-r.d[2]*t);if(d<.3+t*.035&&(!best||t<best.t))best={e,t}}
  return best}
// la cosa con cui interagisce il tasto A: quella vicina (entro la portata del gioco) più davanti allo sguardo
function fpAim(){let best=null,bs=1e9;const f=FP.tf,fl=Math.hypot(f[0],f[1])||1;
  for(const e of ents){if(!ITK.has(e.k))continue;const dx=e.px-P.px,dy=e.py-P.py,d=Math.hypot(dx,dy);if(d>1.9)continue;const k=d>.05?(dx*f[0]+dy*f[1])/d/fl:1,sc=d+(1-k)*1.5;if(sc<bs){bs=sc;best=e}}
  return best||IT}
// interagire: vicino si usa subito, lontano l'eroe ci va da solo (come con il clic del mouse) e poi lo usa
function fpUse(e){if(!e||!started||!P||P.hp<=0)return;if(e.k==='en'){P.tg=null;return}fpMenu(0);
  if(Math.hypot(e.px-P.px,e.py-P.py)<=1.7){P.path=[];P.tg=null;act(e)}else{P.tg=e;P.rp=0}}
function fpBack(){if(FP.menu){fpMenu(0);return}const mp=$('mappa');if(mp&&mp.style.display==='flex'){closeMap();return}if(PM){cl();return}dodge()}
function fpRecenter(){FP.wp=null;FP.hy=null}

/* ---- ogni fotogramma, prima dei comandi: testa, modalità, camminata vera nella stanza, pannelli ---- */
const _xrInputFP=xrInput;xrInput=function(fr){fpPre(fr);_xrInputFP(fr)};
function fpPre(fr){const now=performance.now();FP.dt=Math.min(.1,(now-(FP.lt||now))/1000);FP.lt=now;FP.fid++;FP.ax=null;FP.turn=0;
  const pose=fr.getViewerPose(XR.ref);if(!pose)return;const m=pose.transform.matrix,hp=[m[12],m[13],m[14]];let fx=-m[8],fz=-m[10];const l=Math.hypot(fx,fz);
  if(l>.05){fx/=l;fz/=l;FP.hf=[fx,fz]}
  const w=fpWant()?'fp':'scr';if(w!==FP.mode)fpSwitch(w);
  if(FP.mode!=='fp'){FP.hp=hp;return}
  if(FP.cal){FP.cal=0;FP.G=hp[1]-fpEye()}
  // i passi veri nella stanza spostano l'eroe (con i muri del gioco); un salto del tracciamento oltre mezzo metro si ignora
  if(FP.lh&&P.hp>0&&!P.dm){const dX=hp[0]-FP.lh[0],dZ=hp[2]-FP.lh[2];if(Math.hypot(dX,dZ)<.5){const d=fpTileDir(dX,dZ);mv(P,d[0],d[1])}}
  FP.lh=hp;FP.hp=hp;FP.tf=fpTileDir(FP.hf[0],FP.hf[1]);
  // l'eroe guarda dove guardi tu (gli altri giocatori lo vedono girato così); i bersagli automatici non lo trascinano in giro
  if(!P.dm){const f=FP.tf,d=Math.hypot(f[0],f[1])||1;P.dr=[f[0]/d,f[1]/d];if(!P.km)P.fc=faceOf(P.dr[0],P.dr[1])}
  if(P.tg&&(P.tg.k==='en'||P.tg.k==='pl'))P.tg=null;
  FP.ait=fpAim();
  if(now-FP.wt>150){FP.wt=now;FP.win=fpWinOpen()}
  fpPanels(hp)}
function fpSwitch(w){FP.mode=w;FP.lh=null;FP.wp=null;FP.hy=null;FP.hs.clear();
  if(w==='fp'){XR.noPan=1;FP.cal=1;if(!FP.seen){FP.seen=1;fpSave();setTimeout(()=>{if(fpLive())fpMenu(1)},600)}}
  else{XR.noPan=0;XR.pan=null}
  rs()}
const fpVis=id=>{const e=$(id);return!!(e&&e.isConnected&&getComputedStyle(e).display!=='none'&&e.getClientRects().length)};
const fpWinOpen=()=>!!(FP.menu||(PM&&fpVis('pn'))||fpVis('mappa')||fpVis('set')||fpVis('look')||fpVis('chg')||fpVis('hude'));

/* ---- pannelli: l'interfaccia sotto lo sguardo (segue la testa con calma) e le finestre davanti agli occhi ----
   XR.pan è il pannello che il raggio colpisce: così puntamento, clic e cursore restano quelli di src/8zf_xr.js */
function fpPan(c,f,h,up){const w=h*W/Math.max(1,H),r=[-f[1],0,f[0]];let n=[-f[0],0,-f[1]],u=[0,1,0];
  if(up){n=[FP.hp[0]-c[0],FP.hp[1]-c[1],FP.hp[2]-c[2]];const l=Math.hypot(...n)||1;n=n.map(v=>v/l);u=[n[1]*r[2]-n[2]*r[1],n[2]*r[0]-n[0]*r[2],n[0]*r[1]-n[1]*r[0]];const k=Math.hypot(...u)||1;u=u.map(v=>v/k)}
  return{c,r,u,n,w,h,asp:W/H}}
function fpPanels(hp){const f=FP.hf;
  if(FP.win){if(!FP.wp)FP.wp=fpPan([hp[0]+f[0]*1.6,hp[1]-.05,hp[2]+f[1]*1.6],f,1.1,0);XR.pan=FP.wp;return}
  FP.wp=null;
  if(!FP.hud){XR.pan={c:[0,-99,0],r:[1,0,0],u:[0,1,0],n:[0,0,0],w:1,h:1,asp:W/H};return}
  const hy=Math.atan2(f[1],f[0]);if(FP.hy==null)FP.hy=hy;let d=hy-FP.hy;d=Math.atan2(Math.sin(d),Math.cos(d));
  if(Math.abs(d)>.6)FP.hfol=1;if(FP.hfol){FP.hy+=d*Math.min(1,FP.dt*4);if(Math.abs(d)<.05)FP.hfol=0}
  const g=[Math.cos(FP.hy),Math.sin(FP.hy)];XR.pan=fpPan([hp[0]+g[0]*.95,hp[1]-.52,hp[2]+g[1]*.95],g,.56,1)}

/* ---- menu della VR: un pannello HTML del gioco (stessi stili e icone), quindi si vede e si clicca come le altre finestre ---- */
const FPROT={s30:'a scatti di 30°',s45:'a scatti di 45°',lib:'continua'},FPSPD={1:'100%',.7:'70%',.5:'50%'},FPVIG=['no','leggera','media','forte'],FPVD={16:'vicina',24:'media',32:'lontana',40:'massima'};
function fpMenu(on){FP.menu=on?1:0;fpMenuShow();FP.wt=0}
function fpMenuShow(){let el=$('xrfp');
  if(!el){if(!FP.menu)return;const st=document.createElement('style');st.textContent='#xrfp{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);width:min(600px,94vw);max-height:88%;overflow:auto;background:var(--pn);border:2px solid var(--ac);padding:10px 14px;box-sizing:border-box;box-shadow:0 10px 40px #0009;color:var(--fg);z-index:60;display:none}#xrfp.on{display:block}#xrfp h3,#xrfp h4{margin:6px 0}#xrfp .xr{display:flex;flex-wrap:wrap;gap:4px}#xrfp .xr button{margin:0}#xrfp table{border-collapse:collapse;font-size:13px;width:100%}#xrfp td{padding:2px 6px;border-top:1px solid #fff2}#xrfp td:first-child{opacity:.85;white-space:nowrap}';
    document.head.appendChild(st);el=document.createElement('div');el.id='xrfp';document.body.appendChild(el)}
  el.classList.toggle('on',!!FP.menu);if(!FP.menu)return;
  const bar=[...document.querySelectorAll('#bar>button')].map(b=>{const k=b.cloneNode(true);k.removeAttribute('id');k.setAttribute('onclick','fpMenu(0);'+(b.getAttribute('onclick')||''));return k.outerHTML}).join('');
  const lv=fpLive(),opt=(k,l,v)=>`<button onclick="fpOpt('${k}')">${l}: <b>${v}</b></button>`;
  el.innerHTML=`<h3>${ico('gamepad',20)} Realtà virtuale</h3><div class="xr">${bar}<button onclick="fpMenu(0);pot()">${ico('pozione',20)} Pozione</button></div>
<h4>Vista e comfort</h4><div class="xr">${opt('on','Prima persona',FP.on?'sì':'no (schermo sospeso)')}${opt('rot','Rotazione',FPROT[FP.rot]||FPROT.s30)}${opt('vig','Vignetta in movimento',FPVIG[FP.vig|0]||'leggera')}${opt('vd','Distanza di visuale',FPVD[FP.vd]||'media')}${opt('spd','Velocità',FPSPD[FP.spd]||'100%')}${opt('hud','Interfaccia',FP.hud?'sotto lo sguardo':'nascosta')}
<button onclick="fpOpt('cal')">Ricalibra l'altezza degli occhi</button><button onclick="fpOpt('rc')">Rimetti davanti i pannelli</button>${!lv&&FP.on?'<button onclick="fpMenu(0)">La prima persona torna a fine filmato, nave o minigioco</button>':''}</div>
<h4>Comandi</h4><table><tr><td>Attaccare</td><td>Muovi il controller destro (fendente) · grilletto destro sul nemico davanti</td></tr><tr><td>Affondo</td><td>Stoccata in avanti con il controller · impugnatura destra</td></tr><tr><td>Colpo ad area</td><td>Le due mani giù insieme · impugnatura sinistra</td></tr><tr><td>Camminare / girarsi</td><td>Levetta sinistra (o cammina nella stanza) / levetta destra</td></tr><tr><td>Interagire</td><td>Punta con il raggio una persona, una porta o un oggetto e premi il grilletto (o A); A da solo usa quello che hai davanti</td></tr><tr><td>Schivata / chiudere</td><td>B</td></tr><tr><td>Pozione / zaino</td><td>X / Y</td></tr><tr><td>Mappa</td><td>Premi la levetta sinistra</td></tr><tr><td>Finestre e menu</td><td>Punta con il raggio e premi il grilletto · levetta destra su o giù: scorre · grilletto sinistro nel vuoto: questo menu</td></tr></table>
<div class="xr" style="margin-top:8px"><button onclick="fpMenu(0)">Chiudi</button></div>`}
function fpOpt(k){if(k==='on')FP.on=FP.on?0:1;else if(k==='rot'){const o=Object.keys(FPROT);FP.rot=o[(o.indexOf(FP.rot)+1)%o.length]}else if(k==='vig')FP.vig=((FP.vig|0)+1)%4;else if(k==='vd'){const o=[16,24,32,40];FP.vd=o[(o.indexOf(FP.vd)+1)%o.length]}
  else if(k==='spd')FP.spd=FP.spd>=1?.7:FP.spd>=.7?.5:1;else if(k==='hud')FP.hud=FP.hud?0:1;else if(k==='cal'){FP.cal=1;msg('Altezza ricalibrata: ora vedi dagli occhi dell\'eroe')}else if(k==='rc')fpRecenter();
  fpSave();fpMenuShow()}

/* ---- WebGL: uno shader a colori per vertice (mondo, cielo, armi, effetti, raggi) con nebbia e notte, uno con texture (pannelli, scritte) ---- */
function fpProg(gl,vs,fs,at){const p=gl.createProgram();
  for(const[tp,src]of[[gl.VERTEX_SHADER,vs],[gl.FRAGMENT_SHADER,fs]]){const s=gl.createShader(tp);gl.shaderSource(s,'#version 300 es\nprecision highp float;\n'+src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))console.warn('xrfp',gl.getShaderInfoLog(s));gl.attachShader(p,s)}
  at.forEach((a,i)=>gl.bindAttribLocation(p,i,a));gl.linkProgram(p);const u={};const n=gl.getProgramParameter(p,gl.ACTIVE_UNIFORMS);for(let i=0;i<n;i++){const k=gl.getActiveUniform(p,i).name;u[k]=gl.getUniformLocation(p,k)}return{p,u}}
function fpGL(gl){FP.gl=gl;if(X3.gl!==gl)x3GL(gl);
  FP.pc=fpProg(gl,'uniform mat4 P,V,Mdl;in vec3 a;in vec4 c;out vec4 vc;out float vd;void main(){vec4 e=V*Mdl*vec4(a,1.);vc=c;vd=length(e.xyz);gl_Position=P*e;}',
    'uniform vec3 F;uniform vec2 FD;uniform float NK,A;in vec4 vc;in float vd;out vec4 o;void main(){vec3 k=mix(vc.rgb,F,clamp((vd-FD.x)/(FD.y-FD.x),0.,1.));k=mix(k,k*vec3(.32,.38,.62),NK*.75);o=vec4(k,vc.a*A);}',['a','c']);
  FP.pt=fpProg(gl,'uniform mat4 P,V;in vec3 a;in vec2 u;out vec2 v;void main(){v=u;gl_Position=P*V*vec4(a,1.);}','uniform sampler2D T;uniform vec4 K;in vec2 v;out vec4 o;void main(){o=texture(T,v)*K;}',['a','u']);
  FP.vao=gl.createVertexArray();for(const k of['db','fb','lb','kb','vb','wb','sb','qb','tb','ob'])FP[k]=gl.createBuffer();
  const tx=()=>{const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);return t};
  FP.ut=0;FP.uok=0;FP.utx=tx();FP.atx=tx();FP.ast=0;FP.wk='';FP.sk='';fpVig(gl)}
// vertici a colori: 16 byte (x,y,z float + r,g,b,a byte), lo stesso formato del diorama
const FPB={b:new ArrayBuffer(1<<16)};
function fpBuf(n){if(FPB.b.byteLength<n){let s=FPB.b.byteLength;while(s<n)s*=2;FPB.b=new ArrayBuffer(s)}FPB.F=new Float32Array(FPB.b);FPB.U=new Uint8Array(FPB.b);return FPB}
function fpV(o,x,y,z,c,a){const v=o>>2,F=FPB.F,U=FPB.U;F[v]=x;F[v+1]=y;F[v+2]=z;U[o+12]=c[0];U[o+13]=c[1];U[o+14]=c[2];U[o+15]=a;return o+16}
function fpUp(gl,buf,n,dyn){gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Uint8Array(FPB.b,0,n),dyn?gl.STREAM_DRAW:gl.STATIC_DRAW);return n>>4}
const fpRGB=c=>{const k=x3Col(c);return[k[0],k[1],k[2]]};

/* ---- cielo: una cupola con i tre colori del cielo della zona (gli stessi di drawSky, sera e notte comprese); al chiuso il colore di fondo ---- */
function fpSky(gl){const out=SET.sky!==0&&SKY[Zk],dk=Math.round(Math.max(DK,NK*.3)*20)/20,dark=DARKZ.has(Zk),key=Zk+'|'+dk+'|'+(out?1:0)+(dark?1:0);
  if(key!==FP.sk){FP.sk=key;let C;if(dark)C=[[0,0,0],[0,0,0],[0,0,0]];else if(out){const s=SKY[Zk];C=[0,1,2].map(i=>fpRGB(mixC(s[i],SKD[i],dk)))}else{const b=fpRGB(ZZ.bg||'#20242c');C=[b,b,b]}
    FP.fog=C[2].map(v=>v/255);
    const EL=[-90,-4,0,4,9,15,22,30,40,52,66,90].map(d=>d*Math.PI/180),sm=k=>k*k*(3-2*k),col=e=>{const lerp=(a,b,k)=>a.map((v,i)=>v+(b[i]-v)*sm(k));if(e<=0)return C[2].map(v=>v*.82);if(e<.3)return lerp(C[2],C[1],e/.3);return lerp(C[1],C[0],Math.min(1,(e-.3)/1.1))};
    const S=24,R=80;fpBuf((EL.length-1)*S*6*16);let o=0;
    for(let j=0;j<EL.length-1;j++)for(let i=0;i<S;i++){const a0=i/S*6.2832,a1=(i+1)/S*6.2832,e0=EL[j],e1=EL[j+1],c0=col(e0),c1=col(e1),pt=(a,e)=>[Math.cos(a)*Math.cos(e)*R,Math.sin(e)*R,Math.sin(a)*Math.cos(e)*R];
      const A=pt(a0,e0),B=pt(a1,e0),C2=pt(a1,e1),D=pt(a0,e1);for(const[q,c]of[[A,c0],[B,c0],[C2,c1],[A,c0],[C2,c1],[D,c1]])o=fpV(o,q[0],q[1],q[2],c,255)}
    FP.kn=fpUp(gl,FP.kb,o)}}
// vignetta: un anello scuro davanti agli occhi che si stringe camminando e girando (riduce la nausea)
// livelli (Impostazioni del menu VR): leggera lascia libero quasi tutto lo sguardo e scurisce solo i bordi, forte è un tunnel stretto
const FPVL=[null,{r0:.34,r1:.56,a:.55,s:.2},{r0:.26,r1:.42,a:.8,s:.35},{r0:.16,r1:.26,a:1,s:.55}];
function fpVig(gl){const L=FPVL[FP.vig|0]||FPVL[1],S=40;FP.vgl=FP.vig|0;fpBuf(S*12*16);let o=0;const K=[0,0,0];
  for(let i=0;i<S;i++){const a0=i/S*6.2832,a1=(i+1)/S*6.2832,p=(a,r)=>[Math.cos(a)*r,Math.sin(a)*r,-.3],r0=L.r0,r1=L.r1;
    for(const[a,r,al]of[[a0,r0,0],[a1,r0,0],[a1,r1,255],[a0,r0,0],[a1,r1,255],[a0,r1,255],[a0,r1,255],[a1,r1,255],[a1,1.2,255],[a0,r1,255],[a1,1.2,255],[a0,1.2,255]]){const q=p(a,r);o=fpV(o,q[0],q[1],q[2],K,al)}}
  FP.vn=fpUp(gl,FP.vb,o)}

/* ---- armi in mano: gli stessi modelli che l'eroe porta nel gioco (wpnL, shdL), con l'impugnatura nel pugno ---- */
function fpHeld(gl){const w=P.eq.w,s=P.eq.s,ap=apFix(P.ap||APM),sk=APO.sk.c[ap.sk],key=(w?w.u+w.r+w.n:'')+'|'+(s?s.u+s.r+s.n:'')+'|'+sk;if(key===FP.wk)return;FP.wk=key;
  const mk=(L,buf)=>{if(!L||!L.length)return 0;const B=[];for(const b of L){const k=x3Col(b[6]);B.push(b[0],b[1],b[2],b[3],b[4],b[5],k[0],k[1],k[2])}const n=x3Size(B),vb=x3Need(n);x3Emit(B,vb,0);gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Uint8Array(vb,0,n),gl.STATIC_DRAW);return n>>4};
  const ty=w?itype(w):'';FP.wn=mk(w?FPWR.has(ty)?fpWRot(wpnL(ty,RC[w.r]||'#cccccc')):wpnL(ty,RC[w.r]||'#cccccc'):null,FP.wb);FP.sn=mk(s?shdL(itype(s),RC[s.r]):null,FP.sb);
  // l'avambraccio è il braccio del modello dell'eroe (stessa scatola .12×.16, alta 10, color pelle), dal pugno verso il gomito
  if(!FP.ab)FP.ab=gl.createBuffer();FP.an=mk([[.31,-.08,2,.12,.16,11,sk]],FP.ab)}
// dal modello (caselle e pixel, impugnatura dell'arma in x .37, z 12) al pugno: la lama esce in avanti lungo il controller.
// Le proporzioni sono quelle del modello (1 casella = 39,2 pixel, come nel diorama), con la spada lunga circa 80 cm
// ascia e falce: nel gioco la testa sporge di lato (+x, la vista dall'alto); in mano nel visore si gira di 90° attorno al manico,
// così il filo guarda in giù col controller puntato in avanti e verso il nemico quando si alza l'arma per il colpo (come il filo della spada)
const FPWR=new Set(['axe','scy']);
function fpWRot(L){return L.map(b=>{const cx=b[0]+b[3]/2-.37,cy=b[1]+b[4]/2,w=b[4],d=b[3];return[.37+cy-w/2,-cx-d/2,b[2],w,d,b[5],b[6]]})}
const FPWK=.03,FPWT=39.2*FPWK;
const FPWA=new Float32Array([FPWT,0,0,0, 0,FPWT,0,0, 0,0,-FPWK,0, -.37*FPWT,0,12*FPWK,1]);
// lo scudo sull'avambraccio sinistro: la faccia guarda fuori, il lato lungo lungo il braccio
const FPSA=new Float32Array([0,FPWT,0,0, -FPWT,0,0,0, 0,0,-FPWK,0, .125*FPWT,.36*FPWT,15*FPWK,1]);

/* ---- scritte nel mondo, come nel gioco: vita dei nemici, nomi, «!» e «?» delle missioni, danni, cosa fa il tasto A ---- */
const FPVERB={npc:'Parla',po:'Entra',ch:'Apri',dr:'Raccogli',res:'Raccogli',shard:'Raccogli',lore:'Leggi',board:'Classifica',fs:'Pesca',stash:'Baule',letto:'Dormi'};
function fpSprites(){const L=[],near=(e,r)=>Math.abs(e.px-P.px)<r&&Math.abs(e.py-P.py)<r,FR=FP.R||FPR;
  for(const e of ents){if(!near(e,FR))continue;
    if(e.k==='en'||e.k==='tr')L.push({e,z:(e.boss?74:46),bar:e.hp/e.mx,bc:e.k==='tr'?'#4a8aff':e.enr?'#ff7a2a':'#ee3333',tx:e.boss||e.b&&e.b.pt||e.bld?e.n:'',c:'#fff',w:e.boss?1.1:.7});
    else if(e.k==='npc'&&(e.qm||SET.names))L.push({e,z:e.nid==='gatto'?22:48,tx:SET.names?e.n||(NPCS[e.nid]||{}).n||'':'',mk:e.qm,mc:e.qm==='?'?'#7aff7a':'#ffd84a',c:'#fff',w:.9});
    else if(e.k==='dr'&&near(e,5))L.push({e,z:24,tx:iname(e.it),c:RC[e.it.r|0]||'#fff',w:.8})}
  for(const o of NET.list)if(near(o,FR))L.push({e:o,z:46,bar:o.hp/o.mx,bc:'#44aaff',tx:SET.names?o.n+' Lv'+o.lv:'',c:inPit(o.px,o.py)?'#ff9a9a':'#fff',w:.8});
  const AI=FP.ait;if(AI&&!FP.win&&ents.includes(AI)){const k=AI.k;L.push({e:AI,z:k==='npc'?62:k==='po'?54:30,tx:'A · '+(FPVERB[k]||'Usa')+(AI.n?' · '+AI.n:''),c:'#ffe38a',w:1.1,hint:1})}
  if(SET.dmg)for(const p of pop)if(Math.abs(p.x-P.px)<FR&&Math.abs(p.y-P.py)<FR)L.push({p,z:44,tx:p.s,c:p.c,w:.5,pop:1});
  L.sort((a,b)=>{const A=a.p||a.e,B=b.p||b.e;return Math.hypot((A.px??A.x)-P.px,(A.py??A.y)-P.py)-Math.hypot((B.px??B.x)-P.px,(B.py??B.y)-P.py)});
  return L.slice(0,32)}
function fpAtlas(gl){let c=FP.atl;if(!c){c=FP.atl=document.createElement('canvas');c.width=1024;c.height=512}
  const q=c.getContext('2d'),L=fpSprites();q.clearRect(0,0,1024,512);q.textAlign='center';q.lineJoin='round';
  L.forEach((s,i)=>{const x=(i&3)*256,y=(i>>2)*64;s.u=[x/1024,y/512,(x+256)/1024,(y+64)/512];let ty=y+(s.bar!=null?40:44);
    if(s.bar!=null){q.fillStyle='#000a';q.fillRect(x+48,y+46,160,12);q.fillStyle=s.bc;q.fillRect(x+48,y+46,160*Math.max(0,Math.min(1,s.bar)),12)}
    if(s.mk){q.font='bold 34px Georgia,serif';q.lineWidth=6;q.strokeStyle='#000';q.fillStyle=s.mc;const mx=s.tx?x+22:x+128;q.strokeText(s.mk,mx,y+44);q.fillText(s.mk,mx,y+44)}
    if(s.tx){q.font=(s.pop?'bold 30px':'bold 22px')+' Georgia,serif';q.lineWidth=5;q.strokeStyle='#000';q.fillStyle=s.c||'#fff';const t=String(s.tx).slice(0,28);q.strokeText(t,x+128,ty,248);q.fillText(t,x+128,ty,248)}});
  FP.spr=L;gl.bindTexture(gl.TEXTURE_2D,FP.atx);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,c);gl.generateMipmap(gl.TEXTURE_2D)}
// rettangolo rivolto verso la testa (u: [u0,v0,u1,v1]), 5 float per vertice
function fpQuad(A,o,c,r,up,w,h,u){const p=(sx,sy)=>[c[0]+r[0]*sx*w/2+up[0]*sy*h/2,c[1]+r[1]*sx*w/2+up[1]*sy*h/2,c[2]+r[2]*sx*w/2+up[2]*sy*h/2];
  for(const[sx,sy,uu,vv]of[[-1,1,u[0],u[1]],[1,1,u[2],u[1]],[1,-1,u[2],u[3]],[-1,1,u[0],u[1]],[1,-1,u[2],u[3]],[-1,-1,u[0],u[3]]]){const q=p(sx,sy);A[o++]=q[0];A[o++]=q[1];A[o++]=q[2];A[o++]=uu;A[o++]=vv}return o}
const fpFace=c=>{let fx=c[0]-FP.hp[0],fz=c[2]-FP.hp[2];const l=Math.hypot(fx,fz)||1;return[-fz/l,0,fx/l]};

/* ---- l'interfaccia del gioco (la foto HTML di 8zg_xrui.js più i canvas dal vivo, come la minimappa) diventa la texture dei pannelli ---- */
function fpUi(gl){if(typeof XU==='undefined'||!XU.c||!XU.w)return FP.uok;const now=performance.now();if(now-FP.ut<80)return FP.uok;
  // la texture si ricarica quando c'è una foto nuova o cambia il pulsante puntato; per i soli canvas dal vivo (minimappa, orologio) 3 volte al secondo
  const H=xuHiL(),hk=H.map(e=>{const b=e.getBoundingClientRect();return b.left+','+b.top+','+b.width}).join(';');
  if(FP.uok&&XU.v===FP.uv&&hk===FP.uh&&now-FP.ut<330)return FP.uok;FP.ut=now;FP.uv=XU.v;FP.uh=hk;
  let c=FP.uc;if(!c)c=FP.uc=document.createElement('canvas');const w=XU.c.width,h=XU.c.height;if(c.width!==w||c.height!==h){c.width=w;c.height=h}
  const x=c.getContext('2d'),k=w/XU.w;x.setTransform(1,0,0,1,0,0);x.clearRect(0,0,w,h);x.drawImage(XU.c,0,0);x.setTransform(k,0,0,k,0,0);
  for(const l of XU.live)if(l.c.isConnected)try{x.drawImage(l.c,l.x,l.y,l.w,l.h)}catch(e){}
  xuHi(x,k,H);
  gl.bindTexture(gl.TEXTURE_2D,FP.utx);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,c);gl.generateMipmap(gl.TEXTURE_2D);return FP.uok=1}

/* ---- un fotogramma: pezzi di mondo vicini (cache del diorama), ciò che si muove, effetti, scritte, pannelli, raggi ---- */
function fpFrame(gl){if(FP.gl!==gl)fpGL(gl);
  if(X3.zk!==Zk||X3.M!==M||X3.N!==N||(FC&&X3.fc!==FC))x3Reset();
  fpMat();fpSky(gl);fpHeld(gl);
  const R=DARKZ.has(Zk)?10:(FP.vd||FPR),nc=Math.ceil(N/X3CS),f=FP.tf,fl=Math.hypot(f[0],f[1])||1,vis=[],near=[];
  for(let j=Math.max(0,Math.floor((P.py-R)/X3CS));j<=Math.min(nc-1,Math.floor((P.py+R)/X3CS));j++)
    for(let i=Math.max(0,Math.floor((P.px-R)/X3CS));i<=Math.min(nc-1,Math.floor((P.px+R)/X3CS));i++){
      const cx=(i+.5)*X3CS-P.px,cy=(j+.5)*X3CS-P.py,qx=clamp(P.px,i*X3CS,(i+1)*X3CS),qy=clamp(P.py,j*X3CS,(j+1)*X3CS);
      // i pezzi alle spalle non si disegnano (il loro centro è oltre mezzo pezzo dietro la testa)
      // si preparano anche i pezzi alle spalle (così girandosi non spunta niente all'improvviso), ma si disegnano solo quelli davanti
      if(Math.hypot(qx-P.px,qy-P.py)<R+1){near.push(j*nc+i);if((cx*f[0]+cy*f[1])/fl>-X3CS*.75)vis.push(j*nc+i)}}
  const t0=performance.now();for(const k of vis.concat(near))if(!X3.ch.has(k)){x3Chunk(gl,k);if(performance.now()-t0>4)break}
  if(vis.length){const k=vis[X3.rr++%vis.length];if(X3.ch.has(k))x3Chunk(gl,k)}
  FP.vis=vis;FP.R=R;
  const B=x3Rec(()=>{
    for(const k of vis){const c=X3.ch.get(k);if(c)for(let i=0;i<c.D.length;i+=2)fObj(c.D[i],c.D[i+1])}
    for(const e of ents.concat(NET.list)){if(!e||e.px==null)continue;const far=e.k==='ship'?R+12:R+1.5;if(Math.abs(e.px-P.px)>far||Math.abs(e.py-P.py)>far)continue;X3G.globalAlpha=1;try{ent(e)}catch(_){}}
    for(const p of PJ)box(p.x-.08,p.y-.08,18,.16,.16,8,p.c,1.2);if(typeof PPJ!=='undefined'&&PPJ.length)ppjDraw()},0);
  {const n=x3Size(B),vb=x3Need(n);x3Emit(B,vb,0);gl.bindBuffer(gl.ARRAY_BUFFER,FP.db);gl.bufferData(gl.ARRAY_BUFFER,new Uint8Array(vb,0,n),gl.STREAM_DRAW);FP.dn=n>>4}
  // avvisi dei boss (cerchio rosso), anelli e scoppi: dischi trasparenti sul pavimento, come le ellissi del gioco
  {const D=fx.filter(q=>q.k==='warn'||q.k==='boom'||q.k==='ring');fpBuf(D.length*2*48*6*16+16);let o=0;
    for(const q of D){let r=q.r,a,c,rin=0;if(q.k==='warn'){const p=1-q.t/q.mx;a=(.15+p*.25)*255;c=[255,40,30];o=fpDisc(o,q.x,q.y,r,0,c,a);rin=r*p;r=rin+.06;a=230;c=[255,80,40]}
      else if(q.k==='boom'){const p=1-q.t/.4;rin=r*p;r=rin+.18;a=Math.min(1,q.t*2.5)*255;c=[255,120,60]}else{const p=Math.max(0,1-q.t/.5);rin=q.r*p;r=rin+.12;a=Math.min(1,q.t*2)*255;c=[255,200,80]}
      o=fpDisc(o,q.x,q.y,r,rin,c,a)}
    FP.fn=fpUp(gl,FP.fb,o,1)}
  // scritte (15 volte al secondo) e loro posizione (a ogni fotogramma)
  const now=performance.now();if(now-FP.ast>66){FP.ast=now;fpAtlas(gl)}
  {const L=FP.spr,A=new Float32Array(L.length*30+30);let o=0;
    for(const s of L){const e=s.e,p=s.p,x=p?p.x:e.px,y=p?p.y:e.py;if(e&&!(ents.includes(e)||NET.list.includes(e)))continue;if(p&&!(p.t>0))continue;
      const z=s.z+(p?(1-p.t)*28:0),c=fpRef(x,y,z),d=Math.hypot(c[0]-FP.hp[0],c[1]-FP.hp[1],c[2]-FP.hp[2]),k=Math.max(1,d/5),w=s.w*k;
      o=fpQuad(A,o,c,fpFace(c),[0,1,0],w,w/4,s.u)}
    gl.bindBuffer(gl.ARRAY_BUFFER,FP.tb);gl.bufferData(gl.ARRAY_BUFFER,A.subarray(0,o),gl.STREAM_DRAW);FP.spn=o/5}
  // pannello dell'interfaccia (più uno sfondo scuro dietro le finestre) e raggi dei controller
  {const p=XR.pan,ok=fpUi(gl),A=new Float32Array(30);FP.pn=0;FP.pw=0;
    if(ok&&p&&(p.n[0]||p.n[1]||p.n[2])){fpQuad(A,0,p.c,p.r,p.u,p.w,p.h,[0,0,1,1]);FP.pn=6;FP.pw=FP.win?1:0;gl.bindBuffer(gl.ARRAY_BUFFER,FP.qb);gl.bufferData(gl.ARRAY_BUFFER,A,gl.STREAM_DRAW)}
    const rays=[...XR.src.values()].filter(st=>st.ray),K=[245,186,66];fpBuf(rays.length*8*16+6*16*2+16);let o=0;
    if(FP.pw){const q=(sx,sy)=>[p.c[0]+p.r[0]*sx*p.w/2+p.u[0]*sy*p.h/2-p.n[0]*.01,p.c[1]+p.r[1]*sx*p.w/2+p.u[1]*sy*p.h/2-p.n[1]*.01,p.c[2]+p.r[2]*sx*p.w/2+p.u[2]*sy*p.h/2-p.n[2]*.01];
      for(const[sx,sy]of[[-1,1],[1,1],[1,-1],[-1,1],[1,-1],[-1,-1]]){const v=q(sx*1.02,sy*1.03);o=fpV(o,v[0],v[1],v[2],[16,19,26],215)}}
    FP.bo=o;
    // il raggio si vede solo quando punta qualcosa con cui interagire (un pulsante di una finestra, una persona, una porta, un nemico)
    for(const st of rays){const r=st.ray;if(!r.vis)continue;const e=v3(r.o,r.d,r.vis);o=fpV(o,r.o[0],r.o[1],r.o[2],K,255);o=fpV(o,e[0],e[1],e[2],K,255)}
    FP.ln=(o-FP.bo)>>4;FP.lb0=FP.bo>>4;fpUp(gl,FP.lb,o||16,1)}
  // tendina delle porte e lampi, negli occhi
  {const c=fpCurtain();FP.ca=c.a;if(c.a>.01){fpBuf(6*16);let o=0;for(const[x,y]of[[-2,2],[2,2],[2,-2],[-2,2],[2,-2],[-2,-2]])o=fpV(o,x,y,-.3,c.c,255);fpUp(gl,FP.ob,o,1)}}
  // vignetta: camminando, girando o durante schivate e affondi
  if(FP.vgl!==(FP.vig|0))fpVig(gl);
  const tv=FP.vig?Math.min(1,Math.max(FP.mv,P.dm?1:0,P.path&&P.path.length?.6:0,FP.turn||0,performance.now()-FP.snapT<160?.8:0)):0;FP.vv+=(tv-FP.vv)*Math.min(1,FP.dt*(tv>FP.vv?10:4))}
// passando da una porta o da un portale la pagina chiude un'iride nera (#iris) e alcuni colpi fanno un lampo colorato (#flash):
// in prima persona non stanno sul pannello dell'interfaccia ma davanti agli occhi, come una dissolvenza (l'iride che si stringe in VR darebbe fastidio)
XU.skip=el=>(el.id==='iris'||el.id==='flash')&&fpLive();
function fpCurtain(){let a=0,c=[0,0,0];const ir=$('iris');
  if(ir&&ir.style.display==='block'){const m=/transparent ([\d.]+)px/.exec(ir.style.background);a=1-clamp((m?+m[1]:0)/Math.hypot(W,H),0,1)}
  // il lampo si calcola dall'ora in cui è partito (la sua animazione nella pagina può restare ferma mentre si è nel visore)
  if(FLS){const k=(performance.now()-FLS.t)/FLS.d;if(k>=1)FLS=null;else{const o=FLS.a*(1-k)**3;if(o>a){a=o;c=x3Col(FLS.c)}}}
  return{a,c}}
function fpDisc(o,x,y,r,ri,c,a){const S=48;for(let i=0;i<S;i++){const a0=i/S*6.2832,a1=(i+1)/S*6.2832,P0=fpRef(x+Math.cos(a0)*r,y+Math.sin(a0)*r,1),P1=fpRef(x+Math.cos(a1)*r,y+Math.sin(a1)*r,1);
    if(ri>0){const Q0=fpRef(x+Math.cos(a0)*ri,y+Math.sin(a0)*ri,1),Q1=fpRef(x+Math.cos(a1)*ri,y+Math.sin(a1)*ri,1);for(const q of[Q0,P0,P1,Q0,P1,Q1])o=fpV(o,q[0],q[1],q[2],c,a)}
    else{const C=fpRef(x,y,1);for(const q of[C,P0,P1])o=fpV(o,q[0],q[1],q[2],c,a)}}
  return o}

/* ---- per ogni occhio ---- */
function fpView(gl,v){const pc=FP.pc,pt=FP.pt,U=pc.u,P4=v.projectionMatrix,V4=v.transform.inverse.matrix;
  gl.bindVertexArray(FP.vao);gl.enableVertexAttribArray(0);gl.enableVertexAttribArray(1);
  const col=(buf,n,mdl,mode)=>{if(!n)return;gl.uniformMatrix4fv(U.Mdl,false,mdl);gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.vertexAttribPointer(0,3,gl.FLOAT,false,16,0);gl.vertexAttribPointer(1,4,gl.UNSIGNED_BYTE,true,16,12);gl.drawArrays(mode||gl.TRIANGLES,0,n)};
  gl.useProgram(pc.p);gl.uniformMatrix4fv(U.P,false,P4);gl.uniformMatrix4fv(U.V,false,V4);gl.uniform1f(U.A,1);gl.uniform1f(U.NK,SKY[Zk]?NK:0);
  // cielo (intorno alla testa, senza profondità)
  const fog=FP.fog||[0,0,0];gl.uniform3f(U.F,fog[0],fog[1],fog[2]);gl.uniform2f(U.FD,1e5,2e5);gl.disable(gl.DEPTH_TEST);gl.depthMask(false);
  const T=new Float32Array(FPI);T[12]=FP.hp[0];T[13]=FP.hp[1];T[14]=FP.hp[2];col(FP.kb,FP.kn,T);
  gl.enable(gl.DEPTH_TEST);gl.depthMask(true);const R=FP.R*FPS;gl.uniform2f(U.FD,R*.55,R*.95);
  for(const k of FP.vis){const c=X3.ch.get(k);if(c)col(c.buf,c.n,FP.mdl)}
  col(FP.db,FP.dn,FP.mdl);
  gl.uniform2f(U.FD,1e5,2e5);const M4=new Float32Array(16);
  if(FP.grip.right){fpMul(FP.grip.right,FPWA,M4);if(FP.wn)col(FP.wb,FP.wn,M4);if(FP.an)col(FP.ab,FP.an,M4)}
  if(FP.grip.left){if(FP.an)col(FP.ab,FP.an,fpMul(FP.grip.left,FPWA,M4));if(FP.sn)col(FP.sb,FP.sn,fpMul(FP.grip.left,FPSA,M4))}
  gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(false);gl.uniform2f(U.FD,R*.55,R*.95);
  col(FP.fb,FP.fn,FP.mdl);
  // scritte nel mondo
  if(FP.spn){gl.useProgram(pt.p);gl.uniformMatrix4fv(pt.u.P,false,P4);gl.uniformMatrix4fv(pt.u.V,false,V4);gl.uniform1i(pt.u.T,0);const k=SKY[Zk]?1-NK*.35:1;gl.uniform4f(pt.u.K,k,k,k,1);
    gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,FP.atx);gl.bindBuffer(gl.ARRAY_BUFFER,FP.tb);gl.vertexAttribPointer(0,3,gl.FLOAT,false,20,0);gl.vertexAttribPointer(1,2,gl.FLOAT,false,20,12);gl.drawArrays(gl.TRIANGLES,0,FP.spn)}
  // pannelli sopra a tutto (un muro vicino non copre le finestre), poi i raggi
  gl.disable(gl.DEPTH_TEST);gl.useProgram(pc.p);gl.uniform2f(U.FD,1e5,2e5);gl.uniform1f(U.NK,0);
  if(FP.pw&&FP.bo)col(FP.lb,FP.bo>>4,FPI);
  if(FP.pn){gl.useProgram(pt.p);gl.uniformMatrix4fv(pt.u.P,false,P4);gl.uniformMatrix4fv(pt.u.V,false,V4);gl.uniform1i(pt.u.T,0);gl.uniform4f(pt.u.K,1,1,1,FP.pw?1:.92);
    gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,FP.utx);gl.bindBuffer(gl.ARRAY_BUFFER,FP.qb);gl.vertexAttribPointer(0,3,gl.FLOAT,false,20,0);gl.vertexAttribPointer(1,2,gl.FLOAT,false,20,12);gl.drawArrays(gl.TRIANGLES,0,6)}
  gl.useProgram(pc.p);
  if(FP.ln){gl.uniformMatrix4fv(U.Mdl,false,FPI);gl.bindBuffer(gl.ARRAY_BUFFER,FP.lb);gl.vertexAttribPointer(0,3,gl.FLOAT,false,16,0);gl.vertexAttribPointer(1,4,gl.UNSIGNED_BYTE,true,16,12);gl.drawArrays(gl.LINES,FP.lb0,FP.ln)}
  // vignetta, negli occhi (V = identità: i vertici sono già nello spazio dell'occhio)
  if(FP.vig&&FP.vv>.02){const L=FPVL[FP.vig|0]||FPVL[1],k=FP.vv,S=new Float32Array(FPI);S[0]=S[5]=1-k*L.s;gl.uniformMatrix4fv(U.V,false,FPI);gl.uniform1f(U.A,Math.min(1,k*1.4)*L.a);col(FP.vb,FP.vn,S)}
  if(FP.ca>.01){gl.uniformMatrix4fv(U.V,false,FPI);gl.uniform1f(U.A,FP.ca);col(FP.ob,6,FPI)}
  gl.disable(gl.BLEND);gl.depthMask(true);gl.enable(gl.DEPTH_TEST);gl.bindVertexArray(null)}

const _xr3dFP=typeof xr3dDraw==='function'?xr3dDraw:null;
xr3dDraw=function(gl,v,X){if(!fpLive()||!P||!M){if(_xr3dFP)_xr3dFP(gl,v,X);return}
  if(FP.dfid!==FP.fid){FP.dfid=FP.fid;fpFrame(gl)}fpView(gl,v)};
