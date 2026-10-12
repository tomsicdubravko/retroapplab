/* Lobby presentation reuses the existing renderer and models without game state. */
(function(){
  var preview=document.getElementById('bp-preview'),stage=document.getElementById('table'),slot=document.getElementById('bp-game-stage-slot'),modes=document.getElementById('mode-selection'),form=document.getElementById('local-settings');
  function showModes(){document.querySelector('.bp-intro-sub').textContent='Šest čaša. Dva igrača. Jedan pobjednik.';document.body.classList.add("bp-lobby");document.getElementById("setup-screen").style.removeProperty("display");modes.hidden=false;form.hidden=true;document.getElementById('online-settings').hidden=true;preview.hidden=false;stage.classList.add('bp-preview-stage');preview.appendChild(stage);if(init3D()){resize3D();}else{stage.hidden=true;preview.querySelector('.bp-preview-fallback').hidden=false;}}
  var launchLocal=startGame,resetLocal=restartGame;
  window.startGame=function(){document.body.classList.remove("bp-lobby");stage.hidden=false;stage.classList.remove('bp-preview-stage');slot.appendChild(stage);launchLocal();if(gameMode==='bot'){p2Name='Računalo';document.getElementById('p2-bar-name').textContent=p2Name;updateUI();}};
  window.restartGame=function(){resetLocal();showModes();};
  // Additional modes can be enabled here when their gameplay is implemented.
  function chooseMode(mode){gameMode=mode;modes.hidden=true;form.hidden=false;preview.hidden=true;document.getElementById('bp-mode-title').textContent=mode==='bot'?'PROTIV RAČUNALA':'LOKALNO · 1 NA 1';document.getElementById('bp-second-player').hidden=mode==='bot';document.getElementById('bp-difficulty').hidden=mode!=='bot';}
  var modeHandlers={local:function(){chooseMode('local');},bot:function(){chooseMode('bot');},online:function(){gameMode='online';modes.hidden=true;form.hidden=true;preview.hidden=true;document.getElementById('online-settings').hidden=false;}};
  window.beerPongLobby={showModes:showModes};
  document.querySelectorAll('.bp-mode[data-mode]').forEach(function(button){button.addEventListener('click',function(){var handler=modeHandlers[button.dataset.mode];if(!button.disabled&&handler)handler();});});
  document.getElementById('bp-change-mode').addEventListener('click',showModes);
  form.addEventListener('submit',function(event){event.preventDefault();botDifficulty=form.querySelector('input[name="difficulty"]:checked').value;startGame();});
  showModes();
})();
