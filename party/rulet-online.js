// Online Rulet: the host owns spins, choices, gambling and scores.
var onlineMode=false, isHost=false, myPeerId='', peer=null, hostConn=null, clientConns=[];
var onlineState=null, onlineVersion=-1, onlineEpoch=0, offerTimeout=null, flashTimer=null;
// Clock samples affect presentation only; the host still resolves every outcome.
var ruletClockOffset=0,ruletClockBest=Infinity,ruletClockSamples={},ruletClockSerial=0;
function sampleRuletClock(){
  if(!onlineMode||isHost||!hostConn||!hostConn.open)return;
  var id=++ruletClockSerial;ruletClockSamples[id]={wall:Date.now(),mono:performance.now()};
  sendOnline(hostConn,{type:'visualClock',id:id});
}
function receiveRuletClock(data){
  var sample=ruletClockSamples[data.id];if(!sample)return;delete ruletClockSamples[data.id];
  var rtt=performance.now()-sample.mono;
  if(rtt<ruletClockBest){ruletClockBest=rtt;ruletClockOffset=data.hostNow-(sample.wall+rtt/2);}
}
function ruletAnimationStart(plan){
  return Number.isFinite(plan.visualStart)?performance.now()+plan.visualStart-(Date.now()+(isHost?0:ruletClockOffset)):performance.now();
}
var localSpin=spin, localChooseDrink=chooseDrink, localStartGamble=startGamble;
var localSpinGamble=spinGamble, localStartBots=startBots, localGoSetup=goSetup, localShowScreen=showScreen;

document.getElementById('online-name').value=sessionStorage.getItem('playerName')||'';
function onlineIdentity(){
  return {name:document.getElementById('online-name').value.trim(),drink:document.getElementById('online-drink').value.trim()||'Piće'};
}
function onlineError(message){document.getElementById('online-err').textContent=message;}
function sendOnline(conn,data){if(conn&&conn.open)conn.send(data);}
function clearOnline(){
  ruletClockOffset=0;ruletClockBest=Infinity;ruletClockSamples={};
  onlineEpoch++; clearTimeout(offerTimeout); offerTimeout=null;
  clearInterval(gambleTimerInterval); clearInterval(flashTimer);
  document.getElementById('drink-flash').style.display='none';
  document.getElementById('choose-screen').classList.remove('show');
  document.getElementById('gamble-screen').style.display='none';
  onlineMode=false;
  if(peer)peer.destroy();
  peer=null; hostConn=null; clientConns=[]; onlineState=null; onlineVersion=-1;
  spinning=false; gambleSpinning=false;
}
function leaveOnline(){
  clearOnline(); isHost=false;
  document.getElementById('lobby-wrap').style.display='none';
  document.getElementById('online-actions').style.display='block';
  document.getElementById('online-wheel-status').style.display='none';
  document.getElementById('wheel-back-btn').textContent='← Izlaz';
  initPlayers(); resetResult(); localShowScreen('mode-screen');
}
showScreen=function(id){
  if(id==='setup-screen'&&onlineMode)leaveOnline();
  localShowScreen(id);
};
startBots=function(){if(onlineMode)leaveOnline();localStartBots();};
goSetup=function(){if(onlineMode)leaveOnline();else localGoSetup();};
function prepareOnline(host){
  clearOnline(); onlineMode=true; isHost=host;
  resetPartyResultsTracking(); sips={}; onlineError('');
  document.getElementById('lobby-wrap').style.display='block';
  document.getElementById('online-actions').style.display='none';
  document.getElementById('host-start-online-btn').style.display='none';
  document.getElementById('lobby-status').textContent='Spajanje...';
}
function initRuletPeer(callback,attempt){
  attempt=attempt||0;
  if(peer)peer.destroy();
  var current=peer=isHost?new Peer('party-rulet-'+generateRoomCode().toLowerCase()):new Peer();
  current.on('open',function(id){if(peer!==current)return;myPeerId=id;callback(id);});
  current.on('error',function(e){
    if(peer!==current)return;
    if(isHost&&e.type==='unavailable-id'&&attempt<4){initRuletPeer(callback,attempt+1);return;}
    document.getElementById('online-actions').style.display='block';
    onlineError(e.type==='peer-unavailable'?'Soba ne postoji. Provjeri kod.':'Greška veze: '+e.type);
  });
  current.on('disconnected',function(){if(onlineMode&&peer===current){document.getElementById('online-wheel-status').textContent='Veza sa sobom je prekinuta.';}});
}
function createRoom(){
  var identity=onlineIdentity(); if(!identity.name){onlineError('Upiši ime!');return;}
  prepareOnline(true);
  initRuletPeer(function(id){
    onlineState={players:[{id:id,name:identity.name,drink:identity.drink,color:COLORS[0],connected:true}],sips:{},round:1,angle:0,phase:'lobby',result:null,version:0,code:id.slice(-6).toUpperCase()};
    peer.on('connection',function(conn){
      conn.on('data',function(data){handleRuletHost(conn,data);});
      conn.on('open',function(){clientConns.push(conn);});
      conn.on('close',function(){
        clientConns=clientConns.filter(function(c){return c!==conn;});
        if(!onlineMode||!isHost||!onlineState||!conn.playerId)return;
        if(onlineState.phase==='lobby')onlineState.players=onlineState.players.filter(function(p){return p.id!==conn.playerId;});
        else{
          var p=onlineState.players.find(function(p){return p.id===conn.playerId;});if(p)p.connected=false;
          if(onlineState.phase==='choosing'&&onlineState.players[onlineState.result.playerIdx].id===conn.playerId){onlineState.phase='ready';onlineState.result.desc=p.name+' je napustio sobu.';}
          if(onlineState.phase==='offer'&&onlineState.players[onlineState.result.playerIdx].id===conn.playerId){clearTimeout(offerTimeout);onlineState.phase='ready';}
        }
        publishRulet();
      });
    });
    publishRulet();
  });
}
function joinRoom(){
  var identity=onlineIdentity(),code=document.getElementById('room-inp').value.trim().toLowerCase();
  if(!identity.name){onlineError('Upiši ime!');return;}
  if(!/^[a-hj-np-z2-9]{6}$/i.test(code)){onlineError('Upiši kod sobe od 6 znakova.');return;}
  prepareOnline(false);
  initRuletPeer(function(){
    hostConn=peer.connect('party-rulet-'+code,{reliable:true});
    hostConn.on('open',function(){sendOnline(hostConn,{type:'join',name:identity.name,drink:identity.drink});sampleRuletClock();var epoch=onlineEpoch;[200,500].forEach(function(delay){setTimeout(function(){if(onlineMode&&epoch===onlineEpoch)sampleRuletClock();},delay);});});
    hostConn.on('data',function(data){
      if(data.type==='reject'){onlineError(data.message);document.getElementById('online-actions').style.display='block';return;}
      if(data.type==='visualClock')receiveRuletClock(data);
      if(data.type==='state')applyRuletState(data.state,data.alerts||[]);
      if(data.type==='spin')animateRulet(data.spin);
      if(data.type==='gamble')animateOnlineGamble(data.gamble);
    });
    hostConn.on('close',function(){
      if(!onlineMode)return;
      onlineEpoch++;spinning=false;gambleSpinning=false;
      clearTimeout(offerTimeout);clearInterval(gambleTimerInterval);
      document.getElementById('spin-btn').disabled=true;
      document.getElementById('gamble-btn').style.display='none';
      document.getElementById('gamble-screen').style.display='none';
      document.getElementById('choose-screen').classList.remove('show');
      document.getElementById('online-actions').style.display='block';
      document.getElementById('online-wheel-status').textContent='Host je napustio sobu. Vrati se i kreiraj novu.';
      onlineError('Host je napustio sobu.');
    });
  });
}
function handleRuletHost(conn,data){
  if(!onlineMode||!isHost||!onlineState||!data)return;
  if(data.type==='visualClock'){sendOnline(conn,{type:'visualClock',id:data.id,hostNow:Date.now()});return;}
  if(data.type==='join'){
    if(conn.playerId)return;
    var name=String(data.name||'').trim().slice(0,16);
    var reason=onlineState.phase!=='lobby'?'Igra je već počela.':onlineState.players.length>=8?'Soba je puna.':!name?'Upiši ime.':onlineState.players.some(function(p){return p.name.toLowerCase()===name.toLowerCase();})?'To ime je zauzeto. Odaberi drugo.':'';
    if(reason){sendOnline(conn,{type:'reject',message:reason});return;}
    conn.playerId=conn.peer;
    onlineState.players.push({id:conn.peer,name:name,drink:String(data.drink||'Piće').slice(0,10),color:COLORS[onlineState.players.length],connected:true});
    publishRulet();
  }
  if(data.type==='choose'&&conn.playerId)chooseOnlineDrink(conn.playerId,data.targetId);
  if(data.type==='gambleRequest'&&conn.playerId)beginOnlineGamble(conn.playerId);
}
function publishRulet(alerts){
  if(!onlineMode||!isHost||!onlineState)return;
  onlineState.version++;
  clientConns.forEach(function(c){if(c.playerId)sendOnline(c,{type:'state',state:onlineState,alerts:alerts||[]});});
  applyRuletState(onlineState,alerts||[]);
}
function applyRuletState(state,alerts){
  if(!onlineMode||state.version<=onlineVersion)return;
  onlineVersion=state.version; onlineState=state;
  players=state.players;sips=state.sips;round=state.round;currentAngle=state.angle;
  document.getElementById('room-code-display').textContent=state.code;
  var lobby=document.getElementById('lobby-list');lobby.innerHTML='';
  players.forEach(function(p){var row=document.createElement('div');row.className='player-row';row.style.color=p.color;row.textContent=p.name+' • '+p.drink+(p.id===players[0].id?' • HOST':'')+(!p.connected?' • odsutan':'');lobby.appendChild(row);});
  document.getElementById('lobby-status').textContent='Igrači: '+players.length+'/8'+(!isHost?' • Čekamo hosta':'');
  var start=document.getElementById('host-start-online-btn');start.style.display=isHost?'block':'none';start.disabled=players.length<2;
  if(state.phase==='lobby'){localShowScreen('online-screen');return;}
  localShowScreen('wheel-screen');
  document.getElementById('wheel-back-btn').textContent='← Izlaz';
  document.getElementById('round-info').textContent='RUNDA '+round+' • '+state.code;
  var status=document.getElementById('online-wheel-status');status.style.display='block';
  status.textContent=state.phase==='spinning'?'Kotač se vrti…':state.phase==='choosing'?players[state.result.playerIdx].name+' bira tko pije.':state.phase==='offer'?'Čekamo odluku: '+players[state.result.playerIdx].name:state.phase==='gambling'?'Zlatni gutljaj se vrti…':isHost?'Ti vrtiš kotač.':'Host vrti kotač.';
  document.getElementById('spin-btn').disabled=!isHost||state.phase!=='ready'||players.filter(function(p){return p.connected;}).length<2;
  if(state.phase!=='spinning'){if(spinning)onlineEpoch++;spinning=false;drawWheel(state.result);}
  if(state.result){
    document.getElementById('result-name').style.color=state.result.type==='big'?players[state.result.playerIdx].color:'#f1c40f';
    document.getElementById('result-name').textContent=state.result.title;
    document.getElementById('result-desc').textContent=state.result.desc;
  }else resetResult();
  renderSipsLocal();
  document.getElementById('choose-screen').classList.remove('show');
  if(state.phase==='choosing'&&players[state.result.playerIdx].id===myPeerId)showChooseScreen(state.result.playerIdx);
  clearInterval(gambleTimerInterval);
  document.getElementById('gamble-btn').style.display='none';document.getElementById('gamble-timer').style.display='none';
  if(state.phase==='offer'&&players[state.result.playerIdx].id===myPeerId){
    document.getElementById('gamble-btn').style.display='inline-block';
    var timer=document.getElementById('gamble-timer');timer.style.display='block';
    var update=function(){timer.textContent='Nestaje za '+Math.max(0,Math.ceil((state.offerEnds-(Date.now()+(isHost?0:ruletClockOffset)))/1000))+'s...';};update();gambleTimerInterval=setInterval(update,250);
  }
  if(state.phase!=='gambling'){
    gambleSpinning=false;
    if(state.gambleResult&&state.gambleResult.playerId===myPeerId){
      document.getElementById('gamble-result').textContent=state.gambleResult.saved?'🎉 SPAŠEN! Ne piješ!':'💀 PIJEŠ DUPLO!';
      document.getElementById('gamble-result').style.color=state.gambleResult.saved?'#2ecc71':'#e74c3c';
      document.getElementById('gamble-spin-btn').style.display='none';document.getElementById('gamble-close-btn').style.display='inline-block';
    }else document.getElementById('gamble-screen').style.display='none';
  }
  alerts.forEach(function(a){if(a.id===myPeerId)triggerDrinkFlash(a.message,a.color);});
}
function hostStartOnline(){
  if(!isHost||!onlineState||onlineState.phase!=='lobby'||players.length<2)return;
  onlineState.phase='ready';players.forEach(function(p){onlineState.sips[p.name]=0;});publishRulet();
}
spin=function(){
  if(!onlineMode){localSpin();return;}
  if(!isHost||onlineState.phase!=='ready'||players.filter(function(p){return p.connected;}).length<2)return;
  onlineState.players=onlineState.players.filter(function(p){return p.connected;});
  players=onlineState.players;
  var plan={angle:onlineState.angle,rotation:(6+Math.random()*5)*2*Math.PI+Math.random()*2*Math.PI,duration:4500+Math.random()*1500,visualStart:Date.now()+150};
  onlineState.phase='spinning';onlineState.result=null;onlineState.gambleResult=null;publishRulet();
  clientConns.forEach(function(c){if(c.playerId)sendOnline(c,{type:'spin',spin:plan});});animateRulet(plan);
};
function animateRulet(plan){
  if(!onlineMode)return;
  var epoch=++onlineEpoch,start=ruletAnimationStart(plan),lastAngle=plan.angle;
  spinning=true;resetResult();try{sndSpinStart();}catch(e){}
  function frame(now){
    if(!onlineMode||epoch!==onlineEpoch)return;
    var t=Math.max(0,Math.min((now-start)/plan.duration,1));currentAngle=plan.angle+plan.rotation*(1-Math.pow(1-t,3));drawWheel();
    ruletTickBetween(lastAngle,currentAngle,1-t,false);lastAngle=currentAngle;
    if(t<1)requestAnimationFrame(frame);
    else{spinning=false;try{sndStop();}catch(e){}if(isHost)finishOnlineSpin();}
  }requestAnimationFrame(frame);
}
function finishOnlineSpin(){
  if(!isHost||onlineState.phase!=='spinning')return;
  var seg=getWinnerSeg(),p=players[seg.playerIdx],alerts=[];
  onlineState.angle=currentAngle;onlineState.round++;onlineState.result={playerIdx:seg.playerIdx,type:seg.type,title:'',desc:''};
  var result=onlineState.result;
  if(seg.type==='big'){
    sips[p.name]=(sips[p.name]||0)+1;result.title=p.name.toUpperCase()+' PIJE!';result.desc=p.drink+' 🍺';
    alerts.push({id:p.id,message:'TI PIJEŠ! 🍺\n'+p.name,color:'#e74c3c'});
    onlineState.phase=p.connected?'offer':'ready';onlineState.offerEnds=Date.now()+8000;
    clearTimeout(offerTimeout);offerTimeout=setTimeout(function(){if(onlineMode&&isHost&&onlineState.phase==='offer'){onlineState.phase='ready';publishRulet();}},8000);
  }else if(seg.type==='small'){
    result.title='★ '+p.name.toUpperCase();result.desc='Bira tko pije!';onlineState.phase=p.connected?'choosing':'ready';
    alerts.push({id:p.id,message:'TI BIRAŠ TKO PIJE! ★\n'+p.name,color:'#c8a84b'});
  }else{
    result.title='💀 '+p.name.toUpperCase();result.desc='Svi piju osim '+p.name+'! 🍺';onlineState.phase='ready';
    players.forEach(function(pl,i){if(i!==seg.playerIdx){sips[pl.name]=(sips[pl.name]||0)+1;alerts.push({id:pl.id,message:'TI PIJEŠ! 🍺\nSvi osim '+p.name,color:'#e74c3c'});}});
    alerts.push({id:p.id,message:'SPAŠEN SI! 💀\nSvi ostali piju!',color:'#c8a84b'});
  }
  publishRulet(alerts);
}
chooseDrink=function(index){
  if(!onlineMode){localChooseDrink(index);return;}
  if(!players[index])return;
  if(isHost)chooseOnlineDrink(myPeerId,players[index].id);
  else sendOnline(hostConn,{type:'choose',targetId:players[index].id});
};
function chooseOnlineDrink(chooserId,targetId){
  if(!isHost||onlineState.phase!=='choosing'||players[onlineState.result.playerIdx].id!==chooserId)return;
  var target=players.find(function(p){return p.id===targetId&&p.connected;});if(!target)return;
  sips[target.name]=(sips[target.name]||0)+1;onlineState.result.desc=target.name+' pije! 🍺';onlineState.phase='ready';
  publishRulet([{id:target.id,message:'TI PIJEŠ! 🍺\n'+target.name,color:'#e74c3c'}]);
}
startGamble=function(){
  if(!onlineMode){localStartGamble();return;}
  if(isHost)beginOnlineGamble(myPeerId);else sendOnline(hostConn,{type:'gambleRequest'});
};
function beginOnlineGamble(id){
  if(!isHost||onlineState.phase!=='offer'||players[onlineState.result.playerIdx].id!==id||Date.now()>onlineState.offerEnds)return;
  clearTimeout(offerTimeout);onlineState.phase='gambling';
  var plan={playerId:id,rotation:(5+Math.random()*5)*2*Math.PI+Math.random()*2*Math.PI,duration:2500+Math.random()*1000,visualStart:Date.now()+150};
  publishRulet();clientConns.forEach(function(c){if(c.playerId)sendOnline(c,{type:'gamble',gamble:plan});});animateOnlineGamble(plan);
}
function animateOnlineGamble(plan){
  var epoch=onlineEpoch,start=ruletAnimationStart(plan),mine=plan.playerId===myPeerId,lastAngle=0;
  gambleSpinning=true;
  if(mine){document.getElementById('gamble-screen').style.display='flex';document.getElementById('gamble-result').textContent='';document.getElementById('gamble-spin-btn').style.display='none';document.getElementById('gamble-close-btn').style.display='none';}
  function frame(now){
    if(!onlineMode||epoch!==onlineEpoch)return;
    if(onlineState.phase!=='gambling'&&onlineState.gambleResult){if(mine){gambleSpinning=false;drawGambleWheel(plan.rotation);}return;}
    var t=Math.max(0,Math.min((now-start)/plan.duration,1)),angle=plan.rotation*(1-Math.pow(1-t,3));
    if(mine){drawGambleWheel(angle);ruletTickBetween(lastAngle,angle,1-t,true);}lastAngle=angle;
    if(t===1){gambleSpinning=false;if(mine)drawGambleWheel(plan.rotation);}
    if(t<1)requestAnimationFrame(frame);
    else if(isHost){
      var rel=((Math.PI*1.5-plan.rotation)%(2*Math.PI)+2*Math.PI)%(2*Math.PI),saved=Math.floor(rel/(2*Math.PI/8))%2===0;
      var p=players.find(function(p){return p.id===plan.playerId;});
      if(!p||onlineState.phase!=='gambling')return;
      sips[p.name]=Math.max(0,(sips[p.name]||0)+(saved?-1:1));onlineState.phase='ready';
      onlineState.gambleResult={playerId:p.id,saved:saved};onlineState.result.desc=p.name+(saved?' je spašen!':' pije duplo! 🍺🍺');
      publishRulet([{id:p.id,message:saved?'SPAŠEN SI! 🎉':'PIJEŠ DUPLO! 🍺🍺',color:saved?'#27ae60':'#e74c3c'}]);
    }
  }requestAnimationFrame(frame);
}
spinGamble=function(){if(!onlineMode)localSpinGamble();};
triggerDrinkFlash=function(message,color){
  clearInterval(flashTimer);
  var flash=document.getElementById('drink-flash');flash.textContent=message;flash.style.background=color||'#e74c3c';flash.style.opacity='1';flash.style.display='flex';
  try{sndDrink();}catch(e){}
  if(navigator.vibrate)navigator.vibrate([250,150,250,150,250]);
  var started=Date.now(),reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  flashTimer=setInterval(function(){
    if(Date.now()-started>=3500){clearInterval(flashTimer);flash.style.display='none';flash.style.opacity='1';return;}
    if(!reduced)flash.style.opacity=flash.style.opacity==='1'?'.25':'1';
  },500);
};

var localShowChooseScreen=showChooseScreen;
showChooseScreen=function(winnerIdx){
  if(!onlineMode){localShowChooseScreen(winnerIdx);return;}
  var chooser=players[winnerIdx],title=document.getElementById('choose-title');
  title.textContent=chooser.name.toUpperCase()+' BIRA TKO PIJE!';title.style.color=chooser.color;
  document.getElementById('choose-sub').textContent='Odaberi igrača na svom mobitelu.';
  var buttons=document.getElementById('choose-btns');buttons.innerHTML='';
  players.forEach(function(p,i){
    if(!p.connected)return;
    var button=document.createElement('button');button.className='choose-btn';button.style.borderColor=p.color;
    button.textContent=(i===winnerIdx?'Ja ('+p.name+')':p.name)+' pijem 🍺';
    button.onclick=function(){chooseDrink(i);};buttons.appendChild(button);
  });
  document.getElementById('choose-screen').classList.add('show');
};
