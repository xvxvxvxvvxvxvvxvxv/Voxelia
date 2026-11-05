#!/usr/bin/env node
/* Prova automatica di Voxelia (8.0). Apre voxelia.html in un browser senza finestra e gioca qualche secondo di ogni
   modalità: la Storia (città, un dungeon, il Serraglio), Tomorrow, Aldoria 3026 (con un veicolo), la Cronoporta e il
   Cuore della Corona. Si ferma con un errore se il gioco ne lancia uno.
   Serve Playwright con Chromium:  npm i -D playwright && npx playwright install chromium
   Uso, dalla cartella del progetto:  node tools/prova.js   (prima: sh build.sh) */
const path=require('path');let chromium;try{({chromium}=require('playwright'))}catch(e){console.error('✗ manca Playwright: npm i -D playwright && npx playwright install chromium');process.exit(2)}
const FILE='file://'+path.resolve(__dirname,'..','voxelia.html');
const PASSI=[
  ['Storia: la città',`localStorage.setItem('voxelia_intro','1');SET.cine=0;begin(1,null);`],
  ['Storia: un dungeon',`P.lv=20;recalc();P.hp=P.mx;load('cripta@2','town');`],
  ['Storia: il Serraglio',`load('in_serraglio','town');SR55.tab='pot';pn('serr55');cl();`],
  ['Tomorrow',`localStorage.setItem('voxelia_unl55',JSON.stringify({ow:1,neo:1}));toMenu();owGo(1,null);for(let i=0;i<5;i++){try{introEnd()}catch(e){}try{cineSkip()}catch(e){}}`],
  ['Aldoria 3026',`toMenu();mode('neo');neoBegin(null);cl();const c=ents.find(e=>e.k==='car'&&e.ai);P.px=c.px;P.py=c.py;carEnter(c);KEYS.w=1;`],
  ['La Cronoporta',`KEYS.w=0;carExit();nmFix().m=9;save();neoTime(1);`],
  ['Il Cuore della Corona',`try{cineSkip()}catch(e){}toMenu();for(const k of GEM80.map(g=>g.k))cr80Got(k,1);P&&0;const s=LS.get(SAVEK,null);if(s){cuoreEnter()}`]];
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1280,height:800}});const err=[];
  p.on('pageerror',e=>err.push(e.message));await p.goto(FILE);await p.waitForTimeout(1500);let ko=0;
  for(const[n,code]of PASSI){const e0=err.length;try{await p.evaluate(code)}catch(e){err.push(e.message)}await p.waitForTimeout(4000);
    const st=await p.evaluate(()=>({zona:typeof Zk!=='undefined'?Zk:'',modo:typeof MODE!=='undefined'?MODE:''})).catch(()=>({}));
    if(err.length>e0){ko=1;console.log('✗ '+n+' — '+err.slice(e0).join(' | '))}else console.log('✓ '+n+' ('+st.modo+' · '+st.zona+')')}
  await b.close();if(ko){console.log('Qualcosa non va.');process.exit(1)}console.log('Tutto a posto.')})();
