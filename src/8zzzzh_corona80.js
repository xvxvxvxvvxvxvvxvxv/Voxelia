/* ================= 8.0: LA CORONA RIUNITA — il filo che lega tutte le modalità =================
   Le sei gemme della Corona diventano il percorso del giocatore. In ogni modalità c'è una scheggia da trovare:
   - 💎 RUBINO, la Storia: sconfiggi il Re Lich Malakar nella Cittadella del Vuoto;
   - 💎 SMERALDO, Tomorrow: vinci il boss di un dungeon di livello 20 o più (i più profondi, lontano dal villaggio);
   - 💎 ZAFFIRO, Aldoria 3026: sconfiggi Max «il Corvo» Malakar;
   - 💎 AMETISTA, il Parco giochi: arriva alla fine di un mondo giocato in Voxelia Studio;
   - 💎 TOPAZIO, i Mondi della community: arriva alla fine di un mondo scaricato dalla community;
   - 💎 DIAMANTE, la Cronoporta: rimetti in ordine le quattro epoche e vedi un finale del viaggio nel tempo.
   Le schegge valgono per tutto il gioco (non per un solo eroe). Riunite tutte e sei, si apre IL CUORE DELLA CORONA: l'eroe
   della Storia entra nella gemma e combatte in un'arena sospesa nel vuoto dove passato, presente e futuro si mescolano —
   cavalieri del regno, banditi e soldati delle epoche, androidi del 3026, le chimere di Tomorrow — fino all'Eco della Corona.
   È il finale vero di Voxelia.
   L'ALBUM DELLA CORONA (nel menu) mostra le sei schegge e cosa hai fatto in ogni modalità: traguardi, finali visti,
   compagni, veicoli, epoche, mondi. */
const CRK80='voxelia_crown80';
const GEM80=[
  {k:'rubino',n:'Rubino',c:'#e6283a',m:'story',mn:'Storia',how:'Sconfiggi il Re Lich Malakar nella Cittadella del Vuoto.'},
  {k:'smeraldo',n:'Smeraldo',c:'#28d66e',m:'ow',mn:'Tomorrow',how:'Vinci il boss di un dungeon di Tomorrow di livello 20 o più: i più profondi, lontano dal villaggio.'},
  {k:'zaffiro',n:'Zaffiro',c:'#326ef0',m:'neo',mn:'Aldoria 3026',how:'Sconfiggi Max «il Corvo» Malakar allo spazioporto.'},
  {k:'ametista',n:'Ametista',c:'#aa46eb',m:'parco',mn:'Parco giochi',how:'Arriva alla fine di un mondo giocato in Voxelia Studio.'},
  {k:'topazio',n:'Topazio',c:'#ffaa1e',m:'mondi',mn:'Mondi della community',how:'Arriva alla fine di un mondo scaricato dai Mondi della community.'},
  {k:'diamante',n:'Diamante',c:'#c8f0ff',m:'film',mn:'La Cronoporta',how:'In Aldoria 3026 attraversa la Cronoporta, rimetti in ordine le quattro epoche e vedi un finale del viaggio nel tempo.'}];
const cr80=()=>{const o=LS.get(CRK80,{})||{};o.g=o.g||{};o.c=o.c||{};return o};
const cr80n=()=>GEM80.filter(G=>cr80().g[G.k]).length;
function cr80Got(k,quiet){const o=cr80();if(o.g[k])return false;o.g[k]=Date.now();LS.set(CRK80,o);const G=GEM80.find(q=>q.k===k),n=cr80n();if(quiet||!G)return true;
  const go=()=>{banner('💎 '+G.n+' della Corona',(n<6?'Schegge riunite: '+n+'/6 · le vedi nell\'Album della Corona':'Le sei schegge sono riunite: il Cuore della Corona si è aperto'),'corona');jingle([64,68,71,76,80,83,88],.09,'triangle');if(typeof flash==='function')flash(G.c,.45,700);if(cineOK()&&P)sparks(P.px,P.py,50,[G.c,'#ffffff','#ffd84a'],160)};
  if(started)setTimeout(go,2200);return true}
function cr80Count(k,n){const o=cr80();o.c[k]=(o.c[k]|0)+(n||1);LS.set(CRK80,o)}
// le schegge già meritate prima della 8.0 (dai salvataggi delle modalità)
function cr80Old(){try{const s=LS.get(SAVEK,null),n=LS.get(typeof NEOK!=='undefined'?NEOK:'voxelia_neo',null),d=LS.get(DIMK,null);
  if(s&&s.p&&(s.p.st|0)>=4)cr80Got('rubino',1);if(n&&n.p&&n.p.neo&&(n.p.neo.m|0)>=8)cr80Got('zaffiro',1);if(d&&d.d&&d.d.done)cr80Got('diamante',1)}catch(e){}}
/* ---- dove si trovano ---- */
{const s0=save;save=function(){s0();try{if(!P||!started)return;if(MODE==='story'&&!(typeof OW!=='undefined'&&OW.on)&&(P.st|0)>=4)cr80Got('rubino');if(MODE==='neo'&&P.neo&&(P.neo.m|0)>=8)cr80Got('zaffiro')}catch(e){}}}
{const d0=dungeonClear;dungeonClear=function(e){const id=ZZ&&ZZ.dg,D=id&&DG[id];d0(e);try{if(String(id).startsWith('twd_')&&D&&(D.lv|0)>=20&&(!D.fls||ZZ.dn>=D.fls))cr80Got('smeraldo')}catch(err){}}}
{const s0=dimSave;dimSave=function(){s0();try{if(DIM&&DIM.done)cr80Got('diamante')}catch(e){}}}
let MBP80=0,MB80=0;
if(typeof mbPlay==='function'){const m0=mbPlay;mbPlay=function(){MBP80=1;try{return m0.apply(this,arguments)}finally{setTimeout(()=>{MBP80=0},4000)}}}
{const p0=edPlay;edPlay=function(w,o){MB80=MBP80?1:0;MBP80=0;return p0(w,o)}}
{const e0=edEnd;edEnd=function(ti,tx){const won=EDG&&!EDG.won;e0(ti,tx);try{if(won&&EDPLAY&&!EDPLAY.test){if(MB80){cr80Got('topazio');cr80Count('mondiC')}else{cr80Got('ametista');cr80Count('mondiS')}}}catch(e){}}}
/* ---- il Cuore della Corona: l'arena dove le epoche si mescolano ---- */
const W80=[
  {n:'Il passato',s:'I cavalieri del regno di Aldoria',e:['cavaliere','cavaliere_ossa','guardia_reale','mago','golem_cr'],c:'#e6283a'},
  {n:'Le epoche',s:'Banditi, teppisti, granatieri e soldati, strappati alla storia',e:['bandito_w','teppista','granatiere','soldato'],c:'#c8f0ff'},
  {n:'Il futuro',s:'Gli androidi e le macchine del 3026',e:['neo_agente','neo_swat','neo_drone','neo_cyborg'],c:'#326ef0'},
  {n:'Il mondo senza confini',s:'Le chimere di Tomorrow, mai viste due volte',e:['lupo_cristallo','salamandra','pantera48','scimmia48','scorpione_reale','anubi'],c:'#28d66e',chim:1},
  {n:'Tutto insieme',s:'Il passato, il presente e il futuro nella stessa arena',e:['cavaliere_vuoto','soldato','neo_swat','spettro','neo_cyborg','granatiere'],c:'#ffaa1e'}];
E.eco80={n:'L\'Eco della Corona',hp:2600,at:40,xp:3000,sp:1.9,r:4.5,cd:1.3,ag:30,boss:1,slam:1,rng:'#ffd84a',sum:'neo_drone',m:E.lich.m};
try{const m=petChim(E.lich.m,E.drago_brina.m);E.eco80.m=m&&m.rg?rgScale(m,1.25):m}catch(e){}
Z.cuore80={n:'Il Cuore della Corona',lv:20,N:36,a:'#2a1e44',b:'#261a3e',bg:'#05030c',mus:'boss',pt:'mote',gen:cuoreGen,dist:1,nolamp:1,cuore:1};
function cuoreGen({D,n}){const c=(n-1)/2;for(let y=1;y<n-1;y++)for(let x=1;x<n-1;x++){const d=Math.hypot(x-c,y-c);M[y][x]=d<15?0:9}
  GEM80.forEach((G,i)=>{const a=i/6*6.283-Math.PI/2,x=Math.round(c+Math.cos(a)*12),y=Math.round(c+Math.sin(a)*12);M[y][x]=6;DEC[y][x]='⓪'+i});
  M[Math.round(c)][Math.round(c)]=0;DEC[Math.round(c)][Math.round(c)]='⓪c';return[Math.round(c),Math.round(c)+9]}
{const d0=dec;dec=function(x,y,c,h){if(c&&c[0]==='⓪'&&ZZ&&ZZ.cuore){const i=c.slice(1);if(i==='c'){const a0=g.globalAlpha;g.globalAlpha=a0*.5;for(let k=0;k<12;k++){const q=k/12*6.283+t*.4;box(x+.5+Math.cos(q)*1.6-.1,y+.5+Math.sin(q)*1.6-.1,60+Math.sin(t*2+k)*3,.2,.2,4,'#ffd84a',1.4)}
      box(x+.2,y+.2,70+Math.sin(t)*3,.6,.6,6,'#ffd84a',1.4);g.globalAlpha=a0;return}
    const G=GEM80[+i];if(!G)return;box(x+.15,y+.15,0,.7,.7,6,'#3a2a5a');box(x+.25,y+.25,6,.5,.5,26,'#2a1e44');box(x+.15,y+.15,32,.7,.7,2,'#d4af37');box(x+.3,y+.3,36+Math.sin(t*2+x)*2,.4,.4,8,G.c,1.45);if(SET.ultra)GLOW.push([x+.5,y+.5,40,60,rgbOf(G.c),.4]);nlight&&nlight(x+.5,y+.5,40,160,rgbOf(G.c),.8);return}
  d0(x,y,c,h)}}
{const f0=floor;floor=function(x,y,c,h){const z=ZZ;if(!z||!z.cuore||c!==0){f0(x,y,c,h);return}const n=N,cc=(n-1)/2,d=Math.hypot(x-cc,y-cc);box(x,y,-6,1,1,6,(x+y)&1?z.a:z.b,.92+h*.12);
  if(Math.abs(d-5)<.5||Math.abs(d-10)<.5||Math.abs(d-14.3)<.5)box(x+.3,y+.3,0,.4,.4,.3,'#d4af37',1.15+Math.sin(t*2+d)*.1);else if(hh(x*3,y*5)>.93)box(x+.45,y+.45,0,.1,.1,.3,'#ffffff',1.2+Math.sin(t*4+x)*.3)}}
const CU80={w:-1,on:0,t:0};
function cuoreEnter(){const s=LS.get(SAVEK,null);if(cr80n()<6){menuNote&&menuNote('Servono tutte e sei le schegge della Corona.');return}if(!s||!s.p){menuNote&&menuNote('Serve un eroe della Storia: è lui che entra nel Cuore della Corona.');return}
  albumClose();begin(s.df|0,s);setTimeout(()=>{if(!started)return;CU80.w=-1;CU80.on=1;CU80.t=2;load('cuore80','town');P.hp=P.mx;PA={ti:'Il Cuore della Corona',tx:'Le sei schegge si accendono tutte insieme e la Corona ti risucchia dentro. Sotto i tuoi piedi c\'è un pavimento d\'oro sospeso nel vuoto; intorno, sei pilastri con le sei gemme.\n\nLe epoche si stanno mescolando: dal passato, dal futuro e dai mondi senza confini arriva tutto quello che la Corona ha visto. Resisti alle cinque ondate e affronta l\'Eco della Corona.'};pn('txt')},600)}
function cuoreTick(dt){if(Zk!=='cuore80'||!CU80.on||!started||PM==='txt')return;const L=ents.filter(e=>e.k==='en');if(L.length)return;CU80.t-=dt;if(CU80.t>0)return;CU80.t=3.5;CU80.w++;
  const z=ZZ,cc=(N-1)/2;z.lv=Math.max(8,P.lv-6);
  if(CU80.w>0){P.hp=Math.min(P.mx,P.hp+Math.round(P.mx*.4));P.pot++;flt(P,'+40% ❤ +🧪','#88ff88');hud()}
  if(CU80.w<W80.length){const W=W80[CU80.w],n=3+CU80.w;banner('Ondata '+(CU80.w+1)+'/5 · '+W.n,W.s,'spade');tone(330,.2,'square',.06);
    for(let i=0;i<n;i++){const a=i/n*6.283+CU80.w,x=Math.round(cc+Math.cos(a)*9),y=Math.round(cc+Math.sin(a)*9),k=W.e[i%W.e.length];if(!E[k])continue;const e=mk(k,x,y);e.al=1;e.ag=40;
      if(W.chim&&typeof petChim==='function'){const b=W.e[(i+2)%W.e.length];if(E[b]&&e.m&&e.m.g){e.m=petChim(e.m,E[b].m);e.n=(e.n||'')+' di Tomorrow';e.mx=Math.round(e.mx*1.2);e.hp=e.mx}}ents.push(e)}}
  else if(CU80.w===W80.length){banner('L\'Eco della Corona','Tutto quello che la Corona ha visto, in una sola forma','teschio');music('boss');const e=mk('eco80',Math.round(cc),Math.round(cc)-3);e.al=1;e.ag=40;e.eco80=1;ents.push(e)}
  else if(CU80.w>W80.length){CU80.on=0;cuoreWin()}}
function cuoreWin(){const o=cr80();const first=!o.fin;o.fin=o.fin||Date.now();LS.set(CRK80,o);P.g+=first?20000:3000;gainXP(first?8000:1500);if(first){const it=item(Math.max(18,P.lv),3,'h');it.n='Corona Riunita';it.hp=(it.hp||0)+200;if(P.inv.length<INV)P.inv.push(it);else ents.push({k:'dr',px:P.px,py:P.py,it})}save();
  jingle([60,64,67,72,76,79,84,88,91],.1,'triangle');if(typeof flash==='function')flash('#ffd84a',.6,900);
  PA={ti:'La Corona Riunita',tx:'L\'Eco della Corona si spezza in mille cubetti di luce, e ognuno torna nella sua epoca: i cavalieri nel regno, i banditi nel West, gli androidi nel 3026, le chimere nei mondi senza confini.\n\nLe sei gemme brillano insieme per la prima volta da mille anni. La Corona non è più un\'arma, né una tecnologia, né un ricordo: è un ponte. Tiene uniti i tempi, come un tempo teneva unite le terre.\n\nTorni ad Aldoria con la Corona Riunita sul capo. Nell\'Album della Corona il finale vero di Voxelia è segnato per sempre.'+(first?'\n\nRicompensa: 20.000 monete, la Corona Riunita (leggendaria) e tanta esperienza.':'')};
  pn('txt');setTimeout(()=>{if(started&&Zk==='cuore80')load('in_castle','town')},400)}
{const l0=loadPost;loadPost=function(k){if(k!=='cuore80')CU80.on=0;l0(k)}}
{const u0=upd;upd=function(dt){u0(dt);try{if(started&&P&&Zk==='cuore80')cuoreTick(dt)}catch(e){console.warn('Cuore della Corona',e)}}}
/* ---- l'Album della Corona ---- */
function album80(){cr80Old();const o=cr80(),s=LS.get(SAVEK,null),tw=LS.get(OWK,null),ne=LS.get(typeof NEOK!=='undefined'?NEOK:'voxelia_neo',null),dm=LS.get(DIMK,null),n=cr80n(),U=typeof unl55==='function'?unl55:()=>true;
  const sp=s&&s.p||{},tp=tw&&tw.p||{},np=ne&&ne.p||{},dd=dm&&dm.d||null;const T=(ok,tx)=>`<li class="${ok?'ok':''}">${ok?'✔':'○'} ${tx}</li>`;
  const runs=p=>Object.entries(p.runs||{}).reduce((a,[k,v])=>a+(String(k).startsWith('twd_')?0:(v|0)),0),twr=p=>Object.entries(p.runs||{}).filter(([k,v])=>String(k).startsWith('twd_')&&v).length;
  let h=`<div class="al80b"><div class="al80h"><h2>📖 Album della Corona</h2><button onclick="albumClose()" aria-label="Chiudi">✕</button></div>
  <p class="mu">Le sei schegge della Corona sono sparse nelle modalità. Riuniscile tutte per aprire il Cuore della Corona, il finale vero di Voxelia.</p>
  <div class="al80g">${GEM80.map(G=>{const got=o.g[G.k];return`<div class="${got?'got':''}" style="--c:${G.c}"><i></i><b>${G.n}</b><small>${esc(G.mn)}</small><span>${got?'Raccolta il '+new Date(got).toLocaleDateString('it-IT'):esc(G.how)}</span></div>`}).join('')}</div>
  <div class="al80c ${n>=6?'on':''}"><b>👑 Il Cuore della Corona</b> · ${n}/6 schegge${o.fin?' · <span class="ok">finale vero visto il '+new Date(o.fin).toLocaleDateString('it-IT')+'</span>':''}<br>${n>=6?`<button onclick="cuoreEnter()">${o.fin?'⚔ Rientra nel Cuore':'⚔ Entra nel Cuore della Corona'}</button> <span class="mu">con l'eroe della Storia${s&&s.name?' ('+esc(s.name)+')':''}</span>`:'<span class="mu">Si apre quando hai tutte e sei le schegge.</span>'}</div>
  <div class="al80m">
  <section><h3>📜 Storia</h3>${s?`<p class="mu">${esc(s.name||'Eroe')} · livello ${sp.lv|0}</p>`:'<p class="mu">Nessuna partita.</p>'}<ul>${T((sp.st|0)>=1,'Accetta la missione del Re')}${T((sp.st|0)>=3,'Riunisci i sei frammenti')}${T((sp.st|0)>=4,'Sconfiggi il Re Lich')}${T((sp.te|0)>=2,'Il vero finale: chiudi l\'Occhio')}${T(runs(sp)>=5,'Vinci 5 dungeon ('+runs(sp)+')')}${T(Object.keys(sp.bst||{}).length>=10,'Doma 10 specie ('+Object.keys(sp.bst||{}).length+')')}${T((sp.lv|0)>=30,'Arriva al livello 30')}</ul></section>
  <section><h3>🌅 Tomorrow ${U('ow')?'':'🔒'}</h3>${tw?`<p class="mu">${esc(tw.name||'Eroe')} · livello ${tp.lv|0}</p>`:'<p class="mu">'+(U('ow')?'Nessuna partita.':'Si apre sconfiggendo il Re Lich.')+'</p>'}<ul>${T(!!(tp.tw&&tp.tw.set),'Fonda il tuo borgo')}${T((tp.lv|0)>=15,'Arriva al livello 15')}${T(twr(tp)>=3,'Vinci 3 dungeon di Tomorrow ('+twr(tp)+')')}${T(!!o.g.smeraldo,'Un dungeon di livello 20 o più')}${T((tp.lv|0)>=40,'Arriva al livello 40')}</ul></section>
  <section><h3>🏙 Aldoria 3026 ${U('neo')?'':'🔒'}</h3>${ne?`<p class="mu">${esc(ne.name||'Eroe')} · livello ${np.lv|0} · ${((np.g|0)).toLocaleString('it-IT')} ₡</p>`:'<p class="mu">'+(U('neo')?'Nessuna partita.':'Si apre in Tomorrow: borgo fondato e livello 15.')+'</p>'}<ul>${T((np.neo&&np.neo.m|0)>=1,'Arriva nel 3026')}${T((np.neo&&np.neo.m|0)>=3,'Caccia i Corvi di Neon')}${T((np.neo&&np.neo.m|0)>=8,'Sconfiggi il Corvo')}${T((np.neo&&np.neo.m|0)>=9,'Accendi la Cronoporta')}${T((np.neo&&np.neo.own||[]).length>=1,'Compra un veicolo ('+((np.neo&&np.neo.own||[]).length)+')')}</ul></section>
  <section><h3>🕰 La Cronoporta</h3>${dd?`<p class="mu">Epoche in ordine: ${ERAK.filter(k=>dd.era[k]&&dd.era[k].done).length}/4</p>`:'<p class="mu">Si apre dal Laboratorio Cronos del 3026.</p>'}<ul>${ERAK.map(k=>T(!!(dd&&dd.era[k]&&dd.era[k].done),ERA[k].n)).join('')}${T(!!(dd&&dd.done),'Un finale del viaggio'+(dd&&dd.end?': «'+esc(dd.end)+'»':''))}</ul></section>
  <section><h3>🎡 Studio e mondi</h3><ul>${T(!!o.g.ametista,'Finisci un mondo di Voxelia Studio ('+(o.c.mondiS|0)+')')}${T(!!o.g.topazio,'Finisci un mondo della community ('+(o.c.mondiC|0)+')')}</ul></section>
  </div></div>`;return h}
function albumOpen(){let el=$('al80');if(!el){el=document.createElement('div');el.id='al80';el.setAttribute('role','dialog');el.setAttribute('aria-label','Album della Corona');document.body.appendChild(el);el.addEventListener('click',e=>{if(e.target===el)albumClose()})}
  el.innerHTML=album80();el.hidden=false;if(typeof iconFill==='function')iconFill(el)}
function albumClose(){const el=$('al80');if(el)el.hidden=true}
addEventListener('keydown',e=>{const el=$('al80');if(el&&!el.hidden&&e.key==='Escape'){albumClose();e.stopImmediatePropagation()}},true);
// il pulsante nel menu, e nella scheda di ogni gemma la sua scheggia
(function(){const f=document.querySelector('.mfoot');if(f&&!$('al80b'))f.insertAdjacentHTML('afterbegin',`<button id="al80b" onclick="albumOpen()"><span class="al80ic">📖</span><span><b>Album della Corona</b><small>Le sei schegge e i traguardi di ogni modalità</small></span></button>`)})();
if(typeof crCard==='function'){const c0=crCard;crCard=function(){c0();try{const i=CRW.sel,card=$('crcard');if(i<0||!card||!CRGEM[i])return;const G=GEM80.find(q=>q.m===CRGEM[i].k);if(!G||card.querySelector('.cr80'))return;const got=cr80().g[G.k];
  const p=card.querySelector('p');if(p)p.insertAdjacentHTML('afterend',`<p class="cr80 ${got?'ok':''}">💎 ${got?'Scheggia di '+G.n+' raccolta':'Scheggia di '+G.n+': '+esc(G.how)}</p>`)}catch(e){}}}
setTimeout(cr80Old,500);
document.head.insertAdjacentHTML('beforeend',`<style>
#al80{position:fixed;inset:0;z-index:70;display:flex;align-items:center;justify-content:center;background:#000b;padding:max(12px,env(safe-area-inset-top,0px)) 12px}#al80[hidden]{display:none}
.al80b{width:min(860px,96vw);max-height:92vh;overflow:auto;background:linear-gradient(160deg,#171030,#0a0716);color:#e8ecf4;border:2px solid #d4af37;border-radius:10px;padding:14px 18px;box-shadow:0 10px 40px #000c;font:14px Georgia,serif}
.al80h{display:flex;justify-content:space-between;align-items:center}.al80h h2{margin:0;color:#ffd98a}.al80h button{margin:0}.al80b .mu{color:#aab3c8}
.al80g{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:8px;margin:10px 0}.al80g>div{display:grid;grid-template-columns:34px 1fr;gap:2px 10px;padding:8px;border-radius:8px;background:#ffffff08;border:1px solid #ffffff1a;opacity:.75}
.al80g>div.got{opacity:1;border-color:var(--c);background:linear-gradient(90deg,color-mix(in srgb,var(--c) 22%,transparent),#ffffff06)}
.al80g i{grid-row:span 3;width:30px;height:30px;transform:rotate(45deg) scale(.8);border-radius:4px;background:#333a;border:2px solid var(--c);align-self:center}.al80g .got i{background:var(--c);box-shadow:0 0 14px var(--c)}
.al80g b{color:var(--c)}.al80g small{opacity:.8}.al80g span{font-size:12px;color:#c8cfe0}
.al80c{margin:8px 0 12px;padding:10px 12px;border-radius:8px;border:1px dashed #d4af3788;background:#d4af370d}.al80c.on{border-style:solid;background:#d4af3722}.al80c button{margin:6px 0 0}.al80b .ok{color:#7aff8a}
.al80m{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:10px}.al80m section{padding:8px 10px;border-radius:8px;background:#ffffff06}.al80m h3{margin:0 0 4px;font-size:15px;color:#ffd98a}.al80m ul{margin:4px 0;padding:0;list-style:none}.al80m li{margin:2px 0;font-size:13px;opacity:.7}.al80m li.ok{opacity:1;color:#bfffcf}
.cr80{font-size:13px;margin:4px 0 0;opacity:.85}.cr80.ok{color:#7aff8a}.al80ic{font-size:22px;width:24px;text-align:center}
</style>`);
