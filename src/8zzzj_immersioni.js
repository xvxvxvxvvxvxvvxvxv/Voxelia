/* ================= 7.46: le immersioni nel mare =================
   Al Porto, in fondo alla banchina, c'è la Boa dei tuffatori (e in Tomorrow nelle regioni con tanta acqua): ci si tuffa
   e si scende sul fondo del mare. Là sotto ci sono le rovine sommerse, coralli, forzieri e creature degli abissi, ma
   l'aria è poca: la barra blu dell'ossigeno scende, e si riempie solo nelle colonne di bolle o tornando su dalla cima.
   Senza ossigeno si perde vita. Ogni immersione è diversa e ogni giorno il fondale cambia. */
const SUB46={o:30,mx:30,from:null,fx:0,fy:0,n:0};
Z.abissi46={n:'Fondale marino',lv:1,N:34,int:1,sub46:1,fl:'#3e6a70',fl2:'#3a6268',wall:'#4a6a6a',bg:'#04121c',tc:'#6fffe0',pt:'bubble',mus:'pesca',c:0};
function subPlace(){if(!ZZ||!started||ZZ.sub46||ents.some(e=>e.k==='boa46'))return;let c=null;
  if(Zk==='porto')c=[20,30];else if(typeof twOn==='function'&&twOn()&&String(Zk).startsWith('tw:')&&!ZZ.dg){let n=0;for(let y=0;y<N;y++)for(let x=0;x<N;x++)if(M[y][x]===2)n++;if(n<60)return;c=[N>>1,N>>1]}if(!c)return;
  // una casella di riva accanto all'acqua, la più vicina al punto scelto
  let best=null,bd=1e9;for(let y=2;y<N-2;y++)for(let x=2;x<N-2;x++){if(!(M[y][x]===0||M[y][x]===4)||DEC[y][x]&&DEC[y][x][0]!=='₪')continue;if(![[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>M[y+b][x+a]===2))continue;
    if(ents.some(e=>Math.abs(e.px-x-.5)<1.5&&Math.abs(e.py-y-.5)<1.5))continue;const q=Math.hypot(x-c[0],y-c[1]);if(q<bd){bd=q;best=[x,y]}}
  if(best)ents.push({k:'boa46',px:best[0]+.5,py:best[1]+.5,n:'Boa dei tuffatori'})}
const _loadPost746i=loadPost;loadPost=function(k){_loadPost746i(k);try{subPlace()}catch(e){console.warn('immersioni',e)}if(ZZ&&ZZ.sub46){SUB46.o=SUB46.mx}else{const el=$('ox46');if(el)el.hidden=true}
  if(LFROM==='abissi46'&&SUB46.from===k){const[x,y]=nearFree(SUB46.fx|0,SUB46.fy|0);heroPut(x,y)}};
ITK.add('boa46');ITK.add('cima46');ITK.add('aria46');
const _act746i=act;act=function(e){if(e&&e.k==='boa46'){if(P.cav&&P.cav.on)P.cav.on=0;SUB46.from=Zk;SUB46.fx=e.px;SUB46.fy=e.py;SUB46.n++;Z.abissi46.lv=Math.max(1,ZZ.lv||P.lv);tone(300,.3,'sine',.05);irisGo(()=>{load('abissi46',Zk);msg('Sei sott\'acqua: tieni d\'occhio la barra blu dell\'ossigeno!')});return}
  if(e&&e.k==='cima46'){const to=SUB46.from||'porto';tone(500,.25,'sine',.05);irisGo(()=>load(to,'abissi46'));return}
  if(e&&e.k==='aria46'){SUB46.o=SUB46.mx;msg('Respiri a fondo dalla colonna di bolle');return}_act746i(e)};
// il fondale: sabbia, coralli, rovine sommerse, forzieri, colonne di bolle e creature
function subGen(z){const r=sd(hs('fondale|'+dayKey()+'|'+(SUB46.from||'')+'|'+SUB46.n)),n=N,c=n>>1;
  for(let y=0;y<n;y++)for(let x=0;x<n;x++){const ed=!x||!y||x===n-1||y===n-1;M[y][x]=ed?1:0;DEC[y][x]=''}
  // le rovine: due o tre recinti di colonne rotte
  for(let k=0;k<3;k++){const x0=4+Math.floor(r()*(n-12)),y0=4+Math.floor(r()*(n-14)),w=4+Math.floor(r()*3),h=4+Math.floor(r()*3);
    for(let y=y0;y<y0+h;y++)for(let x=x0;x<x0+w;x++)if((x===x0||y===y0||x===x0+w-1||y===y0+h-1)&&r()<.65&&Math.hypot(x-c,y-(n-4))>4)M[y][x]=1;
    if(r()<.8)ents.push({k:'ch',px:x0+w/2,py:y0+h/2,rich:k===0?1:0})}
  for(let i=0;i<40;i++){const x=2+Math.floor(r()*(n-4)),y=2+Math.floor(r()*(n-4));if(M[y][x]===0&&Math.hypot(x-c,y-(n-4))>3){M[y][x]=6;DEC[y][x]=r()<.6?'ꞇ':'꞉'}}
  const sp=[c,n-4];for(let y=n-6;y<n-2;y++)for(let x=c-1;x<=c+1;x++){M[y][x]=0;DEC[y][x]=''}
  ents.push({k:'cima46',px:c+.5,py:n-2.5,n:'Cima per risalire'});
  const fr=[];for(let y=2;y<n-2;y++)for(let x=2;x<n-2;x++)if(M[y][x]===0&&Math.hypot(x-c,y-(n-4))>6)fr.push([x,y]);for(let i=fr.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[fr[i],fr[j]]=[fr[j],fr[i]]}
  for(let i=0;i<4&&fr.length;i++){const q=fr.pop();ents.push({k:'aria46',px:q[0]+.5,py:q[1]+.5,n:'Colonna di bolle'})}
  const pool=['uomo_pesce','medusa','granchio'].filter(k=>E[k]);for(let i=0;i<6&&fr.length;i++){const q=fr.pop();ents.push(mk(pool[i%pool.length],q[0],q[1]))}
  for(let i=0;i<2&&fr.length;i++){const q=fr.pop();ents.push({k:'ch',px:q[0]+.5,py:q[1]+.5})}
  for(let i=0;i<10;i++)ents.push({k:'tc',px:2+r()*(n-4),py:2+r()*(n-4),sub:1});
  return sp}
const _genWild746i=genWild;genWild=function(z){if(z&&z.sub46)return subGen(z);return _genWild746i(z)};
// l'ossigeno
const _upd746i=upd;upd=function(dt){_upd746i(dt);if(!ZZ||!ZZ.sub46||!started||!P)return;let near=false;for(const e of ents)if(e.k==='aria46'&&dist(e,P)<1.3){near=true;break}
  if(near)SUB46.o=Math.min(SUB46.mx,SUB46.o+dt*12);else SUB46.o=Math.max(0,SUB46.o-dt);
  if(SUB46.o<=0&&P.hp>0){SUB46.ht=(SUB46.ht||0)+dt;if(SUB46.ht>=1){SUB46.ht=0;P.hp-=Math.max(1,Math.round(P.mx*.06));flt(P,'Senz\'aria!','#7ab8ff');tone(120,.1);if(P.hp<=0)die()}}
  let el=$('ox46');if(!el){el=document.createElement('div');el.id='ox46';el.innerHTML='<i></i><span>Ossigeno</span>';document.body.appendChild(el)}el.hidden=false;const k=SUB46.o/SUB46.mx;el.querySelector('i').style.width=(k*100)+'%';el.classList.toggle('low',k<.3)};
// la luce dell'acqua: blu, con i raggi dall'alto
{const l0=lights;lights=function(){const z=ZZ;if(z&&z.sub46&&!z.dg){z.dg='mare';try{l0()}finally{delete z.dg}g.setTransform(DPR,0,0,DPR,0,0);g.fillStyle='rgba(20,90,140,.18)';g.fillRect(0,0,W,H);
  g.globalCompositeOperation='lighter';for(let i=0;i<5;i++){const x=((i*260+t*14)%(W+300))-150;g.fillStyle='rgba(120,200,255,.035)';g.beginPath();g.moveTo(x,0);g.lineTo(x+90,0);g.lineTo(x-60,H);g.lineTo(x-170,H);g.fill()}g.globalCompositeOperation='source-over';return}l0()}}
// i disegni: coralli, alghe, la boa, la cima, le colonne di bolle; le «torce» sott'acqua sono meduse luminose
{const d0=dec;dec=function(x,y,c,h){if(c==='ꞇ'){const k=Math.sin(t*1.6+x+y)*.06;box(x+.4,y+.4,0,.2,.2,8,'#e05a6a');box(x+.25+k,y+.35,6,.15,.15,10,'#ff7a8a');box(x+.55-k,y+.45,8,.15,.15,8,'#e86a9a');return}
  if(c==='꞉'){for(let i=0;i<3;i++){const k=Math.sin(t*2+i+x)*.08;box(x+.25+i*.2+k,y+.4,0,.06,.06,10+i*4,'#3a9a5a')}return}return d0.apply(this,arguments)}}
const _ent746i=ent;ent=function(e){if(e.k==='tc'&&e.sub){const u=Math.sin(t*2+e.px)*3;box(e.px-.08,e.py-.08,20+u,.16,.16,5,'#9ffff0',1.5);box(e.px-.03,e.py-.03,14+u,.06,.06,6,'#6fffe0',1.2);return}
  if(e.k==='boa46'){const u=Math.sin(t*2)*1.5;drawL([[-.18,-.18,u,.36,.36,10,'#e84a3a'],[-.18,-.18,10+u,.36,.36,4,'#ffffff'],[-.04,-.04,14+u,.08,.08,10,'#3a3a3a'],[-.07,-.07,24+u,.14,.14,4,'#ffd84a',1.3]],e.px,e.py,0);return}
  if(e.k==='cima46'){drawL([[-.03,-.03,0,.06,.06,70,'#c8a870'],[-.15,-.15,0,.3,.3,3,'#5a5a5a']],e.px,e.py,0);return}
  if(e.k==='aria46'){for(let i=0;i<6;i++){const s=((t*.7+i/6)%1),x=e.px+Math.sin(i*2.1+t)*.12;box(x-.05,e.py-.05,s*60,.1,.1,3,'#d8f4ff',1.3)}box(e.px-.2,e.py-.2,0,.4,.4,2,'#5a7a7a');return}
  _ent746i(e)};
(function(){const st=document.createElement('style');st.textContent=`#ox46{position:fixed;left:50%;bottom:118px;transform:translateX(-50%);width:220px;height:14px;background:#0a1a2acc;border:1px solid #9adcff;border-radius:7px;overflow:hidden;z-index:30;pointer-events:none}
#ox46 i{position:absolute;left:0;top:0;bottom:0;background:linear-gradient(90deg,#3a9adc,#9adcff);transition:width .2s}#ox46 span{position:relative;display:block;text-align:center;font:bold 10px Georgia,serif;color:#fff;line-height:14px;text-shadow:0 1px 2px #000}
#ox46.low i{background:linear-gradient(90deg,#dc3a3a,#ff9a8a);animation:ox46 .5s infinite alternate}@keyframes ox46{to{opacity:.5}}body:not(.ig) #ox46{display:none}`;document.head.appendChild(st)})();
