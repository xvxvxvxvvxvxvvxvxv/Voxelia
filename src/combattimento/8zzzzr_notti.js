/* ================= 8.6: LE NOTTI PERICOLOSE E LE INVASIONI =================
   Due cose nuove legate alla Minaccia del Regno (vedi 8zzzzq_minaccia.js), solo nella Modalità Storia:
   - LE NOTTI: dal livello 2, di notte nelle zone aperte (foresta, deserto, picchi, giungla, valle) dal buio arrivano
     altre creature, una alla volta, più spesso e più numerose quando la Minaccia sale. Vengono a cercarti.
   - LE INVASIONI: dal livello 3, ogni due giorni di gioco i predoni attaccano un quartiere di Aldoria (il Porto, i Campi
     dell'Est o il Quartiere Nobile). Sotto l'orologio si vede dove e quanto tempo resta (6 ore di gioco, 6 minuti veri).
     Nel quartiere arrivano tre ondate, l'ultima con il loro Capitano (un Campione). Se le respingi il quartiere ti
     ricompensa (oro, esperienza e un oggetto raro); se il tempo finisce, i predoni saccheggiano e per un giorno i
     prezzi dei negozi salgono del 10%. */
XSV.add('nt86');XSV.add('iv86');
const NT86={next:0,said:0};
const NTZ86=['forest','desert','peaks','giungla48','valle86'];
function nt86Tick(dt){if(!P||!started||P.hp<=0||!ZZ||ZZ.dg||!NTZ86.includes(Zk)||!isNight())return;const L=th86();if(L<2)return;
  if(!NT86.said&&!P.nt86){NT86.said=1;P.nt86=1;banner('🌙 Una notte pericolosa','Con la Minaccia del Regno, di notte dal buio arrivano altre creature. Stai vicino alla luce, o torna di giorno.','luna')}
  if(t<NT86.next)return;NT86.next=t+Math.max(16,40-L*2.4)+Math.random()*8;
  const pool=((ZZ&&ZZ.en)||[]).filter(k=>E[k]&&!E[k].boss);if(!pool.length)return;
  const mine=ents.filter(e=>e.k==='en'&&e.nt86).length,cap=2+Math.floor(L/3);if(mine>=cap||ents.filter(e=>e.k==='en').length>70)return;
  const d=bfs(P.px|0,P.py|0),C=[];for(let y=1;y<N-1;y++)for(let x=1;x<N-1;x++){const v=d[y*N+x];if(v<0||!WK(M[y][x])||M[y][x]!==0)continue;const q=Math.hypot(x-P.px,y-P.py);if(q>=8&&q<=13&&v<22)C.push([x,y])}
  if(!C.length)return;const n=L>=6?2:1;for(let i=0;i<n&&C.length;i++){const[x,y]=C.splice(Math.floor(Math.random()*C.length),1)[0];const e=mk(pool[Math.floor(Math.random()*pool.length)],x,y);
    e.nt86=1;e.al=1;e.ag=(e.ag||6)*1.6;e.at*=1.1;e.n=e.n+' della notte';ents.push(e);if(cineOK())sparks(e.px,e.py,10,['#3a2a6a','#9a8aff'],40)}}
/* ---- le invasioni ---- */
const IVZ86=['porto','campi','nord'];
const IVP86=[[3,['bandito','teppista','goblin','lupo']],[5,['bandito','cavaliere','ghoul','pirata']],[7,['cavaliere_vuoto','ombra','cavaliere','demone']]];
function iv86Fix(){P.iv86=P.iv86||{n:0,won:0,lost:0,a:null,pen:0};return P.iv86}
const iv86Act=()=>{if(!th86Mode())return null;const o=iv86Fix();return o.a&&!o.a.done?o.a:null};
function iv86Left(a){return Math.max(0,(a.end-th86Fix().d)*DAYM)}   // minuti di gioco che restano
function iv86Start(zk){const o=iv86Fix(),d=th86Fix().d;o.n++;const z=Z[zk];o.a={z:zk,st:d,end:d+.25,w:0,sp:0,done:0,id:o.n};
  banner('⚔ Invasione! '+(z?z.n:zk),'I predoni attaccano il quartiere: hai 6 ore di gioco per difenderlo. Lo vedi sotto l\'orologio.','spade');jingle([55,58,62,55],.16,'sawtooth');save();if(Zk===zk)iv86Wave()}
function iv86Sched(){if(!th86Mode()||(P.st|0)<1||(DEV&&DEV.sess))return;const o=iv86Fix(),d=th86Fix().d;if(th86L()<3)return;
  const a=o.a;if(a&&!a.done){if(d>=a.end)iv86Lose();return}
  // una ogni due giorni di gioco, un po' dopo l'inizio del giorno
  const slot=Math.floor((d-.35)/2);if(slot<1||slot<=(o.ls|0))return;o.ls=slot;const r=sd(hs('iv86|'+(P.nm||'')+'|'+slot));iv86Start(IVZ86[Math.floor(r()*IVZ86.length)])}
function iv86Pool(){const L=th86L();let p=IVP86[0][1];for(const[l,q]of IVP86)if(L>=l)p=q;return p.filter(k=>E[k])}
function iv86Wave(){const a=iv86Act();if(!a||Zk!==a.z)return;a.w++;const L=th86L(),n=Math.min(9,3+a.w+Math.floor(L/3)),pool=iv86Pool();if(!pool.length)return;
  const d=bfs(P.px|0,P.py|0),C=[];for(let y=1;y<N-1;y++)for(let x=1;x<N-1;x++){const v=d[y*N+x];if(v<0||!WK(M[y][x]))continue;const q=Math.hypot(x-P.px,y-P.py);if(q>=7&&q<=15)C.push([x,y,v])}
  if(!C.length)return;// arrivano tutti da una parte: il punto più lontano, e intorno
  C.sort((p,q)=>q[2]-p[2]);const c0=C[Math.floor(Math.random()*Math.min(30,C.length))],near=C.filter(c=>Math.hypot(c[0]-c0[0],c[1]-c0[1])<4);const S=near.length>=n?near:C;
  for(let i=0;i<n&&S.length;i++){const[x,y]=S.splice(Math.floor(Math.random()*S.length),1)[0];const e=mk(pool[i%pool.length],x,y,40000+a.id*100+a.w*10+i);e.iv86=a.id;e.al=1;e.ag=30;
    if(a.w===3&&i===0&&typeof eliteMk==='function'){eliteMk(e);e.n='Capitano dei predoni';af86Give(e,Math.max(4,L));e.n='Capitano dei predoni · '+e.af86.map(k=>AF86[k].n).join(', ')}ents.push(e)}
  a.sp=1;msg(a.w<3?'Arrivano i predoni: ondata '+a.w+' di 3!':'L\'ultima ondata: c\'è il loro Capitano!');tone(110,.4,'sawtooth',.06);shake(.4)}
function iv86Tick(dt){const a=iv86Act();if(!a)return;if(Zk!==a.z||!started)return;if(!a.sp){iv86Wave();return}
  if(ents.some(e=>e.k==='en'&&e.iv86===a.id)){a.wt=0;return}
  // un'ondata respinta: due secondi e mezzo di respiro, poi la prossima
  if(a.w<3){a.wt=(a.wt||0)+dt;if(a.wt>2.5){a.wt=0;iv86Wave()}return}iv86Win()}
function iv86Win(){const o=iv86Fix(),a=o.a;if(!a)return;a.done=1;o.won++;const lv=Math.max(1,P.lv|0),gd=Math.round((150+lv*25)*(NET.cfg.gm||1)),xp=100+lv*30;P.g+=gd;goldFly(gd);gainXP(xp);
  const it=item(Math.max(lv,(ZZ&&ZZ.lv)||1),2);ents.push(dropOk({k:'dr',px:P.px+.6,py:P.py+.3,it}));const z=Z[a.z];
  banner('🛡 '+(z?z.n:'Il quartiere')+' è salvo!','Hai respinto l\'invasione: +'+gd+' oro, +'+xp+' esperienza e un oggetto raro. Invasioni respinte: '+o.won,'scudo');jingle([60,64,67,72,76],.12,'triangle');save();hud()}
function iv86Lose(){const o=iv86Fix(),a=o.a;if(!a)return;a.done=1;o.lost++;o.pen=th86Fix().d+1;const z=Z[a.z];ents=ents.filter(e=>!(e.k==='en'&&e.iv86===a.id));
  banner('🔥 '+(z?z.n:'Il quartiere')+' saccheggiato','Nessuno ha fermato i predoni: per un giorno i prezzi dei negozi sono più alti del 10%.','teschio');save()}
{const p0=priceMul;priceMul=function(){const m=p0();try{if(th86Mode()&&P.iv86&&P.iv86.pen>th86Fix().d)return m*1.1}catch(_){}return m}}
// entrando nel quartiere attaccato arriva la prima ondata; uscendo, chi resta di quell'ondata aspetta il tuo ritorno
{const l0=loadPost;loadPost=function(k){l0(k);try{const a=iv86Act();if(a&&k===a.z){a.sp=0;a.wt=0;a.w=Math.max(0,a.w-1)}}catch(e){console.warn('invasioni',e)}}}
{const u0=upd;upd=function(dt){u0(dt);try{if(started&&th86Mode()){nt86Tick(dt);iv86Tick(dt);if((NT86.sc=(NT86.sc||0)+dt)>1){NT86.sc=0;iv86Sched()}}}catch(e){console.warn('notti',e)}}}
// sotto l'orologio, dove c'è l'invasione e quanto tempo resta
{const c0=clockUI;clockUI=function(){c0();try{const el=$('clkt');if(!el)return;let sp=el.querySelector('.iv86');const a=iv86Act();if(!a){if(sp){sp.remove();qt86Fit()}return}
  const m=Math.ceil(iv86Left(a)),z=Z[a.z],h=`⚔ Invasione: ${esc(z?z.n.split('·')[0].trim():a.z)} · ${Math.floor(m/60)}:${String(m%60).padStart(2,'0')}`+(Zk===a.z&&a.w?` · ondata ${a.w}/3`:'');
  if(!sp){sp=document.createElement('div');sp.className='iv86';el.appendChild(sp)}if(sp.textContent!==h)sp.textContent=h;qt86Fit()}catch(_){}}}
(function(){const st=document.createElement('style');st.textContent=`.iv86{margin-top:2px;font-size:11px;color:#ff9a6a;text-shadow:0 1px 2px #000;font-weight:bold}`;document.head.appendChild(st)})();
