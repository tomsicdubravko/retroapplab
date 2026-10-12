// Read-only 3D presentation of gameState.botRoll; never draws a game result.
(function(){
  var stage=document.getElementById('dice-3d-stage'),screen=document.getElementById('dice-screen');
  var total=document.getElementById('dice-total'),originalTotalParent=total.parentNode;
  var renderer,scene,camera,dice=[],textures=[],materials=[],geometry;
  var frame=null,rollStarted=0,rolling=false,active=false,lastKey='',landed=[false,false],lastImpacts=0;
  var values=[1,1],settleTimes=[2400,3100],faceValues=[3,4,1,6,2,5];
  var normals=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]],targets=[],tableTop=0;
  var reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  function texture(value){
    var canvas=document.createElement('canvas');canvas.width=canvas.height=256;var ctx=canvas.getContext('2d');
    var bg=ctx.createLinearGradient(0,0,256,256);bg.addColorStop(0,'#fffdf5');bg.addColorStop(1,'#e4ddcb');ctx.fillStyle=bg;ctx.fillRect(0,0,256,256);
    var dots={1:[[.5,.5]],2:[[.29,.29],[.71,.71]],3:[[.29,.29],[.5,.5],[.71,.71]],4:[[.29,.29],[.71,.29],[.29,.71],[.71,.71]],5:[[.29,.29],[.71,.29],[.5,.5],[.29,.71],[.71,.71]],6:[[.29,.27],[.71,.27],[.29,.5],[.71,.5],[.29,.73],[.71,.73]]};
    dots[value].forEach(function(p){var x=p[0]*256,y=p[1]*256;var hole=ctx.createRadialGradient(x-3,y-4,2,x,y,20);hole.addColorStop(0,'#161120');hole.addColorStop(.7,'#292135');hole.addColorStop(1,'#71627c');ctx.fillStyle=hole;ctx.beginPath();ctx.arc(x,y,19,0,Math.PI*2);ctx.fill();});
    var map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=4;textures.push(map);return map;
  }
  function roundedCube(){
    var geo=new THREE.BoxGeometry(1,1,1,10,10,10),pos=geo.attributes.position,inner=.405,radius=.095;
    for(var i=0;i<pos.count;i++){var p=new THREE.Vector3().fromBufferAttribute(pos,i);var base=p.clone().clampScalar(-inner,inner);p.sub(base).normalize().multiplyScalar(radius).add(base);pos.setXYZ(i,p.x,p.y,p.z);}geo.computeVertexNormals();return geo;
  }
  function thud(strength){
    try{var ctx=getAudio();if(ctx.state==='suspended')ctx.resume();var osc=ctx.createOscillator(),gain=ctx.createGain();osc.type='sine';osc.frequency.setValueAtTime(170,ctx.currentTime);osc.frequency.exponentialRampToValueAtTime(48,ctx.currentTime+.13);gain.gain.setValueAtTime(.16*strength,ctx.currentTime);gain.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.15);osc.connect(gain);gain.connect(ctx.destination);osc.start();osc.stop(ctx.currentTime+.15);}catch(e){}
  }
  function init(){
    if(!window.THREE)return false;
    try{
      renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
      renderer.domElement.setAttribute('aria-label','Dvije 3D kockice na stolu');renderer.domElement.setAttribute('role','img');stage.prepend(renderer.domElement);
      scene=new THREE.Scene();camera=new THREE.OrthographicCamera(-4,4,3,-3,.1,40);camera.position.set(0,7.5,7);camera.lookAt(0,0,0);
      scene.add(new THREE.HemisphereLight(0xfff4df,0x534064,2));
      var light=new THREE.DirectionalLight(0xffeccb,3.3);light.position.set(-3,8,5);light.castShadow=true;light.shadow.mapSize.set(1024,1024);light.shadow.camera.left=-5;light.shadow.camera.right=5;light.shadow.camera.top=5;light.shadow.camera.bottom=-5;light.shadow.bias=-.001;scene.add(light);
      var fill=new THREE.DirectionalLight(0xb590e1,.8);fill.position.set(4,4,-3);scene.add(fill);
      var tableMat=new THREE.MeshStandardMaterial({color:0x261830,roughness:.92,metalness:.05});materials.push(tableMat);
      var floor=new THREE.Mesh(new THREE.BoxGeometry(7.4,.12,4.8),tableMat);floor.position.y=tableTop-.06;floor.receiveShadow=true;scene.add(floor);
      var trimMat=new THREE.MeshStandardMaterial({color:0xa98237,roughness:.38,metalness:.75});materials.push(trimMat);
      [[7.5,.1,.065,0,2.4],[7.5,.1,.065,0,-2.4],[.065,.1,4.8,3.72,0],[.065,.1,4.8,-3.72,0]].forEach(function(b){var rim=new THREE.Mesh(new THREE.BoxGeometry(b[0],b[1],b[2]),trimMat);rim.position.set(b[3],.02,b[4]);scene.add(rim);});
      geometry=roundedCube();var dieMats=faceValues.map(function(value){var mat=new THREE.MeshStandardMaterial({map:texture(value),roughness:.32,metalness:.02});materials.push(mat);return mat;});
      for(var i=0;i<2;i++){var die=new THREE.Mesh(geometry,dieMats);die.castShadow=true;die.receiveShadow=true;die.position.set(i===0?-1.22:1.22,.5,.1);scene.add(die);dice.push(die);}
      document.body.classList.add('webgl-ready');stage.appendChild(total);
      renderer.domElement.addEventListener('webglcontextlost',function(event){event.preventDefault();fallback();});
      new ResizeObserver(resize).observe(stage);resize();return true;
    }catch(e){fallback();return false;}
  }
  function fallback(){
    if(frame!==null)cancelAnimationFrame(frame);frame=null;rolling=false;active=false;
    document.body.classList.remove('webgl-ready','dice-v2-rolling');originalTotalParent.appendChild(total);
    if(renderer){renderer.dispose();renderer.domElement.remove();renderer=null;}
  }
  function resize(){
    if(!renderer)return;var width=stage.clientWidth||340,height=stage.clientHeight||280;renderer.setSize(width,height,false);
    var halfWidth=4.25,halfHeight=halfWidth/(width/height);camera.left=-halfWidth;camera.right=halfWidth;camera.top=halfHeight;camera.bottom=-halfHeight;camera.updateProjectionMatrix();render();
  }
  function target(value,index){
    var normal=new THREE.Vector3().fromArray(normals[faceValues.indexOf(value)]);
    var q=new THREE.Quaternion().setFromUnitVectors(normal,new THREE.Vector3(0,1,0));
    return q.premultiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),index===0?-.22:.24));
  }
  function render(){if(renderer)renderer.render(scene,camera);}
  // Use the rendered vertices to place the lowest point exactly on the felt.
  function supportHeight(die){
    var pos=geometry.attributes.position,v=new THREE.Vector3(),bottom=Infinity;
    for(var i=0;i<pos.count;i++){v.fromBufferAttribute(pos,i).applyQuaternion(die.quaternion);bottom=Math.min(bottom,v.y);}
    return -bottom;
  }
  function setRest(index){var die=dice[index];die.quaternion.copy(targets[index]);die.position.set(index===0?-1.22:1.22,tableTop+supportHeight(die),.1);}
  function finishRoll(){
    if(frame!==null)cancelAnimationFrame(frame);frame=null;
    dice.forEach(function(_,i){setRest(i);});landed=[true,true];rolling=false;
    render();document.body.classList.remove('dice-v2-rolling');
  }
  function beginRoll(){
    if(!renderer||!window.gameState||!Array.isArray(gameState.botRoll))return;
    var incoming=gameState.botRoll.slice(0,2);if(incoming.length!==2||incoming.some(function(v){return !Number.isInteger(v)||v<1||v>6;}))return;
    values=incoming;targets=values.map(target);rollStarted=performance.now();rolling=true;landed=[false,false];lastImpacts=0;
    stage.classList.remove('exact-hit');total.classList.remove('has-total');document.getElementById('dice-3d-caption').textContent='KOCKICE SU U ZRAKU…';
    document.body.classList.add('dice-v2-rolling');
    resize();if(reduced.matches){finishRoll();}else schedule();
  }
  function schedule(){if(frame===null&&active&&!document.hidden)frame=requestAnimationFrame(tick);}
  function tick(now){
    frame=null;if(!renderer||!active)return;
    var elapsed=now-rollStarted;
    dice.forEach(function(die,index){
      var t=Math.min(elapsed/settleTimes[index],1),eased=1-Math.pow(1-t,3);
      if(t>=1||reduced.matches){setRest(index);if(!landed[index]){landed[index]=true;thud(.85);}}
      else{
        var turns=2+values[index]%3,rot=new THREE.Quaternion().setFromEuler(new THREE.Euler(t*turns*Math.PI*2+index,t*(turns+1)*Math.PI*2,t*turns*Math.PI));
        if(t>.75)rot.slerp(targets[index],(t-.75)/.25);
        die.quaternion.copy(rot);
        var support=supportHeight(die);
        var bounce=2.0*Math.abs(Math.sin(t*Math.PI*3.1))*Math.pow(1-t,1.5);
        die.position.set((-2.7+index*.9)*(1-eased)+(index===0?-1.22:1.22)*eased,tableTop+support+bounce,-1.2*(1-eased)+.1*eased);
      }
    });
    var impact=Math.floor(elapsed/700);if(impact>lastImpacts&&elapsed<2100){lastImpacts=impact;thud(.35);}
    render();if(elapsed<settleTimes[1])schedule();else finishRoll();
  }
  function showSum(){
    var text=total.textContent.trim();if(!text||!/^\d+$/.test(text))return;
    // Timers may run before a paused animation frame: settle and render first.
    if(renderer&&targets.length===2)finishRoll();
    total.classList.add('has-total');document.getElementById('dice-3d-caption').textContent='KOCKICE SU STALE';
    if(!window.gameState)return;
    var sum=Number(text),exact=gameMode==='online'?gameState.players.some(function(p){return p.id===myPeerId&&p.selected===sum;}):gameState.players.some(function(p){return p.selected===sum;});
    if(exact){stage.classList.remove('exact-hit');void stage.offsetWidth;stage.classList.add('exact-hit');thud(1);if(navigator.vibrate)navigator.vibrate([120,60,120]);}
  }
  function syncScreen(){
    var visible=getComputedStyle(screen).display!=='none';active=visible;
    if(!visible){if(frame!==null)cancelAnimationFrame(frame);frame=null;rolling=false;document.body.classList.remove('dice-v2-rolling');lastKey='';return;}
    var key=window.gameState&&gameState.botRoll?gameState.round+':'+gameState.botRoll.join(','):'';
    if(key&&key!==lastKey){lastKey=key;beginRoll();}
  }
  new MutationObserver(syncScreen).observe(screen,{attributes:true,attributeFilter:['style','class']});
  new MutationObserver(showSum).observe(total,{childList:true,subtree:true,characterData:true});
  document.addEventListener('visibilitychange',function(){if(document.hidden){if(frame!==null)cancelAnimationFrame(frame);frame=null;}else if(active){if(rolling)schedule();else render();}});
  window.addEventListener('pagehide',function(){if(frame!==null)cancelAnimationFrame(frame);frame=null;});
  var bar=document.getElementById('sips-bar');function positionTable(){document.body.style.setProperty('--scorebar-space',getComputedStyle(bar).display==='none'?'18px':bar.getBoundingClientRect().height+14+'px');}
  new MutationObserver(positionTable).observe(bar,{attributes:true,attributeFilter:['style']});new ResizeObserver(positionTable).observe(bar);positionTable();
  window.diceV2View={snapshot:function(){
    return {ready:!!renderer,rolling:rolling,expected:values.slice(),bottoms:dice.map(function(die){return die.position.y-supportHeight(die);}),tableTop:tableTop,topFaces:dice.map(function(die){var best=0,height=-Infinity;normals.forEach(function(n,i){var v=new THREE.Vector3().fromArray(n).applyQuaternion(die.quaternion);if(v.y>height){height=v.y;best=i;}});return faceValues[best];}),sum:total.textContent.trim()};
  }};
  // The existing PeerJS message remains unchanged; resolve only the local alert.
  var originalDrinkAlert=window.triggerDrinkAlert;
  window.triggerDrinkAlert=function(double){
    if(gameMode==='online'&&window.gameState){
      var me=gameState.players.find(function(p){return p.id===myPeerId;});
      if(!me||!(me.drinks>0))return;
      double=me.drinks===2;
    }
    return originalDrinkAlert(double);
  };
  init();syncScreen();
})();
