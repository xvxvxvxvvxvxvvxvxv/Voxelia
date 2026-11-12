# Plugin del server e Voxelia PS Vita

Questa pagina è per chi scrive plugin per `server.js` e vuole che funzionino anche con la Vita.

Nel browser un plugin può aggiungere al gioco codice JavaScript (`api.client`). La Vita non può eseguirlo. Quello
che il plugin fa sul server invece funziona sempre, anche per i plugin nuovi, perché la Vita parla con il server
come il browser:
- comandi in chat (`api.command`) e le loro risposte;
- messaggi privati (`p.tell`), annunci (`api.announce`, `api.say`);
- regali e azioni sull'eroe (`p.give`, `p.heal`, `p.toTown`, `p.kick`);
- tutto quello che il plugin decide da posizione, zona, livello, dungeon e arena.

Per mostrare qualcosa sullo schermo, invece del codice nel gioco il plugin manda gli **eventi generici** qui sotto
con `p.send(evento, dati)` o `api.broadcast(evento, dati)`. La Vita li capisce da qualsiasi plugin, anche da uno
che non conosce. Il browser li ignora, a meno che il codice del plugin nel gioco non li gestisca.

## La Vita si presenta

Appena collegata, la Vita manda un messaggio grezzo che i plugin vedono con `api.on('message')`:

```js
api.on('message', (p, j) => { if (j.t === 'client') console.log(p.name, 'gioca da', j.d.tipo); });
```

La prima volta che un plugin le scrive, la Vita risponde anche con l'evento `client`:

```js
api.onClient('client', (p, d) => { /* d = { tipo: 'psvita', versione: '1.0', gioco: '8.5', eventi: [...] } */ });
```

Un plugin può chiedere questi dati in qualunque momento con `p.send('client?', {})`.

## Eventi generici

| Evento | Dati | Sulla Vita |
|---|---|---|
| `banner` | `{ titolo, testo, suono? }` | Titolo grande sullo schermo superiore |
| `avviso` | `{ testo, suono? }` (o direttamente il testo) | Messaggio in basso sullo schermo superiore |
| `chat` | `{ testo, n? }` | Riga nella chat e nel registro della chat (`n` è chi scrive) |
| `suono` | `{ note: [60, 64, 67] }` (o direttamente l'elenco) | Breve melodia, note MIDI |
| `domanda` | `{ id, titolo, testo, si?, no?, sec? }` | Riquadro sopra il mondo (a destra) con due pulsanti da toccare, o SELECT e poi Croce o Cerchio, «Accetta» e «Rifiuta» se non dici altro. La risposta torna come evento `risposta` `{ id, si: true/false }`. Sparisce dopo `sec` secondi (60 se non c'è) |
| `riquadro` | `{ id, titolo, righe: [..3], v?, sec? }` (o `{ id, testo }`) | Riquadro a sinistra, accanto ai pulsanti dei menu: titolo, fino a 3 righe e una barra se c'è `v` (da 0 a 1). Con lo stesso `id` si aggiorna. `null` o `{ id, via: 1 }` lo toglie, `sec` lo fa sparire da solo |
| `punto` | `{ id, zk, x, y, testo? }` | Scintille sulla casella `x, y` della zona `zk`, con la scritta quando l'eroe è vicino. `{ id, via: 1 }` lo toglie |
| `menu` | `{ id, titolo, testo?, voci: [{ t, cmd }, { t, id }], apri? }` | Un elenco nella pagina «Funzioni del server». Una voce con `cmd` manda quel comando in chat (`"/torneo iscrivi"`). Una voce con `id` torna come evento `scelta` `{ id, voce, n }`. Con `apri: 1` la pagina si apre subito, se il giocatore non è in un'altra finestra |
| `chiudi` | `{ id? }` | Toglie domanda, riquadro, punto e menu del plugin con quell'`id` (senza `id`, tutti) |
| `origine?` | `{}` | La Vita risponde con `origine` `{ o: "https://server" }`, utile per i link in chat |
| `evento`, `annuncio`, `notifica`, `info` | `{ banner? / titolo?, testo, suono? }` | Titolo grande se c'è `banner` o `titolo`, altrimenti un avviso |

Ogni altro evento è un messaggio interno del plugin: la Vita lo ignora senza errori.

I numeri possono arrivare anche come testo (`"12"`). Le emoji vengono tolte, perché il font della console non le ha.

### Esempio

```js
module.exports = {
  name: 'Sfida dei funghi', version: '1.0',
  setup(api) {
    api.command('funghi', 'una sfida a tempo', p => {
      p.send('domanda', { id: 'sfida', titolo: 'Sfida dei funghi', testo: 'Raccogli 3 funghi in 2 minuti?', si: 'Ci sto', no: 'No' });
    });
    api.onClient('risposta', (p, d) => {
      if (!d || d.id !== 'sfida' || !d.si) return;
      p.send('riquadro', { id: 'sfida', titolo: 'Sfida dei funghi', righe: ['0/3 funghi', 'Tempo: 2:00'], v: 0 });
      p.send('punto', { id: 'f1', zk: 'forest', x: 20, y: 30, testo: 'Un fungo' });
    });
  }
};
```

## Comandi del server

Appena collegata, la Vita chiede `/aiuto` senza mostrarlo in chat. I comandi che trova compaiono nella pagina
**Funzioni del server**, con la loro descrizione. Un comando nuovo appare lì senza aggiornare il port. Nel pannello:
- **A** manda il comando;
- **Y** lo apre nella tastiera, per aggiungere un nome o altro.

Per questo conviene dare ai comandi una descrizione breve e chiara, e far rispondere i comandi con testo
(`return 'testo'` o `p.tell`) invece che solo con finestre nel browser.

## Plugin che la Vita conosce già

Per alcuni plugin ufficiali la Vita ha una versione nativa del codice nel gioco, in `source/plugins.c`:

> boss, tesoro, taglie, notti, emote, tpa, hub, gruppi, torneo, sindaco, guardieladri, pesca, speedrun, albo

Si basano sugli eventi di quei plugin. Se un aggiornamento del plugin aggiunge un evento nuovo, quell'evento passa
dagli eventi generici. Così un `banner` o un `avviso` aggiunto più avanti si vede anche sulla Vita.

## Limiti

- La Vita non può mostrare pagine web, finestre HTML o codice JavaScript del plugin. Per queste cose usa gli eventi
  qui sopra o i comandi in chat.
- Il server accetta al massimo 30 messaggi al secondo da ogni giocatore verso i plugin: la Vita ne manda al massimo 24.
