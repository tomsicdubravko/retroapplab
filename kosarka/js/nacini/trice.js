// ===== Košarka 2 na 2 - način: gađanje trica (zaseban modul) =====
'use strict';
// ======================= GAĐANJE TRICA (zaseban mod) =======================
const Trice=(()=>{
// zone: pola širine zelene zone na nišanu (u jedinicama −1…1; žuta je dvostruko šira) · sp: prolazi nišana u sekundi
const MODES=[{time:60,zone:0.2,sp:0.85},{time:50,zone:0.15,sp:1.05},{time:42,zone:0.11,sp:1.3}];
const PICK=0.21, RUN_MAX=9.1, RUN_K=5.7;   // uzimanje lopte (s) i trčanje do sljedećeg stalka (~30% brže nego prije)
const PERFECT_BONUS=1;                      // savršen šut dodaje sekundu na sat
let diffIdx=1, MODE=MODES[1];
const HOOP=new V3(0,0,HOOP_Z);
const STATIONS=[
  {name:T('trice.stalak.0'),x:-6.95,z:1.25,rack:[-6.95,2.4],axis:'x',cam:[-9.0,3.5,5.6]},
  {name:T('trice.stalak.1'),x:0,z:HOOP_Z+7.3,rack:[1.2,HOOP_Z+7.3],axis:'z',cam:[1.7,3.3,14.1]},
  {name:T('trice.stalak.2'),x:6.95,z:1.25,rack:[6.95,2.4],axis:'x',cam:[9.0,3.5,5.6]}];

// lopte
const TEX_BALL=ballTex();
function moneyTex(){ const c=document.createElement('canvas'); c.width=256; c.height=128; const g=c.getContext('2d');
  const cols=['#e33b2f','#ffffff','#2f6bff','#ffffff'];
  for(let i=0;i<8;i++){ g.fillStyle=cols[i%4]; g.fillRect(i*32,0,32,128); }
  g.strokeStyle='#1e0e05'; g.lineWidth=3; g.beginPath(); g.moveTo(0,64); g.lineTo(256,64); g.stroke();
  for(const x of [64,192]){ g.beginPath(); g.moveTo(x,0); g.lineTo(x,128); g.stroke(); }
  return new THREE.CanvasTexture(c); }
const TEX_MONEY=moneyTex();
const BALL_GEO=new THREE.SphereGeometry(BALL_R,20,14);
const MAT_BALL=new THREE.MeshLambertMaterial({map:TEX_BALL}), MAT_MONEY=new THREE.MeshLambertMaterial({map:TEX_MONEY});
function makeBall(money){ const m=new THREE.Mesh(BALL_GEO,money?MAT_MONEY:MAT_BALL); m.castShadow=true; scene.add(m); return m; }

// stalci
const metalR=new THREE.MeshStandardMaterial({color:0x7a8294,metalness:0.7,roughness:0.35});
function rackBallPos(st,i){ const off=(i-2)*0.25; return new V3(st.rack[0]+(st.axis==='x'?off:0),0.93,st.rack[1]+(st.axis==='z'?off:0)); }
for(const st of STATIONS){
  const g=new THREE.Group(); g.position.set(st.rack[0],0,st.rack[1]); if(st.axis==='z') g.rotation.y=Math.PI/2; scene.add(g); st.group=g;
  for(const zz of [-0.08,0.08]){ const r=new THREE.Mesh(new THREE.BoxGeometry(1.4,0.04,0.04),metalR); r.position.set(0,0.8,zz); g.add(r); }
  for(const xx of [-0.65,0.65]) for(const zz of [-0.12,0.12]){ const l=new THREE.Mesh(new THREE.CylinderGeometry(0.02,0.02,0.8,6),metalR); l.position.set(xx,0.4,zz); g.add(l); }
  const base=new THREE.Mesh(new THREE.BoxGeometry(1.45,0.04,0.3),metalR); base.position.y=0.03; g.add(base);
  st.balls=[]; for(let i=0;i<5;i++){ const b=makeBall(i===4); b.position.copy(rackBallPos(st,i)); st.balls.push(b); }
}

// strijelac
const shooter={mesh:buildPlayer(ROSTER[0][0],0),pos:new V3(),vel:new V3(),y:0,vy:0,face:Math.PI,phase:0,crouch:0.3,
  state:'idle',t:0,shootT:0,hand:null,handMoney:false,follow:0,pickFrom:new V3()};
scene.add(shooter.mesh.g);
const sRing=new THREE.Mesh(new THREE.PlaneGeometry(1.4,1.4),new THREE.MeshBasicMaterial({map:RING,color:0x3f86ff,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));
sRing.rotation.x=-Math.PI/2; scene.add(sRing);

const balls=extraBalls;
// aim: ph 'x' | 'y' | '' · u položaj nišana (−1…1), dir smjer, sp brzina · xu/yu zaključane vrijednosti, xq/yq kvaliteta ('g','y','r')
const S={mode:'menu',paused:false,score:0,time:32,st:0,idx:0,results:[[],[],[]],endT:0,introT:0,best:0,lastBeep:99,made:0,perfect:0,holding:false,
  aim:{ph:'',u:0,dir:1,sp:1,xu:0,yu:0,xq:'',yq:''}};
// rekord i TOP 10 po težini spremaju se u profil (Profil.trice)
function loadBest(){ return +Profil.ucitaj().trice.rekordi[diffIdx]||0; }
function saveBest(v){ Profil.ucitaj().trice.rekordi[diffIdx]=v; Profil.spremi(); }
// lokalni TOP 10 po težini: [{s bodovi, m pogođeno, p perfect, t vrijeme}]
function loadTop(){ const a=Profil.ucitaj().trice.top10[diffIdx]; return Array.isArray(a)?a.slice():[]; }
function saveTop(a){ Profil.ucitaj().trice.top10[diffIdx]=a; Profil.spremi(); }
// nišan: kreće osnovnom brzinom težine, raste sa svakom loptom (zadnja ~1.3× brža), malo varira, money ball je brži
function aimSpeed(){ const n=S.st*5+S.idx; return MODE.sp*(1+0.3*n/14)*rand(0.9,1.1)*(S.idx===4?1.05:1); }
function newAim(ph){ const A=S.aim; A.ph=ph; A.u=rand(-1,1); A.dir=Math.random()<0.5?-1:1; A.sp=aimSpeed(); }
const aimQ=u=>Math.abs(u)<MODE.zone?'g':Math.abs(u)<MODE.zone*2?'y':'r';

// HUD
const rackEls=[];
for(let r=0;r<3;r++){ const d=document.createElement('div'); d.className='rk'; const dots=[];
  for(let i=0;i<5;i++){ const x=document.createElement('i'); x.className='dot'+(i===4?' money':''); d.appendChild(x); dots.push(x); }
  $('tRacks').appendChild(d); rackEls.push({el:d,dots}); }
function setDot(r,i,state){ const x=rackEls[r].dots[i]; x.className='dot'+(i===4?' money':'')+(state?' '+state:''); }

// tijek
function placeAtStation(i){ const st=STATIONS[i]; shooter.pos.set(st.x,0,st.z); shooter.vel.set(0,0,0); shooter.y=0; shooter.vy=0; }
function resetRacks(){ for(const st of STATIONS) st.balls.forEach((b,i)=>{ b.visible=true; b.position.copy(rackBallPos(st,i)); }); }
// o (po želji): {tezina, kraj(rezultat)} — bez težine uzima onu iz izbornika
let onEnd=null;
function startContest(o){
  o=o||{}; onEnd=typeof o.kraj==='function'?o.kraj:null;
  audio(); diffIdx=o.tezina!=null?o.tezina:game.diffIdx; MODE=MODES[diffIdx]; game.paused=false; S.best=loadBest();
  for(const b of balls) scene.remove(b.mesh); balls.length=0;
  if(shooter.hand){ scene.remove(shooter.hand); shooter.hand=null; }
  resetRacks(); Object.assign(S,{mode:'intro',paused:false,score:0,time:MODE.time,st:0,idx:0,results:[[],[],[]],introT:1.4,lastBeep:99,made:0,perfect:0,holding:false});
  S.aim.ph='';
  for(let r=0;r<3;r++) for(let i=0;i<5;i++) setDot(r,i,'');
  placeAtStation(0); shooter.state='idle'; shooter.face=Math.atan2(HOOP.x-shooter.pos.x,HOOP.z-shooter.pos.z);
  camSnap=true;
  // zelena i žuta zona na oba nišana
  const g=MODE.zone*50;
  for(const [id,a,b] of [['tMeterX','left','width'],['tMeterY','bottom','height']]){ const m=$(id);
    m.querySelector('.z').style[a]=(50-g)+'%'; m.querySelector('.z').style[b]=(2*g)+'%';
    m.querySelector('.z2').style[a]=(50-2*g)+'%'; m.querySelector('.z2').style[b]=(4*g)+'%'; }
  ['menu','over','pauseOv','tOver'].forEach(id=>$(id).classList.add('hidden')); enter();
  flash(T('trice.spremni'),T('trice.upute'),1.6);
}
function beginPickup(){
  const st=STATIONS[S.st], rb=st.balls[S.idx];
  rb.visible=false; shooter.hand=makeBall(S.idx===4); shooter.handMoney=S.idx===4;
  shooter.pickFrom.copy(rackBallPos(st,S.idx)); shooter.hand.position.copy(shooter.pickFrom);
  shooter.state='pickup'; shooter.t=0;
}
function holdPos(){ const f=shooter.face; return new V3(shooter.pos.x+Math.sin(f)*0.36,1.5,shooter.pos.z+Math.cos(f)*0.36); }
function startJump(){ shooter.state='jump'; shooter.vy=JUMP_V; shooter.shootT=0; }
// šut ide točno kamo je nišan poslao: X promašaj → lijevo/desno, Y → predugo/prekratko; koš odlučuje fizika obruča
// (rub zelene zone ≈ 6 cm od središta obruča = čisto; žuta ≈ obruč, oko pola ulazi; crvena ≈ uglavnom promašaj)
function release(){
  const p=shooter, st=S.st, idx=S.idx, A=S.aim, g=MODE.zone;
  const toS=new V3(p.pos.x,0,p.pos.z-HOOP_Z).normalize(), right=new V3(toS.z,0,-toS.x);
  const ox=A.xu*0.06/g+rand(-0.01,0.01), oy=A.yu*0.06/g+rand(-0.01,0.01);
  const off=right.multiplyScalar(ox).addScaledVector(toS,-oy);
  const qs=[A.xq,A.yq];
  if(qs[0]==='g'&&qs[1]==='g'){ S.perfect++; if(S.mode==='play'){ S.time+=PERFECT_BONUS; S.plusT=0.8; } feedback(T('trice.perfect',{n:PERFECT_BONUS}),'#5fe08b'); }
  else { const wx=Math.abs(A.xu)>=Math.abs(A.yu), hint=T(wx?(A.xu<0?'trice.lijevo':'trice.desno'):(A.yu>0?'trice.predugo':'trice.prekratko'));
    feedback(T(qs.includes('r')?'trice.miss':'trice.good')+hint,qs.includes('r')?'#ff8a5c':'#ffd23f'); }
  A.ph='';
  const tgt=new V3(off.x,RIM_Y+0.02,HOOP_Z+off.z);
  const dir=new V3(-p.pos.x,0,HOOP_Z-p.pos.z).normalize();
  const p0=new V3(p.pos.x,2.65+p.y,p.pos.z).addScaledVector(dir,0.28);
  const d=hoopDist(p.pos), tLet=0.78+d*0.07;   // vrijeme leta (ne T – T() su tekstovi)
  const b={mesh:p.hand,pos:p0.clone(),vel:ballistic(p0,tgt,tLet),money:p.handMoney,value:p.handMoney?2:1,touched:false,scored:false,resolved:false,life:0,st,idx};
  b.mesh.position.copy(b.pos); balls.push(b);
  p.hand=null; p.follow=0.45; p.state='air';
  setDot(st,idx,'air'); S.results[st][idx]='air';
  S.idx++;
}
function resolve(b,made){
  if(b.resolved) return; b.resolved=true; setDot(b.st,b.idx,made?'made':'miss'); S.results[b.st][b.idx]=made?'made':'miss';
  if(made){ S.score+=b.value; S.made++; }
}
function onScore(b){
  b.scored=true; netAnim=0.45; sfx.swish();
  const swish=!b.touched;
  if(swish) burst(0,RIM_Y-0.35,HOOP_Z,16,1.6,[0x9ff0ff,0xffffff]);
  resolve(b,true);
  if(b.money){ flash(T('trice.moneyBall'),'+2',1,'money'); crowd('arms',1.4); sfx.cheer(); burst(0,RIM_Y,HOOP_Z,30,3.5,[0xffd23f,0xffffff,0x2f6bff,0xe33b2f]); }
  else flash(T(swish?'poruka.swish':'poruka.kos'),'+1',0.8,swish?'swish':'score');
}
function stepBall(b,dt){
  const n=5,h=dt/n;
  for(let k=0;k<n;k++){
    const py=b.pos.y;
    b.vel.y-=G*h; b.pos.addScaledVector(b.vel,h);
    const dx=b.pos.x, dz=b.pos.z-HOOP_Z, hd=Math.hypot(dx,dz)||1e-6;
    const nx=dx-dx/hd*RIM_R, ny=b.pos.y-RIM_Y, nz=dz-dz/hd*RIM_R, nd=Math.hypot(nx,ny,nz), md=BALL_R+0.018;
    if(RIM_R-hd<md&&nd<md&&nd>1e-6){ const ux=nx/nd,uy=ny/nd,uz=nz/nd;
      b.pos.x+=ux*(md-nd); b.pos.y+=uy*(md-nd); b.pos.z+=uz*(md-nd);
      const vn=b.vel.x*ux+b.vel.y*uy+b.vel.z*uz;
      if(vn<0){ b.vel.x-=1.55*vn*ux; b.vel.y-=1.55*vn*uy; b.vel.z-=1.55*vn*uz; b.vel.multiplyScalar(0.88); b.touched=true; if(vn<-0.8){ sfx.rim(); rimShake=Math.max(rimShake,0.2); } } }
    if(b.pos.z-BALL_R<BOARD_Z&&b.pos.z>BOARD_Z-0.25&&Math.abs(b.pos.x)<0.9+BALL_R&&b.pos.y>2.9-BALL_R&&b.pos.y<3.95+BALL_R&&b.vel.z<0){
      b.pos.z=BOARD_Z+BALL_R; b.vel.z*=-0.55; b.vel.x*=0.9; b.vel.y*=0.9; b.touched=true; sfx.board(); }
    if(!b.scored&&!b.resolved&&py>=RIM_Y&&b.pos.y<RIM_Y&&b.vel.y<0&&Math.hypot(b.pos.x,b.pos.z-HOOP_Z)<RIM_R-0.015){
      b.vel.x*=0.25; b.vel.z*=0.25; b.vel.y=Math.max(b.vel.y*0.45,-2.2); onScore(b); }
    if(b.pos.y<BALL_R){ b.pos.y=BALL_R; if(b.vel.y<0){ if(b.vel.y<-1.2) sfx.bounce(Math.min(1,-b.vel.y/6)*0.7); b.vel.y*=-0.68; } b.vel.x*=0.985; b.vel.z*=0.985;
      if(!b.resolved&&!b.scored) resolve(b,false); }
    if(Math.abs(b.pos.x)>9.4){ b.pos.x=Math.sign(b.pos.x)*9.4; b.vel.x*=-0.5; }
    if(b.pos.z<-3.3){ b.pos.z=-3.3; b.vel.z*=-0.5; }
  }
  if(b.resolved) b.life+=dt;
  b.mesh.position.copy(b.pos); b.mesh.rotation.x-=b.vel.length()*dt*3;
  if(b.life>2.6){ const k=Math.max(0,1-(b.life-2.6)/0.4); b.mesh.scale.setScalar(k); }
}
function flightsDone(){ return balls.every(b=>b.resolved); }
function endContest(){
  S.mode='over';
  const rec=S.score>S.best; if(rec){ S.best=S.score; saveBest(S.score); }
  const sc=S.score, rate=T('trice.ocjena.'+(sc>=18?18:sc>=14?14:sc>=10?10:sc>=6?6:0));
  $('tResPts').innerHTML=sc+'<small> / 18</small>'+(sc>=18?' 🔥':''); $('tResRate').textContent=rate;
  $('tResInfo').textContent=T('trice.info',{m:S.made,p:S.perfect})+(S.time<=0?'':T('trice.preostalo',{s:S.time.toFixed(1)}));
  $('tResRec').classList.toggle('hidden',!rec||sc===0);
  // lokalni TOP 10 (kasnije se ista lista može slati na online ljestvicu)
  const me={s:sc,m:S.made,p:S.perfect,t:Date.now()}, top=loadTop(); top.push(me);
  top.sort((a,b)=>b.s-a.s||b.m-a.m||a.t-b.t); const keep=top.slice(0,10); saveTop(keep);
  const day=t=>{ const d=new Date(t); return d.getDate()+'.'+(d.getMonth()+1)+'.'; };
  $('tTop').innerHTML=`<div class="ttl">${T('trice.top',{tezina:T('tezina.'+diffIdx)})}</div><ol>`+
    keep.map((e,i)=>`<li class="${e===me?'me':''}"><span>${i+1}.</span><b>${e.s}/18${e.s>=18?' 🔥':''}</b><small>${T('trice.redak',{m:e.m,p:e.p||0,dan:day(e.t)})}</small></li>`).join('')+'</ol>';
  $('tOver').classList.remove('hidden');
  if(sc>=10){ crowd('jump',3); sfx.cheer(); }
  if(onEnd) onEnd({bodovi:sc,pogodaka:S.made,savrseno:S.perfect});
}

function update(dt){
  const p=shooter;
  if(S.mode==='intro'){ S.introT-=dt; if(S.introT<=0){ S.mode='play'; flash(T('poruka.kreni'),'',0.7); sfx.whistle(); beginPickup(); } }
  if(S.mode==='play'){
    S.time-=dt;
    const sec=Math.ceil(S.time); if(S.time<=5&&sec<S.lastBeep&&sec>0){ S.lastBeep=sec; tone(880,0.1,'square',0.05); }
    if(S.time<=0){ S.time=0; sfx.buzzer(); flash(T('trice.vrijeme'),'',1.2);
      if(p.hand&&p.state!=='air'){ const st=STATIONS[S.st]; scene.remove(p.hand); p.hand=null; st.balls[S.idx]&&(st.balls[S.idx].visible=true); p.state='idle'; }
      S.aim.ph='';
      S.mode='ending'; S.endT=0; }
  }
  if(S.mode==='play'||S.mode==='ending'||S.mode==='intro'){
    // stanje strijelca
    if(S.mode==='play'){
      if(p.state==='pickup'){ p.t+=dt; const k=Math.min(1,p.t/PICK); p.hand.position.lerpVectors(p.pickFrom,holdPos(),k*k*(3-2*k)); if(p.t>=PICK){ p.state='ready'; newAim('x'); } }
      // nišan ide tamo-amo; 1. pritisak zaključa X, 2. pritisak Y i skok (šut na vrhu skoka)
      if(p.state==='ready'){ p.hand.position.copy(holdPos()); const A=S.aim;
        A.u+=A.dir*A.sp*2*dt; if(A.u>1){ A.u=2-A.u; A.dir=-1; } if(A.u<-1){ A.u=-2-A.u; A.dir=1; }
        if(tin.down){
          if(A.ph==='x'){ A.xu=A.u; A.xq=aimQ(A.u); tone(A.xq==='g'?990:A.xq==='y'?740:330,0.07,'square',0.05); newAim('y'); }
          else { A.yu=A.u; A.yq=aimQ(A.u); A.ph='lock'; startJump(); } } }
      if(p.state==='jump'){ p.shootT+=dt; if(p.shootT>=AIR*0.5&&p.hand) release(); }
      if(p.state==='recover'){ p.t+=dt; if(p.t>=0.12){
          if(S.idx<5) beginPickup();
          else if(S.st<2){ p.state='move'; }
          else { p.state='idle'; S.mode='ending'; S.endT=0; } } }
      if(p.state==='move'){ const tg=STATIONS[S.st+1], dx=tg.x-p.pos.x, dz=tg.z-p.pos.z, d=Math.hypot(dx,dz);
        if(d<0.12){ p.vel.set(0,0,0); S.st++; S.idx=0; beginPickup(); }
        else { const sp=Math.min(RUN_MAX,d*RUN_K); p.vel.x+=(dx/d*sp-p.vel.x)*Math.min(1,10*dt); p.vel.z+=(dz/d*sp-p.vel.z)*Math.min(1,10*dt); } }
    }
    // skok
    if(p.y>0||p.vy>0){ p.y+=p.vy*dt; p.vy-=PG*dt; if(p.state==='jump'||p.state==='air'){ if(p.hand) p.hand.position.set(p.pos.x+Math.sin(p.face)*0.18,2.65+p.y,p.pos.z+Math.cos(p.face)*0.18); }
      if(p.y<=0){ p.y=0; p.vy=0; if(p.state==='jump'&&p.hand){ release(); } if(p.state==='air'){ p.state='recover'; p.t=0; } } }
    if(p.state!=='move') p.vel.multiplyScalar(Math.exp(-12*dt));
    p.pos.x+=p.vel.x*dt; p.pos.z+=p.vel.z*dt;
    p.follow-=dt;
  }
  for(const b of balls) stepBall(b,dt);
  for(let i=balls.length-1;i>=0;i--) if(balls[i].life>3){ scene.remove(balls[i].mesh); balls.splice(i,1); }
  if(S.mode==='ending'){ S.endT+=dt; if((flightsDone()&&S.endT>0.6)||S.endT>3.5){ balls.forEach(b=>{ if(!b.resolved) resolve(b,false); }); endContest(); } }
}

// animacija strijelca
function poseShooter(dt,time){
  const p=shooter, M=p.mesh; M.g.position.set(p.pos.x,p.y,p.pos.z); M.g.scale.set(PSCALE*0.88,PSCALE,PSCALE*0.9);   // probno: uži u širinu, visina ista
  const sp=Math.hypot(p.vel.x,p.vel.z);
  let fx,fz; if(p.state==='move'&&sp>0.5){ fx=p.vel.x; fz=p.vel.z; } else { fx=HOOP.x-p.pos.x; fz=HOOP.z-p.pos.z; }
  p.face=angLerp(p.face,Math.atan2(fx,fz),1-Math.exp(-12*dt)); M.g.rotation.y=p.face;
  const air=p.y>0.02, run=Math.min(1,sp/5.5);
  const tc=air?0:p.state==='pickup'?0.8:p.state==='ready'?0.45:p.state==='recover'?0.5:0.25;
  p.crouch+=(tc-p.crouch)*Math.min(1,10*dt);
  p.phase+=sp*dt*2.3; const sw=Math.sin(p.phase)*run, a=p.crouch*0.62;
  for(let i=0;i<2;i++){ const Lg=M.legs[i], s=(i?-1:1)*sw;
    if(air){ Lg.thigh.rotation.set(-0.35,0,(i?1:-1)*0.05); Lg.knee.rotation.x=0.55; Lg.foot.rotation.x=0.4; }
    else { Lg.thigh.rotation.set(-a+s*0.8,0,(i?1:-1)*p.crouch*0.14); Lg.knee.rotation.x=2*a+Math.max(0,s)*1.3; Lg.foot.rotation.x=-(Lg.thigh.rotation.x+Lg.knee.rotation.x)*0.85; } }
  M.hips.position.y=M.hipH-(air?0:2*M.legL*(1-Math.cos(a))+run*0.04*Math.abs(Math.sin(p.phase*2)));
  M.torso.rotation.x=air?-0.06:p.crouch*(p.state==='pickup'?0.55:0.3)+run*0.18;
  M.head.rotation.x=-M.torso.rotation.x*0.7;
  const [R,Lf]=M.arms;
  setArm(R,-sw*0.9,-0.12,-0.25-run*0.9); setArm(Lf,sw*0.9,0.12,-0.25-run*0.9);
  if(p.state==='pickup'){ const k=Math.min(1,p.t/PICK); setArm(R,-0.9+k*-0.2,-0.25,-0.3-k*0.8); setArm(Lf,-0.9+k*-0.2,0.25,-0.3-k*0.8); }
  else if(p.state==='ready'){ setArm(R,-1.05,-0.2,-1.15); setArm(Lf,-1.05,0.2,-1.15); }
  else if(p.state==='jump'){ const k=Math.min(1,p.shootT/(AIR*0.4)); setArm(R,-1.1-k*1.75,-0.05,-1.1+k*0.75); setArm(Lf,-1.1-k*1.5,0.15,-1.1+k*0.5); }
  else if(p.follow>0){ setArm(R,-2.95,-0.02,-0.05); setArm(Lf,-2.3,0.2,-0.4); }
  sRing.position.set(p.pos.x,0.025,p.pos.z); const pl=1+Math.sin(time*5)*0.05; sRing.scale.set(pl*PSCALE,pl*PSCALE,1);
}

// kamera
let camSnap=true;
function updateCamera2(dt){
  const p=shooter, s0=STATIONS[S.st], s1=p.state==='move'?STATIONS[S.st+1]:s0;
  let k=0; if(s1!==s0){ const tot=Math.hypot(s1.x-s0.x,s1.z-s0.z), rem=Math.hypot(s1.x-p.pos.x,s1.z-p.pos.z); k=clamp(1-rem/tot,0,1); k=k*k*(3-2*k); }
  const c=new V3(lerp(s0.cam[0],s1.cam[0],k),lerp(s0.cam[1],s1.cam[1],k),lerp(s0.cam[2],s1.cam[2],k));
  const look=new V3(lerp(p.pos.x,HOOP.x,0.42),2.0,lerp(p.pos.z,HOOP.z,0.42));
  if(portrait){ c.sub(look).multiplyScalar(1.45).add(look); c.y+=0.9; }
  const r=camSnap?1:1-Math.exp(-3*dt); camSnap=false;
  camBase.lerp(c,r); camLook.lerp(look,r); camera.position.copy(camBase);
  if(shake>0){ shake-=dt; const s=Math.max(0,shake)*0.5; camera.position.x+=rand(-s,s); camera.position.y+=rand(-s,s)*0.6; }
  camera.lookAt(camLook);
}
function updateHUD2(dt){
  $('tPts').textContent=S.score; $('tBest').textContent=Math.max(S.best,0);
  const cl=$('tClock'); cl.textContent=Math.max(0,S.time).toFixed(1); cl.classList.toggle('low',S.time<=5&&S.mode==='play');
  if(S.plusT>0) S.plusT-=dt; cl.classList.toggle('plus',S.plusT>0);   // sat kratko zasvijetli zeleno nakon +1 s
  $('tStName').textContent=STATIONS[Math.min(2,S.st)].name;
  rackEls.forEach((r,i)=>r.el.classList.toggle('cur',i===S.st&&S.mode!=='menu'));
  // nišani: aktivni svijetli, zaključani pokazuju gdje su stali (boja = kvaliteta)
  const A=S.aim, pct=u=>((clamp(u,-1,1)+1)/2*100)+'%';
  const mx=$('tMeterX'), my=$('tMeterY'), fx=mx.querySelector('.f'), fy=my.querySelector('.f');
  const xl=A.ph==='y'||A.ph==='lock', yl=A.ph==='lock';
  mx.classList.toggle('on',A.ph==='x'); mx.classList.toggle('lock',xl); my.classList.toggle('on',A.ph==='y'); my.classList.toggle('lock',yl);
  fx.style.left=pct(A.ph==='x'?A.u:xl?A.xu:0); fx.className='f'+(xl?' '+A.xq:'');
  fy.style.bottom=pct(A.ph==='y'?A.u:yl?A.yu:0); fy.className='f'+(yl?' '+A.yq:'');
  if(msgT>0){ msgT-=dt; if(msgT<=0) $('msg').classList.remove('show'); }
  if(fbT>0){ fbT-=dt; if(fbT<=0) $('fb').style.opacity=0; }
}


const tin={down:false,up:false};
function press(){ audio(); if(S.holding) return; S.holding=true; tin.down=true; $('tShoot').classList.add('down'); }
function unpress(){ if(!S.holding) return; S.holding=false; tin.up=true; $('tShoot').classList.remove('down'); }
addEventListener('keydown',e=>{ if(game.mode!=='trice'||game.paused||e.repeat) return; const k=e.key.toLowerCase(); if(k===' '||k==='j') press(); });
addEventListener('keyup',e=>{ if(game.mode!=='trice') return; const k=e.key.toLowerCase(); if(k===' '||k==='j') unpress(); });
const gameEl=$('game');
gameEl.addEventListener('pointerdown',e=>{ if(game.mode!=='trice'||game.paused||(S.mode!=='play'&&S.mode!=='intro')) return; e.preventDefault(); try{gameEl.setPointerCapture(e.pointerId);}catch(_){} if(navigator.vibrate) try{navigator.vibrate(8);}catch(_){} press(); });
gameEl.addEventListener('pointerup',()=>{ if(game.mode==='trice') unpress(); }); gameEl.addEventListener('pointercancel',()=>{ if(game.mode==='trice') unpress(); });
function showScene(on){
  for(const st of STATIONS){ st.group.visible=on; st.balls.forEach(b=>b.visible=on); }
  shooter.mesh.g.visible=on; sRing.visible=on;
  players.forEach(p=>{ p.mesh.g.visible=!on; p.ring.visible=!on; p.disc.visible=false; p.label.visible=false; });
  ballMesh.visible=!on;
  ['hud','minimap','legend','scbar'].forEach(id=>$(id).classList.toggle('hidden',on)); $('hint').style.display='none'; $('meter').style.display='none'; $('stam').style.opacity=0;
  $('touch').style.display=(!on&&isTouch&&game.mode!=='menu')?'block':'none';
  $('tHud').classList.toggle('hidden',!on); $('tAim').classList.toggle('hidden',!on); $('tShoot').classList.toggle('hidden',!on||!isTouch);
}
function enter(){ game.mode='trice'; showScene(true); }
function exit(){ unpress(); for(const b of balls) scene.remove(b.mesh); balls.length=0; if(shooter.hand){ scene.remove(shooter.hand); shooter.hand=null; }
  resetRacks(); S.mode='menu'; S.st=0; shooter.state='idle'; placeAtStation(0); showScene(false); resetRacks(); STATIONS.forEach(st=>{ st.group.visible=false; st.balls.forEach(b=>b.visible=false); });
  $('tOver').classList.add('hidden'); }
function frame(dt,time){
  if(!game.paused) update(dt);
  poseShooter(game.paused?0:dt,time);
  if(rimShake>0){ rimShake-=dt; rimMesh.rotation.x=Math.PI/2+Math.sin(rimShake*40)*0.07*rimShake/0.5; } else rimMesh.rotation.x=Math.PI/2;
  updateNet(dt,time); updateFx(dt); updateCrowd(dt,time); updateAmbience(dt,time);
  updateCamera2(dt); updateHUD2(dt);
  tin.down=tin.up=false;
}
STATIONS.forEach(st=>{ st.group.visible=false; st.balls.forEach(b=>b.visible=false); }); shooter.mesh.g.visible=false; sRing.visible=false;
return {start:startContest,exit,frame,unpress,press,S,shooter};
})();
