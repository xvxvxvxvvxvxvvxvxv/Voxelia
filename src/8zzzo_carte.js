/* ================= 7.47: il duello delle carte =================
   Nella Taverna del Drago Ubriaco (e nelle città di Tomorrow) c'è il Tavolo delle carte. Ogni carta ha un elemento e un
   valore: 🔥 fuoco batte 🌿 natura, 🌿 natura batte 💧 acqua, 💧 acqua batte 🔥 fuoco (+3 a chi ha l'elemento giusto).
   Le carte speciali: il Drago (10), il Giullare (vince solo contro il 9 e il 10) e l'Arcobaleno (ha sempre l'elemento giusto).
   Si giocano cinque mani con cinque carte pescate dalla tua collezione: vince chi ne prende di più. Si può scommettere;
   chi vince prende la posta raddoppiata e spesso una carta dell'avversario. Le prime dieci carte sono in regalo, le altre
   si vincono o si comprano a buste da tre. Gli avversari sono quattro, sempre più bravi. */
XSV.add('crt47');
const CRTE={f:{i:'🔥',n:'Fuoco',c:'#e85a2a'},a:{i:'💧',n:'Acqua',c:'#3a8adc'},n:{i:'🌿',n:'Natura',c:'#4aa84a'}};
const CRTS={drago:{n:'Drago',v:10,i:'🐉',c:'#a83ae8'},giullare:{n:'Giullare',v:1,i:'🃏',c:'#e8c83a'},arco:{n:'Arcobaleno',v:6,i:'🌈',c:'#e83a9a'}};
const CRTA=[{n:'Pippo il garzone',lv:1,d:'Gioca a caso',min:0},{n:'Rosa la mercante',lv:2,d:'Gioca le carte più alte',min:0},{n:'Vecchio Brann',lv:3,d:'Conosce gli elementi',min:12},{n:'Il Re delle carte',lv:4,d:'Non sbaglia quasi mai',min:20}];
const CRTB=[0,50,200,1000];
const CRD={g:null,bet:0,view:'menu'};
const crtAll=()=>{const L=[];for(const e in CRTE)for(let v=1;v<=9;v++)L.push(e+v);return L.concat(Object.keys(CRTS))};
const crtInfo=id=>CRTS[id]?Object.assign({id,sp:1,e:null},CRTS[id]):{id,e:id[0],v:+id.slice(1),n:CRTE[id[0]].n+' '+id.slice(1),i:CRTE[id[0]].i,c:CRTE[id[0]].c};
function crtFix(){P.crt47=P.crt47||{c:{},w:{},n:0,v:0};const c=P.crt47;c.c=c.c||{};c.w=c.w||{};
  if(!c.st){c.st=1;for(let i=0;i<10;i++){const id='fan'[i%3]+(1+Math.floor(Math.random()*5));c.c[id]=(c.c[id]|0)+1}}return c}
const crtCount=()=>Object.values(crtFix().c).reduce((s,n)=>s+(n|0),0);
const crtKinds=()=>Object.keys(crtFix().c).filter(k=>crtFix().c[k]>0).length;
// la forza di una carta contro un'altra (vince la più alta; pari = nessuno)
function crtPow(a,b){const A=crtInfo(a),B=crtInfo(b);if(A.id==='giullare')return B.v>=9?99:0;if(B.id==='giullare'&&A.v>=9)return 0;
  let v=A.v;const adv=A.id==='arco'||A.e&&B.e&&(A.e==='f'&&B.e==='n'||A.e==='n'&&B.e==='a'||A.e==='a'&&B.e==='f');if(adv&&B.id!=='arco')v+=3;return v}
function crtWin(a,b){const x=crtPow(a,b),y=crtPow(b,a);return x>y?1:x<y?-1:0}
function crtDraw(pool,n){const L=[];for(const k in pool)for(let i=0;i<(pool[k]|0);i++)L.push(k);for(let i=L.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[L[i],L[j]]=[L[j],L[i]]}return L.slice(0,n)}
// il mazzo dell'avversario: più è bravo, più carte alte e speciali
function crtFoe(lv){const L=[];for(let i=0;i<5;i++){if(lv>=3&&Math.random()<.08*lv){L.push(Object.keys(CRTS)[Math.floor(Math.random()*3)]);continue}const e='fan'[Math.floor(Math.random()*3)],lo=[1,2,3,4][lv-1],hi=[5,7,8,9][lv-1];L.push(e+(lo+Math.floor(Math.random()*(hi-lo+1))))}return L}
function crtAI(g){const H=g.fh,lv=g.lv;if(lv<=1)return Math.floor(Math.random()*H.length);
  if(lv===2){let b=0;for(let i=1;i<H.length;i++)if(crtInfo(H[i]).v>crtInfo(H[b]).v)b=i;return b}
  // gli altri provano ogni carta contro le carte che hai ancora (il Re le vede quasi tutte)
  let best=0,bs=-1e9;for(let i=0;i<H.length;i++){let s=0;for(const m of g.ph)s+=crtWin(H[i],m);s=s/Math.max(1,g.ph.length)-crtInfo(H[i]).v*.02*(lv===4?0:1)+(lv===3?Math.random()*.6:Math.random()*.15);if(s>bs){bs=s;best=i}}return best}
function crtStart(i){const A=CRTA[i],c=crtFix();if(!A)return;if(crtCount()<5){msg('Ti servono almeno cinque carte');return}if(crtKinds()<A.min){msg(A.n+' gioca solo con chi ha almeno '+A.min+' carte diverse');tone(150,.1);return}
  const bet=Math.min(CRD.bet,P.g);if(CRD.bet&&P.g<CRD.bet){msg('Non hai abbastanza oro per questa posta');return}P.g-=bet;
  CRD.g={a:i,lv:A.lv,bet,ph:crtDraw(c.c,5),fh:crtFoe(A.lv),sc:[0,0],r:0,last:null,log:[]};tone(500,.06,'triangle');hud();pn('carte47')}
function crtPlay(k){const g=CRD.g;if(!g||g.end)return;const a=g.ph.splice(k,1)[0];if(!a)return;const j=crtAI(g),b=g.fh.splice(j,1)[0],w=crtWin(a,b);g.r++;g.last=[a,b,w];
  if(w>0)g.sc[0]++;else if(w<0)g.sc[1]++;tone(w>0?720:w<0?220:440,.08,w>0?'triangle':'square',.05);
  if(!g.ph.length)crtEnd();pn('carte47')}
function crtEnd(){const g=CRD.g,c=crtFix(),A=CRTA[g.a],[x,y]=g.sc;g.end=1;
  if(x>y){c.v=(c.v|0)+1;let s='';const pr=g.bet*2;P.g+=pr;if(pr)goldFly(pr);
    const nw=!c.w[g.a];c.w[g.a]=(c.w[g.a]|0)+1;let card=null;if(nw&&g.a>=1)card=['arco','giullare','drago'][g.a-1];else if(Math.random()<.45){const all=crtAll().filter(id=>!CRTS[id]),hi=[5,7,8,9][A.lv-1];const L=all.filter(id=>+id.slice(1)<=hi&&+id.slice(1)>=hi-3);card=L[Math.floor(Math.random()*L.length)]}
    if(card){c.c[card]=(c.c[card]|0)+1;s=' · nuova carta: '+crtInfo(card).n}g.res='Hai vinto '+x+' a '+y+(pr?' · +'+pr+' oro':'')+s;banner('Hai battuto '+A.n+'!',g.res,'corona');jingle([60,64,67,72,76],.08,'triangle');if(typeof gainXP==='function')gainXP(15*A.lv)}
  else if(x<y){c.n=(c.n|0)+1;g.res='Ha vinto '+A.n+', '+y+' a '+x+(g.bet?' · perdi '+g.bet+' oro':'');tone(150,.2,'sawtooth',.04)}
  else{P.g+=g.bet;g.res='Pareggio '+x+' a '+y+(g.bet?' · riprendi la posta':'')}hud();save()}
function crtBuy(){if(P.g<150){msg('Una busta costa 150 monete');tone(150,.1);return}P.g-=150;const c=crtFix(),got=[];for(let i=0;i<3;i++){const r=Math.random();let id;if(r<.04)id=Object.keys(CRTS)[Math.floor(Math.random()*3)];else id='fan'[Math.floor(Math.random()*3)]+(1+Math.floor(Math.random()*(r<.3?9:6)));c.c[id]=(c.c[id]|0)+1;got.push(crtInfo(id).n)}
  msg('Nella busta: '+got.join(', '));tone(800,.06,'triangle');hud();save();pn('carte47')}
const crtCard=(id,on,cls)=>{const C=crtInfo(id);return`<span class="crt47 ${cls||''}" style="--cc:${C.c}"${on?` onclick="${on}"`:''}><i>${C.i}</i><b>${C.sp?C.v===1&&id==='giullare'?'★':C.v:C.v}</b><small>${esc(C.n)}</small></span>`};
X43P.carte47=()=>{const c=crtFix(),g=CRD.g;let h=`<h3>🃏 Tavolo delle carte · 💰${P.g}</h3>`;
  if(g){const A=CRTA[g.a];h+=`<p class="x43t">Contro <b>${esc(A.n)}</b>${g.bet?' · posta '+g.bet+' oro':''} · mano ${Math.min(5,g.r+(g.end?0:1))} di 5 · <b>${g.sc[0]}</b> a <b>${g.sc[1]}</b></p>`;
    if(g.last){const[a,b,w]=g.last;h+=`<div class="crt47t">${crtCard(a,'',w>0?'win':w<0?'lose':'')}<span class="mu">${w>0?'prendi tu':w<0?'prende lui':'pari'}</span>${crtCard(b,'',w<0?'win':w>0?'lose':'')}</div>`}
    if(g.end)h+=`<p><b>${esc(g.res)}</b></p><button onclick="CRD.g=null;pn('carte47')">Ancora</button>`;
    else h+=`<p class="x43t">Scegli la carta da giocare: 🔥 batte 🌿, 🌿 batte 💧, 💧 batte 🔥 (+3).</p><div class="crt47h">${g.ph.map((id,i)=>crtCard(id,'crtPlay('+i+')','hand')).join('')}</div><p class="x43t">Gli restano ${g.fh.length} carte coperte.</p>`;
    return h+`<button onclick="cl()">Chiudi</button>`}
  if(CRD.view==='col'){const all=crtAll();h+=`<p class="x43t">${crtKinds()} carte diverse su ${all.length} · ${crtCount()} in tutto · vittorie ${c.v|0}, sconfitte ${c.n|0}</p><div class="crt47h">${all.map(id=>c.c[id]>0?crtCard(id,'','')+`<sup>×${c.c[id]}</sup>`:'<span class="crt47 no"><i>?</i></span>').join('')}</div><button onclick="CRD.view='menu';pn('carte47')">Indietro</button><button onclick="cl()">Chiudi</button>`;return h}
  h+=`<p class="x43t">Cinque mani con cinque carte della tua collezione: vince chi ne prende di più. Hai ${crtCount()} carte (${crtKinds()} diverse).</p>
  <div class="srow"><span class="mu">Posta</span> ${CRTB.map(b=>`<button class="${CRD.bet===b?'on':''}" onclick="CRD.bet=${b};pn('carte47')">${b?b+' 💰':'Per gioco'}</button>`).join('')}</div>
  <div class="x43c">${CRTA.map((A,i)=>`<button ${crtKinds()<A.min?'disabled':''} onclick="crtStart(${i})"><b>${esc(A.n)}</b><small>${A.d}${A.min?' · vuole '+A.min+' carte diverse':''}</small><small>${c.w[i]?'Battuto '+c.w[i]+' volte':i?'Prima vittoria: una carta speciale':''}</small></button>`).join('')}</div>
  <button onclick="crtBuy()">🎴 Busta di tre carte · 150 💰</button><button onclick="CRD.view='col';pn('carte47')">📚 Collezione</button><button onclick="cl()">Chiudi</button>`;return h};
// il tavolo: nella taverna e nelle città di Tomorrow
function crtPlace(){if(!ZZ||!started||ents.some(e=>e.k==='carte47'))return;let c=null;if(Zk==='in_tavern')c=[10,10];else if(typeof twOn==='function'&&twOn()&&ZZ.set&&ZZ.shub)c=[ZZ.shub[0]+4,ZZ.shub[1]-4];if(!c)return;const q=spot47(c,2);if(q)ents.push({k:'carte47',px:q[0]+.5,py:q[1]+.5,n:'Tavolo delle carte'})}
const _loadPost747o=loadPost;loadPost=function(k){_loadPost747o(k);try{crtPlace()}catch(e){console.warn('carte',e)}};
ITK.add('carte47');
const _act747o=act;act=function(e){if(e&&e.k==='carte47'){CRD.view='menu';crtFix();pn('carte47');return}_act747o(e)};
const _ent747o=ent;ent=function(e){if(e.k==='carte47'){drawL([[-.05,-.05,0,.1,.1,8,'#5a3a1a'],[-.42,-.42,8,.84,.84,2,'#2a6a3a'],[-.44,-.44,7,.88,.88,1,'#6a4a2a']],e.px,e.py,0);
  [['#e85a2a',-.2,-.1],['#3a8adc',0,-.15],['#4aa84a',.18,.05],['#ffffff',-.05,.15]].forEach(([c,x,y])=>box(e.px+x,e.py+y,10,.14,.2,.3,c));return}_ent747o(e)};
(function(){const st=document.createElement('style');st.textContent=`.crt47{display:inline-flex;flex-direction:column;align-items:center;justify-content:space-between;width:62px;height:88px;margin:3px;padding:4px 2px;border-radius:7px;background:linear-gradient(160deg,#fff8e8,#e8dcc0);color:#2a1a10;border:3px solid var(--cc);box-shadow:0 2px 4px #0006;vertical-align:top;font-family:Georgia,serif}
.crt47 i{font-style:normal;font-size:22px}.crt47 b{font-size:22px;color:var(--cc)}.crt47 small{font-size:9px;text-align:center;line-height:1.1}.crt47.hand{cursor:pointer;transition:transform .12s}.crt47.hand:hover{transform:translateY(-6px)}
.crt47.win{box-shadow:0 0 12px #ffd84a}.crt47.lose{opacity:.55}.crt47.no{background:#ffffff14;border-color:#ffffff30;color:#fff8}.crt47t{display:flex;align-items:center;justify-content:center;gap:14px;margin:6px 0}.crt47h{display:flex;flex-wrap:wrap;justify-content:center;max-height:48vh;overflow:auto}.crt47h sup{margin-left:-10px;font-size:11px}`;document.head.appendChild(st)})();
