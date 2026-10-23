/* ================= 7.33: LA TUA CASA, GLI INTERNI SU MISURA E LE MURA DEL BORGO =================
   - Ogni casa del tuo insediamento si arreda da dentro (tasto V, o il pulsante ✏ Arreda quando sei dentro): il modello
     della casa (i dieci della storia: casetta, cottage, villetta, baita, torre del mago, casa del pescatore, villa, tenda,
     igloo, casale), il colore e il materiale dei muri e del pavimento, tutti gli arredi del gioco, il nome sulla porta e la musica.
   - Una delle case è LA TUA CASA: niente inquilini, il tuo nome sulla porta e un deposito per oggetti e monete.
   - Le mura del borgo si cambiano dall'editor (scheda Mura): il tipo (palizzata, pietra, mura merlate, mattoni, assi,
     muretto, siepe, ghiaccio, oro, ossidiana...), il colore, le porte dove vuoi, le torri (quante, il colore, lo stile). */
const HMOD={
  casetta:{n:"Casetta di legno",d:"Piccola e accogliente, perfetta per cominciare.",mu:0,pv:0,p:2000,lay:["############","#BB.S■...pS#","#..........#","#..........#","#nT........#","#nT........#","#..........#","#ł.........#","#..........#","#k.......pb#","#..........#","#####D######"]},
  cottage:{n:"Cottage di pietra",d:"Camera da letto separata e un caminetto in soggiorno.",mu:2,pv:3,p:2500,lay:["##############","#BB..#S■....S#","#....#.......#","#S...#...T...#","#.......nTn..#","#p...#.......#","######.#######","#............#","#........F...#","#............#","#k...........#","#p.........b.#","#............#","######D#######"]},
  villetta:{n:"Villetta con giardino",d:"Tre stanze e un giardinetto interno con alberi da frutto.",mu:3,pv:0,p:5000,lay:["################","#BB..S#S■S#..o.#","#.....#...#....#","#p....#...#.a..#","#...........o..#","#.....#...#....#","###.#####.###.##","#..............#","#.n..T....T..n.#","#.n..T....T..n.#","#..............#","#............ł.#","#..............#","#S...........k.#","#p............p#","#######D########"]},
  baita:{n:"Baita di montagna",d:"Un grande camino, legna da ardere e un tappeto caldo.",mu:1,pv:1,p:3500,lay:["#############","#LL.FF.■.SS.#","#...........#","#B..........#","#B...žžž....#","#....žžž..T.#","#....žžž..n.#","#...........#","#...........#","#.........b.#","#k..........#","#p.........p#","######D######"]},
  torre:{n:"Torre del mago",d:"Pianta ottagonale, cristalli che brillano e librerie piene di segreti.",mu:8,pv:10,p:6500,lay:["    #####    ","  ###.■.###  "," ##...S...## "," #.8.....8.# ","##.........##","#S....<....S#","#...........#","##....*....##"," #.........# "," ##.......## ","  ###...###  ","   ###D###   ","             "]},
  pescatore:{n:"Casa del pescatore",d:"Botti, reti, vasche per i pesci e un acquario.",mu:5,pv:1,p:3000,lay:["##############","#bb..k■k..bb.#","#............#","#..:......:..#","#............#","#B....TT.....#","#B....nn.....#","#............#","#:...........#","#..........ł.#","#............#","#k..b........#","#............#","######D#######"]},
  villa:{n:"Villa nobiliare",d:"Salone con colonne e tappeto, sala da pranzo e camera padronale.",mu:4,pv:4,p:8000,lay:["##################","#SS.SS..■..SS.SS.#","#................#","#.6....K.K....6..#","#................#","#.6..žžžžžžž..6..#","#....žžžžžžž.....#","#.6..žžžžžžž..6..#","#................#","####.########.####","#BB.....#........#","#.......#..TTT...#","#p......#..nnn...#","#.......#........#","#.......#.....*..#","#..............ł.#","#X..............p#","########D#########"]},
  tenda:{n:"Tenda del deserto",d:"Tappeti, un falò e sacchi di spezie, come a Khem.",mu:10,pv:7,p:1000,lay:["   #######   ","  ##.■...##  "," ##.......## ","##..žžžžž..##","#...žžžžž...#","#y..žžžžž..ƒ#","#...žžžžž...#","#i.........b#","##........## "," ##.......## ","  ##.....##  ","   ###D###   ","             "]},
  igloo:{n:"Igloo dei Picchi",d:"Ghiaccio fuori, braciere dentro. Il pupazzo di neve è compreso.",mu:9,pv:8,p:1500,lay:["   ######   ","  ##.■..##  "," ##......## ","##..9.....##","#.........ł#","#..B.......#","#..B....,..#","##........##"," #.......#  "," ##......## ","  ###D###   ","            "]},
  fattoria:{n:"Casale di campagna",d:"Orto interno, fieno, sacchi di farina e un abbeveratoio.",mu:3,pv:11,p:4000,lay:["################","#BB.S.■.#.ooo..#","#.......#......#","#p......#.a..a.#","#...........o..#","#.......#......#","#####.#####.####","#..............#","#yy....TT....ii#","#y.....nn.....i#","#..............#","#............F.#","#..............#","#:.L.......k.b.#","#..............#","#######D########"]},
};
const HMU=[["Legno chiaro","#c8a070"],["Legno scuro","#6b4a2b"],["Pietra","#8b8f99"],["Mattoni","#a0503a"],["Calce bianca","#e8e0d0"],["Azzurro","#6a9ac8"],["Verde salvia","#7a9a6a"],["Rosa antico","#c88a8a"],["Viola","#6a4a8a"],["Ghiaccio","#d8ecf4"],["Sabbia","#d8c08a"],["Notte","#2a2a3a"]];
const HPV=[["Parquet","#8a6a4a","#806244"],["Tavole scure","#5a4030","#523a2b"],["Pietra","#8a8a8a","#7e7e7e"],["Cotto","#b8704a","#ac6844"],["Marmo","#e8e4dc","#d8d4cc"],["Moquette rossa","#8a2a2a","#822828"],["Erba","#5a8a3a","#548236"],["Sabbia","#d8c08a","#d0b882"],["Neve","#eef4f8","#e4ecf2"],["Scacchiera","#e8e4dc","#3a3a3a"],["Blu notte","#2a3a5a","#26344f"],["Paglia","#d8b84a","#ccae44"]];
const HMUS=[["inter","Valzer della taverna"],["motel","Motel"],["notte","Notturno"],["town","Aldoria"],["forest","Foresta"],["sogno","Sogno"],["","Silenzio"]];
const HFAV=[["T","Tavolo"],["n","Panca"],["m","Sgabello"],["B","Letto"],["S","Libreria"],["k","Cassa"],["b","Botte"],["C","Bancone"],["p","Pianta"],["o","Aiuola"],["e","Rose"],["r","Alberello"],["a","Melo"],["¢","Cactus"],["ł","Lanterna"],["l","Lampione"],["ċ","Candele"],["F","Camino"],["ƒ","Falò"],[",","Braciere"],["K","Poltrona"],["X","Altare"],["6","Colonna"],["8","Cristalli"],["9","Pupazzo di neve"],["W","Pozzo"],[":","Vasca"],["y","Fieno"],["i","Sacchi"],["L","Legna"],["Ø","Tesoro"],[":","Acquario"],["ž","Tappeto rosso"],["ǁ","Tappeto blu"]];
const CSE={on:0,tool:'arr',dc:'T',q:'',hv:null,tab:'arr'};
const csHero=()=>(typeof NET!=='undefined'&&NET.name)||'l\'Eroe';
// tutti i tuoi insediamenti (dalla 7.34 possono essere più d'uno)
function csSets(){const L=[];if(P&&P.tw){if(P.tw.set)L.push(P.tw.set);for(const S of P.tw.sets||[])if(S&&!L.includes(S))L.push(S)}return L}
function csParse(k){const m=/^twi:(-?\d+),(-?\d+):(\d+):([a-z]+)$/.exec(String(k||''));return m?{rx:+m[1],ry:+m[2],i:+m[3],kind:m[4]}:null}
// di quale tuo insediamento è questo interno, e quale edificio
function csOf(k){const q=csParse(k);if(!q||q.i<60)return null;const rk=twK(q.rx,q.ry),S=csSets().find(s=>s.k===rk);if(!S||!S.lay||!S.lay.b)return null;const b=S.lay.b.find(x=>x.id===q.i-60);if(!b)return null;return{S,b,q}}
const csMine=(S,b)=>!!(P.tw.myh&&P.tw.myh.k===S.k&&P.tw.myh.id===b.id);
function csData(S,b,mk){S.int=S.int||{};if(!S.int[b.id]&&mk)S.int[b.id]={d:{}};return S.int[b.id]||null}
// l'interno con le scelte del giocatore
function csApply(k,z){const o=csOf(k);if(!o)return;const{S,b,q}=o,C=csData(S,b),mine=csMine(S,b);z.hk=S.k;z.hb=b.id;
  let L=z.lay.map(r=>[...r]);const md=C&&C.m&&q.kind==='casa'&&HMOD[C.m];
  if(md){const R=md.lay.map(r=>[...r]),n=Math.max(R.length,R[0].length);let dp=null;R.forEach((r,y)=>r.forEach((c,x)=>{if(c==='■'){dp=[x,y];r[x]='.'}}));
    L=[];for(let y=0;y<n;y++){const r=R[y]||[];const row=[];for(let x=0;x<n;x++)row.push(r[x]||' ');L.push(row)}z.N=n;z.dp0=dp;
    const fl=[];L.forEach((r,y)=>r.forEach((c,x)=>{if(c==='.'&&L[y+1]&&L[y+1][x]!=='D'&&!(dp&&dp[0]===x&&dp[1]===y))fl.push([x,y])}));const cx=n/2,cy=n/2;fl.sort((a,b2)=>Math.hypot(a[0]-cx,a[1]-cy)-Math.hypot(b2[0]-cx,b2[1]-cy));
    z.np=z.np.map((e,j)=>{const p=fl[Math.min(fl.length-1,j*3)]||[1,1];return[e[0],p[0],p[1]].concat(e.slice(3))});
    const pv=HPV[md.pv]||HPV[0],mu=HMU[md.mu]||HMU[0];z.fl=pv[1];z.fl2=pv[2];z.wall=mu[1]}
  else{z.dp0=null;for(let y=1;y<L.length-1&&!z.dp0;y++)for(let x=1;x<L[y].length-1;x++)if(L[y][x]==='.'&&L[y][x+1]==='.'&&L[y-1][x]==='#'){z.dp0=[x,y];break}}
  if(mine){z.np=[];z.n=(C&&C.n)||('Casa di '+csHero());L.forEach(r=>{for(let x=0;x<r.length;x++)if(r[x]==='c')r[x]='.'})}else if(C&&C.n)z.n=C.n;
  if(C){const np=new Set(z.np.map(e=>e[1]+','+e[2]));for(const kk in C.d||{}){const[x,y]=kk.split(',').map(Number),r=L[y];if(!r||r[x]===undefined||'#D '.includes(r[x])||np.has(kk))continue;if(L[y+1]&&L[y+1][x]==='D')continue;r[x]=C.d[kk]||'.'}
    if(C.pv!=null&&HPV[C.pv]){z.fl=HPV[C.pv][1];z.fl2=HPV[C.pv][2]}if(C.fa){z.fl=C.fa;z.fl2=C.fb||shx(C.fa,.94)}if(C.mu)z.wall=C.mu;if(C.mus!=null)z.mus=C.mus}
  z.lay=L.map(r=>r.join(''));const n=z.N;z.smf=new Map();z.smw=new Map();
  if(C&&C.fm!=null&&EMATI[C.fm]!=null)L.forEach((r,y)=>r.forEach((c,x)=>{if(c!=='#'&&c!==' ')z.smf.set(y*n+x,EMATI[C.fm])}));
  if(C&&C.ws&&EWALI[C.ws]!=null)L.forEach((r,y)=>r.forEach((c,x)=>{if(c==='#'&&(x===0||y===0))z.smw.set(y*n+x,[EWALI[C.ws],C.mu||''])}));
  if(mine){const dp=(C&&C.dp)||z.dp0||[1,1];z.ex=[{k:'ch',hd:1,rich:1,n:'Deposito',px:dp[0]+.5,py:dp[1]+.5}];z.dpp=dp}else{z.ex=null;z.dpp=null}}
const _twInt733=twInt;twInt=function(k){if(Z[k])return Z[k];const z=_twInt733(k);if(z)try{csApply(k,z)}catch(e){console.error(e)}return z};
function csRefresh(){const k=Zk;if(!csOf(k))return;const ox=P.px,oy=P.py;delete Z[k];twInt(k);load(k);if(M[oy|0]&&WK(M[oy|0][ox|0])){P.px=ox;P.py=oy}FC=null;const o=csOf(k);if(o&&typeof TWW!=='undefined')TWW.cache.delete(o.S.k)}
// gli arredi calpestabili (i tappeti) si calpestano anche in casa
const _loadPost733=loadPost;loadPost=function(k){_loadPost733(k);if(ZZ&&ZZ.hb!=null&&ZZ.twi){for(let y=0;y<N;y++)for(let x=0;x<N;x++){const d=DEC[y][x];if(M[y][x]===6&&d&&EDECI[d]&&EDECI[d].walk)M[y][x]=0}
    const o=csOf(k);if(o&&csMine(o.S,o.b)&&!P.tw.myhSeen){P.tw.myhSeen=1;banner('🏠 La tua casa','Tasto V (o ✏ Arreda): modello, colori, arredi, nome e musica · il forziere viola è il tuo deposito','casa')}}
  if(CSE.on&&!csHere())csClose();csBtn()};
const csHere=()=>!!(twOn()&&ZZ&&ZZ.hb!=null&&csOf(Zk));
/* ---- il deposito ---- */
const CSDEP=60;
function csDep(){P.tw.dep=P.tw.dep||{it:[],g:0};return P.tw.dep}
const _act733=act;act=function(e){if(e&&e.k==='ch'&&e.hd){pn('hdep');tone(300,.12,'triangle');return}_act733(e)};
function csDepHTML(){const D=csDep();let h=`<h3>🧳 Deposito di casa</h3><p class="mu">Quello che lasci qui resta al sicuro, anche se muori. ${D.it.length}/${CSDEP} oggetti.</p>
  <div class="csdg"><b>💰 ${D.g|0}</b> nel deposito · ${P.g|0} con te<br><button onclick="csGold(100)">Metti 100</button><button onclick="csGold(P.g|0)">Metti tutto</button><button onclick="csGold(-100)">Prendi 100</button><button onclick="csGold(-(csDep().g|0))">Prendi tutto</button></div><h4>Nel deposito</h4>`;
  h+=D.it.length?D.it.map((it,i)=>`<div class="it"><span>${fmt(it)}</span><button onclick="csTake(${i})">Prendi</button></div>`).join(''):'<p class="mu">Vuoto.</p>';
  h+='<h4>Nello zaino</h4>'+(P.inv.length?P.inv.map((it,i)=>`<div class="it"><span>${fmt(it)}</span><button onclick="csPut(${i})">Metti</button></div>`).join(''):'<p class="mu">Lo zaino è vuoto.</p>');return h+'<button onclick="cl()">Chiudi</button>'}
function csGold(v){const D=csDep();v=v|0;if(v>0){v=Math.min(v,P.g|0);P.g-=v;D.g=(D.g|0)+v}else{v=Math.min(-v,D.g|0);D.g-=v;P.g+=v}tone(700,.05,'triangle');save();hud();pn('hdep')}
function csPut(i){const D=csDep();if(D.it.length>=CSDEP){msg('Il deposito è pieno');return}const it=P.inv[i];if(!it)return;D.it.push(P.inv.splice(i,1)[0]);tone(500,.06,'triangle');save();pn('hdep')}
function csTake(i){const D=csDep();if(P.inv.length>=INV){msg('Zaino pieno');return}if(!D.it[i])return;P.inv.push(D.it.splice(i,1)[0]);tone(620,.06,'triangle');save();pn('hdep')}
const _pn733=pn;pn=function(m,arg){if(m==='hdep'&&twOn()){if(arg!==undefined)PA=arg;edPanel('hdep',csDepHTML());return}_pn733(m,arg)};
/* ---- la tua casa ---- */
function csSetMine(S,b){if(!S||!b||b.k!=='casa')return;P.tw.myh={k:S.k,id:b.id};S.int=S.int||{};for(const k in Z)if(k.startsWith('twi:')&&csOf(k))delete Z[k];if(typeof TWW!=='undefined')TWW.cache.delete(S.k);save()}
// costruire la tua casa: una casa nuova se c'è posto, se no una di quelle che ci sono
function csFound(){const S=P.tw.set;if(!S||!sedHere()){msg('La tua casa si costruisce nel tuo insediamento');return}if(!S.lay||!S.lay.v)sedCapture();const Ly=S.lay;
  let b=Ly.b.find(x=>x.k==='casa'&&csMine(S,x));if(b){msg('La tua casa c\'è già: entra dalla sua porta');return}
  const nc=Ly.b.filter(x=>x.k==='casa').length;if(nc<sedMaxCase()){const c=Ly.c,R=sedR();
    for(const[w,h]of[[5,4],[4,4],[4,3]])for(let r=3;r<R&&!b;r++)for(let i=0;i<32&&!b;i++){const a=i/32*6.283,nb={id:Ly.nid,k:'casa',x:Math.round(c[0]+Math.cos(a)*r)-(w>>1),y:Math.round(c[1]+Math.sin(a)*r)-1,w,h};if(!sedBldOK(nb))continue;
      const cl2=[];for(let v=nb.y;v<nb.y+h;v++)for(let u=nb.x;u<nb.x+w;u++)cl2.push([u,v]);if(sedBlocks(cl2))continue;const old=cl2.map(([x,y])=>M[y][x]);for(const[x,y]of cl2)M[y][x]=6;const d=sedBfs();cl2.forEach(([x,y],j)=>M[y][x]=old[j]);const[dx,dy]=sedDoor(nb);if(!sedReach(d,dx,dy))continue;
      nb.id=Ly.nid++;nb.wall='#e8dcc0';nb.roof='#a8402f';nb.smoke=1;Ly.b.push(nb);b=nb}}
  if(!b)b=Ly.b.find(x=>x.k==='casa');if(!b){msg('Non c\'è posto: allarga il borgo o togli qualcosa con l\'editor');return}
  csSetMine(S,b);setRebuild();save();jingle([60,64,67,72],.1,'triangle');banner('🏠 La tua casa',`È pronta: entra dalla porta e arredala come vuoi (tasto V)`,'casa')}
/* ---- l'editor degli interni ---- */
function csOpen(){if(!csHere()){msg('Si arreda da dentro una casa del tuo insediamento');return}cl();CSE.on=1;P.path=[];P.tg=null;document.body.classList.add('cseon');csUI();banner('✏ Arreda','Clicca sul pavimento per mettere gli arredi · cammina per spostarti','martello')}
function csClose(){CSE.on=0;document.body.classList.remove('cseon');const el=$('cse');if(el)el.hidden=true;save();csBtn()}
function csCost(c){return c&&Object.keys(c).some(k=>c[k]>0)?sedPayOK(c):true}
function csModelCost(k){const p=HMOD[k].p;return{legna:Math.round(p/100),pietra:Math.round(p/200),g:Math.round(p/10)}}
// mettere un arredo non deve chiudere un pezzo di casa
function csCanPut(x,y,c){const z=ZZ,L=z.lay;if(!L[y]||'#D '.includes(L[y][x]||' '))return'Qui c\'è un muro o la porta';if(L[y+1]&&L[y+1][x]==='D')return'Davanti alla porta no';
  if(ents.some(e=>(e.k==='npc'||e.k==='ch'||e.k==='po')&&(e.px|0)===x&&(e.py|0)===y)||((P.px|0)===x&&(P.py|0)===y))return'Qui c\'è qualcuno o qualcosa';
  const I=EDECI[c];if(I&&I.walk)return'';if(M[y][x]!==0)return'';const ex=ents.find(e=>e.k==='po'&&e.st==='exit');if(!ex)return'';
  const cnt=d=>{let n=0;for(let i=0;i<d.length;i++)if(d[i]>=0)n++;return n},sx=ex.px|0,sy=(ex.py|0)-1,a=cnt(bfs(sx,sy));M[y][x]=6;const b=cnt(bfs(sx,sy));M[y][x]=0;return b<a-1?'Così chiuderesti un pezzo della casa':''}
function csClick(x,y){const o=csOf(Zk);if(!o)return;const{S,b}=o,C=csData(S,b,1),z=ZZ,L=z.lay,k=x+','+y;
  if(CSE.tool==='del'){const c=L[y]&&L[y][x];if(!c||'#D. '.includes(c)){return}C.d[k]='.';csSetTile(x,y,'.');tone(300,.05,'triangle');save();return}
  if(CSE.tool==='dep'){if(!csMine(S,b))return;const why=csCanPut(x,y,'.');if(why&&why!=='Qui c\'è qualcuno o qualcosa'){msg(why);return}if(M[y][x]!==0||L[y][x]!=='.'){msg('Il deposito va sul pavimento libero');return}C.dp=[x,y];const e=ents.find(q=>q.hd);if(e){e.px=x+.5;e.py=y+.5}z.ex=[{k:'ch',hd:1,rich:1,n:'Deposito',px:x+.5,py:y+.5}];tone(520,.06,'triangle');save();return}
  const c=CSE.dc;if(L[y]&&L[y][x]===c)return;const why=csCanPut(x,y,c);if(why){msg(why);tone(150,.08);return}if(!csCost(sedDecCost(c)))return;C.d[k]=c;csSetTile(x,y,c);tone(560+Math.random()*80,.04,'triangle');save()}
function csSetTile(x,y,c){const z=ZZ,r=[...z.lay[y]];r[x]=c;z.lay[y]=r.join('');const I=EDECI[c];if(c==='.'){M[y][x]=0;DEC[y][x]=''}else{M[y][x]=I&&I.walk?0:6;DEC[y][x]=c}FC=null;if(typeof D3!=='undefined'&&D3.act&&typeof d3Reset==='function')d3Reset();if(CSE.on)csUI(1)}
function csSet(key,v){const o=csOf(Zk);if(!o)return;const{S,b}=o,C=csData(S,b,1);
  if(key==='m'){if(v===(C.m||'')){return}if(v&&!HMOD[v])return;if(v&&!confirm('Traslocare in «'+HMOD[v].n+'»? Gli arredi aggiunti si tolgono e si riparte da quelli del modello.'))return;if(v&&!csCost(csModelCost(v)))return;C.m=v||null;C.d={};delete C.dp;delete C.pv;delete C.fa;delete C.mu;csRefresh();csUI();return}
  if(key==='pv'){if(!csCost({g:8}))return;C.pv=+v;delete C.fa;delete C.fb}else if(key==='fa'){if(!csCost({g:8}))return;C.fa=v;C.fb=shx(v,.94)}else if(key==='mu'){if(!csCost({g:8}))return;C.mu=v}
  else if(key==='fm'){if(v){const mt=EMAT[EMATI[v]];if(!mt)return;const c=sedMatCost(mt),c2={};for(const r in c)c2[r]=c[r]*8;if(!csCost(c2))return;C.fm=v}else delete C.fm}
  else if(key==='ws'){if(v){const w=EWAL[EWALI[v]];if(!w)return;const c=sedWallCost(w),c2={};for(const r in c)c2[r]=c[r]*4;if(!csCost(c2))return;C.ws=v}else delete C.ws}
  else if(key==='n'){C.n=String(v||'').trim().slice(0,32)}else if(key==='mus'){C.mus=v}
  else if(key==='mine'){if(b.k!=='casa'){msg('Solo una casa può diventare la tua');return}if(!confirm('Fare di questa la tua casa? Chi ci abita si trasferisce in un\'altra casa del borgo.'))return;csSetMine(S,b);csRefresh();csUI();return}
  const z=ZZ;delete Z[Zk];const z2=twInt(Zk);Object.assign(z,{fl:z2.fl,fl2:z2.fl2,wall:z2.wall,mus:z2.mus,n:z2.n,smf:z2.smf,smw:z2.smw});Z[Zk]=z;FC=null;if(typeof D3!=='undefined'&&D3.act&&typeof d3Reset==='function')d3Reset();if(key==='mus'&&typeof music==='function')music(z.mus);if(key==='n'&&typeof TWW!=='undefined')TWW.cache.delete(S.k);save();csUI()}
function csDecList(){const q=(CSE.q||'').toLowerCase().trim();let L;if(!q&&CSE.tab!=='all')L=HFAV.map(([c,n])=>[c,n]);else L=EDEC.filter(d=>!(d.c[0]==='¿')&&(!q||d.n.toLowerCase().includes(q))).map(d=>[d.c,d.n]);
  if(!L.length)return'<p class="mu">Nessun arredo con questo nome.</p>';return`<div class="sedg">${L.map(([c,n])=>`<button title="${esc(n)} · ${esc(sedCostTxt(sedDecCost(c)))}" class="${CSE.dc===c&&CSE.tool==='arr'?'on':''}" onclick="CSE.dc=decodeURIComponent('${encodeURIComponent(c)}');CSE.tool='arr';csUI()"><i>${(SEDDN[c]&&SEDDN[c][0])||(SEDCI[(EDECI[c]||{}).k])||'🪑'}</i><small>${esc(n)}</small><em>${sedCostTxt(sedDecCost(c))}</em></button>`).join('')}</div>`}
function csUI(soft){let el=$('cse');if(!el){el=document.createElement('div');el.id='cse';document.body.appendChild(el)}if(!CSE.on){el.hidden=true;return}el.hidden=false;const o=csOf(Zk);if(!o){csClose();return}
  const{S,b,q}=o,C=csData(S,b)||{},mine=csMine(S,b),z=ZZ,sc=el.querySelector('.sedb'),top=sc?sc.scrollTop:0,T=CSE.tool,tb=(k,n)=>`<button class="${T===k?'on':''}" onclick="CSE.tool='${k}';csUI()">${n}</button>`;
  let h=`<div class="sedh"><b>✏ ${esc(z.n)}</b><span class="sedres">💰${P.g|0} 🪵${P.res.legna|0} 🪨${P.res.pietra|0}</span><button class="pri" onclick="csClose()">✔ Fine</button></div>
    <div class="sedt">${tb('arr','🪑 Arredi')}${tb('del','🧽 Gomma')}${mine?tb('dep','🧳 Deposito'):''}${tb('look','🎨 Casa')}</div><div class="sedb">`;
  if(T==='arr'){h+=`<p class="sedi">Scegli un arredo e clicca sul pavimento. I tappeti si calpestano.</p><input class="sedq" placeholder="Cerca fra tutti gli arredi..." value="${esc(CSE.q)}" oninput="CSE.q=this.value;csList()">
    <div class="sedr"><button class="${CSE.tab!=='all'?'on':''}" onclick="CSE.tab='arr';CSE.q='';csUI()">⭐ Di casa</button><button class="${CSE.tab==='all'?'on':''}" onclick="CSE.tab='all';csUI()">Tutti</button></div><div id="cslist">${csDecList()}</div>`}
  else if(T==='del')h+=`<p class="sedi">Clicca su un arredo per toglierlo.</p>`;
  else if(T==='dep')h+=`<p class="sedi">Clicca sul pavimento dove spostare il deposito (il forziere viola).</p>`;
  else{h+=`<div class="sedcu"><h5>${mine?'🏠 La tua casa':q.kind==='casa'?'🏠 Una casa del borgo':'🏛 '+esc(TWIK[q.kind]||'Edificio')}</h5>
      <label>Nome <input class="sedq" style="margin:0;width:170px" maxlength="32" value="${esc(C.n||'')}" placeholder="${esc(z.n)}" onchange="csSet('n',this.value)"></label>
      <label>Musica <select onchange="csSet('mus',this.value)">${HMUS.map(([k,n])=>`<option value="${k}" ${k===(C.mus!=null?C.mus:z.mus)?'selected':''}>${esc(n)}</option>`).join('')}</select></label>
      ${!mine&&b.k==='casa'?`<button onclick="csSet('mine',1)">🏠 Fanne la tua casa</button>`:''}</div>`;
    if(q.kind==='casa')h+=`<h5>Modello · trasloco</h5><div class="sedl"><button class="${!C.m?'on':''}" onclick="csSet('m','')">Casa del borgo <em>gratis</em></button>${Object.keys(HMOD).map(k=>`<button class="${C.m===k?'on':''}" title="${esc(HMOD[k].d)}" onclick="csSet('m','${k}')">${esc(HMOD[k].n)} <em>${sedCostTxt(csModelCost(k))}</em></button>`).join('')}</div>`;
    h+=`<h5>Muri · 8💰</h5><div class="sedr">${HMU.map(([n,c])=>`<button title="${esc(n)}" onclick="csSet('mu','${c}')"><i class="sedsw" style="background:${c}"></i></button>`).join('')}<label><input type="color" value="${z.wall||'#e0d0b0'}" onchange="csSet('mu',this.value)"></label></div>
      <label class="csl">Materiale <select onchange="csSet('ws',this.value)"><option value="">Intonaco</option>${EWAL.filter(w=>!w.open).map(w=>`<option value="${w.id}" ${C.ws===w.id?'selected':''}>${esc(w.n)} · ${esc(sedCostTxt(Object.fromEntries(Object.entries(sedWallCost(w)).map(([r,v])=>[r,v*4]))))}</option>`).join('')}</select></label>
      <h5>Pavimento · 8💰</h5><div class="sedr">${HPV.map(([n,a,b2],i)=>`<button title="${esc(n)}" onclick="csSet('pv',${i})"><i class="sedsw" style="background:linear-gradient(135deg,${a} 50%,${b2} 50%)"></i></button>`).join('')}<label><input type="color" value="${z.fl||'#8a6a4a'}" onchange="csSet('fa',this.value)"></label></div>
      <label class="csl">Materiale <select onchange="csSet('fm',this.value)"><option value="">Colori qui sopra</option>${EMAT.map(m=>`<option value="${m.id}" ${C.fm===m.id?'selected':''}>${esc(m.n)}</option>`).join('')}</select></label>`}
  h+=`</div><div class="sedf"><span class="mu">Il borgo da fuori: tasto V nel borgo</span></div>`;el.innerHTML=h;const s2=el.querySelector('.sedb');if(s2)s2.scrollTop=top;if(typeof iconFill==='function')iconFill(el)}
function csList(){const el=$('cslist');if(el)el.innerHTML=csDecList()}
// il pulsante per arredare, quando sei in una casa del tuo borgo
function csBtn(){let b=$('cseb');if(!b){b=document.createElement('button');b.id='cseb';b.textContent='✏ Arreda';b.onclick=()=>csOpen();document.body.appendChild(b)}b.style.display=started&&csHere()&&!CSE.on?'block':'none'}
{const pd=cv.onpointerdown;cv.onpointerdown=ev=>{if(!CSE.on){pd(ev);return}if(!csHere()){csClose();pd(ev);return}if(ev.button===2||ev.button===1){pd(ev);return}auInit();const tl=sedTile(ev);if(!tl)return;csClick(tl[0],tl[1]);ev.preventDefault&&ev.preventDefault()}}
addEventListener('pointermove',ev=>{if(CSE.on)CSE.hv=ev.target===cv?sedTile(ev):null});
function csOverlay(){if(!CSE.on||!CSE.hv)return;const[x,y]=CSE.hv;if(x<0||y<0||x>=N||y>=N)return;g.save();g.setTransform(DPR,0,0,DPR,0,0);const why=CSE.tool==='arr'?csCanPut(x,y,CSE.dc):CSE.tool==='del'?(M[y][x]===6||(DEC[y][x]&&ZZ.lay[y]&&!'#D. '.includes(ZZ.lay[y][x]))?'':'x'):(M[y][x]===0?'':'x');
  sedPoly(x,y,1,1,why?'rgba(255,80,80,.3)':'rgba(255,255,255,.25)',why?'#ff5050':'#ffffff');g.restore()}
const _sedOverlay733=sedOverlay;sedOverlay=function(){if(SED.on&&SED.tool==='mura'&&SED.hv&&sedHere()){const hv=SED.hv;SED.hv=null;_sedOverlay733();SED.hv=hv;const[x,y]=hv,Mu=P.tw.set.lay&&P.tw.set.lay.mura,ok2=csRing(x,y)&&(M[y][x]===1||(Mu&&Mu.g&&Mu.g[x+','+y]));
  g.save();g.setTransform(DPR,0,0,DPR,0,0);sedPoly(x,y,1,1,ok2?'rgba(255,216,74,.35)':'rgba(255,80,80,.25)',ok2?'#ffd84a':'#ff5050');g.restore();return}_sedOverlay733()};
const _draw733=draw;draw=function(){_draw733();if(CSE.on&&!(typeof D3!=='undefined'&&D3.act))csOverlay()};
if(typeof d3Overlay==='function'){const _d3o733=d3Overlay;d3Overlay=function(){_d3o733();if(CSE.on)csOverlay()}}
{const kd=onkeydown;onkeydown=e=>{if(e.target&&(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA'||e.target.tagName==='SELECT')){kd(e);return}
  if(started&&!PM&&(e.key==='v'||e.key==='V')&&!e.ctrlKey&&!e.metaKey&&csHere()){if(CSE.on)csClose();else csOpen();e.preventDefault();return}if(CSE.on&&e.key==='Escape'){csClose();e.preventDefault();return}kd(e)}}
{let ct=0;const _upd733=upd;upd=function(dt){_upd733(dt);if((ct+=dt)>.5){ct=0;if(CSE.on&&!csHere())csClose();csBtn()}}}
/* ---- le mura del borgo ---- */
const CSMW=['palizzata','pietra','mura','mattoni','legno','basso','siepe','roccia','cripta','ghiaccio','cristalli','ossidiana','oro','lavica'];
function csMuraCost(w){const len=Math.round(sedR()*6.3),c=/palizzata|legno/.test(w.id)?{legna:2}:w.id==='siepe'?{legna:1}:sedWallCost(w),c2={};for(const r in c)c2[r]=Math.ceil(c[r]*len/4);return c2}
function csMura(){const Ly=P.tw.set&&P.tw.set.lay;if(!Ly)return null;Ly.mura=Ly.mura||{g:{}};Ly.mura.g=Ly.mura.g||{};return Ly.mura}
function setMuraPost(C,Ly,cx,cy,R){const Mu=Ly.mura;if(!Mu)return;const z=C.z,n=C.n,si=Mu.s?EWALI[Mu.s]:Mu.c?EWALI.palizzata:null;if(si!=null&&!z.smw)z.smw=new Map();
  for(let y=cy-R-2;y<=cy+R+2;y++)for(let x=cx-R-2;x<=cx+R+2;x++){if(!C.ok(x,y))continue;const k=x+','+y;
    if(DEC[y][x]===DN+'W'&&M[y][x]===1){if(Mu.g&&Mu.g[k]){M[y][x]=0;DEC[y][x]=DN+'4';continue}if(si!=null){DEC[y][x]='';z.smw.set(y*n+x,[si,Mu.c||''])}}}
  for(const b of TB)if(b.twr){if(Mu.tc)b.wall=Mu.tc;if(Mu.tr)b.roof=Mu.tr;if(Mu.ts)b.st=Mu.ts;if(Mu.th)b.ht=Mu.th}}
const csMuraTn=()=>{const Mu=P.tw.set&&P.tw.set.lay&&P.tw.set.lay.mura;return Mu&&Mu.tn?Mu.tn:4};
function csRing(x,y){const Ly=P.tw.set.lay,c=Ly.c,R=sedR();return Math.abs(Math.hypot(x-c[0]-.5,y-c[1]-.5)-(R-.5))<1.4}
function csMuraSet(k,v){const Mu=csMura();if(!Mu)return;if(!setB('mura')){msg('Prima costruisci la palizzata dal registro (U)');return}const len=Math.round(sedR()*6.3);
  if(k==='s'){if(Mu.s===v)return;const w=EWAL[EWALI[v]];if(!w)return;if(!csCost(csMuraCost(w)))return;Mu.s=v;Mu.c=''}
  else if(k==='c'){if(!csCost({g:20}))return;Mu.c=v}else if(k==='tc'||k==='tr'){if(!csCost({g:15}))return;Mu[k]=v}
  else if(k==='ts'){Mu.ts=v||undefined}else if(k==='th'){Mu.th=clamp(+v|0,30,90)}else if(k==='tn'){v=+v;if(v>(Mu.tn||4)&&!csCost({pietra:12*(v-(Mu.tn||4))}))return;Mu.tn=v}
  sedApply()}
function csMuraClick(x,y){const Mu=csMura();if(!Mu||!setB('mura')){msg('Prima costruisci la palizzata dal registro (U)');return}const k=x+','+y;if(!csRing(x,y)){msg('Clicca sulle mura, lungo il confine del borgo');return}
  if(Mu.g[k]){if(sedBlocks([[x,y]])){msg('Chiudendo questa porta il borgo resterebbe isolato');return}delete Mu.g[k];tone(300,.06,'triangle');sedApply();return}
  if(M[y][x]!==1){msg('Qui non c\'è un pezzo di mura');return}if(!csCost({legna:4}))return;Mu.g[k]=1;tone(560,.06,'triangle');sedApply()}
const _sedClick733=sedClick;sedClick=function(x,y){if(SED.tool==='mura'){csMuraClick(x,y);return}return _sedClick733(x,y)};
const _sedUI733=sedUI;sedUI=function(){_sedUI733();const el=$('sed');if(!el||el.hidden||!SED.on)return;const t=el.querySelector('.sedt');if(t&&!t.querySelector('.csmt'))t.insertAdjacentHTML('beforeend',`<button class="csmt ${SED.tool==='mura'?'on':''}" onclick="sedTool('mura')">🏰 Mura</button>`);
  if(SED.tool==='bld'){const b=SED.sel&&SED.sel.b,S=P.tw.set;if(b&&b.k==='casa'&&S.lay.b.includes(b)){const cu=el.querySelector('.sedcu');if(cu)cu.insertAdjacentHTML('beforeend',csMine(S,b)?'<p class="mu">🏠 È la tua casa · entra per arredarla</p>':`<button onclick="csSetMine(P.tw.set,SED.sel.b);sedApply()">🏠 Fanne la tua casa</button>`)}}
  if(SED.tool!=='mura')return;const B=el.querySelector('.sedb');if(!B)return;const Mu=csMura()||{},len=Math.round(sedR()*6.3),th=TWSTH[P.tw.set.col|0]||TWSTH[0];
  if(!setB('mura')){B.innerHTML='<p class="sedi">Il borgo non ha ancora le mura: costruisci la Palizzata dal registro (U), poi qui la cambi come vuoi.</p>';return}
  B.innerHTML=`<p class="sedi">Clicca su un pezzo di mura per aprirci una porta (🪵4), su una porta per chiuderla. Le strade passano sempre.</p>
    <h5>Tipo di mura</h5><div class="sedl">${CSMW.map(id=>{const w=EWAL[EWALI[id]];if(!w)return'';const c2=csMuraCost(w);return`<button class="${(Mu.s||'')===id||(!Mu.s&&id==='palizzata')?'on':''}" onclick="csMuraSet('s','${id}')"><i class="sedsw" style="background:${w.c}"></i> ${esc(w.n)} <em>${sedCostTxt(c2)}</em></button>`}).join('')}</div>
    <div class="sedcu"><label>Colore delle mura · 20💰 <input type="color" value="${Mu.c||(EWAL[EWALI[Mu.s||'palizzata']]||EWAL[0]).c}" onchange="csMuraSet('c',this.value)"></label>
    ${setB('torre')?`<h5>Le torri</h5><label>Quante <select onchange="csMuraSet('tn',this.value)">${[4,6,8].map(v=>`<option ${(Mu.tn||4)===v?'selected':''}>${v}</option>`).join('')}</select></label>
      <label>Muri · 15💰 <input type="color" value="${Mu.tc||'#9a9284'}" onchange="csMuraSet('tc',this.value)"></label><label>Tetto · 15💰 <input type="color" value="${Mu.tr||th[2][0]}" onchange="csMuraSet('tr',this.value)"></label>
      <label>Stile <select onchange="csMuraSet('ts',this.value)"><option value="">Torre</option>${EBLD.filter(x=>!x.smoke).map(x=>`<option value="${x.st}" ${(Mu.ts||'')===x.st?'selected':''}>${esc(x.n)}</option>`).join('')}</select></label>
      <label>Altezza <input type="range" min="30" max="90" value="${Mu.th||40+setB('torre')*8}" onchange="csMuraSet('th',this.value)"></label>`:'<p class="mu">Con le Torri di guardia (registro) le mura hanno anche le torri.</p>'}</div>
    <p class="mu">${Object.keys(Mu.g||{}).length} porte aperte da te</p>`};
/* ---- nel registro ---- */
const _rgHTML733=rgHTML;rgHTML=function(){let h=_rgHTML733();const S=P.tw&&P.tw.set;if(RG.tab!=='set'||!S)return h;const mine=P.tw.myh&&csSets().some(s=>s.k===P.tw.myh.k);
  const card=`<div class="rgcard"><div><b>🏠 La tua casa</b><p class="mu">${mine?'Entra dalla sua porta e arredala (tasto V): modello, colori, materiali, arredi, nome, musica e il deposito.':'Una casa tutta tua nel borgo, da arredare come vuoi, con il deposito per oggetti e monete.'}${sedHere()?'':' · si costruisce quando sei nel borgo'}</p></div><span>${mine?`<span class="mu">${csDep().it.length} oggetti · ${csDep().g|0}💰 nel deposito</span>`:`<button class="pri" onclick="csFound()" ${sedHere()?'':'disabled'}>🏠 Costruisci la tua casa</button>`}</span></div>`;
  return h.replace('<h4>Personalizzare</h4>','<h4>Personalizzare</h4>'+card)};
for(const st of[...document.querySelectorAll('style')])if(st.textContent.includes('#sed{'))document.head.insertAdjacentHTML('beforeend','<style>'+st.textContent.replace(/#sed(?![a-z])/g,'#cse')+'</style>');
document.head.insertAdjacentHTML('beforeend',`<style>#cse{width:330px}#cse .sedg{display:grid;grid-template-columns:repeat(4,1fr);gap:4px}#cse .sedg button{display:flex;flex-direction:column;align-items:center;padding:4px 2px}#cse .sedg i{font-style:normal;font-size:18px}#cse .sedg small{font-size:9.5px;line-height:1.1;text-align:center}
#cse .csl{display:flex;gap:8px;align-items:center;margin:4px 0}#cse .csl select{flex:1;background:#222;color:#fff;border-radius:6px;border:1px solid #ffffff33;padding:3px}#cse .sedr{display:flex;flex-wrap:wrap;gap:4px;align-items:center}#cse .sedr .sedsw{width:18px;height:18px}
#cseb{position:fixed;right:14px;bottom:150px;z-index:40;display:none;font:600 14px system-ui,sans-serif;color:#1a1408;background:#ffd84a;border:none;border-radius:10px;padding:9px 14px;box-shadow:0 3px 12px #0007;cursor:pointer}
.csdg{background:#ffffff10;border-radius:8px;padding:8px;margin:6px 0}.csdg button{margin:4px 4px 0 0}</style>`);
