/* ================= 8.9 · passo 3: LA STANZA DIETRO LA CORONA =================
   La prima scena del motore nuovo (8zzzzv_motore.js). Si apre dopo il filmato del settimo frammento e poi dal menu,
   girando la Corona: sulla punta piccola fra il Diamante e il Rubino adesso c'è la settima gemma, senza colore.
   La stanza (8,8 × 7,2 m, alta 4,8 m, voxel da 20 cm):
   - il CAMINO, sulla parete di sinistra: pietra, mensola con le candele, il fuoco che trema e fa luce, le braci che salgono.
     Davanti, il tappeto e la poltrona. Lì si medita e si viaggia in una realtà ignota;
   - la LIBRERIA, sulla parete di destra: alta fino al soffitto, con la scala, centinaia di libri; quelli che brillano
     sono le realtà. Lì si sceglie una realtà del Voxeliaverse;
   - la FINESTRA ROTONDA, sulla parete di fondo: fuori, nelle stelle, la Corona che gira piano; dalla finestra entra la
     luce della luna, che fa le ombre sul pavimento;
   - il SETTIMO FRAMMENTO, su un piedistallo vicino alla finestra; la PORTA, dietro, per tornare alla Corona;
   - travi sul soffitto, una lanterna appesa, un tavolino con un libro aperto, candele per terra, polvere nella luce.
   Le realtà (i libri e il camino) sono in 8zzzzx_realta.js; tornando da una realtà si riappare davanti al camino o alla libreria. */
const ST9={};
function vxRoomScene(from){const R={n:T88('Dietro la Corona','Behind the Crown'),sub:T88('IL VOXELIAVERSE','THE VOXELIAVERSE'),W:44,H:24,D:36,camDist:3.6,center:[4.4,2.4,3.6],radius:7.5,spawn:[4.4,.21,6.1],yaw:Math.PI};
  if(from==='fire'){R.spawn=[2.3,.21,3.0];R.yaw=-Math.PI/2}else if(from==='lib'){R.spawn=[7.6,.21,3.6];R.yaw=Math.PI/2}
  const S=VXS_VOX;
  R.build=DV=>{const P9={pav:vxPal('#5a3a22'),pav2:vxPal('#503420'),pav3:vxPal('#64422a'),mur:vxPal('#3a2c2a'),mur2:vxPal('#34272a'),mat:vxPal('#4a3a36'),pie:vxPal('#6a6068'),pie2:vxPal('#5a5260'),pie3:vxPal('#7a7078'),
      tr:vxPal('#3a2414'),leg:vxPal('#5a3a1e'),leg2:vxPal('#4a2e16'),bra:vxPal('#ff7a2a',.9),car:vxPal('#1a1010'),tap:vxPal('#6a1a2a'),tap2:vxPal('#8a2a3a'),pol:vxPal('#7a3a2a'),pol2:vxPal('#5a2a1a'),oro:vxPal('#d4af37',.15),
      ped:vxPal('#3a2a5a'),ped2:vxPal('#2a1e44'),vet:vxPal('#1a2030')};
    const W=R.W,H=R.H,D=R.D;
    // il pavimento a tavole, le pareti, il soffitto con le travi
    vxFill(0,0,0,W-1,0,D-1,(x,y,z)=>((z>>1)+((x/7|0)%2)*3)%5===0?P9.pav2:((x*3+z)%11===0?P9.pav3:P9.pav));
    vxFill(0,1,0,0,H-1,D-1,(x,y,z)=>(y%6===0||((z+(y/6|0)*3)%8===0))?P9.mat:P9.mur);vxFill(W-1,1,0,W-1,H-1,D-1,P9.mur);vxFill(0,1,0,W-1,H-1,0,(x,y,z)=>(y%6===0||((x+(y/6|0)*4)%9===0))?P9.mat:P9.mur2);vxFill(0,1,D-1,W-1,H-1,D-1,P9.mur);
    vxFill(0,H-1,0,W-1,H-1,D-1,P9.tr);for(let z=3;z<D;z+=7)vxFill(1,H-2,z,W-2,H-2,z+1,P9.leg2);vxFill(1,1,1,W-2,1,1,P9.leg2);
    // la finestra rotonda, in mezzo alla parete di fondo (si apre nel buio delle stelle)
    const wx=22,wy=13;for(let y=wy-6;y<=wy+6;y++)for(let x=wx-6;x<=wx+6;x++){const d=Math.hypot(x-wx,y-wy);if(d<5.2)vxSet(x,y,0,0);else if(d<6.4){vxSet(x,y,0,P9.pie3);vxSet(x,y,1,P9.pie3)}}
    vxFill(wx-6,wy-7,1,wx+6,wy-7,2,P9.pie3);
    // il camino, sulla parete di sinistra
    const fz=15;vxFill(1,1,fz-6,4,15,fz+6,(x,y,z)=>((x+y+z)%4===0)?P9.pie2:P9.pie);vxFill(1,16,fz-4,3,H-2,fz+4,P9.pie2);vxFill(1,15,fz-7,5,15,fz+7,P9.pie3);
    vxFill(2,1,fz-4,4,8,fz+4,0);vxFill(1,1,fz-3,1,8,fz+3,P9.car);vxFill(2,1,fz-4,4,1,fz+4,P9.car);
    vxFill(5,0,fz-6,7,0,fz+6,P9.pie2);
    // la libreria, sulla parete di destra: il mobile (i libri sono scatole, più sotto)
    const lx=W-2;vxFill(lx-2,1,4,lx,H-3,31,(x,y,z)=>(x===lx||z===4||z===31||y===1||y===H-3||(y-1)%5===0||z%9===4)?P9.leg:0);
    // il tappeto e la poltrona davanti al fuoco
    vxFill(6,1,fz-5,15,1,fz+5,(x,y,z)=>(x===6||x===15||z===fz-5||z===fz+5)?P9.tap2:P9.tap);
    vxFill(12,2,fz-2,15,3,fz+2,P9.pol);vxFill(15,4,fz-2,16,8,fz+2,P9.pol);vxFill(12,4,fz-3,15,6,fz-3,P9.pol2);vxFill(12,4,fz+3,15,6,fz+3,P9.pol2);
    // il tavolino con il libro aperto
    vxFill(19,1,22,19,4,22,P9.leg2);vxFill(17,5,20,21,5,24,P9.leg);
    // il piedistallo del settimo frammento, vicino alla finestra
    vxFill(20,1,3,24,1,7,P9.ped);vxFill(21,2,4,23,6,6,P9.ped2);vxFill(20,7,3,24,7,7,P9.oro);
    // la porta, nella parete dietro
    vxFill(19,1,D-1,25,11,D-1,(x,y,z)=>(x===19||x===25||y===11)?P9.leg2:P9.leg);
    // le decorazioni: i libri della libreria
    const BC=['#8a2a2a','#2a4a7a','#3a6a3a','#7a5a2a','#5a2a6a','#2a6a6a','#9a7a4a','#3a3a5a','#6a2a2a','#4a5a2a'];ST9.books=[];
    for(let sh=0;sh<4;sh++){const y0=(2+sh*5)*S;for(let z=5;z<31;z++){if(z%9===4)continue;let zz=z*S+.01;const n=2;for(let b=0;b<n;b++){const k=(sh*31+z*7+b*13)%BC.length,h=(.62+((sh+z+b)%3)*.1)*S*4,glow=(sh*7+z*3+b)%23===0;
        vxBox(DV,(lx-1+.5)*S,y0,zz+S*.25+b*S*.5,S*1.6,h,S*.42,BC[k],glow?.6:0);if(glow)ST9.books.push([(lx-1)*S,y0+h*.6,zz+S*.4,BC[k]]);}}}
    // la mensola del camino: candele e un orologio; le candele per terra
    for(const z of[fz-6,fz-3,fz+3,fz+6]){vxBox(DV,4.6*S,16*S,(z+.5)*S,.06,.16,.06,'#f0e6d0');vxBox(DV,4.6*S,16*S+.16,(z+.5)*S,.02,.035,.02,'#ffd84a',1)}
    vxBox(DV,4.6*S,16*S,(fz+.5)*S,.12,.26,.22,'#6a4a2a');vxBox(DV,4.65*S,16*S+.08,(fz+.5)*S,.02,.12,.12,'#e8dcc0');
    for(const[x,z]of[[9,30],[33,8],[30,28]]){vxBox(DV,x*S,S,z*S,.08,.22,.08,'#f0e6d0');vxBox(DV,x*S,S+.22,z*S,.025,.04,.025,'#ffd84a',1)}
    // il libro aperto sul tavolino
    vxBox(DV,19.5*S,6*S,22.5*S,.34,.03,.24,'#e8dcc0');vxBox(DV,19.5*S,6*S+.03,22.5*S,.02,.02,.24,'#6a4a2a');
    // la lanterna appesa al soffitto
    vxBox(DV,22*S,(H-1)*S-.8,18*S,.02,.8,.02,'#2a2a2a');vxBox(DV,22*S,(H-1)*S-1.05,18*S,.2,.26,.2,'#3a3a3a');vxBox(DV,22*S,(H-1)*S-1.02,18*S,.14,.18,.14,'#ffd88a',.9);
    // la scala della libreria
    for(let y=1;y<H-4;y+=2)vxBox(DV,(lx-3.2)*S,y*S,12*S,.04,.04,.5,'#4a2e16');vxBox(DV,(lx-3.2)*S,S,11.2*S,.05,(H-5)*S,.05,'#4a2e16');vxBox(DV,(lx-3.2)*S,S,12.8*S,.05,(H-5)*S,.05,'#4a2e16');
    // le braci e la legna nel camino
    vxBox(DV,3*S,2*S,fz*S,.7,.12,.12,'#4a2a14',0,.3);vxBox(DV,3*S,2*S+.1,fz*S,.6,.12,.12,'#3a2010',0,-.4);vxBox(DV,3*S,2*S,fz*S,.5,.05,.4,'#ff5a1a',.8)};
  // le luci: il fuoco che trema, le candele, la lanterna, il frammento, i libri che brillano
  R.lights=t=>{const f=1+.18*Math.sin(t*9)*Math.sin(t*5.3)+.08*Math.sin(t*23),fz=15*S;const L=[[.75,.75,fz+.1,7.5,2.6*f,1.3*f,.5*f],[22*S,(R.H-1)*S-1.05,18*S,5.5,.9,.7,.4],[22*S,1.8,5*S,3,.5,.6,.9]];
    for(const z of[-6,-3,3,6])L.push([4.6*S,16*S+.2,(15+z+.5)*S,1.8,.35,.25,.1]);for(const[x,z]of[[9,30],[33,8],[30,28]])L.push([x*S,S+.3,z*S,1.6,.4,.28,.1]);
    for(const b of ST9.books.slice(0,3))L.push([b[0]-.2,b[1],b[2],1.4,.25,.25,.35]);return L};
  R.light=t=>({sd:[.32,-.5,.8].map((v,i,a)=>v/Math.hypot(...a)),sc:[.34,.42,.66],sky:[.16,.12,.17],gnd:[.1,.07,.05],fog:[.015,.012,.025],fogD:.035});
  // i bagliori: le fiamme, le braci che salgono, la polvere nel raggio di luna, le stelle fuori, il frammento
  const EMB=[...Array(26)].map((_,i)=>({p:i*.73,s:.4+((i*37)%10)/20}));
  R.glow=t=>{const G=[],fz=15*S;for(let i=0;i<7;i++){const a=t*6+i*1.3;G.push([.62+Math.sin(a)*.05,.5+((i*17)%7)/20+Math.sin(a*1.7)*.04,fz+(i-3)*.08,1,.55,.2,.9,.55])}
    G.push([.7,.6,fz,1,.45,.15,.45,2.6]);
    for(const e of EMB){const k=((t*e.s+e.p)%3)/3;G.push([.6+Math.sin(t+e.p)*.1,.4+k*3.2,fz+Math.sin(e.p*5)*.35+Math.sin(t*1.3+e.p)*.1,1,.5,.15,(1-k)*.9,.05])}
    for(let i=0;i<40;i++){const k=(i*.618)%1,x=3.4+((i*37)%30)/30*2,y=.4+((t*.05+k)%1)*2.4,z=.6+((i*53)%50)/50*3.6;G.push([x+Math.sin(t*.3+i)*.1,y,z,.7,.75,1,.18,.035])}
    for(let i=0;i<70;i++){const a=i*2.399,r=4+((i*31)%40)/4;G.push([4.4+Math.cos(a)*r*.6,2.6+Math.sin(a*1.7)*2.2,-.4-((i*13)%20)/2,1,1,1,.7,.06])}
    G.push([22*S,1.75,5*S,.85,.92,1,.8,.9],[22*S,(R.H-1)*S-1,18*S,1,.85,.5,.5,1]);for(const b of ST9.books){const c=parseInt(b[3].slice(1),16);G.push([b[0]-.15,b[1],b[2],(c>>16)/255+.3,(c>>8&255)/255+.3,(c&255)/255+.3,.35,.35])}
    // la Corona fuori dalla finestra: le gemme che girano
    const C=GEM80.map(q=>q.c);for(let i=0;i<7;i++){const a=i/6*6.283+t*.25,c=i<6?parseInt(C[i].slice(1),16):0xeef4ff;G.push([4.4+Math.cos(a)*.9,2.6+Math.sin(t*.8)*.05,-2.4+Math.sin(a)*.9,(c>>16)/255,(c>>8&255)/255,(c&255)/255,i<6?.8:.3,.35])}return G};
  // le cose che si muovono: il frammento che gira, la Corona fuori, le fiamme
  R.dyn=t=>{const gl=VX.gl;if(!ST9.frag){const V=[];vxBox(V,0,0,0,.12,.5,.12,'#ffffff',1);vxBox(V,0,.16,0,.3,.14,.06,'#e8f4ff',.9);vxBox(V,0,.16,0,.06,.14,.3,'#e8f4ff',.9);ST9.frag=vxUp(gl,V);
      const C=[];for(let s=0;s<24;s++){const a=s/24*6.283;vxBox(C,Math.cos(a)*.95,0,Math.sin(a)*.95,.27,.28,.08,s%2?'#ecb23a':'#be8428',.12,-a)}for(let i=0;i<6;i++){const a=i/6*6.283;vxBox(C,Math.cos(a)*.95,.28,Math.sin(a)*.95,.14,.34,.08,'#ffd66e',.12,-a);vxBox(C,Math.cos(a)*1.0,.12,Math.sin(a)*1.0,.12,.12,.06,GEM80[i].c,.8,-a)}
      vxBox(C,0,.35,0,.12,.12,.12,'#ffd66e',.2);ST9.crown=vxUp(gl,C)}
    if(!ST9.fl||t-ST9.flt>.07){ST9.flt=t;const V=[],fz=15*S;for(let i=0;i<5;i++){const h=.25+.18*Math.abs(Math.sin(t*8+i*1.7));vxBox(V,.62+(i%2)*.06,.44,fz+(i-2)*.09,.08,h,.08,i%2?'#ffd84a':'#ff7a1a',1)}ST9.fl=vxUp(gl,V,ST9.fl)}
    return[{o:ST9.frag,m:vxM.tr(22*S,1.6+Math.sin(t*1.5)*.04,5*S,t*.8,1)},{o:ST9.crown,m:vxM.tr(4.4,2.4+Math.sin(t*.8)*.05,-2.4,t*.25,1)},{o:ST9.fl}]};
  R.items=[
    {p:[1.2,.9,15*S],r:1.9,label:T88('Medita davanti al fuoco','Meditate by the fire'),act:()=>vxCamino()},
    {p:[(R.W-4)*S,1,18*S],r:2.2,label:T88('Sfoglia la libreria','Browse the library'),act:()=>vxLibreria()},
    {p:[22*S,1,6*S],r:1.6,label:T88('Guarda il settimo frammento','Look at the seventh fragment'),act:()=>vxSay(T88('Il frammento dei Fondatori. Dentro non c\'è nessun colore, ma ci sono tutti.','The Founders\' fragment. There is no color inside it, yet all of them are there.'),5)},
    {p:[22*S,1,(R.D-2)*S],r:1.6,label:T88('Torna alla Corona','Return to the Crown'),act:()=>vxLeave()},
    {p:[19.5*S,1,22.5*S],r:1.4,label:T88('Leggi il libro aperto','Read the open book'),act:()=>vxPanel(`<h2>${esc(T88('Il libro aperto','The open book'))}</h2><p>${esc(T88('«Nessuno ha mai contato le realtà del Voxeliaverse. Chi ci ha provato ha smesso a metà, perché mentre contava ne nascevano altre. Ogni libro di questa libreria è una porta; il fuoco, invece, apre quelle che nessuno ha ancora scritto.»','“No one has ever counted the realities of the Voxeliaverse. Those who tried stopped halfway, because while they counted, more were born. Every book in this library is a door; the fire, instead, opens the ones no one has written yet.”'))}</p><p class="mu">${esc(T88('— annotato a margine, con la stessa calligrafia di Vael','— noted in the margin, in the same handwriting as Vael\'s'))}</p><button onclick="vxPanel(null)">${esc(T88('Chiudi','Close'))}</button>`)}];
  R.enter=()=>{vxSay(from?T88('Sei di nuovo dietro la Corona. Il fuoco ti ha aspettato.','You are behind the Crown again. The fire has waited for you.'):T88('La stanza dietro la Corona. Il fuoco è acceso, come se qualcuno ti aspettasse.','The room behind the Crown. The fire is lit, as if someone were expecting you.'),5);try{music('notte')}catch(_){}};
  return R}
// il camino e la libreria: le realtà (8zzzzx_realta.js)
function vxCamino(){vxFire()}
function vxLibreria(){vxLib()}
function vxRoom(){if(typeof cu9==='function'&&!cu9().f7)return;if(started&&typeof toMenu==='function')toMenu();setTimeout(()=>vxStart(vxRoomScene()),started?400:0)}
T88('Esci','Leave');T88('Chiudi','Close');
// dopo il filmato del settimo frammento si entra subito nella stanza
f9After=first=>{setTimeout(()=>{try{cr7Sync()}catch(_){}vxRoom()},first?2600:300)};
/* ---- la settima gemma sulla Corona del menu ---- */
function cr7Has(){try{const o=cr80();return!!(o.cu9&&o.cu9.f7)}catch(_){return false}}
function cr7Sync(){if(typeof CRGEM==='undefined'||!cr7Has()||CRGEM.some(g=>g.k==='settima'))return;
  CRGEM.push({k:'settima',g:T88('Senza colore','Colorless'),c:[236,244,255],m:T88('Dietro la Corona','Behind the Crown'),s:T88('Il Voxeliaverse','The Voxeliaverse'),
    d:T88('La settima gemma, il frammento dei Fondatori. Dietro la Corona c\'è una stanza con un camino e una libreria: da lì si viaggia nelle realtà del Voxeliaverse.','The seventh gem, the Founders\' fragment. Behind the Crown there is a room with a fireplace and a library: from there you travel to the realities of the Voxeliaverse.'),go:()=>vxRoom()});
  const ch=document.getElementById('crchips');if(ch&&!ch.querySelector('[data-i="6"]')){const b=document.createElement('button');b.dataset.i='6';b.style.setProperty('--gc','rgb(236,244,255)');b.title=T88('Senza colore','Colorless')+': '+T88('Dietro la Corona','Behind the Crown');b.onclick=()=>crPick(6);b.innerHTML='<i></i><span>'+esc(T88('Dietro la Corona','Behind the Crown'))+'</span>';ch.appendChild(b)}
  try{if(CRW.gl&&typeof crMeshUp==='function')CRW.mesh=crMeshUp(CRW.gl)}catch(e){console.warn('Corona',e)}}
// la gemma sulla Corona: sulla punta piccola fra il Diamante e il Rubino (a 330 gradi), a cristallo trasparente
const CR7A=11/12*Math.PI*2;
{const b0=crBuild;crBuild=function(){const M=b0();if(!cr7Has())return M;try{const V=M.crown.V,I=M.crown.I,a=CR7A,ca=Math.cos(a),sa=Math.sin(a),T=[-sa,0,ca],U=[0,1,0],Rr=[ca,0,sa];
    const box=(cx,cy,cz,hw,hh,hd,col,mat,gid)=>{const F=[[Rr,T,U,hd,hw,hh],[[-Rr[0],0,-Rr[2]],T,U,hd,hw,hh],[T,Rr,U,hw,hd,hh],[[-T[0],0,-T[2]],Rr,U,hw,hd,hh],[U,T,Rr,hh,hw,hd],[[0,-1,0],T,Rr,hh,hw,hd]];
      for(const[n,p,q,dn,dp,dq]of F){const b=V.length/9;for(const[s,t2]of[[-1,-1],[1,-1],[1,1],[-1,1]])V.push(cx+n[0]*dn+p[0]*dp*s+q[0]*dq*t2,cy+n[1]*dn+p[1]*dp*s+q[1]*dq*t2,cz+n[2]*dn+p[2]*dp*s+q[2]*dq*t2,n[0],n[1],n[2],(col[0]|0)+(col[1]|0)*256+(col[2]|0)*65536,mat+gid*16,(s>0?255:0)+(t2>0?255:0)*256);I.push(b,b+1,b+2,b,b+2,b+3)}};
    const at=(rad,y,hw,hh,hd,col,mat,gid)=>box(ca*rad,y,sa*rad,hw,hh,hd,col,mat,gid);
    // un castone d'oro più grande della punta piccola, il cristallo tagliato a rombo e una punta in cima
    at(22.3,CRGY,2.4,2.6,.55,[190,132,40],0,0);at(22.75,CRGY,1.7,1.7,.5,[200,214,236],2,7);at(22.8,CRGY+1.95,.95,.6,.45,[236,244,255],2,7);at(22.8,CRGY-1.95,.95,.6,.45,[180,196,220],2,7);
    at(22.8,CRGY,.6,.95,.45,[236,244,255],2,7);at(23.3,CRGY,1.1,1.1,.35,[246,250,255],2,7);at(23.6,CRGY+.25,.55,.55,.3,[255,255,255],2,7);
    for(let L=0;L<4;L++)at(20.5,12.2+L*1.8+.9,2.2-L*.5,.9,1,[236,244,255].map(v=>v*(L%2?.9:1)),2,7);at(20.5,20.6,.85,.85,.85,[255,255,255],2,7)}catch(e){console.warn('settima gemma',e)}return M}}
{const g0=crGemW;crGemW=function(i,th){if(i!==6)return g0(i,th);const a=CR7A-th,r=23.5;return[Math.cos(a)*r,CRGY,Math.sin(a)*r]}}
{const h0=crHit;crHit=function(x,y){let b=h0(x,y);if(CRGEM.length<7)return b;const p=crGemW(6,CRW.th);if(p[2]>=4){const s=crProj(p);if(s){const R=Math.max(26,40*150/Math.max(30,CRW.cam.d));if(Math.hypot(s[0]-x,s[1]-y)<R)b=6}}return b}}
crStep=function(d){const n=CRGEM.length;crPick(CRW.sel<0?(d>0?0:n-1):(CRW.sel+d+n)%n)};
// mentre si è nella stanza la Corona del menu non si disegna (è coperta)
{const w0=crWant;crWant=function(){return VX.on?false:w0()}}
setTimeout(()=>{try{cr7Sync()}catch(_){}},700);
