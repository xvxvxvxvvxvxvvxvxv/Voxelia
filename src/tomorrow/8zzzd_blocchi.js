/* ================= 7.45: costruire a blocchi, liberamente =================
   Nell'editor del borgo (V) c'è lo strumento «🧲 Blocchi»: si mettono cubi colorati uno sopra l'altro, fino a otto, dove
   si vuole dentro il borgo (non sugli edifici e mai davanti alle porte). Con un clic si aggiunge un blocco alla pila, con
   la Gomma si toglie la pila. Ogni blocco costa un pezzo di pietra (i blocchi di legno un pezzo di legna, le lanterne
   due monete). Torri, muretti, sculture, scale, scritte: quello che vuoi. In una città della fazione li mette chi può
   costruire, e li vedono tutti. Funziona anche in 3D. */
const BLKC=[['pietra','Pietra','#9a9aa2','pietra'],['chiara','Pietra chiara','#d8d0c0','pietra'],['mattone','Mattone','#a8603a','pietra'],['legno','Legno','#8a6a42','legna'],
  ['assi','Assi chiare','#c8a070','legna'],['sabbia','Arenaria','#d8c088','pietra'],['muschio','Muschio','#5a8a3c','pietra'],['bianco','Marmo','#f0ece4','pietra'],
  ['nero','Basalto','#3a3a40','pietra'],['rosso','Rosso','#c0392b','pietra'],['blu','Blu','#3a6aa8','pietra'],['oro','Oro','#e8c040','pietra'],['viola','Viola','#7a4a9a','pietra'],['luce','Lanterna','#ffe08a','g']];
const BLKI={};BLKC.forEach((b,i)=>BLKI[b[0]]=i);
const BLK={c:'pietra',h:1,hmax:8};
const blkCost=c=>{const b=BLKC[BLKI[c]]||BLKC[0];return b[3]==='g'?{g:2}:{[b[3]]:1}};
// nella pianta del borgo: le pile diventano caselle piene, disegnate a cubi
{const a0=setApplyLay;setApplyLay=function(C,Ly,inR){a0(C,Ly,inR);const z=C.z,n=C.n;z.blk=new Map();if(!Ly.blk)return;
  for(const k in Ly.blk){const[x,y]=sedXY(k);if(!inR(x,y))continue;const v=Ly.blk[k];if(!Array.isArray(v)||!(v[0]>0))continue;if(M[y][x]===3||M[y][x]===2)continue;
    M[y][x]=6;DEC[y][x]=DN+'B';z.blk.set(y*n+x,v);C.res(x,y)}}}
{const d0=dec;dec=function(x,y,c,h){if(c===DN+'B'&&ZZ&&ZZ.blk){const v=ZZ.blk.get(y*N+x);if(v){blkDraw(x,y,v);return}}return d0.apply(this,arguments)}}
function blkDraw(x,y,v){const n=Math.min(BLK.hmax,v[0]|0),L=v[1]||[];for(let i=0;i<n;i++){const id=L[i]||L[L.length-1]||'pietra',b=BLKC[BLKI[id]]||BLKC[0],sh=.9+((x*7+y*3+i*5)%4)*.04;
    box(x,y,i*12,1,1,12,b[2],id==='luce'?1.35:sh);if(id==='luce'&&typeof nlight==='function'&&NK>.02)nlight(x+.5,y+.5,i*12+6,110,'255,220,140',.7)}}
// lo strumento nell'editor
function blkAt(x,y){const Ly=P.tw.set.lay;return Ly.blk&&Ly.blk[sedKey(x,y)]}
function blkPut(x,y){const S=P.tw.set,Ly=S.lay,k=sedKey(x,y);if(!sedIn(x,y)||sedBldAt(x,y)||sedFoAt(x,y)||sedDoorAt(x,y)){msg('Qui non si può: dentro il borgo, fuori dagli edifici e dalle porte');tone(150,.08);return false}
  if(Ly.mk&&Ly.mk[0]===x&&(Ly.mk[1]===y||Ly.mk[1]-1===y)){msg('Qui c\'è il banco del mercante');return false}
  Ly.blk=Ly.blk||{};const cur=Ly.blk[k];if(cur&&cur[0]>=BLK.hmax){msg('La pila è già alta '+BLK.hmax+' blocchi');tone(150,.08);return false}
  if(!cur&&sedBlocks([[x,y]])){msg('Così chiuderesti il passaggio verso una porta, un mercante o verso di te');tone(150,.08);return false}
  if(!sedPayOK(blkCost(BLK.c)))return false;if(!cur){delete Ly.d[k];if(Ly.w)delete Ly.w[k];Ly.blk[k]=[1,[BLK.c]]}else{cur[0]++;cur[1]=(cur[1]||[]).concat(BLK.c)}tone(300+(cur?cur[0]:1)*40,.05,'square',.03);return true}
{const c0=sedClick;sedClick=function(x,y){const T=SED.tool;if(T==='blk'){if(blkPut(x,y))sedApply();return}if(T==='del'&&blkAt(x,y)){delete P.tw.set.lay.blk[sedKey(x,y)];tone(220,.06,'triangle');sedApply();return}return c0(x,y)}}
{const cl0=sedClear;sedClear=function(x,y){cl0(x,y);const Ly=P.tw.set.lay;if(Ly&&Ly.blk)delete Ly.blk[sedKey(x,y)]}}
{const u0=sedUI;sedUI=function(){u0();const el=$('sed');if(!el||el.hidden||!SED.on)return;const tb=el.querySelector('.sedt');
  if(tb&&!tb.querySelector('.blkb')){const g2=[...tb.querySelectorAll('button')].find(b=>/Gomma/.test(b.textContent));const b=document.createElement('button');b.className='blkb'+(SED.tool==='blk'?' on':'');b.textContent='🧲 Blocchi';b.onclick=()=>sedTool('blk');tb.insertBefore(b,g2||null)}
  if(SED.tool!=='blk')return;const B=el.querySelector('.sedb');if(!B)return;const n=Object.keys(P.tw.set.lay.blk||{}).length;
  B.innerHTML=`<p class="sedi">Clicca per mettere un blocco: cliccando ancora sulla stessa casella la pila sale (fino a ${BLK.hmax}). La Gomma toglie la pila intera.</p>
   <h5>Materiale</h5><div class="sedm blkm">${BLKC.map(b=>`<button class="${BLK.c===b[0]?'on':''}" title="${b[1]} · ${b[3]==='g'?'2 monete':'1 '+(RESN[b[3]]||b[3]).toLowerCase()}" onclick="BLK.c='${b[0]}';sedUI()"><i style="background:${b[2]}"></i><small>${b[1]}</small></button>`).join('')}</div>
   <p class="mu">${n} pile nel borgo.</p>`}}
// anteprima: la casella sotto il cursore mostra il colore del blocco
{const o0=sedOverlay;sedOverlay=function(){o0();if(!SED.on||SED.tool!=='blk'||!SED.hv)return;const[x,y]=SED.hv,ok=sedIn(x,y)&&!sedBldAt(x,y)&&!sedFoAt(x,y)&&!sedDoorAt(x,y),b=BLKC[BLKI[BLK.c]];g.save();g.setTransform(DPR,0,0,DPR,0,0);
  sedPoly(x,y,1,1,ok?b[2]+'88':'rgba(255,80,80,.35)',ok?'#ffffff':'#ff5050');g.restore()}}
(function(){const st=document.createElement('style');st.textContent=`.blkm{display:grid;grid-template-columns:repeat(4,1fr);gap:4px}.blkm button{display:flex;flex-direction:column;align-items:center;gap:2px;padding:5px 2px}.blkm i{width:22px;height:22px;border-radius:3px;border:1px solid #0006;box-shadow:inset -4px -4px 0 #0003}.blkm small{font-size:10px}`;document.head.appendChild(st)})();
