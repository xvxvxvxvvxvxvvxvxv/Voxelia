/* ================= 7.44: le frasi del titolo, come in Minecraft =================
   Accanto a VOXELIA compare una frase gialla, storta, che pulsa: una diversa a ogni apertura (cliccandola cambia).
   Alcune arrivano solo in certi giorni. */
const FRASI43=['Ora con il 100% di voxel in più!','Il vaso di terra ti saluta!','Non toccare il pulsante rosso!','Anche in 3D!','Fatto con amore e cubetti!',
  'Il Re Lich non ha mai vinto a carte','Le galline non sono incluse','Ora con le leve!','Malakar era solo incompreso','Quadrato è bello!','Prova a scavare qui sotto!',
  'Nessun pixel è stato maltrattato','Mangia la frutta di Nora!','Gilda fa il miglior stufato di Aldoria','Il gatto sa qualcosa','Il pugnale di base è una scelta di vita',
  'Più gemme che pixel!','Salva spesso!','Ascolta i testimoni!','Le pozioni non sono infinite','Il Troll ha solo fame','Spazio per colpire, cuore per sperare',
  'Una corona, sei gemme, zero pazienza','Ora con la Torre!','Il cubo è il nuovo tondo','Si consiglia un caffè','Anche il fumo è a cubetti','Non fidarti del topo d\'ambra',
  'Gioca con gli amici!','I boss hanno un punto debole!','Ottimo anche a colazione!','La pala è più forte della spada','Ricordati di dormire!','Questa frase cambia',
  'Più fazioni di un condominio','Tomorrow arriva oggi!','100% senza tetti che tremano','Aldoria non dorme mai','Vietato dare da mangiare allo yeti',
  'Il Colosseo ti aspetta!','Edizione da collezione: 1 di ∞','Anche Aldric si perde nel castello','Il drago di brina odia l\'estate','Le leve vanno tirate insieme!',
  'Disegnato come Undertale!','Il diario non si scrive da solo','Il mercante ha sempre ragione','Ma l\'hai provato in 3D?','Ogni cubo ha una storia','Clicca qui!',
  'Leggendaria, ma di cartone','Benvenuto a casa, eroe!','Funziona anche sul telefono!','I sentieri sono dritti, finalmente','Ora con le maledizioni (facoltative)',
  'Più oro, più problemi','Gino ha venduto 1000 canne da pesca','Se cadi, ti rialzi a cubetti','Il Re Goblin ha perso la corona','In onore dei voxel caduti'];
function frase43(){const d=new Date(),md=(d.getMonth()+1)*100+d.getDate(),nm=(($('nm')&&$('nm').value)||'').trim();
  const sp=md===1225?'Buon Natale!':md===101?'Buon anno nuovo!':md===1031?'Dolcetto o voxel?':md===214?'Un cuore a cubetti per te':md===401?'Questa frase è falsa':null;
  if(sp&&Math.random()<.7)return sp;if(nm&&Math.random()<.08)return'Ciao, '+nm+'!';return FRASI43[Math.floor(Math.random()*FRASI43.length)]}
(function(){const h=document.querySelector('#menu .mhead h1');if(!h)return;const s=document.createElement('span');s.id='frase43';s.setAttribute('role','button');s.tabIndex=0;s.title='Un\'altra frase';
  const set=()=>{s.textContent=frase43();const n=s.textContent.length;s.style.setProperty('--fz',Math.max(12,Math.min(20,26-n*.3))+'px')};set();
  s.onclick=e=>{e.stopPropagation();set();try{tone(880,.05,'triangle',.03)}catch(_){}};s.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();s.onclick(e)}};
  h.style.position='relative';h.style.display='inline-block';h.appendChild(s);
  const st=document.createElement('style');st.textContent=`
#frase43{position:absolute;left:100%;top:68%;translate:-62% 0;white-space:nowrap;font:bold var(--fz,18px) Georgia,serif;letter-spacing:0;color:#ffff3a;text-shadow:2px 2px 0 #3f3f00;
  transform:rotate(-17deg);transform-origin:50% 50%;cursor:pointer;animation:frase43 .55s ease-in-out infinite alternate;z-index:3;user-select:none}
@keyframes frase43{from{scale:.94}to{scale:1.06}}
@media (max-width:700px){#frase43{left:auto;right:0;top:92%;translate:0 0;transform:rotate(-10deg);transform-origin:100% 50%}}
@media (prefers-reduced-motion:reduce){#frase43{animation:none}}`;document.head.appendChild(st)})();
