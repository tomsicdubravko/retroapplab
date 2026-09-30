// ===== Košarka 2 na 2 - način: solo trening =====
'use strict';
// ---------- flow ----------
function setSolo(on){
  game.solo=on; document.body.classList.toggle('solo',on);
  players.forEach(p=>{ p.active=on?p===teams[0][0]:true; });
}
function startSolo(){
  audio(); setSolo(true); game.paused=false; D=DIFFS[game.diffIdx]; game.soloMade=0; game.soloShots=0; game.score=[0,0];
  ['menu','over','pauseOv','tOver'].forEach(id=>$(id).classList.add('hidden'));
  if(isTouch) $('touch').style.display='block';
  setupCheck(0); flash(T('solo.naslov'),T('solo.pod'),1.4);
}
