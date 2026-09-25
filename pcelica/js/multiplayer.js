// ===== Pčelica - MULTIPLAYER: sobe preko PeerJS-a, dijeljeni seed svijeta, sinkronizacija rezultata, duh protivnika =====
// ---------- Multiplayer: room-based live score comparison via shared storage ----------
const mp = { active: false, code: null, slot: null, waitTimer: null, syncTimer: null, opponentFinished: false, resultShown: false };
const ROOM_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no confusing 0/O/1/I

function generateRoomCode() {
  let s = '';
  for (let i = 0; i < 4; i++) s += ROOM_CODE_CHARS[Math.floor(Math.random() * ROOM_CODE_CHARS.length)];
  return s;
}

function showMpError(msg) {
  mpError.textContent = msg;
  mpError.classList.remove('hidden');
}

mpBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  overlay.classList.add('hidden');
  mpOverlay.classList.remove('hidden');
  mpChoice.classList.remove('hidden');
  mpWaiting.classList.add('hidden');
  mpError.classList.add('hidden');
  mpCodeInput.value = '';
});

mpBackBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  mpOverlay.classList.add('hidden');
  overlay.classList.remove('hidden');
});

mpCancelBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  if (peer) { try { peer.destroy(); } catch (err) {} peer = null; }
  if (conn) { try { conn.close(); } catch (err) {} conn = null; }
  mp.code = null; mp.slot = null;
  mpWaiting.classList.add('hidden');
  mpChoice.classList.remove('hidden');
});

const MP_ID_PREFIX = 'pcelica-bee-';
let peer = null;
let conn = null;

function peerAvailable() {
  return typeof Peer !== 'undefined';
}

function setupConnHandlers() {
  conn.on('data', (data) => {
    if (data.type === 'seed') {
      setSeed(data.seed);
      mp.seed = data.seed;
      beginMultiplayerGame();
      return;
    }
    if (data.type === 'sabotage') {
      receiveSabotage();
      return;
    }
    if (data.type === 'sabotageResult') {
      if (data.result === 'applied') showMpToast('🌑 Protivniku si obrnuo/la komande!');
      else if (data.result === 'blocked') showMpToast('🛡️ Protivnikov štit je upio sabotažu!');
      return;
    }
    if (data.type === 'pepperTaken') {
      const p = peppers.find(pp => pp.id === data.id);
      if (p) p.taken = true;
      return;
    }
    if (data.type === 'redBirdTaken') {
      const t = redBirdTokens.find(tt => tt.id === data.id);
      if (t) t.taken = true;
      return;
    }
    if (data.type === 'fogTaken') {
      const t = fogTokens.find(tt => tt.id === data.id);
      if (t) t.taken = true;
      return;
    }
    if (data.type === 'fogAttack') {
      receiveFog();
      return;
    }
    if (data.type === 'fogResult') {
      if (data.result === 'applied') showMpToast('🌫️ Protivnik je u magli!');
      else if (data.result === 'blocked') showMpToast('🛡️ Protivnikov štit je rastjerao maglu!');
      return;
    }
    if (data.type === 'deathFlowerTaken') {
      if (deathFlower) deathFlower.taken = true;
      return;
    }
    if (data.type === 'deathFlowerAttack') {
      receiveDeathFlower();
      return;
    }
    if (data.type === 'deathFlowerResult') {
      if (data.result === 'lifeLost') showMpToast('💀 Protivnik je izgubio život!');
      else if (data.result === 'killed') showMpToast('💀 Cvijet smrti je dokrajčio protivnika!');
      return;
    }
    if (data.type === 'vortexTaken') {
      const t = vortexTokens.find(tt => tt.id === data.id);
      if (t) t.taken = true;
      return;
    }
    if (data.type === 'vortexAttack') {
      receiveVortex();
      return;
    }
    if (data.type === 'vortexResult') {
      if (data.result === 'applied') showMpToast('🌀 Protivnika je uhvatio vrtlog!');
      else if (data.result === 'blocked') showMpToast('🛡️ Protivnikov štit je razbio vrtlog!');
      return;
    }
    if (data.type === 'redBirdAttack') {
      receiveRedBird();
      return;
    }
    if (data.type === 'redBirdResult') {
      if (data.result === 'hit') showMpToast('🎯 Crvena ptica je pogodila protivnika!');
      else if (data.result === 'blocked') showMpToast('🛡️ Protivnikov štit je odbio crvenu pticu!');
      else if (data.result === 'dodged') showMpToast('💨 Protivnik je izbjegao crvenu pticu!');
      return;
    }
    if (data.type === 'flowerTaken') {
      const f = findFlowerById(data.id);
      if (f && !f.taken) f.taken = true;
      return;
    }
    if (data.type !== 'state') return;
    mpOppScore.textContent = data.score;
    mpOppDist.textContent = data.dist;
    mpOppStatus.textContent = data.finished ? '(gotovo)' : (!data.alive ? '(pao/la)' : (data.inBonus ? '(u bonus sobi)' : ''));
    mp.opponentFinished = data.finished;
    mp.lastOppState = data;
    if (gameState === 'over' && data.finished && !mp.resultShown) {
      showMultiplayerResult(
        { score: score, dist: finalDist },
        data
      );
    }
  });
  conn.on('close', () => {
    if (mp.active) mpOppStatus.textContent = '(napustio/la)';
  });
}

function broadcastFlowerTaken(id) {
  if (!conn || !conn.open || !id) return;
  try { conn.send({ type: 'flowerTaken', id: id }); } catch (err) { /* ignore */ }
}

function findFlowerById(id) {
  for (const f of flowers) {
    if (f.id === id) return f;
  }
  for (const seg of terrain) {
    if (seg.type !== 'meadow' || !seg.tufts) continue;
    for (const tuft of seg.tufts) {
      if (tuft.id === id) return tuft;
    }
  }
  return null;
}

mpCreateBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  mpError.classList.add('hidden');
  if (!peerAvailable()) { showMpError('Mreža nije dostupna, provjeri konekciju i osvježi stranicu.'); return; }
  const code = generateRoomCode();
  try {
    peer = new Peer(MP_ID_PREFIX + code);
  } catch (err) {
    showMpError('Greška, pokušaj ponovo.');
    return;
  }
  peer.on('open', () => {
    mp.code = code;
    mpCodeDisplay.textContent = code;
    mpStatus.textContent = 'Čekam protivnika…';
    mpChoice.classList.add('hidden');
    mpWaiting.classList.remove('hidden');
  });
  peer.on('connection', (c) => {
    conn = c;
    setupConnHandlers();
    conn.on('open', () => {
      // host generates the shared world seed and starts immediately; the joiner
      // waits for this seed message (see setupConnHandlers) before starting
      const seed = Math.floor(Math.random() * 4294967296);
      setSeed(seed);
      mp.seed = seed;
      conn.send({ type: 'seed', seed: seed });
      beginMultiplayerGame();
    });
  });
  peer.on('error', (err) => {
    if (err.type === 'unavailable-id') showMpError('Taj kod je zauzet, pokušaj ponovo.');
    else showMpError('Greška veze, pokušaj ponovo.');
  });
});

mpJoinBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  mpError.classList.add('hidden');
  if (!peerAvailable()) { showMpError('Mreža nije dostupna, provjeri konekciju i osvježi stranicu.'); return; }
  const code = mpCodeInput.value.trim().toUpperCase();
  if (code.length !== 4) { showMpError('Unesi kod od 4 znaka.'); return; }
  try {
    peer = new Peer();
  } catch (err) {
    showMpError('Greška, pokušaj ponovo.');
    return;
  }
  peer.on('open', () => {
    conn = peer.connect(MP_ID_PREFIX + code, { reliable: true });
    setupConnHandlers();
    conn.on('open', () => {
      mpCodeDisplay.textContent = code;
      mpStatus.textContent = 'Povezano, pokrećem svijet…';
      mpChoice.classList.add('hidden');
      mpWaiting.classList.remove('hidden');
      // don't start yet - wait for the host's 'seed' message so both worlds match
    });
    conn.on('error', () => showMpError('Soba ne postoji ili je nedostupna.'));
  });
  peer.on('error', () => {
    showMpError('Soba ne postoji ili je nedostupna.');
  });
});

function beginMultiplayerGame() {
  mp.active = true;
  mp.opponentFinished = false;
  mp.resultShown = false;
  mp.lastOppState = null;
  mpOverlay.classList.add('hidden');
  mpScoreboard.classList.remove('hidden');
  mpOppScore.textContent = '0';
  mpOppDist.textContent = '0';
  mpOppStatus.textContent = '';
  resetPeppers();
  resetRedBirds();
  resetVortex();
  resetDeathFlower();
  resetFog();
  startGame();
  if (mp.syncTimer) clearInterval(mp.syncTimer);
  mp.syncTimer = setInterval(syncMultiplayer, 150);
}

function syncMultiplayer() {
  if (!mp.active || !conn || !conn.open) return;
  // pravilo: igra traje dok je bar jedan igrač živ - tko je poginuo, oživi kad protivnik stigne u sljedeći svijet
  if (gameState === 'over' && !mp.resultShown &&
      mp.lastOppState && mp.lastOppState.alive && (mp.lastOppState.world || 1) > worldIndex()) {
    reviveInWorld(mp.lastOppState.world);
  }
  const myState = {
    type: 'state',
    score: score,
    dist: gameState === 'over' ? finalDist : Math.floor(scrollX / METER_SCALE),
    alive: gameState === 'playing' || gameState === 'dying',
    finished: gameState === 'over',
    inBonus: inBonus || bonusEntering,
    boosting: pepperBoostT > 0,
    vortexed: vortexT > 0,
    fogged: fogT > 0,
    world: worldIndex(),
    worldX: scrollX + (bee ? bee.x : 0),
    y: bee ? bee.y : 0
  };
  mpMyScore.textContent = myState.score;
  mpMyDist.textContent = myState.dist;
  try { conn.send(myState); } catch (err) { /* transient error, try again next tick */ }
  if (gameState === 'over' && mp.opponentFinished && !mp.resultShown && mp.lastOppState) {
    showMultiplayerResult(myState, mp.lastOppState);
  }
}

function showMultiplayerResult(mine, opp) {
  mp.resultShown = true;
  spectatorBanner.classList.add('hidden');
  let verdict;
  if (mine.score === opp.score) {
    verdict = mine.dist > opp.dist ? 'Pobijedio/la si! 🏆' : mine.dist < opp.dist ? 'Izgubio/la si!' : 'Neriješeno!';
  } else {
    verdict = mine.score > opp.score ? 'Pobijedio/la si! 🏆' : 'Izgubio/la si!';
  }
  document.querySelector('#overlay h1').textContent = verdict;
  finalScore.textContent = 'Ti: ' + mine.score + '🌼 ' + mine.dist + 'm   ·   Protivnik: ' + opp.score + '🌼 ' + opp.dist + 'm';
  startBtn.textContent = 'Igraj solo ponovo';
  overlay.classList.remove('hidden');
}

function endMultiplayer() {
  mp.active = false;
  mp.code = null;
  mp.slot = null;
  mp.lastOppState = null;
  rand = Math.random;
  if (mp.syncTimer) { clearInterval(mp.syncTimer); mp.syncTimer = null; }
  if (conn) { try { conn.close(); } catch (e) {} conn = null; }
  if (peer) { try { peer.destroy(); } catch (e) {} peer = null; }
  resetPeppers();
  resetRedBirds();
  resetVortex();
  resetDeathFlower();
  resetFog();
  pepperBadge.classList.add('hidden');
  mpToast.classList.add('hidden');
  mpScoreboard.classList.add('hidden');
  spectatorBanner.classList.add('hidden');
}

// ---------- Oživljavanje u sljedećem svijetu ----------
const REVIVE_LIVES = 1;

// 1 = dan, 2 = noć, 3 = pustinja, 4 = ledenjak (WORLD_ORDER u world3.js)
function worldIndex() {
  return WORLD_ORDER.indexOf(worldTheme) + 1;
}

// poziva se iz world2.js/world3.js kad počne prijelaz u novi svijet (cvijet ili portal) - prekida sabotaže koje bi visjele u zraku
function mpOnSleepStart() {
  vortexT = 0;
  if (bee && !portalSeq) delete bee.spin;
  redBirds = [];
}

function reviveInWorld(world) {
  // nastavlja od početka tog svijeta (cvijet/portal), ili od mjesta gdje je gledanje stalo ako je dalje
  const fromTheme = WORLD_ORDER[world - 2];         // svijet čiji portal/cvijet vodi u ciljani svijet
  const portalCfg = WORLD_PORTALS[fromTheme];       // nema ga za noć (tamo vodi veliki cvijet)
  const startX = portalCfg ? portalCfg.triggerX() : world2TriggerX;
  const target = Math.max(scrollX, startX - W * BEE_X_RATIO);
  gameState = 'playing';
  lives = REVIVE_LIVES;
  updateLivesHUD();
  hitInvulnT = 0;
  deathReason = null;
  deathSpin = 0;
  finalDist = 0;
  spectatorBanner.classList.add('hidden');
  overlay.classList.add('hidden');
  bee = { x: W * BEE_X_RATIO, y: H * 0.4, vy: 0, r: 16 };
  scrollX = target;
  ensureTerrainAhead();
  particles = [];
  birds = [];
  wasps = [];
  fishermen = [];
  butterflies = [];
  butterflyFollowers = [];
  fleeingButterflies = [];
  trailHistory = [];
  cloudPortals = [];
  flowers = [];
  for (let i = 0; i < 6; i++) spawnFlower(scrollX + W + i * 180);
  invertActive = false;
  invertTimeLeft = 0;
  invertBadge.classList.add('hidden');
  shieldActive = false;
  shieldTimeLeft = 0;
  shieldBadge.classList.add('hidden');
  pepperBoostT = 0;
  fogT = 0;
  vortexT = 0;
  pendingVortex = false;
  redBirds = [];
  pendingRedBirds = 0;
  pendingDeathFlower = 0;
  if (portalCfg) {
    // pojavi se kroz portal (mini-splash) i nastavlja u tom svijetu
    worldTheme = fromTheme;
    worldPortal = { worldX: scrollX + bee.x, y: H * 0.4, cfg: portalCfg };
    clearHazardsNear(worldPortal.worldX);
    startPortalSequence('splash');
    showMpToast(portalCfg.title + ' - protivnik je stigao, oživio/la si!');
  } else {
    bigFlower = { worldX: scrollX + bee.x, headY: H * 0.46 };
    clearHazardsNearBigFlower();
    startSleepSequence('sleep'); // pojavi se kako spava na velikom cvijetu i budi se u noći
    showMpToast('🌙 Protivnik je stigao u noć - oživio/la si!');
  }
}

function drawGhostBee(x, y) {
  const realBee = bee;
  bee = { x: x, y: y, vy: 0, r: realBee ? realBee.r : 16 };
  ctx.save();
  ctx.globalAlpha = 0.6;
  ctx.filter = 'hue-rotate(150deg) saturate(1.4)';
  drawBee();
  ctx.restore();
  bee = realBee;
}

function drawOpponentGhost() {
  if (mp.active && mp.lastOppState && mp.lastOppState.worldX !== undefined) {
    const ghostAlive = mp.lastOppState.alive;
    const ghostInBonus = mp.lastOppState.inBonus;
    const gx = mp.lastOppState.worldX - scrollX;
    if (ghostAlive && !ghostInBonus && gx > -40 && gx < W + 40) {
      if (mp.lastOppState.boosting) drawBoostFlame(gx, mp.lastOppState.y, 0.5);
      if (mp.lastOppState.vortexed) drawVortexSwirl(gx, mp.lastOppState.y, 0.5);
      if (mp.lastOppState.fogged) drawFogPuffs(gx, mp.lastOppState.y, 0.6);
      drawGhostBee(gx, mp.lastOppState.y);
    }
  }
}

// ---------- Sabotaža (samo multiplayer): crni cvijet obrne komande protivniku ----------
// Štit i sabotaža se međusobno poništavaju:
//  - dođe sabotaža, a igrač ima štit -> štit nestane, komande ostaju normalne
//  - igrač ima obrnute komande pa skupi štit (zlatni cvijet ili dućan) -> obrnute komande nestanu, štit se potroši
const mpToast = document.getElementById('mpToast');
let mpToastTimer = null;

function showMpToast(msg) {
  mpToast.textContent = msg;
  mpToast.classList.remove('hidden');
  mpToast.style.animation = 'none';
  void mpToast.offsetWidth; // restart the CSS animation
  mpToast.style.animation = '';
  if (mpToastTimer) clearTimeout(mpToastTimer);
  mpToastTimer = setTimeout(() => mpToast.classList.add('hidden'), 2200);
}

function sendMp(msg) {
  if (!conn || !conn.open) return;
  try { conn.send(msg); } catch (err) { /* ignore */ }
}

function mpSendSabotage() {
  sendMp({ type: 'sabotage' });
}

function receiveSabotage() {
  // protivnik koji je već pao/završio ne može biti sabotiran
  if (!mp.active || (gameState !== 'playing' && gameState !== 'countdown')) {
    sendMp({ type: 'sabotageResult', result: 'missed' });
    return;
  }
  if (shieldActive) {
    shieldActive = false;
    shieldTimeLeft = 0;
    shieldBadge.classList.add('hidden');
    triggerShake(3, 0.15);
    for (let i = 0; i < 16; i++) {
      particles.push({
        x: bee.x, y: bee.y,
        vx: (Math.random()-0.5)*260, vy: (Math.random()-0.5)*260 - 30,
        life: 0.6, age: 0,
        color: i % 2 === 0 ? '#1a1a2a' : '#ffd452'
      });
    }
    showMpToast('🛡️ Štit te zaštitio od sabotaže!');
    sendMp({ type: 'sabotageResult', result: 'blocked' });
    return;
  }
  invertActive = true;
  invertTimeLeft = INVERT_DURATION; // nova sabotaža resetira vrijeme
  triggerShake(4, 0.2);
  for (let i = 0; i < 18; i++) {
    particles.push({
      x: bee.x, y: bee.y,
      vx: (Math.random()-0.5)*280, vy: (Math.random()-0.5)*280 - 40,
      life: 0.7, age: 0,
      color: i % 2 === 0 ? '#1a1a2a' : '#ffd452'
    });
  }
  showMpToast('🌑 Protivnik ti je obrnuo komande!');
  sendMp({ type: 'sabotageResult', result: 'applied' });
}

// poziva se kad igrač dobije štit; vraća true ako je štit potrošen na poništavanje sabotaže
// (obrnute komande i/ili magla)
function mpShieldCancelsSabotage() {
  if (!mp.active) {
    // solo: crni cvijet je obična solo mehanika pa ga štit ne dira, ali maglu (zamku) rastjera
    if (fogT <= 0) return false;
    fogT = 0;
    showMpToast('🛡️ Štit je rastjerao maglu!');
    return true;
  }
  if (!invertActive && fogT <= 0) return false;
  const msgs = [];
  if (invertActive) {
    invertActive = false;
    invertTimeLeft = 0;
    invertBadge.classList.add('hidden');
    msgs.push('obrnute komande');
  }
  if (fogT > 0) {
    fogT = 0;
    msgs.push('maglu');
  }
  showMpToast('🛡️ Štit je poništio ' + msgs.join(' i ') + '!');
  return true;
}

// ---------- Feferon (samo multiplayer): pogura pčelicu naprijed par sekundi da prestigne protivnika ----------
// Pozicije feferona dolaze iz zasebnog seedanog RNG-a, pa oba igrača vide iste feferone na istim mjestima,
// a glavni `rand` svijeta ostaje netaknut. Tko ga prvi pokupi, drugome nestaje (poruka 'pepperTaken').
const PEPPER_BOOST_DURATION = 11;   // sekundi
const PEPPER_SPEED_MUL = 1.8;       // koliko brže svijet klizi na vrhuncu
const PEPPER_RAMP_IN = 0.4;         // zalet na početku
const PEPPER_RAMP_OUT = 1.2;        // usporavanje na kraju
const PEPPER_FIRST_AT = 1800;       // world px
const PEPPER_GAP_MIN = 2200;
const PEPPER_GAP_RAND = 1000;
const pepperBadge = document.getElementById('pepperBadge');
const pepperTimeEl = document.getElementById('pepperTime');
let peppers = [];
let pepperRand = Math.random;
let nextPepperAt = PEPPER_FIRST_AT;
let pepperCount = 0;
let pepperBoostT = 0;
let pepperFlameTimer = 0;

function resetPeppers() {
  peppers = [];
  pepperRand = mulberry32(((mp.seed || 0) ^ 0x5bd1e995) >>> 0);
  nextPepperAt = PEPPER_FIRST_AT + pepperRand() * 400;
  pepperCount = 0;
  pepperBoostT = 0;
  pepperFlameTimer = 0;
}

// multiplikator brzine pomicanja svijeta (1 = normalno), core.js ga koristi u update()
function mpSpeedMul() {
  if (pepperBoostT <= 0) return 1;
  const elapsed = PEPPER_BOOST_DURATION - pepperBoostT;
  const k = Math.min(1, elapsed / PEPPER_RAMP_IN, pepperBoostT / PEPPER_RAMP_OUT);
  return 1 + (PEPPER_SPEED_MUL - 1) * k;
}

function spawnPepper(worldX) {
  const minY = H * 0.18;
  const maxY = waterY - MEADOW_RAISE - 50;
  peppers.push({
    id: 'pp_' + (pepperCount++),
    worldX: worldX,
    y: minY + pepperRand() * (maxY - minY),
    r: 16,
    taken: false,
    bob: pepperRand() * Math.PI * 2
  });
}

// ---------- Solo zamke: sabotaže iz multiplayera koje u solo igri pogađaju tebe ----------
// Svaka se prvi put pojavi u svom svijetu (magla u noći, vrtlog u pustinji, crvena ptica u vulkanu) i ostaje u svim
// kasnijim svjetovima, ali najviše 1-2 puta po svijetu. Vulkan nema kraja, pa se dijeli na odsječke duljine jednog svijeta.
// Isto vrijedi i za feferon (ubrzanje, nije zamka) - prvi put na ledenjaku.
const SOLO_TRAPS = [
  { fromWorld: 2, spawn: (x) => spawnFogToken(x) },
  { fromWorld: 3, spawn: (x) => spawnVortexToken(x) },
  { fromWorld: 4, spawn: (x) => spawnPepper(x) },
  { fromWorld: 5, spawn: (x) => spawnRedBirdToken(x) }
];
const SOLO_WORLD_LEN = 23000;     // ~1650 m, koliko otprilike traje jedan svijet
const SOLO_TRAP_EDGE = 1600;      // ne stavljaj zamke tik uz početak/kraj svijeta (portal, cvijet)
const SOLO_TRAP_MIN_GAP = 700;    // razmak između dvije zamke
let soloTrapWorld = 0;            // svijet za koji je raspored već napravljen
let soloTrapSegEnd = 0;           // kraj trenutnog odsječka (za vulkan)
let soloTrapQueue = [];           // [{ x, spawn }] poredano po x

function resetSoloTraps() {
  soloTrapWorld = 0;
  soloTrapSegEnd = 0;
  soloTrapQueue = [];
}

function worldStartX(idx) {
  return [0, world2TriggerX, world3TriggerX, world4TriggerX, world5TriggerX][idx - 1] || 0;
}

function scheduleSoloTraps(idx, fromX, toX) {
  soloTrapQueue = [];
  soloTrapSegEnd = toX;
  const a = fromX + SOLO_TRAP_EDGE, b = toX - SOLO_TRAP_EDGE;
  if (b <= a) return;
  for (const trap of SOLO_TRAPS) {
    if (idx < trap.fromWorld) continue;
    const count = Math.random() < 0.5 ? 1 : 2;
    for (let k = 0; k < count; k++) {
      let x = a + (b - a) * (k + 0.1 + Math.random() * 0.8) / count;
      // odmakni od već postavljenih zamki
      for (const q of soloTrapQueue) if (Math.abs(q.x - x) < SOLO_TRAP_MIN_GAP) x = q.x + SOLO_TRAP_MIN_GAP;
      soloTrapQueue.push({ x: x, spawn: trap.spawn });
    }
  }
  soloTrapQueue.sort((p, q) => p.x - q.x);
}

function updateSoloTraps() {
  // automatsko stvaranje po razmacima je samo za multiplayer
  nextFogTokenAt = nextVortexTokenAt = nextRedBirdTokenAt = nextPepperAt = Infinity;
  const idx = worldIndex();
  const last = idx >= WORLD_ORDER.length;
  if (idx !== soloTrapWorld) {
    soloTrapWorld = idx;
    const from = Math.max(worldStartX(idx), scrollX + W);
    const to = last ? from + SOLO_WORLD_LEN : worldStartX(idx + 1);
    scheduleSoloTraps(idx, from, to);
  } else if (last && scrollX + W > soloTrapSegEnd) {
    scheduleSoloTraps(idx, soloTrapSegEnd, soloTrapSegEnd + SOLO_WORLD_LEN);
  }
  while (soloTrapQueue.length && scrollX + W * 2 > soloTrapQueue[0].x) {
    const q = soloTrapQueue.shift();
    q.spawn(q.x);
  }
}

// poziva se iz core.js update() dok se igra (ne u bonus sobama); vraća true ako je pčelica poginula
function updateMultiplayerWorld(dt, invulnerable) {
  if (!mp.active) {
    // solo: sabotaže su zamke za tebe, 1-2 puta po svijetu (vidi SOLO_TRAPS)
    updateSoloTraps();
    const idx = worldIndex();
    if (idx >= 2) updateFog(dt);
    if (idx >= 3) updateVortexTokens();
    if (idx >= 4) updatePeppers(dt);
    if (idx >= 5) return updateRedBirds(dt, invulnerable);
    return false;
  }
  updatePeppers(dt);
  updateVortexTokens();
  updateFog(dt);
  if (updateDeathFlower()) return true;
  return updateRedBirds(dt, invulnerable);
}

function updatePeppers(dt) {
  if (scrollX + W * 2 > nextPepperAt) {
    spawnPepper(nextPepperAt);
    nextPepperAt += PEPPER_GAP_MIN + pepperRand() * PEPPER_GAP_RAND;
  }

  for (const p of peppers) {
    if (p.taken) continue;
    const dx = (p.worldX - scrollX) - bee.x;
    const dy = (p.y + Math.sin(waveT * 2.4 + p.bob) * 7) - bee.y;
    if (Math.sqrt(dx*dx + dy*dy) < p.r + bee.r) {
      p.taken = true;
      pepperBoostT = PEPPER_BOOST_DURATION;
      if (conn && conn.open) { try { conn.send({ type: 'pepperTaken', id: p.id }); } catch (err) { /* ignore */ } }
      triggerShake(4, 0.2);
      for (let i = 0; i < 22; i++) {
        particles.push({
          x: bee.x, y: bee.y,
          vx: (Math.random()-0.5)*300,
          vy: (Math.random()-0.5)*300 - 40,
          life: 0.7, age: 0,
          color: i % 3 === 0 ? '#ffd452' : (i % 3 === 1 ? '#ff5a1f' : '#d62828')
        });
      }
    }
  }
  peppers = peppers.filter(p => (p.worldX - scrollX) > -60);

  if (pepperBoostT > 0) {
    pepperBoostT = Math.max(0, pepperBoostT - dt);
    // plamen iz pčelice dok feferon djeluje
    pepperFlameTimer -= dt;
    if (pepperFlameTimer <= 0) {
      pepperFlameTimer = 0.025;
      particles.push({
        x: bee.x - 16 + (Math.random()-0.5)*6,
        y: bee.y + 2 + (Math.random()-0.5)*8,
        vx: -160 - Math.random()*80,
        vy: (Math.random()-0.5)*30,
        life: 0.25 + Math.random()*0.15,
        age: 0,
        pollen: true,
        color: Math.random() < 0.5 ? '#ff5a1f' : '#ffb703'
      });
    }
  }
}

function drawPepper(x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-0.35 + Math.sin(waveT * 3) * 0.12);
  // sjaj
  const glow = ctx.createRadialGradient(0, 0, 4, 0, 0, 28);
  glow.addColorStop(0, 'rgba(255,120,40,0.45)');
  glow.addColorStop(1, 'rgba(255,120,40,0)');
  ctx.fillStyle = glow;
  ctx.beginPath(); ctx.arc(0, 0, 28, 0, Math.PI * 2); ctx.fill();
  // tijelo feferona
  ctx.fillStyle = '#d62828';
  ctx.beginPath();
  ctx.moveTo(-6, -12);
  ctx.quadraticCurveTo(10, -10, 7, 4);
  ctx.quadraticCurveTo(4, 14, -4, 18);
  ctx.quadraticCurveTo(0, 8, -8, -2);
  ctx.quadraticCurveTo(-11, -9, -6, -12);
  ctx.fill();
  // odsjaj
  ctx.strokeStyle = 'rgba(255,200,180,0.7)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-3, -7);
  ctx.quadraticCurveTo(3, -5, 2, 3);
  ctx.stroke();
  // peteljka
  ctx.fillStyle = '#3a8d2f';
  ctx.beginPath();
  ctx.ellipse(-4, -13, 6, 3, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#2d6e24';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(-4, -14);
  ctx.quadraticCurveTo(-4, -20, 1, -22);
  ctx.stroke();
  ctx.restore();
}

function drawBoostFlame(x, y, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  const len = 26 + Math.sin(waveT * 40) * 6;
  const g = ctx.createLinearGradient(x - 12, y, x - 12 - len, y);
  g.addColorStop(0, 'rgba(255,220,90,0.95)');
  g.addColorStop(0.5, 'rgba(255,90,31,0.8)');
  g.addColorStop(1, 'rgba(214,40,40,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(x - 10, y - 7);
  ctx.quadraticCurveTo(x - 12 - len * 0.6, y - 4, x - 12 - len, y + 2);
  ctx.quadraticCurveTo(x - 12 - len * 0.6, y + 8, x - 10, y + 8);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// ---------- Magla (samo multiplayer): skupiš je, a protivnik ~4 s jedva vidi svoju pčelicu ----------
// Svijet i prepreke ostaju vidljivi (pod blagom izmaglicom), ali pčelica, pelud iza nje, leptiri pratioci,
// plamen feferona i mjehurić štita gotovo nestanu - protivnik leti "na osjećaj".
// Oblačići magle lebde neovisno o pčelici, da ne odaju njezinu visinu.
// Štit je rastjera (štit se potroši), a štit skupljen u magli također je rastjera.
// U bonus sobi vrijeme magle stoji i nastavlja se kad izađeš.
const FOG_TOKEN_FIRST_AT = 4200;   // world px
const FOG_TOKEN_GAP_MIN = 3000;
const FOG_TOKEN_GAP_RAND = 1400;
const FOG_DURATION = 4;
const FOG_FADE_IN = 0.4;
const FOG_FADE_OUT = 0.6;
const FOG_BEE_MIN_ALPHA = 0.08;    // koliko se pčelica još nazire u najgušćoj magli
let fogTokens = [];
let fogRand = Math.random;
let nextFogTokenAt = FOG_TOKEN_FIRST_AT;
let fogTokenCount = 0;
let fogT = 0;

function resetFog() {
  fogTokens = [];
  fogRand = mulberry32(((mp.seed || 0) ^ 0x85ebca6b) >>> 0);
  nextFogTokenAt = FOG_TOKEN_FIRST_AT + fogRand() * 500;
  fogTokenCount = 0;
  fogT = 0;
}

// gustoća magle 0..1 (s postepenim ulaskom i izlaskom)
function fogStrength() {
  if (fogT <= 0) return 0;
  const elapsed = FOG_DURATION - fogT;
  return Math.max(0, Math.min(1, elapsed / FOG_FADE_IN, fogT / FOG_FADE_OUT));
}

// prozirnost vlastite pčelice (1 = normalno), core.js je koristi pri crtanju
function mpBeeAlpha() {
  if (gameState !== 'playing') return 1;
  const k = fogStrength();
  return 1 - (1 - FOG_BEE_MIN_ALPHA) * k;
}

function spawnFogToken(worldX) {
  const minY = H * 0.18;
  const maxY = waterY - MEADOW_RAISE - 50;
  fogTokens.push({
    id: 'fg_' + (fogTokenCount++),
    worldX: worldX,
    y: minY + fogRand() * (maxY - minY),
    r: 18,
    taken: false,
    bob: fogRand() * Math.PI * 2
  });
}

function updateFog(dt) {
  if (scrollX + W * 2 > nextFogTokenAt) {
    spawnFogToken(nextFogTokenAt);
    nextFogTokenAt += FOG_TOKEN_GAP_MIN + fogRand() * FOG_TOKEN_GAP_RAND;
  }
  for (const t of fogTokens) {
    if (t.taken) continue;
    const dx = (t.worldX - scrollX) - bee.x;
    const dy = (t.y + Math.sin(waveT * 1.8 + t.bob) * 7) - bee.y;
    if (Math.sqrt(dx*dx + dy*dy) < t.r + bee.r) {
      t.taken = true;
      if (mp.active) {
        sendMp({ type: 'fogTaken', id: t.id });
        sendMp({ type: 'fogAttack' });
      } else {
        receiveFog(); // solo (noć i dalje): magla zavije tebe, štit je rastjera
      }
      for (let i = 0; i < 18; i++) {
        particles.push({
          x: bee.x, y: bee.y,
          vx: (Math.random()-0.5)*240, vy: (Math.random()-0.5)*240 - 30,
          life: 0.8, age: 0,
          color: i % 2 === 0 ? '#dfe4ea' : '#a4b0be'
        });
      }
    }
  }
  fogTokens = fogTokens.filter(t => (t.worldX - scrollX) > -60);

  if (fogT > 0) fogT = Math.max(0, fogT - dt);
}

function receiveFog() {
  if (gameState !== 'playing' && gameState !== 'countdown') return;
  if (shieldActive) {
    shieldActive = false;
    shieldTimeLeft = 0;
    shieldBadge.classList.add('hidden');
    triggerShake(3, 0.15);
    showMpToast('🛡️ Štit je rastjerao maglu!');
    sendMp({ type: 'fogResult', result: 'blocked' });
    return;
  }
  // nova magla dok je stara još tu samo produži trajanje, bez ponovnog fade-ina
  fogT = fogT > 0 ? Math.max(fogT, FOG_DURATION - FOG_FADE_IN) : FOG_DURATION;
  showMpToast(mp.active ? '🌫️ Protivnik te zavio u maglu!' : '🌫️ Zavila te magla!');
  sendMp({ type: 'fogResult', result: 'applied' });
}

function drawFogBlob(x, y, r, alpha) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, 'rgba(236,240,245,' + alpha + ')');
  g.addColorStop(0.6, 'rgba(220,226,234,' + (alpha * 0.6) + ')');
  g.addColorStop(1, 'rgba(220,226,234,0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
}

// maglica preko cijelog ekrana + oblačići oko stupca u kojem leti pčelica (ne prate njezinu visinu)
function drawMultiplayerOverlay() {
  const k = gameState === 'playing' && !inBonus ? fogStrength() : 0;
  if (k <= 0) return;
  ctx.save();
  ctx.fillStyle = 'rgba(225,230,238,' + (0.3 * k) + ')';
  ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 10; i++) {
    const span = 420;
    const x = bee.x - 220 + ((i * 97 + waveT * 45) % span);
    const y = ((i * 151 + 60) % (H - 120)) + 40 + Math.sin(waveT * 0.8 + i * 1.7) * 35;
    drawFogBlob(x, y, 70 + (i % 3) * 20, 0.42 * k);
  }
  ctx.restore();
}

function drawFogPuffs(x, y, alpha) {
  ctx.save();
  for (let i = 0; i < 4; i++) {
    const a = waveT * 1.5 + i * (Math.PI / 2);
    drawFogBlob(x + Math.cos(a) * 12, y + Math.sin(a) * 8, 22, 0.5 * alpha);
  }
  ctx.restore();
}

function drawFogToken(x, y) {
  ctx.save();
  const pulse = 1 + Math.sin(waveT * 5) * 0.06;
  const glow = ctx.createRadialGradient(x, y, 6, x, y, 30 * pulse);
  glow.addColorStop(0, 'rgba(200,210,225,0.5)');
  glow.addColorStop(1, 'rgba(200,210,225,0)');
  ctx.fillStyle = glow;
  ctx.beginPath(); ctx.arc(x, y, 30 * pulse, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(87,96,111,0.6)';
  ctx.beginPath(); ctx.arc(x, y, 19 * pulse, 0, Math.PI * 2); ctx.fill();
  // oblačić magle
  const drift = Math.sin(waveT * 2) * 2;
  ctx.fillStyle = '#eef1f5';
  ctx.beginPath();
  ctx.arc(x - 6 + drift, y + 2, 7, 0, Math.PI * 2);
  ctx.arc(x + 1 + drift, y - 3, 8, 0, Math.PI * 2);
  ctx.arc(x + 8 + drift, y + 2, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(238,241,245,0.8)';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - 10 - drift, y + 11); ctx.lineTo(x + 6 - drift, y + 11);
  ctx.moveTo(x - 4 + drift, y + 15); ctx.lineTo(x + 11 + drift, y + 15);
  ctx.stroke();
  ctx.restore();
}

// ---------- Cvijet smrti (samo multiplayer): pojavi se samo jednom u igri, tko ga skupi protivniku uzima život ----------
// Štit ne štiti od njega. Ako je protivniku to zadnji život, pogine.
// Ako stigne dok je protivnik u bonus sobi ili u vrtlogu, primijeni se čim izađe.
const DEATH_FLOWER_MIN_AT = 5000;    // world px (~360 m)
const DEATH_FLOWER_RAND_AT = 4000;   // pojavi se negdje između ~360 i ~640 m
const DEATH_FLOWER_R = 20;
let deathFlower = null;
let deathFlowerAt = 0;
let deathFlowerSpawned = false;
let deathFlowerYRand = 0.5;
let pendingDeathFlower = 0;

function resetDeathFlower() {
  const r = mulberry32(((mp.seed || 0) ^ 0x3c6ef372) >>> 0);
  deathFlowerAt = DEATH_FLOWER_MIN_AT + r() * DEATH_FLOWER_RAND_AT;
  deathFlower = null;
  deathFlowerSpawned = false;
  pendingDeathFlower = 0;
  deathFlowerYRand = r();
}

// vraća true ako je pčelica poginula
function updateDeathFlower() {
  if (!deathFlowerSpawned && scrollX + W * 2 > deathFlowerAt) {
    deathFlowerSpawned = true;
    const minY = H * 0.2;
    const maxY = waterY - MEADOW_RAISE - 60;
    deathFlower = { worldX: deathFlowerAt, y: minY + deathFlowerYRand * (maxY - minY), taken: false };
  }
  if (deathFlower && !deathFlower.taken) {
    const dx = (deathFlower.worldX - scrollX) - bee.x;
    const dy = (deathFlower.y + Math.sin(waveT * 1.6) * 6) - bee.y;
    if (Math.sqrt(dx*dx + dy*dy) < DEATH_FLOWER_R + bee.r) {
      deathFlower.taken = true;
      sendMp({ type: 'deathFlowerTaken' });
      sendMp({ type: 'deathFlowerAttack' });
      showMpToast('💀 Skupio/la si cvijet smrti!');
      triggerShake(5, 0.25);
      for (let i = 0; i < 26; i++) {
        particles.push({
          x: bee.x, y: bee.y,
          vx: (Math.random()-0.5)*320, vy: (Math.random()-0.5)*320 - 40,
          life: 0.8, age: 0,
          color: i % 3 === 0 ? '#fff8e7' : (i % 3 === 1 ? '#6a0572' : '#1a1a2a')
        });
      }
    } else if ((deathFlower.worldX - scrollX) < -60) {
      deathFlower = null;
    }
  }

  // primljeni cvijet smrti - čeka da pčelica izađe iz vrtloga
  if (pendingDeathFlower > 0 && vortexT <= 0) {
    pendingDeathFlower -= 1;
    return applyDeathFlower();
  }
  return false;
}

function receiveDeathFlower() {
  if (!mp.active || (gameState !== 'playing' && gameState !== 'countdown')) return;
  pendingDeathFlower += 1;
}

function applyDeathFlower() {
  triggerShake(7, 0.35);
  for (let i = 0; i < 20; i++) {
    particles.push({
      x: bee.x, y: bee.y,
      vx: (Math.random()-0.5)*260, vy: (Math.random()-0.5)*260 - 40,
      life: 0.8, age: 0,
      color: i % 2 === 0 ? '#6a0572' : '#1a1a2a'
    });
  }
  if (lives > 1) {
    lives -= 1;
    updateLivesHUD();
    hitInvulnT = HIT_INVULN_DURATION;
    scareButterflies();
    showMpToast('💀 Protivnik ti je uzeo život cvijetom smrti!');
    sendMp({ type: 'deathFlowerResult', result: 'lifeLost' });
    return false;
  }
  sendMp({ type: 'deathFlowerResult', result: 'killed' });
  triggerDeath('deathflower');
  return true;
}

function drawDeathFlower(x, y) {
  ctx.save();
  ctx.translate(x, y);
  // tamna aura
  const pulse = 1 + Math.sin(waveT * 4) * 0.08;
  const aura = ctx.createRadialGradient(0, 0, 8, 0, 0, 40 * pulse);
  aura.addColorStop(0, 'rgba(106,5,114,0.55)');
  aura.addColorStop(1, 'rgba(26,26,42,0)');
  ctx.fillStyle = aura;
  ctx.beginPath(); ctx.arc(0, 0, 40 * pulse, 0, Math.PI * 2); ctx.fill();
  // latice
  ctx.save();
  ctx.rotate(waveT * 0.8);
  for (let i = 0; i < 6; i++) {
    ctx.rotate(Math.PI / 3);
    ctx.fillStyle = i % 2 === 0 ? '#2b0a3d' : '#4a0e4e';
    ctx.beginPath();
    ctx.ellipse(0, -13, 7, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(214,40,40,0.8)';
    ctx.lineWidth = 1.2;
    ctx.stroke();
  }
  ctx.restore();
  // lubanja u sredini
  ctx.fillStyle = '#f1ece2';
  ctx.beginPath(); ctx.arc(0, -1, 8, 0, Math.PI * 2); ctx.fill();
  ctx.fillRect(-4.5, 4, 9, 5);
  ctx.fillStyle = '#1a1a2a';
  ctx.beginPath(); ctx.arc(-3, -2, 2.2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(3, -2, 2.2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(0, 1); ctx.lineTo(-1.3, 3.5); ctx.lineTo(1.3, 3.5); ctx.closePath(); ctx.fill();
  ctx.fillRect(-2.5, 6, 1, 3);
  ctx.fillRect(1.5, 6, 1, 3);
  ctx.restore();
}

// ---------- Vrtlog (samo multiplayer): skupiš ga, a protivnika zahvati vrtlog ----------
// Protivnik 2-3 sekunde nema kontrolu: vrtlog ga vrti i baca gore-dolje (za to vrijeme mu ništa ne može nauditi),
// a onda ga izbaci na nasumičnu visinu s nasumičnom brzinom, pa mora brzo preuzeti kontrolu.
// Kao i kod crnog cvijeta, štit ga razbije (štit se potroši). Vrtlog primljen u bonus sobi čeka izlazak.
const VORTEX_TOKEN_FIRST_AT = 3400;   // world px
const VORTEX_TOKEN_GAP_MIN = 2800;
const VORTEX_TOKEN_GAP_RAND = 1300;
const VORTEX_MIN_TIME = 2;
const VORTEX_RAND_TIME = 1;            // ukupno 2-3 s
const VORTEX_BOB_AMP = 75;             // koliko ga baca gore-dolje
const VORTEX_EJECT_GRACE = 0.6;        // kratka zaštita nakon izbacivanja da ne pogine istog trena
let vortexTokens = [];
let vortexRand = Math.random;
let nextVortexTokenAt = VORTEX_TOKEN_FIRST_AT;
let vortexTokenCount = 0;
let vortexT = 0;            // preostalo vrijeme u vrtlogu (0 = slobodan)
let vortexTotal = 0;
let vortexCenterY = 0;
let vortexSpin = 0;
let pendingVortex = false;

function resetVortex() {
  vortexTokens = [];
  vortexRand = mulberry32(((mp.seed || 0) ^ 0x165667b1) >>> 0);
  nextVortexTokenAt = VORTEX_TOKEN_FIRST_AT + vortexRand() * 500;
  vortexTokenCount = 0;
  vortexT = 0;
  pendingVortex = false;
  if (bee) delete bee.spin;
}

function vortexSafeBand() {
  return { top: H * 0.2, bottom: waterY - MEADOW_RAISE - 80 };
}

function spawnVortexToken(worldX) {
  const minY = H * 0.18;
  const maxY = waterY - MEADOW_RAISE - 50;
  vortexTokens.push({
    id: 'vt_' + (vortexTokenCount++),
    worldX: worldX,
    y: minY + vortexRand() * (maxY - minY),
    r: 18,
    taken: false,
    bob: vortexRand() * Math.PI * 2
  });
}

function updateVortexTokens() {
  if (scrollX + W * 2 > nextVortexTokenAt) {
    spawnVortexToken(nextVortexTokenAt);
    nextVortexTokenAt += VORTEX_TOKEN_GAP_MIN + vortexRand() * VORTEX_TOKEN_GAP_RAND;
  }
  for (const t of vortexTokens) {
    if (t.taken) continue;
    const dx = (t.worldX - scrollX) - bee.x;
    const dy = (t.y + Math.sin(waveT * 2 + t.bob) * 7) - bee.y;
    if (Math.sqrt(dx*dx + dy*dy) < t.r + bee.r) {
      t.taken = true;
      if (mp.active) {
        sendMp({ type: 'vortexTaken', id: t.id });
        sendMp({ type: 'vortexAttack' });
      } else {
        receiveVortex(); // solo (pustinja i dalje): vrtlog uhvati tebe, štit ga razbije
      }
      for (let i = 0; i < 20; i++) {
        particles.push({
          x: bee.x, y: bee.y,
          vx: (Math.random()-0.5)*280, vy: (Math.random()-0.5)*280 - 40,
          life: 0.7, age: 0,
          color: i % 2 === 0 ? '#48cae4' : '#caf0f8'
        });
      }
    }
  }
  vortexTokens = vortexTokens.filter(t => (t.worldX - scrollX) > -60);
}

function receiveVortex() {
  if (gameState !== 'playing' && gameState !== 'countdown') return;
  if (shieldActive) {
    shieldActive = false;
    shieldTimeLeft = 0;
    shieldBadge.classList.add('hidden');
    triggerShake(3, 0.15);
    showMpToast('🛡️ Štit je razbio vrtlog!');
    sendMp({ type: 'vortexResult', result: 'blocked' });
    return;
  }
  pendingVortex = true; // pokreće se u mpUpdateVortex (odmah, ili kad izađeš iz bonus sobe)
  sendMp({ type: 'vortexResult', result: 'applied' });
}

function startVortex() {
  vortexTotal = VORTEX_MIN_TIME + Math.random() * VORTEX_RAND_TIME;
  vortexT = vortexTotal;
  const band = vortexSafeBand();
  vortexCenterY = Math.max(band.top + VORTEX_BOB_AMP, Math.min(band.bottom - VORTEX_BOB_AMP, bee.y));
  vortexSpin = 0;
  stuckBird = null;
  bee.vy = 0;
  triggerShake(4, 0.25);
  showMpToast('🌀 Uhvatio te vrtlog!');
}

// poziva se iz core.js update(); vraća true dok vrtlog drži pčelicu (nema kontrole, ne može se ozlijediti)
function mpUpdateVortex(dt) {
  if (pendingVortex && vortexT <= 0) {
    pendingVortex = false;
    startVortex();
  }
  if (vortexT <= 0) return false;

  vortexT -= dt;
  const elapsed = vortexTotal - vortexT;
  const ramp = Math.min(1, elapsed / 0.3);
  vortexSpin += dt * 14;
  bee.spin = vortexSpin;
  bee.y = vortexCenterY + Math.sin(elapsed * 9) * VORTEX_BOB_AMP * ramp
                        + Math.sin(elapsed * 23) * 12 * ramp;
  bee.vy = 0;

  if (vortexT <= 0) {
    // izbacivanje: nasumična visina i smjer - igrač ne zna unaprijed kamo će ga baciti
    vortexT = 0;
    delete bee.spin;
    const band = vortexSafeBand();
    bee.y = band.top + Math.random() * (band.bottom - band.top);
    bee.vy = Math.random() < 0.5 ? -(380 + Math.random() * 140) : (220 + Math.random() * 160);
    hitInvulnT = Math.max(hitInvulnT, VORTEX_EJECT_GRACE);
    triggerShake(5, 0.2);
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2;
      particles.push({
        x: bee.x, y: bee.y,
        vx: Math.cos(a) * 240, vy: Math.sin(a) * 240,
        life: 0.5, age: 0,
        color: i % 2 === 0 ? '#48cae4' : '#caf0f8'
      });
    }
    return false;
  }
  return true;
}

function drawVortexSwirl(x, y, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  ctx.rotate(waveT * 8);
  ctx.lineCap = 'round';
  for (let i = 0; i < 3; i++) {
    ctx.rotate((Math.PI * 2) / 3);
    ctx.strokeStyle = i === 0 ? 'rgba(72,202,228,0.85)' : (i === 1 ? 'rgba(144,224,239,0.75)' : 'rgba(202,240,248,0.7)');
    ctx.lineWidth = 3.5 - i * 0.7;
    ctx.beginPath();
    for (let s = 0; s <= 20; s++) {
      const a = s * 0.22;
      const r = 14 + s * 1.6;
      const px = Math.cos(a) * r, py = Math.sin(a) * r * 0.75;
      if (s === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }
  ctx.restore();
}

function drawVortexToken(x, y) {
  ctx.save();
  const pulse = 1 + Math.sin(waveT * 5) * 0.06;
  const glow = ctx.createRadialGradient(x, y, 6, x, y, 30 * pulse);
  glow.addColorStop(0, 'rgba(72,202,228,0.45)');
  glow.addColorStop(1, 'rgba(72,202,228,0)');
  ctx.fillStyle = glow;
  ctx.beginPath(); ctx.arc(x, y, 30 * pulse, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(3,4,94,0.55)';
  ctx.beginPath(); ctx.arc(x, y, 19 * pulse, 0, Math.PI * 2); ctx.fill();
  ctx.translate(x, y);
  ctx.rotate(-waveT * 6);
  ctx.strokeStyle = '#caf0f8';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  for (let s = 0; s <= 40; s++) {
    const a = s * 0.3;
    const r = 1 + s * 0.4;
    const px = Math.cos(a) * r, py = Math.sin(a) * r;
    if (s === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.stroke();
  ctx.restore();
}

// ---------- Crvena ptica (samo multiplayer): skupiš je, a protivniku doleti crvena ptica lovac ----------
// Žeton (crvena ptica u krugu) pojavljuje se na istim mjestima kod oba igrača (zaseban seedani RNG).
// Tko ga prvi skupi, protivniku pošalje napad: najprije treperi upozorenje "!" na desnom rubu,
// a onda uleti crvena ptica koja kao osa prati visinu pčelice. Štit je upija kao i ostale prepreke.
// Napad koji stigne dok je igrač u bonus sobi čeka dok se ne vrati.
const REDBIRD_TOKEN_FIRST_AT = 2600;  // world px
const REDBIRD_TOKEN_GAP_MIN = 2600;
const REDBIRD_TOKEN_GAP_RAND = 1200;
const REDBIRD_WARN_TIME = 1.2;        // sekundi upozorenja prije ulijetanja
const REDBIRD_SPEED_MUL = 2.3;        // brže od ose (1.75)
const REDBIRD_HOMING_RATE = 2.6;
const REDBIRD_R = 15;
const RED_BIRD_PAL = { body: '#c1121f', head: '#e63946', wing1: '#8d0801', wing2: '#a4161a', tail: '#780000' };
let redBirdTokens = [];
let redBirdRand = Math.random;
let nextRedBirdTokenAt = REDBIRD_TOKEN_FIRST_AT;
let redBirdTokenCount = 0;
let redBirds = [];          // ptice koje napadaju mene
let pendingRedBirds = 0;    // napadi primljeni dok sam bio u bonus sobi

function resetRedBirds() {
  redBirdTokens = [];
  redBirdRand = mulberry32(((mp.seed || 0) ^ 0x27d4eb2f) >>> 0);
  nextRedBirdTokenAt = REDBIRD_TOKEN_FIRST_AT + redBirdRand() * 500;
  redBirdTokenCount = 0;
  redBirds = [];
  pendingRedBirds = 0;
}

function spawnRedBirdToken(worldX) {
  const minY = H * 0.18;
  const maxY = waterY - MEADOW_RAISE - 50;
  redBirdTokens.push({
    id: 'rb_' + (redBirdTokenCount++),
    worldX: worldX,
    y: minY + redBirdRand() * (maxY - minY),
    r: 18,
    taken: false,
    bob: redBirdRand() * Math.PI * 2
  });
}

function receiveRedBird() {
  if (!mp.active || (gameState !== 'playing' && gameState !== 'countdown')) return;
  pendingRedBirds += 1;
  showMpToast('🐦 Protivnik ti šalje crvenu pticu!');
}

function launchRedBird() {
  const y = Math.max(H * 0.12, Math.min(waterY - 60, bee.y));
  redBirds.push({
    warnT: REDBIRD_WARN_TIME,
    worldX: 0,   // postavlja se kad upozorenje istekne
    y: y,
    r: REDBIRD_R,
    flapPhase: Math.random() * Math.PI * 2,
    hit: false,
    active: false
  });
}

function updateRedBirds(dt, invulnerable) {
  // žetoni
  if (scrollX + W * 2 > nextRedBirdTokenAt) {
    spawnRedBirdToken(nextRedBirdTokenAt);
    nextRedBirdTokenAt += REDBIRD_TOKEN_GAP_MIN + redBirdRand() * REDBIRD_TOKEN_GAP_RAND;
  }
  for (const t of redBirdTokens) {
    if (t.taken) continue;
    const dx = (t.worldX - scrollX) - bee.x;
    const dy = (t.y + Math.sin(waveT * 2.2 + t.bob) * 7) - bee.y;
    if (Math.sqrt(dx*dx + dy*dy) < t.r + bee.r) {
      t.taken = true;
      if (mp.active) {
        sendMp({ type: 'redBirdTaken', id: t.id });
        sendMp({ type: 'redBirdAttack' });
        showMpToast('🐦 Poslao/la si crvenu pticu na protivnika!');
      } else {
        pendingRedBirds += 1; // solo (vulkan): napad ide na tebe
        showMpToast('🐦 Crvena ptica te napada - bježi!');
      }
      for (let i = 0; i < 20; i++) {
        particles.push({
          x: bee.x, y: bee.y,
          vx: (Math.random()-0.5)*280, vy: (Math.random()-0.5)*280 - 40,
          life: 0.7, age: 0,
          color: i % 2 === 0 ? '#e63946' : '#fff8e7'
        });
      }
    }
  }
  redBirdTokens = redBirdTokens.filter(t => (t.worldX - scrollX) > -60);

  // napadi koji su čekali (npr. dok sam bio u bonus sobi)
  while (pendingRedBirds > 0) {
    pendingRedBirds -= 1;
    launchRedBird();
  }

  // ptice lovci
  for (const rb of redBirds) {
    if (!rb.active) {
      rb.warnT -= dt;
      rb.y += (bee.y - rb.y) * Math.min(1, 1.5 * dt); // upozorenje lagano prati pčelicu
      if (rb.warnT <= 0) {
        rb.active = true;
        rb.worldX = scrollX + W + 30;
        rb.curScreenX = W + 30; // bez ovoga bi je filter ispod odmah izbacio kao "izletjela s ekrana"
      }
      continue;
    }
    rb.worldX -= FORWARD_SPEED * (REDBIRD_SPEED_MUL - 1) * dt;
    const screenX = rb.worldX - scrollX;
    // prati visinu pčelice samo dok je ispred nje, nakon toga leti ravno dalje
    if (screenX > bee.x) {
      rb.y += (bee.y - rb.y) * Math.min(1, REDBIRD_HOMING_RATE * dt);
    }
    rb.curScreenX = screenX;
    if (!rb.hit && !invulnerable) {
      const dx = screenX - bee.x;
      const dy = rb.y - bee.y;
      if (Math.sqrt(dx*dx + dy*dy) < rb.r + bee.r - 4) {
        rb.hit = true;
        sendMp({ type: 'redBirdResult', result: shieldActive ? 'blocked' : 'hit' });
        if (!loseLifeOrDie('redbird', null)) {
          triggerDeath('redbird');
          return true;
        }
      }
    }
  }
  redBirds = redBirds.filter(rb => {
    if (!rb.active || rb.curScreenX > -80) return true;
    if (!rb.hit) sendMp({ type: 'redBirdResult', result: 'dodged' });
    return false;
  });
  return false;
}

function drawRedBirdToken(x, y) {
  ctx.save();
  const pulse = 1 + Math.sin(waveT * 5) * 0.06;
  const glow = ctx.createRadialGradient(x, y, 6, x, y, 30 * pulse);
  glow.addColorStop(0, 'rgba(230,57,70,0.4)');
  glow.addColorStop(1, 'rgba(230,57,70,0)');
  ctx.fillStyle = glow;
  ctx.beginPath(); ctx.arc(x, y, 30 * pulse, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(255,248,231,0.85)';
  ctx.lineWidth = 2.5;
  ctx.setLineDash([5, 4]);
  ctx.lineDashOffset = -waveT * 20;
  ctx.beginPath(); ctx.arc(x, y, 20 * pulse, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(0.8, 0.8);
  drawBird(0, 0, waveT * 10, 1, RED_BIRD_PAL);
  ctx.restore();
}

function drawRedBirdWarning(y) {
  if (Math.floor(waveT * 8) % 2 !== 0) return;
  const x = W - 26;
  ctx.save();
  ctx.fillStyle = 'rgba(214,40,40,0.9)';
  ctx.beginPath(); ctx.arc(x, y, 16, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 22px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('!', x, y + 1);
  ctx.restore();
}

// feferoni + plamen iz pčelice dok feferon djeluje (solo)
function drawPepperLayer() {
  for (const p of peppers) {
    if (p.taken) continue;
    const sx = p.worldX - scrollX;
    if (sx < -40 || sx > W + 40) continue;
    drawPepper(sx, p.y + Math.sin(waveT * 2.4 + p.bob) * 7);
  }
  if (pepperBoostT > 0 && gameState === 'playing') drawBoostFlame(bee.x, bee.y, mpBeeAlpha());
}

function drawFogTokens() {
  for (const t of fogTokens) {
    if (t.taken) continue;
    const sx = t.worldX - scrollX;
    if (sx < -40 || sx > W + 40) continue;
    drawFogToken(sx, t.y + Math.sin(waveT * 1.8 + t.bob) * 7);
  }
}

// žetoni vrtloga + vrtlog oko pčelice dok je drži
function drawVortexLayer() {
  for (const t of vortexTokens) {
    if (t.taken) continue;
    const sx = t.worldX - scrollX;
    if (sx < -40 || sx > W + 40) continue;
    drawVortexToken(sx, t.y + Math.sin(waveT * 2 + t.bob) * 7);
  }
  if (vortexT > 0 && gameState === 'playing') drawVortexSwirl(bee.x, bee.y, mpBeeAlpha());
}

// žetoni crvene ptice + ptice lovci (upozorenje "!" dok ne uleti)
function drawRedBirdLayer() {
  for (const t of redBirdTokens) {
    if (t.taken) continue;
    const sx = t.worldX - scrollX;
    if (sx < -40 || sx > W + 40) continue;
    drawRedBirdToken(sx, t.y + Math.sin(waveT * 2.2 + t.bob) * 7);
  }
  if (gameState !== 'playing' && gameState !== 'dying') return;
  for (const rb of redBirds) {
    if (!rb.active) { drawRedBirdWarning(rb.y); continue; }
    const sx = rb.worldX - scrollX;
    if (sx < -40 || sx > W + 40) continue;
    ctx.save();
    ctx.translate(sx, rb.y);
    ctx.scale(1.3, 1.3);
    drawBird(0, 0, waveT * 16 + rb.flapPhase, -1, RED_BIRD_PAL);
    ctx.restore();
  }
}

// poziva se iz core.js draw() - feferoni, žetoni crvene ptice, ptice lovci, plamen vlastite pčelice, duh protivnika
function drawMultiplayerWorld() {
  const showBadge = pepperBoostT > 0 && gameState === 'playing';
  pepperBadge.classList.toggle('hidden', !showBadge);
  if (showBadge) pepperTimeEl.textContent = pepperBoostT.toFixed(1);
  if (!mp.active) {
    if (!inBonus && !bonusEntering) {
      if (worldIndex() >= 2) drawFogTokens();                  // solo zamka od noći nadalje
      if (worldIndex() >= 3) drawVortexLayer();                // solo zamka od pustinje nadalje
      if (worldIndex() >= 4) drawPepperLayer();                // solo feferon od ledenjaka nadalje
      if (worldTheme === 'volcano') drawRedBirdLayer();         // solo zamka u vulkanu
    }
    return;
  }

  if (!inBonus && !bonusEntering) {
    for (const p of peppers) {
      if (p.taken) continue;
      const sx = p.worldX - scrollX;
      if (sx < -40 || sx > W + 40) continue;
      drawPepper(sx, p.y + Math.sin(waveT * 2.4 + p.bob) * 7);
    }
    if (deathFlower && !deathFlower.taken) {
      const sx = deathFlower.worldX - scrollX;
      if (sx > -50 && sx < W + 50) drawDeathFlower(sx, deathFlower.y + Math.sin(waveT * 1.6) * 6);
    }
    drawFogTokens();
    drawVortexLayer();
    drawRedBirdLayer();
    if (pepperBoostT > 0 && gameState === 'playing') drawBoostFlame(bee.x, bee.y, mpBeeAlpha());
  }
  drawOpponentGhost();
}
