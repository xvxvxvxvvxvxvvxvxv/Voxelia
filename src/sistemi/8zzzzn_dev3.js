/* ================= 8.5: IL PANNELLO SVILUPPATORE PER PROVARE TUTTO =================
   Sei schede nuove nel pannello sviluppatore (🛠, tasto F9), oltre a quelle che c'erano:
   - 📜 STORIA E MISSIONI: ogni missione secondaria si può accettare, completare o azzerare; le variabili della storia
     (fase, vero finale, capitoli segreti, luoghi aperti) si leggono e si cambiano una per una.
   - 🧪 TRUCCHI: un colpo e via, stamina infinita, abilità senza attesa, nemici che non ti vedono, attraversare i muri,
     teletrasporto con Alt+clic, pausa e avanzamento di un fotogramma, equipaggiamento leggendario, tutte le abilità.
   - 🌦 MONDO: ora e giorni, meteo e stagione (Tomorrow), qualunque pannello del gioco, tutte le musiche.
   - 🔍 DEBUG: griglia delle collisioni, raggi e percorsi dei nemici, riquadro con zona, posizione e fotogrammi,
     elenco di tutto quello che c'è nella zona (vai, elimina, guarda e cambia i campi).
   - ⌨ CONSOLE: gli errori e gli avvisi del gioco raccolti in un elenco, e una riga per eseguire codice.
   - 💾 STATI E PROVE: fotografie della partita da ricaricare quando vuoi, salvataggi da esportare e importare,
     la prova della zona (tutto è raggiungibile?) e la prova di tutte le zone una dopo l'altra.
   Vale tutto quello che valeva: sul server serve la password admin e ogni pulsante finisce nel registro. */
const DV3={ohk:0,sta:0,nocd:0,ghost:0,noclip:0,tp:1,pause:0,step:0,grid:0,ents:0,hud:0,err:[],cap:null,out:[],sel:-1,q:'',test:null,wx:'',ssn:'',pn:'',mus:'',fps:0,fn:0,ft:0,ht:0};
/* ---- gli errori del gioco, raccolti ---- */
function dv3Err(k,s){s=String(s).slice(0,300);if(DV3.cap)DV3.cap.push(k+': '+s);const L=DV3.err,l=L[L.length-1];if(l&&l.s===s){l.n++;return}let z='';try{z=Zk||''}catch(_){}L.push({k,s,n:1,t:Date.now(),z});if(L.length>200)L.shift()}
addEventListener('error',e=>dv3Err('errore',(e.message||'errore')+(e.lineno?' (riga '+e.lineno+')':'')));
addEventListener('unhandledrejection',e=>dv3Err('promessa',e.reason&&e.reason.message||e.reason));
{const w0=console.warn;console.warn=function(...a){try{dv3Err('avviso',a.map(x=>x&&x.message?x.message:String(x)).join(' '))}catch(_){}return w0.apply(console,a)}}
/* ---- i trucchi ---- */
{const h0=hurtE;hurtE=function(e,d,rem,cr){if(DV3.ohk&&DEV.on&&!rem&&e&&e.k==='en'&&d>0)d=Math.max(d,(e.mx||1)*10);return h0(e,d,rem,cr)}}
{const u0=upd;upd=function(dt){if(!DEV.on||!P||!started){u0(dt);return}
  if(DV3.pause&&!DV3.step)return;DV3.step=0;
  for(const e of ents){if(e.k!=='en')continue;if(DV3.ghost){if(e.ag0==null)e.ag0=e.ag;e.ag=0;e.al=0}else if(e.ag0!=null){e.ag=e.ag0;e.ag0=null}}
  let np=null;if(DV3.noclip&&!PM){const k=keyDir();if(k){const s=7*dt;np=[clamp(P.px+k[0]*s,.5,N-.5),clamp(P.py+k[1]*s,.5,N-.5)]}}
  const zk=Zk;u0(dt);if(!P||!started)return;
  if(np&&Zk===zk){P.px=np[0];P.py=np[1];P.path=[];P.tg=null}
  if(DV3.sta&&typeof stMax==='function')P.sta=stMax();if(DV3.nocd)P.skc={};
  const now=performance.now();if(DV3.hud&&now-DV3.ht>250){DV3.ht=now;dv3Hud()}}}
// Alt+clic: l'eroe compare dove hai cliccato
document.addEventListener('pointerdown',ev=>{if(!DEV.on||!started||!P||!DV3.tp||!ev.altKey||ev.target!==cv)return;ev.stopImmediatePropagation();ev.preventDefault();
  const[mx,my]=toWorld(ev.clientX,ev.clientY);P.px=clamp((mx/32+my/16)/2,.5,N-.5);P.py=clamp((my/16-mx/32)/2,.5,N-.5);P.path=[];P.tg=null;flt(P,'⚡','#5ad0ff')},true);
if(typeof wxAt==='function'){const w0=wxAt;wxAt=function(k){return DEV.on&&DV3.wx?DV3.wx:w0(k)}}
if(typeof wxWorld==='function'){const w0=wxWorld;wxWorld=function(){return DEV.on&&DV3.wx?DV3.wx:w0()}}
if(typeof ssnNow==='function'){const s0=ssnNow;ssnNow=function(){return(DEV.on&&DV3.ssn&&SSN.find(s=>s.k===DV3.ssn))||s0()}}
{const t0=toMenu;toMenu=function(){t0();if(!DEV.sess){DV3.pause=0;DV3.noclip=0;DV3.ghost=0;DV3.ohk=0}}}
/* ---- quello che si vede sopra il gioco: griglia, raggi, percorsi ---- */
{const d0=draw;draw=function(){d0();const now=performance.now();DV3.fn++;if(now-DV3.ft>500){DV3.fps=Math.round(DV3.fn*1000/(now-DV3.ft));DV3.fn=0;DV3.ft=now}
  if(!DEV.on||!started||!P||!(DV3.grid||DV3.ents)||(typeof D3B!=='undefined'&&D3B))return;try{dv3Over()}catch(e){}}}
const DV3C={en:'#ff5a5a',npc:'#5ad0ff',po:'#ffd84a',pl:'#7aff7a'};
function dv3Over(){g.save();g.setTransform(S*DPR,0,0,S*DPR,(W/2-camX*S)*DPR,(H/2-camY*S)*DPR);const cx=P.px|0,cy=P.py|0,R=18;
  if(DV3.grid){g.lineWidth=.5;for(let y=Math.max(0,cy-R);y<=Math.min(N-1,cy+R);y++)for(let x=Math.max(0,cx-R);x<=Math.min(N-1,cx+R);x++){const c=M[y][x],w=WK(c);
      g.beginPath();g.moveTo(PX(x,y),PY(x,y,0));g.lineTo(PX(x+1,y),PY(x+1,y,0));g.lineTo(PX(x+1,y+1),PY(x+1,y+1,0));g.lineTo(PX(x,y+1),PY(x,y+1,0));g.closePath();
      g.fillStyle=w?'rgba(60,255,120,.10)':c===2?'rgba(60,140,255,.38)':'rgba(255,50,50,.34)';g.fill();g.strokeStyle='rgba(255,255,255,.14)';g.stroke()}
    g.strokeStyle='#fff';g.lineWidth=1.5;g.beginPath();g.moveTo(PX(cx,cy),PY(cx,cy,0));g.lineTo(PX(cx+1,cy),PY(cx+1,cy,0));g.lineTo(PX(cx+1,cy+1),PY(cx+1,cy+1,0));g.lineTo(PX(cx,cy+1),PY(cx,cy+1,0));g.closePath();g.stroke()}
  if(DV3.ents){const line=(a,L,col)=>{if(!L||!L.length)return;g.strokeStyle=col;g.lineWidth=1.5;g.setLineDash([4,3]);g.beginPath();g.moveTo(PX(a.px,a.py),PY(a.px,a.py,0));for(const w of L)g.lineTo(PX(w.x+.5,w.y+.5),PY(w.x+.5,w.y+.5,0));g.stroke();g.setLineDash([])};
    line(P,P.path,'#7aff7a');g.font='bold 8px monospace';g.textAlign='center';
    for(const e of ents){if(e.px==null||Math.abs(e.px-P.px)>R||Math.abs(e.py-P.py)>R)continue;const x=PX(e.px,e.py),y=PY(e.px,e.py,0),col=DV3C[e.k]||'#c8c8c8';
      if(e.k==='en'){const ag=e.ag0!=null?e.ag0:e.ag;g.strokeStyle=e.al?'rgba(255,60,60,.9)':'rgba(255,170,60,.55)';g.lineWidth=1;g.beginPath();g.ellipse(x,y,ag*45.25,ag*22.6,0,0,6.283);g.stroke();
        if(e.r){g.strokeStyle='rgba(255,255,255,.5)';g.beginPath();g.ellipse(x,y,e.r*45.25,e.r*22.6,0,0,6.283);g.stroke()}}
      if(e.path)line(e,e.path,col);g.fillStyle=col;g.beginPath();g.arc(x,y,2.5,0,6.283);g.fill();
      const tx=e.k+(e.t?':'+e.t:e.nid?':'+e.nid:e.st?':'+e.st:e.to?'→'+e.to:'')+(e.hp!=null&&e.mx?' '+Math.ceil(e.hp)+'/'+e.mx:'')+(e.k==='en'&&e.lv?' L'+e.lv:'');
      g.lineWidth=2.5;g.strokeStyle='#000c';g.strokeText(tx,x,y+11);g.fillText(tx,x,y+11)}}
  g.restore()}
function dv3Hud(){let el=$('dv3hud');if(!DV3.hud||!started||!P){if(el)el.hidden=true;return}if(!el){el=document.createElement('pre');el.id='dv3hud';document.body.appendChild(el)}el.hidden=false;
  const x=P.px|0,y=P.py|0,c=M[y]&&M[y][x],k={};for(const e of ents)k[e.k]=(k[e.k]|0)+1;
  el.textContent=`zona  ${Zk} · ${(ZZ&&ZZ.n)||''}\nliv.  ${(ZZ&&ZZ.lv)|0}   mappa ${N}×${N}\neroe  ${P.px.toFixed(2)}, ${P.py.toFixed(2)}   casella ${x},${y}\nsuolo ${c}${WK(c)?' (libera)':' (chiusa)'}   arredo ${JSON.stringify(DEC[y]&&DEC[y][x]||'')}\ncose  ${Object.entries(k).map(([a,b])=>a+' '+b).join(' · ')}\nstoria fase ${P.st|0} · finale ${P.te|0} · missioni ${P.q.length}\nfps   ${DV3.fps}   musica ${AU.tr||''}\nerrori ${DV3.err.length}${DV3.pause?'   ⏸ IN PAUSA':''}`}
/* ---- le schede ---- */
const dv3Need=()=>`<p>Avvia prima una partita (o entra in una zona dalla scheda 🗺 Zone).</p><button onclick="devStart();devRender()">▶ Partita di prova ad Aldoria</button>`;
const dv3Chk=(k,n,d)=>`<div class="dvr"><span>${n}${d?`<br><small class="mu">${d}</small>`:''}</span><input type="checkbox" ${DV3[k]?'checked':''} onchange="DV3['${k}']=this.checked?1:0;dv3Hud();devRender()"></div>`;
// storia e missioni
const DV3V=[['st','Fase della storia (0-5)'],['te','Vero finale (0 no · 1 avviato · 2 visto)'],['s7','Capitolo dei pirati'],['key','Chiave delle prigioni'],['tru','Tesoro del Capitano'],['sec','Passaggi segreti'],['dreamt','Sogni fatti'],['slp','Notti dormite'],['hc','Sfida'],['kills','Nemici sconfitti'],['unl','Luoghi aperti'],['runs','Dungeon vinti'],['done','Cose fatte'],['seen','Cose viste']];
function dv3QNpc(id){for(const n in NPCS)if(NPCS[n].qs&&NPCS[n].qs.includes(id))return n;return''}
function dv3Q(id,a){const T=QT[id];if(!T)return;let q=P.q.find(x=>x.id===id);
  if(a==='r'){if(q)P.q.splice(P.q.indexOf(q),1);delete P.qd[id];dvSay('Azzerata: '+T.ti);npcMarks();return}
  if(!q){q={id,npc:dv3QNpc(id),c:0};P.q.push(q)}if(a==='a'){npcMarks();dvSay('Accettata: '+T.ti);return}
  q.c=T.n||1;try{qTurn(q)}catch(e){dv3Err('missione',e.message)}devRender()}
function dv3QAll(){let n=0;for(const id in QT){if(P.qd[id])continue;try{dv3Q(id,'c');n++}catch(e){}}dvSay(n+' missioni completate')}
function dv3Var(k,v){try{P[k]=JSON.parse(v)}catch(e){msg('⚠ Valore non valido (serve un numero o un JSON)');return}try{npcMarks();recalc()}catch(e){}dvSay('P.'+k+' cambiato')}
function dv3Story(){if(!started||!P)return dv3Need();const ids=Object.keys(QT),done=ids.filter(id=>P.qd[id]).length;
  let h=`<h4>📜 Missioni secondarie <span class="mu">${done}/${ids.length} fatte · ${P.q.length} in corso</span></h4><div class="dvr"><span>Tutte insieme</span><span><button onclick="dv3QAll()">Completa tutte</button><button class="danger" onclick="P.q=[];P.qd={};P.qi={};npcMarks();dvSay('Missioni azzerate')">Azzera tutte</button></span></div><div class="dv3q">`;
  for(const id of ids){const T=QT[id],q=P.q.find(x=>x.id===id),n=dv3QNpc(id),who=n&&NPCS[n]?NPCS[n].n:'';h+=`<div class="${P.qd[id]?'ok':q?'on':''}"><b>${esc(T.ti)}</b><small>${esc(id)}${who?' · '+esc(who):''}${T.lv?' · liv. '+T.lv:''} · ${q?'in corso '+q.c+'/'+(T.n||1):P.qd[id]?'fatta ×'+P.qd[id]:'mai presa'}</small><span>${q?'':`<button onclick="dv3Q('${id}','a')">Accetta</button>`}<button onclick="dv3Q('${id}','c')">Completa</button><button onclick="dv3Q('${id}','r')">Azzera</button></span></div>`}
  h+=`</div><h4>🧭 Variabili della storia</h4><p class="mu">Il valore si scrive come numero o come JSON, poi Invio. Cambiano subito i segnali sopra i personaggi.</p>`;
  for(const[k,n]of DV3V){const v=JSON.stringify(P[k]===undefined?null:P[k]);h+=`<div class="dvr"><span>${n} <small class="mu">P.${k}</small></span><input class="dv3i" value="${esc(v&&v.length>200?v.slice(0,200):v)}" ${v&&v.length>200?'disabled title="Troppo lungo: usa la Console"':''} onchange="dv3Var('${k}',this.value)"></div>`}
  return h}
// trucchi
function dv3Gear(){for(const s of 'whcs')P.eq[s]=item(Math.max(1,P.lv),3,s);recalc();P.hp=P.mx;dvSay('Equipaggiamento leggendario del livello '+P.lv)}
function dv3Skills(){P.skl=P.skl||{};let n=0;for(const s of SKL){if(!P.skl[s.id]){P.skl[s.id]=1;n++}}dvSay(n?n+' abilità imparate':'Le avevi già tutte')}
function dv3Cheat(){if(!started||!P)return dv3Need();
  return`<h4>⚔ Combattimento</h4><div class="dvr"><span>Invincibile</span><input type="checkbox" ${DEV.god?'checked':''} onchange="DEV.god=this.checked?1:0"></div>`+dv3Chk('ohk','Un colpo e via','Ogni tuo colpo abbatte il nemico')+dv3Chk('sta','Stamina infinita')+dv3Chk('nocd','Abilità senza attesa')+dv3Chk('ghost','I nemici non ti vedono','Restano fermi dove sono finché non lo togli')+
  `<div class="dvr"><span>Equipaggiamento</span><span><button onclick="dv3Gear()">⚔ Tutto leggendario</button><button onclick="dv3Skills()">✨ Tutte le abilità</button><button onclick="P.hp=P.mx;hud()">✚ Cura</button></span></div>
  <h4>🏃 Movimento</h4>`+dv3Chk('noclip','Attraversa i muri','Con WASD o le frecce cammini su qualunque casella')+dv3Chk('tp','Teletrasporto con Alt+clic','Tieni premuto Alt e clicca un punto della mappa')+
  `<h4>⏱ Tempo</h4><div class="dvr"><span>Velocità del gioco ×${DEV.speed}</span><span>${[.25,.5,1,2,4,8].map(v=>`<button class="${DEV.speed===v?'on':''}" onclick="DEV.speed=${v};devRender()">×${v}</button>`).join('')}</span></div>
  <div class="dvr"><span>Pausa ${DV3.pause?'<b>⏸ attiva</b>':''}</span><span><button class="${DV3.pause?'on':''}" onclick="DV3.pause=DV3.pause?0:1;devRender()">${DV3.pause?'▶ Riprendi':'⏸ Ferma il gioco'}</button><button onclick="DV3.pause=1;DV3.step=1;devRender()">⏭ Un fotogramma</button></span></div>`}
// mondo
function dv3Tracks(){const L=Object.keys(TRK);try{for(const k of Object.keys(BSONG))if(!L.includes(k))L.push(k)}catch(e){}return L.sort()}
function dv3Pn(k){if(!k)return;devClose();try{pn(k)}catch(e){msg('⚠ Questo pannello ha bisogno del suo personaggio o del suo posto: '+e.message)}}
function dv3World(){if(!started||!P)return dv3Need();const tw=typeof twOn==='function'&&twOn(),PN=Object.keys(X43P).sort(),TR=dv3Tracks();
  let h=`<h4>🕒 Tempo</h4><div class="dvr"><span>Ora del giorno</span><span>${[[6,'🌅 Alba'],[12,'☀ Giorno'],[19,'🌇 Tramonto'],[23,'🌙 Notte']].map(([a,n])=>`<button onclick="devHour(${a})">${n}</button>`).join('')}</span></div>
  <div class="dvr"><span>Giorno ${typeof gDay==='function'?gDay():''}</span><span><button onclick="P.gt=(P.gt||0)+1440;if(NET)NET.tm=null;timeTick(0);dvSay('+1 giorno')">+1 giorno</button><button onclick="P.gt=(P.gt||0)+10080;if(NET)NET.tm=null;timeTick(0);dvSay('+7 giorni')">+7 giorni</button></span></div>`;
  if(typeof WXT!=='undefined')h+=`<h4>🌦 Meteo e stagione <span class="mu">${tw?'':'si vedono in Tomorrow'}</span></h4><div class="dvr"><span>Meteo</span><select onchange="DV3.wx=this.value;devRender()"><option value="">Quello del gioco</option>${dvOpt(Object.keys(WXT).map(k=>[k,WXT[k].ic+' '+WXT[k].n]),DV3.wx)}</select></div>
  <div class="dvr"><span>Stagione</span><select onchange="DV3.ssn=this.value;devRender()"><option value="">Quella del gioco</option>${dvOpt(SSN.map(s=>[s.k,s.ic+' '+s.n]),DV3.ssn)}</select></div>`;
  h+=`<h4>🪟 Pannelli</h4><div class="dvr"><span>Apri un pannello del gioco</span><span><select onchange="DV3.pn=this.value"><option value="">Scegli…</option>${dvOpt(PN.map(k=>[k,k]),DV3.pn)}</select><button onclick="dv3Pn(DV3.pn)">Apri</button></span></div>
  <div class="dvr"><span>I più usati</span><span>${[['inv','🎒 Zaino'],['shop','🛒 Negozio'],['q','📜 Missioni'],['map','🗺 Mappa']].map(([k,n])=>`<button onclick="dv3Pn('${k}')">${n}</button>`).join('')}</span></div>
  <h4>🎵 Musiche <span class="mu">${TR.length} brani · ora ${esc(AU.tr||'nessuno')}</span></h4><div class="dvr"><span>Ascolta un brano</span><span><select onchange="DV3.mus=this.value"><option value="">Scegli…</option>${dvOpt(TR.map(k=>[k,k]),DV3.mus)}</select><button onclick="if(DV3.mus){auInit();music(DV3.mus);dvSay('♪ '+DV3.mus)}">▶ Suona</button><button onclick="music(zoneMus());dvSay('Musica della zona')">↺ Quella della zona</button></span></div>`;
  return h}
// debug
function dv3List(){const q=DV3.q.toLowerCase();return ents.map((e,i)=>[e,i]).filter(([e])=>!q||(e.k+' '+(e.t||'')+' '+(e.nid||'')+' '+(e.n||'')+' '+(e.to||'')).toLowerCase().includes(q))}
function dv3Goto(i){const e=ents[i];if(!e)return;const[x,y]=nearFree(e.px|0,e.py|0);P.px=x+.5;P.py=y+.5;P.path=[];P.tg=null;devClose()}
function dv3Del(i){const e=ents[i];if(!e)return;ents.splice(i,1);DV3.sel=-1;dvSay('Tolto: '+(e.n||e.k))}
function dv3Fmt(v){if(v===undefined)return'undefined';if(typeof v==='function')return'[funzione '+(v.name||'')+']';try{const seen=new Set();const s=JSON.stringify(v,(k,x)=>{if(typeof x==='function')return'[funzione]';if(x&&typeof x==='object'){if(seen.has(x))return'[già visto]';seen.add(x);if(k==='m'&&(x.rg||x.g||Array.isArray(x)))return'[modello]'}return x},1);return s==null?String(v):s.length>4000?s.slice(0,4000)+'\n…':s}catch(e){return String(v)}}
function dv3Set(i,tx){const e=ents[i],m=/^\s*([A-Za-z_$][\w$]*)\s*=\s*(.+)$/.exec(tx);if(!e||!m){msg('⚠ Scrivi: campo = valore');return}try{e[m[1]]=JSON.parse(m[2])}catch(err){msg('⚠ Valore non valido');return}dvSay((e.n||e.k)+'.'+m[1]+' cambiato')}
function dv3Debug(){if(!started||!P)return dv3Need();const L=dv3List(),e=ents[DV3.sel];
  let h=`<h4>👁 Sopra il gioco</h4>`+dv3Chk('grid','Griglia delle collisioni','Verde: si cammina · rosso: chiuso · blu: acqua')+dv3Chk('ents','Nemici, personaggi e percorsi','Raggio di vista e di attacco, percorsi, nome e vita di ogni cosa')+dv3Chk('hud','Riquadro con zona, posizione e fotogrammi')+
  `<div class="dvr"><span>Contatore FPS del gioco</span><input type="checkbox" ${SET.fps?'checked':''} onchange="setv('fps',this.checked?1:0)"></div>
  <h4>📦 Nella zona <span class="mu">${ents.length} cose · ${esc(Zk)}</span></h4><input id="dvq" placeholder="🔍 Cerca per tipo o nome (en, npc, po, lupo…)" value="${esc(DV3.q)}" oninput="DV3.q=this.value;DEV.qf=1;devRender()"><div class="dv3e">`;
  for(const[x,i]of L.slice(0,120))h+=`<div class="${i===DV3.sel?'on':''}"><span><b>${esc(x.k)}</b> ${esc(String(x.n||x.t||x.nid||x.st||x.to||''))} <small class="mu">${x.px!=null?(x.px|0)+','+(x.py|0):''}${x.hp!=null&&x.mx?' · '+Math.ceil(x.hp)+'/'+x.mx:''}</small></span><span><button onclick="dv3Goto(${i})">Vai</button><button onclick="DV3.sel=${i};devRender()">{ }</button><button class="danger" onclick="dv3Del(${i})">✕</button></span></div>`;
  h+=`</div>${L.length>120?`<p class="mu">Ne vedi 120 su ${L.length}: restringi con la ricerca.</p>`:''}`;
  if(e)h+=`<h4>{ } ${esc(String(e.n||e.k))}</h4><div class="dvr"><span>Cambia un campo</span><form onsubmit="event.preventDefault();dv3Set(${DV3.sel},this.c.value)" style="display:flex;gap:4px"><input class="dv3i" name="c" autocomplete="off" placeholder="hp = 10"><button>Imposta</button></form></div><pre class="dv3p">${esc(dv3Fmt(e))}</pre>`;
  return h}
// console
function dv3Run(code){code=String(code||'').trim();if(!code)return;let out;try{out=dv3Fmt((0,eval)(code))}catch(e){out='⚠ '+e.message}DV3.out.push([code,out]);if(DV3.out.length>30)DV3.out.shift();devUse('console · '+code.slice(0,80));DEV.qf=0;devRender();const i=$('dv3in');if(i)i.focus()}
function dv3Console(){const E2=DV3.err.slice(-40).reverse();
  return`<h4>⌨ Esegui codice</h4><p class="mu">Una riga di JavaScript con tutto il gioco a portata di mano: <code>P.lv</code>, <code>ents.length</code>, <code>load('forest','town')</code>, <code>banner('Ciao','prova','stella')</code>.</p>
  <form class="dvr dvf" onsubmit="event.preventDefault();dv3Run(this.c.value)"><input class="dv3i dv3w" id="dv3in" name="c" autocomplete="off" spellcheck="false" placeholder="P.g += 500"><button class="gold">Esegui</button><button type="button" onclick="DV3.out=[];devRender()">Pulisci</button></form>
  <pre class="dv3p">${DV3.out.length?DV3.out.slice().reverse().map(([c,o])=>'› '+esc(c)+'\n'+esc(o)).join('\n\n'):'Qui compare il risultato.'}</pre>
  <h4>🐞 Errori e avvisi del gioco <span class="mu">${DV3.err.length}</span></h4><div class="dvr"><span>Raccolti da quando hai aperto la pagina</span><span><button onclick="navigator.clipboard&&navigator.clipboard.writeText(DV3.err.map(e=>e.k+' ['+e.z+'] '+e.s+(e.n>1?' ×'+e.n:'')).join('\\n'));dvSay('Copiati')">Copia</button><button onclick="DV3.err=[];devRender()">Svuota</button></span></div>
  <pre class="dv3p">${E2.length?E2.map(e=>new Date(e.t).toLocaleTimeString('it-IT')+' · '+e.k+(e.z?' ['+e.z+']':'')+(e.n>1?' ×'+e.n:'')+'\n  '+esc(e.s)).join('\n'):'Nessun errore: bene così.'}</pre>`}
/* ---- stati, salvataggi, prove ---- */
const DV3SK='voxelia_devstati';
const dv3States=()=>LS.get(DV3SK,[])||[];
function dv3Snap(){const cap={},s0=LS.set,ds=DEV.sess;LS.set=function(k,v){try{cap[k]=JSON.parse(JSON.stringify(v))}catch(e){}};DEV.sess=0;try{save()}catch(e){}finally{LS.set=s0;DEV.sess=ds}
  const ow=typeof OW!=='undefined'&&OW.on?1:0,s=cap[ow?OWK:SAVEK];if(!s)return null;s.code='';return{ow,s,zk:Zk,x:P.px,y:P.py,t:Date.now()}}
function dv3Save(){if(!started||!P)return;const st=dv3Snap();if(!st){dvSay('Questa partita non si può fotografare');return}const L=dv3States();st.n=(window.prompt('Nome dello stato',((ZZ&&ZZ.n)||Zk)+' · liv. '+P.lv)||'').slice(0,40)||((ZZ&&ZZ.n)||Zk);L.unshift(st);while(L.length>8)L.pop();LS.set(DV3SK,L);dvSay('Stato salvato: '+st.n)}
function dv3Load(i){const st=dv3States()[i];if(!st)return;devClose();if(started)toMenu();DEV.sess=1;devMark();const rc=$('rc'),rv=rc?rc.value:'';if(rc)rc.value='';const tv=LS.get('voxelia_tour',0);LS.set('voxelia_tour',1);const s=JSON.parse(JSON.stringify(st.s));
  try{if(st.ow)owGo(s.df|0,s);else begin(s.df|0,s)}finally{if(rc)rc.value=rv;if(!tv)LS.del('voxelia_tour')}
  for(let k=0;k<5;k++){try{introEnd()}catch(e){}try{cineSkip()}catch(e){}}try{cl()}catch(e){}
  setTimeout(()=>{if(!started)return;try{cl();cineOff();if(Zk!==st.zk)load(st.zk,Zk||'town');P.px=st.x;P.py=st.y;P.path=[];camX=PX(P.px,P.py);camY=PY(P.px,P.py,10);msg('🛠 Stato caricato: '+st.n+' · partita di prova, non si salva')}catch(e){msg('⚠ '+e.message)}},120)}
function dv3Export(){const o={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.startsWith('voxelia'))o[k]=localStorage.getItem(k)}
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify({voxelia:GAME_VER,quando:new Date().toISOString(),dati:o})],{type:'application/json'}));a.download='voxelia_salvataggi_'+new Date().toISOString().slice(0,10)+'.json';document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500);dvSay(Object.keys(o).length+' voci esportate')}
function dv3Import(f){if(!f)return;const r=new FileReader();r.onload=()=>{let o;try{o=JSON.parse(r.result)}catch(e){msg('⚠ Il file non è un salvataggio di Voxelia');return}const d=o&&o.dati;if(!d||typeof d!=='object'){msg('⚠ Il file non è un salvataggio di Voxelia');return}
    const ks=Object.keys(d).filter(k=>k.startsWith('voxelia'));if(!confirm('Importare '+ks.length+' voci (versione '+(o.voxelia||'?')+')? I salvataggi di adesso verranno sostituiti e la pagina si ricarica.'))return;for(const k of ks)try{localStorage.setItem(k,String(d[k]))}catch(e){}location.reload()};r.readAsText(f)}
// la prova di una zona: da dove sei, si arriva a tutto?
function dv3Check(){const r={z:Zk,n:(ZZ&&ZZ.n)||Zk,bad:[],err:[],ents:ents.length};const sx=clamp(P.px|0,0,N-1),sy=clamp(P.py|0,0,N-1);if(!WK(M[sy][sx]))r.bad.push('l\'eroe parte su una casella chiusa ('+sx+','+sy+')');
  const d=bfs(sx,sy),near=(x,y,q=1)=>{for(let b=-q;b<=q;b++)for(let a=-q;a<=q;a++){const u=x+a,v=y+b;if(u>=0&&v>=0&&u<N&&v<N&&d[v*N+u]>=0)return true}return false};let reach=0;for(let i=0;i<d.length;i++)if(d[i]>=0)reach++;r.reach=reach;
  for(const e of ents){if(e.px==null)continue;if(!isFinite(e.px)||!isFinite(e.py)){r.bad.push(e.k+' '+(e.n||e.t||'')+': posizione non valida');continue}const x=e.px|0,y=e.py|0;
    if(x<0||y<0||x>=N||y>=N){if(e.k==='en'||e.k==='npc'||e.k==='po')r.bad.push(e.k+' '+(e.n||e.t||'')+': fuori dalla mappa ('+x+','+y+')');continue}
    if(e.k==='en'&&(!isFinite(e.hp)||!isFinite(e.at)||!e.m))r.bad.push('nemico '+(e.n||e.t)+': vita, attacco o modello mancanti');
    // gli animali nei recinti e gli accampamenti stanno apposta dietro uno steccato: per personaggi e nemici bastano 3 caselle
    if((e.k==='po'||e.k==='npc'||(e.k==='en'&&!e.boss))&&!near(x,y,e.k==='po'?1:3))r.bad.push((e.k==='po'?'passaggio':e.k==='npc'?'personaggio':'nemico')+' «'+(e.n||e.t||e.to||'')+'» non raggiungibile ('+x+','+y+')')}
  return r}
function dv3TestHere(){if(!started||!P)return;DV3.cap=[];const pz=DV3.pause;DV3.pause=0;let r;try{for(let i=0;i<15;i++)upd(1/30);draw();r=dv3Check()}catch(e){r={z:Zk,n:Zk,bad:['ERRORE: '+e.message],err:[]}}DV3.pause=pz;r.err=[...new Set(DV3.cap)];DV3.cap=null;DV3.test={n:1,i:1,done:1,res:[r],one:1,sec:0};devRender()}
async function dv3TestAll(){if(!DEV.sess){msg('La prova di tutte le zone si fa in una partita di prova');return}const C=devZones(),L=[];for(const c in C)for(const[k,n]of C[c])if(k!=='mare'&&!k.startsWith('dim_')&&k!=='cuore80')L.push([k,n]);
  const T=DV3.test={n:L.length,i:0,res:[],run:1,t0:performance.now()},god=DEV.god,pz=DV3.pause;DEV.god=1;DV3.pause=0;devRender();
  for(const[k,n]of L){if(!T.run||!started)break;DV3.cap=[];let r;try{try{cl();cineOff()}catch(e){}load(k,'town');for(let i=0;i<15;i++)upd(1/30);try{cl()}catch(e){}draw();r=dv3Check()}catch(e){r={z:k,n,bad:['ERRORE: '+e.message],err:[]}}
    r.n=n;r.err=[...new Set(DV3.cap)];DV3.cap=null;if(r.err.length||r.bad.length)T.res.push(r);T.i++;if(T.i%2===0){const b=$('dv3bar');if(b){b.style.width=(T.i/T.n*100)+'%';const l=$('dv3lab');if(l)l.textContent=T.i+'/'+T.n+' · '+n}await new Promise(q=>setTimeout(q,0))}}
  T.run=0;T.done=1;T.sec=Math.round((performance.now()-T.t0)/1000);DEV.god=god;DV3.pause=pz;try{cl();cineOff();load('town');cl()}catch(e){}DEV.tab='sv3';devOpen()}
function dv3Tests(){const L=dv3States(),T=DV3.test;
  let h=`<h4>📸 Stati della partita <span class="mu">${L.length}/8</span></h4><p class="mu">Una fotografia di eroe, zaino, missioni, storia e posizione. Quando la ricarichi parte una partita di prova, che non tocca i salvataggi veri.</p>
  <div class="dvr"><span>Dove sei adesso</span><button class="gold" onclick="dv3Save()" ${started&&P?'':'disabled'}>📸 Salva questo stato</button></div>`;
  L.forEach((s,i)=>{h+=`<div class="dvr"><span><b>${esc(s.n)}</b><br><small class="mu">${s.ow?'Tomorrow':'Storia'} · ${esc(s.zk)} · livello ${(s.s.p&&s.s.p.lv)|0} · ${new Date(s.t).toLocaleString('it-IT')}</small></span><span><button onclick="dv3Load(${i})">▶ Carica</button><button class="danger" onclick="const L=dv3States();L.splice(${i},1);LS.set(DV3SK,L);devRender()">✕</button></span></div>`});
  h+=`<h4>💾 Salvataggi veri</h4><div class="dvr"><span>Tutti i dati di Voxelia in questo browser<br><small class="mu">Per passare a un altro una partita con un difetto da riprodurre</small></span><span><button onclick="dv3Export()">⬇ Esporta</button><button onclick="$('dv3file').click()">⬆ Importa</button><input type="file" id="dv3file" accept=".json,application/json" hidden onchange="dv3Import(this.files[0])"></span></div>
  <h4>✅ Prove</h4><div class="dvr"><span>La zona dove sei<br><small class="mu">Passaggi, personaggi e nemici si raggiungono? Ci sono errori?</small></span><button onclick="dv3TestHere()" ${started&&P?'':'disabled'}>Prova questa zona</button></div>
  <div class="dvr"><span>Tutte le zone, una dopo l'altra<br><small class="mu">Le carica, le fa girare e le disegna. Solo in una partita di prova.</small></span>${T&&T.run?`<button class="danger" onclick="DV3.test.run=0">Ferma</button>`:DEV.sess?`<button class="gold" onclick="dv3TestAll()">▶ Prova tutte le zone</button>`:`<button onclick="if(started)toMenu();devStart();dv3TestAll()">▶ Avvia una partita di prova e prova tutto</button>`}</div>`;
  if(T&&T.run)h+=`<div class="dv3bar"><i id="dv3bar" style="width:${T.i/T.n*100}%"></i></div><p class="mu" id="dv3lab">${T.i}/${T.n}</p>`;
  if(T&&T.done){h+=`<p class="${T.res.length?'dverr':'dv3ok'}">${T.one?(T.res[0].bad.length||T.res[0].err.length?'':'✔ '+esc(T.res[0].n)+': tutto raggiungibile, nessun errore · '+T.res[0].ents+' cose, '+T.res[0].reach+' caselle libere'):(T.res.length?'⚠ '+T.res.length+' zone da guardare su '+T.i:'✔ '+T.i+' zone provate, nessun problema')+' · '+T.sec+' s'}</p>`;
    for(const r of T.res){if(!r.bad.length&&!r.err.length)continue;h+=`<div class="dv3r"><b>${esc(r.n)}</b> <small class="mu">${esc(r.z)}</small> <button onclick="devGo(${esc(JSON.stringify(r.z))})">Vai</button><ul>${r.bad.concat(r.err).slice(0,12).map(x=>'<li>'+esc(x)+'</li>').join('')}</ul></div>`}}
  return h}
{const b0=devBody;devBody=function(){switch(DEV.tab){case'st3':return dv3Story();case'ch3':return dv3Cheat();case'wd3':return dv3World();case'dbg3':return dv3Debug();case'con3':return dv3Console();case'sv3':return dv3Tests()}return b0()}}
{const r0=devRender;devRender=function(){r0();const el=$('devp'),bar=el&&el.querySelector('.dvt');if(!bar||bar.querySelector('[data-dv3]'))return;
  for(const[k,n]of[['st3','📜 Storia e missioni'],['ch3','🧪 Trucchi'],['wd3','🌦 Mondo'],['dbg3','🔍 Debug'],['con3','⌨ Console'+(DV3.err.length?' ('+DV3.err.length+')':'')],['sv3','💾 Stati e prove']]){const b=document.createElement('button');b.dataset.dv3=k;b.textContent=n;b.className=DEV.tab===k?'on':'';b.onclick=()=>{DEV.tab=k;DEV.qf=0;devRender()};bar.appendChild(b)}}}
document.head.insertAdjacentHTML('beforeend',`<style>#devp .dvb{width:min(880px,97vw)}#devp .dv3i{padding:5px 7px;border-radius:6px;border:1px solid #ffffff33;background:#1c1a24;color:#fff;font:12px ui-monospace,Menlo,Consolas,monospace;min-width:150px}#devp .dv3w{flex:1;min-width:200px}
#devp .dv3p{margin:6px 0;padding:8px;border-radius:8px;background:#05070e;border:1px solid #ffffff18;color:#bfe8ff;font:11px/1.45 ui-monospace,Menlo,Consolas,monospace;white-space:pre-wrap;word-break:break-word;max-height:260px;overflow:auto}
#devp .dv3q{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:5px;margin:6px 0}#devp .dv3q>div{display:flex;flex-direction:column;gap:3px;padding:6px 8px;border-radius:7px;background:#ffffff0d;border-left:3px solid #ffffff22}#devp .dv3q>div.on{border-left-color:#ffd84a}#devp .dv3q>div.ok{border-left-color:#5ae08a}#devp .dv3q small{opacity:.7}#devp .dv3q span{display:flex;gap:4px;flex-wrap:wrap}
#devp .dv3e{display:flex;flex-direction:column;gap:2px;margin:6px 0;max-height:300px;overflow:auto}#devp .dv3e>div{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:3px 6px;border-radius:6px;background:#ffffff0a}#devp .dv3e>div.on{background:#5ad0ff22}#devp .dv3e span{display:flex;gap:4px;align-items:center}
#devp .dv3bar{height:8px;border-radius:4px;background:#ffffff18;overflow:hidden;margin:8px 0 2px}#devp .dv3bar i{display:block;height:100%;background:#5ad0ff;transition:width .2s}#devp .dv3ok{color:#7aff9a}#devp .dv3r{margin:6px 0;padding:6px 8px;border-radius:7px;background:#ff5a5a14;border-left:3px solid #ff8a8a}#devp .dv3r ul{margin:4px 0 0;padding-left:18px;font-size:12px}
#devp code{background:#ffffff14;padding:1px 4px;border-radius:4px;font-size:11px}#devp button.on{background:#5ad0ff;color:#06202c}
#dv3hud{position:fixed;left:8px;top:132px;z-index:25;margin:0;padding:6px 9px;border-radius:8px;background:#05070ecc;border:1px solid #5ad0ff88;color:#bfe8ff;font:11px/1.4 ui-monospace,Menlo,Consolas,monospace;pointer-events:none;max-width:min(430px,92vw);white-space:pre-wrap}#dv3hud[hidden]{display:none}</style>`);
