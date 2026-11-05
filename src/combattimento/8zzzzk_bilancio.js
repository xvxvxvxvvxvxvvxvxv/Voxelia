/* ================= 8.1: il bilanciamento =================
   Le correzioni trovate con tools/bilancia.js (un robot che gioca da solo ogni dungeon e misura quanta vita costa
   ogni nemico):
   - i Campioni: al massimo 2 per piano (3 sul piano del boss). Prima erano a caso e nelle Caverne di Cristallo ne
     uscivano anche 5 al primo piano, più forti dei nemici della Cittadella del Lich;
   - il Tempio di Giada (livello 14) aveva nemici più forti di quelli della Cittadella (livello 15): ora sono in linea;
   - la Cripta Dimenticata, il secondo dungeon, aveva nemici con il doppio della forza di quelli della Tana dei Goblin:
     zombie e scheletri sono un po' più deboli;
   - la Fucina Infernale (livello 10) aveva nemici più forti di quelli dell'Abisso Sommerso (livello 12): un po' più deboli;
   - una chimera dei dungeon non è più anche un Campione (le due cose insieme davano nemici con il triplo della vita);
   - Tomorrow: i nemici crescevano più piano dell'eroe e ai livelli alti non facevano quasi danno. Dal livello 8 in su
     vita e attacco crescono un po' di più (+3% per livello: al livello 30 sono 1,66 volte quelli di prima). */
{const T={serpe48:[95,23],guerriero48:[125,24],sacerdotessa48:[90,22],zombie:[70,12],scheletro:[52,14],demone:[100,23],fabbro_demone:[150,26],golem_magma:[150,22],salamandra:[80,23]};for(const k in T)if(E[k]){E[k].hp=T[k][0];E[k].at=T[k][1]}}
const BIL81={camp:2,campBoss:3,owDa:8,owPer:.03};
function bilOw81(lv){return 1+Math.max(0,(lv|0)-BIL81.owDa)*BIL81.owPer}
{const m0=mk;mk=function(t,x,y,id){const e=m0(t,x,y,id);try{if(e&&e.k==='en'&&typeof owOn==='function'&&owOn()&&ZZ&&!(e.b&&e.b.np)){const f=bilOw81(ZZ.lv);if(f>1){e.hp=e.mx=Math.round(e.mx*f);e.at*=f}}}catch(_){}return e}}
function bilCamp81(){const z=ZZ;if(!z||!z.dg)return;const C=ents.filter(e=>e.k==='en'&&e.elite&&!e.boss).sort((a,b)=>(a.chim55?1:0)-(b.chim55?1:0));const max=ents.some(e=>e.k==='en'&&e.boss)?BIL81.campBoss:BIL81.camp;
  for(const e of C.filter((e,i)=>i>=max||e.chim55)){e.elite=0;e.hp=e.mx=Math.round(e.mx/1.9);e.at/=1.3;e.sp/=1.1;e.cd/=.92;e.xp/=2.5;e.n=String(e.n||'').replace('Campione · ','')}}
{const l0=loadPost;loadPost=function(k){l0(k);try{bilCamp81()}catch(_){}}}
