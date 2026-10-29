/* ================= 7.48: le scelte che cambiano la storia =================
   - Quando il boss di un dungeon sta per cadere, si arrende: lo RISPARMI o lo FINISCI. Il bottino è lo stesso, ma la storia no.
     Chi risparmi diventa un alleato: lo ritrovi ad Aldoria, nella Casa degli alleati, e ogni giorno ti fa un dono.
   - Ogni giorno in piazza c'è un Viandante con un dilemma (un ladruncolo affamato, una vedova, un goblin ferito…): due
     risposte, una più generosa e una più dura, ognuna con il suo piccolo premio.
   - Le scelte fanno la tua via: 🕊 della misericordia (prezzi -10%, doni degli alleati più ricchi), ⚔ della spada (vita
     massima +6%, ma prezzi +10%) o ⚖ dell'equilibrio. Il vero finale ha un epilogo diverso per ogni via, e un titolo.
   - La Cronaca (nel Diario, K) racconta le tue scelte e tiene i titoli: quello scelto si vede sopra il tuo eroe, anche in rete.
   In rete, quando il mondo è condiviso con altri giocatori, i boss cadono come sempre (la scelta è solo per chi gioca da solo). */
XSV.add('st48');XSV.add('tit48');
const ST48={cur:null,path:null};
function stFix(){P.st48=P.st48||{};const s=P.st48;s.b=s.b||{};s.d=s.d||{};s.g=s.g||{};return s}
function karma(){const s=stFix();let a=0,d=0;for(const k in s.b)a+=s.b[k]|0;for(const k in s.d)d+=s.d[k]|0;return a+clamp(d,-5,5)}
const STP={pace:{n:'Via della misericordia',i:'🕊',d:'I mercanti ti stimano: prezzi -10%. Gli alleati ti fanno doni più ricchi.',t:'il Misericordioso',c:'#2a7ab8'},
  spada:{n:'Via della spada',i:'⚔',d:'Temprato dalle battaglie: vita massima +6%. Ma i mercanti ti temono: prezzi +10%.',t:'la Spada di Aldoria',c:'#c0392b'},
  equi:{n:'Via dell\'equilibrio',i:'⚖',d:'Né troppo buono né troppo duro: il regno non sa ancora che cosa aspettarsi da te.',t:'il Custode dell\'Equilibrio',c:'#a8862a'}};
const stPath=()=>{if(!P||!P.st48)return'equi';const k=karma();return k>=3?'pace':k<=-3?'spada':'equi'};
function stCheck(){const p=stPath();if(ST48.path&&ST48.path!==p){const S=STP[p];banner(S.i+' '+S.n,S.d,'libro')}ST48.path=p;recalc();hud()}
// i titoli (anche quelli delle classifiche): uno alla volta, sopra l'eroe
function titFix(){P.tit48=P.tit48||{own:{},on:''};P.tit48.own=P.tit48.own||{};return P.tit48}
function titAdd(id,n){const T=titFix();if(T.own[id])return false;T.own[id]=String(n).slice(0,40);if(!T.on)T.on=id;setTimeout(()=>banner('Nuovo titolo: '+n,'Si sceglie nella Cronaca (Diario, K)','corona'),900);save();return true}
const titNow=()=>{const T=P&&P.tit48;return T&&T.on&&T.own&&T.own[T.on]||''};
function titSet(id){const T=titFix();T.on=T.on===id?'':id;save();pn('cro48')}
{const sp0=syncPack;syncPack=function(){const o=sp0()||{};const tt=titNow();if(tt)o.tt=tt;return o}}
// gli effetti della via: i prezzi e la vita massima
{const pm0=priceMul;priceMul=function(){const p=stPath();return pm0()*(p==='pace'?.9:p==='spada'?1.1:1)}}
{const rc0=recalc;recalc=function(){rc0();if(P&&P.st48&&stPath()==='spada'){P.mx=Math.round(P.mx*1.06);P.hp=Math.min(P.hp,P.mx)}}}
/* ---- il boss si arrende ---- */
const stSolo=()=>!(typeof NET!=='undefined'&&NET.ok&&typeof syncOn==='function'&&syncOn());
const stBoss=e=>!!(e&&e.k==='en'&&e.boss&&ZZ&&ZZ.dg&&DG[ZZ.dg]&&!DG[ZZ.dg].tw&&!DG[ZZ.dg].fin&&DG[ZZ.dg].boss===e.t&&!(typeof twOn==='function'&&twOn()));
const _kill748=kill;kill=function(e){if(stBoss(e)&&ents.includes(e)&&stSolo()&&(!e.cho48||e.cho48===1)){e.hp=Math.max(1,e.hp|0);e.cbs=t+1e6;e.ag=0;
    if(!e.cho48){e.cho48=1;ST48.cur=e;flt(e,'Si arrende!','#ffe08a');tone(300,.4,'sine',.05);if(cineOK())sparks(e.px,e.py,16,['#ffffff','#ffe08a'],80);setTimeout(()=>{if(ST48.cur===e&&ents.includes(e))pn('sp48')},500)}
    else if(PM!=='sp48')pn('sp48');return}
  _kill748(e)};
X43P.sp48=()=>{const e=ST48.cur;if(!e||!ents.includes(e))return`<p class="mu">Non c'è nessuno da giudicare.</p><button onclick="cl()">Chiudi</button>`;const s=stFix(),old=s.b[ZZ.dg];
  return`<h3>⚖ ${esc(e.n)} si arrende</h3><p class="x43t">«Basta… hai vinto. Fa' di me quello che vuoi.» La sua arma è a terra. Il bottino è lo stesso, ma quello che scegli resta nella storia${old?' (l\'ultima volta lo hai '+(old>0?'risparmiato':'finito')+')':''}.</p>
  <div class="x43c"><button onclick="stSpare()"><i>🕊</i><b>Risparmialo</b><small>Giurerà di non fare più del male e diventerà un tuo alleato ad Aldoria.</small></button><button onclick="stFinish()"><i>⚔</i><b>Finiscilo</b><small>Il regno sarà più sicuro, e la tua fama di guerriero crescerà.</small></button></div>
  <p class="x43t">Via di adesso: ${STP[stPath()].i} ${STP[stPath()].n} (${karma()>0?'+':''}${karma()})</p>`};
function stEnd(e,v){const s=stFix(),id=ZZ.dg,first=s.b[id]==null;s.b[id]=v;e.cho48=v>0?2:3;e.cbs=0;ST48.cur=null;cl();const n=e.n,m=e.m;kill(e);
  if(v>0){const i=ents.findIndex(x=>x.k==='dead'&&x.m===m);if(i>=0)ents.splice(i,1);if(cineOK())sparks(e.px,e.py,30,['#ffffff','#9adcff','#ffe08a'],140);vf({k:'ring',x:e.px,y:e.py,r0:.4,r:2.2,c:'200,230,255',d:.7,w:6});
    setTimeout(()=>banner('Hai risparmiato '+n,'Lo ritroverai nella Casa degli alleati, ad Aldoria','stella'),first?2600:400)}
  else setTimeout(()=>banner('Hai finito '+n,'Il regno è più sicuro, e la tua fama di guerriero cresce','spada'),first?2600:400);
  stCheck();save()}
const stSpare=()=>ST48.cur&&stEnd(ST48.cur,1),stFinish=()=>ST48.cur&&stEnd(ST48.cur,-1);
/* ---- i dilemmi del Viandante ---- */
const DIL48=[
  {q:'Un ragazzino affamato ha rubato una mela al mercato e la fruttivendola lo tiene per un orecchio.',a:['Paga tu la mela e lascialo andare','g',-20],b:['Consegnalo alle guardie','g',30]},
  {q:'Una vedova ti chiede aiuto per riparare il tetto prima della pioggia.',a:['Aiutala senza chiedere niente','p',1],b:['Aiutala, ma fatti pagare','g',60]},
  {q:'Fuori dalle mura un goblin ferito chiede pietà: dice che il suo clan lo ha cacciato.',a:['Curalo e lascialo andare','p',-1],b:['Finiscilo','x',60]},
  {q:'Un mercante ti offre a metà prezzo una spada che, sei quasi sicuro, è stata rubata.',a:['Rifiuta e avvisa il proprietario','g',50],b:['Comprala per 120 monete','i',-120]},
  {q:'Un bambino ha perso il suo cane vicino al porto e piange sulla banchina.',a:['Cercalo insieme a lui','x',50],b:['Non hai tempo: tira dritto','',0]},
  {q:'Due contadini litigano per l\'acqua del pozzo e tutti e due ti chiedono di decidere.',a:['Dividi l\'acqua in parti uguali','x',30],b:['Dai ragione a chi ti paga','g',80]},
  {q:'Un vecchio soldato ubriaco ha rotto una finestra della taverna e non ha i soldi per ripagarla.',a:['Paga tu la finestra','g',-40],b:['Lascia che lo arrestino','g',20]}];
const dilToday=()=>DIL48[hs('dil48|'+dayKey())%DIL48.length];
function dilPick(side){const s=stFix(),k=dayKey();if(s.d[k]!=null)return;const D=dilToday(),o=side>0?D.a:D.b,[,ty,v]=o;
  if(ty==='g'&&v<0&&P.g<-v){msg('Non hai abbastanza oro');tone(150,.1);return}if(ty==='i'&&P.g<-v){msg('Servono '+(-v)+' monete');tone(150,.1);return}if(ty==='i'&&P.inv.length>=INV){msg('Lo zaino è pieno');return}
  if(ty==='p'&&v<0&&P.pot<1){msg('Non hai pozioni da dargli');tone(150,.1);return}
  s.d[k]=side;for(const q of Object.keys(s.d).sort().slice(0,-30))delete s.d[q];
  if(ty==='g'){P.g+=v;if(v>0)goldFly(v)}else if(ty==='p')P.pot+=v;else if(ty==='x')gainXP(v*Math.max(1,P.lv/4)|0);else if(ty==='i'){P.g+=v;const it=item(Math.max(1,P.lv),1,'w');P.inv.push(it);msg('Hai comprato '+iname(it))}
  tone(side>0?660:330,.1,'triangle',.05);msg(side>0?'Il Viandante sorride: «Il regno ha bisogno di gente come te.»':'Il Viandante annuisce piano: «Anche questa è una scelta.»');stCheck();save();pn('dil48')}
X43P.dil48=()=>{const s=stFix(),D=dilToday(),done=s.d[dayKey()];return`<h3>🧭 Il Viandante</h3><p class="x43t">«Ogni giorno il regno ti mette davanti a una scelta. Oggi è questa.»</p><p><i>${esc(D.q)}</i></p>
  ${done!=null?`<p class="x43t">Hai già scelto: <b>${esc((done>0?D.a:D.b)[0])}</b>. Torna domani per un'altra storia.</p>`:`<div class="x43c"><button onclick="dilPick(1)"><i>🕊</i><b>${esc(D.a[0])}</b></button><button onclick="dilPick(-1)"><i>⚔</i><b>${esc(D.b[0])}</b></button></div>`}
  <p class="x43t">${STP[stPath()].i} ${STP[stPath()].n} · <button onclick="pn('cro48')">📜 Cronaca</button></p><button onclick="cl()">Chiudi</button>`};
/* ---- la Casa degli alleati ---- */
const stAllies=()=>{const s=stFix();return Object.keys(s.b).filter(id=>s.b[id]>0&&DG[id]&&E[DG[id].boss])};
function alGift(id){const s=stFix(),k=dayKey();s.g={[k]:s.g[k]||{}};if(s.g[k][id])return;s.g[k][id]=1;const g2=Math.round((80+P.lv*15)*(stPath()==='pace'?1.5:1));P.g+=g2;P.pot++;goldFly(g2);
  msg(E[DG[id].boss].n+' ti regala '+g2+' monete e una pozione');tone(700,.08,'triangle');hud();save();pn('al48')}
X43P.al48=()=>{const L=stAllies(),s=stFix(),G=s.g[dayKey()]||{};return`<h3>🕊 Casa degli alleati</h3><p class="x43t">Qui vivono i nemici che hai risparmiato. Ogni giorno ognuno ti fa un dono${stPath()==='pace'?' (più ricco, per la tua via)':''}.</p>
  ${L.length?L.map(id=>{const b=E[DG[id].boss];return`<div class="x43r"><span><b>${esc(b.n)}</b> <small class="mu">da ${esc(DG[id].n)}</small></span>${G[id]?'<i class="mu">ci vediamo domani</i>':`<button onclick="alGift('${id}')">🎁 Ritira il dono</button>`}</div>`}).join(''):'<p class="mu">La casa è vuota: quando un boss si arrende, risparmialo.</p>'}<button onclick="cl()">Chiudi</button>`};
function stPlace(){if(!ZZ||!started||Zk!=='town'||(typeof OW!=='undefined'&&OW.on))return;if(!ents.some(e=>e.k==='dil48')){const q=spot47([34,36],2);if(q)ents.push({k:'dil48',px:q[0]+.5,py:q[1]+.5,n:'Il Viandante',m:hum('#6a5a3a',SKIN,1,[5,'#4a3a2a'])})}
  if(!ents.some(e=>e.k==='al48')){const q=spot47([26,44],2.2);if(q)ents.push({k:'al48',px:q[0]+.5,py:q[1]+.5,n:'Casa degli alleati'})}}
const _loadPost748q=loadPost;loadPost=function(k){_loadPost748q(k);try{stPlace()}catch(e){console.warn('scelte',e)}if(P&&P.st48)ST48.path=stPath()};
ITK.add('dil48');ITK.add('al48');
const _act748q=act;act=function(e){if(e&&e.k==='dil48'){pn('dil48');return}if(e&&e.k==='al48'){pn('al48');return}_act748q(e)};
const _ent748q=ent;ent=function(e){if(e.k==='dil48'){const L=typeof idleA==='function'?idleA(e.m,e):e.m;drawL(L,e.px,e.py,0);if(stFix().d[dayKey()]==null){g.font='bold 18px Georgia,serif';g.textAlign='center';label('!',PX(e.px,e.py),PY(e.px,e.py,0)-44-Math.abs(Math.sin(t*4))*3,'#ffd84a')}return}
  if(e.k==='al48'){const L=stAllies();drawL([[-.5,-.4,0,1,.8,14,'#e8e0d0'],[-.55,-.45,14,1.1,.9,3,'#5a8ac8'],[-.4,-.45,17,.8,.9,3,'#5a8ac8'],[-.12,-.41,0,.24,.02,9,'#6a4a2a'],[.5,-.05,0,.04,.04,26,'#6a4a2a'],[.54,-.05,18,.3,.02,8,'#ffffff']],e.px,e.py,0);
    L.slice(0,4).forEach((id,i)=>box(e.px-.4+i*.25,e.py+.45,0,.14,.14,5,'#ffe08a',1.2));return}
  _ent748q(e);
  // il titolo sopra l'eroe (e sopra gli altri giocatori)
  let tt='';if(e===P)tt=titNow();else if(e.k==='pl'&&typeof NET!=='undefined'&&NET.peers){const q=NET.peers[e.id];tt=q&&q.tt?String(q.tt).slice(0,40):''}
  if(tt&&(e!==P||!(typeof FT!=='undefined'&&FT.on&&!FT.fr))){g.font='italic bold 10px Georgia,serif';g.textAlign='center';const sx=PX(e.px,e.py),sy=PY(e.px,e.py,0)-(e.az||0)*1.2;label('« '+tt+' »',sx,sy-36-((e===P?NET.ok&&SET.names:SET.names)?20:8),'#ffd27a')}};
/* ---- l'epilogo del vero finale ---- */
const EPI48={pace:'Anni dopo, nelle taverne di Aldoria si racconta di un eroe che vinse ogni battaglia e non uccise mai chi si arrendeva. I nemici di un tempo vivono in città, e i bambini non hanno più paura dei goblin. Il regno ti chiama «il Misericordioso».',
  spada:'Anni dopo, i nomi dei mostri che hai abbattuto sono incisi sulle mura della città, e nessun nemico osa più avvicinarsi ai confini. Il regno è sicuro, e un po\' ti teme. Ti chiamano «la Spada di Aldoria».',
  equi:'Anni dopo, nessuno sa dire se tu fossi più buono o più duro: sapevi quando tendere la mano e quando sguainare la spada. Il regno ti chiama «il Custode dell\'Equilibrio».'};
{const p0=pn;pn=function(m,arg){if(m==='txt'&&started&&PA&&PA.ti==='Il vero finale'&&!PA.ep48&&P){PA.ep48=1;const p=stPath(),al=stAllies().length;
    PA.tx+='\n\n— Epilogo: '+STP[p].i+' '+STP[p].n+' —\n'+EPI48[p]+(al?'\n\n'+al+(al>1?' tuoi vecchi nemici sono venuti':' tuo vecchio nemico è venuto')+' a vedere l\'incoronazione.':'');titAdd('via_'+p,STP[p].t)}p0(m,arg)}}
/* ---- la Cronaca ---- */
X43P.cro48=()=>{const s=stFix(),p=stPath(),S=STP[p],k=karma(),T=titFix();const L=Object.keys(DG).filter(id=>!DG[id].tw&&!DG[id].fin&&E[DG[id].boss]);
  let h=`<h3>📜 Cronaca delle tue scelte</h3><div class="cro48m"><span>⚔</span><i><b style="left:${50+clamp(k,-10,10)*5}%"></b></i><span>🕊</span></div><p style="text-align:center"><b style="color:${S.c}">${S.i} ${S.n}</b> (${k>0?'+':''}${k})<br><small>${esc(S.d)}</small></p>`;
  h+=`<h4>I boss</h4>`+L.map(id=>{const v=s.b[id];return`<div class="x43r"><span>${esc(E[DG[id].boss].n)} <small class="mu">${esc(DG[id].n)}</small></span><span>${v>0?'🕊 risparmiato':v<0?'⚔ finito':'<i class="mu">non ancora</i>'}</span></div>`}).join('');
  const nd=Object.keys(s.d).length,np=Object.values(s.d).filter(v=>v>0).length;h+=`<p class="x43t">Dilemmi del Viandante: ${nd} (${np} generosi, ${nd-np} duri) · alleati: ${stAllies().length}</p>`;
  if(typeof olStatus==='function')h+=`<h4>Capitolo: il regno oltre il mare</h4><p class="x43t">${olStatus()}</p>`;
  const ids=Object.keys(T.own);h+=`<h4>Titoli</h4>`+(ids.length?`<div class="srow">${ids.map(id=>`<button class="${T.on===id?'on':''}" onclick="titSet('${id}')">${esc(T.own[id])}</button>`).join('')}</div><p class="x43t">Il titolo scelto si vede sopra il tuo eroe (anche dagli altri giocatori). Toccalo di nuovo per toglierlo.</p>`:'<p class="mu">Nessun titolo, per ora: si vincono con il vero finale, con il regno oltre il mare e con le classifiche della settimana.</p>');
  return h+`<button onclick="cl()">Chiudi</button>`};
{const p0=pn;pn=function(m,arg){p0(m,arg);if(m==='dia'&&PM==='dia'){const pe=$('pn');if(pe&&!pe.querySelector('.cro48b'))pe.insertAdjacentHTML('afterbegin',`<button class="cro48b" onclick="pn('cro48')">📜 Cronaca: scelte, alleati e titoli</button>`)}}}
const _begin748=begin;begin=function(d,s){_begin748(d,s);if(P&&P.st48){ST48.path=stPath();recalc()}};
(function(){const st=document.createElement('style');st.textContent=`.cro48b{width:100%;margin-bottom:6px}.cro48m{display:flex;align-items:center;gap:8px;margin:8px 0}.cro48m i{flex:1;height:10px;border-radius:5px;background:linear-gradient(90deg,#c84a3a,#e8d080,#5aa8e8);position:relative}.cro48m i b{position:absolute;top:-4px;width:6px;height:18px;margin-left:-3px;background:#fff;border:1px solid #000;border-radius:3px}.cro48m span{font-size:20px}`;document.head.appendChild(st)})();
