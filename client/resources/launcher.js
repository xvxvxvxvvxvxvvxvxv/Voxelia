// Client di Voxelia: apre il server ufficiale. Il gioco arriva sempre dal server, quindi il client non va aggiornato.
// Per usare un altro server: avvia con --server=https://...  ·  F11: schermo intero.
const DEFAULT_SERVER = 'https://otboi2kx101p-production-9y6zqlkz.europe-west1.suga.run/';
const $ = id => document.getElementById(id);
let server = DEFAULT_SERVER, timer = null, tries = 0;

const clean = u => { u = String(u || '').trim(); if (!/^https?:\/\/[^\s/]+/i.test(u)) return ''; return u.endsWith('/') ? u : u + '/'; };

function pickServer() {
  const arg = (window.NL_ARGS || []).find(a => /^--server=/.test(a));
  if (arg && clean(arg.slice(9))) return clean(arg.slice(9));
  return DEFAULT_SERVER;
}

// F11: schermo intero (sulla pagina del gioco lo gestisce cover.js)
window.addEventListener('keydown', async e => {
  if (e.key !== 'F11') return;
  e.preventDefault(); if (e.repeat) return;
  try { (await withTimeout(Neutralino.window.isFullScreen(), 1500)) ? Neutralino.window.exitFullScreen() : Neutralino.window.setFullScreen(); } catch (x) {}
}, true);

function show(st, det, busy) {
  $('st').textContent = st; $('det').textContent = det || '';
  $('spin').classList.toggle('hide', !busy); $('retry').classList.toggle('hide', busy);
}

// le chiamate all'API nativa non devono mai bloccare l'avvio
const withTimeout = (p, ms) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej('timeout'), ms))]);

async function maximize() {
  try {
    if (await withTimeout(Neutralino.window.isMaximized(), 1500)) return;
    const w = innerWidth, h = innerHeight, t0 = Date.now();
    await withTimeout(Neutralino.window.maximize(), 1500);
    // aspetta che la finestra abbia davvero cambiato dimensione (al massimo 1,5 s), poi un attimo perché si assesti
    await new Promise(r => { const chk = () => (innerWidth !== w || innerHeight !== h || Date.now() - t0 > 1500) ? r() : setTimeout(chk, 50); chk(); });
    await new Promise(r => setTimeout(r, 200));
  } catch (e) {}
}

async function connect() {
  clearInterval(timer); tries++;
  show(tries > 1 ? 'Trying again…' : 'Connecting to the server…', tries > 1 ? '' : 'The server can take a few seconds to wake up the first time.', true);
  const ctl = new AbortController(), to = setTimeout(() => ctl.abort(), 30000);
  try {
    // basta che il server risponda: poi si apre il gioco nella finestra
    await fetch(server, { mode: 'no-cors', cache: 'no-store', signal: ctl.signal });
    clearTimeout(to);
    // il gioco calcola la sua dimensione all'avvio: prima si massimizza la finestra, poi si carica il gioco
    show('Starting the game…', '', true);
    await maximize();
    location.replace(server);
  } catch (e) {
    clearTimeout(to);
    let s = 20;
    const tick = () => show(navigator.onLine === false ? 'No Internet connection' : "Can't reach the server",
      'Trying again in ' + s + ' s', false);
    tick(); timer = setInterval(() => { if (--s <= 0) connect(); else tick(); }, 1000);
    $('retry').focus();
  }
}

$('retry').onclick = connect;
window.addEventListener('online', connect);
Neutralino.init();
server = pickServer();
connect();
