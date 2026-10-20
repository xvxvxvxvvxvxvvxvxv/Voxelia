/* ================= 7.12: I BIOMI RIFATTI — Foresta di Elmwood, Deserto di Khem, Picchi Gelidi =================
   Le tre zone fuori dalle mura passano da 40×40 a 64×64 caselle e hanno una pianta fissa: i luoghi restano al loro posto da
   una visita all'altra (cambiano solo dove stanno i nemici e i forzieri). I sentieri collegano la porta della città ai luoghi
   da visitare, ci sono boschetti e radure, acqua con i ponti di legno, e strutture e decorazioni a tema:
   - Foresta: la radura delle lucciole, il cerchio di pietre con l'altare e l'Erba Lunare, la capanna del cacciatore (con il suo
     interno), la torre di guardia in rovina, il lago con il ruscello e il ponte, l'accampamento dei goblin con la palizzata
     davanti alla Tana, la Grande Quercia dove si nasconde il Troll; querce, pini, betulle, cespugli, funghi e tronchi caduti.
   - Deserto: la pista delle carovane, l'oasi con le palme e la tenda del mercante (con il suo interno), l'accampamento della
     carovana con i cammelli, la Piramide di Khem a gradoni con la Sfinge, la città sepolta, la necropoli del Faraone con gli
     obelischi e i sarcofagi, le ossa di una bestia gigante; dune, rocce di arenaria, cactus e alberi secchi.
   - Picchi: il sentiero di montagna, il rifugio degli esploratori (con il suo interno), il villaggio congelato dal drago con gli
     abitanti di ghiaccio, il lago ghiacciato, le grotte di cristallo, la bocca della Fucina tra le rocce vulcaniche, il santuario
     con le bandierine, il covo del Drago con il suo tesoro; abeti innevati, pareti di roccia, massi e punte di ghiaccio.
   Nuove raccolte: Erba Lunare (foresta), Scarabei dorati (deserto), Fiori di ghiaccio (picchi). */
const BIOK=new Set(['forest','desert','peaks']);
const isBio=z=>!!(z&&!z.ed&&!z.dg&&!z.int&&!z.dist&&BIOK.has(z.th));
// il codice di una casella: ['lettera', 'parte' (per le strutture grandi), 'terreno sotto']; per il pavimento solo il terreno
const BPC={forest:'E',desert:'YS',peaks:''};
function bCode(d,th){if(!d||d[0]!==DN)return null;const k=d[1];if(k>='0'&&k<='9')return['',null,k];const pc=(BPC[th]||'').includes(k);return[k,pc?d[2]:null,d[pc?3:2]||'']}
for(const k of BIOK)Object.assign(Z[k],{N:64,c:46});
// rumore morbido e fisso: fa le macchie dei boschetti, delle dune, delle radure
function vnz(x,y,s,sd2){const fx=x/s,fy=y/s,x0=Math.floor(fx),y0=Math.floor(fy),tx=fx-x0,ty=fy-y0,r=(i,j)=>hh(i*1.37+sd2*7.1,j*1.91+sd2*3.3),sm=v=>v*v*(3-2*v);
  const a=r(x0,y0),b=r(x0+1,y0),c=r(x0,y0+1),d=r(x0+1,y0+1),u=sm(tx),v=sm(ty);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v}
/* ---- le raccolte nuove ---- */
Object.assign(RESN,{lunare:'Erba Lunare',scarab:'Scarabei dorati',ghiaccio:'Fiori di ghiaccio'});Object.assign(RESP,{lunare:14,scarab:16,ghiaccio:18});
Object.assign(RESM,{lunare:()=>{const u=.5+.5*Math.sin(t*2);return[[-.14,-.1,0,.06,.06,7,'#4a8a5a'],[.02,-.04,0,.06,.06,9,'#4a8a5a'],[-.06,.06,0,.06,.06,6,'#4a8a5a'],[-.18,-.14,7,.14,.14,2.5,'#cfe8ff',1.2+u*.3],[-.02,-.08,9,.14,.14,2.5,'#e8f4ff',1.2+u*.3],[-.1,.02,6,.12,.12,2.5,'#bfe0ff',1.2+u*.3]]},
  scarab:()=>{const u=Math.sin(t*4)*.02;return[[-.12+u,-.08,0,.24,.18,3,'#d4af37'],[-.08+u,-.06,3,.16,.12,1.6,'#f0d060'],[.12+u,-.04,.5,.06,.08,2,'#2a2010'],[-.16+u,-.1,0,.04,.22,1,'#2a2010']]},
  ghiaccio:()=>[[-.04,-.04,0,.08,.08,7,'#6a8a9a'],[-.14,-.14,6,.28,.28,2.5,'#dff4ff',1.2],[-.06,-.06,8.5,.12,.12,2,'#9adcff',1.3]]});
/* ---- il generatore ---- */
const _genWild712=genWild;genWild=function(z){return BIOK.has(z.th)&&!z.dg&&BIO[Zk]?genBiome(z):_genWild712(z)};
function genBiome(z){const n=N,k=Zk,rnd=sd(hs('bioma|'+k+'|7.12')),rr=(a,b)=>a+Math.floor(rnd()*(b-a+1)),RS=new Uint8Array(n*n);BM=grid(-1);TB=[];
  for(let y=0;y<n;y++)for(let x=0;x<n;x++){M[y][x]=0;DEC[y][x]=''}
  const ok=(x,y)=>x>0&&y>0&&x<n-1&&y<n-1,res=(x,y)=>{if(ok(x,y))RS[y*n+x]=1},fv=(x,y)=>{const q=bCode(DEC[y][x],z.th);return q?q[2]:''};
  const C={n,k,z,rnd,rr,ok,res,isRes:(x,y)=>RS[y*n+x]===1,
    F:(x,y,c)=>{if(ok(x,y)&&M[y][x]!==2){M[y][x]=0;DEC[y][x]=c?DN+c:'';res(x,y)}},          // terreno calpestabile (c = tipo di terreno)
    W:(x,y,c,v)=>{if(ok(x,y)){const f=v!=null?v:fv(x,y);M[y][x]=1;DEC[y][x]=DN+c+f;res(x,y)}},   // albero, roccia, muro (sopra il terreno che c'era)
    Pp:(x,y,c,v)=>{if(ok(x,y)){const f=v!=null?v:fv(x,y);M[y][x]=6;DEC[y][x]=DN+c+f;res(x,y)}},  // arredo
    Wa:(x,y)=>{if(ok(x,y)){M[y][x]=2;DEC[y][x]='';res(x,y)}},                             // acqua
    disc(cx,cy,r,fn){for(let y=Math.floor(cy-r-1);y<=cy+r+1;y++)for(let x=Math.floor(cx-r-1);x<=cx+r+1;x++){const d=Math.hypot(x+.5-cx,y+.5-cy);if(d<=r&&ok(x,y))fn(x,y,d)}},
    // sentiero largo w da un punto all'altro, un po' serpeggiante; sull'acqua diventa un ponte di legno
    path(pts,w,code){for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i],d=Math.hypot(b[0]-a[0],b[1]-a[1])||1,st=Math.ceil(d*3);
      for(let s=0;s<=st;s++){const u=s/st,wob=(vnz(a[0]+u*(b[0]-a[0]),a[1]+u*(b[1]-a[1]),6,9)-.5)*2.6*Math.sin(u*Math.PI),x=a[0]+(b[0]-a[0])*u-(b[1]-a[1])/d*wob,y=a[1]+(b[1]-a[1])*u+(b[0]-a[0])/d*wob;
        for(let j=0;j<w;j++)for(let i2=0;i2<w;i2++){const X=Math.floor(x)+i2-(w>>1),Y=Math.floor(y)+j-(w>>1);if(!ok(X,Y))continue;
          if(M[Y][X]===2){M[Y][X]=4;DEC[Y][X]='~';res(X,Y)}else if(M[Y][X]===4)continue;else if(!(M[Y][X]===6||M[Y][X]===3||(M[Y][X]===1&&RS[Y*n+X]&&DEC[Y][X]!==DN+'Z'))){M[Y][X]=0;DEC[Y][X]=DN+code;res(X,Y)}}}}},
    // un edificio con il tetto (le capanne), con la porta verso un interno
    H(b){const i=TB.push(b)-1;for(let y=b.y;y<b.y+b.h;y++)for(let x=b.x;x<b.x+b.w;x++){M[y][x]=3;DEC[y][x]='';BM[y][x]=i;res(x,y)}
      if(b.to){const y=b.y+b.h;M[y][b.dx]=0;DEC[y][b.dx]=DN+'4';res(b.dx,y);ents.push(po(b.dx,y,b.to,{st:'door'}))}},
    ents:[],chests:[],resv:[]};
  const B=BIO[k];
  // la porta della città, sul bordo (come prima)
  const[gx,gy,gd,geo,gsw]=k==='forest'?[n>>1,n-2,'x',1,-1]:k==='desert'?[1,n>>1,'y',-1,1]:[n-2,n>>1,'y',1,-1];
  for(let y=gy-3;y<=gy+3;y++)for(let x=gx-3;x<=gx+3;x++)if(ok(x,y))C.F(x,y,'1');for(let q=-1;q<=1;q++){if(gd==='x')M[gy+geo][gx+q]=0;else M[gy+q][gx+geo]=0}
  ents.push(Object.assign(po(gx,gy,'town',{st:'cancello',n:'Aldoria'}),{dir:gd,span:3,off:-1.5,eo:geo,sw:gsw,sty:k==='forest'?'legno':k==='desert'?'sabbia':'gelo'}));
  const sp=gd==='x'?[gx,gy-3]:[gx-3*geo,gy];C.gate=[gx,gy];C.sp=sp;
  B.build(C);                                                   // luoghi, acqua, sentieri, strutture
  for(let y=1;y<n-1;y++)for(let x=1;x<n-1;x++)if(!RS[y*n+x]&&M[y][x]===0)B.fill(C,x,y);   // boschi, rocce, dune
  // 7.12.1: una raccolta rimasta sotto una roccia o un albero del riempimento torna sul terreno (si fa dopo, così il resto della pianta non cambia)
  for(const e of C.ents)if(e.k==='res'){const x=e.px|0,y=e.py|0;if(!RS[y*n+x]&&(M[y][x]===1||M[y][x]===6))C.F(x,y,'')}
  for(let i=0;i<n;i++)for(const[x,y]of[[i,0],[i,n-1],[0,i],[n-1,i]])if(M[y][x]!==0||!(Math.abs(x-gx)<=1&&Math.abs(y-gy)<=1)){M[y][x]=1;DEC[y][x]=DN+B.edge}
  for(let q=-1;q<=1;q++){if(gd==='x'){M[gy+geo][gx+q]=0;DEC[gy+geo][gx+q]=''}else{M[gy+q][gx+geo]=0;DEC[gy+q][gx+geo]=''}}
  // tutto deve essere raggiungibile: se qualcosa resta chiuso fra gli alberi si apre un varco (mai nei muri delle strutture)
  const targets=C.ents.concat(ents).filter(e=>e.k==='po'||e.k==='npc'||e.k==='res'||e.k==='ch').map(e=>[e.px|0,e.py|0]).concat(C.reach||[],C.chests.map(c=>[c[0],c[1]]));
  const NB=[[1,0],[-1,0],[0,1],[0,-1]];let d=bfs(sp[0],sp[1]);
  for(const[x0,y0]of targets){if(d[y0*n+x0]>=0||NB.some(([a,b])=>d[(y0+b)*n+x0+a]>=0))continue;
    const pr=new Int32Array(n*n).fill(-2),q=[y0*n+x0];pr[q[0]]=-1;let hit=-1;
    for(let i=0;i<q.length&&hit<0;i++){const c=q[i],x=c%n,y=c/n|0;for(const[a,b]of NB){const u=x+a,v=y+b;if(u<1||v<1||u>=n-1||v>=n-1||pr[v*n+u]!==-2)continue;const m=M[v][u];
        if(!(WK(m)||((m===1||m===6)&&!(RS[v*n+u]&&DEC[v][u]!==DN+'Z'&&!B.soft.includes(DEC[v][u][1]||'')))))continue;pr[v*n+u]=c;if(d[v*n+u]>=0){hit=v*n+u;break}q.push(v*n+u)}}
    if(hit<0)continue;for(let c=hit;c>=0;c=pr[c]){const x=c%n,y=c/n|0;if(M[y][x]===1||M[y][x]===6){M[y][x]=0;DEC[y][x]=DN+B.trail}}d=bfs(sp[0],sp[1])}
  for(const e of C.ents)ents.push(e);
  // il boss nel suo covo, i nemici sparsi lontano dalla porta, i forzieri vicino ai luoghi e qualcuno nascosto
  const[bx,by]=C.boss;ents.push(mk(z.boss,bx,by));
  const far=[];for(let y=2;y<n-2;y++)for(let x=2;x<n-2;x++)if(WK(M[y][x])&&d[y*n+x]>11&&Math.hypot(x-bx,y-by)>5&&!ents.some(e=>Math.abs(e.px-x-.5)<1.5&&Math.abs(e.py-y-.5)<1.5))far.push([x,y]);
  for(let i=far.length-1;i>0;i--){const j=ri(0,i);[far[i],far[j]]=[far[j],far[i]]}
  // un dungeon di questa zona che non ha ancora il suo ingresso (aggiunto in seguito) va in un punto lontano dalla porta
  for(const id of Object.keys(DG).filter(id=>DG[id].ent===k&&!ents.some(e=>e.k==='po'&&e.to===id+'@1'))){const q=far.pop();if(q)ents.push(po(q[0],q[1],id+'@1',{st:'dun'}))}
  for(let i=0;i<z.c&&far.length;i++){const[x,y]=far.pop();ents.push(mk(z.en[ri(0,z.en.length-1)],x,y))}
  for(const[x,y,rich]of C.chests)if(WK(M[y][x]))ents.push({k:'ch',px:x+.5,py:y+.5,rich:rich?1:0});
  for(let i=0;i<4&&far.length;i++){const[x,y]=far.pop();ents.push({k:'ch',px:x+.5,py:y+.5})}
  return sp}
/* ---- i tre biomi: i luoghi (build), il riempimento (fill), il bordo e i sentieri ---- */
const BIO={};
BIO.forest={edge:'Z',trail:'1',soft:'OPBU',
  build(C){const{F,W,Pp,Wa,disc,path,H,rr,n}=C;
    // il lago e il ruscello che scende dal bordo nord e passa sotto il ponte
    disc(37,27,4.2,(x,y,d)=>{if(d<3.4+vnz(x,y,2,4)*1.2)Wa(x,y)});
    for(let y=1;y<23;y++){const x=Math.round(40+Math.sin(y*.35)*2);Wa(x,y);Wa(x+1,y)}
    disc(37,27,6,(x,y)=>{if(M[y][x]===0&&!C.isRes(x,y))F(x,y,'6')});for(let i=0;i<14;i++){const a=i/14*6.283,x=Math.round(37+Math.cos(a)*5.2),y=Math.round(27+Math.sin(a)*5.2);if(M[y]&&M[y][x]===0&&i%2)Pp(x,y,'y')}
    // la radura delle lucciole (lì atterra anche la cabina blu di Voxelia Dimension)
    for(let y=14;y<=28;y++)for(let x=10;x<=29;x++){const e=Math.max(Math.abs(x-19.5)/10,Math.abs(y-21)/7.5);if(e<1)F(x,y,e<.75&&hh(x*3,y*5)>.55?'2':'')}
    for(const[x,y]of[[10,15],[29,15],[10,27],[29,27],[11,19],[28,24]])Pp(x,y,hh(x,y)>.5?'u':'l');
    // il cerchio di pietre con l'altare (e l'Erba Lunare)
    disc(47,14,5.2,(x,y)=>F(x,y,'4'));for(let i=0;i<10;i++){const a=i/10*6.283;Pp(Math.round(47+Math.cos(a)*4.2-.5),Math.round(14+Math.sin(a)*4.2-.5),'g')}Pp(47,14,'a');
    for(const[x,y]of[[45,12],[49,12],[45,16],[49,16],[47,11],[47,17]])C.ents.push({k:'res',r:'lunare',n:RESN.lunare,px:x+.5,py:y+.5});
    // la capanna del cacciatore, con la catasta, la rastrelliera delle pelli e il ceppo
    disc(46,40,4.4,(x,y)=>F(x,y,''));H({x:44,y:36,w:5,h:4,st:'baita',wall:'#8a6a4a',roof:'#4a5a3a',ht:28,to:'in_capanna',dx:46,smoke:1});
    Pp(43,40,'w');Pp(50,38,'x');Pp(50,41,'w');Pp(43,37,'f');C.chests.push([49,41,0]);
    // la torre di guardia in rovina, a ovest
    disc(11,46,3.6,(x,y,d)=>{if(d>2.6){if(hh(x*7,y*3)>.28)W(x,y,'W');else F(x,y,'4')}else F(x,y,'4')});F(13,48,'4');F(14,47,'4');C.chests.push([11,46,1]);Pp(10,45,'k');
    // l'accampamento dei goblin davanti alla Tana: palizzata, totem, tende, fuoco
    disc(53,52,6,(x,y,d)=>{if(d>5.1&&!(x<50&&y<50))W(x,y,'K');else F(x,y,d<4?'7':'')});
    for(const[x,y,c]of[[51,50,'e'],[57,50,'e'],[50,54,'t'],[56,55,'t'],[53,49,'f'],[58,53,'k']])Pp(x,y,c);
    C.ents.push(po(54,52,'tana@1',{st:'dun'}));for(let y=51;y<=53;y++)for(let x=53;x<=55;x++)if(M[y][x]!==0||DEC[y][x]===DN+'f')F(x,y,'7');
    // la Grande Quercia e il covo del Troll, a nord: ossa intorno
    disc(30,8,4.5,(x,y)=>F(x,y,'3'));for(let j=0;j<3;j++)for(let i=0;i<3;i++)W(28+i,3+j,'E'+(j*3+i));for(const[x,y]of[[26,9],[34,7],[27,11],[33,11]])Pp(x,y,'k');C.boss=[30,9];C.chests.push([32,5,1]);
    // il cerchio di funghi delle fate, a est
    disc(58,22,2.6,(x,y,d)=>{if(d>1.8&&!(x<58&&y===22))Pp(x,y,'u');else F(x,y,'2')});C.chests.push([58,22,0]);
    // i sentieri: dalla porta al bivio, e da lì verso ogni luogo
    const X0=C.gate[0],Y0=C.gate[1];path([[X0,Y0-2],[32,46]],2,'1');path([[32,46],[25,33],[21,25]],2,'1');path([[32,46],[45,42],[46,41]],2,'1');
    path([[32,46],[44,50],[50,52]],2,'1');path([[21,23],[33,17],[42,14]],2,'1');path([[20,17],[27,12],[30,11]],2,'1');path([[32,46],[20,47],[14,47]],2,'1');
    Pp(33,45,'i');C.reach=[[30,9]]},
  fill(C,x,y){const d=vnz(x,y,7,1)*.68+vnz(x,y,3,2)*.32;let tree=d>.55?C.rnd()<.78:d>.45?C.rnd()<.2:C.rnd()<.045;
    if(!tree){if(d>.5)C.F(x,y,'3');else if(vnz(x,y,5,6)>.7)C.F(x,y,'2');else if(C.rnd()<.012)C.Pp(x,y,C.rnd()<.5?'u':'l');return}
    const s=vnz(x,y,9,3),c=y<22&&s>.45?'P':s>.72?'B':d<.5?'U':C.rnd()<.12?'R':'O';M[y][x]=1;DEC[y][x]=DN+c}};
BIO.desert={edge:'M',trail:'1',soft:'QJV',
  build(C){const{F,W,Pp,Wa,disc,path,H,n}=C;
    // l'oasi: lo stagno, le palme, i giunchi e la tenda del mercante
    disc(22,34,3.6,(x,y,d)=>{if(d<2.6+vnz(x,y,2,5)*1.1)Wa(x,y)});disc(22,34,6.4,(x,y)=>{if(M[y][x]===0&&!C.isRes(x,y))F(x,y,'6')});
    for(let i=0;i<9;i++){const a=i/9*6.283+.3,x=Math.round(22+Math.cos(a)*4.6),y=Math.round(34+Math.sin(a)*4.4);if(M[y]&&M[y][x]===0)W(x,y,'X')}
    for(const[x,y]of[[19,31],[25,37],[18,35]])if(M[y][x]===0)Pp(x,y,'y');
    disc(16,25,3.6,(x,y)=>F(x,y,'4'));H({x:14,y:22,w:5,h:3,st:'tenda',wall:'#e8dcc0',roof:'#c0392b',ht:20,to:'in_tenda',dx:16});
    // l'accampamento della carovana: tende a righe, cammelli, casse, botti, il fuoco
    disc(30,42,4,(x,y)=>F(x,y,'7'));for(const[x,y,c]of[[28,40,'t'],[32,40,'t'],[27,43,'m'],[33,44,'m'],[30,42,'f'],[29,45,'b'],[31,45,'z']])Pp(x,y,c);
    C.chests.push([33,42,0]);
    // la Piramide di Khem a gradoni, con la porta e la Sfinge di guardia
    for(let y=10;y<=21;y++)for(let x=44;x<=55;x++){const l=5-Math.max(Math.abs(x-49.5),Math.abs(y-15.5))+.5|0;W(x,y,'Y'+Math.max(0,Math.min(5,l)))}
    W(49,21,'Yd');for(let y=22;y<=25;y++)for(let x=46;x<=53;x++)F(x,y,'4');C.ents.push(po(49,22,'piramide@1',{st:'dun'}));
    for(const[x,y,p]of[[53,23,0],[54,23,1],[53,24,2],[54,24,3]])W(x,y,'S'+p);Pp(46,23,'o');Pp(52,23,'o');
    // la città sepolta: il recinto del tempio con i muri crollati (quattro varchi), due file di colonne, la testa di un faraone
    disc(36,54,6.4,(x,y,d)=>{F(x,y,d<5.2&&hh(x*2,y*3)>.3?'4':'7')});
    for(let x=31;x<=41;x++)for(const y of[50,58])if(Math.abs(x-36)>1&&hh(x*5,y)>.3)W(x,y,'W');for(let y=51;y<=57;y++)for(const x of[31,41])if(Math.abs(y-54)>1&&hh(x,y*5)>.3)W(x,y,'W');
    for(let y=52;y<=56;y+=2)for(const x of[33,39])Pp(x,y,'p');Pp(36,51,'h');Pp(43,52,'p');Pp(29,56,'p');
    for(const[x,y]of[[35,53],[37,55],[34,55],[38,52],[36,57]])C.ents.push({k:'res',r:'scarab',n:RESN.scarab,px:x+.5,py:y+.5});C.chests.push([36,54,1]);
    // la necropoli del Faraone: obelischi, sarcofagi e statue in cerchio
    disc(54,45,5.5,(x,y)=>F(x,y,'4'));for(let i=0;i<8;i++){const a=i/8*6.283;Pp(Math.round(54+Math.cos(a)*4.6-.5),Math.round(45+Math.sin(a)*4.6-.5),i%2?'o':'s')}C.boss=[54,45];C.chests.push([56,43,1]);
    // le ossa di una bestia gigante, nella sabbia a nord
    for(const[x,y,c]of[[12,12,'r'],[13,12,'r'],[14,12,'r'],[11,13,'k']])Pp(x,y,c);
    // la pista delle carovane
    const X0=C.gate[0],Y0=C.gate[1];path([[X0+2,Y0],[14,32],[22,29.5],[34,32]],2,'1');path([[34,32],[44,28],[49,24]],2,'1');path([[34,32],[31,40]],2,'1');
    path([[34,32],[36,47],[37,50]],2,'1');path([[37,50],[48,47],[51,45]],2,'1');path([[22,29.5],[17,26]],2,'1');
    Pp(35,31,'i');C.reach=[[54,45]]},
  fill(C,x,y){const d=vnz(x,y,8,1),r=vnz(x,y,4,2);
    if(d>.66&&C.rnd()<.7){M[y][x]=1;DEC[y][x]=DN+'M';return}
    if(C.rnd()<.035){M[y][x]=1;DEC[y][x]=DN+(C.rnd()<.6?'Q':C.rnd()<.6?'J':'V');return}
    if(r>.62&&C.rnd()<.08){C.Pp(x,y,'d');return}
    C.F(x,y,r>.55?'2':r<.3?'3':'')}};
BIO.peaks={edge:'N',trail:'1',soft:'FKY',
  build(C){const{F,W,Pp,Wa,disc,path,H,n}=C;
    // il lago ghiacciato
    disc(40,46,4.2,(x,y,d)=>{if(d<3.2+vnz(x,y,2,7)*1.2)Wa(x,y)});disc(40,46,6,(x,y)=>{if(M[y][x]===0&&!C.isRes(x,y))F(x,y,'6')});
    // il rifugio degli esploratori: la baita con il comignolo, la slitta, la legna, il fuoco
    disc(48,25,4.6,(x,y)=>F(x,y,'4'));H({x:46,y:21,w:5,h:4,st:'baita',wall:'#7a5a3a',roof:'#5a4a3a',ht:28,to:'in_rifugio',dx:48,smoke:1});Pp(45,26,'j');Pp(52,22,'w');Pp(51,26,'f');
    for(const[x,y]of[[44,28],[52,28],[45,23]])C.ents.push({k:'res',r:'ghiaccio',n:RESN.ghiaccio,px:x+.5,py:y+.5});
    // il villaggio congelato dal Drago: case di ghiaccio, gli abitanti diventati statue, il pozzo gelato
    disc(25,42,7,(x,y)=>F(x,y,'3'));
    for(const b of[{x:19,y:36,w:4,h:3},{x:28,y:35,w:4,h:3},{x:18,y:44,w:4,h:3},{x:28,y:45,w:5,h:3}])H(Object.assign(b,{st:'gelo',wall:'#a8c4d4',roof:'#e8f4fc',ht:30,smoke:2}));
    for(const[x,y,c]of[[24,40,'q'],[26,43,'q'],[23,47,'q'],[25,39,'z'],[30,40,'b'],[21,41,'q']])Pp(x,y,c);C.chests.push([25,42,1]);
    for(const[x,y]of[[22,40],[27,41]])C.ents.push({k:'res',r:'ghiaccio',n:RESN.ghiaccio,px:x+.5,py:y+.5});
    // le grotte di cristallo, a nord: la bocca nella roccia e i cristalli che brillano
    disc(30,13,5.6,(x,y,d)=>{if(d>4.2&&y<13)W(x,y,'N');else F(x,y,'3')});for(const[x,y]of[[27,10],[33,10],[26,14],[34,14],[28,17],[32,17]])W(x,y,'G');
    C.ents.push(po(30,12,'cristallo@1',{st:'dun'}));
    // la bocca della Fucina Infernale tra le rocce vulcaniche, a sud-ovest
    disc(13,52,5,(x,y,d)=>{if(d>4.1&&hh(x,y*3)>.35)W(x,y,'K');else F(x,y,d<2.6?'8':'9')});for(const[x,y]of[[10,50],[16,54],[12,55]])Pp(x,y,'v');C.ents.push(po(13,51,'fucina@1',{st:'dun'}));
    // il santuario con le bandierine, su uno sperone di roccia
    disc(52,9,2.6,(x,y)=>F(x,y,'4'));Pp(51,8,'n');Pp(53,10,'n');Pp(52,9,'a');C.chests.push([53,8,0]);
    // il covo del Drago di Brina: lo scheletro di una bestia, le punte di ghiaccio, il tesoro
    disc(10,21,5.6,(x,y,d)=>F(x,y,d<4.5?'3':''));for(const[x,y]of[[6,17],[14,17],[6,25],[14,25],[5,21]])W(x,y,'G');
    for(const[x,y,c]of[[8,18,'r'],[9,18,'r'],[10,18,'r'],[12,23,'$'],[13,22,'$'],[11,24,'k']])Pp(x,y,c);C.boss=[10,21];C.chests.push([12,20,1]);
    // il sentiero di montagna
    const X0=C.gate[0],Y0=C.gate[1];path([[X0-2,Y0],[50,31],[48,28]],2,'1');path([[50,31],[36,32]],2,'1');path([[36,32],[31,22],[30,16]],2,'1');
    path([[36,32],[30,40],[26,42]],2,'1');path([[26,42],[18,48],[14,51]],2,'1');path([[36,32],[22,26],[13,22]],2,'1');path([[49,21],[51,13],[52,10]],2,'1');
    Pp(37,31,'i');C.reach=[[10,21]]},
  fill(C,x,y){const d=vnz(x,y,9,1),r=vnz(x,y,5,2);
    if(d>.64){M[y][x]=1;DEC[y][x]=DN+(C.rnd()<.8?'N':'K');return}
    if(r>.56&&C.rnd()<.55){M[y][x]=1;DEC[y][x]=DN+(C.rnd()<.88?'F':'Y');return}
    if(C.rnd()<.03){M[y][x]=1;DEC[y][x]=DN+(C.rnd()<.6?'K':'G');return}
    C.F(x,y,r<.3?'7':'')}};
