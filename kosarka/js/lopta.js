// ===== Košarka 2 na 2 - lopta: model, stanje i fizika lopte, hvatanje, blok u zraku =====
'use strict';
// ---------- ball ----------
function ballTex(){
  const c=document.createElement('canvas'); c.width=256;c.height=128; const g=c.getContext('2d');
  g.fillStyle='#e0701f'; g.fillRect(0,0,256,128);
  for(let i=0;i<2500;i++){ g.fillStyle=`rgba(90,35,5,${Math.random()*.25})`; g.fillRect(Math.random()*256,Math.random()*128,2,2); }
  g.strokeStyle='#1e0e05'; g.lineWidth=3;
  g.beginPath(); g.moveTo(0,64); g.lineTo(256,64); g.stroke();
  for(const x of [64,192]){ g.beginPath(); g.moveTo(x,0); g.lineTo(x,128); g.stroke(); }
  for(const o of [0,128]){ g.beginPath(); for(let x=0;x<=128;x+=4){ const y=64+Math.sin(x/128*Math.PI)*46*(o?1:-1); x===0?g.moveTo(o+x,y):g.lineTo(o+x,y);} g.stroke(); }
  return new THREE.CanvasTexture(c);
}
const ballMesh=new THREE.Mesh(new THREE.SphereGeometry(BALL_R,20,14),new THREE.MeshLambertMaterial({map:ballTex()}));
ballMesh.castShadow=true; scene.add(ballMesh);
const ball={pos:new V3(0,1,8),vel:new V3(),state:'held',holder:null,passTo:null,passTeam:0,checked:new Set(),T:1,flightT:0,
  touchedRim:false,scored:false,shotTeam:0,shotValue:2,wasShot:false,noPick:null,lastTouchTeam:0,dribT:0,dribS:1,isAlley:false,dunk:false,alley:false};


function ballPhysics(dt){
  const n=5,h=dt/n;
  for(let k=0;k<n;k++){
    const py=ball.pos.y;
    ball.vel.y-=G*h; ball.pos.addScaledVector(ball.vel,h);
    const dx=ball.pos.x, dz=ball.pos.z-HOOP_Z, hd=Math.hypot(dx,dz)||1e-6;
    const nx=dx-dx/hd*RIM_R, ny=ball.pos.y-RIM_Y, nz=dz-dz/hd*RIM_R, nd=Math.hypot(nx,ny,nz), md=BALL_R+0.018;
    if(RIM_R-hd<md&&nd<md&&nd>1e-6){ const ux=nx/nd,uy=ny/nd,uz=nz/nd;
      ball.pos.x+=ux*(md-nd); ball.pos.y+=uy*(md-nd); ball.pos.z+=uz*(md-nd);
      const vn=ball.vel.x*ux+ball.vel.y*uy+ball.vel.z*uz;
      if(vn<0){ ball.vel.x-=1.55*vn*ux; ball.vel.y-=1.55*vn*uy; ball.vel.z-=1.55*vn*uz; ball.vel.multiplyScalar(0.88); ball.touchedRim=true; if(vn<-0.8)sfx.rim(); } }
    if(ball.pos.z-BALL_R<BOARD_Z&&ball.pos.z>BOARD_Z-0.25&&Math.abs(ball.pos.x)<0.9+BALL_R&&ball.pos.y>2.9-BALL_R&&ball.pos.y<3.95+BALL_R&&ball.vel.z<0){
      ball.pos.z=BOARD_Z+BALL_R; ball.vel.z*=-0.55; ball.vel.x*=0.9; ball.vel.y*=0.9; ball.touchedRim=true; sfx.board(); }
    if(ball.state==='shot'&&!ball.scored&&game.mode==='play'&&py>=RIM_Y&&ball.pos.y<RIM_Y&&ball.vel.y<0&&Math.hypot(ball.pos.x,ball.pos.z-HOOP_Z)<RIM_R-0.015){ ball.vel.x*=0.25; ball.vel.z*=0.25; ball.vel.y=Math.max(ball.vel.y*0.45,-2.2); onScore(); }
    if(ball.pos.y<BALL_R){ ball.pos.y=BALL_R; if(ball.vel.y<0){ if(ball.vel.y<-1.2)sfx.bounce(Math.min(1,-ball.vel.y/6)); ball.vel.y*=-0.72; } ball.vel.x*=0.985; ball.vel.z*=0.985; }
  }
}
function tryPickups(){
  if(ball.state==='pass'){
    for(const p of teams[1-ball.passTeam]){
      if(!ball.checked.has(p)&&flat(p.pos,ball.pos)<0.6&&ball.pos.y<2.5+p.y){
        ball.checked.add(p);
        const ch=(isHuman(p)?0.6:(p.team===1?0.3+D.steal*0.5:0.4))*Math.sqrt(p.st.stl);
        if(Math.random()<ch){ gain(p,'steal'); flash('PRESJEČENO!','',1,'steal'); sfx.whistle(); return; }
      }
    }
    const r=ball.passTo;
    if(ball.isAlley&&r.y>0.25&&flat(r.pos,ball.pos)<0.9&&Math.abs(ball.pos.y-(2.65+r.y))<0.65){
      gain(r,'pass'); slam(r); if(ball.state==='shot') ball.alley=true; return; }
    if(flat(r.pos,ball.pos)<0.8&&Math.abs(ball.pos.y-(1.3+r.y))<1.0){ gain(r,'pass'); return; }
    if(ball.flightT>ball.T+0.35) ball.state='loose';
    return;
  }
  if(ball.state==='shot'&&(ball.scored?!(game.solo&&ball.pos.y<2):!(ball.touchedRim||ball.flightT>ball.T+0.05))) return;
  let best=null,bd=1e9;
  for(const p of players){
    if(p.shooting||p.dunking) continue;
    if(p===ball.noPick&&ball.flightT<0.4) continue;
    const d=flat(p.pos,ball.pos);
    if(d<0.62&&ball.pos.y<2.5+p.y*1.2&&d<bd){bd=d;best=p;}
  }
  if(best) gain(best,'loose');
}
function updateBall(dt,live){
  if(ball.state==='held'){
    const p=ball.holder, fx=Math.sin(p.face), fz=Math.cos(p.face);
    // one-hand: lopta zamahnuta iza glave; reverse: lopta iza leđa, prema obruču
    if(p.dunking){ const o=p.dunkKind==='rev'?-0.18:p.dunkKind==='one'?-0.25:0.22; ball.pos.set(p.pos.x+fx*o,2.8+p.y+(p.dunkKind==='one'?0.1:0),p.pos.z+fz*o); return; }
    if(p.shooting||p.y>0||p.fakeT>0.1){ ball.pos.set(p.pos.x+fx*0.2,(p.fakeT>0?2.46:2.65)+p.y,p.pos.z+fz*0.2); return; }
    if(p.gather){ ball.pos.set(p.pos.x+fx*0.36,1.58,p.pos.z+fz*0.36); return; }
    ball.dribT+=dt*(1+Math.hypot(p.vel.x,p.vel.z)*0.12)*p.st.dribRate;
    const s=Math.sin(ball.dribT*6.5), rx=-fz, rz=fx;
    if(p.moveKind==='legs'&&p.moveT>0){ const k=1-p.moveT/0.38, lat=-p.dribSide*Math.cos(k*Math.PI)*0.3, fw=0.1+Math.abs(Math.cos(k*Math.PI))*0.22;
      ball.pos.set(p.pos.x+fx*fw+rx*lat,0.2+Math.sin(k*Math.PI)*0.12+(k>0.85?(k-0.85)*3:0),p.pos.z+fz*fw+rz*lat); return; }
    const sx=p.dribX*(p.moveKind==='cross'&&p.moveT>0?0.9:1); ball.pos.set(p.pos.x+fx*0.42+rx*0.32*sx, BALL_R+Math.abs(s)*(p.moveT>0?0.55:0.95)*p.st.dribH, p.pos.z+fz*0.42+rz*0.32*sx);
    const sg=s>=0?1:-1; if(sg!==ball.dribS){ ball.dribS=sg; if(live) sfx.dribble(); }
    return;
  }
  ball.flightT+=dt;
  ballPhysics(dt);
  if(!live) return;
  if(game.mode!=='play') return;
  const settled=ball.state!=='shot'||ball.touchedRim||ball.flightT>ball.T;
  if(settled&&ball.pos.y<2.5&&(Math.abs(ball.pos.x)>7.6||ball.pos.z>14.1||ball.pos.z<-0.15)){ outOfBounds(); return; }
  checkInAirBlock();
  tryPickups();
}
// blok u zraku: ruke skočenog braniča dotaknu loptu dok se tek diže
function checkInAirBlock(){
  if(ball.state!=='shot'||ball.dunk||ball.touchedRim||ball.vel.y<0||ball.flightT>0.45) return;
  for(const o of teams[1-ball.shotTeam]){
    if(o.y<0.2||o.bitT>0) continue;
    const dx=ball.pos.x-o.pos.x, dy=ball.pos.y-(o.y+2.78), dz=ball.pos.z-o.pos.z;
    if(Math.hypot(dx,dy,dz)<0.45*Math.sqrt(o.st.blk)){
      blockShot(o,ball.noPick||o); return;
    }
  }
}
