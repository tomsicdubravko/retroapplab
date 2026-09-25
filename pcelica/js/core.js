// ===== Pčelica - jezgra: canvas, stanje igre, fizika pčelice, životi, vrijeme, crtanje pčelice, glavna petlja =====
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const hud = document.getElementById('hud');
const scoreVal = document.getElementById('scoreVal');
const distVal = document.getElementById('distVal');
const livesVal = document.getElementById('livesVal');
const mpBtn = document.getElementById('mpBtn');
const mpOverlay = document.getElementById('mpOverlay');
const mpChoice = document.getElementById('mpChoice');
const mpWaiting = document.getElementById('mpWaiting');
const mpCreateBtn = document.getElementById('mpCreateBtn');
const mpJoinBtn = document.getElementById('mpJoinBtn');
const mpCodeInput = document.getElementById('mpCodeInput');
const mpBackBtn = document.getElementById('mpBackBtn');
const mpCancelBtn = document.getElementById('mpCancelBtn');
const mpCodeDisplay = document.getElementById('mpCodeDisplay');
const mpStatus = document.getElementById('mpStatus');
const mpError = document.getElementById('mpError');
const mpScoreboard = document.getElementById('mpScoreboard');
const mpMyScore = document.getElementById('mpMyScore');
const mpMyDist = document.getElementById('mpMyDist');
const mpOppScore = document.getElementById('mpOppScore');
const mpOppDist = document.getElementById('mpOppDist');
const mpOppStatus = document.getElementById('mpOppStatus');
const spectatorBanner = document.getElementById('spectatorBanner');
const countdownOverlay = document.getElementById('countdownOverlay');
const countdownNum = document.getElementById('countdownNum');
const invertBadge = document.getElementById('invertBadge');
const invertTimeEl = document.getElementById('invertTime');
const shieldBadge = document.getElementById('shieldBadge');
const shieldTimeEl = document.getElementById('shieldTime');
const overlay = document.getElementById('overlay');
const startBtn = document.getElementById('startBtn');
const finalScore = document.getElementById('finalScore');

let W, H, DPR;
const GAME_H = 700; // fixed logical height used by ALL gameplay math (keeps multiplayer worlds in sync)
let GAME_W = 400;
function computeGameW() {
  const aspect = window.innerWidth / window.innerHeight;
  // widen for landscape/desktop screens, but never narrower than the original mobile-portrait width
  return Math.max(400, Math.min(900, Math.round(GAME_H * aspect)));
}
function resize() {
  DPR = Math.min(window.devicePixelRatio || 1, 2);
  GAME_W = computeGameW();
  W = GAME_W; H = GAME_H;
  // fit the logical canvas into the actual viewport (letterboxed), like object-fit:contain
  const scale = Math.min(window.innerWidth / GAME_W, window.innerHeight / GAME_H);
  canvas.style.width = Math.floor(GAME_W * scale) + 'px';
  canvas.style.height = Math.floor(GAME_H * scale) + 'px';
  canvas.width = GAME_W * DPR;
  canvas.height = GAME_H * DPR;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
}
window.addEventListener('resize', resize);
resize();

// ---------- Game state ----------
// ---------- Seeded RNG (used for world-shaping randomness so multiplayer clients generate an identical world) ----------
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
let rand = Math.random; // default for solo play; multiplayer reseeds this at match start
function setSeed(seed) { rand = mulberry32(seed); }

const WATER_HEIGHT_RATIO = 0.16;
let waterY; // water-level baseline; meadow ground sits raised above this
const TERRAIN_MIN_LEN = 900;
const TERRAIN_MAX_LEN = 1500;
const SHORE_BLEND = 80; // px transition width between water and meadow (slope length)
let MEADOW_RAISE = 90; // px the meadow ground sits above the water line (set from H in initTerrain)

let bee, flowers, clouds, particles, birds, fishermen, terrain, wasps;
let score = 0;
let scrollX = 0;
let gameState = 'menu'; // menu, playing, over
let holding = false;
let waveT = 0;
let flapT = 0;
let flapBoost = 0;

const GRAVITY = 1500;      // px/s^2
const HOP_IMPULSE = -480;  // instant upward velocity per tap
const MAX_UP_SPEED = -480;
const MAX_DOWN_SPEED = 560;
const FORWARD_SPEED = 140; // world scroll speed px/s
const METER_SCALE = 14; // world px per "meter" shown in the HUD
const BEE_X_RATIO = 0.3;   // bee stays at fixed screen x
let jumpQueued = false;

// ---------- Black flower power-up: inverts controls for a few seconds ----------
const INVERT_DURATION = 5;
let invertActive = false;
let invertTimeLeft = 0;
let nextSpecialFlowerAt = 1100;
let smokeSpawnTimer = 0;
let pollenSpawnTimer = 0;

// ---------- Gold flower power-up: shield that absorbs one hazard hit ----------
const SHIELD_DURATION = 8;
let shieldActive = false;
let shieldTimeLeft = 0;
let nextGoldFlowerAt = 1700;


// ---------- Lives: an extra life at start, temporary blinking invulnerability after a hit ----------
const STARTING_LIVES = 2;
const HIT_INVULN_DURATION = 3.5;
const LIFE_EVERY_N_FLOWERS = 20;
let lives = STARTING_LIVES;
let hitInvulnT = 0;
let flowersCollected = 0;

// ---------- Weather cycle: clear -> cloudy -> storm (rain+thunder) -> clearing -> clear ----------
const WEATHER_DURATIONS = { clear: 14, cloudy: 6, storm: 11, clearing: 7 };
const WEATHER_TOTAL = WEATHER_DURATIONS.clear + WEATHER_DURATIONS.cloudy + WEATHER_DURATIONS.storm + WEATHER_DURATIONS.clearing;
let weatherT = 0;
let flashAlpha = 0;
let nextFlashAt = -1;
let boltPoints = null;
let raindrops = [];
let weather = { phase: 'clear', progress: 0, skyDarkness: 0, sunAlpha: 1, cloudDarkness: 0, rainIntensity: 0 };

function initRain() {
  raindrops = [];
  for (let i = 0; i < 70; i++) {
    raindrops.push({
      x: Math.random() * W,
      y: Math.random() * H,
      len: 12 + Math.random() * 12,
      speed: 480 + Math.random() * 260,
      drift: -30 - Math.random() * 20
    });
  }
}

function getWeatherPhase(t) {
  let tt = t % WEATHER_TOTAL;
  if (tt < WEATHER_DURATIONS.clear) return { phase: 'clear', progress: tt / WEATHER_DURATIONS.clear };
  tt -= WEATHER_DURATIONS.clear;
  if (tt < WEATHER_DURATIONS.cloudy) return { phase: 'cloudy', progress: tt / WEATHER_DURATIONS.cloudy };
  tt -= WEATHER_DURATIONS.cloudy;
  if (tt < WEATHER_DURATIONS.storm) return { phase: 'storm', progress: tt / WEATHER_DURATIONS.storm };
  tt -= WEATHER_DURATIONS.storm;
  return { phase: 'clearing', progress: tt / WEATHER_DURATIONS.clearing };
}

function updateWeather(dt) {
  weatherT += dt;
  const w = getWeatherPhase(weatherT);
  let skyDarkness, sunAlpha, cloudDarkness, rainIntensity;
  if (w.phase === 'clear') {
    skyDarkness = 0; sunAlpha = 1; cloudDarkness = 0; rainIntensity = 0;
  } else if (w.phase === 'cloudy') {
    skyDarkness = w.progress * 0.55;
    sunAlpha = 1 - w.progress;
    cloudDarkness = w.progress;
    rainIntensity = 0;
  } else if (w.phase === 'storm') {
    skyDarkness = 0.55 + w.progress * 0.1;
    sunAlpha = 0;
    cloudDarkness = 1;
    rainIntensity = Math.min(1, w.progress * 6);
  } else { // clearing
    skyDarkness = 0.65 * (1 - w.progress);
    sunAlpha = w.progress;
    cloudDarkness = 1 - w.progress;
    rainIntensity = Math.max(0, 1 - w.progress * 1.4);
  }
  weather = { phase: w.phase, progress: w.progress, skyDarkness, sunAlpha, cloudDarkness, rainIntensity };

  // zora pred pustinju (world3.js): oluja se smiruje, nema kiše ni munja
  const dawn = worldTheme === 'night' ? dawnProgress() : 0;
  if (dawn > 0) {
    const calm = Math.max(0, 1 - dawn * 2.5);
    weather.skyDarkness *= calm;
    weather.cloudDarkness *= calm;
    weather.rainIntensity *= calm;
  }

  // pustinja, ledenjak, vulkan: umjesto kiše i munja pješčana oluja (world3.js) / mećava (world4.js) / pepeo i vatrene kugle (world5.js)
  if (worldTheme === 'desert' || worldTheme === 'glacier' || worldTheme === 'volcano') {
    nextFlashAt = -1;
    flashAlpha = Math.max(0, flashAlpha - dt * 2.2);
    if (worldTheme === 'desert') updateSandstorm(dt);
    else if (worldTheme === 'glacier') updateBlizzard(dt);
    else updateAshfall(dt);
    return;
  }

  // lightning flashes only during the storm
  if (w.phase === 'storm' && dawn < 0.2) {
    if (nextFlashAt < 0) nextFlashAt = weatherT + 0.6 + Math.random() * 1.5;
    if (weatherT >= nextFlashAt) {
      flashAlpha = 1;
      triggerShake(4, 0.18);
      const bx = Math.random() * W;
      boltPoints = [[bx, 0]];
      let px = bx, py = 0;
      for (let i = 0; i < 5; i++) {
        px += (Math.random() - 0.5) * 40;
        py += H / 6 + Math.random() * 20;
        boltPoints.push([px, py]);
      }
      nextFlashAt = weatherT + 1.4 + Math.random() * 2.6;
    }
  } else {
    nextFlashAt = -1;
  }
  flashAlpha = Math.max(0, flashAlpha - dt * 2.2);

  // rain motion
  if (rainIntensity > 0.02) {
    for (const d of raindrops) {
      d.y += d.speed * dt;
      d.x += d.drift * dt;
      if (d.y > H) { d.y = -20; d.x = Math.random() * W; }
      if (d.x < -20) d.x = W + 20;
    }
  }
}

function initGame() {
  waterY = H * (1 - WATER_HEIGHT_RATIO);
  bee = {
    x: W * BEE_X_RATIO,
    y: H * 0.4,
    vy: 0,
    r: 16
  };
  flowers = [];
  clouds = [];
  particles = [];
  birds = [];
  fishermen = [];
  wasps = [];
  score = 0;
  scrollX = 0;
  scoreVal.textContent = '0';
  distVal.textContent = '0';
  weatherT = 0;
  flashAlpha = 0;
  nextFlashAt = -1;
  invertActive = false;
  invertTimeLeft = 0;
  nextSpecialFlowerAt = W + 1100;
  smokeSpawnTimer = 0;
  pollenSpawnTimer = 0;
  shakeTime = 0;
  shakeDuration = 0;
  shakeMagnitude = 0;
  invertBadge.classList.add('hidden');
  shieldActive = false;
  shieldTimeLeft = 0;
  nextGoldFlowerAt = W + 1700;
  nextWaspAt = W + 1500;
  deathReason = null;
  deathT = 0;
  deathSpin = 0;
  stuckBird = null;
  stuckTimeLeft = 0;
  shieldBadge.classList.add('hidden');
  inBonus = false;
  bonusT = 0;
  bonusHoneyCount = 0;
  bonusDrops = [];
  bonusBubbles = [];
  bonusFlashAlpha = 0;
  bonusExitGraceT = 0;
  bonusExiting = false;
  bonusExitTimer = 0;
  bonusEntering = false;
  bonusEnterTimer = 0;
  bonusEnterType = null;
  finalDist = 0;
  butterflies = [];
  butterflyFollowers = [];
  fleeingButterflies = [];
  trailHistory = [];
  trailClock = 0;
  nextButterflyAt = W + 900;
  lives = STARTING_LIVES;
  hitInvulnT = 0;
  flowersCollected = 0;
  updateLivesHUD();
  spectatorBanner.classList.add('hidden');
  cloudPortals = [];
  nextCloudPortalAt = W + 2200;
  bonusStars = [];
  bonusType = 'honey';
  honeyBank = 0;
  bonusShop = [];
  bonusSubmarine = null;
  bonusPlane = null;
  worldTheme = 'day';
  bigFlower = null;
  sleepSeq = null;
  nightFade = 0;
  world2TriggerX = 21000 + rand() * 4200; // ~1500-1800m in world px (METER_SCALE=14)
  world3TriggerX = world2TriggerX + 21000 + rand() * 4200; // portal u pustinju ~1500-1800m nakon ulaska u noć
  world4TriggerX = world3TriggerX + 21000 + rand() * 4200; // portal na ledenjak ~1500-1800m nakon ulaska u pustinju
  world5TriggerX = world4TriggerX + 21000 + rand() * 4200; // portal u vulkan ~1500-1800m nakon ulaska na ledenjak
  resetRedBirds(); // crvene ptice (multiplayer + solo zamka u vulkanu) kreću ispočetka
  resetVortex();   // vrtlog (multiplayer + solo zamka od pustinje nadalje)
  resetFog();      // magla (multiplayer + solo zamka od noći nadalje)
  resetPeppers();  // feferon (multiplayer + solo od ledenjaka nadalje)
  resetSoloTraps(); // raspored solo zamki (1-2 po svijetu)
  startDesertWind(); dawnGrains = []; dawnGustShown = false; windTextT = 0; // zora i pustinjski vjetar (world3.js)
  worldPortal = null;
  portalSeq = null;
  initTerrain();
  ensureTerrainAhead();
  for (let i = 0; i < 6; i++) spawnFlower(W + i * 180 + 100);
  for (let i = 0; i < 4; i++) spawnCloud(Math.random() * W);
  for (let i = 0; i < 2; i++) spawnBird(W + 400 + i * 500);
}

// ---------- Input ----------
function doJump() {
  if (gameState === 'menu' || gameState === 'countdown') return;
  jumpQueued = true;
}
canvas.addEventListener('pointerdown', (e) => { e.preventDefault(); doJump(); });
window.addEventListener('keydown', (e) => {
  if (e.code === 'Space') { e.preventDefault(); doJump(); }
});

startBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  if (mp.active) {
    endMultiplayer();
    startBtn.textContent = 'Start';
  }
  startGame();
});

function startGame() {
  initGame();
  overlay.classList.add('hidden');
  beginCountdown();
}

let countdownTimer = null;
function beginCountdown() {
  gameState = 'countdown';
  if (countdownTimer) clearInterval(countdownTimer);
  let n = 3;
  countdownNum.textContent = n;
  countdownNum.style.animation = 'none';
  void countdownNum.offsetWidth; // restart the CSS animation
  countdownNum.style.animation = '';
  countdownOverlay.classList.remove('hidden');
  countdownTimer = setInterval(() => {
    n -= 1;
    if (n > 0) {
      countdownNum.textContent = n;
      countdownNum.style.animation = 'none';
      void countdownNum.offsetWidth;
      countdownNum.style.animation = '';
    } else {
      clearInterval(countdownTimer);
      countdownTimer = null;
      countdownOverlay.classList.add('hidden');
      gameState = 'playing';
    }
  }, 1000);
}

const DEATH_ANIM_DURATION = 0.9;
let deathReason = null;
let deathT = 0;
let deathSpin = 0;
let finalDist = 0;

// starts the falling/spinning death animation; the actual game-over screen
// appears only after the animation finishes (see updateDeathAnim)
function triggerDeath(reason) {
  gameState = 'dying';
  holding = false;
  deathReason = reason;
  deathT = 0;
  deathSpin = 0;
  inBonus = false;
  bonusEntering = false;
  bonusExiting = false;
}

function updateDeathAnim(dt) {
  deathT += dt;
  bee.vy += GRAVITY * 1.3 * dt;
  bee.y += bee.vy * dt;
  bee.x += Math.sin(deathT * 14) * 40 * dt; // little wobble as it tumbles
  deathSpin += dt * 9;
  if (deathT >= DEATH_ANIM_DURATION || bee.y > H + 60) {
    finalizeGameOver(deathReason);
  }
}

// keeps the world scrolling/animating for a player who already finished but is
// spectating the opponent's ghost live until they finish too
function updateSpectator(dt) {
  scrollX += FORWARD_SPEED * dt;
  waveT += dt;
  flapT += dt * 4;
  ensureTerrainAhead();
  updateWeather(dt);
  for (const p of particles) {
    p.age += dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    if (p.smoke) p.vx += Math.sin((p.age + p.seed) * 3.5) * 26 * dt;
    else if (p.pollen) p.vy += 40 * dt;
    else p.vy += 500 * dt;
  }
  particles = particles.filter(p => p.age < p.life);
}

function finalizeGameOver(reason) {
  gameState = 'over';
  holding = false;
  invertBadge.classList.add('hidden');
  shieldBadge.classList.add('hidden');
  finalDist = Math.floor(scrollX / METER_SCALE);
  finalScore.textContent = 'Osvojeno cvjetova: ' + score + '  ·  Prijeđeno: ' + finalDist + 'm';
  finalScore.classList.remove('hidden');
  document.querySelector('#overlay h1').textContent =
    (worldTheme === 'desert' && desertDeathText(reason)) ||
    (worldTheme === 'glacier' && glacierDeathText(reason)) ||
    (worldTheme === 'volcano' && volcanoDeathText(reason)) ||
    (reason === 'bird' ? 'Uhvatila te ptica! 🐦' :
    reason === 'fisherman' ? 'Upecala te udica! 🎣' :
    reason === 'fish' ? 'Udarila te riba u skoku! 🐟' :
    reason === 'ground' ? 'Pala je na tlo! 🌱' :
    reason === 'frog' ? 'Uhvatila te žaba jezikom! 🐸' :
    reason === 'wasp' ? 'Ubola te osa! 🐝💥' :
    reason === 'redbird' ? 'Ulovila te protivnikova crvena ptica! 🐦' :
    reason === 'deathflower' ? 'Dokrajčio te protivnikov cvijet smrti! 💀' :
    reason === 'tree' ? 'Udarila je u granu! 🌳' :
    reason === 'submarine' ? 'Zalijepila se za podmornicu! 🚢' :
    reason === 'plane' ? 'Udarila je u avion! ✈️' :
    'Pala je u vodu! 💦');
  startBtn.textContent = 'Igraj ponovo';
  if (mp.active && !mp.opponentFinished) {
    // don't cover the screen yet - let the player watch the opponent's ghost finish live
    spectatorBanner.classList.remove('hidden');
    return;
  }
  overlay.classList.remove('hidden');
}

// returns true if the shield absorbed the hit (game continues), false if not (caller should triggerDeath)
function absorbHazard(reason, bird) {
  if (!shieldActive) return false;
  shieldActive = false;
  shieldTimeLeft = 0;
  shieldBadge.classList.add('hidden');
  triggerShake(3, 0.15);
  for (let i = 0; i < 16; i++) {
    particles.push({
      x: bee.x, y: bee.y,
      vx: (Math.random()-0.5)*260,
      vy: (Math.random()-0.5)*260 - 30,
      life: 0.6, age: 0,
      color: i % 2 === 0 ? '#ffd452' : '#fff6c8'
    });
  }
  if (reason === 'bird' && bird) {
    stuckBird = bird;
    stuckTimeLeft = STUCK_DURATION;
    bee.vy = 0;
  } else {
    bee.vy = -260; // bounce away from the hazard
  }
  return true;
}

// returns true if the hit was survived (shield absorbed it, or a spare life was used), false if the caller should triggerDeath
function loseLifeOrDie(reason, bird) {
  if (absorbHazard(reason, bird)) return true;
  if (lives > 1) {
    lives -= 1;
    updateLivesHUD();
    hitInvulnT = HIT_INVULN_DURATION;
    bee.vy = -260; // small bounce away, same feel as a shield hit
    scareButterflies();
    triggerShake(5, 0.2);
    for (let i = 0; i < 14; i++) {
      particles.push({
        x: bee.x, y: bee.y,
        vx: (Math.random()-0.5)*240,
        vy: (Math.random()-0.5)*240 - 30,
        life: 0.55, age: 0,
        color: i % 2 === 0 ? '#ff6b6b' : '#fff8e7'
      });
    }
    return true;
  }
  return false;
}

// when a life is lost, any trailing butterflies get startled and scatter away instead of following
function scareButterflies() {
  if (!butterflyFollowers.length) return;
  for (let i = 0; i < butterflyFollowers.length; i++) {
    const fw = butterflyFollowers[i];
    const fx = bee.x - (i + 1) * FOLLOW_SPACING;
    const fy = trailYAt(trailClock - (i + 1) * FOLLOW_DELAY);
    const angle = Math.random() * Math.PI * 2;
    const speed = 140 + Math.random() * 100;
    fleeingButterflies.push({
      x: fx, y: fy,
      vx: Math.cos(angle) * speed - 60,
      vy: Math.sin(angle) * speed - 40,
      hue: fw.hue,
      flapPhase: fw.flapPhase,
      age: 0,
      life: 1.1 + Math.random() * 0.4
    });
  }
  butterflyFollowers = [];
}

function updateLivesHUD() {
  livesVal.textContent = '❤️'.repeat(Math.max(0, lives));
}

function awardFlowerLife() {
  flowersCollected += 1;
  if (flowersCollected % LIFE_EVERY_N_FLOWERS === 0) {
    lives += 1;
    updateLivesHUD();
    for (let i = 0; i < 20; i++) {
      particles.push({
        x: bee.x, y: bee.y,
        vx: (Math.random()-0.5)*260,
        vy: (Math.random()-0.5)*260 - 60,
        life: 0.8, age: 0,
        color: i % 2 === 0 ? '#ff6b6b' : '#fff8e7'
      });
    }
  }
}

// ---------- Update ----------
let lastT = null;
function update(dt) {
  if (gameState !== 'playing') return;
  if (bonusEntering) { updateBonusEnter(dt); return; }
  if (inBonus) { updateBonus(dt); return; }
  if (sleepSeq) { updateSleepSequence(dt); return; } // slijetanje na veliki cvijet i pad noći (world2.js)
  if (portalSeq) { updatePortalSequence(dt); return; } // portal u pustinju + mini-splash (world3.js)

  scrollX += FORWARD_SPEED * mpSpeedMul() * dt;
  waveT += dt;
  ensureTerrainAhead();
  distVal.textContent = Math.floor(scrollX / METER_SCALE);

  if (bonusExitGraceT > 0) bonusExitGraceT -= dt;
  if (hitInvulnT > 0) hitInvulnT -= dt;
  if (bonusFlashAlpha > 0) bonusFlashAlpha = Math.max(0, bonusFlashAlpha - dt * 2.5);

  // black flower power-up countdown
  if (invertActive) {
    invertTimeLeft -= dt;
    if (invertTimeLeft <= 0) {
      invertActive = false;
      invertTimeLeft = 0;
      invertBadge.classList.add('hidden');
    } else {
      invertBadge.classList.remove('hidden');
      invertTimeEl.textContent = invertTimeLeft.toFixed(1);
      // smoke puffs swirling around the bee while controls are inverted
      smokeSpawnTimer -= dt;
      if (smokeSpawnTimer <= 0) {
        smokeSpawnTimer = 0.04 + Math.random() * 0.03;
        particles.push({
          x: bee.x + (Math.random()-0.5)*14,
          y: bee.y + (Math.random()-0.5)*14,
          vx: (Math.random()-0.5)*20,
          vy: -20 - Math.random()*20,
          life: 0.8 + Math.random()*0.5,
          age: 0,
          smoke: true,
          seed: Math.random()*10,
          color: Math.random() < 0.5 ? 'rgba(40,40,50,0.8)' : 'rgba(70,60,80,0.8)'
        });
      }
    }
  }

  // gold flower power-up countdown (shield)
  if (shieldActive) {
    shieldTimeLeft -= dt;
    if (shieldTimeLeft <= 0) {
      shieldActive = false;
      shieldTimeLeft = 0;
      shieldBadge.classList.add('hidden');
    } else {
      shieldBadge.classList.remove('hidden');
      shieldTimeEl.textContent = shieldTimeLeft.toFixed(1);
    }
  }

  // stuck to a bird after the shield absorbed a bird collision
  const isStuck = !!stuckBird;
  const vortexed = mpUpdateVortex(dt); // multiplayer: vrtlog drži pčelicu i sam je pomiče
  const invulnerable = isStuck || vortexed || bonusExitGraceT > 0 || hitInvulnT > 0;
  if (stuckBird) {
    stuckTimeLeft -= dt;
    bee.y = stuckBird.curScreenY ?? bee.y;
    bee.vy = 0;
    if (stuckTimeLeft <= 0 || (stuckBird.worldX - scrollX) < -100) {
      stuckBird = null;
      bee.vy = HOP_IMPULSE * 0.7; // little pop when released
    }
  }

  // bee physics - reversed while invertActive: floats up on its own, tap pushes down
  updateDesertWind(dt, !vortexed && !isStuck); // pustinja: udari vjetra guraju pčelicu (world3.js)
  if (vortexed) {
    jumpQueued = false;
  } else if (!isStuck) {
    if (jumpQueued) {
      bee.vy = invertActive ? -HOP_IMPULSE : HOP_IMPULSE;
      jumpQueued = false;
      flapT = 0;
      flapBoost = 0.35;
    }
    bee.vy += (invertActive ? -GRAVITY : GRAVITY) * dt;
    bee.vy = Math.max(MAX_UP_SPEED, Math.min(MAX_DOWN_SPEED, bee.vy));
    bee.y += bee.vy * dt;
  } else {
    jumpQueued = false;
  }

  if (flapBoost > 0) {
    flapBoost -= dt;
    flapT += dt * 22;
  } else {
    flapT += dt * 7;
  }

  pollenSpawnTimer -= dt;
  if (pollenSpawnTimer <= 0 && mpBeeAlpha() >= 1) { // u magli (multiplayer) nema peludi koja bi odala pčelicu
    pollenSpawnTimer = 0.05 + Math.random() * 0.03;
    particles.push({
      x: bee.x - 14 + (Math.random()-0.5)*4,
      y: bee.y + 4 + (Math.random()-0.5)*4,
      vx: -30 + (Math.random()-0.5)*20,
      vy: 10 + Math.random()*20,
      life: 0.6 + Math.random()*0.3,
      age: 0,
      pollen: true,
      color: Math.random() < 0.5 ? '#ffd452' : '#fff6c8'
    });
  }

  if (bee.y - bee.r < 0) {
    bee.y = bee.r;
    bee.vy = 0;
  }
  const beeWorldX = scrollX + bee.x;
  const surfaceY = surfaceYAt(beeWorldX);

  if (!invulnerable) {
    if (checkWorld1Portals(beeWorldX)) return;
  }
  updateCloudPortalSpawns();
  updateBigFlowerSpawn();
  if (checkBigFlower()) return; // kraj svijeta 1 - ne može se promašiti ni izbjeći
  updateWorldPortalSpawn();
  if (worldTheme === 'night') updateDawn(dt); // zora pred pustinju (world3.js)
  if (checkWorldPortal()) return; // kraj noći i pustinje - portali se isto ne mogu promašiti (world3.js)

  if (!invulnerable && bee.y + bee.r >= surfaceY) {
    const seg = terrainAt(beeWorldX);
    bee.y = surfaceY - bee.r;
    const reason = seg.type === 'water' ? 'water' : 'ground';
    const particleColor = seg.type === 'water' ? '#bfe9ff' : '#8fce5c';
    for (let i = 0; i < 14; i++) {
      particles.push({
        x: bee.x + (Math.random()-0.5)*20,
        y: surfaceY,
        vx: (Math.random()-0.5)*(seg.type === 'water' ? 180 : 160),
        vy: -Math.random()*(seg.type === 'water' ? 220 : 160) - (seg.type === 'water' ? 60 : 40),
        life: 0.5 + Math.random()*0.3,
        age: 0,
        color: particleColor
      });
    }
    if (!loseLifeOrDie(reason)) {
      triggerDeath(reason);
      return;
    }
  }

  // world content: flowers, butterflies, clouds, birds, wasps, fishermen, fish, frogs, trees (see world1.js)
  if (updateWorldEntities(dt, invulnerable)) return;
  if (updateMultiplayerWorld(dt, invulnerable)) return;

  // particles
  for (const p of particles) {
    p.age += dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    if (p.smoke) {
      p.vx += Math.sin((p.age + p.seed) * 3.5) * 26 * dt;
    } else if (p.pollen) {
      p.vy += 40 * dt;
    } else {
      p.vy += 500 * dt;
    }
  }
  particles = particles.filter(p => p.age < p.life);

  // fleeing butterflies, scattering after a lost life
  for (const fb of fleeingButterflies) {
    fb.age += dt;
    fb.x += fb.vx * dt;
    fb.y += fb.vy * dt;
    fb.vy += 60 * dt;
  }
  fleeingButterflies = fleeingButterflies.filter(fb => fb.age < fb.life);
}

function drawCloud(x, y, scale, darkness) {
  darkness = darkness || 0;
  const r = Math.round(255 - darkness * 145);
  const gr = Math.round(255 - darkness * 140);
  const b = Math.round(255 - darkness * 120);
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = `rgba(${r},${gr},${b},0.92)`;
  ctx.beginPath();
  ctx.arc(0, 0, 20, 0, Math.PI*2);
  ctx.arc(22, -6, 16, 0, Math.PI*2);
  ctx.arc(-20, -4, 15, 0, Math.PI*2);
  ctx.arc(10, 8, 18, 0, Math.PI*2);
  ctx.arc(-8, 8, 16, 0, Math.PI*2);
  ctx.fill();
  ctx.restore();
}

function hexToRgb(hex) {
  const v = parseInt(hex.slice(1), 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
}
function lerpColorStr(hexA, hexB, t) {
  const a = hexToRgb(hexA), b = hexToRgb(hexB);
  const r = Math.round(a[0] + (b[0]-a[0])*t);
  const g = Math.round(a[1] + (b[1]-a[1])*t);
  const bl = Math.round(a[2] + (b[2]-a[2])*t);
  return `rgb(${r},${g},${bl})`;
}

function drawBee() {
  const wingFlap = gameState === 'dying' ? 0 : Math.sin(flapT) * 0.5;
  ctx.save();
  ctx.translate(bee.x, bee.y);
  const tilt = gameState === 'dying'
    ? deathSpin
    : bee.spin !== undefined ? bee.spin // vrtlog (multiplayer sabotaža)
    : Math.max(-0.4, Math.min(0.5, bee.vy / 900));
  ctx.rotate(tilt);

  // soft drop shadow under the body for a bit of depth
  ctx.beginPath();
  ctx.fillStyle = 'rgba(0,0,0,0.08)';
  ctx.ellipse(1, 3, 16, 12, 0, 0, Math.PI*2);
  ctx.fill();

  // stinger
  ctx.beginPath();
  ctx.fillStyle = '#2b2118';
  ctx.moveTo(-16, 1);
  ctx.lineTo(-23, 0);
  ctx.lineTo(-16, 4);
  ctx.closePath();
  ctx.fill();

  // body - golden gradient base, rounder & cuter
  const bodyGrad = ctx.createRadialGradient(-4, -6, 3, 0, 0, 20);
  bodyGrad.addColorStop(0, '#ffe27a');
  bodyGrad.addColorStop(0.55, '#ffcb3d');
  bodyGrad.addColorStop(1, '#f2a91f');
  ctx.beginPath();
  ctx.fillStyle = bodyGrad;
  ctx.ellipse(0, 0, 18, 14, 0, 0, Math.PI*2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(80,55,10,0.35)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // stripes (curved bands, clipped to body)
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(0, 0, 18, 14, 0, 0, Math.PI*2);
  ctx.clip();
  ctx.fillStyle = '#2b2118';
  ctx.beginPath(); ctx.ellipse(-9, 0, 3.4, 15, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(1, 0, 3.4, 15, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(11, 0, 3.4, 15, 0, 0, Math.PI*2); ctx.fill();
  // subtle top highlight sheen
  ctx.beginPath();
  ctx.fillStyle = 'rgba(255,255,255,0.28)';
  ctx.ellipse(-3, -8, 12, 4.5, -0.2, 0, Math.PI*2);
  ctx.fill();
  ctx.restore();

  // wings - drawn on top of the body so they're clearly visible on the back
  ctx.save();
  ctx.fillStyle = 'rgba(235,247,255,0.85)';
  ctx.strokeStyle = 'rgba(150,180,210,0.8)';
  ctx.lineWidth = 1;
  for (const side of [-1, 1]) {
    ctx.save();
    ctx.translate(side * 4, -11);
    ctx.rotate(side * 0.32 - side * wingFlap);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(side * 16, -12, side * 15, 1);
    ctx.quadraticCurveTo(side * 15, 10, 0, 4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(150,180,210,0.55)';
    ctx.moveTo(1, 1);
    ctx.quadraticCurveTo(side * 10, -5, side * 13, 0);
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();

  // blush
  ctx.beginPath();
  ctx.fillStyle = 'rgba(255,140,140,0.45)';
  ctx.ellipse(5, 4, 3, 2, 0, 0, Math.PI*2);
  ctx.fill();

  if (gameState === 'dying') {
    // dazed X eye while falling
    ctx.strokeStyle = '#2b2118';
    ctx.lineWidth = 1.6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(9.5, -6.5); ctx.lineTo(14.5, -1.5);
    ctx.moveTo(14.5, -6.5); ctx.lineTo(9.5, -1.5);
    ctx.stroke();
    // wavy dazed mouth
    ctx.beginPath();
    ctx.strokeStyle = '#7a4a1a';
    ctx.lineWidth = 1.3;
    ctx.moveTo(7, 2);
    ctx.quadraticCurveTo(9, 4.5, 11, 2);
    ctx.quadraticCurveTo(13, -0.5, 15, 2);
    ctx.stroke();
  } else {
    // eye - big and cute with double highlight
    ctx.beginPath();
    ctx.fillStyle = '#2b2118';
    ctx.arc(12, -4, 3.4, 0, Math.PI*2);
    ctx.fill();
    ctx.beginPath();
    ctx.fillStyle = '#fff';
    ctx.arc(13.2, -5.2, 1.3, 0, Math.PI*2);
    ctx.fill();
    ctx.beginPath();
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.arc(11, -3, 0.7, 0, Math.PI*2);
    ctx.fill();

    // smile
    ctx.beginPath();
    ctx.strokeStyle = '#7a4a1a';
    ctx.lineWidth = 1.3;
    ctx.lineCap = 'round';
    ctx.arc(10, 1, 3, 0.15, Math.PI*0.55);
    ctx.stroke();
  }

  // antennae
  ctx.strokeStyle = '#2b2118';
  ctx.lineWidth = 1.6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(6, -11); ctx.quadraticCurveTo(10, -19, 15, -17);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(15, -17, 1.8, 0, Math.PI*2);
  ctx.fillStyle = '#2b2118';
  ctx.fill();
  ctx.beginPath();
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.arc(14.4, -17.6, 0.6, 0, Math.PI*2);
  ctx.fill();

  ctx.restore();
}

function drawParticles() {
  for (const p of particles) {
    const lifeFrac = p.age / p.life;
    const alpha = 1 - lifeFrac;
    ctx.globalAlpha = Math.max(0, alpha * (p.smoke ? 0.55 : 1));
    if (p.zzz) { // "Z" iznad pčelice dok spava na velikom cvijetu
      ctx.fillStyle = p.color;
      ctx.font = 'bold ' + Math.round(12 + lifeFrac * 10) + 'px Trebuchet MS, sans-serif';
      ctx.fillText('Z', p.x, p.y);
      continue;
    }
    ctx.beginPath();
    ctx.fillStyle = p.color;
    const rad = p.smoke ? (3.5 + lifeFrac * 10) : 3.5;
    ctx.arc(p.x, p.y, rad, 0, Math.PI*2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

let shakeTime = 0;
let shakeDuration = 0;
let shakeMagnitude = 0;
function triggerShake(magnitude, duration) {
  // only escalate, never interrupt a bigger ongoing shake with a smaller one
  if (magnitude >= shakeMagnitude || shakeTime >= shakeDuration) {
    shakeMagnitude = magnitude;
    shakeDuration = duration;
    shakeTime = 0;
  }
}
function getShakeOffset() {
  if (shakeTime >= shakeDuration) return { x: 0, y: 0 };
  const remaining = 1 - shakeTime / shakeDuration;
  const mag = shakeMagnitude * remaining;
  return { x: (Math.random()-0.5) * 2 * mag, y: (Math.random()-0.5) * 2 * mag };
}

function draw() {
  const off = getShakeOffset();
  ctx.save();
  ctx.translate(off.x, off.y);
  drawSceneContent();
  ctx.restore();
}

function drawSceneContent() {
  if (inBonus) { drawBonusScene(); return; }

  const isNight = worldTheme === 'night';
  const isDesert = worldTheme === 'desert';
  const isGlacier = worldTheme === 'glacier';
  const isVolcano = worldTheme === 'volcano';
  if (isVolcano) drawVolcanoBackground(); else if (isGlacier) drawGlacierBackground(); else if (isDesert) drawDesertBackground(); else if (isNight) drawNightBackground(); else drawBackground();

  if (isNight) drawDawnSky(); // zora pred pustinju (world3.js)

  drawWorldBackLayer();

  if (isVolcano) drawVolcanoTerrain(); else if (isGlacier) drawGlacierTerrain(); else if (isDesert) drawDesertTerrain(); else if (isNight) drawNightTerrain(); else drawTerrain();

  drawWorldFrontLayer();

  drawParticles();

  drawMultiplayerWorld();

  const beeAlpha = mpBeeAlpha(); // < 1 dok je pčelica u magli (multiplayer sabotaža)
  if (gameState !== 'menu' && butterflyFollowers.length) {
    ctx.globalAlpha = beeAlpha;
    for (let i = butterflyFollowers.length - 1; i >= 0; i--) {
      const fw = butterflyFollowers[i];
      const fx = bee.x - (i + 1) * FOLLOW_SPACING;
      const fy = trailYAt(trailClock - (i + 1) * FOLLOW_DELAY);
      drawButterfly(fx, fy, waveT * 9 + fw.flapPhase, fw.hue);
    }
    ctx.globalAlpha = 1;
  }

  for (const fb of fleeingButterflies) {
    const alpha = Math.max(0, 1 - fb.age / fb.life);
    ctx.globalAlpha = alpha;
    drawButterfly(fb.x, fb.y, fb.age * 30 + fb.flapPhase, fb.hue);
    ctx.globalAlpha = 1;
  }

  const spectating = gameState === 'over' && mp.active && !mp.resultShown;
  if (gameState !== 'menu' && !spectating) {
    const blinking = hitInvulnT > 0 && Math.floor(hitInvulnT * 10) % 2 === 0;
    ctx.globalAlpha = (blinking ? 0.3 : 1) * beeAlpha;
    drawBee();
    ctx.globalAlpha = beeAlpha;
    if (shieldActive) drawShieldBubble(bee.x, bee.y);
    ctx.globalAlpha = 1;
  }

  drawMultiplayerOverlay();

  if (bonusEntering) drawBonusEnterEffect();

  if (isVolcano) drawAshfall(); else if (isGlacier) drawBlizzard(); else if (isDesert) drawSandstorm(); else drawRain();
  drawLightning();
  if (bonusFlashAlpha > 0) drawBonusFlash();

  if (isNight && !portalSeq) drawDawnWind(); // pijesak koji leti pred kraj noći
  drawDesertWind();                          // linije vjetra u pustinji
  drawWindText();                            // "Fuuuš!"

  drawSleepOverlay();
  drawPortalOverlay();
}

function drawShieldBubble(x, y) {
  const pulse = Math.sin(waveT * 6) * 2;
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  ctx.strokeStyle = 'rgba(255,212,82,0.85)';
  ctx.lineWidth = 2.5;
  ctx.arc(0, 0, 26 + pulse, 0, Math.PI*2);
  ctx.stroke();
  ctx.beginPath();
  ctx.fillStyle = 'rgba(255,212,82,0.12)';
  ctx.arc(0, 0, 26 + pulse, 0, Math.PI*2);
  ctx.fill();
  // small sparkle dots orbiting the bubble
  for (let i = 0; i < 3; i++) {
    const a = waveT * 2 + (i * Math.PI * 2 / 3);
    const sx = Math.cos(a) * (26 + pulse);
    const sy = Math.sin(a) * (26 + pulse);
    ctx.beginPath();
    ctx.fillStyle = '#fff6c8';
    ctx.arc(sx, sy, 2.4, 0, Math.PI*2);
    ctx.fill();
  }
  ctx.restore();
}

function drawRain() {
  if (weather.rainIntensity <= 0.02) return;
  ctx.save();
  ctx.strokeStyle = `rgba(210,230,245,${0.35 + weather.rainIntensity * 0.35})`;
  ctx.lineWidth = 1.6;
  ctx.lineCap = 'round';
  for (const d of raindrops) {
    ctx.beginPath();
    ctx.moveTo(d.x, d.y);
    ctx.lineTo(d.x + d.drift * 0.03, d.y + d.len);
    ctx.stroke();
  }
  ctx.restore();
}

function drawLightning() {
  if (flashAlpha <= 0.01) return;
  ctx.save();
  ctx.fillStyle = `rgba(255,255,255,${flashAlpha * 0.55})`;
  ctx.fillRect(0, 0, W, H);
  if (boltPoints && flashAlpha > 0.25) {
    ctx.strokeStyle = `rgba(255,255,255,${Math.min(1, flashAlpha)})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    boltPoints.forEach((p, i) => { if (i === 0) ctx.moveTo(p[0], p[1]); else ctx.lineTo(p[0], p[1]); });
    ctx.stroke();
  }
  ctx.restore();
}

// ---------- Loop ----------
function loop(t) {
  if (lastT === null) lastT = t;
  let dt = (t - lastT) / 1000;
  dt = Math.min(dt, 0.033);
  lastT = t;

  if (gameState === 'menu') {
    waveT += dt;
    flapT += dt * 4;
    updateWeather(dt);
  } else if (gameState === 'countdown') {
    waveT += dt;
    flapT += dt * 4;
  } else if (gameState === 'dying') {
    updateDeathAnim(dt);
  } else if (gameState === 'over' && mp.active && !mp.resultShown) {
    updateSpectator(dt);
  } else {
    update(dt);
    if (gameState === 'playing') updateWeather(dt);
  }
  if (shakeTime < shakeDuration) shakeTime += dt;
  draw();
  requestAnimationFrame(loop);
}
