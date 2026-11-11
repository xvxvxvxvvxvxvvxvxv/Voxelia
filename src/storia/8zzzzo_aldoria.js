/* ================= 8.6: ALDORIA RIDISEGNATA =================
   La città della Storia era una griglia di strade dritte con il prato in mezzo. Gli edifici restano dove sono (porte,
   interni, personaggi e missioni non cambiano); cambia tutto quello che c'è in mezzo:
   - il FIUME ARGENTO scende da nord al mare al posto della cerchia est, con quattro ponti di pietra; al di là c'è
     l'Oltrefiume (Osservatorio, Municipio, Scuderia, Serraglio);
   - la PIAZZA DELLA FONTANA è grande e rotonda, lastricata a cerchi; i due viali sono lastricati e alberati, le altre
     strade acciottolate, con vicoli nuovi fra le case e la piazzetta del pozzo;
   - i GIARDINI DELLA REGINA a sud-est della piazza: uno stagno, sentieri, aiuole, alberi in fiore, un gazebo;
   - il PORTO: la banchina di legno, due moli nuovi, casse e barche; il giardino del castello; bandiere alle porte;
   - lampioni che si accendono di notte, panchine, fioriere, canneti lungo il fiume, un mulino ad acqua.
   Tutto è calcolato dopo la città di prima (genTown) e in modo fisso: in rete tutti vedono la stessa Aldoria.
   Vale solo nella Storia: in Tomorrow la città resta quella di Tomorrow. */
const AL86={on:0,st:null,N:0,ch:null};
const alOn=()=>AL86.on&&Zk==='town'&&AL86.st&&AL86.N===N;
const alStory=()=>MODE==='story'&&!(typeof OW!=='undefined'&&OW.on);
const AL_PC=[35.5,35.5],AL_PR=8.3;           // centro e raggio della piazza
function alRiver(y){if(y<16)return[55+Math.round(Math.sin(y*.55)*.9),3];if(y<54)return[55,2];return[56,2]}
const AL_BR=[[16,17],[34,37],[52,53],[62,63]];  // i ponti: le righe delle strade che attraversano il fiume
function alBuild(){const n=N,st=AL86.st=new Uint8Array(n*n),ch=AL86.ch=new Set();AL86.N=n;AL86.on=1;
  const S=(x,y,c)=>{st[y*n+x]=c.charCodeAt(0)},inb=(x,y)=>x>0&&y>0&&x<n-1&&y<n-1;
  const entNear=(x,y,r)=>ents.some(e=>e.px!=null&&Math.abs(e.px-.5-x)<=r&&Math.abs(e.py-.5-y)<=r);
  const door=(x,y)=>ents.some(e=>e.k==='po'&&Math.abs(e.px-.5-x)<=1&&Math.abs(e.py-.5-y)<=1);
  // un arredo: solo sul prato libero, mai davanti a una porta o addosso a qualcuno
  const Pp=(x,y,c)=>{if(!inb(x,y)||M[y][x]!==0||entNear(x,y,1.2)||door(x,y))return false;M[y][x]=6;DEC[y][x]='⌂'+c;ch.add(y*n+x);return true};
  const road=(x,y,c)=>{if(!inb(x,y))return;if(M[y][x]===0){M[y][x]=4;DEC[y][x]='';ch.add(y*n+x)}if(M[y][x]===4||M[y][x]===6)S(x,y,c)};
  const bridge=y=>AL_BR.some(([a,b])=>y>=a&&y<=b);
  // 1. le strade di prima: viali lastricati, vie acciottolate, lungomare di legno
  for(let y=1;y<n-1;y++)for(let x=1;x<n-1;x++)if(M[y][x]===4&&y<64)S(x,y,y>=62?'W':(x>=34&&x<=37)||(y>=34&&y<=37)?'V':'C');
  // 2. il fiume, con il lungofiume a ovest e i ponti
  for(let y=1;y<64;y++){const[x0,w]=alRiver(y);for(let x=x0;x<x0+w;x++){if(!inb(x,y)||M[y][x]===3||M[y][x]===1)continue;
      if(bridge(y)){M[y][x]=4;DEC[y][x]='';S(x,y,'B')}else{M[y][x]=2;DEC[y][x]='';st[y*n+x]=0;ch.add(y*n+x)}}
    for(const x of[x0-1,x0-2])if(inb(x,y)&&(M[y][x]===0||M[y][x]===4)&&!bridge(y))road(x,y,'C');
    if(!bridge(y)&&hh(y*3.1,7)>.72)Pp(x0+w,y,'r');if(!bridge(y)&&hh(y*1.7,3)>.86)Pp(x0-3,y,'r')}
  for(const[a,b]of AL_BR)for(let y=a;y<=b;y++)for(let x=57;x<=59;x++)if(inb(x,y)&&M[y][x]===4&&!st[y*n+x])S(x,y,y>=62?'W':y>=34&&y<=37?'V':'C');
  for(const[x,y]of[[55,22],[56,45],[57,58]])if(M[y][x]===2)DEC[y][x]='O';
  Pp(58,7,'m');
  // 3. la piazza rotonda
  for(let y=26;y<=45;y++)for(let x=26;x<=45;x++){const d=Math.hypot(x+.5-AL_PC[0],y+.5-AL_PC[1]);if(d>AL_PR)continue;if(M[y][x]===0||M[y][x]===4)road(x,y,'P');else if(M[y][x]===6)S(x,y,'P')}
  for(let i=0;i<8;i++){const a=i/8*6.283+.39,x=Math.round(AL_PC[0]+Math.cos(a)*(AL_PR+1.2)-.5),y=Math.round(AL_PC[1]+Math.sin(a)*(AL_PR+1.2)-.5);Pp(x,y,i%2?'b':'l')}
  // 4. i Giardini della Regina
  const gx=46.5,gy=45.5;for(let y=39;y<=51;y++)for(let x=40;x<=52;x++){if(M[y][x]===3||M[y][x]===1)continue;const d=Math.hypot((x+.5-gx)*.85,y+.5-gy);
    if(d<2.3){if(!entNear(x,y,.6)){M[y][x]=2;DEC[y][x]=hh(x,y)>.8?'^':'';st[y*n+x]=0;ch.add(y*n+x)}}
    else if(d<3.5||Math.abs(x+.5-gx)<.6||Math.abs(y+.5-gy)<.6){if(M[y][x]===6&&d>=3.5)continue;if(M[y][x]===6){M[y][x]=0;DEC[y][x]=''}road(x,y,'S')}}
  for(let y=39;y<=51;y++)for(let x=40;x<=52;x++){if(M[y][x]!==0)continue;const d=Math.hypot((x+.5-gx)*.85,y+.5-gy),r=hh(x*2.3,y*1.9);
    if(d>4.2&&d<5.2&&(x+y)%2===0)Pp(x,y,'f');else if(d>5.4&&r>.62)Pp(x,y,r>.86?'T':'t');else if(d>5.4&&r<.08)Pp(x,y,'h')}
  for(const[x,y]of[[43,42],[50,42],[43,49],[50,49]])Pp(x,y,'b');Pp(49,40,'g');Pp(44,51,'s');
  // 5. i vicoli e la piazzetta del pozzo
  for(let x=18;x<=30;x++){road(x,24,'C');road(x,31,'C')}for(let y=18;y<=33;y++)road(23,y,'C');for(let x=18;x<=33;x++)road(x,43,'C');for(let y=38;y<=51;y++)road(31,y,'C');
  for(let y=22;y<=25;y++)for(let x=29;x<=32;x++)road(x,y,'P');if(M[23][30]===4){M[23][30]=6;DEC[23][30]='⌂w';ch.add(23*n+30)}Pp(28,22,'o');Pp(33,25,'o');
  for(let x=57;x<=59;x++)for(let y=26;y<=33;y++)if(x===58)road(x,y,'C');
  // 6. il giardino del castello: un sentiero dalla porta e le aiuole ai lati
  for(let y=12;y<=15;y++)for(let x=2;x<=14;x++){if(x>=7&&x<=9)road(x,y,'S');else if((x+y)%2===0)Pp(x,y,'f');else if(y===13&&(x===5||x===11))Pp(x,y,'h')}
  // 7. i viali alberati, con i lampioni
  for(let i=3;i<=61;i++){for(const[x,y]of[[33,i],[38,i],[i,33],[i,38]]){if(Math.hypot(x+.5-AL_PC[0],y+.5-AL_PC[1])<AL_PR+1.5)continue;if(i%3===0)Pp(x,y,i%6===0?'l':'c')}}
  for(let i=4;i<=60;i+=7)for(const[x,y]of[[15,i],[18,i],[i,15],[i,18],[i,51],[i,54]])if(hh(x,y)>.35)Pp(x,y,hh(y,x)>.5?'l':'o');
  // 8. il porto: due moli, casse, bitte
  for(const x0 of[21,43])for(let y=64;y<=69;y++)for(let x=x0;x<x0+3;x++)if(M[y][x]===2&&DEC[y][x]!=='O'){M[y][x]=4;DEC[y][x]='';ch.add(y*n+x)}
  for(const[x,y]of[[20,61],[24,61],[42,61],[46,61],[16,61],[36,61]])Pp(x,y,'k');
  // 9. le bandiere alle porte della città
  for(const[x,y]of[[33,2],[38,2],[69,33],[69,38],[2,33],[2,38],[15,2],[18,2]])Pp(x,y,'p');
  // chi era sulle caselle che ora sono acqua o arredo si sposta sulla casella libera più vicina
  for(const e of ents){if(e.px==null||e.k==='po')continue;const x=e.px|0,y=e.py|0;if(ch.has(y*n+x)&&!WK(M[y][x])){const q=nearFree(x,y);e.px=q[0]+.5;e.py=q[1]+.5;if(e.path)e.path=[]}}
  for(const e of ents)if(e.k==='po'&&e.st==='door'){const x=e.px|0,y=e.py|0;if(inb(x,y)&&!WK(M[y][x])&&M[y][x]!==3){M[y][x]=4;DEC[y][x]='';S(x,y,'C')}}}
{const g0=genTown;genTown=function(){AL86.on=0;const sp=g0();try{if(alStory())alBuild()}catch(e){AL86.on=0;console.warn('Aldoria ridisegnata',e)}return sp}}
{const l0=loadPost;loadPost=function(k){if(k!=='town')AL86.on=0;l0(k)}}
/* ---- la Torre della Corona: accanto al Colosseo, sul prato a sud dell'arena (x49-51, y13-15). La torre occupa solo
   il prato: la strada davanti (y16-17) resta libera, la porta dà sul selciato. ---- */
function alTower(){if(!alOn())return null;const x=50,y=16;for(let v=y-3;v<y;v++)for(let u=x-1;u<=x+1;u++){const m=M[v][u];if(m!==0&&m!==6)return null}if(!WK(M[y][x]))return null;
  for(let v=y-3;v<y;v++)for(let u=x-1;u<=x+1;u++){DEC[v][u]='';AL86.st[v*N+u]=0}
  for(const e of ents)if(e.px!=null&&e.k!=='po'&&e.px>=x-1&&e.px<x+2&&e.py>=y-3&&e.py<y){e.px=x+2.5;e.py=y-1.5;if(e.path)e.path=[]}
  return[x,y]}
/* ---- l'acqua: fiume, laghetto e mare stanno più in basso del selciato (prima erano 3 punti sotto e sembravano
   a filo, o più alti). Ora la superficie è 9 punti sotto, con una sponda di pietra dove tocca la terra. ---- */
{const f0=floor;floor=function(x,y,c,h){if(c!==2||!alOn()||DEC[y][x]==='ɷ'||(x===35&&y===35)||(ZZ&&ZZ.pool)||(typeof PIERD!=='undefined'&&PIERD.has(y*N+x))){f0(x,y,c,h);return}
  const d=DEC[y][x];
  if(WMODE!==2){const W=(u,v)=>v<0||u<0||v>=N||u>=N||M[v][u]===2;
    box(x,y,-15,1,1,6,'#3b86d6',.86+Math.sin(t*2+x+y)*.07);
    if(!W(x,y-1)){box(x,y,-9,1,.07,9,'#8f887c',.82);box(x,y+.07,-9,1,.3,0,'#2c6cb8')}
    if(!W(x-1,y)){box(x,y,-9,.07,1,9,'#8f887c',1);box(x+.07,y,-9,.3,1,0,'#2c6cb8')}
    if(SET.ultra&&g===G0){const ph=hh(x*3.1,y*7.7)*6.283,a=Math.pow(Math.max(0,Math.sin(t*2.3+ph)),12);if(a>.05){g.globalAlpha=a;box(x+.2+hh(x,y*2)*.5,y+.2+hh(x*2,y)*.5,-9,.13,.13,0,'#ffffff');g.globalAlpha=1}
      const b=Math.sin((x-y)*.55-t*1.1);if(b>.8){g.globalAlpha=(b-.8)*1.1;box(x+.1,y+.1,-9,.9,.9,0,'#e6f4ff');g.globalAlpha=1}}}
  if(WMODE===1)return;
  if(d==='^'){const b2=Math.sin(t*2+x)*1.5;box(x+.4,y+.4,-9+b2,.2,.2,6,'#e8483a');box(x+.42,y+.42,-3+b2,.16,.16,3,'#ffffff')}
  if(d==='O'){box(x+.1,y-.3,-9,.8,1.6,6,'#7a5a3a');box(x+.45,y+.3,-3,.08,.08,26,'#5a4a3a');box(x+.5,y,3,.04,.7,16,'#eeeeee')}}}
// il disegno veloce dell'acqua (4b_fast) la mette alla quota vecchia: ad Aldoria ogni casella d'acqua passa da qui sopra
{const w0=fWspec;fWspec=function(x,y){return w0(x,y)||alOn()}}
/* ---- il suolo ---- */
{const f0=floor;floor=function(x,y,c,h){if(!alOn()||c===2||c===1||c===3){f0(x,y,c,h);return}const s=AL86.st[y*N+x];if(!s){f0(x,y,c,h);return}const l=.92+h*.1;
  switch(String.fromCharCode(s)){
    case'V':{box(x,y,-6,1,1,6,((x>>1)+(y>>1))&1?'#cfc4ac':'#c5b99f',l);if(x&1)box(x+.96,y,0,.04,1,.15,'#a39780');if(y&1)box(x,y+.96,0,1,.04,.15,'#a39780');return}
    case'C':{box(x,y,-6,1,1,6,(x+y)&1?'#9d958b':'#a69e93',l);const a=hh(x*3,y*5),b=hh(x*7,y*2);box(x+.12+a*.5,y+.15+b*.2,0,.26,.2,.25,'#8a8278');box(x+.55-b*.3,y+.6-a*.2,0,.22,.24,.25,'#b3ab9f');return}
    case'P':{const d=Math.hypot(x+.5-AL_PC[0],y+.5-AL_PC[1]),r=Math.floor(d/1.55),an=(Math.atan2(y+.5-AL_PC[1],x+.5-AL_PC[0])/6.283+1)*16%2;
      box(x,y,-6,1,1,6,d>AL_PR-1?'#b89a6a':an<.28&&d>3?'#c2a878':r&1?'#e4d8be':'#d3c5a7',l);return}
    case'S':{box(x,y,-6,1,1,6,(x+y)&1?'#dcc89c':'#d5c093',l);const a=hh(x*5,y*3);if(a>.5)box(x+a*.6,y+.3,0,.1,.1,.3,'#b8a070');return}
    case'W':{pierTile(x,y,h);return}
    case'B':{box(x,y,-6,1,1,9,(x+y)&1?'#b4ac9e':'#aaa294',l);box(x+.48,y,3,.04,1,.15,'#8c8476');
      const n2=y>0&&M[y-1][x]===2,s2=y<N-1&&M[y+1][x]===2;if(n2){box(x,y,3,1,.14,7,'#8f8778');box(x+.4,y-.02,10,.2,.18,3,'#a39b8c')}if(s2){box(x,y+.86,3,1,.14,7,'#8f8778');box(x+.4,y+.84,10,.2,.18,3,'#a39b8c')}return}}
  f0(x,y,c,h)}}
/* ---- gli arredi ---- */
const ALP={
  t:(x,y)=>{const k=hh(x,y),g1=['#3f8a3a','#4a9a44','#357a32'][(x+y)%3];box(x+.42,y+.42,0,.16,.16,11,'#6a4a2a');box(x+.14,y+.14,11,.72,.72,7,g1);box(x+.24,y+.24,18,.52,.52,6,shx(g1,1.12));box(x+.36,y+.36,24,.28,.28,4+k*3,shx(g1,1.25))},
  T:(x,y)=>{const c=['#f4a8c8','#ffd0e0','#f8f0c0'][(x*3+y)%3];box(x+.43,y+.43,0,.14,.14,10,'#7a5a3a');box(x+.16,y+.16,10,.68,.68,6,c);box(x+.28,y+.28,16,.44,.44,5,shx(c,1.08));box(x+.1,y+.6,0,.08,.08,.4,c);box(x+.7,y+.2,0,.08,.08,.4,c)},
  c:(x,y)=>{box(x+.43,y+.43,0,.14,.14,8,'#5a4028');for(let i=0;i<4;i++){const w=.5-i*.09;box(x+.5-w/2,y+.5-w/2,8+i*7,w,w,7.4,i%2?'#2f6a34':'#38783c')}},
  f:(x,y)=>{box(x+.06,y+.06,0,.88,.88,2,'#6a4a32');box(x+.12,y+.12,2,.76,.76,.8,'#4a7a3a');const C=['#ff5a7a','#ffd84a','#ffffff','#c46bff','#ff9a3a'];
    for(let i=0;i<5;i++){const a=hh(x+i,y*2+i),b=hh(x*2+i,y+i);box(x+.16+a*.6,y+.16+b*.6,2.8,.1,.1,2+a*2,C[(x+y+i)%5],1.1)}},
  b:(x,y)=>{box(x+.12,y+.38,3,.76,.3,1,'#8a5a32');box(x+.12,y+.36,4,.76,.07,5,'#7a4e2a');for(const u of[.16,.78])box(x+u,y+.42,0,.07,.22,3,'#3a3a40')},
  l:(x,y)=>{box(x+.4,y+.4,0,.2,.2,2,'#3a3a44');box(x+.46,y+.46,2,.08,.08,24,'#2e2e36');box(x+.3,y+.46,24,.4,.08,1.2,'#2e2e36');const on=NK>.45;
    for(const u of[.26,.62]){box(x+u,y+.42,19,.12,.16,5,on?'#ffe6a0':'#c8c0a0',on?1.6:1)}if(on&&SET.ultra)GLOW.push([x+.5,y+.5,22,70,'255,214,130',.3])},
  w:(x,y)=>{box(x+.12,y+.12,0,.76,.76,6,'#9a968e');box(x+.24,y+.24,6,.52,.52,.4,'#2a5a8a');for(const u of[.14,.76])box(x+u,y+.44,6,.1,.12,13,'#6a4a2a');box(x+.06,y+.3,19,.88,.4,2,'#8a3a2a');box(x+.16,y+.36,21,.68,.28,1.6,'#a8483a');box(x+.47,y+.47,12,.06,.06,7,'#c8b89a')},
  s:(x,y)=>{box(x+.22,y+.22,0,.56,.56,8,'#b8b4ac');box(x+.18,y+.18,8,.64,.64,1.4,'#a8a49c');box(x+.38,y+.4,9.4,.24,.2,11,'#d4af37');box(x+.4,y+.4,20,.2,.2,5,'#e8c860');box(x+.28,y+.44,14,.44,.1,2,'#d4af37')},
  g:(x,y)=>{box(x-.2,y-.2,0,1.4,1.4,1.4,'#d8d0c0');for(const[u,v]of[[-.15,-.15],[1.03,-.15],[-.15,1.03],[1.03,1.03]])box(x+u,y+v,1.4,.12,.12,18,'#f0ece0');box(x-.3,y-.3,19,1.6,1.6,2,'#3a6a8a');box(x-.05,y-.05,21,1.1,1.1,3,'#4a7a9a');box(x+.3,y+.3,24,.4,.4,3,'#5a8aaa');box(x+.46,y+.46,27,.08,.08,4,'#d4af37')},
  m:(x,y)=>{box(x+.05,y+.05,0,.9,.9,20,'#c8b89a');box(x,y,20,1,1,3,'#7a3a2a');box(x+.15,y+.15,23,.7,.7,4,'#8a4636');box(x+.35,y+.96,3,.3,.04,8,'#4a3020');
    const a=t*1.4;box(x-.12,y+.42,9,.14,.16,1.2,'#4a3a2a');for(let i=0;i<8;i++){const q=a+i*.785;box(x-.3,y+.44+Math.cos(q)*.42,9.4+Math.sin(q)*13,.2,.12,1.6,i%2?'#6a4a2a':'#7a5a34')}},
  r:(x,y)=>{for(let i=0;i<6;i++){const a=hh(x+i,y),b=hh(x,y+i);box(x+.1+a*.75,y+.1+b*.75,0,.05,.05,6+a*8,'#5a8a3a');if(i%2)box(x+.08+a*.75,y+.08+b*.75,6+a*8,.09,.09,3,'#6a4a2a')}},
  p:(x,y)=>{box(x+.36,y+.36,0,.28,.28,3,'#8a8a94');box(x+.46,y+.46,3,.08,.08,40,'#c8c8d0');for(let i=0;i<5;i++)box(x+.54+i*.14,y+.47+Math.sin(t*3+i*.9)*.05,31-i*.3,.14,.05,10,i%2?'#c8283a':'#e0b030',1.1);box(x+.43,y+.43,43,.14,.14,2,'#d4af37')},
  o:(x,y)=>{box(x+.2,y+.2,0,.6,.6,5,'#a89a84');box(x+.26,y+.26,5,.48,.48,1,'#4a3a2a');const C=['#ff5a7a','#ffd84a','#c46bff'];for(let i=0;i<4;i++)box(x+.3+(i%2)*.24,y+.3+(i>>1)*.24,6,.14,.14,3+hh(x+i,y)*2,C[(x+y+i)%3],1.1)},
  k:(x,y)=>{box(x+.08,y+.3,0,.5,.5,7,'#8a6a42');box(x+.1,y+.32,7,.46,.46,.5,'#a07c50');box(x+.5,y+.1,0,.4,.4,9,'#6a4a2a');box(x+.48,y+.08,3,.44,.44,1,'#3a3a40');box(x+.3,y+.4,7.5,.4,.4,6,'#9a7a4a')},
  h:(x,y)=>{box(x+.05,y+.2,0,.9,.6,7,'#2f6a34');box(x+.1,y+.25,7,.8,.5,2,'#3a7a3e')}};
{const d0=dec;dec=function(x,y,c,h){if(c&&c[0]==='⌂'&&c.length===2){const f=ALP[c[1]];if(f){f(x,y,h);return}}d0(x,y,c,h)}}
/* ---- i quartieri ---- */
const ALQ={centro:{n:'Piazza della Fontana',ic:'⛲'},porto:{n:'Porto di Aldoria',ic:'⚓',m:'al_porto'},nobile:{n:'Quartiere del Castello',ic:'🏰',m:'al_nobile'},giardini:{n:'Giardini della Regina',ic:'🌳',m:'al_giardini'},
  artigiani:{n:'Quartiere degli Artigiani',ic:'⚒',m:'al_artigiani'},oltre:{n:'Oltrefiume',ic:'🌉',m:'al_oltre'},case:{n:'Vicoli delle Case',ic:'🏠'}};
function alDist(x,y){if(y>=56)return'porto';if(x>=57)return'oltre';if(x<34&&y<17)return'nobile';if(x>=39&&x<=53&&y>=38&&y<=52)return'giardini';if(x>=38&&y>=17&&y<34)return'artigiani';if(Math.hypot(x-AL_PC[0],y-AL_PC[1])<AL_PR+2)return'centro';if(x>=17&&x<34&&y>=17)return'case';return'centro'}
// le musiche dei quartieri: quella di sempre («Le vie di Aldoria») resta al centro e fra le case, e in tutta la città se lo scegli
Object.assign(TRK,{al_porto:{bpm:92,root:48,sc:'dor',pr:[0,3,6,4,0,5,3,4],ld:'triangle',dn:.5,dr:1,bs:[0,7,12,7],arp:1},al_giardini:{bpm:72,root:57,sc:'maj',pr:[0,4,5,3],ld:'sine',dn:.4,dr:0,arp:1,pad:1},
  al_nobile:{bpm:84,root:55,sc:'maj',pr:[0,3,4,0,5,1,4,0],ld:'square',dn:.42,dr:0,pad:1,bs:[0,4,7,4]},al_artigiani:{bpm:112,root:50,sc:'dor',pr:[0,6,3,4],ld:'sawtooth',dn:.55,dr:1,bs:[0,0,7,5]},al_oltre:{bpm:96,root:52,sc:'maj',pr:[0,5,1,4,0,3,4,4],ld:'triangle',dn:.55,dr:1,arp:1}});
{const z0=zoneMus;zoneMus=function(){const m=z0();if(m!=='town'||!alOn()||SET.almus===0||!AL86.d)return m;return(ALQ[AL86.d]&&ALQ[AL86.d].m)||m}}
// i suoni d'ambiente: acqua, gabbiani, uccelli, il martello della fucina
function alAmb(){if(!AU.ac||!SET.sf||SET.alamb===0||PM)return;const t0=AU.ac.currentTime,d=AL86.d,x=P.px,y=P.py,r=Math.random();const[rx,rw]=alRiver(clamp(y|0,1,63));
  try{if(Math.abs(x-(rx+rw/2))<5&&y<64||d==='porto'||Math.hypot(x-AL_PC[0],y-AL_PC[1])<5||Math.hypot(x-46.5,y-45.5)<4)nz(t0,.7+r*.5,.014,700+r*900,'bandpass');
    if(d==='porto'&&r<.4){note(86,t0,.16,'sine',.022,.02);note(83,t0+.17,.22,'sine',.02,.02);if(r<.15){note(86,t0+.55,.14,'sine',.018,.02);note(82,t0+.7,.25,'sine',.016,.02)}}
    if(d==='giardini'&&r<.7){const b=94+Math.floor(r*10);for(let i=0;i<3+(r*4|0);i++)note(b+(i%3)*2+(i&1?3:0),t0+i*.09,.06,'sine',.018,.005)}
    if(d==='artigiani'&&Math.hypot(x-42,y-22)<10&&r<.6){note(93,t0,.07,'square',.012,.002);note(93,t0+.28,.07,'square',.01,.002);if(r<.3)note(90,t0+.56,.1,'square',.012,.002)}
    if(d==='nobile'&&r<.12)for(let i=0;i<3;i++)note(72,t0+i*.9,.8,'sine',.03,.01)}catch(e){}}
{const u0=upd;upd=function(dt){u0(dt);if(!started||!P||!alOn())return;AL86.tk=(AL86.tk||0)-dt;if(AL86.tk>0)return;AL86.tk=.5;const c=alDist(P.px,P.py);
  if(c!==AL86.d){if(c===AL86.dc)AL86.dn=(AL86.dn|0)+1;else{AL86.dc=c;AL86.dn=1}if(AL86.dn>=3||!AL86.d){const first=!AL86.d;AL86.d=c;AL86.dn=0;if(!first&&ALQ[c])msg(ALQ[c].ic+' '+ALQ[c].n)}}else AL86.dc=null;
  AL86.am=(AL86.am||3)-.5;if(AL86.am<=0){AL86.am=2.5+Math.random()*5;alAmb()}
  if(AL86.ps!==P.st){AL86.ps=P.st;alLines()}}}
{const l0=loadPost;loadPost=function(k){l0(k);AL86.d=null;AL86.ps=null;try{if(alStory())alLines()}catch(e){}}}
// nelle impostazioni dell'audio
{const s0=setBody;setBody=function(k){let h=s0(k);if(k==='audio')h+=sGrp('Aldoria',`<div class="row"><label for="s_almus">Musica diversa per ogni quartiere<br><small class="mu">Spenta: in tutta la città suona «Le vie di Aldoria», come prima</small></label><input type="checkbox" id="s_almus" ${SET.almus!==0?'checked':''} onchange="setv('almus',this.checked?1:0);AU.want='';if(started)music(zoneMus())"></div><div class="row"><label for="s_alamb">Suoni d'ambiente in città<br><small class="mu">Acqua, gabbiani al porto, uccelli nei giardini, il martello della fucina</small></label><input type="checkbox" id="s_alamb" ${SET.alamb!==0?'checked':''} onchange="setv('alamb',this.checked?1:0)"></div>`);return h}}
/* ---- la gente dei quartieri ---- */
Object.assign(NPCS,{
  olmo:{n:'Giardiniere Olmo',c:'#4a7a3a',hat:'#c8a84a',qs:['qa1','qa2','qa3'],ln:['Le rose della Regina fioriscono due volte l\'anno, se le tratti bene.','Lo stagno? L\'ho scavato io, con mio padre. Trent\'anni fa.']},
  remo:{n:'Barcaiolo Remo',c:'#3a5a7a',hat:'#8a3a2a',qs:['qp1','qp2','qp3'],ln:['Il Fiume Argento porta al mare tutto quello che la città dimentica.','Con la mia barca risalgo il fiume fino all\'Osservatorio. Un giorno ti ci porto.']},
  ines:{n:'Lavandaia Ines',c:'#c8a0b0',hat:'#f0f0f0',qs:['ql1','ql2'],ln:['L\'acqua del fiume è gelida, ma lava meglio di qualunque sapone.','Dal lungofiume si sente tutto: chi litiga, chi canta, chi trama.']},
  leandro:{n:'Pittore Leandro',c:'#7a3a8a',hat:'#2a2a2a',qs:['qt1','qt2','qt3'],ln:['La luce della piazza al tramonto: non riesco mai a prenderla.','Un giorno dipingerò te, quando sarai famoso.']},
  bruna:{n:'Guardia Bruna del Ponte',c:'#5a6a8a',hat:'#9aa4b8',qs:['qb1','qb2'],ln:['Il Ponte Grande regge da trecento anni. Reggerà anche a te.','Di notte dal fiume sale la nebbia. Meglio non attraversare da soli.']},
  celeste:{n:'Apprendista Celeste',c:'#2a3a7a',hat:'#d8d4c8',qs:['qo1','qo2'],ln:['Dall\'Osservatorio si vede la Cittadella del Vuoto, nelle notti limpide. Non è un bello spettacolo.','Le stelle sopra Aldoria non sono più al loro posto. Il Maestro dice che è colpa della Corona.']},
  pia:{n:'Pia',c:'#e89a3a',hat:'#c84a6a',qs:['qg1'],ln:['Giochiamo a nascondino? Tu conti!','Lo stagno ha i pesci rossi. Uno si chiama Malakar perché è cattivo.']},
  teo:{n:'Teo',c:'#5a9a4a',hat:'#3a5a9a',ln:['Io da grande faccio il barcaiolo come Remo.','Pia bara sempre a nascondino.']},
  gabbiano86:{n:'Gabbiano',c:'#ffffff',hat:'#ffffff',ln:['Cra! Cra!','Il gabbiano ti guarda il panino che non hai.']}});
Object.assign(QT,{
  qa1:{t:'col',e:['slime'],n:5,it:'Bava di slime',ti:'Concime per le rose',tx:'Niente fa crescere le rose come la bava di slime. Portamene 5 dalla Foresta di Elmwood.',g:70,x:50},
  qa2:{t:'talk',to:'mira',lv:3,ti:'Semi dalla bottega',tx:'L\'Erborista Mira mi tiene da parte i semi di giglio lunare. Passa da lei e dille che li aspetto.',g:60,x:60},
  qa3:{t:'kill',e:['pipistrello'],n:8,lv:4,ti:'Pipistrelli nel gazebo',tx:'Vengono dalla Cripta e mi rovinano il gazebo. Caccia 8 pipistrelli e forse capiranno.',g:140,x:110},
  qp1:{t:'talk',to:'nino',ti:'Le reti di Nino',tx:'Il Pescatore Nino mi deve due reti nuove per la barca. Vai da lui sul lungomare e ricordaglielo.',g:50,x:40},
  qp2:{t:'kill',e:['granchio'],n:6,lv:11,ti:'Granchi sulla chiglia',tx:'I Granchi Corazzati dell\'Abisso Sommerso risalgono il fiume e mi mordono la chiglia. Eliminane 6.',g:320,x:260},
  qp3:{t:'col',e:['uomo_pesce'],n:3,lv:12,it:'Perla di fiume',ti:'Perle del Fiume Argento',tx:'Gli Uomini-Pesce rubano le perle del fiume. Riportamene 3 e te le pago bene.',g:420,x:320},
  ql1:{t:'col',e:['lupo'],n:4,it:'Pelliccia morbida',ti:'Coperte per l\'inverno',tx:'Per le coperte dell\'ospizio mi servono 4 pellicce di lupo, di quelle morbide.',g:80,x:55},
  ql2:{t:'talk',to:'borin',lv:3,ti:'Il paiolo bucato',tx:'Il mio paiolo perde. Il Fabbro Borin sa ripararlo: chiedigli quando può passare.',g:60,x:60},
  qt1:{t:'col',e:['goblin'],n:5,lv:2,it:'Pigmento verde',ti:'Verde goblin',tx:'Il verde più bello viene dalle pitture di guerra dei goblin. Me ne servono 5 vasetti.',g:110,x:80},
  qt2:{t:'col',e:['scorpione'],n:4,lv:6,it:'Rosso di Khem',ti:'Rosso di Khem',tx:'Gli scorpioni del deserto hanno un rosso che non sbiadisce. Portamene 4 code.',g:220,x:180},
  qt3:{t:'talk',to:'araldo',lv:4,ti:'Il ritratto dell\'Araldo',tx:'L\'Araldo della Piazza mi ha chiesto un ritratto e poi è sparito. Digli che è pronto, e che costa.',g:90,x:80},
  qb1:{t:'kill',e:['goblin','arciere'],n:12,lv:2,ti:'Il ponte è sicuro',tx:'I goblin si spingono fino alle mura. Finché non ne cadono 12, io da qui non mi muovo.',g:130,x:100},
  qb2:{t:'kill',e:['scheletro','zombie'],n:10,lv:5,ti:'Ombre sul fiume',tx:'Di notte qualcosa esce dalla Cripta e scende al fiume. Rimanda sottoterra 10 fra scheletri e zombie.',g:210,x:170},
  qo1:{t:'col',e:['ragno','lupo_cristallo'],n:4,lv:8,it:'Lente di cristallo',ti:'Lenti per il cannocchiale',tx:'Il cannocchiale grande ha una lente incrinata. Nelle Caverne di Cristallo le creature ne portano addosso di perfette: me ne servono 4.',g:300,x:240},
  qo2:{t:'talk',to:'saggio',lv:6,ti:'La mappa del cielo',tx:'Il Saggio Elandor, in Biblioteca, ha la vecchia mappa del cielo. Chiedigli se le stelle erano già così, prima della Corona.',g:120,x:140},
  qg1:{t:'talk',to:'tommaso',ti:'Nascondino',tx:'Tommaso si è nascosto e non lo trovo più! Tu sei grande, trovalo tu. Di solito sta vicino alla piazza.',g:20,x:30}});
function alPeople(){const put=(id,x,y,o)=>{if(ents.some(e=>e.k==='npc'&&e.nid===id))return null;let q=[x,y];if(!WK(M[y][x]))q=nearFree(x,y);const e=mkNpc(id,q[0],q[1],o||{});ents.push(e);return e};
  put('olmo',48,43);put('remo',44,62);put('ines',53,29);put('leandro',30,38);put('bruna',53,36);put('celeste',60,12);put('pia',44,47,{wd:1,wg:1});put('teo',49,47,{wd:1,wg:1});
  for(const[i,x,y]of[[0,22,63],[1,45,65],[2,50,62]]){const e=mkNpc('gabbiano86',x,y,{wd:1});e.nid='gabbiano86';e.gb=i;try{e.m=ANM.gabbiano()}catch(_){}ents.push(e)}}
{const g0=genTown;genTown=function(){const sp=g0();try{if(AL86.on)alPeople()}catch(e){console.warn('Aldoria ridisegnata',e)}return sp}}
/* ---- quello che dice la gente cambia con la storia ---- */
const ALN={
  guardia_porta:[['A nord la Foresta di Elmwood, a est il deserto. Il Re aspetta gente come te, al castello.'],['Cerchi i frammenti? I goblin della Tana ne parlano da settimane.'],['Sei frammenti in una mano sola. Non l\'avevo mai visto.'],['Il portale è nella sala del trono. Torna intero.'],['Malakar è caduto! Apro le porte io stesso, oggi.'],['Campione! Passa pure: la città è tua.']],
  marcus:[['Recluta? Vai dal Re, poi torna: ho lavoro per chi sa tenere una spada.'],['Ogni dungeon ripulito è una strada più sicura. Continua.'],['Con i frammenti al sicuro, restano solo i mostri. Per quelli ci sono io. E tu.'],['Se non torni dalla Cittadella, sappi che è stato un onore.'],['Le pattuglie non trovano più niente da combattere. Quasi mi annoio.'],['Capitano Marcus agli ordini, Campione. Non l\'avrei mai detto, il primo giorno.']],
  tommaso:[['Da grande farò l\'eroe come te!'],['Hai già trovato un frammento? Me lo fai vedere?'],['SEI frammenti! Lo dico a tutti!'],['Vai dal cattivo? Portami qualcosa!'],['Hai battuto Malakar! Lo sapevo, lo sapevo!'],['Io gioco a fare te. Pia fa Malakar e perde sempre.']],
  araldo:[['Udite! Il Re cerca un eroe. Sei tu? Allora al castello, presto.'],['Il tabellone accanto a me mostra chi ha ripulito più dungeon.'],['Udite! I sei frammenti sono stati ritrovati!'],['Udite! Il nostro eroe parte per la Cittadella del Vuoto!'],['Udite, udite! Malakar è stato sconfitto!'],['Udite! Passa il Campione di Aldoria!']],
  ugo:[['Merce fresca da tutto il regno! Per i nuovi arrivati, un sorriso gratis.'],['Vai nei dungeon? Pozioni. Tante pozioni. Fidati.'],['Da quando giri tu, le carovane arrivano tutte intere.'],['Per la Cittadella prendi tutto quello che puoi portare. Ti faccio credito? No.'],['Gli affari non sono mai andati così bene. Grazie, eh.'],['Per il Campione il prezzo è quello di sempre. Ma con un inchino.']],
  nino:[['Il mare oggi è calmo. Troppo calmo.'],['I pesci scappano verso riva: qualcosa li spaventa, al largo.'],['Stanotte le reti erano piene. Buon segno.'],['Se il cielo diventa viola sopra la Cittadella, io non esco in barca.'],['Il mare è tornato quello di quando ero ragazzo.'],['Campione, il primo pesce di oggi è tuo.']],
  rosa:[['Mio figlio Tommaso non sta mai fermo. Se lo vedi, digli di tornare per cena.'],['Tommaso parla solo di te e dei tuoi frammenti.'],['Hai l\'aria stanca. Mangi abbastanza?'],['Torna, mi raccomando. Tommaso non me lo perdonerebbe.'],['Stasera in tutta Aldoria si cena con le finestre aperte. Grazie a te.'],['Tommaso ha chiamato il gatto come te. Spero non ti offenda.']],
  gerald:[['Ai miei tempi gli eroi si alzavano all\'alba.'],['Frammenti, corone... ai miei tempi bastava una buona spada.'],['Sei? Tutti e sei? Ai miei tempi ne avremmo trovati sette.'],['La Cittadella. Ci andai vicino, una volta. Una volta sola.'],['Ben fatto, ragazzo. Ai miei tempi... no, niente. Ben fatto.'],['Ai tuoi tempi, diranno un giorno. E parleranno di oggi.']],
  olmo:[null,null,null,['Se la Cittadella cade, qui torneranno le lucciole. Erano anni che non si vedevano.'],['Guarda: le lucciole. Te l\'avevo detto.'],['Ho piantato una rosa nuova. L\'ho chiamata Campione: ha molte spine.']],
  bruna:[null,null,null,['Stanotte la nebbia è viola. Sbrigati, alla Cittadella.'],['La nebbia è tornata bianca. Posso finalmente sedermi.'],['Per il Campione il ponte è sempre aperto.']],
  celeste:[null,null,['Con i frammenti riuniti le stelle hanno smesso di tremare. Per ora.'],['Stanotte punto il cannocchiale sulla Cittadella. Se vedo che vinci, suono la campana.'],['Le stelle sono tornate al loro posto. Tutte tranne una, nuova, sopra il castello.'],['Ho chiamato la stella nuova con il tuo nome. Il Maestro ha detto di sì.']]};
const ALV=[['Bella giornata ad Aldoria, vero?','Hai visto i Giardini della Regina? Lo stagno è pieno di pesci rossi.','Sul Ponte Grande c\'è sempre vento. Tieniti il cappello.','Il Mercante Ugo fa buoni prezzi, se gli sorridi.'],
  ['Dicono che cerchi i frammenti della Corona. Buona fortuna, ne avrai bisogno.','Mio cugino ha visto un goblin grande come un armadio, nella Tana.','Il Barcaiolo Remo giura che il fiume si è alzato di un palmo, da quando la Corona è rotta.'],
  ['Sei frammenti! In taverna non si parla d\'altro.','Il Re non sorrideva così da anni.'],['Si dice che il portale sia nella sala del trono. Io non ci passerei nemmeno pagato.','Stanotte, sopra la Cittadella, il cielo era viola.'],
  ['Malakar è caduto! Offro io, stasera!','Hai visto? Sono tornate le rondini.','Da oggi i bambini giocano fuori fino a tardi.'],['Guarda, passa il Campione!','Mia figlia vuole un tuo ritratto. Il Pittore Leandro ne vende tre al giorno.','Aldoria non è mai stata così bella.']];
function alLines(){if(!P)return;const s=clamp(P.st|0,0,5);for(const id in ALN){const d=NPCS[id];if(!d)continue;if(!d.ln0)d.ln0=(d.ln||[]).slice();let L=null;for(let i=s;i>=0&&!L;i--)L=ALN[id][i];d.ln=L?L.concat(s<2?d.ln0.slice(0,1):[]):d.ln0.slice()}
  if(!ALV.o)ALV.o=VLINES.slice();VLINES.length=0;for(const l of ALV[s].concat(ALV.o.slice(3,3+Math.max(1,4-s))))VLINES.push(l)}
