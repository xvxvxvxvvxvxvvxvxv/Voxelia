/* ================= 8.9 · passo 5: LE REALTÀ DEL VOXELIAVERSE =================
   Dalla stanza dietro la Corona si viaggia nelle realtà: i LIBRI della libreria sono realtà già scritte (si vedono il nome,
   il pericolo, e ci si può tornare), il CAMINO apre una realtà ignota, nuova a ogni viaggio. Le realtà sono infinite:
   ognuna nasce da un numero (il seme) e da quel numero viene tutto, sempre uguale per lo stesso seme:
   - il NOME e i nomi dentro (il popolo, chi l'ha fondata, le creature, il guardiano): sillabe a caso, nomi mai sentiti;
   - la TERRA: un'isola di voxel sospesa nel nulla (colli, terrazze, crateri, guglie o canyon), con il mare fermo o senza,
     alberi, cristalli, funghi giganti, coralli o massi; il cielo (giorno, tramonto, notte o un sole di un altro colore),
     le lune, la gravità (in alcune si cade piano, in altre tutto pesa di più);
   - il MISTERO: tre segni (obelischi con un raggio di luce), ognuno protetto dalle sue creature; letti tutti e tre, sulla
     collina in mezzo si sveglia il guardiano, e dietro di lui c'è il Cuore della realtà. Preso il Cuore la realtà è
     svelata (e scritta nella libreria, se veniva dal camino);
   - le CREATURE: due o tre specie con un nome a caso e un corpo fatto a caso fra quattro forme (la palla che salta, la bestia
     a quattro zampe che carica, il gigante che schiaccia, l'occhio che vola e spara), più il guardiano;
   - il COMBATTIMENTO: clic (o J) per colpire con la spada, tre colpi di fila fanno il colpo forte; Maiusc, Q o il tasto
     destro per schivare rotolando (mentre si rotola non si viene colpiti; tenendo Maiusc poi si corre). I nemici prima di
     colpire si illuminano o disegnano un cerchio per terra: è il momento di schivare. */
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
  d.type=R()*5|0;d.time=R()<.42?0:R()<.45?1:R()<.6?2:3;const gr=R();d.grav=gr<.18?.55:gr<.27?1.3:1;d.liq=R()<.38;d.moons=d.time===0?(R()<.3?1:0):(R()*4|0);
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
  if(d.grav<1)F.push([['dove si cade piano','where you fall slowly'],['si cade piano, come se la terra non avesse fretta di riprenderti','you fall slowly, as if the ground were in no hurry to take you back']]);
  if(d.grav>1)F.push([['dove tutto pesa di più','where everything weighs more'],['ogni cosa pesa di più, anche i ricordi','everything weighs more, even memories']]);
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
/* ---- i corpi delle creature (scatole; guardano verso +z, poggiano a y=0) ---- */
function vxMobMesh(sp,boss){const V=[],R=vxRng(sp.seed),c=sp.col,c2=sp.col2,a=sp.acc;
  if(sp.sh==='blob'){const s=.9;vxBox(V,0,0,0,s,s*.8,s,c);vxBox(V,0,s*.8,0,s*.8,s*.12,s*.8,c2);vxBox(V,-s*.2,s*.42,s*.5,s*.16,s*.18,.04,a,1);vxBox(V,s*.2,s*.42,s*.5,s*.16,s*.18,.04,a,1);vxBox(V,0,s*.18,s*.5,s*.4,s*.06,.03,c2);
    const n=1+(R()*4|0);for(let i=0;i<n;i++)vxBox(V,(R()-.5)*s*.6,s*.92,(R()-.5)*s*.6,.1,.16+R()*.22,.1,a,.5)}
  else if(sp.sh==='quad'){vxBox(V,0,.42,0,.55,.42,1,c);vxBox(V,0,.36,0,.45,.06,.8,c2);for(const[x,z]of[[-.2,.35],[.2,.35],[-.2,-.35],[.2,-.35]])vxBox(V,x,0,z,.14,.44,.14,c2);
    vxBox(V,0,.55,.62,.42,.38,.4,c);vxBox(V,-.12,.72,.83,.09,.07,.03,a,1);vxBox(V,.12,.72,.83,.09,.07,.03,a,1);vxBox(V,0,.56,.84,.3,.06,.03,c2);vxBox(V,0,.72,-.66,.08,.08,.36,c2);
    const n=2+(R()*3|0);for(let i=0;i<n;i++)vxBox(V,0,.84,.3-i*.25,.08,.14+R()*.12,.12,a,.35)}
  else if(sp.sh==='alto'){for(const x of[-.15,.15])vxBox(V,x,0,0,.18,.75,.2,c2);vxBox(V,0,.75,0,.62,.8,.38,c);vxBox(V,0,1.02,.2,.18,.18,.04,a,1);for(const x of[-.42,.42])vxBox(V,x,.55,0,.17,.95,.18,c2);
    vxBox(V,0,1.57,0,.36,.34,.34,c);vxBox(V,0,1.7,.18,.24,.05,.03,a,1);for(const x of[-.14,.14])vxBox(V,x,1.9,0,.06,.2+R()*.16,.06,a,.4);vxBox(V,0,1.48,0,.7,.1,.42,c2)}
  else{vxBox(V,0,.2,0,.5,.5,.5,c,0,Math.PI/4);vxBox(V,0,.36,.33,.16,.16,.05,a,1);vxBox(V,0,.05,0,.12,.18,.12,c2);for(let i=0;i<6;i++){const q=i/6*6.283;vxBox(V,Math.cos(q)*.6,.38,Math.sin(q)*.6,.12,.12,.12,a,.6,q)}}
  if(boss){const top=sp.sh==='alto'?2.05:sp.sh==='blob'?.95:sp.sh==='quad'?1.0:.8;for(let i=0;i<8;i++){const q=i/8*6.283;vxBox(V,Math.cos(q)*.3,top+.08,Math.sin(q)*.3,.08,.16+(i%2)*.1,.08,a,.8,q)}}
  return V}
const VXTOP={blob:.95,quad:1,alto:2.05,volo:.9};
/* ---- la scena di una realtà ---- */
const VXR={};   // lo stato della realtà in cui si è (uno solo per volta)
function vxRealScene(d,from){const W=240,D=240,H=60,Q=VXS_VOX,cx=W/2,cz=D/2,RAD=W/2-8,sd=d.seed>>>0,R=vxRng(sd^0x9e3779b9);
  const SV=vxv().b.find(b=>b.s===d.seed&&b.sv&&b.st)||null;
  const sc={n:d.name,sub:(SV?'💾 ':d.ign?T88('Una realtà ignota','An unknown reality')+' · ':'')+d.ep,W,H,D,camDist:4.4,radius:22,grav:22*d.grav,combat:1,bound:[.3,W*Q-.3,.3,D*Q-.3],
    btns:[['a','⚔'],['r','↻']],hint:t=>t?T88('Joystick: cammina · ⚔ colpisci · ↻ schiva · ⤒ salta · ✋ usa','Joystick: walk · ⚔ strike · ↻ dodge · ⤒ jump · ✋ use'):T88('WASD: cammina · clic o J: colpisci · Maiusc, Q o tasto destro: schiva (tieni Maiusc: corri) · Spazio: salta · E: usa','WASD: walk · click or J: strike · Shift, Q or right click: dodge (hold Shift: run) · Space: jump · E: use')};
  const HM=new Int16Array(W*D).fill(-1),BM=new Int16Array(W*D),G=new Float32Array(W*D).fill(-1),ix=(x,z)=>x+W*z;
  /* la forma della terra */
  const base=(x,z)=>{const t=d.type;if(t===0)return 14+vxFbm(x/55,z/55,sd,4)*24;if(t===1)return 14+Math.floor(vxFbm(x/60,z/60,sd,4)*30/3)*3;if(t===2)return 16+vxFbm(x/45,z/45,sd,4)*12;if(t===3)return 14+vxFbm(x/50,z/50,sd,3)*9;
    const n=vxFbm(x/70,z/70,sd,4);return 12+Math.pow(1-Math.abs(n*2-1),1.6)*30};
  const CR=[];if(d.type===2)for(let i=0;i<5;i++){const a=R()*6.283,r=30+R()*60;CR.push([cx+Math.cos(a)*r,cz+Math.sin(a)*r,10+R()*14])}
  const hC=Math.min(H-18,Math.round(base(cx,cz)+8));
  // dove stanno i segni, la porta d'arrivo e il Cuore
  const a0=R()*6.283,SG=[0,1,2].map(i=>{const a=a0+i*2.094+(R()-.5)*.5,r=RAD*(.52+R()*.1);return[Math.round(cx+Math.cos(a)*r),Math.round(cz+Math.sin(a)*r)]});
  const sa=a0+1.047+(R()-.5)*.3,SP=[Math.round(cx+Math.cos(sa)*RAD*.7),Math.round(cz+Math.sin(sa)*RAD*.7)];
  const ss=(e0,e1,x)=>{const t=clamp((x-e0)/(e1-e0),0,1);return t*t*(3-2*t)};
  for(let z=0;z<D;z++)for(let x=0;x<W;x++){const rr=Math.hypot(x-cx,z-cz)/RAD+(vxFbm(x/38,z/38,sd+7,3)-.5)*.34;if(rr>1)continue;let h=base(x,z);
    for(const[qx,qz,r]of CR){const t=Math.hypot(x-qx,z-qz)/r;if(t<1)h-=(1-t*t)*r*.32;else if(t<1.45)h+=(1.45-t)/.45*r*.1}
    const k=ss(46,10,Math.hypot(x-cx,z-cz));h=h*(1-k)+hC*k;if(rr>.82)h-=(rr-.82)/.18*7;h=Math.max(8,Math.min(H-14,Math.round(h)));
    HM[ix(x,z)]=h;BM[ix(x,z)]=rr<.62?0:Math.max(0,Math.round(h-2-(1-(rr-.62)/.38)*h+vxH2(x,z,sd)*3))}
  // spianare intorno ai segni e alla porta (un piazzale per combattere e per leggere)
  const flat=(px,pz,rad)=>{let hv=HM[ix(px,pz)];if(hv<0)hv=12;for(let z=pz-rad-5;z<=pz+rad+5;z++)for(let x=px-rad-5;x<=px+rad+5;x++){if(x<0||z<0||x>=W||z>=D)continue;const i=ix(x,z);if(HM[i]<0)continue;const dd=Math.hypot(x-px,z-pz);const k=1-ss(rad,rad+5,dd);HM[i]=Math.round(HM[i]*(1-k)+hv*k);BM[i]=Math.min(BM[i],Math.max(0,HM[i]-4))}return hv};
  const SGH=SG.map(p=>flat(p[0],p[1],7)),SPH=flat(SP[0],SP[1],5);
  const pa=Math.atan2(cz-SP[1],cx-SP[0]),pc=Math.cos(pa+1.5708),ps=Math.sin(pa+1.5708),PO=[(SP[0]+.5)*Q,SPH*Q,(SP[1]+.5)*Q,pa];
  /* i colori */
  const hu=d.hue;
  const vox=()=>VX.vox,I=(x,y,z)=>x+W*(z+D*y),put=(x,y,z,v)=>{if(x>=0&&z>=0&&y>=0&&x<W&&y<H&&z<D)VX.vox[I(x,y,z)]=v},solidAt=(x,y,z)=>x>=0&&z>=0&&y>=0&&x<W&&y<H&&z<D&&VX.vox[I(x,y,z)]>0;
  const liqL=d.liq?14+(R()*5|0):0;
  sc.build=DV=>{const V0=vox();
    const P9={top:vxPal(vxHsl(hu,.42,.4)),top2:vxPal(vxHsl(hu+.05,.38,.34)),sub:vxPal(vxHsl(hu+.08,.25,.28)),r1:vxPal(vxHsl(hu+.5,.12,.36)),r2:vxPal(vxHsl(hu+.5,.1,.3)),r3:vxPal(vxHsl(hu+.45,.14,.42)),
    liq:vxPal(vxHsl(d.hue2,.55,.32),.22),rui:vxPal(vxHsl(hu+.6,.08,.55)),rui2:vxPal(vxHsl(hu+.6,.08,.45)),run:vxPal(d.acc,.95),spent:vxPal('#c8c8d8',.12),
    wood:vxPal(vxHsl(hu+.9,.3,.24)),leaf:vxPal(vxHsl(hu+.15+R()*.3,.5,.36)),leaf2:vxPal(vxHsl(hu+.2+R()*.3,.5,.3)),cry:vxPal(vxHsl(d.hue2,.75,.5),.3),cry2:vxPal(vxHsl(d.hue2+.08,.8,.62),.45),
    stem:vxPal(vxHsl(hu+.1,.15,.75)),cap:vxPal(vxHsl(d.hue2+.5,.6,.45)),spot:vxPal(vxHsl(d.hue2,.8,.75),.8),cor1:vxPal(vxHsl(d.hue2+.1,.75,.55),.25),cor2:vxPal(vxHsl(d.hue2-.15,.75,.5),.25),bou:vxPal(vxHsl(hu+.5,.08,.4))};

    for(let z=0;z<D;z++)for(let x=0;x<W;x++){const i=ix(x,z),h=HM[i];if(h<0)continue;const b=BM[i],p2=vxNoise(x/7,z/7,sd+3)>.62;
      for(let y=b;y<h;y++)V0[I(x,y,z)]=y===h-1?(p2?P9.top2:P9.top):y>=h-3?P9.sub:[P9.r1,P9.r2,P9.r3][(((y+((x*3+z)&1))/3|0)%3)];
      let g=h;if(d.liq&&h<liqL){for(let y=h;y<liqL;y++)V0[I(x,y,z)]=P9.liq;g=liqL}G[i]=g*Q}
    // le guglie
    const nsp=d.type===3?16:R()<.3?4:0;for(let k=0;k<nsp;k++){const x0=R()*W|0,z0=R()*D|0,i=ix(x0,z0);if(HM[i]<0||Math.hypot(x0-cx,z0-cz)<22||SG.some(p=>Math.hypot(x0-p[0],z0-p[1])<13)||Math.hypot(x0-SP[0],z0-SP[1])<12)continue;
      const r0=2+R()*2.6,hh=16+R()*26,g=HM[i];for(let y=g;y<Math.min(H-2,g+hh);y++){const r=r0*(1-(y-g)/hh*.8)+vxNoise(y/4,k,sd)*.8;for(let z=-5;z<=5;z++)for(let x=-5;x<=5;x++)if(x*x+z*z<=r*r)put(x0+x,y,z0+z,[P9.r1,P9.r2,P9.r3][((y/4|0)+k)%3])}
      for(let z=-3;z<=3;z++)for(let x=-3;x<=3;x++)if(x*x+z*z<=r0*r0){const j=ix(x0+x,z0+z);if(j>=0&&j<W*D&&HM[j]>=0)for(let y=BM[j];y<g;y++)put(x0+x,y,z0+z,P9.r2)}}
    // i segni: un obelisco con le rune che brillano, e intorno le rovine
    VXR.runes=[[],[],[]];VXR.spent=P9.spent;SG.forEach(([sx,sz],k)=>{const g=SGH[k];for(let y=g;y<g+2;y++)for(let z=-2;z<=2;z++)for(let x=-2;x<=2;x++)put(sx+x,y,sz+z,P9.rui2);
      for(let y=g+2;y<g+15;y++)for(let z=-1;z<=1;z++)for(let x=-1;x<=1;x++){const edge=Math.abs(x)===1&&Math.abs(z)===1,rune=!edge&&(y-g)%3===1&&(x===0||z===0)&&!(x===0&&z===0);put(sx+x,y,sz+z,rune?P9.run:P9.rui);if(rune)VXR.runes[k].push([sx+x,y,sz+z])}
      put(sx,g+15,sz,P9.run);VXR.runes[k].push([sx,g+15,sz]);
      const n=6+(R()*3|0);for(let j=0;j<n;j++){const a=j/n*6.283+R()*.3,r=8+R()*2,px=Math.round(sx+Math.cos(a)*r),pz=Math.round(sz+Math.sin(a)*r),pi=ix(px,pz);if(px<0||pz<0||px>=W||pz>=D||HM[pi]<0)continue;const gh=HM[pi],ph=R()<.3?3+(R()*3|0):6+(R()*10|0);
        for(let y=gh;y<gh+ph;y++)for(let z=0;z<2;z++)for(let x=0;x<2;x++)if(!(y===gh+ph-1&&R()<.35))put(px+x,y,pz+z,y%4===0?P9.rui2:P9.rui);if(R()<.5){const fx=px+(R()<.5?3:-3),fz=pz+(R()<.5?2:-2),fi=ix(fx,fz);if(fx>=0&&fz>=0&&fx<W&&fz<D&&HM[fi]>=0)for(let x=0;x<4;x++)put(fx+x,HM[fi],fz,P9.rui2)}}});
    // la collina del Cuore: il piedistallo e un cerchio di colonne
    for(let y=hC;y<hC+3;y++)for(let z=-2;z<=2;z++)for(let x=-2;x<=2;x++)if(Math.abs(x)+Math.abs(z)<4)put(cx+x,y,cz+z,y===hC+2?P9.rui:P9.rui2);
    for(let j=0;j<8;j++){const a=j/8*6.283,px=Math.round(cx+Math.cos(a)*9),pz=Math.round(cz+Math.sin(a)*9),ph=j%3===0?6:11+(j%2)*4;for(let y=hC;y<hC+ph;y++)for(let z=0;z<2;z++)for(let x=0;x<2;x++)put(px+x,y,pz+z,y===hC+ph-1?P9.run:P9.rui)}
    // la porta d'arrivo: due colonne e un architrave (dentro, la luce che riporta nella stanza)
    
    for(const s of[-4,4]){const px=Math.round(SP[0]+pc*s),pz=Math.round(SP[1]+ps*s);for(let y=SPH;y<SPH+14;y++)for(let z=0;z<2;z++)for(let x=0;x<2;x++)put(px+x,y,pz+z,P9.rui)}
    for(let s=-4;s<=5;s++){const px=Math.round(SP[0]+pc*s),pz=Math.round(SP[1]+ps*s);for(let y=SPH+14;y<SPH+16;y++)put(px,y,pz,y===SPH+15?P9.rui2:P9.rui);put(px+1,SPH+14,pz,P9.rui)}
    // la vegetazione (e i cristalli, i funghi, i coralli, i massi): mai sui segni, sul Cuore o sulla porta
    const free=(x,z,m)=>Math.hypot(x-cx,z-cz)>14+m&&!SG.some(p=>Math.hypot(x-p[0],z-p[1])<12+m)&&Math.hypot(x-SP[0],z-SP[1])>9+m;
    const dens=[90,60,40,50,70];for(const fl of d.flora)for(let k=0;k<dens[fl]*(d.flora.length>1?.65:1);k++){const x0=4+R()*(W-8)|0,z0=4+R()*(D-8)|0,i=ix(x0,z0);if(HM[i]<0||!free(x0,z0,2)||(d.liq&&HM[i]<liqL&&fl!==3))continue;const g=Math.round(G[i]/Q);
      if(Math.hypot(x0-cx,z0-cz)/RAD>.9)continue;
      if(fl===0){const th=8+R()*9|0,cone=R()<.4;for(let y=g;y<g+th;y++)for(let z=0;z<2;z++)for(let x=0;x<2;x++)put(x0+x,y,z0+z,P9.wood);const r=3.5+R()*3;
        for(let y=-r;y<=r*(cone?2:1);y++)for(let z=-r;z<=r;z++)for(let x=-r;x<=r;x++){const rr=cone?r*(1-(y+r)/(r*3)):r;if(x*x+z*z+(cone?0:y*y)<=rr*rr&&vxH2(x0+x*3,z0+z*5+y*7,sd)>.12)put(x0+x+1,g+th+y,z0+z+1,vxH2(x0+x,y,z0+z)>.5?P9.leaf:P9.leaf2)}}
      else if(fl===1){const n=2+(R()*4|0);for(let j=0;j<n;j++){const h=4+R()*12|0,dx=(R()-.5)*.8,dz=(R()-.5)*.8,ox=(R()*5|0)-2,oz=(R()*5|0)-2;for(let y=0;y<h;y++){const px=Math.round(x0+ox+dx*y),pz=Math.round(z0+oz+dz*y);put(px,g+y,pz,y>h-3?P9.cry2:P9.cry);if(y<h*.5)put(px+1,g+y,pz,P9.cry)}}}
      else if(fl===2){const th=7+R()*14|0,r=4+R()*5;for(let y=g;y<g+th;y++)for(let z=0;z<2;z++)for(let x=0;x<2;x++)put(x0+x,y,z0+z,P9.stem);
        for(let z=-r;z<=r;z++)for(let x=-r;x<=r;x++){const q=x*x+z*z;if(q>r*r)continue;put(x0+x,g+th,z0+z,(x*7+z*3)%9===0?P9.spot:P9.cap);if(q<r*r*.55)put(x0+x,g+th+1,z0+z,P9.cap);if(q<r*r*.2)put(x0+x,g+th+2,z0+z,P9.cap)}}
      else if(fl===3){const c=R()<.5?P9.cor1:P9.cor2,br=3+(R()*3|0);for(let b=0;b<br;b++){let x=x0,z=z0,y=g;const n=5+R()*9|0;for(let s=0;s<n;s++){put(x,y,z,c);y++;if(R()<.4)x+=R()<.5?1:-1;if(R()<.4)z+=R()<.5?1:-1}}}
      else{const r=1.6+R()*2.6;for(let y=-r;y<=r;y++)for(let z=-r;z<=r;z++)for(let x=-r;x<=r;x++)if(x*x*1.1+y*y*1.6+z*z<=r*r)put(x0+x,g+y,z0+z,P9.bou)}}
    // l'erba, i fiori, le pietre sparse (decorazioni: non fermano)
    const gc=vxHsl(hu+.04,.45,.46),gc2=vxHsl(hu-.03,.4,.38),fc=d.acc;for(let k=0;k<3200;k++){const x0=R()*W,z0=R()*D,i=ix(x0|0,z0|0);if(HM[i]<0||(d.liq&&HM[i]<liqL))continue;const y0=HM[i]*Q;if(solidAt(x0|0,HM[i],z0|0))continue;
      if(R()<.9)vxBox(DV,x0*Q,y0,z0*Q,.035,.08+R()*.18,.035,R()<.5?gc:gc2,0,R()*3);else vxBox(DV,x0*Q,y0,z0*Q,.06,.06,.06,fc,.7)}
    // i massi che galleggiano nel nulla intorno all'isola (sagome nella nebbia)
    for(let k=0;k<34;k++){const a=R()*6.283,r=30+R()*34,s=.6+R()*3.2;vxBox(DV,cx*Q+Math.cos(a)*r,-8+R()*26,cz*Q+Math.sin(a)*r,s,s*(.6+R()*.8),s,vxHsl(hu+.5,.1,.25+R()*.1),0,R()*3)}
    VXR.G=G;VXR.HM=HM};
  /* la luce: il cielo di questa realtà */
  const tm=d.time,sunEl=tm===0?.75+R()*.2:tm===1?.16+R()*.1:tm===2?.6:.35+R()*.4,sunAz=R()*6.283,sdv=[Math.cos(sunAz)*Math.cos(sunEl),-Math.sin(sunEl),Math.sin(sunAz)*Math.cos(sunEl)];
  const skyH=tm===3?d.hue2:d.hue+.55,fogC=tm===0?vxRgb(vxHsl(skyH,.45,.72)):tm===1?vxRgb(vxHsl(.04+R()*.06,.6,.5)):tm===2?vxRgb(vxHsl(skyH,.5,.06)):vxRgb(vxHsl(skyH,.5,.3));
  const sunC=tm===0?[1.15,1.05,.92]:tm===1?[1.2,.62,.35]:tm===2?[.32,.4,.62]:vxRgb(vxHsl(d.hue2,.8,.6)).map(v=>v*1.2);
  const L0={sd:sdv,sc:sunC,sky:tm===2?[.1,.1,.17]:fogC.map(v=>v*.55),gnd:tm===2?[.05,.04,.05]:vxRgb(vxHsl(hu,.3,.25)).map(v=>v*.6),fog:fogC,fogD:tm===2?.034:.026};
  sc.light=()=>L0;
  sc.center=()=>{const p=VX.pl,s=.5;return[Math.round(p.x/s)*s,Math.max(2,Math.round(p.y/s)*s),Math.round(p.z/s)*s]};
  const accC=vxRgb(d.acc);
  const sx=SG.map(p=>[(p[0]+.5)*Q,p[1]]),STAR=[...Array(tm===0?0:tm===1?60:240)].map((_,i)=>{const a=vxH2(i,1,sd)*6.283,e=.08+vxH2(i,2,sd)*1.4;return[cx*Q+Math.cos(a)*Math.cos(e)*100,Math.sin(e)*100-10,cz*Q+Math.sin(a)*Math.cos(e)*100,.4+vxH2(i,3,sd)*.6]});
  const MOON=[...Array(d.moons)].map((_,i)=>{const a=sunAz+2+i*1.3,e=.35+i*.22;return[Math.cos(a)*Math.cos(e),Math.sin(e),Math.sin(a)*Math.cos(e),5+R()*7,vxRgb(vxHsl(d.hue2+i*.2,.35,.82))]});
  /* lo stato: l'eroe, le creature, il mistero */
  let lv=1;try{const s=LS.get(SAVEK,null);if(s&&s.p)lv=s.p.lv|0||1}catch(_){}
  Object.assign(VXR,{d,sc,hp:Math.min(320,110+lv*3),mx:Math.min(320,110+lv*3),dmg:Math.min(55,13+lv*.6),atk:0,atkK:0,combo:0,comboT:0,q:0,hitDone:0,iT:0,dCd:0,roll:0,hurtT:-9,lastHit:-9,dead:0,
    portal:PO,sv:SV,saved:SV?1:0,bossDead:0,safe:null,safeT:0,E:[],shots:[],rings:[],fx:[],orbs:[],nums:[],lit:[0,0,0],woke:0,boss:null,won:0,kills:0,mesh:{},t:0,from});
  sc.spawn=[(SP[0]+.5)*Q+Math.cos(pa)*3.4,0,(SP[1]+.5)*Q+Math.sin(pa)*3.4];
  sc.yaw=Math.atan2(cx-SP[0],cz-SP[1]);
  const gh=(x,z)=>{const xi=x/Q|0,zi=z/Q|0;if(xi<0||zi<0||xi>=W||zi>=D)return-1;return G[ix(xi,zi)]};
  const blocked=(x,z,g)=>{const xi=x/Q|0,zi=z/Q|0,y=Math.floor((g+.45)/Q);return vxSolid(xi,y,zi)||vxSolid(xi,y+3,zi)};
  VXR.gh=gh;VXR.blk=blocked;
  const f=.75+.22*d.dan,ST={blob:[50,11,2.4],quad:[42,9,3.8],alto:[95,18,1.7],volo:[34,8,2.6]};
  const mkE=(sp,x,z,o)=>{const s=ST[sp.sh],g=gh(x,z);if(g<0)return null;const e=Object.assign({sp,x,z,y:g,hx:x,hz:z,yaw:R()*6.283,hp:s[0]*f,mx:s[0]*f,dmg:s[1]*f,spd:s[2],st:'idle',t:0,cd:1+R()*2,tint:null,fl:0,sc:sp.sc,wx:x,wz:z,wt:0,ag:11,die:0},o||{});VXR.E.push(e);return e};
  /* le creature: le guardie dei segni e quelle che girano */
  sc.enter0=()=>{SG.forEach((p,k)=>{if(SV&&SV.st.lit&&SV.st.lit[k])return;const n=2+(d.dan>3?1:0)+(d.dan>4?1:0);for(let j=0;j<n;j++){const a=j/n*6.283+R(),r=3+R()*2.5;const e=mkE(d.sp[j%d.sp.length],(p[0]+.5)*Q+Math.cos(a)*r,(p[1]+.5)*Q+Math.sin(a)*r,{sign:k,ag:9});if(e)e.hx=(p[0]+.5)*Q,e.hz=(p[1]+.5)*Q}});
    let n=SV&&SV.st.boss?Math.ceil((4+d.dan)/2):4+d.dan,tries=0;while(n>0&&tries++<400){const x=(8+R()*(W-16))*Q,z=(8+R()*(D-16))*Q;if(gh(x,z)<0||Math.hypot(x-sc.spawn[0],z-sc.spawn[2])<14||Math.hypot(x-cx*Q,z-cz*Q)<5)continue;if(blocked(x,z,gh(x,z)))continue;mkE(vxPk(R,d.sp),x,z);n--}};
  /* che cosa si può usare */
  sc.items=[{p:[VXR.portal[0],VXR.portal[1]+1,VXR.portal[2]],r:2.4,label:()=>VXR.won?T88('Torna nella stanza dietro la Corona','Return to the room behind the Crown'):T88('La porta: torna nella stanza','The door: return to the room'),act:()=>{if(VXR.bossDead&&!VXR.saved)vxSaveAsk(1);else vxRealExit()}}];
  SG.forEach((p,k)=>sc.items.push({p:[(p[0]+.5)*Q,SGH[k]*Q+1,(p[1]+.5)*Q],r:2.6,ok:()=>!VXR.lit[k],label:()=>{const n=VXR.E.filter(e=>e.sign===k&&!e.die).length;return n?T88('Il segno è protetto: {0}','The sign is guarded: {0}').replace('{0}',n):T88('Leggi il segno','Read the sign')},act:()=>vxSign(k)}));
  sc.items.push({p:[cx*Q+.1,(hC+3)*Q+1,cz*Q+.1],r:2.4,ok:()=>VXR.woke&&!VXR.won,label:()=>VXR.boss&&!VXR.boss.die?T88('{0} protegge il Cuore','{0} protects the Heart').replace('{0}',d.gn):T88('Prendi il Cuore di {0}','Take the Heart of {0}').replace('{0}',d.name),act:()=>vxHeart()});
  VXR.SG=SG.map((p,k)=>[(p[0]+.5)*Q,SGH[k]*Q,(p[1]+.5)*Q]);VXR.C=[cx*Q+.1,hC*Q,cz*Q+.1];VXR.hC=hC;
  /* le luci vicine */
  sc.lights=t=>{const L=[];VXR.SG.forEach((p,k)=>{if(!VXR.lit[k])L.push([p[0],p[1]+3.2,p[2],7,accC[0]*1.3,accC[1]*1.3,accC[2]*1.3])});const po=VXR.portal;L.push([po[0],po[1]+1.6,po[2],6,.5,.6,1]);
    if(VXR.woke)L.push([VXR.C[0],VXR.C[1]+1.6,VXR.C[2],9,accC[0]*1.6,accC[1]*1.6,accC[2]*1.6]);if(tm===2||tm===3)L.push([VX.pl.x,VX.pl.y+2.4,VX.pl.z,9,.45,.38,.26]);
    for(const s of VXR.shots.slice(0,3))L.push([s.x,s.y,s.z,3,s.c[0],s.c[1],s.c[2]]);return L};
  /* i bagliori: il sole, le lune, le stelle, i raggi dei segni, la porta, i colpi */
  sc.glow=t=>{const G2=[],p=VX.pl;const c0=[p.x,p.y,p.z];G2.push([c0[0]-sdv[0]*95,c0[1]-sdv[1]*95,c0[2]-sdv[2]*95,sunC[0],sunC[1],sunC[2],tm===2?.0:1,tm===1?16:11]);
    for(const m of MOON)G2.push([c0[0]+m[0]*95,c0[1]+m[1]*95,c0[2]+m[2]*95,m[4][0],m[4][1],m[4][2],.85,m[3]]);for(const s of STAR)G2.push([s[0],s[1],s[2],1,1,1,s[3]*(.7+.3*Math.sin(t*2+s[0])),.5]);
    VXR.SG.forEach((q,k)=>{if(VXR.lit[k])return;for(let i=0;i<22;i++){const y=q[1]+3.2+i*1.2,a=(.55+.45*Math.sin(t*3-i*.5))*(1-i/24);G2.push([q[0],y,q[2],accC[0],accC[1],accC[2],a,1.5-i*.04])}});
    const po=VXR.portal;for(let i=0;i<28;i++){const a=i/28*6.283+t*.8,r=1.25;G2.push([po[0]+Math.cos(po[3]+1.5708)*Math.cos(a)*r,po[1]+1.6+Math.sin(a)*r*1.2,po[2]+Math.sin(po[3]+1.5708)*Math.cos(a)*r,.6,.75,1,.8,.3])}
    if(VXR.woke){const C=VXR.C;G2.push([C[0],C[1]+1.55+Math.sin(t*2)*.08,C[2],accC[0]+.3,accC[1]+.3,accC[2]+.3,VXR.won?.2:1,2.4]);if(!VXR.won)for(let i=0;i<16;i++){const a=i/16*6.283+t;G2.push([C[0]+Math.cos(a)*.8,C[1]+1.55+Math.sin(t*3+i)*.3,C[2]+Math.sin(a)*.8,accC[0],accC[1],accC[2],.6,.12])}}
    for(let i=0;i<50;i++){const k=vxH2(i,9,sd),x=p.x+(vxH2(i,4,sd)-.5)*22,z=p.z+(vxH2(i,5,sd)-.5)*22,y=p.y+((t*.15*(.5+k)+k)%1)*5;G2.push([x+Math.sin(t*.5+i)*.4,y,z,accC[0],accC[1],accC[2],.25,.05])}
    for(const s of VXR.shots)G2.push([s.x,s.y,s.z,s.c[0],s.c[1],s.c[2],1,.5],[s.x-s.vx*.04,s.y-s.vy*.04,s.z-s.vz*.04,s.c[0],s.c[1],s.c[2],.5,.35]);
    for(const r of VXR.rings){const k=clamp((VXR.t-r.t0)/(r.t1-r.t0),0,1),n=26;for(let i=0;i<n;i++){const a=i/n*6.283;G2.push([r.x+Math.cos(a)*r.r,r.y+.08,r.z+Math.sin(a)*r.r,1,.25+.4*(1-k),.15,.35+.65*k,.18])}G2.push([r.x,r.y+.1,r.z,1,.3,.15,k*.6,r.r*.9])}
    for(const e of VXR.E)if(e.st==='wind'&&(e.sp.sh==='alto'||e.boss&&e.atk==='sweep')){const k=clamp(1-e.t/e.wT,0,1),rr=e.boss?3.4:2.5,n=24;for(let i=0;i<n;i++){const a=i/n*6.283;G2.push([e.x+Math.cos(a)*rr,e.y+.08,e.z+Math.sin(a)*rr,1,.3,.15,.3+.7*k,.18])}}
    for(const o of VXR.orbs)G2.push([o.x,o.y+.5+Math.sin(t*3+o.x)*.12,o.z,.4,1,.5,.9,.45]);
    for(const q of VXR.fx){const k=1-q.t/q.l;G2.push([q.x,q.y,q.z,q.c[0],q.c[1],q.c[2],k,q.s])}
    // la scia della spada
    if(VXR.atk>0){const k=1-VXR.atk/VXR.atkD,a0=p.yaw-1.15+k*2.3,big=VXR.combo===3;for(let i=0;i<10;i++){const a=a0-i*.12;G2.push([p.x+Math.sin(a)*(big?1.5:1.15),p.y+1.05-(big?.3:0)*Math.sin(k*3),p.z+Math.cos(a)*(big?1.5:1.15),1,.92,.7,(1-i/10)*.9,.22])}}
    if(VXR.roll>0)for(let i=0;i<6;i++)G2.push([p.x-p.vx*.03*i,p.y+.6,p.z-p.vz*.03*i,.7,.8,1,.3*(1-i/6),.6]);
    return G2};
  /* le cose che si muovono: le creature, il Cuore */
  sc.dyn=t=>{const gl=VX.gl,O=[];for(const e of VXR.E){const id=e.boss?'boss':e.sp.i;let m=VXR.mesh[id];if(!m)m=VXR.mesh[id]=vxUp(gl,vxMobMesh(e.boss?e.bsp:e.sp,!!e.boss));
      let y=e.y,s=e.sc;if(e.sp.sh==='volo')y+=1.1+Math.sin(t*2.4+e.hx)*.15;if(e.sp.sh==='blob'&&e.st!=='hop')y+=Math.abs(Math.sin(t*6+e.hx))*(e.st==='chase'?.18:.05);if(e.st==='hop')y=e.hy;
      if(e.st==='wind')s*=1+.06*Math.sin(VXR.t*30);if(e.die)s*=Math.max(.01,1-e.die/.45);if(e.rise!=null)y-=(1-e.rise)*e.sc*2.2;
      const tint=e.fl>0?[1,1,1,.75]:e.st==='wind'?[1,.35,.2,.25+.35*(1-e.t/e.wT)]:e.die?[1,1,1,.5]:null;O.push({o:m,m:vxM.tr(e.x,y,e.z,e.yaw,s),tint})}
    if(!VXR.mesh.heart){const V=[];vxBox(V,0,0,0,.34,.5,.34,d.acc,1,Math.PI/4);vxBox(V,0,.12,0,.5,.26,.12,d.acc,.8);vxBox(V,0,.12,0,.12,.26,.5,d.acc,.8);VXR.mesh.heart=vxUp(gl,V)}
    if(!VXR.won)O.push({o:VXR.mesh.heart,m:vxM.tr(VXR.C[0],VXR.C[1]+1.25+Math.sin(t*2)*.08,VXR.C[2],t*.9,VXR.woke?1:.7),tint:VXR.woke?null:[.3,.3,.35,.75]});return O};
  /* l'eroe: la spada fa girare il busto, la schivata è una capriola in avanti */
  sc.heroM=M=>{const p=VX.pl;let yw=p.yaw;if(VXR.atk>0){const k=1-VXR.atk/VXR.atkD;yw+=(VXR.combo===3?1.6:.9)*(k-.5)*(VXR.combo===2?-1:1)}
    let m=vxM.tr(p.x,p.y,p.z,yw,1);if(VXR.roll>0){const k=1-VXR.roll/.36;m=vxM.mul(m,vxM.mul(vxM.t(0,.8,0),vxM.mul(vxM.rx(k*6.283),vxM.t(0,-.8,0))))}if(VXR.dead)m=vxM.mul(m,vxM.mul(vxM.t(0,.1,0),vxM.rx(-1.45)));return m};
  sc.click=()=>vxAtk();sc.dodge=()=>vxDodge();
  sc.tick=(dt,t)=>vxRealTick(dt,t);
  sc.enter=()=>{sc.enter0();vxRealHud();VX.pl.y=sc.spawn[1]=gh(sc.spawn[0],sc.spawn[2])+.05;
    if(SV){const st=SV.st;VXR.lit=[0,1,2].map(k=>st.lit&&st.lit[k]?1:0);VXR.lit.forEach((v,k)=>{if(v)for(const r of VXR.runes[k]||[])vxSet(r[0],r[1],r[2],VXR.spent)});if(st.boss){VXR.woke=1;VXR.bossDead=1}if(st.heart)VXR.won=1;
      vxSay(T88('Sei tornato in {0}: è come l\'hai lasciata.','You are back in {0}: it is just as you left it.').replace('{0}',d.name),5);vxMus(tm===2?['notte','dungeon']:tm===1?['desert']:tm===3?['inter','peaks']:['forest','peaks']);return}
    vxSay(d.ign?T88('Il fuoco ti ha portato qui. Nessuno ha mai visto questa realtà prima di te.','The fire brought you here. No one has seen this reality before you.'):T88('Il libro si apre, e tu sei dentro.','The book opens, and you are inside.'),5);
    setTimeout(()=>{if(VX.sc===sc&&!VXR.lit.some(v=>v))vxSay(T88('Tre raggi di luce: sono i segni. Leggili per trovare il Cuore di questa realtà.','Three beams of light: they are the signs. Read them to find the Heart of this reality.'),6)},5600);
    vxMus(tm===2?['notte','dungeon']:tm===1?['desert']:tm===3?['inter','peaks']:['forest','peaks'])};
  sc.leave=()=>{const gl=VX.gl;for(const k in VXR.mesh){const o=VXR.mesh[k];if(o&&o.b){gl.deleteBuffer(o.b);gl.deleteVertexArray(o.va)}}VXR.mesh={};if(VXR.kills){vxv().k+=VXR.kills;VXR.kills=0;vxvSave()}};
  sc.onLeave=()=>vxRealExit();
  return sc}
T88('Il libro si apre, e tu sei dentro.','The book opens, and you are inside.');
/* ---- il combattimento: l'eroe ---- */
function vxAtk(){if(!VXR.sc||VX.sc!==VXR.sc||VXR.dead||VXR.sc.paused)return;if(VXR.roll>0)return;if(VXR.atk>0){if(VXR.atk<VXR.atkD*.55)VXR.q=1;return}vxSwing()}
function vxSwing(){const p=VX.pl;VXR.combo=VXR.comboT>0?VXR.combo%3+1:1;VXR.atkD=VXR.combo===3?.44:.32;VXR.atk=VXR.atkD;VXR.hitDone=0;VXR.q=0;p.slow=.35;
  // si gira da solo verso il nemico più vicino davanti (o vicinissimo)
  let best=null,bd=3.4;for(const e of VXR.E){if(e.die||e.rise!=null&&e.rise<1)continue;const dx=e.x-p.x,dz=e.z-p.z,dd=Math.hypot(dx,dz);let da=Math.atan2(dx,dz)-p.yaw;da=Math.atan2(Math.sin(da),Math.cos(da));if(dd<bd&&(Math.abs(da)<1.2||dd<1.6)){bd=dd;best=e}}
  if(best)p.yaw=Math.atan2(best.x-p.x,best.z-p.z);p.dash={x:Math.sin(p.yaw)*3.2,z:Math.cos(p.yaw)*3.2,t:.07};try{tone(VXR.combo===3?160:220+VXR.combo*40,.09,'sawtooth',.03)}catch(_){}}
function vxDodge(){if(!VXR.sc||VX.sc!==VXR.sc||VXR.dead||VXR.sc.paused||VXR.dCd>0)return;const p=VX.pl;let dx=p.ix||0,dz=p.iz||0;const m=Math.hypot(dx,dz);if(m<.1){dx=-Math.sin(p.yaw);dz=-Math.cos(p.yaw)}else{dx/=m;dz/=m;p.yaw=Math.atan2(dx,dz)}
  p.dash={x:dx*10.5,z:dz*10.5,t:.3};VXR.roll=.36;VXR.iT=Math.max(VXR.iT,.4);VXR.dCd=.55;VXR.atk=0;VXR.q=0;p.slow=1;try{tone(330,.12,'triangle',.03)}catch(_){}}
function vxHurt(dmg,src){if(VXR.iT>0||VXR.dead)return false;VXR.hp-=dmg;VXR.hurtT=VXR.t;VXR.lastHit=VXR.t;VXR.iT=.5;vxNum(VX.pl.x,VX.pl.y+2,VX.pl.z,'-'+Math.round(dmg),'#ff6a5a');try{tone(110,.18,'square',.05)}catch(_){}
  if(src){const p=VX.pl,dx=p.x-src.x,dz=p.z-src.z,l=Math.hypot(dx,dz)||1;p.dash={x:dx/l*5,z:dz/l*5,t:.12}}
  if(VXR.hp<=0){VXR.hp=0;VXR.dead=1;VXR.deadT=VXR.t;setTimeout(()=>vxDeath(),1600)}return true}
function vxNum(x,y,z,s,c){VXR.nums.push({x,y,z,s,c,t:0})}
function vxBurst(x,y,z,c,n,sp){for(let i=0;i<n;i++){const a=Math.random()*6.283,u=Math.random()*2-1,v=(sp||3)*(.4+Math.random()*.8);VXR.fx.push({x,y,z,vx:Math.cos(a)*v*Math.sqrt(1-u*u),vy:u*v+1.5,vz:Math.sin(a)*v*Math.sqrt(1-u*u),t:0,l:.5+Math.random()*.5,c,s:.08+Math.random()*.1})}}
function vxHitE(e,dmg){if(e.die||e.rise!=null&&e.rise<1)return;e.hp-=dmg;e.fl=.1;const p=VX.pl;vxNum(e.x,e.y+VXTOP[e.sp.sh]*e.sc+.3,e.z,Math.round(dmg)+'',VXR.combo===3?'#ffd66e':'#ffffff');vxBurst(e.x,e.y+.6*e.sc,e.z,vxRgb(e.sp.acc),6,3);
  if(!e.boss){const dx=e.x-p.x,dz=e.z-p.z,l=Math.hypot(dx,dz)||1;vxMoveE(e,dx/l*.45,dz/l*.45);if(e.st==='idle')e.st='chase'}
  try{tone(520+Math.random()*80,.05,'square',.025)}catch(_){}
  if(e.hp<=0){e.die=.001;VXR.kills++;vxBurst(e.x,e.y+.6*e.sc,e.z,vxRgb(e.sp.acc),e.boss?60:18,e.boss?6:4);try{tone(e.boss?90:180,.3,'sawtooth',.04)}catch(_){}
    if(!e.boss&&Math.random()<.3)VXR.orbs.push({x:e.x,y:e.y,z:e.z});if(e.boss)vxBossDown()}}
/* ---- le creature si muovono: non salgono i muri, non cadono dall'isola, non passano dentro i tronchi ---- */
function vxMoveE(e,dx,dz){const g0=e.y,tryM=(ax,az)=>{const nx=e.x+ax,nz=e.z+az,g=VXR.gh(nx,nz);if(g<0)return false;const up=e.sp.sh==='volo'?2.5:e.boss?.7:.45;if(g-g0>up)return false;
    if(e.sp.sh!=='volo'&&!e.boss&&VXR.blk(nx,nz,g))return false;e.x=nx;e.z=nz;return true};
  if(tryM(dx,dz))return true;const a=Math.atan2(dx,dz),l=Math.hypot(dx,dz);for(const o of[.9,-.9,1.6,-1.6])if(tryM(Math.sin(a+o)*l,Math.cos(a+o)*l))return true;return false}
function vxShoot(e,ang,sp){const p=VX.pl,y0=e.y+(e.sp.sh==='volo'?1.45:VXTOP[e.sp.sh]*e.sc*.7),tx=p.x,ty=p.y+1,tz=p.z,dx=tx-e.x,dy=ty-y0,dz=tz-e.z,l=Math.hypot(dx,dy,dz)||1;let vx=dx/l,vz=dz/l;const c=Math.cos(ang||0),s=Math.sin(ang||0);[vx,vz]=[vx*c-vz*s,vx*s+vz*c];
  VXR.shots.push({x:e.x,y:y0,z:e.z,vx:vx*(sp||7.5),vy:dy/l*(sp||7.5),vz:vz*(sp||7.5),t:0,dmg:e.boss?e.dmg*.55:e.dmg,c:vxRgb(e.sp.acc)});try{tone(700,.08,'sine',.02)}catch(_){}}
/* ---- ogni fotogramma ---- */
function vxRealTick(dt,t){const sc=VXR.sc;if(!sc||VX.sc!==sc)return;const p=VX.pl,d=VXR.d;
  vxRealHudTick();if(sc.paused)return;VXR.t+=dt;const T=VXR.t;
  // l'eroe: colpi, schivata, ferite, cadute
  if(VXR.atk>0){VXR.atk-=dt;const k=1-VXR.atk/VXR.atkD;if(!VXR.hitDone&&k>.38){VXR.hitDone=1;const big=VXR.combo===3,reach=big?2.7:2.25,arc=big?1.6:1.15;
      for(const e of VXR.E){if(e.die)continue;const dx=e.x-p.x,dz=e.z-p.z,dd=Math.hypot(dx,dz)-(e.boss?1.1:.25*e.sc);let da=Math.atan2(dx,dz)-p.yaw;da=Math.atan2(Math.sin(da),Math.cos(da));const vy=e.y+(e.sp.sh==='volo'?1.1:0)-p.y;
        if(dd<reach&&(Math.abs(da)<arc||dd<1)&&vy<2.4&&vy>-1.5)vxHitE(e,VXR.dmg*(big?1.7:1)*(.9+Math.random()*.2))}}
    if(VXR.atk<=0){VXR.atk=0;p.slow=1;VXR.comboT=.42;if(VXR.q)vxSwing()}}
  if(VXR.comboT>0)VXR.comboT-=dt;if(VXR.roll>0)VXR.roll-=dt;if(VXR.iT>0)VXR.iT-=dt;if(VXR.dCd>0)VXR.dCd-=dt;
  if(VXR.dead){p.slow=0;p.dash=null}
  VX.heroTint=T-VXR.hurtT<.25?[1,.15,.1,.55*(1-(T-VXR.hurtT)/.25)]:VXR.iT>0&&VXR.roll>0?[.7,.8,1,.25]:null;
  if(!VXR.dead&&T-VXR.lastHit>5&&VXR.hp<VXR.mx)VXR.hp=Math.min(VXR.mx,VXR.hp+VXR.mx*.025*dt);
  if(p.on&&!VXR.dead&&p.y>1.4){VXR.safeT-=dt;if(VXR.safeT<=0){VXR.safeT=.4;const g=VXR.gh(p.x,p.z);if(g>0&&Math.abs(g-p.y)<.5)VXR.safe=[p.x,p.y+.05,p.z]}}
  if(p.y<1.1&&!VXR.dead){const s=VXR.safe||sc.spawn;p.x=s[0];p.y=s[1]+.3;p.z=s[2];p.vy=0;VXR.iT=0;vxHurt(Math.round(VXR.mx*.1));vxSay(T88('Il nulla ti respinge indietro.','The void pushes you back.'),2.5)}
  // le sfere che curano
  for(let i=VXR.orbs.length-1;i>=0;i--){const o=VXR.orbs[i];if(Math.hypot(o.x-p.x,o.z-p.z)<1.1&&Math.abs(o.y-p.y)<1.6){VXR.hp=Math.min(VXR.mx,VXR.hp+VXR.mx*.2);vxNum(p.x,p.y+2,p.z,'+'+Math.round(VXR.mx*.2),'#7ad04a');VXR.orbs.splice(i,1);try{tone(880,.15,'sine',.03)}catch(_){}}}
  // le creature
  for(let i=VXR.E.length-1;i>=0;i--){const e=VXR.E[i];if(e.fl>0)e.fl-=dt;if(e.die){e.die+=dt;if(e.die>.45)VXR.E.splice(i,1);continue}
    if(e.rise!=null&&e.rise<1){e.rise=Math.min(1,e.rise+dt*.45);continue}
    const g=VXR.gh(e.x,e.z);if(g>=0){if(e.st!=='hop')e.y+=(g-e.y)*Math.min(1,dt*12)}
    const dx=p.x-e.x,dz=p.z-e.z,dd=Math.hypot(dx,dz),dy=Math.abs(p.y-e.y);e.t-=dt;e.cd-=dt;
    const face=(sp)=>{let a=Math.atan2(dx,dz)-e.yaw;a=Math.atan2(Math.sin(a),Math.cos(a));e.yaw+=a*Math.min(1,dt*(sp||6))};
    if(e.boss){vxBossAI(e,dt,dx,dz,dd,face);continue}
    const sh=e.sp.sh;
    if(e.st==='idle'){if(!VXR.dead&&dd<e.ag&&dy<4){e.st='chase';vxNum(e.x,e.y+VXTOP[sh]*e.sc+.4,e.z,'!','#ffd66e')}else{e.wt-=dt;if(e.wt<=0){e.wt=2+Math.random()*3;const a=Math.random()*6.283,r=Math.random()*4;e.wx=e.hx+Math.cos(a)*r;e.wz=e.hz+Math.sin(a)*r}
        const wx=e.wx-e.x,wz=e.wz-e.z,wl=Math.hypot(wx,wz);if(wl>.3){vxMoveE(e,wx/wl*e.spd*.35*dt,wz/wl*e.spd*.35*dt);let a=Math.atan2(wx,wz)-e.yaw;a=Math.atan2(Math.sin(a),Math.cos(a));e.yaw+=a*Math.min(1,dt*4)}}continue}
    if(e.st==='chase'){if(VXR.dead||Math.hypot(e.x-e.hx,e.z-e.hz)>26&&dd>8){e.st='idle';continue}face();
      const want=sh==='volo'?7:sh==='alto'?1.9:sh==='quad'?3.6:2.6;if(dd>want||(sh==='volo'&&dd>4.5)){if(dd>want)vxMoveE(e,dx/dd*e.spd*dt,dz/dd*e.spd*dt)}else if(sh==='volo'&&dd<4.5)vxMoveE(e,-dx/dd*e.spd*dt,-dz/dd*e.spd*dt);
      if(e.cd<=0&&dd<(sh==='volo'?13:sh==='quad'?4.6:sh==='blob'?3.2:2.6)){e.st='wind';e.wT=e.t=sh==='alto'?.8:sh==='quad'?.55:sh==='blob'?.5:.6;e.tx=p.x;e.tz=p.z}}
    else if(e.st==='wind'){face(sh==='quad'?10:3);if(e.t<=0){
        if(sh==='alto'){if(dd<2.5+.3&&dy<1.5)vxHurt(e.dmg,e);vxBurst(e.x,e.y+.1,e.z,[1,.5,.3],14,4);try{tone(70,.25,'square',.05)}catch(_){}e.st='rec';e.t=1}
        else if(sh==='quad'){e.st='lunge';e.t=.32;e.hit=0;e.ldx=Math.sin(e.yaw);e.ldz=Math.cos(e.yaw)}
        else if(sh==='blob'){e.st='hop';e.t=.5;e.hy=e.y;e.h0=[e.x,e.y,e.z];e.h1=[p.x,VXR.gh(p.x,p.z),p.z];if(e.h1[1]<0)e.h1=[e.x,e.y,e.z]}
        else{vxShoot(e);e.st='rec';e.t=.5}}}
    else if(e.st==='lunge'){vxMoveE(e,e.ldx*10*dt,e.ldz*10*dt);if(!e.hit&&dd<1.05&&dy<1.4){e.hit=1;vxHurt(e.dmg,e)}if(e.t<=0){e.st='rec';e.t=.8}}
    else if(e.st==='hop'){const k=1-Math.max(0,e.t)/.5,a=e.h0,b=e.h1;e.x=a[0]+(b[0]-a[0])*k;e.z=a[2]+(b[2]-a[2])*k;e.hy=a[1]+(b[1]-a[1])*k+Math.sin(k*Math.PI)*1.3;
      if(e.t<=0){e.y=b[1];if(Math.hypot(p.x-e.x,p.z-e.z)<1.4&&dy<1.4)vxHurt(e.dmg,e);vxBurst(e.x,e.y+.1,e.z,vxRgb(e.sp.col),10,3);e.st='rec';e.t=.7}}
    else if(e.st==='rec'){if(e.t<=0){e.st='chase';e.cd=sh==='volo'?2.2:.8+Math.random()*.8}}
    // non stare dentro l'eroe (né uno dentro l'altro)
    if(dd<.85*e.sc&&dd>.01)vxMoveE(e,-dx/dd*(.85*e.sc-dd),-dz/dd*(.85*e.sc-dd))}
  for(let i=0;i<VXR.E.length;i++)for(let j=i+1;j<VXR.E.length;j++){const a=VXR.E[i],b=VXR.E[j];if(a.boss||b.boss||a.die||b.die)continue;const dx=b.x-a.x,dz=b.z-a.z,l=Math.hypot(dx,dz),m=.45*(a.sc+b.sc);if(l<m&&l>.01){const k=(m-l)/2;vxMoveE(a,-dx/l*k,-dz/l*k);vxMoveE(b,dx/l*k,dz/l*k)}}
  // i colpi da lontano, i cerchi per terra, le scintille, i numeri
  for(let i=VXR.shots.length-1;i>=0;i--){const s=VXR.shots[i];s.t+=dt;s.x+=s.vx*dt;s.y+=s.vy*dt;s.z+=s.vz*dt;const hit=Math.hypot(s.x-p.x,s.y-(p.y+1),s.z-p.z)<.6;if(hit&&vxHurt(s.dmg)||s.t>3.2||vxSolid(s.x/VXS_VOX|0,s.y/VXS_VOX|0,s.z/VXS_VOX|0)){if(hit||s.t<=3.2)vxBurst(s.x,s.y,s.z,s.c,6,2);VXR.shots.splice(i,1)}}
  for(let i=VXR.rings.length-1;i>=0;i--){const r=VXR.rings[i];if(T>=r.t1){if(Math.hypot(p.x-r.x,p.z-r.z)<r.r&&Math.abs(p.y-r.y)<1.6)vxHurt(r.dmg);vxBurst(r.x,r.y+.2,r.z,[1,.45,.2],16,4);try{tone(80,.2,'square',.04)}catch(_){}VXR.rings.splice(i,1)}}
  for(let i=VXR.fx.length-1;i>=0;i--){const q=VXR.fx[i];q.t+=dt;q.x+=q.vx*dt;q.y+=q.vy*dt;q.z+=q.vz*dt;q.vy-=6*dt;if(q.t>q.l)VXR.fx.splice(i,1)}
  for(let i=VXR.nums.length-1;i>=0;i--){const q=VXR.nums[i];q.t+=dt;q.y+=dt*.9;if(q.t>.9)VXR.nums.splice(i,1)}}
/* ---- il guardiano ---- */
function vxBossWake(){const d=VXR.d,C=VXR.C,sp=Object.assign({},d.sp[0],{sh:d.gsh,i:'boss',seed:(d.seed*13+5)>>>0,acc:d.acc,sc:2.3});
  const e={sp,bsp:sp,boss:1,x:C[0]+2.6,z:C[2]+2.6,y:VXR.gh(C[0]+2.6,C[2]+2.6),hx:C[0],hz:C[2],yaw:0,hp:420*(.75+.22*d.dan),mx:420*(.75+.22*d.dan),dmg:20*(.75+.22*d.dan),spd:2.1,st:'rise',t:0,cd:2,tint:null,fl:0,sc:2.3,die:0,rise:0,ph:0,atk:null};
  if(e.y<0)e.y=C[1];VXR.E.push(e);VXR.boss=e;vxBurst(e.x,e.y+.5,e.z,vxRgb(d.acc),40,5);try{tone(55,.9,'sawtooth',.05)}catch(_){}vxMus(['boss'])}
function vxBossAI(e,dt,dx,dz,dd,face){const p=VX.pl,d=VXR.d;if(e.st==='rise'){e.st='chase';e.cd=1.4}
  if(VXR.dead)return;if(!e.ph&&e.hp<e.mx*.5){e.ph=1;for(let j=0;j<2;j++){const a=Math.random()*6.283;const m=VXR.sc&&VXR.d.sp[0];const st={blob:[50,11,2.4],quad:[42,9,3.8],alto:[95,18,1.7],volo:[34,8,2.6]}[m.sh],f=.75+.22*d.dan;const x=e.x+Math.cos(a)*3,z=e.z+Math.sin(a)*3,g=VXR.gh(x,z);if(g<0)continue;
      VXR.E.push({sp:m,x,z,y:g,hx:x,hz:z,yaw:0,hp:st[0]*f,mx:st[0]*f,dmg:st[1]*f,spd:st[2],st:'chase',t:0,cd:1.5,fl:0,sc:m.sc,wx:x,wz:z,wt:0,ag:30,die:0,rise:0})}
    vxSay(T88('{0} chiama i suoi','{0} calls its kin').replace('{0}',d.gn),3);try{tone(60,.8,'sawtooth',.05)}catch(_){}}
  if(e.st==='chase'){face(4);if(dd>3)vxMoveE(e,dx/dd*e.spd*dt,dz/dd*e.spd*dt);if(Math.hypot(e.x-e.hx,e.z-e.hz)>14)vxMoveE(e,(e.hx-e.x)*dt*.5,(e.hz-e.z)*dt*.5);
    if(e.cd<=0){const r=Math.random();e.atk=dd<4.2?(r<.5?'sweep':r<.75?'rings':'volley'):(r<.55?'rings':'volley');e.st='wind';e.wT=e.t=e.atk==='sweep'?.85:e.atk==='rings'?.4:.65;
      if(e.atk==='rings')for(let i=0;i<3;i++){const ox=i?(Math.random()-.5)*3:0,oz=i?(Math.random()-.5)*3:0,x=p.x+ox,z=p.z+oz,g=VXR.gh(x,z);VXR.rings.push({x,z,y:g<0?p.y:g,r:1.9,t0:VXR.t,t1:VXR.t+1.05+i*.45,dmg:e.dmg*.75})}}}
  else if(e.st==='wind'){face(e.atk==='sweep'?2:5);if(e.t<=0){if(e.atk==='sweep'){if(dd<3.6&&Math.abs(p.y-e.y)<2)vxHurt(e.dmg,e);vxBurst(e.x,e.y+.2,e.z,[1,.5,.3],24,6);try{tone(65,.3,'square',.05)}catch(_){}}
      else if(e.atk==='volley'){for(let i=-2;i<=2;i++)vxShoot(e,i*.24,8)}e.st='rec';e.t=e.atk==='rings'?1.2:.9}}
  else if(e.st==='rec'){if(e.t<=0){e.st='chase';e.cd=(e.ph?.9:1.4)+Math.random()*.6}}
  if(dd<1.6&&dd>.01){const k=1.6-dd;p.x-=-dx/dd*k*.5;p.z-=-dz/dd*k*.5}}
function vxBossDown(){const d=VXR.d;VXR.bossDead=1;if(!VXR.saved){const sc=VXR.sc,ask=()=>{if(VX.sc!==sc||VXR.saved||VXR.dead)return;if(sc.paused){setTimeout(ask,1000);return}vxSaveAsk(0)};setTimeout(ask,2800)}VXR.rings=[];VXR.shots=[];for(const e of VXR.E)if(!e.die&&!e.boss){e.die=.001;vxBurst(e.x,e.y+.5,e.z,vxRgb(e.sp.acc),12,3)}
  vxSay(T88('{0} si inchina e si scioglie nella luce. Il Cuore è libero.','{0} bows and dissolves into light. The Heart is free.').replace('{0}',d.gn),5);try{jingle([60,64,67,72,76,79],.1,'triangle')}catch(_){}vxMus(d.time===2?['notte','dungeon']:['forest','peaks'])}
/* ---- salvare una realtà (dopo il guardiano): resta nella libreria e si ritrova com'era ---- */
function vxSaveReal(quiet){const d=VXR.d,v=vxv();let b=v.b.find(x=>x.s===d.seed);if(!b){b={s:d.seed,f:d.ign?1:0}}else v.b.splice(v.b.indexOf(b),1);v.b.unshift(b);
  b.sv=1;b.st={lit:VXR.lit.slice(),boss:VXR.bossDead?1:0,heart:VXR.won?1:0,t:Date.now()};if(VXR.won)b.ok=1;VXR.saved=1;vxvSave();
  if(!quiet){vxSay(T88('{0} è salvata nella libreria: potrai tornarci quando vuoi.','{0} is saved in the library: you can return whenever you like.').replace('{0}',d.name),4);try{jingle([72,76,79],.1,'triangle')}catch(_){}}}
function vxSaveAsk(leaving){const d=VXR.d;vxPanel(`<h2>💾 ${esc(T88('Salvare {0}?','Save {0}?').replace('{0}',d.name))}</h2><p>${esc(T88('{0} è caduto. Se salvi questa realtà, resta nella libreria e potrai tornarci quando vuoi: la ritroverai com\'è adesso, con i segni letti e il guardiano sconfitto.','{0} has fallen. If you save this reality, it stays in the library and you can come back whenever you like: you will find it as it is now, with the signs read and the guardian defeated.').replace('{0}',d.gn))}</p>
  ${leaving?`<button onclick="vxPanel(null);vxSaveReal(1);vxRealExit()">💾 ${esc(T88('Salva e torna nella stanza','Save and return to the room'))}</button> <button onclick="vxPanel(null);vxRealExit()">${esc(T88('Torna senza salvare','Return without saving'))}</button> <button onclick="vxPanel(null)">${esc(T88('Resta','Stay'))}</button>`
   :`<button onclick="vxPanel(null);vxSaveReal()">💾 ${esc(T88('Salva la realtà','Save the reality'))}</button> <button onclick="vxPanel(null)">${esc(T88('Non ora','Not now'))}</button>`}`,1)}
function vxForget(seed,ok){const v=vxv(),b=v.b.find(x=>x.s===seed);if(!b)return;if(!ok){const d=vxRealDesc(b.s,b.f);vxPanel(`<h2>${esc(T88('Dimenticare {0}?','Forget {0}?').replace('{0}',d.name))}</h2><p>${esc(T88('Il libro torna come nuovo: la prossima volta i segni saranno da leggere e il guardiano di nuovo sveglio.','The book becomes new again: next time the signs will be unread and the guardian awake again.'))}</p><button onclick="vxForget(${seed},1)">${esc(T88('Dimentica','Forget'))}</button> <button onclick="vxLib()">${esc(T88('Annulla','Cancel'))}</button>`,1);return}
  delete b.sv;delete b.st;vxvSave();vxLib()}
/* ---- il mistero: i segni e il Cuore ---- */
function vxSign(k){const d=VXR.d,n=VXR.E.filter(e=>e.sign===k&&!e.die).length;if(n){vxSay(T88('Le creature di questo segno non te lo lasciano leggere: sconfiggile.','The creatures of this sign won\'t let you read it: defeat them.'),3);return}
  VXR.lit[k]=1;for(const r of VXR.runes[k]||[])vxSet(r[0],r[1],r[2],VXR.spent);try{jingle([67,71,74,79],.12,'triangle')}catch(_){}vxBurst(VXR.SG[k][0],VXR.SG[k][1]+3,VXR.SG[k][2],vxRgb(d.acc),30,4);
  const c=VXR.lit.filter(v=>v).length;
  vxPanel(`<h2>✦ ${esc(T88('Segno {0} di 3','Sign {0} of 3').replace('{0}',c))}</h2><p style="font-size:17px;line-height:1.6">${esc(d.signs[c-1])}</p><button onclick="vxPanel(null);vxSignAfter()">${esc(T88('Continua','Continue'))}</button>`,1)}
function vxSignAfter(){const d=VXR.d,c=VXR.lit.filter(v=>v).length;if(c<3){vxSay(T88('Il raggio si spegne. Ne mancano {0}.','The beam goes out. {0} to go.').replace('{0}',3-c),4);return}
  if(!VXR.woke){VXR.woke=1;vxSay(T88('La terra trema: in mezzo all\'isola si è svegliato {0}, {1}.','The ground shakes: in the middle of the island, {0} has woken, {1}.').replace('{0}',d.gn).replace('{1}',d.gt[0]),6);setTimeout(()=>{if(VXR.sc===VX.sc)vxBossWake()},1200)}}
function vxHeart(){const d=VXR.d;if(!VXR.woke||VXR.won)return;if(VXR.boss&&!VXR.boss.die){vxSay(T88('{0} protegge il Cuore','{0} protects the Heart').replace('{0}',d.gn),3);return}VXR.won=1;
  const v=vxv(),first=!v.b.some(b=>b.s===d.seed&&b.ok);vxSaveReal(1);if(first)v.n++;v.k+=VXR.kills;VXR.kills=0;
  const gold=first?Math.round(800*d.dan*(d.ign?1.5:1)):0;if(gold)try{const s=LS.get(SAVEK,null);if(s&&s.p){s.p.g=(s.p.g|0)+gold;LS.set(SAVEK,s)}}catch(_){}vxvSave();
  vxBurst(VXR.C[0],VXR.C[1]+1.5,VXR.C[2],vxRgb(d.acc),70,5);try{jingle([60,64,67,72,76,79,84,88],.1,'triangle')}catch(_){}
  vxPanel(`<h2>✦ ${esc(T88('Il Cuore di {0}','The Heart of {0}').replace('{0}',d.name))}</h2><p style="font-size:17px;line-height:1.6">${esc(d.fin)}</p>
  <p class="mu">${esc(T88('Realtà svelate: {0}','Realities unveiled: {0}').replace('{0}',v.n))}${gold?' · '+esc(T88('{0} monete al tuo eroe','{0} coins for your hero').replace('{0}',gold.toLocaleString('it-IT'))):''}</p>
  <button onclick="vxPanel(null)">${esc(T88('Resta ed esplora','Stay and explore'))}</button> <button onclick="vxPanel(null);vxRealExit()">${esc(T88('Torna nella stanza','Back to the room'))}</button>`,1)}
function vxDeath(){if(!VXR.dead||VX.sc!==VXR.sc)return;const d=VXR.d;vxPanel(`<h2>${esc(T88('La realtà ti respinge','The reality pushes you out'))}</h2><p>${esc(T88('Ti svegli davanti al fuoco, con l\'odore di {0} ancora addosso. La realtà è sempre lì: puoi tornarci.','You wake by the fire, with the scent of {0} still on you. The reality is still there: you can go back.').replace('{0}',d.name))}</p>
  <button onclick="vxPanel(null);vxGo(VXR.d,VXR.from)">${esc(T88('Riprova','Try again'))}</button> <button onclick="vxPanel(null);vxRealExit()">${esc(T88('Torna nella stanza','Back to the room'))}</button>`,1)}
function vxRealExit(){const f=VXR.from;vxFade(1,'#000',T88('Dietro la Corona','Behind the Crown'),()=>{vxStart(vxRoomScene(f));vxFade(0)})}
/* ---- lo schermo della realtà: la vita, l'obiettivo con la bussola, il guardiano, le barre dei nemici ---- */
function vxRealHud(){const u=VX.ui;if(!document.getElementById('vxrcss')){const st=document.createElement('style');st.id='vxrcss';st.textContent=`#vxui .rx,#vxui .rx *{pointer-events:none}#vxui .rx{position:absolute;inset:0}
#vxui .ro{position:absolute;left:50%;top:14px;transform:translateX(-50%);background:rgba(10,8,20,.62);border:1px solid #d4af37;border-radius:20px;padding:5px 16px;font-size:14px;white-space:nowrap}#vxui .ro i{display:inline-block;margin-right:9px;color:#ffd66e;font-style:normal}#vxui .ro em{margin-left:9px;opacity:.7;font-style:normal;font-size:12px}
#vxui .rbo{position:absolute;left:50%;top:50px;transform:translateX(-50%);width:min(520px,70vw);text-align:center;display:none}#vxui .rbo b{font-size:15px;letter-spacing:1px;text-shadow:0 2px 4px #000}#vxui .rbo small{display:block;font-size:11px;opacity:.75}#vxui .rbo div{height:10px;border:1px solid #d4af37;border-radius:6px;background:rgba(0,0,0,.55);margin-top:4px;overflow:hidden}#vxui .rbo div i{display:block;height:100%;background:linear-gradient(90deg,#8a1a2a,#e04a3a)}
#vxui .rhp{position:absolute;left:18px;top:66px;width:210px;font-size:12px;text-shadow:0 1px 3px #000}#vxui .rhp div{height:11px;border:1px solid #d4af37;border-radius:6px;background:rgba(0,0,0,.55);overflow:hidden;margin-top:3px}#vxui .rhp div i{display:block;height:100%;background:linear-gradient(90deg,#2a8a3a,#8ad04a);transition:width .15s}
#vxui .rl b{position:absolute;width:56px;margin-left:-28px;font:11px Georgia,serif;text-align:center;text-shadow:0 1px 2px #000;white-space:nowrap}#vxui .rl b i{display:block;height:5px;margin-top:2px;background:rgba(0,0,0,.6);border:1px solid rgba(255,255,255,.35);border-radius:3px;overflow:hidden}#vxui .rl b i u{display:block;height:100%;background:#e04a3a}
#vxui .rl s{position:absolute;text-decoration:none;font:bold 17px Georgia,serif;text-shadow:0 2px 3px #000;transform:translate(-50%,-50%)}#vxui .rv{position:absolute;inset:0}`;document.head.appendChild(st)}
  u.insertAdjacentHTML('afterbegin',`<div class="rx"><div class="rv"></div><div class="rl"></div><div class="ro"><i>▲</i><span></span><em></em></div><div class="rbo"><b></b><small></small><div><i></i></div></div><div class="rhp"><span></span><div><i></i></div></div></div>`);VXR.ui={pool:[],npool:[]}}
function vxRealHudTick(){const u=VX.ui,x=u&&u.querySelector('.rx');if(!x||!VXR.ui)return;const d=VXR.d,p=VX.pl,W=innerWidth,H=innerHeight;
  const set=(el,v)=>{if(el.textContent!==v)el.textContent=v};
  // l'obiettivo, e dove andare
  const c=VXR.lit.filter(v=>v).length;let tg=null,txt;
  if(VXR.won){txt=T88('Realtà svelata ✦ La porta ti riporta nella stanza','Reality unveiled ✦ The door takes you back to the room');tg=VXR.portal}
  else if(!VXR.woke){txt=T88('Leggi i tre segni: {0}/3','Read the three signs: {0}/3').replace('{0}',c);let bd=1e9;VXR.SG.forEach((q,k)=>{if(VXR.lit[k])return;const dd=Math.hypot(q[0]-p.x,q[2]-p.z);if(dd<bd){bd=dd;tg=q}})}
  else if(VXR.boss&&!VXR.boss.die){txt=T88('Sconfiggi {0}','Defeat {0}').replace('{0}',d.gn);tg=[VXR.boss.x,0,VXR.boss.z]}
  else{txt=T88('Prendi il Cuore di {0}','Take the Heart of {0}').replace('{0}',d.name);tg=VXR.C}
  set(x.querySelector('.ro span'),txt);const ar=x.querySelector('.ro i'),em=x.querySelector('.ro em');
  if(tg){const yw=VX.cam.yaw,fx=-Math.sin(yw),fz=-Math.cos(yw),rx=Math.cos(yw),rz=-Math.sin(yw),vx=tg[0]-p.x,vz=tg[2]-p.z,a=Math.atan2(vx*rx+vz*rz,vx*fx+vz*fz);ar.style.transform=`rotate(${a}rad)`;set(em,Math.round(Math.hypot(vx,vz))+' m')}else set(em,'');
  // la vita
  const hp=x.querySelector('.rhp');set(hp.querySelector('span'),'❤ '+Math.ceil(VXR.hp)+' / '+VXR.mx);hp.querySelector('i').style.width=(VXR.hp/VXR.mx*100).toFixed(1)+'%';
  const hk=clamp(1-(VXR.t-VXR.hurtT)/.5,0,1),low=VXR.hp<VXR.mx*.3?.35+.15*Math.sin(VXR.t*5):0;x.querySelector('.rv').style.boxShadow=`inset 0 0 ${90+hk*60}px rgba(200,0,0,${Math.max(hk*.55,low)})`;
  // il guardiano
  const bo=x.querySelector('.rbo'),B=VXR.boss;if(B&&!B.die&&(B.rise==null||B.rise>.05)){bo.style.display='block';set(bo.querySelector('b'),d.gn);set(bo.querySelector('small'),d.gt[0]);bo.querySelector('div i').style.width=(Math.max(0,B.hp)/B.mx*100).toFixed(1)+'%'}else bo.style.display='none';
  // le barre dei nemici feriti o vicini e i numeri dei colpi
  const L=x.querySelector('.rl'),pool=VXR.ui.pool,np=VXR.ui.npool;let n=0;
  if(VX.VP)for(const e of VXR.E){if(e.boss||e.die||e.st==='idle'&&e.hp>=e.mx)continue;if(Math.hypot(e.x-p.x,e.z-p.z)>16)continue;const y=e.y+(e.sp.sh==='volo'?1.1:0)+VXTOP[e.sp.sh]*e.sc+.35,s=vxProj(e.x,y,e.z);if(!s)continue;
    let b=pool[n];if(!b){b=document.createElement('b');b.innerHTML='<span></span><i><u></u></i>';L.appendChild(b);pool.push(b)}n++;b.style.display='block';b.style.left=s[0]+'px';b.style.top=(s[1]-18)+'px';set(b.firstChild,e.sp.n);b.querySelector('u').style.width=(Math.max(0,e.hp)/e.mx*100).toFixed(0)+'%'}
  for(let i=n;i<pool.length;i++)pool[i].style.display='none';
  let m=0;if(VX.VP)for(const q of VXR.nums){const s=vxProj(q.x,q.y,q.z);if(!s)continue;let el=np[m];if(!el){el=document.createElement('s');L.appendChild(el);np.push(el)}m++;el.style.display='block';el.style.left=s[0]+'px';el.style.top=s[1]+'px';el.style.color=q.c;el.style.opacity=(1-q.t/.9).toFixed(2);set(el,q.s)}
  for(let i=m;i<np.length;i++)np[i].style.display='none'}
function vxProj(x,y,z){const M=VX.VP;if(!M)return null;const cx=M[0]*x+M[4]*y+M[8]*z+M[12],cy=M[1]*x+M[5]*y+M[9]*z+M[13],cw=M[3]*x+M[7]*y+M[11]*z+M[15];if(cw<.1)return null;return[(cx/cw*.5+.5)*innerWidth,(1-(cy/cw*.5+.5))*innerHeight,cw]}
/* ---- viaggiare: la dissolvenza (si costruisce la realtà mentre lo schermo è coperto) ---- */
function vxFade(on,col,txt,cb){let f=document.getElementById('vxfade');if(!f){f=document.createElement('div');f.id='vxfade';f.style.cssText='position:fixed;inset:0;z-index:960;pointer-events:none;opacity:0;transition:opacity .7s;display:flex;align-items:center;justify-content:center;font:28px Georgia,serif;color:#f4ecd8;letter-spacing:3px;text-shadow:0 2px 10px #000';document.body.appendChild(f)}
  if(on){f.style.background=`radial-gradient(circle,${col||'#000'} 0%,#000 75%)`;f.textContent=txt||'';f.style.pointerEvents='auto';requestAnimationFrame(()=>{f.style.opacity='1'});setTimeout(()=>{try{cb&&cb()}catch(e){console.warn('Voxeliaverse',e)}},760)}
  else{requestAnimationFrame(()=>requestAnimationFrame(()=>{f.style.opacity='0';f.style.pointerEvents='none'}))}}
function vxGo(d,from){vxFade(1,d.acc,d.ign?T88('Una realtà ignota','An unknown reality'):d.name,()=>{vxStop();vxStart(vxRealScene(d,from));vxFade(0)})}
/* ---- il camino e la libreria ---- */
// i primi sei libri si trovano la prima volta che si apre la libreria (anche se intanto il camino ne ha già scritto uno)
function vxBooks(){const v=vxv();if(!v.i){v.i=1;for(let i=0;i<6;i++)v.b.push({s:(Math.random()*4294967295)>>>0});vxvSave()}return v.b}
function vxFire(){const v=vxv();vxPanel(`<h2>🔥 ${esc(T88('Il camino','The fireplace'))}</h2><p>${esc(T88('Ti siedi davanti al fuoco e chiudi gli occhi. Le fiamme fanno un rumore che somiglia a una voce. Se lasci andare il pensiero, il fuoco ti porta in una realtà ignota: una che nessuno ha mai visto, e che non sarà mai uguale due volte.','You sit by the fire and close your eyes. The flames make a sound like a voice. If you let your thoughts go, the fire takes you into an unknown reality: one no one has ever seen, and that will never be the same twice.'))}</p>
  <p class="mu">${esc(T88('Le realtà ignote sono più pericolose dei libri. Se ne sveli una, la libreria la scrive per te.','Unknown realities are more dangerous than the books. If you unveil one, the library writes it down for you.'))}${v.n?' · '+esc(T88('Realtà svelate: {0}','Realities unveiled: {0}').replace('{0}',v.n)):''}</p>
  <button onclick="vxPanel(null);vxGo(vxRealDesc((Math.random()*4294967295)>>>0,1),'fire')">🔥 ${esc(T88('Medita e viaggia','Meditate and travel'))}</button> <button onclick="vxPanel(null)">${esc(T88('Torna nella stanza','Back to the room'))}</button>`)}
function vxLib(){const B=vxBooks(),v=vxv();const star=n=>'★'.repeat(n)+'☆'.repeat(5-n);
  const sst=b=>{const st=b.st;return' · 💾 '+esc(T88('salvata','saved'))+' · '+esc(T88('segni {0}/3','signs {0}/3').replace('{0}',(st.lit||[]).filter(x=>x).length))+(st.boss?' · '+esc(T88('guardiano sconfitto','guardian defeated')):'')+(st.heart?' · '+esc(T88('Cuore preso','Heart taken')):'')};
  const card=(b,i)=>{const d=vxRealDesc(b.s,b.f);return`<div class="vbk" style="--bc:${d.acc};--bk:${d.col}"><i></i><div><b>${b.sv?'💾 ':''}${esc(d.name)}</b><span>${esc(d.ep)}</span><small>${esc(VXT[d.type][0])} · ${esc(VXTM[d.time][0])}${d.grav!==1?' · '+esc(d.grav<1?T88('poca gravità','low gravity'):T88('molta gravità','high gravity')):''} · <em>${star(d.dan)}</em>${b.ok?' · ✦ '+esc(T88('svelata','unveiled')):''}${b.f?' · '+esc(T88('scritta da te','written by you')):''}${b.sv&&b.st?sst(b):''}</small></div>${b.sv?`<button title="${esc(T88('Dimentica','Forget'))}" onclick="vxForget(${b.s})">✕</button>`:''}<button onclick="vxPanel(null);vxGo(vxRealDesc(${b.s},${b.f?1:0}),'lib')">${esc(b.sv?T88('Torna','Return'):T88('Apri','Open'))}</button></div>`};
  const SB=B.filter(b=>b.sv&&b.st),NB=B.filter(b=>!(b.sv&&b.st));
  vxPanel(`<style>#vxui .vbk{display:flex;align-items:center;gap:12px;margin:8px 0;padding:8px 10px;border:1px solid #d4af3766;border-radius:8px;background:linear-gradient(90deg,color-mix(in srgb,var(--bk) 30%,transparent),transparent)}#vxui .vbk>i{width:16px;height:52px;border-radius:3px;background:linear-gradient(90deg,var(--bc),var(--bk));box-shadow:0 0 12px var(--bc);flex:none}#vxui .vbk>div{flex:1;min-width:0}#vxui .vbk b{display:block;font-size:17px}#vxui .vbk span{display:block;font-size:13px;opacity:.85;font-style:italic}#vxui .vbk small{display:block;font-size:11px;opacity:.7;margin-top:2px}#vxui .vbk em{font-style:normal;color:#ffd66e}</style>
  <h2>📚 ${esc(T88('La libreria','The library'))}</h2><p>${esc(T88('Centinaia di libri, e su nessuno c\'è scritto l\'autore. Quelli che brillano sono le porte delle realtà del Voxeliaverse: nessuno le ha mai contate davvero.','Hundreds of books, and none of them names its author. The glowing ones are the doors to the realities of the Voxeliaverse: no one has ever truly counted them.'))}</p>
  ${SB.length?`<h3>💾 ${esc(T88('Realtà salvate','Saved realities'))}</h3>${SB.map(card).join('')}<h3>📖 ${esc(T88('Libri da aprire','Books to open'))}</h3>`:''}${NB.map(card).join('')}<p class="mu">${esc(T88('Realtà svelate: {0}','Realities unveiled: {0}').replace('{0}',v.n))} · ${esc(T88('Creature sconfitte: {0}','Creatures defeated: {0}').replace('{0}',v.k))}</p>
  <button onclick="vxv().b.push({s:(Math.random()*4294967295)>>>0});vxvSave();vxLib();const p=VX.ui.querySelector('.vpan');p.scrollTop=p.scrollHeight">📖 ${esc(T88('Cerca un altro libro','Look for another book'))}</button> <button onclick="vxPanel(null)">${esc(T88('Torna nella stanza','Back to the room'))}</button>`)}
for(const x of[...VXT,...VXTM])T88(x[0],x[1]);
T88('Torna nella stanza','Back to the room');T88('Apri','Open');T88('Torna','Return');T88('salvata','saved');T88('Dimentica','Forget');T88('Continua','Continue');T88('Una realtà ignota','An unknown reality');
