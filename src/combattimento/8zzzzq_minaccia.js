/* ================= 8.6: LA MINACCIA DEL REGNO =================
   Nella Modalità Storia il regno diventa più pericoloso andando avanti, per due motivi che si sommano:
   - la STORIA: ogni frammento della Corona, Malakar, il vero finale e le Lanterne dell'Atto II la fanno salire;
   - il TEMPO: ogni giorno di gioco passato con il tuo eroe (24 minuti veri) la fa salire un po', fino a un tetto.
   La Minaccia va da 0 (Quieta) a 10 (Il Crepuscolo) e si vede sotto l'orologio: toccandola si legge che cosa cambia a
   ogni livello. Vale nei dungeon e nelle zone aperte della Storia (non in città, negli interni, in Tomorrow, nelle
   battaglie e nell'arena). A difficoltà Facile sale più piano (60%).
   Che cosa cambia, livello per livello:
   1 · i guerrieri si mettono IN GUARDIA (scudo blu sopra la testa): parano quasi tutto, ma due colpi rompono la guardia
       e restano storditi con la corazza spezzata. Gli arcieri e i maghi indietreggiano se ti avvicini.
   2 · le bestie agili SCHIVANO di lato una parte dei colpi.
   3 · CARICHE: i nemici veloci e i guerrieri prendono la rincorsa (una fila di cerchi rossi a terra) e si lanciano;
       i nemici grossi fanno un COLPO PESANTE annunciato da un cerchio rosso. I boss, dalla seconda fase, aggiungono la
       Croce (quattro file di cerchi intorno a loro).
   4 · i nemici attaccano più spesso.
   5 · arcieri e maghi tirano a ventaglio (tre colpi); i boss in terza fase chiudono l'eroe in un Anello di cerchi;
       i Campioni hanno due poteri.
   6 · la guardia regge tre colpi, le schivate sono più frequenti, le cariche più ravvicinate.
   7 · FURIA DEL BRANCO: quando un nemico cade, quelli vicini si infuriano per qualche secondo.
   8 · i boss, quasi sconfitti, tentano un ULTIMO RESPIRO (immuni un attimo, poi Croce ed esplosione insieme).
   9-10 · tutto più forte e più fitto; i Campioni hanno tre poteri.
   In più, a ogni livello i nemici hanno il 2% di vita e l'1,5% di attacco in più.
   I CAMPIONI (già dalla 7.11) da qui hanno POTERI, scritti nel nome: Scudo (una barriera azzurra da rompere prima: si
   ricarica una volta sola), Veloce, Vampiro (vicino a lui perdi vita e lui la recupera), Esplosivo (quando cade, scappa dal cerchio rosso),
   Evocatore (a metà vita chiama due rinforzi). Tutti gli attacchi nuovi sono annunciati e si possono schivare con la capriola. */
XSV.add('th86');
const TH86={dev:null,last:-1,tip:0,off:{}};
// TH86.off.<nome> = 1 spegne una mossa (per le prove): guard, kite, dodge, charge, slam, fan, boss, af
const th86X=k=>!TH86.off[k];
const THN86=['Quieta','Inquieta','Agitata','Ostile','Minacciosa','Pericolosa','Feroce','Spietata','Terribile','Apocalittica','Il Crepuscolo'];
const THC86=['#9ad08a','#c8d070','#e8c060','#f0a050','#f08a40','#f06a3a','#e8503a','#d83a4a','#c02a5a','#a01a6a','#7a2ad0'];
// che cosa si aggiunge a ogni livello (si legge nel pannello e nell'annuncio quando la Minaccia sale)
const THD86=['Il regno è tranquillo: i nemici combattono come sempre.',
  'I guerrieri si mettono in guardia (due colpi la rompono). Arcieri e maghi indietreggiano se ti avvicini. I Campioni hanno un potere.',
  'Le bestie agili schivano una parte dei colpi.',
  'Cariche e colpi pesanti annunciati da cerchi rossi. I boss aggiungono la Croce dalla seconda fase.',
  'I nemici attaccano più spesso.',
  'Arcieri e maghi tirano a ventaglio. I boss in terza fase ti chiudono in un Anello. I Campioni hanno due poteri.',
  'La guardia regge tre colpi; più schivate, cariche più ravvicinate.',
  'Furia del branco: quando un nemico cade, quelli vicini si infuriano.',
  'I boss quasi sconfitti tentano un Ultimo Respiro.',
  'Nemici più forti e più fitti. I Campioni hanno tre poteri.',
  'Il Crepuscolo: il regno è al massimo della sua ferocia.'];
// la Storia vera (Tomorrow gira anch'esso con MODE 'story', ma ha già la sua crescita dei nemici)
const th86Mode=()=>!!(P&&MODE==='story'&&!(typeof owOn==='function'&&owOn())&&!(typeof OW!=='undefined'&&OW&&OW.on)&&!(typeof twOn==='function'&&twOn()));
function th86Fix(){if(!P)return{d:0,max:0};P.th86=P.th86||{d:0,max:0};const o=P.th86;o.d=+o.d||0;o.max=+o.max||0;o.sub=+o.sub||0;return o}
// dove vale: la Storia, nei dungeon e nelle zone aperte
function th86Here(k=Zk,z=ZZ){if(!th86Mode()||!z)return false;
  if(k==='town'||k==='arena'||k==='cuore80'||k==='mare'||z.int||z.lay||z.ed||z.war||z.neo||z.sp82||z.cava43)return false;return!!(z.dg||z.th||z.dist||z.lv>0)}
// i punti della storia
function th86Story(){if(!P)return 0;const st=P.st|0,sh=(P.sh||[]).length;let s=[0,.5+.3*sh,2.5,3,3.5,4][Math.min(5,st)]||0;if(st>=1&&st<2)s=Math.min(2.3,s);
  if((P.te|0)>=2)s+=1;if(typeof a2Pts==='function')s+=a2Pts();return Math.max(0,s)}
const th86Days=()=>Math.min(4,th86Fix().d*.25);
function th86Val(){if(!th86Mode())return 0;if(TH86.dev!=null)return TH86.dev;let v=th86Story()+th86Days()-th86Fix().sub;if(DF&&DFS.indexOf(DF)===0)v*=.6;return clamp(v,0,10)}
const th86L=()=>Math.floor(th86Val()+1e-6);
// il livello che vale qui e adesso (0 fuori dalle zone dove conta)
const th86=()=>th86Here()?th86L():0;
/* ---- i giorni passati: si contano solo giocando la Storia con questo eroe ---- */
{const t0=timeTick;timeTick=function(dt){t0(dt);try{if(started&&th86Mode()&&dt>0&&dt<1){const o=th86Fix();o.d+=dt/DAYM;th86Check()}}catch(_){}}}
// quando la Minaccia sale di livello lo si annuncia una volta sola (il massimo raggiunto resta nel salvataggio)
function th86Check(){if(!th86Mode()||TH86.dev!=null)return;const L=th86L(),o=th86Fix();if(TH86.last<0){TH86.last=L;if(L>o.max)o.max=L;
    // la prima volta (anche con un salvataggio vecchio) si spiega che cos'è
    if(!o.intro&&started&&L>=1){o.intro=1;setTimeout(()=>{if(started&&th86Mode())banner('☠ Novità: la Minaccia del Regno','Adesso è '+L+' · '+THN86[L]+'. Sale con la storia e con i giorni: la vedi sotto l\'orologio, toccala per sapere che cosa fa.','teschio')},5200)}return}
  if(L>o.max){o.max=L;TH86.last=L;const first=!o.intro;o.intro=1;if(started)setTimeout(()=>{if(th86Mode())banner('☠ Minaccia del Regno: '+THN86[L],THD86[L]+(first?' La Minaccia sale con la storia e con i giorni: la vedi sotto l\'orologio.':''),'teschio')},400);tone(80,.5,'sawtooth',.05)}
  TH86.last=L}
{const b0=begin;begin=function(d,s){TH86.last=-1;TH86.dev=null;b0(d,s);try{th86Check()}catch(_){}}}
/* ---- sotto l'orologio: la Minaccia, si tocca per leggere che cosa fa ---- */
let TH86h='';
function th86Ui(){const el=$('clkt');if(!el||!P)return;const show=th86Mode();let sp=el.querySelector('.th86');
  if(!show){if(sp)sp.remove();return}const v=th86Val(),L=Math.floor(v+1e-6),here=th86Here(),nx=L<10?Math.round((v-L)*100):100;
  const h=`☠ Minaccia ${L} · ${THN86[L]}${here?'':' <i>(qui no)</i>'}`;if(sp&&TH86h===h+nx)return;TH86h=h+nx;
  if(!sp){sp=document.createElement('div');sp.className='th86';sp.onclick=ev=>{ev.stopPropagation();if(started)pn('th86')};el.appendChild(sp)}
  sp.style.setProperty('--c',THC86[L]);sp.innerHTML=`<span>${h}</span><i class="thb"><b style="width:${nx}%"></b></i>`;sp.title='La Minaccia del Regno: tocca per sapere che cosa fa'}
// le righe in più sotto l'orologio spingono giù l'elenco delle missioni, che altrimenti ci finisce sopra
function qt86Fit(now){const T=performance.now();if(!now&&T-(TH86.fit||0)<700)return;TH86.fit=T;const c=$('clk'),q=$('qt');if(!c||!q)return;q.style.marginTop='';const cb=c.getBoundingClientRect(),qb=q.getBoundingClientRect();if(!cb.height||!qb.height)return;
  if(qb.left<cb.right&&qb.right>cb.left&&qb.top<cb.bottom+4&&qb.top>cb.top)q.style.marginTop=Math.ceil(cb.bottom+4-qb.top)+'px'}
{const c0=clockUI;clockUI=function(){c0();try{th86Ui();qt86Fit()}catch(_){}}}
X43P.th86=()=>{const v=th86Val(),L=Math.floor(v+1e-6),o=th86Fix(),dd=Math.floor(o.d);
  let h=`<h3>☠ La Minaccia del Regno</h3><p class="x43t">Più vai avanti nella storia e più giorni passano, più il regno diventa pericoloso: i nemici imparano mosse nuove, i Campioni hanno poteri, i boss diventano più duri. Vale nei dungeon e nelle zone aperte della Storia.</p>
  <p style="text-align:center;font-size:18px"><b style="color:${THC86[L]}">${L} · ${THN86[L]}</b></p>
  <div class="x43r"><span>Dalla storia</span><span>+${(th86Story()*(DFS.indexOf(DF)===0?.6:1)).toFixed(1)}</span></div><div class="x43r"><span>Dai giorni passati (${dd} ${dd===1?'giorno':'giorni'})</span><span>+${(th86Days()*(DFS.indexOf(DF)===0?.6:1)).toFixed(1)} <small class="mu">(massimo +${DFS.indexOf(DF)===0?'2.4':'4'})</small></span></div>${o.sub?`<div class="x43r"><span>L'alba di Morvath</span><span>−${o.sub.toFixed(1)}</span></div>`:''}${DFS.indexOf(DF)===0?'<p class="mu">A difficoltà Facile la Minaccia sale più piano.</p>':''}
  <h4>Livello per livello</h4>`+THD86.map((d,i)=>`<div class="x43r th86r${i<=L?' on':''}"><span><b style="color:${THC86[i]}">${i}</b> ${THN86[i]}</span><span>${d}</span></div>`).join('');
  return h+`<button onclick="cl()">Chiudi</button>`};
(function(){const st=document.createElement('style');st.textContent=`.th86{margin-top:3px;cursor:pointer;pointer-events:auto;font-size:11px;color:var(--c);text-shadow:0 1px 2px #000}.th86 i{font-style:normal;opacity:.75}.th86 .thb{display:block;height:3px;margin:2px auto 0;width:84px;background:#0006;border-radius:2px;overflow:hidden}.th86 .thb b{display:block;height:100%;background:var(--c)}
.th86r span:last-child{max-width:62%;text-align:right;font-size:12px}.th86r{opacity:.55}.th86r.on{opacity:1}`;document.head.appendChild(st)})();
/* ---- i ruoli dei nemici: chi para, chi schiva, chi carica, chi tira da lontano, chi colpisce pesante ---- */
function th86Role(e){if(e.r86)return e.r86;const b=e.b||{},kd=(b.m&&b.m.kind)||'',hp=b.hp||0;let r='plain';
  if(e.boss||b.np||b.pt)r='none';else if(b.rng)r='rng';else if(hp>=110&&(b.sp||2)<=1.7)r='heavy';else if((b.sp||0)>=2.4)r='agile';else if(kd==='h'&&hp>=30)r='guard';
  return e.r86=r}
const th86Ok=e=>e&&e.k==='en'&&!e.pup&&!e.tr&&!(e.b&&e.b.np)&&ents.includes(e)&&e.hp>0;
const th86Busy=e=>!!((e.wu86&&e.wu86.t>t)||e.ds86||(e.gb86&&e.gb86>t)||(e.cbs||0)>t);
/* ---- più forti con la Minaccia (vita e attacco) ---- */
{const m0=mk;mk=function(tp,x,y,id){const e=m0(tp,x,y,id);try{if(e&&e.k==='en'&&!(e.b&&e.b.np)&&th86Here()){const L=th86L();if(L>0){e.hp=e.mx=Math.round(e.mx*(1+.02*L));if(!e.boss)e.at*=1+.015*L;if(L>=4&&!e.boss)e.cd*=Math.max(.88,1-.02*(L-3));e.th86=L}}}catch(_){}return e}}
// più Campioni
{const e0=eliteP;eliteP=function(z){const p=e0(z);if(p<=0||!th86Here())return p;const L=th86L();return Math.min(.3,p+(z&&z.dg?.003:.002)*L)}}
/* ---- i poteri dei Campioni ---- */
const AF86={scudo:{n:'Scudo',c:'#9ad0ff'},veloce:{n:'Veloce',c:'#fff36a'},vampiro:{n:'Vampiro',c:'#ff4a5a'},esplosivo:{n:'Esplosivo',c:'#ff8a2a'},evocatore:{n:'Evocatore',c:'#c46bff'}};
function af86Give(e,L){if(e.af86||!e.elite||e.boss||!th86X('af'))return;const n=L>=9?3:L>=5?2:L>=1?1:0;if(!n)return;const K=Object.keys(AF86).filter(k=>th86X('af_'+k)),r=sd(hs('af86|'+(Zk||'')+'|'+e.id+'|'+e.t));
  for(let i=K.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[K[i],K[j]]=[K[j],K[i]]}e.af86=K.slice(0,n);
  // i poteri sono il pericolo nuovo: in cambio il Campione ha un po' meno vita e attacco di un Campione semplice
  e.hp=e.mx=Math.round(e.mx*(n>=2?.8:.88));e.at*=n>=2?.88:.94;
  for(const k of e.af86){if(k==='scudo'){e.bar86=e.bmx86=Math.round(e.mx*.2);e.bt86=0;e.brf86=1}if(k==='veloce'){e.sp*=1.25;e.cd*=.82}}
  e.n=String(e.n||'')+' · '+e.af86.map(k=>AF86[k].n).join(', ')}
{const l0=loadPost;loadPost=function(k){l0(k);try{if(th86Here()){const L=th86L();for(const e of ents)if(e.k==='en'&&e.elite)af86Give(e,L)}}catch(e){console.warn('minaccia',e)}}}
/* ---- i colpi che arrivano ai nemici: guardia, schivata, scudo dei Campioni ---- */
{const h0=hurtE;hurtE=function(e,d,rem,cr){try{if(e&&e.k==='en'&&!e.pup&&d>0&&!(e.shd&&e.shd>t)){const L=e.th86!=null?Math.max(e.th86,th86()):th86();
      // lo scudo di un Campione si rompe prima della vita
      if(e.bar86>0){const a=Math.min(e.bar86,d);e.bar86-=a;d-=a;e.bt86=t;if(e.bar86<=0){flt(e,'Scudo infranto!','#9ad0ff');tone(1500,.08,'square',.04);if(cineOK())sparks(e.px,e.py,16,['#9ad0ff','#ffffff'],70)}else flt(e,'🛡'+a,'#9ad0ff');if(d<=0){e.al=1;return}}
      if(!rem&&L>0){const R=th86Role(e);
        // in guardia: para quasi tutto; ogni colpo la incrina, alla fine si rompe
        if(e.gd86&&e.gd86>t&&th86X('guard')){e.gh86=(e.gh86||0)+1;const need=L>=6?3:2;if(e.gh86>=need){e.gd86=0;e.gh86=0;e.gb86=t+1.3;e.cbv=Math.max(e.cbv||0,t+2.5);e.cdt=Math.max(e.cdt||0,1.4);flt(e,'Guardia rotta!','#ffd84a');tone(260,.12,'square',.05);if(cineOK())sparks(e.px,e.py,14,['#ffd84a','#ffffff'],70);return h0(e,Math.round(d*1.25),rem,cr)}
          flt(e,'Parata!','#d8e0ff');if(cineOK())sparks(e.px,e.py,6,['#ffffff','#9ad0ff'],50);tone(1300,.05,'square',.04);return h0(e,Math.max(1,Math.round(d*.2)),rem,cr)}
        // le bestie agili schivano di lato
        if(R==='agile'&&L>=2&&th86X('dodge')&&!th86Busy(e)&&!(e.dg86>t)&&dist(e,P)<3.2&&Math.random()<Math.min(.24,.12+.02*(L-2))){e.dg86=t+(L>=6?3:4);const dx=e.px-P.px,dy=e.py-P.py,dd=Math.hypot(dx,dy)||1,s=Math.random()<.5?1:-1;
          for(let i=0;i<6;i++)mv(e,-dy/dd*s*.16+dx/dd*.05,dx/dd*s*.16+dy/dd*.05);flt(e,'Schiva!','#8ce7ff');whoosh();if(cineOK())sparks(e.px,e.py,6,['#ffffff'],30);e.al=1;return}}}}catch(_){}
  return h0(e,d,rem,cr)}}
/* ---- arcieri e maghi: dal livello 5 tirano a ventaglio ---- */
{const s0=shoot;shoot=function(e,tp){const n0=PJ.length;s0(e,tp);try{if(e&&!e.boss&&!e.pup&&th86X('fan')&&th86()>=5&&PJ.length>n0&&Math.random()<.45){const p=PJ[PJ.length-1],a=Math.atan2(p.vy,p.vx),v=Math.hypot(p.vx,p.vy);for(const da of[-.26,.26])PJ.push(Object.assign({},p,{vx:Math.cos(a+da)*v,vy:Math.sin(a+da)*v,d:Math.round(p.d*.5)}))}}catch(_){}}}
/* ---- l'intelligenza nuova, prima e dopo il giro normale dei nemici ---- */
function th86Line(x0,y0,x1,y1,tt,dmg){const L=Math.hypot(x1-x0,y1-y0),n=Math.max(2,Math.round(L/.7));for(let i=1;i<=n;i++){const u=i/n,x=x0+(x1-x0)*u,y=y0+(y1-y0)*u,ix=x|0,iy=y|0;if(ix<0||iy<0||ix>=N||iy>=N||!WK(M[iy][ix]))break;fx.push({k:'warn',x,y,r:.62,t:tt,mx:tt,dmg})}}
function th86Pre(dt){const L0=th86();if(!L0)return null;const keep=[];
  // al massimo due (tre dal livello 6) in guardia nello stesso momento: in un'orda di scheletri non deve diventare un muro
  let gdn=0;for(const e of ents)if(e.k==='en'&&e.gd86&&e.gd86>t)gdn++;const gdMax=L0>=6?3:2;
  for(const e of ents){if(!th86Ok(e)||e.boss)continue;const R=th86Role(e);if(R==='none')continue;const L=Math.max(L0,e.th86||0),d=dist(e,P);
    // la rincorsa e la carica: l'enemico resta fermo mentre si carica, poi scatta lungo la fila di cerchi
    if(e.ds86){keep.push([e,e.px,e.py,'dash']);e.cdt=Math.max(e.cdt||0,.3);continue}
    if(e.wu86){if(e.wu86.t>t){keep.push([e,e.px,e.py]);e.cdt=Math.max(e.cdt||0,.3);continue}
      const w=e.wu86;e.wu86=null;if(w.k==='charge'){e.ds86={dx:w.dx,dy:w.dy,t:w.len/9}}else if(w.k==='slam'){e.cdt=e.cd*1.2}
      keep.push([e,e.px,e.py]);continue}
    if(e.gb86&&e.gb86>t){keep.push([e,e.px,e.py]);e.cdt=Math.max(e.cdt||0,.3);continue}
    if(!e.al||d>9||P.hp<=0)continue;
    // in guardia: si muove piano e non attacca
    if(e.gd86&&e.gd86>t){keep.push([e,e.px,e.py,'slow']);e.cdt=Math.max(e.cdt||0,.25);continue}
    if(R==='guard'&&L>=1&&th86X('guard')&&d<3.2&&!(e.gn86>t)&&gdn<gdMax){e.gn86=t+Math.max(3.2,6.5-L*.3)+Math.random()*2;if(Math.random()<.65){gdn++;e.gd86=t+1.7;e.gh86=0;flt(e,'In guardia','#9ad0ff');tone(700,.04,'square',.03);keep.push([e,e.px,e.py,'slow']);continue}}
    // carica (agili e guerrieri, ma anche gli altri a mani nude)
    if(L>=3&&th86X('charge')&&(R==='agile'||R==='guard'||R==='plain')&&d>2.6&&d<6.2&&!(e.cn86>t)){e.cn86=t+Math.max(4.5,9.5-L*.45)+Math.random()*2;if(Math.random()<.55){const dx=(P.px-e.px)/d,dy=(P.py-e.py)/d,len=Math.min(d+1.2,6.6),tt=L>=6?.55:.7;
        e.wu86={k:'charge',t:t+tt,dx,dy,len};th86Line(e.px,e.py,e.px+dx*len,e.py+dy*len,tt+len/9*.6,e.at*1.05);flt(e,'Carica!','#ff8a5a');tone(140,.25,'sawtooth',.04);keep.push([e,e.px,e.py]);continue}}
    // colpo pesante annunciato
    if(R==='heavy'&&L>=3&&th86X('slam')&&d<=e.r*1.1&&(e.cdt||0)<=0){e.hv86=(e.hv86||0)+1;if(e.hv86%2===0){const dx=(P.px-e.px)/(d||1),dy=(P.py-e.py)/(d||1),tt=.85;e.wu86={k:'slam',t:t+tt};fx.push({k:'warn',x:e.px+dx*.8,y:e.py+dy*.8,r:1.55,t:tt,mx:tt,dmg:e.at*1.4});e.atkT=t+tt-.2;e.atkD=[dx,dy];flt(e,'Colpo pesante!','#ff8a5a');tone(90,.3,'sawtooth',.05);keep.push([e,e.px,e.py]);continue}}
    // arcieri e maghi: indietreggiano se ti avvicini
    // (mentre indietreggia non tira: è un cambio di posto, non un vantaggio gratis)
    if(R==='rng'&&L>=1&&th86X('kite')&&d<2.3&&!(e.kp86>t)){if(!e.kt86||e.kt86<t-2.4)e.kt86=t;if(t-e.kt86<.9){keep.push([e,e.px,e.py,'kite']);e.cdt=Math.max(e.cdt||0,.35)}else e.kp86=t+2.6}}
  return keep}
function th86Post(dt,keep){if(!keep)return;for(const[e,x,y,k]of keep){if(!ents.includes(e))continue;
    if(k==='slow'){e.px=x+(e.px-x)*.35;e.py=y+(e.py-y)*.35;continue}
    if(k==='kite'){e.px=x;e.py=y;const d=dist(e,P)||1,s=e.sp*.95*dt;mv(e,(e.px-P.px)/d*s,(e.py-P.py)/d*s);continue}
    e.px=x;e.py=y;
    if(k==='dash'){const c=e.ds86;c.t-=dt;const s=9*dt,x0=e.px,y0=e.py;mv(e,c.dx*s,c.dy*s);e.fd=[c.dx,c.dy];if(c.t<=0||Math.hypot(e.px-x0,e.py-y0)<s*.3){e.ds86=null;e.cdt=Math.max(e.cdt||0,.6)}}}}
/* ---- i boss: Croce, Anello, Ultimo Respiro ---- */
function th86Cross(e,tt){for(let k=0;k<4;k++){const a=k*Math.PI/2+(e.ph86=(e.ph86||0)+.4);th86Line(e.px,e.py,e.px+Math.cos(a)*7,e.py+Math.sin(a)*7,tt,e.at*1.1)}}
function th86Ring(e,tt){const n=12,gap=Math.floor(Math.random()*n);for(let i=0;i<n;i++){if(i===gap||i===(gap+1)%n)continue;const a=i/n*6.283;fx.push({k:'warn',x:P.px+Math.cos(a)*2.4,y:P.py+Math.sin(a)*2.4,r:.95,t:tt,mx:tt,dmg:e.at*1.2})}}
function th86Boss(dt){const L=th86();if(L<3||!th86X('boss'))return;for(const e of ents){if(e.k!=='en'||!e.boss||e.pup||!e.al||e.hp<=0||(e.b&&e.b.np))continue;if(dist(e,P)>14)continue;
    if((typeof b43Stun==='function'&&b43Stun(e))||(e.shd&&e.shd>t)||e.ch)continue;const ph=typeof b43Ph==='function'?b43Ph(e):(e.hp>e.mx*.5?1:2);
    if(L>=8&&!e.lb86&&e.hp<e.mx*.12){e.lb86=1;e.shd=t+1.4;flt(e,'Ultimo respiro!','#ff3a6a');msg(e.n+' raccoglie le ultime forze!');tone(60,.8,'sawtooth',.08);shake(.8);if(cineOK())ringFx(e.px,e.py,'255,60,100',1.2,3.5);
      setTimeout(()=>{if(!ents.includes(e))return;th86Cross(e,1);const n=18;for(let i=0;i<n;i++){const an=i*6.283/n;PJ.push({x:e.px,y:e.py,vx:Math.cos(an)*5.5,vy:Math.sin(an)*5.5,t:2.2,d:e.at*.8,c:'#ff3a6a'})}},1400);continue}
    if(ph<2)continue;e.bx86=(e.bx86==null?t+3:e.bx86);if(t<e.bx86)continue;e.bx86=t+Math.max(5,9-L*.35)+Math.random()*2;
    if(ph>=3&&L>=5&&Math.random()<.55){th86Ring(e,1.1);flt(e,'Anello!','#ff8a5a')}else{th86Cross(e,1.05);flt(e,'Croce!','#ff8a5a')}tone(110,.3,'sawtooth',.05)}}
/* ---- i poteri dei Campioni, mentre combattono ---- */
function af86Tick(dt){for(const e of ents){if(e.k!=='en'||!e.af86||e.pup||e.hp<=0)continue;
    if(e.bmx86&&e.brf86>0&&e.bar86<=0&&t-(e.bt86||0)>7){e.brf86--;e.bar86=e.bmx86;flt(e,'Scudo','#9ad0ff');if(cineOK())ringFx(e.px,e.py,'150,210,255',.6,1.2)}
    if(e.af86.includes('vampiro')&&e.al&&dist(e,P)<1.9&&P.hp>0&&!(e.vp86>t)){e.vp86=t+1.2;const h0=P.hp;hurtP(e.at*.25);const got=Math.max(0,h0-P.hp)*.8;if(got>0){e.hp=Math.min(e.mx,e.hp+got);flt(e,'+'+Math.round(got),'#ff6a7a');if(cineOK())sparks(P.px,P.py,6,['#ff2a3a','#ff8a9a'],40)}}
    if(e.af86.includes('evocatore')){const st=e.hp<e.mx*.5?1:0;if(st>(e.ev86||0)){e.ev86=st;const L=(ZZ&&ZZ.en)||[],pool=L.filter(k=>E[k]&&!E[k].boss);if(pool.length&&ents.filter(x=>x.k==='en').length<18){flt(e,'Evoca rinforzi!','#c46bff');if(cineOK())ringFx(e.px,e.py,'196,107,255',.8,1.8);
        for(let i=0;i<2;i++){const an=i*3.14+t,[x,y]=nearFree(clamp(Math.floor(e.px+Math.cos(an)*1.6),1,N-2),clamp(Math.floor(e.py+Math.sin(an)*1.6),1,N-2));if(WK(M[y][x])){const m=mk(pool[(i+e.id)%pool.length],x,y,30000+e.id*10+st*2+i);m.al=1;ents.push(m)}}}}}}}
// i Campioni con lo scudo e i guerrieri in guardia si riconoscono (disegnati con i blocchi: si vedono in 2D e in 3D)
{const n0=ent;ent=function(e){n0(e);try{if(e&&e.k==='en'&&ents.includes(e)){const top=(e.m&&e.m.top?e.m.top:40);
    if(e.gd86&&e.gd86>t){box(e.px-.13,e.py-.03,top+4,.26,.06,9,'#9ad0ff',1.3);box(e.px-.05,e.py-.04,top+7,.1,.06,3,'#ffffff',1.4)}
    if(e.bar86>0){const n=10,k=e.bar86/e.bmx86;for(let i=0;i<n;i++){if(i/n>k)break;const a=i/n*6.283+t*1.2;box(e.px+Math.cos(a)*.46-.04,e.py+Math.sin(a)*.46-.04,10,.08,.08,5,'#9ad0ff',1.4)}}
    if(e.wu86&&e.wu86.t>t&&Math.sin(t*30)>0)box(e.px-.04,e.py-.04,top+6,.08,.08,8,'#ff5a3a',1.5);
    // i poteri sopra «★ Campione» (label: si legge anche nella vista 3D)
    if(e.af86&&e.elite&&!(typeof OCC!=='undefined'&&OCC&&OCC.intro)){g.textAlign='center';g.font='bold 10px Georgia,serif';label(e.af86.map(k=>AF86[k].n).join(' · '),PX(e.px,e.py),PY(e.px,e.py,0)-top-6-22,AF86[e.af86[0]].c)}}}catch(_){}}}
// i Campioni esplosivi, e la furia del branco
{const k0=kill;kill=function(e){const ok=e&&e.k==='en'&&ents.includes(e)&&!e.pup,x=e&&e.px,y=e&&e.py,at=e&&e.at,ex=ok&&e.af86&&e.af86.includes('esplosivo'),L=ok?th86():0;k0(e);if(!ok)return;
  try{if(ex){fx.push({k:'warn',x,y,r:2.2,t:1.1,mx:1.1,dmg:at*1.8});flt({px:x,py:y},'Sta per esplodere!','#ff8a2a');tone(200,.4,'square',.04)}
    if(L>=7&&!e.boss)for(const o of ents)if(o.k==='en'&&!o.boss&&!o.pup&&!o.fu86&&Math.hypot(o.px-x,o.py-y)<3.5){o.fu86=t+5;o.sp*=1.15;o.at*=1.15;flt(o,'Furia!','#ff5a3a');setTimeout(()=>{if(o.fu86){o.fu86=0;o.sp/=1.15;o.at/=1.15}},5000)}}catch(_){}}}
{const u0=upd;upd=function(dt){let keep=null;try{if(started&&th86Mode())keep=th86Pre(dt)}catch(e){console.warn('minaccia',e)}u0(dt);
  try{if(started&&th86Mode()){th86Post(dt,keep);if(th86()){th86Boss(dt);af86Tick(dt)}}}catch(e){console.warn('minaccia',e)}}}
