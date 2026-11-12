/* ================= 8.7: IL GIOCO IN INGLESE (ED È LA LINGUA DI PARTENZA) =================
   Il gioco è scritto in italiano; l'inglese lo traduce mentre lo mostra, senza toccare la logica:
   - i testi di finestre, pannelli, pulsanti, messaggi e dialoghi (le parti della pagina), compresi i suggerimenti
     (title), i segnaposto dei campi e le descrizioni per i lettori di schermo;
   - le scritte disegnate sulla mappa (nomi sopra le teste, numeri dei colpi, cartelli) e le finestre del browser;
   - le traduzioni stanno nei file 9b_en_*.js (cartella src/lingua): ogni voce è il testo italiano com'è nel gioco, con
     {0}, {1}… al posto delle parti che cambiano (numeri, nomi), e il suo inglese. Le parti che cambiano si traducono a
     loro volta, se hanno una traduzione (un nome di oggetto dentro «Hai trovato {0}», per esempio).
   - L'inglese è la lingua di partenza: chi apre il gioco per la prima volta lo trova in inglese, e chi lo aveva in
     italiano lo trova in inglese una volta sola (si rimette in italiano da Impostazioni → Generale → Lingua).
   - Il registro delle novità (finestra «Novità») è in inglese o in italiano a seconda della lingua scelta. */
const ENX={};
const I18={ok:0,ex:null,lead:null,trail:null,free:[],cache:new Map(),num:/^[\d\s.,:;%+\-–—×x/()€$💰⭐❤️🗡️🛡️✨⚡🔥💧🌿]*$/u};
function i18Esc(s){return s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}
function i18Norm(s){return s.replace(/\s+/g,' ').trim()}
function i18Build(){I18.ok=1;const ex=new Map(),lead=new Map(),trail=new Map(),free=[];
  for(const k in EN)ex.set(i18Norm(k),EN[k]);
  for(const k in ENX){const v=ENX[k];if(v==null||v==='')continue;const nk=i18Norm(k);
    if(!/\{\d+\}/.test(nk)){ex.set(nk,v);continue}
    // due segnaposto attaccati ({0}{1}) diventano una parte sola: il testo che li riempie va tutto nel primo
    const parts=nk.split(/(\{\d+\})/),ids=[],skip=[];let re='^',prevPh=false;
    for(const p of parts){const m=p.match(/^\{(\d+)\}$/);if(m){if(prevPh){skip.push(+m[1]);continue}ids.push(+m[1]);re+='(.+?)';prevPh=true}else{if(p)prevPh=false;re+=i18Esc(p)}}
    re+='$';let rx;try{rx=new RegExp(re,'su')}catch(e){continue}
    const pat={rx,ids,skip,v,len:nk.replace(/\{\d+\}/g,'').length};
    const L=parts[0],T=parts[parts.length-1];
    if(L&&L.length>=1){const key=L.slice(0,3);(lead.get(key)||lead.set(key,[]).get(key)).push(pat)}
    else if(T&&T.length>=1){const key=T.slice(-3);(trail.get(key)||trail.set(key,[]).get(key)).push(pat)}
    else free.push(pat)}
  for(const m of[lead,trail])for(const L of m.values())L.sort((a,b)=>b.len-a.len);free.sort((a,b)=>b.len-a.len);
  // pezzi di testi lunghi: le frasi di un paragrafo tradotto (quando il gioco le mostra una alla volta)
  // e l'inizio di «Dove: {0}» quando il valore sta in un'altra parte della pagina
  const SP=/(?<=[.!?…»])\s+(?=[«A-ZÀ-Ý¡¿0-9])/;const ex2=new Map();
  for(const[k,v]of ex){if(k.length<40)continue;const a=k.split(SP),b=v.split(SP);if(a.length>1&&a.length===b.length)for(let i=0;i<a.length;i++)if(a[i].length>3&&!ex.has(a[i]))ex2.set(a[i],b[i])}
  for(const k in ENX){const v=ENX[k];if(!v)continue;const nk=i18Norm(k);let m=nk.match(/^(.*\S)\s*\{\d+\}$/),n=v.match(/^(.*\S)\s*\{\d+\}$/);if(m&&n&&!/\{\d+\}/.test(m[1])&&!/\{\d+\}/.test(n[1])&&!ex.has(m[1]))ex2.set(m[1],n[1]);
    m=nk.match(/^\{\d+\}\s*(\S.*)$/);n=v.match(/^\{\d+\}\s*(\S.*)$/);if(m&&n&&!/\{\d+\}/.test(m[1])&&!/\{\d+\}/.test(n[1])&&!ex.has(m[1]))ex2.set(m[1],n[1])}
  for(const[k,v]of ex2)if(!ex.has(k))ex.set(k,v);
  Object.assign(I18,{ex,lead,trail,free});I18.cache.clear()}
// traduce un testo già normalizzato; null se non c'è traduzione
function i18Find(s,depth){const ex=I18.ex.get(s);if(ex!=null)return ex;if(depth>2||s.length>4000)return null;
  const C=[];for(const n of[3,2,1]){if(s.length<n)continue;const a=I18.lead.get(s.slice(0,n));if(a)C.push(...a);const b=I18.trail.get(s.slice(-n));if(b)C.push(...b)}
  if(C.length>1)C.sort((a,b)=>b.len-a.len);
  for(const p of C.concat(I18.free)){const m=p.rx.exec(s);if(!m)continue;const g=m.slice(1);
    // i modelli con poco testo fisso («Da {0}», «{0}: {1}») valgono solo se le parti che cambiano sono numeri o hanno
    // anch'esse una traduzione: altrimenti tradurrebbero una parola sola di una frase che non c'entra
    const weak=p.len<6;let miss=0;
    const out=p.v.replace(/\{(\d+)\}/g,(_,i)=>{if(p.skip.includes(+i))return'';const j=p.ids.indexOf(+i);let x=j<0?'':g[j];if(x==null)return'';const t=x.trim();if(t&&!I18.num.test(t)&&/[A-Za-zÀ-ÿ]{2}/.test(t)){const r=i18Find(i18Norm(t),depth+1);if(r!=null)x=x.replace(t,r);else if(t.split(' ').length>2)miss++}return x});
    if(weak&&miss)continue;return out}
  // un testo fatto di più pezzi (separati da «·» o da frasi diverse): si traducono i pezzi uno per uno
  // simboli davanti o dietro (🌲 Foresta di Elmwood, ⚔ Campi di battaglia)
  {const m=s.match(/^([^A-Za-zÀ-ÿ0-9«"(¿¡]+)(.*[A-Za-zÀ-ÿ].*)$/u);if(m&&m[2].trim()!==s){const r=i18Find(m[2].trim(),depth+1);if(r!=null)return m[1]+r}}
  {const m=s.match(/^(.*[A-Za-zÀ-ÿ.!?)»])([^A-Za-zÀ-ÿ0-9.!?)»]+)$/u);if(m&&m[1]!==s){const r=i18Find(m[1],depth+1);if(r!=null)return r+m[2]}}
  for(const sep of[' · ',' — ',', ']){if(!s.includes(sep))continue;const P=s.split(sep);let ch=0;const R=P.map(x=>{const t=x.trim();if(!t||!/[A-Za-zÀ-ÿ]/.test(t))return x;let r=i18Find(t,depth+1);if(r==null&&sep===' · '){const r2=i18Find('· '+t,depth+1);if(r2!=null)r=r2.replace(/^·\s*/,'')}if(r!=null){ch++;return x.replace(t,r)}return x});if(ch&&(sep!==', '||P.every(x=>x.split(' ').length<=4)))return R.join(sep)}
  const F=s.split(/(?<=[.!?…»])\s+(?=[«A-ZÀ-Ý¡¿0-9])/);if(F.length>1){let ch=0;const R=F.map(x=>{const r=i18Find(x,depth+1);if(r!=null){ch++;return r}return x});if(ch)return R.join(' ')}
  return null}
function i18En(o){if(!I18.ok)i18Build();const s=i18Norm(o);if(!s||!/[A-Za-zÀ-ÿ]/.test(s))return o;
  let r=I18.cache.get(s);if(r===undefined){r=i18Find(s,0);if(I18.cache.size>30000)I18.cache.clear();I18.cache.set(s,r)}
  if(r==null)return o;const lead=o.match(/^\s*/)[0],tail=o.match(/\s*$/)[0];return lead+r+(o.length>lead.length?tail:'')}
// il motore di prima (4_render.js) passa di qui
trText=function(o){const lang=SET.lang;if(lang==='it')return o;if(!o||!o.trim())return o;if(lang==='en')return i18En(o);return elText(o)};
// anche i suggerimenti, i segnaposto e le descrizioni
const I18A=['title','placeholder','aria-label','alt'];
function i18Attr(el){if(!el.getAttribute)return;for(const a of I18A){if(!el.hasAttribute(a))continue;const k='__a_'+a;let v=el.getAttribute(a);
  if(el[k+'t']!==v)el[k]=v;const o=el[k];const t=SET.lang==='it'?o:trText(o);el[k+'t']=t;if(v!==t)el.setAttribute(a,t)}}
trNode=function(root){if(!root)return;const st=[root];while(st.length){const nd=st.pop();if(nd.nodeType===3){const p=nd.parentNode;if(!p||p.closest&&p.closest('script,style,kbd,#cl,.nol'))continue;if(nd.__o==null){if(SET.lang==='it')continue;nd.__o=nd.nodeValue}
      if(nd.__t===nd.nodeValue&&nd.__l===SET.lang)continue;if(nd.__t!==undefined&&nd.nodeValue!==nd.__t)nd.__o=nd.nodeValue;const v=trText(nd.__o);nd.__t=v;nd.__l=SET.lang;if(nd.nodeValue!==v)nd.nodeValue=v}
    else if(nd.nodeType===1&&!/^(SCRIPT|STYLE|CANVAS|TEXTAREA)$/.test(nd.tagName)){if(nd.closest&&nd.closest('.nol'))continue;if(nd.attributes&&nd.attributes.length)i18Attr(nd);if(nd.tagName==='INPUT')continue;for(const c of nd.childNodes)st.push(c)}}};
// i suggerimenti che cambiano dopo (per esempio il nome di un pulsante che cambia stato)
(function(){try{const mo=new MutationObserver(R2=>{if(I18B||SET.lang==='it')return;I18B=1;for(const r of R2)if(r.target&&r.target.nodeType===1&&!(r.target.closest&&r.target.closest('.nol')))i18Attr(r.target);I18B=0});
  mo.observe(document.body,{subtree:true,attributes:true,attributeFilter:I18A})}catch(_){}})();
// le scritte disegnate
(function(){const P2=CanvasRenderingContext2D.prototype;for(const f of['fillText','strokeText','measureText']){const f0=P2[f];P2[f]=function(tx,...a){if(SET.lang!=='it'&&typeof tx==='string'&&tx.length>1&&/[A-Za-zÀ-ÿ]{2}/.test(tx))tx=trText(tx);return f0.call(this,tx,...a)}}
  if(typeof OffscreenCanvasRenderingContext2D!=='undefined'){const P3=OffscreenCanvasRenderingContext2D.prototype;for(const f of['fillText','strokeText','measureText']){const f0=P3[f];P3[f]=function(tx,...a){if(SET.lang!=='it'&&typeof tx==='string'&&tx.length>1&&/[A-Za-zÀ-ÿ]{2}/.test(tx))tx=trText(tx);return f0.call(this,tx,...a)}}}})();
// le finestre del browser
for(const f of['alert','confirm','prompt']){const f0=window[f];if(typeof f0!=='function')continue;window[f]=function(m,...a){if(typeof m==='string'&&SET.lang!=='it')m=trText(m);return f0.call(window,m,...a)}}
// il registro delle novità nella lingua scelta (in inglese CHANGELOG.md, in italiano CHANGELOG.it.md)
{const c0=chgHTML;chgHTML=function(){const it=SET.lang==='it'&&typeof CHANGELOG_IT==='string';let r;if(it){const keep=CHANGELOG_MD;CHANGELOG_MD=CHANGELOG_IT;try{r=c0.apply(this,arguments)}finally{CHANGELOG_MD=keep}}else r=c0.apply(this,arguments);return'<div class="nol">'+r+'</div>'}}
// l'inglese è la lingua di partenza (una volta sola anche per chi aveva l'italiano)
SETD.lang='en';
if(!SET.l87){SET.l87=1;if(SET.lang==null||SET.lang==='it')SET.lang='en';try{LS.set('voxelia_set',SET)}catch(e){}}
// anche il titolo della scheda del browser
{const t0=document.title;const st=()=>{try{document.title=SET.lang==='it'?t0:trText(t0)}catch(e){}};setTimeout(st,0);const s0=setLang;setLang=function(l){s0(l);st()}}
