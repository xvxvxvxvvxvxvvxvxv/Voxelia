/* ================= 7.45: i cittadini hanno bisogni: lavoro e felicità =================
   Oltre al cibo e all'acqua, la gente del borgo vuole lavorare ed essere contenta.
   - Lavoro: ogni edificio dà dei posti (la fattoria 3 per livello, segheria, cava, mercato, fucina e locanda 2, gli altri 1);
     più o meno sei abitanti su dieci cercano lavoro. Chi resta senza è scontento.
   - Felicità (da 0 a 100): sale con il tempio, la locanda, le fontane e il borgo curato (alberi, aiuole, panchine,
     lampioni, statue), scende con la disoccupazione, la fame, la sete e le tasse alte. Le tasse si scelgono nel registro.
   - Con la gente contenta (70 o più) arrivano abitanti in più e le tasse rendono il 15% in più. Sotto 35 c'è protesta in
     piazza e le tasse rendono meno; se dura, una parte della gente se ne va. */
const CITJ={fattoria:3,segheria:2,cava:2,mercato:2,fucina:2,locanda:2,tempio:1,stalla:1,granaio:1,pozzo:1,torre:1,miniera:2,allevamento:2};
const CITTX=[{n:'Basse',m:.75,f:10},{n:'Giuste',m:1,f:0},{n:'Alte',m:1.35,f:-15}];
const CITDEC='rahoejnlłYБŦ§pU';     // arredi che fanno bello il borgo
const CITMOD=[];                    // altri moduli (meteo, stagioni) aggiungono qui i loro effetti: fn(S,st) → numero da sommare alla felicità
function citJobs(S){let j=1+(S.lv|0);for(const k in CITJ)j+=CITJ[k]*(setB(k)|0);return j}
function citDecor(S){const Ly=S.lay;let n=0;if(Ly&&Ly.d)for(const k in Ly.d)if(CITDEC.includes(Ly.d[k]))n++;return n}
function citX(S,st){if(!S)return;const pop=st.pop|0,wk=Math.round(pop*.6),jobs=citJobs(S),un=Math.max(0,wk-jobs),tx=CITTX[S.tx==null?1:S.tx]||CITTX[1];
  const fo=st.wells|0,dec=citDecor(S),why=[];let f=50;
  const add=(v,s)=>{f+=v;if(s&&v<0)why.push(s)};
  add(setB('tempio')*8);add(setB('locanda')*6);add(Math.min(3,fo)*4);add(Math.min(15,Math.floor(dec/3)));
  if(wk>0&&un>0)add(-Math.round(30*un/wk),'non c\'è lavoro per tutti');add(tx.f,tx.f<0?'le tasse sono troppo alte':null);
  if(S.fame)add(-25,'manca da mangiare o da bere');else if((S.cibo|0)>=st.fc*2&&(S.acqua|0)>=st.wc*2)add(5);
  if(!setB('tempio')&&!setB('locanda')&&pop>12)add(-8,'non c\'è niente da fare: né una locanda né un tempio');
  for(const fn of CITMOD){try{const v=fn(S,st);if(v)add(v.v||v,v.s||null)}catch(e){}}
  st.fel=clamp(Math.round(f),0,100);st.jobs=jobs;st.wk=wk;st.un=un;st.why=why;
  st.tax=Math.max(0,Math.round(st.tax*tx.m*(st.fel>=70?1.15:st.fel<35?.7:1)))}
{const x0=typeof setStatsX==='function'?setStatsX:null;setStatsX=function(S,st){if(x0)x0(S,st);citX(S,st)}}
// il giorno del borgo: chi è contento chiama altri, chi è scontento protesta e poi se ne va
{const d0=typeof setDayX==='function'?setDayX:null;setDayX=function(S,st){if(d0)d0(S,st);const f=st.fel==null?50:st.fel;S.fel=f;
  if(f>=70&&S.pop<st.cap&&!S.fame){S.pop++;setLog(S,'La gente è contenta: un nuovo abitante è arrivato per restare')}
  if(f<35){S.prot=(S.prot|0)+1;if(S.prot===1)setLog(S,'Protesta in piazza: '+(st.why[0]||'la gente è scontenta'));
    if(f<20&&S.prot>=2&&S.pop>3){const k=Math.max(1,Math.round(S.pop*.1));S.pop-=k;S.via=(S.via|0)+k;setLog(S,k+(k>1?' abitanti scontenti se ne sono andati':' abitante scontento se n\'è andato'))}}
  else if(S.prot){S.prot=0;setLog(S,'La protesta è finita: la gente è tornata al lavoro')}}}
function citTax(i){const S=P.tw.set;if(!S)return;if(S.fz&&typeof fzCan==='function'&&!fzCan('tesoro',S))return fzNo('tesoro');S.tx=clamp(i|0,0,2);tone(440+i*80,.06,'triangle');save();pn('regno')}
// nel registro: felicità, lavoro e tasse
{const h0=setHTML2;setHTML2=function(){let h=h0();const S=P.tw.set;if(!S)return h;const st=setStats(S),f=st.fel,c=f>=70?'#7aff7a':f<35?'#ff7a6a':'#ffd84a',
    face=f>=70?'😄':f>=50?'🙂':f>=35?'😐':'😠',bar=(v,mx,col)=>`<span class="sbar"><i style="width:${Math.min(100,v/Math.max(1,mx)*100)}%;background:${col}"></i></span>`;
  const T=setTile(face,'Felicità',f+'/100',(f>=70?'contenti: più abitanti e +15% di tasse':f<35?'scontenti: protestano e pagano meno':'nella media')+bar(f,100,c),f<35?'bad':f<50?'warn':'')
    +setTile('🛠','Lavoro',Math.min(st.wk,st.jobs)+'/'+st.wk,st.un?st.un+' senza lavoro · '+st.jobs+' posti':'tutti al lavoro · '+st.jobs+' posti'+bar(Math.min(st.wk,st.jobs),Math.max(1,st.wk),'#c8a0ff'),st.un>st.wk*.25?'bad':st.un?'warn':'');
  const tx=S.tx==null?1:S.tx,row=`<div class="srow citx"><span>💰 Tasse:</span>${CITTX.map((q,i)=>`<button class="${tx===i?'on':''}" onclick="citTax(${i})">${q.n}${q.f?' ('+(q.f>0?'+':'')+q.f+' felicità)':''}</button>`).join('')}</div>`;
  const why=st.why.length?`<div class="stips">${st.why.map(x=>`<p>😠 La gente si lamenta: ${x}.</p>`).join('')}</div>`:'';
  const i=h.indexOf('</div>',h.indexOf('<div class="sstg">'));if(i<0)return h+T+row;
  // le due caselle in fondo alla griglia delle statistiche, poi le tasse e le lamentele
  let j=h.indexOf('<div class="sstg">');let depth=0,k=j;for(;k<h.length;k++){if(h.startsWith('<div',k))depth++;else if(h.startsWith('</div>',k)){depth--;if(!depth)break}}
  return h.slice(0,k)+T+'</div>'+row+why+h.slice(k+6)}}
// la protesta in piazza: gente con i cartelli intorno allo stendardo
const CITPS=['Lavoro per tutti!','Meno tasse!','Pane e acqua!','Vogliamo una locanda!','Basta così!','Il borgo è nostro!'];
const _loadPost744c=loadPost;loadPost=function(k){_loadPost744c(k);try{const S=typeof twOn==='function'&&twOn()&&P.tw&&csSets().find(s=>s.k===Zk);if(!S||!(S.prot>0)||!ZZ||!ZZ.shub)return;
  const st=csWith(S,()=>setStats(S)),n=4+Math.min(4,S.prot);for(let i=0;i<n;i++){const a=i/n*6.283,[x,y]=nearFree(Math.round(ZZ.shub[0]+Math.cos(a)*2.5),Math.round(ZZ.shub[1]+Math.sin(a)*2.5));
    const e=mkNpc(i%2?'fuggiasco':'fuggiasca',x,y);e.n='Cittadino in protesta';e.prot=CITPS[(i+(st.why.length?0:2))%CITPS.length];e.why=st.why.slice();ents.push(e)}}catch(e){console.warn('protesta',e)}};
const _act744c=act;act=function(e){if(e&&e.prot){PA={ti:'✊ Protesta in piazza',tx:'«'+e.prot+'»\n\n'+(e.why&&e.why.length?'La gente si lamenta perché '+e.why.join(', e perché ')+'.':'La gente è scontenta.')+'\n\nApri il registro (U → Insediamento) per vedere felicità, lavoro e tasse.'};pn('txt');return}_act744c(e)};
const _ent744c=ent;ent=function(e){_ent744c(e);if(e.prot){const u=Math.sin(t*4+e.px*3)*2;box(e.px-.03,e.py-.03,30,.06,.06,22+u,'#6a4a2a');box(e.px-.3,e.py-.04,46+u,.6,.06,14,'#f4ecd8');box(e.px-.24,e.py-.06,51+u,.48,.02,3,'#c0392b')}};
(function(){const st=document.createElement('style');st.textContent=`.citx{align-items:center;flex-wrap:wrap}.citx span{opacity:.85}.citx button.on{outline:2px solid #ffd27a}`;document.head.appendChild(st)})();
