/* ================= 7.43: la Torre della Corona, la sfida del giorno =================
   Una porta di pietra con la luce dorata, in piazza ad Aldoria e nella tua città di Tomorrow. Dentro, dieci piani:
   in ognuno una sala con i nemici; ripulita la sala si sceglie una di tre benedizioni (valgono solo nella Torre) e
   si sale. Ai piani 5 e 10 aspetta un boss. Ogni giorno la Torre cambia, ma è uguale per tutti: stessi nemici, stesse
   sale e stesse benedizioni, così ci si sfida sulla classifica del giorno (in rete, con il plugin Torre del server).
   Cadere nella Torre non costa niente: la prova finisce e si prende il premio dei piani fatti. */
const TOR={run:null,top:null,topd:''};
const TOR_N=10;
const TORB=[
  {k:'forza',i:'⚔',n:'Forza',d:'+20% danni'},{k:'vita',i:'❤',n:'Vigore',d:'+25% vita massima'},{k:'vampiro',i:'🩸',n:'Sete',d:'Ti curi del 5% dei danni che fai'},
  {k:'fortuna',i:'💰',n:'Fortuna',d:'+50% oro dai nemici'},{k:'pozioni',i:'🧪',n:'Scorta',d:'+2 pozioni subito'},{k:'scudo',i:'🛡',n:'Pelle di pietra',d:'-20% danni subiti'},
  {k:'esplosione',i:'💥',n:'Scoppio',d:'Chi cade esplode e ferisce chi gli sta vicino'},{k:'critico',i:'🎯',n:'Occhio fino',d:'+12% probabilità di colpo critico'},
  {k:'rigenera',i:'🌿',n:'Rigenerazione',d:'Recuperi l\'1% della vita al secondo'},{k:'riflessi',i:'🌀',n:'Riflessi',d:'Schivata e affondo si ricaricano molto prima'}];
for(let i=1;i<=TOR_N;i++)Z['torre'+i]={n:'Torre della Corona · piano '+i,lv:1,N:26,int:1,fl:'#4a4258',fl2:'#433b50',wall:'#6e6480',bg:'#05040a',tc:'#ffd84a',pt:'mote',mus:'dungeon',torre:i,c:0};
const torOn=()=>!!(ZZ&&ZZ.torre&&TOR.run);
const torN=k=>(TOR.run&&TOR.run.b.filter(x=>x===k).length)|0;
const torRng=s=>sd(hs('torre|'+(TOR.run?TOR.run.d:dayKey())+'|'+s));
// i nemici e i boss che possono uscire nella Torre (quelli dei dungeon della storia)
function torPool(){const en=[],bo=[];for(const id in DG){const d=DG[id];if(!d||d.tw)continue;for(const q of d.en||[])if(E[q]&&!en.includes(q))en.push(q);if(d.boss&&E[d.boss]&&!bo.includes(d.boss)&&id!=='cittadella')bo.push(d.boss)}return{en,bo}}
function torStart(){const from=ZZ&&!ZZ.torre?Zk:'town';TOR.run={d:dayKey(),f:1,lv:Math.max(1,P.lv),from,b:[],t0:Date.now(),clr:0,sp:0};P.hp=P.mx;load('torre1',from)}
// la sala del piano
const _genWild743t=genWild;genWild=function(z){if(!z.torre)return _genWild743t(z);if(!TOR.run)TOR.run={d:dayKey(),f:z.torre,lv:Math.max(1,P.lv),from:'town',b:[],t0:Date.now(),clr:0,sp:0};
  const f=z.torre,r=torRng('sala'+f),c=N>>1,R2=10;TOR.run.f=f;TOR.run.clr=0;TOR.run.sp=0;z.lv=TOR.run.lv+f-1;
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const q=Math.hypot(x+.5-c,y+.5-c);M[y][x]=q<R2?0:q<R2+1.3?1:9}
  // colonne: una forma diversa per ogni piano (sempre le stesse per tutti nello stesso giorno)
  const np=[4,6,8][Math.floor(r()*3)],pr=3.5+r()*3,ph=r()*6.283;for(let i=0;i<np;i++){const a=ph+i*6.283/np,x=Math.floor(c+Math.cos(a)*pr),y=Math.floor(c+Math.sin(a)*pr);if(Math.hypot(x+.5-c,y+.5-(N-4))>3)M[y][x]=1}
  for(let i=0;i<12;i++){const a=i*6.283/12,x=c+Math.cos(a)*(R2-.7),y=c+Math.sin(a)*(R2-.7);ents.push({k:'tc',px:x,py:y})}
  const sp=[c,N-4];for(let y=sp[1]-1;y<=sp[1]+1;y++)for(let x=sp[0]-1;x<=sp[0]+1;x++)M[y][x]=0;
  ents.push(Object.assign(po(c,N-3,TOR.run.from||'town',{st:'exit',n:'Esci dalla Torre'}),{torEx:1}));
  const P2=torPool(),rs=torRng('nemici'+f),boss=f===5||f===TOR_N,n=boss?2+Math.floor(f/4):4+f;
  const spots=[];for(let y=2;y<N-2;y++)for(let x=2;x<N-2;x++)if(M[y][x]===0&&Math.hypot(x-sp[0],y-sp[1])>7)spots.push([x,y]);
  for(let i=spots.length-1;i>0;i--){const j=Math.floor(rs()*(i+1));[spots[i],spots[j]]=[spots[j],spots[i]]}
  const ty=[0,1,2].map(()=>P2.en[Math.floor(rs()*P2.en.length)]);
  if(boss){const b=P2.bo[Math.floor(rs()*P2.bo.length)]||'troll',m=mk(b,c,c-3);m.tor=1;ents.push(m)}
  for(let i=0;i<n&&spots.length;i++){const q=spots.pop(),m=mk(ty[i%3],q[0],q[1]);m.tor=1;ents.push(m)}
  TOR.run.sp=1;return sp};
// il piano è ripulito: si sceglie la benedizione e si sale
function torTick(){const R=TOR.run;if(!torOn()||R.clr||!R.sp)return;if(ents.some(e=>e.k==='en'&&e.hp>0))return;R.clr=1;R.done=Math.max(R.done|0,R.f);
  jingle([67,72,76,79],.1,'triangle');if(R.f>=TOR_N){setTimeout(()=>torEnd(1),1200);return}
  setTimeout(()=>{if(torOn()&&!PM)pn('torb')},900)}
X43P.torb=()=>{const R=TOR.run,r=torRng('benedizioni'+R.f),L=TORB.slice();for(let i=L.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[L[i],L[j]]=[L[j],L[i]]}const C=L.slice(0,3);
  return`<h3>✨ Piano ${R.f} ripulito · scegli una benedizione</h3><p class="x43t">Vale fino a quando resti nella Torre e si somma a quelle che hai già.${R.b.length?' Hai: '+R.b.map(k=>TORB.find(b=>b.k===k).i).join(' '):''}</p>
  <div class="x43c">${C.map(b=>`<button onclick="torBless('${b.k}')"><i>${b.i}</i><b>${b.n}${torN(b.k)?' ×'+(torN(b.k)+1):''}</b><small>${b.d}</small></button>`).join('')}</div>`};
function torBless(k){const R=TOR.run;if(!R)return;R.b.push(k);cl();if(k==='pozioni'){P.pot+=2;flt(P,'+2 🧪','#88ff88')}if(k==='vita'){recalc();P.hp=Math.min(P.mx,P.hp+Math.round(P.mx*.25))}hud();
  const c=N>>1;ents.push(po(c,c,'torre'+(R.f+1),{st:'up',n:'Sali al piano '+(R.f+1)}));if(cineOK())ringFx(c+.5,c+.5,'255,216,74',.9,2.4);msg('Benedizione: '+TORB.find(b=>b.k===k).n+'. La scala per il piano '+(R.f+1)+' è al centro della sala.')}
// la prova finisce (vittoria, caduta o uscita): premio dei piani fatti e classifica del giorno
function torEnd(win){const R=TOR.run;if(!R)return;const done=win?TOR_N:(R.done|0),sec=Math.round((Date.now()-R.t0)/1000),lv=R.lv;TOR.run=null;recalc();
  const gold=Math.round(done*done*18*(1+lv*.12)),xp=Math.round(done*done*9*(1+lv*.2));P.g+=gold;gainXP(xp);const its=[];if(done>=5)its.push(item(lv+3,2));if(done>=TOR_N)its.push(item(lv+4,3));for(const it of its)gain(it);
  const L=LS.get('voxelia_torre',{})||{},o=L[R.d];if(!o||done>o.c||(done===o.c&&sec<o.t))L[R.d]={c:done,t:sec,lv};for(const k of Object.keys(L))if(k<dayKey().slice(0,8)+'00'&&Object.keys(L).length>30)delete L[k];LS.set('voxelia_torre',L);
  if(typeof NET!=='undefined'&&NET.ok&&typeof VXP!=='undefined'&&done>0)VXP.send('torre','score',{d:R.d,c:done,t:sec,lv});
  PA={ti:win?'🏆 La Torre è tua!':'La prova della Torre è finita',tx:(win?'Hai conquistato tutti e dieci i piani della Torre di oggi!':'Piani superati: '+done+' di '+TOR_N+'.')+'\nTempo: '+Math.floor(sec/60)+' min '+(sec%60)+' s · benedizioni: '+(R.b.length?R.b.map(k=>TORB.find(b=>b.k===k).n).join(', '):'nessuna')+'\n\nPremio: +'+gold+' oro, +'+xp+' XP'+(its.length?' e '+its.map(iname).join(', '):'')+'.\nLa Torre di domani sarà diversa.'};
  if(win&&cineOK())banner('Torre conquistata!',TOR_N+' piani in '+Math.floor(sec/60)+' min','corona');
  const back=R.from||'town';P.hp=P.mx;irisGo(()=>{load(back,'torre1');setTimeout(()=>pn('txt'),400)});save()}
const _upd743t=upd;upd=function(dt){_upd743t(dt);if(!torOn())return;try{torTick()}catch(e){console.warn(e)}const R=TOR.run;if(torN('rigenera')&&P.hp>0&&P.hp<P.mx)P.hp=Math.min(P.mx,P.hp+P.mx*.01*torN('rigenera')*dt)};
// le benedizioni
const _roll743t=roll;roll=function(m){const r=_roll743t(m);if(!torOn())return r;if(torN('forza'))r.d=Math.max(1,Math.round(r.d*(1+.2*torN('forza'))));if(!r.cr&&torN('critico')&&Math.random()<.12*torN('critico')){r.d=Math.round(r.d*1.8);r.cr=true}return r};
const _recalc743t=recalc;recalc=function(){_recalc743t();if(torOn()&&torN('vita')&&P){P.mx=Math.round(P.mx*(1+.25*torN('vita')))}};
const _hurtE743t=hurtE;hurtE=function(e,d,rem,cr){_hurtE743t(e,d,rem,cr);if(!rem&&torOn()&&torN('vampiro')&&P.hp>0)P.hp=Math.min(P.mx,P.hp+d*.05*torN('vampiro'))};
const _hurtP743t=hurtP;hurtP=function(at){_hurtP743t(torOn()&&torN('scudo')?at*Math.pow(.8,torN('scudo')):at)};
const _kill743t=kill;kill=function(e){const g0=P.g,on=torOn()&&e&&e.k==='en'&&ents.includes(e);_kill743t(e);if(!on)return;if(torN('fortuna'))P.g+=Math.round((P.g-g0)*.5*torN('fortuna'));
  if(torN('esplosione')){fx.push({k:'boom',x:e.px,y:e.py,r:2.2,t:.4});for(const o of ents.slice())if(o.k==='en'&&o!==e&&o.hp>0&&dist(o,e)<2.2)hurtE(o,Math.max(1,Math.round(e.mx*.25*torN('esplosione'))),0)}};
const _dodge743t=dodge;dodge=function(){const c0=P?P.dgc:0;_dodge743t();if(torOn()&&torN('riflessi')&&P.dgc>c0)P.dgc*=.5};
const _lunge743t=lunge;lunge=function(){const c0=P?P.lgc:0;_lunge743t();if(torOn()&&torN('riflessi')&&P.lgc>c0)P.lgc*=.6};
// cadere nella Torre non costa niente
const _die743t=die;die=function(){if(torOn()){if(typeof sceneDeath==='function')sceneDeath();P.hp=P.mx;torEnd(0);return}_die743t()};
// uscire: dalla porta della Torre (la prova finisce) o in altri modi (la prova si perde)
const _act743t=act;act=function(e){if(e&&e.k==='po'&&e.torEx&&TOR.run){torEnd(0);return}if(e&&e.k==='torre43'){pn('torre');tone(330,.1,'triangle');return}_act743t(e)};
const _loadPost743t=loadPost;loadPost=function(k){_loadPost743t(k);if(TOR.run&&!(ZZ&&ZZ.torre)){const v=torN('vita');TOR.run=null;if(v)recalc()}torDoor()};
// la porta della Torre: in piazza ad Aldoria e nella tua città di Tomorrow
ITK.add('torre43');
function torDoor(){if(!ZZ||ents.some(e=>e.k==='torre43'))return;let c=null;
  if(Zk==='town'&&MODE==='story'&&!(typeof OW!=='undefined'&&OW.on))c=[47,47];else if(typeof twOn==='function'&&twOn()&&ZZ.set&&ZZ.shub)c=[ZZ.shub[0]+3,ZZ.shub[1]+4];if(!c)return;
  for(let r=0;r<9;r++)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){if(Math.max(Math.abs(dx),Math.abs(dy))!==r)continue;const x=c[0]+dx,y=c[1]+dy;if(x<2||y<2||x>=N-2||y>=N-2)continue;
    let ok=true;for(let v=y-1;v<=y+1&&ok;v++)for(let u=x-1;u<=x+1;u++)if(M[v][u]!==0&&M[v][u]!==4||DEC[v][u]&&DEC[v][u][0]!=='₪')ok=false;if(!ok)continue;
    if(ents.some(e=>(e.k==='po'||e.k==='npc'||e.k==='board'||e.k==='owb')&&Math.abs(e.px-x-.5)<2.5&&Math.abs(e.py-y-.5)<2.5))continue;if(Zk==='town'&&Math.hypot(x-35,y-43)<7)continue;
    ents.push({k:'torre43',px:x+.5,py:y+.5,n:'Torre della Corona'});return}}
X43P.torre=()=>{const d=dayKey(),L=LS.get('voxelia_torre',{})||{},me=L[d],srv=TOR.topd===d&&TOR.top;if(NET.ok&&typeof VXP!=='undefined'&&TOR.ask!==d){TOR.ask=d;VXP.send('torre','top',{d})}
  return`<h3>🗼 Torre della Corona · ${dayName(d)}</h3><p class="x43t">Dieci piani, uguali per tutti i giocatori fino a mezzanotte (UTC). Ripulisci la sala, scegli una benedizione e sali. Ai piani 5 e 10 c'è un boss. Cadere qui non costa niente.</p>
  <div class="qb">${me?`Il tuo record di oggi: <b>${me.c} piani</b> in ${Math.floor(me.t/60)} min ${me.t%60} s`:'Oggi non l\'hai ancora tentata.'}</div>
  ${srv?`<h4>Classifica di oggi</h4>${srv.length?srv.slice(0,10).map((q,i)=>`<div class="x43r"><span>${i+1}. ${esc(q.n)}</span><span>${q.c} piani · ${Math.floor(q.t/60)}:${String(q.t%60).padStart(2,'0')}</span></div>`).join(''):'<p class="mu">Nessuno ancora: tocca a te.</p>'}`:NET.ok?'<p class="mu">Classifica del server: in arrivo (serve il plugin Torre).</p>':'<p class="mu">Gioca in rete per entrare nella classifica del giorno.</p>'}
  <button onclick="cl();torStart()">🗼 Entra nella Torre (piano 1)</button><button onclick="cl()">Più tardi</button>`};
if(typeof VXP!=='undefined')VXP.on('torre','top',d=>{if(!d)return;TOR.top=Array.isArray(d.L)?d.L:[];TOR.topd=String(d.d||'');if(PM==='torre')pn('torre')});
// disegno della porta: un arco di pietra con la luce d'oro che respira
const _ent743t=ent;ent=function(e){if(e.k!=='torre43'){_ent743t(e);return}const u=.55+Math.sin(t*2)*.12,S2='#7a7088',S3='#5e566a';
  if(SET.shad){g.fillStyle='rgba(0,0,0,.28)';g.beginPath();g.ellipse(PX(e.px,e.py),PY(e.px,e.py,0),26,12,0,0,6.3);g.fill()}
  drawL([[-.75,-.25,0,.3,.5,56,S2],[.45,-.25,0,.3,.5,56,S2],[-.8,-.3,56,1.6,.6,10,S3],[-.55,-.3,66,1.1,.6,8,S2],[-.3,-.3,74,.6,.6,8,S3],[-.08,-.08,82,.16,.16,8,'#ffd84a'],
    [-.45,-.05,0,.9,.1,54,'#2a1e3a'],[-.4,.02,4,.8,.06,46,u>.6?'#ffe9a0':'#ffd84a'],[-.25,.05,12,.5,.04,30,'#fff6d0']],e.px,e.py,0);
  if(typeof nlight==='function')nlight(e.px,e.py+.2,30,140,'255,216,120',u);if(SET.ultra)GLOW.push([e.px,e.py,30,60,'255,216,120',.3])};
