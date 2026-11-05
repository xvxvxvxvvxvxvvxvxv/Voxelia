/* ================= 7.36: LA PIETRA DEL VIAGGIO =================
   In ogni tua città e in ogni città che vende la sua gemma c'è una Pietra del viaggio (una waystone): elenca tutti i
   luoghi che hanno una gemma del teletrasporto. Ogni gemma va comprata una volta sola (dal Custode delle Gemme, al
   mercato della tua città o alla pietra di quel luogo): poi ci si viaggia quando si vuole, dalla pietra o con il tasto G. */
ITK.add('wst');if(typeof TUSE!=='undefined')TUSE.wst=['Viaggia','stella'];
const csWsHas=k=>!!(P&&P.tw&&((P.tw.ws&&P.tw.ws[k])||((P.tw.gem||{})[k]|0)>0||false));
// i luoghi con la gemma: le tue città e le città con il Custode delle Gemme che hai visto
function wsPlaces(){const L=new Map(),T=P.tw;for(const S of csSets())L.set(S.k,{k:S.k,n:S.n,own:1});
  for(const k in T.vis||{}){const p=twP(k);if(!p||L.has(k))continue;if(twCity(p[0],p[1])&&twCityGem(p[0],p[1]))L.set(k,{k,n:twZ(k).n})}
  for(const k of Object.keys(T.ws||{}).concat(Object.keys(T.gem||{})))if(!L.has(k)&&twP(k)){L.set(k,{k,n:twZ(k).n})}
  const here=twP(String(Zk).startsWith('tw:')?Zk:T.at)||[0,0];return[...L.values()].map(o=>{const p=twP(o.k);o.d=Math.max(Math.abs(p[0]-here[0]),Math.abs(p[1]-here[1]));o.dir=twDir(p[0]-here[0],p[1]-here[1]);return o}).sort((a,b)=>(b.own|0)-(a.own|0)||a.d-b.d)}
const wsHereK=()=>csRegK(Zk);
function wsHTML(){const L=wsPlaces(),hk=wsHereK();let h=`<h3>🗿 Pietra del viaggio</h3><p class="mu">Ogni luogo con la gemma del teletrasporto. Una gemma si compra una volta sola: poi ci viaggi quando vuoi, da qui o con il tasto G.</p>`;
  h+=L.length?L.map(o=>{const has=csWsHas(o.k),here=o.k===hk,pr=twGemPrice(o.k);return`<div class="twgm wsr${has?'':' wsno'}"><span class="gi">${has?'💎':'🔒'}</span><span><b>${o.own?'🏰 ':''}${esc(o.n)}</b><small>${here?'sei qui':o.dir}${has?'':' · gemma '+pr+'💰'}</small></span>${
    has?`<button onclick="twTeleport('${o.k}')" ${here||OW.tp||OW.bat?'disabled':''}>${here?'Sei qui':'Viaggia'}</button>`:here?`<button onclick="twGemBuy('${o.k}');pn('twgem')">Compra · ${pr}💰</button>`:`<button disabled title="La gemma si compra in quel luogo">Si compra lì</button>`}</div>`}).join(''):'<p class="mu">Nessun luogo ancora: fonda una città o trova una città con il Custode delle Gemme.</p>';
  return h+'<button onclick="cl()">Chiudi</button>'}
const _pn736=pn;pn=function(m,arg){if((m==='twgem'||m==='wst')&&twOn()){if(arg!==undefined)PA=arg;edPanel('twgem',wsHTML());return}_pn736(m,arg)};
const _act736=act;act=function(e){if(e&&e.k==='wst'){pn('wst');tone(520,.15,'sine');return}_act736(e)};
// la gemma si compra una volta sola, e il viaggio non la consuma
twGemBuy=function(k){if(csWsHas(k)){msg('Questa gemma è già tua');return}const pr=twGemPrice(k);if((P.g|0)<pr){msg('Non hai abbastanza oro');tone(150,.12);return}P.g-=pr;P.tw.ws=P.tw.ws||{};P.tw.ws[k]=1;P.tw.gem=P.tw.gem||{};P.tw.gem[k]=Math.max(1,P.tw.gem[k]|0);
  jingle([76,83,88],.08,'triangle');banner('💎 Gemma del teletrasporto','Ora puoi viaggiare a '+twZ(k).n+' quando vuoi: dalla Pietra del viaggio o con il tasto G','stella');save();hud();if(PA&&PA.k==='npc'&&PM==='npc')pn('npc',PA)};
twTeleport=function(k){if(!twOn()||OW.tp||OW.bat)return;if(!csWsHas(k)){msg('Prima compra la gemma di quel luogo');return}if(csRegK(Zk)===k&&String(Zk).startsWith('tw:')){msg('Sei già qui');return}if(ZZ&&ZZ.dg){msg('Esci prima dal dungeon');return}
  cl();OW.tp={k,t:0};P.path=[];P.tg=null;tone(220,1.2,'sine',.05);jingle([60,64,67,72,76,79,84],.12,'triangle');save()};
// le pietre: nelle tue città, vicino alla piazza; nelle città con il Custode, vicino alla sua casa
function wsPut(x,y,n,own){const[a,b]=WK(M[y]&&M[y][x])?[x,y]:nearFree(x,y);ents.push({k:'wst',n:n||'Pietra del viaggio',px:a+.5,py:b+.5,own:own?1:0})}
const _twSetGen736=twSetGen;twSetGen=function(C,ends){const sp=_twSetGen736(C,ends);try{const c=C.z.shub||C.hub;if(c)wsPut(c[0]-3,c[1]-3,'Pietra del viaggio',1)}catch(e){console.error(e)}return sp};
const _twCityGen736=twCityGen;twCityGen=function(C){const sp=_twCityGen736(C);try{if(twCityGem(C.rx,C.ry)){const g=TB.find(b=>b.to&&/:gemme$/.test(b.to));if(g&&g.dx!=null)wsPut(g.dx+2,g.y+g.h+1);else wsPut(C.hub[0]+3,C.hub[1]-3)}}catch(e){console.error(e)}return sp};
// la pietra: un monolite con la gemma che gira
const _ent736=ent;ent=function(e){if(!e||e.k!=='wst'){_ent736(e);return}const x=e.px,y=e.py,a=t*1.4,c=e.own?'#ffd84a':'#9adcff';
  if(!(typeof D3!=='undefined'&&D3.act)){const sx=PX(x,y),sy=PY(x,y,0);g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(sx,sy,18,8,0,0,6.3);g.fill()}
  box(x-.42,y-.42,0,.84,.84,4,'#6a6a72');box(x-.3,y-.3,4,.6,.6,3,'#7a7a84');box(x-.17,y-.17,7,.34,.34,30,'#8a8a96');box(x-.2,y-.2,22,.4,.4,3,'#5a5a66');
  box(x-.1+Math.cos(a)*.03,y-.1+Math.sin(a)*.03,40+Math.sin(t*2)*2,.2,.2,8,c,1.45);box(x-.18,y+.16,12,.04,.04,8,c,1.3);box(x+.16,y-.18,16,.04,.04,8,c,1.3);
  if(typeof nlight==='function')nlight(x,y,40,90,e.own?'255,216,74':'154,220,255',.5);
  if(!(typeof D3!=='undefined'&&D3.act)&&(SET.names||Math.hypot(P.px-x,P.py-y)<4)){const sx=PX(x,y),sy=PY(x,y,58);g.font='600 11px system-ui,sans-serif';g.textAlign='center';g.fillStyle='#000a';g.fillText(e.n,sx+1,sy+1);g.fillStyle='#fff';g.fillText(e.n,sx,sy)}};
document.head.insertAdjacentHTML('beforeend',`<style>.wsr.wsno{opacity:.8}.wsr button:disabled{opacity:.5}</style>`);
