/* ================= 7.11: un regno più difficile =================
   Nella Modalità Storia i nemici sono più forti e lavorano in branco, i boss hanno un'ultima furia, compaiono i Campioni
   (nemici scelti, più grossi e pericolosi, con un bottino sicuro), le pozioni curano meno e non si bevono a raffica,
   i falò curano più piano e cadere costa più oro. I mondi di Voxelia Studio tengono l'equilibrio scelto dal loro autore. */
// moltiplicatori in più per difficoltà (Facile, Normale, Difficile, Incubo): vita e danni dei nemici
const HARD=[{hp:1.1,at:1.1},{hp:1.2,at:1.2},{hp:1.3,at:1.3},{hp:1.3,at:1.3}];
const hardOn=()=>MODE==='story';
const hardK=()=>HARD[Math.max(0,DFS.indexOf(DF))]||HARD[1];
// ogni quanto i boss usano un'abilità: più spesso nella storia, ancora di più quando sono furiosi e nell'ultima furia
function bossGap(e){const st=hardOn();return(e.fury?3.1:e.enr?(st?3.8:4.5):(st?5.4:6.5))+Math.random()*(st?1.1:1.5)}
// i Campioni: in dungeon e fuori città, un nemico su dodici circa (di più a ogni ciclo del dungeon), mai tra i rinforzi evocati
function eliteP(z){if(!z||z.int||z.lay||Zk==='town'||Zk==='arena'||z.war||z.ed)return 0;if(z.dg)return Math.min(.2,.08+.025*(z.run||0)+(z.boss?.02:0));return z.th||z.dist?.04:0}
function eliteMk(e){const L=e.m;let m=L;try{if(L&&L.rg)m=rgScale(L,1.14);else if(L&&L.length){m=scl(L,1.14);if(L.hm)m.hm=1;if(L.top)m.top=L.top*1.14}}catch(_){m=L}
  e.m=m;e.elite=1;e.hp=e.mx=Math.round(e.mx*1.9);e.at*=1.3;e.sp*=1.1;e.cd*=.92;e.xp*=2.5;e.n='Campione · '+e.n;return e}
const _mk711=mk;mk=function(t,x,y,id){const e=_mk711(t,x,y,id);if(!hardOn()||!e||!e.b||e.b.np)return e;const k=hardK(),dg=ZZ&&ZZ.dg,q=v=>dg?v:1+(v-1)*.75;
  e.hp=e.mx=Math.round(e.mx*q(k.hp)*(e.boss?1.15:1));e.at*=q(k.at);e.ag=(e.ag||6)*(dg?1.15:1.08);
  const z=ZZ,p=eliteP(z);if(p>0&&!e.boss&&(id==null||id<10000)&&(hs((Zk||'')+'|'+(z.run||0)+'|'+e.id+'|'+t)%1000)/1000<p)eliteMk(e);return e};
// branco: quando un nemico ti vede o viene colpito, chiama quelli che gli stanno vicino
// ultima furia: sotto un quarto della vita il boss accelera e usa le abilità molto più spesso
const _upd711=upd;upd=function(dt){_upd711(dt);if(!hardOn()||!started||!P)return;
  for(const e of ents){if(e.k!=='en'||e.tr||!e.al||e.pk)continue;e.pk=1;const R2=ZZ&&ZZ.dg?4.5:3.2;for(const o of ents)if(o!==e&&o.k==='en'&&!o.tr&&!o.al&&!o.b.np&&Math.hypot(o.px-e.px,o.py-e.py)<R2){o.al=1;o.pk=1}}
  for(const e of ents){if(e.k!=='en'||!e.boss||e.fury||!e.enr||e.hp>e.mx*.25||e.b.np)continue;e.fury=1;e.sp*=1.12;e.cd*=.85;e.bab=Math.min(e.bab||0,1.2);
    flt(e,'Ultima furia!','#ff5a3a');msg(e.n+' è allo stremo: attento, ora è più pericoloso!');tone(70,.6,'sawtooth',.08);if(typeof shake==='function'&&cineOK())shake(.7);if(cineOK())ringFx(e.px,e.py,'255,80,40',1,3)}};
// i Campioni si riconoscono: alone dorato a terra, un po' più grossi, e il nome sopra la testa
const _ent711=ent;ent=function(e){if(e&&e.elite&&e.k==='en'){const p=.55+.25*Math.sin(t*4+e.px);g.save();g.globalCompositeOperation='lighter';g.strokeStyle=`rgba(255,200,70,${p})`;g.lineWidth=2.5;
    g.beginPath();g.ellipse(PX(e.px,e.py),PY(e.px,e.py,0),23,11,0,0,6.3);g.stroke();g.restore();if(SET.ultra)GLOW.push([e.px,e.py,16,40,'255,200,80',.25])}
  _ent711(e);if(e&&e.elite&&e.k==='en'&&!(OCC&&OCC.intro)){const top=(e.m&&e.m.top?e.m.top:40)+6,sx=PX(e.px,e.py),sy=PY(e.px,e.py,0);g.textAlign='center';g.font='bold 11px Georgia,serif';label('★ Campione',sx,sy-top-10,'#ffd84a')}};
// un Campione vinto lascia sempre qualcosa di buono, e più oro
const _kill711=kill;kill=function(e){const el=e&&e.elite&&e.k==='en'&&ents.includes(e),x=e&&e.px,y=e&&e.py;_kill711(e);if(!el||!started)return;
  const z=ZZ,lv=(z&&z.lv)||P.lv,gd=Math.round(ri(10,20+lv*4)*(NET.cfg.gm||1));P.g+=gd;flt({px:x,py:y},'+'+gd+' oro','#ffd84a');goldFly(gd,x,y);
  ents.push(dropOk({k:'dr',px:x,py:y,it:item(lv+1,1)}));if(cineOK())sparks(x,y,18,['#ffd84a','#fff2a0'],80)};
