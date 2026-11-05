/* ================= 7.17: LE SCHERMATE DI CARICAMENTO =================
   Ogni modalità ha la sua schermata di caricamento, dipinta e animata dal vivo (nessuna immagine):
   📜 Storia: il castello di Aldoria di notte, la luna, le nebbie e i sei frammenti della Corona che gli girano intorno e si riuniscono.
   🌅 Tomorrow: l'alba su colline senza fine, un viandante che cammina sul crinale, il sole che sorge, nuvole e stormi.
   🌀 Dimension: un vortice del tempo, numeri d'orologio che girano e la cabina blu che ci precipita dentro.
   🎡 Studio: un progetto su carta blu e una casetta che si costruisce cubo dopo cubo.
   🌐 Mondi: un pianeta con le isole volanti dei mondi della community che gli girano intorno.
   💎 Viaggio con la gemma: il volo sulla mappa del mondo dalla regione di partenza alla città della gemma.
   Il gioco resta fermo sotto la schermata. Si salta toccando o premendo un tasto. Con le cinematiche spente non compare. */
const LDS={on:0,hold:0,k:'',t:0,dur:3.6,data:null,fn:null,fnAt:.5,fnDone:1,raf:0,lt:0,st:null,out:0};
const LDSK={
  storia:{ic:'📜',ti:'Il Regno Perduto',sub:'Modalità Storia',ac:'#f5b942',
    steps:['Si accendono le torce di Aldoria','I sei frammenti della Corona si cercano','I dungeon si risvegliano','Il regno ti aspetta'],
    tips:['J apre le missioni: le colonne di luce indicano dove andare.','Una parata al momento giusto assorbe gran parte del colpo.','I dungeon rinascono a ogni vittoria, e ogni volta sono più forti.','Nel Colosseo puoi sfidare gli altri eroi.','Il maestro Dino, alla caserma, insegna le tecniche di combattimento.']},
  tomorrow:{ic:'🌅',ti:'Tomorrow',sub:'Il mondo aperto senza fine',ac:'#ffb46a',
    steps:['Si disegnano le regioni','Le città aprono le porte','Le bacheche si riempiono di contratti','Sorge il sole su un nuovo giorno'],
    tips:['T: accamparsi. Il campo ripristina la salute e tiene lontani i nemici.','In alcune città il Custode delle Gemme vende la gemma del teletrasporto per tornarci (G).','M apre la mappa: clicca una regione e impostala come destinazione.','Ogni oggetto unico ha il suo seme: nessun altro eroe ne avrà uno uguale.','I santuari lungo le strade curano una volta al giorno.','Le città possono essere assediate: difendile insieme alle guardie.']},
  dim:{ic:'🌀',ti:'Voxelia Dimension',sub:'Il viaggio nel tempo',ac:'#7ab8ff',
    steps:['La cabina si scuote','Le lancette impazziscono','Si apre il vortice delle epoche','Atterraggio fra… adesso'],
    tips:['La cabina blu ti porta fra le epoche: Far West, Londra vittoriana, Rivoluzione e Grande Guerra.','Le scelte difficili cambiano il finale.','Il viaggio si salva a parte e non tocca la partita della Storia.']},
  studio:{ic:'🎡',ti:'Voxelia Studio',sub:'Il Parco giochi',ac:'#8ad8ff',
    steps:['Si stende il progetto','Si posano le fondamenta','Si alzano i muri','Si mette il tetto'],
    tips:['Dialoghi a scelte, missioni, armi, musiche e cinematiche: tutto si crea qui.','Esporta il mondo in un file per non perderlo.','Pubblica il tuo mondo nei Mondi della community.']},
  mondi:{ic:'🌐',ti:'Mondi della community',sub:'I mondi degli altri giocatori',ac:'#b89aff',
    steps:['Si contattano le isole','Si raccolgono le stelle','Si apre il portale','Benvenuto nel mondo'],
    tips:['Dai le stelle ai mondi che ti sono piaciuti.','I mondi più giocati del momento finiscono in evidenza.','Ogni mondo della community ha un salvataggio tutto suo.']},
  viaggio:{ic:'💎',ti:'Viaggio con la gemma',sub:'',ac:'#c8a0ff',
    steps:['La gemma si accende','Si apre la via di luce','Il mondo scorre sotto di te','Atterraggio'],
    tips:['La gemma si consuma all\'uso: puoi ricomprarla dal Custode delle Gemme della città.','Prima di partire, un campo ripristina la salute (T).']}};
const ldsR=s=>()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296};
function ldsPlay(k,data,fn,o){o=o||{};if(!cineOK()||!LDSK[k]){if(fn)fn();return}
  if(LDS.on)ldsEnd(1);let el=$('lds');
  if(!el){el=document.createElement('div');el.id='lds';el.innerHTML='<canvas></canvas><div class="ldsv"></div><div class="ldsui"><div class="ldsic"></div><h1></h1><h2></h2><div class="ldsbar"><i></i><b></b></div><p class="ldsst"></p><p class="ldstip"></p></div><small class="ldssk">Tocca o premi un tasto per entrare</small>';document.body.appendChild(el);
    el.addEventListener('pointerdown',e=>{e.preventDefault();ldsSkip()})}
  const K=LDSK[k],d=data||{};Object.assign(LDS,{on:1,hold:o.hold!==false,k,data:d,fn:fn||null,fnDone:!fn,fnAt:o.fnAt||.5,t:0,dur:o.dur||(k==='viaggio'?4.4:3.8),lt:0,out:0,tip:Math.floor(Math.random()*K.tips.length),tipT:0});
  LDS.st=ldsSetup(k,d);
  el.className='on k-'+k;el.style.setProperty('--ac',K.ac);el.querySelector('.ldsic').textContent=K.ic;el.querySelector('h1').textContent=d.ti||K.ti;el.querySelector('h2').textContent=d.sub||(k==='viaggio'&&d.name?'Verso '+d.name:K.sub);
  el.querySelector('.ldstip').textContent='💡 '+K.tips[LDS.tip];el.querySelector('.ldsst').textContent=K.steps[0];
  for(const a of el.querySelectorAll('h1,h2,.ldsic,.ldsbar,.ldstip')){a.style.animation='none';void a.offsetWidth;a.style.animation=''}
  if(LDS.hold&&o.sync&&fn){try{fn()}catch(e){console.error(e)}LDS.fnDone=1}
  ldsSize();cancelAnimationFrame(LDS.raf);LDS.raf=requestAnimationFrame(ldsLoop)}
function ldsSize(){const el=$('lds');if(!el)return;const c=el.querySelector('canvas'),dp=Math.min(devicePixelRatio||1,1.5),w=Math.round(innerWidth*dp),h=Math.round(innerHeight*dp);if(c.width!==w||c.height!==h){c.width=w;c.height=h}}
function ldsSkip(){if(!LDS.on||LDS.out)return;if(LDS.t<.9)return;if(!LDS.fnDone){LDS.t=Math.max(LDS.t,LDS.dur*LDS.fnAt);return}LDS.t=Math.max(LDS.t,LDS.dur-.35)}
function ldsEnd(now){const el=$('lds');LDS.hold=0;if(LDS.fn&&!LDS.fnDone){LDS.fnDone=1;try{LDS.fn()}catch(e){console.error(e)}}
  if(now||!el){LDS.on=0;LDS.out=0;cancelAnimationFrame(LDS.raf);if(el)el.className='';return}
  LDS.out=1;el.classList.add('out');setTimeout(()=>{if(!LDS.out)return;LDS.on=0;LDS.out=0;cancelAnimationFrame(LDS.raf);el.className=''},750)}
function ldsLoop(n){if(!LDS.on)return;LDS.raf=requestAnimationFrame(ldsLoop);const dt=LDS.lt?Math.min(.25,(n-LDS.lt)/1000):0;LDS.lt=n;LDS.t+=dt;
  const el=$('lds'),K=LDSK[LDS.k];if(!el)return;ldsSize();
  if(!LDS.fnDone&&LDS.t>=LDS.dur*LDS.fnAt){LDS.fnDone=1;try{LDS.fn()}catch(e){console.error(e)}}
  const p=Math.min(1,LDS.t/LDS.dur),pe=1-Math.pow(1-p,2.2);
  el.querySelector('.ldsbar i').style.width=(pe*100).toFixed(1)+'%';el.querySelector('.ldsbar b').textContent=Math.round(pe*100)+'%';
  const si=Math.min(K.steps.length-1,Math.floor(p*K.steps.length)),ss=el.querySelector('.ldsst');if(ss.dataset.i!==String(si)){ss.dataset.i=si;ss.textContent=K.steps[si]+'…';ss.style.animation='none';void ss.offsetWidth;ss.style.animation=''}
  if((LDS.tipT+=dt)>3.4&&K.tips.length>1){LDS.tipT=0;LDS.tip=(LDS.tip+1)%K.tips.length;const tp=el.querySelector('.ldstip');tp.textContent='💡 '+K.tips[LDS.tip];tp.style.animation='none';void tp.offsetWidth;tp.style.animation=''}
  el.classList.toggle('sk',LDS.t>.9&&!LDS.out);
  const c=el.querySelector('canvas'),q=c.getContext('2d');try{q.save();LDSD[LDS.k](q,c.width,c.height,LDS.t,p,LDS.st,LDS.data);q.restore();ldsFrame(q,c.width,c.height,LDS.t,p)}catch(e){q.restore();console.error(e)}
  if(!LDS.out&&LDS.t>=LDS.dur)ldsEnd()}
// la cornice comune: vignetta, bande del film, grana
function ldsFrame(q,w,h,T,p){const v=q.createRadialGradient(w/2,h/2,Math.min(w,h)*.3,w/2,h/2,Math.max(w,h)*.75);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.62)');q.fillStyle=v;q.fillRect(0,0,w,h);
  const gb=q.createLinearGradient(0,h*.55,0,h);gb.addColorStop(0,'rgba(0,0,0,0)');gb.addColorStop(1,'rgba(0,0,0,.62)');q.fillStyle=gb;q.fillRect(0,h*.55,w,h*.45);
  const bh=h*.07;q.fillStyle='#000';q.fillRect(0,0,w,bh);q.fillRect(0,h-bh,w,bh);
  q.fillStyle='rgba(255,255,255,.035)';for(let i=0;i<70;i++){const x=Math.random()*w,y=Math.random()*h;q.fillRect(x,y,1.5,1.5)}
  if(T<.6){q.fillStyle=`rgba(0,0,0,${1-T/.6})`;q.fillRect(0,0,w,h)}}
// i dati fissi di ogni scena (stelle, nuvole, cubi…) si preparano una volta
function ldsSetup(k,d){const r=ldsR((Math.random()*1e9)|0),S={};
  S.stars=Array.from({length:220},()=>({x:r(),y:r(),s:.4+r()*1.6,f:r()*6}));
  if(k==='storia'){S.bats=Array.from({length:6},()=>({y:.15+r()*.3,v:.04+r()*.05,o:r(),s:.6+r()*.6}));S.fog=Array.from({length:7},()=>({y:.62+r()*.25,x:r(),v:.006+r()*.012,s:.25+r()*.3}))}
  if(k==='tomorrow'){S.cl=Array.from({length:9},()=>({x:r(),y:.08+r()*.3,s:.5+r()*.9,v:.004+r()*.01}));S.bd=Array.from({length:9},()=>({x:r()*.4-.1,y:.15+r()*.25,o:r()*6,s:.6+r()*.7}));S.tr=Array.from({length:4},(_,i)=>Array.from({length:40},()=>r()))}
  if(k==='studio'){const B=[],add=(x,y,z,c)=>B.push({x,y,z,c});for(let x=0;x<6;x++)for(let y=0;y<5;y++)add(x,y,0,'#9a8a6a');
    for(let z=1;z<=3;z++)for(let x=0;x<6;x++)for(let y=0;y<5;y++){if(x>0&&x<5&&y>0&&y<4)continue;if(y===4&&x===2&&z<3)continue;if((x===0||x===5)&&y===2&&z===2)continue;if(y===4&&x===4&&z===2)continue;add(x,y,z,z===3?'#b86a4a':'#e8dcc0')}
    for(let s=0;s<3;s++)for(let x=-1+s;x<=6-s;x++)add(x,2,4+s,'#a8402f'),add(x,1,4+s,s<2?'#a8402f':'#c05040'),add(x,3,4+s,s<2?'#a8402f':'#c05040'),s<1&&(add(x,0,4,'#963a2a'),add(x,4,4,'#963a2a'));
    add(4,1,5,'#7a7a80');add(4,1,6,'#7a7a80');add(4,1,7,'#7a7a80');for(let i=0;i<3;i++)add(-2,1+i,1,'#5aa04a'),add(7,1+i,1,'#5aa04a');add(-2,2,2,'#5aa04a');add(7,2,2,'#4a8a3a');
    const seen=new Set();S.B=B.filter(b=>{const k2=b.x+','+b.y+','+b.z;if(seen.has(k2))return false;seen.add(k2);return true}).sort((a,b)=>a.z-b.z||(a.x+a.y)-(b.x+b.y));S.B.forEach((b,i)=>b.i=i)}
  if(k==='mondi'){S.is=Array.from({length:6},(_,i)=>({a:i/6*Math.PI*2,s:.75+r()*.5,h:r(),k:i%3,c:['#5aa04a','#e8d08a','#e8eef6','#8a5aa0','#5a8ad0','#d07a4a'][i]}));S.cont=Array.from({length:14},()=>({a:r()*Math.PI*2,y:r()*1.6-.8,s:.12+r()*.22}))}
  if(k==='dim'){S.num=['XII','I','II','III','IV','V','VI','VII','VIII','IX','X','XI'];S.streak=Array.from({length:120},()=>({a:r()*Math.PI*2,d:r(),v:.3+r()*.7}))}
  if(k==='viaggio'){const a=typeof twP==='function'&&twP(d.from)||[0,0],b=typeof twP==='function'&&twP(d.to)||[2,1];S.a=a;S.b=b;S.parts=[]}
  return S}
const LDSD={
storia(q,w,h,T,p,S){const u=Math.min(w,h)/600;
  let g=q.createLinearGradient(0,0,0,h);g.addColorStop(0,'#05081c');g.addColorStop(.55,'#1c1840');g.addColorStop(.8,'#3a2244');g.addColorStop(1,'#120c1a');q.fillStyle=g;q.fillRect(0,0,w,h);
  for(const s of S.stars){if(s.y>.7)continue;q.globalAlpha=.4+.6*Math.abs(Math.sin(T*1.3+s.f));q.fillStyle='#fff';q.fillRect(s.x*w,s.y*h*.9,s.s*u*1.4,s.s*u*1.4)}q.globalAlpha=1;
  const mx=w*.76,my=h*.22,mr=46*u;g=q.createRadialGradient(mx,my,mr*.6,mx,my,mr*4);g.addColorStop(0,'rgba(255,240,200,.35)');g.addColorStop(1,'rgba(255,240,200,0)');q.fillStyle=g;q.fillRect(0,0,w,h);
  q.fillStyle='#f4ead0';q.beginPath();q.arc(mx,my,mr,0,7);q.fill();q.fillStyle='rgba(180,170,150,.45)';for(const[a,b,c]of[[-.3,-.2,.22],[.25,.1,.16],[-.05,.35,.12],[.35,-.35,.09]]){q.beginPath();q.arc(mx+a*mr,my+b*mr,c*mr,0,7);q.fill()}
  const ridge=(base,amp,fr,off,col)=>{q.fillStyle=col;q.beginPath();q.moveTo(0,h);for(let x=0;x<=w;x+=8*u){const X=x/w*fr+off;q.lineTo(x,base+Math.sin(X)*amp+Math.sin(X*2.7+1)*amp*.45+Math.sin(X*6.1)*amp*.15)}q.lineTo(w,h);q.fill()};
  ridge(h*.6,34*u,6,T*.03,'#1e1a3c');ridge(h*.68,22*u,9,1.5+T*.05,'#16122c');
  // il castello
  const cx=w*.5,cy=h*.6,k=u*1.15;q.save();q.translate(cx,cy);q.scale(k,k);q.fillStyle='#0c0a18';q.beginPath();q.ellipse(0,40,230,48,0,Math.PI,0);q.fill();q.fillRect(-230,40,460,200);
  const tower=(x,tw,th,roof)=>{q.fillRect(x-tw/2,-th,tw,th+42);if(roof){q.beginPath();q.moveTo(x-tw/2-6,-th);q.lineTo(x,-th-roof);q.lineTo(x+tw/2+6,-th);q.fill()}else for(let i=-tw/2;i<tw/2;i+=8)q.fillRect(x+i,-th-7,5,7)};
  q.fillRect(-150,-40,300,82);for(let i=-150;i<150;i+=12)q.fillRect(i,-48,7,8);tower(-150,34,90,44);tower(150,34,90,44);tower(-70,40,130,0);tower(70,40,130,0);tower(0,56,190,70);tower(-205,22,50,26);tower(205,22,50,26);
  q.fillRect(-40,-100,80,100);
  const win=[[-150,-60],[150,-60],[-70,-95],[70,-95],[-70,-55],[70,-55],[0,-150],[0,-110],[-12,-60],[12,-60],[-110,-15],[110,-15],[-30,-15],[30,-15]];
  for(const[a,b]of win){const fl=.7+.3*Math.sin(T*7+a*.3+b);q.fillStyle=`rgba(255,${180+fl*40|0},90,${fl})`;q.fillRect(a-3,b-6,6,10);const wg=q.createRadialGradient(a,b-1,0,a,b-1,16);wg.addColorStop(0,`rgba(255,190,90,${.35*fl})`);wg.addColorStop(1,'rgba(255,190,90,0)');q.fillStyle=wg;q.fillRect(a-16,b-17,32,32)}
  q.fillStyle='#2a1a10';q.beginPath();q.moveTo(-14,42);q.lineTo(-14,18);q.quadraticCurveTo(0,4,14,18);q.lineTo(14,42);q.fill();
  // bandiera
  q.strokeStyle='#0c0a18';q.lineWidth=2;q.beginPath();q.moveTo(0,-260);q.lineTo(0,-232);q.stroke();q.fillStyle='#a8402f';q.beginPath();q.moveTo(0,-260);for(let i=0;i<=24;i+=4)q.lineTo(i,-260+Math.sin(T*6-i*.3)*2+i*.05);q.lineTo(24,-250);for(let i=24;i>=0;i-=4)q.lineTo(i,-250+Math.sin(T*6-i*.3)*2);q.fill();q.restore();
  // i sei frammenti della Corona
  const ccx=cx,ccy=cy-215*k,R=(150-110*Math.min(1,p*1.15))*u,cols=['#ff5a5a','#5aa8ff','#5aff8a','#ffd84a','#c86aff','#ff9a3a'];
  const pts=cols.map((c,i)=>{const a=T*(.9+p*1.5)+i/6*Math.PI*2;return{c,x:ccx+Math.cos(a)*R*1.6,y:ccy+Math.sin(a)*R*.42,z:Math.sin(a),i}}).sort((a,b)=>a.z-b.z);
  for(const f of pts){const s=(7+3*f.z)*u*1.2;g=q.createRadialGradient(f.x,f.y,0,f.x,f.y,s*4);g.addColorStop(0,f.c);g.addColorStop(1,'rgba(0,0,0,0)');q.globalAlpha=.55;q.fillStyle=g;q.fillRect(f.x-s*4,f.y-s*4,s*8,s*8);q.globalAlpha=1;
    q.fillStyle=f.c;q.strokeStyle='#fff8';q.lineWidth=1;q.beginPath();q.moveTo(f.x,f.y-s*1.4);q.lineTo(f.x+s*.8,f.y-s*.2);q.lineTo(f.x+s*.4,f.y+s);q.lineTo(f.x-s*.5,f.y+s*.8);q.lineTo(f.x-s*.8,f.y-s*.3);q.closePath();q.fill();q.stroke();
    q.fillStyle='rgba(255,255,255,.7)';q.beginPath();q.moveTo(f.x,f.y-s*1.2);q.lineTo(f.x+s*.4,f.y-s*.3);q.lineTo(f.x,f.y);q.fill()}
  if(p>.82){const a=Math.min(1,(p-.82)/.12);q.globalAlpha=a;g=q.createRadialGradient(ccx,ccy,0,ccx,ccy,120*u);g.addColorStop(0,'rgba(255,240,180,.9)');g.addColorStop(1,'rgba(255,240,180,0)');q.fillStyle=g;q.fillRect(ccx-120*u,ccy-120*u,240*u,240*u);
    q.fillStyle='#ffd84a';q.strokeStyle='#8a5a10';q.lineWidth=2*u;const cw=40*u;q.beginPath();q.moveTo(ccx-cw,ccy+cw*.5);q.lineTo(ccx-cw,ccy-cw*.3);q.lineTo(ccx-cw*.5,ccy+cw*.05);q.lineTo(ccx,ccy-cw*.6);q.lineTo(ccx+cw*.5,ccy+cw*.05);q.lineTo(ccx+cw,ccy-cw*.3);q.lineTo(ccx+cw,ccy+cw*.5);q.closePath();q.fill();q.stroke();q.globalAlpha=1}
  // pipistrelli
  q.fillStyle='#0a0814';for(const b of S.bats){const x=((b.o+T*b.v)%1.2-.1)*w,y=b.y*h+Math.sin(T*2+b.o*9)*10*u,fl=Math.sin(T*16+b.o*20)*6*u*b.s,s=8*u*b.s;q.beginPath();q.moveTo(x-s*1.6,y-fl);q.quadraticCurveTo(x-s*.6,y-s*.2,x,y+s*.2);q.quadraticCurveTo(x+s*.6,y-s*.2,x+s*1.6,y-fl);q.quadraticCurveTo(x,y+s*.5,x-s*1.6,y-fl);q.fill()}
  // nebbia e primo piano
  for(const f of S.fog){const x=((f.x+T*f.v)%1.4-.2)*w,y=f.y*h,r2=f.s*w;g=q.createRadialGradient(x,y,0,x,y,r2);g.addColorStop(0,'rgba(150,140,190,.16)');g.addColorStop(1,'rgba(150,140,190,0)');q.fillStyle=g;q.beginPath();q.ellipse(x,y,r2,r2*.22,0,0,7);q.fill()}
  ridge(h*.86,18*u,4,3,'#08060f');q.strokeStyle='#08060f';q.lineWidth=3*u;for(const[x0,s]of[[.08,1],[.9,1.2],[.16,.7]]){const x=x0*w,y=h*.86;q.beginPath();q.moveTo(x,y);q.lineTo(x,y-90*u*s);q.moveTo(x,y-50*u*s);q.lineTo(x-26*u*s,y-80*u*s);q.moveTo(x,y-66*u*s);q.lineTo(x+22*u*s,y-96*u*s);q.moveTo(x-14*u*s,y-66*u*s);q.lineTo(x-30*u*s,y-70*u*s);q.stroke()}},
tomorrow(q,w,h,T,p,S){const u=Math.min(w,h)/600,sunY=h*(.66-.16*p);
  let g=q.createLinearGradient(0,0,0,h*.75);g.addColorStop(0,'#1c2a5e');g.addColorStop(.45,'#7a4a7a');g.addColorStop(.75,'#ec7a4e');g.addColorStop(1,'#ffd08a');q.fillStyle=g;q.fillRect(0,0,w,h);
  for(const s of S.stars){if(s.y>.35)continue;q.globalAlpha=Math.max(0,(1-p*1.4))*(.4+.5*Math.abs(Math.sin(T+s.f)));q.fillStyle='#fff';q.fillRect(s.x*w,s.y*h,s.s*u,s.s*u)}q.globalAlpha=1;
  const sx=w*.62;g=q.createRadialGradient(sx,sunY,0,sx,sunY,w*.5);g.addColorStop(0,'rgba(255,230,160,.85)');g.addColorStop(.2,'rgba(255,170,100,.35)');g.addColorStop(1,'rgba(255,140,80,0)');q.fillStyle=g;q.fillRect(0,0,w,h);
  q.save();q.translate(sx,sunY);q.rotate(T*.05);for(let i=0;i<16;i++){q.rotate(Math.PI/8);q.fillStyle='rgba(255,220,150,.07)';q.beginPath();q.moveTo(0,0);q.lineTo(-30*u,-w);q.lineTo(30*u,-w);q.fill()}q.restore();
  q.fillStyle='#fff2c8';q.beginPath();q.arc(sx,sunY,40*u,0,7);q.fill();
  for(const c of S.cl){const x=((c.x+T*c.v)%1.3-.15)*w,y=c.y*h,s=c.s*60*u;q.fillStyle='rgba(255,190,170,.55)';for(const[a,b,r]of[[0,0,1],[.9,.2,.75],[-.9,.25,.7],[.4,-.35,.65],[-.4,-.3,.6]]){q.beginPath();q.arc(x+a*s,y+b*s,r*s*.7,0,7);q.fill()}
    q.fillStyle='rgba(120,70,110,.25)';q.beginPath();q.ellipse(x,y+s*.45,s*1.4,s*.22,0,0,7);q.fill()}
  const L=[[.58,36,'#9a6a9a',.012,1.1],[.64,30,'#6a4a78',.02,1.7],[.72,26,'#3e3a5a',.035,2.4],[.82,22,'#22283a',.06,3.1]],yAt=(i,x)=>{const[b,a,,v,f]=L[i],X=x/w*f*3+T*v*6;return h*b+(Math.sin(X)+Math.sin(X*2.3+i)*.5+Math.sin(X*5.7)*.15)*a*u};
  L.forEach(([b,a,col,v,f],i)=>{g=q.createLinearGradient(0,h*b-a*u,0,h);g.addColorStop(0,col);g.addColorStop(1,'#0c0c16');q.fillStyle=g;q.beginPath();q.moveTo(0,h);for(let x=0;x<=w+8;x+=6*u)q.lineTo(x,yAt(i,x));q.lineTo(w,h);q.fill();
    if(i===1){const vx=w*.22,vy=yAt(1,vx);q.fillStyle='#4a3a5a';for(const[o,hh]of[[-30,14],[-12,20],[6,16],[22,24],[40,12]]){q.fillRect(vx+o*u,vy-hh*u,14*u,hh*u+4);q.beginPath();q.moveTo(vx+(o-2)*u,vy-hh*u);q.lineTo(vx+(o+7)*u,vy-(hh+9)*u);q.lineTo(vx+(o+16)*u,vy-hh*u);q.fill()}
      q.fillStyle='rgba(255,200,120,.9)';for(const o of[-26,-8,10,26])q.fillRect(vx+o*u,vy-8*u,3*u,4*u);for(let s=0;s<5;s++){const t2=(T*.3+s/5)%1;q.fillStyle=`rgba(200,180,200,${.35*(1-t2)})`;q.beginPath();q.arc(vx+(26+t2*14)*u,vy-(34+t2*60)*u,(4+t2*10)*u,0,7);q.fill()}}
    if(i>=1){const tr=S.tr[i];q.fillStyle=i===3?'#141a24':i===2?'#2a2c44':'#54406a';const off=(T*v*6)/(f*3)*w;for(let j=0;j<tr.length;j++){if(tr[j]<.55)continue;let x=((j/tr.length*w*1.3-off*1)%(w*1.3)+w*1.3)%(w*1.3)-w*.15;const y=yAt(i,x),s=(6+tr[j]*10)*u*(i*.5);q.beginPath();q.moveTo(x-s*.6,y+2);q.lineTo(x,y-s*2.2);q.lineTo(x+s*.6,y+2);q.fill()}}});
  // il viandante sul crinale più vicino
  const hx=w*.27,hy=yAt(3,hx),st=T*5.2,s=u*1.25;q.save();q.translate(hx,hy);q.scale(s,s);q.fillStyle='#0a0c12';q.strokeStyle='#0a0c12';q.lineCap='round';
  q.lineWidth=5;for(const ph of[0,Math.PI]){const a=Math.sin(st+ph)*.5;q.beginPath();q.moveTo(0,-30);q.lineTo(Math.sin(a)*14,-14+Math.abs(Math.cos(a))*0);q.lineTo(Math.sin(a)*16+(a>0?4:0),0);q.stroke()}
  q.beginPath();q.moveTo(-7,-58);q.lineTo(-24-Math.sin(T*3)*4,-30+Math.sin(T*4)*3);q.lineTo(-8,-30);q.fill();
  q.fillRect(-6,-60,12,32);q.beginPath();q.arc(0,-68,8,0,7);q.fill();q.beginPath();q.moveTo(-11,-70);q.lineTo(0,-84);q.lineTo(11,-70);q.fill();
  q.lineWidth=3;q.beginPath();q.moveTo(10,-52);q.lineTo(16+Math.sin(st)*3,-2);q.stroke();q.beginPath();q.moveTo(-9,-56);q.lineTo(-4,-40);q.stroke();
  q.fillStyle='#3a2a1a';q.fillRect(-12,-56,7,16);q.restore();
  // stormi
  q.strokeStyle='#1a1424';q.lineWidth=1.6*u;for(const b of S.bd){const x=((b.x+T*.035)%1.2)*w,y=b.y*h+Math.sin(T+b.o)*8*u,f=Math.sin(T*9+b.o)*5*u*b.s,s=9*u*b.s;q.beginPath();q.moveTo(x-s,y-f);q.quadraticCurveTo(x-s*.4,y-s*.3,x,y);q.quadraticCurveTo(x+s*.4,y-s*.3,x+s,y-f);q.stroke()}
  // la luce dell'alba sul mondo
  q.fillStyle=`rgba(255,180,110,${.08+.1*p})`;q.fillRect(0,0,w,h)},
dim(q,w,h,T,p,S){const u=Math.min(w,h)/600,cx=w/2,cy=h*.47;q.fillStyle='#03041a';q.fillRect(0,0,w,h);
  for(const s of S.streak){const d=(s.d+T*s.v*.35)%1,r1=d*d*Math.max(w,h)*.8,r2=r1+d*60*u;q.strokeStyle=`rgba(160,200,255,${d*.7})`;q.lineWidth=1+d*2;q.beginPath();q.moveTo(cx+Math.cos(s.a)*r1,cy+Math.sin(s.a)*r1);q.lineTo(cx+Math.cos(s.a)*r2,cy+Math.sin(s.a)*r2);q.stroke()}
  for(let i=0;i<26;i++){const d=((i/26)+T*.18)%1,R=d*d*Math.max(w,h)*.75+8*u,hue=210+60*Math.sin(i*.7+T*.6);q.strokeStyle=`hsla(${hue},90%,${55+d*15}%,${(1-d)*.25+d*.35})`;q.lineWidth=(2+d*14)*u;q.beginPath();q.ellipse(cx,cy,R,R*.62,T*.4+i*.25,i*.9+T*1.6,i*.9+T*1.6+Math.PI*1.25);q.stroke()}
  let g=q.createRadialGradient(cx,cy,0,cx,cy,140*u);g.addColorStop(0,'rgba(255,255,255,.95)');g.addColorStop(.25,'rgba(150,200,255,.6)');g.addColorStop(1,'rgba(40,60,160,0)');q.fillStyle=g;q.beginPath();q.arc(cx,cy,140*u,0,7);q.fill();
  q.font=`bold ${Math.round(24*u)}px Georgia,serif`;q.textAlign='center';q.textBaseline='middle';S.num.forEach((n,i)=>{const a=i/12*Math.PI*2-T*.7,R=(220+30*Math.sin(T+i))*u;q.fillStyle=`rgba(200,225,255,${.35+.3*Math.sin(T*2+i)})`;q.save();q.translate(cx+Math.cos(a)*R,cy+Math.sin(a)*R*.62);q.rotate(a+Math.PI/2);q.fillText(n,0,0);q.restore()});
  // lancette
  q.strokeStyle='rgba(220,235,255,.55)';q.lineCap='round';q.lineWidth=5*u;q.beginPath();q.moveTo(cx,cy);q.lineTo(cx+Math.cos(T*3)*110*u,cy+Math.sin(T*3)*68*u);q.stroke();q.lineWidth=3*u;q.beginPath();q.moveTo(cx,cy);q.lineTo(cx+Math.cos(-T*9)*160*u,cy+Math.sin(-T*9)*100*u);q.stroke();
  // ingranaggi
  const gear=(x,y,r,a,col)=>{q.save();q.translate(x,y);q.rotate(a);q.fillStyle=col;q.beginPath();for(let i=0;i<24;i++){const an=i/24*Math.PI*2,rr=i%2?r:r*1.18;q.lineTo(Math.cos(an)*rr,Math.sin(an)*rr)}q.fill();q.fillStyle='#03041a';q.beginPath();q.arc(0,0,r*.4,0,7);q.fill();q.restore()};
  gear(w*.1,h*.2,60*u,T*.5,'rgba(90,120,200,.25)');gear(w*.1+92*u,h*.2+40*u,38*u,-T*.8,'rgba(90,120,200,.2)');gear(w*.9,h*.78,70*u,-T*.4,'rgba(90,120,200,.22)');
  // la cabina blu che precipita
  const sc=(1.25-.55*p)*u,rot=Math.sin(T*1.7)*.35+T*.25*(p>.6?(p-.6)*6:0);q.save();q.translate(cx+Math.sin(T*1.3)*30*u,cy+Math.cos(T*1.1)*16*u);q.rotate(rot);q.scale(sc,sc);
  q.fillStyle='rgba(120,180,255,.18)';q.beginPath();q.arc(0,0,115,0,7);q.fill();
  // il corpo di assi
  q.fillStyle='#1f4f9a';q.fillRect(-52,-30,104,96);q.strokeStyle='#143a78';q.lineWidth=2;for(let y=-22;y<66;y+=11){q.beginPath();q.moveTo(-52,y);q.lineTo(52,y);q.stroke()}
  // il tetto a punta con le tegole
  q.fillStyle='#7a2a20';q.beginPath();q.moveTo(-66,-26);q.lineTo(0,-86);q.lineTo(66,-26);q.closePath();q.fill();q.strokeStyle='#4a1a12';q.lineWidth=2;for(let i=1;i<5;i++){const yy=-26-i*12,xx=66-i*13.2;q.beginPath();q.moveTo(-xx,yy);q.lineTo(xx,yy);q.stroke()}
  q.fillStyle='#5a5a62';q.fillRect(22,-84,14,30);q.fillStyle='#3a3a42';q.fillRect(20,-88,18,6);
  for(let i=0;i<4;i++){const tt=(T*.8+i/4)%1;q.fillStyle=`rgba(200,220,255,${.4*(1-tt)})`;q.beginPath();q.arc(29+Math.sin(tt*6)*6,-92-tt*50,5+tt*9,0,7);q.fill()}
  // la porta con l'orologio
  q.fillStyle='#e8d8a8';q.fillRect(-18,4,36,62);q.fillStyle='#163a7a';q.fillRect(-15,7,30,59);q.fillStyle='#ffd84a';q.beginPath();q.arc(10,40,3,0,7);q.fill();
  q.fillStyle='#f4ecd8';q.beginPath();q.arc(0,-8,15,0,7);q.fill();q.strokeStyle='#8a6a2a';q.lineWidth=3;q.stroke();q.strokeStyle='#2a1a0a';q.lineWidth=2;q.beginPath();q.moveTo(0,-8);q.lineTo(Math.cos(T*4)*10,-8+Math.sin(T*4)*10);q.moveTo(0,-8);q.lineTo(Math.cos(-T*.8)*7,-8+Math.sin(-T*.8)*7);q.stroke();
  // le finestre tonde
  for(const sx2 of[-36,36]){q.fillStyle=`rgba(255,226,150,${.75+.25*Math.sin(T*5+sx2)})`;q.beginPath();q.arc(sx2,18,10,0,7);q.fill();q.strokeStyle='#e8d8a8';q.lineWidth=3;q.stroke();q.lineWidth=1.5;q.beginPath();q.moveTo(sx2-10,18);q.lineTo(sx2+10,18);q.moveTo(sx2,8);q.lineTo(sx2,28);q.stroke()}
  // la lanterna appesa al tetto
  const sw=Math.sin(T*3)*.4;q.save();q.translate(-60,-26);q.rotate(sw);q.strokeStyle='#2a2a30';q.lineWidth=1.5;q.beginPath();q.moveTo(0,0);q.lineTo(0,14);q.stroke();q.fillStyle='#2a2a30';q.fillRect(-6,14,12,4);
  q.fillStyle=`rgba(255,220,120,${.8+.2*Math.sin(T*9)})`;q.fillRect(-5,18,10,12);g=q.createRadialGradient(0,24,0,0,24,34);g.addColorStop(0,'rgba(255,220,120,.5)');g.addColorStop(1,'rgba(255,220,120,0)');q.fillStyle=g;q.fillRect(-34,-10,68,68);q.restore();
  q.fillStyle='#3a2a1a';q.fillRect(-58,64,116,8);
  q.restore();if(p>.86){q.fillStyle=`rgba(230,240,255,${(p-.86)/.14})`;q.fillRect(0,0,w,h)}},
studio(q,w,h,T,p,S){const u=Math.min(w,h)/600;q.fillStyle='#0f3466';q.fillRect(0,0,w,h);
  q.strokeStyle='rgba(160,210,255,.12)';q.lineWidth=1;const gs=20*u;for(let x=(T*4*u)%gs;x<w;x+=gs){q.beginPath();q.moveTo(x,0);q.lineTo(x,h);q.stroke()}for(let y=0;y<h;y+=gs){q.beginPath();q.moveTo(0,y);q.lineTo(w,y);q.stroke()}
  q.strokeStyle='rgba(160,210,255,.25)';for(let x=(T*4*u)%(gs*5);x<w;x+=gs*5){q.beginPath();q.moveTo(x,0);q.lineTo(x,h);q.stroke()}for(let y=0;y<h;y+=gs*5){q.beginPath();q.moveTo(0,y);q.lineTo(w,y);q.stroke()}
  // squadra, compasso e cartiglio
  q.strokeStyle='rgba(200,230,255,.5)';q.lineWidth=1.5*u;q.beginPath();q.arc(w*.14,h*.24,70*u,-1.2,1.9);q.stroke();q.beginPath();q.moveTo(w*.14,h*.24);q.lineTo(w*.14+Math.cos(T*.6)*70*u,h*.24+Math.sin(T*.6)*70*u);q.stroke();
  q.strokeRect(w*.74,h*.74,w*.2,h*.11);q.font=`${Math.round(12*u)}px monospace`;q.fillStyle='rgba(200,230,255,.7)';q.textAlign='left';q.fillText('PROGETTO N. '+(1000+((T*3)|0)%9000),w*.75,h*.77);q.fillText('SCALA 1:16  ·  VOXEL',w*.75,h*.8);q.fillText('CASA DEL PARCO',w*.75,h*.83);
  // la casetta, cubo dopo cubo
  const cs=22*u,ox=w*.5,oy=h*.4,iso=(x,y,z)=>[ox+(x-y)*cs*.95,oy+(x+y)*cs*.52-z*cs*1.02-(2.5)*cs*.52*2+cs*2];
  const nb=Math.floor(S.B.length*Math.min(1,p*1.08)),edge=Math.min(1,p*1.08)*S.B.length-nb;
  // ombra e ingombro tratteggiato
  q.setLineDash([6*u,5*u]);q.strokeStyle='rgba(200,230,255,.45)';q.beginPath();const c0=iso(-2.5,-.5,0),c1=iso(7.5,-.5,0),c2=iso(7.5,4.5,0),c3=iso(-2.5,4.5,0);q.moveTo(...c0);q.lineTo(...c1);q.lineTo(...c2);q.lineTo(...c3);q.closePath();q.stroke();q.setLineDash([]);
  const cube=(b,dz,al)=>{const[x,y]=iso(b.x,b.y,b.z+dz),c=b.c;q.globalAlpha=al;const top=[[x,y-cs*.52],[x+cs*.95,y],[x,y+cs*.52],[x-cs*.95,y]];
    const sh=(col,k)=>{const n2=parseInt(col.slice(1),16);return`rgb(${(n2>>16)*k|0},${(n2>>8&255)*k|0},${(n2&255)*k|0})`};
    q.fillStyle=sh(c,1.05);q.beginPath();q.moveTo(...top[0]);q.lineTo(...top[1]);q.lineTo(...top[2]);q.lineTo(...top[3]);q.fill();
    q.fillStyle=sh(c,.78);q.beginPath();q.moveTo(...top[3]);q.lineTo(...top[2]);q.lineTo(top[2][0],top[2][1]+cs*1.02);q.lineTo(top[3][0],top[3][1]+cs*1.02);q.fill();
    q.fillStyle=sh(c,.6);q.beginPath();q.moveTo(...top[2]);q.lineTo(...top[1]);q.lineTo(top[1][0],top[1][1]+cs*1.02);q.lineTo(top[2][0],top[2][1]+cs*1.02);q.fill();
    q.strokeStyle='rgba(20,30,50,.35)';q.lineWidth=1;q.beginPath();q.moveTo(...top[0]);q.lineTo(...top[1]);q.lineTo(...top[2]);q.lineTo(...top[3]);q.closePath();q.stroke();q.globalAlpha=1};
  const vis=S.B.slice(0,nb+1).map((b,i)=>({b,dz:i<nb?0:(1-edge)*6,al:i<nb?1:edge}));vis.sort((a,c)=>(a.b.x+a.b.y)-(c.b.x+c.b.y)||a.b.z-c.b.z);for(const v of vis)if(v.b)cube(v.b,v.dz,v.al);
  // il cursore che posa i cubi
  const cur=S.B[Math.min(S.B.length-1,nb)];if(cur&&p<.95){const[x,y]=iso(cur.x,cur.y,cur.z+1.4+Math.sin(T*8)*.2);q.strokeStyle='#ffd84a';q.lineWidth=2*u;q.beginPath();q.moveTo(x,y-20*u);q.lineTo(x,y);q.moveTo(x-6*u,y-7*u);q.lineTo(x,y);q.lineTo(x+6*u,y-7*u);q.stroke()}
  // le quote
  const dim2=(a,b,txt,o)=>{q.strokeStyle='rgba(220,240,255,.8)';q.fillStyle='rgba(220,240,255,.9)';q.lineWidth=1.2*u;q.beginPath();q.moveTo(a[0],a[1]+o);q.lineTo(b[0],b[1]+o);q.stroke();for(const e of[a,b]){q.beginPath();q.moveTo(e[0],e[1]+o-6*u);q.lineTo(e[0],e[1]+o+6*u);q.stroke()}q.font=`${Math.round(12*u)}px monospace`;q.textAlign='center';q.fillText(txt,(a[0]+b[0])/2,(a[1]+b[1])/2+o-8*u)};
  const pa=Math.min(1,p*2);q.globalAlpha=pa;dim2(iso(0,4.6,0),iso(6,4.6,0),'6,0 m',26*u);dim2(iso(6.1,0,0),iso(6.1,5,0),'5,0 m',26*u);q.globalAlpha=1;
  // la matita
  const px=w*.2+Math.sin(T*1.4)*w*.06,py=h*.72+Math.cos(T*2.1)*h*.03;q.save();q.translate(px,py);q.rotate(-.7);q.fillStyle='#ffcc4a';q.fillRect(-4*u,-70*u,8*u,60*u);q.fillStyle='#e8c8a0';q.beginPath();q.moveTo(-4*u,-10*u);q.lineTo(0,2*u);q.lineTo(4*u,-10*u);q.fill();q.fillStyle='#e87a8a';q.fillRect(-4*u,-78*u,8*u,8*u);q.restore();
  q.strokeStyle='rgba(255,255,255,.5)';q.lineWidth=1.4*u;q.beginPath();for(let i=0;i<40;i++){const tt=T-i*.03,x=w*.2+Math.sin(tt*1.4)*w*.06,y=h*.72+Math.cos(tt*2.1)*h*.03;i?q.lineTo(x,y):q.moveTo(x,y)}q.stroke()},
mondi(q,w,h,T,p,S){const u=Math.min(w,h)/600,cx=w/2,cy=h*.47,R=110*u;let g=q.createRadialGradient(w*.3,h*.3,0,w*.3,h*.3,w*.7);g.addColorStop(0,'#2a1a4a');g.addColorStop(.6,'#0c0a22');g.addColorStop(1,'#04040e');q.fillStyle=g;q.fillRect(0,0,w,h);
  g=q.createRadialGradient(w*.78,h*.7,0,w*.78,h*.7,w*.35);g.addColorStop(0,'rgba(120,60,160,.25)');g.addColorStop(1,'rgba(0,0,0,0)');q.fillStyle=g;q.fillRect(0,0,w,h);
  for(const s of S.stars){q.globalAlpha=.3+.7*Math.abs(Math.sin(T*1.1+s.f));q.fillStyle='#fff';q.fillRect(s.x*w,s.y*h,s.s*u,s.s*u)}q.globalAlpha=1;
  const isl=S.is.map(i=>{const a=i.a+T*.35;return{...i,x:cx+Math.cos(a)*R*2.2,y:cy+Math.sin(a)*R*.55-i.h*20*u,z:Math.sin(a)}});
  const drawI=I=>{const s=(.75+.25*I.z)*I.s*u*1.1;q.save();q.translate(I.x,I.y+Math.sin(T*2+I.a*3)*4*u);q.scale(s,s);
    q.fillStyle='#5a4030';q.beginPath();q.moveTo(-34,0);q.lineTo(0,46);q.lineTo(34,0);q.fill();q.fillStyle='#7a5a40';q.beginPath();q.moveTo(-34,0);q.lineTo(-6,40);q.lineTo(0,0);q.fill();
    q.fillStyle=I.c;q.beginPath();q.ellipse(0,0,36,10,0,0,7);q.fill();
    if(I.k===0){q.fillStyle='#2a6a2a';for(const x of[-18,-4,14]){q.beginPath();q.moveTo(x-8,-2);q.lineTo(x,-26);q.lineTo(x+8,-2);q.fill()}}
    else if(I.k===1){q.fillStyle='#e8dcc0';q.fillRect(-12,-18,22,16);q.fillStyle='#a8402f';q.beginPath();q.moveTo(-15,-18);q.lineTo(-1,-30);q.lineTo(13,-18);q.fill();q.fillStyle='#ffd88a';q.fillRect(-4,-12,5,6)}
    else{q.fillStyle='#8a8a90';q.fillRect(-8,-34,14,32);for(let i=-8;i<6;i+=5)q.fillRect(i,-38,3,4)}
    q.strokeStyle='#ddd';q.lineWidth=1.5;q.beginPath();q.moveTo(24,-2);q.lineTo(24,-30);q.stroke();q.fillStyle='#ffd84a';q.beginPath();q.moveTo(24,-30);q.lineTo(38+Math.sin(T*5+I.a)*2,-26);q.lineTo(24,-21);q.fill();
    q.fillStyle='rgba(255,216,74,.85)';q.font='bold 12px serif';q.textAlign='center';q.fillText('★'.repeat(3+((I.a*7)|0)%3),0,-48);q.restore()};
  for(const I of isl.filter(i=>i.z<0).sort((a,b)=>a.z-b.z))drawI(I);
  g=q.createRadialGradient(cx,cy,R*.9,cx,cy,R*1.35);g.addColorStop(0,'rgba(120,180,255,.5)');g.addColorStop(1,'rgba(120,180,255,0)');q.fillStyle=g;q.beginPath();q.arc(cx,cy,R*1.35,0,7);q.fill();
  g=q.createRadialGradient(cx-R*.35,cy-R*.35,R*.1,cx,cy,R);g.addColorStop(0,'#4a9ae8');g.addColorStop(1,'#123a7a');q.fillStyle=g;q.beginPath();q.arc(cx,cy,R,0,7);q.fill();
  q.save();q.beginPath();q.arc(cx,cy,R,0,7);q.clip();for(const c of S.cont){const a=((c.a+T*.25)%(Math.PI*2)),x=Math.cos(a);if(Math.sin(a)<0)continue;const X=cx+x*R*.95,Y=cy+c.y*R*.85,s=c.s*R*(.4+.6*Math.sin(a));q.fillStyle=c.y>.6||c.y<-.6?'#e8f0f8':'#4a8a3a';q.beginPath();q.ellipse(X,Y,s*Math.sin(a),s*.6,0,0,7);q.fill()}
  q.fillStyle='rgba(255,255,255,.35)';for(let i=0;i<5;i++){const a=T*.35+i*1.3;if(Math.sin(a)<0)continue;q.beginPath();q.ellipse(cx+Math.cos(a)*R*.8,cy+(i-2)*R*.32,R*.3*Math.sin(a),R*.05,0,0,7);q.fill()}
  g=q.createRadialGradient(cx+R*.4,cy+R*.3,R*.2,cx,cy,R*1.05);g.addColorStop(0,'rgba(0,0,30,0)');g.addColorStop(1,'rgba(0,0,30,.65)');q.fillStyle=g;q.fillRect(cx-R,cy-R,R*2,R*2);q.restore();
  for(const I of isl.filter(i=>i.z>=0).sort((a,b)=>a.z-b.z))drawI(I);
  const sh=(T*.4)%1;if(sh<.3){const x=w*(.9-sh*2),y=h*(.1+sh*.6);q.strokeStyle='rgba(255,255,255,.8)';q.lineWidth=2*u;q.beginPath();q.moveTo(x,y);q.lineTo(x+60*u,y-20*u);q.stroke()}},
viaggio(q,w,h,T,p,S,D){const u=Math.min(w,h)/600;q.fillStyle='#d9c79f';q.fillRect(0,0,w,h);
  const e=x=>x<.5?2*x*x:1-Math.pow(-2*x+2,2)/2,m=e(Math.min(1,Math.max(0,(p-.12)/.66))),[ax,ay]=S.a,[bx,by]=S.b,dd=Math.hypot(bx-ax,by-ay)||1,Z2=clamp(Math.min(w,h)/(dd+3),34*u,120*u)*(1.15-.35*Math.sin(m*Math.PI));
  const ccx=ax+.5+(bx-ax)*m,ccy=ay+.5+(by-ay)*m,sx=x=>w/2+(x-ccx)*Z2,sy=y=>h/2+(y-ccy)*Z2;
  const x0=Math.floor(ccx-w/2/Z2)-1,x1=Math.ceil(ccx+w/2/Z2)+1,y0=Math.floor(ccy-h/2/Z2)-1,y1=Math.ceil(ccy+h/2/Z2)+1;
  if(typeof twChunk==='function'){q.imageSmoothingEnabled=true;for(let cy=Math.floor(y0/8);cy<=Math.floor(y1/8);cy++)for(let cx=Math.floor(x0/8);cx<=Math.floor(x1/8);cx++)q.drawImage(twChunk(cx,cy),sx(cx*8),sy(cy*8),8*Z2+1,8*Z2+1)}
  q.fillStyle='rgba(217,190,140,.35)';q.fillRect(0,0,w,h);
  // nuvole che scorrono sotto il volo
  for(let i=0;i<6;i++){const x=((i*.37+T*.12)%1.4-.2)*w,y=h*(.15+((i*.53)%1)*.7),s=(70+i*20)*u;const g=q.createRadialGradient(x,y,0,x,y,s);g.addColorStop(0,`rgba(255,255,255,${.35*Math.sin(m*Math.PI)+.05})`);g.addColorStop(1,'rgba(255,255,255,0)');q.fillStyle=g;q.beginPath();q.arc(x,y,s,0,7);q.fill()}
  // la via di luce
  const A=[sx(ax+.5),sy(ay+.5)],B=[sx(bx+.5),sy(by+.5)],Cc=[(A[0]+B[0])/2,(A[1]+B[1])/2-Math.hypot(B[0]-A[0],B[1]-A[1])*.25],bz=t2=>[(1-t2)*(1-t2)*A[0]+2*(1-t2)*t2*Cc[0]+t2*t2*B[0],(1-t2)*(1-t2)*A[1]+2*(1-t2)*t2*Cc[1]+t2*t2*B[1]];
  q.setLineDash([10*u,8*u]);q.lineDashOffset=-T*40*u;q.strokeStyle='rgba(90,40,120,.7)';q.lineWidth=3*u;q.beginPath();q.moveTo(...A);q.quadraticCurveTo(...Cc,...B);q.stroke();q.setLineDash([]);
  q.strokeStyle='rgba(200,160,255,.9)';q.lineWidth=4*u;q.shadowColor='#c8a0ff';q.shadowBlur=16*u;q.beginPath();for(let i=0;i<=40;i++){const pt=bz(i/40*m);i?q.lineTo(...pt):q.moveTo(...pt)}q.stroke();q.shadowBlur=0;
  const mark=(P2,txt,col)=>{q.fillStyle=col;q.strokeStyle='#2a1a0a';q.lineWidth=2*u;q.beginPath();q.arc(P2[0],P2[1],9*u,0,7);q.fill();q.stroke();q.font=`bold ${Math.round(15*u)}px Georgia,serif`;q.textAlign='center';q.lineWidth=4*u;q.strokeStyle='rgba(240,228,200,.95)';q.strokeText(txt,P2[0],P2[1]-18*u);q.fillStyle='#3a2410';q.fillText(txt,P2[0],P2[1]-18*u)};
  const nm=k=>{try{return twZ(k).n}catch(e){return''}};mark(A,nm(D.from)||'Partenza','#ffd84a');mark(B,D.name||nm(D.to)||'Arrivo','#c8a0ff');
  // la gemma in volo con la scia
  const G=bz(m);if(Math.random()<.9)S.parts.push({x:G[0],y:G[1],vx:(Math.random()-.5)*40*u,vy:(Math.random()-.5)*40*u,l:1});for(const pp of S.parts){pp.x+=pp.vx*.016;pp.y+=pp.vy*.016;pp.l-=.025}S.parts=S.parts.filter(pp=>pp.l>0);
  for(const pp of S.parts){q.fillStyle=`rgba(220,190,255,${pp.l})`;q.beginPath();q.arc(pp.x,pp.y,3*u*pp.l,0,7);q.fill()}
  const gl=q.createRadialGradient(G[0],G[1],0,G[0],G[1],50*u);gl.addColorStop(0,'rgba(230,210,255,.9)');gl.addColorStop(1,'rgba(200,160,255,0)');q.fillStyle=gl;q.beginPath();q.arc(G[0],G[1],50*u,0,7);q.fill();
  q.save();q.translate(G[0],G[1]);q.rotate(Math.sin(T*3)*.2);const gs=16*u;q.fillStyle='#b88aff';q.strokeStyle='#fff';q.lineWidth=1.5*u;q.beginPath();q.moveTo(0,-gs);q.lineTo(gs*.7,-gs*.2);q.lineTo(0,gs);q.lineTo(-gs*.7,-gs*.2);q.closePath();q.fill();q.stroke();q.fillStyle='rgba(255,255,255,.7)';q.beginPath();q.moveTo(0,-gs);q.lineTo(gs*.3,-gs*.2);q.lineTo(0,0);q.fill();q.restore();
  // il bagliore della partenza e dell'arrivo
  const fl=Math.max(p<.14?1-p/.14:0,p>.8?(p-.8)/.2:0);if(fl>0){q.fillStyle=`rgba(240,230,255,${fl*.85})`;q.fillRect(0,0,w,h)}}};
LDS.play=ldsPlay;LDS.end=ldsEnd;
addEventListener('resize',ldsSize);
addEventListener('keydown',e=>{if(LDS.on&&LDS.hold){e.stopImmediatePropagation();e.preventDefault();ldsSkip()}},true);
// il gioco resta fermo sotto la schermata
const _frame717=frame;frame=function(n){if(LDS.hold){last=n;return}_frame717(n)};
/* ---- quando parte ogni modalità ---- */
const _begin717l=begin;begin=function(d,s){const tw=!!OW.next;_begin717l(d,s);if(!started||!cineOK())return;
  if(tw){let rn='';try{rn=ZZ&&ZZ.n||''}catch(e){}ldsPlay('tomorrow',{sub:rn?'Il risveglio a '+rn+(NET.code?' · mondo «'+NET.code+'»':''):''},null)}
  else ldsPlay('storia',{sub:s?'Bentornato, '+(NET.name||'eroe'):'Una nuova leggenda comincia'},null)};
const _beginDim717=beginDim;beginDim=function(fresh){_beginDim717(fresh);if(MODE==='dim')ldsPlay('dim',{sub:fresh?'Un nuovo viaggio nel tempo':'Il viaggio riprende'},null)};
const _edEnter717=edEnter;edEnter=function(){_edEnter717();ldsPlay('studio',{sub:EW&&EW.name?'Si apre «'+EW.name+'»':'Il Parco giochi'},null,{dur:3})};
const _edPlay717=edPlay;edPlay=function(w,o){_edPlay717(w,o);if(o&&o.test)return;if(w&&w.pubId)ldsPlay('mondi',{ti:w.name||LDSK.mondi.ti,sub:w.author?'Un mondo di '+w.author:'Un mondo della community'},null);else ldsPlay('studio',{ti:w&&w.name||'Voxelia Studio',sub:'Si gioca il tuo mondo'},null)};
let LDSmb=-1e9;const _mbOpen717=mbOpen;mbOpen=function(page,arg){const first=!$('mb')||getComputedStyle($('mb')).display==='none';const r=_mbOpen717.apply(this,arguments);
  if(first&&page===undefined&&inMenu&&!started&&performance.now()-LDSmb>30000){LDSmb=performance.now();ldsPlay('mondi',{},null,{hold:false,dur:2.8})}return r};
document.head.insertAdjacentHTML('beforeend',`<style>
#lds{position:fixed;inset:0;z-index:100000;display:none;background:#000;cursor:pointer;user-select:none;-webkit-user-select:none}#lds.on{display:block}#lds.out{opacity:0;transition:opacity .7s ease}
#lds canvas{position:absolute;inset:0;width:100%;height:100%}
.ldsui{position:absolute;left:50%;bottom:calc(9% + env(safe-area-inset-bottom,0px));transform:translateX(-50%);width:min(640px,90vw);text-align:center;color:#fff;font-family:Georgia,serif;text-shadow:0 2px 8px #000,0 0 2px #000}
.ldsic{font-size:34px;animation:ldsIn .9s .15s both}
#lds h1{text-shadow:none;margin:2px 0 0;font-size:clamp(28px,5.4vw,54px);letter-spacing:2px;font-weight:normal;color:#fff;background:linear-gradient(180deg,#fff,var(--ac));-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;filter:drop-shadow(0 2px 6px #000);animation:ldsIn 1s .25s both}
#lds h2{margin:4px 0 14px;font-size:clamp(13px,2vw,17px);font-weight:normal;font-style:italic;opacity:.9;animation:ldsIn 1s .45s both}
.ldsbar{position:relative;height:9px;border-radius:6px;background:rgba(0,0,0,.55);border:1px solid color-mix(in srgb,var(--ac) 60%,transparent);box-shadow:0 0 14px #0008;overflow:visible;animation:ldsIn .8s .6s both}
.ldsbar i{position:absolute;left:0;top:0;bottom:0;border-radius:6px;background:linear-gradient(90deg,color-mix(in srgb,var(--ac) 40%,#000),var(--ac),#fff);box-shadow:0 0 12px var(--ac)}
.ldsbar b{position:absolute;right:0;top:-20px;font-size:12px;font-weight:normal;opacity:.8}
.ldsbar::before,.ldsbar::after{content:'◆';position:absolute;top:50%;transform:translateY(-50%);color:var(--ac);font-size:13px}.ldsbar::before{left:-18px}.ldsbar::after{right:-18px}
.ldsst{margin:9px 0 2px;font-size:14px;color:var(--ac);letter-spacing:.5px;animation:ldsIn .5s both}
.ldstip{margin:6px auto 0;font-size:13.5px;opacity:.88;max-width:560px;min-height:2.6em;animation:ldsIn .6s both}
.ldssk{position:absolute;right:18px;bottom:calc(10px + env(safe-area-inset-bottom,0px));color:#fff;opacity:0;font:12px Georgia,serif;transition:opacity .5s;text-shadow:0 1px 4px #000}#lds.sk .ldssk{opacity:.55}
@keyframes ldsIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
</style>`);
