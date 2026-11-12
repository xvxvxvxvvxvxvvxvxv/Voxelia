/* ================= 8.6: PANNELLO SVILUPPATORE — «☠ Minaccia e Atto II» =================
   Una scheda per provare tutto quello che c'è di nuovo nella 8.6:
   - la Minaccia del Regno: forzarla a un livello (o lasciarla al gioco), aggiungere giorni passati, leggere i conti;
   - le mosse nuove: far comparire accanto all'eroe un nemico per ruolo (guerriero, bestia agile, nemico grosso, arciere)
     e un Campione con i poteri, già in allerta;
   - la notte pericolosa (subito notte e una creatura dal buio) e le invasioni (comincia, vinci, perdi);
   - l'Atto II: scegliere il passo, accendere le stelle, andare nella Valle o in un dungeon nuovo, vedere i filmati. */
const DV86={};
function dv86Spawn(k,elite){if(!started||!P)return;const R=k==='ruoli'?['bandito','lupo','golem_cr','arciere']:[k];let i=0;
  for(const tp of R){if(!E[tp])continue;const a=i*1.57+.4,[x,y]=nearFree(clamp(Math.floor(P.px+Math.cos(a)*3),1,N-2),clamp(Math.floor(P.py+Math.sin(a)*3),1,N-2));const e=mk(tp,x,y);e.al=1;e.th86=Math.max(e.th86||0,th86L());
    if(elite&&typeof eliteMk==='function'){eliteMk(e);af86Give(e,Math.max(7,th86L()))}ents.push(e);i++}dvSay(i+' nemici accanto a te')}
function dv86Body(){if(!started||!P)return dv3Need();const v=th86Val(),L=Math.floor(v+1e-6),o=th86Fix(),A=a2Fix(),iv=iv86Fix(),here=th86Here();
  let h=`<h4>☠ Minaccia del Regno <span class="mu">${MODE==='story'?'':'vale solo nella Storia'}</span></h4>
  <div class="dvr"><span>Adesso: <b style="color:${THC86[L]}">${L} · ${THN86[L]}</b> (${v.toFixed(2)})${here?'':' · <i>in questa zona non conta</i>'}<br><small class="mu">storia +${th86Story().toFixed(1)} · giorni +${th86Days().toFixed(2)} (${o.d.toFixed(2)} giorni) · alba −${(o.sub||0).toFixed(1)}</small></span>
    <select onchange="TH86.dev=this.value===''?null:+this.value;TH86h='';dvSay(TH86.dev==null?'Minaccia: quella del gioco':'Minaccia forzata a '+TH86.dev)"><option value="">Quella del gioco</option>${dvOpt(THN86.map((n,i)=>[i,i+' · '+n]),TH86.dev==null?'':TH86.dev)}</select></div>
  <div class="dvr"><span>Giorni passati con l'eroe</span><span><button onclick="th86Fix().d+=1;th86Check();dvSay('+1 giorno di Minaccia')">+1 giorno</button><button onclick="th86Fix().d+=5;th86Check();dvSay('+5 giorni di Minaccia')">+5 giorni</button><button onclick="th86Fix().d=0;th86Fix().max=0;dvSay('Giorni azzerati')">Azzera</button></span></div>
  <h4>⚔ Le mosse nuove</h4><div class="dvr"><span>Accanto a te, già in allerta</span><span><button onclick="dv86Spawn('ruoli')">Un nemico per ruolo</button><button onclick="dv86Spawn('cavaliere',1)">Campione con i poteri</button><button onclick="dv86Spawn('morvath86')">Morvath</button></span></div>
  <p class="mu">Guerriero (bandito): guardia dal livello 1 · bestia (lupo): schivata dal 2 e carica dal 3 · grosso (golem): colpo pesante dal 3 · arciere: indietreggia dal 1 e ventaglio dal 5.</p>
  <h4>🌙 Notte e invasioni</h4><div class="dvr"><span>Notte pericolosa (zone aperte, Minaccia 2+)</span><span><button onclick="devHour(23);NT86.next=0;dvSay('Notte: arriva una creatura dal buio')">Subito notte</button></span></div>
  <div class="dvr"><span>Invasione${iv86Act()?': '+esc(Z[iv86Act().z].n)+' · ondata '+iv86Act().w+'/3':''} · respinte ${iv.won} · perse ${iv.lost}</span><span>${IVZ86.map(z=>`<button onclick="iv86Fix().a=null;iv86Start('${z}');devRender()">${esc(Z[z].n.split('·')[0].trim())}</button>`).join('')}${iv86Act()?`<button onclick="devGo(iv86Act().z)">Vai</button><button onclick="for(const e of ents.filter(e=>e.iv86))kill(e);dvSay('Ondata vinta')">Vinci l'ondata</button><button onclick="iv86Lose();devRender()">Perdi</button>`:''}</span></div>
  <h4>✦ Atto II · la costellazione perduta <span class="mu">${a2On()?'':'si apre con il vero finale (P.te 2)'}</span></h4>
  <div class="dvr"><span>Passo</span><select onchange="P.te=Math.max(2,P.te|0);P.st=Math.max(5,P.st|0);a2Fix().s=+this.value;if(+this.value>=4){P.unl=P.unl||{};P.unl.rocca86=1}npcMarks();hud();save();dvSay('Atto II: '+a2Obj())">${dvOpt(A2S.map((n,i)=>[i,i+' · '+n]),A.s)}</select></div>
  <div class="dvr"><span>Stelle: ${A2STAR.map((n,i)=>(A.l[i]?'✦':'·')+' '+n).join(' · ')}</span><span><button onclick="P.te=Math.max(2,P.te|0);a2Fix().l=[1,1,1];P.unl=P.unl||{};P.unl.rocca86=1;if(a2Fix().s<4)a2Fix().s=4;save();dvSay('Tre stelle accese')">Accendi tutte</button><button onclick="a2Fix().l=[0,0,0];if(P.unl)delete P.unl.rocca86;save();dvSay('Stelle spente')">Spegni</button></span></div>
  <div class="dvr"><span>Vai</span><span><button onclick="P.te=Math.max(2,P.te|0);devGo('valle86')">Valle del Crepuscolo</button>${['pozzo86','forgia86','giardino86','rocca86'].map(id=>`<button onclick="P.te=Math.max(2,P.te|0);devGo('${id}@${DG[id].fls}')">${esc(DG[id].n.replace(/^(Il |La |Lo )/,''))}</button>`).join('')}</span></div>
  <div class="dvr"><span>Filmati</span><span>${[['a2_inizio','L\'inizio'],['a2_valle','La Valle'],['a2_fine','L\'alba']].map(([k,n])=>`<button onclick="devClose();filmPlay('${k}',()=>{})">${n}</button>`).join('')}</span></div>`;
  return h}
{const b0=devBody;devBody=function(){if(DEV.tab==='th86')return dv86Body();return b0()}}
{const r0=devRender;devRender=function(){r0();const el=$('devp'),bar=el&&el.querySelector('.dvt');if(!bar||bar.querySelector('[data-dv86]'))return;const b=document.createElement('button');b.dataset.dv86='th86';b.textContent='☠ Minaccia e Atto II';b.className=DEV.tab==='th86'?'on':'';b.onclick=()=>{DEV.tab='th86';devRender()};bar.appendChild(b)}}
// i boss nuovi anche nella scheda «👑 Boss» del pannello (le prove dei combattimenti)
if(typeof BTL!=='undefined'){const S=BTL.find(c=>c[0]==='Modalità Storia');if(S)S[1].push({k:'vespero86',z:'pozzo86@3',lv:24,ic:'✦'},{k:'colosso86',z:'forgia86@3',lv:26,ic:'🔨'},{k:'selene86',z:'giardino86@3',lv:28,ic:'🌙'},{k:'morvath86',z:'rocca86@3',lv:30,ic:'🏰'})}
