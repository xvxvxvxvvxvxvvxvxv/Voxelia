/* ================= aspetto dell'eroe ================= */
// Pelle, capelli, occhi, barba, tunica, pantaloni, mantello, corporatura; l'elmo si può nascondere.
// L'aspetto si salva con l'eroe, è la scelta predefinita per le partite nuove e lo vedono anche gli altri giocatori.
const APK=['sk','hs','hc','ec','bd','tu','pa','ca','sz','hh'];
const APO={
  sk:{n:'Pelle',c:['#ffdfc0','#f1c27d','#d9a066','#b07a4a','#8d5524','#5c3a1e']},
  hs:{n:'Capelli',o:['Rasati','Corti','Lunghi','Coda','Cresta','Ricci']},
  hc:{n:'Colore dei capelli',c:['#2a1b10','#5a3a1e','#9a6430','#e0c070','#c0502a','#e8e8e8','#3a3a3a','#2a6ab8','#8a3ac8']},
  ec:{n:'Occhi',c:['#2a2a32','#3a6aa8','#3a8a4a','#7a4a2a','#8a2a8a','#c8a020']},
  bd:{n:'Barba',o:['Nessuna','Corta','Lunga','Baffi']},
  tu:{n:'Tunica',c:['#3a6ea5','#a83a3a','#3a8a4a','#6a3a8a','#c8a040','#3a3a42','#e8e4d8','#d86a2a']},
  pa:{n:'Pantaloni',c:['#333344','#5a3a1e','#2a3a5a','#4a4a4a','#6a2a2a','#3a5a3a']},
  ca:{n:'Mantello',c:[null,'#a8303a','#2a4a8a','#2a6a3a','#5a2a7a','#1a1a22','#d4af37']},
  sz:{n:'Corporatura',o:['Minuta','Normale','Robusta']},
  hh:{n:'Elmo',o:['Visibile','Nascosto']}};
const APD={sk:1,hs:1,hc:1,ec:0,bd:0,tu:0,pa:0,ca:0,sz:1,hh:0};
function apFix(a){const o=Object.assign({},APD);if(Array.isArray(a))a.forEach((v,i)=>{if(APK[i])o[APK[i]]=v});else if(a&&typeof a==='object')Object.assign(o,a);
  for(const k of APK){const n=(APO[k].c||APO[k].o).length;o[k]=clamp(Math.floor(+o[k]||0),0,n-1)}return o}
const apPack=a=>APK.map(k=>a[k]|0);
let APM=apFix(LS.get('voxelia_ap',APD));
// modello voxel dell'eroe: come prima (gambe, busto, braccia, testa, scudo, arma) più capelli, occhi, barba e mantello
function heroL(ap,c,h,w,wv,s,sw){const a=ap&&ap.sk!=null?ap:apFix(ap),sk=APO.sk.c[a.sk],hc=APO.hc.c[a.hc],tu=c>=0?RC[c]:APO.tu.c[a.tu],pa=APO.pa.c[a.pa],ca=APO.ca.c[a.ca];
  const L=[[-.2,-.1,0,.15,.2,9,pa],[.05,-.1,0,.15,.2,9,pa],[-.22,-.14,9,.44,.28,12,tu],[-.34,-.08,10,.12,.16,10,sk],[.22,-.08,10,.12,.16,10,sk],[-.15,-.12,21,.3,.24,10,sk]];
  if(c<0)L.push([-.23,-.15,10,.46,.3,2,'#5a3a1e']);
  if(ca)L.push([-.3,-.21,3,.6,.06,19,ca],[-.36,-.2,20,.72,.16,3,ca]);
  L.push([-.09,.12,25,.06,.01,2.5,APO.ec.c[a.ec]],[.04,.12,25,.06,.01,2.5,APO.ec.c[a.ec]]);
  if(a.bd===1)L.push([-.15,.12,21,.3,.02,3,hc]);else if(a.bd===2)L.push([-.15,.12,16,.3,.03,8,hc],[.15,-.1,21,.02,.22,4,hc]);else if(a.bd===3)L.push([-.1,.12,22.5,.2,.02,1.5,hc]);
  const helm=h>=0&&!a.hh;
  if(!helm)switch(a.hs){case 1:L.push([-.16,-.13,29,.32,.26,3,hc],[-.16,-.16,23,.32,.05,7,hc]);break;
    case 2:L.push([-.17,-.14,28,.34,.28,4,hc],[-.17,-.19,14,.34,.07,17,hc],[-.18,-.14,16,.05,.2,13,hc],[.13,-.14,19,.05,.14,10,hc]);break;
    case 3:L.push([-.16,-.13,29,.32,.26,3,hc],[-.16,-.17,24,.32,.05,6,hc],[-.04,-.24,15,.08,.08,13,hc]);break;
    case 4:L.push([-.04,-.13,31,.08,.26,5,hc],[-.16,-.13,26,.32,.03,4,hc]);break;
    case 5:L.push([-.18,-.15,28,.36,.3,4,hc],[-.12,-.09,32,.24,.18,2,hc],[-.18,-.18,21,.36,.06,8,hc],[-.19,-.15,22,.05,.3,7,hc],[.14,-.15,25,.05,.16,4,hc]);break}
  if(helm)L.push([-.17,-.14,31,.34,.28,4,RC[h]]);
  if(s>=0)L.push([-.38,0,8,.1,.2,12,RC[s]]);
  L.push([.3,-.04+(sw>0?.25:0),12,.07,.07,12+Math.min(30,(wv||3)*.4),RC[w]||'#cccccc']);
  // ordine di disegno per profondità (dal fondo al davanti, poi dal basso in alto), così mantello, capelli e barba si sovrappongono giusti
  L.sort((p,q)=>(p[0]+p[3]/2+p[1]+p[4]/2)-(q[0]+q[3]/2+q[1]+q[4]/2)||p[2]-q[2]);
  const k=[.92,1,1.08][a.sz];return k===1?L:scl(L,k)}
// ruota il modello di 90° alla volta (per l'anteprima)
const rotL=(L,n)=>{let R=L;for(let i=0;i<(n&3);i++)R=R.map(b=>[-(b[1]+b[4]),b[0],b[2],b[4],b[3],b[5],b[6]]);return R};
/* ---- direzione dell'eroe: 8 versi, cambio istantaneo (nessuna animazione) ---- */
// 0 = guarda verso +y (in basso a sinistra sullo schermo); ogni passo ruota di 45°
const faceOf=(dx,dy)=>((Math.round((Math.atan2(dy,dx)-Math.PI/2)/(Math.PI/4))%8)+8)%8;
const dsort=(p,q)=>(p[0]+p[3]/2+p[1]+p[4]/2)-(q[0]+q[3]/2+q[1]+q[4]/2)||p[2]-q[2];
// scatola ruotata di un angolo qualsiasi attorno a (ox,oy): disegna solo le facce rivolte verso chi guarda, poi il tetto
function rbox(x,y,z,w,d,h,c,ca,sa,ox,oy){const T=z+h,Q=[[x,y],[x+w,y],[x+w,y+d],[x,y+d]].map(([u,v])=>[ox+u*ca-v*sa,oy+u*sa+v*ca]);
  if(h>0)for(let i=0;i<4;i++){const p=Q[i],q=Q[(i+1)&3],nx=q[1]-p[1],ny=p[0]-q[0];if(nx+ny<=1e-6)continue;const l=nx*nx+ny*ny||1,f=(.58*nx*Math.max(0,nx)+.78*ny*Math.max(0,ny))/l+.68*(Math.min(0,nx)**2+Math.min(0,ny)**2)/l;
    poly([PX(p[0],p[1]),PY(p[0],p[1],T),PX(q[0],q[1]),PY(q[0],q[1],T),PX(q[0],q[1]),PY(q[0],q[1],z),PX(p[0],p[1]),PY(p[0],p[1],z)],sh(c,f))}
  poly([PX(Q[0][0],Q[0][1]),PY(Q[0][0],Q[0][1],T),PX(Q[1][0],Q[1][1]),PY(Q[1][0],Q[1][1],T),PX(Q[2][0],Q[2][1]),PY(Q[2][0],Q[2][1],T),PX(Q[3][0],Q[3][1]),PY(Q[3][0],Q[3][1],T)],sh(c,1))}
// disegna il modello dell'eroe girato nella direzione fc (0..7)
function drawHero(L,x,y,zo,white,fc){fc=(fc|0)&7;const R=rotL(L,fc>>1);if(!(fc&1)){drawL(isoOrder(R,0),x,y,zo,white);return}
  const k=Math.SQRT1_2;for(const b of isoOrder(R,1))rbox(b[0],b[1],b[2]+zo,b[3],b[4],b[5],white?'#ffffff':b[6],k,k,x,y)}
// disegna un eroe in una tela (anteprima, profilo); rot va da 0 a 7 (passi di 45°)
function paintHero(cv2,ap,eq,rot=0,bob=0){const q=cv2.getContext('2d'),w=cv2.width,h=cv2.height;q.setTransform(1,0,0,1,0,0);q.globalAlpha=1;q.clearRect(0,0,w,h);const og=g;g=q;const sc=Math.min(h/76,w/50);
  try{g.setTransform(sc,0,0,sc,w/2,h*.82);g.fillStyle='rgba(0,0,0,.22)';g.beginPath();g.ellipse(0,0,16,7,0,0,6.3);g.fill();
    const e=eq||{};drawHero(heroL(ap,e.c==null?-1:e.c,e.h==null?-1:e.h,e.w==null?0:e.w,e.wv||12,e.s==null?-1:e.s,0),0,0,bob,0,rot)}finally{g=og}}
const myEq=()=>({c:P&&P.eq.c?P.eq.c.r:-1,h:P&&P.eq.h?P.eq.h.r:-1,w:P&&P.eq.w?P.eq.w.r:0,wv:P&&P.eq.w?iv(P.eq.w):12,s:P&&P.eq.s?P.eq.s.r:-1});

/* ---- finestra "Aspetto dell'eroe" (dal menu, dalle impostazioni, con il tasto C) ---- */
let LKA=null,LKR=0,LKT=0;
function openLook(){auInit();$('ztc').className='';LKA=Object.assign({},started&&P?apFix(P.ap):APM);LKR=0;lookHTML();$('look').style.display='block';if(!LKT)LKT=requestAnimationFrame(lookAnim)}
function closeLook(){$('look').style.display='none';cancelAnimationFrame(LKT);LKT=0}
function lookHTML(){const row=k=>{const o=APO[k];let h=`<div class="lkr"><span>${o.n}</span><span>`;
    if(o.c)h+=o.c.map((c,i)=>`<button class="sw${LKA[k]===i?' on':''}" style="background:${c||'repeating-linear-gradient(45deg,#555 0 4px,#333 4px 8px)'}" title="${c?o.n+' '+(i+1):'Nessuno'}" aria-label="${o.n} ${c?i+1:'nessuno'}" onclick="LKA.${k}=${i};lookHTML()"></button>`).join('');
    else h+=`<span class="seg">${o.o.map((n,i)=>`<button class="${LKA[k]===i?'on':''}" onclick="LKA.${k}=${i};lookHTML()">${n}</button>`).join('')}</span>`;return h+'</span></div>'};
  $('look').innerHTML=`<h3>${ico('pennello',24)} Aspetto dell'eroe</h3><div class="lkg"><div class="lkp"><canvas id="lkc" width="180" height="230"></canvas><div><button onclick="LKR=(LKR+7)%8" aria-label="Ruota a sinistra">⟲</button><button onclick="LKR=(LKR+1)%8" aria-label="Ruota a destra">⟳</button></div></div>
  <div class="lko">${APK.map(row).join('')}</div></div><p class="mu">${started?'Gli altri giocatori ti vedono così.':'Vale per le partite nuove e per il tuo eroe salvato.'}</p>
  <button onclick="lookRandom()">🎲 Casuale</button><button onclick="LKA=Object.assign({},APD);lookHTML()">Ripristina</button><button class="gold" onclick="lookSave()">Salva</button><button onclick="closeLook()">Annulla</button>`}
function lookAnim(n){LKT=requestAnimationFrame(lookAnim);const c=$('lkc');if(c&&LKA)paintHero(c,LKA,started?myEq():{c:-1,h:-1,w:0,wv:12,s:-1},LKR,Math.abs(Math.sin(n/300))*1.5)}
function lookRandom(){for(const k of APK){if(k==='hh')continue;const n=(APO[k].c||APO[k].o).length;LKA[k]=Math.floor(Math.random()*n)}lookHTML()}
function lookSave(){const a=apFix(LKA);APM=a;LS.set('voxelia_ap',a);
  if(started&&P){P.ap=a;save();sceneEquip();msg('Nuovo aspetto salvato')}
  else{const s=LS.get(SAVEK,null);if(s&&s.p){s.p.ap=a;LS.set(SAVEK,s)}msg('Aspetto salvato')}
  closeLook();if(!started)menuPort()}
// ritratti nei pannelli: <canvas class="port" data-ap="[...]" data-eq="{...}">
function paintPorts(root){for(const c of root.querySelectorAll('canvas.port')){try{paintHero(c,apFix(JSON.parse(c.dataset.ap||'null')),JSON.parse(c.dataset.eq||'{}'),0,0)}catch(e){}}}
