#!/usr/bin/env node
/* Prova automatica di Voxelia (8.0, allargata nella 8.1). Apre voxelia.html in un browser senza finestra e:
   1. gioca qualche secondo di ogni modalità: la Storia (città, un dungeon, il Serraglio), Tomorrow, il
      Cuore della Corona (le stanze degli enigmi) e il Voxeliaverse (la stanza, una realtà, il guardiano, il salvataggio);
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
  ['Atto II: la città sepolta, dall’inizio alla fine (8.8)',`SET.film=0;DEV.on=true;DEV.god=1;P.st=5;P.te=2;P.lv=28;recalc();P.hp=P.mx;const o=a2Fix();o.s=0;load('in_castle','town');try{cl()}catch(e){}const re=ents.find(e=>e.nid==='malakar_re');PA=re;pn('npc');if(!/a2qb/.test($('pn').innerHTML))throw new Error('il Re non parla dell’Atto II');a2Talk();cl();
    load('cas_prigioni','in_castle');PA=ents.find(e=>e.nid==='aldric_p');pn('npc');a2Talk();cl();if(o.s!==2)throw new Error('Aldric non racconta il Canto dei Re');
    load('vecchia','town');try{cl()}catch(e){}if(!ents.some(e=>e.k==='po'&&e.to==='eldora88'))throw new Error('manca la scala nel pozzo');
    load('eldora88','vecchia');try{cl()}catch(e){}for(let i=0;i<30;i++){upd(1/30);draw()}const c=dv3Check();if(c.bad.length)throw new Error(c.bad.join(' · '));if(o.s!==3)throw new Error('arrivando a Eldora il passo non va avanti');
    if(ents.filter(e=>e.k==='ins88').length!==12)throw new Error('mancano Pietre della Memoria');const d=bfs(P.px|0,P.py|0);for(const e of ents.filter(e=>['po','npc','ins88'].includes(e.k))){const x=e.px|0,y=e.py|0;if(![[0,0],[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>d[(y+b)*N+x+a]>=0))throw new Error('a Eldora non si arriva a '+(e.nid||e.to||('pietra '+e.i)))}
    PA=ents.find(e=>e.nid==='oriana88');pn('npc');a2Talk();cl();PA=ents.find(e=>e.nid==='vael88');pn('npc');a2Talk();cl();if(o.s!==5)throw new Error('Oriana e Vael non fanno andare avanti la storia');
    for(const e of ents.filter(e=>e.k==='ins88'))ins88Read(e.i);cl();if(!o.insR)throw new Error('le dodici pietre non danno il premio');
    for(const id of['fonderia88','giardini88','archivio88']){load(id+'@3','eldora88');try{cl()}catch(e){}for(let i=0;i<10;i++){upd(1/30);draw()}const b=ents.find(e=>e.boss);if(!b)throw new Error('manca il boss di '+id);b.al=1;P.px=b.px+2;P.py=b.py;
      for(let i=0;i<120;i++){P.hp=P.mx;upd(1/30);if(PM==='txt')cl();if(i===30)b.hp=Math.round(b.mx*.3)}if(!b.p88)throw new Error(b.t+' non cambia fase');b.cho48=2;kill(b);bossDown(b)}
    if(o.b.join()!=='1,1,1'||!P.unl.trono88||o.s!==6)throw new Error('i tre Custodi non aprono il Palazzo');load('trono88@3','eldora88');try{cl()}catch(e){}const k=ents.find(e=>e.t==='aldric88');k.al=1;P.px=k.px+2;P.py=k.py;
    for(let i=0;i<200;i++){P.hp=P.mx;upd(1/30);if(PM==='txt')cl();if(i===20)k.hp=Math.round(k.mx*.6);if(i===110)k.hp=Math.round(k.mx*.3)}if(!k.pre88||k.p88!==2||!k.vul88)throw new Error('il Re di Pietra non ha le sue fasi: '+k.p88);kill(k);bossDown(k);if(o.s!==7)throw new Error('vinto il Re di Pietra il passo non va avanti');
    load('in_castle','town');try{cl()}catch(e){}PA=ents.find(e=>e.nid==='malakar_re');pn('npc');a2Talk();cl();if(o.s!==8||!cr80().g.zaffiro88)throw new Error('alla fine non torna lo Zaffiro');if(NG80!==6)throw new Error('le schegge della Corona non sono sei');
    const nt=L88.filter(([it,en])=>it!==en&&!it.includes('{')&&i18En(it)===it).map(q=>q[0].slice(0,40));if(nt.length)throw new Error('testi dell’Atto II senza inglese: '+nt.slice(0,3).join(' · '));DEV.god=0`],
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
  ['Il Cuore della Corona: le sei stanze degli enigmi (8.9)',`try{cineSkip()}catch(e){}toMenu();for(const k of GEM80.map(g=>g.k))cr80Got(k,1);{const o=cr80();delete o.cu9;LS.set(CRK80,o);CU9O=null}if(LS.get(SAVEK,null))cuoreEnter()`,
    `if(Zk!=='cuore80')throw new Error('non si entra nel Cuore: '+Zk);try{cl()}catch(e){}const d=bfs(P.px|0,P.py|0);for(let i=0;i<6;i++){const[x,y]=C9W(i,0,0);if(d[y*N+x]<0)throw new Error('la stanza '+i+' del Cuore non si raggiunge')}
    if(ents.filter(e=>e.k==='cu9').length<20)throw new Error('mancano le cose degli enigmi');const sol=rub9Sol(RUB9S);if(!sol||!sol.length)throw new Error('il fuoco del Rubino non ha soluzione');if(cuoreTick.toString().length>20)throw new Error('nel Cuore tornano le ondate')`],
  ['Il Voxeliaverse: la stanza dietro la Corona, le realtà, il guardiano, salvare e tornare (8.9)',`toMenu();{const o=cr80();o.cu9={r:[1,1,1,1,1,1],f7:Date.now(),seen:{ent:1}};delete o.vxv;LS.set(CRK80,o);CU9O=null;VXV.o=null}cr7Sync();if(!CRGEM.some(g=>g.k==='settima'))throw new Error('sulla Corona manca la settima gemma');vxRoom()`,
    `const wait=ms=>new Promise(r=>setTimeout(r,ms)),SIM=n=>{for(let i=0;i<n;i++){VX.t+=.033;if(!VX.sc.paused)vxPhys(.033);VX.sc.tick(.033,VX.t)}};
    if(!VX.on||!VX.sc||VX.sc.combat)throw new Error('la stanza dietro la Corona non si apre');if(!VX.sc.items.some(i=>/camino|fuoco/i.test(i.label))||!VX.sc.items.some(i=>/libreria/i.test(i.label)))throw new Error('nella stanza mancano il camino o la libreria');
    const a=vxRealDesc(777,0),a2=vxRealDesc(777,0),c=vxRealDesc(778,0);if(a.name!==a2.name||a.signs.join()!==a2.signs.join())throw new Error('lo stesso seme non dà la stessa realtà');if(a.name===c.name&&a.ep===c.ep)throw new Error('semi diversi danno la stessa realtà');
    for(let s=1;s<300;s++){const d=vxRealDesc(s*7919>>>0,s&1);if(!/^[A-Z][a-z']{1,9}$/.test(d.name))throw new Error('un nome strano: '+d.name);if(d.sp.length<2||d.sp.some(x=>!x.n)||!d.gn||d.signs.length!==3)throw new Error('una realtà incompleta: '+d.name);if(i18En(d.signs[0])===d.signs[0]||i18En(d.ep)===d.ep)throw new Error('una realtà senza inglese: '+d.ep)}
    vxStop();if(!vxStart(vxRealScene(vxRealDesc(4242,1),'fire')))throw new Error('la realtà non si apre');if(!VX.sc.combat||VXR.E.length<8)throw new Error('nella realtà mancano le creature');SIM(60);if(VXR.dead||!VX.pl.on||VX.pl.y<1.5)throw new Error('l\u2019eroe non sta in piedi nella realtà');
    const e=VXR.E.find(q=>q.sign==null),ca=Math.atan2(VXR.C[2]-e.z,VXR.C[0]-e.x);VX.pl.x=e.x+Math.cos(ca)*1.4;VX.pl.z=e.z+Math.sin(ca)*1.4;VX.pl.y=Math.max(e.y,VXR.gh(VX.pl.x,VX.pl.z))+.05;VX.pl.vy=0;VX.pl.yaw=Math.atan2(e.x-VX.pl.x,e.z-VX.pl.z);e.st='rec';e.t=9;vxAtk();SIM(12);if(e.hp>=e.mx)throw new Error('la spada non colpisce');vxDodge();if(VXR.iT<=0||!VX.pl.dash)throw new Error('la schivata non funziona');SIM(30);
    if(VX.sc.items[1].ok()&&!/protetto/.test(VX.sc.items[1].label()))throw new Error('il segno non dice che è protetto');for(const q of VXR.E)if(q.sign!=null)q.die=.5;SIM(20);for(let k=0;k<3;k++){vxSign(k);vxPanel(null);vxSignAfter()}
    for(let i=0;i<40&&!VXR.boss;i++)await wait(100);if(!VXR.boss)throw new Error('dopo i tre segni non si sveglia il guardiano');SIM(90);VXR.hp=VXR.mx=1e5;VXR.boss.hp=1;vxHitE(VXR.boss,9);SIM(20);if(!VXR.bossDead)throw new Error('il guardiano non cade');
    vxSaveReal(1);const b=vxv().b[0];if(!b.sv||!b.st||!b.st.boss||(cr80().vxv.b[0]||{}).s!==4242)throw new Error('la realtà non si salva');vxStop();vxStart(vxRealScene(vxRealDesc(4242,1),'lib'));
    if(VXR.lit.join()!=='1,1,1'||!VXR.bossDead||VXR.boss||VXR.E.some(q=>q.sign!=null))throw new Error('tornando, la realtà salvata non è com\u2019era');vxHeart();vxPanel(null);if(!VXR.won||!vxv().b[0].st.heart)throw new Error('il Cuore non si prende');
    vxForget(4242,1);if(vxv().b.find(q=>q.s===4242).sv)throw new Error('la realtà non si dimentica');vxLib();if(VX.ui.querySelectorAll('.vbk').length<6)throw new Error('la libreria è vuota');vxPanel(null);vxStop();toMenu()`]];
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
