/* ================= 7.21: TERRITORI, INSEDIAMENTO E FAZIONI =================
   TERRITORI (tasto U): in una regione selvaggia pianti lo stendardo e la conquisti abbattendo i suoi mostri. Quando la
   conquista arriva al 100% la regione è tua: i mostri se ne vanno e non tornano più, e sulla mappa prende i tuoi colori.
   Le terre delle fazioni sono difese dalle loro guardie, e prenderle costa reputazione con quella fazione.
   INSEDIAMENTO: in una regione conquistata fondi il tuo borgo. Cresce di livello (fino a 5: più case, più abitanti, più
   largo), e ci costruisci mercato, fucina, tempio, locanda, stalla, granaio, palizzata e torri di guardia. Lo personalizzi
   con nome, colori dei tetti e decorazioni. Ogni giorno raccoglie tasse e raccolto da ritirare. Diventa casa tua.
   FAZIONI (tasto Y): le sei fazioni di Tomorrow hanno una città sede, uno stemma, un emissario e le loro terre intorno.
   Puoi unirti a una di loro (paghe e reputazione migliori nei loro contratti) o fondare la tua, con lo stemma che disegni. */
const CRSH=['Scudo','Tondo','Stendardo','Rombo'],CRDV=['Pieno','Partito','Troncato','Banda','Croce'],CRSY=['Corona','Spada','Torre','Stella','Luna','Albero','Lupo','Sole','Onda','Fiamma','Chiave','Occhio'];
const CRCOL=['#c0392b','#e67e22','#f1c40f','#27ae60','#16a085','#2980b9','#8e44ad','#2c3e50','#ecf0f1','#7f5539','#d4af37','#1a1a1a'];
const CRSHP=['M10 8H90V50C90 78 70 96 50 104C30 96 10 78 10 50Z','M50 11A44 44 0 1 1 49.9 11Z','M14 6H86V100L50 82L14 100Z','M50 4L94 55L50 106L6 55Z'];
const CRSYP=(()=>{const st=[];for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2?9:22;st.push((50+Math.cos(a)*r).toFixed(1)+' '+(56+Math.sin(a)*r).toFixed(1))}
  let sun='M50 44A12 12 0 1 1 49.9 44Z';for(let i=0;i<8;i++){const a=i*Math.PI/4,c=Math.cos(a),s=Math.sin(a);sun+=`M${(50+c*16).toFixed(1)} ${(56+s*16).toFixed(1)}L${(50+c*25+s*3).toFixed(1)} ${(56+s*25-c*3).toFixed(1)}L${(50+c*25-s*3).toFixed(1)} ${(56+s*25+c*3).toFixed(1)}Z`}
  return['M30 70L30 48L40 58L50 40L60 58L70 48L70 70Z','M48 28h4v38h8v4h-8v10h-4v-10h-8v-4h8Z','M36 80V50h4v-7h5v7h10v-7h5v7h4v30h-10v-10h-8v10Z','M'+st.join('L')+'Z',
    'M60 34A22 22 0 1 0 60 78A17 17 0 1 1 60 34Z','M50 28L66 54H57L68 68H54V82H46V68H32L43 54H34Z','M33 40L42 51L50 47L58 51L67 40L65 63L50 80L35 63Z',sun,
    'M24 60Q32 48 40 60T56 60T72 60T78 60V70Q70 58 62 70T46 70T30 70T24 70Z','M50 28C63 44 71 54 63 70C58 80 42 80 37 70C31 58 42 49 44 41C48 50 53 50 50 28Z',
    'M50 26A10 10 0 1 1 49.9 26ZM50 31A5 5 0 1 0 50.1 31ZM47.5 45h5v24h8v5h-8v4h6v5h-6v3h-5Z','M22 56Q50 32 78 56Q50 80 22 56ZM50 47A9 9 0 1 0 50.1 47Z']})();
const lum=c=>{const n=parseInt(c.slice(1),16);return((n>>16)*.3+(n>>8&255)*.59+(n&255)*.11)/255};
function crestSVG(c,sz=48){c=c||{};const sh=CRSHP[c.sh|0]||CRSHP[0],c1=c.c1||'#2980b9',c2=c.c2||'#ecf0f1',id='cr'+Math.random().toString(36).slice(2,8);
  const dv=[``,`<rect x="50" y="0" width="50" height="110" fill="${c2}"/>`,`<rect x="0" y="55" width="100" height="55" fill="${c2}"/>`,`<path d="M0 22L22 0L100 78L78 100L100 110H90L0 22Z" fill="${c2}"/>`,`<rect x="41" y="0" width="18" height="110" fill="${c2}"/><rect x="0" y="46" width="100" height="18" fill="${c2}"/>`][c.dv|0]||'';
  const sc=(c.dv|0)?(lum(c1)>.6?'#1a1a1a':'#ffffff'):c2,sy=CRSYP[c.sy|0]||'';
  return`<svg class="crest" width="${sz}" height="${Math.round(sz*1.1)}" viewBox="0 0 100 110"><defs><clipPath id="${id}"><path d="${sh}"/></clipPath></defs><g clip-path="url(#${id})"><rect width="100" height="110" fill="${c1}"/>${dv}</g><path d="${sy}" fill="${sc}" fill-rule="evenodd" stroke="${sc==='#ffffff'?'#0006':'#fff6'}" stroke-width="1.2"/><path d="${sh}" fill="none" stroke="#d4af37" stroke-width="4"/><path d="${sh}" fill="none" stroke="#2a1a0a" stroke-width="1.5"/></svg>`}
const CRIMG=new Map();function crestImg(c){const k=JSON.stringify(c);let i=CRIMG.get(k);if(i)return i;i=new Image();i.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(crestSVG(c,48).replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" '));CRIMG.set(k,i);return i}
const TWFCR={lega:{sh:0,dv:1,c1:'#3e7a2e',c2:'#d4af37',sy:2},carto:{sh:1,dv:0,c1:'#2980b9',c2:'#ecf0f1',sy:3},fiamma:{sh:0,dv:2,c1:'#c0392b',c2:'#e67e22',sy:9},strada:{sh:2,dv:3,c1:'#d4af37',c2:'#7f5539',sy:10},custodi:{sh:3,dv:0,c1:'#8e44ad',c2:'#ecf0f1',sy:11},clan:{sh:0,dv:4,c1:'#7f5539',c2:'#2c3e50',sy:6}};
/* ---- dati ---- */
function rgFix(){const T=P.tw;if(!T)return;T.terr=T.terr||{};T.cqp=T.cqp||{};T.met=T.met||{};if(T.cq&&!T.cq.k)T.cq=null;if(T.set&&!T.set.k)T.set=null;if(T.set){T.set.b=T.set.b||{};T.set.dec=T.set.dec||{}}}
const twMyF=()=>P.tw&&P.tw.fj||null;
function twFac(f){if(f==='mia'){const M2=P.tw.myf;return M2?{n:M2.n,c:M2.cr.c1,cr:M2.cr,mot:M2.mot,mine:1}:null}const F=OWF[f];return F?{n:F.n,c:F.c,cr:TWFCR[f]||{c1:F.c},mot:''}:null}
const myCrest=()=>{const f=twMyF();const F=f&&twFac(f);return F?F.cr:{sh:0,dv:0,c1:'#d4af37',c2:'#2a1a0a',sy:0}};
let TWFH=null,TWFHS=null;
function twFacHomes(){const s=twSeed();if(TWFHS===s&&TWFH)return TWFH;const L=[];for(let r=2;r<=18&&L.length<8;r++)for(let y=-r;y<=r;y++)for(let x=-r;x<=r;x++)if(Math.max(Math.abs(x),Math.abs(y))===r&&twCity(x,y))L.push([x,y]);
  const ord=TWFK.slice().sort((a,b)=>twI(hs(a)%997,7,131)-twI(hs(b)%997,7,131));TWFH={};ord.forEach((k,i)=>{if(L[i])TWFH[k]=L[i]});TWFHS=s;return TWFH}
function twOwner(rx,ry){const k=twK(rx,ry);if(P.tw&&P.tw.terr&&P.tw.terr[k])return{me:1,f:P.tw.terr[k].f||twMyF()};const H=twFacHomes();let best=null,bd=3;
  for(const f in H){const[hx,hy]=H[f],d=Math.max(Math.abs(rx-hx),Math.abs(ry-hy));if(d<=2&&d<bd){bd=d;best=f}}return best?{f:best}:null}
const twHomeOf=(rx,ry)=>{const H=twFacHomes();for(const f in H)if(H[f][0]===rx&&H[f][1]===ry)return f;return null};
/* ---- la conquista ---- */
const twCanConq=()=>twOn()&&String(Zk).startsWith('tw:')&&ZZ&&!ZZ.vil&&!ZZ.city;
function twConqStart(){rgFix();if(!twCanConq()){msg('Si conquistano le regioni selvagge: non villaggi, città o dungeon');return}if(P.tw.terr[Zk]){msg('Questa regione è già tua');return}if(P.tw.cq&&P.tw.cq.k===Zk)return;
  const resume=P.tw.cqp[Zk]>0;if(!resume&&P.g<100){msg('Servono 100 monete per lo stendardo');tone(150,.1);return}if(!resume)P.g-=100;
  const own=twOwner(ZZ.rx,ZZ.ry),need=Math.max(6,Math.round(ents.filter(e=>e.k==='en'&&!e.owt&&!e.bt).length*.6));P.tw.cq={k:Zk,need,c:P.tw.cqp[Zk]||0,f:own&&!own.me?own.f:null};
  const[x,y]=nearFree(P.px|0,(P.py|0)-1);ents.push({k:'twbn',n:'Il tuo stendardo',px:x+.5,py:y+.5,cr:myCrest(),cq:1});
  if(own&&!own.me){const F=twFac(own.f);P.ow.rep[own.f]=(P.ow.rep[own.f]|0)-25;OW.gar={k:Zk,f:own.f,w:0,t:t+4,n:3};banner('Guerra con '+F.n,'Le loro guardie difendono queste terre · reputazione −25','spade')}
  else banner('Lo stendardo è piantato','Abbatti i mostri della regione per conquistarla','bandiera');jingle([60,64,67,72],.1,'triangle');save();cl()}
function twConqKill(e){const Q=P.tw&&P.tw.cq;if(!Q||Q.k!==Zk||e.k!=='en'||e.owt)return;Q.c=Math.min(100,Q.c+(e.boss||e.elite||(e.n&&/^Campione|^Guardia/.test(e.n))?2:1)*100/Q.need);P.tw.cqp[Zk]=Q.c;
  flt(P,'Conquista '+Math.floor(Q.c)+'%','#ffd84a');if(Q.c>=100)twConqDone()}
function twConqDone(){const Q=P.tw.cq,k=Q.k;P.tw.cq=null;delete P.tw.cqp[k];P.tw.terr[k]={d:gDay(),f:twMyF()};OW.gar=null;
  for(const e of ents.slice())if(e.k==='en'&&!e.owt&&!e.bt){if(cineOK())sparks(e.px,e.py,10,['#ffe28a','#ffffff'],80);ents.splice(ents.indexOf(e),1)}
  for(const b of ents)if(b.k==='twbn'&&b.cq){b.cq=0;b.n='Stendardo · '+ZZ.n}
  jingle([60,64,67,72,76,79,84],.1,'triangle');banner(ZZ.n+' è tua!','I mostri se ne vanno e non tornano più · qui puoi fondare il tuo insediamento (U)','corona');gainXP(60+ZZ.lv*30);save();hud()}
function twGarTick(dt){const G=OW.gar;if(!G)return;if(Zk!==G.k){OW.gar=null;return}if(t<G.t||G.w>=G.n)return;G.w++;G.t=t+14;const F=twFac(G.f),Q=P.tw.cq;
  const types=['cavaliere','bandito','guardia_reale','soldato'].filter(x=>E[x]),bn=ents.find(e=>e.k==='twbn'&&e.cq)||P;
  for(let i=0;i<3+G.w;i++){const a=Math.random()*6.283,[x,y]=nearFree(clamp(Math.round(bn.px+Math.cos(a)*7),2,N-3),clamp(Math.round(bn.py+Math.sin(a)*7),2,N-3));const e=mk(types[i%types.length],x,y);
    e.n='Guardia di '+F.n.replace(/^(la |il |l')/i,'');e.al=1;e.hp=e.mx=Math.round(e.mx*(1+(ZZ.lv||1)*.08));if(i===0&&G.w===G.n){eliteMk(e);e.n='Capitano di '+F.n}ents.push(e)}
  msg('⚔ Arrivano le guardie di '+F.n+' (ondata '+G.w+' di '+G.n+')');tone(120,.3,'sawtooth',.05)}
/* ---- l'insediamento ---- */
const twSetAt=(rx,ry)=>!!(P&&P.tw&&((P.tw.set&&P.tw.set.k===twK(rx,ry))||(P.tw.sets||[]).some(s=>s&&s.k===twK(rx,ry))));
const TWSB={
  casa:{n:'Espansione',ic:'🏘',d:'Più case e abitanti, il borgo si allarga',max:5,cost:l=>[300*l,6*l]},
  mercato:{n:'Mercato',ic:'🛒',d:'Una bottega con il mercante; più tasse ogni giorno',max:3,cost:l=>[220*l,4*l]},
  fucina:{n:'Fucina',ic:'⚒',d:'Un fabbro per forgiare e potenziare',max:3,cost:l=>[260*l,6*l]},
  tempio:{n:'Tempio',ic:'⛪',d:'Una guaritrice; ogni giorno ti cura e ti protegge',max:3,cost:l=>[240*l,4*l]},
  locanda:{n:'Locanda',ic:'🍺',d:'Un oste e un letto per riposare',max:3,cost:l=>[200*l,5*l]},
  stalla:{n:'Stalla',ic:'🐾',d:'+4 posti per i compagni a ogni livello',max:3,cost:l=>[180*l,5*l]},
  granaio:{n:'Granaio',ic:'🌾',d:'Grano e mele ogni giorno e più tasse',max:3,cost:l=>[160*l,6*l]},
  mura:{n:'Palizzata',ic:'🪵',d:'Un recinto di pali intorno al borgo',max:3,cost:l=>[200*l,10*l]},
  torre:{n:'Torri di guardia',ic:'🗼',d:'Torri e guardie che difendono il borgo',max:3,cost:l=>[280*l,8*l]}};
const TWSD={fontana:['Fontana','⛲'],statua:['Statua dell\'eroe','🗿'],giardino:['Giardini','🌷'],lanterne:['Lanterne','🏮'],stendardi:['Stendardi','🚩']};
const TWSTH=[['Tetti rossi',['#e0d0b0','#c8b89a'],['#a8402f','#7a3a2a','#b8503a']],['Ardesia',['#c8c8c8','#a8a8b0'],['#3a4a5a','#2a3a4a','#4a5a6a']],['Bosco',['#8a6a4a','#7a5a3a'],['#4a6a3a','#3a5a2a','#5a7a4a']],['Oro e avorio',['#f0e8d8','#e8dcc0'],['#d4af37','#b8902a','#e0c050']],['Notte',['#5a5060','#4a4050'],['#3a2a5a','#2a1a4a','#4a3a6a']]];
const setLv=()=>P.tw.set?P.tw.set.lv|0:0,setB=k=>P.tw.set&&P.tw.set.b[k]|0;
function setRate(){const S=P.tw.set;if(!S)return 0;return 50*S.lv+35*setB('mercato')+25*setB('granaio')+10*setB('locanda')}
function setAccrue(){const S=P.tw.set;if(!S)return;const d=gDay();if(S.day==null)S.day=d;const n=Math.min(7,d-S.day);if(n>0){S.cash=(S.cash|0)+setRate()*n;S.food=(S.food|0)+setB('granaio')*3*n;S.day=d}}
function twSetGen(C,ends){const{F,disc,rnd,rr,n,hub,rx,ry,bio,tg,ok,z}=C,S=P.tw.set,[cx,cy]=hub,R=8+S.lv*3,th=TWSTH[S.col|0]||TWSTH[0];z.ham=1;z.set=1;z.n=S.n;
  disc(cx+.5,cy+.5,R,(x,y,d)=>{if(M[y][x]===2){if(d<R-1){M[y][x]=4;DEC[y][x]='~'}return}if(M[y][x]!==4)F(x,y,d<3.6?'4':d<4.6?'1':bio==='deserto'?'2':bio==='neve'?'':bio==='cenere'?'9':'2')});
  // la piazza
  const P6=(x,y,c)=>{if(ok(x,y)&&(M[y][x]===0||M[y][x]===4)){M[y][x]=6;DEC[y][x]=c;return 1}return 0};
  if(S.dec.fontana){for(const[a,b]of[[0,0],[1,0],[0,1],[1,1]]){M[cy+b][cx+a]=2;DEC[cy+b][cx+a]=''}for(const[a,b]of[[-1,0],[2,1],[0,-1],[1,2]])P6(cx+a,cy+b,'ɸ')}
  if(S.dec.statua)P6(cx-3,cy-3,'Y');if(S.dec.lanterne)for(const[a,b]of[[-4,-4],[5,-4],[-4,5],[5,5],[0,-6],[0,7],[-6,0],[7,0]])P6(cx+a,cy+b,'l');
  if(S.dec.giardino)for(let i=-2;i<=2;i++){P6(cx+i,cy+5,['g','q','v'][(i+9)%3]);P6(cx+i,cy-4,'v')}
  ents.push({k:'twbn',n:S.n,px:cx+3.5,py:cy-1.5,cr:myCrest(),set:1});if(S.dec.stendardi)for(const[a,b]of[[-3,3],[4,4]])ents.push({k:'twbn',n:S.n,px:cx+a+.5,py:cy+b+.5,cr:myCrest(),set:1});
  // gli edifici: prima quelli costruiti, poi le case
  const tra=ends.map(([x,y])=>Math.atan2(y-cy,x-cx)),kinds=[];for(const[b,kd]of[['mercato','bottega'],['fucina','fucina'],['tempio','tempio'],['locanda','locanda'],['stalla','casa'],['granaio','casa']])if(setB(b))kinds.push([b,kd]);
  const nh=kinds.length+2+S.lv*2,hs3=[];let a0=rnd()*6.283;
  for(let ring=0;ring<3&&hs3.length<nh;ring++){const rad=6.5+ring*4.5;if(rad>R-2)break;const steps=Math.floor(rad*1.1);for(let k=0;k<steps&&hs3.length<nh;k++){const a=a0+k*6.283/steps+ring*.4;if(tra.some(t2=>Math.abs(((a-t2)%6.283+9.425)%6.283-3.14159)<.42))continue;
      const sp=kinds[hs3.length],w=sp?4:rr(3,4),h=3,x=Math.round(cx+Math.cos(a)*rad-w/2),y=Math.round(cy+Math.sin(a)*rad-h/2);if(x<3||y<3||x+w>n-3||y+h>n-4)continue;
      if(hs3.some(b=>x<b.x+b.w+1&&x+w+1>b.x&&y<b.y+b.h+1&&y+h+1>b.y))continue;let bad=0;for(let v=y;v<=y+h;v++)for(let u=x;u<x+w;u++)if(M[v][u]===3||M[v][u]===2)bad=1;if(bad)continue;
      const b={x,y,w,h,wall:th[1][hs3.length%2],roof:th[2][Math.floor(rnd()*3)],ht:sp?26+setB(sp[0])*3:20+rr(0,5),smoke:rnd()<.5?1:0};hs3.push(b);twHouse(b,60+hs3.length,rx,ry,sp?sp[1]:'casa');tg.push([b.x+(b.w>>1),b.y+b.h])}}
  // la palizzata e le torri
  if(setB('mura'))for(let i=0;i<Math.round(R*6.3);i++){const a=i/(R*6.3)*6.283,x=Math.round(cx+.5+Math.cos(a)*(R-.5)),y=Math.round(cy+.5+Math.sin(a)*(R-.5));if(!ok(x,y)||M[y][x]!==0||DEC[y][x]===DN+'1'||DEC[y][x]===DN+'4')continue;
    if(tra.some(t2=>Math.abs(((a-t2)%6.283+9.425)%6.283-3.14159)<.16))continue;M[y][x]=1;DEC[y][x]=DN+'W'}
  if(setB('torre'))for(let i=0;i<4;i++){const a=.785+i*1.571,x=Math.round(cx+Math.cos(a)*(R-2.5))-1,y=Math.round(cy+Math.sin(a)*(R-2.5))-1;let bad=0;for(let v=y;v<y+2;v++)for(let u=x;u<x+2;u++)if(!ok(u,v)||M[v][u]===3||M[v][u]===2)bad=1;if(bad)continue;
    const b={x,y,w:2,h:2,wall:'#9a9284',roof:th[2][0],ht:40+setB('torre')*8};const k=TB.push(b)-1;for(let v=y;v<y+2;v++)for(let u=x;u<x+2;u++){M[v][u]=3;DEC[v][u]='';BM[v][u]=k}}
  // gli abitanti
  const ppl=[0];if(setB('mercato'))ppl.push(1);if(setB('fucina'))ppl.push(2);if(setB('tempio'))ppl.push(3);if(setB('locanda'))ppl.push(4);for(let i=0;i<S.lv+1;i++)ppl.push(i<3?6+i:14+i);for(let i=0;i<setB('torre')*2;i++)ppl.push(10+(i%4));
  ppl.forEach((i,j)=>{const id=twNpcId(rx,ry,i);const N2=twNpc(id);if(i===0&&N2){N2.n='Intendente '+N2.n.split(' ').pop();N2.ln=['Il borgo cresce, signore. Il tesoro e i lavori li trovi nel registro (tasto U).','La gente arriva da tutta la regione: qui ci si sente al sicuro.']}
    const a=j*2.4,[x,y]=nearFree(Math.round(cx+Math.cos(a)*(2.5+j%3)),Math.round(cy+Math.sin(a)*(2.5+j%3)));ents.push(mkNpc(id,x,y,{wd:i>=6&&i<10||i>=14?1:0}));tg.push([x,y])});
  if(S.lv>=2){const[x,y]=nearFree(cx-2,cy+2);ents.push({k:'owb',n:'Bacheca dei Contratti',px:x+.5,py:y+.5});tg.push([x,y])}
  return[cx,cy+2]}
function twSetFound(){rgFix();if(!twCanConq()||!P.tw.terr[Zk]){msg('Il borgo si fonda in una regione conquistata (U)');return}if(P.tw.set){msg('Hai già un insediamento: '+P.tw.set.n);return}if(P.g<500){msg('Servono 500 monete');tone(150,.1);return}
  const nm=(prompt('Il nome del tuo insediamento','Rocca di '+(NET.name||'Eroe'))||'').replace(/[<>]/g,'').trim().slice(0,28);if(!nm)return;P.g-=500;
  P.tw.set={k:Zk,n:nm,lv:1,b:{},dec:{},col:0,day:gDay(),cash:0,food:0,d0:gDay()};P.tw.home=Zk;setRebuild();jingle([60,64,67,72,76,79,84,88],.09,'triangle');banner(nm+' è nata!','Il tuo insediamento: costruisci, personalizza e fallo crescere (U)','corona');save()}
function setRebuild(){const S=P.tw.set;if(!S)return;if(typeof TWW!=='undefined')TWW.cache.delete(S.k);if(Z[S.k])Z[S.k].n=S.n;if(Zk===S.k){const ox=P.px,oy=P.py;load(S.k);if(WK(M[oy|0]&&M[oy|0][ox|0])){P.px=ox;P.py=oy}}}
function setBuy(b){const S=P.tw.set;if(!S)return;const B=TWSB[b],cur=b==='casa'?S.lv:setB(b);if(cur>=B.max)return;const[g0,l0]=B.cost(cur+1),lg=P.res.legna|0,miss=Math.max(0,l0-lg),g=g0+miss*20;
  if(P.g<g){msg('Non hai abbastanza oro');tone(150,.1);return}P.g-=g;P.res.legna=lg-Math.min(lg,l0);if(b==='casa')S.lv++;else S.b[b]=cur+1;jingle([67,72,76,79],.08,'triangle');banner(B.ic+' '+B.n+(b==='casa'?' · livello '+S.lv:' · livello '+S.b[b]),S.n+' cresce','martello');setRebuild();save();pn('regno')}
function setDec(k){const S=P.tw.set;if(!S)return;if(!S.dec[k]){if(P.g<120){msg('Servono 120 monete');return}P.g-=120;S.dec[k]=1}else S.dec[k]=0;setRebuild();save();pn('regno')}
function setTheme(i){const S=P.tw.set;if(!S)return;S.col=i;setRebuild();save();pn('regno')}
function setRename(){const S=P.tw.set;if(!S)return;const nm=(prompt('Nuovo nome',S.n)||'').replace(/[<>]/g,'').trim().slice(0,28);if(!nm)return;S.n=nm;setRebuild();save();pn('regno')}
function setCollect(){setAccrue();const S=P.tw.set;if(!S)return;const g=S.cash|0,f=S.food|0;if(!g&&!f){msg('Il tesoro è vuoto: torna domani');return}P.g+=g;S.cash=0;if(f){P.res.grano=(P.res.grano|0)+Math.ceil(f/2);P.res.mela=(P.res.mela|0)+Math.floor(f/2);S.food=0}
  if(cineOK())goldFly(g);banner('Il tesoro di '+S.n,g+' monete'+(f?' · '+f+' tra grano e mele':''),'moneta');save();hud();pn('regno')}
function setGo(){const S=P.tw.set;if(!S||!twOn())return;if(ZZ&&ZZ.dg){msg('Esci prima dal dungeon');return}cl();P.gt=(P.gt||0)+60;const go=()=>{load(S.k);banner(S.n,'Sei a casa','corona')};if(typeof irisGo==='function'&&cineOK())irisGo(go);else go()}
// il tempio del borgo: una volta al giorno cura e protegge
function setTemple(){const S=P.tw.set;if(!S||!setB('tempio')||Zk!==S.k)return;S.tp=S.tp||-1;if(S.tp===gDay())return;S.tp=gDay();P.hp=P.mx;P.bD=Math.max(P.bD||0,240+120*setB('tempio'));if(typeof domRest==='function')domRest();banner('Il tempio di '+S.n,'Ti cura e ti protegge per oggi','sole')}
/* ---- le fazioni ---- */
function facJoin(f){rgFix();if(f!=='mia'&&!P.tw.met[f]){msg('Prima incontra il suo emissario, nella città sede');return}P.tw.fj=f;const F=twFac(f);banner('Ti sei unito a '+F.n,f==='mia'?'':'Paghe e reputazione migliori nei loro contratti','bandiera');for(const k in P.tw.terr)P.tw.terr[k].f=f;save();pn('regno')}
function facLeave(){P.tw.fj=null;save();pn('regno')}
const RGF={sh:0,dv:1,c1:'#2980b9',c2:'#d4af37',sy:0,n:'',mot:''};
function facNew(){const c={sh:RGF.sh,dv:RGF.dv,c1:RGF.c1,c2:RGF.c2,sy:RGF.sy},n=($('rgfn')&&$('rgfn').value||'').replace(/[<>]/g,'').trim().slice(0,30),mot=($('rgfm')&&$('rgfm').value||'').replace(/[<>]/g,'').trim().slice(0,60);
  if(!n){msg('Dai un nome alla fazione');return}const edit=!!P.tw.myf;if(!edit){if(P.g<300){msg('Servono 300 monete per fondare una fazione');return}P.g-=300}
  P.tw.myf={n,mot,cr:c,d:gDay()};P.tw.fj='mia';for(const k in P.tw.terr)P.tw.terr[k].f='mia';CRIMG.clear();if(P.tw.set)setRebuild();jingle([60,64,67,72,79,84],.1,'triangle');banner(edit?'Stemma rinnovato':'Nasce '+n,mot||'La tua fazione','bandiera');save();RG.tab='fac';pn('regno')}
function facDisband(){if(!P.tw.myf||!confirm('Sciogliere '+P.tw.myf.n+'? Le tue terre restano tue, senza insegna.'))return;P.tw.myf=null;if(P.tw.fj==='mia')P.tw.fj=null;save();pn('regno')}
function rgPick(k,v){RGF[k]=v;const pv=$('rgfpv');if(pv)pv.innerHTML=crestSVG(RGF,96);document.querySelectorAll('.rgpk[data-k="'+k+'"] button').forEach(b=>b.classList.toggle('on',String(b.dataset.v)===String(v)))}
// gli emissari nelle città sede, con gli stendardi della fazione
function twEnvoys(){const p=twP(Zk);if(!p||!ZZ.city)return;const f=twHomeOf(p[0],p[1]);if(!f)return;const F=twFac(f),id='twem_'+f;
  NPCS[id]=NPCS[id]||{n:'Emissaria di '+F.n.replace(/^(la |il |l')/i,''),c:F.c,hat:'#d4af37',ln:['Queste sono le terre di '+F.n+'. Chi si unisce a noi lavora meglio e guadagna di più.','Parla con me per conoscere le fazioni del mondo (Y).']};
  if(!ents.some(e=>e.envoy)){const s=ents.find(e=>e.k==='owb')||P,[x,y]=nearFree((s.px|0)+2,(s.py|0)+1);const e=mkNpc(id,x,y,{});e.envoy=f;ents.push(e);
    for(const[a,b]of[[-1,-1],[3,-1]]){const[u,v]=nearFree((s.px|0)+a,(s.py|0)+b);ents.push({k:'twbn',n:F.n,px:u+.5,py:v+.5,cr:F.cr})}}}
/* ---- il registro: territorio, insediamento, fazioni ---- */
const RG={tab:'terr'};
function rgHTML(){rgFix();setAccrue();const T=P.tw,tab=RG.tab,tb=(k,n)=>`<button class="twtb${tab===k?' on':''}" onclick="RG.tab='${k}';pn('regno')">${n}</button>`;
  let h=`<div class="rgw"><header class="rgh">${crestSVG(myCrest(),40)}<div><h3>Il tuo regno</h3><small>${Object.keys(T.terr).length} ${Object.keys(T.terr).length===1?'regione':'regioni'}${T.set?' · '+esc(T.set.n):''}${twMyF()?' · '+esc(twFac(twMyF()).n):''}</small></div><div class="twtabs">${tb('terr','🏴 Territorio')}${tb('set','🏰 Insediamento')}${tb('fac','🛡 Fazioni')}</div></header><div class="rgc">`;
  if(tab==='terr'){const inR=String(Zk).startsWith('tw:'),own=inR?twOwner(ZZ.rx,ZZ.ry):null,Q=T.cq&&T.cq.k===Zk?T.cq:null;
    h+=`<div class="rgcard"><b>${inR?esc(ZZ.n):'Sei al chiuso'}</b>${inR?`<small>livello ${ZZ.lv} · ${own?own.me?'<span style="color:#ffd84a">è tua</span>':'terre di '+esc(twFac(own.f).n):'terre libere'}</small>`:''}`;
    if(Q)h+=`<div class="owbar"><i style="width:${Math.floor(Q.c)}%;background:#ffd84a"></i></div><p>Conquista ${Math.floor(Q.c)}%: abbatti i mostri ${Q.f?'e le guardie ':''}della regione.</p>`;
    else if(inR&&own&&own.me)h+=`<p>I mostri non tornano più qui.${!T.set&&twCanConq()?'':''}</p>${!T.set&&twCanConq()?`<button class="pri" onclick="twSetFound()">🏰 Fonda qui il tuo insediamento · 500💰</button>`:''}`;
    else if(twCanConq())h+=`<p>${T.cqp[Zk]?'Conquista interrotta al '+Math.floor(T.cqp[Zk])+'%. ':''}Pianta lo stendardo e abbatti i mostri della regione: quando arrivi al 100% la regione è tua e i mostri se ne vanno per sempre.${own&&!own.me?' <b>Sono terre di '+esc(twFac(own.f).n)+': le loro guardie le difenderanno e la tua reputazione con loro scenderà.</b>':''}</p><button class="pri" onclick="twConqStart()">🏴 ${T.cqp[Zk]?'Riprendi la conquista':'Pianta lo stendardo · 100💰'}</button>`;
    else if(inR)h+=`<p class="mu">Villaggi e città non si conquistano.</p>`;
    h+=`</div>`;const L=Object.keys(T.terr);h+=`<h4>Le tue terre</h4>`+(L.length?`<div class="rgls">${L.map(k=>{const z=twZ(k),p=twP(k),here=twP(String(Zk).startsWith('tw:')?Zk:T.at)||[0,0];return`<span>🏴 ${esc(z.n)} <small>${twDir(p[0]-here[0],p[1]-here[1])}</small></span>`}).join('')}</div>`:'<p class="mu">Ancora nessuna: comincia da una regione vicina.</p>')}
  else if(tab==='set'){const S=T.set;if(!S)h+=`<div class="rgcard"><b>Nessun insediamento</b><p>Conquista una regione selvaggia, poi fondaci il tuo borgo (500 monete). Diventerà la tua casa: cresce, si costruisce e ogni giorno porta tasse e raccolto.</p></div>`;
    else{h+=`<div class="rgcard rgset"><div><b>${esc(S.n)}</b> <small>livello ${S.lv} di ${TWSB.casa.max} · ${esc(twZ(S.k).n===S.n?'':'')}</small><p class="mu">Tesoro: <b>${S.cash|0}💰</b>${S.food?' · '+S.food+' tra grano e mele':''} · ogni giorno ${setRate()}💰${setB('granaio')?' e '+setB('granaio')*3+' di raccolto':''}</p></div>
      <span><button class="pri" onclick="setCollect()">💰 Ritira</button>${Zk!==S.k?`<button onclick="setGo()">🏠 Torna a casa</button>`:''}<button onclick="setRename()">✎ Rinomina</button></span></div>`;
      h+=`<h4>Costruire</h4><div class="rgbg">`+Object.keys(TWSB).map(k=>{const B=TWSB[k],cur=k==='casa'?S.lv:setB(k),mx=cur>=B.max,[g0,l0]=mx?[0,0]:B.cost(cur+1);
        return`<div class="rgb${cur?' on':''}"><b>${B.ic} ${B.n}</b><small>${B.d}</small><i>${'●'.repeat(cur)}${'○'.repeat(B.max-cur)}</i>${mx?'<em>completo</em>':`<button onclick="setBuy('${k}')">${cur?'Migliora':'Costruisci'} · ${g0}💰 · ${l0} 🪵</button>`}</div>`}).join('')+`</div><p class="mu">Legna: ${P.res.legna|0}. La legna che manca si paga 20 monete l'una.</p>`;
      h+=`<h4>Personalizzare</h4><div class="rgth">${TWSTH.map((th,i)=>`<button class="${(S.col|0)===i?'on':''}" onclick="setTheme(${i})"><i style="background:${th[2][0]}"></i><i style="background:${th[1][0]}"></i>${th[0]}</button>`).join('')}</div>
        <div class="rgth">${Object.keys(TWSD).map(k=>`<button class="${S.dec[k]?'on':''}" onclick="setDec('${k}')">${TWSD[k][1]} ${TWSD[k][0]}${S.dec[k]?' ✓':' · 120💰'}</button>`).join('')}</div>`}}
  else{h+=`<div class="rgfl">`+TWFK.map(f=>{const F=twFac(f),H=twFacHomes()[f],v=P.ow.rep[f]|0,ti=owTier(Math.max(0,v)),here=twP(String(Zk).startsWith('tw:')?Zk:T.at)||[0,0],me=twMyF()===f,nt=Object.keys(T.terr).filter(k=>T.terr[k].f===f).length;
      return`<div class="rgf${me?' on':''}" style="--fc:${F.c}">${crestSVG(F.cr,44)}<div><b>${esc(F.n)}</b><small>${H?'sede: '+esc(twZ(twK(H[0],H[1])).n)+' · '+twDir(H[0]-here[0],H[1]-here[1]):'sede lontana'} · ${v<0?'<span style="color:#ff8a7a">ostili ('+v+')</span>':OWRT[ti][1]+' ('+v+')'}${T.met[f]?'':' · <i>mai incontrata</i>'}</small></div>
        ${me?`<button onclick="facLeave()">Lascia</button>`:`<button ${T.met[f]&&!(P.tw.myf&&twMyF()==='mia')?'':'disabled'} onclick="facJoin('${f}')">Unisciti</button>`}</div>`}).join('')+`</div>`;
    const MF=T.myf;h+=`<h4>${MF?'La tua fazione':'Fonda la tua fazione'}</h4>`;if(MF&&!RG.ed){h+=`<div class="rgf on mine">${crestSVG(MF.cr,56)}<div><b>${esc(MF.n)}</b><small>${esc(MF.mot||'')}${MF.mot?' · ':''}${Object.keys(T.terr).length} regioni</small></div><span><button onclick="RG.ed=1;Object.assign(RGF,P.tw.myf.cr,{n:P.tw.myf.n,mot:P.tw.myf.mot});pn('regno')">Stemma</button>${twMyF()!=='mia'?`<button onclick="facJoin('mia')">Guidala</button>`:''}<button onclick="facDisband()">Sciogli</button></span></div>`}
    else{const pk=(k,arr,lab)=>`<div class="rgpk" data-k="${k}"><small>${lab}</small>${arr.map((x,i)=>`<button data-v="${k==='c1'||k==='c2'?x:i}" class="${String(RGF[k])===String(k==='c1'||k==='c2'?x:i)?'on':''}" onclick="rgPick('${k}',${k==='c1'||k==='c2'?`'${x}'`:i})" ${k==='c1'||k==='c2'?`style="background:${x}" title="${x}"`:''}>${k==='c1'||k==='c2'?'':esc(x)}</button>`).join('')}</div>`;
      h+=`<div class="rged"><div id="rgfpv">${crestSVG(RGF,96)}</div><div class="rgef"><input id="rgfn" maxlength="30" placeholder="Nome della fazione" value="${esc(RGF.n||'')}"><input id="rgfm" maxlength="60" placeholder="Motto (facoltativo)" value="${esc(RGF.mot||'')}">
        ${pk('sh',CRSH,'Forma')}${pk('dv',CRDV,'Partizione')}${pk('c1',CRCOL,'Colore')}${pk('c2',CRCOL,'Secondo colore')}${pk('sy',CRSY,'Simbolo')}
        <button class="pri" onclick="RG.ed=0;facNew()">${MF?'Salva lo stemma':'🛡 Fonda la fazione · 300💰'}</button>${MF?`<button onclick="RG.ed=0;pn('regno')">Annulla</button>`:''}</div></div>`}}
  return h+`</div><footer class="twbf"><button onclick="cl()">Chiudi</button></footer></div>`}
const _pn721=pn;pn=function(m,arg){if(m==='regno'&&twOn()){if(arg!==undefined)PA=arg;edPanel('regno',rgHTML());return}_pn721(m,arg)};
/* ---- agganci ---- */
const _kill721=kill;kill=function(e){const ok=e&&e.k==='en'&&ents.includes(e);_kill721(e);if(ok&&twOn())twConqKill(e)};
const _upd721=upd;upd=function(dt){_upd721(dt);if(twOn())twGarTick(dt)};
const _load721=load;load=function(k,from){_load721(k,from);if(!twOn()||!P.tw)return;rgFix();
  if(String(Zk).startsWith('tw:')){if(P.tw.terr[Zk]){for(const e of ents.slice())if(e.k==='en'&&!e.owt&&!e.bt)ents.splice(ents.indexOf(e),1);
      if(!ents.some(e=>e.k==='twbn')){const h=twHub(ZZ.rx,ZZ.ry),[x,y]=nearFree(h[0]+3,h[1]-2);ents.push({k:'twbn',n:'Stendardo · '+ZZ.n,px:x+.5,py:y+.5,cr:myCrest()})}}
    if(P.tw.cq&&P.tw.cq.k===Zk&&!ents.some(e=>e.k==='twbn'&&e.cq)){const[x,y]=nearFree(P.px|0,(P.py|0)-1);ents.push({k:'twbn',n:'Il tuo stendardo',px:x+.5,py:y+.5,cr:myCrest(),cq:1})}
    else if(P.tw.cq&&P.tw.cq.k!==Zk){P.tw.cqp[P.tw.cq.k]=P.tw.cq.c;P.tw.cq=null;OW.gar=null}
    twEnvoys();if(P.tw.set&&Zk===P.tw.set.k){setAccrue();setTimeout(setTemple,900)}}};
const _act721=act;act=function(e){if(e&&twOn()){if(e.envoy){rgFix();const nw=!P.tw.met[e.envoy];P.tw.met[e.envoy]=1;if(nw)banner('Hai incontrato '+twFac(e.envoy).n,'Ora puoi unirti a loro (Y)','bandiera');RG.tab='fac';pn('regno');save();return}
  if(e.k==='twbn'){RG.tab=e.set?'set':'terr';pn('regno');return}}_act721(e)};
if(typeof ITK!=='undefined'){ITK.add('twbn')}
const _owTurn721=owTurn;owTurn=function(i){const C=P.ow&&P.ow.act[i],fa=C&&C.fa,g0=P.g;_owTurn721(i);if(C&&twOn()&&fa&&fa===twMyF()&&!P.ow.act.includes(C)){const b=Math.round(C.rw.g*.2);P.g+=b;P.ow.rep[fa]=(P.ow.rep[fa]|0)+Math.round(C.rw.rep*.5);flt(P,'+'+b+' (fazione)','#ffd84a');hud()}};
addEventListener('keydown',e=>{if(!started||!twOn()||e.target&&/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)||e.repeat)return;const k=e.key.toLowerCase();
  if(k==='u'){if(PM==='regno'&&RG.tab!=='fac')cl();else if(!PM){RG.tab=P.tw.set&&Zk===P.tw.set.k?'set':'terr';pn('regno')}e.preventDefault()}
  else if(k==='y'){if(PM==='regno'&&RG.tab==='fac')cl();else if(!PM){RG.tab='fac';pn('regno')}e.preventDefault()}});
// lo stendardo: palo, drappo con i colori dello stemma, che sventola
const _ent721=ent;ent=function(e){if(e&&e.k==='twbn'){const c=e.cr||{},c1=c.c1||'#d4af37',c2=c.c2||'#2a1a0a',w=Math.sin(t*3+e.px)*.6;box(e.px-.05,e.py-.05,0,.1,.1,40,'#5a3a1a');box(e.px-.09,e.py-.09,40,.18,.18,2,'#d4af37');
    for(let i=0;i<5;i++){const u=Math.sin(t*4+i*.8+e.px)*1.2*(i/5);box(e.px+.05+i*.1,e.py-.03+u*.02,24+u,.1,.06,14,i===2||(c.dv|0)===1&&i>2?c2:c1)}box(e.px+.05,e.py-.035,30,.5,.07,2,c2);
    if(!D3B&&dist(e,P)<4){const sx=PX(e.px,e.py),sy=PY(e.px,e.py,0);g.textAlign='center';g.font='bold 11px Georgia,serif';label('🏴 '+e.n+(e.cq&&P.tw.cq?' · '+Math.floor(P.tw.cq.c)+'%':''),sx,sy-52,'#ffe8b0')}return}
  _ent721(e)};
// nella pausa: il tuo mondo
if(typeof pauseHTML==='function'){const _ph721=pauseHTML;pauseHTML=function(){const h=_ph721();if(!(typeof domOn==='function'&&domOn()))return h;
  const add=`<div class="psg"><h4>Il tuo mondo</h4><button class="psb" onclick="pn('pets')">🐾<span><b>Compagni</b><small>I mostri domati e la stalla (N)</small></span></button>${twOn()?`<button class="psb" onclick="RG.tab='terr';pn('regno')">🏴<span><b>Territorio e insediamento</b><small>Conquiste, il tuo borgo, il tesoro (U)</small></span></button><button class="psb" onclick="RG.tab='fac';pn('regno')">🛡<span><b>Fazioni</b><small>Unisciti o fonda la tua, con il tuo stemma (Y)</small></span></button>`:''}</div>`;
  return h.replace(/(<button class="psb" onclick="cl\(\);openSet\(\)">)/,add+'$1')}}
// la mappa: le terre delle fazioni e le tue, gli stemmi sulle città sede
function twMapTerr(q,x0,x1,y0,y1,sx,sy,Z2){if(!P||!P.tw)return;rgFix();const H=twFacHomes();q.save();
  for(let ry=y0;ry<=y1;ry++)for(let rx=x0;rx<=x1;rx++){const o=twOwner(rx,ry);if(!o)continue;const F=o.me?{c:myCrest().c1}:twFac(o.f);if(!F)continue;const X=sx(rx),Y=sy(ry);
    q.globalAlpha=o.me?.34:.18;q.fillStyle=F.c;q.fillRect(X,Y,Z2+.6,Z2+.6);q.globalAlpha=o.me?.95:.55;q.strokeStyle=F.c;q.lineWidth=o.me?3:1.5;
    const nb=(dx,dy)=>{const p=twOwner(rx+dx,ry+dy);return p&&(p.me?'me':p.f)===(o.me?'me':o.f)};if(!nb(-1,0)){q.beginPath();q.moveTo(X+1,Y);q.lineTo(X+1,Y+Z2);q.stroke()}if(!nb(1,0)){q.beginPath();q.moveTo(X+Z2-1,Y);q.lineTo(X+Z2-1,Y+Z2);q.stroke()}
    if(!nb(0,-1)){q.beginPath();q.moveTo(X,Y+1);q.lineTo(X+Z2,Y+1);q.stroke()}if(!nb(0,1)){q.beginPath();q.moveTo(X,Y+Z2-1);q.lineTo(X+Z2,Y+Z2-1);q.stroke()}}
  q.globalAlpha=1;const cs=clamp(Z2*.42,16,40);for(const f in H){const[hx,hy]=H[f];if(hx<x0||hx>x1||hy<y0||hy>y1)continue;const im=crestImg(twFac(f).cr);if(im.complete)q.drawImage(im,sx(hx)+Z2*.05,sy(hy)+Z2*.05,cs,cs*1.1)}
  for(const S9 of(typeof csSets==='function'?csSets():[P.tw.set]))if(S9){const p=twP(S9.k);if(p&&p[0]>=x0&&p[0]<=x1&&p[1]>=y0&&p[1]<=y1){const im=crestImg(myCrest());if(im.complete)q.drawImage(im,sx(p[0])+Z2*.55,sy(p[1])+Z2*.05,cs,cs*1.1)}}
  q.restore()}
if(typeof twMapSide==='function'){const _ms721=twMapSide;twMapSide=function(){_ms721();const el=$('twms');if(!el||!TWM.sel)return;const[rx,ry]=TWM.sel,o=twOwner(rx,ry),f=twHomeOf(rx,ry);
  let h='';if(o)h+=`<p class="rgown">${crestSVG(o.me?myCrest():twFac(o.f).cr,22)} ${o.me?'<b>Terra tua</b>':'Terre di '+esc(twFac(o.f).n)}</p>`;if(f)h+=`<p class="rgown">🏛 Sede di ${esc(twFac(f).n)}: qui c'è il suo emissario</p>`;if(P.tw.set&&P.tw.set.k===twK(rx,ry))h+=`<p class="rgown">🏰 ${esc(P.tw.set.n)}: il tuo insediamento</p>`;
  const b=el.querySelector('button');if(h){if(b)b.insertAdjacentHTML('beforebegin',h);else el.insertAdjacentHTML('beforeend',h)}}}
const _begin721=begin;begin=function(d,s){_begin721(d,s);if(twOn())rgFix()};
document.head.insertAdjacentHTML('beforeend',`<style>
#pn[data-m="regno"]{width:min(780px,96vw);max-height:90%;padding:0}.rgw{display:flex;flex-direction:column;max-height:88vh}
.rgh{display:flex;gap:10px;align-items:center;flex-wrap:wrap;padding:12px 16px 8px;background:linear-gradient(180deg,rgba(70,46,18,.95),rgba(36,26,14,.9));border-bottom:1px solid #c8a86866}.rgh h3{margin:0;color:#ffd88a}.rgh small{color:#e8d8b0;opacity:.8}.rgh>div:nth-child(2){flex:1}
.rgc{overflow:auto;padding:10px 14px}.rgcard{padding:10px 12px;border-radius:10px;border:1px solid #ffffff22;background:#ffffff08;margin:6px 0}.rgcard>b{font-size:16px}.rgcard small{display:block;opacity:.8}.rgcard .pri,.rgb button,.rgf button{margin-top:4px}
.rgset{display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;align-items:center}.rgset span{display:flex;gap:5px;flex-wrap:wrap}
.rgls{display:flex;flex-wrap:wrap;gap:6px}.rgls span{padding:3px 9px;border-radius:12px;background:rgba(255,216,74,.1);border:1px solid #ffd84a55;font-size:13px}.rgls small{opacity:.7}
.rgbg{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:7px}.rgb{padding:8px 10px;border-radius:9px;border:1px solid #ffffff22;background:#0002;display:flex;flex-direction:column;gap:2px}.rgb.on{border-color:#ffd84a66}.rgb small{opacity:.75}.rgb i{font-style:normal;color:#ffd84a;letter-spacing:2px}.rgb em{font-style:normal;color:#9aff9a;font-size:12px}
.rgth{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0}.rgth button{font-size:12px;padding:4px 10px}.rgth button.on{border-color:#ffd84a;color:#ffd84a}.rgth i{display:inline-block;width:10px;height:10px;border-radius:2px;margin-right:2px;vertical-align:-1px}
.rgfl{display:grid;gap:6px}.rgf{display:flex;gap:10px;align-items:center;padding:7px 10px;border-radius:10px;border:1px solid #ffffff1a;border-left:4px solid var(--fc,#ffd84a);background:#ffffff08}.rgf>div{flex:1;min-width:0}.rgf b{display:block}.rgf small{opacity:.8}.rgf.on{background:rgba(255,216,74,.08);border-color:#ffd84a88}.rgf span{display:flex;gap:4px;flex-wrap:wrap}
.rged{display:flex;gap:14px;flex-wrap:wrap;align-items:flex-start;padding:10px;border-radius:10px;background:#0003;border:1px solid #ffffff1a}#rgfpv{flex:none;filter:drop-shadow(0 4px 8px #0008)}.rgef{flex:1;min-width:240px;display:flex;flex-direction:column;gap:6px}.rgef input{width:100%}
.rgpk{display:flex;flex-wrap:wrap;gap:4px;align-items:center}.rgpk small{width:100%;opacity:.75}.rgpk button{font-size:11.5px;padding:3px 8px;min-width:24px;min-height:22px}.rgpk button.on{outline:2px solid #ffd84a;color:#ffd84a}
.crest{vertical-align:middle}.rgown{display:flex;gap:6px;align-items:center;margin:4px 0}
</style>`);
