// ===== Pčelica - vizualni signali umjesto poruka: upozorenje na napad, ikone power-upova =====
// Tijekom igre nema teksta. Napad (od protivnika, ili solo zamka) najprije 1,5 s treperi kao znak iznad pčelice
// uz crveni rub ekrana, tek onda se primijeni. Ako u tom trenutku pčelica ima štit, znak "pukne" o štit i napad propadne
// (osim cvijeta smrti - njega štit ne zaustavlja). Vlastiti power-upovi kratko iskoče kao ikona iznad pčelice.
const ATTACK_WARN_TIME = 1.5;
const ICON_POP_TIME = 0.6;
const SHIELD_POP_TIME = 0.5;
const ATTACK_ICONS = { invert: '🌀', heavy: '🧲', fog: '🌫️', redbird: '🐦', vortex: '🌊', deathflower: '💀' };
let incomingAttacks = [];   // { kind, t, apply, onBlocked, unblockable }
let iconPops = [];          // { icon, t, dur, big }
let shieldPops = [];        // { icon, t } - znak napada koji se razbio o štit

function resetSignals() {
  incomingAttacks = [];
  iconPops = [];
  shieldPops = [];
}

// ikona napada (u svemiru su obrnute komande teške čizme - world6.js)
function attackIcon(kind) {
  if (kind === 'invert' && worldTheme === 'space') return ATTACK_ICONS.heavy;
  return ATTACK_ICONS[kind] || '❗';
}

// napad stiže: upozorenje, pa nakon 1,5 s apply() ili (sa štitom) onBlocked()
function queueAttack(kind, apply, onBlocked, unblockable) {
  incomingAttacks.push({ kind: kind, t: 0, apply: apply, onBlocked: onBlocked, unblockable: !!unblockable });
  triggerShake(2, 0.15);
}

// ikona iznad pčelice (power-up, poslani napad, ishod napada na protivnika)
function popIcon(icon, big) {
  // ista ikona dvaput zaredom ne treba dva puta iskočiti
  for (const p of iconPops) if (p.icon === icon && p.t < 0.15) return;
  iconPops.push({ icon: icon, t: 0, dur: ICON_POP_TIME, big: !!big });
}

// štit je upio napad: ikona pukne o mjehurić štita, bljesak i iskrice; štit se potroši
function blockWithShield(icon) {
  shieldActive = false;
  shieldTimeLeft = 0;
  shieldBadge.classList.add('hidden');
  triggerShake(3, 0.15);
  shieldPops.push({ icon: icon, t: 0 });
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2;
    particles.push({
      x: bee.x + Math.cos(a) * 24, y: bee.y + Math.sin(a) * 24,
      vx: Math.cos(a) * (160 + Math.random() * 120), vy: Math.sin(a) * (160 + Math.random() * 120) - 30,
      life: 0.5, age: 0, color: i % 2 === 0 ? '#ffd452' : '#ffffff'
    });
  }
}

// poziva se iz core.js update() dok se normalno igra (u bonus sobi i prijelazima svjetova upozorenja čekaju)
function updateSignals(dt) {
  for (const a of incomingAttacks) a.t += dt;
  const due = incomingAttacks.filter(a => a.t >= ATTACK_WARN_TIME);
  if (!due.length) return;
  incomingAttacks = incomingAttacks.filter(a => a.t < ATTACK_WARN_TIME);
  for (const a of due) {
    if (gameState !== 'playing') continue;
    if (shieldActive && !a.unblockable) {
      blockWithShield(attackIcon(a.kind));
      if (a.onBlocked) a.onBlocked();
    } else {
      a.apply();
    }
  }
}

// poziva se iz core.js loop() - animacije ikona teku i kad igra stoji
function ageSignals(dt) {
  for (const p of iconPops) p.t += dt;
  iconPops = iconPops.filter(p => p.t < p.dur);
  for (const p of shieldPops) p.t += dt;
  shieldPops = shieldPops.filter(p => p.t < SHIELD_POP_TIME);
}

// mjesto znakova: iznad i malo iza pčelice, da ne prekrivaju prepreke ispred nje
function signalAnchor() {
  return { x: Math.max(34, bee.x - 26), y: Math.max(40, bee.y - 64) };
}

function drawEmoji(icon, x, y, size) {
  ctx.font = Math.round(size) + 'px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(icon, x, y);
}

// poziva se iz core.js draw() iznad scene
function drawSignals() {
  if (!bee || (gameState !== 'playing' && gameState !== 'dying')) return;
  const anchor = signalAnchor();
  ctx.save();

  // crveni rubovi ekrana dok napad dolazi (za vrijeme prijelaza svjetova i bonus sobe upozorenje čeka skriveno)
  const paused = portalSeq || sleepSeq || inBonus || bonusEntering;
  if (incomingAttacks.length && !paused) {
    const pulse = 0.5 + 0.5 * Math.sin(waveT * 10);
    const vg = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.75);
    vg.addColorStop(0, 'rgba(220,30,30,0)');
    vg.addColorStop(1, 'rgba(220,30,30,' + (0.22 + 0.2 * pulse) + ')');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, W, H);

    // znak upozorenja (više napada odjednom - jedan pored drugog)
    incomingAttacks.forEach((a, i) => {
      const x = anchor.x, y = Math.max(34, anchor.y - i * 56);
      const blinkOn = Math.floor(a.t * 8) % 2 === 0;
      const s = 1 + 0.12 * Math.sin(a.t * 14);
      const appear = Math.min(1, a.t / 0.12);
      ctx.globalAlpha = (blinkOn ? 1 : 0.6) * appear;
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(s * (0.6 + 0.4 * appear), s * (0.6 + 0.4 * appear));
      ctx.shadowColor = 'rgba(0,0,0,0.4)';
      ctx.shadowBlur = 8;
      // crveni krug s bijelim rubom - na crvenom se vidi i svijetla ikona magle
      const rg = ctx.createRadialGradient(-6, -8, 2, 0, 0, 23);
      rg.addColorStop(0, '#ff7a7a');
      rg.addColorStop(1, '#c81e1e');
      ctx.fillStyle = rg;
      ctx.beginPath(); ctx.arc(0, 0, 23, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4;
      ctx.stroke();
      drawEmoji(attackIcon(a.kind), 0, 1, 24);
      // mali bijeli znak s crvenim "!" gore desno
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(17, -17, 10, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#c81e1e';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#c81e1e';
      ctx.font = 'bold 15px Trebuchet MS, sans-serif';
      ctx.fillText('!', 17, -16);
      // vrijeme do udara: crveni luk koji se zatvara
      ctx.strokeStyle = 'rgba(200,30,30,0.9)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 29, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, a.t / ATTACK_WARN_TIME));
      ctx.stroke();
      ctx.restore();
    });
    ctx.globalAlpha = 1;
  }

  // znak napada koji puca o štit: naraste, rasprsne se, bljesak
  for (const p of shieldPops) {
    const k = p.t / SHIELD_POP_TIME;
    ctx.globalAlpha = Math.max(0, 0.7 * (1 - k * 2.5));
    ctx.fillStyle = '#fff6c8';
    ctx.beginPath(); ctx.arc(bee.x, bee.y, 26 + k * 40, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = Math.max(0, 1 - k);
    ctx.save();
    ctx.translate(anchor.x + (bee.x - anchor.x) * Math.min(1, k * 4), anchor.y + (bee.y - 30 - anchor.y) * Math.min(1, k * 4));
    ctx.rotate(k * 1.5);
    drawEmoji(p.icon, 0, 0, 26 * (1 + k * 0.8));
    // pukotine
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    for (let i = 0; i < 6; i++) {
      const a = i * Math.PI / 3;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * 14, Math.sin(a) * 14);
      ctx.lineTo(Math.cos(a) * (18 + k * 30), Math.sin(a) * (18 + k * 30));
      ctx.stroke();
    }
    ctx.restore();
    // štit bljesne
    ctx.strokeStyle = 'rgba(255,212,82,' + Math.max(0, 1 - k) + ')';
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(bee.x, bee.y, 26 + k * 18, 0, Math.PI * 2); ctx.stroke();
  }

  // ikone power-upova: iskoče, porastu i izblijede
  iconPops.forEach((p, i) => {
    const k = p.t / p.dur;
    const grow = k < 0.25 ? k / 0.25 : 1;
    const size = (p.big ? 40 : 32) * (0.5 + 0.5 * grow + k * 0.35);
    ctx.globalAlpha = k < 0.55 ? 1 : Math.max(0, 1 - (k - 0.55) / 0.45);
    ctx.shadowColor = 'rgba(0,0,0,0.35)';
    ctx.shadowBlur = 6;
    drawEmoji(p.icon, Math.max(22, anchor.x - i * 36), anchor.y + 6 - k * 22, size);
    ctx.shadowBlur = 0;
  });
  ctx.restore();
}
