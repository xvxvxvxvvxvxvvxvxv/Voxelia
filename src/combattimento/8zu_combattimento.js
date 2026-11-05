/* ================= 7.19: IL COMBATTIMENTO NUOVO — OGNI ARMA HA LE SUE MOSSE =================
   Attacco (Spazio, X, il pulsante grande sul telefono o un clic sul nemico): ogni pressione fa la mossa seguente della
   catena dell'arma, tre colpi diversi. Premere di nuovo al momento giusto, quando la mossa finisce, dà un «Colpo perfetto»
   (+30%). Lasciando fare a lui (bersaglio cliccato e basta) l'eroe ripete solo il primo colpo, più lentamente.
   Colpo caricato (tieni premuto Spazio o X, o il pulsante grande): più a lungo carichi, più è forte. Ogni arma ha il suo.
   Le mosse colpiscono tutti i nemici nella loro forma (arco, affondo, cerchio, onda, dardo) e hanno effetti propri:
   sanguinamento, stordimento, corazza spezzata, rallentamento, risucchio di vita, nemici spinti o tirati.
   Pugnale/Stocco · Spada · Ascia · Martello/Mazza · Lancia · Tridente · Bastone/Scettro · Falce. */
const CBW={
  dag:{n:'Pugnale',ic:'🗡',c:'255,240,210',c:'230,235,255',
    c3:[{n:'Taglio',sh:'arc',r:1.5,a:110,m:.85,d:.24,h:.45,p:'sw',kb:.1},{n:'Rovescio',sh:'arc',r:1.5,a:110,m:.85,d:.24,h:.45,p:'bh',kb:.1},{n:'Doppia pugnalata',sh:'line',r:1.9,w:.8,m:1.45,d:.34,h:.5,p:'dl',kb:.2,st:{bld:3}}],
    hv:{n:'Danza delle lame',k:'dash',r:3.4,m:1.1,cd:4.5,st:{bld:4}}},
  swd:{n:'Spada',ic:'⚔',c:'230,240,255',
    c3:[{n:'Fendente',sh:'arc',r:1.75,a:140,m:1,d:.34,h:.48,p:'sw',kb:.25},{n:'Montante',sh:'arc',r:1.75,a:110,m:1.1,d:.34,h:.48,p:'bh',kb:.25},{n:'Colpo del cavaliere',sh:'line',r:2.2,w:1,m:1.6,d:.42,h:.5,p:'th',kb:1.1}],
    hv:{n:'Turbine',k:'spin',r:2.3,m:1.05,n2:2,cd:5}},
  axe:{n:'Ascia',ic:'🪓',c:'255,220,190',
    c3:[{n:'Fendente pesante',sh:'arc',r:1.7,a:130,m:1.3,d:.42,h:.55,p:'sw',kb:.4},{n:'Rovescio',sh:'arc',r:1.7,a:130,m:1.3,d:.42,h:.55,p:'bh',kb:.4},{n:'Spaccascudi',sh:'arc',r:1.85,a:70,m:1.9,d:.5,h:.58,p:'ov',kb:.6,st:{vul:6}}],
    hv:{n:'Salto del boia',k:'leap',r:3.6,m:2.3,ar:2.2,cd:6.5,st:{vul:6}}},
  ham:{n:'Martello',ic:'🔨',c:'255,210,150',
    c3:[{n:'Colpo',sh:'arc',r:1.6,a:120,m:1.45,d:.48,h:.58,p:'sw',kb:.8},{n:'Montante',sh:'arc',r:1.6,a:100,m:1.55,d:.48,h:.58,p:'bh',kb:.8},{n:'Schianto',sh:'circ',r:2,m:2.1,d:.6,h:.6,p:'ov',kb:.9,st:{stn:1.2}}],
    hv:{n:'Terremoto',k:'slam',r:3.3,m:2.3,cd:7,st:{stn:1.8}}},
  spr:{n:'Lancia',ic:'🔱',c:'220,240,255',
    c3:[{n:'Stoccata',sh:'line',r:2.7,w:.7,m:1,d:.3,h:.45,p:'th',kb:.3},{n:'Stoccata alta',sh:'line',r:2.7,w:.7,m:1.1,d:.3,h:.45,p:'th',kb:.3},{n:'Spazzata',sh:'arc',r:2.4,a:220,m:1.3,d:.46,h:.55,p:'sp1',kb:1.2}],
    hv:{n:'Carica',k:'dash',r:4.4,m:1.9,cd:5.5,kb:1}},
  tri:{n:'Tridente',ic:'🔱',c:'150,220,255',
    c3:[{n:'Affondo',sh:'line',r:2.4,w:.8,m:1,d:.32,h:.45,p:'th',kb:.2},{n:'Affondo',sh:'line',r:2.4,w:.8,m:1.1,d:.32,h:.45,p:'th',kb:.2},{n:'Tre punte',sh:'arc',r:2.5,a:80,m:1.35,d:.44,h:.52,p:'th',pull:.9}],
    hv:{n:'Maremoto',k:'wave',r:4.3,a:75,m:1.6,cd:6,kb:1.3,st:{slw:3}}},
  stf:{n:'Bastone',ic:'✨',c:'200,160,255',
    c3:[{n:'Dardo arcano',sh:'proj',r:7,m:.95,d:.3,h:.45,p:'ca'},{n:'Dardo arcano',sh:'proj',r:7,m:.95,d:.3,h:.45,p:'ca'},{n:'Catena di fulmini',sh:'chain',r:6,m:1.25,d:.44,h:.5,p:'ca',ch:2}],
    hv:{n:'Nova arcana',k:'nova',r:2.7,m:2.05,cd:5.5,st:{slw:3}}},
  scy:{n:'Falce',ic:'🌙',c:'200,255,210',
    c3:[{n:'Mietitura',sh:'arc',r:2.1,a:160,m:1.05,d:.38,h:.5,p:'sw',kb:.3},{n:'Rovescio',sh:'arc',r:2.1,a:160,m:1.05,d:.38,h:.5,p:'bh',kb:.3},{n:'Raccolto',sh:'circ',r:2.3,m:1.45,d:.5,h:.55,p:'sp1',ls:.15}],
    hv:{n:'Danza della morte',k:'spin',r:2.6,m:1.3,n2:2,cd:6,ls:.2}}};
CBW.dag.c='230,235,255';
const CBN={dag:'Pugnale e stocco',swd:'Spada',axe:'Ascia',ham:'Martello e mazza',spr:'Lancia',tri:'Tridente',stf:'Bastone e scettro',scy:'Falce'};
const CMB={cur:null,step:-1,end:-9,next:0,buf:0,bufT:0,press:-9,kh:0,th:0,ch:null,dash:null,last:-9,proj:[],perf:-9,ui:null,uk:''};
const cbOn=()=>!!(started&&P&&P.hp>0&&(MODE==='story'||MODE==='ed')&&!(typeof NAV!=='undefined'&&NAV&&Zk==='mare'));
const cbCls=()=>{const w=P&&P.eq&&P.eq.w;if(!w)return'swd';const c=itype(w);return CBW[c]?c:'swd'};
const cbW=()=>CBW[cbCls()];
const cbRad=e=>e.boss?.75:(e.m&&e.m.top>50?.5:.35);
function cbDir(r){// verso chi colpire: il bersaglio, poi il nemico più vicino davanti, poi dove guardi
  let tg=P.tg&&P.tg.k==='en'&&ents.includes(P.tg)?P.tg:null;if(tg&&dist(tg,P)>r+2.5)tg=null;
  if(!tg){let bd=r+1.4;const[fx,fy]=P.dr||[0,1];for(const e of ents){if(e.k!=='en'||e.al===0&&e.hid)continue;const dx=e.px-P.px,dy=e.py-P.py,d=Math.hypot(dx,dy),fr=d>0?(dx*fx+dy*fy)/d:1,sc=d-fr*.6;if(sc<bd){bd=sc;tg=e}}}
  if(tg){const dx=tg.px-P.px,dy=tg.py-P.py,d=Math.hypot(dx,dy)||1;return{dx:dx/d,dy:dy/d,tg}}const[dx,dy]=P.dr||[0,1];return{dx,dy,tg:null}}
// chi è dentro la forma della mossa
function cbIn(e,mv,ox,oy,dx,dy){const ex=e.px-ox,ey=e.py-oy,d=Math.hypot(ex,ey),rr=cbRad(e);
  if(mv.sh==='circ')return d<=mv.r+rr;
  if(mv.sh==='arc'||mv.sh==='wave'){if(d>mv.r+rr)return false;if(d<.7)return true;const c=(ex*dx+ey*dy)/d;return c>=Math.cos((mv.a||120)/2*Math.PI/180)}
  if(mv.sh==='line'){const al=ex*dx+ey*dy,pe=Math.abs(ex*dy-ey*dx);return al>-.4&&al<=mv.r+rr&&pe<=(mv.w||.8)/2+rr}
  return false}
// il colpo su un nemico, con gli effetti della mossa
function cbHurt(e,mult,mv,dx,dy,o){if(!ents.includes(e))return 0;const r=roll(mult);const hp0=e.hp;hurtE(e,r.d,0,r.cr);const dealt=Math.max(0,hp0-Math.max(0,e.hp));
  const alive=ents.includes(e);if(alive&&!e.boss&&!e.np){const kb=(o&&o.kb!=null?o.kb:mv.kb)||0;if(kb){const ex=e.px-P.px,ey=e.py-P.py,d=Math.hypot(ex,ey)||1;mv2(e,(ex/d*.6+dx*.4)*kb,(ey/d*.6+dy*.4)*kb)}
    if(mv.pull){const ex=P.px-e.px,ey=P.py-e.py,d=Math.hypot(ex,ey);if(d>1.1)mv2(e,ex/d*Math.min(mv.pull,d-1),ey/d*Math.min(mv.pull,d-1))}}
  const st=(o&&o.st)||mv.st;if(alive&&st){const b=e.boss?.35:1;if(st.stn){e.cbs=Math.max(e.cbs||0,t+st.stn*b);flt(e,'Stordito','#ffd84a')}if(st.bld){e.cbb={u:t+st.bld,d:Math.max(1,Math.round(r.d*.12)),n:0};}if(st.vul){e.cbv=t+st.vul;flt(e,'Corazza spezzata','#ffb04a')}if(st.slw){e.cbl=t+st.slw*b}}
  const ls=(o&&o.ls)||mv.ls;if(ls&&dealt>0&&P.hp>0){const h=Math.max(1,Math.round(dealt*ls));P.hp=Math.min(P.mx,P.hp+h);flt(P,'+'+h,'#7aff9a')}
  return dealt}
function mv2(e,dx,dy){const s=6,sx=dx/s,sy=dy/s;for(let i=0;i<s;i++){if(!blk(e.px+sx,e.py))e.px+=sx;if(!blk(e.px,e.py+sy))e.py+=sy}}
/* ---- una mossa della catena ---- */
function cbDo(step,o){const W=cbW(),mv=W.c3[step],D=cbDir(mv.r);P.dr=[D.dx,D.dy];if(D.tg)P.tg=D.tg;P.path=[];
  CMB.cur={mv,step,t0:t,d:mv.d,hit:0,dx:D.dx,dy:D.dy,tg:D.tg,perf:!!(o&&o.perf),auto:!!(o&&o.auto),W};CMB.step=step;CMB.last=t;
  haStart('mv',mv.d,{p:mv.p,W:cbCls()});P.sw=.2;P.swc++;
  if(CMB.cur.perf){CMB.perf=t;flt(P,'Perfetto!','#ffe28a');tone(980,.05,'triangle',.05)}}
function cbStrike(c){const mv=c.mv,W=c.W,cr=c.perf?1.3:1,dx=c.dx,dy=c.dy,ox=P.px,oy=P.py,col=W.c,A=Math.atan2(dy,dx);let n=0;
  if(mv.sh==='proj'){CMB.proj.push({x:ox+dx*.4,y:oy+dy*.4,dx,dy,v:12,l:mv.r,m:mv.m*cr,c:col,mv});whoosh();tone(720,.06,'sine',.05);return}
  if(mv.sh==='chain'){const L=[];let from={px:ox,py:oy},tg=c.tg&&ents.includes(c.tg)&&dist(c.tg,P)<=mv.r?c.tg:null;
    if(!tg){let bd=mv.r;for(const e of ents)if(e.k==='en'){const d=dist(e,P);if(d<bd){bd=d;tg=e}}}
    for(let i=0;tg&&i<=mv.ch;i++){L.push(tg);const a=from;vf({k:'thrust',x:a.px,y:a.py,dx:(tg.px-a.px)/(dist(tg,a)||1),dy:(tg.py-a.py)/(dist(tg,a)||1),r:dist(tg,a),c:'200,190,255',d:.35,w:.8,z:16,star:1});
      cbHurt(tg,mv.m*cr*(i?.7:1),mv,dx,dy);from=tg;let nx=null,bd=3.6;for(const e of ents)if(e.k==='en'&&!L.includes(e)){const d=dist(e,from);if(d<bd){bd=d;nx=e}}tg=nx}
    if(!L.length)vf({k:'thrust',x:ox,y:oy,dx,dy,r:3,c:'200,190,255',d:.3,w:.7,z:16,star:1});tone(1200,.08,'sawtooth',.04);return}
  for(const e of ents.slice())if(e.k==='en'&&cbIn(e,mv,ox,oy,dx,dy)){cbHurt(e,mv.m*cr,mv,dx,dy);n++}
  if(inPit(P.px,P.py))for(const o of NET.list)if(inPit(o.px,o.py)&&cbIn(o,mv,ox,oy,dx,dy)){const r=roll(mv.m*cr);pvpHit(o,r.d,r.cr)}
  // l'effetto
  if(mv.sh==='arc'){const sp=(mv.a||120)*Math.PI/180;vf({k:'slash',x:ox,y:oy,a:A-sp/2,sp,r:mv.r*.85,c:col,c2:'255,255,255',d:.28,w:mv.m>1.5?14:10,z:mv.p==='ov'?8:13})}
  else if(mv.sh==='line'){vf({k:'thrust',x:ox,y:oy,dx,dy,r:mv.r,c:col,d:.24,w:mv.m>1.4?1.4:1,z:14,star:mv.m>1.4})}
  else if(mv.sh==='circ'){vf({k:'ring',x:ox,y:oy,r0:.3,r:mv.r,c:col,d:.35,w:8,fill:1});if(mv.p==='ov'){vf({k:'crack',x:ox+dx*.8,y:oy+dy*.8,r:1.6,d:1.2});shake(.25)}else vf({k:'spin',x:ox,y:oy,a:A,r:mv.r*.8,c:col,d:.3,fol:1})}
  if(n){tone(mv.m>1.5?140:260,.06,'square',.05);if(mv.m>=1.4)shake(.12)}else whoosh()}
/* ---- il colpo caricato ---- */
function cbHeavy(lv){CMB.cur=null;CMB.buf=0;const k=cbCls(),W=CBW[k],H=W.hv,cm=.65+.85*lv,D=cbDir(H.r),dx=D.dx,dy=D.dy,ox=P.px,oy=P.py,A=Math.atan2(dy,dx),col=W.c;
  P.dr=[dx,dy];P.path=[];P.sk=H.cd;P.swc++;P.sw=.3;CMB.last=t;CMB.step=-1;flt(P,H.n+'!','#ffd84a');
  const mvH=Object.assign({sh:'circ',kb:H.kb||.6,st:H.st,ls:H.ls},{r:H.r});
  if(H.k==='dash'){const dist2=Math.min(H.r,D.tg?dist(D.tg,P)+1.2:H.r),dur=.22;P.dm={k:'l',t:dur,v:dist2/dur,dx,dy,h:[],m:H.m*cm};P.iv=Math.max(P.iv||0,dur+.1);
    CMB.dash={dm:P.dm,st:H.st,kb:H.kb};haStart('mv',dur+.1,{p:k==='spr'?'th':'dl',W:k});vf({k:'thrust',x:ox,y:oy,dx,dy,r:dist2,c:col,d:.35,w:1.6,z:14,star:1});
    for(let i=0;i<3;i++)vf({k:'ghost',L:heroModel(),x:ox+dx*dist2*i/3,y:oy+dy*dist2*i/3,fc:P.fc,d:.3+i*.06,a:.35});whoosh();tone(400,.1,'sawtooth',.05);return}
  if(H.k==='leap'){let tx=ox+dx*H.r,ty=oy+dy*H.r;if(D.tg&&dist(D.tg,P)<=H.r+.5){tx=D.tg.px-dx*.6;ty=D.tg.py-dy*.6}const dl=Math.hypot(tx-ox,ty-oy),dur=.42;
    P.dm={k:'l',t:dur,v:dl/dur,dx,dy,h:[],m:.35};P.iv=Math.max(P.iv||0,dur+.15);haStart('mv',dur+.15,{p:'sl',W:k});
    CMB.land={t:t+dur,mv:Object.assign({},mvH,{r:H.ar}),m:H.m*cm,col};tone(300,.12,'sawtooth',.05);whoosh();return}
  if(H.k==='slam'){haStart('mv',.55,{p:'sl',W:k});CMB.land={t:t+.38,mv:mvH,m:H.m*cm,col,slam:1};return}
  if(H.k==='spin'){haStart('mv',.55*(H.n2||1),{p:'sp',W:k,spin:1});CMB.spin={n:H.n2||1,i:0,t:t+.12,mv:Object.assign({},mvH,{ls:H.ls}),m:H.m*cm,col};vf({k:'spin',x:ox,y:oy,a:A,r:H.r*.85,c:col,d:.55*(H.n2||1),fol:1});vf({k:'tornado',x:ox,y:oy,c:col,d:.5,fol:1});whoosh();return}
  if(H.k==='wave'){haStart('mv',.5,{p:'th',W:k});const mv={sh:'wave',r:H.r,a:H.a,kb:H.kb,st:H.st};let n=0;
    for(const e of ents.slice())if(e.k==='en'&&cbIn(e,mv,ox,oy,dx,dy)){cbHurt(e,H.m*cm,mv,dx,dy);n++}
    vf({k:'cone',x:ox,y:oy,dx,dy,r:H.r,c:'120,200,255',d:.6});vf({k:'cone',x:ox,y:oy,dx,dy,r:H.r*.7,c:'230,250,255',d:.45});if(cineOK())sparks(ox+dx*2,oy+dy*2,22,['#bfe8ff','#ffffff','#5ab0ff'],90);shake(.2);tone(180,.3,'sawtooth',.05);return}
  if(H.k==='nova'){let tx=ox+dx*3,ty=oy+dy*3;if(D.tg&&dist(D.tg,P)<=6.5){tx=D.tg.px;ty=D.tg.py}haStart('mv',.5,{p:'ca',W:k});vf({k:'flash',x:tx,y:ty,r:60,c:'200,160,255',d:.4,z:30});
    CMB.land={t:t+.32,x:tx,y:ty,mv:mvH,m:H.m*cm,col:'200,160,255',nova:1};tone(600,.3,'sine',.05);return}}
function cbLand(L){const x=L.x!=null?L.x:P.px,y=L.y!=null?L.y:P.py;let n=0;for(const e of ents.slice())if(e.k==='en'&&cbIn(e,L.mv,x,y,0,1)){const sv=[P.px,P.py];if(L.nova){P.px=x;P.py=y}try{cbHurt(e,L.m,L.mv,0,0)}finally{P.px=sv[0];P.py=sv[1]}n++}
  vf({k:'ring',x,y,r0:.2,r:L.mv.r,c:L.col,d:.45,w:10,fill:1});vf({k:'ring',x,y,r0:.2,r:L.mv.r*.65,c:'255,255,255',d:.3,w:5});
  if(!L.nova){vf({k:'crack',x,y,r:L.mv.r*.8,n:9,d:1.6});if(cineOK())sparks(x,y,26,['#c8a878','#8a6a42','#ffffff'],110);shake(L.slam?.55:.4);tone(70,.35,'sawtooth',.07)}
  else{if(cineOK())sparks(x,y,30,['#c8a0ff','#ffffff','#7a5aff'],120);tone(300,.25,'triangle',.06)}}
/* ---- i comandi: premere, tenere premuto, lasciare ---- */
function cbPress(src){if(!cbOn()||PM||P.dm)return;CMB.press=t;CMB.src=src||'k';
  if(CMB.cur){const c=CMB.cur,k=(t-c.t0)/c.d;if(k>.35&&!CMB.buf){CMB.buf=1;CMB.bufT=t}return}
  const W=cbW(),since=t-CMB.end,chain=CMB.step>=0&&since<.65,step=chain?(CMB.step+1)%3:0,perf=chain&&since<.2;cbDo(step,{perf})}
function cbRelease(){if(!CMB.ch)return;const lv=clamp((t-CMB.ch.t0-.25)/.9,0,1);CMB.ch=null;if(!cbOn()||P.dm){return}cbHeavy(lv)}
const _area719=area;area=function(){if(CMB.rep&&cbOn()&&MODE!=='dim'&&!PM)return;if(PM==='dig'&&DIG||FSH&&PM==='fish'||typeof DU!=='undefined'&&DU&&PM==='duel'||typeof NAV!=='undefined'&&NAV&&Zk==='mare'||!cbOn()||MODE==='dim'){_area719();return}cbPress('k')};
addEventListener('keydown',e=>{if(e.target&&/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;const k=e.key.toLowerCase();if(k===' '||k==='x'){CMB.kh=1;CMB.rep=e.repeat;if(k==='x'&&!e.repeat&&started&&!PM)cbPress('k')}},true);
addEventListener('keyup',e=>{const k=e.key.toLowerCase();if(k===' '||k==='x'){CMB.kh=0;cbRelease()}});
addEventListener('blur',()=>{CMB.kh=0;CMB.th=0;CMB.ch=null});
document.addEventListener('pointerdown',e=>{if(e.target&&e.target.closest&&e.target.closest('#t-area')){CMB.th=1}},true);
document.addEventListener('pointerup',e=>{if(CMB.th){CMB.th=0;cbRelease()}},true);
document.addEventListener('pointercancel',()=>{if(CMB.th){CMB.th=0;cbRelease()}},true);
// cliccare il nemico che hai già a portata è un attacco
{const pd=cv.onpointerdown;cv.onpointerdown=ev=>{const tg0=P&&P.tg;pd(ev);if(!cbOn()||ev.button!==0&&ev.button!=null)return;const tg=P.tg;
  if(tg&&tg.k==='en'&&ents.includes(tg)){const r=cbW().c3[Math.max(0,CMB.step+1)%3].r;if(dist(tg,P)<=r+cbRad(tg)+.3)cbPress('c')}}}
/* ---- ogni fotogramma ---- */
const _upd719=upd;upd=function(dt){const on=cbOn()&&MODE!=='dim';let ox=0,oy=0,frozen=null;
  if(on){if(!(P.tg&&P.tg.k==='pl'))P.at=Math.max(P.at||0,.3);ox=P.px;oy=P.py;
    frozen=[];for(const e of ents)if(e.k==='en'&&((e.cbs||0)>t||(e.cbl||0)>t)){frozen.push([e,e.px,e.py]);if(e.cbs>t)e.cdt=Math.max(e.cdt||0,e.cbs-t+.05)}}
  _upd719(dt);if(!on)return;
  // nemici storditi fermi, rallentati a metà
  for(const[e,x,y]of frozen){if(!ents.includes(e))continue;if(e.cbs>t){e.px=x;e.py=y}else{e.px=x+(e.px-x)*.45;e.py=y+(e.py-y)*.45}}
  // sanguinamento
  for(const e of ents.slice())if(e.k==='en'&&e.cbb){if(t>e.cbb.u){e.cbb=null;continue}e.cbb.n+=dt;if(e.cbb.n>=.5){e.cbb.n=0;hurtE(e,e.cbb.d,1);if(cineOK()&&ents.includes(e))sparks(e.px,e.py,3,['#c0202a','#801018'],40)}}
  // la mossa in corso: il colpo arriva a metà, alla fine si apre la finestra per la mossa dopo
  const c=CMB.cur;if(c){const k=(t-c.t0)/c.d;if(!c.hit&&k>=c.mv.h){c.hit=1;cbStrike(c)}
    if(k<1){if(!P.dm&&(P.px!==ox||P.py!==oy)){P.px=ox+(P.px-ox)*.35;P.py=oy+(P.py-oy)*.35}}
    else{CMB.cur=null;CMB.end=t;if(CMB.buf&&t-CMB.bufT<.6){CMB.buf=0;const perf=t-CMB.bufT<.22;cbDo((c.step+1)%3,{perf})}else CMB.buf=0}}
  // colpi automatici: chi tiene solo il bersaglio ripete il primo colpo, più piano
  if(!CMB.cur&&!P.dm&&!CMB.ch&&P.tg&&P.tg.k==='en'&&ents.includes(P.tg)&&t>=CMB.next&&t-CMB.press>.8){const mv=cbW().c3[0];if(dist(P.tg,P)<=mv.r+cbRad(P.tg)-.05){cbDo(0,{auto:1});CMB.step=-1;CMB.next=t+mv.d+.55}}
  // carica: si tiene premuto
  if(!CMB.ch&&(CMB.kh||CMB.th)&&t-CMB.press>.3&&t-CMB.press<2&&!P.dm){if(P.sk<=0){CMB.ch={t0:t};CMB.buf=0}else if(!CMB.skw||t-CMB.skw>2){CMB.skw=t;flt(P,'Caricato tra '+Math.ceil(P.sk)+'s','#9adcff')}}
  if(CMB.ch){if(!(CMB.kh||CMB.th)){cbRelease()}else{const lv=clamp((t-CMB.ch.t0-.25)/.9,0,1);if(!P.dm&&(P.px!==ox||P.py!==oy)){P.px=ox+(P.px-ox)*.45;P.py=oy+(P.py-oy)*.45}
      if(cineOK()&&Math.random()<dt*(10+lv*30))sparks(P.px+(Math.random()-.5)*.6,P.py+(Math.random()-.5)*.6,1,lv>=1?['#ffe28a','#ffffff']:['#9adcff','#ffffff'],60);
      if(lv>=1&&!CMB.ch.full){CMB.ch.full=1;tone(880,.08,'triangle',.05);flt(P,'Carico!','#ffe28a')}}}
  // i colpi caricati che arrivano dopo
  if(CMB.land&&t>=CMB.land.t){const L=CMB.land;CMB.land=null;cbLand(L)}
  if(CMB.spin&&t>=CMB.spin.t){const S2=CMB.spin;let n=0;for(const e of ents.slice())if(e.k==='en'&&dist(e,P)<=S2.mv.r+cbRad(e)){cbHurt(e,S2.m,S2.mv,0,0);n++}if(n)tone(240,.06,'square',.05);else whoosh();S2.i++;if(S2.i>=S2.n)CMB.spin=null;else S2.t=t+.27}
  if(CMB.dash&&!P.dm){const Dd=CMB.dash;CMB.dash=null;for(const e of Dd.dm.h)if(ents.includes(e)&&e.k==='en')cbHurt(e,0,{kb:Dd.kb||0,st:Dd.st},Dd.dm.dx,Dd.dm.dy)}
  // i dardi del bastone
  for(const q of CMB.proj){const s=q.v*dt;q.x+=q.dx*s;q.y+=q.dy*s;q.l-=s;if(blk(q.x,q.y)){q.l=0;continue}
    for(const e of ents)if(e.k==='en'&&Math.hypot(e.px-q.x,e.py-q.y)<.45+cbRad(e)*.5){cbHurt(e,q.m,q.mv,q.dx,q.dy);q.l=0;vf({k:'flash',x:q.x,y:q.y,r:40,c:q.c,d:.25,z:14});if(cineOK())sparks(q.x,q.y,8,['#c8a0ff','#ffffff'],70);break}}
  CMB.proj=CMB.proj.filter(q=>q.l>0);cbUI()};
// i colpi «a vuoto» (0 danni) usati solo per gli effetti non fanno numeri
const _roll719=roll;roll=function(m){if(m===0)return{d:0,cr:false};return _roll719(m)};
const _hurtE719=hurtE;hurtE=function(e,d,rem,cr){if(d<=0&&!rem){return}if(e&&e.cbv>t)d=Math.round(d*1.3);_hurtE719(e,d,rem,cr)};
/* ---- le pose dell'eroe per ogni mossa ---- */
function mvPose(L,H,k){const isArmR=q=>q[0]+q[3]/2>.18&&q[2]>5,isArmL=q=>q[0]+q[3]/2<-.25&&q[2]>5&&q[2]<22,isLeg=q=>q[2]<1&&q[5]>3,up=q=>q[2]>=8.5;
  const e3=ease3,M=f=>L.map(q=>f(q)||q),mo=(q,x,y,z)=>[q[0]+x,q[1]+y,q[2]+z,q[3],q[4],q[5],q[6]];
  const ph=(a,b)=>clamp((k-a)/(b-a),0,1),w=e3(ph(0,.4)),s=e3(ph(.4,.62)),r=1-e3(ph(.62,1));
  switch(H.p){
    case 'sw':case 'bh':{const R=.32,rev=H.p==='bh';let th=rev?(w*2.6-s*3.4)*(1-ph(.62,1)):(-w*.9+s*3.1)*(r>0?r:0);if(k>.62)th*=r;
      const ax=R*Math.cos(th)-R,ay=R*Math.sin(th),az=(w*4+s*-1)*(k<.62?1:r);const tw=(rev?-1:1)*(s*.06-w*.04)*(k<.62?1:r);
      return M(q=>isArmR(q)?mo(q,ax,ay,az):up(q)?mo(q,0,tw,0):isLeg(q)&&q[0]<0?mo(q,0,.08*s*(k<.62?1:r),0):null)}
    case 'ov':{const z=w*13-s*18,y=-.14*w+.5*s;const f=k<.62?1:r;return M(q=>isArmR(q)?mo(q,-.08*s*f,y*f,z*f):isArmL(q)?mo(q,.05*s*f,.2*s*f,6*w*f):up(q)?mo(q,0,.06*s*f,-1.5*s*f):null)}
    case 'th':case 'dl':{let a;if(H.p==='dl'){const p1=Math.sin(ph(0,.45)*Math.PI),p2=Math.sin(ph(.45,1)*Math.PI);a=Math.max(p1,p2)}else a=k<.4?-.3*w:k<.62?s:r;
      return M(q=>isArmR(q)?mo(q,-.06*a,.6*a,1.5*a):up(q)?mo(q,0,.1*a,-1*Math.max(0,a)):isLeg(q)&&q[0]<0?mo(q,0,.14*Math.max(0,a),0):isLeg(q)?mo(q,0,-.1*Math.max(0,a),0):null)}
    case 'sp':case 'sp1':{const a=Math.sin(Math.min(1,k)*Math.PI);return M(q=>isArmR(q)?mo(q,.18*a,.12*a,2*a):isArmL(q)?mo(q,-.1*a,0,1*a):null)}
    case 'sl':{const j=Math.sin(Math.min(1,k/.7)*Math.PI)*14,ov=k<.45?e3(k/.45):1-e3((k-.45)/.25);return M(q=>isArmR(q)?mo(q,-.04*ov,-.08+.4*(1-ov),j+16*ov-5*(1-ov)):mo(q,0,0,j))}
    case 'ca':{const a=k<.4?w:k<.62?1:r;return M(q=>isArmR(q)||isArmL(q)?mo(q,(q[0]<0?.06:-.06)*a,.28*s*(k<.62?1:r),8*a):up(q)?mo(q,0,0,.8*a):null)}}
  return L}
const _heroPose719=heroPose;heroPose=function(L){if(HA&&HA.k==='mv'){const k=(t-HA.t0)/HA.d;if(k>=1){HA=null;return L}return mvPose(L,HA,k)}return _heroPose719(L)};
const _heroFace719=heroFace;heroFace=function(fc){if(HA&&HA.k==='mv'&&(HA.spin||HA.p==='sp1')){const k=(t-HA.t0)/HA.d;return(fc+Math.floor(k*(HA.spin?16:8)))&7}return _heroFace719(fc)};
const heroModel=()=>{try{return heroSnap()}catch(_){return[]}};
/* ---- i dardi, i nemici storditi, sanguinanti, con la corazza spezzata ---- */
const _vfDraw719=vfDraw;vfDraw=function(){_vfDraw719();if(!CMB.proj.length)return;g.setTransform(S*DPR,0,0,S*DPR,(W/2-camX*S)*DPR,(H/2-camY*S)*DPR);g.save();g.globalCompositeOperation='lighter';
  for(const q of CMB.proj){const X=PX(q.x,q.y),Y=PY(q.x,q.y,15);g.drawImage(glowSpr(q.c),X-22,Y-16,44,32);g.fillStyle='rgba(255,255,255,.95)';g.beginPath();g.arc(X,Y,4,0,7);g.fill();
    for(let i=1;i<5;i++){const X2=PX(q.x-q.dx*i*.15,q.y-q.dy*i*.15),Y2=PY(q.x-q.dx*i*.15,q.y-q.dy*i*.15,15);g.globalAlpha=.5-i*.1;g.drawImage(glowSpr(q.c),X2-12,Y2-9,24,18)}g.globalAlpha=1}g.restore()};
const _ent719=ent;ent=function(e){_ent719(e);if(!e||e.k!=='en')return;const top=(e.m&&e.m.top||36)+10;
  if(e.cbs>t)for(let i=0;i<3;i++){const a=t*5+i*2.09;box(e.px+Math.cos(a)*.3-.05,e.py+Math.sin(a)*.3-.05,top,.1,.1,2.4,'#ffd84a',1.3)}
  if(e.cbv>t){box(e.px-.12,e.py-.02,top+5,.1,.04,4,'#c8a060');box(e.px+.03,e.py-.02,top+5,.1,.04,4,'#a88040')}
  if(e.cbb&&t<e.cbb.u&&Math.sin(t*9+e.px)>.6)box(e.px+(Math.sin(t*3)*.15),e.py,top-14+((t*30)%10),.05,.05,1.6,'#c0202a');
  if(e.cbl>t)box(e.px-.3,e.py-.3,.3,.6,.6,.4,'#7ab8ff',.9)};
/* ---- l'interfaccia: lo stile dell'arma, la catena, la carica ---- */
function cbUI(){let el=CMB.ui;if(!el){el=CMB.ui=document.createElement('div');el.id='cbui';el.innerHTML='<b></b><span class="pp"><i></i><i></i><i></i></span><div class="cg"><i></i></div><em>Perfetto!</em>';document.body.appendChild(el)}
  const near=ents.some(e=>e.k==='en'&&dist(e,P)<9),show=cbOn()&&!PM&&(near||t-CMB.last<3),W=cbW();
  const step=CMB.cur?CMB.cur.step:(t-CMB.end<.65?CMB.step:-1),lv=CMB.ch?clamp((t-CMB.ch.t0-.25)/.9,0,1):-1,pf=t-CMB.perf<.6;
  const key=(show?1:0)+'|'+W.n+'|'+step+'|'+(lv<0?-1:Math.round(lv*20))+'|'+pf+'|'+(P.sk>0?Math.ceil(P.sk):0);if(key===CMB.uk)return;CMB.uk=key;
  el.classList.toggle('on',show);if(!show)return;el.querySelector('b').textContent=W.ic+' '+W.n+(P.sk>0?' · caricato tra '+Math.ceil(P.sk)+'s':' · caricato pronto');
  el.querySelectorAll('.pp i').forEach((x,i)=>{x.className=i<=step?'on':'';x.title=W.c3[i].n});const cg=el.querySelector('.cg');cg.style.display=lv<0?'none':'block';cg.querySelector('i').style.width=Math.round(Math.max(0,lv)*100)+'%';cg.classList.toggle('full',lv>=1);
  el.querySelector('em').style.opacity=pf?1:0}
// il ricarico del colpo caricato sul pulsante dipende dall'arma
{const c=CDB.find(x=>x[0]==='b-area');if(c)c[2]=()=>cbW().hv.cd}
// le mosse dell'arma nella scheda dell'oggetto
function cbMovesHTML(it){const c=itype(it),W=CBW[c]||CBW.swd;return`<div class="cbmv"><b>${W.ic} Mosse · ${esc(CBN[c]||W.n)}</b><ol>${W.c3.map(m=>`<li>${esc(m.n)}<small>${cbDesc(m)}</small></li>`).join('')}</ol><p>⚡ <b>${esc(W.hv.n)}</b> <small>(tieni premuto) · ${cbHvDesc(W.hv)}</small></p></div>`}
const cbDesc=m=>({arc:'arco davanti',line:'affondo in linea',circ:'tutto intorno',proj:'dardo a distanza',chain:'fulmine che salta fra i nemici'}[m.sh]||'')+(m.st&&m.st.bld?' · sanguinamento':'')+(m.st&&m.st.stn?' · stordisce':'')+(m.st&&m.st.vul?' · spezza la corazza':'')+(m.pull?' · tira a te':'')+(m.ls?' · ruba vita':'')+(m.kb>=1?' · spinge lontano':'');
const cbHvDesc=h=>({dash:'scatto che trafigge',leap:'salto con onda d\'urto',slam:'colpo a terra che fa tremare',spin:'vortice tutto intorno',wave:'onda che travolge',nova:'esplosione arcana sul bersaglio'}[h.k]||'')+(h.st&&h.st.stn?' · stordisce':'')+(h.st&&h.st.vul?' · spezza la corazza':'')+(h.st&&h.st.slw?' · rallenta':'')+(h.st&&h.st.bld?' · sanguinamento':'')+(h.ls?' · ruba vita':'')+' · ricarica '+h.cd+'s';
const _ivDetail719=ivDetail;ivDetail=function(){let h=_ivDetail719();try{const f=ivFind(IVSEL);if(f&&f.it&&f.it.s==='w'&&MODE!=='dim')h+=cbMovesHTML(f.it)}catch(_){}return h};
// la prima volta: come si combatte adesso
const _begin719=begin;begin=function(d,s){_begin719(d,s);if(P&&!P.cb19){P.cb19=1;setTimeout(()=>{if(!started||PM)return;banner('Il combattimento è cambiato','Spazio o X: catena di colpi · tieni premuto: colpo caricato · ogni arma ha le sue mosse','spade')},s?2500:9000)}};
document.head.insertAdjacentHTML('beforeend',`<style>
#cbui{position:fixed;left:50%;bottom:calc(86px + env(safe-area-inset-bottom,0px));transform:translateX(-50%) translateY(8px);display:flex;flex-direction:column;align-items:center;gap:4px;pointer-events:none;opacity:0;transition:opacity .25s,transform .25s;z-index:40;font-family:Georgia,serif;text-shadow:0 1px 3px #000}
#cbui.on{opacity:1;transform:translateX(-50%)}#cbui b{font-size:12px;color:#ffe8b0;font-weight:normal;background:rgba(10,10,20,.55);padding:2px 10px;border-radius:10px}
#cbui .pp{display:flex;gap:6px}#cbui .pp i{width:26px;height:6px;border-radius:3px;background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.35);transition:background .1s}#cbui .pp i.on{background:#ffd84a;box-shadow:0 0 8px #ffd84a}
#cbui .cg{width:120px;height:7px;border-radius:4px;background:rgba(0,0,0,.5);border:1px solid #9adcff88;overflow:hidden}#cbui .cg i{display:block;height:100%;background:linear-gradient(90deg,#5ab0ff,#bfe8ff)}#cbui .cg.full i{background:linear-gradient(90deg,#ffb04a,#fff2a0)}
#cbui em{font-style:normal;color:#ffe28a;font-size:13px;opacity:0;transition:opacity .2s;height:15px}
body.touch #cbui{bottom:calc(150px + env(safe-area-inset-bottom,0px))}
.cbmv{margin-top:8px;padding:7px 9px;border-radius:8px;background:rgba(255,216,74,.06);border:1px solid rgba(255,216,74,.3);font-size:13px}.cbmv ol{margin:4px 0 4px 18px;padding:0}.cbmv li small,.cbmv p small{opacity:.75;margin-left:6px}.cbmv p{margin:4px 0 0}
</style>`);
// il pulsante grande sul telefono ora è l'attacco (tocca: catena · tieni premuto: caricato)
if(typeof touchBuild==='function'){const _tb719=touchBuild;touchBuild=function(){_tb719();const b=$('t-area');if(b){const l=b.querySelector('b');if(l)l.textContent='Attacco';b.setAttribute('aria-label','Attacco')}}}
if(typeof HUDE!=='undefined'){const h=HUDE.find(x=>x[0]==='t-area');if(h)h[1]='Attacco'}
