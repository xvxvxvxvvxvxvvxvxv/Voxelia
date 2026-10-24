/* ================= 7.34: LE TUE CITTÀ =================
   - Conquistando altre regioni si fondano altre città (fino a 8), ognuna con il suo livello, i suoi edifici, il tesoro,
     il magazzino, gli abitanti, l'esercito, la miniera e la sua pianta. Nel registro (U → Insediamento) le vedi tutte e
     scegli quale gestire; quando entri in una città, il registro parla di quella.
   - La CAPITALE: ogni volta che entri in Tomorrow (e quando rinasci) parti da lì. Si sceglie nel registro.
   - Nel mercato della tua città si compra la gemma del teletrasporto della città.
   - Nelle altre città e nei villaggi i mercanti vendono i materiali da costruzione a prezzi che cambiano ogni giorno:
     a volte un affare, a volte carissimi. */
const CSMAX=8;
const CSW={d:0,cur:[],pend:0};
function csWith(S,fn){const T=P&&P.tw;if(!T||!S||S===T.set)return fn();const cur=T.set;T.set=S;CSW.d++;CSW.cur.push(cur);try{return fn()}finally{T.set=cur;CSW.d--;CSW.cur.pop();if(!CSW.d&&CSW.pend){CSW.pend=0;save()}}}
// mentre si lavora su un'altra città il salvataggio aspetta, così non si perde mai quella di prima
const _save734=save;save=function(){if(CSW.d>0){CSW.pend=1;return}return _save734.apply(this,arguments)};
function twSetUse(k){const T=P&&P.tw;if(!T||!k)return false;if(T.set&&T.set.k===k)return true;T.sets=T.sets||[];const i=T.sets.findIndex(s=>s&&s.k===k);if(i<0)return false;
  const S=T.sets.splice(i,1)[0];if(T.set)T.sets.push(T.set);T.set=S;return true}
const csRegK=k=>{const m=/^tw[im]?:(-?\d+),(-?\d+)/.exec(String(k||''));return m?twK(+m[1],+m[2]):null};
function csCap(){const L=csSets();if(!L.length)return null;const T=P.tw;if(!T.cap||!L.some(s=>s.k===T.cap))T.cap=L[0].k;return T.cap}
function csAccrueAll(){for(const S of(P.tw.sets||[]).slice())csWith(S,()=>{try{setAccrue()}catch(e){console.error(e)}})}
// la regione di una città si genera con la sua pianta, anche se non è quella che stai gestendo
const _twSetGen734=twSetGen;twSetGen=function(C,ends){const k=twK(C.rx,C.ry),S=csSets().find(s=>s.k===k);return csWith(S,()=>_twSetGen734(C,ends))};
// entrando in una città (o nelle sue case, o nella sua miniera) il registro passa a lei; casa è la capitale
const _load734=load;load=function(k,from){if(P&&P.tw&&twOn()){const rk=k==='town'?csCap():csRegK(k);if(rk)twSetUse(rk)}_load734(k,from);if(P&&P.tw&&twOn()){const h=csCap();if(h)P.tw.home=h;try{csAccrueAll()}catch(e){}}};
const _begin734=begin;begin=function(d,s){_begin734(d,s);if(!twOn()||!P.tw)return;const h=csCap();if(h&&Zk!==h&&!(ZZ&&ZZ.dg)){load(h);if(ZZ&&Zk===h){const S=csSets().find(q=>q.k===h);if(S)setTimeout(()=>banner(S.n,'Sei nella tua capitale','corona'),400)}}};
// gli assedi: la città attaccata diventa quella del registro
for(const nm of['asLose','asWin'])if(typeof window[nm]==='function'){const f0=window[nm];window[nm]=function(A){if(A&&A.k)twSetUse(A.k);return f0(A)}}
// fondare un'altra città
function csFoundCost(){const n=csSets().length;return{g:1000*n+500*n*n,legna:60*n,pietra:40*n}}
const _twSetFound734=twSetFound;twSetFound=function(){rgFix();const T=P.tw;if(!T.set&&!(T.sets||[]).length){_twSetFound734();if(T.set)T.cap=T.cap||T.set.k;return}
  if(csSets().some(s=>s.k===Zk)){msg('Qui c\'è già una tua città');return}if(!twCanConq()||!T.terr[Zk]){msg('Una città si fonda in una regione conquistata (U)');return}
  if(csSets().length>=CSMAX){msg('Hai già '+CSMAX+' città: è il massimo');return}const c=csFoundCost(),m=setMiss(c);if(m.length){msg('Per una nuova città mancano '+m.map(([r,n])=>n+' '+(r==='g'?'monete':RESN[r].toLowerCase())).join(', '));tone(150,.1);return}
  const nm=(prompt('Il nome della nuova città','Nuova '+(ZZ&&ZZ.n?ZZ.n:'città'))||'').replace(/[<>]/g,'').trim().slice(0,28);if(!nm)return;setPay(c);
  T.sets=T.sets||[];if(T.set)T.sets.push(T.set);T.set={k:Zk,n:nm,lv:1,b:{},dec:{},col:csSets().length%(typeof TWSTH!=='undefined'?TWSTH.length:1),day:gDay(),cash:0,food:0,d0:gDay()};
  setRebuild();jingle([60,64,67,72,76,79,84,88],.09,'triangle');banner(nm+' è nata!','La tua città numero '+csSets().length+' · costruiscila e falla crescere (U)','corona');save()};
function csUse(k){if(!twSetUse(k))return;RG.tab='set';pn('regno')}
function csSetCap(k){if(!csSets().some(s=>s.k===k))return;P.tw.cap=k;P.tw.home=k;save();tone(660,.06,'triangle');pn('regno')}
const _rgHTML734=rgHTML;rgHTML=function(){const T=P.tw;try{csAccrueAll()}catch(e){}let h=_rgHTML734();const L=csSets();
  if(RG.tab==='terr'&&L.length&&String(Zk).startsWith('tw:')&&T.terr[Zk]&&!L.some(s=>s.k===Zk)&&twCanConq()){const c=csFoundCost();
    h=h.replace('<p>I mostri non tornano più qui.</p>',`<p>I mostri non tornano più qui.</p>${L.length<CSMAX?`<button class="pri" onclick="twSetFound()">🏙 Fonda qui una nuova città · ${sedCostTxt(c)}</button>`:`<p class="mu">Hai ${CSMAX} città: è il massimo.</p>`}`)}
  if(RG.tab==='set'&&L.length){const cap=csCap(),here=twP(String(Zk).startsWith('tw:')?Zk:T.at)||[0,0];const all=[T.set].concat(T.sets||[]).filter(Boolean);
    const bar=`<div class="csbar">${all.map(S=>{const p=twP(S.k),on=S===T.set;return`<button class="${on?'on':''}" onclick="csUse('${S.k}')">${S.k===cap?'⭐ ':''}<b>${esc(S.n)}</b><small>liv. ${S.lv} · ${(S.pop|0)||''}${S.pop?' ab. · ':''}${twDir(p[0]-here[0],p[1]-here[1])}</small></button>`}).join('')}</div>
      <p class="mu csbm">${all.length} ${all.length===1?'città':'città'} · stai gestendo <b>${esc(T.set.n)}</b>${T.set.k===cap?' (la capitale: qui rinasci e da qui riparti)':` · <button onclick="csSetCap('${T.set.k}')">⭐ Fanne la capitale</button>`}${all.length<CSMAX?' · altre città si fondano nelle regioni conquistate':''}</p>`;
    h=h.replace('<div class="rgc">','<div class="rgc">'+bar)}
  return h};
/* ---- la gemma della tua città, al tuo mercato ---- */
function csNpcReg(nid){const m=/^t[vm]_(m?\d+)_(m?\d+)_(\d+)$/.exec(String(nid||''));return m?{rx:twDec(m[1]),ry:twDec(m[2]),i:+m[3],k:twK(twDec(m[1]),twDec(m[2])),tm:String(nid)[1]==='m'}:null}
const CSRP={legna:6,pietra:8,argilla:9,ferro:22,carbone:12,rame:20,marmo:34};
function csPriceF(r,rx,ry){const u=(twHs('mp'+r,rx,ry,gDay())%1000)/999;return Math.round((.45+u*u*.6+u*1.15)*100)/100}
const csPrice=(r,rx,ry)=>Math.max(1,Math.round(CSRP[r]*csPriceF(r,rx,ry)));
function csBuyMat(r,n,rx,ry){const pr=csPrice(r,rx,ry)*n;if((P.g|0)<pr){msg('Non hai abbastanza oro');tone(150,.1);return}P.g-=pr;P.res[r]=(P.res[r]|0)+n;tone(700,.05,'triangle');flt(P,'+'+n+' '+RESN[r],'#ffe8c8');save();hud();if(typeof setHud==='function')setHud();if(PA&&PM==='npc')pn('npc',PA)}
function csMatHTML(rx,ry){const rows=Object.keys(CSRP).filter(r=>RESN[r]).map(r=>{const f=csPriceF(r,rx,ry),p=csPrice(r,rx,ry),tag=f<.8?'<span class="cspc ok">conveniente</span>':f>1.45?'<span class="cspc ko">caro</span>':'<span class="cspc">nella media</span>';
    return`<div class="csmr"><span>${(typeof SETMI!=='undefined'&&SETMI[r])||''} <b>${RESN[r]}</b> ${p}💰 ${tag}<small> · ne hai ${P.res[r]|0}</small></span><span><button onclick="csBuyMat('${r}',1,${rx},${ry})">1</button><button onclick="csBuyMat('${r}',10,${rx},${ry})">10 · ${p*10}💰</button></span></div>`}).join('');
  return`<div class="qb csmat"><b>🧱 Materiali da costruzione</b><p class="mu">I prezzi cambiano ogni giorno, e da una città all'altra.</p>${rows}</div>`}
const _npcHTML734=npcHTML;npcHTML=function(e){let h=_npcHTML734(e);if(!twOn()||!e||!e.nid)return h;const q=csNpcReg(e.nid),d=NPCS[e.nid]||{};if(!q)return h;
  const own=csSets().find(s=>s.k===q.k);
  if(own&&!q.tm&&q.i===1){const pr=twGemPrice(q.k),n=(P.tw.gem||{})[q.k]|0;h+=`<div class="qb twgb"><b>💎 Gemma del teletrasporto di ${esc(own.n)}</b><p class="mu">Comprata una volta, ti riporta nella tua città quando vuoi: dalla Pietra del viaggio o con il tasto G.${typeof csWsHas==='function'&&csWsHas(q.k)?' <b>È già tua.</b>':''}</p>${typeof csWsHas==='function'&&csWsHas(q.k)?'':`<button onclick="twGemBuy('${q.k}')">Compra · ${pr}💰</button>`}</div>`}
  else if(!own&&(d.tw2==='mer'||d.tw2==='ven'))h+=csMatHTML(q.rx,q.ry);return h};
document.head.insertAdjacentHTML('beforeend',`<style>.csbar{display:flex;gap:6px;overflow-x:auto;padding:2px 0 6px}.csbar button{flex:none;display:flex;flex-direction:column;align-items:flex-start;gap:1px;background:#ffffff10;border:1px solid #ffffff22;border-radius:9px;padding:6px 10px;color:inherit;cursor:pointer;font:inherit}
.csbar button.on{border-color:#ffd84a;background:#ffd84a1a}.csbar small{opacity:.75;font-size:11px}.csbm{margin:0 0 8px}.csbm button{font-size:12px;padding:2px 8px}
.csmr{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:4px 0;border-top:1px solid #ffffff12}.csmr button{padding:3px 8px;margin-left:4px}.cspc{font-size:11px;padding:1px 6px;border-radius:8px;background:#ffffff18}.cspc.ok{background:#2f7a3f;color:#dfffe4}.cspc.ko{background:#8a2a2a;color:#ffe0e0}</style>`);
