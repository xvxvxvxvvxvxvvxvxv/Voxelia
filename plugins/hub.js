// Ritorno ad Aldoria: /hub riporta l'eroe in città, al punto d'arrivo di Aldoria, da qualunque zona della sua stanza.
// Prima di partire il gioco del giocatore controlla che possa andarsene davvero, come fa il Teletrasporto (/tpa):
// non durante uno scambio, un cambio di zona o una scena, non dalla cella delle prigioni, non dalla fossa del Colosseo,
// non con mostri vivi vicini o se è stato colpito da poco (combattimentoSec), e non durante una partita di Guardie e ladri.
// Fra un /hub e l'altro passano almeno attesaSec secondi. Le zone in "vietate" sono escluse sempre.
// Il controllo dei mostri e dei colpi gira nel gioco del giocatore: chi modifica il proprio gioco può saltarlo.

// codice nel gioco: controlla che l'eroe possa partire e fa il viaggio
function nelGioco(ID) {
  // nomi del gioco che il plugin usa: se un aggiornamento ne toglie uno, /hub si spegne con un avviso invece di rompersi
  const USA = { load: () => load, ents: () => ents, Zk: () => Zk, dist: () => dist, irisGo: () => irisGo, msg: () => msg };
  function mancanti() { return Object.keys(USA).filter(k => { try { return USA[k]() === undefined; } catch (e) { return true; } }); }
  const ROTTO = '/hub non funziona con questa versione del gioco: avvisa l\'admin del server.';
  const opz = f => { try { return f(); } catch (e) { return undefined; } };

  // l'ultima volta che l'eroe ha perso vita
  let colpito = 0, vita = null;
  setInterval(() => { const h = opz(() => P && P.hp); if (typeof h === 'number') { if (vita !== null && h < vita) colpito = Date.now(); vita = h; } }, 250);

  function perche(d) {
    if (mancanti().length) return ROTTO;
    if (!opz(() => P) || !opz(() => started)) return 'Il gioco non è ancora pronto.';
    if (opz(() => MODE) && MODE !== 'story') return 'Da qui non puoi tornare ad Aldoria.';
    if (opz(() => PM) === 'trade') return 'Stai facendo uno scambio: finiscilo prima di tornare ad Aldoria.';
    if (opz(() => IRB)) return 'Stai già cambiando zona.';
    if (opz(() => CN) || opz(() => CNE)) return 'Aspetta che finisca la scena.';
    const z = opz(() => Zk);
    if (z === 'town') return 'Sei già ad Aldoria.';
    if (z === 'cella') return 'Sei chiuso in una cella: da qui non puoi andartene.';
    if (z === 'arena' && opz(() => inPit(P.px, P.py))) return 'Sei nella fossa del Colosseo: esci prima dal combattimento.';
    if (ents.some(e => e && e.k === 'en' && e.al && e.hp > 0 && dist(e, P) < 7)) return 'Ci sono nemici vicini: allontanati o sconfiggili prima di tornare ad Aldoria.';
    const sec = Math.ceil(((d.combattimentoSec | 0) * 1000 - (Date.now() - colpito)) / 1000);
    if (sec > 0) return 'Sei stato colpito da poco: aspetta ancora ' + sec + (sec === 1 ? ' secondo.' : ' secondi.');
    return '';
  }
  const avvisa = s => { try { msg(s); } catch (e) {} };

  VXP.on(ID, 'vai', d => {
    let no; try { no = perche(d || {}); } catch (e) { console.error('[plugin ' + ID + ']', e); no = ROTTO; }
    VXP.send(ID, 'esito', { id: d && d.id, perche: no, da: opz(() => Zk), rotto: no === ROTTO ? mancanti() : undefined });
    if (no) { avvisa(no); return; }
    opz(() => whoosh());
    const viaggio = () => {
      try { load('town'); if (Zk === 'town') { avvisa('🏰 Sei tornato ad Aldoria'); opz(() => hud()); } }
      catch (e) { console.error('[plugin ' + ID + ']', e); }
    };
    try { irisGo(viaggio); } catch (e) { viaggio(); }
  });
}

module.exports = {
  name: 'Ritorno ad Aldoria',
  version: '1.0',
  author: 'Voxelia',
  description: '/hub per tornare ad Aldoria da qualunque zona',
  defaults: {
    attesaSec: 30,            // secondi minimi fra due /hub dello stesso eroe
    combattimentoSec: 8,      // dopo un colpo subito, per quanti secondi /hub non funziona
    vietate: []               // zone da cui non si torna con /hub, es. ["cittadella", "cripta"] (vale anche per i piani: "cripta" blocca "cripta@2")
  },

  setup(api) {
    const C = api.config, ID = api.id;
    const ultima = new Map();    // id giocatore → ora dell'ultimo viaggio
    const attesa = new Map();    // id richiesta → { da, timer }
    let n = 0, rottoDetto = false;
    const base = zk => String(zk || '').split('@')[0];

    api.client('(' + nelGioco.toString() + ')(' + JSON.stringify(ID) + ');');

    api.command('hub', 'torna ad Aldoria', p => {
      if (!p.zone) return 'Stai ancora entrando nel gioco: riprova tra poco.';
      if (p.zone === 'town') return 'Sei già ad Aldoria.';
      const vietate = Array.isArray(C.vietate) ? C.vietate : [];
      if (vietate.includes(p.zone) || vietate.includes(base(p.zone))) return 'Da qui non puoi tornare ad Aldoria con /hub.';
      const gl = globalThis.VoxeliaGuardieLadri;
      if (gl && typeof gl.gioca === 'function' && gl.gioca(p)) return 'Durante Guardie e ladri non puoi usare /hub.';
      if ([...attesa.values()].some(a => a.da === p.id)) return 'Un momento, stai già partendo.';
      const att = Math.max(0, C.attesaSec | 0) * 1000 - (Date.now() - (ultima.get(p.id) || 0));
      if (att > 0) { const s = Math.ceil(att / 1000); return 'Aspetta ancora ' + s + (s === 1 ? ' secondo' : ' secondi') + ' prima di usare di nuovo /hub.'; }
      const id = ID + (++n);
      attesa.set(id, { da: p.id, timer: api.after(5000, () => { if (attesa.delete(id)) p.tell('Il tuo gioco non risponde: ricarica la pagina e riprova.'); }) });
      p.send('vai', { id, combattimentoSec: Math.max(0, C.combattimentoSec | 0) });
    });

    api.onClient('esito', (p, d) => {
      const a = d && attesa.get(d.id); if (!a || a.da !== p.id) return;
      attesa.delete(d.id); api.cancel(a.timer);
      if (d.rotto && !rottoDetto) { rottoDetto = true; api.log('il gioco non ha più ' + [].concat(d.rotto).join(', ') + ': /hub va aggiornato per questa versione'); }
      if (d.perche) return;   // il gioco l'ha già detto al giocatore
      ultima.set(p.id, Date.now());
      api.log(p.name + ' è tornato ad Aldoria da ' + String(d.da || p.zone).slice(0, 40));
    });

    api.on('leave', p => {
      ultima.delete(p.id);
      for (const [id, a] of attesa) if (a.da === p.id) { api.cancel(a.timer); attesa.delete(id); }
    });
  }
};
