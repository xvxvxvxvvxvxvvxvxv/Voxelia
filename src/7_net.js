/* ================= multigiocatore (WebSocket verso server.js) ================= */
const NET={code:'',name:'Eroe',cfg:{pvp:1,trade:1,chat:1,xpm:1,gm:1},kicked:0,pd:{},ws:null,ok:false,id:null,peers:{},list:[],pl:{},seq:0,hits:[],lt:0,say:null,st:'',ar:null,runs:{},lb:null,lbk:'pts',tr:null,trq:null,
  send(o){if(this.ok&&this.ws)try{this.ws.send(JSON.stringify(o))}catch(e){}}};
/* ---- plugin del server: il loro codice nel gioco usa VXP per scambiare messaggi con il plugin sul server ---- */
const VXP={h:{},on(pl,e,f){const k=pl+':'+e;(this.h[k]||(this.h[k]=[])).push(f)},send(pl,e,d){NET.send({t:'x',pl,e,d})},
  emit(m){for(const f of this.h[m.pl+':'+m.e]||[])try{f(m.d)}catch(err){console.error('[plugin '+m.pl+']',err)}}};
function netConnect(){if(!window.GAME_WS||!NET.code||NET.ws)return;NET.kicked=0;NET.cfg={pvp:1,trade:1,chat:1,xpm:1,gm:1};NET.st='connessione…';
  const open=()=>{if(!started||!NET.code)return;let ws;try{ws=new WebSocket((location.protocol==='https:'?'wss://':'ws://')+location.host+'/ws')}catch(e){NET.st='errore di connessione';return}NET.ws=ws;
    ws.onopen=()=>ws.send(JSON.stringify({t:'hello',code:NET.code,name:NET.name}));
    ws.onmessage=ev=>{let m;try{m=JSON.parse(ev.data)}catch(e){return}if(m&&typeof m==='object')netMsg(m)};
    ws.onclose=()=>{if(NET.ws!==ws)return;NET.ok=false;NET.ws=null;NET.peers={};NET.st='riconnessione…';if(NET.tr||NET.trq){NET.tr=NET.trq=null;if(PM==='trade'||PM==='treq'){PM=0;$('pn').style.display='none'}}if(NET.kicked)return;setTimeout(open,2000)};
    ws.onerror=()=>{try{ws.close()}catch(e){}}};
  open()}
function netLeave(){const w=NET.ws;NET.ws=null;NET.ok=false;NET.tm=null;lastDay=0;NET.peers={};NET.list=[];NET.pl={};NET.tr=NET.trq=null;if(w){w.onclose=null;try{w.close()}catch(e){}}}
function netMsg(m){switch(m.t){
  case 'id':{setTime(m.gm);const ch=JSON.stringify(NET.runs)!==JSON.stringify(m.runs||{});NET.ok=true;NET.id=m.id;NET.ar=m.ar;NET.runs=m.runs||{};NET.st='';NET.lt=1;if(Zk)NET.send({t:'gget',rm:rmKey()});if(ch&&ZZ&&ZZ.dg)msg('Questo dungeon è a un ciclo diverso per la tua stanza: uscendo e rientrando ti unirai ai compagni.');hud();break}
  case 's':NET.peers=m.p||{};break;
  case 'runs':NET.runs=m.runs||{};break;
  case 'hit':pvpHurt(m);break;
  case 'ar':NET.ar=m.ar;if(m.gain){if(cineOK()){banner('Vittoria nella fossa!','Hai battuto '+m.vs+' · +'+m.gain+' punti arena','trofeo');burst(P.px,P.py,24,['#ffd84a','#ffffff'],{v:1.2,up:200})}else msg('Vittoria su '+m.vs+'! +'+m.gain+' punti arena');clog('','Hai guadagnato '+m.gain+' punti arena',{sys:1});jingle([72,76,79,84,88],.09)}else if(m.lost){if(cineOK())banner('Sconfitta',m.lost+' ha vinto il duello','spade');else msg('Sei stato sconfitto da '+m.lost+'.')}hud();if(PM==='arena'||PM==='lb')pn(PM);break;
  case 'pi':NET.send({t:'po',s:m.s});if(m.me>=0)NET.ping=m.me;setTime(m.gm);break;
  case 'time':setTime(m.gm);if(m.s)msg(m.s);break;
  case 'who':NET.who=Array.isArray(m.list)?m.list:[];if(PM==='who')pn('who');break;
  case 'profq':if(started&&P)NET.send({t:'profr',to:m.from,d:myProf()});break;
  case 'prof':{const o=NET.pl[m.from]||(PA&&PA.id===m.from&&PA.k==='pl'?PA:null);if(o){o.prof=m.d&&typeof m.d==='object'?m.d:null;o.par=m.ar||null;if(PM==='pl'&&PA===o)pn('pl')}break}
  case 'ann':msg(m.s);clog('',m.s,{sys:1,adm:m.adm});if(m.adm)tone(660,.12,'triangle');break;
  case 'cfg':NET.cfg=Object.assign({pvp:1,trade:1,chat:1,xpm:1,gm:1},m.c||{});hud();break;
  case 'kick':NET.kicked=1;save();started=0;netLeave();pn('kick',{s:String(m.s||'Sei stato disconnesso dal server.')});break;
  case 'adm':admCmd(m);break;
  case 'chat':clog(m.n,m.s,{adm:m.adm,z:m.z&&m.z!==Zk&&(Z[m.z]||DG[String(m.z).split('@')[0]])?zname(m.z).split(' · ')[0]:''});break;
  case 'join':clog('',m.n+(m.j?' è entrato nella stanza':' ha lasciato la stanza'),{sys:1});break;
  case 'bought':{NET.ar=m.ar;const a=AR[m.k];if(a&&P){const ai=arItem(a,P.lv);P.inv.push(ai);itemFly(ai);msg('Acquistato: '+a.n+(P.inv.length>INV?' (zaino oltre il limite: libera spazio)':''));jingle([67,72,76,79],.08);save()}hud();if(PM==='arena')pn('arena');break}
  case 'err':msg(m.s);tone(150,.15);break;
  case 'lb':NET.lb=Array.isArray(m.list)?m.list:[];if(PM==='lb')pn('lb');break;
  case 'tr':trMsg(m);break;
  case 'glist':if(m.rm===rmKey()){ents=ents.filter(e=>!e.gid);for(const q of Array.isArray(m.list)?m.list:[])addG(q)}break;
  case 'gadd':{const q=m.g;if(!q||!q.it)break;const mine=!!NET.pd[q.it.u];if(mine)delete NET.pd[q.it.u];if(m.rm===rmKey()){addG(q);if(mine){const d=ents.find(x=>x.gid===String(q.gid));if(d)arcFrom(d,P.px,P.py)}else clog('',q.by+' ha gettato a terra '+q.it.n,{sys:1})}break}
  case 'gdel':ents=ents.filter(e=>e.gid!==m.id);break;
  case 'x':VXP.emit(m);break;
  case 'ggot':{const it=gClean(m.it);if(!it)break;it.u=uid();gain(it);if(m.by&&m.by!==NET.name)clog('','Hai raccolto '+iname(it)+' lasciato da '+m.by,{sys:1});save();break}
  case 'gerr':{const o=NET.pd[m.u];if(o){delete NET.pd[m.u];if(P.inv.length<INV)P.inv.push(o.it);else dropLocal(o.it,o.x,o.y)}msg(m.s||'Non è stato possibile gettarlo a terra');hud();break}}}
/* ---- oggetti gettati a terra in multigiocatore: li tiene il server, chi li raccoglie per primo li prende ---- */
function gClean(o){if(!o||typeof o!=='object'||!'whcs'.includes(o.s)||String(o.s).length!==1)return null;const n=(v,a,b)=>Math.max(a,Math.min(b,Math.round(+v||0)));
  return{u:String(o.u||uid()).slice(0,12),s:o.s,r:n(o.r,0,3),v:n(o.v,1,99999),n:String(o.n||'Oggetto').slice(0,40),p:n(o.p,0,999999),hp:n(o.hp,0,9999),cr:n(o.cr,0,50),up:n(o.up,0,5)}}
function addG(q){if(!q||ents.some(e=>e.gid===q.gid))return;const it=gClean(q.it);if(!it)return;ents.push({k:'dr',px:clamp(+q.x||0,.5,N-.5),py:clamp(+q.y||0,.5,N-.5),it,gid:String(q.gid),by:String(q.by||'').slice(0,14)})}
function netDrop(it,x,y){NET.pd[it.u]={it,x,y,t:performance.now()};NET.send({t:'drop',it,x:+x.toFixed(2),y:+y.toFixed(2),rm:rmKey()})}
// se il server non conferma entro 6 secondi, l'oggetto resta a terra solo per te (non va perso)
function pdCheck(){for(const u in NET.pd){const o=NET.pd[u];if(performance.now()-o.t>6000){delete NET.pd[u];dropLocal(o.it,o.x,o.y);msg('Il server non ha risposto: '+iname(o.it)+' è a terra solo per te')}}}
const rmKey=()=>NET.code+'-'+Zk+(ZZ&&ZZ.dg?'#'+ZZ.run:'');
function netJoin(){NET.pl={};NET.list=[];NET.lt=1;if(NET.ok)NET.send({t:'gget',rm:rmKey()})}
function netTick(dt){if(!NET.ok)return;NET.lt+=dt;const q0=P.eq;
  if(NET.lt>.1){NET.lt=0;NET.ws&&NET.ws.readyState===1&&NET.ws.send(JSON.stringify({t:'p',d:{rm:rmKey(),zk:Zk,df:DFS.indexOf(DF),g:P.g,n:NET.name,x:+P.px.toFixed(2),y:+P.py.toFixed(2),hp:Math.max(0,P.hp|0),mx:P.mx,lv:P.lv,ap:apPack(P.ap||APD),fa:P.fc|0,
    c:q0.c?q0.c.r:-1,h:q0.h?q0.h.r:-1,w:q0.w?q0.w.r:0,wv:q0.w?iv(q0.w):3,s:q0.s?q0.s.r:-1,ty:tyPack(eqTy(q0)),sw:P.swc,hit:NET.hits,say:NET.say,...(typeof syncPack==='function'?syncPack():{})}}))}
  const seen={},rk=rmKey();
  for(const id in NET.peers){const q=NET.peers[id];if(!q||q.rm!==rk||typeof q.x!=='number'||typeof q.y!=='number')continue;seen[id]=1;let o=NET.pl[id];
    if(!o){o=NET.pl[id]={k:'pl',id,px:q.x,py:q.y,ls:Array.isArray(q.hit)?q.hit.reduce((a,h)=>Math.max(a,(h&&h[2])||0),0):0,sn:q.say?q.say.n:0,swc:q.sw,sw:0,bt:0,hp:1,mx:1,fl:0,mv:0};msg(String(q.n||'Un eroe').slice(0,14)+' è qui')}
    const k=Math.min(1,dt*10),ox=o.px,oy=o.py;o.px+=(q.x-o.px)*k;o.py+=(q.y-o.py)*k;o.mv=Math.hypot(o.px-ox,o.py-oy)>.002?.2:o.mv-dt;
    o.n=String(q.n||'Eroe').slice(0,14);o.hp=q.hp;o.mx=q.mx||1;o.lv=q.lv;o.c=q.c;o.h=q.h;o.w=q.w;o.wv=q.wv;o.s=q.s;o.ty=typeof q.ty==='string'?q.ty.slice(0,40):'';o.fc=(q.fa|0)&7;if(Array.isArray(q.ap)&&String(q.ap)!==o.aps){o.aps=String(q.ap);o.ap=apFix(q.ap)}o.sw-=dt;o.bt-=dt;o.fl-=dt;
    if(q.sw!==o.swc){o.swc=q.sw;o.sw=.2}
    if(q.say&&q.say.n!==o.sn){o.sn=q.say.n;o.bub=String(q.say.s).slice(0,60);o.bt=5}
    if(Array.isArray(q.hit)){const ls=o.ls;for(const h of q.hit){if(!Array.isArray(h))continue;if(h[2]>ls){const e=ents.find(x=>x.k==='en'&&(x.sg?x.sg===h[0]:x.id===h[0]));if(e&&!e.pup)hurtE(e,Math.max(1,Math.round(h[1]*e.mx)),1)}o.ls=Math.max(o.ls,h[2]||0)}}}
  for(const id in NET.pl)if(!seen[id])delete NET.pl[id];NET.list=Object.values(NET.pl)}
/* ---- registro della chat (in basso a sinistra): messaggi di tutta la stanza e avvisi importanti ---- */
let clT=0;
// 7.11.1: i link nella chat (http://, https:// e www.) sono cliccabili e si aprono in una nuova finestra
const LINKRX=/\b(?:https?:\/\/|www\.)(?:[^\s<>"'&]|&amp;)+/gi,hasLink=s=>/\b(?:https?:\/\/|www\.)\S/i.test(String(s||''));
function linkify(h){return h.replace(LINKRX,m=>{let u=m,tail='';while(/[.,;:!?)\]»]$/.test(u)&&u.length>4){tail=u.slice(-1)+tail;u=u.slice(0,-1)}
  const href=u.replace(/&amp;/g,'&'),full=/^https?:\/\//i.test(href)?href:'https://'+href;let ok=false;try{ok=/^https?:$/.test(new URL(full).protocol)}catch(_){}
  if(!ok)return m;const show=u.length>48?u.slice(0,45)+'…':u;return`<a class="clink" href="${esc(full)}" target="_blank" rel="noopener noreferrer nofollow" title="${esc(full)}">${show}</a>${tail}`})}
function clog(n,s,o={}){const box=$('cl'),d=document.createElement('div'),tm=new Date().toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'});
  if(o.sys)d.className=o.adm?'sys adm':'sys',d.innerHTML=`<span class="zn">${tm}</span> ${linkify(esc(s))}`;
  else{d.className=o.me?'me':o.adm?'adm':'';d.innerHTML=`<span class="zn">${tm}</span> <b>${esc(n)}</b>${o.z?` <span class="zn">(${esc(o.z)})</span>`:''}: ${linkify(esc(s))}`}
  const atEnd=box.scrollTop+box.clientHeight>=box.scrollHeight-8;box.appendChild(d);while(box.children.length>80)box.firstChild.remove();if(atEnd||o.me)box.scrollTop=box.scrollHeight;
  box.classList.remove('idle');clearTimeout(clT);clT=setTimeout(()=>box.classList.add('idle'),12000)}
$('ch').onfocus=()=>{for(const q in KEYS)KEYS[q]=0;$('cl').classList.add('on');$('cl').classList.remove('idle')};
$('ch').onblur=()=>{$('cl').classList.remove('on');clearTimeout(clT);clT=setTimeout(()=>$('cl').classList.add('idle'),6000)};
$('ch').onkeydown=e=>{if(e.key==='Enter'){const raw=e.target.value.trim(),v=raw.slice(0,hasLink(raw)?200:60);
    // "/comando": va solo al server (i comandi li aggiungono i plugin; /aiuto li elenca), senza fumetto sopra l'eroe
    if(v&&P&&v[0]==='/'){clog(NET.name,v,{me:1});if(NET.ok)NET.send({t:'chat',s:v,z:Zk});else clog('','I comandi con / funzionano solo in multigiocatore, su un server.',{sys:1})}
    else if(v&&P){NET.say={s:v.slice(0,60),n:Date.now()%1000000};P.bub=v.slice(0,60);P.bt=5;clog(NET.name,v,{me:1});NET.send({t:'chat',s:v,z:Zk})}e.target.value='';e.target.blur()}else if(e.key==='Escape')e.target.blur();e.stopPropagation()};

/* ---- comandi dell'admin del server (regali, cura, teletrasporto) ---- */
function admCmd(m){if(!P||!started)return;const n=Math.max(1,m.n|0),r=Math.max(0,Math.min(3,m.r|0));let t='';
  switch(m.a){case 'gold':P.g+=n;t='+'+n+' oro';break;case 'xp':gainXP(n);t='+'+n+' XP';break;case 'pot':P.pot+=n;t='+'+n+' pozioni';break;
    case 'lv':for(let i=0;i<n;i++)gainXP(Math.max(1,need()-P.xp));t='+'+n+(n>1?' livelli':' livello');break;
    case 'item':{let it=null;for(let k=0;k<60&&(!it||it.r!==r);k++)it=item(P.lv+1,r);gain(it);t='un oggetto: '+iname(it);break}
    case 'heal':P.hp=P.mx;t='cura completa';break;case 'tp':load('town');t='teletrasporto ad Aldoria';break;default:return}
  const by=m.by?'Da '+String(m.by).slice(0,40):'Dall\'admin';msg('🛡 '+by+': '+t);clog('',by+': '+t,{sys:1,adm:1});jingle([72,79,84],.09,'triangle');hud();save()}
/* ---- arena PvP ---- */
function pvpHit(o,d,cr){if(!NET.cfg.pvp){msg('Il PvP è disattivato dall\'admin');return}NET.send({t:'hit',to:o.id,d,cr});o.fl=.12;flt(o,(cr?'💥':'')+d,cr?'#ffd84a':'#ffaaaa');tone(cr?330:240,.05)}
function pvpHurt(m){if(Zk!=='arena'||!inPit(P.px,P.py)||P.hp<=0)return;if(P.iv>0){flt(P,'Schivata!','#8ce7ff');P.pf=3;return}const d=Math.max(1,Math.round(m.d*100/(100+def()*2.5)));P.hp-=d;P.fl=.15;flt(P,(m.cr?'💥':'')+d,'#ff6666');tone(110,.08);
  if(P.hp<=0){NET.send({t:'ko',by:m.from});P.hp=P.mx;P.px=19.5;P.py=4.5;P.path=[];P.tg=null;camX=PX(P.px,P.py);camY=PY(P.px,P.py,10);msg('Sei stato sconfitto da '+m.n+'! Torni nella sala d\'attesa.')}hud()}

/* ---- scambi tra giocatori ---- */
function trReq(){const o=PA;if(!o||!NET.ok)return;NET.send({t:'tr',a:'req',to:o.id});PM=0;$('pn').style.display='none';msg('Richiesta di scambio inviata a '+o.n)}
function trAns(y){const r=NET.trq;NET.trq=null;if(r)NET.send({t:'tr',a:y?'acc':'no',to:r.from});if(!y){PM=0;$('pn').style.display='none'}}
function trMsg(m){switch(m.a){
  case 'req':if(NET.tr||PM==='trade'||PM==='treq'||!started){NET.send({t:'tr',a:'no',to:m.from});return}NET.trq={from:m.from,n:m.n};pn('treq',{n:m.n});tone(880,.1);break;
  case 'sent':msg('In attesa che '+m.n+' accetti lo scambio…');break;
  case 'st':{if(!NET.tr)NET.tr={mine:{it:[],g:0}};NET.tr.n=m.n;NET.tr.you=m.you;NET.tr.them=m.them;PM='trade';pn('trade');break}
  case 'done':trDone(m);break;
  case 'end':NET.tr=NET.trq=null;if(PM==='trade'||PM==='treq'){PM=0;$('pn').style.display='none'}msg(m.s||'Scambio annullato');break}}
function tradeHTML(){const T=NET.tr;if(!T)return'';const you=T.you||{it:[],g:0},th=T.them||{it:[],g:0},off=new Set(T.mine.it);
  let h=`<h3>🤝 Scambio con ${esc(T.n)}</h3><div class="cols"><div><h4>La tua offerta ${you.ok?'<span class="up">✔ confermata</span>':''}</h4>`;
  h+=you.it.length?you.it.map(it=>`<div class="it"><span>${fmt(it)}</span><span><button onclick="trRem('${esc(it.u)}')">−</button></span></div>`).join(''):'<p class="mu">Nessun oggetto</p>';
  h+=`<div class="row"><label for="trg">💰 Oro</label><input type="number" id="trg" min="0" max="${P.g}" value="${T.mine.g}" onchange="trGold(this.value)"></div></div>`;
  h+=`<div><h4>Offerta di ${esc(T.n)} ${th.ok?'<span class="up">✔ confermata</span>':''}</h4>`+(th.it.length?th.it.map(it=>`<div class="it"><span>${fmt(it)}</span></div>`).join(''):'<p class="mu">Nessun oggetto</p>')+`<p>💰 ${th.g|0}</p></div></div>`;
  h+=`<h4>Il tuo zaino</h4>`;const av=P.inv.filter(it=>!off.has(it.u));h+=av.length?av.map(it=>`<div class="it"><span>${fmt(it)}</span><span>${it.ar?'<span class="mu">vincolato</span>':`<button onclick="trAdd('${esc(it.u)}')">+ Offri</button>`}</span></div>`).join(''):'<p class="mu">Niente da offrire.</p>';
  h+=`<p class="mu">Se una delle due offerte cambia, le conferme si azzerano. Lo scambio avviene solo quando confermate entrambi.</p><button onclick="trOk()" ${you.ok?'disabled':''}>✔ Conferma scambio</button><button onclick="trCancel()">Annulla</button>`;return h}
function trSend(){const T=NET.tr;if(!T)return;NET.send({t:'tr',a:'off',it:T.mine.it.map(u=>P.inv.find(i=>i.u===u)).filter(Boolean),g:T.mine.g})}
function trAdd(u){const T=NET.tr;if(!T||T.mine.it.length>=12||T.mine.it.includes(u))return;const it=P.inv.find(i=>i.u===u);if(!it||it.ar)return;T.mine.it.push(u);trSend()}
function trRem(u){const T=NET.tr;if(!T)return;T.mine.it=T.mine.it.filter(x=>x!==u);trSend()}
function trGold(v){const T=NET.tr;if(!T)return;T.mine.g=clamp(Math.floor(+v||0),0,P.g);trSend()}
function trOk(){const T=NET.tr;if(!T)return;if(T.mine.g>P.g||T.mine.it.some(u=>!P.inv.some(i=>i.u===u))){msg('La tua offerta non è più valida');return}NET.send({t:'tr',a:'ok'})}
function trCancel(){if(NET.tr)NET.send({t:'tr',a:'x'});NET.tr=null;PM=0;$('pn').style.display='none'}
function trDone(m){const give=m.give||{it:[],g:0},get=m.get||{it:[],g:0};
  for(const it of give.it){const i=P.inv.findIndex(x=>x.u===it.u);if(i>=0)P.inv.splice(i,1)}P.g=Math.max(0,P.g-(give.g|0));
  for(const it of get.it)P.inv.push(Object.assign({},it,{u:uid()}));P.g+=get.g|0;
  NET.tr=null;PM=0;$('pn').style.display='none';if(cineOK()){banner('Scambio completato','Con '+m.n+': '+get.it.length+' oggetti e '+(get.g|0)+' oro','mano');for(const it of get.it.slice(0,6))itemFly(it);goldFly(get.g|0)}else msg('Scambio completato con '+m.n+'! Ricevuti '+get.it.length+' oggetti e '+(get.g|0)+' oro');clog('','Scambio con '+m.n+': ricevuti '+get.it.length+' oggetti e '+(get.g|0)+' oro',{sys:1});jingle([67,72,76],.1);save();hud()}

// orologio del mondo condiviso: il server manda i minuti di gioco (1 secondo reale = 1 minuto)
function setTime(gm){if(typeof gm!=='number'||!isFinite(gm))return;const old=NET.tm==null?null:gNow();NET.tm=gm;NET.tmAt=performance.now();if(old==null)lastDay=gDay()}
