/* ================= 7.44: le leve dei dungeon, da tirare insieme =================
   Nei piani dei dungeon (non in quello del boss) la scala che scende è chiusa da una grata. Per aprirla servono due
   leve, in due stanze lontane, tirate insieme: ogni leva resta giù 18 secondi. In gruppo uno tira e l'altro corre
   (le leve degli altri si vedono e contano), da soli bisogna fare in fretta. Quando si tira una leva, dall'ombra
   escono dei guardiani: chi resta alla leva deve difendersi. Le leve sono nello stesso posto per tutti. */
const LVR={on:{},open:{},sent:0};   // on: id leva → fino a quando è giù (tempo t) · open: piani già aperti in questa sessione
const LVR_T=18;
function lvrKey(){return rmKey()}
function lvrSetup(){if(!ZZ||!ZZ.dg||ZZ.boss||ZZ.torre)return;const down=ents.find(e=>e.k==='po'&&e.st==='down');if(!down)return;
  const st=ents.find(e=>e.k==='po'&&(e.st==='up'||e.st==='exit'));if(!st)return;const d=bfs(st.px|0,st.py|0);
  const r=sd(hs(lvrKey()+'|leve')),C=[];let mx=0;for(let y=1;y<N-1;y++)for(let x=1;x<N-1;x++){const v=d[y*N+x];if(v>0)mx=Math.max(mx,v)}
  const ok=(x,y)=>{const v=d[y*N+x];return v>0&&Math.hypot(x+.5-down.px,y+.5-down.py)>6};
  const pick=(a,b,avoid)=>{const L=[];for(let y=1;y<N-1;y++)for(let x=1;x<N-1;x++){const v=d[y*N+x];if(v<mx*a||v>mx*b||M[y][x]!==0||DEC[y][x]||!ok(x,y))continue;
      let fr=0;for(const[u,w]of[[1,0],[-1,0],[0,1],[0,-1]])if(WK(M[y+w][x+u]))fr++;if(fr<4)continue;if(avoid&&Math.hypot(x-avoid[0],y-avoid[1])<12)continue;if(ents.some(e=>e.k!=='tc'&&Math.abs(e.px-x-.5)<2&&Math.abs(e.py-y-.5)<2))continue;L.push([x,y])}
    return L.length?L[Math.floor(r()*L.length)]:null};
  const a=pick(.25,.55),b=a?pick(.5,.95,a):null;if(!a||!b)return;
  down.seal=1;down.n0=down.n0||down.n;
  ents.push({k:'lev',id:'L1',px:a[0]+.5,py:a[1]+.5,n:'Leva antica'},{k:'lev',id:'L2',px:b[0]+.5,py:b[1]+.5,n:'Leva antica'});
  if(LVR.open[lvrKey()])lvrUnseal(1);
  else setTimeout(()=>{if(ZZ&&ZZ.dg&&ents.some(e=>e.k==='lev'))msg('La scala per il piano di sotto è chiusa da una grata: cerca le due leve e tirale insieme.')},2600)}
const _loadPost743l=loadPost;loadPost=function(k){LVR.on={};_loadPost743l(k);try{lvrSetup()}catch(e){console.warn('leve',e)}};
function lvrUnseal(quiet){const down=ents.find(e=>e.k==='po'&&e.seal);LVR.open[lvrKey()]=1;for(const e of ents)if(e.k==='lev')e.done=1;if(!down)return;down.seal=0;
  if(!quiet){msg('Le leve scattano insieme: la grata si alza!');jingle([60,67,72,79],.1,'triangle');if(cineOK()){sparks(down.px,down.py,24,['#ffd84a','#ffffff'],80);ringFx(down.px,down.py,'255,220,120',.9,2.2)}}}
// le leve tirate dagli altri giocatori dello stesso piano (arrivano con la posizione dell'eroe)
function lvrPeers(){const o={};if(typeof NET==='undefined'||!NET.ok)return o;const rk=rmKey();for(const id in NET.peers){const q=NET.peers[id];if(!q||q.rm!==rk||!Array.isArray(q.lvr))continue;for(const k of q.lvr)if(k==='L1'||k==='L2')o[k]=1;if(q.lvo)o.open=1}return o}
function lvrPull(e){if(e.done){msg('La leva è già bloccata: la grata è aperta.');return}if(LVR.on[e.id]>t){msg('La leva è già giù: '+Math.ceil(LVR.on[e.id]-t)+' secondi');return}
  LVR.on[e.id]=t+LVR_T;e.pt=t;tone(140,.25,'square',.06);setTimeout(()=>tone(90,.2,'square',.05),120);if(cineOK())sparks(e.px,e.py,10,['#c8b898','#ffd84a'],50);
  // i guardiani escono dall'ombra intorno alla leva
  const z=ZZ,en=z.en||[];if(en.length){let n=0;for(let i=0;i<3&&ents.filter(x=>x.k==="en").length<40;i++){const a=i*2.1+Math.random(),[x,y]=nearFree(clamp(Math.floor(e.px+Math.cos(a)*3),1,N-2),clamp(Math.floor(e.py+Math.sin(a)*3),1,N-2));if(WK(M[y][x])){const m=mk(en[i%en.length],x,y);m.al=1;ents.push(m);n++}}if(n)flt(e,'Guardiani!','#ff8a5a')}
  const other=e.id==='L1'?'L2':'L1';msg(lvrPeers()[other]||LVR.on[other]>t?'Leva tirata!':'Leva tirata: hai '+LVR_T+' secondi per tirare l\'altra (o fatti aiutare da un compagno)!')}
function lvrTick(){if(!ZZ||!ZZ.dg)return;const down=ents.find(e=>e.k==='po'&&e.seal);if(!down)return;const pe=lvrPeers();if(pe.open){lvrUnseal(0);return}
  const a=LVR.on.L1>t||pe.L1,b=LVR.on.L2>t||pe.L2;if(a&&b)lvrUnseal(0)}
const _upd743l=upd;upd=function(dt){_upd743l(dt);try{lvrTick()}catch(e){}};
// presenza: le mie leve tirate (e se il piano è già aperto)
{const sp0=syncPack;syncPack=function(){const o=sp0()||{};if(ZZ&&ZZ.dg){const L=[];for(const k in LVR.on)if(LVR.on[k]>t)L.push(k);if(L.length)o.lvr=L;if(LVR.open[lvrKey()])o.lvo=1}return o}}
// la scala chiusa non si usa; la leva si tira con R o con un clic
ITK.add('lev');
const _act743l=act;act=function(e){if(e&&e.k==='lev'){lvrPull(e);return}if(e&&e.k==='po'&&e.seal){msg('Una grata di ferro chiude la scala. Tira le due leve del piano nello stesso momento.');tone(150,.2);return}_act743l(e)};
// disegno: la leva (su o giù, con la luce che si spegne quando il tempo finisce) e la grata davanti alla scala
const _ent743l=ent;ent=function(e){if(e.k==='lev'){const on=e.done||LVR.on[e.id]>t||lvrPeers()[e.id],k=e.done?1:on?Math.max(0,(LVR.on[e.id]-t)/LVR_T):0;
    const L=[[-.22,-.16,0,.44,.32,5,'#5a5652'],[-.18,-.12,5,.36,.24,3,'#6e6a64'],[-.05,-.05,8,.1,.1,4,'#3a3a3a']];
    if(on)L.push([0,-.04,8,.34,.08,3,'#8a6a42'],[.3,-.06,8,.1,.12,4,'#c0392b']);else L.push([-.04,-.04,12,.08,.08,16,'#8a6a42'],[-.06,-.06,28,.12,.12,4,'#c0392b']);
    if(on&&!e.done)L.push([-.07,.12,6,.14,.04,3,k>.3?'#7aff7a':'#ffd84a',1.5]);else if(e.done)L.push([-.07,.12,6,.14,.04,3,'#7affea',1.5]);
    if(SET.shad){g.fillStyle='rgba(0,0,0,.28)';g.beginPath();g.ellipse(PX(e.px,e.py),PY(e.px,e.py,0),12,6,0,0,6.3);g.fill()}
    drawL(L,e.px,e.py,0,e.fl>0);return}
  _ent743l(e);
  if(e.k==='po'&&e.seal){const c='#5a5a62',c2='#3a3a42';for(let i=0;i<5;i++)box(e.px-.42+i*.2,e.py+.38,0,.05,.05,40,c);box(e.px-.46,e.py+.37,12,.92,.06,3,c2);box(e.px-.46,e.py+.37,30,.92,.06,3,c2)}};
