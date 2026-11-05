/* ================= 7.42: le scene disegnate, come in Undertale =================
   I filmati (il prologo, le scene della storia, l'arrivo in Tomorrow, i viaggi della Dimension) non si vedono più a
   tutto schermo: ogni inquadratura diventa un quadro in pixel art, con pochi colori, retinatura e contorni scuri,
   dentro una cornice su fondo nero. Sotto c'è il riquadro bianco del testo, che si scrive lettera per lettera con il
   suo «bip» (ogni personaggio ha la sua voce). Si torna ai filmati di prima da Impostazioni → Animazioni. */
if(SET.ut==null)SET.ut=1;
const UTS={c:null,x:null,lum:null,n:0,lt:0,who:'',font:0};
const UTB=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
// dove stanno il quadro e il riquadro del testo
function utLay(){const asp=Math.max(1.25,Math.min(2,W/(H*.82))),port=W<H*1.05;let pw=port?W*.96:Math.min(W*.86,H*.6*asp);const ph=pw/asp,px=(W-pw)/2,gap=Math.max(12,H*.035),th0=Math.max(92,H*.2),py=port?Math.max(10,(H-ph-gap-th0)/2-20):Math.max(10,H*.06),ty=py+ph+gap;
  return{asp,pw,ph,px,py,ty,th:Math.min(H-ty-14,th0)}}
function utPost(){const L=utLay(),lh=Math.round(Math.max(108,Math.min(176,L.ph/3.4))),lw=Math.round(lh*L.asp);
  if(!UTS.c){UTS.c=document.createElement('canvas');UTS.x=UTS.c.getContext('2d')}
  const c=UTS.c,x=UTS.x;if(c.width!==lw||c.height!==lh){c.width=lw;c.height=lh;UTS.lum=new Float32Array(lw*lh)}
  // il fotogramma del filmato, senza le bande nere del cinema, rimpicciolito: ogni pixel diventa un «quadratino» del disegno
  const sw=cv.width,sh=cv.height;let ch=sh*.82/1.12,cw=ch*L.asp;if(cw>sw/1.06){cw=sw/1.06;ch=cw/L.asp}const cx0=(sw-cw)/2,cy0=(sh-ch)/2;
  x.imageSmoothingEnabled=true;x.imageSmoothingQuality='medium';x.globalCompositeOperation='copy';x.drawImage(cv,cx0,cy0,cw,ch,0,0,lw,lh);x.globalCompositeOperation='source-over';
  const im=x.getImageData(0,0,lw,lh),d=im.data,Lm=UTS.lum,n=lw*lh;
  for(let i=0,j=0;i<n;i++,j+=4)Lm[i]=(d[j]*.3+d[j+1]*.59+d[j+2]*.11)/255;
  for(let y=0;y<lh;y++)for(let x2=0;x2<lw;x2++){const i=y*lw+x2,j=i*4,l=Lm[i];
    // contorni: dove la luce cambia di colpo, la parte più scura diventa una linea quasi nera
    let e=0,lo=l;if(x2+1<lw){const q=Lm[i+1];e=Math.max(e,Math.abs(q-l));lo=Math.min(lo,q)}if(y+1<lh){const q=Lm[i+lw];e=Math.max(e,Math.abs(q-l));lo=Math.min(lo,q)}
    if(x2>0){const q=Lm[i-1];e=Math.max(e,Math.abs(q-l));lo=Math.min(lo,q)}if(y>0){const q=Lm[i-lw];e=Math.max(e,Math.abs(q-l));lo=Math.min(lo,q)}
    let r=d[j],gg=d[j+1],b=d[j+2];
    // colori un po' più spenti e caldi, contrasto più deciso
    const m=(r+gg+b)/3;r=m+(r-m)*.78+8;gg=m+(gg-m)*.78+3;b=m+(b-m)*.78-6;r=(r-128)*1.12+128;gg=(gg-128)*1.12+128;b=(b-128)*1.12+128;
    if(e>.2&&l<=lo+.02){r*=.16;gg*=.14;b*=.18}
    // pochi colori a campiture piatte, con una retinatura leggera solo dove un colore passa all'altro
    const t2=.5+((UTB[(y&3)*4+(x2&3)]+.5)/16-.5)*.38,Q=v=>{v=Math.max(0,Math.min(255,v))/255*5;return Math.min(5,Math.floor(v+t2))*51};
    d[j]=Q(r);d[j+1]=Q(gg);d[j+2]=Q(b);d[j+3]=255}
  x.putImageData(im,0,0);
  g.setTransform(DPR,0,0,DPR,0,0);g.globalAlpha=1;g.fillStyle='#000';g.fillRect(0,0,W,H);
  g.imageSmoothingEnabled=false;g.drawImage(c,0,0,lw,lh,Math.round(L.px),Math.round(L.py),Math.round(L.pw),Math.round(L.ph));g.imageSmoothingEnabled=true;
  const el=$('cine2');if(el){el.style.setProperty('--utx',Math.round(L.px)+'px');el.style.setProperty('--uty',Math.round(L.ty)+'px');el.style.setProperty('--utw',Math.round(L.pw)+'px');el.style.setProperty('--uth',Math.round(L.th)+'px')}}
// la voce del testo: un «bip» ogni due lettere, più acuto o più grave a seconda di chi parla
function utBlip(){const el=$('ctx');if(!el)return;const w=el.querySelector('.fwho'),who=w?w.textContent:'',tx=el.textContent.slice(who.length),n=tx.length;
  if(who!==UTS.who||n<UTS.n){UTS.who=who;UTS.n=n;return}if(n>UTS.n){const ch=tx[n-1],now=performance.now();UTS.n=n;
    if(ch&&/[^\s.,;:!?«»'"…—-]/.test(ch)&&now-UTS.lt>52){UTS.lt=now;const f=who?150+hs(who)%260:220;try{tone(f,.035,'square',.018)}catch(_){}}}}
const _cineDraw742=cineDraw;cineDraw=function(dt){_cineDraw742(dt);const on=!!(SET.ut&&CN);document.body.classList.toggle('utf',on);if(!on)return;try{utPost();utBlip()}catch(e){console.warn('scene disegnate',e)}};
const _cineSkip742=cineSkip;cineSkip=function(){document.body.classList.remove('utf');UTS.n=0;UTS.who='';_cineSkip742()};
// la casella nelle impostazioni, subito sotto quella dei filmati
new MutationObserver(()=>{const f=$('s_film');if(!f||$('s_ut'))return;const row=f.closest('.row');if(!row)return;
  row.insertAdjacentHTML('afterend',`<div class="row"><label for="s_ut">🖍 Scene disegnate in pixel art, come in Undertale (quadro con cornice e testo lettera per lettera)</label><input type="checkbox" id="s_ut" ${SET.ut?'checked':''} onchange="setv('ut',this.checked?1:0)"></div>`)}).observe(document.body,{childList:true,subtree:true});
(function(){const st=document.createElement('style');st.textContent=`
body.utf #cine2 .itx{position:fixed;left:var(--utx);top:var(--uty);width:var(--utw);height:var(--uth);margin:0;max-width:none;min-height:0;box-sizing:border-box;overflow:hidden;
  font:bold 21px 'Lucida Console','Courier New',monospace;font-style:normal;color:#fff;text-align:left;text-shadow:none;line-height:1.2;letter-spacing:.3px;background:#000;border:4px solid #fff;padding:12px 20px}
body.utf #cine2 .itx:empty{border-color:transparent}
body.utf #cine2 .fwho{font:bold 21px 'Lucida Console','Courier New',monospace;color:#ffe14a;letter-spacing:1px;text-transform:none;margin-bottom:4px}
body.utf #cine2 .fwho::before{content:'* '}
body.utf #cine2 .iskip{font:20px 'Lucida Console','Courier New',monospace;background:#000;color:#fff;border:3px solid #fff;border-radius:0;padding:4px 12px;bottom:12px;right:12px}
body.utf #cine2 .iskip:hover{color:#ffe14a;border-color:#ffe14a}
@media (max-width:700px){body.utf #cine2 .itx{font-size:17px;padding:8px 12px;border-width:3px}body.utf #cine2 .fwho{font-size:17px}}`;document.head.appendChild(st)})();
