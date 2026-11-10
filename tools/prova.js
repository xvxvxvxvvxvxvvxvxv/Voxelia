#!/usr/bin/env node
/* Prova automatica di Voxelia (8.0, allargata nella 8.1). Apre voxelia.html in un browser senza finestra e:
   1. gioca qualche secondo di ogni modalità: la Storia (città, un dungeon, il Serraglio), Tomorrow e il
      Cuore della Corona;
   2. salva in Storia e Tomorrow, ricarica la pagina e controlla che la partita torni com'era;
   3. apre tutte le schede del pannello sviluppatore e gli fa provare tutte le zone del gioco (8.5);
   4. avvia server.js e fa entrare due giocatori nella stessa città, controllando che si vedano.
   Si ferma con un errore se il gioco ne lancia uno o se un controllo non torna.
   Serve Playwright con Chromium:  npm i -D playwright && npx playwright install chromium
   Uso, dalla cartella del progetto:  node tools/prova.js   (prima: sh build.sh)
   Con «node tools/prova.js veloce» salta la parte in rete. */
const path=require('path'),{spawn}=require('child_process'),http=require('http');
let chromium;try{({chromium}=require('playwright'))}catch(e){console.error('✗ manca Playwright: npm i -D playwright && npx playwright install chromium');process.exit(2)}
const ROOT=path.resolve(__dirname,'..'),FILE='file://'+path.join(ROOT,'voxelia.html'),VELOCE=process.argv.includes('veloce');
const PASSI=[
  ['Storia: la città',`localStorage.setItem('voxelia_intro','1');SET.cine=0;begin(1,null);`],
  ['Storia: un dungeon',`P.lv=20;recalc();P.hp=P.mx;load('cripta@2','town');`],
  ['Storia: il Serraglio',`load('in_serraglio','town');SR55.tab='pot';pn('serr55');cl();`],
  ['Tomorrow',`localStorage.setItem('voxelia_unl55',JSON.stringify({ow:1}));toMenu();owGo(1,null);for(let i=0;i<5;i++){try{introEnd()}catch(e){}try{cineSkip()}catch(e){}}`],
  ['La gemma spezzata non porta da nessuna parte',`toMenu();mode('neo');mode('dim');if(MODE==='neo'||started)throw new Error('lo Zaffiro si apre ancora');if(typeof neoBegin!=='undefined'||E.neo_agente)throw new Error('resta codice del 3026');`],
  ['Il pannello sviluppatore: tutte le schede',`toMenu();DEV.on=true;devMark();devStart();for(const k of['film','zone','eroe','altro','give','twdv','st3','ch3','wd3','dbg3','con3','sv3']){DEV.tab=k;devOpen();if($('dvc').innerHTML.length<50)throw new Error('scheda vuota: '+k)}dv3Run('P.lv');DV3.grid=DV3.ents=DV3.hud=1;devClose();`],
  ['Il pannello sviluppatore: la prova di tutte le zone',`DV3.grid=DV3.ents=0;window.__zone=dv3TestAll().then(()=>{const T=DV3.test,E=T.res.filter(r=>r.err.length);if(T.i<T.n)throw new Error('la prova si è fermata a '+T.i+'/'+T.n);if(E.length)throw new Error(E.map(r=>r.z+': '+r.err[0]).join(' · '))});`,`await window.__zone;DV3.hud=0;dv3Hud();devClose();toMenu();`],
  ['Il Cuore della Corona',`try{cineSkip()}catch(e){}toMenu();for(const k of GEM80.map(g=>g.k))cr80Got(k,1);if(LS.get(SAVEK,null))cuoreEnter()`]];
// salvataggi: [nome, come si comincia e si salva, come si ricarica, che cosa deve tornare]
const SALVA=[
  ['Storia',`toMenu();localStorage.setItem('voxelia_intro','1');begin(1,null);P.g=43210;P.lv=13;P.pot=7;save();`,`const s=LS.get(SAVEK,null);begin(s.df|0,s);`],
  ['Tomorrow',`toMenu();owGo(1,null);for(let i=0;i<5;i++){try{introEnd()}catch(e){}try{cineSkip()}catch(e){}}P.g=43210;P.lv=13;P.pot=7;save();`,`owGo(1,LS.get(OWK,null));for(let i=0;i<5;i++){try{introEnd()}catch(e){}try{cineSkip()}catch(e){}}`]];
let ko=0;const male=s=>{ko=1;console.log('✗ '+s)},bene=s=>console.log('✓ '+s);
const attendi=ms=>new Promise(r=>setTimeout(r,ms));
const salute=port=>new Promise(r=>{const q=http.get('http://127.0.0.1:'+port+'/salute',x=>{x.resume();r(x.statusCode===200)});q.on('error',()=>r(false));q.setTimeout(1500,()=>{q.destroy();r(false)})});
(async()=>{const b=await chromium.launch();const err=[];
  const pagina=async(url)=>{const p=await b.newPage({viewport:{width:1280,height:800}});p.on('pageerror',e=>err.push(e.message));await p.goto(url);await p.waitForTimeout(1500);return p};
  console.log('— Le modalità');let p=await pagina(FILE);
  for(const[n,code,poi]of PASSI){const e0=err.length;try{await p.evaluate(code)}catch(e){err.push(e.message)}await p.waitForTimeout(4000);if(poi)try{await p.evaluate('(async()=>{'+poi+'})()')}catch(e){err.push(e.message.split('\n')[0])}
    const st=await p.evaluate(()=>({zona:typeof Zk!=='undefined'?Zk:'',modo:typeof MODE!=='undefined'?MODE:''})).catch(()=>({}));
    if(err.length>e0)male(n+' — '+err.slice(e0).join(' | '));else bene(n+' ('+st.modo+' · '+st.zona+')')}
  console.log('— I salvataggi (si salva, si ricarica la pagina, si riprende)');
  for(const[n,prima,dopo]of SALVA){const e0=err.length;try{await p.evaluate(prima);await p.waitForTimeout(1500);await p.reload();await p.waitForTimeout(1800);await p.evaluate(dopo);await p.waitForTimeout(2500);
      const r=await p.evaluate(()=>({g:P.g,lv:P.lv,pot:P.pot,modo:MODE}));
      if(err.length>e0)male(n+' — '+err.slice(e0).join(' | '));else if(r.g!==43210||r.lv!==13||r.pot!==7)male(n+': dopo il riavvio monete '+r.g+', livello '+r.lv+', pozioni '+r.pot+' (attesi 43210, 13, 7)');else bene(n+': monete, livello e pozioni tornano dopo il riavvio')}
    catch(e){male(n+' — '+e.message.split('\n')[0])}}
  await p.close();
  if(!VELOCE){console.log('— In rete (server.js con due giocatori)');const PORT=3900+Math.floor(Math.random()*90);
    const srv=spawn(process.execPath,['server.js'],{cwd:ROOT,env:{...process.env,PORT:String(PORT),DATA_FILE:path.join(require('os').tmpdir(),'voxelia-prova-'+PORT+'.json'),ADMIN_PASSWORD:'prova'},stdio:'ignore'});
    try{let ok=0;for(let i=0;i<40&&!ok;i++){await attendi(250);ok=await salute(PORT)}
      if(!ok)male('il server non risponde su /salute');else{const G=[];
        for(const n of['Anna','Bruno']){const q=await pagina('http://127.0.0.1:'+PORT+'/');const e0=err.length;
          await q.evaluate(n=>{SET.cine=0;localStorage.setItem('voxelia_unl55',JSON.stringify({ow:1}));localStorage.setItem('voxelia_intro','1');$('nm').value=n;$('rc').value='prova84';begin(1,null);try{cl()}catch(e){}},n).catch(e=>err.push(e.message));G.push(q)}
        let r={};for(let i=0;i<20;i++){await attendi(500);r=await G[1].evaluate(()=>({ok:!!NET.ok,altri:Object.keys(NET.peers||{}).length})).catch(()=>({}));if(r.altri)break}
        if(!r.ok)male('il secondo giocatore non si è collegato al server');else if(!r.altri)male('i due giocatori non si vedono');else bene('due giocatori collegati nella stessa città si vedono')}}
    finally{srv.kill()}}
  await b.close();if(ko){console.log('Qualcosa non va.');process.exit(1)}console.log('Tutto a posto.')})();
