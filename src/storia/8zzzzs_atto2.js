/* ================= 8.6: ATTO II — LA COSTELLAZIONE PERDUTA =================
   Dopo il vero finale (l'Occhio chiuso, Re Malakar sul trono) comincia un capitolo nuovo.
   Le notti di Aldoria si allungano: qualcuno sta spegnendo le stelle. Sulle carte del cielo manca una costellazione,
   la Lanterna, che Aldric il Primo fece cancellare: tre stelle e un cuore. Lì dentro, mille anni fa, chiuse Morvath,
   l'Ultimo Custode, il cavaliere che aveva sorvegliato per lui il sigillo dell'Abominio. Ora che l'Occhio è chiuso il
   sigillo si è allentato e Morvath è tornato: vuole che la notte non finisca più, perché al buio nulla si risveglia.
   Ma il Crepuscolo rende i mostri più forti ogni giorno (è la Minaccia del Regno, vedi 8zzzzq_minaccia.js).
   I passi:
   0. Re Malakar, nel castello, racconta delle notti che si allungano (filmato);
   1. l'Astronomo Tolomeo, nell'Osservatorio, spiega la costellazione perduta;
   2. Stella, sulla cupola, apre il Portale delle Stelle;
   3. nella Valle del Crepuscolo (zona nuova) si riaccendono le tre stelle: tre dungeon nuovi, ognuno con il suo boss
      (Il Pozzo delle Stelle Spente, La Forgia dell'Eclissi, Il Giardino della Luna Capovolta);
   4. con le tre stelle si apre la Rocca di Morvath, il quarto dungeon, e in fondo c'è Morvath;
   5. si torna da Re Malakar: premi, il titolo «Portatore dell'Alba», e la Minaccia del Regno scende di un livello e mezzo.
   Dodici creature nuove, quattro boss nuovi, tre filmati. Il capitolo si segue sotto l'orologio, nel Diario e nella Cronaca. */
XSV.add('a2');
function a2Fix(){if(!P)return{s:-1,l:[0,0,0]};P.a2=P.a2||{s:0,l:[0,0,0]};const o=P.a2;o.l=Array.isArray(o.l)?o.l:[0,0,0];o.s=o.s|0;return o}
const a2On=()=>!!(th86Mode()&&(P.te|0)>=2);
const a2N=()=>a2Fix().l.filter(Boolean).length;
// i punti dell'Atto II nella Minaccia del Regno: ogni stella riaccesa la fa salire (Morvath si arrabbia), la Rocca ancora di più
function a2Pts(){if(!a2On())return 0;const o=a2Fix();return a2N()*.3+(o.s>=4?.3:0)}
/* ---- le creature ---- */
Object.assign(E,{
  lupo86:{n:'Lupo dell\'Eclissi',hp:130,at:28,xp:52,sp:3.1,r:1.1,cd:.9,ag:9},
  cavaliere86:{n:'Cavaliere del Crepuscolo',hp:150,at:25,xp:64,sp:1.8,r:1.3,cd:1.2,ag:8},
  ombra86:{n:'Ombra Cadente',hp:90,at:24,xp:48,sp:3,r:1.1,cd:1,ag:10},
  arciere86:{n:'Arciere Stellato',hp:95,at:22,xp:56,sp:1.7,r:5,cd:1.8,ag:10,rng:'#bfd0ff'},
  larva86:{n:'Larva Stellare',hp:110,at:22,xp:44,sp:1.5,r:1.1,cd:1.2,ag:7},
  golem86:{n:'Golem d\'Eclissi',hp:190,at:28,xp:72,sp:1.3,r:1.4,cd:1.6,ag:7},
  fabbro86:{n:'Fabbro d\'Ombra',hp:150,at:27,xp:62,sp:1.9,r:1.3,cd:1.2,ag:8},
  salamandra86:{n:'Salamandra Nera',hp:110,at:26,xp:58,sp:2.2,r:4,cd:1.8,ag:9,rng:'#ff8a3a'},
  falena86:{n:'Falena Lunare',hp:75,at:22,xp:46,sp:3.4,r:1,cd:.8,ag:10},
  driade86:{n:'Driade Capovolta',hp:110,at:26,xp:60,sp:1.6,r:5,cd:1.9,ag:10,rng:'#d8e4ff'},
  mantide86:{n:'Mantide Lunare',hp:130,at:28,xp:58,sp:2.3,r:1.2,cd:1,ag:9},
  vespero86:{n:'Vespero, la Stella Caduta',hp:1400,at:40,xp:1100,sp:1.6,r:4.5,cd:1.5,ag:12,boss:1,rng:'#bfd0ff',sum:'larva86'},
  colosso86:{n:'Il Colosso dell\'Eclissi',hp:1700,at:46,xp:1300,sp:1.4,r:2,cd:1.6,ag:12,boss:1,slam:1,sum:'golem86'},
  selene86:{n:'Selene, la Strega della Luna',hp:1500,at:44,xp:1400,sp:1.9,r:4.5,cd:1.5,ag:12,boss:1,rng:'#d8e4ff',sum:'falena86'},
  morvath86:{n:'Morvath, l\'Ultimo Custode',hp:2200,at:50,xp:2600,sp:1.9,r:1.8,cd:1.3,ag:14,boss:1,slam:1,sum:'ombra86'}});
{const set=(k,f)=>{try{const m=f();if(m)E[k].m=m}catch(e){console.warn('modello',k,e)}};const st=(x,y,z,c)=>['hd',x,y,z,.05,.05,.05,c];
  set('lupo86',()=>mQuad({s:1.05,c:'#3a2f5a',c2:'#2a2244',ey:'#ffd84a',ttail:'#5a4a8a',top:20}));
  set('cavaliere86',()=>mHum({s:1.15,sk:'#b8a8c8',tp:'#3a2f5a',lg:'#2a2244',ey:'#ffd84a',x:[...HT.helmet('#4a3f6a','#bfd0ff'),['bd',-.24,.12,12,.48,.03,6,'#bfd0ff'],...WP.sword('#bfd0ff'),...WP.shield('#3a2f5a','#d4af37')]}));
  set('ombra86',()=>mFloat({kind:'ghost',c:'#4a3a7a',hc:'#5a4a8a',s:1.05}));
  set('arciere86',()=>mHum({s:1,sk:'#c8b8d8',tp:'#2a3a6a',lg:'#22284a',ey:'#bfd0ff',x:[...HT.hood('#2a3a6a'),...WP.bow()]}));
  set('larva86',()=>mFloat({kind:'slime',c:'#8a9ae8',s:1}));
  set('golem86',()=>mHum({s:1.45,sk:'#3a3448',tp:'#2a2438',lg:'#221e2e',hd:'#3a3448',ey:'#ff9a3a',hunch:1,belt:0,x:[['bd',-.2,.13,16,.4,.03,3,'#ff9a3a'],['bd',-.05,.13,10,.1,.03,8,'#ff9a3a'],['hd',-.1,.13,24,.2,.02,1.5,'#ff9a3a']]}));
  set('fabbro86',()=>mHum({s:1.1,sk:'#9a8aa8',tp:'#2a2230',lg:'#1e1a24',ey:'#ff9a3a',x:[['bd',-.22,.13,6,.44,.03,12,'#5a3a2a'],...WP.hammer('#4a4458')]}));
  set('salamandra86',()=>mQuad({s:1,c:'#1e1a22',c2:'#141016',ey:'#ff8a3a',low:1,ttail:'#ff6a1a',top:16}));
  set('falena86',()=>mFloat({kind:'bat',c:'#e8e4f4',s:1.1}));
  set('driade86',()=>mHum({s:1,sk:'#b8d8c8',tp:'#5a7a6a',robe:'#4a6a5a',ey:'#d8e4ff',x:[...HT.hood('#d8e4ff'),...WP.staff('#d8e4ff')]}));
  set('mantide86',()=>mArth({s:1.05,c:'#9ac8a8',c2:'#6a9a7a',legs:4}));
  set('vespero86',()=>mFloat({kind:'elem',c:'#9ab0ff',s:2.3,x:[['bd',-.3,-.04,20,.6,.08,.08,'#ffffff'],['bd',-.04,-.3,20,.08,.6,.08,'#ffffff'],st(-.4,0,34,'#ffffff'),st(.35,.1,30,'#ffe89a')]}));
  set('colosso86',()=>mHum({s:2.05,sk:'#2e2838',tp:'#221e2c',lg:'#1a1622',hd:'#2e2838',ey:'#ff8a2a',hunch:1,belt:0,x:[['bd',-.22,.13,15,.44,.03,4,'#ff8a2a'],['bd',-.04,.13,8,.08,.03,12,'#ff8a2a'],['hd',-.12,.13,24,.24,.02,1.6,'#ff8a2a'],...HT.horns('#ff8a2a',1),...WP.hammer('#3a3448')]}));
  set('selene86',()=>mHum({s:1.35,sk:'#e8e4f4',tp:'#3a4a7a',robe:'#2a3a6a',ey:'#bfd0ff',x:[...HT.crown('#e8e4f4'),['hd',-.04,-.1,32,.08,.08,6,'#bfd0ff'],['bd',-.24,.12,14,.48,.03,4,'#e8e4f4'],...WP.staff('#e8e4f4')]}));
  set('morvath86',()=>mHum({s:1.6,sk:'#8a7a9a',tp:'#1e1a2e',lg:'#16121f',ey:'#bfd0ff',x:[...HT.helmet('#2a2440','#bfd0ff'),...HT.horns('#d8d0e8'),['bd',-.26,-.17,6,.52,.06,20,'#2a2050'],['bd',-.24,.13,15,.48,.03,4,'#bfd0ff'],['bd',-.06,.14,9,.12,.03,6,'#ffd84a'],...WP.big('#bfd0ff')]}));}
Object.assign(UQ,{vespero86:['c','Mantello della Stella Caduta',0,140],colosso86:['w','Martello dell\'Eclissi',22,0],selene86:['h','Diadema della Luna',0,120],morvath86:['w','Alba Ritrovata',28,0]});
Object.assign(BAB,{vespero86:['rain','nova','teleport','summon:larva86'],colosso86:['slam2','charge','rain','summon:golem86'],selene86:['teleport','nova','heal','summon:falena86','shield'],morvath86:['charge','nova','teleport','summon:ombra86','rain','shield']});
/* ---- i dungeon ---- */
Object.assign(TH,{stelle86:{a:'#2e3456',b:'#2a304e',o:'#1a1e36',bg:'#02030a',tc:'#bfd0ff',pool:'#3a4a9a',pt:'mote'},eclissi86:{a:'#3a2e36',b:'#342a32',o:'#221a20',bg:'#060304',tc:'#ff9a3a',pool:'#ff6a1a',pt:'ember'},
  luna86:{a:'#4a5a5a',b:'#445454',o:'#2a3a3a',bg:'#04080a',tc:'#d8e4ff',pool:'#5a8aa8',pt:'mote'},rocca86:{a:'#3a3048',b:'#342b42',o:'#201a2e',bg:'#030206',tc:'#bfd0ff',pool:'#4a3a8a',pt:'mote'}});
if(typeof DS55!=='undefined')Object.assign(DS55,{stelle86:{sh:['round','ring','octa'],ty:['stelle','ponte','rune'],c:'#bfd0ff',fl:'stars'},eclissi86:{sh:['rect','ring','cross','hall'],ty:['fucina','catene','ossidiana','altare'],c:'#ff9a3a',fl:'basalt'},
  luna86:{sh:['round','rect','ring'],ty:['giardino','vasche','statue','specchi'],c:'#d8e4ff',fl:'moss'},rocca86:{sh:['hall','octa','cross','rect'],ty:['biblioteca','sarcofagi','catene','rune','specchi'],c:'#bfd0ff',fl:'slab'}});
Object.assign(DG,{
  pozzo86:{n:'Il Pozzo delle Stelle Spente',lv:18,fls:3,en:['larva86','ombra86','arciere86'],boss:'vespero86',th:'stelle86',ent:'valle86',a2:0},
  forgia86:{n:'La Forgia dell\'Eclissi',lv:21,fls:3,en:['golem86','fabbro86','salamandra86'],boss:'colosso86',th:'eclissi86',ent:'valle86',a2:1},
  giardino86:{n:'Il Giardino della Luna Capovolta',lv:24,fls:3,en:['falena86','driade86','mantide86'],boss:'selene86',th:'luna86',ent:'valle86',a2:2},
  rocca86:{n:'La Rocca di Morvath',lv:24,fls:3,en:['cavaliere86','arciere86','ombra86'],boss:'morvath86',th:'rocca86',ent:'valle86',a2:3}});
if(typeof DGH!=='undefined')Object.assign(DGH,{pozzo86:'nella Valle del Crepuscolo, a ovest',forgia86:'nella Valle del Crepuscolo, a est',giardino86:'nella Valle del Crepuscolo, a nord-ovest',rocca86:'in fondo alla Valle del Crepuscolo'});
for(const[k,b]of[['rocca86','cittadella'],['pozzo86','cristallo'],['forgia86','fucina'],['giardino86','abisso']])if(TRK[b]&&!TRK[k])TRK[k]=TRK[b];
const A2D=['pozzo86','forgia86','giardino86'];
const A2STAR=['Vespero','Brace','Selene'];
/* ---- la Valle del Crepuscolo ---- */
const A2P={ent:[28,51],ro:[28,8],sh:[[9,33],[46,33],[11,15]],hub:[28,28]};
function genValle({R4,D,RS,EN,gate,scat,n}){const r=sd(hs('valle86'));
  scat(1,1,n-2,n-2,'⸸',.045);scat(1,1,n-2,n-2,'◘',.03);scat(1,1,n-2,n-2,'✧',.018);scat(1,1,n-2,n-2,'◊',.008);
  const clear=(x0,y0,x1,y1)=>R4(x0,y0,x1-x0+1,y1-y0+1,0);
  const road=(a,b)=>{let[x,y]=a;const step=()=>{if(x>0&&y>0&&x<n-1&&y<n-1){M[y][x]=4;DEC[y][x]='';if(M[y+1]&&M[y+1][x]===6&&r()<.5){M[y+1][x]=0;DEC[y+1][x]=''}}};step();while(x!==b[0]||y!==b[1]){if(Math.abs(b[0]-x)>Math.abs(b[1]-y))x+=Math.sign(b[0]-x);else y+=Math.sign(b[1]-y);step()}};
  const[hx,hy]=A2P.hub;clear(hx-3,hy-3,hx+3,hy+3);road(A2P.ent,[hx,hy+3]);road([hx,hy-3],[A2P.ro[0],A2P.ro[1]+4]);
  for(const s of A2P.sh){clear(s[0]-3,s[1]-3,s[0]+3,s[1]+3);road([hx,hy],[s[0],s[1]])}
  // il cuore della costellazione, in mezzo: tre fiamme, una per stella
  ents.push({k:'lan86',i:-1,px:hx+.5,py:hy+.5,n:'Il cuore della Lanterna'});
  // i tre santuari, ognuno con la porta del suo dungeon e la sua lanterna
  A2D.forEach((id,i)=>{const[x,y]=A2P.sh[i];ents.push(po(x,y-1,id+'@1',{st:'dun',n:DG[id].n}));ents.push({k:'lan86',i,px:x+2.5,py:y+.5,n:'La stella di '+A2STAR[i]});
    for(const[a,b]of[[-3,-3],[3,-3],[-3,3],[3,3]])D(x+a,y+b,'◊')});
  // la Rocca: un recinto di mura nere con la porta sbarrata finché le tre stelle non sono accese
  const[rx,ry]=A2P.ro;for(let y=ry-5;y<=ry+4;y++)for(let x=rx-7;x<=rx+7;x++){if(x<1||y<1||x>n-2||y>n-2)continue;M[y][x]=0;DEC[y][x]='';if((y===ry-5||x===rx-7||x===rx+7||y===ry+4)&&!(y===ry+4&&Math.abs(x-rx)<=1)){M[y][x]=6;DEC[y][x]='▥'}}
  for(const[a,b]of[[-7,-5],[7,-5],[-7,4],[7,4],[-2,4],[2,4]])if(M[ry+b]){M[ry+b][rx+a]=6;DEC[ry+b][rx+a]='▣'}
  const rp=po(rx,ry,'rocca86@1',{st:'dun',n:DG.rocca86.n});if(!(P.unl&&P.unl.rocca86)){rp.lock='rocca86';rp.lockMsg='La porta della Rocca è sbarrata da una notte senza stelle: riaccendi prima le tre stelle della Lanterna.'}ents.push(rp);
  // il ritorno: il Portale delle Stelle porta sulla cupola dell'Osservatorio
  const[ex,ey]=A2P.ent;clear(ex-2,ey-2,ex+2,ey+1);ents.push(po(ex,ey,'oss_cupola',{st:'void',n:'Portale delle Stelle · Aldoria'}));
  // creature, forzieri, raccolte
  const fr=[];for(let y=3;y<n-3;y++)for(let x=2;x<n-2;x++)if(M[y][x]===0&&Math.hypot(x-ex,y-ey)>10&&!A2P.sh.some(s=>Math.hypot(x-s[0],y-s[1])<4)&&Math.hypot(x-rx,y-ry)>7)fr.push([x,y]);
  for(let i=fr.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[fr[i],fr[j]]=[fr[j],fr[i]]}
  const pool=['lupo86','cavaliere86','ombra86','lupo86','ombra86'];for(let i=0;i<15&&fr.length;i++){const q=fr.pop();EN(pool[i%pool.length],q[0],q[1])}
  for(let i=0;i<4&&fr.length;i++){const q=fr.pop();ents.push({k:'ch',px:q[0]+.5,py:q[1]+.5,rich:i<2?1:0})}
  const rs=['lunare','ghiaccio','cimelio'].filter(k=>typeof RESM!=='undefined'&&typeof RESM[k]==='function');for(let i=0;i<8&&fr.length&&rs.length;i++){const q=fr.pop();RS(rs[i%rs.length],q[0],q[1])}
  const from=String(LFROM||'');for(let i=0;i<3;i++)if(from.startsWith(A2D[i])){const[x,y]=A2P.sh[i];return[x,y+1]}
  if(from.startsWith('rocca86'))return[rx,ry+2];return[ex,ey-2]}
// gli arredi della Valle: alberi morti, cristalli di stella, menhir con le rune, le mura e le torri della Rocca
const A2PR={
  '◘':(x,y)=>{const k=hh(x*3.3,y*1.9);box(x+.18+k*.2,y+.22,0,.46,.4,4+k*3,'#3a3450');box(x+.26+k*.2,y+.28,4+k*3,.3,.26,2,'#4a4468');if(k>.6)box(x+.58,y+.6,0,.2,.18,2.5,'#332c48')},
  '⸸':(x,y)=>{const k=hh(x,y),hx=.15+k*.3,c='#2a2238',c2='#3a3050';box(x+hx,y+.4,0,.14,.14,14+k*6,c);box(x+hx-.14,y+.38,10+k*3,.16,.08,2,c2);box(x+hx-.18,y+.38,12+k*3,.06,.08,5,c2);box(x+hx+.12,y+.4,14+k*4,.18,.07,2,c2);box(x+hx+.26,y+.4,16+k*4,.06,.07,5,c2);
    if(k>.55){box(x+hx-.2,y+.37,17+k*3,.07,.07,.07*0+1.5,'#9a8aff',1.4);box(x+hx+.3,y+.39,21+k*4,.06,.06,1.5,'#9a8aff',1.4)}},
  '✧':(x,y)=>{const k=hh(x*1.7,y*2.3),gl=.85+.35*Math.max(0,Math.sin(t*1.6+x+y));for(let i=0;i<3;i++){const a=i*2.1+k*6,px=x+.5+Math.cos(a)*.16,py=y+.5+Math.sin(a)*.16,hgt=6+((k*7+i*3)%7);box(px-.06,py-.06,0,.12,.12,hgt,i?'#9ab0ff':'#dfe8ff',gl)}
    box(x+.38,y+.38,0,.24,.24,1.5,'#3a3460');if(NK>.1)nlight(x+.5,y+.5,8,1.1,'160,180,255',.45);if(SET.ultra)GLOW.push([x+.5,y+.5,8,18,'170,190,255',.22])},
  '◊':(x,y)=>{box(x+.3,y+.32,0,.4,.36,4,'#2a2440');box(x+.34,y+.36,4,.32,.28,20,'#3a3450');box(x+.38,y+.39,24,.24,.22,3,'#3a3450');const on=.6+.4*Math.sin(t*1.3+x*.7+y);box(x+.42,y+.62,8,.16,.02,9,'#9ab0ff',.8+on*.7)},
  '▥':(x,y)=>{box(x,y,0,1,1,22,'#2a2440');box(x+.02,y+.02,22,.96,.96,1,'#3a3450');for(const[a,b]of[[0,0],[.6,0],[0,.6],[.6,.6]])box(x+a,y+b,23,.4,.4,5,'#2e2846');box(x+.2,y+.995,8,.6,.01,2,'#7a8ad8',1.2)},
  '▣':(x,y)=>{box(x-.05,y-.05,0,1.1,1.1,34,'#241e38');box(x-.1,y-.1,34,1.2,1.2,2,'#3a3450');for(const[a,b]of[[-.1,-.1],[.7,-.1],[-.1,.7],[.7,.7]])box(x+a,y+b,36,.4,.4,6,'#2e2846');
    const f=.7+.3*Math.sin(t*4+x);box(x+.4,y+.4,42,.2,.2,5*f,'#9ab8ff',1.7);if(NK>.1)nlight(x+.5,y+.5,46,2,'160,180,255',.8);if(SET.ultra)GLOW.push([x+.5,y+.5,46,34,'160,180,255',.35])}};
{const d0=dec;dec=function(x,y,c,h){const f=A2PR[c];if(f&&Zk&&(Zk==='valle86'||(typeof STGK!=='undefined')||true)){f(x,y,h);return}d0(x,y,c,h)}}
Z.valle86={n:'Valle del Crepuscolo',lv:18,N:56,a:'#4a4470',b:'#433e68',bg:'#2a2050',mus:'cittadella',pt:'mote',gen:genValle,rd:['#6a6088','#625a80'],wl:'#2a2240',wh:14,dist:1,nolamp:1,en:['lupo86','cavaliere86','ombra86']};
SKY.valle86=SKY.peaks||SKY.town;
// le lanterne: spente (pietra fredda) o accese (la fiamma azzurra della stella); quella in mezzo ha tre fiamme
function lan86Draw(e){const o=a2Fix(),lit=i=>!!o.l[i],x=e.px,y=e.py;
  if(e.i<0){box(x-.45,y-.45,0,.9,.9,4,'#3a3450');box(x-.3,y-.3,4,.6,.6,24,'#2a2440');box(x-.4,y-.4,28,.8,.8,3,'#4a4468');
    for(let i=0;i<3;i++){const a=i*2.094+.5,px=x+Math.cos(a)*.24,py=y+Math.sin(a)*.24,on=lit(i);box(px-.07,py-.07,31,.14,.14,on?7+Math.sin(t*6+i)*1.2:2,on?'#bfd0ff':'#4a4a5a',on?1.6:1);if(on){nlight(px,py,36,1.6,'191,208,255',.8);if(SET.ultra)GLOW.push([px,py,38,30,'191,208,255',.35])}}return}
  const on=lit(e.i);box(x-.2,y-.2,0,.4,.4,3,'#3a3450');box(x-.06,y-.06,3,.12,.12,26,'#2a2440');box(x-.22,y-.22,29,.44,.44,2,'#4a4468');box(x-.18,y-.18,31,.36,.36,8,on?'#dfe8ff':'#3a3a48',on?1.5:.9);box(x-.22,y-.22,39,.44,.44,2,'#4a4468');
  if(on){box(x-.08,y-.08,32,.16,.16,6+Math.sin(t*7)*1.2,'#9ab8ff',1.8);nlight(x,y,34,2.2,'191,208,255',.9);if(SET.ultra)GLOW.push([x,y,36,40,'191,208,255',.4])}}
{const n0=ent;ent=function(e){if(e&&e.k==='lan86'){lan86Draw(e);return}n0(e)}}
if(typeof FKEEP!=='undefined')FKEEP.add('lan86');
/* ---- i passi della storia ---- */
const A2S=['Parla con Re Malakar nel castello','Parla con l\'Astronomo Tolomeo nell\'Osservatorio (nord-est)','Sali alla cupola dell\'Osservatorio: Stella apre il Portale delle Stelle','Riaccendi le stelle della Lanterna nella Valle del Crepuscolo','Entra nella Rocca di Morvath e affrontalo','Torna da Re Malakar','Atto II completato: sei il Portatore dell\'Alba'];
function a2Obj(){const o=a2Fix();if(o.s===3)return A2S[3]+': '+a2N()+'/3';return A2S[Math.min(6,o.s)]}
const A2WHO=['malakar_re','astronomo','allieva',null,null,'malakar_re'];
{const s0=storyObj;storyObj=function(sh){if(a2On()&&a2Fix().s<6)return'Atto II · '+a2Obj();return s0(sh)}}
{const m0=npcMarks;npcMarks=function(){m0();try{if(!a2On())return;const w=A2WHO[a2Fix().s];if(w)for(const e of ents)if(e.k==='npc'&&e.nid===w)e.qm='!'}catch(_){}}}
const A2T={
  0:{ti:'Atto II · La costellazione perduta',who:'Re Malakar',tx:'Da quando l\'Occhio si è chiuso le notti si allungano. Ogni sera il sole se ne va un po\' prima, e la gente ha paura di uscire.\n\nIeri l\'Astronomo Tolomeo è venuto al castello, pallido come un lenzuolo: dice che in cielo tre stelle si sono spente, una dopo l\'altra.\n\nMio fratello mi avrebbe detto di non dare retta ai vecchi che guardano il cielo. Io ho imparato a mie spese che le storie vecchie dicono la verità. Va\' all\'Osservatorio, Campione, e ascoltalo.'},
  1:{ti:'La costellazione che non c\'è',who:'Astronomo Tolomeo',tx:'Guarda queste carte. Sono le più antiche del regno: qui, tra il Grifone e la Bilancia, c\'era una costellazione. La chiamavano la Lanterna: tre stelle e un cuore.\n\nAldric il Primo la fece cancellare da tutte le carte. Ho trovato il perché in un registro del tempio: nella Lanterna chiuse Morvath, l\'Ultimo Custode, il cavaliere che per lui sorvegliava il sigillo sotto la città.\n\nOra che l\'Occhio è chiuso il sigillo non lo tiene più. Morvath è tornato, e sta spegnendo le stelle per portare su Aldoria una notte che non finisce. E con il buio i mostri si fanno più forti ogni giorno.\n\nLa mia allieva, Stella, ha trovato il modo di aprire una porta verso la Lanterna. Sali alla cupola.'},
  2:{ti:'Il Portale delle Stelle',who:'Allieva Stella',tx:'Il maestro ti ha mandato! Guarda nel cannocchiale: la vedi quella macchia scura? È la Valle del Crepuscolo, dentro la Lanterna.\n\nHo allineato le lenti con le tre stelle spente, e la luce che manca ha aperto un varco. Il Portale delle Stelle è qui, accanto a me: ti porta nella Valle, e ti riporta indietro quando vuoi.\n\nLaggiù ci sono tre santuari, uno per stella. Riaccendile, e la porta di Morvath si aprirà. Stai attento: là dentro non sorge mai il sole del tutto.'},
  5:{ti:'L\'alba',who:'Re Malakar',tx:'Stanotte il sole è sorto all\'ora giusta. La gente è scesa in piazza a guardarlo, come una festa.\n\nMorvath credeva di proteggerci con il buio, come io credevo di proteggerli con la paura. Siamo due custodi che hanno sbagliato strada: io ho avuto la fortuna di incontrare te.\n\nPrendi questi doni. E da oggi il regno ti chiamerà il Portatore dell\'Alba.'}};
function a2Talk(){const o=a2Fix(),T=A2T[o.s];if(!T)return;const s=o.s;cl();
  const go=()=>{PA={ti:T.ti,tx:T.who+': «'+T.tx.replace(/\n\n/g,'»\n\n«')+'»'};pn('txt');
    if(s===0)o.s=1;else if(s===1)o.s=2;else if(s===2){o.s=3;a2Portal()}else if(s===5){o.s=6;a2Reward()}npcMarks();hud();save()};
  if(s===0)filmOnce('a2_inizio',go);else go()}
function a2Reward(){const lv=Math.max(26,P.lv|0);P.g+=15000;goldFly(15000);gainXP(8000);P.pot+=10;const a=item(lv,3,'w'),b=item(lv,3,'s');a.n='Lama del Portatore dell\'Alba';a.cr=Math.max(a.cr||0,18);b.n='Scudo della Lanterna';b.hp=Math.max(b.hp||0,160);
  for(const x of[a,b]){if(P.inv.length<INV)P.inv.push(x);else ents.push(dropOk({k:'dr',px:P.px,py:P.py,it:x}))}
  if(typeof titAdd==='function')titAdd('alba86','Portatore dell\'Alba');setTimeout(()=>banner('Atto II completato','15000 oro, 8000 esperienza, la Lama del Portatore dell\'Alba e lo Scudo della Lanterna','corona'),700);jingle([60,64,67,72,76,79,84],.12,'triangle')}
// il riquadro del capitolo va in cima alle risposte (dentro la finestra di dialogo, se c'è)
const a2Ins=(h,box)=>h.includes('<div class="dlgo">')?h.replace('<div class="dlgo">','<div class="dlgo">'+box):h.replace(/(<\/h3>)/,'$1'+box);
{const h0=npcHTML;npcHTML=function(e){let h=h0(e);try{if(a2On()&&e&&!e.slp){const o=a2Fix(),w=A2WHO[o.s];if(w&&e.nid===w&&A2T[o.s]){const T=A2T[o.s];
      h=a2Ins(h,`<div class="qb a2qb"><b>📜 ${esc(T.ti)}</b><p>${esc(T.tx.split('\n\n')[0])}</p><button onclick="a2Talk()">Ascolta</button></div>`)}
    else if(o.s>=3&&o.s<5&&(e.nid==='astronomo'||e.nid==='allieva'||e.nid==='malakar_re'))h=a2Ins(h,`<div class="qb a2qb"><small>Atto II · ${esc(a2Obj())}.${o.s===3?' Il Portale delle Stelle è sulla cupola dell\'Osservatorio.':''}</small></div>`)}}catch(_){}return h}}
// il Portale delle Stelle, sulla cupola
function a2Portal(){if(Zk!=='oss_cupola'||ents.some(e=>e.k==='po'&&e.to==='valle86'))return;const[x,y]=nearFree(2,8);const p=po(x,y,'valle86',{st:'void',n:'Portale delle Stelle · Valle del Crepuscolo'});ents.push(p);if(cineOK())ringFx(p.px,p.py,'191,208,255',1,2.2)}
{const l0=loadPost;loadPost=function(k){l0(k);try{if(!a2On())return;const o=a2Fix();
    if(k==='oss_cupola'&&o.s>=3)a2Portal();
    if(k==='valle86'){if(!o.seen){o.seen=1;save();setTimeout(()=>{if(Zk==='valle86')filmOnce('a2_valle',()=>{})},900)}}
    // Atto II già finito o non ancora cominciato: la Rocca resta aperta per chi l'ha aperta
  }catch(e){console.warn('atto II',e)}}}
// quando una delle stelle si riaccende, e quando cade Morvath
{const b0=bossDown;bossDown=function(e){b0(e);try{if(!a2On()||!e)return;const o=a2Fix(),i=A2D.findIndex(id=>DG[id].boss===e.t);
    if(i>=0&&!o.l[i]){o.l[i]=1;const n=a2N();setTimeout(()=>banner('✦ La stella di '+A2STAR[i]+' si riaccende',n<3?'Stelle della Lanterna: '+n+'/3':'Le tre stelle brillano: la Rocca di Morvath si è aperta','stella'),2600);
      if(n>=3){P.unl=P.unl||{};P.unl.rocca86=1;if(o.s<4)o.s=4}save()}
    if(e.t==='morvath86'&&o.s<5){o.s=5;const f=th86Fix();f.sub=Math.max(f.sub||0,1.5);save();setTimeout(()=>filmOnce('a2_fine',()=>{banner('L\'alba è tornata','La Minaccia del Regno scende. Torna da Re Malakar nel castello.','sole');npcMarks();hud()}),3200)}}catch(x){console.warn('atto II',x)}}}
// all'inizio (o appena finito il vero finale) l'annuncio del nuovo capitolo, una volta sola
{const b0=begin;begin=function(d,s){b0(d,s);try{if(a2On()){const o=a2Fix();if(!o.ann){o.ann=1;setTimeout(()=>{if(started&&a2On())banner('Atto II · La costellazione perduta','Re Malakar ti cerca: le notti di Aldoria si allungano','stella')},4500)}}}catch(_){}}}
{const t0=trueEnding;trueEnding=function(){t0();try{const o=a2Fix();if(!o.ann){o.ann=1;setTimeout(()=>{if(started&&a2On())banner('Atto II · La costellazione perduta','Quando sei pronto, Re Malakar ti aspetta nel castello','stella')},14000)}}catch(_){}}}
// Morvath, alla prima metà della vita: l'Eclissi (immune per un momento, chiama le ombre)
{const u0=upd;upd=function(dt){u0(dt);try{if(!started||Zk.split('@')[0]!=='rocca86')return;for(const e of ents){if(e.k!=='en'||e.t!=='morvath86'||e.pup||e.ecl86||e.hp>e.mx*.5)continue;e.ecl86=1;e.shd=t+2.6;flt(e,'Eclissi!','#bfd0ff');msg('Morvath spegne la luce: «Al buio non si risveglia nessuno!»');shake(.8);tone(55,.9,'sawtooth',.08);
      if(cineOK())ringFx(e.px,e.py,'120,100,220',1.4,4);for(let i=0;i<3;i++){const an=i*2.094+t,[x,y]=nearFree(clamp(Math.floor(e.px+Math.cos(an)*2.2),1,N-2),clamp(Math.floor(e.py+Math.sin(an)*2.2),1,N-2));if(WK(M[y][x])){const m=mk('ombra86',x,y,26000+i);m.al=1;ents.push(m)}}
      e.ecT=t+2.6}
    // durante l'Eclissi la stanza si fa buia
    }catch(_){}}}
{const d0=nightDraw;nightDraw=function(){d0();try{if(!started||!Zk||Zk.split('@')[0]!=='rocca86')return;const e=ents.find(q=>q.k==='en'&&q.t==='morvath86'&&q.ecT&&q.ecT>t);if(!e)return;const k=Math.min(1,(e.ecT-t)/2.6);g.setTransform(DPR,0,0,DPR,0,0);g.fillStyle=`rgba(10,6,30,${(.55*k).toFixed(3)})`;g.fillRect(0,0,W,H)}catch(_){}}}
/* ---- la Cronaca: il capitolo ---- */
{const c0=X43P.cro48;if(c0)X43P.cro48=()=>{let h=c0();try{if(a2On()){const o=a2Fix();h=h.replace('<h4>Titoli</h4>',`<h4>Atto II: la costellazione perduta</h4><p class="x43t">${esc(a2Obj())}.${o.s>=3?' Stelle: '+A2STAR.map((n,i)=>(o.l[i]?'✦ ':'· ')+n).join(', ')+'.':''}</p><h4>Titoli</h4>`)}}catch(_){}return h}}
/* ---- i filmati ---- */
FILMS.a2_inizio={n:'Atto II · La costellazione perduta',mus:'notte',L:[
  {d:8,st:'town',night:.85,mus:'notte',cam:[[35.5,38,1.05],[35.5,33,1.2]],title:'ATTO II',sub:'La costellazione perduta',tt:3.4,drop:['*'],
    tx:'Da quando l\'Occhio si è chiuso, le notti di Aldoria si allungano. Ogni sera il sole se ne va un po\' prima, e le strade restano vuote.',act:[]},
  {d:8.5,st:'town',night:.95,cam:[[62.5,12,1.25],[62.5,9.5,1.45]],drop:['*'],tx:'Dalla cupola dell\'Osservatorio, l\'Astronomo Tolomeo ha visto spegnersi tre stelle, una dopo l\'altra. Sempre nello stesso punto del cielo, dove le carte non segnano niente.',act:[]},
  {d:9,st:'valle86',night:.7,tint:'rgba(40,20,90,.3)',cam:[[28.5,14,1.1],[28.5,11,1.45]],who:'Morvath',
    tx:'«Mille anni ho custodito il sigillo per Aldric il Primo. E lui, per ringraziarmi, mi ha chiuso tra le stelle. Ora il sigillo dorme, e io sono libero. Su Aldoria non sorgerà più il sole: al buio, nulla si risveglia.»',
    act:[fA('mv',{boss:'morvath86',p:[28.5,10.8],f:'S'})]}]};
FILMS.a2_valle={n:'La Valle del Crepuscolo',mus:'cittadella',L:[
  {d:8,st:'valle86',night:.6,tint:'rgba(40,20,90,.25)',cam:[[28,40,1],[28,30,1.1]],title:'LA VALLE DEL CREPUSCOLO',sub:'dentro la Lanterna',tt:3.2,
    tx:'Dentro la Lanterna il sole non sorge mai del tutto. Tre santuari, ognuno con la sua stella spenta. In mezzo, il cuore della costellazione aspetta di tornare a brillare.',act:[]},
  {d:8,st:'valle86',night:.6,tint:'rgba(40,20,90,.25)',cam:[[28.5,14,1.2],[28.5,11,1.5]],who:'Morvath',
    tx:'«Sei venuto fin qui per ridare la luce a chi dorme sotto Aldoria? Torna a casa, eroe. Le mie stelle non le riaccenderai.»',act:[fA('mv',{boss:'morvath86',p:[28.5,10.8],f:'S'})]}]};
FILMS.a2_fine={n:'Atto II · L\'alba',mus:'castello',L:[
  {d:8,st:'valle86',dusk:.6,cam:[[28,30,1.1],[28,26,1.3]],tx:'Le tre stelle e il cuore della Lanterna tornano a brillare. Per la prima volta in mille anni, la costellazione perduta si vede di nuovo dalla terra.',act:[]},
  {d:8.5,st:'valle86',dusk:.4,cam:[[28.5,13,1.25],[28.5,11,1.5]],who:'Morvath',tx:'«Aldric mi aveva detto che il buio era l\'unica difesa. Mi sbagliavo a credergli. Custodisci tu Aldoria, ora: io resterò a guardarla da quassù.»',act:[fA('mv',{boss:'morvath86',p:[28.5,10.8],f:'S',ghost:1})]},
  {d:8,st:'town',dusk:.8,mus:'castello',cam:[[35.5,40,1.05],[35.5,36,1.15]],drop:['*'],tx:'Quella mattina, ad Aldoria, il sole sorse all\'ora giusta. E la gente scese in piazza a guardarlo, come per una festa.',act:[]}]};
(function(){const st=document.createElement('style');st.textContent=`.a2qb{border-color:#9ab0ff!important}.a2qb b{color:#3a2a7a}`;document.head.appendChild(st)})();
// nella vista 3D, oltre i confini della Valle il paesaggio è quello spento delle ceneri (non i boschi verdi di un campo)
if(typeof d3Biome==='function'){const b0=d3Biome;d3Biome=function(k){return k==='valle86'?'cenere':b0(k)}}
// e gli alberi lontani (che il paesaggio 3D fa sempre verdi) diventano tronchi spenti color crepuscolo
if(typeof d3Backdrop==='function'){const b0=d3Backdrop;d3Backdrop=function(){const B=b0();try{if(Zk==='valle86')for(let i=0;i+9<B.length;i+=10){const r=B[i+6],g=B[i+7],b=B[i+8];if(g>r+18&&g>b+8){const v=(r+g+b)/3;B[i+6]=v*.62;B[i+7]=v*.52;B[i+8]=v*.82}}}catch(_){}return B}}
