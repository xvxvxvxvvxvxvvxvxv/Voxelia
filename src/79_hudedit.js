/* ================= HUD personalizzabile: spostare e ingrandire gli elementi ================= */
// Le posizioni si salvano nelle impostazioni come frazioni della finestra (così reggono il cambio di dimensione),
// la grandezza come scala tra 0,6 e 1,8.
const HUDE=[['hud','Eroe'],['mm','Minimappa e bussola'],['clk','Orologio'],['qt','Missioni'],['bar','Barra delle azioni'],['ruota','Ruota delle azioni'],['chw','Chat'],['zn','Nome della zona']];
let HED=0;
function hudApply(){const L=SET.hudl||{};for(const[id]of HUDE){const el=$(id);if(!el)continue;const o=L[id];
  if(!o){for(const p of['left','top','right','bottom','transform','transformOrigin'])el.style[p]='';continue}
  el.style.right='auto';el.style.bottom='auto';el.style.transformOrigin='0 0';el.style.transform=`scale(${o.s||1})`;
  el.style.left=Math.round(o.x*innerWidth)+'px';el.style.top=Math.round(o.y*innerHeight)+'px';
  const r=el.getBoundingClientRect();if(r.width){const x=clamp(r.left,0,Math.max(0,innerWidth-r.width)),y=clamp(r.top,0,Math.max(0,innerHeight-r.height));el.style.left=Math.round(x)+'px';el.style.top=Math.round(y)+'px'}}}
function hudGet(id){const L=SET.hudl||(SET.hudl={});if(!L[id]){const r=$(id).getBoundingClientRect();L[id]={x:r.left/innerWidth,y:r.top/innerHeight,s:1}}return L[id]}
function hudSave(){LS.set('voxelia_set',SET)}
function hudEdit(on){if(on&&!started){msg('Entra in partita per modificare l\'HUD');return}HED=on?1:0;document.body.classList.toggle('hudedit',!!on);const box=$('hude');
  if(!on){box.style.display='none';box.innerHTML='';hudSave();return}
  cl();closeSet();box.style.display='block';hudFrames()}
function hudFrames(){const box=$('hude');let h=`<div class="hetb"><b>${ico('mano',20)} Personalizza l'HUD</b><span>Trascina gli elementi per spostarli · − e + (o la rotellina) per la grandezza · doppio clic per rimetterlo al suo posto</span><label class="hesn"><input type="checkbox" id="hesnap" ${SET.hudsnap!==0?'checked':''} onchange="SET.hudsnap=this.checked?1:0;hudSave()"> Aggancio alle linee guida</label><span>Le linee guida compaiono mentre trascini: bordi e centro dello schermo e degli altri elementi. Tieni premuto Alt per spostare liberamente.</span><span><button onclick="SET.hudl={};hudApply();hudFrames()">Ripristina tutto</button><button class="gold" onclick="hudEdit(0)">Fatto</button></span></div>`;
  for(const[id,n]of HUDE){const el=$(id);if(!el)continue;const r=el.getBoundingClientRect();if(!r.width||!r.height||getComputedStyle(el).display==='none')continue;const s=((SET.hudl||{})[id]||{}).s||1;
    h+=`<div class="hef${r.top<26?' lb':''}" data-id="${id}" style="left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px"><i>${n} · ${Math.round(s*100)}%</i><span><button data-a="-" aria-label="Rimpicciolisci ${n}">−</button><button data-a="+" aria-label="Ingrandisci ${n}">+</button></span></div>`}
  box.innerHTML=h}
function hudScale(id,d){const o=hudGet(id);o.s=clamp(Math.round(((o.s||1)+d)*10)/10,.6,1.8);hudApply();hudSave();hudFrames()}
/* ---- linee guida e aggancio: mentre si trascina, i bordi e il centro dell'elemento si allineano a quelli dello schermo
   (con un margine di 12 px) e degli altri elementi dell'HUD; le linee mostrano a cosa si sta allineando ---- */
const HSNAP=8,HMARG=12;
function hudTargets(id){const W=innerWidth,H=innerHeight,X=[[0,0],[HMARG,0],[W/2,1],[W-HMARG,0],[W,0]],Y=[[0,0],[HMARG,0],[H/2,1],[H-HMARG,0],[H,0]];
  for(const[k]of HUDE){if(k===id)continue;const el=$(k);if(!el||getComputedStyle(el).display==='none')continue;const r=el.getBoundingClientRect();if(!r.width||!r.height)continue;
    X.push([r.left,0],[r.right,0],[r.left+r.width/2,1]);Y.push([r.top,0],[r.bottom,0],[r.top+r.height/2,1])}return{X,Y}}
// p: posizione proposta (sinistra o alto), w: grandezza; ritorna la posizione agganciata e le linee da mostrare
function hudSnap1(p,w,T,snap){const pts=[p,p+w/2,p+w],lim=snap?HSNAP:.75;let best=null;
  for(let j=0;j<3;j++)for(const[v,c]of T){const d=v-pts[j];if(Math.abs(d)<=lim&&(!best||Math.abs(d)<Math.abs(best.d)-.01))best={d,v,c}}
  if(!best)return{p,L:[]};const np=snap?p+best.d:p,L=[];
  for(let j=0;j<3;j++){const q=[np,np+w/2,np+w][j];for(const[v,c]of T)if(Math.abs(v-q)<=.75&&!L.some(l=>Math.abs(l[0]-v)<.5))L.push([v,c])}return{p:np,L}}
function hudGuides(Lx,Ly){const box=$('hude');let g=box.querySelector('.hegs');if(!g){g=document.createElement('div');g.className='hegs';box.appendChild(g)}
  g.innerHTML=Lx.map(([v,c])=>`<div class="heg v${c?' c':''}" style="left:${Math.round(v)}px"></div>`).join('')+Ly.map(([v,c])=>`<div class="heg h${c?' c':''}" style="top:${Math.round(v)}px"></div>`).join('')}
(()=>{const box=$('hude');let drag=null;
  box.addEventListener('pointerdown',e=>{const b=e.target.closest('button');const f=e.target.closest('.hef');if(!f)return;const id=f.dataset.id;
    if(b){e.preventDefault();hudScale(id,b.dataset.a==='+'?.1:-.1);return}
    const o=hudGet(id),r=$(id).getBoundingClientRect();drag={id,o,dx:e.clientX-r.left,dy:e.clientY-r.top,f,sx:e.clientX,sy:e.clientY,mv:0,T:hudTargets(id)};f.setPointerCapture(e.pointerId);f.classList.add('drag');e.preventDefault()});
  box.addEventListener('pointermove',e=>{if(!drag)return;if(!drag.mv&&Math.hypot(e.clientX-drag.sx,e.clientY-drag.sy)<3)return;drag.mv=1;const el=$(drag.id),r=el.getBoundingClientRect();
    let x=clamp(e.clientX-drag.dx,0,Math.max(0,innerWidth-r.width)),y=clamp(e.clientY-drag.dy,0,Math.max(0,innerHeight-r.height));
    const sn=SET.hudsnap!==0&&!e.altKey,ax=hudSnap1(x,r.width,drag.T.X,sn),ay=hudSnap1(y,r.height,drag.T.Y,sn);
    x=clamp(ax.p,0,Math.max(0,innerWidth-r.width));y=clamp(ay.p,0,Math.max(0,innerHeight-r.height));hudGuides(ax.L,ay.L);
    drag.o.x=x/innerWidth;drag.o.y=y/innerHeight;hudApply();const r2=el.getBoundingClientRect();Object.assign(drag.f.style,{left:r2.left+'px',top:r2.top+'px'})});
  // senza spostamento non si ridisegnano le cornici, altrimenti il doppio clic (rimetti al suo posto) non arriva mai
  const end=()=>{if(!drag)return;drag.f.classList.remove('drag');const hg=box.querySelector('.hegs');if(hg)hg.remove();const mv=drag.mv;drag=null;if(mv){hudSave();hudFrames()}};
  box.addEventListener('pointerup',end);box.addEventListener('pointercancel',end);
  box.addEventListener('wheel',e=>{const f=e.target.closest('.hef');if(!f)return;e.preventDefault();hudScale(f.dataset.id,e.deltaY<0?.1:-.1)},{passive:false});
  box.addEventListener('dblclick',e=>{const f=e.target.closest('.hef');if(!f)return;if(SET.hudl)delete SET.hudl[f.dataset.id];hudApply();hudSave();hudFrames()})})();
addEventListener('resize',()=>{hudApply();if(HED)hudFrames()});
