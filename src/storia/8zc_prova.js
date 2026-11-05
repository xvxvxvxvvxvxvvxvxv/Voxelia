/* ================= 7.12: PANNELLO SVILUPPATORE — PROVA DEI BOSS =================
   Una scheda nuova, «👑 Boss», con tutte le battaglie contro i boss del gioco, compresa quella segreta dell'Abominio (le
   cinque fasi sotto Aldoria Vecchia) e il Dottor Corvus di Voxelia Dimension. Ogni prova si gioca in una partita a parte:
   - l'eroe viene preparato per quel combattimento (livello, equipaggiamento, pozioni) e parte già davanti al boss;
   - è una partita di prova del pannello: non si salva, e la partita vera (se c'era) viene salvata e chiusa prima di cominciare;
   - non si collega al server: classifica, punti arena, cicli dei dungeon e plugin non vedono niente;
   - niente ricompense e niente filmati: quando il boss cade (o cadi tu) compare il resoconto, con tempo, danni e pozioni.
   Le prove non toccano nemmeno il salvataggio di Voxelia Dimension e, a difficoltà Incubo, non cancellano nessuna partita. */
// k: nemico (o 'abominio'), z: zona, lv: livello consigliato dell'eroe, keep: tiene anche gli scagnozzi del boss
const BTL=[['Modalità Storia',[
    {k:'troll',z:'forest',lv:4,ic:'🌲'},{k:'re_goblin',z:'tana@2',lv:5,ic:'👺'},{k:'faraone',z:'desert',lv:6,ic:'🏜'},{k:'necromante',z:'cripta@3',lv:8,ic:'💀'},
    {k:'vexmoor',z:'rovine',lv:8,ic:'🏚'},{k:'sfinge',z:'piramide@3',lv:10,ic:'🔺'},{k:'drago_brina',z:'peaks',lv:10,ic:'🐉'},{k:'scarlatto',z:'stiva',lv:10,ic:'🏴‍☠️',keep:1,zl:8},
    {k:'regina',z:'cristallo@3',lv:12,ic:'🕷'},{k:'ignis',z:'fucina@3',lv:14,ic:'🔥'},{k:'leviatano',z:'abisso@3',lv:16,ic:'🌊'},{k:'lich',z:'cittadella@4',lv:19,ic:'👑'}]],
  ['Il segreto di Aldoria Vecchia',[{k:'abominio',z:'occhio',lv:18,ic:'👁',n:'L\'Abominio (cinque fasi)'}]],
  ['Voxelia Dimension',[{k:'corvus',z:'dim_vit',lv:10,ic:'🎩',keep:1,dim:'vit'}]]];
const BTO={df:1,lv:'c',r:2,god:0};   // le scelte della scheda: difficoltà, livello dell'eroe, rarità dell'equipaggiamento, invincibile
let BT=null;                          // la prova in corso
const btFind=k=>{for(const[,L]of BTL)for(const b of L)if(b.k===k)return b;return null};
const btName=b=>b.n||(E[b.k]?E[b.k].n:b.k);
const btLv=b=>BTO.lv==='m'?40:BTO.lv==='p'?b.lv+5:b.lv;
function btZoneN(b){try{return String(Z[b.z]?Z[b.z].n:zname(b.z))}catch(_){return b.z}}
function btHTML(){const df=DFS.map((d,i)=>`<option value="${i}"${BTO.df===i?' selected':''}>${d.n}</option>`).join('');
  let h=`<p class="mu">Ogni prova si gioca in una <b>partita a parte</b>: l'eroe viene preparato per il combattimento e parte già davanti al boss. Non si salva niente e non si usa il server: classifica, punti arena, cicli dei dungeon e plugin non vedono nulla. Niente ricompense: alla fine vedi com'è andata.${started&&!DEV.sess?' <b>La partita in corso verrà salvata e chiusa prima della prova.</b>':''}</p>
  <div class="dvr"><span>Difficoltà</span><select onchange="BTO.df=+this.value" aria-label="Difficoltà della prova">${df}</select></div>
  <div class="dvr"><span>Eroe</span><select onchange="BTO.lv=this.value" aria-label="Livello dell'eroe"><option value="c"${BTO.lv==='c'?' selected':''}>al livello consigliato</option><option value="p"${BTO.lv==='p'?' selected':''}>5 livelli sopra</option><option value="m"${BTO.lv==='m'?' selected':''}>al livello 40</option></select></div>
  <div class="dvr"><span>Equipaggiamento</span><select onchange="BTO.r=+this.value" aria-label="Equipaggiamento"><option value="1"${BTO.r===1?' selected':''}>raro</option><option value="2"${BTO.r===2?' selected':''}>epico</option><option value="3"${BTO.r===3?' selected':''}>leggendario</option></select></div>
  <div class="dvr"><span>Invincibile durante la prova</span><input type="checkbox" ${BTO.god?'checked':''} onchange="BTO.god=this.checked?1:0;if(BT)DEV.god=BTO.god" aria-label="Invincibile durante la prova"></div>`;
  for(const[g2,L]of BTL){h+=`<h4>${g2}</h4>`;for(const b of L)h+=`<div class="dvr"><span>${b.ic} ${esc(btName(b))} <small class="mu">· ${esc(btZoneN(b).split(' · ')[0])} · eroe di livello ${btLv(b)}</small></span><button onclick="btGo('${b.k}')">⚔ Combatti</button></div>`}
  if(BT)h+=`<div class="dvr"><span>Prova in corso: ${esc(btName(BT.b))}</span><button onclick="devClose();btQuit()">⏏ Termina la prova</button></div>`;
  return h}
// la scheda nel pannello
const _devBody712=devBody;devBody=function(){return DEV.tab==='boss'?btHTML():_devBody712()};
const _devRender712=devRender;devRender=function(){_devRender712();const el=$('devp'),bar=el&&el.querySelector('.dvt');if(!bar||bar.querySelector('[data-bt]'))return;
  const b=document.createElement('button');b.dataset.bt=1;b.textContent='👑 Boss';b.className=DEV.tab==='boss'?'on':'';b.onclick=()=>{DEV.tab='boss';devRender()};const z=[...bar.children][1];if(z)z.after(b);else bar.appendChild(b)};
/* ---- comincia una prova ---- */
function btGo(k){const b=btFind(k);if(!b)return;devClose();if(MODE==='ed'){msg('Esci prima dall\'editor');return}
  if(started&&!DEV.sess&&!confirm('La prova del boss si gioca in una partita a parte: la tua partita viene salvata e chiusa. Continuare?'))return;
  if(started){BT=null;toMenu()}
  setTimeout(()=>btStart(b),80)}
function btStart(b){devStart();if(!started||!P)return;cl();
  const lv=btLv(b);DF=DFS[BTO.df]||DFS[1];P.lv=lv;P.xp=0;P.g=0;P.pot=b.dim?12:20;P.inv=[];
  const it=s=>{const o=item(lv,BTO.r,s);o.r=Math.max(o.r,BTO.r);return o};P.eq={w:it('w'),h:it('h'),c:it('c'),s:it('s')};
  if(b.k==='abominio'){P.te=1;P.key=1;P.tru=1;P.s7=1;P.st=5}
  recalc();P.hp=P.mx;P.pc=0;DEV.god=BTO.god;
  BT={b,boss:b.k,el:0,dmg:0,pots:0,falls:0,done:0,lv,df:BTO.df,zl:null};
  if(b.zl&&Z[b.z]){BT.zl=[b.z,Z[b.z].lv];Z[b.z].lv=b.zl}
  if(b.dim){DIM={era:{[b.dim]:{s:ERA[b.dim].st.length-1,c:null,done:0}},seen:1,done:0,cur:b.dim};MODE='dim';document.body.classList.add('dimm');if(typeof dimSkyInit==='function')dimSkyInit()}
  irisGo(()=>{try{load(b.z,b.dim?'dim_hub':'town');btPlace()}catch(e){msg('⚠ Prova non disponibile: '+e.message);console.warn(e)}});hud()}
// l'eroe davanti al boss, a cinque passi; via gli altri nemici (tranne gli scagnozzi di chi combatte con la sua ciurma)
function btPlace(){if(!BT)return;BT.el=0;const b=BT.b;if(b.k==='abominio'){msg('🛠 Prova: '+btName(b));return}
  const e=ents.find(q=>q.k==='en'&&q.t===b.k);if(!e){msg('⚠ Il boss non è in questa zona');return}
  if(!b.keep)ents=ents.filter(q=>q.k!=='en'||q===e);
  if(b.k==='corvus')ents=ents.filter(q=>!(q.k==='npc'&&q.nid==='corvus_npc'));   // il Corvus «civile» non resta accanto a quello che combatte
  const d=bfs(e.px|0,e.py|0);let best=null,bs=-1e9;
  for(let y=1;y<N-1;y++)for(let x=1;x<N-1;x++){const q=d[y*N+x];if(q<0||!WK(M[y][x])||ents.some(o=>o.k==='po'&&(o.px|0)===x&&(o.py|0)===y))continue;const r=Math.hypot(x+.5-e.px,y+.5-e.py),sc=-Math.abs(r-5)*2-Math.max(0,q-7)*.5;if(sc>bs){bs=sc;best=[x,y]}}
  if(best){P.px=best[0]+.5;P.py=best[1]+.5;P.path=[];P.tg=null;camX=PX(P.px,P.py);camY=PY(P.px,P.py,10)}
  e.al=0;msg('🛠 Prova: '+btName(b)+' · '+DFS[BT.df].n+' · eroe di livello '+BT.lv)}
/* ---- come va a finire ---- */
function btEnd(win){if(!BT||BT.done)return;BT.done=1;BT.win=win;if(P){P.hp=P.mx;P.iv=0}
  if(OCC){if(OCC.intro&&typeof occIntroEnd==='function')occIntroEnd();OCC=null}
  ents=ents.filter(q=>q.k!=='en');PJ=[];fx=fx.filter(f=>f.k!=='warn');
  if(win)jingle([72,76,79,84,88],.1,'triangle');else tone(110,.6,'sawtooth',.06);setTimeout(btShow,win?1400:600)}
function btShow(){if(!BT)return;let el=$('btres');if(!el){el=document.createElement('div');el.id='btres';document.body.appendChild(el)}const b=BT.b,m=Math.floor(BT.el/60),s=Math.floor(BT.el%60);
  el.innerHTML=`<div class="btb" role="dialog" aria-label="Resoconto della prova"><h3>${BT.win?'👑 Vittoria!':'💀 Sconfitta'}</h3><p><b>${esc(btName(b))}</b> <span class="mu">· ${esc(btZoneN(b).split(' · ')[0])}</span></p>
    <ul><li>Durata: <b>${m}:${String(s).padStart(2,'0')}</b></li><li>Danni subiti: <b>${Math.round(BT.dmg)}</b></li><li>Pozioni bevute: <b>${BT.pots}</b></li><li>Eroe di livello ${BT.lv} · ${DFS[BT.df].n}${DEV.god?' · invincibile':''}</li></ul>
    <p class="mu">Era una prova: niente è stato salvato e niente è arrivato al server.</p>
    <div class="btn"><button class="gold" onclick="btRetry()">↺ Riprova</button><button onclick="btClose();devOpen();DEV.tab='boss';devRender()">👑 Altri boss</button><button onclick="btQuit()">⏏ Termina la prova</button></div></div>`;el.hidden=false}
function btClose(){const el=$('btres');if(el)el.hidden=true}
function btRetry(){const k=BT&&BT.b.k;btClose();if(k)btGo(k)}
function btQuit(){btClose();if(started)toMenu();BT=null}
function btBar(){const el=$('devbar');if(!el)return;if(!BT){el.textContent='🛠 MODALITÀ SVILUPPATORE · questa partita non si salva';return}
  const m=Math.floor(BT.el/60),s=Math.floor(BT.el%60);el.textContent='👑 PROVA · '+btName(BT.b)+' · '+m+':'+String(s).padStart(2,'0')+(BT.done?' · finita':'')+' · non si salva, niente server'}
/* ---- gli agganci: vittoria, sconfitta, conti, e niente che esca dalla prova ---- */
const _bossDown712=bossDown;bossDown=function(e){if(BT&&!BT.done&&e&&e.t===BT.boss){sceneBossDown(e);btEnd(true);return}_bossDown712(e)};
const _trueEnd712=trueEnding;trueEnding=function(){if(BT){btEnd(true);return}_trueEnd712()};
const _navWin712=navWin;navWin=function(){if(BT)return;_navWin712()};
const _die712=die;die=function(){if(BT){if(BT.done){P.hp=P.mx;return}BT.falls++;btEnd(false);return}
  // le partite di prova del pannello non cancellano mai il salvataggio, nemmeno a Incubo
  if(DEV.sess&&DF&&DF.pm){P.hp=P.mx;irisGo(()=>load('town'));msg('🛠 Partita di prova: a Incubo qui non si perde il salvataggio');return}_die712()};
const _hurtP712=hurtP;hurtP=function(at){const h0=P?P.hp:0;_hurtP712(at);if(BT&&!BT.done&&P)BT.dmg+=Math.max(0,h0-Math.max(0,P.hp))};
const _pot712=pot;pot=function(){const n0=P?P.pot:0;_pot712();if(BT&&!BT.done&&P&&P.pot<n0)BT.pots++};
const _dimSave712=dimSave;dimSave=function(){if(DEV.sess)return;_dimSave712()};
const _upd712b=upd;upd=function(dt){if(BT&&!BT.done)BT.el+=dt;_upd712b(dt);if(BT){const s2=Math.floor(BT.el)+(BT.done?.5:0);if(s2!==BT.bs){BT.bs=s2;btBar()}}};
const _toMenu712=toMenu;toMenu=function(){_toMenu712();if(BT&&BT.zl&&Z[BT.zl[0]])Z[BT.zl[0]].lv=BT.zl[1];BT=null;btClose();btBar()};
// in una partita di prova del pannello non parte nessun messaggio verso il server
const _send712=NET.send;NET.send=function(o){if(DEV.sess)return;return _send712.call(NET,o)};
(function(){const st=document.createElement('style');st.textContent=`
#btres{position:fixed;inset:0;z-index:62;display:flex;align-items:center;justify-content:center;background:#0008;font:15px Georgia,serif;color:#e8ecf4}#btres[hidden]{display:none}
.btb{width:min(420px,92vw);background:#121828;border:2px solid #f5b942;border-radius:12px;padding:14px 20px;box-shadow:0 20px 60px #000c}.btb h3{margin:0 0 6px;color:#f5b942;font-size:22px}
.btb ul{margin:8px 0 8px 18px;padding:0;line-height:1.6}.btb .btn{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}.btb .btn button{flex:1}`;document.head.appendChild(st)})();
