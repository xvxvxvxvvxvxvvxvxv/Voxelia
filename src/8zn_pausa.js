/* ================= 7.15: IL PULSANTE DELLE IMPOSTAZIONI E IL MENU DI PAUSA =================
   Un ingranaggio sempre in vista in alto (e il tasto Esc quando non c'è niente di aperto) apre il menu di pausa:
   riprendi, vista classica o 3D con le sue opzioni, impostazioni del gioco, aspetto dell'eroe, comandi, salvataggio e
   ritorno al menu principale. Le opzioni della vista 3D sono anche nelle Impostazioni, in una sezione tutta loro. */
const D3Q=['','Bassa','Media','Alta'];
function d3Opt(k,v){if(k==='q')D3.q=clamp(v|0,1,3);else D3[k]=v;d3Save();if(D3.ok&&(k==='q'||k==='gr'||k==='far'||k==='vx')){d3Reset()}if(k==='q'){D3.smS=0}}
function d3OptHTML(){const chk=(k,l)=>`<div class="row"><label for="d3_${k}">${l}</label><input type="checkbox" id="d3_${k}" ${D3[k]?'checked':''} onchange="d3Opt('${k}',this.checked?1:0)"></div>`;
  return`<div class="row"><label for="d3_q">Dettaglio della vista 3D</label><select id="d3_q" onchange="d3Opt('q',+this.value)">${[1,2,3].map(i=>`<option value="${i}" ${D3.q===i?'selected':''}>${D3Q[i]}</option>`).join('')}</select></div>`
    +`<div class="row"><label for="d3_vx">Stile della vista 3D</label><select id="d3_vx" onchange="d3Opt('vx',+this.value)"><option value="1" ${D3.vx?'selected':''}>Voxel (cubetti netti)</option><option value="0" ${D3.vx?'':'selected'}>Liscio (spigoli arrotondati)</option></select></div>`
    +chk('sh','Ombre del sole')+chk('gr','Fili d\'erba mossi dal vento')+chk('far','Orizzonte lontano (il mondo oltre i confini fino alle montagne)')
    +`<div class="row"><label for="d3_sens">Velocità della telecamera</label><input type="range" id="d3_sens" min=".3" max="2.5" step=".1" value="${D3.sens||1}" oninput="d3Opt('sens',+this.value)"></div>`
    +chk('inv','Inverti il movimento verticale della telecamera')
    +`<p class="mu">Tasto destro del mouse (o due dita) per girare la telecamera, rotellina (o pizzico) per avvicinarla. Con il dettaglio Alto la vista è più nitida e le ombre più precise; se il gioco rallenta, la vista 3D abbassa da sola la risoluzione.</p>`}
// nelle Impostazioni: una sezione «Vista 3D»
SETCAT.splice(2,0,['v3d','schermo','Vista 3D','Classica o 3D, dettaglio, ombre, orizzonte, telecamera',[]]);
const _setBody715=setBody;setBody=function(k){if(k!=='v3d')return _setBody715(k);
  return sGrp('Vista',`<div class="row"><label>Vista del mondo</label><span><button class="${D3.on?'':'on'}" onclick="d3Toggle(0);openSet()">Classica</button> <button class="${D3.on?'on':''}" onclick="d3Toggle(1);openSet()">3D</button></span></div><p class="mu">Si cambia in qualsiasi momento, anche con il tasto B o con il pulsante 3D in alto: la partita continua uguale.</p>`)
    +sGrp('Opzioni 3D',d3OptHTML())};

/* ---- il menu di pausa ---- */
let PSV=0;
function pauseHTML(){const sv=PSV?`<p class="up">✔ Partita salvata</p>`:'';
  return`<div class="psw"><h3>${ico('ingranaggio',22)} Pausa</h3>
  <button class="psb pri" onclick="cl()">${ico('gioca',20)}<span><b>Riprendi</b><small>Torna a giocare (Esc)</small></span></button>
  <div class="psg"><h4>Vista</h4><div class="psv"><button class="${D3.on?'':'on'}" onclick="d3Toggle(0);pn('pausa')"><b>Classica</b><small>Dall'alto, come sempre</small></button><button class="${D3.on?'on':''}" onclick="d3Toggle(1);pn('pausa')"><b>3D</b><small>Profondità, luce e orizzonte</small></button></div>
  ${D3.on?`<details class="psd"><summary>Opzioni della vista 3D</summary>${d3OptHTML()}</details>`:''}</div>
  <button class="psb" onclick="cl();openSet()">${ico('schermo',20)}<span><b>Impostazioni</b><small>Audio, grafica, comandi, interfaccia (O)</small></span></button>
  <button class="psb" onclick="cl();openLook()">${ico('pennello',20)}<span><b>Aspetto dell'eroe</b><small>Pelle, capelli, vestiti, mantello (C)</small></span></button>
  <button class="psb" onclick="pauseKeys()">${ico('libro',20)}<span><b>Comandi</b><small>Tastiera, mouse e tocco</small></span></button>
  <button class="psb" onclick="save();PSV=1;pn('pausa');setTimeout(()=>{PSV=0},2500)">${ico('spunta',20)}<span><b>Salva ora</b><small>Il gioco salva anche da solo</small></span></button>${sv}
  <button class="psb dn" onclick="if(confirm('Tornare al menu principale? La partita viene salvata.')){cl();toMenu()}">${ico('corona',20)}<span><b>Menu principale</b><small>Salva e torna al menu</small></span></button></div>`}
function pauseKeys(){edPanel('pausa',`<h3>${ico('libro',22)} Comandi</h3><p>${$('mhelp')?esc($('mhelp').textContent):''}</p><p><b>Vista 3D:</b> B cambia vista · tasto destro del mouse o due dita per girare la telecamera · rotellina o pizzico per avvicinarla · WASD e la levetta si muovono rispetto alla telecamera.</p><p><b>Esc</b> apre e chiude questo menu.</p><button onclick="pn('pausa')">← Indietro</button>`)}
const _pn715=pn;pn=function(m,arg){if(m==='pausa'&&started){if(arg!==undefined)PA=arg;edPanel('pausa',pauseHTML());return}_pn715(m,arg)};
// Esc con niente di aperto apre la pausa (con qualcosa di aperto lo chiude, come sempre)
let ESC0=0;
document.addEventListener('keydown',e=>{if(e.key!=='Escape')return;const mp=$('mappa');ESC0=started&&!PM&&!HED&&$('set').style.display!=='block'&&$('look').style.display!=='block'&&$('chg').style.display!=='block'&&!(mp&&mp.style.display==='flex')&&!(typeof devIsOpen==='function'&&devIsOpen())&&!document.body.classList.contains('film')?1:0},true);
addEventListener('keydown',e=>{if(e.key==='Escape'&&ESC0&&started&&!PM){ESC0=0;pn('pausa')}});
document.body.insertAdjacentHTML('beforeend',`<button id="gbtn" class="hbtn" onclick="if(started){PM==='pausa'?cl():pn('pausa')}" title="Pausa e impostazioni (Esc)" aria-label="Pausa e impostazioni">${ico('ingranaggio',22)}</button>`);
document.head.insertAdjacentHTML('beforeend',`<style>
#gbtn{right:150px;top:calc(10px + env(safe-area-inset-top,0px))}#gbtn img{display:block}
body:not(.ig) #gbtn,body.film #gbtn{display:none!important}
@media (max-width:700px){#gbtn{right:104px}#v3b{right:150px}}
.psw{min-width:min(360px,80vw)}.psw h3{margin-top:0}
.psb{display:flex;align-items:center;gap:10px;width:100%;text-align:left;margin:6px 0;padding:8px 10px}.psb span{display:flex;flex-direction:column}.psb small{opacity:.75;font-weight:normal}
.psb.pri{border-color:#ffd84a!important}.psb.dn{border-color:#ff8a7a88!important;margin-top:12px}
.psg{border:1px solid #ffffff22;border-radius:8px;padding:6px 10px;margin:8px 0}.psg h4{margin:2px 0 6px}
.psv{display:grid;grid-template-columns:1fr 1fr;gap:8px}.psv button{display:flex;flex-direction:column;align-items:flex-start;padding:8px 10px;opacity:.75}.psv button.on{opacity:1;border-color:#ffd84a!important;color:#ffd84a}.psv small{font-weight:normal;opacity:.8}
.psd{margin-top:8px}.psd summary{cursor:pointer;color:#f5b942}
</style>`);
iconFill($('gbtn'));
