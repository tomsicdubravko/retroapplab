/* Bot chooses a target only. checkHit and resolveShot remain the sole hit/score path. */
var gameMode='local',botDifficulty='medium',botAim=null,botActing=false,botTimer=null,botPendingTurn=false;
function isBotTurn(){return gameMode==='bot'&&currentPlayer===1;}
function makeBotTarget(positions,difficulty){
  var cup=positions[Math.floor(Math.random()*positions.length)];
  if(!cup)return null;
  var spread={easy:2.6,medium:1.45,hard:1.1}[difficulty]||1.45;
  var radius=Math.sqrt(Math.random())*cup.r*spread,angle=Math.random()*Math.PI*2;
  return {x:Math.max(0,Math.min(1,cup.fx+Math.cos(angle)*radius)),y:Math.max(0,Math.min(.55,cup.fy+Math.sin(angle)*radius)),cup:cup.i};
}
function runBotAction(action){botActing=true;try{action();}finally{botActing=false;}}
function onTurnReady(){
  if(gameMode!=='bot')return;
  if(!isBotTurn()){phaseLabel.textContent=getNames()[0].toUpperCase()+', TVOJ RED!';return;}
  if(phase!=='idle'||botAim||shot)return;
  runBotAction(startThrow);
  if(phase!=='moving-x')return;
  var target=makeBotTarget(TOP_CUP_POSITIONS,botDifficulty);
  if(!target)return;
  botAim={target:target,axis:'x',started:performance.now()};
  stopBtn.style.display='none';throwBtn.style.display='none';phaseLabel.textContent='RAČUNALO CILJA X OS...';requestFrame();
}
function updateBotAim(now){
  var aim=botAim,t=Math.min(1,(now-aim.started)/(aim.axis==='x'?700:650)),ease=t*t*(3-2*t);
  if(aim.axis==='x')posX=aim.target.x*ease+Math.sin(t*Math.PI)*.12;
  else posY=aim.target.y*ease+Math.sin(t*Math.PI)*.06;
  if(t<1)return;
  if(aim.axis==='x'){posX=aim.target.x;runBotAction(stopLine);aim.axis='y';aim.started=now;phaseLabel.textContent='RAČUNALO CILJA Y OS...';}
  else{posY=aim.target.y;botAim=null;runBotAction(stopLine);}
}
function advanceBotGame(){
  botTimer=null;
  if(gameMode!=='bot'||phase!=='done'||shot||cups[0].length===0||cups[1].length===0)return;
  if(document.hidden){botPendingTurn=true;return;}
  botPendingTurn=false;nextTurn();if(phase==='turning')phaseLabel.textContent=isBotTurn()?'RAČUNALO JE NA POTEZU':'TVOJ POTEZ...';
}
function onShotResolved(s){
  if(gameMode!=='bot')return;
  clearTimeout(botTimer);botTimer=null;botPendingTurn=false;
  // Human hits wait for BACAJ PONOVNO; bot hits repeat automatically after a pause.
  if(s.player===0&&s.hit)return;
  nextBtn.style.display='none';
  if(s.player===1&&s.hit)phaseLabel.textContent=getNames()[0]+' pije! RAČUNALO BACA PONOVNO...';
  else phaseLabel.textContent=s.player===1?'TVOJ POTEZ SLIJEDI':'RAČUNALO JE SLJEDEĆE';
  botTimer=setTimeout(advanceBotGame,1400);
}
function clearBotTurn(){clearTimeout(botTimer);botTimer=null;botAim=null;botPendingTurn=false;botActing=false;}
var botBaseStart=startGame,botBaseRestart=restartGame,botBaseWin=showWin,botBaseError=show3DError;
window.startGame=function(){clearBotTurn();botBaseStart();};
window.restartGame=function(){clearBotTurn();botBaseRestart();};
window.showWin=function(name){clearBotTurn();botBaseWin(name);};
window.show3DError=function(){clearBotTurn();botBaseError();};
document.addEventListener('visibilitychange',function(){if(!document.hidden&&botPendingTurn){clearTimeout(botTimer);botTimer=setTimeout(advanceBotGame,250);}});
window.addEventListener('pagehide',clearBotTurn);
