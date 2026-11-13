/* 8.8: l'Atto II rifatto (la città sepolta) e la Corona con sei schegge — traduzioni in inglese.
   I testi dell'Atto II stanno accanto al loro inglese in src/storia/8zzzzs_atto2.js (T88(italiano, inglese) → L88):
   qui si registrano, interi e paragrafo per paragrafo (la finestra dei dialoghi mostra ogni paragrafo per conto suo). */
{const add=(it,en)=>{if(!it||!en)return;ENX[it]=en;const a=it.split('\n\n'),b=en.split('\n\n');if(a.length>1&&a.length===b.length)for(let i=0;i<a.length;i++)if(!ENX[a[i]])ENX[a[i]]=b[i]};
  if(typeof L88!=='undefined'){for(const[it,en]of L88)add(it,en);L88.on=1}
  // i nomi dei passi e dei titoli composti al volo
  Object.assign(ENX,{
"✦ {0} è libera":"✦ {0} is free","✦ {0} è libero":"✦ {0} is free",
"Atto II · {0}: {1}/3":"Act II · {0}: {1}/3",
"Lettore di Eldora":"Reader of Eldora","Custode della Memoria":"Keeper of Memory",
// la Corona con sei schegge (src/corona/8zzzzh_corona80.js e 8zzr_corona.js)
"Zaffiro":"Sapphire","Storia · l'Atto II":"Story · Act II",
"Finisci l'Atto II della Storia: la città sepolta, sotto il pozzo di Aldoria Vecchia.":"Finish Act II of the Story: the buried city, beneath the well of Old Aldoria.",
"Le sei schegge sono riunite: il Cuore della Corona si è aperto":"The six splinters are reunited: the Heart of the Crown has opened",
"Servono tutte e sei le schegge della Corona.":"You need all six splinters of the Crown.",
"Le sei schegge si accendono tutte insieme e la Corona ti risucchia dentro. Sotto i tuoi piedi c'è un pavimento d'oro sospeso nel vuoto; intorno, sei pilastri con le sei schegge.":"The six splinters light up all together and the Crown draws you inside. Beneath your feet there's a golden floor suspended in the void; around you, six pillars with the six splinters.",
"Le schegge brillano insieme per la prima volta da mille anni, e lo Zaffiro, tornato intero, più di tutte. Per un attimo, in mezzo alle sei luci, ti sembra di vederne una settima, senza colore. Poi non c'è più.":"The splinters shine together for the first time in a thousand years, and the Sapphire, whole again, brightest of all. For a moment, among the six lights, you seem to see a seventh, without color. Then it's gone.",
"Le sei schegge della Corona sono sparse nelle modalità. Riuniscile tutte per aprire il Cuore della Corona, il finale vero di Voxelia.":"The Crown's six splinters are scattered across the modes. Gather them all to open the Heart of the Crown, the true ending of Voxelia.",
"Si apre quando hai tutte e sei le schegge.":"It opens when you have all six splinters.",
"L'Atto II: Eldora, la città sepolta":"Act II: Eldora, the Buried City",
"Lo Zaffiro si è spezzato quando una città è stata dimenticata. Si dice che tornerà intero il giorno in cui qualcuno la ricorderà.":"The Sapphire broke when a city was forgotten. They say it will be whole again on the day someone remembers it.",
"Atto II · La città sepolta":"Act II · The Buried City","La gemma tornata intera":"The gem made whole again",
"Lo Zaffiro è tornato intero quando Eldora è stata ricordata. Continua la Storia del tuo eroe nella città sotto la città.":"The Sapphire became whole again when Eldora was remembered. Continue your hero's Story in the city beneath the city.",
"Scheggia di Zaffiro raccolta":"Sapphire splinter collected","Scheggia di Zaffiro: {0}":"Sapphire splinter: {0}",
"Zaffiro della Corona":"Sapphire of the Crown","💎 Zaffiro della Corona":"💎 Sapphire of the Crown"})}
