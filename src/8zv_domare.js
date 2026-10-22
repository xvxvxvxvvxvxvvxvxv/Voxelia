/* ================= 7.20: DOMARE I MOSTRI =================
   Indebolisci un mostro (sotto un terzo della vita) e lancia un Sigillo di doma (tasto Z o il pulsante «Doma» che compare
   vicino a lui). Il mostro resta preso nel cerchio di luce, si dibatte tre volte e, se il sigillo tiene, diventa tuo.
   Più è debole e più è facile; i mostri di livello più alto del tuo resistono di più. I boss non si domano.
   I compagni (tasto N): uno alla volta ti segue e combatte con te. Ha la sua mossa speciale secondo la sua natura
   (morso che fa sanguinare, colpo che stordisce, veleno che rallenta, dardo magico, cura), cresce di livello con le
   vittorie e si evolve al livello 10 e al 20: diventa più grande e cambia nome. Se cade, si riprende piano piano
   (subito al campo, al santuario o alla locanda). Nella stalla ne stanno 12. Il bestiario conta le specie domate.
   I Sigilli si comprano dai mercanti (anche nei villaggi di Tomorrow); un eroe nuovo di Tomorrow ne ha 3. */
const DOM={pet:null,cap:null,ui:null,uk:'',btn:null};
const DOMSEAL=60,domMax=()=>12+((P&&P.tw&&P.tw.set&&P.tw.set.b&&P.tw.set.b.stalla)|0)*4;
const domOn=()=>!!(started&&P&&MODE==='story');
const domFam=t=>{const m=E[t]&&E[t].m,k=m&&m.kind;if(E[t]&&E[t].rng||k==='ghost'||k==='elem'||k==='eye'||k==='jelly')return'mag';if(k==='q')return'bes';if(k==='a')return'art';if(k==='slime')return'mel';if(k==='bat'||k==='eel')return'vol';return'gue'};
const DOMF={bes:{n:'Belva',sp:'Morso feroce',d:'fa sanguinare'},gue:{n:'Guerriero',sp:'Colpo tremendo',d:'stordisce'},art:{n:'Artropode',sp:'Veleno',d:'rallenta e logora'},mag:{n:'Creatura magica',sp:'Dardo arcano',d:'colpisce da lontano'},mel:{n:'Melma',sp:'Cura',d:'ti cura'},vol:{n:'Volante',sp:'Picchiata',d:'colpo rapido e preciso'}};
const DOMEV=['','Grande ','Antico '];
function domFix(){P.pets=Array.isArray(P.pets)?P.pets.filter(p=>p&&E[p.t]||p&&String(p.t).startsWith('tw.')):[];P.seal=P.seal|0;P.bst=P.bst||{};if(P.pet!=null&&!P.pets[P.pet])P.pet=null;
  for(const p of P.pets)if(String(p.t).startsWith('tw.')&&typeof twType==='function')twType(p.t)}
const domStats=p=>{const b=E[p.t]||{hp:40,at:6,sp:2,cd:1.2},ev=p.lv>=20?2:p.lv>=10?1:0,k=1+p.lv*.12+ev*.25;return{mx:Math.round(Math.max(30,b.hp*.9)*k*(1+P.lv*.02)),at:+(Math.max(3,b.at*.85)*k*(1+P.lv*.02)).toFixed(1),sp:Math.max(2.4,Math.min(4.2,(b.sp||2)*1.15)),cd:Math.max(.7,(b.cd||1.2)),ev}};
const domName=p=>DOMEV[domStats(p).ev]+p.n;
/* ---- la cattura ---- */
function domCanTake(e){return e&&e.k==='en'&&!e.boss&&!e.np&&!e.owt&&!e.bt&&e.hp>0&&e.hp<=e.mx*.34&&ents.includes(e)}
function domNear(){let best=null,bd=4.2;for(const e of ents)if(domCanTake(e)){const d=dist(e,P);if(d<bd){bd=d;best=e}}return best}
function domTry(){if(!domOn()||PM||DOM.cap||P.hp<=0)return;if(!Array.isArray(P.pets))domFix();const e=domNear();
  if(!e){const w=ents.find(x=>x.k==='en'&&!x.boss&&dist(x,P)<5);msg(w?'Indebolisci prima il mostro: sotto un terzo della vita':'Non c\'è nessun mostro da domare qui vicino');tone(150,.1);return}
  if((P.seal|0)<=0){msg('Non hai Sigilli di doma: li vendono i mercanti');tone(150,.1);return}
  P.seal--;const lvE=Math.round((e.mx/((E[e.t]||{hp:e.mx}).hp||e.mx)-1)/.15),dl=Math.max(0,(ZZ&&ZZ.lv||0)-P.lv*.5),fr=e.hp/e.mx;
  const ch=clamp(.38+(.34-fr)*1.6-dl*.03+(e.b&&e.b.boss?-.5:0)+(P.bst&&P.bst[e.t]?.08:0),.12,.92);
  DOM.cap={e,t0:t,ch,ok:Math.random()<ch,sh:0};e.cbs=t+2.4;e.al=0;P.path=[];P.tg=null;
  vf({k:'thrust',x:P.px,y:P.py,dx:(e.px-P.px)/(dist(e,P)||1),dy:(e.py-P.py)/(dist(e,P)||1),r:dist(e,P),c:'255,230,140',d:.35,z:16,star:1});
  vf({k:'ring',x:e.px,y:e.py,r0:1.4,r:.5,c:'255,230,140',d:.5,w:6});flt(P,'Sigillo!','#ffe28a');tone(660,.12,'triangle',.05);hud()}
function domTick(dt){const C=DOM.cap;if(!C)return;const e=C.e,k=t-C.t0;
  if(!ents.includes(e)){DOM.cap=null;return}e.cbs=Math.max(e.cbs||0,t+.2);
  if(cineOK()&&Math.random()<dt*18)sparks(e.px+(Math.random()-.5)*.6,e.py+(Math.random()-.5)*.6,1,['#ffe28a','#ffffff'],50);
  const sh=Math.floor(k/.6);if(sh>C.sh&&sh<=3){C.sh=sh;vf({k:'ring',x:e.px,y:e.py,r0:.4,r:1.2,c:'255,230,140',d:.4,w:5});tone(400+sh*120,.08,'square',.04);if(!C.ok&&sh===2&&Math.random()<.5)C.brk=1}
  if(k>=2.1||C.brk&&k>=1.3){DOM.cap=null;
    if(C.ok&&!C.brk){const i=ents.indexOf(e);if(i>=0)ents.splice(i,1);vf({k:'flash',x:e.px,y:e.py,r:80,c:'255,240,180',d:.5,z:14});if(cineOK())sparks(e.px,e.py,30,['#ffe28a','#ffffff','#9adcff'],120);
      if(P.pets.length>=domMax()){msg('La stalla è piena: libera un compagno (tasto N) per domarne altri');P.seal++;return}
      const nm=String(e.n||(E[e.t]&&E[e.t].n)||'Compagno').replace(/^(Campione|Elite)\s+/,'').replace(/^[^A-Za-zÀ-ÿ]+/,'');const p={id:uid(),t:e.t,n:nm,lv:1,xp:0,hp:0,bd:gDay?gDay():0};p.lv=Math.max(1,Math.min(P.lv,(ZZ&&ZZ.lv||1)));p.hp=domStats(p).mx;
      P.pets.push(p);const nw=!P.bst[e.t];P.bst[e.t]=(P.bst[e.t]|0)+1;jingle([60,64,67,72,76,79],.09,'triangle');banner('Hai domato '+nm+'!',(nw?'Specie nuova nel bestiario · ':'')+'Tasto N per i tuoi compagni','stella');
      if(P.pet==null||!DOM.pet){P.pet=P.pets.length-1;domSummon()}save();hud()}
    else{e.al=1;e.cbs=0;flt(e,'Si è liberato!','#ff9a7a');tone(160,.2,'sawtooth',.05);vf({k:'x',x:e.px,y:e.py,c:'255,120,90',d:.4});e.hp=Math.min(e.mx,e.hp+Math.round(e.mx*.08))}}}
/* ---- il compagno in campo ---- */
function domSummon(){domDismiss(1);if(!Array.isArray(P.pets))domFix();const p=P.pets[P.pet];if(!p||p.ko||!domOn())return;const st=domStats(p);p.hp=Math.min(p.hp||st.mx,st.mx);
  let m=E[p.t]&&E[p.t].m;if(m&&st.ev){const s=1+.15*st.ev;if(m.rg)m=rgScale(m,s);else{const L=scl(m,s);for(const k of Object.keys(m))if(isNaN(+k))L[k]=m[k];L.top=(m.top||36)*s;m=L}}
  const[x,y]=nearFree(Math.floor(P.px)+1,Math.floor(P.py));const e={k:'pet',id:900000+(P.pet|0),t:p.t,n:domName(p),px:x+.5,py:y+.5,m,hp:p.hp,mx:st.mx,at:st.at,sp:st.sp,cd:st.cd,cdt:.5,r:domFam(p.t)==='mag'?4.2:1.15,p,b:E[p.t]||{},spT:t+4,al:0};
  ents.push(e);DOM.pet=e;if(cineOK())vf({k:'ring',x:e.px,y:e.py,r0:.2,r:1.4,c:'150,255,170',d:.5,w:6})}
function domDismiss(quiet){const e=DOM.pet;DOM.pet=null;if(!e)return;e.p.hp=Math.max(0,e.hp);const i=ents.indexOf(e);if(i>=0)ents.splice(i,1)}
function domPetTick(dt){if(!Array.isArray(P.pets))domFix();for(const p of P.pets)if(!DOM.pet||DOM.pet.p!==p){const st=domStats(p);if(p.ko){p.kt=(p.kt||0)+dt;if(p.kt>60){p.ko=0;p.kt=0;p.hp=Math.round(st.mx*.3)}}else p.hp=Math.min(st.mx,(p.hp||0)+st.mx*.01*dt)}
  const e=DOM.pet;if(!e)return;if(!ents.includes(e)){if(P.pet!=null&&!P.pets[P.pet]?.ko)domSummon();return}
  const p=e.p,fam=domFam(p.t);e.cdt-=dt;
  // un bersaglio: il nemico più vicino a te, o quello che stai colpendo
  let tg=P.tg&&P.tg.k==='en'&&ents.includes(P.tg)&&dist(P.tg,P)<9?P.tg:null;if(!tg){let bd=7;for(const o of ents)if(o.k==='en'&&(o.al||dist(o,P)<4.5)&&!(o.cbs>t&&DOM.cap&&DOM.cap.e===o)){const d=dist(o,e);if(d<bd&&dist(o,P)<9){bd=d;tg=o}}}
  const dP=dist(e,P);if(dP>14){const[x,y]=nearFree(Math.floor(P.px),Math.floor(P.py)+1);e.px=x+.5;e.py=y+.5;return}
  if(tg){const d=dist(e,tg),reach=e.r+(tg.boss?.6:.3);if(d>reach){const k=Math.min(1,e.sp*dt/d);mv(e,(tg.px-e.px)*k,(tg.py-e.py)*k);e.mvT=t;e.fd=[tg.px-e.px,tg.py-e.py]}
    else{e.fd=[tg.px-e.px,tg.py-e.py];if(e.cdt<=0){e.cdt=e.cd;e.atkT=t;e.atkD=e.fd;let dm=Math.round(e.at*(.85+Math.random()*.3));
        if(fam==='mag')vf({k:'thrust',x:e.px,y:e.py,dx:(tg.px-e.px)/(d||1),dy:(tg.py-e.py)/(d||1),r:d,c:'200,170,255',d:.25,z:14,star:1});
        if(t>=e.spT){e.spT=t+8;dm=Math.round(dm*1.8);const F=DOMF[fam];flt(e,F.sp+'!','#9aff9a');
          if(fam==='bes')tg.cbb={u:t+4,d:Math.max(1,Math.round(dm*.15)),n:0};else if(fam==='gue')tg.cbs=t+(tg.boss?.5:1.4);else if(fam==='art')tg.cbl=t+4;else if(fam==='mel'){const h=Math.round(P.mx*.12);P.hp=Math.min(P.mx,P.hp+h);flt(P,'+'+h,'#66ff88');if(cineOK())sparks(P.px,P.py,14,['#9aff9a','#ffffff'],70)}
          if(cineOK())vf({k:'ring',x:tg.px,y:tg.py,r0:.2,r:1.1,c:'150,255,170',d:.35,w:5})}
        hurtE(tg,dm,1);if(ents.includes(tg)){tg.al=1;tg.ptg=e}}}}
  else{const[fx,fy]=P.dr||[0,1],gx=P.px-fx*1.4+fy*.6,gy=P.py-fy*1.4-fx*.6,d=Math.hypot(gx-e.px,gy-e.py);if(d>.6){const k=Math.min(1,e.sp*dt*(dP>4?1.6:1)/d);mv(e,(gx-e.px)*k,(gy-e.py)*k);e.mvT=t;e.fd=[gx-e.px,gy-e.py]}}
  // i nemici che lo hanno preso di mira lo attaccano
  for(const o of ents){if(o.k!=='en'||o.ptg!==e)continue;const d=dist(o,e);if(d>6||(dist(o,P)<d-.5&&o.al)){o.ptg=null;continue}o.cdt=Math.max(o.cdt||0,.15);
    if(d>(o.r||1.2)+.2){if(!(o.cbs>t)){const k=Math.min(1,(o.sp||2)*dt/d);mv(o,(e.px-o.px)*k,(e.py-o.py)*k);o.mvT=t}}
    else{o.pcd=(o.pcd||0)-dt;if(o.pcd<=0&&!(o.cbs>t)){o.pcd=o.cd||1.2;o.atkT=t;o.atkD=[e.px-o.px,e.py-o.py];const dm=Math.max(1,Math.round((o.at||5)*.8));e.hp-=dm;e.fl=.12;flt(e,dm,'#ffb0a0')}}}
  if(e.hp<=0){p.hp=0;p.ko=1;p.kt=0;domDismiss(1);msg(domName(p)+' è stremato: si riprenderà fra poco (o al campo, al santuario, alla locanda)');tone(180,.3,'triangle',.05)}
  else p.hp=e.hp}
function domXP(p,tg){const need=l=>40+l*l*14;p.xp+=Math.max(2,Math.round((tg.xp||10)*.6));let up=0;while(p.xp>=need(p.lv)&&p.lv<40){p.xp-=need(p.lv);p.lv++;up=1;
    if(p.lv===10||p.lv===20){banner(p.n+' si è evoluto!','Ora è '+domName(p),'stella');jingle([60,67,72,79,84],.1,'triangle');if(DOM.pet&&DOM.pet.p===p){const i=P.pet;domSummon()}}}
  if(up){const st=domStats(p);if(DOM.pet&&DOM.pet.p===p){DOM.pet.mx=st.mx;DOM.pet.at=st.at;DOM.pet.hp=Math.min(st.mx,DOM.pet.hp+st.mx*.3);DOM.pet.n=domName(p)}flt(DOM.pet||P,p.n+' livello '+p.lv,'#9aff9a')}}
// anche i nemici che abbatti tu fanno crescere il compagno in campo
const _kill720=kill;kill=function(e){const ok=e&&e.k==='en'&&DOM.pet&&ents.includes(e)&&dist(e,DOM.pet)<9;_kill720(e);if(ok)domXP(DOM.pet.p,e)};
/* ---- la stalla: il pannello dei compagni ---- */
function domHTML(){domFix();const L=P.pets,act=P.pet,sp=Object.keys(P.bst).length;
  let h=`<h3>🐾 I tuoi compagni</h3><p class="mu">Sigilli di doma: <b>${P.seal|0}</b> · nella stalla ${L.length}/${domMax()} · bestiario: <b>${sp}</b> ${sp===1?'specie domata':'specie domate'}</p>`;
  if(!L.length)h+=`<p class="dmh">Indebolisci un mostro sotto un terzo della vita, poi premi <b>Z</b> (o il pulsante «Doma») per lanciare un Sigillo. Più è debole, più è facile. I boss non si domano.</p>`;
  h+='<div class="dml">'+L.map((p,i)=>{const st=domStats(p),F=DOMF[domFam(p.t)],need=40+p.lv*p.lv*14,on=i===act;
    return`<div class="dmc${on?' on':''}${p.ko?' ko':''}"><canvas class="dmpv" data-i="${i}" width="76" height="76"></canvas><div class="dmb"><b>${esc(domName(p))}</b><small>${esc(F.n)} · livello ${p.lv}${st.ev<2?' · si evolve al '+(st.ev?20:10):' · forma finale'}</small>
      <div class="dmbar"><i style="width:${Math.round(Math.max(0,p.hp)/st.mx*100)}%"></i></div><div class="dmbar xp"><i style="width:${Math.round(p.xp/need*100)}%"></i></div>
      <small>❤ ${Math.round(Math.max(0,p.hp))}/${st.mx} · ⚔ ${st.at} · ✦ ${esc(F.sp)}: ${esc(F.d)}${p.ko?' · <b style="color:#ff9a7a">stremato</b>':''}</small>
      <span class="dmbt">${on?`<button onclick="domSet(null)">Richiama</button>`:`<button ${p.ko?'disabled':''} onclick="domSet(${i})">Chiama</button>`}<button onclick="domRen(${i})">Rinomina</button><button onclick="domFree(${i})">Libera</button></span></div></div>`}).join('')+'</div><button onclick="cl()">Chiudi</button>';
  return h}
function domPaint(){const pe=$('pn');if(!pe)return;for(const c of pe.querySelectorAll('canvas.dmpv')){const p=P.pets[+c.dataset.i];if(!p)continue;const q=c.getContext('2d');q.clearRect(0,0,76,76);let m=E[p.t]&&E[p.t].m;if(!m)continue;
  let top=0;for(const b of m)top=Math.max(top,(b[2]||0)+(b[5]||0));const sc=Math.min(2.2,58/(top+6)),og=g;g=q;try{q.setTransform(sc,0,0,sc,38,68);if(m.rg||m.hm)drawHero(m,0,0,0,0,3);else drawL(m,0,0,0)}catch(_){}finally{g=og}}}
function domSet(i){P.pet=i;if(i==null){domDismiss();msg('Il compagno torna nella stalla')}else{domSummon();msg(domName(P.pets[i])+' è con te')}save();pn('pets')}
function domRen(i){const p=P.pets[i];if(!p)return;const n=prompt('Nuovo nome per '+p.n,p.n);if(!n)return;p.n=n.replace(/[<>]/g,'').trim().slice(0,22)||p.n;if(DOM.pet&&DOM.pet.p===p)DOM.pet.n=domName(p);save();pn('pets')}
function domFree(i){const p=P.pets[i];if(!p||!confirm('Liberare '+domName(p)+'? Torna nella natura e non lo rivedrai.'))return;if(DOM.pet&&DOM.pet.p===p)domDismiss();P.pets.splice(i,1);if(P.pet===i)P.pet=null;else if(P.pet>i)P.pet--;save();pn('pets')}
const _pn720=pn;pn=function(m,arg){if(m==='pets'&&domOn()){if(arg!==undefined)PA=arg;edPanel('pets',domHTML());domPaint();return}_pn720(m,arg);
  // i Sigilli dai mercanti
  if((m==='shop'||(m==='npc'&&PA&&NPCS[PA.nid]&&NPCS[PA.nid].role==='shop'&&false))&&domOn()&&PM==='shop'){const pe=$('pn');if(pe&&!pe.querySelector('.dmshop')){const h3=pe.querySelector('h3');if(h3)h3.insertAdjacentHTML('afterend',`<div class="dmshop"><span>🔮 <b>Sigillo di doma</b> <small>serve a domare un mostro indebolito · ne hai ${P.seal|0}</small></span><button onclick="domBuy(1)">1 · ${DOMSEAL}💰</button><button onclick="domBuy(5)">5 · ${DOMSEAL*5-30}💰</button></div>`)}}};
function domBuy(n){const pr=n===5?DOMSEAL*5-30:DOMSEAL*n;if(P.g<pr){msg('Non hai abbastanza oro');tone(150,.1);return}P.g-=pr;P.seal=(P.seal|0)+n;tone(800,.08,'triangle');hud();save();pn('shop')}
/* ---- riposo: il compagno si riprende ---- */
const domRest=()=>{for(const p of P.pets||[]){p.ko=0;p.kt=0;p.hp=domStats(p).mx}if(DOM.pet)DOM.pet.hp=DOM.pet.mx};
if(typeof twCampRest==='function'){const _r=twCampRest;twCampRest=function(d){domRest();_r(d)}}
if(typeof twShrine==='function'){const _s=twShrine;twShrine=function(e){const day=P.tw&&P.tw.sh&&P.tw.sh[e.key];_s(e);if(day!==gDay())domRest()}}
/* ---- agganci ---- */
const _upd720=upd;upd=function(dt){_upd720(dt);if(!domOn())return;domTick(dt);domPetTick(dt);domUI()};
const _load720=load;load=function(k,from){const had=DOM.pet;if(had)domDismiss(1);DOM.cap=null;_load720(k,from);if(domOn()&&P.pet!=null&&Array.isArray(P.pets)&&P.pets[P.pet]&&!P.pets[P.pet].ko&&!(ZZ&&ZZ.int))domSummon()};
const _begin720=begin;begin=function(d,s){DOM.pet=null;DOM.cap=null;_begin720(d,s);if(!P)return;domFix();if(OW.on&&!s&&!P.seal0){P.seal0=1;P.seal=Math.max(P.seal|0,3)}if(P.pet!=null)domSummon()};
const _toMenu720=toMenu;toMenu=function(){domDismiss(1);_toMenu720()};
// il compagno si disegna come i mostri, con la barra verde e il nome
const _ent720=ent;ent=function(e){if(e&&e.k==='pet'){e.k='tr';e.tr=1;if(t-(e.mvT||-9)<.18)e.fd=e.fd||[0,1];try{_ent720(e)}finally{e.k='pet';e.tr=0}
    const top=(e.m&&e.m.top||36)+14;if(!D3B){const sx=PX(e.px,e.py),sy=PY(e.px,e.py,0);g.textAlign='center';g.font='bold 10px Georgia,serif';label('🐾 '+e.n,sx,sy-top-6,'#b8ffb8')}
    for(let i=0;i<10;i++){const a=i/10*6.283+t;box(e.px+Math.cos(a)*.42-.03,e.py+Math.sin(a)*.42-.03,.3,.06,.06,.3,'#7aff8a',1.2)}return}
  _ent720(e);if(e&&e.k==='en'&&domOn()&&domCanTake(e)&&!(DOM.cap&&DOM.cap.e===e)&&(P.seal|0)>0&&dist(e,P)<6){const top=(e.m&&e.m.top||36)+16;box(e.px-.07,e.py-.07,top+Math.sin(t*5)*1.5,.14,.14,3,'#ffe28a',1.4)}};
// un nemico che ti stava addosso non colpisce il compagno per sbaglio: le sue mosse restano come sono
addEventListener('keydown',e=>{if(!started||e.target&&/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)||e.repeat)return;const k=e.key.toLowerCase();if(k==='z'&&!PM){domTry();e.preventDefault()}else if(k==='n'){if(PM==='pets')cl();else if(!PM&&domOn())pn('pets');e.preventDefault()}});
// sul telefono: il pulsante «Doma» compare quando c'è un mostro da domare
function domUI(){let b=DOM.btn;if(!b){b=DOM.btn=document.createElement('button');b.id='dmbtn';b.innerHTML='🔮 <b>Doma</b><small></small>';b.addEventListener('pointerdown',ev=>{ev.preventDefault();ev.stopPropagation();domTry()});document.body.appendChild(b)}
  const e=!PM&&!DOM.cap&&domNear(),k=e?'1|'+(P.seal|0):'0';if(k===DOM.uk)return;DOM.uk=k;b.classList.toggle('on',!!e);if(e)b.querySelector('small').textContent=(P.seal|0)+' sigilli · Z'}
if(typeof CDB!=='undefined');
document.head.insertAdjacentHTML('beforeend',`<style>
#dmbtn{position:fixed;left:50%;bottom:calc(150px + env(safe-area-inset-bottom,0px));transform:translateX(-50%) scale(.9);display:none;flex-direction:column;align-items:center;gap:0;padding:6px 16px;border-radius:14px;border:2px solid #ffe28a;background:rgba(40,30,10,.85);color:#ffe8b0;font:14px Georgia,serif;z-index:45;box-shadow:0 0 16px #ffe28a66;animation:dmP 1.2s infinite}
#dmbtn.on{display:flex}#dmbtn small{font-size:10px;opacity:.8}body.touch #dmbtn{bottom:calc(210px + env(safe-area-inset-bottom,0px))}
@keyframes dmP{50%{box-shadow:0 0 26px #ffe28aaa}}
#pn[data-m="pets"]{width:min(640px,95vw)}.dml{display:grid;gap:8px;margin:8px 0}.dmc{display:flex;gap:10px;padding:8px;border-radius:10px;border:1px solid #ffffff22;background:#ffffff08}.dmc.on{border-color:#7aff8a;background:rgba(122,255,138,.08)}.dmc.ko{opacity:.65}
.dmpv{width:76px;height:76px;flex:none;border-radius:8px;background:radial-gradient(circle at 50% 70%,#3a5a3a,#1a221a)}.dmb{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px}.dmb small{opacity:.8}
.dmbar{height:6px;border-radius:3px;background:#0006;overflow:hidden}.dmbar i{display:block;height:100%;background:#5ad06a}.dmbar.xp i{background:#ffd84a}.dmbt{display:flex;gap:5px;flex-wrap:wrap;margin-top:2px}.dmbt button{padding:3px 9px;font-size:12px}
.dmh{padding:8px 10px;border-radius:8px;background:rgba(255,226,138,.08);border:1px dashed #ffe28a66}.dmshop{display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin:6px 0 8px;padding:6px 8px;border-radius:8px;background:rgba(200,160,255,.1);border:1px solid #c8a0ff55}.dmshop span{flex:1;min-width:160px}.dmshop small{display:block;opacity:.75}
</style>`);
// i compagni, i sigilli e il bestiario si salvano con l'eroe
const _save720=save;save=function(){if(!P||!started||MODE!=='story'){_save720();return}const s0=LS.set;
  LS.set=function(k,v){if(v&&v.p&&(k===SAVEK||k===OWK)){if(DOM.pet&&DOM.pet.p)DOM.pet.p.hp=DOM.pet.hp;Object.assign(v.p,{pets:P.pets||[],pet:P.pet,seal:P.seal|0,seal0:P.seal0,bst:P.bst||{},cb19:P.cb19})}return s0.call(LS,k,v)};
  try{_save720()}finally{LS.set=s0}};
