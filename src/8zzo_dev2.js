/* ================= 7.40: IL PANNELLO SVILUPPATORE FA TUTTO =================
   Due schede nuove nel pannello sviluppatore (🛠, tasto F9):
   - 🎁 DAI E CREA: monete, pozioni, esperienza e livello esatto; tutte le risorse e i minerali, i pesci, i sigilli di doma;
     oggetti di ogni tipo, rarità e livello (anche gli unici della storia e quelli di Tomorrow), i cimeli e i reperti;
     compagni di qualunque specie e livello (nella stalla o subito in campo); nemici e boss da far comparire vicino a te.
   - 🏰 TOMORROW: conquistare subito la regione, fondarci una città, portare la città al livello che vuoi, costruire tutto
     al massimo, riempire tesoro, magazzino, cibo, acqua, abitanti ed esercito, scoprire la mappa, avere tutte le gemme,
     far passare i giorni. */
const DV2={lv:0,slot:'w',r:3,n:1,pet:'lupo',plv:10,foe:'lupo',flv:0,fn:1,uq:'',res:100,city:10};
const dvSpecies=()=>Object.keys(E).filter(k=>E[k]&&E[k].m&&!/^(abo_|elara_|tw\.)/.test(k)).sort((a,b)=>String(E[a].n).localeCompare(String(E[b].n),'it'));
const dvOpt=(L,cur)=>L.map(([v,n])=>`<option value="${esc(String(v))}" ${String(v)===String(cur)?'selected':''}>${esc(n)}</option>`).join('');
const dvNum=(k,min,max)=>`<input type="number" class="dvn" min="${min}" max="${max}" value="${DV2[k]}" onchange="DV2['${k}']=clamp(+this.value||${min},${min},${max})">`;
function dvSay(s){msg('🛠 '+s);hud();if(typeof setHud==='function')setHud();devRender()}
function dvRes(k,n){P.res[k]=Math.max(0,(P.res[k]|0)+n)}
function dvAllRes(n){for(const k in RESN)dvRes(k,n);dvSay('Tutte le risorse +'+n)}
function dvFish(n){P.fish=P.fish||{};for(const f of FISHT)P.fish[f.id]=(P.fish[f.id]|0)+n;dvSay('Tutti i pesci +'+n)}
function dvSetLv(v){v=clamp(v|0,1,999);P.lv=v;P.xp=0;recalc();P.hp=P.mx;dvSay('Livello '+v)}
function dvItems(){const n=clamp(DV2.n|0,1,30),lv=DV2.lv||Math.max(1,P.lv);let k=0;for(let i=0;i<n;i++){if(P.inv.length>=INV)break;const it=item(lv,DV2.r,DV2.slot);if(DV2.r>it.r)it.r=DV2.r;P.inv.push(it);k++}
  dvSay(k?k+' '+(k===1?'oggetto':'oggetti')+' nello zaino':'Lo zaino è pieno')}
function dvUq(t){if(P.inv.length>=INV){dvSay('Lo zaino è pieno');return}P.inv.push(uniq(t,DV2.lv||P.lv));dvSay('Unico: '+UQ[t][1])}
function dvTwUq(rm){if(typeof uqNew!=='function')return;if(P.inv.length>=INV){dvSay('Lo zaino è pieno');return}P.inv.push(uqNew(DV2.lv||P.lv,DV2.slot,rm));dvSay('Unico di Tomorrow nello zaino')}
function dvPet(field){if(!E[DV2.pet])return;domFix();const nm=String(E[DV2.pet].n).replace(/^[^A-Za-zÀ-ÿ]+/,''),p={id:uid(),t:DV2.pet,n:nm,lv:clamp(DV2.plv|0,1,40),xp:0,hp:0,bd:typeof gDay==='function'?gDay():0};p.hp=domStats(p).mx;
  P.pets.push(p);P.bst[DV2.pet]=(P.bst[DV2.pet]|0)+1;if(field){P.pet=P.pets.length-1;domSummon()}dvSay(nm+' livello '+p.lv+(field?' in campo':' nella stalla'))}
function dvFoes(){if(!ZZ||!E[DV2.foe])return;const n=clamp(DV2.fn|0,1,20),lv0=ZZ.lv;if(DV2.flv)ZZ.lv=DV2.flv;let k=0;try{for(let i=0;i<n;i++){const a=i/n*6.283,[x,y]=nearFree(Math.round(P.px+Math.cos(a)*3),Math.round(P.py+Math.sin(a)*3));const e=mk(DV2.foe,x,y);e.al=1;ents.push(e);k++}}finally{ZZ.lv=lv0}
  dvSay(k+' × '+E[DV2.foe].n)}
function dvKillAll(){let k=0;for(const e of ents.slice())if(e.k==='en'){kill(e);k++}dvSay(k+' nemici sconfitti')}
function dvCim(){if(typeof cimGive!=='function'||!twOn())return dvSay('I cimeli sono di Tomorrow');let k=0;while(cimGive('dal pannello sviluppatore'))k++;dvSay(k?k+' cimeli':'Hai già tutti i cimeli')}
function dvRel(n){if(typeof mineRelic!=='function'||!twOn()||!P.tw.set)return dvSay('I reperti servono a Tomorrow, con un insediamento');for(let i=0;i<n;i++)mineRelic();dvSay(n+' reperti')}
function dvGiveHTML(){if(!started||!P)return`<p>Avvia prima una partita (o entra in una zona dalla scheda 🗺 Zone).</p><button onclick="devStart();devRender()">▶ Partita di prova ad Aldoria</button>`;
  const R=Object.keys(RESN),SL=[['w','⚔ Arma'],['h','⛑ Elmo'],['c','🛡 Corazza'],['s','🔰 Scudo']],sp=dvSpecies();
  let h=`<h4>💰 Monete, pozioni, esperienza</h4>
  <div class="dvr"><span>Monete ${P.g|0}</span><span><button onclick="P.g+=1000;dvSay('+1.000 monete')">+1.000</button><button onclick="P.g+=100000;dvSay('+100.000 monete')">+100.000</button><button onclick="P.g+=10000000;dvSay('+10 milioni')">+10 mln</button><button onclick="P.g=0;dvSay('Monete a zero')">0</button></span></div>
  <div class="dvr"><span>Pozioni ${P.pot|0}</span><span><button onclick="P.pot+=10;dvSay('+10 pozioni')">+10</button><button onclick="P.pot+=100;dvSay('+100 pozioni')">+100</button></span></div>
  <div class="dvr"><span>Livello esatto (ora ${P.lv})</span><span><input type="number" class="dvn" id="dv_lv" min="1" max="999" value="${P.lv}"><button onclick="dvSetLv(+$('dv_lv').value)">Imposta</button></span></div>
  <div class="dvr"><span>Esperienza</span><span><button onclick="gainXP(1000);dvSay('+1.000 XP')">+1.000</button><button onclick="gainXP(100000);dvSay('+100.000 XP')">+100.000</button></span></div>
  <div class="dvr"><span>Sigilli di doma ${P.seal|0}</span><button onclick="P.seal=(P.seal|0)+20;dvSay('+20 sigilli')">+20</button></div>
  <h4>🪵 Risorse e minerali</h4><div class="dvr"><span>Tutte insieme</span><span><button onclick="dvAllRes(100)">+100</button><button onclick="dvAllRes(1000)">+1.000</button><button onclick="dvAllRes(-1e9)">Azzera</button></span></div><div class="dvgr">`+
  R.map(k=>`<div class="dvrs"><b>${esc(RESN[k])}</b><small>${P.res[k]|0}</small><span><button onclick="dvRes('${k}',10);dvSay('${esc(RESN[k])} +10')">+10</button><button onclick="dvRes('${k}',500);dvSay('${esc(RESN[k])} +500')">+500</button></span></div>`).join('')+`</div>
  <div class="dvr"><span>Pesci (tutti i tipi)</span><span><button onclick="dvFish(10)">+10</button><button onclick="dvFish(100)">+100</button></span></div>
  <h4>⚔ Oggetti</h4><div class="dvr dvf"><select onchange="DV2.slot=this.value">${dvOpt(SL,DV2.slot)}</select><select onchange="DV2.r=+this.value">${dvOpt(RN.map((n,i)=>[i,n]),DV2.r)}</select><label>liv. ${dvNum('lv',0,999)}</label><label>× ${dvNum('n',1,30)}</label><button class="gold" onclick="dvItems()">Crea</button></div>
  <p class="mu">Livello 0 = il tuo livello. Zaino ${P.inv.length}/${INV}.</p>
  <div class="dvr"><span>Unico della storia</span><span><select onchange="DV2.uq=this.value"><option value="">Scegli…</option>${dvOpt(Object.keys(UQ).map(k=>[k,UQ[k][1]]),DV2.uq)}</select><button onclick="if(DV2.uq)dvUq(DV2.uq)">Dai</button></span></div>
  ${typeof uqNew==='function'?`<div class="dvr"><span>Unico di Tomorrow (con poteri)</span><span>${['Comune','Raro','Epico','Leggendario'].map((n,i)=>`<button onclick="dvTwUq(${i})">${n}</button>`).join('')}</span></div>`:''}
  <div class="dvr"><span>Cimeli e reperti</span><span><button onclick="dvCim()">Tutti i cimeli</button><button onclick="dvRel(5)">5 reperti</button></span></div>
  <h4>🐾 Compagni</h4><div class="dvr dvf"><select onchange="DV2.pet=this.value">${dvOpt(sp.map(k=>[k,E[k].n+(E[k].boss?' (boss)':'')]),DV2.pet)}</select><label>liv. ${dvNum('plv',1,40)}</label><button onclick="dvPet(0)">Nella stalla</button><button class="gold" onclick="dvPet(1)">In campo</button></div>
  <p class="mu">Nella stalla ${(P.pets||[]).length} compagni (il pannello non guarda il limite della stalla).</p>
  <h4>👹 Nemici</h4><div class="dvr dvf"><select onchange="DV2.foe=this.value">${dvOpt(sp.map(k=>[k,E[k].n+(E[k].boss?' (boss)':'')]),DV2.foe)}</select><label>liv. ${dvNum('flv',0,99)}</label><label>× ${dvNum('fn',1,20)}</label><button class="gold" onclick="dvFoes()">Fai comparire</button></div>
  <div class="dvr"><span>Livello 0 = quello della zona</span><button class="danger" onclick="dvKillAll()">Sconfiggi tutti i nemici</button></div>`;
  return h}
/* ---- Tomorrow ---- */
function dvConq(){if(!twOn()||!ZZ||!ZZ.tw)return dvSay('Serve una regione di Tomorrow');if(P.tw.terr[Zk])return dvSay('È già tua');if(!twCanConq())return dvSay('Villaggi, città e dungeon non si conquistano');P.tw.cq={k:Zk,need:1,c:100,f:null};twConqDone();for(const e of ents.slice())if(e.k==='en'&&!e.owt)ents.splice(ents.indexOf(e),1);save();dvSay('Regione conquistata')}
function dvFound(){if(!P.tw.terr[Zk])dvConq();if(!P.tw.terr[Zk])return;P.g+=1e6;for(const r of['legna','pietra'])P.res[r]=(P.res[r]|0)+9999;const o=window.prompt;window.prompt=(a,b)=>b;try{twSetFound()}finally{window.prompt=o}dvSay('Città fondata')}
function dvCityLv(v){const S=P.tw.set;if(!S)return dvSay('Prima fonda una città');S.lv=clamp(v|0,1,TWSB.casa.max);setRebuild();save();dvSay(S.n+' al livello '+S.lv)}
function dvBuildAll(){const S=P.tw.set;if(!S)return dvSay('Prima fonda una città');setFix(S);S.lv=TWSB.casa.max;if(Zk===S.k)setRebuild();
  // un edificio alla volta, come quando si costruisce davvero: così ognuno trova un posto che non chiude gli altri
  for(const k in TWSB){if(k==='casa')continue;S.b[k]=TWSB[k].max;if(Zk===S.k&&SETBA.includes(k)&&typeof setPlaceNew==='function'){setPlaceNew(k);setRebuild()}}setRebuild();save();dvSay('Tutto costruito al massimo')}
function dvFill(){const S=P.tw.set;if(!S)return dvSay('Prima fonda una città');setFix(S);S.cash=(S.cash|0)+10000;S.mag=S.mag||{};for(const r of['legna','pietra','argilla','ferro','carbone','rame','marmo'])S.mag[r]=(S.mag[r]|0)+500;
  S.cibo=Math.max(S.cibo|0,999);S.acqua=Math.max(S.acqua|0,999);S.fame=0;if(typeof setCap==='function'){try{S.pop=setCap(S)}catch(e){}}if(typeof armyFix==='function'&&typeof armyCap==='function'){const A=armyFix(S);A.n=armyCap()}save();dvSay('Tesoro, magazzino, cibo, acqua, abitanti ed esercito pieni')}
function dvMap(r){for(let y=-r;y<=r;y++)for(let x=-r;x<=r;x++)P.tw.vis[twK(x,y)]=1;save();dvSay('Mappa scoperta per '+r+' regioni intorno al centro')}
function dvGems(){P.tw.ws=P.tw.ws||{};let n=0;for(let y=-12;y<=12;y++)for(let x=-12;x<=12;x++)if(twCity(x,y)&&twCityGem(x,y)){P.tw.ws[twK(x,y)]=1;P.tw.vis[twK(x,y)]=1;n++}for(const S of csSets())P.tw.ws[S.k]=1;save();dvSay(n+' gemme del teletrasporto')}
function dvDays(n){P.gt=(P.gt||0)+n*1440;if(NET)NET.tm=null;try{csAccrueAll();setAccrue()}catch(e){}save();dvSay(n+(n===1?' giorno passato':' giorni passati'))}
function dvTwHTML(){if(!started||!P||!twOn())return`<p>Questi strumenti servono in Tomorrow: entra nel Mondo aperto (dal menu) e riapri il pannello.</p>`;const S=P.tw.set,inR=ZZ&&ZZ.tw;
  return`<h4>🏴 Questa regione ${inR?'· '+esc(ZZ.n):''}</h4>
  <div class="dvr"><span>${inR?(P.tw.terr[Zk]?'È tua':'Non è tua'):'Sei al chiuso'}</span><span><button onclick="dvConq()" ${inR&&!P.tw.terr[Zk]?'':'disabled'}>🏴 Conquista subito</button><button onclick="dvFound()" ${inR&&!csSets().some(s=>s.k===Zk)?'':'disabled'}>🏰 Fonda qui una città</button></span></div>
  <h4>🏰 ${S?esc(S.n)+' · livello '+S.lv:'Nessuna città'}</h4>
  <div class="dvr"><span>Livello della città</span><span><input type="number" class="dvn" id="dv_cl" min="1" max="${TWSB.casa.max}" value="${S?S.lv:1}"><button onclick="dvCityLv(+$('dv_cl').value)" ${S?'':'disabled'}>Imposta</button></span></div>
  <div class="dvr"><span>Tutti gli edifici al massimo</span><button onclick="dvBuildAll()" ${S?'':'disabled'}>🏗 Costruisci tutto</button></div>
  <div class="dvr"><span>Tesoro, magazzino, cibo, acqua, abitanti, esercito</span><button onclick="dvFill()" ${S?'':'disabled'}>📦 Riempi</button></div>
  <h4>🌍 Il mondo</h4>
  <div class="dvr"><span>Scopri la mappa</span><span><button onclick="dvMap(6)">6 regioni</button><button onclick="dvMap(15)">15 regioni</button></span></div>
  <div class="dvr"><span>Gemme del teletrasporto</span><button onclick="dvGems()">💎 Tutte</button></div>
  <div class="dvr"><span>Far passare il tempo</span><span><button onclick="dvDays(1)">+1 giorno</button><button onclick="dvDays(7)">+7 giorni</button></span></div>`}
// le schede nuove nel pannello
{const b0=devBody;devBody=function(){return DEV.tab==='give'?dvGiveHTML():DEV.tab==='twdv'?dvTwHTML():b0()}}
{const r0=devRender;devRender=function(){const c0=$('dvc'),st=c0?c0.scrollTop:0,tb=DEV.tab;r0();const c1=$('dvc');if(c1&&DEV.tab===tb&&DEV.ltab===tb)c1.scrollTop=st;DEV.ltab=tb;const el=$('devp'),bar=el&&el.querySelector('.dvt');if(!bar||bar.querySelector('[data-dv2]'))return;
  for(const[k,n]of[['give','🎁 Dai e crea'],['twdv','🏰 Tomorrow']]){const b=document.createElement('button');b.dataset.dv2=k;b.textContent=n;b.className=DEV.tab===k?'on':'';b.onclick=()=>{DEV.tab=k;devRender()};bar.appendChild(b)}}}
document.head.insertAdjacentHTML('beforeend',`<style>#devp .dvn{width:64px;padding:4px;border-radius:6px;border:1px solid #ffffff33;background:#1c1a24;color:#fff}#devp .dvf{display:flex;flex-wrap:wrap;gap:6px;align-items:center;justify-content:flex-start}
#devp .dvf select{max-width:210px}#devp .dvgr{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:5px;margin:4px 0 8px}#devp .dvrs{display:flex;flex-direction:column;gap:2px;background:#ffffff0d;border-radius:7px;padding:5px 7px}#devp .dvrs small{opacity:.7}#devp .dvrs span{display:flex;gap:4px}</style>`);
