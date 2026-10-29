/* ================= 7.30: LA CASERMA E L'ESERCITO =================
   Nel borgo si costruisce la CASERMA (con monete, legna, pietra e ferro). Lì si addestrano i soldati: ognuno costa
   monete, ferro e cibo, mangia ogni giorno e prende una paga. Potenziando la caserma ci stanno più soldati e ognuno
   diventa più forte. La potenza dell'esercito (soldati × forza, più torri e palizzata) difende il borgo e le tue terre:
   - se una fazione attacca e tu non arrivi in tempo, combatte l'esercito: con un esercito più debole del nemico la
     probabilità di vincere è bassa, con uno più forte è alta; i soldati caduti non tornano;
   - se sei lì, i tuoi soldati scendono in campo con te e combattono contro le ondate;
   - quando assedi le terre di un altro eroe le sue guardie sono più forti quanto più è potente il suo esercito, e i tuoi
     soldati vengono con te; chi viene saccheggiato perde anche una parte dei soldati.
   Se il borgo resta senza cibo, anche i soldati disertano. */
Object.assign(TWSB,{caserma:{n:'Caserma',ic:'🛡',d:'Addestra i soldati: più livelli, più soldati e più forti',max:5,cost:l=>[250*l,0]}});
SETCO.caserma=l=>({g:250*l,legna:12*l,pietra:12*l,ferro:6*l});SETBA.push('caserma');SEDND.add('caserma');SEDK.caserma='casa';SEDKN.caserma='🛡 Caserma';SETBC.caserma=['#8a8478','#5a2a2a'];
const _setBProps730=setBProps;setBProps=function(C,b){if(b.k!=='caserma'){_setBProps730(C,b);return}const T=TB[TB.length-1];if(T){if(!b.wall){T.wall='#8a8478';T.roof='#5a2a2a'}T.ht=b.ht||34}
  let n=0;const pr=['w','ŧ','§','w'];for(const[x,y]of[[b.x-1,b.y+b.h-1],[b.x+b.w,b.y+b.h-1],[b.x-1,b.y],[b.x+b.w,b.y]]){if(n>=pr.length||!C.ok(x,y)||M[y][x]!==0)continue;const d=DEC[y][x]||'';if(d===DN+'4'||d===DN+'1')continue;M[y][x]=6;DEC[y][x]=pr[n++];C.res(x,y)}};
const armyFix=S=>{S=S||P.tw.set;if(S&&!S.army)S.army={n:0,xp:0};return S&&S.army};
const armyCap=()=>setB('caserma')*6;
const armyStr=()=>8+setB('caserma')*5;                       // la forza di ogni soldato
const ARMYC={g:60,ferro:1};                                   // addestrare un soldato (più 2 di cibo dalle scorte del borgo)
function setPower(S){S=S||(P&&P.tw&&P.tw.set);if(!S)return 0;const A=armyFix(S);return Math.round((A?A.n:0)*armyStr()+setB('torre')*12+setB('mura')*6)};
function setPowerSub(S){const A=armyFix(S);return A&&A.n?A.n+' soldati · forza '+armyStr()+' l\'uno':setB('caserma')?'nessun soldato: addestrali in caserma':'costruisci la Caserma'};
// i soldati mangiano e prendono la paga; senza cibo disertano
function setStatsX(S,st){const A=armyFix(S);if(!A||!A.n)return;st.fc+=Math.ceil(A.n*.5);st.tax=Math.max(0,st.tax-A.n*2)};
function setDayX(S,st){const A=armyFix(S);if(!A||!A.n)return;if(S.fame>=2){const k=Math.max(1,Math.round(A.n*.2));A.n=Math.max(0,A.n-k);setLog(S,k+' soldati hanno disertato: manca '+(S.cibo<=0?'cibo':'acqua'))}if(A.n>armyCap()){const k=A.n-armyCap();A.n=armyCap();setLog(S,k+' soldati senza posto in caserma se ne sono andati')}};
function setGuards(){const A=armyFix();return Math.min(8,setB('torre')*2+Math.ceil(((A&&A.n)|0)/3))};
function armyTrain(n){const S=P.tw.set;if(!S)return;setFix(S);const A=armyFix(S),cap=armyCap();if(!cap){msg('Prima costruisci la Caserma');return}n=Math.min(n,cap-A.n);if(n<=0){msg('La caserma è piena: potenziala per più soldati');return}
  const c={g:ARMYC.g*n,ferro:ARMYC.ferro*n};if(S.cibo<2*n){msg('Servono '+2*n+' di cibo nelle scorte del borgo');tone(150,.1);return}const m=setMiss(c);
  if(m.length){msg('Mancano '+m.map(([r,k])=>k+' '+(r==='g'?'monete':RESN[r].toLowerCase())).join(', '));tone(150,.1);return}setPay(c);S.cibo-=2*n;A.n+=n;
  setLog(S,n+(n>1?' soldati addestrati':' soldato addestrato')+' in caserma');jingle([60,67,72],.08,'square');banner('🛡 Esercito di '+S.n,A.n+' soldati · potenza '+setPower(S),'spade');save();pn('regno')}
function armyFire(n){const A=armyFix();if(!A||!A.n)return;A.n=Math.max(0,A.n-n);save();pn('regno')}
// la probabilità di vincere: con un esercito più debole è bassa, con uno più forte è alta
const armyOdds=(a,e)=>a<=0?0:a*a/(a*a+e*e);
function armyFoe(A){return Math.round((A.n||3)*(30+P.lv*6))}
// quando l'assalto arriva e tu non ci sei, combatte l'esercito
const _asLose730=asLose;asLose=function(A){const T=P.tw,S=T.set;if(!S){_asLose730(A);return}setFix(S);const Ar=armyFix(S),home=S.k===A.k,pw=Math.round(setPower(S)*(home?1:.6)),ep=armyFoe(A),F=twFac(A.f),z=twZ(A.k);
  if(Ar&&Ar.n>0&&!A.fought){const p=armyOdds(pw,ep),win=Math.random()<p,lost=Math.min(Ar.n,Math.max(win?0:1,Math.round(Ar.n*(win?.15+.3*(1-p):.45+.3*(1-p)))));Ar.n-=lost;
    const tx=(win?'L\'esercito ha respinto ':'L\'esercito non ha retto contro ')+F.n+' a '+z.n+' (potenza '+pw+' contro '+ep+', '+Math.round(p*100)+'% di vincere)'+(lost?' · '+lost+' soldati caduti':'');setLog(S,tx);twWlog(tx);
    if(win){T.as=null;OW.asl=null;P.ow.rep[A.f]=(P.ow.rep[A.f]|0)+3;banner('🛡 '+z.n+' resiste!',lost?lost+' soldati caduti':'Nessun soldato perduto','scudo');tone(520,.12,'triangle');twSync();save();return}
    banner('⚔ L\'esercito è stato sconfitto',F.n+' era troppo forte ('+Math.round(p*100)+'%)','spade')}
  _asLose730(A)};
// sul campo: i tuoi soldati combattono con te
const ARMY={al:[],k:null};
function armyField(mode){const S=P.tw.set,A=armyFix(S);armyClear();if(!A||!A.n)return;const n=Math.min(A.n,6+setB('caserma')*2),lv=Math.max(P.lv,ZZ&&ZZ.lv||1),str=armyStr();
  for(let i=0;i<n;i++){const a=i/n*6.283,[x,y]=nearFree(clamp(Math.round(P.px+Math.cos(a)*2),2,N-3),clamp(Math.round(P.py+Math.sin(a)*2),2,N-3));const e=mkNpc('tw_sold',x,y,{n:'Soldato di '+S.n});
    e.m=armySoldierM(i%3);e.ally=1;e.army=1;e.hp=e.mx=Math.round((120+str*12)*(1+lv*.06));e.at=(4+str*.8)*(1+lv*.06);e.cd=1.1;e.cdt=Math.random();e.sp=2.4;e.path=[];ents.push(e);ARMY.al.push(e)}
  ARMY.k=Zk;ARMY.mode=mode;ARMY.n0=n;msg('🛡 '+n+' soldati di '+S.n+' scendono in campo con te')}
// 7.49: i soldati hanno il modello nuovo, con l'elmo, la cotta e la lancia
const ASM={};function armySoldierM(i){return ASM[i]||(ASM[i]=mHum({s:1,tp:['#5a6a8a','#4a5a7a','#6a7a9a'][i],lg:'#3a3a44',x:[...HT.helmet('#9aa4b8','#c0392b'),['bd',-.22,-.12,14,.44,.26,2,'#c8c8d0'],...WP.spear()]}))}
function armyClear(){for(const a of ARMY.al){const i=ents.indexOf(a);if(i>=0)ents.splice(i,1)}ARMY.al=[];ARMY.k=null}
function armyEnd(win){const S=P.tw.set,A=armyFix(S);if(!A||!ARMY.n0){armyClear();return}const alive=ARMY.al.filter(a=>a.hp>0).length,lost=Math.min(A.n,ARMY.n0-alive);A.n-=lost;
  if(lost){setLog(S,lost+(lost>1?' soldati caduti':' soldato caduto')+' in battaglia');msg('🛡 '+lost+' soldati sono caduti in battaglia')}armyClear();ARMY.n0=0;save()}
function armyTick(dt){if(!ARMY.al.length)return;if(Zk!==ARMY.k){armyEnd(0);return}const foe=e=>e.k==='en'&&(e.asl||/^(Guardia|Capitano)/.test(e.n||''));
  const foes=ents.filter(foe),al=ARMY.al=ARMY.al.filter(a=>ents.includes(a)&&a.hp>0);
  for(const a of al){a.cdt-=dt;let tg=null,bd=22;for(const f of foes){const d=dist(a,f);if(d<bd){bd=d;tg=f}}
    if(!tg){const d=dist(a,P);if(d>3){mv(a,(P.px-a.px)/d*a.sp*dt,(P.py-a.py)/d*a.sp*dt);a.path=[{x:a.px|0,y:a.py|0}]}else a.path=[];continue}
    if(bd>1.25){const dx=(tg.px-a.px)/bd,dy=(tg.py-a.py)/bd;mv(a,dx*a.sp*dt,dy*a.sp*dt);a.path=[{x:a.px|0,y:a.py|0}];a.fd=[dx,dy]}
    else{a.path=[];if(a.cdt<=0){a.cdt=a.cd;a.atkT=t;a.atkD=[(tg.px-a.px)/(bd||1),(tg.py-a.py)/(bd||1)];const d=Math.round(a.at*(.8+Math.random()*.4));if(tg.hp-d<=0)kill(tg);else{tg.hp-=d;tg.fl=.12;flt(tg,d,'#9ad0ff')}}}}
  for(const f of foes){if(!ents.includes(f))continue;const dp=dist(f,P);if(dp<3)continue;let tg=null,bd=3;for(const a of al){const d=dist(a,f);if(d<bd){bd=d;tg=a}}if(!tg)continue;f.acd=(f.acd||0)-dt;
    if(bd<=1.3&&f.acd<=0){f.acd=f.cd||1.2;f.atkT=t;f.atkD=[(tg.px-f.px)/(bd||1),(tg.py-f.py)/(bd||1)];const d=Math.round((f.at||6)*(.7+Math.random()*.5));tg.hp-=d;tg.fl=.12;flt(tg,d,'#ff8a7a');
      if(tg.hp<=0){const i=ents.indexOf(tg);if(i>=0)ents.splice(i,1);if(cineOK()&&tg.m)ents.push({k:'dead',m:tg.m,px:tg.px,py:tg.py,t0:t})}}}}
const _asStart730=asStart;asStart=function(){const had=!!OW.asl;_asStart730();if(!had&&OW.asl&&P.tw.set)armyField('as')};
const _asWin730=asWin;asWin=function(A){_asWin730(A);if(ARMY.n0)armyEnd(1)};
const _asLose730b=asLose;asLose=function(A){if(ARMY.n0&&ARMY.mode==='as'&&ARMY.k===A.k)A.fought=1;_asLose730b(A);if(ARMY.n0)armyEnd(0)};
// l'assedio alle terre di un altro eroe: le sue guardie sono forti quanto il suo esercito; i tuoi soldati vengono con te
const _twConqStart730=twConqStart;twConqStart=function(){const r0=OW.raid;_twConqStart730();const o=ZZ&&twOwner(ZZ.rx,ZZ.ry);if(OW.raid&&OW.raid!==r0&&o&&o.X&&o.X.s){const ep=o.X.s.pow|0,mp=setPower();OW.raid.ep=ep;
    if(OW.gar)OW.gar.n=Math.min(9,OW.gar.n+Math.round(clamp(ep/(mp+60),0,3)));if(P.tw.set)armyField('raid');if(ep)msg('L\'esercito di '+o.pl+': potenza '+ep+' · il tuo: '+mp+' ('+Math.round(armyOdds(mp+P.lv*10,ep)*100)+'% sulla carta)')}};
const _twGarTick730=twGarTick;twGarTick=function(dt){const G=OW.gar,w0=G&&G.w;_twGarTick730(dt);const R=OW.raid;if(G&&R&&R.ep&&G.w!==w0){const k=1+R.ep/400;for(const e of ents)if(e.k==='en'&&/^(Guardia|Capitano)/.test(e.n||'')&&!e.rpw){e.rpw=1;e.hp=e.mx=Math.round(e.mx*k);e.at*=1+R.ep/900}}};
const _raidTick730=raidTick;raidTick=function(){const had=!!OW.raid;_raidTick730();if(had&&!OW.raid&&ARMY.n0)armyEnd(1)};
// la potenza dell'esercito viaggia con le terre, così gli altri eroi la conoscono
const _twSync730=twSync;twSync=function(){if(P&&P.tw&&P.tw.set){const k=P.tw.set.k;if(P.tw.terr&&P.tw.terr[k]){const S=P.tw.set,pw=setPower(S);if(S._pw!==pw){S._pw=pw;TWX.sent=null}}}
  if(P&&P.tw&&P.tw.set&&NET.ok&&typeof VXP!=='undefined'){const vs=VXP.send;VXP.send=function(pl,ev,d){if(pl==='territori'&&ev==='sync'&&d&&d.mine&&d.mine[P.tw.set.k]&&d.mine[P.tw.set.k].s)d.mine[P.tw.set.k].s.pow=setPower();return vs.call(VXP,pl,ev,d)};try{_twSync730()}finally{VXP.send=vs}}else _twSync730()};
VXP.on('territori','fatti',L=>{if(!Array.isArray(L)||!P||!P.tw||!P.tw.set)return;for(const x of L)if(x.tipo==='sacco'){const A=armyFix(),k=Math.round((A.n||0)*.2);if(k){A.n-=k;setLog(P.tw.set,k+' soldati caduti difendendo il borgo da '+x.da)}}save()});
const _upd730=upd;upd=function(dt){_upd730(dt);if(twOn())armyTick(dt)};
const _loadPost730=loadPost;loadPost=function(k){if(ARMY.al.length&&ARMY.k!==k)armyEnd(0);_loadPost730(k)};
// il pannello: la caserma
const _setHTML730=setHTML2;setHTML2=function(){let h=_setHTML730();const S=P.tw.set,A=armyFix(S),cap=armyCap();if(!cap)return h;const pw=setPower(S),ex=(n)=>`${ARMYC.g*n}💰 ${ARMYC.ferro*n}⛓ ${2*n}🍞`;
  const card=`<h4>🛡 Caserma ed esercito</h4><div class="rgcard"><div><b>${A.n} di ${cap} soldati</b> <small>caserma livello ${setB('caserma')}</small><p class="mu">Potenza dell'esercito: <b>${pw}</b> · forza di ogni soldato ${armyStr()} · ogni giorno mangiano ${Math.ceil(A.n*.5)}🍞 e prendono ${A.n*2}💰.
    Contro un assalto di ${P.lv>=10?'una fazione':'banditi'} della tua forza servono circa ${armyFoe({n:4})} di potenza per avere buone probabilità.</p></div>
    <span><button class="pri" ${A.n<cap?'':'disabled'} onclick="armyTrain(1)">Addestra 1 · ${ex(1)}</button><button ${cap-A.n>=5?'':'disabled'} onclick="armyTrain(5)">Addestra 5</button>${A.n?`<button onclick="armyFire(1)">Congeda 1</button>`:''}</span></div>`;
  return h.replace('<h4>Costruire</h4>',card+'<h4>Costruire</h4>')};
// nella guerra: le probabilità del prossimo assalto
const _twWarHTML730=twWarHTML;twWarHTML=function(){let h=_twWarHTML730();const A=P.tw.as;if(A&&P.tw.set){const home=P.tw.set.k===A.k,pw=Math.round(setPower()*(home?1:.6)),ep=armyFoe(A);
    const na=armyFix().n|0;h=`<div class="rgcard"><div><b>🛡 Se non arrivi in tempo</b><p class="mu">${na?`Combatte il tuo esercito: potenza ${pw}${home?'':' (lontano dal borgo: 60%)'} contro ${ep}. Probabilità di vittoria: <b>${Math.round(armyOdds(pw,ep)*100)}%</b>.`:`Non hai soldati: ${home?'il borgo verrà saccheggiato':'perderai questa terra'}. ${setB('caserma')?'Addestrali nella Caserma.':'Costruisci la Caserma per avere un esercito.'}`}</p></div></div>`+h}return h};
