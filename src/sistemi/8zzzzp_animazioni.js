/* ================= 8.6: LE ANIMAZIONI NUOVE DELL'EROE =================
   L'eroe resta quello di sempre (stesso modello, stessi vestiti e armi). Poche animazioni, semplici e pulite: il corpo
   si muove tutto insieme, senza pezzi che si staccano.
   - DA FERMO: dopo qualche secondo gira la testa e si guarda intorno.
   - IN CORSA: il busto si piega in avanti e sotto i piedi si alza la polvere.
   - COLPITO: tutto il busto sussulta all'indietro; con i colpi forti barcolla.
   - GESTI: si accovaccia quando apre un forziere o raccoglie qualcosa, alza la fiaschetta quando beve una pozione.
   - EMOTE: saluto ed esulta. Dal pulsante 🙂 accanto alla chat o scrivendo in chat /saluto, /esulta. In rete le
     vedono anche gli altri.
   (La prima 8.6 aveva anche inchino, applauso, danza, seduta, stiracchiata e la caduta a terra: con un modello fatto
    di pochi blocchi venivano confuse, e sono state tolte.)
   Nel pannello sviluppatore, la scheda 🎭 Animazioni le prova tutte. */
const AN86={em:'',emT:-9,n:0,auto:0,idle:0,hit:-9,big:0,down:-9,up:-9,act:-9,drk:-9,lx:0,ly:0,dust:0,pend:0};
const EMO86={saluto:{n:'Saluto',ic:'👋',d:2.2},esulta:{n:'Esulta',ic:'🙌',d:2}};
const anR=q=>q[0]+q[3]/2>.18&&q[2]>5&&q[2]<22,anL=q=>q[0]+q[3]/2<-.25&&q[2]>5&&q[2]<22,anLeg=q=>q[2]<1&&q[5]>3,anUp=q=>q[2]>=8.5,anHd=q=>q[2]>=21;
const anMv=(q,dx,dy,dz)=>[q[0]+dx,q[1]+dy,q[2]+dz,q[3],q[4],q[5],q[6]];
// si accovaccia: le gambe si accorciano e tutto il resto scende insieme
const anSq=(L,d)=>L.map(q=>anLeg(q)?[q[0],q[1],q[2],q[3],q[4],Math.max(2,q[5]-d),q[6]]:anMv(q,0,0,-Math.min(d,7)));
function anEmote(L,k,a,D){const s=Math.sin,E=Math.min(1,a/.2)*Math.min(1,Math.max(0,(D-a)/.2));
  if(k==='saluto')return L.map(q=>anR(q)?anMv(q,.03*E+s(a*9)*.05*E,0,8*E):q);
  if(k==='esulta'){const ph=(a*1.6)%1,j=ph<.6?s(ph/.6*Math.PI)*6*E:0,cr=ph>=.6?s((ph-.6)/.4*Math.PI)*1.6*E:0;return anSq(L,cr).map(q=>anR(q)||anL(q)?anMv(q,0,0,j+8*E):anMv(q,0,0,j))}
  return L}
function anApply(L,e,mov){const me=e===P;let em='',ea=0;
  if(me){if(AN86.em){const D=EMO86[AN86.em];ea=t-AN86.emT;if(!D||ea>D.d)AN86.em='';else em=AN86.em}}
  else{const q=NET.peers&&NET.peers[e.id];if(q&&q.em&&q.em[0]){if(e.emN!==q.em[1]){e.emN=q.em[1];e.emT=t}ea=t-(e.emT||0);const D=EMO86[q.em[0]];if(D&&ea<=D.d)em=q.em[0]}}
  if(em&&!mov)return anEmote(L,em,ea,EMO86[em].d);if(!me)return L;
  let a=t-AN86.hit;if(a>=0&&a<(AN86.big?.5:.28)){const D=AN86.big?.5:.28,k=Math.sin(a/D*Math.PI),sw=AN86.big?Math.sin(a*24)*.04*k:0;return L.map(q=>anLeg(q)?q:anMv(q,sw,-.06*k,-.8*k))}
  a=t-AN86.drk;if(a>=0&&a<.7){const k=Math.sin(a/.7*Math.PI);return L.map(q=>anR(q)?anMv(q,-.05*k,.06*k,7*k):q)}
  a=t-AN86.act;if(a>=0&&a<.45)return anSq(L,Math.sin(a/.45*Math.PI)*4);
  if(typeof HA!=='undefined'&&HA)return L;
  if(mov){if(typeof ACT!=='undefined'&&ACT.run)return L.map(q=>anHd(q)?anMv(q,0,.09,-.5):anUp(q)?anMv(q,0,.06,-.3):q);return L}
  const id=AN86.idle;if(id>4&&SET.anidle!==0){const lk=Math.sin(t*.7)*Math.min(1,(id-4)/2);return L.map(q=>anHd(q)?anMv(q,lk*.035,0,0):q)}
  return L}
{const h0=heroAnim;heroAnim=function(L,e,mov){L=h0(L,e,mov);try{return anApply(L,e,mov)}catch(_){return L}}}
function emote(k){if(!started||!P||!EMO86[k]||P.hp<=0)return;AN86.em=k;AN86.emT=t;AN86.n++;AN86.auto=0;AN86.idle=0;P.path=[];P.tg=null;const el=$('emo86');if(el)el.hidden=true;if(k==='esulta')jingle([72,76,79],.07,'triangle')}
{const u0=upd;upd=function(dt){u0(dt);if(!started||!P)return;const mv=Math.abs(P.px-AN86.lx)+Math.abs(P.py-AN86.ly)>.002;AN86.lx=P.px;AN86.ly=P.py;
  const busy=mv||P.tg||(typeof HA!=='undefined'&&HA)||PM||P.sw>0;if(busy){if(mv&&AN86.em)AN86.em='';AN86.idle=0}else if(!AN86.em)AN86.idle+=dt;
  if(mv&&typeof ACT!=='undefined'&&ACT.run&&cineOK()&&(AN86.dust-=dt)<=0){AN86.dust=.2;try{burst(P.px,P.py,2,['#cdbfa2','#b8a888'],{v:.25,up:18,gr:50,b:0,d:.45,s:3,z:1})}catch(e){}}}}
// quello che fa scattare le animazioni
{const h0=hurtP;hurtP=function(at){const h=P.hp;h0(at);if(P&&P.hp<h){AN86.hit=t;AN86.big=h-P.hp>P.mx*.16?1:0;if(AN86.em){AN86.em=''}AN86.idle=0}}}
{const d0=die;die=function(){AN86.em='';d0()}}
{const l0=loadPost;loadPost=function(k){l0(k);AN86.idle=0}}
{const a0=act;act=function(e){if(e&&(e.k==='ch'||e.k==='dr'||e.k==='res'||e.k==='lore'||e.k==='shard'||e.k==='tc'||e.k==='dig'))AN86.act=t;return a0(e)}}
{const p0=pot;pot=function(){const n=P?P.pot:0;p0();if(P&&P.pot<n)AN86.drk=t}}
{const s0=syncPack;syncPack=function(){const o=s0()||{};if(AN86.em&&t-AN86.emT<=EMO86[AN86.em].d)o.em=[AN86.em,AN86.n];return o}}
// i comandi: /saluto in chat e il pulsante accanto alla chat
{const c=$('ch');if(c){const k0=c.onkeydown;c.onkeydown=e=>{if(e.key==='Enter'){const v=e.target.value.trim().toLowerCase();if(v[0]==='/'&&EMO86[v.slice(1)]){emote(v.slice(1));e.target.value='';e.target.blur();e.preventDefault();return}}if(k0)k0(e)};
  const w=$('chw');if(w&&!$('emo86b')){w.insertAdjacentHTML('beforeend',`<button id="emo86b" title="Emote" aria-label="Emote" onclick="const p=$('emo86');p.hidden=!p.hidden">🙂</button><div id="emo86" hidden>${Object.entries(EMO86).map(([k,d])=>`<button onclick="emote('${k}')" title="/${k}">${d.ic}<small>${d.n}</small></button>`).join('')}</div>`)}}}
{const s0=setBody;setBody=function(k){let h=s0(k);if(k==='gen')h+=sGrp('Animazioni dell\'eroe',`<div class="row"><label for="s_anidle">Da fermo, l'eroe si guarda intorno</label><input type="checkbox" id="s_anidle" ${SET.anidle!==0?'checked':''} onchange="setv('anidle',this.checked?1:0)"></div>`);return h}}
// nel pannello sviluppatore: la scheda per provarle tutte
function an86Dev(){if(!started||!P)return dv3Need();const B=(n,c)=>`<button onclick="${c};devClose()">${n}</button>`;
  return`<h4>🎭 Emote</h4><div class="dvr"><span>Le vedono anche gli altri in rete</span><span>${Object.entries(EMO86).map(([k,d])=>B(d.ic+' '+d.n,`emote('${k}')`)).join('')}</span></div>
  <h4>⚔ Colpi</h4><div class="dvr"><span>Colpito</span><span>${B('Colpo leggero','AN86.hit=t;AN86.big=0')}${B('Colpo forte','AN86.hit=t;AN86.big=1')}</span></div>
  <h4>✋ Gesti</h4><div class="dvr"><span>Gesti</span><span>${B('Si accovaccia','AN86.act=t')}${B('Beve','AN86.drk=t')}</span></div>
  <h4>🧍 Da fermo</h4><div class="dvr"><span>Salta l'attesa</span><span>${B('Si guarda intorno','AN86.idle=6')}</span></div><p class="mu">La corsa con la polvere si vede correndo (Maiusc).</p>`}
{const b0=devBody;devBody=function(){return DEV.tab==='an86'?an86Dev():b0()}}
{const r0=devRender;devRender=function(){r0();const el=$('devp'),bar=el&&el.querySelector('.dvt');if(!bar||bar.querySelector('[data-an86]'))return;const b=document.createElement('button');b.dataset.an86=1;b.textContent='🎭 Animazioni';b.className=DEV.tab==='an86'?'on':'';b.onclick=()=>{DEV.tab='an86';devRender()};bar.appendChild(b)}}
document.head.insertAdjacentHTML('beforeend',`<style>#emo86b{position:absolute;right:-34px;bottom:0;width:30px;height:30px;padding:0;border-radius:8px;font-size:16px;background:#0b0e18cc;border:1px solid #ffffff33;cursor:pointer}
#emo86{position:absolute;left:0;bottom:36px;display:grid;grid-template-columns:repeat(2,1fr);gap:4px;padding:6px;border-radius:10px;background:#0b0e18ee;border:1px solid #f5b94288;z-index:30}#emo86[hidden]{display:none}#emo86 button{display:flex;flex-direction:column;align-items:center;gap:1px;padding:5px 8px;font-size:18px;min-width:62px}#emo86 small{font-size:10px;opacity:.85}</style>`);
