// ===== Pčelica - SVIJET 4 (ledenjak): ledena paleta, mećava i ledena stvorenja =====
// Ledenjak koristi istu logiku kao svijet 1 (world1.js), samo drugačije izgleda:
//   voda -> tanak led / smrznuto jezero (i dalje opasno), livada -> snijeg, ptica -> snježna sova,
//   osa -> ledeni sokol, žaba -> jeti koji zamahne šapom umjesto jezika, grana -> ledenice umjesto lišća,
//   ribar -> ribar na rupi u ledu, kiša -> mećava
// Ulaz: portal na kraju pustinje (vidi WORLD_PORTALS u world3.js), ~1500-1800 m nakon ulaska u pustinju.
let world4TriggerX = 0;

// ---------- Mećava (zamjena za kišu; na ledenjaku nema munja) ----------
let snowFlakes = [];

function initBlizzard() {
  snowFlakes = [];
  for (let i = 0; i < 130; i++) {
    snowFlakes.push({
      x: Math.random() * W,
      y: Math.random() * H,
      r: 1.2 + Math.random() * 2.4,
      speed: 260 + Math.random() * 260,
      fall: 60 + Math.random() * 90,
      wobble: Math.random() * Math.PI * 2
    });
  }
}

// poziva se iz core.js updateWeather() kad je ledenjak
function updateBlizzard(dt) {
  if (!snowFlakes.length) initBlizzard();
  // lagani snijeg pada uvijek, u mećavi puše vodoravno i puno brže
  const I = weather.rainIntensity;
  for (const f of snowFlakes) {
    f.x -= (20 + f.speed * I) * dt;
    f.y += (f.fall * (0.5 + I * 0.8)) * dt + Math.sin(waveT * 2 + f.wobble) * 15 * dt;
    if (f.x < -10) { f.x = W + 10; f.y = Math.random() * H; }
    if (f.y > H + 5) { f.y = -5; f.x = Math.random() * W; }
  }
}

function drawBlizzard() {
  const I = weather.rainIntensity;
  ctx.save();
  if (I > 0.02) {
    ctx.fillStyle = 'rgba(235,242,250,' + (0.38 * I) + ')';
    ctx.fillRect(0, 0, W, H);
  }
  ctx.fillStyle = 'rgba(255,255,255,' + (0.55 + I * 0.4) + ')';
  const count = Math.round(snowFlakes.length * (0.35 + I * 0.65));
  for (let i = 0; i < count; i++) {
    const f = snowFlakes[i];
    ctx.beginPath();
    if (I > 0.3) ctx.ellipse(f.x, f.y, f.r * (1 + I * 2), f.r, 0, 0, Math.PI * 2);
    else ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// ---------- Poruke na kraju igre ----------
function glacierDeathText(reason) {
  return {
    bird: 'Uhvatila te snježna sova! 🦉',
    wasp: 'Zgrabio te ledeni sokol! 🦅',
    frog: 'Jeti te odalamio šapom! 🐾',
    tree: 'Udarila je u ledenice! 🧊',
    fisherman: 'Upecala te udica iz rupe u ledu! 🎣',
    fish: 'Udarila te riba iz rupe u ledu! 🐟',
    ground: 'Pala je u snijeg! ❄️',
    water: 'Propala je kroz tanki led! 🧊'
  }[reason] || null;
}

// ---------- Crtanje ledenjaka ----------
function drawGlacierPortalView() {
  const sky = ctx.createLinearGradient(0, -45, 0, 45);
  sky.addColorStop(0, '#8fc8ee');
  sky.addColorStop(1, '#e8f5ff');
  ctx.fillStyle = sky;
  ctx.fillRect(-50, -50, 100, 100);
  ctx.fillStyle = '#b9d4ea';
  ctx.beginPath(); ctx.moveTo(-50, 30); ctx.lineTo(-22, -12); ctx.lineTo(0, 18); ctx.lineTo(24, -20); ctx.lineTo(50, 22); ctx.lineTo(50, 50); ctx.lineTo(-50, 50); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.moveTo(-22, -12); ctx.lineTo(-30, 0); ctx.lineTo(-14, 0); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(24, -20); ctx.lineTo(15, -6); ctx.lineTo(33, -6); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#f4f9ff';
  ctx.fillRect(-50, 30, 100, 20);
}

function drawGlacierBackground() {
  const k = Math.min(1, weather.skyDarkness / 0.65); // 0 = vedro, 1 = mećava
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, lerpColorStr('#7fb9e6', '#9aa8b8', k));
  g.addColorStop(0.55, lerpColorStr('#bfe0f6', '#c3ccd6', k));
  g.addColorStop(1, lerpColorStr('#eef7ff', '#dde3ea', k));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // blijedo zimsko sunce
  if (weather.sunAlpha > 0.01) {
    ctx.save();
    ctx.globalAlpha = weather.sunAlpha * 0.9;
    const sg = ctx.createRadialGradient(W - 70, 70, 8, W - 70, 70, 60);
    sg.addColorStop(0, 'rgba(255,255,245,1)');
    sg.addColorStop(0.5, 'rgba(240,248,255,0.8)');
    sg.addColorStop(1, 'rgba(220,238,255,0)');
    ctx.fillStyle = sg;
    ctx.beginPath(); ctx.arc(W - 70, 70, 60, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  // oblaci - sivi u mećavi
  for (const c of clouds) {
    const sx = c.worldX - scrollX * c.speedMul;
    drawCloud(sx, c.y, c.scale, weather.cloudDarkness * 0.6);
  }

  // daleke snježne planine (paralaksa)
  const layers = [
    { par: 0.1, base: H * 0.62, peak: 150, spacing: 260, col: lerpColorStr('#a9c6de', '#b3bcc6', k) },
    { par: 0.22, base: H * 0.7, peak: 110, spacing: 190, col: lerpColorStr('#c7dcee', '#c8cfd7', k) }
  ];
  for (const L of layers) {
    const off = (scrollX * L.par) % L.spacing;
    for (let x = -off - L.spacing; x < W + L.spacing; x += L.spacing) {
      const idx = Math.floor((x + scrollX * L.par) / L.spacing);
      const h = L.peak * (0.65 + 0.35 * Math.abs(Math.sin(idx * 12.9898)));
      const px = x + L.spacing / 2, py = L.base - h;
      ctx.fillStyle = L.col;
      ctx.beginPath();
      ctx.moveTo(x - 20, L.base + 40);
      ctx.lineTo(px, py);
      ctx.lineTo(x + L.spacing + 20, L.base + 40);
      ctx.closePath();
      ctx.fill();
      // snježna kapa
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px - h * 0.32, py + h * 0.3);
      ctx.lineTo(px - h * 0.12, py + h * 0.24);
      ctx.lineTo(px, py + h * 0.33);
      ctx.lineTo(px + h * 0.14, py + h * 0.25);
      ctx.lineTo(px + h * 0.32, py + h * 0.3);
      ctx.closePath();
      ctx.fill();
    }
  }
}

function drawGlacierTerrain() {
  const step = 10;
  const iceTop = '#bfe6f5', iceBot = '#5f9fc4';     // tanak led / smrznuto jezero
  const snowTop = '#f7fbff', snowBot = '#c4d6e6';   // snijeg
  ctx.save();
  const tops = [];
  for (let x = 0; x <= W; x += step) {
    const worldX = x + scrollX;
    const blend = terrainBlendAt(worldX); // 0 = led, 1 = snijeg
    const drift = Math.sin(worldX * 0.012) * 2.5;
    const topY = waterY - blend * MEADOW_RAISE + drift * blend;
    tops.push(topY);
    const grad = ctx.createLinearGradient(0, topY, 0, H);
    grad.addColorStop(0, lerpColorStr(iceTop, snowTop, blend));
    grad.addColorStop(1, lerpColorStr(iceBot, snowBot, blend));
    ctx.fillStyle = grad;
    ctx.fillRect(x, topY, step + 1, H - topY);
  }
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  tops.forEach((y, i) => { if (i === 0) ctx.moveTo(i * step, y); else ctx.lineTo(i * step, y); });
  ctx.stroke();
  ctx.restore();

  // pukotine i odsjaji na tankom ledu
  for (const seg of terrain) {
    if (seg.type !== 'water') continue;
    if (seg.end - scrollX < -20 || seg.start - scrollX > W + 20) continue;
    ctx.save();
    for (let wx = seg.start + 60; wx < seg.end - 60; wx += 110) {
      const sx = wx - scrollX;
      if (sx < -40 || sx > W + 40) continue;
      const seed = Math.sin(wx * 0.37) * 1000;
      const r = seed - Math.floor(seed);
      ctx.strokeStyle = 'rgba(70,120,160,0.55)';
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(sx, waterY + 4);
      ctx.lineTo(sx + 14 + r * 10, waterY + 12);
      ctx.lineTo(sx + 8 + r * 20, waterY + 26);
      ctx.moveTo(sx + 14 + r * 10, waterY + 12);
      ctx.lineTo(sx + 30, waterY + 10 + r * 8);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(sx - 30, waterY + 8 + r * 6);
      ctx.lineTo(sx - 12, waterY + 5 + r * 6);
      ctx.stroke();
    }
    ctx.restore();
  }

  // snježni humci, ledeni kristali i ledeno cvijeće (cvijeće se i dalje skuplja)
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
        ctx.strokeStyle = '#7aa7c7';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -tuft.h); ctx.stroke();
        ctx.fillStyle = tuft.hue;
        for (let i = 0; i < 5; i++) {
          const a = i * Math.PI * 2 / 5 + waveT * 0.3;
          ctx.beginPath(); ctx.arc(Math.cos(a) * 3.5, -tuft.h + Math.sin(a) * 3.5, 2.6, 0, Math.PI * 2); ctx.fill();
        }
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.arc(0, -tuft.h, 1.9, 0, Math.PI * 2); ctx.fill();
      } else if (Math.floor(tuft.offset) % 3 === 0) {
        // ledeni kristal
        ctx.fillStyle = 'rgba(190,230,250,0.9)';
        ctx.strokeStyle = 'rgba(255,255,255,0.9)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-4, 0); ctx.lineTo(-2, -tuft.h * 0.9); ctx.lineTo(1, -tuft.h * 1.2); ctx.lineTo(4, -tuft.h * 0.6); ctx.lineTo(5, 0);
        ctx.closePath(); ctx.fill(); ctx.stroke();
      } else {
        // snježni humak
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.ellipse(0, 0, 9, tuft.h * 0.35, 0, Math.PI, 0); ctx.fill();
      }
      ctx.restore();
    }
  }
}

// snježna sova - zamjena za pticu (ista putanja i hitbox)
const SNOWY_OWL_PAL = { body: '#f4f6f8', head: '#ffffff', wing1: '#d9dfe6', wing2: '#e6ebf0', tail: '#d9dfe6' };
function drawSnowyOwl(x, y, flapPhase, dir) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(1.1, 1.1);
  drawBird(0, 0, flapPhase * 0.8, dir, SNOWY_OWL_PAL);
  const f = dir < 0 ? -1 : 1;
  // tamne pjege
  ctx.fillStyle = '#8a94a0';
  for (const [px, py] of [[-4, -1], [0, 2], [3, -2], [-7, 2]]) {
    ctx.beginPath(); ctx.arc(px * f, py, 0.9, 0, Math.PI * 2); ctx.fill();
  }
  // velike žute oči
  ctx.fillStyle = '#ffd23f';
  ctx.beginPath(); ctx.arc(11.5 * f, -4.2, 2.4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath(); ctx.arc(12 * f, -4.2, 1.1, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// ledeni sokol - zamjena za osu (ista putanja i hitbox)
const ICE_FALCON_PAL = { wing: '#8fb8d8', body: '#cfe3f2', belly: '#ffffff', head: '#9fc4e0', tail: '#8fb8d8' };

// jeti - zamjena za žabu; umjesto jezika zamahne šapom (ista logika i hitbox)
function drawYeti(frog) {
  const sx = frog.curScreenX;
  const groundY = frog.curGroundY;
  const striking = frog.state === 'striking' && frog.curTipX !== undefined;
  const breathe = Math.sin(waveT * 2 + frog.blink) * 1.2;
  ctx.save();
  // noge
  ctx.fillStyle = '#e8eef4';
  ctx.beginPath(); ctx.ellipse(sx - 9, groundY - 5, 7, 6, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(sx + 9, groundY - 5, 7, 6, 0, 0, Math.PI * 2); ctx.fill();
  // krzneno tijelo
  const bg = ctx.createRadialGradient(sx - 5, groundY - 30, 4, sx, groundY - 24, 26);
  bg.addColorStop(0, '#ffffff');
  bg.addColorStop(1, '#cfdbe6');
  ctx.fillStyle = bg;
  ctx.beginPath(); ctx.ellipse(sx, groundY - 24 - breathe, 18, 22, 0, 0, Math.PI * 2); ctx.fill();
  // čuperci krzna
  ctx.strokeStyle = '#b8c8d6';
  ctx.lineWidth = 1.2;
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath(); ctx.moveTo(sx + i * 6, groundY - 8); ctx.lineTo(sx + i * 6 + 2, groundY - 14); ctx.stroke();
  }
  // lice
  ctx.fillStyle = '#7d93a8';
  ctx.beginPath(); ctx.ellipse(sx + 3, groundY - 34 - breathe, 9, 8, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.arc(sx, groundY - 36 - breathe, 2.2, 0, Math.PI * 2); ctx.arc(sx + 7, groundY - 36 - breathe, 2.2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath(); ctx.arc(sx + 0.6, groundY - 36 - breathe, 1.1, 0, Math.PI * 2); ctx.arc(sx + 7.6, groundY - 36 - breathe, 1.1, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#3a4a5a';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  if (striking) ctx.arc(sx + 3.5, groundY - 30 - breathe, 3, 0, Math.PI * 2); // rik
  else { ctx.moveTo(sx, groundY - 30 - breathe); ctx.lineTo(sx + 7, groundY - 30 - breathe); }
  ctx.stroke();
  // lijeva ruka uz tijelo
  ctx.strokeStyle = '#e8eef4';
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(sx - 14, groundY - 30); ctx.lineTo(sx - 18, groundY - 14); ctx.stroke();
  // desna ruka: u mirovanju spuštena, u napadu zamahne šapom do vrha (hitbox = vrh šape)
  const shX = frog.curMouthX, shY = frog.curMouthY;
  const tipX = striking ? frog.curTipX : sx + 20;
  const tipY = striking ? frog.curTipY : groundY - 12;
  ctx.strokeStyle = '#f2f6fa';
  ctx.lineWidth = 8;
  ctx.beginPath(); ctx.moveTo(shX, shY); ctx.lineTo(tipX, tipY); ctx.stroke();
  // šapa s kandžama
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.arc(tipX, tipY, 6.5, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#3a4a5a';
  ctx.lineWidth = 1.6;
  const ang = Math.atan2(tipY - shY, tipX - shX);
  for (const d of [-0.5, 0, 0.5]) {
    const a = ang + d;
    ctx.beginPath();
    ctx.moveTo(tipX + Math.cos(a) * 5, tipY + Math.sin(a) * 5);
    ctx.lineTo(tipX + Math.cos(a) * 10, tipY + Math.sin(a) * 10);
    ctx.stroke();
  }
  ctx.restore();
}

// grana s ledenicama umjesto lišća (isti hitbox)
function drawIcicleBranch(tree) {
  const sx = tree.curScreenX;
  const bottom = tree.curBranchBottomY;
  const sway = Math.sin(waveT * 0.9 + tree.swayPhase) * 3;
  ctx.save();
  // smrznuta grana
  ctx.strokeStyle = '#6b5a4a';
  ctx.lineWidth = 11;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(sx, -10);
  ctx.quadraticCurveTo(sx + sway * 0.4, bottom * 0.5, sx + sway, bottom - 18);
  ctx.stroke();
  // snijeg na grani
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(sx - 4, -10);
  ctx.quadraticCurveTo(sx - 4 + sway * 0.4, bottom * 0.5, sx - 3 + sway, bottom - 20);
  ctx.stroke();
  // grančice s injem
  for (const t of [0.35, 0.65]) {
    const ty = bottom * t, tx = sx + sway * t;
    ctx.strokeStyle = '#6b5a4a';
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(tx + (t < 0.5 ? -16 : 16), ty - 10); ctx.stroke();
    ctx.fillStyle = 'rgba(210,240,255,0.95)';
    const ex = tx + (t < 0.5 ? -16 : 16), ey = ty - 10;
    ctx.beginPath(); ctx.moveTo(ex - 3, ey); ctx.lineTo(ex, ey + 12); ctx.lineTo(ex + 3, ey); ctx.closePath(); ctx.fill();
  }
  // grozd ledenica na dnu grane (umjesto lišća)
  const bx = sx + sway;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.ellipse(bx, bottom - 18, 30, 9, 0, 0, Math.PI * 2); ctx.fill();
  const icicles = [[-26, 14], [-17, 22], [-8, 28], [0, 24], [9, 30], [18, 20], [26, 13]];
  for (const [ox, len] of icicles) {
    const g = ctx.createLinearGradient(0, bottom - 18, 0, bottom - 18 + len);
    g.addColorStop(0, 'rgba(230,248,255,0.98)');
    g.addColorStop(1, 'rgba(150,210,240,0.85)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(bx + ox - 4, bottom - 18);
    ctx.lineTo(bx + ox, bottom - 18 + len);
    ctx.lineTo(bx + ox + 4, bottom - 18);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}
