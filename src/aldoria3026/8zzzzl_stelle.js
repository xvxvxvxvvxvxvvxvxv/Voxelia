/* ================= 8.2: Aldoria 3026 · Oltre il cielo =================
   La nave a salto Stella di Aldric, allo spazioporto: la mappa galattica con cinque sistemi, le sonde per scansionare i
   pianeti in cerca di minerali, otto pianeti dove atterrare ed esplorare (a piedi o con il rover), l'equipaggio, i
   potenziamenti della nave e una storia in sei missioni, «La rotta dei Costruttori».
   Si apre quando finisci le missioni della città (la Cronoporta). Tutto si salva dentro P.neo.sp. */
const SPV=82;
/* ---- la galassia: cinque sistemi, ognuno con i suoi pianeti ---- */
const SYS82=[
  {k:'sol',n:'Sole di Aldoria',x:.16,y:.64,c:'#ffd84a',d:'Casa. Lo spazioporto di Aldoria rifornisce la nave di carburante e sonde, gratis.',pl:[
    {k:'aldoria',n:'Aldoria',t:'casa',c:'#3a8ae0',r:.19,a:'Il pianeta della Corona. La città di vetro brilla anche da quassù.'},
    {k:'selene',n:'Selene',t:'luna',c:'#b8b8c4',r:.1,lv:6,land:1,a:'La luna di Aldoria. Miniere abbandonate dal 2900 e qualcosa che ci vive dentro.'}]},
  {k:'vesper',n:'Nebulosa di Vesper',x:.36,y:.3,c:'#ff8a4a',d:'Una nube arancione dove le navi si perdono. Al centro, un segnale vecchio di diecimila anni.',pl:[
    {k:'ardea',n:'Ardea',t:'deserto',c:'#d86a3a',r:.16,lv:9,land:1,a:'Dune rosse e torri di pietra nera. Il segnale viene da qui.'},
    {k:'vesper2',n:'Vesper II',t:'gas',c:'#e8b06a',r:.24,a:'Un gigante gassoso a strisce. Non si atterra, ma le sonde trovano molto Etere.'},
    {k:'brina',n:'Brina',t:'ghiaccio',c:'#bfe3f5',r:.13,lv:11,land:1,a:'Un mondo coperto di ghiaccio. Sotto, una stazione di ricerca muta da secoli.'}]},
  {k:'kharon',n:'Ammasso Kharon',x:.6,y:.6,c:'#c84aff',d:'Stelle viola e fabbriche grandi come lune. Qui comandano i Sintetici.',pl:[
    {k:'kharonp',n:'Kharon Prime',t:'macchina',c:'#6a5a8a',r:.17,lv:14,land:1,a:'Un pianeta trasformato in una sola, enorme fabbrica.'},
    {k:'ferro7',n:'Ferro-7',t:'asteroide',c:'#8a7a6a',r:.09,lv:13,land:1,a:'Un asteroide minerario pieno di Palladio. E di pirati.'},
    {k:'brace',n:'Brace',t:'lava',c:'#ff5a1a',r:.14,lv:16,land:1,a:'Fiumi di lava e cristalli di Platino che crescono sulle rocce calde.'}]},
  {k:'lumen',n:'Velo di Lumen',x:.8,y:.26,c:'#4affc0',d:'Una nebulosa verde che canta alle radio. Ci vive un popolo antico: i Lumari.',pl:[
    {k:'lumen',n:'Lumen',t:'giungla',c:'#2ac87a',r:.17,lv:18,land:1,a:'Una giungla di funghi luminosi alti come torri. Il villaggio dei Lumari è qui.'},
    {k:'specchio',n:'Specchio',t:'oceano',c:'#3ab8e8',r:.15,a:'Un oceano senza terra. Le sonde trovano Iridio sul fondale.'}]},
  {k:'abisso',n:'L\'Abisso Esterno',x:.9,y:.76,c:'#ff3a5a',d:'Oltre il bordo delle mappe. Nessuna nave è tornata indietro.',lock:1,pl:[
    {k:'soglia',n:'Ultima Soglia',t:'rovine',c:'#5a3a4a',r:.16,lv:21,land:1,a:'Le rovine dei Costruttori, quelli che forgiarono la Corona.'}]}];
const PL82={};SYS82.forEach((s,i)=>s.pl.forEach((p,j)=>{p.s=i;p.j=j;PL82[p.k]=p}));
/* ---- i biomi dei pianeti: colori, cielo, arredi, minerali, fauna ---- */
const BIO82={
  luna:{a:'#8a8a94',b:'#84848e',wl:'#5a5a64',sky:['#05050a','#0a0a14','#14141e'],pool:null,dec:{'㋀':.05,'㋄':.012,'㋅':.004},min:['iridio','palladio'],fa:[['ragno','golem_cr','Divoratore delle cave'],['scorpione_reale','ragno','Ragno lunare']],sin:.3},
  deserto:{a:'#c8783a',b:'#c27234',wl:'#6a3a2a',sky:['#3a1a10','#8a3a1a','#e8884a'],pool:null,dec:{'㋀':.035,'㋃':.008,'㋄':.006},min:['palladio','platino'],fa:[['scorpione_reale','salamandra','Scorpione delle dune'],['anubi','pantera48','Sciacallo di Ardea']],sin:.4},
  ghiaccio:{a:'#d8ecf4',b:'#d0e6f0',wl:'#8ab0c8',sky:['#0a1a2a','#3a6a8a','#bfe3f5'],pool:'#7ac8f0',dec:{'㋆':.03,'㋀':.02,'㋁':.008},min:['iridio','etere'],fa:[['lupo_cristallo','elem_ghiaccio','Lupo di brina'],['elem_ghiaccio','golem_cr','Spirito del gelo']],sin:.3},
  macchina:{a:'#3a3e4a',b:'#363a46',wl:'#2a2a34',sky:['#0a0614','#2a1a3a','#6a3a8a'],pool:null,dec:{'㋅':.03,'㋄':.03,'㋉':.006},min:['platino','iridio'],fa:[],sin:1},
  asteroide:{a:'#6a5e54',b:'#645850',wl:'#4a3e34',sky:['#000004','#04040c','#0c0a18'],pool:null,dec:{'㋀':.07,'㋁':.012,'㋄':.01},min:['palladio','palladio','iridio'],fa:[['ragno','scorpione_reale','Pirata delle rocce']],sin:.7},
  lava:{a:'#3a2a26',b:'#362622',wl:'#2a1a16',sky:['#1a0604','#4a1408','#a83a10'],pool:'#ff6a1a',dec:{'㋇':.02,'㋀':.03,'㋁':.012},min:['platino','etere'],fa:[['salamandra','golem_magma','Salamandra di Brace'],['golem_magma','scorpione_reale','Colosso di magma']],sin:.3},
  giungla:{a:'#2a4a3a',b:'#284636',wl:'#1a3a2a',sky:['#04140e','#0a3a2a','#2ac87a'],pool:'#2a9ab0',dec:{'㋈':.03,'㋂':.035,'㋀':.01},min:['etere','iridio'],fa:[['pantera48','scimmia48','Predatore di Lumen'],['scimmia48','ragno','Saltatore dei funghi']],sin:0},
  rovine:{a:'#4a3a44',b:'#463640',wl:'#2a1a24',sky:['#08020a','#2a0a1a','#5a1a3a'],pool:null,dec:{'㋃':.03,'㋀':.02,'㋁':.01},min:['etere','platino'],fa:[['lich','spettro_cristallo','Eco dei Costruttori']],sin:.8}};
const MIN82={iridio:{n:'Iridio',c:'#7ac8ff'},palladio:{n:'Palladio',c:'#e8d8a8'},platino:{n:'Platino',c:'#f0f0ff'},etere:{n:'Etere',c:'#c46bff'}};
/* ---- i potenziamenti della nave, in ingegneria ---- */
const UP82={
  serb:{n:'Serbatoio maggiorato',d:'+2 di carburante: più salti prima di tornare a casa.',c:{palladio:250,iridio:150}},
  scan:{n:'Scanner a lungo raggio',d:'Le sonde trovano il 30% di minerali in più, e se ne portano 5 di più.',c:{iridio:300,palladio:100}},
  scudo:{n:'Barriera personale',d:'Lo scudo energetico che indossi tiene 25 punti in più.',c:{platino:250,etere:60}},
  armi:{n:'Acceleratore di particelle',d:'Nel 3026 tutte le tue armi fanno il 15% di danni in più.',c:{palladio:350,platino:150}},
  cor:{n:'Corazza di Kharon',d:'Lo scafo regge alle tempeste dell\'Abisso. Senza, la nave non ci passa.',c:{platino:450,iridio:300,etere:80},req:3},
  bar:{n:'Barriera della nave',d:'Uno scudo intorno alla nave, per arrivare vivi all\'Ultima Soglia.',c:{etere:200,palladio:400},req:3}};
/* ---- la storia: «La rotta dei Costruttori» ---- */
const SPM82=[
  {n:'Oltre il cielo',g:'elara55',tx:'Nei dati del Corvo c\'è una rotta che non porta a nessuna città: porta fra le stelle. La Corona non è nata su Aldoria, l\'hanno portata qui. Allo spazioporto c\'è la Stella di Aldric, la prima nave a salto della città. Il Consiglio non la vuole far volare. Io te ne do le chiavi.',
    st:[{k:'zona',z:'neo_nave',tx:'Sali sulla Stella di Aldric, allo spazioporto'},{k:'sis',s:1,tx:'Dalla mappa galattica, in plancia, salta nella Nebulosa di Vesper'}],rw:1500},
  {n:'Il Faro di Ardea',g:'iris82',tx:'Comandante, il segnale viene da Ardea, nel sistema dove siamo. È un faro: chiama qualcuno, da diecimila anni. Propongo di atterrare e di vedere chi risponde.',
    st:[{k:'zona',z:'pl82_ardea',tx:'Atterra su Ardea (mappa galattica → Ardea → Atterra)'},{k:'rel',z:'pl82_ardea',tx:'Raggiungi il Faro dei Costruttori, fra le torri di pietra nera'},{k:'boss',z:'pl82_ardea',b:'guard82',tx:'Sconfiggi il Guardiano del Faro'}],rw:2500,
    fine:'Nel Faro c\'è una mappa di luce: quattro stelle, e una quinta che lampeggia oltre il bordo. Accanto, una parola che IRIS traduce come «Costruttori». E un\'altra: «Kharon».'},
  {n:'Il mondo-macchina',g:'vera82',tx:'Kharon. Lo conosco: un ammasso di fabbriche che si costruiscono da sole. I Sintetici non parlano con nessuno, sparano e basta. Se la mappa del Faro dice Kharon, andiamo a Kharon. Ma tieni il dito sul grilletto.',
    st:[{k:'sis',s:2,tx:'Salta nell\'Ammasso Kharon'},{k:'zona',z:'pl82_kharonp',tx:'Atterra su Kharon Prime'},{k:'kill',z:'pl82_kharonp',n:8,tx:'Distruggi la guarnigione dei Sintetici intorno alla fabbrica'},{k:'parla',id:'ferro82',z:'pl82_kharonp',tx:'Libera l\'androide prigioniero, vicino alla fabbrica'}],rw:3500,
    fine:'L\'androide si chiama Ferro. È un Sintetico che ha smesso di obbedire, e per questo lo tenevano in catene. Sale a bordo: «I Costruttori? Noi li chiamiamo i Primi. I Lumari ricordano dove sono andati.»'},
  {n:'Il popolo della luce',g:'ferro82',tx:'I Lumari vivono nel Velo di Lumen, su un mondo di funghi che brillano. Sono antichi quanto le stelle, e non amano le visite. Ma un Divoratore sta mangiando i loro villaggi: forse ci ascolteranno, se li aiutiamo.',
    st:[{k:'sis',s:3,tx:'Salta nel Velo di Lumen'},{k:'zona',z:'pl82_lumen',tx:'Atterra su Lumen'},{k:'parla',id:'thalen82',z:'pl82_lumen',tx:'Trova il villaggio dei Lumari e parla con Thal\'en'},{k:'boss',z:'pl82_lumen',b:'divor82',tx:'Abbatti il Divoratore che minaccia il villaggio'}],rw:4500,
    fine:'Thal\'en, la custode dei Lumari, ti consegna un cristallo verde. «I Primi sono andati oltre il bordo, all\'Ultima Soglia. Hanno lasciato là il loro Araldo, a guardia della porta. Vengo con te.» Sulla mappa galattica si accende l\'Abisso Esterno.'},
  {n:'Pronti per l\'Abisso',g:'thalen82',tx:'Nell\'Abisso le tempeste di particelle strappano gli scafi come foglie. La tua nave non ci arriva così. Servono la Corazza di Kharon e una Barriera: Ferro sa costruirle, ma servono minerali. Scansiona i pianeti con le sonde e monta i due potenziamenti in ingegneria.',
    st:[{k:'up',u:'cor',tx:'In ingegneria monta la Corazza di Kharon (minerali dalle sonde e dai pianeti)'},{k:'up',u:'bar',tx:'In ingegneria monta la Barriera della nave'}],rw:3000},
  {n:'L\'Ultima Soglia',g:'iris82',tx:'Corazza e barriera al cento per cento, Comandante. Rotta tracciata per l\'Abisso Esterno. L\'equipaggio è pronto. Dopo il salto non potremo più cambiare idea.',
    st:[{k:'sis',s:4,tx:'Salta nell\'Abisso Esterno'},{k:'zona',z:'pl82_soglia',tx:'Atterra sull\'Ultima Soglia'},{k:'rel',z:'pl82_soglia',tx:'Raggiungi il cuore delle rovine dei Costruttori'},{k:'boss',z:'pl82_soglia',b:'araldo82',tx:'Sconfiggi l\'Araldo dei Costruttori'}],rw:12000,end:1}];
/* ---- lo stato: dentro P.neo.sp, così si salva con il resto del 3026 ---- */
function spFix(){const o=nmFix();const s=o.sp=o.sp||{};s.m=s.m|0;if(s.st==null)s.st=-1;s.loc=s.loc||{s:0,p:0};s.up=s.up||{};s.res=s.res||{};for(const k in MIN82)s.res[k]=s.res[k]|0;
  s.fmax=4+(s.up.serb?2:0);if(s.fuel==null)s.fuel=s.fmax;s.smax=10+(s.up.scan?5:0);if(s.son==null)s.son=s.smax;s.dep=s.dep||{};s.rel=s.rel||{};s.crew=s.crew||{};s.vis=s.vis||{};s.sc=s.sc||{};return s}
const spOpen=()=>{const o=nmFix();return(o.m|0)>=NMS.length};
const spCur=()=>{const s=spFix();return s.st>=0?SPM82[s.m]:null};
const spUp=k=>!!(P&&P.neo&&P.neo.sp&&P.neo.sp.up&&P.neo.sp.up[k]);
const spZone=()=>!!(ZZ&&ZZ.sp82);
/* ---- i nemici: i Sintetici, i guardiani dei Costruttori, la fauna aliena ---- */
Object.assign(E,{
  sint82:{n:'Sintetico',hp:70,at:11,xp:24,sp:2.3,r:5.5,cd:1.35,ag:11,rng:'#ff3a3a',m:neoBot({seed:'sint82',c:'#3a3e4a',e:'#ff3a3a',x:[['hd',-.04,-.02,30,.08,.08,5,'#ff3a3a']]})},
  sintp82:{n:'Sintetico pesante',hp:190,at:17,xp:40,sp:1.8,r:1.4,cd:1.2,ag:9,m:neoBot({seed:'sintp82',c:'#2a2a34',e:'#ff6a1a',s:1.3,x:[['bd',-.26,-.16,14,.52,.32,6,'#4a4a56']]})},
  drone82:Object.assign({},E.neo_drone,{n:'Drone sentinella'}),
  guard82:{n:'Guardiano del Faro',hp:1500,at:22,xp:900,sp:1.7,r:5,cd:1.3,ag:14,boss:1,slam:1,rng:'#ffd84a',sum:'drone82',m:neoBot({seed:'guard82',c:'#2a2a2a',e:'#ffd84a',s:1.7,x:[['hd',-.17,-.15,30,.34,.3,2,'#d4af37'],['bd',-.24,.13,11,.48,.02,9,'#d4af37']]})},
  araldo82:{n:'L\'Araldo dei Costruttori',hp:3600,at:30,xp:3000,sp:1.6,r:6,cd:1.2,ag:20,boss:1,slam:1,rng:'#ff3a5a',sum:'sint82',m:neoBot({seed:'araldo82',c:'#4a1a2a',e:'#ff3a5a',s:2.1,x:[['hd',-.2,-.18,30,.4,.36,3,'#d4af37'],['hd',-.05,-.05,33,.1,.1,6,'#ff3a5a'],['bd',-.27,.14,8,.54,.02,12,'#ff3a5a']]})}});
// la fauna: chimere di creature che già ci sono, con un nome alieno
const FA82={};
for(const b in BIO82)for(const[a,c,n]of BIO82[b].fa){const k='fa82_'+n.toLowerCase().replace(/[^a-z]+/g,'_');if(!E[a]||!E[c])continue;let m=E[a].m;try{const q=petChim(E[a].m,E[c].m);if(q)m=q}catch(_){}
  E[k]=Object.assign({},E[a],{n,m,boss:0,sum:0,xp:Math.round((E[a].xp||20)*1.2)});(FA82[b]=FA82[b]||[]).push(k)}
E.divor82=Object.assign({},E.pantera48||E.lupo_cristallo,{n:'Il Divoratore',hp:2200,at:26,xp:1400,sp:2.2,r:1.8,cd:1.1,ag:16,boss:1,slam:1,sum:FA82.giungla&&FA82.giungla[1]||0,m:(()=>{try{return petChim((E.pantera48||E.lupo_cristallo).m,E.drago_brina?E.drago_brina.m:E.ragno.m)||E.ragno.m}catch(_){return E.ragno.m}})()});
/* ---- l'equipaggio ---- */
Object.assign(NPCS,{
  iris82:{n:'IRIS, l\'intelligenza della nave',c:'#2affff',hat:'#2affff',ln:['Tutti i sistemi sono verdi, Comandante.','La mappa galattica è in plancia. Io sono dappertutto.']},
  vera82:{n:'Vera Kade, la pilota',c:'#3a5a8a',hat:'#d84a3a',ln:['Questa nave è la cosa più bella che abbia mai pilotato. Non dirlo a Nino.','Dammi una rotta e ti porto ovunque. Il ritorno, quello è un problema tuo.']},
  ferro82:{n:'Ferro, il Sintetico libero',c:'#8a94a4',hat:'#ffd84a',ln:['Grazie per le catene. Cioè: grazie per avermele tolte.','Posso costruire qualunque cosa, con i minerali giusti. Portameli in ingegneria.']},
  thalen82:{n:'Thal\'en dei Lumari',c:'#5aa0e8',hat:'#e8e0ff',ln:['Le stelle cantano, se sai ascoltare.','La mia gente era vecchia già quando la tua accendeva i primi fuochi.']}});
function crewModel(id){const P2={iris82:()=>neoBot({seed:'iris82',c:'#5adcff',e:'#ffffff'}),vera82:()=>neoMan({seed:'vera82',tp:'#3a5a8a',lg:'#1a2a3a',novis:1,x:[['bd',-.215,-.115,17,.43,.25,.8,'#d84a3a']]}),
  ferro82:()=>neoBot({seed:'ferro82',c:'#8a94a4',e:'#ffd84a'}),thalen82:()=>neoMan({seed:'thalen82',sk:'#5aa0e8',tp:'#e8e0ff',lg:'#3a2a6a',novis:1,x:[['hd',-.18,-.02,26,.06,.06,8,'#8affe0'],['hd',.12,-.02,26,.06,.06,8,'#8affe0'],['hd',-.05,-.14,30,.1,.1,4,'#8affe0']]})};
  return(P2[id]||P2.vera82)()}
function crewNpc(id,x,y){const e=mkNpc(id,x,y,{});e.m=crewModel(id);e.neo=1;e.crew82=1;return e}
// le battute dell'equipaggio cambiano con la storia
function crewLines(){const s=spFix(),m=s.m;
  NPCS.iris82.ln=m<2?['Il Faro di Ardea chiama da diecimila anni. Forse qualcuno dovrebbe rispondere.','La mappa galattica è in plancia: tocca il tavolo olografico.']:m<4?['Ho tradotto un frammento del Faro: «Abbiamo forgiato la Corona per chi verrà dopo».','I minerali si trovano con le sonde. La scansione è dalla mappa galattica.']:m<6?['Le tempeste dell\'Abisso misurano diecimila volte quelle di Kharon. Servono corazza e barriera.','Ho calcolato le probabilità di tornare. Preferisco non dirtele.']:['L\'Araldo è caduto. Per la prima volta in diecimila anni la porta è aperta.','La galassia è tua, Comandante. Ci sono ancora pianeti da scansionare.'];
  NPCS.vera82.ln=m<3?['Kharon? Lì le fabbriche si costruiscono da sole. Brutta gente.','Sai cos\'è il bello del salto? Per un secondo non sei da nessuna parte.']:['Con la Corazza di Kharon questa nave potrebbe attraversare una stella. Quasi.','Ferro mi ha sistemato i comandi. Non chiedermi come: non li riconosco più.']}
/* ---- la nave: interno ---- */
Z.neo_nave={n:'Stella di Aldric',lv:5,N:26,a:'#3a3e48',b:'#363a44',wl:'#5a606c',wh:40,bg:'#05050c',mus:'stelle82',gen:a=>naveGen(a),dist:1,sp82:1,nave82:1,nolamp:1,rd:['#2a2e38','#282c36']};
SKY.neo_nave=['#020208','#05050c','#0a0a18'];
TRK.stelle82={bpm:76,root:45,sc:'min',pr:[0,3,5,2,0,6,5,4],ld:'triangle',dn:.75,dr:2,bs:[0,7,12,7],arp:1,pad:1};
const NAVP={};
function naveGen({R4,D,n}){
  // pavimento a corsie: il corridoio centrale e le stanze ai lati, separate da paratie
  for(let y=1;y<n-1;y++)for(let x=1;x<n-1;x++)M[y][x]=0;
  const wallH=(x0,x1,y,gap)=>{for(let x=x0;x<=x1;x++)if(!(gap&&gap.includes(x))){M[y][x]=6;DEC[y][x]='㊄'}},wallV=(x,y0,y1,gap)=>{for(let y=y0;y<=y1;y++)if(!(gap&&gap.includes(y))){M[y][x]=6;DEC[y][x]='㊄'}};
  // plancia in alto (y 1-7), corridoio (y 8-17), stanze a sinistra e a destra, hangar in basso
  wallH(1,24,7,[11,12,13,14]);wallV(8,8,18,[12,13]);wallV(17,8,18,[12,13]);wallH(1,24,19,[11,12,13,14]);
  // vetrate sulle stelle lungo la prua
  for(let x=4;x<=21;x+=3){M[1][x]=6;DEC[1][x]='㊅'}
  // la plancia: il tavolo della mappa, la postazione della pilota, il nucleo di IRIS
  D(12,4,'㊀');NAVP.mappa=[12,5];ents.push({k:'neos',st:'gal82',n:'Mappa galattica',px:12.5,py:5.5});
  D(20,3,'㊁');D(4,3,'㊁');ents.push(crewNpc('vera82',20,4));
  D(6,5,'㊉');ents.push(crewNpc('iris82',7,5));
  // ingegneria a sinistra: il nucleo del motore e la console dei potenziamenti
  D(3,10,'㊈');D(3,15,'㊈');D(6,9,'㊁');ents.push({k:'neos',st:'ing82',n:'Ingegneria',px:6.5,py:10.5});
  // armeria e infermeria a destra
  D(22,9,'㊂');D(23,9,'㊂');ents.push({k:'neos',st:'arm',n:'Armeria',px:22.5,py:10.5});
  D(22,15,'㊃');D(23,17,'㊃');ents.push({k:'neos',st:'med82',n:'Infermeria',px:21.5,py:15.5});
  // gli alloggi nel corridoio: casse e cuccette
  for(const[x,y]of[[10,9],[15,9],[10,17],[15,17]])D(x,y,y<12?'㊆':'㊇');
  // l'equipaggio che si è unito
  const s=spFix();if(s.crew.ferro)ents.push(crewNpc('ferro82',5,12));if(s.crew.thalen)ents.push(crewNpc('thalen82',19,12));
  // l'hangar e il portello
  D(5,22,'㊆');D(6,22,'㊆');D(19,22,'㊆');ents.push({k:'neos',st:'port82',n:'Portello',px:12.5,py:23.5});NAVP.portello=[12,22];
  for(const x of[10,15])D(x,23,'㋉');
  return[12,21]}
/* ---- i pianeti: una zona per ogni pianeta dove si atterra ---- */
const PLP={};// i posti importanti di ogni pianeta: atterraggio, rovine, accampamento, villaggio
for(const p of Object.values(PL82)){if(!p.land)continue;const B=BIO82[p.t],S=SYS82[p.s];
  Z['pl82_'+p.k]={n:p.n+' · '+S.n,lv:p.lv,N:56,a:B.a,b:B.b,wl:B.wl,wh:16,bg:B.sky[1],mus:'stelle82',gen:a=>plGen(p.k,a),dist:1,sp82:1,pl82:p.k,bt:p.t,nolamp:1,pool:B.pool||undefined,rd:[shx(B.a,.85),shx(B.a,.8)]};
  SKY['pl82_'+p.k]=B.sky}
function plGen(pk,{R4,D,F,RS,EN,n}){const p=PL82[pk],B=BIO82[p.t],P2=PLP[pk]={},cc=n>>1;const s=spFix();
  for(let y=1;y<n-1;y++)for(let x=1;x<n-1;x++)M[y][x]=0;
  // laghi (acqua, ghiaccio sciolto, lava): macchie irregolari
  if(B.pool)for(let i=0;i<4;i++){const lx=6+Math.floor(R()*(n-12)),ly=6+Math.floor(R()*(n-20)),r=2+R()*3;for(let y=-6;y<=6;y++)for(let x=-6;x<=6;x++){const q=Math.hypot(x,y*1.3)+hh(lx+x,ly+y)*1.5;if(q<r&&lx+x>1&&ly+y>1&&lx+x<n-2&&ly+y<n-2)M[ly+y][lx+x]=2}}
  // la piazzola di atterraggio, in basso al centro, libera
  const lx=cc,ly=n-8;P2.land=[lx,ly];for(let y=ly-3;y<=ly+3;y++)for(let x=lx-4;x<=lx+4;x++){M[y][x]=4;DEC[y][x]=''}
  for(const[a,b]of[[-4,-3],[4,-3],[-4,3],[4,3]]){M[ly+b][lx+a]=6;DEC[ly+b][lx+a]='㋉'}
  ents.push({k:'neos',st:'nav82',n:'Navetta · torna sulla nave',px:lx+.5,py:ly-.5});
  ents.push(carMk('pick',lx+2.5,ly+1.5,-Math.PI/2,{n:'Rover M-26',col:'#d8d0c0',rov82:1}));
  // le rovine dei Costruttori (in alto), l'accampamento (a sinistra o a destra), il villaggio dei Lumari
  const rx=10+Math.floor(R()*(n-20)),ry=7+Math.floor(R()*6);P2.ruin=[rx,ry];
  for(let y=ry-4;y<=ry+4;y++)for(let x=rx-5;x<=rx+5;x++)if(x>1&&y>1&&x<n-2){M[y][x]=Math.hypot(x-rx,(y-ry)*1.2)<4.6?4:M[y][x]===2?0:M[y][x];DEC[y][x]=''}
  for(let i=0;i<10;i++){const a=i/10*6.283,x=Math.round(rx+Math.cos(a)*5),y=Math.round(ry+Math.sin(a)*4);if(x>1&&y>1&&x<n-2&&(i%3))F(x,y,'㋃')}
  const left=R()<.5,ax=left?8+Math.floor(R()*6):n-14+Math.floor(R()*6),ay=n>>1;P2.camp=[ax,ay];
  for(let y=ay-3;y<=ay+3;y++)for(let x=ax-3;x<=ax+3;x++){if(M[y][x]===2)M[y][x]=0;DEC[y][x]='';if(M[y][x]===6)M[y][x]=0}
  for(const[a,b]of[[-3,-2],[3,-2],[-3,2],[3,2],[0,-3]])D(ax+a,ay+b,p.t==='giungla'?'㋈':'㋄');
  if(p.t==='giungla'){const vx=left?n-14:12,vy=(n>>1)+4;P2.vill=[vx,vy];for(let y=vy-3;y<=vy+3;y++)for(let x=vx-4;x<=vx+4;x++){M[y][x]=4;DEC[y][x]=''}for(const[a,b]of[[-4,-3],[4,-3],[-4,3],[4,3],[0,-3]])F(vx+a,vy+b,'㋊');
    if(!s.crew.thalen)ents.push(crewNpc('thalen82',vx,vy));for(let i=0;i<3;i++){const e=mkNpc('lum82_'+i,vx-2+i*2,vy+1,{wd:1});e.m=crewModel('thalen82');e.n='Lumaro';ents.push(e)}}
  if(pk==='kharonp'&&!s.crew.ferro){const e=crewNpc('ferro82',ax,ay);ents.push(e);for(const[a,b]of[[-1,0],[1,0]])F(ax+a,ay+b,'㋋')}
  // gli arredi del bioma
  for(let y=2;y<n-2;y++)for(let x=2;x<n-2;x++){if(M[y][x]!==0||DEC[y][x])continue;let r=R();for(const c in B.dec){if(r<B.dec[c]){D(x,y,c);break}r-=B.dec[c]}}
  // la reliquia, sui pianeti della storia
  if(pk==='ardea'||pk==='soglia'){if(!s.rel['pl82_'+pk])ents.push({k:'rel82',n:pk==='ardea'?'Il Faro dei Costruttori':'Il cuore della Soglia',px:rx+.5,py:ry+.5})}
  // i minerali da raccogliere: cristalli sparsi
  for(let i=0;i<12;i++){const x=3+Math.floor(R()*(n-6)),y=3+Math.floor(R()*(n-6));if(M[y][x]===0&&!DEC[y][x]&&Math.hypot(x-lx,y-ly)>6){const r=B.min[Math.floor(R()*B.min.length)];ents.push({k:'min82',r,n:MIN82[r].n,px:x+.5,py:y+.5,q:20+Math.floor(R()*30)})}}
  // i nemici: Sintetici e fauna, a gruppi, lontani dalla piazzola
  const pool=[];const fa=FA82[p.t]||[];for(let i=0;i<10;i++)pool.push(R()<B.sin||!fa.length?(R()<.25?'sintp82':R()<.3?'drone82':'sint82'):fa[Math.floor(R()*fa.length)]);
  const grp=[[ax,ay],[rx,ry+6],[8+Math.floor(R()*(n-16)),n>>2],[8+Math.floor(R()*(n-16)),(n>>1)+6]];let gi=0;
  for(const k of pool){const[gx,gy]=grp[gi++%grp.length];for(let t2=0;t2<12;t2++){const x=gx+Math.floor(R()*7)-3,y=gy+Math.floor(R()*7)-3;if(x>1&&y>1&&x<n-2&&y<n-2&&M[y][x]===0&&!DEC[y][x]&&Math.hypot(x-lx,y-ly)>9){EN(k,x,y);break}}}
  return[lx,ly+1]}
for(let i=0;i<3;i++)NPCS['lum82_'+i]={n:'Lumaro',c:'#5aa0e8',hat:'#e8e0ff',ln:[['Thal\'en parla per tutti noi.','Il Divoratore viene dal buio dei funghi. Ogni notte è più vicino.','La tua nave fa rumore. Le stelle non fanno rumore.'][i]]};
/* ---- andare e venire: città → nave → pianeti ---- */
// 8.3: i nemici di una missione non si salvano: ogni volta che arrivi in un posto (o riprendi la partita) tornano al loro posto,
// invece di dare il passo per già fatto
function spGo(k,at){if(NEO.car)carExit();const s=spFix();s.ms=0;if(Z[k]&&Z[k].pl82){const p=PL82[Z[k].pl82];Z[k].lv=Math.max(p.lv,(P.lv|0)-1)}
  cl();load(k);let q=at;if(!q){if(k==='neo_nave')q=[NAVP.portello[0],NAVP.portello[1]-1];else if(Z[k]&&Z[k].pl82){const L=PLP[Z[k].pl82].land;q=[L[0],L[1]+1]}else if(k==='neo_city'&&NPOI.porto)q=[NPOI.porto[0],NPOI.porto[1]+2]}
  if(q){P.px=q[0]+.5;P.py=q[1]+.5;P.path=[];P.tg=null;camX=PX(P.px,P.py);camY=PY(P.px,P.py,10)}
  s.z=k==='neo_city'?'':k;if(Z[k]&&Z[k].pl82){const pk=Z[k].pl82;if(!s.vis[pk]){s.vis[pk]=1;banner('🪐 '+PL82[pk].n,PL82[pk].a,'stella')}else banner('🪐 '+PL82[pk].n,'Livello '+ZZ.lv,'stella')}
  spSpawn();crewLines();save();hud&&hud()}
// in città: l'imbarco allo spazioporto, e la nave posata sulla banchina
{const l0=loadPost;loadPost=function(k){l0(k);try{if(MODE!=='neo')return;if(k==='neo_city'&&NPOI.porto){const[x,y]=NPOI.porto;ents.push({k:'neos',st:'nave82',n:'Stella di Aldric · imbarco',px:x+.5,py:y+2.5},{k:'ship82',px:x+.5,py:y-1})}}catch(e){console.warn('Oltre il cielo',e)}}}
const SPT=(h,b)=>`<h3>${h}</h3>${b}<button onclick="cl()">Chiudi</button>`;
X43P.neo_nave82=()=>{if(!spOpen()){const o=nmFix();return SPT('🚀 Stella di Aldric',`<p class="x43t">La prima nave a salto di Aldoria, ferma sulla banchina. I tecnici dello spazioporto non ti fanno salire: «Ordini del Consiglio. Solo chi ha salvato la città.»</p><p class="mu">Finisci le missioni della città per salirci (${o.m|0}/${NMS.length}).</p>`)}
  return SPT('🚀 Stella di Aldric',`<p class="x43t">Lo scafo bianco e oro, i motori ancora tiepidi, il portello che si apre quando ti avvicini. IRIS ti saluta dagli altoparlanti: «Bentornato, Comandante.»</p><button onclick="spFix().loc={s:0,p:0};spGo('neo_nave')">🚀 Sali a bordo</button>`)};
X43P.neo_port82=()=>{const s=spFix(),S=SYS82[s.loc.s],p=S.pl[s.loc.p]||S.pl[0];let b=`<p class="x43t">Sei in orbita intorno a <b>${esc(p.n)}</b>, nel sistema ${esc(S.n)}.</p>`;
  if(p.t==='casa')b+=`<button onclick="spGo('neo_city')">🏙 Scendi ad Aldoria, allo spazioporto</button>`;else if(p.land)b+=`<button onclick="spGo('pl82_${p.k}')">🛬 Scendi su ${esc(p.n)} con la navetta</button>`;else b+=`<p class="mu">Su ${esc(p.n)} non si può atterrare. Dalla mappa galattica scegli un altro pianeta.</p>`;
  return SPT('🚪 Portello',b+`<button onclick="cl();gxOpen()">🌌 Apri la mappa galattica</button>`)};
X43P.neo_nav82=()=>SPT('🛸 Navetta',`<p class="x43t">La navetta ti riporta in orbita, sulla Stella di Aldric.</p><button onclick="spGo('neo_nave')">🚀 Torna sulla nave</button>`);
X43P.neo_gal82=()=>{setTimeout(()=>{cl();gxOpen()},0);return'<p>…</p>'};
X43P.neo_med82=()=>SPT('✚ Infermeria',`<p class="x43t">Il lettino ti scansiona e le nanocure fanno il resto. A bordo non si paga.</p><button onclick="P.hp=P.mx;P.pot=Math.max(P.pot,3);hud();tone(660,.15,'triangle');pn('neo_med82')">✚ Cure complete${P.hp<P.mx?'':' (sei già in forma)'}</button>`);
// ingegneria: i potenziamenti, le sonde, il carburante
function spCost(c){return Object.entries(c).map(([k,v])=>`<span style="color:${MIN82[k].c}">${v} ${MIN82[k].n}</span>`).join(' · ')}
function spHave(c){const s=spFix();return Object.entries(c).every(([k,v])=>(s.res[k]|0)>=v)}
function spBuild(k){const s=spFix(),u=UP82[k];if(!u||s.up[k]||!spHave(u.c))return;if(u.req&&s.m<u.req)return;for(const[r,v]of Object.entries(u.c))s.res[r]-=v;s.up[k]=1;spFix();if(k==='serb')s.fuel=s.fmax;if(k==='scan')s.son=s.smax;
  jingle([60,67,72,79],.1,'triangle');banner('🔧 '+u.n,u.d,'stella');spCheck();save();pn('neo_ing82')}
X43P.neo_ing82=()=>{const s=spFix();let h=`<h3>🔧 Ingegneria · ₡ ${P.g.toLocaleString('it-IT')}</h3><p class="mu">${Object.keys(MIN82).map(k=>`<span style="color:${MIN82[k].c}">${MIN82[k].n} ${s.res[k]}</span>`).join(' · ')}</p>`;
  h+=`<p class="mu">⛽ Carburante ${s.fuel}/${s.fmax} · 📡 Sonde ${s.son}/${s.smax}${s.loc.s===0?' · al Sole di Aldoria il rifornimento è gratis':''}</p>`;
  h+=`<button onclick="spBuy('son')" ${s.son>=s.smax?'disabled':''}>📡 Una sonda · 20 ₡</button><button onclick="spBuy('fuel')" ${s.fuel>=s.fmax?'disabled':''}>⛽ Una cella di carburante · ${s.loc.s===0?100:300} ₡</button><h4>Potenziamenti</h4>`;
  for(const[k,u]of Object.entries(UP82)){const ok=!s.up[k]&&spHave(u.c)&&!(u.req&&s.m<u.req);h+=`<div class="qb"><b>${s.up[k]?'✅ ':''}${esc(u.n)}</b><p>${esc(u.d)}</p><span class="mu">${s.up[k]?'Montato':u.req&&s.m<u.req?'Serve qualcuno che sappia costruirlo: prosegui la storia':spCost(u.c)}</span>${s.up[k]?'':`<br><button onclick="spBuild('${k}')" ${ok?'':'disabled'}>Monta</button>`}</div>`}
  return h+'<button onclick="cl()">Chiudi</button>'};
function spBuy(w){const s=spFix();if(w==='son'&&s.son<s.smax&&P.g>=20){P.g-=20;s.son++}else if(w==='fuel'&&s.fuel<s.fmax){const c=s.loc.s===0?100:300;if(P.g>=c){P.g-=c;s.fuel++}}else return;tone(520,.06);save();pn('neo_ing82')}
/* ---- le missioni dello spazio ---- */
function spStart(){const s=spFix(),Ms=SPM82[s.m];if(!Ms||s.st>=0)return;s.st=0;s.ms=0;cl();banner('Missione: '+Ms.n,Ms.st[0].tx,'pergamena');jingle([57,62,66,69],.12,'triangle');spSpawn();spCheck();save()}
function spStep(){const s=spFix(),Ms=spCur();if(!Ms)return;s.ms=0;s.st++;if(s.st<Ms.st.length){tone(880,.08,'triangle',.05);banner(Ms.n,Ms.st[s.st].tx,'pergamena');spSpawn();save();spCheck();return}
  P.g+=Ms.rw;gainXP(Math.round(Ms.rw*.6));goldFly(Ms.rw);const fine=Ms.fine;s.m++;s.st=-1;jingle([60,64,67,72,76,79,84],.09,'triangle');banner('Missione compiuta: '+Ms.n,'+'+Ms.rw.toLocaleString('it-IT')+' ₡','corona');
  if(s.m===3)s.crew.ferro=1;if(s.m===4)s.crew.thalen=1;crewLines();
  if(Ms.end){const it=item(P.lv+4,3,'c');it.n='Armatura dei Costruttori';it.u=uid();P.inv.push(it);s.fin=Date.now();
    setTimeout(()=>{PA={ti:'La rotta dei Costruttori',tx:'L\'Araldo si spegne pezzo per pezzo, come una città che chiude le finestre. Dietro di lui le rovine si aprono: c\'è una sala senza muri, e al centro sei incavi a forma di gemma.\n\nThal\'en li tocca uno per uno. «Qui hanno forgiato la Corona. Non per un re: per chi sarebbe venuto dopo, per ricordare tutte le epoche in un oggetto solo.» Ferro scansiona le pareti: «Ci sono altre rotte. Altri mondi. Ci vorranno mille anni per vederli tutti.»\n\nVera sorride dalla plancia: «Allora è meglio partire subito.»\n\nRicevi l\'Armatura dei Costruttori. La galassia resta aperta: puoi tornare su ogni pianeta, scansionarli tutti e finire i potenziamenti.'};pn('txt')},1500)}
  else if(fine)setTimeout(()=>{PA={ti:Ms.n,tx:fine};pn('txt')},1200);save()}
function spFail(why){const s=spFix(),Ms=spCur();if(!Ms)return;for(let i=ents.length-1;i>=0;i--)if(ents[i].ms82)ents.splice(i,1);s.ms=0;banner('Missione: '+Ms.n,why,'teschio');save()}
// i nemici della missione nascono quando arrivi nel posto giusto
function spSpawn(){const s=spFix(),Ms=spCur();if(!Ms||!spZone())return;const S=Ms.st[s.st];if(!S||S.z!==Zk||s.ms)return;const pk=ZZ.pl82,P2=pk&&PLP[pk];if(!P2)return;
  if(S.k==='kill'){const[cx,cy]=P2.camp;const z=ZZ;for(let i=0;i<S.n;i++){const q=nearFree(cx+Math.floor(Math.random()*7)-3,cy+Math.floor(Math.random()*7)-3);const e=mk(i%3===2?'sintp82':i%4===3?'drone82':'sint82',q[0],q[1]);e.ms82=1;ents.push(e)}s.ms=1}
  if(S.k==='boss'){const at=S.b==='divor82'?(P2.vill||P2.camp):P2.ruin;const q=nearFree(at[0],at[1]-2);const z=ZZ,l0=z.lv;z.lv=Math.max(l0,(P.lv|0)+1);try{const b=mk(S.b,q[0],q[1]);b.ms82=1;b.boss82=1;b.al=1;ents.push(b);
    for(let i=0;i<3;i++){const q2=nearFree(q[0]+Math.floor(Math.random()*5)-2,q[1]+Math.floor(Math.random()*5)-2);const e=mk(S.b==='divor82'?(FA82.giungla||['sint82'])[0]:'sint82',q2[0],q2[1]);e.ms82=1;e.al=1;ents.push(e)}}finally{z.lv=l0}
    s.ms=1;music&&music('boss');banner(E[S.b].n,S.b==='araldo82'?'Il custode della porta dei Costruttori':S.b==='divor82'?'Esce dal buio dei funghi':'La reliquia si è svegliata','teschio')}}
function spCheck(){const s=spFix(),Ms=spCur();if(!Ms)return;const S=Ms.st[s.st];if(!S)return;let ok=false;
  if(S.k==='zona')ok=Zk===S.z;else if(S.k==='sis')ok=s.loc.s===S.s;else if(S.k==='up')ok=!!s.up[S.u];else if(S.k==='rel')ok=!!s.rel[S.z];
  else if(S.k==='kill'||S.k==='boss')ok=Zk===S.z&&s.ms&&!ents.some(e=>e.k==='en'&&e.ms82&&(S.k==='kill'||e.boss82));
  if(ok)spStep()}
// il dialogo: chi dà la missione, chi va liberato o trovato
{const p0=pn;pn=function(m,arg){p0(m,arg);try{if(m!=='npc'||PM!=='npc'||MODE!=='neo'||!PA)return;const s=spFix(),pe=$('pn');if(!pe||pe.querySelector('.sp82'))return;const last=[...pe.querySelectorAll('button')].pop();let h='';
  const Ms=spCur(),nx=SPM82[s.m];
  if(Ms){const S=Ms.st[s.st];if(S&&S.k==='parla'&&S.id===PA.nid&&Zk===S.z){setTimeout(()=>{cl();if(S.id==='ferro82'){const i=ents.findIndex(q=>q.k==='npc'&&q.nid==='ferro82');if(i>=0)ents.splice(i,1);flash('#ffd84a',.3,400)}spStep()},900);h=`<div class="qb sp82"><b>${esc(Ms.n)}</b><p>${S.id==='ferro82'?'«Le catene si aprono con un codice. Tu sei il codice.» Ferro si alza, le giunture che scricchiolano.':'Thal\'en ti guarda a lungo, poi annuisce: «Hai la luce della Corona addosso. Aiutaci, e ti diremo dove sono andati i Primi.»'}</p></div>`}
    else if(Ms.g===PA.nid&&S)h=`<div class="qb sp82"><b>${esc(Ms.n)}</b> <span class="mu">in corso: ${esc(S.tx)}</span></div>`}
  else if(nx&&nx.g===PA.nid&&spOpen())h=`<div class="qb sp82"><b>🌌 ${esc(nx.n)}</b><p>${esc(nx.tx)}</p><span class="mu">Ricompensa: ${nx.rw.toLocaleString('it-IT')} ₡</span><br><button onclick="spStart()">Accetta la missione</button></div>`;
  if(h&&last)last.insertAdjacentHTML('beforebegin',h)}catch(e){console.warn('Oltre il cielo',e)}}}
// la reliquia e i minerali: R o clic per prenderli
ITK.add('rel82');ITK.add('min82');
{const a0=act;act=function(e){if(MODE==='neo'&&e&&e.k==='min82'){const s=spFix(),u=s.up.scan?1.3:1,q=Math.round(e.q*u);s.res[e.r]+=q;const i=ents.indexOf(e);if(i>=0)ents.splice(i,1);flt(P,'+'+q+' '+MIN82[e.r].n,MIN82[e.r].c);tone(780,.08,'triangle');save();return}
  if(MODE==='neo'&&e&&e.k==='rel82'){const s=spFix();s.rel[Zk]=1;const i=ents.indexOf(e);if(i>=0)ents.splice(i,1);flash('#ffd84a',.5,600);jingle([62,69,74,81],.14,'triangle');banner('✨ '+e.n,'La pietra si accende sotto le tue dita','stella');spCheck();save();return}a0(e)}}
/* ---- la mappa galattica: a tutto schermo, come in plancia ---- */
const GX={v:'gal',s:0,p:-1,hx:-1,hy:-1,raf:0,el:null,cv:null,msg:'',probe:null};
function gxOpen(){if(!spOpen())return;const s=spFix();GX.v='sys';GX.s=s.loc.s;GX.p=-1;GX.msg='';
  if(!GX.el){const d=document.createElement('div');d.id='gx82';d.innerHTML=`<canvas id="gx82c" width="1280" height="720"></canvas><div id="gx82i"></div><button id="gx82x" onclick="gxClose()">✕</button>`;document.body.appendChild(d);GX.el=d;GX.cv=$('gx82c');
    const st=document.createElement('style');st.textContent=`#gx82{position:fixed;inset:0;z-index:60;background:#02030a;display:none;font-family:Georgia,serif;color:#e8f0ff}#gx82 canvas{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:min(100vw,177.78vh);height:min(56.25vw,100vh);cursor:crosshair}
#gx82i{position:absolute;right:16px;top:60px;width:min(340px,calc(100vw - 32px));max-height:calc(100% - 80px);overflow:auto;background:#0a1020dd;border:1px solid #2affff66;border-radius:8px;padding:10px 14px;box-sizing:border-box}
#gx82i h3{margin:4px 0;color:#9adcff}#gx82i p{margin:6px 0;line-height:1.45;font-size:14px}#gx82i button{display:block;width:100%;margin:6px 0;padding:8px;background:#12233a;color:#e8f0ff;border:1px solid #2affff88;border-radius:6px;font:inherit;cursor:pointer}#gx82i button:disabled{opacity:.45;cursor:default}
#gx82x{position:absolute;right:16px;top:12px;width:40px;height:40px;background:#12233a;color:#fff;border:1px solid #2affff88;border-radius:50%;font-size:18px;cursor:pointer}
@media (max-width:700px){#gx82i{top:auto;bottom:10px;right:10px;left:10px;width:auto;max-height:42%}}`;document.head.appendChild(st);
    const pos=ev=>{const r=GX.cv.getBoundingClientRect();return[(ev.clientX-r.left)/r.width*1280,(ev.clientY-r.top)/r.height*720]};
    GX.cv.addEventListener('pointermove',ev=>{[GX.hx,GX.hy]=pos(ev)});GX.cv.addEventListener('pointerdown',ev=>{const[x,y]=pos(ev);GX.hx=x;GX.hy=y;gxClick(x,y)});
    addEventListener('keydown',ev=>{if(GX.el&&GX.el.style.display!=='none'&&ev.key==='Escape'){gxClose();ev.stopImmediatePropagation()}},true)}
  GX.el.style.display='block';PM='gx82';tone(440,.1,'triangle');gxInfo();if(!GX.raf){const f=()=>{if(GX.el.style.display==='none'){GX.raf=0;return}gxDraw();GX.raf=requestAnimationFrame(f)};GX.raf=requestAnimationFrame(f)}}
function gxClose(){if(GX.el)GX.el.style.display='none';if(PM==='gx82')PM=0;save()}
const gxR=k=>{let a=hs('gx'+k)>>>0;return()=>{a=(a*1664525+1013904223)>>>0;return a/4294967296}};
function sysVis(i){const S=SYS82[i];return!S.lock||spFix().m>=4}
function gxPlanetXY(S,j,tt){const n=S.pl.length,r=150+j*95,a=tt*.05*(1/(1+j*.6))+j*2.1+S.x*9;return[560+Math.cos(a)*r,380+Math.sin(a)*r*.42]}
function gxDraw(){const c=GX.cv,g2=c.getContext('2d'),s=spFix(),tt=performance.now()/1000;g2.fillStyle='#02030a';g2.fillRect(0,0,1280,720);
  const r=gxR('stelle');for(let i=0;i<260;i++){const x=r()*1280,y=r()*720,b=.3+r()*.7*(.6+.4*Math.sin(tt*2+i));g2.fillStyle=`rgba(220,230,255,${b})`;g2.fillRect(x,y,r()<.1?2:1,r()<.1?2:1)}
  g2.font='bold 22px Georgia';g2.textAlign='left';g2.fillStyle='#9adcff';g2.fillText('🌌 Mappa galattica · Stella di Aldric',20,36);
  g2.font='15px Georgia';g2.fillStyle='#c8d8f0';g2.fillText(`⛽ ${s.fuel}/${s.fmax}   📡 ${s.son}/${s.smax}   `+Object.keys(MIN82).map(k=>MIN82[k].n+' '+s.res[k]).join('   ')+`   ₡ ${P.g.toLocaleString('it-IT')}`,20,62);
  if(GX.v==='gal'){// le nebulose, le rotte, i sistemi
    for(let i=0;i<SYS82.length;i++){const S=SYS82[i];if(!sysVis(i))continue;const x=S.x*1280,y=S.y*720,gr=g2.createRadialGradient(x,y,0,x,y,170);gr.addColorStop(0,S.c+'55');gr.addColorStop(1,S.c+'00');g2.fillStyle=gr;g2.fillRect(x-170,y-170,340,340)}
    g2.strokeStyle='#2affff44';g2.setLineDash([6,8]);g2.lineWidth=2;for(let i=1;i<SYS82.length;i++){const a=SYS82[i-1],b=SYS82[i];if(!sysVis(i))continue;g2.beginPath();g2.moveTo(a.x*1280,a.y*720);g2.lineTo(b.x*1280,b.y*720);g2.stroke()}g2.setLineDash([]);
    for(let i=0;i<SYS82.length;i++){const S=SYS82[i],x=S.x*1280,y=S.y*720,vis=sysVis(i),hov=Math.hypot(GX.hx-x,GX.hy-y)<34;
      g2.fillStyle=vis?S.c:'#3a3a4a';g2.beginPath();g2.arc(x,y,hov?16:12,0,6.283);g2.fill();g2.fillStyle='#ffffffcc';g2.beginPath();g2.arc(x,y,5,0,6.283);g2.fill();
      if(i===s.loc.s){g2.strokeStyle='#2affff';g2.lineWidth=2;g2.beginPath();g2.arc(x,y,26+Math.sin(tt*3)*3,0,6.283);g2.stroke();g2.font='18px Georgia';g2.textAlign='center';g2.fillText('🚀',x,y-34)}
      if(i===GX.s){g2.strokeStyle='#ffd84a';g2.lineWidth=2;g2.strokeRect(x-22,y-22,44,44)}
      g2.font='bold 16px Georgia';g2.textAlign='center';g2.fillStyle=vis?'#e8f0ff':'#6a6a7a';g2.fillText(vis?S.n:'??? · rotta sconosciuta',x,y+36)}}
  else{const S=SYS82[GX.s];// il sistema: la stella e i pianeti in orbita
    const gr=g2.createRadialGradient(560,380,0,560,380,90);gr.addColorStop(0,'#ffffff');gr.addColorStop(.25,S.c);gr.addColorStop(1,S.c+'00');g2.fillStyle=gr;g2.beginPath();g2.arc(560,380,90,0,6.283);g2.fill();
    if(GX.v!=='scan'){g2.font='bold 20px Georgia';g2.textAlign='center';g2.fillStyle='#e8f0ff';g2.fillText(S.n,560,120)}
    for(let j=0;j<S.pl.length;j++){const p=S.pl[j],rr=150+j*95;g2.strokeStyle='#ffffff22';g2.lineWidth=1;g2.beginPath();g2.ellipse(560,380,rr,rr*.42,0,0,6.283);g2.stroke();
      const[x,y]=gxPlanetXY(S,j,tt),R2=p.r*120,hov=Math.hypot(GX.hx-x,GX.hy-y)<R2+10;const pg=g2.createRadialGradient(x-R2*.4,y-R2*.4,R2*.1,x,y,R2);pg.addColorStop(0,shx(p.c,1.4));pg.addColorStop(1,shx(p.c,.45));g2.fillStyle=pg;g2.beginPath();g2.arc(x,y,R2,0,6.283);g2.fill();
      if(p.t==='gas'){g2.strokeStyle=shx(p.c,.7)+'aa';g2.lineWidth=3;for(let k=-2;k<=2;k++){g2.beginPath();g2.ellipse(x,y+k*R2*.3,R2*Math.sqrt(1-(k*.3)**2),R2*.06,0,0,6.283);g2.stroke()}}
      if(j===GX.p||hov){g2.strokeStyle=j===GX.p?'#ffd84a':'#ffffff88';g2.lineWidth=2;g2.beginPath();g2.arc(x,y,R2+8,0,6.283);g2.stroke()}
      if(GX.s===s.loc.s&&j===s.loc.p){g2.font='16px Georgia';g2.fillText('🚀',x+R2+14,y-R2)}
      const left=Math.round(spLeft(p.k)*100);g2.font='14px Georgia';g2.fillStyle='#e8f0ff';g2.fillText(p.n+(p.land?' 🛬':''),x,y+R2+20);g2.fillStyle='#9ab0c8';g2.font='12px Georgia';g2.fillText(s.sc[p.k]?'minerali '+left+'%':'non scansionato',x,y+R2+36)}
    if(GX.v==='scan')gxScanDraw(g2,tt)}
  if(GX.msg){g2.font='bold 18px Georgia';g2.textAlign='center';g2.fillStyle='#ffd84a';g2.fillText(GX.msg,560,700)}}
function gxClick(x,y){const s=spFix(),tt=performance.now()/1000;if(GX.v==='gal'){for(let i=0;i<SYS82.length;i++){const S=SYS82[i];if(Math.hypot(x-S.x*1280,y-S.y*720)<34){GX.s=i;GX.p=-1;GX.msg='';tone(600,.05);gxInfo();return}}return}
  if(GX.v==='scan'){gxProbe(x,y);return}
  const S=SYS82[GX.s];for(let j=0;j<S.pl.length;j++){const[px2,py2]=gxPlanetXY(S,j,tt);if(Math.hypot(x-px2,y-py2)<S.pl[j].r*120+10){GX.p=j;GX.msg='';tone(700,.05);gxInfo();return}}}
function gxInfo(){const el=$('gx82i'),s=spFix();if(!el)return;let h='';
  if(GX.v==='gal'){const S=SYS82[GX.s],vis=sysVis(GX.s);h=`<h3>${vis?esc(S.n):'???'}</h3><p>${vis?esc(S.d):'I dati del Faro non arrivano fin qui. Serve qualcuno che conosca la rotta.'}</p>`;
    if(vis){if(GX.s===s.loc.s)h+=`<button onclick="GX.v='sys';GX.p=-1;gxInfo()">🔭 Apri il sistema</button>`;else{const ok=s.fuel>0&&(!S.lock||(s.up.cor&&s.up.bar));h+=`<button onclick="gxJump(${GX.s})" ${ok?'':'disabled'}>🚀 Salta qui · 1 ⛽ (ne hai ${s.fuel})</button>`;if(S.lock&&!(s.up.cor&&s.up.bar))h+=`<p class="mu">Le tempeste dell'Abisso distruggerebbero la nave: servono la Corazza di Kharon e la Barriera della nave.</p>`;else if(s.fuel<=0)h+=`<p class="mu">Niente carburante: compralo in ingegneria, o torna al Sole di Aldoria dove il rifornimento è gratis.</p>`}}}
  else if(GX.v==='sys'){const S=SYS82[GX.s];if(GX.p<0)h=`<h3>${esc(S.n)}</h3><p>${esc(S.d)}</p><p class="mu">Tocca un pianeta per vederlo da vicino.</p>`;
    else{const p=S.pl[GX.p];h=`<h3>🪐 ${esc(p.n)}</h3><p>${esc(p.a)}</p><p class="mu">${p.land?'Si può atterrare · livello '+p.lv:'Non si può atterrare'} · ${s.sc[p.k]?'minerali rimasti '+Math.round(spLeft(p.k)*100)+'%':'non ancora scansionato'}</p>`;
      if(p.t!=='casa')h+=`<button onclick="GX.v='scan';gxInfo()" ${s.son>0?'':'disabled'}>📡 Scansiona (${s.son} sonde)</button>`;
      if(p.land)h+=`<button onclick="gxLand(${GX.p})">🛬 Atterra su ${esc(p.n)}</button>`;if(p.t==='casa')h+=`<button onclick="gxLand(${GX.p})">🏙 Scendi ad Aldoria</button>`}
    h+=`<button onclick="GX.v='gal';gxInfo()">🌌 Torna alla galassia</button>`}
  else if(GX.v==='scan'){const p=SYS82[GX.s].pl[GX.p];h=`<h3>📡 Scansione · ${esc(p.n)}</h3><p>Muovi il mirino sul pianeta: le barre in basso mostrano quanto segnale c'è sotto. Tocca per lanciare una sonda.</p><p class="mu">Sonde: ${s.son} · Minerali rimasti: ${Math.round(spLeft(p.k)*100)}%</p><button onclick="GX.v='sys';gxInfo()">↩ Torna al sistema</button>`}
  h+=`<button onclick="gxClose()">Chiudi la mappa</button>`;el.innerHTML=h}
function gxJump(i){const s=spFix(),S=SYS82[i];if(i===s.loc.s||s.fuel<=0||!sysVis(i))return;if(S.lock&&!(s.up.cor&&s.up.bar))return;s.fuel--;s.loc={s:i,p:0};if(i===0){s.fuel=s.fmax;s.son=s.smax}
  GX.s=i;GX.v='sys';GX.p=-1;GX.msg='Salto completato: '+S.n+(i===0?' · rifornimento gratis':'');flash('#ffffff',.8,700);tone(110,.6,'sawtooth',.08);setTimeout(()=>tone(880,.3,'triangle',.05),400);spCheck();save();gxInfo()}
function gxLand(j){const s=spFix(),p=SYS82[GX.s].pl[j];if(GX.s!==s.loc.s){GX.msg='Prima salta nel sistema';return}s.loc.p=j;gxClose();if(p.t==='casa')spGo('neo_city');else if(p.land)spGo('pl82_'+p.k)}
/* ---- le sonde: i giacimenti nascosti di ogni pianeta ---- */
function spDep(pk){const s=spFix();if(!s.dep[pk]){const r=gxR('dep'+pk),p=PL82[pk],B=BIO82[p.t]||{min:['iridio','etere']},L=[];const mins=p.t==='gas'?['etere','etere','iridio']:p.t==='oceano'?['iridio','iridio','platino']:B.min;
    for(let i=0;i<4;i++){const a=r()*6.283,d=Math.sqrt(r())*.8;L.push({x:Math.cos(a)*d,y:Math.sin(a)*d,r:.25+r()*.2,t:mins[i%mins.length],q:250+Math.floor(r()*450),q0:0})}L.forEach(d=>d.q0=d.q);s.dep[pk]=L}return s.dep[pk]}
function spLeft(pk){const L=spDep(pk);return L.reduce((a,d)=>a+d.q,0)/Math.max(1,L.reduce((a,d)=>a+d.q0,0))}
function gxScanXY(x,y){return[(x-560)/230,(y-380)/230]}
function gxSignal(pk,u,v){const sig={};for(const k in MIN82)sig[k]=0;if(u*u+v*v>1)return sig;for(const d of spDep(pk)){const f=Math.max(0,1-Math.hypot(u-d.x,v-d.y)/d.r);sig[d.t]+=f*d.q}return sig}
function gxScanDraw(g2,tt){const S=SYS82[GX.s],p=S.pl[GX.p];g2.fillStyle='#02030aee';g2.fillRect(0,80,1280,640);
  // il pianeta grande, con la superficie a macchie
  const r=gxR('sup'+p.k);g2.save();g2.beginPath();g2.arc(560,380,230,0,6.283);g2.clip();g2.fillStyle=shx(p.c,.8);g2.fillRect(330,150,460,460);for(let i=0;i<140;i++){g2.fillStyle=shx(p.c,.55+r()*.9)+'aa';g2.beginPath();g2.arc(330+r()*460,150+r()*460,6+r()*40,0,6.283);g2.fill()}
  const gr=g2.createRadialGradient(470,290,40,560,380,240);gr.addColorStop(0,'#ffffff22');gr.addColorStop(1,'#000000aa');g2.fillStyle=gr;g2.fillRect(330,150,460,460);g2.restore();
  // il mirino e i segnali
  const[u,v]=gxScanXY(GX.hx,GX.hy),inP=u*u+v*v<=1,sig=inP?gxSignal(p.k,u,v):null;
  if(inP){g2.strokeStyle='#2affff';g2.lineWidth=2;g2.beginPath();g2.arc(GX.hx,GX.hy,18,0,6.283);g2.moveTo(GX.hx-30,GX.hy);g2.lineTo(GX.hx+30,GX.hy);g2.moveTo(GX.hx,GX.hy-30);g2.lineTo(GX.hx,GX.hy+30);g2.stroke()}
  let i=0;for(const k in MIN82){const val=sig?Math.min(1,sig[k]/500):0,x=120+i*120;g2.fillStyle='#ffffff22';g2.fillRect(x,640,90,14);g2.fillStyle=MIN82[k].c;g2.fillRect(x,640,90*val,14);g2.font='13px Georgia';g2.textAlign='left';g2.fillStyle='#c8d8f0';g2.fillText(MIN82[k].n,x,632);i++}
  if(GX.probe){const q=GX.probe,k=(tt-q.t)/0.6;if(k<1){g2.fillStyle='#ffffff';g2.beginPath();g2.arc(q.x,q.y-200*(1-k),4,0,6.283);g2.fill()}else if(k<2){g2.strokeStyle=`rgba(42,255,255,${2-k})`;g2.lineWidth=3;g2.beginPath();g2.arc(q.x,q.y,(k-1)*60,0,6.283);g2.stroke()}}}
function gxProbe(x,y){const s=spFix(),p=SYS82[GX.s].pl[GX.p];const[u,v]=gxScanXY(x,y);if(u*u+v*v>1)return;if(GX.s!==s.loc.s){GX.msg='Le sonde arrivano solo nel sistema dove sei';return}if(s.son<=0){GX.msg='Niente sonde: comprale in ingegneria';return}
  s.son--;s.sc[p.k]=1;GX.probe={x,y,t:performance.now()/1000};tone(1200,.05,'square',.04);const mul=.6,got={};
  for(const d of spDep(p.k)){const f=Math.max(0,1-Math.hypot(u-d.x,v-d.y)/d.r);if(f<=0)continue;const q=Math.min(d.q,Math.round(d.q*f*mul));d.q-=q;const add=Math.round(q*(s.up.scan?1.3:1));s.res[d.t]+=add;got[d.t]=(got[d.t]||0)+add}
  const t=Object.entries(got).map(([k,v])=>'+'+v+' '+MIN82[k].n).join(' · ');setTimeout(()=>{GX.msg=t||'Niente qui sotto: prova da un\'altra parte';tone(t?880:200,.1,'triangle');spCheck();save();gxInfo()},700)}
/* ---- il disegno: arredi della nave e dei pianeti ---- */
const bioC=()=>BIO82[(ZZ&&ZZ.bt)||'luna']||BIO82.luna;
const NPR82={
  '㊀':(x,y)=>{box(x+.05,y+.05,0,.9,.9,8,'#2a2e38');box(x,y,8,1,1,2,'#4a5060');const tt=t;for(let i=0;i<9;i++){const a=i/9*6.283+tt*.4,r=.15+(i%3)*.12;box(x+.5+Math.cos(a)*r-.04,y+.5+Math.sin(a)*r-.04,12+(i%4)*3+Math.sin(tt*2+i)*1.5,.08,.08,.8,['#2affff','#ffd84a','#ff8a4a','#c84aff','#4affc0'][i%5],1.5)}box(x+.42,y+.42,10,.16,.16,10,'#2affff',1.2)},
  '㊁':(x,y)=>{box(x+.1,y+.2,0,.8,.6,10,'#3a3e4a');box(x+.12,y+.25,10,.76,.04,7,'#2affff',1.25+Math.sin(t*3+x)*.1);box(x+.15,y+.5,10,.7,.3,1,'#5a606c')},
  '㊂':(x,y)=>{box(x+.1,y+.35,0,.8,.3,26,'#2a2e38');for(let i=0;i<3;i++)box(x+.2+i*.22,y+.33,6+i*5,.12,.04,12,'#8a94a4');box(x+.1,y+.32,25,.8,.03,1,'#ff3a5a',1.3)},
  '㊃':(x,y)=>{box(x+.05,y+.25,0,.9,.5,7,'#e8eef4');box(x+.1,y+.3,7,.25,.4,2,'#c8d8e8');box(x+.8,y+.3,7,.1,.4,14,'#3a3e4a');box(x+.78,y+.32,18,.14,.36,4,'#4affc0',1.3)},
  '㊄':(x,y)=>{box(x,y,0,1,1,40,'#5a606c',.9+hh(x,y)*.06);box(x+.3,y+.3,40,.4,.4,2,'#7a808c');if((x+y)%3===0)box(x+.05,y+.98,18,.9,.03,1.2,'#2affff',1.3)},
  '㊅':(x,y)=>{box(x,y,0,1,1,6,'#5a606c');box(x+.05,y+.4,6,.9,.2,30,'#05050c');const r=gxR('fin'+x);for(let i=0;i<5;i++)box(x+.1+r()*.8,y+.38,8+r()*26,.04,.02,.4,'#ffffff',1.6);box(x,y,36,1,1,4,'#5a606c')},
  '㊆':(x,y)=>{box(x+.15,y+.15,0,.7,.7,9,'#6a5a3a');box(x+.15,y+.15,9,.7,.7,.6,'#8a7a5a');box(x+.13,y+.45,3,.74,.1,3,'#ffd84a',1.1)},
  '㊇':(x,y)=>{box(x+.05,y+.2,0,.9,.6,5,'#4a5060');box(x+.1,y+.25,5,.8,.5,1.5,'#3a5a8a');box(x+.05,y+.2,12,.9,.6,1,'#4a5060');box(x+.1,y+.25,13,.8,.5,1.5,'#8a3a3a')},
  '㊈':(x,y)=>{box(x+.15,y+.15,0,.7,.7,4,'#2a2e38');const p=.5+.5*Math.sin(t*4+y);box(x+.25,y+.25,4,.5,.5,28,p>.5?'#2affff':'#1ac8e8',1.2+p*.3);box(x+.15,y+.15,32,.7,.7,4,'#2a2e38')},
  '㊉':(x,y)=>{box(x+.2,y+.2,0,.6,.6,6,'#2a2e38');for(let i=0;i<4;i++)box(x+.3,y+.3,8+i*5+Math.sin(t*2+i)*1.2,.4,.4,1,'#5adcff',1.4-i*.1)},
  '㋀':(x,y,h)=>{const B=bioC(),r=gxR('rk'+x+'|'+y),w=.5+r()*.4,hh2=4+r()*9;box(x+(1-w)/2,y+(1-w)/2,0,w,w,hh2,B.wl,.85+h*.15);box(x+(1-w)/2+.1,y+(1-w)/2+.1,hh2,w-.2,w-.2,2,shx(B.wl,1.25))},
  '㋁':(x,y)=>{const B=bioC(),c=MIN82[B.min[(x+y)%B.min.length]].c;for(let i=0;i<4;i++){const a=i*1.7+x;box(x+.35+Math.cos(a)*.2,y+.35+Math.sin(a)*.2,0,.14,.14,6+i*3,c,1.3)}},
  '㋂':(x,y)=>{const ph=Math.sin(t*1.6+x*.7+y);box(x+.45,y+.45,0,.1,.1,14+ph,'#2a6a4a');box(x+.35,y+.35,14+ph,.3,.3,3,'#8affe0',1.4+ph*.15);box(x+.3,y+.5,6,.2,.06,.6,'#4affc0',1.2)},
  '㋃':(x,y,h)=>{box(x+.15,y+.15,0,.7,.7,30,'#1a1a1e',.95);box(x+.1,y+.1,30,.8,.8,3,'#2a2a30');box(x+.3,y+.84,12+Math.sin(t+x)*1,.4,.04,4,'#d4af37',1.35);box(x+.84,y+.3,18,.04,.4,4,'#d4af37',1.3)},
  '㋄':(x,y)=>{const r=gxR('wr'+x+'|'+y);box(x+.1,y+.2,0,.8,.5,4,'#5a5e68');box(x+.2+r()*.3,y+.1,4,.5,.3,3+r()*4,'#8a94a4');if(r()<.5)box(x+.6,y+.6,0,.25,.25,9,'#3a3e48');if(r()<.4)box(x+.4,y+.3,7,.1,.1,.4,'#ff8a2a',1.4)},
  '㋅':(x,y)=>{box(x+.1,y+.1,0,.8,.8,36,'#2a2a34');box(x+.15,y+.88,6,.7,.04,26,'#c84aff',1.2+Math.sin(t*3+y)*.1);box(x+.3,y+.3,36,.4,.4,6,'#3a3a46');box(x+.42,y+.42,42,.16,.16,2,Math.sin(t*5+x)>0?'#ff3a3a':'#3a1a1a',1.4)},
  '㋆':(x,y)=>{box(x+.3,y+.3,0,.4,.4,16,'#d8f0ff',1.1);box(x+.38,y+.38,16,.24,.24,8,'#f0faff',1.2);box(x+.6,y+.15,0,.25,.25,9,'#bfe3f5',1.1)},
  '㋇':(x,y)=>{box(x+.15,y+.15,0,.7,.7,3,'#2a1a16');box(x+.3,y+.3,3,.4,.4,.5,'#ff6a1a',1.5+Math.sin(t*4+x)*.2);if(cineOK()&&Math.random()<.04)burst(x+.5,y+.5,1,['#555','#888'],{v:.15,up:40,gr:-10,b:0,d:1.6,s:4,z:6})},
  '㋈':(x,y)=>{box(x+.4,y+.4,0,.2,.2,22,'#d8d0e8');const c=['#ff4ab0','#4affc0','#c84aff'][(x*3+y)%3];box(x+.05,y+.05,22,.9,.9,4,c,1.25+Math.sin(t+x)*.08);box(x+.2,y+.2,26,.6,.6,2,shx(c,1.2),1.3)},
  '㋉':(x,y)=>{box(x+.35,y+.35,0,.3,.3,3,'#3a3e48');box(x+.4,y+.4,3,.2,.2,1.5,Math.sin(t*4+x+y)>0?'#ffd84a':'#5a4a1a',1.5)},
  '㋊':(x,y)=>{box(x+.1,y+.1,0,.8,.8,12,'#5aa0e8',.9);box(x+.05,y+.05,12,.9,.9,6,'#8affe0',1.15);box(x+.4,y+.88,0,.2,.04,8,'#1a2a4a')},
  '㋋':(x,y)=>{box(x+.4,y+.4,0,.2,.2,16,'#4a4a56');box(x+.3,y+.3,16,.4,.4,2,'#ff3a3a',1.3)}};
{const d0=dec;dec=function(x,y,c,h){const f=NPR82[c];if(f&&ZZ&&ZZ.sp82){f(x,y,h);return}d0(x,y,c,h)}}
// il pavimento della nave: le strisce luminose; sui pianeti: sassi, ciuffi e muschio che brilla
{const f0=floor;floor=function(x,y,c,h){f0(x,y,c,h);const z=ZZ;if(!z||!z.sp82||c!==0&&c!==4)return;
  if(z.nave82){if(x===12||x===13){if((y+Math.floor(t*4))%4===0)box(x+.45,y+.1,0,.1,.8,.3,'#2affff',1.4)}else if(y===13&&x%2===0)box(x+.1,y+.45,0,.8,.1,.3,'#2a8aff',1.2);return}
  const v=hh(x*3,y*5);if(c===0&&v<.08){const B=bioC();box(x+v*8,y+.3+v*3,0,.18,.14,1.2,shx(B.a,.75))}else if(c===0&&v>.94&&z.bt==='giungla')box(x+.3,y+.3,0,.3,.3,.3,'#4affc0',1.3)}}
{const e0=ent;ent=function(e){if(!e||!ZZ)return e0(e);
  if(e.k==='min82'){const c=MIN82[e.r].c,b=Math.sin(t*2+e.px)*1.5;for(let i=0;i<3;i++)box(e.px-.2+i*.15,e.py-.15+(i%2)*.1,b,.12,.12,5+i*2,c,1.35);if(!D3B){g.textAlign='center';g.font='bold 10px Georgia,serif';label('💎 '+e.n,PX(e.px,e.py),PY(e.px,e.py,0)-22,c)}return}
  if(e.k==='rel82'){const a=t*1.2,z0=10+Math.sin(t*2)*2;box(e.px-.5,e.py-.5,0,1,1,4,'#1a1a1e');for(let i=0;i<4;i++)box(e.px-.25+Math.cos(a+i*1.57)*.08,e.py-.25+Math.sin(a+i*1.57)*.08,z0+i*2,.5,.5,2,'#d4af37',1.35+i*.05);if(cineOK()&&Math.random()<.1)sparks(e.px,e.py,2,['#ffd84a','#ffffff'],30);
    if(!D3B){g.textAlign='center';g.font='bold 11px Georgia,serif';label('✨ '+e.n,PX(e.px,e.py),PY(e.px,e.py,0)-40,'#ffd84a')}return}
  if(e.k==='ship82'){const x=e.px,y=e.py,z=30+Math.sin(t*.8)*1.5;box(x-4.5,y-.8,z,9,1.6,6,'#d8dce4');box(x-3,y-1.2,z+6,6,2.4,4,'#e8ecf2');box(x+4.5,y-.5,z+1,1.4,1,4,'#2affff',1.25);box(x-2,y-3.2,z+2,3.5,6.4,1.4,'#c8ccd4');box(x-2.2,y-3.3,z+3.4,3.9,.3,.6,'#d4af37',1.2);box(x-2.2,y+3,z+3.4,3.9,.3,.6,'#d4af37',1.2);
    for(const dy of[-.6,.2])box(x-5.3,y+dy,z+1,.8,.5,4,'#ff8a2a',1.35+Math.sin(t*6)*.1);box(x-1.5,y-.9,z+10,3,.04,1,'#d4af37',1.3);for(const[a,b]of[[-3,-.5],[3,-.5],[0,.5]])box(x+a,y+b,0,.15,.15,z,'#5a606c');
    if(!D3B){g.textAlign='center';g.font='bold 11px Georgia,serif';label('🚀 Stella di Aldric',PX(x,y),PY(x,y,z+20),'#ffe8b0')}return}
  if(e.k==='neos'&&/82$/.test(e.st||'')){if(!D3B){const ic={nave82:'🚀',port82:'🚪',nav82:'🛸',gal82:'🌌',ing82:'🔧',med82:'✚'}[e.st]||'•';g.textAlign='center';g.font='bold 10px Georgia,serif';label(ic+' '+e.n,PX(e.px,e.py),PY(e.px,e.py,0)-30+Math.sin(t*2)*2,'#bff0ff')}if(e.st==='nav82'){const x=e.px,y=e.py-1.5;box(x-1.5,y-.7,2,3,1.4,4,'#d8dce4');box(x-.8,y-.5,6,1.6,1,2.5,'#2affff',1.2);box(x-2.4,y-.2,2,.9,.4,.6,'#c8ccd4');box(x+1.5,y-.2,2,.9,.4,.6,'#c8ccd4')}return}
  return e0(e)}}
/* ---- il ciclo: sulla nave e sui pianeti valgono armi, veicoli e scudo del 3026 ---- */
{const u0=upd;upd=function(dt){u0(dt);if(MODE!=='neo'||!started||!P||!spZone())return;try{
  const car=NEO.car;if(car&&!ents.includes(car))NEO.car=null;NEO.cd=Math.max(0,NEO.cd-dt);
  if(NEO.car){P.tg=null;P.path=[];carDrive(NEO.car,dt);P.px=NEO.car.px;P.py=NEO.car.py}
  else{const G=gunOf();if(G){if(P.tg&&P.tg.k==='en'&&ents.includes(P.tg)&&dist(P,P.tg)<=G.r){P.path=[];neoFire(P.tg)}if((KEYS[' ']||KEYS.x)&&!PM)neoFire(neoAim())}}
  for(const e of ents)if(e.k==='car'&&e.hp<=0&&!e.burn){e.burn=t;e.v=0;if(e===NEO.car)carExit();setTimeout(()=>{e.hp=e.mx;e.burn=0},6000)}
  let fx=ents.find(q=>q.k==='nfx55');if(!fx){fx={k:'nfx55',px:P.px,py:P.py};ents.push(fx)}fx.px=P.px+.6;fx.py=P.py+.6;
  neoBullets(dt);neoShTick(dt);NEO.sc82=(NEO.sc82||0)-dt;if(NEO.sc82<=0){NEO.sc82=.4;spCheck()}
  NEO.ht=(NEO.ht||0)-dt;if(NEO.ht<=0){NEO.ht=.25;neoHud()}}catch(err){console.warn('Oltre il cielo',err)}}}
// in città, una missione dello spazio si controlla lo stesso (per esempio «sali sulla nave»)
{const n0=nmTick;nmTick=function(dt){n0(dt);NEO.sc82c=(NEO.sc82c||0)-dt;if(NEO.sc82c<=0){NEO.sc82c=.5;try{spCheck()}catch(e){}}}}
// la barra in alto: l'obiettivo dello spazio, carburante e sonde
{const h0=neoHud;neoHud=function(){h0();const el=NEO.hud;if(!el||!nOn()||!P||!P.neo)return;const s=spFix(),Ms=spCur(),o=nmFix();let x='';
  if(Ms)x=`<span class="nho">🌌 ${esc(Ms.st[s.st].tx)}</span>`;else if(spOpen()&&SPM82[s.m]&&!nmCur())x=`<span class="nho">🌌 ${esc(NPCS[SPM82[s.m].g].n)} ha una missione</span>`;
  if(spZone())x+=`<span>⛽ ${s.fuel}/${s.fmax} · 📡 ${s.son}</span>`;if(!x)return;
  if(spOpen()&&!nmCur()){const old=el.querySelector('.nho');if(old)old.remove()}el.insertAdjacentHTML('beforeend',x)}}
// la colonna di luce verso l'obiettivo
{const t0=nmTarget;nmTarget=function(){const a=t0();if(a&&!spZone()&&!(spOpen()&&!nmCur()))return a;try{const s=spFix(),Ms=spCur();if(Ms){const S=Ms.st[s.st];
    if(S.k==='zona'&&S.z==='neo_nave'&&Zk==='neo_city'&&NPOI.porto)return{x:NPOI.porto[0]+.5,y:NPOI.porto[1]+2.5};
    if((S.k==='sis'||S.k==='zona'&&S.z!=='neo_nave'&&Zk==='neo_nave')&&Zk==='neo_nave')return{x:12.5,y:5.5};
    if(spZone()&&ZZ.pl82&&S.z===Zk){const P2=PLP[ZZ.pl82];const e=ents.find(q=>q.k==='en'&&q.ms82);if(e)return{x:e.px,y:e.py,e:1};const rl=ents.find(q=>q.k==='rel82');if(S.k==='rel'&&rl)return{x:rl.px,y:rl.py};
      if(S.k==='parla'){const n2=ents.find(q=>q.k==='npc'&&q.nid===S.id);if(n2)return{x:n2.px,y:n2.py,g:1}}}
    if(S.k==='up'&&Zk==='neo_nave')return{x:6.5,y:10.5};
    if(spZone()&&ZZ.pl82&&S.z&&S.z!==Zk){const L=PLP[ZZ.pl82].land;return{x:L[0]+.5,y:L[1]-.5}}}
    else if(spOpen()){const nx=SPM82[s.m];if(nx){const g2=ents.find(e=>e.k==='npc'&&e.nid===nx.g);if(g2)return{x:g2.px,y:g2.py,g:1}}}}catch(e){}return a}}
/* ---- la morte nello spazio: ti risvegli in infermeria ---- */
{const d0=die;die=function(){if(MODE!=='neo'||!spZone()){d0();return}if(NEO.car)carExit();const lost=Math.round(P.g*.1);P.g-=lost;const s=spFix();if(spCur())spFail('Sei stato riportato a bordo: torna sul posto per riprovare.');
  P.hp=P.mx;spGo('neo_nave',[21,14]);flash('#ffffff',.6,500);banner('In infermeria','IRIS ti ha teletrasportato a bordo appena in tempo · conto: '+lost+' ₡','teschio');hud()}}
/* ---- i potenziamenti in gioco: scudo e armi ---- */
{const m0=neoShMax;neoShMax=function(){const v=m0();return v>0&&MODE==='neo'&&spUp('scudo')?v+25:v}}
{const h0=hurtE;hurtE=function(e,d,rem,cr){if(MODE==='neo'&&!rem&&spUp('armi')&&d>0)d=Math.round(d*1.15);return h0(e,d,rem,cr)}}
/* ---- riprendere la partita dove l'avevi lasciata: sulla nave o su un pianeta ---- */
{const b0=neoBegin;neoBegin=function(s){const z0=s&&s.p&&s.p.neo&&s.p.neo.sp&&s.p.neo.sp.z;b0(s);try{if(z0&&Z[z0]&&spOpen())setTimeout(()=>{if(MODE==='neo'&&started)spGo(z0)},50)}catch(e){console.warn('Oltre il cielo',e)}}}
{const s0=save;save=function(){try{if(MODE==='neo'&&P&&P.neo){const s=spFix();s.z=spZone()?Zk:''}}catch(e){}s0()}}
