/* ================= 7.24: VILLAGGI E CITTÀ COSTRUITI CON CRITERIO, E LA GENTE CHE SI MUOVE =================
   I villaggi di Tomorrow non sono più case in cerchio intorno a una fontana: hanno una strada maestra, due vicoli, la piazza
   con la fontana (o il pozzo) e il mercato, le case allineate lungo le strade con la porta sulla via, gli orti e i giardini
   dietro le case, la forgia del fabbro all'aperto, la locanda sulla piazza, i campi e il fienile fuori dal paese.
   Le città sono divise in isolati: viali, strade e cortili interni, la piazza con il tempio in fondo al viale, il mercato
   con le bancarelle, la locanda e la bottega sul viale, la fucina vicino alle porte, il parco con il laghetto.
   LA GENTE SI MUOVE: i paesani vanno in piazza, al mercato, a casa, alla locanda la sera, nei campi; di notte rientrano e la
   mattina escono di nuovo. Le guardie fanno la ronda fra porte e piazza. I mercanti restano al loro banco e richiamano i
   clienti. Chi ti parla si ferma e ti guarda; chi stai raggiungendo ti aspetta. */
const TWLW={prato:['#e0d0b0','#c8b89a','#d8c8a8','#e8dcc0'],bosco:['#8a6a4a','#7a5a3a','#9a7a5a','#a08060'],deserto:['#e8d4aa','#d8c49a','#f0e0c0','#e0c890'],neve:['#7a5a3a','#8a6a4a','#6a4a2a','#9a7a5a'],cenere:['#5a5050','#6a5a50','#4a4040','#706060']};
const TWLR=['#a8402f','#3a5a8a','#4a6a3a','#7a3a2a','#5a4a3a','#8a6a2a','#6a3a8a','#2a4a6a','#9a5a2a'];
const TWGD={prato:['q','q','a','h','o','N','L','b','k','e','j','a'],bosco:['q','a','h','L','L','m','b','k','j','r','N'],deserto:['¢','k','b','x','o','v','L','¢'],neve:['L','m','k','b','r','y','L'],cenere:['d','u','k','L','ℸ','b']};
// strumenti per disegnare un abitato: strade, lotti, case, arredi che non chiudono le porte
function twLayout(C){const{n,ok}=C,ST=new Uint8Array(n*n),TK=new Uint8Array(n*n),DR=[];
  const L={ST,TK,DR,
    st:(x,y)=>ok(x,y)&&ST[y*n+x]>0,
    street(x,y,c){if(!ok(x,y)||M[y][x]===3)return;C.F(x,y,c||'4');ST[y*n+x]=c==='1'?2:1;TK[y*n+x]=0},
    free:(x,y)=>ok(x,y)&&!ST[y*n+x]&&!TK[y*n+x]&&M[y][x]===0,
    take(x,y,w,h){for(let v=y;v<y+(h||1);v++)for(let u=x;u<x+(w||1);u++)if(ok(u,v))TK[v*n+u]=1},
    nearDoor(x,y){for(const d of DR)if(Math.abs(d[0]-x)<=1&&Math.abs(d[1]-y)<=1)return true;return false},
    // un arredo su una casella libera (non davanti a una porta)
    deco(x,y,c){if(!L.free(x,y)||L.nearDoor(x,y))return false;M[y][x]=6;DEC[y][x]=c;C.res(x,y);TK[y*n+x]=1;return true},
    // un arredo dove serve, anche sulla strada
    put(x,y,c){if(!ok(x,y)||M[y][x]===3)return;M[y][x]=6;DEC[y][x]=c;C.res(x,y);ST[y*n+x]=0;TK[y*n+x]=1},
    house(b,i,kind){twHouse(b,i,C.rx,C.ry,kind);L.take(b.x,b.y,b.w,b.h);if(b.dx!=null){const dy=b.y+b.h;DR.push([b.dx,dy]);TK[dy*n+b.dx]=1}return b},
    // un edificio senza porta (fienile, magazzino)
    barn(b){for(let v=b.y;v<b.y+b.h;v++)for(let u=b.x;u<b.x+b.w;u++)if(!ok(u,v)||!L.free(u,v))return null;const k=TB.push(b)-1;
      for(let v=b.y;v<b.y+b.h;v++)for(let u=b.x;u<b.x+b.w;u++){M[v][u]=3;DEC[v][u]='';BM[v][u]=k;TK[v*n+u]=1;C.res(u,v)}return b}};
  return L}
// i lotti: una fila di case con la porta sulla strada che passa davanti (le porte guardano sempre a sud-ovest, verso chi guarda)
function twLots(C,L,o){const out=[],inA=o.inA||(()=>true),bld=(x,y)=>inA(x,y)&&L.free(x,y);
  for(let y=o.y0;y<=o.y1;y++){let x=o.x0;while(x<=o.x1){if(!(bld(x,y)&&L.st(x,y+1))){x++;continue}
      let w=C.rr(o.wmin,o.wmax),ww=0;while(ww<w&&x+ww<=o.x1&&bld(x+ww,y)&&L.st(x+ww,y+1))ww++;if(ww<o.wmin){x+=ww+1;continue}w=ww;
      const h=C.rr(o.hmin,o.hmax);let d=0;while(d<h){let ok2=true;for(let u=x;u<x+w;u++)if(!bld(u,y-d)){ok2=false;break}if(!ok2)break;d++}
      if(d<o.hmin){x++;continue}const lot={x,y:y-d+1,w,h:d};out.push(lot);L.take(lot.x,lot.y,w,d);x+=w+(o.gap==null?1:o.gap)}}
  return out}
const twGround=bio=>bio==='deserto'?'2':bio==='neve'?'':bio==='cenere'?'9':'2';
// i sentieri tracciati verso il centro della regione si tolgono: li ridisegna l'abitato partendo dalle sue strade
function twUntrail(C){const{n,rx,ry,bio,RS}=C;for(let i=0;i<n*n;i++)if(RS[i]){const x=i%n,y=i/n|0,[m,c]=twBase(rx*n+x,ry*n+y,bio);M[y][x]=m;DEC[y][x]=m===2?'':m===0?(c?DN+c:''):DN+c+(bio==='cenere'?'8':'');RS[i]=0}}
function twRetrail(C,froms){const{n,rx,ry,ok,trail}=C,ends=[[n-1,twEdgeY(rx,ry)],[0,twEdgeY(rx-1,ry)],[twEdgeX(rx,ry),n-1],[twEdgeX(rx,ry-1),0]];
  ends.forEach((e,i)=>{trail(froms[i],e,2);for(let k=-1;k<=1;k++){const X=e[0]===0||e[0]===n-1?e[0]:clamp(e[0]+k,0,n-1),Y=e[1]===0||e[1]===n-1?e[1]:clamp(e[1]+k,0,n-1);if(ok(X,Y)&&M[Y][X]!==4){M[Y][X]=0;DEC[Y][X]=DN+'1'}}});return ends}
// orti, giardini e cortili: arredi radi, mai sulle strade né davanti alle porte
function twGardens(C,L,x0,y0,x1,y1,inA,p){const{bio,rnd}=C,G=TWGD[bio]||TWGD.prato;
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){if(inA&&!inA(x,y))continue;if(!L.free(x,y))continue;
    const nearSt=[[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>L.st(x+a,y+b));if(nearSt&&rnd()<.85)continue;if(rnd()<(p||.3))L.deco(x,y,G[Math.floor(rnd()*G.length)])}}

/* ---- il villaggio ---- */
function twVillage(C){const{F,rnd,rr,n,rx,ry,bio,tg,ok,z,hub}=C;twUntrail(C);
  const cx=clamp(hub[0],22,n-23),cy=clamp(hub[1],20,n-22);hub[0]=cx;hub[1]=cy;
  const AX=18,AY=16,inV=(x,y)=>((x-cx)/AX)**2+((y-cy)/AY)**2<=1,gr=twGround(bio);
  for(let y=cy-AY;y<=cy+AY;y++)for(let x=cx-AX;x<=cx+AX;x++)if(ok(x,y)&&inV(x,y))F(x,y,gr);
  const L=twLayout(C),S=(x,y,c)=>{if(inV(x,y))L.street(x,y,c)};
  // la strada maestra, due vicoli, la via che attraversa il paese da nord a sud, la piazza lastricata
  for(let x=cx-AX;x<=cx+AX;x++)for(const d of[3,4])S(x,cy+d,'1');
  for(let x=cx-15;x<=cx+15;x++)for(const d of[-7,-6,10,11])S(x,cy+d,'1');
  for(let y=cy-AY;y<=cy+AY;y++)for(const d of[0,1])S(cx+d,y,'1');
  for(let y=cy-5;y<=cy+2;y++)for(let x=cx-6;x<=cx+7;x++)S(x,y,'4');
  // la fontana (o il pozzo, dove l'acqua è poca), le panchine, i lampioni agli angoli
  if(bio==='prato'||bio==='bosco'){for(let y=cy-3;y<=cy;y++)for(let x=cx-1;x<=cx+2;x++)L.put(x,y,'ɸ');for(let y=cy-2;y<=cy-1;y++)for(let x=cx;x<=cx+1;x++){M[y][x]=2;DEC[y][x]=''}}
  else{L.put(cx,cy-2,bio==='deserto'?'ʬ':'W');L.put(cx+1,cy-2,'b')}
  for(const[x,y]of[[cx-6,cy-5],[cx+7,cy-5],[cx-6,cy+2],[cx+7,cy+2]])L.put(x,y,bio==='cenere'?'ł':'l');
  for(const[x,y]of[[cx-3,cy+1],[cx+4,cy+1]])L.put(x,y,'n');
  // il mercato: due banchi sul lato nord della piazza, con chi vende dietro
  L.put(cx-5,cy-4,'ʍ');L.put(cx-4,cy-4,'H');L.put(cx+5,cy-4,'s');L.put(cx+6,cy-4,'ʍ');L.put(cx-3,cy-4,'k');L.put(cx+4,cy-4,'b');
  L.take(cx-5,cy-5,1,1);L.take(cx+5,cy-5,1,1);
  // la locanda sul vicolo nord, davanti alla piazza
  const inn=L.house({x:cx+2,y:cy-11,w:5,h:4,wall:TWLW[bio][0],roof:'#7a3a2a',ht:32,smoke:1},0,'locanda');
  L.put(cx+7,cy-8,'b');
  // la forgia del fabbro, all'aperto, dietro la piazza
  const fg=[cx-10,cy-3];L.take(fg[0]-1,fg[1]-2,4,3);L.put(fg[0]-1,fg[1]-1,'ȼ');L.put(fg[0],fg[1]-1,'A');L.put(fg[0]+1,fg[1]-1,'w');L.put(fg[0]+2,fg[1]-1,'L');
  // le case: in fila lungo le strade, con la porta sulla via
  const lots=twLots(C,L,{x0:cx-AX,x1:cx+AX,y0:cy-AY,y1:cy+AY,hmin:3,hmax:4,wmin:3,wmax:5,gap:1,inA:inV});
  const WL=TWLW[bio]||TWLW.prato;let hi=1;
  for(const lot of lots){for(let v=lot.y;v<lot.y+lot.h;v++)for(let u=lot.x;u<lot.x+lot.w;u++)L.TK[v*n+u]=0;if(rnd()<.12){twGardens(C,L,lot.x,lot.y,lot.x+lot.w-1,lot.y+lot.h-1,null,.5);continue}
    L.house({x:lot.x,y:lot.y,w:lot.w,h:lot.h,wall:WL[hi%WL.length],roof:TWLR[Math.floor(rnd()*TWLR.length)],ht:20+rr(0,8)+(lot.h>3?4:0),smoke:rnd()<.5?1:0},hi++)}
  // un vaso di fiori o una botte accanto alle porte, i lampioni lungo la strada maestra
  for(let x=cx-15;x<=cx+15;x+=6)for(const y of[cy+5,cy-5])if(Math.abs(x-cx)>7&&L.free(x,y)&&!L.nearDoor(x,y))L.deco(x,y,bio==='cenere'?'ł':'l');
  // il fienile fuori dal paese
  const bx=cx+(rnd()<.5?7:-12);L.barn({x:bx,y:cy+13,w:5,h:3,wall:bio==='neve'?'#6a4a2a':'#9a4a32',roof:'#5a3a2a',ht:30});
  // i campi a nord e a sud, a strisce, con i sentieri in mezzo e qualche spaventapasseri
  const crop=bio==='deserto'?['v','v','¢']:bio==='neve'?null:bio==='cenere'?null:['g','g','q','v'];
  for(const[ya,yb]of[[cy-AY,cy-12],[cy+12,cy+AY]])for(let x=cx-AX;x<=cx+AX;x++){if(x===cx||x===cx+1)continue;const col=((x-cx+40)%6);
    for(let y=ya;y<=yb;y++){if(!inV(x,y)||!L.free(x,y))continue;if(col===0){F(x,y,'1');L.take(x,y);continue}
      if(crop){const pl=Math.floor((x-cx+40)/6),c=crop[(pl+(y<cy?1:0))%crop.length];if(y===ya||y===yb){if(rnd()<.6)L.deco(x,y,'f')}else L.deco(x,y,c)}
      else if(rnd()<.18)L.deco(x,y,bio==='neve'?(rnd()<.5?'L':'y'):(rnd()<.5?'u':'d'))}}
  for(const y of[cy-14,cy+14]){const x=cx+(rnd()<.5?-8:9);if(ok(x,y)&&M[y][x]===6){DEC[y][x]=crop?'E':'y'}}
  // orti e giardini dietro le case
  twGardens(C,L,cx-AX,cy-11,cx+AX,cy+9,inV,.28);
  // la gente: l'anziano accanto alla bacheca, chi vende al banco, il fabbro alla forgia, l'oste alla locanda, i paesani in giro
  const pos=[[cx+3,cy],[cx-5,cy-5],[fg[0],fg[1]],[cx-2,cy-1],null,[cx+5,cy-5],[cx-4,cy+3],[cx+6,cy+4],[cx+2,cy+10]];
  for(let i=0;i<9;i++){if(i===4&&inn.to)continue;const id=twNpcId(rx,ry,i);twNpc(id);const p=pos[i]||[cx+1,cy-6],[x,y]=(i===1||i===5||i===2)?p:nearFree(p[0],p[1]);const e=mkNpc(id,x,y);if(i===1||i===5||i===2)e.lfStay=1;ents.push(e)}
  for(let j=0;j<3;j++){const id='tr_'+twEnc(rx)+'_'+twEnc(ry)+'_'+(200+j);twResident(id);const[x,y]=nearFree(cx-12+j*10,cy+4);ents.push(mkNpc(id,x,y))}
  {const[x,y]=nearFree(cx+3,cy-1);ents.push({k:'owb',n:'Bacheca dei Contratti',px:x+.5,py:y+.5});tg.push([x,y])}
  tg.push([fg[0],fg[1]]);
  // i sentieri ripartono dalle strade del paese
  twRetrail(C,[[cx+AX,cy+3],[cx-AX,cy+3],[cx,cy+AY],[cx,cy-AY]]);
  twLifeMark(C,L,{pl:[cx-6,cy-5,cx+7,cy+2],mk:[[cx-5,cy-3],[cx-4,cy-3],[cx+5,cy-3],[cx+6,cy-3]],inn:inn.dx!=null?[[inn.dx,inn.y+inn.h]]:[],fi:[[cx-AX,cy-AY,cx+AX,cy-12],[cx-AX,cy+12,cx+AX,cy+AY]]});
  return[cx-3,cy+1]}

/* ---- la città ---- */
function twCityGen(C){const{F,rnd,rr,n,hub,rx,ry,bio,tg,ok}=C;let[cx,cy]=hub;const RR=25;cx=clamp(cx,RR+4,n-RR-5);cy=clamp(cy,RR+4,n-RR-5);C.hub[0]=cx;C.hub[1]=cy;
  const x0=cx-RR,x1=cx+RR,y0=cy-RR,y1=cy+RR,isTrail=(x,y)=>ok(x,y)&&(DEC[y][x]===DN+'1'||M[y][x]===4);
  // le strade che arrivano da fuori segnano le porte
  const gates=[];for(let x=x0;x<=x1;x++)for(const y of[y0,y1])if(isTrail(x,y))gates.push([x,y]);for(let y=y0;y<=y1;y++)for(const x of[x0,x1])if(isTrail(x,y))gates.push([x,y]);
  const nearGate=(x,y)=>gates.some(g=>Math.abs(g[0]-x)+Math.abs(g[1]-y)<=1);
  const base=bio==='deserto'?'2':bio==='neve'?'':bio==='cenere'?'9':'';
  for(let y=y0-2;y<=y1+2;y++)for(let x=x0-2;x<=x1+2;x++){if(!ok(x,y))continue;if(isTrail(x,y)&&(x<x0||x>x1||y<y0||y>y1))continue;F(x,y,base)}
  const L=twLayout(C),inC=(x,y)=>x>x0&&x<x1&&y>y0&&y<y1,S=(x,y,c)=>{if(inC(x,y))L.street(x,y,c)};
  const inPl=(x,y)=>Math.abs(x-cx)<=6&&Math.abs(y-cy)<=6,inTem=(x,y)=>x>=cx-3&&x<=cx+3&&y>=cy-11&&y<=cy-7;
  // i viali (il viale nord finisce davanti al tempio), le strade, la circonvallazione dentro le mura, la piazza
  for(let t=x0+1;t<x1;t++)for(const d of[-1,0,1])S(t,cy+d);
  for(let t=y0+1;t<y1;t++){if(t>=cy-11&&t<cy-6)continue;for(const d of[-1,0,1])S(cx+d,t)}
  for(const o of[-13,-12,12,13])for(let t=x0+1;t<x1;t++){S(t,cy+o);S(cx+o,t)}
  for(let t=x0+1;t<x1;t++){S(t,y0+1);S(t,y1-1);S(x0+1,t);S(x1-1,t)}
  for(let y=cy-6;y<=cy+6;y++)for(let x=cx-6;x<=cx+6;x++)S(x,y);
  // gli isolati: una fila di case sulla strada, un cortile in mezzo, una fila di case che si affaccia sul cortile
  const BD=[[-23,-14],[-11,-2],[2,11],[14,23]],corners=[[0,0],[3,0],[0,3],[3,3]],park=corners[Math.floor(rnd()*4)];
  const blk=(i,j)=>({x0:cx+BD[i][0],x1:cx+BD[i][1],y0:cy+BD[j][0],y1:cy+BD[j][1]});
  for(let j=0;j<4;j++)for(let i=0;i<4;i++){if(i===park[0]&&j===park[1])continue;const b=blk(i,j),yc=b.y0+4;for(let x=b.x0;x<=b.x1;x++)if(!inPl(x,yc)&&!inTem(x,yc)&&!inPl(x,yc+1))S(x,yc,'1')}
  // la fontana con le statue, i lampioni, le panchine, gli stendardi davanti al tempio
  for(let y=cy-1;y<=cy;y++)for(let x=cx-1;x<=cx;x++){M[y][x]=2;DEC[y][x]='';L.ST[y*n+x]=0;L.TK[y*n+x]=1}
  for(let y=cy-2;y<=cy+1;y++)for(let x=cx-2;x<=cx+1;x++)if(M[y][x]!==2)L.put(x,y,'ɸ');
  for(const[x,y]of[[cx-6,cy-6],[cx+6,cy-6],[cx-6,cy+6],[cx+6,cy+6]])L.put(x,y,'l');
  for(const[x,y]of[[cx-4,cy-4],[cx+3,cy-4]])L.put(x,y,rnd()<.5?'Y':'Б');
  for(const[x,y]of[[cx-4,cy+1],[cx+3,cy+1],[cx-4,cy-2],[cx+3,cy-2]])L.put(x,y,'n');
  for(const[x,y]of[[cx-2,cy-6],[cx+2,cy-6]])L.put(x,y,rnd()<.5?'Ŧ':'§');
  // il mercato nella metà sud della piazza
  const MK=[[cx-6,'ʍ'],[cx-5,'H'],[cx-3,'s'],[cx+3,'s'],[cx+5,'ʍ'],[cx+6,'H']];for(const[x,c]of MK)L.put(x,cy+4,c);L.put(cx-4,cy+5,'k');L.put(cx+4,cy+5,'b');
  for(const x of[cx-5,cx-3,cx+3,cx+5])L.take(x,cy+3,1,1);
  // le mura, con le torri agli angoli e le porte dove passano le strade
  const wallC=bio==='deserto'?['#d8c49a','#c8b48a']:bio==='neve'?['#9aa2ac','#7a828c']:bio==='cenere'?['#5a5252','#4a4242']:['#9a968c','#7a766c'];
  const wall=(x,y,ht)=>{if(!ok(x,y)||nearGate(x,y))return;const k=TB.push({x,y,w:1,h:1,wall:wallC[0],roof:wallC[1],ht:ht||30})-1;M[y][x]=3;DEC[y][x]='';BM[y][x]=k};
  for(let x=x0;x<=x1;x++){wall(x,y0);wall(x,y1)}for(let y=y0+1;y<y1;y++){wall(x0,y);wall(x1,y)}
  for(const[tx,ty]of[[x0-1,y0-1],[x1-1,y0-1],[x0-1,y1-1],[x1-1,y1-1]]){const k=TB.push({x:tx,y:ty,w:3,h:3,wall:wallC[0],roof:wallC[1],ht:46})-1;for(let y=ty;y<ty+3;y++)for(let x=tx;x<tx+3;x++)if(ok(x,y)){M[y][x]=3;DEC[y][x]='';BM[y][x]=k}}
  for(const[gx,gy]of gates){for(const[a,b]of[[-2,0],[2,0],[0,-2],[0,2]]){const x=gx+a,y=gy+b;if(ok(x,y)&&M[y][x]===0&&!isTrail(x,y)&&!(x>x0&&x<x1&&y>y0&&y<y1)){M[y][x]=6;DEC[y][x]=rnd()<.5?'Ŧ':'§';break}}}
  C.z.gates=gates.map(g=>g.slice());C.z.walls=[x0,y0,x1,y1];
  // il parco: alberi, aiuole, il laghetto, panchine e una statua
  {const b=blk(park[0],park[1]);for(let y=b.y0;y<=b.y1;y++)for(let x=b.x0;x<=b.x1;x++)if(L.free(x,y))F(x,y,bio==='deserto'?'6':'2');
    const mx=(b.x0+b.x1)>>1,my=(b.y0+b.y1)>>1;for(let x=b.x0;x<=b.x1;x++)S(x,my,'1');for(let y=b.y0;y<=b.y1;y++)S(mx,y,'1');
    for(let y=my-3;y<=my-2;y++)for(let x=mx+2;x<=mx+4;x++)if(ok(x,y)){M[y][x]=2;DEC[y][x]='';L.TK[y*n+x]=1}
    L.deco(mx-2,my-2,'Б');L.deco(mx-1,my+1,'n');L.deco(mx+1,my-1,'n');L.deco(mx+1,my+1,'l');L.deco(mx-1,my-1,'l');
    const T=bio==='deserto'?['¢','o','h']:bio==='neve'?['r','r','m']:bio==='cenere'?['d','ℸ','u']:['r','a','o','e','h','r'];
    for(let y=b.y0;y<=b.y1;y++)for(let x=b.x0;x<=b.x1;x++)if(L.free(x,y)&&rnd()<.45)L.deco(x,y,T[Math.floor(rnd()*T.length)]);L.take(b.x0,b.y0,b.x1-b.x0+1,b.y1-b.y0+1)}
  // gli edifici della città nei posti giusti
  const roofs=TWLR,walls=bio==='deserto'?['#e8d4aa','#d8c49a','#f0e0c0']:bio==='cenere'?['#6a5a50','#5a5050','#7a6a60']:['#e0d0b0','#c8b89a','#d8c8a8','#e8d8c0'];
  let hi=101;const SP=[['tempio',{x:cx-3,y:cy-11,w:7,h:5,wall:'#f0ece0',roof:'#d4af37',ht:42,st:'tem'}],['locanda',{x:cx-11,y:cy-5,w:5,h:4,ht:34,smoke:1}],['bottega',{x:cx+7,y:cy-5,w:5,h:4,ht:32}],
    ['fucina',{x:cx+15,y:cy-5,w:5,h:4,ht:30,smoke:1,wall:'#a89a8a',roof:'#4a4a4a'}]];if(twCityGem(rx,ry))SP.push(['gemme',{x:cx+4,y:cy-10,w:3,h:4,wall:'#b8b0d8',roof:'#5a3a8a',ht:36}]);
  for(const[k,b]of SP){for(let v=b.y;v<b.y+b.h;v++)for(let u=b.x;u<b.x+b.w;u++)if(ok(u,v)&&L.ST[v*n+u])L.ST[v*n+u]=0;b.wall=b.wall||walls[hi%walls.length];b.roof=b.roof||roofs[Math.floor(rnd()*roofs.length)];L.house(b,hi++,k)}
  {const f=SP[3][1];L.deco(f.x+f.w,f.y+f.h-1,'A');L.deco(f.x-1,f.y+f.h-1,'w')}
  const lots=twLots(C,L,{x0:x0+2,x1:x1-2,y0:y0+2,y1:y1-2,hmin:3,hmax:4,wmin:3,wmax:5,gap:1});
  for(const lot of lots){if(rnd()<.14){for(let v=lot.y;v<lot.y+lot.h;v++)for(let u=lot.x;u<lot.x+lot.w;u++)L.TK[v*n+u]=0;twGardens(C,L,lot.x,lot.y,lot.x+lot.w-1,lot.y+lot.h-1,null,.45);continue}
    for(let v=lot.y;v<lot.y+lot.h;v++)for(let u=lot.x;u<lot.x+lot.w;u++)L.TK[v*n+u]=0;
    L.house({x:lot.x,y:lot.y,w:lot.w,h:lot.h,wall:walls[hi%walls.length],roof:roofs[Math.floor(rnd()*roofs.length)],ht:24+rr(0,10)+(lot.h>3?4:0),smoke:rnd()<.3?1:0},hi++)}
  // i cortili, gli alberi lungo la piazza, i lampioni agli incroci
  twGardens(C,L,x0+2,y0+2,x1-2,y1-2,null,.22);
  for(let x=cx-6;x<=cx+6;x++)if(x<cx-1||x>cx+1)L.deco(x,cy+7,x%3?'r':'l');
  for(const a of[-14,-11,-2,2,11,14])for(const b of[-14,-11,-2,2,11,14]){const x=cx+a,y=cy+b;if(L.free(x,y)&&!L.nearDoor(x,y)&&!inPl(x,y))L.deco(x,y,'l')}
  // la gente: l'anziano alla bacheca, l'erborista e i mercanti al banco, le guardie di ronda, i cittadini a passeggio
  {const id=twNpcId(rx,ry,0);twNpc(id);const[x,y]=nearFree(cx-5,cy-5);ents.push(mkNpc(id,x,y))}
  {const id=twNpcId(rx,ry,5);twNpc(id);const e=mkNpc(id,cx+3,cy+3);e.lfStay=1;ents.push(e)}
  [[cx-5,0],[cx-3,1],[cx+5,2]].forEach(([x,k])=>{const id=twVendor(rx,ry,k);const e=mkNpc(id,x,cy+3);e.lfStay=1;e.sh=NPCS[id].sh;e.nsh=t+2+Math.random()*6;ents.push(e)});
  for(let i=6;i<9;i++){const id=twNpcId(rx,ry,i);twNpc(id);const[x,y]=nearFree(cx+rr(-5,5),cy+rr(2,6));ents.push(mkNpc(id,x,y))}
  for(let i=10;i<14;i++){const id=twNpcId(rx,ry,i);twNpc(id);const g=gates[(i-10)%Math.max(1,gates.length)]||[cx,cy+8];const[x,y]=nearFree(clamp(g[0]+Math.sign(cx-g[0])*3,1,n-2),clamp(g[1]+Math.sign(cy-g[1])*3,1,n-2));ents.push(mkNpc(id,x,y))}
  for(let i=14;i<22;i++){const id=twNpcId(rx,ry,i);twNpc(id);const[x,y]=nearFree(cx+rr(-14,14),cy+rr(-14,14));ents.push(mkNpc(id,x,y))}
  {const[x,y]=nearFree(cx-6,cy-5);ents.push({k:'owb',n:'Bacheca dei Contratti',px:x+.5,py:y+.5});tg.push([x,y])}
  for(const g of gates)tg.push(g);
  // la ronda: dalle porte alla piazza, lungo le mura
  const pat=[];for(const g of gates)pat.push([clamp(g[0]+Math.sign(cx-g[0])*2,1,n-2),clamp(g[1]+Math.sign(cy-g[1])*2,1,n-2)]);
  pat.push([x0+1,y0+1],[x1-1,y0+1],[x1-1,y1-1],[x0+1,y1-1],[cx-5,cy+6],[cx+5,cy-1],[cx-13,cy],[cx+13,cy]);
  twLifeMark(C,L,{pl:[cx-6,cy-6,cx+6,cy+6],mk:[[cx-6,cy+5],[cx-5,cy+5],[cx-3,cy+5],[cx+3,cy+5],[cx+5,cy+5],[cx+6,cy+5]],inn:L.DR.slice(1,2),pat,fi:[]});
  return[cx,cy+7]}
// i mercanti delle bancarelle in città: nome, merce e richiami sempre uguali per la stessa città
const TWVEN=[['Fruttivendolo','Fruttivendola',['Mele e pere del contado!','Frutta fresca, di stamattina!','Assaggia, assaggia!'],'#c0392b','#f4e4c0'],
  ['Fornaio','Fornaia',['Pane caldo!','Focacce, ciambelle, pagnotte!','Il pane più buono delle terre nuove!'],'#c8783a','#f4f0e0'],
  ['Pescivendolo','Pescivendola',['Pesce fresco del fiume!','Trote e lucci, prendete!','Pescato all\'alba!'],'#2980b9','#2a4a6a'],
  ['Tessitore','Tessitrice',['Stoffe colorate, mantelli caldi!','La lana più morbida della regione!'],'#8a3a8a','#e8d8f0']];
function twVendor(rx,ry,k){const id='tm_'+twEnc(rx)+'_'+twEnc(ry)+'_'+k;if(NPCS[id])return id;const r=twRnd('ven',rx,ry,k),j=(k+twHs('vv',rx,ry))%TWVEN.length,V=TWVEN[j],nm=TWNM[(twHs('vnm2',rx,ry)+k*5)%TWNM.length],fem=/a$|e$/.test(nm)&&!['Ettore','Sandro'].includes(nm);
  NPCS[id]={n:V[fem?1:0]+' '+nm,c:V[3],hat:V[4],tw2:'ven',ln:[`Il mio banco è qui da quando la città ha le mura. ${V[2][0]}`,'Al mercato si sa tutto prima che lo sappia il Consiglio: chiedi pure.','D\'inverno le strade sono vuote, ma il banco resta aperto. Sempre.'],sh:V[2]};void r;return id}
// i luoghi dove va la gente (salvati nella zona, insieme alla zona)
function twLifeMark(C,L,o){const{n}=C,W=(x,y)=>x>0&&y>0&&x<n-1&&y<n-1&&WK(M[y][x]),pl=[],st=[],fi=[];
  if(o.pl){const[a,b,c,d]=o.pl;for(let y=b;y<=d;y++)for(let x=a;x<=c;x++)if(W(x,y))pl.push([x,y])}
  for(let i=0;i<n*n;i+=3)if(L.ST[i]){const x=i%n,y=i/n|0;if(W(x,y))st.push([x,y])}
  for(const[a,b,c,d]of o.fi||[])for(let y=b;y<=d;y++)for(let x=a;x<=c;x++)if(W(x,y)&&DEC[y][x]===DN+'1')fi.push([x,y]);
  C.z.lf={pl,st,fi,dr:L.DR.filter(([x,y])=>W(x,y)),mk:(o.mk||[]).filter(([x,y])=>W(x,y)),inn:(o.inn||[]).filter(([x,y])=>W(x,y)),pat:(o.pat||[]).filter(([x,y])=>W(x,y))}}

/* ---- la vita: chi va dove, a che ora ---- */
const LF={k:null,sl:[],t:0};
function lfKind(e){if(e.k!=='npc'||!e.nid||ANM[e.nid])return null;if(e.lfStay)return'stay';const d=NPCS[e.nid]||{},r=d.tw2;
  if(r==='ven'||r==='mer'||r==='alc'||r==='fab'||r==='gem')return'stay';if(r==='gua2')return'guard';if(/^t[vr]_/.test(e.nid))return'walk';return null}
function lfInit(){LF.k=Zk;LF.sl=[];LF.t=0;const L=ZZ&&ZZ.lf;if(!L)return;
  for(const e of ents){const k=lfKind(e);if(!k)continue;e.lf=k;e.wd=0;e.wg=0;e.path=[];e.wt=1e9;e.go=k==='stay'?0:1;e.lt=Math.random()*3;
    if(k==='walk'&&L.dr.length){e.hm=L.dr[(hs(e.nid)>>>0)%L.dr.length]}if(k==='guard')e.pi=(hs(e.nid)>>>0)%Math.max(1,L.pat.length)}
  // chi è già a casa all'ora del caricamento non si vede
  const h=gHour();if(h>=22||h<5.5)for(const e of ents.slice())if(e.lf==='walk'&&e.hm&&Math.random()<.85){ents.splice(ents.indexOf(e),1);LF.sl.push(e);e.back=0}}
const lfRnd=a=>a&&a.length?a[Math.floor(Math.random()*a.length)]:null;
function lfPick(L,e){const h=gHour(),eve=h>=18.5,day=h>=7&&h<19,r=Math.random();
  if(eve&&L.inn.length&&r<.45)return lfRnd(L.inn);
  if(day&&L.mk.length&&r<.22)return lfRnd(L.mk);
  if(r<.55&&L.pl.length)return lfRnd(L.pl);
  if(r<.68&&L.fi.length&&day)return lfRnd(L.fi);
  if(r<.8&&e.hm)return e.hm;
  if(r<.88&&L.dr.length)return lfRnd(L.dr);
  return lfRnd(L.st)||lfRnd(L.pl)}
function lfTick(dt){if(!twOn()||!ZZ||!ZZ.lf||!String(Zk).startsWith('tw:')){LF.k=null;return}if(LF.k!==Zk)lfInit();const L=ZZ.lf;
  for(const e of ents)if(e.lf&&e.sh&&t>e.nsh&&dist(e,P)<10){e.nsh=t+7+Math.random()*8;flt(e,e.sh[Math.floor(Math.random()*e.sh.length)],'#fff6d8')}
  if((LF.t-=dt)>0)return;LF.t=.25;const h=gHour(),night=h>=21.5||h<5.5;let np=0;
  for(const e of ents.slice()){if(!e.lf)continue;
    // chi ti parla si ferma e ti guarda, chi stai raggiungendo ti aspetta
    if((PA===e&&PM==='npc')||(P.tg===e&&dist(e,P)<4)){e.path=[];e.lt=2.5;e.fc=faceOf(P.px-e.px,P.py-e.py);continue}
    if(e.lf==='stay'||e.path.length)continue;if((e.lt-=.25)>0)continue;
    if(e.lf==='walk'&&e.hm&&e.lh&&Math.abs(e.px-e.hm[0]-.5)<1.2&&Math.abs(e.py-e.hm[1]-.5)<1.2&&dist(e,P)>2){
      // rientra in casa: di notte fino al mattino, di giorno per un po'
      e.lh=0;const i=ents.indexOf(e);if(i>=0)ents.splice(i,1);e.back=night?0:t+15+Math.random()*40;LF.sl.push(e);if(dist(e,P)<8)tone(220,.06,'triangle',.015);continue}
    if(np>=4)continue;np++;let tg=null;
    if(e.lf==='guard'){if(!L.pat.length)continue;e.pi=(e.pi+1)%L.pat.length;tg=L.pat[e.pi];e.lt=1+Math.random()*3}
    else if(night&&e.hm){tg=e.hm;e.lh=1;e.lt=.3}
    else{tg=lfPick(L,e);e.lh=tg===e.hm?(Math.random()<.5?1:0):0;e.lt=3+Math.random()*9}
    if(tg){const p=path(e.px|0,e.py|0,tg[0],tg[1]);if(p.length)e.path=p.slice(0,160);else{e.lt=1.5;e.lh=0}}}
  for(const e of LF.sl.slice()){if(night||(e.back&&t<e.back))continue;if(Math.random()>.08)continue;LF.sl.splice(LF.sl.indexOf(e),1);const d=e.hm||[e.px|0,e.py|0];e.px=d[0]+.5;e.py=d[1]+.5;e.path=[];e.lt=.5;e.lh=0;ents.push(e)}}
const _upd724=upd;upd=function(dt){_upd724(dt);if(started&&twOn())lfTick(dt)};
// nelle case di Tomorrow chi ci abita si muove per le stanze
const _loadPost724=loadPost;loadPost=function(k){_loadPost724(k);if(!twOn())return;if(String(k).startsWith('tw:')){if(ZZ&&ZZ.lf)lfInit();else LF.k=null;return}if(!String(k).startsWith('twi:'))return;for(const e of ents)if(e.k==='npc'&&/^tr_/.test(e.nid||'')){e.wd=1;e.wg=1;e.wt=1+Math.random()*4;e.path=[]}};
// parlando con chi passeggia non serve rincorrerlo
const _act724=act;act=function(e){if(e&&e.lf){e.path=[];e.lt=4}_act724(e)};
