// ===== Pčelica - pokretanje (učitava se zadnje, nakon svih ostalih skripti) =====
// init a menu-state preview
function initMenuPreview() {
  waterY = H * (1 - WATER_HEIGHT_RATIO);
  bee = { x: W*BEE_X_RATIO, y: H*0.4, vy: 0, r: 16 };
  flowers = []; clouds = []; particles = []; birds = []; fishermen = []; wasps = [];
  scrollX = 0;
  initTerrain();
  ensureTerrainAhead();
  for (let i = 0; i < 6; i++) spawnFlower(i*180+100);
  for (let i = 0; i < 4; i++) spawnCloud(Math.random()*W);
  for (let i = 0; i < 2; i++) spawnBird(W*0.6 + i*400);
  spawnFisherman(W*0.8);
  terrain[0].fishermanSpawned = true;
}

initMenuPreview();
initRain();
requestAnimationFrame(loop);
