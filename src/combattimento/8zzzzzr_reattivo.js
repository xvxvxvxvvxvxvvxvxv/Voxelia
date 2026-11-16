/* ================= 8.13: IL COMBATTIMENTO PIÙ REATTIVO, E CON PIÙ MOVIMENTO =================
   Sopra il combattimento d'azione (8zu_combattimento.js, 8zzg_azione.js), senza cambiare le armi né i danni:
   RISPONDE SUBITO
   - i clic non si perdono più: premuto in qualunque momento della mossa, il colpo dopo è prenotato (prima contava solo
     dopo un terzo della mossa). Il «Colpo perfetto» resta per chi preme al momento giusto: dopo che il colpo è arrivato,
     non prima (premere a ripetizione non lo dà);
   - il colpo fa male prima: a circa un terzo della mossa invece che a metà (le armi pesanti restano un po' più lente);
   - la coda della mossa si salta: dopo il colpo, se hai già premuto parte subito la mossa dopo; se ti muovi, cammini;
   - la capriola parte quando premi Maiusc, non quando lo lasci (tenendolo premuto, dopo si corre come prima).
   SI VEDE E SI SENTE
   - l'eroe fa un passo in avanti con ogni colpo, un affondo vero e scorrevole (prima era un salto di pochi pixel), più
     lungo col terzo colpo; si ferma davanti al nemico invece di passargli attraverso;
   - quando il colpo prende: fermo immagine di qualche centesimo di secondo (più lungo per il terzo colpo e i critici),
     il nemico diventa bianco e viene spinto via scivolando (non più a scatto), le scintille volano nella direzione del
     colpo, la visuale dà un piccolo strattone dalla stessa parte;
   - col terzo colpo della catena i nemici normali barcollano un attimo (i boss no);
   - la capriola e l'affondo alzano la polvere.
   SEMPRE GIRATO VERSO IL NEMICO
   - in combattimento l'eroe guarda sempre il nemico con cui sta combattendo, anche mentre cammina di lato o all'indietro:
     quello bloccato con Tab; se no l'ultimo che hai colpito, o l'ultimo che ti ha attaccato; se no il più vicino che ti
     sta addosso. Mentre corri o rotoli guarda dove va, come prima.
   I NEMICI AVVISANO PRIMA DI COLPIRE (nel combattimento d'azione)
   - prima un nemico ti colpiva nello stesso istante in cui decideva di farlo: ora si ferma, compare un «!» rosso e per
     terra un cerchio rosso che si riempie (mezzo secondo; un po' meno per i boss). Quando il cerchio è pieno colpisce:
     se sei ancora lì ti prende, se ti sei spostato va a vuoto, se stai rotolando lo schivi. Il ritmo dei suoi attacchi
     resta lo stesso; un nemico che barcolla (il terzo colpo della catena) perde l'attacco che stava preparando;
   - SCHIVATA PERFETTA: se la capriola parte proprio all'ultimo (meno di tre decimi di secondo prima del colpo), il tempo
     rallenta un attimo e il colpo dopo è un CONTRATTACCO che fa il doppio del danno. */
const RX={lg:null,kb:[],sh:-9,hits:0,big:0,cr:0};
// il colpo arriva prima: a circa un terzo della mossa (mai prima di un quarto)
for(const k in CBW)for(const m of CBW[k].c3){if(m.h0==null){m.h0=m.h;m.h=Math.max(.26,m.h*.62)}}
// i clic prenotano sempre la mossa dopo (il primo clic conta: premere a ripetizione non fa il «perfetto»)
{const f0=cbPress;cbPress=function(src){if(cbOn()&&!PM&&!P.dm&&CMB.cur&&!CMB.buf){CMB.press=t;CMB.src=src||'k';CMB.buf=1;CMB.bufT=t;return}f0(src)}}
// l'affondo: il passo del colpo diventa scorrevole e più lungo; si ferma davanti al nemico
{const f0=cbDo;cbDo=function(step,o){const x0=P.px,y0=P.py;f0(step,o);const c=CMB.cur;if(!c||c.t0!==t||P.dm||(o&&o.auto))return;
  P.px=x0;P.py=y0;let L=step===2?.62:.38;if(c.perf)L+=.1;if(c.tg&&ents.includes(c.tg)){const d=dist(c.tg,P)-cbRad(c.tg)-.55;L=clamp(Math.min(L,d),0,L)}
  if(L>.02)RX.lg={dx:c.dx,dy:c.dy,L,done:0,t0:t,d:c.d*Math.max(.3,c.mv.h)};if(step===2&&cineOK())rxDust(P.px,P.py,4)}}
// i colpi che prendono: la spinta scorrevole, il lampo, le scintille, il barcollare
{const f0=cbHurt;cbHurt=function(e,mult,mv,dx,dy,o){if(RX.ctr>t&&e&&e.k==='en'){mult*=2;RX.ctrHit=1}const x0=e.px,y0=e.py,hp0=e.hp,r=f0(e,mult,mv,dx,dy,o);if(!ents.includes(e)){RX.hits++;return r}
  if(r>0||e.hp<hp0){RX.hits++;RX.foe=e;RX.foeT=t;if(e.fl<.14)e.fl=.14;
    if(!e.boss&&!e.np){let mx=e.px-x0,my=e.py-y0;e.px=x0;e.py=y0;const m=Math.hypot(mx,my);if(m<.16){const s=.16-m;mx+=dx*s;my+=dy*s}
      RX.kb=RX.kb.filter(k=>k.e!==e);RX.kb.push({e,dx:mx,dy:my,t0:t,d:.17,done:0});
      if(CMB.cur&&CMB.cur.step===2&&!e.boss)e.cbs=Math.max(e.cbs||0,t+.32)}
    if(cineOK())rxSparks(e.px,e.py,dx,dy,CMB.cur&&CMB.cur.step===2?14:9)}
  return r}}
// dopo ogni colpo: il fermo immagine e lo strattone della visuale (solo se qualcuno è stato preso)
{const f0=cbStrike;cbStrike=function(c){RX.hits=0;RX.ctrHit=0;f0(c);if(RX.ctrHit){RX.ctr=0;flt(P,'Contrattacco!','#ffd66e');tone(520,.12,'sawtooth',.05)}if(!RX.hits||!cineOK())return;const big=c.step===2||c.mv.m>=1.4,dur=(big?.085:.05)+(c.perf?.02:0);
  if(!(TS<1&&TSt>dur))slowmo(.04,dur);const k=big?7:4;camX+=(c.dx-c.dy)*k;camY+=(c.dx+c.dy)*k*.5;if(big)shake(.09)}}
// il colpo caricato prende anche lui il suo fermo immagine
{const f0=cbHeavy;cbHeavy=function(lv){RX.hits=0;RX.ctrHit=0;f0(lv);if(RX.ctrHit){RX.ctr=0;flt(P,'Contrattacco!','#ffd66e')}if(RX.hits&&cineOK()&&!(TS<1&&TSt>.1))slowmo(.04,.1)}}
// la capriola: polvere alla partenza
{const f0=dodge;dodge=function(){const was=P.dm;f0();if(P.dm&&P.dm!==was&&P.dm.k==='d'){RX.dgT=t;RX.dgP=[P.px,P.py];if(cineOK())rxDust(P.px,P.py,6)}}}
/* ---- gli effetti ---- */
// scintille che volano dalla parte del colpo (non a caso tutt'intorno)
function rxSparks(x,y,dx,dy,n){const W=cbW(),c=W&&W.c?'rgb('+W.c+')':'#ffffff';for(let i=0;i<n;i++){const a=Math.atan2(dy,dx)+(Math.random()-.5)*1.3,v=2.2+Math.random()*3.2;
  sfx({k:'pt',x:x-dx*.15,y:y-dy*.15,z:12+Math.random()*10,vx:Math.cos(a)*v,vy:Math.sin(a)*v,vz:60+Math.random()*90,gr:260,b:0,d:.28+Math.random()*.25,c:i%3?'#ffe9a8':i%2?'#ffffff':c,s:2+Math.random()*2})}}
function rxDust(x,y,n){for(let i=0;i<n;i++){const a=Math.random()*6.283,v=.5+Math.random()*.7;sfx({k:'pt',x,y,z:2,vx:Math.cos(a)*v,vy:Math.sin(a)*v,vz:25+Math.random()*30,gr:40,b:0,d:.45+Math.random()*.3,c:i%2?'#b8a582':'#8f7f62',s:4+Math.random()*3})}}
/* ---- ogni fotogramma ---- */
{const f0=upd;upd=function(dt){f0(dt);if(!started)return;
  // la capriola appena premi Maiusc (8zzg_azione la faceva partire al rilascio): tenendolo premuto poi si corre
  if(typeof ACT!=='undefined'&&ACT.sh&&ACT.shT!==RX.sh&&actOn()&&!PM){RX.sh=ACT.shT;if(!P.dm&&!(P.dgc>0))dodge()}
  // l'affondo, un po' alla volta (si ferma contro i muri)
  const g=RX.lg;if(g){if(!CMB.cur||P.dm||P.hp<=0)RX.lg=null;else{const k=clamp((t-g.t0)/g.d,0,1),e=1-(1-k)*(1-k),s=(e-g.done)*g.L;g.done=e;
      if(!blk(P.px+g.dx*s,P.py))P.px+=g.dx*s;if(!blk(P.px,P.py+g.dy*s))P.py+=g.dy*s;if(k>=1)RX.lg=null}}
  // la spinta dei nemici, scorrevole
  for(const q of RX.kb){const e=q.e;if(!ents.includes(e)){q.done=1;continue}const k=clamp((t-q.t0)/q.d,0,1),f=1-(1-k)*(1-k),s=f-(q.done||0);q.done=f;
    const sx=q.dx*s,sy=q.dy*s;if(!blk(e.px+sx,e.py))e.px+=sx;if(!blk(e.px,e.py+sy))e.py+=sy;if(k>=1)q.done=1}
  RX.kb=RX.kb.filter(q=>q.done<1);
  // la coda della mossa: dopo il colpo, se hai già premuto parte subito la mossa dopo; se ti muovi, cammini
  const c=CMB.cur;if(c&&c.hit&&!c.auto&&!P.dm){const k=(t-c.t0)/c.d;
    if(k>=.64&&CMB.buf&&t-CMB.bufT<.6){CMB.cur=null;CMB.end=t;CMB.buf=0;const perf=CMB.bufT>=c.t0+c.d*c.mv.h-.01&&t-CMB.bufT<.22;RX.lg=null;cbDo((c.step+1)%3,{perf})}
    else if(k>=.7&&!CMB.buf&&typeof keyDir==='function'&&keyDir()){CMB.cur=null;CMB.end=t;RX.lg=null}}}}
// sempre girato verso il nemico con cui combatti (anche i colpi partono verso di lui)
function rxFoe(){const ok=e=>e&&e.k==='en'&&ents.includes(e)&&!(e.al===0&&e.hid)&&e.hp>0;
  if(typeof ACT!=='undefined'&&ok(ACT.lock)&&dist(ACT.lock,P)<12)return ACT.lock;
  for(const e of ents)if(e.k==='en'&&e.atkT>t-.06&&dist(e,P)<3.2&&ok(e)&&!(ok(RX.foe)&&t-RX.foeT<.8)){RX.foe=e;RX.foeT=t}
  if(ok(RX.foe)&&t-RX.foeT<6&&dist(RX.foe,P)<6.5)return RX.foe;
  if(P.tg&&ok(P.tg)&&dist(P.tg,P)<6)return P.tg;
  let b=null,bd=4.5;for(const e of ents)if(ok(e)&&e.al){const d=dist(e,P);if(d<bd){bd=d;b=e}}return b}
{const f0=upd;upd=function(dt){f0(dt);if(!started||PM||!cbOn()||MODE==='dim'||P.hp<=0)return;RX.face=null;
  if(P.dm&&P.dm.k==='d'&&P.dm.v>=7.5&&(P.dm.dx||P.dm.dy)){P.fc=faceOf(P.dm.dx,P.dm.dy);return}// la capriola guarda dove va (il passo indietro resta girato verso il nemico)
  if((P.dm&&P.dm.k!=='d')||(typeof ACT!=='undefined'&&ACT.run))return;
  // mentre colpisce guarda dove va il colpo (col mouse si può colpire anche altrove); poi torna a guardare il nemico
  // (ma tiene d'occhio il nemico: la mossa dopo va verso di lui)
  if(CMB.cur&&!CMB.cur.auto){P.fc=faceOf(CMB.cur.dx,CMB.cur.dy);const f=rxFoe();if(f){const dx=f.px-P.px,dy=f.py-P.py,d=Math.hypot(dx,dy);if(d>.05){RX.face=f;P.dr=[dx/d,dy/d]}}return}const e=rxFoe();if(!e)return;const dx=e.px-P.px,dy=e.py-P.py,d=Math.hypot(dx,dy);if(d<.05)return;
  RX.face=e;P.dr=[dx/d,dy/d];P.fc=faceOf(dx,dy);P.fht=0}}
/* ---- i nemici avvisano prima di colpire ---- */
// chiamata dal giro dei nemici (5_game.js) quando un nemico vicino sta per colpire l'eroe: invece di fare male subito
// prepara il colpo. true = il colpo è rimandato (o ce n'è già uno in preparazione)
function rxWind(e){if(!actOn()||MODE==='dim'||!started||e.pup)return false;if(e.wu)return true;const W=e.boss?.42:.5;
  e.wu={t0:t,t1:t+W,at:e.at,x:e.px,y:e.py};e.atkT=-9;if(typeof D3!=='undefined'&&D3.act)flt(e,'!','#ff4a3a');tone(300,.05,'triangle',.03);return true}
{const f0=upd;upd=function(dt){f0(dt);if(!started)return;
  for(const e of ents){if(e.k!=='en'||!e.wu)continue;const w=e.wu;
    if(e.cbs>t||e.hp<=0||PM){e.wu=null;if(e.cbs>t)flt(e,'Interrotto','#c9b48a');continue}
    e.px=w.x;e.py=w.y;// fermo mentre prepara il colpo
    if(t<w.t1)continue;e.wu=null;const d=dist(e,P),reach=(e.r||1)*1.05+.3,dx=P.px-e.px,dy=P.py-e.py,l=Math.hypot(dx,dy)||1;e.atkT=t;e.atkD=[dx/l,dy/l];
    // la schivata perfetta conta da dove è partita la capriola (rotolando si esce dal cerchio: è proprio quello che si vuole)
    const pd=RX.dgP?Math.hypot(RX.dgP[0]-e.px,RX.dgP[1]-e.py):99;
    if(P.hp>0&&t-(RX.dgT||-9)<.3&&pd<=reach+.2&&(P.iv>0||d>reach)){flt(P,'Schivata perfetta!','#8ce7ff');RX.ctr=t+1.6;tone(1180,.08,'triangle',.05);if(cineOK()){slowmo(.3,.5);rxDust(P.px,P.py,5)}RX.foe=e;RX.foeT=t;continue}
    if(P.hp<=0||d>reach){whoosh();continue}
    hurtP(w.at);RX.foe=e;RX.foeT=t}}}
// il cerchio rosso che si riempie sotto il nemico, e il «!» sopra (nella vista dall'alto; in 3D resta il «!»)
{const l0=lights;lights=function(){l0();try{if(!started||(typeof D3!=='undefined'&&D3.act))return;let any=0;for(const e of ents)if(e.k==='en'&&e.wu){any=1;break}if(!any)return;g.setTransform(DPR,0,0,DPR,0,0);
  for(const e of ents){if(e.k!=='en'||!e.wu)continue;const w=e.wu,k=clamp((t-w.t0)/(w.t1-w.t0),0,1),R=(e.r||1)*1.05+.3,[cx,cy]=scr(e.px,e.py,1);
    g.fillStyle=`rgba(255,60,40,${.08+.12*k})`;g.beginPath();g.ellipse(cx,cy,R*45*S,R*22.5*S,0,0,6.3);g.fill();
    g.fillStyle=`rgba(255,70,40,${.22+.3*k})`;g.beginPath();g.ellipse(cx,cy,R*45*S*k,R*22.5*S*k,0,0,6.3);g.fill();
    g.strokeStyle=`rgba(255,90,60,${.5+.5*k})`;g.lineWidth=(2+2*k)*S;g.beginPath();g.ellipse(cx,cy,R*45*S,R*22.5*S,0,0,6.3);g.stroke();
    const[hx,hy]=scr(e.px,e.py,(e.boss?70:46)+6*Math.sin(t*30)*k),fs=(18+10*k)*S;g.font=`bold ${fs}px Georgia,serif`;g.textAlign='center';g.lineWidth=4*S;g.strokeStyle='rgba(0,0,0,.75)';g.strokeText('!',hx,hy);g.fillStyle=k>.7?'#ffffff':'#ff4a3a';g.fillText('!',hx,hy)}}catch(_){}}}
// l'inglese delle scritte nuove
T88('Schivata perfetta!','Perfect dodge!');T88('Contrattacco!','Counterattack!');T88('Interrotto','Interrupted');
