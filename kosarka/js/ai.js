// ===== Košarka 2 na 2 - AI: osobnosti, pozicije bez lopte, obrana, odluke s loptom =====
'use strict';
// ---------- AI ----------
// osobnosti: množitelji na postojećim odlukama AI-a (1 = bez promjene), težina (Lako/Normalno/Teško) ostaje ista
// drib/legs/dribR dribling potezi · fake finte · pass dodavanje · three/mid/rim sklonost šutu po zoni · lane širina prodora
// pull povlačenje na tricu · dunk zakucavanje · alley lob za suigrača · cut rezanje bez lopte · spot3 bez lopte čeka na trici
// steal/block/tight obrana (tight < 1 = bliže svom igraču)
// samo za botove suigrače (karijera): post ostaje pod košem · reb uvijek ide na skok · help blokira bilo koga blizu koša
//   press agresivno pritišće igrača s loptom · passBias lakše dodaje · alleyHuman lob i čovjeku koji reže prema košu
const PDEF={label:'',drib:1,legs:1,dribR:1,fake:1,pass:1,three:1,mid:1,rim:1,lane:1,pull:1,dunk:1,alley:0,cut:1,spot3:0,steal:1,block:1,tight:1,
  post:0,reb:0,help:0,press:0,passBias:0,alleyHuman:0};
const PERS={
  streetballer:{label:T('osobnost.streetballer'),drib:2.2,legs:1.6,dribR:1.5,fake:1.8,pass:0.85,lane:1.15},
  sniper:{label:T('osobnost.sniper'),drib:0.8,fake:1.3,three:1.22,mid:0.8,rim:0.9,dunk:0.7,pull:5,cut:0.5,spot3:1.6},
  slasher:{label:T('osobnost.slasher'),drib:1.3,fake:0.8,pass:0.8,three:0.75,mid:0.8,rim:1.25,lane:0.4,pull:0.2,dunk:1.4,cut:2.2,spot3:-0.6},
  defender:{label:T('osobnost.defender'),drib:0.9,pass:1.15,three:0.95,steal:1.6,block:1.5,tight:0.8},
  showman:{label:T('osobnost.showman'),drib:1.3,legs:1.4,fake:1.2,rim:1.1,three:0.9,dunk:1.5,alley:0.3,cut:2},
  // tipovi botova suigrača (botovi.js); all-round bot nema svoju osobnost = kao prije
  bot_suter:{label:T('botTip.suter'),drib:0.7,fake:1.2,three:1.4,mid:0.85,rim:0.85,dunk:0.6,pull:6,cut:0.1,spot3:3},
  bot_centar:{label:T('botTip.centar'),drib:0.5,legs:0.5,fake:0.7,three:0.4,mid:0.8,rim:1.4,pull:0,dunk:1.2,cut:0.6,spot3:-3,block:1.6,post:1,reb:1,help:1},
  bot_organizator:{label:T('botTip.organizator'),drib:1.2,fake:1.1,pass:1.6,passBias:0.12,three:0.95,alley:0.35,alleyHuman:1,cut:0.6},
  bot_branic:{label:T('botTip.branic'),drib:0.8,pass:1.1,steal:2,block:1.3,tight:0.55,press:1},
  bot_zakucavac:{label:T('botTip.zakucavac'),drib:1.3,fake:0.7,pass:0.8,three:0.5,mid:0.7,rim:1.4,lane:0.35,pull:0,dunk:2,cut:3.5,spot3:-2}};
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
    // šuter bot (spot3 >= 3) čeka samo iza linije za 3, na najbližem mjestu, i tamo ostaje dulje
    const sut=P.spot3>=3;
    for(const s of SPOTS){ if((nc||sut)&&!isThree(s.x,s.z))continue; const dh=flat(s,holder.pos); if(dh<3)continue;
      const sc=Math.min(oppDist(s,p.team),4)+Math.min(dh,6)*0.3+Math.random()*1.5-flat(s,p.pos)*(sut?0.5:0.1)+(isThree(s.x,s.z)?P.spot3:0); if(sc>bs){bs=sc;best=s;} }
    if(!nc&&Math.random()<0.18*P.cut&&flat(CUT,holder.pos)>3) best=CUT;
    // centar: ostaje pod košem, na suprotnoj strani od lopte
    if(!nc&&P.post) best=new V3((holder.pos.x>0?-1.7:1.7),0,HOOP_Z+1.2);
    a.spot=best||SPOTS[4]; a.spotT=rand(1.6,3.2)*(sut?2:1);
  }
  return a.spot;
}
function defend(p,dt,Dx){
  const m=p.man, toH=new V3(-m.pos.x,0,HOOP_Z-m.pos.z), L=toH.length()||1, P=persOf(p); toH.divideScalar(L);
  const press=pressing(p);   // branič ili naredba "Pritisni!": tik uz igrača, češće i dalje krade
  let tgt;
  if(ball.holder===m){
    tgt=m.pos.clone().addScaledVector(toH,Math.min(0.95,L*0.5)*(press?Math.min(P.tight,0.55):P.tight));
    const d=flat(p.pos,m.pos), sr=press?1.25:1.05, sk=press?Math.max(P.steal,1.8):P.steal;
    if(d<sr&&!m.shooting&&!m.dunking&&m.moveT<=0&&!(game.faza&&game.faza.by===m)&&p.beatT<=0&&p.stealCd<=0&&Math.random()<Dx.steal*p.st.stl*sk*dt){ p.stealCd=1; p.reachT=0.25; doSteal(p,m); return null; }
    // AI ponekad faulira šutera (pokušaj krađe u pokretu šuta) → 1 slobodno; češće na težoj razini (AI_FAUL, nastavak.js)
    if(!game.solo&&m.shooting&&!p.ai.faulTried&&p.bitT<=0&&d<1.3){ p.ai.faulTried=true;
      if(Math.random()<(p.team===1?AI_FAUL[game.diffIdx]:AI_FAUL_SUIGRAC)){ p.reachT=0.25; faulNaSutu(p,m); return null; } }
    if((m.shooting||m.dunking)&&!p.ai.blockTried&&p.bitT<=0&&d<1.7){ p.ai.blockTried=true; if(Math.random()<Math.min(0.95,Dx.jump*p.st.blk*P.block)){ jump(p); p.vel.set((m.pos.x-p.pos.x)*2,0,(m.pos.z-p.pos.z)*2); } }
  } else {
    tgt=m.pos.clone().addScaledVector(toH,Math.min(1.8,L*0.45));
    const h=ball.holder; if(h){ tgt.x+=(h.pos.x-m.pos.x)*0.2; tgt.z+=(h.pos.z-m.pos.z)*0.2; }
    // centar: pomaže pod košem i blokira svakoga tko šutira ili zakucava blizu njega
    if(P.help){ tgt.lerp(new V3(0,0,HOOP_Z+1.4),0.35);
      if(h&&h.team!==p.team&&(h.shooting||h.dunking)&&!p.ai.blockTried&&p.bitT<=0&&flat(p.pos,h.pos)<2.6){ p.ai.blockTried=true;
        if(Math.random()<Math.min(0.95,Dx.jump*p.st.blk*P.block)){ jump(p); p.vel.set((h.pos.x-p.pos.x)*2.6,0,(h.pos.z-p.pos.z)*2.6); } } }
  }
  // izvođenje: branič primatelja zatvara put dodavanja (između izvođača i primatelja), branič izvođača stoji pred njim
  const fz=game.faza;
  if(fz&&fz.vrsta==='uvod'&&m.team===fz.tim){ const by=fz.by, prim=mateOf(by);
    if(m===prim){ const k=new V3(by.pos.x-m.pos.x,0,by.pos.z-m.pos.z), Lk=k.length()||1; tgt=m.pos.clone().addScaledVector(k,Math.min(0.9,Lk*0.4)/Lk); }
    else { const k=new V3(prim.pos.x-by.pos.x,0,prim.pos.z-by.pos.z).normalize(); tgt=by.pos.clone().addScaledVector(k,1.1); }
    clampCourt(tgt); }
  return tgt;
}
const pressing=p=>persOf(p).press>0||p.ai.pressT>0;
// naredbe čovjeka botu suigraču (karijera): 'lopta' doda ako ima slobodan put, 'sut' šutira čim je iole otvoren
function aiNaredba(p,Dx){
  const c=p.ai.cmd, mate=mateOf(p); if(!c||p.shooting||p.dunking||p.gather||p.moveT>0||p.y>0.02) return false;
  if(c.k==='lopta'&&laneOpen(p,mate)){ p.ai.cmd=null; doPass(p,mate); return true; }
  if(c.k==='sut'&&!game.needsClear[p.team]&&hoopDist(p.pos)<9.5&&oppDist(p.pos,p.team)>0.8){ p.ai.cmd=null; aiShoot(p,Dx); return true; }
  return false; }
function aiHandler(p,dt,Dx){
  const a=p.ai; a.t-=dt;
  if(aiNaredba(p,Dx)) return;
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
      // organizator lobira i čovjeku, ali samo kad zaista trči prema košu (čovjek mora skočiti)
      const prima=!isHuman(mate)||(P.alleyHuman&&(mate.vel.x*-mate.pos.x+mate.vel.z*(HOOP_Z-mate.pos.z))/(hoopDist(mate.pos)||1)>2);
      if(al&&a.passCd<=0&&prima&&mate.y===0&&!mate.shooting&&flat(mate.pos,CUT)<3.2&&oppDist(mate.pos,p.team)>1.2&&Math.random()<al){ tryAlley(p); if(isHuman(mate)) oblacic(p,T('naredba.alleySkoci')); return; }
      if(p.fakeT<=0&&open<1.2&&d<6.5&&game.shotClock>3&&Math.random()<0.1*P.fake){ pumpFake(p); a.t=0.4; return; }
      if(game.shotClock<2.2||sv>=0.5||(d<1.8&&open>0.8)){ aiShoot(p,Dx); return; }
      if(mv>sv+0.12-P.passBias&&a.passCd<=0&&Math.random()<Math.min(0.95,0.75*P.pass)){ doPass(p,mate); return; }
      // organizator: dodaje i slobodnom suigraču kad sam nema dobar šut
      if(P.passBias&&a.passCd<=0&&sv<0.4&&oppDist(mate.pos,p.team)>1.8&&laneOpen(p,mate)&&Math.random()<P.passBias*2){ doPass(p,mate); return; }
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
  const Dx=p.team===1?D:MATE, P=persOf(p);
  if(p.ai.cmd&&(p.ai.cmd.t-=dt)<=0) p.ai.cmd=null;
  if(p.ai.pressT>0) p.ai.pressT-=dt;
  if(p.dunking) return;
  // izvođenje (nastavak.js): izvođač čeka i dodaje, suigrač se otvara; obrana brani normalno
  const fz=game.faza;
  if(fz&&fz.vrsta==='uvod'){ if(p===fz.by){ aiUvod(p,dt,fz); return; }
    if(p.team===fz.tim){ moveTo(p,uvodCilj(p,dt,fz),5.2*Dx.speed*p.st.spd,dt,null); return; } }
  if(p.beatT>0){ p.vel.multiplyScalar(Math.exp(-8*dt)); return; }
  if(p.shooting){ if(ball.holder===p&&p.shootT>=p.ai.releaseAt) releaseShot(p,p.ai.q); p.vel.multiplyScalar(0.9); return; }
  if(p.y>0.02) return;   // u zraku
  let tgt=null, sp=5.2*Dx.speed*p.st.spd, react=Dx.react;
  const st=ball.state;
  if(st==='held'){
    if(ball.holder===p){ aiHandler(p,dt,Dx); return; }
    if(ball.holder.team===p.team){ tgt=offBall(p,dt); sp*=0.85; react=null; }
    else { tgt=defend(p,dt,Dx); if(!tgt) return; if(pressing(p)) react*=0.5; }
  } else if(st==='pass'){
    if(ball.passTo===p&&ball.isAlley){
      const spot=new V3(0,0,HOOP_Z+1.0), left=ball.T-ball.flightT;
      if(!p.ai.alleyJumped&&left<=0.36&&flat(p.pos,spot)<1.7){
        p.ai.alleyJumped=true; p.jumpCd=0; p.vy=JUMP_V*1.25;
        p.vel.set(clamp((0-p.pos.x)/0.34,-4,4),0,clamp((HOOP_Z+0.5-p.pos.z)/0.34,-4,4)); return; }
      tgt=spot; sp*=1.3; react=null;
    }
    // primatelj trči punom brzinom na mjesto gdje lopta pada (ball.passTgt)
    else if(ball.passTo===p){ tgt=ball.passTgt?new V3(ball.passTgt.x,0,ball.passTgt.z):ball.pos.clone(); react=null; }
    else if(ball.passTeam===p.team){ tgt=offBall(p,dt); react=null; }
    else if(flat(p.pos,ball.pos)<2.2){ tgt=ball.pos.clone(); react=null; }
    else { tgt=defend(p,dt,Dx); if(!tgt) return; }
  } else {
    // na loptu kreću tek kad je skok stvaran (udarila obruč/tablu ili šut u prazno), ne dok šut još leti prema košu
    let live=st==='loose'||ball.touchedRim||ball.flightT>ball.T+0.05;
    // skok: botovi reagiraju s kašnjenjem prema težini (Lako 0.4 s, Normalno 0.25 s, Teško 0.12 s)
    if(live&&ball.rebAt!=null&&(game.clock||0)-ball.rebAt<[0.4,0.25,0.12][game.diffIdx]){ p.vel.multiplyScalar(Math.exp(-6*dt)); return; }   // još nije reagirao: usporava i stoji
    if(live&&(nearestOfTeam(p)||flat(p.pos,ball.pos)<2.5||P.reb)){   // centar uvijek ide na skok
      // trče na predviđeno mjesto pada, ali malo netočno dok nisu blizu lopte
      if(p.ai.rebId!==ball.rebAt){ p.ai.rebId=ball.rebAt; const e=[1.1,0.8,0.5][game.diffIdx]*Math.sqrt(Math.random()), a=Math.random()*6.283; p.ai.rebErr=new V3(Math.cos(a)*e,0,Math.sin(a)*e); }
      tgt=skokCilj(new V3()); if(p.ai.rebErr&&flat(p.pos,ball.pos)>1.2) tgt.add(p.ai.rebErr.clone().multiplyScalar(P.reb?0.5:1)); react=null; sp*=P.reb?1.08:0.95;   // na skok trče, ne sprintaju (centar brže i točnije)
      if(flat(p.pos,ball.pos)<(P.reb?1.4:1.1)&&ball.pos.y>2.3&&ball.pos.y<3.5&&ball.vel.y<=0.5) jump(p);
    } else {
      const dir=new V3(p.pos.x,0,p.pos.z-HOOP_Z), L=dir.length()||1, r=clamp(L,1.8,3.2);
      tgt=new V3(dir.x/L*r,0,HOOP_Z+dir.z/L*r); react=null;
    }
  }
  moveTo(p,clampCourt(tgt.clone()),sp,dt,react);
}
