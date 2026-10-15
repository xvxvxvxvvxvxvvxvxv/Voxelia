/* ================= 7.12: SOTTO LA CITTÀ — lo spaccato dell'Occhio =================
   Prima era un disegno piatto (ellissi e righe, «come in Paint»). Ora è un plastico voxel tagliato a spicchio, come i
   disegni dei libri di scienze: sopra la città di notte, con le case, il campanile, la piazza e il vecchio pozzo; sotto gli
   strati di terra e di roccia, le radici, le ossa, la cantina murata; in fondo la caverna dove dorme l'Abominio, chiuso
   nella pietra da Aldric il Primo, con il cerchio delle rune che brilla sul pavimento.
   Il pozzo della piazza scende fino alla caverna: è da lì che, la notte della nebbia, salirà la nebbia.
   S2.apre: l'Occhio si apre e la carne respira (la fine del primo atto); altrimenti dorme (il prologo). */
const SOT={u:.5,n:28,x0:-7,zb:-250,zf:-196,C:[-.6,-.6,-146],rz:56};
let SOTL=null;   // il plastico fermo: colonne di terra, oggetti nelle pareti, città (si prepara una volta sola)
const SOTS=[[0,-6,'#6e665a'],[-6,-16,'#3e3024'],[-16,-48,'#5a4030'],[-48,-112,'#4a3a33'],[-112,-196,'#35303b'],[-196,-250,'#231f29']];
// colonna di terra (i,j): gli intervalli pieni, dal basso verso l'alto
function sotCol(i,j){const{u,n,x0,zb,zf,C,rz}=SOT;if(i<0||j<0||i>=n||j>=n)return null;const x=x0+i*u,y=x0+j*u,cx=x+u/2,cy=y+u/2;
  if(x>=0&&y>=0)return[[zb,zf]];                                   // lo spicchio tagliato: resta solo il fondo
  const rr=4.6*(.88+.24*hh(i*.61+3,j*.67+9)),d=Math.hypot(cx-C[0],cy-C[1])/rr,shaft=x>=-1&&x<0&&y>=1&&y<2,cel=x>=4.5&&x<5.5&&y<0;
  let L=[[zb,0]];
  if(d<1){const ceil=C[2]+rz*Math.sqrt(1-d*d);L=[[zb,zf],[ceil,0]]}
  if(shaft)L=[[zb,zf]];                                            // il pozzo scende fino alla caverna
  if(cel)L=L.flatMap(([a,b])=>a<-58&&b>-30?[[a,-58],[-30,b]]:[[a,b]]);  // la cantina murata
  return L}
const sotCov=(c,z0,z1)=>!!c&&c.some(([a,b])=>a<=z0+.01&&b>=z1-.01);
function sotBuild(){if(SOTL)return SOTL;const{u,n,x0}=SOT,L=[],B=(x,y,z,w,d,h,c,f)=>L.push([x,y,z,w,d,h,c,f||1]);
  for(let j=0;j<n;j++)for(let i=0;i<n;i++){const S=sotCol(i,j),x=x0+i*u,y=x0+j*u,nx=sotCol(i+1,j),ny=sotCol(i,j+1),k=hh(i*1.3,j*1.7);
    for(const[a,b]of S)for(const[hi,lo,c]of SOTS){const z0=Math.max(a,lo),z1=Math.min(b,hi);if(z1<=z0)continue;
      const top=z1===b,side=!sotCov(nx,z0,z1)||!sotCov(ny,z0,z1);if(!top&&!side)continue;
      let col=c;if(hi===0&&top)col=(i+j)&1?'#7d766a':'#746d62';if(lo===-196&&k>.82)col='#4a2a34';if(lo===-48&&k>.9)col='#6a5a48';
      if(top&&!side)B(x,y,z1,u,u,0,col,.9+k*.16);else B(x,y,z0,u,u,z1-z0,col,.9+k*.16)}}
  // dettagli sulle pareti tagliate (x=0 e y=0) e su quelle esterne (x=7 e y=7): sassi, radici, ossa, rune del sigillo, vene rosse
  const face=(q,p,z,w,h,c,f)=>{if(q==='x0')B(p-w/2,-.0,z,w,.05,h,c,f);else if(q==='y0')B(-.0,p-w/2,z,.05,w,h,c,f);else if(q==='x7')B(p-w/2,7,z,w,.05,h,c,f);else B(7,p-w/2,z,.05,w,h,c,f)};
  // (le facce: 'x0' = parete y=0 dello spicchio, lungo x; 'y0' = parete x=0, lungo y; 'x7'/'y7' = pareti esterne davanti)
  const holeAt=(q,p,z)=>{const i=q==='x0'||q==='x7'?Math.floor((p-x0)/u):q==='y0'?Math.floor((-.25-x0)/u):n-1,j=q==='y0'||q==='y7'?Math.floor((p-x0)/u):q==='x0'?Math.floor((-.25-x0)/u):n-1,c=sotCol(i,j);return!sotCov(c,z-1,z+1)};
  for(let s=0;s<90;s++){const q=['x0','y0','x7','y7'][s%4],p=(q==='x0'||q==='y0'?.4:-6.6)+hh(s*3.1,7)*6.2,z=-12-hh(s*1.7,3)*230;if(holeAt(q,p,z))continue;
    if(z>-48){if(s%3===0){for(let r=0;r<4;r++)face(q,p+r*.04,z+6-r*7,.05,7,'#3a2a1c')}else face(q,p,z,.16,4,'#8a7a66')}
    else if(z>-112){if(s%7===0){face(q,p,z,.22,5,'#d8ccb4');face(q,p+.06,z+1.5,.04,1.4,'#2a2018')}else face(q,p,z,.2,5,'#5e5046')}
    else face(q,p,z,.24,4,s%5===0?'#7a2a34':'#4a4452')}
  // la cantina murata sotto le case: il muro di mattoni che chiude la vecchia scala
  for(let r=0;r<4;r++)for(let c2=0;c2<3;c2++)B(4.55+c2*.31+(r%2)*.12,-.02,-57+r*6.6,.28,.04,6,(r+c2)%2?'#8a5a44':'#7a4c3a');
  // la città sopra: le case con i tetti a gradoni, il campanile, la piazza con il pozzo e un lampione
  const house=(x,y,w,d,h,wall,roof)=>{B(x,y,0,w,d,h,wall);for(let k=0;k<4;k++)B(x-.08+k*.22,y-.08+k*.22,h+k*6,w+.16-k*.44,d+.16-k*.44,6,roof,1-k*.03);
    for(let k=0;k<Math.floor(w/.9);k++)B(x+.35+k*.9,y+d-.02,h*.45,.32,.05,h*.28,'#3a2a1a');for(let k=0;k<Math.floor(d/.9);k++)B(x+w-.02,y+.35+k*.9,h*.45,.05,.32,h*.28,'#3a2a1a')};
  B(-6.5,-6.5,0,1.7,1.7,92,'#9a9488');for(const z of[30,60])B(-6.55,-6.55,z,1.8,1.8,2.5,'#8a8478');B(-6.6,-6.6,92,1.9,1.9,4,'#7a7468');
  for(const[a,b]of[[-6.5,-6.5],[-5,-6.5],[-6.5,-5],[-5,-5]])B(a,b,96,.2,.2,26,'#9a9488');B(-6.6,-6.6,122,1.9,1.9,4,'#7a7468');B(-5.95,-5.95,104,.6,.6,10,'#c8a040',1.15);
  for(let k=0;k<6;k++)B(-6.5+k*.14,-6.5+k*.14,126+k*9,1.7-k*.28,1.7-k*.28,9,'#3a3a4a',1-k*.02);B(-5.7,-5.7,180,.1,.1,10,'#c8a040');
  B(-5.95,-4.82,44,.5,.04,14,'#1a1416');B(-4.82,-5.95,44,.04,.5,14,'#1a1416');
  house(-3.6,-6.7,2.6,2.2,40,'#c8b89a','#7a3a2a');house(-.6,-6.7,2.4,2.4,36,'#b8a888','#5a4a3a');house(2.4,-6.7,2.4,2.2,46,'#d8c8a8','#8a4a2a');house(5,-6.6,1.8,2.6,34,'#c0b090','#3a5a7a');
  house(-6.7,-3.4,2.2,2.4,38,'#d0c0a0','#6a3a5a');house(-6.7,-.4,2.3,2.6,42,'#c8b898','#8a3a2a');house(-6.7,2.8,2.2,2.2,32,'#b8a888','#3a6a5a');house(-6.7,5.2,2,1.6,30,'#d8c8a8','#7a4a2a');
  house(-3.6,-3.6,1.8,1.6,30,'#c0b090','#5a3a2a');house(1.2,-3.8,2.2,1.8,34,'#d0c4a4','#4a5a3a');house(4,-3.9,2,2,30,'#c8b89a','#7a3a2a');
  for(const[x,y]of[[-1.2,.6],[-.2,.6],[-1.2,2.2],[-.2,2.2]])B(x,y,0,.25,.25,9,'#8a8478');B(-1.1,.7,0,1.05,.25,8,'#7a746a');B(-1.1,2.05,0,1.05,.25,8,'#7a746a');B(-1.1,.7,0,.25,1.6,8,'#7a746a');
  B(-1.12,.62,9,.08,.08,22,'#5a3a1a');B(-.12,.62,9,.08,.08,22,'#5a3a1a');for(let k=0;k<4;k++)B(-1.2+k*.12,.55,31+k*3,.24,1.8,3,'#6a3a24',1-k*.05);for(let k=0;k<4;k++)B(-.24-k*.12,.55,31+k*3,.24,1.8,3,'#5a3220',1-k*.05);B(-.68,1.4,24,.06,.06,6,'#3a2a1a');B(-.74,1.36,20,.18,.18,4,'#7a5a3a');
  B(-2.5,3.2,0,.14,.14,30,'#2a2a2a');B(-2.6,3.1,30,.34,.34,6,'#ffe08a',1.2);
  return SOTL=L}
// l'Occhio: pixel art di fronte allo spettatore (sul piano x+y costante), con le palpebre di carne, le vene, l'iride rossa e la
// pupilla a fessura; op = quanto è aperto (0-1). Si disegna al suo turno, in mezzo ai pezzi del plastico ordinati per profondità.
function sotEye(L,ex,ey,ez,op,lt){L.push({k:ex+ey+.02,z:ez-40,f:()=>{const p=4.4,NW=17,NH=9,X=PX(ex,ey),Y=PY(ex,ey,ez),look=Math.sin(lt*.55)*.22+Math.sin(lt*1.7)*.05,dil=.6+.4*Math.sin(lt*.8);
  const px=(a,b,c)=>{g.fillStyle=c;g.fillRect(X+a*p-p/2-.3,Y-b*p-p/2-.3,p+.6,p+.6)};
  for(let b=-NH-2;b<=NH+2;b++)for(let a=-NW-2;a<=NW+2;a++){const u=a/NW,hv=Math.pow(Math.max(0,1-u*u),.85)*NH,v=b;if(Math.abs(u)>1.12||Math.abs(v)>hv+2.2)continue;
    const inEye=Math.abs(u)<=1&&Math.abs(v)<=hv,open=inEye&&Math.abs(v)<op*hv;let c;
    if(!inEye){c=Math.abs(v)>hv+1.2||Math.abs(u)>1.06?'#1e080b':'#3a1418'}
    else if(!open){const e=Math.abs(v)-op*hv;c=e<1.1&&op>.02?'#2a0c10':(Math.abs(v)>hv-1.2?'#3a1418':((a*3+b*5)&7)===0?'#7a343a':(b>0?'#6a2a30':'#5e242a'))}
    else{const iu=(u-look)*NW/NH,ir=Math.hypot(iu,v/NH*1.0)/.62;
      if(ir<1){const sl=Math.abs(iu)<(.07+.09*dil*op)&&Math.abs(v)<NH*.62*.9;c=sl?'#040203':ir<.45?'#d82a22':ir<.8?((a+b)&1?'#a81414':'#b41a18'):'#5a0606';
        if(iu<-.25&&iu>-.42&&v>NH*.22&&v<NH*.4)c='#fff4e8'}
      else{const ed=1-Math.abs(v)/(op*hv+.01);c=ed<.25?'#b8a890':Math.abs(u)>.62&&((a*7+b*11)%17===0||(b===0&&a%4===0)||(Math.abs(b)===1&&(a*5)%7===0))?'#b83434':'#e6d8c2'}}
    px(a,b,c)}
  // ciglia: spine scure sopra la palpebra di sopra
  for(let a=-NW+3;a<=NW-3;a+=3){const u=a/NW,hv=Math.pow(1-u*u,.85)*NH;px(a,hv+1,'#140406');px(a+(u<0?-1:1),hv+2,'#140406')}}})}
function sotFlesh(L,lt,br){const bx=-2.1,by=-2.1;
  // il corpo: carne a gradoni che respira, mezza chiusa nella pietra del sigillo
  for(let k=0;k<7;k++){const r=2.6-k*.3,z=-196+k*14*br;for(let a=0;a<12;a++){const an=a/12*6.283+k*.4,x=bx+Math.cos(an)*r*.6,y=by+Math.sin(an)*r*.6;L.push([x-.4,y-.4,z,.8,.8,14*br,(a+k)%3?'#4a2026':'#5a2a30'])}}
  for(let a=0;a<16;a++){const an=a/16*6.283,x=bx+Math.cos(an)*1.9,y=by+Math.sin(an)*1.9;L.push([x-.3,y-.3,-196,.6,.6,24+((a*7)%3)*9,a%3?'#6a6672':'#5a5664',.95]);if(a%4===1)L.push([x-.1,y-.1,-170+((a*7)%3)*9,.2,.2,1.2,'#ffd77a',1.3])}
  for(let k=0;k<5;k++){const a=k*.9+.4,x=bx+Math.cos(a)*1.1,y=by+Math.sin(a)*1.1;L.push([x-.18,y-.18,-196+60*br,.36,.36,10,'#e8dcc8',.85],[x-.08,y+.12,-190+64*br,.16,.06,3,'#1a0a0a'])}
  // tentacoli che strisciano sul pavimento e salgono sulle pareti
  for(let t2=0;t2<6;t2++){const a0=t2*1.05+.3;for(let k=0;k<16;k++){const u=k/16,an=a0+Math.sin(lt*.7+t2+u*4)*.12*(1-u),r=1.4+u*2.6,x=bx+Math.cos(an)*r,y=by+Math.sin(an)*r,s=.34-u*.2,z=-196+Math.max(0,Math.sin(u*3+t2)*6);
    L.push([x-s/2,y-s/2,z,s,s,4+s*8,k%2?'#4a2026':'#5a2a30'])}}}
FSET.sotto=(S2,lt,sc,cam)=>{const L=sotBuild().slice(),ap=!!S2.apre,op=ap?fSmooth((lt-1.6)/3.2)*.62:lt>8.2&&lt<9.4?Math.sin((lt-8.2)/1.2*Math.PI)*.22:0,
    br=1+Math.sin(lt*(ap?2.2:1.2))*(ap?.05:.025),ex=-.25,ey=-.25,ez=-146,seal=ap?.55+.45*Math.max(0,Math.sin(lt*9)*Math.sin(lt*2.3)):1;
  sotFlesh(L,lt,br);sotEye(L,ex,ey,ez,op,lt);
  // il cerchio delle rune sul pavimento della caverna
  for(let k=0;k<26;k++){const a=k/26*6.283,x=SOT.C[0]+Math.cos(a)*3.3,y=SOT.C[1]+Math.sin(a)*3.3,on=.5+.5*Math.sin(lt*2+k*.7);L.push([x-.13,y-.13,-196,.26,.26,.5,on*seal>.55?'#ffd77a':'#8a7040',1.1+on*.3*seal])}
  const dk=a=>a.f?a.k:a[0]+a[3]/2+a[1]+a[4]/2,dz=a=>a.f?a.z:a[2];L.sort((a,b)=>dk(a)-dk(b)||dz(a)-dz(b));
  for(const b of L){if(b.f)b.f();else box(b[0],b[1],b[2],b[3],b[4],b[5],b[6],b[7])}
  // luci: le finestre e il lampione della città, la luna, le rune del sigillo, l'Occhio
  for(const[x,y,z]of[[-2.2,-4.5,18],[1.6,-4.8,16],[-6,1.2,20],[-6,3.4,15],[3.3,-4.6,20],[-4.6,-3.7,16]])fGlow(x,y,z,'255,200,120',26,.25+.05*Math.sin(lt*3+x));
  fGlow(-2.45,3.25,34,'255,220,140',46,.35);
  fGlow(SOT.C[0]+1.2,SOT.C[1]+1.2,-192,'255,215,120',170,.2*seal);fGlow(1.6,1.6,-194,'255,215,120',90,.14*seal);
  fGlow(ex,ey,ez,'255,40,30',70+150*op,(ap?.12:.06)+.5*op);
  // un filo di nebbia che sale dal pozzo della piazza
  for(let k=0;k<5;k++){const u=(lt*.18+k/5)%1;fGlow(-.5+Math.sin(lt*.5+k)*.3,1.5,6+u*70,'170,180,170',18+u*26,.1*(1-u))}};
