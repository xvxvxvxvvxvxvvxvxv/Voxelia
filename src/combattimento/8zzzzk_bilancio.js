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
{const T={serpe48:[95,23],guerriero48:[125,24],sacerdotessa48:[90,22],zombie:[78,13],scheletro:[56,15],demone:[108,25],fabbro_demone:[165,28],golem_magma:[160,23],salamandra:[85,25]};for(const k in T)if(E[k]){E[k].hp=T[k][0];E[k].at=T[k][1]}}
const BIL81={camp:2,campBoss:3,owDa:8,owPer:.03};
function bilOw81(lv){return 1+Math.max(0,(lv|0)-BIL81.owDa)*BIL81.owPer}
{const m0=mk;mk=function(t,x,y,id){const e=m0(t,x,y,id);try{if(e&&e.k==='en'&&typeof owOn==='function'&&owOn()&&ZZ&&!(e.b&&e.b.np)){const f=bilOw81(ZZ.lv);if(f>1){e.hp=e.mx=Math.round(e.mx*f);e.at*=f}}}catch(_){}return e}}
function bilCamp81(){const z=ZZ;if(!z||!z.dg)return;const C=ents.filter(e=>e.k==='en'&&e.elite&&!e.boss).sort((a,b)=>(a.chim55?1:0)-(b.chim55?1:0));const max=camp83()+(ents.some(e=>e.k==='en'&&e.boss)?1:0);
  for(const e of C.filter((e,i)=>i>=max||e.chim55)){e.elite=0;e.hp=e.mx=Math.round(e.mx/1.9);e.at/=1.3;e.sp/=1.1;e.cd/=.92;e.xp/=2.5;e.n=String(e.n||'').replace('Campione · ','')}}
{const l0=loadPost;loadPost=function(k){l0(k);try{bilCamp81()}catch(_){}}}
/* ================= 8.3: la difficoltà segue il tuo livello =================
   Nella Storia (dungeon e zone aperte, non la città né gli interni) il livello dei nemici dipende da due cose:
   - il dungeon: i nemici partono 2 livelli sopra il suo livello, e quando entri compare il livello consigliato;
   - il tuo livello: se sei più in alto, i nemici recuperano il 60% della distanza. A livello 30 nella Tana dei
     Goblin (livello 2) i goblin sono di livello 20: più facili di te, ma non innocui.
   Oro e oggetti seguono il livello dei nemici. Più sei forte, più escono Campioni: la probabilità sale fino al +12%
   e il limite per piano è 2, più 1 ogni 10 livelli. (Nella 8.1 Cripta, Fucina e Tempio erano stati alleggeriti:
    Cripta e Fucina ora sono a metà strada fra prima e dopo; il Tempio resta come nella 8.1.) */
const DIF83={sopra:2,rincorsa:.6};
function lv83(lv0){const b=(lv0|0)+DIF83.sopra,pl=P?(P.lv|0):1;return pl>b?Math.round(b+(pl-b)*DIF83.rincorsa):b}
function camp83(){return BIL81.camp+Math.floor(((P&&P.lv)|0)/10)}
function scala83(k,z){if(!z||MODE!=='story'||(typeof owOn==='function'&&owOn())||(typeof OW!=='undefined'&&OW.on))return false;if(k==='town'||k==='arena'||k==='cuore80'||z.int||z.lay||z.ed||z.war||z.neo||z.sp82)return false;return!!(z.dg||z.dist||z.th||z.lv>0)}
{const z0=zd;zd=function(k){const z=z0(k);try{if(z&&scala83(k,z)){if(z.lv0==null)z.lv0=z.lv;z.lv=lv83(z.lv0)}else if(z&&z.lv0!=null){z.lv=z.lv0}}catch(_){}return z}}
{const e0=eliteP;eliteP=function(z){const p=e0(z);if(p>0&&MODE==='story'&&P)return Math.min(.32,p+Math.min(.12,Math.max(0,(P.lv|0)-5)*.004));return p}}
{const l0=loadPost;loadPost=function(k){l0(k);try{const z=ZZ;if(z&&z.dg&&z.lv0!=null&&MODE==='story'){const rec=z.lv0+DIF83.sopra+1,low=(P.lv|0)<rec;
  setTimeout(()=>{if(Zk===k)banner((low?'⚠ ':'')+'Nemici di livello '+z.lv,'Livello consigliato '+rec+(low?' · sei sotto: vai piano':' · Campioni fino a '+(camp83()+(z.boss?1:0))+' per piano'),low?'teschio':'spade')},3200)}}catch(_){}}}
/* ---- 8.3: il mercato segue il tuo livello ----
   C'era già un piccolo aumento (+1,2% a livello). Ora nella Storia tutti i prezzi dei negozi salgono di un altro 2% a
   livello dal livello 5 (a livello 30 circa il doppio di un eroe all'inizio). L'oro dei nemici cresce con il loro
   livello, che adesso segue il tuo: il mercato resta in equilibrio. In cima ai negozi si vede di quanto è salito. */
const MER83={da:5,per:.02};
const mer83=()=>MODE==='story'&&P&&!(typeof OW!=='undefined'&&OW.on)?1+Math.max(0,(P.lv|0)-MER83.da)*MER83.per:1;
{const p0=priceMul;priceMul=function(){return p0()*mer83()}}
{const d0=dayBanner;dayBanner=function(){const h=d0(),m=Math.round((priceMul()-1)*100);if(MODE!=='story'||!P||m<=0)return h;return h+`<div class="mu" style="margin:-2px 0 6px">📈 Al livello ${P.lv|0} i prezzi sono più alti del ${m}% rispetto a un eroe all'inizio</div>`}}
