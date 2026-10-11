/* ================= 7.7: SCENE DELLA STORIA — filmati con i personaggi veri del gioco =================
   Piccoli film tra un capitolo e l'altro della Modalità Storia: il giuramento del Re, un ricordo per ogni frammento
   della Corona, la forgia, la caduta di Malakar e la festa del Campione. Usano i modelli dei personaggi (con le loro
   animazioni), i boss dei dungeon, le musiche dei luoghi, inquadrature che si muovono, bande nere e sottotitoli.
   Ogni filmato si vede una volta sola durante la partita (si salta con «Salta»), e poi si rivede dal menu della storia.
   Il prologo usa gli stessi personaggi. */
const FSEEN_K='voxelia_film';
const fSeen=()=>LS.get(FSEEN_K,{})||{};
function fMark(id){const o=fSeen();if(!o[id]){o[id]=Date.now();LS.set(FSEEN_K,o)}}
// ---- attori: personaggi del gioco, boss, eroe ----
const FA={};
function fNpcE(id){return FA[id]||(FA[id]=mkNpc(id,0,0,{}))}
function fNpc(id,x,y,fc,o={}){const e=fNpcE(id);e.px=x;e.py=y;e.path=o.walk?[1]:null;e.slp=0;e.nmv=o.walk?t:-9;let L=e.m;if(!L)return;
  const pa=PA,pm=PM;if(o.talk){PA=e;PM='npc'}
  try{if(L.rg&&L.g)L=npcPose(L,e)}finally{PA=pa;PM=pm}
  fShadow(x,y,o.s||1);if(o.s&&o.s!==1)L=scl(L,o.s);if(o.a!=null&&o.a<1)g.globalAlpha=Math.max(0,o.a);drawHero(L,x,y,o.z||0,0,fc==null?0:fc);g.globalAlpha=1}
function fBoss(k,x,y,fc,o={}){const b=E[k];if(!b)return;let L=b.m;if(L.rg)L=rigPose(L,o.e||(o.e={id:3}));if(o.s&&o.s!==1)L=scl(L,o.s);fShadow(x,y,(o.s||1)*1.8);
  if(o.a!=null&&o.a<1)g.globalAlpha=Math.max(0,o.a);drawHero(L,x,y,o.z||0,o.white?1:0,fc==null?0:fc);g.globalAlpha=1}
function fHero(x,y,fc,o={}){let L=heroL(APM,1,APM.hh?2:-1,1,20,0,0);if(o.walk)L=walkLegs(L,t*10);if(o.kneel)L=L.map(q=>[q[0],q[1],q[2]-4,q[3],q[4],q[5],q[6]]);
  fShadow(x,y,1);drawHero(L,x,y,o.walk?Math.abs(Math.sin(t*9))*2:0,0,fc==null?4:fc)}
function fKid(x,y,c,fc,crown){drawHero(hum(c,SKIN,.72,[5,crown?'#d4af37':'#553']),x,y,0,0,fc)}
function fShadow(x,y,s){g.fillStyle='rgba(0,0,0,.28)';g.beginPath();g.ellipse(PX(x,y),PY(x,y,0),15*s,7*s,0,0,6.3);g.fill()}
const fLerp=(a,b,k)=>a+(b-a)*k;
// ---- scenografie fatte di blocchi ----
function fFloor(x0,y0,w,h,a,b){for(let y=y0;y<y0+h;y++)for(let x=x0;x<x0+w;x++)box(x,y,-6,1,1,6,(x+y)&1?a:b,.94+hh(x+40,y+40)*.12)}
function fWallN(x0,x1,y,ht,c){for(let x=x0;x<x1;x++)box(x,y,0,1,.5,ht,c,.96+hh(x,y)*.08)}
function fWallW(y0,y1,x,ht,c){for(let y=y0;y<y1;y++)box(x,y,0,.5,1,ht,c,.96+hh(x,y)*.08)}
function fPillar(x,y,ht,c){box(x-.35,y-.35,0,.7,.7,4,shx(c,.8));box(x-.25,y-.25,4,.5,.5,ht-8,c);box(x-.4,y-.4,ht-4,.8,.8,4,shx(c,.8))}
function fTorch(x,y,z,c){box(x-.06,y-.06,z-10,.12,.12,10,'#4a3a2a');const fl=1+Math.sin(t*12+x*3)*.15;box(x-.1,y-.1,z,.2,.2,6*fl,c||'#ffb04a',1.3);g.save();g.globalCompositeOperation='lighter';g.globalAlpha=.35;g.drawImage(glowSpr(rgbOf(c||'#ffb04a')),PX(x,y)-30,PY(x,y,z+3)-30,60,60);g.restore()}
function fThrone(x,y){box(x-.6,y-.5,0,1.2,1,6,'#6a4a2a');box(x-.6,y-.5,6,1.2,.25,26,'#8a1a2a');box(x-.6,y-.5,6,.18,1,12,'#d4af37');box(x+.42,y-.5,6,.18,1,12,'#d4af37');box(x-.65,y-.55,32,1.3,.3,4,'#d4af37')}
function fCarpet(x,y0,y1){for(let y=y0;y<y1;y++)box(x-.5,y,0,1,1,.6,'#8a1a2a',1.05)}
function fCrown(x,y,z,sp,cols,s){s=s||1;for(let i=0;i<8;i++){const a=sp+i*Math.PI/4;box(x+Math.cos(a)*.75*s-.1*s,y+Math.sin(a)*.75*s-.1*s,z,.2*s,.2*s,(i%2?6:9)*s,i%2?'#d4af37':cols[(i>>1)%cols.length],1.25)}}
const FCOL=['#7aff7a','#9fd0ff','#ffd060','#b0f0ff','#ff6a2a','#6fffe0'];
// sala del trono
function fSetTrono(sh,lt){fFloor(-6,-5,12,11,'#6a5e52','#5e5248');fWallN(-6,6,-5.5,52,'#7b7f89');fWallW(-5,6,-6.5,52,'#727680');fCarpet(0,-4,6);
  for(const x of[-4,4])for(const y of[-3,0,3])fPillar(x,y,50,'#9a9aa6');for(const x of[-3,3])box(x-.5,-5,18,1,.06,26,'#8a1a2a');box(-.4,-5,30,.8,.06,10,'#d4af37');
  fTorch(-5.6,-2,26);fTorch(-5.6,2,26);fTorch(-2,-5.2,26);fTorch(2,-5.2,26);fThrone(0,-3.9)}
// cortile del castello (anche come ricordo, con il colore seppia)
function fSetCorte(sh,lt){fFloor(-7,-6,14,13,'#5d8c43','#55823c');for(let y=-6;y<7;y++)box(-.5,y,0,1,1,.4,'#9e917c');introCastle(4,-4,sh.notte?1:0);
  for(const[x,y]of[[-5,-4],[-5,3],[5,4]]){box(x-.5,y-.5,0,1,1,12,'#6b4a2b');box(x-1.2,y-1.2,12,2.4,2.4,14,'#3f7a32');box(x-.8,y-.8,26,1.6,1.6,8,'#4a8a3a')}
  if(sh.piedi){box(-.5,-.5,0,1,1,14,'#c8c8d0');box(-.6,-.6,14,1.2,1.2,3,'#a8a8b0');fCrown(0,0,22+Math.sin(lt*2)*2,lt,FCOL,.8)}}
// città di notte, dall'alto
function fSetCitta(sh,lt){fFloor(-8,-6,16,13,'#4a5a3a','#44523a');for(let i=0;i<8;i++){const x=-7+i*2,y=-2+(i%3)*2;houseV(x,y,1.6,1.6,16+(i%3)*4,'#8a7a6a','#3a2a24',1);
  if(sh.fuoco&&i%2===0){const fl=1+Math.sin(t*12+i)*.2;box(x+.3,y+.3,20+(i%3)*4,1,1,10*fl,'#ff7a2a',1.3);box(x+.5,y+.5,24+(i%3)*4,.6,.6,10*fl,'#ffd04a',1.4)}
  else if(!sh.fuoco&&(i+Math.floor(t))%3)box(x+.6,y+1.58,8,.3,.04,4,'#ffd27a',1.5)}introCastle(6,-7,1)}
// un dungeon con i colori del suo tema
function fSetDungeon(sh,lt){const d=DG[sh.dg]||DG.tana,th=TH[d.th]||TH.cave;fFloor(-6,-5,12,11,th.a,th.b);fWallN(-6,6,-5.5,46,th.o||'#3a3440');fWallW(-5,6,-6.5,46,shx(th.o||'#3a3440',.9));
  for(const x of[-4,4])for(const y of[-2,2])fPillar(x,y,42,shx(th.o||'#3a3440',1.25));fTorch(-5.6,0,24,th.tc);fTorch(0,-5.2,24,th.tc);fTorch(3,-5.2,24,th.tc);
  box(-1,-1.5,0,2,1.2,5,shx(th.o||'#3a3440',1.3));box(-.8,-1.3,5,1.6,.8,2,th.tc,1.1)}
// il vuoto: piattaforme sospese
function fSetVuoto(sh,lt){for(let i=0;i<9;i++){const w2=Math.sin(lt*1.2+i)*4;box(-3+(i%3)*2,-3+Math.floor(i/3)*2,-6+w2,1.8,1.8,6,'#2a1a3a',.9+(i%3)*.1)}box(-1.5,-1.5,-2,3,3,2,'#3a2450');
  for(let i=0;i<14;i++){const a=lt*.4+i*.45;box(Math.cos(a)*7-.15,Math.sin(a)*7-.15,40+Math.sin(lt*2+i)*14,.3,.3,6,'#c46bff',1.3)}}
// sotto la città: l'occhio
function fSetSotto(sh,lt){g.setTransform(DPR,0,0,DPR,0,0);const op=Math.max(0,Math.min(1,lt/2.5))*(sh.chiuso?.15:.95),ex=W/2,ey=H*.55,ew=Math.min(W*.3,250),eh=ew*.36*op;
  for(let i=0;i<9;i++){g.fillStyle=`rgba(${30+i*6},${16+i*2},${12+i*2},.5)`;g.fillRect(0,H*.15+i*H*.09,W,3)}
  const rg=g.createRadialGradient(ex,ey,10,ex,ey,ew*1.6);rg.addColorStop(0,`rgba(160,20,20,${.35*op})`);rg.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=rg;g.fillRect(0,0,W,H);
  g.fillStyle='#e8d8c8';g.beginPath();g.ellipse(ex,ey,ew,Math.max(1,eh),0,0,6.3);g.fill();g.fillStyle='#8a0a0a';const px=ex+Math.sin(lt*.6)*ew*.22;g.beginPath();g.arc(px,ey,Math.max(1,eh*.85),0,6.3);g.fill();
  g.fillStyle='#000';g.beginPath();g.ellipse(px,ey,Math.max(1,eh*.18),Math.max(1,eh*.75),0,0,6.3);g.fill()}
// la mappa dei sei frammenti
function fSetMappa(sh,lt){const n=Math.min(6,Math.floor(lt/.9)+1);for(let i=0;i<n;i++){const id=SHARDS[i],a=i*Math.PI/3-Math.PI/2,x=Math.cos(a)*5,y=Math.sin(a)*5,c=TH[DG[id].th].tc,rs=eob(Math.min(1,(lt-i*.9)/.7));
    box(x-.6,y-.6,0,1.2,1.2,8*rs,'#3a3a44');box(x-.25,y-.25,8*rs,.5,.5,10*rs,c,1.35)}
  for(let i=0;i<6;i++){const a=lt*.5+i;box(Math.cos(a)*1.2-.1,Math.sin(a)*1.2-.1,20+Math.sin(lt*2+i)*6,.2,.2,4,'#c46bff',1.3)}}
const FSET={trono:fSetTrono,corte:fSetCorte,citta:fSetCitta,dungeon:fSetDungeon,vuoto:fSetVuoto,sotto:fSetSotto,mappa:fSetMappa};
const FBG={trono:['#14101a','#2a2028'],corte:['#5a8ad0','#f5d08a'],citta:['#05060f','#1a1430'],dungeon:['#05040a','#1a1218'],vuoto:['#0a0418','#2a0a3a'],sotto:['#030203','#160606'],mappa:['#05060c','#1a1430']};

/* ---- i film ---- (ogni inquadratura: d durata, set, cam [[x,y,zoom] inizio, fine], tx sottotitolo, who chi parla, a() gli attori, tint colore sopra) */
const FILMS={
  giuramento:{n:'Il giuramento',mus:'castello',L:[
    {d:7,set:'trono',cam:[[0,1,.95],[0,-1,1.25]],who:'Re Aldric',tx:'«Avvicinati, eroe. Quello che sto per dirti non lo sa nessuno, fuori da queste mura.»',
      a:(lt)=>{fNpc('re',0,-3.2,0,{talk:1});fNpc('sentinella',-2,-2.5,0);fNpc('sentinella',2,-2.5,0);fHero(0,fLerp(4.5,1.5,Math.min(1,lt/3.5)),4,{walk:lt<3.5})}},
    {d:7.5,set:'corte',piedi:1,cam:[[-1,1,1.1],[1,-1,1.25]],tint:'rgba(120,80,30,.35)',who:'Re Aldric',tx:'«Malakar e io siamo cresciuti qui, in questo cortile. Lui passava le notti sui libri del Primo Re; io imparavo a portare la Corona.»',
      a:(lt)=>{const k=(lt*.6)%2;fKid(-2+Math.sin(lt)*.6,1.5,'#7a1a2a',6,1);fKid(2-Math.sin(lt)*.6,1.5,'#2a1a4a',2,0)}},
    {d:7.5,set:'corte',notte:1,cam:[[1,1,1.2],[0,0,1.4]],tint:'rgba(20,10,50,.5)',who:'Re Aldric',tx:'«Un giorno trovò le arti proibite. Gli chiesi di smettere. Lui rise... e quella notte lasciò il castello per sempre.»',
      a:(lt)=>{fNpc('malakar_re',fLerp(.5,-3,Math.min(1,lt/6)),fLerp(.5,3.5,Math.min(1,lt/6)),faceOf(-1,1),{walk:lt<6});fNpc('re',1.8,-1.2,faceOf(-1,1),{});
        for(let i=0;i<10;i++){const a=t*1.5+i;box(fLerp(.5,-3,Math.min(1,lt/6))+Math.cos(a)*.8,fLerp(.5,3.5,Math.min(1,lt/6))+Math.sin(a)*.8,20+(t*20+i*7)%40,.12,.12,3,'#c46bff',1.4)}}},
    {d:8,set:'mappa',cam:[[0,0,.85],[0,0,1]],title:'LA MISSIONE DEL RE',who:'Re Aldric',tx:'«Sei frammenti. Sei signori a custodirli. Riportali qui, uno per uno, e Aldoria tornerà a respirare.»',a:()=>{}}]},
  forgia:{n:'La Corona di Voxel',mus:'castello',L:[
    {d:6.5,set:'trono',cam:[[0,0,1.05],[0,-2,1.45]],tx:'I sei frammenti si alzano dalle mani dell\'eroe e girano attorno al Re, sempre più veloci.',
      a:(lt)=>{fNpc('re',0,-2.8,0,{});fHero(0,1,4);const k=Math.min(1,lt/5.5);for(let i=0;i<6;i++){const a=i*Math.PI/3+lt*(1+k*3),r=2.4*(1-k)+.5;box(Math.cos(a)*r-.2,-2.8+Math.sin(a)*r-.2,40+k*10,.4,.4,8,FCOL[i],1.4)}
        if(lt>5.6){g.setTransform(DPR,0,0,DPR,0,0);g.fillStyle=`rgba(255,250,220,${Math.min(1,(lt-5.6)/.6)})`;g.fillRect(0,0,W,H)}}},
    {d:7,set:'trono',cam:[[0,-2.6,1.9],[0,-2.8,2.2]],tx:'La Corona è di nuovo intera. Il Re la posa sul capo... e per un attimo i suoi occhi si accendono di rosso.',
      a:(lt)=>{fNpc('re',0,-2.8,0,{});fCrown(0,-2.8,52,lt*.5,FCOL,.9);if(lt>3.2&&lt<4.4){g.setTransform(DPR,0,0,DPR,0,0);g.fillStyle='rgba(160,0,0,.22)';g.fillRect(0,0,W,H);introSc(fCamS.sc,fCamS.cx,fCamS.cy);
        box(-.22,-2.42,40,.12,.04,3,'#ff2a2a',1.6);box(.1,-2.42,40,.12,.04,3,'#ff2a2a',1.6)}}},
    {d:7,set:'trono',cam:[[0,0,1],[1,1,1.1]],title:'LA CORONA DI VOXEL',tx:'Nella sala si apre un varco viola: la via per la Cittadella del Vuoto, dove Malakar aspetta.',
      a:(lt)=>{fNpc('re',0,-2.8,0,{});fHero(-1,1.5,faceOf(1,-1));const k=eob(Math.min(1,lt/2));box(2.6,1.6,0,.3,.6,40*k,'#2a1a3a');box(4.1,1.6,0,.3,.6,40*k,'#2a1a3a');box(2.9,1.7,4,1.2,.4,32*k,'#c46bff',1.2+Math.sin(t*4)*.1)}}]},
  caduta:{n:'La caduta di Malakar',mus:'cittadella',L:[
    {d:6.5,set:'vuoto',cam:[[0,0,1.1],[0,0,1.35]],tx:'Il Re Lich vacilla. La sua corona d\'ossa si incrina, e il Vuoto intorno a lui trema.',
      a:(lt)=>{fBoss('lich',0,-.5,0,{e:FA.lich||(FA.lich={id:5})});fHero(0,2.5,4);if((lt*1.4)%2<.1){g.setTransform(DPR,0,0,DPR,0,0);g.fillStyle='rgba(220,200,255,.4)';g.fillRect(0,0,W,H)}}},
    {d:7,set:'vuoto',cam:[[0,-.5,1.8],[0,-.5,2.1]],who:'Malakar',tx:'«Fratello... non ero io... quello che dovevi temere...»',
      a:(lt)=>{fNpc('malakar_re',0,-.5,0,{talk:1,a:1-Math.max(0,lt-4)/3});for(let i=0;i<16;i++){const k=((lt*.5+i/16)%1);box(Math.sin(i*2.3)*.6,-.5+Math.cos(i*1.7)*.4,10+k*70,.16,.16,4,'#1a0a2a',1)}}},
    {d:6.5,set:'vuoto',cam:[[0,0,1.2],[0,0,.9]],title:'IL RE LICH È CADUTO',tx:'Di Malakar resta solo cenere viola, portata via dal vento del Vuoto. Le sue ultime parole restano a te.',
      a:(lt)=>{fHero(0,1.5,4);for(let i=0;i<30;i++){const k=((lt*.25+i/30)%1);box(Math.sin(i*2.1)*3*k,-.5+Math.cos(i*1.3)*2*k,10+k*90,.12,.12,3,'#c46bff',1.3)}}}]},
  campione:{n:'Il Campione di Aldoria',mus:'town',L:[
    {d:7,set:'corte',cam:[[-2,2,.95],[0,0,1.1]],tx:'Aldoria festeggia il suo Campione. Le campane suonano per tre giorni e tre notti.',
      a:(lt)=>{fHero(0,1,4);const V=['banditore','giardiniere','pescatore','attore','stalliere','avventore'];V.forEach((id,i)=>{const a=i/V.length*6.28+lt*.3;fNpc(id,Math.cos(a)*3.2,1+Math.sin(a)*2.4,faceOf(-Math.cos(a),-Math.sin(a)),{walk:1})});
        for(let i=0;i<40;i++){const k=((lt*.3+i*.137)%1);box(-6+(i*1.37)%12,-5+(i*2.11)%10,90-k*90,.15,.15,1,FCOL[i%6],1.3)}fNpc('re',3,-1.8,faceOf(-1,1),{})}},
    {d:7.5,set:'trono',cam:[[0,-2.6,1.6],[0,-3,2]],tint:'rgba(10,6,30,.55)',tx:'Ma quando la festa finisce, il Re resta solo nella sala del trono. E la Corona brilla di una luce che non è la sua.',
      a:(lt)=>{fNpc('re',0,-3.2,0,{});fCrown(0,-3.2,54,lt*.4,['#ff3a3a'],.9)}},
    {d:7,set:'sotto',cam:[[0,0,1],[0,0,1]],title:'FINE DEL PRIMO ATTO',tx:'Sotto la città, nel buio, qualcosa apre gli occhi. E respira.',a:()=>{}}]}};
// un film per ogni frammento: il signore del dungeon cade, e il frammento mostra un ricordo di quella notte (in ordine, man mano che li trovi)
const FRBOSS={tana:'re_goblin',cripta:'necromante',piramide:'sfinge',cristallo:'regina',fucina:'ignis',abisso:'leviatano'};
const FRMEM=[
  {set:'trono',tint:'rgba(40,10,60,.55)',tx:'Il frammento ricorda la notte della tempesta. Malakar, solo, davanti alla Corona: «Non sono io a volerla spezzare», sussurra a qualcuno che non si vede.',
    a:(lt)=>{fNpc('malakar_re',0,-1,4,{talk:1});box(-.5,-3.1,0,1,1,10,'#6a4a2a');fCrown(0,-2.6,16,lt*.6,FCOL,.7);g.save();g.globalCompositeOperation='lighter';g.globalAlpha=.25+.15*Math.sin(t*3);g.drawImage(glowSpr('255,40,40'),PX(0,-5)-90,PY(0,-5,0)-60,180,120);g.restore()}},
  {set:'sotto',tx:'Questo frammento ricorda una voce sotto le strade di Aldoria Vecchia: lenta, profonda, come un respiro di pietra.',a:()=>{}},
  {set:'corte',notte:1,tint:'rgba(10,10,40,.55)',rain:1,tx:'Due fratelli in cima alle mura, sotto la pioggia. «Se la Corona resta intera, lui si sveglierà», dice Malakar. Aldric non risponde.',
    a:(lt)=>{fNpc('malakar_re',-.7,1,faceOf(1,0),{talk:1});fNpc('re',.8,1,faceOf(-1,0),{})}},
  {set:'citta',fuoco:1,fog:1,tx:'La nebbia sale dal vecchio quartiere e le case bruciano. Dall\'alto della torre, una figura con la corona guarda. Immobile.',a:()=>{}},
  {set:'vuoto',tx:'Malakar fugge verso il Vuoto, e i frammenti gli sfuggono di mano uno dopo l\'altro, come stelle cadenti verso i luoghi più bui del regno.',
    a:(lt)=>{fNpc('malakar_re',fLerp(-2,2,Math.min(1,lt/6)),fLerp(2,-2,Math.min(1,lt/6)),faceOf(1,-1),{walk:1});for(let i=0;i<6;i++){const k=Math.max(0,Math.min(1,(lt-i*.8)/2));if(k<=0)continue;const a=i*1.05;box(Math.cos(a)*6*k-.15,Math.sin(a)*6*k-.15,30+60*Math.sin(k*Math.PI),.3,.3,6,FCOL[i],1.4)}}},
  {set:'trono',tint:'rgba(30,0,0,.5)',tx:'L\'ultimo ricordo è il più breve: la mano del Re Aldric si posa sulla Corona intera... e trema.',
    a:(lt)=>{fNpc('re',0,-1.5,0,{});fCrown(0,-.4,20,lt*.3,FCOL,.8)}}];
function frFilm(id){const n=Math.max(1,Math.min(6,(P&&P.sh?P.sh.length:1))),boss=FRBOSS[id],M=FRMEM[n-1],th=TH[(DG[id]||DG.tana).th]||TH.cave;
  return{n:'Frammento: '+(DG[id]?DG[id].n:id),mus:id,L:[
    {d:7,set:'dungeon',dg:id,cam:[[0,1,1.05],[0,-.5,1.3]],tx:(typeof DLORE!=='undefined'&&DLORE[id])||'Il signore del dungeon è caduto.',
      a:(lt)=>{const k=Math.min(1,lt/4);fBoss(boss,0,-2.2,0,{a:1-k,white:lt>3&&lt<3.3,s:.9});fHero(0,2.4,4);const z=10+eob(Math.min(1,lt/3))*30;box(-.15,-.65,z,.3,.3,10,th.tc,1.5);
        g.save();g.globalCompositeOperation='lighter';g.globalAlpha=.5;g.drawImage(glowSpr(rgbOf(th.tc)),PX(0,-.5)-50,PY(0,-.5,z+5)-50,100,100);g.restore()}},
    Object.assign({d:8,cam:[[0,0,1.15],[0,0,1.35]],title:'IL RICORDO DEL FRAMMENTO · '+n+'/6',vis:1},M)]}}

/* ---- il proiettore ---- */
let fCamS={sc:1,cx:0,cy:0};
function filmGet(id){if(id&&id.startsWith('fr_'))return frFilm(id.slice(3));return FILMS[id]}
function filmPlay(id,cb){const F=filmGet(id);if(!F){if(cb)cb();return}fMark(id);const ing=!!started;
  if(ing){started=0;document.body.classList.remove('ig');PM=0;$('pn').style.display='none'}
  const end=()=>{if(ing){started=1;document.body.classList.add('ig');last=performance.now();music(typeof zoneMus==='function'?zoneMus():'town')}if(cb)cb()};
  playCine(F.L.map(s=>Object.assign({},s,{f:'film',tx:s.tx||''})),F.mus||'intro',end);CN.film=id;CN.F=F}
// i filmati della partita: una volta sola (se le scene della storia sono attive)
function filmOnce(id,after){if(SET.film===0||fSeen()[id]){if(after)after();return}filmPlay(id,after)}
const _cineDrawF=cineDraw;cineDraw=function(dt){if(CN&&CN.film){filmDraw(dt);return}_cineDrawF(dt)};
function filmDraw(dt){const C=CN;C.t+=dt;let s=0,a0=0;while(s<C.L.length&&C.t>a0+C.L[s].d){a0+=C.L[s].d;s++}if(s>=C.L.length){cineSkip();return}
  const S2=C.L[s],lt=C.t-a0,D=S2.d,u=ease(Math.min(1,lt/D)),T0=t;t=C.t;
  if(C.s!==s){C.s=s;const el=$('ctx');if(el&&el.animate)el.animate([{opacity:0},{opacity:1}],{duration:600})}
  try{g.setTransform(DPR,0,0,DPR,0,0);const G=FBG[S2.set]||FBG.mappa,gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,G[0]);gr.addColorStop(1,G[1]);g.fillStyle=gr;g.fillRect(0,0,W,H);
    if(S2.set==='citta'||S2.set==='vuoto'||S2.set==='mappa'||S2.notte)for(let i=0;i<60;i++){g.fillStyle=`rgba(255,255,240,${.2+.2*Math.sin(C.t*2+i)})`;g.fillRect((i*173.3+C.t*3)%W,(i*97.7)%(H*.5),1.5,1.5)}
    const c0=S2.cam[0],c1=S2.cam[1],base=Math.min(W,H)/520;fCamS={sc:base*fLerp(c0[2],c1[2],u),cx:fLerp(c0[0],c1[0],u),cy:fLerp(c0[1],c1[1],u)};introSc(fCamS.sc,fCamS.cx,fCamS.cy);
    const set=FSET[S2.set];if(set)set(S2,lt);if(S2.set!=='sotto')introSc(fCamS.sc,fCamS.cx,fCamS.cy);if(S2.a)S2.a(lt);
    g.setTransform(DPR,0,0,DPR,0,0);
    if(S2.fog||S2.set==='citta'){for(let k=0;k<5;k++){const x=((C.t*26*(k+1)+k*300)%(W*1.5))-W*.25,y=H*(.35+k*.1);g.globalAlpha=.16;g.drawImage(blobSpr('150,154,165'),x-W*.4,y-W*.4,W*.8,W*.8)}g.globalAlpha=1}
    if(S2.fuoco){g.fillStyle='rgba(255,70,20,.14)';g.fillRect(0,0,W,H)}
    if(S2.rain){g.strokeStyle='rgba(170,190,230,.35)';g.lineWidth=1;g.beginPath();for(let i=0;i<90;i++){const x=(i*97.3+C.t*90)%W,y=(i*53.1+C.t*620)%H;g.moveTo(x,y);g.lineTo(x-4,y+14)}g.stroke()}
    if(S2.tint){g.fillStyle=S2.tint;g.fillRect(0,0,W,H)}
    if(S2.vis){const v=g.createRadialGradient(W/2,H/2,H*.2,W/2,H/2,Math.max(W,H)*.7);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(30,0,40,.75)');g.fillStyle=v;g.fillRect(0,0,W,H)}
    const vg=g.createRadialGradient(W/2,H/2,H*.3,W/2,H/2,Math.max(W,H)*.75);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.5)');g.fillStyle=vg;g.fillRect(0,0,W,H);
    // bande nere che entrano all'inizio del film
    const bk=Math.min(1,C.t/1.2),bar=H*.085*ease(bk);g.fillStyle='#000';g.fillRect(0,0,W,bar);g.fillRect(0,H-bar,W,bar);
    if(S2.title&&lt>D-3.6){const a=Math.min(1,(lt-(D-3.6))/1)*Math.min(1,(D-lt)/.6);g.save();g.globalAlpha=Math.max(0,a);g.textAlign='center';g.font=`bold ${Math.round(Math.min(W,H)/17)}px Georgia,serif`;g.lineWidth=5;g.strokeStyle='#1a0a04';g.strokeText(S2.title,W/2,H*.24);g.fillStyle='#ffd88a';g.fillText(S2.title,W/2,H*.24);g.restore()}
    const fa=Math.max(0,1-lt/.6,1-(D-lt)/.6);if(fa>0){g.fillStyle=`rgba(0,0,0,${Math.min(1,fa)})`;g.fillRect(0,0,W,H)}
  }finally{t=T0}
  const n=Math.min(S2.tx.length,Math.floor(Math.max(0,lt-.6)*40)),tx=S2.tx.slice(0,n),key=s+':'+tx;if(key!==C.shown){C.shown=key;const el=$('ctx');if(el)el.innerHTML=(S2.who&&n?`<b class="fwho">${esc(S2.who)}</b>`:'')+esc(tx)}}

/* ---- il prologo: stessi personaggi, una musica per ogni scena ---- */
const IMUS={found:'castello',crown:'intro',eye:'vecchia',peace:'town',malakar:'cittadella',fog:'culto',shatter:'boss',lords:'dungeon',void:'cittadella',seal:'notte',hero:'intro'};
const _introDrawF=introDraw;introDraw=function(dt){const I=INTRO;if(!I){return}const T0=t;t=I.t+dt;let s=0,a0=0;while(s<ISC2.length&&I.t+dt>a0+ISC2[s].d){a0+=ISC2[s].d;s++}
  if(s<ISC2.length&&I.ms!==s){I.ms=s;const m=IMUS[ISC2[s].f];if(m&&TRK[m])music(m)}try{_introDrawF(dt)}finally{t=T0}};

/* ---- dove partono nella storia ---- */
const _storyF=story;story=function(s){const st0=P?P.st:-1;_storyF(s);const back=()=>{if(PA&&PA.ti)pn('txt')};
  if(s===1&&st0===0&&P.st===1)filmOnce('giuramento',back);else if(s===3&&st0===2&&P.st===3)filmOnce('forgia',back);else if(s===5&&st0===4&&P.st===5)filmOnce('campione',back)};
// frammento raccolto: prima la scena del frammento nel gioco, poi il film del ricordo
function filmShard(id){setTimeout(()=>{if(started&&MODE==='story')filmOnce('fr_'+id,()=>{if(PA&&PA.ti)pn('txt')})},2200)}
function filmFall(after){filmOnce('caduta',after)}
// rivedere le scene già viste (o tutte, in modalità sviluppatore)
const FLIST=()=>['giuramento',...SHARDS.map(s=>'fr_'+s),'forgia','caduta','campione'];
function filmMenu(){const seen=fSeen(),all=typeof DEV!=='undefined'&&DEV.on;let h=`<h3>🎬 Scene della storia</h3><p class="mu">I filmati che hai già visto giocando. Le scene dei frammenti mostrano i ricordi nell'ordine in cui trovi i frammenti.</p>
  <div class="it"><span>📜 Prologo · La storia della Corona di Voxel</span><span><button onclick="cl();filmMenuClose();playIntro()">▶ Guarda</button></span></div>`;
  for(const id of FLIST()){const F=filmGet(id),ok=all||seen[id];h+=`<div class="it"><span>${ok?'🎬 '+esc(F.n):'🔒 <span class="mu">Ancora da scoprire</span>'}</span><span>${ok?`<button onclick="filmMenuClose();filmPlay('${id}',()=>{$('menu').style.display='';music('menu')})">▶ Guarda</button>`:''}</span></div>`}
  let el=$('fmenu');if(!el){el=document.createElement('div');el.id='fmenu';document.body.appendChild(el)}el.innerHTML=`<div class="fmb">${h}<button onclick="filmMenuClose()">Chiudi</button></div>`;el.hidden=false}
function filmMenuClose(){const el=$('fmenu');if(el)el.hidden=true}

(function(){const st=document.createElement('style');st.textContent=`
#cine2 .fwho{display:block;font:bold 15px Georgia,serif;font-style:normal;color:#ffd88a;letter-spacing:1px;margin-bottom:2px;text-transform:uppercase}
#fmenu{position:fixed;inset:0;z-index:45;display:flex;align-items:center;justify-content:center;background:#000a}#fmenu[hidden]{display:none}
.fmb{width:min(520px,94vw);max-height:86vh;overflow:auto;background:var(--pn,#1b2030);color:var(--fg,#e8ecf4);border:2px solid var(--ac,#f5b942);padding:12px 18px;box-shadow:0 10px 40px #0009}
.fmb .it{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid #ffffff14}
#mstory .mfilm{display:grid;grid-template-columns:1fr 1fr;gap:10px}@media(max-width:600px){#mstory .mfilm{grid-template-columns:1fr}}
#mstory .mslore{margin:2px 0 12px;text-align:center}`;document.head.appendChild(st)})();
