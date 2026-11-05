/* ================= 7.12: I BIOMI RIFATTI — come si disegnano =================
   Ogni casella dei biomi porta nel suo codice ('₪' + lettera) che cosa c'è: un albero, una roccia, un pezzo di piramide o un
   arredo. L'ultima cifra del codice è il terreno sotto (sentiero, prato fiorito, muschio, lastricato, riva, terra battuta,
   lava, cenere): così sotto gli alberi e gli arredi c'è lo stesso terreno che intorno. Tutto è fermo (niente ondeggiare),
   così le caselle diventano figurine e la zona grande resta leggera; si muovono solo fuochi, bocche di lava e cristalli. */
/* ---- il terreno ---- */
const BFL={
  forest:{'1':['#9a7a52','#927248'],'2':['#5a9a42','#54923e'],'3':['#3f7834','#3a7030'],'4':['#8e8c80','#868478'],'6':['#a89a6a','#a09264'],'7':['#7a6648','#725f42']},
  desert:{'1':['#c49a5c','#bc9356'],'2':['#e2c27c','#dcbc76'],'3':['#c99f63','#c1985d'],'4':['#d8c49a','#cfbb90'],'6':['#7aa04e','#729848'],'7':['#b88c56','#b08550']},
  peaks:{'1':['#b4bcc6','#acb4be'],'3':['#d4e6f0','#cde0ec'],'4':['#9aa2ac','#929aa4'],'6':['#d6e6f0','#cee0ec'],'7':['#e6edf4','#dbe4ee'],'8':['#3a3232','#342c2c'],'9':['#5c5652','#56504c']}};
const FLW=['#ffe24a','#ff8ab8','#ffffff','#9ad0ff','#c88aff'];
function bFloor(x,y,v,h){const th=ZZ.th,P2=BFL[th]&&BFL[th][v];if(!P2)return false;const k=hh(x*5.3+1,y*2.9+3),k2=hh(x*2.1+7,y*4.7+1);
  box(x,y,-6,1,1,6,(x+y)&1?P2[0]:P2[1],.92+h*.16);
  switch(th+v){
    // sentieri: sassolini, ciuffi d'erba ai bordi, impronte nella neve
    case 'forest1':if(k>.55)box(x+.15+k*.5,y+.3,0,.12,.1,1,'#b8a888');if(k2<.3)box(x+.6,y+.55+k2,0,.1,.08,.8,'#7a6a52');if(k2>.85)box(x+.2,y+.75,0,.05,.05,3,'#4a8a3a');break;
    case 'desert1':if(k>.5)box(x+.2+k*.4,y+.35,0,.1,.08,.8,'#a8804a');box(x+.05,y+.28,0,.9,.05,.3,'#b0884e');box(x+.05,y+.68,0,.9,.05,.3,'#b0884e');break;
    case 'peaks1':box(x+.28,y+.2+k*.2,0,.1,.14,.3,'#9aa2ac');box(x+.52,y+.5+k*.2,0,.1,.14,.3,'#9aa2ac');if(k2>.7)box(x+.7,y+.2,0,.12,.1,1,'#8a929c');break;
    // prato fiorito, dune increspate
    case 'forest2':for(let i=0;i<3;i++){const q=hh(x*7+i,y*3-i);if(q>.35)box(x+.12+q*.66,y+.12+((i*.31+q)%.7),0,.09,.09,1.6+q*2,FLW[(x+y*3+i)%5])}if(k>.4)box(x+.3,y+.5,0,.05,.05,4,'#4a8a3a');break;
    case 'desert2':box(x+.05,y+.3+k*.3,0,.9,.06,.5,'#e8ca86');break;
    // muschio e felci, terra crepata, ghiaccio lucido
    case 'forest3':box(x+.15+k*.3,y+.2,0,.32,.26,.6,'#2f6a2a');if(k2>.6){box(x+.3,y+.45,0,.42,.06,2.5,'#3f8a3a');box(x+.48,y+.27,0,.06,.42,2.5,'#3f8a3a')}break;
    case 'desert3':if(k>.35){box(x+.1+k*.2,y+.4,0,.4,.03,.2,'#b48a56');box(x+.5,y+.15+k*.2,0,.03,.4,.2,'#b48a56')}break;
    case 'peaks3':if(k>.55)box(x+.15+k*.2,y+.3+k2*.3,0,.36,.04,.2,'#f4fbff');if(k2>.85)box(x+.6,y+.2,0,.1,.1,.6,'#ffffff');break;
    // lastricati: lastre un po' storte, erba o sabbia o neve nelle fessure
    case 'forest4':case 'desert4':case 'peaks4':{const S2=th==='forest'?['#9a988c','#8a887c','#a4a296']:th==='desert'?['#e0cca2','#d2be94','#e8d4aa']:['#a8b0ba','#9aa2ac','#b0b8c2'];
      box(x+.04,y+.04,0,.44,.92,.5,S2[0]);box(x+.52,y+.04,0,.44,.44,.5,S2[1]);box(x+.52,y+.52,0,.44,.44,.5,S2[2]);
      if(k>.7)box(x+.48,y+.3,0,.04,.04,2.2,th==='forest'?'#4a8a3a':th==='desert'?'#d9b56b':'#ffffff');if(th==='desert'&&k2>.9)box(x+.6,y+.6,.5,.1,.06,.2,'#3a5a9a');break}
    // rive: sassi, conchiglie, lastre di ghiaccio; nell'oasi l'erba
    case 'forest6':if(k>.5)box(x+.2+k*.4,y+.3,0,.14,.12,1.4,'#8a8a80');if(k2>.75)box(x+.6,y+.65,0,.06,.06,4,'#5a8a3a');break;
    case 'desert6':if(k>.4){box(x+.2+k*.3,y+.3,0,.05,.05,4+k*3,'#4a8a3a');box(x+.55,y+.6-k*.2,0,.05,.05,3+k*2,'#5a9a42')}break;
    case 'peaks6':if(k>.5)box(x+.15,y+.2,0,.4,.3,.8,'#e8f4fc');break;
    // terra battuta (paglia, ossicini), cumuli di neve, lava e cenere
    case 'forest7':case 'desert7':if(k>.6)box(x+.2+k*.4,y+.4,0,.3,.04,.4,'#c8b060');if(k2>.88)box(x+.6,y+.3,0,.16,.05,.6,'#e8e0d0');break;
    case 'peaks7':if(k>.45){box(x+.12+k*.2,y+.14+k2*.2,0,.5,.44,.6+k*1.2,'#f8fbfd');box(x+.22+k*.2,y+.24+k2*.2,.6+k*1.2,.28,.24,.6,'#ffffff')}break;
    case 'peaks8':box(x+.1,y+.45,0,.8,.06,.3,'#ff6a1a',1.3);box(x+.45,y+.1,0,.06,.36,.3,'#ff8a2a',1.3);if(k>.6)box(x+.2,y+.7,0,.3,.05,.3,'#ff6a1a',1.3);break;
    case 'peaks9':if(k>.4)box(x+.2+k*.4,y+.3,0,.08,.08,.5,'#8a2a1a',1.2);if(k2>.6)box(x+.5,y+.6,0,.25,.2,.6,'#6a6460');break}
  return true}
const _floor712b=floor;floor=function(x,y,c,h){if(c===0&&isBio(ZZ)){const q=bCode(DEC[y][x],ZZ.th);if(q&&q[2]&&bFloor(x,y,q[2],h))return}_floor712b(x,y,c,h)};

/* ---- alberi, rocce e strutture (le caselle "muro") ---- */
const _wall712b=wall;wall=function(x,y,h){if(isBio(ZZ)){const q=bCode(DEC[y][x],ZZ.th);if(q&&q[0]&&bWall(x,y,q,h))return}_wall712b(x,y,h)};
function bWall(x,y,q,h){const th=ZZ.th,k=q[0],fr=x===N-1||y===N-1;
  if(th==='forest')switch(k){
    case 'O':bOak(x,y,h);return true;case 'P':bPine(x,y,h,0);return true;case 'B':bBirch(x,y,h);return true;case 'U':bBush(x,y,h);return true;
    case 'R':bRock(x,y,h,'#7a7a72','#4a7a3a');return true;case 'E':bBigOak(x,y,+q[1]);return true;case 'Z':if(fr)bBush(x,y,h);else bEdgeTree(x,y,h);return true;
    case 'W':bRuin(x,y,h,'#8a8a80','#6e6e66','#4a7a3a');return true;case 'K':bPalisade(x,y);return true}
  else if(th==='desert')switch(k){
    case 'M':bMesa(x,y,h,fr);return true;case 'Q':bSaguaro(x,y,h);return true;case 'J':bCactus(x,y,h);return true;case 'V':bDeadTree(x,y,h,'#7a6a5a',0);return true;
    case 'X':bPalm(x,y,h);return true;case 'Y':bPyr(x,y,q[1],h);return true;case 'S':if(q[1]==='3')bSphinx(x-1,y-1);return true;
    case 'W':bRuin(x,y,h,'#c8a46a','#a8844e','#e2c27c');return true}
  else if(th==='peaks')switch(k){
    case 'N':bCliff(x,y,h,fr);return true;case 'F':bPine(x,y,h,1);return true;case 'G':bCrystal(x,y,h);return true;case 'Y':bDeadTree(x,y,h,'#8aa8c0',1);return true;
    case 'K':{const v=q[2]==='8'||q[2]==='9';bRock(x,y,h,v?'#3a3434':'#8a949e',v?'':'#f4f8fc',q[2]==='8');return true}
    case 'W':bRuin(x,y,h,'#8a96a4','#6e7a88','#f4f8fc');return true}
  return false}
// quercia: radici, tronco e una chioma a ciuffi (i ciuffi davanti più bassi, quello dietro più alto)
function bOak(x,y,h){const s=.85+h*.35,c1=h>.55?'#2f6b2a':'#3a7530',c2=h>.55?'#3d7d33':'#4a8a3a',o=(hh(x*3,y)-.5)*.12;
  box(x+.36,y+.4,0,.28,.2,1.6,'#4a3220');box(x+.4,y+.36,0,.2,.28,1.6,'#4a3220');box(x+.43,y+.43,0,.14,.14,13*s,'#5a3c22');
  box(x+.14+o,y+.06,12*s,.5,.5,11*s,c1,.95);box(x+.08,y+.1,10*s,.84,.8,9*s,c1);box(x+.72,y+.3+o,11*s,.24,.42,6*s,c1,.96);box(x+.3-o,y+.72,11*s,.42,.24,6*s,c1,.96);
  box(x+.18,y+.18,19*s,.62,.62,6*s,c2);box(x+.3+o,y+.28,25*s,.38,.38,3.5*s,c2,1.08);
  if(h>.86){box(x+.7,y+.9,15*s,.08,.06,1.6,'#c0392b');box(x+.94,y+.5,16*s,.06,.08,1.6,'#c0392b')}}
// pino (e abete innevato): cinque palchi che si stringono verso la punta
function bPine(x,y,h,snow){const s=.8+h*.45,c=snow?'#2a5446':'#24553a',c2=snow?'#31604f':'#2c6444';box(x+.44,y+.44,0,.12,.12,7*s,'#4a3220');
  for(const[i,z,hz,j]of[[.08,6,6.5,0],[.17,11.5,6,1],[.26,17,5.5,0],[.35,22,5,1],[.43,26.5,4,0]]){box(x+i,y+i,z*s,1-2*i,1-2*i,hz*s,j?c2:c);if(snow)box(x+i+.03,y+i+.03,(z+hz)*s,1-2*i-.06,1-2*i-.06,1.1,'#f4f8fc')}
  box(x+.46,y+.46,30.5*s,.08,.08,3*s,snow?'#f4f8fc':c)}
// betulla: tronco bianco con le macchie nere, chioma chiara
function bBirch(x,y,h){const s=.8+h*.4;box(x+.44,y+.44,0,.12,.12,20*s,'#ece8e0');
  for(let i=0;i<4;i++){box(x+.44+(i%2)*.05,y+.556,(3+i*4.4)*s,.06,.012,1,'#2a2a2a');box(x+.556,y+.46,(5+i*4.4)*s,.012,.06,1,'#2a2a2a')}
  box(x+.2,y+.12,15*s,.5,.4,7*s,'#5a9a40',.95);box(x+.16,y+.18,14*s,.66,.62,8*s,'#62a044');box(x+.7,y+.32,15*s,.2,.38,5*s,'#5a9a40');box(x+.26,y+.28,22*s,.46,.44,4*s,'#6eaa48',1.05)}
// cespuglio (d'estate con le bacche rosse, in montagna con la neve)
function bBush(x,y,h){const pk=ZZ.th==='peaks',c=pk?'#3a6a52':'#3a7a30';box(x+.1,y+.12,0,.8,.76,6+h*3,c);box(x+.2,y+.2,6+h*3,.58,.56,3,c,1.1);
  if(pk)box(x+.22,y+.22,9+h*3,.5,.5,1.2,'#f4f8fc');else if(h>.45)for(let i=0;i<3;i++)box(x+.2+i*.24,y+.87,2.5+(i%2)*2.5,.08,.04,1.4,'#c0392b')}
// roccia (col muschio, con la neve, o di basalto con le crepe di lava)
function bRock(x,y,h,c,top,lava){const hz=6+h*7;box(x+.1,y+.14,0,.8,.72,hz,c,.92+h*.1);box(x+.2,y+.2,hz,.56,.5,2.4,c,1.04);box(x+.6,y+.6,0,.32,.3,3.5,c,.9);
  if(top)box(x+.16,y+.18,hz,.42,.36,1.1,top);if(lava){box(x+.3,y+.865,1,.36,.012,hz*.5,'#ff6a1a',1.35);box(x+.905,y+.3,1,.012,.3,hz*.4,'#ff8a2a',1.35)}}
// la Grande Quercia (3×3): il tronco enorme con l'incavo, le radici, la chioma a cupola
function bBigOak(x,y,p){const i=p%3,j=p/3|0,ed=(i===1)+(j===1),R='#4a3220',T='#5a3c22',C=['#285e26','#2f6a2a','#36742e'][(i+j)%3];
  if(ed===2){box(x-.15,y-.15,0,1.3,1.3,46,T);for(let k=0;k<4;k++){box(x-.15+k*.34,y+1.15,3+k*5,.06,.012,30-k*5,R);box(x+1.15,y-.1+k*.34,5+k*4,.012,.06,28-k*4,R)}
    box(x+.25,y+1.152,2,.5,.012,11,'#1a120a');box(x+.3,y+1.153,13,.4,.012,1.4,R);box(x+.2,y+1.155,15,.12,.04,4,'#e8e0d0');box(x+.66,y+1.155,16,.12,.04,3,'#e8e0d0');
    for(const[vx,vz]of[[.05,26],[.9,30],[1.05,22]])box(x-.1+vx,y+1.16,vz,.05,.012,14,'#3a6a2a');
    box(x-.1,y-.1,42,1.2,1.2,30,C);box(x+.1,y+.1,72,.8,.8,5,'#3a7a34');box(x+.3,y+.25,77,.4,.4,3,'#428a3a');return}
  // radici verso il tronco
  const dx=1-i,dy=1-j;if(ed===1)box(x+(dx?(dx>0?.45:0):.32),y+(dy?(dy>0?.45:0):.32),0,dx?.55:.36,dy?.55:.36,4,R);else box(x+.3+dx*.2,y+.3+dy*.2,0,.4,.4,2.5,R);
  if(ed===1){const ox=i===0?-.25:0,oy=j===0?-.25:0,w=i===1?1:1.25,d=j===1?1:1.25;box(x+ox,y+oy,40,w,d,24,C);box(x+ox+.2,y+oy+.2,64,w-.4,d-.4,4,'#3a7a34');
    if(i===2||j===2)for(let k=0;k<3;k++){const q=hh(x*3+k,y*5);box(x+.2+k*.25,y+.6+q*.2,0,.08,.08,2+q*2,'#e8e0d0');box(x+.16+k*.25,y+.56+q*.2,2+q*2,.16,.16,1.2,'#c0392b')}}
  else{const ox=i===0?.2:0,oy=j===0?.2:0;box(x+ox,y+oy,44,.8,.8,16,C);box(x+ox+.15,y+oy+.15,60,.5,.5,3,'#3a7a34')}}
// gli alberi del bordo: un muro di chiome scure (davanti, per non coprire la vista, solo cespugli)
function bEdgeTree(x,y,h){const s=.9+h*.45,c=h>.5?'#23502a':'#285a2e';box(x+.42,y+.42,0,.16,.16,11*s,'#3a2818');box(x,y,9*s,1,1,11*s,c);box(x+.08,y+.08,20*s,.84,.84,7*s,c,1.06);box(x+.22+(h-.5)*.2,y+.22,27*s,.5,.5,5*s,c,1.12)}
// muro in rovina: corsi di pietre, cima spezzata, muschio o sabbia o neve sopra
function bRuin(x,y,h,c,c2,top){const hz=5+Math.floor(h*5)*5;box(x+.04,y+.04,0,.92,.92,hz,c,.9+h*.1);for(let z=5;z<hz;z+=5){box(x+.04,y+.954,z,.92,.012,.7,c2);box(x+.954,y+.04,z,.012,.92,.7,c2)}
  if(h>.45)box(x+.18+(h-.45)*.4,y+.2,hz,.36,.4,3,c,1.04);box(x+.08,y+.08,hz,.4,.4,.8,top)}
// palizzata dei goblin: pali appuntiti legati con la corda, nel verso del recinto
function bPalisade(x,y){const K=(u,v)=>{const d=DEC[v]&&DEC[v][u];return!!d&&d[1]==='K'&&M[v][u]===1},vt=(K(x,y-1)||K(x,y+1))&&!(K(x-1,y)||K(x+1,y));
  for(let i=0;i<3;i++){const hz=17+((x*7+y*3+i)%3)*3,u=.08+i*.3,px=vt?x+.38:x+u,py=vt?y+u:y+.38;box(px,py,0,.24,.24,hz,i%2?'#7a5a3a':'#6e5034');box(px+.05,py+.05,hz,.14,.14,3,'#8a6a4a');box(px+.09,py+.09,hz+3,.06,.06,2,'#9a7a5a')}
  if(vt){box(x+.625,y,5,.012,1,1.4,'#4a3a2a');box(x+.625,y,13,.012,1,1.4,'#4a3a2a')}else{box(x,y+.625,5,1,.012,1.4,'#4a3a2a');box(x,y+.625,13,1,.012,1.4,'#4a3a2a')}}
// rupi di arenaria a terrazze, con gli strati
function bMesa(x,y,h,fr){if(fr){box(x,y,0,1,1,5+h*3,'#c4935a');box(x+.15,y+.15,5+h*3,.6,.6,2,'#d0a066');return}
  const hz=11+Math.floor(vnz(x,y,5,8)*4)*6+(h>.75?2:0);box(x,y,0,1,1,hz,'#c4935a',.93+h*.07);
  for(let z=4;z<hz-1;z+=6){box(x,y+.992,z,1,.016,1.4,'#a87a48');box(x+.992,y,z,.016,1,1.4,'#a87a48')}
  box(x+.02,y+.02,hz,.96,.96,.8,'#d8a868');if(h>.8)box(x+.3,y+.35,hz+.8,.3,.25,2,'#b8884e')}
// saguaro con le braccia (e a volte un fiore)
function bSaguaro(x,y,h){const H2=22+h*12,c='#4e9a47';box(x+.25,y+.44,13,.16,.12,2.6,c);box(x+.21,y+.44,13,.12,.12,7,c);
  box(x+.41,y+.41,0,.18,.18,H2,c);box(x+.43,y+.43,H2,.14,.14,1.6,'#5aaa52');box(x+.41,y+.585,2,.18,.012,H2-3,'#3e8a3a');
  box(x+.59,y+.44,9,.16,.12,2.6,c);box(x+.7,y+.44,9,.12,.12,9+h*4,c);if(h>.5){box(x+.45,y+.45,H2+1.6,.1,.1,1.4,'#ff6a8a');box(x+.72,y+.46,18+h*4,.08,.08,1.2,'#ffd84a')}}
// cactus a botte col fiore giallo, o fico d'india con i frutti
function bCactus(x,y,h){if(h<.5){box(x+.25,y+.25,0,.5,.5,9,'#5aa84e');box(x+.3,y+.3,9,.4,.4,2,'#6ab85a');box(x+.25,y+.745,1,.5,.012,7,'#4a9840');box(x+.42,y+.42,11,.16,.16,1.6,'#ffd84a');return}
  box(x+.14,y+.42,8,.3,.1,8,'#5a9a4a');box(x+.3,y+.4,0,.36,.12,10,'#5a9a4a');box(x+.5,y+.38,9,.3,.1,9,'#64a454');box(x+.2,y+.43,16,.06,.06,1.5,'#e84a6a');box(x+.62,y+.4,18,.06,.06,1.5,'#e84a6a');box(x+.36,y+.42,10,.06,.06,1.5,'#e84a6a')}
// albero secco (e, sui picchi, gelato con i ghiaccioli)
function bDeadTree(x,y,h,c,ice){box(x+.44,y+.22,14,.08,.08,6,c);box(x+.44,y+.25,14,.08,.2,1.6,c);box(x+.2,y+.45,10,.08,.08,7,c);box(x+.2,y+.45,10,.24,.08,1.6,c);
  box(x+.36,y+.4,0,.28,.2,1.5,c,.85);box(x+.42,y+.42,0,.16,.16,15+h*5,c);box(x+.56,y+.45,12,.26,.08,1.6,c);box(x+.78,y+.45,12,.08,.08,8+h*3,c);
  if(ice){box(x+.76,y+.43,20+h*3,.12,.12,1.2,'#f4f8fc');box(x+.4,y+.4,15+h*5,.2,.2,1.2,'#f4f8fc');for(let i=0;i<3;i++)box(x+.26+i*.25,y+.5,9-i,.03,.03,2.5,'#cfeaf8',1.2)}}
// palma: tronco curvo ad anelli, foglie a raggiera, noci di cocco
function bPalm(x,y,h){const s=h>.5?1:-1,top=28+h*8,px=x+.42;for(let i=0;i<6;i++)box(px+s*i*.035,y+.42,i*top/6,.16,.16,top/6+.3,i%2?'#8a6a42':'#7a5a3a');
  const cx=px+s*.21+.08,cy=y+.5,L='#3a8a3a',L2='#2f7a30';
  box(cx-.55,cy-.06,top,.5,.12,1.6,L2);box(cx-.6,cy-.06,top-3,.08,.12,3,L2);box(cx-.06,cy-.55,top,.12,.5,1.6,L2);box(cx-.06,cy-.6,top-3,.12,.08,3,L2);
  box(cx-.12,cy-.12,top,.24,.24,2.4,'#5a4a2a');box(cx-.1,cy+.05,top-2.5,.09,.09,2.2,'#6a4a2a');box(cx+.03,cy+.06,top-2.2,.09,.09,2.2,'#5a3a1a');
  box(cx+.05,cy-.06,top+.4,.5,.12,1.6,L);box(cx+.52,cy-.06,top-2.6,.08,.12,3,L);box(cx-.06,cy+.05,top+.4,.12,.5,1.6,L);box(cx-.06,cy+.52,top-2.6,.12,.08,3,L);
  box(cx-.32,cy-.32,top+1.6,.2,.2,1.2,L);box(cx+.12,cy+.12,top+1.6,.24,.24,1.2,L)}
// la Piramide di Khem: sei gradoni con i corsi di blocchi, la cima d'oro e il portale
const PYH=15;
function bPyr(x,y,p,h){const door=p==='d',l=door?0:+p||0,hz=(l+1)*PYH,lv=(u,v)=>{const d=DEC[v]&&DEC[v][u];return d&&d[1]==='Y'&&M[v][u]===1?(d[2]==='d'?0:+d[2]||0):-1};
  box(x,y,0,1,1,hz,l%2?'#c9a860':'#cfae66',.94+h*.05);const fy=lv(x,y+1),fx=lv(x+1,y);
  for(let z=(fy+1)*PYH+3.6;z<hz;z+=3.6){box(x,y+.992,z,1,.016,.6,'#a8884a');if(((z/3.6|0)+x)%2)box(x+.5,y+.992,z-3.6,.016,.016,3.6,'#a8884a')}
  for(let z=(fx+1)*PYH+3.6;z<hz;z+=3.6){box(x+.992,y,z,.016,1,.6,'#9a7c44');if(((z/3.6|0)+y)%2)box(x+.992,y+.5,z-3.6,.016,.016,3.6,'#9a7c44')}
  if(fy<l)box(x,y+.99,hz-.8,1,.02,.8,'#e0c27c');if(fx<l)box(x+.99,y,hz-.8,.02,1,.8,'#d4b672');
  if(l===5&&lv(x+1,y)<5&&lv(x,y+1)<5){box(x-.5,y-.5,hz,1,1,6,'#d4af37',1.1);box(x-.3,y-.3,hz+6,.6,.6,4,'#e8c54a',1.15);box(x-.12,y-.12,hz+10,.24,.24,3,'#f0d060',1.2);if(SET.ultra)GLOW.push([x,y,hz+8,40,'255,210,90',.22])}
  if(door){box(x+.06,y+.86,0,.88,.2,15,'#d8b878');box(x+.24,y+1.05,0,.52,.012,11,'#1a120a');box(x+.02,y+.84,15,.96,.24,2.6,'#e0c088');for(let i=0;i<3;i++)box(x+.14+i*.3,y+1.08,12.4,.12,.012,1.2,'#3a5a9a')}}
// la Sfinge (2×2, disegnata tutta dalla casella davanti): corpo di leone, zampe, il copricapo a righe blu e oro
function bSphinx(x,y){const c='#d8b878',c2='#c9a860',b='#3a5a9a',G='#d4af37';
  box(x+.05,y+.05,0,1.9,1.9,3,c2);box(x+.25,y+.2,3,.3,.7,7,c);box(x+.35,y+.15,3,1.3,1,8,c);box(x+1.45,y+.2,3,.3,.7,7,c);box(x+1.7,y+.3,3,.08,.75,1.4,c);
  box(x+.55,y+.95,3,.9,.5,13,c);box(x+.62,y+.92,15,.76,.5,11,b);for(const z of[16.5,19.5,22.5])box(x+.61,y+.91,z,.78,.52,1.2,G);box(x+.66,y+.96,26,.68,.42,1.2,b);
  box(x+.6,y+1.3,8,.14,.16,10,b);box(x+1.26,y+1.3,8,.14,.16,10,b);for(const z of[10,13,16])for(const px of[.59,1.25])box(x+px,y+1.29,z,.16,.18,.9,G);
  box(x+.74,y+1.36,15.5,.52,.1,9,c);box(x+.82,y+1.462,20.5,.1,.012,1.2,'#1a1a1a');box(x+1.08,y+1.462,20.5,.1,.012,1.2,'#1a1a1a');box(x+.96,y+1.46,18,.08,.05,2,c2);
  box(x+.95,y+1.38,11.5,.1,.08,4,b);box(x+.97,y+1.36,24.5,.06,.06,2.5,G);
  box(x+.42,y+1.2,3,.32,.72,3.5,c);box(x+1.26,y+1.2,3,.32,.72,3.5,c);for(const px of[.42,1.26])for(let i=0;i<3;i++)box(x+px+.03+i*.1,y+1.915,3,.06,.012,1.6,c2)}
// pareti di roccia dei picchi, con la neve in cima e le colate bianche
function bCliff(x,y,h,fr){if(fr){box(x,y,0,1,1,6+h*3,'#7a8696');box(x+.06,y+.06,6+h*3,.88,.88,1.6,'#f4f8fc');return}
  const n=vnz(x,y,5,5),j=hh(x*3.1+2,y*1.7+5),hz=Math.round(16+n*30+(j-.5)*7),lo=hz*.42;
  box(x,y,0,1,1,lo,'#6a7686',.9+h*.08);box(x,y,lo,1,1,hz-lo,'#7c8898',.92+h*.08);
  box(x+.992,y+.15+j*.45,lo*.4,.016,.3,hz*.45,'#5a6676');box(x+.2+j*.4,y+.992,lo*.5,.25,.016,hz*.4,'#5a6676');if(j>.6)box(x+.6,y+.9,lo,.3,.14,3,'#7c8898');
  box(x-.02,y-.02,hz,1.04,1.04,2.2,'#f4f8fc');box(x,y+.994,hz-3-j*3,.3+j*.5,.016,3+j*3,'#eef3f8');box(x+.994,y+.1+h*.4,hz-2-h*3,.016,.4,2+h*3,'#eef3f8')}
// punte di cristallo di ghiaccio che brillano
function bCrystal(x,y,h){box(x+.14,y+.2,0,.22,.22,10+h*6,'#7ac8f0',1.1);box(x+.38,y+.32,0,.28,.28,20+h*10,'#9adcff',1.15);box(x+.43,y+.37,20+h*10,.18,.18,3,'#e8f8ff',1.3);
  box(x+.62,y+.58,0,.2,.2,12+h*5,'#bfe8ff',1.2);box(x+.2,y+.64,0,.16,.16,7,'#9adcff',1.15);nlight(x+.5,y+.5,14,110,'150,220,255',.6);if(SET.ultra)GLOW.push([x+.5,y+.5,14,40,'150,220,255',.2])}

/* ---- gli arredi dei biomi ---- */
const _decN712b=decN;decN=function(x,y,k,h){if(isBio(ZZ)&&decB(x,y,k,h))return true;return _decN712b(x,y,k,h)};
function decB(x,y,k,h){const th=ZZ.th;if(k>='0'&&k<='9')return true;switch(k){
  // fuoco da campo: il cerchio di sassi, i ciocchi, la fiamma
  case 'f':{for(let i=0;i<8;i++){const a=i/8*6.283;box(x+.5+Math.cos(a)*.32-.07,y+.5+Math.sin(a)*.32-.07,0,.14,.14,2.5,'#7a7a72')}box(x+.3,y+.42,0,.4,.16,2,'#5a3a1a');box(x+.42,y+.3,0,.16,.4,2,'#4a2a10');
    const fl=1+Math.sin(t*11+x*3)*.2,f2=1+Math.sin(t*13+y)*.2;box(x+.36,y+.36,2,.28,.28,6*fl,'#ff7a2a',1.3);box(x+.42,y+.42,4,.16,.16,6*f2,'#ffd04a',1.45);
    nlight(x+.5,y+.5,8,170,'255,140,60',1);if(SET.ultra)GLOW.push([x+.5,y+.5,8,56,'255,140,60',.32]);if(SET.part&&Math.random()<.06)sparks(x+.5,y+.5,1,['#ffb04a','#ff7a2a'],30);break}
  // tenda: di pelli rattoppate (goblin) o a righe (carovana)
  case 't':{const D=th==='desert',c1=D?'#c0392b':'#8a6a4a',c2=D?'#f0e8d8':'#76563a';box(x+.02,y+.48,0,.05,.05,22,'#5a3a1a');
    for(let i=0;i<4;i++)for(let j=0;j<5;j++){const w=.94-j*.18;box(x+.04+i*.23,y+.5-w/2,j*3.8,.23,w,3.8,i%2?c2:c1)}
    box(x+.966,y+.4,0,.012,.2,10,'#2a1a10');box(x+.966,y+.4,10,.012,.2,1.2,c2);box(x+.95,y+.48,0,.05,.05,22,'#5a3a1a');
    if(!D){box(x+.93,y+.46,22,.1,.1,2.5,'#e8e0d0');box(x+.3,y+.12,5,.22,.012,4,'#5a3a24')}else box(x+.97,y+.49,18,.24,.03,3.5,'#2a6ad8');break}
  // tronco caduto con il muschio e un fungo
  case 'l':box(x+.04,y+.36,0,.92,.3,5,'#6b4a2b');box(x+.04,y+.36,5,.92,.3,.6,'#7b5a3b');box(x+.955,y+.38,.4,.012,.26,4.2,'#c8a070');box(x+.96,y+.44,1.6,.012,.14,2,'#a87a50');
    box(x+.2,y+.36,5.6,.3,.2,.6,'#4a7a3a');if(h>.5){box(x+.62,y+.3,5,.08,.08,2,'#e8e0d0');box(x+.58,y+.26,7,.16,.16,1.2,'#c0392b')}break;
  // funghi rossi a pois
  case 'u':for(const[px,py,s]of[[.18,.2,.8],[.55,.32,1.1],[.3,.58,.7],[.62,.66,.9]]){const q=hh(x*3+px*9,y*7+py*9);if(q<.25)continue;
    box(x+px+.06*s,y+py+.06*s,0,.08*s,.08*s,5*s,'#e8e0d0');box(x+px,y+py,5*s,.2*s,.2*s,2.2*s,'#c0392b');box(x+px+.06*s,y+py+.06*s,7.2*s,.08*s,.08*s,.5,'#f4f0e0')}break;
  // costole di una bestia
  case 'r':for(let i=0;i<4;i++){const px=x+.1+i*.22,hz=14-Math.abs(i-1.5)*2;box(px,y+.18,0,.08,.08,hz,'#e8e0d0');box(px,y+.18,hz,.08,.64,1.6,'#e8e0d0');box(px,y+.74,0,.08,.08,hz,'#e8e0d0')}box(x,y+.46,14.5,1,.1,1.8,'#d8d0c0');break;
  // teschi e ossa
  case 'k':box(x+.15,y+.7,0,.06,.24,.8,'#d8d0c0');box(x+.3,y+.35,0,.26,.22,2.4,'#e8e0d0');box(x+.33,y+.572,.8,.06,.012,.8,'#2a2a2a');box(x+.45,y+.572,.8,.06,.012,.8,'#2a2a2a');box(x+.55,y+.6,0,.36,.06,.8,'#d8d0c0');break;
  // obelisco con i geroglifici e la punta d'oro
  case 'o':box(x+.25,y+.25,0,.5,.5,4,'#b8944e');box(x+.33,y+.33,4,.34,.34,32,'#d8b878',.95+h*.05);for(let i=0;i<4;i++)box(x+.42,y+.672,8+i*6,.16,.012,2.4,i%2?'#a83a2a':'#3a5a9a');
    box(x+.37,y+.37,36,.26,.26,2.5,'#e8c54a',1.15);box(x+.43,y+.43,38.5,.14,.14,2,'#f0d060',1.2);break;
  // colonna spezzata e il rocchio caduto
  case 'p':{const hz=10+h*14;if(h>.4)box(x+.05,y+.6,0,.4,.3,3,'#d0b07a');box(x+.22,y+.22,0,.56,.56,2.5,'#c8a46a');box(x+.28,y+.28,2.5,.44,.44,hz,'#d8bc86');box(x+.3,y+.3,2.5+hz,.3,.24,2,'#d8bc86');
    box(x+.4,y+.722,3,.04,.012,hz-1,'#c0a470');break}
  // la testa di un faraone di pietra, mezza sepolta
  case 'h':box(x+.1,y+.15,0,.8,.7,4,'#d9b56b');box(x+.12,y+.2,6,.76,.55,9,'#3a5a9a');for(const z of[8,10.5,13])box(x+.11,y+.19,z,.78,.57,.7,'#d4af37');box(x+.22,y+.25,2,.56,.55,12,'#c9a860');
    box(x+.3,y+.79,4,.4,.012,7,'#c9a860');box(x+.35,y+.802,8,.08,.012,1,'#1a1a1a');box(x+.57,y+.802,8,.08,.012,1,'#1a1a1a');box(x+.47,y+.8,5.5,.06,.04,2,'#b8984e');break;
  // sarcofago dipinto
  case 's':box(x+.08,y+.28,0,.84,.44,6,'#d4af37',1.05);box(x+.12,y+.32,6,.76,.36,1.6,'#3a5a9a');box(x+.66,y+.34,7.6,.2,.32,2.4,'#e8c54a');box(x+.08,y+.722,1.5,.84,.012,1,'#3a5a9a');box(x+.08,y+.722,4,.84,.012,.8,'#a83a2a');break;
  // cammello con la gualdrappa
  case 'm':{const s=h>.5?1:-1,cx=x+.5;for(const[lx,ly]of[[-.26,.38],[.18,.38],[-.26,.56],[.18,.56]])box(cx+lx,y+ly,0,.08,.08,9,'#b8905e');box(cx-.3,y+.36,9,.6,.28,6,'#c8a070');
    box(cx-.2,y+.34,13,.4,.32,1.4,'#c0392b');box(cx-.12,y+.38,14.4,.24,.24,3.6,'#b88a5a');box(cx+(s>0?.22:-.34),y+.42,12,.12,.16,8,'#c8a070');box(cx+(s>0?.3:-.52),y+.42,19,.22,.16,4,'#c8a070');box(cx+(s>0?.46:-.5),y+.45,21,.04,.1,1,'#1a1a1a');break}
  // un abitante del villaggio, congelato dal Drago
  case 'q':{box(x+.3,y+.3,0,.4,.4,2,'#9ab8d0');box(x+.38,y+.42,2,.1,.12,9,'#b8d4e8');box(x+.52,y+.42,2,.1,.12,9,'#b8d4e8');box(x+.34,y+.38,11,.32,.22,11,'#c8e0f0');box(x+.4,y+.4,22,.2,.2,6,'#d8ecf8');
    if(h>.5){box(x+.66,y+.44,15,.08,.08,10,'#c8e0f0')}else box(x+.66,y+.44,12,.08,.08,7,'#c8e0f0');box(x+.26,y+.44,12,.08,.08,7,'#c8e0f0');
    const a0=g.globalAlpha;g.globalAlpha=a0*.35;box(x+.2,y+.24,0,.6,.52,30,'#dff4ff',1.2);g.globalAlpha=a0;break}
  // bandierine di preghiera tra due pali
  case 'n':box(x+.08,y+.46,0,.06,.06,22,'#5a3a1a');for(let i=0;i<6;i++){const u=i/5,z=21-u*6-Math.sin(u*3.14)*3;box(x+.12+u*.72,y+.47,z-4,.1,.02,4,['#2a6ad8','#f4f0e0','#c0392b','#3a9a3a','#ffd84a','#2a6ad8'][i])}
    box(x+.86,y+.46,0,.06,.06,16,'#5a3a1a');break;
  // catasta di legna
  case 'w':for(let r=0;r<3;r++)for(let i=0;i<3-r;i++){const px=x+.12+i*.26+r*.13;box(px,y+.3,r*4.5,.24,.5,4.5,i%2?'#7a5a3a':'#6e5034');box(px+.03,y+.802,r*4.5+.6,.18,.012,3.3,'#c8a070')}
    if(th==='peaks')box(x+.14,y+.32,13.5,.5,.46,1.2,'#f4f8fc');break;
  // rastrelliera con le pelli ad asciugare
  case 'x':box(x+.08,y+.45,0,.06,.06,18,'#5a3a1a');box(x+.16,y+.47,6,.28,.03,10,'#a87a4a');box(x+.54,y+.47,8,.3,.03,8,'#8a6a5a');box(x+.06,y+.44,17,.88,.08,1.4,'#5a3a1a');box(x+.86,y+.45,0,.06,.06,18,'#5a3a1a');break;
  // altare: nel bosco la pietra con la runa della luna, sui picchi il piccolo santuario con le candele
  case 'a':if(th==='peaks'){box(x+.1,y+.1,0,.8,.8,4,'#9aa2ac');box(x+.2,y+.2,4,.6,.6,8,'#e8e4dc');box(x+.28,y+.28,12,.44,.44,5,'#d4af37');box(x+.4,y+.4,17,.2,.2,8,'#d4af37');box(x+.36,y+.36,25,.28,.28,1.5,'#c0392b');
      for(const[cx,cy]of[[.12,.8],[.8,.8],[.8,.12]]){box(x+cx,y+cy,4,.06,.06,2.4,'#f4f0e0');box(x+cx+.01,y+cy+.01,6.4,.04,.04,1.2+Math.sin(t*9+cx*7)*.3,'#ffd04a',1.4)}
      nlight(x+.5,y+.5,10,110,'255,200,120',.6);if(SET.ultra)GLOW.push([x+.5,y+.5,8,34,'255,200,120',.2])}
    else{const u=.5+.5*Math.sin(t*2);box(x+.1,y+.2,0,.8,.6,8,'#6e6e68');box(x+.06,y+.16,8,.88,.68,2,'#7e7e78');box(x+.3,y+.802,2.5,.4,.012,3.5,'#7ac0ef',1.1+u*.12);box(x+.38,y+.4,10,.24,.2,.5,'#a8d4f4',1.1+u*.12);
      box(x+.12,y+.66,10,.06,.06,2,'#f4f0e0');box(x+.13,y+.67,12,.04,.04,1.2,'#ffd04a',1.4);box(x+.82,y+.22,10,.06,.06,2,'#f4f0e0');box(x+.83,y+.23,12,.04,.04,1.2,'#ffd04a',1.4);
      nlight(x+.5,y+.5,12,120,'160,210,255',.6+u*.2);if(SET.ultra)GLOW.push([x+.5,y+.5,12,44,'160,210,255',.18+u*.08])}break;
  // menhir con il muschio e una runa
  case 'g':{const hz=18+h*12;box(x+.28,y+.3,0,.44,.4,hz,'#8a8a82',.92+h*.1);box(x+.32,y+.34,hz,.34,.3,2.5,'#9a9a92');box(x+.28,y+.3,0,.2,.4,hz*.4,'#4a7a3a');box(x+.42,y+.705,hz*.5,.16,.012,3,'#9adcff',1.3);break}
  // totem dei goblin: maschere dipinte, teschio con le corna
  case 'e':box(x+.42,y+.42,0,.16,.16,30,'#6b4a2b');box(x+.34,y+.36,8,.32,.3,6,'#a8303a');box(x+.36,y+.662,10,.08,.012,1.4,'#ffd84a');box(x+.56,y+.662,10,.08,.012,1.4,'#ffd84a');
    box(x+.34,y+.36,17,.32,.3,6,'#3a7a3a');box(x+.38,y+.662,19,.24,.012,1,'#e8e0d0');box(x+.38,y+.38,30,.24,.24,4,'#e8e0d0');box(x+.41,y+.622,31.5,.06,.012,1,'#1a1a1a');box(x+.53,y+.622,31.5,.06,.012,1,'#1a1a1a');
    box(x+.28,y+.46,33,.1,.08,3,'#d8d0c0');box(x+.62,y+.46,33,.1,.08,3,'#d8d0c0');box(x+.56,y+.5,24,.2,.03,6,'#c0392b');break;
  // bocca di lava che fuma
  case 'v':{const u=.5+.5*Math.sin(t*3+x);box(x+.12,y+.12,0,.76,.76,5,'#3a3232');box(x+.24,y+.24,5,.52,.52,3,'#2a2424');box(x+.32,y+.32,8,.36,.36,.6,'#ff6a1a',1.2+u*.3);
    nlight(x+.5,y+.5,10,140,'255,110,30',.7+u*.25);if(SET.ultra)GLOW.push([x+.5,y+.5,10,46,'255,110,30',.25+u*.1]);if(SET.part&&Math.random()<.05)sparks(x+.5,y+.5,1,['#ff8a2a','#ffd04a','#5a5450'],34);break}
  // cartello del bivio con le frecce
  case 'i':box(x+.45,y+.45,0,.1,.1,26,'#6b4a2b');box(x+.1,y+.44,20,.7,.1,3.2,'#a87a4a');box(x+.06,y+.45,20.4,.06,.08,2.4,'#c0392b');box(x+.4,y+.2,15,.1,.62,3,'#9a6a3a');box(x+.42,y+.8,15.4,.06,.06,2.2,'#2a6ad8');
    box(x+.25,y+.45,10,.62,.1,3,'#8a5a32');box(x+.85,y+.46,10.4,.06,.08,2.2,'#3a9a3a');box(x+.43,y+.43,26,.14,.14,1.2,'#5a3a1a');break;
  // cumulo di sabbia
  case 'd':box(x+.05,y+.08,0,.9,.84,4+h*3,'#d9b56b');box(x+.2,y+.2,4+h*3,.6,.5,2,'#e2c27c');box(x+.1,y+.5,4+h*3,.7,.04,.4,'#c8a060');if(h>.7)box(x+.6,y+.25,6+h*3,.05,.05,5,'#6a8a3a');break;
  // canne e tife sulla riva
  case 'y':for(let i=0;i<5;i++){const q=hh(x*5+i,y*3+i),px=x+.15+q*.6,py=y+.12+i*.15;box(px,py,0,.04,.04,10+q*8,'#5a8a3a');if(i%2)box(px-.01,py-.01,8+q*8,.06,.06,3,'#6a4a2a')}break;
  // sui picchi il pozzo gelato; nel deserto le anfore dell'acqua
  case 'z':if(th==='peaks'){box(x+.1,y+.1,0,.8,.8,8,'#8a96a4');box(x+.2,y+.2,7.6,.6,.6,.6,'#cfe8f8',1.2);box(x+.12,y+.45,8,.06,.06,14,'#5a4a3a');box(x+.82,y+.45,8,.06,.06,14,'#5a4a3a');
      box(x+.05,y+.25,22,.9,.5,2.5,'#7a5a3a');box(x+.05,y+.25,24.5,.9,.5,1.2,'#f4f8fc');for(let i=0;i<4;i++)box(x+.1+i*.25,y+.74,18.5-(i%2),.03,.03,3.5+(i%2),'#cfeaf8',1.2)}
    else{box(x+.15,y+.2,0,.3,.3,10,'#b86a3a');box(x+.2,y+.25,10,.2,.2,3,'#a85a2a');box(x+.52,y+.45,0,.34,.34,8,'#c87a4a');box(x+.6,y+.53,8,.18,.18,2,'#a85a2a');box(x+.52,y+.6,4,.34,.012,1,'#e8d8b0')}break;
  // slitta carica
  case 'j':box(x+.08,y+.3,0,.86,.05,2,'#5a4a3a');box(x+.08,y+.65,0,.86,.05,2,'#5a4a3a');box(x+.88,y+.3,0,.06,.4,5,'#5a4a3a');box(x+.1,y+.3,2,.8,.4,1.4,'#8a6a42');
    box(x+.2,y+.34,3.4,.4,.32,4,'#7a3a2a');box(x+.6,y+.36,3.4,.24,.28,3,'#5a6a7a');box(x+.2,y+.34,7.4,.4,.32,1,'#f4f8fc');break;
  // casse e sacchi (nel deserto) o blocchi di ghiaccio (sui picchi)
  case 'b':if(th==='peaks'){box(x+.1,y+.12,0,.5,.5,7,'#bfe3f5',1.15);box(x+.2,y+.22,7,.3,.3,4,'#dff4ff',1.25);box(x+.5,y+.45,0,.4,.4,5,'#cfeaf8',1.2)}
    else{box(x+.08,y+.1,0,.46,.46,7,'#a07a4a');box(x+.08,y+.562,1,.46,.012,5,'#7a5a3a');box(x+.13,y+.15,7,.36,.36,5,'#b08a5a');box(x+.58,y+.5,0,.32,.36,5,'#d8c8a0');box(x+.62,y+.54,5,.24,.28,1.5,'#c8b890')}break;
  // il tesoro del Drago
  case '$':box(x+.1,y+.15,0,.8,.7,3,'#d4af37',1.1);box(x+.2,y+.25,3,.55,.5,2.5,'#e8c54a',1.15);box(x+.32,y+.35,5.5,.3,.28,2,'#f0d060',1.2);box(x+.62,y+.3,3,.12,.12,4,'#d4af37');
    box(x+.2,y+.852,1,.08,.012,1.2,'#e83a5a',1.3);box(x+.6,y+.852,1.5,.08,.012,1.2,'#3a8ae8',1.3);box(x+.4,y+.3,7.5,.08,.08,1.2,'#5ae86a',1.3);if(SET.ultra)GLOW.push([x+.5,y+.5,4,30,'255,210,90',.2]);break;
  default:return false}return true}

/* ---- capanne, tende e case (gli edifici dei biomi) ---- */
const BST={
  // baita di tronchi: zoccolo di pietra, tronchi alternati, finestre con gli scuri, tetto a due falde (con la neve sui picchi)
  baita(x,y,h,b){const fy=y===b.y+b.h-1,fx=x===b.x+b.w-1,ht=b.ht,sn=ZZ.th==='peaks',L=['#7a5a3a','#6a4c30'];box(x,y,0,1,1,3,'#6a6a64');
    for(let z=3,i=0;z<ht;z+=4,i++)box(x,y,z,1,1,Math.min(4,ht-z),L[(i+x+y)&1],.92+h*.1);
    if(fy&&(x===b.x||fx))for(let z=4;z<ht;z+=4)box(x+(x===b.x?-.08:.86),y+.86,z,.22,.22,3.4,'#a07a50');
    if(fy&&x===b.dx){box(x+.2,y+.97,3,.6,.06,ht*.62,'#4a2a14');box(x+.24,y+1.0,3.5,.52,.02,ht*.6-1,'#5a3a1e');box(x+.68,y+1.02,ht*.32,.06,.02,1.2,'#d4af37');
      if(!sn){box(x+.3,y+1.0,ht*.78,.4,.03,1,'#e8e0d0');box(x+.26,y+1.0,ht*.78,.04,.03,3,'#e8e0d0');box(x+.7,y+1.0,ht*.78,.04,.03,3,'#e8e0d0')}}
    else if(fy&&h>.25){box(x+.28,y+.97,ht*.38,.44,.06,ht*.3,'#3a2a1a');box(x+.32,y+.99,ht*.38+1,.36,.04,ht*.3-2,winC(x,y));box(x+.14,y+.99,ht*.38,.12,.04,ht*.3,'#5a7a4a');box(x+.74,y+.99,ht*.38,.12,.04,ht*.3,'#5a7a4a');
      if(NK>.02&&winC0(x,y)==='#ffd27a')nlight(x+.5,y+1.1,ht*.5,64,'255,200,120',.42,1)}
    if(fx&&!fy&&h>.3){box(x+.97,y+.3,ht*.38,.06,.4,ht*.3,'#3a2a1a');box(x+.99,y+.34,ht*.38+1,.04,.32,ht*.3-2,winC(x,y))}
    const ey=Math.min(y-b.y,b.y+b.h-1-y),rz=ey*8+5;box(x-.06,y-.06,ht,1.12,1.12,rz,b.roof,.95+((y&1)?.05:0));if(sn)box(x-.06,y-.06,ht+rz,1.12,1.12,1.6,'#f4f8fc');
    if(sn&&fy)for(let i=0;i<4;i++)box(x+.08+i*.25,y+1.04,ht-3-(i%2)*2,.04,.04,3+(i%2)*2,'#cfeaf8',1.2);
    if(b.smoke&&x===b.x+1&&y===b.y+1){box(x+.25,y+.25,ht+rz,.4,.4,12,'#6a6a64');smokeFx(x,y,ht+rz+12)}},
  // la tenda del mercante: tela a righe, tetto a cono con il bordo d'oro, il palo con la bandiera, l'ingresso con i lembi legati
  tenda(x,y,h,b){const fy=y===b.y+b.h-1,ht=b.ht,e=Math.min(x-b.x,b.x+b.w-1-x,y-b.y,b.y+b.h-1-y),st=(x%2)?'#c0392b':'#f0e8d8';box(x,y,0,1,1,ht,st,.92+h*.08);
    if(fy&&x===b.dx){box(x+.15,y+.97,0,.7,.06,ht*.75,'#3a1a10');box(x+.06,y+.98,0,.14,.06,ht*.75,'#d8c8b0');box(x+.8,y+.98,0,.14,.06,ht*.75,'#d8c8b0');box(x+.15,y+.98,ht*.75,.7,.06,1.2,'#d4af37')}
    if(e===0)box(x-.08,y-.08,ht-1,1.16,1.16,1.4,'#d4af37');box(x-.05,y-.05,ht,1.1,1.1,e*9+5,e%2?'#f0e8d8':'#c0392b',.98);
    if(x===b.x+(b.w>>1)&&y===b.y+(b.h>>1)){const z=ht+e*9+5;box(x+.45,y+.45,z,.1,.1,12,'#5a3a1a');box(x+.55,y+.48,z+8,.32,.04,3.5,'#2a6ad8');box(x+.42,y+.42,z+12,.16,.16,1.6,'#d4af37')}},
  // casa gelata: muri coperti di brina, finestre ghiacciate, porta sbarrata, tetto di neve con i ghiaccioli
  gelo(x,y,h,b){const fy=y===b.y+b.h-1,fx=x===b.x+b.w-1,ht=b.ht,e=Math.min(x-b.x,b.x+b.w-1-x,y-b.y,b.y+b.h-1-y);box(x,y,0,1,1,ht,b.wall,.9+h*.1);
    if(fy){if(h>.45)box(x+.1,y+.97,ht*.2,.3,.05,ht*.5,'#dff4ff',1.15);if(x===b.x+1){box(x+.25,y+.97,0,.5,.06,ht*.6,'#5a4a3a');box(x+.2,y+1.0,ht*.2,.6,.03,1.4,'#8a6a42');box(x+.2,y+1.0,ht*.42,.6,.03,1.4,'#8a6a42')}
      else if(h>.3){box(x+.3,y+.97,ht*.4,.4,.06,ht*.3,'#5a6a7a');box(x+.34,y+.99,ht*.4+1,.32,.04,ht*.3-2,'#cfe8f8',1.15)}}
    if(fx&&!fy&&h>.4){box(x+.97,y+.3,ht*.4,.06,.4,ht*.3,'#5a6a7a');box(x+.99,y+.34,ht*.4+1,.04,.32,ht*.3-2,'#cfe8f8',1.15)}
    const ey=Math.min(y-b.y,b.y+b.h-1-y);box(x-.06,y-.06,ht,1.12,1.12,ey*10+7,b.roof,.96+(ey%2)*.04);if(ey===((b.h-1)>>1))box(x-.06,y+.3,ht+ey*10+7,1.12,.4,1.4,'#ffffff');if(fy)for(let i=0;i<4;i++)box(x+.08+i*.25,y+1.04,ht-3-(i%2)*2.5,.04,.04,3+(i%2)*2.5,'#cfeaf8',1.2);
    if(fx&&!fy)for(let i=0;i<3;i++)box(x+1.04,y+.15+i*.3,ht-3-(i%2)*2,.04,.04,3+(i%2)*2,'#cfeaf8',1.2);
    if(b.smoke===2&&x===b.x+b.w-2&&y===b.y){box(x+.3,y+.3,ht+7,.36,.36,14,'#8a96a4');box(x+.28,y+.28,ht+21,.4,.4,1.4,'#ffffff')}}};
const _bld712c=bld;bld=function(x,y,h){const b=TB[BM[y][x]];if(b&&BST[b.st]&&isBio(ZZ)){BST[b.st](x,y,h,b);return}_bld712c(x,y,h)};

/* ---- gli interni: la capanna del cacciatore, la tenda del mercante, il rifugio degli esploratori ---- */
const INB={
  in_capanna:{n:'Capanna del cacciatore',out:'forest',fl:'#8a6a42',fl2:'#82643e',wall:'#a07a50',np:[['cacciatore',5,5]],lay:[
    '#########','#F.ww.SB#','#......B#','#.TT....#','#.TT..k.#','#.......#','#b..==.c#','#...==..#','####D####']},
  in_tenda:{n:'Tenda del mercante',out:'desert',fl:'#c8a070',fl2:'#c09868',wall:'#c0392b',np:[['amir',4,2]],lay:[
    '#########','#SS.C.kk#','#.......#','#.====..#','#.====.b#','#.====..#','#p.....p#','#b.....c#','####D####']},
  in_rifugio:{n:'Rifugio degli esploratori',out:'peaks',fl:'#7a6a5a',fl2:'#726454',wall:'#9a8a7a',np:[['ilva',5,4]],lay:[
    '#########','#BB.F.SS#','#.......#','#.TT..w.#','#.TT....#','#......k#','#b..=..c#','#...=...#','####D####']}};
for(const k in INB)Z[k]=Object.assign({lv:0,N:INB[k].lay.length,bg:'#141820',mus:'inter',int:1},INB[k]);
Object.assign(NPCS,{
  cacciatore:{n:'Cacciatore Ulrico',role:'buyer',buy:'res',c:'#5a4a2a',hat:'#3a5a2a',qs:['bio1','bio2'],ln:['Vivo nel bosco da trent\'anni. Gli alberi parlano, se sai ascoltare.','L\'Erba Lunare cresce solo nel cerchio di pietre, a nord-est. Brilla anche di giorno.','Il Troll dorme sotto la Grande Quercia. Quando si sveglia, tremano i funghi.','Ti compro i raccolti: erbe, legna, quello che porti. Pago il giusto.']},
  amir:{n:'Mercante Amir',role:'buyer',buy:'res',c:'#c0392b',hat:'#f0e8d8',qs:['bio3','bio4'],ln:['Benvenuto nella mia tenda, amico! Acqua fresca e affari onesti.','Gli scarabei dorati vivono tra le rovine della città sepolta. Valgono il loro peso in monete.','La Sfinge guarda la porta della Piramide da mille anni. Non le chiedere indovinelli.','Compro tutto quello che raccogli: la sabbia non mi spaventa, i prezzi bassi sì.']},
  ilva:{n:'Esploratrice Ilva',role:'heal',c:'#3a6a8a',hat:'#c0392b',qs:['bio5','bio6'],ln:['Siediti vicino al fuoco: ti rimetto in sesto, poi torni là fuori.','Il villaggio a sud è stato congelato dal Drago di Brina. Gli abitanti sono ancora lì, dentro il ghiaccio.','I Fiori di ghiaccio sbocciano solo dove il freddo non si scioglie mai.','Dalle grotte di cristallo esce una luce azzurra. Dalla Fucina, invece, esce solo fumo.']}});
Object.assign(NPS,{cacciatore:'c|short:#5a3a1a|full:#5a3a1a|feather:#3a5a2a:#c0392b|vest:#5a4a2a,pouch|spear|idle|big',amir:'d|short:#1a1a1a|full:#1a1a1a|turban|vest:#c0392b,necklace,belly|coinbag|count|fat',
  ilva:'b|tail:#d8b050|none|headband:#c0392b|cape:#3a6a8a,scarf:#c0392b|lantern|idle|f'});
Object.assign(QT,{
  bio1:{t:'gat',r:'lunare',n:6,ti:'L\'Erba Lunare',tx:'Mi serve dell\'Erba Lunare per i miei unguenti: cresce solo nel cerchio di pietre a nord-est, intorno all\'altare. Portamene 6 mazzetti.',g:120,x:90},
  bio2:{t:'kill',e:['slime'],n:12,ti:'Le trappole rovinate',tx:'Gli slime della foresta si infilano nelle mie trappole e le sciolgono. Eliminane 12 e potrò tornare a cacciare.',g:90,x:70},
  bio3:{t:'gat',r:'scarab',n:6,lv:4,ti:'Scarabei d\'oro',tx:'Tra le colonne della città sepolta, a sud, brillano gli scarabei dorati. I collezionisti di Aldoria li pagano bene: portamene 6.',g:200,x:150},
  bio4:{t:'kill',e:['mummia'],n:8,lv:5,ti:'Le bende della necropoli',tx:'Le mummie escono dalla necropoli e assaltano la carovana. Fermane 8 e i miei cammelli dormiranno tranquilli.',g:240,x:180},
  bio5:{t:'gat',r:'ghiaccio',n:6,lv:7,ti:'Fiori di ghiaccio',tx:'I Fiori di ghiaccio crescono intorno al rifugio e nel villaggio congelato. Con 6 fiori preparo un infuso contro il gelo del Drago.',g:300,x:220},
  bio6:{t:'kill',e:['yeti'],n:6,lv:8,ti:'Gli yeti del passo',tx:'Gli yeti hanno preso il sentiero di montagna e nessuno sale più al rifugio. Abbattine 6.',g:340,x:260}});
// la guida delle zone racconta i luoghi nuovi
(function(){const S={forest:{tx:'La Foresta di Elmwood: boschi di querce, pini e betulle, radure, un lago con il ruscello e tanti luoghi da scoprire.',f:['La radura delle lucciole e il cerchio di pietre con l\'Erba Lunare','La capanna del Cacciatore Ulrico, che compra i raccolti','L\'accampamento dei goblin davanti alla Tana','La Grande Quercia, covo del Troll','La torre di guardia in rovina, il lago e il cerchio delle fate']},
  desert:{tx:'Il Deserto di Khem: dune, rupi di arenaria, un\'oasi e le rovine di un regno antico.',f:['L\'oasi con la tenda del Mercante Amir, che compra i raccolti','La Piramide di Khem con la Sfinge','La città sepolta, con gli Scarabei dorati','La necropoli del Faraone e le ossa della bestia gigante','L\'accampamento della carovana']},
  peaks:{tx:'I Picchi Gelidi: pareti di roccia, abeti carichi di neve e un lago ghiacciato.',f:['Il rifugio dell\'Esploratrice Ilva, che cura gratis','Il villaggio congelato dal Drago, con i Fiori di ghiaccio','Le Caverne di Cristallo e la bocca della Fucina Infernale','Il santuario con le bandierine','Il covo del Drago di Brina, con il suo tesoro']}};
  for(const z of ZB)if(S[z.k])Object.assign(z,S[z.k])})();

/* ---- la mappa della zona (tasto M) con i colori giusti di alberi, rocce, strutture e terreni ---- */
const BMW={forest:{O:['#2f6b2a',.44],P:['#24553a',.4],B:['#6aa848',.36],U:['#3a7a30',.3],R:['#7a7a72',.34],E:['#1f5a22',0,1],Z:['#1f4a22',0,1],W:['#8a8a80',0,1],K:['#7a5a3a',0,1]},
  desert:{M:['#c4935a',0,1],Q:['#4e9a47',.3],J:['#5aa84e',.26],V:['#7a6a5a',.26],X:['#3a8a3a',.42],Y:['#c9a860',0,1],S:['#d8b878',0,1],W:['#c8a46a',0,1]},
  peaks:{N:['#7a8696',0,1],F:['#2a5446',.4],K:['#8a949e',.36],G:['#9adcff',.36],Y:['#8aa8c0',.3],W:['#8a96a4',0,1]}};
function bMapWall(th,ch){const q=bCode(ch,th);return q&&q[0]&&BMW[th]?BMW[th][q[0]]||null:null}
function bMapFloor(th,ch){const q=bCode(ch,th),P2=q&&q[2]&&BFL[th]&&BFL[th][q[2]];return P2?P2[0]:null}
// la minimappa in alto a destra: alberi verdi, rocce, sabbia e neve al posto del grigio
const _buildFC712=buildFC;buildFC=function(){_buildFC712();if(!isBio(ZZ)||!MC)return;const q=MC.getContext('2d'),s=130/N,th=ZZ.th;
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const m=M[y][x],ch=DEC[y][x];if(m!==1&&m!==0)continue;let col=null;
    if(m===1){const w=bMapWall(th,ch);col=w?w[0]:null}else col=bMapFloor(th,ch);if(!col)continue;q.fillStyle=col;q.fillRect(x*s,y*s,s+.3,s+.3)}};
// il disegno veloce: le caselle di solo terreno (sentieri, prati, lastricati...) sono già nel pavimento, non serve esaminarle
const _fClass712=fClass;fClass=function(i){const x=i%N,y=i/N|0,d=DEC[y][x];if(M[y][x]===0&&d&&d[0]===DN&&d[1]>='0'&&d[1]<='9'){FAST.sn[i]=fSnap(x,y);FAST.spr[i]=null;FAST.li[i]=null;return FAST.st[i]=1}return _fClass712(i)};
