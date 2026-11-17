/* ================= 8.14: I FILMATI NELLO STILE CLASSICO, E IL PROLOGO RIFATTO DA CAPO =================
   - Via il filtro «scene disegnate» (il quadro in pixel art con il riquadro del testo): i filmati si vedono a tutto
     schermo, con la grafica voxel del gioco, le bande nere del cinema e il testo sotto. Via anche le patine colorate
     (il seppia dei ricordi, l'alone viola delle visioni): la luce di una scena è quella del luogo e dell'ora.
   - Via i due filmati di Voxelia Dimension (la modalità non c'è più dalla 8.4).
   - IL PROLOGO è girato da capo, tutto nei luoghi veri del gioco e con i suoi personaggi: la piazza di Aldoria al
     mattino, la sala del trono (il Primo Re e la Corona, i due fratelli da bambini, Malakar di notte davanti alla
     Corona), il quartiere vecchio nella notte della nebbia, il cortile del castello quando la Corona va in pezzi, le
     schegge che cadono nei boschi, nelle sabbie e tra i ghiacci, il cancello murato, e l'eroe che arriva in città. */
for(const k in FILMS)for(const s of FILMS[k].L){delete s.sepia;delete s.vis}
delete FILMS.dim_inizio;delete FILMS.dim_fine;
// una scheggia che cade dal cielo e si pianta per terra (x,y in caselle; c il colore; ti il momento dell'impatto)
function f814Shard(x,y,lt,c,ti){const rgb=rgbOf(c);if(lt<ti){const k=lt/ti,z=520*(1-k)*(1-k),ox=(1-k)*5;
    for(let i=1;i<9;i++)fGlow(x+ox+i*.22*(1-k),y-i*.1,z+i*26,rgb,16-i,.5*(1-i/9));box(x+ox-.12,y-.12,z,.24,.24,16,c,1.6);fGlow(x+ox,y,z+8,rgb,34,.8)}
  else{const u=lt-ti,r=fSmooth(u/.7);box(x-.14,y-.14,0,.28,.28,13,c,1.5+Math.sin(lt*4)*.2);box(x-.07,y-.07,13,.14,.14,6,'#ffffff',1.6);fGlow(x,y,10,rgb,46+Math.sin(lt*3)*6,.75);
    if(r<1){g.save();g.globalAlpha=(1-r)*.8;g.strokeStyle=c;g.lineWidth=3;g.beginPath();g.ellipse(PX(x,y),PY(x,y,0),r*120,r*60,0,0,6.3);g.stroke();g.restore()}
    for(let i=0;i<8;i++){const a=i*.785+1,v=u*2.2;if(v<2.2)box(x+Math.cos(a)*v-.05,y+Math.sin(a)*v-.05,Math.max(0,30*u-60*u*u+8),.1,.1,2,i%2?c:'#ffffff',1.4)}}}
// le sei schegge che attraversano il cielo (sullo schermo): partono dal castello e vanno ognuna per la sua strada
function f814Sky(lt,t0){const u=lt-t0;if(u<0)return;const cx=W*.5,cy=H*.3;g.save();g.globalCompositeOperation='lighter';g.lineCap='round';
  for(let i=0;i<6;i++){const a=-2.75+i*.47,k=fSmooth(u/5.5),L=Math.max(W,H)*.5*k,x1=cx+Math.cos(a)*L,y1=cy+Math.sin(a)*L*.55-k*k*H*.12,x0=cx+Math.cos(a)*L*.3,y0=cy+Math.sin(a)*L*.55*.3-k*k*H*.03,al=Math.min(1,u*2)*(1-fSmooth((u-4.6)/1.6));
    const gr=g.createLinearGradient(x0,y0,x1,y1);gr.addColorStop(0,'rgba('+rgbOf(FCOL[i])+',0)');gr.addColorStop(1,'rgba('+rgbOf(FCOL[i])+','+al+')');g.strokeStyle=gr;g.lineWidth=7;g.beginPath();g.moveTo(x0,y0);g.lineTo(x1,y1);g.stroke();
    g.fillStyle='rgba(255,255,255,'+al+')';g.beginPath();g.arc(x1,y1,4,0,6.3);g.fill()}g.restore()}
// la Corona che fluttua (nella sala del trono): le sei gemme le girano intorno
function f814Crown(x,y,z,lt,s,gems,ped){if(ped){box(x-.36,y-.36,0,.72,.72,z-3,'#6a4a2a');box(x-.44,y-.44,z-3,.88,.88,2,'#8a6a3a')}const zz=z+(ped?0:Math.sin(lt*1.6)*2),HZ=2.6;
  for(const b of fCrownL(0,FCOL,s||1,0))box(x+b[0],y+b[1],zz+b[2]*HZ,b[3],b[4],b[5]*HZ,b[6],b[7]);fGlow(x,y,zz+12,'255,225,150',60,.45);
  if(gems)for(let i=0;i<6;i++){const a=lt*.9+i*1.047,r=1.25;fGlow(x+Math.cos(a)*r,y+Math.sin(a)*r,zz+12+Math.sin(lt*2+i)*4,rgbOf(FCOL[i]),14,.8)}}
FILMS.prologo={n:'Il Regno Perduto · prologo',mus:'pr_saga',L:[
  // 1. la piazza di Aldoria, al mattino
  {d:9.5,st:'town',mus:'pr_saga',cam:[[36.5,47.5,.92],[36.5,41,1.1]],
    tx:'Aldoria ha le mura bianche e mille anni di mercati, di campane e di pane caldo. Chi ci nasce pensa che durerà per sempre.',
    act:[fA('b1',{n:'bimbo1',go:[[30.5,44.5],[36.5,42.5],[42.5,44.5]],v:2.4,t0:.6}),fA('b2',{n:'bimbo2',go:[[29.5,45.5],[36.5,43.5],[41.5,45.5]],v:2.3,t0:1.3}),
      fA('gi',{n:'giardiniere',go:[[41.5,40.5],[37.5,40.5]],v:.9,t0:.4}),fA('fi',{n:'mv_fiori',go:[[32.5,41.5],[35.5,41.5]],v:.8,t0:1})]},
  // 2. la sala del trono: il Primo Re e la Corona
  {d:9,st:'in_castle',drop:['*'],mus:'pr_saga',cam:[[7.5,8.5,1.25],[7.5,6,1.6]],
    tx:'La fondò Aldric il Primo. Per tenere insieme sei terre lontane forgiò una corona con sei gemme, una per terra: la Corona di Voxel.',
    act:[fA('pri',{n:'aldric_primo',p:[7.5,3.6],f:'S'})],fx:lt=>f814Crown(7.5,5.6,30,lt,1.3,1)},
  // 3. mille anni dopo: i due fratelli da bambini
  {d:9,st:'in_castle',drop:['*'],mus:'pr_saga',cam:[[7.5,11.5,1.3],[7.5,7.5,1.5]],
    tx:'Mille anni dopo, sotto quella corona crebbero due fratelli. Aldric voleva regnare. Malakar voleva capire.',
    act:[fA('ak',{n:'aldric_k',go:[[5.5,13.2],[5.5,6.6],[6.6,5.4]],v:1.9,t0:.4}),fA('mk',{n:'malakar_k',go:[[9.5,13.4],[9.5,8.6]],v:1.05,t0:.8,f:'N'})],fx:lt=>f814Crown(7.5,4.4,19,lt,1,0,1)},
  // 4. Malakar, di notte, davanti alla Corona
  {d:9,st:'in_castle',drop:['*'],mus:'pr_ombra',cam:[[7.5,8,1.45],[7.5,5.6,1.9]],tint:'rgba(6,8,34,.42)',
    tx:'Da grande, Malakar passava le notti nella sala vuota, davanti alla Corona, con i libri del Primo Re. Che cosa cercasse, non lo disse a nessuno.',
    act:[fA('mal',{n:'malakar_p',go:[[7.5,10],[7.5,5.8]],v:.7,t0:.5,f:'N'})],fx:lt=>{f814Crown(7.5,4.4,19,lt,1,0,1);fMotes(7.5,4.4,lt,8,'#c46bff',1.1,60)}},
  // 5. la notte della nebbia, nel quartiere vecchio
  {d:9,st:'vecchia',night:.85,fog:.9,fire:.5,mus:'pr_ombra',cam:[[85,20.5,1.15],[80.5,20.5,1.3]],shake:lt=>lt>2&&lt<3?2:0,
    tx:'Poi venne la notte della nebbia. Salì da sotto il quartiere vecchio, e chi poté scappò senza voltarsi.',
    act:[fA('f1',{n:'fuggiasca',go:[[90.5,20.5],[73.5,20.5]],v:2.5,t0:.3}),fA('f2',{n:'bimbo2',go:[[91.5,21.3],[74.5,21.3]],v:2.6,t0:.9}),fA('f3',{n:'fuggiasco',go:[[92.5,20.4],[75.5,20.4]],v:2.3,t0:1.8}),
      fA('f4',{n:'muratore',go:[[93.5,21.4],[76.5,21.4]],v:2.2,t0:2.6}),fA('f5',{n:'bimbo1',go:[[94.5,20.6],[77.5,20.6]],v:2.7,t0:3.4})]},
  // 6. il cortile del castello: la Corona va in pezzi
  {d:9,st:'town',night:.9,mus:'pr_ombra',cam:[[8.5,19,.95],[8.5,16,1.1]],shake:lt=>lt>2.4&&lt<3.6?6:0,flash:lt=>lt>2.4&&lt<3.4?1-(lt-2.4):0,over:lt=>f814Sky(lt,2.5),
    tx:'Quella stessa notte, sopra il castello, la Corona andò in pezzi. Sei schegge di luce attraversarono il cielo.',
    act:[fA('r1',{n:'ronda',go:[[11.5,19.5],[9.5,17.2]],v:1.6,t0:3.4,f:'N'}),fA('r2',{n:'ronda',go:[[5.5,19.8],[7.4,17.4]],v:1.6,t0:3.9,f:'N'})]},
  // 7-9. le schegge cadono lontano
  {d:4.4,st:'forest',night:.55,mus:'pr_ombra',cam:[[24.5,26.5,1.05],[24.5,25.8,1.25]],tx:'Una cadde nei boschi…',fx:lt=>f814Shard(24.5,25.5,lt,FCOL[0],1.5),shake:lt=>lt>1.5&&lt<1.9?4:0},
  {d:4.4,st:'desert',night:.5,mus:'pr_ombra',cam:[[44.5,45.5,1.05],[44.5,44.8,1.25]],tx:'…una nelle sabbie di Khem…',fx:lt=>f814Shard(44.5,44.5,lt,FCOL[2],1.5),shake:lt=>lt>1.5&&lt<1.9?4:0},
  {d:6.2,st:'peaks',night:.5,mus:'pr_ombra',cam:[[25.5,28.5,1.05],[25.5,27.8,1.25]],tx:'…una tra i ghiacci. Sei in tutto: e ognuna trovò un padrone che non voleva restituirla.',fx:lt=>f814Shard(25.5,27.5,lt,FCOL[3],1.5),shake:lt=>lt>1.5&&lt<1.9?4:0},
  // 10. il cancello murato
  {d:9.5,st:'town',dusk:.55,mus:'pr_ombra',cam:[[6.5,52.5,1.2],[4.8,52.4,1.5]],
    tx:'Al mattino il Re fece murare il quartiere vecchio. Disse che era stato suo fratello: e da allora Malakar ha un altro nome, il Re Lich.',
    act:[fA('re',{n:'aldric_y',go:[[9.5,52.6],[6.6,52.6]],v:.8,t0:.4,f:'W'}),fA('g1',{n:'ronda',p:[4.4,51.2],f:'E'}),fA('g2',{n:'ronda',p:[4.4,53.6],f:'E'}),
      fA('mu',{n:'muratore',p:[3.02,52.15],f:'W',an:'hammer'}),fA('wall',{L:lt=>fWallUp(lt*.85),p:[1.3,53.6],noshadow:1})]},
  // 11. oggi: l'eroe arriva in città
  {d:11.5,st:'town',dusk:.3,mus:'pr_alba',cam:[[36.5,52,1.05],[36.5,45.5,1.4]],title:'VOXELIA',sub:'Il Regno Perduto',big:1,tt:4.6,
    tx:'Oggi le campane suonano ancora, ma il Re cerca qualcuno che riporti a casa le sei schegge. Stamattina, dalla strada del sud, sei arrivato tu.',
    act:[fA('hero',{hero:1,go:[[36.5,56.5],[36.5,46]],v:1.25,t0:.4}),fA('ar',{n:'araldo',p:[38.5,45.5],f:'hero'})]}]};
T88('Aldoria ha le mura bianche e mille anni di mercati, di campane e di pane caldo. Chi ci nasce pensa che durerà per sempre.','Aldoria has white walls and a thousand years of markets, bells and warm bread. Those born here think it will last forever.');
T88('La fondò Aldric il Primo. Per tenere insieme sei terre lontane forgiò una corona con sei gemme, una per terra: la Corona di Voxel.','Aldric the First founded it. To hold six distant lands together he forged a crown with six gems, one for each land: the Crown of Voxel.');
T88('Mille anni dopo, sotto quella corona crebbero due fratelli. Aldric voleva regnare. Malakar voleva capire.','A thousand years later, two brothers grew up beneath that crown. Aldric wanted to rule. Malakar wanted to understand.');
T88('Da grande, Malakar passava le notti nella sala vuota, davanti alla Corona, con i libri del Primo Re. Che cosa cercasse, non lo disse a nessuno.','As a grown man, Malakar spent his nights in the empty hall, before the Crown, with the books of the First King. What he was looking for, he told no one.');
T88('Poi venne la notte della nebbia. Salì da sotto il quartiere vecchio, e chi poté scappò senza voltarsi.','Then came the night of the fog. It rose from beneath the old quarter, and those who could ran without looking back.');
T88('Quella stessa notte, sopra il castello, la Corona andò in pezzi. Sei schegge di luce attraversarono il cielo.','That same night, above the castle, the Crown shattered. Six splinters of light crossed the sky.');
T88('Una cadde nei boschi…','One fell in the woods…');T88('…una nelle sabbie di Khem…','…one in the sands of Khem…');
T88('…una tra i ghiacci. Sei in tutto: e ognuna trovò un padrone che non voleva restituirla.','…one among the ice. Six in all: and each found a master who would not give it back.');
T88('Al mattino il Re fece murare il quartiere vecchio. Disse che era stato suo fratello: e da allora Malakar ha un altro nome, il Re Lich.','In the morning the King had the old quarter walled up. He said it had been his brother: and since then Malakar has had another name, the Lich King.');
T88('Oggi le campane suonano ancora, ma il Re cerca qualcuno che riporti a casa le sei schegge. Stamattina, dalla strada del sud, sei arrivato tu.','Today the bells still ring, but the King is looking for someone to bring the six splinters home. This morning, by the southern road, you arrived.');

/* ================= 8.14: PANNELLO SVILUPPATORE — «🧪 Partita di prova» =================
   Una scheda per avviare una partita di prova già pronta, scegliendo tutto prima di partire: la difficoltà, il livello,
   l'oro, la fase della storia, i frammenti, l'equipaggiamento, l'invincibilità, il combattimento e la zona di partenza.
   È una partita a parte: non si salva e non tocca il salvataggio vero (come le altre partite di prova del pannello).
   Tre partenze già fatte: «Eroe nuovo», «A metà storia», «Fine del gioco». Con la partita avviata, dalla stessa scheda
   si cura l'eroe, si cambia zona, si ricomincia con le stesse scelte o si chiude la prova. */
const DVT={df:1,lv:10,g:2000,pot:10,st:0,sh:0,leg:0,god:0,act:1,z:'town'};
const DVTP={nuovo:{df:1,lv:1,g:0,pot:3,st:0,sh:0,leg:0,god:0,z:'town'},meta:{df:1,lv:18,g:8000,pot:15,st:1,sh:3,leg:0,god:0,z:'town'},fine:{df:2,lv:45,g:100000,pot:40,st:5,sh:6,leg:1,god:0,z:'town'}};
function dvtZones(){const L=[['town','Aldoria'],['forest','Bosco'],['desert','Deserto'],['peaks','Vette'],['tana@1','Tana dei Goblin'],['cripta@1','Cripta'],['piramide@1','Piramide'],['cristallo@1','Caverne di Cristallo'],['fucina@1','Fucina'],['abisso@1','Abisso'],['in_castle','Sala del trono'],['vecchia','Aldoria Vecchia'],['eldora88','Eldora']];
  return L.filter(([k])=>Z[k]||(typeof zd==='function'&&(()=>{try{return zd(k)}catch(e){return null}})()))}
function dvtStart(){devClose();if(started)toMenu();const o=DVT;DEV.sess=1;devMark();const rc=$('rc'),rv=rc?rc.value:'';if(rc)rc.value='';const tv=LS.get('voxelia_tour',0);LS.set('voxelia_tour',1);const f0=SET.film;SET.film=0;
  try{begin(o.df,null)}finally{if(rc)rc.value=rv;if(!tv)LS.del('voxelia_tour');SET.film=f0}if(!started)return;if(typeof tourEnd==='function')try{tourEnd()}catch(e){}try{cl();cineOff()}catch(e){}
  P.lv=Math.max(1,o.lv|0);P.xp=0;P.g=o.g|0;P.pot=o.pot|0;P.st=o.st|0;P.sh=SHARDS.slice(0,o.sh|0);if(P.st===1&&P.sh.length>=6)P.st=2;
  if(o.leg)try{devItem()}catch(e){}recalc();P.hp=P.mx;DEV.god=o.god?1:0;SET.act=o.act?1:0;try{npcMarks()}catch(e){}hud();
  if(o.z&&o.z!=='town')try{load(o.z,'town')}catch(e){msg('⚠ '+e.message);load('town')}
  msg('🧪 Partita di prova: livello '+P.lv+', '+DFS[o.df].n+'. Non si salva.')}
function dvtBody(){const o=DVT,st=['0 · Il Re ti aspetta','1 · Cerca i frammenti','2 · Frammenti trovati','3 · Verso la Cittadella','4 · Malakar sconfitto','5 · Campione di Aldoria'],
    num=(k,min,max,step)=>`<input type="number" min="${min}" max="${max}" step="${step||1}" value="${o[k]}" style="width:110px" onchange="DVT.${k}=Math.max(${min},Math.min(${max},+this.value||0));devRender()">`,
    chk=k=>`<input type="checkbox" ${o[k]?'checked':''} onchange="DVT.${k}=this.checked?1:0">`;
  let h=`<p class="mu">Una partita <b>a parte</b>, già pronta come la vuoi: non si salva e non tocca il tuo salvataggio. Serve per provare e controllare tutto.</p>
  <div class="dvr"><span>Partenze già fatte</span><span><button onclick="Object.assign(DVT,DVTP.nuovo);devRender()">🌱 Eroe nuovo</button><button onclick="Object.assign(DVT,DVTP.meta);devRender()">⚔ A metà storia</button><button onclick="Object.assign(DVT,DVTP.fine);devRender()">👑 Fine del gioco</button></span></div>
  <div class="dvr"><span>Difficoltà</span><select onchange="DVT.df=+this.value">${DFS.map((d,i)=>`<option value="${i}"${o.df===i?' selected':''}>${esc(d.n)}</option>`).join('')}</select></div>
  <div class="dvr"><span>Livello</span>${num('lv',1,99)}</div><div class="dvr"><span>Oro</span>${num('g',0,9999999,500)}</div><div class="dvr"><span>Pozioni</span>${num('pot',0,99)}</div>
  <div class="dvr"><span>Fase della storia</span><select onchange="DVT.st=+this.value">${st.map((n,i)=>`<option value="${i}"${o.st===i?' selected':''}>${n}</option>`).join('')}</select></div>
  <div class="dvr"><span>Frammenti già trovati</span><select onchange="DVT.sh=+this.value">${[0,1,2,3,4,5,6].map(i=>`<option value="${i}"${o.sh===i?' selected':''}>${i} su 6</option>`).join('')}</select></div>
  <div class="dvr"><span>Arma leggendaria</span>${chk('leg')}</div><div class="dvr"><span>Invincibile</span>${chk('god')}</div>
  <div class="dvr"><span>Combattimento d'azione (senza spunta: classico)</span>${chk('act')}</div>
  <div class="dvr"><span>Si parte da</span><select onchange="DVT.z=this.value">${dvtZones().map(([k,n])=>`<option value="${k}"${o.z===k?' selected':''}>${esc(n)}</option>`).join('')}</select></div>
  <div class="dvr"><span><b>${DEV.sess&&started?'Ricomincia con queste scelte':'Avvia la partita di prova'}</b></span><button onclick="dvtStart()">▶ ${DEV.sess&&started?'Ricomincia':'Avvia'}</button></div>`;
  if(DEV.sess&&started&&P)h+=`<h4>Partita di prova in corso <span class="mu">livello ${P.lv} · ${esc((ZZ&&ZZ.n)||Zk)}</span></h4>
  <div class="dvr"><span>Cura completa</span><button onclick="P.hp=P.mx;hud()">✚ Cura</button></div>
  <div class="dvr"><span>Vai in un'altra zona</span><select onchange="if(this.value)devGo(this.value)"><option value="">scegli…</option>${dvtZones().map(([k,n])=>`<option value="${k}">${esc(n)}</option>`).join('')}</select></div>
  <div class="dvr"><span>Chiudi la prova</span><button onclick="devClose();toMenu()">⏏ Termina e torna al menu</button></div>`;
  return h}
{const b0=devBody;devBody=function(){if(DEV.tab==='prova814')return dvtBody();return b0()}}
{const r0=devRender;devRender=function(){r0();const el=$('devp'),bar=el&&el.querySelector('.dvt');if(!bar||bar.querySelector('[data-dvt]'))return;const b=document.createElement('button');b.dataset.dvt='1';b.textContent='🧪 Partita di prova';
  if(DEV.tab==='prova814')b.className='on';b.onclick=()=>{DEV.tab='prova814';devRender()};bar.insertBefore(b,bar.firstChild)}}
