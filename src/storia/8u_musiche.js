/* ================= 7.10: una canzone per ogni edificio di Aldoria ================= */
// Fino alla 7.9 quasi tutti gli interni suonavano lo stesso valzer ("inter"). Ora ogni edificio ha il suo brano,
// scritto a tema con il nome: la taverna balla una giga, la fucina batte sull'incudine, il tempio canta in coro,
// il faro ascolta le onde. Le stanze dello stesso edificio (piani, archivi, camere) tengono la stessa musica,
// così salendo le scale il brano continua senza ricominciare.
// Il formato dei brani è quello delle musiche scritte (6.8): melodia "grado:durata", accordi per battuta, forma.

// strumenti nuovi (stessi parametri di INS: onda, seconda onda, attacco, tenuta, decadimento, filtro, vibrato)
Object.assign(INS,{
  harp:{w:'triangle',w2:'sine',m2:2,v2:.3,a:.003,s:0,dec:1.2},
  organ:{w:'sine',w2:'square',m2:2,v2:.1,a:.04,s:.92,lp:2400,r:.15},
  mbox:{w:'sine',w2:'sine',m2:4,v2:.2,a:.002,s:0,dec:.8},
  lute:{w:'triangle',w2:'sawtooth',m2:2,v2:.12,a:.003,s:0,dec:.55,lp:2600},
  hpsi:{w:'sawtooth',w2:'square',m2:2,v2:.25,a:.002,s:0,dec:.4,lp:3200},
  accor:{w:'sawtooth',w2:'square',det:14,v2:.45,a:.05,s:.8,lp:1900,vib:1,r:.1},
  whis:{w:'sine',w2:'sine',m2:2,v2:.06,a:.03,s:.8,vib:1,r:.07},
  choir:{w:'sawtooth',w2:'triangle',det:7,v2:.6,a:.3,s:.9,lp:1000,vib:1,r:.5},
  marimba:{w:'sine',w2:'sine',m2:4,v2:.15,a:.002,s:0,dec:.35},
  fiddle:{w:'sawtooth',w2:'sawtooth',det:6,v2:.35,a:.05,s:.8,lp:2600,vib:1,r:.08},
  banjo:{w:'square',w2:'triangle',m2:2,v2:.35,a:.002,s:0,dec:.3,lp:3800}});
// scala misolidia (maggiore con la settima abbassata): Villa Ponente e il Deposito delle Merci
SCL.mix=[0,2,4,5,7,9,10];
// basso del tango e batterie nuove: a = incudine, w = legnetto, n = sega, W = onda del mare (vedi drm)
BASS.tango='r..r..5.r.......';
Object.assign(DRUMS,{
  jig:{k:'x.....x.....',r:'r.rr.rr.rr.r',c:'......c.....'},
  anvil:{k:'x.......x.......',s:'....s.......s...',a:'..a.......a...a.'},
  tango:{k:'x.....x.x.......',s:'....s.......s.s.',r:'..r...r...r...r.'},
  clock:{w:'w...w...w...w...',h:'..h...h...h...h.'},
  saw:{k:'x.......x.......',n:'n.......n.......',w:'....w.......w...'},
  waves:{W:'W...............'},
  military:{k:'x.......x.......',s:'s..ss.s.s..ss.ss'},
  gallop:{t:'t.tt.tt.tt.t',k:'x.....x.....'}});

const BSONG=o=>Object.assign({sng:1,lv:.045,bs:'root',cp:'',dr:'none',form:'AABA'},o);
Object.assign(TRK,{
  // Biblioteca Arcana: lidio, misterioso, flauto lontano e campane
  b_biblioteca:BSONG({bpm:72,root:62,sc:'lyd',ld:'flute',lv:.042,echo:1,bs:'long',bv:.07,cp:'pad bell',parts:{
    A:{ch:[0,1,5,4],m:'2:4 4:4 7:6 6:2  5:4 3:4 1:8  5:4 7:4 9:6 7:2  6:4 4:4 1:4 4:4'},
    B:{ch:[5,1,2,4],m:'9:6 8:2 7:4 5:4  8:6 6:2 5:4 3:4  4:4 6:4 9:8  8:4 6:4 4:8'}}}),
  // Taverna del Drago Ubriaco: una giga da boccali, violino e battimani
  b_taverna:BSONG({bpm:132,root:67,sc:'maj',spb:12,ld:'fiddle',lv:.036,bs:'shanty',bv:.09,cp:'strum6',dr:'jig',dv:.8,form:'AABB',parts:{
    A:{ch:[0,4,0,4],m:'4:2 2:2 0:2 4:2 2:2 0:2  6:2 5:2 4:2 1:4 4:2  7:2 9:2 7:2 4:2 2:2 4:2  5:2 4:2 3:2 1:6'},
    B:{ch:[3,0,4,0],m:'3:2 5:2 7:2 5:2 3:2 5:2  4:2 7:2 9:2 7:4 4:2  8:2 6:2 4:2 1:2 4:2 6:2  7:6 0:6'}}}),
  // Fucina di Borin: minore armonico, ottoni e colpi d'incudine
  b_fucina:BSONG({bpm:96,root:57,sc:'hm',ld:'brass',lv:.04,bs:'ostinato',bv:.1,cp:'stab',dr:'anvil',dv:.9,fill:1,parts:{
    A:{ch:[0,5,3,4],m:'0:4 0:2 2:2 4:4 2:4  5:4 4:2 2:2 0:8  3:4 5:4 7:4 5:4  4:6 6:2 4:8'},
    B:{ch:[5,3,0,4],m:'7:4 9:4 8:4 7:4  5:4 7:2 5:2 3:8  2:4 4:4 7:6 6:2  4:4 6:4 11:8'}}}),
  // Bottega dell'Erborista: dorico, flauto e arpeggi come foglie
  b_erbe:BSONG({bpm:92,root:62,sc:'dor',ld:'flute',lv:.045,echo:1,bs:'pulse',bv:.07,cp:'arp',dr:'light',dv:.7,parts:{
    A:{ch:[0,3,0,6],m:'0:2 2:2 4:4 7:6 4:2  5:4 3:2 5:2 7:8  9:4 7:2 4:2 2:4 4:4  6:4 8:4 6:2 3:2 1:4'},
    B:{ch:[2,6,3,4],m:'9:6 8:2 6:8  8:4 6:2 4:2 1:8  3:4 5:4 7:4 10:4  8:4 6:4 4:8'}}}),
  // Tempio della Luce: un inno lento per coro, archi e campane
  b_tempio:BSONG({bpm:58,root:60,sc:'maj',ld:'choir',lv:.05,echo:1,bs:'long',bv:.07,cp:'ens bell',parts:{
    A:{ch:[0,3,0,4],m:'4:8 2:4 4:4  5:8 3:8  2:4 4:4 7:8  6:8 4:8'},
    B:{ch:[5,3,1,4],m:'7:8 5:4 7:4  8:8 7:4 5:4  5:4 3:4 1:8  4:12 r:4'}}}),
  // Casa di Rosa: un valzer da carillon, caldo come il pane appena sfornato
  b_rosa:BSONG({bpm:120,root:67,sc:'maj',spb:12,ld:'mbox',lv:.09,echo:1,bs:'waltz',bv:.07,cp:'waltz',parts:{
    A:{ch:[0,4,4,0],m:'4:4 2:4 4:4  6:8 5:4  1:4 4:4 6:4  7:8 r:4'},
    B:{ch:[3,0,4,0],m:'5:4 7:4 5:4  4:8 2:4  1:4 6:4 5:4  0:12'}}}),
  // Casa abbandonata: frigio, campane rade e un battito sordo
  b_abbandonata:BSONG({bpm:54,root:57,sc:'phr',ld:'bell',lv:.07,echo:1,bs:'long',bv:.08,cp:'drone',dr:'heart',dv:.7,form:'AB',parts:{
    A:{ch:[0,1,0,6],m:'4:8 r:4 3:4  1:6 3:2 5:8  4:4 2:4 1:4 0:4  6:12 r:4'},
    B:{ch:[5,1,0,0],m:'7:8 5:4 r:4  8:4 7:4 5:8  4:12 3:4  1:4 0:12'}}}),
  // Casa di Gerald: la marcia nostalgica di un vecchio lanciere
  b_gerald:BSONG({bpm:84,root:58,sc:'maj',ld:'brass',lv:.036,echo:1,bs:'root',bv:.08,cp:'ens',dr:'march',dv:.6,parts:{
    A:{ch:[0,3,4,0],m:'0:6 1:2 2:4 4:4  5:6 4:2 3:8  4:4 6:4 8:6 7:2  7:12 r:4'},
    B:{ch:[5,1,4,0],m:'9:6 8:2 7:4 5:4  8:6 7:2 6:8  7:4 6:4 4:4 1:4  0:12 r:4'}}}),
  // Casinò Fortuna d'Oro: un tango in minore, fisarmonica e colpi secchi
  b_casino:BSONG({bpm:112,root:62,sc:'hm',ld:'accor',lv:.034,bs:'tango',bv:.09,cp:'stab',dr:'tango',dv:.8,parts:{
    A:{ch:[0,3,4,0],m:'7:3 6:1 7:4 4:4 2:4  5:3 4:1 5:4 7:4 3:4  6:2 7:2 8:2 6:2 4:8  2:4 4:4 7:6 r:2'},
    B:{ch:[5,3,4,4],m:'9:6 8:2 7:4 5:4  8:3 7:1 5:4 3:8  6:4 8:4 11:4 10:4  8:2 7:2 6:2 4:2 1:8'}}}),
  // Palazzo del Conte: un minuetto barocco per clavicembalo
  b_palazzo:BSONG({bpm:112,root:62,sc:'maj',spb:12,ld:'hpsi',lv:.056,bs:'waltz',bv:.07,cp:'waltz',parts:{
    A:{ch:[0,3,4,0],m:'7:4 4:2 5:2 6:2 7:2  5:4 3:2 4:2 5:2 3:2  4:4 6:2 5:2 4:2 1:2  2:4 0:8'},
    B:{ch:[5,1,4,0],m:'9:4 7:2 8:2 9:2 7:2  8:4 5:2 6:2 7:2 5:2  6:2 5:2 4:2 6:2 8:4  7:12'}}}),
  // Banca di Aldoria: monete contate una a una e il ticchettio dell'orologio
  b_banca:BSONG({bpm:104,root:60,sc:'maj',ld:'pluck',lv:.05,bs:'pulse8',bv:.07,cp:'pad',dr:'clock',dv:.8,parts:{
    A:{ch:[0,5,1,4],m:'0:2 2:2 4:2 7:2 4:2 2:2 0:4  5:2 7:2 9:2 7:2 5:4 r:4  1:2 3:2 5:2 8:2 5:2 3:2 1:4  4:2 6:2 8:2 6:2 4:8'},
    B:{ch:[3,0,3,4],m:'3:4 5:4 7:4 10:4  9:2 7:2 4:4 2:4 4:4  8:2 7:2 5:2 3:2 5:4 7:4  6:4 4:4 11:8'}}}),
  // Casa della Fattoria: una danza di campagna per zufolo e chitarra
  b_fattoria:BSONG({bpm:112,root:65,sc:'maj',ld:'whis',lv:.042,bs:'walk',bv:.08,cp:'strum',dr:'folk',dv:.8,parts:{
    A:{ch:[0,3,4,0],m:'4:2 4:2 2:2 0:2 2:4 4:4  5:2 5:2 3:2 5:2 7:8  6:2 4:2 1:2 4:2 6:4 8:4  7:6 4:2 0:8'},
    B:{ch:[5,3,0,4],m:'9:4 7:4 5:4 2:4  10:4 8:4 5:8  7:2 9:2 7:2 4:2 2:4 4:4  6:4 8:4 4:8'}}}),
  // Segheria di Ettore: canto di lavoro con il respiro della sega
  b_segheria:BSONG({bpm:104,root:57,sc:'dor',ld:'reed',lv:.04,bs:'ostinato',bv:.09,cp:'strum',dr:'saw',dv:.8,parts:{
    A:{ch:[0,3,0,6],m:'4:2 4:2 4:2 2:2 0:4 2:4  3:2 5:2 7:4 5:4 3:4  4:2 4:2 7:4 6:2 4:2 2:4  6:4 1:4 3:8'},
    B:{ch:[2,6,3,4],m:'7:4 9:4 11:8  10:4 8:4 6:8  5:2 7:2 10:4 7:4 5:4  4:6 6:2 4:8'}}}),
  // Cappella in rovina: un inno triste per organo, tra le pietre crollate
  b_cappella:BSONG({bpm:54,root:57,sc:'min',ld:'organ',lv:.034,echo:1,bs:'long',bv:.07,cp:'pad',form:'AB',parts:{
    A:{ch:[0,5,3,4],m:'4:8 3:4 2:4  0:8 2:8  3:6 2:2 1:8  4:16'},
    B:{ch:[5,2,6,0],m:'7:8 5:8  4:6 2:2 4:8  6:8 3:4 1:4  0:12 r:4'}}}),
  // Locanda del Gabbiano: una canzone di mare dondolante, fisarmonica
  b_locanda:BSONG({bpm:120,root:62,sc:'maj',spb:12,ld:'accor',lv:.03,bs:'shanty',bv:.08,cp:'strum6',dr:'shanty',dv:.6,parts:{
    A:{ch:[0,4,0,4],m:'0:4 2:2 4:4 2:2  1:4 3:2 4:6  7:4 6:2 4:4 2:2  1:6 4:6'},
    B:{ch:[3,0,4,0],m:'3:4 5:2 7:4 5:2  9:6 7:6  8:4 6:2 4:4 1:2  0:12'}}}),
  // Capitaneria di Porto: marcia marinara con ottoni e tamburo
  b_capitaneria:BSONG({bpm:108,root:58,sc:'maj',ld:'brass',lv:.036,bs:'root',bv:.09,cp:'stab',dr:'march',dv:.8,fill:1,parts:{
    A:{ch:[0,3,4,0],m:'0:3 0:1 2:4 4:3 4:1 7:4  5:6 4:2 3:8  4:3 4:1 6:4 8:4 6:4  7:8 r:8'},
    B:{ch:[5,1,4,4],m:'9:4 7:4 5:4 9:4  8:6 7:2 5:8  6:4 8:4 11:8  10:4 8:4 6:4 4:4'}}}),
  // Villa Aurora: l'alba, una melodia che sale piena di luce
  b_aurora:BSONG({bpm:96,root:64,sc:'lyd',ld:'flute',lv:.042,echo:1,bs:'pulse',bv:.06,cp:'arp bell',dr:'soft',dv:.6,parts:{
    A:{ch:[0,1,0,1],m:'0:2 2:2 4:2 7:2 9:8  8:6 5:2 3:8  4:2 7:2 9:2 11:2 9:8  10:6 8:2 5:8'},
    B:{ch:[5,2,1,4],m:'12:4 11:4 9:8  9:4 6:4 4:8  8:4 5:4 3:4 1:4  4:8 6:4 8:4'}}}),
  // Villa Smeraldo: verde e fresca, arpeggi d'arpa
  b_smeraldo:BSONG({bpm:88,root:64,sc:'dor',ld:'harp',lv:.07,echo:1,bs:'long',bv:.07,cp:'pad',parts:{
    A:{ch:[0,3,6,0],m:'0:2 4:2 7:2 9:2 7:2 4:2 2:4  3:2 5:2 7:2 10:2 7:2 5:2 3:4  6:2 8:2 10:2 13:2 10:2 8:2 6:4  7:8 4:8'},
    B:{ch:[2,6,3,4],m:'9:4 11:4 13:8  12:4 10:4 8:8  10:4 7:4 5:8  4:4 6:4 8:8'}}}),
  // Villa Iris: delicata come un fiore, campanelle
  b_iris:BSONG({bpm:100,root:69,sc:'maj',ld:'bell',lv:.07,echo:1,bs:'pulse',bv:.06,cp:'pad',dr:'soft',dv:.5,parts:{
    A:{ch:[0,5,3,4],m:'4:3 2:1 4:4 7:8  5:3 4:1 5:4 9:8  3:3 5:1 7:4 5:4 3:4  4:12 r:4'},
    B:{ch:[3,0,1,4],m:'10:6 9:2 7:8  9:6 7:2 4:8  8:4 5:4 3:4 1:4  4:4 6:4 8:8'}}}),
  // Villa Rossa: passione spagnola, la cadenza andalusa sul liuto
  b_rossa:BSONG({bpm:120,root:64,sc:'phr',ld:'lute',lv:.065,bs:'pulse8',bv:.08,cp:'strum',dr:'tango',dv:.7,parts:{
    A:{ch:[3,2,1,0],m:'7:2 5:2 3:2 5:2 7:4 r:4  6:2 4:2 2:2 4:2 6:4 r:4  5:2 3:2 1:2 3:2 5:4 3:2 2:2  1:4 0:12'},
    B:{ch:[5,1,3,0],m:'9:4 7:4 5:4 7:4  8:6 7:2 5:8  7:2 8:2 7:2 5:2 3:8  1:2 0:2 1:2 0:10'}}}),
  // Villa Ponente: il vento di ponente al tramonto, misolidio e rilassato
  b_ponente:BSONG({bpm:90,root:60,sc:'mix',ld:'flute',lv:.042,echo:1,bs:'walk',bv:.08,cp:'strum',dr:'soft',parts:{
    A:{ch:[0,6,3,0],m:'4:6 2:2 0:4 2:4  1:6 3:2 6:8  5:4 7:4 5:4 3:4  4:12 r:4'},
    B:{ch:[3,6,0,4],m:'10:6 9:2 7:8  8:6 6:2 3:8  7:4 9:4 11:8  6:4 4:4 1:8'}}}),
  // Villa Grigia: malinconica, archi lenti in minore
  b_grigia:BSONG({bpm:66,root:62,sc:'min',ld:'str',lv:.04,echo:1,bs:'long',bv:.07,cp:'pad',form:'AB',parts:{
    A:{ch:[0,5,2,6],m:'4:8 3:4 2:4  2:8 0:8  6:8 4:8  1:12 r:4'},
    B:{ch:[3,0,5,4],m:'7:8 5:4 3:4  4:6 2:2 0:8  5:4 3:4 2:8  1:4 4:12'}}}),
  // Teatro dell'Opera: un'ouverture drammatica, coro, archi e timpani
  b_teatro:BSONG({bpm:84,root:57,sc:'hm',ld:'choir',lv:.05,echo:1,bs:'root',bv:.1,cp:'ens',dr:'timp',dv:.9,form:'AABB',parts:{
    A:{ch:[0,3,4,0],m:'0:4 4:4 7:6 6:2  10:4 9:4 8:4 7:4  6:4 8:4 11:6 10:2  9:8 7:8'},
    B:{ch:[5,1,4,4],m:'12:6 11:2 9:8  10:6 8:2 5:8  11:4 13:4 11:4 8:4  6:8 4:8'}}}),
  // Mulino di Pietro: "il vento gira, la macina gira", arpeggi che girano in tondo
  b_mulino:BSONG({bpm:138,root:65,sc:'maj',spb:12,ld:'flute',lv:.045,bs:'waltz',bv:.07,cp:'waltz arp',dr:'waltz',dv:.6,parts:{
    A:{ch:[0,4,0,4],m:'0:2 2:2 4:2 7:2 4:2 2:2  4:2 6:2 8:2 11:2 8:2 6:2  2:2 4:2 7:2 9:2 7:2 4:2  6:4 4:4 1:4'},
    B:{ch:[3,0,4,0],m:'3:2 5:2 7:2 10:2 7:2 5:2  9:4 7:4 4:4  8:2 6:2 4:2 1:2 4:2 6:2  7:12'}}}),
  // Fienile: una danza di paglia e stivali, banjo veloce
  b_fienile:BSONG({bpm:138,root:62,sc:'maj',ld:'banjo',lv:.05,bs:'walk',bv:.09,cp:'strum',dr:'folk',dv:.9,fill:1,form:'AABB',parts:{
    A:{ch:[0,0,4,0],m:'7:1 6:1 4:2 2:2 4:2 7:2 4:2 2:2 0:2  2:2 4:2 7:2 9:2 7:4 4:4  8:2 6:2 4:2 1:2 4:2 6:2 8:4  7:4 4:4 0:8'},
    B:{ch:[3,0,4,0],m:'3:2 5:2 7:2 10:2 7:2 5:2 3:4  2:2 4:2 7:2 9:2 7:2 4:2 2:4  1:2 4:2 6:2 8:2 6:2 4:2 1:4  0:4 7:4 0:8'}}}),
  // Casa di Teresa: la ballata di chi aspetta una barca all'orizzonte
  b_teresa:BSONG({bpm:96,root:62,sc:'min',spb:12,ld:'whis',lv:.04,echo:1,bs:'long',bv:.07,cp:'arp',parts:{
    A:{ch:[0,5,3,4],m:'4:4 2:2 0:6  5:4 4:2 2:6  3:4 5:2 7:6  6:4 1:2 4:6'},
    B:{ch:[2,6,3,4],m:'9:4 8:2 6:6  8:4 6:2 3:6  5:4 7:2 10:6  8:6 4:6'}}}),
  // Casa di Nonno Marino: sessant'anni di mare in una canzone lenta
  b_marino:BSONG({bpm:108,root:57,sc:'dor',spb:12,ld:'accor',lv:.03,echo:1,bs:'shanty',bv:.09,cp:'strum6',dr:'shanty',dv:.5,parts:{
    A:{ch:[0,6,0,4],m:'0:2 0:2 2:2 4:4 2:2  6:4 1:2 3:4 1:2  4:2 4:2 7:2 9:4 7:2  8:4 6:2 4:6'},
    B:{ch:[3,0,6,0],m:'10:4 9:2 7:6  9:4 7:2 4:6  8:4 6:2 3:6  0:12'}}}),
  // Bottega del Retaio: "nodo dopo nodo", un disegno che si ripete come una rete
  b_retaio:BSONG({bpm:100,root:59,sc:'dor',ld:'marimba',lv:.07,echo:1,bs:'pulse8',bv:.07,cp:'pad',dr:'light',dv:.6,parts:{
    A:{ch:[0,3,0,6],m:'0:2 4:2 2:2 4:2 0:2 4:2 2:2 4:2  3:2 7:2 5:2 7:2 3:2 7:2 5:2 7:2  2:2 7:2 4:2 7:2 2:2 7:2 4:2 9:2  6:4 8:4 10:8'},
    B:{ch:[2,6,3,4],m:'9:4 7:2 6:2 4:8  8:4 6:2 3:2 1:8  7:2 5:2 3:2 5:2 7:4 10:4  8:6 6:2 4:8'}}}),
  // Casa degli Sposi: un valzer di nozze con arpa e campanelle
  b_sposi:BSONG({bpm:126,root:70,sc:'maj',spb:12,ld:'harp',lv:.07,echo:1,bs:'waltz',bv:.07,cp:'waltz bell',dr:'waltz',dv:.5,parts:{
    A:{ch:[0,3,4,0],m:'4:6 2:2 4:2 7:2  5:6 3:2 5:2 7:2  6:4 8:4 6:4  7:12'},
    B:{ch:[5,3,1,4],m:'9:6 8:2 7:4  7:6 5:2 3:4  8:4 5:4 3:4  4:4 6:4 8:4'}}}),
  // Magazzino del Porto: casse pesanti, un canto basso e i tamburi del lavoro
  b_magazzino:BSONG({bpm:92,root:55,sc:'min',ld:'reed',lv:.04,bs:'ostinato',bv:.1,cp:'stab',dr:'tribal',dv:.8,parts:{
    A:{ch:[0,0,5,4],m:'0:4 0:4 2:2 3:2 4:4  4:2 3:2 2:4 0:8  5:4 7:4 9:4 7:4  4:4 6:4 8:8'},
    B:{ch:[3,0,6,4],m:'10:4 9:4 7:8  9:4 7:4 4:8  6:4 8:4 10:8  11:4 8:4 4:8'}}}),
  // Deposito delle Merci: carri che vanno e vengono, un motivo indaffarato
  b_deposito:BSONG({bpm:126,root:62,sc:'mix',ld:'chip',lv:.03,bs:'pulse8',bv:.08,cp:'stab',dr:'rock',dv:.7,fill:1,parts:{
    A:{ch:[0,6,3,0],m:'0:2 2:2 4:2 2:2 7:2 4:2 2:4  6:2 8:2 10:2 8:2 6:4 r:4  3:2 5:2 7:2 10:2 7:2 5:2 3:4  4:4 2:4 0:8'},
    B:{ch:[3,6,0,4],m:'10:4 9:2 7:2 5:8  8:4 6:2 4:2 1:8  2:2 4:2 7:2 9:2 7:8  4:4 6:4 8:8'}}}),
  // Pescheria del Porto: il mercato del pesce, allegro e chiassoso
  b_pescheria:BSONG({bpm:144,root:60,sc:'maj',spb:12,ld:'lute',lv:.06,bs:'shanty',bv:.09,cp:'strum6',dr:'jig',dv:.7,form:'AABB',parts:{
    A:{ch:[0,4,0,4],m:'7:2 4:2 2:2 4:2 7:2 9:2  8:2 6:2 4:2 6:4 1:2  9:2 7:2 4:2 7:2 9:2 11:2  10:4 8:2 4:6'},
    B:{ch:[3,0,1,4],m:'5:2 7:2 10:2 7:2 5:2 3:2  4:2 7:2 9:2 7:4 4:2  8:2 5:2 3:2 1:2 3:2 5:2  6:4 8:2 4:6'}}}),
  // Cantiere Navale: martelli sulle chiglie, ottoni e incudine
  b_cantiere:BSONG({bpm:112,root:60,sc:'dor',ld:'brass',lv:.036,bs:'gallop',bv:.09,cp:'strum',dr:'anvil',dv:.8,fill:1,parts:{
    A:{ch:[0,3,0,6],m:'0:3 0:1 2:4 4:4 2:4  3:3 3:1 5:4 7:4 5:4  4:3 4:1 7:4 9:4 7:4  6:4 8:4 6:8'},
    B:{ch:[4,3,6,0],m:'8:4 6:4 4:8  7:4 5:4 3:8  6:2 8:2 10:4 8:4 6:4  7:6 4:2 0:8'}}}),
  // Faro di Aldoria: solitudine e spazio, campane lontane sopra le onde
  b_faro:BSONG({bpm:60,root:60,sc:'lyd',ld:'bell',lv:.07,echo:1,bs:'long',bv:.07,cp:'pad',dr:'waves',dv:.9,form:'AB',parts:{
    A:{ch:[0,1,0,1],m:'4:8 7:8  8:8 5:8  9:8 7:4 4:4  3:12 r:4'},
    B:{ch:[5,1,6,4],m:'12:8 9:8  10:8 8:8  6:8 8:8  4:12 r:4'}}}),
  // La Rondine, stiva: il legno che scricchiola e la nave che dondola
  b_rondine:BSONG({bpm:100,root:57,sc:'min',spb:12,ld:'reed',lv:.035,echo:1,bs:'shanty',bv:.09,cp:'drone',dr:'shanty',dv:.5,parts:{
    A:{ch:[0,6,5,4],m:'4:4 3:2 2:4 0:2  1:4 3:2 6:6  5:4 7:2 9:4 7:2  8:6 4:6'},
    B:{ch:[2,6,3,0],m:'9:4 7:2 4:6  8:4 6:2 3:6  10:4 7:2 5:6  4:6 0:6'}}}),
  // Panetteria di Gemma: il primo pane alle cinque, una melodia allegra e calda
  b_panetteria:BSONG({bpm:116,root:64,sc:'maj',ld:'flute',lv:.045,bs:'pulse',bv:.07,cp:'strum arp',dr:'light',dv:.7,parts:{
    A:{ch:[0,3,4,0],m:'0:2 2:2 4:2 7:2 4:4 2:4  3:2 5:2 7:2 10:2 7:4 5:4  4:2 6:2 8:2 11:2 8:4 6:4  7:4 9:4 7:8'},
    B:{ch:[5,1,3,4],m:'9:4 7:2 9:2 12:8  8:4 5:2 3:2 1:8  10:4 7:4 5:4 3:4  4:4 6:4 8:4 11:4'}}}),
  // Sartoria di Ottavia: ago, filo e pazienza, un minuetto in minore per clavicembalo
  b_sartoria:BSONG({bpm:100,root:64,sc:'hm',spb:12,ld:'hpsi',lv:.066,bs:'waltz',bv:.06,cp:'waltz',parts:{
    A:{ch:[0,3,4,0],m:'7:2 4:2 2:2 4:2 7:2 9:2  10:4 7:2 5:2 3:4  6:2 8:2 11:2 8:2 6:4  7:12'},
    B:{ch:[5,3,1,4],m:'12:4 11:2 9:2 7:4  10:4 7:4 5:4  8:4 10:4 12:4  11:6 6:6'}}}),
  // Caserma della Guardia: piffero e tamburi, la marcia delle reclute
  b_caserma:BSONG({bpm:120,root:60,sc:'maj',ld:'whis',lv:.04,bs:'root',bv:.09,cp:'stab',dr:'military',dv:1,fill:1,parts:{
    A:{ch:[0,0,4,0],m:'4:3 4:1 4:2 2:2 0:4 4:4  7:4 4:2 2:2 0:8  1:3 1:1 3:2 4:2 6:4 8:4  7:8 0:8'},
    B:{ch:[3,0,1,4],m:'5:3 5:1 5:2 7:2 10:8  9:3 9:1 7:2 4:2 7:8  8:4 5:4 3:4 1:4  4:4 6:4 8:4 11:4'}}}),
  // Scuderia di Aldoria: zoccoli al galoppo e violino di campagna
  b_scuderia:BSONG({bpm:138,root:69,sc:'maj',spb:12,ld:'fiddle',lv:.034,bs:'gallop',bv:.09,cp:'strum6',dr:'gallop',dv:.7,form:'AABB',parts:{
    A:{ch:[0,3,4,0],m:'0:2 2:2 4:2 7:4 4:2  3:2 5:2 7:2 10:4 7:2  4:2 6:2 8:2 11:4 8:2  7:6 0:6'},
    B:{ch:[5,3,1,4],m:'9:2 7:2 5:2 9:4 12:2  10:2 7:2 5:2 3:4 5:2  8:2 5:2 3:2 1:4 3:2  4:4 6:2 8:6'}}}),
  // Osservatorio: le stelle che girano piano, note lunghe e arpeggi lontani
  b_osservatorio:BSONG({bpm:64,root:65,sc:'lyd',ld:'pad',lv:.06,echo:1,bs:'long',bv:.06,cp:'arp bell',form:'AB',parts:{
    A:{ch:[0,1,2,1],m:'7:8 4:8  8:8 5:8  9:8 6:8  10:12 r:4'},
    B:{ch:[5,1,6,0],m:'12:8 9:8  11:8 8:8  13:8 10:8  7:16'}}}),
  // Municipio di Aldoria: l'inno solenne della città, ottoni e timpani
  b_municipio:BSONG({bpm:92,root:63,sc:'maj',ld:'brass',lv:.036,echo:1,bs:'root',bv:.09,cp:'ens',dr:'timp',dv:.7,parts:{
    A:{ch:[0,3,4,0],m:'0:4 2:4 4:6 2:2  3:4 5:4 7:8  4:4 6:4 8:6 6:2  7:12 r:4'},
    B:{ch:[5,1,4,4],m:'9:6 7:2 5:8  10:6 8:2 5:8  11:4 8:4 6:4 4:4  6:8 8:8'}}})});

// quale brano suona in ogni edificio (le stanze di uno stesso edificio condividono la musica)
const BMUS={in_library:'b_biblioteca',lib_archivio:'b_biblioteca',in_tavern:'b_taverna',tav_camere:'b_taverna',in_smith:'b_fucina',in_alch:'b_erbe',
  in_temple:'b_tempio',in_house1:'b_rosa',in_house2:'b_abbandonata',in_house3:'b_gerald',in_casino:'b_casino',casino_vip:'b_casino',in_palazzo:'b_palazzo',
  in_banca:'b_banca',in_fattoria:'b_fattoria',in_segheria:'b_segheria',in_cappella:'b_cappella',in_locanda:'b_locanda',in_capitaneria:'b_capitaneria',
  in_villa1:'b_aurora',in_villa2:'b_smeraldo',in_villa3:'b_iris',in_villa4:'b_rossa',in_villa5:'b_ponente',in_villa6:'b_grigia',in_teatro:'b_teatro',
  in_mulino:'b_mulino',in_fienile:'b_fienile',in_casa_p1:'b_teresa',in_casa_p2:'b_marino',in_casa_p3:'b_retaio',in_casa_p4:'b_sposi',
  in_magazzino1:'b_magazzino',in_magazzino2:'b_deposito',in_pescheria:'b_pescheria',in_cantiere:'b_cantiere',in_faro:'b_faro',in_galeone:'b_rondine',
  in_panetteria:'b_panetteria',in_sartoria:'b_sartoria',in_caserma:'b_caserma',bar_dorm:'b_caserma',in_scuderia:'b_scuderia',
  in_osservatorio:'b_osservatorio',oss_cupola:'b_osservatorio',in_municipio:'b_municipio',mun_piano:'b_municipio'};
for(const k in BMUS)if(Z[k]&&TRK[BMUS[k]])Z[k].mus=BMUS[k];
// anche Voxelia Studio può usarle: compaiono nell'elenco delle musiche delle mappe
for(const k in BMUS){const id=BMUS[k];if(!ETRKN[id]&&Z[k])ETRKN[id]=Z[k].n.split(' · ')[0]}
// e nell'editor dei brani di Voxelia Studio: strumenti, scala, basso e batterie nuove (la batteria personalizzata resta in fondo)
Object.assign(EINS,{harp:'Arpa celtica',organ:'Organo',mbox:'Carillon',lute:'Liuto',hpsi:'Clavicembalo',accor:'Fisarmonica',whis:'Zufolo',choir:'Coro',marimba:'Marimba',fiddle:'Violino',banjo:'Banjo'});
ESCL.mix='Misolidia (solare)';EBASS.tango='Tango';
{const cu=EDRUM.custom;delete EDRUM.custom;Object.assign(EDRUM,{jig:'Giga',anvil:'Incudine',tango:'Tango',clock:'Orologio',saw:'Sega',waves:'Onde del mare',military:'Tamburi militari',gallop:'Zoccoli'});EDRUM.custom=cu}
EDRK.push(['a','Incudine'],['w','Legnetto'],['n','Sega'],['W','Onda']);
