// ===== Košarka 2 na 2 - način: brza igra 2 na 2, izbornik, pauza =====
'use strict';
// naslov izbornika iz IME_IGRE
{ const h=$('menuNaslov'), em=document.createElement('em'); h.textContent=IME_IGRE; em.textContent=T('splash.podnaslov'); h.appendChild(em); }
// brza igra: JAY + DRE protiv SARA + KAI na krovu, težina i bodovi iz izbornika
function brzaIgra(){ const R=TOUR[2];
  return {plavi:mojaEkipa(), crveni:R.pl.map(P=>opisIgraca(P,false)), boje:{crveni:R.col}, teren:'krov',
    doBodova:game.target, tezina:game.diffIdx, kraj:krajBrzeIgre}; }
function startGame(){
  if(tour.active){ tour.active=false; game.diffIdx=tour.menuDiff; game.target=tour.menuTarget; resetLook(); }
  Utakmica.pokreni(brzaIgra());
}
function krajBrzeIgre(r){
  if(game.mp) $('overCards').innerHTML=''; else renderCards($('overCards'));
  const win=r.pobjeda;
  $('overTitle').textContent=T(win?'opce.pobjeda':'opce.poraz');
  $('overTitle').style.color=win?'var(--amber)':'var(--muted)';
  $('overScore').textContent=r.bodovi[0]+' : '+r.bodovi[1];
  $('over').classList.remove('hidden'); $('touch').style.display='none';
  if(win){ crowd('jump',3); sfx.cheer(); } else sfx.buzzer();
}
function toMenu(){ endLocal(); closeLocal(); if(game.mp||mpn.peer) mpReset(); if(game.mode==='trice') Trice.exit(); if(tour.active){ tour.active=false; game.diffIdx=tour.menuDiff; game.target=tour.menuTarget; resetLook(); } Utakmica.vratiIzbornik(); $('tourOv').classList.add('hidden'); setSolo(false); game.mode='menu'; game.paused=false; setupCheck(0); game.mode='menu'; $('tOver').classList.add('hidden');
  $('pauseOv').classList.add('hidden'); $('over').classList.add('hidden'); $('menu').classList.remove('hidden'); $('touch').style.display='none'; }
function togglePause(){ if(game.mp) return; game.paused=!game.paused; if(game.mode==='trice'&&game.paused) Trice.unpress(); $('pauseOv').classList.toggle('hidden',!game.paused); }
function seg(id,cb){ const el=$(id); el.addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b)return; el.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b)); cb(b.dataset.v); }); }
seg('segDiff',v=>game.diffIdx=+v);
seg('segTarget',v=>game.target=+v);
$('startBtn').onclick=startGame; $('againBtn').onclick=()=>{ if(game.mp&&mpn.host) mpStart(); else startGame(); }; $('menuBtn').onclick=toMenu;
$('resumeBtn').onclick=togglePause; $('quitBtn').onclick=toMenu;
$('pauseBtn').onclick=()=>{ if(game.mode==='play'||game.mode==='dead'||game.mode==='trice') togglePause(); };
$('soloBtn').onclick=startSolo; $('triceBtn').onclick=()=>Trening.pokreni({vrsta:'trice',tezina:game.diffIdx});
$('tAgain').onclick=()=>Trening.ponovi(); $('tMenuBtn').onclick=toMenu;
$('muteBtn').onclick=()=>{ muted=!muted; $('muteBtn').textContent=muted?'🔇':'🔊'; audio(); };
