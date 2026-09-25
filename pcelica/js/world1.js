// ===== Pčelica - SVIJET 1 (dnevni svijet): livada/voda, cvijeće, leptiri, neprijatelji, bonus sobe (medena špilja, oblačno kraljevstvo) =====
// ---------- Butterflies: friendly collectibles that join a trailing line behind the bee ----------
const BUTTERFLY_VALUE = 2;
const FOLLOW_SPACING = 26;
const FOLLOW_DELAY = 0.09;
let butterflies = [];
let butterflyFollowers = [];
let fleeingButterflies = [];
let trailHistory = [];
let trailClock = 0;
let nextButterflyAt = 900;
let nextWaspAt = 1500;

// ---------- Bonus round: whirlpool -> honey cave ----------
const BONUS_DURATION = 10;
const HONEY_VALUE = 3;


const BONUS_CEIL_Y = 68; // rocky cave ceiling depth
const BONUS_WATER_RATIO = 0.85; // water floor starts at this fraction of H
const BONUS_EXIT_DURATION = 1.1; // how long the geyser sweep-up takes
let inBonus = false;
let bonusT = 0;
let bonusHoneyCount = 0;
let bonusDrops = [];
let bonusBubbles = [];
let bonusFlashAlpha = 0;
let bonusExitGraceT = 0;
let bonusExiting = false;
let bonusExitTimer = 0;
let bonusExitReason = null;
let geyserX = 0;
let bonusEntering = false;
let bonusEnterTimer = 0;
let bonusEnterType = null;
const BONUS_ENTER_DURATION = 0.85;
let nextBonusDropAt = 0;
let nextBonusBubbleAt = 0;
let stuckBird = null;
let stuckTimeLeft = 0;
const STUCK_DURATION = 0.5;

function spawnFlower(worldX) {
  const minY = H * 0.15;
  const maxY = waterY - MEADOW_RAISE - 40;
  flowers.push({
    id: 'f_' + Math.round(worldX),
    worldX: worldX,
    y: minY + rand() * (maxY - minY),
    r: 12,
    taken: false,
    special: false,
    bob: rand() * Math.PI * 2,
    hue: [ '#ff6f91', '#ffd452', '#ff9f43', '#c56cf0'][Math.floor(rand()*4)]
  });
}

function spawnSpecialFlower(worldX) {
  const minY = H * 0.18;
  const maxY = waterY - MEADOW_RAISE - 50;
  flowers.push({
    id: 'sf_' + Math.round(worldX),
    worldX: worldX,
    y: minY + rand() * (maxY - minY),
    r: 15,
    taken: false,
    special: true,
    gold: false,
    bob: rand() * Math.PI * 2,
    hue: '#1a1a2a'
  });
}

function spawnGoldFlower(worldX) {
  const minY = H * 0.18;
  const maxY = waterY - MEADOW_RAISE - 50;
  flowers.push({
    id: 'gf_' + Math.round(worldX),
    worldX: worldX,
    y: minY + rand() * (maxY - minY),
    r: 15,
    taken: false,
    special: false,
    gold: true,
    bob: rand() * Math.PI * 2,
    hue: '#ffb703'
  });
}

function spawnButterfly(worldX) {
  const minY = H * 0.15;
  const maxY = waterY - MEADOW_RAISE - 40;
  butterflies.push({
    id: 'bf_' + Math.round(worldX),
    worldX: worldX,
    y: minY + rand() * (maxY - minY),
    r: 13,
    taken: false,
    bob: rand() * Math.PI * 2,
    flapPhase: rand() * Math.PI * 2,
    hue: ['#ff8fc7', '#8fd3ff', '#c9a3ff', '#ffe08a'][Math.floor(rand()*4)]
  });
}

function spawnCloud(worldX) {
  clouds.push({
    worldX: worldX,
    y: 30 + Math.random() * (H * 0.35),
    scale: 0.6 + Math.random() * 0.8,
    speedMul: 0.3 + Math.random() * 0.3
  });
}

function spawnBird(worldX) {
  const minY = H * 0.15;
  const maxY = waterY - MEADOW_RAISE - 70;
  birds.push({
    worldX: worldX,
    baseY: minY + rand() * (maxY - minY),
    y: 0,
    r: 15,
    ampl: 20 + rand() * 30,
    freq: 1.2 + rand() * 0.8,
    phase: rand() * Math.PI * 2,
    speedMul: 1 + rand() * 0.6, // birds fly a bit faster than scroll => approach bee
    dir: -1, // always face left, matching their actual travel direction toward the bee
    flapPhase: rand() * Math.PI * 2,
    hit: false
  });
}

const WASP_SPEED_MUL = 1.75;   // closes in faster than birds
const WASP_HOMING_RATE = 3.4;  // how eagerly it tracks the bee's height
const WASP_R = 10;

function spawnWasp(worldX) {
  wasps.push({
    worldX: worldX,
    y: H * 0.3 + rand() * H * 0.3,
    r: WASP_R,
    freq: 2.6 + rand() * 2.2,   // fast up/down wobble - hard to predict
    amp: 55 + rand() * 45,
    phase: rand() * Math.PI * 2,
    flapPhase: rand() * Math.PI * 2,
    hit: false
  });
}

const FISH_HOOK_R = 9;
const FISH_MAX_HEIGHT_RATIO = 0.55; // fraction of waterY the hook can rise

const JUMP_FISH_R = 13;
const JUMP_FISH_HEIGHT = 85;
const JUMP_FISH_AIR_FRACTION = 0.4;

function spawnFisherman(worldX) {
  fishermen.push({
    worldX: worldX,
    phase: rand() * Math.PI * 2,
    castSpeed: 0.9 + rand() * 0.3
  });
}

function generateGroundTufts(segStart, segEnd) {
  const tufts = [];
  const count = Math.floor((segEnd - segStart) / 55);
  for (let i = 0; i < count; i++) {
    const isFlower = rand() < 0.35;
    const offset = 20 + rand() * (segEnd - segStart - 40);
    tufts.push({
      id: 'gt_' + Math.round(segStart) + '_' + Math.round(offset),
      offset: offset,
      h: 10 + rand() * 10,
      kind: isFlower ? 'flower' : 'grass',
      hue: ['#ff8fa3', '#ffe08a', '#ffffff', '#c56cf0'][Math.floor(rand()*4)],
      taken: false,
      r: 11
    });
  }
  return tufts;
}

function generateFishSpots(segStart, segEnd) {
  const len = segEnd - segStart;
  if (len < 300) return [];
  const count = Math.min(3, Math.max(1, Math.floor(len / 500)));
  const spots = [];
  for (let i = 0; i < count; i++) {
    spots.push({
      offset: 100 + rand() * Math.max(60, len - 200),
      phase: rand() * 100,
      cycle: 2.6 + rand() * 1.4
    });
  }
  return spots;
}

const FROG_TRIGGER_RANGE = 125;
const FROG_STRIKE_DURATION = 0.32;
const FROG_COOLDOWN = 1.6;
const FROG_TONGUE_R = 9;

function generateFrog(segStart, segEnd) {
  const len = segEnd - segStart;
  if (len < 400 || rand() < 0.45) return null;
  return {
    offset: 120 + rand() * Math.max(80, len - 240),
    state: 'idle',
    strikeT: 0,
    cooldown: rand() * 1,
    angle: 0,
    maxLen: 0,
    blink: rand() * 3
  };
}

const TREE_MIN_GAP = 190;
const TREE_MAX_GAP = 250;
const TREE_HALF_WIDTH = 34;

function generateTree(segStart, segEnd, frog) {
  const len = segEnd - segStart;
  if (len < 450 || rand() < 0.5) return null;
  let offset = 150 + rand() * Math.max(100, len - 300);
  // keep some distance from the frog so the two hazards don't stack right on top of each other
  if (frog && Math.abs(offset - frog.offset) < 160) {
    offset = frog.offset + (offset < frog.offset ? -160 : 160);
    offset = Math.max(100, Math.min(len - 100, offset));
  }
  return {
    offset,
    gapSize: TREE_MIN_GAP + rand() * (TREE_MAX_GAP - TREE_MIN_GAP),
    swayPhase: rand() * Math.PI * 2
  };
}

const WHIRLPOOL_TRIGGER_R = 34;
const CLOUD_PORTAL_R = 30;
let cloudPortals = [];
let nextCloudPortalAt = 2200;


function generateWhirlpool(segStart, segEnd) {
  const len = segEnd - segStart;
  if (len < 500 || rand() < 0.25) return null; // most water segments now get one
  return {
    offset: 150 + rand() * Math.max(100, len - 300),
    spinPhase: rand() * Math.PI * 2
  };
}

function spawnCloudPortal(worldX) {
  cloudPortals.push({
    worldX: worldX,
    y: H * 0.16 + rand() * H * 0.14,
    r: CLOUD_PORTAL_R,
    taken: false,
    phase: rand() * Math.PI * 2
  });
}

// ---------- Terrain: alternating water / meadow segments ----------
function addTerrainSegment(type, len) {
  const start = terrain.length ? terrain[terrain.length - 1].end : 0;
  const end = start + len;
  const seg = { start, end, type, fishermanSpawned: false, tufts: null, fishSpots: null, frog: null, tree: null, whirlpool: null };
  if (type === 'meadow') {
    seg.tufts = generateGroundTufts(start, end);
    seg.frog = generateFrog(start, end);
    seg.tree = generateTree(start, end, seg.frog);
  }
  if (type === 'water') {
    seg.fishSpots = generateFishSpots(start, end);
    seg.whirlpool = generateWhirlpool(start, end);
  }
  terrain.push(seg);
}

function initTerrain() {
  MEADOW_RAISE = Math.max(60, H * 0.14);
  terrain = [];
  // start on water, long enough to introduce the fisherman
  addTerrainSegment('water', 1600);
}

function ensureTerrainAhead() {
  const aheadLimit = scrollX + W * 3;
  while (terrain[terrain.length - 1].end < aheadLimit) {
    const last = terrain[terrain.length - 1];
    // pred kraj noći voda nestaje (forcedTerrainType u world3.js), inače se voda i livada izmjenjuju
    const nextType = forcedTerrainType(last.end) || (last.type === 'water' ? 'meadow' : 'water');
    const len = TERRAIN_MIN_LEN + rand() * (TERRAIN_MAX_LEN - TERRAIN_MIN_LEN);
    addTerrainSegment(nextType, len);
  }
  // drop segments fully behind the camera
  while (terrain.length > 1 && terrain[0].end < scrollX - W) {
    terrain.shift();
  }
}

function terrainAt(worldX) {
  for (const seg of terrain) {
    if (worldX >= seg.start && worldX < seg.end) return seg;
  }
  return terrain[terrain.length - 1];
}

function terrainBlendAt(worldX) {
  // returns 0 = fully water, 1 = fully meadow, with a single soft strip
  // in the tail of each segment as it approaches the NEXT boundary.
  // (Only one blend zone per boundary - avoids a double/contradictory
  // transition which caused the terrain to flicker at segment seams.)
  const seg = terrainAt(worldX);
  const idx = terrain.indexOf(seg);
  const ownVal = seg.type === 'meadow' ? 1 : 0;
  const distEnd = seg.end - worldX;
  if (distEnd < SHORE_BLEND && idx < terrain.length - 1) {
    const nextVal = terrain[idx + 1].type === 'meadow' ? 1 : 0;
    const f = distEnd / SHORE_BLEND; // 1 = still fully own type, 0 = right at the boundary
    return nextVal + (ownVal - nextVal) * f;
  }
  return ownVal;
}

function surfaceYAt(worldX) {
  const blend = terrainBlendAt(worldX);
  return waterY - blend * MEADOW_RAISE;
}

// whirlpool (honey cave) and strange clouds (cloud kingdom) - returns true if the bee got pulled into one
function checkWorld1Portals(beeWorldX) {
  const wpSeg = terrainAt(beeWorldX);
  if (wpSeg.type === 'water' && wpSeg.whirlpool) {
    const wpWorldX = wpSeg.start + wpSeg.whirlpool.offset;
    if (Math.abs(beeWorldX - wpWorldX) < WHIRLPOOL_TRIGGER_R && bee.y + bee.r >= waterY - 22) {
      beginBonusEnter('honey');
      return true;
    }
  }
  for (const cp of cloudPortals) {
    if (cp.taken) continue;
    const csx = cp.worldX - scrollX;
    const dist = Math.sqrt((csx - bee.x)**2 + (cp.y - bee.y)**2);
    if (dist < cp.r + bee.r) {
      cp.taken = true;
      beginBonusEnter('cloud');
      return true;
    }
  }
  return false;
}

function updateCloudPortalSpawns() {
  cloudPortals = cloudPortals.filter(cp => (cp.worldX - scrollX) > -80);
  if (scrollX + W * 2 > nextCloudPortalAt) {
    spawnCloudPortal(nextCloudPortalAt + rand() * 150);
    nextCloudPortalAt += 1800 + rand() * 1300;
  }
}

// all world entities - returns true if the bee died this frame (caller should stop updating)
function updateWorldEntities(dt, invulnerable) {
  // flowers collision + spawn management
  for (const f of flowers) {
    if (f.taken) continue;
    const screenX = f.worldX - scrollX;
    const dx = screenX - bee.x;
    const dy = (f.y + Math.sin(waveT*2 + f.bob)*6) - bee.y;
    const dist = Math.sqrt(dx*dx + dy*dy);
    if (dist < f.r + bee.r) {
      f.taken = true;
      if (mp.active) broadcastFlowerTaken(f.id);
      if (f.special) {
        // u multiplayeru crni cvijet je sabotaža: obrne komande protivniku, ne tebi
        if (mp.active) mpSendSabotage();
        else {
          invertActive = true;
          invertTimeLeft = INVERT_DURATION;
        }
        for (let i = 0; i < 18; i++) {
          particles.push({
            x: bee.x, y: bee.y,
            vx: (Math.random()-0.5)*280,
            vy: (Math.random()-0.5)*280 - 40,
            life: 0.7, age: 0,
            color: i % 2 === 0 ? '#1a1a2a' : '#ffd452'
          });
        }
      } else if (f.gold) {
        if (!mpShieldCancelsSabotage()) {
          shieldActive = true;
          shieldTimeLeft = SHIELD_DURATION;
        }
        for (let i = 0; i < 18; i++) {
          particles.push({
            x: bee.x, y: bee.y,
            vx: (Math.random()-0.5)*280,
            vy: (Math.random()-0.5)*280 - 40,
            life: 0.7, age: 0,
            color: i % 2 === 0 ? '#ffd452' : '#fff6c8'
          });
        }
      } else {
        score += 1;
        scoreVal.textContent = score;
        awardFlowerLife();
        for (let i = 0; i < 10; i++) {
          particles.push({
            x: bee.x, y: bee.y,
            vx: (Math.random()-0.5)*220,
            vy: (Math.random()-0.5)*220 - 40,
            life: 0.5, age: 0,
            color: f.hue
          });
        }
      }
    }
  }
  // recycle flowers that scrolled off-screen far left, spawn new ahead
  const rightMostWorldX = Math.max(...flowers.map(f => f.worldX));
  flowers = flowers.filter(f => (f.worldX - scrollX) > -60);
  while (flowers.length < 6) {
    spawnFlower(rightMostWorldX + 150 + rand()*80);
  }
  // occasional black flower that shakes up the controls
  if (scrollX + W * 2 > nextSpecialFlowerAt) {
    spawnSpecialFlower(nextSpecialFlowerAt + rand() * 100);
    nextSpecialFlowerAt += 1000 + rand() * 900;
  }
  // occasional gold flower that grants a shield
  if (scrollX + W * 2 > nextGoldFlowerAt) {
    spawnGoldFlower(nextGoldFlowerAt + rand() * 100);
    nextGoldFlowerAt += 1300 + rand() * 1000;
  }

  // bee position trail - used to place the butterfly followers behind it
  trailClock += dt;
  trailHistory.push({ y: bee.y, t: trailClock });
  const maxNeeded = (butterflyFollowers.length + 1) * FOLLOW_DELAY + 0.5;
  while (trailHistory.length > 2 && trailClock - trailHistory[0].t > maxNeeded) trailHistory.shift();

  // butterflies: friendly, join the trailing line behind the bee when collected
  for (const bf of butterflies) {
    if (bf.taken) continue;
    const screenX = bf.worldX - scrollX;
    const dx = screenX - bee.x;
    const dy = (bf.y + Math.sin(waveT*2 + bf.bob)*6) - bee.y;
    const dist = Math.sqrt(dx*dx + dy*dy);
    if (dist < bf.r + bee.r) {
      bf.taken = true;
      score += BUTTERFLY_VALUE;
      scoreVal.textContent = score;
      butterflyFollowers.push({ flapPhase: rand() * Math.PI * 2, hue: bf.hue });
      for (let i = 0; i < 12; i++) {
        particles.push({
          x: bee.x, y: bee.y,
          vx: (Math.random()-0.5)*220, vy: (Math.random()-0.5)*220 - 40,
          life: 0.5, age: 0, color: bf.hue
        });
      }
    }
  }
  butterflies = butterflies.filter(bf => (bf.worldX - scrollX) > -40);
  if (scrollX + W * 2 > nextButterflyAt) {
    spawnButterfly(nextButterflyAt + rand() * 100);
    nextButterflyAt += 700 + rand() * 500;
  }

  // ground flowers on meadow segments (collectible)
  for (const seg of terrain) {
    if (seg.type !== 'meadow' || !seg.tufts) continue;
    for (const tuft of seg.tufts) {
      if (tuft.kind !== 'flower' || tuft.taken) continue;
      const wx = seg.start + tuft.offset;
      const screenX = wx - scrollX;
      if (screenX < -40 || screenX > W + 40) continue;
      const groundY = surfaceYAt(wx);
      const screenY = groundY - tuft.h * 0.9;
      const dx = screenX - bee.x;
      const dy = screenY - bee.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < tuft.r + bee.r) {
        tuft.taken = true;
        if (mp.active) broadcastFlowerTaken(tuft.id);
        score += 1;
        scoreVal.textContent = score;
        awardFlowerLife();
        for (let i = 0; i < 10; i++) {
          particles.push({
            x: bee.x, y: bee.y,
            vx: (Math.random()-0.5)*220,
            vy: (Math.random()-0.5)*220 - 40,
            life: 0.5, age: 0,
            color: tuft.hue
          });
        }
      }
    }
  }

  // clouds - more of them gather as the storm approaches
  clouds = clouds.filter(c => (c.worldX - scrollX*c.speedMul) > -150);
  const desiredClouds = 4 + Math.round(weather.cloudDarkness * 5);
  while (clouds.length < desiredClouds) {
    const rightMost = clouds.length ? Math.max(...clouds.map(c => c.worldX)) : scrollX + W;
    spawnCloud(rightMost + 90 + Math.random()*120);
  }

  // birds: move a bit faster leftward than the scroll to feel like they're closing in
  for (const b of birds) {
    b.worldX -= FORWARD_SPEED * (b.speedMul - 1) * dt;
    const screenX = b.worldX - scrollX;
    const screenY = b.baseY + Math.sin(waveT * b.freq + b.phase) * b.ampl;
    b.curScreenX = screenX;
    b.curScreenY = screenY;
    if (!b.hit && !invulnerable) {
      const dx = screenX - bee.x;
      const dy = screenY - bee.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < b.r + bee.r - 4) {
        if (loseLifeOrDie('bird', b)) {
          b.hit = true;
        } else {
          triggerDeath('bird');
          return true;
        }
      }
    }
  }
  birds = birds.filter(b => (b.worldX - scrollX) > -80);
  while (birds.length < 2) {
    const rightMost = birds.length ? Math.max(...birds.map(b => b.worldX)) : scrollX + W;
    spawnBird(rightMost + 350 + rand() * 250);
  }

  // wasps: aggressively home in on the bee's height while wobbling fast up/down - hard to dodge
  for (const w of wasps) {
    w.worldX -= FORWARD_SPEED * (WASP_SPEED_MUL - 1) * dt;
    const screenX = w.worldX - scrollX;
    const targetY = bee.y + Math.sin(waveT * w.freq + w.phase) * w.amp;
    w.vyDir = targetY > w.y ? 1 : -1;
    w.y += (targetY - w.y) * Math.min(1, WASP_HOMING_RATE * dt);
    w.curScreenX = screenX;
    w.curScreenY = w.y;
    if (!w.hit && !invulnerable) {
      const dx = screenX - bee.x;
      const dy = w.y - bee.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < w.r + bee.r - 3) {
        if (loseLifeOrDie('wasp', null)) {
          w.hit = true;
        } else {
          triggerDeath('wasp');
          return true;
        }
      }
    }
  }
  wasps = wasps.filter(w => (w.worldX - scrollX) > -80);
  if (scrollX + W * 2 > nextWaspAt) {
    spawnWasp(nextWaspAt + W * 0.4);
    nextWaspAt += 1500 + rand() * 1100;
  }

  // fishermen: stand fixed in world, rod swings and hook rises/falls out of the water
  for (const fm of fishermen) {
    const t = waveT * fm.castSpeed + fm.phase;
    const castHeight = Math.max(0, Math.sin(t)) ** 1.5 * (waterY * FISH_MAX_HEIGHT_RATIO);
    const hookScreenX = (fm.worldX - scrollX) + Math.sin(t * 0.7) * 14;
    const hookScreenY = waterY - castHeight;
    fm.curHookX = hookScreenX;
    fm.curHookY = hookScreenY;
    fm.curT = t;
    const dx = hookScreenX - bee.x;
    const dy = hookScreenY - bee.y;
    const dist = Math.sqrt(dx*dx + dy*dy);
    if (!invulnerable && dist < FISH_HOOK_R + bee.r - 3) {
      if (!loseLifeOrDie('fisherman')) {
        triggerDeath('fisherman');
        return true;
      }
    }
  }
  fishermen = fishermen.filter(fm => (fm.worldX - scrollX) > -120);

  // spawn exactly one fisherman per water segment, only when none is currently active
  if (fishermen.length === 0) {
    for (const seg of terrain) {
      if (seg.type === 'water' && !seg.fishermanSpawned) {
        const segLen = seg.end - seg.start;
        // only spawn once the segment is reasonably close/visible ahead, and long enough
        if (segLen > 300 && seg.start < scrollX + W * 2) {
          spawnFisherman(seg.start + segLen * 0.5);
          seg.fishermanSpawned = true;
          break;
        }
      }
    }
  }

  // jumping fish: leap out of the water on a repeating cycle, dangerous mid-air
  for (const seg of terrain) {
    if (seg.type !== 'water' || !seg.fishSpots) continue;
    for (const spot of seg.fishSpots) {
      const airDuration = spot.cycle * JUMP_FISH_AIR_FRACTION;
      const localT = (waveT + spot.phase) % spot.cycle;
      if (localT < airDuration) {
        const progress = localT / airDuration;
        const arc = Math.sin(Math.PI * progress);
        const wx = seg.start + spot.offset + arc * 24;
        const screenX = wx - scrollX;
        const screenY = waterY - arc * JUMP_FISH_HEIGHT;
        spot.curX = screenX;
        spot.curY = screenY;
        spot.airborne = true;
        spot.progress = progress;
        if (screenX > -40 && screenX < W + 40) {
          const dx = screenX - bee.x;
          const dy = screenY - bee.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (!invulnerable && dist < JUMP_FISH_R + bee.r - 3) {
            if (!loseLifeOrDie('fish')) {
              triggerDeath('fish');
              return true;
            }
          }
        }
      } else {
        spot.airborne = false;
      }
    }
  }

  // frogs: sit still on the meadow, lash out with their tongue when the bee gets close
  for (const seg of terrain) {
    if (seg.type !== 'meadow' || !seg.frog) continue;
    const frog = seg.frog;
    const frogWorldX = seg.start + frog.offset;
    const groundY = surfaceYAt(frogWorldX);
    const screenX = frogWorldX - scrollX;
    const mouthX = screenX + 14;
    const mouthY = groundY - 20;
    frog.curScreenX = screenX;
    frog.curGroundY = groundY;
    frog.curMouthX = mouthX;
    frog.curMouthY = mouthY;

    if (frog.cooldown > 0) frog.cooldown -= dt;

    if (frog.state === 'idle') {
      if (!invulnerable && frog.cooldown <= 0 && screenX > -60 && screenX < W + 60) {
        const dx = bee.x - mouthX;
        const dy = bee.y - mouthY;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < FROG_TRIGGER_RANGE) {
          frog.state = 'striking';
          frog.strikeT = 0;
          frog.angle = Math.atan2(dy, dx);
          frog.maxLen = FROG_TRIGGER_RANGE;
        }
      }
    } else if (frog.state === 'striking') {
      frog.strikeT += dt / FROG_STRIKE_DURATION;
      if (frog.strikeT >= 1) {
        frog.state = 'idle';
        frog.strikeT = 0;
        frog.cooldown = FROG_COOLDOWN;
      } else {
        const p = frog.strikeT < 0.5 ? frog.strikeT / 0.5 : 1 - (frog.strikeT - 0.5) / 0.5;
        const curLen = frog.maxLen * p;
        const tipX = mouthX + Math.cos(frog.angle) * curLen;
        const tipY = mouthY + Math.sin(frog.angle) * curLen;
        frog.curTipX = tipX;
        frog.curTipY = tipY;
        if (!invulnerable) {
          const dx = tipX - bee.x;
          const dy = tipY - bee.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < FROG_TONGUE_R + bee.r - 2) {
            if (!loseLifeOrDie('frog')) {
              triggerDeath('frog');
              return true;
            }
            frog.state = 'idle';
            frog.strikeT = 0;
            frog.cooldown = FROG_COOLDOWN;
          }
        }
      }
    }
  }

  // hanging tree branches: dangle from the top of the screen, only the gap below is safe to fly through
  for (const seg of terrain) {
    if (seg.type !== 'meadow' || !seg.tree) continue;
    const tree = seg.tree;
    const treeWorldX = seg.start + tree.offset;
    const groundY = surfaceYAt(treeWorldX);
    const branchBottomY = groundY - tree.gapSize;
    const screenX = treeWorldX - scrollX;
    tree.curScreenX = screenX;
    tree.curBranchBottomY = branchBottomY;
    tree.curGroundY = groundY;
    if (!invulnerable && screenX > -TREE_HALF_WIDTH - 60 && screenX < W + TREE_HALF_WIDTH + 60) {
      const withinBranchWidth = Math.abs(bee.x - screenX) < TREE_HALF_WIDTH + bee.r * 0.5;
      if (withinBranchWidth && bee.y - bee.r < branchBottomY) {
        if (!loseLifeOrDie('tree')) {
          triggerDeath('tree');
          return true;
        }
      }
    }
  }
  return false;
}

// ---------- Bonus round: honey cave ----------
let bonusType = 'honey'; // 'honey' | 'cloud'
let bonusStars = [];
let honeyBank = 0;
let bonusShop = [];
let bonusSubmarine = null;
let bonusPlane = null;
const SHOP_SHIELD_COST = 20;
const SHOP_LIFE_COST = 50;
let nextBonusStarAt = 0;
const STAR_VALUE = 3;

// an unavoidable pull sweeps the bee toward the portal before the scene actually switches -
// downward into the water for the whirlpool, upward into the sky for the cloud portal
function beginBonusEnter(type) {
  if (bonusEntering || inBonus) return;
  bonusEntering = true;
  bonusEnterTimer = 0;
  bonusEnterType = type;
  jumpQueued = false;
  const col = type === 'honey' ? '#8fd8ff' : '#e6ccff';
  for (let i = 0; i < 16; i++) {
    particles.push({
      x: bee.x, y: bee.y,
      vx: (Math.random()-0.5)*200, vy: (Math.random()-0.5)*200 - 40,
      life: 0.5, age: 0, color: col
    });
  }
}

function updateBonusEnter(dt) {
  bonusEnterTimer += dt;
  scrollX += FORWARD_SPEED * dt;
  waveT += dt;
  flapT += dt * 20;
  ensureTerrainAhead();

  const dir = bonusEnterType === 'honey' ? 1 : -1; // honey pulls down into the water, cloud pulls up into the sky
  bee.vy = dir * 480;
  bee.y += bee.vy * dt;
  bee.x += Math.sin(bonusEnterTimer * 18) * 30 * dt; // slight wobble as it's dragged in

  if (Math.random() < 0.7) {
    particles.push({
      x: bee.x + (Math.random()-0.5)*18,
      y: bee.y,
      vx: (Math.random()-0.5)*70,
      vy: dir * (140 + Math.random()*100),
      life: 0.4, age: 0,
      color: bonusEnterType === 'honey' ? '#bfe9ff' : '#e6ccff'
    });
  }
  for (const p of particles) {
    p.age += dt; p.x += p.vx * dt; p.y += p.vy * dt;
    if (p.smoke) p.vx += Math.sin((p.age + p.seed) * 3.5) * 26 * dt;
    else if (p.pollen) p.vy += 40 * dt;
    else p.vy += 500 * dt;
  }
  particles = particles.filter(p => p.age < p.life);

  if (bonusEnterTimer >= BONUS_ENTER_DURATION) {
    bonusEntering = false;
    enterBonus(bonusEnterType);
  }
}

function enterBonus(type) {
  inBonus = true;
  bonusType = type;
  bonusT = BONUS_DURATION;
  bonusHoneyCount = 0;
  bonusDrops = [];
  bonusBubbles = [];
  bonusStars = [];
  bonusFlashAlpha = 1;
  bonusExiting = false;
  bonusExitTimer = 0;
  bee.y = H * 0.5;
  bee.vy = 0;
  if (type === 'honey') {
    nextBonusDropAt = 0;
    nextBonusBubbleAt = 1.2;
    for (let i = 0; i < 5; i++) spawnHoneyDrop(scrollX + i * 150 + 90);
    spawnShopItems();
    bonusSubmarine = { phase: Math.random() * Math.PI * 2 };
    bonusPlane = null;
  } else {
    nextBonusStarAt = 0;
    for (let i = 0; i < 5; i++) spawnStar(scrollX + i * 150 + 90);
    bonusPlane = { x: W + 60, y: BONUS_CEIL_Y + 40 + Math.random() * (H*BONUS_WATER_RATIO - BONUS_CEIL_Y - 80), dir: -1 };
    bonusSubmarine = null;
  }
  const flashColor = type === 'honey' ? '#ffcf3d' : '#dff0ff';
  for (let i = 0; i < 20; i++) {
    particles.push({
      x: bee.x, y: bee.y,
      vx: (Math.random()-0.5)*300, vy: (Math.random()-0.5)*300,
      life: 0.6, age: 0, color: flashColor
    });
  }
}

function spawnHoneyDrop(worldX) {
  const minY = BONUS_CEIL_Y + 30;
  const maxY = H * BONUS_WATER_RATIO - 30;
  bonusDrops.push({
    worldX: worldX,
    y: minY + Math.random() * (maxY - minY),
    r: 11,
    taken: false,
    bob: Math.random() * Math.PI * 2
  });
}

function spawnShopItems() {
  const midY = (BONUS_CEIL_Y + H * BONUS_WATER_RATIO) / 2;
  bonusShop = [
    { kind: 'shield', cost: SHOP_SHIELD_COST, worldX: scrollX + 500, y: midY - 40, r: 16, taken: false },
    { kind: 'life', cost: SHOP_LIFE_COST, worldX: scrollX + 950, y: midY + 40, r: 16, taken: false }
  ];
}

function spawnBubble(worldX) {
  bonusBubbles.push({
    worldX: worldX,
    y: H * BONUS_WATER_RATIO + 20,
    r: 14 + Math.random() * 10,
    driftPhase: Math.random() * Math.PI * 2,
    speed: 60 + Math.random() * 40
  });
}

function spawnStar(worldX) {
  const minY = BONUS_CEIL_Y + 30;
  const maxY = H * BONUS_WATER_RATIO - 30;
  bonusStars.push({
    worldX: worldX,
    y: minY + Math.random() * (maxY - minY),
    r: 10,
    taken: false,
    bob: Math.random() * Math.PI * 2,
    spin: Math.random() * Math.PI * 2
  });
}

// an unavoidable current sweeps the bee out - geyser pushes UP (honey cave),
// downdraft pulls DOWN (cloud kingdom) - triggered by timeout or a bubble hit
function beginBonusExit(reason) {
  if (bonusExiting) return;
  bonusExiting = true;
  bonusExitTimer = 0;
  bonusExitReason = reason;
  geyserX = bee.x;
}

function finishBonusExit(reason) {
  inBonus = false;
  bonusExiting = false;
  bonusFlashAlpha = 1;
  bonusExitGraceT = 1.0;
  bee.y = bee.r + 20; // always reappear safely on-screen near the top, regardless of exit direction
  bee.vy = bonusType === 'honey' ? -420 : 220; // small continuing motion in the exit direction
  const col = bonusType === 'honey' ? '#bfe9ff' : '#e8f4ff';
  for (let i = 0; i < 22; i++) {
    particles.push({
      x: bee.x, y: bee.y,
      vx: (Math.random()-0.5)*260,
      vy: bonusType === 'honey' ? (-Math.random()*320 - 100) : (Math.random()*260 + 60),
      life: 0.7, age: 0, color: col
    });
  }
}

function updateBonus(dt) {
  scrollX += FORWARD_SPEED * dt;
  waveT += dt;
  ensureTerrainAhead(); // keep the main world growing quietly in the background
  if (bonusFlashAlpha > 0) bonusFlashAlpha = Math.max(0, bonusFlashAlpha - dt * 2.5);

  if (bonusExiting) {
    // caught by the current - can't be avoided, rides it straight out
    bonusExitTimer += dt;
    bee.x += (geyserX - bee.x) * Math.min(1, dt * 8);
    const dir = bonusType === 'honey' ? -1 : 1;
    bee.vy = dir * 560;
    bee.y += bee.vy * dt;
    const spawnY = bonusType === 'honey' ? (H * BONUS_WATER_RATIO + 10) : (BONUS_CEIL_Y - 10);
    if (Math.random() < 0.7) {
      particles.push({
        x: geyserX + (Math.random()-0.5)*16,
        y: spawnY,
        vx: (Math.random()-0.5)*50,
        vy: dir * (280 + Math.random()*160),
        life: 0.55, age: 0,
        color: bonusType === 'honey' ? (Math.random() < 0.5 ? '#dff5ff' : '#bfe9ff') : (Math.random() < 0.5 ? '#ffffff' : '#dfeeff')
      });
    }
    for (const p of particles) {
      p.age += dt; p.x += p.vx * dt; p.y += p.vy * dt;
      if (p.smoke) p.vx += Math.sin((p.age + p.seed) * 3.5) * 26 * dt;
      else if (p.pollen) p.vy += 40 * dt;
      else p.vy += 500 * dt;
    }
    particles = particles.filter(p => p.age < p.life);
    if (bonusExitTimer >= BONUS_EXIT_DURATION) {
      finishBonusExit(bonusExitReason);
    }
    return;
  }

  bonusT -= dt;
  if (bonusT <= 0) { beginBonusExit('timeout'); return; }

  if (jumpQueued) {
    bee.vy = HOP_IMPULSE;
    jumpQueued = false;
    flapT = 0;
    flapBoost = 0.35;
  }
  bee.vy += GRAVITY * dt;
  bee.vy = Math.max(MAX_UP_SPEED, Math.min(MAX_DOWN_SPEED, bee.vy));
  bee.y += bee.vy * dt;
  bee.y = Math.max(BONUS_CEIL_Y + bee.r, Math.min(BONUS_WATER_RATIO * H - bee.r, bee.y));
  if (flapBoost > 0) { flapBoost -= dt; flapT += dt * 22; } else { flapT += dt * 7; }

  if (bonusType === 'honey') {
    // honey drops
    for (const d of bonusDrops) {
      if (d.taken) continue;
      const screenX = d.worldX - scrollX;
      const dy = (d.y + Math.sin(waveT*2.5 + d.bob)*5) - bee.y;
      const dist = Math.sqrt((screenX - bee.x)**2 + dy*dy);
      if (dist < d.r + bee.r) {
        d.taken = true;
        score += HONEY_VALUE;
        bonusHoneyCount += 1;
        honeyBank += 1;
        scoreVal.textContent = score;
        for (let i = 0; i < 10; i++) {
          particles.push({
            x: bee.x, y: bee.y,
            vx: (Math.random()-0.5)*220, vy: (Math.random()-0.5)*220 - 40,
            life: 0.5, age: 0, color: '#ffcf3d'
          });
        }
      }
    }
    bonusDrops = bonusDrops.filter(d => (d.worldX - scrollX) > -40);
    nextBonusDropAt -= dt;
    if (nextBonusDropAt <= 0) {
      spawnHoneyDrop(scrollX + W + 60);
      nextBonusDropAt = 0.5 + Math.random() * 0.4;
    }

    // shop: spend banked honey on a shield or an extra life
    for (const item of bonusShop) {
      if (item.taken) continue;
      const screenX = item.worldX - scrollX;
      const dy = item.y - bee.y;
      const dist = Math.sqrt((screenX - bee.x)**2 + dy*dy);
      if (dist < item.r + bee.r) {
        if (honeyBank >= item.cost) {
          item.taken = true;
          honeyBank -= item.cost;
          if (item.kind === 'shield') {
            if (!mpShieldCancelsSabotage()) {
              shieldActive = true;
              shieldTimeLeft = SHIELD_DURATION;
              shieldBadge.classList.remove('hidden');
            }
          } else {
            lives += 1;
            updateLivesHUD();
          }
          for (let i = 0; i < 18; i++) {
            particles.push({
              x: bee.x, y: bee.y,
              vx: (Math.random()-0.5)*260, vy: (Math.random()-0.5)*260 - 40,
              life: 0.6, age: 0,
              color: item.kind === 'shield' ? '#ffd452' : '#ff6b6b'
            });
          }
        } else {
          // not enough honey yet - gentle bump, no purchase
          bee.vy = -120;
        }
      }
    }

    // rising bubbles from the water floor - touching one triggers the geyser exit early
    for (const b of bonusBubbles) {
      b.y -= b.speed * dt;
    }
    for (const b of bonusBubbles) {
      const screenX = (b.worldX - scrollX) + Math.sin(waveT * 1.4 + b.driftPhase) * 18;
      const dist = Math.sqrt((screenX - bee.x)**2 + (b.y - bee.y)**2);
      if (dist < b.r + bee.r - 4) { beginBonusExit('bubble'); return; }
    }
    bonusBubbles = bonusBubbles.filter(b => b.y > BONUS_CEIL_Y - 40);
    nextBonusBubbleAt -= dt;
    if (nextBonusBubbleAt <= 0) {
      spawnBubble(scrollX + bee.x + (Math.random()-0.5) * W * 0.8);
      nextBonusBubbleAt = 1.0 + Math.random() * 0.8;
    }

    // submarine patrolling right at the water's surface - sticking to it costs a life
    if (bonusSubmarine) {
      const sx = W/2 + Math.sin(waveT * 0.5 + bonusSubmarine.phase) * (W * 0.34);
      const sy = H * BONUS_WATER_RATIO - 8;
      bonusSubmarine.curX = sx;
      bonusSubmarine.curY = sy;
      bonusSubmarine.dir = Math.cos(waveT * 0.5 + bonusSubmarine.phase) >= 0 ? 1 : -1;
      if (hitInvulnT <= 0) {
        const dist = Math.sqrt((sx - bee.x)**2 + (sy - bee.y)**2);
        if (dist < 66 + bee.r) {
          if (!loseLifeOrDie('submarine')) { triggerDeath('submarine'); return; }
        }
      }
    }
  } else {
    // cloud kingdom: collection round, with a plane flying through
    for (const s of bonusStars) {
      if (s.taken) continue;
      const screenX = s.worldX - scrollX;
      const dy = (s.y + Math.sin(waveT*2.5 + s.bob)*5) - bee.y;
      const dist = Math.sqrt((screenX - bee.x)**2 + dy*dy);
      if (dist < s.r + bee.r) {
        s.taken = true;
        score += STAR_VALUE;
        bonusHoneyCount += 1;
        scoreVal.textContent = score;
        for (let i = 0; i < 10; i++) {
          particles.push({
            x: bee.x, y: bee.y,
            vx: (Math.random()-0.5)*220, vy: (Math.random()-0.5)*220 - 40,
            life: 0.5, age: 0, color: '#fff6c8'
          });
        }
      }
    }
    bonusStars = bonusStars.filter(s => (s.worldX - scrollX) > -40);
    nextBonusStarAt -= dt;
    if (nextBonusStarAt <= 0) {
      spawnStar(scrollX + W + 60);
      nextBonusStarAt = 0.5 + Math.random() * 0.4;
    }

    // plane flying across the sky - sticking to it costs a life
    if (bonusPlane) {
      bonusPlane.x -= 130 * dt;
      if (bonusPlane.x < -60) {
        bonusPlane.x = W + 60;
        bonusPlane.y = BONUS_CEIL_Y + 40 + Math.random() * (H*BONUS_WATER_RATIO - BONUS_CEIL_Y - 80);
      }
      if (hitInvulnT <= 0) {
        const dist = Math.sqrt((bonusPlane.x - bee.x)**2 + (bonusPlane.y - bee.y)**2);
        if (dist < 62 + bee.r) {
          if (!loseLifeOrDie('plane')) { triggerDeath('plane'); return; }
        }
      }
    }
  }

  // particles
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

// ---------- Draw ----------
function drawBackground() {
  // sky gradient - shifts darker/greyer as storm approaches
  const baseTop = '#6ec6ff';
  const stormTop = '#4a5468';
  const baseMid = '#a7dcff';
  const stormMid = '#6b7690';
  const baseBottom = '#d9f2ff';
  const stormBottom = '#8b95a8';
  const g = ctx.createLinearGradient(0, 0, 0, H);
  const skyTop = lerpColorStr(baseTop, stormTop, weather.skyDarkness);
  const skyMid = lerpColorStr(baseMid, stormMid, weather.skyDarkness);
  const skyBottom = lerpColorStr(baseBottom, stormBottom, weather.skyDarkness);
  g.addColorStop(0, skyTop);
  g.addColorStop(0.55, skyMid);
  g.addColorStop(1, skyBottom);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // sun - fades out before the storm, fades back in after
  if (weather.sunAlpha > 0.01) {
    ctx.globalAlpha = weather.sunAlpha;
    ctx.beginPath();
    ctx.fillStyle = '#ffe58a';
    ctx.arc(W - 60, 60, 34, 0, Math.PI*2);
    ctx.fill();
    ctx.globalAlpha = weather.sunAlpha * 0.5;
    ctx.beginPath();
    ctx.fillStyle = '#ffe58a';
    ctx.arc(W - 60, 60, 46, 0, Math.PI*2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  // clouds - darker and denser-looking during storm
  for (const c of clouds) {
    const sx = c.worldX - scrollX * c.speedMul;
    drawCloud(sx, c.y, c.scale, weather.cloudDarkness);
  }
}

function drawTerrain() {
  const step = 10;
  const waterTopBase = '#3aa7d6';
  const waterBotBase = '#1d6fa5';
  const meadowTopBase = '#8fce5c';
  const meadowBotBase = '#3d7a2c';
  ctx.save();
  const tops = [];
  for (let x = 0; x <= W; x += step) {
    const worldX = x + scrollX;
    const blend = terrainBlendAt(worldX); // 0 = water, 1 = meadow
    const waterWave = Math.sin(worldX*0.03 + waveT*3) * 4;
    const meadowSway = Math.sin(worldX*0.02 + waveT*1.2) * 1.2;
    const topY = waterY - blend * MEADOW_RAISE + waterWave * (1 - blend) + meadowSway * blend;
    tops.push(topY);
    const topColor = lerpColorStr(waterTopBase, meadowTopBase, blend);
    const bottomColor = lerpColorStr(waterBotBase, meadowBotBase, blend);
    const grad = ctx.createLinearGradient(0, topY, 0, H);
    grad.addColorStop(0, topColor);
    grad.addColorStop(1, bottomColor);
    ctx.fillStyle = grad;
    ctx.fillRect(x, topY, step + 1, H - topY);
  }
  // highlight line along the surface
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  tops.forEach((y, i) => {
    const x = i * step;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.stroke();
  ctx.restore();

  // decorative grass tufts + collectible ground flowers on meadow segments
  for (const seg of terrain) {
    if (seg.type !== 'meadow' || !seg.tufts) continue;
    if (seg.end - scrollX < -20 || seg.start - scrollX > W + 20) continue;
    for (const tuft of seg.tufts) {
      if (tuft.kind === 'flower' && tuft.taken) continue;
      const wx = seg.start + tuft.offset;
      const sx = wx - scrollX;
      if (sx < -10 || sx > W + 10) continue;
      const groundY = surfaceYAt(wx);
      const sway = Math.sin(waveT * 1.5 + tuft.offset) * 3;
      ctx.save();
      ctx.translate(sx, groundY);
      ctx.strokeStyle = '#2f5e22';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(sway * 0.5, -tuft.h * 0.6, sway, -tuft.h);
      ctx.stroke();
      if (tuft.kind === 'flower') {
        ctx.beginPath();
        ctx.fillStyle = tuft.hue;
        ctx.arc(sway, -tuft.h, 4.5, 0, Math.PI*2);
        ctx.fill();
        ctx.beginPath();
        ctx.fillStyle = '#fff6c8';
        ctx.arc(sway, -tuft.h, 1.8, 0, Math.PI*2);
        ctx.fill();
      }
      ctx.restore();
    }
  }
}

function drawJumpingFish(x, y, progress) {
  const tilt = (progress - 0.5) * -1.4; // nose up going up, nose down coming down
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(tilt);

  // splash droplets feel: simple body
  ctx.beginPath();
  ctx.fillStyle = '#7fb3d5';
  ctx.ellipse(0, 0, 15, 7, 0, 0, Math.PI*2);
  ctx.fill();
  ctx.beginPath();
  ctx.fillStyle = '#a9d0e8';
  ctx.ellipse(-2, -2, 10, 4, 0, 0, Math.PI*2);
  ctx.fill();

  // tail
  ctx.beginPath();
  ctx.fillStyle = '#5f97bd';
  ctx.moveTo(-14, 0);
  ctx.lineTo(-24, -8);
  ctx.lineTo(-22, 0);
  ctx.lineTo(-24, 8);
  ctx.closePath();
  ctx.fill();

  // dorsal fin
  ctx.beginPath();
  ctx.fillStyle = '#5f97bd';
  ctx.moveTo(0, -6);
  ctx.lineTo(4, -14);
  ctx.lineTo(7, -5);
  ctx.closePath();
  ctx.fill();

  // eye
  ctx.beginPath();
  ctx.fillStyle = '#1a1a1a';
  ctx.arc(11, -2, 1.6, 0, Math.PI*2);
  ctx.fill();

  ctx.restore();
}

function drawFlower(x, y, r, color, special, gold) {
  ctx.save();
  ctx.translate(x, y);
  if (special || gold) {
    const pulse = 4 + Math.sin(waveT * 5) * 2;
    ctx.beginPath();
    ctx.strokeStyle = gold ? 'rgba(255,255,255,0.75)' : 'rgba(255,212,82,0.6)';
    ctx.lineWidth = 2;
    ctx.arc(0, 0, r + pulse, 0, Math.PI*2);
    ctx.stroke();
  }
  // stem hint (short) - skip since flying
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI*2/6) * i;
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.ellipse(Math.cos(a)*r*0.7, Math.sin(a)*r*0.7, r*0.55, r*0.32, a, 0, Math.PI*2);
    ctx.fill();
    if (special) {
      ctx.strokeStyle = 'rgba(255,212,82,0.5)';
      ctx.lineWidth = 1;
      ctx.stroke();
    } else if (gold) {
      ctx.strokeStyle = 'rgba(255,255,255,0.6)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }
  ctx.beginPath();
  ctx.fillStyle = special ? '#ffd452' : '#fff6c8';
  ctx.arc(0, 0, r*0.5, 0, Math.PI*2);
  ctx.fill();
  ctx.restore();
}

function trailYAt(targetT) {
  if (trailHistory.length === 0) return bee.y;
  for (let i = trailHistory.length - 1; i >= 0; i--) {
    if (trailHistory[i].t <= targetT) return trailHistory[i].y;
  }
  return trailHistory[0].y;
}

function drawButterfly(x, y, flapPhase, hue) {
  if (worldTheme === 'night') { drawFirefly(x, y, flapPhase); return; } // noću su leptirići krijesnice (world2.js)
  const flap = Math.sin(flapPhase) * 0.9;
  ctx.save();
  ctx.translate(x, y);
  // wings
  for (const side of [-1, 1]) {
    ctx.save();
    ctx.scale(side, 1);
    ctx.rotate(-0.15 - flap * 0.35);
    ctx.beginPath();
    ctx.fillStyle = hue;
    ctx.ellipse(7, -5, 7, 5.5, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.beginPath();
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.ellipse(7, -5, 3, 2, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.beginPath();
    ctx.fillStyle = hue;
    ctx.ellipse(6, 4, 5, 4, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
  }
  // body
  ctx.beginPath();
  ctx.fillStyle = '#3a2b1a';
  ctx.ellipse(0, 0, 2, 6, 0, 0, Math.PI*2);
  ctx.fill();
  // antennae
  ctx.strokeStyle = '#3a2b1a';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-1, -5); ctx.lineTo(-3, -9);
  ctx.moveTo(1, -5); ctx.lineTo(3, -9);
  ctx.stroke();
  ctx.restore();
}

function drawBird(x, y, flapPhase, dir, pal) {
  const flap = Math.sin(flapPhase) * 0.9;
  const bodyCol = pal ? pal.body : '#4a4458';
  const headCol = pal ? pal.head : '#5c5570';
  const wingCol1 = pal ? pal.wing1 : '#312c40';
  const wingCol2 = pal ? pal.wing2 : '#3d3855';
  const tailCol = pal ? pal.tail : '#3d3850';
  ctx.save();
  ctx.translate(x, y);
  if (dir < 0) ctx.scale(-1, 1);

  // body
  ctx.beginPath();
  ctx.fillStyle = bodyCol;
  ctx.ellipse(0, 0, 12, 7, 0, 0, Math.PI*2);
  ctx.fill();

  // head
  ctx.beginPath();
  ctx.fillStyle = headCol;
  ctx.arc(10, -3, 5.5, 0, Math.PI*2);
  ctx.fill();

  // beak
  ctx.beginPath();
  ctx.fillStyle = '#f5a623';
  ctx.moveTo(15, -3);
  ctx.lineTo(21, -1.5);
  ctx.lineTo(15, 0.5);
  ctx.closePath();
  ctx.fill();

  // eye
  ctx.beginPath();
  ctx.fillStyle = '#fff';
  ctx.arc(11.5, -4.5, 1.6, 0, Math.PI*2);
  ctx.fill();
  ctx.beginPath();
  ctx.fillStyle = '#1a1a1a';
  ctx.arc(12, -4.7, 0.9, 0, Math.PI*2);
  ctx.fill();

  // tail
  ctx.beginPath();
  ctx.fillStyle = tailCol;
  ctx.moveTo(-11, 0);
  ctx.lineTo(-22, -6);
  ctx.lineTo(-20, 1);
  ctx.lineTo(-22, 7);
  ctx.closePath();
  ctx.fill();

  // wings (flapping)
  ctx.save();
  ctx.translate(-2, -1);
  ctx.rotate(flap * 0.6);
  ctx.beginPath();
  ctx.fillStyle = wingCol1;
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-6, -16 - flap*4, -2, -20 - flap*6);
  ctx.quadraticCurveTo(6, -10, 4, 2);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.translate(-2, 1);
  ctx.rotate(-flap * 0.5);
  ctx.beginPath();
  ctx.fillStyle = wingCol2;
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-6, 14 + flap*3, -1, 17 + flap*5);
  ctx.quadraticCurveTo(6, 8, 4, -1);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  ctx.restore();
}

function drawWasp(x, y, flapPhase, vDir) {
  const flap = Math.sin(flapPhase) * 1.1;
  // point the wasp slightly up or down depending on which way it's currently darting
  const tilt = Math.max(-0.5, Math.min(0.5, vDir * 0.02));
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(tilt);
  ctx.scale(-1, 1); // faces left, toward the bee

  // wings (fast, blurry flutter)
  ctx.save();
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.strokeStyle = 'rgba(150,140,60,0.5)';
  ctx.lineWidth = 0.8;
  for (const side of [-1, 1]) {
    ctx.save();
    ctx.translate(0, side * 3);
    ctx.rotate(side * (0.5 + flap * 0.7));
    ctx.beginPath();
    ctx.ellipse(0, 0, 10, 4.5, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();

  // thin waist + abdomen (striped)
  ctx.beginPath();
  ctx.fillStyle = '#2b2118';
  ctx.ellipse(-8, 0, 7, 5, 0, 0, Math.PI*2);
  ctx.fill();
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(-8, 0, 7, 5, 0, 0, Math.PI*2);
  ctx.clip();
  ctx.fillStyle = '#ffcf3d';
  ctx.fillRect(-13, -6, 2.5, 12);
  ctx.fillRect(-9, -6, 2.5, 12);
  ctx.fillRect(-5, -6, 2.5, 12);
  ctx.restore();

  // thorax (narrow connector)
  ctx.beginPath();
  ctx.fillStyle = '#3a2b1a';
  ctx.ellipse(-1, 0, 3, 2.6, 0, 0, Math.PI*2);
  ctx.fill();

  // head + angry brow
  ctx.beginPath();
  ctx.fillStyle = '#2b2118';
  ctx.arc(6, 0, 4.6, 0, Math.PI*2);
  ctx.fill();
  ctx.beginPath();
  ctx.fillStyle = '#fff';
  ctx.arc(7.3, -1.2, 1.3, 0, Math.PI*2);
  ctx.fill();
  ctx.beginPath();
  ctx.fillStyle = '#c0202a';
  ctx.arc(7.7, -1.6, 0.6, 0, Math.PI*2);
  ctx.fill();
  ctx.strokeStyle = '#2b2118';
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(5.5, -3.4); ctx.lineTo(8.5, -4.2);
  ctx.stroke();

  // stinger
  ctx.beginPath();
  ctx.fillStyle = '#1a1310';
  ctx.moveTo(-15, 0);
  ctx.lineTo(-20, -1.5);
  ctx.lineTo(-20, 1.5);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function drawTree(tree) {
  const sx = tree.curScreenX;
  const branchBottomY = tree.curBranchBottomY;
  const sway = Math.sin(waveT * 0.9 + tree.swayPhase) * 4;

  ctx.save();

  // trunk/branch coming down from the very top of the screen
  ctx.strokeStyle = '#5c4326';
  ctx.lineWidth = 11;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(sx, -10);
  ctx.quadraticCurveTo(sx + sway * 0.4, branchBottomY * 0.5, sx + sway, branchBottomY);
  ctx.stroke();
  ctx.strokeStyle = '#4a3620';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(sx, -10);
  ctx.quadraticCurveTo(sx + sway * 0.4, branchBottomY * 0.5, sx + sway, branchBottomY);
  ctx.stroke();

  // a couple of small side twigs for detail
  for (const t of [0.35, 0.65]) {
    const ty = branchBottomY * t;
    const tx = sx + sway * t;
    ctx.strokeStyle = '#5c4326';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(tx + (t < 0.5 ? -16 : 16), ty - 10);
    ctx.stroke();
  }

  // leafy canopy clustered around the bottom tip of the branch
  const leafX = sx + sway;
  const leafColors = ['#4f8f38', '#5fa844', '#3d7a2c'];
  const leafOffsets = [
    [0, 0, 22], [-20, 6, 16], [20, 6, 16], [-10, -12, 15], [12, -13, 15], [0, 14, 14]
  ];
  for (let i = 0; i < leafOffsets.length; i++) {
    const [ox, oy, r] = leafOffsets[i];
    ctx.beginPath();
    ctx.fillStyle = leafColors[i % leafColors.length];
    ctx.arc(leafX + ox, branchBottomY + oy, r, 0, Math.PI*2);
    ctx.fill();
  }

  ctx.restore();
}

function drawFrog(frog) {
  const sx = frog.curScreenX;
  const groundY = frog.curGroundY;
  const blinkPhase = Math.sin(waveT * 1.3 + frog.blink);
  const isBlinking = blinkPhase > 0.96;
  const squish = frog.state === 'striking' ? 1 - Math.sin(frog.strikeT * Math.PI) * 0.15 : 1;

  // tongue drawn first so the head sits on top of its base
  if (frog.state === 'striking' && frog.curTipX !== undefined) {
    ctx.save();
    ctx.strokeStyle = '#e8607a';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(frog.curMouthX, frog.curMouthY);
    ctx.lineTo(frog.curTipX, frog.curTipY);
    ctx.stroke();
    ctx.beginPath();
    ctx.fillStyle = '#e8607a';
    ctx.arc(frog.curTipX, frog.curTipY, 5, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
  }

  ctx.save();
  ctx.translate(sx, groundY);
  ctx.scale(1, squish);

  // back legs (tucked, sitting)
  ctx.fillStyle = '#4a9b4e';
  ctx.beginPath();
  ctx.ellipse(-16, -2, 9, 6, 0.5, 0, Math.PI*2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(16, -2, 9, 6, -0.5, 0, Math.PI*2);
  ctx.fill();

  // body
  const bodyGrad = ctx.createRadialGradient(-4, -14, 3, 0, -10, 22);
  bodyGrad.addColorStop(0, '#7ed67f');
  bodyGrad.addColorStop(1, '#4a9b4e');
  ctx.beginPath();
  ctx.fillStyle = bodyGrad;
  ctx.ellipse(0, -10, 19, 15, 0, 0, Math.PI*2);
  ctx.fill();

  // belly
  ctx.beginPath();
  ctx.fillStyle = '#eaf7d8';
  ctx.ellipse(0, -3, 12, 8, 0, 0, Math.PI*2);
  ctx.fill();

  // eyes (bulging on top)
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.fillStyle = '#4a9b4e';
    ctx.arc(side * 9, -24, 6.5, 0, Math.PI*2);
    ctx.fill();
    if (isBlinking) {
      ctx.strokeStyle = '#2b6b2e';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(side*9 - 3, -24);
      ctx.lineTo(side*9 + 3, -24);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.fillStyle = '#1a1a1a';
      ctx.arc(side * 9, -24, 3, 0, Math.PI*2);
      ctx.fill();
      ctx.beginPath();
      ctx.fillStyle = '#fff';
      ctx.arc(side * 9 + 1, -25.2, 1, 0, Math.PI*2);
      ctx.fill();
    }
  }

  // mouth line
  ctx.strokeStyle = '#2b6b2e';
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.arc(2, -13, 10, 0.15, Math.PI - 0.3);
  ctx.stroke();

  ctx.restore();
}

function drawFisherman(screenX, t, hookX, hookY) {
  const rodAngle = Math.sin(t) * 0.5 + 0.15; // swings as the hook rises/falls
  const iceFisher = worldTheme === 'glacier'; // na ledenjaku sjedi na stolčiću uz rupu u ledu, bez čamca
  const bob = iceFisher ? 0 : Math.sin(waveT * 1.6) * 3; // gentle boat bobbing on water
  const feetY = waterY + bob;
  const scale = 1.5;
  ctx.save();
  ctx.translate(screenX, feetY);
  ctx.scale(scale, scale);

  if (iceFisher) {
    // rupa u ledu
    ctx.fillStyle = '#1d4f6e';
    ctx.beginPath(); ctx.ellipse(8, 3, 12, 3.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    // stolčić
    ctx.strokeStyle = '#6b4423';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(-4, -8); ctx.moveTo(2, 0); ctx.lineTo(-4, -8); ctx.stroke();
    ctx.fillStyle = '#8a5a34';
    ctx.fillRect(-12, -9, 16, 3);
  } else {
  // boat hull (wide, floating on the water line)
  ctx.beginPath();
  ctx.moveTo(-34, 2);
  ctx.quadraticCurveTo(-30, 16, 0, 17);
  ctx.quadraticCurveTo(30, 16, 34, 2);
  ctx.quadraticCurveTo(20, -3, 0, -3);
  ctx.quadraticCurveTo(-20, -3, -34, 2);
  ctx.closePath();
  ctx.fillStyle = '#8a5a34';
  ctx.fill();
  ctx.strokeStyle = '#5c3a1f';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // hull inner rim / plank line
  ctx.beginPath();
  ctx.moveTo(-30, 0);
  ctx.quadraticCurveTo(0, 5, 30, 0);
  ctx.strokeStyle = '#6b4423';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // little bow tip highlight
  ctx.beginPath();
  ctx.fillStyle = '#a06e3f';
  ctx.ellipse(28, -1, 6, 3, -0.3, 0, Math.PI*2);
  ctx.fill();
  }

  // seated body (sitting low, inside boat) - u pustinji ribar na oazi sa slamnatim šeširom, na ledenjaku u crvenoj jakni
  const desertFisher = worldTheme === 'desert';
  ctx.fillStyle = desertFisher ? '#e2d3b0' : iceFisher ? '#c0392b' : '#3a6ea5';
  ctx.beginPath();
  ctx.ellipse(-2, -18, 12, 15, 0, 0, Math.PI*2);
  ctx.fill();

  // head
  ctx.beginPath();
  ctx.fillStyle = '#e8b98a';
  ctx.arc(-2, -36, 8.5, 0, Math.PI*2);
  ctx.fill();

  // hat
  ctx.beginPath();
  ctx.fillStyle = desertFisher ? '#d9b35f' : iceFisher ? '#f4f4f4' : '#274b63';
  ctx.ellipse(-2, -41, desertFisher ? 15 : 10.5, 4.5, 0, 0, Math.PI*2);
  ctx.fill();
  ctx.beginPath();
  ctx.fillStyle = desertFisher ? '#e6c577' : iceFisher ? '#8a6a4a' : '#2e5876';
  ctx.arc(-2, -44, 5.5, Math.PI, 0);
  ctx.fill();

  // arm + rod
  const shoulderX = 8, shoulderY = -22;
  ctx.strokeStyle = '#e8b98a';
  ctx.lineWidth = 4.5;
  ctx.lineCap = 'round';
  const handX = shoulderX + Math.cos(rodAngle) * 13;
  const handY = shoulderY - Math.sin(rodAngle) * 13 - 4;
  ctx.beginPath();
  ctx.moveTo(shoulderX, shoulderY);
  ctx.lineTo(handX, handY);
  ctx.stroke();

  // rod
  const rodLen = 44;
  const rodTipX = handX + Math.sin(rodAngle) * rodLen;
  const rodTipY = handY - Math.cos(rodAngle) * rodLen - 6;
  ctx.strokeStyle = '#5a3d21';
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(handX, handY);
  ctx.lineTo(rodTipX, rodTipY);
  ctx.stroke();

  ctx.restore();

  // fishing line + hook (in screen space, scaled manually since boat group was scaled)
  const rodTipScreenX = screenX + rodTipX * scale;
  const rodTipScreenY = feetY + rodTipY * scale;
  ctx.strokeStyle = 'rgba(255,255,255,0.75)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(rodTipScreenX, rodTipScreenY);
  ctx.lineTo(hookX, hookY);
  ctx.stroke();

  // hook
  ctx.beginPath();
  ctx.strokeStyle = '#c0c0c0';
  ctx.lineWidth = 2.5;
  ctx.arc(hookX, hookY + 5, 5, Math.PI*0.15, Math.PI*1.6);
  ctx.stroke();
  ctx.beginPath();
  ctx.fillStyle = '#d94848';
  ctx.arc(hookX, hookY, 3.5, 0, Math.PI*2);
  ctx.fill();
}

// entities drawn behind the terrain
function drawWorldBackLayer() {
  for (const f of flowers) {
    if (f.taken) continue;
    const sx = f.worldX - scrollX;
    if (sx < -30 || sx > W + 30) continue;
    const sy = f.y + Math.sin(waveT*2 + f.bob) * 6;
    drawFlower(sx, sy, f.r, f.hue, f.special, f.gold);
  }

  for (const bf of butterflies) {
    if (bf.taken) continue;
    const sx = bf.worldX - scrollX;
    if (sx < -30 || sx > W + 30) continue;
    const sy = bf.y + Math.sin(waveT*2 + bf.bob) * 6;
    drawButterfly(sx, sy, waveT * 9 + bf.flapPhase, bf.hue);
  }

  for (const b of birds) {
    const sx = b.worldX - scrollX;
    if (sx < -40 || sx > W + 40) continue;
    const sy = b.baseY + Math.sin(waveT * b.freq + b.phase) * b.ampl;
    if (worldTheme === 'night') drawOwl(sx, sy, waveT * 10 + b.flapPhase, b.dir);
    else if (worldTheme === 'desert') drawVulture(sx, sy, waveT * 10 + b.flapPhase, b.dir);
    else if (worldTheme === 'glacier') drawSnowyOwl(sx, sy, waveT * 10 + b.flapPhase, b.dir);
    else if (worldTheme === 'volcano') drawPhoenix(sx, sy, waveT * 10 + b.flapPhase, b.dir);
    else drawBird(sx, sy, waveT * 10 + b.flapPhase, b.dir);
  }

  for (const w of wasps) {
    const sx = w.curScreenX;
    if (sx === undefined || sx < -30 || sx > W + 30) continue;
    if (worldTheme === 'night') drawBat(sx, w.curScreenY, waveT * 26 + w.flapPhase, w.vyDir || 0);
    else if (worldTheme === 'desert') drawFalcon(sx, w.curScreenY, waveT * 20 + w.flapPhase, w.vyDir || 0);
    else if (worldTheme === 'glacier') drawFalcon(sx, w.curScreenY, waveT * 20 + w.flapPhase, w.vyDir || 0, ICE_FALCON_PAL);
    else if (worldTheme === 'volcano') drawEmber(sx, w.curScreenY, waveT * 20 + w.flapPhase, w.vyDir || 0);
    else drawWasp(sx, w.curScreenY, waveT * 26 + w.flapPhase, w.vyDir || 0);
  }
}

// entities drawn in front of the terrain
function drawWorldFrontLayer() {
  for (const seg of terrain) {
    if (seg.type !== 'water' || !seg.whirlpool) continue;
    const sx = seg.start + seg.whirlpool.offset - scrollX;
    if (sx < -50 || sx > W + 50) continue;
    drawWhirlpool(sx, waterY, seg.whirlpool.spinPhase);
  }

  for (const cp of cloudPortals) {
    if (cp.taken) continue;
    const sx = cp.worldX - scrollX;
    if (sx < -60 || sx > W + 60) continue;
    drawCloudPortal(sx, cp.y, cp.phase);
  }

  drawBigFlowerInWorld();
  drawWorldPortalInWorld();

  const desert = worldTheme === 'desert';
  const glacier = worldTheme === 'glacier';
  const volcano = worldTheme === 'volcano';
  for (const seg of terrain) {
    if (seg.type !== 'meadow' || !seg.tree) continue;
    const sx = seg.tree.curScreenX;
    if (sx === undefined || sx < -TREE_HALF_WIDTH - 60 || sx > W + TREE_HALF_WIDTH + 60) continue;
    if (desert) drawSnakeArch(seg.tree); else if (glacier) drawIcicleBranch(seg.tree); else if (volcano) drawScorchedBranch(seg.tree); else drawTree(seg.tree);
  }

  for (const seg of terrain) {
    if (seg.type !== 'meadow' || !seg.frog) continue;
    const sx = seg.frog.curScreenX;
    if (sx === undefined || sx < -60 || sx > W + 60) continue;
    if (desert) drawScorpion(seg.frog); else if (glacier) drawYeti(seg.frog); else if (volcano) drawSalamander(seg.frog); else drawFrog(seg.frog);
  }

  for (const fm of fishermen) {
    const sx = fm.worldX - scrollX;
    if (sx < -60 || sx > W + 60) continue;
    if (volcano) drawLavaDemon(sx, fm.curT || 0, fm.curHookX ?? sx, fm.curHookY ?? waterY);
    else drawFisherman(sx, fm.curT || 0, fm.curHookX ?? sx, fm.curHookY ?? waterY);
  }

  for (const seg of terrain) {
    if (seg.type !== 'water' || !seg.fishSpots) continue;
    for (const spot of seg.fishSpots) {
      if (spot.airborne) {
        if (volcano) drawLavaBlob(spot.curX, spot.curY, spot.progress);
        else drawJumpingFish(spot.curX, spot.curY, spot.progress);
      }
    }
  }
}

function drawBonusEnterEffect() {
  const progress = Math.min(1, bonusEnterTimer / BONUS_ENTER_DURATION);
  const col = bonusEnterType === 'honey' ? '80,190,220' : '200,170,255';

  // swirling rings pulling the bee toward the portal
  ctx.save();
  ctx.translate(bee.x, bee.y);
  for (let ring = 0; ring < 3; ring++) {
    const rr = 20 + ring * 14 - progress * 14;
    const rot = waveT * (3 - ring * 0.5);
    ctx.beginPath();
    ctx.strokeStyle = `rgba(${col},${0.6 - ring * 0.15})`;
    ctx.lineWidth = 3;
    ctx.arc(0, 0, Math.max(2, rr), rot, rot + Math.PI * 1.3);
    ctx.stroke();
  }
  ctx.restore();

  // darkening vignette that builds as the pull intensifies
  ctx.save();
  const vg = ctx.createRadialGradient(bee.x, bee.y, 30, bee.x, bee.y, W * 0.75);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, `rgba(10,10,25,${progress * 0.45})`);
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();

  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fff8e7';
  ctx.font = 'bold 18px Trebuchet MS, sans-serif';
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 6;
  ctx.fillText(
    bonusEnterType === 'honey' ? '🌊 Vrtlog te uvlači!' : '☁️ Vjetar te nosi u nebo!',
    W/2, 40
  );
  ctx.restore();
}

function drawWhirlpool(x, y, spinPhase) {
  ctx.save();
  ctx.translate(x, y);
  for (let ring = 0; ring < 3; ring++) {
    const rr = 12 + ring * 9;
    const rot = waveT * (2.2 - ring * 0.4) + spinPhase + ring * 1.3;
    ctx.beginPath();
    ctx.strokeStyle = `rgba(80,190,220,${0.55 - ring * 0.12})`;
    ctx.lineWidth = 3;
    ctx.arc(0, 0, rr, rot, rot + Math.PI * 1.4);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.fillStyle = 'rgba(20,70,100,0.5)';
  ctx.arc(0, 0, 7, 0, Math.PI*2);
  ctx.fill();
  ctx.restore();
}

function drawStrangeCloudPuff(x, y, scale, hue) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = hue;
  ctx.beginPath();
  ctx.arc(0, 0, 18, 0, Math.PI*2);
  ctx.arc(18, -5, 14, 0, Math.PI*2);
  ctx.arc(-16, -3, 13, 0, Math.PI*2);
  ctx.arc(6, 7, 15, 0, Math.PI*2);
  ctx.arc(-8, 8, 13, 0, Math.PI*2);
  ctx.fill();
  ctx.restore();
}

function drawCloudPortal(x, y, phase) {
  const pulse = Math.sin(waveT * 3 + phase) * 0.08;
  ctx.save();
  // two odd, shimmering clouds paired together
  drawStrangeCloudPuff(x - 18, y + 6, 0.75 + pulse, 'rgba(230,200,255,0.92)');
  drawStrangeCloudPuff(x + 20, y - 10, 0.95 + pulse, 'rgba(200,230,255,0.95)');
  // sparkle shimmer
  for (let i = 0; i < 4; i++) {
    const a = waveT * 2 + phase + i * (Math.PI / 2);
    const sx = x + Math.cos(a) * 34;
    const sy = y + Math.sin(a) * 20;
    ctx.beginPath();
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.arc(sx, sy, 2.4, 0, Math.PI*2);
    ctx.fill();
  }
  ctx.restore();
}

function drawHoneyDrop(x, y) {
  ctx.save();
  ctx.translate(x, y);
  const g = ctx.createRadialGradient(-3, -4, 1, 0, 2, 13);
  g.addColorStop(0, '#ffe9a3');
  g.addColorStop(1, '#e8971f');
  ctx.beginPath();
  ctx.fillStyle = g;
  ctx.moveTo(0, -11);
  ctx.quadraticCurveTo(9, 2, 0, 11);
  ctx.quadraticCurveTo(-9, 2, 0, -11);
  ctx.fill();
  ctx.beginPath();
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.ellipse(-2.5, -2, 2, 3.5, -0.3, 0, Math.PI*2);
  ctx.fill();
  ctx.restore();
}

function drawShopItem(x, y, kind, cost, affordable) {
  const pulse = Math.sin(waveT * 4) * 2;
  ctx.save();
  ctx.translate(x, y);
  ctx.globalAlpha = affordable ? 1 : 0.45;

  // glowing ring
  ctx.beginPath();
  ctx.strokeStyle = affordable ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 2;
  ctx.arc(0, 0, 18 + pulse, 0, Math.PI*2);
  ctx.stroke();

  if (kind === 'shield') {
    ctx.beginPath();
    ctx.fillStyle = affordable ? '#ffd452' : '#8a7a4a';
    ctx.moveTo(0, -13);
    ctx.quadraticCurveTo(11, -9, 11, 0);
    ctx.quadraticCurveTo(11, 9, 0, 14);
    ctx.quadraticCurveTo(-11, 9, -11, 0);
    ctx.quadraticCurveTo(-11, -9, 0, -13);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 1;
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.fillStyle = affordable ? '#ff6b6b' : '#7a4a4a';
    ctx.moveTo(0, 12);
    ctx.bezierCurveTo(-14, 0, -12, -12, 0, -5);
    ctx.bezierCurveTo(12, -12, 14, 0, 0, 12);
    ctx.fill();
  }

  ctx.globalAlpha = 1;
  ctx.fillStyle = '#fff8e7';
  ctx.font = 'bold 12px Trebuchet MS, sans-serif';
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 3;
  ctx.fillText('🍯' + cost, 0, 30);
  ctx.restore();
}

function drawSubmarine(x, y, dir) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(dir * 2.6, 2.6);

  // periscope
  ctx.strokeStyle = '#4a4a3a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(2, -14);
  ctx.lineTo(2, -24);
  ctx.lineTo(9, -24);
  ctx.stroke();

  // conning tower
  ctx.beginPath();
  ctx.fillStyle = '#5a6b4a';
  ctx.moveTo(-6, -14);
  ctx.lineTo(9, -14);
  ctx.lineTo(6, -2);
  ctx.lineTo(-4, -2);
  ctx.closePath();
  ctx.fill();

  // hull
  const g = ctx.createLinearGradient(0, -12, 0, 12);
  g.addColorStop(0, '#7a8f5f');
  g.addColorStop(1, '#4a5a3a');
  ctx.beginPath();
  ctx.fillStyle = g;
  ctx.moveTo(-32, 0);
  ctx.quadraticCurveTo(-34, -12, -12, -13);
  ctx.lineTo(24, -11);
  ctx.quadraticCurveTo(36, -6, 34, 0);
  ctx.quadraticCurveTo(36, 6, 24, 10);
  ctx.lineTo(-14, 12);
  ctx.quadraticCurveTo(-34, 11, -32, 0);
  ctx.fill();

  // portholes
  ctx.fillStyle = 'rgba(200,230,255,0.85)';
  for (const px of [-18, -4, 10]) {
    ctx.beginPath();
    ctx.arc(px, 0, 3.2, 0, Math.PI*2);
    ctx.fill();
  }

  // propeller
  ctx.strokeStyle = '#3a3a2a';
  ctx.lineWidth = 2;
  const spin = waveT * 14;
  ctx.beginPath();
  ctx.moveTo(-32, 0);
  ctx.lineTo(-32 - Math.cos(spin)*8, -Math.sin(spin)*8);
  ctx.moveTo(-32, 0);
  ctx.lineTo(-32 + Math.cos(spin)*8, Math.sin(spin)*8);
  ctx.stroke();

  // small bubble trail
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  for (let i = 0; i < 3; i++) {
    const bx = -40 - i*8 + Math.sin(waveT*3+i)*3;
    ctx.beginPath();
    ctx.arc(bx, -4 - i*3, 2, 0, Math.PI*2);
    ctx.fill();
  }

  ctx.restore();
}

function drawPlane(x, y, dir) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(dir * 2.4, 2.4);

  // contrail
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-24, 2);
  ctx.lineTo(-55, 2);
  ctx.stroke();

  // fuselage
  ctx.beginPath();
  ctx.fillStyle = '#e8ecef';
  ctx.moveTo(24, 0);
  ctx.quadraticCurveTo(18, -6, -18, -5);
  ctx.quadraticCurveTo(-26, -2, -26, 0);
  ctx.quadraticCurveTo(-26, 2, -18, 5);
  ctx.quadraticCurveTo(18, 6, 24, 0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.15)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // cockpit windows stripe
  ctx.beginPath();
  ctx.fillStyle = '#3a6ea5';
  ctx.fillRect(-14, -3, 18, 2.4);

  // wings
  ctx.beginPath();
  ctx.fillStyle = '#c8ced4';
  ctx.moveTo(0, -3);
  ctx.lineTo(-6, -18);
  ctx.lineTo(2, -18);
  ctx.lineTo(10, -3);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(0, 3);
  ctx.lineTo(-6, 18);
  ctx.lineTo(2, 18);
  ctx.lineTo(10, 3);
  ctx.closePath();
  ctx.fill();

  // tail fin
  ctx.beginPath();
  ctx.fillStyle = '#c8ced4';
  ctx.moveTo(-20, -3);
  ctx.lineTo(-28, -13);
  ctx.lineTo(-22, -3);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function drawBubble(x, y, r) {
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  ctx.strokeStyle = 'rgba(255,255,255,0.7)';
  ctx.lineWidth = 2;
  ctx.arc(0, 0, r, 0, Math.PI*2);
  ctx.stroke();
  ctx.beginPath();
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.arc(0, 0, r, 0, Math.PI*2);
  ctx.fill();
  ctx.beginPath();
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.ellipse(-r*0.35, -r*0.35, r*0.25, r*0.15, -0.5, 0, Math.PI*2);
  ctx.fill();
  ctx.restore();
}

function drawBonusFlash() {
  ctx.save();
  ctx.fillStyle = `rgba(255,220,120,${bonusFlashAlpha * 0.7})`;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

function drawCaveCeiling() {
  // jagged rock ceiling with hanging stalactites, faint parallax with scroll
  const offsetX = (scrollX * 0.5) % 70;
  ctx.save();
  ctx.fillStyle = '#3a2a1c';
  ctx.beginPath();
  ctx.moveTo(-10, 0);
  ctx.lineTo(-10, BONUS_CEIL_Y * 0.45);
  for (let x = -70 + offsetX; x <= W + 70; x += 70) {
    const dip = 14 + Math.sin(x * 0.03 + 1.7) * 6;
    const spike = BONUS_CEIL_Y * 0.45 + dip;
    ctx.lineTo(x + 35, spike);
    ctx.lineTo(x + 70, BONUS_CEIL_Y * 0.45);
  }
  ctx.lineTo(W + 10, BONUS_CEIL_Y * 0.45);
  ctx.lineTo(W + 10, 0);
  ctx.closePath();
  ctx.fill();

  // solid rock band above the jagged edge
  ctx.fillStyle = '#2c2015';
  ctx.fillRect(0, 0, W, BONUS_CEIL_Y * 0.35);

  // a few rock texture cracks
  ctx.strokeStyle = 'rgba(0,0,0,0.25)';
  ctx.lineWidth = 1.5;
  for (let x = -40 + offsetX; x <= W + 40; x += 70) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + 10, BONUS_CEIL_Y * 0.3);
    ctx.stroke();
  }
  ctx.restore();
}

function drawCaveWater() {
  const topY = H * BONUS_WATER_RATIO;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(0, topY);
  const step = 20;
  for (let x = 0; x <= W; x += step) {
    const y = topY + Math.sin((x + scrollX*30)*0.03 + waveT*2.5) * 4;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(W, H);
  ctx.lineTo(0, H);
  ctx.closePath();
  const wg = ctx.createLinearGradient(0, topY, 0, H);
  wg.addColorStop(0, '#3aa7c6');
  wg.addColorStop(1, '#155a75');
  ctx.fillStyle = wg;
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.4)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = 0; x <= W; x += step) {
    const y = topY + Math.sin((x + scrollX*30)*0.03 + waveT*2.5) * 4;
    if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.restore();
}

function drawGeyser(x) {
  const topY = 4;
  const botY = H * BONUS_WATER_RATIO + 6;
  const halfW = 20;
  ctx.save();
  const grad = ctx.createLinearGradient(0, topY, 0, botY);
  grad.addColorStop(0, 'rgba(255,255,255,0.95)');
  grad.addColorStop(0.45, 'rgba(190,238,255,0.9)');
  grad.addColorStop(1, 'rgba(50,160,200,0.95)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  let first = true;
  for (let y = botY; y >= topY; y -= 8) {
    const wob = Math.sin(y * 0.14 + waveT * 11) * 7;
    const px = x - halfW + wob;
    if (first) { ctx.moveTo(px, y); first = false; } else { ctx.lineTo(px, y); }
  }
  for (let y = topY; y <= botY; y += 8) {
    const wob = Math.sin(y * 0.14 + waveT * 11 + 1.4) * 7;
    ctx.lineTo(x + halfW + wob, y);
  }
  ctx.closePath();
  ctx.fill();

  // foam ring where it bursts out of the water
  ctx.beginPath();
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.ellipse(x, botY, halfW + 10, 8, 0, 0, Math.PI*2);
  ctx.fill();
  ctx.restore();
}

function drawBonusScene() {
  if (bonusType === 'cloud') drawCloudKingdomScene();
  else drawHoneyCaveScene();
}

function drawHoneyCaveScene() {
  // warm honeycomb cave background
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#7a4a12');
  g.addColorStop(0.5, '#a5691c');
  g.addColorStop(1, '#5c380d');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // hexagon honeycomb pattern, gently parallax-scrolling
  ctx.save();
  ctx.strokeStyle = 'rgba(255,210,110,0.25)';
  ctx.lineWidth = 2;
  const hexR = 30;
  const offsetX = (scrollX * 0.4) % (hexR * 1.8);
  for (let row = -1; row < H / (hexR*1.6) + 1; row++) {
    for (let col = -1; col < W / (hexR*1.8) + 2; col++) {
      const cx = col * hexR * 1.8 - offsetX + (row % 2 ? hexR * 0.9 : 0);
      const cy = row * hexR * 1.55;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = Math.PI / 3 * i;
        const px = cx + Math.cos(a) * hexR * 0.5;
        const py = cy + Math.sin(a) * hexR * 0.5;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
    }
  }
  ctx.restore();

  drawCaveWater();

  if (bonusExiting) drawGeyser(geyserX);

  for (const d of bonusDrops) {
    if (d.taken) continue;
    const sx = d.worldX - scrollX;
    if (sx < -30 || sx > W + 30) continue;
    const sy = d.y + Math.sin(waveT*2.5 + d.bob) * 5;
    drawHoneyDrop(sx, sy);
  }

  for (const item of bonusShop) {
    if (item.taken) continue;
    const sx = item.worldX - scrollX;
    if (sx < -40 || sx > W + 40) continue;
    drawShopItem(sx, item.y, item.kind, item.cost, honeyBank >= item.cost);
  }

  for (const b of bonusBubbles) {
    const sx = (b.worldX - scrollX) + Math.sin(waveT * 1.4 + b.driftPhase) * 18;
    if (sx < -40 || sx > W + 40) continue;
    drawBubble(sx, b.y, b.r);
  }

  if (bonusSubmarine && bonusSubmarine.curX !== undefined) {
    drawSubmarine(bonusSubmarine.curX, bonusSubmarine.curY, bonusSubmarine.dir || 1);
  }

  drawParticles();
  drawBee();
  drawCaveCeiling();

  // bonus HUD: countdown + honey bank
  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fff6c8';
  ctx.font = 'bold 20px Trebuchet MS, sans-serif';
  ctx.shadowColor = 'rgba(0,0,0,0.4)';
  ctx.shadowBlur = 6;
  if (bonusExiting) {
    ctx.fillText('🌊 Vodoskok te nosi gore!', W/2, 40);
  } else {
    ctx.fillText('🍯 Medena špilja! ' + Math.max(0, bonusT).toFixed(1) + 's', W/2, 40);
  }
  ctx.font = 'bold 15px Trebuchet MS, sans-serif';
  ctx.fillText('Med: ' + honeyBank + ' (🛡️ ' + SHOP_SHIELD_COST + ' · ❤️ ' + SHOP_LIFE_COST + ')', W/2, 62);
  ctx.restore();

  if (bonusFlashAlpha > 0) drawBonusFlash();
}

function drawSoftCloudBand(topY, botY, drift, tint) {
  ctx.save();
  ctx.fillStyle = tint;
  for (let x = -60 + drift; x <= W + 60; x += 55) {
    const puffY = (topY + botY) / 2 + Math.sin(x * 0.02 + waveT * 0.6) * 6;
    ctx.beginPath();
    ctx.arc(x, puffY, 34, 0, Math.PI*2);
    ctx.fill();
  }
  ctx.fillRect(0, Math.min(topY, botY) - 40, W, Math.abs(botY - topY) + 40);
  ctx.restore();
}

function drawCloudCeiling() {
  const offsetX = (scrollX * 0.5) % 55;
  drawSoftCloudBand(-30, BONUS_CEIL_Y * 0.5, offsetX, '#ffffff');
  ctx.save();
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  for (let x = -30 + offsetX; x <= W + 30; x += 55) {
    ctx.beginPath();
    ctx.arc(x + 20, BONUS_CEIL_Y * 0.55, 20, 0, Math.PI*2);
    ctx.fill();
  }
  ctx.restore();
}

function drawCloudFloor() {
  const topY = H * BONUS_WATER_RATIO;
  const offsetX = (scrollX * 0.45) % 55;
  drawSoftCloudBand(topY, H + 30, offsetX + 24, '#f3f7ff');
  ctx.save();
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  for (let x = -30 + offsetX; x <= W + 30; x += 55) {
    ctx.beginPath();
    ctx.arc(x, topY, 22, 0, Math.PI*2);
    ctx.fill();
  }
  ctx.restore();
}

function drawStar(x, y, spin) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(spin);
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const a1 = (Math.PI * 2 / 5) * i - Math.PI / 2;
    const a2 = a1 + Math.PI / 5;
    const ox = Math.cos(a1) * 10, oy = Math.sin(a1) * 10;
    const ix = Math.cos(a2) * 4.2, iy = Math.sin(a2) * 4.2;
    if (i === 0) ctx.moveTo(ox, oy); else ctx.lineTo(ox, oy);
    ctx.lineTo(ix, iy);
  }
  ctx.closePath();
  const g = ctx.createRadialGradient(0, 0, 1, 0, 0, 10);
  g.addColorStop(0, '#fffbe0');
  g.addColorStop(1, '#ffd452');
  ctx.fillStyle = g;
  ctx.fill();
  ctx.restore();
}

function drawDowndraft(x) {
  const topY = H * BONUS_WATER_RATIO - 6;
  const botY = 4;
  const halfW = 20;
  ctx.save();
  const grad = ctx.createLinearGradient(0, botY, 0, topY);
  grad.addColorStop(0, 'rgba(255,255,255,0.95)');
  grad.addColorStop(0.55, 'rgba(220,240,255,0.85)');
  grad.addColorStop(1, 'rgba(180,210,240,0.7)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  let first = true;
  for (let y = botY; y <= topY; y += 8) {
    const wob = Math.sin(y * 0.14 + waveT * 11) * 7;
    const px = x - halfW + wob;
    if (first) { ctx.moveTo(px, y); first = false; } else { ctx.lineTo(px, y); }
  }
  for (let y = topY; y >= botY; y -= 8) {
    const wob = Math.sin(y * 0.14 + waveT * 11 + 1.4) * 7;
    ctx.lineTo(x + halfW + wob, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.ellipse(x, topY, halfW + 10, 8, 0, 0, Math.PI*2);
  ctx.fill();
  ctx.restore();
}

function drawCloudKingdomScene() {
  // pale sky background, lighter than the normal daytime sky for a dreamy feel
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#a9d8ff');
  g.addColorStop(0.5, '#cfe9ff');
  g.addColorStop(1, '#eaf5ff');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  drawCloudFloor();

  if (bonusExiting) drawDowndraft(geyserX);

  for (const s of bonusStars) {
    if (s.taken) continue;
    const sx = s.worldX - scrollX;
    if (sx < -30 || sx > W + 30) continue;
    const sy = s.y + Math.sin(waveT*2.5 + s.bob) * 5;
    drawStar(sx, sy, waveT * 2 + s.spin);
  }

  if (bonusPlane) {
    drawPlane(bonusPlane.x, bonusPlane.y, bonusPlane.dir || -1);
  }

  drawParticles();
  drawBee();
  drawCloudCeiling();

  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = '#3a5a7a';
  ctx.font = 'bold 20px Trebuchet MS, sans-serif';
  ctx.shadowColor = 'rgba(255,255,255,0.6)';
  ctx.shadowBlur = 6;
  if (bonusExiting) {
    ctx.fillText('☁️ Vjetar te vuče dolje!', W/2, 40);
  } else {
    ctx.fillText('☁️ Oblačno kraljevstvo! ' + Math.max(0, bonusT).toFixed(1) + 's', W/2, 40);
  }
  ctx.restore();

  if (bonusFlashAlpha > 0) drawBonusFlash();
}
