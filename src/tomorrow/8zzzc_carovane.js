/* ================= 7.45: le carovane e il commercio fra le città =================
   Dal registro del borgo (U → Insediamento → Carovane) parte una carovana carica delle tue merci: legna, pietra, argilla,
   ferro, grano, mele... Verso un'altra tua città le merci finiscono nel suo magazzino; verso un villaggio vengono vendute,
   e ogni villaggio paga di più quello che gli manca (nel deserto la legna, al nord il grano), con prezzi che cambiano
   ogni settimana. Il viaggio dura qualche minuto (di più con la neve). Per strada i banditi possono assaltarla: hai tre
   minuti per raggiungere la regione e difenderla, se no metà del carico è perduta. Con una scorta (si paga) il rischio è
   molto più basso. I soldi delle vendite vanno nel tesoro della città da cui la carovana è partita. */
const CARR=['legna','pietra','argilla','ferro','grano','mela','uova'];
const CARDEM={deserto:{legna:2,grano:1.6,mela:1.5,uova:1.4},neve:{grano:1.8,legna:1.4,mela:1.6,uova:1.5},cenere:{grano:2,pietra:1.3,legna:1.5,mela:1.6},bosco:{pietra:1.3,argilla:1.4,ferro:1.2},prato:{ferro:1.5,legna:1.1,pietra:1.1}};
const CAR={to:null,r:'legna',n:10,esc:0,tick:0};
const carList=()=>(P&&P.tw&&(P.tw.car=P.tw.car||[]))||[];
const carDist=(a,b)=>{const p=twP(a),q=twP(b);return p&&q?Math.max(Math.abs(p[0]-q[0]),Math.abs(p[1]-q[1])):1};
const carName=k=>{const p=twP(k);if(!p)return k;const S=csSets().find(s=>s.k===k);return S?S.n:twName(p[0],p[1])};
function carPrice(r,to){const p=twP(to),b=p?twBio(p[0],p[1]):'prato',w=Math.floor((Date.now()/86400000+3)/7),f=.8+sd(hs('mercato|'+to+'|'+r+'|'+w))()*.45;return Math.max(1,Math.round((RESP[r]||5)*((CARDEM[b]||{})[r]||1)*f))}
// dove può andare: le tue altre città e i villaggi già visti, entro dieci regioni
function carDests(S){const L=[];for(const s of csSets())if(s!==S&&s.k&&s.k!==S.k)L.push({k:s.k,city:1});const vis=P.tw.vis||{};
  for(const k in vis){const p=twP(k);if(!p||!twVil(p[0],p[1])||csSets().some(s=>s.k===k))continue;if(carDist(S.k,k)<=10)L.push({k,city:0})}
  return L.sort((a,b)=>b.city-a.city||carDist(S.k,a.k)-carDist(S.k,b.k)).slice(0,14)}
X43P.car44=()=>{const S=P.tw.set;if(!S)return'<p>Nessuna città</p>';const D=carDests(S);if(!CAR.to||!D.some(d=>d.k===CAR.to))CAR.to=D.length?D[0].k:null;const dst=D.find(d=>d.k===CAR.to);
  const have=P.res[CAR.r]|0,n=Math.min(CAR.n,have),pr=dst&&!dst.city?carPrice(CAR.r,CAR.to):0,val=n*pr,scC=Math.ceil(Math.max(val,n*(RESP[CAR.r]||5))*.15),ds=dst?carDist(S.k,CAR.to):0,wx=typeof wxAt==='function'?(WXT[wxAt(S.k)]||{}).car||1:1,min=Math.ceil(Math.max(90,ds*75)*wx/60);
  return`<h3>🐫 Nuova carovana da ${esc(S.n)}</h3>
  ${D.length?`<h4>Dove</h4><div class="x43c">${D.map(d=>`<button class="${CAR.to===d.k?'on':''}" onclick="CAR.to='${d.k}';pn('car44')"><i>${d.city?'🏰':'🏘'}</i><b>${esc(carName(d.k))}</b><small>${d.city?'la tua città: le merci vanno nel magazzino':'villaggio: compra le merci'} · ${carDist(S.k,d.k)} regioni</small></button>`).join('')}</div>`:'<p class="mu">Non conosci altri posti: esplora il mondo per trovare villaggi (o fonda un\'altra città).</p>'}
  <h4>Cosa</h4><div class="srow">${CARR.map(r=>`<button class="${CAR.r===r?'on':''}" onclick="CAR.r='${r}';pn('car44')">${SETMI[r]||''} ${RESN[r]||r} (${P.res[r]|0})${dst&&!dst.city?' · '+carPrice(r,CAR.to)+'💰':''}</button>`).join('')}</div>
  <div class="srow">Quanto: ${[10,25,50,100].map(q=>`<button class="${CAR.n===q?'on':''}" onclick="CAR.n=${q};pn('car44')">${q}</button>`).join('')}<span class="mu">ne hai ${have}</span></div>
  <div class="row"><label for="c_esc">🛡 Scorta armata (${scC}💰): i banditi quasi non attaccano</label><input type="checkbox" id="c_esc" ${CAR.esc?'checked':''} onchange="CAR.esc=this.checked?1:0;pn('car44')"></div>
  <p>${dst?`<b>${n} ${RESN[CAR.r]||CAR.r}</b> → ${esc(carName(CAR.to))} · circa ${min} minuti di viaggio${dst.city?'':' · ricavo <b>'+val+'💰</b> nel tesoro di '+esc(S.n)}`:''}</p>
  <button class="pri" ${dst&&n>0?'':'disabled'} onclick="carGo()">🐫 Parti</button><button onclick="pn('regno')">Indietro</button>`};
function carGo(){const S=P.tw.set,to=CAR.to,r=CAR.r,n=Math.min(CAR.n,P.res[r]|0);if(!S||!to||n<=0)return;const city=csSets().some(s=>s.k===to),pr=city?0:carPrice(r,to),val=n*pr,scC=CAR.esc?Math.ceil(Math.max(val,n*(RESP[r]||5))*.15):0;
  if(scC&&P.g<scC){msg('Servono '+scC+' monete per la scorta');tone(150,.1);return}if(carList().filter(c=>!c.done).length>=4){msg('Hai già quattro carovane in viaggio');return}
  P.g-=scC;P.res[r]-=n;const ds=carDist(S.k,to),wx=typeof wxAt==='function'?(WXT[wxAt(S.k)]||{}).car||1:1,dur=Math.round(Math.max(90,ds*75)*wx*1000),rn=Math.random(),now=Date.now(),C={id:now.toString(36),fk:S.k,fn:S.n,tk:to,city:city?1:0,r,n,pr,esc:CAR.esc?1:0,t0:now,dur};
  if(CAR.esc?rn<.08:rn<.35){const f=.35+Math.random()*.35,a=twP(S.k),b=twP(to),k=twK(Math.round(a[0]+(b[0]-a[0])*f),Math.round(a[1]+(b[1]-a[1])*f));C.atk={k,at:now+dur*f,st:'wait'}}
  carList().push(C);setLog(S,'Partita una carovana per '+carName(to)+': '+n+' '+(RESN[r]||r).toLowerCase());jingle([60,64,67],.1,'triangle');msg('La carovana è partita per '+carName(to)+(CAR.esc?' con la scorta':''));save();hud();pn('regno')}
// il viaggio, l'assalto e l'arrivo (in tempo vero: le carovane viaggiano anche mentre non giochi)
function carTick(){if(typeof twOn!=='function'||!twOn()||!P.tw)return;const now=Date.now();let ch=0;
  for(const C of carList()){if(C.done)continue;const A=C.atk;
    if(A&&A.st==='wait'&&now>=A.at){if(C.esc){A.st='won';msg('La scorta della carovana per '+carName(C.tk)+' ha respinto i banditi');ch=1}else{A.st='live';A.until=now+180000;banner('🐫 Carovana assalita!','I banditi la attaccano a '+carName(A.k)+': hai 3 minuti per difenderla (M per la mappa)','spade');tone(120,.4,'sawtooth',.06);ch=1}}
    if(A&&A.st==='live'){if(Zk===A.k)carFight(C);if(now>A.until){A.st='lost';C.n=Math.ceil(C.n/2);const S=csSets().find(s=>s.k===C.fk);if(S)setLog(S,'I banditi hanno preso metà del carico della carovana per '+carName(C.tk));msg('Troppo tardi: i banditi hanno preso metà del carico');ch=1}}
    if(now>=C.t0+C.dur&&!(A&&A.st==='live')){C.done=1;ch=1;const S=csSets().find(s=>s.k===C.fk),T=csSets().find(s=>s.k===C.tk);
      if(C.city&&T){T.mag=T.mag||{};T.mag[C.r]=(T.mag[C.r]|0)+C.n;setLog(T,'Arrivata una carovana da '+C.fn+': '+C.n+' '+(RESN[C.r]||C.r).toLowerCase());msg('La carovana è arrivata a '+T.n+': '+C.n+' '+(RESN[C.r]||C.r).toLowerCase()+' nel magazzino')}
      else{const g=C.n*C.pr;if(S){S.cash=(S.cash|0)+g;setLog(S,'La carovana ha venduto '+C.n+' '+(RESN[C.r]||C.r).toLowerCase()+' a '+carName(C.tk)+' per '+g+' monete')}msg('🐫 Carovana arrivata a '+carName(C.tk)+': +'+g+' monete nel tesoro di '+C.fn);if(cineOK())banner('Carovana arrivata',carName(C.tk)+' · +'+g+'💰','moneta')}}}
  const L=carList();if(L.length>12)P.tw.car=L.filter(c=>!c.done).concat(L.filter(c=>c.done).slice(-4));if(ch)save()}
setInterval(()=>{try{if(started)carTick()}catch(e){console.warn('carovane',e)}},1000);
// la difesa: la carovana ferma e i banditi intorno; quando cadono tutti, è salva
function carFight(C){const A=C.atk;A.dead=A.dead|0;let cart=ents.find(e=>e.k==='car44'&&e.cid===C.id);if(!cart){const[x,y]=nearFree((N>>1),(N>>1)+2);cart={k:'car44',cid:C.id,px:x+.5,py:y+.5,n:'Carovana per '+carName(C.tk)};ents.push(cart)}
  if(A.dead<5&&!ents.some(e=>e.k==='en'&&e.carb===C.id)){const x=cart.px|0,y=cart.py|0;
    for(let i=A.dead;i<5;i++){const a=i*1.26,[u,v]=nearFree(clamp(Math.round(x+Math.cos(a)*4),2,N-3),clamp(Math.round(y+Math.sin(a)*4),2,N-3));const e=mk(E.bandito?'bandito':Object.keys(E)[0],u,v);e.n='Bandito della strada';e.carb=C.id;e.al=1;ents.push(e)}
    if(!A.sp)msg('Eccola! Abbatti i banditi intorno alla carovana');A.sp=1;return}
  if(A.sp&&A.dead>=5){A.st='won';const g=40+(P.lv|0)*8;P.g+=g;goldFly&&goldFly(g);banner('Carovana salva!','La carovana riparte verso '+carName(C.tk)+' · +'+g+'💰 di ricompensa','spunta');jingle([67,72,76,79],.1);hud();save()}}
const _loadPost744v=loadPost;loadPost=function(k){_loadPost744v(k);try{carTick()}catch(e){}};
// nel registro del borgo: le carovane in viaggio
{const h0=setHTML2;setHTML2=function(){let h=h0();const S=P.tw.set;if(!S)return h;const L=carList().filter(c=>c.fk===S.k||c.tk===S.k).slice(-6).reverse(),now=Date.now();
  const card=`<h4>🐫 Carovane</h4><div class="slog">${L.length?L.map(C=>{const k=Math.min(1,(now-C.t0)/C.dur),A=C.atk,st=C.done?'arrivata':A&&A.st==='live'?'<b style="color:#ff7a6a">assalita a '+esc(carName(A.k))+'!</b>':A&&A.st==='lost'?'derubata, in viaggio':Math.ceil((C.t0+C.dur-now)/60000)+' min';
      return`<p>${C.fk===S.k?'→ '+esc(carName(C.tk)):'← da '+esc(C.fn)} · ${C.n} ${esc((RESN[C.r]||C.r).toLowerCase())}${C.esc?' · 🛡':''} · ${st} <span class="sbar"><i style="width:${Math.round(k*100)}%;background:#e8c060"></i></span></p>`}).join(''):'<p class="mu">Nessuna carovana in viaggio.</p>'}</div>
    <div class="srow"><button onclick="pn('car44')">🐫 Nuova carovana</button></div>`;const i=h.indexOf('<h4>Costruire</h4>');return i<0?h+card:h.slice(0,i)+card+h.slice(i)}}
// il disegno della carovana: il carro coperto, le ruote e il bue davanti
const _ent744v=ent;ent=function(e){if(e.k!=='car44'){_ent744v(e);return}if(SET.shad){g.fillStyle='rgba(0,0,0,.28)';g.beginPath();g.ellipse(PX(e.px,e.py),PY(e.px,e.py,0),28,12,0,0,6.3);g.fill()}
  drawL([[-.5,-.3,4,1,.6,8,'#7a5a3a'],[-.46,-.26,12,.92,.52,10,'#e8dcc0'],[-.4,-.22,22,.8,.44,4,'#d8ccb0'],[-.45,-.36,0,.14,.06,10,'#3a2a1a'],[.31,-.36,0,.14,.06,10,'#3a2a1a'],[-.45,.3,0,.14,.06,10,'#3a2a1a'],[.31,.3,0,.14,.06,10,'#3a2a1a'],
    [.55,-.12,6,.5,.26,12,'#8a6a4a'],[.95,-.08,12,.16,.18,8,'#6a4a3a'],[.6,-.12,0,.08,.08,6,'#4a3424'],[.9,-.12,0,.08,.08,6,'#4a3424'],[.6,.06,0,.08,.08,6,'#4a3424'],[.9,.06,0,.08,.08,6,'#4a3424']],e.px,e.py,0)};
ITK.add('car44');
const _act744v=act;act=function(e){if(e&&e.k==='car44'){const C=carList().find(c=>c.id===e.cid);PA={ti:'🐫 '+e.n,tx:C?(C.n+' '+(RESN[C.r]||C.r).toLowerCase()+' da '+C.fn+'. '+(C.atk&&C.atk.st==='live'?'I banditi la circondano: abbattili tutti!':'È salva: riparte appena puoi.')):''};pn('txt');return}_act744v(e)};

// i banditi abbattuti contano (la zona può essere ridisegnata mentre combatti: chi manca torna)
const _kill744v=kill;kill=function(e){const c=e&&e.carb&&ents.includes(e)?carList().find(q=>q.id===e.carb):null;_kill744v(e);if(c&&c.atk)c.atk.dead=(c.atk.dead|0)+1};
