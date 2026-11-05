/* ================= 7.41: IN RETE TUTTI VEDONO GLI STESSI NEMICI =================
   Prima ogni giocatore muoveva i nemici per conto suo: lo stesso lupo poteva essere in due posti diversi, uno vedeva un
   nemico che l'altro non vedeva, e i nemici nati dopo (rinforzi, ondate, contratti, assedi) esistevano per uno solo.
   Ora ogni nemico ha un «padrone» che lo fa muovere e combattere, e gli altri ne vedono la copia esatta:
   - i nemici della zona li guida chi è nella zona da più tempo; se esce, li prende chi resta, senza farli sparire;
   - quelli che nascono per un giocatore (contratti, conquiste, assedi, evocazioni) li guida lui, ma li vedono tutti;
   - i nemici attaccano chiunque sia più vicino, e i colpi arrivano a chi li prende; i colpi di tutti arrivano al padrone;
   - quando un nemico cade, cade per tutti: chi ha combattuto (o era vicino) prende la sua parte di esperienza e bottino,
     e il portale dopo il boss si apre per tutti.
   Con chi ha una versione vecchia del gioco si gioca come prima. */
const SYNC={on:0,n:0,age:0,rk:'',dd:[],eh:[],ehs:0,last:{},miss:new Map(),tick:0,host:1};
const syncPeers=()=>{const rk=rmKey(),L=[];for(const id in NET.peers){const q=NET.peers[id];if(q&&q.rm===rk&&q.sy)L.push([id,q])}return L};
const syncOn=()=>!!(NET.ok&&NET.code&&started&&P&&MODE!=='dim'&&!(typeof DEV!=='undefined'&&DEV.sess));
// chi guida i nemici della zona: chi c'è da più tempo (a parità, l'id più piccolo)
function syncIsHost(){const me=NET.id;let best=[SYNC.age,String(me)];for(const[id,q]of syncPeers()){const a=+q.za||0;if(a>best[0]+.6||(Math.abs(a-best[0])<=.6&&String(id)<best[1]))best=[a,String(id)]}return best[1]===String(me)}
function syncGid(e){if(!e.sg)e.sg=NET.id+'.'+(++SYNC.n).toString(36);return e.sg}
// quello che il gioco manda agli altri, insieme alla posizione dell'eroe (10 volte al secondo)
function syncPack(){if(!syncOn())return{};const es=[];for(const e of ents){if(e.k!=='en'||e.pup||e.tr||e.hp<=0)continue;if(e.zn&&(!SYNC.host||SYNC.age<1.5))continue;
    const nm=E[e.t]&&E[e.t].n!==e.n?e.n:0,fl=(e.boss?1:0)|(e.al?2:0)|(e.atkT!=null&&t-e.atkT<.3?4:0)|(e.enr?8:0)|(e.zn?16:0);
    es.push([syncGid(e),e.t,+e.px.toFixed(2),+e.py.toFixed(2),Math.max(0,Math.round(e.hp)),Math.round(e.mx),fl,nm||0,e.atkD?+e.atkD[0].toFixed(2):0,e.atkD?+e.atkD[1].toFixed(2):0,e.lv|0])}
  const now=t;SYNC.dd=SYNC.dd.filter(d=>now-d[1]<3);SYNC.eh=SYNC.eh.filter(h=>now-h[3]<3);
  return{sy:1,za:+SYNC.age.toFixed(1),es,dd:SYNC.dd.map(d=>d[0]),eh:SYNC.eh.map(h=>[h[0],h[1],h[2]])}}
// un nemico che guido io colpisce un altro eroe: il colpo glielo manda il gioco
function syncEH(pid,at){if(!syncOn())return;SYNC.eh.push([String(pid),Math.round(at*10)/10,++SYNC.ehs,t])}
// un nemico mio che cade: lo sanno tutti
const _kill741=kill;kill=function(e){if(e&&e.k==='en'&&e.sg&&!e.pup&&!e.sk&&syncOn())SYNC.dd.push([e.sg,t]);_kill741(e)};
// la copia di un nemico di un altro giocatore
function syncMake(r,owner){const[gid,tk,x,y,hp,mx,fl,nm,ax,ay,lv]=r;if(!E[tk]&&typeof twType==='function')twType(tk);if(!E[tk])return null;let e;const lv0=ZZ.lv;try{if(lv)ZZ.lv=lv;e=mk(tk,clamp(x|0,0,N-1),clamp(y|0,0,N-1))}finally{ZZ.lv=lv0}
  Object.assign(e,{sg:gid,pup:1,own:owner,px:x,py:y,tx:x,ty:y,hp,mx,zn:!!(fl&16)});if(nm)e.n=nm;e.lv=lv;e.boss=!!(fl&1)||e.boss;ents.push(e);return e}
function syncTick(dt){if(!syncOn()){if(SYNC.on){SYNC.on=0;for(const e of ents.slice())if(e.pup)ents.splice(ents.indexOf(e),1)}return}
  const rk=rmKey();if(rk!==SYNC.rk){SYNC.rk=rk;SYNC.age=0;SYNC.miss.clear();SYNC.last={}}SYNC.age+=dt;SYNC.on=1;
  const peers=syncPeers(),here=new Set(peers.map(p=>String(p[0])));const wasHost=SYNC.host;SYNC.host=syncIsHost();
  // i colpi dei nemici degli altri che arrivano a me
  for(const[id,q]of peers){const L=Array.isArray(q.eh)?q.eh:[];let ls=SYNC.last[id]||0;for(const h of L){if(!Array.isArray(h)||h[2]<=ls)continue;ls=Math.max(ls,h[2]);if(String(h[0])===String(NET.id)&&P.hp>0)hurtP(+h[1]||1)}SYNC.last[id]=ls}
  // lo stato dei nemici degli altri
  const seen=new Map(),dead=new Set();let hostEs=null;
  for(const[id,q]of peers){if(Array.isArray(q.dd))for(const g of q.dd)dead.add(String(g));if(!Array.isArray(q.es))continue;if(!SYNC.host&&syncIsHostId(id,peers)&&(+q.za||0)>=1.5)hostEs=q.es;for(const r of q.es)if(Array.isArray(r)&&r.length>=7)seen.set(String(r[0]),[r,id])}
  // non guido più la zona: i miei nemici della zona lasciano il posto a quelli di chi la guida
  if(!SYNC.host&&hostEs)for(const e of ents.slice())if(e.k==='en'&&e.zn&&!e.pup)ents.splice(ents.indexOf(e),1);
  const byGid=new Map();for(const e of ents)if(e.k==='en'&&e.sg)byGid.set(e.sg,e);
  for(const[g,[r,owner]]of seen){let e=byGid.get(g);if(e&&!e.pup){if(e.own!==undefined)continue;continue}if(dead.has(g))continue;
    if(!e){e=syncMake(r,owner);if(!e)continue}
    e.own=owner;e.tx=r[2];e.ty=r[3];if(Math.abs(e.mx-r[5])>0)e.mx=r[5];if(r[4]<e.hp||!e.hme||t-e.hme>.6)e.hp=Math.max(1,r[4]);e.al=!!(r[6]&2);e.enr=!!(r[6]&8);
    if(r[6]&4&&!(e.atkT!=null&&t-e.atkT<.3)){e.atkT=t;e.atkD=[r[8]||0,r[9]||0]}SYNC.miss.delete(g);
    if(e.boss&&e.al&&!e.intro&&dist(e,P)<(e.ag||8)){e.intro=1;if(typeof sceneBoss==='function')sceneBoss(e)}}
  // le copie: si muovono verso dove sono davvero, e cadono quando cadono
  for(const e of ents.slice()){if(!e.pup)continue;e.fl-=dt;const g=e.sg;
    if(dead.has(g)){const near=dist(e,P)<10||(e.hme&&t-e.hme<20);if(near){e.hp=0;e.pup=0;e.sk=1;kill(e)}else ents.splice(ents.indexOf(e),1);continue}
    if(!seen.has(g)){const m=(SYNC.miss.get(g)||0)+dt;SYNC.miss.set(g,m);const ownHere=here.has(String(e.own));
      if(ownHere&&m>.6){ents.splice(ents.indexOf(e),1);continue}
      if(!ownHere){if(e.zn&&SYNC.host){e.pup=0;e.own=undefined;e.cdt=e.cd||1;continue}if(!e.zn&&m>.8){ents.splice(ents.indexOf(e),1);continue}}
      continue}
    const dx=e.tx-e.px,dy=e.ty-e.py,dd=Math.hypot(dx,dy);if(dd>6){e.px=e.tx;e.py=e.ty}else if(dd>.01){const k=Math.min(1,dt*12);e.px+=dx*k;e.py+=dy*k;e.fd=[dx/dd,dy/dd];e.path=[{x:e.px|0,y:e.py|0}]}else e.path=[]}
  if(wasHost!==SYNC.host&&SYNC.host)for(const e of ents)if(e.pup&&e.zn&&!here.has(String(e.own))){e.pup=0;e.own=undefined}}
function syncIsHostId(id,peers){let best=null;const L=[[String(NET.id),{za:SYNC.age}]].concat(peers.map(([i,q])=>[String(i),q]));for(const[i,q]of L){const a=+q.za||0;if(!best||a>best[0]+.6||(Math.abs(a-best[0])<=.6&&i<best[1]))best=[a,i]}return best&&best[1]===String(id)}
// i nemici che ci sono quando si entra in una zona sono «della zona»
const _loadPost741=loadPost;loadPost=function(k){_loadPost741(k);SYNC.rk=typeof rmKey==='function'?rmKey():'';SYNC.age=0;SYNC.miss.clear();SYNC.last={};for(const e of ents)if(e.k==='en'&&!e.tr&&!e.owt&&!e.bt&&!e.asl&&!e.uqb)e.zn=1};
const _upd741=upd;upd=function(dt){_upd741(dt);try{syncTick(dt)}catch(e){console.error(e)}};
