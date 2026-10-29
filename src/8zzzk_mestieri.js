/* ================= 7.47: i mestieri — cucina, alchimia e fabbro =================
   Al Banco dei mestieri (in piazza ad Aldoria, nelle Cucine del castello e nelle città di Tomorrow) si lavora con quello
   che hai raccolto e pescato. Le ricette non si comprano: si scoprono provando a mettere insieme due ingredienti.
   - 🍲 Cucina: piatti che curano, danno forza o difesa, fanno rigenerare la vita o guadagnare più esperienza;
   - ⚗ Alchimia: pozioni ed elisir (anche il Respiro del mare, che raddoppia l'aria sott'acqua);
   - ⚒ Fabbro: con il ferro e un secondo metallo si forgiano armi, elmi, corazze e scudi che portano il tuo nome.
   Ogni mestiere ha il suo livello (fino al 10): più è alto, più i piatti durano, più la forgia dà oggetti rari, e da un
   certo punto in poi la ricetta ti dà un indizio. I piatti vanno nella Dispensa e si mangiano quando vuoi. */
XSV.add('mest');
// una casella libera vicino al punto c, lontana dalle altre cose (serve a tutte le novità della 7.47)
function spot47(c,gap){const fr=(x,y)=>x>1&&y>1&&x<N-2&&y<N-2&&(M[y][x]===0||M[y][x]===4)&&!(DEC[y][x]&&DEC[y][x][0]!=='₪')&&!ents.some(e=>e.k!=='tc'&&Math.abs(e.px-x-.5)<(gap||1.6)&&Math.abs(e.py-y-.5)<(gap||1.6));
  for(let r=0;r<12;r++)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){if(Math.max(Math.abs(dx),Math.abs(dy))!==r)continue;const x=(c[0]|0)+dx,y=(c[1]|0)+dy;if(fr(x,y))return[x,y]}return null}
const MSTN47={c:{i:'🍲',n:'Cucina'},a:{i:'⚗',n:'Alchimia'},f:{i:'⚒',n:'Fabbro'}};
// ricette: due ingredienti (r: risorsa, f: pesce); fx è l'effetto quando si mangia/beve
const MSRC47=[
  {id:'pane',m:'c',a:'r:grano',b:'r:uova',n:'Pane dolce',fx:'cura',v:.4,d:'Cura il 40% della vita'},
  {id:'torta',m:'c',a:'r:grano',b:'r:mela',n:'Torta di mele',fx:'forza',v:180,d:'Attacco +25% per 3 minuti'},
  {id:'zuppa',m:'c',a:'r:grano',b:'f:sardina',n:'Zuppa del pescatore',fx:'rigenera',v:90,d:'Rigenera la vita per 90 secondi'},
  {id:'frittata',m:'c',a:'r:uova',b:'f:polpo',n:'Frittata di mare',fx:'difesa',v:180,d:'Difesa +25% per 3 minuti'},
  {id:'orata',m:'c',a:'r:mela',b:'f:orata',n:'Orata alle mele',fx:'xp',v:300,d:'Esperienza +25% per 5 minuti'},
  {id:'sidro',m:'c',a:'r:lunare',b:'r:mela',n:'Sidro di luna',fx:'cura',v:1,d:'Cura tutta la vita'},
  {id:'pozrosa',m:'a',a:'r:rosa',b:'r:mela',n:'Pozioni di rosa',fx:'pozioni',v:2,d:'Due pozioni curative in più'},
  {id:'brina',m:'a',a:'r:ghiaccio',b:'r:lunare',n:'Tonico di brina',fx:'difesa',v:300,d:'Difesa +25% per 5 minuti'},
  {id:'furia',m:'a',a:'r:scarab',b:'r:carbone',n:'Polvere della furia',fx:'forza',v:300,d:'Attacco +25% per 5 minuti'},
  {id:'saggio',m:'a',a:'r:gemma',b:'r:rosa',n:'Essenza del saggio',fx:'xp2',v:300,d:'Esperienza +50% per 5 minuti'},
  {id:'respiro',m:'a',a:'r:conchiglia',b:'r:ghiaccio',n:'Respiro del mare',fx:'aria',v:600,d:'Il doppio dell\'aria sott\'acqua per 10 minuti'},
  {id:'vigore',m:'a',a:'r:lunare',b:'r:rosa',n:'Elisir di vigore',fx:'rigenera',v:180,d:'Rigenera la vita per 3 minuti'},
  {id:'lama',m:'f',a:'r:ferro',b:'r:carbone',n:'Lama forgiata',s:'w',d:'Un\'arma con il tuo nome'},
  {id:'elmo',m:'f',a:'r:ferro',b:'r:rame',n:'Elmo forgiato',s:'h',d:'Un elmo con il tuo nome'},
  {id:'corazza',m:'f',a:'r:ferro',b:'r:pietra',n:'Corazza forgiata',s:'c',d:'Una corazza con il tuo nome'},
  {id:'scudo',m:'f',a:'r:ferro',b:'r:marmo',n:'Scudo forgiato',s:'s',d:'Uno scudo con il tuo nome'},
  {id:'capo',m:'f',a:'r:pepita',b:'r:gemma',n:'Capolavoro',s:null,d:'Un oggetto raro, di qualunque tipo'}];
const MST47={tab:'c',sel:[]};
function mstFix(){P.mest=P.mest||{};const m=P.mest;m.k=m.k||{};m.xp=m.xp||{};m.cib=m.cib||{};m.fx=m.fx||{};return m}
const mstLv=c=>Math.min(10,1+Math.floor(Math.sqrt((mstFix().xp[c]|0)/12)));
const ingN=k=>{const[t,id]=k.split(':');if(t==='r')return RESN[id]||id;const f=(typeof FISHT!=='undefined'?FISHT:[]).find(q=>q.id===id);return f?f.n:id};
const ingHas=k=>{const[t,id]=k.split(':');return t==='r'?(P.res&&P.res[id])|0:(P.fish&&P.fish[id])|0};
function ingTake(k,n){const[t,id]=k.split(':'),o=t==='r'?P.res:P.fish;if(!o)return;o[id]=Math.max(0,(o[id]|0)-n)}
// gli ingredienti che hai: per il fabbro solo i metalli e le pietre
const MST_MET=['ferro','carbone','rame','pietra','marmo','pepita','gemma','argilla'];
function ingList(m){const L=[];if(P.res)for(const k in P.res)if((P.res[k]|0)>0){const met=MST_MET.includes(k);if(m==='f'?met:m==='a'?!met||k==='carbone'||k==='gemma':!met)L.push('r:'+k)}
  if(m!=='f'&&P.fish)for(const k in P.fish)if((P.fish[k]|0)>0)L.push('f:'+k);return L}
const mstNeed=r=>r.m==='f'?[3,2]:[1,1];
const mstFind=(m,a,b)=>MSRC47.find(r=>r.m===m&&(r.a===a&&r.b===b||r.a===b&&r.b===a));
function mstGainXP(c,n){const m=mstFix(),l0=mstLv(c);m.xp[c]=(m.xp[c]|0)+n;const l1=mstLv(c);if(l1>l0){banner(MSTN47[c].i+' '+MSTN47[c].n+': livello '+l1,l1>=7?'Sei un maestro del mestiere':'Le tue creazioni migliorano','stella');jingle([60,64,67,72],.09,'triangle')}}
// prova: due ingredienti scelti a mano
function mstTry(){const m=mstFix(),[a,b]=MST47.sel,c=MST47.tab;if(!a||!b){msg('Scegli due ingredienti');return}if(a===b&&ingHas(a)<2){msg('Ne serve un altro');return}
  const r=mstFind(c,a,b);if(!r){ingTake(a,1);ingTake(b,1);mstGainXP(c,1);msg('Non è venuto niente di buono… ma hai imparato qualcosa');tone(160,.15,'sawtooth',.04);MST47.sel=[];save();pn('mest47');return}
  if(!m.k[r.id]){m.k[r.id]=1;mstGainXP(c,25);banner('Ricetta scoperta: '+r.n,r.d,'libro')}mstMake(r);MST47.sel=[];save();pn('mest47')}
// prepara una ricetta che conosci (o appena scoperta): toglie gli ingredienti e dà il risultato
function mstMake(r){if(typeof r==='string')r=MSRC47.find(q=>q.id===r);if(!r)return false;const m=mstFix(),[na,nb]=mstNeed(r),lv=mstLv(r.m);
  if(ingHas(r.a)<na||ingHas(r.b)<nb){msg('Servono '+na+' '+ingN(r.a)+' e '+nb+' '+ingN(r.b));tone(150,.1);return false}
  const cost=r.m==='f'?Math.round(40+P.lv*12):0;if(P.g<cost){msg('La forgia costa '+cost+' monete di carbone e fatica');tone(150,.1);return false}
  if(r.m==='f'&&P.inv.length>=INV){msg('Lo zaino è pieno');return false}
  ingTake(r.a,na);ingTake(r.b,nb);P.g-=cost;
  if(r.m==='f'){const nm=(typeof NET!=='undefined'&&NET.name)||'Eroe',L2=P.lv+Math.floor(lv/3),mr=r.id==='capo'?Math.min(3,2+(lv>=8?1:0)):lv>=7?2:lv>=3?1:0;
    const it=item(L2,mr,r.s||undefined);it.n=it.n+' di '+String(nm).slice(0,16);it.mk=String(nm).slice(0,16);P.inv.push(it);msg('Hai forgiato: '+iname(it));
    tone(220,.08,'square',.06);setTimeout(()=>tone(260,.08,'square',.06),140);if(cineOK())sparks(P.px,P.py,18,['#ffb04a','#ffe08a','#ffffff'],80)}
  else if(r.fx==='pozioni'){P.pot+=r.v+(lv>=5?1:0);msg('+'+(r.v+(lv>=5?1:0))+' pozioni')}
  else{const n=r.m==='c'&&lv>=4?2:1;m.cib[r.id]=(m.cib[r.id]|0)+n;msg('Pronto: '+r.n+(n>1?' ×'+n:'')+' (nella Dispensa)')}
  mstGainXP(r.m,r.m==='f'?14:8);tone(700,.07,'triangle');hud();save();return true}
// mangiare e bere
function mstEat(id){const m=mstFix(),r=MSRC47.find(q=>q.id===id);if(!r||!(m.cib[id]>0))return;m.cib[id]--;if(!m.cib[id])delete m.cib[id];const lv=mstLv(r.m),k=1+.06*(lv-1),now=Date.now();
  if(r.fx==='cura'){const h=Math.round(P.mx*Math.min(1,r.v*(1+.04*(lv-1))));P.hp=Math.min(P.mx,P.hp+h);flt(P,'+'+h,'#66ff88')}
  else if(r.fx==='forza'){P.bA=Math.max(P.bA||0,r.v*k);flt(P,'💪','#ffd84a')}else if(r.fx==='difesa'){P.bD=Math.max(P.bD||0,r.v*k);flt(P,'🛡','#cccccc')}
  else if(r.fx==='rigenera'){m.fx.rg=Math.max(m.fx.rg||0,now+r.v*k*1000);flt(P,'✚','#66ff88')}
  else if(r.fx==='xp'||r.fx==='xp2'){m.fx.xp=Math.max(m.fx.xp||0,now+r.v*k*1000);m.fx.xk=r.fx==='xp2'?1.5:Math.max(m.fx.xp>now&&m.fx.xk||1.25,1.25);flt(P,'✦ XP','#9adcff')}
  else if(r.fx==='aria'){m.fx.ox=Math.max(m.fx.ox||0,now+r.v*k*1000);flt(P,'🫧','#9adcff')}
  msg('Hai consumato: '+r.n);tone(520,.08,'sine',.05);hud();save();if(PM==='mest47')pn('mest47')}
const _gainXP747=gainXP;gainXP=function(x){const f=P&&P.mest&&P.mest.fx;if(f&&f.xp>Date.now()&&x>0)x=Math.round(x*(f.xk||1.25));return _gainXP747(x)};
const _upd747m=upd;upd=function(dt){_upd747m(dt);if(!P||!started||!P.mest)return;const f=P.mest.fx,now=Date.now();
  if(f.rg>now&&P.hp>0&&P.hp<P.mx)P.hp=Math.min(P.mx,P.hp+P.mx*.015*dt);
  if(typeof SUB46!=='undefined'){const mx=f.ox>now?60:30;if(SUB46.mx!==mx){SUB46.mx=mx;SUB46.o=Math.min(SUB46.o,mx)}}};
function mstActive(){const f=mstFix().fx,now=Date.now(),L=[],s=v=>Math.ceil((v-now)/1000)+'s';if(f.rg>now)L.push('✚ rigenerazione '+s(f.rg));if(f.xp>now)L.push('✦ esperienza ×'+(f.xk||1.25)+' '+s(f.xp));if(f.ox>now)L.push('🫧 aria doppia '+s(f.ox));
  if(P.bA>0)L.push('💪 forza '+Math.ceil(P.bA)+'s');if(P.bD>0)L.push('🛡 difesa '+Math.ceil(P.bD)+'s');return L}
// il pannello: una scheda per mestiere e la dispensa
X43P.mest47=()=>{const m=mstFix(),c=MST47.tab;let h=`<h3>🧑‍🍳 Banco dei mestieri · 💰${P.g}</h3><div class="srow">${Object.keys(MSTN47).map(k=>`<button class="${k===c?'on':''}" onclick="MST47.tab='${k}';MST47.sel=[];pn('mest47')">${MSTN47[k].i} ${MSTN47[k].n} · liv. ${mstLv(k)}</button>`).join('')}<button class="${c==='d'?'on':''}" onclick="MST47.tab='d';pn('mest47')">🧺 Dispensa</button></div>`;
  if(c==='d'){const L=Object.keys(m.cib).filter(k=>m.cib[k]>0),A=mstActive();
    h+=(A.length?`<p class="x43t">Attivi: ${A.join(' · ')}</p>`:'')+(L.length?L.map(id=>{const r=MSRC47.find(q=>q.id===id);return r?`<div class="x43r"><span>${MSTN47[r.m].i} <b>${esc(r.n)}</b> ×${m.cib[id]} <small class="mu">${esc(r.d)}</small></span><button onclick="mstEat('${id}')">${r.m==='a'?'Bevi':'Mangia'}</button></div>`:''}).join(''):'<p class="mu">La dispensa è vuota: cucina qualcosa al banco.</p>');
    return h+`<button onclick="cl()">Chiudi</button>`}
  const R2=MSRC47.filter(r=>r.m===c),known=R2.filter(r=>m.k[r.id]),lv=mstLv(c),I=ingList(c);
  h+=`<p class="x43t">${MSTN47[c].i} ${MSTN47[c].n}, livello ${lv} · ricette ${known.length}/${R2.length}. Scegli due ingredienti e prova: ${c==='f'?'la forgia vuole 3 del primo e 2 del secondo, e un po\' d\'oro':'se la ricetta esiste la scopri'}.</p>`;
  h+=`<div class="srow mst47">${I.length?I.map(k=>`<button class="${MST47.sel.includes(k)?'on':''}" onclick="mstPick('${k}')">${esc(ingN(k))} ×${ingHas(k)}</button>`).join(''):'<span class="mu">Non hai ingredienti adatti: raccogli, pesca, scava.</span>'}</div>`;
  h+=`<button ${MST47.sel.length===2?'':'disabled'} onclick="mstTry()">✨ Prova ${MST47.sel.map(k=>esc(ingN(k))).join(' + ')}</button>`;
  h+=`<h4>Ricette</h4>`+R2.map(r=>{if(m.k[r.id]){const[na,nb]=mstNeed(r),ok=ingHas(r.a)>=na&&ingHas(r.b)>=nb;return`<div class="x43r"><span><b>${esc(r.n)}</b> <small class="mu">${na} ${esc(ingN(r.a))} + ${nb} ${esc(ingN(r.b))} · ${esc(r.d)}</small></span><button ${ok?'':'disabled'} onclick="mstMake('${r.id}')">Prepara</button></div>`}
    return`<div class="x43r"><span class="mu">??? ${lv>=3?'· indizio: '+esc(ingN(r.a))+' + ???':''}</span></div>`}).join('');
  return h+`<button onclick="cl()">Chiudi</button>`};
function mstPick(k){const i=MST47.sel.indexOf(k);if(i>=0)MST47.sel.splice(i,1);else{if(MST47.sel.length>=2)MST47.sel.shift();MST47.sel.push(k)}pn('mest47')}
// il banco: in piazza ad Aldoria, nelle cucine del castello, nelle città di Tomorrow
function mstPlace(){if(!ZZ||!started||ents.some(e=>e.k==='mest47'))return;let c=null;
  if(Zk==='town'&&!(typeof OW!=='undefined'&&OW.on))c=[32,40];else if(Zk==='cas_cucine')c=[6,5];else if(typeof twOn==='function'&&twOn()&&ZZ.set&&ZZ.shub)c=[ZZ.shub[0]+4,ZZ.shub[1]+3];if(!c)return;
  const q=spot47(c);if(q)ents.push({k:'mest47',px:q[0]+.5,py:q[1]+.5,n:'Banco dei mestieri'})}
const _loadPost747m=loadPost;loadPost=function(k){_loadPost747m(k);try{mstPlace()}catch(e){console.warn('mestieri',e)}};
ITK.add('mest47');
const _act747m=act;act=function(e){if(e&&e.k==='mest47'){MST47.sel=[];pn('mest47');return}_act747m(e)};
const _ent747m=ent;ent=function(e){if(e.k==='mest47'){const f=Math.sin(t*3)*.5;drawL([[-.45,-.3,0,.9,.6,9,'#6a4a2a'],[-.48,-.33,9,.96,.66,2,'#8a6a42'],[-.36,-.18,11,.3,.3,6,'#2a2a2a'],[-.33,-.15,17,.24,.24,1,'#5adc8a'],[.08,-.12,11,.3,.16,4,'#5a5a64'],[.02,-.16,15,.42,.24,2,'#7a7a84']],e.px,e.py,0);
  box(e.px-.25,e.py-.1,20+f,.08,.08,3,'#d8ffd8',1.3);if(typeof nlight==='function')nlight(e.px,e.py,14,60,'255,200,120',.4);return}_ent747m(e)};
// un pulsante nel Diario per la dispensa
{const p0=pn;pn=function(m,arg){p0(m,arg);if(m==='dia'&&PM==='dia'){const pe=$('pn');if(pe&&!pe.querySelector('.mst47b'))pe.insertAdjacentHTML('afterbegin',`<button class="mst47b" onclick="MST47.tab='d';pn('mest47')">🧺 Dispensa e mestieri</button>`)}}}
(function(){const st=document.createElement('style');st.textContent=`.mst47 button{font-size:13px;padding:3px 8px}.mst47b{width:100%;margin-bottom:6px}`;document.head.appendChild(st)})();
