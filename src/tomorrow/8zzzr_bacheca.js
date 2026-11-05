/* ================= 7.48: la bacheca delle missioni dei giocatori (Tomorrow) =================
   Nelle città di Tomorrow c'è la Bacheca delle missioni: gli eroi dello stesso mondo si chiedono aiuto a vicenda.
   - Appendi una missione: una CONSEGNA («portami 20 legna») o una CACCIA («abbatti 10 lupi»), con un premio in oro che il
     server tiene da parte finché qualcuno non la porta a termine (se nessuno la prende in tre giorni, l'oro torna a te).
   - Prendi la missione di un altro: per la consegna bastano le risorse nello zaino, per la caccia il gioco conta le
     creature che abbatti. Finito, ritiri il premio dalla bacheca; le risorse arrivano al committente anche se è offline.
   Serve il server con il plugin «bacheca». */
XSV.add('bac48');
const BAC={L:null,pend:null,tab:'aperte',f:{k:'consegna',r:'legna',n:10,g:100},ok:0};
const BACR=['legna','pietra','ferro','grano','mela','uova','rame','carbone','argilla','marmo','conchiglia','rosa'];
const BACE=()=>['lupo','goblin','slime','scheletro','ragno','sciacallo','scorpione','zombie','orso','cinghiale','lupo_gelo','yeti','mummia','pipistrello','ratto','granchio'].filter(k=>E[k]);
const bacFix=()=>{P.bac48=P.bac48||{c:{}};P.bac48.c=P.bac48.c||{};return P.bac48};
const bacNet=()=>typeof NET!=='undefined'&&NET.ok&&typeof VXP!=='undefined';
const bacSend=(e,d)=>{if(bacNet())VXP.send('bacheca',e,d||{})};
if(typeof VXP!=='undefined'){VXP.on('bacheca','list',d=>{BAC.ok=1;BAC.L=d&&Array.isArray(d.L)?d.L:[];BAC.pend=d&&d.pend;const c=bacFix().c;for(const id in c)if(!BAC.L.some(m=>m.id===id&&m.presa&&m.st==='presa'))delete c[id];if(PM==='bac48')pn('bac48')});
  VXP.on('bacheca','posted',d=>{const g=d&&+d.g|0;if(g>0){P.g=Math.max(0,P.g-g);hud();save();msg('Missione appesa: il premio di '+g+' monete lo tiene la bacheca')}});
  VXP.on('bacheca','paid',d=>{if(!d)return;if(d.k==='consegna'&&P.res)P.res[d.r]=Math.max(0,(P.res[d.r]|0)-(d.n|0));delete bacFix().c[d.id];banner('Missione compiuta!','+'+(d.g|0)+' monete','corona');jingle([60,64,67,72],.09,'triangle');save();hud()});
  VXP.on('bacheca','pacco',d=>{if(!d||!d.res)return;const L=[];for(const k in d.res){const n=Math.max(0,d.res[k]|0);if(!n)continue;P.res[k]=(P.res[k]|0)+n;L.push(n+' '+(RESN[k]||k))}if(L.length){banner('La tua missione è compiuta','Dalla bacheca: '+L.join(', '),'stella');save();hud()}})}
// le vittime delle cacce in corso (anche le varianti di Tomorrow contano: «tw.lupo.x» è un lupo)
const bacBase=t=>{const m=/^tw\.([a-z_0-9]+)\./.exec(String(t));return m?m[1]:(E[t]&&E[t].base)||t};
const _kill748r=kill;kill=function(e){const ty=e&&e.k==='en'&&ents.includes(e)?bacBase(e.t):null;_kill748r(e);if(!ty||!BAC.L||!P.bac48)return;
  for(const m of BAC.L)if(m.presa&&m.st==='presa'&&m.k==='caccia'&&m.r===ty){const c=bacFix().c;c[m.id]=Math.min(m.n,(c[m.id]|0)+1);flt(P,'📌 '+c[m.id]+'/'+m.n,'#ffe08a');if(c[m.id]===m.n)msg('Caccia finita: ritira il premio alla bacheca')}};
function bacPost(){const f=BAC.f,n=clamp(Math.round(+f.n||0),1,200),g=clamp(Math.round(+f.g||0),10,50000);if(P.g<g){msg('Non hai abbastanza oro per il premio');tone(150,.1);return}
  const rn=f.k==='consegna'?'Consegna '+n+' '+(RESN[f.r]||f.r):'Abbatti '+n+' '+((E[f.r]&&E[f.r].n)||f.r);bacSend('post',{k:f.k,r:f.r,n,g,rn});BAC.tab='mie'}
function bacDone(id){const m=BAC.L&&BAC.L.find(q=>q.id===id);if(!m)return;if(m.k==='consegna'&&(P.res[m.r]|0)<m.n){msg('Ti servono '+m.n+' '+(RESN[m.r]||m.r));tone(150,.1);return}
  if(m.k==='caccia'&&(bacFix().c[id]|0)<m.n){msg('La caccia non è finita');return}bacSend('done',{id})}
X43P.bac48=()=>{let h=`<h3>📌 Bacheca delle missioni · 💰${P.g}</h3>`;
  if(!bacNet())return h+`<p class="mu">La bacheca è dei giocatori: serve la partita in rete, con il plugin «bacheca» sul server.</p><button onclick="cl()">Chiudi</button>`;
  if(!BAC.L){bacSend('list');setTimeout(()=>{if(PM==='bac48'&&!BAC.L){BAC.L=[];BAC.no=1;pn('bac48')}},3000);return h+`<p class="mu">Leggo la bacheca…</p><button onclick="cl()">Chiudi</button>`}
  if(BAC.no&&!BAC.ok)return h+`<p class="mu">Il server non ha il plugin «bacheca».</p><button onclick="cl()">Chiudi</button>`;
  const L=BAC.L,T={aperte:'Da fare',prese:'Le tue imprese',mie:'Le tue richieste',nuova:'✚ Nuova'},c=bacFix().c;
  h+=`<div class="srow">${Object.keys(T).map(k=>`<button class="${BAC.tab===k?'on':''}" onclick="BAC.tab='${k}';pn('bac48')">${T[k]}${k==='aperte'?' · '+L.filter(m=>m.st==='aperta'&&!m.mia).length:''}</button>`).join('')}</div>`;
  const row=(m,b)=>`<div class="x43r"><span><b>${esc(m.rn)}</b> <small class="mu">· ${m.g} 💰 · da ${esc(m.o)}${m.st==='presa'&&!m.presa?' · presa da '+esc(m.by):''}${m.st==='fatta'?' · ✔ fatta'+(m.by?' da '+esc(m.by):''):''}</small></span><span>${b||''}</span></div>`;
  if(BAC.tab==='aperte'){const A=L.filter(m=>m.st==='aperta'&&!m.mia);h+=A.length?A.map(m=>row(m,`<button onclick="bacSend('take',{id:'${m.id}'})">Prendila</button>`)).join(''):'<p class="mu">Nessuna missione da fare: torna più tardi, o appendine una tu.</p>'}
  else if(BAC.tab==='prese'){const A=L.filter(m=>m.presa&&m.st==='presa');h+=A.length?A.map(m=>{const ok=m.k==='consegna'?(P.res[m.r]|0)>=m.n:(c[m.id]|0)>=m.n,pr=m.k==='consegna'?(P.res[m.r]|0)+'/'+m.n+' nello zaino':(c[m.id]|0)+'/'+m.n+' abbattuti';
      return row(m,`<small class="mu">${pr}</small> <button ${ok?'':'disabled'} onclick="bacDone('${m.id}')">${m.k==='consegna'?'Consegna':'Ritira il premio'}</button> <button onclick="bacSend('drop',{id:'${m.id}'})">Rinuncia</button>`)}).join(''):'<p class="mu">Non hai missioni in corso.</p>'}
  else if(BAC.tab==='mie'){const A=L.filter(m=>m.mia);h+=A.length?A.map(m=>row(m,m.st==='aperta'?`<button onclick="bacSend('cancel',{id:'${m.id}'})">Ritira (ti torna l'oro)</button>`:'')).join(''):'<p class="mu">Non hai appeso nessuna missione.</p>'}
  else{const f=BAC.f,opt=(L2,v,lab)=>L2.map(k=>`<option value="${k}" ${k===v?'selected':''}>${esc(lab(k))}</option>`).join('');
    h+=`<div class="bac48f"><label>Tipo <select onchange="BAC.f.k=this.value;BAC.f.r=this.value==='caccia'?BACE()[0]:'legna';pn('bac48')"><option value="consegna" ${f.k==='consegna'?'selected':''}>Consegna di risorse</option><option value="caccia" ${f.k==='caccia'?'selected':''}>Caccia</option></select></label>
      <label>${f.k==='caccia'?'Creatura':'Risorsa'} <select onchange="BAC.f.r=this.value">${f.k==='caccia'?opt(BACE(),f.r,k=>E[k].n):opt(BACR,f.r,k=>RESN[k]||k)}</select></label>
      <label>Quante <input type="number" min="1" max="200" value="${f.n}" onchange="BAC.f.n=this.value" onkeydown="event.stopPropagation()"></label><label>Premio 💰 <input type="number" min="10" max="50000" value="${f.g}" onchange="BAC.f.g=this.value" onkeydown="event.stopPropagation()"></label></div>
      <p class="x43t">Il premio lo tiene la bacheca finché qualcuno non porta a termine la missione; se nessuno la prende in tre giorni, ti torna.</p><button onclick="bacPost()">📌 Appendi la missione</button>`}
  return h+`<button onclick="BAC.L=null;pn('bac48')">↻ Aggiorna</button><button onclick="cl()">Chiudi</button>`};
function bacPlace(){if(!ZZ||!started||!(typeof twOn==='function'&&twOn()&&ZZ.set&&ZZ.shub)||ents.some(e=>e.k==='bac48'))return;const q=spot47([ZZ.shub[0],ZZ.shub[1]-5],2);if(q)ents.push({k:'bac48',px:q[0]+.5,py:q[1]+.5,n:'Bacheca delle missioni'})}
const _loadPost748r=loadPost;loadPost=function(k){_loadPost748r(k);try{bacPlace()}catch(e){console.warn('bacheca',e)}};
ITK.add('bac48');
const _act748r=act;act=function(e){if(e&&e.k==='bac48'){BAC.L=null;BAC.no=0;pn('bac48');return}_act748r(e)};
const _ent748r=ent;ent=function(e){if(e.k==='bac48'){const n=BAC.L?BAC.L.filter(m=>m.st==='aperta').length:2;drawL([[-.45,-.06,0,.07,.1,26,'#6a4a2a'],[.38,-.06,0,.07,.1,26,'#6a4a2a'],[-.5,-.08,9,1,.08,18,'#a87a4a'],[-.5,-.1,27,1,.12,3,'#7a5a32']],e.px,e.py,0);
  for(let i=0;i<Math.min(6,n);i++)box(e.px-.4+(i%3)*.28,e.py-.11,11+Math.floor(i/3)*8,.2,.02,6,['#f4ecd0','#ffe8a0','#e8f0ff'][i%3]);return}_ent748r(e)};
(function(){const st=document.createElement('style');st.textContent=`.bac48f{display:grid;grid-template-columns:1fr 1fr;gap:6px 10px;margin:8px 0}.bac48f label{display:flex;flex-direction:column;font-size:13px;gap:3px}.bac48f select,.bac48f input{padding:4px}`;document.head.appendChild(st)})();
