/* ================= 7.54.1: IL MENU SI ADATTA ALLA FINESTRA =================
   - La schermata della Corona riempie sempre la finestra, né più né meno: titolo in alto, i pulsanti in basso e la Corona
     nello spazio che resta (prima era alta due terzi della finestra, e nelle finestre basse il menu scorreva e il titolo
     spariva sopra). Nelle finestre molto basse titolo, gemme e pulsanti si rimpiccioliscono.
   - Le altre schermate del menu (Storia, Tomorrow, Parco giochi…) si rimpiccioliscono quanto serve per stare nella
     finestra, invece di scorrere su e giù. Solo quando servirebbe rimpicciolirle troppo (telefoni in verticale) scorrono.
   - Nel pannello «Nuova partita» le carte della difficoltà riempiono tutto il pannello: non resta lo spazio vuoto sotto
     quando il pannello dell'eroe è più alto. */
const MFIT={raf:0,min:.62};
function menuFit(){MFIT.raf=0;const m=$('menu');if(!m||getComputedStyle(m).display==='none')return;const w=m.querySelector('.mwrap');if(!w)return;
  const cr=$('crown'),corona=!!(cr&&cr.offsetParent!==null&&getComputedStyle(cr).display!=='none');w.classList.toggle('crfit',corona);
  const parts=[...w.children].filter(c=>c!==cr);for(const c of parts)c.style.zoom='';w.style.zoom='';
  const H=m.clientHeight;if(!H)return;
  if(corona){// la Corona prende lo spazio che resta (CSS); se nemmeno così basta, si rimpiccioliscono titolo e pulsanti
    const over=m.scrollHeight-H;if(over>1){const hz=parts.reduce((a,c)=>a+c.offsetHeight,0);const z=clamp((hz-over)/Math.max(1,hz),.55,1);for(const c of parts)c.style.zoom=z}
    m.scrollTop=0;return}
  for(let i=0;i<3;i++){const need=m.scrollHeight;if(need<=H+1)break;const z0=+w.style.zoom||1,z=Math.max(MFIT.min,z0*(H-4)/need);if(Math.abs(z-z0)<.005)break;w.style.zoom=z;if(z<=MFIT.min)break}
  if(m.scrollHeight<=H+1)m.scrollTop=0}
const menuFitSoon=()=>{if(!MFIT.raf)MFIT.raf=requestAnimationFrame(menuFit)};
addEventListener('resize',menuFitSoon);
if(window.visualViewport)visualViewport.addEventListener('resize',menuFitSoon);
// ogni volta che il menu cambia schermata o contenuto
for(const f of['mode','contHTML','owMenu','toMenu','edMenu','crPick','crStep','neoMenu']){if(typeof window[f]!=='function')continue;const f0=window[f];window[f]=function(){const r=f0.apply(this,arguments);menuFitSoon();setTimeout(menuFitSoon,250);setTimeout(menuFitSoon,900);return r}}
// il contenuto può cambiare altezza anche da solo (animazioni d'entrata, icone che arrivano): si ricontrolla quando cambia
if(typeof ResizeObserver!=='undefined'){const w=document.querySelector('#menu .mwrap');if(w){let last='';new ResizeObserver(()=>{const m=$('menu'),k=(m?m.scrollHeight:0)+'|'+innerHeight+'|'+innerWidth;if(k!==last){last=k;menuFitSoon()}}).observe(w)}}
setTimeout(menuFitSoon,60);setTimeout(menuFitSoon,1200);setTimeout(menuFitSoon,3500);
(function(){const st=document.createElement('style');st.textContent=`
.mwrap.crfit{min-height:100%;box-sizing:border-box;padding-top:clamp(6px,2.2vh,18px);padding-bottom:clamp(6px,2.4vh,22px);gap:clamp(6px,1.6vh,14px);margin:0 auto}
.mwrap.crfit #crown{flex:1 1 auto;height:auto!important;min-height:180px}
#menu:has(.mwrap.crfit){align-items:stretch}
.mgrid>.mnew{display:flex;flex-direction:column}.mgrid>.mnew>.dgrid{flex:1 1 auto;grid-auto-rows:1fr}
@media(max-height:620px){.mwrap.crfit .mhead h1{font-size:clamp(34px,9vh,64px)}.mwrap.crfit #crhint{margin:0}}`;document.head.appendChild(st)})();
