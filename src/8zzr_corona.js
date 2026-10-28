/* ================= 7.42: il nuovo menu — la Corona di Voxel in 3D =================
   La Corona gira su se stessa sopra un cuscino di velluto. Ogni gemma è una modalità:
   la telecamera si avvicina alla gemma scelta e, quando la si avvia, la gemma si accende del suo colore.
   Senza WebGL 2 resta il menu a schede di prima (#msel). */
const CRGEM=[
 {k:'story',g:'Rubino',c:[230,40,58],m:'Modalità Storia',s:'Il Regno Perduto',d:'Crea il tuo eroe, scegli la difficoltà, rivivi il prologo e riunisci la Corona di Voxel.',go:()=>mode('story')},
 {k:'ow',g:'Smeraldo',c:[40,214,110],m:'Tomorrow',s:'Un mondo senza confini',d:'Fonda la tua città, allarga il regno, stringi alleanze con altre fazioni e conquista il mondo, da solo o con gli amici.',go:()=>mode('ow')},
 {k:'dim',g:'Zaffiro',c:[50,110,240],m:'Voxelia Dimension',s:'La cabina blu',d:'Un viaggio attraverso le epoche: Far West, Londra vittoriana, Rivoluzione e Grande Guerra.',go:()=>mode('dim'),lock:()=>!(typeof DEV!=='undefined'&&DEV.on),lk:'Questa gemma è ancora sigillata: la Dimension tornerà presto.'},
 {k:'parco',g:'Ametista',c:[170,70,235],m:'Parco giochi',s:'Voxelia Studio',d:'Costruisci i tuoi mondi con mappe, personaggi, dialoghi, missioni, armi, musiche e cinematiche, e giocali.',go:()=>mode('parco')},
 {k:'mondi',g:'Topazio',c:[255,170,30],m:'Mondi della community',s:'Gioca e pubblica',d:'Gioca ai mondi creati dagli altri giocatori, dai le stelle, commenta e pubblica i tuoi.',go:()=>mbOpen()},
 {k:'film',g:'Diamante',c:[200,240,255],m:'Prologo e filmati',s:'La storia della Corona',d:'Il prologo raccontato dall\'inizio e le scene della storia che hai già sbloccato.',go:()=>playIntro(),alt:[['▶ Prologo',()=>playIntro()],['🎞 Scene della storia',()=>filmMenu()]]}];
const CRW={ok:null,gl:null,cv:null,vis:0,sel:-1,hov:-1,th:0,thv:.32,lt:0,t:0,go:null,drag:null,cam:{tx:0,ty:19,tz:0,d:150,p:.3,sy:null},mesh:[],gp:[]};
const CRR=20.5,CRGY=6;   // raggio della fascia e altezza delle gemme

/* ---- la geometria: scatole orientate (centro, mezze misure, angolo), 36 byte per vertice ---- */
function crBuild(){const V=[],I=[];const box=(cx,cy,cz,hw,hh,hd,a,col,mat,gid)=>{const ca=Math.cos(a),sa=Math.sin(a);
    // assi: t tangente (orizzontale), u su, r radiale (verso l'esterno)
    const T=[-sa,0,ca],U=[0,1,0],R=[ca,0,sa],F=[[R,T,U,hd,hw,hh],[[-R[0],0,-R[2]],T,U,hd,hw,hh],[T,R,U,hw,hd,hh],[[-T[0],0,-T[2]],R,U,hw,hd,hh],[U,T,R,hh,hw,hd],[[0,-1,0],T,R,hh,hw,hd]];
    for(const[n,p,q,dn,dp,dq]of F){const b=V.length/9;for(const[s,t2]of[[-1,-1],[1,-1],[1,1],[-1,1]]){
        V.push(cx+n[0]*dn+p[0]*dp*s+q[0]*dq*t2,cy+n[1]*dn+p[1]*dp*s+q[1]*dq*t2,cz+n[2]*dn+p[2]*dp*s+q[2]*dq*t2,n[0],n[1],n[2],(col[0]|0)+(col[1]|0)*256+(col[2]|0)*65536,mat+gid*16,(s>0?255:0)+(t2>0?255:0)*256)}
      // il verso dei triangoli non conta: le facce si disegnano da entrambi i lati
      I.push(b,b+1,b+2,b,b+2,b+3)}};
  const G=[236,178,58],GD=[190,132,40],GL=[255,214,110],ring=(n,z0,h,r0,r1,col,mat,f)=>{for(let s=0;s<n;s++){const a=s/n*Math.PI*2,r=(r0+r1)/2,w=Math.PI*r1/n*1.06;const k=f?f(s):1;box(Math.cos(a)*r,z0+h/2,Math.sin(a)*r,w,h/2,(r1-r0)/2,a,col.map(v=>Math.min(255,v*k)),mat,0)}};
  const M={crown:{V:[],I:[]}};
  // la fascia: bordo in basso, fascia, bordo in alto, perle
  ring(48,0,2.2,18.4,22.6,GD,0);ring(48,2.2,8,19,22,G,0,s=>(s&1)?1:.93);ring(48,10.2,2,18.4,22.6,GD,0);
  for(let s=0;s<48;s+=2){const a=(s+1)/48*Math.PI*2;box(Math.cos(a)*21.6,13,Math.sin(a)*21.6,.7,.8,.7,a,[244,238,226],3,0)}
  // il velluto dentro: una cupola bassa e morbida
  for(let k=0;k<11;k++){const f=k/11,r=18.7*Math.sqrt(1-f*f)+.4,z=2+k*1.55,n=Math.max(10,Math.round(r*1.6));for(let s2=0;s2<n;s2++){const a=s2/n*Math.PI*2+k*.21;box(Math.cos(a)*r/2,z+.8,Math.sin(a)*r/2,Math.PI*r/n*1.12,.8,r/2,a,[132-k*3,18+k,38+k],1,0)}}
  // sei punte grandi con la gemma in cima, sei piccole fra una e l'altra
  for(let i=0;i<6;i++){const a=i/6*Math.PI*2,ca=Math.cos(a),sa=Math.sin(a),r=CRR,gc=CRGEM[i].c,gb=gc.map(v=>Math.min(255,v*1.2+30)),gd=gc.map(v=>v*.72);
    for(let L=0;L<7;L++){const w=3.6-L*.5;box(ca*r,12.2+L*2.2+1.1,sa*r,w,1.1,1.2,a,L%2?G:GL,0,0)}
    box(ca*r,29.6,sa*r,1.5,1.5,1.5,a,GL,0,0);box(ca*(r+.2),32.3,sa*(r+.2),.9,1.2,.9,a+.785,gc,2,i+1);
    // la gemma sulla fascia, tagliata a rombo: castone d'oro, pietra, faccette e punta
    const at=(rad,t2,y,hw,hh,hd,col,mat,gid)=>box(ca*rad-sa*t2,y,sa*rad+ca*t2,hw,hh,hd,a,col,mat,gid);
    at(22.15,0,CRGY,3.4,1.6,.6,GD,0,0);at(22.15,0,CRGY,1.6,3.6,.6,GD,0,0);at(22.15,0,CRGY,2.6,2.8,.62,GD,0,0);
    at(22.9,0,CRGY,2.3,2.3,.55,gd,2,i+1);at(22.95,0,CRGY+2.7,1.3,.75,.5,gc,2,i+1);at(22.95,0,CRGY-2.7,1.3,.75,.5,gd,2,i+1);at(22.95,2.6,CRGY,.75,1.3,.5,gc,2,i+1);at(22.95,-2.6,CRGY,.75,1.3,.5,gd,2,i+1);
    at(23.5,0,CRGY,1.5,1.5,.4,gc,2,i+1);at(23.95,-.3,CRGY+.3,.8,.8,.3,gb,2,i+1);
    const b=a+Math.PI/6,cb=Math.cos(b),sb=Math.sin(b);for(let L=0;L<4;L++)box(cb*r,12.2+L*1.8+.9,sb*r,2.2-L*.5,.9,1,b,G,0,0);box(cb*r,20.2,sb*r,.8,.8,.8,b,[244,238,226],3,0);
    box(cb*22.4,CRGY,sb*22.4,1.1,1.1,.5,b,GL,0,0);box(cb*22.7,CRGY,sb*22.7,.55,.55,.4,b,[244,238,226],3,0);
    // gli archi che salgono verso il globo
    for(let k=1;k<13;k++){const f=k/13,rr=(r-1.2)*(1-f),yy=27.5+Math.sin(f*Math.PI/2)*8.5;box(ca*rr,yy,sa*rr,.85,.85,1.15,a,k%2?G:GD,0,0)}}
  // il globo con la croce
  box(0,38.6,0,2.4,2.4,2.4,0,GL,0,0);box(0,38.6,0,2.7,.45,2.7,.785,GD,0,0);box(0,43.2,0,.55,2.4,.55,0,GL,0,0);box(0,43.8,0,1.7,.5,.55,0,GL,0,0);
  M.crown={V:V.splice(0),I:I.splice(0)};
  // il cuscino e la colonna (non girano)
  box(0,-3.5,0,27,3.5,27,0,[120,18,36],1,0);box(0,-3,0,25,4.4,25,0,[138,24,44],1,0);box(0,-.9,0,20,.6,20,.0001,[150,30,52],1,0);
  for(const[sx,sz]of[[1,1],[1,-1],[-1,1],[-1,-1]]){box(sx*26.5,-2,sz*26.5,1.2,1.2,1.2,0,GL,0,0);box(sx*27,-5,sz*27,.8,2.4,.8,0,GD,0,0)}
  box(0,-8.5,0,30,1.6,30,0,[176,170,160],4,0);box(0,-24,0,23,14,23,0,[150,146,138],4,0);box(0,-38,0,30,2,30,0,[168,162,152],4,0);
  M.base={V:V.splice(0),I:I.splice(0)};
  // le scintille che girano intorno
  for(let i=0;i<44;i++){const a=i*2.399,r=31+(i*7%6),y=2+(i*13%40),z=.16+(i%3)*.06;box(Math.cos(a)*r,y,Math.sin(a)*r,z,z,z,a+i,[255,220,150],5,0)}
  M.dust={V:V.splice(0),I:I.splice(0)};
  return M}

const CR_VS=`#version 300 es
uniform mat4 VP,MD;in vec3 a;in vec3 n;in vec4 c;in vec4 e;out vec3 wp;out vec3 nn;out vec4 vc;out vec4 ve;
void main(){vec4 w=MD*vec4(a,1.);wp=w.xyz;nn=mat3(MD)*n;vc=c;ve=e;gl_Position=VP*w;}`;
const CR_FS=`#version 300 es
precision highp float;uniform vec3 CAM,KEY,KC,FILL,FC,AMB,LITC,GP;uniform float TM,SEL,HOV,LITI,LITK,LOCK;in vec3 wp;in vec3 nn;in vec4 vc;in vec4 ve;out vec4 o;
float h3(vec3 p){p=fract(p*.3183099+.1);p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
void main(){vec3 N=normalize(nn);vec3 V=normalize(CAM-wp);if(dot(N,V)<0.)N=-N;
 float mg=floor(ve.x*255.+.5),m=mod(mg,16.),gid=floor(mg/16.+.01);vec3 base=vc.rgb;vec2 uv=ve.yz;
 float ed=min(min(uv.x,1.-uv.x),min(uv.y,1.-uv.y));float edge=mix(.72,1.,smoothstep(0.,.07,ed));
 vec3 H=normalize(KEY+V);float dk=max(dot(N,KEY),0.),df=max(dot(N,FILL),0.);vec3 col;
 float ao=mix(.55,1.,smoothstep(-40.,14.,wp.y))*mix(.75,1.,smoothstep(5.,22.,length(wp.xz)+wp.y*.15));
 if(m<.5){vec3 R=reflect(-V,N);vec3 env=mix(vec3(.10,.06,.05),vec3(1.,.86,.62),smoothstep(-.3,.9,R.y))+vec3(.35,.25,.5)*pow(max(R.x,0.),3.)*.4;
   col=base*(AMB*.6+KC*dk*.7+FC*df*.25)*ao+base*env*.6*ao+KC*pow(max(dot(N,H),0.),56.)*1.3*(base+.25);
   col+=base*vec3(.6,.4,1.)*pow(1.-max(dot(N,V),0.),3.)*.35;}
 else if(m<1.5){float sh=pow(1.-max(dot(N,V),0.),2.2);col=base*(AMB+KC*dk*.85+FC*df*.3)*ao+base*sh*.9+vec3(1.,.7,.75)*sh*.05;}
 else if(m<2.5){float sp=pow(max(dot(N,H),0.),110.),fr=pow(1.-max(dot(N,V),0.),3.),fc=.78+.22*h3(floor(wp*1.7)+gid);
   bool lk=abs(gid-LOCK)<.5;vec3 b2=lk?vec3(dot(base,vec3(.3,.5,.2)))*.55+vec3(.04,.05,.09):base;
   col=b2*(.3+.55*dk+.2*df)*fc+b2*.45*fr+vec3(1.)*sp*(lk?.4:1.8);
   float gl=lk?0.:.16+(abs(gid-SEL)<.5?.45+.3*sin(TM*4.):0.)+(abs(gid-HOV)<.5?.25:0.)+(abs(gid-LITI)<.5?LITK*2.6:0.);col+=b2*gl;}
 else if(m<3.5){float sp=pow(max(dot(N,H),0.),40.);col=base*(AMB+KC*dk*.8+FC*df*.3)*ao+vec3(sp*.6);}
 else if(m<4.5){float g=.86+.14*h3(floor(wp*.9));col=base*g*(AMB*1.1+KC*dk*.75+FC*df*.3)*ao;}
 else{col=base*(1.3+.5*sin(TM*3.+wp.x));}
 if(LITK>0.&&m<4.5){vec3 d=GP-wp;float dd=length(d);col+=base*LITC*LITK*(max(dot(N,d/max(dd,.01)),0.)*.8+.25)*9./(1.+dd*dd*.012);}
 col*=edge;float mx=max(max(col.r,col.g),max(col.b,.001)),f=mx<.9?1.12*mx/(1.+.32*mx):1.-.22*exp(-(mx-.9)*1.4);col=mix(col/mx*f,vec3(f),smoothstep(3.,12.,mx)*.4);o=vec4(pow(max(col,0.),vec3(.95)),1.);}`;

function crInit(){if(CRW.ok!=null)return CRW.ok;CRW.ok=false;try{
  const host=$('crown');if(!host)return false;const cv=$('crcv'),gl=cv.getContext('webgl2',{antialias:true,alpha:true,premultipliedAlpha:true});if(!gl)return false;
  const sh=(t,s)=>{const o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);if(!gl.getShaderParameter(o,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(o));return o};
  const p=gl.createProgram();gl.attachShader(p,sh(gl.VERTEX_SHADER,CR_VS));gl.attachShader(p,sh(gl.FRAGMENT_SHADER,CR_FS));['a','n','c','e'].forEach((k,i)=>gl.bindAttribLocation(p,i,k));gl.linkProgram(p);
  if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p));
  const U={};for(const k of['VP','MD','CAM','KEY','KC','FILL','FC','AMB','LITC','GP','TM','SEL','HOV','LITI','LITK','LOCK'])U[k]=gl.getUniformLocation(p,k);
  const M=crBuild();CRW.mesh={};for(const k in M){const{V,I}=M[k],buf=new ArrayBuffer(V.length/9*36),F=new Float32Array(buf),U8=new Uint8Array(buf);
    for(let i=0,v=0;i<V.length;i+=9,v++){const o=v*9;F[o]=V[i];F[o+1]=V[i+1];F[o+2]=V[i+2];F[o+3]=V[i+3];F[o+4]=V[i+4];F[o+5]=V[i+5];const b=v*36;
      U8[b+24]=V[i+6]&255;U8[b+25]=V[i+6]>>8&255;U8[b+26]=V[i+6]>>16&255;U8[b+27]=255;U8[b+28]=V[i+7];U8[b+29]=V[i+8]&255;U8[b+30]=V[i+8]>>8&255;U8[b+31]=0}
    const va=gl.createVertexArray();gl.bindVertexArray(va);const vb=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,vb);gl.bufferData(gl.ARRAY_BUFFER,buf,gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,3,gl.FLOAT,false,36,0);gl.enableVertexAttribArray(1);gl.vertexAttribPointer(1,3,gl.FLOAT,false,36,12);
    gl.enableVertexAttribArray(2);gl.vertexAttribPointer(2,4,gl.UNSIGNED_BYTE,true,36,24);gl.enableVertexAttribArray(3);gl.vertexAttribPointer(3,4,gl.UNSIGNED_BYTE,true,36,28);
    const ib=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ib);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint32Array(I),gl.STATIC_DRAW);gl.bindVertexArray(null);CRW.mesh[k]={va,n:I.length}}
  CRW.gl=gl;CRW.cv=cv;CRW.p=p;CRW.U=U;cv.addEventListener('webglcontextlost',e=>{e.preventDefault();CRW.ok=false;crShow(0)});return CRW.ok=true}
 catch(e){console.warn('Corona 3D non disponibile',e);return CRW.ok=false}}

const crRotY=a=>{const c=Math.cos(a),s=Math.sin(a);return new Float32Array([c,0,-s,0,0,1,0,0,s,0,c,0,0,0,0,1])};
const crWrap=a=>{a=(a+Math.PI)%(Math.PI*2);if(a<0)a+=Math.PI*2;return a-Math.PI};
// dove sta la gemma i nel mondo, con la corona girata di th
function crGemW(i,th){const a=i/6*Math.PI*2-th,r=23.5;return[Math.cos(a)*r,CRGY,Math.sin(a)*r]}
function crProj(p){const m=CRW.vp;if(!m)return null;const x=p[0],y=p[1],z=p[2],w=m[3]*x+m[7]*y+m[11]*z+m[15];if(w<.1)return null;
  return[((m[0]*x+m[4]*y+m[8]*z+m[12])/w*.5+.5)*CRW.W,(1-((m[1]*x+m[5]*y+m[9]*z+m[13])/w*.5+.5))*CRW.H]}
const crLocked=i=>!!(CRGEM[i].lock&&CRGEM[i].lock());

function crFrame(dt){const gl=CRW.gl,cv=CRW.cv,dpr=Math.min(2,window.devicePixelRatio||1),Wc=cv.clientWidth||innerWidth,Hc=cv.clientHeight||innerHeight;CRW.W=Wc;CRW.H=Hc;
  const w=Math.round(Wc*dpr),h=Math.round(Hc*dpr);if(cv.width!==w||cv.height!==h){cv.width=w;cv.height=h}CRW.t+=dt;const k=1-Math.exp(-dt*3.2),c=CRW.cam;
  // la corona gira da sola; con una gemma scelta si ferma con la gemma davanti
  if(CRW.drag){}else if(CRW.sel>=0){const tg=CRW.sel/6*Math.PI*2-Math.PI/2;CRW.th+=crWrap(tg-CRW.th)*Math.min(1,dt*3.4);CRW.thv=0}
  else{CRW.thv+=(.32-CRW.thv)*Math.min(1,dt*1.5);CRW.th+=CRW.thv*dt}
  // l'inquadratura: lo spazio libero fra il titolo e la scheda in basso
  const hd=document.querySelector('#menu .mhead'),ui=document.querySelector('#crown .crui');let top=hd&&CRW.sel<0?hd.getBoundingClientRect().bottom+4:Hc*.03,bot=ui?ui.getBoundingClientRect().top-4:Hc*.72;
  if(bot-top<150){top=Math.max(0,bot-150)}if(bot<=top+20){top=0;bot=Hc}const rh=bot-top,tn=Math.tan(17*Math.PI/180),as=Wc/Hc;
  let F=[0,19,0],sz=60,p=.3;if(CRW.sel>=0){F=[0,CRGY+1.5,22];sz=CRW.go?11:15;p=.12}
  const d=Math.max(sz*Hc/(2*.94*rh*tn),sz*1.05/(2*.9*tn*as)),sy=1-2*((top+bot)/2)/Hc;
  c.tx+=(F[0]-c.tx)*k;c.ty+=(F[1]-c.ty)*k;c.tz+=(F[2]-c.tz)*k;c.d+=(d-c.d)*k;c.p+=(p-c.p)*k;c.sy=c.sy==null?sy:c.sy+(sy-c.sy)*k;
  const sway=Math.sin(CRW.t*.4)*.05,eye=[c.tx+Math.sin(sway)*Math.cos(c.p)*c.d,c.ty+Math.sin(c.p)*c.d,c.tz+Math.cos(sway)*Math.cos(c.p)*c.d];
  const Pm=d3M.per(34*Math.PI/180,as,1,900);Pm[9]=-c.sy;const Vw=d3M.look(eye,[c.tx,c.ty,c.tz]);CRW.vp=d3M.mul(Pm,Vw);
  gl.viewport(0,0,w,h);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.enable(gl.DEPTH_TEST);gl.disable(gl.CULL_FACE);gl.useProgram(CRW.p);const U=CRW.U;
  gl.uniformMatrix4fv(U.VP,false,CRW.vp);gl.uniform3fv(U.CAM,eye);const nrm=v=>{const l=Math.hypot(...v);return v.map(x=>x/l)};
  gl.uniform3fv(U.KEY,nrm([-.45,.8,.55]));gl.uniform3f(U.KC,1.05,.95,.82);gl.uniform3fv(U.FILL,nrm([.7,.15,.3]));gl.uniform3f(U.FC,.35,.42,.75);gl.uniform3f(U.AMB,.2,.17,.24);
  gl.uniform1f(U.TM,CRW.t);gl.uniform1f(U.SEL,CRW.sel+1);gl.uniform1f(U.HOV,CRW.hov+1);gl.uniform1f(U.LOCK,CRGEM.findIndex((_,i)=>crLocked(i))+1);
  let lk=0,li=0,gp=[0,0,0],lc=[0,0,0];if(CRW.go){const q=(performance.now()-CRW.go.t0)/1300;lk=Math.min(1,q*1.6);li=CRW.go.i+1;gp=crGemW(CRW.go.i,CRW.th);gp=[gp[0]*1.15,gp[1],gp[2]*1.15];lc=CRGEM[CRW.go.i].c.map(v=>v/255)}
  gl.uniform1f(U.LITI,li);gl.uniform1f(U.LITK,lk);gl.uniform3fv(U.GP,gp);gl.uniform3fv(U.LITC,lc);
  const draw=(m,M)=>{gl.uniformMatrix4fv(U.MD,false,M);gl.bindVertexArray(m.va);gl.drawElements(gl.TRIANGLES,m.n,gl.UNSIGNED_INT,0)};
  draw(CRW.mesh.base,crRotY(0));draw(CRW.mesh.crown,crRotY(CRW.th));draw(CRW.mesh.dust,crRotY(-CRW.t*.15));gl.bindVertexArray(null);
  // il bagliore della gemma accesa sopra la vista
  const gw=$('crglow');if(gw){if(CRW.go){const s=crProj(crGemW(CRW.go.i,CRW.th)),q=Math.min(1,(performance.now()-CRW.go.t0)/1300),cc=CRGEM[CRW.go.i].c.join(',');
      if(s){gw.style.background=`radial-gradient(circle at ${s[0]}px ${s[1]}px,rgba(${cc},${.95*q}) 0,rgba(${cc},${.7*q}) ${30+q*180}px,rgba(${cc},${.25*q}) ${90+q*420}px,rgba(${cc},0) ${160+q*900}px)`;gw.style.opacity=1}}
    else gw.style.opacity=0}
  const fl=$('crflash');if(fl&&CRW.go){const q=(performance.now()-CRW.go.t0)/1300;fl.style.opacity=Math.max(0,Math.min(1,(q-.72)/.28))*.8}}

function crCard(){const card=$('crcard'),hint=$('crhint');if(!card)return;const i=CRW.sel;
  for(const b of document.querySelectorAll('#crchips button'))b.classList.toggle('on',+b.dataset.i===i);
  if(i<0){card.hidden=true;hint.hidden=false;return}const G=CRGEM[i],lk=crLocked(i),cc=G.c.join(',');hint.hidden=true;card.hidden=false;card.style.setProperty('--gc',`rgb(${cc})`);
  card.innerHTML=`<div class="crg"><i></i><span>${G.g}</span><small>${G.s}</small></div><h2>${G.m}</h2><p>${lk?G.lk:G.d}</p><div class="crbtn"><button class="crarr" onclick="crStep(-1)" aria-label="Gemma precedente">◀</button>${
    lk?'<button class="crgo" disabled>🔒 Sigillata</button>':G.alt?G.alt.map((a,j)=>`<button class="crgo" onclick="crGo(${j})">${a[0]}</button>`).join(''):'<button class="crgo" onclick="crGo()">Entra ▶</button>'}<button class="crarr" onclick="crStep(1)" aria-label="Gemma successiva">▶</button></div>`;
  if(typeof menuAnim==='function')menuAnim(card)}
function crPick(i){if(CRW.go)return;if(i===CRW.sel)return;CRW.sel=i;document.body.classList.toggle('crsel',i>=0);crCard();if(i>=0){try{tone(520+i*70,.08,'triangle',.04);setTimeout(()=>tone(780+i*70,.1,'sine',.03),70)}catch(_){}}}
function crStep(d){crPick(CRW.sel<0?(d>0?0:5):(CRW.sel+d+6)%6)}
function crGo(j){const i=CRW.sel;if(i<0||CRW.go||crLocked(i))return;const G=CRGEM[i],fn=G.alt&&j!=null?G.alt[j][1]:G.go;CRW.go={i,t0:performance.now()};
  try{[0,1,2,3].forEach(n=>setTimeout(()=>tone([523,659,784,1046][n]*(1+i*.06),.22,'sine',.05),n*90))}catch(_){}
  const fl=$('crflash');if(fl){fl.style.background=`radial-gradient(circle at 50% 45%,rgb(${G.c.map(v=>Math.min(255,v+90)).join(',')}),rgb(${G.c.join(',')}) 60%)`;fl.style.transition='none'}
  setTimeout(()=>{CRW.go=null;if(fl){fl.style.transition='opacity .7s ease-out';fl.style.opacity=0}try{fn()}catch(e){console.warn(e)}},1300)}

// è il momento di mostrarla? solo nella scelta della modalità, con il menu aperto
function crWant(){const m=$('menu'),s=$('msel');return!!(CRW.ok&&m&&s&&!s.hidden&&m.style.display!=='none'&&typeof inMenu!=='undefined'&&inMenu&&!started&&!(typeof INTRO!=='undefined'&&INTRO)&&!(typeof CN!=='undefined'&&CN)&&!document.body.classList.contains('edm'))}
function crBusy(){for(const id of['mb','set','chg','look','fmenu','pause']){const e=$(id);if(e&&!e.hidden&&e.offsetWidth>0&&getComputedStyle(e).display!=='none'&&getComputedStyle(e).visibility!=='hidden')return true}
  const a=document.activeElement;return!!(a&&/INPUT|TEXTAREA|SELECT/.test(a.tagName))}
function crShow(on){on=!!on;if(CRW.vis===on)return;CRW.vis=on;document.body.classList.toggle('crown',on);const h=$('crown');if(h)h.hidden=!on;if(on){CRW.lt=performance.now();crCard();requestAnimationFrame(crLoop)}}
function crLoop(now){if(!CRW.vis)return;const dt=Math.min(.1,Math.max(0,(now-CRW.lt)/1000));CRW.lt=now;if(!crWant()){crShow(0);return}try{crFrame(dt)}catch(e){console.warn(e);CRW.ok=false;crShow(0);return}requestAnimationFrame(crLoop)}
setInterval(()=>{if(CRW.vis&&!crWant())crShow(0);if(!CRW.vis){if(CRW.ok==null){const m=$('menu');if(m&&m.style.display!=='none'&&typeof inMenu!=='undefined'&&inMenu)crInit()}if(crWant())crShow(1)}},200);

// mouse e dita: passare sopra una gemma la illumina, cliccarla la sceglie, trascinare fa girare la corona
function crHit(x,y){let best=-1,bd=1e9;for(let i=0;i<6;i++){const p=crGemW(i,CRW.th);if(p[2]<4)continue;const s=crProj(p);if(!s)continue;const dd=Math.hypot(s[0]-x,s[1]-y);
  const R=Math.max(26,40*150/Math.max(30,CRW.cam.d));if(dd<R&&dd<bd){bd=dd;best=i}}return best}
const crOnUi=e=>!!(e.target&&e.target.closest&&e.target.closest('button,a,input,select,textarea,#crcard,.mfoot,.mhead,#mb,#set,#chg,#look,#fmenu,dialog'));
addEventListener('pointermove',e=>{if(!CRW.vis)return;if(CRW.drag){const dx=e.clientX-CRW.drag.x;CRW.drag.x=e.clientX;if(Math.abs(e.clientX-CRW.drag.x0)>6)CRW.drag.m=1;CRW.th-=dx*.008;return}
  const h=crOnUi(e)?-1:crHit(e.clientX,e.clientY);if(h!==CRW.hov){CRW.hov=h;document.body.classList.toggle('crhov',h>=0);if(h>=0)try{tone(900+h*40,.03,'sine',.015)}catch(_){}}});
addEventListener('pointerdown',e=>{if(!CRW.vis||crOnUi(e)||crBusy()||CRW.go)return;CRW.drag={x:e.clientX,x0:e.clientX,m:0}});
addEventListener('pointerup',e=>{if(!CRW.vis||!CRW.drag)return;const d=CRW.drag;CRW.drag=null;if(d.m)return;if(crOnUi(e)||crBusy())return;const h=crHit(e.clientX,e.clientY);
  if(h>=0){if(h===CRW.sel)crGo();else crPick(h)}else if(CRW.sel>=0)crPick(-1)});
addEventListener('keydown',e=>{if(!CRW.vis||crBusy()||CRW.go)return;const k=e.key;
  if(k==='ArrowRight'||k==='d'||k==='D'){crStep(1);e.preventDefault()}else if(k==='ArrowLeft'||k==='a'||k==='A'){crStep(-1);e.preventDefault()}
  else if(k==='Enter'&&!(e.target&&e.target.closest&&e.target.closest('button'))){if(CRW.sel<0)crPick(0);else crGo(CRGEM[CRW.sel].alt?0:undefined);e.preventDefault()}
  else if(k==='Escape'&&CRW.sel>=0){crPick(-1);e.preventDefault()}});

// la parte nella pagina: tela, bagliore, scheda della gemma e i sei bottoni (anche per tastiera e lettori di schermo)
(function(){const s=$('msel');if(!s)return;s.insertAdjacentHTML('afterend',`<div id="crown" hidden><canvas id="crcv" aria-hidden="true"></canvas><div id="crglow" aria-hidden="true"></div><div id="crflash" aria-hidden="true"></div>
<div class="crui"><p id="crhint">Scegli una gemma della Corona <small>Clic su una gemma · ◀ ▶ per girare · trascina per ruotare</small></p><div id="crcard" hidden aria-live="polite"></div>
<div id="crchips" role="group" aria-label="Le gemme della Corona">${CRGEM.map((G,i)=>`<button data-i="${i}" style="--gc:rgb(${G.c.join(',')})" onclick="crPick(${i})" title="${G.g}: ${G.m}"><i></i><span>${G.m}</span></button>`).join('')}</div></div></div>`);
  const st=document.createElement('style');st.textContent=`
body.crown #msel{display:none!important}
#crown{position:relative;height:min(66vh,640px);min-height:380px;pointer-events:none}
#crcv{position:fixed;inset:0;width:100vw;height:100vh;z-index:0;pointer-events:none;background:radial-gradient(ellipse 60% 55% at 50% 52%,#3a2246 0%,#1a1026 45%,#08060e 100%)}
body.crown #menu{background:#08060e}
body.crown .mwrap>*:not(#crown){position:relative;z-index:2}
body.crown.crhov{cursor:pointer}
body.crown .mhead{transition:opacity .5s,transform .5s}body.crown.crsel .mhead{opacity:0;transform:translateY(-24px) scale(.96);pointer-events:none}
#crglow,#crflash{position:fixed;inset:0;pointer-events:none;z-index:1;opacity:0;mix-blend-mode:screen;transition:opacity .4s}
#crflash{z-index:5;mix-blend-mode:normal}
#crown .crui{position:absolute;left:0;right:0;bottom:0;z-index:2;display:flex;flex-direction:column;align-items:center;gap:10px}
#crhint{margin:0;font:italic 18px Georgia,serif;color:#f4e2b8;text-shadow:0 2px 8px #000;text-align:center;pointer-events:none}#crhint small{display:block;font:12px system-ui,sans-serif;opacity:.7;margin-top:4px;font-style:normal}
#crcard{pointer-events:auto;width:min(560px,92vw);padding:14px 18px 12px;border-radius:14px;background:linear-gradient(160deg,rgba(24,16,34,.92),rgba(10,8,18,.9));border:1px solid var(--gc);box-shadow:0 0 0 1px #0008,0 10px 40px #000a,0 0 28px color-mix(in srgb,var(--gc) 35%,transparent);color:#f2ecdf;text-align:center}
#crcard .crg{display:flex;align-items:center;justify-content:center;gap:8px;font:bold 12px system-ui,sans-serif;letter-spacing:2px;text-transform:uppercase;color:var(--gc)}
#crcard .crg i{width:12px;height:12px;background:var(--gc);transform:rotate(45deg);box-shadow:0 0 10px var(--gc)}#crcard .crg small{color:#cbbfa8;letter-spacing:1px;font-weight:normal;text-transform:none}
#crcard h2{margin:6px 0 4px;font:bold 28px Georgia,serif;color:#fff3d6;text-shadow:0 2px 0 #0008}
#crcard p{margin:0 auto 10px;max-width:470px;line-height:1.45;font-size:14px;opacity:.9}
#crcard .crbtn{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}
#crcard button{font:bold 15px system-ui,sans-serif;border-radius:10px;cursor:pointer;padding:10px 18px;border:1px solid #ffffff30;background:#ffffff12;color:#f2ecdf}
#crcard button.crgo{background:var(--gc);color:#140c06;border-color:transparent;box-shadow:0 0 18px color-mix(in srgb,var(--gc) 60%,transparent);min-width:150px}
#crcard button.crgo:disabled{background:#3a3a48;color:#aaa;box-shadow:none;cursor:not-allowed}
#crcard button:hover:not(:disabled){filter:brightness(1.12);transform:translateY(-1px)}
#crchips{pointer-events:auto;display:flex;gap:6px;flex-wrap:wrap;justify-content:center}
#crchips button{display:flex;align-items:center;gap:6px;padding:5px 10px;border-radius:20px;border:1px solid #ffffff22;background:rgba(12,10,20,.75);color:#e8e0cc;font:12px system-ui,sans-serif;cursor:pointer}
#crchips button i{width:9px;height:9px;background:var(--gc);transform:rotate(45deg)}#crchips button.on{border-color:var(--gc);background:color-mix(in srgb,var(--gc) 22%,#0c0a14)}
@media (max-width:700px){#crown{height:62vh}#crchips span{display:none}#crcard h2{font-size:22px}}
@media (prefers-reduced-motion:reduce){#crglow,#crflash{transition:none}}`;document.head.appendChild(st)})();

// sotto la Corona il vecchio sfondo del menu non serve: niente lavoro inutile
const _drawMenu742=drawMenu;drawMenu=function(dt){if(CRW.vis)return;_drawMenu742(dt)};
