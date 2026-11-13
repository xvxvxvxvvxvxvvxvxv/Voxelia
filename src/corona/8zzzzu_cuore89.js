/* ================= 8.9: IL CUORE DELLA CORONA RIFATTO — LE SEI STANZE E IL SETTIMO FRAMMENTO =================
   Con tutte e sei le schegge si entra nel Cuore della Corona. Prima c'erano cinque ondate e la boss fight contro l'Eco
   della Corona (8zzzzh_corona80.js); ora l'Eco non combatte più: è la guida. Il Cuore è un piazzale d'oro sospeso nel
   vuoto, con sei passerelle verso sei stanze, una per scheggia. In ogni stanza la sua scheggia ha un potere, e serve
   per risolvere un enigma; risolte tutte e sei, al centro si apre il SETTIMO FRAMMENTO, il frammento dei Fondatori.
     0 🔴 Rubino · il fuoco      sette bracieri in cerchio: accenderne uno accende o spegne anche i due vicini; vanno
                                 accesi tutti (come il gioco delle luci: c'è sempre una soluzione, e una sola)
     1 ⚪ Diamante · la verità   tre file di tre ponti uguali sul vuoto: uno solo per fila regge. Dal piedistallo il
                                 Diamante li mostra per tre secondi e mezzo: bisogna ricordarseli tutti e tre
     2 🟢 Smeraldo · il tempo    un ponte crollato: lo Smeraldo lo riporta indietro nel tempo, ma si sbriciola dietro di
                                 te; a metà c'è un isolotto con un altro piedistallo per la seconda metà
     3 🟣 Ametista · costruire   tre blocchi da mettere sul vuoto (si clicca dove metterli) per arrivare dall'altra
                                 parte: c'è una sola strada con tre blocchi (le altre ne chiedono almeno cinque)
     4 🟡 Topazio · il viaggio   sei isole con due portali ciascuna: la strada giusta passa da quattro portali, quelle
                                 sbagliate riportano all'inizio
     5 🔵 Zaffiro · la memoria   sei colonne si accendono in sequenza: va ripetuta, in tre giri da 4, 6 e 8
   Gli enigmi sono difficili; dopo tre errori nella stessa stanza l'Eco aiuta (un indizio diverso per ogni stanza).
   Si fanno una volta sola: quello che è risolto resta risolto (cr80().cu9), e tornando nel Cuore si va dritti al centro.
   Il settimo frammento si prende al centro: il filmato «Il mondo si scompone» porta nella stanza dietro la Corona
   (src/voxeliaverse/), da dove si viaggia nelle realtà del Voxeliaverse. */
const CU9K=['rubino','diamante','smeraldo','ametista','topazio','zaffiro88'];
const CU9N=[T88('il fuoco','fire'),T88('la verità','truth'),T88('il tempo','time'),T88('costruire','building'),T88('il viaggio','travel'),T88('la memoria','memory')];
// cr80() rilegge ogni volta il salvataggio della Corona: lo stato del Cuore si tiene qui e si riscrive dentro al salvataggio
let CU9O=null;
function cu9(){if(!CU9O){const o=cr80();let c=o.cu9;if(!c||typeof c!=='object')c={r:[0,0,0,0,0,0],f7:0,seen:{}};c.r=Array.isArray(c.r)?c.r:[0,0,0,0,0,0];c.seen=c.seen||{};CU9O=c}return CU9O}
function cu9Save(f){const o=cr80();o.cu9=cu9();if(f)f(o);LS.set(CRK80,o)}
const cu9N=()=>cu9().r.filter(Boolean).length;
/* ---- la pianta: il piazzale al centro e le sei stanze intorno ---- */
const C9=32,C9R=[[32,11,0,-1,1,0],[50,21,1,0,0,1],[50,43,1,0,0,1],[32,53,0,1,-1,0],[14,43,-1,0,0,-1],[14,21,-1,0,0,-1]];   // [cx,cy, dx,dy (verso il fondo), lx,ly (di lato)]
// da coordinate della stanza (u: dall'ingresso verso il fondo, 0..14; w: di lato, -6..6) al mondo
const C9W=(i,u,w)=>{const[cx,cy,dx,dy,lx,ly]=C9R[i];return[cx-dx*7+dx*u+lx*w,cy-dy*7+dy*u+ly*w]};
// stato di ogni stanza mentre si gioca (non si salva: si salva solo se è risolta)
let CU9S=[];function cu9Reset(){CU9S=[0,1,2,3,4,5].map(i=>({err:0,hint:0}))}
// i dati fissi degli enigmi
const DIA9={lanes:[[2,4],[6,8],[10,12]],w:[-3,0,3],ok:[2,0,1]};                 // Diamante: per ogni fila, quale dei tre ponti (w) regge
const AME9={stones:[[3,0],[4,0],[4,1],[4,2],[4,4],[5,4],[6,4],[7,4],[9,4],[10,4],[10,3],[10,2],[11,2],[3,-3],[4,-3],[5,-3],[6,-3],[7,-3],[9,-3],[10,-3],[6,0],[7,0],[7,-1],[9,1],[9,0]],sol:[[2,0],[4,3],[8,4]]};
const TOP9={isl:{A:[0,-2],I1:[4,-5],I2:[4,4],I3:[8,-5],I4:[8,4],I5:[8,-1],T:[13,-2]},
  // per ogni isola i due portali: [casella del portale (u,w), dove porta]; l'isola A e T sono più grandi
  pt:{A:[[[1,-2],'I1'],[[1,2],'I2']],I1:[[[4,-5],'A'],[[5,-4],'I3']],I2:[[[4,4],'I4'],[[5,5],'A']],I3:[[[8,-5],'I2'],[[9,-4],'I5']],I4:[[[8,4],'I1'],[[9,5],'A']],I5:[[[8,-1],'T'],[[9,0],'A']]},
  land:{A:[0,0],I1:[5,-5],I2:[4,5],I3:[9,-5],I4:[8,5],I5:[9,-1],T:[13,0]},good:{A:0,I1:1,I3:1,I5:0}};
const ZAF9=[4,6,8];
function cuoreGen({n,N2}){CU9O=null;FOG9=null;cu9Reset();const c=cu9();const set=(x,y,v)=>{if(x>0&&y>0&&x<n-1&&y<n-1){M[y][x]=v;if(v!==6)DEC[y][x]=''}};
  for(let y=0;y<n;y++)for(let x=0;x<n;x++){M[y][x]=9;DEC[y][x]=''}
  // il piazzale: un disco d'oro con le sei colonne delle schegge e il piedistallo del settimo frammento al centro
  for(let y=C9-6;y<=C9+6;y++)for(let x=C9-6;x<=C9+6;x++)if(Math.hypot(x-C9,y-C9)<=5.6)set(x,y,0);
  CU9K.forEach((k,i)=>{const[cx,cy]=C9R[i],a=Math.atan2(cy-C9,cx-C9),x=Math.round(C9+Math.cos(a+.5)*4.2),y=Math.round(C9+Math.sin(a+.5)*4.2);M[y][x]=6;DEC[y][x]='ⓒ'+i});
  ents.push({k:'cu9',s:'f7',px:C9+.5,py:C9+.5});
  const eco=N2('eco89',C9,C9+3);eco.ghost=1;eco.m=eco89M();
  // le passerelle verso le stanze (larghe due caselle) e le stanze
  for(let i=0;i<6;i++){const[ex,ey]=C9W(i,0,0),[dx,dy]=[C9R[i][2],C9R[i][3]],[sx,sy]=[ex-dx,ey-dy];let x=C9,y=C9;const lx=C9R[i][4],ly=C9R[i][5];
    while(x!==sx||y!==sy){if(Math.abs(sx-x)>=Math.abs(sy-y))x+=Math.sign(sx-x);else y+=Math.sign(sy-y);set(x,y,0);set(x+lx,y+ly,0)}
    cu9Room(i,set,!!c.r[i]);
    // l'arco d'ingresso della stanza, nel colore della sua scheggia (sul vuoto, ai lati della passerella)
    for(const w of[-3,3]){const[x,y]=C9W(i,0,w);if(M[y]&&M[y][x]===9){M[y][x]=6;DEC[y][x]='ⓔ'+i}}}
  // nel vuoto: cubi di luce e frammenti di pietra che galleggiano, e qualche filo di luce che sale
  const r=sd(hs('cuore89'));for(let k=0;k<70;k++){const x=1+r()*(n-2),y=1+r()*(n-2);if(M[y|0][x|0]!==9)continue;ents.push({k:'cu9d',px:x,py:y,s:r()<.7?'cubo':'pietra',c:GEM80[Math.floor(r()*6)].c,ph:r()*6.28,z0:-40+r()*60,sz:.12+r()*.3})}
  for(let k=0;k<18;k++){const a=k/18*6.283,x=C9+Math.cos(a)*6.4,y=C9+Math.sin(a)*6.4;if(M[y|0]&&M[y|0][x|0]===9)ents.push({k:'cu9d',px:x,py:y,s:'filo',c:'#ffd84a',ph:k})}
  return[C9,C9+2]}
Object.assign(NPCS,{eco89:{n:T88('L\'Eco della Corona','The Echo of the Crown'),c:'#d4af37',hat:'#ffd84a',ln:[T88('Tutto quello che la Corona ha visto, io l\'ho visto.','Everything the Crown has seen, I have seen.'),T88('Sei stanze, sei luci. E poi la settima.','Six rooms, six lights. And then the seventh.')]}});
NPS.eco89='b|long:#ffe8a0|long:#ffe8a0|crown|cape:#d4af37,collar|staff|proud|tall';
let ECOM=null;function eco89M(){if(!ECOM){try{ECOM=ghostL(npcModel('eco89',{},{px:1,py:1}),.62,'#ffe8a0')}catch(_){ECOM=hum('#ffe8a0','#fff4c8',1,[6,'#d4af37'])}}return ECOM}
function cu9Room(i,set,done){const W=(u,w)=>C9W(i,u,w),F=(u,w,v=0)=>{const[x,y]=W(u,w);set(x,y,v)},rect=(u0,u1,w0,w1,v=0)=>{for(let u=u0;u<=u1;u++)for(let w=w0;w<=w1;w++)F(u,w,v)},E9=(s,u,w,o)=>{const[x,y]=W(u,w);ents.push(Object.assign({k:'cu9',s,r:i,px:x+.5,py:y+.5},o||{}))};
  rect(0,1,-2,2);   // l'ingresso
  const alt=(u,w)=>E9('alt',u,w);
  if(i===0){for(let u=0;u<=13;u++)for(let w=-5;w<=5;w++)if(Math.hypot(u-7,w)<=6.2||u<=1)F(u,w);
    for(let j=0;j<7;j++){const a=j/7*6.283-Math.PI/2,[x,y]=W(7,0);ents.push({k:'cu9',s:'bra',r:0,j,px:x+.5+Math.cos(a)*2.3,py:y+.5+Math.sin(a)*2.3})}
    E9('ped',12,0,{tip:T88('Riaccendi i bracieri da capo','Relight the braziers from the start')})}
  if(i===1){rect(0,1,-4,4);for(const[a,b]of DIA9.lanes)for(const w of DIA9.w)rect(a,b,w,w);rect(5,5,-4,4);rect(9,9,-4,4);rect(13,14,-2,2);alt(14,0);E9('ped',0,-4,{tip:T88('Il Diamante mostra i ponti veri','The Diamond shows the true bridges')});
    if(done)for(let f=0;f<3;f++)for(let u=DIA9.lanes[f][0];u<=DIA9.lanes[f][1];u++){const[x,y]=W(u,DIA9.w[DIA9.ok[f]]);DEC[y][x]='ⓓ'}}
  if(i===2){rect(7,8,-1,1);rect(13,14,-2,2);alt(14,0);E9('ped',1,1,{q:1,tip:T88('Lo Smeraldo riporta indietro il ponte','The Emerald brings the bridge back')});E9('ped',8,1,{q:2,tip:T88('Lo Smeraldo riporta indietro il ponte','The Emerald brings the bridge back')});if(done){rect(2,6,0,0);rect(9,12,0,0)}}
  if(i===3){for(const[u,w]of AME9.stones)F(u,w);rect(12,14,-2,2);alt(14,0);E9('ped',0,-2,{tip:T88('Riprendi i blocchi','Take back the blocks')});if(done)for(const[u,w]of AME9.sol){F(u,w);const[x,y]=W(u,w);DEC[y][x]='ⓐ'}}
  if(i===4){rect(0,1,-2,2);for(const k of['I1','I2','I3','I4','I5']){const[u,w]=TOP9.isl[k];rect(u,u+1,w,w+1)}rect(13,14,-2,2);alt(14,0);
    for(const k in TOP9.pt)TOP9.pt[k].forEach(([[u,w],to],j)=>E9('tp',u,w,{k:'cu9t',isl:k,j,to}));if(done){rect(2,12,0,0)}}
  if(i===5){for(let u=0;u<=12;u++)for(let w=-5;w<=5;w++)if(Math.hypot(u-7,w)<=5.2||u<=1)F(u,w);
    for(let j=0;j<6;j++){const a=j/6*6.283-Math.PI/2,[x,y]=W(7,0);ents.push({k:'cu9',s:'pil',r:5,j,px:x+.5+Math.cos(a)*1.25,py:y+.5+Math.sin(a)*1.25})}E9('ped',3,0,{tip:T88('Ascolta la sequenza','Listen to the sequence')})}
  // la stanza risolta ha l'altare acceso e, dove serve, la strada già fatta
  if(done){const S=CU9S[i];S.done=1}}
/* ---- i testi dell'Eco ---- */
const ECO9={
  ent:[T88('L\'Eco della Corona','The Echo of the Crown'),T88('Il Cuore della Corona','The Heart of the Crown'),T88('Le sei schegge si accendono tutte insieme e la Corona ti risucchia dentro. Sotto i tuoi piedi c\'è un piazzale d\'oro sospeso nel vuoto; intorno, sei passerelle verso sei stanze.\n\nDavanti a te c\'è una figura fatta di tutte le epoche che la Corona ha visto. Non alza le armi.\n\n«Per mille anni ho creduto di dover difendere questo posto. Ho combattuto chiunque arrivasse fin qui, e ho sempre vinto, perché nessuno arrivava con tutte e sei le luci. Tu sì.\n\nIo sono l\'Eco della Corona: tutto quello che la Corona ha visto. E la Corona ha visto chi l\'ha fatta. Non il Primo Re: lui l\'ha soltanto trovata. L\'hanno fatta i Fondatori, quelli che hanno fatto il mondo, e tutti gli altri mondi.\n\nOgni scheggia apre una stanza, e ogni stanza chiede alla sua scheggia di fare quello che sa fare. Risolvile tutte e sei, e al centro troverai quello che i Fondatori hanno lasciato. Il settimo frammento. Quello senza colore.»',
    'The six splinters light up all together and the Crown draws you inside. Beneath your feet there\'s a golden square suspended in the void; around it, six walkways lead to six rooms.\n\nIn front of you stands a figure made of every age the Crown has seen. It does not raise its weapons.\n\n“For a thousand years I believed I had to defend this place. I fought anyone who came this far, and I always won, because no one came with all six lights. You did.\n\nI am the Echo of the Crown: everything the Crown has seen. And the Crown saw who made it. Not the First King: he only found it. It was made by the Founders, those who made the world, and every other world.\n\nEach splinter opens a room, and each room asks its splinter to do what it knows how to do. Solve all six, and at the center you\'ll find what the Founders left behind. The seventh fragment. The one without color.”')],
  room:[T88('«Il fuoco è stato il primo dono dei Fondatori. Ma un fuoco acceso da solo si spegne: questi bracieri si accendono solo insieme.»','“Fire was the Founders\' first gift. But a fire lit alone goes out: these braziers only light together.”'),
    T88('«La verità non resta accesa a lungo. Il Diamante te la mostra una volta: il resto devi ricordarlo tu.»','“Truth doesn\'t stay lit for long. The Diamond shows it to you once: the rest you must remember yourself.”'),
    T88('«I Fondatori potevano camminare nel tempo come tu cammini in una stanza. Lo Smeraldo ricorda com\'era questo ponte. Ma il tempo non aspetta.»','“The Founders could walk through time the way you walk through a room. The Emerald remembers how this bridge was. But time doesn\'t wait.”'),
    T88('«Tutto quello che vedi l\'hanno costruito i Fondatori, un cubo alla volta. Ti restano tre cubi. Non uno di più.»','“Everything you see was built by the Founders, one cube at a time. You have three cubes left. Not one more.”'),
    T88('«I Fondatori viaggiavano da un mondo all\'altro attraverso porte come queste. Non tutte portano dove credi.»','“The Founders traveled from one world to another through doors like these. Not all of them lead where you think.”'),
    T88('«Un mondo esiste finché qualcuno lo ricorda. Lo sapevano a Eldora, e lo sapevano i Fondatori. Ricorda quello che ti mostro.»','“A world exists as long as someone remembers it. They knew it in Eldora, and the Founders knew it. Remember what I show you.”')],
  hint:[T88('«Guarda il braciere che brilla: comincia da lì. Poi un altro, sempre quello che brilla.»','“Look at the brazier that glows: start there. Then another, always the one that glows.”'),
    T88('«Ti lascio un po\' della sua luce: i ponti veri ora brillano appena. Guarda bene.»','“I\'ll leave you a little of its light: the true bridges now glow faintly. Look closely.”'),
    T88('«Ti presto un po\' del mio tempo: il ponte ora resiste più a lungo. Ma non fermarti.»','“I\'ll lend you some of my time: the bridge now lasts longer. But don\'t stop.”'),
    T88('«Il posto dove va il prossimo cubo brilla. Fidati.»','“The place where the next cube goes is glowing. Trust it.”'),
    T88('«Il portale giusto, su ogni isola, adesso brilla un po\' di più.»','“The right portal, on every island, now glows a little brighter.”'),
    T88('«Se esiti, la colonna giusta si accende piano. E le sequenze saranno più lente.»','“If you hesitate, the right column lights up softly. And the sequences will be slower.”')],
  done:[T88('«Sette fuochi, una sola fiamma. Il Rubino è tornato a casa.»','“Seven fires, one flame. The Ruby has come home.”'),T88('«Hai ricordato la verità anche quando non la vedevi più. Il Diamante è contento.»','“You remembered the truth even when you could no longer see it. The Diamond is pleased.”'),
    T88('«Più veloce del tempo. Lo Smeraldo non lo dimenticherà.»','“Faster than time. The Emerald won\'t forget it.”'),T88('«Tre cubi, e un mondo intero dall\'altra parte. È così che costruivano i Fondatori.»','“Three cubes, and a whole world on the other side. That\'s how the Founders built.”'),
    T88('«Hai trovato la strada tra le porte. Il Topazio ti seguirà ovunque.»','“You found the way through the doors. The Topaz will follow you anywhere.”'),T88('«Hai ricordato. Ed è per questo che esisti anche tu.»','“You remembered. And that\'s why you exist too.”')],
  f7:[T88('Il settimo frammento','The Seventh Fragment'),T88('L\'Eco della Corona','The Echo of the Crown'),T88('Al centro del piazzale le sei colonne si piegano verso il piedistallo, e la luce delle sei schegge si unisce in una sola. Dove si incontrano non c\'è nessun colore: c\'è un frammento trasparente, che sembra pesare più di tutta la Corona.\n\n«Eccolo. Il frammento dei Fondatori. Le leggende di Eldora lo chiamavano la settima luce, quella che non ha colore e non ha padrone.\n\nLe sei schegge tengono insieme il mondo che conosci. Il settimo tiene insieme tutti gli altri. Con questo in mano non sei più qualcuno che vive in una realtà: sei qualcuno che può sceglierla.\n\nI Fondatori ne hanno fatte tante che nessuno le ha mai contate davvero. Il Voxeliaverse, le chiamavano. Prendilo, eroe. È tuo.»',
    'At the center of the square the six columns bend toward the pedestal, and the light of the six splinters joins into one. Where they meet there is no color: there is a transparent fragment that seems to weigh more than the whole Crown.\n\n“There it is. The Founders\' fragment. The legends of Eldora called it the seventh light, the one that has no color and belongs to no one.\n\nThe six splinters hold together the world you know. The seventh holds together all the others. With this in your hand you are no longer someone who lives in a reality: you are someone who can choose it.\n\nThe Founders made so many that no one has ever truly counted them. The Voxeliaverse, they called it. Take it, hero. It\'s yours.”')],
  wait:T88('«Il settimo frammento si apre solo quando tutte e sei le stanze sono risolte.»','“The seventh fragment opens only when all six rooms are solved.”')};
T88('Stanza del {0}: {1}','Room of the {0}: {1}');T88('Stanze risolte: {0}/6','Rooms solved: {0}/6');T88('Hai sbagliato: torni all\'inizio della stanza','A mistake: back to the start of the room');T88('Un aiuto dell\'Eco','A hint from the Echo');
const CU9G=['Rubino','Diamante','Smeraldo','Ametista','Topazio','Zaffiro'];T88('Rubino','Ruby');T88('Diamante','Diamond');T88('Smeraldo','Emerald');T88('Ametista','Amethyst');T88('Topazio','Topaz');
/* ---- in quale stanza è l'eroe ---- */
function cu9At(x,y){for(let i=0;i<6;i++){const[cx,cy]=C9R[i];if(Math.abs(x-cx)<=7.6&&Math.abs(y-cy)<=7.6)return i}return-1}
function cu9Start(i){const[x,y]=C9W(i,0,0);return[x+.5,y+.5]}
function cu9Err(i,why){const S=CU9S[i];S.err++;if(why)msg(why);tone(110,.5,'sawtooth',.06);shake(.4);if(S.err>=3&&!S.hint){S.hint=1;setTimeout(()=>{banner(T88('Un aiuto dell\'Eco','A hint from the Echo'),ECO9.hint[i].replace(/[«»“”]/g,''),'stella');msg(ECO9.hint[i])},900)}}
function cu9Fall(i){const[x,y]=cu9Start(i);if(cineOK())sparks(P.px,P.py,16,['#ffffff','#bfe6ff'],50);P.px=x;P.py=y;P.path=[];P.tg=null;flash&&flash('#000000',.5,500);cu9Err(i,T88('Hai sbagliato: torni all\'inizio della stanza','A mistake: back to the start of the room'))}
function cu9Solve(i){const c=cu9();if(c.r[i])return;c.r[i]=1;CU9S[i].done=1;cu9Save();
  // risolta la stanza, la strada di ritorno resta (il ponte dello Smeraldo, una passerella tra le isole del Topazio)
  const F=(u,w)=>{const[x,y]=C9W(i,u,w);if(M[y][x]===9){M[y][x]=0;cu9Dirty()}};if(i===2){for(let u=2;u<=6;u++)F(u,0);for(let u=9;u<=12;u++)F(u,0)}if(i===4)for(let u=2;u<=12;u++)F(u,0);const n=cu9N();jingle([60,64,67,72],.12,'triangle');if(cineOK()){const[x,y]=C9W(i,14,0);ringFx(x+.5,y+.5,rgbOf(GEM80[i].c),1.2,3)}
  banner('✦ '+T88('Stanza del {0}: {1}','Room of the {0}: {1}').replace('{0}',CU9G[i]).replace('{1}',CU9N[i]),T88('Stanze risolte: {0}/6','Rooms solved: {0}/6').replace('{0}',n),'stella');msg(ECO9.done[i]);
  if(n>=6)setTimeout(()=>{banner(T88('Il settimo frammento','The Seventh Fragment'),T88('Le sei stanze sono risolte: al centro del piazzale qualcosa si è acceso','The six rooms are solved: at the center of the square something has lit up'),'corona');tone(880,.6,'sine',.05)},2600)}
// cambiare il pavimento mentre si gioca (ponti che compaiono, blocchi, crolli): si rifanno le cache del pavimento e della vista 3D
let CU9D=0;function cu9Dirty(){CU9D=1}
function cu9Flush(){if(!CU9D)return;CU9D=0;FC=null;try{if(typeof D3!=='undefined'&&D3.gl&&typeof d3Reset==='function'&&D3.zk===Zk)d3Reset()}catch(_){}}
/* ---- gli enigmi ---- */
// 🔴 il fuoco: sette bracieri, ognuno accende o spegne sé e i due vicini
const RUB9S=[1,0,0,1,0,1,0];
function rub9Sol(st){let best=null;for(let m=0;m<128;m++){const s=st.slice();for(let j=0;j<7;j++)if(m>>j&1)for(const d of[-1,0,1])s[(j+d+7)%7]^=1;if(s.every(Boolean)){const c=[...Array(7).keys()].filter(j=>m>>j&1);if(!best||c.length<best.length)best=c}}return best||[]}
function rub9Press(j){const S=CU9S[0];if(S.done)return;S.st=S.st||RUB9S.slice();for(const d of[-1,0,1])S.st[(j+d+7)%7]^=1;S.n=(S.n||0)+1;tone(S.st[j]?440:220,.15,'triangle',.05);if(cineOK()){const e=ents.find(q=>q.s==='bra'&&q.j===j);if(e)sparks(e.px,e.py,8,['#ff8a3a','#ffd84a'],36)}
  if(S.st.every(Boolean)){cu9Solve(0);return}if(S.n%12===0)cu9Err(0,T88('Il fuoco non si accende così','The fire won\'t light that way'))}
// ⚪ la verità: i ponti finti si rompono sotto i piedi
function dia9Fake(x,y){const S=CU9S[1];if(S.done)return false;for(let f=0;f<3;f++){const[a,b]=DIA9.lanes[f];for(let u=a;u<=b;u++)for(let k=0;k<3;k++){if(k===DIA9.ok[f])continue;const[px,py]=C9W(1,u,DIA9.w[k]);if(px===x&&py===y)return true}}return false}
// 🟢 il tempo: il ponte torna per un po', poi si sbriciola dietro di te, casella dopo casella
function sme9Go(q){const S=CU9S[2];if(S.done)return;const k=S.hint?1.7:1,seg=q===1?[2,6]:[9,12];S.br=S.br||[];
  for(let u=seg[0];u<=seg[1];u++){const[x,y]=C9W(2,u,0);M[y][x]=0;S.br.push({x,y,t:t+(1.7+(u-seg[0])*.27)*k})}cu9Dirty();tone(660,.4,'sine',.05);tone(990,.3,'sine',.03);
  if(cineOK()){const[x,y]=C9W(2,(seg[0]+seg[1])/2,0);ringFx(x+.5,y+.5,'60,220,120',1,2)}}
const sme9Br=(x,y)=>{for(const[a,b2]of[[2,6],[9,12]])for(let u=a;u<=b2;u++){const[p,q]=C9W(2,u,0);if(p===x&&q===y)return true}return false};
// 🟣 costruire: si clicca sul vuoto accanto a dove si può già camminare
function ame9Can(x,y){const S=CU9S[3];if(S.done||Zk!=='cuore80'||cu9At(x,y)!==3||M[y]==null||M[y][x]!==9)return false;if((S.used||0)>=3)return false;
  const d=bfs(P.px|0,P.py|0);return[[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>{const u=x+a,v=y+b;return u>=0&&v>=0&&u<N&&v<N&&d[v*N+u]>=0})}
function ame9Put(x,y){const S=CU9S[3];S.used=(S.used||0)+1;S.put=S.put||[];S.put.push([x,y]);M[y][x]=0;DEC[y][x]='ⓐ';cu9Dirty();tone(520,.15,'square',.05);if(cineOK())sparks(x+.5,y+.5,10,['#c86aff','#f0d8ff'],40);
  msg(T88('Blocchi rimasti: {0}','Blocks left: {0}').replace('{0}',3-S.used));if(S.used>=3){const d=bfs(P.px|0,P.py|0);const[tx,ty]=C9W(3,13,0);if(d[ty*N+tx]<0)setTimeout(()=>msg(T88('Non basta: riprendi i blocchi dal piedistallo','Not enough: take the blocks back at the pedestal')),600)}}
function ame9Back(){const S=CU9S[3];if(S.done||!S.put||!S.put.length)return;for(const[x,y]of S.put){M[y][x]=9;DEC[y][x]=''}S.put=[];S.used=0;cu9Dirty();const[x,y]=cu9Start(3);P.px=x;P.py=y;P.path=[];cu9Err(3,T88('Riprendi i blocchi: ne hai di nuovo tre','You take back the blocks: you have three again'))}
T88('Blocchi rimasti: {0}','Blocks left: {0}');
{const p0=pathTo;pathTo=function(gx,gy){try{if(Zk==='cuore80'&&ame9Can(gx,gy)){ame9Put(gx,gy);return[]}}catch(e){console.warn('Cuore',e)}return p0(gx,gy)}}
// 🟡 il viaggio: si entra in un portale e si esce su un'altra isola
function top9Tick(){const S=CU9S[4];if(S.done)return;const x=P.px|0,y=P.py|0;
  for(const e of ents){if(e.k!=='cu9t'||(e.px|0)!==x||(e.py|0)!==y)continue;if(S.cd&&S.cd>t)return;S.cd=t+.6;const[u,w]=TOP9.land[e.to],[lx,ly]=C9W(4,u,w);
    if(cineOK())sparks(P.px,P.py,14,['#ffaa1e','#fff0b0'],50);tone(700,.25,'sine',.05);P.px=lx+.5;P.py=ly+.5;P.path=[];P.tg=null;
    if(e.to==='A')cu9Err(4,T88('Il portale ti riporta all\'inizio','The portal takes you back to the start'));return}}
// 🔵 la memoria: tre giri di sequenze sempre più lunghe
function zaf9Play(){const S=CU9S[5];if(S.done||S.play)return;S.rd=S.rd||0;const L=ZAF9[S.rd]-(S.hint?0:0),r=sd(hs('zaf9|'+S.rd+'|'+(S.err|0)));S.seq=[...Array(L)].map(()=>Math.floor(r()*6));S.in=[];S.play=1;S.lit=-1;
  const dt=S.hint?.9:.62;S.seq.forEach((j,k)=>{setTimeout(()=>{if(Zk!=='cuore80')return;S.lit=j;S.litT=t+dt*.7;tone(330+j*70,dt*.6,'sine',.05)},500+k*dt*1000)});setTimeout(()=>{S.play=0;S.lit=-1;S.idle=t;msg(T88('Tocca a te: ripeti la sequenza','Your turn: repeat the sequence'))},500+L*dt*1000+200)}
function zaf9Press(j){const S=CU9S[5];if(S.done||S.play||!S.seq)return;S.lit=j;S.litT=t+.35;S.idle=t;tone(330+j*70,.25,'sine',.05);const k=S.in.length;if(S.seq[k]!==j){S.seq=null;cu9Err(5,T88('Non era quella: ascolta di nuovo','That wasn\'t it: listen again'));setTimeout(zaf9Play,1400);return}
  S.in.push(j);if(S.in.length===S.seq.length){S.rd++;S.seq=null;if(S.rd>=ZAF9.length){cu9Solve(5);return}msg(T88('Giusto! Il giro {0} di 3','Right! Round {0} of 3').replace('{0}',S.rd+1));setTimeout(zaf9Play,1300)}}
T88('Tocca a te: ripeti la sequenza','Your turn: repeat the sequence');T88('Non era quella: ascolta di nuovo','That wasn\'t it: listen again');T88('Giusto! Il giro {0} di 3','Right! Round {0} of 3');
T88('Il fuoco non si accende così','The fire won\'t light that way');T88('Il portale ti riporta all\'inizio','The portal takes you back to the start');T88('Riprendi i blocchi: ne hai di nuovo tre','You take back the blocks: you have three again');T88('Non basta: riprendi i blocchi dal piedistallo','Not enough: take the blocks back at the pedestal');
/* ---- ogni fotogramma: crolli, cadute, portali, il primo ingresso in ogni stanza ---- */
function cu9Tick(dt){if(Zk!=='cuore80'||!started||PM==='txt')return;const c=cu9(),x=P.px|0,y=P.py|0,i=cu9At(P.px,P.py);
  if(i>=0&&!CU9S[i].in){CU9S[i].in=1;if(!c.seen[i]){c.seen[i]=1;cu9Save()}banner(T88('Stanza del {0}: {1}','Room of the {0}: {1}').replace('{0}',CU9G[i]).replace('{1}',CU9N[i]),c.r[i]?T88('Già risolta','Already solved'):ECO9.room[i].replace(/[«»“”]/g,''),'stella');if(!c.r[i])msg(ECO9.room[i])}
  if(i<0)for(const S of CU9S)S.in=0;
  // il ponte dello Smeraldo che si sbriciola
  const S2=CU9S[2];if(S2.br&&S2.br.length){for(const b of S2.br)if(t>=b.t&&!b.gone){b.gone=1;if(!S2.done){M[b.y][b.x]=9;cu9Dirty();if(cineOK())sparks(b.x+.5,b.y+.5,6,['#3ac86a','#a8ffc8'],30)}}S2.br=S2.br.filter(b=>!b.gone)}
  cu9Flush();
  if(M[y]&&M[y][x]===9&&i>=0){cu9Fall(i);return}
  if(i===1&&dia9Fake(x,y)){cu9Fall(1);return}
  if(i===4)top9Tick();
  // il ponte del Diamante, quando lo si vede
  if(i===5){const S=CU9S[5];if(S.lit>=0&&t>S.litT)S.lit=-1}}
{const u0=upd;upd=function(dt){u0(dt);try{if(started&&P&&Zk==='cuore80')cu9Tick(dt)}catch(e){console.warn('Cuore della Corona',e)}}}
T88('Già risolta','Already solved');
/* ---- toccare le cose ---- */
ITK.add('cu9');
{const a0=act;act=function(e){if(!e||e.k!=='cu9')return a0(e);const c=cu9(),i=e.r;
  if(e.s==='f7'){if(cu9N()<6){msg(ECO9.wait);return}cu9Take();return}
  if(e.s==='bra'){rub9Press(e.j);return}
  if(e.s==='pil'){zaf9Press(e.j);return}
  if(e.s==='alt'){if(!c.r[i]){cu9Solve(i)}return}
  if(e.s==='ped'){if(c.r[i]){msg(T88('Già risolta','Already solved'));return}
    if(i===0){CU9S[0].st=RUB9S.slice();CU9S[0].n=0;msg(T88('I bracieri tornano come all\'inizio','The braziers return to how they were'));cu9Err(0)}
    if(i===1){const S=CU9S[1];if(S.rv&&S.rv>t-4)return;S.rv=t;tone(1200,.5,'sine',.05);msg(T88('Il Diamante mostra i ponti veri: ricordali','The Diamond shows the true bridges: remember them'))}
    if(i===2)sme9Go(e.q);
    if(i===3)ame9Back();
    if(i===5)zaf9Play()}}}
T88('I bracieri tornano come all\'inizio','The braziers return to how they were');T88('Il Diamante mostra i ponti veri: ricordali','The Diamond shows the true bridges: remember them');
/* ---- il settimo frammento ---- */
function cu9Take(){const c=cu9(),first=!c.f7;const T=ECO9.f7;PA={ti:T[0],sub:T[1],tx:T[2]};pn('txt');
  if(first){c.f7=Date.now();cu9Save(o=>{o.fin=o.fin||Date.now()});P.g+=20000;goldFly(20000);gainXP(8000);const it=item(Math.max(18,P.lv),3,'h');it.n='Corona Riunita';it.hp=(it.hp||0)+200;if(P.inv.length<INV)P.inv.push(it);else ents.push({k:'dr',px:P.px,py:P.py,it});save();
    jingle([60,64,67,72,76,79,84,88,91],.1,'triangle');flash&&flash('#ffffff',.6,900);setTimeout(()=>banner(T88('Il settimo frammento','The Seventh Fragment'),T88('Il frammento dei Fondatori è tuo: 20.000 monete, la Corona Riunita e tanta esperienza','The Founders\' fragment is yours: 20,000 coins, the Reunited Crown and plenty of experience'),'corona'),1500)}}
/* ---- entrare nel Cuore ---- */
Z.cuore80.N=64;Z.cuore80.gen=cuoreGen;Z.cuore80.mus='cittadella';
cuoreTick=function(){};   // niente più ondate
cuoreEnter=function(){const s=LS.get(SAVEK,null);if(cr80n()<NG80){menuNote&&menuNote('Servono tutte e sei le schegge della Corona.');return}if(!s||!s.p){menuNote&&menuNote('Serve un eroe della Storia: è lui che entra nel Cuore della Corona.');return}
  albumClose();begin(s.df|0,s);setTimeout(()=>{if(!started)return;CU80.on=0;load('cuore80','town');P.hp=P.mx;const c=cu9(),n=cu9N();
    if(!c.seen.ent){c.seen.ent=1;cu9Save();const T=ECO9.ent;PA={ti:T[1],sub:T[0],tx:T[2]};pn('txt')}
    else banner(T88('Il Cuore della Corona','The Heart of the Crown'),c.f7?T88('Il settimo frammento è tuo','The seventh fragment is yours'):T88('Stanze risolte: {0}/6','Rooms solved: {0}/6').replace('{0}',n),'corona')},600)};
T88('Il settimo frammento è tuo','The seventh fragment is yours');
/* ---- come si vedono ---- */
// il pavimento: oro e viola nel piazzale e sulle passerelle; ogni stanza ha il colore della sua scheggia
{const f0=floor;floor=function(x,y,c,h){const z=ZZ;if(!z||!z.cuore||c!==0){f0(x,y,c,h);return}const i=cu9At(x,y),col=i>=0?GEM80[i].c:null,d=Math.hypot(x-C9,y-C9);
  if(i<0){box(x,y,-6,1,1,6,(x+y)&1?'#3a2a5a':'#34264f',.95);if(Math.abs(d-3)<.5||Math.abs(d-5.2)<.45)box(x+.3,y+.3,0,.4,.4,.3,'#d4af37',1.15)}
  else if(i===2&&sme9Br(x,y)){box(x,y,-6,1,1,6,(x+y)&1?'#1e5a3c':'#1a5034',1.05);box(x+.1,y+.1,0,.8,.8,.2,'#3ac86a',1.25)}   // il ponte dello Smeraldo, verde
  else{box(x,y,-6,1,1,6,(x+y)&1?'#2e2440':'#2a2039',.95);if(hh(x*7,y*3)>.86)box(x+.42,y+.42,0,.16,.16,.25,col,1.2)}
  const k=DEC[y]&&DEC[y][x];if(k==='ⓐ')box(x+.04,y+.04,-.2,.92,.92,.5,'#a85ad8',1.1);if(k==='ⓓ')box(x+.3,y+.3,0,.4,.4,.3,'#e8f4ff',1.3)}}
// i bordi delle stanze e del piazzale, sul vuoto: un orlo sottile e qualche cubetto che galleggia
{const d0=dec;dec=function(x,y,c,h){if(c==='ⓐ'||c==='ⓓ')return;   // i blocchi dell'Ametista e i ponti veri del Diamante: li disegna il pavimento
  if(c&&c[0]==='ⓔ'&&ZZ&&ZZ.cuore){const i=+c.slice(1),G=GEM80[i],ok=cu9().r[i];box(x+.2,y+.2,0,.6,.6,4,'#3a2a5a');box(x+.28,y+.28,4,.44,.44,34,'#2a1e44');for(let k=0;k<3;k++)box(x+.26,y+.26,10+k*9,.48,.48,1.2,'#d4af37');
    box(x+.18,y+.18,38,.64,.64,3,'#d4af37');box(x+.34,y+.34,41+Math.sin(t*1.6+i)*1.5,.32,.32,6,G.c,ok?1.7:1.2);nlight&&nlight(x+.5,y+.5,44,2.4,rgbOf(G.c),.7);return}
  if(c&&c[0]==='ⓒ'&&ZZ&&ZZ.cuore){const i=+c.slice(1),G=GEM80[i],ok=cu9().r[i];box(x+.15,y+.15,0,.7,.7,6,'#3a2a5a');box(x+.25,y+.25,6,.5,.5,26,'#2a1e44');box(x+.15,y+.15,32,.7,.7,2,'#d4af37');
    box(x+.3,y+.3,36+(ok?Math.sin(t*2+x)*2:0),.4,.4,8,ok?G.c:'#4a3e5a',ok?1.45:.9);if(ok){nlight&&nlight(x+.5,y+.5,40,3,rgbOf(G.c),.8);if(SET.ultra)GLOW.push([x+.5,y+.5,40,60,rgbOf(G.c),.4])}return}
  d0(x,y,c,h)}}
// gli oggetti degli enigmi
function cu9L(e){const i=e.r,G=i!=null?GEM80[i]:null,L=[],c=cu9(),q=(a,b,z,w,d,h,co,l)=>L.push([a,b,z,w,d,h,co,l]);
  if(e.s==='f7'){const on=cu9N()>=6,tk=!!c.f7;q(-.5,-.5,0,1,1,5,'#3a2a5a');q(-.4,-.4,5,.8,.8,18,'#2a1e44');q(-.5,-.5,23,1,1,2,'#d4af37');
    if(on&&!tk){const b=Math.sin(t*2)*2;q(-.14,-.14,30+b,.28,.28,12,'#ffffff',1.9);q(-.24,-.06,34+b,.48,.12,4,'#e8f4ff',1.6);for(let k=0;k<6;k++){const a=k/6*6.283+t*.6;q(Math.cos(a)*.6-.05,Math.sin(a)*.6-.05,32+Math.sin(t*3+k)*2,.1,.1,3,GEM80[k].c,1.6)}}
    else if(!on)for(let k=0;k<6;k++){const a=k/6*6.283;q(Math.cos(a)*.3-.05,Math.sin(a)*.3-.05,25,.1,.1,2,c.r[k]?GEM80[k].c:'#4a3e5a',c.r[k]?1.4:1)}return L}
  if(e.s==='bra'){const S=CU9S[0],st=S.st||RUB9S,lit=S.done||st[e.j];q(-.25,-.25,0,.5,.5,3,'#4a3640');q(-.12,-.12,3,.24,.24,12,'#5a4650');q(-.3,-.3,15,.6,.6,3,'#6a5660');
    if(lit){const f=.8+.3*Math.sin(t*7+e.j);q(-.18,-.18,18,.36,.36,6*f,'#ff6a1a',1.8);q(-.09,-.09,21,.18,.18,6*f,'#ffd84a',1.9)}
    else q(-.16,-.16,18,.32,.32,1,'#2a2028');
    if(S.hint&&!S.done){const s=rub9Sol(st);if(s[0]===e.j)q(-.36,-.36,0,.72,.72,.4,'#ffd84a',1.6+Math.sin(t*5)*.3)}return L}
  if(e.s==='pil'){const S=CU9S[5],on=S.lit===e.j||S.done,col=['#e6283a','#e8f4ff','#28d66e','#b06aff','#ffaa1e','#2a5ac8'][e.j];q(-.2,-.2,0,.4,.4,3,'#2a2a48');q(-.14,-.14,3,.28,.28,20,on?col:'#3a3a5a',on?1.7:1);q(-.2,-.2,23,.4,.4,2,'#4a4a6a');
    if(S.hint&&!S.done&&!S.play&&S.seq&&S.seq[S.in.length]===e.j&&t-S.idle>2.5)q(-.26,-.26,0,.52,.52,.4,col,1.5);return L}
  if(e.s==='alt'){const ok=c.r[i];q(-.35,-.35,0,.7,.7,4,'#3a2a5a');q(-.25,-.25,4,.5,.5,10,'#2a1e44');q(-.3,-.3,14,.6,.6,2,'#d4af37');q(-.13,-.13,17+(ok?Math.sin(t*2)*1.5:0),.26,.26,8,ok?G.c:'#4a3e5a',ok?1.6:1);return L}
  if(e.s==='ped'){const ok=c.r[i];q(-.3,-.3,0,.6,.6,3,'#3a2a5a');q(-.2,-.2,3,.4,.4,9,'#2a1e44');q(-.26,-.26,12,.52,.52,2,'#d4af37');q(-.1,-.1,14,.2,.2,5,ok?'#6a5a7a':G.c,ok?1:1.5);return L}
  return L}
function cu9TL(e){const S=CU9S[4],L=[],ok=TOP9.good[e.isl]===e.j,gl=S.hint&&ok&&!S.done;L.push([-.42,-.42,0,.84,.84,.4,'#ffaa1e',gl?1.9:1.3]);
  for(let k=0;k<6;k++){const a=k/6*6.283+t*(1.5+e.j);L.push([Math.cos(a)*.3-.04,Math.sin(a)*.3-.04,2+k*2,.08,.08,1.4,gl?'#ffffff':'#ffe08a',1.5])}return L}
function cu9DL(e){const L=[],q=(a,b,z,w,d,h,c,l)=>L.push([a,b,z,w,d,h,c,l]),bob=Math.sin(t*.7+e.ph);
  if(e.s==='cubo'){const s2=e.sz,z=e.z0+bob*6;q(-s2/2,-s2/2,z,s2,s2,s2*32,e.c,1.5);q(-s2/4,-s2/4,z+s2*32,s2/2,s2/2,s2*10,'#ffffff',1.6)}
  else if(e.s==='pietra'){const s2=e.sz*1.6,z=e.z0+bob*4;q(-s2/2,-s2/2,z,s2,s2,s2*18,'#2a2040');q(-s2/2,-s2/2,z+s2*18,s2,s2,2,'#4a3a6a')}
  else if(e.s==='filo'){const h=(t*20+e.ph*37)%120;q(-.03,-.03,-60+h,.06,.06,14,'#ffd84a',1.6)}return L}
{const e0=ent;ent=function(e){if(e&&e.k==='cu9d'){drawL(cu9DL(e),e.px,e.py,0,0);return}if(e&&e.k==='cu9'){
    // sull'altare di una stanza risolta, un raggio della sua luce che sale
    if(e.s==='alt'&&cu9().r[e.r]){const c=GEM80[e.r].c,a0=g.globalAlpha;g.globalAlpha=a0*.35;drawL([[-.12,-.12,22,.24,.24,90+Math.sin(t*2)*6,c,1.7]],e.px,e.py,0,0);g.globalAlpha=a0}drawL(cu9L(e),e.px,e.py,0,0);if(e.s==='f7'&&cu9N()>=6&&!cu9().f7)nlight&&nlight(e.px,e.py,36,4,'255,255,255',.9);
    if(!D3B&&e.tip&&dist(e,P)<2&&!cu9().r[e.r]){const sx=PX(e.px,e.py),sy=PY(e.px,e.py,0);g.textAlign='center';g.font='bold 10px Georgia,serif';label(e.tip,sx,sy-30,'#f0e8ff')}return}
  if(e&&e.k==='cu9t'){drawL(cu9TL(e),e.px,e.py,0,0);return}return e0(e)}}
// i ponti veri del Diamante, quando la sua luce li mostra (o con l'aiuto dell'Eco, appena), e il posto del prossimo blocco
// dell'Ametista: si disegnano sopra la scena, sullo schermo (lights() si chiama in ogni zona, nightDraw() solo all'aperto)
function cu9Tile(x,y,col){const[sx,sy]=scr(x+.5,y+.5,0);g.fillStyle=col;g.beginPath();g.moveTo(sx,sy-16*S);g.lineTo(sx+32*S,sy);g.lineTo(sx,sy+16*S);g.lineTo(sx-32*S,sy);g.fill()}
let FOG9=null;
function fog9Draw(){if(!FOG9){const r=sd(hs('nebbia89'));FOG9=[];for(let k=0;k<120;k++){const x=2+r()*60,y=2+r()*60;FOG9.push({x,y,v:r()<.55,sz:200+r()*280,sp:.15+r()*.35,ph:r()*6.28,c:r()<.75?'150,120,220':'230,190,110'})}}
  for(const f of FOG9){const x=f.x+Math.sin(t*f.sp*.3+f.ph)*3,y=f.y+Math.cos(t*f.sp*.25+f.ph)*2,ix=clamp(x|0,0,N-1),iy=clamp(y|0,0,N-1),onVoid=M[iy][ix]===9;
    if(f.v!==onVoid&&f.v)continue;const[sx,sy]=scr(x,y,onVoid?-20:4),R=f.sz*S*(onVoid?1:.6);if(sx<-R||sy<-R||sx>W+R||sy>H+R)continue;
    g.globalAlpha=(onVoid?.34:.13)*(.75+.25*Math.sin(t*.5+f.ph));g.drawImage(blobSpr(f.c),sx-R,sy-R*.55,R*2,R*1.1)}
  // i banchi che attraversano lo schermo piano, come nebbia che scorre
  const bs=blobSpr('170,150,230');for(let k=0;k<5;k++){const x=((t*9+k*330)%(W+700))-350,y=H*(.15+k*.18)+Math.sin(t*.3+k)*20;g.globalAlpha=.1;g.drawImage(bs,x-320,y-160,640,320)}
  // e un velo viola, più fitto ai bordi dello schermo
  const vg=g.createRadialGradient(W/2,H/2,Math.min(W,H)*.3,W/2,H/2,Math.max(W,H)*.75);vg.addColorStop(0,'rgba(40,20,70,0)');vg.addColorStop(1,'rgba(40,20,70,.45)');g.fillStyle=vg;g.fillRect(0,0,W,H);
  g.globalAlpha=1}
{const l0=lights;lights=function(){l0();try{if(Zk!=='cuore80'||!started||(typeof D3!=='undefined'&&D3.act))return;g.setTransform(DPR,0,0,DPR,0,0);if(SET.fx!==0)fog9Draw();
  const Q=CU9S[1];if(Q&&!Q.done){const rv=Q.rv&&t-Q.rv<3.5;if(rv||Q.hint){const a=rv?.55*Math.min(1,(3.5-(t-Q.rv))/.7):.13;
    for(let f=0;f<3;f++)for(let u=DIA9.lanes[f][0];u<=DIA9.lanes[f][1];u++){const[x,y]=C9W(1,u,DIA9.w[DIA9.ok[f]]);cu9Tile(x,y,`rgba(230,245,255,${a.toFixed(3)})`)}}}
  const A=CU9S[3];if(A&&A.hint&&!A.done){const s=AME9.sol[(A.put||[]).length];if(s){const[x,y]=C9W(3,s[0],s[1]);cu9Tile(x,y,`rgba(200,106,255,${(.25+.15*Math.sin(t*5)).toFixed(3)})`)}}}catch(_){}}}
// i cubi e le pietre che galleggiano nel vuoto sono solo da guardare: un clic lì vicino non li prende come bersaglio
{const n0=nearAt;nearAt=function(L,mx,my){return n0(Zk==='cuore80'?L.filter(e=>e.k!=='cu9d'):L,mx,my)}}
{const m0=mini;mini=function(){if(Zk!=='cuore80')return m0();const E0=ents;ents=ents.filter(e=>e.k!=='cu9d');try{m0()}finally{ents=E0}}}
/* ---- 8.9 · passo 2: il filmato del passaggio — il Cuore si scompone ----
   Quattro inquadrature disegnate apposta (FSET, come quelle del prologo):
   1. il piazzale del Cuore: l'eroe con il settimo frammento in mano, l'Eco accanto, le sei colonne accese;
   2. il Cuore si scompone: le caselle del pavimento si staccano dal bordo verso il centro e volano via in alto, girando,
      le colonne si sfaldano in cubi, e restano solo le stelle;
   3. nelle stelle: l'eroe sospeso, il frammento che brilla e le sei luci che gli girano intorno; l'Eco parla dei Fondatori
      e del Voxeliaverse;
   4. il buio, poi una luce calda: un camino acceso e una libreria che sale nel buio, e dietro, da una finestra rotonda,
      la Corona. È la stanza dietro la Corona (il passo successivo). */
const F9CELL=(()=>{const L=[],r=sd(hs('scomponi89'));for(let y=-6;y<=6;y++)for(let x=-6;x<=6;x++){const d=Math.hypot(x,y);if(d<=5.6)L.push({x,y,d,a:Math.atan2(y,x)+(r()-.5)*.6,sp:.7+r()*.7,rz:r()})}return L})();
const F9COL=()=>GEM80.map(q=>q.c);
// il settimo frammento: un cristallo trasparente, alto e stretto, che gira piano
function f9Frag(x,y,z,s,lt){const b=Math.sin(lt*2)*1.5;box(x-.1*s,y-.1*s,z+b,.2*s,.2*s,10*s,'#ffffff',1.9);box(x-.18*s,y-.05*s,z+3*s+b,.36*s,.1*s,4*s,'#e8f4ff',1.7);box(x-.05*s,y-.18*s,z+3*s+b,.1*s,.36*s,4*s,'#e8f4ff',1.7);fGlow(x,y,z+5*s,'255,255,255',38*s,.5)}
function f9Pill(x,y,c,al){box(x-.35,y-.35,0,.7,.7,6,'#3a2a5a');box(x-.25,y-.25,6,.5,.5,26,'#2a1e44');box(x-.35,y-.35,32,.7,.7,2,'#d4af37');box(x-.2,y-.2,36,.4,.4,8,c,1.5);if(al)fGlow(x,y,40,rgbOf(c),30,.35)}
FSET.cuore9=(S2,lt)=>{const C=F9COL();for(const q of F9CELL)box(q.x-.5,q.y-.5,-6,1,1,6,(q.x+q.y)&1?'#3a2a5a':'#34264f',.95);
  for(const q of F9CELL)if(Math.abs(q.d-3)<.5||Math.abs(q.d-5.2)<.45)box(q.x-.2,q.y-.2,0,.4,.4,.3,'#d4af37',1.15);
  for(let i=0;i<6;i++){const a=i/6*6.283-Math.PI/2+.5;f9Pill(Math.cos(a)*4.2,Math.sin(a)*4.2,C[i],1)}
  // la luce delle sei colonne che si unisce sopra l'eroe
  for(let i=0;i<6;i++){const a=i/6*6.283-Math.PI/2+.5,k=fSmooth(lt/3);for(let j=0;j<8;j++){const u=j/8*k;box(Math.cos(a)*4.2*(1-u)-.06,Math.sin(a)*4.2*(1-u)-.06,40+u*12,.12,.12,2,C[i],1.6)}}
  f9Frag(0,0,52,1,lt)};
FSET.scomp9=(S2,lt)=>{const C=F9COL(),T0=5.5;
  for(const q of F9CELL){const st=(5.8-q.d)/5.8*2.6,k=fSmooth((lt-st)/(1.8*q.sp));if(k>=1)continue;const r=q.d+k*9,x=Math.cos(q.a)*r,y=Math.sin(q.a)*r,z=-6+k*k*140+Math.sin(k*3+q.rz*6)*k*10,s2=1-k*.6;
    g.globalAlpha=1-k*.8;box(x-.5*s2,y-.5*s2,z,s2,s2,6*s2,(q.x+q.y)&1?'#3a2a5a':'#34264f',.95+k*.4);g.globalAlpha=1}
  for(let i=0;i<6;i++){const a=i/6*6.283-Math.PI/2+.5,k=fSmooth((lt-1.2-i*.25)/2.4);if(k>=1)continue;const x=Math.cos(a)*(4.2+k*7),y=Math.sin(a)*(4.2+k*7);
    if(k<=0){f9Pill(x,y,C[i],1);continue}for(let j=0;j<5;j++){const z=j*8+k*k*(100+j*25);g.globalAlpha=1-k;box(x-.3+j*.05,y-.3,z,.6-j*.08,.6-j*.08,7,j===4?C[i]:j%2?'#2a1e44':'#3a2a5a',j===4?1.5:1);g.globalAlpha=1}}
  f9Frag(0,0,52,1,lt)};
FSET.stelle9=(S2,lt)=>{const C=F9COL();for(let i=0;i<6;i++){const a=i/6*6.283+lt*.5,r=2.4+Math.sin(lt*.8+i)*.3;box(Math.cos(a)*r-.12,Math.sin(a)*r-.12,40+Math.sin(lt*1.5+i)*5,.24,.24,5,C[i],1.7);fGlow(Math.cos(a)*r,Math.sin(a)*r,42,rgbOf(C[i]),22,.4)}
  f9Frag(0,0,52,1.1,lt);for(let k=0;k<26;k++){const a=k*2.399,r=4+((k*37)%9),z=((lt*12+k*31)%180)-60;box(Math.cos(a)*r-.04,Math.sin(a)*r-.04,z,.08,.08,2,'#ffffff',1.4)}};
// la stanza dietro la Corona, come si vede la prima volta: un camino, una libreria, una finestra rotonda con la Corona
function f9Room(lt,al){const k=al==null?1:al;g.globalAlpha=k;
  for(let y=-4;y<=3;y++)for(let x=-5;x<=4;x++)box(x,y,-6,1,1,6,(x+y)&1?'#4a3424':'#432f20',.95);
  for(let x=-5;x<=4;x++){box(x,-5,0,1,.4,64,'#2a2030');box(x,-5,62,1,.5,3,'#3a2a3a')}
  // il camino, a sinistra: pietra, la mensola, il fuoco
  box(-4.6,-4.7,0,2.6,1,34,'#5a5058');box(-4.8,-4.9,34,3,1.3,3,'#6a5a5a');box(-4.1,-4.2,0,1.6,.6,16,'#1a1014');
  const f=.8+.25*Math.sin(lt*8)*Math.sin(lt*5.3);box(-3.8,-4,1,1,.3,9*f,'#ff7a1a',1.8);box(-3.6,-3.9,2,.6,.25,7*f,'#ffd84a',1.9);fGlow(-3.3,-3.7,8,'255,150,60',90,.55*k);
  // la libreria, a destra: ripiani fino al soffitto, libri di tutti i colori (alcuni brillano)
  box(-.6,-4.75,0,5.2,.7,60,'#4a2e1a');for(let s=0;s<6;s++){box(-.55,-4.4,4+s*9.5,5.1,.4,1,'#3a2414');for(let b=0;b<16;b++){const h=5+((b*7+s*3)%4),c=['#8a2a2a','#2a4a7a','#3a6a3a','#7a5a2a','#5a2a6a','#2a6a6a'][(b+s)%6],gl=((b*13+s*7)%11)===0;box(-.5+b*.31,-4.1,5+s*9.5,.26,.08,h,c,gl?1.3+.3*Math.sin(lt*3+b):1)}}
  // la finestra rotonda, in mezzo: fuori, nel buio, la Corona che gira piano
  for(let i=0;i<16;i++){const a=i/16*6.283;box(-1.9+Math.cos(a)*1.3,-4.8,30+Math.sin(a)*13,.3,.2,2.6,'#6a5a5a')}box(-2.6,-4.85,22,1.4,.1,16,'#0a0a1a');
  for(const b of fCrownL(lt*.5,F9COL(),.55,26))box(b[0]-1.9,b[1]-4.9,b[2],b[3],b[4],b[5],b[6],b[7]);fGlow(-1.9,-4.8,30,'255,216,74',40,.3*k);
  // il tappeto e la poltrona davanti al fuoco
  box(-4,-2.6,0,3,2,.3,'#6a1a2a');box(-3.8,-2.4,.3,2.6,1.6,.1,'#8a2a3a');box(-2.2,-1.6,0,1.2,1,8,'#5a2a1a');box(-2.3,-1.7,8,1.4,1.2,3,'#7a3a2a');box(-2.3,-.7,8,1.4,.3,12,'#7a3a2a');g.globalAlpha=1}
FSET.stanza9=(S2,lt)=>{const k=fSmooth((lt-1)/2.4);if(k<=0)return;f9Room(lt,k)};
FILMS.f7_scomponi={n:T88('Il settimo frammento','The Seventh Fragment'),mus:'intro',L:[
  {d:8,set:'cuore9',bg:['#0a0418','#2a0a3a'],stars:1,cam:[[0,0,1.25],[0,0,1.6]],who:T88('L\'Eco della Corona','The Echo of the Crown'),
    tx:T88('«Eccolo. Il frammento dei Fondatori. Le leggende di Eldora lo chiamavano la settima luce, quella che non ha colore e non ha padrone.»','“There it is. The Founders\' fragment. The legends of Eldora called it the seventh light, the one that has no color and belongs to no one.”'),
    act:[fA('h',{hero:1,p:[0,.2],f:'cam'}),fA('e',{n:'eco89',ghost:1,ghostC:'#ffe8a0',p:[1.6,1.2],f:'h'})]},
  {d:7.5,set:'scomp9',bg:['#05020c','#1a0828'],stars:1,cam:[[0,0,1.2],[0,0,.75]],
    tx:T88('Appena le tue dita lo toccano, il Cuore della Corona si scompone. Le caselle d\'oro si staccano dal bordo e volano via, le colonne si sfaldano in cubi. Il mondo che conoscevi si smonta come un giocattolo.','The moment your fingers touch it, the Heart of the Crown comes apart. The golden tiles break away from the edge and fly off, the columns crumble into cubes. The world you knew comes apart like a toy.'),
    act:[fA('h',{hero:1,p:[0,.2],f:'cam'}),fA('e',{n:'eco89',ghost:1,ghostC:'#ffe8a0',p:[1.6,1.2],f:'h',out:[2.5,2]})]},
  {d:9,set:'stelle9',bg:['#000000','#0a0418'],stars:1,cam:[[0,0,1.1],[0,0,1.45]],who:T88('La voce dell\'Eco','The Echo\'s voice'),
    tx:T88('«I Fondatori non hanno costruito un mondo: ne hanno costruiti tanti che nessuno li ha mai contati davvero. Il Voxeliaverse. Le sei schegge tengono insieme quello che conosci; il settimo tiene insieme tutti gli altri. Adesso è tuo. E le porte sono aperte.»','“The Founders didn\'t build a world: they built so many that no one has ever truly counted them. The Voxeliaverse. The six splinters hold together the one you know; the seventh holds together all the others. Now it\'s yours. And the doors are open.”'),
    act:[fA('h',{hero:1,p:[0,.2],f:'cam',zf:lt=>8+Math.sin(lt*.9)*3})]},
  {d:9,set:'stanza9',bg:['#000000','#120808'],cam:[[-.5,-1.5,1.05],[-.8,-2.2,1.35]],title:T88('IL VOXELIAVERSE','THE VOXELIAVERSE'),sub:T88('la stanza dietro la Corona','the room behind the Crown'),tt:3.2,
    tx:T88('Quando la luce torna sei in una stanza che non hai mai visto, eppure ti sembra di conoscerla: un camino acceso, una libreria che sale nel buio, e da una finestra rotonda, fuori, la Corona che gira piano.','When the light returns you are in a room you have never seen, yet it feels familiar: a lit fireplace, a bookcase rising into the dark, and through a round window, outside, the Crown slowly turning.'),
    act:[fA('h',{hero:1,p:[-1.2,-.6],f:'N',in:[1.2,1.6]})]}]};
// prendere il frammento: il filmato, poi i premi; la stanza dietro la Corona arriva con il passo successivo (f9After)
let f9After=null;
cu9Take=function(){const c=cu9(),first=!c.f7;const go=()=>{if(first){c.f7=Date.now();cu9Save(o=>{o.fin=o.fin||Date.now()});P.g+=20000;goldFly(20000);gainXP(8000);const it=item(Math.max(18,P.lv),3,'h');it.n=T88('Corona Riunita','Reunited Crown');it.hp=(it.hp||0)+200;
      if(P.inv.length<INV)P.inv.push(it);else ents.push({k:'dr',px:P.px,py:P.py,it});save();jingle([60,64,67,72,76,79,84,88,91],.1,'triangle');
      setTimeout(()=>banner(T88('Il settimo frammento','The Seventh Fragment'),T88('Il frammento dei Fondatori è tuo: 20.000 monete, la Corona Riunita e tanta esperienza','The Founders\' fragment is yours: 20,000 coins, the Reunited Crown and plenty of experience'),'corona'),600)}
    if(typeof f9After==='function')f9After(first)};
  if(SET.film===0){const T=ECO9.f7;PA={ti:T[0],sub:T[1],tx:T[2]};pn('txt');go();return}
  filmPlay('f7_scomponi',go)};
