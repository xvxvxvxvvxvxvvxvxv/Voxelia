/* ================= 7.22: LE GUERRE =================
   ASSALTI DELLE FAZIONI: le fazioni non stanno a guardare. Ogni giorno una di loro può marciare su una delle tue terre
   (prima quelle ostili, con cui hai la reputazione sotto zero). Hai fino al giorno dopo per correre a difenderla: le
   loro ondate attaccano lo stendardo, le guardie e le torri del borgo ti aiutano. Se non arrivi, la terra passa a loro;
   se è il tuo insediamento, lo saccheggiano (meno, se ha torri e palizzata). Vincere porta oro, esperienza e onore.
   GUERRE FRA GIOCATORI (con il server e il plugin Territori, nello stesso mondo con il codice stanza): le terre di tutti
   compaiono sulla mappa con lo stemma di chi le tiene. Le terre di un altro eroe si prendono con un assedio contro le sue
   guardie; il suo insediamento non si prende, si saccheggia. Chi perde una terra o viene saccheggiato lo scopre subito,
   o al suo ritorno se era offline. Il registro (U → Guerra) racconta le battaglie del mondo. */
const TWX={map:{},log:[],ok:0,sent:'',hello:0,cap:{}};
const twWorld=()=>NET.code||'';
const twOther=k=>{const r=TWX.map[k];return r&&r.o&&r.o!==NET.name?r:null};
const _twOwner722=twOwner;twOwner=function(rx,ry){const k=twK(rx,ry);if(P&&P.tw){const mine=P.tw.terr&&P.tw.terr[k];const o=!mine&&twOther(k);if(o)return{pl:o.o,f:'pl:'+o.o,X:o};if(!mine&&P.tw.taken&&P.tw.taken[k])return{f:P.tw.taken[k]}}return _twOwner722(rx,ry)};
const _twFac722=twFac;twFac=function(f){if(String(f).startsWith('pl:')){const nm=f.slice(3),r=Object.values(TWX.map).find(x=>x.o===nm),F=r&&r.f;return{n:F&&F.n?F.n+' ('+nm+')':'le terre di '+nm,c:F&&F.cr?F.cr.c1:'#e0e0e0',cr:F&&F.cr||{sh:0,dv:0,c1:'#9a9aa4',c2:'#2a2a2a',sy:1},pl:nm}}return _twFac722(f)};
function twWlog(tx){P.tw.wlog=P.tw.wlog||[];P.tw.wlog.unshift({d:gDay(),tx});P.tw.wlog.length=Math.min(P.tw.wlog.length,24)}
/* ---- gli assalti delle fazioni alle tue terre ---- */
function asCheck(){const T=P.tw;if(!T||!T.terr)return;const mine=Object.keys(T.terr);if(!mine.length)return;const d=gDay();
  const A=T.as;if(A&&gNow()>A.until&&!A.won&&!(OW.asl&&Zk===A.k)){asLose(A);return}if(A||T.asd===d)return;T.asd=d;
  const hostile=TWFK.filter(f=>(P.ow.rep[f]|0)<0),H=twFacHomes();if(twI(d,hs(NET.name||'x')%977,141)>(.22+hostile.length*.12+Math.min(.2,mine.length*.03)))return;
  const pool=hostile.length?hostile:TWFK.filter(f=>H[f]),f=pool[Math.floor(twI(d,3,142)*pool.length)];if(!f||!H[f])return;
  let best=null,bd=1e9;for(const k of mine){const p=twP(k),dd=Math.hypot(p[0]-H[f][0],p[1]-H[f][1]);if(dd<bd){bd=dd;best=k}}if(!best)return;
  const F=twFac(f),z=twZ(best);T.as={k:best,f,until:gNow()+20*60,w:0,n:3+Math.min(3,Math.floor(P.lv/8)),won:0};twWlog(F.n+' marcia su '+z.n);
  banner('⚔ '+F.n+' marcia su '+z.n,'Hai fino a domani per difenderla · U → Guerra','spade');tone(110,.4,'sawtooth',.05);save()}
function asLose(A){const T=P.tw,F=twFac(A.f),z=twZ(A.k);T.as=null;OW.asl=null;
  if(T.set&&T.set.k===A.k){setAccrue();const q=Math.max(.05,.4-.1*setB('torre')-.08*setB('mura')),g=Math.round((T.set.cash|0)*q)+Math.round(setRate()*q*2);T.set.cash=Math.max(0,(T.set.cash|0)-g);twWlog(F.n+' ha saccheggiato '+T.set.n+' (−'+g+'💰)');banner('🔥 '+T.set.n+' saccheggiata',F.n+' ha preso '+g+' monete dal tesoro','spade')}
  else{delete T.terr[A.k];T.taken=T.taken||{};T.taken[A.k]=A.f;twWlog(F.n+' ti ha tolto '+z.n);banner('⚔ Hai perso '+z.n,'Ora è terra di '+F.n+': puoi riprenderla (U)','spade')}
  twSync();save()}
function asStart(){const A=P.tw.as;if(!A||A.k!==Zk||A.won||OW.asl)return;const F=twFac(A.f);let bn=ents.find(e=>e.k==='twbn'&&!e.cq);if(!bn){const h=twHub(ZZ.rx,ZZ.ry),[x,y]=nearFree(h[0]+3,h[1]-2);bn={k:'twbn',n:'Stendardo · '+ZZ.n,px:x+.5,py:y+.5,cr:myCrest()};ents.push(bn)}
  bn.hp=bn.mx=300+P.lv*40;OW.asl={bn,t:t+3,w:0};banner('⚔ L\'assalto di '+F.n,'Difendi lo stendardo: '+A.n+' ondate','spade');music('guerra')}
function asTick(dt){const L=OW.asl,A=P.tw&&P.tw.as;if(!L||!A){return}if(Zk!==A.k){OW.asl=null;return}const bn=L.bn,F=twFac(A.f);
  // i nemici vicini allo stendardo lo colpiscono
  for(const e of ents)if(e.k==='en'&&e.asl){const d=dist(e,bn);if(d<1.4&&dist(e,P)>1.6){e.bcd=(e.bcd||0)-dt;if(e.bcd<=0){e.bcd=e.cd||1.2;e.atkT=t;e.atkD=[bn.px-e.px,bn.py-e.py];bn.hp-=Math.round((e.at||6)*.7);flt(bn,'−'+Math.round((e.at||6)*.7),'#ff9a7a')}}
    else if(!(e.cbs>t)&&dist(e,P)>4){const k=Math.min(1,(e.sp||2)*dt/(d||1));mv(e,(bn.px-e.px)*k,(bn.py-e.py)*k);e.mvT=t}}
  // le guardie del borgo danno una mano
  if(P.tw.set&&P.tw.set.k===Zk)for(const gd of ents)if(gd.k==='npc'&&NPCS[gd.nid]&&NPCS[gd.nid].tw2==='gua2'){gd.gcd=(gd.gcd||0)-dt;if(gd.gcd>0)continue;let tg=null,bd=2.2;for(const e of ents)if(e.k==='en'&&e.asl){const d=dist(e,gd);if(d<bd){bd=d;tg=e}}if(tg){gd.gcd=1.3;hurtE(tg,Math.round(8+P.lv*1.5+setB('torre')*6),1);gd.atkT=t}}
  if(bn.hp<=0){OW.asl=null;bn.hp=0;asLose(A);for(const e of ents.slice())if(e.k==='en'&&e.asl)ents.splice(ents.indexOf(e),1);return}
  const foes=ents.filter(e=>e.k==='en'&&e.asl).length;
  if(!foes&&t>=L.t){if(L.w>=A.n){asWin(A);return}L.w++;L.t=t+6;const types=['cavaliere','bandito','guardia_reale','soldato','scheletro'].filter(x=>E[x]),cnt=Math.max(2,3+L.w-(P.tw.set&&P.tw.set.k===Zk?setB('torre'):0));
    for(let i=0;i<cnt;i++){const a=Math.random()*6.283,[x,y]=nearFree(clamp(Math.round(bn.px+Math.cos(a)*9),2,N-3),clamp(Math.round(bn.py+Math.sin(a)*9),2,N-3));const e=mk(types[(i+L.w)%types.length],x,y);
      e.n=(i===0&&L.w===A.n?'Capitano di ':'Soldato di ')+F.n.replace(/^(la |il |l')/i,'');e.asl=1;e.al=1;e.hp=e.mx=Math.round(e.mx*(1+(ZZ.lv||1)*.1+P.lv*.03));e.at*=1+P.lv*.02;if(i===0&&L.w===A.n)eliteMk(e);ents.push(e)}
    msg('⚔ Ondata '+L.w+' di '+A.n+' · '+F.n);tone(120,.25,'sawtooth',.05)}}
function asWin(A){const F=twFac(A.f),z=twZ(A.k);OW.asl=null;P.tw.as=null;const g=120+P.lv*30;P.g+=g;gainXP(80+P.lv*20);P.ow.rep[A.f]=(P.ow.rep[A.f]|0)+5;twWlog('Hai respinto '+F.n+' a '+z.n);
  jingle([60,64,67,72,76,79,84],.1,'triangle');banner('Vittoria!',z.n+' resta tua · '+g+' monete','trofeo');if(cineOK())goldFly(g);music(typeof zoneMus==='function'?zoneMus():'town');save();hud()}
/* ---- le terre degli altri eroi ---- */
function twSync(){if(!NET.ok||!twWorld()||!P||!P.tw||!twOn())return;const mine={};for(const k in P.tw.terr||{}){const S9=typeof csSets==='function'?csSets().find(s=>s.k===k):(P.tw.set&&P.tw.set.k===k?P.tw.set:null);mine[k]=S9?(typeof csWith==='function'?csWith(S9,()=>({s:{n:S9.n,lv:S9.lv,dif:setB('torre')+setB('mura'),pow:typeof setPower==='function'?setPower(S9):0}})):{s:{n:S9.n,lv:S9.lv,dif:setB('torre')+setB('mura')}}):{}}
  const f=twMyF()?twFac(twMyF()):null,pay={w:twWorld(),mine,f:f?{n:f.n,cr:f.cr}:null},key=JSON.stringify(pay);if(key===TWX.sent)return;TWX.sent=key;VXP.send('territori','sync',pay)}
VXP.on('territori','map',d=>{if(!d||d.w!==twWorld())return;TWX.map=d.r||{};TWX.log=d.log||[];TWX.ok=1;if(P&&P.tw&&twOn()){
    // una terra che il server dà a un altro non è più tua
    for(const k of Object.keys(P.tw.terr||{})){const r=TWX.map[k];if(r&&r.o&&r.o!==NET.name&&!(TWX.cap[k]&&Date.now()-TWX.cap[k]<15000)){delete P.tw.terr[k];twWlog(r.o+' ti ha tolto '+twZ(k).n)}}
    if(PM==='twmap')twMapDraw()}});
VXP.on('territori','negato',d=>{if(!d||!P||!P.tw)return;if(P.tw.terr[d.k]){delete P.tw.terr[d.k];msg(twZ(d.k).n+' è già di '+d.o+': per averla serve un assedio')}});
VXP.on('territori','fatti',L=>{if(!Array.isArray(L)||!P||!P.tw)return;for(const x of L){if(x.tipo==='persa'){delete P.tw.terr[x.k];twWlog(x.da+' ti ha tolto '+(x.n||twZ(x.k).n));banner('⚔ Hai perso '+(x.n||twZ(x.k).n),x.da+' l\'ha conquistata','spade')}
    else if(x.tipo==='sacco'&&P.tw.set){setAccrue();const g=Math.round((P.tw.set.cash|0)*(+x.q||.2))+Math.round(setRate()*(+x.q||.2));P.tw.set.cash=Math.max(0,(P.tw.set.cash|0)-g);twWlog(x.da+' ha saccheggiato '+P.tw.set.n+' (−'+g+'💰)');banner('🔥 '+P.tw.set.n+' saccheggiata',x.da+' ha preso '+g+' monete','spade')}}save()});
// l'assedio alle terre di un altro eroe: più guardie se ha torri e palizzata; gli insediamenti si saccheggiano
const _twConqStart722=twConqStart;twConqStart=function(){if(twCanConq()&&ZZ){const o=twOwner(ZZ.rx,ZZ.ry);if(o&&o.pl){const X=o.X,dif=X.s?X.s.dif|0:0;
    if(X.s){if(P.g<100){msg('Servono 100 monete');return}P.g-=100;OW.raid={k:Zk,o:o.pl,n:X.s.n,lv:X.s.lv|0};OW.gar={k:Zk,f:o.f,w:0,t:t+3,n:3+Math.min(4,(X.s.lv|0)+dif)};P.tw.cq={k:Zk,need:999,c:0,f:o.f,raid:1};
      banner('🔥 Saccheggio di '+X.s.n,'Batti le guardie di '+o.pl+': '+OW.gar.n+' ondate','spade');cl();save();return}
    _twConqStart722();if(P.tw.cq&&P.tw.cq.k===Zk){P.tw.cq.need=24+dif*4;delete P.ow.rep[o.f];if(OW.gar)OW.gar.n=4+Math.min(4,dif)}return}}_twConqStart722()};
const _twConqDone722=twConqDone;twConqDone=function(){const Q=P.tw.cq,k=Q&&Q.k,o=k&&twOther(k);_twConqDone722();if(k&&o&&NET.ok){TWX.cap[k]=Date.now();const f=twMyF()?twFac(twMyF()):null;VXP.send('territori','capture',{w:twWorld(),k,n:twZ(k).n,f:f?{n:f.n,cr:f.cr}:null});twWlog('Hai strappato '+twZ(k).n+' a '+o.o)}
  if(k&&P.tw.taken)delete P.tw.taken[k];twSync()};
// il saccheggio finisce quando cadono tutte le ondate
function raidTick(){const R=OW.raid,G=OW.gar;if(!R)return;if(Zk!==R.k){OW.raid=null;if(P.tw.cq&&P.tw.cq.raid)P.tw.cq=null;return}
  if(G&&G.w>=G.n&&!ents.some(e=>e.k==='en'&&/^(Guardia|Capitano)/.test(e.n||''))){OW.raid=null;OW.gar=null;P.tw.cq=null;const g=Math.round(150+R.lv*120+P.lv*10);P.g+=g;gainXP(100+R.lv*40);
    VXP.send('territori','raid',{w:twWorld(),k:R.k,q:.2});twWlog('Hai saccheggiato '+R.n+' di '+R.o+' (+'+g+'💰)');jingle([60,64,67,72,79],.1,'triangle');banner('🔥 '+R.n+' saccheggiata!','+'+g+' monete','trofeo');if(cineOK())goldFly(g);save();hud()}}
/* ---- agganci ---- */
let ASCK=0;const _upd722=upd;upd=function(dt){_upd722(dt);if(!twOn())return;if((ASCK-=dt)<=0){ASCK=4;asCheck();twSync();if(NET.ok&&twWorld()&&!TWX.hello){TWX.hello=1;VXP.send('territori','hello',{w:twWorld()})}}if(OW.asP&&t>=OW.asP){OW.asP=0;if(P.tw.as&&Zk===P.tw.as.k)asStart()}asTick(dt);raidTick()};
const _load722=load;load=function(k,from){_load722(k,from);if(!twOn()||!P.tw)return;
  if(String(Zk).startsWith('tw:')){const o=twOther(Zk);if(o&&!(P.tw.cq&&P.tw.cq.k===Zk)){for(const e of ents.slice())if(e.k==='en'&&!e.owt&&!e.bt)ents.splice(ents.indexOf(e),1);
      const F=twFac('pl:'+o.o);if(!ents.some(e=>e.k==='twbn')){const h=twHub(ZZ.rx,ZZ.ry),[x,y]=nearFree(h[0]+3,h[1]-2);ents.push({k:'twbn',n:(o.s?o.s.n+' · ':'Terre di ')+o.o,px:x+.5,py:y+.5,cr:F.cr})}msg('Sei nelle terre di '+o.o)}
    if(P.tw.taken&&P.tw.taken[Zk]&&!P.tw.terr[Zk]){const F=twFac(P.tw.taken[Zk]);if(!ents.some(e=>e.k==='twbn')){const h=twHub(ZZ.rx,ZZ.ry),[x,y]=nearFree(h[0]+3,h[1]-2);ents.push({k:'twbn',n:F.n,px:x+.5,py:y+.5,cr:F.cr})}}
    if(P.tw.as&&P.tw.as.k===Zk&&!P.tw.as.won)OW.asP=t+1.5}
  else OW.asl=null};
// il registro: la scheda della guerra
const _rgHTML722=rgHTML;rgHTML=function(){const want=RG.tab==='war';if(want)RG.tab='terr';let h=_rgHTML722();if(want)RG.tab='war';
  h=h.replace(/<\/div><\/header>/,`<button class="twtb${want?' on':''}" onclick="RG.tab='war';pn('regno')">⚔ Guerra</button></div></header>`);
  if(want){h=h.replace(/(<button class="twtb) on("[^>]*RG\.tab='terr')/,'$1$2');const a=h.indexOf('<div class="rgc">'),b=h.indexOf('<footer class="twbf">');h=h.slice(0,a)+'<div class="rgc">'+twWarHTML()+'</div>'+h.slice(b)}return h};
function twWarHTML(){const T=P.tw,A=T.as,here=twP(String(Zk).startsWith('tw:')?Zk:T.at)||[0,0];let h='';
  if(A){const F=twFac(A.f),z=twZ(A.k),p=twP(A.k),m=Math.max(0,A.until-gNow());h+=`<div class="rgcard wrA"><b>⚔ ${esc(F.n)} marcia su ${esc(z.n)}</b><small>${twDir(p[0]-here[0],p[1]-here[1])} · mancano ${Math.floor(m/60)}h${String(Math.floor(m%60)).padStart(2,'0')}</small><p>Raggiungi la regione e difendi lo stendardo dalle ${A.n} ondate. Se non arrivi in tempo, ${T.set&&T.set.k===A.k?'il borgo verrà saccheggiato':'la terra passerà a loro'}.</p><button class="pri" onclick="P.tw.wp='${A.k}';hud();cl()">🚩 Destinazione</button></div>`}
  else h+=`<p class="mu">Nessun assalto in corso. Le fazioni ostili (reputazione sotto zero) attaccano più spesso; torri e palizzata riducono i danni dei saccheggi.</p>`;
  const hostile=TWFK.filter(f=>(P.ow.rep[f]|0)<0);h+=`<h4>Fazioni ostili</h4>`+(hostile.length?`<div class="rgls">${hostile.map(f=>`<span>${crestSVG(twFac(f).cr,16)} ${esc(twFac(f).n)} <small>${P.ow.rep[f]}</small></span>`).join('')}</div>`:'<p class="mu">Nessuna.</p>');
  const oth=Object.entries(TWX.map).filter(([k,r])=>r.o!==NET.name);h+=`<h4>Le terre degli altri eroi</h4>`;
  if(!twWorld())h+=`<p class="mu">Si gioca da soli: con un codice stanza e il server, gli eroi dello stesso mondo si contendono le terre.</p>`;
  else if(!TWX.ok)h+=`<p class="mu">Il server non ha il plugin Territori: le guerre fra eroi non sono attive in questo mondo.</p>`;
  else h+=oth.length?`<div class="rgfl">${oth.slice(0,30).map(([k,r])=>{const p=twP(k),F=twFac('pl:'+r.o);return`<div class="rgf" style="--fc:${F.c}">${crestSVG(F.cr,30)}<div><b>${esc(r.s?r.s.n:twZ(k).n)}</b><small>${esc(r.o)}${r.s?' · insediamento liv. '+r.s.lv:''} · ${twDir(p[0]-here[0],p[1]-here[1])}</small></div><button onclick="P.tw.wp='${k}';hud();cl()">🚩</button></div>`}).join('')}</div>`:'<p class="mu">Nessun altro eroe ha ancora conquistato terre.</p>';
  const L=(T.wlog||[]).map(x=>`<div class="twlg">⚔ ${esc(x.tx)} <small>giorno ${x.d}</small></div>`).join('')+(TWX.log||[]).map(x=>`<div class="twlg">🌍 ${esc(x.testo)}</div>`).join('');
  h+=`<h4>Cronaca della guerra</h4>`+(L||'<p class="mu">Ancora nessuna battaglia.</p>');return h}
// la mappa: le terre sotto assalto lampeggiano
if(typeof twMapTerr==='function'){const _mt722=twMapTerr;twMapTerr=function(q,x0,x1,y0,y1,sx,sy,Z2){_mt722(q,x0,x1,y0,y1,sx,sy,Z2);const A=P.tw&&P.tw.as;if(!A)return;const p=twP(A.k);if(!p)return;
  q.save();q.strokeStyle=`rgba(255,60,40,${.5+.5*Math.sin(performance.now()/180)})`;q.lineWidth=4;q.strokeRect(sx(p[0])+3,sy(p[1])+3,Z2-6,Z2-6);q.font=`bold ${Math.round(Z2*.35)}px serif`;q.textAlign='center';q.fillStyle='#ff5a3a';q.fillText('⚔',sx(p[0])+Z2*.5,sy(p[1])+Z2*.6);q.restore()}}
// lo stendardo sotto assalto mostra la sua vita
const _ent722=ent;ent=function(e){_ent722(e);if(e&&e.k==='twbn'&&e.mx&&OW.asl&&OW.asl.bn===e&&!D3B){const sx=PX(e.px,e.py),sy=PY(e.px,e.py,0);g.fillStyle='#000a';g.fillRect(sx-24,sy-62,48,6);g.fillStyle='#ffd84a';g.fillRect(sx-24,sy-62,48*Math.max(0,e.hp/e.mx),6)}};
document.head.insertAdjacentHTML('beforeend',`<style>.wrA{border-color:#ff6a4a88!important;background:rgba(255,80,50,.08)!important}.wrA b{color:#ff9a7a}</style>`);
