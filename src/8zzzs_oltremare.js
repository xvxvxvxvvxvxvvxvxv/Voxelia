/* ================= 7.48: nuovo capitolo — il regno oltre il mare =================
   Dal livello 10, al Porto di Aldoria la Capitana Marina porta l'eroe a Thalassa, il regno oltre il mare: una città bianca
   sul mare, con il palazzo della Regina, il mercato e il molo. La Regina Nerea è scomparsa nel Tempio di Giada, nel cuore
   della Giungla di Smeraldo, dove si è risvegliato Quetzal, il Serpente di Giada.
   1. a Thalassa il Cancelliere Oreste racconta che cosa è successo;
   2. nella giungla tre santuari custodiscono i Sigilli di Giada, ognuno difeso da due guerrieri;
   3. con i tre sigilli si aprono le porte del Tempio di Giada (tre piani, nuove creature) e in fondo c'è Quetzal;
   4. liberata la Regina, a Thalassa arrivano i premi, la Corona di Corallo e il titolo «Eroe di Thalassa».
   Anche Quetzal, come gli altri boss, si può risparmiare o finire: la Regina ne parla in modo diverso.
   Nuove creature: scimmia ladra, pantera d'ombra, serpe di giada, guerriero di giada, sacerdotessa di giada. */
XSV.add('ol48');
// le creature
const snake48=(c,k,s=1)=>scl([[-.48,-.1,0,.2,.2,5,c],[-.3,-.1,0,.2,.2,6,k],[-.12,-.1,1,.2,.2,6,c],[.06,-.1,2,.2,.2,7,k],[.2,-.11,4,.2,.22,7,c],[.32,-.12,9,.22,.24,7,c],[.52,-.07,12,.04,.04,2,'#ffe84a'],[.52,.05,12,.04,.04,2,'#ffe84a'],[.54,-.01,9,.08,.02,1,'#e83a3a']],s);
Object.assign(E,{
  scimmia48:{n:'Scimmia Ladra',hp:120,at:26,xp:34,sp:3.4,r:1.1,cd:.8,ag:9,m:beast('#8a5a2a',.75,'#5a3a1a')},
  pantera48:{n:'Pantera d\'Ombra',hp:170,at:32,xp:42,sp:3.2,r:1.2,cd:.9,ag:10,m:beast('#1e1e2a',1.15,'#0a0a10')},
  serpe48:{n:'Serpe di Giada',hp:150,at:30,xp:38,sp:2.2,r:1.3,cd:1.1,ag:8,m:snake48('#2a9a5a','#3ab86a')},
  guerriero48:{n:'Guerriero di Giada',hp:230,at:34,xp:48,sp:1.9,r:1.3,cd:1.2,ag:8,m:hum('#2a8a5a','#c8a070',1.25,[6,'#d4af37'])},
  sacerdotessa48:{n:'Sacerdotessa di Giada',hp:130,at:30,xp:44,sp:1.6,r:5,cd:1.8,ag:9,rng:'#6affc0',m:hum('#3a6a5a','#e0b090',1,[10,'#6affc0'])},
  quetzal48:{n:'Quetzal, il Serpente di Giada',hp:1500,at:40,xp:900,sp:1.8,r:3,cd:1.5,ag:12,boss:1,slam:1,rng:'#6affc0',sum:'serpe48',m:drake('#2ab87a','#8affc8',1.9)}});
// 7.49: le creature di Thalassa hanno i modelli nuovi, con lo scheletro e le animazioni (camminata, attesa, attacco)
{const set=(k,m)=>{if(E[k]&&m)E[k].m=m};try{
  set('scimmia48',mHum({s:.72,sk:'#d8a87a',tp:'#8a5a2a',lg:'#7a4a22',ar:'#8a5a2a',hd:'#9a6a3a',ey:'#ffd040',mouth:'#3a1a0a',hunch:1,belt:0,x:[...HT.ears('#d8a87a'),['hd',-.09,.12,21,.18,.03,4,'#d8a87a'],['bd',-.04,-.3,8,.08,.2,2,'#8a5a2a'],['bd',-.04,-.46,9,.08,.08,7,'#8a5a2a'],['bd',-.04,-.48,15,.08,.14,2,'#8a5a2a'],['ar',.24,0,6,.12,.12,3,'#ffd84a']]}));
  set('pantera48',mQuad({s:1.2,c:'#1e1e2a',c2:'#14141c',ey:'#ffe040',round:1,ttail:'#1e1e2a',low:1,top:24}));
  set('serpe48',mFloat({kind:'eel',c:'#2a9a5a',s:1.5,x:[['hd',-.09,.38,8,.18,.02,1.5,'#ffe84a'],['s0',-.07,.3,6,.14,.13,2,'#3ab86a'],['s3',-.07,0,4,.14,.13,1.5,'#3ab86a']]}));
  set('guerriero48',mHum({s:1.22,sk:'#c8a070',tp:'#2a8a5a',lg:'#1f5a3a',ey:'#111',mouth:'#5a3a2a',x:[...HT.helmet('#d4af37','#6affc0'),['bd',-.23,-.13,15,.46,.28,3,'#6affc0'],['bd',-.24,.12,10,.48,.03,6,'#1f6a4a'],...WP.spear('#6affc0'),...WP.shield('#2a8a5a')]}));
  set('sacerdotessa48',mHum({s:1,sk:'#e0b090',tp:'#3a6a5a',robe:'#2a8a6a',ey:'#2a2a2a',x:[...HT.hood('#2a8a6a'),['hd',-.17,-.14,28,.34,.28,2,'#6affc0'],['bd',-.22,.12,14,.44,.03,4,'#d4af37'],...WP.staff('#6affc0')]}));
  set('quetzal48',mDrake({s:1.95,c:'#2ab87a',c2:'#1f8a5a',w:'#8affc8',wc:'#6affc0',ey:'#ffe040',cl:'#f4ecd0',sp:'#ff6a3a',mane:'#ff4a6a',top:56}));
}catch(e){console.warn('modelli di Thalassa',e)}}
UQ.quetzal48=['w','Zanna di Quetzal',14,0];BAB.quetzal48=['charge','rain','summon:serpe48','nova'];
TH.jade={a:'#3a6a5a',b:'#34604f',o:'#1f4a3a',bg:'#020a06',tc:'#6affc0',pool:'#2a8a6a',pt:'mote'};
DG.tempio48={n:'Tempio di Giada',lv:14,fls:3,en:['guerriero48','sacerdotessa48','serpe48'],boss:'quetzal48',th:'jade',ent:'giungla48'};
Object.assign(NPCS,{
  // «capitano» nel nome: come le guardie, resta al suo posto anche di notte (il traghetto parte sempre)
  capitanomarina48:{n:'Capitana Marina',c:'#2a3a6a',hat:'#1a1a2a',ln:['Il mare è grande, ma la mia Stella del Sud lo conosce tutto.']},
  oreste48:{n:'Cancelliere Oreste',c:'#2a6a6a',hat:'#d4af37',ln:['Thalassa ti è grata, straniero.']},
  nerea48:{n:'Regina Nerea',c:'#3a8ab0',hat:'#e8e4ff',ln:['Il mare ci ha portato un amico.']},
  zefiro48:{n:'Mercante Zefiro',c:'#c86a2a',hat:'#e8d8a0',ln:['Spezie, perle, sigilli! Tutto quello che il mare porta, Zefiro lo vende.']},
  coral48:{n:'Piccola Coral',c:'#e8a0b0',hat:'#ffd84a',ln:['Mia nonna dice che il Serpente di Giada era buono, una volta. Proteggeva la giungla.','Hai visto le scimmie? Mi hanno rubato il pane!','Quando sarò grande farò la capitana come Marina.']},
  ilio48:{n:'Pescatore Ilio',c:'#4a6a8a',hat:'#d8c070',ln:['Da quando il Serpente si è svegliato, i pesci scappano verso il largo.','Nella giungla c\'è un fiume che porta al tempio. Nessuno lo risale più.']},
  guardia48:{n:'Guardia del Palazzo',c:'#2a8a8a',hat:'#d4af37',ln:['Il palazzo è chiuso finché la Regina non torna.','Il Cancelliere Oreste ti aspetta, straniero.']}});
// 7.49: l'aspetto dei personaggi di Thalassa (pelle|capelli|barba|cappello|vestiti|oggetto|animazione|corporatura)
Object.assign(NPS,{capitanomarina48:'c|tail:#1a1a1a|none|tricorn:#1a1a2a|cape:#2a3a6a,earring|telescope|proud|f,tall',
  oreste48:'b|bald2:#e8e8e8|long:#e8e8e8|none|robe:#2a6a6a,collar,necklace|scroll|read|old,tall',nerea48:'b|long:#e8d8a0|none|crown|cape:#3a8ab0,collar,necklace|staff:#6affc0|proud|f,tall',
  zefiro48:'d|short:#2a1a10|bigmous:#2a1a10|turban|sash:#c86a2a,vest:#e8d8a0,earring|basket|shout|fat',coral48:'c|tail:#5a2a1a|none|flower|apron:#e8a0b0|bread|idle|kid,f',
  ilio48:'c|short:#5a5a5a|full:#5a5a5a|straw|vest:#4a6a8a,patches|rod|idle|old',guardia48:'c|short:#1a1a1a|none|helmet:#d4af37|armor:#2a8a8a,cape:#2a8a8a|spear|guard|n'});
const OL={};
function olFix(){P.ol48=P.ol48||{s:0,sig:[0,0,0]};const o=P.ol48;o.sig=Array.isArray(o.sig)?o.sig:[0,0,0];return o}
const olSig=()=>olFix().sig.filter(Boolean).length;
const OLS=['Al Porto di Aldoria la Capitana Marina cerca chi la accompagni a Thalassa (dal livello 10).','A Thalassa, parla con il Cancelliere Oreste nel palazzo.','Trova i tre Sigilli di Giada nei santuari della Giungla di Smeraldo','Entra nel Tempio di Giada e affronta Quetzal, il Serpente di Giada.','Torna a Thalassa: la Regina Nerea ti aspetta.','Capitolo completato: sei l\'Eroe di Thalassa.'];
function olStatus(){const o=olFix();return OLS[Math.min(5,o.s)]+(o.s===2?' ('+olSig()+'/3).':'')}
/* ---- Thalassa: la città bianca sul mare ---- */
function genThal({R4,D,F,H,gate,N2,FS,scat,n}){
  R4(1,36,n-2,n-37,2);R4(22,4,4,32,4);R4(3,26,n-6,3,4);R4(8,14,32,2,4);
  const pier=(x0,y0,w,h)=>{for(let y=y0;y<y0+h;y++)for(let x=x0;x<x0+w;x++)if(x>0&&y>0&&x<n-1&&y<n-1){M[y][x]=4;DEC[y][x]='~'}};pier(22,36,4,8);pier(10,36,2,5);pier(36,36,2,5);
  H({x:16,y:2,w:16,h:9,wall:'#f8f4ec',roof:'#2ab8a8',ht:44});R4(23,11,2,3,4);
  const cs=['#2a8aa8','#3aa8a0','#d87a3a','#2a6ab8','#e8b84a'];
  [[4,4],[9,4],[34,4],[40,4],[4,17],[10,17],[34,17],[40,17],[4,30],[14,30],[30,30],[38,30]].forEach(([x,y],i)=>H({x,y,w:5,h:5,wall:i%3?'#f4f0e8':'#ece4d4',roof:cs[i%cs.length],ht:20+(i%3)*4}));
  for(const[x,y]of[[2,12],[14,12],[33,12],[45,12],[2,24],[20,24],[27,24],[45,24],[8,34],[18,34],[29,34],[40,34],[13,22],[34,22]])D(x,y,'ꞁ');
  for(const[x,y,c]of[[27,20,'Ы'],[28,20,'Щ'],[29,20,'Ы'],[19,20,'Щ'],[20,20,'Ы']])F(x,y,c);
  for(const[x,y]of[[21,22],[26,22]])D(x,y,'o');scat(3,12,42,2,'h',.06);
  R4(1,26,3,3,4);Object.assign(gate(1,27,'giungla48',{n:'Verso la Giungla di Smeraldo'}),{st:'cancello',dir:'y',span:3,off:-1.5,eo:-1,sw:1,sty:'thalassa'});
  ents.push(mkShip('caravella',29,40,'y'),mkShip('barca',13.5,39,'y'),mkShip('gozzo',40,40,'y'));ents.push({k:'trag48b',px:23.5,py:43.5,n:'La Stella del Sud · per Aldoria'});
  FS(10,40,0,1);FS(37,40,0,1);
  N2('oreste48',24,13);N2('guardia48',21,12);N2('guardia48',27,12);N2('zefiro48',24,21);N2('coral48',14,27,{wd:1});N2('ilio48',36,37);
  if(olFix().s>=4)N2('nerea48',25,13);
  return LFROM==='giungla48'?[3,27]:[24,34]}
Z.thal48={n:'Thalassa · il regno oltre il mare',lv:12,N:48,a:'#d8c890',b:'#d0c088',bg:'#7fc0f0',mus:'town',pt:'petal',gen:genThal,rd:['#e8dcc0','#e0d4b4'],wl:'#e8e0d0',wh:18,dist:1};
/* ---- la Giungla di Smeraldo ---- */
function genGiungla({R4,D,RS,EN,gate,scat,n}){const r=sd(hs('giungla48|'+dayKey())),c=n>>1;
  scat(1,1,n-2,n-2,'r',.16);scat(1,1,n-2,n-2,'ꞁ',.06);scat(1,1,n-2,n-2,'e',.04);
  // il fiume, con due guadi
  for(let y=1;y<n-1;y++){const x0=Math.round(c+8+Math.sin(y*.22)*4);for(let x=x0;x<x0+3;x++)if(x>0&&x<n-1){M[y][x]=2;DEC[y][x]=''}}
  // i sentieri: dall'ingresso (a sud) al tempio (a nord) e ai tre santuari
  const path=(a,b)=>{let[x,y]=a;while(x!==b[0]||y!==b[1]){for(let k=-1;k<=1;k++)for(let j=-1;j<=1;j++){const u=x+k,v=y+j;if(u>0&&v>0&&u<n-1&&v<n-1&&M[v][u]!==2){M[v][u]=0;DEC[v][u]=''}else if(u>0&&v>0&&u<n-1&&v<n-1&&M[v][u]===2&&k===0&&j===0){M[v][u]=4;DEC[v][u]='~'}}
    if(Math.abs(b[0]-x)>Math.abs(b[1]-y))x+=Math.sign(b[0]-x);else y+=Math.sign(b[1]-y)}};
  const ent0=[c,n-3],tem=[c,6],S=[[7,20],[n-8,18],[10,n-12]];
  path(ent0,[c,c]);path([c,c],tem);for(const s of S)path([c,c],s);
  // il tempio: un recinto di rovine con la porta
  for(let y=2;y<=9;y++)for(let x=c-5;x<=c+5;x++){M[y][x]=0;DEC[y][x]='';if((y===2||x===c-5||x===c+5)&&r()<.85){M[y][x]=6;DEC[y][x]='ꞅ'}}
  const tp=po(c,4,'tempio48@1',{st:'dun',n:'Tempio di Giada'});if(!(P.unl&&P.unl.tempio48)){tp.lock='tempio48';tp.lockMsg='Le porte del tempio sono sigillate: servono i tre Sigilli di Giada.'}ents.push(tp);
  S.forEach((s,i)=>{for(let y=s[1]-2;y<=s[1]+2;y++)for(let x=s[0]-2;x<=s[0]+2;x++)if(x>0&&y>0&&x<n-1&&y<n-1&&M[y][x]!==2){M[y][x]=0;DEC[y][x]=''}ents.push({k:'sig48',i,px:s[0]+.5,py:s[1]+.5,n:'Santuario del Sigillo di Giada'})});
  for(let y=n-4;y<n-1;y++)for(let x=c-2;x<=c+2;x++){M[y][x]=0;DEC[y][x]=''}Object.assign(gate(c,n-2,'thal48',{n:'Verso Thalassa'}),{st:'cancello',dir:'x',span:3,off:-1.5,eo:1,sw:-1,sty:'giada'});
  // creature, forzieri, raccolte
  const fr=[];for(let y=3;y<n-3;y++)for(let x=2;x<n-2;x++)if(M[y][x]===0&&Math.hypot(x-ent0[0],y-ent0[1])>9&&!S.some(s=>Math.hypot(x-s[0],y-s[1])<4))fr.push([x,y]);for(let i=fr.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[fr[i],fr[j]]=[fr[j],fr[i]]}
  const pool=['scimmia48','pantera48','serpe48','scimmia48','serpe48'];for(let i=0;i<16&&fr.length;i++){const q=fr.pop();EN(pool[i%pool.length],q[0],q[1])}
  for(let i=0;i<4&&fr.length;i++){const q=fr.pop();ents.push({k:'ch',px:q[0]+.5,py:q[1]+.5,rich:i===0?1:0})}
  for(let i=0;i<8&&fr.length;i++){const q=fr.pop();RS(['legna','mela','lunare','rosa'][i%4],q[0],q[1])}
  return LFROM&&String(LFROM).startsWith('tempio48')?[c,8]:[c,n-5]}
Z.giungla48={n:'Giungla di Smeraldo',lv:13,N:56,a:'#4f9a4c',b:'#47904a',bg:'#8fd0b0',mus:'forest',pt:'leaf',gen:genGiungla,rd:['#7a6a48','#726244'],wl:'#2f5a2a',wh:14,dist:1,nolamp:1,en:['scimmia48','pantera48','serpe48']};
for(const k of['thal48','giungla48'])SKY[k]=SKY.porto||SKY.town;
/* ---- 7.49: i cancelli di Thalassa e della giungla, come quelli dei quartieri di Aldoria ---- */
Object.assign(GSTY,{thalassa:{p:'#f4f0e8',c:'#2ab8a8',l:'#2a6a8a',l2:'#1f5a7a',h:'#d4af37',bars:1,ex:(Q,o,sp,eo)=>{
    for(const a of[o,o+sp]){Q(a-.24,eo-.24,58,.48,.48,3,'#f4f0e8');Q(a-.18,eo-.18,61,.36,.36,5,'#2ab8a8');Q(a-.1,eo-.1,66,.2,.2,4,'#f4f0e8');Q(a-.05,eo-.05,70,.1,.1,4,'#d4af37')}
    Q(o+sp/2-.45,eo-.25,44,.9,.06,12,'#2a6a8a');Q(o+sp/2-.3,eo-.27,47,.6,.05,6,'#f4f0e8');Q(o+sp/2-.12,eo-.28,48,.24,.04,4,'#2ab8a8');Q(o+sp/2-.05,eo-.29,49.5,.1,.03,1.2,'#d4af37');
    for(const a of[o-1.05,o+sp+.6]){Q(a,eo-.3,0,.45,.45,6,'#c8a070');Q(a+.05,eo-.25,6,.35,.35,2,'#3f7a32');Q(a+.18,eo-.12,8,.08,.08,22,'#8a6a42');Q(a-.1,eo-.22,28,.65,.3,2,'#3a9a4a');Q(a+.05,eo-.4,28,.3,.6,2,'#4aa85a')}
    for(const a of[o-.5,o+sp+.32])Q(a,eo+.3,0,.18,.18,4,'#f0e0c8')}},
  giada:{p:'#5a7a6a',c:'#2ab87a',l:'#4a3a2a',l2:'#3a2a1a',h:'#6affc0',v:'#3a8a3a',ex:(Q,o,sp,eo)=>{
    for(const a of[o,o+sp]){Q(a-.3,eo-.3,58,.6,.6,4,'#4a6a5a');Q(a-.22,eo-.22,62,.44,.44,6,'#2ab87a');Q(a-.12,eo+.18,64,.24,.08,4,'#ffe84a');Q(a-.14,eo-.14,68,.28,.28,3,'#1f8a5a')}
    Q(o+sp/2-.55,eo-.3,46,1.1,.1,8,'#4a6a5a');Q(o+sp/2-.2,eo-.32,48,.4,.05,5,'#6affc0');Q(o+sp/2-.08,eo-.33,49,.16,.04,2,'#ffffff');
    for(let i=0;i<6;i++){Q(o-.4+i*.05,eo+.32,6+i*9,.07,.07,9,'#3a8a3a');Q(o+sp+.32-i*.05,eo+.32,8+i*8,.07,.07,8,'#4a9a4a')}
    for(const a of[o-1.1,o+sp+.55]){Q(a,eo-.35,0,.55,.55,10,'#5a7a6a');Q(a+.05,eo-.3,10,.45,.45,6,'#4a6a5a');Q(a+.12,eo-.36,12,.06,.02,2,'#6affc0');Q(a+.32,eo-.36,12,.06,.02,2,'#6affc0')}}}});
/* ---- i santuari dei sigilli ---- */
function olShrine(e){const o=olFix();if(o.s<2){msg('Un antico santuario di giada. Un\'iscrizione dice: «Solo chi è mandato dalla Regina può prendere il sigillo».');return}
  if(o.sig[e.i]){msg('Il sigillo di questo santuario è già tuo');return}
  if(!e.g48){e.g48=1;for(const[a,b]of[[-2,1],[2,1]]){const[x,y]=nearFree((e.px|0)+a,(e.py|0)+b);const m=mk('guerriero48',x,y);m.hp=m.mx=Math.round(m.mx*1.15);m.n='Custode di Giada';m.sh48=e.i;ents.push(m)}banner('I custodi si svegliano!','Sconfiggili per prendere il sigillo','spada');tone(200,.3,'sawtooth',.05);return}
  if(ents.some(x=>x.k==='en'&&x.sh48===e.i)){msg('I custodi del santuario sono ancora in piedi');tone(150,.1);return}
  o.sig[e.i]=1;const n=olSig();jingle([64,67,71,76],.1,'triangle');if(cineOK())sparks(e.px,e.py,26,['#6affc0','#ffffff','#2ab87a'],120);
  if(n>=3){o.s=Math.max(o.s,3);P.unl=P.unl||{};P.unl.tempio48=1;for(const q of ents)if(q.k==='po'&&q.to==='tempio48@1')delete q.lock;banner('Hai i tre Sigilli di Giada!','Le porte del Tempio, a nord, si aprono','corona')}
  else banner('Sigillo di Giada '+n+'/3','Ne mancano '+(3-n),'stella');save()}
/* ---- i personaggi della storia ---- */
X43P.mar48=()=>{const o=olFix(),inT=Zk==='thal48';if(inT)return`<h3>⛵ La Stella del Sud</h3><p class="x43t">«Si torna ad Aldoria? Il vento è buono.»</p><button onclick="olSail('porto')">⛵ Torna al Porto di Aldoria</button><button onclick="cl()">Resta</button>`;
  if(P.lv<10)return`<h3>⛵ Capitana Marina</h3><p class="x43t">«Laggiù, oltre l'orizzonte, c'è Thalassa. Ma il mare è pericoloso e il viaggio lungo: torna quando sarai più forte (livello 10).»</p><button onclick="cl()">Chiudi</button>`;
  if(o.s===0)return`<h3>⛵ Capitana Marina</h3><p class="x43t">«Stamattina è arrivata una barca da Thalassa, il regno oltre il mare. Il marinaio era stremato: il Serpente di Giada si è risvegliato nella giungla, e la Regina Nerea è scomparsa. Thalassa chiede aiuto ad Aldoria. Tu verresti?»</p>
    <button onclick="olFix().s=1;save();olSail('thal48')">⛵ Salpa per Thalassa</button><button onclick="cl()">Non ancora</button>`;
  return`<h3>⛵ Capitana Marina</h3><p class="x43t">«La Stella del Sud è pronta. Thalassa ci aspetta.»</p><button onclick="olSail('thal48')">⛵ Salpa per Thalassa</button><button onclick="cl()">Chiudi</button>`};
function olSail(to){cl();const fr=Zk;tone(300,.4,'sine',.05);irisGo(()=>{load(to,fr);if(to==='thal48'&&olFix().s===1&&!OL.arr){OL.arr=1;banner('Thalassa','Il regno oltre il mare · parla con il Cancelliere Oreste','corona')}})}
X43P.ore48=()=>{const o=olFix();let tx;
  if(o.s<=1){tx='«Grazie al mare sei arrivato. Ascolta: nel cuore della Giungla di Smeraldo c\'è il Tempio di Giada, dove dorme Quetzal, il Serpente. Per secoli ha protetto la giungla. Poi, una notte, si è svegliato furioso. La Regina Nerea è andata al tempio per calmarlo… e non è tornata. Le porte del tempio si aprono solo con i tre Sigilli di Giada, custoditi nei santuari della giungla. Trovali, ti prego.»';if(o.s<2){o.s=2;save();setTimeout(()=>banner('Nuova missione','Trova i tre Sigilli di Giada nella giungla','libro'),300)}}
  else if(o.s===2)tx='«I santuari sono tre: a ovest, a est e a sud-ovest della giungla. Hai '+olSig()+' sigilli su 3.»';
  else if(o.s===3)tx='«Hai i sigilli! Il tempio è a nord della giungla. Che il mare ti protegga.»';
  else if(o.s===4)tx='«La Regina è tornata! Ti aspetta qui, nel palazzo.»';else tx='«Thalassa non dimenticherà mai il tuo nome.»';
  return`<h3>📜 Cancelliere Oreste</h3><p class="x43t">${tx}</p><button onclick="cl()">Chiudi</button>`};
X43P.ner48=()=>{const o=olFix(),sp=P.st48&&P.st48.b&&P.st48.b.tempio48>0;if(o.s>=5)return`<h3>👑 Regina Nerea</h3><p class="x43t">«${sp?'Quetzal veglia di nuovo sulla giungla, come un tempo. Grazie a te.':'La giungla è più silenziosa, senza il Serpente. Ma Thalassa è salva.'} Torna quando vuoi: questa è anche casa tua.»</p><button onclick="cl()">Chiudi</button>`;
  return`<h3>👑 Regina Nerea</h3><p class="x43t">«${sp?'Quando Quetzal si è arreso, i suoi occhi sono tornati verdi, come quando ero bambina. Qualcuno aveva rubato la Perla del tempio e lui era impazzito di dolore. Hai fatto bene a risparmiarlo: ora veglierà di nuovo sulla giungla.':'Hai fatto quello che andava fatto. Il Serpente non avrebbe più smesso di distruggere. Ma mi chiedo se ci fosse un\'altra via…'} Thalassa ha un debito con te, eroe di Aldoria.»</p>
  <button onclick="olReward()">👑 Ricevi i doni della Regina</button>`};
function olReward(){const o=olFix();if(o.s!==4)return;o.s=5;const it=item(Math.max(16,P.lv),3,'h');it.n='Corona di Corallo';it.hp=(it.hp||0)+120;if(P.inv.length<INV)P.inv.push(it);else ents.push({k:'dr',px:P.px,py:P.py,it});
  P.g+=4000;goldFly(4000);gainXP(3000);P.pot+=5;banner('Eroe di Thalassa','4000 oro, la Corona di Corallo e cinque pozioni','corona');jingle([60,64,67,72,76,79,84],.09,'triangle');if(typeof titAdd==='function')titAdd('thalassa','Eroe di Thalassa');save();hud();cl()}
const _kill748s=kill;kill=function(e){const b=e&&e.k==='en'&&e.t==='quetzal48'&&ents.includes(e);_kill748s(e);if(b&&!ents.includes(e)){const o=olFix();if(o.s<4){o.s=4;save();setTimeout(()=>banner('La Regina Nerea è libera!','Torna a Thalassa: ti aspetta nel palazzo','corona'),3200)}}};
X43P.zef48=()=>{const L=[['pot','5 pozioni',150],['seal','3 Sigilli di doma',240],['conchiglia','5 Conchiglie',90],['gemma','1 Gemma',260]];
  return`<h3>🧺 Mercante Zefiro · 💰${P.g}</h3><p class="x43t">«Tutto quello che il mare porta, Zefiro lo vende!»</p>${L.map(([k,n,p])=>{const c=px('zef_'+k,p);return`<div class="x43r"><span>${n}</span><button onclick="olBuy('${k}',${c})">${c} 💰</button></div>`}).join('')}<button onclick="cl()">Chiudi</button>`};
function olBuy(k,c){if(P.g<c){msg('Servono '+c+' monete');tone(150,.1);return}P.g-=c;if(k==='pot')P.pot+=5;else if(k==='seal')P.seal=(P.seal|0)+3;else if(k==='conchiglia')P.res.conchiglia=(P.res.conchiglia|0)+5;else P.res.gemma=(P.res.gemma|0)+1;tone(700,.08,'triangle');hud();save();pn('zef48')}
// i personaggi: le risposte e i punti esclamativi
const _act748s=act;act=function(e){if(e&&e.k==='npc'&&e.nid==='capitanomarina48'||e&&e.k==='trag48b'){pn('mar48');return}if(e&&e.k==='npc'&&e.nid==='oreste48'){pn('ore48');return}if(e&&e.k==='npc'&&e.nid==='nerea48'){pn('ner48');return}
  if(e&&e.k==='npc'&&e.nid==='zefiro48'){pn('zef48');return}if(e&&e.k==='sig48'){olShrine(e);return}_act748s(e)};
ITK.add('sig48');ITK.add('trag48b');
function olQM(e){const o=olFix();if(e.nid==='capitanomarina48')return P.lv>=10&&o.s===0?'!':'';if(e.nid==='oreste48')return o.s<=1?'!':'';if(e.nid==='nerea48')return o.s===4?'?':'';return null}
const _ent748s=ent;ent=function(e){if(e.k==='npc'&&e.nid&&/48$/.test(e.nid)){const m=olQM(e);if(m!=null)e.qm=m}
  if(e.k==='sig48'){const got=olFix().sig[e.i],u=Math.sin(t*2+e.i)*1.5;drawL([[-.4,-.4,0,.8,.8,4,'#5a7a6a'],[-.3,-.3,4,.6,.6,3,'#6a8a7a'],[-.08,-.08,7,.16,.16,16,'#3a6a5a']],e.px,e.py,0);
    if(!got){box(e.px-.12,e.py-.12,24+u,.24,.24,6,'#6affc0',1.5);if(typeof nlight==='function')nlight(e.px,e.py,26,70,'106,255,192',.6)}return}
  if(e.k==='trag48b'){drawL([[-.3,-.6,0,.6,1.2,6,'#6a4a2a'],[-.04,-.04,6,.08,.08,40,'#5a3a1a'],[-.02,-.5,18,.04,1,20,'#f4ecd8']],e.px,e.py,0);return}
  _ent748s(e)};
// il Tempio di Giada non ha un frammento della Corona: la Corona ne ha sei
{const dc0=dungeonClear;dungeonClear=function(e){const id=ZZ&&ZZ.dg;dc0(e);if(id==='tempio48')for(let i=ents.length-1;i>=0;i--)if(ents[i].k==='shard'&&ents[i].id==='tempio48')ents.splice(i,1)}}
// la Capitana Marina al Porto di Aldoria
function olPlace(){if(!ZZ||!started||Zk!=='porto'||ents.some(e=>e.nid==='capitanomarina48'))return;const q=spot47([30,28],1.4);if(q){const e=mkNpc('capitanomarina48',q[0],q[1]);e.n='Capitana Marina · traghetto per Thalassa';ents.push(e)}}
const _loadPost748s=loadPost;loadPost=function(k){_loadPost748s(k);try{olPlace();if(k==='porto'&&(LFROM==='thal48')){const m=ents.find(e=>e.nid==='capitanomarina48');if(m){const[x,y]=nearFree(m.px|0,(m.py|0)+1);heroPut(x,y)}}}catch(e){console.warn('oltremare',e)}};
