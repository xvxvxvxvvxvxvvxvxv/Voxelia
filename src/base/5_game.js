/* ================= eroe ================= */
const eqs=()=>Object.values(P.eq).filter(Boolean);
const atk=()=>Math.round((4+P.lv*2+iv(P.eq.w))*(P.bA>0?1.25:1));
const def=()=>Math.round(['h','c','s'].reduce((a,s)=>a+iv(P.eq[s]),0)*(P.bD>0?1.25:1));
const crit=()=>5+eqs().reduce((a,i)=>a+(i.cr||0),0);
const maxHP=()=>60+P.lv*15+eqs().reduce((a,i)=>a+(i.hp||0),0);
const need=()=>Math.round(20+P.lv*P.lv*11.5);// 7.10: intero (prima ai livelli dispari compariva «XP 0/31.5»)
let INV=24;
function recalc(){P.mx=maxHP();P.hp=Math.min(P.hp,P.mx)}
function newP(){return{k:'me',px:0,py:0,hp:75,mx:75,lv:1,xp:0,g:30,pot:3,eq:{w:{u:uid(),s:'w',r:0,v:3,n:'Pugnale',p:0}},inv:[],path:[],tg:null,at:0,sk:0,pc:0,fl:0,sw:0,rp:0,swc:0,bt:0,bA:0,bD:0,
  q:[],qd:{},qi:{},st:0,sh:[],lore:[],runs:{},hc:{},done:{},seen:{},kills:0,gt:480,ap:Object.assign({},APM)}}
function gainXP(x){P.xp+=x;while(P.xp>=need()){P.xp-=need();P.lv++;recalc();P.hp=P.mx;if(cineOK())sceneLevel();else msg('Livello '+P.lv+'! Attacco e vita aumentati.');jingle([72,76,79,84],.1);fx.push({k:'ring',x:P.px,y:P.py,r:1.6,t:.5})}}
function roll(m=1){let d=atk()*m*(.8+Math.random()*.4),cr=false;if(P.pf>0||Math.random()*100<crit()){d*=1.8;cr=true;P.pf=0}return{d:Math.max(1,Math.round(d)),cr}}

/* ================= combattimento ================= */
const dist=(a,b)=>Math.hypot(a.px-b.px,a.py-b.py);
const flt=(o,s,c)=>pop.push({x:o.px,y:o.py,s,c,t:1});
function blk(x,y){const i=Math.floor(x),j=Math.floor(y);return i<0||j<0||i>=N||j>=N||!WK(M[j][i])}
function mv(o,dx,dy){if(!blk(o.px+dx,o.py))o.px+=dx;if(!blk(o.px,o.py+dy))o.py+=dy}
function hurtE(e,d,rem,cr){if(e.shd&&e.shd>t){flt(e,'Immune','#9adcff');return}if(!rem)wmHit();d=tryParry(e,d,rem);if(!rem){NET.hits.push([e.sg||e.id,+(d/e.mx).toFixed(4),++NET.seq]);if(NET.hits.length>14)NET.hits.shift()}
  e.hp-=d;e.fl=.12;e.al=1;if(e.pup)e.hme=t;flt(e,(cr?'💥':'')+d,cr?'#ffd84a':'#ffffff');tone(cr?330:220,.05);if(e.hp<=0){if(e.pup)e.hp=1;else kill(e)}}
// 7.11: nella storia l'armatura protegge un po' meno (2 invece di 2,5): con l'equipaggiamento leggendario l'eroe non è più quasi intoccabile
function hurtP(at){if(P.iv>0){flt(P,'Schivata!','#8ce7ff');P.pf=3;tone(900,.05,'triangle');return}const d=Math.max(1,Math.round(at*(.8+Math.random()*.4)*100/(100+def()*(MODE==='story'?2:2.5))));P.hp-=d;P.fl=.15;flt(P,d,'#ff6666');tone(110,.08);if(P.hp<=0)die()}
function kill(e){const i=ents.indexOf(e);if(i<0)return;ents.splice(i,1);if(cineOK()&&e.m)ents.push({k:'dead',m:e.m,px:e.px,py:e.py,t0:t,boss:e.boss,fc:e.m.rg?faceOf(...(e.fd||[0,1])):null});if(Zk==='arrembaggio'&&!ARRW&&!ents.some(x=>x.k==='en')){ARRW=1;navHatch()}if(Zk==='stiva'&&!ARRW&&!ents.some(x=>x.k==='en')){ARRW=1;setTimeout(navWin,900)}if(MODE==='dim'&&e.dtag)dimKill(e);const z=ZZ;gainXP(Math.round(e.xp*DF.x*(NET.cfg.xpm||1)*nightXP()));
  const gd=Math.round(ri(2,6+z.lv*3)*(e.boss?6:1)*(1+(z.run||0)*.25)*(NET.cfg.gm||1));P.g+=gd;flt(e,'+'+gd+' oro','#ffd84a');goldFly(gd,e.px,e.py);
  if(e.boss){ents.push(dropOk({k:'dr',px:e.px,py:e.py,it:uniq(e.t,z.lv)}),dropOk({k:'dr',px:e.px+.7,py:e.py+.2,it:item(z.lv+1,2)}))}
  else if(Math.random()<.4*DF.lt)ents.push(dropOk({k:'dr',px:e.px,py:e.py,it:item(z.lv+1)}));
  if(Math.random()<(MODE==='story'?.08:.12)){P.pot++;flt(P,'+🧪','#88ff88')}
  P.kills++;questKill(e);if(e.boss)bossDown(e);hud()}
function bossDown(e){jingle([60,64,67,72,76,79],.11);if(cineOK())sceneBossDown(e);else msg('Hai sconfitto '+e.n+'!');clog('','Hai sconfitto '+e.n+'!',{sys:1});if(ZZ.dg)dungeonClear(e)}
function exitSpot(x,y){const d=bfs(Math.floor(P.px),Math.floor(P.py)),busy=(u,v)=>ents.some(e=>(e.k==='po'||e.k==='npc'||e.k==='ch'||e.k==='shard'||e.k==='dr')&&Math.abs(e.px-(u+.5))<1.7&&Math.abs(e.py-(v+.5))<1.7);let best=null,bs=-1e9;
  for(let v=y-8;v<=y+8;v++)for(let u=x-8;u<=x+8;u++){if(u<1||v<1||u>=N-1||v>=N-1||!WK(M[v][u])||d[v*N+u]<0)continue;const r=Math.hypot(u-x,v-y),rp=Math.hypot(u+.5-P.px,v+.5-P.py);if(r<3||rp<3||busy(u,v))continue;
    let fr=0;for(const[a,b]of[[1,0],[-1,0],[0,1],[0,-1]])if(WK(M[v+b][u+a]))fr++;const sc=-Math.abs(r-4)*2+Math.min(rp,6)*.6+fr;if(sc>bs){bs=sc;best=[u,v]}}
  return best||nearFree(x,y)}
const dgLeft=()=>{const sh=ents.filter(e=>e.k==='shard').length,dr=ents.filter(e=>e.k==='dr').length,ch=ents.filter(e=>e.k==='ch'&&e.rich).length;return sh||dr||ch?{sh,dr,ch}:null};
function dungeonClear(e){const id=ZZ.dg,d=DG[id],x=Math.floor(e.px),y=Math.floor(e.py);
  const c=nearFree(x,y);ents.push({k:'ch',px:c[0]+.5,py:c[1]+.5,rich:1});
  if(!d.fin&&!P.sh.includes(id)){const s=nearFree(x+1,y+1);ents.push({k:'shard',id,px:s[0]+.5,py:s[1]+.5,n:'Frammento della Corona'})}
  // il portale d'uscita compare lontano dal bottino e dall'eroe, così un clic sbagliato non ti porta via prima di raccogliere
  const ex=exitSpot(x,y);const ep=po(ex[0],ex[1],d.ent,{st:'exit',n:'Uscita: '+zname(d.ent)});ep.dgx=1;ents.push(ep);
  P.done[id]=(P.done[id]||0)+1;
  if(NET.ok)NET.send({t:'dgdone',d:id,run:ZZ.run});else P.runs[id]=ZZ.run+1;
  setTimeout(()=>msg('Dungeon completato! Al prossimo ingresso si rigenererà, più forte (ciclo '+(ZZ.run+2)+').'),2900);
  if(d.fin&&P.st===3){P.st=4;setTimeout(()=>{const show=()=>{PA={ti:'La caduta di Malakar',tx:'Il Re Lich si dissolve in una nube di voxel neri. Torna dal Re Aldric al castello.'};pn('txt')};if(typeof filmFall==='function')filmFall(show);else show()},1500)}
  save()}
function die(){sceneDeath();if(MODE==='dim'){dimDie();return}if(DF.pm){started=0;LS.del(SAVEK);netLeave();pn('dead');return}
  // 7.11: cadere costa di più: il 15% dell'oro a Normale, il 25% a Difficile (prima il 10%)
  P.hp=P.mx;const dfi=DFS.indexOf(DF);if(dfi>0)P.g=P.g*(MODE==='story'?(dfi>=2?.75:.85):.9)|0;irisGo(()=>load('town'));if(!cineOK())msg('Sei stato sconfitto: ti risvegli ad Aldoria.')}
// Affondo per tipo di arma: portata (caselle), moltiplicatore di danno, ricarica (secondi), nome. Schivata: ricarica DODGE_CD secondi.
const DODGE_CD=3;
const LG={Pugnale:{r:2.4,m:1.3,cd:4.5,n:'Fendente rapido'},Spada:{r:2.8,m:1.6,cd:6,n:'Affondo'},Stocco:{r:3.4,m:1.7,cd:6,n:'Affondo di stocco'},Lancia:{r:4,m:1.8,cd:7,n:'Stoccata'},Ascia:{r:2.2,m:2.1,cd:8,n:'Fendente'},Martello:{r:2.2,m:2.3,cd:9.5,n:'Schianto'},Bastone:{r:3,m:1.5,cd:6,n:'Colpo di bastone'},Falce:{r:2.6,m:1.8,cd:7,n:'Falciata'}},LGA={Lama:'Spada',Clava:'Martello',Tridente:'Lancia',Mannaia:'Ascia',Pungiglione:'Stocco',Daga:'Pugnale',Coltello:'Pugnale',Mazza:'Martello',Randello:'Martello',Maglio:'Martello',Alabarda:'Lancia',Picca:'Lancia',Scettro:'Bastone',Bacchetta:'Bastone',Verga:'Bastone'};
function lgTypeOf(n){n=String(n||'').replace(/«[^»]*»/g,'');const k=Object.keys(LG).find(x=>n.includes(x))||LGA[Object.keys(LGA).find(x=>n.includes(x))]||'Spada';return LG[k]}
function lgType(){return lgTypeOf(P.eq.w?P.eq.w.n:'')}
// direzione dei tasti WASD/frecce sullo schermo → direzione nel mondo isometrico (destra = (1,-1), giù = (1,1)); null se nessun tasto è premuto
function keyDir(){if(!SET.wasd)return null;const kx=((KEYS.d||KEYS.arrowright)?1:0)-((KEYS.a||KEYS.arrowleft)?1:0),ky=((KEYS.s||KEYS.arrowdown)?1:0)-((KEYS.w||KEYS.arrowup)?1:0);
  if(!kx&&!ky)return null;const dx=kx+ky,dy=ky-kx,d=Math.hypot(dx,dy);return[dx/d,dy/d]}
function dodge(){if(NAV&&Zk==='mare'){navEvade();return}if(!started||P.dgc>0||P.dm||P.hp<=0)return;let dx=0,dy=0;const kd=keyDir();
  if(kd)[dx,dy]=kd;else if(P.path.length){const w=P.path[0];dx=w.x+.5-P.px;dy=w.y+.5-P.py}else if(P.tg&&P.tg.px!=null){dx=P.px-P.tg.px;dy=P.py-P.tg.py}else if(P.dr){dx=-P.dr[0];dy=-P.dr[1]}else dy=1;
  const d=Math.hypot(dx,dy)||1;dx/=d;dy/=d;P.dm={k:'d',t:.26,v:10,dx,dy,h:[],m:1};P.iv=.4;P.dgc=DODGE_CD;P.dr=[dx,dy];P.path=[];fxDodge(dx,dy);whoosh()}
function lunge(){if(!started||P.lgc>0||P.dm||P.hp<=0)return;const T=lgType();let tg=P.tg&&P.tg.px!=null&&P.tg.k!=='npc'?P.tg:null;
  if(!tg){let bd=7;for(const e of ents)if(e.k==='en'){const d=dist(e,P);if(d<bd){bd=d;tg=e}}}
  let dx=0,dy=0;if(tg){dx=tg.px-P.px;dy=tg.py-P.py}else if(P.dr){dx=P.dr[0];dy=P.dr[1]}else dy=1;
  const d=Math.hypot(dx,dy)||1;dx/=d;dy/=d;const dur=.16;P.dm={k:'l',t:dur,v:T.r/dur,dx,dy,h:[],m:T.m};P.lgc=T.cd;P.sw=.25;P.swc++;P.dr=[dx,dy];P.path=[];
  fxLunge(T,dx,dy);flt(P,T.n+'!','#ffd84a');tone(500,.08,'sawtooth')}
function area(){if(PM==='dig'&&DIG){digHit();return}if(FSH&&PM==='fish'){fishKey(1);return}if(DU&&PM==='duel'){duelShoot();return}if(NAV&&Zk==='mare'){navHold(1);return}if(!started||P.sk>0)return;P.sk=6;P.swc++;fxArea();tone(300,.15);
  for(const e of ents.slice())if(e.k==='en'&&dist(e,P)<2.6){const r=roll(1.7);hurtE(e,r.d,0,r.cr)}
  if(inPit(P.px,P.py))for(const o of NET.list)if(inPit(o.px,o.py)&&dist(o,P)<2.6){const r=roll(1.7);pvpHit(o,r.d,r.cr)}}
// 7.11: nella storia una pozione cura il 35% (prima il 40%) e tra un sorso e l'altro passano 2,5 secondi (prima 1): in battaglia non si può più bere a raffica
const POTH=()=>MODE==='ed'?.4:.35,POT_CD=()=>MODE==='ed'?1:2.5;
function pot(){if(!started)return;if(P.pot>0&&P.pc>0&&P.hp<P.mx){if(!(P.pcm>t)){P.pcm=t+.8;flt(P,'Pozione tra '+Math.ceil(P.pc)+'s','#9adcff')}return}
  if(P.pot>0&&P.pc<=0&&P.hp<P.mx){P.pot--;P.pc=POT_CD();const h=Math.round(P.mx*POTH());sceneHeal();P.hp=Math.min(P.mx,P.hp+h);flt(P,'+'+h,'#66ff66');tone(520,.1);hud()}}
function shoot(e,tp){const n=e.boss&&e.enr?3:1,a0=Math.atan2(tp.py-e.py,tp.px-e.px);for(let i=0;i<n;i++){const a=a0+(i-(n-1)/2)*.25;PJ.push({x:e.px,y:e.py,vx:Math.cos(a)*7,vy:Math.sin(a)*7,t:1.6,d:e.at,c:e.b.rng})}tone(600,.05,'triangle',.03)}

/* ================= missioni ================= */
function qAvail(nid){const d=NPCS[nid];if(!d||!d.qs||P.q.some(q=>q.npc===nid)||P.q.length>=5)return null;if(nid==='moreau'){for(const id of['mo5','mo6'])if(!P.qd[id]&&(id==='mo5'||P.qd.mo5)&&QT[id].lv<=P.lv+1)return id}const n=d.qs.length;
  for(let k=0;k<n;k++){const id=d.qs[((P.qi[nid]||0)+k)%n],T=QT[id];if(T.once&&P.qd[id])continue;if((T.lv||0)>P.lv+1||(T.req&&!(P.unl&&P.unl[T.req])))continue;return id}return null}
const qReady=q=>q.c>=(QT[q.id].n||1);
const qRew=T=>({g:Math.round(T.g*(1+P.lv*.06)),x:Math.round(T.x*(1+P.lv*.085))});
function qAccept(nid,id){const d=NPCS[nid];if(id==='mo5'&&Zk==='town'&&!ents.some(e=>e.k==='po'&&e.st==='hole'))ents.push(holePo());P.q.push({id,npc:nid,c:0});P.qi[nid]=(d.qs.indexOf(id)+1)%d.qs.length;if(cineOK())banner('Missione accettata',QT[id].ti,'pergamena');else msg('Nuova missione: '+QT[id].ti);jingle([67,71,74]);npcMarks();hud();save()}
function qTurn(q){const T=QT[q.id],r=qRew(T);if(T.unl){P.unl[T.unl]=1;if(T.unl==='rovine')setTimeout(()=>banner('Cancello aperto','Ora puoi entrare nel Borgo delle Ceneri dalla porta ovest della città','pergamena'),900);else if(T.unl==='mulino')setTimeout(millRepaired,700)}P.q.splice(P.q.indexOf(q),1);P.g+=r.g;gainXP(r.x);P.qd[q.id]=(P.qd[q.id]||0)+1;if(cineOK()){banner('Missione completata',T.ti+' · +'+r.g+' oro, +'+r.x+' XP','spunta');goldFly(r.g)}else msg('Missione completata: '+T.ti+' (+'+r.g+' oro, +'+r.x+' XP)');clog('','Missione completata: '+T.ti+' (+'+r.g+' oro)',{sys:1});jingle([72,76,79,84,88],.09);npcMarks();hud();save()}
function questKill(e){for(const q of P.q){const T=QT[q.id];if(qReady(q)||!T.e||!T.e.includes(e.t))continue;
  if(T.t==='kill'||T.t==='boss'){q.c++;msg(T.ti+': '+q.c+'/'+T.n)}else if(T.t==='col'&&Math.random()<(T.ch||.55)){q.c++;flt(e,'+'+T.it,'#7aff7a');msg(T.it+': '+q.c+'/'+T.n)}
  if(qReady(q))jingle([67,72]);}}
function questTalk(nid){for(const q of P.q){const T=QT[q.id];if(T.t==='talk'&&T.to===nid&&q.c<1){q.c=1;msg('Missione aggiornata: '+T.ti+' — torna da '+NPCS[q.npc].n);jingle([67,72])}}}
function npcMarks(){for(const e of ents)if(e.k==='npc'){const id=e.nid;let m='';
  if(id==='re')m=P.st===0?'!':P.st===2||P.st===4?'?':P.s7===1&&!P.te&&P.st>=5?'!':'';else if(id==='malakar_g')m=P.key?'':'!';else if(P.q.some(q=>q.npc===id&&qReady(q)))m='?';else if(qAvail(id))m='!';
  else if(P.q.some(q=>QT[q.id].t==='talk'&&QT[q.id].to===id&&q.c<1))m='…';e.qm=m}}

/* ================= interazioni ================= */
function act(e){
  if(e.k==='res'){gather(e);return}
  if(e.k==='stash'){pn('stash');tone(300,.12,'triangle');return}
  if(e.k==='console'){pn('dimsel');tone(660,.1,'sine');return}
  if(e.k==='letto'){sleepBed();return}
  if(e.k==='c100'){if(e.o)return;e.o=1;P.g+=100;goldFly(100);flt(e,'+100 💰','#ffd84a');tone(800,.1,'triangle');if(cineOK())sparks(e.px,e.py,16,['#ffd84a','#fff2a0'],70);hud();save();return}
  if(e.k==='vaso'){PA={ti:'Un vaso di terra',tx:'«Ho un vaso di terra! Ho un vaso di terra!»\n\nSul fondo del vaso, incise con la punta di un coltello, due lettere: J.P.'};pn('txt');if(!P.egg){P.egg=1;banner('Easter egg trovato!','Il vaso di terra di J.P.','corona')}jingle([72,76,79,72,76,79],.12,'triangle');save();return}
  if(e.k==='clue'){dimClue(e);return}
  if(e.k==='fs'){if(!P.rod){msg('Ti serve una canna da pesca: la vende il Pescatore Gino, sulla banchina del Porto.');tone(150,.15);return}FSH=null;FSPOT=e;pn('fish');return}
  if(e.k==='po'&&e.st==='hole'&&e.to==='vecchia'&&!P.vdug){digOpen();return}
  if(e.k==='reliq'){reliqTake(e);return}
  if(e.k==='botola'){tone(90,.6,'sawtooth',.06);irisGo(()=>load('culto','vecchia'));return}
  if(e.k==='portap'){cultDoor();return}
  if(e.k==='secret'||e.k==='portac'){secretFind(e.sid);return}
  if(e.k==='shard7'){shard7(e);return}
  if(e.k==='po'&&e.st==='tap'&&!(P.sec&&P.sec.c2)){secretFind('c2');return}
  if(e.k==='po'&&e.lock&&!(P.unl&&P.unl[e.lock])){msg(e.lockMsg||'Il passaggio è sbarrato.');tone(150,.2);return}
  if(e.k==='npc'){if(e.wd){e.path=[];e.wt=6}questTalk(e.nid);if(typeof QAS!=='undefined')QAS={id:'',i:-1};if(typeof MQA!=='undefined')MQA=-1;PA=e;pn('npc');if(!e.slp)voice(e);npcMarks();cineOn(e,1.25);return}
  if(e.k==='ch'){if(cineOK()){e.k='cho';e.ot=t;sceneChest(e)}else ents.splice(ents.indexOf(e),1);const lv=ZZ.lv||Math.max(1,P.lv-1),n=e.rich?3:ri(1,2);for(let i=0;i<n;i++){const d=dropOk({k:'dr',px:e.px+i*.5-.4,py:e.py+.5,it:item(lv+1,e.rich?1:0)});arcFrom(d,e.px,e.py,.25+i*.12);ents.push(d)}
    const gd=Math.round(ri(10,30)*(1+lv)*(e.rich?3:1)*(NET.cfg.gm||1));P.g+=gd;if(e.hc)P.hc[e.hc]=Date.now();tone(800,.1);msg('Forziere aperto! +'+gd+' oro');setTimeout(()=>goldFly(gd,e.px,e.py),250);hud();return}
  if(e.k==='po'&&e.dgx&&!e.ok){const L=dgLeft();if(L){PA={po:e,L};pn('exitask');tone(330,.08,'triangle');return}}
  if(e.k==='po'){if(IRB)return;whoosh();const to=e.to,fr=Zk;irisGo(()=>load(to,fr));return}
  if(e.k==='dr'){if(P.inv.length>=INV){msg('Zaino pieno ('+INV+'/'+INV+'): getta, distruggi o vendi qualcosa per raccogliere '+iname(e.it));tone(150,.15);return}
    if(e.gid){if(!NET.ok){msg('Non sei collegato al server: non puoi raccoglierlo ora');return}if(e.pend&&t-e.pend<2)return;e.pend=t;NET.send({t:'gtake',id:e.gid,rm:rmKey()});return}
    ents.splice(ents.indexOf(e),1);if(e.lid)gndTake(e.lid);gain(e.it,e.px,e.py);return}
  if(e.k==='shard'){ents.splice(ents.indexOf(e),1);sceneShard(e);P.sh.push(e.id);jingle([72,79,84,91],.14,'triangle');PA={ti:'Frammento della Corona ('+P.sh.length+'/6)',tx:SHT[e.id]+(P.sh.length===6?'\n\nHai tutti e sei i frammenti! Riportali al Re Aldric, nel castello di Aldoria.':'')};
    if(P.sh.length>=6&&P.st===1)P.st=2;pn('txt');save();if(typeof filmShard==='function')filmShard(e.id);return}
  if(e.k==='lore'){ents.splice(ents.indexOf(e),1);if(cineOK()){sparks(e.px,e.py,12,['#f4e8c8','#ffd98a'],70);flyIcon(ICON('pagina',2).u,scr(e.px,e.py,14),bagBtn(),{sz:26})}P.lore.push(e.id);jingle([64,67,71],.12,'triangle');PA={ti:LORE[e.id][0],tx:LORE[e.id][1],sub:'Pagina '+P.lore.length+'/'+Object.keys(LORE).length+' · la trovi nel Diario (K)'};pn('txt');save();return}
  if(e.k==='board'){NET.send({t:'lb'});pn('lb');return}}
// 7.10: un oggetto che cadrebbe dentro un muro, un arredo o l'acqua (boss ucciso contro una parete, forziere accanto al muro)
// finisce sulla casella libera più vicina, così si può sempre raccogliere
function dropOk(d){if(blk(d.px,d.py)){const[u,v]=nearFree(d.px|0,d.py|0);if(!blk(u+.5,v+.5)){d.px=u+.5;d.py=v+.5}}return d}
function gain(it,wx,wy){if(P.inv.length<INV){P.inv.push(it);msg('Raccolto: '+iname(it));itemFly(it,wx,wy);hud();return true}
  const[x,y]=dropPos();dropLocal(it,x,y);msg('Zaino pieno: '+iname(it)+' è rimasto a terra accanto a te');hud();return false}
/* ---- oggetti a terra personali (giocando da soli, o quando lo zaino è pieno): restano nella zona per 10 minuti ---- */
const GND={};let lidN=1;
const gKey=()=>Zk+(ZZ&&ZZ.dg?'#'+ZZ.run:'');
function dropPos(){for(let k=0;k<10;k++){const a=Math.random()*6.283,r=.45+Math.random()*.35,x=P.px+Math.cos(a)*r,y=P.py+Math.sin(a)*r;if(!blk(x,y))return[x,y]}return[P.px,P.py]}
function dropLocal(it,x,y,anim){const k=gKey(),o={lid:lidN++,it,x,y,t:Date.now()};(GND[k]=GND[k]||[]).push(o);const d={k:'dr',px:x,py:y,it,lid:o.lid};if(anim)arcFrom(d,P.px,P.py,.45);ents.push(d)}
function gndRestore(){const k=gKey(),L=(GND[k]||[]).filter(o=>Date.now()-o.t<600000);GND[k]=L;for(const o of L)ents.push({k:'dr',px:o.x,py:o.y,it:o.it,lid:o.lid})}
function gndTake(lid){const k=gKey();if(GND[k])GND[k]=GND[k].filter(o=>o.lid!==lid)}
// gli oggetti a terra personali finiscono nel salvataggio, così restano anche ricaricando la pagina (sempre per 10 minuti)
function gndSave(){const o={},now=Date.now();for(const k in GND){const L=GND[k].filter(q=>now-q.t<600000);if(L.length)o[k]=L.map(q=>({it:q.it,x:q.x,y:q.y,t:q.t}))}return o}
function gndLoad(src){for(const k in GND)delete GND[k];if(!src||typeof src!=='object')return;for(const k in src)if(Array.isArray(src[k]))GND[k]=src[k].filter(q=>q&&q.it&&'whcs'.includes(q.it.s)).map(q=>({lid:lidN++,it:q.it,x:+q.x||0,y:+q.y||0,t:+q.t||0}))}

/* ================= aggiornamento ================= */
const ITK=new Set(['npc','po','ch','dr','shard','lore','board','res','fs','stash','console','clue','c100','vaso','letto','reliq','botola','portap','secret','portac','shard7']);
function upd(dt){t+=dt;timeTick(dt);if(Zk==='mare'&&NAV)navTick(dt);gateTick(dt);bossAI(dt);campTick(dt);dimTick(dt);if(DREAM)dreamTick(dt);vecTick(dt);routineTick(dt);homeSleep(dt);roomsTick(dt);occTick(dt);tourTick(dt);warTick(dt);if(ents.some(e=>e.k==='dead'))ents=ents.filter(e=>e.k!=='dead'||t-e.t0<.7);for(const e of ents)if(e.k==='resx'&&t>e.rt)e.k='res';for(const k of['bt','at','sk','pc','fl','sw','rp','bA','bD'])P[k]-=dt;for(const k of['iv','dgc','lgc','pf'])P[k]=Math.max(0,(P[k]||0)-dt);
  if(P.dm){const m=P.dm;m.t-=dt;const sp=m.v*dt;mv(P,m.dx*sp,m.dy*sp);
    if(m.k==='l'){for(const e of ents.slice())if(e.k==='en'&&!m.h.includes(e)&&dist(e,P)<1.4){m.h.push(e);const r=roll(m.m);hurtE(e,r.d,0,r.cr);if(!e.boss&&ents.includes(e))mv(e,m.dx*.5,m.dy*.5)}
      if(inPit(P.px,P.py))for(const o of NET.list)if(!m.h.includes(o)&&inPit(o.px,o.py)&&dist(o,P)<1.4){m.h.push(o);const r=roll(m.m);pvpHit(o,r.d,r.cr)}}
    if(m.t<=0)P.dm=null}
  const kd=keyDir();P.km=0;
  if(kd&&!P.dm&&P.hp>0){const[dx,dy]=kd,s=3.9*dt,r=.24;
    if(!blk(P.px+dx*s+Math.sign(dx)*r,P.py))P.px+=dx*s;if(!blk(P.px,P.py+dy*s+Math.sign(dy)*r))P.py+=dy*s;
    P.dr=[dx,dy];P.path=[];P.tg=null;P.km=1}
  IT=null;{let bd=1.7;for(const e of ents){if(!ITK.has(e.k))continue;const q=dist(e,P);if(q<bd){bd=q;IT=e}}}
  const tg=P.dm?null:P.tg;
  if(tg){const alive=tg.k==='pl'?NET.list.includes(tg):ents.includes(tg);if(!alive)P.tg=null;else{const d=dist(P,tg),rg=tg.k==='en'?(MODE==='dim'?dimW().r:tg.boss||tg.b.pt?2.2:1.5):tg.k==='pl'?1.5:1.25;
    if(d<=rg){P.path=[];if(d>.05)P.dr=[(tg.px-P.px)/d,(tg.py-P.py)/d];
      if(tg.k==='en'){if(P.at<=0){if(MODE==='dim')dimShoot(tg);else{P.at=.55;P.sw=.2;P.swc++;const r=roll();hurtE(tg,r.d,0,r.cr)}}}
      else if(tg.k==='pl'){if(!inPit(tg.px,tg.py)||!inPit(P.px,P.py))P.tg=null;else if(P.at<=0){P.at=.55;P.sw=.2;P.swc++;const r=roll();pvpHit(tg,r.d,r.cr)}}
      else{P.tg=null;act(tg)}}
    else if(P.rp<=0){P.rp=.25;P.path=pathTo(tg.px|0,tg.py|0)}}}
  if(P.path.length&&!P.dm){const w=P.path[0],dx=w.x+.5-P.px,dy=w.y+.5-P.py,d=Math.hypot(dx,dy),s=3.9*dt;if(d>.01)P.dr=[dx/d,dy/d];if(d<=s){P.px=w.x+.5;P.py=w.y+.5;P.path.shift()}else{P.px+=dx/d*s;P.py+=dy/d*s}}
  // direzione del corpo (8 versi, cambio istantaneo). Rilasciando due tasti non nello stesso istante, resta la direzione tenuta più a lungo.
  if(kd&&P.km){const f=faceOf(P.dr[0],P.dr[1]);if(f!==P.fc){P.fpv=P.fc;P.fc=f;P.fht=0}else P.fht=(P.fht||0)+dt;P.kmw=1}
  else if(P.kmw){P.kmw=0;if(P.fht<.1&&P.fpv!=null)P.fc=P.fpv}
  else if(P.dr&&(P.path.length||P.tg||(P.dm&&P.dm.k==='l')))P.fc=faceOf(P.dr[0],P.dr[1]);
  for(const e of ents){if(e.k!=='npc'||!(e.wd||e.go))continue;
    if(e.path.length){const w=e.path[0],dx=w.x+.5-e.px,dy=w.y+.5-e.py,d=Math.hypot(dx,dy),s=1.6*dt;if(d<=s){e.px=w.x+.5;e.py=w.y+.5;e.path.shift()}else{e.px+=dx/d*s;e.py+=dy/d*s}}
    else if((e.wt-=dt)<=0){e.wt=2+Math.random()*5;const x=(e.px|0)+Math.floor(Math.random()*13)-6,y=(e.py|0)+Math.floor(Math.random()*13)-6;if(x>0&&y>0&&x<N-1&&y<N-1&&(M[y][x]===4||(e.wg&&M[y][x]===0)))e.path=path(e.px|0,e.py|0,x,y).slice(0,e.wg?6:14)}}
  const zk0=Zk;for(const e of ents.slice()){if(Zk!==zk0||!started)break;if(e.k!=='en'||e.tr||e.pup)continue;e.fl-=dt;e.cdt-=dt;e.slt-=dt;
    let tp=P,d=dist(e,P);for(const o of NET.list){const q=dist(e,o);if(q<d){d=q;tp=o}}
    if(d<e.ag||e.al){e.al=d<e.ag*2.5;if(e.boss&&!e.intro&&tp===P){e.intro=1;sceneBoss(e)}
      if(e.boss&&!e.enr&&e.hp<e.mx*.5){e.enr=1;e.sp*=1.3;e.cd*=.7;msg(e.n+' si infuria!');tone(90,.4,'sawtooth',.08);
        if(e.b.sum)for(let i=0;i<3;i++){const a=i*2.1,[x,y]=nearFree(clamp(Math.floor(e.px+Math.cos(a)*1.7),1,N-2),clamp(Math.floor(e.py+Math.sin(a)*1.7),1,N-2));if(WK(M[y][x])){const m=mk(e.b.sum,x,y,10000+e.id*10+i);m.al=1;ents.push(m)}}}
      if(e.b.slam&&e.slt<=0&&d<5){e.slt=e.enr?5:7;fx.push({k:'warn',x:e.px,y:e.py,r:2.6,t:1.1,mx:1.1,dmg:e.at*1.5});tone(70,.3,'sawtooth',.05)}
      if(d>e.r*.9)enMove(e,tp,d,dt)
      else if(e.cdt<=0){e.cdt=e.cd;const dd=Math.hypot(tp.px-e.px,tp.py-e.py)||1;e.atkT=t;e.atkD=[(tp.px-e.px)/dd,(tp.py-e.py)/dd];if(e.b.rng){shoot(e,tp);if(tp!==P&&tp.k==='pl'&&typeof syncEH==='function')syncEH(tp.id,e.at)}else if(tp===P)hurtP(e.at);else if(tp.k==='pl'&&typeof syncEH==='function')syncEH(tp.id,e.at)}}}
  for(const p of PJ){p.t-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;if(blk(p.x,p.y))p.t=0;else if(Math.hypot(p.x-P.px,p.y-P.py)<.45&&started){p.t=0;hurtP(p.d)}}PJ=PJ.filter(p=>p.t>0);
  for(const f of fx){f.t-=dt;if(f.k==='warn'&&f.t<=0){fx.push({k:'boom',x:f.x,y:f.y,r:f.r,t:.4});tone(60,.25,'sawtooth',.08);if(Math.hypot(P.px-f.x,P.py-f.y)<f.r)hurtP(f.dmg);if(typeof syncEH==='function'&&!f.pup)for(const o of NET.list)if(Math.hypot(o.px-f.x,o.py-f.y)<f.r)syncEH(o.id,f.dmg)}}
  fx=fx.filter(f=>f.t>0);for(const p of pop)p.t-=dt;pop=pop.filter(p=>p.t>0);
  netTick(dt);partUpd(dt);ffUpd(dt);
  if((bossT-=dt)<=0){bossT=.5;const b=ents.find(e=>e.boss&&e.al&&dist(e,P)<14);music(b?'boss':zoneMus());npcMarks()}
  if((saveT-=dt)<=0){saveT=20;save()}}

/* ================= salvataggio ================= */
const SAVEK='voxelia4';
function save(){if(!P||!started)return;if(MODE==='dim'){dimSave();return}LS.set(SAVEK,{v:4,name:NET.name,code:NET.code,df:DFS.indexOf(DF),t:Date.now(),gnd:gndSave(),
  p:{lv:P.lv,xp:P.xp,g:P.g,pot:P.pot,hp:P.hp,eq:P.eq,inv:P.inv,q:P.q,qd:P.qd,qi:P.qi,st:P.st,sh:P.sh,lore:P.lore,runs:P.runs,hc:P.hc,done:P.done,seen:P.seen,kills:P.kills,gt:P.gt,ap:P.ap,unl:P.unl,res:P.res,fish:P.fish,rod:P.rod,bag:P.bag,skl:P.skl,egg:P.egg,slp:P.slp,dreamt:P.dreamt,dream:P.dream,pick:P.pick,sec:P.sec,secR1:P.secR1,secR2:P.secR2,te:P.te,s7:P.s7,key:P.key,tru:P.tru,vdp:P.vdp,vprop:P.vprop,vdug:P.vdug,vcult:P.vcult,vn:P.vn,vl:P.vl,vld:P.vld,room:P.room,stash:P.stash,sold:P.sold,navw:P.navw,frec:P.frec,bat:P.bat,sea:P.sea}})}
