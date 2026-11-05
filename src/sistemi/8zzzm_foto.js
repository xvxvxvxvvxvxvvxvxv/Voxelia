/* ================= 7.47: la modalità foto =================
   Tasto F8 (o 📷 nel Diario): sparisce tutto quello che copre il mondo e resta una barra in basso. L'eroe si mette in posa
   (saluto, vittoria, pensieroso, seduto, inchino, salto), si sceglie un filtro (seppia, bianco e nero, vivido, sogno,
   notte, tramonto) e una cornice, e si scatta: in 2D e in 3D. La foto si scarica subito e resta nella galleria del browser
   (le ultime dodici). In rete, con il plugin «foto», si può anche appendere nella Galleria del server, dove la vedono
   tutti (anche dalla pagina web del plugin). */
const FT={on:0,pose:'',fil:'',fr:1,last:null,tab:'mie',srv:null};
const FTPOSE={'':'Nessuna',saluto:'👋 Saluto',vittoria:'🙌 Vittoria',pensa:'🤔 Pensieroso',seduto:'🪑 Seduto',inchino:'🙇 Inchino',salto:'🤸 Salto'};
const FTFIL={'':['Naturale',''],seppia:['Seppia','sepia(.85) contrast(1.05)'],bn:['Bianco e nero','grayscale(1) contrast(1.15)'],vivido:['Vivido','saturate(1.6) contrast(1.1)'],
  sogno:['Sogno','saturate(1.3) brightness(1.12) blur(.6px) hue-rotate(-12deg)'],notte:['Notte','brightness(.7) saturate(.7) hue-rotate(180deg) sepia(.2) hue-rotate(160deg)'],tramonto:['Tramonto','sepia(.35) saturate(1.5) hue-rotate(-18deg) brightness(1.05)']};
const FTK='voxelia_foto47';
// la posa: lavora sulla posizione dei pezzi del modello, come le animazioni delle abilità
{const hp0=heroPose;heroPose=function(L){L=hp0(L);if(!FT.on||!FT.pose||HA)return L;const p=FT.pose,w=Math.sin(t*8),isR=q=>q[0]+q[3]/2>.18&&q[2]>5,isL=q=>q[0]+q[3]/2<-.25&&q[2]>5&&q[2]<22,leg=q=>q[2]<1&&q[5]>3,up=q=>q[2]>=8.5;
  const M=f=>L.map(q=>f(q)||q);
  if(p==='saluto')return M(q=>isR(q)?[q[0]+.06,q[1]+w*.05,q[2]+10,q[3],q[4],q[5],q[6]]:null);
  if(p==='vittoria'){const b=Math.abs(Math.sin(t*3))*1.5;return L.map(q=>isR(q)||isL(q)?[q[0]+(isR(q)?.05:-.05),q[1],q[2]+11+b,q[3],q[4],q[5],q[6]]:[q[0],q[1],q[2]+b,q[3],q[4],q[5],q[6]])}
  if(p==='pensa')return M(q=>isR(q)?[q[0]-.12,q[1]+.12,q[2]+6,q[3],q[4],q[5],q[6]]:up(q)?[q[0],q[1],q[2]-.6,q[3],q[4],q[5],q[6]]:null);
  if(p==='seduto')return L.map(q=>leg(q)?[q[0],q[1]+.12,q[2],q[3],q[4]+.08,q[5]*.35,q[6]]:[q[0],q[1],Math.max(0,q[2]-5),q[3],q[4],q[5],q[6]]);
  if(p==='inchino')return M(q=>up(q)?[q[0],q[1]+.16*Math.min(1,(q[2]-8)/8+.5),q[2]-3,q[3],q[4],q[5],q[6]]:null);
  if(p==='salto'){const j=Math.abs(Math.sin(t*4))*12;return L.map(q=>[q[0],q[1],q[2]+j,q[3],q[4],q[5],q[6]])}return L}}
function ftToggle(on){FT.on=on==null?!FT.on:!!on;document.body.classList.toggle('foto47',!!FT.on);if(FT.on&&PM)cl();ftBar();ftFilter();if(!FT.on){FT.pose=''}}
function ftFilter(){const f=FT.on&&FTFIL[FT.fil]?FTFIL[FT.fil][1]:'';for(const c of [$('c'),$('c3')])if(c)c.style.filter=f}
function ftBar(){let el=$('ft47');if(!FT.on){if(el)el.hidden=true;return}if(!el){el=document.createElement('div');el.id='ft47';document.body.appendChild(el)}el.hidden=false;
  el.innerHTML=`<div><b>📷 Foto</b> <span class="mu">Posa</span> ${Object.keys(FTPOSE).map(k=>`<button class="${FT.pose===k?'on':''}" onclick="FT.pose='${k}';ftBar()">${FTPOSE[k]}</button>`).join('')}</div>
  <div><span class="mu">Filtro</span> ${Object.keys(FTFIL).map(k=>`<button class="${FT.fil===k?'on':''}" onclick="FT.fil='${k}';ftFilter();ftBar()">${FTFIL[k][0]}</button>`).join('')}
  <button class="${FT.fr?'on':''}" onclick="FT.fr=FT.fr?0:1;ftBar()">🖼 Cornice</button><button class="big" onclick="ftShoot()">📸 Scatta</button><button onclick="ftToggle(0);FT.tab='mie';pn('foto47')">Galleria</button><button onclick="ftToggle(0)">✕ Esci (F8)</button></div>`}
// lo scatto: il mondo (3D sotto, 2D sopra), con filtro, cornice e didascalia
function ftShot(maxW,q){const a=$('c'),b=typeof D3!=='undefined'&&D3.act&&D3.cv;if(b&&typeof d3Frame==='function')try{d3Frame()}catch(_){}
  const W0=a.width,H0=a.height,k=Math.min(1,(maxW||W0)/W0),w=Math.round(W0*k),h=Math.round(H0*k),o=document.createElement('canvas');o.width=w;o.height=h;const x=o.getContext('2d');
  x.fillStyle='#000';x.fillRect(0,0,w,h);const f=FTFIL[FT.fil]?FTFIL[FT.fil][1]:'';try{x.filter=f||'none'}catch(_){}if(b)x.drawImage(b,0,0,w,h);x.drawImage(a,0,0,w,h);try{x.filter='none'}catch(_){}
  if(FT.fr){const gr=x.createRadialGradient(w/2,h/2,Math.min(w,h)*.35,w/2,h/2,Math.max(w,h)*.72);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(1,'rgba(0,0,0,.55)');x.fillStyle=gr;x.fillRect(0,0,w,h);
    const s=Math.max(10,Math.round(h*.028));x.strokeStyle='#f5e6c0';x.lineWidth=Math.max(2,s*.25);x.strokeRect(s,s,w-2*s,h-2*s);
    x.font='bold '+Math.round(s*1.15)+'px Georgia,serif';x.fillStyle='#fff4d8';x.shadowColor='#000';x.shadowBlur=s*.4;x.textBaseline='bottom';
    const zn=(()=>{try{return zname(Zk)}catch(_){return ZZ&&ZZ.n||''}})();x.fillText(zn+' · '+new Date().toLocaleDateString('it-IT',{day:'numeric',month:'long',year:'numeric'}),s*2,h-s*1.6);x.textAlign='right';x.fillText('Voxelia',w-s*2,h-s*1.6);x.shadowBlur=0}
  return o.toDataURL('image/jpeg',q||.9)}
function ftShoot(){if(!FT.on)return;let big,sm;try{big=ftShot(1920,.9);for(const[w,q]of[[560,.72],[480,.65],[420,.55],[360,.5]]){sm=ftShot(w,q);if(sm.length<58000)break}}catch(e){msg('Non riesco a scattare questa foto');console.warn(e);return}
  const zn=(()=>{try{return zname(Zk)}catch(_){return''}})(),id=uid(),ph={id,at:Date.now(),zn,img:sm};FT.last={id,big,zn};
  const L=ftList();L.unshift(ph);while(L.length>12)L.pop();try{LS.set(FTK,L)}catch(_){L.length=Math.min(L.length,6);try{LS.set(FTK,L)}catch(__){}}
  const fl=document.createElement('div');fl.className='ft47f';document.body.appendChild(fl);setTimeout(()=>fl.remove(),500);tone(1400,.04,'square',.05);setTimeout(()=>tone(900,.06,'square',.04),60);
  ftToggle(0);FT.tab='nuova';pn('foto47')}
// nella galleria del browser c'è la foto piccola, sotto i 58 KB: è quella che si manda alla Galleria del server (un messaggio sta sotto i 64 KB)
const ftList=()=>{try{const L=LS.get(FTK,[]);return Array.isArray(L)?L:[]}catch(_){return[]}};
const ftName=p=>'voxelia_foto_'+new Date(p.at||Date.now()).toISOString().slice(0,16).replace(/[:T]/g,'-')+'.jpg';
function ftDel(id){const L=ftList().filter(p=>p.id!==id);LS.set(FTK,L);pn('foto47')}
function ftUp(id){const p=ftList().find(q=>q.id===(id==='nuova'&&FT.last?FT.last.id:id));if(!p)return;if(!(NET.ok&&typeof VXP!=='undefined')){msg('Serve la partita in rete');return}
  if(!p.img||p.img.length>58000){msg('La foto è troppo grande da mandare');return}VXP.send('foto','up',{img:p.img,zn:String(p.zn||'').slice(0,40)});msg('Foto mandata alla Galleria del server');FT.sent=FT.sent||{};FT.sent[p.id]=1;pn('foto47')}
if(typeof VXP!=='undefined')VXP.on('foto','list',d=>{FT.srv=d&&Array.isArray(d.L)?d.L:[];if(PM==='foto47'&&FT.tab==='srv')pn('foto47')});
X43P.foto47=()=>{const L=ftList(),tab=FT.tab,net=typeof NET!=='undefined'&&NET.ok;
  let h=`<h3>🖼 Galleria delle foto</h3><div class="srow"><button onclick="cl();ftToggle(1)">📷 Modalità foto (F8)</button><button class="${tab!=='srv'?'on':''}" onclick="FT.tab='mie';pn('foto47')">Le mie · ${L.length}</button>${net?`<button class="${tab==='srv'?'on':''}" onclick="FT.tab='srv';FT.srv=null;VXP.send('foto','list',{});pn('foto47')">Galleria del server</button>`:''}</div>`;
  if(tab==='nuova'&&FT.last){h+=`<p class="x43t">Ecco la tua foto!</p><img class="ft47i" src="${FT.last.big}" alt="Foto"><div class="srow"><a class="btn" download="${ftName({at:Date.now()})}" href="${FT.last.big}">⬇ Scarica</a>${net?`<button ${FT.sent&&FT.sent[FT.last.id]?'disabled':''} onclick="ftUp('nuova')">📤 Appendi nella Galleria del server</button>`:''}<button onclick="cl();ftToggle(1)">Un'altra</button></div>`}
  else if(tab==='srv'){h+=FT.srv==null?'<p class="mu">Apro la galleria…</p>':FT.srv.length?`<div class="ft47g">${FT.srv.map(p=>`<figure><a href="/plugins/foto/img?id=${encodeURIComponent(p.id)}" target="_blank"><img loading="lazy" src="/plugins/foto/img?id=${encodeURIComponent(p.id)}" alt=""></a><figcaption><b>${esc(p.n)}</b> · ${esc(p.zn||'')}</figcaption></figure>`).join('')}</div>`:'<p class="mu">Nella galleria del server non c\'è ancora nessuna foto.</p>'}
  else h+=L.length?`<div class="ft47g">${L.map(p=>`<figure><img src="${p.img}" alt=""><figcaption>${esc(p.zn||'')} · ${new Date(p.at).toLocaleDateString('it-IT')}<br><a download="${ftName(p)}" href="${p.img}">⬇</a> ${net?`<button ${FT.sent&&FT.sent[p.id]?'disabled':''} onclick="ftUp('${p.id}')">📤</button>`:''} <button onclick="ftDel('${p.id}')">✕</button></figcaption></figure>`).join('')}</div>`:'<p class="mu">Nessuna foto ancora: premi F8 e scatta!</p>';
  return h+`<button onclick="cl()">Chiudi</button>`};
addEventListener('keydown',e=>{if(!started||e.target&&/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)||e.repeat)return;if(e.key==='F8'){ftToggle();e.preventDefault()}else if(FT.on&&e.key==='Escape'){ftToggle(0);e.preventDefault();e.stopImmediatePropagation()}},true);
{const p0=pn;pn=function(m,arg){if(FT.on&&m)ftToggle(0);p0(m,arg);if(m==='dia'&&PM==='dia'){const pe=$('pn');if(pe&&!pe.querySelector('.ft47b'))pe.insertAdjacentHTML('afterbegin',`<button class="ft47b" onclick="FT.tab='mie';pn('foto47')">📷 Foto e galleria</button>`)}}}
(function(){const st=document.createElement('style');st.textContent=`body.foto47>*:not(#c):not(#c3):not(#ft47):not(script):not(style):not(.ft47f){visibility:hidden!important}
#ft47{position:fixed;left:50%;bottom:12px;transform:translateX(-50%);z-index:60;background:rgba(14,16,24,.88);border:1px solid #ffd27a;border-radius:12px;padding:6px 10px;font:13px Georgia,serif;color:#fff;max-width:96vw;display:flex;flex-direction:column;gap:4px}
#ft47[hidden]{display:none!important}#ft47 div{display:flex;flex-wrap:wrap;gap:4px;align-items:center}#ft47 button{padding:3px 8px;font-size:12px;margin:0}#ft47 button.on{outline:2px solid #ffd27a;background:#3b4770}#ft47 button.big{font-size:15px;background:#8a3b12;font-weight:bold}
.ft47f{position:fixed;inset:0;background:#fff;z-index:99;pointer-events:none;animation:ft47f .45s ease-out forwards}@keyframes ft47f{to{opacity:0}}
.ft47i{width:100%;max-height:52vh;object-fit:contain;border-radius:6px;border:1px solid #ffffff30}.ft47g{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px;max-height:56vh;overflow:auto;margin:6px 0}
.ft47g figure{margin:0;background:#ffffff10;border-radius:6px;padding:4px}.ft47g img{width:100%;border-radius:4px;display:block}.ft47g figcaption{font-size:11px;opacity:.9;padding:2px}.ft47g button{padding:0 5px;font-size:11px;margin:0}.ft47b{width:100%;margin-bottom:6px}a.btn{display:inline-block;padding:5px 10px;background:#3b4770;border-radius:6px;color:#fff;text-decoration:none}`;document.head.appendChild(st)})();
