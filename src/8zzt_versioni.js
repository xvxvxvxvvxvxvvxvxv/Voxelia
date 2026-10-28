/* ================= 7.43: LE VERSIONI PRECEDENTI =================
   Dal menu (il pulsante «Versioni precedenti» in basso, o la gemma Diamante della Corona) si sceglie una versione vecchia
   del gioco e la si gioca nel browser. C'è solo quando il gioco arriva da un server: è il server a servire le build della
   cartella releases/ all'indirizzo /versioni/<versione>/, e le serve così:
   - solo da soli: la pagina non riceve il collegamento al server e il browser le vieta qualunque connessione
     (Content-Security-Policy connect-src 'none'), quindi niente multigiocatore, chat, arena, scambi o mondi della community;
   - con i salvataggi separati: ogni versione vecchia scrive in una sua parte del salvataggio del browser
     ("voxelia-v<versione>:..."), e non vede né tocca la partita, le impostazioni e i mondi della versione attuale. */
const VSRV=!!window.GAME_WS;
const VER_ST={list:null,err:'',q:''};
function verMenu(){if(!VSRV)return;let el=$('vmenu');if(!el){el=document.createElement('div');el.id='vmenu';el.setAttribute('role','dialog');el.setAttribute('aria-label','Versioni precedenti');document.body.appendChild(el);
    el.addEventListener('click',e=>{if(e.target===el)verClose()})}
  el.hidden=false;verRender();const q=$('vmq');if(q)setTimeout(()=>q.focus(),30);if(!VER_ST.list)fetch('/versioni',{cache:'no-store'}).then(r=>r.ok?r.json():Promise.reject()).then(j=>{VER_ST.list=Array.isArray(j.versioni)?j.versioni:[];VER_ST.err='';verRender()})
    .catch(()=>{VER_ST.err='Il server non ha risposto: riprova tra poco.';verRender()})}
function verClose(){const el=$('vmenu');if(el)el.hidden=true}
function verRender(){const el=$('vmenu');if(!el||el.hidden)return;
  if(!$('vml'))el.innerHTML=`<div class="vmb"><div class="vmh"><h3>Versioni precedenti</h3><button class="vmx" onclick="verClose()" aria-label="Chiudi">✕</button></div>
    <p class="mu">Rigioca Voxelia com'era. Le versioni vecchie si giocano <b>solo da soli</b>: niente multigiocatore e niente funzioni online, che restano nella versione attuale. Ogni versione ha i suoi salvataggi, separati da quelli di adesso.</p>
    <input id="vmq" type="search" placeholder="Cerca una versione (es. 6.10, fazioni, 23 ottobre)" aria-label="Cerca una versione" oninput="VER_ST.q=this.value;verRender()">
    <div class="vml" id="vml"></div><p class="mu vmn" id="vmn"></p></div>`;
  const L=VER_ST.list,q=VER_ST.q.trim().toLowerCase();let rows='';
  if(VER_ST.err)rows=`<p class="vmerr">${esc(VER_ST.err)}</p>`;else if(!L)rows='<p class="mu">Carico l\'elenco…</p>';
  else{const F=L.filter(o=>!q||o.v.includes(q)||String(o.t).toLowerCase().includes(q)||String(o.d).toLowerCase().includes(q));let serie='';
    for(const o of F){const s=o.v.split('.')[0]+'.x';if(s!==serie){serie=s;rows+=`<h4 class="vmser">Versioni ${esc(s)}</h4>`}
      rows+=`<div class="vmit"><span class="vmv">${esc(o.v)}</span><span class="vmt"><b>${esc(o.t||'Versione '+o.v)}</b><small>${esc(o.d||'')}</small></span><a class="vmgo" href="/versioni/${encodeURIComponent(o.v)}/">▶ Gioca</a></div>`}
    if(!F.length)rows='<p class="mu">Nessuna versione trovata.</p>'}
  $('vml').innerHTML=rows;$('vmn').textContent=L?L.length+' versioni · cosa cambia in ognuna è nel menu Novità':''}
addEventListener('keydown',e=>{const el=$('vmenu');if(el&&!el.hidden&&e.key==='Escape'){verClose();e.stopImmediatePropagation()}},true);
// il pulsante nel menu e l'alternativa nella gemma Diamante (solo sul server)
if(VSRV){(function(){const f=document.querySelector('.mfoot');if(f&&!$('verb'))f.insertAdjacentHTML('beforeend',`<button id="verb" onclick="verMenu()">${ico('pergamena',24)||''}<span><b>Versioni precedenti</b><small>Rigioca le versioni vecchie, da solo</small></span></button>`);
  const gm=typeof CRGEM!=='undefined'&&CRGEM.find(g=>g.k==='film');if(gm&&gm.alt&&!gm.alt.some(a=>a[0].includes('Versioni')))gm.alt.push(['🕰 Versioni precedenti',()=>verMenu()])})()}
(function(){const st=document.createElement('style');st.textContent=`
.mfoot{grid-template-columns:repeat(auto-fit,minmax(190px,1fr))!important}
#vmenu{position:fixed;inset:0;z-index:46;display:flex;align-items:center;justify-content:center;background:#000a;padding:max(12px,env(safe-area-inset-top,0px)) max(12px,env(safe-area-inset-right,0px)) max(12px,env(safe-area-inset-bottom,0px)) max(12px,env(safe-area-inset-left,0px))}#vmenu[hidden]{display:none}
.vmb{width:min(620px,96vw);max-height:88vh;display:flex;flex-direction:column;gap:8px;background:linear-gradient(160deg,#141a32,#0a0d1e);color:#e8ecf4;border:2px solid #f5b942;border-radius:6px;padding:12px 16px;box-shadow:0 10px 40px #0009}
.vmh{display:flex;align-items:center;justify-content:space-between;gap:8px}.vmh h3{margin:0}.vmx{margin:0;padding:4px 10px}
.vmb>p{margin:0;font-size:13px;line-height:1.45;color:#c8cfe0}.vmb .mu{color:#aab3c8}.vmh h3{color:#ffd98a}#vmq{width:100%;box-sizing:border-box;padding:8px 10px;font:inherit;background:#0b1022;color:#fff;border:1px solid #f5b94266;border-radius:3px}#vmq::placeholder{color:#8f98ad}
.vml{overflow:auto;min-height:120px;border-top:1px solid #ffffff1a}
.vmser{margin:10px 0 2px;font-size:12px;letter-spacing:1px;text-transform:uppercase;color:#f5b942}
.vmit{display:grid;grid-template-columns:64px 1fr auto;align-items:center;gap:10px;padding:7px 2px;border-bottom:1px solid #ffffff12}
.vmv{font-variant-numeric:tabular-nums;font-weight:bold;color:#ffd98a}.vmt{min-width:0}.vmt b{display:block;font-weight:normal;line-height:1.3}.vmt small{color:#9aa3b8}
.vmgo{white-space:nowrap;padding:6px 12px;border:1px solid #f5b94288;border-radius:3px;background:#2a3350;color:#fff;text-decoration:none}.vmgo:hover,.vmgo:focus-visible{background:#3b4770;outline:2px solid #f5b942}
.vmerr{color:#ff9a8a}.vmn{opacity:.6;font-size:12px}
@media(max-width:480px){.vmit{grid-template-columns:52px 1fr}.vmgo{grid-column:2;justify-self:start}}`;document.head.appendChild(st)})();
