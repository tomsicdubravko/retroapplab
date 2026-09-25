// ===== Pčelica - SVIJET 5 (vulkan): vulkanska paleta, pepeo i vatrene kugle, vatrena stvorenja =====
// Vulkan koristi istu logiku kao svijet 1 (world1.js), samo drugačije izgleda:
//   voda -> lava (i dalje smrtonosna), livada -> vulkanska stijena, ptica -> feniks,
//   osa -> leteća žeravica, žaba -> vatreni daždevnjak, grana -> opožena grana s kapi lave,
//   ribar -> demon lave s trozupcem umjesto štapa, kiša -> pepeo i vatrene kugle
// Ulaz: portal na kraju ledenjaka (vidi WORLD_PORTALS u world3.js), ~1500-1800 m nakon ulaska na ledenjak.
let world5TriggerX = 0;

// ---------- Pepeo i vatrene kugle (zamjena za kišu; samo ukras, ne ozljeđuju) ----------
let ashFlakes = [];
let fireballs = [];
let nextFireballT = 0;

function initAshfall() {
  ashFlakes = [];
  for (let i = 0; i < 110; i++) {
    ashFlakes.push({
      x: Math.random() * W,
      y: Math.random() * H,
      r: 1 + Math.random() * 2.2,
      fall: 30 + Math.random() * 60,
      drift: 20 + Math.random() * 40,
      wobble: Math.random() * Math.PI * 2,
      ember: Math.random() < 0.18 // dio čestica su užarene iskre
    });
  }
  fireballs = [];
  nextFireballT = 0;
}

// poziva se iz core.js updateWeather() kad je vulkan
function updateAshfall(dt) {
  if (!ashFlakes.length) initAshfall();
  const I = weather.rainIntensity;
  for (const f of ashFlakes) {
    f.x -= (f.drift * (0.6 + I)) * dt;
    f.y += (f.fall * (0.5 + I * 1.2)) * dt + Math.sin(waveT * 1.5 + f.wobble) * 10 * dt;
    if (f.x < -10) { f.x = W + 10; f.y = Math.random() * H; }
    if (f.y > H + 5) { f.y = -5; f.x = Math.random() * W; }
  }
  // vatrene kugle padaju s neba samo u "oluji"
  if (I > 0.3) {
    nextFireballT -= dt;
    if (nextFireballT <= 0) {
      nextFireballT = 0.5 + Math.random() * 0.9;
      fireballs.push({ x: W * (0.2 + Math.random() * 0.9), y: -30, vx: -120 - Math.random() * 80, vy: 260 + Math.random() * 140, r: 6 + Math.random() * 6 });
    }
  }
  for (const b of fireballs) { b.x += b.vx * dt; b.y += b.vy * dt; }
  fireballs = fireballs.filter(b => b.y < H + 40 && b.x > -40);
}

function drawAshfall() {
  const I = weather.rainIntensity;
  ctx.save();
  if (I > 0.02) {
    ctx.fillStyle = 'rgba(60,40,35,' + (0.3 * I) + ')';
    ctx.fillRect(0, 0, W, H);
  }
  const count = Math.round(ashFlakes.length * (0.4 + I * 0.6));
  for (let i = 0; i < count; i++) {
    const f = ashFlakes[i];
    if (f.ember) {
      ctx.fillStyle = 'rgba(255,' + (140 + Math.floor(Math.sin(waveT * 8 + f.wobble) * 60)) + ',40,0.9)';
    } else {
      ctx.fillStyle = 'rgba(90,85,85,' + (0.5 + I * 0.3) + ')';
    }
    ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2); ctx.fill();
  }
  for (const b of fireballs) {
    const ang = Math.atan2(b.vy, b.vx);
    const tail = ctx.createLinearGradient(b.x, b.y, b.x - Math.cos(ang) * 60, b.y - Math.sin(ang) * 60);
    tail.addColorStop(0, 'rgba(255,200,80,0.9)');
    tail.addColorStop(1, 'rgba(255,60,20,0)');
    ctx.strokeStyle = tail;
    ctx.lineWidth = b.r * 1.6;
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(b.x - Math.cos(ang) * 60, b.y - Math.sin(ang) * 60); ctx.stroke();
    ctx.fillStyle = '#fff1a8';
    ctx.beginPath(); ctx.arc(b.x, b.y, b.r * 0.8, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

// ---------- Poruke na kraju igre ----------
function volcanoDeathText(reason) {
  return {
    bird: 'Spalio te feniks! 🔥',
    wasp: 'Opekla te leteća žeravica! ✨',
    frog: 'Uhvatio te vatreni daždevnjak! 🦎',
    tree: 'Udarila je u opoženu granu! 🪵',
    fisherman: 'Probo te demon lave trozupcem! 🔱',
    fish: 'Pogodio te mjehur lave! 🌋',
    ground: 'Pala je na vrelu stijenu! 🪨',
    water: 'Pala je u lavu! 🌋',
    redbird: mp.active ? null : 'Ulovila te crvena ptica! 🐦' // u multiplayeru ostaje poruka o protivnikovoj ptici
  }[reason] || null;
}

// ---------- Crtanje vulkana ----------
function drawVolcanoPortalView() {
  const sky = ctx.createLinearGradient(0, -45, 0, 45);
  sky.addColorStop(0, '#3a1a1a');
  sky.addColorStop(1, '#c2410c');
  ctx.fillStyle = sky;
  ctx.fillRect(-50, -50, 100, 100);
  ctx.fillStyle = '#2a1c1c';
  ctx.beginPath(); ctx.moveTo(-50, 40); ctx.lineTo(-12, -10); ctx.lineTo(10, -10); ctx.lineTo(50, 40); ctx.lineTo(50, 50); ctx.lineTo(-50, 50); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#ff7a1a';
  ctx.beginPath(); ctx.ellipse(-1, -10, 11, 3, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#ffb347';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(-4, -8); ctx.quadraticCurveTo(-10, 10, -22, 28); ctx.stroke();
  ctx.fillStyle = 'rgba(120,110,110,0.8)';
  ctx.beginPath(); ctx.arc(-4, -24, 8, 0, Math.PI * 2); ctx.arc(6, -32, 10, 0, Math.PI * 2); ctx.fill();
}

function drawVolcanoBackground() {
  const k = Math.min(1, weather.skyDarkness / 0.65); // 0 = mirno, 1 = kiša pepela
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, lerpColorStr('#2b1216', '#1a1414', k));
  g.addColorStop(0.55, lerpColorStr('#7a2a18', '#3d2a26', k));
  g.addColorStop(1, lerpColorStr('#e0622a', '#6b3a2a', k));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // mutno crveno sunce kroz dim
  if (weather.sunAlpha > 0.01) {
    ctx.save();
    ctx.globalAlpha = weather.sunAlpha * 0.8;
    const sg = ctx.createRadialGradient(W - 80, 80, 6, W - 80, 80, 55);
    sg.addColorStop(0, 'rgba(255,190,120,1)');
    sg.addColorStop(0.5, 'rgba(255,110,60,0.7)');
    sg.addColorStop(1, 'rgba(255,80,40,0)');
    ctx.fillStyle = sg;
    ctx.beginPath(); ctx.arc(W - 80, 80, 55, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  // oblaci dima
  ctx.save();
  ctx.globalAlpha = 0.55;
  for (const c of clouds) {
    const sx = c.worldX - scrollX * c.speedMul;
    drawCloud(sx, c.y, c.scale, 0.85);
  }
  ctx.restore();

  // daleki vulkani (paralaksa) sa žarom na vrhu i stupom dima
  const layers = [
    { par: 0.1, base: H * 0.64, peak: 170, spacing: 420, col: lerpColorStr('#4a2320', '#352524', k) },
    { par: 0.22, base: H * 0.72, peak: 120, spacing: 300, col: lerpColorStr('#35191a', '#2a1f1e', k) }
  ];
  for (const L of layers) {
    const off = (scrollX * L.par) % L.spacing;
    for (let x = -off - L.spacing; x < W + L.spacing; x += L.spacing) {
      const idx = Math.floor((x + scrollX * L.par) / L.spacing);
      const h = L.peak * (0.7 + 0.3 * Math.abs(Math.sin(idx * 7.13)));
      const px = x + L.spacing / 2, py = L.base - h;
      const crater = 18 + h * 0.08;
      ctx.fillStyle = L.col;
      ctx.beginPath();
      ctx.moveTo(x - 30, L.base + 60);
      ctx.lineTo(px - crater, py);
      ctx.lineTo(px + crater, py);
      ctx.lineTo(x + L.spacing + 30, L.base + 60);
      ctx.closePath();
      ctx.fill();
      // žar u krateru i potok lave niz padinu
      const glow = 0.6 + 0.4 * Math.sin(waveT * 2 + idx);
      ctx.fillStyle = 'rgba(255,120,30,' + glow + ')';
      ctx.beginPath(); ctx.ellipse(px, py + 2, crater * 0.9, 4, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(255,110,30,' + (0.5 * glow) + ')';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(px - 3, py + 4); ctx.quadraticCurveTo(px - h * 0.15, py + h * 0.5, px - h * 0.35, py + h * 0.95); ctx.stroke();
      // dim
      ctx.fillStyle = 'rgba(80,70,70,0.45)';
      for (let i = 0; i < 3; i++) {
        const t = (waveT * 0.25 + i / 3 + idx * 0.13) % 1;
        ctx.beginPath(); ctx.arc(px + t * 30, py - 10 - t * 70, 10 + t * 18, 0, Math.PI * 2); ctx.fill();
      }
    }
  }
}

function drawVolcanoTerrain() {
  const step = 10;
  const lavaTop = '#ff8a1f', lavaBot = '#b3261e';   // lava
  const rockTop = '#4a3a36', rockBot = '#1f1716';   // vulkanska stijena
  ctx.save();
  const tops = [];
  for (let x = 0; x <= W; x += step) {
    const worldX = x + scrollX;
    const blend = terrainBlendAt(worldX); // 0 = lava, 1 = stijena
    const lavaWave = Math.sin(worldX * 0.02 + waveT * 1.6) * 3;
    const rockBump = (Math.sin(worldX * 0.05) + Math.sin(worldX * 0.13)) * 1.5;
    const topY = waterY - blend * MEADOW_RAISE + lavaWave * (1 - blend) + rockBump * blend;
    tops.push(topY);
    const grad = ctx.createLinearGradient(0, topY, 0, H);
    grad.addColorStop(0, lerpColorStr(lavaTop, rockTop, blend));
    grad.addColorStop(1, lerpColorStr(lavaBot, rockBot, blend));
    ctx.fillStyle = grad;
    ctx.fillRect(x, topY, step + 1, H - topY);
  }
  ctx.strokeStyle = 'rgba(255,170,80,0.75)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  tops.forEach((y, i) => { if (i === 0) ctx.moveTo(i * step, y); else ctx.lineTo(i * step, y); });
  ctx.stroke();
  ctx.restore();

  // mjehurići na lavi i užarene pukotine u stijeni
  for (const seg of terrain) {
    if (seg.end - scrollX < -20 || seg.start - scrollX > W + 20) continue;
    ctx.save();
    if (seg.type === 'water') {
      for (let wx = seg.start + 40; wx < seg.end - 40; wx += 70) {
        const sx = wx - scrollX;
        if (sx < -20 || sx > W + 20) continue;
        const ph = (waveT * 0.8 + wx * 0.013) % 1;
        const r = 3 + ph * 6;
        ctx.globalAlpha = 1 - ph;
        ctx.fillStyle = '#ffd36a';
        ctx.beginPath(); ctx.arc(sx, waterY + 8 - ph * 6, r, 0, Math.PI * 2); ctx.fill();
      }
    } else {
      for (let wx = seg.start + 50; wx < seg.end - 50; wx += 130) {
        const sx = wx - scrollX;
        if (sx < -40 || sx > W + 40) continue;
        const gy = surfaceYAt(wx);
        const glow = 0.45 + 0.35 * Math.sin(waveT * 2 + wx);
        ctx.strokeStyle = 'rgba(255,110,30,' + glow + ')';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(sx, gy + 6); ctx.lineTo(sx + 10, gy + 18); ctx.lineTo(sx + 4, gy + 32);
        ctx.moveTo(sx + 10, gy + 18); ctx.lineTo(sx + 24, gy + 24);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  // kameni šiljci, žeravice i vatreno cvijeće (cvijeće se i dalje skuplja)
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
        ctx.strokeStyle = '#3a2a26';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -tuft.h); ctx.stroke();
        // latice poput plamena
        const flick = Math.sin(waveT * 9 + tuft.offset) * 1.5;
        ctx.fillStyle = '#ff5a1f';
        ctx.beginPath(); ctx.moveTo(-5, -tuft.h + 2); ctx.quadraticCurveTo(-4, -tuft.h - 7, flick, -tuft.h - 10); ctx.quadraticCurveTo(4, -tuft.h - 7, 5, -tuft.h + 2); ctx.closePath(); ctx.fill();
        ctx.fillStyle = tuft.hue;
        ctx.beginPath(); ctx.arc(0, -tuft.h, 3.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fff1a8';
        ctx.beginPath(); ctx.arc(0, -tuft.h, 1.6, 0, Math.PI * 2); ctx.fill();
      } else if (Math.floor(tuft.offset) % 3 === 0) {
        // žeravica na tlu
        const glow = 0.6 + 0.4 * Math.sin(waveT * 5 + tuft.offset);
        ctx.fillStyle = 'rgba(255,120,40,' + glow + ')';
        ctx.beginPath(); ctx.ellipse(0, -2, 5, 3, 0, 0, Math.PI * 2); ctx.fill();
      } else {
        // kameni šiljak
        ctx.fillStyle = '#2e2220';
        ctx.beginPath(); ctx.moveTo(-5, 0); ctx.lineTo(-1, -tuft.h * 0.9); ctx.lineTo(5, 0); ctx.closePath(); ctx.fill();
      }
      ctx.restore();
    }
  }
}

// feniks - zamjena za pticu (ista putanja i hitbox)
const PHOENIX_PAL = { body: '#e8541e', head: '#ff8c1a', wing1: '#c0280f', wing2: '#f07a1a', tail: '#ffb020' };
function drawPhoenix(x, y, flapPhase, dir) {
  ctx.save();
  // vatreni sjaj
  const g = ctx.createRadialGradient(x, y, 4, x, y, 34);
  g.addColorStop(0, 'rgba(255,170,60,0.45)');
  g.addColorStop(1, 'rgba(255,90,30,0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(x, y, 34, 0, Math.PI * 2); ctx.fill();
  ctx.translate(x, y);
  ctx.scale(1.15, 1.15);
  // plameni rep
  const f = dir < 0 ? -1 : 1;
  for (let i = 0; i < 3; i++) {
    const wave = Math.sin(waveT * 10 + i * 1.7) * 3;
    ctx.fillStyle = i === 0 ? 'rgba(255,200,60,0.85)' : i === 1 ? 'rgba(255,120,30,0.8)' : 'rgba(220,50,20,0.7)';
    ctx.beginPath();
    ctx.moveTo(-14 * f, 0);
    ctx.quadraticCurveTo(-28 * f, -6 + i * 5 + wave, -38 * f - i * 4 * f, -2 + i * 6 + wave);
    ctx.quadraticCurveTo(-26 * f, 2 + i * 4, -14 * f, 3);
    ctx.closePath();
    ctx.fill();
  }
  drawBird(0, 0, flapPhase, dir, PHOENIX_PAL);
  // krijesta
  ctx.fillStyle = '#ffd23f';
  ctx.beginPath(); ctx.moveTo(8 * f, -7); ctx.lineTo(6 * f, -14); ctx.lineTo(11 * f, -8); ctx.lineTo(13 * f, -13); ctx.lineTo(13 * f, -6); ctx.closePath(); ctx.fill();
  ctx.restore();
}

// leteća žeravica - zamjena za osu (ista putanja i hitbox)
function drawEmber(x, y, flapPhase, vDir) {
  ctx.save();
  const flicker = 1 + Math.sin(flapPhase * 1.3) * 0.12;
  // vatreni rep iza (leti ulijevo, rep je desno)
  for (let i = 0; i < 4; i++) {
    const tx = x + 8 + i * 7, ty = y - vDir * 0.02 * i * 4 + Math.sin(flapPhase + i) * 2;
    ctx.fillStyle = 'rgba(255,' + (160 - i * 30) + ',40,' + (0.7 - i * 0.15) + ')';
    ctx.beginPath(); ctx.arc(tx, ty, 7 - i * 1.4, 0, Math.PI * 2); ctx.fill();
  }
  const g = ctx.createRadialGradient(x, y, 1, x, y, 14 * flicker);
  g.addColorStop(0, '#fff6c8');
  g.addColorStop(0.4, '#ffb347');
  g.addColorStop(1, 'rgba(255,80,20,0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(x, y, 14 * flicker, 0, Math.PI * 2); ctx.fill();
  // ljutite oči
  ctx.fillStyle = '#3a0d05';
  ctx.beginPath(); ctx.arc(x - 3, y - 1, 1.3, 0, Math.PI * 2); ctx.arc(x + 1.5, y - 1, 1.3, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// vatreni daždevnjak - zamjena za žabu, i dalje napada jezikom (ista logika i hitbox)
function drawSalamander(frog) {
  const sx = frog.curScreenX;
  const groundY = frog.curGroundY;
  // jezik
  if (frog.state === 'striking' && frog.curTipX !== undefined) {
    ctx.save();
    ctx.strokeStyle = '#ff6a2a';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(frog.curMouthX, frog.curMouthY); ctx.lineTo(frog.curTipX, frog.curTipY); ctx.stroke();
    ctx.fillStyle = '#ffb347';
    ctx.beginPath(); ctx.arc(frog.curTipX, frog.curTipY, 5, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  ctx.save();
  ctx.translate(sx, groundY);
  const sway = Math.sin(waveT * 3 + frog.blink) * 3;
  // rep
  ctx.strokeStyle = '#1c1414';
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-12, -8); ctx.quadraticCurveTo(-26, -6 + sway, -34, -2 - sway); ctx.stroke();
  // noge
  ctx.lineWidth = 3.5;
  for (const [lx, dir] of [[-8, -1], [6, 1]]) {
    ctx.beginPath(); ctx.moveTo(lx, -8); ctx.lineTo(lx + dir * 5, -1); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(lx + 2, -8); ctx.lineTo(lx + 2 + dir * 3, 0); ctx.stroke();
  }
  // tijelo i glava (glava prema usima na +14, -20)
  ctx.fillStyle = '#1c1414';
  ctx.beginPath(); ctx.ellipse(0, -10, 15, 7, -0.15, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(12, -17, 7, 5.5, -0.5, 0, Math.PI * 2); ctx.fill();
  // žuto-narančaste pjege
  ctx.fillStyle = '#ffb020';
  for (const [px, py, r] of [[-8, -12, 2.6], [-1, -9, 2.2], [6, -13, 2.4], [-14, -9, 1.8], [12, -19, 1.8]]) {
    ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.fill();
  }
  // oko
  ctx.fillStyle = '#ffd23f';
  ctx.beginPath(); ctx.arc(14, -19, 1.8, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath(); ctx.arc(14.4, -19, 0.8, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// opožena grana s kapi lave (isti hitbox kao grana)
function drawScorchedBranch(tree) {
  const sx = tree.curScreenX;
  const bottom = tree.curBranchBottomY;
  const sway = Math.sin(waveT * 0.9 + tree.swayPhase) * 3;
  ctx.save();
  ctx.strokeStyle = '#1e1715';
  ctx.lineWidth = 12;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(sx, -10);
  ctx.quadraticCurveTo(sx + sway * 0.4, bottom * 0.5, sx + sway, bottom - 16);
  ctx.stroke();
  // užareni rubovi (tinja)
  ctx.strokeStyle = 'rgba(255,100,30,' + (0.45 + 0.25 * Math.sin(waveT * 3 + tree.swayPhase)) + ')';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(sx + 5, -10);
  ctx.quadraticCurveTo(sx + 5 + sway * 0.4, bottom * 0.5, sx + 4 + sway, bottom - 18);
  ctx.stroke();
  // ugljenisane grančice
  for (const t of [0.35, 0.65]) {
    const ty = bottom * t, tx = sx + sway * t;
    ctx.strokeStyle = '#1e1715';
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(tx + (t < 0.5 ? -16 : 16), ty - 10); ctx.stroke();
    ctx.fillStyle = 'rgba(255,120,40,0.8)';
    ctx.beginPath(); ctx.arc(tx + (t < 0.5 ? -16 : 16), ty - 10, 2, 0, Math.PI * 2); ctx.fill();
  }
  // grozd ugljena na dnu i kap lave koja visi
  const bx = sx + sway;
  ctx.fillStyle = '#2a1f1c';
  for (const [ox, oy, r] of [[0, -14, 16], [-16, -10, 11], [16, -10, 11]]) {
    ctx.beginPath(); ctx.arc(bx + ox, bottom + oy, r, 0, Math.PI * 2); ctx.fill();
  }
  const drip = (waveT * 0.6 + tree.swayPhase) % 1;
  const dg = ctx.createRadialGradient(bx, bottom + 2, 1, bx, bottom + 2, 9);
  dg.addColorStop(0, '#fff1a8');
  dg.addColorStop(0.5, '#ff8a1f');
  dg.addColorStop(1, '#c0280f');
  ctx.fillStyle = dg;
  ctx.beginPath();
  ctx.moveTo(bx - 5, bottom - 6);
  ctx.quadraticCurveTo(bx - 8, bottom + 4, bx, bottom + 8 + drip * 4);
  ctx.quadraticCurveTo(bx + 8, bottom + 4, bx + 5, bottom - 6);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// demon lave s trozupcem - zamjena za ribara; vrh trozupca je opasnost (isto mjesto i ritam kao udica)
function drawLavaDemon(screenX, t, hookX, hookY) {
  const bob = Math.sin(waveT * 1.3) * 2;
  const baseY = waterY + bob;
  ctx.save();
  // tijelo izranja iz lave
  const bg = ctx.createLinearGradient(0, baseY - 70, 0, baseY);
  bg.addColorStop(0, '#b3261e');
  bg.addColorStop(1, '#5a0f0a');
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.moveTo(screenX - 24, baseY + 4);
  ctx.quadraticCurveTo(screenX - 26, baseY - 50, screenX, baseY - 58);
  ctx.quadraticCurveTo(screenX + 26, baseY - 50, screenX + 24, baseY + 4);
  ctx.closePath();
  ctx.fill();
  // glava s rogovima
  ctx.fillStyle = '#c0321f';
  ctx.beginPath(); ctx.arc(screenX, baseY - 66, 13, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#2a1a14';
  ctx.beginPath(); ctx.moveTo(screenX - 10, baseY - 74); ctx.quadraticCurveTo(screenX - 20, baseY - 86, screenX - 14, baseY - 94); ctx.lineTo(screenX - 5, baseY - 77); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(screenX + 10, baseY - 74); ctx.quadraticCurveTo(screenX + 20, baseY - 86, screenX + 14, baseY - 94); ctx.lineTo(screenX + 5, baseY - 77); ctx.closePath(); ctx.fill();
  // užarene oči
  ctx.fillStyle = '#ffd23f';
  ctx.beginPath(); ctx.ellipse(screenX - 5, baseY - 68, 3, 2, 0.3, 0, Math.PI * 2); ctx.ellipse(screenX + 5, baseY - 68, 3, 2, -0.3, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#2a0a05';
  ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.moveTo(screenX - 6, baseY - 60); ctx.quadraticCurveTo(screenX, baseY - 56, screenX + 6, baseY - 60); ctx.stroke();
  // mreškanje lave oko tijela
  ctx.strokeStyle = 'rgba(255,200,80,0.8)';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(screenX, baseY + 3, 30, 4, 0, 0, Math.PI * 2); ctx.stroke();
  // ruka i drška trozupca do vrha (hookX, hookY)
  const handX = screenX + 18, handY = baseY - 38;
  ctx.strokeStyle = '#c0321f';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(screenX + 12, baseY - 44); ctx.lineTo(handX, handY); ctx.stroke();
  const ang = Math.atan2(hookY - handY, hookX - handX);
  const headX = hookX - Math.cos(ang) * 4, headY = hookY - Math.sin(ang) * 4;
  ctx.strokeStyle = '#3a3030';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(handX - Math.cos(ang) * 14, handY - Math.sin(ang) * 14); ctx.lineTo(headX, headY); ctx.stroke();
  // tri šiljka
  ctx.strokeStyle = '#ffb347';
  ctx.lineWidth = 2.6;
  const px = -Math.sin(ang), py = Math.cos(ang);
  ctx.beginPath(); ctx.moveTo(headX - px * 7, headY - py * 7); ctx.lineTo(headX + px * 7, headY + py * 7); ctx.stroke();
  for (const s of [-7, 0, 7]) {
    ctx.beginPath();
    ctx.moveTo(headX + px * s, headY + py * s);
    ctx.lineTo(headX + px * s + Math.cos(ang) * 11, headY + py * s + Math.sin(ang) * 11);
    ctx.stroke();
  }
  ctx.restore();
}

// mjehur lave - zamjena za ribu koja skače (ista putanja i hitbox)
function drawLavaBlob(x, y, progress) {
  ctx.save();
  const g = ctx.createRadialGradient(x - 3, y - 3, 1, x, y, 14);
  g.addColorStop(0, '#fff1a8');
  g.addColorStop(0.45, '#ff8a1f');
  g.addColorStop(1, '#b3261e');
  ctx.fillStyle = g;
  const stretch = 1 + Math.abs(progress - 0.5) * 0.5;
  ctx.beginPath(); ctx.ellipse(x, y, 12 / stretch, 12 * stretch, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255,170,60,0.6)';
  ctx.beginPath(); ctx.arc(x + 4, y + 14 * stretch, 3, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
