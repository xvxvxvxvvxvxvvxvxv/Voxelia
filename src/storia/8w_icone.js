/* ================= 7.8: icone voxel in tutto il gioco =================
   Le icone a cubetti di Voxelia Studio (EDICO, 12×12) diventano le icone di tutto il gioco:
   menu, pannelli, negozi, casinò, diario, mappa, Mondi della community, pannello sviluppatore.
   Qui ci sono le icone che mancavano e la conversione automatica delle emoji rimaste. */
Object.assign(EDIP,{a:'#9aa8c2',A:'#56627e',z:'#1c2030'});
Object.assign(EDICO,{
  camera:["............","...GGG......",".gggggggggg.",".gGGGGGGGGg.",".gGGbbbbGGg.",".gGbbccbbGg.",".gGbcwcbbGg.",".gGbbccbbGg.",".gGGbbbbGyg.",".gggggggggg.","............","............"],
  rec:["............","............","....rrrr....","...rrrrrr...","..rrpprrrr..","..rprrrrrr..","..rrrrrrrr..","..rrrrrrrR..","...rrrrrR...","....rrrr....","............","............"],
  vcam:["............","..GG..GG....",".GggGGggG...",".GggGGggG...","..GG..GG....",".gggggggg.G.",".gwgggggggGG",".gggggggg.GG",".gggggggggGG",".gggggggg.G.","............","............"],
  tools:[".g.g....aaa.",".ggg...aaaa.","..gg..aaaa..","...gg..ann..","....gg.nn...",".....ggn....",".....nngg...","....nn..gg..","...nn....gg.","..nn.....ggg",".nn......g.g",".n.........."],
  boat:[".....n......",".....nW.....",".....nWW....",".....nWWW...","....WnWWWW..","...WWnWWWWW.","..WWWnWWWWW.",".....n......","nnnnnnnnnnnn",".nNNNNNNNNn.","..nnnnnnnn..","bbbbbbbbbbbb"],
  anchor:[".....aa.....","....a..a....",".....aa.....","..aaaaaaaa..",".....aa.....",".....aa.....",".....aa.....","a....aa....a","aa...aa...aa",".aa..aa..aa.","..aaaaaaaa..","....aaaa...."],
  user:["....nnnn....","...nnnnnn...","...nssssn...","...ssssss...","....ssss....",".....ss.....","..bbbbbbbb..",".bbbbbbbbbb.",".bbbbbbbbbb.",".bbbbbbbbbb.",".BBBBBBBBBB.","............"],
  sunrise:["............","..y..yy..y..","...y....y...","....oooo....","...oyyyyo...","..oyywyyyo..","mmmmmmmmmmmm","bbbbbbbbbbbb",".cccc..cccc.","bbbbbbbbbbbb","..cccc..ccc.","bbbbbbbbbbbb"],
  sunset:["............","....oooo....","...ommmmo...","..ommmmmmo..",".mmmmmmmmmm.","GG.GGG..GGG.","GGyGGGG.GyG.","GGGGyGGGGGG.","GyGGGGGyGGGG","GGGGGGGGGGGG","GGGyGGGGGyGG","GGGGGGGGGGGG"],
  heal:["............","....eeee....","....elle....","....elle....",".eeeelleeee.",".elllllllle.",".elllllllle.",".eeeelleeee.","....elle....","....elle....","....eeee....","............"],
  hglass:[".nnnnnnnnnn.","..cccccccc..","..c.yyyy.c..","...c.yy.c...","....c..c....",".....cc.....","....c..c....","...c.yy.c...","..c.yyyy.c..","..cyyyyyyc..","..cccccccc..",".nnnnnnnnnn."],
  shake:["............","............","ss........SS","sss......SSS","ssss.SSSSSSS","sssssSSsSSSS",".ssssSssSSS.","..sssSsSSS..","...sssSSS...","....sssS....","............","............"],
  tag:["......oooooo",".....oyyyyyo","....oyyyykyo","...oyyyyyyyo","..oyyyyyyyo.",".oyyyyyyyo..","oyyyyyyyo...",".oyyyyyo....","..oyyyo.....","...oyo......","....o.......","............"],
  finish:[".Gkwkwkwkw..",".Gwkwkwkwk..",".Gkwkwkwkw..",".Gwkwkwkwk..",".Gkwkwkwkw..",".G..........",".G..........",".G..........",".G..........",".G..........",".G..........","GGG........."],
  hat:["............","............","....nnnn....","...nnnnnn...","...nnnnnn...","...NNNNNN...","nn.nnnnnn.nn","nnnnnnnnnnnn",".nnnnnnnnnn.","..NNNNNNNN..","............","............"],
  tophat:["............","...zzzzzz...","...zxxxxz...","...zxxxxz...","...zxxxxz...","...zxxxxz...","...rrrrrr...","...zxxxxz...","zzzzzzzzzzzz",".zzzzzzzzzz.","............","............"],
  armor:["............","..aa....aa..",".aaaa..aaaa.",".aAaaaaaaAa.",".aAaaaaaaAa.","..aaaaaaaa..","..aAaaaaAa..","..aaaaaaaa..","..aAaaaaAa..","..aaaaaaaa..","...aaaaaa...","............"],
  chain:[".aa.........","a..a........","a..a........",".aAaa.......","...a..a.....","...a..a.....","....aaAaa...",".......a..a.",".......a..a.","........aa..","............","............"],
  castle:["g.g.g..g.g.g","ggggg..ggggg","ggGgg..ggGgg","gggggggggggg","gggg.gg.gggg","gggggggggggg","ggg..gg..ggg","ggg.nnnn.ggg","gggnnnnnnggg","gggnnnnnnggg","gggnnnnnnggg","GGGGGGGGGGGG"],
  fog:["............",".WWWWWWW....","............","...WWWWWWWW.","............",".WWWWWWWWW..","............","....WWWWWWW.","............",".WWWWWW.....","............","............"],
  cloud:["............","............","....WWW.....","...WWWWW....","..WWWWWWWW..",".WWWWWWWWWW.","WWWWWWWWWWWW","WWWWWWWWWWWW",".gggggggggg.","............","............","............"],
  rain:["....WWW.....","...WWWWW....","..WWWWWWWW..",".WWWWWWWWWW.","WWWWWWWWWWWW",".gggggggggg.","............",".b...b...b..",".b...b...b..","...b...b...b","...b...b...b","............"],
  cherry:[".......E....","......EEe...",".....E..e...","....E....e..","...E.....e..","..E......e..",".rrr....rrr.","rrwrr..rwrrr","rrrrr..rrrrr","rrrrR..rrrrR",".rrr....rrr.","............"],
  lemon:["............","............","..yyyyyyy...",".yywyyyyyy..","yywyyyyyyyy.","yyyyyyyyyyyo","yyyyyyyyyyy.",".yyyyyyyyy..","..yyyyyyy...","............","............","............"],
  bell:[".....oo.....","....yyyy....","...yywyyy...","...ywyyyy...","...yyyyyy...","..yyyyyyyy..","..yyyyyyyy..",".yyyyyyyyyy.","oooooooooooo",".....nn.....","............","............"],
  card:["..WWWWWWW...","..WrWWWWW...","..WWWWWWW...","..WWWrWWW...","..WWrrrWW...","..WrrrrrW...","..WWrrrWW...","..WWWrWWW...","..WWWWWWW...","..WWWWWrW...","..WWWWWWW...","............"],
  cardb:[".WWWWWWWWW..",".WrrrrrrrW..",".WrRrRrRrW..",".WrrrrrrrW..",".WRrRrRrRW..",".WrrrrrrrW..",".WrRrRrRrW..",".WrrrrrrrW..",".WRrRrRrRW..",".WrrrrrrrW..",".WWWWWWWWW..","............"],
  pistol:["............","............","gggggggggggg","gGGGGGGGGGgg","gggggggggggg",".nnnngg.....",".nnnn.g.....",".nnnn.g.....","nnnn........","nnnn........","NNNN........","............"],
  horn:["............","..........o.",".........oyo","........oyyo",".......oyyyo",".ooooooyyyyo","oyyyyyyyyyyo",".ooooooyyyyo",".......oyyyo","........oyyo",".........oyo","..........o."],
  bag:["....nnnn....","...n....n...","...n....n...",".mmmmmmmmmm.",".mmmmmmmmmm.",".mmwmmmmmmm.",".mwmmmmmmmm.",".mmmmmmmmmm.",".mmmmmmmmmm.",".mmmmmmmmmm.",".OOOOOOOOOO.","............"],
  galaxy:["............","..v.....w...","....vvv.....","..vvccvvv...",".vvcwwcvvv..",".vcwwwwcvv.w","..vvcwwcvvv.","...vvvccvv..",".w...vvvv...",".......v....","...w......w.","............"],
  barrier:["............",".n........n.","yykkyykkyykk","kyykkyykkyyk",".n........n.",".n........n.","yykkyykkyykk","kyykkyykkyyk",".n........n.",".n........n.","nnn......nnn","............"],
  ruin:["............",".....R......","....RrR.....","...Rrr.R....","..Rrr...R...",".RRR.....R..",".tttt.ttt...",".tcct..tt...",".tttt.ttt...",".ttt.nnttt..",".tttnnnttt..",".NNNNNNNNNN."],
  pine:[".....EE.....","....EeeE....","...EeeeeE...","....EeeE....","...EeeeeE...","..EeeeeeeE..","...EeeeeE...","..EeeeeeeE..",".EeeeeeeeeE.",".....nn.....",".....nn.....","....NNNN...."],
  desert:["............",".........yy.","........yyyy",".........yy.","............","..e.........",".eee........","..e.e.......","..eee..ttt..","..e...ttttt.","tttttttttttt","tttttttttttt"],
  mount:["............",".....WW.....","....WWWW....","...WWggWW...","...gggggg...","..ggGgggGg..","..gGgggggg..",".ggggGggggg.",".gGggggggGg.","ggggggGggggg","gGggggggggGg","GGGGGGGGGGGG"],
  log:["............","............","............",".nnnnnnntttt","nnNnnnnnttSt","nnnnnnNntSSt","nNnnnnnnttSt",".nnnnnnntttt","............","............","............","............"],
  medal:["..rr....bb..","...rr..bb...","....rrbb....",".....rb.....","....oooo....","...oyyyyo...","..oyywyyyo..","..oyyyyyyo..","..oyyyyyyo..","...oyyyyo...","....oooo....","............"],
  unlock:["...gggg.....","..g....g....","..g....g....","..g.........","..g.........",".oooooooooo.",".oyyyyyyyyo.",".oyyykkyyyo.",".oyyykkyyyo.",".oyyyykyyyo.",".oyyyyyyyyo.",".oooooooooo."],
  trident:[".y...y...y..",".y...y...y..",".yy..y..yy..","..yyyyyyy...",".....y......",".....y......",".....n......",".....n......",".....n......",".....n......",".....n......",".....n......"],
  bow:["...n........","...Wn.......","...W.n......","...W..n.....","...W..n.....","WgggggnggggO","...W..n.....","...W..n.....","...W.n......","...Wn.......","...n........","............"],
  horse:["............",".....nn.....","....nnnn....","...nnnnnN...","..nnknnnNN..",".nnnnnnnNN..","nnnnnnnnNN..","nnn..nnnNN..",".....nnnNN..",".....nnnnN..",".....nnnnn..","............"],
  wflag:[".nWWWWW.....",".nWWWWWWW...",".nWWWWWWWW..",".nWWWWWWW...",".nWWWWW.....",".n..........",".n..........",".n..........",".n..........",".n..........",".n..........","nnn........."],
  beer:["............","..WWWWWW....",".WWWWWWWW...",".oyyyyyyo...",".oyyyyyyoo..",".oyywyyyo.o.",".oyywyyyo.o.",".oyyyyyyo.o.",".oyyyyyyoo..",".oyyyyyyo...",".oooooooo...","............"],
  picture:["............","nnnnnnnnnnnn","ncccccccyycn","ncccccccyycn","nccceccccccn","ncceeeccccen","nceeeeeccEen","neeeeeeeEEen","nEEEEEEEEEEn","nnnnnnnnnnnn","............","............"],
  party:["..y......p..",".....r......","..b.....y...",".......r..b.","...p.y......","mm.......r..","mmmm...b....","myymmm......","mmyyymmm....","mmmmyyyyy...","mmmmmmmyyy..","............"],
  pick:["...gggggg...",".ggg....ggg.","gg...nn...gg","g...nn.....g","...nn.......","..nn........",".nn.........","nn..........","n...........","............","............","............"],
  empty:["............",".gggggggggg.",".g........g.",".g........g.",".g........g.",".g........g.",".g........g.",".g........g.",".g........g.",".g........g.",".gggggggggg.","............"],
  seven:["............",".rrrrrrrrr..",".rRRRRRRrr..",".......rr...","......rr....",".....rr.....",".....rr.....","....rr......","....rr......","....RR......","............","............"],
  slot:["..rrrrrrrr..",".rRRRRRRRRr.",".rwwwwwwwwrg",".rwrwyweewrg",".rwwwwwwwwrg",".rrrrrrrrrrg",".rRyyRRRRRrG",".rrrrrrrrrr.",".rRRRRRRRRr.",".rrrrrrrrrr.",".RR......RR.","............"],
  roul:["....nnnn....","..nnrzrznn..",".nzrzrzrzrn.",".nrzeeeezrn.","nzrzeyyezrzn","nrzeyyyyezrn","nzrzeyyezrzn",".nrzeeeezrn.",".nzrzrzrzrn.","..nnrzrznn..","....nnnn....","............"],
  zzz:["............","......aaaaa.","........aa..",".......aa...","......aaaaa.","aaaa........","..a.........",".a..........","aaaa........","............","............","............"]
});
(function(){const sw=(R,m)=>R.map(r=>[...r].map(c=>m[c]||c).join(''));
  Object.assign(EDICO,{medal2:sw(EDICO.medal,{y:'W',o:'g',w:'w'}),medal3:sw(EDICO.medal,{y:'m',o:'O'}),
    eyeoff:EDICO.eye.map((r,y)=>[...r].map((c,x)=>Math.abs(x-y)<1||x===y+1?'r':c).join('')),
    hhelm:sw(EDICO.helmet,{W:'E',k:'G'})})})();
Object.assign(EDEM,{'🌐':'globe','❤':'heart','🤍':'heartw','🏆':'trophy','👁':'eye','🙈':'eyeoff','📷':'camera','⏺':'rec','🎥':'vcam','🛠':'tools',
  '⛵':'boat','⚓':'anchor','👤':'user','👥':'users','💥':'boom','🌀':'portal','☀':'sun','🌅':'sunrise','🌇':'sunset','☾':'moon','🌑':'moonn',
  '✚':'heal','🎒':'pack','🧳':'pack','⏳':'hglass','🤝':'shake','🎯':'target','🏷':'tag','🏁':'finish','🤠':'hat','🎩':'tophat','🥋':'armor',
  '⛓':'chain','🏰':'castle','🖥':'monitor','🎮':'pad','🎞':'film','🌫':'fog','☁':'cloud','🌧':'rain','🍒':'cherry','🍋':'lemon','🔔':'bell',
  '🃏':'card','🂠':'cardb','🔫':'pistol','📯':'horn','🛍':'bag','🌌':'galaxy','🚧':'barrier','🏚':'ruin','🌲':'pine','🏜':'desert','🏔':'mount',
  '🪵':'log','🐟':'fish','🥇':'medal','🥈':'medal2','🥉':'medal3','🪖':'hhelm','🗡':'dagger','🔓':'unlock','🔱':'trident','🏹':'bow','🐎':'horse',
  '🏳':'wflag','🍺':'beer','🖼':'picture','🎉':'party','⛏':'pick','◻':'empty','↩':'undo','🔄':'rotr','🔁':'rotr','⤢':'fit','◎':'pin','💤':'zzz','7️⃣':'seven','💪':'muscle','🎰':'slot','🛞':'roul'});
EDEMR=new RegExp('('+Object.keys(EDEM).sort((a,b)=>b.length-a.length).map(k=>k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|')+')\\uFE0F?\\s?','gu');

// tutto il documento: ogni emoji dell'interfaccia diventa la sua icona voxel (la chat dei giocatori e i testi scritti dai giocatori restano com'erano)
(function(){const go=()=>{document.body.classList.add('vxi');edIcoWatch(document.body)};if(document.body)go();else addEventListener('DOMContentLoaded',go)})();

// testi disegnati sul canvas (numeri che volano, scritte sopra i personaggi): emoji → icona
const VIQ=new Map();
function vxSeg(s){let r=VIQ.get(s);if(r)return r;r=[];EDEMR.lastIndex=0;let last=0;String(s).replace(EDEMR,(m,k,off)=>{if(off>last)r.push(s.slice(last,off));r.push({i:EDEM[k]});if(/\s$/.test(m))r.push(' ');last=off+m.length;return m});if(last<s.length)r.push(s.slice(last));if(VIQ.size>400)VIQ.clear();VIQ.set(s,r);return r}
function vxText(s,x,y,fill,stroke){const sg=vxSeg(s);if(sg.length===1&&typeof sg[0]==='string'){if(stroke)g.strokeText(s,x,y);g.fillText(s,x,y);return}
  const fs=parseFloat(/(\d+(\.\d+)?)px/.exec(g.font)?.[1]||12),is=Math.round(fs*1.15),al=g.textAlign;let w=0;for(const p of sg)w+=typeof p==='string'?g.measureText(p).width:is+1;
  let cx=al==='center'?x-w/2:al==='right'||al==='end'?x-w:x;g.textAlign='left';
  for(const p of sg){if(typeof p==='string'){if(stroke)g.strokeText(p,cx,y);g.fillText(p,cx,y);cx+=g.measureText(p).width}else{const c=edIcoC(p.i);if(c)g.drawImage(c,cx,y-is*.86,is,is);cx+=is+1}}g.textAlign=al}
