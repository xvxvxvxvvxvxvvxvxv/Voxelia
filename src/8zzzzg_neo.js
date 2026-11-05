/* ================= 7.56: ALDORIA 2026 — la dimensione moderna nello Zaffiro =================
   Lo Zaffiro della Corona si è riacceso: dentro c'è Aldoria mille anni dopo, una metropoli del 2026. Un eroe nuovo (con un
   salvataggio tutto suo) arriva dalla gemma in una città da girare liberamente:
   - la CITTÀ: 36 isolati su una griglia di viali, ognuno con il suo quartiere (grattacieli del centro, villette, zona
     industriale, porto, spiaggia, parco con il lago, la piazza con la statua di Re Aldric), lampioni, semafori, panchine,
     alberi, cartelloni, container e gru; di giorno e di notte;
   - le AUTO: il traffico gira per i viali (si ferma davanti agli ostacoli, svolta agli incroci), e altre sono parcheggiate.
     Ci si sale con R (o toccandole): se c'è qualcuno al volante scende di corsa. Si guida con WASD o la levetta (l'auto gira
     verso la direzione premuta), R per scendere. Sette modelli: berlina, sportiva, SUV, furgone, taxi, pick-up, polizia.
     Si ammaccano, fumano e, se si insiste, esplodono;
   - le ARMI DA FUOCO: pistola, mitraglietta, fucile a pompa e fucile d'assalto. Si spara cliccando su un nemico (l'eroe si
     ferma alla sua gittata) o con Spazio/X verso il nemico più vicino davanti a te; i proiettili si fermano sui muri;
   - la POLIZIA: investire i passanti o colpire gli agenti fa salire le stelle del ricercato (fino a 5). Più stelle, più
     agenti (e poi le squadre speciali) che arrivano a cercarti. Se per un po' nessuno ti vede, le stelle scendono; alla
     Stazione di polizia si paga la multa;
   - i SOLDI e i NEGOZI: l'Armeria, il Concessionario (le auto comprate le chiami con il telefono), Moda 2026 (vestiti e
     il cambio di look), l'Ospedale, il tuo Appartamento (si riposa e si salva) e il Bar del Drago;
   - la STORIA: otto missioni con i discendenti dei personaggi di Aldoria (Tommaso del Bar, Nino il meccanico, Lia
     dell'ospedale, il Commissario Marcus) contro la banda dei Corvi e il loro capo, Max «il Corvo» Malakar;
   - il MULTIGIOCATORE: con lo stesso codice stanza si gira nella stessa città e si vedono le auto degli altri. */
const NEOK='voxelia_neo';
const NEO={car:null,W:0,wt:0,wl:0,cd:0,b:[],t:0,sp:0,hud:null,mk:null,rs:0};
const nOn=()=>MODE==='neo'&&started&&P;
/* ---- la mappa: viali ogni 16 caselle, isolati di 13 con il marciapiede ---- */
const NRX=[1,17,33,49,65,81,97],NN=108;
const NDIS=[['res','res','hos','res','res','par'],['ind','pol','dt','dt','car','res'],['ind','apt','bar','dt','dt','res'],['ind','ind','dt','dt','arm','par'],['dock','ind','shp','plz','par','res'],['dock','dock','bch','bch','bnk','bch']];
let NT=null;// tipo di pavimento per casella: 0 erba 1 strada 2 marciapiede 3 piazza 4 sabbia 5 parcheggio 6 banchina 7 vialetto
const NPOI={};// i posti importanti (negozi, missioni): [x,y]
Z.neo_city={n:'Aldoria · 2026',lv:2,N:NN,a:'#5a8c3a',b:'#558636',bg:'#7fb6e6',mus:'neo',pt:'',gen:neoGen,dist:1,neo:1,nolamp:1,rd:['#2e2f34','#2b2c31']};
TRK.neo={bpm:98,root:50,sc:'dor',pr:[0,5,3,4,0,5,6,4],ld:'square',dn:.5,dr:3,bs:[0,3,6,8,10,14],arp:1};
function neoGen({R4,D,F,H,N2,n}){NT=new Uint8Array(n*n);NEO.gz=[];const T=(x,y,v)=>{if(x>0&&y>0&&x<n-1&&y<n-1)NT[y*n+x]=v},isR=v=>NRX.some(r=>v>=r&&v<=r+2);
  for(let y=1;y<n-1;y++)for(let x=1;x<n-1;x++){M[y][x]=0;T(x,y,0)}
  // il mare e la spiaggia a sud
  for(let y=100;y<n-1;y++)for(let x=1;x<n-1;x++){if(y>=103){M[y][x]=2}else T(x,y,4)}
  // il parco lungo il bordo est
  for(let y=1;y<100;y++)for(let x=100;x<n-1;x++)T(x,y,0);
  // i viali
  for(let y=1;y<100;y++)for(let x=1;x<100;x++)if(isR(x)||isR(y)){M[y][x]=4;T(x,y,1)}
  // i marciapiedi intorno a ogni isolato
  for(let by=0;by<6;by++)for(let bx=0;bx<6;bx++){const x0=NRX[bx]+3,y0=NRX[by]+3,x1=NRX[bx+1]-1,y1=NRX[by+1]-1;
    for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)if(x===x0||x===x1||y===y0||y===y1){M[y][x]=4;T(x,y,2)}
    neoBlock(NDIS[by][bx],x0+1,y0+1,x1-1,y1-1,{D,F,H,N2,T,bx,by})}
  // lungomare: palme, ombrelloni, la torretta del bagnino
  for(let x=4;x<98;x+=6){D(x,101,'⒢');if(x%12===4)D(x+2,102,'⒱')}D(50,102,'⒲');
  // lampioni e semafori lungo i viali
  for(const r of NRX)for(const c of NRX){for(const[dx,dy]of[[-1,-1],[3,-1],[-1,3],[3,3]]){const x=c+dx,y=r+dy;if(M[y]&&M[y][x]===4&&NT[y*n+x]===2&&(dx<0)===(dy<0)){M[y][x]=6;DEC[y][x]='⒡'}}}
  for(let by=0;by<6;by++)for(let bx=0;bx<6;bx++){const x0=NRX[bx]+3,y0=NRX[by]+3,x1=NRX[bx+1]-1,y1=NRX[by+1]-1;for(let x=x0+3;x<x1-1;x+=5){for(const y of[y0,y1])if(M[y][x]===4&&!DEC[y][x]){M[y][x]=6;DEC[y][x]=(x+y)%15===0?'⒟':(x*3+y)%11===0?'⒠':'⒜'}}}
  // la gente
  NEO.ped=[];const L=[];for(let y=2;y<100;y+=2)for(let x=2;x<100;x+=2)if(NT[y*n+x]===2||NT[y*n+x]===3||NT[y*n+x]===7)L.push([x,y]);
  for(let i=0;i<46&&L.length;i++){const[x,y]=L.splice(Math.floor(R()*L.length),1)[0];neoPed(x,y)}
  // le auto: il traffico e i parcheggi
  neoCars();
  return NPOI.apt?[NPOI.apt[0],NPOI.apt[1]+1]:[40,40]}
// i quartieri
function neoBlock(ty,x0,y0,x1,y1,{D,F,H,N2,T,bx,by}){const w=x1-x0+1,h=y1-y0+1,cx=(x0+x1)>>1,cy=(y0+y1)>>1,col=(a)=>a[Math.floor(R()*a.length)];
  const glass=['#4a6a8a','#3a4a5a','#5a7a9a','#2a3a4a','#6a8aa8','#3a5a6a'],conc=['#b8b4a8','#a8a49a','#c8c4b8','#8a8a8a','#d8d0c0'];
  const tower=(x,y,w2,h2,ht,c,st)=>H({x,y,w:w2,h:h2,st:st||'neo',wall:c,ht,win:1});
  const shop=(x,y,k,n,w2=5,h2=4,c='#d8c8a8',sg)=>{tower(x,y,w2,h2,30,c,'neo');TB[TB.length-1].sign=sg||n;const dx=x+(w2>>1),dy=y+h2;NPOI[k]=[dx,dy];ents.push({k:'neos',st:k,n,px:dx+.5,py:dy+.5})};
  const grassAll=v=>{for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)T(x,y,v)};
  if(ty==='dt'){grassAll(3);if(R()<.5)tower(x0,y0,w,h-2,110+Math.floor(R()*90),col(glass));else{tower(x0,y0,5,h-2,70+Math.floor(R()*80),col(glass));tower(x0+6,y0,5,h-2,90+Math.floor(R()*90),col(glass))}for(let x=x0;x<=x1;x+=3)D(x,y1,'⒝')}
  else if(ty==='res'){grassAll(0);for(const[ox,oy]of[[0,0],[6,0],[0,6],[6,6]]){const hx=x0+ox,hy=y0+oy;H({x:hx,y:hy,w:4,h:4,wall:col(['#e8d8c0','#d8c8a8','#f0e8d8','#c8d8e0','#e8c8b8']),roof:col(['#8a3a2a','#3a5a8a','#5a5a5a','#2f6a4a']),ht:22+Math.floor(R()*8)});
      for(let k=0;k<2;k++)D(hx+4,hy+k*2,R()<.6?'⒮':'⒯')}T(cx,y1,7)}
  else if(ty==='ind'){grassAll(6);tower(x0,y0,w,5,34+Math.floor(R()*8),col(['#8a8a90','#6a7a8a','#9a8a6a','#7a6a5a']),'neow');for(let i=0;i<7;i++)D(x0+Math.floor(R()*w),y0+6+Math.floor(R()*(h-7)),'⒣');D(x0+1,y1,'⒤');D(x1-1,y1,'⒤');
    NEO.gz=NEO.gz||[];NEO.gz.push([cx,y0+8])}
  else if(ty==='dock'){grassAll(6);for(let x=x0;x<=x1;x+=3)D(x,y0,'⒬');D(x0,y0+3,'⒫');D(x1,y0+7,'⒫');
    for(let y=y0+1;y<=y1;y++)for(let x=x0+2;x<=x1-2;x++)if(M[y][x]===0&&!DEC[y][x]&&(y-y0)%4!==1&&R()<.35){M[y][x]=6;DEC[y][x]='⒣'}NEO.gz=NEO.gz||[];NEO.gz.push([cx,cy]);if(bx===0&&by===5)NPOI.porto=[cx,cy];if(bx===1&&by===5)NPOI.molo=[cx,y0+1]}
  else if(ty==='par'){grassAll(0);for(let y=cy-2;y<=cy+2;y++)for(let x=cx-3;x<=cx+3;x++)if(((x-cx)/3.6)**2+((y-cy)/2.6)**2<1)M[y][x]=2;for(let x=x0;x<=x1;x++)T(x,y0+1,7);for(let y=y0;y<=y1;y++)T(x0+1,y,7);
    for(let i=0;i<14;i++){const x=x0+Math.floor(R()*w),y=y0+Math.floor(R()*h);if(NT[y*NN+x]===0&&M[y][x]===0)D(x,y,R()<.7?'⒮':'⒭')}D(x0+3,y0+1,'⒞');D(x1-2,y0+1,'⒞')}
  else if(ty==='plz'){grassAll(3);D(cx,cy,'⒦');for(const[a,b]of[[-3,-3],[3,-3],[-3,3],[3,3]])D(cx+a,cy+b,'⒝');for(const[a,b]of[[-2,0],[2,0],[0,-2],[0,2]])D(cx+a,cy+b,'⒞');D(x0,y0,'⒰');NPOI.piazza=[cx,cy+2]}
  else if(ty==='bch'){grassAll(4);shop(x0,y0,bx===2?'gelati':'surf',bx===2?'Gelateria Onda':'Noleggio Surf',5,4,'#f0e0c0');for(let i=0;i<6;i++)D(x0+Math.floor(R()*w),y0+6+Math.floor(R()*(h-6)),R()<.5?'⒢':'⒱')}
  else if(ty==='hos'){grassAll(3);tower(x0,y0,w,6,52,'#f0f0f0','neoh');NPOI.osp=[cx,y0+6];ents.push({k:'neos',st:'osp',n:'Ospedale San Lia',px:cx+.5,py:y0+6.5});ents.push(neoNpc('lia55',cx+2,y0+7));NEO.carS=NEO.carS||[];NEO.carS.push([x0,y1-1,0,'amb'])}
  else if(ty==='pol'){grassAll(5);tower(x0,y0,w,6,40,'#3a4a7a','neop');NPOI.pol=[cx,y0+6];ents.push({k:'neos',st:'pol',n:'Stazione di polizia',px:cx+.5,py:y0+6.5});ents.push(neoNpc('marcus55',cx-2,y0+7));NEO.carS=NEO.carS||[];for(let i=0;i<3;i++)NEO.carS.push([x0+1+i*3,y1-1,-Math.PI/2,'pol'])}
  else if(ty==='apt'){grassAll(3);tower(x0,y0,6,6,72,'#c8a080','neo');NPOI.apt=[x0+3,y0+6];ents.push({k:'neos',st:'casa',n:'Il tuo appartamento',px:x0+3.5,py:y0+6.5});H({x:x0+7,y:y0,w:4,h:4,wall:'#e0d0b0',roof:'#7a3a2a',ht:24});T(x0+3,y0+7,7)}
  else if(ty==='bar'){grassAll(3);shop(x0,y0,'bar','Bar del Drago',6,5,'#6a3a2a','BAR');ents.push(neoNpc('tommaso55',x0+5,y0+6));tower(x0+7,y0,4,8,96,col(glass));NPOI.bar=[x0+3,y0+5]}
  else if(ty==='car'){grassAll(5);shop(x0,y0,'conc','Motori Aldric',7,5,'#d8e0e8','MOTORI');tower(x0+8,y0,3,5,28,'#8a8a8a','neow');NPOI.garage=[x0+9,y0+6];ents.push(neoNpc('nino55',x0+9,y0+7));ents.push({k:'neos',st:'off',n:'Officina di Nino',px:x0+9.5,py:y0+5.5});
    NEO.carS=NEO.carS||[];for(let i=0;i<3;i++)NEO.carS.push([x0+1+i*2.6,y0+8,Math.PI/2,['sport','suv','berl'][i]])}
  else if(ty==='arm'){grassAll(3);shop(x0,y0,'arm','Armeria Ferro & Piombo',5,4,'#5a5a5a','ARMI');shop(x0+6,y0,'moda','Moda 2026',5,4,'#e8c8d8','MODA');tower(x0,y0+6,w,4,58,col(glass))}
  else if(ty==='shp'){grassAll(3);shop(x0,y0,'kiosk','Edicola e caffè',4,4,'#d8b878','CAFFÈ');tower(x0+5,y0,6,5,64,col(glass));H({x:x0,y:y0+6,w:5,h:4,wall:'#e8d8c0',roof:'#3a5a8a',ht:26});D(x1,y1,'⒨')}
  else if(ty==='bnk'){grassAll(3);tower(x0+1,y0,w-2,6,46,'#e8e0d0','neob');NPOI.banca=[cx,y0+6];for(let x=x0+1;x<=x1-1;x+=2)D(x,y0+6,'⒥');ents.push({k:'neos',st:'banca',n:'Banca Corona',px:cx+.5,py:y0+7.5})}
  if(ty==='ind'||ty==='car'||ty==='pol'){for(let y=y1-2;y<=y1;y++)for(let x=x0;x<=x1;x++)if(M[y][x]===0&&!DEC[y][x])T(x,y,5)}}
/* ---- i personaggi ---- */
Object.assign(NPCS,{
  tommaso55:{n:'Tommaso, il barista',c:'#6a3a2a',hat:'#2a2a2a',ln:['Il Bar del Drago è qui da mille anni. Be\', il nome almeno.','Mio nonno del nonno del nonno serviva birra a un re. Io servo caffè a chi capita.']},
  nino55:{n:'Nino, il meccanico',c:'#3a5a8a',hat:'#c03a2a',ln:['Un motore è come un drago: va trattato bene, sennò ti brucia.','Se me la porti ammaccata, te la rimetto come nuova. Quasi.']},
  lia55:{n:'Dottoressa Lia',c:'#f0f0f0',hat:'#3a8a6a',ln:['Turno di notte, turno di giorno... qui non si dorme mai.','La mia antenata curava con la Luce. Io con quello che ho.']},
  marcus55:{n:'Commissario Marcus',c:'#2a3a6a',hat:'#1a2a4a',ln:['Aldoria è una città tranquilla. Tranne quando non lo è.','I Corvi si stanno allargando. Mi servirebbe qualcuno che non ha paura.']}});
const NPED=['Che traffico, oggi...','Hai visto il nuovo grattacielo in centro?','Scusa, vado di fretta!','Dicono che di notte al porto si vedano i Corvi.','Bella giornata, eh?','Il bus è in ritardo, come sempre.','Hai sentito? Hanno rapinato un furgone in viale Aldric.','La statua del Re in piazza è il posto migliore per i selfie.','Al Bar del Drago fanno il caffè migliore della città.','Il mio telefono è scarico. Di nuovo.'];
for(let i=0;i<10;i++)NPCS['neop'+i]={n:['Passante','Turista','Studente','Impiegata','Pensionato','Corriere','Ragazza','Musicista','Commesso','Atleta'][i],c:'#888',hat:'#444',ln:[NPED[i],NPED[(i+3)%10]]};
const NSK=['#f1c27d','#e0ac69','#c68642','#8d5524','#ffdbac','#f6c9a0'],NTP=['#c0392b','#2980b9','#27ae60','#8e44ad','#f39c12','#2c3e50','#e8e8e8','#1abc9c','#d35400','#34495e','#e84393','#fdcb6e'],NLG=['#2c3e50','#34495e','#1a1a2a','#5a4a3a','#3a5a8a','#6a6a6a'];
function neoMan(o){const r=sd(hs(o.seed||uid())),p=a=>a[Math.floor(r()*a.length)],hair=p(['#2a1a10','#5a3a1a','#d8b048','#1a1a1a','#8a3a1a','#c8c8c8']),x=[];
  if(r()<.7)x.push(['hd',-.16,-.13,28,.32,.27,2.6,hair]);if(r()<.25)x.push(['hd',-.16,-.15,26,.32,.06,5,hair]);if(o.cap)x.push(['hd',-.17,-.14,28.5,.34,.29,2,o.cap],['hd',-.1,.13,28.5,.2,.1,1,o.cap]);for(const q of o.x||[])x.push(q);
  return mHum({s:o.s||1,sk:o.sk||p(NSK),tp:o.tp||p(NTP),lg:o.lg||p(NLG),ey:'#111',mouth:'#7a3a2a',x})}
function neoNpc(id,x,y){const e=mkNpc(id,x,y,{});const D2={tommaso55:{tp:'#f0f0f0',lg:'#2a2a2a',x:[['bd',-.21,.12,9,.42,.02,9,'#6a3a2a']]},nino55:{tp:'#3a5a8a',lg:'#3a5a8a',cap:'#c03a2a'},lia55:{tp:'#f4f4f4',lg:'#3a8a6a',x:[['bd',-.05,.13,15,.1,.01,3,'#c0392b']]},marcus55:{tp:'#2a3a6a',lg:'#1a2a4a',cap:'#1a2a4a',x:[['bd',.08,.13,17,.06,.01,2,'#d4af37']]}}[id]||{};
  e.m=neoMan(Object.assign({seed:id},D2));e.neo=1;return e}
function neoPed(x,y){const i=Math.floor(R()*10),e=mkNpc('neop'+i,x,y,{wd:1});e.m=neoMan({seed:'p'+x+'|'+y});e.neo=1;e.ped=1;ents.push(e);return e}
/* ---- le auto ---- */
const CARM={berl:{n:'Berlina',l:1.5,w:.72,h:6,ch:5,v:9,c:['#c0392b','#2980b9','#e8e8e8','#2c3e50','#7f8c8d','#16a085']},sport:{n:'Sportiva',l:1.6,w:.74,h:4.5,ch:4,v:13.5,c:['#e74c3c','#f1c40f','#2ecc71','#ff7a2a','#1a1a1a']},
  suv:{n:'SUV',l:1.6,w:.8,h:8,ch:6,v:8.5,c:['#2c3e50','#34495e','#95a5a6','#5a3a2a']},van:{n:'Furgone',l:1.8,w:.82,h:11,ch:0,v:7,c:['#ecf0f1','#bdc3c7','#d35400']},
  taxi:{n:'Taxi',l:1.5,w:.72,h:6,ch:5,v:9.5,c:['#f1c40f']},pick:{n:'Pick-up',l:1.7,w:.78,h:7,ch:5,v:9,c:['#8e44ad','#c0392b','#27ae60','#6a4a2a']},
  pol:{n:'Volante della polizia',l:1.55,w:.74,h:6,ch:5,v:11.5,c:['#f4f4f4']},amb:{n:'Ambulanza',l:1.9,w:.84,h:12,ch:0,v:9,c:['#f4f4f4']}};
const CARP={berl:4000,sport:15000,suv:9000,van:5000,pick:7000,taxi:6000};
function carMk(mdl,x,y,a,o){const C=CARM[mdl]||CARM.berl,r=Math.random;return Object.assign({k:'car',mdl,px:x,py:y,a,va:a,v:0,col:C.c[Math.floor(r()*C.c.length)],hp:100,mx:100,n:C.n,ai:null},o||{})}
function neoCars(){NEO.cars=[];const L=[];for(const r of NRX)for(let x=4;x<97;x+=2){if(NRX.some(c=>x>=c-1&&x<=c+3))continue;L.push([x,r+.9,2],[x,r+2.1,0])}
  for(const c of NRX)for(let y=4;y<97;y+=2){if(NRX.some(r=>y>=r-1&&y<=r+3))continue;L.push([c+.9,y,1],[c+2.1,y,3])}
  for(let i=0;i<26&&L.length;i++){const[x,y,d]=L.splice(Math.floor(R()*L.length),1)[0];const m=['berl','berl','taxi','suv','van','pick','sport','berl'][Math.floor(R()*8)];ents.push(carMk(m,x,y,d*Math.PI/2,{ai:{d,v:4.5+R()*2.5}}))}
  for(const[x,y,a,m]of NEO.carS||[])ents.push(carMk(m,x+.9,y+.5,a,{park:1}));NEO.carS=[];
  // parcheggi
  for(let y=1;y<99;y++)for(let x=1;x<99;x++)if(NT[y*NN+x]===5&&R()<.12&&M[y][x]===0)ents.push(carMk(['berl','suv','pick','van','sport'][Math.floor(R()*5)],x+.5,y+.5,R()<.5?Math.PI/2:-Math.PI/2,{park:1}))}
// i pezzi del modello: [u (avanti), v (di lato), z, lunghezza, larghezza, altezza, colore], centrati sull'auto
function carParts(e){const C=CARM[e.mdl]||CARM.berl,L=C.l,Wd=C.w,c=e.col,dk=shx(c,.72),gl='#1e2a3a',hl=t%1<.5;const P2=[];const A=(u,v,z,l,w,h,cc)=>P2.push([u,v,z,l,w,h,cc]);
  for(const[u,v]of[[L*.3,Wd*.5],[L*.3,-Wd*.5],[-L*.3,Wd*.5],[-L*.3,-Wd*.5]])A(u-.14,v-(v>0?.05:.06),0,.28,.11,3.4,'#151515');
  A(-L/2,-Wd/2,2,L,Wd,C.h-(C.ch?C.ch:0)>0?Math.max(3,C.h-C.ch):4,c);
  if(e.mdl==='van'||e.mdl==='amb'){A(-L/2,-Wd/2,2,L,Wd,C.h,c);A(L/2-.32,-Wd/2+.04,C.h-4,.03,Wd-.08,3,gl);A(L/2-.1,-Wd/2,2,.12,Wd,5,dk);if(e.mdl==='amb'){A(-L/2+.2,Wd/2-.005,6,.5,.01,3,'#c0392b');A(-.25,-.1,C.h+2,.5,.2,1.4,hl?'#ff3a3a':'#3a6aff')}}
  else{const cz=2+Math.max(3,C.h-C.ch),cl=e.mdl==='sport'?L*.38:e.mdl==='pick'?L*.32:L*.5,co=e.mdl==='pick'?.08:-.05;A(-cl/2+co,-Wd/2+.06,cz,cl,Wd-.12,C.ch,gl);A(-cl/2+co+.04,-Wd/2+.08,cz+C.ch-.6,cl-.08,Wd-.16,1.2,c);
    if(e.mdl==='pick')A(-L/2,-Wd/2,cz,L*.36,.05,2,dk),A(-L/2,Wd/2-.05,cz,L*.36,.05,2,dk);if(e.mdl==='sport')A(-L/2,-Wd/2+.05,cz+1,.12,Wd-.1,1,dk);
    if(e.mdl==='taxi'){A(-.12,-.15,cz+C.ch,.24,.3,1.6,'#1a1a1a');A(-.1,-.13,cz+C.ch+1.4,.2,.26,.6,'#ffe27a')}
    if(e.mdl==='pol'){A(-.3,-Wd/2-.005,3,.6,.01,2,'#2a4aa8');A(-.3,Wd/2-.005,3,.6,.01,2,'#2a4aa8');const on=e.sir||NEO.W>0;A(-.12,-.26,cz+C.ch,.24,.24,1.4,on&&hl?'#ff2a2a':'#7a1a1a');A(-.12,.02,cz+C.ch,.24,.24,1.4,on&&!hl?'#2a5aff':'#1a2a7a')}}
  A(L/2-.02,-Wd/2+.06,3.2,.04,.14,1.4,'#fff6c0');A(L/2-.02,Wd/2-.2,3.2,.04,.14,1.4,'#fff6c0');A(-L/2-.02,-Wd/2+.06,3.4,.04,.14,1.2,'#d02020');A(-L/2-.02,Wd/2-.2,3.4,.04,.14,1.2,'#d02020');
  return P2}
function carDraw(e,ox,oy,a){const ca=Math.cos(a),sa=Math.sin(a),L=carParts(e).map(q=>{const cu=q[0]+q[3]/2,cv=q[1]+q[4]/2;return[q,ox+cu*ca-cv*sa+oy+cu*sa+cv*ca]});L.sort((p,q)=>p[1]-q[1]||p[0][2]-q[0][2]);
  const dmg=e.hp<e.mx*.45;for(const[q]of L)rbox(q[0],q[1],q[2],q[3],q[4],q[5],dmg&&q[6]===e.col?shx(e.col,.7):q[6],ca,sa,ox,oy);
  if(e.hp<e.mx*.35&&cineOK()&&Math.random()<.3)burst(ox+ca*.5,oy+sa*.5,1,e.hp<e.mx*.15?['#ff7a2a','#ffd84a']:['#555','#888'],{v:.2,up:40,gr:-20,b:0,d:1.2,s:4,z:10})}
/* ---- il traffico ---- */
function carAI(e,dt){const A=e.ai,dirs=[[1,0],[0,1],[-1,0],[0,-1]],[dx,dy]=dirs[A.d];let vt=A.v;
  // qualcuno davanti? si frena
  for(const o of ents){if(o===e||!(o.k==='car'||o.k==='npc'||o.k==='en'))continue;const rx=o.px-e.px,ry=o.py-e.py,f=rx*dx+ry*dy,l=Math.abs(rx*dy-ry*dx);if(f>0&&f<(o.k==='car'?2.1:1.5)&&l<.7){vt=0;break}}
  {const rx=P.px-e.px,ry=P.py-e.py,f=rx*dx+ry*dy,l=Math.abs(rx*dy-ry*dx);if(!NEO.car&&f>0&&f<1.5&&l<.7){vt=0;if(!(e.hk>t)){e.hk=t+2;tone(500,.12,'square',.03)}}}
  e.v+=(vt-e.v)*Math.min(1,dt*(vt<e.v?6:1.5));const s=e.v*dt;e.px+=dx*s;e.py+=dy*s;e.a=A.d*Math.PI/2;
  // gli incroci
  const ax=A.d&1?e.py:e.px,pc=A.d&1?e.px:e.py,inI=NRX.find(c=>ax>=c&&ax<=c+3),key=inI!=null?inI+'|'+NRX.find(r=>pc>=r-.2&&pc<=r+3.2):'';
  if(inI!=null&&key!==A.li&&A.nd==null){A.li=key;const pr=NRX.find(q=>pc>=q-.2&&pc<=q+3.2);if(pr!=null){const col=A.d&1?pr:inI,row=A.d&1?inI:pr,opt=[];const ok=(d)=>{if(d===(A.d+2)%4)return false;if(d===0)return col+3<99;if(d===2)return col>1;if(d===1)return row+3<99;return row>1};
    for(const d of[0,1,2,3])if(ok(d))opt.push(d);const st=opt.includes(A.d);let nd=st&&Math.random()<.5?A.d:opt[Math.floor(Math.random()*opt.length)];if(nd==null)nd=(A.d+2)%4;
    if(nd!==A.d){A.nd=nd;A.tc=nd===1?col+.9:nd===3?col+2.1:nd===0?row+2.1:row+.9}}}
  if(A.nd!=null){const pa=A.nd&1?e.px:e.py,go=A.d===0?e.px>=A.tc:A.d===2?e.px<=A.tc:A.d===1?e.py>=A.tc:e.py<=A.tc;if((A.nd&1?A.d===0||A.d===2:A.d===1||A.d===3)&&go){if(A.nd&1)e.px=A.tc;else e.py=A.tc;A.d=A.nd;A.nd=null}}
  if(e.px<1.5||e.py<1.5||e.px>99.5||e.py>99.5){A.d=(A.d+2)%4;A.nd=null;e.px=clamp(e.px,1.6,99.4);e.py=clamp(e.py,1.6,99.4)}}
/* ---- guidare ---- */
const keyDir0=keyDir;
keyDir=function(){if(MODE==='neo'&&NEO.car)return null;return keyDir0()};
function carEnter(e){if(!e||NEO.car||e.burn)return;if(e.ai){const[x,y]=nearFree(Math.floor(e.px)+1,Math.floor(e.py)+1);const d=neoPed(x,y);d.flee=t+6;msg('Il guidatore scappa via!');if(e.mdl==='pol'||e.mdl==='taxi'&&Math.random()<.2)wanted(e.mdl==='pol'?2:1)}
  else if(e.mdl==='pol'&&!e.mine)wanted(2);
  e.ai=null;e.park=0;NEO.car=e;P.path=[];P.tg=null;tone(220,.15,'square',.04);setTimeout(()=>tone(140,.4,'sawtooth',.03),150);msg((e.mine?'La tua ':'')+e.n+' · WASD o la levetta per guidare, R per scendere')}
function carExit(){const e=NEO.car;if(!e)return;NEO.car=null;e.v=0;const ca=Math.cos(e.a),sa=Math.sin(e.a);let p=null;for(const s of[1,-1]){const x=e.px-sa*s*1,y=e.py+ca*s*1;if(!blk(x,y)){p=[x,y];break}}if(!p){const q=nearFree(e.px|0,e.py|0);p=[q[0]+.5,q[1]+.5]}P.px=p[0];P.py=p[1];P.path=[];tone(300,.08,'triangle',.04)}
function carDrive(e,dt){const C=CARM[e.mdl]||CARM.berl,kd=keyDir0();let thr=0;
  if(kd){const ta=Math.atan2(kd[1],kd[0]);let df=ta-e.a;while(df>Math.PI)df-=6.283;while(df<-Math.PI)df+=6.283;
    if(Math.abs(df)>2.3&&e.v>1)thr=-1;else if(Math.abs(df)>2.3){thr=-.6;df=0}else{thr=1;const tr=(2.6+Math.min(1,Math.abs(e.v)/4))*dt*(e.v<0?-1:1);e.a+=clamp(df,-tr,tr)*Math.min(1,Math.abs(e.v)/2+.25)}}
  if(KEYS[' ']||KEYS.shift){thr=0;e.v*=Math.pow(.15,dt)}
  if(thr>0)e.v=Math.min(C.v,e.v+dt*(6+C.v*.4));else if(thr<0)e.v=Math.max(-3.5,e.v-dt*14);else e.v*=Math.pow(.35,dt);
  const ca=Math.cos(e.a),sa=Math.sin(e.a),s=e.v*dt,nx=e.px+ca*s,ny=e.py+sa*s,f=(e.v>=0?1:-1)*C.l*.5,hit=(x,y)=>blk(x,y)&&!(M[y|0]&&M[y|0][x|0]===2&&false);
  const pts=[[f,0],[f,.32],[f,-.32]].map(([u,v])=>[nx+ca*u-sa*v,ny+sa*u+ca*v]);
  if(pts.some(([x,y])=>hit(x,y))){const sp=Math.abs(e.v);if(sp>3.5){e.hp-=sp*2.2;shake(Math.min(.6,sp*.04));tone(80,.18,'sawtooth',.07);if(cineOK())sparks(pts[0][0],pts[0][1],8,['#ffd84a','#ffffff'],60)}e.v=-e.v*.25}
  else{e.px=nx;e.py=ny}
  e.va=e.a;P.px=e.px;P.py=e.py;P.dr=[ca,sa];
  // urti: passanti, nemici, altre auto
  if(Math.abs(e.v)>2.4)for(const o of ents.slice()){if(o===e)continue;const d=Math.hypot(o.px-e.px-ca*.4,o.py-e.py-sa*.4);
    if(o.k==='npc'&&o.neo&&!o.wd0&&d<.8&&o.ped){neoKnock(o,e);wanted(1,1)}
    else if(o.k==='en'&&d<.85&&!(o.rhit>t)){o.rhit=t+.6;hurtE(o,Math.round(Math.abs(e.v)*6+atk()*.5),0,false);if(ents.includes(o)&&!o.boss)mv(o,ca*.8,sa*.8)}
    else if(o.k==='car'&&d<1.2&&!(o.rhit>t)){o.rhit=t+.5;const sp=Math.abs(e.v);o.hp-=sp*3;e.hp-=sp*1.5;if(o.ai){o.ai.v=0;o.v=0}mv(o,ca*.3,sa*.3);e.v*=.4;shake(.25);tone(90,.15,'sawtooth',.06);if(o.tgt55)msg('Colpito! Ancora un po\'...')}}}
function neoKnock(o,car){const i=ents.indexOf(o);if(i<0)return;ents.splice(i,1);ents.push({k:'dead',m:o.m,px:o.px,py:o.py,t0:t,fc:o.m&&o.m.rg?faceOf(Math.cos(car.a),Math.sin(car.a)):null});tone(150,.12,'square',.05);
  setTimeout(()=>{if(nOn()&&Zk==='neo_city'){const L=[];for(let k=0;k<60&&!L.length;k++){const x=2+Math.floor(Math.random()*96),y=2+Math.floor(Math.random()*96);if(NT&&NT[y*NN+x]===2&&M[y][x]===4&&Math.hypot(x-P.px,y-P.py)>18)L.push([x,y])}if(L.length){const R0=R;R=Math.random;try{neoPed(L[0][0],L[0][1])}finally{R=R0}}}},12000)}
/* ---- le armi da fuoco ---- */
MX55T.w=EQT.w.slice();
EQT.w.push('pis','smg','sgn','rfl');
const GUN={pis:{n:'Pistola',m:1,cd:.34,r:8.5,sp:.05,k:1,c:'#ffd84a',p:500,v:10},smg:{n:'Mitraglietta',m:.42,cd:.1,r:7.5,sp:.13,k:1,c:'#ffe88a',p:2200,v:13},sgn:{n:'Fucile a pompa',m:.5,cd:.85,r:5.5,sp:.28,k:6,c:'#ffb04a',p:3600,v:16},rfl:{n:'Fucile d\'assalto',m:.85,cd:.15,r:11,sp:.05,k:1,c:'#fff2a0',p:6500,v:22}};
{const i0=itype;itype=function(it){if(it&&it.s==='w'&&it.gun55&&GUN[it.gun55])return it.gun55;return i0(it)}}
{const w0=wpnL;wpnL=function(ty,c){const B=EQB,X=.37;switch(ty){
  case 'pis':return[B(X,0,9.2,.05,.07,4,'#2a2a2a'),B(X,.1,13,.05,.3,2.4,'#3a3a40'),B(X,.27,13.5,.04,.06,1.3,'#151515'),B(X,.05,12.6,.055,.08,.6,c)];
  case 'smg':return[B(X,.08,12,.06,.42,3,'#2a2a30'),B(X,.05,8.8,.04,.08,3.4,'#151515'),B(X,-.08,9.6,.05,.07,3,'#2a2a2a'),B(X,.33,12.8,.03,.12,1.2,'#111'),B(X,0,14.8,.04,.12,.6,c)];
  case 'sgn':return[B(X,-.18,11.5,.05,.2,2.4,'#6b4a2b'),B(X,.1,12,.06,.5,2.4,'#2a2a2a'),B(X,.2,10.7,.06,.16,1.4,'#6b4a2b'),B(X,.4,12.6,.04,.2,1.2,'#151515'),B(X,0,14.2,.04,.1,.6,c)];
  case 'rfl':return[B(X,-.2,11,.05,.22,3,'#2a2a2a'),B(X,.08,12,.06,.5,3,'#3a3a3a'),B(X,.12,8.8,.05,.08,3.4,'#151515'),B(X,.43,12.8,.03,.24,1.2,'#111'),B(X,.06,15,.04,.16,1.3,'#111'),B(X,.2,15.2,.03,.04,.6,c)]}return w0(ty,c)}}
function gunItem(k,r){const G=GUN[k],rr=clamp(r|0,0,3),v=Math.round(G.v*RM[rr]*(1+(P?P.lv:1)*.06));return{u:uid(),s:'w',r:rr,v,n:G.n+(rr?' '+['','Tattica','d\'Élite','Leggendaria'][rr]:''),p:Math.round(G.p*.3),gun55:k}}
const gunOf=()=>{const w=P&&P.eq&&P.eq.w;return w&&w.gun55&&GUN[w.gun55]?GUN[w.gun55]:null};
{const i0=icon;icon=function(it){if(!it||!it.gun55||!GUN[it.gun55])return i0(it);const k='gun55|'+it.gun55+'|'+(it.r|0);if(ICO[k])return ICO[k];
  const big=document.createElement('canvas');big.width=big.height=256;const og=g,bg=big.getContext('2d');g=bg;g.setTransform(2.4,0,0,2.4,128,170);try{drawL(wpnL(it.gun55,RC[clamp(it.r|0,0,4)]).map(b=>[(b[0]-.37)*2.2,b[1]*2.2,b[2]-8,b[3]*2.2,b[4]*2.2,b[5]*1.6,b[6]]),0,0,0)}finally{g=og}
  const d=bg.getImageData(0,0,256,256).data;let x0=256,y0=256,x1=-1,y1=-1;for(let y=0;y<256;y++)for(let x=0;x<256;x++)if(d[(y*256+x)*4+3]>8){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y}if(x1<0)return i0(it);
  const out=document.createElement('canvas');out.width=out.height=96;const o=out.getContext('2d'),bw=x1-x0+1,bh=y1-y0+1,sc=Math.min(84/bw,84/bh);o.shadowColor='rgba(0,0,0,.55)';o.shadowBlur=4;o.drawImage(big,x0,y0,bw,bh,48-bw*sc/2,48-bh*sc/2,bw*sc,bh*sc);return ICO[k]=out.toDataURL()}}
function neoFire(tg){const G=gunOf();if(!G||NEO.cd>0||P.hp<=0||NEO.car)return false;NEO.cd=G.cd;let a;if(tg)a=Math.atan2(tg.py-P.py,tg.px-P.px);else{const d=P.dr||[0,1];a=Math.atan2(d[1],d[0])}
  P.dr=[Math.cos(a),Math.sin(a)];P.fc=faceOf(P.dr[0],P.dr[1]);P.sw=.12;P.swc++;
  for(let i=0;i<G.k;i++){const aa=a+(Math.random()-.5)*G.sp*2,r=roll(G.m);NEO.b.push({x:P.px+Math.cos(a)*.4,y:P.py+Math.sin(a)*.4,vx:Math.cos(aa)*22,vy:Math.sin(aa)*22,t:G.r/22,d:r.d,cr:r.cr,c:G.c})}
  tone(G===GUN.sgn?90:G===GUN.rfl?130:180,.06,'square',.07);if(AU.ac)try{nz(AU.ac.currentTime,G===GUN.sgn?.2:.07,G===GUN.sgn?.12:.06,G===GUN.sgn?900:2400,'bandpass',AU.sf)}catch(e){}
  if(cineOK())sparks(P.px+Math.cos(a)*.55,P.py+Math.sin(a)*.55,3,[G.c,'#ffffff'],30);NEO.shot=t;return true}
function neoAim(){const G=gunOf();if(!G)return null;const d=P.dr||[0,1];let b=null,bd=G.r;for(const e of ents){if(e.k!=='en'||e.hp<=0)continue;const dx=e.px-P.px,dy=e.py-P.py,l=Math.hypot(dx,dy);if(l>bd)continue;if((dx*d[0]+dy*d[1])/(l||1)<.35&&l>1.6)continue;bd=l;b=e}return b}
function neoBullets(dt){for(const b of NEO.b){const n=Math.ceil(dt*22/.35);for(let k=0;k<n&&b.t>0;k++){const s=dt/n;b.t-=s;b.x+=b.vx*s;b.y+=b.vy*s;
    if(blk(b.x,b.y)&&!(M[b.y|0]&&M[b.y|0][b.x|0]===2)){b.t=0;if(cineOK())sparks(b.x,b.y,3,['#d8d0c0','#ffffff'],30);break}
    for(const q of ents){if(q.k==='en'&&Math.hypot(q.px-b.x,q.py-b.y)<.5){b.t=0;hurtE(q,b.d,0,b.cr);if(q.pol55&&!(NEO.pk>t)){NEO.pk=t+4;wanted(1)}break}
      if(q.k==='car'&&q!==NEO.car&&Math.hypot(q.px-b.x,q.py-b.y)<.7){b.t=0;q.hp-=b.d*.12+2;if(q.ai&&!q.tgt55&&Math.random()<.4){const ai=q.ai;q.ai=null;q.v=0;const[x,y]=nearFree(q.px|0,(q.py|0)+1);const R0=R;R=Math.random;try{neoPed(x,y).flee=t+5}finally{R=R0}}if(cineOK())sparks(b.x,b.y,3,['#ffd84a','#ffffff'],30);break}
      if(q.k==='npc'&&q.ped&&Math.hypot(q.px-b.x,q.py-b.y)<.45){b.t=0;q.flee=t+6;flt(q,'Aiuto!','#ffb0b0');wanted(1,1);break}}}}
  NEO.b=NEO.b.filter(b=>b.t>0)}
/* ---- il ricercato e la polizia ---- */
Object.assign(E,{
  neo_teppista:{n:'Teppista dei Corvi',hp:44,at:7,xp:12,sp:2.7,r:1.2,cd:1,ag:7,m:hum('#1a1a1a','#f1c27d',1)},
  neo_gangster:{n:'Corvo armato',hp:54,at:9,xp:18,sp:2.3,r:5,cd:1.5,ag:9,rng:'#ffd84a',m:hum('#2a2a2a','#e0ac69',1)},
  neo_corvo:{n:'Max «il Corvo» Malakar',hp:900,at:20,xp:500,sp:2.1,r:6,cd:1.2,ag:12,boss:1,slam:1,rng:'#c46bff',sum:'neo_gangster',m:hum('#1a1a2a','#e0ac69',1.3,[4,'#1a1a2a'])},
  neo_agente:{n:'Agente di polizia',hp:60,at:9,xp:10,sp:2.6,r:5.5,cd:1.4,ag:14,rng:'#ffe27a',m:hum('#2a3a6a','#f1c27d',1)},
  neo_swat:{n:'Squadra speciale',hp:140,at:14,xp:24,sp:2.4,r:6.5,cd:1.1,ag:16,rng:'#ffffff',m:hum('#1a1a1a','#c68642',1.12)}});
try{E.neo_teppista.m=neoMan({seed:'tp',tp:'#1a1a1a',lg:'#2a2a3a',x:[...HT.bandana('#1a1a1a'),...WP.club()]});E.neo_gangster.m=neoMan({seed:'gg',tp:'#2a2a2a',lg:'#1a1a1a',x:[['hd',-.15,.12,23.5,.3,.02,1.8,'#111'],...WP.pistol()]});
  E.neo_corvo.m=neoMan({seed:'mx',s:1.3,tp:'#1a1a2a',lg:'#111',x:[['bd',-.23,-.13,15,.46,.28,4,'#3a1a4a'],['hd',-.15,.12,23.5,.3,.02,1.8,'#c46bff'],...WP.rifle()]});
  E.neo_agente.m=neoMan({seed:'ag',tp:'#2a3a6a',lg:'#1a2a4a',cap:'#1a2a4a',x:[['bd',.08,.13,17,.06,.01,2,'#d4af37'],...WP.pistol()]});E.neo_swat.m=neoMan({seed:'sw',s:1.12,tp:'#1a1a1a',lg:'#1a1a1a',x:[...HT.helmet('#1a1a1a'),['bd',-.23,-.13,12,.46,.28,8,'#2a2a2a'],...WP.rifle()]})}catch(e){console.warn('Aldoria 2026: modelli',e)}
for(const k of['neo_teppista','neo_gangster','neo_corvo','neo_agente','neo_swat'])E[k].el55=k==='neo_corvo'?'ombra':'terra';
function wanted(n,quiet){if(!nOn())return;const w0=NEO.W;NEO.W=clamp(Math.max(NEO.W+n,n>1?n:0),0,5);if(NEO.W!==w0){NEO.wt=0;if(!quiet||NEO.W>w0){tone(880,.1,'square',.05);setTimeout(()=>tone(660,.12,'square',.05),130)}if(NEO.W>w0)msg('★ Ricercato: '+'★'.repeat(NEO.W)+'☆'.repeat(5-NEO.W))}}
function neoPolice(dt){const pol=ents.filter(e=>e.k==='en'&&e.pol55);if(NEO.W<=0){for(const e of pol){if(dist(e,P)>9)ents.splice(ents.indexOf(e),1);else{e.al=0;e.ag=0;e.tg=null}}return}
  // la polizia ti vede?
  const seen=pol.some(e=>dist(e,P)<11);NEO.wt=seen?0:NEO.wt+dt;if(NEO.wt>18){NEO.wt=0;NEO.W--;msg(NEO.W?'Le stelle scendono: '+'★'.repeat(NEO.W):'Li hai seminati: non sei più ricercato');tone(520,.1,'triangle',.05)}
  const want=[0,2,3,5,7,9][NEO.W];NEO.ps=(NEO.ps||0)-dt;if(pol.length<want&&NEO.ps<=0){NEO.ps=2.2;const L=[];for(let k=0;k<80&&L.length<1;k++){const a=Math.random()*6.283,r=15+Math.random()*7,x=Math.floor(P.px+Math.cos(a)*r),y=Math.floor(P.py+Math.sin(a)*r);if(x>1&&y>1&&x<99&&y<99&&M[y][x]===4)L.push([x,y])}
    if(L.length){const[x,y]=L[0],z=ZZ,l0=z.lv;z.lv=Math.max(2,Math.round(P.lv*.8)+NEO.W);let e;try{e=mk(NEO.W>=4?'neo_swat':'neo_agente',x,y)}finally{z.lv=l0}e.pol55=1;e.al=1;e.ag=30;e.b=Object.assign({},e.b,{ag:30});ents.push(e);if(NEO.W>=2&&Math.random()<.5){const c=carMk('pol',x+.5,y+.5,Math.random()*6.28,{park:1,sir:1});ents.push(c)}}}}
/* ---- le bande: i Corvi nelle zone industriali e al porto ---- */
function neoGangs(dt){NEO.gs=(NEO.gs||0)-dt;if(NEO.gs>0||!NEO.gz)return;NEO.gs=6;const n=ents.filter(e=>e.k==='en'&&e.gang55).length;if(n>=14)return;
  const G=NEO.gz[Math.floor(Math.random()*NEO.gz.length)];if(Math.hypot(G[0]-P.px,G[1]-P.py)<12)return;for(let k=0;k<2;k++){const[x,y]=nearFree(G[0]+Math.floor(Math.random()*5)-2,G[1]+Math.floor(Math.random()*5)-2);const z=ZZ,l0=z.lv;z.lv=Math.max(2,Math.round(P.lv*.7));let e;try{e=mk(Math.random()<.55?'neo_teppista':'neo_gangster',x,y)}finally{z.lv=l0}e.gang55=1;ents.push(e)}}
/* ---- le missioni: la storia di Aldoria 2026 ---- */
const NMS=[
  {n:'Benvenuto nel 2026',g:'tommaso55',tx:'Sei arrivato dalla gemma, vero? Si vede da come guardi le auto. Mio nonno raccontava di eroi che uscivano dallo Zaffiro... Non fare quella faccia. Ti ho trovato un posto dove stare: l\'appartamento qui dietro. Vai a vederlo.',st:[{k:'go',p:'apt',tx:'Raggiungi il tuo appartamento'}],rw:200},
  {n:'Quattro ruote',g:'nino55',tx:'In questa città senza un\'auto non sei nessuno. Prendine una, una qualsiasi: avvicinati e premi R. Poi portamela in officina, che te la sistemo. E tieni questa: per strada serve.',st:[{k:'car',tx:'Sali su un\'auto (avvicinati e premi R)'},{k:'go',p:'garage',car:1,tx:'Porta l\'auto all\'Officina di Nino'}],rw:400,give:'pis'},
  {n:'I Corvi',g:'tommaso55',tx:'Al porto c\'è una banda, i Corvi. Taglieggiano i pescatori, rubano dai container, e adesso girano armati. Nessuno fa niente. Tu sì, vero?',st:[{k:'kill',p:'porto',n:4,tx:'Caccia i Corvi dal porto'}],rw:700},
  {n:'Corsa contro il tempo',g:'lia55',tx:'Un carico di medicine è fermo al molo e il furgone si è rotto. Ho tre pazienti che aspettano. Ti prego: vai, prendile e portale qui. Più in fretta che puoi.',st:[{k:'car',tx:'Sali su un\'auto'},{k:'go',p:'molo',car:1,tx:'Ritira le medicine al molo'},{k:'go',p:'osp',car:1,tl:80,tx:'Porta le medicine all\'Ospedale'}],rw:900},
  {n:'Il carico',g:'marcus55',tx:'Ho saputo cosa hai fatto al porto. Ufficialmente non posso chiederti niente. Ufficiosamente: i Corvi hanno un magazzino nella zona industriale. Dentro c\'è qualcosa che brilla di blu. Voglio sapere cos\'è.',st:[{k:'kill',p:'ind',n:6,tx:'Ripulisci il magazzino dei Corvi'},{k:'go',p:'ind',tx:'Prendi il carico che brilla'}],rw:1300,lore:'È una scheggia di Zaffiro, identica alla gemma della Corona. I Corvi le cercano in tutta la città.'},
  {n:'Il corriere',g:'marcus55',tx:'Un corriere dei Corvi sta portando le schegge fuori città. Auto nera, va veloce. Fermalo: speronalo, sparagli, fai tu. Ma fermalo.',st:[{k:'chase',tx:'Ferma l\'auto del corriere (speronala o sparale)'}],rw:1600},
  {n:'Assalto alla banca',g:'marcus55',tx:'Allarme alla Banca Corona! I Corvi stanno svuotando il caveau: le schegge sono lì. I miei uomini sono bloccati. Sei l\'unico abbastanza vicino.',st:[{k:'kill',p:'banca',n:8,tx:'Ferma la rapina alla Banca Corona'}],rw:2200},
  {n:'Il Corvo',g:'tommaso55',tx:'Max Malakar. Il Corvo. Sai di chi è discendente, vero? Vuole riunire le schegge e riaprire la gemma dall\'altra parte. È al porto, nel magazzino grande. Questa volta finisce.',st:[{k:'boss',p:'porto',tx:'Affronta Max «il Corvo» Malakar al porto'}],rw:5000,end:1}];
const nmFix=()=>{P.neo=P.neo||{};const o=P.neo;o.m=o.m|0;if(o.s==null)o.s=-1;o.own=Array.isArray(o.own)?o.own:[];return o};
const nmCur=()=>{const o=nmFix();return o.s>=0?NMS[o.m]:null};
const nmPos=k=>{if(k==='ind'){const g2=(NEO.gz||[])[1]||(NEO.gz||[])[0]||[10,40];return g2}return NPOI[k]||[50,50]};
function nmStart(){const o=nmFix(),Ms=NMS[o.m];if(!Ms||o.s>=0)return;o.s=0;o.tl=0;cl();banner('Missione: '+Ms.n,Ms.st[0].tx,'pergamena');jingle([62,66,69,74],.1,'triangle');if(Ms.give&&!P.inv.concat(Object.values(P.eq)).some(i=>i&&i.gun55===Ms.give)){const it=gunItem(Ms.give,0);if(!P.eq.w||!P.eq.w.gun55)P.eq.w=it;else P.inv.push(it);recalc();msg('Ricevi: '+it.n+' (equipaggiata)')}nmStep();save()}
function nmStep(){const o=nmFix(),Ms=nmCur();if(!Ms)return;const S=Ms.st[o.s];if(!S)return;o.tl=S.tl?S.tl:0;NEO.ms=[];
  if(S.k==='kill'||S.k==='boss'){const[x,y]=nmPos(S.p),z=ZZ,l0=z.lv;z.lv=Math.max(2,Math.round(P.lv*.8)+(S.k==='boss'?3:1));try{const n=S.k==='boss'?5:S.n;for(let i=0;i<n;i++){const q=nearFree(x+Math.floor(Math.random()*7)-3,y+Math.floor(Math.random()*7)-3);const e=mk(i%2?'neo_gangster':'neo_teppista',q[0],q[1]);e.ms55=1;e.gang55=1;ents.push(e)}
      if(S.k==='boss'){const q=nearFree(x,y);const b=mk('neo_corvo',q[0],q[1]);b.ms55=1;b.boss55=1;ents.push(b)}}finally{z.lv=l0}}
  if(S.k==='chase'){const[x,y]=[NRX[1]+.9,30];const c=carMk('sport',x,y,Math.PI/2,{ai:{d:1,v:8.5},col:'#151515',hp:160,mx:160,tgt55:1,n:'Auto del corriere'});ents.push(c);NEO.ms=[c]}}
function nmTick(dt){const o=nmFix(),Ms=nmCur();if(!Ms)return;const S=Ms.st[o.s];if(!S)return;let done=false;
  if(S.tl){o.tl-=dt;if(o.tl<=0){nmFail('Tempo scaduto!');return}}
  if(S.k==='go'){const[x,y]=nmPos(S.p);done=Math.hypot(P.px-x-.5,P.py-y-.5)<2.2&&(!S.car||NEO.car)}
  else if(S.k==='car')done=!!NEO.car;
  else if(S.k==='kill'||S.k==='boss')done=!ents.some(e=>e.k==='en'&&e.ms55&&(S.k==='kill'||e.boss55));
  else if(S.k==='chase'){const c=NEO.ms&&NEO.ms[0];if(!c||!ents.includes(c)||c.hp<=0||c.burn)done=true;else if(c.ai)c.ai.v=Math.max(c.ai.v,8.5)}
  if(!done)return;o.s++;if(o.s<Ms.st.length){tone(880,.08,'triangle',.05);banner(Ms.n,Ms.st[o.s].tx,'pergamena');nmStep();save();return}
  // missione compiuta
  P.g+=Ms.rw;gainXP(Math.round(Ms.rw*.6));goldFly(Ms.rw);o.m++;o.s=-1;o.tl=0;NEO.ms=[];jingle([60,64,67,72,76,79,84],.09,'triangle');
  banner('Missione compiuta: '+Ms.n,'+'+Ms.rw+' $'+(Ms.lore?' · '+Ms.lore:''),'corona');if(Ms.end)setTimeout(()=>{PA={ti:'Aldoria 2026',tx:'Max Malakar crolla tra i container. Dalla sua giacca rotolano via le schegge di Zaffiro: brillano tutte insieme, poi si spengono.\n\nTommaso le raccoglie in un fazzoletto. «Mio nonno diceva che la gemma si apre per chi serve alla città. Sembra che tu serva ancora.»\n\nLa città è tua: gira, guida, compra. E se lo Zaffiro si riaccenderà, saprai dove trovarci.'};pn('txt')},2500);hud();save()}
function nmFail(why){const o=nmFix(),Ms=nmCur();if(!Ms)return;for(let i=ents.length-1;i>=0;i--)if(ents[i].ms55||ents[i].tgt55)ents.splice(i,1);o.s=-1;o.tl=0;NEO.ms=[];banner('Missione fallita',why+' Torna da '+NPCS[Ms.g].n+' per riprovare.','teschio');tone(150,.4,'sawtooth',.05);save()}
// il segnale della missione: una colonna di luce sul posto (o sopra il bersaglio)
function nmTarget(){const o=nmFix(),Ms=nmCur();if(!Ms){const nx=NMS[o.m];if(!nx)return null;const g2=ents.find(e=>e.k==='npc'&&e.nid===nx.g);return g2?{x:g2.px,y:g2.py,g:1}:null}const S=Ms.st[o.s];if(!S)return null;
  if(S.k==='chase'){const c=NEO.ms&&NEO.ms[0];return c&&ents.includes(c)?{x:c.px,y:c.py}:null}if(S.k==='car')return null;if(S.k==='kill'||S.k==='boss'){const e=ents.find(q=>q.k==='en'&&q.ms55);if(e)return{x:e.px,y:e.py,e:1}}const[x,y]=nmPos(S.p);return{x:x+.5,y:y+.5}}
// il dialogo con chi dà le missioni
{const p0=pn;pn=function(m,arg){p0(m,arg);if(m!=='npc'||PM!=='npc'||!nOn()||!PA)return;const o=nmFix(),nx=NMS[o.m],pe=$('pn');if(!pe||pe.querySelector('.nm55'))return;const last=[...pe.querySelectorAll('button')].pop();let h='';
  if(o.s<0&&nx&&nx.g===PA.nid)h=`<div class="qb nm55"><b>📜 ${esc(nx.n)}</b><p>${esc(nx.tx)}</p><span class="mu">Ricompensa: ${nx.rw} $${nx.give?' e una '+GUN[nx.give].n.toLowerCase():''}</span><br><button onclick="nmStart()">Accetta la missione</button></div>`;
  else if(o.s>=0&&nmCur()&&nmCur().g===PA.nid)h=`<div class="qb nm55"><b>${esc(nmCur().n)}</b> <span class="mu">in corso: ${esc(nmCur().st[o.s].tx)}</span><br><button onclick="nmFail('Hai lasciato perdere.');pn('npc')">Rinuncia</button></div>`;
  if(h&&last)last.insertAdjacentHTML('beforebegin',h)}}
/* ---- i negozi ---- */
ITK.add('car');ITK.add('neos');
{const a0=act;act=function(e){if(nOn()&&e&&e.k==='car'){carEnter(e);return}if(nOn()&&e&&e.k==='neos'){pn('neo_'+e.st);return}a0(e)}}
const neoBuyBtn=(lbl,pr,fn)=>`<button ${P.g<pr?'disabled':''} onclick="${fn}">${lbl} · ${pr} $</button>`;
X43P.neo_arm=()=>{let h=`<h3>🔫 Armeria Ferro & Piombo · ${P.g} $</h3><p class="x43t">Porto d'armi? Qui non lo chiede nessuno. Si spara cliccando su un nemico, o con Spazio verso quello più vicino davanti a te.</p>`;
  for(const k of Object.keys(GUN)){const G=GUN[k];h+=`<div class="it"><span><img class="ii" src="${icon({s:'w',gun55:k,r:0})}" alt=""><b>${G.n}</b> <span class="mu">gittata ${G.r} · ${G.k>1?G.k+' pallini':Math.round(1/G.cd*10)/10+' colpi/s'}</span></span><span>${neoBuyBtn('Compra',G.p,`neoBuyGun('${k}')`)}</span></div>`}
  h+=`<div class="it"><span>🦺 <b>Giubbotto antiproiettile</b> <span class="mu">corazza</span></span><span>${neoBuyBtn('Compra',1500,"neoBuyCl('c','Giubbotto antiproiettile',1500,2)")}</span></div><div class="it"><span>🏏 <b>Mazza da baseball</b></span><span>${neoBuyBtn('Compra',150,"neoBuyCl('w','Mazza da baseball',150,0)")}</span></div>`;
  return h+'<button onclick="cl()">Chiudi</button>'};
function neoBuyGun(k){const G=GUN[k];if(P.g<G.p)return;P.g-=G.p;const it=gunItem(k,P.lv>=12?1:0);if(!P.eq.w||!gunOf())P.eq.w=it;else P.inv.push(it);recalc();tone(700,.08,'triangle');msg('Hai comprato: '+it.n);hud();save();pn('neo_arm')}
function neoBuyCl(s,n,pr,r){if(P.g<pr)return;P.g-=pr;const it={u:uid(),s,r:clamp(r|0,0,3),v:Math.round(ibase(s,P.lv)*RM[clamp(r|0,0,3)]),n,p:Math.round(pr*.3)};if(!P.eq[s])P.eq[s]=it;else P.inv.push(it);recalc();tone(700,.08,'triangle');msg('Hai comprato: '+n);hud();save();if(PM)pn(PM)}
X43P.neo_moda=()=>`<h3>👕 Moda 2026 · ${P.g} $</h3><p class="x43t">Il look giusto apre tutte le porte. Anche quelle che non dovrebbe.</p>`+
  [['h','Berretto',300,0],['h','Cappuccio della felpa',450,1],['h','Maschera da hockey',900,1],['c','Giacca di pelle',800,1],['c','Tuta da motociclista',1200,2],['s','Scudo antisommossa',2000,2]].map(([s,n,pr,r])=>`<div class="it"><span><b>${n}</b> <span class="mu">${SN[s]}</span></span><span>${neoBuyBtn('Compra',pr,`neoBuyCl('${s}','${n.replace(/'/g,"\\'")}',${pr},${r})`)}</span></div>`).join('')+
  `<p><button onclick="cl();openLook()">✂ Cambia look (gratis)</button></p><button onclick="cl()">Chiudi</button>`;
X43P.neo_conc=()=>{const o=nmFix();let h=`<h3>🚗 Motori Aldric · ${P.g} $</h3><p class="x43t">Le auto comprate sono tue per sempre: le chiami con il telefono (📱 in alto o tasto T) e arrivano dove sei.</p>`;
  for(const k of Object.keys(CARP)){const C=CARM[k],has=o.own.includes(k);h+=`<div class="it"><span>🚗 <b>${C.n}</b> <span class="mu">velocità ${C.v}</span></span><span>${has?'<span class="mu">già tua</span>':neoBuyBtn('Compra',CARP[k],`neoBuyCar('${k}')`)}</span></div>`}return h+'<button onclick="cl()">Chiudi</button>'};
function neoBuyCar(k){const o=nmFix();if(P.g<CARP[k]||o.own.includes(k))return;P.g-=CARP[k];o.own.push(k);jingle([67,72,76,79],.08,'triangle');banner('🚗 '+CARM[k].n,'È tua: chiamala con il telefono','stella');neoCall(k);hud();save();pn('neo_conc')}
function neoCall(k){const o=nmFix();if(!o.own.includes(k))return;for(let i=ents.length-1;i>=0;i--)if(ents[i].k==='car'&&ents[i].mine&&ents[i]!==NEO.car)ents.splice(i,1);
  let best=null,bd=1e9;for(let y=2;y<99;y++)for(let x=2;x<99;x++){if(NT[y*NN+x]!==1)continue;const d=Math.hypot(x-P.px,y-P.py);if(d<bd&&d>1.5&&!ents.some(e=>e.k==='car'&&Math.hypot(e.px-x,e.py-y)<1.5)){bd=d;best=[x,y]}}
  if(!best)return;const c=carMk(k,best[0]+.5,best[1]+.5,0,{mine:1,park:1});c.col=CARM[k].c[0];ents.push(c);msg('La tua '+CARM[k].n+' ti aspetta qui vicino');cl()}
X43P.neo_tel=()=>{const o=nmFix(),Ms=nmCur(),nx=NMS[o.m];let h=`<h3>📱 Telefono · ${P.g} $ · ${'★'.repeat(NEO.W)}${'☆'.repeat(5-NEO.W)}</h3>`;
  h+=Ms?`<div class="qb"><b>${esc(Ms.n)}</b><br>${esc(Ms.st[o.s].tx)}${o.tl>0?' · ⏱ '+Math.ceil(o.tl)+' s':''}</div>`:nx?`<div class="qb">📜 Prossima missione: <b>${esc(nx.n)}</b> · parla con ${esc(NPCS[nx.g].n)}</div>`:'<div class="qb">Hai finito la storia: la città è tua.</div>';
  h+=`<h4>Le tue auto</h4>${o.own.length?o.own.map(k=>`<button onclick="neoCall('${k}')">🚗 Chiama la ${CARM[k].n}</button>`).join(''):'<p class="mu">Non hai auto: comprale da Motori Aldric.</p>'}`;
  return h+`<h4>Posti utili</h4><p class="mu">🏠 Appartamento · 🍺 Bar del Drago · 🔧 Officina e 🚗 Motori Aldric · 🔫 Armeria e 👕 Moda 2026 · ✚ Ospedale · 👮 Polizia · 🏦 Banca Corona · 🌊 Porto e spiaggia a sud.</p><button onclick="cl()">Chiudi</button>`};
X43P.neo_osp=()=>`<h3>✚ Ospedale San Lia · ${P.g} $</h3><p class="x43t">Ti rimettiamo in piedi. Il conto arriva dopo.</p>${neoBuyBtn('✚ Cure complete',100,"if(P.g>=100){P.g-=100;P.hp=P.mx;msg('Sei come nuovo');hud();pn('neo_osp')}")}<button onclick="cl()">Chiudi</button>`;
X43P.neo_pol=()=>{const f=NEO.W*600;return`<h3>👮 Stazione di polizia · ${P.g} $</h3>${NEO.W?`<p class="x43t">Sei ricercato (${'★'.repeat(NEO.W)}). Con ${f} $ di multa chiudiamo un occhio. Tutti e due.</p>${neoBuyBtn('Paga la multa',f,`if(P.g>=${f}){P.g-=${f};NEO.W=0;msg('Fedina pulita');hud();pn('neo_pol')}`)}`:'<p class="x43t">Fedina pulita. Continua così.</p>'}<button onclick="cl()">Chiudi</button>`};
X43P.neo_casa=()=>`<h3>🏠 Il tuo appartamento</h3><p class="x43t">Un letto, una finestra sulla città e una porta che si chiude. Qui il gioco si salva, e qui torni se ti va male.</p><button onclick="P.hp=P.mx;nmFix().home=1;save();msg('Hai riposato: partita salvata');hud();pn('neo_casa')">🛏 Riposa e salva</button><button onclick="cl();openLook()">✂ Cambia look</button><button onclick="cl()">Chiudi</button>`;
X43P.neo_off=()=>{const c=ents.filter(e=>e.k==='car'&&(e===NEO.car||Math.hypot(e.px-P.px,e.py-P.py)<4)&&e.hp<e.mx);return`<h3>🔧 Officina di Nino · ${P.g} $</h3><p class="x43t">Ammaccature, fumo, motore che tossisce: porta qui l'auto e ci penso io.</p>${c.length?c.map((e,i)=>neoBuyBtn('🔧 Ripara la '+e.n,150,`if(P.g>=150){P.g-=150;ents.filter(e=>e.k==='car'&&(e===NEO.car||Math.hypot(e.px-P.px,e.py-P.py)<4)&&e.hp<e.mx)[${i}].hp=100;hud();pn('neo_off')}`)).join(''):'<p class="mu">Nessuna auto da riparare qui vicino.</p>'}<button onclick="cl()">Chiudi</button>`};
for(const[k,n,tx]of[['bar','🍺 Bar del Drago','Caffè, panini e chiacchiere. Tommaso sa tutto quello che succede in città.'],['banca','🏦 Banca Corona','Il caveau più sicuro di Aldoria. Dicono.'],['kiosk','☕ Edicola e caffè','«I Corvi colpiscono ancora», titola il giornale.'],['gelati','🍦 Gelateria Onda','Gusto del giorno: zaffiro (è mirtillo).'],['surf','🏄 Noleggio Surf','Le onde migliori sono all\'alba.']])
  X43P['neo_'+k]=()=>`<h3>${n}</h3><p class="x43t">${tx}</p>${k==='bar'||k==='kiosk'||k==='gelati'?neoBuyBtn('Mangia qualcosa (+30% vita)',25,`if(P.g>=25){P.g-=25;P.hp=Math.min(P.mx,P.hp+Math.round(P.mx*.3));hud();pn('neo_${k}')}`):''}<button onclick="cl()">Chiudi</button>`;
/* ---- il disegno: città, auto, segnali ---- */
const NFC=[['#5a8c3a','#558636'],['#2e2f34','#2b2c31'],['#a8a8ae','#a2a2a8'],['#c8c0b0','#beb6a6'],['#e8d8a8','#e0d0a0'],['#3a3b40','#36373c'],['#8a8a86','#84847f'],['#b8a888','#b0a080']];
{const f0=floor;floor=function(x,y,c,h){const z=ZZ;if(!z||!z.neo||!NT||NT.length!==N*N||c===2||c===1||c===3){f0(x,y,c,h);return}const ty=NT[y*N+x],C=NFC[ty]||NFC[0];box(x,y,-6,1,1,6,(x+y)&1?C[0]:C[1],.92+h*.1);
  if(ty===1){const hr=NRX.some(r=>y>=r&&y<=r+2),vr=NRX.some(r=>x>=r&&x<=r+2);if(hr&&!vr&&NRX.includes(y-1)&&x%3!==0)box(x,y+.47,0,.6,.06,.3,'#e8c84a');if(vr&&!hr&&NRX.includes(x-1)&&y%3!==0)box(x+.47,y,0,.06,.6,.3,'#e8c84a');
    if(hr&&vr)return;if(hr&&(NRX.some(c2=>x===c2-1||x===c2+3)))for(let i=0;i<3;i++)box(x+.15,y+.1+i*.3,0,.7,.14,.3,'#e8e8e8');if(vr&&(NRX.some(r=>y===r-1||y===r+3)))for(let i=0;i<3;i++)box(x+.1+i*.3,y+.15,0,.14,.7,.3,'#e8e8e8')}
  else if(ty===2){if(((x+y)&3)===0)box(x+.05,y+.05,0,.9,.9,.2,'#b4b4ba')}else if(ty===5){if(x%3===0)box(x+.05,y,0,.06,1,.3,'#e8e8e8')}}}
{const b0=bld;bld=function(x,y,h){const b=TB&&BM&&BM[y]&&TB[BM[y][x]];if(b&&String(b.st||'').startsWith('neo')&&ZZ&&ZZ.neo){neoBld(x,y,h,b);return}b0(x,y,h)}}
function neoBld(x,y,h,b){const H2=b.ht,c=b.wall,ex=x===b.x+b.w-1,ey=y===b.y+b.h-1,st=b.st;box(x,y,0,1,1,H2,c,.94+hh(x,y)*.04);
  const glass=st==='neoh'?'#9ad0e8':st==='neow'?null:'#a8d0f0',fl=st==='neo'?9:12;
  if(glass)for(let z=6;z<H2-4;z+=fl){const lit=hs(x*31+y*17+z)%7===0;if(ey)box(x+.12,y+.985,z,.76,.02,fl*.55,lit?'#ffe9a0':glass,lit?1.25:1.05);if(ex)box(x+.985,y+.12,z,.02,.76,fl*.55,lit?'#ffe9a0':glass,lit?1.25:1.05)}
  if(st==='neow'){if(ey&&(x&1))box(x+.1,y+.985,2,.8,.02,14,'#5a5a62');if(ey)box(x,y+.98,H2-4,1,.03,3,'#d8a030')}
  box(x-.01,y-.01,H2,1.02,1.02,1.2,shx(c,.75));if(hs(x*7+y*13)%9===0&&st!=='neow'){box(x+.25,y+.25,H2+1.2,.5,.4,4,'#9a9aa0');box(x+.3,y+.3,H2+5.2,.4,.3,.6,'#6a6a70')}
  if(st==='neoh'&&ey&&x===b.x+(b.w>>1)){box(x+.35,y+.99,H2-16,.3,.02,10,'#d02020',1.2);box(x+.2,y+.99,H2-12.6,.6,.02,3,'#d02020',1.2)}
  if(st==='neop'&&ey&&x===b.x+(b.w>>1))box(x+.1,y+.99,H2-10,.8,.02,5,'#e8e8f8',1.2);
  if(st==='neob'&&ey)box(x+.4,y+.85,0,.2,.2,H2-6,'#f0ece0');
  if(b.sign&&ey&&x===b.x+(b.w>>1)){const on=nightK()>.4;box(x-.6,y+1,18,2.2,.06,7,'#1a1a22');box(x-.5,y+1.04,19,2,.03,5,on?'#ffd84a':'#c8a040',on?1.4:1)}
  if(H2>100&&x===b.x+1&&y===b.y+1)box(x+.45,y+.45,H2+1,.1,.1,24,'#c8c8c8'),box(x+.42,y+.42,H2+24,.16,.16,2,Math.sin(t*3)>0?'#ff3030':'#5a1010',1.4)}
const NPR={
  '⒜':(x,y)=>{box(x+.45,y+.45,0,.1,.1,34,'#3a3a40');box(x+.45,y+.2,34,.08,.3,1,'#3a3a40');const on=nightK()>.3;box(x+.4,y+.15,31,.18,.14,2.4,on?'#fff2c0':'#d8d8c0',on?1.5:1);if(on){nlight(x+.5,y+.2,30,140,'255,230,170',.7);if(SET.ultra)GLOW.push([x+.5,y+.2,30,50,'255,230,170',.3])}},
  '⒝':(x,y)=>{box(x+.15,y+.15,0,.7,.7,5,'#8a8a8a');box(x+.2,y+.2,5,.6,.6,1,'#4a3a2a');box(x+.45,y+.45,6,.1,.1,12,'#6b4a2b');box(x+.2,y+.2,16,.6,.6,10,'#3f8a3a');box(x+.3,y+.3,26,.4,.4,5,'#4a9a44')},
  '⒞':(x,y)=>{box(x+.1,y+.35,0,.06,.3,5,'#3a3a3a');box(x+.84,y+.35,0,.06,.3,5,'#3a3a3a');box(x+.08,y+.3,5,.84,.4,1.2,'#8a5a2a');box(x+.08,y+.66,6,.84,.06,5,'#8a5a2a')},
  '⒟':(x,y)=>{box(x+.32,y+.32,0,.36,.36,10,'#2a6a4a');box(x+.3,y+.3,10,.4,.4,1,'#1a4a3a')},
  '⒠':(x,y)=>{box(x+.38,y+.38,0,.24,.24,8,'#c0392b');box(x+.34,y+.34,8,.32,.32,2,'#a0291b');box(x+.3,y+.44,4,.4,.1,2,'#c0392b')},
  '⒡':(x,y)=>{box(x+.45,y+.45,0,.1,.1,30,'#2a2a2a');box(x+.38,y+.38,24,.24,.24,10,'#1a1a1a');const ph=Math.floor((t+(x+y)*.3)/4)%3;box(x+.42,y+.62,31,.16,.02,2,ph===0?'#ff3030':'#4a1010',ph===0?1.5:1);box(x+.42,y+.62,28,.16,.02,2,ph===1?'#ffd030':'#4a3a10',ph===1?1.5:1);box(x+.42,y+.62,25,.16,.02,2,ph===2?'#30ff60':'#104a1a',ph===2?1.5:1)},
  '⒢':(x,y)=>{for(let i=0;i<6;i++)box(x+.45+i*.03,y+.45,i*6,.1,.1,6,'#8a6a42');const z=36;for(let i=0;i<6;i++){const a=i/6*6.283;box(x+.5+Math.cos(a)*.3-.15,y+.5+Math.sin(a)*.3-.1,z-Math.abs(Math.sin(a))*2,.3,.2,2,'#3a9a3a')}box(x+.4,y+.4,z,.2,.2,3,'#2a7a2a')},
  '⒣':(x,y)=>{const c=['#c0392b','#2980b9','#27ae60','#d35400','#8e44ad','#7f8c8d'][hs(x*13+y*7)%6],tall=hs(x+y*3)%3===0;box(x+.02,y+.08,0,.96,.84,16,c);for(let i=0;i<5;i++)box(x+.08+i*.2,y+.92,1,.06,.01,14,shx(c,.8));if(tall)box(x+.02,y+.08,16,.96,.84,16,['#e8e8e8','#f1c40f','#16a085'][hs(x*5+y)%3])},
  '⒤':(x,y)=>{box(x+.05,y+.1,0,.5,.5,8,'#a8803a');box(x+.5,y+.4,0,.45,.45,7,'#9a7230');box(x+.2,y+.2,8,.4,.4,7,'#b8904a')},
  '⒥':(x,y)=>{box(x+.2,y+.2,0,.6,.6,3,'#d8d0c0');box(x+.3,y+.3,3,.4,.4,30,'#f0ece0');box(x+.2,y+.2,33,.6,.6,3,'#d8d0c0')},
  '⒦':(x,y)=>{box(x-.2,y-.2,0,1.4,1.4,8,'#c8c0b0');box(x,y,8,1,1,4,'#b8b0a0');box(x+.25,y+.3,12,.22,.2,12,'#7a8a7a');box(x+.53,y+.3,12,.22,.2,12,'#7a8a7a');box(x+.2,y+.25,24,.6,.5,14,'#7a8a7a');box(x+.3,y+.3,38,.4,.4,9,'#8a9a8a');box(x+.28,y+.28,47,.44,.44,2,'#d4af37');for(const q of[.3,.45,.6])box(x+q,y+.4,49,.06,.06,3,'#d4af37');box(x+.85,y+.4,24,.08,.08,26,'#9aa0aa')},
  '⒨':(x,y)=>{box(x+.2,y+.45,0,.1,.1,30,'#3a3a3a');box(x+.7,y+.45,0,.1,.1,30,'#3a3a3a');box(x-.3,y+.42,30,1.6,.1,16,'#1a1a22');box(x-.25,y+.4,31,1.5,.02,14,['#c0392b','#2980b9','#8e44ad'][Math.floor(t/6)%3],1.15)},
  '⒫':(x,y)=>{box(x+.1,y+.1,0,.2,.2,70,'#d8a030');box(x+.7,y+.7,0,.2,.2,70,'#d8a030');box(x+.1,y+.1,70,.8,.8,6,'#d8a030');box(x+.4,y-2,76,.2,4,3,'#d8a030');box(x+.45,y-1.6,40,.04,.04,36,'#3a3a3a');box(x+.3,y-1.75,36,.4,.3,4,'#5a5a5a')},
  '⒬':(x,y)=>{box(x+.35,y+.35,0,.3,.3,6,'#2a2a2a');box(x+.3,y+.3,6,.4,.4,2,'#3a3a3a')},
  '⒭':(x,y)=>{box(x+.1,y+.1,0,.8,.8,3,'#6a4a2a');for(let i=0;i<5;i++)box(x+.15+(i*.17),y+.2+(i%2)*.4,3,.14,.14,4,['#ff4a6a','#ffd84a','#ffffff','#c87aff','#ff8a3a'][(i+x)%5])},
  '⒮':(x,y)=>{const s=.8+hh(x*3,y*5)*.5;box(x+.42,y+.42,0,.16,.16,12*s,'#6b4a2b');box(x+.15,y+.15,10*s,.7,.7,12*s,'#3a7a2a');box(x+.25,y+.25,22*s,.5,.5,8*s,'#4a8a34')},
  '⒯':(x,y)=>{box(x+.05,y+.15,0,.9,.7,9,'#2f6a2a');box(x+.1,y+.2,9,.8,.6,2,'#3a7a32')},
  '⒰':(x,y)=>{box(x+.1,y+.1,0,.8,.8,18,'#2a5a3a');box(x+.05,y+.05,18,.9,.9,3,'#1a4a2a');box(x+.15,y+.88,6,.7,.04,8,'#e8e0c8')},
  '⒱':(x,y)=>{box(x+.47,y+.47,0,.06,.06,22,'#e8e8e8');for(let i=0;i<8;i++){const a=i/8*6.283;box(x+.5+Math.cos(a)*.3-.1,y+.5+Math.sin(a)*.3-.1,21,.2,.2,2,i%2?'#ffffff':['#e74c3c','#3498db','#f1c40f'][(x+y)%3])}},
  '⒲':(x,y)=>{for(const[a,b]of[[.1,.1],[.8,.1],[.1,.8],[.8,.8]])box(x+a,y+b,0,.1,.1,22,'#e8e0c8');box(x,y,22,1,1,2,'#e8e0c8');box(x+.1,y+.1,24,.8,.8,10,'#e74c3c');box(x,y,34,1,1,2,'#ffffff')}};
{const d0=dec;dec=function(x,y,c,h){const f=NPR[c];if(f&&ZZ&&ZZ.neo){f(x,y,h);return}d0(x,y,c,h)}}
{const e0=ent;ent=function(e){if(!e)return e0(e);
  if(e.k==='car'){if(e.burn){const k=(t-e.burn)/3;carDraw(e,e.px,e.py,e.va!=null?e.va:e.a);if(cineOK()&&Math.random()<.6)burst(e.px,e.py,2,['#ff7a2a','#ffd84a','#555'],{v:.3,up:60,gr:-30,b:0,d:1,s:5,z:8});return}
    const va=e.va!=null?e.va:e.a;let df=e.a-va;while(df>Math.PI)df-=6.283;while(df<-Math.PI)df+=6.283;e.va=va+df*.25;carDraw(e,e.px,e.py,e.va);
    if(!D3B&&(e.tgt55||e.mine)){const sx=PX(e.px,e.py),sy=PY(e.px,e.py,0);g.textAlign='center';g.font='bold 10px Georgia,serif';label(e.tgt55?'🎯 '+e.n:'🔑 '+e.n,sx,sy-26,e.tgt55?'#ff9a9a':'#9affb0')}return}
  if(e===P&&nOn()&&NEO.car)return;
  if(e.k==='pl'&&MODE==='neo'){const q=NET.peers&&NET.peers[e.id];if(q&&Array.isArray(q.nc)&&q.nc.length>=4){const fk={mdl:CARM[q.nc[2]]?q.nc[2]:'berl',col:String(q.nc[3]||'#c0392b').slice(0,9),hp:+q.nc[4]||100,mx:100};carDraw(fk,e.px,e.py,+q.nc[1]||0);if(!D3B){const sx=PX(e.px,e.py),sy=PY(e.px,e.py,0);g.textAlign='center';g.font='bold 10px Georgia,serif';label(e.n||'',sx,sy-26,'#9ad8ff')}return}}
  if(e.k==='neos'){if(!D3B){const sx=PX(e.px,e.py),sy=PY(e.px,e.py,0);g.textAlign='center';g.font='bold 10px Georgia,serif';label(({arm:'🔫',moda:'👕',conc:'🚗',osp:'✚',pol:'👮',casa:'🏠',bar:'🍺',banca:'🏦',off:'🔧',kiosk:'☕',gelati:'🍦',surf:'🏄'})[e.st]+' '+e.n,sx,sy-30+Math.sin(t*2)*2,'#ffe8b0')}return}
  e0(e);
  if(e.k==='npc'&&nOn()){const o=nmFix(),nx=NMS[o.m];if(o.s<0&&nx&&nx.g===e.nid){const top=(e.m&&e.m.top||36)+14;box(e.px-.07,e.py-.07,top+Math.sin(t*4)*2,.14,.14,6,'#ffd84a',1.4)}}
  if(e.k==='en'&&e.pol55&&!D3B&&Math.floor(t*3)%2){const top=(e.m&&e.m.top||36)+8;box(e.px-.05,e.py-.05,top,.1,.1,1.5,'#ff3030',1.4)}}}
// i proiettili e la colonna della missione: un'entità che segue l'eroe e li disegna
function neoFx(){for(const b of NEO.b)box(b.x-.05,b.y-.05,14,.1,.1,1.5,b.c,1.5);const T2=nmTarget();if(T2){const a0=g.globalAlpha;g.globalAlpha=a0*(.32+Math.sin(t*3)*.08);box(T2.x-.3,T2.y-.3,T2.e?(T2.e&&0):0,.6,.6,T2.e?4:90,T2.g?'#ffd84a':T2.e?'#ff5a5a':'#5ad8ff',1.3);g.globalAlpha=a0}}
{const e0=ent;ent=function(e){if(e&&e.k==='nfx55'){if(nOn())neoFx();return}e0(e)}}
/* ---- il ciclo ---- */
{const u0=upd;upd=function(dt){if(!nOn()||Zk!=='neo_city'){u0(dt);return}
  const car=NEO.car;if(car&&!ents.includes(car))NEO.car=null;u0(dt);if(!started||!P||MODE!=='neo')return;
  try{NEO.cd=Math.max(0,NEO.cd-dt);
    if(NEO.car){P.tg=null;P.path=[];carDrive(NEO.car,dt)}
    else{const G=gunOf();if(G){if(P.tg&&P.tg.k==='en'&&ents.includes(P.tg)&&dist(P,P.tg)<=G.r){P.path=[];neoFire(P.tg)}if((KEYS[' ']||KEYS.x)&&!PM)neoFire(neoAim())}}
    for(const e of ents){if(e.k==='car'){if(e.ai)carAI(e,dt);if(e.hp<=0&&!e.burn){e.burn=t;e.ai=null;e.v=0;msg(e===NEO.car?'L\'auto prende fuoco: scendi!':'Un\'auto prende fuoco!')}
        if(e.burn&&t-e.burn>3&&!e.boom){e.boom=1;vf({k:'ring',x:e.px,y:e.py,r0:.4,r:2.6,c:'255,140,40',d:.5,w:8});shake(.7);tone(55,.6,'sawtooth',.1);if(cineOK())sparks(e.px,e.py,40,['#ff7a2a','#ffd84a','#555'],160);
          for(const o of ents)if(o.k==='en'&&dist(o,e)<2.4)uqHit(o,40+P.lv*4,1);if(e===NEO.car)carExit();if(dist(P,e)<2.2)hurtP(30+P.lv*3);if(e.tgt55){e.hp=0}setTimeout(()=>{const i=ents.indexOf(e);if(i>=0)ents.splice(i,1)},4000)}}
      else if(e.k==='npc'&&e.flee>t&&e.ped){const dx=e.px-P.px,dy=e.py-P.py,l=Math.hypot(dx,dy)||1;mv(e,dx/l*dt*3.2,dy/l*dt*3.2);e.mvT=t;e.fd=[dx,dy];e.path=[]}}
    if(NEO.shot&&t-NEO.shot<.1)for(const e of ents)if(e.k==='npc'&&e.ped&&dist(e,P)<7&&!(e.flee>t)){e.flee=t+5;if(Math.random()<.3)flt(e,'Aaah!','#ffb0b0')}
    let fx=ents.find(q=>q.k==='nfx55');if(!fx){fx={k:'nfx55',px:P.px,py:P.py};ents.push(fx)}fx.px=P.px+.6;fx.py=P.py+.6;
    neoBullets(dt);neoPolice(dt);neoGangs(dt);nmTick(dt);
    NEO.ht=(NEO.ht||0)-dt;if(NEO.ht<=0){NEO.ht=.25;neoHud()}}catch(err){console.warn('Aldoria 2026',err)}}}
// R per scendere dall'auto; Spazio e X sparano invece di colpire; T per il telefono
addEventListener('keydown',e=>{if(!nOn()||e.target&&/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;const k=e.key.toLowerCase();
  if(NEO.car&&(k==='r'||k==='enter'&&false)){carExit();e.preventDefault();e.stopImmediatePropagation();return}
  if(NEO.car&&(k===' '||k==='x'||k==='f'||k==='e'||k==='shift'||k==='q')){if(k!==' '&&k!=='shift')e.stopImmediatePropagation();if(k===' '||k==='shift'){KEYS[k]=1}e.preventDefault();e.stopImmediatePropagation();return}
  if((k===' '||k==='x')&&gunOf()&&!PM){KEYS[k]=1;neoFire(neoAim());e.preventDefault();e.stopImmediatePropagation();return}
  if(k==='t'&&!e.repeat){if(PM==='neo_tel')cl();else if(!PM)pn('neo_tel');e.preventDefault();e.stopImmediatePropagation()}},true);
addEventListener('keyup',e=>{if(!nOn())return;const k=e.key.toLowerCase();if(k===' '||k==='x'||k==='shift')KEYS[k]=0},true);
// la barra in alto: soldi, stelle, arma, missione, tachimetro
function neoHud(){let el=NEO.hud;if(!el){el=NEO.hud=document.createElement('div');el.id='neohud';document.body.appendChild(el)}if(!nOn()){el.style.display='none';return}el.style.display='';
  const o=nmFix(),Ms=nmCur(),G=gunOf(),c=NEO.car;
  el.innerHTML=`<span class="nhm">$ ${P.g.toLocaleString('it-IT')}</span><span class="nhw ${NEO.W?'on':''}">${'★'.repeat(NEO.W)}<i>${'☆'.repeat(5-NEO.W)}</i></span><span>${G?'🔫 '+esc(P.eq.w.n):'👊 '+(P.eq.w?esc(P.eq.w.n):'Pugni')}</span>${c?`<span>🚗 ${esc(c.n)} · ${Math.round(Math.abs(c.v)*12)} km/h · ${Math.max(0,Math.round(c.hp))}%</span>`:''}
  <span class="nho">${Ms?'🎯 '+esc(Ms.st[o.s].tx)+(o.tl>0?' · ⏱ '+Math.ceil(o.tl)+'s':''):NMS[o.m]?'📜 '+esc(NPCS[NMS[o.m].g].n)+' ha una missione':'🏙 Aldoria è tua'}</span><button onclick="pn('neo_tel')" title="Telefono (T)">📱</button>${c?'<button onclick="carExit()">Scendi (R)</button>':''}`}
/* ---- inizio, salvataggio, morte, menu ---- */
function neoBegin(s){cineReset();auInit();MODE='neo';DIM=null;PPJ=[];DF=DFS[s&&s.df!=null?s.df:1]||DFS[1];P=newP();gndLoad&&gndLoad(null);
  if(s&&s.p){for(const k in s.p)if(s.p[k]!=null)P[k]=s.p[k];P.ap=apFix(P.ap||APM)}else{Object.assign(P,{g:300,pot:3});P.eq={w:{u:uid(),s:'w',r:0,v:4,n:'Mazza da baseball',p:10}};P.ap=apFix(APM)}
  for(const it of P.inv.concat(Object.values(P.eq)))if(it&&!it.u)it.u=uid();P.unl=P.unl||{};P.bag=0;P.skl=P.skl||{};P.stash=[];P.sold={};P.res=P.res||{};P.fish={};INV=24;recalc();if(!s)P.hp=P.mx;nmFix();
  const nm=$('neonm'),rc=$('neorc');NET.name=((nm&&nm.value.trim())||(s&&s.name)||'Viaggiatore').replace(/[<>]/g,'').slice(0,14);NET.code=((rc&&rc.value)||'').trim().toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,16);
  NET.tm=null;NET.hits=[];NET.say=null;NET.ar=null;NET.lb=null;NET.runs={};NET.st=NET.code?(window.GAME_WS?'connessione…':'multigiocatore non disponibile: apri il gioco dal server (node server.js)'):'';
  NEO.car=null;NEO.W=0;NEO.b=[];NEO.ms=[];NEO.gz=null;$('menu').style.display='none';closeSet();document.body.classList.add('ig','neom');inMenu=0;started=1;last=performance.now();cineOff();SZ=1;
  netConnect();load('neo_city');hudApply&&hudApply();wheelApply&&wheelApply();
  if(s&&s.p&&s.p.neo&&s.p.neo.home&&NPOI.apt){P.px=NPOI.apt[0]+.5;P.py=NPOI.apt[1]+1.5;camX=PX(P.px,P.py);camY=PY(P.px,P.py,10)}
  if(!s){PA={ti:'Aldoria · 2026',tx:'Lo Zaffiro si apre e ti lascia cadere su un marciapiede. Clacson, luci, palazzi di vetro alti come montagne: è Aldoria, mille anni dopo.\n\nNon hai niente, se non trecento dollari in tasca e una mazza da baseball. Al Bar del Drago, qui vicino, c\'è qualcuno che ti aspetta (il segno giallo sopra la testa).\n\nComandi: clic o WASD per camminare · R per salire su un\'auto (e per scendere) · WASD o la levetta per guidare, Spazio per frenare · clic su un nemico o Spazio/X per sparare · T per il telefono.'};pn('txt')}
  neoHud();save()}
{const s0=save;save=function(){if(MODE==='neo'){if(!P||!started)return;try{if(NEO.car){}LS.set(NEOK,{v:1,name:NET.name,code:NET.code,df:DFS.indexOf(DF),t:Date.now(),p:{lv:P.lv,xp:P.xp,g:P.g,pot:P.pot,hp:P.hp,eq:P.eq,inv:P.inv,ap:P.ap,skl:P.skl,neo:P.neo,unl:P.unl,gt:P.gt,kills:P.kills}})}catch(e){console.warn('Aldoria 2026: salvataggio',e)}return}s0()}}
{const d0=die;die=function(){if(MODE!=='neo'){d0();return}if(NEO.car)carExit();const lost=Math.round(P.g*.1);P.g-=lost;NEO.W=0;for(let i=ents.length-1;i>=0;i--)if(ents[i].pol55)ents.splice(i,1);const o=nmFix();if(o.s>=0)nmFail('Sei finito all\'ospedale.');
  P.hp=P.mx;const q=NPOI.osp||[50,50];P.px=q[0]+.5;P.py=q[1]+1.5;P.path=[];P.tg=null;camX=PX(P.px,P.py);camY=PY(P.px,P.py,10);flash('#ffffff',.6,500);banner('Ricoverato','Ti risvegli all\'Ospedale San Lia · conto: '+lost+' $','teschio');hud();save()}}
{const t0=toMenu;toMenu=function(){const was=MODE==='neo';if(was&&NEO.car)carExit();t0();if(was){MODE='story';document.body.classList.remove('neom');NEO.car=null;if(NEO.hud)NEO.hud.style.display='none';neoMenu()}}}
{const s0=syncPack;syncPack=function(){const o=sp0x(s0);if(MODE==='neo'&&NEO.car){const c=NEO.car;o.nc=[1,+c.a.toFixed(2),c.mdl,c.col,Math.round(c.hp)]}return o}}
function sp0x(f){return f()||{}}
// gli oggetti che trovi nel 2026 sono del 2026
{const i0=item;item=function(lv,minR=0,slot){const it=i0(lv,minR,slot);if(MODE!=='neo'||!it)return it;delete it.mx55;delete it.base;delete it.uq;
  if(it.s==='w'){const k=['pis','pis','smg','sgn','rfl'][Math.min(4,(it.r|0)+Math.floor(Math.random()*2))];const g2=gunItem(k,it.r);delete it.el;return g2}
  const N2={h:['Berretto','Cappellino','Cappuccio della felpa','Maschera da hockey'],c:['Giacca di pelle','Giubbotto antiproiettile','Tuta da motociclista'],s:['Scudo antisommossa']}[it.s];if(N2)it.n=N2[Math.floor(Math.random()*N2.length)]+(it.r?' '+['','firmata','d\'élite','leggendaria'][Math.min(3,it.r)]:'');return it}}
// nel 2026 i mostri non lasciano essenze, e i nemici lasciano dollari
{const k0=kill;kill=function(e){const on=MODE==='neo'&&e&&e.k==='en'&&ents.includes(e);const ess=P&&P.ess55?JSON.stringify(P.ess55):null;k0(e);if(!on)return;if(ess&&P)P.ess55=JSON.parse(ess);
  if(e.gang55||e.ms55){const c=Math.round(15+Math.random()*30+(e.boss?400:0));P.g+=c;goldFly(c,e.px,e.py);flt(e,'+'+c+' $','#9aff9a')}if(e.pol55){wanted(1)}}}
/* ---- il menu: la gemma riaccesa ---- */
document.getElementById('mow')&&document.getElementById('mow').insertAdjacentHTML('afterend',`<div id="mneo" hidden><button class="mback" onclick="mode('')">← Torna alle modalità</button><section class="mpan"><h3>🏙 Aldoria 2026 <small class="mu">lo Zaffiro</small></h3><p class="lore">Lo Zaffiro della Corona si è riacceso. Dentro c'è Aldoria mille anni dopo: una metropoli di vetro e asfalto, con il traffico nei viali, la spiaggia, il porto e una banda, i Corvi, che cerca le schegge della gemma. Guida qualsiasi auto, compra armi e vestiti, scappa dalla polizia e segui la storia dei discendenti di Aldoria.</p><div id="mneob"></div><p class="mnote">Aldoria 2026 ha un eroe e un salvataggio tutti suoi. Con un codice stanza giocate tutti nella stessa città.</p></section></div>`);
function neoMenu(){const el=$('mneob');if(!el)return;const s=LS.get(NEOK,null);const nm=(s&&s.name)||($('nm')&&$('nm').value)||'',rc=(s&&s.code)||'';
  el.innerHTML=`<div class="hrow"><div class="hfld"><label>Nome<input id="neonm" maxlength="14" placeholder="Il tuo nome" value="${esc(nm)}"></label><label>Codice stanza<input id="neorc" maxlength="16" placeholder="Vuoto = da solo" value="${esc(rc)}"></label></div></div>
  <button class="mbtn" onclick="openLook()">${typeof ico==='function'?ico('pennello',24):''}<span><b>Aspetto dell'eroe</b><small>Lo stesso delle altre modalità.</small></span></button>
  ${s&&s.p?`<button class="mbtn cont" onclick="neoBegin(LS.get(NEOK,null))"><span><b>Continua: ${esc(s.name)}</b><small>Livello ${s.p.lv|0} · ${(s.p.g|0).toLocaleString('it-IT')} $ · missioni ${((s.p.neo&&s.p.neo.m)|0)}/${NMS.length} · salvato ${esc(new Date(s.t).toLocaleString('it-IT'))}</small></span></button>`:''}
  <button class="mbtn" onclick="if(!LS.get(NEOK,null)||confirm('Iniziare da capo? Il salvataggio di Aldoria 2026 verrà sovrascritto.'))neoBegin(null)"><span><b>Nuova partita</b><small>Arrivi dalla gemma con 300 $ e una mazza da baseball.</small></span></button>`;if(typeof iconFill==='function')iconFill(el)}
{const m0=mode;mode=function(m){const w=$('mneo');if(m==='neo'){for(const id of['msel','mstory','mdim','mparco','mow']){const x=$(id);if(x)x.hidden=true}if(w){w.hidden=false;neoMenu();menuAnim(w)}tone(520,.05,'triangle');return}if(w)w.hidden=true;m0(m)}}
document.head.insertAdjacentHTML('beforeend',`<style>
#neohud{position:fixed;left:50%;top:calc(44px + env(safe-area-inset-top,0px));transform:translateX(-50%);z-index:6;display:flex;gap:8px;align-items:center;flex-wrap:wrap;justify-content:center;max-width:92vw;padding:4px 10px;border-radius:10px;background:rgba(8,10,20,.72);color:#fff;font:13px system-ui,sans-serif;text-shadow:0 1px 2px #000}
#neohud span{white-space:nowrap}.nhm{color:#9aff9a;font-weight:bold;font-size:15px}.nhw{color:#ffd84a;letter-spacing:1px;font-size:15px}.nhw i{color:#ffffff44;font-style:normal}.nhw.on{animation:nhw .5s infinite alternate}@keyframes nhw{to{color:#ff5a5a}}
.nho{color:#bfe8ff;white-space:normal!important}#neohud button{margin:0;padding:2px 8px;font-size:12px}
body.neom #qt{display:none}@media(max-width:720px){#neohud{top:calc(62px + env(safe-area-inset-top,0px));font-size:11px}}
</style>`);
