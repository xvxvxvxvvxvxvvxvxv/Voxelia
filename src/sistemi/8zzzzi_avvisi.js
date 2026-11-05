/* ================= 7.54.1: LE SCRITTE DEL GIOCO NON COPRONO PIÙ LE FINESTRE =================
   Le piccole scritte che restano sullo schermo durante il gioco (l'evento in corso «Un drago attacca…», il cibo o
   l'elisir attivo «Torta di mele · 14:28», la guerra tra fazioni, la maledizione, i contatori di miniera e insediamento)
   erano disegnate sopra tutto: coprivano il riquadro dell'eroe in alto a sinistra, la schermata di fine battaglia e le
   finestre del gioco (zaino, negozi, dialoghi…), e quando ne comparivano due insieme si accavallavano tra loro.
   Ora:
   - stanno sotto le finestre del gioco e sotto la schermata della battaglia;
   - si mettono da sole nel primo posto libero: quella del cibo sotto il riquadro dell'eroe (che cambia altezza con
     stamina, notte, giocatori…), quelle al centro una sotto l'altra, sotto il nome della zona, la schermata della
     battaglia e gli altri riquadri in alto;
   - anche gli avvisi passeggeri (i titoli «Vittoria!», il nome della zona, il «Perfetto!» delle combo, i pulsanti
     d'azione in basso) finiscono sotto una finestra quando ne apri una, invece di starle sopra;
   - in battaglia il nome della zona non si vede più in trasparenza dietro la barra e il riquadro della battaglia;
   - a fine battaglia il titolo grande «Vittoria!» o «Sconfitta» compare sotto il riquadro con i pulsanti, non sopra. */
const AVV={top:['mal43','minehud','sethud','war44','ev46'],left:['mst49'],t:0,
  ost:['hud','zn','mm','qt','clk','v3b','gbtn','twbtns','v3rot','tjz','neohud'],
  ovr:['set','mappa','look','chg','ovrm','vmenu','fmenu','tmn','mb','mpub','mmod']};
const avvVis=el=>{if(!el||el.hidden)return false;const cs=getComputedStyle(el);if(cs.display==='none'||cs.visibility==='hidden'||+cs.opacity===0)return false;const r=el.getBoundingClientRect();return r.width>1&&r.height>1};
const avvHit=(a,b)=>a.l<b.r&&a.r>b.l&&a.t<b.b&&a.b>b.t;
function avvBox(el){const r=el.getBoundingClientRect();return{l:r.left,r:r.right,t:r.top,b:r.bottom}}
// il primo posto libero dall'alto, a partire da y0, per un riquadro largo da l a r e alto h
function avvSpot(l,r,h,y0,O){let y=y0;for(let n=0;n<40;n++){const me={l,r,t:y,b:y+h};let hit=null;for(const o of O)if(avvHit(me,o)&&(!hit||o.b>hit.b))hit=o;if(!hit)return y;y=hit.b+6}return y}
function avvLay(){if(!started)return;const W=innerWidth,H=innerHeight;
  const O=[];for(const id of AVV.ost){const el=$(id);if(avvVis(el))O.push(avvBox(el))}
  // la schermata della battaglia: i suoi riquadri contano come ostacoli
  const bu=$('batui');if(bu)for(const c of bu.querySelectorAll('.bt-top,.bt-end'))if(avvVis(c))O.push(avvBox(c));
  const safe=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--sat'))||0;
  for(const id of AVV.top){const el=$(id);if(!avvVis(el)){if(el)el.style.top='';continue}
    const w=el.offsetWidth,h=el.offsetHeight,l=W/2-w/2,y=avvSpot(l,l+w,h,Math.max(44,safe+44),O);el.style.top=Math.round(Math.min(y,H*.6))+'px';O.push({l,r:l+w,t:y,b:y+h})}
  // il titolo grande («Vittoria!», «Sconfitta») non copre la schermata di fine battaglia con i suoi pulsanti: scende sotto
  {const bn=$('bnr'),be=bu&&bu.querySelector('.bt-end');if(bn){if(be&&avvVis(be)&&bn.className){const b=be.closest('.bt-top')||be,rb=b.getBoundingClientRect(),h=bn.offsetHeight,w=bn.offsetWidth,y=avvSpot(W/2-w/2,W/2+w/2,h,rb.bottom+8,O);bn.style.top=Math.round(Math.min(y+h/2,H-h/2-8))+'px'}else if(bn.style.top)bn.style.top=''}}
  for(const id of AVV.left){const el=$(id);if(!avvVis(el)){if(el)el.style.top='';continue}
    const r0=el.getBoundingClientRect(),w=r0.width,h=r0.height,l=r0.left,y=avvSpot(l,l+w,h,Math.max(44,safe+44),O);el.style.top=Math.round(Math.min(y,H*.7))+'px';O.push({l,r:l+w,t:y,b:y+h})}}
// è aperta una finestra del gioco?
function avvPn(){if(typeof PM!=='undefined'&&PM)return true;for(const id of AVV.ovr){const el=$(id);if(el&&avvVis(el))return true}return false}
function avvTick(){const op=!!(started&&avvPn());if(document.body.classList.contains('pnop')!==op)document.body.classList.toggle('pnop',op);avvLay()}
setInterval(()=>{try{avvTick()}catch(e){}},250);
addEventListener('resize',()=>{try{avvTick()}catch(e){}});
// appena una finestra si apre o si chiude, senza aspettare il prossimo controllo
{const p0=pn;pn=function(m,arg){const r=p0(m,arg);try{avvTick()}catch(e){}return r}}
{const c0=cl;cl=function(){const r=c0.apply(this,arguments);try{avvTick()}catch(e){}return r}}
(function(){const st=document.createElement('style');st.textContent=`
#ev46,#war44,#mst49,#mal43{z-index:13!important}
body.pnop #bnr,body.pnop #ztc,body.pnop #cbui,body.pnop #navui,body.pnop #dmbtn,body.pnop #cseb,body.pnop #minehud,body.pnop #sethud,body.pnop .fly{z-index:13!important}
body.batt #zn{visibility:hidden}
#ev46,#war44,#mal43{max-width:calc(100vw - 24px);box-sizing:border-box}`;document.head.appendChild(st)})();
