/* ================= 7.29: L'EDITOR DEL BORGO, CON TUTTI I MATERIALI =================
   L'editor del borgo diventa completo, con tutto quello che c'è nel gioco e in Voxelia Studio:
   - TERRENO: tutti i pavimenti, da disegnare a pennello: erbe, sabbia, neve, fango, rocce, lastricati, ciottoli, mattoni,
     assi, parquet, marmo, piastrelle, tappeti, oro, cristallo, i terreni e le strade dei luoghi del gioco...;
   - MURI: tutti i tipi di muro (pietra, mura merlate, mattoni, assi, muro di casa, roccia, cripta, ghiaccio, cristalli,
     ossidiana, oro, lava, muretto basso), con il colore che vuoi;
   - ARREDI: tutti gli arredi del gioco, divisi per tipo e con la ricerca, oltre ai preferiti di sempre;
   - EDIFICI su misura: lo stile (casa, castello, tempio, arena, osservatorio, municipio, motel, mulino, faro), il colore dei
     muri e del tetto scelto liberamente, l'altezza e il camino.
   Ogni cosa costa le sue risorse: legna per il legno, pietra per la pietra, argilla per i mattoni, ferro per il metallo,
   monete per i materiali preziosi. */
SED.mat=SED.mat||'strada';SED.wl=SED.wl||'pietra';SED.wc=SED.wc||'';SED.q='';SED.dg=SED.dg||'fav';
function sedMatCost(mt){const id=mt.id,k=mt.k||'';if(k==='Natura'||k==='Luoghi del gioco')return{};if(/legno|parquet|pontile/.test(id)||k==='Interni del gioco')return{legna:1};
  if(id==='mattoni')return{argilla:1};if(id==='oro')return{g:10};if(/^(rosso|blu|verde|casino)$/.test(id))return{g:3};if(/cristallo|vuoto/.test(id))return{g:5};return{pietra:1}}
function sedWallCost(w){const id=w.id;if(/legno|interno/.test(id))return{legna:2};if(id==='mattoni')return{argilla:2};if(/ghiaccio|cristalli|ossidiana|oro|lavica/.test(id))return{pietra:1,g:15};return{pietra:2}}
function sedDecCost(c){if(c==='@fo')return{pietra:12,g:60};const I=EDECI[c]||{},k=I.k||'',n=(I.n||SEDDN[c]&&SEDDN[c][1]||'').toLowerCase();
  if(/statua|busto|colonna|obelisco|pozzo|fontana|altare|lapide|tomba|totem/.test(n))return{pietra:3};
  if(/lampion|lantern|palo|ancora|cannon|armatura|rastrelliera|incudine|gabbia|grata|catena|inferriata|filo|braciere/.test(n))return{ferro:1};
  if(/oro|cristall|gemma|reliquia|trono|scrigno|slot|roulette|pianoforte|telescopio|mappamondo|portale/.test(n))return{g:30};
  if(/rocc|scoglio|macerie|sacchi di sabbia|stalagmite/.test(n))return{pietra:1};
  if(k==='Natura'||k==='Campagna'||!k)return{legna:1};return{legna:2}}
const sedCostTxt=c=>{const k=Object.keys(c).filter(r=>c[r]>0);return k.length?k.map(r=>(SETMI[r]||'')+c[r]).join(' '):'gratis'};
function sedPayOK(c){const m=setMiss(c);if(m.length){msg('Mancano '+m.map(([r,n])=>n+' '+(r==='g'?'monete':RESN[r].toLowerCase())).join(', '));tone(150,.08);return false}setPay(c);return true}
// la pianta: pavimenti e muri su misura
function setApplyLay(C,Ly,inR){const z=C.z,n=C.n;z.smf=new Map();z.smw=new Map();
  for(const k in Ly.f||{}){const[x,y]=sedXY(k);if(!inR(x,y))continue;const i=EMATI[Ly.f[k]];if(i==null)continue;if(M[y][x]===2)M[y][x]=0;z.smf.set(y*n+x,i)}
  for(const k in Ly.w||{}){const[x,y]=sedXY(k);if(!inR(x,y))continue;const w=Ly.w[k],i=EWALI[w.s];if(i==null)continue;M[y][x]=1;DEC[y][x]='';z.smw.set(y*n+x,[i,w.c||'']);C.res(x,y)}}
const _floor729=floor;floor=function(x,y,c,h){const z=ZZ;if(z&&z.smf&&c!==2&&z.smf.size){const m=z.smf.get(y*N+x);if(m!=null){const mt=EMAT[m]||EMAT[0];if(mt.pier&&typeof pierTile==='function'){pierTile(x,y,h);return}
    box(x,y,-6,1,1,6,(x+y)&1?mt.a:mt.b,.92+h*mt.v);if(mt.d)edFloorDet(x,y,mt,h);return}}_floor729(x,y,c,h)};
const _wall729=wall;wall=function(x,y,h){const z=ZZ;if(z&&z.smw&&z.smw.size){const w=z.smw.get(y*N+x);if(w){const st=EWAL[w[0]]||EWAL[0];st.f(x,y,h,w[1]||st.c);return}}_wall729(x,y,h)};
// pulire una casella toglie anche il muro
const _sedClear729=sedClear;sedClear=function(x,y){_sedClear729(x,y);const Ly=P.tw.set.lay;if(Ly.w)delete Ly.w[sedKey(x,y)]};
function sedPaintAt(x,y){const Ly=P.tw.set.lay,k=sedKey(x,y),T=SED.tool;if(!sedIn(x,y)||sedBldAt(x,y)||sedFoAt(x,y))return false;
  if(T==='mat'){Ly.f=Ly.f||{};if(Ly.f[k]===SED.mat)return false;const mt=EMAT[EMATI[SED.mat]];if(!mt)return false;if(!sedPayOK(sedMatCost(mt)))return false;Ly.f[k]=SED.mat;if(Ly.t[k]&&Ly.t[k]!=='g')delete Ly.t[k];return true}
  if(T==='wall'){Ly.w=Ly.w||{};if(sedDoorAt(x,y))return false;const cur=Ly.w[k];if(cur&&cur.s===SED.wl&&(cur.c||'')===(SED.wc||''))return false;const w=EWAL[EWALI[SED.wl]];if(!w)return false;
    if(!cur&&sedBlocks([[x,y]])){msg('Così chiuderesti il passaggio verso una porta, un mercante o verso di te');tone(150,.08);return false}if(!sedPayOK(sedWallCost(w)))return false;
    delete Ly.d[k];Ly.w[k]={s:SED.wl,c:SED.wc||''};if(!cur){M[y][x]=1}return true}
  return false}
const _sedClick729=sedClick;sedClick=function(x,y){const S=P.tw.set,Ly=S.lay,k=sedKey(x,y),T=SED.tool;
  if(T==='mat'||T==='wall'){if(sedPaintAt(x,y))return'paint';return}
  if(T==='del'){if(Ly.w&&Ly.w[k]){delete Ly.w[k];sedApply();return}if(!sedFoAt(x,y)&&!Ly.d[k]&&!(Ly.t[k]&&Ly.t[k]!=='g')&&Ly.f&&Ly.f[k]&&!sedBldAt(x,y)){delete Ly.f[k];sedApply();return}}
  if(T==='dec'){if(!sedFree(x,y)||(Ly.w&&Ly.w[k])){msg('Qui c\'è già un edificio, un muro o una porta');tone(150,.08);return}const c=SED.dc;
    if(c==='@fo'){const fo={k:'fo',x:x-1,y:y-1},cl4=[];for(let v=fo.y-1;v<=fo.y+2;v++)for(let u=fo.x-1;u<=fo.x+2;u++){if(!sedFree(u,v)){msg('La fontana è 4×4: qui non ci sta');tone(150,.08);return}cl4.push([u,v])}
      if(sedBlocks(cl4)){msg('Così chiuderesti il passaggio verso una porta o un mercante');tone(150,.08);return}if(!sedPayOK(sedDecCost('@fo')))return;for(const[u,v]of cl4)sedClear(u,v);Ly.p.push(fo);tone(600,.06,'triangle');sedApply();return}
    if(Ly.d[k]===c)return;const I=EDECI[c];if(!(I&&(I.walk||I.water))&&sedBlocks([[x,y]])){msg('Così chiuderesti il passaggio verso una porta o un mercante');tone(150,.08);return}
    if(!sedPayOK(sedDecCost(c)))return;Ly.d[k]=c;tone(560+Math.random()*80,.04,'triangle');sedApply();return}
  return _sedClick729(x,y)};
addEventListener('pointermove',ev=>{if(!SED.on||!SED.down||(SED.tool!=='mat'&&SED.tool!=='wall')||ev.target!==cv)return;const tl=sedTile(ev);if(!tl)return;const k=sedKey(tl[0],tl[1]);if(k===SED.lastp)return;SED.lastp=k;if(sedPaintAt(tl[0],tl[1]))SED.paint=k});
addEventListener('pointerup',()=>{SED.lastp=null});
// gli edifici su misura
function sedSetB(k,v){const b=SED.sel&&SED.sel.b;if(!b||!P.tw.set.lay.b.includes(b))return;if(k==='ht')v=clamp(+v|0,14,80);if(k==='smoke')v=v?1:0;if(k==='st'&&v==='')v=undefined;b[k]=v;sedApply()}
// il pannello
function sedDecList(){const q=(SED.q||'').toLowerCase().trim(),G={};
  if(!q&&SED.dg==='fav'){return SEDD.map(([g2,L])=>`<h5>${g2}</h5><div class="sedg">${L.map(([c,ic,nm])=>sedDecBtn(c,ic,nm)).join('')}</div>`).join('')}
  for(const d of EDEC){if(d.c[0]==='¿'&&!/Bacheca|Lavagna|Vaso|Lumino|Libro|Scrigno|Forziere|Piedistallo|Reliquia|Frammento|Cuore/.test(d.n))continue;if(q&&!d.n.toLowerCase().includes(q))continue;if(!q&&SED.dg!=='all'&&d.k!==SED.dg)continue;(G[d.k]=G[d.k]||[]).push(d)}
  const ks=Object.keys(G);if(!ks.length)return'<p class="mu">Nessun arredo con questo nome.</p>';
  return ks.map(k=>`<h5>${esc(k)}</h5><div class="sedg">${G[k].map(d=>sedDecBtn(d.c,SEDDN[d.c]?SEDDN[d.c][0]:SEDCI[d.k]||'▪',d.n)).join('')}</div>`).join('')}
const SEDCI={Natura:'🌿',Campagna:'🌾','Città':'🏛',Casa:'🪑',Castello:'🏰',Segrete:'💀',Guerra:'🛡',Porto:'⚓',Acqua:'🌊','Oggetti speciali':'✨'};
function sedDecBtn(c,ic,nm){return`<button title="${esc(nm)} · ${esc(sedCostTxt(sedDecCost(c)))}" class="${SED.dc===c?'on':''}" onclick="SED.dc=decodeURIComponent('${encodeURIComponent(c)}');sedUI()"><i>${ic}</i><small>${esc(nm)}</small><em>${sedCostTxt(sedDecCost(c))}</em></button>`}
function sedMatList(){const q=(SED.q||'').toLowerCase().trim(),G={};for(const m of EMAT){if(q&&!m.n.toLowerCase().includes(q))continue;(G[m.k||'Altro']=G[m.k||'Altro']||[]).push(m)}
  return Object.keys(G).map(k=>`<h5>${esc(k)}</h5><div class="sedm">${G[k].map(m=>`<button title="${esc(m.n)} · ${esc(sedCostTxt(sedMatCost(m)))}" class="${SED.mat===m.id?'on':''}" onclick="SED.mat='${m.id}';sedUI()"><i style="background:linear-gradient(135deg,${m.a} 50%,${m.b} 50%)"></i><small>${esc(m.n.replace(/^(Terreno|Strada|Pavimento|Dungeon) · /,''))}</small><em>${sedCostTxt(sedMatCost(m))}</em></button>`).join('')}</div>`).join('')}
sedUI=function(){let el=$('sed');if(!el){el=document.createElement('div');el.id='sed';document.body.appendChild(el)}if(!SED.on){el.hidden=true;return}el.hidden=false;
  const S=P.tw.set,Ly=S.lay,T=SED.tool,tb=(k,n)=>`<button class="${T===k?'on':''}" onclick="sedTool('${k}')">${n}</button>`,nc=Ly.b.filter(b=>b.k==='casa').length;
  const sc=el.querySelector('.sedb'),top=sc?sc.scrollTop:0;
  let h=`<div class="sedh"><b>✏ ${esc(S.n)}</b><span class="sedres">💰${P.g|0} 🪵${P.res.legna|0} 🪨${P.res.pietra|0} 🧱${P.res.argilla|0} ⛓${P.res.ferro|0}</span><button class="pri" onclick="sedClose()">✔ Fine</button></div>
    <div class="sedt">${tb('bld','🏠 Edifici')}${tb('road','🛣 Strade')}${tb('mat','🟫 Terreno')}${tb('wall','🧱 Muri')}${tb('dec','🌳 Arredi')}${tb('mk','🛒 Banco')}${tb('bn','🚩 Stendardo')}${tb('del','🧽 Gomma')}</div><div class="sedb">`;
  if(T==='bld'){const b=SED.sel&&SED.sel.b,placed=b&&Ly.b.includes(b);
    h+=b?`<p class="sedi">${placed?'Clicca dove vuoi spostare':'Clicca dove vuoi costruire'}: <b>${SEDKN[b.k]||'Casa'}</b> ${b.w}×${b.h}. <button onclick="SED.sel=null;sedUI()">Annulla</button></p>`:`<p class="sedi">Clicca su un edificio per sceglierlo: lo sposti e lo fai su misura. O aggiungi una casa.</p>`;
    h+=`<div class="sedr"><button onclick="sedNewHouse()" ${nc>=sedMaxCase()?'disabled':''}>＋ Nuova casa</button><span class="mu">${nc} di ${sedMaxCase()} case</span></div>`;
    if(!b||b.k==='casa')h+=`<div class="sedr">${[[3,3],[4,3],[5,3],[4,4],[5,4],[6,4],[6,5]].map(([w,hh])=>`<button class="${SED.sz[0]===w&&SED.sz[1]===hh?'on':''}" onclick="sedSize(${w},${hh})">${w}×${hh}</button>`).join('')}</div>`;
    if(placed){const th=TWSTH[S.col|0]||TWSTH[0];h+=`<div class="sedcu"><h5>Su misura</h5>
      <label>Stile <select onchange="sedSetB('st',this.value)">${EBLD.filter(x=>!x.smoke).map(x=>`<option value="${x.st}" ${(b.st||'')===x.st?'selected':''}>${esc(x.n)}</option>`).join('')}</select></label>
      <label>Muri <input type="color" value="${b.wall||th[1][0]}" onchange="sedSetB('wall',this.value)"></label><label>Tetto <input type="color" value="${b.roof||th[2][0]}" onchange="sedSetB('roof',this.value)"></label>
      <label>Altezza <input type="range" min="14" max="80" value="${b.ht||24}" onchange="sedSetB('ht',this.value)"></label><label><input type="checkbox" ${b.smoke!=null?(b.smoke?'checked':''):(b.id%2?'checked':'')} onchange="sedSetB('smoke',this.checked)"> Camino che fuma</label></div>`}
    h+=`<div class="sedl">${Ly.b.map(x=>`<button class="${b===x?'on':''}" onclick="SED.sel={b:P.tw.set.lay.b.find(q=>q.id===${x.id})};sedUI()">${SEDKN[x.k]||'🏠 Casa'}${x.k!=='casa'&&!setB(x.k)?' <i>(da costruire)</i>':''}</button>`).join('')}</div>`}
  else if(T==='road')h+=`<p class="sedi">Le strade del luogo: clicca o trascina.</p><div class="sedr">${[['4','⬜ Lastricato'],['1','🟫 Sentiero'],['g','🟩 Erba']].map(([c,n])=>`<button class="${SED.rc===c?'on':''}" onclick="SED.rc='${c}';sedUI()">${n}</button>`).join('')}</div><p class="mu">Per tutti gli altri pavimenti c'è lo strumento Terreno.</p>`;
  else if(T==='mat')h+=`<p class="sedi">Scegli il pavimento e clicca o trascina sulla mappa. La gomma lo toglie.</p><input class="sedq" placeholder="Cerca un pavimento..." value="${esc(SED.q)}" oninput="SED.q=this.value;sedList()"><div id="sedlist">${sedMatList()}</div>`;
  else if(T==='wall')h+=`<p class="sedi">Scegli il muro e il colore, poi clicca o trascina. I muri non si attraversano.</p><div class="sedr"><label>Colore <input type="color" value="${SED.wc||(EWAL[EWALI[SED.wl]]||EWAL[0]).c}" onchange="SED.wc=this.value;sedUI()"></label><button onclick="SED.wc='';sedUI()">Colore originale</button></div>
    <div class="sedl">${EWAL.map(w=>`<button class="${SED.wl===w.id?'on':''}" onclick="SED.wl='${w.id}';SED.wc='';sedUI()"><i class="sedsw" style="background:${w.c}"></i> ${esc(w.n)} <em>${sedCostTxt(sedWallCost(w))}</em></button>`).join('')}</div>`;
  else if(T==='dec'){const cats=['fav','all',...new Set(EDEC.map(d=>d.k))];h+=`<p class="sedi">Scegli e clicca sulla mappa. Ogni arredo costa le sue risorse.</p><input class="sedq" placeholder="Cerca un arredo..." value="${esc(SED.q)}" oninput="SED.q=this.value;sedList()">
    <div class="sedr">${cats.map(k=>`<button class="${SED.dg===k?'on':''}" onclick="SED.dg='${k}';SED.q='';sedUI()">${k==='fav'?'⭐ Preferiti':k==='all'?'Tutti':esc(k)}</button>`).join('')}</div><div id="sedlist">${sedDecList()}</div>`}
  else if(T==='mk')h+=`<p class="sedi">${setB('mercato')?'Clicca dove mettere il banco: il mercante starà dietro, e lì resterà.':'Prima costruisci il Mercato dal registro (U).'}</p>`;
  else if(T==='bn')h+=`<p class="sedi">Clicca dove piantare lo stendardo del borgo.</p>`;
  else h+=`<p class="sedi">Clicca su un muro, un arredo, una strada, un pavimento, una fontana o una casa per toglierli.</p>`;
  h+=`</div><div class="sedf"><button onclick="sedReset()">↺ Ripristina il borgo automatico</button></div>`;el.innerHTML=h;const sc2=el.querySelector('.sedb');if(sc2)sc2.scrollTop=top;if(typeof iconFill==='function')iconFill(el)};
function sedList(){const el=$('sedlist');if(!el)return;el.innerHTML=SED.tool==='mat'?sedMatList():sedDecList();if(typeof iconFill==='function')iconFill(el)}
const _sedTool729=sedTool;sedTool=function(t){SED.q='';_sedTool729(t)};
document.head.insertAdjacentHTML('beforeend',`<style>
#sed{width:330px}#sed .sedres{font-size:11.5px;color:#f0e8d8!important;white-space:nowrap}#sed .sedg button em,#sed .sedm button em,#sed .sedl em{font-style:normal;font-size:9.5px;color:#ffd84a;opacity:.85}
#sed .sedm{display:grid;grid-template-columns:repeat(4,1fr);gap:4px}#sed .sedm button{display:flex;flex-direction:column;align-items:center;padding:5px 2px}#sed .sedm i{display:block;width:30px;height:20px;border-radius:4px;border:1px solid #0006}
#sed .sedm small{font-size:9.5px;opacity:.85;line-height:1.1;text-align:center}#sed .sedq{width:100%;box-sizing:border-box;margin:4px 0 6px;padding:6px 8px;border-radius:7px;border:1px solid #ffffff33;background:#0005;color:#fff}
#sed .sedsw{display:inline-block;width:14px;height:14px;border-radius:3px;vertical-align:middle;border:1px solid #0008}#sed .sedcu{border:1px solid #ffd84a44;border-radius:8px;padding:6px 8px;margin:6px 0;display:flex;flex-direction:column;gap:5px}
#sed .sedcu label{display:flex;align-items:center;gap:8px;justify-content:space-between}#sed .sedcu select{background:#222;color:#fff;border-radius:6px;border:1px solid #ffffff33;padding:3px}
#sed .sedt button{padding:4px 6px;font-size:12px}#sed input[type=color]{width:48px;height:26px;padding:0;border:1px solid #ffffff44;border-radius:5px;background:none;flex:none;min-width:0}#sed input[type=range]{flex:1;max-width:150px}@media (max-width:700px){#sed{width:auto}}</style>`);
// un edificio appena costruito trova un posto da cui la sua porta si raggiunge, senza chiudere le altre
function setPlaceNew(k){const S=P.tw.set,Ly=S&&S.lay;if(!Ly||!Ly.v||Zk!==S.k||!SETBA.includes(k)||Ly.b.some(b=>b.k===k))return;const c=Ly.c,R=sedR();
  for(const[w,h]of[[4,3],[3,3]])for(let r=3;r<R;r++)for(let i=0;i<32;i++){const a=i/32*6.283,b={id:Ly.nid,k,x:Math.round(c[0]+Math.cos(a)*r)-(w>>1),y:Math.round(c[1]+Math.sin(a)*r)-1,w,h};if(!sedBldOK(b))continue;
    const cl=[];for(let v=b.y;v<b.y+h;v++)for(let u=b.x;u<b.x+w;u++)cl.push([u,v]);if(sedBlocks(cl))continue;
    if(!SEDND.has(k)){const old=cl.map(([x,y])=>M[y][x]);for(const[x,y]of cl)M[y][x]=6;const d=sedBfs();cl.forEach(([x,y],j)=>M[y][x]=old[j]);const[dx,dy]=sedDoor(b);if(!sedReach(d,dx,dy))continue}
    b.id=Ly.nid++;Ly.b.push(b);return}}
