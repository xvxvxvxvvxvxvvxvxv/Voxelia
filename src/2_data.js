/* ================= modelli voxel ================= */
const SKIN='#f1c27d';
const scl=(L,s)=>L.map(b=>[b[0]*s,b[1]*s,b[2]*s,b[3]*s,b[4]*s,b[5]*s,b[6]]);
const hum=(c,k,s=1,hat)=>{const L=[[-.2,-.1,0,.15,.2,9,'#334'],[.05,-.1,0,.15,.2,9,'#334'],[-.22,-.14,9,.44,.28,12,c],[-.34,-.08,10,.12,.16,10,k],[.22,-.08,10,.12,.16,10,k],[-.15,-.12,21,.3,.24,10,k]];if(hat)L.push([-.17,-.14,31,.34,.28,hat[0],hat[1]]);const S2=scl(L,s);S2.hm=1;return S2};
const body=(c,h,w,wv,s,sw)=>{const L=hum(c>=0?RC[c]:'#3a6ea5',SKIN,1,h>=0?[4,RC[h]]:0);if(s>=0)L.push([-.38,0,8,.1,.2,12,RC[s]]);L.push([.3,-.04+(sw>0?.25:0),12,.07,.07,12+Math.min(30,(wv||3)*.4),RC[w]||'#cccccc']);return L};
const blob=(c,s=1)=>scl([[-.3,-.3,0,.6,.6,12,c],[-.22,-.22,12,.44,.44,4,c],[-.2,.3,7,.1,.05,4,'#111'],[.1,.3,7,.1,.05,4,'#111']],s);
const beast=(c,s=1,k='#222')=>scl([[-.3,-.15,5,.6,.3,8,c],[.2,-.12,9,.22,.24,8,c],[-.28,-.14,0,.1,.1,5,k],[-.28,.04,0,.1,.1,5,k],[.2,-.14,0,.1,.1,5,k],[.2,.04,0,.1,.1,5,k],[-.42,-.03,9,.14,.06,7,c],[.4,-.06,13,.04,.04,3,'#111'],[.4,.04,13,.04,.04,3,'#111']],s);
const bat=(c,s=1)=>scl([[-.1,-.1,16,.2,.2,7,c],[-.42,-.04,19,.32,.08,2,c],[.1,-.04,19,.32,.08,2,c],[-.06,.1,20,.04,.02,2,'#f33'],[.03,.1,20,.04,.02,2,'#f33']],s);
const spider=(c,s=1)=>{const L=[[-.25,-.2,5,.5,.4,8,c],[.18,-.12,6,.2,.24,6,c],[.36,-.08,9,.04,.04,2,'#f22'],[.36,.04,9,.04,.04,2,'#f22']];for(let i=0;i<4;i++){const x=-.2+i*.13;L.push([x,-.38,0,.05,.2,7,c],[x,.18,0,.05,.2,7,c])}return scl(L,s)};
const elem=(c,s=1)=>scl([[-.18,-.18,10,.36,.36,14,c],[-.36,-.08,16,.14,.14,8,c],[.22,-.08,16,.14,.14,8,c],[-.12,-.12,26,.24,.24,9,c],[-.06,.12,29,.04,.02,3,'#fff'],[.04,.12,29,.04,.02,3,'#fff']],s);
const crab=(c,s=1)=>scl([[-.3,-.25,3,.6,.5,7,c],[-.48,.15,4,.18,.16,6,c],[.3,.15,4,.18,.16,6,c],[-.1,.22,9,.05,.05,4,'#111'],[.05,.22,9,.05,.05,4,'#111'],[-.32,-.3,0,.06,.6,3,c],[.26,-.3,0,.06,.6,3,c]],s);
const drake=(c,w,s=1)=>scl([[-.4,-.2,8,.8,.4,12,c],[.38,-.14,16,.3,.28,10,c],[.62,-.1,16,.14,.2,6,c],[-.7,-.06,10,.32,.12,6,c],[-.3,-.7,18,.5,.5,2,w],[-.3,.2,18,.5,.5,2,w],[-.34,-.18,0,.12,.12,8,'#333'],[-.34,.06,0,.12,.12,8,'#333'],[.2,-.18,0,.12,.12,8,'#333'],[.2,.06,0,.12,.12,8,'#333'],[.46,-.12,26,.05,.05,6,'#eee'],[.46,.06,26,.05,.05,6,'#eee']],s);
const sphinx=s=>scl(beast('#d4b25a',1,'#b8963a').slice(0,7).concat([[.22,-.12,14,.2,.24,10,'#e0c080'],[.2,-.16,22,.24,.32,6,'#2a5fd0'],[.42,-.06,18,.03,.04,2,'#111'],[.42,.04,18,.03,.04,2,'#111']]),s);
const kraken=(c,s=1)=>{const L=[[-.35,-.35,6,.7,.7,16,c],[-.25,-.25,22,.5,.5,8,c],[-.1,.36,16,.08,.02,5,'#ff0'],[.06,.36,16,.08,.02,5,'#ff0']];for(let i=0;i<6;i++){const a=i/6*6.28;L.push([Math.cos(a)*.5-.05,Math.sin(a)*.5-.05,0,.1,.1,10,c])}return scl(L,s)};

/* ================= rarità e oggetti ================= */
const RC=['#c8ccd4','#4aa3ff','#b866ff','#ffae2b','#ff4d6d'],RN=['Comune','Raro','Epico','Leggendario','Arena'],RS=['',' d\'Acciaio',' delle Rune',' del Drago'],RM=[1,1.4,1.9,2.8,3.3];
const SL={w:['Pugnale','Spada','Ascia','Martello','Lancia','Bastone','Falce','Stocco'],h:['Elmo','Cappuccio','Corona','Celata'],c:['Corazza','Giaco','Tunica','Cotta di maglia'],s:['Scudo','Brocchiere','Pavese']},SN={w:'Arma',h:'Elmo',c:'Corazza',s:'Scudo'};
const ibase=(s,lv)=>(s=='w'?5:s=='c'?4:2.5)+lv*(s=='w'?2:1.4);
function item(lv,minR=0,slot){const s=slot||'whcs'[ri(0,3)],r=Math.max(minR,R()<.03?3:R()<.12?2:R()<.35?1:0),v=Math.round(ibase(s,lv)*RM[r]*(.85+R()*.3)),a=SL[s];
  const it={u:uid(),s,r,v,n:a[ri(0,a.length-1)]+RS[r],p:v*5};if(r>=2&&R()<.6){if(s=='w')it.cr=ri(2,4+r*2);else it.hp=Math.round(ri(5,12)*(r-1)+lv*2)}return it}
const iv=it=>it?Math.round(it.v*(1+.12*(it.up||0))*(1+.04*(it.ml||0))):0;
const iname=it=>it.n+(it.up?' +'+it.up:'')+(it.ml?' ★'+it.ml:'');
const fmt=it=>`<img class="ii" src="${icon(it)}" alt=""><b style="color:${RC[it.r]}">${esc(iname(it))}</b> <span class="mu">${it.s=='w'?'ATT':'DIF'} ${iv(it)}${it.cr?' · CRIT +'+it.cr+'%':''}${it.hp?' · PV +'+it.hp:''}${it.ar?' · vincolato':''}</span>`;
// Oggetti unici lasciati dai boss: [slot, nome, crit, punti vita]
const UQ={troll:['w','Clava del Troll',4,0],faraone:['h','Maschera del Faraone',0,60],drago_brina:['s','Scudo di Brina',0,90],re_goblin:['w','Mannaia di Grugnak',6,0],necromante:['c','Veste di Velka',0,60],sfinge:['h','Diadema della Sfinge',8,0],regina:['w','Pungiglione Regale',12,0],ignis:['c','Corazza Ardente',0,120],leviatano:['s','Scaglia del Leviatano',0,150],lich:['w','Falce di Malakar',20,0]};
function uniq(t,lv){const q=UQ[t];if(!q)return item(lv+1,3);const v=Math.round(ibase(q[0],lv+1)*RM[3]*1.15);const it={u:uid(),s:q[0],r:3,v,n:q[1],p:v*6};if(q[2])it.cr=q[2];if(q[3])it.hp=q[3]+lv*3;return it}
// Negozio dell'arena: costo in punti arena (c) e moltiplicatore di potenza (m). I costi sono gli stessi di AR_COST nel server.
const AR=[{s:'w',n:'Lama del Gladiatore',c:40,m:3.2,cr:8},{s:'h',n:'Elmo del Campione',c:25,m:3.2,hp:30},{s:'c',n:'Corazza del Colosseo',c:35,m:3.2,hp:50},{s:'s',n:'Scudo dell\'Arena',c:25,m:3.2,hp:30},
  {s:'w',n:'Tridente dei Mille Duelli',c:120,m:3.9,cr:15},{s:'c',n:'Armatura del Gran Campione',c:150,m:3.9,hp:120},{s:'h',n:'Corona del Vincitore',c:90,m:3.9,hp:80},{s:'s',n:'Egida Insanguinata',c:90,m:3.9,hp:80}];
const arItem=(a,lv)=>{const v=Math.round(ibase(a.s,lv)*a.m);const it={u:uid(),s:a.s,r:4,v,n:a.n,p:v*2,ar:1};if(a.cr)it.cr=a.cr;if(a.hp)it.hp=a.hp+lv*3;return it};

/* ================= nemici =================
   hp/at base (scalati col livello della zona), xp, velocità, portata, ricarica, aggro.
   rng = colore del proiettile (nemico a distanza), sum = evoca rinforzi, slam = colpo ad area annunciato */
const E={
slime:{n:'Slime',hp:22,at:4,xp:6,sp:1.4,r:1.1,cd:1.3,ag:6,m:blob('#55cc66')},
lupo:{n:'Lupo',hp:28,at:6,xp:8,sp:2.8,r:1.1,cd:1,ag:8,m:beast('#8a8f9a')},
goblin:{n:'Goblin',hp:35,at:8,xp:10,sp:2,r:1.1,cd:1.1,ag:7,m:hum('#4a6b2a','#7cc04a',.85,[3,'#663333'])},
troll:{n:'Troll della Foresta',hp:300,at:16,xp:120,sp:1.6,r:1.8,cd:1.5,ag:9,boss:1,slam:1,m:hum('#4b6f50','#6f9a6a',2)},
scorpione:{n:'Scorpione',hp:45,at:11,xp:12,sp:2.2,r:1.1,cd:1.1,ag:7,m:beast('#b5452a')},
sciacallo:{n:'Sciacallo',hp:40,at:12,xp:12,sp:3,r:1.1,cd:.9,ag:8,m:beast('#c9a24a')},
mummia:{n:'Mummia',hp:75,at:14,xp:18,sp:1.5,r:1.2,cd:1.3,ag:6,m:hum('#d8cfb0','#c9bf9a')},
faraone:{n:'Faraone Eterno',hp:500,at:22,xp:220,sp:1.7,r:2,cd:1.4,ag:10,boss:1,slam:1,sum:'mummia',m:hum('#d4af37','#b8860b',1.7,[6,'#2a5fd0'])},
lupo_gelo:{n:'Lupo del Gelo',hp:55,at:14,xp:16,sp:3,r:1.1,cd:.9,ag:8,m:beast('#dde8f4',1.1,'#8aa')},
yeti:{n:'Yeti',hp:130,at:20,xp:26,sp:1.6,r:1.3,cd:1.4,ag:7,m:hum('#eef4fa','#cfe0ee',1.4)},
elem_ghiaccio:{n:'Elementale di Ghiaccio',hp:60,at:16,xp:22,sp:1.5,r:5,cd:1.9,ag:8,rng:'#9fe8ff',m:elem('#8fd8f0')},
drago_brina:{n:'Drago di Brina',hp:800,at:28,xp:400,sp:1.7,r:4,cd:1.8,ag:12,boss:1,slam:1,rng:'#bff4ff',m:drake('#9fc8e8','#dff2ff',1.8)},
arciere:{n:'Goblin Arciere',hp:30,at:9,xp:11,sp:1.8,r:4.5,cd:1.8,ag:8,rng:'#c8a060',m:hum('#6b5a2a','#7cc04a',.85,[3,'#2a4a1a'])},
ratto:{n:'Ratto Gigante',hp:18,at:5,xp:5,sp:3.2,r:1,cd:.8,ag:7,m:beast('#6b5a4a',.7)},
re_goblin:{n:'Re Goblin Grugnak',hp:380,at:15,xp:180,sp:1.8,r:1.8,cd:1.3,ag:10,boss:1,slam:1,sum:'goblin',m:hum('#7a2a2a','#7cc04a',1.6,[6,'#d4af37'])},
scheletro:{n:'Scheletro',hp:60,at:16,xp:20,sp:2,r:1.2,cd:1.1,ag:7,m:hum('#e8e4d8','#e8e4d8')},
zombie:{n:'Zombie',hp:85,at:13,xp:16,sp:1.1,r:1.1,cd:1.4,ag:6,m:hum('#4a5a3a','#7a9a6a')},
pipistrello:{n:'Pipistrello',hp:22,at:8,xp:8,sp:3.4,r:1,cd:.8,ag:9,m:bat('#3a2a3a')},
necromante:{n:'Necromante Velka',hp:460,at:18,xp:260,sp:1.5,r:4.5,cd:1.6,ag:11,boss:1,rng:'#9f6bff',sum:'scheletro',m:hum('#2a1a3a','#c8b8d8',1.6,[10,'#1a0a2a'])},
scarabeo:{n:'Scarabeo',hp:38,at:12,xp:12,sp:2.4,r:1,cd:1,ag:7,m:beast('#2a7a6a',.8,'#123')},
sacerdote:{n:'Sacerdote di Khem',hp:55,at:18,xp:22,sp:1.6,r:4.5,cd:1.9,ag:8,rng:'#ffd84a',m:hum('#e8d8a0','#b8865b',1,[8,'#d4af37'])},
sfinge:{n:'Sfinge Antica',hp:650,at:24,xp:360,sp:1.8,r:2,cd:1.4,ag:11,boss:1,slam:1,sum:'scarabeo',m:sphinx(1.9)},
golem_cr:{n:'Golem di Cristallo',hp:150,at:20,xp:30,sp:1.3,r:1.4,cd:1.6,ag:6,m:hum('#9ad0f0','#c8ecff',1.5)},
ragno:{n:'Ragno di Cristallo',hp:50,at:16,xp:18,sp:3,r:1.1,cd:.9,ag:9,m:spider('#6a8aaa')},
regina:{n:'Regina dei Ragni',hp:760,at:26,xp:450,sp:2,r:4,cd:1.6,ag:12,boss:1,rng:'#c88cff',sum:'ragno',m:spider('#7a5aaa',2.2)},
imp:{n:'Imp',hp:50,at:20,xp:22,sp:2.4,r:4.5,cd:1.7,ag:9,rng:'#ff7a2a',m:hum('#b0301a','#e05a3a',.75,[4,'#2a0a0a'])},
golem_magma:{n:'Golem di Magma',hp:170,at:24,xp:34,sp:1.2,r:1.4,cd:1.6,ag:6,m:hum('#3a2a2a','#ff6a2a',1.5)},
demone:{n:'Demone',hp:115,at:26,xp:32,sp:2.2,r:1.3,cd:1.2,ag:8,m:hum('#7a1a1a','#a83a2a',1.3,[5,'#1a0a0a'])},
ignis:{n:'Signore della Fiamma Ignis',hp:900,at:32,xp:560,sp:1.8,r:4,cd:1.5,ag:12,boss:1,slam:1,rng:'#ff5a1a',sum:'imp',m:hum('#2a0a0a','#ff7a2a',2.1,[8,'#ffcc33'])},
uomo_pesce:{n:'Uomo-Pesce',hp:95,at:24,xp:30,sp:2,r:1.2,cd:1.1,ag:8,m:hum('#2a7a7a','#5ab0a0',1.1)},
medusa:{n:'Medusa',hp:60,at:22,xp:26,sp:1.4,r:4.5,cd:1.8,ag:8,rng:'#7ffff0',m:elem('#d08ae0')},
granchio:{n:'Granchio Corazzato',hp:125,at:22,xp:28,sp:1.6,r:1.2,cd:1.3,ag:7,m:crab('#c8502a')},
leviatano:{n:'Leviatano',hp:1100,at:34,xp:700,sp:1.6,r:2.4,cd:1.5,ag:12,boss:1,slam:1,sum:'medusa',m:kraken('#2a5a7a',1.6)},
cavaliere:{n:'Cavaliere del Vuoto',hp:170,at:30,xp:40,sp:1.8,r:1.3,cd:1.3,ag:8,m:hum('#2a2238','#4a3a6a',1.3,[6,'#6a4a9a'])},
ombra:{n:'Ombra',hp:85,at:28,xp:30,sp:3.2,r:1.1,cd:1,ag:10,m:elem('#2a1a3a')},
mago:{n:'Mago Oscuro',hp:60,at:22,xp:30,sp:1.6,r:5,cd:2,ag:8,rng:'#cc88ff',m:hum('#5a2d8a','#e0b090',1,[10,'#3a1a6a'])},
lich:{n:'Re Lich Malakar',hp:1500,at:36,xp:1200,sp:1.8,r:4.5,cd:1.5,ag:14,boss:1,slam:1,rng:'#c46bff',sum:'ombra',m:hum('#2a1a4a','#cceeff',1.9,[7,'#d4af37'])}
};

/* ================= difficoltà ================= */
const DFS=[{n:'Facile',hp:.7,dm:.6,lt:1.4,x:1.25},{n:'Normale',hp:1,dm:1,lt:1,x:1},{n:'Difficile',hp:1.5,dm:1.4,lt:.9,x:1.2},{n:'Incubo',hp:2.2,dm:2,lt:.8,x:1.5,pm:1}];

/* ================= zone ================= */
const Z={
town:{n:'Aldoria, la Città',lv:0,N:72,a:'#7d9a5b',b:'#76925a',bg:'#7fb6e6',mus:'town',pt:'petal'},
forest:{n:'Foresta di Elmwood',lv:1,N:40,th:'forest',a:'#4f8a3c',b:'#478034',o:'#2f6b2a',bg:'#9fd0f0',en:['slime','lupo','goblin'],boss:'troll',c:28,mus:'forest',pt:'leaf'},
desert:{n:'Deserto di Khem',lv:4,N:40,th:'desert',a:'#d9b56b',b:'#cfab62',o:'#4e9a47',bg:'#f0d9a0',en:['scorpione','sciacallo','mummia'],boss:'faraone',c:28,mus:'desert',pt:'dust'},
peaks:{n:'Picchi Gelidi',lv:7,N:40,th:'peaks',a:'#e6edf4',b:'#dbe4ee',o:'#2f5a4a',bg:'#b8cde0',en:['lupo_gelo','yeti','elem_ghiaccio'],boss:'drago_brina',c:28,mus:'peaks',pt:'snow'},
arena:{n:'Colosseo di Aldoria',lv:0,N:40,a:'#d8c08a',b:'#cfb680',o:'#9a8a70',bg:'#7fb6e6',mus:'arena',pt:'confetti'}
};
const TH={cave:{a:'#6b5a48',b:'#635342',o:'#4a3c30',bg:'#0a0806',tc:'#ffb04a',pt:'dust'},crypt:{a:'#5b5f6e',b:'#53576a',o:'#3a3d4a',bg:'#07080c',tc:'#9fd0ff',pt:'dust'},
  pyr:{a:'#c9a860',b:'#bf9f58',o:'#8f7a48',bg:'#0c0a05',tc:'#ffd060',pt:'dust'},ice:{a:'#a8c8e0',b:'#9cbcd6',o:'#6f9ab8',bg:'#05080d',tc:'#b0f0ff',pt:'snow'},
  fire:{a:'#5a3a32',b:'#523530',o:'#3a2420',bg:'#100403',tc:'#ff6a2a',pool:'#ff6a1a',pt:'ember'},sea:{a:'#3f6a6a',b:'#3a6262',o:'#24464a',bg:'#020809',tc:'#6fffe0',pool:'#2a7ab0',pt:'bubble'},
  void:{a:'#3a2f4f',b:'#342a48',o:'#211a30',bg:'#030206',tc:'#c46bff',pool:'#5a2a8a',pt:'mote'}};
// Dungeon: livello base, piani, nemici, boss, tema, zona d'ingresso. Ogni vittoria sul boss li rigenera (ciclo +1, livello +3).
const DG={
tana:{n:'Tana dei Goblin',lv:2,fls:2,en:['goblin','arciere','ratto'],boss:'re_goblin',th:'cave',ent:'forest'},
cripta:{n:'Cripta Dimenticata',lv:4,fls:3,en:['scheletro','zombie','pipistrello'],boss:'necromante',th:'crypt',ent:'town'},
piramide:{n:'Piramide di Khem',lv:6,fls:3,en:['mummia','scarabeo','sacerdote'],boss:'sfinge',th:'pyr',ent:'desert'},
cristallo:{n:'Caverne di Cristallo',lv:8,fls:3,en:['golem_cr','ragno','elem_ghiaccio'],boss:'regina',th:'ice',ent:'peaks'},
fucina:{n:'Fucina Infernale',lv:10,fls:3,en:['imp','golem_magma','demone'],boss:'ignis',th:'fire',ent:'peaks'},
abisso:{n:'Abisso Sommerso',lv:12,fls:3,en:['uomo_pesce','medusa','granchio'],boss:'leviatano',th:'sea',ent:'porto'},
cittadella:{n:'Cittadella del Vuoto',lv:15,fls:4,en:['cavaliere','ombra','mago','scheletro'],boss:'lich',th:'void',ent:'in_castle',fin:1}
};
const SHARDS=['tana','cripta','piramide','cristallo','fucina','abisso'];

/* ================= interni esplorabili =================
   # muro · . pavimento · = tappeto · D porta · S scaffale · T tavolo · B letto · b botte · k cassa · C bancone
   A incudine · F forgia/camino · P calderone · X altare · K trono · n panca · p pianta · w rastrelliera · c forziere · V portale (Cittadella) */
const IN={
in_castle:{n:'Castello di Aldoria',fl:'#8a8a94',fl2:'#80808a',wall:'#9a9aa6',np:[['re',7,2],['guardia',4,2],['guardia2',11,2],['ciambellano',12,13]],lay:[
'################','#SS....KK....SS#','#..............#','#p...======...p#','#....======....#','#T...======...T#','#....======....#','#p...======...p#','#....======....#','#T...======...T#','#....======....#','#p...======...p#','#.............V#','#..............#','#......==......#','#######D########']},
in_library:{n:'Biblioteca Arcana',fl:'#7a5a3a',fl2:'#725436',wall:'#c8b89a',np:[['saggio',5,3]],lay:[
'############','#SSSS..SSSS#','#..........#','#.TT....TT.#','#..........#','#S...==...S#','#S...==...S#','#S........S#','#..p....p..#','#..........#','#..........#','#####D######']},
in_tavern:{n:'Taverna del Drago Ubriaco',fl:'#8a6a42',fl2:'#82643e',wall:'#d8c8a8',np:[['gilda',7,2],['lino',11,9],['avventore',4,4],['avventore2',9,6]],lay:[
'##############','#bbb.CCCCC..F#','#............#','#.TT..TT..TT.#','#............#','#.TT..TT..TT.#','#............#','#k..........k#','#bb........bb#','#............#','#.TT..TT.....#','#............#','#............#','######D#######']},
in_smith:{n:'Fucina di Borin',fl:'#6a6a6a',fl2:'#646464',wall:'#a89a8a',np:[['borin',5,2]],lay:[
'###########','#wwww...FF#','#.........#','#..A....A.#','#.........#','#kk.....bb#','#.........#','#.........#','#....C....#','#.........#','####D######']},
in_alch:{n:'Bottega dell\'Erborista',fl:'#6a7a5a',fl2:'#647456',wall:'#c8d8b0',np:[['mira',5,3]],lay:[
'##########','#SSS..SSS#','#........#','#..P.....#','#........#','#p..CC..p#','#........#','#........#','#k.......#','####D#####']},
in_temple:{n:'Tempio della Luce',fl:'#d8d4c8',fl2:'#ccc8bc',wall:'#f0ece0',np:[['lia',6,2]],lay:[
'#############','#p...XXX...p#','#...........#','#.....=.....#','#.nn..=..nn.#','#.....=.....#','#.nn..=..nn.#','#.....=.....#','#.nn..=..nn.#','#.....=.....#','#p....=....p#','#.....=.....#','######D######']},
in_house1:{n:'Casa di Rosa',fl:'#9a7a52',fl2:'#92744e',wall:'#e0d0b0',np:[['rosa',4,2]],lay:['########','#BB..Sp#','#......#','#.TT...#','#.TT..c#','#......#','#b.....#','###D####']},
in_house2:{n:'Casa abbandonata',fl:'#7a6a52',fl2:'#72644e',wall:'#b8a890',np:[['gatto',5,5]],lay:['########','#B..SSS#','#......#','#..TT..#','#..TT..#','#c.....#','#.....b#','####D###']},
in_house3:{n:'Casa di Gerald',fl:'#8a7252',fl2:'#826c4e',wall:'#d8c8a0',np:[['gerald',4,3]],lay:['########','#SS..BB#','#......#','#.T....#','#......#','#k....c#','#......#','###D####']}
};
IN.in_casino={n:'Casinò Fortuna d\'Oro',fl:'#6a1a2a',fl2:'#601626',wall:'#2a1a2a',np:[['croupier',7,3],['scommettitore',4,7],['scommettitrice',11,9]],lay:[
'################','#MMMM..CC..MMMM#','#..............#','#..RR......QQ..#','#..RR......QQ..#','#......==......#','#.Z.Z..==..Z.Z.#','#......==......#','#.p....==....p.#','#......==......#','#..RR..==..QQ..#','#..RR..==..QQ..#','#......==......#','#.p....==....p.#','#..............#','#######D########']};
for(const k in IN){const d=IN[k];Z[k]=Object.assign({lv:0,N:d.lay.length,bg:'#141820',mus:'inter',int:1},d)}

/* ================= personaggi ================= */
const NPCS={
re:{n:'Re Aldric',role:'king',c:'#7a1a2a',hat:'#d4af37'},
guardia:{n:'Guardia Reale',c:'#5a6a8a',hat:'#9aa4b8',ln:['Il Re riceve chiunque abbia coraggio. Avvicinati pure.','Da quando la corona si è spezzata, le notti sono più lunghe.']},
guardia2:{n:'Guardia Reale',c:'#5a6a8a',hat:'#9aa4b8',ln:['La Cittadella del Vuoto... dicono che le sue mura si muovano da sole.','Nessuno passa senza il permesso del Re.']},
ciambellano:{n:'Ciambellano Orsino',c:'#6a2a6a',hat:'#222222',ln:['Il portale per la Cittadella si aprirà qui, quando la corona sarà riforgiata.','Il Re è stanco, ma non ha mai perso la speranza.']},
saggio:{n:'Saggio Elandor',role:'sage',c:'#3a4a8a',hat:'#2a2a5a'},
gilda:{n:'Oste Gilda',role:'inn',c:'#a8632f',hat:'#cc4433',qs:['g1','g2','g3','g4'],ln:['Benvenuto al Drago Ubriaco! Birra, letti caldi e chiacchiere.','Se cerchi lavoro, ho sempre qualcosa da fare per un eroe.']},
lino:{n:'Bardo Lino',role:'bard',c:'#2a8a5a',hat:'#aa3366',ln:['Vuoi sentire la ballata dell\'eroe di Aldoria? Non è ancora finita... dipende da te.']},
avventore:{n:'Avventore',c:'#6a5a4a',hat:'#4a3a2a',ln:['Ho sentito che i dungeon cambiano forma ogni volta che qualcuno ne sconfigge il signore.','Nel Colosseo si vincono punti che valgono più dell\'oro.','La Piramide di Khem è nel deserto, a est. Non andarci senza pozioni.','Alla Fucina Infernale si arriva dai Picchi Gelidi. Strano, vero?']},
avventore2:{n:'Mercenaria Vera',c:'#8a3a3a',hat:'#3a3a3a',ln:['Il Maestro Kael vende armature che non troverai da nessun\'altra parte. Ma solo ai campioni.','Un consiglio: i nemici a distanza lanciano proiettili. Muoviti e li schiverai.','Quando un boss si infuria evoca rinforzi. Tieniti libero lo spazio attorno.']},
borin:{n:'Fabbro Borin',role:'smith',c:'#5a3a2a',hat:'#333333',qs:['b1','b2','b3','b4'],ln:['Il ferro non mente. Portami materiali e ti forgerò meraviglie.','Posso potenziare il tuo equipaggiamento: fino a +5, se hai l\'oro.']},
mira:{n:'Erborista Mira',role:'alch',c:'#4a8a3a',hat:'#8a3aaa',qs:['m1','m2','m3','m4'],ln:['Le mie pozioni hanno salvato più eroi delle spade.','Ogni ingrediente ha un\'anima. Anche la gelatina di slime.']},
lia:{n:'Sacerdotessa Lia',role:'heal',c:'#eeeeee',hat:'#cc33cc',qs:['l1','l2','l3'],ln:['La Luce ti protegga, viandante.','I morti non dovrebbero camminare. Aiutami a dar loro pace.']},
rosa:{n:'Mamma Rosa',c:'#c86a8a',hat:'#6a3a2a',qs:['r1','r2'],ln:['Mio figlio Tommaso non sta mai fermo...','Ho appena sfornato il pane. Ne vuoi un pezzo?']},
gatto:{n:'Briciola',role:'cat'},
gerald:{n:'Vecchio Gerald',c:'#7a7a6a',hat:'#aaaaaa',qs:['ge1','ge2'],ln:['Ai miei tempi ero il miglior lanciere del regno. Poi ho preso una freccia... nella schiena.','Malakar era il fratello del Re, lo sapevi? Un tempo era buono.']},
marcus:{n:'Capitano Marcus',c:'#3a5a9a',hat:'#c0c8d8',qs:['c1','c2','c3','c4','c5','c6','c7'],ln:['La guardia non basta più. Ci servono eroi.','Fuori dalle mura il pericolo cresce ogni giorno.']},
tommaso:{n:'Piccolo Tommaso',c:'#4a9ad0',hat:'#d05a3a',qs:['t1','t2'],ln:['Da grande farò l\'eroe come te!']},
ugo:{n:'Mercante Ugo',role:'shop',c:'#a8632f',hat:'#ffcc33',ln:['Merce fresca da ogni angolo del regno!','Compro tutto, a prezzi onesti... più o meno.']},
nino:{n:'Pescatore Nino',c:'#3a6a8a',hat:'#e0c040',qs:['n1','n2','n3'],ln:['Il mare è inquieto. Qualcosa si muove nell\'Abisso, sotto il molo.','Per l\'Abisso Sommerso adesso si scende dal Porto, da un vecchio pozzo pieno di alghe sulla banchina. Io non ci scendo!']},
kael:{n:'Maestro d\'Arena Kael',role:'arena',c:'#8a1a1a',hat:'#d4af37',ln:['Nel Colosseo conta solo una cosa: restare in piedi.','Ogni vittoria vale punti arena. Spendili da me per l\'equipaggiamento dei campioni.']},
banditore:{n:'Banditore',c:'#d0a030',hat:'#8a1a1a',ln:['Udite, udite! Il tabellone mostra i campioni del Colosseo!','Sfida gli altri eroi nella fossa di sabbia. Fuori dalla fossa nessuno può colpirti.']},
araldo:{n:'Araldo della Piazza',c:'#2a5a9a',hat:'#d4af37',ln:['Il tabellone accanto a me mostra la classifica dell\'arena.','Il Colosseo è a nord-est, oltre la strada.']},
guardia_porta:{n:'Guardia della Porta',c:'#5a6a8a',hat:'#9aa4b8',ln:['A nord la Foresta di Elmwood, a est il Deserto di Khem, a ovest i Picchi Gelidi.','La Cripta è nel cimitero a sud-ovest. Per l\'Abisso si scende dal pozzo delle alghe, al Porto.']}
};
Object.assign(NPCS,{croupier:{n:'Croupier Lucien',c:'#1a1a1a',hat:'#aa1a2a',role:'casino',ln:['Fate il vostro gioco!','La fortuna ama gli audaci... e chi sa fermarsi.','Rien ne va plus!']},scommettitore:{n:'Giocatore incallito',c:'#6a4a2a',hat:'#222222',ln:['Ancora una mano e smetto. Giuro.','Il sette mi porta fortuna, sempre.']},scommettitrice:{n:'Dama fortunata',c:'#8a2a6a',hat:'#d4af37',ln:['Il segreto? Sapere quando alzarsi dal tavolo.','Ho vinto una fortuna... e l\'ho persa. Due volte.']}});
const VILL=['Anna','Bruno','Carla','Dario','Elsa','Fosco','Greta','Ivo'];
const VLINES=['Bella giornata ad Aldoria, vero?','Hai visto il Colosseo? Si sentono le urla fin qui!','Il Mercante Ugo fa buoni prezzi, se gli sorridi.','La Biblioteca custodisce le pagine del diario di Malakar.','Si dice che nei dungeon ci siano pagine di un antico diario.','Dicono che la Taverna abbia la birra migliore del regno.','Attento ai lupi, fuori dalle mura.','Il fabbro Borin può rendere la tua spada molto più affilata.'];

/* ================= missioni =================
   kill: uccidi n nemici · col: raccogli n oggetti (cadono dai nemici indicati) · boss: sconfiggi il boss · talk: parla con un personaggio */
const QT={
c1:{t:'kill',e:['lupo'],n:8,ti:'Caccia ai lupi',tx:'I lupi della Foresta di Elmwood attaccano i viandanti. Abbattine 8.',g:60,x:40},
c2:{t:'kill',e:['goblin','arciere'],n:10,lv:2,ti:'Predoni goblin',tx:'I goblin razziano le fattorie. Eliminane 10, nella Foresta o nella loro Tana.',g:90,x:70},
c3:{t:'boss',e:['troll'],n:1,lv:2,ti:'Il Troll di Elmwood',tx:'Un troll gigantesco infesta il cuore della foresta. Abbattilo.',g:200,x:150},
c4:{t:'kill',e:['scorpione','sciacallo'],n:10,lv:4,ti:'Sabbie pericolose',tx:'Le carovane per Khem vengono assalite. Ripulisci il deserto: 10 bestie.',g:150,x:110},
c5:{t:'boss',e:['faraone'],n:1,lv:5,ti:'Il Faraone Eterno',tx:'Un antico sovrano è tornato a camminare nel deserto. Rimandalo nella tomba.',g:350,x:260},
c6:{t:'kill',e:['yeti','lupo_gelo'],n:8,lv:7,ti:'Bestie del gelo',tx:'Sui Picchi Gelidi le bestie scendono a valle. Fermane 8.',g:240,x:180},
c7:{t:'boss',e:['drago_brina'],n:1,lv:8,ti:'Il Drago di Brina',tx:'Il drago dei Picchi ha congelato un intero villaggio. È tempo di affrontarlo.',g:650,x:500},
m1:{t:'col',e:['slime'],it:'Gelatina di slime',n:6,ti:'Ingredienti appiccicosi',tx:'Mi servono 6 gelatine di slime per un unguento. Gli slime vivono nella foresta.',g:50,x:35},
m2:{t:'col',e:['scorpione'],it:'Pungiglione',n:5,lv:4,ti:'Veleno curativo',tx:'Dal veleno di scorpione si ricava un antidoto. Portami 5 pungiglioni.',g:120,x:90},
m3:{t:'col',e:['elem_ghiaccio'],it:'Cristallo gelido',n:5,lv:7,ti:'Freddo eterno',tx:'I cristalli degli elementali conservano le erbe per anni. Me ne servono 5.',g:220,x:160},
m4:{t:'col',e:['imp','demone'],it:'Zolfo infernale',n:6,lv:10,ti:'Fuoco alchemico',tx:'Lo zolfo della Fucina Infernale alimenta i miei elisir più potenti. Ne servono 6.',g:330,x:250},
b1:{t:'col',e:['lupo','lupo_gelo'],it:'Pelliccia',n:6,ti:'Pellicce per l\'inverno',tx:'Foderò le armature con pelliccia di lupo. Portamene 6.',g:70,x:50},
b2:{t:'col',e:['mummia'],it:'Bende antiche',n:5,lv:4,ti:'Bende di Khem',tx:'Le bende delle mummie sono intrise di resine rarissime. Me ne servono 5.',g:140,x:100},
b3:{t:'col',e:['golem_cr'],it:'Minerale cristallino',n:5,lv:8,ti:'Acciaio di cristallo',tx:'Il minerale dei golem delle Caverne di Cristallo è il migliore per le lame.',g:260,x:190},
b4:{t:'col',e:['golem_magma'],it:'Nucleo di magma',n:4,lv:10,ti:'Il cuore della forgia',tx:'Un nucleo di magma tiene accesa una forgia per un secolo. Portamene 4.',g:340,x:260},
l1:{t:'kill',e:['scheletro','zombie'],n:12,lv:3,ti:'Pace ai defunti',tx:'Nella Cripta Dimenticata i morti si sono risvegliati. Dai pace a 12 di loro.',g:130,x:100},
l2:{t:'boss',e:['necromante'],n:1,lv:4,ti:'La Necromante',tx:'Velka, una necromante, controlla la Cripta. Fermala nel suo piano più profondo.',g:320,x:240},
l3:{t:'kill',e:['ombra','cavaliere'],n:10,lv:14,ti:'Ombre del Vuoto',tx:'Le creature del Vuoto corrompono la luce. Distruggine 10 nella Cittadella.',g:520,x:400},
g1:{t:'kill',e:['ratto'],n:8,lv:1,ti:'Ratti giganti',tx:'I ratti giganti della Tana dei Goblin mi rubano le provviste. Eliminane 8.',g:50,x:40},
g2:{t:'talk',to:'marcus',ti:'Consegna urgente',tx:'Porta questo barilotto di birra al Capitano Marcus, alla porta nord. Poi torna da me.',g:30,x:20},
g3:{t:'talk',to:'borin',ti:'Boccale rotto',tx:'Il mio boccale preferito si è crepato. Portalo al Fabbro Borin perché lo ripari.',g:30,x:20},
g4:{t:'kill',e:['pipistrello'],n:10,lv:3,ti:'Ali nella notte',tx:'I pipistrelli della Cripta escono di notte e spaventano i clienti. Eliminane 10.',g:110,x:80},
r1:{t:'talk',to:'lia',ti:'Pane per il Tempio',tx:'Porteresti questo pane alla Sacerdotessa Lia, al Tempio? Torna pure da me dopo.',g:25,x:20},
r2:{t:'talk',to:'nino',ti:'Il pranzo di Nino',tx:'Il Pescatore Nino dimentica sempre il pranzo. Portaglielo al molo.',g:25,x:20},
ge1:{t:'col',e:['scheletro'],it:'Antico stendardo',n:1,ch:.15,lv:3,ti:'Lo stendardo perduto',tx:'Il mio vecchio reggimento cadde nella Cripta. Uno scheletro porta ancora il nostro stendardo.',g:160,x:120},
ge2:{t:'boss',e:['sfinge'],n:1,lv:6,ti:'L\'enigma della Sfinge',tx:'Da giovane non risposi all\'enigma della Sfinge. Sconfiggila tu, nella Piramide di Khem.',g:420,x:300},
t1:{t:'talk',to:'gatto',once:1,ti:'Il gatto scomparso',tx:'Il mio gatto Briciola è sparito! Forse si è nascosto in una casa del quartiere sud-ovest...',g:40,x:30},
t2:{t:'kill',e:['slime'],n:5,once:1,ti:'Proteggi Tommaso',tx:'Voglio vedere uno slime da vicino! Anzi no... sconfiggine 5 e raccontami com\'è andata.',g:40,x:30},
n1:{t:'kill',e:['granchio'],n:8,lv:12,ti:'Chele giganti',tx:'I granchi corazzati dell\'Abisso hanno distrutto le mie reti. Eliminane 8.',g:420,x:320},
n2:{t:'col',e:['uomo_pesce'],it:'Scaglie iridescenti',n:6,lv:12,ti:'Scaglie preziose',tx:'Le scaglie degli uomini-pesce valgono una fortuna. Portamene 6.',g:440,x:330},
n3:{t:'boss',e:['leviatano'],n:1,lv:12,ti:'Il mostro dell\'Abisso',tx:'Il Leviatano scuote il molo ogni notte. Scendi nell\'Abisso e affrontalo.',g:800,x:600}
};

/* ================= storia ================= */
const STORY={
intro:'Eroe, ascoltami. Il Re Lich Malakar, mio fratello, ha infranto la Corona di Voxel: il cuore che tiene unito il regno. I sei frammenti sono finiti nei luoghi più oscuri: la Tana dei Goblin, la Cripta Dimenticata, la Piramide di Khem, le Caverne di Cristallo, la Fucina Infernale e l\'Abisso Sommerso. Riportameli e la corona riforgiata aprirà la via per la sua Cittadella.',
forge:'I sei frammenti si uniscono tra le mani del Re in un lampo di luce. La Corona di Voxel è di nuovo intera, e nella sala del trono si apre un portale violaceo: la via per la Cittadella del Vuoto.',
end:'Con la caduta di Malakar il Vuoto si ritira. Il Re Aldric depone la corona sull\'altare e ti nomina Campione di Aldoria. Ma i dungeon del regno continuano a rinascere, più oscuri a ogni ciclo: la tua leggenda è appena cominciata.'
};
const SHT={tana:'Il primo frammento pulsa di luce verde. Grugnak lo portava al collo come un trofeo, senza capire cosa fosse.',
cripta:'Il frammento era incastonato nel bastone di Velka. Ancora adesso sussurra il nome di Malakar.',
piramide:'La Sfinge lo teneva sotto la zampa. Sulla sua superficie è inciso un enigma che nessuno ha mai risolto.',
cristallo:'Il frammento si è fuso con il cristallo della caverna. Brilla come una stella intrappolata nel ghiaccio.',
fucina:'Ignis cercava di fonderlo per forgiare un\'arma. Il frammento è ancora caldo al tatto.',
abisso:'Il Leviatano lo aveva inghiottito. Odora di sale e di secoli.'};
const LORE={
tana1:['Diario di Malakar, I','Oggi mio fratello è stato incoronato. Io resterò il suo mago di corte. Dicono che sia un onore. Io lo chiamo ombra.'],
tana2:['Diario di Malakar, II','Nei libri proibiti della Biblioteca ho trovato un nome: il Vuoto. Una forza che esisteva prima dei voxel.'],
cripta1:['Diario di Malakar, III','I morti non mentono. Ho parlato con loro nella Cripta. Mi hanno detto che la corona è una prigione.'],
cripta2:['Diario di Malakar, IV','Velka è la mia allieva più dotata. Le ho insegnato a risvegliare le ossa. Mi ha chiesto perché. Non ho risposto.'],
piramide1:['Diario di Malakar, V','La Sfinge mi ha posto il suo enigma. Ho risposto. Mi ha guardato con pietà, e mi ha lasciato passare.'],
piramide2:['Diario di Malakar, VI','Nei geroglifici di Khem è scritto che chi spezza la corona diventa la corona. Non mi spaventa.'],
cristallo1:['Diario di Malakar, VII','Il freddo dei Picchi non è nulla. Il Vuoto è più freddo. E più silenzioso.'],
cristallo2:['Diario di Malakar, VIII','La Regina dei Ragni tesse con fili di cristallo. Le ho promesso un regno sotto la montagna.'],
fucina1:['Diario di Malakar, IX','Ignis vuole un\'arma capace di ferire un dio. Gli ho mentito: non esiste. Esiste solo la volontà.'],
fucina2:['Diario di Malakar, X','Ho infranto la corona. Il suono è stato quello di mille vetri. Aldric ha urlato il mio nome.'],
abisso1:['Diario di Malakar, XI','Ho dato l\'ultimo frammento al Leviatano. Nessuno scenderà mai così in fondo. Nessuno.'],
abisso2:['Diario di Malakar, XII','La mia pelle è diventata fredda. Non dormo più. Non ne ho più bisogno.'],
cittadella1:['Diario di Malakar, XIII','La Cittadella cresce da sola, blocco dopo blocco. Il Vuoto costruisce per me.'],
cittadella2:['Diario di Malakar, XIV','Se qualcuno sta leggendo queste pagine, allora l\'eroe è arrivato. Forse è giusto così. Dì ad Aldric che mi dispiace.']
};
