/* ================= 7.55: GLI ELEMENTI =================
   Nove elementi, gli stessi che si vedono già nel gioco (le zone, i dungeon, i mostri, i poteri degli unici):
   fuoco, ghiaccio, fulmine, acqua, veleno, terra, vento, ombra e luce.
   - Ogni mostro ha il suo elemento: dal nome (Imp, Golem di Magma → fuoco; Medusa, Leviatano → acqua...) o, se non si capisce,
     dal tema della zona (la Fucina è fuoco, le Caverne di Cristallo ghiaccio, la Cripta ombra...).
   - Le armi possono avere un elemento (da 1 a 5 livelli): una parte dei colpi fa scattare il suo effetto. Le armi rare in su
     possono già nascerci; il Fabbro Borin le infonde con le Essenze elementali.
   - I compagni hanno l'elemento della loro specie (si cambia al Serraglio): i loro colpi fanno scattare lo stesso effetto.
   - Gli elementi si battono a vicenda: fuoco > ghiaccio > vento > terra > fulmine > acqua > fuoco; il veleno batte l'acqua,
     luce e ombra si battono l'una con l'altra. Contro un elemento debole si fa il 30% in più, contro lo stesso il 30% in meno.
   - Bagnato + fulmine = scossa doppia che si allarga; gelato + fuoco = vapore (il gelo si scioglie, il colpo fa di più).
   - I mostri lasciano Essenze del loro elemento (servono all'infusione, al Serraglio e alle chimere). */
XSV.add('ess55');
const EL55={
  fuoco:{n:'Fuoco',i:'🔥',c:'#ff7a2a',c2:'#ffd84a',rgb:'255,122,42',d:'incendia il nemico: brucia per qualche secondo'},
  ghiaccio:{n:'Ghiaccio',i:'❄',c:'#9adcff',c2:'#ffffff',rgb:'154,220,255',d:'rallenta il nemico; dal livello 3 a volte lo congela'},
  fulmine:{n:'Fulmine',i:'⚡',c:'#fff36a',c2:'#bfe0ff',rgb:'255,243,106',d:'un fulmine salta sui nemici vicini (doppio su chi è bagnato)'},
  acqua:{n:'Acqua',i:'💧',c:'#3a9adf',c2:'#bfefff',rgb:'58,154,223',d:'bagna e spinge indietro il nemico, e ti rinfresca un poco'},
  veleno:{n:'Veleno',i:'☠',c:'#7ae05a',c2:'#d8ff9a',rgb:'122,224,90',d:'avvelena il nemico: perde vita per cinque secondi'},
  terra:{n:'Terra',i:'🪨',c:'#b8864a',c2:'#e8c890',rgb:'184,134,74',d:'il colpo stordisce: il nemico resta fermo per un attimo'},
  vento:{n:'Vento',i:'💨',c:'#bff4e0',c2:'#ffffff',rgb:'191,244,224',d:'una raffica respinge il nemico e ti fa colpire più in fretta'},
  ombra:{n:'Ombra',i:'🌑',c:'#9a5ad0',c2:'#2a1a3a',rgb:'154,90,208',d:'ruba vita: una parte del danno ti cura'},
  luce:{n:'Luce',i:'✨',c:'#ffe9a0',c2:'#ffffff',rgb:'255,233,160',d:'il colpo sacro cura te e il compagno, e brucia l\'ombra'}};
const ELK55=Object.keys(EL55);
const ELW55={fuoco:['ghiaccio'],ghiaccio:['vento'],vento:['terra'],terra:['fulmine'],fulmine:['acqua'],acqua:['fuoco'],veleno:['acqua'],luce:['ombra'],ombra:['luce']};
const elOk=k=>!!(k&&EL55[k]);
// l'elemento di un mostro: prima dal nome della specie, poi dal tema della zona
const ELTH55={cave:'terra',crypt:'ombra',pyr:'luce',ice:'ghiaccio',fire:'fuoco',sea:'acqua',void:'ombra',jade:'veleno',forest:'terra',desert:'fuoco',peaks:'ghiaccio'};
const ELRX55=[[/gelo|ghiacc|brina|yeti|neve|cristall/i,'ghiaccio'],[/magma|ignis|imp\b|^imp|demone|fiamm|fuoc|brace|drago|lava|infern/i,'fuoco'],[/tempest|fulmin|tuono|scintill|elettr/i,'fulmine'],
  [/medusa|pesce|leviatan|granchi|kraken|serpe|acqu|tritone|mare|anguill|polip/i,'acqua'],[/ragn|scorpion|vipera|velen|palud|spor|fung/i,'veleno'],[/golem|troll|scarab|terra|pietr|roccia|talpa|orso|cinghial/i,'terra'],
  [/pipistrell|corvo|aquila|grifon|vento|arpia|falco|gufo|lupo|sciacall|volpe/i,'vento'],[/slime|melma|bolla/i,'acqua'],[/ombra|lich|vuoto|necro|schelet|zombie|spettr|fantasm|vampir|mummia|cavaliere|mago oscuro/i,'ombra'],[/sacerdot|faraone|sfinge|angel|luce|sole|paladin/i,'luce']];
function elOfType(tk,zone){tk=String(tk||'');const b=E[tk],nm=(b&&b.n||'')+' '+tk;if(b&&elOk(b.el55))return b.el55;for(const[rx,k]of ELRX55)if(rx.test(nm))return k;
  if(b&&b.rng){const c=String(b.rng).toLowerCase();if(/ff[5-9a]|ff7|ff6/.test(c))return'fuoco';if(/9fe8|bff4|7fff/.test(c))return'ghiaccio';if(/c46b|9f6b|cc88|c88c/.test(c))return'ombra';if(/ffd8/.test(c))return'luce'}
  const z=zone||ZZ;return(z&&(ELTH55[z.th]||ELTH55[DG[z.dg]&&DG[z.dg].th]))||ELK55[hs(tk)%ELK55.length]}
const elOfEn=e=>{if(!e)return null;if(e.el55===undefined)e.el55=elOfType(e.t);return e.el55};
const elMul=(a,b)=>!elOk(a)||!elOk(b)?1:(ELW55[a]||[]).includes(b)?1.3:a===b?.7:(ELW55[b]||[]).includes(a)?.85:1;
// l'elemento di un'arma: it.el (chiave) e it.elv (livello 1-5)
const elLv=it=>clamp(((it&&it.elv)|0)||1,1,5);
const elTag=it=>it&&elOk(it.el)?`<span class="el55" style="--c:${EL55[it.el].c}" title="${esc(EL55[it.el].d)}">${EL55[it.el].i} ${EL55[it.el].n} ${'I II III IV V'.split(' ')[elLv(it)-1]}</span>`:'';
// il simbolo dell'elemento resta nel nome (così si vede in ogni elenco, anche negli scambi)
function elName(it){if(!it)return it;const n=String(it.n||'').replace(/\s*[🔥❄⚡💧☠🪨💨🌑✨](\s|$)/gu,' ').replace(/\s+$/,'').replace(/\s{2,}/g,' ');it.n=elOk(it.el)?n+' '+EL55[it.el].i:n;return it}
/* ---- le essenze ---- */
const essFix=()=>{if(!P)return{};if(!P.ess55||typeof P.ess55!=='object')P.ess55={};for(const k in P.ess55)if(!elOk(k))delete P.ess55[k];return P.ess55};
const essN=k=>essFix()[k]|0;
function essAdd(k,n){if(!elOk(k)||!n)return;const E2=essFix();E2[k]=Math.max(0,(E2[k]|0)+n)}
const essHTML=()=>{const E2=essFix();return`<div class="ess55">${ELK55.map(k=>`<span style="--c:${EL55[k].c}" title="Essenza di ${EL55[k].n.toLowerCase()}">${EL55[k].i}<b>${E2[k]|0}</b></span>`).join('')}</div>`};
/* ---- l'effetto: arma dell'eroe o colpo del compagno ---- */
let EL55B=0;
function elProc(e,k,lv,d,by){if(!e||!ents.includes(e)||e.hp<=0||!elOk(k))return;const X=EL55[k],R2=Math.random,src=by||P,boss=!!(e.boss||e.b&&e.b.boss);
  EL55B++;try{
  if(k==='fuoco'){if(e.frz55>t){e.frz55=0;e.cbs=0;uqHit(e,d*.5,1);flt(e,'Vapore!','#ffffff');if(cineOK())sparks(e.px,e.py,14,['#ffffff','#cfefff'],80)}e.uqb=t+2.5+lv*.5;flt(e,'🔥','#ff9a3a')}
  else if(k==='ghiaccio'){if(e.uqsp==null)e.uqsp=e.sp;e.sp=e.uqsp*(.6-lv*.04);e.uqf=t+1.6+lv*.3;if(lv>=3&&R2()<.25+lv*.05&&!boss){e.cbs=t+1;e.frz55=t+1;flt(e,'Congelato!','#cfefff')}else flt(e,'❄','#9adcff')}
  else if(k==='fulmine'){const L=uqNearN(e.px,e.py,3.4+lv*.3,1+Math.floor(lv/2),e),wet=e.acq55>t;if(wet){uqHit(e,d*.6,1);flt(e,'Scossa!','#fff36a')}
    for(const o of L){uqZap(e,o);uqHit(o,d*(o.acq55>t?1:.5),1);flt(o,'⚡','#fff36a')}if(cineOK())vf({k:'flash',x:e.px,y:e.py,r:34,c:X.rgb,d:.15,z:20})}
  else if(k==='acqua'){e.acq55=t+4;if(!boss){const dx=e.px-src.px,dy=e.py-src.py,l=Math.hypot(dx,dy)||1;mv(e,dx/l*.55,dy/l*.55)}if(e.uqb>t){e.uqb=0;flt(e,'Spento','#bfefff')}const h=Math.max(1,Math.round(d*.04*lv));
    if(src===P&&P.hp<P.mx){P.hp=Math.min(P.mx,P.hp+h);flt(P,'+'+h,'#7fd0ff')}else if(src.k==='pet'){src.hp=Math.min(src.mx,src.hp+h)}flt(e,'💧','#7fd0ff')}
  else if(k==='veleno'){e.uqv=t+3+lv*.6;flt(e,'☠','#8aff6a')}
  else if(k==='terra'){e.cbs=Math.max(e.cbs||0,t+(boss?.25:.6+lv*.12));flt(e,'Stordito','#e8c890');if(cineOK()&&typeof shake==='function'&&src===P)shake(.15)}
  else if(k==='vento'){if(!boss){const dx=e.px-src.px,dy=e.py-src.py,l=Math.hypot(dx,dy)||1;mv(e,dx/l*(.6+lv*.12),dy/l*(.6+lv*.12))}if(src===P)P.at=Math.max(0,(P.at||0)-.12-lv*.03);flt(e,'💨','#dffff4')}
  else if(k==='ombra'){const h=Math.max(1,Math.round(d*(.06+lv*.02)));if(src===P){if(P.hp<P.mx){P.hp=Math.min(P.mx,P.hp+h);flt(P,'+'+h,'#c89aff')}}else if(src.k==='pet')src.hp=Math.min(src.mx,src.hp+h);flt(e,'🌑','#c89aff')}
  else if(k==='luce'){const h=Math.max(1,Math.round((src===P?P.mx:src.mx||40)*(.012+lv*.006)));if(P.hp>0&&P.hp<P.mx){P.hp=Math.min(P.mx,P.hp+h);flt(P,'+'+h,'#fff2a0')}const pe=typeof DOM!=='undefined'&&DOM.pet;if(pe&&ents.includes(pe))pe.hp=Math.min(pe.mx,pe.hp+h);
    if(elOfEn(e)==='ombra')uqHit(e,d*.3,1);flt(e,'✨','#fff2a0')}
  if(cineOK())sparks(e.px,e.py,6+lv*2,[X.c,X.c2],60+lv*8);
  }finally{EL55B--}}
// i colpi: l'elemento dell'arma (eroe) o del compagno; la debolezza del bersaglio
{const h0=hurtE;hurtE=function(e,d,rem,cr){if(EL55B||!e||e.k!=='en'||!P||!started||MODE==='ed'){return h0.apply(this,arguments)}
  const pet=typeof PV!=='undefined'&&PV.inPet&&typeof DOM!=='undefined'&&DOM.pet,w=!rem&&!pet&&P.eq&&P.eq.w,k=pet?petEl(DOM.pet.p):w&&elOk(w.el)?w.el:null;if(!k)return h0.apply(this,arguments);
  const lv=pet?petElLv(DOM.pet.p):elLv(w),m=elMul(k,elOfEn(e));if(m!==1){d=Math.max(1,Math.round(d*m));if(Math.random()<.35)flt(e,m>1?'Debole!':'Resiste','#'+(m>1?'ffd84a':'9aa4b8'))}
  const hp0=e.hp;h0.call(this,e,d,rem,cr);if(!ents.includes(e)||e.hp<=0)return;if(Math.random()<.18+lv*.06)elProc(e,k,lv,Math.max(1,hp0-e.hp)||d,pet?DOM.pet:P)}}
// i compagni: l'elemento della specie, o quello scelto al Serraglio (p.el, p.elv)
const petEl=p=>p?(elOk(p.el)?p.el:elOfType(p.t,{})):null;
const petElLv=p=>clamp(((p&&p.elv)|0)||1,1,5);
/* ---- le armi nascono con un elemento ---- */
{const i0=item;item=function(lv,minR=0,slot){const it=i0(lv,minR,slot);try{if(it&&it.s==='w'&&!elOk(it.el)){const r=it.r|0,p=[0,.18,.45,.7,.85][Math.min(4,r)];if(Math.random()<p){it.el=ELK55[Math.floor(Math.random()*ELK55.length)];it.elv=1+(r>=3?1:0)+(Math.random()<.2?1:0);it.p=Math.round((it.p||0)*1.2+it.elv*20);elName(it)}}}catch(e){}return it}}
// gli unici ricalcolano il nome: il simbolo torna al suo posto
if(typeof uqFix==='function'){const f0=uqFix;uqFix=function(it){const r=f0(it);if(it&&elOk(it.el))elName(it);return r}}
/* ---- le essenze dai mostri ---- */
{const k0=kill;kill=function(e){const ok=e&&e.k==='en'&&ents.includes(e)&&started&&P&&MODE!=='ed'&&!e.tr;k0(e);if(!ok)return;try{const k=elOfEn(e),n=e.boss?4+Math.floor(Math.random()*4):Math.random()<(e.elite?.6:.28)?1:0;
  if(n&&elOk(k)){essAdd(k,n);flt(e,'+'+n+' '+EL55[k].i,EL55[k].c);if(n>1)msg('Essenze di '+EL55[k].n.toLowerCase()+': +'+n)}}catch(err){console.warn('essenze',err)}}}
/* ---- la Fucina di Borin: l'infusione elementale ---- */
const infCost=it=>{const l=elOk(it.el)?elLv(it):0;return{g:Math.round(120+l*140+(it.r|0)*60),e:3+l*3}};
function infHTML(){const w=P.eq.w;let h=`<h4>🔥 Infusione elementale</h4><p class="x43t">Borin fonde un'Essenza nella lama dell'arma che impugni: i colpi fanno scattare l'effetto dell'elemento. Le essenze le lasciano i mostri, secondo il loro elemento.</p>${essHTML()}`;
  if(!w)return h+'<p class="mu">Non impugni nessuna arma.</p>';const c=infCost(w),cur=elOk(w.el)?w.el:null;
  h+=`<p>Arma: <b style="color:${RC[w.r]}">${esc(iname(w))}</b> ${elTag(w)}</p>`;
  if(cur&&elLv(w)<5)h+=`<p><button ${P.g<c.g||essN(cur)<c.e?'disabled':''} onclick="infDo('${cur}')">⬆ ${EL55[cur].i} Livello ${elLv(w)+1} · ${c.g}💰 · ${c.e} ${EL55[cur].i}</button></p>`;else if(cur)h+='<p class="mu">L\'elemento è già al massimo (V).</p>';
  h+=`<div class="inf55">${ELK55.filter(k=>k!==cur).map(k=>{const c1={g:infCost({r:w.r}).g,e:3};return`<button ${P.g<c1.g||essN(k)<c1.e?'disabled':''} onclick="infDo('${k}',1)" title="${esc(EL55[k].d)}">${EL55[k].i} ${EL55[k].n}<small>${cur?'sostituisce':'infondi'} · ${c1.g}💰 · ${c1.e} ${EL55[k].i}</small></button>`}).join('')}</div>`;
  return h}
function infDo(k,fresh){const w=P.eq.w;if(!w||!elOk(k))return;const c=fresh?{g:infCost({r:w.r}).g,e:3}:infCost(w);if(P.g<c.g){msg('Servono '+c.g+' monete');tone(150,.1);return}if(essN(k)<c.e){msg('Servono '+c.e+' essenze di '+EL55[k].n.toLowerCase());tone(150,.1);return}
  P.g-=c.g;essAdd(k,-c.e);if(fresh||w.el!==k){w.el=k;w.elv=1}else w.elv=elLv(w)+1;elName(w);w.p=Math.round((w.p||0)+c.g*.3);
  banner(EL55[k].i+' '+EL55[k].n+' '+'I II III IV V'.split(' ')[w.elv-1],iname(w)+': '+EL55[k].d,'fulmine');jingle([64,71,76,83],.07,'triangle');if(cineOK())sparks(P.px,P.py,30,[EL55[k].c,EL55[k].c2],120);hud();save();pn('smith')}
{const p0=pn;pn=function(m,arg){p0(m,arg);if(m!=='smith'||PM!=='smith'||!started)return;const pe=$('pn');if(!pe||pe.querySelector('.inf55w'))return;const h4=[...pe.querySelectorAll('h4')].find(x=>/Potenziamento/.test(x.textContent));
  const box2=`<div class="inf55w">${infHTML()}</div>`;if(h4)h4.insertAdjacentHTML('beforebegin',box2);else pe.insertAdjacentHTML('beforeend',box2)}}
// i dettagli nello zaino
{const d0=ivDetail;ivDetail=function(){let h=d0();try{const f=IVSEL&&ivFind(IVSEL);if(f&&f.it&&elOk(f.it.el)){const it=f.it,X=EL55[it.el];h+=`<div class="el55c" style="--c:${X.c}"><b>${X.i} Elemento: ${X.n} ${'I II III IV V'.split(' ')[elLv(it)-1]}</b><small>${esc(X.d)} · scatta nel ${Math.round((.18+elLv(it)*.06)*100)}% dei colpi · forte contro ${(ELW55[it.el]||[]).map(q=>EL55[q].n.toLowerCase()).join(', ')}</small></div>`}}catch(e){}return h}}
/* ---- come si vede: gli stati sopra i mostri e l'aura dell'arma ---- */
{const e0=ent;ent=function(e){e0(e);if(!e||!started)return;try{
  if(e.k==='en'&&!D3B&&(e.uqb>t||e.uqv>t||e.uqf>t||e.acq55>t||e.cbs>t&&!(typeof DOM!=='undefined'&&DOM.cap&&DOM.cap.e===e))){const top=(e.m&&e.m.top||32)+8,L=[];if(e.uqb>t)L.push('#ff7a2a');if(e.uqv>t)L.push('#7ae05a');if(e.uqf>t)L.push('#9adcff');if(e.acq55>t)L.push('#3a9adf');if(e.cbs>t)L.push('#ffe28a');
    L.forEach((c,i)=>{const a=t*2.4+i*6.283/L.length;box(e.px+Math.cos(a)*.32-.05,e.py+Math.sin(a)*.32-.05,top+Math.sin(t*5+i)*1.2,.1,.1,2.4,c,1.35)})}
  if(e===P&&P.eq&&P.eq.w&&elOk(P.eq.w.el)&&cineOK()&&Math.random()<.22){const X=EL55[P.eq.w.el],d=P.dr||[0,1];burst(P.px+d[1]*.32+d[0]*.18,P.py-d[0]*.32+d[1]*.18,1,[X.c,X.c2],{v:.15,up:30,gr:-10,b:0,d:.7,s:2.4,z:24+Math.random()*12})}
  }catch(err){}}}
document.head.insertAdjacentHTML('beforeend',`<style>
.el55{display:inline-block;padding:0 6px;border-radius:9px;font-size:11px;line-height:17px;font-weight:bold;color:#14100a;background:var(--c);vertical-align:middle}
.el55c{margin:6px 0;padding:6px 9px;border-left:4px solid var(--c);background:#0003;border-radius:4px;display:flex;flex-direction:column;gap:2px}.el55c small{opacity:.85}
.ess55{display:flex;flex-wrap:wrap;gap:4px;margin:4px 0 8px}.ess55 span{display:flex;align-items:center;gap:3px;padding:2px 7px;border-radius:10px;background:#0004;border:1px solid var(--c);font-size:13px}.ess55 b{font-size:12px}
.inf55{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:5px;margin:6px 0}.inf55 button{margin:0;display:flex;flex-direction:column;align-items:flex-start;text-align:left}.inf55 small{font-size:10.5px;opacity:.8}
.inf55w{border:1px solid #f5b94244;border-radius:6px;padding:4px 10px;margin:8px 0;background:#ffffff06}
</style>`);
