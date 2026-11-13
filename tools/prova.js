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
  ['La Minaccia del Regno: mosse, Campioni, boss, notti, invasioni',`toMenu();localStorage.setItem('voxelia_intro','1');SET.film=0;begin(1,null);try{cl()}catch(e){}P.st=3;P.sh=SHARDS.slice();P.lv=22;recalc();P.hp=P.mx;P.pot=50;
    if(th86Val()<2.9)throw new Error('la storia non alza la Minaccia: '+th86Val());th86Fix().d=6;if(th86L()<4)throw new Error('i giorni non alzano la Minaccia');
    TH86.dev=8;load('cripta@3','town');try{cl()}catch(e){}if(!ents.some(e=>e.af86))throw new Error('nessun Campione con i poteri');const ev={};
    for(let i=0;i<600;i++){upd(1/30);if(i%2===0)draw();P.hp=P.mx;for(const e of ents){if(e.gd86>t)ev.g=1;if(e.wu86)ev[e.wu86.k]=1;if(e.ds86)ev.d=1}const L=ents.filter(e=>e.k==='en'&&!e.boss);let b=null,bd=1e9;for(const e of L){const d=dist(e,P);if(d<bd){bd=d;b=e}}if(b&&bd<2.5&&i%4===0)hurtE(b,3,0,0)}
    if(!ev.g||!ev.charge)throw new Error('mosse nuove mancanti: '+JSON.stringify(ev));
    const bs=ents.find(e=>e.boss);if(bs){bs.al=1;bs.hp=bs.mx*.3;P.px=bs.px+2;P.py=bs.py;for(let i=0;i<400;i++){upd(1/30);P.hp=P.mx}}
    th86Fix().d=2.36;TH86.dev=null;load('town','cripta@3');for(let i=0;i<40;i++)upd(1/30);const a=iv86Act();if(!a)throw new Error('nessuna invasione');load(a.z,'town');for(let i=0;i<10;i++)upd(1/30);
    for(let w=0;w<3;w++){for(const e of ents.filter(e=>e.iv86))kill(e);for(let i=0;i<100;i++)upd(1/30)}if(!a.done||!iv86Fix().won)throw new Error('invasione non vinta');
    load('forest','town');P.gt=DAYM*3+23*60;NT86.next=0;for(let i=0;i<60;i++){upd(1/30);P.hp=P.mx}if(!ents.some(e=>e.nt86))throw new Error('di notte non arriva nessuno');pn('th86');cl();`],
  ['Atto II: la costellazione perduta, dall’inizio alla fine',`P.st=5;P.te=2;P.lv=28;recalc();P.hp=P.mx;load('in_castle','town');try{cl()}catch(e){}const re=ents.find(e=>e.nid==='malakar_re');PA=re;pn('npc');if(!/a2qb/.test($('pn').innerHTML))throw new Error('il Re non parla del capitolo nuovo');a2Talk();cl();
    load('in_osservatorio','town');PA=ents.find(e=>e.nid==='astronomo');pn('npc');a2Talk();cl();load('oss_cupola','in_osservatorio');PA=ents.find(e=>e.nid==='allieva');pn('npc');a2Talk();cl();if(!ents.some(e=>e.k==='po'&&e.to==='valle86'))throw new Error('manca il Portale delle Stelle');
    load('valle86','oss_cupola');try{cl()}catch(e){}for(let i=0;i<30;i++){upd(1/30);draw()}const c=dv3Check();if(c.bad.length)throw new Error(c.bad.join(' · '));
    for(const id of['pozzo86','forgia86','giardino86']){load(id+'@3','valle86');try{cl()}catch(e){}for(let i=0;i<10;i++){upd(1/30);draw()}const b=ents.find(e=>e.boss);if(!b)throw new Error('manca il boss di '+id);b.cho48=2;kill(b)}
    if(a2Fix().l.join()!=='1,1,1'||!P.unl.rocca86)throw new Error('le stelle non si accendono');load('rocca86@3','valle86');try{cl()}catch(e){}const m=ents.find(e=>e.t==='morvath86');m.al=1;m.hp=m.mx*.45;for(let i=0;i<20;i++){upd(1/30);draw()}if(!m.ecl86)throw new Error('manca la Eclissi');m.cho48=2;kill(m);`,`await new Promise(r=>setTimeout(r,3700));try{cineSkip()}catch(e){}if(a2Fix().s!==5)throw new Error('Morvath non chiude il capitolo');load('in_castle','town');PA=ents.find(e=>e.nid==='malakar_re');pn('npc');a2Talk();cl();if(a2Fix().s!==6||!P.tit48.own.alba86)throw new Error('manca il finale del capitolo');toMenu();`],
  ['I cancelli: niente dentro le mura, le ante non entrano nei pilastri, il varco resta raggiungibile (8.7.2)',`toMenu();localStorage.setItem('voxelia_intro','1');SET.film=0;begin(1,null);try{cl()}catch(e){}P.st=5;P.te=2;P.unl=P.unl||{};P.unl.rovine=1;const bad=[];let ng=0;
    for(const z of Object.keys(Z).filter(k=>!Z[k].dg)){try{load(z,'town');try{cl()}catch(e){}}catch(e){continue}const G=ents.filter(e=>e.st==='cancello');if(!G.length)continue;gateFit();
      for(const g of G){ng++;const geo=gateGeo(g),own=new Set([...geo.pil,...geo.spot,...(g.pil?geo.op:[])].map(c=>c+'')),sp0=g.span||3,o=g.off!=null?g.off:-sp0/2,eo=g.eo||0,pw=g.pil?1:.7,pd=g.pil?1.1:.7,ax=g.dir==='y'?1:0;
        for(const op of[0,.2,.5,.8,1]){g.op=op;for(const q of portalL(g)){const x0=g.px+q[0],y0=g.py+q[1];
          for(let y=Math.floor(y0+.08);y<=Math.floor(y0+q[4]-.08);y++)for(let x=Math.floor(x0+.08);x<=Math.floor(x0+q[3]-.08);x++){if(own.has(x+','+y)||!M[y]||M[y][x]==null)continue;const d=DEC[y][x];if(!WK(M[y][x])||(d&&d[0]!=='₪'))bad.push(z+': un pezzo del cancello '+g.sty+' dentro '+x+','+y+' (aperto '+op+')')}
          if(q[2]<40){const a0=q[ax],a1=a0+q[ax+3],b0=q[1-ax],b1=b0+q[1-ax+3];for(const pc of[o,o+sp0])if(a0<pc+pw/2-.02&&a1>pc-pw/2+.02&&b0<eo+pd/2-.02&&b1>eo-pd/2+.02&&!(Math.abs((a0+a1)/2-pc)<.02&&(q[5]>=40||(a0<=pc-pw/2&&a1>=pc+pw/2))))bad.push(z+': l\\u2019anta del cancello '+g.sty+' entra nel pilastro (aperto '+op+')')}}}
        g.op=0;const mid=geo.o+geo.sp/2,fx=Math.floor(g.dir==='y'?g.px+eo+geo.ins:g.px+mid),fy=Math.floor(g.dir==='y'?g.py+mid:g.py+eo+geo.ins),d=bfs(P.px|0,P.py|0);if(!WK(M[fy][fx])||d[fy*N+fx]<0)bad.push(z+': davanti al cancello '+g.sty+' non si arriva ('+fx+','+fy+')')}}
    if(ng<15)bad.push('trovati solo '+ng+' cancelli');if(bad.length)throw new Error([...new Set(bad)].slice(0,6).join(' · '));load('town','forest');try{cl()}catch(e){}`],
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
