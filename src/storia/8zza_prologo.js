/* ================= 7.25: IL PROLOGO DELLA STORIA, RIFATTO =================
   Quattordici scene e tre musiche nuove. Si apre sul mare di notte: la nave di Aldric il Primo arriva a una costa di pietra
   bianca e Aldoria sorge cubo dopo cubo, mura, torri e mastio. Poi la Corona di Voxel e le sei terre che teneva unite
   (sei isole che fluttuano intorno alla Corona, ognuna con la sua gemma), ciò che dormiva sotto la città, gli anni felici,
   Malakar chino sui libri proibiti, il Re Lich, la notte del fuoco, la Corona che va in frantumi e sei schegge che
   attraversano il cielo, i signori dei frammenti, la Cittadella del Vuoto, il quartiere murato e infine l'alba: l'eroe
   sulla collina che guarda Aldoria. Musiche: «La saga di Aldoria», «L'ombra di Malakar» e «L'alba dell'eroe». */
Object.assign(TRK,{
  pr_saga:{sng:1,dyn:1,bpm:86,root:55,sc:'maj',ld:'flute',lv:.05,echo:1,bs:'pulse',bv:.08,cp:'pad arp',dr:'soft',dv:.75,form:'IABAC',ld2:'str',lv2:.026,parts:{
    I:{ch:[0,4,5,3],ld:'harp',lv:.065,cp:'pad',dr:'none',bs:'long',m:'0:2 2:2 4:2 7:2 4:2 2:2 4:4  4:2 6:2 8:2 11:2 8:2 6:2 4:4  5:2 7:2 9:2 12:2 9:2 7:2 5:4  3:2 5:2 7:2 10:6 r:4'},
    A:{ch:[0,3,4,0],m:'4:6 5:2 4:4 2:4  3:6 4:2 5:8  6:4 5:4 4:4 3:4  4:12 r:4',m2:'0:16 3:16 4:16 0:16'},
    B:{ch:[5,3,0,4],ld:'str',dr:'light',m:'7:4 9:4 7:4 5:4  5:4 3:4 5:8  4:4 5:4 7:4 9:4  8:12 r:4',hm:1},
    C:{ch:[0,4,5,3],ld:'brass',lv:.055,cp:'stab ens',dr:'march',dv:.85,bs:'gallop',m:'7:3 7:1 9:4 11:4 9:4  8:3 8:1 7:4 6:8  9:3 9:1 10:4 12:4 10:4  11:16',m2:'4:16 4:16 5:16 3:16',hm:1}}},
  pr_ombra:{sng:1,dyn:1,bpm:70,root:50,sc:'hm',ld:'str',lv:.05,echo:1,bs:'long',bv:.075,cp:'pad drone',dr:'heart',dv:.7,form:'IABAC',ld2:'choir',lv2:.026,parts:{
    I:{ch:[0,0,5,4],ld:'harp',lv:.06,dr:'none',m:'0:4 3:4 2:4 1:4  0:8 r:8  5:4 4:4 3:4 2:4  1:8 -1:8'},
    A:{ch:[0,3,4,0],m:'7:8 6:4 5:4  6:6 5:2 4:8  3:4 4:4 5:4 6:4  4:16',m2:'0:16 3:16 4:16 0:16'},
    B:{ch:[5,3,1,4],ld:'choir',dr:'timp',m:'8:8 7:8  6:4 5:4 3:8  5:4 6:4 7:4 8:4  7:16',hm:1},
    C:{ch:[0,6,5,4],ld:'organ',dr:'timp',cp:'pad ens',m:'7:4 8:4 9:4 10:4  11:8 10:8  9:4 8:4 7:4 6:4  7:16',hm:1}}},
  pr_alba:{sng:1,dyn:1,bpm:86,root:55,sc:'maj',ld:'brass',lv:.055,echo:1,bs:'gallop',bv:.08,cp:'stab ens',dr:'march',dv:.85,form:'ABB',ld2:'str',lv2:.028,parts:{
    A:{ch:[3,4,0,0],ld:'str',cp:'pad arp',dr:'soft',bs:'pulse',m:'3:4 4:4 5:4 7:4  6:4 7:4 8:8  7:8 9:8  7:16'},
    B:{ch:[0,4,5,3],m:'7:3 7:1 9:4 11:4 9:4  8:3 8:1 7:4 6:8  9:3 9:1 10:4 12:4 10:4  11:8 r:8',m2:'4:16 4:16 5:16 3:16',hm:1}}}});
if(typeof ETRKN!=='undefined')Object.assign(ETRKN,{pr_saga:'La saga di Aldoria',pr_ombra:'L\'ombra di Malakar',pr_alba:'L\'alba dell\'eroe'});
// un titolo che compare e svanisce in un momento preciso della scena
function prCard(lt,t0,t1,tit,sub){const a=Math.min(fSmooth((lt-t0)/1),fSmooth((t1-lt)/1));if(a<=0)return;g.save();g.globalAlpha=a;g.textAlign='center';
  const s=Math.round(Math.min(W,H)/9);g.font=`bold ${s}px Georgia,serif`;g.lineWidth=6;g.strokeStyle='#1a0a04';g.strokeText(tit,W/2,H*.42);const gr=g.createLinearGradient(0,H*.42-s,0,H*.42);gr.addColorStop(0,'#fff2c0');gr.addColorStop(1,'#d4a030');g.fillStyle=gr;g.fillText(tit,W/2,H*.42);
  if(sub){g.font=`italic ${Math.round(s*.32)}px Georgia,serif`;g.lineWidth=4;g.strokeText(sub,W/2,H*.42+s*.55);g.fillStyle='#f4e8c8';g.fillText(sub,W/2,H*.42+s*.55)}g.restore()}
// 1. il mare di notte e la nave di Aldric il Primo
FSET.pr_mare=(S2,lt)=>{for(let y=-10;y<=10;y++)for(let x=-10;x<=10;x++){const sh=-4+Math.sin(y*.7)*1.3,land=x+y*.35<sh;
    if(land){const h=6+Math.min(30,(sh-x-y*.35)*7);box(x,y,-6,1,1,6+h,(x+y)&1?'#e8e4d8':'#dcd8cc',.92+((x*3+y+40)%3)*.04);if(h>22&&(x*7+y*3)%5===0){box(x+.35,y+.35,h,.3,.3,8,'#5a3a1a');box(x+.05,y+.05,h+8,.9,.9,12,'#3a7a3a')}}
    else{const w=Math.sin(x*.8+lt*1.6)*1.6+Math.cos(y*.6+lt*1.1)*1.2;box(x,y,-10,1,1,8+w,(x+y)&1?'#1e4e80':'#1a4878',1+w*.05);if(w>2.2)box(x+.2,y+.2,-2+w,.6,.6,.8,'#cfe4f4',1.3)}}
  const k=fSmooth(lt/8.4),sx=fLerp(7.5,-.6,k),sy=fLerp(7,1.8,k),b=Math.sin(lt*2)*1.2;
  box(sx-1.3,sy-.45,b,2.6,.9,5,'#5a3a1a');box(sx-1.1,sy-.35,5+b,2.2,.7,2,'#7a5a32');box(sx+1,sy-.3,5+b,.4,.6,5,'#6a4a2a');
  box(sx-.06,sy-.06,7+b,.12,.12,44,'#4a2a10');box(sx-.6,sy-.03,16+b,1.2,.05,22,'#f0e8d8',1.1);box(sx-.06,sy-.05,24+b,.12,.06,6,'#a8402f');box(sx-.25,sy-.05,51+b,.5,.06,3,'#d4af37',1.3);
  fGlow(sx+.9,sy,10+b,'255,200,120',18,.4);fGlow(-12,-12,60,'200,220,255',120,.18)};
// 2. Aldoria sorge: le mura, le torri, il mastio e gli stendardi
FSET.pr_fonda=(S2,lt)=>{fFloor(-8,-8,16,16,'#6a9a4a','#64924a');for(let i=-7;i<=7;i++)box(-.5,i,-.2,1,1,.3,'#a89a7a');const B=[],ring=[];
  for(let i=-4;i<=4;i++){ring.push([i,-4],[i,4]);if(i>-4&&i<4)ring.push([-4,i],[4,i])}ring.sort((a,b)=>Math.atan2(a[1],a[0])-Math.atan2(b[1],b[0]));
  ring.forEach(([x,y],i)=>{if(x===0&&y===4)return;const c=Math.abs(x)===4&&Math.abs(y)===4,k=fSmooth((lt-.3-i*.13)/.7);if(k<=0)return;B.push({x:x-.5,y:y-.5,z:(1-k)*70,w:1,d:1,h:c?46:26,c:c?'#b8b4a8':'#cac6ba',k,t:c?1:0})});
  const kk=fSmooth((lt-4.8)/3);if(kk>0)B.push({x:-2,y:-2,z:0,w:3,d:3,h:72*kk,c:'#dcd8cc',k:1,t:2});
  B.sort((a,b)=>(a.x+a.y)-(b.x+b.y));
  for(const b of B){g.globalAlpha=Math.min(1,b.k*1.6);box(b.x,b.y,b.z,b.w,b.d,b.h,b.c);if(b.k>.98){if(b.t===1)box(b.x-.1,b.y-.1,b.h,1.2,1.2,6,'#a8402f');else if(b.t===0)box(b.x+.2,b.y+.2,b.h,.6,.6,4,'#b8b4a8');
      if(b.t===2&&kk>.98){box(b.x-.1,b.y-.1,b.h,3.2,3.2,5,'#a8402f');box(b.x+1.2,b.y+1.2,b.h+5,.6,.6,14,'#a8402f')}}g.globalAlpha=1}
  if(lt>7.5){const u=fSmooth((lt-7.5)/1.2);for(const[x,y]of[[-4.5,-4.5],[3.5,-4.5],[-4.5,3.5],[3.5,3.5]]){box(x+.45,y+.45,52,.08,.08,24*u,'#4a2a10');for(let j=0;j<4;j++)box(x+.53+j*.14,y+.45,62+Math.sin(lt*5+j)*1.5,.14,.06,12*u,j%2?'#d4af37':'#8a1a2a')}
    fGlow(-.5,-.5,90,'255,220,150',60,.25*u)}};
// 4. le sei terre intorno alla Corona
const PRISL=[['#4a8a3a','#3a6a2a','tree'],['#5a5a6a','#44444e','tomb'],['#e2c27c','#c8a868','pyr'],['#7a8aa8','#5a6a88','cry'],['#3a2a2a','#2a1a1a','lava'],['#2a5a8a','#1a3a6a','sea']];
FSET.pr_terre=(S2,lt)=>{const L=[];for(let i=0;i<6;i++){const a=i/6*6.283-1.57+lt*.05,x=Math.cos(a)*6.2,y=Math.sin(a)*6.2;L.push([i,x,y])}L.sort((a,b)=>(a[1]+a[2])-(b[1]+b[2]));
  const kb=fSmooth((lt-1.5)/3);
  const isl=(i,ix,iy)=>{const[c,s,f]=PRISL[i],zb=Math.sin(lt*1.3+i)*3,k=fSmooth((lt-i*.35)/1.2);if(k<=0)return;g.globalAlpha=k;
    box(ix-.9,iy-.9,zb-44,1.8,1.8,14,'#6a5a4a');box(ix-.6,iy-.6,zb-58,1.2,1.2,14,'#5a4a3a');box(ix-.3,iy-.3,zb-68,.6,.6,10,'#4a3a2a');
    for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)box(ix+dx-.5,iy+dy-.5,zb-30,1,1,30,(dx+dy)&1?c:shx(c,1.08),.95);
    if(f==='tree')for(const[u,v]of[[-.8,-.6],[.4,-.9],[-.2,.5]]){box(ix+u+.4,iy+v+.4,zb,.2,.2,10,'#5a3a1a');box(ix+u+.1,iy+v+.1,zb+10,.8,.8,14,'#2a6a2a');box(ix+u+.25,iy+v+.25,zb+24,.5,.5,7,'#3a8a3a')}
    else if(f==='tomb'){for(const u of[-.8,.1])box(ix+u,iy-.6,zb,.5,.15,9,'#8a8a96');box(ix+.5,iy+.2,zb,.4,.4,22,'#6a6a78');box(ix+.42,iy+.12,zb+22,.56,.56,3,'#7a7a88')}
    else if(f==='pyr'){for(let j=0;j<5;j++){const w=2.4-j*.48;box(ix-w/2,iy-w/2,zb+j*6,w,w,6,j%2?'#e8cc8a':'#d8b878')}box(ix-.1,iy-.1,zb+30,.2,.2,3,'#ffd060',1.5)}
    else if(f==='cry'){for(const[u,v,h]of[[-.7,-.5,22],[.2,-.7,30],[.5,.3,18],[-.3,.4,14]])box(ix+u,iy+v,zb,.26,.26,h,'#b0f0ff',1.5)}
    else if(f==='lava'){for(const[u,v]of[[-1,0],[0,1],[1,-1]])box(ix+u-.5,iy+v-.5,zb-.5,1,1,1,'#ff6a2a',1.6);box(ix-.3,iy-.3,zb,.6,.4,6,'#3a3a3a');box(ix-.45,iy-.3,zb+6,.9,.4,3,'#4a4a4a');fGlow(ix,iy,zb+4,'255,120,40',30,.3)}
    else{for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)box(ix+dx-.5,iy+dy-.5,zb-1+Math.sin(lt*2+dx+dy)*.6,1,1,1,'#3a8ac8',1.2);box(ix+.3,iy-.6,zb,.2,.2,8,'#ff7a8a');box(ix-.7,iy+.3,zb,.2,.2,6,'#6fffe0')}
    g.globalAlpha=1;fGlow(ix,iy,zb+36,rgbOf(FCOL[i]),30,.35*k);box(ix-.14,iy-.14,zb+32+Math.sin(lt*2+i)*2,.28,.28,8,FCOL[i],1.5);
    if(kb>0)for(let j=1;j<10;j++){const u=j/10;fGlow(fLerp(ix,0,u),fLerp(iy,0,u),fLerp(zb+36,50,u),rgbOf(FCOL[i]),8,.25*kb)}};
  const back=L.filter(q=>q[1]+q[2]<0),front=L.filter(q=>q[1]+q[2]>=0);for(const q of back)isl(...q);
  fGlow(0,0,52,'255,225,150',60+kb*30,.25+kb*.15);for(const b of fCrownL(lt*.4,FCOL,1.4,44))box(b[0],b[1],b[2],b[3],b[4],b[5],b[6],(b[7]||1)+kb*.15);
  for(const q of front)isl(...q)};
// 7. Malakar e i libri proibiti
FSET.pr_studio=(S2,lt)=>{fFloor(-5,-5,10,10,'#4a3424','#443020');const BK=['#8a2a2a','#2a4a8a','#3a6a3a','#6a4a2a','#4a2a5a','#a8842a'];
  for(let x=-5;x<5;x++){box(x,-5.6,0,1,.6,44,'#2a1a10');for(let r=0;r<4;r++)for(let i=0;i<4;i++)box(x+.08+i*.22,-5.02,5+r*10,.18,.04,7+((x+r+i)&1),BK[(x*7+r*3+i+40)%6])}
  for(let y=-5;y<5;y++){box(-5.6,y,0,.6,1,44,'#2a1a10');for(let r=0;r<4;r++)for(let i=0;i<4;i++)box(-5.02,y+.08+i*.22,5+r*10,.04,.18,7+((y+r+i)&1),BK[(y*5+r*7+i+40)%6])}
  box(-1.2,-1,0,2.4,1.2,12,'#5a3a1a');box(-1.3,-1.1,12,2.6,1.4,1.5,'#6a4a2a');for(let i=0;i<5;i++)box(-1+i*.18,-.9,13.5,.16,.5,1.5+(i%3),'#e8dcc0');
  for(const[x,y]of[[-1.1,-1],[1,-1]]){box(x,y,13.5,.12,.12,4,'#f0e8d0');const f=1+Math.sin(lt*9+x)*.2;fGlow(x+.06,y+.06,19,'255,180,90',24*f,.4)}
  const zb=30+Math.sin(lt*1.8)*3,p=fSmooth(lt/7);box(-.35,-.6,zb,.7,.45,1.4,'#2a103a',1.2);box(-.3,-.55,zb+1.4,.28,.35,.5,'#f0e8d0',1.1);box(.02,-.55,zb+1.4,.28,.35,.5,'#f0e8d0',1.1);
  fGlow(0,-.4,zb+4,'196,107,255',40+p*70,.3+p*.25);
  for(let i=0;i<10;i++){const a=lt*1.4+i*.628,r=1+p*1.2+Math.sin(lt*2+i)*.2;g.globalAlpha=.5+.5*p;box(Math.cos(a)*r-.05,-.4+Math.sin(a)*r-.05,zb+Math.sin(a*2)*4,.1,.1,3,'#c46bff',1.7);g.globalAlpha=1}};
// 10. la Corona va in frantumi e sei schegge attraversano il cielo
FSET.pr_rotta=(S2,lt)=>{fFloor(-6,-6,12,12,'#d8d4c8','#c8c4b8');for(const[x,y]of[[-5,-5],[4,-5],[-5,4],[4,4],[-5,-.5],[4,-.5]]){box(x+.2,y+.2,0,.6,.6,60,'#e8e4d8');box(x+.1,y+.1,60,.8,.8,4,'#d8d4c8')}
  box(-.6,-.6,0,1.2,1.2,4,'#8a7a6a');box(-.4,-.4,4,.8,.8,12,'#a8988a');box(-.55,-.55,16,1.1,1.1,2,'#8a7a6a');
  const T0=3.2;if(lt<T0){const q=lt/T0,j=Math.sin(lt*45)*.03*q;fGlow(0,0,24,'196,107,255',20+q*40,.15+q*.35);for(const b of fCrownL(lt*.3,FCOL,1.1,18))box(b[0]+j,b[1],b[2],b[3],b[4],b[5],b[6],(b[7]||1)+q*.3);
    for(let i=0;i<Math.floor(q*14);i++){const a=i*2.39;box(Math.cos(a)*.35-.02,Math.sin(a)*.35-.02,20+(i%4)*1.5,.04,.04,2.6,'#ffffff',1.7)}return}
  const k=(lt-T0)/4.5,L0=fCrownL(T0*.3,['#d4af37'],1.1,18);L0.forEach((b,i)=>{if(b[6]!=='#d4af37'&&b[6]!=='#a8862a'&&b[6]!=='#f0cc54')return;const a=i*2.4,d=fSmooth(Math.min(1,k*2))*(1.2+(i%5)*.4),z=Math.max(0,b[2]+Math.sin(Math.min(1,k*2)*Math.PI)*20-fSmooth(Math.min(1,k*2))*b[2]);box(b[0]+Math.cos(a)*d,b[1]+Math.sin(a)*d,z,b[3],b[4],b[5],b[6])});
  for(let i=0;i<6;i++){const a=i*Math.PI/3+.5;for(let j=8;j>=0;j--){const u=Math.max(0,k-j*.025),r=u*16,z=20+u*140-u*u*30;if(u<=0)continue;g.globalAlpha=j?(1-j/9)*.55:1;
      box(Math.cos(a)*r-.18,Math.sin(a)*r-.18,z,.36,.36,j?3:10,FCOL[i],1.5);g.globalAlpha=1}const r=k*16,z=20+k*140-k*k*30;fGlow(Math.cos(a)*r,Math.sin(a)*r,z+4,rgbOf(FCOL[i]),40,.5)}
  if(k<.6){g.save();g.globalCompositeOperation='lighter';g.strokeStyle=`rgba(220,200,255,${.6*(1-k/.6)})`;g.lineWidth=10;g.beginPath();g.ellipse(PX(0,0),PY(0,0,0),k*900,k*450,0,0,6.3);g.stroke();g.restore()}};
// 14. l'alba: l'eroe sulla collina e Aldoria all'orizzonte
const prHill=(x,y)=>Math.max(0,7-Math.hypot(x-1,y-1))*4;
FSET.pr_eroe=(S2,lt)=>{const sun=fSmooth(lt/9);fGlow(-18,-18,120+sun*80,'255,190,110',260,.35+.2*sun);
  const CT=[[-13,-9,2,2,64],[-11,-13,2,2,76],[-10,-10,3,3,110],[-8,-12,1.5,1.5,58],[-14,-12,1.5,1.5,50],[-7,-9,1.5,1.5,44],[-12,-7,1.2,1.2,38],[-9,-6,1,1,30],[-15,-9,1.2,1.2,34],[-6,-11,1.2,1.2,36]];
  for(let i=-15;i<=-5;i++){box(i,-5.5,0,1,.6,22,'#5a5a78',.75);box(-5.5,i,0,.6,1,22,'#5a5a78',.75)}
  for(const[x,y,w,h,c]of CT){box(x,y,0,w,h,c,'#5a5a78',.78+sun*.12);box(x-.1,y-.1,c,w+.2,h+.2,7,'#6a4a5a',.8);if(NK<.5)box(x+w*.4,y+h-.02,c*.6,.2,.04,5,'#ffd27a',1.4)}
  box(-8.6,-8.6,117,.1,.1,24,'#3a2a2a');box(-8.5,-8.6,129,1.2,.06,9,'#a8402f',.9);
  for(let y=-8;y<=9;y++)for(let x=-8;x<=9;x++){const h=prHill(x,y);box(x,y,-6,1,1,6+h,(x+y)&1?'#5a8a3a':'#54823a',.9+((x*3+y+30)%3)*.04+sun*.06)}
  for(let i=0;i<10;i++){const x=1+i*.7,y=1+i*.75;box(x,y,prHill(x,y)+.1,.5,.5,.4,'#a89a6a')}
  for(const[x,y,h]of[[-5,4,16],[6,-3,18],[7,5,12],[-3,7,14],[4,8,10]]){const z=prHill(x,y);box(x+.35,y+.35,z,.3,.3,h,'#5a3a1a');box(x,y,z+h*.7,1,1,h,'#2a6a3a');box(x+.15,y+.15,z+h*1.7,.7,.7,h*.5,'#3a7a42')}
  for(let i=0;i<14;i++){const x=((i*5.3)%18)-8,y=((i*3.7)%18)-8,u=(lt*.2+i*.07)%1;g.globalAlpha=.6*(1-u);box(x,y,prHill(x,y)+u*30,.06,.06,1,'#ffe8a0',1.6);g.globalAlpha=1}};
// il nuovo prologo: le scene nuove e le migliori di quello di prima, rimontate in un racconto solo
{const O=FILMS.prologo.L,M=(i,o)=>Object.assign({},O[i],o);
  FILMS.prologo={n:'Il Regno Perduto · prologo',mus:'pr_saga',L:[
    {d:9.5,set:'pr_mare',bg:['#0a1430','#3a5a8a'],stars:1,mus:'pr_saga',cam:[[2,3,1.05],[0,1.2,1.2]],tint:lt=>`rgba(255,170,110,${.05+.12*fSmooth(lt/9)})`,over:lt=>prCard(lt,.4,4.6,'VOXELIA','Il Regno Perduto'),
      tx:'Mille anni fa il mondo era giovane, e il mare non aveva nomi. Su una nave sola, Aldric il Primo arrivò a una costa di pietra bianca.'},
    {d:10,set:'pr_fonda',bg:['#6a9ad0','#f0e8d0'],mus:'pr_saga',cam:[[0,1,.95],[-.5,0,1.1]],tx:'Lì, dove la pietra incontra la luce, fondò Aldoria: prima un muro, poi una torre, poi una città intera.',
      act:[fA('pri',{n:'aldric_primo',p:[0,6],f:'N'}),fA('m1',{n:'muratore',go:[[-7,5.6],[-2,5.6]],v:.8,t0:.5}),fA('m2',{n:'muratore',go:[[7,5.4],[2.4,5.4]],v:.7,t0:1.2,an:'hammer'})]},
    M(1,{mus:'pr_saga',tx:'Per tenere unito il regno forgiò la Corona di Voxel: sei gemme, sei terre, un solo cuore.'}),
    {d:10,set:'pr_terre',bg:['#0c1024','#2a3a6a'],stars:1,mus:'pr_saga',cam:[[0,0,.78],[0,0,.9]],
      tx:'I boschi, le cripte, le sabbie di Khem, le caverne di cristallo, le fucine di fuoco e gli abissi del mare: finché la Corona restava intera, le sei terre vivevano in pace.'},
    M(2,{mus:'pr_ombra'}),
    M(3,{mus:'town'}),
    {d:9,set:'pr_studio',bg:['#05040a','#140a20'],mus:'pr_ombra',cam:[[0,1,1.5],[-.5,0,1.75]],tint:lt=>`rgba(20,0,40,${.15+fSmooth(lt/8)*.35})`,vis:1,
      tx:'Ma Malakar, il fratello del re, passava le notti sui libri proibiti del Primo Re. Cercava un potere più grande della Corona.',
      act:[fA('mal',{n:'malakar_p',p:[0,.9],f:'N'})],fx:lt=>fMotes(0,.9,lt,12,'#c46bff',1.2,60)},
    M(4,{mus:'pr_ombra',tx:'Così racconta il Re: Malakar bramava il potere della Corona, e le arti proibite lo trasformarono nel Re Lich.'}),
    M(5,{mus:'pr_ombra'}),
    {d:9,set:'pr_rotta',bg:['#0a0612','#2a1030'],stars:1,mus:'pr_ombra',cam:[[0,0,1.3],[0,0,.85]],shake:lt=>lt>3&&lt<4.2?7:lt<3.2?lt*.8:0,flash:lt=>lt>3.1&&lt<4?1-(lt-3.1)/.9:0,
      tx:'In quella stessa notte la Corona andò in pezzi. Sei frammenti attraversarono il cielo e caddero lontano, nei luoghi più oscuri del regno.'},
    M(7,{mus:'pr_ombra'}),
    M(8,{mus:'pr_ombra'}),
    M(9,{mus:'pr_ombra'}),
    {d:12,set:'pr_eroe',bg:['#2a2a5a','#ff9a5a'],mus:'pr_alba',cam:[[-1,-1,.72],[-3.2,-3.2,.86]],tint:lt=>`rgba(255,${150+Math.round(60*fSmooth(lt/8))},90,${.1+.08*fSmooth(lt/8)})`,title:'VOXELIA',sub:'Il Regno Perduto',big:1,tt:4.5,
      act:[fA('hero',{hero:1,go:[[6.5,7.2],[1.4,1.6]],v:.9,t0:.3,zf:lt=>{const u=fClamp((lt-.3)*.9/7.6,0,1);return prHill(fLerp(6.5,1.4,u),fLerp(7.2,1.6,u))}})],
      over:lt=>{const k=fSmooth(lt/10),y=H*(.5-.25*k),g2=g.createRadialGradient(W*.25,y,0,W*.25,y,W*.7);g2.addColorStop(0,`rgba(255,220,150,${.5*k})`);g2.addColorStop(1,'rgba(255,160,80,0)');g.fillStyle=g2;g.fillRect(0,0,W,H)},
      tx:'Oggi il Re Aldric cerca un eroe capace di riunire la Corona. Quell\'eroe sei tu.'}]}}
