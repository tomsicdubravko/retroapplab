// ===== Košarka 2 na 2 - AI: osobnosti, pozicije bez lopte, obrana, odluke s loptom =====
'use strict';
// ---------- AI ----------
// osobnosti: množitelji na postojećim odlukama AI-a (1 = bez promjene), težina (Lako/Normalno/Teško) ostaje ista
// drib/legs/dribR dribling potezi · fake finte · pass dodavanje · three/mid/rim sklonost šutu po zoni · lane širina prodora
// pull povlačenje na tricu · dunk zakucavanje · alley lob za suigrača · cut rezanje bez lopte · spot3 bez lopte čeka na trici
// steal/block/tight obrana (tight < 1 = bliže svom igraču)
const PDEF={label:'',drib:1,legs:1,dribR:1,fake:1,pass:1,three:1,mid:1,rim:1,lane:1,pull:1,dunk:1,alley:0,cut:1,spot3:0,steal:1,block:1,tight:1};
const PERS={
  streetballer:{label:'Streetballer',drib:2.2,legs:1.6,dribR:1.5,fake:1.8,pass:0.85,lane:1.15},
  sniper:{label:'Sniper',drib:0.8,fake:1.3,three:1.22,mid:0.8,rim:0.9,dunk:0.7,pull:5,cut:0.5,spot3:1.6},
  slasher:{label:'Slasher',drib:1.3,fake:0.8,pass:0.8,three:0.75,mid:0.8,rim:1.25,lane:0.4,pull:0.2,dunk:1.4,cut:2.2,spot3:-0.6},
  defender:{label:'Defender',drib:0.9,pass:1.15,three:0.95,steal:1.6,block:1.5,tight:0.8},
  showman:{label:'Showman',drib:1.3,legs:1.4,fake:1.2,rim:1.1,three:0.9,dunk:1.5,alley:0.3,cut:2}};
for(const k in PERS) PERS[k]=Object.assign({},PDEF,PERS[k]);
const ARCH_PERS={speed:'streetballer',shooter:'sniper',power:'slasher',defense:'defender'};
function persOf(p){ return PERS[p.info.pers||ARCH_PERS[p.info.arch]]||PDEF; }
const SPOTS=[[-6.9,1.2],[6.9,1.2],[-5.2,6.4],[5.2,6.4],[0,8.9],[-2.3,5.6],[2.3,5.6],[-2.9,2.2],[2.9,2.2],[-3.9,8.3],[3.9,8.3]].map(a=>new V3(a[0],0,a[1]));
const CUT=new V3(0,0,2.5);
function moveTo(p,tgt,sp,dt,react){
  if(react) p.ai.tgt.lerp(tgt,1-Math.exp(-dt*1.2/react)); else p.ai.tgt.copy(tgt);
  const dx=p.ai.tgt.x-p.pos.x, dz=p.ai.tgt.z-p.pos.z, d=Math.hypot(dx,dz);
  const s=d<0.2?0:Math.min(sp,d*3.2), a=Math.min(1,10*dt);
  const vx=d>1e-4?dx/d*s:0, vz=d>1e-4?dz/d*s:0;
  p.vel.x+=(vx-p.vel.x)*a; p.vel.z+=(vz-p.vel.z)*a;
}
function offBall(p,dt){
  const a=p.ai, holder=ball.holder||(ball.state==='pass'?ball.passTo:null)||mateOf(p);
  a.spotT-=dt;
  if(!a.spot||a.spotT<=0||flat(a.spot,holder.pos)<2.5){
    const nc=game.needsClear[p.team], P=persOf(p); let best=null,bs=-1e9;
    for(const s of SPOTS){ if(nc&&!isThree(s.x,s.z))continue; const dh=flat(s,holder.pos); if(dh<3)continue;
      const sc=Math.min(oppDist(s,p.team),4)+Math.min(dh,6)*0.3+Math.random()*1.5-flat(s,p.pos)*0.1+(isThree(s.x,s.z)?P.spot3:0); if(sc>bs){bs=sc;best=s;} }
    if(!nc&&Math.random()<0.18*P.cut&&flat(CUT,holder.pos)>3) best=CUT;
    a.spot=best||SPOTS[4]; a.spotT=rand(1.6,3.2);
  }
  return a.spot;
}
function defend(p,dt,Dx){
  const m=p.man, toH=new V3(-m.pos.x,0,HOOP_Z-m.pos.z), L=toH.length()||1, P=persOf(p); toH.divideScalar(L);
  let tgt;
  if(ball.holder===m){
    tgt=m.pos.clone().addScaledVector(toH,Math.min(0.95,L*0.5)*P.tight);
    const d=flat(p.pos,m.pos);
    if(d<1.05&&!m.shooting&&!m.dunking&&m.moveT<=0&&p.beatT<=0&&p.stealCd<=0&&Math.random()<Dx.steal*p.st.stl*P.steal*dt){ p.stealCd=1; p.reachT=0.25; doSteal(p,m); return null; }
    if((m.shooting||m.dunking)&&!p.ai.blockTried&&p.bitT<=0&&d<1.7){ p.ai.blockTried=true; if(Math.random()<Math.min(0.95,Dx.jump*p.st.blk*P.block)){ jump(p); p.vel.set((m.pos.x-p.pos.x)*2,0,(m.pos.z-p.pos.z)*2); } }
  } else {
    tgt=m.pos.clone().addScaledVector(toH,Math.min(1.8,L*0.45));
    const h=ball.holder; if(h){ tgt.x+=(h.pos.x-m.pos.x)*0.2; tgt.z+=(h.pos.z-m.pos.z)*0.2; }
  }
  return tgt;
}
function aiHandler(p,dt,Dx){
  const a=p.ai; a.t-=dt;
  if(a.t<=0){
    a.t=rand(0.25,0.55)*(Dx.react/0.5);
    const mate=mateOf(p);
    if(game.needsClear[p.team]){
      const dir=new V3(p.pos.x,0,p.pos.z-HOOP_Z); if(dir.z<1)dir.z=1; dir.normalize();
      a.goal=clampCourt(new V3(dir.x*7.7,0,HOOP_Z+dir.z*7.7));
      if(isThree(mate.pos.x,mate.pos.z)&&oppDist(mate.pos,p.team)>2.2&&a.passCd<=0&&Math.random()<0.4&&laneOpen(p,mate)){ doPass(p,mate); return; }
    } else {
      const d=hoopDist(p.pos), open=oppDist(p.pos,p.team), P=persOf(p), zone=isThree(p.pos.x,p.pos.z)?P.three:d<2.5?P.rim:P.mid;
      const sv=shotValue(p.pos,p.team)*p.st.shot*zone, mv=shotValue(mate.pos,p.team)*mate.st.shot*0.92*(laneOpen(p,mate)?1:0.3);
      if(canDunk(p,true)&&open>0.6/p.st.dunk&&Math.random()<Math.min(0.95,0.7*p.st.dunk*P.dunk)){ startDunk(p); return; }
      // showman (dodavač ili primač): lob za alley-oop kad suigrač (AI) reže prema košu i slobodan je
      const al=Math.max(P.alley,persOf(mate).alley);
      if(al&&a.passCd<=0&&!isHuman(mate)&&mate.y===0&&!mate.shooting&&flat(mate.pos,CUT)<3.2&&oppDist(mate.pos,p.team)>1.2&&Math.random()<al){ tryAlley(p); return; }
      if(p.fakeT<=0&&open<1.2&&d<6.5&&game.shotClock>3&&Math.random()<0.1*P.fake){ pumpFake(p); a.t=0.4; return; }
      if(game.shotClock<2.2||sv>=0.5||(d<1.8&&open>0.8)){ aiShoot(p,Dx); return; }
      if(mv>sv+0.12&&a.passCd<=0&&Math.random()<Math.min(0.95,0.75*P.pass)){ doPass(p,mate); return; }
      const toH=new V3(-p.pos.x,0,HOOP_Z+0.8-p.pos.z).normalize(), side=new V3(-toH.z,0,toH.x);
      const def=nearestOpp(p.pos,p.team);
      if(def&&flat(def.pos,p.pos)<1.6){ const rel=new V3(def.pos.x-p.pos.x,0,def.pos.z-p.pos.z); if(rel.dot(toH)>0) a.dodge=rel.dot(side)>0?-1:1; }
      if(def&&flat(def.pos,p.pos)<1.3*P.dribR&&p.moveCd<=0&&Math.random()<Math.min(0.9,0.22*p.st.drib*P.drib)){ const dd=(!isThree(p.pos.x,p.pos.z)&&d<8.3&&Math.random()<0.35*P.legs)?toH.clone().negate():side.clone().multiplyScalar(a.dodge).addScaledVector(toH,0.6).normalize(); dribbleMove(p,dd.x,dd.z); return; }
      if(Math.random()<0.15) a.dodge*=-1;
      a.goal=clampCourt(p.pos.clone().addScaledVector(toH,2.5).addScaledVector(side,a.dodge*(d<4.5&&open>1?0.3:1.8*P.lane)));
      if(d<4.5) a.t=Math.min(a.t,0.2);
      if(!isThree(p.pos.x,p.pos.z)&&Math.random()<0.1*P.pull){ const dir=new V3(p.pos.x,0,p.pos.z-HOOP_Z).normalize(); a.goal=clampCourt(new V3(dir.x*7.3,0,HOOP_Z+Math.max(dir.z,0.3)*7.3)); }
    }
  }
  if(p.moveT>0) return;
  if(p.fakeT>0){ p.vel.multiplyScalar(Math.exp(-14*dt)); return; }
  moveTo(p,a.goal||p.pos,4.9*Dx.speed*p.st.spd,dt,null);
}
function nearestOfTeam(p){ let b=null,bd=1e9; for(const q of teams[p.team]){ const d=flat(q.pos,ball.pos); if(d<bd){bd=d;b=q;} } return b===p; }
function updateAI(p,dt){
  const Dx=p.team===1?D:MATE;
  if(p.dunking) return;
  if(p.beatT>0){ p.vel.multiplyScalar(Math.exp(-8*dt)); return; }
  if(p.shooting){ if(ball.holder===p&&p.shootT>=p.ai.releaseAt) releaseShot(p,p.ai.q); p.vel.multiplyScalar(0.9); return; }
  if(p.y>0) return;
  let tgt=null, sp=5.2*Dx.speed*p.st.spd, react=Dx.react;
  const st=ball.state;
  if(st==='held'){
    if(ball.holder===p){ aiHandler(p,dt,Dx); return; }
    if(ball.holder.team===p.team){ tgt=offBall(p,dt); sp*=0.85; react=null; }
    else { tgt=defend(p,dt,Dx); if(!tgt) return; }
  } else if(st==='pass'){
    if(ball.passTo===p&&ball.isAlley){
      const spot=new V3(0,0,HOOP_Z+1.0), left=ball.T-ball.flightT;
      if(!p.ai.alleyJumped&&left<=0.36&&flat(p.pos,spot)<1.7){
        p.ai.alleyJumped=true; p.jumpCd=0; p.vy=JUMP_V*1.25;
        p.vel.set(clamp((0-p.pos.x)/0.34,-4,4),0,clamp((HOOP_Z+0.5-p.pos.z)/0.34,-4,4)); return; }
      tgt=spot; sp*=1.3; react=null;
    }
    else if(ball.passTo===p){ tgt=ball.pos.clone(); sp*=0.5; react=null; }
    else if(ball.passTeam===p.team){ tgt=offBall(p,dt); react=null; }
    else if(flat(p.pos,ball.pos)<2.2){ tgt=ball.pos.clone(); react=null; }
    else { tgt=defend(p,dt,Dx); if(!tgt) return; }
  } else {
    const live=st==='loose'||ball.touchedRim||ball.vel.y<0;
    if(live&&(nearestOfTeam(p)||flat(p.pos,ball.pos)<2.5)){
      tgt=new V3(ball.pos.x+ball.vel.x*0.25,0,ball.pos.z+ball.vel.z*0.25); react=null; sp*=1.05;
      if(flat(p.pos,ball.pos)<1.1&&ball.pos.y>2.3&&ball.pos.y<3.5&&ball.vel.y<=0.5) jump(p);
    } else {
      const dir=new V3(p.pos.x,0,p.pos.z-HOOP_Z), L=dir.length()||1, r=clamp(L,1.8,3.2);
      tgt=new V3(dir.x/L*r,0,HOOP_Z+dir.z/L*r); react=null;
    }
  }
  moveTo(p,clampCourt(tgt.clone()),sp,dt,react);
}
