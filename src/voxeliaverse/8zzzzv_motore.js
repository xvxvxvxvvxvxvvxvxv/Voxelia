/* ================= 8.9: IL MOTORE DEL VOXELIAVERSE — un motore 3D nuovo, in terza persona =================
   Non è la vista 3D del gioco (8zm_3d.js, che rifà in 3D il mondo a caselle): è un motore a parte, con un mondo
   fatto di voxel veri in tre dimensioni (si sale, si salta, ci sono piani sopra e sotto).
   - IL MONDO: una griglia di voxel da 20 cm (VX.W × VX.H × VX.D), ognuno con un colore della tavolozza e, se serve, una
     luce propria (fuoco, cristalli, libri che brillano). Si disegnano solo le facce che si vedono, divise in pezzi da
     16×16×16; ogni angolo di faccia ha la sua ombra d'angolo (come nei giochi a voxel: gli spigoli interni sono più
     scuri). In più, i "pezzi" decorativi: scatole libere (libri, fiamme, tende) che non fermano l'eroe.
   - LA LUCE: il sole o la luna fanno le ombre (una mappa d'ombra con il bordo morbido), il cielo e il pavimento danno la
     luce diffusa, fino a 8 luci vicine (il fuoco, le candele, le gemme) che tremano; la nebbia in lontananza, i colori
     come in pellicola (una curva morbida sulle luci forti) e i bagliori (sprite che si sommano alla luce).
   - L'EROE: lo stesso modello del gioco, con il suo equipaggiamento (si cattura con d3Rec, come fa la vista 3D), che
     si gira dove cammina e ondeggia mentre cammina. Ha un corpo (larghezza 60 cm, altezza 1,8 m), la gravità, il salto
     (1,2 m) e sale da solo i gradini di un voxel.
   - LA TELECAMERA: in terza persona, dietro le spalle; si gira trascinando il mouse (o un dito), la rotellina avvicina e
     allontana; se c'è un muro in mezzo la telecamera si avvicina, così l'eroe non sparisce mai.
   - I COMANDI: WASD o le frecce per camminare (rispetto a dove guarda la telecamera), Spazio per saltare, E (o il clic)
     per usare quello che c'è vicino, Esc per il menu della scena. Sul telefono un joystick a sinistra e due bottoni.
   Una scena (VXS) dà il mondo, dove parte l'eroe, le luci, il cielo e le cose da usare; vxStart(scena) la apre sopra il
   gioco, vxStop() la chiude. */
const VX={on:0,cv:null,gl:null,ui:null,W:0,H:0,D:0,vox:null,col:[],emi:[],ch:new Map(),dirty:new Set(),deco:null,sc:null,
  cam:{yaw:0,pitch:.32,dist:4.2,tdist:4.2},pl:{x:0,y:0,z:0,vx:0,vy:0,vz:0,yaw:0,on:0,mv:0,walk:0},keys:{},t:0,last:0,lights:[],glow:[],near:null,
  sh:{size:2048,fb:null,tex:null},prog:null,sprog:null,gprog:null,hero:null,heroT:0,touch:null,drag:null,msg:'',msgT:0};
const VXS_VOX=.2;   // un voxel: 20 cm
/* ---- i voxel ---- */
// la tavolozza: fino a 255 colori; il numero 0 è l'aria. emi: quanto il voxel fa luce da solo (0..1)
function vxPal(hex,emi){const i=VX.col.length+1;const n=parseInt(hex.slice(1),16);VX.col.push([(n>>16)/255,(n>>8&255)/255,(n&255)/255]);VX.emi.push(emi||0);return i}
const vxI=(x,y,z)=>x+VX.W*(z+VX.D*y);
function vxGet(x,y,z){if(x<0||z<0||y<0||x>=VX.W||y>=VX.H||z>=VX.D)return y<0?1:0;return VX.vox[vxI(x,y,z)]}
function vxSet(x,y,z,v){if(x<0||z<0||y<0||x>=VX.W||y>=VX.H||z>=VX.D)return;VX.vox[vxI(x,y,z)]=v;const cx=x>>4,cy=y>>4,cz=z>>4;VX.dirty.add(cx+','+cy+','+cz);
  if((x&15)===0)VX.dirty.add((cx-1)+','+cy+','+cz);if((x&15)===15)VX.dirty.add((cx+1)+','+cy+','+cz);if((y&15)===0)VX.dirty.add(cx+','+(cy-1)+','+cz);if((y&15)===15)VX.dirty.add(cx+','+(cy+1)+','+cz);if((z&15)===0)VX.dirty.add(cx+','+cy+','+(cz-1));if((z&15)===15)VX.dirty.add(cx+','+cy+','+(cz+1))}
// riempire un blocco di voxel (coordinate in voxel, estremi compresi)
function vxFill(x0,y0,z0,x1,y1,z1,v){for(let y=y0;y<=y1;y++)for(let z=z0;z<=z1;z++)for(let x=x0;x<=x1;x++)vxSet(x,y,z,typeof v==='function'?v(x,y,z):v)}
const vxSolid=(x,y,z)=>vxGet(x,y,z)>0;
/* ---- la geometria: ogni vertice ha posizione, normale, colore, ombra d'angolo e luce propria (11 numeri) ---- */
const VXF=[[1,0,0,[[1,0,0],[1,1,0],[1,1,1],[1,0,1]]],[-1,0,0,[[0,0,1],[0,1,1],[0,1,0],[0,0,0]]],[0,1,0,[[0,1,0],[0,1,1],[1,1,1],[1,1,0]]],[0,-1,0,[[0,0,0],[1,0,0],[1,0,1],[0,0,1]]],[0,0,1,[[1,0,1],[1,1,1],[0,1,1],[0,0,1]]],[0,0,-1,[[0,0,0],[0,1,0],[1,1,0],[1,0,0]]]];
// l'ombra d'angolo di un vertice (il metodo classico dei giochi a voxel): si guardano, dal lato della faccia, i due
// voxel di fianco allo spigolo e quello in diagonale; due fianchi pieni fanno l'angolo più scuro
function vxAO(x,y,z,n,c){const ax=n[0]?1:0,ay=n[1]?1:0;const T=n[0]?[[0,1,0],[0,0,1]]:n[1]?[[1,0,0],[0,0,1]]:[[1,0,0],[0,1,0]];
  const du=(n[0]?c[1]:c[0])?1:-1,dv=(n[2]?c[1]:c[2])?1:-1,u=T[0],v=T[1],bx=x+n[0],by=y+n[1],bz=z+n[2];
  const s1=vxSolid(bx+u[0]*du,by+u[1]*du,bz+u[2]*du),s2=vxSolid(bx+v[0]*dv,by+v[1]*dv,bz+v[2]*dv),cc=vxSolid(bx+u[0]*du+v[0]*dv,by+u[1]*du+v[1]*dv,bz+u[2]*du+v[2]*dv);
  const a=s1&&s2?0:3-(s1+s2+cc);return[.42,.6,.8,1][a]}
function vxChunk(cx,cy,cz){const V=[],S=VXS_VOX;
  for(let y=cy*16;y<Math.min(VX.H,cy*16+16);y++)for(let z=cz*16;z<Math.min(VX.D,cz*16+16);z++)for(let x=cx*16;x<Math.min(VX.W,cx*16+16);x++){const v=VX.vox[vxI(x,y,z)];if(!v)continue;const c=VX.col[v-1],e=VX.emi[v-1],j=((x*7+y*13+z*5)%5)*.012;
    for(const[nx,ny,nz,Q]of VXF){if(vxSolid(x+nx,y+ny,z+nz))continue;const ao=Q.map(q=>vxAO(x,y,z,[nx,ny,nz],q));const ord=ao[0]+ao[2]<ao[1]+ao[3]?[1,2,3,1,3,0]:[0,1,2,0,2,3];
      for(const k of ord){const q=Q[k];V.push((x+q[0])*S,(y+q[1])*S,(z+q[2])*S,nx,ny,nz,c[0]*(1-j),c[1]*(1-j),c[2]*(1-j),ao[k],e)}}}
  return V}
// una scatola libera (decorazioni): centro in basso (x,y,z) in metri, misure w,h,d, colore, luce propria
function vxBox(V,x,y,z,w,h,d,hex,e,ry){const n=parseInt(hex.slice(1),16),c=[(n>>16)/255,(n>>8&255)/255,(n&255)/255],ca=Math.cos(ry||0),sa=Math.sin(ry||0);
  const P=(a,b,cc)=>{const lx=(a-.5)*w,lz=(cc-.5)*d;return[x+lx*ca-lz*sa,y+b*h,z+lx*sa+lz*ca]};
  for(const[nx,ny,nz,Q]of VXF){const N=[nx*ca-nz*sa,ny,nx*sa+nz*ca];for(const k of[0,1,2,0,2,3]){const q=Q[k],p=P(q[0],q[1],q[2]);V.push(p[0],p[1],p[2],N[0],N[1],N[2],c[0],c[1],c[2],1,e||0)}}}
/* ---- i programmi della scheda grafica ---- */
const VXVS=`#version 300 es
precision highp float;layout(location=0)in vec3 aP;layout(location=1)in vec3 aN;layout(location=2)in vec3 aC;layout(location=3)in float aO;layout(location=4)in float aE;
uniform mat4 uVP,uM,uL;out vec3 vP,vN,vC;out float vO,vE;out vec4 vS;
void main(){vec4 w=uM*vec4(aP,1.);vP=w.xyz;vN=normalize(mat3(uM)*aN);vC=aC;vO=aO;vE=aE;vS=uL*w;gl_Position=uVP*w;}`;
const VXFS=`#version 300 es
precision highp float;precision highp sampler2DShadow;in vec3 vP,vN,vC;in float vO,vE;in vec4 vS;out vec4 o;
uniform sampler2DShadow uSh;uniform vec3 uSd,uSc,uSky,uGnd,uFog,uCam;uniform float uFogD,uT,uShOn;uniform vec4 uLP[8],uLC[8],uTint;uniform int uLN;
float shadow(){vec3 s=vS.xyz/vS.w*.5+.5;if(s.x<0.||s.y<0.||s.x>1.||s.y>1.||s.z>1.)return 1.;float b=.0015,r=0.;vec2 px=vec2(1./2048.);
  for(int i=-2;i<=2;i++)for(int j=-2;j<=2;j++)r+=texture(uSh,vec3(s.xy+vec2(i,j)*px*1.2,s.z-b));return r/25.;}
void main(){vec3 n=normalize(vN);float hemi=n.y*.5+.5;vec3 amb=mix(uGnd,uSky,hemi)*vO;
  float nd=max(dot(n,-uSd),0.);float sh=uShOn>.5?shadow():1.;vec3 lit=amb+uSc*nd*sh*mix(.6,1.,vO);
  for(int i=0;i<8;i++){if(i>=uLN)break;vec3 d=uLP[i].xyz-vP;float r=length(d),a=max(0.,1.-r/uLP[i].w);a*=a;lit+=uLC[i].rgb*a*max(dot(n,d/r),0.)*mix(.55,1.,vO)+uLC[i].rgb*a*.12*vO;}
  vec3 c=vC*lit+vC*vE*2.2;c=mix(c,uTint.rgb,uTint.a);float f=1.-exp(-pow(length(vP-uCam)*uFogD,1.6));c=mix(c,uFog,clamp(f,0.,1.));
  c=c*(2.51*c+.03)/(c*(2.43*c+.59)+.14);o=vec4(pow(clamp(c,0.,1.),vec3(1./2.2)),1.);}`;
const VXSVS=`#version 300 es
precision highp float;layout(location=0)in vec3 aP;uniform mat4 uL,uM;void main(){gl_Position=uL*uM*vec4(aP,1.);}`;
const VXSFS=`#version 300 es
precision highp float;out vec4 o;void main(){o=vec4(1.);}`;
// i bagliori: punti che si sommano alla luce (fuoco, scintille, polvere nella luce, stelle)
const VXGVS=`#version 300 es
precision highp float;layout(location=0)in vec3 aP;layout(location=1)in vec4 aC;layout(location=2)in float aS;uniform mat4 uVP;uniform float uH;out vec4 vC;
void main(){vec4 p=uVP*vec4(aP,1.);gl_Position=p;gl_PointSize=clamp(aS*uH/max(.1,p.w),1.,256.);vC=aC;}`;
const VXGFS=`#version 300 es
precision highp float;in vec4 vC;out vec4 o;void main(){vec2 d=gl_PointCoord*2.-1.;float r=dot(d,d);if(r>1.)discard;float a=pow(1.-r,2.2);o=vec4(vC.rgb*a*vC.a,1.);}`;
function vxProg(gl,vs,fs){const mk=(t,s)=>{const h=gl.createShader(t);gl.shaderSource(h,s);gl.compileShader(h);if(!gl.getShaderParameter(h,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(h));return h};
  const p=gl.createProgram();gl.attachShader(p,mk(gl.VERTEX_SHADER,vs));gl.attachShader(p,mk(gl.FRAGMENT_SHADER,fs));gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p));
  const U={};const n=gl.getProgramParameter(p,gl.ACTIVE_UNIFORMS);for(let i=0;i<n;i++){const a=gl.getActiveUniform(p,i),k=a.name.replace('[0]','');U[k]=gl.getUniformLocation(p,a.name)}return{p,U}}
function vxUp(gl,V,o){if(!o){o={va:gl.createVertexArray(),b:gl.createBuffer(),n:0}}gl.bindVertexArray(o.va);gl.bindBuffer(gl.ARRAY_BUFFER,o.b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(V),gl.DYNAMIC_DRAW);
  const st=44;gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,3,gl.FLOAT,false,st,0);gl.enableVertexAttribArray(1);gl.vertexAttribPointer(1,3,gl.FLOAT,false,st,12);gl.enableVertexAttribArray(2);gl.vertexAttribPointer(2,3,gl.FLOAT,false,st,24);
  gl.enableVertexAttribArray(3);gl.vertexAttribPointer(3,1,gl.FLOAT,false,st,36);gl.enableVertexAttribArray(4);gl.vertexAttribPointer(4,1,gl.FLOAT,false,st,40);gl.bindVertexArray(null);o.n=V.length/11;return o}
/* ---- i piani della vista (dalla matrice): un pezzo fuori da uno dei sei piani non si disegna ---- */
function vxPlanes(m){const r=i=>[m[i],m[4+i],m[8+i],m[12+i]],a=r(0),b=r(1),c=r(2),d=r(3),P=[];for(const[q,s]of[[a,1],[a,-1],[b,1],[b,-1],[c,1],[c,-1]]){const p=[d[0]+s*q[0],d[1]+s*q[1],d[2]+s*q[2],d[3]+s*q[3]],l=Math.hypot(p[0],p[1],p[2])||1;P.push(p.map(v=>v/l))}return P}
const vxIn=(P,c,r)=>{for(const p of P)if(p[0]*c[0]+p[1]*c[1]+p[2]*c[2]+p[3]<-r)return false;return true};
/* ---- un po' di matematica delle matrici (colonne, come vuole la scheda grafica) ---- */
const vxM={per(f,a,n,fr){const t=1/Math.tan(f/2);return[t/a,0,0,0,0,t,0,0,0,0,(fr+n)/(n-fr),-1,0,0,2*fr*n/(n-fr),0]},
  ortho(l,r,b,t,n,f){return[2/(r-l),0,0,0,0,2/(t-b),0,0,0,0,-2/(f-n),0,-(r+l)/(r-l),-(t+b)/(t-b),-(f+n)/(f-n),1]},
  look(e,c,u=[0,1,0]){let z=[e[0]-c[0],e[1]-c[1],e[2]-c[2]];const l=Math.hypot(...z);z=z.map(v=>v/l);let x=[u[1]*z[2]-u[2]*z[1],u[2]*z[0]-u[0]*z[2],u[0]*z[1]-u[1]*z[0]];const lx=Math.hypot(...x)||1;x=x.map(v=>v/lx);const y=[z[1]*x[2]-z[2]*x[1],z[2]*x[0]-z[0]*x[2],z[0]*x[1]-z[1]*x[0]];
    return[x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-(x[0]*e[0]+x[1]*e[1]+x[2]*e[2]),-(y[0]*e[0]+y[1]*e[1]+y[2]*e[2]),-(z[0]*e[0]+z[1]*e[1]+z[2]*e[2]),1]},
  mul(a,b){const o=new Array(16);for(let i=0;i<4;i++)for(let j=0;j<4;j++){let s=0;for(let k=0;k<4;k++)s+=a[k*4+j]*b[i*4+k];o[i*4+j]=s}return o},
  rx(a){const c=Math.cos(a),n=Math.sin(a);return[1,0,0,0,0,c,n,0,0,-n,c,0,0,0,0,1]},t(x,y,z){return[1,0,0,0,0,1,0,0,0,0,1,0,x,y,z,1]},
  tr(x,y,z,ry,s){const c=Math.cos(ry),n=Math.sin(ry);s=s||1;return[c*s,0,-n*s,0,0,s,0,0,n*s,0,c*s,0,x,y,z,1]},I:[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]};
/* ---- l'eroe: il modello del gioco, catturato scatola per scatola ---- */
// le scatole del gioco: x,y in caselle (1,6 m), z e altezza in pixel (5 cm); qui: metri, y in alto, e l'eroe guarda verso +z
function vxHeroBoxes(walk){const P0=P;if(!P){try{P=newP();const s=LS.get(SAVEK,null);if(s&&s.p)Object.assign(P,s.p)}catch(_){P=P0;return[]}}const s0={px:P.px,py:P.py,fc:P.fc,path:P.path,km:P.km,dr:P.dr,tg:P.tg};let B=[];
  try{P.px=0;P.py=0;P.fc=0;P.path=walk?[{x:0,y:1}]:[];P.km=walk?1:0;P.dr=[0,1];P.tg=null;B=d3Rec(()=>{D3E=P;try{ent(P)}catch(_){}D3E=null})}catch(_){}finally{Object.assign(P,s0);P=P0}
  const V=[];for(let i=0;i+9<B.length;i+=10){const x=B[i],y=B[i+1],z=B[i+2],w=B[i+3],d=B[i+4],h=B[i+5],e=Math.max(0,(B[i+9]%10)-1);if(!(h>0))continue;
    const X=(x+w/2)*1.6,Z=(y+d/2)*1.6,Y=z*.05;vxBox(V,X,Y,Z,Math.abs(w)*1.6,h*.05,Math.abs(d)*1.6,'#'+[B[i+6],B[i+7],B[i+8]].map(v=>(v|0).toString(16).padStart(2,'0')).join(''),e>.2?Math.min(1,e):0)}
  return V}
/* ---- aprire e chiudere ---- */
function vxStart(sc){if(VX.on)vxStop();let gl=null;
  if(!VX.cv){const c=document.createElement('canvas');c.id='vxe';document.body.appendChild(c);VX.cv=c;const u=document.createElement('div');u.id='vxui';document.body.appendChild(u);VX.ui=u;
    const st=document.createElement('style');st.textContent=`#vxe{position:fixed;inset:0;width:100vw;height:100vh;z-index:900;display:none;background:#000;touch-action:none;cursor:grab}#vxe.dr{cursor:grabbing}
#vxui{position:fixed;inset:0;z-index:901;display:none;pointer-events:none;font-family:Georgia,serif;color:#f4ecd8}#vxui *{pointer-events:auto}#vxui .vt{position:absolute;left:18px;top:14px;font-size:20px;text-shadow:0 2px 6px #000;pointer-events:none}
#vxui .vt small{display:block;font-size:12px;opacity:.75;letter-spacing:2px}#vxui .vp{position:absolute;left:50%;bottom:16%;transform:translateX(-50%);background:rgba(10,8,20,.72);border:1px solid #d4af37;border-radius:10px;padding:8px 16px;font-size:15px;pointer-events:none;white-space:nowrap}
#vxui .vp b{display:inline-block;min-width:20px;padding:1px 6px;margin-right:8px;border:1px solid #f4ecd8;border-radius:5px;font-family:monospace}#vxui .vm{position:absolute;left:50%;top:18%;transform:translateX(-50%);font-size:16px;text-shadow:0 2px 6px #000;text-align:center;max-width:80vw;pointer-events:none}
#vxui .vx{position:absolute;right:14px;top:12px;background:rgba(10,8,20,.7);color:#f4ecd8;border:1px solid #d4af37;border-radius:8px;padding:6px 12px;font:14px Georgia,serif;cursor:pointer}
#vxui .vh{position:absolute;left:18px;bottom:14px;font-size:12px;opacity:.7;pointer-events:none}#vxui .vj{position:absolute;left:30px;bottom:30px;width:120px;height:120px;border-radius:50%;border:2px solid rgba(244,236,216,.35);display:none}
#vxui .vj i{position:absolute;left:40px;top:40px;width:40px;height:40px;border-radius:50%;background:rgba(244,236,216,.45)}#vxui .vb{position:absolute;right:26px;bottom:30px;display:none;gap:12px}#vxui .vb button{width:64px;height:64px;border-radius:50%;border:2px solid #d4af37;background:rgba(10,8,20,.6);color:#f4ecd8;font:13px Georgia,serif}
#vxui .vpan{position:absolute;inset:8% 10%;background:rgba(12,8,6,.94);border:2px solid #d4af37;border-radius:14px;padding:18px 22px;overflow:auto;display:none}#vxui .vpan.sm{inset:auto;left:50%;top:50%;transform:translate(-50%,-50%);width:min(640px,88vw);max-height:84vh;box-shadow:0 10px 60px #000c}body.vxon #menu,body.vxon #crown{visibility:hidden}`;document.head.appendChild(st);vxInput()}
  try{gl=VX.gl||VX.cv.getContext('webgl2',{antialias:true});if(!gl)throw new Error('WebGL2');if(!VX.prog){VX.prog=vxProg(gl,VXVS,VXFS);VX.sprog=vxProg(gl,VXSVS,VXSFS);VX.gprog=vxProg(gl,VXGVS,VXGFS);VX.gbuf=gl.createBuffer();VX.gva=gl.createVertexArray();vxShadowInit(gl)}VX.gl=gl}
  catch(e){console.warn('Voxeliaverse',e);menuNote&&menuNote(T88('Il Voxeliaverse ha bisogno di WebGL2: questo browser non ce l\'ha.','The Voxeliaverse needs WebGL2: this browser doesn\'t have it.'));return false}
  VX.sc=sc;VX.col=[];VX.emi=[];for(const c of VX.ch.values()){gl.deleteBuffer(c.b);gl.deleteVertexArray(c.va)}VX.ch.clear();VX.dirty.clear();VX.built=0;
  VX.W=sc.W;VX.H=sc.H;VX.D=sc.D;VX.vox=new Uint8Array(VX.W*VX.H*VX.D);const DV=[];sc.build(DV);VX.deco=vxUp(gl,DV,VX.deco);
  const[x,y,z]=sc.spawn;Object.assign(VX.pl,{x,y,z,vx:0,vy:0,vz:0,yaw:sc.yaw||0,on:1,walk:0,dash:null,slow:1});VX.heroTint=null;VX.cam.yaw=(sc.yaw||0)+Math.PI;VX.cam.pitch=.3;VX.cam.dist=VX.cam.tdist=sc.camDist||4;VX.heroT=-1;VX.on=1;VX.t=0;VX.last=performance.now();VX.keys={};VX.near=null;VX.msg='';
  VX.cv.style.display='block';VX.ui.style.display='block';document.body.classList.add('vxon');vxUI();vxResize();requestAnimationFrame(vxFrame);if(sc.enter)sc.enter();return true}
function vxStop(){if(!VX.on)return;VX.on=0;if(VX.sc&&VX.sc.leave)try{VX.sc.leave()}catch(_){}VX.cv.style.display='none';VX.ui.style.display='none';document.body.classList.remove('vxon');VX.sc=null}
function vxResize(){if(!VX.cv)return;const d=Math.min(2,devicePixelRatio||1)*(SET.rs||1);VX.cv.width=Math.max(1,innerWidth*d|0);VX.cv.height=Math.max(1,innerHeight*d|0)}
addEventListener('resize',()=>{if(VX.on)vxResize()});
/* ---- le ombre del sole ---- */
function vxShadowInit(gl){const s=VX.sh.size,t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.texImage2D(gl.TEXTURE_2D,0,gl.DEPTH_COMPONENT24,s,s,0,gl.DEPTH_COMPONENT,gl.UNSIGNED_INT,null);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_COMPARE_MODE,gl.COMPARE_REF_TO_TEXTURE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_COMPARE_FUNC,gl.LEQUAL);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);const f=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,f);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.TEXTURE_2D,t,0);gl.bindFramebuffer(gl.FRAMEBUFFER,null);VX.sh.fb=f;VX.sh.tex=t}
/* ---- il corpo dell'eroe: gravità, salto, scontri con i voxel, i gradini ---- */
function vxHit(x,y,z){const r=.28,h=1.75,S=VXS_VOX;for(let yy=Math.floor(y/S);yy<=Math.floor((y+h)/S);yy++)for(let zz=Math.floor((z-r)/S);zz<=Math.floor((z+r)/S);zz++)for(let xx=Math.floor((x-r)/S);xx<=Math.floor((x+r)/S);xx++)if(vxSolid(xx,yy,zz))return true;return false}
function vxPhys(dt){const p=VX.pl,k=VX.keys,cy=Math.cos(VX.cam.yaw),sy=Math.sin(VX.cam.yaw);let mx=(k.d?1:0)-(k.a?1:0),mz=(k.s?1:0)-(k.w?1:0);if(VX.touch&&VX.touch.jx!=null){mx=VX.touch.jx;mz=VX.touch.jy}
  // avanti è dove guarda la telecamera
  let dx=mx*cy+mz*sy,dz=-mx*sy+mz*cy;const m=Math.hypot(dx,dz);const run=k.shift?1.6:1,sp=3.4*run*(p.slow==null?1:p.slow);p.ix=dx;p.iz=dz;if(m>.05){dx/=Math.max(1,m);dz/=Math.max(1,m);const ty=Math.atan2(dx,dz);let d=ty-p.yaw;d=Math.atan2(Math.sin(d),Math.cos(d));p.yaw+=d*Math.min(1,dt*12)}
  p.vx=dx*sp;p.vz=dz*sp;p.mv=m>.05;if(p.dash&&p.dash.t>0){p.vx=p.dash.x;p.vz=p.dash.z;p.dash.t-=dt;p.mv=1}p.vy-=(VX.sc.grav||22)*dt;if(p.on&&(k[' ']||(VX.touch&&VX.touch.jump))){p.vy=7.2;p.on=0;if(VX.touch)VX.touch.jump=0}
  const step=(ax,v)=>{const o={x:p.x,y:p.y,z:p.z};o[ax]+=v*dt;if(!vxHit(o.x,o.y,o.z)){p[ax]=o[ax];return true}
    // un gradino alto un voxel si sale da soli
    if(ax!=='y'&&p.on&&!vxHit(o.x,o.y+VXS_VOX+.01,o.z)){p.x=o.x;p.z=o.z;p.y+=VXS_VOX+.01;return true}return false};
  step('x',p.vx);step('z',p.vz);if(VX.sc.bound){const b=VX.sc.bound;p.x=clamp(p.x,b[0],b[1]);p.z=clamp(p.z,b[2],b[3])}const vy=p.vy;if(!step('y',p.vy)){if(vy<0)p.on=1;p.vy=0}else p.on=false;
  if(p.y<-20){const[x,y,z]=VX.sc.spawn;p.x=x;p.y=y;p.z=z;p.vy=0}
  p.walk+=p.mv&&p.on?dt*9:0}
// la telecamera: dietro le spalle; se un muro la copre, si avvicina
function vxCamPos(){const c=VX.cam,p=VX.pl,tx=p.x,ty=p.y+1.55,tz=p.z;c.dist+=(c.tdist-c.dist)*.15;let d=c.dist;const dx=Math.sin(c.yaw)*Math.cos(c.pitch),dy=Math.sin(c.pitch),dz=Math.cos(c.yaw)*Math.cos(c.pitch);
  for(let s=.3;s<c.dist;s+=.05){const x=tx+dx*s,y=ty+dy*s,z=tz+dz*s;if(vxSolid(Math.floor(x/VXS_VOX),Math.floor(y/VXS_VOX),Math.floor(z/VXS_VOX))){d=Math.max(.35,s-.25);break}}
  return{e:[tx+dx*d,ty+dy*d,tz+dz*d],c:[tx,ty,tz],d}}
/* ---- ogni fotogramma ---- */
function vxFrame(now){if(!VX.on)return;requestAnimationFrame(vxFrame);const dt=Math.min(.05,(now-VX.last)/1000);VX.last=now;VX.t+=dt;const gl=VX.gl,sc=VX.sc;
  if(!sc.paused)vxPhys(dt);if(sc.tick)sc.tick(dt,VX.t);
  // i pezzi del mondo da rifare
  if(VX.ch.size===0&&!VX.built){VX.built=1;const L=[],px=VX.pl.x/VXS_VOX/16,pz=VX.pl.z/VXS_VOX/16;for(let y=0;y<Math.ceil(VX.H/16);y++)for(let z=0;z<Math.ceil(VX.D/16);z++)for(let x=0;x<Math.ceil(VX.W/16);x++)L.push([Math.hypot(x+.5-px,z+.5-pz),x+','+y+','+z]);L.sort((a,b)=>a[0]-b[0]);VX.dirty.clear();for(const q of L)VX.dirty.add(q[1])}
  const t0=performance.now(),bud=VX.t<2?45:8;for(const k of VX.dirty){if(performance.now()-t0>bud)break;VX.dirty.delete(k);const[a,b,c]=k.split(',').map(Number);if(a<0||b<0||c<0||a*16>=VX.W||b*16>=VX.H||c*16>=VX.D)continue;const V=vxChunk(a,b,c);const o=VX.ch.get(k);if(!V.length){if(o){gl.deleteBuffer(o.b);gl.deleteVertexArray(o.va);VX.ch.delete(k)}continue}const oo=vxUp(gl,V,o);oo.c=[(a*16+8)*VXS_VOX,(b*16+8)*VXS_VOX,(c*16+8)*VXS_VOX];VX.ch.set(k,oo)}
  // l'eroe: il modello si rifà ogni tanto (camminata), non a ogni fotogramma
  if(VX.t-VX.heroT>.12){VX.heroT=VX.t;VX.hero=vxUp(gl,vxHeroBoxes(VX.pl.mv),VX.hero)}
  // le cose da usare: la più vicina davanti all'eroe
  VX.near=null;let bd=1e9;for(const it of sc.items||[]){const d=Math.hypot(it.p[0]-VX.pl.x,it.p[2]-VX.pl.z)+Math.abs(it.p[1]-(VX.pl.y+.9))*.5;if(d<(it.r||1.6)&&d<bd&&(!it.ok||it.ok())){bd=d;VX.near=it}}
  vxDraw(gl,dt);vxHud()}
function vxDraw(gl,dt){const sc=VX.sc,W2=VX.cv.width,H2=VX.cv.height,cam=vxCamPos();const L=sc.light(VX.t),fo=L.fog;
  const Pm=vxM.per(1.05,W2/H2,.08,120),Vm=vxM.look(cam.e,cam.c),VP=vxM.mul(Pm,Vm);
  // la mappa d'ombra, vista dal sole (o dalla luna) che guarda la stanza
  const C=typeof sc.center==='function'?sc.center():sc.center||[VX.W*VXS_VOX/2,VX.H*VXS_VOX/2,VX.D*VXS_VOX/2],R=sc.radius||14,sd=L.sd,le=[C[0]-sd[0]*R*2,C[1]-sd[1]*R*2,C[2]-sd[2]*R*2],LV=vxM.mul(vxM.ortho(-R,R,-R,R,.1,R*4.5),vxM.look(le,C,Math.abs(sd[1])>.95?[0,0,1]:[0,1,0]));
  let heroM=vxM.tr(VX.pl.x,VX.pl.y+(VX.pl.mv?Math.abs(Math.sin(VX.pl.walk))*.04:0),VX.pl.z,VX.pl.yaw,1);if(sc.heroM)heroM=sc.heroM(heroM);VX.VP=VP;VX.camE=cam.e;
  // con la telecamera troppo vicina (contro un muro) l'eroe non si disegna: coprirebbe tutto; la sua ombra resta
  const PV=vxPlanes(VP),PL=vxPlanes(LV),CR=2.9;
  const drawAll=(U,sh)=>{const tn=q=>{if(U.uTint)gl.uniform4fv(U.uTint,q||[0,0,0,0])};tn();gl.uniformMatrix4fv(U.uM,false,vxM.I);const PP=sh?PL:PV;for(const c of VX.ch.values()){if(c.c&&!vxIn(PP,c.c,CR))continue;gl.bindVertexArray(c.va);gl.drawArrays(gl.TRIANGLES,0,c.n)}if(VX.deco&&VX.deco.n){gl.bindVertexArray(VX.deco.va);gl.drawArrays(gl.TRIANGLES,0,VX.deco.n)}
    if(sc.dyn)for(const d of sc.dyn(VX.t)){if(!d.o||!d.o.n)continue;gl.uniformMatrix4fv(U.uM,false,d.m||vxM.I);tn(d.tint);gl.bindVertexArray(d.o.va);gl.drawArrays(gl.TRIANGLES,0,d.o.n)}tn()
    if(VX.hero&&VX.hero.n&&(sh||cam.d>1.05)){gl.uniformMatrix4fv(U.uM,false,heroM);tn(VX.heroTint);gl.bindVertexArray(VX.hero.va);gl.drawArrays(gl.TRIANGLES,0,VX.hero.n)}};
  gl.enable(gl.DEPTH_TEST);gl.disable(gl.CULL_FACE);
  if(L.shadow!==0){gl.bindFramebuffer(gl.FRAMEBUFFER,VX.sh.fb);gl.viewport(0,0,VX.sh.size,VX.sh.size);gl.clear(gl.DEPTH_BUFFER_BIT);gl.useProgram(VX.sprog.p);gl.uniformMatrix4fv(VX.sprog.U.uL,false,LV);gl.enable(gl.POLYGON_OFFSET_FILL);gl.polygonOffset(2,4);drawAll(VX.sprog.U,1);gl.disable(gl.POLYGON_OFFSET_FILL)}
  gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,W2,H2);gl.clearColor(fo[0],fo[1],fo[2],1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
  const p=VX.prog,U=p.U;gl.useProgram(p.p);gl.uniformMatrix4fv(U.uVP,false,VP);gl.uniformMatrix4fv(U.uL,false,LV);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,VX.sh.tex);gl.uniform1i(U.uSh,0);
  gl.uniform3fv(U.uSd,L.sd);gl.uniform3fv(U.uSc,L.sc);gl.uniform3fv(U.uSky,L.sky);gl.uniform3fv(U.uGnd,L.gnd);gl.uniform3fv(U.uFog,fo);gl.uniform1f(U.uFogD,L.fogD||.04);gl.uniform3fv(U.uCam,cam.e);gl.uniform1f(U.uT,VX.t);gl.uniform1f(U.uShOn,L.shadow===0?0:1);
  // le luci vicine: le otto più vicine alla telecamera
  const LS2=(sc.lights?sc.lights(VX.t):[]).slice().sort((a,b)=>Math.hypot(a[0]-cam.c[0],a[1]-cam.c[1],a[2]-cam.c[2])-Math.hypot(b[0]-cam.c[0],b[1]-cam.c[1],b[2]-cam.c[2])).slice(0,8);
  const lp=new Float32Array(32),lc=new Float32Array(32);LS2.forEach((l,i)=>{lp.set([l[0],l[1],l[2],l[3]],i*4);lc.set([l[4],l[5],l[6],1],i*4)});gl.uniform4fv(U.uLP,lp);gl.uniform4fv(U.uLC,lc);gl.uniform1i(U.uLN,LS2.length);
  drawAll(U);
  // i bagliori
  const G=sc.glow?sc.glow(VX.t):[];if(G.length){const A=new Float32Array(G.length*8);G.forEach((q,i)=>A.set(q,i*8));gl.useProgram(VX.gprog.p);gl.uniformMatrix4fv(VX.gprog.U.uVP,false,VP);gl.uniform1f(VX.gprog.U.uH,H2*.5);
    gl.bindVertexArray(VX.gva);gl.bindBuffer(gl.ARRAY_BUFFER,VX.gbuf);gl.bufferData(gl.ARRAY_BUFFER,A,gl.DYNAMIC_DRAW);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,3,gl.FLOAT,false,32,0);gl.enableVertexAttribArray(1);gl.vertexAttribPointer(1,4,gl.FLOAT,false,32,12);gl.enableVertexAttribArray(2);gl.vertexAttribPointer(2,1,gl.FLOAT,false,32,28);
    gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE);gl.depthMask(false);gl.drawArrays(gl.POINTS,0,G.length);gl.depthMask(true);gl.disable(gl.BLEND);gl.bindVertexArray(null)}}
/* ---- lo schermo sopra la scena ---- */
function vxUI(){const sc=VX.sc,u=VX.ui;const tch=matchMedia('(pointer:coarse)').matches;
  u.innerHTML=`<div class="vt">${esc(sc.n||'')}<small>${esc(sc.sub||'')}</small></div><button class="vx" onclick="vxLeave()">${esc(T88('Esci','Leave'))} ✕</button><div class="vm"></div><div class="vp" style="display:none"></div>
  <div class="vh">${esc(sc.hint?sc.hint(tch):tch?T88('Joystick: cammina · trascina: guarda · ⤒ salta · ✋ usa','Joystick: walk · drag: look · ⤒ jump · ✋ use'):T88('WASD: cammina · Spazio: salta · trascina il mouse: guarda · rotellina: avvicina · E: usa · Maiusc: corri','WASD: walk · Space: jump · drag the mouse: look · wheel: zoom · E: use · Shift: run'))}</div>
  <div class="vj"><i></i></div><div class="vb">${(sc.btns||[]).map(b=>`<button data-b="${b[0]}">${b[1]}</button>`).join('')}<button data-b="j">⤒</button><button data-b="u">✋</button></div><div class="vpan"></div>`;
  if(tch){u.querySelector('.vj').style.display='block';u.querySelector('.vb').style.display='flex'}
  u.querySelectorAll('.vb button').forEach(b=>b.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();const q=b.dataset.b;if(q==='j'){VX.touch=VX.touch||{};VX.touch.jump=1}else if(q==='a'){if(VX.sc&&VX.sc.click)VX.sc.click()}else if(q==='r'){if(VX.sc&&VX.sc.dodge)VX.sc.dodge()}else vxUse()}))}
function vxHud(){const u=VX.ui,pp=u.querySelector('.vp'),m=u.querySelector('.vm');if(!pp)return;const it=VX.near,pan=u.querySelector('.vpan').style.display==='block';
  const h=it&&!pan?`<b>E</b>${esc(typeof it.label==='function'?it.label():it.label)}`:'';if(pp.innerHTML!==h){pp.innerHTML=h;pp.style.display=h?'block':'none'}
  const mm=VX.msg&&VX.t<VX.msgT?VX.msg:'';if(m.textContent!==mm)m.textContent=mm}
function vxSay(s,d){VX.msg=s;VX.msgT=VX.t+(d||3.5)}
function vxUse(){if(!VX.on)return;const pan=VX.ui.querySelector('.vpan');if(pan.style.display==='block')return;const it=VX.near;if(it&&it.act)it.act()}
function vxPanel(h,sm){const pan=VX.ui.querySelector('.vpan');if(h==null){pan.style.display='none';pan.innerHTML='';if(VX.sc)VX.sc.paused=0;return}pan.className='vpan'+(sm?' sm':'');pan.innerHTML=h;pan.style.display='block';if(VX.sc)VX.sc.paused=1;VX.keys={}}
function vxLeave(){const sc=VX.sc;if(sc&&sc.onLeave){sc.onLeave();return}vxStop();if(typeof toMenu==='function'&&!started)toMenu()}
/* ---- i comandi ---- */
function vxInput(){const cv=VX.cv;
  addEventListener('keydown',e=>{if(!VX.on)return;if(!/^F\d+$/.test(e.key))e.stopImmediatePropagation();const k=e.key.length===1?e.key.toLowerCase():e.key;const pan=VX.ui.querySelector('.vpan').style.display==='block';
    if(k==='Escape'){if(pan)vxPanel(null);else vxLeave();e.preventDefault();return}if(pan)return;
    const m={arrowup:'w',arrowdown:'s',arrowleft:'a',arrowright:'d'}[k.toLowerCase()]||k;if('wasd '.includes(m)||m==='Shift'){if(m==='Shift'&&!e.repeat&&VX.sc&&VX.sc.dodge)VX.sc.dodge();VX.keys[m==='Shift'?'shift':m]=1;e.preventDefault();e.stopImmediatePropagation()}
    if(VX.sc&&VX.sc.click&&(m==='j'||m==='k')&&!e.repeat){VX.sc.click();e.preventDefault()}if(VX.sc&&VX.sc.dodge&&m==='q'&&!e.repeat){VX.sc.dodge();e.preventDefault()}
    if(m==='e'||m==='Enter'){vxUse();e.preventDefault();e.stopImmediatePropagation()}},true);
  addEventListener('keyup',e=>{if(!VX.on)return;const k=e.key.length===1?e.key.toLowerCase():e.key;const m={arrowup:'w',arrowdown:'s',arrowleft:'a',arrowright:'d'}[k.toLowerCase()]||k;VX.keys[m==='Shift'?'shift':m]=0},true);
  addEventListener('blur',()=>{VX.keys={}});
  cv.addEventListener('contextmenu',e=>{if(VX.on)e.preventDefault()});
  cv.addEventListener('pointerdown',e=>{if(!VX.on)return;if(e.button===2){if(VX.sc&&VX.sc.dodge)VX.sc.dodge();e.preventDefault();return}cv.setPointerCapture(e.pointerId);const tch=e.pointerType==='touch';
    if(tch&&e.clientX<innerWidth*.4){VX.touch=VX.touch||{};VX.touch.id=e.pointerId;VX.touch.x0=e.clientX;VX.touch.y0=e.clientY;VX.touch.jx=0;VX.touch.jy=0;return}
    VX.drag={id:e.pointerId,x:e.clientX,y:e.clientY,x0:e.clientX,y0:e.clientY,t:performance.now()};cv.classList.add('dr')});
  cv.addEventListener('pointermove',e=>{if(!VX.on)return;const T=VX.touch;if(T&&T.id===e.pointerId){const dx=(e.clientX-T.x0)/50,dy=(e.clientY-T.y0)/50,l=Math.hypot(dx,dy);T.jx=l>1?dx/l:dx;T.jy=l>1?dy/l:dy;const j=VX.ui.querySelector('.vj i');if(j)j.style.transform=`translate(${T.jx*36}px,${T.jy*36}px)`;return}
    const d=VX.drag;if(!d||d.id!==e.pointerId)return;VX.cam.yaw-=(e.clientX-d.x)*.0065;VX.cam.pitch=clamp(VX.cam.pitch+(e.clientY-d.y)*.005,-.35,1.25);d.x=e.clientX;d.y=e.clientY});
  const up=e=>{const T=VX.touch;if(T&&T.id===e.pointerId){T.id=null;T.jx=null;T.jy=null;const j=VX.ui.querySelector('.vj i');if(j)j.style.transform='';return}const d=VX.drag;if(d&&d.id===e.pointerId){if(Math.hypot(e.clientX-d.x0,e.clientY-d.y0)<6&&performance.now()-d.t<350){if(VX.sc&&VX.sc.click)VX.sc.click();else vxUse()}VX.drag=null;cv.classList.remove('dr')}};
  cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
  cv.addEventListener('wheel',e=>{if(!VX.on)return;VX.cam.tdist=clamp(VX.cam.tdist*(e.deltaY>0?1.12:.89),1.6,9);e.preventDefault()},{passive:false})}
