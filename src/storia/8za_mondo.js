/* ================= 7.12: IL MONDO PIÙ GRANDE =================
   Decorazioni nuove (codice di due caratteri: '₪' più una lettera, così non si scontrano con quelle che già esistono),
   il cartello del pozzo delle alghe, e tutto quello che serve alle zone rifatte (foresta, deserto, picchi e Colosseo). */
const DN='₪';
// arredo nuovo: DEC[y][x]=DN+lettera
function decN(x,y,k,h){switch(k){
  // colonna di pietra con la base e il capitello
  case 'C':box(x+.26,y+.26,0,.48,.48,3,'#d8d0c0');box(x+.32,y+.32,3,.36,.36,36,'#e8e0d0',.95+h*.08);box(x+.36,y+.68,4,.03,.02,34,'#c8c0b0');box(x+.68,y+.36,4,.02,.03,34,'#c8c0b0');box(x+.24,y+.24,39,.52,.52,3,'#d8d0c0');break;
  // statua di un campione su un piedistallo, con la targa d'oro
  case 'S':{box(x+.15,y+.15,0,.7,.7,10,'#c8c0b0');box(x+.12,y+.12,10,.76,.76,1.5,'#b8b0a0');box(x+.3,y+.84,3,.4,.02,4,'#d4af37');const m='#ece8e0';
    box(x+.33,y+.4,11.5,.12,.16,9,m);box(x+.55,y+.4,11.5,.12,.16,9,m);box(x+.3,y+.36,20.5,.4,.26,11,m);box(x+.36,y+.38,31.5,.26,.22,7,m);box(x+.34,y+.36,37,.3,.26,2.5,'#e0dcd0');
    box(x+.18,y+.42,22,.12,.12,9,m);box(x+.72,y+.42,26,.1,.1,10,m);box(x+.74,y+.44,36,.05,.05,12,'#d8d8e0');box(x+.12,y+.36,19,.08,.3,10,'#e0dcd0');break}
  // manichino con l'armatura e l'elmo
  case 'A':box(x+.45,y+.45,0,.1,.1,30,'#5a3a1a');box(x+.3,y+.35,14,.4,.3,13,'#8a8f99');box(x+.26,y+.33,24,.48,.34,3,'#9aa0aa');box(x+.36,y+.38,27,.28,.24,7,'#8a8f99');box(x+.36,y+.58,29,.28,.04,1.5,'#3a3a3a');box(x+.5,y+.38,34,.04,.24,4,'#a8303a');break;
  // fantoccio da allenamento: palo, corpo di paglia, testa di sacco e il bersaglio
  case 'D':box(x+.46,y+.46,0,.08,.08,16,'#6b4a2b');box(x+.32,y+.38,14,.36,.24,12,'#d8b860');box(x+.2,y+.44,22,.6,.08,2,'#6b4a2b');box(x+.38,y+.4,26,.24,.2,7,'#c8a870');
    box(x+.42,y+.62,18,.16,.02,3,'#c0392b');box(x+.46,y+.63,19,.08,.02,1,'#f4f0e0');box(x+.28,y+.36,13,.44,.28,1.4,'#8a6a3a');break;
  // la vetrinetta dei trofei: piedistallo, coppa d'oro e alloro
  case 'T':box(x+.2,y+.2,0,.6,.6,14,'#5a3a1a');box(x+.16,y+.16,14,.68,.68,1.5,'#7a5a3a');box(x+.38,y+.38,15.5,.24,.24,2,'#d4af37');box(x+.44,y+.44,17.5,.12,.12,4,'#d4af37');box(x+.32,y+.32,21.5,.36,.36,5,'#e8c54a',1.15);
    box(x+.3,y+.66,16,.4,.02,2,'#4a8a3a');break;
  // cartello dell'Abisso Sommerso: un'onda e una freccia che scende
  case 'c':box(x+.45,y+.45,0,.1,.1,27,'#5a3a1a');box(x+.12,y+.4,14,.76,.06,10,'#8a6a42');box(x+.1,y+.38,24,.8,.1,1.4,'#6a4a2a');
    for(let i=0;i<5;i++)box(x+.2+i*.08,y+.465,19+(i%2)*1.4,.08,.02,1.4,'#2a9a9a');box(x+.66,y+.465,16,.04,.02,6,'#e8e0d0');box(x+.62,y+.465,16,.12,.02,1.4,'#e8e0d0');box(x+.64,y+.465,15,.08,.02,1.2,'#e8e0d0');break;
  default:return false}return true}
const _dec712=dec;dec=function(x,y,c,h){if(c&&c[0]===DN&&decN(x,y,c[1],h))return;_dec712(x,y,c,h)};

/* ================= il Colosseo, fuori: un vero anfiteatro =================
   Un'ellisse con tre ordini di arcate, le lesene, le cornici, l'attico con le finestrelle e le antenne del velario con le
   bandiere; dall'alto si vedono le gradinate piene di spettatori e la sabbia dell'arena, con due gladiatori che si sfidano.
   Intorno, al posto degli angoli del vecchio edificio squadrato, la piazza con le statue e i bracieri. */
const SPC=['#c0392b','#2980b9','#27ae60','#8e44ad','#f39c12','#e8e0d0','#5a3a2a','#d35400'],SKN=['#ffdbac','#f1c27d','#e0ac69','#c68642','#a0662f'];
const COLR=b=>({cx:b.x+b.w/2,cy:b.y+b.h/2,rx:b.w/2,ry:b.h/2});
function colD(b,x,y){const g=COLR(b);return Math.hypot((x+.5-g.cx)/g.rx,(y+.5-g.cy)/g.ry)}
function colPlaza(){const b=TB.find(q=>q.to==='arena'&&q.st==='col');if(!b)return;
  for(let y=b.y;y<b.y+b.h;y++)for(let x=b.x;x<b.x+b.w;x++)if(colD(b,x,y)>1){M[y][x]=4;DEC[y][x]='';BM[y][x]=-1}
  const S=(x,y,c)=>{if(M[y]&&M[y][x]===4){M[y][x]=6;DEC[y][x]=c;RDF.add(y*N+x)}},S2=(x,y,c)=>{if(M[y]&&M[y][x]===0){M[y][x]=6;DEC[y][x]=c}};
  S(b.x,b.y+b.h-1,'₪S');S(b.x+b.w-1,b.y+b.h-1,'₪S');S(b.x,b.y,'0');S(b.x+b.w-1,b.y,'0');S2(b.dx-2,b.y+b.h,'0');S2(b.dx+2,b.y+b.h,'0')}
const _genTown712=genTown;genTown=function(){const sp=_genTown712();colPlaza();return sp};
// arcate su una faccia: q='y' (la faccia verso +y) o 'x' (verso +x); door = il grande portale d'ingresso
function colArc(x,y,q,H,door){const F=(u,z,w,h2,c,o)=>{if(q==='y')box(x+u,y+.97-(o||0),z,w,.05+(o||0),h2,c);else box(x+.97-(o||0),y+u,z,.05+(o||0),w,h2,c)};
  for(let k=0;k<3;k++){const z=3+k*15;if(door&&k<2){if(k===0){F(.16,0,.68,27,'#24180f');F(.22,27,.56,1.6,'#24180f')}continue}
    F(.24,z,.52,10,'#4a3a2a');F(.3,z+10,.4,1.6,'#4a3a2a');F(.38,z+11.6,.24,1,'#4a3a2a');F(.21,z,.04,10,'#ece0c4',.02);F(.75,z,.04,10,'#ece0c4',.02)}
  for(const z of[15,30,45])F(-.01,z,1.02,1.6,'#e8dcbc',.03);F(-.02,0,.08,H,'#e4d6b4',.02);F(.94,0,.08,H,'#e4d6b4',.02);
  for(const u of[.18,.62])F(u,48,.2,4,'#5a4a3a');
  if(door){F(.16,30,.68,4.4,'#d4af37');F(.24,30.8,.52,2.6,'#8a1a1a');F(.47,31.4,.06,1.4,'#d4af37')}}
function colTile(x,y,h,b){const d=colD(b,x,y),f=.9+h*.08;
  if(d>.8){const H=58;box(x,y,0,1,1,H,'#dccca4',f);const door=x===b.dx&&y===b.y+b.h-1;
    if(colD(b,x,y+1)>1)colArc(x,y,'y',H,door);if(colD(b,x+1,y)>1)colArc(x,y,'x',H,false);
    box(x-.02,y-.02,H,1.04,1.04,1.6,'#e8dcbc');
    if((x*7+y*5)%4===0){box(x+.45,y+.45,H+1.6,.07,.07,16,'#6b4a2b');box(x+.52,y+.47,H+10,.3,.03,5.5,(x+y)%2?'#c0392b':'#d4af37')}
    return}
  if(d>.47){const k=Math.min(3,Math.floor((d-.47)/.33*4)),H=10+k*11;box(x,y,0,1,1,H,k%2?'#d2c29c':'#c8b892',f);
    box(x,y+.97,H-1.2,1,.04,1.2,'#b8a888');box(x+.97,y,H-1.2,.04,1,1.2,'#b8a888');
    if(h>.12){box(x+.18,y+.2,H,.27,.27,6,SPC[(x*7+y*3)%SPC.length]);box(x+.21,y+.23,H+6,.21,.21,4,SKN[(x+y)%SKN.length])}
    if(h<.86){box(x+.56,y+.52,H,.27,.27,6,SPC[(x*3+y*11+1)%SPC.length]);box(x+.59,y+.55,H+6,.21,.21,4,SKN[(x*3+y)%SKN.length])}
    return}
  box(x,y,0,1,1,1.6,(x+y)&1?'#e6cf96':'#dcc58c');
  const g=COLR(b);if(x===Math.floor(g.cx-1)&&y===Math.floor(g.cy)){drawL(hum('#8a3a2a',SKIN,.7,[3,'#b8963a']),x+.6,y+.4,1.6);drawL(hum('#2a5a9a',SKIN,.7,[3,'#c0c8d8']),x+1.5,y+.6,1.6);box(x+.85,y+.42,9,.05,.05,7,'#d8d8e0');box(x+1.25,y+.58,9,.05,.05,7,'#d8d8e0')}}
const _bld712=bld;bld=function(x,y,h){const b=TB[BM[y][x]];if(b&&b.to==='arena'&&b.st==='col'&&Zk==='town'){colTile(x,y,h,b);return}_bld712(x,y,h)};

/* ================= il Colosseo, dentro ================= */
function arFloorC(x,y){if(y<=8)return y>=4&&y<=5&&x>=2&&x<=37?['#8a2a2a','#7e2626']:['#b8b0a0','#b0a898'];const d=arD(x+.5,y+.5);
  if(d>=1)return['#8a8478','#827c70'];return d>.86?['#d6be84','#cfb77e']:d<.1?['#cdb27a','#c8ad76']:['#e6cf96','#dcc58c']}
function arWall(x,y,h){const n=N,f=.9+h*.08;
  if(x===n-1||y===n-1){box(x,y,0,1,1,8,'#b8a888',f);return}   // i muri davanti restano bassi, per vedere dentro
  // la galleria: muro di pietra con gli stendardi rossi e le torce
  if(!y||(!x&&y<=8)){const q=!y?'y':'x',u=!y?x:y;box(x,y,0,1,1,46,'#a8a090',f);box(x-.02,y-.02,46,1.04,1.04,3,'#9a9282');
    const F=(a,z,w,h2,c)=>{if(q==='y')box(x+a,y+.97,z,w,.05,h2,c);else box(x+.97,y+a,z,.05,w,h2,c)};
    if(u%4===0){F(.28,12,.44,28,'#8a1a1a');F(.26,38,.48,2,'#d4af37');F(.4,22,.2,.2*24,'#d4af37');F(.32,10,.08,3,'#8a1a1a');F(.6,10,.08,3,'#8a1a1a')}
    else if(u%4===2){F(.44,24,.12,7,'#3a2a1a');F(.4,31,.2,3,'#ffb04a');nlight(q==='y'?x+.5:x+1.1,q==='y'?y+1.1:y+.5,32,90,'255,170,80',.6)}return}
  // il muro esterno a ovest, dietro le gradinate: arcate su due ordini
  if(!x){box(x,y,0,1,1,56,'#cdbd96',f);for(const z of[10,30]){box(x+.97,y+.24,z,.05,.52,13,'#3a2e22');box(x+.98,y+.3,z+13,.04,.4,1.5,'#3a2e22')}for(const z of[25,45])box(x+.95,y-.01,z,.08,1.02,1.8,'#e0d4b4');
    if(y%3===0){box(x+.45,y+.45,56,.07,.07,14,'#6b4a2b');box(x+.52,y+.47,63,.3,.03,5,y%2?'#c0392b':'#d4af37')}return}
  // la balaustra tra la galleria e le gradinate
  if(y===9){box(x,y,0,1,1,14,'#c8b890',f);box(x-.02,y-.02,14,1.04,1.04,2,'#a89a74');if(x%3===0)box(x+.3,y+.97,2,.4,.05,11,(x/3|0)%2?'#2a5a9a':'#a8303a');return}
  if(x>=33&&x<=36&&y>=21&&y<=26){arTribuna(x,y,h);return}
  if(x>=2&&x<=5&&y>=22&&y<=25){arPorta(x,y,h);return}
  if((x===17||x===22)&&y>=10&&y<=15){box(x,y,0,1,1,30,'#9a9080',f);box(x-.02,y-.02,30,1.04,1.04,3,'#8a8070');return}   // le pareti del tunnel
  const d=arD(x+.5,y+.5),k=Math.max(0,Math.floor((d-1)*ARC.ry+.15));let H=10+Math.min(6,k)*7;
  if(y<ARC.cy-2)H=Math.min(H,31);if(x+y>ARC.cx+ARC.cy+8)H=Math.min(H,24);
  if(k===0){box(x,y,0,1,1,H,'#bfae88',f);box(x-.01,y-.01,H,1.02,1.02,1.6,'#a8303a');
    if(arD(x+.5,y+1.5)<1&&x%3===0)box(x+.25,y+.97,1,.5,.05,7,(x/3|0)%2?'#2a5a9a':'#a8303a');if(arD(x+1.5,y+.5)<1&&y%3===0)box(x+.97,y+.25,1,.05,.5,7,(y/3|0)%2?'#2a5a9a':'#a8303a');return}
  box(x,y,0,1,1,H,k%2?'#d2c29c':'#c8b892',f);box(x,y+.97,H-1.2,1,.04,1.2,'#b8a888');box(x+.97,y,H-1.2,.04,1,1.2,'#b8a888');
  // gli spettatori: due per gradino, e qualcuno in festa che salta
  const j=h>.8?Math.abs(Math.sin(t*5+x*1.7+y*2.3))*3:0;
  if(h>.1){box(x+.18,y+.2,H,.27,.27,6+j,SPC[(x*7+y*3)%SPC.length]);box(x+.21,y+.23,H+6+j,.21,.21,4,SKN[(x+y)%SKN.length])}
  if(h<.9){box(x+.56,y+.52,H,.27,.27,6,SPC[(x*3+y*11+1)%SPC.length]);box(x+.59,y+.55,H+6,.21,.21,4,SKN[(x*3+y)%SKN.length])}}
// la tribuna d'onore: pedana con il tappeto rosso, ringhiera d'oro, colonne e baldacchino a strisce, e il trono
function arTribuna(x,y,h){const H=20;box(x,y,0,1,1,H,'#e0d4b4',.92+h*.06);box(x,y,H,1,1,.6,'#8a1a2a');if(x===33)box(x+.02,y,H+.6,.08,1,4,'#d4af37');
  if((x===33||x===36)&&(y===21||y===26))box(x+.42,y+.42,H,.16,.16,30,'#d4af37');
  if(x===35&&y===23){box(x+.15,y+.2,H+.6,.7,.6,6,'#a8303a');box(x+.15,y+.15,H+6.6,.7,.12,12,'#d4af37');box(x+.2,y+.3,H+6.6,.6,.45,1.2,'#c0392b')}
  box(x-.02,y-.02,H+30,1.04,1.04,3,(x+y)&1?'#a8303a':'#d4af37');if(y===26)box(x,y+.97,H+24,1,.04,6,(x&1)?'#a8303a':'#d4af37')}
// la porta dei gladiatori, a ovest: l'arco buio con la saracinesca alzata a metà
function arPorta(x,y,h){box(x,y,0,1,1,36,'#a89c86',.9+h*.08);box(x-.02,y-.02,36,1.04,1.04,3,'#988c76');
  if(x===5){box(x+.97,y+(y===22?.3:0),0,.05,y===22||y===25?.7:1,26,'#1e1610');for(let i=0;i<4;i++)box(x+.99,y+.12+i*.25,12,.03,.05,14,'#4a4a52');box(x+.99,y,12,.03,1,1.4,'#4a4a52');box(x+.99,y,20,.03,1,1.4,'#4a4a52')}}
/* ---- i gladiatori che si allenano nella galleria ---- */
Object.assign(NPCS,{gladiatore:{n:'Gladiatore Brenno',c:'#8a3a2a',hat:'#b8963a',ln:['Nella fossa conta il fiato, non la forza. Chi resta senza fiato, resta senza vittorie.','Quando l\'altro carica l\'affondo si vede dalle spalle: è il momento di schivare.','La folla ama chi rischia. Il tabellone ama chi vince.']},
  gladiatrice:{n:'Gladiatrice Selene',c:'#3a5a8a',hat:'#c0392b',ln:['Il Maestro Kael dice che sono la più veloce del Colosseo. Ha ragione.','I fantocci non rispondono mai. Per questo mi alleno con Brenno.','Dalla tribuna d\'onore il Re guarda le finali del torneo. Un giorno guarderà me.']}});
Object.assign(NPS,{gladiatore:'c|short:#2a1a0a|stubble:#2a1a0a|helmet:#b8963a:#a8303a|armor:#8a5a2a,scar|sword|kungfu|big',gladiatrice:'b|tail:#6a2a1a|none|headband:#c0392b|armor:#5a5a64,sash:#c0392b|spear|guard|n,f'});
