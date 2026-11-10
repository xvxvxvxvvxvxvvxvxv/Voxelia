/* ================= 8.6: LE ANIMAZIONI NUOVE DELL'EROE =================
   L'eroe resta quello di sempre (stesso modello, stessi vestiti e armi): si muovono in modo nuovo i pezzi che ha già.
   - DA FERMO: dopo qualche secondo gira la testa e si guarda intorno, ogni tanto si stiracchia; dopo quaranta secondi
     si siede per terra, e si rialza appena tocchi un comando.
   - IN CORSA: il busto si piega in avanti, le braccia oscillano di più e sotto i piedi si alza la polvere.
   - COLPITO: sussulta all'indietro; con i colpi forti barcolla. Quando cade crolla a terra, e al risveglio si rialza.
   - GESTI: si china quando apre un forziere o raccoglie qualcosa, porta la fiaschetta alla bocca quando beve una pozione.
   - EMOTE: saluto, inchino, applauso, danza, esulta, siediti. Dal pulsante 🙂 accanto alla chat o scrivendo in chat
     /saluto, /inchino, /applauso, /danza, /esulta, /siediti. In rete le vedono anche gli altri.
   Nel pannello sviluppatore, la scheda 🎭 Animazioni le prova tutte. */
const AN86={em:'',emT:-9,n:0,auto:0,idle:0,hit:-9,big:0,down:-9,up:-9,act:-9,drk:-9,lx:0,ly:0,dust:0,pend:0};
const EMO86={saluto:{n:'Saluto',ic:'👋',d:2.4},inchino:{n:'Inchino',ic:'🙇',d:1.9},applauso:{n:'Applauso',ic:'👏',d:2.6},danza:{n:'Danza',ic:'💃',d:4.5},esulta:{n:'Esulta',ic:'🙌',d:2.2},siediti:{n:'Siediti',ic:'🧘',d:1e9}};
const anR=q=>q[0]+q[3]/2>.18&&q[2]>5&&q[2]<22,anL=q=>q[0]+q[3]/2<-.25&&q[2]>5&&q[2]<22,anLeg=q=>q[2]<1&&q[5]>3,anUp=q=>q[2]>=8.5,anHd=q=>q[2]>=21;
const anMv=(q,dx,dy,dz)=>[q[0]+dx,q[1]+dy,q[2]+dz,q[3],q[4],q[5],q[6]];
function anEmote(L,k,a){const s=Math.sin,E=Math.min(1,a/.25);
  switch(k){
    case'saluto':return L.map(q=>anR(q)?anMv(q,.07*E,s(a*11)*.07*E,10*E):anHd(q)?anMv(q,.02*E,0,0):q);
    case'inchino':{const b=s(Math.min(1,a/1.9)*Math.PI);return L.map(q=>anUp(q)?anMv(q,0,(q[2]-8)*.016*b,-(q[2]-8)*.42*b):anR(q)||anL(q)?anMv(q,0,.1*b,-2*b):q)}
    case'applauso':{const c=Math.abs(s(a*13));return L.map(q=>anR(q)?anMv(q,-(q[0]-.04)*.75*c*E,.26*E,3.5*E):anL(q)?anMv(q,-(q[0]+.04)*.75*c*E,.26*E,3.5*E):anUp(q)?anMv(q,0,0,c*.6):q)}
    case'danza':{const w=a*8,j=Math.abs(s(w))*3.2,sw=s(a*4)*.06;return L.map(q=>anLeg(q)?[q[0],q[1],q[2]+(q[0]<0?Math.max(0,s(w)):Math.max(0,-s(w)))*4,q[3],q[4],Math.max(1.5,q[5]-(q[0]<0?Math.max(0,s(w)):Math.max(0,-s(w)))*4),q[6]]:anR(q)?anMv(q,sw+.05,0,j+Math.max(0,s(w))*9):anL(q)?anMv(q,sw-.05,0,j+Math.max(0,-s(w))*9):anMv(q,anUp(q)?sw:0,0,j))}
    case'esulta':{const j=Math.abs(s(a*7))*5*E;return L.map(q=>anR(q)||anL(q)?anMv(q,anR(q)?.06:-.06,0,j+11*E):anLeg(q)?[q[0],q[1],q[2]+j,q[3],q[4],q[5],q[6]]:anMv(q,0,0,j))}
    case'siediti':{const d=6.5*E;return L.map(q=>anLeg(q)?[q[0],q[1]+.02,q[2],q[3],q[4]+.3*E,Math.max(2.2,q[5]-d),q[6]]:anR(q)||anL(q)?anMv(q,0,.1*E,-d-1.5*E):anMv(q,0,-.04*E,-d))}}
  return L}
function anApply(L,e,mov){const me=e===P;let em='',ea=0;
  if(me){if(AN86.em){const D=EMO86[AN86.em];ea=t-AN86.emT;if(!D||ea>D.d)AN86.em='';else em=AN86.em}}
  else{const q=NET.peers&&NET.peers[e.id];if(q&&q.em&&q.em[0]){if(e.emN!==q.em[1]){e.emN=q.em[1];e.emT=t}ea=t-(e.emT||0);const D=EMO86[q.em[0]];if(D&&ea<=D.d)em=q.em[0]}}
  if(em&&!mov)return anEmote(L,em,ea);if(!me)return L;
  let a=t-AN86.down;if(a>=0&&a<1.2){const k=Math.min(1,a/.45);return L.map(q=>anLeg(q)?[q[0],q[1],q[2],q[3],q[4]+.25*k,Math.max(1.5,q[5]*(1-.7*k)),q[6]]:[q[0],q[1]-(q[2]-4)*.022*k,Math.max(.5,q[2]*(1-.86*k)),q[3],q[4]+q[5]*.02*k,Math.max(1.2,q[5]*(1-.6*k)),q[6]])}
  a=t-AN86.up;if(a>=0&&a<1.1){const c=1-a/1.1,f=1-.5*c*c;return L.map(q=>anLeg(q)?[q[0],q[1],q[2],q[3],q[4],Math.max(2,q[5]*f),q[6]]:anMv(q,0,.1*c,-q[2]*(1-f)))}
  a=t-AN86.hit;if(a>=0&&a<(AN86.big?.6:.32)){const D=AN86.big?.6:.32,k=Math.sin(a/D*Math.PI),sw=AN86.big?Math.sin(a*22)*.05*k:0;return L.map(q=>anHd(q)?anMv(q,sw,-.17*k,-2*k):anUp(q)?anMv(q,sw,-.11*k,-1.4*k):anR(q)||anL(q)?anMv(q,(anR(q)?.07:-.07)*k,-.05*k,3*k):q)}
  a=t-AN86.drk;if(a>=0&&a<.8){const k=Math.sin(a/.8*Math.PI);return L.map(q=>anR(q)?anMv(q,-.13*k,.12*k,8*k):anHd(q)?anMv(q,0,-.05*k,0):q)}
  a=t-AN86.act;if(a>=0&&a<.5){const k=Math.sin(a/.5*Math.PI);return L.map(q=>anUp(q)?anMv(q,0,(q[2]-8)*.012*k,-(q[2]-8)*.28*k):anR(q)||anL(q)?anMv(q,0,.2*k,-4*k):q)}
  if(typeof HA!=='undefined'&&HA)return L;
  if(mov){if(typeof ACT!=='undefined'&&ACT.run){const s=Math.sin(t*14);return L.map(q=>anHd(q)?anMv(q,0,.1,-.6):anUp(q)?anMv(q,0,.07,-.4):anR(q)?anMv(q,0,.06+s*.13,Math.abs(s)*1.5):anL(q)?anMv(q,0,.06-s*.13,Math.abs(s)*1.5):q)}return L}
  const id=AN86.idle;if(id>4){const lk=Math.sin(t*.7)*Math.min(1,(id-4)/2),st=(id%11)-9.4;let R=L.map(q=>anHd(q)?anMv(q,lk*.035,0,0):q);
    if(st>0&&st<1.5){const k=Math.sin(st/1.5*Math.PI);R=R.map(q=>anR(q)||anL(q)?anMv(q,anR(q)?.05*k:-.05*k,-.03*k,9*k):anUp(q)?anMv(q,0,-.03*k,.8*k):q)}return R}
  return L}
{const h0=heroAnim;heroAnim=function(L,e,mov){L=h0(L,e,mov);try{return anApply(L,e,mov)}catch(_){return L}}}
function emote(k){if(!started||!P||!EMO86[k]||P.hp<=0)return;AN86.em=k;AN86.emT=t;AN86.n++;AN86.auto=0;AN86.idle=0;P.path=[];P.tg=null;const el=$('emo86');if(el)el.hidden=true;if(k==='applauso')for(let i=0;i<6;i++)setTimeout(()=>tone(900+Math.random()*200,.02,'square',.015),i*240);if(k==='esulta')jingle([72,76,79],.07,'triangle')}
{const u0=upd;upd=function(dt){u0(dt);if(!started||!P)return;const mv=Math.abs(P.px-AN86.lx)+Math.abs(P.py-AN86.ly)>.002;AN86.lx=P.px;AN86.ly=P.py;
  const busy=mv||P.tg||(typeof HA!=='undefined'&&HA)||PM||P.sw>0;if(busy){if(mv&&AN86.em)AN86.em='';AN86.idle=0}else if(!AN86.em)AN86.idle+=dt;
  if(AN86.idle>40&&!AN86.em&&SET.anidle!==0){AN86.em='siediti';AN86.emT=t;AN86.n++;AN86.auto=1}
  if(mv&&typeof ACT!=='undefined'&&ACT.run&&cineOK()&&(AN86.dust-=dt)<=0){AN86.dust=.2;try{burst(P.px,P.py,2,['#cdbfa2','#b8a888'],{v:.25,up:18,gr:50,b:0,d:.45,s:3,z:1})}catch(e){}}}}
// quello che fa scattare le animazioni
{const h0=hurtP;hurtP=function(at){const h=P.hp;h0(at);if(P&&P.hp<h){AN86.hit=t;AN86.big=h-P.hp>P.mx*.16?1:0;if(AN86.em){AN86.em=''}AN86.idle=0}}}
{const d0=die;die=function(){AN86.down=t;AN86.pend=1;AN86.em='';d0()}}
{const l0=loadPost;loadPost=function(k){l0(k);if(AN86.pend){AN86.pend=0;AN86.down=-9;AN86.up=t+.5}AN86.idle=0}}
{const a0=act;act=function(e){if(e&&(e.k==='ch'||e.k==='dr'||e.k==='res'||e.k==='lore'||e.k==='shard'||e.k==='tc'||e.k==='dig'))AN86.act=t;return a0(e)}}
{const p0=pot;pot=function(){const n=P?P.pot:0;p0();if(P&&P.pot<n)AN86.drk=t}}
{const s0=syncPack;syncPack=function(){const o=s0()||{};if(AN86.em&&t-AN86.emT<=EMO86[AN86.em].d)o.em=[AN86.em,AN86.n];return o}}
// i comandi: /saluto in chat e il pulsante accanto alla chat
{const c=$('ch');if(c){const k0=c.onkeydown;c.onkeydown=e=>{if(e.key==='Enter'){const v=e.target.value.trim().toLowerCase();if(v[0]==='/'&&EMO86[v.slice(1)]){emote(v.slice(1));e.target.value='';e.target.blur();e.preventDefault();return}}if(k0)k0(e)};
  const w=$('chw');if(w&&!$('emo86b')){w.insertAdjacentHTML('beforeend',`<button id="emo86b" title="Emote" aria-label="Emote" onclick="const p=$('emo86');p.hidden=!p.hidden">🙂</button><div id="emo86" hidden>${Object.entries(EMO86).map(([k,d])=>`<button onclick="emote('${k}')" title="/${k}">${d.ic}<small>${d.n}</small></button>`).join('')}</div>`)}}}
{const s0=setBody;setBody=function(k){let h=s0(k);if(k==='gen')h+=sGrp('Animazioni dell\'eroe',`<div class="row"><label for="s_anidle">Dopo un po' che è fermo, l'eroe si siede</label><input type="checkbox" id="s_anidle" ${SET.anidle!==0?'checked':''} onchange="setv('anidle',this.checked?1:0)"></div>`);return h}}
// nel pannello sviluppatore: la scheda per provarle tutte
function an86Dev(){if(!started||!P)return dv3Need();const B=(n,c)=>`<button onclick="${c};devClose()">${n}</button>`;
  return`<h4>🎭 Emote</h4><div class="dvr"><span>Le vedono anche gli altri in rete</span><span>${Object.entries(EMO86).map(([k,d])=>B(d.ic+' '+d.n,`emote('${k}')`)).join('')}</span></div>
  <h4>⚔ Colpi e cadute</h4><div class="dvr"><span>Colpito</span><span>${B('Colpo leggero','AN86.hit=t;AN86.big=0')}${B('Colpo forte','AN86.hit=t;AN86.big=1')}</span></div><div class="dvr"><span>Caduta e rialzo</span><span>${B('Crolla a terra','AN86.down=t')}${B('Si rialza','AN86.up=t')}</span></div>
  <h4>✋ Gesti</h4><div class="dvr"><span>Gesti</span><span>${B('Si china','AN86.act=t')}${B('Beve','AN86.drk=t')}</span></div>
  <h4>🧍 Da fermo</h4><div class="dvr"><span>Salta l'attesa</span><span>${B('Si guarda intorno','AN86.idle=6')}${B('Si stiracchia','AN86.idle=20.4')}${B('Si siede','AN86.idle=41')}</span></div><p class="mu">La corsa con la polvere si vede correndo (Maiusc).</p>`}
{const b0=devBody;devBody=function(){return DEV.tab==='an86'?an86Dev():b0()}}
{const r0=devRender;devRender=function(){r0();const el=$('devp'),bar=el&&el.querySelector('.dvt');if(!bar||bar.querySelector('[data-an86]'))return;const b=document.createElement('button');b.dataset.an86=1;b.textContent='🎭 Animazioni';b.className=DEV.tab==='an86'?'on':'';b.onclick=()=>{DEV.tab='an86';devRender()};bar.appendChild(b)}}
document.head.insertAdjacentHTML('beforeend',`<style>#emo86b{position:absolute;right:-34px;bottom:0;width:30px;height:30px;padding:0;border-radius:8px;font-size:16px;background:#0b0e18cc;border:1px solid #ffffff33;cursor:pointer}
#emo86{position:absolute;left:0;bottom:36px;display:grid;grid-template-columns:repeat(3,1fr);gap:4px;padding:6px;border-radius:10px;background:#0b0e18ee;border:1px solid #f5b94288;z-index:30}#emo86[hidden]{display:none}#emo86 button{display:flex;flex-direction:column;align-items:center;gap:1px;padding:5px 8px;font-size:18px;min-width:62px}#emo86 small{font-size:10px;opacity:.85}</style>`);
