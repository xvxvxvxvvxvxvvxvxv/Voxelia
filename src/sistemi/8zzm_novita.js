/* ================= 7.38: IL PORTALE DOPO IL BOSS, LA MUSICA, LA MAPPA IN DETTAGLIO E L'ALLEVAMENTO =================
   - Sconfitto il boss di un dungeon si apre il portale e si resta nel dungeon: il portale porta fuori solo quando lo
     scegli tu (te lo chiede sempre), così non si finisce più fuori per sbaglio, mentre si combatte o si raccoglie.
   - La musica si sceglie: automatica (cambia con il luogo), un brano fisso, la radio (cambia brano da sola) o spenta.
     Otto brani nuovi, e tutti quelli del gioco. Impostazioni → Audio, o il menu di pausa (Esc).
   - Le mappe disegnano ogni casella: erba, sentieri e lastricati, acqua con le rive, alberi con la chioma e l'ombra,
     rocce, muri, tetti con il colmo e la porta, arredi. Nella mappa del mondo di Tomorrow, avvicinandosi, le regioni
     visitate si vedono casella per casella.
   - L'ALLEVAMENTO dei compagni, un edificio nuovo del borgo: addestra i compagni (più livelli), li rende tutti più forti
     a ogni potenziamento e ha un catalogo di creature da comprare, sempre più rare man mano che lo potenzi. */
/* ---- il portale dopo il boss ---- */
const _act738=act;act=function(e){if(e&&e.k==='po'&&e.dgx&&!e.ok){const L=dgLeft()||{};PA={po:e,L};pn('exitask');tone(330,.08,'triangle');return}_act738(e)};
const _pn738=pn;pn=function(m,arg){if(m==='exitask'){if(arg!==undefined)PA=arg;const L=(PA&&PA.L)||{};if(!L.sh&&!L.dr&&!L.ch){const po=PA&&PA.po,to=po?zname(po.to):'fuori';
    edPanel('exitask',`<h3>🌀 Il portale è aperto</h3><p>Il boss è sconfitto. Il portale ti riporta a <b>${esc(to)}</b>, quando vuoi tu: intanto puoi restare nel dungeon.</p><button class="gold" onclick="cl()">Resta qui</button><button onclick="const p=PA.po;cl();if(ents.includes(p)){p.ok=1;act(p)}">Esci dal dungeon</button>`);return}}_pn738(m,arg)};
// il portale appena aperto si fa notare
const _dungeonClear738=dungeonClear;dungeonClear=function(e){_dungeonClear738(e);const p=ents.find(x=>x.k==='po'&&x.dgx);if(p){p.t0=t;setTimeout(()=>{if(ents.includes(p))msg('🌀 Si è aperto il portale per uscire: toccalo quando vuoi andare')},3400)}};
/* ---- la musica ---- */
Object.assign(TRK,{
  // Alba sulle colline: maggiore, flauto e arpa, passo tranquillo
  mp_alba:BSONG({bpm:92,root:62,sc:'maj',ld:'flute',lv:.05,echo:1,bs:'walk',bv:.075,cp:'strum arp',dr:'soft',dv:.7,form:'IAABA',ld2:'harp',lv2:.03,parts:{
    I:{ch:[0,3,4,0],ld:'harp',cp:'pad',dr:'none',bs:'long',m:'0:4 2:4 4:4 7:4  5:4 4:4 2:8  4:4 6:4 8:4 7:4  4:12 r:4'},
    A:{ch:[0,5,3,4],m:'4:3 5:1 7:4 9:4 7:4  5:4 4:4 2:4 4:4  3:4 5:4 7:6 5:2  4:4 2:4 1:8'},
    B:{ch:[3,4,5,4],ld:'fiddle',cp:'pad bell',m:'7:4 9:4 10:4 9:4  8:4 7:4 6:8  5:4 7:4 9:4 11:4  9:12 r:4'}}}),
  // Il viandante: dorico, violino al galoppo
  mp_viandante:BSONG({bpm:116,root:57,sc:'dor',ld:'fiddle',lv:.045,bs:'gallop',bv:.085,cp:'strum',dr:'gallop',dv:.8,form:'AABBA',ld2:'flute',lv2:.025,parts:{
    A:{ch:[0,6,3,0],m:'0:2 2:2 4:2 5:2 7:4 5:4  6:2 5:2 4:2 2:2 4:8  3:2 4:2 5:2 7:2 8:4 7:4  5:4 4:4 2:4 0:4'},
    B:{ch:[3,4,6,0],ld:'accor',m:'7:4 9:4 10:2 9:2 7:4  8:4 6:4 4:8  5:2 6:2 7:2 9:2 10:4 9:4  7:12 r:4'}}}),
  // Notturno di stelle: minore, carillon lento e niente batteria
  mp_notturno:BSONG({bpm:64,root:64,sc:'min',ld:'mbox',lv:.05,echo:1,bs:'long',bv:.06,cp:'pad',dr:'none',form:'AABA',parts:{
    A:{ch:[0,5,3,6],m:'7:4 9:4 7:4 4:4  5:8 3:8  2:4 4:4 5:4 7:4  6:12 r:4'},
    B:{ch:[3,0,4,4],ld:'harp',cp:'pad bell',m:'9:6 10:2 9:4 7:4  4:8 7:8  5:4 7:4 9:4 11:4  9:16'}}}),
  // Giga della taverna: misolidio in sei ottavi, fisarmonica
  mp_taverna:BSONG({bpm:138,root:67,sc:'mix',spb:12,ld:'accor',lv:.034,bs:'shanty',bv:.09,cp:'strum6',dr:'jig',dv:.8,form:'AABB',ld2:'fiddle',lv2:.022,parts:{
    A:{ch:[0,6,0,4],m:'0:2 2:2 4:2 7:4 4:2  6:2 4:2 2:2 1:6  0:2 2:2 4:2 7:2 9:2 7:2  6:2 4:2 2:2 0:6'},
    B:{ch:[3,0,6,0],m:'7:4 9:2 10:4 9:2  7:2 6:2 4:2 6:6  7:2 9:2 7:2 6:2 4:2 2:2  4:6 0:6'}}}),
  // Marcia degli eroi: maggiore, ottoni e tamburi
  mp_eroi:BSONG({bpm:118,root:60,sc:'maj',ld:'brass',lv:.05,bs:'pulse',bv:.085,cp:'stab ens',dr:'military',dv:.85,form:'IAABA',ld2:'fiddle',lv2:.025,parts:{
    I:{ch:[0,4,0,4],cp:'pad',dr:'timp',m:'0:4 4:4 7:8  4:4 7:4 11:8  7:4 9:4 11:4 12:4  11:8 r:8'},
    A:{ch:[0,3,4,0],m:'7:3 7:1 9:2 11:2 12:8  10:3 9:1 7:4 9:8  8:3 8:1 9:2 11:2 12:4 14:4  11:12 r:4'},
    B:{ch:[5,3,1,4],ld:'organ',m:'9:4 11:4 12:4 9:4  10:4 9:4 7:8  8:4 9:4 11:4 8:4  7:12 r:4'}}}),
  // Sabbie dorate: minore armonica, liuto e tango
  mp_deserto:BSONG({bpm:94,root:55,sc:'hm',ld:'lute',lv:.05,echo:1,bs:'tango',bv:.08,cp:'pad arp',dr:'tango',dv:.75,form:'AABA',ld2:'reed',lv2:.026,parts:{
    A:{ch:[0,3,4,0],m:'4:2 5:2 6:2 7:2 6:4 4:4  3:2 4:2 5:2 7:2 5:8  4:2 2:2 1:2 2:2 4:4 6:4  4:12 r:4'},
    B:{ch:[5,3,6,4],ld:'reed',m:'7:4 8:4 9:4 8:4  7:4 6:4 4:8  5:2 6:2 7:2 9:2 8:4 6:4  7:16'}}}),
  // Vento di mare: lidio, fischietto e onde
  mp_mare:BSONG({bpm:84,root:65,sc:'lyd',ld:'whis',lv:.045,echo:1,bs:'waltz',bv:.07,cp:'pad bell',dr:'waves',dv:.7,form:'AABA',ld2:'harp',lv2:.03,parts:{
    A:{ch:[0,1,0,4],m:'4:4 3:2 4:2 6:4 4:4  7:8 6:4 4:4  3:4 4:4 6:4 7:4  4:12 r:4'},
    B:{ch:[5,1,3,4],ld:'flute',m:'9:4 8:4 7:4 6:4  7:8 4:8  6:4 7:4 9:4 11:4  10:12 r:4'}}}),
  // Tempesta d'acciaio: frigio veloce, battaglia
  mp_battaglia:BSONG({bpm:144,root:52,sc:'phr',ld:'fiddle',lv:.045,bs:'ostinato',bv:.09,cp:'stab',dr:'rock',dv:.9,form:'IAABAB',ld2:'brass',lv2:.03,parts:{
    I:{ch:[0,1,0,1],cp:'pad',dr:'timp',m:'0:8 1:8  0:4 1:4 3:4 1:4  0:8 1:8  4:12 r:4'},
    A:{ch:[0,1,6,0],m:'7:2 8:2 7:2 5:2 4:4 3:4  4:2 5:2 7:2 8:2 7:8  10:2 8:2 7:2 5:2 4:4 5:4  4:12 r:4'},
    B:{ch:[5,6,1,0],ld:'brass',m:'11:4 10:4 8:4 7:4  8:4 7:4 5:8  7:2 8:2 10:2 11:2 12:4 11:4  10:8 8:8'}}})});
const MPN=[['mp_alba','Alba sulle colline','Nuovi'],['mp_viandante','Il viandante','Nuovi'],['mp_notturno','Notturno di stelle','Nuovi'],['mp_taverna','Giga della taverna','Nuovi'],
  ['mp_eroi','Marcia degli eroi','Nuovi'],['mp_deserto','Sabbie dorate','Nuovi'],['mp_mare','Vento di mare','Nuovi'],['mp_battaglia','Tempesta d\'acciaio','Nuovi'],
  ['town','Aldoria','Dal gioco'],['forest','Foresta','Dal gioco'],['desert','Deserto','Dal gioco'],['peaks','Picchi','Dal gioco'],['inter','Valzer della taverna','Dal gioco'],['notte','Notturno','Dal gioco'],
  ['castello','Castello','Dal gioco'],['sogno','Sogno','Dal gioco'],['motel','Motel','Dal gioco'],['pesca','Pesca','Dal gioco'],['arena','Arena','Dal gioco'],['naval','Mare aperto','Dal gioco'],['dungeon','Dungeon','Dal gioco'],
  ['boss','Boss','Dal gioco'],['b_biblioteca','Biblioteca arcana','Dal gioco'],['b_taverna','Giga della locanda','Dal gioco'],['b_faro','Il faro','Dal gioco'],['b_tempio','Il tempio','Dal gioco'],['tw_saga','Tomorrow','Dal gioco'],['pr_saga','Il prologo','Dal gioco']].filter(r=>TRK[r[0]]);
if(SET.mpl==null)SET.mpl='';
const MPL={auto:null,cur:null,t:0};
const mpName=k=>{const r=MPN.find(x=>x[0]===k);return r?r[1]:k};
function mpNext(){const L=MPN.map(r=>r[0]).filter(k=>k!==MPL.cur&&k!=='boss');MPL.cur=L[Math.floor(Math.random()*L.length)];MPL.t=performance.now();return MPL.cur}
const _music738=music;music=function(n){MPL.auto=n;const s=SET.mpl;if(s==='mix'){if(!MPL.cur||!TRK[MPL.cur])mpNext();_music738(MPL.cur);return}if(s&&s!=='off'&&TRK[s]){_music738(s);return}_music738(n)};
function mpSet(v){v=String(v||'');auInit();if(v==='off'){SET.muOn=0;SET.mpl=SET.mpl==='off'?'':SET.mpl}else{SET.muOn=1;SET.mpl=v;if(v==='mix')mpNext()}
  LS.set('voxelia_set',SET);auVol();const a=MPL.auto||(typeof zoneMus==='function'&&ZZ?zoneMus():'menu');AU.want=null;music(a);if(v&&v!=='off')msg('🎵 '+(v==='mix'?'Radio: '+mpName(MPL.cur):mpName(v)));if($('set')&&$('set').style.display==='block'&&SETC==='audio')openSet()}
function mpSkip(){if(SET.mpl!=='mix'){mpSet('mix');return}mpNext();AU.want=null;music(MPL.auto);msg('🎵 '+mpName(MPL.cur))}
setInterval(()=>{if(SET.mpl==='mix'&&SET.muOn&&performance.now()-MPL.t>160000){mpNext();AU.want=null;music(MPL.auto)}},5000);
function mpSelHTML(id){const cur=!SET.muOn?'off':SET.mpl||'';const opt=(v,n)=>`<option value="${v}" ${cur===v?'selected':''}>${esc(n)}</option>`,G={};for(const r of MPN)(G[r[2]]=G[r[2]]||[]).push(r);
  return`<select id="${id}" onchange="mpSet(this.value)">${opt('','Automatica: cambia con il luogo')}${opt('mix','📻 Radio: un brano dopo l\'altro')}${opt('off','🔇 Spenta')}${Object.keys(G).map(g=>`<optgroup label="${esc(g==='Nuovi'?'Brani nuovi':'Brani del gioco')}">${G[g].map(r=>opt(r[0],r[1])).join('')}</optgroup>`).join('')}</select>`}
function mpNow(){if(!SET.muOn)return'Musica spenta';const k=AU.want||AU.tr;return'In ascolto: '+mpName(k)+(SET.mpl==='mix'?' (radio)':SET.mpl?' (scelto da te)':'')}
{const b0=setBody;setBody=function(k){let h=b0(k);if(k!=='audio')return h;
  return h+sGrp('Brani',`<div class="row"><label for="s_mpl">Musica durante il gioco</label>${mpSelHTML('s_mpl')}</div><div class="row"><label>${esc(mpNow())}</label><button onclick="mpSkip()">⏭ Prossimo brano</button></div><p class="mu">Automatica: ogni luogo ha la sua musica, e i boss la loro. Un brano scelto suona sempre, ovunque. La radio cambia brano ogni due minuti e mezzo circa.</p>`)}}
if(typeof pauseHTML==='function'){const p0=pauseHTML;pauseHTML=function(){const h=p0();const tg='<button class="psb" onclick="cl();openSet()">';return h.replace(tg,`<div class="psg"><h4>Musica</h4><div class="mprow">${mpSelHTML('p_mpl')}<button onclick="mpSkip();pn('pausa')" title="Prossimo brano">⏭</button></div><small class="mu">${esc(mpNow())}</small></div>`+tg)}}
document.head.insertAdjacentHTML('beforeend',`<style>.mprow{display:flex;gap:6px;align-items:center}.mprow select{flex:1;min-width:0;padding:6px;border-radius:7px;background:#1c1a24;color:#f0e8d8;border:1px solid #ffffff33}.mprow button{padding:6px 10px}</style>`);
/* ---- le mappe, casella per casella ---- */
const ZMDC={Natura:'#4a8a3a',Campagna:'#b8a050',Casa:'#8a6a4a',Castello:'#8a8a96',Segrete:'#5a4a5a',Guerra:'#6a5a3a',Porto:'#7a5a3a',Acqua:'#4a8ad8','Città':'#9a9284','Oggetti speciali':'#c88aff'};
function zmapBitmap(d){const dk=mapDark(),key=d.k+'|'+d.N+'|'+dk+'|'+d.v+'|z2|'+(d.v==='live'?(FC?1:0)+':'+Zk+':'+(ZZ&&ZZ.run):'');if(d.v!=='twd'&&ZMBM&&ZMBM.key===key&&ZMBM.d===d.M)return ZMBM.c;
  const p=mpal(),n=d.N,u=n<=24?20:n<=64?14:10,c=document.createElement('canvas');c.width=c.height=n*u;const q=c.getContext('2d'),z=d.z||{},f=dk?.62:1,S=(col,k2)=>shade(col.length===4?'#'+col[1]+col[1]+col[2]+col[2]+col[3]+col[3]:col,f*(k2||1));
  const ga=z.int?z.fl:z.a||p.grass,gb=z.int?z.fl2:z.b||p.grass2,rd=z.rd||['#aaa294','#a0988a'],water=z.pool||(d.k==='peaks'?'#bfe3f5':p.water),wild=!z.dg&&!z.int&&!z.dist&&(z.th==='forest'||z.th==='desert'||z.th==='peaks');
  const TREE='rhajYdℸ¥',M2=d.M,DC=d.DEC,isW=(x,y)=>x>=0&&y>=0&&x<n&&y<n&&M2[y][x]===2,smf=z.smf&&z.smf.size?z.smf:null,smw=z.smw&&z.smw.size?z.smw:null;
  const circ=(cx,cy,r,col)=>{q.fillStyle=col;q.beginPath();q.arc(cx,cy,r,0,6.3);q.fill()};
  const tree=(X,Y,col,r)=>{const cx=X+u/2,cy=Y+u/2;q.fillStyle='rgba(0,0,0,.22)';q.beginPath();q.ellipse(cx+u*.12,cy+u*.2,u*r,u*r*.7,0,0,6.3);q.fill();circ(cx,cy,u*r,S(col));circ(cx-u*r*.32,cy-u*r*.32,u*r*.48,S(col,1.22));q.fillStyle=S('#5a3a20');q.fillRect(cx-1,cy+u*r*.6,2,Math.max(1,u*.12))};
  const rock=(X,Y,col)=>{q.fillStyle=S(col);q.beginPath();q.moveTo(X+u*.15,Y+u*.8);q.lineTo(X+u*.25,Y+u*.3);q.lineTo(X+u*.6,Y+u*.15);q.lineTo(X+u*.88,Y+u*.5);q.lineTo(X+u*.8,Y+u*.85);q.closePath();q.fill();q.fillStyle=S(col,1.25);q.beginPath();q.moveTo(X+u*.28,Y+u*.35);q.lineTo(X+u*.6,Y+u*.2);q.lineTo(X+u*.55,Y+u*.45);q.closePath();q.fill()};
  for(let y=0;y<n;y++)for(let x=0;x<n;x++){const m=M2[y][x],ch=DC[y][x]||'',X=x*u,Y=y*u;if(m===9)continue;let col=(x+y)&1?ga:gb,kind='g';const h=hh(x,y);
    if(m===4){col=(ch==='~'||(d.k==='town'&&y>=64))?'#8a6a42':(x+y)&1?rd[0]:rd[1];kind=ch==='~'?'pier':'road'}else if(m===2){col=water;kind='w'}else if(m===8)col='#a8303a';
    else if(m===6&&d.RDF&&d.RDF.has(y*n+x)){col=(x+y)&1?rd[0]:rd[1];kind='road'}
    else if(m===1){kind='wall';if(z.dg)col=z.o||'#2a2420';else if(z.int)col=z.wall||'#8a8a8a';else if(z.dist)col=z.wl||p.wall;else if(!wild)col=z.o||p.wall;else kind='g'}
    else if(m===3){const b=d.BM&&d.TB[d.BM[y][x]];col=b&&(b.roof||b.wall)||'#a8402f';kind='roof'}
    if(wild&&(m===0||m===1||m===6)&&ch[0]==='₪'&&typeof bMapFloor==='function'){const fc=bMapFloor(z.th,ch);if(fc){col=fc;if(m===0&&ch[1]>='0'&&ch[1]<='9'&&(ch[1]==='1'||ch[1]==='4'))kind='road'}}
    if(smf&&smf.has(y*n+x)&&m!==2&&m!==3){const mt=EMAT[smf.get(y*n+x)];if(mt){col=(x+y)&1?mt.a:mt.b;kind='floor'}}
    q.fillStyle=S(col,m===3?p.roof:1);q.fillRect(X,Y,u,u);
    // i dettagli del terreno
    if(kind==='g'&&m!==1){q.fillStyle=S(col,h>.5?1.12:.88);q.fillRect(X+((h*97|0)%(u-2)),Y+((h*53|0)%(u-2)),Math.max(1,u*.14),Math.max(1,u*.14));if(h>.8){q.fillStyle=S(col,1.2);q.fillRect(X+((h*31|0)%(u-2)),Y+((h*71|0)%(u-2)),1,Math.max(1,u*.25))}}
    else if(kind==='road'){q.strokeStyle=S(col,.82);q.lineWidth=1;q.strokeRect(X+.5,Y+.5,u-1,u-1);if(u>=10){q.beginPath();q.moveTo(X+u/2,Y+((x&1)?0:u/2));q.lineTo(X+u/2,Y+((x&1)?u/2:u));q.stroke()}}
    else if(kind==='pier'){q.strokeStyle=S('#5a4026');q.lineWidth=1;for(let i=1;i<3;i++){q.beginPath();q.moveTo(X,Y+i*u/3);q.lineTo(X+u,Y+i*u/3);q.stroke()}}
    else if(kind==='w'){q.strokeStyle='rgba(255,255,255,'+(.12+h*.12)+')';q.lineWidth=1;q.beginPath();const wy=Y+u*(.3+h*.4);q.moveTo(X+u*.15,wy);q.quadraticCurveTo(X+u*.35,wy-u*.15,X+u*.55,wy);q.quadraticCurveTo(X+u*.75,wy+u*.15,X+u*.9,wy);q.stroke();
      q.fillStyle='rgba(235,245,255,.55)';if(!isW(x,y-1))q.fillRect(X,Y,u,Math.max(1,u*.12));if(!isW(x,y+1))q.fillRect(X,Y+u-Math.max(1,u*.12),u,Math.max(1,u*.12));if(!isW(x-1,y))q.fillRect(X,Y,Math.max(1,u*.12),u);if(!isW(x+1,y))q.fillRect(X+u-Math.max(1,u*.12),Y,Math.max(1,u*.12),u)}
    else if(kind==='wall'){const w2=smw&&smw.get(y*n+x),wc=w2?(w2[1]||(EWAL[w2[0]]||{}).c):null;if(wc){q.fillStyle=S(wc);q.fillRect(X,Y,u,u)}q.fillStyle='rgba(255,255,255,.16)';q.fillRect(X,Y,u,Math.max(1,u*.2));q.fillStyle='rgba(0,0,0,.25)';q.fillRect(X,Y+u-Math.max(1,u*.22),u,Math.max(1,u*.22))}
    else if(kind==='floor'&&u>=10){q.strokeStyle='rgba(0,0,0,.12)';q.lineWidth=1;q.strokeRect(X+.5,Y+.5,u-1,u-1)}
    // alberi e rocce delle terre selvagge
    const bw=m===1&&wild&&typeof bMapWall==='function'?bMapWall(z.th,ch):null;
    if(bw){if(bw[2]){q.fillStyle=S(bw[0]);q.fillRect(X,Y,u,u);q.fillStyle='rgba(255,255,255,.14)';q.fillRect(X,Y,u,Math.max(1,u*.2));q.fillStyle='rgba(0,0,0,.22)';q.fillRect(X,Y+u-Math.max(1,u*.2),u,Math.max(1,u*.2))}
      else if(/^#[67]a[78]/.test(bw[0])||/R|M|N|K|G/.test(ch[1]||''))rock(X,Y,bw[0]);else tree(X,Y,bw[0],Math.max(.3,bw[1]))}
    else if(m===1&&wild){if(z.th==='forest')tree(X,Y,h>.5?'#2f6b2a':'#3a7a32',.44);else if(z.th==='peaks'){tree(X,Y,h<.55?'#2f5a4a':'#7a8a9a',.42);circ(X+u/2,Y+u*.38,u*.14,S('#f4f8fc'))}else tree(X,Y,h<.5?'#4e9a47':'#a88c5a',.36)}
    // gli arredi
    if(m===6&&ch){if(ch[0]!=='₪'&&TREE.includes(ch))tree(X,Y,p.tree,.42);else if(ch[0]==='₪'){q.fillStyle=S(p.dec);q.fillRect(X+u*.2,Y+u*.2,u*.6,u*.6)}
      else{const I=typeof EDECI!=='undefined'&&EDECI[ch],cc=I?ZMDC[I.k]||p.dec:p.dec;if(ch==='l'||ch==='ł'||ch==='ċ'||ch===','||ch==='ƒ'||ch==='F'){circ(X+u/2,Y+u/2,u*.34,'rgba(255,210,90,.35)');circ(X+u/2,Y+u/2,u*.16,S('#ffd84a'))}
        else if(I&&I.k==='Natura')tree(X,Y,cc,.3);else{q.fillStyle=S(cc);q.fillRect(X+u*.18,Y+u*.18,u*.64,u*.64);q.strokeStyle='rgba(0,0,0,.3)';q.lineWidth=1;q.strokeRect(X+u*.18+.5,Y+u*.18+.5,u*.64-1,u*.64-1)}}}
    else if(m===0&&ch&&ch[0]!=='₪'&&typeof EDECI!=='undefined'&&EDECI[ch]&&EDECI[ch].walk){q.fillStyle=S(ZMDC[EDECI[ch].k]||p.dec,.9);q.globalAlpha=.6;q.fillRect(X+u*.1,Y+u*.1,u*.8,u*.8);q.globalAlpha=1}}
  // i tetti: il colmo, il bordo, la porta e il camino
  if(d.TB&&d.BM){for(const b of d.TB){if(b.x<0||b.y<0||b.x>=n||b.y>=n)continue;const X=b.x*u,Y=b.y*u,w=b.w*u,hh2=b.h*u,rc=S(b.roof||b.wall||'#a8402f',p.roof);
      q.fillStyle=shade(rc,.82);q.fillRect(X,Y+hh2/2,w,hh2/2);q.strokeStyle=shade(rc,.62);q.lineWidth=Math.max(1,u*.14);q.beginPath();q.moveTo(X+u*.3,Y+hh2/2);q.lineTo(X+w-u*.3,Y+hh2/2);q.stroke();
      q.strokeStyle=dk?'rgba(0,0,0,.55)':'rgba(40,20,10,.5)';q.lineWidth=1;q.strokeRect(X+.5,Y+.5,w-1,hh2-1);
      if(b.smoke){q.fillStyle=S('#6a5a50');q.fillRect(X+w-u*.9,Y+u*.3,u*.4,u*.5)}
      if(b.dx!=null){q.fillStyle=S('#5a3a1e');q.fillRect(b.dx*u+u*.3,Y+hh2-u*.35,u*.4,u*.35)}}}
  if(d.v!=='twd')ZMBM={key,d:d.M,c};return c}
// la mappa del mondo di Tomorrow: avvicinandosi, le regioni visitate si vedono casella per casella
const TWDT=new Map();
function twDetail(rx,ry,mk){const k=twK(rx,ry);let c=TWDT.get(k);if(c)return c;if(!mk)return null;let D=TWW.cache.get(k);if(!D){if(!mk)return null;D=twRegGen(k)}if(!D)return null;
  c=zmapBitmap({k,N:TWR,M:D.M,DEC:D.DEC,TB:D.TB||[],BM:D.BM,z:twZ(k),RDF:D.RDF,v:'twd'});TWDT.set(k,c);while(TWDT.size>90)TWDT.delete(TWDT.keys().next().value);return c}
// si dipingono sopra le strade disegnate e sotto i luoghi: subito prima dei segni dei luoghi (che chiedono twRI)
const TWMD={a:null};
function twMapDet(q,x0,x1,y0,y1,sx,sy,Z2){let bud=TWM.drag?0:1;const sm=q.imageSmoothingEnabled;q.imageSmoothingEnabled=Z2<TWR*6;q.globalAlpha=clamp((Z2-60)/30,0,1);
  for(let ry=y0;ry<=y1;ry++)for(let rx=x0;rx<=x1;rx++){if(!P.tw.vis[twK(rx,ry)])continue;let c=twDetail(rx,ry,false);if(!c&&bud>0){bud--;c=twDetail(rx,ry,true)}if(c)q.drawImage(c,sx(rx),sy(ry),Z2+.6,Z2+.6)}
  q.globalAlpha=1;q.imageSmoothingEnabled=sm}
const _twMapTerr738=twMapTerr;twMapTerr=function(q,x0,x1,y0,y1,sx,sy,Z2){_twMapTerr738(q,x0,x1,y0,y1,sx,sy,Z2);TWMD.a=Z2>=60&&P&&P.tw?[q,x0,x1,y0,y1,sx,sy,Z2]:null};
{const r0=twRI;twRI=function(rx,ry){if(TWMD.a){const a=TWMD.a;TWMD.a=null;try{twMapDet(...a)}catch(e){console.error(e)}}return r0(rx,ry)}}
twMapZoom=function(k){TWM.z=clamp(TWM.z*k,26,1100);twMapDraw()};
// i borghi cambiano: la loro mappa si rifà quando cambiano
{const r0=setRebuild;setRebuild=function(){r0();const S2=P&&P.tw&&P.tw.set;if(S2)TWDT.delete(S2.k)}}
/* ---- l'allevamento dei compagni ---- */
Object.assign(TWSB,{allev:{n:'Allevamento',ic:'🐾',d:'Addestra i compagni, li rende più forti e vende creature dal catalogo',max:5,cost:l=>[220*l,0]}});
SETCO.allev=l=>({g:220*l,legna:10*l,pietra:6*l,argilla:4*l});SETBA.push('allev');SEDND.add('allev');SEDK.allev='casa';SEDKN.allev='🐾 Allevamento';SETBC.allev=['#b89a6a','#5a7a3a'];
const alLv=()=>(P&&P.tw&&csSets().reduce((a,S)=>Math.max(a,(S.b&&S.b.allev)|0),0))|0;
// ogni livello dell'allevamento rende più forti tutti i compagni
function allevBonus(){return 1+.06*alLv()}
const ALCAT=[['slime','ratto','lupo','pipistrello','scarabeo','sciacallo'],['scorpione','ragno','lupo_gelo','cavalcalupi','medusa','spettro'],['salamandra','lupo_cristallo','elem_ghiaccio','banshee','ombra','granchio'],
  ['yeti','golem_cr','anguilla','scorpione_reale','imp','occhio_vuoto'],['golem_magma','demone','spettro_cristallo','cavaliere_ossa','anubi','fabbro_demone']];
const alMaxLv=()=>Math.min(40,5+alLv()*7);
const alPetLv=()=>Math.max(1,Math.min(P.lv|0,1+alLv()*4));
const alPrice=t=>{const b=E[t]||{hp:40,at:6};return Math.round((120+b.hp*3+b.at*12)*(1+alPetLv()*.08)/10)*10};
const alTrainCost=p=>({g:Math.round((60+p.lv*p.lv*6)/10)*10});
function alBuy(t){if(!alLv()){msg('Prima costruisci l\'Allevamento nel tuo borgo');return}domFix();const tier=ALCAT.findIndex(L=>L.includes(t));if(tier<0||tier>=alLv()||!E[t])return;if(P.pets.length>=domMax()){msg('La stalla è piena ('+domMax()+'): costruisci o potenzia la Stalla');tone(150,.1);return}
  const pr=alPrice(t);if((P.g|0)<pr){msg('Servono '+pr+' monete');tone(150,.1);return}P.g-=pr;const nm=String(E[t].n).replace(/^[^A-Za-zÀ-ÿ]+/,'');const p={id:uid(),t,n:nm,lv:alPetLv(),xp:0,hp:0,bd:gDay?gDay():0};p.hp=domStats(p).mx;
  P.pets.push(p);const nw=!P.bst[t];P.bst[t]=(P.bst[t]|0)+1;jingle([60,64,67,72,76],.09,'triangle');banner('🐾 '+nm+' è tuo!',(nw?'Specie nuova nel bestiario · ':'')+'Tasto N per i tuoi compagni','stella');save();hud();pn('allev')}
function alTrain(i){domFix();const p=P.pets[i];if(!p)return;if(!alLv()){msg('Prima costruisci l\'Allevamento');return}if(p.lv>=alMaxLv()){msg(p.lv>=40?'È già al massimo':'Per andare oltre il livello '+alMaxLv()+' potenzia l\'Allevamento');tone(150,.1);return}
  const c=alTrainCost(p);if(!sedPayOK(c))return;const ev0=domStats(p).ev;p.lv++;p.xp=0;const st=domStats(p);p.hp=st.mx;if(st.ev>ev0){banner(p.n+' si è evoluto!','Ora è '+domName(p),'stella');jingle([60,67,72,79,84],.1,'triangle')}else tone(700,.06,'triangle');
  if(DOM.pet&&DOM.pet.p===p){DOM.pet.mx=st.mx;DOM.pet.at=st.at;DOM.pet.hp=st.mx;DOM.pet.n=domName(p)}save();pn('allev')}
function alHTML(){domFix();const l=alLv(),L=P.pets;let h=`<h3>🐾 Allevamento dei compagni</h3>`;
  if(!l)return h+`<p>L'Allevamento si costruisce nel tuo borgo (U → Insediamento → Costruire). Addestra i compagni, li rende tutti più forti e vende creature dal suo catalogo.</p><button onclick="cl()">Chiudi</button>`;
  h+=`<p class="mu">Livello ${l} di ${TWSB.allev.max} · tutti i compagni <b>+${Math.round((allevBonus()-1)*100)}%</b> di vita e forza · addestramento fino al livello <b>${alMaxLv()}</b> · stalla ${L.length}/${domMax()} · 💰 ${P.g|0}</p>`;
  h+=`<h4>Addestrare</h4>`+(L.length?'<div class="all">'+L.map((p,i)=>{const st=domStats(p),c=alTrainCost(p),mx=p.lv>=alMaxLv();return`<div class="alr"><canvas class="alpv" data-t="${esc(p.t)}" width="52" height="52"></canvas><span><b>${esc(domName(p))}</b><small>livello ${p.lv} · ❤ ${st.mx} · ⚔ ${st.at}${i===P.pet?' · <i>in campo</i>':''}</small></span><button ${mx?'disabled':''} onclick="alTrain(${i})">${mx?(p.lv>=40?'Al massimo':'Potenzia l\'allevamento'):'+1 livello · '+sedCostTxt(c)}</button></div>`}).join('')+'</div>':'<p class="mu">Non hai ancora compagni: domane uno (tasto Z vicino a un mostro indebolito) o compralo qui sotto.</p>');
  h+=`<h4>Catalogo</h4><p class="mu">Le creature arrivano al livello ${alPetLv()}. Ogni potenziamento dell'allevamento apre una fila di creature più rare.</p><div class="alc">`;
  ALCAT.forEach((T,ti)=>{const op=ti<l;h+=`<h5>${['Comuni','Insolite','Rare','Leggendarie','Mitiche'][ti]}${op?'':' · 🔒 allevamento livello '+(ti+1)}</h5><div class="alg">`+T.filter(t=>E[t]).map(t=>{const F=DOMF[domFam(t)],pr=alPrice(t);
    return`<div class="alk${op?'':' lk'}"><canvas class="alpv" data-t="${t}" width="52" height="52"></canvas><b>${esc(E[t].n)}</b><small>${esc(F.n)} · ${esc(F.sp)}</small><button ${op?'':'disabled'} onclick="alBuy('${t}')">${op?pr+'💰':'🔒'}</button></div>`}).join('')+'</div>'});
  return h+`</div><button onclick="cl()">Chiudi</button>`}
function alPaint(){const pe=$('pn');if(!pe)return;for(const c of pe.querySelectorAll('canvas.alpv')){const m=E[c.dataset.t]&&E[c.dataset.t].m;if(!m)continue;const q=c.getContext('2d');q.clearRect(0,0,52,52);
  let top=0;for(const b of m)top=Math.max(top,(b[2]||0)+(b[5]||0));const sc=Math.min(1.6,40/(top+6)),og=g;g=q;try{q.setTransform(sc,0,0,sc,26,47);if(m.rg||m.hm)drawHero(m,0,0,0,0,3);else drawL(m,0,0,0)}catch(_){}finally{g=og}}}
const _pn738b=pn;pn=function(m,arg){if(m==='allev'&&started){if(arg!==undefined)PA=arg;edPanel('allev',alHTML());alPaint();return}_pn738b(m,arg)};
// l'edificio: un recinto con il fieno e l'abbeveratoio, e l'allevatrice davanti
NPCS.tw_allev={n:'Allevatrice Gioia',c:'#6a8a3a',hat:'#8a6a2a',tw2:'allev',ln:['Ogni bestia ha il suo carattere: trattala bene e ti seguirà fino in capo al mondo.','Qui li nutriamo, li alleniamo e li facciamo crescere forti.','Se cerchi un compagno nuovo, guarda il catalogo: arrivano da tutta la regione.']};
const _setBProps738=setBProps;setBProps=function(C,b){if(b.k!=='allev'){_setBProps738(C,b);return}const T=TB[TB.length-1];if(T){if(!b.wall){T.wall='#b89a6a';T.roof='#5a7a3a'}T.ht=b.ht||26}
  let n=0;const pr=['f','y',':','f','y'];for(const[x,y]of[[b.x-1,b.y+b.h-1],[b.x+b.w,b.y+b.h-1],[b.x-1,b.y],[b.x+b.w,b.y],[b.x+b.w,b.y+1]]){if(n>=pr.length||!C.ok(x,y)||M[y][x]!==0)continue;const d=DEC[y][x]||'';if(d===DN+'4'||d===DN+'1')continue;M[y][x]=6;DEC[y][x]=pr[n++];C.res(x,y)}
  const[x,y]=nearFree(b.x+(b.w>>1),b.y+b.h);const e=mkNpc('tw_allev',x,y);e.lfStay=1;ents.push(e)};
if(typeof npcHTML==='function'){const n0=npcHTML;npcHTML=function(e){let h=n0(e);if(e&&e.nid==='tw_allev')h+=`<div class="qb"><b>🐾 Allevamento livello ${alLv()}</b><p class="mu">Addestra i tuoi compagni o comprane di nuovi dal catalogo.</p><button onclick="pn('allev')">Apri l'allevamento</button></div>`;return h}}
// nel registro del borgo
{const s0=setHTML2;setHTML2=function(){let h=s0();const l=setB('allev');if(!l)return h;const card=`<h4>🐾 Allevamento</h4><div class="rgcard"><div><b>Livello ${l}</b><p class="mu">Compagni +${Math.round((allevBonus()-1)*100)}% · addestramento fino al livello ${alMaxLv()} · catalogo: ${ALCAT.slice(0,l).flat().length} creature</p></div><span><button class="pri" onclick="pn('allev')">🐾 Apri l'allevamento</button></span></div>`;return h.replace('<h4>Costruire</h4>',card+'<h4>Costruire</h4>')}}
document.head.insertAdjacentHTML('beforeend',`<style>.all{display:flex;flex-direction:column;gap:5px}.alr{display:flex;align-items:center;gap:8px;background:#ffffff0d;border-radius:8px;padding:4px 8px}.alr span{flex:1;display:flex;flex-direction:column}.alr small{opacity:.75}
.alg{display:grid;grid-template-columns:repeat(auto-fill,minmax(112px,1fr));gap:6px}.alk{display:flex;flex-direction:column;align-items:center;gap:2px;text-align:center;background:#ffffff0d;border-radius:8px;padding:6px}.alk small{font-size:10.5px;opacity:.75}.alk.lk{opacity:.5}.alk button{margin-top:3px;padding:3px 10px}</style>`);
