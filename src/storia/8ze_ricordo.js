/* ================= 7.12: IL RICORDO DEL MOREAU — Aldoria Vecchia prima della nebbia =================
   Un filmato flashback: la prima volta che si entra in Aldoria Vecchia, il Moreau ricorda il suo quartiere com'era prima della
   notte della nebbia. Le strade, le case, la piazza del pozzo, il campanile, il mercato del mattino; poi la sera, gli incappucciati
   alla casa del fabbricante di candele; poi la nebbia che sale dal pozzo, il fuoco, e le rovine di oggi.
   Il quartiere intatto è un luogo vero costruito con la stessa pianta delle rovine del filmato: le strade sono le stesse e le case
   stanno dove oggi ci sono i loro muri crollati (stesso seme e stessa sequenza di numeri casuali del generatore delle rovine). */
const VV_SEED='film|vecchia';
function genVecchiaViva({R4,H,N2,n}){R=sd(hs(VV_SEED));for(let y=1;y<n-1;y++)for(let x=1;x<n-1;x++){M[y][x]=0;DEC[y][x]=''}
  // le strade (gli stessi numeri casuali delle macerie, che qui non ci sono)
  const rd=(x0,y0,w,h)=>{R4(x0,y0,w,h,4);for(let y=y0;y<y0+h;y++)for(let x=x0;x<x0+w;x++)R()};
  rd(2,47,n-4,2);rd(47,2,2,n-4);rd(2,20,n-4,2);rd(2,72,n-4,2);rd(20,2,2,n-4);rd(72,2,2,n-4);
  // le case: le stesse posizioni delle rovine (si consumano i numeri casuali esattamente come lì)
  const HS=[],house=(x0,y0,w,h,kind)=>{HS.push([x0,y0,w,h,kind]);for(let y=y0;y<y0+h;y++)for(let x=x0;x<x0+w;x++){if(M[y][x]===4)continue;const edge=x===x0||x===x0+w-1||y===y0||y===y0+h-1;
      if(edge){if(!(x===x0+(w>>1)&&y===y0+h-1))R()}else{const r=R();if(!(kind===1&&r<.16)&&r<(kind===0?.3:.12))R()}}};
  const blocks=[2,22,49,74],bs=[18,25,23,20];let hi=0;
  for(let by=0;by<4;by++)for(let bx=0;bx<4;bx++){const x0=blocks[bx]+1,y0=blocks[by]+1,w0=bs[bx]-2,h0=bs[by]-2;if(x0+w0>n-2||y0+h0>n-2)continue;
    for(let k=0;k<3;k++){const w=ri(5,8),h=ri(4,7),x=x0+ri(0,Math.max(0,w0-w)),y=y0+ri(0,Math.max(0,h0-h));house(x,y,w,h,(hi++)%3)}}
  const[wx,wy]=WELL,SQ=[wx-4,wy-3,wx+4,wy+4],CMP=[68,15,2,2],busy=[];
  const hit=(x,y,w,h,r)=>x<r[2]+1&&x+w>r[0]&&y<r[3]+1&&y+h>r[1];
  // la piazza del pozzo, lastricata, con le aiuole, le panchine, gli alberi e il pozzo con la tettoia
  for(let y=SQ[1];y<=SQ[3];y++)for(let x=SQ[0];x<=SQ[2];x++)if(M[y][x]!==4){M[y][x]=4;DEC[y][x]=''}
  // il campanile, all'angolo della strada grande
  const WALLS=['#e8dcc0','#d8c8a8','#e0c8a8','#d0d8c8','#e8d0b8','#c8bca0'],ROOFS=['#a8402f','#8a4a2a','#6a5a8a','#4a6a8a','#9a6a3a','#7a3a2a'];
  H({x:CMP[0],y:CMP[1],w:CMP[2],h:CMP[3],st:'vcamp',wall:'#c8b896',roof:'#5a4a6a',ht:112});busy.push([CMP[0],CMP[1],CMP[0]+CMP[2]-1,CMP[1]+CMP[3]-1]);
  let ci=0;for(const[x,y,w,h,kind]of HS){if(hit(x,y,w,h,SQ)||busy.some(r=>hit(x,y,w,h,r)))continue;let road=false;for(let j=y;j<y+h&&!road;j++)for(let i=x;i<x+w;i++)if(M[j][i]===4){road=true;break}if(road)continue;
    const q=hh(x*3.7,y*1.3),b={x,y,w,h,st:'vv',wall:WALLS[(x+y*3)%WALLS.length],roof:ROOFS[(x*5+y)%ROOFS.length],ht:28+((x+y)%3)*5,dx:x+(w>>1),smoke:q>.55?1:0};
    if(!ci&&x>=74&&y<=19&&Math.abs(x-wx)<12){b.cand=1;b.wall='#b8a8b8';b.roof='#3a2a4a';ci=1}H(b);busy.push([x,y,x+w-1,y+h-1])}
  // la casa del Moreau, sul lato est della piazza
  const free=(x,y,w,h,m)=>{for(let j=y-m;j<y+h+m;j++)for(let i=x-m;i<x+w+m;i++){if(i<1||j<1||i>n-2||j>n-2)return false;const c=M[j][i];if((j>=y&&j<y+h&&i>=x&&i<x+w)?(c!==0||DEC[j][i]):c===3)return false}return true};
  if(free(86,11,5,4,0))H({x:86,y:11,w:5,h:4,st:'vv',wall:'#e8d8b0',roof:'#8a4a2a',ht:30,dx:88,smoke:1,mor:1});
  // gli isolati si riempiono di case (con i vicoli in mezzo): il quartiere era fitto come la città
  for(let by=0;by<4;by++)for(let bx=0;bx<4;bx++){const x0=blocks[bx]+1,y0=blocks[by]+1,x1=x0+bs[bx]-3,y1=y0+bs[by]-3;
    for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const w=4+((x*7+y*3)%4),h=4+((x*3+y*5)%3);if(x+w-1>x1||y+h-1>y1||!free(x,y,w,h,1))continue;
      H({x,y,w,h,st:'vv',wall:WALLS[(x*3+y)%WALLS.length],roof:ROOFS[(x+y*7)%ROOFS.length],ht:26+((x*5+y)%4)*4,dx:x+(w>>1),smoke:hh(x,y*3)>.7?1:0})}}
  // davanti alle case: aiuole e botti; lungo la strada grande, le bancarelle del mercato
  const G=(x,y,c)=>{if(M[y]&&M[y][x]===0&&!DEC[y][x]){M[y][x]=6;DEC[y][x]=DN+c}},GR=(x,y,c)=>{if(M[y]&&M[y][x]===4){M[y][x]=6;DEC[y][x]=DN+c;RDF.add(y*n+x)}};
  GR(wx,wy,'P');for(const[x,y]of[[wx-3,wy-2],[wx+3,wy-2],[wx-3,wy+3],[wx+3,wy+3]])GR(x,y,'a');for(const[x,y]of[[wx-2,wy+3],[wx+2,wy-2]])GR(x,y,'b');for(const[x,y]of[[wx-3,wy],[wx+3,wy+1]])GR(x,y,'f');
  for(let x=58;x<=93;x+=3){if(Math.abs(x-wx)<=4||(x>=66&&x<=71))continue;G(x,19,'m');G(x+1,22,'m')}
  for(const b of TB)if(b.st==='vv'){const y=b.y+b.h;for(const x of[b.x,b.x+b.w-1])if(x!==b.dx&&hh(x,y)>.45)G(x,y,hh(x*2,y)>.5?'f':'k')}
  for(let i=0;i<70;i++){const x=ri(3,n-4),y=ri(3,n-4);if(M[y][x]===0&&!DEC[y][x]&&!TB.some(b=>x>=b.x-1&&x<=b.x+b.w&&y>=b.y-1&&y<=b.y+b.h))G(x,y,'a')}
  // le bandierine della festa sopra la strada del mercato
  for(let x=60;x<=94;x+=5)G(x,19,'g');
  // la gente del quartiere (ferma: chi passa per la strada lo fanno gli attori del filmato)
  for(const[id,x,y]of[['mv_frutta',78,18],['mv_pane',84,18],['mv_fiori',87,23],['mv_pesce',91,18],['ronda',73,24],['contadino',70,22]])if(M[y]&&WK(M[y][x]))N2(id,x,y);
  return[wx,wy+2]}
Z.vecchia_viva=Object.assign({},Z.vecchia,{n:'Aldoria Vecchia · prima della nebbia',a:'#6a9450',b:'#628c4a',bg:'#a8c8e8',mus:'town',pt:'petal',gen:genVecchiaViva,dist:1,ruin:0,nolamp:0,rd:['#b0a48c','#a69a84'],wl:'#8b8f99',wh:28,viva:1,film:1});
SKY.vecchia_viva=SKY.town;
/* ---- il pozzo intatto, le bancarelle, le panchine, le aiuole, gli alberi, le bandierine ---- */
function decV(x,y,k,h){switch(k){
  case 'P':{box(x+.1,y+.1,0,.8,.8,7,'#9a9488');box(x+.16,y+.16,7,.68,.68,.6,'#2a5a8a',1.1);box(x+.08,y+.08,6,.84,.84,1.2,'#aaa496');
    box(x+.1,y+.46,7,.06,.08,20,'#6b4a2b');box(x+.84,y+.46,7,.06,.08,20,'#6b4a2b');box(x+.1,y+.47,22,.8,.06,1.2,'#5a3a1a');box(x+.46,y+.44,15,.08,.12,1.2,'#8a8a8a');box(x+.44,y+.43,10,.12,.14,4,'#7a5a3a');
    box(x-.02,y+.18,26,1.04,.32,2.6,'#a8402f');box(x-.02,y+.5,26,1.04,.32,2.6,'#983a2a');box(x-.04,y+.46,28.4,1.08,.1,1.2,'#7a2a1a');
    if(VVFOG>0){const u=VVFOG;nlight(x+.5,y+.5,8,150,'140,255,170',.6*u);if(SET.ultra)GLOW.push([x+.5,y+.5,8,60,'140,255,170',.3*u])}break}
  case 'm':{const C=[['#c0392b','#f0e8d8'],['#2a6ad8','#f0e8d8'],['#3a9a3a','#f4f0e0'],['#d8a020','#7a3a1a']][(x+y)%4],G2=[['#e8483a','#f0c040','#7ab84e'],['#c8a060','#e8d8b0','#a87a4a'],['#c8d8e8','#9ab0c0','#e8e8f0'],['#ff8ab8','#ffe24a','#ffffff']][(x*3+y)%4];
    box(x+.08,y+.3,0,.06,.06,11,'#6b4a2b');box(x+.86,y+.3,0,.06,.06,11,'#6b4a2b');box(x+.06,y+.25,6,.88,.5,1.4,'#8a6a42');for(let i=0;i<4;i++)box(x+.12+i*.2,y+.32,7.4,.14,.34,1.4,G2[i%3]);
    box(x+.08,y+.64,0,.06,.06,15,'#6b4a2b');box(x+.86,y+.64,0,.06,.06,15,'#6b4a2b');for(let i=0;i<5;i++)box(x+.02+i*.192,y+.12,14+(i%2)*.01,.192,.62,1.2,C[i%2]);box(x+.02,y+.72,13,.96,.04,1.4,C[0]);break}
  case 'b':box(x+.12,y+.38,0,.06,.24,3,'#4a3a2a');box(x+.82,y+.38,0,.06,.24,3,'#4a3a2a');box(x+.08,y+.36,3,.84,.3,.8,'#8a6a42');box(x+.08,y+.36,3.8,.84,.06,4,'#7a5a3a');break;
  case 'f':box(x+.08,y+.08,0,.84,.84,2.4,'#8a7a6a');box(x+.12,y+.12,2.4,.76,.76,.4,'#5a3a20');for(let i=0;i<6;i++){const q=hh(x*7+i,y*3+i);box(x+.16+(i%3)*.24,y+.18+(i>>1&1)*.3+q*.1,2.8,.08,.08,1.4+q*2,FLW[(x+y+i)%5])}break;
  case 'a':bOak(x,y,h);break;
  case 'k':box(x+.15,y+.2,0,.3,.3,8,'#8a5a2a');box(x+.13,y+.18,3,.34,.34,1,'#3a3a3a');box(x+.5,y+.45,0,.36,.36,6,'#a07a4a');box(x+.5,y+.45,3,.36,.02,.8,'#7a5a3a');break;
  case 'g':{box(x+.46,y+.46,0,.08,.08,30,'#6b4a2b');for(let i=0;i<7;i++){const u=i/6;box(x+.5-1.6+u*3.2,y+.48,27-Math.sin(u*3.14)*3,.12,.02,3,['#c0392b','#ffd84a','#2a6ad8','#3a9a3a','#f4f0e0','#c88aff','#c0392b'][i])}break}
  default:return false}return true}
let VVFOG=0;
const _decN712c=decN;decN=function(x,y,k,h){if(ZZ&&ZZ.viva&&decV(x,y,k,h))return true;return _decN712c(x,y,k,h)};
/* ---- le case intatte: la porta, le insegne; la casa del fabbricante di candele; il campanile con la campana e l'orologio ---- */
const _bld712d=bld;bld=function(x,y,h){const b=TB[BM[y][x]];if(!b||!ZZ||!ZZ.viva||(b.st!=='vv'&&b.st!=='vcamp')){_bld712d(x,y,h);return}
  if(b.st==='vcamp'){vvCamp(x,y,h,b);return}_bld712d(x,y,h);const fy=y===b.y+b.h-1,ht=b.ht;
  if(fy&&x===b.dx){box(x+.22,y+.97,0,.56,.06,ht*.62,'#5a3a1e');box(x+.26,y+1.0,.5,.48,.02,ht*.6-1,'#6a4a2a');box(x+.66,y+1.02,ht*.3,.05,.02,1.2,'#d4af37');
    if(b.cand){box(x+.2,y+1.0,ht*.7,.6,.03,3,'#3a2a3a');box(x+.46,y+1.03,ht*.7+.5,.08,.02,2,'#f4f0e0');box(x+.47,y+1.04,ht*.7+2.5,.06,.02,.9,'#ffd04a',1.4)}}
  if(b.cand&&fy&&x!==b.dx&&h>.3&&NK>.2){box(x+.34,y+.99,ht*.35+1,.32,.04,ht*.3-2,'#c88aff',1.2);nlight(x+.5,y+1.1,ht*.5,70,'200,140,255',.5,1)}};
// il campanile (2×2): fusto di pietra con le feritoie, l'orologio, la cella delle campane con quattro pilastri e la campana che oscilla,
// il tetto a piramide con la croce e la bandiera (cella, campana e tetto li disegna la casella davanti, l'ultima delle quattro)
function vvCamp(x,y,h,b){const i=x-b.x,j=y-b.y,fy=j===b.h-1,fx=i===b.w-1,ht=b.ht,C='#c8b896',C2='#b0a280',BH=24,top=ht+BH,cx=b.x+b.w/2,cy=b.y+b.h/2;
  box(x,y,0,1,1,ht,C,.93+h*.05);for(let z=8;z<ht-3;z+=8){if(fy)box(x,y+.992,z,1,.016,.8,C2);if(fx)box(x+.992,y,z,.016,1,.8,C2)}
  if(fy&&i===0)for(const z of[ht-60,ht-82])box(x+.4,y+.97,z,.2,.06,9,'#4a3a2a');if(fx&&j===0)for(const z of[ht-60,ht-82])box(x+.97,y+.4,z,.06,.2,9,'#4a3a2a');
  box(x-.04,y-.04,ht,1.08,1.08,2.4,C2);box(x+(i?.74:0),y+(j?.74:0),ht+2.4,.26,.26,BH-2.4,C,.97);
  if(!(fx&&fy))return;
  const sw=Math.sin(t*(VVBELL>1?7:3))*.08*VVBELL;box(cx-.06,cy-.06,ht+BH-6,.12,.12,4,'#3a3a3a');box(cx-.34+sw,cy-.34,ht+6,.68,.68,8,'#b8862a',1.15);box(cx-.24+sw,cy-.24,ht+14,.48,.48,2.4,'#a8762a');
  box(cx-.08+sw*1.5,cy-.08,ht+4,.16,.16,2,'#6a4a1a');box(b.x-.06,cy-.05,top-6,b.w+.12,.1,1.2,'#5a3a1a');
  box(b.x-.08,b.y-.08,top-3,b.w+.16,b.h+.16,3,C2);for(let k=0;k<6;k++){const s2=b.w+.1-k*.36;box(cx-s2/2,cy-s2/2,top+k*6,s2,s2,6,b.roof,.95+(k%2)*.05)}
  box(cx-.04,cy-.04,top+36,.08,.08,12,'#3a3a3a');box(cx-.14,cy-.04,top+44,.28,.08,1.4,'#d4af37');box(cx+.04,cy-.02,top+40,.34,.04,4,'#c0392b');
  box(cx-.44,y+.97,ht-38,.88,.06,14,'#f4f0e0');box(cx-.39,y+1.0,ht-37,.78,.02,12,'#e8e0c8');box(cx-.02,y+1.02,ht-31.5,.04,.02,5.5,'#1a1a1a');box(cx-.02,y+1.02,ht-31.5,.32,.02,.9,'#1a1a1a');box(cx-.48,y+.98,ht-39.2,.96,.04,1.4,'#d4af37');
  box(cx-.28,y+.97,0,.56,.06,20,'#4a3a2a');box(cx-.24,y+1.0,.5,.48,.02,19,'#5a4a32')}
let VVBELL=0;
// le case che bruciano: le più vicine all'inquadratura, con le fiamme lungo il tetto, il fumo e la luce del fuoco (nel filmato)
function vvFire(lt,cx,cy){const L=TB.filter(b=>b.st==='vv').map(b=>[b,Math.hypot(b.x+b.w/2-cx,b.y+b.h/2-cy)]).sort((a,b)=>a[1]-b[1]).slice(0,12);
  for(const[b]of L){const z=b.ht+((Math.min(b.w,b.h)-1)>>1)*5,n=Math.max(2,Math.min(5,b.w-1));
    for(let k=0;k<n;k++){const x=b.x+.25+k*(b.w-.85)/n,y=b.y+b.h/2-.3+Math.sin(k*2.1+b.x)*.25*(b.h/2),f=1+Math.sin(lt*11+k*2+b.x)*.25,f2=1+Math.sin(lt*13+k+b.y)*.25;
      box(x,y,z,.6,.6,12*f,'#ff5a12',1.35);box(x+.12,y+.12,z+6,.36,.36,12*f2,'#ffa020',1.45);box(x+.2,y+.2,z+14,.2,.2,8*f,'#ffe08a',1.5);
      const sz=(lt*9+k*7+b.x)%26;g.globalAlpha=.32*(1-sz/26);box(x+.05,y+.05,z+20+sz,.5,.5,7,'#2a2424');g.globalAlpha=1}
    nlight(b.x+b.w/2,b.y+b.h/2,b.ht,300,'255,120,40',1)}}
/* ---- i personaggi del ricordo ---- */
Object.assign(NPCS,{moreau_k:{n:'Il piccolo Moreau',c:'#4a5a7a',hat:'#333'},moreau_m:{n:'La madre del Moreau',c:'#7a4a5a',hat:'#444'},campanaro:{n:'Il campanaro',c:'#5a4a3a',hat:'#666'},
  candelaio:{n:'Il fabbricante di candele',c:'#3a2a4a',hat:'#2a1a2a'},incappucciato:{n:'Incappucciato',c:'#2a1a2a',hat:'#1a1a1a'},vexmoor_v:{n:'Lord Vexmoor',c:'#4a2a6a',hat:'#9a7ad8'}});
Object.assign(NPS,{moreau_k:'b|short:#1a1a1a|none|cap|patches|basket|kid|kid',moreau_m:'b|bun:#3a2a1a|none|scarf|apron:#e8e0d0|basket|idle|f',
  campanaro:'b|bald2:#a8a8a8|full:#a8a8a8|none|apron:#5a4a3a|bell|idle|old',candelaio:'a|long:#3a3a3a|goatee:#3a3a3a|hood|cape:#3a2a4a|lantern|idle|tall',
  incappucciato:'R|R|R|hood|cape:#2a1a2a|lantern|idle|n',vexmoor_v:'a|short:#3a2a1a|goatee:#3a2a1a|feather::#9a7ad8|cape:#4a2a6a,collar|cane|proud|tall'});
// la campana: rintocchi profondi (due note che si spengono piano)
function vvBell(n,gap){if(!AU.ac||!SET.sf)return;for(let i=0;i<n;i++)setTimeout(()=>{try{const t0=AU.ac.currentTime,v=SET.sf;vtone(t0,55,2.4,'sine',2.2,.05*v);vtone(t0,67,1.6,'triangle',1.4,.02*v);vtone(t0+.01,74,1.2,'sine',1,.012*v)}catch(_){}},i*(gap||900))}
// la nebbia verde che sale dal pozzo (si disegna sopra la scena, nel mondo)
function vvFog(lt,k){const[wx,wy]=WELL,x=wx+.5,y=wy+.5;for(let i=0;i<14;i++){const u=(lt*.22+i/14)%1,a=i*2.39,r=.3+u*2.6;g.globalAlpha=k*(1-u)*.5;const X=PX(x+Math.cos(a)*r*.6,y+Math.sin(a)*r*.6),Y=PY(x+Math.cos(a)*r*.6,y+Math.sin(a)*r*.6,6+u*40),s=26+u*70;g.drawImage(blobSpr('150,230,170'),X-s,Y-s*.6,2*s,1.2*s)}g.globalAlpha=1}
FILMS.ricordo={n:'Il ricordo del Moreau · Aldoria Vecchia prima della nebbia',mus:'town',L:[
  {d:9,st:'vecchia_viva',sepia:1,mus:'town',sfx:()=>vvBell(3,1100),cam:[[62,23.5,1.05],[75,21.5,1.15]],who:'Il Moreau',title:'ALDORIA VECCHIA',sub:'prima della nebbia',tt:3.4,
    tx:'Prima della nebbia, Aldoria Vecchia era il cuore della città. Le botteghe aprivano all\'alba, e il mercato riempiva la strada grande fino alla piazza del pozzo.',
    act:[fA('a1',{n:'nobile',go:[[58.5,20.5],[70.5,20.5],[79.5,20.5]],v:1.3,t0:.4}),fA('a2',{n:'teresa',go:[[80.5,21.5],[66.5,21.5]],v:1.1,t0:.2}),fA('a3',{n:'tommaso',go:[[60.5,21.5],[72.5,21.5],[72.5,26.5]],v:2.1,t0:1}),
      fA('a4',{n:'lucia',go:[[61.5,20.6],[73.5,20.6],[73.5,25.5]],v:2,t0:1.3}),fA('a5',{n:'marinaio',go:[[73.5,10.5],[73.5,20.5],[63.5,20.5]],v:1.2,t0:.8}),fA('a6',{n:'garzone',p:[75.5,20.5],f:'S',an:'shout'})],
    fx:()=>{VVFOG=0;VVBELL=0}},
  {d:9,st:'vecchia_viva',sepia:1,cam:[[85,17,1.45],[82.5,15.5,1.7]],who:'Il Moreau',
    tx:'Io abitavo sulla piazza del pozzo. Ogni mattina mia madre mi mandava a prendere l\'acqua, e io ci mettevo un\'ora: c\'era sempre qualcuno con cui fermarsi a parlare.',
    act:[fA('mm',{n:'moreau_m',p:[87.6,15.6],f:'mk'}),fA('mk',{n:'moreau_k',go:[[88.5,15.7],[82.5,15.5],[81.5,14.6]],v:1.5,t0:.6}),
      fA('b1',{n:'bimbo2',go:[[84.5,19.2],[82.5,16.2]],v:1.6,t0:2.6,f:'mk'}),fA('c1',{n:'giardiniere',p:[78.5,16.5],f:'E'})],fx:()=>{VVFOG=0;VVBELL=0}},
  {d:8.5,st:'vecchia_viva',sepia:1,sfx:()=>vvBell(4,950),cam:[[70,19.5,1.2],[68.8,17.8,1.05]],who:'Il Moreau',
    tx:'A mezzogiorno il vecchio campanaro suonava la campana, e tutto il quartiere si fermava a mangiare. Diceva che la sua campana era la più antica del regno.',
    act:[fA('cp',{n:'campanaro',p:[68.5,17.5],f:'cam',an:'shout'}),fA('k1',{n:'bimbo1',go:[[71.5,20.5],[69.8,18.3]],v:1.9,t0:.6,f:'cp'}),fA('k2',{n:'moreau_k',go:[[72.5,21.3],[67.4,18.5]],v:1.8,t0:.9,f:'cp'})],
    fx:lt=>{VVBELL=1}},
  {d:9,st:'vecchia_viva',sepia:1,dusk:.7,mus:'vecchia',cam:[[81,13,1.35],[82.5,10.5,1.5]],who:'Il Moreau',
    tx:'Poi arrivò il fabbricante di candele. Di sera, nella sua bottega, entravano persone con il cappuccio, una alla volta. Parlavano piano, in una lingua che nessuno conosceva.',
    act:[fA('cn',{n:'candelaio',p:[83.5,8.7],f:'S',glow:'200,140,255'}),fA('h1',{n:'incappucciato',go:[[76.5,18.5],[82.6,9.4]],v:1,t0:.3,out:[6.4,1],glow:'255,200,120'}),
      fA('h2',{n:'incappucciato',go:[[78.5,19.5],[83.4,9.6]],v:1,t0:1.5,out:[7.3,1],glow:'255,200,120'}),fA('vx',{n:'vexmoor_v',p:[77.5,11.6],f:'cn',in:[2,1.2]})],fx:()=>{VVBELL=0}},
  {d:9,st:'vecchia_viva',sepia:1,night:.95,fog:.9,mus:'culto',cam:[[82.5,17,1.5],[80.8,15.5,1.75]],who:'Il Moreau',
    tx:'Una notte la nebbia salì dal pozzo della piazza. Era verde, e aveva un odore dolciastro. Il campanaro disse che era solo umidità. Io la guardai dalla finestra, e la nebbia guardò me.',
    act:[fA('mk',{n:'moreau_k',p:[88.5,15.7],f:[-1,0],an:'nervous'})],fx:lt=>{VVFOG=fSmooth(lt/3);vvFog(lt,VVFOG);const k=fSmooth((lt-5)/2.2),[wx,wy]=WELL;
      if(k>0){const p=.75+.25*Math.sin(lt*2.2);fGlow(wx+.5,wy+.5,46,'120,255,160',90*k,.28*k*p);fGlow(wx+.5,wy+.5,46,'220,255,230',26*k,.55*k*p)}}},
  {d:8.5,st:'vecchia_viva',sepia:1,night:.75,fire:1,fog:1,shake:lt=>lt>1.5&&lt<6?.35:0,sfx:()=>{vvBell(7,520);try{scream()}catch(_){}},cam:[[80,21,1.15],[73,20.5,1.3]],who:'Il Moreau',
    tx:'Poi il fuoco. Le urla. La campana che suonava da sola, sempre più forte. Mia madre mi prese per mano e corremmo verso la città, senza voltarci.',
    act:[fA('mm',{n:'moreau_m',go:[[88.5,16.2],[88.5,20.5],[63.5,20.5]],v:2.6,t0:.3}),fA('mk',{n:'moreau_k',go:[[89.3,16.4],[89.3,21.2],[64.3,21.2]],v:2.6,t0:.3}),
      fA('f1',{n:'fuggiasco',go:[[92.5,21.5],[66.5,21.5]],v:2.3,t0:1.1}),fA('f2',{n:'fuggiasca',go:[[93.5,20.5],[67.5,20.5]],v:2.2,t0:1.6}),fA('f3',{n:'bimbo1',go:[[94.5,21.3],[69.5,21.3]],v:2.4,t0:2})],
    fx:lt=>{VVFOG=1;VVBELL=2;vvFog(lt,.8);vvFire(lt,78,19)}},
  {d:10,st:'vecchia',night:.55,fog:.8,mus:'vecchia',cam:[[80,21,1.05],[80,16.5,1.35]],who:'Il Moreau',
    tx:'Quando il fumo si diradò, il Re fece murare il quartiere con dentro tutto quello che c\'era. Io ero solo un bambino. Da allora non sono più tornato. Ora tocca a te.',
    title:'Aldoria Vecchia',sub:'oggi',tt:3.2,act:[],fx:lt=>{VVFOG=0;VVBELL=0}}]};
// la prima volta che si entra in Aldoria Vecchia (nella storia), il ricordo del Moreau
const _loadPost712r=loadPost;loadPost=function(k){_loadPost712r(k);if(k==='vecchia'&&started&&MODE==='story'&&SET.film!==0&&!fSeen().ricordo&&!(CN&&CN.film))setTimeout(()=>{if(started&&Zk==='vecchia'&&!(CN&&CN.film))filmOnce('ricordo',()=>{if(PA&&PA.ti)pn('txt')})},900)};
if(typeof DEVSPEC!=='undefined')DEVSPEC.vecchia_viva='il ricordo del Moreau (solo per il filmato)';
