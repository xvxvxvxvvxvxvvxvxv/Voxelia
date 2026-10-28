/* ================= 7.43: i boss a fasi, con il punto debole =================
   Ogni boss combatte in tre fasi: a due terzi e a un terzo della vita ruggisce (per un attimo è immune), cambia mosse e
   attacca più spesso. Ogni tanto scopre il suo punto debole (un nucleo luminoso sopra la testa): i colpi in quel momento
   fanno il doppio, e quattro colpi a segno lo stordiscono per tre secondi (fermo, senza attacchi, e i colpi fanno di più). */
const B43={ph2:['rain','charge'],ph3:['nova','charge','rain'],gap:[1,.85,.68],seen:0};
const b43Ph=e=>e.hp>e.mx*.66?1:e.hp>e.mx*.33?2:3;
const b43Open=e=>!!(e.wkO&&t<e.wkO);
const b43Stun=e=>!!(e.stn&&t<e.stn);
function b43Tick(dt){for(const e of ents){if(e.k!=='en'||!e.boss||e.pup||e.hp<=0)continue;if(!e.al){e.wkN=null;continue}
    const ph=b43Ph(e);if(e.ph==null)e.ph=1;
    if(ph>e.ph){e.ph=ph;e.shd=t+1.4;e.bab=Math.max(e.bab||0,1.6);e.wkO=0;e.stn=0;e.stg=0;flt(e,'FASE '+ph+'!','#ff6a4a');tone(70,.6,'sawtooth',.08);shake(.9);
      if(cineOK()){ringFx(e.px,e.py,'255,90,60',.9,3.2);sparks(e.px,e.py,26,['#ff6a4a','#ffd84a'],90)}
      msg(e.n+(ph===2?' cambia modo di combattere!':' è allo stremo: attacca senza sosta!'));
      // in terza fase richiama rinforzi della sua tana, se ne ha
      if(ph===3&&e.b.sum&&ents.filter(x=>x.k==='en').length<16)for(let i=0;i<2;i++){const a=i*3.14+t,[x,y]=nearFree(clamp(Math.floor(e.px+Math.cos(a)*2),1,N-2),clamp(Math.floor(e.py+Math.sin(a)*2),1,N-2));if(WK(M[y][x])){const m=mk(e.b.sum,x,y);m.al=1;ents.push(m)}}}
    // il punto debole: si apre ogni 8-10 secondi per 3 secondi (mai durante lo stordimento o il ruggito)
    if(e.wkN==null)e.wkN=t+4;
    if(!b43Open(e)&&!b43Stun(e)&&t>=e.wkN&&!(e.shd>t)){e.wkO=t+3;e.wkN=t+3+8+Math.random()*2;e.stg=0;flt(e,'Punto debole!','#7affea');tone(880,.12,'triangle',.05);
      if(!B43.seen){B43.seen=1;msg('Il nucleo luminoso sopra '+e.n+' è il suo punto debole: colpiscilo finché brilla!')}}
    if(b43Stun(e)){e.ch=null;e.cdt=Math.max(e.cdt,.4);e.bab=Math.max(e.bab||0,.4);e.path=[]}}}
// i colpi: doppi sul punto debole, una volta e mezzo sul boss stordito; quattro colpi sul nucleo lo stordiscono
const _hurtE743=hurtE;hurtE=function(e,d,rem,cr){if(e&&e.boss&&!e.pup&&!(e.shd&&e.shd>t)){if(b43Open(e)){d=Math.round(d*2);e.stg=(e.stg||0)+1;
      if(e.stg>=4){e.wkO=0;e.stn=t+3;e.stg=0;flt(e,'STORDITO!','#ffd84a');tone(200,.4,'square',.06);shake(.6);if(cineOK())sparks(e.px,e.py,20,['#ffd84a','#ffffff'],70)}}
    else if(b43Stun(e))d=Math.round(d*1.5)}_hurtE743(e,d,rem,cr)};
// nuove mosse nelle fasi 2 e 3, e più fretta fra una mossa e l'altra
const _bossAI743=bossAI;bossAI=function(dt){b43Tick(dt);const saved=[];
  for(const e of ents){if(e.k!=='en'||!e.boss||e.pup||!e.ph||e.ph<2||saved.some(s=>s[0]===e.t))continue;const L=BAB[e.t]||['nova','slam2'];saved.push([e.t,BAB[e.t]]);BAB[e.t]=L.concat(e.ph===2?B43.ph2:B43.ph3)}
  try{_bossAI743(dt)}finally{for(const[k,v]of saved){if(v===undefined)delete BAB[k];else BAB[k]=v}}};
const _bossGap743=bossGap;bossGap=function(e){return _bossGap743(e)*(B43.gap[(e.ph||1)-1]||1)};
// lo stordito sta fermo: si rimette dov'era dopo il turno dei nemici
const _upd743b=upd;upd=function(dt){const st=[];for(const e of ents)if(e.k==='en'&&e.boss&&b43Stun(e))st.push([e,e.px,e.py]);_upd743b(dt);for(const[e,x,y]of st){e.px=x;e.py=y}};
// il nucleo luminoso e le stelline dello stordimento, sopra la testa del boss (anche nella vista 3D)
const _ent743b=ent;ent=function(e){_ent743b(e);if(e.k!=='en'||!e.boss)return;const top=(e.m&&e.m.top?e.m.top:70)+12;
  if(b43Open(e)){const k=(e.wkO-t)/3,p=1+Math.sin(t*14)*.12,s=.22*p;box(e.px-s/2,e.py-s/2,top+Math.sin(t*5)*2,s,s,10*p,'#7affea',1.6);box(e.px-.05,e.py-.05,top-6,.1,.1,6,'#bffff4',1.4);
    if(typeof nlight==='function')nlight(e.px,e.py,top,90,'120,255,230',.7*Math.min(1,k*3))}
  if(b43Stun(e))for(let i=0;i<3;i++){const a=t*4+i*2.09,x=e.px+Math.cos(a)*.45,y=e.py+Math.sin(a)*.45;box(x-.05,y-.05,top-4,.1,.1,4,'#ffd84a',1.4)}};
