/* ================= IL VOXELIAVERSE: LA STANZA DIETRO LA CORONA (8.15: nel gioco normale) =================
   Si entra dal menu, girando la Corona fino alla settima gemma (senza colore, sulla punta piccola fra il Diamante e il
   Rubino), oppure subito dopo il filmato del settimo frammento. Dalla 8.15 la stanza è una zona del gioco come le altre:
   vista isometrica (o la vista 3D del gioco), l'eroe della Storia che si muove con il clic o con la tastiera.
   - il CAMINO, sulla parete di sinistra, con la poltrona e il tappeto: ci si siede, si medita e il fuoco porta in una
     realtà ignota, nuova a ogni viaggio;
   - la LIBRERIA, sulla parete di fondo, alta fino al soffitto, con la scala: i libri che brillano sono le realtà;
   - la FINESTRA ROTONDA con le stelle, il SETTIMO FRAMMENTO sul suo piedistallo, il tavolino con il libro aperto (una nota
     di Vael), le candele, e la PORTA, davanti, che riporta al menu.
   Le realtà sono in 8zzzzx_realta.js; tornando da una realtà si riappare davanti al camino o alla libreria. */
Z.vx2stanza={n:'Dietro la Corona',lv:20,N:13,int:1,bg:'#07050c',fl:'#5a3a22',fl2:'#503420',wall:'#3a2c2a',gen:vx2RoomGen,dist:1,nolamp:1,mus:'notte',vx2r:1};
T88('Dietro la Corona','Behind the Crown');
function vx2RoomGen({n}){for(let y=1;y<n-1;y++)for(let x=1;x<n-1;x++){M[y][x]=0;DEC[y][x]=''}
  const B=(x,y)=>{M[y][x]=6;DEC[y][x]=''};
  // il camino (parete di sinistra), la libreria (parete di fondo), il tavolino, il piedistallo del frammento
  for(let y=4;y<=6;y++)B(1,y);for(let x=6;x<=10;x++)B(x,1);B(11,1);B(6,6);B(10,8);B(4,7);
  ents.push({k:'vx2d',s:'camino',px:1.5,py:5.5},{k:'vx2d',s:'tappeto',px:3.5,py:5.5},{k:'vx2d',s:'poltrona',px:4.5,py:7.5},{k:'vx2d',s:'libreria',px:8.5,py:1.5},{k:'vx2d',s:'scala',px:11.5,py:1.5},
    {k:'vx2d',s:'finestra',px:3.5,py:1.05},{k:'vx2d',s:'tavolo',px:6.5,py:6.5},{k:'vx2d',s:'piedistallo',px:10.5,py:8.5},{k:'vx2d',s:'candele',px:1.5,py:8.5},{k:'vx2d',s:'candele',px:11.5,py:4.5},{k:'vx2d',s:'porta',px:6.5,py:12.2},
    {k:'vx2',s:'fire',px:2.5,py:5.5},{k:'vx2',s:'lib',px:8.5,py:2.5},{k:'vx2',s:'frag',px:9.5,py:8.5},{k:'vx2',s:'book',px:6.5,py:7.5},{k:'vx2',s:'door',px:6.5,py:11.5});
  return VX2.from==='fire'?[3,5]:VX2.from==='lib'?[8,3]:[6,9]}
function vx2RoomTip(e){return{fire:T88('Il camino: medita e viaggia','The fireplace: meditate and travel'),lib:T88('La libreria: le realtà','The library: the realities'),frag:T88('Il settimo frammento','The seventh fragment'),
  book:T88('Il libro aperto','The open book'),door:T88('Torna alla Corona','Back to the Crown')}[e.s]||''}
function vx2RoomAct(e){if(e.s==='fire')pn('vx2fire');else if(e.s==='lib')pn('vx2lib');else if(e.s==='door')vx2Leave();
  else if(e.s==='frag')pn('txt',{ti:T88('Il settimo frammento','The seventh fragment'),sub:T88('Il frammento dei Fondatori','The Founders\' fragment'),tx:T88('Non ha colore, e non è freddo come le altre schegge: è tiepido, come una mano. Quando lo guardi a lungo, nella sua luce ti sembra di vedere posti che non conosci.','It has no color, and it isn\'t cold like the other splinters: it is warm, like a hand. When you look at it for a long time, in its light you seem to see places you don\'t know.')});
  else if(e.s==='book')pn('txt',{ti:T88('Il libro aperto','The open book'),sub:T88('Una nota a margine, scritta a mano','A note in the margin, handwritten'),tx:T88('«Ho provato a contarle. Alla millesima ho smesso: per ogni realtà che chiudevo ne nascevano due. Se trovi questo libro, non provarci anche tu. Vai a vederle, piuttosto.» — V.','"I tried to count them. At the thousandth I stopped: for every reality I closed, two more were born. If you find this book, don\'t try it yourself. Go and see them, instead." — V.')})}
// gli arredi della stanza
function vx2RoomDraw(e){const a0=g.globalAlpha,c=e.s==='door'?'#d4af37':'#ecf4ff';g.globalAlpha=a0*(.18+.12*Math.sin(t*3));box(e.px-.28,e.py-.28,0,.56,.07,.6,c,1.4);box(e.px-.28,e.py+.21,0,.56,.07,.6,c,1.4);box(e.px-.28,e.py-.21,0,.07,.42,.6,c,1.4);box(e.px+.21,e.py-.21,0,.07,.42,.6,c,1.4);g.globalAlpha=a0}
{const d0=vx2Deco;vx2Deco=function(e){if(!ZZ||!ZZ.vx2r)return d0(e);const L=[],q=(a,b,z,w,d,h,c,l)=>L.push([a,b,z,w,d,h,c,l]),f=Math.sin(t*9)*.5+Math.sin(t*13)*.5;
  switch(e.s){
  case 'camino':q(-.5,-1.5,0,.7,3,8,'#6a6068');q(-.5,-1.5,8,.7,.6,30,'#5a5260');q(-.5,.9,8,.7,.6,30,'#5a5260');q(-.5,-.9,30,.7,1.8,8,'#6a6068');q(-.3,-1.6,38,.8,3.2,3,'#7a7078');q(-.5,-1.1,41,.6,2.2,24,'#5a5260');
    q(-.45,-.9,8,.25,1.8,22,'#1a1010');q(-.2,-.6,8,.2,1.2,2,'#3a2414');q(-.15,-.5,10,.12,1,(8+f*3),'#ff7a2a',1.6);q(-.1,-.25,10,.1,.5,(13+f*4),'#ffd060',1.8);q(-.12,.15,10,.1,.4,(9-f*2),'#ff9a3a',1.7);
    q(-.25,-1.2,41,.15,.12,6,'#e8dcc0',1.2);q(-.25,1,41,.15,.12,6,'#e8dcc0',1.2);q(-.24,-1.19,47,.12,.1,2,'#ffd060',1.8);q(-.24,1.01,47,.12,.1,2,'#ffd060',1.8);break;
  case 'tappeto':q(-1,-1.2,0,2,2.4,1,'#6a1a2a');q(-.85,-1.05,1,1.7,2.1,.4,'#8a2a3a');break;
  case 'poltrona':q(-.4,-.4,0,.8,.8,9,'#7a3a2a');q(-.4,-.4,9,.2,.8,12,'#5a2a1a');q(-.4,-.4,9,.8,.18,7,'#5a2a1a');q(-.4,.22,9,.8,.18,7,'#5a2a1a');break;
  case 'libreria':for(let i=-2;i<=2;i++){q(i-.5,-.5,0,1,.55,58,'#4a2e16');for(let r=0;r<5;r++){const z=4+r*11;q(i-.46,-.1,z,.92,.18,1.2,'#3a2414');for(let b=0;b<5;b++){const hv=vxH2(i*7+b,r,9),glow=hv>.86;q(i-.42+b*.18,-.12,z+1.2,.14,.16,7+hv*2,glow?'#c8e8ff':['#7a2a2a','#2a4a6a','#3a5a2a','#6a5a2a','#4a2a5a'][(b+r+i+9)%5],glow?1.4+Math.sin(t*2+b+r)*.2:1)}}}q(-2.55,-.55,58,5.1,.65,3,'#3a2414');break;
  case 'scala':q(-.1,-.35,0,.08,.08,60,'#5a3a1e');q(.3,-.35,0,.08,.08,60,'#5a3a1e');for(let z=6;z<58;z+=8)q(-.1,-.35,z,.48,.08,1.5,'#5a3a1e');break;
  case 'finestra':q(-.9,-.08,18,1.8,.1,24,'#7a7078');q(-.75,-.06,20,1.5,.1,20,'#0a1028');for(let i=0;i<7;i++)q(-.7+vxH2(i,3,7)*1.4,-.04,22+vxH2(i,5,7)*16,.05,.05,.8,'#ffffff',1.2+.4*Math.sin(t*2+i));q(-.1,-.03,28,.22,.05,5,'#d4af37',1.3);q(-.06,-.02,33,.14,.04,2,'#ecf4ff',1.5);break;
  case 'tavolo':q(-.4,-.4,0,.1,.1,10,'#3a2414');q(.3,-.4,0,.1,.1,10,'#3a2414');q(-.4,.3,0,.1,.1,10,'#3a2414');q(.3,.3,0,.1,.1,10,'#3a2414');q(-.45,-.45,10,.9,.9,2,'#5a3a1e');q(-.3,-.25,12,.6,.45,1,'#f0e6c8');q(-.02,-.25,12,.04,.45,1.4,'#c8b898');break;
  case 'piedistallo':q(-.36,-.36,0,.72,.72,4,'#2a1e44');q(-.26,-.26,4,.52,.52,14,'#3a2a5a');q(-.34,-.34,18,.68,.68,3,'#2a1e44');{const z=26+Math.sin(t*1.6)*2;q(-.12,-.12,z,.24,.24,10,'#ecf4ff',1.7);q(-.2,-.05,z+3,.4,.1,4,'#ffffff',1.6);q(-.05,-.2,z+3,.1,.4,4,'#ffffff',1.6)}break;
  case 'candele':for(const[a,b,h]of[[-.2,-.1,7],[.1,.12,10],[.15,-.2,5]]){q(a,b,0,.08,.08,h,'#e8dcc0');q(a+.01,b+.01,h,.06,.06,2+f,'#ffd060',1.8)}break;
  case 'porta':q(-.5,-.15,0,1,.2,10,'#3a2414');q(-.4,-.12,0,.8,.18,9,'#5a3a1e');q(.22,-.14,4,.08,.04,1.5,'#d4af37',1.3);break}
  drawL(L,e.px,e.py,0)}}
// dalla Corona del menu (o subito dopo il filmato del settimo frammento) si entra nella stanza, con l'eroe della Storia
function vx2Room(){if(!cr7Has())return;if(started){VX2.from=null;irisGo(()=>load('vx2stanza',Zk));return}const s=LS.get(SAVEK,null);
  if(!s||!s.p){if(typeof menuNote==='function')menuNote(T88('Serve un eroe della Storia: è lui che entra dietro la Corona.','You need a Story hero: they are the one who goes behind the Crown.'));return}
  try{albumClose()}catch(_){}begin(s.df|0,s);setTimeout(()=>{if(!started)return;VX2.from=null;load('vx2stanza','town');P.hp=P.mx;banner(T88('Dietro la Corona','Behind the Crown'),T88('Il fuoco è acceso, come se qualcuno ti aspettasse','The fire is lit, as if someone were expecting you'),'corona')},600)}
function vx2Leave(){if(!started)return;cl();toMenu()}
f9After=first=>{setTimeout(()=>{try{cr7Sync()}catch(_){}if(started){VX2.from=null;irisGo(()=>load('vx2stanza','cuore80'))}},first?2600:300)};
/* ---- la settima gemma sulla Corona del menu ---- */
function cr7Has(){try{const o=cr80();return!!(o.cu9&&o.cu9.f7)}catch(_){return false}}
function cr7Sync(){if(typeof CRGEM==='undefined'||!cr7Has()||CRGEM.some(g=>g.k==='settima'))return;
  CRGEM.push({k:'settima',g:T88('Senza colore','Colorless'),c:[236,244,255],m:T88('Dietro la Corona','Behind the Crown'),s:T88('Il Voxeliaverse','The Voxeliaverse'),
    d:T88('La settima gemma, il frammento dei Fondatori. Dietro la Corona c\'è una stanza con un camino e una libreria: da lì si viaggia nelle realtà del Voxeliaverse.','The seventh gem, the Founders\' fragment. Behind the Crown there is a room with a fireplace and a library: from there you travel to the realities of the Voxeliaverse.'),go:()=>vx2Room()});
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
setTimeout(()=>{try{cr7Sync()}catch(_){}},700);
