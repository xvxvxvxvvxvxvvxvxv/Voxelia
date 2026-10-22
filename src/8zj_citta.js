/* ================= 7.14: la nuova musica di Aldoria =================
   «Le vie di Aldoria»: il tema della città è riscritto da capo. Il brano cresce sezione dopo sezione, come una giornata in
   città: un'apertura d'arpa, il tema al flauto, il tema ripreso con il violino che gli risponde, un ponte più pensoso allo
   zufolo e infine il ritornello di festa agli ottoni, un tono sopra, con il violino che corre e i tamburi pieni.
   Tutto ciò che usava il vecchio tema «town» (la città, i quartieri, i filmati girati in piazza e al porto, le mappe di
   Voxelia Studio) suona automaticamente quello nuovo.

   Il motore dei brani scritti (6.8) impara alcune cose nuove, che valgono per qualsiasi brano che le usi:
   - ogni sezione può cambiare strumento solista, accompagnamento, basso, batteria, volume e tonalità (ld, cp, bs, dr, lv, dv, root…);
   - una seconda voce (m2, con lo strumento ld2) che suona insieme alla melodia;
   - un'armonia (hm): la melodia raddoppiata una terza sotto, più piano. */
const SONG_PART_KEYS=['ld','cp','bs','dr','lv','dv','bv','root','echo','fill'];
function songPrep2(T){if(T.ev2)return;songPrep(T);const spb=T.spb||16;T.ev2={};
  for(const pk in T.parts){const p=T.parts[pk];if(!p.m2)continue;const n=p.ch.length*spb,ev=new Array(n);let pos=0;
    for(const tk of p.m2.trim().split(/\s+/)){const[a,b]=tk.split(':'),l=+(b||2);if(a!=='r'&&pos<n){let s=a,acc=0;if(s.endsWith('#')){acc=1;s=s.slice(0,-1)}else if(s.endsWith('b')){acc=-1;s=s.slice(0,-1)}ev[pos]=[+s,l,acc]}pos+=l}
    T.ev2[pk]=ev;T.chk=(T.chk||[]).concat([pk+'2:'+pos+'/'+n])}}
const _songStep714=songStep;
songStep=function(T,s,b,t0,dt,spb){if(!T.dyn){_songStep714(T,s,b,t0,dt,spb);return}songPrep2(T);
  const[pk,bi]=T.bars[b%T.bars.length],p=T.parts[pk],old={};
  for(const k of SONG_PART_KEYS)if(p[k]!==undefined){old[k]=T[k];T[k]=p[k]}
  try{_songStep714(T,s,b,t0,dt,spb);
    const sc=SCL[T.sc],mid=k=>T.root+sc[((k%7)+7)%7]+12*Math.floor(k/7),i=bi*spb+s,lv=T.lv||.05;
    // armonia: la melodia una terza sotto (due gradi della scala), più piano
    const e=T.ev[pk][i];if(e&&p.hm)ins(mid(e[0]-2)+e[2],t0+.008,dt*e[1]*.9,T.ld,lv*(p.hmv||.42),1);
    // seconda voce
    const e2=T.ev2[pk]&&T.ev2[pk][i];if(e2)ins(mid(e2[0])+e2[2],t0,dt*e2[1]*.92,p.ld2||T.ld2||'fiddle',p.lv2||T.lv2||.03,1);
  }finally{for(const k in old)T[k]=old[k]}};

// «Le vie di Aldoria» · re maggiore, 120 battiti. I = apertura, A = tema, X = tema con la risposta del violino,
// B = ponte, C = ritornello di festa (un tono sopra). Ogni battuta sono 16 sedicesimi: "grado:durata".
TRK.town={sng:1,dyn:1,bpm:120,root:62,sc:'maj',ld:'flute',lv:.05,echo:1,bs:'walk',bv:.085,cp:'strum',dr:'soft',dv:.8,form:'IAXBCX',ld2:'fiddle',lv2:.028,parts:{
  // l'apertura: l'arpa sale e scende sopra un tappeto morbido, senza tamburi
  I:{ch:[0,3,5,4],ld:'harp',lv:.07,cp:'pad',bs:'long',bv:.06,dr:'none',
    m:'0:2 4:2 7:2 9:2 11:4 9:2 7:2  3:2 7:2 10:2 12:2 14:4 12:2 10:2  5:2 9:2 12:2 14:2 16:4 14:2 12:2  11:2 8:2 6:2 4:2 8:4 r:4'},
  // il tema: semplice, da fischiettare, con il ritmo puntato delle danze di piazza
  A:{ch:[0,4,5,3],cp:'strum',dr:'soft',
    m:'4:3 4:1 5:2 7:2 9:6 7:2  8:3 7:1 6:2 4:2 6:8  7:3 9:1 11:2 9:2 7:2 5:2 4:4  3:2 4:2 5:2 7:2 8:4 r:4'},
  // il tema ripreso: sale più in alto e si chiude sulla tonica, il violino risponde sotto
  X:{ch:[0,4,3,0],cp:'strum arp',dr:'folk',fill:1,
    m:'4:3 4:1 5:2 7:2 9:6 7:2  8:3 7:1 6:2 8:2 11:8  10:3 9:1 7:2 5:2 3:2 5:2 7:4  9:2 8:2 6:2 4:2 7:8',
    m2:'2:4 0:4 2:4 4:4  1:4 4:4 6:8  3:4 5:4 3:4 1:4  2:4 4:4 0:8'},
  // il ponte: lo zufolo, più pensoso, sugli accordi minori; gli archi tengono le note lunghe
  B:{ch:[5,1,3,4],ld:'whis',lv:.045,cp:'ens',bs:'pulse',bv:.07,dr:'light',
    m:'9:2 7:2 5:2 7:4 9:2 12:4  12:3 10:1 8:4 10:2 8:2 5:4  10:2 12:2 14:4 12:2 10:2 7:4  11:4 13:4 11:2 8:2 6:4'},
  // il ritornello di festa: un tono sopra, ottoni con l'armonia, il violino che corre, tamburi pieni
  C:{ch:[0,3,4,0],root:64,ld:'brass',lv:.042,hm:1,hmv:.45,cp:'stab strum',bs:'pulse8',bv:.09,dr:'folk',dv:1.05,fill:1,
    m:'7:2 7:2 9:2 7:2 11:4 9:4  10:2 10:2 12:2 10:2 14:4 12:4  11:2 9:2 8:2 6:2 8:2 11:2 13:4  14:6 11:2 7:8',
    m2:'0:2 2:2 4:2 2:2 0:2 2:2 4:2 7:2  3:2 5:2 7:2 5:2 3:2 5:2 7:2 10:2  4:2 6:2 8:2 6:2 4:2 6:2 8:2 11:2  7:4 4:4 0:8'}}};
if(typeof ETRKN!=='undefined')ETRKN.town='Le vie di Aldoria';
