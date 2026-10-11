/* ================= interfaccia ================= */
let mtm;function msg(s){const m=$('msg');m.textContent=s;m.style.display='block';clearTimeout(mtm);mtm=setTimeout(()=>m.style.display='none',3200)}
const DGH={tana:'nella Foresta di Elmwood (porta nord)',cripta:'nel cimitero a sud-ovest della città',piramide:'nel Deserto di Khem (porta est)',cristallo:'sui Picchi Gelidi (porta ovest)',fucina:'sui Picchi Gelidi, più lontano',abisso:'nel Porto di Aldoria, giù per il pozzo pieno di alghe sulla banchina',cittadella:'nella sala del trono del castello'};
function storyObj(short){switch(P.st){case 0:return'Parla con il Re Aldric nel castello (nord-ovest)';case 1:return'Recupera i frammenti della Corona: '+P.sh.length+'/6';case 2:return'Riporta i sei frammenti al Re Aldric';
  case 3:return short?'Sconfiggi Malakar nella Cittadella':'Entra nel portale della sala del trono e sconfiggi Malakar nella Cittadella del Vuoto';case 4:return'Torna dal Re Aldric';default:return short?'':'Storia completata! I dungeon continuano a rigenerarsi, sempre più forti.'}}
const qProg=q=>{const T=QT[q.id];if(T.t==='step')return q.c?'torna dal Moreau':T.pg;return T.t==='talk'?(q.c?'torna da '+NPCS[q.npc].n:'parla con '+NPCS[T.to].n):q.c+'/'+(T.n||1)};
let HUDh='',QTh='';
function hud(){if(!P||!DF)return;skBar();const I=ico,cd=(n,v)=>`<span>${I(n)}${v}</span>`;
  const net=NET.code?`<div class="st">${NET.ok?`<span>${I('gente')}${NET.list.length+1} qui · stanza ${esc(NET.code)} ${pingTag(NET.ping)}</span>`+(NET.cfg.xpm>1||NET.cfg.gm>1?`<b style="color:#ffd84a">${I('stella')}Evento: ${NET.cfg.xpm>1?'XP ×'+NET.cfg.xpm:''}${NET.cfg.xpm>1&&NET.cfg.gm>1?' · ':''}${NET.cfg.gm>1?'oro ×'+NET.cfg.gm:''}</b>`:''):esc(NET.st)}</div>`:'';
  let c='';if(P.sk>0)c+=cd('esplosione',Math.ceil(P.sk)+'s');if(P.dgc>0)c+=cd('vortice',P.dgc.toFixed(1)+'s');if(P.lgc>0)c+=cd('pugnale',P.lgc.toFixed(1)+'s');if(P.bA>0)c+=cd('forza',Math.ceil(P.bA)+'s');if(P.bD>0)c+=cd('pietra',Math.ceil(P.bD)+'s');
  const h=`<b>${esc(NET.name)}</b> · Livello ${P.lv} <small>(${DF.n})</small><div class="hb">${I('cuore')}<div class="b"><i style="width:${Math.max(0,P.hp)/P.mx*100}%;background:#d33"></i><span>${Math.max(0,P.hp)|0}/${P.mx}</span></div></div><div class="hb">${I('xp')}<div class="b"><i style="width:${P.xp/need()*100}%;background:#4ad"></i><span>XP ${P.xp|0}/${need()}</span></div></div>`+
    `<div class="st"><span id="hg">${I('oro')}${P.g}</span>${cd('pozione',P.pot)}${cd('spada',atk())}${cd('scudo',def())}${cd('mira',crit()+'%')}${NET.ar?cd('trofeo',NET.ar.ap):''}</div>`+(c?`<div class="st">${c}</div>`:'')+
    (P.inv.length>=INV-4?`<div class="st"><b style="color:${P.inv.length>=INV?'#ff7a6a':'#ffd84a'}">${I('zaino')}${P.inv.length}/${INV}${P.inv.length>=INV?' · zaino pieno':''}</b></div>`:'')+
    (isNight()?`<div class="st"><span style="color:#b8c8ff">${I('luna')}Notte: esperienza +20%</span></div>`:'')+
    (inPit(P.px,P.py)?`<div class="st"><b style="color:#ff8a8a">${I('spade')}Fossa PvP: clicca un eroe per attaccarlo</b></div>`:'')+net;
  if(h!==HUDh){HUDh=h;$('hud').innerHTML=h}
  let q='';const so=storyObj(1);if(so)q+=`${I('corona')} ${esc(so)}<br>`;for(const x of P.q){const T=QT[x.id];q+=`${I(qReady(x)?'spunta':'punto')} ${esc(T.ti)}: <b>${esc(qReady(x)?'consegna a '+NPCS[x.npc].n:qProg(x))}</b><br>`}
  if(q!==QTh){QTh=q;$('qt').innerHTML=q}}
function cl(){if(PM==='trade'){trCancel();return}PM=0;$('pn').style.display='none';cineOff()}
function tog(m){if(!started)return;if(PM===m)cl();else{if(m==='lb')NET.send({t:'lb'});if(m==='who'){NET.who=null;NET.send({t:'who'});NET.wt=0}pn(m)}}
const cmp=it=>{const e=P.eq[it.s],d=iv(it)-iv(e);return d>0?`<span class="up">▲${d}</span>`:d<0?`<span class="dn">▼${-d}</span>`:''};
function invRows(mode){let h=`<h4>Zaino (${P.inv.length}/${INV})</h4>`;if(!P.inv.length)h+='<p class="mu">Vuoto.</p>';
  P.inv.forEach((it,i)=>{h+=`<div class="it"><span>${fmt(it)} ${cmp(it)}</span><span>${mode==='sell'?(it.ar?'<span class="mu">invendibile</span>':it.lk?'<span class="mu" title="Sbloccalo dallo zaino per venderlo">🔒 bloccato</span>':`<button onclick="sell(${i})">Vendi ${it.p}💰</button>`):''}<button onclick="eqp(${i})">Equipa</button></span></div>`});return h}
function eqRows(btn){let h='';for(const s of 'whcs'){const it=P.eq[s];h+=`<div class="it"><span>${SN[s]}</span><span>${it?fmt(it):'—'}${btn&&it?btn(s,it):''}</span></div>`}return h}
function pn(m,arg){if(!started&&m!=='dead'&&m!=='kick')return;$('pn').classList.toggle('fishp',m==='fish');PM=m;if(arg!==undefined)PA=arg;let h='';const e=PA;
  switch(m){
  case 'inv':h=invHTML();break;
  case 'shop':h=`<h3>🛒 Mercante Ugo · 💰${P.g}</h3>${dayBanner()}${stockHTML('ugo')}${bagHTML()}<button onclick="buy('pot')">🧪 Pozione · ${px('pot',25)}💰${pt('pot')}</button><button onclick="buy('rnd')">🎲 Equipaggiamento a sorpresa · ${px('rnd',60+P.lv*20)}💰${pt('rnd')}</button><button onclick="sellAll(0)">Vendi tutti i comuni</button><button onclick="sellAll(1)">Vendi tutto lo zaino</button>`+invRows('sell');break;
  case 'smith':{h=`<h3>⚒ Fucina di Borin · 💰${P.g}</h3>${dayBanner()}${P.pick?'':`<div class="qb">⛏ Piccone da scavo <button onclick="buyPick()">Compra · ${px('pick',250)}💰</button></div>`}${stockHTML('borin')}${bagHTML()}<h4>Forgia su misura <small>Rara${pt('fr1')} · Epica${pt('fr2')}</small></h4>`;for(const s of 'whcs')h+=`<div class="it"><span>${SN[s]}</span><span><button onclick="forge('${s}',1)">Rara ${px('fr1',100+P.lv*32)}💰</button><button onclick="forge('${s}',2)">Epica ${px('fr2',300+P.lv*85)}💰</button></span></div>`;
    h+=`<h4>Potenziamento (fino a +5) ${pt('upg')}</h4>`+eqRows((s,it)=>(it.up||0)>=5?' <span class="mu">max</span>':`<button onclick="upg('${s}')">+${(it.up||0)+1} · ${px('upg',upc(it))}💰</button>`)+invRows('sell');break}
  case 'alch':h=`<h3>⚗ Bottega di Mira · 💰${P.g}</h3><p class="mu">Pozioni: ${P.pot}</p>${dayBanner()}<button onclick="buy('pot')">🧪 Pozione (cura 40%) · ${px('pot',25)}💰${pt('pot')}</button><button onclick="buy('pot5')">🧪×5 Scorta · ${px('pot5',110)}💰${pt('pot5')}</button><button onclick="buy('ela')">💪 Elisir di forza (+25% ATT, 90s) · ${px('ela',120)}💰${pt('ela')}</button><button onclick="buy('eld')">🪨 Elisir di pietra (+25% DIF, 90s) · ${px('eld',120)}💰${pt('eld')}</button><button onclick="cl()">Chiudi</button>`;break;
  case 'arena':{const ap=NET.ar?NET.ar.ap:0;h=`<h3>⚔ Negozio dell'Arena · 🏆 ${ap} punti</h3>`;if(!NET.ok)h+='<p class="mu">L\'arena e i suoi punti sono gestiti dal server: avvia il gioco con <b>node server.js</b> e un codice stanza.</p>';
    else h+=`<p class="mu">Vinci duelli nella fossa per guadagnare punti (10 + 2 per ogni livello di differenza, max 30). Equipaggiamento vincolato: non si vende né si scambia.</p>`;
    AR.forEach((a,i)=>{const it=arItem(a,P.lv);h+=`<div class="it"><span>${fmt(it)}</span><span><button ${!NET.ok||ap<a.c?'disabled':''} onclick="buyAr(${i})">${a.c} 🏆</button></span></div>`});h+='<button onclick="cl()">Chiudi</button>';break}
  case 'casino':{h=`<h3>🎰 Casinò Fortuna d'Oro · 💰${P.g}</h3><p class="mu">Gioca con moderazione: la casa vince più spesso di quanto perde.</p><div>Puntata: ${[10,50,100,500].map(v=>`<button class="${CB===v?'on':''}" onclick="CB=${v};pn('casino')">${v}</button>`).join('')}</div>`;
    h+=`<h4>🎰 Slot machine</h4><button onclick="cplay('slot')">Gira · ${CB}💰</button><p class="mu">3 uguali: 🍒×5 🍋×8 🔔×12 ⭐×20 7️⃣×50 💎×100 · 2 uguali: puntata restituita</p>`;
    h+=`<h4>🎲 Dadi (2 dadi)</h4><button onclick="cplay('lo')">Sotto 7 ×2.2</button><button onclick="cplay('seven')">Esatto 7 ×5</button><button onclick="cplay('hi')">Sopra 7 ×2.2</button>`;
    h+=`<h4>🛞 Roulette</h4><button onclick="cplay('red')">Rosso ×2</button><button onclick="cplay('black')">Nero ×2</button><button onclick="cplay('zero')">Zero ×36</button>`;
    if(BJ){const hid=!BJ.over;h+=`<h4>🃏 Blackjack · puntata ${BJ.bet}💰</h4><div>Banco: ${BJ.d.map((c,i)=>hid&&i===1?'<span class="pc">🂠</span>':bjCard(c)).join(' ')} <span class="mu">${hid?'('+bjVal([BJ.d[0]])+' + ?)':'= '+bjVal(BJ.d)}</span></div><div>Tu: ${BJ.p.map(bjCard).join(' ')} <b>= ${bjVal(BJ.p)}</b></div>`;
      if(!BJ.over)h+=`<button onclick="bjHit()">Carta</button><button onclick="bjStand()">Stai</button>${BJ.p.length===2&&P.g>=BJ.bet?'<button onclick="bjDouble()">Raddoppia</button>':''}`;
      else h+=`<div class="qb">${BJ.msg}</div><button onclick="bjDeal()">Nuova mano · ${CB}💰</button>`}
    else h+=`<h4>🃏 Blackjack</h4><button onclick="bjDeal()">Distribuisci · ${CB}💰</button><p class="mu">Blackjack paga 3:2 · il banco si ferma a 17 · puoi raddoppiare con le prime due carte.</p>`;
    h+=(CR?`<div class="qb">${CR}</div>`:'')+'<button onclick="cl()">Esci dal tavolo</button>';break}
  case 'dig':{h=DIG?digHTML():'';break}case 'fish':{if(!FSH)fishStart();h=fishHTML();break}case 'fdia':h=fdiaHTML();break;
  case 'sellres':{const d=NPCS[PA&&PA.nid]||{},fm=d.buy==='fish',L=fm?FISHT.map(f=>[f.id,f.n,f.p,P.fish]):Object.keys(RESN).map(k=>[k,RESN[k],RESP[k],P.res]);
    h=`<h3>${fm?'🐟 Banco del pesce':'🧺 Compro raccolti'} · 💰${P.g}</h3>${dayBanner()}`;let any=0;
    for(const[id,nm,b,src]of L){const c=src[id]|0;if(!c)continue;any=1;const pr=px('s_'+id,b);h+=`<div class="qb"><b>${nm}</b> ×${c}${pt('s_'+id)}<br><button onclick="sellR('${id}',1)">Vendi 1 · ${pr}💰</button><button onclick="sellR('${id}',0)">Vendi tutti · ${pr*c}💰</button></div>`}
    if(!any)h+=`<p class="mu">${fm?'Non hai pesci da vendere. Prova a pescare dai moli del Porto!':'Non hai raccolti da vendere: grano, legna, mele, uova, rose e cimeli si raccolgono nei quartieri.'}</p>`;
    h+=`<button onclick="pn('npc')">Indietro</button>`;break}
  case 'stash':{h=`<h3>🧳 Baule personale · stanza ${P.room||'?'}</h3><p class="mu">Gli oggetti nel baule restano qui al sicuro. Capienza ${P.stash.length}/40.</p><h4>Nel baule</h4>`+(P.stash.length?P.stash.map((it,i)=>`<div class="it"><span>${fmt(it)}</span><button onclick="stTake(${i})">Prendi</button></div>`).join(''):'<p class="mu">Vuoto.</p>')+`<h4>Zaino (${P.inv.length}/${INV})</h4>`+(P.inv.length?P.inv.map((it,i)=>`<div class="it"><span>${fmt(it)}</span><button onclick="stPut(${i})">Deposita</button></div>`).join(''):'<p class="mu">Zaino vuoto.</p>')+'<button onclick="cl()">Chiudi</button>';break}
  case 'dimsel':h=dimSelHTML();break;
  case 'duel':{const D2=DU;h='<h3>🤠 Duello con Black Jack</h3>';if(!D2)h+='<p>Il duello è finito.</p>';else if(D2.ph==='wait')h+=`<p>${D2.msg}</p><p class="mu">Premi Spara! (o Spazio) solo quando compare FUOCO!</p><button onclick="duelShoot()">🔫 Spara!</button>`;
    else if(D2.ph==='fire')h+='<p style="font-size:44px;text-align:center;color:#ff4a3a;margin:8px 0"><b>FUOCO!</b></p><button onclick="duelShoot()">🔫 Spara!</button>';else h+=`<p>${D2.msg}</p><button onclick="duelStart()">🔁 Riprova il duello</button>`;h+='<button onclick="cl()">Ritirati</button>';break}
  case 'npc':h=npcHTML(e);break;
  case 'q':{h=`<h3>📜 Missioni</h3><div class="qb"><b>⚜ Storia</b><br>${esc(storyObj())}`;if(P.st===1)h+='<br>'+SHARDS.map(id=>`${P.sh.includes(id)?'✔':'◻'} ${DG[id].n} <span class="mu">— ${DGH[id]}</span>`).join('<br>');h+='</div>';
    if(!P.q.length)h+='<p class="mu">Nessuna missione secondaria. Cerca i personaggi con il <b style="color:#ffd84a">!</b> sopra la testa.</p>';
    P.q.forEach((q,i)=>{const T=QT[q.id];h+=`<div class="qb"><b>${esc(T.ti)}</b> <span class="mu">da ${esc(NPCS[q.npc].n)}</span><br>${esc(T.tx)}<br><b>${qReady(q)?'✔ Pronta: torna da '+esc(NPCS[q.npc].n):esc(qProg(q))}</b> <button onclick="P.q.splice(${i},1);npcMarks();hud();pn('q')">Abbandona</button></div>`});h+='<button onclick="cl()">Chiudi</button>';break}
  case 'dia':{const ln=Object.keys(LORE).length;h=`<h3>📖 Diario</h3>${P.dream?`<div class="qb"><b>🌑 Il messaggio del sogno:</b> «${P.dream.msg}»<br><small>${P.dream.tr?'Tradotto dal bibliotecario della Biblioteca Arcana: «Il re nasconde ciò che sta sotto».':'È scritto in una lingua antica: forse il bibliotecario della Biblioteca Arcana sa tradurlo.'}</small></div>`:''}${(P.vn&&P.vn.length)||P.vcult?'<h4>🌫 Aldoria Vecchia</h4>'+(P.vcult?'<div class="qb">La porta di pietra: «La verità sarà nei tuoi occhi, a tempo debito.»</div>':'')+(P.vn||[]).map(i=>'<div class="qb"><small>'+esc(VNOTES[i])+'</small></div>').join(''):''}${truthHTML()}${secretsHTML()}<h4>Frammenti della Corona (${P.sh.length}/6)</h4>`+SHARDS.map(id=>`<div class="it"><span>${P.sh.includes(id)?'💎':'◻'} ${DG[id].n}</span><span class="mu">${P.sh.includes(id)?'recuperato':DGH[id]}</span></div>`).join('');
    h+=`<h4>Dungeon</h4>`+Object.keys(DG).map(id=>`<div class="it"><span>${DG[id].n} <span class="mu">Lv ${DG[id].lv+getRun(id)*3}</span></span><span class="mu">ciclo ${getRun(id)+1} · vittorie ${P.done[id]||0}</span></div>`).join('');
    h+=`<h4>Pagine del diario di Malakar (${P.lore.length}/${ln})</h4>`;Object.keys(LORE).forEach(id=>{h+=P.lore.includes(id)?`<div class="it"><span>📜 ${esc(LORE[id][0])}</span><span><button onclick="PA={ti:LORE['${id}'][0],tx:LORE['${id}'][1],back:'dia'};pn('txt')">Leggi</button></span></div>`:`<div class="it"><span class="mu">◻ ??? — si trova in ${DG[id.replace(/\d+$/,'')].n}</span></div>`});
    h+=`<p class="mu">Nemici sconfitti: ${P.kills} · Missioni completate: ${Object.values(P.qd).reduce((a,b)=>a+b,0)}</p><button onclick="cl()">Chiudi</button>`;break}
  case 'lb':{h=`<h3>🏆 Classifica dell'Arena</h3>`;if(!NET.ok){h+='<p>La classifica è condivisa da tutti i giocatori del server. Avvia il gioco con <b>node server.js</b> e inserisci un codice stanza per partecipare.</p>'}
    else{const k=NET.lbk||'pts',L=(NET.lb||[]).slice().sort((a,b)=>b[k]-a[k]||b.w-a.w);
      h+=`<div class="tabs"><button class="${k==='pts'?'on':''}" onclick="NET.lbk='pts';pn('lb')">Per punti</button><button class="${k==='w'?'on':''}" onclick="NET.lbk='w';pn('lb')">Per vittorie</button></div>`;
      h+=NET.lb?(L.length?`<table class="lb"><tr><th>#</th><th>Eroe</th><th>Vittorie</th><th>Sconfitte</th><th>Punti</th></tr>${L.slice(0,25).map((r,i)=>`<tr${r.n.toLowerCase()===NET.name.toLowerCase()?' style="color:#f5b942"':''}><td>${i+1}</td><td>${['🥇','🥈','🥉'][i]||''} ${esc(r.n)}</td><td>${r.w}</td><td>${r.l}</td><td>${r.pts}</td></tr>`).join('')}</table>`:'<p class="mu">Nessun duello ancora. Sii il primo campione!</p>'):'<p class="mu">Caricamento…</p>';
      if(NET.ar)h+=`<p>I tuoi risultati: <b>${NET.ar.w}</b> vittorie · <b>${NET.ar.l}</b> sconfitte · <b>${NET.ar.pts}</b> punti totali · <b>${NET.ar.ap}</b> da spendere</p>`}
    h+='<button onclick="cl()">Chiudi</button>';break}
  case 'exitask':{const L=e.L,parts=[];if(L.sh)parts.push('<b>il Frammento della Corona</b>');if(L.dr)parts.push(L.dr===1?'un oggetto':L.dr+' oggetti');if(L.ch)parts.push('un forziere ricco ancora chiuso');
    h=`<h3>🚪 Uscire dal dungeon?</h3><p>A terra c'è ancora ${parts.join(', ').replace(/, ([^,]*)$/,' e $1')}. Se esci adesso li lasci qui.</p><button class="gold" onclick="cl()">Resta e raccogli</button><button onclick="const p=PA.po;cl();if(ents.includes(p)){p.ok=1;act(p)}">Esci comunque</button>`;break}
  case 'txt':h=`<h3>${esc(e.ti)}</h3>${e.sub?`<p class="mu">${esc(e.sub)}</p>`:''}<p>${esc(e.tx).replace(/\n/g,'<br>')}</p><button onclick="${e.back?`pn('${e.back}')`:'cl()'}">${e.back?'Indietro':'Continua'}</button>`;break;
  case 'pl':h=profHTML(e);break;
  case 'who':h=whoHTML();break;
  case 'treq':h=`<h3>🤝 Richiesta di scambio</h3><p><b>${esc(e.n)}</b> vuole scambiare oggetti con te.</p><button onclick="trAns(1)">Accetta</button><button onclick="trAns(0)">Rifiuta</button>`;break;
  case 'trade':h=tradeHTML();break;
  case 'kick':h=`<h3>⛔ Disconnesso dal server</h3><p>${esc(e.s)}</p><p class="mu">I tuoi progressi sono salvati in questo browser.</p><button onclick="toMenu()">Torna al menu</button>`;break;
  case 'dead':h='<h3>Sei morto</h3><p>In modalità Incubo la morte è permanente: il salvataggio è stato cancellato.</p><button onclick="toMenu()">Torna al menu</button>';break}
  $('ztc').className='';const pe=$('pn'),was=pe.style.display==='block'&&pe.dataset.m===m;pe.innerHTML=h;pe.style.display='block';pe.dataset.m=m;if(!was&&cineOK()){pe.classList.remove('pop');void pe.offsetWidth;pe.classList.add('pop')}paintPorts(pe);iconFill(pe);dlgOn(m,pe,was)}
/* ---- lista dei giocatori della stanza (tasto P) con zona, posizione e ping ---- */
function pingTag(ms){ms=+ms;const ok=ms>=0,c=!ok?'#888':ms<80?'#4c4':ms<150?'#cc4':ms<300?'#f90':'#e44',n=!ok?0:ms<80?4:ms<150?3:ms<300?2:1;
  // quattro barrette sottili (2 px) di altezza crescente, come il segnale del telefono
  const bars=[4,7,10,13].map((h,i)=>`<i style="display:inline-block;width:2px;height:${h}px;margin-right:1px;border-radius:1px;background:${i<n?c:'#7778'}"></i>`).join('');
  return`<span title="Ping ${ok?(ms|0)+' ms':'in misura'}" style="white-space:nowrap;display:inline-flex;align-items:flex-end;gap:0;vertical-align:baseline">${bars}<b style="color:${c};margin-left:4px;line-height:1">${ok?(ms|0)+' ms':'…'}</b></span>`}
const TOWNL=[['il Castello',8,7],['la Biblioteca',23,6],['il Colosseo',46,7],['la Porta nord',35,2],['la Taverna',6,22],['la Caserma',8,30],['la Bottega dell\'Erborista',26,21],['la Casa di Rosa',20,21],['la Panetteria',21,28],['la Casa di Gerald',26,28],['la Fucina',41,21],['il Tempio',50,22],['il Municipio',61,22],['l\'Osservatorio',63,6],['la piazza della fontana',35,35],['il mercato',47,30],['il Cimitero',8,44],['la Casa abbandonata',20,41],['la Sartoria',27,41],['il Casinò',23,47],['il parco',46,46],['la Scuderia',62,42],['la Porta ovest',2,35],['la Porta est',69,35],['la Porta dei Campi',69,16],['la Porta del Quartiere Nobile',16,2],['il cancello delle Rovine',2,52],['il molo',35,66],['il lungomare',35,62],['la Porta del Porto',54,68]];
function where(zk,x,y){if(!zk)return'—';let n;try{n=Z[zk]?Z[zk].n:DG[zk.split('@')[0]]?zname(zk.split('@')[0]+'@1').split(' · ')[0]+' · piano '+(+zk.split('@')[1]||1):zk}catch(e){n=zk}
  let pos='';if(zk==='town'){let b=null,bd=1e9;for(const l of TOWNL){const d=Math.hypot(l[1]-x,l[2]-y);if(d<bd){bd=d;b=l}}pos=(bd<4?'presso ':'vicino a ')+b[0]}
  else if(zk==='arena')pos=Math.hypot(x-15.5,y-19.5)<8.6?'nella fossa':'nella sala d\'attesa';
  else if(!IN[zk]){const N2=(Z[zk]&&Z[zk].N)||36,v=y<N2/3?'nord':y>N2*2/3?'sud':'',o=x<N2/3?'ovest':x>N2*2/3?'est':'';pos=v&&o?v+'-'+o:v||o||'centro'}
  return`<b>${esc(n)}</b>${pos?' · '+esc(pos):''} <span class="mu">(${x|0}, ${y|0})</span>`}
function whoHTML(){let h=`<h3>👥 Giocatori nella stanza${NET.code?' '+esc(NET.code):''}</h3>`;
  if(!NET.ok)return h+'<p>La lista dei giocatori funziona solo giocando dal server con un codice stanza.</p><button onclick="cl()">Chiudi</button>';
  const L=NET.who;if(!L)return h+'<p class="mu">Caricamento…</p><button onclick="cl()">Chiudi</button>';
  h+=`<p class="mu">${L.length} ${L.length===1?'giocatore':'giocatori'} · si aggiorna ogni secondo · il ping è il tempo di andata e ritorno verso il server</p>`;
  for(const p of L){const here=p.z===Zk,hp=p.mx?Math.round(Math.min(p.hp,p.mx)/p.mx*100):0;
    h+=`<div class="qb"><div class="row" style="margin:0"><span><b${p.me?' style="color:#2e9a3e"':''}>${esc(p.n)}</b>${p.me?' <span class="mu">(tu)</span>':''} · Lv ${p.lv|0} <span class="mu">· ❤ ${hp}%</span></span>${pingTag(p.ping)}</div>`;
    h+=`<div>📍 ${where(p.z,+p.x||0,+p.y||0)}${here&&!p.me?' <span class="up">· nella tua zona</span>':''}</div>`;
    if(!p.me)h+=`<button onclick="whoProf('${esc(p.id)}')">👤 Profilo</button>`;h+='</div>'}
  return h+'<button onclick="cl()">Chiudi</button>'}
function whoProf(id){const p=(NET.who||[]).find(q=>q.id===id);if(!p)return;const o=NET.pl[id]||{k:'pl',id,n:p.n,lv:p.lv};o.prof=null;o.par=null;NET.send({t:'prof',to:id});pn('pl',o)}
/* ---- profilo di un altro giocatore: dati inviati dal suo gioco, risultati dell'arena dal server ---- */
function profHTML(e){const p=e.prof,n=v=>Math.max(0,Math.round(+v||0));
  let h=`<canvas class="port" width="96" height="122" data-ap='${JSON.stringify(apPack(apFix(e.ap)))}' data-eq='${JSON.stringify({c:e.c,h:e.h,w:e.w,wv:e.wv,s:e.s})}'></canvas><h3>👤 ${esc(e.n)} · Livello ${n(p?p.lv:e.lv)}</h3>`;
  if(!p)h+=`<p class="mu">${NET.ok?'Caricamento del profilo…':'Profilo non disponibile senza server.'}</p>`;
  else{const df=DFS[n(p.df)],fh=`<b${n(p.df)===3?' style="color:#ff6a6a"':''}>${df?df.n:'?'}</b>`,hp=Math.min(n(p.hp),n(p.mx));
    h+=`<div class="b"><i style="width:${p.mx?hp/n(p.mx)*100:0}%;background:#d33"></i><span>Vita ${hp}/${n(p.mx)}</span></div><div class="b"><i style="width:${p.need?Math.min(100,n(p.xp)/n(p.need)*100):0}%;background:#4ad"></i><span>XP ${n(p.xp)}/${n(p.need)}</span></div>`;
    h+=`<div class="cols"><div><div class="it"><span>Difficoltà</span><span>${fh}</span></div><div class="it"><span>⚔ Attacco</span><span>${n(p.atk)}</span></div><div class="it"><span>🛡 Difesa</span><span>${n(p.def)}</span></div><div class="it"><span>🎯 Critico</span><span>${n(p.cr)}%</span></div><div class="it"><span>💰 Oro</span><span>${n(p.g)}</span></div></div>`;
    h+=`<div><div class="it"><span>📍 Zona</span><span>${esc(String(p.z||'').slice(0,40))}</span></div><div class="it"><span>💎 Frammenti</span><span>${Math.min(6,n(p.sh))}/6</span></div><div class="it"><span>📜 Missioni fatte</span><span>${n(p.qd)}</span></div><div class="it"><span>🏰 Dungeon vinti</span><span>${n(p.dg)}</span></div><div class="it"><span>💀 Nemici sconfitti</span><span>${n(p.k)}</span></div></div></div>`;
    h+=`<h4>Equipaggiamento</h4>`;for(const s of 'whcs'){const it=p.eq&&p.eq[s];h+=`<div class="it"><span>${SN[s]}</span><span>${it&&typeof it==='object'?fmt({s,r:Math.min(4,n(it.r)),v:n(it.v),n:String(it.n||'').slice(0,40),up:Math.min(5,n(it.up)),cr:n(it.cr),hp:n(it.hp),ar:it.ar?1:0}):'—'}</span></div>`}
    h+=`<p class="mu">Storia: ${esc(String(p.st||'').slice(0,80))}</p>`}
  const a=e.par;h+=`<h4>🏆 Arena</h4>`+(a?`<p>${n(a.w)} vittorie · ${n(a.l)} sconfitte · ${n(a.pts)} punti</p>`:`<p class="mu">${NET.ok&&!p?'…':'Nessun dato'}</p>`);
  h+=`<p class="mu">Fuori dalla fossa dell'arena gli eroi non possono colpirsi.</p><button ${NET.ok?'':'disabled'} onclick="trReq()">🤝 Proponi uno scambio</button><button onclick="cl()">Chiudi</button>`;return h}
const STN=['Deve ancora parlare con il Re','Cerca i frammenti della Corona','Ha tutti i frammenti','Affronta Malakar nella Cittadella','Ha sconfitto Malakar','Campione di Aldoria'];
function myProf(){const e={};for(const s of 'whcs'){const it=P.eq[s];if(it)e[s]={n:String(it.n).slice(0,40),r:it.r,v:iv(it),up:it.up||0,cr:it.cr||0,hp:it.hp||0,ar:it.ar?1:0}}
  return{lv:P.lv,df:DFS.indexOf(DF),hp:Math.max(0,P.hp|0),mx:P.mx,xp:P.xp|0,need:need(),atk:atk(),def:def(),cr:crit(),g:P.g,z:ZZ?ZZ.n:'',sh:P.sh.length,qd:Object.values(P.qd).reduce((a,b)=>a+b,0),dg:Object.values(P.done).reduce((a,b)=>a+b,0),k:P.kills,st:STN[P.st]||'',eq:e}}
function npcHTML(e){if(e.slp)return`<h3>${esc(e.n)}</h3><p><i>Zzz... dorme profondamente. Meglio tornare di giorno.</i></p>`;const id=e.nid,d=NPCS[id]||{};let line;
  if(id==='re')line=['Avvicinati, eroe. Il regno ha bisogno di te.','Hai recuperato '+P.sh.length+' frammenti su 6. Ti mancano: '+SHARDS.filter(s=>!P.sh.includes(s)).map(s=>DG[s].n).join(', ')+'.','Li hai trovati tutti! Presto, consegnameli.','Il portale per la Cittadella è aperto qui, nella sala del trono. Vai, e riporta la pace.','Malakar... è caduto? Raccontami tutto, Campione.','Aldoria ti sarà per sempre grata, Campione. Non mi sono mai sentito così forte: sento il regno intero tra le mani.'][P.st];if(id==='re'&&P.te===1)line='Tu! Come sei uscito dalla cella? Sparisci dalla mia vista, prima che chiami le guardie.';
  if(id==='re'){}else if(id==='saggio'){const nx=SHARDS.find(s=>!P.sh.includes(s));line=P.st===0?'Il Re ti attende al castello. Poi torna da me: conosco ogni angolo di questo regno.':nx&&P.st===1?'Il prossimo frammento? Cerca '+DG[nx].n+', '+DGH[nx]+'. Le pagine del diario di Malakar sono sparse nei dungeon: portamele, raccontano la sua storia.':'La Corona è quasi salva. Ricorda: ogni dungeon rinasce più forte quando il suo signore cade, e lascia tesori migliori.'}
  else if(id==='gatto')line='Miao! Briciola fa le fusa e si struscia contro le tue gambe.';
  else if(id[0]==='v'&&!d.n)line=VLINES[Math.floor(Math.random()*VLINES.length)];
  else line=d.ln?d.ln[Math.floor(Math.random()*d.ln.length)]:'...';
  let h=`<h3>${esc(e.n)}</h3><p><i>«${esc(line)}»</i></p>`;
  if(id==='re'){if(P.st===0)h+=`<button onclick="story(1)">⚜ Accetta la missione del Re</button>`;else if(P.st===2)h+=`<button onclick="story(3)">⚜ Consegna i sei frammenti (+1000💰)</button>`;else if(P.st===4)h+=`<button onclick="story(5)">⚜ Ricevi la ricompensa del Re (+5000💰 e i suoi doni)</button>`}
  if(id==='moreau')h+=moreauHTML();if(id==='re')h+=reExtraHTML();if(id==='malakar_g')h+=ghostHTML();if(id==='aldric_p'||id==='malakar_re')h+=qaHTML(id);
  const aq=P.q.find(q=>q.npc===id);
  if(aq){const T=QT[aq.id];if(qReady(aq)){const r=qRew(T);h+=`<div class="qb"><b>${esc(T.ti)}</b> — completata!<br><button onclick="qTurn(P.q[${P.q.indexOf(aq)}]);pn('npc')">✔ Consegna (+${r.g}💰, +${r.x} XP)</button></div>`}
    else h+=`<div class="qb"><b>${esc(T.ti)}</b> <span class="mu">in corso: ${esc(qProg(aq))}</span><br><span class="mu">${esc(T.tx)}</span></div>`}
  else{const av=qAvail(id);if(av){const T=QT[av],r=qRew(T);h+=`<div class="qb"><b>📜 ${esc(T.ti)}</b><p>${esc(T.tx)}</p><span class="mu">Ricompensa: ${r.g}💰 · ${r.x} XP</span><br><button onclick="qAccept('${id}','${av}');pn('npc')">Accetta</button></div>`}
    else if(d.qs&&P.q.length>=5)h+='<p class="mu">Hai già 5 missioni attive: completane qualcuna.</p>'}
  switch(d.role){case 'shop':h+=`<button onclick="pn('shop')">🛒 Commercia</button>`;break;case 'smith':h+=`<button onclick="pn('smith')">⚒ Forgia e potenzia</button>`;break;
    case 'alch':h+=`<button onclick="pn('alch')">⚗ Pozioni ed elisir</button>`;break;case 'heal':h+=`<button onclick="heal()">✚ Cura completa (gratis)</button>`;break;
    case 'inn':h+=`<button onclick="rest()">🛏 Riposa (10💰)</button>`;break;case 'bard':h+=`<button onclick="song()">🎵 Chiedi una canzone</button>`;break;
    case 'arena':h+=`<button onclick="pn('arena')">⚔ Negozio dell'Arena</button><button onclick="tog('lb')">🏆 Classifica</button>`;break;case 'casino':h+=`<button onclick="pn('casino')">🎰 Gioca al casinò</button>`;break;case 'fisher':if(P.rod<2)h+=`<button onclick="buyRod()">🎣 ${P.rod?'Canna di quercia (pesci rari più facili)':'Canna da pesca'} · ${px('rod'+(P.rod?2:1),P.rod?300:60)}💰</button>`;break;case 'buyer':h+=`<button onclick="pn('sellres')">💰 Vendi ${d.buy==='fish'?'il pescato':'i raccolti'}</button>`;break;case 'motel':h+=P.room?`<p class="qb">🛏 La tua stanza è la numero <b>${P.room}</b>, al primo piano. Il baule custodisce ${P.stash.length}/40 oggetti.</p>`:`<button onclick="rentRoom()">🛏 Affitta una stanza con baule · ${px('motel',250)}💰</button>`;break;case 'naval':h+=`<button onclick="navStart()">⛵ Salpa con la Sfida: battaglia navale</button><p class="mu">Prima i cannoni, poi l'arrembaggio contro la ciurma del Capitano Scarlatto. Dal livello 4. Battaglie vinte: ${P.navw||0}.</p>`;break;case 'master':h+=masterHTML();break;case 'dim':h+=dimNpcHTML(e.nid);break;case 'sage':if(P.dream&&!P.dream.tr)h+=`<button onclick="dreamTranslate()">📜 Mostra il messaggio del sogno</button>`;h+=`<button onclick="pn('dia')">📖 Diario e frammenti</button>`;break}
  return h+'<button onclick="cl()">Arrivederci</button>'}
function story(s){if(s===1&&P.st===0){P.st=1;PA={ti:'La missione del Re',tx:STORY.intro};pn('txt')}
  else if(s===3&&P.st===2){P.st=3;P.g+=1000;gainXP(800);PA={ti:'La Corona di Voxel',tx:STORY.forge};pn('txt');if(Zk==='in_castle'&&!ents.some(e=>e.k==='po'&&e.st==='void'))ents.push(po(14,12,'cittadella@1',{st:'void'}))}
  else if(s===5&&P.st===4){P.st=5;P.g+=5000;gainXP(3000);kingGifts();PA={ti:'Campione di Aldoria',tx:STORY.end};pn('txt')}
  jingle([60,67,72,76],.15,'triangle');npcMarks();hud();save()}
/* ---- azioni di negozi e personaggi ---- */
function eqp(i){const it=P.inv.splice(i,1)[0];if(P.eq[it.s])P.inv.push(P.eq[it.s]);P.eq[it.s]=it;recalc();sceneEquip();pn(PM);hud()}
function uneq(s){if(P.inv.length>=INV){msg('Zaino pieno');return}P.inv.push(P.eq[s]);P.eq[s]=null;if(s==='w')P.eq.w={u:uid(),s:'w',r:0,v:3,n:'Pugnale',p:0};recalc();pn(PM);hud()}
const dayN=(o=0)=>gDay()+o;
function h01(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}h^=h>>>13;h=Math.imul(h,0x5bd1e995);h^=h>>>15;return(h>>>0)/4294967296}
const dayEv=d=>{const u=h01('ev'+d);return u<.14?1:u>.88?2:0},offerQ=(k,d)=>h01('of'+k+d)<.2;
const pf=(k,d=dayN())=>{let f=.75+h01(k+':'+d)*.6;const e=dayEv(d);if(e===1)f*=.8;else if(e===2)f*=1.2;if(offerQ(k,d))f*=.65;return f};
const px=(k,b)=>Math.max(1,Math.round(b*pf(k)*priceMul()));
const pt=k=>{const ch=Math.round((pf(k)/pf(k,dayN(-1))-1)*100);return(offerQ(k,dayN())?' <b class="off">🔥 OFFERTA</b>':'')+(ch?` <small class="${ch>0?'pu':'pd'}">${ch>0?'▲ +':'▼ '}${ch}%</small>`:'')};
function dayBanner(){const ks=['pot','pot5','rnd','ela','eld','fr1','fr2','upg'],avg=ks.reduce((a,k)=>a+pf(k)/pf(k,dayN(-1)),0)/ks.length,ch=Math.round((avg-1)*100),e=dayEv(dayN());
  return `<div class="qb">${ico(nightK()>.5?'luna':'sole')} <b>Giorno ${dayN()}, ore ${gClock()}.</b> ${e===1?'<b class="off">Saldi di stagione!</b> Tutto costa il 20% in meno. ':e===2?'<b class="pu">Mercato in rialzo:</b> tutto costa il 20% in più. ':''}${ch>1?'Oggi i prezzi sono <b class="pu">più alti</b> di ieri (media +'+ch+'%).':ch<-1?'Oggi i prezzi sono <b class="pd">più bassi</b> di ieri (media '+ch+'%).':'Prezzi simili a ieri.'}<br><span class="mu">I prezzi cambiano ogni giorno del gioco, a mezzanotte (un giorno dura 24 minuti).</span></div>`}
const CARDV=['A','2','3','4','5','6','7','8','9','10','J','Q','K'],SUITS=['♠','♥','♦','♣'];let BJ=null;
function bjDeck(){const d=[];for(const q of SUITS)for(let i=0;i<13;i++)d.push([i,q]);for(let i=d.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[d[i],d[j]]=[d[j],d[i]]}return d}
const bjVal=h=>{let v=0,a=0;for(const c of h){const r=c[0];v+=r===0?11:r>=9?10:r+1;if(r===0)a++}while(v>21&&a>0){v-=10;a--}return v};
const bjCard=c=>`<span class="pc" style="color:${c[1]==='♥'||c[1]==='♦'?'#d33':'#222'}">${CARDV[c[0]]}${c[1]}</span>`;
function bjDeal(){if(BJ&&!BJ.over)return;if(!pay(CB))return;BJ={deck:bjDeck(),p:[],d:[],bet:CB,over:false,msg:''};BJ.p.push(BJ.deck.pop(),BJ.deck.pop());BJ.d.push(BJ.deck.pop(),BJ.deck.pop());if(bjVal(BJ.p)===21)bjEnd();pn('casino')}
function bjEnd(){const B=BJ;B.over=true;const pv=bjVal(B.p),nat=B.p.length===2&&pv===21,dn=B.d.length===2&&bjVal(B.d)===21;let win=0,m;
  if(pv>21)m='Sballato con '+pv+' — perso';
  else{if(!nat)while(bjVal(B.d)<17)B.d.push(B.deck.pop());const dv=bjVal(B.d);
    if(nat&&!dn){win=Math.floor(B.bet*2.5);m='BLACKJACK! Vinci '+win+'💰'}else if(nat&&dn){win=B.bet;m='Blackjack pari: puntata restituita'}
    else if(dn)m='Blackjack del banco — perso';else if(dv>21){win=B.bet*2;m='Il banco sballa ('+dv+') — vinci '+win+'💰'}
    else if(pv>dv){win=B.bet*2;m=pv+' contro '+dv+' — vinci '+win+'💰'}else if(pv===dv){win=B.bet;m='Pareggio a '+pv+': puntata restituita'}else m=pv+' contro '+dv+' — perso'}
  B.msg=m;P.g+=win;if(win>B.bet)jingle([72,76,79,84],.1,'triangle');else if(win)tone(700,.1);else tone(150,.2);hud()}
function bjHit(){if(!BJ||BJ.over)return;BJ.p.push(BJ.deck.pop());tone(600,.04);if(bjVal(BJ.p)>=21)bjEnd();pn('casino')}
function bjStand(){if(!BJ||BJ.over)return;bjEnd();pn('casino')}
function bjDouble(){if(!BJ||BJ.over||BJ.p.length!==2||!pay(BJ.bet))return;BJ.bet*=2;BJ.p.push(BJ.deck.pop());bjEnd();pn('casino')}
let CB=10,CR='';
const SLS=[['🍒',30,5],['🍋',25,8],['🔔',20,12],['⭐',13,20],['7️⃣',8,50],['💎',4,100]],REDS=[1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36],rr=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
function cplay(g){if(!pay(CB))return;const b=CB;let win=0,txt='';
  if(g==='slot'){const rs=[0,1,2].map(()=>{let r=Math.random()*100;for(const q of SLS){if((r-=q[1])<0)return q}return SLS[0]});txt='🎰 '+rs.map(q=>q[0]).join(' ');
    if(rs.every(q=>q[0]===rs[0][0])){win=b*rs[0][2];txt+=` — TRIS! +${win}💰`}else if(new Set(rs.map(q=>q[0])).size===2){win=b;txt+=' — coppia: puntata restituita'}else txt+=' — nessuna vincita'}
  else if(g==='lo'||g==='hi'||g==='seven'){const a=rr(1,6),c=rr(1,6),sm=a+c;txt=`🎲 ${a} + ${c} = ${sm}`;const w=g==='lo'?sm<7:g==='hi'?sm>7:sm===7;if(w){win=Math.round(b*(g==='seven'?5:2.2));txt+=` — vinci ${win}💰`}else txt+=' — perso'}
  else{const n=rr(0,36),col=n===0?'verde':REDS.includes(n)?'rosso':'nero';txt=`🛞 Esce ${n} (${col})`;const w=g==='zero'?n===0:g==='red'?col==='rosso':col==='nero';if(w){win=b*(g==='zero'?36:2);txt+=` — vinci ${win}💰`}else txt+=' — perso'}
  P.g+=win;CR=txt;if(win>=b*5)coinRain(Math.min(40,10+win/b*2|0));if(win>b)jingle([72,76,79,84],.1,'triangle');else if(win)tone(700,.1);else tone(150,.2);hud();pn('casino')}
function bagOk(){if(P.inv.length<INV)return true;msg('Zaino pieno: libera un posto prima di comprare');tone(150,.15);return false}
function pay(c){if(P.g<c){msg('Oro insufficiente');tone(150,.15);return false}P.g-=c;tone(1200,.06,'triangle');return true}
function buy(k){if(k==='pot'&&pay(px('pot',25)))P.pot++;else if(k==='pot5'&&pay(px('pot5',110)))P.pot+=5;else if(k==='rnd'&&bagOk()&&pay(px('rnd',60+P.lv*20)))gain(item(P.lv+2));
  else if(k==='ela'&&pay(px('ela',120))){P.bA=90;msg('Ti senti più forte! (+25% attacco)')}else if(k==='eld'&&pay(px('eld',120))){P.bD=90;msg('La tua pelle è dura come la pietra! (+25% difesa)')}pn(PM);hud()}
function forge(s,r){if(bagOk()&&pay(px(r===1?'fr1':'fr2',r===1?100+P.lv*32:300+P.lv*85))){sceneForge();gain(item(P.lv+1,r,s))}pn('smith');hud()}
const upc=it=>Math.round((40+iv(it)*3)*(1+(it.up||0)*.8));
function upg(s){const it=P.eq[s];if(!it||(it.up||0)>=5)return;if(pay(px('upg',upc(it)))){it.up=(it.up||0)+1;it.p=Math.round(it.p*1.15);msg(iname(it)+' potenziato!');jingle([60,67,72],.08);sceneForge();recalc()}pn('smith');hud()}
function sell(i){const it=P.inv[i];if(!it||it.ar||it.lk)return;P.g+=it.p;goldFly(it.p);P.inv.splice(i,1);tone(1200,.06,'triangle');pn(PM);hud()}
function sellAll(all){let n=0;const g0=P.g;setTimeout(()=>goldFly(P.g-g0),0);P.inv=P.inv.filter(it=>{if(it.ar||it.lk||(!all&&it.r>0))return true;P.g+=it.p;n++;return false});msg('Venduti '+n+' oggetti'+(P.inv.some(i=>i.lk)?' (quelli bloccati 🔒 restano nello zaino)':''));pn(PM);hud()}
function heal(){P.hp=P.mx;msg('La Luce ti ristora completamente.');jingle([72,79,84],.1,'triangle');hud()}
function rest(){if(pay(10)){P.hp=P.mx;msg('Dormi profondamente. Sei completamente ristorato.');hud()}}
function song(){jingle([67,69,71,72,74,72,71,69,67,0,64,67,72],.18,'triangle');msg('Lino intona la Ballata dell\'Eroe di Aldoria...')}
function buyAr(i){if(!NET.ok||!bagOk())return;NET.send({t:'buy',k:i})}
/* ---- impostazioni ---- */
// sui dispositivi solo touch il cursore non serve: la sezione non compare
const TOUCH=matchMedia('(hover:none) and (pointer:coarse)').matches;
/* ---- impostazioni: finestra divisa in categorie (elenco a sinistra, opzioni a destra) ---- */
// [chiave, icona, nome, descrizione, impostazioni che "Ripristina questa sezione" rimette come all'inizio]
const SETCAT=[
  ['gen','stella','Generale','Lingua, aspetto dell\'eroe e novità',['lang']],
  ['audio','nota','Audio','Volume, musica ed effetti',['mv','muOn','mu','sf']],
  ['gfx','schermo','Grafica','Qualità, effetti e cielo',['q','rs','part','shad','light','sky','ultra']],
  ['perf','fulmine','Prestazioni','Fotogrammi al secondo e rendering',['fpsmax','fast','fps']],
  ['anim','ciak','Animazioni','Scene e inquadrature',['cine','cinecam','film']],
  ['ui','hud','Interfaccia','HUD, ruota delle azioni, mappa, nomi e minimappa',['dmg','names','mini','rw','oldbar','hudl','mapt']],
  ['ctrl','gamepad','Comandi','Movimento, tasti e comandi touch',['wasd','rk','tch','tauto','tsz','tlh','tvib']],
  ['cur','cursore','Cursore','Stile, colore e grandezza del puntatore',['cur','curc','curs','curx']]];
const setCats=()=>SETCAT.filter(c=>!(TOUCH&&c[0]==='cur'));
let SETC=LS.get('voxelia_setc','gen');
function setCat(k){if(!setCats().some(c=>c[0]===k))k='gen';SETC=k;LS.set('voxelia_setc',k);openSet(1);tone(560,.03,'triangle')}
const sGrp=(t,h)=>`<div class="stg">${t?`<h5>${t}</h5>`:''}${h}</div>`;
function curSetHTML(chk){return sGrp('Stile',`<div class="row"><label for="s_cur">Stile</label><select id="s_cur" onchange="setv('cur',+this.value);openSet()">${CURN.map((n,i)=>`<option value="${i}" ${(SET.cur|0)===i?'selected':''}>${n}</option>`).join('')}</select></div>
${(SET.cur|0)<4?`<div class="row"><label>Colore</label><span>${Object.entries(CURC).map(([k,c])=>`<button class="sw${SET.curc===k?' on':''}" style="background:${c}" title="${k}" aria-label="Colore ${k}" onclick="setv('curc','${k}');openSet()"></button>`).join('')}</span></div>
<div class="row"><label for="s_curs">Dimensione</label><select id="s_curs" onchange="setv('curs',+this.value);openSet()">${['Piccolo','Medio','Grande'].map((n,i)=>`<option value="${i+1}" ${(SET.curs|0)===i+1?'selected':''}>${n}</option>`).join('')}</select></div>`:''}`)
  +((SET.cur|0)<4?sGrp('Comportamento',chk('curx','Cursore contestuale (spada sui nemici, fumetto sui personaggi, mano su porte e oggetti)')+`<div class="curp">${curPrev()}</div>`):'')}
function setBody(k){const rng=(q,l,min=0,max=1,st=.05)=>`<div class="row"><label for="s_${q}">${l}</label><input type="range" id="s_${q}" min="${min}" max="${max}" step="${st}" value="${SET[q]}" oninput="setv('${q}',+this.value)"></div>`;
  const chk=(q,l)=>`<div class="row"><label for="s_${q}">${l}</label><input type="checkbox" id="s_${q}" ${SET[q]?'checked':''} onchange="setv('${q}',this.checked?1:0)"></div>`;
  switch(k){
  case 'gen':return sGrp('Lingua',`<div class="row"><label for="s_lang">Lingua del gioco</label><select id="s_lang" onchange="setLang(this.value)">${[['it','Italiano'],['en','English'],['el','Eldoriano (la lingua di Eldoria)']].map(([v,n])=>`<option value="${v}" ${SET.lang===v?'selected':''}>${n}</option>`).join('')}</select></div>
<p class="mu">English traduce menu, comandi, impostazioni e la maggior parte dei pulsanti; dialoghi e missioni restano in italiano. L'eldoriano è la lingua antica del regno: trasforma tutti i testi, sempre allo stesso modo.</p>`)
    +sGrp('Eroe',`<div class="row"><label>Pelle, capelli, vestiti, mantello e corporatura</label><button onclick="closeSet();openLook()">🎨 Aspetto dell'eroe</button></div>`)
    +sGrp('Gioco',`<div class="row"><label>Tutte le modifiche, versione per versione</label><button onclick="openChg()">Novità</button></div><p class="mu">Voxelia ${GAME_VER} · le impostazioni vengono salvate automaticamente in questo browser.</p>`);
  case 'audio':return sGrp('Volume',rng('mv','Volume generale')+rng('sf','Volume effetti'))+sGrp('Musica',chk('muOn','Musica di sottofondo')+rng('mu','Volume musica'))
    +`<button onclick="auInit();jingle([72,76,79,84],.1)">Prova suono</button>`;
  case 'gfx':return sGrp('Qualità',`<div class="row"><label for="s_q">Preimpostazione</label><select id="s_q" onchange="setQ(+this.value)">${['Bassa','Media','Alta','Ultra'].map((n,i)=>`<option value="${i}" ${SET.q===i?'selected':''}>${n}</option>`).join('')}</select></div>${rng('rs','Risoluzione di rendering',.5,1,.05)}
<p class="mu">La preimpostazione regola tutte le opzioni qui sotto in un colpo solo; poi puoi cambiarle una per una.</p>`)
    +sGrp('Effetti',chk('part','Particelle (foglie, neve, braci)')+chk('shad','Ombre')+chk('light','Illuminazione dinamica nei dungeon')+chk('sky','☁ Cielo con nuvole'))
    +sGrp('Ultra',chk('ultra','✨ Effetti Ultra: riflessi sull\'acqua, bagliori, raggi di sole, ombre delle nuvole, dettagli del terreno')+`<p class="mu">Ultra è la grafica più ricca e richiede un computer più potente: se il gioco rallenta, torna ad Alta.</p>`);
  case 'perf':return sGrp('Fotogrammi',`<div class="row"><label for="s_fpsmax">FPS massimi</label><select id="s_fpsmax" onchange="setv('fpsmax',+this.value)">${[[0,'Come lo schermo (consigliato)'],[30,'30'],[45,'45'],[60,'60'],[75,'75'],[90,'90'],[120,'120'],[144,'144'],[165,'165'],[240,'240']].map(([v,n])=>`<option value="${v}" ${(SET.fpsmax|0)===v?'selected':''}>${n}</option>`).join('')}</select></div>
${HZ?`<p class="mu">Il tuo schermo aggiorna a circa ${HZ} Hz.</p>`:''}<p class="mu">Il gioco è sempre sincronizzato con lo schermo: un browser non può mostrare più fotogrammi di quanti lo schermo ne aggiorni, quindi un limite più alto della frequenza dello schermo non cambia niente. Un limite più basso (30 o 60) fa scaldare meno portatili e telefoni e consuma meno batteria.</p>`)
    +sGrp('Rendering',chk('fast','⚡ Rendering veloce (consigliato)')+`<p class="mu">Muri, case, alberi e arredi che non si muovono vengono disegnati una volta sola e poi copiati, invece di essere ridisegnati pezzo per pezzo a ogni fotogramma: il gioco è molto più fluido, soprattutto con lo zoom lontano e nelle zone grandi. Disattivalo solo se noti qualcosa disegnato in modo strano.</p>`)
    +sGrp('Misura',chk('fps','Contatore FPS'))+`<p class="mu">Se il gioco va a scatti, abbassa anche la risoluzione o la preimpostazione nella sezione Grafica.</p>`;
  case 'anim':return sGrp('Scene',chk('cine','Animazioni sceniche (stendardi, transizioni, monete e oggetti che volano)')+chk('cinecam','Inquadrature: zoom e bande nere quando parli con qualcuno o arriva un boss')+chk('film','🎬 Scene della storia: filmati tra un capitolo e l\'altro (si rivedono dal menu della Modalità Storia)'));
  case 'ui':return sGrp('HUD',`<p class="mu">Sposta e ridimensiona barra della vita, minimappa, orologio, missioni, ruota delle azioni, chat e, su telefoni e tablet, joystick e pulsanti.</p><div class="row"><button onclick="hudEdit(1)" ${started?'':'disabled title="Entra in partita per modificare l\'HUD"'}>Personalizza l'HUD</button><button onclick="SET.hudl={};hudApply();applySet();openSet()">Rimetti l'HUD com'era</button></div>`)
    +sGrp('Ruota delle azioni',`<div class="row"><label for="s_rw">Mostra la ruota delle azioni</label><input type="checkbox" id="s_rw" ${SET.rw?'checked':''} onchange="SET.rw=this.checked?1:0;LS.set('voxelia_set',SET);wheelApply()"></div><div class="row"><label for="s_oldbar">Usa la vecchia barra al posto della ruota</label><input type="checkbox" id="s_oldbar" ${SET.oldbar?'checked':''} onchange="SET.oldbar=this.checked?1:0;LS.set('voxelia_set',SET);wheelApply()"></div>`)
    +sGrp('Mappa',`<div class="row"><label for="s_mapt">Tema della mappa (tasto M)</label><select id="s_mapt" onchange="setv('mapt',+this.value)">${['Automatico (come il gioco)','Scuro','Chiaro'].map((n,i)=>`<option value="${i}" ${(SET.mapt|0)===i?'selected':''}>${n}</option>`).join('')}</select></div>`)
    +sGrp('Sullo schermo',chk('dmg','Numeri dei danni')+chk('names','Nomi sopra i personaggi')+chk('mini','Minimappa'));
  case 'ctrl':return sGrp('Comandi touch',`<div class="row"><label for="s_tch">Joystick e pulsanti sullo schermo</label><select id="s_tch" onchange="setv('tch',+this.value);openSet()">${[['0','Automatici (solo su telefoni e tablet)'],['1','Sempre'],['2','Mai']].map(([v,n])=>`<option value="${v}" ${String(SET.tch|0)===v?'selected':''}>${n}</option>`).join('')}</select></div>`
      +`<div class="row"><label>Sposta e ridimensiona joystick e pulsanti, uno per uno</label><button onclick="hudEdit(1)" ${started&&typeof TCH!=='undefined'&&TCH.on?'':'disabled'}>✋ Personalizza i comandi</button></div>`+chk('tauto','Adatta da solo i comandi al dispositivo (telefono, tablet, verticale o orizzontale)')+(typeof TCH!=='undefined'&&TCH.on&&TCH.dev?`<p class="mu">Rilevato: ${TDEVN[TCH.dev.k]}${TCH.dev.land?' in orizzontale':' in verticale'} · grandezza automatica ${Math.round(TCH.dev.f*100)}%</p>`:'')+rng('tsz',SET.tauto!==0?'Grandezza dei pulsanti (in più o in meno rispetto a quella automatica)':'Grandezza dei pulsanti',70,140,5)+chk('tlh','Mancini: joystick a destra, pulsanti a sinistra')+chk('tvib','Vibrazione quando premi un pulsante')
      +`<p class="mu">Trascina il dito nella parte bassa a sinistra per muoverti, tocca un nemico o un personaggio per andarci. Due dita per lo zoom, un tocco sulla minimappa apre la mappa.</p>`)
    +sGrp('Movimento',chk('wasd','Movimento con WASD e frecce (R per interagire)'))
    +sGrp('Tasti',`<div class="row"><label>Tasto per mostrare o nascondere la ruota</label><button onclick="RKW=1;this.textContent='Premi un tasto...'">${RKW?'Premi un tasto...':keyName(SET.rk)}</button></div><p class="mu">L'elenco completo dei tasti è in "Comandi", nel menu iniziale.</p>`);
  case 'cur':return curSetHTML(chk)}
  return''}
function setHTML(){const cats=setCats();if(!cats.some(c=>c[0]===SETC))SETC='gen';const C=cats.find(c=>c[0]===SETC);
  return`<div class="stw"><div class="sthd"><h3>${ico('ingranaggio',24)} Impostazioni</h3><button class="stx" onclick="closeSet()" aria-label="Chiudi" title="Chiudi (Esc)">✕</button></div>
<div class="stb"><nav class="stn" role="tablist" aria-label="Categorie">${cats.map(c=>`<button role="tab" aria-selected="${c[0]===SETC}" class="${c[0]===SETC?'on':''}" onclick="setCat('${c[0]}')">${ico(c[1],20)}<span><b>${c[2]}</b><small>${c[3]}</small></span></button>`).join('')}</nav>
<section class="stc" role="tabpanel" aria-label="${C[2]}"><div class="stct">${ico(C[1],28)}<div><h4>${C[2]}</h4><div class="mu">${C[3]}</div></div></div>${setBody(SETC)}</section></div>
<div class="stf"><span class="mu">Le impostazioni vengono salvate automaticamente.</span><span><button onclick="resetCat()">Ripristina questa sezione</button><button onclick="resetSet()">Ripristina tutto</button>${started?'<button onclick="closeSet();toMenu()">Salva ed esci al menu</button>':''}<button class="gold" onclick="closeSet()">Chiudi</button></span></div></div>`}
// keep=1: stessa categoria, resta lo scorrimento; altrimenti si torna in cima
function openSet(newCat){auInit();$('ztc').className='';const el=$('set'),was=el.style.display==='block',oc=el.querySelector('.stc'),sc=oc&&!newCat?oc.scrollTop:0;
  el.innerHTML=setHTML();el.classList.add('nw');el.style.display='block';const nc=el.querySelector('.stc');if(nc)nc.scrollTop=sc;const nv=el.querySelector('.stn'),on=nv&&nv.querySelector('.on');if(on){const a=on.offsetLeft-nv.offsetLeft,b=a+on.offsetWidth;if(a<nv.scrollLeft||b>nv.scrollLeft+nv.clientWidth)nv.scrollLeft=a-8;const t=on.offsetTop-nv.offsetTop,u=t+on.offsetHeight;if(t<nv.scrollTop||u>nv.scrollTop+nv.clientHeight)nv.scrollTop=t-8}
  if(!was&&cineOK()){el.classList.remove('pop');void el.offsetWidth;el.classList.add('pop')}}
function closeSet(){$('set').style.display='none'}
// rimette le impostazioni di una sola categoria
function resetCat(){const C=SETCAT.find(c=>c[0]===SETC);if(!C)return;const ol=SET.lang;for(const k of C[4]){if(k==='hudl'){SET.hudl={};SET.hudlp={}}else if(k in SETD)SET[k]=SETD[k]}
  applySet('rs');hudApply();wheelApply();if(SET.lang!==ol)setLang(SET.lang);openSet();msg('Sezione «'+C[2]+'» ripristinata')}
function setv(k,v){SET[k]=v;applySet(k);if(k==='vsync')openSet()}
function setQ(q){SET.q=q;Object.assign(SET,QP[q]);applySet('rs');openSet()}
function resetSet(){const l=SET.lang;Object.assign(SET,SETD,{lang:l});SET.hudl={};SET.hudlp={};applySet('rs');hudApply();wheelApply();openSet();msg('Impostazioni ripristinate (la lingua resta la stessa)')}
function applySet(k){auVol();if(k==='fast'){fastFlush();LBC.clear()}if(k==='rs'||k==='ultra'||k==='q')rs();uFx();if(!k||String(k).startsWith('cur'))curApply();if(k==='wasd')for(const q in KEYS)KEYS[q]=0;$('mm').style.display=SET.mini?'':'none';$('fps').style.display=SET.fps?'':'none';LS.set('voxelia_set',SET)}

/* ---- zaino: griglia con icone, filtri, ordinamento, dettagli, blocco, getta a terra e distruggi ---- */
let IVSEL=null,IVDEL=null;
const IVF=[['all','Tutti'],['w','⚔ Armi'],['h','🪖 Elmi'],['c','🥋 Corazze'],['s','🛡 Scudi']],IVS=[['new','Più recenti'],['rar','Rarità'],['pow','Potenza'],['val','Valore'],['slot','Tipo']];
function ivList(){const f=SET.ivf||'all',k=SET.ivs||'new';let L=P.inv.map((it,i)=>({it,i}));if(f!=='all')L=L.filter(o=>o.it.s===f);
  const so={new:(a,b)=>b.i-a.i,rar:(a,b)=>b.it.r-a.it.r||iv(b.it)-iv(a.it),pow:(a,b)=>iv(b.it)-iv(a.it),val:(a,b)=>(b.it.p||0)-(a.it.p||0),slot:(a,b)=>'whcs'.indexOf(a.it.s)-'whcs'.indexOf(b.it.s)||iv(b.it)-iv(a.it)}[k]||((a,b)=>b.i-a.i);return L.sort(so)}
function ivFind(k){if(!k)return null;if(k.startsWith('e:')){const it=P.eq[k[2]];return it?{it,eq:k[2]}:null}const it=P.inv.find(x=>x.u===k);return it?{it}:null}
function ivTile(it,k){let ar='';if(!k.startsWith('e:')){const d=iv(it)-iv(P.eq[it.s]);ar=d>0?'<i class="ar up">▲</i>':d<0?'<i class="ar dn">▼</i>':''}
  return`<button class="ti${IVSEL===k?' sel':''}" style="--rc:${RC[it.r]}" onclick="ivPick('${k}')" title="${esc(iname(it))}" aria-label="${esc(iname(it))}"><img src="${icon(it)}" alt="">${it.up?`<b class="tu">+${it.up}</b>`:''}${it.lk?'<i class="tl">🔒</i>':''}${ar}</button>`}
function ivDetail(){const f=ivFind(IVSEL);if(!f)return'<p class="mu">Clicca un oggetto per vederne i dettagli e cosa puoi farci. Le frecce ▲▼ dicono se è meglio o peggio di quello che indossi.</p>';
  const it=f.it,cur=f.eq?null:P.eq[it.s],L=[`${it.s==='w'?'⚔ Attacco':'🛡 Difesa'} <b>${iv(it)}</b>${it.up?` <span class="mu">(base ${it.v}, potenziato +${it.up})</span>`:''}`];
  if(it.cr)L.push(`🎯 Critico +${it.cr}%`);if(it.hp)L.push(`❤ Vita +${it.hp}`);if(it.s==='w'){const T=lgTypeOf(it.n);L.push(`🗡 Affondo: ${T.n} · portata ${T.r} caselle · ricarica ${T.cd} s`)}
  L.push(it.ar?'💰 Non si vende (vincolato all\'arena)':`💰 Si vende per ${it.p}`);
  let cm='';if(cur){const dv=iv(it)-iv(cur),dc=(it.cr||0)-(cur.cr||0),dh=(it.hp||0)-(cur.hp||0),q=(d,u)=>d?`<span class="${d>0?'up':'dn'}">${d>0?'▲ +':'▼ '}${d}${u}</span>`:'';
    cm=`<div class="mu">Rispetto a ${esc(iname(cur))}: ${[q(dv,it.s==='w'?' ATT':' DIF'),q(dc,'% CRIT'),q(dh,' PV')].filter(Boolean).join(' · ')||'uguale'}</div>`}
  const lk=it.lk,ar=it.ar;let a=f.eq?`<button onclick="uneq('${f.eq}');IVSEL=null;pn('inv')">Togli</button>`:`<button onclick="ivEquip()">Equipaggia</button>`;
  a+=`<button onclick="ivLock()">${lk?'🔓 Sblocca':'🔒 Blocca'}</button>`;
  if(!f.eq){a+=`<button ${lk||ar?'disabled':''} title="${ar?'Gli oggetti dell\'arena sono vincolati: puoi solo distruggerli':lk?'Sblocca prima l\'oggetto':'Lo lasci a terra: gli eroi nella tua zona lo vedono e possono raccoglierlo'}" onclick="ivDrop()">📦 Getta a terra</button>`;
    a+=IVDEL===it.u?`<button class="danger" onclick="ivDestroy()">⚠ Conferma: distruggi</button>`:`<button ${lk?'disabled':''} title="${lk?'Sblocca prima l\'oggetto':'Lo elimini per sempre'}" onclick="ivDestroy()">🗑 Distruggi</button>`}
  return`<div class="ivh"><img src="${icon(it)}" alt=""><div><b style="color:${RC[it.r]}">${esc(iname(it))}</b><div class="mu">${RN[it.r]} · ${SN[it.s]}${ar?' · vincolato':''}${lk?' · 🔒 bloccato':''}${f.eq?' · equipaggiato':''}</div></div></div><div class="ivl">${L.join('<br>')}</div>${cm}<div class="iva">${a}</div>`}
function invHTML(){const n=P.inv.length,L=ivList(),fi=SET.ivf||'all';if(IVSEL&&!ivFind(IVSEL))IVSEL=null;
  let h=`<h3>🎒 Zaino <span class="mu">${n}/${INV}${n>=INV?' · pieno':''}</span></h3>`;
  h+=`<div class="eqg">${[...'whcs'].map(s=>`<div><span class="mu">${SN[s]}</span>${P.eq[s]?ivTile(P.eq[s],'e:'+s):'<div class="ti em"></div>'}</div>`).join('')}</div>`;
  h+=`<p class="mu" style="text-align:center">⚔ Attacco ${atk()} · 🛡 Difesa ${def()} · 🎯 Critico ${crit()}% · ❤ Vita ${P.mx}</p>`;
  h+=`<div class="ivbar" title="${n} oggetti su ${INV}"><i style="width:${Math.min(100,n/INV*100)}%;background:${n>=INV?'#e55':n>=INV-4?'#f5b942':'#4c4'}"></i></div>`;
  h+=`<div class="ivt"><span class="tabs">${IVF.map(([k,l])=>`<button class="${fi===k?'on':''}" onclick="SET.ivf='${k}';LS.set('voxelia_set',SET);pn('inv')">${l}</button>`).join('')}</span><select aria-label="Ordina lo zaino" onchange="SET.ivs=this.value;LS.set('voxelia_set',SET);pn('inv')">${IVS.map(([k,l])=>`<option value="${k}" ${(SET.ivs||'new')===k?'selected':''}>${l}</option>`).join('')}</select></div>`;
  h+=`<div class="ivg">${L.map(o=>ivTile(o.it,o.it.u)).join('')}${fi==='all'?'<div class="ti em"></div>'.repeat(Math.max(0,INV-n)):''}</div>`;
  if(!L.length&&fi!=='all')h+='<p class="mu">Nessun oggetto di questo tipo nello zaino.</p>';
  return h+`<div class="ivd">${ivDetail()}</div><button onclick="eqBest()">✨ Equipaggia i migliori</button><button onclick="cl()">Chiudi</button>`}
function ivPick(k){IVSEL=IVSEL===k?null:k;IVDEL=null;pn('inv')}
function ivEquip(){const i=P.inv.findIndex(x=>x.u===IVSEL);if(i<0)return;const it=P.inv.splice(i,1)[0];if(P.eq[it.s])P.inv.push(P.eq[it.s]);P.eq[it.s]=it;recalc();IVSEL='e:'+it.s;tone(700,.05,'triangle');sceneEquip();pn('inv');hud();save()}
function ivLock(){const f=ivFind(IVSEL);if(!f)return;f.it.lk=f.it.lk?0:1;tone(f.it.lk?500:400,.05,'triangle');pn('inv');save()}
function ivDrop(){const i=P.inv.findIndex(x=>x.u===IVSEL);if(i<0)return;const it=P.inv[i];if(it.lk||it.ar)return;P.inv.splice(i,1);IVSEL=null;IVDEL=null;delete it.lk;
  const[x,y]=dropPos();if(NET.ok&&NET.code){netDrop(it,x,y);msg(iname(it)+' è a terra: gli eroi nella tua zona possono vederlo e raccoglierlo')}else{dropLocal(it,x,y,1);msg(iname(it)+' è a terra: puoi riprenderlo per 10 minuti')}
  tone(260,.08,'triangle');pn('inv');hud();save()}
function ivDestroy(){const i=P.inv.findIndex(x=>x.u===IVSEL);if(i<0)return;const it=P.inv[i];if(it.lk)return;
  if(IVDEL!==it.u){IVDEL=it.u;pn('inv');setTimeout(()=>{if(IVDEL===it.u){IVDEL=null;if(PM==='inv')pn('inv')}},4000);return}
  P.inv.splice(i,1);IVSEL=null;IVDEL=null;flt(P,'🗑','#cccccc');tone(140,.15,'sawtooth');msg(iname(it)+' distrutto');pn('inv');hud();save()}
function eqBest(){let n=0;for(const s of 'whcs'){let bi=-1,bv=iv(P.eq[s]);P.inv.forEach((it,i)=>{if(it.s===s&&iv(it)>bv){bv=iv(it);bi=i}});
    if(bi>=0){const it=P.inv.splice(bi,1)[0];if(P.eq[s])P.inv.push(P.eq[s]);P.eq[s]=it;n++}}
  recalc();IVSEL=null;msg(n?'Equipaggiati '+n+(n>1?' oggetti migliori':' oggetto migliore'):'Stai già usando gli oggetti più forti');if(n){jingle([67,72,76],.07,'triangle');sceneEquip()}pn('inv');hud();save()}

/* ---- novità: il changelog incorporato nel gioco al momento della build ---- */
function mdInline(s){return esc(s).replace(/\*\*(.+?)\*\*/g,'<b>$1</b>').replace(/`([^`]+)`/g,'<code>$1</code>')}
function chgHTML(){const src=typeof CHANGELOG_MD==='string'?CHANGELOG_MD:'';let h='',open=false,first=true,depth=0;const close=()=>{while(depth){h+='</ul>';depth--}};
  for(const raw of src.split('\n')){const line=raw.replace(/\s+$/,'');
    if(line.startsWith('## ')){close();if(open)h+='</div></details>';h+=`<details${first?' open':''}><summary>${mdInline(line.slice(3))}</summary><div>`;open=true;first=false;continue}
    if(!open)continue;
    if(line.startsWith('#### ')){close();h+=`<h4 class="sub">${mdInline(line.slice(5))}</h4>`;continue}
    if(line.startsWith('### ')){close();h+=`<h4>${mdInline(line.slice(4))}</h4>`;continue}
    const m=line.match(/^(\s*)- (.*)$/);if(m){const d=Math.floor(m[1].length/2)+1;while(depth<d){h+='<ul>';depth++}while(depth>d){h+='</ul>';depth--}h+=`<li>${mdInline(m[2])}</li>`;continue}
    if(!line.trim()||line.trim()==='---'){close();continue}
    close();h+=`<p>${mdInline(line)}</p>`}
  close();if(open)h+='</div></details>';return h||'<p class="mu">Changelog non disponibile.</p>'}
function openChg(){auInit();LS.set('voxelia_seen',GAME_VER);$('chg').innerHTML=`<h3>📜 Novità di Voxelia <span class="mu">· versione attuale ${GAME_VER}</span></h3><p class="mu">Tutte le modifiche del gioco, dalla più recente. Clicca una versione per aprirla.</p>${chgHTML()}<button onclick="closeChg()">Chiudi</button>`;$('chg').style.display='block';newBadge()}
function closeChg(){$('chg').style.display='none'}
function newBadge(){const b=$('chgnew');if(b)b.style.display=LS.get('voxelia_seen','')===GAME_VER?'none':''}

/* ---- ricariche visibili sui pulsanti della barra ---- */
const CDB=[['b-pot',()=>P.pc,()=>1],['b-area',()=>P.sk,()=>6],['b-dodge',()=>P.dgc,()=>DODGE_CD],['b-lunge',()=>P.lgc,()=>lgType().cd]];
function cdUI(){for(const[id,f,m]of CDB){const b=$(id);if(!b)continue;const v=Math.max(0,f()||0),p=v>0?Math.min(100,v/m()*100):0,lab=v>0?(v>=1?Math.ceil(v)+'s':v.toFixed(1)+'s'):'',key=Math.round(p)+lab;
  if(b._k!==key){b._k=key;b.style.setProperty('--cd',p+'%');b.dataset.cd=lab}}
  const bp=$('b-pot');if(bp)bp.classList.toggle('dis',P.pot<=0)}

// traduzioni inglesi dei testi nuovi delle impostazioni
Object.assign(EN,{'Impostazioni':'Settings','Generale':'General','Grafica':'Graphics','Prestazioni':'Performance','Animazioni':'Animations','Interfaccia':'Interface','Comandi':'Controls','Cursore':'Cursor',
  'Lingua, aspetto dell\'eroe e novità':'Language, hero\'s look and what\'s new','Volume, musica ed effetti':'Volume, music and effects','Qualità, effetti e cielo':'Quality, effects and sky','Fotogrammi al secondo e rendering':'Frames per second and rendering','Come lo schermo (consigliato)':'Match the screen (recommended)','Rendering':'Rendering','⚡ Rendering veloce (consigliato)':'⚡ Fast rendering (recommended)',
  'Il gioco è sempre sincronizzato con lo schermo: un browser non può mostrare più fotogrammi di quanti lo schermo ne aggiorni, quindi un limite più alto della frequenza dello schermo non cambia niente. Un limite più basso (30 o 60) fa scaldare meno portatili e telefoni e consuma meno batteria.':'The game is always synchronised with the screen: a browser cannot show more frames than the screen refreshes, so a limit above the screen\'s refresh rate changes nothing. A lower limit (30 or 60) keeps laptops and phones cooler and saves battery.',
  'Muri, case, alberi e arredi che non si muovono vengono disegnati una volta sola e poi copiati, invece di essere ridisegnati pezzo per pezzo a ogni fotogramma: il gioco è molto più fluido, soprattutto con lo zoom lontano e nelle zone grandi. Disattivalo solo se noti qualcosa disegnato in modo strano.':'Walls, houses, trees and furniture that don\'t move are drawn once and then copied, instead of being redrawn piece by piece every frame: the game runs much more smoothly, especially when zoomed out and in large areas. Turn it off only if something looks wrong.',
  'Scene e inquadrature':'Scenes and camera','HUD, ruota delle azioni, mappa, nomi e minimappa':'HUD, action wheel, map, names and minimap','Movimento, tasti e comandi touch':'Movement, keys and touch controls','Comandi touch':'Touch controls','Stile, colore e grandezza del puntatore':'Pointer style, colour and size',
  'Lingua':'Language','Eroe':'Hero','Gioco':'Game','Volume':'Volume','Musica':'Music','Qualità':'Quality','Effetti':'Effects','Fotogrammi':'Frames','Misura':'Measure','Scene':'Scenes','Sullo schermo':'On screen','Movimento':'Movement','Tasti':'Keys','Stile':'Style','Comportamento':'Behaviour',
  'Ruota delle azioni':'Action wheel','Mostra la ruota delle azioni':'Show the action wheel','Ripristina questa sezione':'Reset this section','Ripristina tutto':'Reset everything','Aggancio alle linee guida':'Snap to guide lines','Le linee guida compaiono mentre trascini: bordi e centro dello schermo e degli altri elementi. Tieni premuto Alt per spostare liberamente.':'Guide lines appear while you drag: edges and centre of the screen and of the other elements. Hold Alt to move freely.','Salva ed esci al menu':'Save and quit to menu',
  'Le impostazioni vengono salvate automaticamente.':'Settings are saved automatically.','Tutte le modifiche, versione per versione':'Every change, version by version','Pelle, capelli, vestiti, mantello e corporatura':'Skin, hair, clothes, cloak and build',
  'Numeri dei danni':'Damage numbers','Nomi sopra i personaggi':'Names above characters','Minimappa':'Minimap','Contatore FPS':'FPS counter','Colore':'Colour','Dimensione':'Size'});
Object.assign(EN,{'Mappa di Aldoria':'Map of Aldoria','⤢ Tutta':'⤢ Fit','◎ Dove sono':'◎ Where am I','☾ Tema':'☾ Theme','☀ Tema':'☀ Theme','📖 Guida':'📖 Guide','Mappa':'Map',
  'Rotellina o +/− per ingrandire · trascina per spostarti · clicca una zona per la guida':'Wheel or +/− to zoom · drag to move · click an area for the guide','Tema della mappa (tasto M)':'Map theme (M key)',
  'Automatico (come il gioco)':'Automatic (like the game)','Scuro':'Dark','Chiaro':'Light'});
