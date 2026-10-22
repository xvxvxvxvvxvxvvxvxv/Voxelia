/* ================= 7.17: LA MAPPA DEL MONDO E LE FINESTRE DEI CONTRATTI =================
   MAPPA (tasto M in Tomorrow): una carta disegnata dal mondo vero. Ogni regione è dipinta dal suo terreno (boschi, acqua,
   sabbia, neve, cenere), i sentieri disegnano la rete delle strade da un villaggio all'altro, le città hanno mura e torri,
   i dungeon il loro ingresso. Si trascina con il mouse o il dito, si avvicina con la rotellina o i pulsanti, e un clic su
   una regione ne mostra la scheda: nome, livello e pericolo, luoghi, contratti, direzione e distanza, e il pulsante per
   impostarla come destinazione (che compare nel resoconto e sulla mappa). Le regioni mai viste sono velate.
   FINESTRE: la Bacheca dei Contratti, i contratti nel pannello J e il resoconto in alto a destra sono rifatti: schede con
   lo stemma e il colore della fazione, le stelle, le tappe con le icone e la direzione, le ricompense in evidenza. */
const TWFC={lega:'🏘',carto:'🗺',fiamma:'🔥',strada:'🐫',custodi:'📜',clan:'🐺'};
const TWSI={talk:'🗣',hunt:'☠',cull:'⚔',relic:'🏺',gath:'🌿',def:'🛡',reach:'🧭',bat:'🏰',back:'💰'};
const TWRAR=['unico comune','unico raro','unico epico','unico leggendario'];
/* ---- la miniatura di una regione: il terreno vero, campionato ---- */
const TWTH=new Map(),TWCH=new Map();
function twThumb(rx,ry){const k=rx+','+ry;let c=TWTH.get(k);if(c)return c;c=document.createElement('canvas');const S=24;c.width=c.height=S;const q=c.getContext('2d'),im=q.createImageData(S,S),bio=twBio(rx,ry),st=TWR/S;
  const pal={prato:[[118,170,80],[86,140,62],[150,150,140]],bosco:[[70,130,58],[40,92,44],[130,130,126]],deserto:[[222,196,138],[184,140,92],[200,160,110]],neve:[[226,234,242],[60,104,82],[150,158,168]],cenere:[[92,86,82],[60,54,54],[120,70,50]]}[bio];
  for(let y=0;y<S;y++)for(let x=0;x<S;x++){const wx=rx*TWR+x*st+1,wy=ry*TWR+y*st+1,[m,cd]=twBase(wx,wy,bio);let col=m===2?[70,128,190]:m===1?(cd==='N'||cd==='K'||cd==='M'||cd==='R'?pal[2]:pal[1]):pal[0];
    const v=.9+twH2(wx,wy)*.18;const o=(y*S+x)*4;im.data[o]=col[0]*v;im.data[o+1]=col[1]*v;im.data[o+2]=col[2]*v;im.data[o+3]=255}
  q.putImageData(im,0,0);TWTH.set(k,c);if(TWTH.size>3000){const f=TWTH.keys().next().value;TWTH.delete(f)}return c}
function twChunk(cx,cy){const k=cx+','+cy;let ch=TWCH.get(k);if(ch)return ch;ch=document.createElement('canvas');ch.width=ch.height=192;const cq=ch.getContext('2d');
  for(let j=0;j<8;j++)for(let i=0;i<8;i++){const th=twThumb(cx*8+i,cy*8+j);cq.drawImage(th,i*24,j*24);TWTH.delete((cx*8+i)+','+(cy*8+j))}TWCH.set(k,ch);if(TWCH.size>160)TWCH.delete(TWCH.keys().next().value);return ch}
const TWRC=new Map();
function twRoads(cx,cy){const k=cx+','+cy;let rc=TWRC.get(k);if(rc)return rc;const R2=48;rc=document.createElement('canvas');rc.width=rc.height=8*R2;const q=rc.getContext('2d'),f=R2/TWR,pa=new Path2D();
  for(let j=0;j<8;j++)for(let i=0;i<8;i++){const I=twRI(cx*8+i,cy*8+j),ox=i*R2,oy=j*R2,hx=ox+I.h[0]*f,hy=oy+I.h[1]*f;for(const[ex,ey]of I.e){pa.moveTo(hx,hy);pa.quadraticCurveTo((hx+ox+ex*f)/2+(ey-I.h[1])*f*.12,(hy+oy+ey*f)/2+(ex-I.h[0])*f*.12,ox+ex*f,oy+ey*f)}}
  q.lineCap=q.lineJoin='round';q.strokeStyle='rgba(90,60,30,.75)';q.lineWidth=3.2;q.stroke(pa);q.strokeStyle='rgba(226,200,150,.85)';q.lineWidth=1.3;q.stroke(pa);
  TWRC.set(k,rc);if(TWRC.size>160)TWRC.delete(TWRC.keys().next().value);return rc}
// il centro della regione (dove si incontrano i sentieri): lo stesso che usa il generatore
function twHub(rx,ry){const r=twRnd('reg',rx,ry),a=38+Math.floor(r()*21),b=38+Math.floor(r()*21);return[a,b]}
// le informazioni fisse di una regione, calcolate una volta sola
const TWRI=new Map();
function twRI(rx,ry){const k=rx+','+ry;let I=TWRI.get(k);if(I)return I;const city=twCity(rx,ry),vil=twVil(rx,ry);
  I={h:twHub(rx,ry),e:[[TWR,twEdgeY(rx,ry)],[0,twEdgeY(rx-1,ry)],[twEdgeX(rx,ry),TWR],[twEdgeX(rx,ry-1),0]],city,vil,gem:city&&twCityGem(rx,ry),dun:!vil&&twDun(rx,ry),lv:twLv(rx,ry)};
  TWRI.set(k,I);if(TWRI.size>5000)TWRI.delete(TWRI.keys().next().value);return I}
/* ---- la mappa ---- */
const TWM={cx:0,cy:0,z:64,sel:null,drag:null,tgt:new Set()};
function twMapOpen(){const p=twP(String(Zk).startsWith('tw:')?Zk:(ZZ&&ZZ.out)?ZZ.out:(ZZ&&ZZ.dg&&DG[ZZ.dg])?DG[ZZ.dg].ent:P.tw.at)||[0,0];TWM.cx=p[0]+.5;TWM.cy=p[1]+.5;TWM.sel=null;
  edPanel('twmap',`<div class="twmw"><div class="twmh"><h3>🗺 Mappa del mondo</h3><span class="mu">${Object.keys(P.tw.vis).length} regioni esplorate</span></div>
    <div class="twmb"><div class="twmc"><canvas id="twmc" width="760" height="500"></canvas><div class="twmz"><button onclick="twMapZoom(1.25)" title="Avvicina">＋</button><button onclick="twMapZoom(.8)" title="Allontana">－</button><button onclick="twMapHome()" title="Centra su di te">◎</button></div></div>
    <aside id="twms" class="twms"></aside></div>
    <div class="twml"><span><i class="lg c"></i>Città</span><span><i class="lg v"></i>Villaggio</span><span><i class="lg d"></i>Dungeon</span><span><i class="lg s"></i>Contratto</span><span><i class="lg w"></i>Destinazione</span><span><i class="lg h"></i>Tu</span><span class="mu">Trascina per muoverti · rotellina per avvicinare · clic su una regione per la sua scheda</span></div>
    <button onclick="cl()">Chiudi</button></div>`);
  TWM.tgt=new Set();for(const C of P.ow.act){const s=owCur(C);if(s&&s.z){const tz=String(s.z).startsWith('twd_')?(twDG(s.z.split('@')[0])||{}).ent:s.z;if(tz)TWM.tgt.add(tz)}}
  const c=$('twmc');c.onpointerdown=e=>{TWM.drag={x:e.clientX,y:e.clientY,cx:TWM.cx,cy:TWM.cy,m:0};c.setPointerCapture(e.pointerId)};
  c.onpointermove=e=>{const d=TWM.drag;if(!d)return;const r=c.getBoundingClientRect(),k=c.width/r.width,dx=(e.clientX-d.x)*k,dy=(e.clientY-d.y)*k;if(Math.abs(dx)+Math.abs(dy)>4)d.m=1;TWM.cx=d.cx-dx/TWM.z;TWM.cy=d.cy-dy/TWM.z;twMapDraw()};
  c.onpointerup=e=>{const d=TWM.drag;TWM.drag=null;if(d&&!d.m){const r=c.getBoundingClientRect(),k=c.width/r.width,x=(e.clientX-r.left)*k,y=(e.clientY-r.top)*k;TWM.sel=[Math.floor(TWM.cx+(x-c.width/2)/TWM.z),Math.floor(TWM.cy+(y-c.height/2)/TWM.z)];twMapSide();twMapDraw()}};
  c.onwheel=e=>{e.preventDefault();twMapZoom(e.deltaY<0?1.15:.87)};
  TWM.sel=[Math.floor(TWM.cx),Math.floor(TWM.cy)];twMapSide();twMapDraw();if(!TWM.raf)TWM.raf=requestAnimationFrame(twMapAnim)}
function twMapAnim(){TWM.raf=0;if(PM!=='twmap'||!$('twmc'))return;twMapDraw();TWM.raf=requestAnimationFrame(twMapAnim)}
function twMapZoom(k){TWM.z=clamp(TWM.z*k,26,130);twMapDraw()}
function twMapHome(){const p=twP(String(Zk).startsWith('tw:')?Zk:P.tw.at)||[0,0];TWM.cx=p[0]+.5;TWM.cy=p[1]+.5;twMapDraw()}
const twKnown=(rx,ry)=>{if(P.tw.vis[twK(rx,ry)])return 2;for(let y=-1;y<=1;y++)for(let x=-1;x<=1;x++)if(P.tw.vis[twK(rx+x,ry+y)])return 1;return 0};
function twMapDraw(){const c=$('twmc');if(!c)return;const q=c.getContext('2d'),W2=c.width,H2=c.height,Z2=TWM.z,now=performance.now()/1000;
  q.fillStyle='#d9c79f';q.fillRect(0,0,W2,H2);
  const x0=Math.floor(TWM.cx-W2/2/Z2)-1,x1=Math.ceil(TWM.cx+W2/2/Z2)+1,y0=Math.floor(TWM.cy-H2/2/Z2)-1,y1=Math.ceil(TWM.cy+H2/2/Z2)+1,sx=rx=>W2/2+(rx-TWM.cx)*Z2,sy=ry=>H2/2+(ry-TWM.cy)*Z2;
  q.imageSmoothingEnabled=Z2<60;
  // il terreno: a blocchi di 8×8 regioni, ognuno dipinto una volta sola
  {const cx0=Math.floor(x0/8),cx1=Math.floor(x1/8),cy0=Math.floor(y0/8),cy1=Math.floor(y1/8);let bud=TWM.drag?1:2;
    for(let cy=cy0;cy<=cy1;cy++)for(let cx=cx0;cx<=cx1;cx++){let ch=TWCH.get(cx+','+cy);if(!ch&&bud>0){bud--;ch=twChunk(cx,cy)}
      if(ch)q.drawImage(ch,sx(cx*8),sy(cy*8),8*Z2+.6,8*Z2+.6);else for(let j=0;j<8;j++)for(let i=0;i<8;i++){const rx=cx*8+i,ry=cy*8+j;if(rx<x0||rx>x1||ry<y0||ry>y1)continue;q.fillStyle=TWMC[twBio(rx,ry)];q.fillRect(sx(rx),sy(ry),Z2+.6,Z2+.6)}}}
  // il velo sulle terre mai viste
  {const p0=new Path2D(),p1=new Path2D();let n0=0;for(let ry=y0;ry<=y1;ry++)for(let rx=x0;rx<=x1;rx++){const kn=twKnown(rx,ry);if(kn===2)continue;(kn?p1:p0).rect(sx(rx),sy(ry),Z2+.6,Z2+.6);if(!kn)n0++}
    q.fillStyle='rgba(217,199,159,.28)';q.fill(p1);if(n0){q.fillStyle='rgba(190,170,130,.74)';q.fill(p0);q.save();q.clip(p0);q.strokeStyle='rgba(120,96,60,.25)';q.lineWidth=1;q.beginPath();for(let i=-H2;i<W2;i+=10){q.moveTo(i,H2);q.lineTo(i+H2,0)}q.stroke();q.restore()}}
  // le strade: da ogni centro di regione ai punti di passaggio sui bordi (dipinte una volta per blocco)
  {const cx0=Math.floor(x0/8),cx1=Math.floor(x1/8),cy0=Math.floor(y0/8),cy1=Math.floor(y1/8);for(let cy=cy0;cy<=cy1;cy++)for(let cx=cx0;cx<=cx1;cx++){const rc=TWRC.get(cx+','+cy)||(TWCH.has(cx+','+cy)?twRoads(cx,cy):null);if(rc)q.drawImage(rc,sx(cx*8),sy(cy*8),8*Z2+.6,8*Z2+.6)}}
  // i confini delle regioni
  q.strokeStyle='rgba(90,70,40,.18)';q.lineWidth=1;for(let rx=x0;rx<=x1+1;rx++){q.beginPath();q.moveTo(sx(rx),0);q.lineTo(sx(rx),H2);q.stroke()}for(let ry=y0;ry<=y1+1;ry++){q.beginPath();q.moveTo(0,sy(ry));q.lineTo(W2,sy(ry));q.stroke()}
  // i luoghi
  const ic=(x,y,kind,s)=>{q.save();q.translate(x,y);q.scale(s,s);q.lineWidth=1.4;q.strokeStyle='#2a1a0a';
    if(kind==='c'){q.fillStyle='#e8dcc0';q.fillRect(-11,-6,22,12);q.strokeRect(-11,-6,22,12);for(const tx of[-13,9]){q.fillStyle='#d8ccb0';q.fillRect(tx,-11,5,17);q.strokeRect(tx,-11,5,17)}q.fillStyle='#a8402f';q.beginPath();q.moveTo(-6,-6);q.lineTo(0,-13);q.lineTo(6,-6);q.closePath();q.fill();q.stroke();q.fillStyle='#4a3020';q.fillRect(-2,0,4,6)}
    else if(kind==='v'){q.fillStyle='#e8d8b8';q.fillRect(-6,-3,12,9);q.strokeRect(-6,-3,12,9);q.fillStyle='#a8402f';q.beginPath();q.moveTo(-8,-3);q.lineTo(0,-10);q.lineTo(8,-3);q.closePath();q.fill();q.stroke()}
    else if(kind==='d'){q.fillStyle='#6a6a70';q.beginPath();q.moveTo(-9,6);q.lineTo(-9,-2);q.quadraticCurveTo(0,-12,9,-2);q.lineTo(9,6);q.closePath();q.fill();q.stroke();q.fillStyle='#120c10';q.beginPath();q.moveTo(-4,6);q.lineTo(-4,0);q.quadraticCurveTo(0,-5,4,0);q.lineTo(4,6);q.closePath();q.fill()}
    else if(kind==='g'){q.fillStyle='#b88aff';q.beginPath();q.moveTo(0,-7);q.lineTo(6,0);q.lineTo(0,7);q.lineTo(-6,0);q.closePath();q.fill();q.stroke()}
    else if(kind==='t'){q.fillStyle='#c8a878';q.beginPath();q.moveTo(-8,6);q.lineTo(0,-7);q.lineTo(8,6);q.closePath();q.fill();q.stroke();q.fillStyle='#ff9a3a';q.fillRect(-1.5,1,3,5)}
    q.restore()};
  q.textAlign='center';q.textBaseline='middle';
  for(let ry=y0;ry<=y1;ry++)for(let rx=x0;rx<=x1;rx++){const kn=twKnown(rx,ry),I=twRI(rx,ry),X=sx(rx)+I.h[0]/TWR*Z2,Y=sy(ry)+I.h[1]/TWR*Z2,s=clamp(Z2/64,.55,1.5);const city=I.city,vil=I.vil;
    if(vil){q.globalAlpha=kn?1:.5;ic(X,Y,city?'c':'v',s*(city?1.3:1));if(I.gem&&kn)ic(X+18*s,Y-12*s,'g',s*.8);q.globalAlpha=1;
      if(kn&&Z2>=40){q.font=`bold ${Math.round(11*s+2)}px Georgia,serif`;q.lineWidth=3;q.strokeStyle='rgba(240,228,200,.9)';const nm=twZ(twK(rx,ry)).n;q.strokeText(nm,X,Y+18*s);q.fillStyle='#3a2410';q.fillText(nm,X,Y+18*s)}}
    else if(I.dun&&kn===2)ic(X+Z2*.18,Y-Z2*.12,'d',s*.9);
    if(kn&&Z2>=56&&!vil){q.globalAlpha=.75;q.font=`${Math.round(10*s+1)}px Georgia,serif`;q.fillStyle=I.lv>P.lv+3?'#8a1a1a':'#4a3420';q.fillText('liv. '+I.lv,sx(rx)+Z2/2,sy(ry)+Z2*.88);q.globalAlpha=1}
    const k2=twK(rx,ry);if(TWM.tgt.has(k2)){const p=.6+.4*Math.sin(now*4);q.fillStyle=`rgba(255,200,40,${p})`;q.font=`bold ${Math.round(18*s+4)}px serif`;q.fillText('✦',X+Z2*.3,Y-Z2*.3)}
    if(P.tw.wp===k2){q.fillStyle='#c0392b';q.beginPath();q.moveTo(X-Z2*.28,Y+Z2*.12);q.lineTo(X-Z2*.28,Y-Z2*.3);q.lineTo(X-Z2*.06,Y-Z2*.22);q.lineTo(X-Z2*.28,Y-Z2*.14);q.fill();q.strokeStyle='#2a1a0a';q.lineWidth=1.5;q.beginPath();q.moveTo(X-Z2*.28,Y+Z2*.12);q.lineTo(X-Z2*.28,Y-Z2*.3);q.stroke()}
    if(P.tw.camp&&P.tw.camp.k===k2)ic(sx(rx)+P.tw.camp.x/TWR*Z2,sy(ry)+P.tw.camp.y/TWR*Z2,'t',s*.8)}
  // tu
  {const p=twP(String(Zk).startsWith('tw:')?Zk:P.tw.at)||[0,0],inR=String(Zk).startsWith('tw:'),X=sx(p[0])+(inR?P.px/N:.5)*Z2,Y=sy(p[1])+(inR?P.py/N:.5)*Z2,pu=(now*1.2)%1;
    q.strokeStyle=`rgba(255,216,74,${1-pu})`;q.lineWidth=3;q.beginPath();q.arc(X,Y,8+pu*22,0,6.3);q.stroke();q.fillStyle='#ffd84a';q.strokeStyle='#2a1a0a';q.lineWidth=2;q.beginPath();q.arc(X,Y,7,0,6.3);q.fill();q.stroke();
    q.strokeStyle='#ffd84a';q.lineWidth=3;q.strokeRect(sx(p[0])+1.5,sy(p[1])+1.5,Z2-3,Z2-3)}
  // la regione scelta
  if(TWM.sel){q.strokeStyle='#ffffff';q.lineWidth=2;q.setLineDash([5,4]);q.strokeRect(sx(TWM.sel[0])+3,sy(TWM.sel[1])+3,Z2-6,Z2-6);q.setLineDash([])}
  // la rosa dei venti
  q.save();q.translate(W2-46,46);q.fillStyle='rgba(240,228,200,.85)';q.beginPath();q.arc(0,0,30,0,6.3);q.fill();q.strokeStyle='#5a3a1a';q.lineWidth=1.5;q.stroke();
  for(let i=0;i<4;i++){q.rotate(Math.PI/2);q.fillStyle=i===3?'#a8402f':'#5a3a1a';q.beginPath();q.moveTo(0,-24);q.lineTo(5,0);q.lineTo(-5,0);q.closePath();q.fill()}
  q.fillStyle='#2a1a0a';q.font='bold 11px Georgia,serif';q.fillText('N',0,-34+6);q.restore();
  // una cornice
  q.strokeStyle='#5a3a1a';q.lineWidth=6;q.strokeRect(3,3,W2-6,H2-6);q.strokeStyle='#c8a868';q.lineWidth=2;q.strokeRect(9,9,W2-18,H2-18)}
function twMapSide(){const el=$('twms');if(!el||!TWM.sel)return;const[rx,ry]=TWM.sel,k=twK(rx,ry),kn=twKnown(rx,ry),z=twZ(k),here=twP(String(Zk).startsWith('tw:')?Zk:P.tw.at)||[0,0],lv=twLv(rx,ry);
  const danger=lv>P.lv+4?['Mortale','#ff6a5a']:lv>P.lv+1?['Pericolosa','#ffb04a']:lv>=P.lv-2?['Alla tua portata','#9ad07a']:['Tranquilla','#9adcff'];
  const places=[];if(!kn){}else if(twCity(rx,ry))places.push('🏰 Città'+(twCityGem(rx,ry)?' · vende la sua gemma del teletrasporto':''));else if(twVil(rx,ry))places.push('🏘 Villaggio con la bacheca dei contratti');
  if(!kn&&twCity(rx,ry))places.push('🏰 Si racconta di una città da queste parti');if(kn&&twDun(rx,ry))places.push(kn===2?'⛫ '+twDG(twDid(rx,ry)).n:'⛫ Un ingresso sotterraneo');
  const cs=P.ow.act.filter(C=>{const s=owCur(C);if(!s||!s.z)return false;const tz=String(s.z).startsWith('twd_')?(twDG(s.z.split('@')[0])||{}).ent:s.z;return tz===k});
  el.innerHTML=`<div class="twmsb" style="--bc:${TWMC[twBio(rx,ry)]}"><b>${kn?twEsc(z.n):'Terra inesplorata'}</b><small>${TWBN[twBio(rx,ry)]} · livello ${lv}</small></div>
    <p><span class="twdg" style="color:${danger[1]}">● ${danger[0]}</span></p><p class="mu">${kn===2?'Esplorata':kn?'Ai confini delle terre che conosci':'Nessuno te ne ha parlato'} · ${twDir(rx-here[0],ry-here[1])}</p>
    ${places.length?`<ul class="twmpl">${places.map(p=>`<li>${twEsc(p)}</li>`).join('')}</ul>`:''}
    ${cs.length?`<div class="twmct"><b>✦ Contratti qui</b>${cs.map(C=>`<div>${twEsc(C.ti)}<small>${twEsc(owStepTxt(C))}</small></div>`).join('')}</div>`:''}
    ${P.tw.wp===k?`<button onclick="P.tw.wp=null;twMapSide();twMapDraw();hud()">✕ Togli la destinazione</button>`:`<button class="pri" onclick="P.tw.wp='${k}';twMapSide();twMapDraw();hud();save()">🚩 Imposta come destinazione</button>`}`}
openMap=function(){if(twOn()){twMapOpen();return}_openMap716()};
// arrivati alla destinazione, la bandierina si toglie
const _load717m=load;load=function(k,from){_load717m(k,from);if(twOn()&&P.tw.wp&&Zk===P.tw.wp){P.tw.wp=null;banner('Destinazione raggiunta',ZZ.n,'mappa')}};

/* ---- la bacheca dei contratti ---- */
owCard=function(C,i,mode){const F=OWF[C.fa],R=C.rw,mods=Object.keys(C.mods),cur=C.si;
  const st=C.steps.map((s,j)=>`<li class="${j<cur?'ok':j===cur&&mode==='act'?'cur':''}"><i>${TWSI[s.k]||'•'}</i><span>${twEsc(owStepTxt(C,s,1))}</span></li>`).join('');
  let h=`<article class="twk${C.hon?' hon':''}" style="--fc:${F.c}"><div class="twkr"><span class="twkc">${TWFC[C.fa]||'✦'}</span></div><div class="twkb">
    <header><h4>${twEsc(C.ti)}</h4><span class="twks">${'★'.repeat(C.st)}<em>${'★'.repeat(5-C.st)}</em></span></header>
    <div class="twkf">${twEsc(F.n)} · ${twEsc(owCap(C.pat))}${C.hon?' · <b>contratto d\'onore</b>':''} · livello ${C.lv}</div>
    <blockquote>${twEsc(C.tx)}</blockquote><ol class="twkt">${st}</ol>
    ${mods.length?`<div class="twkm">${mods.map(m=>`<span title="${twEsc(OWMOD[m].d)}">⚠ ${twEsc(OWMOD[m].n)}</span>`).join('')}</div>`:''}
    <div class="twkw"><span>💰 ${R.g}</span><span>✨ ${R.xp} XP</span><span class="r${R.rm}">✦ ${TWRAR[R.rm]}${R.rm<3?' o meglio':''}</span><span>🏺 ${twEsc(R.tro)}</span><span>⭐ +${R.rep}</span></div>
    <footer>${mode==='off'?`<button class="pri" onclick="owTake(${i})">✔ Accetta il contratto</button>`:mode==='act'?(owCur(C).k==='back'?`<button class="pri" onclick="owTurn(${i})">💰 Riscuoti la ricompensa</button>`:'')+`<button onclick="owDrop(${i})">Rinuncia</button>`:''}</footer></div></article>`;
  return h};
owHTML=function(){if(!P||!P.ow)return'';owRefresh();const O=P.ow,tb=OW.tab,tw=twOn();
  const tab=(k,n,c)=>`<button class="twtb${tb===k?' on':''}" onclick="OW.tab='${k}';pn('owb')">${n}${c!=null?`<em>${c}</em>`:''}</button>`;
  let h=`<div class="twbd"><header class="twbh"><div><h3>✦ Bacheca dei Contratti</h3><small>${tw&&ZZ?twEsc(ZZ.n)+' · ':''}giorno ${gDay()}</small></div><div class="twtabs">${tab('off','Offerte',O.off.length)}${tab('act','In corso',O.act.length+'/3')}${tab('rep','Reputazione')}${tab('bag','Reperti',(P.rep||[]).length)}</div></header><div class="twbc">`;
  if(tb==='off')h+=O.off.length?O.off.map((C,i)=>owCard(C,i,'off')).join(''):'<p class="twe">Per oggi non c\'è altro: torna domani.</p>';
  else if(tb==='act')h+=O.act.length?O.act.map((C,i)=>owCard(C,i,'act')).join(''):'<p class="twe">Nessun contratto in corso: scegline uno fra le offerte.</p>';
  else if(tb==='rep'){h+=`<p class="mu">Contratti completati ${O.done} · falliti ${O.fail}. La reputazione alta fa crescere le paghe; da «Stimato» in su la bacheca propone ogni giorno un contratto d'onore.</p><div class="twrg">`+OWFK.map(k=>{const v=O.rep[k]|0,ti=owTier(v),nx=OWRT[ti+1],pc=nx?Math.round((v-OWRT[ti][0])/(nx[0]-OWRT[ti][0])*100):100;
      return`<div class="twrc" style="--fc:${OWF[k].c}"><span class="twkc">${TWFC[k]||'✦'}</span><div><b>${twEsc(OWF[k].n)}</b><small>${OWRT[ti][1]} · ${v}${nx?' / '+nx[0]:''}</small><div class="owbar"><i style="width:${pc}%;background:${OWF[k].c}"></i></div></div></div>`}).join('')+'</div>';
    if(O.log.length)h+=`<h4>Ultimi contratti</h4>`+O.log.map(l=>`<div class="twlg"><span>${'★'.repeat(l.st)}</span> ${twEsc(l.ti)} <small>giorno ${l.d}</small></div>`).join('')}
  else{const L=P.rep||[];h+=`<p class="mu">I reperti si collezionano, si scambiano con gli altri eroi o si vendono qui per il loro valore.</p><div class="twrp">`+(L.length?L.map((x,i)=>`<div class="twri r${x.r|0}"><b>🏺 ${twEsc(x.n)}</b><small>${twEsc(x.d||'')}</small><button onclick="owSellRep(${i})">Vendi · ${x.p|0}💰</button></div>`).join(''):'<p class="twe">Ancora nessun reperto: li danno i contratti.</p>')+'</div>'}
  return h+`</div><footer class="twbf"><button onclick="cl()">Chiudi</button></footer></div>`};
// i contratti nel pannello J
const _pn717m=pn;pn=function(m,arg){_pn717m(m,arg);if(m==='q'&&twOn()&&PM==='q'){const pe=$('pn'),o=pe&&pe.querySelector('.owq');if(o)o.outerHTML=`<div class="owq twq"><h3>✦ Contratti</h3>${P.ow.act.length?P.ow.act.map((C,i)=>{const s=owCur(C);return`<div class="twqi" style="--fc:${OWF[C.fa].c}"><span class="twkc">${TWFC[C.fa]||'✦'}</span><div><b>${twEsc(C.ti)}</b><span class="twks">${'★'.repeat(C.st)}</span><small><i>${TWSI[s.k]||'•'}</i> ${twEsc(owStepTxt(C,s))}</small></div></div>`}).join(''):'<p class="mu">Nessun contratto: le bacheche sono nelle piazze dei villaggi e delle città (M: mappa).</p>'}${P.tw&&P.tw.wp?`<p class="twwp">🚩 Destinazione: <b>${twEsc(twZ(P.tw.wp).n)}</b> · ${twEsc(twWpDir())}</p>`:''}</div>`}};
const twWpDir=()=>{const a=twP(P.tw.wp),b=twP(String(Zk).startsWith('tw:')?Zk:P.tw.at)||[0,0];return a?twDir(a[0]-b[0],a[1]-b[1]):''};
// il resoconto in alto a destra
let TWQh='';
const _hud717m=hud;hud=function(){_hud717m();if(!twOn()||!P||!$('qt'))return;let q='';
  for(const C of P.ow.act){const s=owCur(C);let dl='';if(C.dl){const m=Math.max(0,C.dl-gNow());dl=`<em>⏳ ${Math.floor(m/60)}h${String(Math.floor(m%60)).padStart(2,'0')}</em>`}
    q+=`<div class="twqt" style="--fc:${OWF[C.fa].c}"><b>${TWFC[C.fa]||'✦'} ${twEsc(C.ti)}</b><span><i>${TWSI[s.k]||'•'}</i>${twEsc(owStepTxt(C,s))}</span>${dl}</div>`}
  if(!P.ow.act.length)q+=`<div class="twqt" style="--fc:#ffd84a"><b>✦ Nessun contratto</b><span>Cerca la bacheca di un villaggio · M: mappa</span></div>`;
  if(P.tw.wp)q+=`<div class="twqt" style="--fc:#ff6a5a"><b>🚩 ${twEsc(twZ(P.tw.wp).n)}</b><span>${twEsc(twWpDir())}</span></div>`;
  const all=q+(QTh||'');if(all!==TWQh||!$('qt').querySelector('.twqt')){TWQh=all;$('qt').innerHTML=all}};
document.head.insertAdjacentHTML('beforeend',`<style>
#pn[data-m="twmap"]{width:min(1080px,97vw);max-height:88%;top:53%}#pn[data-m="owb"]{width:min(760px,96vw);max-height:90%;padding:0}
.twmw h3{margin:0}.twmh{display:flex;justify-content:space-between;align-items:baseline;gap:10px;margin-bottom:6px}
.twmb{display:flex;gap:12px;align-items:stretch}.twmc{position:relative;flex:1;min-width:0}.twmc canvas{width:100%;height:auto;display:block;border-radius:8px;cursor:grab;touch-action:none;box-shadow:0 6px 18px #0008}
.twmz{position:absolute;left:10px;top:10px;display:flex;flex-direction:column;gap:5px}.twmz button{width:34px;height:34px;padding:0;font-size:18px;border-radius:8px;background:rgba(40,28,16,.85);color:#ffe8b0;border:1px solid #c8a868}
.twms{width:250px;flex:none;background:linear-gradient(180deg,#3a2a18,#22180e);color:#f0e4c8;border:1px solid #c8a868;border-radius:8px;padding:10px;font-size:13px}
.twmsb{border-left:5px solid var(--bc);padding:2px 0 2px 9px;margin-bottom:6px}.twmsb b{display:block;font-size:16px;color:#ffe8b0}.twmsb small{opacity:.8}
.twdg{font-weight:bold}.twmpl{margin:6px 0 6px 18px;padding:0}.twmct{border:1px solid #ffd84a55;border-radius:7px;padding:6px 8px;margin:6px 0;background:rgba(255,216,74,.06)}.twmct div{margin-top:4px}.twmct small{display:block;opacity:.8}
.twms button{width:100%;margin-top:6px}.twms button.pri,.twk button.pri{border-color:#ffd84a!important;color:#ffd84a}
.twml{display:flex;flex-wrap:wrap;gap:12px;align-items:center;font-size:12px;margin:8px 0}.lg{display:inline-block;width:12px;height:12px;border-radius:3px;margin-right:4px;vertical-align:-2px;border:1px solid #2a1a0a}
.lg.c{background:#e8dcc0}.lg.v{background:#a8402f}.lg.d{background:#6a6a70}.lg.s{background:#ffd84a}.lg.w{background:#c0392b}.lg.h{background:#ffd84a;border-radius:50%}
@media (max-width:760px){.twmb{flex-direction:column}.twms{width:auto}}
.twbd{display:flex;flex-direction:column;max-height:88vh}.twbh{padding:12px 16px 8px;background:linear-gradient(180deg,rgba(70,46,18,.95),rgba(36,26,14,.9));border-bottom:1px solid #c8a86866;display:flex;flex-wrap:wrap;justify-content:space-between;gap:8px;align-items:flex-end}
.twbh h3{margin:0;color:#ffd88a;letter-spacing:.5px}.twbh small{color:#e8d8b0;opacity:.8}.twtabs{display:flex;gap:5px;flex-wrap:wrap}
.twtb{border-radius:18px!important;padding:5px 12px!important;opacity:.75;background:#0004!important}.twtb.on{opacity:1;border-color:#ffd84a!important;color:#ffd84a;background:rgba(255,216,74,.08)!important}.twtb em{font-style:normal;margin-left:6px;background:#ffd84a33;border-radius:9px;padding:0 6px;font-size:11px}
.twbc{overflow:auto;padding:10px 14px}.twbf{padding:8px 14px;border-top:1px solid #ffffff18;text-align:right}.twe{text-align:center;opacity:.75;padding:24px 0}
.twk{display:flex;margin:10px 0;border-radius:10px;overflow:hidden;background:linear-gradient(170deg,#f3e6c4,#e2cf9e);color:#2a1a0a;box-shadow:0 4px 14px #0007;border:1px solid #8a6a3a}
.twk.hon{box-shadow:0 0 0 2px #ffae2b,0 4px 16px #ffae2b55}.twkr{width:46px;flex:none;background:linear-gradient(180deg,var(--fc),color-mix(in srgb,var(--fc) 55%,#000));display:flex;justify-content:center;padding-top:10px}
.twkc{font-size:22px;filter:drop-shadow(0 2px 2px #0006)}.twkb{flex:1;padding:9px 12px 10px;min-width:0}.twk header{display:flex;justify-content:space-between;gap:8px;align-items:baseline}
.twk h4{margin:0;font-size:16px;color:#3a1a00}.twks{color:#c08a10;letter-spacing:1px;white-space:nowrap;text-shadow:0 1px 0 #fff8}.twks em{color:#0002;font-style:normal}
.twkf{font-size:12px;color:#6a4a2a;margin:2px 0 6px}.twk blockquote{margin:6px 0;padding:6px 10px;border-left:3px solid var(--fc);background:#fff6;border-radius:0 6px 6px 0;font-style:italic;line-height:1.45;font-size:13px}
.twkt{list-style:none;margin:8px 0;padding:0;font-size:13px}.twkt li{display:flex;gap:8px;align-items:flex-start;padding:3px 0;border-bottom:1px dashed #8a6a3a33}.twkt li i{font-style:normal;width:20px;text-align:center}
.twkt li.ok{opacity:.5;text-decoration:line-through}.twkt li.cur{font-weight:bold;color:#7a2a00}
.twkm{display:flex;flex-wrap:wrap;gap:5px;margin:6px 0}.twkm span{font-size:11.5px;background:#a8402f22;border:1px solid #a8402f66;color:#7a1a00;border-radius:10px;padding:1px 8px}
.twkw{display:flex;flex-wrap:wrap;gap:5px;margin:6px 0 2px}.twkw span{font-size:12px;background:#ffffff88;border:1px solid #8a6a3a55;border-radius:10px;padding:2px 8px}
.twkw .r1{color:#1a5ab0}.twkw .r2{color:#7a2ab0}.twkw .r3{color:#b06a00;font-weight:bold}
.twk footer{display:flex;gap:6px;justify-content:flex-end;margin-top:8px}.twk footer button{background:#3a2410!important;color:#ffe8b0!important;border-color:#8a6a3a!important}.twk footer button.pri{background:#7a4a10!important;color:#fff2c0!important;border-color:#ffd84a!important}
.twrg{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:8px}.twrc{display:flex;gap:10px;align-items:center;padding:8px 10px;border-radius:9px;border:1px solid var(--fc);background:linear-gradient(160deg,color-mix(in srgb,var(--fc) 18%,transparent),transparent)}
.twrc>div{flex:1}.twrc b{display:block}.twrc small{opacity:.8}.twlg{font-size:13px;padding:3px 0}.twlg span{color:#ffd84a}
.twrp{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:8px}.twri{padding:8px 10px;border-radius:9px;border:1px solid #ffffff33;background:#0003;display:flex;flex-direction:column;gap:4px}.twri small{opacity:.75}
.twri.r1{border-color:#4aa3ff88}.twri.r2{border-color:#b866ff88}.twri.r3{border-color:#ffae2b}
.twq .twqi{display:flex;gap:10px;align-items:center;padding:7px 9px;margin:6px 0;border-radius:8px;border-left:4px solid var(--fc);background:#ffffff0a}.twqi b{display:block}.twqi small{display:block;opacity:.85}.twqi small i{font-style:normal}.twwp{color:#ff9a8a}
#qt .twqt{background:linear-gradient(90deg,transparent,rgba(10,10,20,.62) 30%);border-right:3px solid var(--fc);padding:4px 8px 5px;margin:0 0 5px;border-radius:6px 0 0 6px}
#qt .twqt b{display:block;color:var(--fc);font-size:12px}#qt .twqt span{display:block;color:#fff;font-size:12px}#qt .twqt span i{font-style:normal;margin-right:4px}#qt .twqt em{display:block;font-style:normal;color:#ff9a9a;font-size:11px}
</style>`);
