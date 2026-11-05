/* ================= 7.35: IL LEGNO E LA CITTÀ CHE CRESCE =================
   - Gli alberi di Tomorrow si abbattono: clic (o tocco) su un albero, e l'eroe ci va e lo colpisce con l'ascia.
     Ci vogliono 5 colpi, e l'albero lascia 2 legna. Gli alberi abbattuti ricrescono dopo qualche giorno.
   - Il legno ora serve in quantità: edifici, potenziamenti, case, mura, pavimenti e arredi di legno ne chiedono molto di più.
   - La città cresce fino al livello 15 e, potenziandola molte volte, si allarga fino a coprire tutta la regione.
     Fuori dal vecchio centro i fiumi e i laghi restano (e sull'acqua non si costruisce). */
const TRE={forest:'OPBU',desert:'QJX',peaks:'FY'},CHOPN=5,CHOPW=2,CHOPD=3,CHOP={k:null,n:0,last:-9,q:null};
function chopIs(x,y){const z=ZZ;if(!z||!z.tw||!M[y]||M[y][x]!==1)return false;const q=typeof bCode==='function'?bCode(DEC[y][x],z.th):null;return!!(q&&q[0]&&(TRE[z.th]||'').includes(q[0]))}
function chopNear(x,y){return Math.abs(P.px-(x+.5))<=1.6&&Math.abs(P.py-(y+.5))<=1.6}
function chopFell(x,y){const q=bCode(DEC[y][x],ZZ.th);M[y][x]=0;DEC[y][x]=q&&q[2]?DN+q[2]:'';FC=null;if(typeof D3!=='undefined'&&D3.act&&typeof d3Reset==='function')d3Reset()}
function chopHit(x,y){if(!chopIs(x,y))return;if(!chopNear(x,y)){let best=null,bd=1e9;for(const[a,b]of[[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]]){const u=x+a,v=y+b;if(!M[v]||!WK(M[v][u]))continue;const p=path(P.px|0,P.py|0,u,v);if(!p.length&&!((P.px|0)===u&&(P.py|0)===v))continue;if(p.length<bd){bd=p.length;best=p}}
    if(!best){msg('Non ci arrivi da qui');return}P.path=best;P.tg=null;CHOP.q=[x,y];return}
  if(t-CHOP.last<.3)return;CHOP.last=t;const k=Zk+':'+x+','+y;if(CHOP.k!==k){CHOP.k=k;CHOP.n=0}CHOP.n++;P.path=[];P.fc=faceOf(x+.5-P.px,y+.5-P.py);P.sw=.25;P.swc=(P.swc|0)+1;P.at=.3;
  tone(140+Math.random()*40,.06,'square',.05);if(cineOK()){sparks(x+.5,y+.5,6,['#6b4a2b','#8a6a42','#3a7a30','#5aa84e'],50);if(typeof shake==='function')shake(.25)}
  if(CHOP.n<CHOPN){flt({px:x+.5,py:y+.5},'🪓 '+CHOP.n+'/'+CHOPN,'#ffe8c8');return}
  CHOP.k=null;CHOP.n=0;chopFell(x,y);P.res.legna=(P.res.legna|0)+CHOPW;const T=P.tw;T.chop=T.chop||{};const R=T.chop[Zk]=T.chop[Zk]||{};R[x+','+y]=gDay();
  {const ks=Object.keys(T.chop);if(ks.length>60)delete T.chop[ks[0]]}
  flt({px:x+.5,py:y+.5},'+'+CHOPW+' '+RESN.legna,'#ffe8c8');tone(90,.25,'sawtooth',.06);jingle([67,72],.06,'triangle');if(cineOK())sparks(x+.5,y+.5,22,['#6b4a2b','#8a6a42','#3a7a30','#5aa84e','#f0e0b0'],90);
  hud();if(typeof setHud==='function')setHud();save()}
// gli alberi abbattuti restano a terra (fino a quando ricrescono)
const _loadPost735=loadPost;loadPost=function(k){_loadPost735(k);CHOP.k=null;CHOP.q=null;if(!(twOn()&&P.tw&&P.tw.chop&&ZZ&&ZZ.tw))return;const R=P.tw.chop[Zk];if(!R)return;const d=gDay();
  for(const kk in R){if(d-R[kk]>=CHOPD){delete R[kk];continue}const[x,y]=kk.split(',').map(Number);if(chopIs(x,y))chopFell(x,y)}};
const _upd735=upd;upd=function(dt){_upd735(dt);const Q=CHOP.q;if(Q&&!P.path.length){CHOP.q=null;if(chopNear(Q[0],Q[1]))chopHit(Q[0],Q[1])}};
{const pd=cv.onpointerdown;cv.onpointerdown=ev=>{if(!(twOn()&&ZZ&&ZZ.tw&&started&&!PM&&!(typeof SED!=='undefined'&&SED.on)&&!(typeof CSE!=='undefined'&&CSE.on)&&(ev.button==null||ev.button===0))){pd(ev);return}
  let hit=null;if(typeof D3!=='undefined'&&D3.act){const p=d3Ground(ev.clientX,ev.clientY);if(p){const X=Math.floor(p[0]),Y=Math.floor(p[1]);for(const[a,b]of[[0,0],[1,0],[0,1],[1,1],[-1,0],[0,-1]])if(chopIs(X+a,Y+b)){hit=[X+a,Y+b];break}}}
  else{const[mx,my]=toWorld(ev.clientX,ev.clientY);for(const zz of[40,26,12,0]){const my2=my+zz,X=Math.floor((mx/32+my2/16)/2),Y=Math.floor((my2/16-mx/32)/2);if(chopIs(X,Y)){hit=[X,Y];break}}}
  if(hit){auInit();chopHit(hit[0],hit[1]);return}pd(ev)}}
/* ---- il legno in quantità ---- */
const LEGX=3;
const _setCostOf735=setCostOf;setCostOf=function(k,l){const c=Object.assign({},_setCostOf735(k,l));c.legna=(c.legna|0)*LEGX||8*l*LEGX/3|0;return c};
for(const nm of['sedMatCost','sedWallCost','sedDecCost'])if(typeof window[nm]==='function'){const f0=window[nm];window[nm]=function(a){const c=Object.assign({},f0(a));if(c.legna)c.legna*=LEGX;return c}}
/* ---- la città fino al livello 15 ---- */
TWSB.casa.max=15;
{const c0=SETCO.casa;SETCO.casa=l=>{const c=c0(l);if(l>5){c.g=Math.round(c.g*(1+(l-5)*.3));c.ferro=(c.ferro|0)+2*(l-5);c.marmo=(c.marmo|0)+(l-5)}return c}}
// sull'acqua non si costruisce
const _sedBldOK735=sedBldOK;sedBldOK=function(b,skip){if(sedHere())for(let y=b.y;y<=b.y+b.h;y++)for(let x=b.x;x<b.x+b.w;x++)if(M[y]&&M[y][x]===2)return false;return _sedBldOK735(b,skip)};
const _sedFree735=sedFree;sedFree=function(x,y){if(sedHere()&&M[y]&&M[y][x]===2)return false;return _sedFree735(x,y)};
