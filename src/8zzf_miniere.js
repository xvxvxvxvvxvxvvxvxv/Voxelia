/* ================= 7.31: LE MINIERE =================
   Nel borgo si costruisce la MINIERA: un'entrata nella roccia, con i puntelli e i carrelli. Dentro si scava a mano:
   clic (o tocco) sulla roccia accanto a te, e un colpo di piccone dopo l'altro la galleria avanza. Ogni blocco scavato dà
   pietra e, sempre più spesso man mano che si scende, carbone, ferro, rame, marmo, pepite d'oro e gemme; le vene si
   vedono nella roccia. Potenziando la miniera si scava più in fondo, più in fretta, e si trovano i REPERTI STORICI: monete,
   armi, sigilli e mosaici di prima del reset; all'ultimo livello, nelle viscere della terra, anche i cimeli di Aldoria.
   Ogni giorno i minatori portano al magazzino del borgo un po' di quello che trovano. Le gallerie scavate restano. */
Object.assign(RESN,{carbone:'Carbone',rame:'Rame',marmo:'Marmo',pepita:'Pepite d\'oro',gemma:'Gemme'});Object.assign(RESP,{carbone:6,rame:10,marmo:14,pepita:40,gemma:70});
Object.assign(SETMI,{carbone:'⚫',rame:'🟠',marmo:'⬜',pepita:'🟡',gemma:'💎'});
const MINR=['carbone','rame','marmo','pepita','gemma'];
Object.assign(TWSB,{miniera:{n:'Miniera',ic:'⛏',d:'Scavi minerali e pietre preziose; più livelli, più in fondo e i reperti storici',max:5,cost:l=>[200*l,0]}});
SETCO.miniera=l=>({g:200*l,legna:15*l,pietra:6*l,ferro:4*l});SETBA.push('miniera');SEDND.add('miniera');SEDK.miniera='casa';SEDKN.miniera='⛏ Miniera';SETBC.miniera=['#6a5a4a','#4a3a2a'];
// i materiali preziosi servono anche a costruire
{const t0=SETCO.tempio,f0=SETCO.fucina,m0=SETCO.mercato;SETCO.tempio=l=>Object.assign(t0(l),l>1?{marmo:(l-1)*4}:{});SETCO.fucina=l=>Object.assign(f0(l),l>1?{carbone:(l-1)*5,rame:(l-1)*2}:{});SETCO.mercato=l=>Object.assign(m0(l),l>2?{rame:(l-2)*3}:{})}
if(typeof sedMatCost==='function'){const _mc731=sedMatCost;sedMatCost=function(mt){return mt.id==='marmo'?{marmo:1}:mt.id==='oro'?{pepita:1}:_mc731(mt)}}
// l'entrata della miniera nel borgo
const _setBProps731=setBProps;setBProps=function(C,b){if(b.k!=='miniera'){_setBProps731(C,b);return}const T=TB[TB.length-1];if(T){if(!b.wall){T.wall='#6a5a4a';T.roof='#4a3a2a'}T.ht=b.ht||22}
  const dx=b.x+(b.w>>1),dy=b.y+b.h;if(C.ok(dx,dy)){if(M[dy][dx]!==0&&M[dy][dx]!==4){M[dy][dx]=0;DEC[dy][dx]=DN+'1'}const k=mineK(C.rx,C.ry);mineZ(k);ents.push(po(dx,dy,k,{st:'dun',n:'Miniera'}));C.tg.push([dx,dy])}
  let n=0;const pr=['x','u','L','u'];for(const[x,y]of[[b.x-1,b.y+b.h-1],[b.x+b.w,b.y+b.h-1],[b.x-1,b.y],[b.x+b.w,b.y]]){if(n>=pr.length||!C.ok(x,y)||M[y][x]!==0)continue;const d=DEC[y][x]||'';if(d===DN+'4'||d===DN+'1')continue;M[y][x]=6;DEC[y][x]=pr[n++];C.res(x,y)}};
/* ---- la miniera: la zona sotto terra ---- */
const MINN=40,MINE0=[20,36];
const mineK=(rx,ry)=>'twm:'+rx+','+ry;
const mineLv=()=>setB('miniera');
const mineMax=()=>6+mineLv()*6;               // fin dove si può scavare (distanza dall'entrata)
function mineS(){const S=P.tw&&P.tw.set;if(!S)return null;S.mine=S.mine||{dug:[],found:{}};S.mine.found=S.mine.found||{};return S.mine}
function mineZ(k){if(Z[k])return Z[k];const m=/^twm:(-?\d+),(-?\d+)$/.exec(String(k||''));if(!m)return null;const rx=+m[1],ry=+m[2],S=P&&P.tw&&P.tw.set;
  return Z[k]=Object.assign(Z[k]||{},{n:'Miniera'+(S?' di '+S.n:''),lv:1,N:MINN,bg:'#07060a',mus:TRK.cristallo?'cristallo':'dungeon',mine:1,mrx:rx,mry:ry,out:twK(rx,ry),tc:'#ffb04a'})}
const _zd731=zd;zd=function(k){if(typeof k==='string'&&k.startsWith('twm:'))mineZ(k);return _zd731(k)};
const _zname731=zname;zname=function(k){if(typeof k==='string'&&k.startsWith('twm:'))mineZ(k);return _zname731(k)};
// cosa c'è in ogni blocco di roccia: sempre lo stesso per la stessa miniera
function mineOre(x,y){const z=ZZ,d=Math.hypot(x-MINE0[0],y-MINE0[1]),h=hh(x*7.3+(z.mrx|0)*31,y*3.1+(z.mry|0)*17),h2=hh(x*2.9+(z.mry|0)*13+5,y*6.7+(z.mrx|0)*7+3);
  if(d>mineMax())return'dura';if(mineLv()>=5&&d>28&&h2<.012)return'cimelio';if(mineLv()>=3&&d>14&&h2<.045)return'reperto';
  if(h<.42)return'pietra';const L=[['carbone',3],['ferro',6],['rame',9],['marmo',12],['pepita',17],['gemma',22]].filter(o=>d>=o[1]);const i=Math.floor(Math.pow((h-.42)/.58,1.7)*L.length);return(L[Math.min(L.length-1,i)]||['pietra'])[0]}
const MINC={pietra:['#6a6258','#5e574e'],carbone:['#1a1a1c',0],ferro:['#c06a3a',0],rame:['#3aa88a','#d8803a'],marmo:['#f0ece0',0],pepita:['#ffd84a',1.4],gemma:['#9fd0ff',1.6],reperto:['#ffe8a0',1.5],cimelio:['#ff9aff',1.7],dura:['#2a2622','#24201c']};
const MINTM={pietra:.6,carbone:.7,ferro:.9,rame:.9,marmo:1.1,pepita:1.2,gemma:1.5,reperto:1.3,cimelio:1.6};
function mineGen(z){const n=N,S=mineS();BM=grid(-1);TB=[];for(let y=0;y<n;y++)for(let x=0;x<n;x++){M[y][x]=1;DEC[y][x]=''}
  const dig=(x,y)=>{if(x>0&&y>0&&x<n-1&&y<n-1){M[y][x]=0;DEC[y][x]=''}};
  for(let y=MINE0[1]-2;y<=MINE0[1]+2;y++)for(let x=MINE0[0]-2;x<=MINE0[0]+2;x++)if(Math.hypot(x-MINE0[0],y-MINE0[1])<=2.6)dig(x,y);for(let y=MINE0[1]-6;y<MINE0[1];y++)dig(MINE0[0],y);
  if(S)for(const i of S.dug)dig(i%n,i/n|0);
  // l'uscita, i puntelli, il carrello, le torce lungo le gallerie
  ents.push(po(MINE0[0],MINE0[1]+2,z.out,{st:'up',n:'Uscita · '+(P.tw.set?P.tw.set.n:'il borgo')}));
  for(const[x,y,c]of[[MINE0[0]-2,MINE0[1]+1,'x'],[MINE0[0]+2,MINE0[1]+1,'L'],[MINE0[0]+2,MINE0[1]-1,'k']])if(M[y][x]===0){M[y][x]=6;DEC[y][x]=c}
  for(let y=1;y<n-1;y++)for(let x=1;x<n-1;x++)if(M[y][x]===0&&hh(x*4.1+9,y*5.3+1)<.07&&[[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>M[y+b][x+a]===1))ents.push({k:'tc',px:x+.5,py:y+.5});
  // i minatori al lavoro
  const nm=Math.min(3,mineLv());for(let i=0;i<nm;i++){const[x,y]=nearFree(MINE0[0]+(i-1)*2,MINE0[1]-1-i);const e=mkNpc('minatore_tw',x,y,{wd:1});e.wg=1;ents.push(e)}
  return[MINE0[0],MINE0[1]]}
NPCS.minatore_tw={n:'Minatore',c:'#6a5a3a',hat:'#d8b84a',ln:['Picchia dove la roccia luccica: lì sotto c\'è il ferro. O almeno, c\'era mille anni fa.','Più scendi, più la roccia è dura. E più quello che trovi vale.','L\'altro giorno ho trovato una moneta con la faccia di un re. Nessuno sa chi fosse.','Potenzia la miniera e ci porti giù i puntelli buoni: si scava più a fondo e più in fretta.']};
const _genWild731=genWild;genWild=function(z){return z&&z.mine?mineGen(z):_genWild731(z)};
// la roccia: la vena si vede sulle facce
const _wall731=wall;wall=function(x,y,h){const z=ZZ;if(!z||!z.mine){_wall731(x,y,h);return}const ht=30+h*6,exp=[[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>M[y+b]&&M[y+b][x+a]!=null&&M[y+b][x+a]!==1);
  // la roccia che non tocca una galleria è buia: le vene si scoprono scavando
  if(!exp){box(x,y,0,1,1,ht,(x+y)&1?'#3a342e':'#36302a',.8+h*.1);return}const o=mineOre(x,y),C=MINC[o]||MINC.pietra,base=o==='dura'?C[0]:MINC.pietra[(x+y)&1];
  box(x,y,0,1,1,ht,base,.86+h*.12);if(o==='dura'){box(x+.1,y+.1,ht,.8,.8,2,C[1]);return}
  if(o!=='pietra'){const f=C[1]&&C[1]>1?C[1]:1.05,c2=typeof C[1]==='string'?C[1]:C[0];for(let i=0;i<4;i++){const u=hh(x*3+i,y*5+i*7),v=hh(x*9+i*3,y*2+i);box(x+.12+u*.6,y+.99,6+v*(ht-14),.16,.03,4,i%2?c2:C[0],f);box(x+.99,y+.12+v*.6,6+u*(ht-14),.03,.16,4,i%2?C[0]:c2,f)}
    box(x+.3,y+.3,ht,.3,.3,1.5,C[0],f);if(C[1]&&C[1]>1.3&&typeof nlight==='function')nlight(x+.5,y+.5,ht*.5,70,rgbOf(C[0]),.35)}};
const _floor731=floor;floor=function(x,y,c,h){const z=ZZ;if(!z||!z.mine||c===2){_floor731(x,y,c,h);return}box(x,y,-6,1,1,6,(x+y)&1?'#4a3c2e':'#43362a',.9+h*.12);if(h>.7)box(x+.2+h*.3,y+.3,0,.18,.14,2,'#5a4c3c')};
/* ---- scavare ---- */
const MINQ={dig:null,q:null};
function mineCanDig(x,y){return ZZ&&ZZ.mine&&x>0&&y>0&&x<N-1&&y<N-1&&M[y][x]===1&&mineOre(x,y)!=='dura'}
function mineNear(x,y){return Math.abs(P.px-(x+.5))<=1.6&&Math.abs(P.py-(y+.5))<=1.6}
function mineStart(x,y){if(!mineCanDig(x,y)){if(ZZ&&ZZ.mine&&M[y]&&M[y][x]===1)msg('Roccia troppo dura: potenzia la miniera per scendere più in fondo');return}
  if(!mineNear(x,y)){let best=null,bd=1e9;for(const[a,b]of[[1,0],[-1,0],[0,1],[0,-1]]){const u=x+a,v=y+b;if(!WK(M[v][u]))continue;const p=path(P.px|0,P.py|0,u,v);if(!p.length&&!((P.px|0)===u&&(P.py|0)===v))continue;if(p.length<bd){bd=p.length;best=[u,v,p]}}
    if(!best){msg('Non ci arrivi da qui');return}P.path=best[2];P.tg=null;MINQ.q=[x,y];return}
  const o=mineOre(x,y),need=(MINTM[o]||.6)*(1-.08*(mineLv()-1));MINQ.dig={x,y,t:0,need,o,px:P.px,py:P.py};P.path=[];P.fc=faceOf(x+.5-P.px,y+.5-P.py)}
function mineTick(dt){if(!ZZ||!ZZ.mine){MINQ.dig=MINQ.q=null;return}const Q=MINQ.q;if(Q&&!P.path.length){MINQ.q=null;if(mineNear(Q[0],Q[1]))mineStart(Q[0],Q[1])}
  const D=MINQ.dig;if(!D)return;if(Math.hypot(P.px-D.px,P.py-D.py)>.3||P.path.length||PM){MINQ.dig=null;return}D.t+=dt;P.fc=faceOf(D.x+.5-P.px,D.y+.5-P.py);P.at=.3;P.sw=.2;
  if((D.k=(D.k||0)-dt)<=0){D.k=.22;tone(180+Math.random()*80,.03,'square',.02);if(cineOK())sparks(D.x+.5,D.y+.5,4,['#c8c0b0','#8a8278',MINC[D.o]?MINC[D.o][0]:'#fff'],30)}
  if(D.t>=D.need)mineDone(D)}
function mineDone(D){MINQ.dig=null;const{x,y,o}=D,S=mineS();M[y][x]=0;DEC[y][x]='';FC=null;if(typeof D3!=='undefined'&&D3.ok&&typeof d3Reset==='function'&&D3.act)d3Reset();
  if(S&&!S.dug.includes(y*N+x))S.dug.push(y*N+x);const got=[];const add=(r,n)=>{P.res[r]=(P.res[r]|0)+n;S.found[r]=(S.found[r]|0)+n;got.push('+'+n+' '+RESN[r])};
  add('pietra',1+(Math.random()<.5?1:0));
  if(o==='carbone')add('carbone',1+Math.floor(Math.random()*2));else if(o==='ferro')add('ferro',1+Math.floor(Math.random()*2));else if(o==='rame')add('rame',1+Math.floor(Math.random()*2));
  else if(o==='marmo')add('marmo',1+Math.floor(Math.random()*2));else if(o==='pepita')add('pepita',1);else if(o==='gemma')add('gemma',1);
  else if(o==='reperto')mineRelic();else if(o==='cimelio'){if(!(typeof cimGive==='function'&&cimGive('era sepolto in fondo alla miniera')))mineRelic()}
  flt({px:x+.5,py:y+.5},got.join(' '),o==='pepita'||o==='gemma'?'#ffe066':'#ffe8c8');tone(o==='gemma'||o==='pepita'?880:420,.07,'triangle');if(cineOK())sparks(x+.5,y+.5,12,['#c8c0b0','#8a8278','#ffffff'],50);hud();if(typeof setHud==='function')setHud();mineHud()}
const MINREL=[['Moneta di Aldoria','Una moneta d\'argento con il volto di re Aldric. Mille anni sotto terra non l\'hanno scalfita.'],['Elmo arrugginito','L\'elmo di una guardia di prima del reset, con lo stemma della corona ancora visibile.'],
  ['Lucerna di terracotta','Una piccola lampada a olio. Qualcuno la accendeva ogni sera, mille anni fa.'],['Sigillo del Consiglio','Il sigillo di cera del Consiglio di Aldoria: «Per la Corona e per il popolo».'],
  ['Frammento di mosaico','Tessere azzurre e oro: un pezzo del pavimento di un palazzo che non esiste più.'],['Punta di lancia','Ferro forgiato alla maniera di Borin il fabbro. Tagliente come allora.'],
  ['Anfora del porto','Un\'anfora per il vino, con il marchio delle navi di Aldoria.'],['Tavoletta con le rune','Rune del Vuoto incise nella pietra. Meglio non leggerle ad alta voce.'],
  ['Dado d\'osso','Un dado da gioco della taverna del Drago Ubriaco. Esce sempre il sei.'],['Fossile di pesce','Un pesce di pietra. Questa terra un tempo era il fondo del mare.'],
  ['Statuetta votiva','Una piccola statua del tempio di Aldoria, con le mani giunte.'],['Chiave di bronzo','Apriva una porta di Aldoria Vecchia. Nessuno sa più quale.'],
  ['Mappa incisa su rame','Una mappa del regno di prima del reset: le coste non somigliano a nulla di quello che c\'è oggi.'],['Corno da guerra','Il corno delle guardie delle mura. Suona ancora, roco e profondo.']];
function mineRelic(){const S=mineS();S.rel=S.rel||{};const left=MINREL.filter(r=>!S.rel[r[0]]),r=(left.length?left:MINREL)[Math.floor(Math.random()*(left.length||MINREL.length))];S.rel[r[0]]=(S.rel[r[0]]|0)+1;
  P.rep=P.rep||[];P.rep.push(repFix({n:r[0],d:r[1],r:2,p:250+Math.floor(Math.random()*200)}));S.found.reperti=(S.found.reperti|0)+1;jingle([60,64,67,72,79],.09,'triangle');banner('🏺 Reperto storico!',r[0]+' · '+r[1],'corona');if(P.tw.set)setLog(P.tw.set,'Nella miniera: '+r[0]);save()}
// il clic sulla roccia scava (anche in 3D)
{const pd=cv.onpointerdown;cv.onpointerdown=ev=>{if(!(ZZ&&ZZ.mine&&started&&!PM&&(ev.button==null||ev.button===0))){pd(ev);return}
  let tx,ty;if(typeof D3!=='undefined'&&D3.act){const p=d3Ground(ev.clientX,ev.clientY);if(!p){pd(ev);return}tx=Math.floor(p[0]);ty=Math.floor(p[1])}else{const[mx,my]=toWorld(ev.clientX,ev.clientY);
    // la roccia è alta: si guarda prima la casella sotto il cursore all'altezza della parete
    let hit=null;for(const zz of[34,20,0]){const my2=my+zz,X=Math.floor((mx/32+my2/16)/2),Y=Math.floor((my2/16-mx/32)/2);if(M[Y]&&M[Y][X]===1){hit=[X,Y];break}}if(hit){tx=hit[0];ty=hit[1]}else{tx=-1}}
  if(tx>=0&&M[ty]&&M[ty][tx]===1){auInit();mineStart(tx,ty);return}pd(ev)}}
const _upd731=upd;upd=function(dt){_upd731(dt);if(ZZ&&ZZ.mine)mineTick(dt)};
// l'avanzamento del colpo di piccone, sopra la roccia
function mineBar(){const D=MINQ.dig;if(!D)return;const k=Math.min(1,D.t/D.need);g.save();g.setTransform(DPR,0,0,DPR,0,0);let sx,sy;
  if(typeof D3!=='undefined'&&D3.act){const q=d3Proj(D.x+.5,D.y+.5,40);if(!q){g.restore();return}sx=q[0];sy=q[1]}else{sx=(PX(D.x+.5,D.y+.5)-camX)*S+W/2;sy=(PY(D.x+.5,D.y+.5,44)-camY)*S+H/2}
  g.fillStyle='#000b';g.fillRect(sx-22,sy-4,44,7);g.fillStyle=MINC[D.o]&&MINC[D.o][0]!=='#6a6258'?MINC[D.o][0]:'#ffd84a';g.fillRect(sx-21,sy-3,42*k,5);g.restore()}
const _draw731=draw;draw=function(){_draw731();if(ZZ&&ZZ.mine&&!(typeof D3!=='undefined'&&D3.act))mineBar()};
if(typeof d3Overlay==='function'){const _d3o731=d3Overlay;d3Overlay=function(){_d3o731();if(ZZ&&ZZ.mine)mineBar()}}
function mineHud(){let el=$('minehud');if(!el){el=document.createElement('div');el.id='minehud';document.body.appendChild(el)}if(!started||!ZZ||!ZZ.mine){el.style.display='none';return}const S=mineS();
  el.style.display='flex';el.innerHTML=`<span>⛏ Miniera livello ${mineLv()}</span><span>profondità ${mineMax()}</span>${['pietra','carbone','ferro','rame','marmo','pepita','gemma'].map(r=>`<span title="${RESN[r]}">${SETMI[r]||''}${P.res[r]|0}</span>`).join('')}<span title="Reperti storici">🏺${(S&&S.found.reperti)|0}</span>`;if(typeof iconFill==='function')iconFill(el)}
const _loadPost731=loadPost;loadPost=function(k){_loadPost731(k);MINQ.dig=MINQ.q=null;mineHud();if(ZZ&&ZZ.mine&&!P.tw.mineSeen){P.tw.mineSeen=1;banner('⛏ La miniera','Clicca sulla roccia accanto a te per scavare · le vene colorate valgono di più','martello')}};
const _toMenu731=toMenu;toMenu=function(){_toMenu731();const el=$('minehud');if(el)el.style.display='none'};
// i minatori portano al magazzino un po' di quello che trovano
const _setStatsX731=setStatsX;setStatsX=function(S,st){_setStatsX731(S,st);const l=setB('miniera');if(!l)return;st.prod.pietra=(st.prod.pietra|0)+l*2;st.prod.carbone=l;st.prod.ferro=(st.prod.ferro|0)+Math.ceil(l/2);if(l>=2)st.prod.rame=l-1;if(l>=4)st.prod.marmo=l-3};
// il pannello: la miniera
const _setHTML731=setHTML2;setHTML2=function(){let h=_setHTML731();const S=P.tw.set,l=setB('miniera');if(!l)return h;const Mi=mineS(),F=Mi.found;
  const card=`<h4>⛏ Miniera</h4><div class="rgcard"><div><b>Livello ${l} · si scava fino a ${mineMax()} passi dall'entrata</b><p class="mu">Gallerie scavate: ${Mi.dug.length} · trovati finora: ${['carbone','ferro','rame','marmo','pepita','gemma'].filter(r=>F[r]).map(r=>F[r]+' '+SETMI[r]).join(' ')||'niente'}${F.reperti?' · '+F.reperti+' reperti storici':''}.
    ${l<3?'Dal livello 3 si trovano i reperti storici.':l<5?'Al livello 5, in fondo, anche i cimeli di Aldoria.':'Nelle viscere della terra ci sono anche i cimeli di Aldoria.'}</p></div>${Zk===S.k?`<span><button class="pri" onclick="mineGo()">⛏ Entra nella miniera</button></span>`:''}</div>`;
  return h.replace('<h4>Costruire</h4>',card+'<h4>Costruire</h4>')};
function mineGo(){const S=P.tw.set;if(!S||Zk!==S.k)return;cl();const k=mineK(ZZ.rx,ZZ.ry);mineZ(k);load(k,S.k)}
// nella barra del borgo e nelle statistiche anche i minerali
const _setHud731=setHud;setHud=function(){_setHud731();const el=$('sethud');if(el&&el.style.display==='flex'&&MINR.some(r=>P.res[r]))el.insertAdjacentHTML('beforeend',`<span title="Minerali">${MINR.filter(r=>P.res[r]).map(r=>SETMI[r]+(P.res[r]|0)).join(' ')}</span>`)};
document.head.insertAdjacentHTML('beforeend',`<style>#minehud{position:fixed;top:44px;left:50%;transform:translateX(-50%);z-index:6;display:none;gap:10px;background:rgba(16,14,24,.8);border:1px solid #ffd84a44;border-radius:10px;padding:4px 12px;font:13px system-ui,sans-serif;color:#f4ead8;pointer-events:none;white-space:nowrap}
@media (max-width:700px){#minehud{top:auto;bottom:118px;font-size:11px;gap:6px}}</style>`);
