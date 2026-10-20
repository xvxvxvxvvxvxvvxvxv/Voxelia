/* ================= realtà virtuale (WebXR) per Meta Quest 3 =================
   Nel browser del Quest il pulsante «Entra in VR» apre una sessione immersive-vr. Il gioco continua a disegnare il suo canvas
   (stesse immagini, stessa interfaccia): il canvas diventa lo schermo di una grande finestra sospesa davanti al giocatore,
   ridisegnata dal visore a ogni fotogramma, così muovendo la testa l'immagine resta ferma e non dà nausea.
   I controller puntano lo schermo come un mouse (grilletto = clic) e le levette muovono l'eroe come WASD.
   Serve una pagina sicura (https o localhost): da http il browser non offre la realtà virtuale. */
const XR={ok:0,wl:1,s:null,gl:null,ref:null,tex:null,pq:null,pl:null,bq:null,bl:null,pan:null,src:new Map(),act:null,cur:{},div:1,cost:0,skip:0};
// il ciclo dello schermo si ferma mentre il visore è acceso: i fotogrammi li chiama la sessione WebXR
// (XR.wl: il ciclo dello schermo ha ancora un fotogramma in attesa; se si è fermato, all'uscita dalla VR si riavvia)
const _loopXR=loop;loop=function(n){if(XR.s){XR.wl=0;return}_loopXR(n)};
// sul Quest, durante la sessione immersiva, il requestAnimationFrame della pagina non scatta più: le animazioni fatte con lui
// (la battuta dei dialoghi che si scrive, il ritratto che parla, la tendina nera delle porte) le fa andare avanti il fotogramma del visore
const XRQ=[],_rafXR=window.requestAnimationFrame.bind(window),_cafXR=window.cancelAnimationFrame.bind(window);let XRQN=1e9;
window.requestAnimationFrame=function(cb){if(!XR.s)return _rafXR(cb);XRQ.push([++XRQN,cb]);return XRQN};
window.cancelAnimationFrame=function(id){if(id>1e9){const i=XRQ.findIndex(q=>q[0]===id);if(i>=0)XRQ.splice(i,1);return}_cafXR(id)};
function xrRaf(n){for(const[,cb]of XRQ.splice(0))try{cb(n)}catch(e){console.error(e)}}
// in VR il canvas si disegna a una risoluzione fissa (circa 1920 pixel di larghezza), adatta allo schermo virtuale
const _rsXR=rs;rs=function(){_rsXR();if(!XR.s)return;DPR=Math.min(2,1920/Math.max(1,W))*SET.rs;cv.width=Math.max(1,W*DPR|0);cv.height=Math.max(1,H*DPR|0);lc=null;FC=null};
// levetta sinistra → direzione nel mondo isometrico, come il joystick touch
function xrDir(){const a=XR.ax;if(!XR.s||!a||Math.hypot(a[0],a[1])<.25)return null;const wx=a[0]+2*a[1],wy=2*a[1]-a[0],d=Math.hypot(wx,wy);return d?[wx/d,wy/d]:null}
const _keyDirXR=keyDir;keyDir=function(){return xrDir()||_keyDirXR()};

function xrButton(){if(!navigator.xr||!window.isSecureContext)return;
  navigator.xr.isSessionSupported('immersive-vr').then(ok=>{if(!ok)return;XR.ok=1;
    const f=document.querySelector('.mfoot');if(f&&!$('xrb')){f.insertAdjacentHTML('beforeend',`<button id="xrb" onclick="xrEnter()">${ico('gamepad',24)}<span><b>Entra in VR</b><small>Gioca con il visore: Meta Quest e altri visori WebXR</small></span></button>`)}
    if(!$('xrbg')){document.body.insertAdjacentHTML('beforeend',`<button id="xrbg" onclick="xrEnter()" title="Entra in VR" style="position:fixed;right:10px;bottom:calc(12px + env(safe-area-inset-bottom,0px));z-index:6;padding:6px 10px">${ico('gamepad',20)} VR</button>`);
      const st=document.createElement('style');st.textContent='body:not(.ig) #xrbg{display:none}@media(min-width:821px){.mfoot{grid-template-columns:repeat(4,1fr)}}';document.head.appendChild(st)}}).catch(()=>{})}

function xrEnter(){if(XR.s||!XR.ok)return;auInit();
  navigator.xr.requestSession('immersive-vr',{optionalFeatures:['local-floor']}).then(xrStart).catch(e=>msg('Realtà virtuale non disponibile: '+(e&&e.message||e)))}

function xrStart(s){XR.s=s;XR.pan=null;XR.src.clear();XR.act=null;
  if(!XR.gl){const c=document.createElement('canvas');XR.gl=c.getContext('webgl2',{xrCompatible:true,antialias:true,alpha:false});if(!XR.gl){s.end();msg('Il browser non offre WebGL 2');return}xrGL()}
  const gl=XR.gl;(gl.makeXRCompatible?gl.makeXRCompatible():Promise.resolve()).then(()=>{
    s.updateRenderState({baseLayer:new XRWebGLLayer(s,gl,{antialias:true}),depthNear:.05,depthFar:100});
    return s.requestReferenceSpace('local-floor').then(r=>{XR.floor=1;return r},()=>s.requestReferenceSpace('local').then(r=>{XR.floor=0;return r}))
  }).then(r=>{XR.ref=r;rs();
    // dal menu si entra direttamente nella partita salvata (o in una nuova): il menu è una pagina HTML e nel visore non si vede
    if(!started){const sv=LS.get(SAVEK,null);if(sv&&sv.p)contGame();else newGame(1)}
    s.requestAnimationFrame(xrFrame)}).catch(e=>{msg('Realtà virtuale non disponibile: '+(e&&e.message||e));s.end()});
  s.addEventListener('end',()=>{XR.s=null;for(const[,cb]of XRQ.splice(0))_rafXR(cb);XR.ref=null;XR.ax=null;MX=-1;rs();if(!XR.wl){XR.wl=1;requestAnimationFrame(loop)}});
  s.addEventListener('inputsourceschange',()=>{XR.src.clear()});
  // mani senza controller (hand tracking): il pizzico fa clic dove punta la mano
  s.addEventListener('select',e=>{const src=e.inputSource;if(src.gamepad||!XR.ref)return;const p=e.frame.getPose(src.targetRaySpace,XR.ref);if(!p)return;
    const m=p.transform.matrix,h=xrHit([m[12],m[13],m[14]],[-m[8],-m[9],-m[10]]);XR.act=src;if(h&&h.in)xrClick(h.x,h.y)})}

/* ---- WebGL: uno shader per lo schermo (texture del canvas) e uno per i raggi dei controller ---- */
function xrProg(vs,fs){const gl=XR.gl,p=gl.createProgram();for(const[t,c]of[[gl.VERTEX_SHADER,vs],[gl.FRAGMENT_SHADER,fs]]){const sh=gl.createShader(t);gl.shaderSource(sh,'#version 300 es\nprecision mediump float;\n'+c);gl.compileShader(sh);gl.attachShader(p,sh)}gl.linkProgram(p);return p}
function xrGL(){const gl=XR.gl;
  XR.pq=xrProg('uniform mat4 P,V;in vec3 a;in vec2 u;out vec2 v;void main(){v=u;gl_Position=P*V*vec4(a,1.);}','uniform sampler2D T;in vec2 v;out vec4 o;void main(){o=texture(T,v);}');
  XR.lq=xrProg('uniform mat4 P,V;in vec3 a;void main(){gl_Position=P*V*vec4(a,1.);}','uniform vec4 C;out vec4 o;void main(){o=C;}');
  XR.pb=gl.createBuffer();XR.lb=gl.createBuffer();
  XR.tex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,XR.tex);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE)}

const v3=(a,b,k=1)=>[a[0]+b[0]*k,a[1]+b[1]*k,a[2]+b[2]*k],dot3=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
// lo schermo virtuale: alto 1,3 m, a 2 m davanti alla testa, girato verso il giocatore (solo la rotazione orizzontale della testa)
function xrPlace(pose){const m=pose.transform.matrix,hp=[m[12],m[13],m[14]];let fx=-m[8],fz=-m[10];const l=Math.hypot(fx,fz)||1;fx/=l;fz/=l;
  const h=1.3,w=h*W/Math.max(1,H),c=[hp[0]+fx*2,hp[1]-.15,hp[2]+fz*2],r=[-fz,0,fx],u=[0,1,0];
  XR.pan={c,r,u,n:[-fx,0,-fz],w,h,asp:W/H};
  const A=v3(v3(c,r,-w/2),u,h/2),B=v3(v3(c,r,w/2),u,h/2),C2=v3(v3(c,r,w/2),u,-h/2),D=v3(v3(c,r,-w/2),u,-h/2);
  const gl=XR.gl;gl.bindBuffer(gl.ARRAY_BUFFER,XR.pb);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([...A,0,0,...B,1,0,...C2,1,1,...A,0,0,...C2,1,1,...D,0,1]),gl.STATIC_DRAW)}
// punto dello schermo colpito da un raggio, in pixel della pagina (o null)
function xrHit(o,d){const p=XR.pan;if(!p)return null;const den=dot3(d,p.n);if(den>-1e-4)return null;const t=dot3([p.c[0]-o[0],p.c[1]-o[1],p.c[2]-o[2]],p.n)/den;if(t<0)return null;
  const q=v3(o,d,t),e=[q[0]-p.c[0],q[1]-p.c[1],q[2]-p.c[2]],x=dot3(e,p.r)/p.w+.5,y=.5-dot3(e,p.u)/p.h;
  return{t,q,x:x*W,y:y*H,in:x>=0&&x<=1&&y>=0&&y<=1}}

/* ---- comandi dei controller (profilo xr-standard: 0 grilletto, 1 impugnatura, 3 pressione della levetta, 4 A/X, 5 B/Y) ---- */
// l'elemento della pagina sotto il punto (x,y): quello del browser e, se il browser non lo trova (nel visore la pagina non si vede
// e alcuni browser non la «toccano»), il più in alto fra gli elementi cliccabili il cui riquadro contiene il punto
const XRCK='button,a[href],input,select,textarea,summary,label,[onclick],[role=button],.ti';
function xrTarget(x,y){const e=document.elementFromPoint(x,y);if(e&&e!==cv&&e!==document.body&&e!==document.documentElement)return e;
  const L=document.querySelectorAll(XRCK);for(let i=L.length-1;i>=0;i--){const b=L[i];if(b.disabled||!b.getClientRects().length)continue;const r=b.getBoundingClientRect();
    if(x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom&&getComputedStyle(b).visibility!=='hidden')return b}
  return e}
// si può cliccare? (pulsanti, campi, voci con onclick o con la manina del mouse)
function xrClickable(e){if(!e||e===cv||e===document.body||e===document.documentElement)return null;const c=e.closest(XRCK);if(c)return c;
  for(let x=e;x&&x!==document.body;x=x.parentElement)if(x.onclick||/pointer/.test(getComputedStyle(x).cursor))return x;return null}
function xrClick(x,y){const el=xrTarget(x,y)||cv,o={clientX:x,clientY:y,bubbles:true,cancelable:true,view:window,button:0,buttons:1,pointerId:1,pointerType:'mouse',isPrimary:true};
  // menu a tendina e cursori: nel visore il browser non apre le sue finestrelle, quindi il clic sceglie la voce dopo o il punto del cursore
  const ch=t=>{t.dispatchEvent(new Event('input',{bubbles:true}));t.dispatchEvent(new Event('change',{bubbles:true}))};
  if(el.tagName==='SELECT'&&!el.disabled){const n=el.options.length;if(n){el.selectedIndex=(el.selectedIndex+1)%n;ch(el)}return}
  if(el.tagName==='INPUT'&&el.type==='range'&&!el.disabled){const r=el.getBoundingClientRect(),a=+el.min||0,b=el.max===''?100:+el.max,st=+el.step||1,k=clamp((x-r.left)/Math.max(1,r.width),0,1);
    el.value=String(Math.round((a+(b-a)*k)/st)*st);ch(el);return}
  el.dispatchEvent(new PointerEvent('pointerdown',o));el.dispatchEvent(new PointerEvent('pointerup',Object.assign({},o,{buttons:0})));el.dispatchEvent(new MouseEvent('click',Object.assign({},o,{buttons:0})))}
function xrPulse(gp,k=.35,ms=20){const h=gp&&gp.hapticActuators&&gp.hapticActuators[0];if(h&&h.pulse)try{h.pulse(k,ms)}catch(e){}}
function xrInput(fr){XR.ax=null;XR.zoom=0;
  for(const src of XR.s.inputSources){const gp=src.gamepad,hd=src.handedness,st=XR.src.get(src)||{b:[]};XR.src.set(src,st);
    const pose=fr.getPose(src.targetRaySpace,XR.ref);st.ray=null;
    if(pose){const m=pose.transform.matrix,o=[m[12],m[13],m[14]],d=[-m[8],-m[9],-m[10]];st.ray={o,d,h:xrHit(o,d)}}
    if(!gp)continue;
    const B=gp.buttons.map(b=>!!(b&&b.pressed)),B0=st.b,dn=i=>B[i]&&!B0[i];st.b=B;
    if(typeof xrInputHook==='function'&&xrInputHook(src,gp,B,B0,st.ray,fr))continue;
    const ax=gp.axes.length>=4?[gp.axes[2],gp.axes[3]]:[gp.axes[0]||0,gp.axes[1]||0];
    if(dn(0)){XR.act=src;const h=st.ray&&st.ray.h;if(h&&h.in){xrClick(h.x,h.y);xrPulse(gp)}}
    if(hd==='left'){XR.ax=ax;
      if(dn(1))area();if(dn(4))pot();if(dn(5))tog('inv');if(dn(3)){$('mappa')&&$('mappa').style.display==='flex'?closeMap():openMap()}}
    else{if(Math.abs(ax[1])>.3)XR.zoom=-ax[1];
      if(dn(1))lunge();if(dn(4)&&IT){P.path=[];P.tg=null;act(IT)}if(dn(5)){if(PM)cl();else dodge()}if(dn(3)){XR.pan=null;xrPulse(gp,.5,40)}}
    if(dn(1)||dn(4)||dn(5))xrPulse(gp,.2,15)}
  if(XR.zoom)SZ=clamp(SZ*(1+XR.zoom*.02),.55,1.9);
  // il puntatore attivo è l'ultimo controller che ha premuto il grilletto (all'inizio quello destro)
  if(!XR.act||!XR.src.has(XR.act))for(const src of XR.s.inputSources)if(!XR.act||src.handedness==='right')XR.act=src;
  const st=XR.act&&XR.src.get(XR.act),h=st&&st.ray&&st.ray.h;
  if(h&&h.in){if(MX!==h.x||MY!==h.y){MX=h.x;MY=h.y;const el=xrTarget(MX,MY);if(el)el.dispatchEvent(new PointerEvent('pointermove',{clientX:MX,clientY:MY,bubbles:true,pointerType:'mouse',isPrimary:true}))}}else MX=-1}

// il cursore del gioco (stesse forme e colori delle Impostazioni), disegnato sul canvas dove punta il controller
function xrCursor(){if(MX<0)return;const k=curK||'def',st=SET.cur<4?SET.cur|0:1,col=CURC[SET.curc]||CURC.oro;let c=XR.cur[k+st+col];
  if(!c){const sh=k==='atk'?curShape('atk'):k==='talk'?curShape('talk'):curShape(k==='use'?2:st,col);c=XR.cur[k+st+col]={c:curBakeC(sh,3),x:sh.hs[0]*3,y:sh.hs[1]*3}}
  G0.save();G0.setTransform(DPR,0,0,DPR,0,0);G0.globalAlpha=1;G0.globalCompositeOperation='source-over';G0.drawImage(c.c,MX-c.x,MY-c.y);G0.restore()}

function xrFrame(n,fr){const s=XR.s;if(!s)return;s.requestAnimationFrame(xrFrame);
  xrRaf(n);
  const pose=fr.getViewerPose(XR.ref);if(!pose)return;if(!XR.pan||Math.abs(XR.pan.asp-W/H)>.01)xrPlace(pose);
  xrInput(fr);
  // il gioco si disegna a ogni fotogramma del visore; se il canvas costa troppo (oltre ~9 ms) un fotogramma sì e uno no:
  // lo schermo virtuale resta comunque fermo e fluido, perché la testa la segue il visore
  const gl=XR.gl;if(++XR.skip>=XR.div){XR.skip=0;const t0=performance.now(),l0=last;frame(n);
    if(last!==l0){if(typeof xrUiDraw==='function')xrUiDraw(G0);xrCursor();gl.bindTexture(gl.TEXTURE_2D,XR.tex);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,cv);gl.generateMipmap(gl.TEXTURE_2D)}
    XR.cost=XR.cost*.9+(performance.now()-t0)*.1;XR.div=XR.cost>9?2:XR.cost<6?1:XR.div}
  const L=s.renderState.baseLayer;gl.bindFramebuffer(gl.FRAMEBUFFER,L.framebuffer);gl.clearColor(.063,.075,.102,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.enable(gl.DEPTH_TEST);
  // il raggio si vede solo quando punta lo schermo
  const lines=[];for(const st of XR.src.values())if(st.ray&&st.ray.h&&st.ray.h.in){const r=st.ray,e=v3(r.o,r.d,r.h.t);lines.push(...r.o,...e)}
  gl.bindBuffer(gl.ARRAY_BUFFER,XR.lb);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(lines),gl.STREAM_DRAW);
  for(const v of pose.views){const vp=L.getViewport(v);gl.viewport(vp.x,vp.y,vp.width,vp.height);
    if(!XR.noPan){gl.bindVertexArray(null);gl.useProgram(XR.pq);gl.uniformMatrix4fv(gl.getUniformLocation(XR.pq,'P'),false,v.projectionMatrix);gl.uniformMatrix4fv(gl.getUniformLocation(XR.pq,'V'),false,v.transform.inverse.matrix);
    gl.bindBuffer(gl.ARRAY_BUFFER,XR.pb);let a=gl.getAttribLocation(XR.pq,'a'),u=gl.getAttribLocation(XR.pq,'u');gl.enableVertexAttribArray(a);gl.enableVertexAttribArray(u);
    gl.vertexAttribPointer(a,3,gl.FLOAT,false,20,0);gl.vertexAttribPointer(u,2,gl.FLOAT,false,20,12);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,XR.tex);gl.drawArrays(gl.TRIANGLES,0,6);gl.disableVertexAttribArray(u)}
    if(typeof xr3dDraw==='function')xr3dDraw(gl,v,XR);
    if(lines.length&&!XR.noPan){gl.bindVertexArray(null);gl.useProgram(XR.lq);gl.uniformMatrix4fv(gl.getUniformLocation(XR.lq,'P'),false,v.projectionMatrix);gl.uniformMatrix4fv(gl.getUniformLocation(XR.lq,'V'),false,v.transform.inverse.matrix);
      gl.uniform4f(gl.getUniformLocation(XR.lq,'C'),.96,.73,.26,1);gl.bindBuffer(gl.ARRAY_BUFFER,XR.lb);const a=gl.getAttribLocation(XR.lq,'a');gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,3,gl.FLOAT,false,12,0);gl.drawArrays(gl.LINES,0,lines.length/3)}}}
/* ---- punti d'aggancio per gli altri moduli VR (ognuno nel suo file, facoltativo):
   xrUiDraw(g)       disegna l'interfaccia HTML del gioco sul canvas g, prima che diventi la texture dello schermo
   xr3dDraw(gl,v,XR) disegna altro nella scena, per ogni occhio v (XRView), con il contesto WebGL 2 della sessione
   xrInputHook(src,gp,B,B0,ray,fr)  comandi di un controller (B premuti ora, B0 al fotogramma prima): se rende true, i comandi di qui si saltano
   XR.noPan=1        nasconde lo schermo sospeso e i raggi (per esempio in prima persona) ---- */
xrButton();
