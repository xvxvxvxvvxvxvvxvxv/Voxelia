/* ================= 7.7: MODALITÀ SVILUPPATORE =================
   In basso a destra nel menu c'è un piccolo pulsante 🛠: chiede un codice e, se è giusto, apre il pannello sviluppatore.
   Da lì si vede tutto il gioco: ogni filmato (prologo, scene della storia, Voxelia Dimension, i finali), ogni zona della
   mappa, anche quelle che di solito non si possono visitare (interni chiusi, piani dei dungeon, sogni, prigioni, mari,
   campi di battaglia, epoche di Dimension), e qualche strumento per provare le cose in fretta.
   Le partite aperte dal pannello sono "di prova": non si salvano e non toccano il salvataggio della storia.
   Il codice non sta scritto qui in chiaro: si confronta solo la sua impronta. */
const DEVH=0x82db348b;   // impronta del codice (FNV-1a a 32 bit del codice in maiuscolo, senza spazi)
const DEV={on:LS.get('voxelia_dev',0)===1,sess:0,god:0,speed:1,tab:'film',q:''};
function devHash(s){let h=0x811c9dc5;for(const c of String(s).toUpperCase().replace(/\s+/g,''))h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0}
// il pulsante nel menu e quello durante il gioco (solo con la modalità attiva)
(function(){const b=document.createElement('button');b.id='devbtn';b.title='Pannello sviluppatore';b.setAttribute('aria-label','Pannello sviluppatore');b.textContent='🛠';b.onclick=()=>DEV.on?devOpen():devAsk();
  const m=$('menu');(m||document.body).appendChild(b);
  const f=document.createElement('button');f.id='devfab';f.title='Pannello sviluppatore (F9)';f.textContent='🛠';f.onclick=()=>devOpen();document.body.appendChild(f);
  const r=document.createElement('div');r.id='devbar';r.textContent='🛠 MODALITÀ SVILUPPATORE · questa partita non si salva';document.body.appendChild(r);devMark()})();
function devMark(){document.body.classList.toggle('devon',DEV.on);document.body.classList.toggle('devsess',!!DEV.sess)}
function devAsk(){let el=$('devp');if(!el){el=document.createElement('div');el.id='devp';document.body.appendChild(el)}el.hidden=false;
  el.innerHTML=`<div class="dvb dvask" role="dialog" aria-label="Codice sviluppatore"><h3>🛠 Modalità sviluppatore</h3><p class="mu">Inserisci il codice per sbloccare il pannello.</p>
  <form onsubmit="event.preventDefault();devTry(this.c.value)"><input name="c" type="password" autocomplete="off" placeholder="Codice" aria-label="Codice"><button class="gold">Entra</button></form><p id="dverr" class="dverr" aria-live="polite"></p><button onclick="devClose()">Annulla</button></div>`;
  setTimeout(()=>{const i=el.querySelector('input');if(i)i.focus()},30)}
function devTry(c){if(devHash(c)===DEVH){DEV.on=true;LS.set('voxelia_dev',1);devMark();jingle([60,64,67,72],.08,'square');devOpen();return}
  const e=$('dverr');if(e){e.textContent='Codice errato';const b=e.parentNode;if(b.animate)b.animate([{transform:'translateX(-8px)'},{transform:'translateX(8px)'},{transform:'none'}],{duration:260})}tone(140,.15,'sawtooth',.05)}
function devClose(){const el=$('devp');if(el){el.hidden=true;el.innerHTML=''}}
const devIsOpen=()=>{const el=$('devp');return!!(el&&!el.hidden)};
function devOpen(){if(!DEV.on){devAsk();return}let el=$('devp');if(!el){el=document.createElement('div');el.id='devp';document.body.appendChild(el)}el.hidden=false;devRender()}
function devRender(){const el=$('devp');if(!el||el.hidden)return;const T=[['film','🎬 Filmati'],['zone','🗺 Zone'],['eroe','⚔ Eroe e storia'],['altro','⚙ Altro']];
  el.innerHTML=`<div class="dvb" role="dialog" aria-label="Pannello sviluppatore"><div class="dvh"><b>🛠 Pannello sviluppatore</b><span class="mu">${DEV.sess?'partita di prova in corso':started?'partita in corso':'dal menu'}</span><button class="dvx" onclick="devClose()" aria-label="Chiudi">✕</button></div>
  <div class="dvt">${T.map(([k,n])=>`<button class="${DEV.tab===k?'on':''}" onclick="DEV.tab='${k}';devRender()">${n}</button>`).join('')}</div><div class="dvc" id="dvc">${devBody()}</div></div>`;
  const q=$('dvq');if(q&&DEV.qf){q.focus();q.setSelectionRange(q.value.length,q.value.length)}}
/* ---- filmati ---- */
const DEVF=()=>[['Prologo',[['Il Regno Perduto · prologo completo','playIntro(devBackMenu)']]],
  ['Scene della storia',FLIST().map(id=>[filmGet(id).n,`filmPlay('${id}',devBackMenu)`])],
  ['Cinematiche dei capitoli segreti',[['Il frammento falso (le prigioni)','playCine(ARRC,\'dungeon\',devBackMenu)'],['Il vero finale','playCine(ENDC,\'notte\',devBackMenu)'],['Il tesoro del Capitano Scarlatto','playCine(TREASC,\'boarding\',devBackMenu)']]],
  ['Voxelia Dimension',[['La cabina blu (inizio)','playCine(DCI,\'dimintro\',devBackMenu)'],['Ritorno a casa (finale)','playCine(DCF,\'dimend\',devBackMenu)']]]];
function devBackMenu(){if(started)return;$('menu').style.display='flex';inMenu=1;music('menu')}
function devFilm(code){devClose();if(started&&!DEV.sess){if(!confirm('Per vedere il filmato si torna al menu (la partita viene salvata). Continuare?'))return;toMenu()}else if(DEV.sess)toMenu();
  setTimeout(()=>{try{new Function(code)()}catch(e){msg('Filmato non disponibile: '+e.message)}},80)}
/* ---- zone ---- */
const DEVSPEC={sogno:'il sogno del motel',occhio:'la stanza dell\'Occhio',culto:'il covo del culto',cella:'la cella delle prigioni',mare:'la navigazione',arrembaggio:'l\'arrembaggio',stiva:'la stiva della nave',dim_hub:'la Cabina di Dimension'};
function devZones(){const Z2=Object.keys(Z),cat={'Città e dintorni':[],'Interni':[],'Dungeon (tutti i piani)':[],'Mare e battaglie':[],'Voxelia Dimension':[],'Speciali e segrete':[]};
  for(const k of Z2){const z=Z[k];if(!z||z.ed)continue;const n=z.n||k;
    if(k.startsWith('dim_'))cat['Voxelia Dimension'].push([k,n]);else if(k.startsWith('mare')||k.startsWith('bat_')||k==='arrembaggio'||k==='stiva')cat['Mare e battaglie'].push([k,n]);
    else if(DEVSPEC[k]||/segret|cripta|passaggio|prigion|sogno|culto|occhio|cella/.test(k))cat['Speciali e segrete'].push([k,n]);else if(z.lay||k.startsWith('in_')||k.startsWith('cas_')||k.startsWith('lib_'))cat['Interni'].push([k,n]);else cat['Città e dintorni'].push([k,n])}
  for(const id of Object.keys(DG)){const d=DG[id];for(let f=1;f<=(d.fls||3);f++)cat['Dungeon (tutti i piani)'].push([id+'@'+f,d.n+' · piano '+f+(f===d.fls?' (boss)':'')])}return cat}
function devBody(){switch(DEV.tab){
  case 'film':return DEVF().map(([g2,L])=>`<h4>${g2}</h4>`+L.map(([n,c])=>`<div class="dvr"><span>${esc(n)}</span><button onclick="devFilm(${esc(JSON.stringify(c))})">▶ Guarda</button></div>`).join('')).join('')+'<p class="mu">Il filmato parte dal menu; alla fine si torna lì.</p>';
  case 'zone':{const q=DEV.q.toLowerCase(),C=devZones();let h=`<input id="dvq" placeholder="🔍 Cerca una zona" value="${esc(DEV.q)}" oninput="DEV.q=this.value;DEV.qf=1;devRender()" aria-label="Cerca una zona"><p class="mu">${started?'Teletrasporto immediato.':'Si avvia una partita di prova (non si salva) e si entra nella zona.'} Le zone che di solito si aprono solo con la loro missione vengono preparate al volo.</p>`;
    for(const c in C){const L=C[c].filter(([k,n])=>!q||(k+' '+n).toLowerCase().includes(q));if(!L.length)continue;h+=`<h4>${c} <span class="mu">${L.length}</span></h4><div class="dvz">`+L.map(([k,n])=>`<button onclick="devGo(${esc(JSON.stringify(k))})" title="${esc(k)}">${esc(n)}</button>`).join('')+'</div>'}return h}
  case 'eroe':{if(!started||!P)return`<p>Avvia prima una partita (o entra in una zona dalla scheda 🗺 Zone).</p><button onclick="devStart();devRender()">▶ Partita di prova ad Aldoria</button>`;
    const st=['0 · Il Re ti aspetta','1 · Cerca i frammenti','2 · Frammenti trovati','3 · Verso la Cittadella','4 · Malakar sconfitto','5 · Campione di Aldoria'];
    return`<div class="dvr"><span>Invincibile</span><input type="checkbox" ${DEV.god?'checked':''} onchange="DEV.god=this.checked?1:0"></div>
    <div class="dvr"><span>Livello ${P.lv}</span><span><button onclick="devLv(1)">+1</button><button onclick="devLv(5)">+5</button><button onclick="devLv(20)">+20</button></span></div>
    <div class="dvr"><span>Oro ${P.g}</span><span><button onclick="P.g+=1000;hud();devRender()">+1.000</button><button onclick="P.g+=100000;hud();devRender()">+100.000</button></span></div>
    <div class="dvr"><span>Pozioni ${P.pot}</span><button onclick="P.pot+=20;hud();devRender()">+20</button></div>
    <div class="dvr"><span>Cura completa</span><button onclick="P.hp=P.mx;hud()">✚ Cura</button></div>
    <div class="dvr"><span>Frammenti ${(P.sh||[]).length}/6</span><button onclick="P.sh=SHARDS.slice();if(P.st===1)P.st=2;npcMarks();hud();devRender()">Dai tutti i frammenti</button></div>
    <div class="dvr"><span>Fase della storia</span><select onchange="P.st=+this.value;npcMarks();hud();devRender()">${st.map((n,i)=>`<option value="${i}"${P.st===i?' selected':''}>${n}</option>`).join('')}</select></div>
    <div class="dvr"><span>Oggetto leggendario</span><button onclick="devItem()">⚔ Dai un'arma leggendaria</button></div>`}
  case 'altro':return`<div class="dvr"><span>Ora del giorno</span><span>${[[6,'🌅 Alba'],[12,'☀ Giorno'],[19,'🌇 Tramonto'],[23,'🌙 Notte']].map(([h,n])=>`<button onclick="devHour(${h})" ${started?'':'disabled'}>${n}</button>`).join('')}</span></div>
    <div class="dvr"><span>Velocità del gioco ×${DEV.speed}</span><span>${[.5,1,2,4].map(v=>`<button class="${DEV.speed===v?'on':''}" onclick="DEV.speed=${v};devRender()">×${v}</button>`).join('')}</span></div>
    <div class="dvr"><span>Contatore FPS</span><input type="checkbox" ${SET.fps?'checked':''} onchange="setv('fps',this.checked?1:0)"></div>
    <div class="dvr"><span>Voxelia Dimension (nascosta dal menu)</span><button onclick="devClose();if(started)toMenu();setTimeout(()=>mode('dim'),60)">🌀 Apri</button></div>
    <div class="dvr"><span>Rivedi il tour di benvenuto</span><button onclick="LS.del('voxelia_tour');msg('Il tour ripartirà alla prossima partita in città')">↺</button></div>
    ${DEV.sess?`<div class="dvr"><span>Partita di prova</span><button onclick="devClose();toMenu()">⏏ Termina e torna al menu</button></div>`:''}
    <div class="dvr"><span>Modalità sviluppatore</span><button class="danger" onclick="DEV.on=false;DEV.god=0;DEV.speed=1;LS.del('voxelia_dev');devMark();devClose();msg('Modalità sviluppatore disattivata')">Disattiva</button></div>`}return''}
// partita di prova: un eroe nuovo, niente salvataggi
function devStart(){if(started)return;DEV.sess=1;devMark();const rc=$('rc'),rv=rc?rc.value:'';if(rc)rc.value='';const tv=LS.get('voxelia_tour',0);LS.set('voxelia_tour',1);
  try{begin(1,null)}finally{if(rc)rc.value=rv;if(!tv)LS.del('voxelia_tour')}if(typeof tourEnd==='function')try{tourEnd()}catch(e){}cl();P.lv=Math.max(P.lv,10);recalc();P.hp=P.mx;P.g+=2000;P.pot+=10;hud()}
function devGo(k){devClose();if(MODE==='ed')return msg('Esci prima dall\'editor');if(!started)devStart();if(!started)return;
  try{cl();cineOff();if(k.startsWith('dim_')&&MODE!=='dim'){devDim(k);return}
    if(k==='mare'&&typeof sailStart==='function'){sailStart();return}
    irisGo(()=>{try{load(k,Zk||'town');msg('🛠 '+((Z[k]||zd(k)||{}).n||k))}catch(e){msg('⚠ Zona non caricabile da qui: '+e.message);load('town')}})}catch(e){msg('⚠ '+e.message)}}
// le epoche di Dimension hanno bisogno del loro viaggio: se ne prepara uno di prova
function devDim(k){try{DIM={era:{},seen:1,done:0,cur:null};MODE='dim';document.body.classList.add('dimm');if(typeof dimSkyInit==='function')dimSkyInit();
  const era=typeof ERAK!=='undefined'&&ERAK.find(e=>ERA[e].z===k);if(era){DIM.cur=era;DIM.era[era]={s:0,c:null,done:0}}irisGo(()=>{load(k,'dim_hub');if(typeof dimObj==='function')dimObj()})}catch(e){msg('⚠ '+e.message)}}
function devLv(n){for(let i=0;i<n;i++){P.xp=0;P.lv++}recalc();P.hp=P.mx;hud();devRender()}
function devHour(h){if(!P)return;P.gt=Math.floor((P.gt||0)/1440)*1440+1440+h*60;if(NET)NET.tm=null;if(typeof timeTick==='function')timeTick(0);devRender()}
function devItem(){if(!P)return;if(P.inv.length>=INV){msg('Zaino pieno');return}P.inv.push(item(Math.max(10,P.lv),3,'w'));hud();msg('⚔ Arma leggendaria nello zaino')}
// niente salvataggi nelle partite di prova; invincibilità; velocità
const _saveDev=save;save=function(){if(DEV.sess)return;_saveDev()};
const _dieDev=die;die=function(){if(DEV.god&&P){P.hp=P.mx;return}_dieDev()};
const _updDev=upd;upd=function(dt){if(DEV.god&&P&&P.hp<P.mx*.5)P.hp=P.mx;_updDev(dt*(DEV.speed||1))};
const _toMenuDev=toMenu;toMenu=function(){const s=DEV.sess;_toMenuDev();if(s){DEV.sess=0;DEV.god=0;DEV.speed=1;MODE='story';DIM=null;document.body.classList.remove('dimm');devMark()}};
addEventListener('keydown',e=>{if(devIsOpen()){if(e.key==='Escape')devClose();e.stopImmediatePropagation();return}if(e.key==='F9'&&DEV.on){e.preventDefault();devOpen()}},true);

(function(){const st=document.createElement('style');st.textContent=`
#devbtn,#menu #devbtn{position:fixed;right:14px;bottom:14px;z-index:6;width:38px;height:38px;padding:0;border-radius:50%;font-size:17px;opacity:.38;background:#0b0e18cc;border:1px solid #ffffff33;transition:opacity .2s,transform .2s}
#devbtn:hover,#devbtn:focus-visible{opacity:1;transform:rotate(-20deg)}body.devon #devbtn{opacity:.85;border-color:#5ad0ff}
#devfab{position:fixed;right:10px;bottom:calc(10px + env(safe-area-inset-bottom,0px));z-index:26;display:none;width:36px;height:36px;padding:0;border-radius:50%;font-size:16px;background:#0b0e18cc;border:1px solid #5ad0ff}
body.devon.ig #devfab{display:block}body.edm #devfab{display:none!important}
#devbar{position:fixed;left:50%;top:0;transform:translateX(-50%);z-index:27;display:none;background:#5ad0ff;color:#06202c;font:bold 11px system-ui,sans-serif;letter-spacing:.5px;padding:2px 12px;border-radius:0 0 8px 8px;pointer-events:none}body.devsess.ig #devbar{display:block}
#devp{position:fixed;inset:0;z-index:64;display:flex;align-items:center;justify-content:center;background:#000b;font:14px Georgia,serif;color:#e8ecf4}#devp[hidden]{display:none}
.dvb{width:min(760px,96vw);max-height:90vh;display:flex;flex-direction:column;background:#121828;border:2px solid #5ad0ff;border-radius:12px;box-shadow:0 20px 60px #000c;overflow:hidden}
.dvask{width:min(380px,92vw);padding:16px 20px;gap:8px}.dvask h3{margin:0;color:#5ad0ff}.dvask form{display:flex;gap:6px}.dvask input{flex:1;font:inherit;background:#0b0e18;color:#fff;border:1px solid #5ad0ff88;border-radius:6px;padding:7px 10px}.dverr{color:#ff8a8a;min-height:1.2em;margin:0}
.dvh{display:flex;align-items:center;gap:12px;padding:8px 12px 8px 16px;border-bottom:1px solid #5ad0ff55}.dvh b{font-size:18px;color:#5ad0ff}.dvx{margin-left:auto;background:transparent!important;border:none!important;font-size:18px}
.dvt{display:flex;flex-wrap:wrap;gap:4px;padding:8px 12px;border-bottom:1px solid #ffffff14}.dvt button{border-radius:16px;padding:5px 12px}.dvt button.on,.dvr button.on{background:#1e4a7a;border-color:#5ad0ff}
.dvc{overflow-y:auto;padding:8px 16px 16px}.dvc h4{margin:14px 0 6px;color:#9fd0ff}.dvc input#dvq{width:100%;box-sizing:border-box;font:inherit;background:#0b0e18;color:#fff;border:1px solid #5ad0ff66;border-radius:6px;padding:7px 10px;margin-top:6px}
.dvr{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:6px 0;border-bottom:1px solid #ffffff10;flex-wrap:wrap}.dvr select{font:inherit;background:#0b0e18;color:#fff;border:1px solid #5ad0ff66;border-radius:6px;padding:4px}
.dvz{display:flex;flex-wrap:wrap;gap:4px}.dvz button{font-size:12px;padding:4px 9px}.mu{color:#9aa4b8}`;document.head.appendChild(st)})();
