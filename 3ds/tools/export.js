// Esporta dalla versione browser di Voxelia (voxelia.html) i dati per la 3DS:
// geometria voxel di ogni zona (le chiamate box/rbox del renderer originale), collisioni, luci, entità,
// modelli animati di nemici e personaggi, l'eroe componibile e le tabelle del gioco.
// Uso: VOXELIA_HTML=../voxelia.html node export.js ../romfs
const {ev}=require('./headless.js');const fs=require('fs'),path=require('path');
const OUT=process.argv[2]||'romfs';fs.mkdirSync(OUT,{recursive:true});
const JS=`(${function(){
  const cols={};
  const col=c=>{if(cols[c]!=null)return cols[c];let r=0,g2=0,b=0;c=String(c||'#888');
    if(c[0]==='#'){if(c.length===4){r=parseInt(c[1]+c[1],16);g2=parseInt(c[2]+c[2],16);b=parseInt(c[3]+c[3],16)}else{r=parseInt(c.slice(1,3),16);g2=parseInt(c.slice(3,5),16);b=parseInt(c.slice(5,7),16)}}
    else{const m=c.match(/[\d.]+/g)||[];r=+m[0]||0;g2=+m[1]||0;b=+m[2]||0}
    return cols[c]=((r&255)<<16)|((g2&255)<<8)|(b&255)};
  const WARM=new Set([0xffd27a,0xffe9a8,0xffe08a,0xffcc33,0xfff2a0,0xff8a2a,0xff7a2a,0xffd84a,0xfff6c0,0xffd890,0xff6a1a,0xffb04a]);
  let CUR=null;
  box=function(x,y,z,w,d,h,c,f){if(!CUR)return;if(f===undefined)f=1;if(!(w>0)||!(d>0))return;CUR.push([x,y,z,w,d,Math.max(0,h),col(c),f,g.globalAlpha,0,0,0])};
  rbox=function(x,y,z,w,d,h,c,ca,sa,ox,oy){if(!CUR)return;CUR.push([x,y,z,w,d,Math.max(0,h),col(c),1,g.globalAlpha,1,ox,oy])};
  let LREC=null;nlight=function(x,y,z,r,c,a){if(LREC)LREC.push([x,y,z,r,c,a])};
  const enc=(B,ox,oy,tileOf)=>{const o=[];for(const b of B){let x=b[0],y=b[1];if(b[9]){x=b[0];y=b[1]}else{x-=ox;y-=oy}
    const fl=((b[7]>1.05||WARM.has(b[6]))?1:0)|(b[9]?2:0);
    o.push([Math.round(x*256),Math.round(y*256),Math.round(b[2]*8),Math.round(b[5]*8),Math.round(b[3]*256),Math.round(b[4]*256),b[6],Math.min(255,Math.round(b[7]*100)),Math.round(Math.max(0,Math.min(1,b[8]))*255),fl,tileOf?tileOf(b):0])}return o};
  const MODELS=[],MH={};
  const addModel=(frames,fpd)=>{const k=JSON.stringify(frames);if(MH[k]!=null)return MH[k];MODELS.push({fpd,frames});return MH[k]=MODELS.length-1};
  const DIR=[[0,1],[-1,1],[-1,0],[-1,-1],[0,-1],[1,-1],[1,0],[1,1]];
  const OCCK='rlSsWwFK';
  function capNpc(e){const fr=[];const o={px:e.px,py:e.py,path:e.path,lpx:e.lpx,lpy:e.lpy,nmv:e.nmv,nfd:e.nfd,fc0:e.fc0};
    for(let fc=0;fc<8;fc++)for(let j=0;j<3;j++){t=j?1+j*.21:0;if(j){e.nmv=t;e.nfd=DIR[fc]}else{e.nmv=-9;e.fc0=fc}e.lpx=e.px;e.lpy=e.py;e.path=[];CUR=[];try{ent(e)}catch(err){}fr.push(enc(CUR,e.px,e.py));CUR=null}
    Object.assign(e,o);return addModel(fr,3)}
  function capEn(e){const fr=[];
    for(let fc=0;fc<8;fc++){for(let j=0;j<4;j++){if(j<3){t=10+j*.2094;e.mvT=t;e.atkT=0;e.atkD=null}else{t=20;e.mvT=-9;e.atkT=t-.09;e.atkD=DIR[fc]}
      e.fd=DIR[fc];e.lpx=e.px;e.lpy=e.py;e.al=1;e.cdt=1;e.fl=0;e.enr=0;CUR=[];try{ent(e)}catch(err){}fr.push(enc(CUR,e.px,e.py));CUR=null}}
    return addModel(fr,4)}
  const STATICK=k=>!['npc','en','ch','cho','dr','shard','lore','dead','pl','tc','abo','resx','lev'].includes(k);
  function capZone(k){load(k);const sp=[+P.px.toFixed(2),+P.py.toFixed(2)];let vp=null;if(ZZ.lay)ZZ.lay.forEach((r,y)=>{const x=r.indexOf('V');if(x>=0)vp=[x+.5,y+.5]});t=0;NK=0;DK=0;FC=null;P.px=-999;P.py=-999;P.path=[];P.tg=null;PA=null;PM=0;
    const z=ZZ,n=N,B=[],L=[];LREC=L;
    for(let y=0;y<n;y++)for(let x=0;x<n;x++){CUR=[];try{tile(x,y)}catch(err){}for(const b of enc(CUR,0,0))b[10]=y*n+x,B.push(b)}
    const E2=[];
    for(const e of ents){const q={k:e.k,x:+e.px.toFixed(3),y:+e.py.toFixed(3)};
      const seal=e.seal;if(seal)e.seal=0;   // la grata la disegna la 3DS, finché le leve non la aprono
      if(STATICK(e.k)){CUR=[];try{ent(e)}catch(err){}const tx=Math.max(0,Math.min(n-1,Math.floor(e.px))),ty=Math.max(0,Math.min(n-1,Math.floor(e.py)));for(const b of enc(CUR,0,0))b[10]=ty*n+tx,B.push(b);CUR=null}
      if(e.k==='npc'){q.nid=e.nid;q.n=e.n;q.wd=e.wd?1:0;q.mdl=capNpc(e);if(e.slp)q.slp=1;if(e.ghost)q.ghost=1}
      else if(e.k==='en'){q.t=e.t;if(e.boss)q.boss=1}
      else if(e.k==='po'){q.to=e.to;q.st=e.st;q.n=e.n0||e.n;q.col=e.col;if(seal)q.seal=1,e.seal=seal;if(e.lock)q.lock=e.lock,q.lockMsg=e.lockMsg;}
      else if(e.k==='ch'){if(e.rich)q.rich=1;if(e.hc)q.hc=e.hc}
      else if(e.n)q.n=e.n;
      if(e.id!=null&&typeof e.id==='string')q.id=e.id;if(e.r!=null&&typeof e.r==='string')q.r=e.r;
      E2.push(q)}
    LREC=null;
    B.sort((a,b)=>a[10]-b[10]);
    const occ=[];for(let y=0;y<n;y++)for(let x=0;x<n;x++){const c=M[y][x];occ.push(c===1&&!(typeof openW==='function'&&openW(x,y))||c===3||(c===6&&OCCK.includes(DEC[y][x]))?1:0)}
    const grid=[];for(let y=0;y<n;y++)for(let x=0;x<n;x++)grid.push(M[y][x]);
    const lights=L.filter(l=>l&&isFinite(l[0])).map(l=>[+l[0].toFixed(2),+l[1].toFixed(2),Math.round(l[2]),Math.round(l[3]),String(l[4]),+(+l[5]).toFixed(2)]);
    return{k,N:n,n:z.n,lv:z.lv|0,bg:z.bg||'#141820',mus:z.mus||'',int:z.int?1:0,dg:z.dg||'',dn:z.dn||0,boss:z.boss||'',out:SKY[k]?1:0,tc:z.tc||'',sp,vp,grid,occ,boxes:B,lights,ents:E2}}
  // eroe componibile: corpo, corazza, elmo, scudo e arma per tipo, in coordinate locali (senza posa)
  function capHero(){const oRC=RC.slice();const MK=['#fe0100','#fe0200','#fe0300','#fe0400','#fe0500'];for(let i=0;i<5;i++)RC[i]=MK[i];
    const H=[];const ty=(w,h,c,s)=>[EQT.w[w],h<0?'-':EQT.h[h],c<0?'-':EQT.c[c],s<0?'-':EQT.s[s]].join('.');
    for(let c=-1;c<3;c++)for(let h=-1;h<4;h++)for(let s=-1;s<3;s++)for(let w=0;w<8;w++)for(let sw=0;sw<2;sw++){
      const L=heroL(APM,c<0?-1:0,h<0?-1:1,2,20,s<0?-1:3,sw?1:0,ty(w,h,c,s));H.push(L.map(b=>[b[0],b[1],b[2],b[3],b[4],b[5],col(b[6])]))}
    for(let i=0;i<5;i++)RC[i]=oRC[i];return H}
  window.__VX={capZone,capEn,capNpc,capHero,MODELS,col};return 1}})()`;
setTimeout(()=>{try{
  ev('begin(1,null)');ev(JS);
  const skip=/^(dim_|mare$|arrembaggio|stiva|sogno|bat_|mare_|cella|occhio|culto|vecchia|torre\d|cava43|abissi46)/;
  const zones=ev('Object.keys(Z)').filter(k=>!skip.test(k));
  const dgs=ev('Object.keys(DG).map(k=>[k,DG[k].fls])');
  const list=[];for(const k of zones)list.push([k,0]);for(const[d,f]of dgs)for(let fl=1;fl<=f;fl++)for(let run=0;run<2;run++)list.push([d+'@'+fl,run]);
  const meta={};let tot=0;
  for(const[k,run]of list){const d=k.includes('@')?k.split('@')[0]:null;
    try{if(d)ev(`P.runs[${JSON.stringify(d)}]=${run}`);const z=ev(`__VX.capZone(${JSON.stringify(k)})`);const name=(k+(d?'#'+run:'')).replace(/[@#]/g,'_');
      writeZone(path.join(OUT,'z_'+name+'.bin'),z);delete z.grid;delete z.occ;delete z.boxes;
      fs.writeFileSync(path.join(OUT,'z_'+name+'.json'),JSON.stringify(z));meta[k+(d?'#'+run:'')]={n:z.n,N:z.N};tot++}
    catch(e){console.error('zona',k,run,String(e).slice(0,150))}}
  // nemici
  ev(`load('forest')`);
  const et=ev('Object.keys(E)');const EN={};
  for(const t of et){try{const mdl=ev(`(()=>{const e=mk(${JSON.stringify(t)},12,12);return __VX.capEn(e)})()`);EN[t]=mdl}catch(e){console.error('nemico',t,String(e).slice(0,120))}}
  const models=ev('__VX.MODELS');writeModels(path.join(OUT,'models.bin'),models);
  const hero=ev('__VX.capHero()');writeHero(path.join(OUT,'hero.bin'),hero);
  const data=ev(`JSON.parse(JSON.stringify({E:Object.fromEntries(Object.entries(E).map(([k,v])=>[k,Object.assign({},v,{m:undefined})])),
    NPCS,QT,DG,STORY,SHT,LORE,DGH:typeof DGH!=='undefined'?DGH:{},RC,RN,SL,SN,UQ,LG,LGA,DFS,TH,VILL,VLINES,EQT,
    Z:Object.fromEntries(Object.entries(Z).map(([k,v])=>[k,{n:v.n,N:v.N,lv:v.lv,int:v.int?1:0,out:SKY[k]?1:0}]))}))`);
  for(const t in EN)if(data.E[t])data.E[t].mdl=EN[t];
  data.zones=meta;fs.writeFileSync(path.join(OUT,'data.json'),JSON.stringify(data));
  console.log('zone',tot,'modelli',models.length,'eroe',hero.length);process.exit(0)}catch(e){console.error(e);process.exit(1)}},2500);
function u16(a,v){a.push(v&255,(v>>8)&255)}
function boxBytes(a,b){for(let i=0;i<4;i++)u16(a,b[i]&0xffff);u16(a,Math.min(65535,b[4]));u16(a,Math.min(65535,b[5]));a.push((b[6]>>16)&255,(b[6]>>8)&255,b[6]&255,b[7],b[8],b[9]);u16(a,b[10])}
function writeZone(f,z){const a=[];a.push(86,88,90,49);u16(a,z.N);u16(a,z.boxes.length);u16(a,z.lights.length);for(const v of z.grid)a.push(v&255);for(const v of z.occ)a.push(v);
  for(const b of z.boxes)boxBytes(a,b);
  for(const l of z.lights){const c=l[4].split(',').map(Number);u16(a,Math.round(l[0]*256)&0xffff);u16(a,Math.round(l[1]*256)&0xffff);u16(a,l[2]&0xffff);u16(a,l[3]&0xffff);a.push(c[0]|0,c[1]|0,c[2]|0,Math.round(Math.min(1,l[5])*255))}
  fs.writeFileSync(f,Buffer.from(a))}
function writeModels(f,M){const a=[86,88,77,49];u16(a,M.length);for(const m of M){a.push(m.frames.length,m.fpd);for(const fr of m.frames){u16(a,fr.length);for(const b of fr)boxBytes(a,b)}}fs.writeFileSync(f,Buffer.from(a))}
function writeHero(f,H){const a=[86,88,72,49];u16(a,H.length);for(const L of H){a.push(L.length);for(const b of L){const q=[Math.round(b[0]*256),Math.round(b[1]*256),Math.round(b[2]*8),Math.round(b[5]*8),Math.round(b[3]*256),Math.round(b[4]*256),b[6],100,255,0,0];boxBytes(a,q)}}fs.writeFileSync(f,Buffer.from(a))}
