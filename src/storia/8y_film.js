/* ================= 7.11: SCENE DELLA STORIA — filmati girati nei luoghi veri del gioco =================
   Ogni inquadratura si svolge in un luogo vero di Aldoria (la sala del trono, la piazza, Aldoria Vecchia, le prigioni,
   la cappella, la stanza dell'Occhio...) costruito con gli stessi edifici, arredi, luci e personaggi del gioco, oppure
   in una scena disegnata apposta per i ricordi e le visioni. Gli attori camminano lungo strade vere (mai nell'acqua o
   dentro i muri), si girano dove vanno, entrano in scena camminando o con una dissolvenza: niente comparse improvvise.
   Ogni filmato si vede una volta sola durante la partita (si salta con «Salta») e poi si rivede dal menu della storia. */
const FSEEN_K='voxelia_film';
const fSeen=()=>LS.get(FSEEN_K,{})||{};
function fMark(id){const o=fSeen();if(!o[id]){o[id]=Date.now();LS.set(FSEEN_K,o)}}
const fLerp=(a,b,k)=>a+(b-a)*k,fClamp=(v,a,b)=>v<a?a:v>b?b:v,fSmooth=k=>{k=fClamp(k,0,1);return k*k*(3-2*k)};
const FCOL=['#7aff7a','#9fd0ff','#ffd060','#b0f0ff','#ff6a2a','#6fffe0'];

/* ---- personaggi nuovi, solo per i filmati: Aldric il Primo, i due fratelli da giovani e da bambini ---- */
Object.assign(NPCS,{aldric_primo:{n:'Aldric il Primo',c:'#7a1a2a',hat:'#d4af37'},malakar_p:{n:'Malakar',c:'#2a1a4a',hat:'#3a2a6a'},aldric_y:{n:'Aldric',c:'#7a1a2a',hat:'#d4af37'},
  aldric_k:{n:'Aldric bambino',c:'#7a1a2a',hat:'#d4af37'},malakar_k:{n:'Malakar bambino',c:'#2a1a4a',hat:'#3a2a6a'},muratore:{n:'Muratore',c:'#8a7a5a',hat:'#6a5a4a'},
  bimbo1:{n:'Bambino',c:'#a85a3a',hat:'#553'},bimbo2:{n:'Bambina',c:'#3a7a8a',hat:'#553'},fuggiasco:{n:'Abitante',c:'#6a5a4a',hat:'#444'},fuggiasca:{n:'Abitante',c:'#7a4a5a',hat:'#444'}});
Object.assign(NPS,{aldric_primo:'b|long:#e8e8e8|long:#e8e8e8|crown|cape:#8a1a2a,collar,necklace|scepter|proud|old',
  malakar_p:'a|long:#1a1a1a|goatee:#1a1a1a|none|cape:#2a1a4a,collar,stars|staff:#c46bff|proud|tall,robe',
  aldric_y:'b|short:#6a4a2a|full:#6a4a2a|crown|cape:#8a1a2a,collar|sword|proud|tall',
  aldric_k:'b|short:#6a4a2a|none|diadem|cape:#8a1a2a|sword|kid|kid',malakar_k:'a|short:#1a1a1a|none|none|cape:#2a1a4a|book|read|kid',
  muratore:'c|short:#4a3a2a|stubble|cap|apron:#a89878|hammer|hammer|big',bimbo1:'c|spiky:#4a2a1a|none|cap|patches|none|kid|kid',bimbo2:'b|braids:#a85a1a|none|bow:#ffd84a|freckles|flowers|kid|kid,f',
  fuggiasco:'c|short:#3a2a1a|stubble|none|patches|lantern|nervous|n',fuggiasca:'b|bun:#3a2a1a|none|scarf|apron|basket|nervous|f'});
const FMC={};// modelli dei personaggi, uno per ruolo
function fNpcModel(id){return FMC[id]||(FMC[id]=(()=>{try{return npcModel(id,{},{px:2,py:2})}catch(_){return hum('#888',SKIN)}})())}
function fHeroModel(){const q=P&&P.eq||{},c=q.c?q.c.r:-1,h=q.h?q.h.r:-1,w=q.w?q.w.r:0,wv=q.w?iv(q.w):20,s=q.s?q.s.r:-1;
  return heroL(P&&P.ap||APM,c,(P&&P.ap||APM).hh?-1:h,w,wv,s,0,P&&P.eq?eqTy(P.eq):null)}

/* ---- i luoghi: una zona vera del gioco, costruita a parte senza toccare quella in cui si gioca ---- */
const STG={};
function stgSave(){return{M,DEC,N,ZZ,Zk,BM,TB,ents,fx,pop,PJ,FC,MC,HHc,R,eid,GT,RDF,PIERD,camX,camY,S,P,NK,DK,PA,PM,LFP,BOATA,nm:SET.names,dm:SET.dmg,nl:NET.list}}
function stgRestore(s){if(s.nl0)nlight=s.nl0;M=s.M;DEC=s.DEC;N=s.N;ZZ=s.ZZ;Zk=s.Zk;BM=s.BM;TB=s.TB;ents=s.ents;fx=s.fx;pop=s.pop;PJ=s.PJ;FC=s.FC;MC=s.MC;HHc=s.HHc;R=s.R;eid=s.eid;GT=s.GT;RDF=s.RDF;PIERD=s.PIERD;
  camX=s.camX;camY=s.camY;S=s.S;P=s.P;NK=s.NK;DK=s.DK;PA=s.PA;PM=s.PM;LFP=s.LFP;BOATA=s.BOATA;SET.names=s.nm;SET.dmg=s.dm;NET.list=s.nl}
const FKEEP=new Set(['console','npc','po','tc','board','ship','cho','c100','letto','stash','vaso','botola','portap','reliq','figura','abo']);
function stgBuild(k){if(STG[k])return STG[k];const dg=k.startsWith('dg:')?k.slice(3):null,z0=dg?(DG[dg]?zd(dg+'@'+(DG[dg].fls||3)):null):Z[k];if(!z0)return null;const SV=stgSave(),DF0=DF;let st=null;
  // 7.12: dal menu, prima di cominciare una partita, la difficoltà non c'è ancora: i nemici dei dungeon dei filmati usano «Normale»
  if(!DF)DF=DFS[1];
  try{const z=Object.assign({},z0);Zk=dg?dg+'@'+(DG[dg].fls||3):k;ZZ=z;N=z.N;R=sd(hs('film|'+k));eid=900000;M=grid(0);DEC=grid('');BM=null;TB=[];FC=null;ents=[];fx=[];pop=[];PJ=[];GT=new Set();RDF=new Set();PIERD=new Set();BOATA=new Set();
    if(!P)P=newP();let sp=null;
    if(dg){sp=genDungeon(z);try{decorDG(z,sp)}catch(_){}try{campfires(sp)}catch(_){}}else if(k==='town')genTown();else if(z.lay)genInterior(z);else if(z.gen)genDist(z);else genWild(z);
    if(k==='porto'&&typeof portDecor==='function')try{portDecor()}catch(_){}
    if(k==='occhio')for(const e of ents)if(e.k==='abo')e.film=1;
    // Aldoria Vecchia: il pozzo prosciugato della vecchia piazza, come lo trova l'eroe
    if(k==='vecchia'&&typeof WELL!=='undefined'){const[wx,wy]=WELL;for(let y=wy-2;y<=wy+2;y++)for(let x=wx-2;x<=wx+2;x++){M[y][x]=0;DEC[y][x]=''}M[wy][wx]=6;DEC[wy][wx]='ʬ';for(const[x,y]of[[wx-2,wy-2],[wx+2,wy-2],[wx-2,wy+2]]){M[y][x]=6;DEC[y][x]='Ŗ'}}
    st={k:Zk,key:k,z,N,M,DEC,BM:BM||grid(-1),TB,GT,RDF,PIERD,BOATA,ents:ents.filter(e=>FKEEP.has(e.k)&&!(dg&&e.k==='po'))};
    if(dg){const b=ents.find(e=>e.k==='en'&&e.boss)||{px:sp[0]+.5,py:sp[1]+.5};let bx=b.px,by=b.py;const fr=(x,y)=>{const u=x|0,v=y|0;return u>0&&v>0&&u<N-1&&v<N-1&&WK(M[v][u])};
      // il boss in un punto con spazio intorno, e l'eroe tre passi davanti a lui (verso lo spettatore)
      let best=null,bs=-1;for(let v=(by|0)-4;v<=(by|0)+4;v++)for(let u=(bx|0)-4;u<=(bx|0)+4;u++){if(!fr(u+.5,v+.5))continue;let n=0;for(let b2=-2;b2<=3;b2++)for(let a2=-2;a2<=2;a2++)if(fr(u+a2+.5,v+b2+.5))n++;const sc=n*3-Math.hypot(u+.5-bx,v+.5-by);if(sc>bs){bs=sc;best=[u+.5,v+.5]}}
      if(best){bx=best[0];by=best[1]}st.boss=[bx,by];let h=null;for(const d2 of[3,2.5,3.5,2,4])for(const[a2,b2]of[[0,d2],[d2*.7,d2*.7],[-d2*.7,d2*.7],[d2,0],[-d2,0]])if(!h&&fr(bx+a2,by+b2))h=[bx+a2,by+b2];st.heroAt=h||[bx,by+2]}
    for(const e of st.ents)if(e.k==='npc'){e.qm='';e.path=[];e.wd=0;e.go=0;e.slp=0;e.fc0=e.fc0==null?0:e.fc0}}
  catch(err){console.warn('stage',k,err);st=null}finally{stgRestore(SV);DF=DF0}
  if(st)STG[k]=st;return st}
// le scene disegnate apposta (ricordi, visioni, il mare): un pavimento e una funzione che disegna
const FSET={};

/* ---- gli attori ----
   n: personaggio (NPCS), hero:1 l'eroe con il suo equipaggiamento, boss:'chiave' un nemico, L:()=>modello per gli oggetti.
   p:[x,y] dove sta · go:[[x,y],...] dove cammina (con t0 inizio e v velocità; nei luoghi veri la strada si cerca da sola)
   f: verso cui guarda (numero 0-7, [dx,dy], 'id' di un altro attore, o 'cam' verso lo spettatore)
   in:[t,durata] / out:[t,durata] dissolvenze · talk:[t0,t1] gesti mentre parla · z altezza · s scala · ghost:1 trasparente
   an:'pray'|'sad'... posa · kneel:1 in ginocchio · al opacità fissa · glow:'r,g,b' luce */
// 7.12: «verso lo spettatore» è dritto (0), come i personaggi fermi del gioco: in diagonale i modelli si vedevano storti
const FACE={S:0,N:4,E:6,W:2,cam:0};
// chi sta fermo non resta mai in diagonale: si gira verso il lato dritto più vicino (7→0, 1→0, 3→2, 5→4)
const fStraight=fc=>(fc&1)?(fc===7?0:fc-1):fc;
function fPathPts(st,pts){if(!st||!st.M)return pts.map(p=>p.slice());const out=[pts[0].slice()];
  for(let i=1;i<pts.length;i++){const a=out[out.length-1],b=pts[i];let seg=null;const SV=stgSave();
    try{M=st.M;N=st.N;const ok=(x,y)=>x>=0&&y>=0&&x<N&&y<N&&WK(M[y][x]);if(ok(a[0]|0,a[1]|0)&&ok(b[0]|0,b[1]|0)){const p=path(a[0]|0,a[1]|0,b[0]|0,b[1]|0);if(p.length)seg=p.map(q=>[q.x+.5,q.y+.5])}
      // si tolgono le svolte inutili: da un punto si va dritti al più lontano raggiungibile in linea retta
      if(seg){seg[seg.length-1]=b.slice();const L=[a].concat(seg),R2=[a];let j=0;while(j<L.length-1){let k=L.length-1;for(;k>j+1;k--)if(fLine(L[j],L[k]))break;R2.push(L[k]);j=k}seg=R2.slice(1)}}finally{stgRestore(SV)}
    for(const q of(seg||[b.slice()]))out.push(q)}return out}
function fLine(a,b){const d=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.ceil(d/.2);for(let i=0;i<=n;i++){const x=fLerp(a[0],b[0],i/n),y=fLerp(a[1],b[1],i/n);
    for(const[ox,oy]of[[0,0],[.22,.22],[-.22,.22],[.22,-.22],[-.22,-.22]]){const u=Math.floor(x+ox),v=Math.floor(y+oy);if(u<0||v<0||u>=N||v>=N||!WK(M[v][u]))return false}}return true}
function fActPrep(a,st){if(a.go&&!a._pts){a._pts=a.pf===0||!st?a.go.map(p=>p.slice()):fPathPts(st,a.go);a._len=[0];for(let i=1;i<a._pts.length;i++)a._len.push(a._len[i-1]+Math.hypot(a._pts[i][0]-a._pts[i-1][0],a._pts[i][1]-a._pts[i-1][1]))}}
// posizione, verso e opacità di un attore al tempo lt dell'inquadratura
function fActAt(a,lt,acts){const r={id:a.id,px:0,py:0,mov:0,fc:0,al:1,z:a.z||0};
  if(a.go){const P2=a._pts,Lt=a._len[a._len.length-1],v=a.v||1.5,t0=a.t0||0,Tc=Lt/v,acc=Math.min(.45,Tc),Tt=Tc+acc,u=lt-t0;
    // partenza e arrivo morbidi: si accelera e si rallenta in mezzo secondo, mai scatti
    const s=Lt<=0?0:u<=0?0:u>=Tt?Lt:u<acc?v*u*u/(2*acc):u>Tt-acc?Lt-v*(Tt-u)*(Tt-u)/(2*acc):v*(u-acc/2);
    let i=1;while(i<P2.length-1&&a._len[i]<s)i++;const s0=a._len[i-1]||0,s1=a._len[i]||0,k=s1>s0?(s-s0)/(s1-s0):1,A=P2[i-1]||P2[0],B=P2[i]||P2[0];r.px=fLerp(A[0],B[0],k);r.py=fLerp(A[1],B[1],k);
    r.mov=Lt>0&&u>0&&u<Tt;const dx=B[0]-A[0],dy=B[1]-A[1];if(r.mov&&(dx||dy))r.fc=faceOf(dx,dy);else r.fc=fFace(a,r,lt,acts,faceOf(dx||0,dy||1))}
  else{const p=typeof a.p==='function'?a.p(lt):a.p||[0,0];r.px=p[0];r.py=p[1];r.fc=fFace(a,r,lt,acts,0)}
  let al=a.al==null?1:typeof a.al==='function'?a.al(lt):a.al;if(a.in){const k=(lt-a.in[0])/a.in[1];al*=fSmooth(k)}if(a.out){const k=(lt-a.out[0])/a.out[1];al*=1-fSmooth(k)}r.al=al;
  if(typeof a.zf==='function')r.z+=a.zf(lt);return r}
function fFace(a,r,lt,acts,def){let f=typeof a.f==='function'?a.f(lt):a.f;if(f==null)return def;if(typeof f==='number')return f&7;if(typeof f==='string'){if(FACE[f]!=null)return FACE[f];const o=acts&&acts[f];if(o)return faceOf(o.px-r.px,o.py-r.py)||0;return def}
  if(Array.isArray(f))return faceOf(f[0],f[1]);return def}
const FPE={};// "entità" finte per le pose (camminata, gesti, respiro)
function fActDraw(a,r,lt){if(r.al<=.01)return;const pe=FPE[a.id]||(FPE[a.id]={id:hs(a.id)%997,nph:(hs(a.id)%628)/100,px:0,py:0,path:[],mvT:-9,atkT:-9,cdt:1,sp:1.6});pe.px=r.px;pe.py=r.py;
  pe.path=r.mov?[1]:[];pe.nmv=r.mov?t:-9;pe.mvT=r.mov?t:-9;let L=null,rig=false,fc=r.mov?r.fc:fStraight(r.fc);
  const kn=typeof a.kneel==='function'?a.kneel(lt):a.kneel;
  if(a.hero){L=a._L||(a._L=fHeroModel());if(r.mov)L=walkLegs(L,t*10);else if(kn)L=L.map(q=>q[2]<6?q:[q[0],q[1],q[2]-4,q[3],q[4],q[5],q[6]]);rig=true}
  else if(a.n){let M0=fNpcModel(a.n);if(a.an&&M0.an!==a.an){const k=a.n+'|'+a.an;M0=FMC[k]||(FMC[k]=Object.assign(M0.slice(),{an:a.an,g:M0.g,rg:M0.rg,kind:M0.kind,top:M0.top,fem:M0.fem}))}
    if(a.ghostC){const k=a.n+'|g|'+a.ghostC;M0=FMC[k]||(FMC[k]=ghostL(M0,.55,a.ghostC))}
    const pa=PA,pm=PM,tk=a.talk&&lt>=a.talk[0]&&lt<=a.talk[1];if(tk){PA=pe;PM='npc'}try{L=M0.rg&&M0.g?npcPose(M0,pe):M0}finally{PA=pa;PM=pm}if(kn)L=L.map(q=>q[2]<6?q:[q[0],q[1],q[2]-4,q[3],q[4],q[5],q[6],q[7]]);rig=true}
  else if(a.boss){const b=E[a.boss];if(!b)return;L=b.m;if(L&&L.rg){L=rigPose(L,pe);rig=true}else rig=false}
  else if(a.L){L=a.L(lt,r);rig=!!a.rig}
  if(!L)return;const s=a.s||1;if(s!==1){const L0=L;L=scl(L0,s);if(L0.rg){L.rg=1;L.g=L0.g}}
  if(a.lie){let top=1;for(const q of L)top=Math.max(top,q[2]+q[5]);const k=.9/top;L=L.map(q=>[q[0],q[2]*k-.45,(q[1]+.3)*8,q[3],q[5]*k,Math.max(.6,q[4]*8),q[6]]);rig=false}
  const ga=a.ghost?(.55+Math.sin(t*2+a.id.length)*.12):1,al=r.al*ga,z=r.z+(a.ghost?8+Math.sin(t*1.7)*3:0)+(r.mov&&(a.hero||a.n)?Math.abs(Math.sin(t*9+pe.nph))*1.5:0);
  if(!a.noshadow){g.globalAlpha=al*(a.ghost?.4:1);g.fillStyle='rgba(0,0,0,.28)';g.beginPath();g.ellipse(PX(r.px,r.py),PY(r.px,r.py,0),15*s*(a.boss?1.8:1),7*s*(a.boss?1.8:1),0,0,6.3);g.fill()}
  g.globalAlpha=al;if(rig)drawHero(L,r.px,r.py,z,a.white&&a.white(lt)?1:0,fc);else{const wh=a.white&&a.white(lt);for(const b of L)box(r.px+b[0],r.py+b[1],b[2]+z,b[3],b[4],b[5],wh?'#ffffff':b[6],b[7])}g.globalAlpha=1;
  if(a.glow&&typeof nlight==='function')nlight(r.px,r.py,30,150,a.glow,.9*r.al);
  if(FQA){const m=g.getTransform(),X=PX(r.px,r.py),Y=PY(r.px,r.py,0);FQA.push({id:a.id,x:+r.px.toFixed(3),y:+r.py.toFixed(3),al:+r.al.toFixed(2),mov:r.mov?1:0,free:a.free?1:0,sx:Math.round((m.a*X+m.c*Y+m.e)/DPR),sy:Math.round((m.b*X+m.d*Y+m.f)/DPR)})}}
let FQA=null;// controllo automatico dei filmati: chi c'è, dove, con quale opacità (lo usano i test)

/* ---- la telecamera e il disegno di un'inquadratura ---- */
// in verticale (telefoni) la scena si avvicina un po': si perde qualcosa ai lati, ma i personaggi non diventano formiche
function fBase(){return H>W?Math.max(.5,Math.min(W/700,H/600)):Math.max(.45,Math.min(W/1000,H/600))}
function fSky(o){const c=o.sky||(SKY[o.st]||SKY.town),gr=g.createLinearGradient(0,0,0,H),n=o.night||0,d=o.dusk||0,mix=(a,b,k)=>mixC(a,b,k);
  gr.addColorStop(0,mix(mix(c[0],'#3a2a5a',d),'#05060f',n));gr.addColorStop(.55,mix(mix(c[1],'#d0705a',d),'#101830',n));gr.addColorStop(1,mix(mix(c[2],'#f0b070',d),'#1a2038',n));g.fillStyle=gr;g.fillRect(0,0,W,H);
  if(n>.3)for(let i=0;i<70;i++){g.fillStyle=`rgba(255,255,240,${(.2+.2*Math.sin(t*2+i))*n})`;g.fillRect((i*173.3+t*3)%W,(i*97.7)%(H*.5),1.5,1.5)}}
// pavimento già disegnato: tile() salta il pavimento quando c'è il «foglio» del pavimento (qui finto, non si disegna mai)
const FSTFC={film:1};
function fRenderStage(S2,lt,cam,acts,AR){const st=stgBuild(S2.st);if(!st)return;const SV=stgSave();
  try{M=st.M;DEC=st.DEC;N=st.N;ZZ=st.z;Zk=st.k;BM=st.BM;TB=st.TB;GT=st.GT;RDF=st.RDF||new Set();PIERD=st.PIERD;BOATA=st.BOATA;FC=null;HHc=null;fx=[];pop=[];PJ=[];SET.names=0;SET.dmg=0;NET.list=[];
    // l'eroe "finto" sta lontano dall'inquadratura: così i muri davanti alla telecamera non diventano trasparenti come nel gioco.
    // Nei dungeon invece serve vicino, perché la luce che si porta dietro illumina la scena.
    const dgS=!!st.z.dg;P=Object.assign({},SV.P||{},{px:dgS?cam.x:cam.x-60,py:dgS?cam.y:cam.y-60,path:[],tg:null});NK=S2.night||0;DK=S2.dusk||0;PA=null;PM=0;
    const nl0=nlight;nlight=function(x,y,z,r,c,a,w){if(NK>.02&&NLS.length<90&&Math.abs(x-cam.x)+Math.abs(y-cam.y)<26)NLS.push([x,y,z,r,c,a,w])};SV.nl0=nl0;
    S=fBase()*cam.z;camX=PX(cam.x,cam.y);camY=PY(cam.x,cam.y,10);
    if(SKY[st.k]&&!st.z.int)fSky(S2);else{g.setTransform(DPR,0,0,DPR,0,0);g.fillStyle=st.z.bg||'#05040a';g.fillRect(0,0,W,H)}
    g.setTransform(S*DPR,0,0,S*DPR,(W/2-camX*S)*DPR,(H/2-camY*S)*DPR);GLOW.length=0;NLS.length=0;
    const drop=S2.drop?new Set(S2.drop):null,by={},cvx=W/2/S+170,cvy=H/2/S+230,put=o=>{const ex=PX(o.px,o.py)-camX,ey=PY(o.px,o.py,0)-camY;if(ex>cvx||ex<-cvx||ey>cvy||ey<-cvy)return;const k=(o.px|0)+(o.py|0);(by[k]=by[k]||[]).push(o)};
    for(const e of st.ents){if(drop&&e.k==='npc'&&(drop.has(e.nid)||drop.has('*')))continue;if(e.k==='abo'&&!S2.abo)continue;if(S2.dropPo&&e.k==='po'&&e.st==='void')continue;put(e)}
    for(const a of acts){const r=AR[a.id];if(r){r._a=a;put(r);if(NK>.02&&r.al>.05&&!a.dark)NLS.push([r.px,r.py,24,a.hero?150:115,'255,236,200',.75*r.al])}}
    if(NK>.02&&S2.moon!==0)NLS.push([cam.x,cam.y,10,260,'200,210,255',.35])
    const vx=W/2/S+100,vy0=H/2/S+60,vy1=H/2/S+160,vis=(x,y)=>{const ex=PX(x,y)-camX,ey=PY(x,y,0)-camY;return Math.abs(ex)<vx&&ey>-vy1&&ey<vy0+40};
    // 7.12: prima tutto il pavimento, poi muri, arredi e personaggi (come nel gioco): così l'erba della casella dopo non copre i piedi
    for(let d=0;d<2*N-1;d++)for(let x=Math.max(0,d-N+1);x<=Math.min(d,N-1);x++){const y=d-x,m=M[y][x];if(!vis(x,y))continue;
      if(m===0||m===4||m===8||m===6||(m===1&&openW(x,y)))floor(x,y,m===6?(RDF.has(y*N+x)?4:0):m===1?0:m,hh(x,y))}
    FC=FSTFC;
    for(let d=0;d<2*N-1;d++){for(let x=Math.max(0,d-N+1);x<=Math.min(d,N-1);x++){const y=d-x;if(vis(x,y))tile(x,y)}
      if(by[d])by[d].sort((a,b)=>a.py-b.py).forEach(o=>{if(o._a)fActDraw(o._a,o,lt);else if(o.k==='npc')fStageNpc(o,S2.nf&&S2.nf[o.nid]);else if(o.k==='abo'){if(S2.abo)S2.abo(lt,o)}else ent(o)})}
    if(S2.fx)S2.fx(lt,AR);
    if(!S2.nolight){if(st.z.dg||st.z.int)lights();else if(NK>.01||DK>.01)nightDraw()}}
  finally{stgRestore(SV)}}
// i personaggi che abitano il luogo: fermi, con il loro modo di stare (gesti, respiro), girati verso la scena
function fStageNpc(e,fc){let L=e.m;if(!L)return;const pa=PA,pm=PM;PA=null;PM=0;try{if(L.rg&&L.g)L=npcPose(L,e)}finally{PA=pa;PM=pm}
  g.fillStyle='rgba(0,0,0,.28)';g.beginPath();g.ellipse(PX(e.px,e.py),PY(e.px,e.py,0),15,7,0,0,6.3);g.fill();if(L.rg||L.hm)drawHero(L,e.px,e.py,0,0,fStraight(fc!=null?fc:e.fc0==null?0:e.fc0));else drawL(L,e.px,e.py,0)}
function fRenderSet(S2,lt,cam,acts,AR){g.setTransform(DPR,0,0,DPR,0,0);const G=S2.bg||['#05060c','#1a1430'],gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,G[0]);gr.addColorStop(1,G[1]);g.fillStyle=gr;g.fillRect(0,0,W,H);
  if(S2.stars)for(let i=0;i<60;i++){g.fillStyle=`rgba(255,255,240,${.2+.2*Math.sin(t*2+i)})`;g.fillRect((i*173.3+t*3)%W,(i*97.7)%(H*.5),1.5,1.5)}
  const sc=fBase()*cam.z;fSc(sc,cam.x,cam.y);const set=FSET[S2.set];if(set)set(S2,lt,sc,cam);fSc(sc,cam.x,cam.y);
  const L=acts.map(a=>{const r=AR[a.id];if(r)r._a=a;return r}).filter(Boolean).sort((a,b)=>(a.px+a.py)-(b.px+b.py));for(const r of L)fActDraw(r._a,r,lt);if(S2.fx)S2.fx(lt,AR)}
function fSc(sc,cx,cy){g.setTransform(sc*DPR,0,0,sc*DPR,(W/2-PX(cx,cy)*sc)*DPR,(H*.58-PY(cx,cy,0)*sc)*DPR)}

/* ---- il proiettore ---- */
function filmGet(id){if(id&&id.startsWith('fr_'))return frFilm(id.slice(3));return FILMS[id]}
function filmPlay(id,cb){const F=filmGet(id);if(!F){if(cb)cb();return}fMark(id);const ing=!!started;
  if(ing){started=0;document.body.classList.remove('ig');PM=0;$('pn').style.display='none'}fHold(1);
  const end=()=>{for(const k in STG)delete STG[k];fHold(0);if(ing){started=1;document.body.classList.add('ig');last=performance.now();music(typeof zoneMus==='function'?zoneMus():'town')}if(cb)cb()};
  const L=F.L.map(s=>Object.assign({},s,{f:'film',tx:s.tx||''}));
  for(const s of L){s.act=(s.act||[]).map(a=>Object.assign({},a));const st=s.st?stgBuild(s.st):null;
    // coordinate relative al boss del dungeon (la Cittadella, i signori dei frammenti)
    if(s.rel&&st&&st.boss){const[ox,oy]=st.boss,sh=p=>[p[0]+ox,p[1]+oy];s.cam=s.cam.map(c=>[c[0]+ox,c[1]+oy,c[2]]);
      for(const a of s.act){if(Array.isArray(a.p))a.p=sh(a.p);if(a.go)a.go=a.go.map(sh)}const fx0=s.fx;if(fx0)s.fx=(lt,AR)=>{const T=g.getTransform();g.translate(PX(ox,oy),PY(ox,oy,0));try{fx0(lt,AR)}finally{g.setTransform(T)}}}
    for(const a of s.act)fActPrep(a,st)}
  playCine(L,F.mus||(L[0]&&L[0].mus)||'intro',end);CN.film=id;CN.F=F}
// durante un filmato niente cartelli sopra le immagini: i banner aspettano in coda (anche quello appena comparso),
// il nome della zona e i messaggi restano nascosti, e l'ultimo messaggio arriva quando il filmato finisce
let FMSG=null,BCUR=null;
function fHold(on){document.body.classList.toggle('film',!!on);if(on){const el=$('bnr');if(BB&&BCUR&&el&&el.className==='on'&&BQ[0]!==BCUR)BQ.unshift(BCUR)}else if(FMSG){const s=FMSG;FMSG=null;setTimeout(()=>_msgF(s),300)}}
const _bnNextF=bnNext;bnNext=function(){if(CN&&CN.film){BB=1;setTimeout(bnNext,400);return}BCUR=BQ[0]||null;_bnNextF()};
const _msgF=msg;msg=function(s){if(CN&&CN.film){FMSG=s;return}_msgF(s)};
// i filmati della partita: una volta sola (se le scene della storia sono attive)
function filmOnce(id,after){if(SET.film===0||fSeen()[id]){if(after)after();return}filmPlay(id,after)}
const _cineDrawF=cineDraw;cineDraw=function(dt){if(CN&&CN.film){filmDraw(dt);return}_cineDrawF(dt)};
function filmDraw(dt){const C=CN;C.t+=dt;let s=0,a0=0;while(s<C.L.length&&C.t>a0+C.L[s].d){a0+=C.L[s].d;s++}if(s>=C.L.length){cineSkip();return}
  const S2=C.L[s],lt=C.t-a0,D=S2.d,u=Math.min(1,lt/D),T0=t;t=C.t;
  if(C.s!==s){C.s=s;const el=$('ctx');if(el&&el.animate)el.animate([{opacity:0},{opacity:1}],{duration:600});if(S2.mus&&TRK[S2.mus])music(S2.mus);if(S2.sfx)try{S2.sfx()}catch(_){}}
  try{const c0=S2.cam[0],c1=S2.cam[1]||c0,e=(S2.ease||fSmooth)(u);let cam={x:fLerp(c0[0],c1[0],e),y:fLerp(c0[1],c1[1],e),z:fLerp(c0[2],c1[2],e)};
    const AR={};for(const a of S2.act)AR[a.id]=fActAt(a,lt,null);for(const a of S2.act){if(typeof a.f==='string'&&!FACE[a.f]&&AR[a.f]&&!AR[a.id].mov)AR[a.id].fc=faceOf(AR[a.f].px-AR[a.id].px,AR[a.f].py-AR[a.id].py)}
    if(S2.camF&&AR[S2.camF]){const r=AR[S2.camF];cam={x:fLerp(cam.x,r.px,.85),y:fLerp(cam.y,r.py,.85),z:cam.z}}
    if(S2.shake){const k=S2.shake(lt);if(k>0){cam.x+=(Math.random()-.5)*k*.12;cam.y+=(Math.random()-.5)*k*.12}}
    if(FQA)FQA.push({shot:s,lt:+lt.toFixed(3),st:S2.st||S2.set,cam});
    if(S2.st)fRenderStage(S2,lt,cam,S2.act,AR);else fRenderSet(S2,lt,cam,S2.act,AR);
    g.setTransform(DPR,0,0,DPR,0,0);
    if(S2.fog){const bs=blobSpr('150,154,165');for(let k=0;k<5;k++){const x=((C.t*26*(k+1)+k*300)%(W*1.5))-W*.25,y=H*(.35+k*.1);g.globalAlpha=.14*S2.fog;g.drawImage(bs,x-W*.4,y-W*.4,W*.8,W*.8)}g.globalAlpha=1}
    if(S2.fire){g.fillStyle=`rgba(255,70,20,${.12*S2.fire*(1+Math.sin(C.t*7)*.15)})`;g.fillRect(0,0,W,H)}
    if(S2.rain){g.strokeStyle='rgba(170,190,230,.35)';g.lineWidth=1;g.beginPath();for(let i=0;i<110;i++){const x=(i*97.3+C.t*90)%W,y=(i*53.1+C.t*620)%H;g.moveTo(x,y);g.lineTo(x-4,y+14)}g.stroke()}
    if(S2.tint){g.fillStyle=typeof S2.tint==='function'?S2.tint(lt):S2.tint;g.fillRect(0,0,W,H)}
    if(S2.sepia){g.fillStyle='rgba(120,80,30,.28)';g.fillRect(0,0,W,H)}
    if(S2.over)S2.over(lt);
    if(S2.vis||S2.sepia){const v=g.createRadialGradient(W/2,H/2,H*.2,W/2,H/2,Math.max(W,H)*.7);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,S2.sepia?'rgba(40,20,0,.7)':'rgba(30,0,40,.75)');g.fillStyle=v;g.fillRect(0,0,W,H)}
    const vg=g.createRadialGradient(W/2,H/2,H*.3,W/2,H/2,Math.max(W,H)*.75);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.45)');g.fillStyle=vg;g.fillRect(0,0,W,H);
    // bande nere del cinema
    const bk=Math.min(1,C.t/1.2),bar=H*.085*fSmooth(bk);g.fillStyle='#000';g.fillRect(0,0,W,bar);g.fillRect(0,H-bar,W,bar);
    if(S2.title&&lt>D-(S2.tt||3.6)){const a=Math.min(1,(lt-(D-(S2.tt||3.6)))/1)*Math.min(1,(D-lt)/.6);g.save();g.globalAlpha=Math.max(0,a);g.textAlign='center';g.font=`bold ${Math.round(Math.min(W,H)/(S2.big?9:17))}px Georgia,serif`;g.lineWidth=5;g.strokeStyle='#1a0a04';g.strokeText(S2.title,W/2,H*.24);g.fillStyle='#ffd88a';g.fillText(S2.title,W/2,H*.24);
      if(S2.sub){g.font=`italic ${Math.round(Math.min(W,H)/30)}px Georgia,serif`;g.fillStyle='#fff6dc';g.fillText(S2.sub,W/2,H*.24+Math.min(W,H)/16)}g.restore()}
    const fa=Math.max(0,1-lt/.6,S2.cut?0:1-(D-lt)/.6);if(fa>0){g.fillStyle=`rgba(0,0,0,${Math.min(1,fa)})`;g.fillRect(0,0,W,H)}
    if(S2.flash){const k=S2.flash(lt);if(k>0){g.fillStyle=`rgba(255,250,235,${Math.min(1,k)})`;g.fillRect(0,0,W,H)}}}
  catch(err){console.warn('film',err)}finally{t=T0}
  const n=Math.min(S2.tx.length,Math.floor(Math.max(0,lt-.6)*40)),tx=S2.tx.slice(0,n),key=s+':'+tx;if(key!==C.shown){C.shown=key;const el=$('ctx');if(el)el.innerHTML=(S2.who&&n?`<b class="fwho">${esc(S2.who)}</b>`:'')+esc(tx)}}
