// ===== Košarka 2 na 2 - pokretanje: gradnja scene i glavna petlja (učitava se zadnje) =====
'use strict';
buildArena(); buildAmbience(); buildHoop(); resize(); setupCheck(0); game.mode='menu';
if(document.fonts&&document.fonts.ready) document.fonts.ready.then(()=>fontJobs.forEach(f=>f()));

let last=performance.now(), time=0;
function frame(now){
  requestAnimationFrame(frame);
  const dt=Math.min(0.033,(now-last)/1000); last=now; time+=dt;
  readKeys();
  if(game.remote){ sendGuestInput(); remoteFrame(dt); animate(dt,time); updateCamera(dt); updateHUD(dt); updateHype(dt); renderer.render(scene,camera); clearEdges(); return; }
  if(game.mode==='trice'){ Trice.frame(dt,time); renderer.render(scene,camera); clearEdges(); return; }
  locTick();
  // usporena snimka kod velikih trenutaka
  // zadnjih 0.3 s vrijeme se glatko vraća na normalnu brzinu
  let sdt=dt; if(!game.paused&&slowT>0){ slowT-=dt; const r=clamp(slowT/0.3,0,1); sdt=dt*(1+(slowF-1)*r); if(slowT<=0) slowF=0.3; }
  if(!game.paused){
    if(game.mode==='play') step(sdt);
    else if(game.mode==='dead') deadStep(sdt);
    else if(game.mode==='menu'){ updateBall(dt,false); }
  }
  if(game.mp&&mpn.host) hostSend();
  animate(game.paused?0:sdt,time); updateCamera(dt); updateHUD(dt); updateHype(dt);
  renderer.render(scene,camera);
  clearEdges();
}
requestAnimationFrame(frame);
