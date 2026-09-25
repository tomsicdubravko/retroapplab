// ===== Pčelica - SVIJET 2 (noćni svijet): veliki cvijet na kraju svijeta 1, spavanje i pad noći, noćna paleta i noćna stvorenja (sova, šišmiš) =====
// ---------- Kraj svijeta 1: pčelica sama sleti na veliki cvijet, zaspi, padne noć, probudi se u noćnom svijetu ----------
let worldTheme = 'day'; // 'day' | 'night' | 'desert' (world3.js)
let world2TriggerX = 0; // world px gdje raste veliki cvijet, jednom po igri
let bigFlower = null;   // { worldX, headY }
let sleepSeq = null;    // { phase: 'land' | 'sleep' | 'wake', t, ... } dok traje animacija spavanja
let nightFade = 0;      // 0..1 tamni zastor preko ekrana dok pada noć
const BIG_FLOWER_TRIGGER_DIST = 320; // koliko prije cvijeta igra preuzme kontrolu
const SLEEP_LAND_DURATION = 1.6;
const SLEEP_DURATION = 2.8;
const SLEEP_NIGHT_SWITCH_AT = 1.3;   // trenutak u spavanju kad svijet postane noćni (ekran je tada najtamniji)
const SLEEP_WAKE_DURATION = 0.5;
const WAKE_GRACE = 1.2;              // kratka zaštita nakon buđenja

function bigFlowerSeatY() {
  return bigFlower.headY - 20;
}

function updateBigFlowerSpawn() {
  if (worldTheme === 'day' && !bigFlower && scrollX + W * 2 > world2TriggerX) {
    bigFlower = { worldX: world2TriggerX, headY: H * 0.46 };
    clearHazardsNearBigFlower();
  }
}

// makne grane i žabe oko velikog cvijeta, da pčelica ne spava u krošnji ni ne pogine odmah po buđenju
function clearHazardsNearBigFlower() {
  for (const seg of terrain) {
    if (seg.tree && Math.abs(seg.start + seg.tree.offset - bigFlower.worldX) < 420) seg.tree = null;
    if (seg.frog && Math.abs(seg.start + seg.frog.offset - bigFlower.worldX) < 320) seg.frog = null;
  }
}

// vraća true ako je upravo počelo slijetanje na veliki cvijet
function checkBigFlower() {
  if (worldTheme !== 'day' || !bigFlower || sleepSeq) return false;
  if (bigFlower.worldX - (scrollX + bee.x) > BIG_FLOWER_TRIGGER_DIST) return false;
  startSleepSequence('land');
  return true;
}

// 'land' = normalno slijetanje; 'sleep' = pčelica se odmah stvori na cvijetu (oživljavanje u multiplayeru)
function startSleepSequence(phase) {
  holding = false;
  jumpQueued = false;
  stuckBird = null;
  // ptice i ose odlete da ne vise zamrznute u zraku za vrijeme spavanja
  for (const b of birds) {
    for (let i = 0; i < 6; i++) particles.push({ x: b.worldX - scrollX, y: b.curScreenY || b.baseY, vx: (Math.random()-0.5)*160, vy: (Math.random()-0.5)*160, life: 0.5, age: 0, color: '#fff8e7' });
  }
  birds = [];
  wasps = [];
  if (typeof mpOnSleepStart === 'function') mpOnSleepStart();
  sleepSeq = { phase: phase, t: 0, fromScroll: scrollX, toScroll: bigFlower.worldX - bee.x, fromY: bee.y };
  bee.vy = 0;
  if (phase === 'sleep') {
    scrollX = sleepSeq.toScroll;
    bee.y = bigFlowerSeatY();
  }
}

function easeInOut(k) { return k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; }

// poziva se iz core.js update() umjesto normalne igre dok traje sleepSeq
function updateSleepSequence(dt) {
  const s = sleepSeq;
  s.t += dt;
  waveT += dt;
  bee.vy = 0;
  jumpQueued = false;

  if (s.phase === 'land') {
    const k = Math.min(1, s.t / SLEEP_LAND_DURATION);
    scrollX = s.fromScroll + (s.toScroll - s.fromScroll) * (1 - Math.pow(1 - k, 3));
    bee.y = s.fromY + (bigFlowerSeatY() - s.fromY) * easeInOut(k);
    flapT += dt * 14 * (1 - k * 0.7);
    if (k >= 1) { s.phase = 'sleep'; s.t = 0; }
  } else if (s.phase === 'sleep') {
    bee.y = bigFlowerSeatY() + Math.sin(s.t * 2.2) * 1.5; // lagano disanje
    if (s.t < SLEEP_NIGHT_SWITCH_AT) {
      nightFade = s.t / SLEEP_NIGHT_SWITCH_AT;
    } else {
      if (worldTheme !== 'night') worldTheme = 'night';
      nightFade = Math.max(0, 1 - (s.t - SLEEP_NIGHT_SWITCH_AT) / (SLEEP_DURATION - SLEEP_NIGHT_SWITCH_AT));
    }
    // Zzz
    if (Math.floor((s.t - dt) / 0.7) !== Math.floor(s.t / 0.7)) {
      particles.push({ x: bee.x + 10, y: bee.y - 18, vx: 18, vy: -34, life: 1.4, age: 0, zzz: true, color: '#fff8e7' });
    }
    if (s.t >= SLEEP_DURATION) { s.phase = 'wake'; s.t = 0; nightFade = 0; }
  } else { // wake
    const k = Math.min(1, s.t / SLEEP_WAKE_DURATION);
    flapT += dt * 22;
    bee.y = bigFlowerSeatY() - 30 * easeInOut(k);
    if (k >= 1) {
      sleepSeq = null;
      bee.vy = HOP_IMPULSE * 0.6;
      hitInvulnT = Math.max(hitInvulnT, WAKE_GRACE);
    }
  }

  updateScriptedWorld(dt, !!sleepSeq);
}

// zajedničko za animacije prijelaza (spavanje na cvijetu, portal u pustinju): teren, udaljenost, čestice;
// svijet se i dalje osvježava (pozicije drveća, žaba, riba...), ali pčelici ništa ne može nauditi
function updateScriptedWorld(dt, updateEntities) {
  ensureTerrainAhead();
  distVal.textContent = Math.floor(scrollX / METER_SCALE);
  if (updateEntities) updateWorldEntities(dt, true);
  for (const p of particles) {
    p.age += dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    if (!p.zzz && !p.pollen && !p.smoke) p.vy += 500 * dt;
  }
  particles = particles.filter(p => p.age < p.life);
}

function drawBigFlowerInWorld() {
  if (!bigFlower) return;
  const sx = bigFlower.worldX - scrollX;
  if (sx < -120 || sx > W + 120) return;
  drawBigFlower(sx, bigFlower.headY, surfaceYAt(bigFlower.worldX));
}

function drawBigFlower(x, headY, groundY) {
  const night = worldTheme === 'night';
  const sway = sleepSeq ? 0 : Math.sin(waveT * 1.1) * 3;
  ctx.save();
  // stabljika
  ctx.strokeStyle = night ? '#2f5e22' : '#4f9d32';
  ctx.lineWidth = 10;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x, groundY + 4);
  ctx.quadraticCurveTo(x - 18, (groundY + headY) / 2, x + sway, headY + 10);
  ctx.stroke();
  // listovi
  ctx.fillStyle = night ? '#2a4a1e' : '#5fb83d';
  const leafY = groundY - (groundY - headY) * 0.35;
  ctx.beginPath(); ctx.ellipse(x - 26, leafY, 24, 9, -0.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(x + 22, leafY - 30, 22, 8, 0.5, 0, Math.PI * 2); ctx.fill();
  // latice
  ctx.translate(x + sway, headY);
  for (let i = 0; i < 12; i++) {
    ctx.save();
    ctx.rotate(i * Math.PI / 6 + waveT * 0.05);
    ctx.fillStyle = i % 2 === 0 ? (night ? '#b86a8f' : '#ff8fb8') : (night ? '#a35a7e' : '#ff6f9f');
    ctx.beginPath();
    ctx.ellipse(0, -36, 15, 30, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  // sredina
  ctx.fillStyle = night ? '#c9a23a' : '#ffd452';
  ctx.beginPath(); ctx.arc(0, 0, 24, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = night ? '#a8842a' : '#f5a623';
  for (let i = 0; i < 14; i++) {
    const a = i * 2.4;
    const r = 5 + (i % 4) * 4;
    ctx.beginPath(); ctx.arc(Math.cos(a) * r, Math.sin(a) * r, 2.2, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

// zatamnjenje dok pada noć + natpis; crta se iznad svega
function drawSleepOverlay() {
  if (!sleepSeq && nightFade <= 0) return;
  ctx.save();
  if (nightFade > 0) {
    ctx.fillStyle = 'rgba(8,8,30,' + (nightFade * 0.85) + ')';
    ctx.fillRect(0, 0, W, H);
  }
  if (sleepSeq && sleepSeq.phase === 'sleep') {
    const a = Math.min(1, sleepSeq.t / 0.5, (SLEEP_DURATION - sleepSeq.t) / 0.5);
    ctx.globalAlpha = Math.max(0, a);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff8e7';
    ctx.font = 'bold 24px Trebuchet MS, sans-serif';
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 8;
    ctx.fillText(sleepSeq.t < SLEEP_NIGHT_SWITCH_AT ? '😴 Laku noć, pčelice...' : '🌙 Pala je noć...', W / 2, H * 0.22);
  }
  ctx.restore();
}

// ---------- Night world drawing (used instead of the world 1 versions once worldTheme === 'night') ----------
function drawNightBackground() {
  // sky gradient - deep indigo base, shifts even darker as a storm approaches
  const baseTop = '#0a0a2a';
  const stormTop = '#000010';
  const baseMid = '#1a1a4a';
  const stormMid = '#05051a';
  const baseBottom = '#2a2a5a';
  const stormBottom = '#0a0a2a';
  const g = ctx.createLinearGradient(0, 0, 0, H);
  const skyTop = lerpColorStr(baseTop, stormTop, weather.skyDarkness);
  const skyMid = lerpColorStr(baseMid, stormMid, weather.skyDarkness);
  const skyBottom = lerpColorStr(baseBottom, stormBottom, weather.skyDarkness);
  g.addColorStop(0, skyTop);
  g.addColorStop(0.55, skyMid);
  g.addColorStop(1, skyBottom);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // twinkling stars - u zoru (pred pustinju) blijede zajedno s mjesecom
  const nightLeft = 1 - Math.min(1, dawnProgress() * 1.6);
  ctx.save();
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  for (let i = 0; i < 45; i++) {
    const sx = (i * 137) % (W + 40) - 20;
    const sy = (i * 53) % (H * 0.55);
    const tw = 0.5 + 0.5 * Math.sin(waveT * 2 + i);
    ctx.globalAlpha = (0.25 + tw * 0.65) * nightLeft;
    ctx.beginPath();
    ctx.arc(sx, sy, 1.3, 0, Math.PI*2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.restore();

  // crescent moon - fades out before the storm, fades back in after
  if (weather.sunAlpha * nightLeft > 0.01) {
    ctx.globalAlpha = weather.sunAlpha * nightLeft;
    ctx.beginPath();
    ctx.fillStyle = '#f2f2ff';
    ctx.arc(W - 60, 60, 34, 0, Math.PI*2);
    ctx.fill();
    // crescent bite taken out of the moon
    ctx.beginPath();
    ctx.fillStyle = skyTop;
    ctx.arc(W - 48, 54, 30, 0, Math.PI*2);
    ctx.fill();
    ctx.globalAlpha = weather.sunAlpha * 0.5 * nightLeft;
    ctx.beginPath();
    ctx.fillStyle = '#f2f2ff';
    ctx.arc(W - 60, 60, 46, 0, Math.PI*2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  // clouds - always a bit dim at night, darker during the storm
  for (const c of clouds) {
    const sx = c.worldX - scrollX * c.speedMul;
    drawCloud(sx, c.y, c.scale, Math.max(weather.cloudDarkness, 0.35));
  }
}

// miješanje dvije hex boje, rezultat je opet hex (lerpColorStr vraća rgb(), koji se ne može dalje miješati)
function mixHex(a, b, t) {
  const A = hexToRgb(a), B = hexToRgb(b);
  return '#' + [0, 1, 2].map(i => Math.round(A[i] + (B[i] - A[i]) * t).toString(16).padStart(2, '0')).join('');
}

function drawNightTerrain() {
  const step = 10;
  const waterTopBase = '#123a52';
  const waterBotBase = '#081c2c';
  // pred kraj noći (zora prije pustinje) zemlja postaje suša i smeđa, a trava niža - world3.js dawnDryness()
  const dry = dawnDryness();
  const meadowTopBase = mixHex('#2a4a1e', '#9a7a48', dry); // mora ostati hex jer ga lerpColorStr ispod opet miješa
  const meadowBotBase = mixHex('#152a0e', '#5a4428', dry);
  const grassScale = 1 - dry * 0.7;
  const grassColor = mixHex('#2f5e22', '#8a6a3a', dry);
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
      ctx.strokeStyle = grassColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      if (tuft.kind === 'flower') ctx.quadraticCurveTo(sway * 0.5, -tuft.h * 0.6, sway, -tuft.h); // cvijet ostaje na istoj visini (skuplja se)
      else ctx.quadraticCurveTo(sway * 0.5 * grassScale, -tuft.h * 0.6 * grassScale, sway * grassScale, -tuft.h * grassScale);
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

// krijesnica - noćna zamjena za leptirića (skuplja se isto i isto leti u redu iza pčelice)
function drawFirefly(x, y, flapPhase) {
  const pulse = 0.55 + 0.45 * Math.sin(flapPhase * 0.35); // svjetlo lagano pulsira
  const flap = Math.sin(flapPhase) * 0.8;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(1.35, 1.35);
  // sjaj
  const g = ctx.createRadialGradient(0, 3, 1, 0, 3, 20);
  g.addColorStop(0, 'rgba(240,255,140,' + (0.6 + 0.35 * pulse) + ')');
  g.addColorStop(0.45, 'rgba(210,255,100,' + (0.3 * pulse + 0.1) + ')');
  g.addColorStop(1, 'rgba(180,255,80,0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(0, 3, 20, 0, Math.PI * 2); ctx.fill();
  // prozirna krilca
  ctx.fillStyle = 'rgba(220,230,255,0.45)';
  for (const side of [-1, 1]) {
    ctx.save();
    ctx.scale(side, 1);
    ctx.rotate(-0.4 - flap * 0.4);
    ctx.beginPath(); ctx.ellipse(5, -3, 5, 2.6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  // tijelo
  ctx.fillStyle = '#2a2a33';
  ctx.beginPath(); ctx.ellipse(0, -2, 2.4, 4, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#c0392b';
  ctx.beginPath(); ctx.arc(0, -6, 2, 0, Math.PI * 2); ctx.fill();
  // svjetleći zadak
  ctx.fillStyle = 'rgba(' + Math.round(200 + 55 * pulse) + ',255,' + Math.round(90 + 60 * pulse) + ',1)';
  ctx.beginPath(); ctx.ellipse(0, 4, 3, 3.6, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// owl - replaces the day bird (same hitbox/movement, see birds in world1.js)
function drawOwl(x, y, flapPhase, dir) {
  const flap = Math.sin(flapPhase) * 0.9;
  const bodyCol = '#7a5c3a';
  const headCol = '#8a6b47';
  const wingCol1 = '#5c4227';
  const wingCol2 = '#6b4d2e';
  const tailCol = '#5c4227';
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

  // ear tufts
  ctx.beginPath();
  ctx.fillStyle = headCol;
  ctx.moveTo(6, -7); ctx.lineTo(7, -12); ctx.lineTo(9, -7);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(12, -7); ctx.lineTo(14, -12); ctx.lineTo(15, -7);
  ctx.closePath();
  ctx.fill();

  // beak
  ctx.beginPath();
  ctx.fillStyle = '#f5a623';
  ctx.moveTo(15, -3);
  ctx.lineTo(21, -1.5);
  ctx.lineTo(15, 0.5);
  ctx.closePath();
  ctx.fill();

  // big round eyes glowing in the dark
  ctx.beginPath();
  ctx.fillStyle = '#ffe58a';
  ctx.arc(10.5, -4, 3.2, 0, Math.PI*2);
  ctx.fill();
  ctx.beginPath();
  ctx.fillStyle = '#1a1a1a';
  ctx.arc(11, -4, 1.6, 0, Math.PI*2);
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

// bat - replaces the day wasp (same hitbox/movement, see wasps in world1.js)
function drawBat(x, y, flapPhase, vDir) {
  const flap = Math.sin(flapPhase) * 1.1;
  // point the bat slightly up or down depending on which way it's currently darting
  const tilt = Math.max(-0.5, Math.min(0.5, vDir * 0.02));
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(tilt);
  ctx.scale(-1, 1); // faces left, toward the bee

  // leathery, angular wing membranes
  ctx.save();
  ctx.fillStyle = 'rgba(40,36,48,0.85)';
  ctx.strokeStyle = 'rgba(20,18,26,0.9)';
  ctx.lineWidth = 0.8;
  for (const side of [-1, 1]) {
    ctx.save();
    ctx.translate(-2, side * 2);
    ctx.rotate(side * (0.4 + flap * 0.5));
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(11, side * 3);
    ctx.lineTo(15, side * 1);
    ctx.lineTo(10, side * 7);
    ctx.lineTo(4, side * 5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();

  // furry grey-black body, no stripes
  ctx.beginPath();
  ctx.fillStyle = '#2e2a33';
  ctx.ellipse(-6, 0, 8, 5.5, 0, 0, Math.PI*2);
  ctx.fill();

  // head with pointed ears
  ctx.beginPath();
  ctx.fillStyle = '#3a3540';
  ctx.arc(4, 0, 4.8, 0, Math.PI*2);
  ctx.fill();
  ctx.beginPath();
  ctx.fillStyle = '#3a3540';
  ctx.moveTo(2, -4); ctx.lineTo(1, -9); ctx.lineTo(4.5, -4.5);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(6, -4); ctx.lineTo(8, -8.5); ctx.lineTo(8, -3.5);
  ctx.closePath();
  ctx.fill();

  // small red glowing eyes
  ctx.beginPath();
  ctx.fillStyle = '#e0304a';
  ctx.arc(5.5, -1, 1, 0, Math.PI*2);
  ctx.fill();

  ctx.restore();
}

