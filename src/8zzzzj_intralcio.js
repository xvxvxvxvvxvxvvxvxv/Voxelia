/* ================= 7.54.2: GLI ANIMALI E I COMPAGNI NON STANNO PIÙ IN MEZZO =================
   Gli animali da compagnia (cane, gatto, volpe, coniglio, gufo, maialino, pinguino, draghetto) seguivano l'eroe a un
   passo, spesso proprio davanti o sopra di lui. Erano anche la cosa «più vicina con cui interagire»: R, il pulsante verde e
   il clic prendevano l'animale invece della porta, del forziere o dell'oggetto a terra, e non si riusciva più ad aprire,
   raccogliere o parlare. Ora:
   - l'animale cammina dietro all'eroe, un po' di lato (dalla parte opposta del compagno domato), e si ferma lì;
   - R, il pulsante verde e il clic scelgono prima tutto il resto (porte, oggetti, forzieri, personaggi, cartelli…):
     l'animale si accarezza solo quando lì vicino non c'è altro;
   - il compagno domato non si «clicca» più: un clic su di lui fa camminare l'eroe dove hai cliccato (prima l'eroe gli
     andava incontro e basta) o colpisce il nemico che c'è lì. */
const PETK=new Set(['ani47','pet','rpet']);
// l'animale va dietro all'eroe, un po' di lato, invece di stargli addosso
{const f0=aniFollow;aniFollow=function(e,tx,ty,dt){if(!e||e.key!=='me'||!P)return f0(e,tx,ty,dt);
  const[fx0,fy0]=P.dr||[0,1],l=Math.hypot(fx0,fy0)||1,fx=fx0/l,fy=fy0/l;
  let gx=P.px-fx*1.25-fy*.75,gy=P.py-fy*1.25+fx*.75;
  if(typeof blk==='function'&&blk(gx,gy)){gx=P.px-fx*1.25;gy=P.py-fy*1.25;if(blk(gx,gy)){gx=tx;gy=ty}}
  const dx=gx-e.px,dy=gy-e.py,d=Math.hypot(dx,dy);
  if(d>8||Math.hypot(P.px-e.px,P.py-e.py)>9){e.px=gx;e.py=gy;e.mv=0;return}
  if(d>.35){const s=Math.min(d-.2,(d>3?7:Math.hypot(P.px-e.px,P.py-e.py)<.9?5:3.6)*dt);e.px+=dx/d*s;e.py+=dy/d*s;e.mv=.2}else e.mv=Math.max(0,e.mv-dt)}}
// R e il pulsante verde: prima tutto il resto, l'animale solo se non c'è altro
{const u0=upd;upd=function(dt){u0(dt);if(!started||!P||typeof IT==='undefined'||!IT||!PETK.has(IT.k))return;
  let bd=1.7,b=null;for(const e of ents){if(!ITK.has(e.k)||PETK.has(e.k))continue;const q=dist(e,P);if(q<bd){bd=q;b=e}}if(b)IT=b}}
// il clic: prima tutto il resto; il compagno domato non è mai un bersaglio, l'animale solo se lì non c'è altro
{const n0=nearAt;nearAt=function(L,mx,my){if(L!==ents)return n0(L,mx,my);const r=n0(L.filter(e=>!PETK.has(e.k)),mx,my);if(r)return r;return n0(L.filter(e=>e.k==='ani47'),mx,my)}}
