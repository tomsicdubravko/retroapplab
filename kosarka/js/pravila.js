// ===== Košarka 2 na 2 - pravila: posjed, šut, dunk, dodavanje, krađa, blok, koš, check, korak igre =====
'use strict';
// ---------- core actions ----------
function setControlled(p){ game.controlled=p; }
function nearestOpp(pos,team){ let b=null,bd=1e9; for(const o of teams[1-team]){const d=flat(o.pos,pos); if(d<bd){bd=d;b=o;}} return b; }
function oppDist(pos,team){ let bd=1e9; for(const o of teams[1-team]) bd=Math.min(bd,flat(o.pos,pos)); return bd; }
function baseProb(d){
  if(d<1.6) return .82;
  if(d<3) return .82+(.6-.82)*(d-1.6)/1.4;
  if(d<6.75) return .6+(.44-.6)*(d-3)/3.75;
  if(d<9) return .44+(.22-.44)*(d-6.75)/2.25;
  return Math.max(.03,.22-(d-9)*.06);
}
function contestF(p){ let dd=9; for(const o of teams[1-p.team]){ let d=flat(o.pos,p.pos); if(o.bitT>0)d*=2.5; else if(o.y>0.1)d*=0.75; dd=Math.min(dd,d);} return clamp(0.42+dd*0.36,0.42,1); }
function shotValue(pos,team){ const d=hoopDist(pos); return baseProb(d)*clamp(0.42+oppDist(pos,team)*0.36,0.42,1)*(isThree(pos.x,pos.z)?1.35:1)*(d<9?1:0.2); }
function laneOpen(a,b){
  const ax=a.pos.x,az=a.pos.z,dx=b.pos.x-ax,dz=b.pos.z-az,L2=dx*dx+dz*dz||1;
  for(const o of teams[1-a.team]){ const t=clamp(((o.pos.x-ax)*dx+(o.pos.z-az)*dz)/L2,0,1); if(Math.hypot(ax+dx*t-o.pos.x,az+dz*t-o.pos.z)<0.8) return false; }
  return true;
}
function ballistic(p0,p1,T){ return new V3((p1.x-p0.x)/T,(p1.y-p0.y+0.5*G*T*T)/T,(p1.z-p0.z)/T); }
function jump(p,f){ if(p.y===0&&p.vy===0&&p.jumpCd<=0){ p.vy=JUMP_V*(f||0.95)*(p.st?p.st.jump:1); p.jumpCd=0.75; } }

function gain(p,how){
  const prev=game.possession; if(how==='steal'){ stat(p,'stl'); taunt(p); }
  // za asistenciju: tko je dodao i kada (ball.noPick je dodavač dok se lopta ne uhvati)
  if(how==='pass'&&ball.noPick&&ball.noPick!==p&&ball.noPick.team===p.team){ p.assistBy=ball.noPick; p.assistT=game.clock||0; } else p.assistBy=null;
  ball.state='held'; ball.holder=p; ball.vel.set(0,0,0); ball.lastTouchTeam=p.team; ball.noPick=null; ball.isAlley=false; ball.dunk=false; ball.alley=false;
  if(p.team!==game.possession){ game.possession=p.team; game.needsClear[p.team]=true; game.shotClock=SHOT_CLOCK; }
  else if(ball.wasShot&&ball.touchedRim) game.shotClock=SHOT_CLOCK;
  ball.wasShot=false;
  p.ai.t=0.3; p.ai.goal=null;
  if(game.mp||game.local){}
  else if(p.team===0) setControlled(p);
  else if(prev===0){ let b=null,bd=1e9; for(const q of teams[0]){const d=flat(q.pos,p.pos); if(d<bd){bd=d;b=q;}} setControlled(b); }
}
// dribling potez: krosover u smjeru joysticka ili spin pored braniča
function dribbleMove(p,ix,iz){
  if(ball.holder!==p||p.shooting||p.dunking||p.gather||p.fakeT>0||p.y>0||p.moveCd>0||game.mode!=='play') return;
  const toH=new V3(-p.pos.x,0,HOOP_Z-p.pos.z).normalize(), side=new V3(-toH.z,0,toH.x);
  const def=nearestOpp(p.pos,p.team);
  const il=Math.hypot(ix,iz), back=il>0.3&&(ix*toH.x+iz*toH.z)/il<-0.5;
  if(back){ p.moveDir.set(ix,0,iz).normalize(); p.moveKind='legs'; p.dribSide*=-1; }
  else if(il>0.3){ p.moveDir.set(ix,0,iz).normalize(); p.moveKind='cross'; p.dribSide*=-1; }
  else { let sd=1; if(def){ const rel=new V3(def.pos.x-p.pos.x,0,def.pos.z-p.pos.z); sd=rel.dot(side)>0?-1:1; }
    p.moveDir.copy(toH).multiplyScalar(0.7).addScaledVector(side,0.7*sd).normalize(); p.moveKind='spin'; p.spinA=0; }
  const legs=p.moveKind==='legs', msp=(legs?6.2:7.4)*p.st.spd;
  p.moveT=legs?0.38:0.34; p.moveCd=1.1*p.st.dribCd; p.vel.set(p.moveDir.x*msp,0,p.moveDir.z*msp);
  sfx.dribble(); setTimeout(()=>sfx.dribble(),90);
  fbFor(p,legs?'Kroz noge':p.moveKind==='cross'?'Krosover':'Spin','#8fb6ff');
  let beat=false, fell=null;
  for(const o of teams[1-p.team]){
    const d=flat(o.pos,p.pos); if(d>2.0||o.y>0) continue;
    const lose=(isHuman(o)?0.05:(o.team===1?[0.05,0.1,0.16][game.diffIdx]:0.08))*o.st.stl;
    if(d<0.9&&Math.random()<lose){ doSteal(o,p); return; }
    const bc=Math.min(0.95,(isHuman(o)?0.5:(o.team===1?[0.85,0.7,0.55][game.diffIdx]:0.6))*p.st.drib/o.st.def);
    if(Math.random()<bc){ o.beatT=isHuman(o)?0.45:0.75; o.vel.multiplyScalar(0.15); beat=true;
      if(legs&&Math.random()<(isHuman(o)?0.15:0.3)){ const ft=isHuman(o)?0.8:1.3; o.fallT=o.fallMax=ft; o.beatT=ft; o.fallZ=0; fell=o; }
      // krosover: branič se preveslao na krivu stranu i pada bočno
      else if(p.moveKind==='cross'&&!fell&&Math.random()<Math.min(0.45,(isHuman(o)?0.1:0.24)*p.st.drib/o.st.def)){
        const ft=isHuman(o)?0.9:1.5; o.fallT=o.fallMax=ft; o.beatT=ft; o.vel.set(0,0,0);
        const rx=Math.cos(o.face), rz=-Math.sin(o.face); o.fallZ=(p.moveDir.x*rx+p.moveDir.z*rz)>0?-1:1; fell=o; } }
  }
  const mine=p.team===0||game.mp;
  if(fell){ stat(p,'ab'); taunt(p,'Sjedi.'); }
  if(fell&&p.moveKind==='cross'){
    // ANKLE BREAKER: kratki zum, jaka usporena snimka, pad, publika
    const fi=players.indexOf(fell);
    if(isHuman(fell)&&!game.mp) hype('ANKLE BREAKER!',p.info.name+' ti je slomio gležnjeve','red',{dur:1.5,shake:0.25,slow:0.75,slowF:0.2,punch:0.5,edge:1,focus:fi});
    else { hype('ANKLE BREAKER!',fell.info.name+' je na podu','ankle',{dur:2,shake:0.3,flash:0.15,slow:0.75,slowF:0.2,punch:0.8,edge:1,focus:fi,wob:1});
      burst(fell.pos.x,0.4,fell.pos.z,36,3,[0xffb020,0xff3fa4,0xffffff,COLS[p.team].j]); }
    crowd('lean',mine?2.8:1.4); sfx.ooh(); if(mine) setTimeout(()=>sfx.cheer(),380);
  }
  else if(fell){
    // najveći show: branič sjedne na pod
    fell.fallT=fell.fallMax=Math.max(fell.fallMax,isHuman(fell)?1.0:1.7); fell.beatT=fell.fallT;
    const fi=players.indexOf(fell);
    if(isHuman(fell)&&!game.mp) hype('SJEO SI!',p.info.name+' ti je slomio gležnjeve','red',{dur:1.4,shake:0.25,slow:0.5,edge:1,focus:fi});
    else { hype(fell.info.she?'SHE SAT DOWN!':'HE SAT DOWN!',fell.info.name+' je na podu','sat',{dur:2,shake:0.35,flash:0.18,slow:0.9,punch:0.7,edge:1,focus:fi,wob:1});
      crowd('lean',2.6); sfx.ooh(); setTimeout(()=>sfx.cheer(),350);
      burst(fell.pos.x,0.4,fell.pos.z,40,3.2,[0xffd23f,0xff3fa4,0xffffff,COLS[p.team].j]); }
  }
  else if(beat&&p.moveKind==='cross'){
    // obični krosover bez pada; ANKLE BREAKER je rezerviran za pad
    if(mine) hype('KROSOVER!',p.info.name+' ga je ostavio','ankle',{dur:1,shake:0.12,slow:0.2,punch:0.2});
    else hype('KROSOVER!',p.info.name+' te prošao','red',{dur:0.9,shake:0.1,slow:0.15});
    crowd('small',1); burst(p.pos.x,0.2,p.pos.z,18,2.4,[0xffffff,0xffb020,0xff3fa4]);
  }
  else if(beat){ flash(p.moveKind==='legs'?'KROZ NOGE!':(p.team===0?'PROŠAO!':'PROŠAO TE!'),'',0.7,p.team===0?'steal':'red'); burst(p.pos.x,0.2,p.pos.z,10,1.8,[0xffffff,0x9fd0ff]); }
}
function doSteal(p,h){ gain(p,'steal'); flash('UKRADENO!',p.team===0?'Iznesi loptu iza linije za 3':'',1,'steal'); sfx.whistle(); burst(p.pos.x,1.2,p.pos.z,12,2.2,[0xffd23f,0xffffff]); }

function startShot(p){
  p.shooting=true; p.shootT=0; p.vy=JUMP_V; p.vel.multiplyScalar(0.3);
  for(const o of players) o.ai.blockTried=false;
}
function aiShoot(p,Dx){ startShot(p); p.ai.releaseAt=AIR*(p.st.gather<1?0.4:0.5); p.ai.q=clamp(1-Math.abs(randn())*Dx.noise,0,1); }
function canDunk(p,ai){
  const d=hoopDist(p.pos); if(d<0.9||d>3.0+(p.st.dunk-1)*2||p.pos.z<HOOP_Z+0.2) return false;
  const sp=Math.hypot(p.vel.x,p.vel.z); if(sp<(ai?2:2.4)/p.st.dunk) return false;
  const tx=-p.pos.x/d, tz=(HOOP_Z-p.pos.z)/d;
  return (p.vel.x*tx+p.vel.z*tz)/sp>(ai?0.35:0.6);
}
// vrsta zakucavanja: kako dođeš, tako zakucaš (kut dolaska, brzina, udaljenost, branič)
const DUNKS={norm:'ZAKUCAVANJE!',two:'TWO-HAND SLAM!',one:'ONE-HAND JAM!',rev:'REVERSE!'};
function pickDunk(p){
  const d=hoopDist(p.pos), sp=Math.hypot(p.vel.x,p.vel.z), side=Math.abs(p.pos.x)/Math.max(d,0.01);
  const o=nearestOpp(p.pos,p.team), od=o?flat(o.pos,p.pos):9;
  if(side>0.72&&d<2.4) return 'rev';     // s boka, uz osnovnu liniju: prođe ispod obruča
  if(sp>5.2&&d>2.1) return 'one';        // brzo i iz daleka: jednom rukom iz leta
  if(od<1.8||p.st.dunk>1) return 'two';  // kroz kontakt ili power igrač: dvije ruke
  return 'norm';
}
// reverse završava s druge strane obruča, ostali ispred njega
function dunkTarget(p){
  const dir=new V3(p.dunkFrom.x,0,p.dunkFrom.z-HOOP_Z).normalize();
  if(p.dunkKind==='rev') p.dunkTo.set(-dir.x*0.45,0,HOOP_Z+Math.max(0.2,dir.z)*0.45);
  else p.dunkTo.set(dir.x*0.55,0,HOOP_Z+dir.z*0.55);
}
function startDunk(p){
  p.dunking=true; p.dunkT=0; p.dunkDone=false; p.gather=false; p.dunkFrom.copy(p.pos);
  p.dunkKind=pickDunk(p); p.dunkHang=p.dunkKind==='two'?0.22:0;
  dunkTarget(p); p.vel.set(0,0,0); p.vy=0;
  for(const o of players) o.ai.blockTried=false;
}
// zakucavanje (i završetak alley-oopa): lopta ide kroz obruč ili se odbije
function slam(p){
  if(game.solo&&ball.holder===p&&game.mode==='play') game.soloShots++;
  if(ball.holder!==p||game.mode!=='play') return;
  stat(p,'fga');
  for(const o of teams[1-p.team]){
    if(o.y>0.25&&o.bitT<=0&&flat(o.pos,p.pos)<1.0){
      const bc=(isHuman(o)?0.45:(o.team===1?D.block:MATE.block)*0.8)*o.st.blk/p.st.dunk;
      if(Math.random()<bc){ blockShot(o,p); return; }
    }
  }
  const make=Math.random()<clamp(0.93*(0.75+0.25*contestF(p))*p.st.dunk,0.5,0.98);
  const K=p.dunking?p.dunkKind:'norm';
  rimShake=K==='two'?0.85:0.5; sfx.dunk(); shake=K==='two'?0.55:K==='one'?0.45:0.4; rimFlash=0.5;
  burst(0,RIM_Y+0.05,HOOP_Z,K==='norm'?48:64,K==='norm'?4.6:5.4,[0xffa126,0xffe08a,0xffffff,0xff5a14]);
  Object.assign(ball,{state:'shot',holder:null,T:0.3,flightT:0,touchedRim:true,scored:false,shotTeam:p.team,shotValue:2,wasShot:true,noPick:p,lastTouchTeam:p.team,dunk:true,isAlley:false,dunkKind:K});
  // poster: branič je bio tik uz zakucavača
  const pd=nearestOpp(p.pos,p.team); ball.poster=pd&&flat(pd.pos,p.pos)<1.35?pd:null;
  if(make){ ball.pos.set(rand(-.03,.03),RIM_Y+0.2,HOOP_Z+rand(-.03,.03)); ball.vel.set(0,-5,0); }
  else { const dir=new V3(p.pos.x,0,p.pos.z-HOOP_Z).normalize();
    ball.pos.set(dir.x*0.32,RIM_Y+0.2,HOOP_Z+dir.z*0.32); ball.vel.set(dir.x*2.5+rand(-1,1),3,dir.z*2.5+rand(-.5,.5)); flash('Obruč!','',0.8); }
}
// finta šuta: branič koji nasjedne skoči u prazno i ne može blokirati dok ne padne
function pumpFake(p){
  p.fakeT=0.35; p.vel.multiplyScalar(0.2);
  for(const o of teams[1-p.team]){
    if(isHuman(o)||o.y>0||flat(o.pos,p.pos)>1.8) continue;
    const bite=o.team===1?0.3+D.react*0.5:0.5;
    if(Math.random()<bite){ o.jumpCd=0; jump(o,1); o.bitT=0.85; o.ai.blockTried=true; }
  }
  fbFor(p,'Finta','#ffa126');
}
function tryAlley(p){
  const mate=mateOf(p);
  if(game.needsClear[p.team]){ feedback('Prvo iznesi loptu','#ff8a7a'); return; }
  const tgt=new V3(0,RIM_Y+0.55,HOOP_Z+0.5), p0=new V3(p.pos.x,2.0,p.pos.z);
  const T=clamp(flat(p.pos,tgt)/7,1.0,1.4);
  ball.vel.copy(ballistic(p0,tgt,T)); ball.pos.copy(p0);
  Object.assign(ball,{state:'pass',holder:null,passTo:mate,passTeam:p.team,checked:new Set(),T,flightT:0,noPick:p,lastTouchTeam:p.team,wasShot:false,isAlley:true,dunk:false,alley:false});
  mate.ai.alleyJumped=false; p.ai.passCd=0.9; sfx.pass();
  fbFor(p,'Alley-oop','#8fb6ff');
}
function qualityFromT(t,w){ const f=t/AIR, e=Math.abs(f-0.5), z=0.09*(w||1); return e<z?1:clamp(1-(e-z)/0.3,0,1); }

function releaseShot(p,q){
  if(game.solo&&ball.holder===p) game.soloShots++;
  p.shooting=false;
  if(ball.holder!==p) return;
  p.relT=0.55;
  const d=hoopDist(p.pos), three=isThree(p.pos.x,p.pos.z);
  if(isHuman(p)){ const f=p.shootT/AIR; if(q>=0.99) fbFor(p,'Savršeno','#5fe08b'); else fbFor(p,f<0.5?'Rano':'Kasno','#ffb35c'); }
  if(d<1.6) q=Math.max(q,0.7);
  for(const o of teams[1-p.team]){
    if(o.y>0.12&&o.bitT<=0&&flat(o.pos,p.pos)<1.05){
      const bc=(isHuman(o)?0.5:(o.team===1?D.block:MATE.block))*o.st.blk*p.st.shield;
      if(Math.random()<bc){ blockShot(o,p); return; }
    }
  }
  let prob=baseProb(d)*(0.35+0.65*q)*contestF(p)*p.st.shot*(three&&p.st.three?p.st.three:1);
  if(p.team===1) prob*=D.aiShot;
  prob=clamp(prob,0.02,0.95);
  const make=Math.random()<prob;
  const dir=new V3(-p.pos.x,0,HOOP_Z-p.pos.z).normalize();
  const p0=new V3(p.pos.x,2.65+p.y,p.pos.z).addScaledVector(dir,0.28);
  const ang=Math.random()*Math.PI*2, off=make?Math.random()*0.04:rand(0.2,0.36);
  const tgt=new V3(Math.cos(ang)*off,RIM_Y+0.02,HOOP_Z+Math.sin(ang)*off);
  const T=d<1.7?0.6:0.78+d*0.07;
  ball.vel.copy(ballistic(p0,tgt,T)); ball.pos.copy(p0);
  Object.assign(ball,{state:'shot',holder:null,T,flightT:0,touchedRim:false,scored:false,shotTeam:p.team,shotValue:three?3:2,wasShot:true,noPick:p,lastTouchTeam:p.team,dunk:false,isAlley:false});
  stat(p,'fga'); if(three) stat(p,'tpa');
}
function blockShot(o,p){
  stat(o,'blk'); taunt(o,Math.random()<0.5?'Ne u mojoj kući.':null);
  ball.state='loose'; ball.holder=null; ball.flightT=0; ball.noPick=p; ball.lastTouchTeam=o.team; ball.wasShot=false; ball.dunk=false; ball.isAlley=false;
  ball.pos.set(p.pos.x,2.55+p.y,p.pos.z);
  const a=new V3(p.pos.x-o.pos.x,0,p.pos.z-o.pos.z).normalize();
  ball.vel.set(a.x*3.5+rand(-1,1),1.4,a.z*3.5+rand(-1,1));
  hype('BLOK!',o.info.name+' kaže ne','block',{dur:1,shake:0.3,flash:0.22,punch:0.25,slow:0.2}); sfx.board(); sfx.impact(); shake=Math.max(shake,0.15); burst(ball.pos.x,ball.pos.y,ball.pos.z,20,3,[0xffffff,0x9fd0ff,0xff3b5c]);
}
function doPass(from,to){
  const T=clamp(flat(from.pos,to.pos)/13,0.22,0.75);
  const tgt=clampCourt(new V3(to.pos.x+to.vel.x*T,0,to.pos.z+to.vel.z*T)); tgt.y=1.35+to.y;
  const dir=new V3(tgt.x-from.pos.x,0,tgt.z-from.pos.z).normalize();
  const p0=new V3(from.pos.x,1.4,from.pos.z).addScaledVector(dir,0.3);
  ball.vel.copy(ballistic(p0,tgt,T)); ball.pos.copy(p0);
  Object.assign(ball,{state:'pass',holder:null,passTo:to,passTeam:from.team,checked:new Set(),T,flightT:0,noPick:from,lastTouchTeam:from.team,wasShot:false,isAlley:false,dunk:false});
  from.ai.passCd=0.9; to.ai.passCd=0.6; sfx.pass();
}
function userSteal(p){
  const h=ball.holder; if(!h||h.team===p.team||p.stealCd>0) return;
  p.stealCd=0.6; p.reachT=0.25;
  if(p.beatT>0) return;
  if(flat(p.pos,h.pos)<1.3&&!h.shooting&&!h.dunking&&h.moveT<=0){
    const r=Math.random(), sc=0.35*p.st.stl;
    if(r<sc) doSteal(p,h);
    else if(r<sc+0.2){ flash('Faul','Lopta ostaje protivniku',1.1); sfx.whistle(); deadBall(h.team,1.3); }
  }
}

function onScore(){
  ball.scored=true; netAnim=0.45; sfx.swish();
  const t=ball.shotTeam;
  if(game.solo){ game.soloMade++; const sw=!ball.touchedRim&&!ball.dunk;
    let txt='KOŠ!', cls='blue'; if(ball.dunk){ txt='ZAKUCAVANJE!'; cls='dunk'; } else if(ball.shotValue===3){ txt=sw?'TRICA! SWISH!':'TRICA!'; cls='three'; } else if(sw){ txt='SWISH!'; cls='swish'; }
    if(sw) burst(0,RIM_Y-0.35,HOOP_Z,16,1.6,[0x9ff0ff,0xffffff]);
    const sub=game.soloMade+' / '+game.soloShots;
    if(ball.dunk) hype(DUNKS[ball.dunkKind]||DUNKS.norm,sub,'dunk',{dur:1.1,shake:0.45,flash:0.2,punch:0.3,edge:1});
    else if(ball.shotValue===3) hype('TRICA!',sub,'three',{dur:1,shake:0.22,flash:0.14,edge:1});
    else flash(txt,sub,0.9,cls);
    crowd(ball.dunk?'jump':ball.shotValue===3?'arms':'small',ball.dunk||ball.shotValue===3?1.4:0.8); return; }
  if(game.needsClear[t]){ flash('Ne vrijedi','Lopta nije iznesena iza linije za 3',1.5); sfx.whistle(); }
  else { game.score[t]+=ball.shotValue; crowd('small',t===0?1.4:0.5); if(t===0)sfx.cheer();
    const swish=!ball.touchedRim&&!ball.dunk, who=(t===0?'Plavi':'Crveni')+' +'+ball.shotValue, sc=ball.noPick, mine=t===0||game.mp;
    if(sc&&sc.team===t){ stat(sc,'pts',ball.shotValue); stat(sc,'fgm'); if(ball.shotValue===3) stat(sc,'tpm'); if(ball.dunk) stat(sc,'dunks'); if(t===1) taunt(sc);
      if(sc.assistBy&&(game.clock||0)-sc.assistT<=4) stat(sc.assistBy,'ast'); sc.assistBy=null; }
    let txt='KOŠ!', cls=t?'red':'blue';
    if(swish) burst(0,RIM_Y-0.35,HOOP_Z,16,1.6,[0x9ff0ff,0xffffff]);
    if(ball.dunk&&ball.poster){
      // POSTER: zakucavanje preko braniča, branič završi na podu
      const v=ball.poster; v.fallT=v.fallMax=1.2; v.beatT=1.2; v.fallZ=0;
      const kn={two:'Two-hand · ',one:'One-hand · ',rev:'Reverse · '}[ball.dunkKind]||'';
      hype('POSTER!',kn+(sc?sc.info.name+' preko: ':'')+v.info.name+' · +2',mine?'poster':'red',{dur:1.8,shake:0.8,flash:0.35,slow:0.6,punch:0.8,edge:1,wob:1});
      sfx.impact(); crowd('jump',mine?3.2:1.4); if(mine) setTimeout(()=>sfx.cheer(),300);
      burst(0,RIM_Y,HOOP_Z,60,5.5,[0xff3b1f,0xffd23f,0xffffff]); }
    else if(ball.dunk){ const K=ball.alley?'alley':ball.dunkKind||'norm';
      const o={alley:{slow:0.35,punch:0.45},two:{shake:0.7,flash:0.3,slow:0.25,punch:0.55},one:{slow:0.3,punch:0.55},rev:{slow:0.4,punch:0.5,wob:1},norm:{slow:0.2,punch:0.45}}[K];
      hype(ball.alley?'ALLEY-OOP!':DUNKS[K],who,mine?'dunk':'red',Object.assign({dur:1.4,shake:0.5,flash:0.25,edge:1},o)); sfx.impact();
      crowd('jump',mine?(K==='norm'?2:2.6):1.2); }
    else if(ball.shotValue===3){ crowd('arms',mine?2.2:1); hype(swish?'TRICA! SWISH!':'TRICA!',who,mine?'three':'red',{dur:1.3,shake:0.25,flash:0.16,punch:0.2,edge:1}); burst(0,RIM_Y,HOOP_Z,30,3,[0xb36bff,0x35d6ff,0xffffff]); }
    else flash(txt==='KOŠ!'&&swish?'SWISH!':txt,who,1.4,swish?'swish':cls); }
  deadBall(1-t,1.7);
  if(game.score[t]>=game.target) game.nextCheck='over';
}
function deadBall(next,t){ game.mode='dead'; game.pauseT=t; game.nextCheck=next; }
function outOfBounds(){ flash('Aut','',1); sfx.whistle(); deadBall(1-ball.lastTouchTeam,1.2); }
function turnover(text){ flash(text,'',1.2); sfx.buzzer(); deadBall(1-game.possession,1.3); }

function setupCheck(team){
  if(game.solo) team=0;
  const off=teams[team],def=teams[1-team],side=Math.random()<.5?-1:1;
  off[0].pos.set(0,0,9.6); off[1].pos.set(side*4.8,0,5.4);
  def[0].pos.set(0,0,8.4); def[1].pos.set(side*4.1,0,4.6);
  for(const p of players){ p.vel.set(0,0,0); p.y=0; p.vy=0; p.shooting=false; p.stealCd=0.5; p.jumpCd=0; p.dunking=false; p.gather=false; p.fakeT=0; p.bitT=0; p.passHolding=false; p.moveT=0; p.moveCd=0; p.beatT=0; p.fallT=0; p.spinA=0; p.dribSide=1; p.dribX=1;
    Object.assign(p.ai,{t:rand(.4,.8),spot:null,goal:null,blockTried:false,passCd:0.4}); p.ai.tgt.copy(p.pos);
    p.face=team===p.team?Math.PI:0; }
  off[0].ai.t=0.9;
  Object.assign(ball,{state:'held',holder:off[0],wasShot:false,lastTouchTeam:team,noPick:null,isAlley:false,dunk:false,alley:false}); ball.vel.set(0,0,0);
  game.possession=team; game.needsClear=[false,false]; game.shotClock=SHOT_CLOCK;
  game.controlled=team===0?off[0]:def[0];
  if(game.mp&&mpn.me) game.controlled=mpn.me;
  if(game.local&&game.localMain) game.controlled=game.localMain;
  if(game.solo) players.forEach(q=>{ if(q.active===false){ q.pos.set(40+q.team*6+q.idx*3,0,40); q.vel.set(0,0,0); } });
  game.mode='play';
}


function checkClear(){
  const h=ball.holder;
  if(ball.state==='held'&&game.needsClear[h.team]&&isThree(h.pos.x,h.pos.z)){ game.needsClear[h.team]=false; if(h.team===0) feedback('Iznesena','#5fe08b'); }
}

// ---------- steps ----------
function step(dt){
  game.clock=(game.clock||0)+dt;
  if(ball.state!=='shot'&&!game.solo){ game.shotClock-=dt; if(game.shotClock<=0){ game.shotClock=0; turnover('Isteklo vrijeme napada'); return; } }
  updateUser(dt);
  for(const p of players) if(!isHuman(p)&&p.active!==false&&game.mode==='play') updateAI(p,dt);
  for(const p of players) if(p.active!==false) physicsPlayer(p,dt);
  separate();
  updateBall(dt,true);
  if(game.mode==='play'&&ball.state==='held') checkClear();
}
function deadStep(dt){
  game.clock=(game.clock||0)+dt;
  for(const p of players){ if(p.active===false) continue; if(p.y===0) p.vel.multiplyScalar(Math.exp(-6*dt)); physicsPlayer(p,dt); }
  if(ball.state!=='held') { ball.flightT+=dt; ballPhysics(dt); }
  game.pauseT-=dt;
  if(game.pauseT<=0){
    if(game.nextCheck==='over') Utakmica.zavrsi();
    else { setupCheck(game.nextCheck); flash(game.mp?(game.possession===0?'Lopta plavima':'Lopta crvenima'):(game.possession===0?'Vaša lopta':'Lopta crvenima'),'',0.8); }
  }
}
