// Estrae dalla versione browser (voxelia.html) le musiche scritte (6.8+): ogni brano già scomposto battuta per
// battuta, con strumenti, bassi, accompagnamenti e batterie. Uso: VOXELIA_HTML=../voxelia.html node songs.js out.json
const {ev}=require('./headless.js');const fs=require('fs');
setTimeout(()=>{try{
  const out=ev(`(()=>{const R={ins:INS,bass:BASS,drums:DRUMS,comp:COMP,scl:SCL,sgv:typeof SGV!=='undefined'?SGV:.52,songs:{}};
    const KEYS=typeof SONG_PART_KEYS!=='undefined'?SONG_PART_KEYS:[];
    for(const k in TRK){const T=TRK[k];if(!T||!T.sng)continue;songPrep(T);if(T.dyn&&typeof songPrep2==='function')songPrep2(T);const spb=T.spb||16;
      const bars=T.bars.map(([pk,bi])=>{const p=T.parts[pk],ev=T.ev[pk],m=[];for(let s=0;s<spb;s++){const e=ev[bi*spb+s];if(e)m.push([s,e[0],e[1],e[2]])}
        const ms=a=>a.map(e=>e.join(':')).join(' ');
        if(!T.dyn)return[p.ch[bi],ms(m)];
        // 7.14: ogni parte può cambiare strumento, accompagnamento, basso, batteria, volume e tonalità; seconda voce e armonia
        const o={};for(const kk of KEYS)if(p[kk]!==undefined)o[kk]=p[kk];
        const m2=[];const e2=T.ev2&&T.ev2[pk];if(e2)for(let s=0;s<spb;s++){const e=e2[bi*spb+s];if(e)m2.push([s,e[0],e[1],e[2]])}
        return[p.ch[bi],ms(m),{o,hm:p.hm?1:0,hmv:p.hmv||.42,m2:ms(m2),ld2:p.ld2||T.ld2||'fiddle',lv2:p.lv2||T.lv2||.03}]});
      R.songs[k]={bpm:T.bpm,root:T.root,sc:T.sc,spb,ld:T.ld,lv:T.lv||.05,echo:T.echo?1:0,bs:T.bs||'root',bv:T.bv||.09,cp:T.cp||'',dr:T.dr||'none',dv:T.dv||1,fill:T.fill?1:0,bars}}
    // brani ancora procedurali nella versione browser (dungeon, motel...): stessi parametri del generatore
    R.proc={};for(const k in TRK){const T=TRK[k];if(!T||T.sng)continue;R.proc[k]={bpm:T.bpm,root:T.root,sc:T.sc,pr:T.pr,ld:T.ld,dn:T.dn,dr:T.dr||0,bs:T.bs||[0,8],arp:T.arp?1:0,pad:T.pad?1:0,waltz:T.waltz?1:0,spb:T.spb||16}}
    R.nightz=[...NIGHTZ];
    return JSON.stringify(R)})()`);
  fs.writeFileSync(process.argv[2]||'songs.json',out);const j=JSON.parse(out);
  console.log('brani',Object.keys(j.songs).length,'strumenti',Object.keys(j.ins).length,'batterie',Object.keys(j.drums).length);process.exit(0)}catch(e){console.error(e);process.exit(1)}},2500);
