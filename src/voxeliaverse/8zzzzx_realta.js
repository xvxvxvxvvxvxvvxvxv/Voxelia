/* ================= IL VOXELIAVERSE: LE REALTÀ (8.15: nel gioco normale, in vista isometrica) =================
   Dalla stanza dietro la Corona (8zzzzw_stanza.js) si viaggia nelle realtà: i LIBRI della libreria sono realtà già
   scritte (si vedono il nome e il pericolo, e ci si può tornare), il CAMINO apre una realtà ignota, nuova a ogni viaggio.
   Dalla 8.15 una realtà è una zona del gioco come le altre: vista isometrica (o la vista 3D del gioco, se è accesa),
   l'eroe con il suo equipaggiamento, il combattimento del gioco (d'azione o classico), la mappa, le pozioni.
   Ogni realtà nasce da un numero (il seme) e da quel numero viene tutto, sempre uguale per lo stesso seme:
   - il NOME e i nomi dentro (il popolo, chi l'ha fondata, le creature, il guardiano): sillabe a caso;
   - un'ISOLA sospesa nel nulla (oltre il bordo c'è il cielo), di cinque forme: colli sparsi, terrazze di roccia, crateri
     con dentro il liquido, guglie altissime, canyon con le creste. Il mare fermo (o no), alberi, cristalli, funghi
     giganti, coralli o massi con i colori della realtà; il cielo (giorno, tramonto, notte o un sole di un altro colore);
   - le CREATURE: due o tre specie con un nome a caso e i colori della realtà (la palla che salta, la bestia che carica,
     il gigante, l'occhio che spara da lontano) e il GUARDIANO, un boss;
   - il MISTERO: tre segni (obelischi con un raggio di luce), ognuno protetto dalle sue creature; letti tutti e tre, in
     mezzo all'isola si sveglia il guardiano, e dietro di lui c'è il Cuore della realtà. Preso il Cuore la realtà è
     svelata (monete all'eroe). Dopo il guardiano la realtà si può SALVARE: resta in cima alla libreria e si ritrova
     com'era. La porta viola riporta nella stanza; chi muore in una realtà si risveglia nella stanza, senza perdere niente. */
const VXV={o:null};
function vxv(){if(!VXV.o){let o={};try{o=cr80()}catch(_){}let v=o.vxv;if(!v||typeof v!=='object')v={};v.b=Array.isArray(v.b)?v.b:[];v.n=v.n|0;v.k=v.k|0;VXV.o=v}return VXV.o}
function vxvSave(){try{const o=cr80();o.vxv=vxv();LS.set(CRK80,o)}catch(e){console.warn('Voxeliaverse',e)}}
/* ---- il caso, sempre uguale per lo stesso seme ---- */
function vxRng(s){let a=s>>>0;return()=>{a=a+0x6D2B79F5>>>0;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
const vxH2=(x,z,s)=>{let h=Math.imul(x|0,374761393)+Math.imul(z|0,668265263)+Math.imul(s|0,-2048144789)|0;h=Math.imul(h^h>>>13,1274126177);return((h^h>>>16)>>>0)/4294967296};
function vxNoise(x,z,s){const xi=Math.floor(x),zi=Math.floor(z),fx=x-xi,fz=z-zi,u=fx*fx*(3-2*fx),v=fz*fz*(3-2*fz);const a=vxH2(xi,zi,s),b=vxH2(xi+1,zi,s),c=vxH2(xi,zi+1,s),d=vxH2(xi+1,zi+1,s);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v}
function vxFbm(x,z,s,o){let r=0,a=.5,f=1,n=0;for(let i=0;i<(o||4);i++){r+=vxNoise(x*f,z*f,s+i*101)*a;n+=a;a*=.5;f*=2.03}return r/n}
const vxPk=(R,a)=>a[R()*a.length|0];
function vxHsl(h,s,l){h=((h%1)+1)%1;const f=n=>{const k=(n+h*12)%12,a=s*Math.min(l,1-l);return l-a*Math.max(-1,Math.min(k-3,9-k,1))};return'#'+[f(0),f(8),f(4)].map(v=>Math.round(clamp(v,0,1)*255).toString(16).padStart(2,'0')).join('')}
const vxRgb=h=>{const n=parseInt(h.slice(1),16);return[(n>>16)/255,(n>>8&255)/255,(n&255)/255]};
/* ---- i nomi: sillabe a caso, nomi che nessuno ha mai sentito ---- */
const VXN={on:['v','th','k','m','r','s','z','dr','gr','l','n','sh','x','b','f','h','y','kh','vr','q','t','g','j','ch','w','d','p'],vo:['a','e','i','o','u','a','e','o','ae','ei','ou','y','io','ia','ue'],mid:['n','r','l','m','s','th'],co:['','','n','r','th','sh','l','m','k','s','x','v','rn','sk','nd']};
// due o tre sillabe; dentro il nome al massimo una consonante in fondo alla sillaba, così si riesce a pronunciare
function vxName(R,n){n=n||2+(R()<.45?1:0);let s='';for(let i=0;i<n;i++){if(i>0||R()<.8){let o=vxPk(R,VXN.on);if(/[^aeiouy]$/.test(s)&&o.length>1)o=o[0];s+=o}let v=vxPk(R,VXN.vo);if(/[aeiouy]$/.test(s)&&v.length>1)v=v[0];s+=v;
    if(i===n-1){if(R()<.7)s+=vxPk(R,VXN.co)}else if(R()<.28)s+=vxPk(R,VXN.mid);if(i===0&&n>2&&R()<.15)s+="'"}
  s=s.replace(/(.)\1+/g,'$1').replace(/^y(?=[^aeiou])/,'Y').slice(0,10).replace(/'$/,'');return s.charAt(0).toUpperCase()+s.slice(1)}
/* ---- una realtà: tutto quello che si sa prima di entrarci (per la libreria) ---- */
const VXT=[['colli','hills'],['terrazze','terraces'],['crateri','craters'],['guglie','spires'],['canyon','canyons']];
const VXTM=[['giorno','day'],['tramonto','sunset'],['notte','night'],['un sole strano','a strange sun']];
const VXFL=[['alberi','trees'],['cristalli','crystals'],['funghi','mushrooms'],['coralli','corals'],['massi','boulders']];
const vxMus=n=>{try{for(const k of n)if(typeof TRK!=='undefined'&&TRK[k]){music(k);return}}catch(_){}};
function vxRealDesc(seed,ign){const R=vxRng(seed*7+13),d={seed,ign:!!ign};
  d.name=vxName(R,2+(R()<.5?1:0));d.people=vxName(R,2);d.founder=vxName(R,2+(R()<.3?1:0));
  d.type=R()*5|0;d.time=R()<.42?0:R()<.45?1:R()<.6?2:3;R();d.grav=1;d.liq=R()<.38;d.moons=d.time===0?(R()<.3?1:0):(R()*4|0);
  d.flora=[R()*5|0];if(R()<.55)d.flora.push(R()*5|0);d.flora=[...new Set(d.flora)];if(d.type===3)d.flora=d.flora.filter(f=>f!==4);if(!d.flora.length)d.flora=[0];
  d.dan=ign?Math.min(5,2+(R()*4|0)):1+(R()*4|0);d.hue=R();d.hue2=(d.hue+.25+R()*.5)%1;d.acc=vxHsl(d.hue2,.85,.62);d.col=vxHsl(d.hue,.5,.42);
  // le creature: due o tre specie, con forme diverse; almeno una combatte da vicino
  const SH=['blob','quad','alto','volo'],n=d.dan>2?3:2,sh=[];while(sh.length<n){const s=vxPk(R,SH);if(!sh.includes(s))sh.push(s)}if(sh.every(s=>s==='volo'))sh[0]='blob';
  d.sp=sh.map((s,i)=>({i,sh:s,n:vxName(R,2+(R()<.35?1:0)),seed:(seed*31+i*977)>>>0,col:vxHsl(d.hue+(R()-.5)*.3,.35+R()*.3,.25+R()*.2),col2:vxHsl(d.hue+(R()-.5)*.4,.3,.16+R()*.12),acc:vxHsl(R(),.9,.6),sc:.85+R()*.35}));
  d.gsh=R()<.6?'alto':vxPk(R,SH.filter(s=>s!=='volo'));d.gn=vxName(R,3);
  const GE=[['che custodisce il Cuore','who guards the Heart'],['l\'Ultimo dei {P}','the Last of the {P}'],['che non dorme mai','who never sleeps'],['dalle sette ombre','of the seven shadows'],['che ricorda tutto','who remembers everything'],['il Contatore','the Counter']];
  const ge=vxPk(R,GE);d.gt=[ge[0].replace('{P}',d.people),ge[1].replace('{P}',d.people)];
  // che cosa rende strana questa realtà: diventa il suo soprannome e una frase dei segni
  const F=[];const kk=[['','',''],['una','one'],['due','two'],['tre','three']][d.moons]||['',''];
  if(d.time===2)F.push([['dove il sole non è mai sorto','where the sun never rose'],['il sole non è mai sorto, e la notte non sa di essere notte','the sun has never risen, and the night doesn\'t know it is night']]);
  if(d.time===1)F.push([['del tramonto che non finisce','of the endless sunset'],['il tramonto dura da mille anni','the sunset has lasted a thousand years']]);
  if(d.time===3)F.push([['del sole di un altro colore','of the sun of another color'],['il sole è di un colore che non ha nome','the sun is a color that has no name']]);
  if(d.liq)F.push([['dove il mare non si muove','where the sea never moves'],['il mare è fermo da sempre, e ci si cammina sopra come su un vetro','the sea has always been still, and you walk on it as if on glass']]);
  if(d.flora.includes(1))F.push([['dove le pietre cantano','where the stones sing'],['le pietre crescono, e di notte cantano piano','the stones grow, and at night they sing softly']]);
  if(d.flora.includes(2))F.push([['dei funghi giganti','of the giant mushrooms'],['i funghi sono alti come torri, e respirano','the mushrooms are as tall as towers, and they breathe']]);
  if(d.moons>1)F.push([['dalle '+kk[0]+' lune','of the '+kk[1]+' moons'],['ci sono '+kk[0]+' lune, e nessuna gira dalla stessa parte','there are '+kk[1]+' moons, and none of them turns the same way']]);
  if(d.type===3)F.push([['dove le guglie toccano il cielo','where the spires touch the sky'],['le guglie sono più vecchie del cielo','the spires are older than the sky']]);
  if(d.type===2)F.push([['dei crateri che ricordano','of the craters that remember'],['ogni cratere è il ricordo di una stella caduta','every crater is the memory of a fallen star']]);
  F.push([['dove il vento ha un nome','where the wind has a name'],['il vento ha un nome, ma nessuno lo pronuncia','the wind has a name, but no one says it']]);
  const f1=F[R()*Math.max(1,F.length-1)|0]||F[0],f2=vxPk(R,F);d.ep=T88('La realtà '+f1[0][0],'The reality '+f1[0][1]);d.X=f2[1];
  // i segni e il Cuore: le frasi, con i nomi di questa realtà
  const K=1000+(R()*90000|0),V={N:d.name,P:d.people,F:d.founder,E:d.sp[0].n,G:d.gn,X:d.X[0],Xe:d.X[1]};
  const fill=(p)=>{let a=p[0],b=p[1];for(const k in V){a=a.split('{'+k+'}').join(V[k]);b=b.split('{'+k+'}').join(k==='X'?V.Xe:V[k])}a=a.split('{K}').join(K.toLocaleString('it-IT'));b=b.split('{K}').join(K.toLocaleString('en-US'));return T88(a,b)};
  const S1=[["Il primo segno. «Qui viveva il popolo dei {P}. Dicevano che {N} era nata da un sogno di {F}, e che il sogno non è ancora finito.»","The first sign. “Here lived the people of the {P}. They said {N} was born from a dream of {F}'s, and that the dream has not ended yet.”"],
    ["Il primo segno. «Siamo i {P}. Se leggi queste parole, {N} ti ha lasciato entrare. Non succede a molti.»","The first sign. “We are the {P}. If you are reading these words, {N} has let you in. That doesn't happen to many.”"],
    ["Il primo segno. «I {E} non sono sempre stati così. Una volta ci aiutavano a portare la luce. Poi il Cuore ha cominciato a battere troppo forte.»","The first sign. “The {E} were not always like this. Once they helped us carry the light. Then the Heart began to beat too loudly.”"],
    ["Il primo segno. Le lettere sono consumate, come se tante mani le avessero toccate. Si legge solo: «{F} è arrivato da una porta che non c'era.»","The first sign. The letters are worn, as if many hands had touched them. Only this can be read: “{F} came through a door that wasn't there.”"]];
  const S2=[["Il secondo segno. «{F} ha contato le realtà per tutta la vita. Arrivato a {K}, si è accorto che ne nascevano più di quante riuscisse a contarne, e ha smesso.»","The second sign. “{F} counted the realities all their life. Having reached {K}, they realized more were being born than they could count, and stopped.”"],
    ["Il secondo segno. «Il Cuore è dove la terra è più alta. Lo custodisce {G}, che una volta era uno di noi.»","The second sign. “The Heart lies where the land is highest. It is guarded by {G}, who was once one of us.”"],
    ["Il secondo segno. Una frase incisa più a fondo delle altre: «Quelli venuti da fuori portavano una corona con sette punte.»","The second sign. One phrase carved deeper than the others: “Those who came from outside wore a crown with seven points.”"],
    ["Il secondo segno. «In {N} {X}. Noi ci siamo abituati. Tu no, e questo ti salverà.»","The second sign. “In {N} {X}. We got used to it. You haven't, and that will save you.”"]];
  const S3=[["Il terzo segno. «Abbiamo chiuso il Cuore dietro tre segni, perché nessuno lo prendesse senza conoscerci. Adesso ci conosci.»","The third sign. “We locked the Heart behind three signs, so that no one would take it without knowing us. Now you know us.”"],
    ["Il terzo segno. Il nome di {N} è inciso qui per l'ultima volta. Sotto, scritto a mano, qualcuno ha aggiunto: «Vael è passato di qui.»","The third sign. The name {N} is carved here for the last time. Beneath it, by hand, someone has added: “Vael passed through here.”"],
    ["Il terzo segno. «Quando i segni si accendono tutti e tre, {G} si sveglia. Non odiarlo: ha solo aspettato troppo a lungo.»","The third sign. “When all three signs are lit, {G} wakes. Do not hate them: they have only waited too long.”"]];
  d.signs=[fill(vxPk(R,S1)),fill(vxPk(R,S2)),fill(vxPk(R,S3))];
  d.fin=fill(["Il Cuore di {N} batte nella tua mano. Per un attimo senti le voci dei {P}, tutte insieme; poi solo la tua. La realtà è svelata, ed è scritta nella libreria: potrai tornarci quando vuoi.","The Heart of {N} beats in your hand. For a moment you hear the voices of the {P}, all together; then only your own. The reality is unveiled, and it is written in the library: you can return whenever you like."]);
  return d}
/* ---- una realtà diventa una zona del gioco ---- */
const VX2={d:null,k:null,lit:[0,0,0],woke:0,boss:null,bossDead:0,won:0,saved:0,from:null,SG:[],C:null,kills:0};
const vx2K=d=>'vxr:'+d.seed;
function vx2Lv(d){let lv=1;try{lv=P&&P.lv||(LS.get(SAVEK,null)||{p:{lv:1}}).p.lv||1}catch(_){}return Math.max(2,Math.round(lv*.55)+d.dan*2)}
// le creature: i corpi del gioco, con i colori e i nomi della realtà
const VX2ST={blob:{hp:30,at:6,xp:9,sp:1.6,r:1.1,cd:1.2,ag:7},quad:{hp:32,at:7,xp:10,sp:2.7,r:1.1,cd:1,ag:8},alto:{hp:70,at:12,xp:18,sp:1.4,r:1.3,cd:1.5,ag:6},volo:{hp:34,at:9,xp:14,sp:1.6,r:4.5,cd:1.8,ag:8}};
function vx2Mob(s){const k=s.sc;if(s.sh==='blob')return blob(s.col,1.05*k);if(s.sh==='quad')return beast(s.col,1.1*k,s.col2);if(s.sh==='alto')return hum(s.col,s.col2,1.2*k,[3,s.acc]);return elem(s.col,.95*k)}
function vx2Reg(d){const k=vx2K(d),hu=d.hue,tm=d.time;
  d.sp.forEach((s,i)=>{E[k+':'+i]=Object.assign({n:s.n,m:vx2Mob(s)},VX2ST[s.sh],s.sh==='volo'?{rng:s.acc}:{})});
  const g0=d.sp[0];E[k+':g']={n:d.gn,hp:380,at:16,xp:220,sp:1.6,r:1.8,cd:1.5,ag:14,boss:1,slam:1,m:d.gsh==='quad'?drake(g0.col,g0.col2,1.5):hum(g0.col,g0.col2,2,[10,d.acc])};
  const sky=tm===0?[vxHsl(hu+.55,.55,.42),vxHsl(hu+.55,.5,.66),vxHsl(hu+.5,.45,.86)]:tm===1?[vxHsl(.75,.35,.3),vxHsl(.03,.6,.55),vxHsl(.09,.75,.72)]:tm===2?[vxHsl(hu+.6,.5,.05),vxHsl(hu+.6,.45,.12),vxHsl(hu+.55,.4,.2)]:[vxHsl(d.hue2,.5,.2),vxHsl(d.hue2,.55,.42),vxHsl(d.hue2+.05,.5,.64)];
  SKY[k]=sky;const mus=tm===2?'notte':tm===1?'desert':tm===3?'inter':'forest';
  Z[k]={n:d.name,lv:vx2Lv(d),N:56,a:vxHsl(hu,.4,.44),b:vxHsl(hu+.03,.37,.4),o:vxHsl(hu+.15,.45,.33),bg:sky[0],pool:vxHsl(d.hue2,.55,.45),rd:[vxHsl(hu+.08,.22,.5),vxHsl(hu+.08,.22,.46)],
    wl:vxHsl(hu+.5,.1,.42),wh:30,mus:TRK[mus]?mus:'forest',pt:'mote',gen:vx2Gen,dist:1,nolamp:1,vx2:d,en:[]};
  d._c={rock:vxHsl(hu+.5,.12,.4),rock2:vxHsl(hu+.5,.1,.32),rock3:vxHsl(hu+.45,.14,.5),rui:vxHsl(hu+.6,.08,.6),rui2:vxHsl(hu+.6,.08,.48),wood:vxHsl(hu+.9,.3,.26),
    leaf:vxHsl(hu+.15,.5,.36),leaf2:vxHsl(hu+.25,.5,.3),cry:vxHsl(d.hue2,.75,.58),cry2:vxHsl(d.hue2+.08,.8,.72),stem:vxHsl(hu+.1,.15,.78),cap:vxHsl(d.hue2+.5,.6,.46),spot:vxHsl(d.hue2,.8,.8),
    cor1:vxHsl(d.hue2+.1,.75,.58),cor2:vxHsl(d.hue2-.15,.75,.52),acc:d.acc,dim:'#9a9aa8'};
  return k}
/* ---- l'isola ---- */
function vx2Gen({n}){const k=Zk,d=Z[k].vx2,R=vxRng((d.seed^0x51ed)>>>0),sd=d.seed>>>0,c=(n-1)/2,RAD=n/2-3,st=(vxv().b.find(b=>b.s===d.seed&&b.sv&&b.st)||{}).st||null;
  Object.assign(VX2,{d,k,lit:[0,0,0],woke:0,boss:null,bossDead:0,won:0,saved:st?1:0,SG:[],C:[c|0,c|0],kills:0});
  const IN=(x,y)=>x>0&&y>0&&x<n-1&&y<n-1&&M[y][x]!==9,set=(x,y,v,ch)=>{if(IN(x,y)){M[y][x]=v;DEC[y][x]=ch||''}};
  for(let y=0;y<n;y++)for(let x=0;x<n;x++){const rr=Math.hypot(x-c,y-c)/RAD+(vxFbm(x/9,y/9,sd+7,3)-.5)*.42;M[y][x]=rr>1||x<1||y<1||x>n-2||y>n-2?9:0;DEC[y][x]=''}
  // la forma della terra
  const CR=[];if(d.type===2)for(let i=0;i<4;i++){const a=R()*6.283,r=6+R()*13;CR.push([c+Math.cos(a)*r,c+Math.sin(a)*r,2.5+R()*2])}
  for(let y=1;y<n-1;y++)for(let x=1;x<n-1;x++){if(M[y][x]===9)continue;const rr=Math.hypot(x-c,y-c)/RAD,hv=vxH2(x,y,sd),f=R();let ch='';
    if(d.type===0){if(f<.12)ch='f'}
    else if(d.type===1){const b=vxFbm(x/11,y/11,sd+3,3)*6;if(Math.abs(b-Math.round(b))<.08&&hv>.22)ch='r';else if(f<.05)ch='f'}
    else if(d.type===2){let inC=0;for(const[qx,qy,r]of CR){const t=Math.hypot(x-qx,y-qy);if(Math.abs(t-r)<.6&&hv>.18)ch='r';if(t<r-.6)inC=1}if(inC&&!ch){M[y][x]=2;continue}if(!ch&&f<.06)ch='f'}
    else if(d.type===3){if(vxFbm(x/6,y/6,sd+11,3)>.66&&hv>.35)ch='s';else if(f<.07)ch='f'}
    else{const rg=1-Math.abs(vxFbm(x/13,y/13,sd+5,4)*2-1);if(rg>.88)ch='r';else if(f<.06)ch='f'}
    if(!ch&&rr>.86&&hv>.8)ch='r';
    if(ch){M[y][x]=1;DEC[y][x]=ch}else if(d.liq&&vxFbm(x/10,y/10,sd+21,3)>.64)M[y][x]=2}
  // dove stanno i segni, la porta, il Cuore
  const a0=R()*6.283,SG=[0,1,2].map(i=>{const a=a0+i*2.094+(R()-.5)*.4,r=RAD*(.56+R()*.08);return[Math.round(c+Math.cos(a)*r),Math.round(c+Math.sin(a)*r)]});
  const sa=a0+1.047+(R()-.5)*.3,SP=[Math.round(c+Math.cos(sa)*RAD*.74),Math.round(c+Math.sin(sa)*RAD*.74)],C=[Math.round(c),Math.round(c)];
  const clear=(px,py,r)=>{for(let y=py-r;y<=py+r;y++)for(let x=px-r;x<=px+r;x++)if(IN(x,y)&&Math.hypot(x-px,y-py)<=r+.3){M[y][x]=0;DEC[y][x]=''}};
  // i sentieri: dal centro alla porta e a ogni segno (sul liquido, un ponte)
  const path=(ax,ay,bx,by)=>{const L=Math.hypot(bx-ax,by-ay),m=Math.ceil(L*2);for(let i=0;i<=m;i++){const x=Math.round(ax+(bx-ax)*i/m+Math.sin(i*.35+sd)*.6),y=Math.round(ay+(by-ay)*i/m);
    for(const[u,v]of[[0,0],[1,0],[0,1]]){const X=x+u,Y=y+v;if(!IN(X,Y))continue;if(M[Y][X]===2)M[Y][X]=4;else if(M[Y][X]===1){M[Y][X]=0;DEC[Y][X]=''}}}};
  path(C[0],C[1],SP[0],SP[1]);for(const p of SG)path(C[0],C[1],p[0],p[1]);
  clear(C[0],C[1],4);clear(SP[0],SP[1],2);for(const p of SG)clear(p[0],p[1],3);
  // l'altare del Cuore, con le colonne in cerchio
  for(let j=0;j<8;j++){const a=j/8*6.283+.39,x=Math.round(C[0]+Math.cos(a)*3.6),y=Math.round(C[1]+Math.sin(a)*3.6);if(IN(x,y)&&j%4!==1){M[y][x]=1;DEC[y][x]='p'}}
  M[C[1]][C[0]]=6;DEC[C[1]][C[0]]='';ents.push({k:'vx2d',s:'altar',px:C[0]+.5,py:C[1]+.5},{k:'vx2',s:'heart',px:C[0]+.5,py:C[1]+1.5});
  // i tre segni: l'obelisco (non si passa) e davanti il posto dove si legge
  SG.forEach(([x,y],j)=>{M[y][x]=6;DEC[y][x]='';ents.push({k:'vx2d',s:'obel',j,px:x+.5,py:y+.5},{k:'vx2',s:'sign',j,px:x+.5,py:y+1.5});
    for(let i=0;i<5;i++){const a=i/5*6.283+R(),r=2.6+R(),u=Math.round(x+Math.cos(a)*r),v=Math.round(y+Math.sin(a)*r);if(IN(u,v)&&M[v][u]===0&&(u!==x||v!==y+1)&&R()<.7){M[v][u]=1;DEC[v][u]='p'}}});
  VX2.SG=SG;VX2.C=C;
  // la porta per tornare nella stanza
  ents.push(po(SP[0],SP[1],'vx2stanza',{st:'void',n:T88('Torna dietro la Corona','Back behind the Crown')}));
  // lo stato di una realtà salvata
  if(st){VX2.lit=[0,1,2].map(i=>st.lit&&st.lit[i]?1:0);if(st.boss){VX2.woke=1;VX2.bossDead=1}if(st.heart)VX2.won=1}
  // le creature: le guardie dei segni e quelle che girano
  const free=(x0,y0,r0,r1)=>{for(let t2=0;t2<40;t2++){const a=R()*6.283,r=r0+R()*(r1-r0),x=Math.round(x0+Math.cos(a)*r),y=Math.round(y0+Math.sin(a)*r);if(IN(x,y)&&M[y][x]===0&&!ents.some(e=>(e.px|0)===x&&(e.py|0)===y))return[x,y]}return null};
  SG.forEach(([x,y],j)=>{if(VX2.lit[j])return;const g=2+(d.dan>3?1:0)+(d.dan>4?1:0);for(let i=0;i<g;i++){const q=free(x,y,1.5,3.5);if(!q)continue;const e=mk(k+':'+(i%d.sp.length),q[0],q[1]);e.vxg=j;ents.push(e)}});
  let w=st&&st.boss?Math.ceil((4+d.dan)/2):4+d.dan;for(let i=0;i<w*3&&w>0;i++){const q=free(c,c,6,RAD*.85);if(!q||Math.hypot(q[0]-SP[0],q[1]-SP[1])<8)continue;ents.push(mk(k+':'+(R()*d.sp.length|0),q[0],q[1]));w--}
  for(let i=0;i<2;i++){const q=free(c,c,6,RAD*.8);if(q&&Math.hypot(q[0]-SP[0],q[1]-SP[1])>8)ents.push({k:'ch',px:q[0]+.5,py:q[1]+.5})}
  // si parte accanto alla porta, verso il centro
  const dx=Math.sign(C[0]-SP[0]),dy=Math.sign(C[1]-SP[1]);return nearFree(SP[0]+dx,SP[1]+dy)}
/* ---- il disegno: rocce, guglie, colonne e la vegetazione della realtà (al posto degli alberi del gioco) ---- */
{const w0=wall;wall=function(x,y,h){const z=ZZ;if(!z||!z.vx2)return w0(x,y,h);vx2Wall(x,y,h,z.vx2)}}
{const o0=openW;openW=function(x,y){const z=ZZ;if(z&&z.vx2)return true;return o0(x,y)}}
function vx2Wall(x,y,h,d){const C=d._c,ch=DEC[y][x],v=vxH2(x,y,d.seed);
  if(ch==='r'){const ht=12+v*20;box(x+.04,y+.04,0,.92,.92,ht,(x+y)%3?C.rock:C.rock2,.9+h*.15);box(x+.18,y+.18,ht,.64,.64,4+v*5,C.rock3);return}
  if(ch==='s'){const ht=44+v*56;box(x+.12,y+.12,0,.76,.76,ht*.45,C.rock2,.95);box(x+.2,y+.2,ht*.45,.6,.6,ht*.35,C.rock);box(x+.3,y+.3,ht*.8,.4,.4,ht*.2,C.rock3,1.05);return}
  if(ch==='p'){const ht=v<.3?8+v*20:22+v*18;box(x+.2,y+.2,0,.6,.6,ht,C.rui,.95+h*.1);if(v>.3)box(x+.12,y+.12,ht,.76,.76,4,C.rui2);return}
  const f=d.flora[(v*d.flora.length)|0];
  if(f===0){const tall=10+v*8;box(x+.4,y+.4,0,.2,.2,tall,C.wood);if(v>.55){box(x+.12,y+.12,tall,.76,.76,8,C.leaf,1);box(x+.22,y+.22,tall+8,.56,.56,8,C.leaf2,1.05);box(x+.34,y+.34,tall+16,.32,.32,7,C.leaf,1.1)}else{box(x+.05,y+.05,tall-2,.9,.9,13,C.leaf,.9+h*.2);box(x+.22,y+.22,tall+11,.56,.56,7,C.leaf2,1.08)}return}
  if(f===1){box(x+.15,y+.3,0,.2,.2,16+v*16,C.cry,1.35);box(x+.5,y+.18,0,.18,.18,24+v*20,C.cry2,1.45);box(x+.42,y+.55,0,.16,.16,11+v*8,C.cry,1.35);if(NK>.3)nlight(x+.5,y+.5,16,46,rgbOf(C.cry),.45);return}
  if(f===2){const tall=12+v*22,r=.42+v*.12;box(x+.4,y+.4,0,.2,.2,tall,C.stem);box(x+.5-r,y+.5-r,tall,r*2,r*2,5,C.cap,1.02);box(x+.5-r*.6,y+.5-r*.6,tall+5,r*1.2,r*1.2,3,C.cap,1.08);box(x+.3,y+.62,tall+2,.08,.08,3,C.spot,1.5);box(x+.62,y+.3,tall+2,.08,.08,3,C.spot,1.5);if(NK>.3)nlight(x+.5,y+.5,tall,40,rgbOf(C.spot),.3);return}
  if(f===3){const c=v<.5?C.cor1:C.cor2;box(x+.4,y+.4,0,.14,.14,14+v*8,c,1.2);box(x+.25,y+.4,8,.12,.12,9,c,1.25);box(x+.55,y+.35,6,.12,.12,12,c,1.25);box(x+.4,y+.55,12,.1,.1,8,c,1.3);return}
  box(x+.08,y+.12,0,.84,.78,9+v*8,C.rock,.95+h*.1);box(x+.2,y+.22,9+v*8,.6,.55,5,C.rock3)}
// i disegni delle cose della realtà: l'obelisco (le rune e il raggio finché non è letto) e l'altare del Cuore
function vx2Deco(e){const d=VX2.d;if(!d||!d._c)return;const C=d._c,L=[];const q=(a,b,z,w,dd,h,c,l)=>L.push([a,b,z,w,dd,h,c,l]);
  if(e.s==='obel'){const lit=VX2.lit[e.j];q(-.42,-.42,0,.84,.84,6,C.rui2);q(-.26,-.26,6,.52,.52,48,C.rui);q(-.18,-.18,54,.36,.36,6,C.rui2);
    for(let i=0;i<4;i++){q(-.08,.26,12+i*10,.16,.03,4,lit?C.dim:C.acc,lit?.9:1.6);q(.26,-.08,12+i*10,.03,.16,4,lit?C.dim:C.acc,lit?.9:1.6)}
    drawL(L,e.px,e.py,0);if(!lit){const a0=g.globalAlpha;g.globalAlpha=a0*(.25+.12*Math.sin(t*3+e.j));box(e.px-.1,e.py-.1,60,.2,.2,170,C.acc,1.8);g.globalAlpha=a0;nlight(e.px,e.py,60,80,rgbOf(C.acc),.7)}return}
  if(e.s==='altar'){q(-.48,-.48,0,.96,.96,5,C.rui2);q(-.36,-.36,5,.72,.72,10,C.rui);q(-.44,-.44,15,.88,.88,3,C.rui2);drawL(L,e.px,e.py,0);
    if(!VX2.won){const z=26+Math.sin(t*2)*2,on=VX2.woke,c=on?C.acc:'#6a6a78',a0=g.globalAlpha;if(!on)g.globalAlpha=a0*.7;
      box(e.px-.16,e.py-.16,z,.32,.32,12,c,on?1.7:1);box(e.px-.24,e.py-.06,z+3,.48,.12,6,c,on?1.5:1);box(e.px-.06,e.py-.24,z+3,.12,.48,6,c,on?1.5:1);g.globalAlpha=a0;if(on)nlight(e.px,e.py,30,110,rgbOf(C.acc),.8)}
    else box(e.px-.1,e.py-.1,18,.2,.2,2,C.acc,1.3)}}
/* ---- le cose che si usano ---- */
function vx2Tip(e){const d=VX2.d;if(e.s==='sign'){if(VX2.lit[e.j])return T88('Un segno già letto','A sign already read');const n=ents.filter(q=>q.k==='en'&&q.vxg===e.j).length;return n?T88('Il segno è protetto: {0}','The sign is guarded: {0}').replace('{0}',n):T88('Leggi il segno','Read the sign')}
  if(e.s==='heart')return VX2.won?T88('Il Cuore è tuo','The Heart is yours'):!VX2.woke?T88('Il Cuore dorme','The Heart sleeps'):!VX2.bossDead?T88('{0} protegge il Cuore','{0} protects the Heart').replace('{0}',d.gn):T88('Prendi il Cuore di {0}','Take the Heart of {0}').replace('{0}',d.name);
  return ''}
function vx2Sign(j){const d=VX2.d;if(!d)return;if(VX2.lit[j]){msg(T88('Questo segno l\'hai già letto','You have already read this sign'));return}
  const n=ents.filter(e=>e.k==='en'&&e.vxg===j).length;if(n){msg(T88('Le creature di questo segno non te lo lasciano leggere: sconfiggile.','The creatures of this sign won\'t let you read it: defeat them.'));return}
  VX2.lit[j]=1;const c=VX2.lit.filter(v=>v).length,p=VX2.SG[j];if(cineOK())sparks(p[0]+.5,p[1]+.5,26,[d.acc,'#ffffff']);try{jingle([67,71,74,79],.12,'triangle')}catch(_){}
  pn('txt',{ti:'✦ '+T88('Segno {0} di 3','Sign {0} of 3').replace('{0}',c),sub:d.name,tx:d.signs[c-1]});
  if(c===3&&!VX2.woke){VX2.woke=1;setTimeout(vx2Wake,700)}}
function vx2Wake(){const d=VX2.d;if(!started||!ZZ||Zk!==VX2.k||VX2.boss)return;const[x,y]=nearFree(VX2.C[0]+2,VX2.C[1]+2);const e=mk(VX2.k+':g',x,y);e.al=1;ents.push(e);VX2.boss=e;
  banner(d.gn,d.gt[0],'corona');if(cineOK()){shake(.35);sparks(x+.5,y+.5,40,[d.acc,'#ffffff'])}try{tone(55,.9,'sawtooth',.05)}catch(_){}music('boss');
  msg(T88('La terra trema: in mezzo all\'isola si è svegliato {0}.','The ground shakes: in the middle of the island, {0} has woken.').replace('{0}',d.gn))}
function vx2BossDown(){const d=VX2.d;VX2.bossDead=1;VX2.boss=null;banner(T88('{0} è caduto','{0} has fallen').replace('{0}',d.gn),T88('Il Cuore della realtà è libero','The Heart of the reality is free'),'corona');music(Z[VX2.k].mus);
  if(!VX2.saved){const k=VX2.k,ask=()=>{if(!started||Zk!==k||VX2.saved)return;if(PM){setTimeout(ask,1000);return}vx2SaveAsk(0)};setTimeout(ask,2600)}}
function vx2Heart(){const d=VX2.d;if(!d)return;if(VX2.won){msg(T88('Il Cuore di questa realtà è già tuo','The Heart of this reality is already yours'));return}
  if(!VX2.woke){msg(T88('Il Cuore dorme: prima leggi i tre segni','The Heart sleeps: first read the three signs'));return}if(!VX2.bossDead){msg(T88('{0} protegge il Cuore','{0} protects the Heart').replace('{0}',d.gn));return}
  VX2.won=1;const v=vxv(),first=!v.b.some(b=>b.s===d.seed&&b.ok);vx2SaveReal(1);if(first)v.n++;vxvSave();const gold=first?Math.round(800*d.dan*(d.ign?1.5:1)):0;if(gold){P.g+=gold;hud()}save();
  if(cineOK())sparks(VX2.C[0]+.5,VX2.C[1]+.5,60,[d.acc,'#ffffff','#ffd66e']);try{jingle([60,64,67,72,76,79,84,88],.1,'triangle')}catch(_){}pn('vx2heart',{gold})}
/* ---- salvare una realtà (dopo il guardiano): resta nella libreria e si ritrova com'era ---- */
function vx2SaveReal(quiet){const d=VX2.d,v=vxv();if(!d)return;let b=v.b.find(x=>x.s===d.seed);if(!b)b={s:d.seed,f:d.ign?1:0};else v.b.splice(v.b.indexOf(b),1);v.b.unshift(b);
  b.sv=1;b.st={lit:VX2.lit.slice(),boss:VX2.bossDead?1:0,heart:VX2.won?1:0,t:Date.now()};if(VX2.won)b.ok=1;VX2.saved=1;v.k+=VX2.kills;VX2.kills=0;vxvSave();
  if(!quiet){msg(T88('{0} è salvata nella libreria: potrai tornarci quando vuoi.','{0} is saved in the library: you can return whenever you like.').replace('{0}',d.name));try{jingle([72,76,79],.1,'triangle')}catch(_){}}}
function vx2SaveAsk(leaving){pn('vx2save',{leaving})}
function vx2Back(){if(!started)return;cl();irisGo(()=>load('vx2stanza',Zk))}
function vx2Go(d,from){if(!started)return;cl();VX2.from=from;const k=vx2Reg(d);irisGo(()=>{load(k,'vx2stanza');
  if(VX2.saved)msg(T88('Sei tornato in {0}: è come l\'hai lasciata.','You are back in {0}: it is just as you left it.').replace('{0}',d.name));
  else setTimeout(()=>{if(started&&Zk===k)msg(T88('Tre raggi di luce: sono i segni. Leggili per trovare il Cuore di questa realtà.','Three beams of light: they are the signs. Read them to find the Heart of this reality.'))},2500)})}
function vx2Forget(seed,ok){const v=vxv(),b=v.b.find(x=>x.s===seed);if(!b)return;if(!ok){pn('vx2forget',{seed});return}delete b.sv;delete b.st;vxvSave();pn('vx2lib')}
/* ---- il camino e la libreria ---- */
function vxBooks(){const v=vxv();if(!v.i){v.i=1;for(let i=0;i<6;i++)v.b.push({s:(Math.random()*4294967295)>>>0});vxvSave()}return v.b}
const VX2CSS=`<style>#pn .vbk{display:flex;align-items:center;gap:12px;margin:8px 0;padding:8px 10px;border:1px solid #d4af3766;border-radius:8px;background:linear-gradient(90deg,var(--bk2),transparent)}#pn .vbk>i{width:16px;height:52px;border-radius:3px;background:linear-gradient(90deg,var(--bc),var(--bk));box-shadow:0 0 12px var(--bc);flex:none}#pn .vbk>div{flex:1;min-width:0;text-align:left}#pn .vbk b{display:block;font-size:17px}#pn .vbk span{display:block;font-size:13px;opacity:.85;font-style:italic}#pn .vbk small{display:block;font-size:11px;opacity:.7;margin-top:2px}#pn .vbk em{font-style:normal;color:#ffd66e}#pn .vbk button{flex:none}</style>`;
function vx2LibHTML(){const B=vxBooks(),v=vxv(),star=n=>'★'.repeat(n)+'☆'.repeat(5-n);
  const sst=b=>{const st=b.st;return' · 💾 '+esc(T88('salvata','saved'))+' · '+esc(T88('segni {0}/3','signs {0}/3').replace('{0}',(st.lit||[]).filter(x=>x).length))+(st.boss?' · '+esc(T88('guardiano sconfitto','guardian defeated')):'')+(st.heart?' · '+esc(T88('Cuore preso','Heart taken')):'')};
  const card=b=>{const d=vxRealDesc(b.s,b.f);return`<div class="vbk" style="--bc:${d.acc};--bk:${d.col};--bk2:${d.col}55"><i></i><div><b>${b.sv?'💾 ':''}${esc(d.name)}</b><span>${esc(d.ep)}</span><small>${esc(VXT[d.type][0])} · ${esc(VXTM[d.time][0])} · <em>${star(d.dan)}</em>${b.ok?' · ✦ '+esc(T88('svelata','unveiled')):''}${b.f?' · '+esc(T88('scritta da te','written by you')):''}${b.sv&&b.st?sst(b):''}</small></div>${b.sv?`<button title="${esc(T88('Dimentica','Forget'))}" onclick="vx2Forget(${b.s})">✕</button>`:''}<button onclick="vx2Go(vxRealDesc(${b.s},${b.f?1:0}),'lib')">${esc(b.sv?T88('Torna','Return'):T88('Apri','Open'))}</button></div>`};
  const SB=B.filter(b=>b.sv&&b.st),NB=B.filter(b=>!(b.sv&&b.st));
  return VX2CSS+`<h3>📚 ${esc(T88('La libreria','The library'))}</h3><p>${esc(T88('Centinaia di libri, e su nessuno c\'è scritto l\'autore. Quelli che brillano sono le porte delle realtà del Voxeliaverse: nessuno le ha mai contate davvero.','Hundreds of books, and none of them names its author. The glowing ones are the doors to the realities of the Voxeliaverse: no one has ever truly counted them.'))}</p>
  ${SB.length?`<h4>💾 ${esc(T88('Realtà salvate','Saved realities'))}</h4>${SB.map(card).join('')}<h4>📖 ${esc(T88('Libri da aprire','Books to open'))}</h4>`:''}${NB.map(card).join('')}
  <p class="mu">${esc(T88('Realtà svelate: {0}','Realities unveiled: {0}').replace('{0}',v.n))} · ${esc(T88('Creature sconfitte: {0}','Creatures defeated: {0}').replace('{0}',v.k))}</p>
  <button onclick="vxv().b.push({s:(Math.random()*4294967295)>>>0});vxvSave();pn('vx2lib');const p=$('pn');p.scrollTop=p.scrollHeight">📖 ${esc(T88('Cerca un altro libro','Look for another book'))}</button> <button onclick="cl()">${esc(T88('Chiudi','Close'))}</button>`}
function vx2FireHTML(){const v=vxv();return`<h3>🔥 ${esc(T88('Il camino','The fireplace'))}</h3><p>${esc(T88('Ti siedi davanti al fuoco e chiudi gli occhi. Le fiamme fanno un rumore che somiglia a una voce. Se lasci andare il pensiero, il fuoco ti porta in una realtà ignota: una che nessuno ha mai visto, e che non sarà mai uguale due volte.','You sit by the fire and close your eyes. The flames make a sound like a voice. If you let your thoughts go, the fire takes you into an unknown reality: one no one has ever seen, and that will never be the same twice.'))}</p>
  <p class="mu">${esc(T88('Le realtà ignote sono più pericolose dei libri. Dopo il guardiano puoi salvarle: la libreria le scrive per te.','Unknown realities are more dangerous than the books. After the guardian you can save them: the library writes them down for you.'))}${v.n?' · '+esc(T88('Realtà svelate: {0}','Realities unveiled: {0}').replace('{0}',v.n)):''}</p>
  <button onclick="vx2Go(vxRealDesc((Math.random()*4294967295)>>>0,1),'fire')">🔥 ${esc(T88('Medita e viaggia','Meditate and travel'))}</button> <button onclick="cl()">${esc(T88('Chiudi','Close'))}</button>`}
function vx2SaveHTML(e){const d=VX2.d;if(!d)return'';return`<h3>💾 ${esc(T88('Salvare {0}?','Save {0}?').replace('{0}',d.name))}</h3><p>${esc(T88('{0} è caduto. Se salvi questa realtà, resta nella libreria e potrai tornarci quando vuoi: la ritroverai com\'è adesso, con i segni letti e il guardiano sconfitto.','{0} has fallen. If you save this reality, it stays in the library and you can come back whenever you like: you will find it as it is now, with the signs read and the guardian defeated.').replace('{0}',d.gn))}</p>
  ${e&&e.leaving?`<button onclick="vx2SaveReal(1);vx2Back()">💾 ${esc(T88('Salva e torna nella stanza','Save and return to the room'))}</button> <button onclick="vx2Back()">${esc(T88('Torna senza salvare','Return without saving'))}</button> <button onclick="cl()">${esc(T88('Resta','Stay'))}</button>`
   :`<button onclick="cl();vx2SaveReal()">💾 ${esc(T88('Salva la realtà','Save the reality'))}</button> <button onclick="cl()">${esc(T88('Non ora','Not now'))}</button>`}`}
function vx2HeartHTML(e){const d=VX2.d,v=vxv();if(!d)return'';return`<h3>✦ ${esc(T88('Il Cuore di {0}','The Heart of {0}').replace('{0}',d.name))}</h3><p>${esc(d.fin)}</p>
  <p class="mu">${esc(T88('Realtà svelate: {0}','Realities unveiled: {0}').replace('{0}',v.n))}${e&&e.gold?' · '+esc(T88('{0} monete al tuo eroe','{0} coins for your hero').replace('{0}',e.gold.toLocaleString('it-IT'))):''}</p>
  <button onclick="cl()">${esc(T88('Resta ed esplora','Stay and explore'))}</button> <button onclick="vx2Back()">${esc(T88('Torna nella stanza','Back to the room'))}</button>`}
function vx2ForgetHTML(e){const b=vxv().b.find(x=>x.s===e.seed);if(!b)return'';const d=vxRealDesc(b.s,b.f);return`<h3>${esc(T88('Dimenticare {0}?','Forget {0}?').replace('{0}',d.name))}</h3><p>${esc(T88('Il libro torna come nuovo: la prossima volta i segni saranno da leggere e il guardiano di nuovo sveglio.','The book becomes new again: next time the signs will be unread and the guardian awake again.'))}</p><button onclick="vx2Forget(${e.seed},1)">${esc(T88('Dimentica','Forget'))}</button> <button onclick="pn('vx2lib')">${esc(T88('Annulla','Cancel'))}</button>`}
{const p0=pn;pn=function(m,arg){const F={vx2lib:vx2LibHTML,vx2fire:vx2FireHTML,vx2save:vx2SaveHTML,vx2heart:vx2HeartHTML,vx2forget:vx2ForgetHTML}[m];if(F&&started){if(arg!==undefined)PA=arg;edPanel(m,F(PA));return}return p0(m,arg)}}
/* ---- gli agganci al gioco ---- */
ITK.add('vx2');
{const e0=ent;ent=function(e){if(e&&e.k==='vx2d'){vx2Deco(e);return}if(e&&e.k==='vx2'){vx2Draw(e);return}return e0(e)}}
{const n0=nearAt;nearAt=function(L,mx,my){return n0(L.filter(e=>e.k!=='vx2d'),mx,my)}}
{const a0=act;act=function(e){if(e&&e.k==='po'&&e.to==='vx2stanza'&&ZZ&&ZZ.vx2&&VX2.bossDead&&!VX2.saved){vx2SaveAsk(1);return}if(!e||e.k!=='vx2')return a0(e);
  if(e.s==='sign')vx2Sign(e.j);else if(e.s==='heart')vx2Heart();else if(typeof vx2RoomAct==='function')vx2RoomAct(e)}}
// il segno che si legge e il Cuore: un cerchio di luce per terra e la scritta quando sei vicino
function vx2Draw(e){if(e.s==='sign'||e.s==='heart'){const d=VX2.d;if(!d)return;const on=e.s==='sign'?!VX2.lit[e.j]:VX2.woke&&!VX2.won,c=on?d.acc:'#8a8a98',a0=g.globalAlpha;g.globalAlpha=a0*(on?.55+.25*Math.sin(t*3):.3);box(e.px-.32,e.py-.32,0,.64,.64,1,c,1.5);g.globalAlpha=a0}
  else if(typeof vx2RoomDraw==='function')vx2RoomDraw(e);
  if(!D3B&&dist(e,P)<2.2){const tx=e.s==='sign'||e.s==='heart'?vx2Tip(e):(typeof vx2RoomTip==='function'?vx2RoomTip(e):'');if(tx){const sx=PX(e.px,e.py),sy=PY(e.px,e.py,0);g.textAlign='center';g.font='bold 10px Georgia,serif';label(tx,sx,sy-34,'#f0e8ff')}}}
// la luce della realtà (notte, tramonto, il sole strano) e il guardiano che cade
{const u0=upd;upd=function(dt){u0(dt);if(!started||!ZZ||!ZZ.vx2)return;const tm=ZZ.vx2.time;NK=tm===2?.92:tm===3?.35:0;DK=tm===1?.85:0;
  if(VX2.boss&&!VX2.bossDead&&!ents.includes(VX2.boss))vx2BossDown()}}
{const k0=kill;kill=function(e){if(ZZ&&ZZ.vx2&&e&&e.k==='en'&&ents.includes(e))VX2.kills++;return k0(e)}}
// chi muore in una realtà si sveglia nella stanza, senza perdere niente
{const d0=die;die=function(){if(started&&ZZ&&ZZ.vx2){const d=VX2.d;P.hp=P.mx;P.path=[];P.tg=null;VX2.kills=0;irisGo(()=>{load('vx2stanza',Zk);pn('txt',{ti:T88('La realtà ti respinge','The reality pushes you out'),sub:d.name,
    tx:T88('Ti svegli davanti al fuoco, con l\'odore di {0} ancora addosso. La realtà è sempre lì: puoi tornarci.','You wake by the fire, with the scent of {0} still on you. The reality is still there: you can go back.').replace('{0}',d.name)})});return}return d0()}}
for(const x of[...VXT,...VXTM,...VXFL])T88(x[0],x[1]);
T88('Torna nella stanza','Back to the room');T88('Apri','Open');T88('Torna','Return');T88('salvata','saved');T88('Dimentica','Forget');T88('Chiudi','Close');T88('Una realtà ignota','An unknown reality');
