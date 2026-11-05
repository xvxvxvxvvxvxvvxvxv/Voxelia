/* ================= 7.41: LA CITTÀ IN ORDINE E LE MURA SUL CONFINE =================
   - La città cresce in ordine: viali lastricati a croce dalla piazza, sentieri a reticolo, isolati con quattro case
     ciascuno, gli edifici più importanti vicino alla piazza. Ogni Espansione allarga il reticolo e mette le case nuove
     negli isolati liberi, senza toccare quello che hai fatto tu con l'editor. Così personalizzarla è più facile.
     Nell'editor c'è «📐 Riordina il borgo», per rimettere tutto in ordine quando vuoi (le case tengono interni e colori).
     Le città nuove nascono già in ordine.
   - Le mura (scheda Mura dell'editor) coprono tutto il perimetro della città, anche dove arriva al bordo della regione,
     con le porte dove passano le strade. Si spostano (più vicine o più lontane dal centro), si cancellano a pezzi o
     tutte, e i pezzi cancellati si rimettono. */
const PLG=9;
const plMain=(x,y,c)=>x===c[0]||y===c[1];
const plStreet=(x,y,c)=>((x-c[0])%PLG+PLG)%PLG===0||((y-c[1])%PLG+PLG)%PLG===0;
function plFreeT(Ly,x,y){const k=sedKey(x,y);return sedIn(x,y)&&!sedBldAt(x,y)&&!sedFoAt(x,y)&&!sedDoorAt(x,y)&&!Ly.d[k]&&!(Ly.w&&Ly.w[k])&&!(Ly.mk&&Ly.mk[0]===x&&(Ly.mk[1]===y||Ly.mk[1]-1===y))&&!(M[y]&&M[y][x]===2)}
// i viali, i sentieri e la piazza
function plStreets(Ly){const c=Ly.c,R=sedR();let n=0;for(let y=c[1]-R;y<=c[1]+R;y++)for(let x=c[0]-R;x<=c[0]+R;x++){if(Math.hypot(x-c[0],y-c[1])>R-1)continue;const k=sedKey(x,y),pz=Math.hypot(x-c[0],y-c[1])<=3.2;
    if(!(pz||plStreet(x,y,c))||Ly.t[k]||!plFreeT(Ly,x,y))continue;Ly.t[k]=pz||plMain(x,y,c)?'4':'1';n++}return n}
// gli isolati: quattro case ciascuno, le porte sulle strade o sul cortile; i più vicini alla piazza per primi
function plLots(Ly){const c=Ly.c,R=sedR(),L=[],m=Math.ceil(R/PLG)+1;for(let j=-m;j<m;j++)for(let i=-m;i<m;i++){const x0=c[0]+i*PLG,y0=c[1]+j*PLG;for(const[dx,dy]of[[1,5],[5,5],[1,1],[5,1]]){const b={x:x0+dx,y:y0+dy,w:4,h:3};const d=Math.hypot(b.x+2-c[0],b.y+1.5-c[1]);if(d<4.6||d>R-2)continue;b.d=d;L.push(b)}}
  return L.sort((a,b)=>a.d-b.d)}
function plOK(Ly,b,keepDec){for(let y=b.y;y<b.y+b.h;y++)for(let x=b.x;x<b.x+b.w;x++){const k=sedKey(x,y);if(Ly.t[k]&&Ly.t[k]!=='g')return false;if(!keepDec&&(Ly.d[k]||(Ly.w&&Ly.w[k])))return false;if(M[y]&&M[y][x]===2)return false}
  const[dx,dy]=sedDoor(b);if(Ly.d[sedKey(dx,dy)]&&!keepDec)return false;return sedBldOK(b)}
function plClear(Ly,b){for(let y=b.y;y<=b.y+b.h;y++)for(let x=b.x;x<b.x+b.w;x++){const k=sedKey(x,y);if(y<b.y+b.h||x===sedDoor(b)[0]){delete Ly.d[k];if(Ly.w)delete Ly.w[k];if(y===b.y+b.h)continue;if(Ly.f)delete Ly.f[k]}}}
function plPut(Ly,k,keep){for(const b of plLots(Ly)){if(!plOK(Ly,b))continue;const nb={id:Ly.nid++,k,x:b.x,y:b.y,w:4,h:3};if(keep)Object.assign(nb,keep,{x:b.x,y:b.y,w:4,h:3});Ly.b.push(nb);return nb}return null}
// le case promesse dall'Espansione e gli edifici nuovi: negli isolati, con le strade intorno
const _setPlaceHouses741=setPlaceHouses;setPlaceHouses=function(){const S=P.tw.set,Ly=S&&S.lay;if(!Ly||!Ly.v||Zk!==S.k)return 0;plStreets(Ly);if(!(Ly.hq>0))return 0;let n=0;
  while(Ly.hq>0&&Ly.b.filter(b=>b.k==='casa').length<sedMaxCase()){if(!plPut(Ly,'casa'))break;Ly.hq--;n++}
  if(Ly.hq>0)n+=_setPlaceHouses741();if(Ly.b.filter(b=>b.k==='casa').length>=sedMaxCase())Ly.hq=0;return n};
const _setPlaceNew741=setPlaceNew;setPlaceNew=function(k){const S=P.tw.set,Ly=S&&S.lay;if(!Ly||!Ly.v||Zk!==S.k||!SETBA.includes(k)||Ly.b.some(b=>b.k===k))return;plStreets(Ly);if(!plPut(Ly,k))_setPlaceNew741(k)};
// rimettere tutto in ordine
const PLPRI=['mercato','locanda','tempio','fucina','caserma','allev','granaio','stalla','pozzo','miniera','fattoria','segheria','cava'];
function plReorder(){const S=P.tw.set,Ly=S&&S.lay;if(!Ly||!Ly.v||Zk!==S.k)return 0;const c=Ly.c,old=Ly.b.slice();
  old.sort((a,b)=>(a.k==='casa'?99:PLPRI.indexOf(a.k)<0?50:PLPRI.indexOf(a.k))-(b.k==='casa'?99:PLPRI.indexOf(b.k)<0?50:PLPRI.indexOf(b.k)));
  Ly.b=[];Ly.t={};Ly.mk=setB('mercato')?[c[0]-3,c[1]+3]:Ly.mk;Ly.bn=[c[0]+3,c[1]-3];for(const p of[Ly.mk,Ly.bn])if(p)for(const k of[sedKey(p[0],p[1]),sedKey(p[0],p[1]-1)]){delete Ly.d[k];if(Ly.w)delete Ly.w[k]}
  plStreets(Ly);let moved=0;
  for(const b of old){let got=null;for(const L of plLots(Ly)){if(!plOK(Ly,L,true))continue;got=L;break}
    if(got){const nb=Object.assign({},b,{x:got.x,y:got.y,w:4,h:3});plClear(Ly,nb);Ly.b.push(nb);moved++}else if(sedBldOK(b))Ly.b.push(b)}
  plStreets(Ly);return moved}
function sedReorder(){if(!sedHere())return;if(!confirm('Rimettere in ordine il borgo? Viali, sentieri e isolati si rifanno, gli edifici vanno negli isolati (tengono colori, interni e chi ci abita). Gli arredi restano dove non danno fastidio.'))return;
  const n=plReorder();sedApply();msg('📐 Borgo in ordine: '+n+' edifici negli isolati')}
{const u0=sedUI;sedUI=function(){u0();const el=$('sed');if(!el||el.hidden||!SED.on)return;const f=el.querySelector('.sedf');if(f&&!f.querySelector('.plro'))f.insertAdjacentHTML('afterbegin',`<button class="plro pri" onclick="sedReorder()">📐 Riordina il borgo</button>`)}}
// le città nuove nascono in ordine
{const f0=twSetFound;twSetFound=function(){const n0=csSets().length,r=f0.apply(this,arguments);const S=P.tw.set;if(S&&csSets().length>n0&&S.k===Zk){S.ord=1;plOrdNow()}return r}}
function plOrdNow(){const S=P.tw.set;if(!S||!S.ord||Zk!==S.k)return;if(!S.lay||!S.lay.v){setTimeout(plOrdNow,80);return}delete S.ord;plReorder();save();setRebuild()}
const _loadPost741b=loadPost;loadPost=function(k){_loadPost741b(k);const S=P&&P.tw&&P.tw.set;if(S&&S.ord&&Zk===S.k)setTimeout(plOrdNow,90)};
/* ---- le mura sul perimetro ---- */
const murRad=(Ly,R)=>clamp(R+(((Ly&&Ly.mura&&Ly.mura.dr)|0)),7,R);
function murIn(Ly,x,y,R,n){const c=Ly.c;n=n||N;return x>1&&y>1&&x<n-2&&y<n-2&&Math.hypot(x-c[0],y-c[1])<=murRad(Ly,R)-.5}
function murPer(Ly,x,y,R,n){if(!murIn(Ly,x,y,R,n))return false;for(const[a,b]of[[1,0],[-1,0],[0,1],[0,-1]])if(!murIn(Ly,x+a,y+b,R,n))return true;return false}
function setMuraRing(C,Ly,cx,cy,R,ends){const Mu=Ly.mura||{};if(Mu.off)return;const n=C.n,ok=C.ok,X=Mu.x||{},Rw=murRad(Ly,R);
  for(let y=cy-Rw-1;y<=cy+Rw+1;y++)for(let x=cx-Rw-1;x<=cx+Rw+1;x++){if(!ok(x,y)||!murPer(Ly,x,y,R,n))continue;if(M[y][x]!==0)continue;const d=DEC[y][x]||'';if(d===DN+'1'||d===DN+'4')continue;
    if(X[x+','+y])continue;if(ends.some(([ex,ey])=>Math.abs(ex-x)<=2&&Math.abs(ey-y)<=2))continue;M[y][x]=1;DEC[y][x]=DN+'W'}}
// cliccare sulle mura: aprire una porta, oppure cancellare (o rimettere) un pezzo
csRing=function(x,y){const Ly=P.tw.set.lay;return!!Ly&&murPer(Ly,x,y,sedR())};
SED.mt=SED.mt||'g';
const _csMuraClick741=csMuraClick;csMuraClick=function(x,y){const Mu=csMura();if(!Mu||!setB('mura')){msg('Prima costruisci la palizzata dal registro (U)');return}if(SED.mt!=='x'){_csMuraClick741(x,y);return}
  if(!csRing(x,y)){msg('Clicca sulle mura, lungo il confine del borgo');return}const k=x+','+y;Mu.x=Mu.x||{};
  if(Mu.x[k]){if(sedBlocks([[x,y]])){msg('Rimettendo questo pezzo il borgo resterebbe chiuso');return}delete Mu.x[k];tone(420,.06,'triangle')}else{if(M[y][x]!==1){msg('Qui non c\'è un pezzo di mura');return}Mu.x[k]=1;tone(300,.06,'triangle')}sedApply()};
{const m0=csMuraSet;csMuraSet=function(k,v){const Mu=csMura();if(!Mu)return;if(k==='dr'){if(!setB('mura'))return msg('Prima costruisci la palizzata dal registro (U)');Mu.dr=clamp(+v|0,-(sedR()-8),0);Mu.x={};Mu.g={};sedApply();return}
  if(k==='off'){if(!setB('mura'))return;Mu.off=v?1:0;sedApply();return}if(k==='xall'){Mu.x={};sedApply();return}return m0(k,v)}}
{const u0=sedUI;sedUI=function(){u0();const el=$('sed');if(!el||el.hidden||!SED.on||SED.tool!=='mura'||!setB('mura'))return;const B=el.querySelector('.sedb');if(!B)return;const Mu=csMura()||{},R=sedR(),nx=Object.keys(Mu.x||{}).length;
  B.insertAdjacentHTML('afterbegin',`<div class="sedcu"><h5>Dove passano le mura</h5>
    <div class="sedr"><button class="${SED.mt!=='x'?'on':''}" onclick="SED.mt='g';sedUI()">🚪 Clic = porta</button><button class="${SED.mt==='x'?'on':''}" onclick="SED.mt='x';sedUI()">🧽 Clic = cancella/rimetti</button></div>
    <label>Distanza dal centro <input type="range" min="${-(R-8)}" max="0" value="${Mu.dr|0}" onchange="csMuraSet('dr',this.value)"></label>
    <div class="sedr"><button onclick="csMuraSet('off',${Mu.off?0:1})">${Mu.off?'🧱 Rimetti le mura':'🧽 Togli tutte le mura'}</button>${nx?`<button onclick="csMuraSet('xall')">↺ Rimetti i ${nx} pezzi cancellati</button>`:''}</div>
    <p class="mu">Le mura seguono tutto il perimetro della città, anche lungo il bordo della regione. Dove passano le strade c'è sempre una porta.</p></div>`)}}
