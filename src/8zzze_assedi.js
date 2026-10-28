/* ================= 7.45: le guerre programmate fra le fazioni =================
   Dal registro (U → 🤝 Fazione → Guerre) il capo, o chi comanda l'esercito, dichiara guerra a un'altra fazione che ha
   una città comune, con un preavviso da 5 minuti a 3 ore. All'ora stabilita comincia l'assedio, per 20 minuti, su un
   campo di battaglia uguale per tutti (le mura, la porta e la piazza della città assediata):
   - gli attaccanti usano le catapulte per aprire brecce nelle mura e nella porta, poi devono tenere la piazza, vicino allo
     stendardo, per 30 secondi senza difensori intorno: se ci riescono prendono il 30% del tesoro della città;
   - i difensori riparano le brecce (2 pietre l'una) e stanno in piazza: finché c'è un difensore la piazza non si prende.
   Allo scadere dei 20 minuti, se la piazza non è caduta, vincono i difensori. Serve il plugin Fazioni 1.1 del server. */
const FZG={L:[],fz:[],ask:0,cd:0,pt:0,off:0};
const fzgMy=()=>FZ.st&&FZ.st.fz?FZ.st.fz.id:null;
const fzgWar=id=>FZG.L.find(g=>g.id===id);
const fzgMine=()=>FZG.L.filter(g=>g.st!=='fine'&&(g.a===fzgMy()||g.d===fzgMy()));
const fzgSide=G=>!G?null:G.a===fzgMy()?'a':G.d===fzgMy()?'d':null;
const fzgNow=()=>Date.now()+(FZG.off||0);
VXP.on('fazioni','guerre',d=>{if(!d||d.w!==twWorld())return;FZG.L=Array.isArray(d.L)?d.L:[];FZG.fz=Array.isArray(d.fz)?d.fz:[];if(d.now)FZG.off=d.now-Date.now();fzgApply();if(PM==='regno'&&RG.tab==='fz')pn('regno')});
VXP.on('fazioni','mura',d=>{if(!d||d.w!==twWorld())return;const G=fzgWar(d.id);if(!G)return;const s=new Set(G.mura||[]);for(const c of d.c||[])s.add(c);for(const c of d.r||[])s.delete(c);G.mura=[...s];if(Zk==='ass:'+G.id)fzgApply()});
setInterval(()=>{try{if(started&&fzOn()&&Date.now()-FZG.ask>15000){FZG.ask=Date.now();fzSend('guerre')}fzgHud()}catch(_){}},1000);
// il campo di battaglia: uguale per tutti, nato dal numero della guerra
function fzgZone(G){const k='ass:'+G.id;if(!Z[k])Z[k]={n:'Assedio di '+G.cn,lv:Math.max(1,(P&&P.lv)|0),N:48,ass:G.id,a:'#6f9a52',b:'#679250',o:'#2f6b2a',bg:'#9fd0f0',mus:'boss',pt:'leaf',c:0};SKY[k]=SKY[k]||SKY.forest||SKY.town;return k}
function fzgGo(id){const G=fzgWar(id);if(!G||G.st==='fine')return;cl();FZG.from=Zk;const k=fzgZone(G);irisGo(()=>load(k,FZG.from))}
const _genWild744g=genWild;genWild=function(z){if(!z.ass)return _genWild744g(z);const r=sd(hs('assedio|'+z.ass)),c=N>>1,R2=13;z.walls=[];
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const edge=!x||!y||x===N-1||y===N-1||(r()<.04&&Math.hypot(x-c,y-c)>R2+4);M[y][x]=edge?1:0;if(edge)DEC[y][x]='T'}
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const d=Math.hypot(x+.5-c,y+.5-c);if(d>=R2-.5&&d<R2+.6){M[y][x]=1;DEC[y][x]='W';z.walls.push(x+','+y)}else if(d<R2-.5){if(DEC[y][x]==='T'){M[y][x]=0;DEC[y][x]=''}}}
  // la porta a sud, chiusa: si abbatte come le mura
  for(let x=c-1;x<=c+1;x++){const y=Math.round(c+R2);if(M[y]&&M[y][x]===1)DEC[y][x]='G'}
  // dentro: la piazza lastricata, qualche casa di legno, casse e botti
  for(let y=c-3;y<=c+3;y++)for(let x=c-3;x<=c+3;x++){M[y][x]=0;DEC[y][x]=''}
  for(let i=0;i<10;i++){const a=r()*6.283,d=5+r()*5,x=Math.round(c+Math.cos(a)*d),y=Math.round(c+Math.sin(a)*d);if(M[y][x]===0&&Math.hypot(x-c,y-c)>4){M[y][x]=6;DEC[y][x]=r()<.5?'k':'b'}}
  ents.push({k:'asb44',px:c+.5,py:c+.5,n:'Stendardo di '+z.n.replace('Assedio di ','')});
  for(const[a,d]of[[Math.PI/2,R2+5],[Math.PI/2-.55,R2+5],[Math.PI/2+.55,R2+5]]){const x=Math.round(c+Math.cos(a)*d),y=Math.round(c+Math.sin(a)*d);M[y][x]=0;ents.push({k:'cata44',px:x+.5,py:y+.5,n:'Catapulta'})}
  ents.push(Object.assign(po(c,N-3,FZG.from||'tw:0,0',{st:'exit',n:'Lascia l\'assedio'}),{assEx:1}));
  const G=fzgWar(z.ass),side=fzgSide(G);return side==='d'?[c,c+2]:[c,N-5]};
// le brecce: le caselle di mura abbattute diventano macerie (si passa), e si riparano
function fzgApply(){if(!ZZ||!ZZ.ass)return;const G=fzgWar(ZZ.ass);if(!G)return;const br=new Set(G.mura||[]);for(const key of ZZ.walls||[]){const[x,y]=key.split(',').map(Number);const broken=br.has(key);
    if(broken&&M[y][x]===1){M[y][x]=0;DEC[y][x]='ç';if(!ents.some(e=>e.k==='rub44'&&e.key===key))ents.push({k:'rub44',key,px:x+.5,py:y+.5,n:'Breccia'})}
    else if(!broken&&M[y][x]!==1){if(Math.hypot(P.px-x-.5,P.py-y-.5)<.8)continue;M[y][x]=1;DEC[y][x]=Math.abs(x-(N>>1))<=1&&y>(N>>1)?'G':'W';ents=ents.filter(e=>!(e.k==='rub44'&&e.key===key))}}}
const _loadPost744g=loadPost;loadPost=function(k){_loadPost744g(k);if(ZZ&&ZZ.ass){fzgApply();const G=fzgWar(ZZ.ass),s=fzgSide(G);if(s==='d'){const c=N>>1;P.px=c+.5;P.py=c+2.5;camX=PX(P.px,P.py);camY=PY(P.px,P.py,10)}setTimeout(()=>banner('⚔ '+ZZ.n,s==='a'?'Abbatti le mura con le catapulte e tieni la piazza per 30 secondi':s==='d'?'Ripara le brecce e resta in piazza: finché ci sei, la piazza non cade':'Guardi la battaglia da spettatore','spade'),900)}};
const _wall744g=wall;wall=function(x,y,h){const z=ZZ;if(!z||!z.ass){_wall744g(x,y,h);return}const d=DEC[y][x];
  if(d==='T'){box(x+.35,y+.35,0,.3,.3,14,'#6b4a2b');box(x+.05,y+.05,12,.9,.9,12,z.o,.85+h*.3);box(x+.25,y+.25,24,.5,.5,8,z.o,1.1);return}
  if(d==='G'){box(x,y,0,1,1,34,'#6a4a2a',.9);box(x+.1,y+.9,4,.8,.12,26,'#4a3018');box(x,y,34,1,1,4,'#3a3a40');return}
  box(x,y,0,1,1,30,'#8a8a92',.88+h*.12);if((x+y)%2===0)box(x+.15,y+.15,30,.7,.7,7,'#7a7a82')};
// le catapulte (degli attaccanti), le brecce (che ripara chi difende) e lo stendardo
ITK.add('cata44');ITK.add('rub44');ITK.add('asb44');
function fzgFire(e){const G=fzgWar(ZZ.ass);if(!G||G.st!=='corso'){msg(G&&G.st==='attesa'?'L\'assedio non è ancora cominciato':'L\'assedio è finito');return}if(fzgSide(G)!=='a'){msg('Le catapulte sono degli attaccanti');return}
  if(FZG.cd>Date.now()){msg('La catapulta si sta ricaricando');return}FZG.cd=Date.now()+3500;const br=new Set(G.mura||[]),c=N>>1;
  // il bersaglio: il pezzo di mura intatto più vicino alla catapulta, poi i due accanto
  let best=null,bd=1e9;for(const key of ZZ.walls||[]){if(br.has(key))continue;const[x,y]=key.split(',').map(Number);const d=Math.hypot(x-e.px,y-e.py);if(d<bd){bd=d;best=[x,y]}}if(!best){msg('Le mura sono già tutte abbattute');return}
  const hit=[best[0]+','+best[1]];for(const key of ZZ.walls){if(hit.length>=3)break;if(br.has(key)||hit.includes(key))continue;const[x,y]=key.split(',').map(Number);if(Math.abs(x-best[0])+Math.abs(y-best[1])===1)hit.push(key)}
  tone(140,.3,'sawtooth',.06);whoosh();fx.push({k:'warn',x:best[0]+.5,y:best[1]+.5,r:1.4,t:.9,mx:.9,dmg:0,pup:1});
  setTimeout(()=>{if(!ZZ||!ZZ.ass)return;fx.push({k:'boom',x:best[0]+.5,y:best[1]+.5,r:1.8,t:.4});shake(.5);G.mura=[...new Set((G.mura||[]).concat(hit))];fzgApply();fzSend('colpo',{id:G.id,c:hit})},900)}
function fzgFix(e){const G=fzgWar(ZZ.ass);if(!G||G.st!=='corso'||fzgSide(G)!=='d'){msg(fzgSide(G)==='a'?'È una breccia: passaci per arrivare in piazza!':'Solo i difensori riparano le mura');return}
  if((P.res.pietra|0)<2){msg('Servono 2 pietre per riparare la breccia');tone(150,.1);return}if(Math.hypot(P.px-e.px,P.py-e.py)<.8){msg('Spostati dalla breccia per ripararla');return}
  P.res.pietra-=2;G.mura=(G.mura||[]).filter(c=>c!==e.key);fzgApply();fzSend('ripara',{id:G.id,c:e.key});tone(420,.08,'triangle');msg('Breccia riparata');hud()}
const _act744g=act;act=function(e){if(e&&e.k==='cata44'){fzgFire(e);return}if(e&&e.k==='rub44'){fzgFix(e);return}if(e&&e.k==='asb44'){const G=fzgWar(ZZ.ass);PA={ti:'🚩 '+e.n,tx:G?('Assedio: '+G.an+' contro '+G.dn+'.\nPiazza presa: '+Math.round((G.presa||0)/30*100)+'%.\n\nGli attaccanti devono restare qui vicino 30 secondi senza difensori intorno.'):''};pn('txt');return}
  if(e&&e.k==='po'&&e.assEx){const to=FZG.from||'tw:0,0';irisGo(()=>load(to,Zk));return}_act744g(e)};
// la presa della piazza: chi attacca, vicino allo stendardo, la manda al server ogni due secondi
const _upd744g=upd;upd=function(dt){_upd744g(dt);if(!ZZ||!ZZ.ass||!started)return;const G=fzgWar(ZZ.ass);if(!G||G.st!=='corso'||fzgSide(G)!=='a')return;if(Date.now()-FZG.pt<2000)return;const c=(N>>1)+.5;
  if(Math.hypot(P.px-c,P.py-c)>3.5||P.hp<=0)return;FZG.pt=Date.now();const dif=NET.list.filter(o=>o.fzid===G.d&&Math.hypot(o.px-c,o.py-c)<4.5).length;fzSend('presa',{id:G.id,dif:dif?1:0});if(dif)flt(P,'Ci sono difensori in piazza!','#ff8a5a')};
// presenza: la fazione di ognuno (serve per sapere se in piazza c'è un difensore)
{const sp0=syncPack;syncPack=function(){const o=sp0()||{};if(ZZ&&ZZ.ass&&fzgMy())o.fzid=fzgMy();return o}}
{const nt0=netTick;netTick=function(dt){nt0(dt);if(!ZZ||!ZZ.ass)return;for(const o of NET.list){const q=NET.peers[o.id];if(q)o.fzid=q.fzid||null}}}
// i disegni: catapulta, macerie, stendardo con la barra della presa
const _ent744g=ent;ent=function(e){if(e.k==='cata44'){const k=Math.max(0,(FZG.cd-Date.now())/3500),a=k>0?14:30;drawL([[-.4,-.3,4,.8,.6,4,'#7a5a3a'],[-.45,-.35,0,.12,.12,6,'#3a2a1a'],[.33,-.35,0,.12,.12,6,'#3a2a1a'],[-.45,.23,0,.12,.12,6,'#3a2a1a'],[.33,.23,0,.12,.12,6,'#3a2a1a'],
      [-.1,-.25,8,.2,.5,16,'#6a4a2a'],[-.05,-.05,24,.1,.1,a,'#8a6a42'],[-.14,-.14,24+a,.28,.28,6,'#5a4a3a'],[-.08,-.08,30+a,.16,.16,5,'#8a8a90']],e.px,e.py,0);return}
  if(e.k==='rub44'){drawL([[-.4,-.3,0,.35,.3,5,'#7a7a82'],[.05,-.2,0,.3,.35,7,'#8a8a92'],[-.2,.1,0,.3,.25,4,'#6a6a72']],e.px,e.py,0);return}
  if(e.k==='asb44'){const G=fzgWar(ZZ&&ZZ.ass),p=G?Math.min(1,(G.presa||0)/30):0,w=Math.sin(t*3)*.04;drawL([[-.04,-.04,0,.08,.08,60,'#5a4a3a'],[.04,-.02+w,34,.5,.04,22,'#3a5a9a'],[.1,-.03+w,40,.3,.03,10,'#d4af37'],[-.3,-.3,0,.6,.6,2,'#9a8a6a']],e.px,e.py,0);
    if(p>0){box(e.px-.5,e.py-.5,64,1,.08,4,'#2a2a2a');box(e.px-.5,e.py-.5,68,p,.08,3,'#ff5a3a',1.3)}return}
  _ent744g(e)};
// in alto: la guerra in programma o in corso, con il tempo che manca e il pulsante per andarci
function fzgHud(){let el=$('war44');const L=typeof twOn==='function'&&twOn()?fzgMine():[];const inAss=!!(ZZ&&ZZ.ass),G=inAss?fzgWar(ZZ.ass):L[0];
  if(!G||!started||G.st==='fine'&&!inAss){if(el)el.hidden=true;return}if(!el){el=document.createElement('div');el.id='war44';document.body.appendChild(el)}el.hidden=false;
  const now=fzgNow(),mm=s=>{s=Math.max(0,Math.round(s/1000));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')},side=fzgSide(G);
  const tx=G.st==='attesa'?`⚔ Assedio di ${esc(G.cn)} fra <b>${mm(G.at-now)}</b> · ${esc(G.an)} contro ${esc(G.dn)}`:G.st==='corso'?`⚔ Assedio di ${esc(G.cn)} · <b>${mm(G.end-now)}</b> · piazza presa ${Math.round((G.presa||0)/30*100)}% · brecce ${(G.mura||[]).length}`:
    G.win==='a'?`🏴 ${esc(G.an)} ha preso ${esc(G.cn)}${G.bot?' · bottino '+G.bot+'💰':''}`:`🛡 ${esc(G.dn)} ha respinto l'assedio`;
  const k=tx+'|'+inAss;if(el.dataset.k===k)return;el.dataset.k=k;el.innerHTML=tx+(G.st!=='fine'&&!inAss&&side?` <button onclick="fzgGo('${G.id}')">${G.st==='corso'?'Vai all\'assedio':'Il campo'}</button>`:'')}
// nel pannello della fazione: le guerre e la dichiarazione
{const f0=fzHTML;fzHTML=function(){let h=f0();if(!FZ.ok||!FZ.st||!FZ.st.fz)return h;const F=FZ.st.fz,me=FZ.st.me,can=me&&(me.r==='capo'||(me.p||[]).includes('esercito'));
  const act=FZG.L.filter(g=>g.st!=='fine'||fzgNow()-g.end<3600000),oth=FZG.fz.filter(f=>f.id!==F.id&&f.citta);
  let s=`<div class="rgcard"><div><b>⚔ Guerre</b><p class="mu">Si dichiara guerra a una fazione con una città comune. All'ora stabilita c'è l'assedio: 20 minuti, catapulte, brecce da riparare e la piazza da tenere. Chi vince prende il 30% del tesoro.</p>`;
  s+=act.length?act.map(g=>`<p>• ${esc(g.an)} contro ${esc(g.dn)} · ${esc(g.cn)} · ${g.st==='attesa'?'fra '+Math.ceil((g.at-fzgNow())/60000)+' min':g.st==='corso'?'<b>in corso</b>':g.win==='a'?'vinta dagli attaccanti':'vinta dai difensori'} ${g.st!=='fine'&&(g.a===F.id||g.d===F.id)?`<button onclick="fzgGo('${g.id}')">Vai</button>`:''}</p>`).join(''):'<p class="mu">Nessuna guerra in vista.</p>';
  if(can)s+=oth.length?`<div class="srow"><select id="fzgT">${oth.map(f=>`<option value="${esc(f.id)}">${esc(f.n)} · ${esc(f.citta.n)}</option>`).join('')}</select><select id="fzgM">${[5,15,30,60,120].map(m=>`<option value="${m}" ${m===15?'selected':''}>fra ${m} minuti</option>`).join('')}</select><button onclick="fzgDeclare()">⚔ Dichiara guerra</button></div>`:'<p class="mu">Nessun\'altra fazione ha una città comune da assediare.</p>';
  s+='</div></div>';const i=h.lastIndexOf('</div>');return i<0?h+s:h.slice(0,i)+s+h.slice(i)}}
function fzgDeclare(){const t2=$('fzgT'),m=$('fzgM');if(!t2)return;const f=FZG.fz.find(q=>q.id===t2.value);if(!f||!confirm('Dichiarare guerra a '+f.n+'? L\'assedio di '+f.citta.n+' comincerà fra '+m.value+' minuti.'))return;fzSend('guerra',{id:f.id,min:+m.value});FZG.ask=0}
(function(){const st=document.createElement('style');st.textContent=`#war44{position:fixed;left:50%;top:66px;transform:translateX(-50%);z-index:31;font:13px Georgia,serif;color:#ffe8c8;background:rgba(60,14,10,.85);border:1px solid #ff8a5a;border-radius:12px;padding:4px 12px;display:flex;gap:8px;align-items:center;max-width:94vw}
#war44 button{font:12px system-ui,sans-serif;padding:2px 8px;margin:0}body:not(.ig) #war44{display:none}`;document.head.appendChild(st)})();
