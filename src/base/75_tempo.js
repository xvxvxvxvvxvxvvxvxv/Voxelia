/* ================= ciclo del giorno e della notte ================= */
// 1 secondo reale = 1 minuto di gioco: un giorno intero dura 24 minuti. Il primo giorno comincia alle 8:00.
// Da soli il tempo è quello del salvataggio (P.gt); in una stanza è l'orologio del mondo tenuto dal server, uguale per tutti.
const DAYM=1440;
let NK=0,DK=0,lastDay=0;
function gNow(){if(NET.tm!=null)return NET.tm+(performance.now()-NET.tmAt)/1000;return P&&P.gt!=null?P.gt:480}
const gDay=()=>Math.floor(gNow()/DAYM)+1,gHour=()=>(((gNow()%DAYM)+DAYM)%DAYM)/60;
function gClock(){const m=Math.floor(((gNow()%DAYM)+DAYM)%DAYM);return String(m/60|0).padStart(2,'0')+':'+String(m%60).padStart(2,'0')}
// buio della notte: 0 = pieno giorno, 1 = notte fonda (dalle 21 alle 5); tra 5 e 7 l'alba, tra 18:30 e 21 il tramonto
function nightK(h=gHour()){if(h<5||h>=21)return 1;if(h<7)return 1-(h-5)/2;if(h>=18.5)return(h-18.5)/2.5;return 0}
// luce arancione di alba e tramonto
function duskK(h=gHour()){return Math.max(0,1-Math.abs(h-6.2)/1.3,1-Math.abs(h-19.3)/1.5)}
function phase(h=gHour()){return h<5?'Notte':h<7?'Alba':h<12?'Mattina':h<18?'Pomeriggio':h<21?'Tramonto':'Notte'}
const isNight=()=>!!SKY[Zk]&&NK>.5;
// di notte, all'aperto, i nemici danno il 20% di esperienza in più
const nightXP=()=>isNight()?1.2:1;
function timeTick(dt){if(NET.tm==null)P.gt=(P.gt==null?480:P.gt)+dt;
  const out=!!SKY[Zk];NK=out?nightK():0;DK=out?duskK():0;
  const d=gDay();if(lastDay&&d!==lastDay){banner('Giorno '+d,'Un nuovo giorno ad Aldoria: i mercanti hanno cambiato i prezzi','luna');jingle([60,64,67,72],.14,'triangle');if(PM==='shop'||PM==='smith'||PM==='alch')pn(PM)}
  lastDay=d}

/* ---- luci della notte: buio con buchi di luce intorno all'eroe, ai lampioni, ai fuochi, alle finestre ---- */
const NLS=[];let NLc=null;
function nlight(x,y,z,r,c,a,w){if(NK>.02&&NLS.length<70&&Math.abs(x-P.px)+Math.abs(y-P.py)<22)NLS.push([x,y,z,r,c,a,w])}
function nightDraw(){g.setTransform(DPR,0,0,DPR,0,0);
  if(DK>.01){g.fillStyle=`rgba(255,120,40,${(.14*DK*(1-NK*.5)).toFixed(3)})`;g.fillRect(0,0,W,H)}
  if(NK<.01)return;
  const[px,py]=scr(P.px,P.py,20);
  if(!SET.light){const r=g.createRadialGradient(px,py,40,px,py,260*S);r.addColorStop(0,`rgba(8,12,40,${.25*NK})`);r.addColorStop(1,`rgba(8,12,40,${.6*NK})`);g.fillStyle=r;g.fillRect(0,0,W,H);starsDraw();return}
  const q=3,lw=Math.ceil(W/q),lh=Math.ceil(H/q);if(!NLc||NLc.width!==lw||NLc.height!==lh){NLc=document.createElement('canvas');NLc.width=lw;NLc.height=lh}
  const l=NLc.getContext('2d');l.globalCompositeOperation='source-over';l.globalAlpha=1;l.clearRect(0,0,lw,lh);l.fillStyle=`rgba(5,8,30,${(.78*NK).toFixed(3)})`;l.fillRect(0,0,lw,lh);
  l.globalCompositeOperation='destination-out';const sp=glowSpr('255,255,255');
  const hole=(x,y,r,a)=>{if(x<-r||y<-r||x>W+r||y>H+r)return;l.globalAlpha=a;l.drawImage(sp,(x-r)/q,(y-r)/q,2*r/q,2*r/q)};
  hole(px,py,210*S,.95);
  for(const o of NET.list){const[x,y]=scr(o.px,o.py,20);hole(x,y,160*S,.85)}
  for(const s of NLS){const[x,y]=scr(s[0],s[1],s[2]);hole(x,y,s[3]*S,s[5])}
  for(const e of ents){if(e.k==='tc'||(e.k==='po'&&e.st!=='door')||e.k==='shard'||e.k==='cho'){const[x,y]=scr(e.px,e.py,24);hole(x,y,(e.k==='tc'?180:130)*S,.9)}}
  for(const p of PJ){const[x,y]=scr(p.x,p.y,20);hole(x,y,60*S,.8)}
  l.globalAlpha=1;l.globalCompositeOperation='source-over';g.drawImage(NLc,0,0,W,H);
  // aloni caldi di lampioni, fuochi e finestre
  g.globalCompositeOperation='lighter';for(const s of NLS){if(s[6])continue;const[x,y]=scr(s[0],s[1],s[2]),r=s[3]*.5*S;g.globalAlpha=.38*NK*s[5];g.drawImage(glowSpr(s[4]),x-r,y-r,2*r,2*r)}
  g.globalAlpha=1;g.globalCompositeOperation='source-over';starsDraw()}

/* ---- stelle e luna, solo nel cielo (fuori dalla mappa) ---- */
let STARS=null;
function starsDraw(){if(!SET.sky||!SKY[Zk]||NK<.05)return;
  if(!STARS){const r=sd(4242);STARS=[];for(let i=0;i<110;i++)STARS.push([r(),r()*.75,r()*6.28,r()<.15?2:1])}
  g.save();g.setTransform(DPR,0,0,DPR,0,0);g.beginPath();g.rect(0,0,W,H);
  const c=(x,y,z)=>scr(x,y,z);let p=c(0,0,70);g.moveTo(p[0],p[1]);p=c(N,0,70);g.lineTo(p[0],p[1]);p=c(N,N,0);g.lineTo(p[0],p[1]);p=c(0,N,0);g.lineTo(p[0],p[1]);g.closePath();g.clip('evenodd');
  for(const s of STARS){const a=NK*(.55+.45*Math.sin(t*1.7+s[2]*5));g.fillStyle=`rgba(235,240,255,${a.toFixed(2)})`;g.fillRect(s[0]*W,s[1]*H,s[3],s[3])}
  const h=gHour(),pm=((h-19+24)%24)/11;if(pm>=0&&pm<=1){const mx=W*(.88-.76*pm),my=H*(.34-.24*Math.sin(Math.PI*pm));
    g.globalAlpha=.55*NK;g.drawImage(glowSpr('200,215,255'),mx-90,my-90,180,180);g.globalAlpha=NK;
    g.fillStyle='#e8ecf6';g.fillRect(mx-18,my-18,36,36);g.fillStyle='#c8cede';g.fillRect(mx-10,my-8,8,8);g.fillRect(mx+5,my+4,6,6);g.fillRect(mx-4,my+9,4,4);g.globalAlpha=1}
  g.restore()}
// posizione del sole nel cielo: sorge a destra (est) alle 6 e tramonta a sinistra (ovest) alle 19
function sunPos(){const p=(gHour()-6)/13;return{up:p>0&&p<1,p,x:W*(.9-.8*clamp(p,0,1)),y:H*(.36-.26*Math.sin(Math.PI*clamp(p,0,1)))}}

/* ---- orologio dell'HUD: striscia delle 24 ore con il sole o la luna, ora e giorno ---- */
let CLKk='';
function clockUI(){const c=$('clkc');if(!c||!P)return;const h=gHour(),key=gClock()+gDay()+(NET.tm!=null?'n':'s');if(key===CLKk)return;CLKk=key;
  const q=c.getContext('2d'),w=c.width,ht=c.height;q.clearRect(0,0,w,ht);
  const gr=q.createLinearGradient(0,0,w,0),st=[[0,'#0b1230'],[4.6,'#16204a'],[5.6,'#5a3a6a'],[6.3,'#e88a4a'],[7.5,'#7ab8e8'],[12,'#a8d8f8'],[17.6,'#7ab8e8'],[19.3,'#e8804a'],[20.4,'#4a2a5a'],[21.5,'#16204a'],[24,'#0b1230']];
  for(const[x,col]of st)gr.addColorStop(x/24,col);q.fillStyle=gr;q.fillRect(2,6,w-4,ht-12);q.strokeStyle='#000a';q.lineWidth=2;q.strokeRect(1,5,w-2,ht-10);
  q.fillStyle='#fff6';for(let i=1;i<8;i++)q.fillRect(Math.round(2+(w-4)*i/8),ht-9,1,3);
  const x=2+(w-4)*h/24,day=h>=6&&h<19.5,ic=ICON(day?'sole':'luna',2);if(ic.c)q.drawImage(ic.c,Math.round(x-9),Math.round(ht/2-9),18,18);
  $('clkt').innerHTML=`${ico(day?'sole':'luna')} <b>${gClock()}</b> <span>${phase(h)}</span><br><small>Giorno ${gDay()}</small>`}
