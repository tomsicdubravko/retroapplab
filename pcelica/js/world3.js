// ===== Pčelica - SVIJET 3 (pustinja) + portali između svjetova: portal, mini-splash, pustinjska paleta, pješčana oluja i pustinjska stvorenja =====
// Pustinja koristi istu logiku kao svijet 1 (world1.js), samo drugačije izgleda:
//   voda -> oaza (i dalje opasna), livada -> pijesak/dine, ptica -> lešinar, osa -> pustinjski soko,
//   žaba -> škorpion, grana -> zmija na kamenom luku, ribar -> ribar na oazi, kiša -> pješčana oluja

// ---------- Portali između svjetova (ne mogu se promašiti) -> mini-splash -> novi svijet ----------
// Svaki svijet od 3 nadalje počinje portalom ~1500-1800 m nakon početka prethodnog svijeta.
// Novi svijet se dodaje jednim unosom u WORLD_PORTALS (ključ = svijet u kojem se portal pojavljuje).
let world3TriggerX = 0;  // world px portala noć -> pustinja, jednom po igri
let worldPortal = null;  // { worldX, y, cfg }
let portalSeq = null;    // { phase: 'pull' | 'splash', t, cfg, ... } dok traje ulazak u portal i splash
const PORTAL_TRIGGER_DIST = 300;
const PORTAL_PULL_DURATION = 1.0;
const PORTAL_SPLASH_DURATION = 3.0;   // igra stoji dok traje splash
const PORTAL_SPLASH_FADE = 0.4;
const PORTAL_EXIT_GRACE = 1.5;
const SAND_REVEAL_DURATION = 3.2;     // izlazak iz pješčanog vrtloga u pustinju (umjesto kartice s natpisom)

const WORLD_PORTALS = {
  // noć -> pustinja nema običan portal: zora, suša, vjetar i pješčani vrtlog (vidi "Zora i pješčani vrtlog" niže)
  night: {
    to: 'desert', num: 3,
    triggerX: () => world3TriggerX,
    title: '🏜️ Pustinja',
    splashDuration: SAND_REVEAL_DURATION,
    drawPortal: (x, y) => drawSandTwister(x, y),
    drawOverlay: (s) => drawSandTwisterOverlay(s),
    updateSplash: (s, dt) => updateSandReveal(s, dt),
    onEnter: () => { initSandstorm(); startDesertWind(); }
  },
  desert: {
    to: 'glacier', num: 4,
    triggerX: () => world4TriggerX,
    title: '❄️ Ledenjak', sub: 'Tanak led, snijeg i mećave',
    warn: 'Pazi: sove · ledeni sokolovi · jeti · ledenice',
    splashTop: '222,240,252', splashBot: '118,168,212', warnColor: '#123a5a', shadow: 'rgba(20,60,100,0.45)',
    flash: '235,248,255', ring: 'rgba(170,220,255,0.95)', haze: 'rgba(200,235,255,0.4)', dots: ['#ffffff', '#bfe6ff'],
    drawView: (r) => drawGlacierPortalView(r),
    onEnter: () => initBlizzard()
  },
  glacier: {
    to: 'volcano', num: 5,
    triggerX: () => world5TriggerX,
    title: '🌋 Vulkan', sub: 'Lava, vrele stijene i kiša pepela',
    warn: 'Pazi: feniksi · žeravice · daždevnjaci · demoni lave',
    splashTop: '120,30,20', splashBot: '40,12,10', warnColor: '#ffb347', shadow: 'rgba(0,0,0,0.6)',
    flash: '255,170,90', ring: 'rgba(255,120,40,0.95)', haze: 'rgba(255,140,60,0.4)', dots: ['#ffb347', '#ff5a1f'],
    drawView: () => drawVolcanoPortalView(),
    onEnter: () => initAshfall()
  }
};

// redoslijed svjetova (za multiplayer oživljavanje): 1 dan, 2 noć, 3 pustinja, 4 ledenjak, 5 vulkan
const WORLD_ORDER = ['day', 'night', 'desert', 'glacier', 'volcano'];

function updateWorldPortalSpawn() {
  const cfg = WORLD_PORTALS[worldTheme];
  if (!cfg || worldPortal) return;
  const x = cfg.triggerX();
  if (scrollX + W * 2 > x) {
    worldPortal = { worldX: x, y: H * 0.4, cfg: cfg };
    clearHazardsNear(x);
  }
}

function clearHazardsNear(worldX) {
  for (const seg of terrain) {
    if (seg.tree && Math.abs(seg.start + seg.tree.offset - worldX) < 420) seg.tree = null;
    if (seg.frog && Math.abs(seg.start + seg.frog.offset - worldX) < 320) seg.frog = null;
  }
}

// vraća true ako je portal upravo počeo uvlačiti pčelicu
function checkWorldPortal() {
  if (!worldPortal || portalSeq || worldPortal.cfg !== WORLD_PORTALS[worldTheme]) return false;
  if (worldPortal.worldX - (scrollX + bee.x) > PORTAL_TRIGGER_DIST) return false;
  startPortalSequence('pull');
  return true;
}

// 'pull' = portal uvlači pčelicu; 'splash' = odmah splash (oživljavanje u multiplayeru)
function startPortalSequence(phase) {
  holding = false;
  jumpQueued = false;
  stuckBird = null;
  birds = [];
  wasps = [];
  if (typeof mpOnSleepStart === 'function') mpOnSleepStart();
  portalSeq = { phase: phase, t: 0, cfg: worldPortal.cfg, fromScroll: scrollX, toScroll: worldPortal.worldX - bee.x, fromY: bee.y, spin: 0 };
  bee.vy = 0;
  if (phase === 'splash') enterPortalWorld();
}

function enterPortalWorld() {
  worldTheme = portalSeq.cfg.to;
  scrollX = portalSeq.toScroll;
  delete bee.spin;
  bee.y = H * 0.4;
  bee.vy = 0;
  worldPortal = null;
  particles = [];
  portalSeq.cfg.onEnter();
}

// poziva se iz core.js update() umjesto normalne igre dok traje portalSeq
function updatePortalSequence(dt) {
  const s = portalSeq;
  s.t += dt;
  bee.vy = 0;
  jumpQueued = false;

  if (s.phase === 'pull') {
    waveT += dt;
    const k = Math.min(1, s.t / PORTAL_PULL_DURATION);
    scrollX = s.fromScroll + (s.toScroll - s.fromScroll) * (1 - Math.pow(1 - k, 3));
    bee.y = s.fromY + (worldPortal.y - s.fromY) * easeInOut(k);
    s.spin += dt * (6 + k * 20);
    bee.spin = s.spin;
    flapT += dt * 22;
    if (k >= 1) {
      s.phase = 'splash';
      s.t = 0;
      enterPortalWorld();
    }
    updateScriptedWorld(dt, true);
    return;
  }

  // splash: igra stoji (ništa se ne pomiče), samo se prikazuje natpis (ili vlastita animacija prijelaza)
  if (s.cfg.updateSplash) s.cfg.updateSplash(s, dt);
  if (s.t >= (s.cfg.splashDuration || PORTAL_SPLASH_DURATION)) {
    portalSeq = null;
    delete bee.spin;
    bee.vy = HOP_IMPULSE * 0.6;
    hitInvulnT = Math.max(hitInvulnT, PORTAL_EXIT_GRACE);
  }
}

function drawWorldPortalInWorld() {
  if (!worldPortal) return;
  const sx = worldPortal.worldX - scrollX;
  if (sx < -90 || sx > W + 90) return;
  drawWorldPortal(sx, worldPortal.y, worldPortal.cfg);
}

function drawWorldPortal(x, y, cfg) {
  if (cfg.drawPortal) { cfg.drawPortal(x, y); return; }
  const pulse = Math.sin(waveT * 2.5) * 3;
  ctx.save();
  ctx.translate(x, y);
  // treperavi zrak oko portala
  ctx.strokeStyle = cfg.haze;
  ctx.lineWidth = 2;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    for (let a = 0; a <= Math.PI * 2 + 0.01; a += 0.2) {
      const r = 58 + i * 9 + Math.sin(a * 6 + waveT * 4 + i) * 3;
      const px = Math.cos(a) * r, py = Math.sin(a) * r;
      if (a === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }
  // prsten
  ctx.strokeStyle = cfg.ring;
  ctx.lineWidth = 6;
  ctx.beginPath(); ctx.arc(0, 0, 46 + pulse, 0, Math.PI * 2); ctx.stroke();
  // unutrašnjost: pogled na sljedeći svijet
  ctx.save();
  ctx.beginPath(); ctx.arc(0, 0, 43 + pulse, 0, Math.PI * 2); ctx.clip();
  cfg.drawView(50);
  ctx.restore();
  // čestice koje kruže
  for (let i = 0; i < 8; i++) {
    const a = waveT * 1.8 + i * (Math.PI * 2 / 8);
    ctx.fillStyle = cfg.dots[i % 2];
    ctx.beginPath(); ctx.arc(Math.cos(a) * 52, Math.sin(a) * 52, 2.4, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

// mini-splash preko cijelog ekrana dok igra stoji + bljesak na kraju uvlačenja
function drawPortalOverlay() {
  if (!portalSeq) return;
  const s = portalSeq, cfg = s.cfg;
  if (cfg.drawOverlay) { cfg.drawOverlay(s); return; }
  ctx.save();
  if (s.phase === 'pull') {
    const k = Math.min(1, s.t / PORTAL_PULL_DURATION);
    if (k > 0.6) {
      ctx.fillStyle = 'rgba(' + cfg.flash + ',' + ((k - 0.6) / 0.4) + ')';
      ctx.fillRect(0, 0, W, H);
    }
    ctx.restore();
    return;
  }
  const a = Math.max(0, Math.min(1, (PORTAL_SPLASH_DURATION - s.t) / PORTAL_SPLASH_FADE));
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, 'rgba(' + cfg.splashTop + ',' + (0.96 * a) + ')');
  g.addColorStop(1, 'rgba(' + cfg.splashBot + ',' + (0.96 * a) + ')');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  const textIn = Math.min(1, s.t / 0.5);
  ctx.globalAlpha = a * textIn;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = cfg.shadow;
  ctx.shadowBlur = 10;
  ctx.fillStyle = '#fff8e7';
  ctx.font = 'bold 18px Trebuchet MS, sans-serif';
  ctx.fillText('SVIJET ' + cfg.num, W / 2, H * 0.36);
  ctx.font = 'bold ' + Math.round(42 + (1 - textIn) * 14) + 'px Trebuchet MS, sans-serif';
  ctx.fillText(cfg.title, W / 2, H * 0.43);
  ctx.shadowBlur = 4;
  ctx.font = '16px Trebuchet MS, sans-serif';
  ctx.fillText(cfg.sub, W / 2, H * 0.51);
  ctx.font = 'bold 14px Trebuchet MS, sans-serif';
  ctx.fillStyle = cfg.warnColor;
  ctx.shadowBlur = 0;
  ctx.fillText(cfg.warn, W / 2, H * 0.58);
  ctx.restore();
}

// ---------- Zora i pješčani vrtlog: prijelaz noć -> pustinja ----------
// Zadnjih ~400 m noći: krijesnice rjeđe, nebo blijedi, prva zraka zore, voda nestaje, trava niža i zemlja suša,
// sunce izlazi i postaje ogromno, diže se vjetar i pijesak. Onda pješčani vrtlog uvuče pčelicu, ekran se ispuni
// pijeskom, tišina, pijesak padne i otkrije dine, a pčelica izleti iz vrtloga i protrese se.
const DAWN_LEN = 5600;          // world px prije vrtloga u kojima pada zora (~400 m)
const DRY_LEN = 3600;           // zadnji dio noći bez vode (samo suho tlo)
let dawnGrains = [];
let dawnGustShown = false;

function dawnProgress() {
  if (worldTheme !== 'night' || !world3TriggerX) return 0;
  const start = world3TriggerX - DAWN_LEN;
  return Math.max(0, Math.min(1, (scrollX + W * BEE_X_RATIO - start) / (DAWN_LEN - PORTAL_TRIGGER_DIST)));
}

// world1.js ensureTerrainAhead: pred kraj noći nema vode (i malo nakon ulaska u pustinju)
function forcedTerrainType(segStart) {
  if (world3TriggerX && segStart >= world3TriggerX - DRY_LEN && segStart < world3TriggerX + 1200) return 'meadow';
  return null;
}

// poziva se iz core.js update() dok je noć
function updateDawn(dt) {
  const d = dawnProgress();
  if (d <= 0) { dawnGustShown = false; return; }
  // krijesnice sve rjeđe: dio novih jednostavno ne dođe
  butterflies = butterflies.filter(bf => {
    if (bf.dawnChecked) return true;
    bf.dawnChecked = true;
    return Math.random() > d * 0.95;
  });
  // vjetar i pijesak pred kraj
  const w = Math.max(0, (d - 0.7) / 0.3);
  if (w > 0 && !dawnGrains.length) {
    for (let i = 0; i < 80; i++) dawnGrains.push({ x: Math.random() * W, y: Math.random() * H, len: 6 + Math.random() * 14, speed: 380 + Math.random() * 360 });
  }
  for (const g of dawnGrains) {
    g.x -= g.speed * (0.4 + w) * dt;
    g.y += 25 * dt;
    if (g.x < -30) { g.x = W + 30; g.y = Math.random() * H; }
    if (g.y > H) g.y = 0;
  }
  if (d > 0.85 && !dawnGustShown) {
    dawnGustShown = true;
    triggerShake(4, 0.5);
    showWindText();
  }
}

// nebo u zoru - crta se odmah nakon noćne pozadine, prije terena
function drawDawnSky() {
  const d = dawnProgress();
  if (d <= 0) return;
  ctx.save();
  // nebo blijedi prema toplom svjetlu na obzoru
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, 'rgba(110,140,200,' + (0.55 * d) + ')');
  g.addColorStop(0.6, 'rgba(240,160,120,' + (0.7 * d) + ')');
  g.addColorStop(1, 'rgba(255,200,120,' + (0.85 * d) + ')');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  const sunX = W * 0.78;
  const horizon = H * 0.74;
  // prva zraka zore
  const ray = Math.min(1, d / 0.25) * (1 - Math.max(0, (d - 0.6) / 0.4));
  if (ray > 0) {
    const rg = ctx.createLinearGradient(sunX, horizon, sunX - W * 0.5, 0);
    rg.addColorStop(0, 'rgba(255,230,160,' + (0.55 * ray) + ')');
    rg.addColorStop(1, 'rgba(255,230,160,0)');
    ctx.fillStyle = rg;
    ctx.beginPath();
    ctx.moveTo(sunX - 8, horizon);
    ctx.lineTo(sunX - W * 0.55, 0);
    ctx.lineTo(sunX - W * 0.38, 0);
    ctx.lineTo(sunX + 8, horizon);
    ctx.closePath();
    ctx.fill();
  }
  // sunce izlazi i postaje ogromno i jako
  const rise = Math.max(0, (d - 0.3) / 0.7);
  if (rise > 0) {
    const r = 18 + rise * rise * 130;
    const sy = horizon - rise * H * 0.32;
    const sg = ctx.createRadialGradient(sunX, sy, r * 0.2, sunX, sy, r * 2.2);
    sg.addColorStop(0, 'rgba(255,252,225,' + Math.min(1, rise * 1.5) + ')');
    sg.addColorStop(0.35, 'rgba(255,215,120,' + (0.85 * rise) + ')');
    sg.addColorStop(1, 'rgba(255,170,80,0)');
    ctx.fillStyle = sg;
    ctx.beginPath(); ctx.arc(sunX, sy, r * 2.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,250,230,' + Math.min(1, rise * 1.4) + ')';
    ctx.beginPath(); ctx.arc(sunX, sy, r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

// koliko je tlo suho (0..1) - koristi drawNightTerrain u world2.js
function dawnDryness() {
  return Math.min(1, dawnProgress() * 1.3);
}

// pijesak koji leti preko ekrana pred kraj noći - crta se preko svega
function drawDawnWind() {
  const d = dawnProgress();
  const w = Math.max(0, (d - 0.7) / 0.3);
  if (w <= 0) return;
  ctx.save();
  ctx.fillStyle = 'rgba(214,160,88,' + (0.18 * w) + ')';
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = 'rgba(245,210,150,' + (0.3 + 0.5 * w) + ')';
  ctx.lineWidth = 1.6;
  ctx.lineCap = 'round';
  const n = Math.round(dawnGrains.length * w);
  for (let i = 0; i < n; i++) {
    const g = dawnGrains[i];
    ctx.beginPath(); ctx.moveTo(g.x, g.y); ctx.lineTo(g.x + g.len, g.y - 1.5); ctx.stroke();
  }
  ctx.restore();
}

// "Fuuuš!" iznad pčelice
let windTextT = 0;
function showWindText() { windTextT = 1.2; }
function drawWindText(dt) {
  if (windTextT <= 0 || !bee) return;
  const a = Math.min(1, windTextT / 0.4);
  ctx.save();
  ctx.globalAlpha = a;
  ctx.fillStyle = '#fff8e7';
  ctx.strokeStyle = 'rgba(120,70,20,0.7)';
  ctx.lineWidth = 4;
  ctx.font = 'italic bold 26px Trebuchet MS, sans-serif';
  ctx.textAlign = 'center';
  const x = bee.x + 30 + (1.2 - windTextT) * 60, y = bee.y - 40;
  ctx.strokeText('Fuuuš!', x, y);
  ctx.fillText('Fuuuš!', x, y);
  ctx.restore();
}

// pješčani vrtlog (umjesto portala) - raste kako mu se pčelica približava
function drawSandTwister(x, y) {
  const groundY = surfaceYAt(x + scrollX);
  const topY = y - 120;
  const near = Math.max(0.35, Math.min(1, 1 - (x - bee.x) / (W * 1.2)));
  ctx.save();
  for (let i = 0; i < 16; i++) {
    const t = i / 15; // 0 = dno, 1 = vrh
    const cy = groundY - t * (groundY - topY);
    const rw = (14 + t * t * 90) * near;
    const wob = Math.sin(waveT * 3 + t * 5) * 10 * t;
    const spin = waveT * 9 + i * 0.7;
    ctx.strokeStyle = 'rgba(' + (200 + Math.round(t * 40)) + ',' + (150 + Math.round(t * 50)) + ',90,' + (0.35 + 0.35 * Math.sin(spin) ** 2) + ')';
    ctx.lineWidth = 5 + t * 4;
    ctx.beginPath();
    ctx.ellipse(x + wob, cy, rw, rw * 0.22, 0, spin % (Math.PI * 2), spin % (Math.PI * 2) + Math.PI * 1.3);
    ctx.stroke();
  }
  // pijesak koji kruži oko vrtloga
  for (let i = 0; i < 18; i++) {
    const a = waveT * 5 + i * 1.7;
    const t = (i / 18 + waveT * 0.3) % 1;
    const cy = groundY - t * (groundY - topY);
    const rw = (18 + t * t * 95) * near;
    ctx.fillStyle = i % 2 ? '#f2c572' : '#fff1c8';
    ctx.beginPath(); ctx.arc(x + Math.cos(a) * rw, cy + Math.sin(a) * rw * 0.22, 2.2, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

// uvlačenje: pijesak ispunjava ekran; izlazak: vidi drawSandReveal
function drawSandTwisterOverlay(s) {
  ctx.save();
  if (s.phase === 'pull') {
    const k = Math.min(1, s.t / PORTAL_PULL_DURATION);
    drawDawnWind();
    if (k > 0.35) drawSandFill(Math.min(1, (k - 0.35) / 0.6), 1);
    ctx.restore();
    return;
  }
  drawSandReveal(s);
  ctx.restore();
}

// ekran pun pijeska; cover = 0..1 koliko je prekriven, fall = 0..1 koliko je pijesak već pao (odozgo se otkriva)
function drawSandFill(cover, motion) {
  const top = 0;
  ctx.fillStyle = 'rgba(214,168,98,' + cover + ')';
  ctx.fillRect(0, top, W, H);
  ctx.fillStyle = 'rgba(245,212,150,' + (0.8 * cover) + ')';
  for (let i = 0; i < 120; i++) {
    const x = (i * 97.3 + waveT * 500 * motion * (1 + (i % 5) * 0.3)) % (W + 40) - 20;
    const y = (i * 53.7) % H;
    ctx.fillRect(W - x, y, 10 + (i % 4) * 5, 2);
  }
}

// izlazak iz vrtloga: 0-0.8 s ekran pun pijeska (vrti se), 0.8-1.1 tišina, 1.1-2.2 pijesak pada i otkriva dine,
// 1.5-3.0 natpis PUSTINJA, 2.0-2.8 vrtlog se raspada i pčelica izleti i protrese se
function updateSandReveal(s, dt) {
  const t = s.t;
  if (t < 0.8) waveT += dt; // pijesak se vrti; poslije toga je tišina
  if (t > 1.9) waveT += dt;
  // pčelica se protrese nakon izlaska iz vrtloga
  if (t > 2.1 && t < 2.8) bee.spin = Math.sin((t - 2.1) * 40) * 0.35 * (1 - (t - 2.1) / 0.7);
  else if (t < 2.1) bee.spin = s.spin + t * 18 * Math.max(0, 1 - t / 2.1);
  else delete bee.spin;
  if (t > 2.1) flapT += dt * 20;
}

function drawSandReveal(s) {
  const t = s.t;
  // vrtlog oko pčelice koji se raspada
  if (t > 1.1 && t < 2.8) {
    const fade = t < 2.0 ? 1 : 1 - (t - 2.0) / 0.8;
    ctx.globalAlpha = Math.max(0, fade);
    ctx.save();
    ctx.translate(bee.x, bee.y);
    ctx.rotate(waveT * 8);
    ctx.strokeStyle = 'rgba(240,200,130,0.8)';
    ctx.lineWidth = 4;
    for (let i = 0; i < 3; i++) {
      ctx.rotate(Math.PI * 2 / 3);
      ctx.beginPath();
      for (let k = 0; k <= 18; k++) {
        const a = k * 0.25, r = 12 + k * 2.2 * (1 + (1 - fade));
        if (k === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r * 0.8); else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r * 0.8);
      }
      ctx.stroke();
    }
    ctx.restore();
    ctx.globalAlpha = 1;
  }
  // pijesak: pun ekran, pa pada i otkriva dine odozgo prema dolje
  if (t < 1.1) {
    drawSandFill(1, t < 0.8 ? 1 : 0);
  } else if (t < 2.3) {
    const k = (t - 1.1) / 1.2;          // koliko je pijesak pao
    const edge = H * easeInOut(k) * 1.1; // gornji rub pijeska koji pada
    ctx.save();
    ctx.beginPath(); ctx.rect(0, edge, W, H - edge); ctx.clip();
    drawSandFill(1 - k * 0.7, 0);
    ctx.restore();
    // zrnca koja padaju
    ctx.fillStyle = 'rgba(245,212,150,0.9)';
    for (let i = 0; i < 60; i++) {
      const x = (i * 131.7) % W;
      const y = edge - ((i * 37) % 80) + k * 40;
      ctx.fillRect(x, y, 2, 6);
    }
  }
  // natpis
  if (t > 1.5) {
    const a = Math.min(1, (t - 1.5) / 0.4) * Math.min(1, (SAND_REVEAL_DURATION - t) / 0.5);
    ctx.globalAlpha = Math.max(0, a);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(90,40,0,0.5)';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#fff8e7';
    ctx.font = 'bold 44px Trebuchet MS, sans-serif';
    ctx.fillText('🏜️ PUSTINJA', W / 2, H * 0.2);
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  }
}

// ---------- Pustinjski vjetar: udari vjetra guraju pčelicu (nova mehanika pustinje) ----------
// Prije udara pola sekunde se vide linije vjetra (upozorenje), onda vjetar ~1.3 s gura pčelicu
// bočno (naprijed/nazad) i gore ili dolje. Prvi udar dođe odmah nakon ulaska u pustinju.
const WIND_WARN = 0.5;
const WIND_GUST = 1.3;
const WIND_VERT_ACC = 520;   // px/s^2 gore/dolje dok puše (gravitacija je 1500)
const WIND_X_PUSH = 55;      // koliko px vjetar pomakne pčelicu naprijed/nazad
const WIND_FIRST_AT = 2.2;   // s nakon ulaska u pustinju
const WIND_GAP_MIN = 7, WIND_GAP_RAND = 6;
let windGust = null;         // { t, dirY, dirX, first }
let nextGustT = 0;
let windFirstDone = false;
let windOffsetX = 0;

function startDesertWind() {
  windGust = null;
  nextGustT = WIND_FIRST_AT;
  windFirstDone = false;
  windOffsetX = 0;
}

function gustStrength() {
  if (!windGust) return 0;
  const t = windGust.t - WIND_WARN;
  if (t <= 0) return 0;
  return Math.max(0, Math.min(1, t / 0.25, (WIND_GUST - t) / 0.35));
}

// poziva se iz core.js update() nakon fizike pčelice; canPush = pčelica je slobodna (nije u vrtlogu/zaglavljena)
function updateDesertWind(dt, canPush) {
  const baseX = W * BEE_X_RATIO;
  if (worldTheme === 'desert') {
    if (!windGust) {
      nextGustT -= dt;
      if (nextGustT <= 0) {
        const first = !windFirstDone;
        windGust = { t: 0, dirY: first ? -1 : (Math.random() < 0.5 ? -1 : 1), dirX: Math.random() < 0.5 ? -1 : 1, first: first };
        windFirstDone = true;
      }
    } else {
      windGust.t += dt;
      if (windGust.first && windGust.t >= WIND_WARN && windGust.t - dt < WIND_WARN) {
        showWindText();
        showMpToast('💨 Vjetar te gura!');
        triggerShake(3, 0.3);
      } else if (!windGust.first && windGust.t >= WIND_WARN && windGust.t - dt < WIND_WARN) {
        showWindText();
      }
      if (windGust.t >= WIND_WARN + WIND_GUST) {
        windGust = null;
        nextGustT = WIND_GAP_MIN + Math.random() * WIND_GAP_RAND;
      }
    }
  } else {
    windGust = null;
  }
  const s = gustStrength();
  if (s > 0 && canPush) {
    bee.vy += windGust.dirY * WIND_VERT_ACC * s * dt;
    bee.vy = Math.max(MAX_UP_SPEED, Math.min(MAX_DOWN_SPEED, bee.vy));
  }
  const targetX = s > 0 && canPush ? windGust.dirX * WIND_X_PUSH * s : 0;
  windOffsetX += (targetX - windOffsetX) * Math.min(1, dt * (s > 0 ? 4 : 2));
  if (Math.abs(windOffsetX) < 0.05 && targetX === 0) windOffsetX = 0;
  bee.x = baseX + windOffsetX;
  if (windTextT > 0) windTextT -= dt;
}

// linije vjetra: tanke dok upozorava, guste dok puše
function drawDesertWind() {
  if (worldTheme !== 'desert' || !windGust) return;
  const warn = Math.min(1, windGust.t / WIND_WARN);
  const s = gustStrength();
  const a = 0.25 * warn + 0.45 * s;
  if (a <= 0.01) return;
  ctx.save();
  ctx.strokeStyle = 'rgba(255,245,220,' + a + ')';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  const n = 10 + Math.round(s * 22);
  for (let i = 0; i < n; i++) {
    const y = ((i * 71.3) % (H * 0.9)) + H * 0.04 + windGust.dirY * s * 20;
    const len = 40 + (i % 5) * 18;
    const speed = 700 * (windGust.dirX < 0 ? 1 : -1);
    const x = ((i * 157 + windGust.t * speed) % (W + 200) + W + 200) % (W + 200) - 100;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + len / 2, y - 4, x + len, y);
    ctx.stroke();
  }
  ctx.restore();
}

// ---------- Pješčana oluja (zamjena za kišu; u pustinji nema munja) ----------
let sandGrains = [];

function initSandstorm() {
  sandGrains = [];
  for (let i = 0; i < 110; i++) {
    sandGrains.push({
      x: Math.random() * W,
      y: Math.random() * H,
      len: 6 + Math.random() * 14,
      speed: 420 + Math.random() * 380,
      wobble: Math.random() * Math.PI * 2
    });
  }
}

// poziva se iz core.js updateWeather() kad je pustinja
function updateSandstorm(dt) {
  if (!sandGrains.length) initSandstorm();
  if (weather.rainIntensity <= 0.02) return;
  for (const g of sandGrains) {
    g.x -= g.speed * dt;
    g.y += Math.sin(waveT * 3 + g.wobble) * 40 * dt + 20 * dt;
    if (g.x < -30) { g.x = W + 30; g.y = Math.random() * H; }
    if (g.y > H) g.y = 0;
  }
}

function drawSandstorm() {
  const I = weather.rainIntensity;
  if (I <= 0.02) return;
  ctx.save();
  ctx.fillStyle = 'rgba(214,160,88,' + (0.32 * I) + ')';
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = 'rgba(245,210,150,' + (0.35 + I * 0.4) + ')';
  ctx.lineWidth = 1.6;
  ctx.lineCap = 'round';
  for (const g of sandGrains) {
    ctx.beginPath();
    ctx.moveTo(g.x, g.y);
    ctx.lineTo(g.x + g.len, g.y - 1.5);
    ctx.stroke();
  }
  ctx.restore();
}

// ---------- Poruke na kraju igre ----------
function desertDeathText(reason) {
  return {
    bird: 'Uhvatio te lešinar! 🦅',
    wasp: 'Zgrabio te pustinjski soko! 🦅',
    frog: 'Ubo te škorpion! 🦂',
    tree: 'Ugrizla te zmija! 🐍',
    fisherman: 'Upecala te udica u oazi! 🎣',
    fish: 'Udarila te riba iz oaze! 🐟',
    ground: 'Pala je u pijesak! 🏜️',
    water: 'Pala je u oazu! 💦'
  }[reason] || null;
}

// ---------- Crtanje pustinje ----------
function drawDesertBackground() {
  const k = Math.min(1, weather.skyDarkness / 0.65); // 0 = vedro, 1 = pješčana oluja
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, lerpColorStr('#5fb4e8', '#b98d5a', k));
  g.addColorStop(0.55, lerpColorStr('#a9d8ee', '#c9a06a', k));
  g.addColorStop(1, lerpColorStr('#ffe3a8', '#d8b27c', k));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // veliko pustinjsko sunce
  if (weather.sunAlpha > 0.01) {
    ctx.save();
    ctx.globalAlpha = weather.sunAlpha;
    const sg = ctx.createRadialGradient(W - 70, 70, 10, W - 70, 70, 80);
    sg.addColorStop(0, 'rgba(255,250,220,1)');
    sg.addColorStop(0.45, 'rgba(255,230,140,0.9)');
    sg.addColorStop(1, 'rgba(255,210,120,0)');
    ctx.fillStyle = sg;
    ctx.beginPath(); ctx.arc(W - 70, 70, 80, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  // rijetki, prozirni oblaci
  ctx.save();
  ctx.globalAlpha = 0.45;
  for (const c of clouds) {
    const sx = c.worldX - scrollX * c.speedMul;
    drawCloud(sx, c.y, c.scale * 0.8, 0);
  }
  ctx.restore();

  // daleke dine (paralaksa)
  const layers = [
    { par: 0.12, base: H * 0.6, amp: 34, col: lerpColorStr('#efc587', '#c9a06a', k) },
    { par: 0.28, base: H * 0.68, amp: 24, col: lerpColorStr('#e3ab62', '#bf9158', k) }
  ];
  for (const L of layers) {
    ctx.fillStyle = L.col;
    ctx.beginPath();
    ctx.moveTo(0, H);
    for (let x = 0; x <= W + 20; x += 20) {
      const wx = x + scrollX * L.par;
      const y = L.base + Math.sin(wx * 0.006) * L.amp + Math.sin(wx * 0.017 + 1.3) * L.amp * 0.4;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(W + 20, H);
    ctx.closePath();
    ctx.fill();
  }
}

function drawDesertTerrain() {
  const step = 10;
  const waterTop = '#2fb3a5', waterBot = '#17736b';   // oaza
  const sandTop = '#f2c572', sandBot = '#c98f3e';     // pijesak
  ctx.save();
  const tops = [];
  for (let x = 0; x <= W; x += step) {
    const worldX = x + scrollX;
    const blend = terrainBlendAt(worldX); // 0 = oaza, 1 = pijesak
    const waterWave = Math.sin(worldX*0.03 + waveT*3) * 3;
    const duneRipple = Math.sin(worldX*0.015) * 1.5;
    const topY = waterY - blend * MEADOW_RAISE + waterWave * (1 - blend) + duneRipple * blend;
    tops.push(topY);
    const grad = ctx.createLinearGradient(0, topY, 0, H);
    grad.addColorStop(0, lerpColorStr(waterTop, sandTop, blend));
    grad.addColorStop(1, lerpColorStr(waterBot, sandBot, blend));
    ctx.fillStyle = grad;
    ctx.fillRect(x, topY, step + 1, H - topY);
  }
  ctx.strokeStyle = 'rgba(255,244,210,0.6)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  tops.forEach((y, i) => { if (i === 0) ctx.moveTo(i * step, y); else ctx.lineTo(i * step, y); });
  ctx.stroke();
  ctx.restore();

  // palme uz rub oaze (samo ukras)
  for (const seg of terrain) {
    if (seg.type !== 'water' || seg.end - seg.start < 300) continue;
    for (const wx of [seg.start + 26, seg.end - 26]) {
      const sx = wx - scrollX;
      if (sx < -80 || sx > W + 80) continue;
      drawPalm(sx, surfaceYAt(wx), wx < seg.start + 100 ? -1 : 1);
    }
  }

  // kaktusi, suho grmlje i pustinjsko cvijeće (cvijeće se i dalje skuplja)
  for (const seg of terrain) {
    if (seg.type !== 'meadow' || !seg.tufts) continue;
    if (seg.end - scrollX < -20 || seg.start - scrollX > W + 20) continue;
    for (const tuft of seg.tufts) {
      if (tuft.kind === 'flower' && tuft.taken) continue;
      const wx = seg.start + tuft.offset;
      const sx = wx - scrollX;
      if (sx < -14 || sx > W + 14) continue;
      const groundY = surfaceYAt(wx);
      ctx.save();
      ctx.translate(sx, groundY);
      if (tuft.kind === 'flower') {
        // mali kaktus s cvijetom na vrhu
        ctx.fillStyle = '#5f9e4a';
        ctx.beginPath();
        ctx.ellipse(0, -tuft.h * 0.45, 4, tuft.h * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.fillStyle = tuft.hue;
        ctx.arc(0, -tuft.h, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.fillStyle = '#fff6c8';
        ctx.arc(0, -tuft.h, 1.8, 0, Math.PI * 2);
        ctx.fill();
      } else if (Math.floor(tuft.offset) % 3 === 0) {
        drawSmallCactus(tuft.h);
      } else {
        // suho grmlje
        ctx.strokeStyle = '#9c7a44';
        ctx.lineWidth = 1.6;
        for (const a of [-0.6, -0.2, 0.25, 0.65]) {
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.sin(a) * tuft.h * 0.8, -Math.cos(a) * tuft.h * 0.7);
          ctx.stroke();
        }
      }
      ctx.restore();
    }
  }
}

function drawSmallCactus(h) {
  ctx.fillStyle = '#4f8f3c';
  ctx.strokeStyle = '#3a6e2c';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(0, -h * 0.7, 4.5, h * 0.75, 0, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  ctx.lineWidth = 3.5;
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#4f8f3c';
  ctx.beginPath();
  ctx.moveTo(-3, -h * 0.6); ctx.lineTo(-8, -h * 0.6); ctx.lineTo(-8, -h * 0.95);
  ctx.moveTo(3, -h * 0.8); ctx.lineTo(8, -h * 0.8); ctx.lineTo(8, -h * 1.1);
  ctx.stroke();
}

function drawPalm(x, groundY, lean) {
  const sway = Math.sin(waveT * 1.2 + x * 0.01) * 3;
  const topX = x + lean * 18 + sway, topY = groundY - 78;
  ctx.save();
  ctx.strokeStyle = '#8a6236';
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x, groundY + 2);
  ctx.quadraticCurveTo(x + lean * 2, groundY - 40, topX, topY);
  ctx.stroke();
  ctx.strokeStyle = '#6e4c28';
  ctx.lineWidth = 1.2;
  for (let i = 1; i < 7; i++) {
    const t = i / 7;
    const px = x + (topX - x) * t * t, py = groundY + (topY - groundY) * t;
    ctx.beginPath(); ctx.moveTo(px - 3, py); ctx.lineTo(px + 3, py - 2); ctx.stroke();
  }
  // lišće
  ctx.strokeStyle = '#3f8f3a';
  ctx.lineWidth = 5;
  for (const a of [-2.7, -2.1, -1.4, -0.8, -0.3]) {
    const ex = topX + Math.cos(a) * 34, ey = topY + Math.sin(a) * 18 + 14;
    ctx.beginPath();
    ctx.moveTo(topX, topY);
    ctx.quadraticCurveTo(topX + Math.cos(a) * 20, topY + Math.sin(a) * 20 - 6, ex, ey);
    ctx.stroke();
  }
  ctx.fillStyle = '#7a5530';
  ctx.beginPath(); ctx.arc(topX - 3, topY + 4, 3.5, 0, Math.PI * 2); ctx.arc(topX + 3, topY + 5, 3.5, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// lešinar - zamjena za pticu (ista putanja i hitbox)
const VULTURE_PAL = { body: '#5a4030', head: '#d9a19a', wing1: '#3b2a1e', wing2: '#4a3526', tail: '#3b2a1e' };
function drawVulture(x, y, flapPhase, dir) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(1.15, 1.15);
  drawBird(0, 0, flapPhase * 0.7, dir, VULTURE_PAL);
  // bijeli ovratnik oko gole glave
  ctx.fillStyle = '#efe6d8';
  ctx.beginPath();
  ctx.ellipse(dir < 0 ? -6 : 6, -1, 4, 5.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// pustinjski soko - zamjena za osu (ista putanja i hitbox); s paletom ga koristi i ledenjak (ledeni sokol)
const DESERT_FALCON_PAL = { wing: '#5b6b7a', body: '#7d8c99', belly: '#e8e0d0', head: '#4a5866', tail: '#5b6b7a' };
function drawFalcon(x, y, flapPhase, vDir, pal) {
  pal = pal || DESERT_FALCON_PAL;
  const flap = Math.sin(flapPhase) * 0.8;
  const tilt = Math.max(-0.5, Math.min(0.5, vDir * 0.02));
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(tilt);
  ctx.scale(-1, 1); // gleda lijevo, prema pčelici
  // krila (zašiljena, zabačena unatrag)
  ctx.fillStyle = pal.wing;
  for (const side of [-1, 1]) {
    ctx.save();
    ctx.rotate(side * (0.25 + flap * 0.45));
    ctx.beginPath();
    ctx.moveTo(2, 0);
    ctx.lineTo(-12, side * 16);
    ctx.lineTo(-6, side * 3);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  // tijelo
  ctx.fillStyle = pal.body;
  ctx.beginPath(); ctx.ellipse(0, 0, 10, 4.8, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = pal.belly;
  ctx.beginPath(); ctx.ellipse(1, 2, 6, 2.5, 0, 0, Math.PI * 2); ctx.fill();
  // rep
  ctx.fillStyle = pal.tail;
  ctx.beginPath(); ctx.moveTo(-9, 0); ctx.lineTo(-16, -3); ctx.lineTo(-16, 3); ctx.closePath(); ctx.fill();
  // glava, kljun, oko
  ctx.fillStyle = pal.head;
  ctx.beginPath(); ctx.arc(9, -1, 4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#f2b632';
  ctx.beginPath(); ctx.moveTo(12.5, -1.5); ctx.lineTo(16, 0); ctx.lineTo(12.5, 1); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#ffd452';
  ctx.beginPath(); ctx.arc(10, -2, 1.3, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath(); ctx.arc(10.3, -2, 0.6, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// škorpion - zamjena za žabu; umjesto jezika ubada repom (ista logika i hitbox)
function drawScorpion(frog) {
  const sx = frog.curScreenX;
  const groundY = frog.curGroundY;
  const body = '#b5652b', dark = '#8a4a1c';
  const baseX = frog.curMouthX, baseY = frog.curMouthY;

  ctx.save();
  // noge
  ctx.strokeStyle = dark;
  ctx.lineWidth = 1.6;
  for (let i = 0; i < 3; i++) {
    const lx = sx - 6 + i * 6;
    const kick = Math.sin(waveT * 6 + i) * 1.5;
    ctx.beginPath(); ctx.moveTo(lx, groundY - 6); ctx.lineTo(lx - 5, groundY - 1 + kick); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(lx, groundY - 6); ctx.lineTo(lx + 3, groundY + kick * 0.5); ctx.stroke();
  }
  // tijelo i glava
  ctx.fillStyle = body;
  ctx.beginPath(); ctx.ellipse(sx, groundY - 7, 15, 6.5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(sx - 14, groundY - 7, 6, 5, 0, 0, Math.PI * 2); ctx.fill();
  // kliješta
  for (const side of [-1, 1]) {
    ctx.strokeStyle = body;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(sx - 16, groundY - 7 + side * 2);
    ctx.lineTo(sx - 26, groundY - 10 + side * 5);
    ctx.stroke();
    ctx.fillStyle = dark;
    ctx.beginPath(); ctx.ellipse(sx - 29, groundY - 10 + side * 5, 4.5, 3, side * 0.4, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath(); ctx.arc(sx - 17, groundY - 9, 1.2, 0, Math.PI * 2); ctx.fill();

  // rep: u mirovanju zavijen iznad leđa, u napadu ispružen prema pčelici
  let tipX, tipY;
  if (frog.state === 'striking' && frog.curTipX !== undefined) {
    tipX = frog.curTipX; tipY = frog.curTipY;
  } else {
    tipX = baseX - 4 + Math.sin(waveT * 2) * 2; tipY = baseY - 14;
  }
  const midX = (baseX + tipX) / 2 + 10, midY = Math.min(baseY, tipY) - 12;
  ctx.strokeStyle = body;
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(sx + 12, groundY - 8);
  ctx.quadraticCurveTo(baseX + 4, baseY + 4, baseX, baseY);
  ctx.quadraticCurveTo(midX, midY, tipX, tipY);
  ctx.stroke();
  // žalac
  ctx.fillStyle = '#3a1a0a';
  ctx.beginPath(); ctx.arc(tipX, tipY, 4.5, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#3a1a0a';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(tipX, tipY); ctx.lineTo(tipX - 6, tipY + 3); ctx.stroke();
  ctx.restore();
}

// zmija na kamenom luku - zamjena za granu (isti hitbox: od vrha ekrana do branchBottomY)
function drawSnakeArch(tree) {
  const sx = tree.curScreenX;
  const bottom = tree.curBranchBottomY;
  const sway = Math.sin(waveT * 1.4 + tree.swayPhase) * 6;
  const rockBottom = bottom - 42;
  ctx.save();
  // kameni stup koji visi s vrha (dio luka)
  const rg = ctx.createLinearGradient(sx - 30, 0, sx + 30, 0);
  rg.addColorStop(0, '#b87a44');
  rg.addColorStop(0.5, '#d49a5c');
  rg.addColorStop(1, '#a86a38');
  ctx.fillStyle = rg;
  ctx.beginPath();
  ctx.moveTo(sx - 34, -10);
  ctx.lineTo(sx + 34, -10);
  ctx.lineTo(sx + 26, rockBottom - 10);
  ctx.quadraticCurveTo(sx, rockBottom + 10, sx - 26, rockBottom - 10);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(120,70,30,0.5)';
  ctx.lineWidth = 2;
  for (let y = 30; y < rockBottom - 20; y += 38) {
    ctx.beginPath(); ctx.moveTo(sx - 28, y); ctx.quadraticCurveTo(sx, y + 6, sx + 28, y - 2); ctx.stroke();
  }
  // zmija koja visi s luka
  ctx.strokeStyle = '#6a8f2e';
  ctx.lineWidth = 12;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(sx + 4, rockBottom - 4);
  ctx.bezierCurveTo(sx + 26 + sway * 0.3, rockBottom + 6, sx - 24 + sway * 0.6, rockBottom + 26, sx + sway, bottom - 10);
  ctx.stroke();
  ctx.strokeStyle = '#c9b458';
  ctx.lineWidth = 3;
  ctx.setLineDash([4, 6]);
  ctx.beginPath();
  ctx.moveTo(sx + 4, rockBottom - 4);
  ctx.bezierCurveTo(sx + 26 + sway * 0.3, rockBottom + 6, sx - 24 + sway * 0.6, rockBottom + 26, sx + sway, bottom - 10);
  ctx.stroke();
  ctx.setLineDash([]);
  // glava
  const hx = sx + sway, hy = bottom - 4;
  ctx.fillStyle = '#5a7d24';
  ctx.beginPath(); ctx.ellipse(hx, hy, 10, 7.5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffd452';
  ctx.beginPath(); ctx.arc(hx - 4, hy - 2, 1.8, 0, Math.PI * 2); ctx.arc(hx + 4, hy - 2, 1.8, 0, Math.PI * 2); ctx.fill();
  // jezik koji palaca
  if (Math.sin(waveT * 7 + tree.swayPhase) > 0.3) {
    ctx.strokeStyle = '#d63a3a';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(hx, hy + 7); ctx.lineTo(hx, hy + 12);
    ctx.lineTo(hx - 2, hy + 15); ctx.moveTo(hx, hy + 12); ctx.lineTo(hx + 2, hy + 15);
    ctx.stroke();
  }
  ctx.restore();
}
