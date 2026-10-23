/* ================= 7.28: LA GESTIONE DEL BORGO =================
   Il tuo insediamento ora vive di risorse. Per costruire non bastano più le monete: servono legna, pietra, argilla e ferro,
   che si raccolgono nelle terre di Tomorrow (rocce, cave d'argilla, vene di ferro, legna) o si producono nel borgo con la
   segheria e la cava. Nel registro (U → Insediamento) ci sono le statistiche: abitanti, cibo, acqua, monete, potenza
   dell'esercito e materiali, con quanto si produce e quanto si consuma ogni giorno.
   Ogni giorno gli abitanti mangiano e bevono. Il cibo viene dalla fattoria, dal granaio, dai campi seminati con l'editor e da
   quello che porti tu; l'acqua dalla cisterna, dai pozzi, dalle fontane e dal fiume se c'è. Se per due giorni il cibo o
   l'acqua non bastano, una parte degli abitanti se ne va; torna solo quando il borgo ha di nuovo abbastanza da mangiare e
   da bere. Con le case libere e le scorte piene arrivano abitanti nuovi; più abitanti, più tasse e più gente per le strade. */
Object.assign(RESN,{pietra:'Pietra',argilla:'Argilla',ferro:'Ferro'});Object.assign(RESP,{pietra:5,argilla:5,ferro:12});
Object.assign(RESM,{
  pietra:()=>[[-.24,-.16,0,.28,.24,9,'#8a8a90'],[0,-.08,0,.22,.22,13,'#9a9aa2'],[-.12,.08,0,.2,.16,6,'#7a7a82'],[-.02,-.04,13,.12,.12,2,'#b0b0b8']],
  argilla:()=>[[-.22,-.12,0,.24,.2,6,'#a8603a'],[.02,-.06,0,.2,.18,8,'#b8704a'],[-.08,.08,0,.18,.14,5,'#9a5432'],[0,-.02,8,.1,.08,1.5,'#d8906a',1.1]],
  ferro:()=>[[-.24,-.16,0,.3,.26,11,'#5a5a62'],[.02,-.08,0,.22,.22,14,'#4a4a52'],[-.16,-.1,6,.08,.02,3,'#c06a3a',1.1],[.08,-.08,9,.06,.02,3,'#d8d8e0',1.3],[-.02,.02,14,.1,.1,2,'#6a6a72']]});
const SETMAT=['legna','pietra','argilla','ferro'],SETMI={legna:'🪵',pietra:'🪨',argilla:'🧱',ferro:'⛓',g:'💰'};
// i materiali si trovano nelle terre selvagge, ognuno dove è più comune
for(const[b,L]of[['prato',['pietra','argilla']],['bosco',['pietra','ferro','legna']],['deserto',['pietra','argilla']],['neve',['pietra','ferro']],['cenere',['ferro','pietra']]])if(TWRES[b])TWRES[b].push(...L);
if(typeof twGenExtra==='function'){const _ge728=twGenExtra;twGenExtra=function(C,spot,C2){_ge728(C,spot,C2);const{rnd,rr,bio,tg,z}=C;if(z.vil||z.city)return;
  const M2={prato:['pietra','argilla','legna','pietra'],bosco:['legna','legna','pietra','ferro'],deserto:['pietra','argilla','pietra'],neve:['pietra','ferro','pietra'],cenere:['ferro','pietra','ferro']}[bio]||['pietra'];
  for(let i=0,n=rr(4,7);i<n;i++){const q=spot(5,30);if(!q)continue;const r=M2[Math.floor(rnd()*M2.length)];C.F(q[0],q[1],'');ents.push({k:'res',r,n:RESN[r],px:q[0]+.5,py:q[1]+.5});tg.push(q)}}}
// raccogliere i materiali dà da 1 a 3 pezzi
const _gather728=gather;gather=function(e){const r=e&&e.r;_gather728(e);if(!SETMAT.includes(r))return;const x=r==='ferro'?Math.floor(Math.random()*2):1+Math.floor(Math.random()*2);if(x>0){P.res[r]=(P.res[r]|0)+x;flt(e,'+'+x+' '+RESN[r],'#ffe08a');hud()}};
/* ---- gli edifici nuovi e i costi in risorse ---- */
Object.assign(TWSB,{
  pozzo:{n:'Cisterna',ic:'💧',d:'Acqua per il borgo ogni giorno, e scorte più grandi',max:3,cost:l=>[100*l,0]},
  fattoria:{n:'Fattoria',ic:'🌾',d:'Campi e bestiame: cibo per il borgo ogni giorno',max:3,cost:l=>[120*l,0]},
  segheria:{n:'Segheria',ic:'🪚',d:'Produce legna ogni giorno, nel magazzino del borgo',max:3,cost:l=>[150*l,0]},
  cava:{n:'Cava',ic:'⛏',d:'Produce pietra e un po\' d\'argilla ogni giorno',max:3,cost:l=>[150*l,0]}});
TWSB.granaio.d='Scorte di cibo più grandi e un po\' di raccolto ogni giorno';TWSB.casa.d='Più case: più abitanti e un borgo più grande';
SETBA.push('pozzo','fattoria','segheria','cava');for(const k of['pozzo','fattoria','segheria','cava'])SEDND.add(k);
Object.assign(SEDK,{pozzo:'casa',fattoria:'casa',segheria:'casa',cava:'casa'});Object.assign(SEDKN,{pozzo:'💧 Cisterna',fattoria:'🌾 Fattoria',segheria:'🪚 Segheria',cava:'⛏ Cava'});
const SETCO={casa:l=>({g:200*l,legna:10*l,pietra:6*l,argilla:6*l}),mercato:l=>({g:180*l,legna:8*l,argilla:6*l}),fucina:l=>({g:200*l,pietra:10*l,ferro:4*l}),
  tempio:l=>({g:220*l,pietra:12*l,argilla:4*l}),locanda:l=>({g:160*l,legna:10*l,argilla:6*l}),stalla:l=>({g:120*l,legna:10*l}),granaio:l=>({g:120*l,legna:8*l,argilla:4*l}),
  mura:l=>({g:120*l,legna:16*l}),torre:l=>({g:200*l,pietra:12*l,ferro:3*l}),pozzo:l=>({g:100*l,pietra:8*l}),fattoria:l=>({g:120*l,legna:6*l,argilla:4*l}),
  segheria:l=>({g:150*l,legna:6*l,pietra:4*l,ferro:1*l}),cava:l=>({g:150*l,legna:8*l,ferro:2*l})};
const SETBC={pozzo:['#9aa2ac','#3a6a9a'],fattoria:['#d8b878','#a8402f'],segheria:['#8a6a4a','#5a3a2a'],cava:['#9a9284','#6a6a72']};
// accanto agli edifici di lavoro, quello che serve al lavoro
function setBProps(C,b){const T=TB[TB.length-1];if(T&&SETBC[b.k]){if(!b.wall){T.wall=SETBC[b.k][0];T.roof=SETBC[b.k][1]}T.ht=b.ht||({pozzo:18,fattoria:30,segheria:24,cava:20}[b.k])}
  const pr={pozzo:['W','ʬ'],fattoria:['g','q','y','E'],segheria:['L','L','m'],cava:['u','u','k']}[b.k];if(!pr)return;let n=0;
  for(const[x,y]of[[b.x-1,b.y+b.h-1],[b.x+b.w,b.y+b.h-1],[b.x-1,b.y],[b.x+b.w,b.y]]){if(n>=pr.length||!C.ok(x,y)||M[y][x]!==0)continue;const d=DEC[y][x]||'';if(d===DN+'4'||d===DN+'1')continue;M[y][x]=6;DEC[y][x]=pr[n++];C.res(x,y)}}
/* ---- le statistiche e il giorno del borgo ---- */
function setFix(S){S=S||(P.tw&&P.tw.set);if(!S)return S;if(S.pop==null){S.pop=Math.max(3,Math.round(setCap(S)*.6));S.cibo=(S.food|0)+20;S.acqua=20;S.food=0}
  S.via=S.via|0;S.fame=S.fame|0;S.mag=S.mag||{};S.log=S.log||[];return S}
function setCount(S,cs){const Ly=S.lay;let n=0;if(Ly&&Ly.d)for(const k in Ly.d)if(cs.includes(Ly.d[k]))n++;return n}
function setCap(S){const Ly=S.lay,nc=Ly&&Ly.b?Ly.b.filter(b=>b.k==='casa').length:2+(S.lv|0)*2;return nc*4+setB('locanda')*2+2}
function setStats(S){S=S||P.tw.set;const crops=S.lay?setCount(S,['g','q','v']):(S.dec&&S.dec.giardino?5:0),wells=setCount(S,['W','ʬ']),zam=setCount(S,['U']),fo=S.lay&&S.lay.p?S.lay.p.length:(S.dec&&S.dec.fontana?1:0);
  const pop=S.pop|0,st={pop,cap:setCap(S),fp:2+setB('fattoria')*7+setB('granaio')*2+Math.floor(crops/3),fc:Math.ceil(pop*.8),wp:3+setB('pozzo')*8+wells*3+fo*6+zam*2+(S.riv?4:0),wc:Math.ceil(pop*.8),
    fcap:40+setB('granaio')*40+setB('fattoria')*10,wcap:40+setB('pozzo')*40,tax:pop*6+setB('mercato')*30+setB('locanda')*10,prod:{},crops,wells:wells+fo+zam};
  if(setB('segheria'))st.prod.legna=setB('segheria')*4;if(setB('cava')){st.prod.pietra=setB('cava')*3;st.prod.argilla=setB('cava')}
  st.pow=typeof setPower==='function'?setPower(S):setB('torre')*10;if(typeof setStatsX==='function')setStatsX(S,st);return st}
function setLog(S,s){S.log.unshift({d:gDay(),s});S.log.length=Math.min(S.log.length,12);S.nlog=(S.nlog|0)+1}
function setDay(S){const st=setStats(S);S.cash=(S.cash|0)+st.tax;for(const k in st.prod)S.mag[k]=(S.mag[k]|0)+st.prod[k];
  const c=(S.cibo|0)+st.fp-st.fc,w=(S.acqua|0)+st.wp-st.wc;S.cibo=clamp(c,0,st.fcap);S.acqua=clamp(w,0,st.wcap);
  if(c<0||w<0){S.fame++;const what=c<0&&w<0?'cibo e acqua':c<0?'cibo':'acqua';if(S.fame===1)setLog(S,'Manca '+what+': se non arriva, la gente se ne andrà');
    if(S.fame>=2&&S.pop>1){const k=Math.min(S.pop-1,Math.max(1,Math.round(S.pop*.2)));S.pop-=k;S.via+=k;setLog(S,k+(k>1?' abitanti se ne sono andati':' abitante se n\'è andato')+': manca '+what)}}
  else{S.fame=0;if(S.cibo>=st.fc&&S.acqua>=st.wc){if(S.via>0){const k=Math.min(S.via,Math.max(1,Math.ceil(S.via/2)),Math.max(0,st.cap-S.pop));if(k>0){S.pop+=k;S.via-=k;setLog(S,k+(k>1?' abitanti sono tornati':' abitante è tornato'))}}
      else if(S.pop<st.cap&&S.cibo>st.fc*2&&S.acqua>st.wc*2){const k=Math.max(1,Math.round((st.cap-S.pop)/5));S.pop=Math.min(st.cap,S.pop+k);setLog(S,k+(k>1?' nuovi abitanti sono arrivati':' nuovo abitante è arrivato'))}}}
  if(S.pop>st.cap){const k=S.pop-st.cap;S.pop=st.cap;S.via+=k;setLog(S,k+' abitanti senza casa se ne sono andati')}
  if(typeof setDayX==='function')setDayX(S,st)}
setAccrue=function(){const S=P&&P.tw&&P.tw.set;if(!S)return;setFix(S);const d=gDay();if(S.day==null)S.day=d;let n=Math.min(10,d-S.day);if(n<=0)return;S.day=d;while(n-->0)setDay(S)};
setRate=function(){const S=P.tw.set;if(!S)return 0;setFix(S);return setStats(S).tax};
const setWalkers=()=>{const S=P.tw.set;return clamp(Math.round(((S&&S.pop)|0)/2),1,10)};
// ritirare il tesoro: le monete e i materiali del magazzino; il cibo e l'acqua restano al borgo
setCollect=function(){setAccrue();const S=P.tw.set;if(!S)return;const g=S.cash|0,m=Object.keys(S.mag).filter(k=>S.mag[k]>0);if(!g&&!m.length){msg('Il tesoro e il magazzino sono vuoti: torna domani');return}
  P.g+=g;S.cash=0;const got=m.map(k=>{P.res[k]=(P.res[k]|0)+S.mag[k];const s=S.mag[k]+' '+RESN[k].toLowerCase();S.mag[k]=0;return s});
  if(cineOK()&&g)goldFly(g);banner('Il tesoro di '+S.n,[g?g+' monete':'',...got].filter(Boolean).join(' · '),'moneta');save();hud();pn('regno')};
// portare il cibo al borgo
const SETFD={grano:2,mela:1,uova:1,lunare:1,ghiaccio:1};
function setFeed(){const S=P.tw.set;if(!S)return;setFix(S);const st=setStats(S);let add=0;for(const r in SETFD){const n=P.res[r]|0;if(!n)continue;const room=Math.max(0,st.fcap-S.cibo-add),use=Math.min(n,Math.ceil(room/SETFD[r]));if(use<=0)continue;P.res[r]-=use;add+=use*SETFD[r]}
  if(!add){msg(st.fcap<=S.cibo?'Le scorte di cibo sono piene':'Non hai cibo da portare: grano, mele, uova');return}S.cibo=Math.min(st.fcap,S.cibo+add);tone(620,.06,'triangle');msg('Hai portato '+add+' di cibo al borgo');save();pn('regno')}
// costruire costa risorse: niente più legna pagata in monete
function setCostOf(k,l){return(SETCO[k]||(()=>({g:200*l})))(l)}
function setMiss(c){const m=[];for(const r in c){const have=r==='g'?P.g|0:P.res[r]|0;if(have<c[r])m.push([r,c[r]-have])}return m}
function setPay(c){for(const r in c){if(r==='g')P.g-=c[r];else P.res[r]=(P.res[r]|0)-c[r]}}
const setCostHTML=c=>Object.keys(c).filter(r=>c[r]>0).map(r=>{const have=r==='g'?P.g|0:P.res[r]|0;return`<span class="stc${have<c[r]?' no':''}">${SETMI[r]||''} ${c[r]}</span>`}).join('');
setBuy=function(b){const S=P.tw.set;if(!S)return;setFix(S);const B=TWSB[b],cur=b==='casa'?S.lv:setB(b);if(!B||cur>=B.max)return;const c=setCostOf(b,cur+1),m=setMiss(c);
  if(m.length){msg('Mancano '+m.map(([r,n])=>n+' '+(r==='g'?'monete':RESN[r].toLowerCase())).join(', ')+'. Le risorse si raccolgono nelle terre selvagge.');tone(150,.1);return}
  setPay(c);if(b==='casa')S.lv++;else S.b[b]=cur+1;jingle([67,72,76,79],.08,'triangle');banner(B.ic+' '+B.n+(b==='casa'?' · livello '+S.lv:' · livello '+S.b[b]),S.n+' cresce','martello');setRebuild();save();pn('regno')};
/* ---- il pannello del borgo ---- */
function setTile(ic,n,v,sub,cls){return`<div class="sst${cls?' '+cls:''}"><i>${ic}</i><b>${v}</b><small>${n}</small>${sub?`<em>${sub}</em>`:''}</div>`}
function setHTML2(){const S=setFix(P.tw.set);setAccrue();const st=setStats(S),here=Zk===S.k,bar=(v,mx,c)=>`<span class="sbar"><i style="width:${Math.min(100,v/Math.max(1,mx)*100)}%;background:${c}"></i></span>`;
  const df=st.fp-st.fc,dw=st.wp-st.wc;
  let h=`<div class="rgcard rgset"><div><b>${esc(S.n)}</b> <small>livello ${S.lv} di 5</small><p class="mu">Tesoro: <b>${S.cash|0}💰</b> · ogni giorno ${st.tax}💰${Object.keys(st.prod).length?' · produce '+Object.keys(st.prod).map(k=>st.prod[k]+' '+SETMI[k]).join(' '):''}</p></div>
    <span><button class="pri" onclick="setCollect()">💰 Ritira</button>${here?'':`<button onclick="setGo()">🏠 Torna a casa</button>`}<button onclick="setRename()">✎ Rinomina</button></span></div>`;
  h+=`<div class="sstg">`+setTile('👥','Abitanti',st.pop+'/'+st.cap,(S.via?S.via+' andati via':'')+bar(st.pop,st.cap,'#9ad0ff'),S.via?'warn':'')
    +setTile('🍞','Cibo',S.cibo+'/'+st.fcap,(df>=0?'+':'')+df+' al giorno'+bar(S.cibo,st.fcap,'#e8c060'),df<0?'bad':'')
    +setTile('💧','Acqua',S.acqua+'/'+st.wcap,(dw>=0?'+':'')+dw+' al giorno'+bar(S.acqua,st.wcap,'#5ab0ff'),dw<0?'bad':'')
    +setTile('💰','Monete',(S.cash|0),'+'+st.tax+' al giorno · tasse')
    +setTile('⚔','Potenza dell\'esercito',st.pow,typeof setPowerSub==='function'?setPowerSub(S):(setB('torre')?'le guardie delle torri':'nessun esercito'))
    +setTile('🧱','Materiali',SETMAT.map(k=>(P.res[k]|0)).join(' · '),SETMAT.map(k=>SETMI[k]).join(' · ')+(Object.values(S.mag).some(v=>v>0)?'<br>nel magazzino: '+SETMAT.filter(k=>S.mag[k]).map(k=>S.mag[k]+' '+SETMI[k]).join(' '):''))+`</div>`;
  const tips=[];if(df<0)tips.push('Il cibo non basta: costruisci la Fattoria o il Granaio, semina campi con l\'editor o porta grano, mele e uova.');if(dw<0)tips.push('L\'acqua non basta: costruisci la Cisterna, o metti pozzi e fontane con l\'editor.');
  if(S.via)tips.push(S.via+' abitanti sono andati via: torneranno quando ci saranno abbastanza cibo e acqua (e case libere).');if(st.pop>=st.cap&&!S.via)tips.push('Il borgo è pieno: con l\'Espansione o nuove case arrivano altri abitanti.');
  if(tips.length)h+=`<div class="stips">${tips.map(x=>`<p>⚠ ${x}</p>`).join('')}</div>`;
  h+=`<div class="srow"><button onclick="setFeed()">🍞 Porta il cibo che hai (${Object.keys(SETFD).reduce((a,r)=>a+(P.res[r]|0),0)})</button>${here?`<button onclick="sedOpen()">✏ Modifica il borgo (V)</button>`:''}</div>`;
  if(S.log.length)h+=`<h4>Cronaca del borgo</h4><div class="slog">${S.log.slice(0,6).map(l=>`<p><small>giorno ${l.d}</small> ${esc(l.s)}</p>`).join('')}</div>`;
  h+=`<h4>Costruire</h4><div class="rgbg">`+Object.keys(TWSB).map(k=>{const B=TWSB[k],cur=k==='casa'?S.lv:setB(k),mx=cur>=B.max,c=mx?null:setCostOf(k,cur+1),ok=c&&!setMiss(c).length;
      return`<div class="rgb${cur?' on':''}"><b>${B.ic} ${B.n}</b><small>${B.d}</small><i>${'●'.repeat(cur)}${'○'.repeat(B.max-cur)}</i>${mx?'<em>completo</em>':`<div class="scost">${setCostHTML(c)}</div><button ${ok?'':'class="dim"'} onclick="setBuy('${k}')">${cur?'Migliora':'Costruisci'}</button>`}</div>`}).join('')+`</div>
    <p class="mu">Legna, pietra, argilla e ferro si raccolgono nelle terre selvagge di Tomorrow; la Segheria e la Cava li producono anche nel borgo.</p>`;
  h+=`<h4>Personalizzare</h4><div class="rgth">${TWSTH.map((th,i)=>`<button class="${(S.col|0)===i?'on':''}" onclick="setTheme(${i})"><i style="background:${th[2][0]}"></i><i style="background:${th[1][0]}"></i>${th[0]}</button>`).join('')}</div>
    <div class="rgcard sedcard"><div><b>✏ Editor del borgo</b><p class="mu">Sposta gli edifici, aggiungi case, disegna strade e piazze, metti alberi, fontane, pozzi, lampioni, bancarelle e campi${here?'':' · si apre quando sei nel borgo'}. Tasto V.</p></div><span><button class="pri" onclick="sedOpen()" ${here?'':'disabled'}>✏ Modifica il borgo</button></span></div>`;
  return h}
const _rgHTML728=rgHTML;rgHTML=function(){let h=_rgHTML728();if(RG.tab!=='set'||!P.tw||!P.tw.set)return h;const i=h.indexOf('<div class="rgc">'),j=h.lastIndexOf('</div><footer');if(i<0||j<0)return h;
  return h.slice(0,i+17)+setHTML2()+h.slice(j)};
/* ---- nel borgo: la pianta si usa sempre, il fiume conta per l'acqua, la barra delle risorse ---- */
const _loadPost728=loadPost;loadPost=function(k){_loadPost728(k);if(!twOn()||!P.tw||!P.tw.set)return;const S=setFix(P.tw.set);setAccrue();
  if(Zk===S.k&&ZZ&&ZZ.shub){let w=0;const[cx,cy]=ZZ.shub,R=sedR()+6;for(let y=cy-R;y<=cy+R;y++)for(let x=cx-R;x<=cx+R;x++)if(y>0&&x>0&&y<N&&x<N&&M[y][x]===2)w++;S.riv=w>12?1:0;
    if(!S.lay||!S.lay.v){sedCapture();save();setTimeout(()=>{if(Zk===S.k&&!PM)setRebuild()},30)}}
  if(S.nlog&&S.log[0]){const L=S.log.slice(0,Math.min(3,S.nlog));S.nlog=0;if(L.some(l=>/andat|Manca/.test(l.s)))banner('Notizie da '+S.n,L[0].s,'corona');else msg(S.n+': '+L[0].s)}
  setHud()};
function setHud(){let el=$('sethud');if(!el){el=document.createElement('div');el.id='sethud';document.body.appendChild(el)}const S=P&&P.tw&&P.tw.set;
  if(!started||!twOn()||!S||Zk!==S.k){el.style.display='none';return}const st=setStats(S);el.style.display='flex';
  el.innerHTML=`<span title="Abitanti">👥 ${st.pop}/${st.cap}</span><span class="${st.fp<st.fc?'bad':''}" title="Cibo">🍞 ${S.cibo}</span><span class="${st.wp<st.wc?'bad':''}" title="Acqua">💧 ${S.acqua}</span><span title="Tesoro">💰 ${S.cash|0}</span><span title="Potenza dell'esercito">⚔ ${st.pow}</span><span title="Materiali">🪵${P.res.legna|0} 🪨${P.res.pietra|0} 🧱${P.res.argilla|0} ⛓${P.res.ferro|0}</span>`;iconFill&&iconFill(el)}
let SETHT=0;const _upd728=upd;upd=function(dt){_upd728(dt);if((SETHT-=dt)>0)return;SETHT=2;if(twOn()&&P.tw&&P.tw.set){const d0=P.tw.set.day;setAccrue();if(P.tw.set.day!==d0&&P.tw.set.nlog){const S=P.tw.set,l=S.log[0];S.nlog=0;if(l)msg(S.n+': '+l.s)}}setHud()};
const _toMenu728=toMenu;toMenu=function(){_toMenu728();const el=$('sethud');if(el)el.style.display='none'};
// il borgo appena fondato parte con gli abitanti e le scorte
const _sf728=twSetFound;twSetFound=function(){const had=!!P.tw.set;_sf728();if(!had&&P.tw.set){setFix(P.tw.set);P.tw.set.pop=4;setLog(P.tw.set,'Il borgo è nato: 4 coloni, un po\' di cibo e d\'acqua')}};
document.head.insertAdjacentHTML('beforeend',`<style>
.sstg{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:7px;margin:8px 0}.sst{background:rgba(127,127,127,.12);border:1px solid rgba(127,127,127,.3);border-radius:9px;padding:8px 10px;display:flex;flex-direction:column;gap:2px}
.sst i{font-style:normal;font-size:18px}.sst b{font-size:17px}.sst small{opacity:.8}.sst em{font-style:normal;font-size:11.5px;opacity:.85}.sst.bad{border-color:#ff6a5a88;background:rgba(255,80,60,.08)}.sst.warn{border-color:#ffae2b88}
.sbar{display:block;height:5px;background:rgba(127,127,127,.25);border-radius:3px;overflow:hidden;margin-top:4px}.sbar i{display:block;height:100%}
.stips{border-left:3px solid #ffae2b;background:rgba(255,174,43,.08);padding:4px 10px;border-radius:6px;margin:6px 0}.stips p{margin:4px 0;font-size:13px}
.srow{display:flex;gap:6px;flex-wrap:wrap;margin:6px 0}.slog p{margin:3px 0;font-size:13px}.slog small{opacity:.6;margin-right:6px}
.scost{display:flex;flex-wrap:wrap;gap:4px;margin:4px 0}.stc{font-size:12px;background:rgba(127,127,127,.15);border-radius:5px;padding:1px 6px}.stc.no{color:#ff9a8a;background:rgba(255,80,60,.14)}.rgb button.dim{opacity:.6}
#sethud{position:fixed;top:44px;left:50%;transform:translateX(-50%);z-index:6;display:none;gap:10px;background:rgba(16,14,24,.78);border:1px solid #ffd84a44;border-radius:10px;padding:4px 12px;font:13px system-ui,sans-serif;color:#f4ead8;pointer-events:none;white-space:nowrap}
#sethud .bad{color:#ff8a7a}@media (max-width:700px){#sethud{top:auto;bottom:118px;font-size:11px;gap:6px;padding:3px 8px}}
</style>`);
// dopo una ricostruzione l'eroe non resta mai chiuso fra le case: se dal suo posto non si arriva allo stendardo, torna lì
const _setRebuild728=setRebuild;setRebuild=function(){_setRebuild728();const S=P&&P.tw&&P.tw.set;if(!S||Zk!==S.k)return;const bn=ents.find(e=>e.k==='twbn'&&e.set);if(!bn)return;
  const d=bfs(P.px|0,P.py|0);if(!sedReach(d,bn.px|0,bn.py|0)){const[x,y]=nearFree(bn.px|0,(bn.py|0)+1);P.px=x+.5;P.py=y+.5;P.path=[];P.tg=null}};
