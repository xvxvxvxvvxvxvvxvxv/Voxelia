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
  ['Aldoria ridisegnata: fiume, ponti, quartieri, gente',`toMenu();localStorage.setItem('voxelia_intro','1');begin(1,null);try{tourEnd()}catch(e){}cl();if(!AL86.on)throw new Error('manca la città nuova');const c=dv3Check();if(c.bad.length)throw new Error(c.bad.join(' · '));for(let y=2;y<=12;y++)if(M[y][54]===2)throw new Error('il fiume tocca il Colosseo');for(let y=2;y<62;y++)for(let x=2;x<N-2;x++)if(M[y][x]===6&&['h','r','l','j'].includes(DEC[y][x])&&((M[y][x-1]===4&&M[y][x+1]===4)||(M[y-1][x]===4&&M[y+1][x]===4)))throw new Error('arredo in mezzo alla via a '+x+','+y);{const T=ents.find(e=>e.k==='torre43');if(!T||(T.px|0)!==50||(T.py|0)!==16)throw new Error('la torre non è accanto al Colosseo')}if(ents.some(e=>e.k==='al48'))throw new Error('resta la casetta degli alleati');if(!alB(55,35)||!alB(55,16)||!fWspec(55,30))throw new Error('ponti o acqua fuori posto');pn('dil48');if(!/Alleati/.test($('pn').innerHTML))throw new Error('manca il pulsante degli alleati dal Viandante');pn('al48');cl();for(const id of['olmo','remo','ines','leandro','bruna','celeste'])if(!ents.some(e=>e.nid===id))throw new Error('manca '+id);for(const[x,y,d]of[[30,60,'porto'],[46,48,'giardini'],[62,30,'oltre']]){P.px=x+.5;P.py=y+.5;for(let i=0;i<70;i++)upd(1/30);if(AL86.d!==d)throw new Error('quartiere '+d+' non riconosciuto: '+AL86.d)}`],
  ['Animazioni, diario e primi passi',`for(const k in EMO86){emote(k);for(let i=0;i<20;i++){upd(1/30);draw()}}AN86.em='';for(const k of['hit','act','drk']){AN86[k]=t;for(let i=0;i<10;i++){upd(1/30);draw()}}if(EMO86.danza||EMO86.siediti)throw new Error('restano le animazioni tolte');qAccept('marcus','c1');pn('q');if(!/Diario delle missioni/.test($('pn').innerHTML))throw new Error('il diario non si apre');jrTrack('c1');for(let i=0;i<20;i++)upd(1/30);cl();if(!JR86.tg)throw new Error('la guida non trova la meta');if(!P.gd86)throw new Error('mancano i primi passi');pn('inv');invBest();invSort('r');cl();openMap();closeMap();`],
  ['Il pannello sviluppatore: tutte le schede',`toMenu();DEV.on=true;devMark();devStart();for(const k of['film','zone','eroe','altro','give','twdv','st3','ch3','wd3','dbg3','con3','sv3','an86']){DEV.tab=k;devOpen();if($('dvc').innerHTML.length<50)throw new Error('scheda vuota: '+k)}dv3Run('P.lv');DV3.grid=DV3.ents=DV3.hud=1;devClose();`],
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
