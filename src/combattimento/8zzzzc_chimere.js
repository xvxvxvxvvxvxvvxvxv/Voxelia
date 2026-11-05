/* ================= 7.55: LE CHIMERE — armi, armature e compagni nati mescolando i pezzi =================
   Niente modelli nuovi disegnati a mano: si prendono i pezzi di quelli che ci sono già e si montano insieme.
   - ARMI: la testa di un'arma sull'impugnatura di un'altra (la lama di un'ascia sull'asta di una lancia, la testa di un
     martello sul manico di un pugnale...). Combatte come la sua testa (mosse, mossa speciale), il nome dice da dove viene.
   - ARMATURE: un elmo con la cresta o le punte di un altro, una corazza con gli spallacci di un'altra, uno scudo con le
     decorazioni di un altro, con un secondo colore.
   - COMPAGNI: il corpo di una specie con la testa (e, se le ha, le ali) di un'altra. Si fanno al Serraglio, nascono dalle
     Uova chimera e a volte se ne incontrano nei dungeon (si possono domare).
   Gli oggetti chimera si trovano come bottino (raramente) o si creano alla Fucina di Borin fondendo due oggetti dello stesso
   tipo. In rete il tipo viaggia come gli altri ("axe~spr~2" al posto di "axe"): chi ti vede vede la tua arma vera. */
const MX55T={w:EQT.w,h:EQT.h,c:EQT.c,s:EQT.s};
const MX55N={swd:'Spada',dag:'Pugnale',axe:'Ascia',ham:'Martello',spr:'Lancia',tri:'Tridente',stf:'Bastone',scy:'Falce',helm:'Elmo',crn:'Corona',hood:'Cappuccio',mask:'Maschera',plate:'Corazza',mail:'Cotta di maglia',robe:'Tunica',kite:'Scudo',buck:'Brocchiere',pav:'Pavese'};
const MX55E=['della Chimera','dei Due Mondi','dell\'Innesto','della Fusione','del Mastro Pazzo','dell\'Altra Dimensione','di Nessuna Forgia','del Gemello Storto'];
const MX55C=['#2a2a32','#d4af37','#8a5a2a','#c0c8d8','#6a3a9a','#2a8a6a'];
// la quota dove finisce l'impugnatura e comincia la testa, per ogni arma (la stessa scala di wpnL)
const MX55Z={swd:14.5,dag:13.4,axe:21.6,ham:27,spr:38,tri:36.2,stf:36.4,scy:38.4};
const mxSlot=code=>{const p=String(code||'').split('~');if(p.length!==3)return null;for(const s of'whcs')if(MX55T[s].includes(p[0])&&MX55T[s].includes(p[1])&&p[0]!==p[1])return s;return null};
const mxParts=code=>{const p=String(code).split('~');return{a:p[0],b:p[1],v:clamp(p[2]|0,0,MX55C.length-1)}};
// ---- i modelli ----
function mxCut(L,z,up){const R2=[];for(const b of L){const z0=b[2],z1=b[2]+b[5];if(up){if(z1<=z)continue;const q=b.slice();if(z0<z){q[2]=z;q[5]=z1-z}R2.push(q)}else{if(z0>=z)continue;const q=b.slice();if(z1>z)q[5]=z-z0;R2.push(q)}}return R2}
function mxWpn(code,c){const{a,b,v}=mxParts(code),A=wpnL0(a,c),B=wpnL0(b,MX55C[v]),za=MX55Z[a]||14,zb=MX55Z[b]||14,dz=zb-za;
  return mxCut(B,zb,0).concat(mxCut(A,za,1).map(q=>{q[2]+=dz;return q}))}
function mxHelm(code,c){const{a,b,v}=mxParts(code),c2=MX55C[v];return helmL0(a,c).concat(helmL0(b,c2).filter(q=>q[2]>=31.5||(q[1]+q[4]>=.125&&q[5]<=5)))}
function mxArm(code,c){const{a,b,v}=mxParts(code),c2=MX55C[v];return armL0(a,c).concat(armL0(b,c2).filter(q=>Math.abs(q[0]+q[3]/2)>=.24).map(q=>{const o=q.slice();o[1]-=.005;o[4]+=.01;return o}))}
function mxShd(code,c){const{a,b,v}=mxParts(code),c2=MX55C[v];return shdL0(a,c).concat(shdL0(b,c2).filter(q=>q[6]===EQG||q[1]+q[4]>=.145||q[5]<=2).map(q=>{const o=q.slice();o[1]+=.006;return o}))}
const wpnL0=wpnL,helmL0=helmL,armL0=armL,shdL0=shdL;
wpnL=function(ty,c){return String(ty).includes('~')?mxWpn(ty,c):wpnL0(ty,c)};
helmL=function(ty,c){return String(ty).includes('~')?mxHelm(ty,c):helmL0(ty,c)};
armL=function(ty,c){return String(ty).includes('~')?mxArm(ty,c):armL0(ty,c)};
shdL=function(ty,c){return String(ty).includes('~')?mxShd(ty,c):shdL0(ty,c)};
// i tipi dell'equipaggiamento indossato (modello dell'eroe, in rete, nei ritratti)
{const f0=tyFix;tyFix=function(v){const o=f0(v);if(v&&typeof v!=='object'){const p=String(v).split('.');[...'whcs'].forEach((s,i)=>{if(p[i]&&p[i].includes('~')&&mxSlot(p[i])===s)o[s]=p[i]})}else if(v&&typeof v==='object')for(const s of'whcs')if(v[s]&&String(v[s]).includes('~')&&mxSlot(v[s])===s)o[s]=v[s];return o}}
{const e0=eqTy;eqTy=function(eq){const o=e0(eq);for(const s of'whcs'){const it=eq&&eq[s];if(it&&it.mx55&&mxSlot(it.mx55)===s)o[s]=it.mx55}return o}}
// le icone e i modellini a terra
function mxModel(code,c){const s=mxSlot(code);if(!s)return[];const X=.37;
  if(s==='w')return mxWpn(code,c).map(b=>[(b[0]-X)*1.7,b[1]*1.7,b[2]-8.8,b[3]*1.7,b[4]*1.7,b[5],b[6]]);
  const L=s==='h'?mxHelm(code,c):s==='c'?mxArm(code,c):mxShd(code,c),k=s==='s'?2.4:2.2;return L.map(b=>[b[0]*k,b[1]*k,(b[2]-(s==='h'?16:0))*1.1,b[3]*k,b[4]*k,b[5]*1.1,b[6]])}
{const i0=icon;icon=function(it){if(!it||!it.mx55||!mxSlot(it.mx55))return i0(it);const r=clamp(it.r|0,0,4),k='mx55|'+it.mx55+'|'+r;if(ICO[k])return ICO[k];
  const big=document.createElement('canvas');big.width=big.height=256;const og=g,bg=big.getContext('2d');g=bg;g.setTransform(2.4,0,0,2.4,128,200);try{drawL(mxModel(it.mx55,RC[r]),0,0,0)}finally{g=og}
  const d=bg.getImageData(0,0,256,256).data;let x0=256,y0=256,x1=-1,y1=-1;for(let y=0;y<256;y++)for(let x=0;x<256;x++)if(d[(y*256+x)*4+3]>8){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y}
  if(x1<0)return ICO[k]=i0(it);const out=document.createElement('canvas');out.width=out.height=96;const o=out.getContext('2d'),bw=x1-x0+1,bh=y1-y0+1,sc=Math.min(80/bw,80/bh);
  o.shadowColor='rgba(0,0,0,.55)';o.shadowBlur=4;o.shadowOffsetY=2;o.drawImage(big,x0,y0,bw,bh,48-bw*sc/2,48-bh*sc/2,bw*sc,bh*sc);
  // il segno della chimera: un piccolo innesto in basso a destra
  o.shadowBlur=0;o.fillStyle='#1a1030';o.beginPath();o.arc(82,82,11,0,6.3);o.fill();o.fillStyle='#d8a0ff';o.font='bold 14px Georgia,serif';o.textAlign='center';o.textBaseline='middle';o.fillText('✦',82,83);
  return ICO[k]=out.toDataURL()}}
{const d0=dropL;dropL=function(it){if(!it||!it.mx55||!mxSlot(it.mx55))return d0(it);const k='mx55|'+it.mx55+'|'+(it.r|0);let L=DRC.get(k);if(!L){L=scl(mxModel(it.mx55,RC[clamp(it.r|0,0,4)]),.42);DRC.set(k,L)}return L}}
// ---- il generatore ----
function mxName(s,a,b,seed){const r=sd(hs('mx55n|'+seed)),e=MX55E[Math.floor(r()*MX55E.length)];return MX55N[a]+'-'+MX55N[b].toLowerCase()+' '+e}
function mxMake(s,a,b,o){o=o||{};const v=o.v!=null?o.v:Math.floor(Math.random()*MX55C.length),code=a+'~'+b+'~'+v,lv=Math.max(1,o.lv|0||P&&P.lv||1),r=clamp(o.r!=null?o.r:1,0,3);
  const base=Math.round(ibase(s,lv)*RM[r]*(.95+Math.random()*.2)*1.08),seed=uid(),it={u:uid(),s,r,v:o.val||base,n:mxName(s,a,b,seed),p:Math.round((o.val||base)*6),mx55:code,base:MX55N[a]};
  if(s==='w'&&(r>=2||Math.random()<.3))it.cr=ri(2,4+r*2);if(s!=='w'&&r>=2)it.hp=Math.round(ri(6,14)*(r)+lv*2);return it}
const mxRand=(s,lv,r)=>{const T=MX55T[s],a=T[Math.floor(Math.random()*T.length)];let b=a;while(b===a)b=T[Math.floor(Math.random()*T.length)];return mxMake(s,a,b,{lv,r})};
// il bottino: una volta ogni tanto, al posto di un oggetto normale, una chimera
{const i0=item;item=function(lv,minR=0,slot){const it=i0(lv,minR,slot);try{if(it&&!it.uq&&!it.ar&&!it.mx55&&(it.r|0)>=1&&Math.random()<.09&&MODE!=='ed'){const a=itype(it),T=MX55T[it.s];if(T&&T.includes(a)){let b=a;while(b===a)b=T[Math.floor(Math.random()*T.length)];
    it.mx55=a+'~'+b+'~'+Math.floor(Math.random()*MX55C.length);it.base=MX55N[a];it.n=mxName(it.s,a,b,it.u);it.v=Math.round(it.v*1.08);it.p=Math.round((it.p||0)*1.25);if(typeof elName==='function')elName(it)}}}catch(e){console.warn('chimere',e)}return it}}
// ---- la Fusione alla Fucina di Borin: due oggetti dello stesso tipo diventano una chimera ----
const FU55={a:null,b:null};
const fuAll=()=>{const L=[];for(const s of'whcs'){const it=P.eq[s];if(it)L.push({it,eq:1})}for(const it of P.inv)if(it&&'whcs'.includes(it.s))L.push({it,eq:0});return L.filter(o=>!o.it.ar&&!o.it.uq&&!(o.it.q||o.it.k))};
const fuFind=u=>fuAll().find(o=>o.it.u===u);
const fuCost=(a,b)=>Math.round(220+(P.lv|0)*28+((a.r|0)+(b.r|0))*90);
const fuTy=it=>it.mx55&&mxSlot(it.mx55)?mxParts(it.mx55).a:itype(it);
function fuHTML(){const A=FU55.a&&fuFind(FU55.a),B=FU55.b&&fuFind(FU55.b);let h=`<h4>🧬 Fusione: crea un oggetto chimera</h4><p class="x43t">Scegli due oggetti dello stesso tipo (due armi, due elmi, due corazze o due scudi): Borin li fonde in uno nuovo, mai visto, con la testa del primo e il resto del secondo. Prende la rarità più alta, un po' più di forza del migliore e l'elemento, se ne avevano uno.</p>`;
  const L=fuAll(),row=o=>{const it=o.it,on=FU55.a===it.u?'A':FU55.b===it.u?'B':'';return`<div class="it fu55${on?' on':''}"><span><img class="ii" src="${icon(it)}" alt=""><b style="color:${RC[it.r]}">${esc(iname(it))}</b> <span class="mu">${SN[it.s]}${o.eq?' · indossato':''}</span></span><span><button class="${on==='A'?'on':''}" onclick="fuPick('a','${it.u}')">Testa</button><button class="${on==='B'?'on':''}" onclick="fuPick('b','${it.u}')">Resto</button></span></div>`};
  if(A&&B){const ok=A.it.s===B.it.s,c=fuCost(A.it,B.it),ta=fuTy(A.it),tb=fuTy(B.it);
    h+=`<div class="qb">${ok?ta===tb?`<b>Sono dello stesso modello</b>: la fusione mescola modelli diversi (per esempio un'ascia e una lancia).`:`Nascerà: <b>${MX55N[ta]}-${MX55N[tb].toLowerCase()}</b> · ${SN[A.it.s]} · rarità <b style="color:${RC[Math.max(A.it.r|0,B.it.r|0)]}">${RN[Math.max(A.it.r|0,B.it.r|0)]}</b><br><button ${P.g<c?'disabled':''} onclick="fuDo()">🧬 Fondi · ${c}💰</button> <span class="mu">I due oggetti spariscono.</span>`:'<b>Devono essere dello stesso tipo</b> (due armi, due elmi...).'}</div>`}
  h+=`<details class="fu55l"${A||B?' open':''}><summary>Scegli gli oggetti (${L.length})</summary>${L.map(row).join('')||'<p class="mu">Non hai oggetti.</p>'}</details>`;return h}
function fuPick(k,u){FU55[k]=FU55[k]===u?null:u;if(FU55.a===FU55.b)FU55[k==='a'?'b':'a']=null;pn('smith')}
function fuDo(){const A=FU55.a&&fuFind(FU55.a),B=FU55.b&&fuFind(FU55.b);if(!A||!B||A.it.s!==B.it.s)return;const s=A.it.s,ta=fuTy(A.it),tb=fuTy(B.it);if(ta===tb){msg('Servono due modelli diversi');return}
  const c=fuCost(A.it,B.it);if(P.g<c){msg('Servono '+c+' monete');tone(150,.1);return}const r=Math.max(A.it.r|0,B.it.r|0)>3?3:Math.max(A.it.r|0,B.it.r|0),val=Math.round(Math.max(iv(A.it),iv(B.it))*1.08+Math.min(iv(A.it),iv(B.it))*.12);
  const it=mxMake(s,ta,tb,{r,val,lv:P.lv});const el=elOk(A.it.el)?A.it:elOk(B.it.el)?B.it:null;if(el&&s==='w'){it.el=el.el;it.elv=el.elv|0||1}if(A.it.cr||B.it.cr)it.cr=Math.max(A.it.cr|0,B.it.cr|0)+1;if(A.it.hp||B.it.hp)it.hp=Math.max(A.it.hp|0,B.it.hp|0)+5;elName(it);
  P.g-=c;for(const o of[A,B]){if(o.eq){for(const q of'whcs')if(P.eq[q]===o.it)P.eq[q]=null}else{const i=P.inv.indexOf(o.it);if(i>=0)P.inv.splice(i,1)}}
  if(!P.eq[s])P.eq[s]=it;else P.inv.push(it);if(!P.eq.w)P.eq.w={u:uid(),s:'w',r:0,v:3,n:'Pugnale',p:0};FU55.a=FU55.b=null;recalc();
  banner('🧬 '+it.n,'Un oggetto che prima non esisteva · '+SN[s]+(P.eq[s]===it?' · lo indossi':' · nello zaino'),'martello');jingle([60,63,67,72,75,79],.08,'triangle');if(cineOK())sparks(P.px,P.py,40,['#d8a0ff','#ffd84a','#ffffff'],140);hud();save();pn('smith')}
{const p0=pn;pn=function(m,arg){p0(m,arg);if(m!=='smith'||PM!=='smith'||!started)return;const pe=$('pn');if(!pe||pe.querySelector('.fu55w'))return;const ref=pe.querySelector('.inf55w')||[...pe.querySelectorAll('h4')].find(x=>/Potenziamento/.test(x.textContent));
  const h=`<div class="fu55w">${fuHTML()}</div>`;if(ref)ref.insertAdjacentHTML('beforebegin',h);else pe.insertAdjacentHTML('beforeend',h)}}
{const d0=ivDetail;ivDetail=function(){let h=d0();try{const f=IVSEL&&ivFind(IVSEL);if(f&&f.it&&f.it.mx55&&mxSlot(f.it.mx55)){const{a,b}=mxParts(f.it.mx55);h+=`<div class="el55c" style="--c:#d8a0ff"><b>✦ Chimera</b><small>Testa di ${MX55N[a].toLowerCase()}, resto di ${MX55N[b].toLowerCase()}${f.it.s==='w'?' · combatte come '+(MX55N[a]==='Spada'?'una spada':MX55N[a]==='Pugnale'||MX55N[a]==='Martello'||MX55N[a]==='Bastone'||MX55N[a]==='Tridente'?'un '+MX55N[a].toLowerCase():'una '+MX55N[a].toLowerCase()):''}</small></div>`}}catch(e){}return h}}
/* ---- i compagni chimera: il corpo di una specie con la testa (e le ali) di un'altra ---- */
function mxBox(L,ix){let x0=1e9,y0=1e9,z0=1e9,x1=-1e9,y1=-1e9,z1=-1e9;for(const i of ix){const b=L[i];if(!b)continue;x0=Math.min(x0,b[0]);y0=Math.min(y0,b[1]);z0=Math.min(z0,b[2]);x1=Math.max(x1,b[0]+b[3]);y1=Math.max(y1,b[1]+b[4]);z1=Math.max(z1,b[2]+b[5])}return x1<x0?null:{x0,y0,z0,x1,y1,z1,cx:(x0+x1)/2,cy:(y0+y1)/2,w:Math.max(x1-x0,y1-y0),h:z1-z0}}
function petChim(A,B){if(!A||!B||!A.g||!B.g||!A.g.hd||!B.g.hd||!A.length||!B.length)return A;const drop=new Set([...(A.g.hd||[]),...(A.g.jw||[])]);
  const out=[],g2={},push=(grp,b)=>{(g2[grp]=g2[grp]||[]).push(out.length);out.push(b)};
  for(const grp in A.g)for(const i of A.g[grp])if(!drop.has(i)&&A[i])push(grp,A[i].slice());
  // pezzi senza gruppo (non dovrebbero esserci): si tengono
  const inG=new Set(Object.values(A.g).flat());for(let i=0;i<A.length;i++)if(!inG.has(i)&&!drop.has(i))(out.push(A[i].slice()));
  const ha=mxBox(A,[...(A.g.hd||[]),...(A.g.jw||[])]),hb=mxBox(B,[...(B.g.hd||[]),...(B.g.jw||[])]);if(!ha||!hb)return A;const s=clamp(Math.max(ha.w/(hb.w||1),ha.h/(hb.h||1))*.95,.55,1.7);
  const T=(b,o,ref)=>{const q=b.slice();q[0]=o.cx+(b[0]-ref.cx)*s;q[1]=o.cy+(b[1]-ref.cy)*s;q[2]=o.z+(b[2]-ref.z0)*s;q[3]*=s;q[4]*=s;q[5]*=s;return q};
  for(const grp of['hd','jw'])for(const i of B.g[grp]||[])if(B[i])push(grp,T(B[i],{cx:ha.cx,cy:ha.cy,z:ha.z0},hb));
  // le ali: se il primo non le ha e il secondo sì, gliele attacca sul dorso
  const W=['wl','wo','wr','wp'];if(!W.some(k=>A.g[k])&&W.some(k=>B.g[k])){const ba=mxBox(A,A.g.bd||[]),bb=mxBox(B,B.g.bd||[]);if(ba&&bb){const k2=clamp(ba.w/(bb.w||1),.5,1.5);
    for(const grp of W)for(const i of B.g[grp]||[])if(B[i]){const b=B[i],q=b.slice();q[0]=ba.cx+(b[0]-bb.cx)*k2;q[1]=ba.cy+(b[1]-bb.cy)*k2;q[2]=ba.z1-2+(b[2]-bb.z1)*k2;q[3]*=k2;q[4]*=k2;q[5]*=k2;push(grp,q)}}}
  out.g=g2;out.kind=A.kind;out.rg=A.rg||1;let top=0;for(const b of out)top=Math.max(top,b[2]+b[5]);out.top=Math.max(A.top||0,top);if(A.hm)out.hm=A.hm;return out}
const PM55=new Map();
// il modello di un compagno con tutto: forma (mutata), testa di chimera, taglia, variante
function petModel55(p,k){if(!p)return null;const fm=p.fm55&&pvType(p.fm55)?p.fm55:p.t,cm=p.cm55&&pvType(p.cm55)?p.cm55:'',sz=clamp(+p.sz55||1,.75,1.35);
  const key=[fm,cm,sz,p.lv>=20?2:p.lv>=10?1:0,p.vr||'',p.vh|0,k|0].join('|');let m=PM55.get(key);if(m)return m;
  m=pvBase(fm,p.lv);if(!m)return null;if(cm&&E[cm]&&E[cm].m){const B=pvBase(cm,p.lv);if(B)m=petChim(m,B)}
  if(sz!==1){if(m.rg)m=rgScale(m,sz);else{const L=scl(m,sz);for(const q of Object.keys(m))if(isNaN(+q))L[q]=m[q];L.top=(m.top||36)*sz;m=L}}
  if(pvOk(p.vr)){const V=PVR[p.vr],src=m;m=src.map(b=>{const o=b.slice(),c=pvHSL(b[6]);if(c){const[h,s,l]=V.f(c[0],c[1],c[2],{vh:p.vh},k|0);o[6]=pvHex(h,s,l)}return o});for(const q of Object.keys(src))if(isNaN(+q))m[q]=src[q]}
  if(PM55.size>300)PM55.clear();PM55.set(key,m);return m}
const petFancy=p=>!!(p&&(p.fm55||p.cm55||(p.sz55&&p.sz55!==1)));
// il compagno in campo, la stalla e quelli degli altri usano il modello completo
{const s0=domSummon;domSummon=function(){s0();const e=DOM.pet;if(e&&e.p&&petFancy(e.p))e.m=petModel55(e.p,e.p.vr==='rgb'?pvStep():0)||e.m}}
{const u0=upd;upd=function(dt){u0(dt);if(!started||!P)return;try{const e=DOM.pet;if(e&&e.p&&petFancy(e.p)&&ents.includes(e))e.m=petModel55(e.p,e.p.vr==='rgb'?pvStep():0)||e.m;
  if(typeof NET!=='undefined'&&NET.ok)for(const id in PV.rp){const r=PV.rp[id],q=NET.peers[id];if(!r||!q||!Array.isArray(q.cp))continue;const x=q.cp[12];if(x&&typeof x==='object'){const pp={t:r.t,lv:r.lv,vr:r.p.vr,vh:r.p.vh,fm55:String(x.f||'').slice(0,60),cm55:String(x.c||'').slice(0,60),sz55:+x.z||1};if(petFancy(pp))r.m=petModel55(pp,pp.vr==='rgb'?pvStep():0)||r.m;r.el55=elOk(x.e)?x.e:null}}}catch(err){console.warn('chimere',err)}}}
{const sp0=syncPack;syncPack=function(){const o=sp0()||{};const e=DOM.pet;if(o.cp&&e&&e.p){const p=e.p;o.cp[12]={f:p.fm55||'',c:p.cm55||'',z:+p.sz55||1,e:typeof petEl==='function'?petEl(p):''}}return o}}
function petPaint(cv,p){if(!cv||!p)return;const q=cv.getContext('2d'),W2=cv.width,H2=cv.height;q.setTransform(1,0,0,1,0,0);q.clearRect(0,0,W2,H2);pvType(p.t);const m=petModel55(p,p.vr==='rgb'?pvStep():0);if(!m)return;
  let top=0;for(const b of m)top=Math.max(top,(b[2]||0)+(b[5]||0));const sc=Math.min(2.2*W2/76,(H2*.76)/(top+6)),og=g;g=q;
  try{q.setTransform(sc,0,0,sc,W2/2,H2*.9);if(pvOk(p.vr)&&PVR[p.vr].a)q.globalAlpha=PVR[p.vr].a;if(m.rg||m.hm)drawHero(m,0,0,0,0,3);else drawL(m,0,0,0)}catch(_){}finally{q.globalAlpha=1;g=og}}
domPaint=function(){const pe=$('pn');if(!pe)return;for(const c of pe.querySelectorAll('canvas.dmpv')){const p=P.pets[+c.dataset.i];if(p)petPaint(c,p)}};
// i mostri chimera nei dungeon: rari, più forti, si possono domare (e il compagno resta chimera)
{const m0=mk;mk=function(t2,x,y,id){const e=m0(t2,x,y,id);try{const z=ZZ;if(e&&e.k==='en'&&z&&z.dg&&!e.boss&&!(e.b&&e.b.boss)&&Array.isArray(z.en)&&z.en.length>1&&MODE!=='ed'){const h=hs('ch55|'+Zk+'|'+(z.run|0)+'|'+x+'|'+y+'|'+t2);
    if(h%100<7){const L=z.en.filter(k=>k!==t2&&E[k]&&E[k].m&&E[k].m.g),b=L[(h>>>8)%Math.max(1,L.length)];if(b&&e.m&&e.m.g){e.cm55=b;e.m=petChim(e.m,E[b].m);e.n='Chimera '+(e.n||E[t2].n)+'-'+String(E[b].n||b).split(/\s+/)[0].toLowerCase();e.mx=Math.round(e.mx*1.3);e.hp=e.mx;e.xp=Math.round((e.xp||10)*1.5);e.chim55=1}}}}catch(err){console.warn('chimere',err)}return e}}
{const t0=domTick;domTick=function(dt){const C=DOM.cap,n0=Array.isArray(P.pets)?P.pets.length:0;t0(dt);if(C&&C.e&&C.e.cm55&&Array.isArray(P.pets)&&P.pets.length>n0){const p=P.pets[P.pets.length-1];if(p&&!p.cm55){p.cm55=C.e.cm55;p.n=String(p.n).replace(/^Chimera\s+/,'');if(DOM.pet&&DOM.pet.p===p)domSummon();save()}}}}
// la chimera si riconosce: un alone viola
{const e0=ent;ent=function(e){e0(e);if(e&&e.k==='en'&&e.chim55&&cineOK()&&Math.random()<.2)sparks(e.px+(Math.random()-.5)*.6,e.py+(Math.random()-.5)*.6,1,['#d8a0ff','#7a3aff'],30)}}
document.head.insertAdjacentHTML('beforeend',`<style>
.fu55w{border:1px solid #d8a0ff55;border-radius:6px;padding:4px 10px;margin:8px 0;background:rgba(150,90,255,.06)}.fu55.on{background:rgba(216,160,255,.12)}.fu55l summary{cursor:pointer;margin:4px 0}
</style>`);
