/* Beer Pong V2: one authoritative cups array; Three.js is its presentation. */
var p1Name='',p2Name='',cups=[[0,1,2,3,4,5],[0,1,2,3,4,5]],currentPlayer=0;
var gameSerial=0,shotSerial=0,activeShotId=0,resolvedShotId=0,lastShotHit=false,hitStreak=0;
var phase='idle',posX=0,posY=0,dirX=1,dirY=1,stoppedX=0,stoppedY=0;
var speed=.013*60,raf=null,lastFrame=0,TOP_CUP_POSITIONS=[];
var tableEl=document.getElementById('table'),stopBtn=document.getElementById('stop-btn'),throwBtn=document.getElementById('throw-btn'),nextBtn=document.getElementById('next-btn'),phaseLabel=document.getElementById('phase-label'),resultMsg=document.getElementById('result-msg');
var contextLost=false;
var renderer,scene,camera,cupMeshes=[],ball,aimX,aimY,targetRing,ripple,droplets=[],shot=null,turnTween=null,viewAngle=0,winTimer=null;
var CUP_HEIGHT=.86,CUP_OPEN_RADIUS=.30,AIM_WIDTH=6,AIM_FAR=-5.7;
var CUP_LAYOUT=[[-.78,-4.7],[0,-4.7],[.78,-4.7],[-.39,-4.02],[.39,-4.02],[0,-3.34]];
function getNames(){return [p1Name,p2Name];}
function getOpponent(){return 1-currentPlayer;}
function aimSign(){return currentPlayer===0?1:-1;}
function aimWorld(x,y,height){var sign=aimSign();return new THREE.Vector3((x-.5)*AIM_WIDTH*sign,height,(AIM_FAR+y*AIM_WIDTH)*sign);}
function cupWorld(player,index){var sign=player===1?1:-1,p=CUP_LAYOUT[index];return new THREE.Vector3(p[0]*sign,0,p[1]*sign);}
function stepAxis(position,direction,seconds,limit){
  var unfolded=direction>0?position:2*limit-position,q=((unfolded+speed*seconds)%(2*limit)+2*limit)%(2*limit);
  return {position:q<=limit?q:2*limit-q,direction:q<limit?1:-1};
}
function updateUI(){
  var names=getNames();document.getElementById('turn-label').textContent=names[currentPlayer];document.getElementById('turn-label').style.color=currentPlayer===0?'#ec6870':'#74baf4';
  document.getElementById('p1-cups-left').textContent=cups[0].length+' čaša';document.getElementById('p2-cups-left').textContent=cups[1].length+' čaša';
  document.getElementById('player-bar').dataset.turn=currentPlayer;
}
function renderCups(){
  cupMeshes.forEach(function(record){record.group.visible=cups[record.player].indexOf(record.index)>=0;});
}
function makeCup(player,index){
  var group=new THREE.Group(),plastic=new THREE.MeshPhysicalMaterial({color:player===0?0xc62e40:0x246fb7,roughness:.27,metalness:0,ior:1.46,specularIntensity:.8,clearcoat:.38,clearcoatRoughness:.22,side:THREE.DoubleSide});
  var profile=[[0,0],[.215,0],[.22,.04],[.238,.2],[.245,.21],[.239,.22],[.26,.39],[.267,.40],[.261,.41],[.286,.61],[.293,.62],[.287,.63],[.323,.82],[.326,.86],[.30,.86],[.298,.82],[.20,.065],[0,.065]].map(function(p){return new THREE.Vector2(p[0],p[1]);});
  var body=new THREE.Mesh(new THREE.LatheGeometry(profile,48),plastic);body.castShadow=true;body.receiveShadow=true;group.add(body);
  var lip=new THREE.Mesh(new THREE.TorusGeometry(.313,.015,10,48),new THREE.MeshPhysicalMaterial({color:player===0?0xf0818d:0x94c8f4,roughness:.23,metalness:0,ior:1.46,clearcoat:.45,clearcoatRoughness:.2}));lip.rotation.x=Math.PI/2;lip.position.y=CUP_HEIGHT;lip.castShadow=true;group.add(lip);
  var liquid=new THREE.Mesh(new THREE.CircleGeometry(.265,40),new THREE.MeshPhysicalMaterial({color:0xc79743,roughness:.17,metalness:0,ior:1.33,specularIntensity:.85,transparent:true,opacity:.94,clearcoat:.55,clearcoatRoughness:.13,side:THREE.DoubleSide}));liquid.rotation.x=-Math.PI/2;liquid.position.y=.64;group.add(liquid);
  group.position.copy(cupWorld(player,index));scene.add(group);cupMeshes.push({player:player,index:index,group:group,liquid:liquid});
}
function line(){var geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute([0,0,0,0,0,0],3));return new THREE.Line(geo,new THREE.LineBasicMaterial({color:0xf2d38a,transparent:true,opacity:.82}));}
function setLine(mesh,a,b){var p=mesh.geometry.attributes.position;p.setXYZ(0,a.x,a.y,a.z);p.setXYZ(1,b.x,b.y,b.z);p.needsUpdate=true;mesh.geometry.computeBoundingSphere();}
function init3D(){
  if(renderer)return !contextLost;
  try{
    if(!window.THREE)throw Error('Three.js unavailable');
    renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.18;
    renderer.domElement.setAttribute('aria-label','3D Beer Pong stol, dvanaest čaša i ciljnik');renderer.domElement.setAttribute('role','img');tableEl.appendChild(renderer.domElement);
    scene=new THREE.Scene();scene.background=new THREE.Color(0x0c1113);scene.fog=new THREE.Fog(0x0c1113,23,43);
    camera=new THREE.PerspectiveCamera(45,1,.1,60);
    // Warm fill lifts contact shadows; only the existing key light casts shadows.
    scene.add(new THREE.AmbientLight(0xffe8cb,.18));
    scene.add(new THREE.HemisphereLight(0xffe5c4,0x405047,2.2));var key=new THREE.DirectionalLight(0xffefda,2.7);key.position.set(-4,12,6);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-8;key.shadow.camera.right=8;key.shadow.camera.top=9;key.shadow.camera.bottom=-9;key.shadow.bias=-.0003;scene.add(key);
    var fill=new THREE.DirectionalLight(0xd0dce6,1.05);fill.position.set(6,5,-8);scene.add(fill);
    var edgeLight=new THREE.DirectionalLight(0xffeed5,.55);edgeLight.position.set(-3,6,-5);scene.add(edgeLight);
    var felt=new THREE.MeshStandardMaterial({color:0x123e2f,roughness:.87,metalness:.04});var top=new THREE.Mesh(new THREE.BoxGeometry(6,.18,12),felt);top.position.y=-.09;top.receiveShadow=true;top.castShadow=true;scene.add(top);
    var metal=new THREE.MeshStandardMaterial({color:0xb99646,roughness:.31,metalness:.75});[[6.14,.09,.07,0,-6],[6.14,.09,.07,0,6],[.07,.09,12,3,0],[.07,.09,12,-3,0]].forEach(function(a){var rim=new THREE.Mesh(new THREE.BoxGeometry(a[0],a[1],a[2]),metal);rim.position.set(a[3],.025,a[4]);rim.castShadow=true;scene.add(rim);});
    var frame=new THREE.Mesh(new THREE.BoxGeometry(6.05,.23,12.05),new THREE.MeshStandardMaterial({color:0x171d1b,roughness:.38,metalness:.6}));frame.position.y=-.30;frame.castShadow=true;scene.add(frame);
    var floor=new THREE.Mesh(new THREE.PlaneGeometry(40,40),new THREE.MeshStandardMaterial({color:0x101719,roughness:.9}));floor.rotation.x=-Math.PI/2;floor.position.y=-2.5;floor.receiveShadow=true;scene.add(floor);
    [[-2.4,-4.8],[2.4,-4.8],[-2.4,4.8],[2.4,4.8]].forEach(function(p){var leg=new THREE.Mesh(new THREE.BoxGeometry(.15,2.2,.15),new THREE.MeshStandardMaterial({color:0x252a29,metalness:.7,roughness:.3}));leg.position.set(p[0],-1.35,p[1]);leg.castShadow=true;scene.add(leg);});
    var logoCanvas=document.createElement('canvas');logoCanvas.width=512;logoCanvas.height=256;var g=logoCanvas.getContext('2d');g.fillStyle='#cebb7b';g.textAlign='center';g.font='600 42px Arial';g.fillText('PARTY GAMES',256,112);g.font='24px Arial';g.fillText('BEER PONG  ·  18+',256,164);var logoTex=new THREE.CanvasTexture(logoCanvas);logoTex.colorSpace=THREE.SRGBColorSpace;var logo=new THREE.Mesh(new THREE.PlaneGeometry(2.8,1.4),new THREE.MeshBasicMaterial({map:logoTex,transparent:true,opacity:.6,depthWrite:false}));logo.rotation.x=-Math.PI/2;logo.position.y=.009;scene.add(logo);
    for(var player=0;player<2;player++)for(var i=0;i<6;i++)makeCup(player,i);
    ball=new THREE.Mesh(new THREE.SphereGeometry(.095,24,16),new THREE.MeshStandardMaterial({color:0xfffcf4,roughness:.42,metalness:0}));ball.castShadow=true;ball.visible=false;scene.add(ball);
    aimX=line();aimY=line();scene.add(aimX,aimY);targetRing=new THREE.Mesh(new THREE.TorusGeometry(.13,.012,8,32),new THREE.MeshBasicMaterial({color:0xffdc83,transparent:true,opacity:.95}));targetRing.rotation.x=-Math.PI/2;scene.add(targetRing);
    ripple=new THREE.Mesh(new THREE.TorusGeometry(.12,.006,6,32),new THREE.MeshBasicMaterial({color:0xffe5a1,transparent:true,opacity:0}));ripple.rotation.x=-Math.PI/2;scene.add(ripple);
    for(var d=0;d<6;d++){var droplet=new THREE.Mesh(new THREE.SphereGeometry(.028,8,6),new THREE.MeshStandardMaterial({color:0xebc26b,roughness:.25}));droplet.visible=false;scene.add(droplet);droplets.push(droplet);}
    renderer.domElement.addEventListener('webglcontextlost',function(e){e.preventDefault();contextLost=true;cancelAnimationFrame(raf);raf=null;shot=null;turnTween=null;show3DError();});
    new ResizeObserver(resize3D).observe(tableEl);resize3D();return true;
  }catch(e){if(renderer){renderer.dispose();renderer.domElement.remove();renderer=null;}show3DError();return false;}
}
function show3DError(){phase='unavailable';document.getElementById('webgl-error').hidden=false;stopBtn.style.display='none';throwBtn.disabled=true;nextBtn.style.display='none';phaseLabel.textContent='3D PRIKAZ NIJE DOSTUPAN';}
function setCamera(angle){
  // Fit the table and cup openings to the actual viewport at a lower player angle.
  // The same symmetric bounds apply at either end and throughout the 180° turn.
  viewAngle=angle;camera.fov=28;camera.updateProjectionMatrix();
  var elevation=37*Math.PI/180,forward=new THREE.Vector3(Math.sin(angle)*Math.cos(elevation),Math.sin(elevation),Math.cos(angle)*Math.cos(elevation));
  var right=new THREE.Vector3(Math.cos(angle),0,-Math.sin(angle)),up=new THREE.Vector3().crossVectors(forward,right),center=new THREE.Vector3(0,.2,0),points=[];
  [-3.08,3.08].forEach(function(x){[-6.08,6.08].forEach(function(z){[-.42,.07].forEach(function(y){points.push(new THREE.Vector3(x,y,z));});});});
  // These are camera framing bounds, not a second copy of game state.
  [0,1].forEach(function(player){CUP_LAYOUT.forEach(function(_,i){var c=cupWorld(player,i);[-.34,.34].forEach(function(x){[-.34,.34].forEach(function(z){points.push(new THREE.Vector3(c.x+x,.90,c.z+z));});});});});
  var bounds=points.map(function(p){p.sub(center);return {x:p.dot(right),y:p.dot(up),depth:p.dot(forward)};});
  var vertical=Math.tan(THREE.MathUtils.degToRad(camera.fov/2))*.93,horizontal=vertical*camera.aspect;
  function fit(distance){var low=-Infinity,high=Infinity;bounds.forEach(function(p){var reach=distance-p.depth;if(reach<=0||Math.abs(p.x)>horizontal*reach){low=Infinity;high=-Infinity;return;}low=Math.max(low,p.y-vertical*reach);high=Math.min(high,p.y+vertical*reach);});return {low:low,high:high};}
  var near=1,far=50;for(var i=0;i<30;i++){var mid=(near+far)/2,f=fit(mid);if(f.low<=f.high)far=mid;else near=mid;}
  var framing=fit(far),target=center.clone().addScaledVector(up,(framing.low+framing.high)/2);
  camera.position.copy(target).addScaledVector(forward,far);camera.lookAt(target);
}
function resize3D(){if(!renderer)return;var w=tableEl.clientWidth||360,h=tableEl.clientHeight||420;renderer.setSize(w,h,false);camera.aspect=w/h;setCamera(viewAngle);drawScene();}
function updateAim(){
  var aiming=phase==='moving-x'||phase==='moving-y',locked=phase==='flying'||phase==='done';aimX.visible=aiming||locked;aimY.visible=phase==='moving-y'||locked;targetRing.visible=phase==='moving-y'||locked;
  var x=phase==='moving-x'?posX:stoppedX,y=phase==='moving-y'?posY:stoppedY;
  setLine(aimX,aimWorld(x,0,CUP_HEIGHT+.01),aimWorld(x,.55,CUP_HEIGHT+.01));setLine(aimY,aimWorld(0,y,CUP_HEIGHT+.01),aimWorld(1,y,CUP_HEIGHT+.01));targetRing.position.copy(aimWorld(x,y,CUP_HEIGHT+.013));
}
function drawScene(){if(!renderer)return;renderCups();updateAim();renderer.render(scene,camera);}
function requestFrame(){if(raf===null&&!document.hidden)raf=requestAnimationFrame(animate);}
function animate(now){
  raf=null;if(!renderer)return;var dt=lastFrame?(now-lastFrame)/1000:0;lastFrame=now;
  if(botAim)updateBotAim(now);
  else if(phase==='moving-x'){var x=stepAxis(posX,dirX,dt,1);posX=x.position;dirX=x.direction;}
  else if(phase==='moving-y'){var y=stepAxis(posY,dirY,dt,.55);posY=y.position;dirY=y.direction;}
  if(shot)updateShot(now);if(turnTween)updateTurn(now);drawScene();
  if(phase==='moving-x'||phase==='moving-y'||shot||turnTween)requestFrame();else lastFrame=0;
}
function updateHitStreak(){var indicator=document.getElementById('hit-streak');indicator.textContent=hitStreak>=4?'NEZAUSTAVLJIV! 🔥':hitStreak>=2?hitStreak+' POGOTKA ZAREDOM!':'';indicator.hidden=hitStreak<2;}
function startGame(){
  beerPongAudio.reset();
  gameSerial++;activeShotId=0;resolvedShotId=0;lastShotHit=false;hitStreak=0;updateHitStreak();throwBtn.textContent='BACI 🏓';
  clearTimeout(winTimer);p1Name=document.getElementById('p1-name').value.trim()||'Igrač 1';p2Name=document.getElementById('p2-name').value.trim()||'Igrač 2';cups=[[0,1,2,3,4,5],[0,1,2,3,4,5]];currentPlayer=0;phase='idle';shot=null;turnTween=null;
  document.getElementById('setup-screen').style.display='none';document.getElementById('game-screen').style.display='flex';document.getElementById('win-screen').style.display='none';document.getElementById('p1-bar-name').textContent=p1Name;document.getElementById('p2-bar-name').textContent=p2Name;
  stopBtn.style.display='none';nextBtn.style.display='none';throwBtn.style.display='block';throwBtn.disabled=false;resultMsg.textContent='';phaseLabel.textContent='PRITISNI BACI';updateUI();
  if(init3D()){document.getElementById('webgl-error').hidden=true;cupMeshes.forEach(function(c){c.group.scale.setScalar(1);c.liquid.rotation.x=-Math.PI/2;});ball.visible=false;ripple.visible=false;droplets.forEach(function(d){d.visible=false;});setCamera(0);resize3D();}else show3DError();
}
function computeCupPositions(){
  TOP_CUP_POSITIONS=cups[getOpponent()].map(function(i){var p=CUP_LAYOUT[i];return {i:i,fx:(p[0]+3)/AIM_WIDTH,fy:(p[1]-AIM_FAR)/AIM_WIDTH,r:CUP_OPEN_RADIUS/AIM_WIDTH};});
}
function startThrow(){
  if(!renderer||phase!=='idle'||(isBotTurn()&&!botActing))return;
  computeCupPositions();phase='moving-x';posX=0;posY=0;dirX=1;dirY=1;stoppedX=0;stoppedY=0;ball.visible=false;stopBtn.style.display='block';throwBtn.style.display='none';nextBtn.style.display='none';resultMsg.textContent='';phaseLabel.textContent='ZAUSTAVI X OS!';lastFrame=performance.now();requestFrame();drawScene();
}
function stopLine(){
  if(isBotTurn()&&!botActing)return;
  if(phase==='moving-x'){stoppedX=posX;phase='moving-y';posY=0;dirY=1;lastFrame=performance.now();phaseLabel.textContent='ZAUSTAVI Y OS!';drawScene();}
  else if(phase==='moving-y'){stoppedY=posY;phase='done';stopBtn.style.display='none';checkHit();}
}
function checkHit(){
  if(phase!=='done')return;
  var opp=getOpponent(),hit=null,minDist=999;
  TOP_CUP_POSITIONS.forEach(function(pos){if(cups[opp].indexOf(pos.i)===-1)return;var dx=stoppedX-pos.fx,dy=stoppedY-pos.fy,dist=Math.sqrt(dx*dx+dy*dy);if(dist<pos.r&&dist<minDist){minDist=dist;hit=pos;}});
  phase='flying';phaseLabel.textContent='LOPTICA LETI...';
  var end=aimWorld(stoppedX,stoppedY,hit?CUP_HEIGHT+.095:.095),start=new THREE.Vector3(.25*aimSign(),1.35,3.05*aimSign());
  activeShotId=++shotSerial;
  shot={id:activeShotId,game:gameSerial,startTime:performance.now(),start:start,end:end,hit:hit,opponent:opp,player:currentPlayer,record:hit?cupMeshes.find(function(c){return c.player===opp&&c.index===hit.i;}):null};ball.visible=true;ball.position.copy(start);lastFrame=performance.now();requestFrame();
}
function updateShot(now){
  var s=shot,elapsed=now-s.startTime,t=Math.min(elapsed/1050,1);beerPongAudio.frame(s,elapsed);ball.rotation.x=elapsed*.012;ball.rotation.z=elapsed*.008;
  if(elapsed<=1050){ball.position.lerpVectors(s.start,s.end,t);ball.position.y+=Math.sin(Math.PI*t)*2.8;return;}
  if(s.hit){
    var impact=Math.min((elapsed-1050)/450,1),center=s.record.group.position;
    ball.position.set(THREE.MathUtils.lerp(s.end.x,center.x,impact),THREE.MathUtils.lerp(CUP_HEIGHT+.095,.25,impact),THREE.MathUtils.lerp(s.end.z,center.z,impact));
    s.record.liquid.rotation.x=-Math.PI/2+Math.sin(impact*25)*.045*(1-impact);s.record.group.scale.setScalar(1-.12*impact);
    ripple.visible=true;ripple.position.set(center.x,.652,center.z);ripple.scale.setScalar(.2+impact*1.85);ripple.material.opacity=.9*(1-impact);
    droplets.forEach(function(d,i){var a=i*Math.PI/3,r=impact*.3;d.visible=impact<.8;d.position.set(center.x+Math.cos(a)*r,.65+Math.sin(impact*Math.PI)*.4,center.z+Math.sin(a)*r);});
    if(impact<1)return;
  }else{
    var bounce=Math.min((elapsed-1050)/650,1);ball.position.set(s.end.x+.25*bounce*aimSign(),.095+Math.abs(Math.sin(bounce*Math.PI*2))*.65*(1-bounce),s.end.z-.65*bounce*aimSign());if(bounce<1)return;
  }
  shot=null;ball.visible=false;ripple.visible=false;droplets.forEach(function(d){d.visible=false;});if(s.record){s.record.group.scale.setScalar(1);s.record.liquid.rotation.x=-Math.PI/2;}
  resolveShot(s);
}
function resolveShot(s){
  // A shot is committed once, after its existing flight/impact animation finishes.
  if(!s||shot||phase!=='flying'||s.game!==gameSerial||s.id!==activeShotId||s.id<=resolvedShotId||s.player!==currentPlayer)return;
  if(s.hit&&cups[s.opponent].indexOf(s.hit.i)===-1)return;
  resolvedShotId=s.id;lastShotHit=!!s.hit;phase='done';phaseLabel.textContent='';resultMsg.replaceChildren();var text=document.createElement('span');
  if(s.hit){
    cups[s.opponent]=cups[s.opponent].filter(function(i){return i!==s.hit.i;});hitStreak++;updateHitStreak();if(hitStreak>=2)beerPongAudio.once(s.game+':'+s.id+':bonus','bonus');
    text.style.color='#83ce9e';text.textContent=isBotTurn()?'POGODAK! RAČUNALO IGRA PONOVNO!':'POGODAK! IGRAŠ PONOVNO!';resultMsg.appendChild(text);
    phaseLabel.textContent=getNames()[s.opponent]+' pije!';updateUI();renderCups();
    if(cups[s.opponent].length===0){nextBtn.style.display='none';throwBtn.style.display='none';showWin(getNames()[s.player]);return;}
    nextBtn.textContent='BACAJ PONOVNO';
  }else{
    hitStreak=0;updateHitStreak();text.style.color='#ec8887';text.textContent='PROMAŠAJ! RED JE NA PROTIVNIKU';resultMsg.appendChild(text);nextBtn.textContent='SLJEDEĆI IGRAČ';
  }
  nextBtn.style.display='block';onShotResolved(s);
}
function nextTurn(){
  if(phase!=='done'||shot||cups[0].length===0||cups[1].length===0)return;
  nextBtn.style.display='none';
  if(lastShotHit){
    // A hit retains the player and camera; the next throw follows the same path.
    phase='idle';if(isBotTurn())onTurnReady();else startThrow();return;
  }
  currentPlayer=getOpponent();phase='turning';resultMsg.textContent='';throwBtn.style.display='none';throwBtn.textContent='BACI 🏓';phaseLabel.textContent='PREDAJ MOBITEL';updateUI();
  turnTween={startTime:performance.now(),from:viewAngle,to:viewAngle+Math.PI};lastFrame=performance.now();requestFrame();
}
function updateTurn(now){var t=Math.min((now-turnTween.startTime)/550,1),ease=t*t*(3-2*t);setCamera(turnTween.from+(turnTween.to-turnTween.from)*ease);if(t===1){turnTween=null;phase='idle';throwBtn.style.display='block';phaseLabel.textContent=getNames()[currentPlayer].toUpperCase()+', TVOJ RED!';renderCups();onTurnReady();}}
function showWin(name){beerPongAudio.once(gameSerial+':win','win');hitStreak=0;updateHitStreak();phase='won';document.getElementById('game-screen').style.display='none';document.getElementById('win-screen').style.display='flex';document.getElementById('win-title').textContent=name.toUpperCase()+' POBIJEDIO!';document.getElementById('win-sub').textContent='Protivnik pije sve preostale čaše! 🍺';}
function restartGame(){beerPongAudio.reset();hitStreak=0;lastShotHit=false;updateHitStreak();clearTimeout(winTimer);cancelAnimationFrame(raf);raf=null;shot=null;turnTween=null;lastFrame=0;phase='idle';document.getElementById('win-screen').style.display='none';document.getElementById('game-screen').style.display='none';document.getElementById('setup-screen').style.display='flex';}
document.addEventListener('visibilitychange',function(){lastFrame=0;if(document.hidden){cancelAnimationFrame(raf);raf=null;}else if(renderer){if(phase==='moving-x'||phase==='moving-y'||shot||turnTween)requestFrame();else drawScene();}});
window.addEventListener('pagehide',function(){clearTimeout(winTimer);cancelAnimationFrame(raf);raf=null;});
window.beerPongV2View={snapshot:function(){
  var goal=renderer?aimWorld(stoppedX,stoppedY,CUP_HEIGHT):null;
  return {ready:!!renderer,phase:phase,currentPlayer:currentPlayer,remaining:cups.map(function(c){return c.slice();}),ball:ball?{visible:ball.visible,position:ball.position.toArray()}:null,target:goal?goal.toArray():null,cups:cupMeshes.map(function(c){return {player:c.player,index:c.index,visible:c.group.visible,position:c.group.position.toArray(),opening:[c.group.position.x,CUP_HEIGHT,c.group.position.z]};})};
}};

