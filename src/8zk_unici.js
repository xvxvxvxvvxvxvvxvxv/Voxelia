/* ================= 7.14: OGGETTI UNICI =================
   Ogni arma, elmo, corazza e scudo «unico» nasce da un seme: lo stesso seme dà sempre lo stesso oggetto, due semi diversi
   danno due oggetti diversi. Il seme decide tutto:
   - la forma (fra 15 armi, 6 elmi, 6 corazze e 5 scudi), la rarità e la qualità (dal 60 al 100%);
   - i poteri (da 1 a 3, presi fra 19: fuoco, gelo, fulmine, veleno, vampiro, spine, schivata, rigenerazione...) con la loro forza;
   - per i leggendari un potere firmato (Eco, Sete di sangue, Tempesta, Baluardo, Seconda pelle, Fenice) e un nome proprio;
   - il nome, una riga di storia e il numero di serie.
   Nell'oggetto si salvano solo il seme e pochi dati (uq.sd, uq.lv, uq.rm, uq.gv, uq.own): il resto viene ricalcolato a ogni
   caricamento e a ogni scambio (uqFix), così un oggetto non si può gonfiare a mano. In uq.own resta la provenienza: chi l'ha
   trovato e tutti quelli che l'hanno avuto per scambio.
   Gli unici nascono nel Mondo aperto (bottino, forziere, fabbro, ricompense dei contratti) ma funzionano ovunque, anche
   nella storia se arrivano con uno scambio. Nell'editor i poteri sono spenti. */
const UQ_GV=1;
// forme: [nome, genere (1 = femminile)]; i nomi contengono le parole che itype() riconosce, così l'icona è quella giusta
const UQB={w:[['Spada',1],['Ascia',1],['Martello',0],['Lancia',1],['Pugnale',0],['Stocco',0],['Bastone',0],['Falce',1],['Mazza',1],['Daga',1],['Alabarda',1],['Tridente',0],['Scettro',0],['Mannaia',1],['Clava',1]],
  h:[['Elmo',0],['Celata',1],['Cappuccio',0],['Corona',1],['Maschera',1],['Diadema',0]],
  c:[['Corazza',1],['Giaco',0],['Tunica',1],['Cotta di maglia',1],['Veste',1],['Usbergo',0]],
  s:[['Scudo',0],['Brocchiere',0],['Pavese',0],['Rotella',1],['Targa',1]]};
// poteri: s = dove possono comparire, lo/hi = forza (cresce con rarità e qualità), lv = la forza cresce anche col livello,
// a = aggettivo [maschile, femminile], e = complemento per il nome, d = descrizione
const UQA={
  fuoco:{s:'w',lo:12,hi:24,a:['Ardente','Ardente'],e:'delle Braci',i:'🔥',d:v=>`${v}% di incendiare il nemico (brucia per 3 s)`},
  gelo:{s:'w',lo:12,hi:24,a:['Gelido','Gelida'],e:'dell\'Inverno',i:'❄',d:v=>`${v}% di congelare il nemico (rallenta per 2 s)`},
  fulmine:{s:'w',lo:10,hi:20,a:['Folgorante','Folgorante'],e:'della Tempesta',i:'⚡',d:v=>`${v}% di far saltare un fulmine sul nemico più vicino`},
  veleno:{s:'w',lo:14,hi:28,a:['Velenoso','Velenosa'],e:'della Vipera',i:'☠',d:v=>`${v}% di avvelenare il nemico (5 s)`},
  vampiro:{s:'w',lo:3,hi:8,a:['Sanguinario','Sanguinaria'],e:'del Vampiro',i:'🩸',d:v=>`recuperi il ${v}% dei danni che fai`},
  feroce:{s:'w',lo:15,hi:40,a:['Feroce','Feroce'],e:'della Belva',i:'💥',d:v=>`i colpi critici fanno il ${v}% di danni in più`},
  precisa:{s:'w',lo:3,hi:8,a:['Preciso','Precisa'],e:'del Falco',i:'🎯',d:v=>`+${v}% probabilità di colpo critico`},
  caccia:{s:'w',lo:12,hi:30,a:['Implacabile','Implacabile'],e:'del Cacciatore',i:'🏹',d:v=>`+${v}% danni contro Campioni, bersagli dei contratti e boss`},
  rapida:{s:'w',lo:8,hi:20,a:['Rapido','Rapida'],e:'del Vento',i:'💨',d:v=>`attacchi il ${v}% più in fretta`},
  mietitura:{s:'w',lo:3,hi:7,lv:1,a:['Funesto','Funesta'],e:'del Mietitore',i:'🌾',d:v=>`ogni nemico vinto ti cura di ${v} PV`},
  saggia:{s:'whcs',lo:5,hi:12,a:['Saggio','Saggia'],e:'del Sapiente',i:'📖',d:v=>`+${v}% esperienza`},
  avida:{s:'whcs',lo:8,hi:20,a:['Dorato','Dorata'],e:'del Mercante',i:'💰',d:v=>`+${v}% oro dai nemici`},
  robusta:{s:'hcs',lo:5,hi:12,lv:1,a:['Robusto','Robusta'],e:'della Quercia',i:'❤',d:v=>`+${v} punti vita`},
  spine:{s:'hcs',lo:10,hi:26,a:['Spinoso','Spinosa'],e:'dei Rovi',i:'🌵',d:v=>`rimandi al nemico il ${v}% dei danni che subisci`},
  agile:{s:'hcs',lo:3,hi:7,a:['Leggero','Leggera'],e:'del Gatto',i:'🐈',d:v=>`${v}% di schivare un colpo`},
  rigen:{s:'hcs',lo:1,hi:3,lv:1,a:['Vivo','Viva'],e:'della Fonte',i:'🌿',d:v=>`recuperi ${v} PV ogni 5 secondi`},
  alchimia:{s:'hcs',lo:10,hi:28,a:['Alchemico','Alchemica'],e:'dell\'Alchimista',i:'🧪',d:v=>`le pozioni curano il ${v}% in più`},
  guardia:{s:'hcs',lo:3,hi:7,a:['Saldo','Salda'],e:'del Bastione',i:'🛡',d:v=>`subisci il ${v}% di danni in meno`},
  fortuna:{s:'hcs',lo:4,hi:10,a:['Fortunato','Fortunata'],e:'della Buona Stella',i:'🍀',d:v=>`+${v}% probabilità di bottino dai nemici`}};
// tetti: anche con tanti oggetti uguali addosso certi poteri non superano un limite
const UQCAP={agile:30,guardia:35,vampiro:15,precisa:40,rapida:45,fortuna:40,spine:60};
// i poteri firmati dei leggendari
const UQSG={
  eco:{s:'w',n:'Eco',d:'ogni 5 colpi un\'onda d\'urto colpisce tutti i nemici vicini (60% dell\'attacco)'},
  sete:{s:'w',n:'Sete di sangue',d:'ogni nemico vinto ti restituisce l\'8% della vita'},
  tempesta:{s:'w',n:'Tempesta',d:'i colpi critici scatenano fulmini su due nemici vicini'},
  baluardo:{s:'hcs',n:'Baluardo',d:'una volta ogni 90 s un colpo mortale ti lascia a 1 PV, e per 2 s non ti tocca niente'},
  pelle:{s:'hcs',n:'Seconda pelle',d:'ogni 10 s il primo colpo che ricevi non ti fa niente'},
  fenice:{s:'hcs',n:'Fenice',d:'sotto il 30% della vita ti curi di un quarto (una volta ogni 60 s)'}};
const UQMAT=[['Runico','Runica'],['Cinereo','Cinerea'],['Antico','Antica'],['Spettrale','Spettrale'],['Lunare','Lunare'],['Stellato','Stellata'],['Crepuscolare','Crepuscolare'],['Brunito','Brunita'],['Istoriato','Istoriata'],['Ramato','Ramata'],['Abissale','Abissale'],['Solenne','Solenne']];
const UQP1=['Vel','Mor','Ast','Kael','Ith','Sar','Or','Lum','Drav','Nyx','Thal','Er','Zan','Cor','Vey','Aur','Gal','Sil'],UQP2=['a','e','i','o','ae','ia','u',''],UQP3=['ris','dan','thil','gor','wyn','mir','vane','nar','kesh','lith','dor','rax','mund','sel'];
const UQL1=[['nelle fucine dei Picchi Gelidi'],['da un fabbro senza nome del Porto'],['nelle sale del Collegio Arcano'],['sotto le dune di Khem'],['tra le rovine di Aldoria Vecchia'],['nella bottega di un mastro della Gilda'],['in una caverna di cristallo'],['sul fondo dell\'Abisso Sommerso'],['in un villaggio che oggi non esiste più'],['nella Fucina Infernale']];
const UQL2=['prima che la Corona andasse in pezzi','in una notte di luna nera','durante il lungo assedio di Aldoria','quando il Re Aldric era ancora un ragazzo','nell\'anno della grande siccità','il giorno in cui cadde Malakar','in un inverno che non finiva mai'];
const UQL3=['Sul manico qualcuno ha inciso un nome, poi l\'ha raschiato via.','Si racconta che non abbia mai mancato un colpo.','Odora ancora di fumo e di pioggia.','Chi lo porta sogna mari che non ha mai visto.','Pesa meno di quanto sembri, e più di quanto dovrebbe.','Due mercanti si sono rovinati per averlo.','Di notte manda un riflesso che non viene da nessuna luce.','Ha cambiato padrone sette volte, e nessuno è morto di vecchiaia.','Il fabbro che l\'ha fatto non ne ha mai fatto un altro.','Un cantastorie del Porto giura di averlo visto in sogno.'];
const UQRP=[.5,.32,.14,.04];   // probabilità di partenza delle quattro rarità
const uqSeed=()=>(uid()+uid()).replace(/[^a-z0-9]/g,'').slice(0,14).padEnd(8,'0');
// lo stato degli effetti: ricalcolato solo quando cambia l'equipaggiamento
let UQK='',UQST={};
const uqOn=()=>!!(P&&started&&MODE!=='ed');

/* ---- il generatore ---- */
function uqBuild(o){const s=o.s,lv=clamp(o.lv|0,1,99),rm=clamp(o.rm|0,0,3),rn=sd(hs('uq|'+o.sd+'|'+s+'|'+lv)),r2=(a,b)=>a+Math.floor(rn()*(b-a+1)),p2=a=>a[Math.floor(rn()*a.length)];
  let r=0;{const x=rn();r=x<UQRP[3]?3:x<UQRP[3]+UQRP[2]?2:x<UQRP[3]+UQRP[2]+UQRP[1]?1:0}r=Math.max(r,rm);
  const q=Math.round(60+40*Math.pow(rn(),.8)),bs=p2(UQB[s]),f=bs[1],base=bs[0];
  const pool=Object.keys(UQA).filter(k=>UQA[k].s.includes(s)),na=r===0?1:r===1?2:3,a=[],rk=[1,1.25,1.55,1.9][r];
  for(let i=0;i<na&&pool.length;i++){const k=pool.splice(Math.floor(rn()*pool.length),1)[0],A=UQA[k];let v=(A.lo+(A.hi-A.lo)*(.35*rn()+.65*q/100))*rk;if(A.lv)v*=1+lv*.18;a.push([k,Math.max(1,Math.round(v))])}
  let sg=null;if(r===3){const L=Object.keys(UQSG).filter(k=>UQSG[k].s.includes(s));sg=p2(L)}
  const v=Math.max(1,Math.round(ibase(s,lv)*RM[r]*(.82+.3*q/100)*1.06));
  const A0=UQA[a[0][0]],A1=a[1]?UQA[a[1][0]]:null;let n;
  if(r===3){const pr=p2(UQP1)+p2(UQP2)+p2(UQP3);n='«'+pr[0].toUpperCase()+pr.slice(1)+'», '+base+' '+(A1||A0).e}
  else if(r===2)n=base+' '+p2(UQMAT)[f]+' '+(A1||A0).e;
  else if(r===1)n=base+' '+A0.a[f]+' '+A1.e;
  else n=base+' '+A0.a[f];
  const lore=(f?'Forgiata ':'Forgiato ')+p2(UQL1)[0]+' '+p2(UQL2)+'. '+p2(UQL3);
  const h=hs(o.sd+'#'+s),ser=(h%46656).toString(36).toUpperCase().padStart(3,'0')+'-'+((h>>>16)%46656).toString(36).toUpperCase().padStart(3,'0');
  const it={s,r,v,n,p:Math.round(v*(6+a.length*2+(sg?6:0))),uq:{sd:o.sd,lv,rm,gv:UQ_GV,own:(o.own||[]).slice(-6),q,a,sg,lore,ser}};
  for(const[k,x]of a){if(k==='precisa')it.cr=(it.cr||0)+x;if(k==='robusta')it.hp=(it.hp||0)+x}
  if(r===3&&s==='w')it.cr=(it.cr||0)+6;if(r===3&&s!=='w')it.hp=(it.hp||0)+Math.round(20+lv*3);
  return it}
// un unico nuovo: lv = livello, s = posto (se manca, a caso), rm = rarità minima
function uqNew(lv,s,rm,own){s=s||'whcs'[Math.floor(Math.random()*4)];const b=uqBuild({sd:uqSeed(),s,lv:Math.max(1,lv|0),rm:rm|0,own:own?[own]:[]});b.u=uid();return b}
// ricalcola tutto dal seme (all'avvio, dopo uno scambio): tiene solo u, up, ml, wx e la provenienza
function uqFix(it){if(!it||!it.uq||typeof it.uq!=='object')return it;const o=it.uq;if(!/^[a-z0-9]{6,16}$/.test(String(o.sd||''))||!'whcs'.includes(it.s)){delete it.uq;return it}
  const b=uqBuild({sd:o.sd,s:it.s,lv:o.lv,rm:o.rm,own:Array.isArray(o.own)?o.own.map(x=>String(x).slice(0,14)):[]});
  for(const k of['r','v','n','p','cr','hp'])delete it[k];Object.assign(it,{r:b.r,v:b.v,n:b.n,p:b.p,uq:b.uq});if(b.cr)it.cr=b.cr;if(b.hp)it.hp=b.hp;return it}
// un unico arrivato da un plugin (mercatino, case) porta solo il seme: lo completiamo la prima volta che serve
const uqEns=it=>{if(it&&it.uq&&!it.uq.a)uqFix(it);return it};
function uqFixAll(){if(!P)return;for(const it of(P.inv||[]).concat(Object.values(P.eq||{}),P.stash||[]))if(it&&it.uq)uqFix(it);UQK=''}

/* ---- gli effetti addosso ---- */
function uqS(){if(!P)return{};const L=Object.values(P.eq).filter(i=>i&&i.uq).map(uqEns),k=L.map(i=>i.u+(i.uq.sg||'')).join(',');if(k===UQK)return UQST;UQK=k;const S={};
  for(const it of L){for(const[a,v]of it.uq.a||[])S[a]=(S[a]||0)+v;if(it.uq.sg)S['sg_'+it.uq.sg]=1}
  for(const a in UQCAP)if(S[a])S[a]=Math.min(S[a],UQCAP[a]);UQST=S;return S}
const uqNear=(x,y,r,not)=>{let b=null,bd=r;for(const o of ents)if(o.k==='en'&&o!==not&&o.hp>0&&!(o.b&&o.b.np)){const d=Math.hypot(o.px-x,o.py-y);if(d<bd){bd=d;b=o}}return b};
const uqNearN=(x,y,r,n,not)=>ents.filter(o=>o.k==='en'&&o!==not&&o.hp>0&&!(o.b&&o.b.np)&&Math.hypot(o.px-x,o.py-y)<r).sort((a,b)=>Math.hypot(a.px-x,a.py-y)-Math.hypot(b.px-x,b.py-y)).slice(0,n);
function uqZap(a,b){if(!cineOK())return;sfx({k:'ring',x:b.px,y:b.py,c:'150,200,255',d:.35,r:.9});sparks(b.px,b.py,8,['#bfe0ff','#ffffff'],70)}
// un colpo «di contorno» (fuoco, veleno, fulmine, onda): niente parata, niente maestria, ma passa al server come gli altri
function uqHit(e,d,c){if(!e||!ents.includes(e)||e.hp<=0)return;d=Math.max(1,Math.round(d));if(NET.code){NET.hits.push([e.id,+(d/e.mx).toFixed(4),++NET.seq]);if(NET.hits.length>14)NET.hits.shift()}_hurtE714(e,d,1,false);if(c&&ents.includes(e))e.fl=.12}
const _hurtE714=hurtE;hurtE=function(e,d,rem,cr){if(rem||!uqOn()||!e||e.k!=='en'||!P.eq){_hurtE714(e,d,rem,cr);return}const S=uqS();
  if(S.caccia&&(e.elite||e.boss||e.owt))d*=1+S.caccia/100;if(cr&&S.feroce)d*=1+S.feroce/100;d=Math.max(1,Math.round(d));
  const hp0=e.hp;_hurtE714(e,d,rem,cr);const done=Math.max(0,Math.min(hp0,hp0-Math.max(0,e.hp)));
  if(S.vampiro&&done>0){P.uqvb=(P.uqvb||0)+done*S.vampiro/100;if(P.uqvb>=1){const h=Math.floor(P.uqvb);P.uqvb-=h;if(P.hp<P.mx){P.hp=Math.min(P.mx,P.hp+h);flt(P,'+'+h,'#ff7aa0')}}}
  const live=ents.includes(e)&&e.hp>0,R=Math.random;
  if(live){if(S.fuoco&&R()*100<S.fuoco){e.uqb=t+3;flt(e,'🔥','#ff9a3a');if(cineOK())sparks(e.px,e.py,6,['#ff9a3a','#ffd84a'],60)}
    if(S.veleno&&R()*100<S.veleno){e.uqv=t+5;flt(e,'☠','#8aff6a')}
    if(S.gelo&&R()*100<S.gelo){if(e.uqsp==null)e.uqsp=e.sp;e.sp=e.uqsp*.5;e.uqf=t+2;flt(e,'❄','#9adcff')}}
  if(S.fulmine&&R()*100<S.fulmine){const o=uqNear(e.px,e.py,3.2,e);if(o){uqZap(e,o);uqHit(o,d*.5,1);flt(o,'⚡','#bfe0ff')}}
  if(S.sg_tempesta&&cr){for(const o of uqNearN(e.px,e.py,3.5,2,e)){uqZap(e,o);uqHit(o,d*.4,1)}}
  if(S.sg_eco){P.uqhc=(P.uqhc||0)+1;if(P.uqhc>=5){P.uqhc=0;if(cineOK())sfx({k:'ring',x:P.px,y:P.py,c:'255,220,120',d:.5,r:2.4});tone(180,.12,'sine',.06);for(const o of uqNearN(P.px,P.py,2.4,8))uqHit(o,atk()*.6,1)}}};
const _hurtP714=hurtP;hurtP=function(at){if(!uqOn()){_hurtP714(at);return}const S=uqS();
  if(P.uqiv>t){flt(P,'Protetto','#ffd84a');return}
  if(S.agile&&Math.random()*100<S.agile){flt(P,'Schivata!','#8ce7ff');tone(900,.05,'triangle');return}
  if(S.sg_pelle&&!(P.uqpl>t)){P.uqpl=t+10;flt(P,'Seconda pelle','#ffd84a');tone(700,.08,'triangle');return}
  if(S.guardia)at*=1-S.guardia/100;const h0=P.hp;_hurtP714(at);const took=h0-P.hp;
  if(S.spine&&took>0&&started){const o=uqNear(P.px,P.py,2.6);if(o){uqHit(o,took*S.spine/100,1);flt(o,'🌵','#c8ff8a')}}};
const _die714=die;die=function(){if(uqOn()&&P.hp<=0&&uqS().sg_baluardo&&!(P.uqbl>t)){P.uqbl=t+90;P.hp=1;P.uqiv=t+2;flt(P,'Baluardo!','#ffd84a');banner('Baluardo','Il colpo mortale si è infranto sulla tua armatura','scudo');jingle([60,67,72],.08,'triangle');hud();return}_die714()};
const _gainXP714=gainXP;gainXP=function(x){const S=uqOn()?uqS():{};_gainXP714(S.saggia?Math.round(x*(1+S.saggia/100)):x)};
const _pot714=pot;pot=function(){if(typeof owNoPot==='function'&&owNoPot()){flt(P,'Niente pozioni: patto del contratto','#ff9a9a');tone(150,.1);return}
  const n0=P?P.pot:0,h0=P?P.hp:0;_pot714();if(!uqOn()||P.pot>=n0)return;const S=uqS();if(S.alchimia){const x=Math.round((P.hp-h0)*S.alchimia/100);if(x>0){P.hp=Math.min(P.mx,P.hp+x);flt(P,'+'+x+' 🧪','#9aff9a')}}};
const _kill714=kill;kill=function(e){const on=uqOn()&&e&&e.k==='en'&&ents.includes(e),g0=P?P.g:0,S=on?uqS():{};
  const ow=on&&typeof OW!=='undefined'&&OW.on;if(ow)UQF++;try{_kill714(e)}finally{if(ow)UQF--}if(!on)return;
  if(S.avida){const x=Math.round(Math.max(0,P.g-g0)*S.avida/100);if(x>0){P.g+=x;flt(P,'+'+x+' 💰','#ffd84a')}}
  if(S.fortuna&&Math.random()*100<S.fortuna*DF.lt*.4&&!e.boss)ents.push(dropOk({k:'dr',px:e.px+.3,py:e.py+.2,it:item((ZZ&&ZZ.lv||P.lv)+1)}));
  let h=0;if(S.mietitura)h+=S.mietitura;if(S.sg_sete)h+=Math.round(P.mx*.08);if(h&&P.hp>0&&P.hp<P.mx){P.hp=Math.min(P.mx,P.hp+h);flt(P,'+'+h,'#ff7aa0')}};
// nel Mondo aperto il bottino dei nemici, i forzieri, il fabbro e la bottega danno oggetti unici
let UQF=0;
const _item714=item;item=function(lv,minR=0,slot){if(UQF>0&&typeof OW!=='undefined'&&OW.on&&MODE==='story')return uqNew(lv,slot,minR,NET.name);return _item714(lv,minR,slot)};
const _act714=act;act=function(e){const ow=typeof OW!=='undefined'&&OW.on&&MODE==='story'&&e&&e.k==='ch';if(ow)UQF++;try{_act714(e)}finally{if(ow)UQF--}};
const _forge714=forge;forge=function(s,r){const ow=typeof OW!=='undefined'&&OW.on&&MODE==='story';if(ow)UQF++;try{_forge714(s,r)}finally{if(ow)UQF--}};
const _buy714=buy;buy=function(k){const ow=typeof OW!=='undefined'&&OW.on&&MODE==='story'&&k==='rnd';if(ow)UQF++;try{_buy714(k)}finally{if(ow)UQF--}};
// fuoco, veleno, gelo, rigenerazione, fenice, attacco rapido
let UQT=0;
const _upd714=upd;upd=function(dt){_upd714(dt);if(!uqOn())return;const S=uqS();UQT+=dt;
  if(S.rapida&&P.at>0)P.at=Math.max(0,P.at-dt*S.rapida/100);
  if(UQT>=.5){UQT=0;const k=Math.max(1,atk());
    for(const e of ents.slice()){if(e.k!=='en'||e.hp<=0)continue;
      if(e.uqb>t){uqHit(e,k*.12,0);if(cineOK()&&Math.random()<.5)sparks(e.px,e.py,3,['#ff9a3a','#ffd84a'],40)}
      if(e.uqv>t&&ents.includes(e))uqHit(e,k*.07,0);
      if(e.uqf&&e.uqf<=t&&e.uqsp!=null){e.sp=e.uqsp;e.uqsp=null;e.uqf=0}}}
  if(S.rigen&&P.hp>0&&P.hp<P.mx){P.uqrg=(P.uqrg||0)+dt;if(P.uqrg>=5){P.uqrg=0;P.hp=Math.min(P.mx,P.hp+S.rigen);flt(P,'+'+S.rigen,'#8aff8a')}}
  if(S.sg_fenice&&P.hp>0&&P.hp<P.mx*.3&&!(P.uqfx>t)){P.uqfx=t+60;const h=Math.round(P.mx*.25);P.hp=Math.min(P.mx,P.hp+h);flt(P,'Fenice +'+h,'#ffb84a');if(cineOK())sparks(P.px,P.py,24,['#ff9a3a','#ffd84a','#fff2a0'],110);jingle([67,72,79],.07,'triangle')}};

/* ---- come si vede ---- */
const RNU=['Unico comune','Unico raro','Unico epico','Unico leggendario'];
function uqLines(it,short){uqEns(it);const o=it&&it.uq;if(!o||!o.a)return'';const L=o.a.map(([k,v])=>`${UQA[k].i} ${UQA[k].d(v)}`);if(o.sg)L.push(`<b style="color:#ffae2b">✦ ${UQSG[o.sg].n}:</b> ${UQSG[o.sg].d}`);
  if(short)return`<small class="uql">${L.join(' · ')}</small>`;return L.join('<br>')}
function uqCard(it){const o=it.uq;if(!o||!o.a)return'';
  return`<div class="uqc"><div class="uqh"><b style="color:${RC[it.r]}">✦ ${RNU[it.r]}</b><span>№ ${esc(o.ser)} · qualità ${o.q}%</span></div><div class="uqp">${uqLines(it)}</div><p class="uqlore">«${esc(o.lore)}»</p>${o.own&&o.own.length?`<p class="mu">Provenienza: ${o.own.map(esc).join(' → ')}</p>`:''}</div>`}
const _ivDetail714=ivDetail;ivDetail=function(){let h=_ivDetail714();const f=IVSEL&&ivFind(IVSEL);if(f&&f.it&&f.it.uq&&uqEns(f.it).uq.a){const c=uqCard(f.it);h=h.includes('<div class="ivl">')?h.replace('<div class="ivl">',c+'<div class="ivl">'):h+c}return h};
document.head.insertAdjacentHTML('beforeend',`<style>
.uqc{border:1px solid #ffae2b55;background:linear-gradient(160deg,rgba(60,40,10,.35),rgba(30,20,50,.35));border-radius:9px;padding:8px 10px;margin:6px 0}
.uqh{display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;font-size:13px}.uqh span{opacity:.75;font-size:12px}
.uqp{margin:6px 0;line-height:1.5;font-size:13px}.uqlore{font-style:italic;opacity:.8;font-size:12px;margin:4px 0}
small.uql{display:block;opacity:.85;font-size:11px;line-height:1.35;margin:1px 0 3px 26px;color:#ffe6b0}
</style>`);

/* ---- scambi: unici, reperti e pozioni ---- */
// i reperti (trofei dei contratti, curiosità) non si indossano: stanno in un sacco a parte, P.rep, e si scambiano come gli oggetti
const repFmt=x=>`<b style="color:${RC[x.r|0]}">🏺 ${esc(x.n)}</b> <span class="mu">reperto · ${x.p|0} oro</span>`;
const repLine=x=>x.d?`<small class="uql">${esc(x.d)}</small>`:'';
tradeHTML=function(){const T=NET.tr;if(!T)return'';const you=T.you||{it:[],g:0},th=T.them||{it:[],g:0},off=new Set(T.mine.it);T.mine.pt=T.mine.pt|0;
  const row=(it,btn)=>`<div class="it"><span>${it.s==='x'?repFmt(it)+repLine(it):fmt(it)+uqLines(it,1)}</span>${btn?`<span>${btn}</span>`:''}</div>`;
  let h=`<h3>🤝 Scambio con ${esc(T.n)}</h3><div class="cols"><div><h4>La tua offerta ${you.ok?'<span class="up">✔ confermata</span>':''}</h4>`;
  h+=you.it.length?you.it.map(it=>row(it,`<button onclick="trRem('${esc(it.u)}')">−</button>`)).join(''):'<p class="mu">Nessun oggetto</p>';
  h+=`<div class="row"><label for="trg">💰 Oro</label><input type="number" id="trg" min="0" max="${P.g}" value="${T.mine.g}" onchange="trGold(this.value)"></div>`;
  h+=`<div class="row"><label for="trp">🧪 Pozioni</label><input type="number" id="trp" min="0" max="${P.pot}" value="${T.mine.pt}" onchange="trPot(this.value)"></div></div>`;
  h+=`<div><h4>Offerta di ${esc(T.n)} ${th.ok?'<span class="up">✔ confermata</span>':''}</h4>`+(th.it.length?th.it.map(it=>row(it)).join(''):'<p class="mu">Nessun oggetto</p>')+`<p>💰 ${th.g|0}${th.pt?' · 🧪 '+(th.pt|0)+' pozioni':''}</p></div></div>`;
  h+=`<h4>Il tuo zaino</h4>`;const av=P.inv.filter(it=>!off.has(it.u));h+=av.length?av.map(it=>row(it,it.ar?'<span class="mu">vincolato</span>':`<button onclick="trAdd('${esc(it.u)}')">+ Offri</button>`)).join(''):'<p class="mu">Niente da offrire.</p>';
  const rp=(P.rep||[]).filter(x=>!off.has(x.u));if(rp.length)h+=`<h4>I tuoi reperti</h4>`+rp.map(x=>row(x,`<button onclick="trAdd('${esc(x.u)}')">+ Offri</button>`)).join('');
  h+=`<p class="mu">Gli oggetti unici portano con sé seme, poteri e provenienza: chi li riceve li ritrova identici. Se una delle due offerte cambia, le conferme si azzerano. Lo scambio avviene solo quando confermate entrambi.</p><button onclick="trOk()" ${you.ok?'disabled':''}>✔ Conferma scambio</button><button onclick="trCancel()">Annulla</button>`;return h};
const trFind=u=>P.inv.find(i=>i.u===u)||(P.rep||[]).find(i=>i.u===u);
trSend=function(){const T=NET.tr;if(!T)return;NET.send({t:'tr',a:'off',it:T.mine.it.map(trFind).filter(Boolean),g:T.mine.g,pt:Math.min(T.mine.pt|0,P.pot)})};
trAdd=function(u){const T=NET.tr;if(!T||T.mine.it.length>=12||T.mine.it.includes(u))return;const it=trFind(u);if(!it||it.ar)return;T.mine.it.push(u);trSend()};
function trPot(v){const T=NET.tr;if(!T)return;T.mine.pt=clamp(Math.floor(+v||0),0,P.pot);trSend()}
trOk=function(){const T=NET.tr;if(!T)return;if(T.mine.g>P.g||(T.mine.pt|0)>P.pot||T.mine.it.some(u=>!trFind(u))){msg('La tua offerta non è più valida');return}NET.send({t:'tr',a:'ok'})};
const _trDone714=trDone;trDone=function(m){const give=m.give||{it:[],g:0},get=m.get||{it:[],g:0};P.rep=P.rep||[];
  // i reperti non passano dallo zaino: li togliamo e li aggiungiamo qui, poi il resto lo fa lo scambio normale
  const gx=(give.it||[]).filter(i=>i&&i.s==='x'),rx=(get.it||[]).filter(i=>i&&i.s==='x');
  for(const it of gx){const i=P.rep.findIndex(x=>x.u===it.u);if(i>=0)P.rep.splice(i,1)}
  for(const it of rx)P.rep.push(repFix(Object.assign({},it,{u:uid()})));
  P.pot=Math.max(0,P.pot-(give.pt|0))+(get.pt|0);
  const old=new Set(P.inv.map(i=>i.u));
  _trDone714(Object.assign({},m,{give:Object.assign({},give,{it:(give.it||[]).filter(i=>i&&i.s!=='x')}),get:Object.assign({},get,{it:(get.it||[]).filter(i=>i&&i.s!=='x')})}));
  for(const it of P.inv)if(!old.has(it.u)&&it.uq){if(!Array.isArray(it.uq.own))it.uq.own=[];if(it.uq.own[it.uq.own.length-1]!==NET.name)it.uq.own.push(NET.name);uqFix(it)}
  if(get.pt|0)msg('Ricevute anche '+(get.pt|0)+' pozioni');save();hud()};
// un reperto valido: nome, descrizione, rarità, valore; niente altro
function repFix(x){return{u:x.u||uid(),s:'x',n:String(x.n||'Reperto').slice(0,40),d:String(x.d||'').slice(0,140),r:clamp(x.r|0,0,3),p:clamp(x.p|0,0,99999),k:String(x.k||'').slice(0,12)}}
