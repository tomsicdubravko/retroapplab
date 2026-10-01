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
      if(vn<0){ ball.vel.x-=1.55*vn*ux; ball.vel.y-=1.55*vn*uy; ball.vel.z-=1.55*vn*uz; ball.vel.multiplyScalar(0.88); ball.touchedRim=true; if(ball.rebAt==null) ball.rebAt=game.clock||0; if(vn<-0.8)sfx.rim(); } }
    if(ball.pos.z-BALL_R<BOARD_Z&&ball.pos.z>BOARD_Z-0.25&&Math.abs(ball.pos.x)<0.9+BALL_R&&ball.pos.y>2.9-BALL_R&&ball.pos.y<3.95+BALL_R&&ball.vel.z<0){
      ball.pos.z=BOARD_Z+BALL_R; ball.vel.z*=-0.55; ball.vel.x*=0.9; ball.vel.y*=0.9; ball.touchedRim=true; if(ball.rebAt==null) ball.rebAt=game.clock||0; sfx.board(); }
    if(ball.state==='shot'&&!ball.scored&&game.mode==='play'&&py>=RIM_Y&&ball.pos.y<RIM_Y&&ball.vel.y<0&&Math.hypot(ball.pos.x,ball.pos.z-HOOP_Z)<RIM_R-0.015){ ball.vel.x*=0.25; ball.vel.z*=0.25; ball.vel.y=Math.max(ball.vel.y*0.45,-2.2); onScore(); }
    if(ball.pos.y<BALL_R){ ball.pos.y=BALL_R; if(ball.vel.y<0){ if(ball.vel.y<-1.2)sfx.bounce(Math.min(1,-ball.vel.y/6)); ball.vel.y*=-0.72; } ball.vel.x*=0.985; ball.vel.z*=0.985; }
  }
}
function tryPickups(){
  if(ball.state==='pass'){
    for(const p of teams[1-ball.passTeam]){
      // dodavanje iz auta ide preko braniča izvođača: na prvih 1.6 m ga ne može presjeći
      if(ball.izAuta&&ball.noPick&&flat(p.pos,ball.noPick.pos)<1.6) continue;
      if(!ball.checked.has(p)&&flat(p.pos,ball.pos)<0.6&&ball.pos.y<2.5+p.y){
        ball.checked.add(p);
        const ch=(isHuman(p)?0.6:(p.team===1?0.3+D.steal*0.5:0.4))*Math.sqrt(p.st.stl);
        if(Math.random()<ch){ gain(p,'steal'); flash(T('poruka.presjeceno'),'',1,'steal'); sfx.whistle(); return; }
      }
    }
    const r=ball.passTo;
    if(ball.isAlley&&r.y>0.25&&flat(r.pos,ball.pos)<0.9&&Math.abs(ball.pos.y-(2.65+r.y))<0.65){
      gain(r,'pass'); slam(r); if(ball.state==='shot') ball.alley=true; return; }
    // hvatanje: radijus 1.1 m (čovjek 1.3 m), visina ±1.2 m oko ruku
    const rd=flat(r.pos,ball.pos), hy=1.3+r.y;
    if(rd<(isHuman(r)?1.3:1.1)&&Math.abs(ball.pos.y-hy)<1.2){ gain(r,'pass'); return; }
    // arcade "magnet": lopta koja prolazi unutar 1.6 m lagano skrene prema rukama primatelja
    // promašeno dodavanje "umre" na cilju (koji je 0.8 m unutar terena), da ne odleti u aut
    if(!ball.isAlley&&!ball.passDead&&ball.flightT>=ball.T){ ball.passDead=true; ball.vel.x*=0.2; ball.vel.z*=0.2;
      // i ne kotrlja se preko linije: u ~0.7 s smije stići najdalje do 0.4 m od auta
      const t=0.7, X=7.2, Z1=13.7, Z0=0.25;
      if(Math.abs(ball.pos.x+ball.vel.x*t)>X) ball.vel.x=(Math.sign(ball.vel.x)*X-ball.pos.x)/t;
      if(ball.pos.z+ball.vel.z*t>Z1) ball.vel.z=(Z1-ball.pos.z)/t; else if(ball.pos.z+ball.vel.z*t<Z0) ball.vel.z=(Z0-ball.pos.z)/t; }
    if(!ball.isAlley&&rd<1.6){ const k=0.12; ball.pos.x+=(r.pos.x-ball.pos.x)*k; ball.pos.z+=(r.pos.z-ball.pos.z)*k; ball.pos.y+=(hy-ball.pos.y)*k*0.5;
      ball.vel.x*=0.9; ball.vel.z*=0.9; }
    if(ball.flightT>ball.T+0.35) ball.state='loose';
    return;
  }
  if(ball.state==='shot'&&(ball.scored?!(game.solo&&ball.pos.y<2):!(ball.touchedRim||ball.flightT>ball.T+0.05))) return;
  // skok: radijus ovisi o osobini skok (bot 0.6–0.8 m, čovjek 0.9–1.2 m, online gost još +0.2 m);
  // tko je u zraku kad lopta dođe, uzima je i ako nije najbliži
  let best=null,bs=1e9;
  for(const p of players){
    if(p.shooting||p.dunking) continue;
    if(p===ball.noPick&&ball.flightT<0.4) continue;
    const d=flat(p.pos,ball.pos), r=dohvatSkoka(p);
    if(d<r&&ball.pos.y<2.5+p.y*1.2){ const sc=d-(p.y>0.25?10:0); if(sc<bs){ bs=sc; best=p; } }
  }
  if(best) gain(best,'loose');
}
function dohvatSkoka(p){ const k=clamp(((p.st&&p.st.jump)||1)-0.85,0,0.4)/0.4;
  let r=isHuman(p)?0.9+0.3*k:0.6+0.2*k;
  if(game.mp&&mpn.host&&game.humans.has(p)) r+=0.2;   // online gost: nadoknada za kašnjenje
  return r; }
// ---------- skok: gdje će lopta pasti i oznaka na podu ----------
const REB_H=2.2;   // visina na kojoj se lopta hvata
const skokUzivo=()=>(ball.state==='shot'&&ball.touchedRim&&!ball.scored)||ball.state==='loose';
// mjesto gdje će lopta biti na visini hvatanja (ili na podu ako je već niže)
function skokCilj(out){ const y0=ball.pos.y, vy=ball.vel.y, h=(y0>REB_H||vy>0)?REB_H:BALL_R, disc=vy*vy+2*G*(y0-h);
  const t=disc>0?Math.max(0,(vy+Math.sqrt(disc))/G):0;
  return out.set(clamp(ball.pos.x+ball.vel.x*t,-7.4,7.4),0,clamp(ball.pos.z+ball.vel.z*t,-0.1,14)); }
const rebMark=new THREE.Mesh(new THREE.PlaneGeometry(1.5,1.5),new THREE.MeshBasicMaterial({map:RING,color:0xff8a2a,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false}));
rebMark.rotation.x=-Math.PI/2; rebMark.visible=false; scene.add(rebMark);
const _rc=new V3();
function updateRebMark(dt,time){
  if(game.mode!=='play'||!skokUzivo()||ball.state==='held'){ rebMark.visible=false; return; }
  skokCilj(_rc); rebMark.visible=true; rebMark.position.set(_rc.x,0.035,_rc.z);
  const s=1+Math.sin(time*9)*0.12; rebMark.scale.set(s,s,1); rebMark.material.opacity=0.7+Math.sin(time*9)*0.2; }
function updateBall(dt,live){
  if(ball.state==='held'){
    const p=ball.holder, fx=Math.sin(p.face), fz=Math.cos(p.face);
    // one-hand: lopta zamahnuta iza glave; reverse: lopta iza leđa, prema obruču
    if(p.dunking){ const o=p.dunkKind==='rev'?-0.18:p.dunkKind==='one'?-0.25:0.22; ball.pos.set(p.pos.x+fx*o,2.8+p.y+(p.dunkKind==='one'?0.1:0),p.pos.z+fz*o); return; }
    if(p.shooting||p.y>0.02||p.fakeT>0.1){ ball.pos.set(p.pos.x+fx*0.2,(p.fakeT>0?2.46:2.65)+p.y,p.pos.z+fz*0.2); return; }
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
  const vani=Math.abs(ball.pos.x)>7.6||ball.pos.z>14.1||ball.pos.z<-0.15;
  // dodavanje iz auta (izvođenje) kreće izvan terena: aut se gleda tek kad lopta uđe u teren
  if(ball.uvod&&!vani) ball.uvod=false;
  if(settled&&!ball.uvod&&ball.pos.y<2.5&&vani){ outOfBounds(); return; }
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
      const s=ball.noPick;
      // blok s leđa = faul, 1 slobodno bacanje (šut se ne broji)
      if(!game.solo&&!ball.ft&&s&&s.team!==o.team&&sLeda(o,s)){ faulNaSutu(o,s); return; }
      blockShot(o,s||o); return;
    }
  }
}
