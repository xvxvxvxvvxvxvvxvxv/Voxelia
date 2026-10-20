/* ================= interfaccia HTML del gioco dentro la realtà virtuale =================
   Nel visore si vede solo il canvas del gioco: HUD, barra, finestre, dialoghi e mappa sono HTML e resterebbero fuori.
   Qui la pagina viene «fotografata» così com'è (stessi stili, stesse icone, stessa disposizione) in un'immagine SVG
   con foreignObject, e la foto è disegnata sopra il canvas prima che diventi lo schermo virtuale.
   La foto si rifà solo quando la pagina cambia (MutationObserver, scorrimento, testo scritto); il pulsante puntato si contorna dal vivo;
   al massimo una ogni XU.min ms; i canvas dell'interfaccia (minimappa, orologio…) invece si copiano dal vivo a ogni fotogramma.
   Coordinate: pixel CSS della pagina, le stesse che usano i clic dei controller (document.elementFromPoint). */
const XU={v:0,sc:0,rc:0,mo:null,dirty:1,busy:0,t:0,min:90,img:null,c:null,w:0,h:0,live:[],hov:null,ok:new WeakMap(),src:new Map(),css:'',cssK:''};

// tutti i fogli di stile della pagina, con :hover reso anche come classe (l'elemento puntato dal controller la riceve)
function xuCss(){const sh=[...document.styleSheets],k=sh.length+':'+[...document.querySelectorAll('style')].reduce((n,s)=>n+s.textContent.length,0);
  if(k===XU.cssK)return XU.css;let t='';
  for(const s of sh){let r='';try{r=[...s.cssRules].map(x=>x.cssText).join('\n')}catch(e){r=s.ownerNode&&s.ownerNode.textContent||''}t+=r+'\n'}
  XU.cssK=k;return XU.css=t.replace(/:hover\b/g,'.xrh')+'\nbody{background:transparent!important;margin:0!important;overflow:hidden!important}video{visibility:hidden!important}'+
    // nella foto le animazioni ripartirebbero da zero (finestre trasparenti): si mostrano già concluse
    '*,*::before,*::after{animation-delay:-60s!important;transition:none!important}'}

// immagini non incorporate (per esempio blob: o file del server): una foto SVG non può caricarle, quindi diventano data URL
function xuSrc(im){const u=im.currentSrc||im.src||'';if(!u||u.startsWith('data:'))return u;if(XU.src.has(u))return XU.src.get(u);
  let d='';if(im.complete&&im.naturalWidth)try{const c=document.createElement('canvas');c.width=im.naturalWidth;c.height=im.naturalHeight;c.getContext('2d').drawImage(im,0,0);d=c.toDataURL()}catch(e){d=''}
  if(im.complete)XU.src.set(u,d);return d}

// il canvas va copiato dal vivo se si vede (nessun elemento sopra il suo centro e i suoi angoli) e non è «sporcato» da immagini di altri siti
function xuLive(c,r){if(!c.width||!c.height||r.width<2||r.height<2)return 0;
  if(!XU.ok.has(c)){let ok=1;try{const x=c.getContext('2d');if(x)x.getImageData(0,0,1,1);else c.toDataURL('image/png').length}catch(e){ok=0}XU.ok.set(c,ok)}
  if(!XU.ok.get(c))return 0;
  for(const[fx,fy]of[[.5,.5],[.1,.1],[.9,.1],[.1,.9],[.9,.9]]){const e=document.elementFromPoint(r.left+r.width*fx,r.top+r.height*fy);if(e&&e!==c&&e!==cv&&!e.contains(c))return 0}
  return 1}

// copia di un elemento visibile con i suoi figli visibili: valori dei campi, scorrimento e :hover diventano attributi o stili
function xuClone(el,hov){const t=el.tagName;
  if(t==='SCRIPT'||t==='STYLE'||t==='LINK'||t==='TEMPLATE'||t==='VIDEO'||t==='AUDIO'||t==='IFRAME'||el===cv)return null;
  if(el.hidden||t!=='OPTION'&&t!=='OPTGROUP'&&!el.getClientRects().length)return null;
  if(t==='CANVAS'){const r=el.getBoundingClientRect(),k=el.cloneNode(false);
    // visibile: copia vuota (trasparente) e il canvas vero si disegna sopra; coperto in parte: una foto ferma del suo contenuto
    if(xuLive(el,r)){XU.live.push({c:el,x:r.left+el.clientLeft,y:r.top+el.clientTop,w:el.clientWidth||r.width,h:el.clientHeight||r.height});return k}
    if(!XU.ok.get(el))return k;const im=document.createElementNS('http://www.w3.org/1999/xhtml','img');
    for(const a of['id','class','style'])if(el.hasAttribute(a))im.setAttribute(a,el.getAttribute(a));
    try{im.setAttribute('src',el.toDataURL())}catch(e){return k}im.style.width=r.width+'px';im.style.height=r.height+'px';return im}
  const k=el.cloneNode(false);
  if(t==='IMG'){const s=xuSrc(el);if(s)k.setAttribute('src',s);else k.removeAttribute('src');k.removeAttribute('srcset')}
  else if(t==='INPUT'){if(el.type==='checkbox'||el.type==='radio'){if(el.checked)k.setAttribute('checked','');else k.removeAttribute('checked')}else k.setAttribute('value',el.value)}
  else if(t==='OPTION'){if(el.selected)k.setAttribute('selected','');else k.removeAttribute('selected')}
  if(hov&&hov.has(el))k.classList.add('xrh');
  if(t==='TEXTAREA'){k.textContent=el.value;return k}
  const sx=el.scrollLeft,sy=el.scrollTop;
  for(let n=el.firstChild;n;n=n.nextSibling){
    if(n.nodeType===3)k.appendChild(n.cloneNode(false));
    else if(n.nodeType===1){const c=xuClone(n,hov);if(!c)continue;
      // lo scorrimento non passa nella copia: i figli si spostano della stessa quantità
      if(sx||sy)c.style.translate=`${-sx}px ${-sy}px`;k.appendChild(c)}}
  return k}

function xuSnap(){const w=W,h=H;if(!w||!h)return;XU.busy=1;XU.dirty=0;XU.t=performance.now();XU.live=[];
  // il pulsante puntato non entra nella foto: lo evidenzia xuHi dal vivo, così muovere il raggio non costa una foto nuova
  const hov=null;
  const b=document.createElementNS('http://www.w3.org/1999/xhtml','body');b.className=document.body.className;
  const st=document.createElementNS('http://www.w3.org/1999/xhtml','style');st.textContent=xuCss();b.appendChild(st);
  for(let n=document.body.firstChild;n;n=n.nextSibling){if(n.nodeType===1){const c=xuClone(n,hov);if(c)b.appendChild(c)}else if(n.nodeType===3&&n.nodeValue.trim())b.appendChild(n.cloneNode(false))}
  b.setAttribute('style',`width:${w}px;height:${h}px`);
  const de=document.documentElement,at=['lang','class','data-theme','style'].map(a=>de.hasAttribute(a)?` ${a}="${de.getAttribute(a).replace(/&/g,'&amp;').replace(/"/g,'&quot;')}"`:'').join('');
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"${at}><foreignObject x="0" y="0" width="${w}" height="${h}">${new XMLSerializer().serializeToString(b)}</foreignObject></svg>`;
  // risoluzione della foto: al massimo 1,25 pixel per pixel CSS (nel visore basta e la foto costa la metà)
  const k=Math.min(DPR,1.25),im=new Image(),pw=Math.max(1,w*k|0),ph=Math.max(1,h*k|0);XU.sc=performance.now()-XU.t;
  im.onload=()=>{XU.busy=0;if(!XU.c)XU.c=document.createElement('canvas');const c=XU.c;if(c.width!==pw||c.height!==ph){c.width=pw;c.height=ph}
    XU.lt=performance.now()-XU.lt;const x=c.getContext('2d'),t1=performance.now();x.clearRect(0,0,pw,ph);try{x.drawImage(im,0,0,pw,ph);XU.w=w;XU.h=h;XU.v++}catch(e){XU.w=0}
    // il disegno della foto (dove il browser la impagina davvero) è la parte che costa: più costa, più di rado si rifà
    XU.rc=performance.now()-t1;XU.min=clamp((XU.sc+XU.rc)*4+XU.lt,90,1000)};
  im.onerror=()=>{XU.busy=0};
  XU.lt=performance.now();im.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
}

function xuWatch(){if(XU.mo)return;
  XU.mo=new MutationObserver(R=>{for(const r of R)if(!xuVar(r)){XU.dirty=1;return}});XU.mo.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeOldValue:true,characterData:true});
  for(const e of['scroll','input','change'])document.addEventListener(e,xuMark,true)}
function xuUnwatch(){if(!XU.mo)return;XU.mo.disconnect();XU.mo=null;for(const e of['scroll','input','change'])document.removeEventListener(e,xuMark,true);XU.c=null;XU.w=0;XU.live=[];XU.src.clear()}
function xuMark(){XU.dirty=1}
// è cambiata solo una variabile CSS nello stile (la ruota delle azioni la aggiorna a ogni fotogramma): non serve una foto nuova
const xuNoVar=v=>(v||'').replace(/--[\w-]+\s*:[^;]*;?/g,'').replace(/\s+/g,'');
const xuVar=r=>r.type==='attributes'&&r.attributeName==='style'&&xuNoVar(r.oldValue)===xuNoVar(r.target.getAttribute('style'));
// i pulsanti puntati dai controller, contornati dal vivo (posizione vera nella pagina, quella che riceve il clic)
function xuHiL(){const L=[];for(const st of XR.src.values()){const r=st.ray,h=r&&r.h;if(!h||!h.in)continue;const e=r.ck!==undefined?r.ck:xrClickable(xrTarget(h.x,h.y));if(e&&e.isConnected&&!L.includes(e))L.push(e)}return L}
function xuHi(x,k,L=xuHiL()){if(!L.length)return;x.save();x.setTransform(k,0,0,k,0,0);x.globalAlpha=1;x.lineWidth=3;x.strokeStyle='#ffd84a';x.shadowColor='rgba(255,216,74,.9)';x.shadowBlur=10;
  for(const e of L){if(!e.isConnected)continue;const b=e.getBoundingClientRect();if(b.width<1||b.height<1)continue;x.strokeRect(b.left-2,b.top-2,b.width+4,b.height+4)}
  x.restore()}

// chiamata dalla VR (src/8zf_xr.js) a ogni fotogramma disegnato, con il contesto 2D del canvas del gioco
function xrUiDraw(g){if(!XR.s){xuUnwatch();return}xuWatch();
  const now=performance.now();
  if(XU.w!==W||XU.h!==H||now-XU.t>2000)XU.dirty=1;
  if(XU.dirty&&!XU.busy&&now-XU.t>=XU.min)xuSnap();
  if(!XU.c||!XU.w)return;
  g.save();g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.globalCompositeOperation='source-over';g.filter='none';g.imageSmoothingEnabled=true;
  g.drawImage(XU.c,0,0,g.canvas.width,g.canvas.height);
  g.setTransform(DPR,0,0,DPR,0,0);
  for(const l of XU.live)if(l.c.isConnected)try{g.drawImage(l.c,l.x,l.y,l.w,l.h)}catch(e){}
  g.restore();xuHi(g,DPR)}
