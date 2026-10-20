/* ================= realtà virtuale: diorama 3D da tavolo =================
   Nel visore, oltre allo schermo sospeso, il mondo può comparire in vero 3D su un tavolo rotondo davanti al giocatore.
   Non ci sono modelli nuovi: il gioco disegna tutto con box(x,y,z,w,d,h,colore), e qui quelle stesse chiamate vengono
   annotate (invece che disegnate sul canvas) e trasformate in parallelepipedi WebGL con gli stessi colori e la stessa luce.
   Pavimento, muri, edifici e arredi fermi si preparano una volta sola, a pezzi di 8×8 caselle, solo vicino all'eroe;
   eroe, nemici, personaggi, oggetti e caselle animate si annotano di nuovo a ogni fotogramma.
   Si accende e si spegne tenendo premuta per un secondo la levetta destra (o con xr3dToggle()); di base è spento. */
const X3={on:LS.get('voxelia_xr3d',0)?1:0,pr:null,vao:null,db:null,dn:0,ch:new Map(),zk:null,M:null,N:0,fc:null,lt:0,hold:0,hf:0,rr:0,u:{},
  cx:0,cy:0,R:10,mdl:new Float32Array(16),vb:new ArrayBuffer(1<<20)};
const X3Z=1/39.2,X3CS=8,X3TR=.42;  // 1 casella = 39,2 pixel di altezza (proiezione 2:1); pezzi di 8×8 caselle; raggio del tavolo 42 cm
const X3G=Object.create(REC);  // un "pennello" muto: tutto ciò che non è box() non disegna niente
let X3B=null;  // le box annotate (x,y,z,w,d,h,r,g,b) mentre si registra
const _box3d=box;box=function(x,y,z,w,d,h,c,f){if(X3B){x3Box(x,y,z,w,d,h,c,f===undefined?1:f);return}_box3d(x,y,z,w,d,h,c,f)};
const X3C=new Map();
function x3Col(c){let o=X3C.get(c);if(o)return o;let r=128,gg=128,b=128;
  if(typeof c==='string'){if(c[0]==='#'){let s=c.slice(1);if(s.length<6)s=s[0]+s[0]+s[1]+s[1]+s[2]+s[2];const n=parseInt(s.slice(0,6),16);if(n===n){r=n>>16;gg=n>>8&255;b=n&255}}
    else{const m=/(\d+)\D+(\d+)\D+(\d+)/.exec(c);if(m){r=+m[1];gg=+m[2];b=+m[3]}}}
  o=[r,gg,b];X3C.set(c,o);return o}
function x3Box(x,y,z,w,d,h,c,f){if(X3G.globalAlpha<.12||!(w>0)||!(d>0))return;const k=x3Col(c);X3B.push(x,y,z,w,d,Math.max(0,h),k[0]*f,k[1]*f,k[2]*f)}
// registra quello che fn disegnerebbe; fix: tempo e casualità fermi (per le parti che restano in cache)
function x3Rec(fn,fix,tt){const og=g,ot=t,onl=nlight,gl=GLOW.length,B=[];let rnd=0;X3B=B;g=X3G;X3G.globalAlpha=1;
  if(fix){t=tt;Math.random=()=>{rnd=1;return .999}}nlight=function(){};
  try{fn()}catch(e){}finally{X3B=null;g=og;nlight=onl;if(fix){t=ot;Math.random=MRND}if(GLOW.length>gl)GLOW.length=gl;X3G.globalAlpha=1}
  B.rnd=rnd;return B}
const x3Hash=B=>{let h=2166136261;for(let i=0;i<B.length;i++)h=Math.imul(h^(Math.round(B[i]*16)|0),16777619);return h>>>0};

/* ---- dalle box ai vertici: posizione (x, y, z in pixel) + colore; 16 byte per vertice ---- */
function x3Need(n){if(X3.vb.byteLength<n){let s=X3.vb.byteLength;while(s<n)s*=2;X3.vb=new ArrayBuffer(s)}return X3.vb}
// facce: sopra (piena luce), davanti e destra con le ombre del gioco (.78 e .58), dietro e sinistra un po' più chiare; il fondo non si vede mai
const X3F=[[1,[0,0,1, 1,0,1, 1,1,1, 0,1,1]],[.78,[0,1,1, 1,1,1, 1,1,0, 0,1,0]],[.58,[1,0,1, 1,1,1, 1,1,0, 1,0,0]],[.88,[0,0,1, 1,0,1, 1,0,0, 0,0,0]],[.68,[0,0,1, 0,1,1, 0,1,0, 0,0,0]]];
const X3Q=[0,1,2,0,2,3];
function x3Emit(B,vb,o,A){const F=new Float32Array(vb),U=new Uint8Array(vb),a=A===undefined?255:A;
  for(let i=0;i<B.length;i+=9){const x=B[i],y=B[i+1],z=B[i+2],w=B[i+3],d=B[i+4],h=B[i+5],nf=h>0?5:1;
    for(let f=0;f<nf;f++){const s=X3F[f][0],q=X3F[f][1],r=Math.min(255,B[i+6]*s),gg=Math.min(255,B[i+7]*s),b=Math.min(255,B[i+8]*s);
      for(const j of X3Q){const v=o>>2;F[v]=x+q[j*3]*w;F[v+1]=y+q[j*3+1]*d;F[v+2]=z+q[j*3+2]*h;const u=o+12;U[u]=r;U[u+1]=gg;U[u+2]=b;U[u+3]=a;o+=16}}}
  return o}
const x3Size=B=>{let n=0;for(let i=5;i<B.length;i+=9)n+=B[i]>0?30:6;return n*16};

/* ---- WebGL: un solo shader; le posizioni in alta precisione (le mappe arrivano a più di cento caselle) ---- */
function x3GL(gl){const p=gl.createProgram();
  for(const[tp,src]of[[gl.VERTEX_SHADER,'uniform mat4 P,V,Mdl;in vec3 a;in vec4 c;out vec4 vc;out vec2 vg;void main(){vc=c;vg=a.xy;gl_Position=P*V*Mdl*vec4(a,1.);}'],
    [gl.FRAGMENT_SHADER,'uniform vec3 C;uniform float NK;in vec4 vc;in vec2 vg;out vec4 o;void main(){if(vc.a>.999&&distance(vg,C.xy)>C.z)discard;vec3 k=vc.rgb;k=mix(k,k*vec3(.32,.38,.62),NK*.75);o=vec4(k,1.);}']]){
    const s=gl.createShader(tp);gl.shaderSource(s,'#version 300 es\nprecision highp float;\n'+src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))console.warn('xr3d',gl.getShaderInfoLog(s));gl.attachShader(p,s)}
  gl.bindAttribLocation(p,0,'a');gl.bindAttribLocation(p,1,'c');gl.linkProgram(p);X3.pr=p;
  for(const k of['P','V','Mdl','C','NK'])X3.u[k]=gl.getUniformLocation(p,k);
  X3.vao=gl.createVertexArray();X3.db=gl.createBuffer();X3.gl=gl}
function x3Up(gl,buf,B,A){const n=x3Size(B),vb=x3Need(n);x3Emit(B,vb,0,A);gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Uint8Array(vb,0,n),gl.STATIC_DRAW);return n>>4}
function x3Reset(){const gl=X3.gl;for(const c of X3.ch.values())if(c.buf&&gl)gl.deleteBuffer(c.buf);X3.ch.clear();X3.zk=Zk;X3.M=M;X3.N=N;X3.fc=FC}

/* ---- un pezzo di 8×8 caselle: pavimento e cose ferme in un buffer; le caselle animate si ricordano a parte ---- */
function x3Tile(x,y,S,D){const c=M[y][x];if(c===9)return;const h=HHc&&HHc.length===N*N?HHc[y*N+x]:hh(x,y);
  // il pavimento come nella cache del gioco (buildFC); l'acqua ferma, con la sua prima sfumatura
  const fl=x3Rec(()=>{if(c===2){WMODE=1;try{floor(x,y,2,h)}finally{WMODE=0}}else if(c===0||c===4||c===8||c===6||(c===1&&openW(x,y)))floor(x,y,c===6?(RDF.has(y*N+x)?4:0):c===1?0:c,h)},1,0);
  for(const v of fl)S.push(v);
  const a=x3Rec(()=>fObj(x,y),1,0);if(!a.length)return;const b=x3Rec(()=>fObj(x,y),1,.731);
  if(a.rnd||b.rnd||a.length!==b.length||x3Hash(a)!==x3Hash(b))D.push(x,y);else for(const v of a)S.push(v)}
function x3Chunk(gl,k){const nc=Math.ceil(N/X3CS),X0=(k%nc)*X3CS,Y0=(k/nc|0)*X3CS,S=[],D=[];
  for(let y=Y0;y<Math.min(N,Y0+X3CS);y++)for(let x=X0;x<Math.min(N,X0+X3CS);x++)x3Tile(x,y,S,D);
  const hs=x3Hash(S);let c=X3.ch.get(k);if(c&&c.hs===hs&&c.D.join()===D.join())return c;
  if(!c){c={buf:gl.createBuffer(),n:0,hs:0,D};X3.ch.set(k,c)}c.hs=hs;c.D=D;c.n=x3Up(gl,c.buf,S);return c}

/* ---- ogni fotogramma: dove sta il tavolo, quali pezzi servono, cosa si muove ---- */
function x3Frame(gl,XR){
  if(X3.zk!==Zk||X3.M!==M||X3.N!==N||(FC&&X3.fc!==FC))x3Reset();
  // il centro è quello della telecamera del gioco (segue l'eroe e le scene); vicino ai bordi della mappa si ferma, così il tavolo resta pieno
  const sx=camX/32,sy=(camY+10)/16;X3.R=clamp(11/Math.max(.3,S),6,22);const mg=Math.min(X3.R*.7,N/2);X3.cx=clamp((sy+sx)/2,mg,N-mg);X3.cy=clamp((sy-sx)/2,mg,N-mg);
  const R=X3.R,cx=X3.cx,cy=X3.cy,nc=Math.ceil(N/X3CS),vis=[];
  for(let j=Math.max(0,Math.floor((cy-R)/X3CS));j<=Math.min(nc-1,Math.floor((cy+R)/X3CS));j++)
    for(let i=Math.max(0,Math.floor((cx-R)/X3CS));i<=Math.min(nc-1,Math.floor((cx+R)/X3CS));i++){
      const qx=clamp(cx,i*X3CS,(i+1)*X3CS),qy=clamp(cy,j*X3CS,(j+1)*X3CS);if(Math.hypot(qx-cx,qy-cy)<R+1)vis.push(j*nc+i)}
  // pezzi nuovi entro ~4 ms per fotogramma; poi un pezzo già pronto si riesamina a turno (porte, bancarelle, finestre di notte...)
  const t0=performance.now();for(const k of vis)if(!X3.ch.has(k)){x3Chunk(gl,k);if(performance.now()-t0>4)break}
  if(vis.length){const k=vis[X3.rr++%vis.length];if(X3.ch.has(k))x3Chunk(gl,k)}
  X3.vis=vis;
  // le cose che si muovono: entità vicine, caselle animate, proiettili; e il basamento del tavolo
  const B=x3Rec(()=>{
    for(const k of vis){const c=X3.ch.get(k);if(c)for(let i=0;i<c.D.length;i+=2)fObj(c.D[i],c.D[i+1])}
    for(const e of ents.concat(P,NET.list)){if(!e||e.px==null)continue;const far=e.k==='ship'?R+12:R+1.5;if(Math.abs(e.px-cx)>far||Math.abs(e.py-cy)>far)continue;try{ent(e)}catch(_){}}
    for(const p of PJ)box(p.x-.08,p.y-.08,18,.16,.16,8,p.c,1.2);if(typeof PPJ!=='undefined'&&PPJ.length)ppjDraw()},0);
  const z=ZZ||{},base=[],bc=x3Col(z.bg||'#20242c'),RB=R+.35;
  for(let i=0;i<40;i++){const a0=i/40*6.2832,a1=(i+1)/40*6.2832;base.push(a0,a1)}
  let n=x3Size(B)+base.length/2*(3*16+6*16);const vb=x3Need(n),F=new Float32Array(vb),U=new Uint8Array(vb);let o=x3Emit(B,vb,0);
  // basamento: un disco sotto il pavimento e il suo bordo, nel colore di fondo della zona scurito
  const V=(x,y,zz,s)=>{const v=o>>2;F[v]=x;F[v+1]=y;F[v+2]=zz;const u=o+12;U[u]=bc[0]*s*.45+12;U[u+1]=bc[1]*s*.45+10;U[u+2]=bc[2]*s*.45+9;U[u+3]=254;o+=16};
  for(let i=0;i<base.length;i+=2){const a0=base[i],a1=base[i+1],x0=cx+Math.cos(a0)*RB,y0=cy+Math.sin(a0)*RB,x1=cx+Math.cos(a1)*RB,y1=cy+Math.sin(a1)*RB,sd=.55+.3*Math.cos((a0+a1)/2-.785);
    V(cx,cy,-6.5,.9);V(x0,y0,-6.5,.9);V(x1,y1,-6.5,.9);
    V(x0,y0,-6.5,sd);V(x1,y1,-6.5,sd);V(x1,y1,-26,sd*.7);V(x0,y0,-6.5,sd);V(x1,y1,-26,sd*.7);V(x0,y0,-26,sd*.7)}
  gl.bindBuffer(gl.ARRAY_BUFFER,X3.db);gl.bufferData(gl.ARRAY_BUFFER,new Uint8Array(vb,0,o),gl.STREAM_DRAW);X3.dn=o>>4;
  // il tavolo: 90 cm davanti alla testa e 60 cm più in basso, girato come lo schermo; la vista del gioco (da sud-est) guarda in avanti
  const p=XR.pan,f=[-p.n[0],0,-p.n[2]],r=p.r,hd=[p.c[0]-f[0]*2,p.c[1]+.15,p.c[2]-f[2]*2],T=[hd[0]+f[0]*.9,hd[1]-.6,hd[2]+f[2]*.9],s=X3TR/R,q=s*Math.SQRT1_2;
  const ex=[(r[0]-f[0])*q,0,(r[2]-f[2])*q],ey=[(-r[0]-f[0])*q,0,(-r[2]-f[2])*q],m=X3.mdl;
  m.set([ex[0],0,ex[2],0, ey[0],0,ey[2],0, 0,s*X3Z,0,0, T[0]-cx*ex[0]-cy*ey[0],T[1]+6*s*X3Z,T[2]-cx*ex[2]-cy*ey[2],1])}

function x3Toggle(gp){X3.on^=1;LS.set('voxelia_xr3d',X3.on);if(typeof msg==='function')msg(X3.on?'Diorama 3D acceso: il mondo è sul tavolo davanti a te':'Diorama 3D spento');if(gp&&typeof xrPulse==='function')xrPulse(gp,.6,60)}
function xr3dToggle(){x3Toggle(null)}
// tenere premuta la levetta destra per circa un secondo accende o spegne il diorama (la pressione breve resta «rimetti lo schermo davanti»)
function x3Hold(XR,dt){let held=null;for(const[src,st]of XR.src)if(src.handedness==='right'&&st.b&&st.b[3])held=src;
  if(!held){X3.hold=0;X3.hf=0;return}X3.hold+=dt;if(X3.hold>.9&&!X3.hf){X3.hf=1;x3Toggle(held.gamepad)}}

function xr3dDraw(gl,v,XR){if(!XR.s)return;const now=performance.now(),nf=now-X3.lt>3,dt=Math.min(.1,(now-X3.lt)/1000);
  if(nf){X3.lt=now;x3Hold(XR,dt)}
  if(!X3.on||!started||!M||!P||!XR.pan)return;
  if(X3.gl!==gl)x3GL(gl);
  if(nf)x3Frame(gl,XR);
  gl.useProgram(X3.pr);gl.uniformMatrix4fv(X3.u.P,false,v.projectionMatrix);gl.uniformMatrix4fv(X3.u.V,false,v.transform.inverse.matrix);gl.uniformMatrix4fv(X3.u.Mdl,false,X3.mdl);
  gl.uniform3f(X3.u.C,X3.cx,X3.cy,X3.R);gl.uniform1f(X3.u.NK,SKY[Zk]?NK:0);
  gl.bindVertexArray(X3.vao);gl.enableVertexAttribArray(0);gl.enableVertexAttribArray(1);gl.enable(gl.DEPTH_TEST);
  const dr=(buf,n)=>{if(!n)return;gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.vertexAttribPointer(0,3,gl.FLOAT,false,16,0);gl.vertexAttribPointer(1,4,gl.UNSIGNED_BYTE,true,16,12);gl.drawArrays(gl.TRIANGLES,0,n)};
  for(const k of X3.vis||[]){const c=X3.ch.get(k);if(c)dr(c.buf,c.n)}dr(X3.db,X3.dn);
  gl.bindVertexArray(null)}
