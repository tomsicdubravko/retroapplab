// ===== Pčelica - SVIJET 6 (svemir / Mjesec): auto-runner platformer =====
// Za razliku od svjetova 1-5 ovdje pčelica ne leti: sama trči po Mjesecu i skače (dodir = skok, dulji dodir = viši skok).
//   krateri (rupe u tlu) -> pad oduzima život, mjesečeve stijene -> preskoči ih (može se i stati na njih),
//   robotske ose -> udarac sa strane boli, skok na glavu je razbije (+bodovi), meteori -> upozorenje na tlu pa udar,
//   lebdeće stijene -> platforme (preko velikih kratera), neonske zvjezdice -> umjesto cvijeća,
//   zlatna zvijezda -> štit, crna zvijezda -> "teške čizme" (u skakanju obrnute komande nemaju smisla)
// Ulaz: na kraju vulkana svemirski brod pokupi pčelicu zlatnom zrakom (vidi WORLD_PORTALS u world3.js).
// Raspored Mjeseca ovisi samo o položaju i seedu (spaceRand), pa oba igrača u multiplayeru vide iste kratere.
let world6TriggerX = 0;

const SPACE_SPEED = 185;            // brzina trčanja (px/s) - malo brže od leta, da skokovi budu dugi
const SPACE_GRAVITY = 860;          // niska gravitacija (na Zemlji je 1500)
const SPACE_HOLD_GRAVITY = 300;     // dok se drži dodir na početku skoka - viši, lebdeći skok
const SPACE_HOLD_MAX = 0.32;        // koliko dugo držanje još diže
const SPACE_JUMP_V = -450;
const SPACE_RELEASE_CUT = 0.6;      // otpuštanje dok se diže prekida uspon
const SPACE_HEAVY_MUL = 0.68;       // teške čizme (crna zvijezda / protivnikova sabotaža)
const SPACE_MAX_FALL = 560;
const SPACE_COYOTE = 0.09;          // skok još vrijedi malo nakon silaska s ruba
const SPACE_JUMP_BUFFER = 0.14;     // dodir malo prije doskoka se zapamti
const SPACE_GROUND_RATIO = 0.78;
const SPACE_START_SAFE = 900;       // ravno tlo bez prepreka oko broda
const SPACE_HARD_AT = 2200 * METER_SCALE; // nakon ~2200 m Mjeseca težina je najveća
const SPACE_PLATFORM_THICK = 16;
const SPACE_VORTEX_GRACE = 2.6;     // vrtlog izbaci pčelicu u zrak: zaštita traje do doskoka
const ROBOWASP_R = 13;
const ROBOWASP_SPEED = 70;          // leti prema pčelici (px/s u svijetu)
const ROBOWASP_BONUS = 5;
const METEOR_WARN = 1.0;
const METEOR_FALL = 0.5;
const METEOR_R = 13;
const METEOR_DRIFT = 160;           // meteor pada koso, s desna
const NEON_COLORS = ['#4df3ff', '#ff4df0', '#9dff4d', '#fff04d'];

let spaceSeed = 0;
let spaceRand = Math.random;
let spaceGroundY = 0;
let spaceStartX = 0;
let spaceNextX = 0;
let spaceNextGoldX = 0;
let spaceNextBlackX = 0;
let spaceGaps = [];        // krateri (rupe): { start, end } poredano po x
let spaceRocks = [];       // stijene na tlu: { x, w, h, seed, hot }
let spacePlatforms = [];   // lebdeće stijene: { x, w, top, seed }
let robotWasps = [];       // { worldX, baseY, y, phase, active, dead }
let meteors = [];          // { x, t, phase: 'warn' | 'fall' }
let spacePopups = [];      // "+5" iznad razbijene ose
let spaceShip = null;      // brod koji je dovezao pčelicu (ostaje parkiran)
let spaceIntroBeeHidden = false;
let spaceGrounded = false;
let spaceCoyote = 0;
let spaceBuffer = 0;
let spaceHoldT = 0;
let spaceJumpHeld = false;
let spaceRunT = 0;
let nextMeteorT = 0;

// poziva se iz core.js initGame()
function resetSpace() {
  spaceSeed = mp.active && mp.seed !== undefined ? ((mp.seed ^ 0x2545f491) >>> 0) : Math.floor(Math.random() * 4294967296);
  spaceGroundY = 0;
  spaceGaps = []; spaceRocks = []; spacePlatforms = []; robotWasps = []; meteors = []; spacePopups = [];
  spaceShip = null;
  spaceIntroBeeHidden = false;
  spaceGrounded = false;
  invertBadge.firstChild.nodeValue = '🌀 ';
}

// ulazak na Mjesec (onEnter portala iz vulkana) - i za oživljavanje u multiplayeru
function initSpaceWorld() {
  spaceGroundY = Math.round(H * SPACE_GROUND_RATIO);
  spaceRand = mulberry32(spaceSeed);
  spaceStartX = world6TriggerX;
  spaceNextX = spaceStartX + SPACE_START_SAFE;
  spaceNextGoldX = spaceNextX + 900 + spaceRand() * 600;
  spaceNextBlackX = spaceNextX + 1700 + spaceRand() * 900;
  spaceGaps = []; spaceRocks = []; spacePlatforms = []; robotWasps = []; meteors = []; spacePopups = [];
  // ostaci vulkana ne idu na Mjesec
  flowers = []; butterflies = []; butterflyFollowers = []; fleeingButterflies = []; trailHistory = [];
  birds = []; wasps = []; fishermen = []; cloudPortals = [];
  bee.x = W * BEE_X_RATIO;
  bee.y = spaceGroundY - bee.r;
  bee.vy = 0;
  spaceGrounded = true;
  spaceCoyote = 0; spaceBuffer = 0; spaceHoldT = 0; spaceJumpHeld = false;
  nextMeteorT = 6;
  generateSpaceAhead();
  // oživljavanje u multiplayeru može pasti usred Mjeseca: oko broda mora biti ravno tlo
  clearSpaceRange(scrollX - W, scrollX + bee.x + 520);
  spaceShip = { worldX: scrollX + bee.x - 62, dy: -H, legs: 0, door: 0, thrust: 0, dusted: false };
  spaceIntroBeeHidden = true;
  // žetoni sabotaža stvoreni još u vulkanu spuste se na visinu skoka
  for (const arr of [peppers, fogTokens, vortexTokens, redBirdTokens]) for (const t of arr) t.y = spaceTokenY(t.y);
  if (deathFlower) deathFlower.y = spaceTokenY(deathFlower.y);
}

// žetoni iz multiplayer.js su zamišljeni za letenje (visoko); u svemiru ih spusti u pojas koji se dohvati skokom
function spaceTokenY(y) {
  if (worldTheme !== 'space') return y;
  const minY = H * 0.18, maxY = waterY - MEADOW_RAISE - 50;
  const t = Math.max(0, Math.min(1, (y - minY) / (maxY - minY)));
  const top = spaceGroundY - 200, bottom = spaceGroundY - 40;
  return top + t * (bottom - top);
}

function spaceDifficulty(x) {
  return Math.max(0, Math.min(1, (x - spaceStartX - SPACE_START_SAFE) / SPACE_HARD_AT));
}

function spaceSolidAt(x) {
  for (const g of spaceGaps) if (x > g.start + 6 && x < g.end - 6) return false;
  return true;
}

function clearSpaceRange(a, b) {
  spaceGaps = spaceGaps.filter(g => g.end < a || g.start > b);
  spaceRocks = spaceRocks.filter(r => r.x + r.w < a || r.x > b);
  spacePlatforms = spacePlatforms.filter(p => p.x + p.w < a || p.x > b);
  robotWasps = robotWasps.filter(w => w.worldX < a || w.worldX > b + 400);
}

// ---------- Generiranje Mjeseca: komad po komad (ravno tlo + jedna prepreka), sve gušće s udaljenošću ----------
function generateSpaceAhead() {
  if (!spaceGroundY) return;
  while (spaceNextX < scrollX + W * 2.5) addSpaceChunk();
  const behind = scrollX - W;
  spaceGaps = spaceGaps.filter(g => g.end > behind);
  spaceRocks = spaceRocks.filter(r => r.x + r.w > behind);
  spacePlatforms = spacePlatforms.filter(p => p.x + p.w > behind);
}

function addSpaceChunk() {
  const r = spaceRand;
  const k = spaceDifficulty(spaceNextX);
  let x = spaceNextX;
  // ravni dio prije prepreke - sve kraći kako raste udaljenost
  const run = 380 - 200 * k + r() * (240 - 110 * k);
  if (r() < 0.55) addStarRow(x + run * 0.15, run * 0.6, spaceGroundY - 34 - r() * 30);
  if (x + run * 0.5 > spaceNextGoldX) {
    addSpecialStar(x + run * 0.5, 'gold');
    spaceNextGoldX += 1700 + r() * 1300;
  } else if (x + run * 0.5 > spaceNextBlackX) {
    addSpecialStar(x + run * 0.5, 'black');
    spaceNextBlackX += 2100 + r() * 1500;
  }
  x += run;

  const opts = [
    ['rock', 2.2], ['crater', 2.0], ['bigCrater', 0.8 + 1.4 * k], ['wasp', 0.9 + 1.8 * k],
    ['stairs', 1.0], ['rockPair', 1.6 * k]
  ];
  let total = 0;
  for (const o of opts) total += o[1];
  let roll = r() * total, pick = opts[0][0];
  for (const o of opts) { if (roll < o[1]) { pick = o[0]; break; } roll -= o[1]; }

  if (pick === 'rock') x = addSpaceRock(x, k);
  else if (pick === 'rockPair') { x = addSpaceRock(x, k); x = addSpaceRock(x + 150 + r() * 50, k); }
  else if (pick === 'crater') x = addSmallCrater(x, k);
  else if (pick === 'bigCrater') x = addBigCrater(x, k);
  else if (pick === 'wasp') x = addRoboWaspGroup(x, k);
  else x = addFloatingStairs(x, k);
  spaceNextX = x;
}

function addSpaceStar(x, y) {
  flowers.push({
    id: 'ns_' + Math.round(x) + '_' + Math.round(y),
    worldX: x, y: y, r: 12, taken: false, special: false, gold: false,
    bob: spaceRand() * Math.PI * 2,
    spin: spaceRand() * Math.PI * 2,
    hue: NEON_COLORS[Math.floor(spaceRand() * NEON_COLORS.length)]
  });
}

function addSpecialStar(x, kind) {
  flowers.push({
    id: (kind === 'gold' ? 'gs_' : 'bs_') + Math.round(x),
    worldX: x, y: spaceGroundY - 70 - spaceRand() * 60, r: 15, taken: false,
    special: kind === 'black', gold: kind === 'gold',
    bob: spaceRand() * Math.PI * 2, spin: 0,
    hue: kind === 'gold' ? '#ffd452' : '#1a1a2a'
  });
}

function addStarRow(x, len, y) {
  const n = Math.max(2, Math.min(5, Math.floor(len / 40)));
  for (let i = 0; i < n; i++) addSpaceStar(x + i * 38, y);
}

// zvjezdice u luku preko prepreke - pokazuju putanju skoka
function addStarArc(cx, span, peak) {
  const n = 4;
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    addSpaceStar(cx - span / 2 + t * span, spaceGroundY - 40 - Math.sin(Math.PI * t) * peak);
  }
}

function addSpaceRock(x, k) {
  const r = spaceRand;
  const w = 26 + r() * 20;
  const h = 20 + r() * 16 + k * 12;
  spaceRocks.push({ x: x, w: w, h: h, seed: r(), hot: 0 });
  if (r() < 0.5) addStarArc(x + w / 2, 110, h + 40);
  return x + w;
}

function addSmallCrater(x, k) {
  const r = spaceRand;
  const g = 70 + r() * (60 + 50 * k);
  spaceGaps.push({ start: x, end: x + g });
  if (r() < 0.6) addStarArc(x + g / 2, g + 40, 60 + g * 0.3);
  return x + g;
}

// veliki krater: preko njega vode jedna ili dvije lebdeće stijene
function addBigCrater(x, k) {
  const r = spaceRand;
  const g = 300 + r() * (80 + 60 * k);
  spaceGaps.push({ start: x, end: x + g });
  if (g > 360) {
    const pw = 90 + r() * 20;
    const s = (g - 2 * pw) / 3;
    const p1 = { x: x + s, w: pw, top: spaceGroundY - 75 - r() * 15, seed: r() };
    const p2 = { x: x + 2 * s + pw, w: pw, top: spaceGroundY - 100 - r() * 20, seed: r() };
    spacePlatforms.push(p1, p2);
    addSpaceStar(p1.x + pw / 2, p1.top - 34);
    addSpaceStar(p2.x + pw / 2 - 20, p2.top - 34);
    addSpaceStar(p2.x + pw / 2 + 20, p2.top - 34);
  } else {
    const pw = 96 + r() * 30;
    const p = { x: x + (g - pw) / 2, w: pw, top: spaceGroundY - 70 - r() * 30, seed: r() };
    spacePlatforms.push(p);
    addSpaceStar(p.x + pw / 2 - 22, p.top - 34);
    addSpaceStar(p.x + pw / 2 + 22, p.top - 34);
  }
  return x + g;
}

// stepenice od lebdećih stijena iznad tla - bonus zvjezdice gore
function addFloatingStairs(x, k) {
  const r = spaceRand;
  const n = r() < 0.5 ? 2 : 3;
  let px = x + 30;
  let top = spaceGroundY - 80 - r() * 15;
  for (let i = 0; i < n; i++) {
    const pw = 84 + r() * 30;
    spacePlatforms.push({ x: px, w: pw, top: top, seed: r() });
    addSpaceStar(px + pw / 2 - 18, top - 34);
    addSpaceStar(px + pw / 2 + 18, top - 34);
    px += pw + 50 + r() * 30;
    top -= 45 + r() * 15;
  }
  // kasnije se ispod stepenica zna pojaviti i stijena
  if (k > 0.4 && r() < 0.5) addSpaceRock(x + 60 + r() * 60, k);
  return px + 20;
}

function addRoboWaspGroup(x, k) {
  const r = spaceRand;
  const n = k > 0.5 && r() < 0.45 ? 2 : 1;
  for (let i = 0; i < n; i++) {
    const baseY = spaceGroundY - 28 - r() * 22;
    robotWasps.push({ worldX: x + 260 + i * 130, baseY: baseY, y: baseY, phase: r() * Math.PI * 2, active: false, dead: false });
  }
  return x + 120 + n * 130;
}

// ---------- Igra na Mjesecu (poziva se iz core.js update() umjesto letenja) ----------
// vraća true ako je pčelica poginula
function updateSpaceWorld(dt, vortexed, invulnerable) {
  generateSpaceAhead();
  invertBadge.firstChild.nodeValue = '🧲 ';
  if (vortexed) {
    // vrtlog (sabotaža) drži pčelicu u zraku - nema skakanja ni sudara
    jumpQueued = false;
    spaceGrounded = false;
    spaceHoldT = 0;
    spaceJumpHeld = false;
  } else {
    updateSpaceBee(dt);
    if (spaceTerrainHits(invulnerable)) return true;
  }
  if (spaceGrounded) spaceRunT += dt;
  flapT += dt * 7;
  spaceCollectStars();
  if (updateRoboWasps(dt, invulnerable)) return true;
  if (updateMeteors(dt, invulnerable)) return true;
  if (updateMultiplayerWorld(dt, invulnerable)) return true;
  stepSpaceEffects(dt);
  return false;
}

function updateSpaceBee(dt) {
  const prevBottom = bee.y + bee.r;
  const prevTop = bee.y - bee.r;
  if (jumpQueued) { spaceBuffer = SPACE_JUMP_BUFFER; jumpQueued = false; }
  else if (spaceBuffer > 0) spaceBuffer -= dt;
  spaceCoyote = spaceGrounded ? SPACE_COYOTE : spaceCoyote - dt;

  if (spaceBuffer > 0 && spaceCoyote > 0) {
    const heavy = invertActive;
    bee.vy = SPACE_JUMP_V * (heavy ? SPACE_HEAVY_MUL : 1);
    spaceHoldT = heavy ? 0 : SPACE_HOLD_MAX;
    spaceJumpHeld = !heavy;
    spaceGrounded = false;
    spaceCoyote = 0;
    spaceBuffer = 0;
    spaceDust(bee.x, bee.y + bee.r, 4);
  }

  let g = SPACE_GRAVITY;
  if (bee.vy < 0 && holding && spaceHoldT > 0) {
    g = SPACE_HOLD_GRAVITY;
    spaceHoldT -= dt;
  } else if (spaceJumpHeld && bee.vy < 0 && !holding) {
    bee.vy *= SPACE_RELEASE_CUT;
    spaceJumpHeld = false;
    spaceHoldT = 0;
  }
  if (bee.vy >= 0) spaceJumpHeld = false;
  bee.vy = Math.min(SPACE_MAX_FALL, bee.vy + g * dt);
  bee.y += bee.vy * dt;

  const bx = scrollX + bee.x;
  // glavom u donju stranu lebdeće stijene
  if (bee.vy < 0) {
    for (const p of spacePlatforms) {
      const pb = p.top + SPACE_PLATFORM_THICK;
      if (bx > p.x - 4 && bx < p.x + p.w + 4 && prevTop >= pb - 2 && bee.y - bee.r < pb) {
        bee.y = pb + bee.r;
        bee.vy = 0;
        spaceHoldT = 0;
        spaceJumpHeld = false;
      }
    }
  }

  // doskok: najviša ploha koju je pčelica prešla odozgo (lebdeća stijena, vrh stijene ili tlo)
  const wasAir = !spaceGrounded;
  const landV = bee.vy;
  spaceGrounded = false;
  if (bee.vy >= 0) {
    const bottom = bee.y + bee.r;
    let top = null;
    for (const p of spacePlatforms) {
      if (bx > p.x - 8 && bx < p.x + p.w + 8 && prevBottom <= p.top + 4 && bottom >= p.top) top = top === null ? p.top : Math.min(top, p.top);
    }
    for (const rk of spaceRocks) {
      const rt = spaceGroundY - rk.h;
      if (bx > rk.x - 6 && bx < rk.x + rk.w + 6 && prevBottom <= rt + 4 && bottom >= rt) top = top === null ? rt : Math.min(top, rt);
    }
    if (spaceSolidAt(bx) && prevBottom <= spaceGroundY + 14 && bottom >= spaceGroundY) top = top === null ? spaceGroundY : Math.min(top, spaceGroundY);
    if (top !== null) {
      bee.y = top - bee.r;
      bee.vy = 0;
      spaceGrounded = true;
      if (wasAir && landV > 240) spaceDust(bee.x, top, 8);
    }
  }
}

// krateri i stijene; vraća true ako je pčelica poginula
function spaceTerrainHits(invulnerable) {
  const bx = scrollX + bee.x;
  const bottom = bee.y + bee.r;
  // ispod ruba tla: pala je u krater (ili zapela za njegovu stijenku)
  if (bottom > spaceGroundY + 14 && (bee.y > spaceGroundY + 40 || spaceSolidAt(bx))) return spaceCraterFall(invulnerable);
  if (invulnerable) return false;
  for (const rk of spaceRocks) {
    const rt = spaceGroundY - rk.h;
    if (Math.abs(bx - (rk.x + rk.w / 2)) < rk.w / 2 + 10 && bottom > rt + 8 && bee.y - bee.r < spaceGroundY) {
      const reason = rk.hot > 0 ? 'meteor' : 'rock';
      if (!loseLifeOrDie(reason)) { triggerDeath(reason); return true; }
      spaceGrounded = false;
      break;
    }
  }
  return false;
}

function spaceCraterFall(invulnerable) {
  if (!invulnerable && !loseLifeOrDie('crater')) { triggerDeath('crater'); return true; }
  // izvuci pčelicu iz kratera i spusti je na drugi rub
  const bx = scrollX + bee.x;
  let land = bx;
  for (const g of spaceGaps) {
    if (bx > g.start - 30 && bx < g.end + 6) { land = g.end + 30; break; }
  }
  scrollX += land - bx;
  bee.y = spaceGroundY - bee.r;
  bee.vy = 0;
  spaceGrounded = true;
  spaceHoldT = 0;
  spaceJumpHeld = false;
  if (invulnerable) hitInvulnT = Math.max(hitInvulnT, 0.8);
  for (let i = 0; i < 16; i++) {
    particles.push({
      x: bee.x, y: bee.y,
      vx: (Math.random() - 0.5) * 220, vy: -Math.random() * 220,
      life: 0.6, age: 0, color: i % 2 === 0 ? '#ffd452' : '#cfe8ff'
    });
  }
  return false;
}

function spaceCollectStars() {
  for (const f of flowers) {
    if (f.taken) continue;
    const sx = f.worldX - scrollX;
    if (sx < -40 || sx > W + 40) continue;
    const sy = f.y + Math.sin(waveT * 2 + f.bob) * 5;
    if (Math.hypot(sx - bee.x, sy - bee.y) >= f.r + bee.r) continue;
    f.taken = true;
    if (mp.active) broadcastFlowerTaken(f.id);
    let colors;
    if (f.special) {
      // u multiplayeru crna zvijezda šalje sabotažu protivniku; u solo igri tebi daje teške čizme
      if (mp.active) { mpSendSabotage(); popIcon(attackIcon('invert')); }
      else soloBlackFlower(); // upozorenje, pa teške čizme (štit ih poništi)
      colors = ['#1a1a2a', '#c56cf0'];
    } else if (f.gold) {
      if (!mpShieldCancelsSabotage()) {
        shieldActive = true;
        shieldTimeLeft = SHIELD_DURATION;
        popIcon('🛡️');
      }
      colors = ['#ffd452', '#fff6c8'];
    } else {
      score += 1;
      scoreVal.textContent = score;
      awardFlowerLife();
      colors = [f.hue, '#ffffff'];
    }
    for (let i = 0; i < 14; i++) {
      particles.push({
        x: bee.x, y: bee.y,
        vx: (Math.random() - 0.5) * 240, vy: (Math.random() - 0.5) * 240 - 40,
        life: 0.55, age: 0, color: colors[i % 2]
      });
    }
  }
  flowers = flowers.filter(f => (f.worldX - scrollX) > -60);
}

// skok na glavu (kao u Mariu): vraća true ako je pčelica odozgo pala na neprijatelja u (sx, sy)
function spaceStomp(sx, sy, r) {
  if (bee.vy <= 40) return false;
  if (Math.hypot(sx - bee.x, sy - bee.y) >= r + bee.r) return false;
  if (bee.y > sy - r * 0.35) return false;
  bee.vy = holding ? -470 : -360;
  spaceHoldT = 0;
  spaceJumpHeld = false;
  spaceGrounded = false;
  score += ROBOWASP_BONUS;
  scoreVal.textContent = score;
  triggerShake(3, 0.12);
  for (let i = 0; i < 22; i++) {
    particles.push({
      x: sx, y: sy,
      vx: (Math.random() - 0.5) * 320, vy: (Math.random() - 0.5) * 320 - 60,
      life: 0.5 + Math.random() * 0.3, age: 0,
      color: ['#fff6c8', '#ffd452', '#c9d1dc', '#ff3b3b'][i % 4]
    });
  }
  spacePopups.push({ worldX: sx + scrollX, y: sy - 20, t: 0, text: '+' + ROBOWASP_BONUS });
  return true;
}

function updateRoboWasps(dt, invulnerable) {
  for (const w of robotWasps) {
    if (!w.active) {
      if (w.worldX - scrollX < W + 60) w.active = true;
      else continue;
    }
    w.worldX -= ROBOWASP_SPEED * dt;
    w.y = w.baseY + Math.sin(waveT * 3 + w.phase) * 6;
    const sx = w.worldX - scrollX;
    if (spaceStomp(sx, w.y, ROBOWASP_R)) { w.dead = true; continue; }
    if (!invulnerable && Math.hypot(sx - bee.x, w.y - bee.y) < ROBOWASP_R + bee.r - 4) {
      if (!loseLifeOrDie('robowasp')) { triggerDeath('robowasp'); return true; }
    }
  }
  robotWasps = robotWasps.filter(w => !w.dead && (w.worldX - scrollX) > -80);
  return false;
}

function spawnMeteor() {
  const lead = SPACE_SPEED * mpSpeedMul() * (METEOR_WARN + METEOR_FALL) + 60 + Math.random() * 180;
  let tx = scrollX + bee.x + lead;
  for (const g of spaceGaps) if (tx > g.start - 40 && tx < g.end + 40) tx = g.end + 60;
  if (!spaceSolidAt(tx - 20) || !spaceSolidAt(tx + 20)) return;
  for (const rk of spaceRocks) if (tx > rk.x - 50 && tx < rk.x + rk.w + 50) return;
  meteors.push({ x: tx, t: 0, phase: 'warn' });
}

function updateMeteors(dt, invulnerable) {
  if (scrollX + bee.x > spaceStartX + SPACE_START_SAFE + 400) {
    nextMeteorT -= dt;
    if (nextMeteorT <= 0) {
      spawnMeteor();
      const k = spaceDifficulty(scrollX);
      nextMeteorT = 9 - 6 * k + Math.random() * (5 - 3 * k);
    }
  }
  for (const m of meteors) {
    m.t += dt;
    if (m.phase === 'warn') {
      if (m.t >= METEOR_WARN) { m.phase = 'fall'; m.t = 0; }
      continue;
    }
    const p = Math.min(1, m.t / METEOR_FALL);
    m.curX = m.x + METEOR_DRIFT * (1 - p) - scrollX;
    m.curY = -40 + (spaceGroundY - 10 + 40) * p;
    if (!invulnerable && Math.hypot(m.curX - bee.x, m.curY - bee.y) < METEOR_R + bee.r - 3) {
      if (!loseLifeOrDie('meteor')) { triggerDeath('meteor'); return true; }
    }
    if (p >= 1) {
      // udar: ostaje užarena stijena koju treba preskočiti
      m.done = true;
      spaceRocks.push({ x: m.x - 15, w: 30, h: 18, seed: Math.random(), hot: 1 });
      triggerShake(5, 0.25);
      for (let i = 0; i < 18; i++) {
        particles.push({
          x: m.curX, y: spaceGroundY - 6,
          vx: (Math.random() - 0.5) * 280, vy: -Math.random() * 260 - 40,
          life: 0.6 + Math.random() * 0.3, age: 0,
          color: ['#ffb347', '#ff5a1f', '#c9c9d1'][i % 3]
        });
      }
      spaceDust(m.curX, spaceGroundY, 10);
    }
  }
  meteors = meteors.filter(m => !m.done);
  for (const rk of spaceRocks) if (rk.hot > 0) rk.hot = Math.max(0, rk.hot - dt * 0.2);
  return false;
}

// oblačić mjesečeve prašine (mekane čestice)
function spaceDust(x, y, n) {
  for (let i = 0; i < n; i++) {
    particles.push({
      x: x + (Math.random() - 0.5) * 18, y: y - 2,
      vx: (Math.random() - 0.5) * 90, vy: -10 - Math.random() * 30,
      life: 0.5 + Math.random() * 0.4, age: 0,
      smoke: true, seed: Math.random() * 10,
      color: Math.random() < 0.5 ? 'rgba(200,200,210,0.9)' : 'rgba(165,165,178,0.9)'
    });
  }
}

function stepSpaceEffects(dt) {
  for (const p of particles) {
    p.age += dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    if (p.smoke) p.vx += Math.sin((p.age + p.seed) * 3.5) * 26 * dt;
    else if (p.pollen) p.vy += 40 * dt;
    else p.vy += 260 * dt; // i iskre padaju sporije na Mjesecu
  }
  particles = particles.filter(p => p.age < p.life);
  for (const pp of spacePopups) { pp.t += dt; pp.y -= 40 * dt; }
  spacePopups = spacePopups.filter(pp => pp.t < 0.9);
}

// ---------- Ulazak: brod pokupi pčelicu zlatnom zrakom, let u svemir, slijetanje na Mjesec, izlazak u odijelu ----------
function spaceIntroDuration() {
  return WORLD_PORTALS.volcano.splashDuration;
}

function easeOutCubic(k) { return 1 - Math.pow(1 - k, 3); }
function clamp01(v) { return Math.max(0, Math.min(1, v)); }

// poziva se iz updatePortalSequence (world3.js) dok traje splash
function updateSpaceIntro(s, dt) {
  waveT += dt;
  const t = s.t;
  const ship = spaceShip;
  if (!ship) return;
  const land = clamp01((t - 3.4) / 1.1);
  ship.dy = -(1 - easeOutCubic(land)) * H * 0.8;
  ship.thrust = t > 3.3 && t < 4.7 ? Math.min(1, (4.7 - t) / 0.3) : 0;
  ship.legs = clamp01((t - 3.9) / 0.4);
  if (t >= 4.45 && !ship.dusted) {
    ship.dusted = true;
    triggerShake(3, 0.2);
    spaceDust(ship.worldX - scrollX - 30, spaceGroundY, 10);
    spaceDust(ship.worldX - scrollX + 30, spaceGroundY, 10);
  }
  ship.door = clamp01((t - 4.7) / 0.4);
  spaceIntroBeeHidden = t < 5.15;
  bee.y = spaceGroundY - bee.r;
  bee.vy = 0;
  spaceGrounded = true;
  if (t >= 5.15) {
    const w = clamp01((t - 5.15) / 0.9);
    const doorX = ship.worldX - scrollX + 26;
    bee.x = doorX + (W * BEE_X_RATIO - doorX) * w;
    if (w < 1) spaceRunT += dt;
  }
  stepSpaceEffects(dt);
}

// onExit portala: pčelica stoji na tlu i kreće trčati
function finishSpaceIntro() {
  bee.x = W * BEE_X_RATIO;
  bee.y = spaceGroundY - bee.r;
  bee.vy = 0;
  spaceGrounded = true;
  spaceIntroBeeHidden = false;
  if (spaceShip) { spaceShip.dy = 0; spaceShip.thrust = 0; spaceShip.legs = 1; spaceShip.door = 1; }
}

// brod iznad kraja vulkana, sa zlatnom zrakom do tla
function drawShipPickup(x, y) {
  const groundY = surfaceYAt(x + scrollX);
  const bob = Math.sin(waveT * 2) * 4;
  ctx.save();
  const pulse = 0.75 + 0.25 * Math.sin(waveT * 5);
  const bg = ctx.createLinearGradient(0, y + 20, 0, groundY);
  bg.addColorStop(0, 'rgba(255,226,120,' + (0.6 * pulse) + ')');
  bg.addColorStop(1, 'rgba(255,200,80,' + (0.18 * pulse) + ')');
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.moveTo(x - 12, y + 20 + bob);
  ctx.lineTo(x + 12, y + 20 + bob);
  ctx.lineTo(x + 50, groundY);
  ctx.lineTo(x - 50, groundY);
  ctx.closePath();
  ctx.fill();
  // prstenovi koji se dižu kroz zraku
  ctx.lineWidth = 2;
  for (let i = 0; i < 4; i++) {
    const t = (waveT * 0.6 + i / 4) % 1;
    const yy = groundY - t * (groundY - y - 20);
    const w = 50 - t * 38;
    ctx.strokeStyle = 'rgba(255,240,180,' + (0.8 * (1 - t)) + ')';
    ctx.beginPath(); ctx.ellipse(x, yy, w, w * 0.18, 0, 0, Math.PI * 2); ctx.stroke();
  }
  // iskrice
  ctx.fillStyle = '#fff6c8';
  for (let i = 0; i < 10; i++) {
    const t = (waveT * 0.45 + i * 0.137) % 1;
    const yy = groundY - t * (groundY - y - 20);
    const xx = x + Math.sin(i * 2.3 + waveT * 3) * (44 - t * 34);
    ctx.globalAlpha = 1 - t;
    ctx.beginPath(); ctx.arc(xx, yy, 1.8, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
  drawSpaceShip(x, y + bob, { beamLight: true, scale: 1.1 });
}

function drawSpaceIntroOverlay(s) {
  if (s.phase === 'pull') {
    // pčelica se diže kroz zraku i nestaje u brodu (brod se crta preko nje), pa zlatni bljesak
    const k = Math.min(1, s.t / PORTAL_PULL_DURATION);
    if (worldPortal) {
      const x = worldPortal.worldX - scrollX;
      ctx.save();
      const g = ctx.createRadialGradient(bee.x, bee.y, 2, bee.x, bee.y, 34);
      g.addColorStop(0, 'rgba(255,230,140,0.55)');
      g.addColorStop(1, 'rgba(255,230,140,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(bee.x, bee.y, 34, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      drawSpaceShip(x, worldPortal.y + Math.sin(waveT * 2) * 4, { beamLight: true, scale: 1.1 });
    }
    if (k > 0.8) {
      ctx.fillStyle = 'rgba(255,230,150,' + (0.9 * (k - 0.8) / 0.2) + ')';
      ctx.fillRect(0, 0, W, H);
    }
    return;
  }
  const t = s.t;
  ctx.save();
  // let do Mjeseca pokriva cijeli ekran, a od 3.4 s se pretapa u pravi Mjesec (brod slijeće)
  const cover = t < 3.4 ? 1 : Math.max(0, 1 - (t - 3.4) / 0.5);
  if (cover > 0) {
    ctx.globalAlpha = cover;
    drawSpaceFlight(t);
    ctx.globalAlpha = 1;
  }
  if (t < 0.35) {
    ctx.fillStyle = 'rgba(255,230,150,' + (0.9 * (1 - t / 0.35)) + ')';
    ctx.fillRect(0, 0, W, H);
  }
  // natpis
  if (t > 1.5 && t < 4.6) {
    const a = Math.min(1, (t - 1.5) / 0.5) * Math.min(1, (4.6 - t) / 0.5);
    const textIn = Math.min(1, (t - 1.5) / 0.5);
    ctx.globalAlpha = Math.max(0, a);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.7)';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#fff8e7';
    ctx.font = 'bold 18px Trebuchet MS, sans-serif';
    ctx.fillText('SVIJET 6', W / 2, H * 0.15);
    ctx.font = 'bold ' + Math.round(42 + (1 - textIn) * 14) + 'px Trebuchet MS, sans-serif';
    ctx.fillText('🚀 Svemir', W / 2, H * 0.22);
    ctx.shadowBlur = 4;
    ctx.font = '16px Trebuchet MS, sans-serif';
    ctx.fillText('Mjesec · niska gravitacija · skači!', W / 2, H * 0.285);
    ctx.font = 'bold 14px Trebuchet MS, sans-serif';
    ctx.fillStyle = '#9ad8ff';
    ctx.shadowBlur = 0;
    ctx.fillText('Pazi: krateri · robotske ose · meteori', W / 2, H * 0.33);
  }
  ctx.restore();
}

// animacija leta: uzlijetanje iz vulkana (0-1.4 s), pa svemir sa Zemljom i Mjesecom (1.4-3.4 s)
function drawSpaceFlight(t) {
  const a = Math.min(1, t / 1.4);
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, lerpColorStr('#2b1216', '#000004', a));
  g.addColorStop(0.55, lerpColorStr('#7a2a18', '#05050f', a));
  g.addColorStop(1, lerpColorStr('#e0622a', '#0a0a1c', a));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  const baseAlpha = ctx.globalAlpha;
  // zvijezde: pri uzlijetanju jure prema dolje, u svemiru polako klize ulijevo
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.4;
  for (let i = 0; i < 70; i++) {
    if (t < 1.4) {
      const x = (i * 97.3) % W;
      const y = ((i * 53.7) + t * (500 + (i % 5) * 140)) % H;
      ctx.globalAlpha = baseAlpha * a * 0.8;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - 6 - 26 * (1 - a * 0.5)); ctx.stroke();
    } else {
      const x = (((i * 97.3) - (t - 1.4) * (30 + (i % 4) * 22)) % W + W) % W;
      const y = (i * 53.7) % H;
      ctx.globalAlpha = baseAlpha * (0.4 + 0.6 * (0.5 + 0.5 * Math.sin(t * 3 + i)));
      ctx.beginPath(); ctx.arc(x, y, 0.8 + (i % 3) * 0.5, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.globalAlpha = baseAlpha;
  // vulkani ostaju dolje
  if (t < 1.4) {
    const drop = t * t * 300;
    ctx.fillStyle = '#2a1414';
    ctx.beginPath();
    ctx.moveTo(0, H);
    ctx.lineTo(0, H * 0.82 + drop);
    ctx.lineTo(W * 0.22, H * 0.7 + drop);
    ctx.lineTo(W * 0.3, H * 0.7 + drop);
    ctx.lineTo(W * 0.55, H * 0.86 + drop);
    ctx.lineTo(W * 0.78, H * 0.74 + drop);
    ctx.lineTo(W * 0.86, H * 0.74 + drop);
    ctx.lineTo(W, H * 0.8 + drop);
    ctx.lineTo(W, H);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(255,120,30,0.8)';
    ctx.beginPath(); ctx.ellipse(W * 0.26, H * 0.7 + drop, W * 0.04, 4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(W * 0.82, H * 0.74 + drop, W * 0.04, 4, 0, 0, Math.PI * 2); ctx.fill();
  }
  // Zemlja se udaljava, Mjesec se približava
  if (t > 1.0) {
    const b = clamp01((t - 1.0) / 2.4);
    ctx.globalAlpha = baseAlpha * Math.min(1, (t - 1.0) / 0.4);
    drawEarth(W * 0.18, H * 0.86 + b * H * 0.04, 150 - 80 * b);
    drawMoonDisc(W * 0.84, H * 0.5, 24 + 110 * easeInOut(b));
    ctx.globalAlpha = baseAlpha;
  }
  // brod
  let sx, sy, tilt, flame;
  if (t < 1.4) {
    sx = W * 0.5 + Math.sin(t * 40) * 1.5;
    sy = H * 0.62 - a * H * 0.18;
    tilt = -1.2;
    flame = 1;
  } else {
    const b = clamp01((t - 1.4) / 2.0);
    sx = W * 0.5 + W * 0.12 * easeInOut(b);
    sy = H * 0.44 + Math.sin(t * 2.5) * 6 + b * H * 0.03;
    tilt = -1.2 + 1.35 * easeInOut(Math.min(1, (t - 1.4) / 0.8));
    flame = 0.8;
  }
  drawSpaceShip(sx, sy, { tilt: tilt, flame: flame, scale: 1.3 });
}

// ---------- Crtanje svemira ----------
// poziva se iz core.js drawSceneContent() umjesto crtanja svjetova 1-5
function drawSpaceScene() {
  drawSpaceBackground();
  drawSpaceTerrain();
  for (const p of spacePlatforms) {
    const sx = p.x - scrollX;
    if (sx + p.w < -20 || sx > W + 20) continue;
    drawFloatingRock(sx, p.top, p.w, p.seed);
  }
  drawParkedShip();
  for (const f of flowers) {
    if (f.taken) continue;
    const sx = f.worldX - scrollX;
    if (sx < -30 || sx > W + 30) continue;
    const sy = f.y + Math.sin(waveT * 2 + f.bob) * 5;
    if (f.gold) drawShieldStar(sx, sy, f.r);
    else if (f.special) drawBlackStar(sx, sy, f.r);
    else drawNeonStar(sx, sy, f.r, f.hue, f.spin + waveT * 0.8);
  }
  for (const m of meteors) drawMeteor(m);
  for (const w of robotWasps) {
    const sx = w.worldX - scrollX;
    if (sx < -30 || sx > W + 30) continue;
    drawRoboWasp(sx, w.y, waveT * 30 + w.phase);
  }
  drawParticles();
  drawMultiplayerWorld();

  const spectating = gameState === 'over' && mp.active && !mp.resultShown;
  if (gameState !== 'menu' && !spectating && !spaceIntroBeeHidden) {
    const beeAlpha = mpBeeAlpha();
    drawSpaceBeeShadow(beeAlpha);
    const blinking = hitInvulnT > 0 && Math.floor(hitInvulnT * 10) % 2 === 0;
    ctx.globalAlpha = (blinking ? 0.3 : 1) * beeAlpha;
    drawBee();
    ctx.globalAlpha = beeAlpha;
    if (shieldActive) drawShieldBubble(bee.x, bee.y);
    ctx.globalAlpha = 1;
  }

  for (const pp of spacePopups) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, 1 - pp.t / 0.9);
    ctx.font = 'bold 20px Trebuchet MS, sans-serif';
    ctx.textAlign = 'center';
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(20,20,40,0.8)';
    ctx.fillStyle = '#9dff4d';
    const x = pp.worldX - scrollX;
    ctx.strokeText(pp.text, x, pp.y);
    ctx.fillText(pp.text, x, pp.y);
    ctx.restore();
  }

  drawMultiplayerOverlay();
  drawPortalOverlay();
}

function hash01(n) {
  const v = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return v - Math.floor(v);
}

function drawSpaceBackground() {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#000004');
  g.addColorStop(0.6, '#07071a');
  g.addColorStop(1, '#151530');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // sitne zvijezde koje trepere (vrlo sporo klize - jako su daleko)
  ctx.save();
  ctx.fillStyle = '#ffffff';
  const drift = scrollX * 0.015;
  for (let i = 0; i < 110; i++) {
    const sx = (((hash01(i) * (W + 40) - drift) % (W + 40)) + W + 40) % (W + 40) - 20;
    const sy = hash01(i + 500) * spaceGroundY * 0.95;
    const tw = 0.5 + 0.5 * Math.sin(waveT * (1.3 + (i % 5) * 0.6) + i);
    ctx.globalAlpha = 0.25 + tw * 0.75;
    ctx.beginPath();
    ctx.arc(sx, sy, 0.6 + hash01(i + 900) * 1.1, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // velika plava Zemlja
  drawEarth(W * 0.76, H * 0.17, Math.min(72, W * 0.15));

  // daleki brežuljci (paralaksa - što dalji, to sporiji)
  const layers = [
    { par: 0.06, base: spaceGroundY - 95, amp: 26, col: '#26262f' },
    { par: 0.16, base: spaceGroundY - 50, amp: 18, col: '#363641' },
    { par: 0.32, base: spaceGroundY - 16, amp: 10, col: '#4b4b57' }
  ];
  for (const L of layers) {
    ctx.fillStyle = L.col;
    ctx.beginPath();
    ctx.moveTo(0, H);
    for (let x = 0; x <= W + 16; x += 16) {
      const wx = x + scrollX * L.par;
      const y = L.base + Math.sin(wx * 0.004) * L.amp + Math.sin(wx * 0.013 + 1.7) * L.amp * 0.45 - Math.max(0, Math.sin(wx * 0.002 + 0.6)) * L.amp * 0.8;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(W + 16, H);
    ctx.closePath();
    ctx.fill();
  }
}

function drawEarth(x, y, r) {
  ctx.save();
  const glow = ctx.createRadialGradient(x, y, r * 0.9, x, y, r * 1.35);
  glow.addColorStop(0, 'rgba(120,190,255,0.45)');
  glow.addColorStop(1, 'rgba(120,190,255,0)');
  ctx.fillStyle = glow;
  ctx.beginPath(); ctx.arc(x, y, r * 1.35, 0, Math.PI * 2); ctx.fill();
  const og = ctx.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.1, x, y, r);
  og.addColorStop(0, '#6cc0ff');
  og.addColorStop(0.7, '#1f6fd1');
  og.addColorStop(1, '#123e8a');
  ctx.fillStyle = og;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.clip();
  // kontinenti se polako okreću
  const rot = waveT * 0.02;
  const conts = [[0.1, -0.35, 0.36], [0.5, 0.25, 0.3], [1.1, -0.1, 0.42], [1.55, 0.42, 0.24], [0.85, -0.6, 0.2]];
  for (const c of conts) {
    const u = ((c[0] + rot) % 2) - 1;
    const cx = x + u * r * 1.2, cy = y + c[1] * r, s = c[2] * r;
    ctx.fillStyle = '#4fa857';
    ctx.beginPath();
    ctx.ellipse(cx, cy, s, s * 0.7, 0.3, 0, Math.PI * 2);
    ctx.ellipse(cx + s * 0.55, cy + s * 0.35, s * 0.6, s * 0.45, -0.4, 0, Math.PI * 2);
    ctx.ellipse(cx - s * 0.4, cy + s * 0.45, s * 0.45, s * 0.35, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#93cf7f';
    ctx.beginPath(); ctx.ellipse(cx - s * 0.2, cy - s * 0.15, s * 0.35, s * 0.22, 0.3, 0, Math.PI * 2); ctx.fill();
  }
  // oblaci
  ctx.strokeStyle = 'rgba(255,255,255,0.65)';
  ctx.lineWidth = Math.max(2, r * 0.06);
  ctx.lineCap = 'round';
  for (let i = 0; i < 4; i++) {
    const u = ((i * 0.53 + rot * 1.4) % 2) - 1;
    const cx = x + u * r * 1.2, cy = y + (i * 0.37 - 0.55) * r;
    ctx.beginPath(); ctx.moveTo(cx - r * 0.3, cy); ctx.quadraticCurveTo(cx, cy - r * 0.08, cx + r * 0.32, cy); ctx.stroke();
  }
  // noćna strana
  const sh = ctx.createLinearGradient(x - r, y - r, x + r, y + r);
  sh.addColorStop(0.5, 'rgba(0,0,20,0)');
  sh.addColorStop(1, 'rgba(0,0,20,0.6)');
  ctx.fillStyle = sh;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
  ctx.restore();
}

function drawMoonDisc(x, y, r) {
  ctx.save();
  const glow = ctx.createRadialGradient(x, y, r * 0.95, x, y, r * 1.25);
  glow.addColorStop(0, 'rgba(230,230,240,0.3)');
  glow.addColorStop(1, 'rgba(230,230,240,0)');
  ctx.fillStyle = glow;
  ctx.beginPath(); ctx.arc(x, y, r * 1.25, 0, Math.PI * 2); ctx.fill();
  const mg = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
  mg.addColorStop(0, '#e6e6ec');
  mg.addColorStop(1, '#8c8c98');
  ctx.fillStyle = mg;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(110,110,125,0.55)';
  for (const [u, v, s] of [[-0.35, -0.2, 0.22], [0.25, 0.3, 0.16], [0.3, -0.4, 0.12], [-0.1, 0.45, 0.1], [0.5, 0.0, 0.09]]) {
    ctx.beginPath(); ctx.arc(x + u * r, y + v * r, s * r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function drawSpaceTerrain() {
  const gy = spaceGroundY;
  const grad = ctx.createLinearGradient(0, gy, 0, H);
  grad.addColorStop(0, '#b9b9c2');
  grad.addColorStop(0.25, '#8e8e99');
  grad.addColorStop(1, '#55555f');
  ctx.fillStyle = grad;
  ctx.fillRect(0, gy, W, H - gy);

  // sitni krateri na površini (samo ukras)
  const cell = 70;
  for (let c = Math.floor((scrollX - 60) / cell); c * cell < scrollX + W + 60; c++) {
    const h = hash01(c);
    if (h > 0.6) continue;
    const wx = c * cell + h * 40;
    if (!spaceSolidAt(wx - 34) || !spaceSolidAt(wx + 34)) continue;
    const sx = wx - scrollX;
    const rx = 8 + hash01(c + 0.5) * 20;
    const cy = gy + 14 + hash01(c * 1.7) * (H - gy - 30) * 0.6;
    ctx.fillStyle = 'rgba(70,70,84,0.5)';
    ctx.beginPath(); ctx.ellipse(sx, cy, rx, rx * 0.28, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(235,235,245,0.35)';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.ellipse(sx, cy, rx, rx * 0.28, 0, 0.1, Math.PI - 0.1); ctx.stroke();
  }

  // krateri (rupe) - bez dna
  for (const g of spaceGaps) {
    const x0 = g.start - scrollX, x1 = g.end - scrollX;
    if (x1 < -30 || x0 > W + 30) continue;
    const pg = ctx.createLinearGradient(0, gy, 0, H);
    pg.addColorStop(0, '#24242e');
    pg.addColorStop(0.35, '#0a0a10');
    pg.addColorStop(1, '#000000');
    ctx.fillStyle = pg;
    ctx.beginPath();
    ctx.moveTo(x0, gy);
    ctx.lineTo(x1, gy);
    ctx.lineTo(x1 - 10, H);
    ctx.lineTo(x0 + 10, H);
    ctx.closePath();
    ctx.fill();
    // osvijetljena stijenka na drugoj strani
    ctx.fillStyle = 'rgba(170,170,185,0.3)';
    ctx.beginPath();
    ctx.moveTo(x1 - 1, gy);
    ctx.lineTo(x1 - 10, H);
    ctx.lineTo(x1 - 24, H);
    ctx.lineTo(x1 - 14, gy + 10);
    ctx.closePath();
    ctx.fill();
    // uzdignuti rubovi
    ctx.fillStyle = '#c8c8d1';
    ctx.beginPath(); ctx.ellipse(x0 - 5, gy + 1, 13, 5, 0, Math.PI, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x1 + 5, gy + 1, 13, 5, 0, Math.PI, Math.PI * 2); ctx.fill();
  }

  // svijetli rub tla, samo gdje tla ima
  ctx.strokeStyle = 'rgba(235,235,245,0.75)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  let from = -10;
  for (const g of spaceGaps) {
    const x0 = g.start - scrollX, x1 = g.end - scrollX;
    if (x1 < -10) continue;
    if (x0 > W + 10) break;
    if (x0 > from) { ctx.moveTo(from, gy); ctx.lineTo(x0, gy); }
    from = x1;
  }
  if (from < W + 10) { ctx.moveTo(from, gy); ctx.lineTo(W + 10, gy); }
  ctx.stroke();

  for (const rk of spaceRocks) {
    const sx = rk.x - scrollX;
    if (sx + rk.w < -10 || sx > W + 10) continue;
    drawMoonRock(sx, gy, rk.w, rk.h, rk.seed, rk.hot);
  }
}

function drawMoonRock(sx, gy, w, h, seed, hot) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(sx, gy + 2);
  for (let i = 0; i <= 6; i++) {
    const a = Math.PI * i / 6;
    const px = sx + w / 2 - Math.cos(a) * w / 2;
    const py = gy - Math.sin(a) * h * (0.75 + 0.25 * hash01(seed * 100 + i));
    ctx.lineTo(px, py);
  }
  ctx.lineTo(sx + w, gy + 2);
  ctx.closePath();
  const rg = ctx.createLinearGradient(sx, gy - h, sx + w, gy);
  rg.addColorStop(0, '#c2c2cb');
  rg.addColorStop(1, '#666672');
  ctx.fillStyle = rg;
  ctx.fill();
  ctx.strokeStyle = 'rgba(40,40,50,0.5)';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  // sitne rupice
  ctx.fillStyle = 'rgba(80,80,92,0.6)';
  ctx.beginPath(); ctx.arc(sx + w * 0.35, gy - h * 0.45, 2.6, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(sx + w * 0.62, gy - h * 0.25, 1.8, 0, Math.PI * 2); ctx.fill();
  // užarena stijena od meteora
  if (hot > 0) {
    const gl = ctx.createRadialGradient(sx + w / 2, gy - h * 0.4, 2, sx + w / 2, gy - h * 0.4, w);
    gl.addColorStop(0, 'rgba(255,170,60,' + (0.8 * hot) + ')');
    gl.addColorStop(1, 'rgba(255,80,20,0)');
    ctx.fillStyle = gl;
    ctx.beginPath(); ctx.arc(sx + w / 2, gy - h * 0.4, w, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(255,140,40,' + (0.4 + 0.5 * hot) + ')';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(sx + w * 0.3, gy - h * 0.7); ctx.lineTo(sx + w * 0.45, gy - h * 0.35); ctx.lineTo(sx + w * 0.4, gy);
    ctx.moveTo(sx + w * 0.45, gy - h * 0.35); ctx.lineTo(sx + w * 0.7, gy - h * 0.2);
    ctx.stroke();
  }
  ctx.restore();
}

function drawFloatingRock(sx, top, w, seed) {
  const T = SPACE_PLATFORM_THICK;
  ctx.save();
  // plavkasti sjaj ispod - stijena lebdi
  const glow = ctx.createRadialGradient(sx + w / 2, top + T + 18, 2, sx + w / 2, top + T + 18, w * 0.6);
  glow.addColorStop(0, 'rgba(140,200,255,0.28)');
  glow.addColorStop(1, 'rgba(140,200,255,0)');
  ctx.fillStyle = glow;
  ctx.beginPath(); ctx.arc(sx + w / 2, top + T + 18, w * 0.6, 0, Math.PI * 2); ctx.fill();
  // šiljasti donji dio
  ctx.fillStyle = '#5e5e6a';
  ctx.beginPath();
  ctx.moveTo(sx + 2, top + T * 0.6);
  ctx.lineTo(sx + w * 0.2, top + T + 8 + hash01(seed * 50) * 6);
  ctx.lineTo(sx + w * 0.45, top + T + 20 + hash01(seed * 70) * 8);
  ctx.lineTo(sx + w * 0.72, top + T + 10 + hash01(seed * 90) * 6);
  ctx.lineTo(sx + w - 2, top + T * 0.6);
  ctx.closePath();
  ctx.fill();
  // gornja ploha
  const tg = ctx.createLinearGradient(0, top, 0, top + T);
  tg.addColorStop(0, '#cfcfd7');
  tg.addColorStop(1, '#8a8a95');
  ctx.fillStyle = tg;
  const rr = 6;
  ctx.beginPath();
  ctx.moveTo(sx + rr, top);
  ctx.lineTo(sx + w - rr, top);
  ctx.quadraticCurveTo(sx + w, top, sx + w, top + rr);
  ctx.lineTo(sx + w, top + T - rr);
  ctx.quadraticCurveTo(sx + w, top + T, sx + w - rr, top + T);
  ctx.lineTo(sx + rr, top + T);
  ctx.quadraticCurveTo(sx, top + T, sx, top + T - rr);
  ctx.lineTo(sx, top + rr);
  ctx.quadraticCurveTo(sx, top, sx + rr, top);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(245,245,255,0.8)';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(sx + rr, top + 1); ctx.lineTo(sx + w - rr, top + 1); ctx.stroke();
  ctx.fillStyle = 'rgba(90,90,105,0.55)';
  ctx.beginPath(); ctx.ellipse(sx + w * 0.3, top + T * 0.55, 5, 2, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(sx + w * 0.7, top + T * 0.5, 3.5, 1.5, 0, 0, Math.PI * 2); ctx.fill();
  // kamenčići koji lebde ispod
  ctx.fillStyle = '#7a7a86';
  for (let i = 0; i < 3; i++) {
    const px = sx + w * (0.25 + i * 0.25);
    const py = top + T + 30 + i * 4 + Math.sin(waveT * 2 + seed * 10 + i) * 3;
    ctx.beginPath(); ctx.arc(px, py, 2 + (i % 2), 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function starPath(r, inner) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + i * Math.PI / 5;
    const rad = i % 2 ? r * inner : r;
    if (i === 0) ctx.moveTo(Math.cos(a) * rad, Math.sin(a) * rad); else ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
  }
  ctx.closePath();
}

function drawNeonStar(x, y, r, color, spin) {
  const c = hexToRgb(color);
  ctx.save();
  ctx.translate(x, y);
  const pulse = 1 + Math.sin(waveT * 6 + spin) * 0.08;
  const glow = ctx.createRadialGradient(0, 0, r * 0.2, 0, 0, r * 2.1 * pulse);
  glow.addColorStop(0, 'rgba(' + c.join(',') + ',0.55)');
  glow.addColorStop(1, 'rgba(' + c.join(',') + ',0)');
  ctx.fillStyle = glow;
  ctx.beginPath(); ctx.arc(0, 0, r * 2.1 * pulse, 0, Math.PI * 2); ctx.fill();
  ctx.rotate(Math.sin(spin) * 0.35);
  starPath(r, 0.45);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  starPath(r * 0.45, 0.45);
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.fill();
  ctx.restore();
}

// zlatna zvijezda = štit
function drawShieldStar(x, y, r) {
  ctx.save();
  const pulse = 4 + Math.sin(waveT * 5) * 2;
  ctx.strokeStyle = 'rgba(255,255,255,0.75)';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(x, y, r + pulse + 4, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();
  drawNeonStar(x, y, r, '#ffd452', waveT);
}

// crna zvijezda = teške čizme (u multiplayeru sabotaža protivniku)
function drawBlackStar(x, y, r) {
  ctx.save();
  ctx.translate(x, y);
  const glow = ctx.createRadialGradient(0, 0, r * 0.3, 0, 0, r * 2);
  glow.addColorStop(0, 'rgba(197,108,240,0.5)');
  glow.addColorStop(1, 'rgba(197,108,240,0)');
  ctx.fillStyle = glow;
  ctx.beginPath(); ctx.arc(0, 0, r * 2, 0, Math.PI * 2); ctx.fill();
  ctx.rotate(Math.sin(waveT * 2) * 0.3);
  starPath(r, 0.45);
  ctx.fillStyle = '#1a1a2a';
  ctx.fill();
  ctx.strokeStyle = '#ffd452';
  ctx.lineWidth = 1.6;
  ctx.stroke();
  ctx.restore();
}

// robotska osa: srebrna, crvene oči, gleda ulijevo (prema pčelici)
function drawRoboWasp(x, y, flapPhase) {
  const flap = Math.sin(flapPhase) * 0.9;
  ctx.save();
  ctx.translate(x, y);
  // krila
  for (const side of [0, 1]) {
    ctx.save();
    ctx.translate(2 + side * 4, -7);
    ctx.rotate(-0.5 + side * 0.5 + flap * 0.45);
    ctx.fillStyle = 'rgba(200,225,255,0.45)';
    ctx.strokeStyle = 'rgba(225,235,250,0.9)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.ellipse(0, -8, 5, 9, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -15); ctx.stroke();
    ctx.restore();
  }
  const metal = ctx.createLinearGradient(0, -9, 0, 9);
  metal.addColorStop(0, '#f4f6fa');
  metal.addColorStop(0.5, '#aab2bf');
  metal.addColorStop(1, '#5f6774');
  // žalac
  ctx.fillStyle = '#4a515c';
  ctx.beginPath(); ctx.moveTo(14, 1); ctx.lineTo(22, 3.5); ctx.lineTo(14, 6); ctx.closePath(); ctx.fill();
  // zadak s metalnim prstenovima
  ctx.fillStyle = metal;
  ctx.beginPath(); ctx.ellipse(7, 2, 9, 7.5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.save();
  ctx.beginPath(); ctx.ellipse(7, 2, 9, 7.5, 0, 0, Math.PI * 2); ctx.clip();
  ctx.fillStyle = '#3b414c';
  ctx.fillRect(4, -7, 2.2, 18);
  ctx.fillRect(9.5, -7, 2.2, 18);
  ctx.restore();
  // prsa i glava
  ctx.fillStyle = metal;
  ctx.beginPath(); ctx.ellipse(-3, 0, 6, 6, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(-11, -1, 6.5, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(40,45,55,0.6)';
  ctx.lineWidth = 1;
  ctx.stroke();
  // zakovice
  ctx.fillStyle = '#e8ecf2';
  ctx.beginPath(); ctx.arc(-3, -3, 0.9, 0, Math.PI * 2); ctx.arc(-1, 3, 0.9, 0, Math.PI * 2); ctx.fill();
  // crvene oči
  const eg = ctx.createRadialGradient(-13, -2, 0.5, -13, -2, 8);
  eg.addColorStop(0, 'rgba(255,60,60,0.7)');
  eg.addColorStop(1, 'rgba(255,40,40,0)');
  ctx.fillStyle = eg;
  ctx.beginPath(); ctx.arc(-13, -2, 8, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ff2a2a';
  ctx.beginPath(); ctx.arc(-14, -2.5, 2.3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(-9.8, -3, 1.7, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(-14.6, -3.2, 0.7, 0, Math.PI * 2); ctx.fill();
  // antena s lampicom
  ctx.strokeStyle = '#5f6774';
  ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.moveTo(-10, -7); ctx.lineTo(-13, -14); ctx.stroke();
  ctx.fillStyle = Math.sin(waveT * 8) > 0 ? '#ff3b3b' : '#7a1a1a';
  ctx.beginPath(); ctx.arc(-13, -14, 1.8, 0, Math.PI * 2); ctx.fill();
  // nožice
  ctx.strokeStyle = '#3b414c';
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.moveTo(-5, 5); ctx.lineTo(-8, 10);
  ctx.moveTo(-1, 6); ctx.lineTo(-2, 11);
  ctx.moveTo(3, 7); ctx.lineTo(4, 11);
  ctx.stroke();
  ctx.restore();
}

function drawMeteor(m) {
  const sx = m.x - scrollX;
  ctx.save();
  if (m.phase === 'warn' || (m.phase === 'fall' && m.t < METEOR_FALL)) {
    const k = m.phase === 'warn' ? m.t / METEOR_WARN : 1;
    const blink = Math.floor(waveT * 8) % 2 === 0;
    if (sx > W - 12) {
      // izvan ekrana: crveni "!" na desnom rubu, u visini tla (pulsira, ne nestaje)
      {
        const pr = 13 + Math.sin(waveT * 14) * 2.5;
        ctx.fillStyle = 'rgba(214,40,40,0.92)';
        ctx.beginPath(); ctx.arc(W - 22, spaceGroundY - 24, pr, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 20px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('!', W - 22, spaceGroundY - 23);
      }
    } else {
      // sjena koja raste i crvena točka na mjestu udara
      const fallP = m.phase === 'fall' ? m.t / METEOR_FALL : 0;
      ctx.fillStyle = 'rgba(0,0,0,' + (0.25 + 0.35 * fallP) + ')';
      ctx.beginPath(); ctx.ellipse(sx, spaceGroundY + 2, 10 + 16 * fallP + 4 * k, 3 + 3 * fallP, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = blink ? 'rgba(255,40,40,0.95)' : 'rgba(255,120,120,0.7)';
      ctx.beginPath(); ctx.ellipse(sx, spaceGroundY, 7, 3, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(255,50,50,0.85)';
      ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.ellipse(sx, spaceGroundY, 20, 6, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,60,60,' + (0.7 * (1 - (waveT * 2 % 1))) + ')';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(sx, spaceGroundY, 8 + (waveT * 2 % 1) * 28, 3 + (waveT * 2 % 1) * 8, 0, 0, Math.PI * 2); ctx.stroke();
      if (m.phase === 'warn' && blink) {
        ctx.fillStyle = 'rgba(214,40,40,0.9)';
        ctx.beginPath(); ctx.arc(sx, spaceGroundY - 44, 12, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 18px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('!', sx, spaceGroundY - 43);
      }
    }
  }
  if (m.phase === 'fall' && m.curX !== undefined) {
    const x = m.curX, y = m.curY;
    const len = Math.hypot(METEOR_DRIFT, spaceGroundY + 30);
    const ux = METEOR_DRIFT / len, uy = -(spaceGroundY + 30) / len; // smjer prema natrag (gore desno)
    const tail = ctx.createLinearGradient(x, y, x + ux * 70, y + uy * 70);
    tail.addColorStop(0, 'rgba(255,200,90,0.9)');
    tail.addColorStop(1, 'rgba(255,70,20,0)');
    ctx.strokeStyle = tail;
    ctx.lineWidth = 16;
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + ux * 70, y + uy * 70); ctx.stroke();
    const rg = ctx.createRadialGradient(x - 3, y - 3, 1, x, y, METEOR_R);
    rg.addColorStop(0, '#a08672');
    rg.addColorStop(1, '#4a3a30');
    ctx.fillStyle = rg;
    ctx.beginPath(); ctx.arc(x, y, METEOR_R, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(255,150,60,0.9)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = 'rgba(40,30,25,0.6)';
    ctx.beginPath(); ctx.arc(x - 4, y + 2, 2.6, 0, Math.PI * 2); ctx.arc(x + 4, y - 3, 2, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

// svemirski brod: kapsula s okruglim prozorom, crvenim nosom i perajama; (x, y) = središte, nos gleda desno
function drawSpaceShip(x, y, o) {
  o = o || {};
  ctx.save();
  ctx.translate(x, y);
  if (o.tilt) ctx.rotate(o.tilt);
  const s = o.scale || 1;
  ctx.scale(s, s);
  // mlaz iz motora (straga)
  if (o.flame > 0) {
    const len = (28 + Math.sin(waveT * 40) * 5) * o.flame;
    const fg = ctx.createLinearGradient(-46, 0, -46 - len, 0);
    fg.addColorStop(0, 'rgba(255,240,170,0.95)');
    fg.addColorStop(0.4, 'rgba(255,150,50,0.85)');
    fg.addColorStop(1, 'rgba(255,60,20,0)');
    ctx.fillStyle = fg;
    ctx.beginPath();
    ctx.moveTo(-46, -8);
    ctx.quadraticCurveTo(-46 - len * 0.6, -7, -46 - len, 0);
    ctx.quadraticCurveTo(-46 - len * 0.6, 7, -46, 8);
    ctx.closePath();
    ctx.fill();
  }
  // mlaz prema dolje (kočenje pri slijetanju)
  if (o.thrust > 0) {
    const len = (24 + Math.sin(waveT * 45) * 5) * o.thrust;
    const tg = ctx.createLinearGradient(0, 18, 0, 18 + len);
    tg.addColorStop(0, 'rgba(255,240,170,0.95)');
    tg.addColorStop(1, 'rgba(255,90,30,0)');
    ctx.fillStyle = tg;
    ctx.beginPath();
    ctx.moveTo(-9, 18);
    ctx.quadraticCurveTo(-6, 18 + len * 0.7, 0, 18 + len);
    ctx.quadraticCurveTo(6, 18 + len * 0.7, 9, 18);
    ctx.closePath();
    ctx.fill();
  }
  // noge za slijetanje
  if (o.legs > 0) {
    const L = 14 * o.legs;
    ctx.strokeStyle = '#7d8597';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-22, 14); ctx.lineTo(-28, 16 + L);
    ctx.moveTo(18, 14); ctx.lineTo(24, 16 + L);
    ctx.stroke();
    ctx.fillStyle = '#5c6370';
    ctx.fillRect(-33, 15 + L, 10, 3);
    ctx.fillRect(19, 15 + L, 10, 3);
  }
  // peraje
  ctx.fillStyle = '#e63946';
  ctx.beginPath(); ctx.moveTo(-28, -12); ctx.lineTo(-46, -30); ctx.lineTo(-38, -8); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-28, 12); ctx.lineTo(-46, 28); ctx.lineTo(-38, 8); ctx.closePath(); ctx.fill();
  // motor
  ctx.fillStyle = '#7d8597';
  ctx.fillRect(-48, -9, 9, 18);
  // tijelo
  const bg = ctx.createLinearGradient(0, -21, 0, 21);
  bg.addColorStop(0, '#ffffff');
  bg.addColorStop(1, '#bfc5d0');
  ctx.fillStyle = bg;
  ctx.beginPath(); ctx.ellipse(0, 0, 46, 21, 0, 0, Math.PI * 2); ctx.fill();
  ctx.save();
  ctx.beginPath(); ctx.ellipse(0, 0, 46, 21, 0, 0, Math.PI * 2); ctx.clip();
  ctx.fillStyle = '#e63946';
  ctx.fillRect(30, -25, 24, 50);
  ctx.fillStyle = '#ffd452';
  ctx.fillRect(-20, -25, 5, 50);
  // vrata (desno dolje) - otvaraju se kad brod sleti
  if (o.door > 0) {
    ctx.fillStyle = 'rgba(30,25,15,' + (0.9 * o.door) + ')';
    ctx.fillRect(14, 2, 16, 18);
    ctx.fillStyle = 'rgba(255,214,100,' + (0.5 * o.door) + ')';
    ctx.fillRect(16, 4, 12, 14);
  }
  ctx.restore();
  ctx.strokeStyle = 'rgba(90,100,120,0.6)';
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.ellipse(0, 0, 46, 21, 0, 0, Math.PI * 2); ctx.stroke();
  // rampa
  if (o.door > 0) {
    ctx.strokeStyle = '#9aa1ad';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(30, 19); ctx.lineTo(30 + 22 * o.door, 19 + 14 * o.door); ctx.stroke();
  }
  // okrugli prozor
  ctx.fillStyle = '#4a5568';
  ctx.beginPath(); ctx.arc(6, -4, 9.5, 0, Math.PI * 2); ctx.fill();
  const wg = ctx.createRadialGradient(3, -7, 1, 6, -4, 8);
  wg.addColorStop(0, '#dff4ff');
  wg.addColorStop(1, '#4ea8de');
  ctx.fillStyle = wg;
  ctx.beginPath(); ctx.arc(6, -4, 7.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.beginPath(); ctx.ellipse(3.5, -7, 2.5, 1.5, -0.6, 0, Math.PI * 2); ctx.fill();
  // zlatno svjetlo na trbuhu (izvor zrake)
  if (o.beamLight) {
    ctx.fillStyle = '#ffd452';
    ctx.beginPath(); ctx.ellipse(0, 20, 10, 3.5, 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function drawParkedShip() {
  if (!spaceShip) return;
  const sx = spaceShip.worldX - scrollX;
  if (sx < -80 || sx > W + 80) return;
  const scale = 0.9;
  const y = spaceGroundY - (16 + 14 * spaceShip.legs + 3) * scale + spaceShip.dy;
  drawSpaceShip(sx, y, { scale: scale, legs: spaceShip.legs, thrust: spaceShip.thrust, door: spaceShip.door });
}

function drawSpaceBeeShadow(alpha) {
  if (gameState !== 'playing') return;
  const bx = scrollX + bee.x;
  if (!spaceSolidAt(bx)) return;
  const h = spaceGroundY - (bee.y + bee.r);
  if (h < 2) return;
  ctx.save();
  ctx.globalAlpha = alpha * 0.3 * Math.max(0, 1 - h / 260);
  ctx.fillStyle = '#000';
  ctx.beginPath(); ctx.ellipse(bee.x, spaceGroundY + 1, 12 * Math.max(0.4, 1 - h / 400), 3, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// pčelica u malom bijelom svemirskom odijelu s okruglom staklenom kacigom (antene u dvije male kupole)
// core.js drawBee() je poziva dok je svijet svemir
function drawSpaceBee() {
  const dying = gameState === 'dying';
  const running = spaceGrounded && !dying;
  const ph = spaceRunT * 15;
  ctx.save();
  ctx.translate(bee.x, bee.y);
  const tilt = dying ? deathSpin
    : bee.spin !== undefined ? bee.spin
    : running ? 0 : Math.max(-0.25, Math.min(0.3, bee.vy / 1600));
  ctx.rotate(tilt);
  if (running) ctx.translate(0, -Math.abs(Math.sin(ph)) * 1.5);

  // nožice (iza tijela) - trče na tlu, u zraku su skupljene
  for (let i = 0; i < 2; i++) {
    const hipX = i === 0 ? -5 : 4;
    const swing = running ? Math.sin(ph + i * Math.PI) * 5 : (i === 0 ? -3 : 3);
    const footY = running ? 15 - Math.max(0, Math.sin(ph + i * Math.PI)) * 2 : 12;
    ctx.strokeStyle = i === 0 ? '#d3d8e0' : '#eef1f5';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(hipX, 6); ctx.lineTo(hipX + swing, footY - 1); ctx.stroke();
    ctx.fillStyle = '#7d8597';
    ctx.beginPath(); ctx.ellipse(hipX + swing + 1.5, footY, 3.8, 2.4, 0, 0, Math.PI * 2); ctx.fill();
  }

  // ruksak s kisikom
  ctx.fillStyle = '#c9ced8';
  ctx.strokeStyle = 'rgba(90,100,120,0.6)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-20, -8); ctx.lineTo(-13, -10); ctx.lineTo(-12, 8); ctx.lineTo(-19, 9);
  ctx.quadraticCurveTo(-22, 0, -20, -8);
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#e63946';
  ctx.beginPath(); ctx.arc(-17, -4, 1.4, 0, Math.PI * 2); ctx.fill();

  // krilca kroz otvore na odijelu
  const flap = spaceGrounded ? 0 : Math.sin(flapT * 2) * 0.4;
  ctx.fillStyle = 'rgba(235,247,255,0.8)';
  ctx.strokeStyle = 'rgba(150,180,210,0.8)';
  for (const side of [-1, 1]) {
    ctx.save();
    ctx.translate(-3 + side * 3, -9);
    ctx.rotate(side * 0.35 - side * flap);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(side * 10, -9, side * 9, 0);
    ctx.quadraticCurveTo(side * 9, 5, 0, 3);
    ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.restore();
  }

  // odijelo
  const sg = ctx.createRadialGradient(-5, -4, 2, -2, 2, 16);
  sg.addColorStop(0, '#ffffff');
  sg.addColorStop(1, '#cfd5de');
  ctx.fillStyle = sg;
  ctx.beginPath(); ctx.ellipse(-2, 2, 14, 11, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(90,100,120,0.55)';
  ctx.lineWidth = 1;
  ctx.stroke();
  // pčelinje pruge na odijelu (da se zna tko je unutra)
  ctx.save();
  ctx.beginPath(); ctx.ellipse(-2, 2, 14, 11, 0, 0, Math.PI * 2); ctx.clip();
  ctx.fillStyle = '#ffcb3d';
  ctx.fillRect(-12, 4, 18, 5);
  ctx.fillStyle = '#2b2118';
  ctx.fillRect(-9, 4, 2.5, 5);
  ctx.fillRect(-3, 4, 2.5, 5);
  ctx.fillRect(3, 4, 2.5, 5);
  ctx.restore();
  // ruka
  const armSwing = running ? Math.sin(ph + Math.PI) * 0.5 : -0.6;
  ctx.save();
  ctx.translate(3, 0);
  ctx.rotate(armSwing);
  ctx.strokeStyle = '#e6e9ee';
  ctx.lineWidth = 4.5;
  ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(5, 7); ctx.stroke();
  ctx.fillStyle = '#7d8597';
  ctx.beginPath(); ctx.arc(5.5, 8, 2.3, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  // ovratnik kacige
  ctx.fillStyle = '#9aa1ad';
  ctx.beginPath(); ctx.ellipse(6, -2, 8, 3, -0.3, 0, Math.PI * 2); ctx.fill();

  // glava (lice pčelice) unutar kacige
  const hx = 8, hy = -9, hr = 11;
  ctx.fillStyle = '#ffcb3d';
  ctx.beginPath(); ctx.arc(hx, hy, 8, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255,140,140,0.5)';
  ctx.beginPath(); ctx.ellipse(hx + 3, hy + 3, 2.6, 1.7, 0, 0, Math.PI * 2); ctx.fill();
  if (dying) {
    ctx.strokeStyle = '#2b2118';
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(hx + 2, hy - 4); ctx.lineTo(hx + 6, hy);
    ctx.moveTo(hx + 6, hy - 4); ctx.lineTo(hx + 2, hy);
    ctx.stroke();
  } else {
    ctx.fillStyle = '#2b2118';
    ctx.beginPath(); ctx.arc(hx + 4, hy - 2, 2.6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(hx + 5, hy - 3, 1, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#7a4a1a';
    ctx.lineWidth = 1.2;
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(hx + 3, hy + 2, 2.4, 0.15, Math.PI * 0.6); ctx.stroke();
  }
  // antene vode u dvije male kupole na vrhu kacige
  const domes = [-2.05, -1.35];
  for (const a of domes) {
    const dx = hx + Math.cos(a) * hr, dy = hy + Math.sin(a) * hr;
    ctx.strokeStyle = '#2b2118';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(hx + Math.cos(a) * 5, hy + Math.sin(a) * 5);
    ctx.lineTo(dx + Math.cos(a) * 1.5, dy + Math.sin(a) * 1.5);
    ctx.stroke();
    ctx.fillStyle = '#2b2118';
    ctx.beginPath(); ctx.arc(dx + Math.cos(a) * 2, dy + Math.sin(a) * 2, 1.4, 0, Math.PI * 2); ctx.fill();
  }
  // staklo kacige
  ctx.fillStyle = 'rgba(190,225,255,0.22)';
  ctx.beginPath(); ctx.arc(hx, hy, hr, 0, Math.PI * 2); ctx.fill();
  for (const a of domes) {
    const dx = hx + Math.cos(a) * hr, dy = hy + Math.sin(a) * hr;
    ctx.beginPath(); ctx.arc(dx, dy, 4, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(225,238,255,0.9)';
    ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(dx, dy, 4, a - Math.PI / 2 - 0.3, a + Math.PI / 2 + 0.3); ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(225,238,255,0.95)';
  ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.arc(hx, hy, hr, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.75)';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(hx, hy, hr - 3, Math.PI * 1.05, Math.PI * 1.45); ctx.stroke();

  ctx.restore();
}

// ---------- Poruke na kraju igre ----------
function spaceDeathText(reason) {
  return {
    crater: 'Upala je u krater! 🕳️',
    rock: 'Zapela je za mjesečevu stijenu! 🪨',
    robowasp: 'Ubola te robotska osa! 🤖',
    meteor: 'Pogodio te meteor! ☄️',
    redbird: mp.active ? null : 'Ulovila te crvena ptica! 🐦'
  }[reason] || null;
}
