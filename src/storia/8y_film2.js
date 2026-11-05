/* ================= 7.11: i filmati, scena per scena =================
   Le coordinate sono quelle vere dei luoghi del gioco: la sala del trono (in_castle), Aldoria (town), Aldoria Vecchia (vecchia),
   le prigioni (cella), la cappella (in_cappella), la stanza del culto (culto), la stanza dell'Occhio (occhio), la fucina di Borin
   (in_smith), la stiva della Vedova Nera (stiva). I ricordi hanno una patina seppia; le visioni sono scene disegnate apposta. */

/* ---- oggetti di scena ---- */
// la Corona di Voxel (7.12): una corona vera, non un cerchio di cubetti. La fascia d'oro con le cornici, le punte (alte agli
// angoli e al centro di ogni lato, con la perla; basse in mezzo), il berretto di velluto rosso con il globo e la croce, e le sei
// gemme dei frammenti incastonate sulle due facce che si vedono (tre davanti, tre a destra). È quadrata, come tutto nel mondo di
// Voxel, e non gira (sp resta per compatibilità): i pezzi sono già in ordine di disegno, da dietro in avanti.
function fCrownL(sp,cols,s=1,z0=0){const L=[],H=.5*s,t=.11*s,bh=3.4*s,G='#d4af37',G2='#a8862a',G3='#f0cc54',gem=i=>cols[i%cols.length];
  const wall=(x,y,w,d)=>L.push([x-.02*s,y-.02*s,z0,w+.04*s,d+.04*s,.8*s,G2,1.15],[x,y,z0+.8*s,w,d,bh-1.4*s,G,1.2],[x-.02*s,y-.02*s,z0+bh-.6*s,w+.04*s,d+.04*s,.6*s,G3,1.3]);
  // punta a giglio: stelo che si stringe, le due foglie, la perla in cima (le basse sono solo un piccolo dente)
  const pt=(x,y,tall)=>{if(!tall){L.push([x-.05*s,y-.05*s,z0+bh,.1*s,.1*s,1.1*s,G3,1.3]);return}
    L.push([x-.09*s,y-.09*s,z0+bh,.18*s,.18*s,1.6*s,G,1.25],[x-.15*s,y-.04*s,z0+bh+1.2*s,.3*s,.08*s,.9*s,G3,1.3],[x-.04*s,y-.15*s,z0+bh+1.2*s,.08*s,.3*s,.9*s,G3,1.3],
      [x-.055*s,y-.055*s,z0+bh+1.6*s,.11*s,.11*s,2.2*s,G,1.3],[x-.035*s,y-.035*s,z0+bh+3.8*s,.07*s,.07*s,.9*s,'#f4ead0',1.35])};
  const gy=(i,x,y,fx)=>{const c=gem(i);if(fx)L.push([x-.01*s,y-.12*s,z0+bh*.24,.04*s,.24*s,bh*.52,G3,1.3],[x+.02*s,y-.085*s,z0+bh*.3,.05*s,.17*s,bh*.4,c,1.4]);
    else L.push([x-.12*s,y-.01*s,z0+bh*.24,.24*s,.04*s,bh*.52,G3,1.3],[x-.085*s,y+.02*s,z0+bh*.3,.17*s,.05*s,bh*.4,c,1.4])};
  const a=H-t/2,cz=z0+bh*1.15;
  pt(-a,-a,1);wall(-H,-H,2*H,t);pt(-H/2,-a,0);pt(0,-a,1);pt(H/2,-a,0);wall(-H,-H+t,t,2*H-t);pt(-a,-H/2,0);pt(-a,0,1);pt(-a,H/2,0);pt(a,-a,1);pt(-a,a,1);
  L.push([-H+t,-H+t,z0,2*H-2*t,2*H-2*t,bh*1.15,'#8a1a2a',1.05],[-H*.62,-H*.62,cz,H*1.24,H*1.24,1.3*s,'#7a1424',1.05],[-H*.3,-H*.3,cz+1.3*s,H*.6,H*.6,.8*s,'#7a1424',1.05],
    [-.08*s,-.08*s,cz+2.1*s,.16*s,.16*s,1.4*s,G,1.3],[-.03*s,-.03*s,cz+3.5*s,.06*s,.06*s,2.2*s,G3,1.3],[-.1*s,-.03*s,cz+4.5*s,.2*s,.06*s,.6*s,G3,1.3]);
  wall(H-t,-H+t,t,2*H-t);for(let k=0;k<3;k++)gy(3+k,H,(-.55+.55*k)*H,1);pt(a,-H/2,0);pt(a,0,1);pt(a,H/2,0);
  wall(-H,H-t,2*H-t,t);for(let k=0;k<3;k++)gy(k,(-.55+.55*k)*H,H,0);pt(-H/2,a,0);pt(0,a,1);pt(H/2,a,0);pt(a,a,1);
  return L}
// il cancello del vecchio quartiere murato mattone dopo mattone: il muro sale mentre il muratore lavora
// (le coordinate sono relative all'attore, che sta all'estremità sud del muro perché sia disegnato dopo il cancello)
function fWallUp(lt){const L=[],rows=1.5+6.5*fSmooth(lt/7.6),C=['#a8503a','#9a4632','#b05a42','#8e4030'],y0=-3,len=2.8,bl=.56;
  for(let r=0;r<Math.ceil(rows);r++){const part=Math.min(1,rows-r),off=r%2?bl/2:0,n=Math.ceil((len+off)/bl);let k=0;
    for(let i=0;i<n;i++){const a=Math.max(0,i*bl-off),b=Math.min(len,(i+1)*bl-off);if(b-a<.05)continue;if(k++>=Math.floor(part*n+.001)&&part<1)break;
      L.push([-.2,y0+a+.015,r*3.2,.4,b-a-.03,3.05,C[(r*3+i)%4]])}}
  return L}
function fBrickPile(){return[[-.3,-.25,0,.32,.5,2.2,'#a8503a'],[-.28,-.23,2.2,.28,.46,2.2,'#9a4632'],[.06,-.2,0,.3,.42,2.6,'#b05a42'],[.1,.25,0,.3,.3,3,'#6a6a64'],[.12,.27,3,.26,.26,.4,'#c8c0b0']]}
// il Re senza la sua corona di tutti i giorni: nella scena in cui si posa sul capo la Corona di Voxel (nel gioco, quando la
// Corona è in pezzi, il Re porta la sua corona piccola, e quella resta)
Object.assign(NPCS,{re_capo:Object.assign({},NPCS.re)});NPS.re_capo=NPS.re.split('|').map((v,i)=>i===3?'none':v).join('|');
const RECZ=34;
// dove sta la gemma i (0-5) della corona fCrownL(sp,..,s,z0): serve per farci arrivare le gemme in volo (tre davanti, tre a destra)
const fCrownGem=(i,sp,s,z0)=>{const H=.5*s,u=(-.55+.55*(i%3))*H,z=z0+3.4*s*.5;return i<3?[u,H+.04*s,z]:[H+.04*s,u,z]};
// un frammento che brilla
const fShardL=(c,u)=>[[-.12,-.12,u,.24,.24,9,c,1.5],[-.06,-.06,u+9,.12,.12,3,'#ffffff',1.6]];
// il settimo cuore: più scuro, rosso, caldo come qualcosa di vivo
const f7L=u=>[[-.11,-.11,u,.22,.22,8,'#8a1020',1.25],[-.05,-.05,u+8,.1,.1,3,'#ffd0d0',1.5]];
function fGlow(x,y,z,rgb,r,a){g.save();g.globalCompositeOperation='lighter';g.globalAlpha=a;g.drawImage(glowSpr(rgb),PX(x,y)-r,PY(x,y,z)-r,2*r,2*r);g.restore()}
function fMotes(x,y,lt,n,c,rad,top){for(let i=0;i<n;i++){const a=lt*1.5+i*2.4,k=((lt*.4+i/n)%1);box(x+Math.cos(a)*rad*(1-k*.3)-.06,y+Math.sin(a)*rad*(1-k*.3)-.06,10+k*(top||50),.12,.12,3,c,1.4)}}
function fConfetti(lt,k){g.setTransform(DPR,0,0,DPR,0,0);for(let i=0;i<60;i++){const x=(i*97.3+lt*(40+i%5*12))%W,y=((i*53.1)+lt*(90+i%7*20))%H;g.globalAlpha=k;g.fillStyle=['#f5c342','#e0304a','#ffffff','#4aa3ff','#4cd07a'][i%5];g.fillRect(x,y,5,8)}g.globalAlpha=1}
const fFlash=(t0,d)=>lt=>lt>=t0&&lt<t0+d?(1-(lt-t0)/d)*.8:0;
const fA=(id,o)=>Object.assign({id},o);

/* ---- scene disegnate apposta ---- */
function fFloor(x0,y0,w,h,a,b){for(let y=y0;y<y0+h;y++)for(let x=x0;x<x0+w;x++)box(x,y,-6,1,1,6,(x+y)&1?a:b,.94+hh(x+40,y+40)*.12)}
// il cerchio di pietra dove Aldric il Primo forgiò la Corona
FSET.altare=(S2,lt)=>{fFloor(-5,-5,10,10,'#5a5248','#544c42');const k=fSmooth(lt/4.2);
  // un cerchio di rune intorno all'altare, che si accende mentre arrivano le gemme
  for(let i=0;i<16;i++){const a=i/16*6.283,on=fClamp(k*1.25-i/16*.2,0,1);box(Math.cos(a)*1.7-.12,Math.sin(a)*1.7-.12,-.2,.24,.24,.4,on>.5?'#ffd77a':'#6a6050',1+on*.4)}
  for(let i=0;i<12;i++){const a=i/12*6.283,x=Math.cos(a)*4.2,y=Math.sin(a)*4.2,h=10+((i*7)%4)*4;box(x-.3,y-.3,0,.6,.6,h,'#7a746a');box(x-.34,y-.34,h,.68,.68,1.2,'#8a847a');
    const on=fClamp(k*1.4-i/12*.3,0,1);if(on>.05)box(x-.08,y+.31,h*.45,.16,.02,3,FCOL[i%6],1+on*.5)}
  // l'altare: una pietra a gradini con il bordo d'oro
  box(-.75,-.65,0,1.5,1.3,3,'#3a3a42');box(-.55,-.45,3,1.1,.9,6,'#4a4a54');box(-.68,-.58,8.6,1.36,1.16,.7,'#b8963a');box(-.65,-.55,9.3,1.3,1.1,1.8,'#5a5a66');box(-.2,-.15,11.1,.4,.3,.4,'#ffd77a',1.3)};
// la mappa del regno con i sei frammenti
FSET.mappa=(S2,lt)=>{const n=6;for(let i=0;i<n;i++){const id=SHARDS[i],a=i*Math.PI/3-Math.PI/2,x=Math.cos(a)*5,y=Math.sin(a)*5,c=TH[DG[id].th].tc,k=fSmooth((lt-.3-i*.55)/.9);if(k<=0)continue;
    g.globalAlpha=k;box(x-.6,y-.6,0,1.2,1.2,8,'#3a3a44');box(x-.25,y-.25,8,.5,.5,10,c,1.35);g.globalAlpha=1;fGlow(x,y,14,rgbOf(c),40*k,.45*k)}
  for(let i=0;i<6;i++){const a=lt*.5+i;box(Math.cos(a)*1.2-.1,Math.sin(a)*1.2-.1,20+Math.sin(lt*2+i)*6,.2,.2,4,'#c46bff',1.3)}};
// il Vuoto: piattaforme sospese
FSET.vuoto=(S2,lt)=>{for(let i=0;i<9;i++){const w2=Math.sin(lt*1.2+i)*4;box(-3+(i%3)*2,-3+Math.floor(i/3)*2,-6+w2,1.8,1.8,6,'#2a1a3a',.9+(i%3)*.1)}box(-1.5,-1.5,-2,3,3,2,'#3a2450');
  for(let i=0;i<14;i++){const a=lt*.4+i*.45;box(Math.cos(a)*7-.15,Math.sin(a)*7-.15,40+Math.sin(lt*2+i)*14,.3,.3,6,'#c46bff',1.3)}};
// sotto la città: lo spaccato con l'Occhio che dorme è in 8y_film3.js (FSET.sotto)
// la Corona che va in pezzi: sei frammenti che volano lontano
FSET.schegge=(S2,lt)=>{const k=fSmooth(lt/3.8);for(let i=0;i<6;i++){const a=i*Math.PI/3+.3,r=k*9,x=Math.cos(a)*r,y=Math.sin(a)*r,z=70+Math.sin(k*Math.PI)*60;
    box(x-.25,y-.25,z,.5,.5,10,FCOL[i],1.3);for(let j=1;j<6;j++){const r2=Math.max(0,r-j*.6);box(Math.cos(a)*r2-.08,Math.sin(a)*r2-.08,z-j*3,.16,.16,4,FCOL[i],1.1)}}
  if(lt<1.2){g.save();g.globalAlpha=1-lt/1.2;for(const b of fCrownL(lt,FCOL,1.1,70))box(b[0],b[1],b[2],b[3],b[4],b[5],b[6],b[7]);g.restore()}};
// i sei signori dei frammenti: le porte dei dungeon salgono piano dalla nebbia, una dopo l'altra
FSET.signori=(S2,lt,sc,cam)=>{const n=SHARDS.length;for(let i=0;i<n;i++){const id=SHARDS[i],a=i*Math.PI/3-Math.PI/2,x=Math.cos(a)*6,y=Math.sin(a)*6,c=TH[DG[id].th].tc,k=fSmooth((lt-.2-i*1.05)/1.1);if(k<=0)continue;
    g.globalAlpha=k;const h=k;box(x-.6,y-.6,0,1.2,1.2,8,'#3a3a44');box(x-.4,y-.4,8,.2,.2,36*h,'#5a5a64');box(x+.2,y-.4,8,.2,.2,36*h,'#5a5a64');box(x-.4,y-.4,8+36*h,1,.2,6,'#5a5a64');box(x-.25,y-.35,10,.5,.1,32*h,c,1.2+Math.sin(lt*4+i)*.1);g.globalAlpha=1}
  g.setTransform(DPR,0,0,DPR,0,0);g.textAlign='center';g.font='bold 15px Georgia,serif';for(let i=0;i<n;i++){const k=fSmooth((lt-.8-i*1.05)/.8);if(k<=0)continue;const a=i*Math.PI/3-Math.PI/2,X=(PX(Math.cos(a)*6,Math.sin(a)*6)-PX(cam.x,cam.y))*sc+W/2,Y=(PY(Math.cos(a)*6,Math.sin(a)*6,0)-PY(cam.x,cam.y,0))*sc+H*.58;g.globalAlpha=k;label(DG[SHARDS[i]].n,X,Y+18,TH[DG[SHARDS[i]].th].tc)}g.globalAlpha=1};
// il mare in tempesta (le due navi e le onde)
FSET.mare=(S2,lt)=>{const rough=S2.calmo?1:S2.board?3:6;for(let i=-9;i<=11;i++)for(let j=-8;j<=12;j++){const h2=rough*Math.sin(lt*2.2+i*.8+j*.6);box(i,j,-10+h2,1,1,6,(i+j)&1?'#1f4a6a':'#1a4060',S2.calmo?1:.7)}
  const tilt=S2.calmo?0:Math.sin(lt*1.7)*2,me=S2._me||(S2._me=mkShip('sfida',-5,-3,'y')),en=S2._en||(S2._en=mkShip('pirata',3,-5,'y')),mx=S2.mex?S2.mex(lt):0;
  drawL(shipL(me),me.px+mx,me.py,tilt,false);drawL(shipL(en),en.px,en.py,-tilt,false);
  // l'equipaggio: i marinai della Sfida e i pirati della Vedova Nera, sul ponte (che sale e scende con le onde)
  const bzM=Math.sin(t*1.1+me.px*.7)*1.4+tilt+10.5,bzE=Math.sin(t*1.1+en.px*.7)*1.4-tilt+10.5,cxM=me.px+mx-me.ex/2,cxE=en.px-en.ex/2;
  const crew=S2._crew||(S2._crew=[[fA('s1',{n:'marinaio',noshadow:1,free:1}),0,-1.2,6],[fA('s2',{n:'rocco',noshadow:1,free:1}),.4,3.6,6],[fA('s3',{n:'ammiraglio',noshadow:1,free:1}),-.3,4.8,6],
    [fA('p1',{boss:'pirata',noshadow:1,free:1}),1,-1.8,2],[fA('p2',{boss:'pirata_pistola',noshadow:1,free:1}),1,1.2,2],[fA('p3',{boss:'pirata',noshadow:1,free:1}),1,3.6,2],[fA('sc',{boss:'scarlatto',noshadow:1,free:1}),1,5.4,2]]);
  for(const[a,side,dy,fc]of crew){if(S2.board&&a.id==='s1')continue;const on=side?(cxE+(a.id==='sc'?.3:0)):cxM,y=(side?en.py-en.ey/2:me.py-me.ey/2)+dy;fActDraw(a,{px:on,py:y,fc,al:1,z:side?bzE:bzM,mov:0},lt)}};

/* ---- le inquadrature ricorrenti ---- */
// la sala del trono: il Re sul trono, le guardie ai lati
const TRONO={st:'in_castle',drop:['re']};
const reSuTrono=(o)=>fA('re',Object.assign({n:'re',p:[7.5,2.6],f:'cam'},o||{}));
// i ricordi del frammento: uno per ogni frammento trovato, nell'ordine in cui li trovi
const FRBOSS={tana:'re_goblin',cripta:'necromante',piramide:'sfinge',cristallo:'regina',fucina:'ignis',abisso:'leviatano'};
const FRMEM=[
  {d:8.5,st:'in_castle',drop:['*'],night:.9,tint:'rgba(40,10,60,.38)',rain:1,flash:lt=>Math.sin(lt*1.3)>.97?.5:0,cam:[[7.5,5.5,1.5],[7.5,4,1.85]],
    tx:'Il frammento ricorda la notte della tempesta. Malakar, solo, davanti alla Corona: «Non sono io a volerla spezzare», sussurra a qualcuno che non si vede.',
    act:[fA('mal',{n:'malakar_p',go:[[7.5,8.5],[7.5,4.4]],v:.9,t0:.4,f:'N',talk:[5,8]}),fA('ped',{L:()=>[[-.4,-.4,0,.8,.8,16,'#6a4a2a'],[-.5,-.5,16,1,1,1.5,'#8a6a3a']],p:[7.5,2.6],free:1}),fA('cor',{L:lt=>fCrownL(lt*.6,FCOL,.75,17.5),p:[7.5,2.6],free:1,noshadow:1})],
    fx:lt=>fGlow(7.5,1,4,'255,40,40',90,.18+.12*Math.sin(lt*3))},
  {d:8,st:'culto',drop:['*'],night:.7,tint:lt=>`rgba(60,0,0,${.16+.1*Math.sin(lt*1.6)})`,cam:[[11,15,1.1],[11,11.5,1.45]],tx:'Questo frammento ricorda una voce sotto le strade di Aldoria Vecchia: lenta, profonda, come un respiro di pietra.',act:[],
    shake:lt=>lt>5?.3:0},
  {d:8,st:'town',night:.9,rain:1,tint:'rgba(10,10,40,.35)',cam:[[8.5,15,1.6],[8.5,14,1.9]],drop:['guardia'],
    tx:'Due fratelli davanti al castello, sotto la pioggia. «Se la Corona resta intera, lui si sveglierà», dice Malakar. Aldric non risponde.',
    act:[fA('mal',{n:'malakar_p',p:[7.6,14.6],f:'ald',talk:[1,6]}),fA('ald',{n:'aldric_y',p:[9.4,14.6],f:'mal',an:'sad'})]},
  {d:8,st:'vecchia',night:.85,fire:1,fog:1,cam:[[80,16,1.05],[75,13,1.2]],tx:'La nebbia sale dal vecchio quartiere e le case bruciano. Dal fondo della strada, una figura con la corona guarda. Immobile.',
    act:[fA('ald',{n:'aldric_y',p:[72.5,11.5],f:[1,1],in:[2.5,2]})]},
  {d:8,set:'vuoto',bg:['#0a0418','#2a0a3a'],stars:1,cam:[[-1,1,1.5],[1,-1,1.7]],tx:'Malakar fugge verso il Vuoto, e i frammenti gli sfuggono di mano uno dopo l\'altro, come stelle cadenti verso i luoghi più bui del regno.',
    act:[fA('mal',{n:'malakar_p',go:[[-2.2,2.2],[2.2,-2.2]],pf:0,v:.8,t0:.3,free:1})],
    fx:lt=>{for(let i=0;i<6;i++){const k=fClamp((lt-1-i*.8)/2,0,1);if(k<=0)continue;const a=i*1.05,x0=fLerp(-2.2,2.2,fClamp((lt-.3)/6,0,1)),y0=-x0;box(x0+Math.cos(a)*6*k-.15,y0+Math.sin(a)*6*k-.15,30+60*Math.sin(k*Math.PI),.3,.3,6,FCOL[i],1.4)}}},
  {d:8,st:'in_castle',drop:['*'],night:.9,tint:'rgba(30,0,0,.35)',cam:[[7.5,4.5,1.7],[7.5,3.6,2.1]],tx:'L\'ultimo ricordo è il più breve: la mano del Re Aldric si posa sulla Corona intera... e trema.',
    act:[fA('ald',{n:'aldric_y',p:[7.5,4.2],f:'N',talk:[2.5,8]}),fA('ped',{L:()=>[[-.4,-.4,0,.8,.8,16,'#6a4a2a'],[-.5,-.5,16,1,1,1.5,'#8a6a3a']],p:[7.5,2.9],free:1}),fA('cor',{L:lt=>fCrownL(lt*.3,FCOL,.75,17.5),p:[7.5,2.9],free:1,noshadow:1})],
    fx:lt=>fGlow(7.5,2.9,20,'255,40,40',80,.2+.2*Math.sin(lt*4))}];
function frFilm(id){const n=Math.max(1,Math.min(6,(P&&P.sh?Math.max(1,P.sh.indexOf(id)+1||P.sh.length):1))),boss=FRBOSS[id]||'re_goblin',d=DG[id]||DG.tana,th=TH[d.th]||TH.cave,M0=FRMEM[n-1];
  const st=stgBuild('dg:'+id),bp=st&&st.boss?st.boss:[0,0],hp=st&&st.heroAt?st.heroAt:[bp[0],bp[1]+3];
  return{n:'Frammento: '+d.n,mus:id,L:[
    {d:7.5,st:'dg:'+id,cam:[[bp[0],bp[1]+2.4,1.25],[bp[0],bp[1]+.6,1.55]],tx:(typeof DLORE!=='undefined'&&DLORE[id])||'Il signore del dungeon è caduto.',
      act:[fA('boss',{boss,p:[bp[0],bp[1]],f:'cam',out:[.6,3.6],white:lt=>lt>3&&lt<3.25}),fA('hero',{hero:1,p:hp,f:[bp[0]-hp[0],bp[1]-hp[1]]}),
        fA('fr',{L:lt=>fShardL(th.tc,10+fSmooth(lt/3)*30),p:[bp[0],bp[1]+.6],free:1,noshadow:1,in:[.2,1.2]})],
      fx:lt=>fGlow(bp[0],bp[1]+.6,10+fSmooth(lt/3)*30,rgbOf(th.tc),60,.5)},
    Object.assign({title:'IL RICORDO DEL FRAMMENTO · '+n+'/6',vis:1},M0)]}}

/* ---- tutti i filmati ---- */
const FILMS={
  /* il prologo: la storia della Corona, dall'inizio */
  prologo:{n:'Il Regno Perduto · prologo',mus:'castello',L:[
    {d:8,st:'town',dusk:.35,sepia:1,mus:'castello',cam:[[17.5,61,1.45],[24.5,61.4,1.6]],tx:'Mille anni fa, Aldric il Primo fondò Aldoria sulle rive del mare, dove la pietra incontra la luce.',drop:['*'],
      act:[fA('pri',{n:'aldric_primo',go:[[17.5,62.5],[27.5,62.6]],v:.85,t0:.5}),fA('m1',{n:'muratore',go:[[15.8,63.4],[25.8,63.4]],v:.85,t0:.5}),fA('m2',{n:'muratore',go:[[14.6,62.4],[24.6,62.4]],v:.85,t0:.5})]},
    {d:8,set:'altare',bg:['#1a1030','#4a2a5a'],mus:'intro',cam:[[0,0,1.3],[0,0,1.6]],tx:'Per tenere unito il regno forgiò la Corona di Voxel: sei gemme, sei terre, un solo cuore.',
      act:[fA('pri',{n:'aldric_primo',p:[0,1.6],f:'N',talk:[3,8]})],
      flash:fFlash(4.2,.7),
      // 7.12: le sei gemme volano verso la corona e si posano ognuna sulla sua punta; intanto il cerchio d'oro prende forma sopra l'altare
      fx:lt=>{const k=fSmooth(lt/4.2),sp=lt*.5,cs=1.35,zc=40+Math.sin(lt*2)*2,beam=fSmooth((lt-.6)/1.5);
        if(beam>0)for(let j=0;j<5;j++)fGlow(0,0,13+j*6,'255,220,140',22+j*3,.07*beam);
        fGlow(0,0,zc+4,'255,225,140',50+50*k,.1+.14*k+.05*Math.sin(lt*3));
        const ca=k<1?fSmooth((k-.55)/.45):1;if(ca>0){g.globalAlpha=ca;for(const b of fCrownL(sp,k<1?['#d4af37']:FCOL,cs,zc))box(b[0],b[1],b[2],b[3],b[4],b[5],b[6],b[7]);g.globalAlpha=1}
        if(k<1)for(let i=0;i<6;i++){const[gx,gy,gz]=fCrownGem(i,sp,cs,zc),a=Math.atan2(gy,gx)+(1-k)*1.6,r=fLerp(7,Math.hypot(gx,gy),k),z=fLerp(70,gz,k),q=.27+(1-k)*.12;
          g.globalAlpha=fSmooth(lt/1.2);box(Math.cos(a)*r-q/2,Math.sin(a)*r-q/2,z,q,q,q*12,FCOL[i],1.3);g.globalAlpha=1;fGlow(Math.cos(a)*r,Math.sin(a)*r,z+3,rgbOf(FCOL[i]),22,.22)}}},
    {d:10,set:'sotto',bg:['#0c1024','#04030a'],stars:1,mus:'vecchia',cam:[[-2.4,-2.4,1.2],[5.9,5.9,1.2]],ease:u=>fSmooth((u-.14)/.6),tx:'Ma sotto le strade della città qualcosa dormiva. Aldric il Primo lo chiuse nella pietra, e giurò che nessuno dei suoi eredi lo avrebbe mai svegliato.',act:[]},
    {d:8.5,st:'town',mus:'town',drop:['v2','araldo'],cam:[[35.5,43,1.05],[35.5,37,1.15]],tx:'Per secoli Aldoria prosperò. I mercati erano pieni, le campane suonavano, e i figli del re crescevano insieme.',
      act:[fA('k1',{n:'aldric_k',go:[[35.5,45.5],[35.5,39.6],[31.4,39.5],[31.4,32.5]],v:1.9,t0:.4}),fA('k2',{n:'malakar_k',go:[[36.5,46],[36.5,39.6],[40.5,39.5],[40.4,32.4]],v:1.9,t0:.6}),
        fA('c1',{n:'giardiniere',go:[[42.5,31.5],[40.5,31.5],[38.5,30.5]],v:.9,t0:1}),fA('c2',{n:'mv_fiori',go:[[31.5,32.5],[33.5,32.5]],v:.7,t0:2})]},
    {d:8,st:'town',night:.85,tint:'rgba(40,0,60,.35)',mus:'cittadella',cam:[[8.5,17,1.05],[8.5,15.5,1.25]],drop:['*'],flash:lt=>(lt*1.7)%3<.12?.55:0,
      tx:'Ma Malakar, fratello del Re Aldric, studiò le arti proibite. Così racconta il Re: bramava il potere della Corona, e divenne il Re Lich.',
      act:[fA('lich',{boss:'lich',p:[8.5,14.8],f:'cam',s:1.3,in:[.3,2.2],free:1})],fx:lt=>fMotes(8.5,14.8,lt,16,'#c46bff',2.2,90)},
    {d:8.5,st:'vecchia',night:.8,fire:1,fog:.6,mus:'culto',cam:[[84,19,1.3],[79.5,19.5,1.25]],tx:'Una notte la nebbia salì da sotto Aldoria Vecchia. Fuoco. Urla. Poi, il silenzio.',
      tint:lt=>`rgba(5,5,10,${fSmooth((lt-5)/3)*.55})`,
      act:[fA('f1',{n:'fuggiasco',go:[[89.5,20.5],[74.5,20.5]],v:1.8,t0:.3}),fA('f2',{n:'fuggiasca',go:[[90.5,21.5],[75.5,21.5]],v:1.6,t0:.8}),fA('f3',{n:'bimbo1',go:[[91.5,20.6],[76.5,20.6]],v:1.7,t0:1.4})]},
    {d:7.5,set:'schegge',bg:['#0a0612','#3a1a4a'],stars:1,mus:'boss',cam:[[0,0,1],[0,0,.9]],tx:'In quella stessa notte la Corona andò in pezzi. Sei frammenti volarono lontano, nei luoghi più oscuri del regno.',act:[]},
    {d:9,set:'signori',bg:['#05060c','#1a1430'],stars:1,mus:'dungeon',cam:[[0,0,.85],[0,0,.95]],tx:'La Tana dei Goblin, la Cripta Dimenticata, la Piramide di Khem, le Caverne di Cristallo, la Fucina Infernale, l\'Abisso Sommerso: ogni frammento è custodito da un signore terribile.',act:[]},
    {d:8,set:'vuoto',bg:['#120620','#2a0a3a'],stars:1,mus:'cittadella',cam:[[0,0,.95],[0,0,1.1]],tx:'Dalla sua Cittadella del Vuoto, Malakar attende che il regno cada nell\'ombra. E i dungeon rinascono, più forti, a ogni ciclo.',
      act:[fA('lich',{boss:'lich',p:[0,0],f:'cam',s:1.2,free:1,zf:lt=>Math.sin(lt*1.4)*3})],
      over:lt=>{const ea=.5+.5*Math.sin(lt*2);g.fillStyle=`rgba(255,40,60,${.35+ea*.4})`;g.beginPath();g.ellipse(W*.44,H*.16,26,9,0,0,6.3);g.ellipse(W*.56,H*.16,26,9,0,0,6.3);g.fill()}},
    {d:8.5,st:'town',dusk:.6,mus:'notte',cam:[[5,53,1.25],[4,52,1.45]],drop:['moreau'],tx:'Il Re fece murare il vecchio quartiere e diede la colpa al fratello. Ma ad Aldoria i segreti non dormono mai a lungo.',
      act:[fA('re',{n:'aldric_y',p:[6.5,54.5],f:[-1,-.6]}),fA('g1',{n:'ronda',go:[[7.5,50.5],[3.4,51.3]],v:1.1,t0:.4,f:[-1,0]}),fA('g2',{n:'ronda',go:[[8.5,51.5],[3.4,53.3]],v:1.1,t0:.8,f:[-1,0]}),fA('muro',{L:lt=>fWallUp(lt),p:[1.3,53.6],free:1,noshadow:1}),fA('mu',{n:'muratore',p:[3.02,52.15],f:[-1,0],an:'hammer'}),
        fA('mu2',{n:'muratore',go:[[7.5,55.5],[3.3,54.2]],v:.8,t0:.6,f:[-1,-.6]}),fA('mat',{L:()=>fBrickPile(),p:[3.6,53.7],free:1,noshadow:1})]},
    {d:9.5,st:'town',mus:'intro',drop:['v2','araldo'],cam:[[36,44,1.2],[32,37.5,1]],tx:'Il Re Aldric cerca un eroe capace di riunire la Corona. Quell\'eroe sei tu.',title:'VOXELIA',big:1,tt:3.4,
      act:[fA('hero',{hero:1,go:[[35.5,46.5],[35.5,39.7],[31.6,39.4],[31.4,35.6],[28.5,35.5]],v:1.45,t0:.3})]}]},

  /* il giuramento: il Re affida all'eroe la missione */
  giuramento:{n:'Il giuramento',mus:'castello',L:[
    Object.assign({d:8,cam:[[7.5,10,1.15],[7.5,5.5,1.45]],who:'Re Aldric',tx:'«Avvicinati, eroe. Quello che sto per dirti non lo sa nessuno, fuori da queste mura.»',
      act:[reSuTrono({talk:[1,8]}),fA('hero',{hero:1,go:[[7.5,14.4],[7.5,5.6]],v:1.5,t0:.2,f:'N'})]},TRONO),
    {d:8,st:'town',sepia:1,cam:[[8.5,15,1.45],[8.5,14,1.7]],drop:['guardia'],who:'Re Aldric',tx:'«Malakar e io siamo cresciuti qui, davanti a questo castello. Lui passava le notti sui libri del Primo Re; io imparavo a portare la Corona.»',
      act:[fA('k1',{n:'aldric_k',go:[[5.5,15.4],[10.4,15.4],[9.5,12.6],[5.6,12.6],[5.5,15.2]],v:1.7,t0:.3}),fA('k2',{n:'malakar_k',p:[10.6,13.6],f:'k1'})]},
    {d:8,st:'town',night:.9,tint:'rgba(20,10,50,.3)',cam:[[8.5,15.5,1.35],[8.5,17.5,1.2]],drop:['guardia'],who:'Re Aldric',tx:'«Un giorno trovò le arti proibite. Gli chiesi di smettere. Lui rise... e quella notte lasciò il castello per sempre.»',
      act:[fA('mal',{n:'malakar_p',go:[[8.6,12.8],[8.5,17.5],[14.5,17.5]],v:1.1,t0:.5,out:[6.3,1.4]}),fA('ald',{n:'aldric_y',p:[7.2,12.6],f:'mal'})],
      fx:(lt,AR)=>{const m=AR.mal;if(m&&m.al>.05)fMotes(m.px,m.py,lt,10,'#c46bff',.8,40)}},
    Object.assign({d:7,cam:[[7.5,5.5,1.6],[7.5,4,1.9]],who:'Re Aldric',tx:'«Quella notte la Corona andò in pezzi. Mio fratello l\'ha spezzata. Riportami i frammenti, eroe, e chiuderemo questa storia per sempre.»',
      act:[reSuTrono({talk:[.8,7]}),fA('hero',{hero:1,p:[7.5,5.6],f:'N'})]},TRONO),
    {d:8,set:'mappa',bg:['#05060c','#1a1430'],stars:1,cam:[[0,0,.85],[0,0,1]],title:'LA MISSIONE DEL RE',who:'Re Aldric',tx:'«Sei frammenti. Sei signori a custodirli. Riportali qui, uno per uno, e Aldoria tornerà a respirare.»',act:[]}]},

  /* la Corona di Voxel: il Re la ricompone */
  forgia:{n:'La Corona di Voxel',mus:'castello',L:[
    Object.assign({d:7.5,cam:[[7.5,7,1.2],[7.5,4.5,1.55]],dropPo:1,tx:'I sei frammenti si alzano dalle mani dell\'eroe e girano attorno al Re, sempre più veloci.',
      act:[fA('re',{n:'re',p:[7.5,3.4],f:'cam'}),fA('hero',{hero:1,p:[7.5,6.4],f:'N'})],
      fx:lt=>{const k=fSmooth(lt/6.2);for(let i=0;i<6;i++){const a=i*Math.PI/3+lt*(1+k*3),r=fLerp(.4,2.4,fSmooth(lt/1.5))*(1-k)+.5*k,cx=fLerp(7.5,7.5,k),cy=fLerp(6.2,3.4,fSmooth(lt/2)),al=fSmooth(lt/.9);g.globalAlpha=al;box(cx+Math.cos(a)*r-.2,cy+Math.sin(a)*r-.2,22+k*30,.4,.4,8,FCOL[i],1.4);g.globalAlpha=1}},
      flash:lt=>lt>6.4?fSmooth((lt-6.4)/.8):0},TRONO),
    Object.assign({d:7.5,cam:[[7.5,3.6,2],[7.5,3.4,2.3]],dropPo:1,tx:'La Corona è di nuovo intera. Il Re la posa sul capo... e per un attimo i suoi occhi si accendono di rosso.',
      act:[fA('re',{n:'re_capo',p:[7.5,3.4],f:'cam'}),fA('occhi',{L:()=>[[-.125,.125,24.9,.09,.03,3,'#ff2a2a',1.7],[.025,.125,24.9,.09,.03,3,'#ff2a2a',1.7]],p:[7.5,3.4],free:1,noshadow:1,al:lt=>lt>3.6&&lt<4.8?1:0}),fA('cor',{L:lt=>fCrownL(lt*.5,FCOL,.5,fLerp(70,RECZ,fSmooth((lt-.5)/2.5))),p:[7.5,3.4],free:1,noshadow:1})],
      tint:lt=>lt>3.6&&lt<4.8?'rgba(160,0,0,.22)':'rgba(0,0,0,0)',fx:lt=>{if(lt>3.6&&lt<4.8)fGlow(7.5,3.55,26,'255,40,40',40,.35)}},TRONO),
    Object.assign({d:7.5,cam:[[9.5,9,1.15],[11,10.5,1.3]],dropPo:1,title:'LA CORONA DI VOXEL',tx:'Nella sala si apre un varco viola: la via per la Cittadella del Vuoto, dove Malakar aspetta.',
      act:[fA('re',{n:'re',p:[7.5,3.4],f:[1,1]}),fA('hero',{hero:1,go:[[7.5,6.4],[10.5,10.5]],v:1.1,t0:2.5,f:[1,.6]})],
      fx:lt=>{const k=fSmooth((lt-.5)/2.2),x=14.5,y=12.5;box(x-.45,y-.1,0,.12,.2,40*k,'#2a1a3a');box(x+.33,y-.1,0,.12,.2,40*k,'#2a1a3a');g.globalAlpha=k;box(x-.33,y-.05,4,.66,.1,32*k,'#c46bff',1.2+Math.sin(t*4)*.1);g.globalAlpha=1;fGlow(x,y,20,'196,107,255',90*k,.45*k)}},TRONO)]},

  /* la caduta di Malakar, nella Cittadella */
  caduta:{n:'La caduta di Malakar',mus:'cittadella',L:[
    {d:7,st:'dg:cittadella',cam:[[0,2.4,1.5],[0,.8,1.8]],rel:1,tx:'Il Re Lich vacilla. La sua corona d\'ossa si incrina, e il Vuoto intorno a lui trema.',flash:lt=>(lt*1.4)%2<.1?.4:0,shake:lt=>lt<4?.6:0,
      act:[fA('lich',{boss:'lich',p:[0,0],f:'cam',zf:lt=>-fSmooth((lt-3)/4)*6}),fA('hero',{hero:1,p:[0,3],f:'N'})]},
    {d:7.5,st:'dg:cittadella',cam:[[0,.6,2],[0,.4,2.3]],rel:1,who:'Malakar',tx:'«Fratello... non ero io... quello che dovevi temere...»',
      act:[fA('mal',{n:'malakar_p',ghostC:'#9aa0b4',p:[0,0],f:'cam',talk:[.6,4],kneel:1,out:[4.4,2.6]})],
      fx:lt=>{for(let i=0;i<16;i++){const k=((lt*.5+i/16)%1);box(Math.sin(i*2.3)*.6,Math.cos(i*1.7)*.4,10+k*70,.16,.16,4,'#1a0a2a',1)}}},
    {d:7,st:'dg:cittadella',cam:[[0,2,1.2],[0,2,.95]],rel:1,title:'IL RE LICH È CADUTO',tx:'Di Malakar resta solo cenere viola, portata via dal vento del Vuoto. Le sue ultime parole restano a te.',
      act:[fA('hero',{hero:1,p:[0,3],f:'N'})],fx:lt=>{for(let i=0;i<30;i++){const k=((lt*.25+i/30)%1);box(Math.sin(i*2.1)*3*k,Math.cos(i*1.3)*2*k,10+k*90,.12,.12,3,'#c46bff',1.3)}}}]},

  /* il Campione di Aldoria: la festa in piazza, e il Re solo nella notte */
  campione:{n:'Il Campione di Aldoria',mus:'town',L:[
    {d:8.5,st:'town',cam:[[35.5,44,1.05],[35.5,40.6,1.25]],tx:'Aldoria festeggia il suo Campione. Le campane suonano per tre giorni e tre notti.',drop:['araldo','v2','tommaso'],
      act:[fA('hero',{hero:1,p:[35.5,39.7],f:'cam'}),fA('re',{n:'re',p:[34.3,40.4],f:'hero',talk:[1,5]}),fA('ry',{n:'ryan',p:[37.2,40.6],f:'hero',an:'drill'}),fA('st',{n:'stefano',p:[38.6,39.6],f:'hero',an:'laugh'}),
        fA('di',{n:'dino',p:[36.6,41.6],f:'hero',an:'kungfu'}),fA('gi',{n:'gilda',p:[32.8,40.4],f:'hero'}),fA('bo',{n:'borin',p:[31.6,39.2],f:'hero',an:'proud'}),fA('mi',{n:'mira',p:[34,41.6],f:'hero'}),
        fA('k1',{n:'bimbo1',go:[[34.5,46.5],[34.5,42.5],[38.5,42.4]],v:1.8,t0:1}),fA('k2',{n:'bimbo2',go:[[37.5,47],[37.5,42.6],[31.5,42.5]],v:1.6,t0:1.6})],
      over:lt=>fConfetti(lt,fSmooth(lt/1.5))},
    {d:7,st:'town',cam:[[31.5,37.5,1.7],[31,36.6,1.9]],tx:'Il Bardo Lino suona, la Fornaia Gemma regala pane a tutti, e perfino Manuel alza il boccale. Una volta sola.',drop:['araldo','v2','tommaso'],
      act:[fA('li',{n:'lino',p:[31.4,36.6],f:'cam',an:'lute'}),fA('ge',{n:'gemma',p:[31.6,38.6],f:'li'}),fA('ma',{n:'manuel',p:[30.4,37.6],f:'cam',an:'drink'}),fA('k1',{n:'bimbo2',p:[32.4,35.2],f:'li',an:'dance'}),fA('k2',{n:'tommaso',p:[30.6,35.4],f:'li',an:'dance'})],
      over:lt=>fConfetti(lt,.6)},
    Object.assign({d:7.5,night:.9,cam:[[7.5,4.5,1.6],[7.5,3.4,2]],tint:'rgba(10,6,30,.4)',tx:'Ma quando la festa finisce, il Re resta solo nella sala del trono. E la Corona brilla di una luce che non è la sua.',
      act:[reSuTrono({an:'sad'}),fA('cor',{L:lt=>fCrownL(lt*.4,['#ff3a3a'],.6,47),p:[7.5,2.6],free:1,noshadow:1})],fx:lt=>fGlow(7.5,2.6,50,'255,40,40',70,.3+.2*Math.sin(lt*2.5))},TRONO),
    {d:8,set:'sotto',apre:1,bg:['#080a16','#0c0306'],stars:1,cam:[[5.9,5.9,1.2],[5.6,5.6,1.65]],shake:lt=>lt>2.6&&lt<5.5?.18:0,title:'FINE DEL PRIMO ATTO',tx:'Sotto la città, nel buio, qualcosa apre gli occhi. E respira.',act:[]}]},

  /* il settimo cuore della Corona, nel pozzo della vecchia piazza */
  settimo:{n:'Il settimo cuore',mus:'vecchia',L:[
    {d:8,st:'vecchia',night:.8,fog:.7,cam:[[80.5,17,1.5],[80.5,15.6,1.9]],tx:'In fondo al pozzo prosciugato della vecchia piazza, avvolto in un panno nero, c\'è un frammento che nessuno ha mai visto. È caldo come qualcosa di vivo.',
      act:[fA('hero',{hero:1,go:[[80.5,18.6],[80.5,15.7]],v:1,t0:.2,f:'N',kneel:lt=>lt>3.4}),fA('cuore',{L:lt=>f7L(4+fSmooth((lt-3.5)/2.5)*20),p:[80.5,14.9],free:1,noshadow:1,in:[3.3,1]}),
        fA('panno',{L:()=>[[-.2,-.16,0,.4,.32,1.5,'#141414'],[-.12,-.12,1.5,.24,.24,1,'#1a1a1a']],p:[80.3,15.1],free:1,noshadow:1,out:[3.4,1]})],
      fx:lt=>{if(lt>3.4)fGlow(80.5,14.9,14,'255,40,50',60,.25+.15*Math.sin(lt*5))},shake:lt=>lt>5.5&&lt<6.3?.4:0}]},

  /* la verità su Aldoria Vecchia: la notte della nebbia, come andò davvero */
  verita:{n:'La notte della nebbia',mus:'notte',L:[
    {d:9,st:'in_castle',drop:['*'],sepia:1,mus:'castello',cam:[[7.5,7,1.35],[7.5,5,1.6]],tx:'Anni fa, Malakar ed Elara avvertirono il Re: sotto Aldoria Vecchia qualcosa si stava svegliando, nutrito dalla Corona intera. Aldric rise di loro.',
      act:[fA('ald',{n:'aldric_y',p:[7.5,2.6],f:'cam',an:'laugh'}),fA('mal',{n:'malakar_p',p:[6.8,5.2],f:'ald',talk:[.8,5]}),fA('ela',{n:'elara',p:[8.3,5.3],f:'ald'})]},
    {d:9,st:'vecchia',night:.9,fog:1,mus:'culto',cam:[[18,80,1.05],[14,76,1.15]],tx:'La notte della nebbia, il principe svegliò la gente del quartiere e la mandò verso la città. Poi tornò indietro, da solo.',
      act:[fA('mal',{n:'malakar_p',go:[[20.5,82.5],[17.5,79.5]],v:1.2,t0:.2,f:[-1,-1],talk:[2,5]}),fA('f1',{n:'fuggiasco',go:[[21.5,84.5],[10.5,73.5]],v:1.5,t0:.4}),fA('f2',{n:'fuggiasca',go:[[22.5,85.5],[11.5,74.5]],v:1.4,t0:.9}),
        fA('f3',{n:'bimbo2',go:[[23.5,85.5],[12.5,74.5]],v:1.5,t0:1.3}),fA('f4',{n:'viandante',go:[[24.5,86.5],[13.5,75.5]],v:1.3,t0:1.8})]},
    {d:8,st:'vecchia',night:.9,fog:1.4,fire:.7,mus:'vecchia',cam:[[78,18,1.25],[80,15,1.1]],tx:'La Regina Elara scese a cercare i bambini rimasti indietro, verso le case in fiamme. Non tornò mai più.',
      act:[fA('ela',{n:'elara',go:[[76.5,19.5],[81.5,13.5]],v:.9,t0:.3,out:[5.6,2]})]},
    {d:8.5,st:'town',night:.9,mus:'notte',cam:[[6,51,1.5],[4.6,52,1.7]],drop:['moreau'],tx:'Il Re ordinò di chiudere i cancelli, con la gente ancora dentro. Bussavano. Le guardie tennero chiuso.',flash:lt=>[3,3.4,3.8,5.5,5.9].some(x=>lt>x&&lt<x+.08)?.12:0,
      act:[fA('ald',{n:'aldric_y',p:[6.6,52.6],f:[-1,0]}),fA('g1',{n:'ronda',p:[2.6,51.3],f:[-1,0]}),fA('g2',{n:'ronda',p:[2.6,53.4],f:[-1,0]}),fA('g3',{n:'guardia',p:[4.2,52.4],f:[-1,0]})]},
    {d:9,st:'culto',drop:['*'],night:1,mus:'boss',cam:[[11,15,1.4],[11,12.5,1.75]],tint:lt=>`rgba(60,0,0,${.2+.15*Math.sin(lt*2)})`,
      tx:'Sotto le cantine, Malakar alzò la Corona e la spezzò, per chiudere la bocca dell\'Occhio. La maledizione passò su di lui.',flash:lt=>fFlash(4.5,1)(lt)*.7,shake:lt=>lt>4.4&&lt<5.6?1:0,
      act:[fA('mal',{n:'malakar_p',p:[11,12.6],f:'cam',an:'look',out:[4.8,1.6]}),fA('malg',{n:'malakar_p',ghostC:'#8a909c',p:[11,12.6],f:'cam',an:'sad',in:[4.8,1.6]}),
        fA('cor',{L:lt=>lt<4.6?fCrownL(lt*.8,FCOL,.62,48):[],p:[11,12.6],free:1,noshadow:1})],
      fx:lt=>{if(lt>4.6){const k=fSmooth((lt-4.6)/2.6);for(let i=0;i<6;i++){const a=i*Math.PI/3+.4,r=k*7;g.globalAlpha=1-k*.6;box(11+Math.cos(a)*r-.2,12.6+Math.sin(a)*r-.2,48+Math.sin(k*Math.PI)*40,.4,.4,8,FCOL[i],1.4);g.globalAlpha=1}}else fGlow(11,12.6,50,'255,220,120',60,.4)}},
    {d:9.5,st:'in_cappella',drop:['tobia'],dusk:.7,mus:'notte',cam:[[6.5,6.5,1.5],[6.5,4.6,1.8]],title:'LA VERITÀ SU ALDORIA VECCHIA',
      tx:'All\'alba, ferito e con la pelle che diventava grigia, chiese a Fratel Tobia di pregare per lui. E di non dire a nessuno che era stato lui a fermarla.',
      act:[fA('tob',{n:'tobia',p:[6.5,2.6],f:'cam',an:'pray'}),fA('mal',{n:'malakar_p',ghostC:'#8a909c',go:[[6.5,8.6],[6.5,4.2]],v:.8,t0:.3,f:'N',kneel:0})]}]},

  /* l'arresto: il settimo cuore mostrato al Re */
  arresto:{n:'Il frammento falso',mus:'dungeon',L:[
    Object.assign({d:7,cam:[[7.5,6.5,1.5],[7.5,4.8,1.8]],who:'Re Aldric',tx:'Il Re rigira il frammento tra le dita. «Un settimo frammento? La Corona ne ha sei. È un falso.»',
      act:[reSuTrono({talk:[2.2,7]}),fA('hero',{hero:1,p:[7.5,5.4],f:'N'}),fA('cuore',{L:lt=>f7L(30+Math.sin(lt*2)*1.5),p:[7.85,2.95],free:1,noshadow:1})],
      fx:lt=>{fGlow(7.5,2.6,50,'255,40,40',60,.25+.15*Math.sin(lt*3))}},TRONO),
    {d:7.5,st:'in_castle',drop:['re','guardia','guardia2'],cam:[[7.5,6,1.3],[7.5,5.5,1.5]],who:'Re Aldric',tx:'«Vuoi farmi credere che la mia Corona sia incompleta, per prenderla tu. Guardie! Arrestatelo!»',
      act:[reSuTrono({talk:[.3,3.5]}),fA('hero',{hero:1,p:[7.5,5.4],f:'N'}),fA('g1',{n:'guardia',go:[[4.5,2.5],[6.6,5.2]],v:1.6,t0:1.2,f:'hero'}),fA('g2',{n:'guardia2',go:[[11.5,2.5],[8.4,5.2]],v:1.6,t0:1.2,f:'hero'})]},
    {d:8,st:'cella',night:.9,mus:'notte',cam:[[4.5,5,1.7],[4.5,4.3,2]],tx:'Ti gettano in una cella. La notte scende sul castello. Poi, nel buio, una luce fredda.',
      act:[fA('hero',{hero:1,p:[4.5,5.3],f:'cam',kneel:1}),fA('fant',{n:'malakar_re',ghostC:'#bfe6ff',ghost:1,p:[3.2,3.4],f:'hero',in:[3.2,2.4],free:1,glow:'160,210,255'})]}]},

  /* il vero finale */
  verofinale:{n:'Il vero finale',mus:'notte',L:[
    {d:7.5,st:'occhio',cam:[[14,15,1],[14,13,1.15]],tx:'L\'Abominio crolla su sé stesso. La nebbia si ritira, e per la prima volta da anni sotto Aldoria Vecchia c\'è silenzio. Un silenzio vero.',
      flash:lt=>Math.max(0,.6-lt*.18),shake:lt=>lt<3.5?1-lt/3.5:0,act:[fA('hero',{hero:1,p:[14,19.5],f:'N'})],fx:lt=>fAboFall(lt)},
    {d:8,st:'occhio',cam:[[14,19.5,1.7],[14,19,2]],tx:'Malakar compare accanto a te. La luce fredda che lo avvolgeva si scalda. Per la prima volta da quella notte, il suo volto non è grigio.',
      act:[fA('hero',{hero:1,p:[14.8,19.6],f:'mg'}),fA('mg',{n:'malakar_re',ghostC:'#bfe6ff',ghost:1,p:[13.2,19.2],f:'hero',in:[.2,1],out:[3,2.6],free:1,glow:'160,210,255'}),fA('mv',{n:'malakar_re',p:[13.2,19.2],f:'hero',in:[3,2.6]})]},
    Object.assign({d:9,cam:[[7.5,8,1.1],[7.5,10,1.2]],mus:'castello',tx:'All\'alba la città scopre la verità. Aldric viene arrestato per aver nascosto ciò che dormiva sotto Aldoria e per la morte di centinaia di cittadini. Con lui, il Ciambellano.',
      drop:['re','ciambellano','guardia','guardia2'],
      act:[fA('ald',{n:'aldric_p',go:[[7.5,4.5],[7.5,13.5]],v:.8,t0:.6}),fA('cia',{n:'ciambellano',go:[[8.6,5],[8.6,13.8]],v:.8,t0:.9}),fA('g1',{n:'guardia',go:[[6.3,4],[6.3,13]],v:.8,t0:.5}),fA('g2',{n:'guardia2',go:[[9.8,4.5],[9.8,13.4]],v:.8,t0:.8}),
        fA('c1',{n:'sindaco',p:[3.5,8.5],f:[1,0]}),fA('c2',{n:'gemma',p:[3.5,10],f:[1,0]}),fA('c3',{n:'ryan',p:[12,8.6],f:[-1,0]}),fA('c4',{n:'tobia',p:[12,10.2],f:[-1,0]})]},{st:'in_castle'}),
    {d:8.5,st:'town',mus:'notte',dusk:.25,cam:[[6,51.5,1.5],[4.8,52.3,1.75]],drop:['moreau'],tx:'Le mura di Aldoria Vecchia vengono riaperte. Malakar lascia dei fiori davanti al cancello: per Elara, e per tutti quelli che bussavano.',
      act:[fA('mal',{n:'malakar_re',go:[[7.5,53.5],[3.5,52.5]],v:.8,t0:.3,f:[-1,0],kneel:0}),fA('fi',{L:()=>[[-.2,-.1,0,.4,.2,2,'#3a8a2a'],[-.18,-.08,2,.12,.12,1.5,'#ff8ab0'],[.02,-.06,2,.12,.12,1.5,'#ffd84a'],[-.08,.02,2.2,.12,.12,1.5,'#ffffff']],p:[2.6,52.4],free:1,noshadow:1,in:[5.2,1]}),
        fA('c1',{n:'fuggiasca',p:[7.5,50.6],f:[-1,.4],an:'sad'}),fA('c2',{n:'bimbo1',p:[8.4,51.6],f:[-1,0]})]},
    {d:8.5,st:'town',mus:'town',cam:[[35.5,44,1.15],[35.5,41.5,1.35]],drop:['araldo','v2','tommaso'],tx:'Aldoria cerca un nuovo re. Libero dalla maledizione dell\'Abominio, Malakar torna in vita, e il popolo gli posa la corona sul capo.',
      act:[fA('mal',{n:'malakar_re',p:[35.5,39.7],f:'cam'}),fA('hero',{hero:1,p:[36.9,40.5],f:'mal'}),fA('ry',{n:'ryan',p:[38.6,40.4],f:'mal',an:'drill'}),fA('st',{n:'stefano',p:[33.6,40.4],f:'mal',an:'laugh'}),fA('di',{n:'dino',p:[32.4,39.4],f:'mal'}),
        fA('gi',{n:'gilda',p:[35,41.5],f:'mal'}),fA('li',{n:'lino',p:[39.6,39.4],f:'mal',an:'lute'}),fA('bo',{n:'borin',p:[31.6,40.6],f:'mal'})],
      fx:lt=>{const k=fSmooth((lt-1)/3);if(lt>.6){g.globalAlpha=fSmooth((lt-.6)/.8);for(const b of fCrownL(lt*.5,['#d4af37'],.55,fLerp(80,47,k)))box(35.5+b[0],39.7+b[1],b[2],b[3],b[4],b[5],b[6],b[7]);g.globalAlpha=1}},over:lt=>{if(lt>4.2)fConfetti(lt,fSmooth((lt-4.2)/1))}},
    {d:8,st:'in_smith',mus:'castello',cam:[[4,5,1.7],[3.8,4.2,2.05]],drop:['borin'],tx:'Nella fucina di Borin la Corona di Voxel viene distrutta. Le sei luci si spengono una dopo l\'altra.',
      act:[fA('bo',{n:'borin',p:[3.5,4.55],f:'N',an:'hammer'}),fA('cor',{L:lt=>{const n=Math.max(0,6-Math.floor(fClamp((lt-1.5)/.7,0,6)));const cols=FCOL.map((c,i)=>i<n?c:'#5a5048');return fCrownL(0,cols,.42,11)},p:[3.5,3.5],free:1,noshadow:1})],
      fx:lt=>{if(Math.sin(lt*4.84-1)>.85)for(let i=0;i<7;i++)box(3.5+(Math.random()-.5)*.7,3.5+(Math.random()-.5)*.7,14+Math.random()*12,.06,.06,1.5,'#ffd84a',1.5);fGlow(3.5,3.5,14,'255,200,120',60,.25)}},
    {d:9.5,st:'town',dusk:.55,mus:'intro',cam:[[12,22,.95],[20,28,.8]],title:'VOXELIA',sub:'La verità sarà nei tuoi occhi',big:1,tt:4.5,tx:'Aldoria non avrà più un re invincibile. Avrà un re che sa la verità.',act:[]}]},

  /* la battaglia navale: la tempesta, l'arrembaggio, il tesoro */
  tempesta:{n:'La tempesta',mus:'naval',L:[
    {d:5.5,set:'mare',calmo:1,bg:['#5a9ad8','#cfe4f4'],cam:[[-3.5,1,1.2],[-2.6,1.4,1.3]],tx:'La Sfida lasciò il porto con il mare calmo e il vento a favore.',act:[]},
    {d:6,set:'mare',bg:['#0a1020','#1a2a3a'],rain:1,flash:lt=>Math.sin(lt*3.1)>.95?.45:0,cam:[[-1,1.5,.95],[0,1.5,1]],tx:'Poi il cielo diventò nero. Una tempesta mai vista si abbatté sulle onde.',act:[]},
    {d:6,set:'mare',bg:['#0a1020','#1a2a3a'],rain:1,mex:lt=>fSmooth(lt/5)*3.2,cam:[[0,1.5,1],[1.2,1.4,1.1]],tx:'Le onde ci trascinarono dritti verso la Vedova Nera del Capitano Scarlatto!',act:[],flash:fFlash(4.8,.5)},
    {d:3.6,set:'mare',bg:['#0a1020','#1a2a3a'],rain:1,mex:()=>3.2,cam:[[1.2,1.4,1.1],[1.2,1.4,1.18]],title:'AI CANNONI!',tt:3,tx:'Ai cannoni!',act:[],cut:1}]},
  arrembaggio:{n:'All\'arrembaggio',mus:'boarding',L:[
    {d:6.5,set:'mare',board:1,bg:['#0a1020','#1a2a3a'],rain:1,mex:()=>3.2,cam:[[1.4,1.6,1.3],[2.4,1.4,1.45]],tx:'La Vedova Nera sbanda. Rampini, cime, sciabole tra i denti: all\'arrembaggio!',
      act:[fA('hero',{hero:1,p:lt=>{const k=fSmooth((lt-1.4)/2.6);return[fLerp(-.5,4.1,k),fLerp(1.4,1.1,k)]},zf:lt=>{const k=fSmooth((lt-1.4)/2.6);return 10.5+Math.sin(k*Math.PI)*30},f:[1,0],free:1,noshadow:1})],
      fx:lt=>{const k=fSmooth((lt-1.4)/2.6),hx=fLerp(-.5,4.1,k),hy=fLerp(1.4,1.1,k),hz=10.5+Math.sin(k*Math.PI)*30+30;g.strokeStyle='#c8b890';g.lineWidth=1.5;g.beginPath();g.moveTo(PX(4.5,.9),PY(4.5,.9,78));g.lineTo(PX(hx,hy),PY(hx,hy,hz));g.stroke()}}]},
  tesoro:{n:'Il tesoro di Scarlatto',mus:'boarding',L:[
    {d:7,st:'stiva',cam:[[12,17,1.4],[12,18.5,1.65]],tx:'Il Capitano Scarlatto è a terra. Nella stiva brilla il bottino di cento saccheggi.',
      act:[fA('sca',{boss:'scarlatto',p:[15.5,15.6],lie:1}),fA('hero',{hero:1,go:[[12.5,14.5],[12.5,17.6]],v:1.1,t0:.4,f:[0,1]})],
      fx:lt=>{for(let i=0;i<16;i++){const a=i*.9+lt*2,r=((lt*.6+i*.07)%1.6);box(12+Math.cos(a)*r,20+Math.sin(a)*r*.5,6+r*14,.08,.08,2,'#fff2a0',1.4)}fGlow(12,20,8,'255,220,120',90,.3)}}]}};
// il crollo dell'Abominio nella sua stanza vera (prima del filmato il mostro sta in piedi sul fondo)
function fAboFall(lt){const k=fSmooth(lt/5.5),q=1-k,sh=lt<3?Math.sin(lt*40)*.06*(1-lt/3):0,X=BX,Y=BY;
  ABT.forEach(([r,z,h,c],i)=>{const rr=r*(1+k*.18*i);box(X-rr+sh,Y-rr,z*q,rr*2,rr*2,Math.max(1,h*q),c)});
  for(let i=0;i<8;i++){const a=i*.785+lt*.3,d=2+k*2;for(let s2=0;s2<6;s2++)box(X+Math.cos(a)*(d-s2*.25)-.2,Y+Math.sin(a)*(d-s2*.25),Math.max(0,(90-s2*12)*q),.4,.4,4,s2%2?'#4a2026':'#5a2a30')}
  if(q>.3){box(X-1.5+sh,Y+2.2,(150*q),3.1,.05,26*q,'#e8dcc8',1.1);box(X-.5+sh,Y+2.25,(152*q),1,.04,18*q,'#8a0a0a',1.2)}
  for(let i=0;i<10;i++){const kk=((lt*.3+i/10)%1);box(X+Math.sin(i*2.1)*4*kk,Y+2+Math.cos(i*1.3)*3*kk,20+kk*120,.14,.14,3,'#e8d8c8',1.2)}}
/* ---- Voxelia Dimension: la cabina blu ----
   La cabina non compare mai di colpo: si materializza pulsando, sempre più solida (e al contrario quando riparte). */
const fMat=(lt,t0,d)=>{const u=lt-t0,k=fClamp(u/d,0,1);if(k<=0)return 0;if(k>=1)return 1;return k*(1-(1-k)*.85*(.5+.5*Math.sin(u*7)))};
const fCab=o=>fA('cab',Object.assign({L:()=>cabinaL(),free:1,glow:'150,190,255'},o));
// la porta della cabina: una lama di luce che si allarga (k da 0 a 1)
const fDoor=(x,y,kf)=>fA('door',{L:lt=>{const k=kf(lt);return k>.01?[[-.3*k,.37,0,.6*k,.03,30,'#fff4c8',1.6]]:[]},p:[x,y],free:1,noshadow:1});
function fVworp(d){if(!AU.ac||!SET.sf)return;try{const t0=AU.ac.currentTime+(d||0)/1000;for(let i=0;i<3;i++){vtone(t0+i*.75,40,.6,'sawtooth',1.6,.035*SET.sf);vtone(t0+i*.75+.3,47,.42,'triangle',.62,.03*SET.sf)}}catch(_){}}
// le lucciole della foresta di notte
function fFireflies(cx,cy,lt,n,rad){for(let i=0;i<n;i++){const a=i*2.39+lt*(.15+(i%3)*.05),r=rad*(.35+((i*37)%10)/14),x=cx+Math.cos(a)*r+Math.sin(lt*.7+i)*.4,y=cy+Math.sin(a)*r*.8+Math.cos(lt*.6+i*1.3)*.4,
    z=6+((i*13)%9)+Math.sin(lt*1.3+i)*3,on=.4+.6*Math.max(0,Math.sin(lt*2.2+i*1.7));g.globalAlpha=on;box(x-.04,y-.04,z,.08,.08,1.5,'#e8ff9a',1.7);g.globalAlpha=1;if(on>.6)fGlow(x,y,z,'220,255,140',10,.25*on)}}
// le correnti del tempo: anelli che girano, stelle che corrono, la cabina che sobbalza, e le quattro epoche da rimettere in ordine
const ERAC=[['west','#e0a050'],['vit','#9ab0c8'],['riv','#6a9ae8'],['war','#b8a888']];
FSET.vortice=(S2,lt,sc,cam)=>{g.setTransform(DPR,0,0,DPR,0,0);const R=Math.max(W,H)*.8,cy=H*.52;
  for(let i=0;i<24;i++){const r=(i*R/24+lt*110)%R,a=lt*.6+i*.4;g.strokeStyle=`hsla(${(205+i*11+lt*35)%360},80%,62%,${.12+.28*(1-r/R)})`;g.lineWidth=3+2*(1-r/R);g.beginPath();g.ellipse(W/2,cy,r,r*.55,a*.08,0,6.3);g.stroke()}
  for(let i=0;i<70;i++){const a=i*2.4,k=(lt*.45+i*.137)%1,r=k*k*R*.9;g.fillStyle=`rgba(220,235,255,${.25+.6*k})`;g.fillRect(W/2+Math.cos(a)*r,cy+Math.sin(a)*r*.55,1.5+2*k,1.5+2*k)}
  fSc(sc,cam.x,cam.y);const bz=8+Math.sin(lt*2.1)*5,wob=Math.sin(lt*1.3)*.25;fGlow(wob,-wob,bz+30,'140,180,255',140,.35+.1*Math.sin(lt*3));for(const b of cabinaL())box(b[0]+wob,b[1]-wob,b[2]+bz,b[3],b[4],b[5],b[6],b[7]);
  g.setTransform(DPR,0,0,DPR,0,0);const pos=[[.17,.4],[.83,.4],[.17,.66],[.83,.66]],w=Math.min(220,W*.27),h=56;g.textAlign='center';
  for(let i=0;i<4;i++){const[k0,c]=ERAC[i],E4=typeof ERA!=='undefined'&&ERA[k0];if(!E4)continue;const k=S2.done?1-fSmooth((lt-3.4-i*.35)/1.2):fSmooth((lt-.8-i*.9)/.9);if(k<=0)continue;
    const x=W*pos[i][0],y=H*pos[i][1]+Math.sin(lt*1.5+i)*6;g.globalAlpha=k*.92;g.fillStyle='rgba(8,12,30,.8)';g.fillRect(x-w/2,y-h/2,w,h);g.strokeStyle=S2.done?'#ffd84a':c;g.lineWidth=2;g.strokeRect(x-w/2,y-h/2,w,h);
    g.fillStyle=c;g.font=`bold ${Math.round(Math.max(12,Math.min(18,W/52)))}px Georgia,serif`;g.fillText(E4.n,x,y-4);g.fillStyle='#e8ecf4';g.font=`italic ${Math.round(Math.max(10,Math.min(14,W/66)))}px Georgia,serif`;g.fillText(E4.y,x,y+16);
    if(S2.done){g.strokeStyle='#ffd84a';g.lineWidth=3;g.beginPath();g.moveTo(x-w/2+10,y-2);g.lineTo(x-w/2+16,y+5);g.lineTo(x-w/2+27,y-9);g.stroke()}}
  g.globalAlpha=1};
Object.assign(FILMS,{
  /* Voxelia Dimension: una notte nella Foresta di Elmwood arriva la cabina blu */
  dim_inizio:{n:'Voxelia Dimension · la cabina blu',mus:'dimintro',L:[
    {d:7.5,st:'forest',night:.8,cam:[[14.5,18.8,1.3],[17,18.4,1.4]],tx:'Una notte qualunque, nella Foresta di Elmwood. Nessun rumore, solo il vento tra gli alberi.',
      act:[fA('hero',{hero:1,go:[[11.5,18.5],[17.5,18.5]],v:.95,t0:.4})],fx:lt=>fFireflies(16,18,lt,14,4)},
    {d:7.5,st:'forest',night:.8,cam:[[18.6,18.4,1.4],[19.6,18,1.55]],tx:'Poi, dal nulla, un suono impossibile. E una cabina blu, apparsa in mezzo agli alberi.',sfx:()=>fVworp(900),
      act:[fA('hero',{hero:1,p:[17.5,18.5],f:'cab'}),fCab({p:[20.5,17.5],al:lt=>fMat(lt,1,4)})],shake:lt=>lt>1&&lt<5?.25:0,
      fx:lt=>{if(lt>.8)fGlow(20.5,17.5,30,'160,200,255',60+70*fSmooth((lt-.8)/2),.45*(1-fMat(lt,1,4)*.5)+.12*Math.sin(lt*7));fFireflies(17,18,lt,8,4)}},
    {d:7.5,st:'forest',night:.8,cam:[[19.4,18.7,1.55],[20.4,18.3,1.8]],tx:'La porta si aprì da sola. Una forza invisibile ci trascinò dentro.',flash:fFlash(6.6,.9),
      act:[fCab({p:[20.5,17.5]}),fDoor(20.5,17.5,lt=>fSmooth((lt-.4)/1.1)),fA('hero',{hero:1,go:[[17.5,18.5],[20.5,19.4],[20.5,18.3]],v:1.05,t0:1.6,out:[5.3,1.2]})],
      fx:lt=>{const k=fSmooth((lt-.4)/1.1);if(k<=0)return;fGlow(20.5,18.2,4,'255,240,200',90*k,.45*k);
        for(let i=0;i<24;i++){const u=(lt*.6+i/24)%1,a=i*2.4,r=3.2*(1-u);g.globalAlpha=k;box(20.5+Math.cos(a)*r-.04,18.1+Math.sin(a)*r*.7-.04,4+u*14+(i%4)*3,.08,.08,1.5,'#cfe4ff',1.5);g.globalAlpha=1}}},
    {d:8.5,st:'dim_hub',night:.35,cam:[[8.2,11.8,1.9],[8,9.3,1.02]],tx:'Dentro era immensa, più grande di quanto fosse possibile. E la cabina partì, attraverso il tempo.',flash:fFlash(7.4,1),
      act:[fA('hero',{hero:1,go:[[8.5,13.6],[8.5,10.6]],v:.85,t0:.6,in:[.2,1],f:lt=>lt<4.3?'N':lt<5.4?'W':lt<6.4?'E':'N'})],
      shake:lt=>lt>5.6?.5:0,tint:lt=>`rgba(70,110,255,${.28*fSmooth((lt-5.6)/1.6)})`,fx:lt=>fGlow(8,8,40,'120,240,255',110,.3+.12*Math.sin(lt*4))},
    {d:7.5,set:'vortice',bg:['#05061a','#120a2a'],cam:[[0,0,1.25],[0,0,1.4]],tx:'Per tornare a casa dovrai rimettere in ordine la storia, un\'epoca dopo l\'altra.',title:'VOXELIA DIMENSION',big:1,tt:3.4,act:[]}]},
  /* Voxelia Dimension: le epoche sono in ordine, la cabina riporta l'eroe a casa all'alba */
  dim_fine:{n:'Voxelia Dimension · ritorno a casa',mus:'dimend',L:[
    {d:7,set:'vortice',bg:['#05061a','#120a2a'],done:1,cam:[[0,0,1.3],[0,0,1.15]],tx:'L\'ultima epoca è in ordine. La Cabina riparte, come una nave tra le correnti del tempo.',act:[]},
    {d:8.5,st:'forest',night:.4,dusk:.55,tint:'rgba(255,160,90,.08)',cam:[[19.6,18.6,1.55],[20,19,1.45]],tx:'Atterra all\'alba, nello stesso punto della Foresta di Elmwood. La porta si apre: sei a casa.',sfx:()=>fVworp(400),
      act:[fCab({p:[20.5,17.5],al:lt=>fMat(lt,.5,3.6)}),fDoor(20.5,17.5,lt=>fSmooth((lt-4.3)/.9)),fA('hero',{hero:1,go:[[20.5,18.3],[19.5,19.6]],v:.8,t0:5.6,in:[5,.8],f:'cam'})],
      shake:lt=>lt>.5&&lt<4?.2:0},
    {d:9,st:'forest',night:.3,dusk:.5,tint:'rgba(255,160,90,.08)',cam:[[19.3,19.2,1.5],[20.6,19.5,1.3]],tt:4,sfx:()=>fVworp(1300),
      get tx(){return(typeof DCF!=='undefined'&&DCF[2].tx)||'La cabina riparte tra gli alberi, e con lei il viaggio.'},
      get title(){return typeof DIM!=='undefined'&&DIM&&DIM.end?'«'+DIM.end+'»':'Bentornato a casa'},
      act:[fCab({p:[20.5,17.5],al:lt=>1-fMat(lt,1.4,4)}),fDoor(20.5,17.5,lt=>1-fSmooth((lt-.2)/.8)),fA('hero',{hero:1,go:[[19.5,19.6],[24.5,20.6]],v:.9,t0:5.6,f:'cab'})]},
    {d:6.5,st:'forest',night:.15,dusk:.45,tint:'rgba(255,170,100,.06)',cam:[[24.3,21.6,1.25],[23.8,23.6,.95]],tx:'Fine. Grazie per aver viaggiato con Voxelia Dimension.',title:'VOXELIA DIMENSION',big:1,tt:3.6,
      act:[fA('hero',{hero:1,go:[[24.5,20.6],[24.5,22.5],[27.5,26.5]],v:.9,t0:0})],fx:lt=>fFireflies(25,23,lt,6,4)}]}});
const FLIST=()=>['giuramento',...SHARDS.map(s=>'fr_'+s),'forgia','caduta','campione','ricordo','settimo','verita','arresto','verofinale','tempesta','arrembaggio','tesoro'];

/* ---- dove partono nella storia ---- */
const _storyF=story;story=function(s){const st0=P?P.st:-1;_storyF(s);const back=()=>{if(PA&&PA.ti)pn('txt')};
  if(s===1&&st0===0&&P.st===1)filmOnce('giuramento',back);else if(s===3&&st0===2&&P.st===3)filmOnce('forgia',back);else if(s===5&&st0===4&&P.st===5)filmOnce('campione',back)};
// frammento raccolto: prima la scena del frammento nel gioco, poi il film del ricordo
function filmShard(id){setTimeout(()=>{if(started&&MODE==='story')filmOnce('fr_'+id,()=>{if(PA&&PA.ti)pn('txt')})},2200)}
function filmFall(after){filmOnce('caduta',after)}
// le cinematiche dei capitoli segreti e della battaglia navale ora sono filmati veri
const _playCine711=playCine;playCine=function(L,mus,cb){const id=typeof ARRC!=='undefined'&&L===ARRC?'arresto':typeof ENDC!=='undefined'&&L===ENDC?'verofinale':typeof STORMC!=='undefined'&&L===STORMC?'tempesta':typeof BOARDC!=='undefined'&&L===BOARDC?'arrembaggio':typeof TREASC!=='undefined'&&L===TREASC?'tesoro':typeof DCI!=='undefined'&&L===DCI?'dim_inizio':typeof DCF!=='undefined'&&L===DCF?'dim_fine':null;
  if(id&&FILMS[id]){filmPlay(id,cb);return}return _playCine711(L,mus,cb)};
// la verità su Aldoria Vecchia: quando l'ultimo pezzo va al suo posto, prima il filmato e poi il racconto nel diario
const _sf711=secretFind;secretFind=function(id){const t0=P&&P.tru;_sf711(id);if(!t0&&P&&P.tru&&SET.film!==0&&!fSeen().verita){const pa=PA;filmOnce('verita',()=>{PA=pa;pn('txt')})}};
// il settimo cuore, nel pozzo della vecchia piazza
const _sh7711=shard7;shard7=function(e){_sh7711(e);if(SET.film!==0&&!fSeen().settimo){const pa=PA;filmOnce('settimo',()=>{PA=pa;pn('txt')})}};
// il prologo è un filmato come gli altri
playIntro=function(cb){auInit();$('menu').style.display='none';filmPlay('prologo',()=>{if(cb)cb();else{$('menu').style.display='';MINT=0;music('menu')}})};
// rivedere le scene già viste (o tutte, in modalità sviluppatore)
function filmMenu(){const seen=fSeen(),all=typeof DEV!=='undefined'&&DEV.on;let h=`<h3>🎬 Scene della storia</h3><p class="mu">I filmati che hai già visto giocando. Le scene dei frammenti mostrano i ricordi nell'ordine in cui trovi i frammenti.</p>
  <div class="it"><span>📜 Prologo · La storia della Corona di Voxel</span><span><button onclick="filmMenuClose();playIntro()">▶ Guarda</button></span></div>`;
  for(const id of FLIST()){const F=filmGet(id),ok=all||seen[id];h+=`<div class="it"><span>${ok?'🎬 '+esc(F.n):'🔒 <span class="mu">Ancora da scoprire</span>'}</span><span>${ok?`<button onclick="filmMenuClose();filmPlay('${id}',()=>{$('menu').style.display='';music('menu')})">▶ Guarda</button>`:''}</span></div>`}
  let el=$('fmenu');if(!el){el=document.createElement('div');el.id='fmenu';document.body.appendChild(el)}el.innerHTML=`<div class="fmb">${h}<button onclick="filmMenuClose()">Chiudi</button></div>`;el.hidden=false}
function filmMenuClose(){const el=$('fmenu');if(el)el.hidden=true}
// compatibilità: il vecchio prologo e le vecchie scene usavano questi nomi
function fNpc(id,x,y,fc,o={}){fActDraw(fA('c_'+id,{n:id,p:[x,y],talk:o.talk?[0,1e9]:null}),{px:x,py:y,fc:fc||0,al:o.a==null?1:o.a,z:o.z||0,mov:!!o.walk},0)}
function fBoss(k,x,y,fc,o={}){fActDraw(fA('b_'+k,{boss:k,s:o.s}),{px:x,py:y,fc:fc||0,al:o.a==null?1:o.a,z:o.z||0,mov:0},0)}
(function(){const st=document.createElement('style');st.textContent=`
body:not(.ig) #ruota{display:none!important}
body.film #bnr,body.film #ztc,body.film #msg,body.film .fly{visibility:hidden!important}
#msg{z-index:6;pointer-events:none}
#cine2 .fwho{display:block;font:bold 15px Georgia,serif;font-style:normal;color:#ffd88a;letter-spacing:1px;margin-bottom:2px;text-transform:uppercase}
#fmenu{position:fixed;inset:0;z-index:45;display:flex;align-items:center;justify-content:center;background:#000a}#fmenu[hidden]{display:none}
.fmb{width:min(520px,94vw);max-height:86vh;overflow:auto;background:var(--pn,#1b2030);color:var(--fg,#e8ecf4);border:2px solid var(--ac,#f5b942);padding:12px 18px;box-shadow:0 10px 40px #0009}
.fmb .it{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid #ffffff14}
#mstory .mfilm{display:grid;grid-template-columns:1fr 1fr;gap:10px}@media(max-width:600px){#mstory .mfilm{grid-template-columns:1fr}}
#mstory .mslore{margin:2px 0 12px;text-align:center}`;document.head.appendChild(st)})();
