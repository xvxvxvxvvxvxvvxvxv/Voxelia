/* ================= 7.55: IL SERRAGLIO DI ALDORIA — la casa dei compagni =================
   Un edificio tutto per i compagni domati, ad Aldoria vicino al lungomare a est (al posto delle due casette accanto al
   recinto dei cavalli). Dentro c'è la Domatrice Selene e quattro postazioni:
   - 💪 POTENZIA: Forza, Vita e Rapidità, un gradino alla volta (oro ed Essenze del suo elemento);
   - 🎨 MODIFICA: il nome, l'elemento (e il suo livello) e la taglia;
   - 🧬 MUTA FORMA (l'Altare della Mutazione): prende l'aspetto di un'altra specie del tuo bestiario, oppure diventa una
     chimera con la testa (e le ali) di un'altra specie. Si torna sempre alla forma di prima;
   - 🏡 PENSIONE (i recinti): ci lasci i compagni in attesa, fuori dalla stalla, fino a 30. Mentre aspettano guariscono e
     si allenano da soli, piano piano (mai oltre il tuo livello). Li vedi girare nei recinti;
   - 🥚 UOVA CHIMERA (il nido): un uovo misterioso da cui nasce un compagno che non esiste in natura, mescolando due specie.
   In Tomorrow le stesse cose si fanno dall'Allevamento del tuo borgo. */
XSV.add('dep55');XSV.add('egg55');
const SR55={tab:'pot',i:0,ren:0,q:''};
const SRMAX=30;
NPCS.selene55={n:'Domatrice Selene',role:'serr55',c:'#2f6a4a',hat:'#d4af37',ln:['Ogni creatura ha un carattere. Il mio lavoro è tirarlo fuori.','Lasciali pure qui: i recinti sono grandi, e io gli parlo tutto il giorno.','Una chimera? Ne ho viste nascere tre in vita mia. Ognuna ha cambiato il mio modo di vedere il mondo.','Le Essenze non si comprano: le lasciano i mostri. Ognuno quella del suo elemento.']};
IN.in_serraglio={n:'Serraglio di Aldoria',fl:'#6a5a3a',fl2:'#625236',wall:'#c8b088',np:[['selene55',8,2]],lay:[
'##################',
'#ŞŞ.ȹ..ƀƀƀ...ȹ.ŞŞ#',
'#................#',
'#ǮǮǮǮǮǮǮ..ǮǮǮǮǮǮǮ#',
'#Ǯ.....Ǯ..Ǯ.....Ǯ#',
'#Ǯ.....Ǯ..Ǯ.....Ǯ#',
'#Ǯ.....Ǯ..Ǯ.....Ǯ#',
'#Ǯ.....Ǯ..Ǯ.....Ǯ#',
'#ǮǮǮ.ǮǮǮ..ǮǮǮ.ǮǮǮ#',
'#................#',
'#ħħ............ȸȸ#',
'#......====......#',
'#.Ѫ....====....Ѡ.#',
'#......====......#',
'#p..ħ..====..ɐ..p#',
'#......====......#',
'#................#',
'########D#########']};
Z.in_serraglio=Object.assign({lv:0,N:IN.in_serraglio.lay.length,bg:'#141820',mus:'inter',int:1},IN.in_serraglio);
// i recinti: due rettangoli dove girano i compagni in pensione
const SRPEN=[[2,4,6,8],[11,4,15,8]];
/* ---- l'edificio ad Aldoria ---- */
{const g0=genTown;genTown=function(){const sp=g0();try{if(typeof OW!=='undefined'&&OW.on)return sp;srBuild()}catch(e){console.warn('serraglio',e)}return sp}}
function srBuild(){const old=TB.filter(b=>!b.to&&b.y===55&&(b.x===58||b.x===64));if(old.length!==2||TB.some(b=>b.to==='in_serraglio'))return;
  for(const b of old)for(let y=b.y;y<b.y+b.h;y++)for(let x=b.x;x<b.x+b.w;x++){M[y][x]=0;DEC[y][x]=''}
  for(const b of old)TB.splice(TB.indexOf(b),1);
  const nb={x:58,y:55,w:11,h:4,wall:'#d8c098',roof:'#2f6a4a',ht:30,to:'in_serraglio',dx:63};TB.push(nb);
  for(let y=0;y<N;y++)for(let x=0;x<N;x++)BM[y][x]=-1;TB.forEach((b,i)=>{for(let y=b.y;y<b.y+b.h;y++)for(let x=b.x;x<b.x+b.w;x++){M[y][x]=3;BM[y][x]=i}});
  ents.push(po(nb.dx,nb.y+nb.h,nb.to,{st:'door'}));
  for(const[x,y,c]of[[58,60,'ħ'],[59,60,'ħ'],[68,60,'ȸ'],[60,61,'p'],[66,61,'p']])if(M[y]&&M[y][x]===0&&!ents.some(e=>(e.px|0)===x&&(e.py|0)===y)){M[y][x]=6;DEC[y][x]=c}}
/* ---- le postazioni dentro e i compagni nei recinti ---- */
ITK.add('srv55');ITK.add('dep55');
{const l0=loadPost;loadPost=function(k){l0(k);try{if(k==='in_serraglio')srInside()}catch(e){console.warn('serraglio',e)}}}
function srInside(){const st=[[2,12,'forma','Altare della Mutazione'],[15,12,'mod','Vasca degli Elementi'],[13,14,'pot','Palo d\'allenamento'],[4,1,'uova','Nido delle uova'],[13,1,'uova','Nido delle uova'],[8,8,'pens','Recinti della pensione']];
  for(const[x,y,tab,n]of st)ents.push({k:'srv55',px:x+.5,py:y+.5,tab,n});srPens()}
function srPens(){for(let i=ents.length-1;i>=0;i--)if(ents[i].k==='dep55')ents.splice(i,1);if(Zk!=='in_serraglio')return;const L=srDep();
  L.slice(0,16).forEach((p,i)=>{pvType(p.t);if(p.cm55)pvType(p.cm55);if(p.fm55)pvType(p.fm55);const pen=SRPEN[i%2],x=pen[0]+((i>>1)*1.7)%(pen[2]-pen[0])+.5,y=pen[1]+.5+((i>>1)%3);
    ents.push({k:'dep55',p,px:x,py:y,tx:x,ty:y,n:'🏡 '+domName(p),m:petModel55(p,0),fd:[0,1],wt:Math.random()*3,pen})})}
function srWander(dt){if(Zk!=='in_serraglio')return;for(const e of ents){if(e.k!=='dep55')continue;e.wt-=dt;const[x0,y0,x1,y1]=e.pen;
  if(e.wt<=0){e.wt=2+Math.random()*4;e.tx=x0+.6+Math.random()*(x1-x0-.2);e.ty=y0+.6+Math.random()*(y1-y0-.2)}
  const dx=e.tx-e.px,dy=e.ty-e.py,d=Math.hypot(dx,dy);if(d>.08){const s=Math.min(d,dt*1.1);mv(e,dx/d*s,dy/d*s);e.px=clamp(e.px,x0+.5,x1+.5);e.py=clamp(e.py,y0+.5,y1+.5);e.mvT=t;e.fd=[dx,dy]}
  if(e.p&&e.p.vr==='rgb')e.m=petModel55(e.p,pvStep())}}
{const e0=ent;ent=function(e){if(e&&e.k==='srv55'){const top=Math.sin(t*2+e.px)*2;if(!D3B){const sx=PX(e.px,e.py),sy=PY(e.px,e.py,0);g.textAlign='center';g.font='bold 10px Georgia,serif';label(({pot:'💪',mod:'🎨',forma:'🧬',pens:'🏡',uova:'🥚'})[e.tab]+' '+e.n,sx,sy-44+top,'#ffe8b0')}return}
  if(e&&e.k==='dep55'){e.k='tr';e.tr=1;try{e0(e)}finally{e.k='dep55';e.tr=0}if(!D3B){const top=(e.m&&e.m.top||30)+12,sx=PX(e.px,e.py),sy=PY(e.px,e.py,0);g.textAlign='center';g.font='9px Georgia,serif';label(e.n,sx,sy-top,'#d8ffd8')}return}e0(e)}}
{const a0=act;act=function(e){if(e&&e.k==='srv55'){SR55.tab=e.tab;pn('serr55');return}if(e&&e.k==='dep55'){SR55.tab='pens';pn('serr55');e.hrt=t;tone(660,.08,'sine',.05);return}
  a0(e)}}
// la Domatrice: un pulsante in più nel dialogo
{const p0=pn;pn=function(m,arg){p0(m,arg);if(m==='npc'&&PM==='npc'&&PA&&PA.nid==='selene55'){const pe=$('pn');if(pe&&!pe.querySelector('.sr55b')){const b=[...pe.querySelectorAll('button')].pop();if(b)b.insertAdjacentHTML('beforebegin',`<button class="sr55b" onclick="SR55.tab='pot';pn('serr55')">🐾 Il Serraglio: potenzia, modifica, muta forma, pensione</button>`)}}}}
/* ---- i dati ---- */
const srDep=()=>{if(!P)return[];if(!Array.isArray(P.dep55))P.dep55=[];P.dep55=P.dep55.filter(p=>p&&p.t&&pvType(p.t));return P.dep55};
const UP55={a:{n:'Forza',i:'⚔',mx:10,k:.07,d:'attacco'},v:{n:'Vita',i:'❤',mx:10,k:.07,d:'punti vita'},s:{n:'Rapidità',i:'💨',mx:5,k:.05,d:'tempo fra un attacco e l\'altro'}};
const upN=(p,k)=>clamp((p&&p.up55&&p.up55[k])|0,0,UP55[k].mx);
const upCost=(p,k)=>{const n=upN(p,k);return{g:Math.round((150+n*120)*(1+(p.lv|0)/30)),e:1+n}};
// le statistiche vere del compagno (quelle della stalla più i potenziamenti e la variante)
function petStats55(p){const st=domStats(p),vb=typeof pvBonus==='function'?pvBonus(p):0;return{mx:Math.round(st.mx*(1+UP55.v.k*upN(p,'v'))),at:+(st.at*(1+vb)*(1+UP55.a.k*upN(p,'a'))).toFixed(1),cd:+(st.cd*(1-UP55.s.k*upN(p,'s'))).toFixed(2),ev:st.ev,b:st}}
function petApply55(e){if(!e||!e.p)return;const p=e.p,S=petStats55(p),r=e.mx>0?clamp(e.hp/e.mx,0,1):1;e.mx=S.mx;e.hp=Math.max(1,Math.round(S.mx*r));e.at=S.at;e.cd=S.cd}
{const s0=domSummon;domSummon=function(){s0();const e=DOM.pet;if(e&&e.p)petApply55(e)}}
{const x0=domXP;domXP=function(p,tg){const lv=p&&p.lv;x0(p,tg);if(p&&p.lv!==lv&&DOM.pet&&DOM.pet.p===p&&ents.includes(DOM.pet))petApply55(DOM.pet)}}
/* ---- il pannello ---- */
const srPets=()=>{domFix();return P.pets||[]};
function srSel(){const L=srPets();if(SR55.i>=L.length)SR55.i=Math.max(0,L.length-1);return L[SR55.i]||null}
const srPv=(p,i,big)=>`<canvas class="sr55pv${big?' big':''}" data-k="${i}" width="${big?150:64}" height="${big?150:64}"></canvas>`;
function srTabs(){const T=[['pot','💪 Potenzia'],['mod','🎨 Modifica'],['forma','🧬 Muta forma'],['pens','🏡 Pensione'],['uova','🥚 Uova chimera']];return`<div class="tabs sr55t">${T.map(([k,n])=>`<button class="${SR55.tab===k?'on':''}" onclick="SR55.tab='${k}';pn('serr55')">${n}</button>`).join('')}</div>`}
function srPick(){const L=srPets();if(!L.length)return'<p class="dmh">Nella stalla non hai compagni. Domane uno (Z su un mostro indebolito), fai nascere un Uovo chimera o ritirane uno dalla pensione.</p>';
  return`<div class="sr55pk">${L.map((p,i)=>`<button class="${i===SR55.i?'on':''}" onclick="SR55.i=${i};SR55.ren=0;pn('serr55')" title="${esc(domName(p))}">${srPv(p,'s'+i)}<small>${esc(String(p.n).slice(0,12))}</small></button>`).join('')}</div>`}
function srHead(p){const S=petStats55(p),k=petEl(p),X=EL55[k];return`<div class="sr55h">${srPv(p,'sel',1)}<div><b>${esc(domName(p))}</b> ${typeof pvTag==='function'?pvTag(p.vr):''} <span class="el55" style="--c:${X.c}">${X.i} ${X.n} ${'I II III IV V'.split(' ')[petElLv(p)-1]}</span>
  <small>${esc(DOMF[domFam(p.t)].n)} · livello ${p.lv}${p.cm55?' · chimera con '+esc(String(E[p.cm55]&&E[p.cm55].n||p.cm55)):''}${p.fm55?' · forma di '+esc(String(E[p.fm55]&&E[p.fm55].n||p.fm55)):''}</small>
  <small>❤ ${S.mx} · ⚔ ${S.at} · ⏱ ${S.cd}s · ✦ ${esc(DOMF[domFam(p.t)].sp)}</small></div></div>`}
X43P.serr55=()=>{const inB=Zk==='in_serraglio'||typeof twOn==='function'&&twOn();let h=`<h3>🐾 Serraglio · 💰${P.g}</h3>`;if(!inB)return h+'<p class="mu">Le cure del Serraglio si fanno solo dentro l\'edificio, ad Aldoria vicino al lungomare a est.</p><button onclick="cl()">Chiudi</button>';
  h+=srTabs()+essHTML();const tab=SR55.tab;
  if(tab==='pens')h+=srPensHTML();else if(tab==='uova')h+=srEggHTML();else{h+=srPick();const p=srSel();if(p){h+=srHead(p);h+=tab==='pot'?srPotHTML(p):tab==='mod'?srModHTML(p):srFormHTML(p)}}
  return h+`<div class="sr55f"><button onclick="pn('pets')">🐾 La stalla (N)</button><button onclick="cl()">Chiudi</button></div>`};
{const p0=pn;pn=function(m,arg){p0(m,arg);if(m==='serr55'&&PM==='serr55')srPaint()}}
function srPaint(){const pe=$('pn');if(!pe)return;const L=srPets();for(const c of pe.querySelectorAll('canvas.sr55pv')){const k=c.dataset.k;let p=null;if(k==='sel')p=srSel();else if(k[0]==='s')p=L[+k.slice(1)];else if(k[0]==='d')p=srDep()[+k.slice(1)];
  else if(k[0]==='f'){const b=srSel();if(b)p=Object.assign({},b,{fm55:k.slice(2)})}else if(k[0]==='c'){const b=srSel();if(b)p=Object.assign({},b,{cm55:k.slice(2)})}if(p)petPaint(c,p)}}
// 💪 potenzia
function srPotHTML(p){const k=petEl(p);let h=`<p class="x43t">Ogni gradino costa oro ed Essenze di ${EL55[k].n.toLowerCase()} ${EL55[k].i}, l'elemento del compagno.</p><div class="sr55u">`;
  for(const q of Object.keys(UP55)){const U=UP55[q],n=upN(p,q),c=upCost(p,q);h+=`<div><b>${U.i} ${U.n}</b><span class="sr55pip">${Array.from({length:U.mx},(_,i)=>`<i class="${i<n?'on':''}"></i>`).join('')}</span><small>${q==='s'?'−':'+'}${Math.round(U.k*100*n)}% ${U.d}</small>
    ${n>=U.mx?'<small class="mu">al massimo</small>':`<button ${P.g<c.g||essN(k)<c.e?'disabled':''} onclick="srUp('${q}')">+1 · ${c.g}💰 · ${c.e} ${EL55[k].i}</button>`}</div>`}
  return h+'</div>'}
function srUp(q){const p=srSel();if(!p||!UP55[q])return;const n=upN(p,q),c=upCost(p,q),k=petEl(p);if(n>=UP55[q].mx)return;if(P.g<c.g){msg('Servono '+c.g+' monete');tone(150,.1);return}if(essN(k)<c.e){msg('Servono '+c.e+' essenze di '+EL55[k].n.toLowerCase());tone(150,.1);return}
  P.g-=c.g;essAdd(k,-c.e);p.up55=p.up55||{};p.up55[q]=n+1;if(DOM.pet&&DOM.pet.p===p)petApply55(DOM.pet);jingle([67,71,74,79],.06,'triangle');msg(domName(p)+': '+UP55[q].n+' '+(n+1)+'/'+UP55[q].mx);hud();save();pn('serr55')}
// 🎨 modifica
const SZ55=[[.8,'Piccolo'],[.9,'Minuto'],[1,'Normale'],[1.12,'Robusto'],[1.25,'Grande'],[1.35,'Enorme']];
function srModHTML(p){const k=petEl(p),own=elOk(p.el),lv=petElLv(p);let h=`<h4>Il nome</h4>`;
  h+=SR55.ren?`<span class="pvren"><input id="sr55n" maxlength="22" value="${esc(p.n)}" onkeydown="event.stopPropagation();if(event.key==='Enter')srRen(1);else if(event.key==='Escape')srRen(0)"><button onclick="srRen(1)">✔</button><button onclick="srRen(0)">✖</button></span>`:`<button onclick="SR55.ren=1;pn('serr55');setTimeout(()=>{const e=$('sr55n');if(e){e.focus();e.select()}},20)">✏ Rinomina (gratis)</button>`;
  h+=`<h4>L'elemento</h4><p class="x43t">${own?'Infuso al Serraglio':'Quello della sua specie'}: ${EL55[k].i} <b>${EL55[k].n}</b> — ${esc(EL55[k].d)}. Scatta nel ${Math.round((.18+lv*.06)*100)}% dei suoi colpi.</p>`;
  if(lv<5){const c={g:200*lv+100,e:3*lv};h+=`<button ${P.g<c.g||essN(k)<c.e?'disabled':''} onclick="srEl('${k}',0)">⬆ ${EL55[k].i} Livello ${lv+1} · ${c.g}💰 · ${c.e} ${EL55[k].i}</button>`}
  h+=`<div class="inf55">${ELK55.filter(q=>q!==k).map(q=>`<button ${P.g<300||essN(q)<6?'disabled':''} onclick="srEl('${q}',1)" title="${esc(EL55[q].d)}">${EL55[q].i} ${EL55[q].n}<small>cambia · 300💰 · 6 ${EL55[q].i}</small></button>`).join('')}</div>`;
  const sz=+p.sz55||1;h+=`<h4>La taglia</h4><div class="seg">${SZ55.map(([v,n])=>`<button class="${Math.abs(sz-v)<.01?'on':''}" ${Math.abs(sz-v)<.01?'disabled':''} onclick="srSz(${v})">${n}</button>`).join('')}</div><p class="mu">Cambiare taglia costa 150💰: è solo l'aspetto, la forza non cambia.</p>`;
  return h}
function srRen(ok){const p=srSel(),el=$('sr55n');if(ok&&p&&el){const n=String(el.value||'').replace(/[<>]/g,'').replace(/\s+/g,' ').trim().slice(0,22);if(n){p.n=n;if(DOM.pet&&DOM.pet.p===p)DOM.pet.n=typeof pvLabel==='function'?pvLabel(p):domName(p);msg('Ora si chiama '+n);save()}}SR55.ren=0;pn('serr55')}
function srEl(k,ch){const p=srSel();if(!p||!elOk(k))return;const lv=petElLv(p),c=ch?{g:300,e:6}:{g:200*lv+100,e:3*lv};if(!ch&&lv>=5)return;if(P.g<c.g){msg('Servono '+c.g+' monete');tone(150,.1);return}if(essN(k)<c.e){msg('Servono '+c.e+' essenze di '+EL55[k].n.toLowerCase());tone(150,.1);return}
  P.g-=c.g;essAdd(k,-c.e);if(ch){p.el=k;p.elv=1}else{p.el=k;p.elv=lv+1}banner(EL55[k].i+' '+domName(p),EL55[k].n+' '+'I II III IV V'.split(' ')[p.elv-1]+' · '+EL55[k].d,'stella');jingle([64,71,76],.08,'triangle');if(cineOK())sparks(P.px,P.py,24,[EL55[k].c,EL55[k].c2],110);hud();save();pn('serr55')}
function srSz(v){const p=srSel();if(!p)return;if(P.g<150){msg('Servono 150 monete');tone(150,.1);return}P.g-=150;p.sz55=v;if(DOM.pet&&DOM.pet.p===p)domSummon();tone(700,.08,'triangle');hud();save();pn('serr55')}
// 🧬 muta forma e chimera
const srBest=()=>Object.keys(P.bst||{}).filter(k=>pvType(k)&&E[k].m&&!E[k].boss);
function srFormHTML(p){const L=srBest().filter(k=>k!==p.t),k=petEl(p),q=SR55.q.trim().toLowerCase(),F=L.filter(s=>!q||String(E[s].n||s).toLowerCase().includes(q));
  let h=`<p class="x43t">All'Altare della Mutazione il compagno prende un'altra forma tra le specie che hai domato (il tuo bestiario: ${L.length}), oppure diventa una <b>chimera</b>: tiene il suo corpo e prende la testa (e le ali, se le ha) di un'altra specie. Forza, mossa e livello restano i suoi.</p>`;
  if(p.fm55||p.cm55)h+=`<p>${p.fm55?`<button onclick="srForm('',0)">↩ Torna alla sua forma</button>`:''}${p.cm55?`<button onclick="srForm('',1)">↩ Togli la chimera</button>`:''} <span class="mu">gratis</span></p>`;
  if(!L.length)return h+'<p class="dmh">Doma altre specie per sbloccare nuove forme.</p>';
  h+=`<input id="sr55q" type="search" placeholder="Cerca una specie" value="${esc(SR55.q)}" oninput="SR55.q=this.value;clearTimeout(SR55.qt);SR55.qt=setTimeout(()=>{pn('serr55');const e=$('sr55q');if(e){e.focus();e.setSelectionRange(e.value.length,e.value.length)}},250)" onkeydown="event.stopPropagation()">`;
  const cf={g:500,e:5},cc={g:700,e:8};h+=`<p class="mu">Forma: ${cf.g}💰 + ${cf.e} ${EL55[k].i} · Chimera: ${cc.g}💰 + ${cc.e} ${EL55[k].i}</p><div class="sr55fm">`;
  for(const s of F.slice(0,24)){const nm=String(E[s].n||s);h+=`<div><span class="sr55two">${srPv(p,'f:'+s)}${srPv(p,'c:'+s)}</span><b>${esc(nm)}</b><span><button ${p.fm55===s||P.g<cf.g||essN(k)<cf.e?'disabled':''} onclick="srForm('${s}',0)">Forma</button><button ${p.cm55===s||P.g<cc.g||essN(k)<cc.e?'disabled':''} onclick="srForm('${s}',1)">Chimera</button></span></div>`}
  if(F.length>24)h+=`<p class="mu">…e altre ${F.length-24}: cercale per nome.</p>`;return h+'</div>'}
function srForm(s,ch){const p=srSel();if(!p)return;const k=petEl(p);if(s){const c=ch?{g:700,e:8}:{g:500,e:5};if(!pvType(s))return;if(P.g<c.g){msg('Servono '+c.g+' monete');tone(150,.1);return}if(essN(k)<c.e){msg('Servono '+c.e+' essenze di '+EL55[k].n.toLowerCase());tone(150,.1);return}P.g-=c.g;essAdd(k,-c.e)}
  if(ch)p.cm55=s||undefined;else p.fm55=s||undefined;if(!p.cm55)delete p.cm55;if(!p.fm55)delete p.fm55;if(DOM.pet&&DOM.pet.p===p)domSummon();
  if(s){banner(ch?'🧬 Una chimera!':'🧬 Mutazione',domName(p)+(ch?' ora ha la testa di '+E[s].n:' ha preso la forma di '+E[s].n),'stella');jingle([60,63,67,70,75],.09,'sawtooth');const al=ents.find(e=>e.k==='srv55'&&e.tab==='forma');if(cineOK())sparks(al?al.px:P.px,al?al.py:P.py,40,['#d8a0ff','#7a3aff','#ffffff'],140)}
  hud();save();pn('serr55')}
// 🏡 pensione
function srTrain(p){if(!p||!p.dt55)return 0;const min=Math.max(0,(Date.now()-p.dt55)/60000);if(min<1)return 0;const cap=Math.min(40,Math.max(1,(P.lv|0)+2)),need=l=>40+l*l*14;let x=Math.floor(min*(6+p.lv*2)),up=0;
  while(x>0&&p.lv<cap){const r=need(p.lv)-(p.xp|0);if(x>=r){x-=r;p.xp=0;p.lv++;up++}else{p.xp=(p.xp|0)+x;x=0}}p.dt55=Date.now();p.ko=0;p.kt=0;p.hp=petStats55(p).b.mx;return up}
function srPensHTML(){const D=srDep(),L=srPets();let up=0;for(const p of D)up+=srTrain(p);if(up)save();
  let h=`<p class="x43t">I compagni in pensione non occupano posto nella stalla (${L.length}/${domMax()}). Guariscono e si allenano da soli: crescono piano piano, mai oltre il livello ${Math.min(40,(P.lv|0)+2)}. In pensione: <b>${D.length}/${SRMAX}</b>.</p>`;
  h+=`<h4>Nei recinti</h4>`+(D.length?`<div class="sr55dl">${D.map((p,i)=>`<div>${srPv(p,'d'+i)}<span><b>${esc(domName(p))}</b>${typeof pvTag==='function'?pvTag(p.vr):''}<small>livello ${p.lv} · ${EL55[petEl(p)].i} ${EL55[petEl(p)].n}</small></span><button ${L.length>=domMax()?'disabled title="La stalla è piena"':''} onclick="srOut(${i})">Ritira</button></div>`).join('')}</div>`:'<p class="mu">Nessuno, per ora.</p>');
  h+=`<h4>Dalla stalla</h4>`+(L.length?`<div class="sr55dl">${L.map((p,i)=>`<div>${srPv(p,'s'+i)}<span><b>${esc(domName(p))}</b><small>livello ${p.lv}${i===P.pet?' · <b>è con te</b>':''}</small></span><button ${D.length>=SRMAX?'disabled':''} onclick="srIn(${i})">Lascia in pensione</button></div>`).join('')}</div>`:'<p class="mu">La stalla è vuota.</p>');return h}
function srIn(i){const L=srPets(),p=L[i];if(!p)return;const D=srDep();if(D.length>=SRMAX){msg('La pensione è piena');return}if(DOM.pet&&DOM.pet.p===p)domDismiss(1);L.splice(i,1);if(P.pet===i)P.pet=null;else if(P.pet!=null&&P.pet>i)P.pet--;
  p.dt55=Date.now();D.push(p);srPens();msg(domName(p)+' resta al Serraglio');tone(520,.08,'triangle');save();pn('serr55')}
function srOut(i){const D=srDep(),p=D[i],L=srPets();if(!p)return;if(L.length>=domMax()){msg('La stalla è piena: libera un posto');tone(150,.1);return}const up=srTrain(p);delete p.dt55;D.splice(i,1);L.push(p);srPens();
  msg(domName(p)+' torna nella stalla'+(up?' (+'+up+' livelli di allenamento)':''));jingle([67,72,76],.07,'triangle');save();pn('serr55')}
// 🥚 le uova chimera
const EGG55C=1200,EGG55T=90000;
const srEggPool=()=>Object.keys(E).filter(k=>{const b=E[k];return b&&b.m&&b.m.g&&b.m.g.hd&&!b.boss&&!b.np&&b.n&&!/^(tw\.|x47\.)/.test(k)&&b.hp<400});
function srEggHTML(){const g2=P.egg55;let h=`<p class="x43t">Nel nido Selene custodisce uova che non dovrebbero esistere: da ognuna nasce un compagno nuovo, con il corpo di una specie e la testa di un'altra, e un elemento tutto suo. Nessuno sa cosa ne uscirà.</p>`;
  if(g2){const s=Math.max(0,Math.ceil((g2.t-Date.now())/1000));h+=`<div class="qb">🥚 <b>Un uovo nel nido</b> · ${s>0?`si schiude fra ${s} secondi`:'si sta schiudendo!'}${s<=0?` <button onclick="srHatch(1)">Guarda</button>`:''}</div>`;clearTimeout(SR55.et);if(s>0)SR55.et=setTimeout(()=>{if(PM==='serr55'&&SR55.tab==='uova')pn('serr55')},1000)}
  else h+=`<button ${P.g<EGG55C?'disabled':''} onclick="srEgg()">🥚 Compra un Uovo chimera · ${EGG55C}💰</button> <span class="mu">si schiude in un minuto e mezzo</span>`;return h}
function srEgg(){if(P.egg55)return;if(P.g<EGG55C){msg('Servono '+EGG55C+' monete');tone(150,.1);return}const L=srEggPool();if(L.length<2)return;const a=L[Math.floor(Math.random()*L.length)];let b=a;while(b===a)b=L[Math.floor(Math.random()*L.length)];
  P.g-=EGG55C;P.egg55={a,b,t:Date.now()+EGG55T,el:ELK55[Math.floor(Math.random()*ELK55.length)]};banner('🥚 Un uovo misterioso','Si schiude fra un minuto e mezzo, nel nido del Serraglio','stella');jingle([64,67,71],.1,'triangle');hud();save();pn('serr55')}
function srHatch(show){const g2=P.egg55;if(!g2||Date.now()<g2.t||!started||!P)return;domFix();if(P.pets.length>=domMax()){if(show)msg('La stalla è piena: libera un posto (o lascia qualcuno in pensione) per accogliere il piccolo');return}
  if(!pvType(g2.a)||!pvType(g2.b)){P.egg55=null;save();return}const nm=typeof incName==='function'?incName(E[g2.a].n,E[g2.b].n):E[g2.a].n,p={id:uid(),t:g2.a,n:nm,lv:Math.max(1,Math.min(P.lv|0,4+Math.floor((P.lv|0)*.6))),xp:0,hp:0,bd:typeof gDay==='function'?gDay():0,cm55:g2.b,el:g2.el,elv:1};
  p.hp=domStats(p).mx;P.pets.push(p);P.bst[g2.a]=(P.bst[g2.a]|0)+1;P.egg55=null;banner('🐣 È nato '+nm+'!','Corpo di '+E[g2.a].n+', testa di '+E[g2.b].n+' · '+EL55[g2.el].i+' '+EL55[g2.el].n,'stella');jingle([60,64,67,72,76,79,84],.08,'triangle');
  if(cineOK())sparks(P.px,P.py,40,['#d8a0ff','#ffd84a','#ffffff'],140);save();hud();if(PM==='serr55')pn('serr55')}
let SRT=0;{const u0=upd;upd=function(dt){u0(dt);if(!started||!P)return;try{srWander(dt);SRT+=dt;if(SRT>2){SRT=0;if(P.egg55&&Date.now()>=P.egg55.t)srHatch(0)}}catch(e){console.warn('serraglio',e)}}}
// la stalla: dove trovare il Serraglio
{const p0=pn;pn=function(m,arg){p0(m,arg);if(m!=='pets'||PM!=='pets')return;const pe=$('pn');if(!pe||pe.querySelector('.sr55s'))return;const inB=Zk==='in_serraglio'||typeof twOn==='function'&&twOn(),D=Array.isArray(P.dep55)?P.dep55.length:0;
  const h3=pe.querySelector('h3');const x=inB?`<button class="sr55s" onclick="SR55.tab='pot';pn('serr55')">🏛 Serraglio: potenzia, modifica, muta forma, pensione${D?' ('+D+' in pensione)':''}</button>`:`<p class="sr55s mu">🏛 Al <b>Serraglio di Aldoria</b> (vicino al lungomare, a est) puoi potenziarli, cambiarne l'elemento e la forma e lasciarli in pensione${D?' · '+D+' ti aspettano là':''}.</p>`;
  if(h3)h3.insertAdjacentHTML('afterend',x)}}
// in Tomorrow: dall'Allevamento del borgo
{const p0=pn;pn=function(m,arg){p0(m,arg);if(m!=='allev'||PM!=='allev')return;const pe=$('pn');if(!pe||pe.querySelector('.sr55s'))return;const h3=pe.querySelector('h3');if(h3)h3.insertAdjacentHTML('afterend',`<button class="sr55s" onclick="SR55.tab='pot';pn('serr55')">🏛 Il Serraglio: potenzia, modifica, muta forma, pensione, uova chimera</button>`)}}
/* ---- gli arredi del Serraglio ---- */
{const d0=dec;dec=function(x,y,c,h){switch(c){
  case 'Ǯ':{const n=(a,b)=>M[y+b]&&M[y+b][x+a]===6&&DEC[y+b][x+a]==='Ǯ',W='#8a6a42';box(x+.44,y+.44,0,.12,.12,14,'#6b4a2b');if(n(1,0)){box(x+.5,y+.46,5,.5,.08,2,W);box(x+.5,y+.46,11,.5,.08,2,W)}if(n(-1,0)){box(x,y+.46,5,.5,.08,2,W);box(x,y+.46,11,.5,.08,2,W)}
    if(n(0,1)){box(x+.46,y+.5,5,.08,.5,2,W);box(x+.46,y+.5,11,.08,.5,2,W)}if(n(0,-1)){box(x+.46,y,5,.08,.5,2,W);box(x+.46,y,11,.08,.5,2,W)}break}
  case 'ħ':box(x+.08,y+.12,0,.84,.76,10,'#d8b850');for(let i=0;i<3;i++)box(x+.08,y+.2+i*.24,10,.84,.06,.5,'#b89a38');box(x+.2,y+.15,10,.1,.7,.4,'#a8803a');break;
  case 'ȸ':box(x+.05,y+.25,0,.9,.5,7,'#6b4a2b');box(x+.1,y+.3,7,.8,.4,1,'#3a8adf',1+Math.sin(t*2+x)*.04);break;
  case 'Ş':box(x+.05,y+.2,0,.9,.6,30,'#7a5a3a');for(let i=0;i<3;i++){box(x+.08,y+.22,7+i*9,.84,.56,1,'#5a3a1a');for(let j=0;j<3;j++)box(x+.14+j*.26,y+.35,8+i*9,.16,.16,5,['#ff7a2a','#3a9adf','#7ae05a','#9a5ad0','#fff36a','#9adcff'][(i*3+j+x)%6],1.25)}break;
  case 'ƀ':box(x,y+.1,0,1,.8,14,'#6b4a2b');box(x-.02,y+.08,14,1.04,.84,2,'#d4af37');if((x&1)===0){box(x+.3,y+.3,16,.2,.2,6,'#3a8adf',1.2);box(x+.32,y+.32,22,.16,.16,2,'#ffffff')}else box(x+.25,y+.35,16,.5,.3,3,'#e8dcc8');break;
  case 'Ѫ':{const u=Math.sin(t*1.6)*2;box(x+.05,y+.05,0,.9,.9,8,'#3a2a4a');box(x+.15,y+.15,8,.7,.7,6,'#5a3a7a');box(x+.3,y+.3,14,.4,.4,2,'#d4af37');
    for(let i=0;i<6;i++){const a=i/6*6.283+t*.9;box(x+.5+Math.cos(a)*.36-.05,y+.5+Math.sin(a)*.36-.05,22+u+Math.sin(t*3+i)*2,.1,.1,3,i%2?'#d8a0ff':'#7a3aff',1.4)}
    box(x+.4,y+.4,26+u,.2,.2,8,'#e8c8ff',1.45);if(SET.ultra)GLOW.push([x+.5,y+.5,28,50,'200,140,255',.3]);break}
  case 'Ѡ':{box(x+.02,y+.02,0,.96,.96,9,'#8a8a94');box(x+.1,y+.1,9,.8,.8,1,'#2a6aaf',1.1+Math.sin(t*2)*.05);const L=['#ff7a2a','#9adcff','#fff36a','#7ae05a'];
    L.forEach((c,i)=>{const a=i/4*6.283+t*.7;box(x+.5+Math.cos(a)*.26-.05,y+.5+Math.sin(a)*.26-.05,14+Math.sin(t*2.5+i)*2.5,.1,.1,3,c,1.45)});if(SET.ultra)GLOW.push([x+.5,y+.5,14,46,'120,180,255',.25]);break}
  case 'ȹ':box(x+.1,y+.1,0,.8,.8,4,'#8a6a42');box(x+.15,y+.15,4,.7,.7,2,'#d8b850');box(x+.3,y+.3,6,.4,.4,7,'#f0e8d8');box(x+.35,y+.35,13,.3,.3,2,'#e8dcc8');box(x+.38,y+.42,8,.1,.02,3,'#c8a0ff',1.3);break;
  case 'ɐ':box(x+.43,y+.43,0,.14,.14,28,'#6b4a2b');box(x+.2,y+.44,18,.6,.12,3,'#6b4a2b');box(x+.34,y+.34,24,.32,.32,8,'#d8b850');box(x+.36,y+.36,20,.28,.28,4,'#c8503a');break;
  default:d0(x,y,c,h)}}}
document.head.insertAdjacentHTML('beforeend',`<style>
#pn[data-m="serr55"]{width:min(720px,96vw)}.sr55t{display:flex;flex-wrap:wrap;gap:2px;margin:4px 0}.sr55t button{margin:0}
.sr55pk{display:flex;gap:5px;overflow-x:auto;padding:4px 0 8px}.sr55pk button{flex:none;display:flex;flex-direction:column;align-items:center;gap:2px;padding:4px;margin:0;min-width:74px}.sr55pk button.on{outline:2px solid #7aff8a;background:#2a4a3a}.sr55pk small{font-size:10px}
.sr55pv{width:64px;height:64px;border-radius:8px;background:radial-gradient(circle at 50% 70%,#3a5a3a,#1a221a)}.sr55pv.big{width:150px;height:150px;flex:none}
.sr55h{display:flex;gap:12px;align-items:center;margin:6px 0 10px;padding:8px;border-radius:10px;background:#ffffff08;border:1px solid #7aff8a44}.sr55h>div{display:flex;flex-direction:column;gap:4px;min-width:0}.sr55h small{opacity:.85}
.sr55u{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:8px}.sr55u>div{display:flex;flex-direction:column;gap:4px;padding:8px;border-radius:8px;background:#0003}.sr55u button{margin:4px 0 0}
.sr55pip{display:flex;gap:3px}.sr55pip i{width:12px;height:8px;border-radius:2px;background:#0006;border:1px solid #7aff8a55}.sr55pip i.on{background:#7aff8a}
.sr55fm{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:6px;margin:6px 0}.sr55fm>div{display:flex;flex-direction:column;gap:4px;align-items:flex-start;padding:6px;border-radius:8px;background:#0003}.sr55two{display:flex;gap:4px}.sr55fm button{margin:0 4px 0 0;padding:3px 9px}
.sr55dl{display:flex;flex-direction:column;gap:5px}.sr55dl>div{display:flex;gap:8px;align-items:center;padding:4px 6px;border-radius:8px;background:#0003}.sr55dl>div>span{flex:1;display:flex;flex-direction:column;min-width:0}.sr55dl button{margin:0}
#sr55q{margin:4px 0}.sr55f{display:flex;gap:6px;margin-top:8px}.sr55s{display:block;margin:4px 0 8px}
@media(max-width:560px){.sr55h{flex-direction:column;align-items:flex-start}.sr55pv.big{width:110px;height:110px}}
</style>`);
