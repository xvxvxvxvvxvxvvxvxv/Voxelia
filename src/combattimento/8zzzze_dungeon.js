/* ================= 7.55: I DUNGEON, OGNUNO UN'ALTRA DIMENSIONE =================
   Prima i dungeon erano stanze rettangolari tutte uguali, con qualche arredo sparso. Ora ogni dungeon ha il suo stile:
   - le stanze hanno forme diverse secondo il dungeon (rotonde nelle caverne e nelle grotte di ghiaccio, sale a colonne nella
     cripta e nella piramide, ottagoni e anelli sospesi sul nulla nella Cittadella...);
   - ogni stanza ha un compito, con gli arredi del suo bioma: l'accampamento dei goblin e la fungaia nella Tana, l'ossario e
     la cappella nella Cripta, la sala degli dei e il tesoro nella Piramide, il giardino di cristallo e il lago gelato nelle
     Caverne, la fucina e i fiumi di magma nella Fucina, il relitto e il corallo nell'Abisso, la biblioteca che galleggia e
     l'osservatorio stellare nella Cittadella, le statue e le vasche nel Tempio di Giada;
   - il pavimento cambia da stanza a stanza (geroglifici, lastre spaccate, ghiaccio lucido, sabbia, basalto con le crepe di
     lava, un cielo di stelle);
   - sopra le stanze galleggiano pezzi di un'altra dimensione: isole di roccia, schegge, rune che girano, piramidi rovesciate;
   - la stanza del boss (o della scala) è un santuario: colonne in cerchio, il varco dimensionale e le rune sul pavimento.
   La mappa resta la stessa per tutti i giocatori della stanza (si genera con lo stesso seme). */
const DS55={
  cave:{sh:['round','round','rect','cross'],ty:['accampamento','fungaia','deposito','tana','miniera'],c:'#ffb04a',fl:'dirt'},
  crypt:{sh:['hall','rect','cross','octa'],ty:['ossario','cappella','sarcofagi','biblioteca','prigione'],c:'#9fd0ff',fl:'slab'},
  pyr:{sh:['hall','rect','octa','cross'],ty:['dei','tesoro','geroglifici','trappole','sarcofago'],c:'#ffd060',fl:'hier'},
  ice:{sh:['round','ring','round','rect'],ty:['giardino','lago','nido','statue','guglie'],c:'#b0f0ff',fl:'frost'},
  fire:{sh:['rect','ring','cross','hall'],ty:['fucina','magma','catene','ossidiana','altare'],c:'#ff6a2a',fl:'basalt'},
  sea:{sh:['round','ring','rect','round'],ty:['corallo','relitto','santuario','alghe','perle'],c:'#6fffe0',fl:'sand'},
  void:{sh:['octa','ring','cross','hall'],ty:['biblioteca','stelle','ponte','rune','specchi'],c:'#c46bff',fl:'stars'},
  jade:{sh:['rect','hall','round'],ty:['statue','giardino','altare','vasche'],c:'#6affc0',fl:'moss'}};
// i nomi delle stanze (si vedono entrando: «Stanza: la fungaia»)
const RN55={accampamento:'l\'accampamento dei goblin',fungaia:'la fungaia',deposito:'il deposito del bottino',tana:'la tana dei ratti',miniera:'la vecchia miniera',ossario:'l\'ossario',cappella:'la cappella sconsacrata',sarcofagi:'la sala dei sarcofagi',biblioteca:'la biblioteca',prigione:'le prigioni',
  dei:'la sala degli dei',tesoro:'la camera del tesoro',geroglifici:'la sala dei geroglifici',trappole:'il corridoio delle trappole',sarcofago:'la tomba del sacerdote',giardino:'il giardino di cristallo',lago:'il lago gelato',nido:'il nido',statue:'la sala delle statue',guglie:'la foresta di guglie',
  fucina:'la fucina dei demoni',magma:'il fiume di magma',catene:'la sala delle catene',ossidiana:'il campo di ossidiana',altare:'l\'altare della fiamma',corallo:'il giardino di corallo',relitto:'il relitto',santuario:'il santuario sommerso',alghe:'la foresta di alghe',perle:'la grotta delle perle',
  stelle:'l\'osservatorio stellare',ponte:'il ponte sul nulla',rune:'la sala delle rune',specchi:'la galleria degli specchi',vasche:'le vasche sacre',ingresso:'l\'ingresso',santuario55:'il santuario'};
let RT55=null,RM55=[],LT55=[],SAN55=null;
const dsOf=z=>{const th=TH[z.th]?z.th:DG[z.dg]&&DG[z.dg].th;return DS55[th]?Object.assign({th},DS55[th]):Object.assign({th:th||'cave'},DS55.cave)};
/* ---- il generatore ---- */
{const g0=genDungeon;genDungeon=function(z){if(!z||!z.dg||z.cava43||z.ed||!DG[z.dg])return g0(z);try{return dgGen55(z)}catch(e){console.warn('dungeon 7.55',e);RT55=null;RM55=[];M.forEach(r=>r.fill(1));for(let y=0;y<N;y++)for(let x=0;x<N;x++)DEC[y][x]='';return g0(z)}}}
function dgShape(r,sh,S){const{x,y,w,h}=r,cx=x+(w-1)/2,cy=y+(h-1)/2,cells=[];
  for(let j=y;j<y+h;j++)for(let i=x;i<x+w;i++){let ok=1;const dx=(i-cx)/(w/2),dy=(j-cy)/(h/2);
    if(sh==='round')ok=dx*dx+dy*dy<=1.05;else if(sh==='octa')ok=Math.abs(i-cx)+Math.abs(j-cy)<=(w+h)/2*.72;else if(sh==='cross')ok=Math.abs(i-cx)<=Math.max(1,w/4)||Math.abs(j-cy)<=Math.max(1,h/4);
    if(ok)cells.push([i,j])}
  for(const[i,j]of cells)M[j][i]=0;
  // l'anello: una fossa (lava, acqua o vuoto) intorno a un'isola, con due ponti a croce
  if(sh==='ring'&&w>=7&&h>=7){const rx=Math.round(r.cx),ry=Math.round(r.cy);for(const[i,j]of cells){const d=Math.max(Math.abs(i-rx),Math.abs(j-ry));if(d>=1&&d<=2&&i!==rx&&j!==ry)M[j][i]=2}r.pit=1}
  return cells}
function dgGen55(z){const d=DG[z.dg],f=z.dn,S=dsOf(z),rooms=[];M.forEach(r=>r.fill(1));RT55=new Array(N*N).fill('');RM55=[];LT55=[];
  for(let n=0;n<420&&rooms.length<12+f*2;n++){const w=ri(6,12),h=ri(6,12),x=ri(2,N-w-2),y=ri(2,N-h-2);
    if(rooms.some(r=>x<r.x+r.w+2&&x+w+2>r.x&&y<r.y+r.h+2&&y+h+2>r.y))continue;rooms.push({x,y,w,h,cx:x+(w>>1),cy:y+(h>>1)})}
  if(rooms.length<3)throw new Error('poche stanze');
  rooms.forEach((r,i)=>{r.sh=i===0?'rect':S.sh[Math.floor(R()*S.sh.length)];if(r.sh==='ring'&&!(TH[S.th]&&TH[S.th].pool))r.sh='octa';r.cells=dgShape(r,r.sh,S)});
  const cor=(a,b,wd)=>{for(let x=Math.min(a.cx,b.cx);x<=Math.max(a.cx,b.cx);x++)for(let k=0;k<wd;k++)if(M[a.cy+k][x]!==0)M[a.cy+k][x]=0;for(let y=Math.min(a.cy,b.cy);y<=Math.max(a.cy,b.cy);y++)for(let k=0;k<wd;k++)if(M[y][b.cx+k]!==0)M[y][b.cx+k]=0};
  for(let i=1;i<rooms.length;i++)cor(rooms[i-1],rooms[i],R()<.3?2:1);
  // qualche anello in più: non si torna sempre indietro per la stessa strada
  for(let i=3;i<rooms.length;i+=3)if(R()<.5)cor(rooms[i-3],rooms[i],1);
  const sp=[rooms[0].cx,rooms[0].cy];let dd=bfs(sp[0],sp[1]);if(rooms.some(r=>dd[r.cy*N+r.cx]<0))throw new Error('stanze isolate');
  let far=rooms[0];for(const r of rooms)if(dd[r.cy*N+r.cx]>dd[far.cy*N+far.cx])far=r;
  // il compito di ogni stanza e i suoi arredi
  const pool=S.ty.slice();rooms.forEach((r,i)=>{r.ty=r===far?'santuario55':i===0?'ingresso':pool[(i+Math.floor(R()*pool.length))%pool.length]});
  for(const r of rooms){const before=[];dgFurnish(z,S,r,before,sp);r.props=before}
  dd=bfs(sp[0],sp[1]);
  // se un arredo chiude il passaggio, si tolgono quelli della stanza che non si raggiunge (e poi tutti, se serve)
  for(let k=0;k<3&&rooms.some(r=>dd[r.cy*N+r.cx]<0);k++){for(const r of rooms){if(k<2&&dd[r.cy*N+r.cx]>=0)continue;for(const[x,y]of r.props){M[y][x]=0;DEC[y][x]=''}r.props=[]}dd=bfs(sp[0],sp[1])}
  // i pavimenti delle stanze
  SAN55=[far.x+(far.w-1)/2,far.y+(far.h-1)/2];for(const r of rooms){const fl=dgFloor(S,r.ty);if(fl)for(const[i,j]of r.cells)RT55[j*N+i]=fl==='carpet'?(Math.abs(i-r.cx)<=1?'carpet':'slab'):fl;RM55.push({x:r.x,y:r.y,w:r.w,h:r.h,ty:r.ty})}
  ents.push(po(rooms[0].x,rooms[0].y,f===1?d.ent:z.dg+'@'+(f-1),{st:f===1?'exit':'up',n:f===1?'Uscita: '+zname(d.ent):'Sali al piano '+(f-1)}));
  if(z.boss)ents.push(mk(z.boss,far.cx,far.cy));else ents.push(po(far.cx,far.cy,z.dg+'@'+(f+1),{st:'down',n:'Scendi al piano '+(f+1)}));
  for(const r of rooms){ents.push({k:'tc',px:r.x+.15,py:r.y+.15},{k:'tc',px:r.x+r.w-.15,py:r.y+.15});if(r.w*r.h>50)ents.push({k:'tc',px:r.x+.15,py:r.y+r.h-.15})}
  const c=[];for(let y=0;y<N;y++)for(let x=0;x<N;x++)if(dd[y*N+x]>6&&M[y][x]===0&&!(Math.abs(x-far.cx)<3&&Math.abs(y-far.cy)<3))c.push({x,y});
  for(let i=c.length-1;i>0;i--){const j=ri(0,i);[c[i],c[j]]=[c[j],c[i]]}
  for(let i=0;i<z.c&&c.length;i++){const q=c.pop();ents.push(mk(z.en[ri(0,z.en.length-1)],q.x,q.y))}
  for(let i=0;i<3+f&&c.length;i++){const q=c.pop();ents.push({k:'ch',px:q.x+.5,py:q.y+.5})}
  const lid=z.dg+f;if(LORE[lid]&&!P.lore.includes(lid)&&c.length){const q=c.pop();ents.push({k:'lore',id:lid,px:q.x+.5,py:q.y+.5,n:'Pagina di diario'})}
  return sp}
const dgFloor=(S,ty)=>({fungaia:'moss',tana:'straw',miniera:'rail',cappella:'carpet',biblioteca:S.th==='void'?'stars':'slab',geroglifici:'hier',tesoro:'gold',trappole:'hier',lago:'frost',magma:'basalt',fucina:'basalt',
  corallo:'sand',relitto:'plank',perle:'sand',stelle:'stars',rune:'stars',specchi:'mirror',giardino:S.th==='jade'?'moss':'frost',vasche:'moss',santuario55:'rune',ingresso:''})[ty]||(R()<.5?S.fl:'');
// ---- gli arredi: put(x,y,codice,blocca) ----
function dgFurnish(z,S,r,L,sp){const C=new Set(r.cells.map(([i,j])=>i+','+j)),inR=(x,y)=>C.has(x+','+y)&&M[y][x]===0,R2=R;
  const nearDoor=(x,y)=>{for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const a=x+dx,b=y+dy;if(M[b]&&M[b][a]===0&&!C.has(a+','+b))return true}return false};
  const free=(x,y,blk)=>inR(x,y)&&!DEC[y][x]&&!(Math.abs(x-sp[0])<2&&Math.abs(y-sp[1])<2)&&!(blk&&(Math.abs(x-r.cx)<=(r.ty==='santuario55'?2:0)&&Math.abs(y-r.cy)<=(r.ty==='santuario55'?2:0)||nearDoor(x,y)||x===r.cx||y===r.cy));
  const put=(x,y,c,blk)=>{if(!free(x,y,blk))return false;DEC[y][x]=c;if(blk)M[y][x]=6;L.push([x,y]);return true};
  const edge=(fn,step=2)=>{for(let x=r.x+1;x<r.x+r.w-1;x+=step){fn(x,r.y);fn(x,r.y+r.h-1)}for(let y=r.y+1;y<r.y+r.h-1;y+=step){fn(r.x,y);fn(r.x+r.w-1,y)}};
  const scat=(c,n,blk)=>{for(let k=0;k<n*4&&n>0;k++){const[i,j]=r.cells[Math.floor(R2()*r.cells.length)];if(put(i,j,c,blk))n--}};
  const ring=(c,rad,n)=>{for(let k=0;k<n;k++){const a=k/n*6.283;put(Math.round(r.cx+Math.cos(a)*rad),Math.round(r.cy+Math.sin(a)*rad),c,1)}};
  const pillars=()=>{for(let x=r.x+2;x<r.x+r.w-2;x+=3)for(const y of[r.y+2,r.y+r.h-3])put(x,y,'ⓐ',1)};
  const big=r.cells.length,k=Math.max(1,Math.round(big/22));
  if(r.sh==='hall')pillars();
  switch(r.ty){
    case 'ingresso':put(r.x+r.w-2,r.y+1,'ⓕ',1);put(r.x+1,r.y+r.h-2,'ⓕ',1);break;
    case 'santuario55':ring('ⓐ',Math.max(2.6,Math.min(r.w,r.h)/2-1.2),8);put(r.cx,r.y+1,'ⓔ',1)||put(r.cx+1,r.y+1,'ⓔ',1);put(r.cx,r.cy,'ⓒ',0);scat('ⓑ',2,0);break;
    // la Tana dei Goblin
    case 'accampamento':scat('ⓖ',1+k,1);put(r.cx+1,r.cy+1,'ⓗ',1);scat('ⓘ',k,1);scat('k',k,1);break;
    case 'fungaia':scat('ⓙ',2+k*2,1);scat('ⓑ',1,0);break;
    case 'deposito':edge((x,y)=>put(x,y,R2()<.5?'k':'b',1),1);scat('ⓥ',1,1);break;
    case 'tana':scat('ⓘ',2+k,1);scat('ⓛ',k,1);break;
    case 'miniera':scat('ⓛ',1+k,1);scat('ⓚ',1,1);scat('ⓩ',1,1);break;
    // la Cripta
    case 'ossario':edge((x,y)=>put(x,y,'ⓝ',1),2);scat('ⓘ',k,1);break;
    case 'cappella':for(let y=r.y+2;y<r.y+r.h-2;y+=2)for(const x of[r.cx-2,r.cx+2])put(x,y,'ⓞ',1);put(r.cx,r.y+1,'ⓟ',1);scat('ⓠ',2,1);break;
    case 'sarcofagi':for(let x=r.x+2;x<r.x+r.w-2;x+=2)for(const y of[r.cy-2,r.cy+2])put(x,y,'ⓜ',1);scat('ⓠ',1,1);break;
    case 'biblioteca':edge((x,y)=>put(x,y,S.th==='void'?'Ⓝ':'ⓡ',1),2);scat(S.th==='void'?'Ⓝ':'ⓡ',k,1);break;
    case 'prigione':edge((x,y)=>put(x,y,'ⓢ',1),3);scat('ⓘ',k,1);break;
    // la Piramide
    case 'dei':edge((x,y)=>put(x,y,'ⓣ',1),3);put(r.cx,r.y+1,'ⓤ',1);break;
    case 'tesoro':scat('ⓥ',2+k,1);scat('ⓦ',1+k,1);break;
    case 'geroglifici':ring('ⓤ',Math.min(r.w,r.h)/2-1.5,4);break;
    case 'trappole':scat('ⓧ',4+k*2,0);scat('ⓦ',1,1);break;
    case 'sarcofago':put(r.cx+1,r.cy-1,'ⓨ',1);ring('ⓦ',2.5,5);break;
    // le Caverne di Cristallo
    case 'giardino':if(S.th==='jade'){scat('Ⓢ',1+k,1);scat('p',k,1);scat('Ⓣ',1,1)}else{scat('ⓩ',2+k*2,1);scat('ⓑ',1,0)}break;
    case 'lago':scat('Ⓐ',1+k,1);break;
    case 'nido':scat('Ⓒ',1+k,1);scat('ⓘ',k,1);break;
    case 'statue':if(S.th==='jade'){edge((x,y)=>put(x,y,'Ⓡ',1),3)}else scat('Ⓑ',1+k,1);break;
    case 'guglie':scat('Ⓐ',3+k*2,1);break;
    // la Fucina Infernale
    case 'fucina':put(r.x+1,r.y+1,'Ⓖ',1);scat('Ⓓ',1+k,1);scat('ⓕ',1,1);break;
    case 'magma':{const y=r.cy+2;if(y<r.y+r.h-1)for(let x=r.x+1;x<r.x+r.w-1;x++)if(inR(x,y)&&x!==r.cx&&!nearDoor(x,y)&&!DEC[y][x]){M[y][x]=2;L.push([x,y])}scat('Ⓕ',k,1);break}
    case 'catene':scat('Ⓔ',2+k,1);break;
    case 'ossidiana':scat('Ⓕ',3+k*2,1);break;
    case 'altare':put(r.cx,r.y+1,'ⓟ',1);ring('ⓕ',2.6,4);break;
    // l'Abisso Sommerso
    case 'corallo':scat('Ⓗ',3+k*2,1);scat('Ⓜ',2,0);break;
    case 'relitto':scat('Ⓘ',2+k,1);scat('k',1,1);scat('b',1,1);break;
    case 'santuario':pillars();scat('Ⓙ',1+k,1);scat('Ⓜ',1,0);break;
    case 'alghe':scat('Ⓛ',3+k*2,1);break;
    case 'perle':scat('Ⓚ',1+k,1);scat('Ⓗ',k,1);break;
    // la Cittadella del Vuoto
    case 'stelle':put(r.cx,r.cy,'ⓒ',0);scat('Ⓠ',2,0);scat('Ⓞ',k,1);break;
    case 'ponte':scat('Ⓠ',2,0);scat('ⓑ',2,0);break;
    case 'rune':ring('Ⓞ',Math.min(r.w,r.h)/2-1.4,6);put(r.cx,r.cy,'ⓒ',0);break;
    case 'specchi':edge((x,y)=>put(x,y,'Ⓟ',1),2);break;
    // il Tempio di Giada
    case 'vasche':scat('Ⓤ',1+k,1);scat('Ⓣ',1,1);break}
  // un pezzo di un'altra dimensione che galleggia sopra quasi ogni stanza
  if(r.ty!=='ingresso'&&R2()<.75)scat(R2()<.55?'ⓓ':'ⓑ',1+(big>60?1:0),0);
  // le luci degli arredi che brillano
  for(const[x,y]of L){const c=DEC[y][x];if('ⓕⓗⓙⓩⓒⓔⓟⒼⒶⓑⓓⓠⒿⓂⓄⓆⓉ'.includes(c)||M[y][x]===2)LT55.push([x+.5,y+.5])}}
/* ---- i pavimenti ---- */
const FL55={
  dirt:(x,y,k)=>['#6b5a48','#62513f'][(x+y)&1],straw:(x,y,k)=>k>.5?'#8a7a48':'#6b5a3a',rail:(x,y,k)=>'#5a4a38',moss:(x,y,k)=>k>.55?'#3a6a3a':'#4a5a3a',
  slab:(x,y,k)=>['#4a4e5c','#3e4250'][((x>>1)+(y>>1))&1],carpet:(x,y,k)=>'#5a1a24',hier:(x,y,k)=>['#c9a860','#b8964e'][(x+y)&1],gold:(x,y,k)=>['#c8a040','#b89030'][(x+y)&1],
  frost:(x,y,k)=>['#cfeaf8','#bcdcef'][(x+y)&1],basalt:(x,y,k)=>['#2a2226','#241c20'][(x+y)&1],sand:(x,y,k)=>['#c8b88a','#bcab7c'][(x+y)&1],plank:(x,y,k)=>['#6a4a2a','#5e4024'][x&1],
  stars:(x,y,k)=>['#1a1230','#160f2a'][(x+y)&1],mirror:(x,y,k)=>['#3a3a5a','#5a5a8a'][(x+y)&1],rune:(x,y,k)=>null};
{const f0=floor;floor=function(x,y,c,h){const z=ZZ;if(c!==0||!z||!z.dg||!RT55||RT55.length!==N*N){f0(x,y,c,h);return}const st=RT55[y*N+x];if(!st||!FL55[st]){f0(x,y,c,h);return}
  const k=hh(x*3.1+5,y*1.7+2);let col=FL55[st](x,y,k);if(st==='rune'){f0(x,y,c,h);const q=SAN55||[0,0],d=Math.hypot(x-q[0],y-q[1]);
    if(Math.abs(d-2)<.6||Math.abs(d-3.6)<.5)box(x+.1,y+.1,0,.8,.8,.4,(TH[z.th]||{}).tc||'#c46bff',1.2+Math.sin(t*2+d)*.15);return}
  box(x,y,-6,1,1,6,col,.92+h*.14);
  if(st==='hier'&&(x+y*3)%5===0)box(x+.3,y+.3,0,.4,.4,.3,['#3a5aa8','#a8303a','#2a8a6a'][(x*7+y)%3]);
  else if(st==='slab'){if(k>.8)box(x+.1,y+.45,0,.6,.04,.2,'#24262e');if(k<.05)box(x+.4,y+.4,0,.22,.18,2,'#e8e4d8')}
  else if(st==='frost'){if(k>.7)box(x+.15,y+.2+k*.3,0,.6,.05,.2,'#ffffff',1.1)}
  else if(st==='basalt'){if(k>.7)box(x+.1+k*.3,y+.45,0,.4,.05,.3,'#ff6a1a',1.3+Math.sin(t*3+x)*.15);else if(k<.12)box(x+.45,y+.1,0,.05,.5,.3,'#ff8a2a',1.25)}
  else if(st==='sand'){if(k>.88)box(x+.4,y+.4,0,.16,.12,1.2,['#f4e8f0','#ffb0a0','#e8d0a0'][(x+y)%3])}
  else if(st==='stars'){if(k>.75)box(x+k*.7,y+.2+k*.5,0,.06,.06,.3,'#ffffff',1+Math.sin(t*3+x*7+y)*.4);else if(k<.06)box(x+.4,y+.4,0,.1,.1,.3,'#c46bff',1.3)}
  else if(st==='mirror'){if((x+y)&1)box(x+.1,y+.1,0,.8,.8,.2,'#b8c8ff',1.15+Math.sin(t*1.5+x)*.08)}
  else if(st==='carpet'){box(x+.05,y,0,.9,1,.2,'#7a2030');if(x&1)box(x+.45,y,0,.1,1,.3,'#d4af37')}
  else if(st==='rail'){if(y%3===0){box(x,y+.3,0,1,.06,.6,'#5a5a62');box(x,y+.64,0,1,.06,.6,'#5a5a62')}}
  else if(st==='straw'){if(k>.6)box(x+.2,y+.3,0,.5,.08,.4,'#c8b060')}
  else if(st==='moss'){if(k>.8)box(x+.3,y+.3,0,.3,.3,1.5,'#5a9a4a')}
  else if(st==='plank'){box(x+.48,y,0,.04,1,.1,'#3a2410')}}}
/* ---- gli arredi ---- */
const DGC=()=>{const z=ZZ||{},T=TH[z.th]||{};return{o:T.o||'#4a3c30',a:T.a||'#6b5a48',c:T.tc||'#ffb04a',p:T.pool||'#5a2a8a',th:z.th}};
const PR55={
  'ⓐ':(x,y)=>{const C=DGC(),cap=C.th==='pyr'?'#d4af37':C.th==='jade'?'#6affc0':C.th==='ice'?'#e8f8ff':C.th==='void'?'#c46bff':C.th==='sea'?'#8affd8':'#8a8a8a';box(x+.15,y+.15,0,.7,.7,4,C.o);box(x+.25,y+.25,4,.5,.5,40,C.o,.95);box(x+.15,y+.15,44,.7,.7,4,cap,1.05);
    if(C.th==='sea')box(x+.2,y+.7,6,.08,.08,26,'#3a8a5a');else if(C.th==='jade')box(x+.68,y+.3,8,.08,.4,24,'#2a8a3a');else if(C.th==='void')box(x+.4,y+.4,52+Math.sin(t*2+x)*3,.2,.2,6,'#e8b0ff',1.4)},
  'ⓑ':(x,y)=>{const C=DGC(),u=Math.sin(t*1.3+x*1.7+y)*5,a=t*.8+x;for(let i=0;i<3;i++){const b=a+i*2.1;box(x+.5+Math.cos(b)*.3-.08,y+.5+Math.sin(b)*.3-.08,58+u+i*7,.16,.16,9-i*2,C.c,1.35)}box(x+.42,y+.42,66+u,.16,.16,14,'#ffffff',1.2);if(SET.ultra)GLOW.push([x+.5,y+.5,64+u,40,rgbOf(C.c),.3])},
  'ⓒ':(x,y)=>{const C=DGC();for(let i=0;i<10;i++){const a=i/10*6.283+t*.6;box(x+.5+Math.cos(a)*.7-.06,y+.5+Math.sin(a)*.7-.06,0,.12,.12,.4,C.c,1.3)}box(x+.3,y+.3,0,.4,.4,.3,C.c,1.2);for(let i=0;i<4;i++){const a=-i/4*6.283-t*1.1;box(x+.5+Math.cos(a)*.42-.05,y+.5+Math.sin(a)*.42-.05,6+Math.sin(t*3+i)*2,.1,.1,2,'#ffffff',1.3)}},
  'ⓓ':(x,y)=>{const C=DGC(),u=Math.sin(t*.9+x+y*2)*4,z0=62+u;box(x+.1,y+.1,z0,.8,.8,6,C.a,.9);box(x+.25,y+.25,z0-6,.5,.5,6,C.o,.85);box(x+.4,y+.4,z0-11,.2,.2,5,C.o,.8);
    if(C.th==='ice'||C.th==='void'||C.th==='sea')box(x+.4,y+.35,z0+6,.18,.18,10,C.c,1.3);else if(C.th==='jade'||C.th==='cave'){box(x+.45,y+.45,z0+6,.08,.08,8,'#6b4a2b');box(x+.3,y+.3,z0+12,.4,.4,6,'#3f8a3a')}else box(x+.35,y+.35,z0+6,.3,.3,4,C.c,1.2)},
  'ⓔ':(x,y)=>{const C=DGC();box(x-.1,y+.4,0,.2,.2,44,C.o);box(x+.9,y+.4,0,.2,.2,44,C.o);box(x-.1,y+.4,44,1.2,.2,4,C.o);for(let i=0;i<14;i++){const a=i/14*6.283+t*1.6;box(x+.5+Math.cos(a)*.38-.04,y+.45,22+Math.sin(a)*16,.08,.08,3,i%2?C.c:'#ffffff',1.4)}
    box(x+.3,y+.47,10,.4,.04,24,C.c,1.1+Math.sin(t*4)*.15);if(SET.ultra)GLOW.push([x+.5,y+.5,24,60,rgbOf(C.c),.35])},
  'ⓕ':(x,y)=>{const C=DGC(),fl=C.th==='void'?'#c46bff':C.th==='ice'?'#9adcff':C.th==='sea'?'#6fffe0':C.th==='jade'?'#6affc0':'#ff8a2a';box(x+.35,y+.35,0,.3,.3,14,'#3a3a40');box(x+.22,y+.22,14,.56,.56,4,'#4a4a52');
    box(x+.3,y+.3,18,.4,.4,5+Math.sin(t*9+x)*1.5,fl,1.4);box(x+.4,y+.4,22,.2,.2,5+Math.sin(t*7+y)*2,'#ffe8a0',1.5);if(SET.ultra)GLOW.push([x+.5,y+.5,22,46,rgbOf(fl),.3])},
  // Tana dei Goblin
  'ⓖ':(x,y)=>{box(x+.05,y+.1,0,.9,.8,4,'#7a6a42');box(x+.12,y+.15,4,.76,.7,8,'#8a7a4a');box(x+.22,y+.2,12,.56,.6,7,'#9a8a5a');box(x+.35,y+.25,19,.3,.5,4,'#7a6a42');box(x+.4,y+.88,0,.2,.04,12,'#2a1a10');box(x+.44,y+.44,23,.06,.06,8,'#6b4a2b');box(x+.5,y+.44,28,.2,.02,4,'#a83a2a')},
  'ⓗ':(x,y)=>{for(let i=0;i<6;i++){const a=i/6*6.283;box(x+.5+Math.cos(a)*.3-.07,y+.5+Math.sin(a)*.3-.07,0,.14,.14,3,'#6a6a6a')}box(x+.35,y+.35,1,.3,.3,3+Math.sin(t*9)*1,'#ff8a2a',1.4);box(x+.42,y+.42,3,.16,.16,4+Math.sin(t*11)*1.5,'#ffd84a',1.5);
    box(x+.05,y+.47,0,.06,.06,14,'#5a3a1a');box(x+.89,y+.47,0,.06,.06,14,'#5a3a1a');box(x+.05,y+.48,13,.9,.04,1,'#5a3a1a');box(x+.38,y+.42,9,.24,.16,4,'#a8603a')},
  'ⓘ':(x,y)=>{box(x+.2,y+.3,0,.5,.35,3,'#e8e2d0');box(x+.3,y+.2,3,.3,.3,3,'#d8d2c0');box(x+.55,y+.5,0,.3,.06,1.5,'#e8e2d0');box(x+.15,y+.6,0,.06,.3,1.5,'#e8e2d0');box(x+.4,y+.3,6,.2,.18,3,'#f0ead8');box(x+.43,y+.46,7,.05,.02,1,'#1a1a1a')},
  'ⓙ':(x,y)=>{const h2=14+((x*7+y*3)%3)*6,c=['#c84a8a','#4ac8b8','#c8b84a'][(x+y)%3];box(x+.42,y+.42,0,.16,.16,h2,'#e8e0d0');box(x+.15,y+.15,h2,.7,.7,4,c,1.2+Math.sin(t*2+x)*.1);box(x+.25,y+.25,h2+4,.5,.5,2,c,1.3);
    box(x+.3,y+.2,h2+1,.08,.08,1,'#ffffff',1.4);box(x+.6,y+.55,h2+1,.08,.08,1,'#ffffff',1.4);box(x+.15,y+.6,0,.12,.12,5,c,1.1)},
  'ⓚ':(x,y)=>{box(x+.1,y+.2,3,.8,.6,8,'#5a4a3a');box(x+.12,y+.22,11,.76,.56,1,'#3a2a1a');box(x+.2,y+.3,11,.6,.4,4,'#4a4a52');box(x+.1,y+.15,0,.15,.12,3,'#2a2a2a');box(x+.75,y+.15,0,.15,.12,3,'#2a2a2a');box(x+.1,y+.73,0,.15,.12,3,'#2a2a2a');box(x+.75,y+.73,0,.15,.12,3,'#2a2a2a')},
  'ⓛ':(x,y)=>{const C=DGC();box(x+.2,y+.2,0,.6,.6,8,C.o);box(x+.3,y+.3,8,.4,.4,10,C.o,.95);box(x+.4,y+.4,18,.2,.2,8,C.a);box(x+.65,y+.6,0,.2,.2,6,C.o)},
  // Cripta
  'ⓜ':(x,y)=>{box(x+.05,y+.15,0,.9,.7,9,'#7a7a84');box(x,y+.1,9,1,.8,3,'#8a8a94');box(x+.3,y+.2,12,.4,.6,1.5,'#9a9aa6');box(x+.38,y+.22,13.5,.24,.18,2,'#e8e4d8')},
  'ⓝ':(x,y)=>{box(x+.05,y+.05,0,.9,.9,26,'#3a3c46');for(let r2=0;r2<3;r2++)for(let c2=0;c2<3;c2++)box(x+.12+c2*.27,y+.06,4+r2*8,.2,.02,5,'#e8e4d8');box(x+.05,y+.05,26,.9,.9,3,'#2a2c36')},
  'ⓞ':(x,y)=>{box(x+.1,y+.2,0,.8,.6,5,'#4a3a2a');box(x+.1,y+.7,5,.8,.1,8,'#4a3a2a');box(x+.05,y+.2,0,.08,.6,9,'#3a2a1a');box(x+.87,y+.2,0,.08,.6,9,'#3a2a1a')},
  'ⓟ':(x,y)=>{const C=DGC();box(x+.05,y+.1,0,.9,.8,12,'#e8e4d8');box(x,y+.05,12,1,.9,2,'#d4af37');box(x+.4,y+.4,14,.2,.2,10,C.c,1.3);box(x+.3,y+.42,20,.4,.16,2,'#d4af37');for(const q of[.12,.78]){box(x+q,y+.2,14,.08,.08,5,'#f4f0e0');box(x+q+.01,y+.21,19,.06,.06,2,'#ffcc33',1.3+Math.sin(t*9+q)*.2)}if(SET.ultra)GLOW.push([x+.5,y+.5,18,40,rgbOf(C.c),.25])},
  'ⓠ':(x,y)=>{box(x+.45,y+.45,0,.1,.1,26,'#3a3a3a');box(x+.2,y+.45,20,.6,.08,1,'#3a3a3a');for(const q of[.2,.45,.7]){box(x+q,y+.42,21,.08,.08,4,'#f4f0e0');box(x+q+.01,y+.43,25,.06,.06,2.4,'#ffcc33',1.35+Math.sin(t*8+q*9)*.2)}},
  'ⓡ':(x,y)=>{box(x+.05,y+.3,0,.9,.4,30,'#4a3420');for(let i=0;i<3;i++)for(let j=0;j<4;j++)box(x+.08+j*.21,y+.32,3+i*9,.16,.34,6,['#7a2a2a','#2a4a7a','#5a6a2a','#6a4a8a'][(i+j+x)%4]);const u=Math.sin(t*1.7+x)*3;box(x+.3,y+.3,40+u,.4,.3,1.5,'#e8dcc8',1.1);box(x+.3,y+.3,41.5+u,.18,.3,1,'#7a2a2a')},
  'ⓢ':(x,y)=>{box(x,y,0,1,1,1,'#3a3a3a');box(x,y,30,1,1,2,'#3a3a3a');for(let i=0;i<5;i++){box(x+i*.24,y,1,.05,.05,29,'#5a5a62');box(x+i*.24,y+.95,1,.05,.05,29,'#5a5a62');box(x,y+i*.24,1,.05,.05,29,'#5a5a62');box(x+.95,y+i*.24,1,.05,.05,29,'#5a5a62')}box(x+.3,y+.4,0,.4,.2,3,'#e8e2d0')},
  // Piramide
  'ⓣ':(x,y)=>{box(x+.15,y+.15,0,.7,.7,6,'#b8963a');box(x+.25,y+.25,6,.5,.4,16,'#1a1a22');box(x+.28,y+.3,22,.44,.34,8,'#1a1a22');box(x+.3,y+.25,30,.1,.12,8,'#1a1a22');box(x+.6,y+.25,30,.1,.12,8,'#1a1a22');box(x+.25,y+.62,13,.5,.04,4,'#d4af37');box(x+.35,y+.62,26,.08,.03,2,'#ffd84a',1.3);box(x+.57,y+.62,26,.08,.03,2,'#ffd84a',1.3)},
  'ⓤ':(x,y)=>{box(x+.2,y+.2,0,.6,.6,6,'#c9a860');box(x+.28,y+.28,6,.44,.44,34,'#d8b870');box(x+.34,y+.34,40,.32,.32,4,'#d4af37',1.1);box(x+.4,y+.4,44,.2,.2,3,'#fff2a0',1.3);for(let i=0;i<4;i++)box(x+.3,y+.71,10+i*7,.4,.02,2,['#3a5aa8','#a8303a'][i&1])},
  'ⓥ':(x,y)=>{box(x+.1,y+.15,0,.8,.7,4,'#d4af37',1.15);box(x+.2,y+.25,4,.6,.5,3,'#e8c54a',1.2);box(x+.35,y+.35,7,.3,.3,2,'#fff2a0',1.3);box(x+.15,y+.6,4,.15,.15,2,'#ff4a6a',1.3);box(x+.65,y+.2,4,.12,.12,3,'#4ac8ff',1.3);if(SET.ultra)GLOW.push([x+.5,y+.5,6,34,'255,210,90',.22])},
  'ⓦ':(x,y)=>{box(x+.3,y+.3,0,.4,.4,3,'#a8603a');box(x+.25,y+.25,3,.5,.5,8,'#b8703a');box(x+.32,y+.32,11,.36,.36,3,'#a8603a');box(x+.25,y+.7,5,.5,.03,1.5,'#d4af37')},
  'ⓧ':(x,y)=>{box(x+.05,y+.05,0,.9,.9,.4,'#8a7040');const up=(Math.sin(t*1.6+x*1.3+y)>.6);for(let i=0;i<3;i++)for(let j=0;j<3;j++)box(x+.15+i*.28,y+.15+j*.28,0,.08,.08,up?6:1,'#c8c8d0')},
  'ⓨ':(x,y)=>{box(x-.05,y+.1,0,1.1,.8,10,'#d4af37',1.05);box(x+.05,y+.2,10,.9,.6,3,'#e8c54a',1.15);box(x+.3,y+.25,13,.4,.5,2,'#3a5aa8');box(x+.38,y+.3,15,.24,.2,2,'#e8c8a0')},
  // Caverne di Cristallo
  'ⓩ':(x,y)=>{const C=DGC(),c=C.th==='cave'?'#9a7aff':C.c;box(x+.3,y+.3,0,.24,.24,18,c,1.3);box(x+.55,y+.4,0,.16,.16,11,c,1.25);box(x+.2,y+.55,0,.14,.14,8,c,1.2);box(x+.34,y+.34,18,.16,.16,4,'#ffffff',1.4);if(SET.ultra)GLOW.push([x+.5,y+.5,10,40,rgbOf(c),.28])},
  'Ⓐ':(x,y)=>{box(x+.2,y+.2,0,.6,.6,10,'#bfe3f5',1.05);box(x+.3,y+.3,10,.4,.4,14,'#d8f6ff',1.1);box(x+.4,y+.4,24,.2,.2,12,'#ffffff',1.2)},
  'Ⓑ':(x,y)=>{box(x+.05,y+.05,0,.9,.9,34,'#bfe3f5',1.05);box(x+.3,y+.3,2,.4,.35,20,'#5a6a8a',.8);box(x+.32,y+.32,22,.36,.3,8,'#d8b890',.75);box(x+.6,y+.3,14,.08,.1,14,'#9a9aa6',.8);box(x+.05,y+.05,34,.9,.9,1,'#ffffff',1.2)},
  'Ⓒ':(x,y)=>{box(x,y,0,1,1,.3,'#e8e8f0',.95);for(let i=0;i<4;i++)box(x+.1+i*.22,y+.05,.3,.02,.9,.2,'#ffffff');box(x+.25,y+.3,0,.24,.22,7,'#e8e0d8');box(x+.5,y+.45,0,.24,.22,6,'#e0d8d0');box(x+.33,y+.36,7,.08,.08,1,'#c8a0ff',1.3)},
  // Fucina Infernale
  'Ⓓ':(x,y)=>{box(x+.3,y+.3,0,.4,.4,8,'#2a2a30');box(x+.1,y+.25,8,.8,.5,6,'#3a3a42');box(x+.85,y+.4,10,.15,.2,4,'#3a3a42');box(x+.2,y+.3,14,.5,.4,1,'#ff6a1a',1.3+Math.sin(t*5)*.1)},
  'Ⓔ':(x,y)=>{box(x+.42,y+.42,0,.16,.16,40,'#2a2226');box(x+.3,y+.3,40,.4,.4,3,'#3a3a42');const sw=Math.sin(t*1.3+x)*.08;for(let i=0;i<7;i++)box(x+.47+sw*i/7,y+.2,38-i*4,.06,.06,3.5,'#6a6a72');box(x+.44+sw,y+.18,8,.12,.1,3,'#8a8a92')},
  'Ⓕ':(x,y)=>{box(x+.25,y+.25,0,.5,.5,8,'#1a1218');box(x+.33,y+.33,8,.34,.34,12,'#241824',1.05);box(x+.42,y+.42,20,.16,.16,9,'#2e2030',1.1);box(x+.2,y+.6,0,.15,.15,6,'#1a1218');box(x+.36,y+.36,6,.06,.06,10,'#ff6a1a',1.3)},
  'Ⓖ':(x,y)=>{box(x-.1,y-.1,0,1.2,1.2,20,'#3a2a26');box(x+.2,y+1.05,4,.6,.05,10,'#ff6a1a',1.4+Math.sin(t*6)*.15);box(x+.25,y+1.06,6,.5,.04,5,'#ffd84a',1.5);box(x+.3,y+.3,20,.4,.4,18,'#2a1e1c');for(let i=0;i<3;i++)box(x+.45,y+.45,40+((t*20+i*8)%24),.1,.1,3,'#5a5a5a',.8);if(SET.ultra)GLOW.push([x+.5,y+1.1,10,60,'255,106,26',.35])},
  // Abisso Sommerso
  'Ⓗ':(x,y)=>{const c=['#ff7a8a','#ffb04a','#c87aff','#ff5a7a'][(x*3+y)%4];box(x+.4,y+.4,0,.14,.14,12,c);box(x+.2,y+.35,6,.12,.12,12,c,1.05);box(x+.6,y+.5,4,.12,.12,14,c,.95);box(x+.35,y+.6,10,.1,.1,10,c,1.1);box(x+.15,y+.15,0,.2,.2,4,'#e8d0a0')},
  'Ⓘ':(x,y)=>{box(x+.05,y+.3,0,.9,.15,4,'#5a3a1e');box(x+.1,y+.55,0,.8,.15,6,'#6a4a2a');box(x+.2,y+.1,0,.12,.12,20,'#4a2a12');box(x+.22,y+.1,16,.6,.04,5,'#d8d0b8',.85)},
  'Ⓙ':(x,y)=>{box(x+.2,y+.2,0,.6,.6,6,'#4a7a7a');box(x+.28,y+.28,6,.44,.44,30,'#5a8a8a');box(x+.2,y+.2,36,.6,.6,4,'#6a9a9a');box(x+.25,y+.72,4,.06,.06,22,'#2a8a4a');box(x+.66,y+.68,2,.06,.06,18,'#2a8a4a')},
  'Ⓚ':(x,y)=>{const o=(Math.sin(t*.8+x)+1)*.5;box(x+.1,y+.15,0,.8,.7,3,'#8a8aa0');box(x+.15,y+.2,3,.7,.6,2,'#f0e0e8');box(x+.38,y+.38,5,.24,.24,3,'#ffffff',1.4);box(x+.1,y+.15,3+o*5,.8,.15,2,'#8a8aa0')},
  'Ⓛ':(x,y)=>{for(let i=0;i<3;i++){const sw=Math.sin(t*1.4+x+i)*.06;box(x+.25+i*.22+sw,y+.4,0,.08,.08,18+i*6,'#2a8a4a',1+i*.05);box(x+.27+i*.22+sw*2,y+.42,18+i*6,.05,.05,6,'#4aba6a')}},
  'Ⓜ':(x,y)=>{const u=Math.sin(t*1.1+x*1.3+y)*6,z0=40+u;box(x+.3,y+.3,z0,.4,.4,5,'#d08ae0',1.3);box(x+.35,y+.35,z0+5,.3,.3,2,'#f0c8ff',1.35);for(let i=0;i<4;i++)box(x+.32+i*.1,y+.45,z0-8+Math.sin(t*3+i)*1.5,.04,.04,8,'#d08ae0',1.2);if(SET.ultra)GLOW.push([x+.5,y+.5,z0,34,'208,138,224',.3])},
  // Cittadella del Vuoto
  'Ⓝ':(x,y)=>{const u=Math.sin(t*1.2+x*.9+y)*4;box(x+.05,y+.3,8+u,.9,.4,26,'#2a1e3a');for(let i=0;i<3;i++)for(let j=0;j<4;j++)box(x+.08+j*.21,y+.32,10+u+i*8,.16,.34,6,['#5a2a8a','#2a3a8a','#8a2a6a','#3a6a8a'][(i+j+x)%4],1.1);box(x+.3,y+.4,0,.4,.2,.3,'#c46bff',1.2);
    box(x+.4,y+.4,40+u*2,.3,.2,1.5,'#e8dcc8',1.1)},
  'Ⓞ':(x,y)=>{box(x+.25,y+.25,0,.5,.5,40,'#1a1424');for(let i=0;i<5;i++)box(x+.3,y+.76,6+i*7,.4,.02,2,'#c46bff',1.2+Math.sin(t*3+i+x)*.25);box(x+.3,y+.3,46+Math.sin(t*2+x)*2,.4,.4,4,'#c46bff',1.4)},
  'Ⓟ':(x,y)=>{box(x+.1,y+.4,0,.8,.2,4,'#2a2030');box(x+.15,y+.45,4,.7,.1,34,'#8a8ab8',1.05);box(x+.2,y+.46,6,.6,.08,30,'#c8d0ff',1.15+Math.sin(t*1.3+x)*.12);box(x+.1,y+.4,38,.8,.2,3,'#d4af37')},
  'Ⓠ':(x,y)=>{const u=Math.sin(t*.7+x+y)*5,z0=56+u,a=t*.5;for(let i=0;i<4;i++){const w=.8-i*.2;box(x+.5-w/2,y+.5-w/2,z0-i*5,w,w,5,i&1?'#2a1a3a':'#3a2a4a',1+i*.05)}box(x+.45,y+.45,z0-23,.1,.1,4,'#c46bff',1.5);
    box(x+.5+Math.cos(a)*.5-.05,y+.5+Math.sin(a)*.5-.05,z0-6,.1,.1,2,'#e8b0ff',1.4)},
  // Tempio di Giada
  'Ⓡ':(x,y)=>{box(x+.15,y+.15,0,.7,.7,6,'#2a6a5a');for(let i=0;i<5;i++){const a=i*1.2+x;box(x+.4+Math.cos(a)*.18,y+.4+Math.sin(a)*.18,6+i*6,.2,.2,6,'#3ab88a',1.05)}box(x+.32,y+.32,36,.36,.3,6,'#4ac89a',1.1);box(x+.36,y+.6,39,.06,.03,1.5,'#ffe84a',1.4);box(x+.56,y+.6,39,.06,.03,1.5,'#ffe84a',1.4)},
  'Ⓢ':(x,y)=>{box(x+.3,y+.3,0,.4,.4,36,'#3a6a5a');for(let i=0;i<6;i++){const a=i*1.1;box(x+.5+Math.cos(a)*.24-.04,y+.5+Math.sin(a)*.24-.04,i*6,.08,.08,7,'#2a8a3a')}box(x+.2,y+.2,36,.6,.6,6,'#3f8a3a')},
  'Ⓣ':(x,y)=>{box(x+.45,y+.45,0,.1,.1,22,'#2a4a3a');box(x+.3,y+.3,22,.4,.4,8,'#6affc0',1.2+Math.sin(t*3+x)*.08);box(x+.26,y+.26,30,.48,.48,2,'#2a6a5a');if(SET.ultra)GLOW.push([x+.5,y+.5,26,40,'106,255,192',.28])},
  'Ⓤ':(x,y)=>{box(x+.05,y+.05,0,.9,.9,6,'#2a6a5a');box(x+.12,y+.12,6,.76,.76,1,'#2a8a8a',1.1+Math.sin(t*2+x)*.06);box(x+.42,y+.42,7,.16,.16,3+Math.abs(Math.sin(t*3))*3,'#bfffee',1.3)}};
{const d0=dec;dec=function(x,y,c,h){const f=PR55[c];if(f){f(x,y,h);return}d0(x,y,c,h)}}
// le luci: gli arredi che brillano fanno luce nel buio del dungeon
{const l0=lights;lights=function(){const z=ZZ;if(!z||!z.dg||!LT55.length||!SET.light){l0();return}const n0=ents.length;for(const[x,y]of LT55)if(Math.abs(x-P.px)+Math.abs(y-P.py)<26)ents.push({k:'lore',px:x,py:y});try{l0()}finally{ents.length=n0}}}
// entrando in una stanza speciale, il suo nome
let RS55='';
{const u0=upd;upd=function(dt){u0(dt);if(!started||!P||!ZZ||!ZZ.dg||!RM55.length)return;const x=P.px|0,y=P.py|0,r=RM55.find(q=>x>=q.x&&y>=q.y&&x<q.x+q.w&&y<q.y+q.h),k=r?Zk+'|'+r.x+'|'+r.y:'';
  if(k&&k!==RS55){RS55=k;if(r.ty!=='ingresso'&&RN55[r.ty]&&!(ZZ.boss&&r.ty==='santuario55')){const n=RN55[r.ty];if(typeof flt==='function')flt(P,'✦ '+n.charAt(0).toUpperCase()+n.slice(1),'#e8d8ff')}}else if(!k)RS55=''}}
{const l0=loadPost;loadPost=function(k){if(!(ZZ&&ZZ.dg)){RT55=null;RM55=[];LT55=[]}RS55='';l0(k)}}
