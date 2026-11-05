/* ================= 5.2: Aldoria più grande, nuovi edifici, arredi unici per ogni interno ================= */
// Legenda degli arredi nuovi: 1 forno · 2 rastrelliera del pane · 3 manichino · 4 telaio · 5 cannocchiale · 6 mappamondo
// 7 armatura · 8 letto a castello · 9 box della stalla · 0 scrivania · ! stendardo · % pianoforte · * candelabro
// ? cavalletto · < armadio · > vasca · | pendolo · _ cassettiera

/* ---- cavalli ---- */
const horse=(c,k,s=1)=>scl([[-.32,-.14,0,.08,.08,12,k],[-.32,.06,0,.08,.08,12,k],[.2,-.14,0,.08,.08,12,k],[.2,.06,0,.08,.08,12,k],
  [-.36,-.15,12,.66,.3,10,c],[.22,-.08,18,.14,.16,10,c],[.28,-.07,26,.26,.14,7,c],[.5,-.06,26,.06,.12,4,k],[.2,-.03,22,.06,.06,12,k],
  [-.44,-.03,9,.08,.06,12,k],[.42,-.08,30,.03,.01,2,'#111'],[.42,.07,30,.03,.01,2,'#111'],[.26,-.05,33,.04,.03,3,c],[.26,.03,33,.04,.03,3,c]],s);
Object.assign(ANM,{cavallo:()=>horse('#8a5a32','#2a1a10'),cavallo2:()=>horse('#e8e4dc','#a8a094'),cavallo3:()=>horse('#2a2a2e','#5a5a62')});

/* ---- nuovi abitanti ---- */
Object.assign(NPCS,{
gemma:{n:'Fornaia Gemma',c:'#e8e0d0',hat:'#ffffff',qs:['ab1'],ln:['Il primo pane esce dal forno alle cinque. Chi dorme non lo assaggia!','La farina dei Campi è la migliore del regno.']},
ottavia:{n:'Sarta Ottavia',c:'#8a3a6a',hat:'#e8c8e0',qs:['ab2'],ln:['Ago, filo e pazienza: con questi vesto mezza Aldoria.','La seta dei ragni di cristallo non si strappa mai.']},
cliente:{n:'Cliente',c:'#5a6a8a',hat:'#3a3a3a',ln:['Aspetto il mio mantello da tre settimane...','Ottavia è la migliore, ma quanta fila!']},
ruggero:{n:'Capitano Ruggero',c:'#5a6a7a',hat:'#a8303a',qs:['ab3'],ln:['La Guardia di Aldoria non dorme mai. Al massimo sonnecchia.','Le reclute di quest\'anno? Volenterose. E goffe.']},
recluta:{n:'Recluta Pino',c:'#6a7a8a',hat:'#8a8a94',ln:['Sono di ronda! ...Credo di essermi perso.','Un giorno sarò capitano anch\'io.','Hai visto il Capitano? Non dirgli che ho fatto una pausa.']},
scudiero:{n:'Scudiero Aldo',c:'#7a5a3a',hat:'#4a3a2a',qs:['ab4'],ln:['Ogni cavallo ha il suo carattere. Tempesta, per esempio, morde.','Il fieno va cambiato ogni mattina.']},
cavallo:{n:'Saetta',c:'#8a5a32',hat:'#2a1a10',ln:['Hiiiih!','Il cavallo sbuffa e ti annusa le tasche.']},
cavallo2:{n:'Biscotto',c:'#e8e4dc',hat:'#a8a094',ln:['Il cavallo bianco ti guarda con aria nobile.','Hiiih!']},
cavallo3:{n:'Tempesta',c:'#2a2a2e',hat:'#5a5a62',ln:['Il cavallo nero batte lo zoccolo. Meglio non avvicinarsi troppo.','Sbuff!']},
astronomo:{n:'Astronomo Tolomeo',c:'#2a3a6a',hat:'#d4af37',qs:['ab5','ab6'],ln:['Di giorno dormo, di notte guardo il cielo. Che vita!','Stanotte Vespero brilla sopra il Colosseo.']},
sindaco:{n:'Sindaco Bernardo',c:'#3a2a4a',hat:'#d4af37',qs:['ab7','ab8'],ln:['Aldoria cresce: nuove strade, nuove case, nuovi problemi.','Il Re regna, ma i tombini li sistemo io.']},
usciere:{n:'Usciere Fulvio',c:'#4a4a52',hat:'#2a2a2a',ln:['Il Sindaco riceve dal lunedì al venerdì. Oggi che giorno è?','Prenda il numero, prego.']},
segretaria:{n:'Segretaria Livia',c:'#6a4a3a',hat:'#d8c8a8',ln:['Tre copie di ogni documento. Sempre.','Il Sindaco firma tutto, ma legge poco.']},
fornaio:{n:'Garzone Lillo',c:'#e8e0d0',hat:'#c8a878',ln:['Ho le braccia di farina fino ai gomiti.','Vuoi un panino? Due monete. Per gli eroi, tre.']}});

Object.assign(QT,{
ab1:{t:'gat',r:'grano',n:15,ti:'Farina per il forno',tx:'Il forno non si ferma mai: portami 15 covoni di grano dai Campi.',g:110,x:80},
ab2:{t:'col',e:['ragno'],it:'Seta di ragno',n:5,lv:8,ti:'Seta di cristallo',tx:'I ragni delle Caverne di Cristallo filano la seta più resistente. Portamene 5 matasse.',g:380,x:280},
ab3:{t:'kill',e:['goblin','arciere'],n:15,lv:1,ti:'Addestramento sul campo',tx:'Le mie reclute non hanno mai visto un goblin. Mostra loro come si fa: 15 goblin.',g:140,x:100},
ab4:{t:'gat',r:'mela',n:10,ti:'Mele per i cavalli',tx:'Saetta, Biscotto e Tempesta impazziscono per le mele dei Campi. Portamene 10.',g:80,x:60},
ab5:{t:'talk',to:'anselmo',ti:'Luci sul mare',tx:'Il guardiano del faro, al Porto, vede il cielo meglio di chiunque. Chiedigli delle luci che si muovono sull\'acqua.',g:70,x:50},
ab6:{t:'kill',e:['pipistrello'],n:10,lv:4,ti:'Ali nella notte',tx:'Stormi di pipistrelli salgono dalla Cripta e mi coprono le stelle. Sfoltiscili: 10 pipistrelli.',g:170,x:120},
ab7:{t:'talk',to:'gemma',ti:'La festa del patrono',tx:'Per la festa del patrono serve il pane per tutta la città. Avvisa la fornaia Gemma, alla Panetteria.',g:60,x:40},
ab8:{t:'gat',r:'legna',n:20,ti:'Il falò della festa',tx:'Il grande falò in piazza vuole 20 fasci di legna. I boscaioli dei Campi ne hanno in abbondanza.',g:150,x:110}});

/* ---- planimetrie: ogni interno ha il suo arredo ---- */
const LAY={
// ville del Quartiere Nobile (16×16)
in_villa1:['################','#<_..*.%%.*.._<#','#..............#','#$.==========.$#','#..==========..#','#*.==========.*#','#..==========..#','#$.==========.$#','#..==========..#','#*.==========.*#','#..............#','#p.TT......TT.p#','#..............#','#o...|....|...o#','#..............#','#######D########'],
in_villa2:['################','#SS.6..00..6.SS#','#..............#','#.kk.i....i.kk.#','#.kk........kk.#','#......==......#','#p.TT..==..TT.p#','#......==......#','#ii....==....ii#','#......==......#','#.C.C.C..C.C.C.#','#..............#','#$$..o....o..|.#','#..............#','#k............k#','#######D########'],
in_villa3:['################','#?.?.?..Y..?.?.#','#..............#','#.3...====...3.#','#.....====.....#','#p.?..====..?.p#','#.....====.....#','#..............#','#SS.T.....T..SS#','#..............#','#o.Y........Y.o#','#..............#','#B<...$$.....B_#','#..............#','#p............p#','#######D########'],
in_villa4:['################','#!.7.7.FF.7.7.!#','#..............#','#w............w#','#w...TTTT.....w#','#....T6TT......#','#..............#','#!.==========.!#','#..==========..#','#..==========..#','#7............7#','#..............#','#BB.<...|...0..#','#..............#','#b.k........k.b#','#######D########'],
in_villa5:['################','#5..SS.00.SS..5#','#..............#','#&............&#','#...6..TT..6...#','#......TT......#','#@.....==.....@#','#......==......#','#p..$..==..$..p#','#......==......#','#..............#','#kk..........|.#','#k.....B<.....b#','#..............#','#b..@......&..b#','#######D########'],
in_villa6:['################','#<_..F..|..F._<#','#..............#','#*.....**.....*#','#..............#','#.$$...==...$$.#','#......==......#','#......==......#','#.T....==....T.#','#......==......#','#..............#','#SS...X..X...SS#','#..............#','#B......p.....B#','#..............#','#######D########'],
// case del Porto (12×12)
in_casa_p1:['############','#;:..._..BB#','#..........#','#.TT....B..#','#.TT.......#','#..........#','#o...==...<#','#....==....#','#k...==...p#','#..........#','#b........m#','#####D######'],
in_casa_p2:['############','#F..NN...BB#','#..........#','#.m..T.....#','#....T...&.#','#..........#','#H.......@.#','#H...==....#','#....==...b#','#..........#','#k.N.....kk#','#####D######'],
in_casa_p3:['############','#N.N.N.N..@#','#..........#','#.4..CCC...#','#..........#','#@.......N.#','#..N...N...#','#..........#','#B...m..4..#','#..........#','#b..k...@@.#','#####D######'],
in_casa_p4:['############','#BB.o..>.:_#','#BB........#','#..........#','#o..TT...o.#','#...TT.....#','#..........#','#<...==...p#','#....==....#','#;..*......#','#k........o#','#####D######'],
// magazzini del Porto (14×14)
in_magazzino1:['##############','#kkk.bbb.iiii#','#............#','#.kk.kk.kk.0.#','#.kk.kk.kk...#','#............#','#.bb.bb.bb.@.#','#.bb.bb.bb...#','#............#','#ii.......x..#','#ii..........#','#k...k...k..b#','#............#','######D#######'],
in_magazzino2:['##############','#kk.k..bb.kkk#','#k......b...k#','#...kk.......#','#.kkk....x...#','#........kk..#','#bb.......k..#','#b...ii......#','#....ii...kk.#','#*........kk.#','#.c..........#','#kk........bb#','#............#','######D#######'],
// nuovi edifici di Aldoria
in_panetteria:['############','#1.1..22.22#','#..........#','#ii........#','#i..TT.....#','#...TT...CC#','#..........#','#CCC.....2.#','#..........#','#m.m.....b.#','#o........o#','#####D######'],
in_sartoria:['############','#3.3.3..<<_#','#..........#','#4...====..#','#....====.3#','#4...====..#','#..........#','#CCC....p..#','#..........#','#S..m...$$.#','#S.........#','#####D######'],
in_caserma:['################','#!.w.w.00.w.w.!#','#..............#','#7............7#','#..TTTTTTTTT...#','#..............#','#7............7#','#..............#','#8.8.8....E..E.#','#..............#','#8.8.8....E..E.#','#..............#','#bk..........kb#','#..............#','#8.8.8........c#','#######D########'],
in_scuderia:['##############','#..9..9..9..y#','#..9..9..9..y#','#:.9:.9:.9:..#','#............#','#............#','#yy........dd#','#y..........d#','#.....==.....#','#.....==...b.#','#..9..9..9...#','#..9..9..9..y#','#............#','######D#######'],
in_osservatorio:['############','#SS..55..SS#','#..........#','#6........6#','#...====...#','#...====...#','#*..====..*#','#...====...#','#..........#','#0..S..|..B#','#0........_#','#####D######'],
in_municipio:['################','#S!..|.KK.|..!S#','#..............#','#...00000000...#','#..............#','#.....====.....#','#.nnn.====.nnn.#','#.....====.....#','#.nnn.====.nnn.#','#.....====.....#','#.nnn.====.nnn.#','#..............#','#CCCC......CCCC#','#..............#','#p..Y......Y..p#','#######D########']};
// abitanti degli interni che cambiano posto con la nuova planimetria
const LNP={
in_villa1:[['duchessa',7,2],['cameriera',4,12]],
in_villa2:[['silvio',7,2],['servitore',11,13,{n:'Servitore Ercole'}]],
in_villa3:[['pittrice',7,2],['cameriera',7,4,{n:'Modella Bianca',c:'#e8e0f0',hat:'#c86ae8'}]],
in_villa4:[['generale',7,2],['servitore',4,10,{n:'Attendente Lino'}]],
in_villa5:[['armatore',7,2],['servitore',11,12,{n:'Segretario Rufo'}]],
in_villa6:[['vedova',7,2],['cameriera',11,12,{n:'Governante Marta'}]],
in_casa_p1:[['teresa',5,3],['lucia',7,9]],
in_casa_p2:[['marino',3,4]],
in_casa_p3:[['retaio',5,4]],
in_casa_p4:[['marinaio',5,3,{n:'Marco',c:'#2a4a6a'}],['marinaio',7,9,{n:'Giulia',c:'#8a3a5a',hat:'#e8d0e0'}]],
in_magazzino1:[['magazziniere',6,5]],
in_magazzino2:[['facchino',6,5],['losco',3,8]]};
for(const k in LNP){Z[k].lay=LAY[k];Z[k].N=LAY[k].length;Z[k].np=LNP[k]}
const IN7={
in_panetteria:{n:'Panetteria di Gemma',fl:'#c8a878',fl2:'#be9e70',wall:'#f0e4cc',np:[['gemma',5,2],['fornaio',2,6]]},
in_sartoria:{n:'Sartoria di Ottavia',fl:'#a88a9a',fl2:'#9e8090',wall:'#f0e4ec',np:[['ottavia',6,2],['cliente',8,8]]},
in_caserma:{n:'Caserma della Guardia',fl:'#7a7a7a',fl2:'#727272',wall:'#9a9a90',np:[['ruggero',7,2],['dino',12,9]]},
in_scuderia:{n:'Scuderia di Aldoria',fl:'#8a6a42',fl2:'#80623e',wall:'#a87a4a',np:[['scudiero',6,5],['cavallo',1,1],['cavallo2',4,2],['cavallo3',7,1]]},
in_osservatorio:{n:'Osservatorio',fl:'#3a3a5a',fl2:'#343454',wall:'#d8d4c8',np:[['astronomo',5,2]]},
in_municipio:{n:'Municipio di Aldoria',fl:'#b8a888',fl2:'#ae9e80',wall:'#ece0c8',np:[['sindaco',7,2],['usciere',3,11],['segretaria',13,13]]}};
for(const k in IN7)Z[k]=Object.assign({lv:0,N:LAY[k].length,bg:'#141820',mus:'inter',int:1,lay:LAY[k]},IN7[k]);
