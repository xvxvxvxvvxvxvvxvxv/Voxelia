/* ================= 7.55 → 8.4: LO ZAFFIRO INFRANTO =================
   Nella 7.55 è stata tolta Voxelia Dimension; nella 8.4 è stata tolta anche Aldoria 3026 (la città del futuro, la
   Cronoporta e lo spazio), per concentrare il gioco sulla Storia e su Tomorrow. Sulla Corona lo Zaffiro resta
   spezzato (8zzr_corona.js). Il vecchio codice della Dimension resta nei sorgenti ma nessuna strada ci porta più.
   I salvataggi del 3026 non vengono cancellati dal browser: semplicemente non si aprono più.
   Qui resta lo sblocco delle modalità: Tomorrow si apre a chi ha sconfitto il Re Lich (o ha già una partita). */
const UNL55K='voxelia_unl55';
function unl55(k){if(typeof DEV!=='undefined'&&DEV.on)return true;if(k!=='ow')return false;const f=LS.get(UNL55K,{})||{};if(f[k])return true;
  const s2=LS.get(SAVEK,null),o2=LS.get(OWK,null),ok=!!(s2&&s2.p&&(s2.p.st|0)>=4)||!!(o2&&o2.p);if(ok){f[k]=1;LS.set(UNL55K,f)}return ok}
const UNL55T={ow:'Tomorrow si apre a chi ha finito la Storia: sconfiggi il Re Lich Malakar nella Cittadella del Vuoto.'};
try{const G1=CRGEM.find(q=>q.k==='ow');if(G1){G1.lock=()=>!unl55('ow');G1.lk='🔒 '+UNL55T.ow}}catch(e){}
function menuNote(tx){let el=$('mnote55');if(!el){el=document.createElement('div');el.id='mnote55';document.body.appendChild(el)}el.textContent=tx;el.className='on';clearTimeout(menuNote.t);menuNote.t=setTimeout(()=>{el.className=''},4200);tone(220,.12,'triangle',.04)}
{const m0=mode;mode=function(m){if(m==='dim'||m==='neo')m='';if(m==='ow'&&!unl55(m)){menuNote(UNL55T[m]);return}return m0(m)}}
// in partita: l'annuncio dello sblocco
{const s0=save;save=function(){s0();try{if(!P||!started)return;const f=LS.get(UNL55K,{})||{};
  if(MODE==='story'&&!(typeof OW!=='undefined'&&OW.on)&&(P.st|0)>=4&&!f.ow){f.ow=1;LS.set(UNL55K,f);setTimeout(()=>banner('🌅 Tomorrow si è aperto!','Nel menu della Corona, lo Smeraldo: un mondo nuovo e senza confini','stella'),3000)}}catch(e){}}}
document.head.insertAdjacentHTML('beforeend',`<style>#mnote55{position:fixed;left:50%;bottom:120px;transform:translateX(-50%) translateY(20px);z-index:90;max-width:min(560px,90vw);padding:10px 16px;border-radius:10px;background:rgba(10,12,28,.92);border:1px solid #f5b942;color:#ffe8b0;font:15px Georgia,serif;text-align:center;opacity:0;pointer-events:none;transition:.3s}#mnote55.on{opacity:1;transform:translateX(-50%)}</style>`);
