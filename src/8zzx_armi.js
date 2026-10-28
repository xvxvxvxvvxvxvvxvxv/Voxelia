/* ================= 7.44: le armi che crescono =================
   La maestria c'era già (ogni colpo la fa salire, fino a 10). Ora l'arma cresce anche di carattere:
   - a maestria 3 prende un nome tutto suo («Morso d'Inverno», «Ultima Parola»…), scelto dal suo seme;
   - a maestria 5 sblocca la sua mossa speciale, che parte insieme all'affondo (F): ogni tipo d'arma ha la sua;
   - a maestria 10 diventa leggendaria: la mossa speciale colpisce più forte e più lontano. */
const WPN43={
  vento:{n:'Lama del vento',d:'un fendente d\'aria che taglia tutto davanti a te'},
  terra:{n:'Terremoto',d:'il suolo trema intorno a te e i nemici restano storditi'},
  giro:{n:'Mulinello',d:'un giro completo che respinge chi ti sta intorno'},
  arcana:{n:'Nova arcana',d:'un\'onda di magia che colpisce lontano'}};
const WPN43T={Pugnale:'vento',Spada:'vento',Stocco:'vento',Ascia:'terra',Martello:'terra',Lancia:'giro',Falce:'giro',Bastone:'arcana'};
const WPN43N=['Morso d\'Inverno','Ultima Parola','Canto della Tempesta','Zanna del Lupo','Promessa dell\'Alba','Sentenza di Ferro','Giuramento del Re','Eco dei Morti','Respiro del Drago',
  'Sussurro Antico','Fiamma di Brace','Ombra del Vuoto','Lacrima delle Stelle','Sete di Sangue','Furia della Marea','Lama Lucente','Cuore di Pietra','Spina della Rosa','Vento del Nord',
  'Ultimo Saluto','Luna Spezzata','Voce del Tuono','Silenzio d\'Argento','Alba Rossa','Gelo Eterno','Lingua di Fuoco','Pianto della Montagna','Sigillo del Sole','Coda della Cometa',
  'Dente del Leviatano','Corona di Spine','Passo dell\'Ombra','Ruggito del Grifone','Ala della Fenice','Pugno del Gigante','Bacio del Ghiaccio','Ira del Cielo','Patto di Sangue',
  'Faro nella Notte','Speranza Ostinata'];
function wpnKind(n){n=n||'';const k=Object.keys(LG).find(x=>n.includes(x))||LGA[Object.keys(LGA).find(x=>n.includes(x))]||'Spada';return WPN43T[k]||'vento'}
function wpnTitle(w){const r=sd(hs(String(w.u||w.n)+'|titolo'));return WPN43N[Math.floor(r()*WPN43N.length)]}
function wpnGrow(w){if(!w)return;const ml=w.ml||0;
  if(ml>=3&&!w.wt){w.wt=wpnTitle(w);if(!String(w.n).includes('«'))w.n=w.n+' «'+w.wt+'»';const s='La tua arma ha un nome: «'+w.wt+'»';if(cineOK())setTimeout(()=>banner('Un nome per l\'arma',s,'spada'),900);else msg(s)}
  if(ml>=5&&!w.wsp){w.wsp=1;const S=WPN43[wpnKind(w.n)],s=S.n+': '+S.d+'. Parte insieme all\'affondo (F).';if(cineOK())setTimeout(()=>banner('Mossa speciale',s,'fulmine'),2600);else msg('Mossa speciale: '+s)}
  if(ml>=10&&!w.wlg){w.wlg=1;const s=w.n+' è leggendaria: la mossa speciale colpisce più forte e più lontano';if(cineOK())setTimeout(()=>banner('Arma leggendaria',s,'corona'),4200);else msg(s)}}
const _wmHit743=wmHit;wmHit=function(){_wmHit743();try{wpnGrow(P&&P.eq.w)}catch(e){}};
// la mossa speciale
function wpnSpecial(w){const k=wpnKind(w.n),lg=w.wlg?1.35:1,dr=P.dr||[0,1],hit=(e,m)=>{const r=roll(m*lg);hurtE(e,r.d,0,r.cr)},EN=()=>ents.filter(e=>e.k==='en'&&!e.tr&&e.hp>0);
  flt(P,WPN43[k].n+'!','#7affea');
  if(k==='vento'){const L=4.5*lg;for(const e of EN()){const dx=e.px-P.px,dy=e.py-P.py,a=dx*dr[0]+dy*dr[1],c=Math.abs(dx*dr[1]-dy*dr[0]);if(a>0&&a<L&&c<1.1)hit(e,1.4)}
    if(cineOK())for(let i=1;i<=6;i++)sparks(P.px+dr[0]*i*L/6,P.py+dr[1]*i*L/6,3,['#bffff4','#ffffff'],40);whoosh()}
  else if(k==='terra'){const R2=3*lg;for(const e of EN())if(dist(e,P)<R2){hit(e,1.2);if(!e.boss)e.cdt=Math.max(e.cdt,1.2)}fx.push({k:'boom',x:P.px,y:P.py,r:R2,t:.4});shake(.5);tone(60,.3,'sawtooth',.08)}
  else if(k==='giro'){const R2=2.6*lg;for(const e of EN()){const d=dist(e,P);if(d<R2){hit(e,1.5);if(!e.boss&&d>.05)mv(e,(e.px-P.px)/d*.9,(e.py-P.py)/d*.9)}}fx.push({k:'ring',x:P.px,y:P.py,r:R2,t:.5});whoosh()}
  else{const R2=4.5*lg;for(const e of EN())if(dist(e,P)<R2)hit(e,1.1);fx.push({k:'ring',x:P.px,y:P.py,r:R2,t:.5});if(cineOK())ringFx(P.px,P.py,'190,140,255',.7,R2);tone(700,.2,'triangle',.05)}}
const _lunge743=lunge;lunge=function(){const c0=P?P.lgc:0;_lunge743();const w=P&&P.eq.w;if(w&&w.wsp&&P.lgc>c0+.1)setTimeout(()=>{if(started&&P.hp>0)try{wpnSpecial(w)}catch(e){console.warn(e)}},140)};
// le armi già cresciute nei salvataggi di prima prendono subito nome e mossa
const _begin743w=begin;begin=function(d,s){_begin743w(d,s);if(P)for(const it of[P.eq.w].concat(P.inv.filter(i=>i.s==='w')))if(it&&(it.ml|0)>=3)wpnGrowQuiet(it)};
function wpnGrowQuiet(w){const ml=w.ml||0;if(ml>=3&&!w.wt){w.wt=wpnTitle(w);if(!String(w.n).includes('«'))w.n=w.n+' «'+w.wt+'»'}if(ml>=5)w.wsp=1;if(ml>=10)w.wlg=1}
