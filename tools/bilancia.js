#!/usr/bin/env node
/* Bilanciamento di Voxelia (8.1). Un robot gioca da solo il primo piano di ogni dungeon della Storia, i dungeon di
   Tomorrow, una sparatoria di Aldoria 3026 e il Cuore della Corona, e dice per ognuno quanta vita perde, quanti nemici
   abbatte e quanto ci mette. Il robot combatte come un giocatore prudente: attacca il nemico più vicino e beve una
   pozione sotto un terzo della vita, ma non schiva e non usa abilità. Per questo i numeri sono un po' peggio di quelli
   di chi gioca davvero: servono a vedere i posti fuori scala rispetto agli altri.
   Il livello dell'eroe è quello del dungeon più 2, con un equipaggiamento raro del suo livello.
   Serve Playwright con Chromium (vedi tools/prova.js).  Uso:  node tools/bilancia.js */
const path=require('path');let chromium;try{({chromium}=require('playwright'))}catch(e){console.error('✗ manca Playwright: npm i -D playwright && npx playwright install chromium');process.exit(2)}
const HERO=+(process.env.HERO||3);
const FILE='file://'+path.resolve(__dirname,'..','voxelia.html');
// gira dentro la pagina: prepara l'eroe e combatte per al massimo `sec` secondi di gioco
const SIM=`window.__seme=function(n){let a=n>>>0||1;const f=()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};Math.random=f;R=f};
window.__eroe=function(lv){P.lv=lv;for(const s of 'whcs'){const it=item(lv,1,s);it.r=1;it.v=Math.round(ibase(s,lv)*RM[1]);P.eq[s]=it}P.pot=4;recalc();P.hp=P.mx};
if(!window.__dieH){window.__dieH=1;const p0=pot;pot=function(){const n=P.pot;p0.apply(this,arguments);if(P.pot<n)window.__bevute=(window.__bevute||0)+1};const d0=die;die=function(){window.__morto=1;return d0.apply(this,arguments)}}
window.__sim=function(sec,attesa,gruppo){window.__morto=0;window.__bevute=0;let hpMin=[];const z0=Zk,hp0=P.mx,k0=P.kills;let t1=0,min=P.hp,danno=0,prec=P.hp;const nem=()=>ents.filter(e=>e.k==='en'&&e.hp>0);
  if(gruppo){const L=nem().filter(e=>!e.boss).sort((a,b)=>Math.hypot(a.px-P.px,a.py-P.py)-Math.hypot(b.px-P.px,b.py-P.py)),tieni=L.slice(0,gruppo);ents=ents.filter(e=>e.k!=='en'||tieni.includes(e));for(const e of tieni)e.al=1}
  const n0=nem().length;const fine=m=>({t:t1,morto:m,minimo:m?0:Math.round(min/hp0*100),uccisi:P.kills-k0,n0,rimasti:nem().length,pozioni:window.__bevute,perNemico:Math.round(danno/hp0*100/Math.max(1,P.kills-k0))});
  while(t1<sec){for(let i=0;i<15;i++){try{upd(1/30)}catch(e){return{err:String(e)}}}t1+=.5;
    if(P.hp<prec)danno+=prec-P.hp;prec=P.hp;
    if(P.hp<P.mx/3&&P.pot>0)try{P.pc=0;pot();prec=P.hp}catch(e){window.__perr=String(e)}
    if(P.hp<min)min=P.hp;if(P.hp<=0||window.__morto)return fine(1);if(Zk!==z0)return{...fine(0),uscito:1};
    const L=nem();if(!L.length){if(attesa&&CU80.on){P.tg=null;continue}break}let b=null,bd=1e9;for(const e of L){const d=Math.hypot(e.px-P.px,e.py-P.py);if(d<bd){bd=d;b=e}}
    P.tg=b;}
  return fine(0)};`;
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1024,height:700}});const err=[];p.on('pageerror',e=>err.push(e.message));
  await p.goto(FILE);await p.waitForTimeout(1500);await p.evaluate(`localStorage.setItem('voxelia_intro','1');SET.cine=0;begin(1,null);`+SIM);await p.waitForTimeout(1500);
  const righe=[];const prova=async(nome,prep,sec=120,attesa=0,gruppo=0)=>{let r;try{await p.evaluate(`(()=>{__seme(12345);${prep}})()`);await p.waitForTimeout(500);r=await p.evaluate(`(()=>{try{cl()}catch(e){}return __sim(${sec},${attesa?1:0},${gruppo})})()`)}catch(e){r={err:e.message.split('\n')[0]}}
    righe.push([nome,r]);const s=r.err?'errore: '+r.err:(r.morto?'💀 MORTO dopo '+r.t+' s':'vita minima '+r.minimo+'%')+' · '+r.uccisi+'/'+r.n0+' nemici in '+r.t+' s · ogni nemico costa '+r.perNemico+'% della vita · pozioni '+r.pozioni;console.log((nome+'                              ').slice(0,30)+s)};
  // la Storia: primo piano di ogni dungeon
  const DGS=await p.evaluate(()=>Object.entries(DG).map(([k,d])=>[k,d.n,d.lv,d.ent]));
  const SOLO=process.argv[2]||'';
  const media=async(nome,prep)=>{const R=[];for(let i=0;i<5;i++){const r=await p.evaluate(`(()=>{__seme(${i*7919+nome.length});${prep};try{cl()}catch(e){};return __sim(90,0,3)})()`).catch(e=>({err:e.message}));R.push(r)}
    const ok=R.filter(r=>!r.err&&!r.uscito),morti=ok.filter(r=>r.morto).length,c=Math.round(ok.reduce((a,r)=>a+r.perNemico,0)/Math.max(1,ok.length));
    console.log((nome+'                              ').slice(0,30)+(ok.length?'ogni nemico costa in media '+c+'% della vita · morto '+morti+' volte su '+ok.length:'errore: '+(R[0].err||'').split('\n')[0]))};
  if(SOLO!=='tomorrow'&&SOLO!=='cuore')for(const[k,n,lv,ent]of DGS)await media('Storia · '+n,`__eroe(${lv+HERO});load('${k}@1','${ent}');__eroe(${lv+HERO})`);
  if(SOLO==='storia'){await b.close();return}
  const SOLO_TW=SOLO==='tomorrow';
  // Tomorrow
  await p.evaluate(`localStorage.setItem('voxelia_unl55',JSON.stringify({ow:1,neo:1}));toMenu();owGo(1,null);for(let i=0;i<5;i++){try{introEnd()}catch(e){}try{cineSkip()}catch(e){}}`+SIM);await p.waitForTimeout(2500);
  if(process.env.OWPER)await p.evaluate('BIL81.owPer='+(+process.env.OWPER));
  if(SOLO!=='cuore')for(const lv of[5,10,20,30,40]){const q=await p.evaluate(`(()=>{for(let r=0;r<60;r++)for(let a=-r;a<=r;a++)for(const b of[-r,r]){const L=twLv(a,b);if(L>=${lv}&&L<=${lv}+4)return[a,b,L]}return null})()`).catch(()=>null);
    if(q)await media('Tomorrow · dungeon liv. '+(q[2]+1),`__eroe(${q[2]+3});load(twDid(${q[0]},${q[1]})+'@1','tw:${q[0]},${q[1]}');__eroe(${q[2]+3})`)}
  if(SOLO_TW){await b.close();return}
  // Aldoria 3026: la banda della missione 3
  await p.evaluate(`toMenu();mode('neo');neoBegin(null);cl();`+SIM);await p.waitForTimeout(2000);
  if(SOLO!=='cuore')await prova('Aldoria 3026 · la banda',`__eroe(8);P.eq.w=gunItem('pis',1);recalc();nmFix().m=2;PA=ents.find(e=>e.nid==='tommaso55');nmStart();cl();const e=ents.find(e=>e.ms55);if(e){P.px=e.px-3;P.py=e.py}`);
  // il Cuore della Corona, con l'eroe della Storia al livello 25
  await p.evaluate(`toMenu();localStorage.setItem('voxelia_intro','1');begin(1,null);`+SIM);await p.waitForTimeout(1500);
  await p.evaluate(`__eroe(25);P.st=4;save();for(const g of GEM80)cr80Got(g.k,1);cuoreEnter()`);await p.waitForTimeout(1800);
  await prova('Cuore della Corona (5 ondate)',`cl();__eroe(25)`,600,1);
  console.log('   Cuore: ondata raggiunta '+await p.evaluate('CU80.w')+' di 6, vinto '+await p.evaluate('!!cr80().fin'));
  await b.close();if(err.length)console.log('Errori del gioco:\n'+[...new Set(err)].slice(0,6).join('\n'))})();
