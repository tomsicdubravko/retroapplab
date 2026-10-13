/* Original procedural percussion: no recordings, external assets or network audio. */
var beerPongAudio=(function(){
  var context,master,buffers={},voices=new Set(),seen=new Set(),enabled=true;
  try{enabled=localStorage.getItem('bp-sound')!=='off';}catch(e){}
  function make(kind){
    var length=kind==='splash'?.22:kind==='plastic'?.085:.065;
    var buffer=context.createBuffer(1,Math.ceil(context.sampleRate*length),context.sampleRate),data=buffer.getChannelData(0);
    var modes=kind==='plastic'?[620,1370,2430]:kind==='splash'?[310,730,1190]:[1850,3210,4870];
    var last=0,peak=0;
    for(var i=0;i<data.length;i++){
      var t=i/context.sampleRate,noise=Math.random()*2-1;last=last*.65+noise*.35;
      var attack=Math.min(1,t/.0008),value=0;
      modes.forEach(function(f,j){value+=Math.sin(2*Math.PI*f*t)*Math.exp(-t*(kind==='plastic'?70:110)*(1+j*.4)) / (j+2);});
      value+=kind==='splash'?last*Math.exp(-t*20)*.8:noise*Math.exp(-t*650)*.45;
      data[i]=value*attack*Math.min(1,(length-t)/.008);peak=Math.max(peak,Math.abs(data[i]));
    }
    for(var n=0;n<data.length;n++)data[n]=data[n]/(peak||1)*.65;
    return buffer;
  }
  function unlock(){
    if(!enabled)return;
    try{
      if(!context){var Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;context=new Audio();master=context.createGain();master.gain.value=.42;master.connect(context.destination);['ball','plastic','splash'].forEach(function(k){buffers[k]=make(k);});}
      if(context.state==='suspended')context.resume().catch(function(){});
    }catch(e){/* Audio failure must never interrupt gameplay. */}
  }
  function stop(){voices.forEach(function(v){try{v.stop();}catch(e){}});voices.clear();}
  function play(kind,volume,delay,rate){
    if(!enabled||!context||context.state!=='running'||document.hidden)return;
    try{var source=context.createBufferSource(),gain=context.createGain();source.buffer=buffers[kind];source.playbackRate.value=rate||1;gain.gain.value=volume;source.connect(gain);gain.connect(master);voices.add(source);source.onended=function(){voices.delete(source);source.disconnect();gain.disconnect();};source.start(context.currentTime+(delay||0));}catch(e){}
  }
  function once(key,effect,late){
    if(seen.has(key))return;seen.add(key);if(seen.size>512)seen.delete(seen.values().next().value);
    if(late)return;
    if(effect==='hit')play('plastic',.55);
    else if(effect==='splash')play('splash',.48);
    else if(effect==='bonus'||effect==='win'){
      // A short flourish of physical ball/cup taps, never an electronic beep.
      var count=effect==='win'?4:3;for(var i=0;i<count;i++)play(i%2?'plastic':'ball',.32+i*.025,i*.075,1+i*.045);
    }else play(effect==='rim'?'plastic':'ball',effect==='throw'?.3:effect==='miss'?.24:.55);
  }
  function frame(s,elapsed){
    var prefix=s.game+':'+s.id+':';
    function event(at,type){if(elapsed>=at)once(prefix+type,type,elapsed-at>140);}
    event(0,'throw');
    if(s.hit){
      var center=s.record.group.position,dx=s.end.x-center.x,dz=s.end.z-center.z;
      if(Math.hypot(dx,dz)>.205)event(1050,'rim');
      // Ball bottom crosses the cup opening; liquid contact follows at y=.735.
      event(1050,'hit');
      event(1050+450*(.955-.735)/(.955-.25),'splash');
    }else{event(1050,'bounce');event(1375,'miss');}
  }
  var button=document.getElementById('bp-sound-toggle');
  function label(){button.textContent=enabled?'🔊':'🔇';button.title=enabled?'Zvuk uključen':'Zvuk isključen';button.setAttribute('aria-label',button.title);button.setAttribute('aria-pressed',String(enabled));}
  button.addEventListener('click',function(){enabled=!enabled;try{localStorage.setItem('bp-sound',enabled?'on':'off');}catch(e){}label();if(enabled)unlock();else stop();});
  ['pointerdown','touchend','keydown','click'].forEach(function(type){document.addEventListener(type,unlock,{capture:true,passive:true});});
  document.addEventListener('visibilitychange',function(){if(document.hidden)stop();});
  window.addEventListener('pagehide',stop);label();
  return {frame:frame,once:once,reset:function(){seen.clear();stop();}};
})();
