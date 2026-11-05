/* ================= 8.2: i veicoli del 3026, ridisegnati =================
   Prima erano piccoli e bassi (alti un quinto di un passante) con il tetto tutto scuro: dall'alto sembravano lastre.
   Ora sono grandi il 30% in più e alti il doppio, con la cabina a vetri, i montanti, il tetto, il muso, i fari bianchi
   davanti e le luci rosse dietro, i levitatori agli angoli e un pezzo che riconosce ogni modello:
   - Navetta: berlina con il tetto lungo;            - Saetta: sportiva bassa con l'alettone e le prese d'aria;
   - Corazzata: fuoristrada alto e squadrato;        - Cargo: furgone con il cassone alto e la porta laterale;
   - Aerotaxi: la scritta TAXI luminosa sul tetto;   - Volante-drone: le strisce blu e la sirena;
   - Medi-navetta: la croce rossa e la sirena;       - Rover: il cassone aperto e il roll-bar;
   - Moto jet: sella, manubrio e scarico che brilla; - il Rover dei pianeti ha sei ruote vere, il roll-bar e l'antenna.
   Le misure per guidare e per gli urti restano quelle di prima: cambia solo il disegno. */
const VS82=1.3;
carParts=function(e){const C=CARM[e.mdl]||CARM.berl,L=C.l*VS82,Wd=C.w*VS82,c=e.col,dk=shx(c,.62),lt=shx(c,1.18),gl='#5a8ab0',gl2='#86b8d8',hl=t%1<.5,ng=GLOWC[e.mdl]||'#2affff',
    rov=!!e.rov82,hv=rov?0:4+(e.burn?-3.5:Math.sin(t*3+(e.px||0))*.6),P2=[],A=(u,v,z,l,w,h,cc)=>P2.push([u,v,z+hv,l,w,h,cc]);
  const lights=(z,h)=>{for(const s of[-1,1]){A(L/2-.03,s>0?Wd/2-.2:-Wd/2+.04,z,.06,.16,h,'#f4fcff');A(-L/2-.03,s>0?Wd/2-.22:-Wd/2+.04,z,.06,.18,h*.8,'#ff2a4a')}};
  const pods=()=>{for(const[u,v]of[[L*.32,Wd*.5],[L*.32,-Wd*.5],[-L*.32,Wd*.5],[-L*.32,-Wd*.5]]){A(u-.17,v-(v>0?.1:.08),-2.2,.34,.18,3,'#22222c');A(u-.12,v-(v>0?.08:.06),-2.8,.24,.14,.6,ng)}};
  // la cabina: vetri sui lati, montanti agli angoli, tetto del colore della carrozzeria
  const cabin=(u0,u1,z,h,roof)=>{const l=u1-u0;A(u0,-Wd/2+.07,z,l,Wd-.14,h,gl);A(u0+.05,-Wd/2+.08,z+1,l-.1,Wd-.16,h-2,gl2);for(const uu of[u0,u1-.07])for(const s of[-1,1])A(uu,s>0?Wd/2-.11:-Wd/2+.07,z,.07,.04,h,dk);A(u0-.02,-Wd/2+.05,z+h,l+.04,Wd-.1,roof||1.4,c)};
  if(rov){// il Rover dei pianeti: sei ruote, telaio, cassone, roll-bar, antenna
    for(const u of[-L*.36,0,L*.36])for(const s of[-1,1]){A(u-.2,s>0?Wd/2-.04:-Wd/2-.14,0,.4,.18,5,'#1a1a1e');A(u-.08,s>0?Wd/2+.11:-Wd/2-.15,1.6,.16,.03,1.8,'#8a8a94')}
    A(-L/2,-Wd/2+.06,4,L,Wd-.12,4,c);A(L/2-.35,-Wd/2+.06,8,.35,Wd-.12,2,dk);cabin(-L*.05,L*.28,8,6,1);
    A(-L/2,-Wd/2+.06,8,L*.4,.06,3,dk);A(-L/2,Wd/2-.12,8,L*.4,.06,3,dk);A(-L/2,-Wd/2+.06,8,.06,Wd-.12,3,dk);
    for(const s of[-1,1])A(-L*.08,s>0?Wd/2-.12:-Wd/2+.06,8,.06,.06,10,'#3a3a44');A(-L*.08,-Wd/2+.06,18,.06,Wd-.12,.8,'#3a3a44');
    A(-L/2+.1,Wd/2-.2,12,.04,.04,14,'#c8c8d0');A(-L/2+.08,Wd/2-.22,26,.08,.08,.8,hl?'#ff3a3a':'#5a1a1a');lights(5,1.2);return P2}
  if(C.moto){A(-L/2+.1,-Wd/2,1,L-.2,Wd,4,c);A(-L*.05,-Wd/2+.04,5,L*.4,Wd-.08,2,'#1a1a22');A(L/2-.35,-Wd/2+.02,5,.28,Wd-.04,3,lt);A(L/2-.25,-.3,8,.05,.6,.6,'#8a8a94');A(L/2-.1,-.08,3,.12,.16,2,'#f4fcff');
    A(-L/2-.05,-.1,2,.2,.2,1.8,ng);A(-L/2+.05,-Wd/2,-1.4,L-.1,Wd,.6,ng);return P2}
  pods();A(-L/2+.08,-Wd/2+.08,-.6,L-.16,Wd-.16,.6,ng);
  if(e.mdl==='van'||e.mdl==='amb'){const H=14;A(-L/2,-Wd/2,0,L,Wd,4,dk);A(-L/2,-Wd/2,4,L*.72,Wd,H-4,c);A(L*.22,-Wd/2,4,L*.28,Wd,5,c);cabin(L*.22,L/2-.12,9,5,1);
    A(-L*.3,Wd/2-.01,5,L*.3,.02,7,dk);if(e.mdl==='amb'){A(-L*.2,Wd/2-.005,9,.36,.02,1,'#ff3a3a');A(-L*.2+.13,Wd/2-.005,7.7,.1,.02,3.6,'#ff3a3a');A(-L*.2,-Wd/2-.015,9,.36,.02,1,'#ff3a3a');A(-L*.2+.13,-Wd/2-.015,7.7,.1,.02,3.6,'#ff3a3a');A(L*.1,-.12,H,.25,.24,1.6,hl?'#ff3a3a':'#3a6aff')}
    else A(-L/2+.1,-Wd/2-.01,8,L*.5,.02,1,ng);lights(2.5,1.4);return P2}
  const T={berl:{bh:6,u0:-.28,u1:.18,ch:6},sport:{bh:4.5,u0:-.16,u1:.14,ch:4.5},suv:{bh:8,u0:-.32,u1:.16,ch:6.5},taxi:{bh:6,u0:-.26,u1:.18,ch:6},pick:{bh:6.5,u0:-.04,u1:.24,ch:6},pol:{bh:6,u0:-.26,u1:.18,ch:6}}[e.mdl]||{bh:6,u0:-.28,u1:.18,ch:6};
  const bh=T.bh;A(-L/2,-Wd/2,0,L,Wd,2,dk);A(-L/2+.02,-Wd/2,2,L-.24,Wd,bh-2,c);A(L/2-.24,-Wd/2+.03,2,.22,Wd-.06,bh-3,lt);// carrozzeria e muso più basso
  A(-L/2+.1,-Wd/2-.01,bh-1.6,L-.3,.02,.7,ng);A(-L/2+.1,Wd/2-.01,bh-1.6,L-.3,.02,.7,ng);// le fasce luminose sui fianchi
  cabin(L*T.u0,L*T.u1,bh,T.ch);lights(bh-3,1.3);
  if(e.mdl==='sport'){A(-L/2-.04,-Wd/2+.04,bh+2.5,.22,Wd-.08,.8,dk);for(const s of[-1,1])A(-L/2+.05,s>0?Wd/2-.14:-Wd/2+.06,bh,.06,.08,2.5,dk);for(const s of[-1,1])A(L*.05,s>0?Wd/2-.01:-Wd/2-.01,3,.3,.02,1.2,'#111118')}
  if(e.mdl==='suv'){A(L*T.u0,-Wd/2+.04,bh+T.ch+1.4,L*(T.u1-T.u0),.06,.8,'#2a2a34');A(L*T.u0,Wd/2-.1,bh+T.ch+1.4,L*(T.u1-T.u0),.06,.8,'#2a2a34');A(L/2-.05,-Wd/2+.1,1,.1,Wd-.2,2.4,'#2a2a34')}
  if(e.mdl==='pick'){A(-L/2+.02,-Wd/2,bh,L*.42,.07,2.6,dk);A(-L/2+.02,Wd/2-.07,bh,L*.42,.07,2.6,dk);A(-L/2,-Wd/2,bh,.07,Wd,2.6,dk);A(-L*.06,-Wd/2+.05,bh+T.ch+1.4,.06,Wd-.1,2.5,'#3a3a44')}
  if(e.mdl==='taxi'){A(-.18,-.2,bh+T.ch+1.4,.36,.4,2.2,'#1a1a1a');A(-.15,-.21,bh+T.ch+1.9,.3,.42,1.2,'#ffe27a');for(let i=0;i<4;i++)A(-L/2+.15+i*.4,Wd/2-.005,2.6,.2,.02,1,i%2?'#1a1a1a':'#ffffff')}
  if(e.mdl==='pol'){for(const s of[-1,1])A(-L*.3,s>0?Wd/2-.005:-Wd/2-.015,2.5,L*.6,.02,2,'#2a4aff');const on=e.sir||NEO.W>0;A(-.1,-.32,bh+T.ch+1.4,.2,.3,1.6,on&&hl?'#ff2a2a':'#7a1a1a');A(-.1,.02,bh+T.ch+1.4,.2,.3,1.6,on&&!hl?'#2a5aff':'#1a2a7a')}
  return P2};
