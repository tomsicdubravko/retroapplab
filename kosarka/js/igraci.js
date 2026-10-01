// ===== Košarka 2 na 2 - igrači: arhetipi, sastav, 3D model, fizika igrača, animacija =====
'use strict';
// ---------- players ----------
// arhetipi: svaki igrač ima svoje brojke i svoj stil kretanja
// spd brzina, drib uspjeh driblinga, dribCd pauza između poteza, dunk zakucavanje (domet i sigurnost), shot šut, win zelena zona,
// gather priprema šuta, shield zaštita od bloka, blk blok, stl krađa, def teže ga je proći, jump skok, bulk snaga u guranju
// crouch niža postura, dcrouch dodatno u obrani, wide raskorak u obrani, dribRate/dribH ritam i visina driblinga, swing/stride hod, hands brzina ruku u obrani
const ARCH={
  speed:  {spd:1.09,drib:1.3,dribCd:0.72,dunk:0.9,shot:0.97,win:1,gather:1,shield:1,blk:0.9,stl:1.1,def:1,jump:1,bulk:0.92,
           crouch:0.14,dcrouch:0,wide:1,dribRate:1.35,dribH:0.72,swing:1,stride:1.12,hands:1,idle:'bounce'},
  power:  {spd:0.93,drib:0.85,dribCd:1.15,dunk:1.35,shot:0.95,win:1,gather:1,shield:1.1,blk:1.1,stl:0.9,def:0.95,jump:1.08,bulk:1.25,
           crouch:-0.07,dcrouch:0,wide:1.2,dribRate:0.88,dribH:1.08,swing:1.25,stride:0.9,hands:1,idle:'shoulders'},
  shooter:{spd:1,drib:1,dribCd:1,dunk:0.85,shot:1.12,win:1.6,gather:0.45,shield:0.7,blk:0.9,stl:1,def:1,jump:1,bulk:0.9,
           crouch:0,dcrouch:0,wide:1,dribRate:1.05,dribH:0.95,swing:0.9,stride:1.05,hands:1,idle:'sway'},
  defense:{spd:1,drib:0.9,dribCd:1.05,dunk:1,shot:0.94,win:1,gather:1,shield:1,blk:1.45,stl:1.45,def:1.25,jump:1.12,bulk:1.08,
           crouch:0,dcrouch:0.2,wide:1.9,dribRate:1,dribH:1,swing:1,stride:1,hands:1.9,idle:'none'}};
// osobine 0–100 (karijera) → brojke arhetipa: 50 = arhetip kakav jest, svaki bod gore/dolje malo ga pojača/oslabi.
// Stil kretanja (crouch, wide, idle…) ostaje od arhetipa. three/win3 vrijede samo za trice (bez njih = 1).
function osobineUSt(arch,o){ const b=ARCH[arch]||ARCH.speed, v=k=>(o&&o[k]!=null?+o[k]:50)-50, m=(x,k)=>Math.max(0.3,1+x*k);
  return Object.assign({},b,{
    shot:b.shot*m(v('sut'),0.006), win:b.win*m(v('sut'),0.012),
    three:m(v('trica'),0.007), win3:m(v('trica'),0.012),
    dunk:b.dunk*m(v('zakucavanje'),0.006), spd:b.spd*m(v('brzina'),0.003),
    drib:b.drib*m(v('dribling'),0.008), dribCd:b.dribCd*Math.max(0.5,1-v('dribling')*0.004),
    stl:b.stl*m(v('kradja'),0.01), blk:b.blk*m(v('blok'),0.01), def:b.def*m((v('kradja')+v('blok'))/2,0.006),
    jump:b.jump*m(v('skok'),0.003) }); }
const ROSTER=[
  [{name:'JAY',tag:'P1',arch:'speed',pers:'streetballer',role:T('uloga.brziDribler'),skin:0x8d5524,hair:'band',hairCol:'#15100c',num:'7',bands:'white'},{name:'DRE',tag:'P2',arch:'power',pers:'slasher',role:T('uloga.zakucavac'),skin:0xc68642,hair:'cap',hairCol:'#1d3f9e',num:'23',kneePad:true}],
  [{name:'SARA',tag:'P3',she:true,arch:'shooter',pers:'sniper',role:T('uloga.suterica'),skin:0xe8b98a,hair:'pony',hairCol:'#1a1210',num:'11',bands:'team'},{name:'KAI',tag:'P4',arch:'defense',pers:'defender',role:T('uloga.obrambeni'),skin:0xb07a4f,hair:'cap',hairCol:'#b3221b',num:'32',beard:true,sleeve:true}]];
const COLS=[{j:0x2463f0,s:0x161b2c,sole:0x2f6bff,css:'#2f6bff'},{j:0xd62b24,s:0x221416,sole:0xff3b30,css:'#ef3b2f'}];
function numTex(num){ const c=document.createElement('canvas'); c.width=c.height=64; const x=c.getContext('2d');
  x.fillStyle='#fff'; x.font='bold 40px sans-serif'; x.textAlign='center'; x.textBaseline='middle'; x.lineWidth=5; x.strokeStyle='rgba(0,0,0,.35)'; x.strokeText(num,32,35); x.fillText(num,32,35); return new THREE.CanvasTexture(c); }
const OUTLINE=new THREE.MeshBasicMaterial({color:0x07080d,side:THREE.BackSide});
const HIP_H=1.03, LEG_L=0.5;
// ---------- TIJELO: proporcije igrača na jednom mjestu (samo izgled, igra ostaje ista) ----------
// ramena, struk, kukovi: širina · ruke, noge: debljina · nogeL: duljina nogu · dubina: debljina trupa sprijeda-straga
// visina: visina ramena, tj. gdje su ruke i lopta (1 = ista; samo centar smije do 1.05) · vrat: pomak glave gore/dolje (m)
// Rame ostaje na istoj visini: dulje noge = kraći trup, kraće noge = dulji trup (a niža glava).
const TIJELO={
  sut:       {ramena:0.90,struk:0.88,kukovi:0.90,ruke:0.86,noge:0.88,nogeL:1.03,dubina:0.92,visina:1.00,vrat: 0.02},   // vitak
  allround:  {ramena:1.00,struk:1.00,kukovi:1.00,ruke:1.00,noge:1.00,nogeL:1.00,dubina:1.00,visina:1.00,vrat: 0.00},   // srednji
  centar:    {ramena:1.16,struk:1.14,kukovi:1.12,ruke:1.14,noge:1.14,nogeL:1.05,dubina:1.10,visina:1.04,vrat: 0.04},   // širok i malo viši
  branic:    {ramena:1.04,struk:1.04,kukovi:1.02,ruke:1.04,noge:1.04,nogeL:0.88,dubina:1.04,visina:1.00,vrat:-0.06},   // niži, zbijen
  zakucavac: {ramena:1.06,struk:0.97,kukovi:0.97,ruke:1.05,noge:0.98,nogeL:1.14,dubina:1.02,visina:1.00,vrat: 0.02}};  // duge noge
// arhetip → tijelo (info.tijelo može odabrati bilo koje, npr. 'centar')
const ARCH_TIJELO={shooter:'sut',speed:'allround',defense:'branic',power:'zakucavac'};
const tijeloZa=info=>TIJELO[info.tijelo]||TIJELO[ARCH_TIJELO[info.arch]]||TIJELO.allround;
function primijeniTijelo(M,Tj){
  const legL=LEG_L*Tj.nogeL, hipH=HIP_H+2*(legL-LEG_L), dub=Tj.dubina;
  const rame=(HIP_H+0.08+0.62)*Tj.visina, ty=(rame-hipH-0.08)/0.62, glava=(HIP_H+0.08+0.98)*Tj.visina+Tj.vrat;
  M.hipH=hipH; M.legL=legL;                                   // animacija čučnja koristi ove vrijednosti
  M.hips.position.y=hipH;
  for(const L of M.legs){ L.thigh.position.x=Math.sign(L.thigh.position.x)*0.14*Tj.kukovi; L.thigh.scale.set(Tj.noge,Tj.nogeL,Tj.noge);
    L.foot.scale.set(1/Tj.noge,1/Tj.nogeL,1/Tj.noge); }             // tenisice ostaju iste
  M.waist.scale.set(Tj.kukovi,1,0.68*Tj.kukovi);
  M.torso.scale.set(Tj.ramena,ty,dub);
  M.jersey.scale.set(Tj.struk/Tj.ramena,1,1);                    // dres prati struk, ramena prate ruke
  M.head.position.y=(glava-hipH-0.08)/ty; M.head.scale.set(1.15/Tj.ramena,1.15/ty,1.15/dub);
  for(const A of M.arms) A.sh.scale.set(Tj.ruke/Tj.ramena,1/ty,Tj.ruke/dub);   // duljina ruku ista
}
function buildPlayer(info,team){
  const g=new THREE.Group(), C=COLS[team], st=ARCH[info.arch]||ARCH.speed, bulk=1+(st.bulk-1)*0.5;
  const L=c=>new THREE.MeshLambertMaterial({color:c});
  const jerM=new THREE.MeshLambertMaterial({color:C.j,emissive:C.j,emissiveIntensity:0.22});
  const skinM=new THREE.MeshLambertMaterial({color:info.skin,emissive:info.skin,emissiveIntensity:0.12});
  const skin=skinM, jer=jerM, shorts=L(C.s), white=L(0xf6f6f6), sole=L(C.sole), dark=L(0x141016), hairM=L(new THREE.Color(info.hairCol));
  const mk=(geo,mat,x,y,z,par,ol)=>{ const m=new THREE.Mesh(geo,mat); m.position.set(x,y,z); m.castShadow=true; (par||g).add(m);
    if(ol){ const o=new THREE.Mesh(geo,OUTLINE); o.scale.setScalar(ol===true?1.09:ol); m.add(o); } return m; };
  const hips=new THREE.Group(); hips.position.y=HIP_H; g.add(hips);
  const legs=[]; let pony=null;
  for(const sd of [-1,1]){
    const thigh=new THREE.Group(); thigh.position.set(0.14*sd,0,0); thigh.scale.set(bulk,1,bulk); hips.add(thigh);
    mk(new THREE.CylinderGeometry(0.1,0.078,LEG_L,8),skin,0,-LEG_L/2,0,thigh,true);
    // široke kratke hlače do koljena
    mk(new THREE.CylinderGeometry(0.19,0.175,0.44,10),shorts,0,-0.16,0,thigh,1.05);
    mk(new THREE.BoxGeometry(0.025,0.4,0.08),white,0.185*sd,-0.16,0,thigh);
    const knee=new THREE.Group(); knee.position.y=-LEG_L; thigh.add(knee);
    mk(new THREE.CylinderGeometry(0.078,0.058,LEG_L,8),skin,0,-LEG_L/2,0,knee,true);
    if(info.kneePad) mk(new THREE.CylinderGeometry(0.092,0.085,0.15,10),dark,0,-0.03,0,knee);
    mk(new THREE.CylinderGeometry(0.07,0.07,0.14,8),white,0,-0.4,0,knee);
    // veće tenisice, visoka kapica
    const foot=new THREE.Group(); foot.position.y=-LEG_L; knee.add(foot);
    mk(new THREE.BoxGeometry(0.19,0.13,0.38),white,0,0.03,0.07,foot,1.07);
    mk(new THREE.CylinderGeometry(0.085,0.095,0.12,10),white,0,0.1,-0.02,foot);
    mk(new THREE.BoxGeometry(0.08,0.014,0.16),dark,0,0.1,0.12,foot);
    mk(new THREE.BoxGeometry(0.195,0.028,0.2),sole,0,0.03,0.16,foot);
    mk(new THREE.BoxGeometry(0.2,0.045,0.4),sole,0,-0.03,0.07,foot);
    legs.push({thigh,knee,foot});
  }
  const waist=mk(new THREE.CylinderGeometry(0.33,0.32,0.2,12),shorts,0,0.02,0,hips,1.05); waist.scale.z=0.68;
  const torso=new THREE.Group(); torso.position.y=0.08; torso.scale.set(bulk,1,bulk); hips.add(torso);
  // dres koji visi preko hlača: širi, duži i malo se njiše
  const jersey=new THREE.Group(); jersey.position.y=0.3; torso.add(jersey);
  const body=mk(new THREE.CylinderGeometry(0.34,0.39,0.8,14),jer,0,0,0,jersey,1.05); body.scale.z=0.66;
  const hem=mk(new THREE.CylinderGeometry(0.393,0.393,0.04,14),white,0,-0.39,0,jersey); hem.scale.z=0.67;
  for(const sd of [-1,1]){ const s=mk(new THREE.BoxGeometry(0.03,0.76,0.13),white,0.367*sd,0,0,jersey); s.rotation.z=0.062*sd; }
  const nt=numTex(info.num), nm=new THREE.MeshBasicMaterial({map:nt,transparent:true});
  const back=new THREE.Mesh(new THREE.PlaneGeometry(0.34,0.34),nm); back.position.set(0,0.08,-0.252); back.rotation.y=Math.PI; jersey.add(back);
  const front=new THREE.Mesh(new THREE.PlaneGeometry(0.24,0.24),nm); front.position.set(0,0.12,0.252); jersey.add(front);
  mk(new THREE.TorusGeometry(0.12,0.022,6,16),white,0,0.7,0.03,torso).rotation.x=Math.PI/2;
  mk(new THREE.CylinderGeometry(0.085,0.095,0.16,8),skin,0,0.78,0,torso);
  const head=new THREE.Group(); head.position.y=0.98; head.scale.set(1.15/bulk,1.15,1.15/bulk); torso.add(head);
  mk(new THREE.SphereGeometry(0.175,18,14),skin,0,0,0,head,1.07);
  mk(new THREE.SphereGeometry(0.03,8,6),skin,0,-0.02,0.175,head);
  mk(new THREE.BoxGeometry(0.07,0.014,0.02),L(0x5a2020),0,-0.075,0.16,head);
  for(const sd of [-1,1]){ const br=mk(new THREE.BoxGeometry(0.06,0.014,0.02),hairM,0.066*sd,0.065,0.163,head); br.rotation.z=-0.15*sd; }
  for(const sd of [-1,1]){ mk(new THREE.SphereGeometry(0.022,6,4),dark,0.066*sd,0.02,0.165,head); mk(new THREE.SphereGeometry(0.045,6,5),skin,0.172*sd,0,0,head); }
  if(info.hair==='cap'){
    mk(new THREE.SphereGeometry(0.188,16,8,0,Math.PI*2,0,Math.PI*0.5),hairM,0,0.02,0,head,1.06);
    mk(new THREE.BoxGeometry(0.26,0.025,0.17),hairM,0,0.03,0.2,head);
  } else {
    const hc=mk(new THREE.SphereGeometry(0.184,16,8,0,Math.PI*2,0,Math.PI*0.52),hairM,0,0.01,-0.006,head); hc.scale.y=0.92;
    mk(new THREE.TorusGeometry(0.179,info.hair==='pony'?0.015:0.03,6,22),white,0,0.055,0,head).rotation.x=Math.PI/2;
    if(info.hair==='pony'){ mk(new THREE.SphereGeometry(0.07,10,8),hairM,0,0.07,-0.2,head);
      pony=new THREE.Group(); pony.position.set(0,0.06,-0.22); pony.rotation.x=0.35; head.add(pony);
      mk(new THREE.CylinderGeometry(0.055,0.025,0.28,8),hairM,0,-0.14,0,pony); }
  }
  if(info.beard) mk(new THREE.SphereGeometry(0.182,14,8,Math.PI/2-1.25,2.5,Math.PI*0.55,Math.PI*0.4),hairM,0,0,0.004,head);
  // šira ramena i izraženije ruke
  const arms=[];
  for(const sd of [-1,1]){
    const sh=new THREE.Group(); sh.position.set(0.44*sd,0.62,0); torso.add(sh);
    mk(new THREE.SphereGeometry(0.112,12,10),skin,0,-0.01,0,sh,1.06);
    const arm=info.sleeve&&sd<0?dark:skin;
    mk(new THREE.CylinderGeometry(0.096,0.074,0.36,10),arm,0,-0.18,0,sh,true);
    const el=new THREE.Group(); el.position.y=-0.36; sh.add(el);
    mk(new THREE.CylinderGeometry(0.078,0.06,0.34,10),arm,0,-0.17,0,el,true);
    if(info.bands) mk(new THREE.CylinderGeometry(0.07,0.07,0.08,8),info.bands==='team'?jer:white,0,-0.28,0,el);
    mk(new THREE.SphereGeometry(0.076,10,8),skin,0,-0.37,0,el,true);
    arms.push({sh,el});
  }
  const M={g,hips,torso,head,legs,arms,jersey,waist,pony,st,mats:{jer:jerM,shorts,skin,hair:hairM}};
  primijeniTijelo(M,tijeloZa(info)); return M;
}
function ringTex(){ const c=document.createElement('canvas'); c.width=c.height=128; const g=c.getContext('2d');
  g.strokeStyle='#fff'; g.shadowColor='#fff'; g.shadowBlur=14; g.lineWidth=7; for(let k=0;k<2;k++){ g.beginPath(); g.arc(64,64,46,0,Math.PI*2); g.stroke(); }
  return new THREE.CanvasTexture(c); }
const RING=ringTex();
function labelTex(tag,col){ const c=document.createElement('canvas'); c.width=128; c.height=96; const g=c.getContext('2d');
  g.textAlign='center'; g.textBaseline='middle'; g.font=`italic 50px ${FONT}`; g.lineJoin='round';
  g.lineWidth=8; g.strokeStyle='rgba(0,0,0,.6)'; g.strokeText(tag,64,34); g.fillStyle=col; g.fillText(tag,64,34);
  g.beginPath(); g.moveTo(46,66); g.lineTo(82,66); g.lineTo(64,88); g.closePath(); g.lineWidth=5; g.stroke(); g.fill();
  const t=new THREE.CanvasTexture(c); fontJobs.push(()=>{ g.clearRect(0,0,128,96); g.lineWidth=8; g.strokeText(tag,64,34); g.fillText(tag,64,34); g.beginPath(); g.moveTo(46,66); g.lineTo(82,66); g.lineTo(64,88); g.closePath(); g.lineWidth=5; g.stroke(); g.fill(); t.needsUpdate=true; }); return t; }
const players=[], teams=[[],[]];
for(let t=0;t<2;t++) for(let i=0;i<2;i++){
  const info=ROSTER[t][i], mesh=buildPlayer(info,t); scene.add(mesh.g);
  const tc=t?0xff4a3d:0x3f86ff;
  const ring=new THREE.Mesh(new THREE.PlaneGeometry(1.25,1.25),new THREE.MeshBasicMaterial({map:RING,color:tc,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));
  ring.rotation.x=-Math.PI/2; scene.add(ring);
  const disc=new THREE.Mesh(new THREE.PlaneGeometry(1.9,1.9),new THREE.MeshBasicMaterial({map:GLOW,color:tc,transparent:true,opacity:0.55,blending:THREE.AdditiveBlending,depthWrite:false}));
  disc.rotation.x=-Math.PI/2; scene.add(disc);
  const label=new THREE.Sprite(new THREE.SpriteMaterial({map:labelTex(info.tag,t?'#ff6a5e':'#6aa4ff'),transparent:true,depthWrite:false})); scene.add(label);
  const p={team:t,idx:i,info,st:ARCH[info.arch],relT:0,mesh,ring,disc,label,pos:new V3(),vel:new V3(),y:0,vy:0,face:Math.PI,phase:0,crouch:0.25,stam:1,shooting:false,shootT:0,stealCd:0,jumpCd:0,reachT:0,man:null,
    dunking:false,dunkT:0,dunkDone:false,dunkFrom:new V3(),dunkTo:new V3(),dunkKind:'norm',dunkHang:0,gather:false,gatherT:0,fakeT:0,bitT:0,passHolding:false,passHold:0,moveT:0,moveCd:0,beatT:0,fallT:0,fallMax:1,fallZ:0,spinA:0,dribSide:1,dribX:1,moveKind:'',moveDir:new V3(),
    ai:{t:0,spot:null,spotT:0,tgt:new V3(),goal:null,dodge:1,blockTried:false,releaseAt:0,q:1,passCd:0,alleyJumped:false}};
  players.push(p); teams[t].push(p);
}
for(let i=0;i<2;i++){ teams[0][i].man=teams[1][i]; teams[1][i].man=teams[0][i]; }
const mateOf=p=>teams[p.team][1-p.idx];


// ---------- physics ----------
function physicsPlayer(p,dt){
  p.stealCd-=dt; p.jumpCd-=dt; p.ai.passCd-=dt; p.relT-=dt; p.reachT-=dt; p.fakeT-=dt; p.bitT-=dt; p.moveCd-=dt; p.beatT-=dt; p.fallT-=dt;
  if(p.moveT>0){ p.moveT-=dt; if(p.moveKind==='spin') p.spinA+=dt*Math.PI*2/0.34; if(p.moveT<=0){ p.spinA=0; p.vel.multiplyScalar(0.7); } }
  p.dribX+=(p.dribSide-p.dribX)*Math.min(1,dt*16);
  if(p.shooting) p.shootT+=dt;
  if(p.dunking){
    if(p.dunkDone&&p.dunkHang>0){ p.dunkHang-=dt; return; } // two-hand: visi na obruču
    p.dunkT+=dt; const s=Math.min(1,p.dunkT/DUNK_AIR), k=Math.min(1,s/0.5), e=k*(2-k);
    p.pos.x=lerp(p.dunkFrom.x,p.dunkTo.x,e); p.pos.z=lerp(p.dunkFrom.z,p.dunkTo.z,e);
    p.y=4*DUNK_PEAK*(p.st.dunk>1?1.12:1)*(p.dunkKind==='one'?1.08:1)*s*(1-s);
    if(!p.dunkDone&&s>=0.5){ p.dunkDone=true; slam(p); }
    if(s>=1){ p.dunking=false; p.y=0; p.vy=0; p.jumpCd=0.3; }
    return;
  }
  if(p.y>0||p.vy>0){ p.y+=p.vy*dt; p.vy-=PG*dt;
    if(p.y<=0){ p.y=0; p.vy=0; if(p.shooting){ if(ball.holder===p) releaseShot(p,0.1); p.shooting=false; } } }
  else p.y=0;
  if(p.y>0&&!p.shooting){ p.vel.multiplyScalar(0.995); }
  p.pos.x+=p.vel.x*dt; p.pos.z+=p.vel.z*dt;
  if(p.izvan) return;   // igrač koji izvodi iz auta stoji izvan terena (nastavak.js)
  // nakon izvođenja ulazi u teren postupno (ne skokom na rub)
  if(p.ulaz){ const cx=clamp(p.pos.x,-7.3,7.3), cz=clamp(p.pos.z,0.45,13.8), dx=cx-p.pos.x, dz=cz-p.pos.z, d=Math.hypot(dx,dz);
    if(d<0.02) p.ulaz=false; else { const k=Math.min(1,4*dt/d); p.pos.x+=dx*k; p.pos.z+=dz*k; return; } }
  p.pos.x=clamp(p.pos.x,-7.3,7.3); p.pos.z=clamp(p.pos.z,0.45,13.8);
  if(Math.abs(p.pos.x)<1&&p.pos.z<1) p.pos.z=1;
}
function separate(){
  for(let i=0;i<players.length;i++) for(let j=i+1;j<players.length;j++){
    const a=players[i],b=players[j]; let dx=b.pos.x-a.pos.x,dz=b.pos.z-a.pos.z; const d=Math.hypot(dx,dz);
    // jači igrač (bulk) manje uzmiče u kontaktu
    if(d<0.7&&d>1e-4){ const o=0.7-d, wa=b.st.bulk/(a.st.bulk+b.st.bulk); dx/=d; dz/=d; a.pos.x-=dx*o*wa; a.pos.z-=dz*o*wa; b.pos.x+=dx*o*(1-wa); b.pos.z+=dz*o*(1-wa); }
  }
}

// ---------- visuals ----------
function angLerp(a,b,t){ let d=((b-a+Math.PI)%(Math.PI*2)+Math.PI*2)%(Math.PI*2)-Math.PI; return a+d*t; }
function setArm(A,x,z,el){ A.sh.rotation.set(x,0,z); A.el.rotation.x=el; }
function animate(dt,time){
  for(const p of players){
    if(p.active===false){ p.mesh.g.visible=false; p.ring.visible=false; p.disc.visible=false; p.label.visible=false; continue; }
    p.mesh.g.visible=true; p.ring.visible=true;
    const M=p.mesh; M.g.position.set(p.pos.x,p.y,p.pos.z); M.g.scale.set(PSCALE*0.88,PSCALE,PSCALE*0.9);   // probno: uži u širinu, visina ista
    const sp=Math.hypot(p.vel.x,p.vel.z); let fx,fz;
    const holder=ball.holder===p, air=p.y>0.02||p.dunking;
    if(holder&&(p.shooting||p.dunking||p.gather||p.fakeT>0||p.y>0.02||sp<0.6)){ fx=-p.pos.x; fz=HOOP_Z-p.pos.z; }
    else if(sp>0.5){ fx=p.vel.x; fz=p.vel.z; }
    else if(ball.state==='held'&&ball.holder.team!==p.team){ fx=ball.holder.pos.x-p.pos.x; fz=ball.holder.pos.z-p.pos.z; }
    else { fx=ball.pos.x-p.pos.x; fz=ball.pos.z-p.pos.z; }
    if(Math.abs(fx)+Math.abs(fz)>1e-3) p.face=angLerp(p.face,Math.atan2(fx,fz),1-Math.exp(-12*dt));
    // reverse: iz smjera trčanja okrene se leđima obruču dok prolazi ispod njega
    if(p.dunking&&p.dunkKind==='rev'){ const a0=Math.atan2(p.dunkTo.x-p.dunkFrom.x,p.dunkTo.z-p.dunkFrom.z), a1=Math.atan2(p.dunkTo.x,p.dunkTo.z-HOOP_Z);
      const k=clamp(p.dunkT/DUNK_AIR/0.45,0,1); p.face=angLerp(a0,a1,k*k*(3-2*k)); }
    M.g.rotation.order='YXZ'; M.g.rotation.y=p.face+(p.moveT>0&&p.moveKind==='spin'?p.spinA:0);
    const fa=p.fallT>0?clamp(Math.min((p.fallMax-p.fallT)*6,p.fallT*3),0,1):0;
    // fallZ≠0: bočni pad nakon krosovera (ankle breaker), inače pad na leđa
    if(p.fallZ){ M.g.rotation.x=-fa*0.35; M.g.rotation.z=fa*1.3*p.fallZ; } else { M.g.rotation.x=-fa*1.25; M.g.rotation.z=0; }
    if(fa>0) M.g.position.y=p.y+fa*0.1;
    const defending=ball.state==='held'&&ball.holder.team!==p.team;
    const onBall=defending&&ball.holder===p.man&&flat(p.pos,p.man.pos)<2.2;
    const run=Math.min(1,sp/5.2), S=p.st, idle=!air&&sp<0.3&&!holder&&!defending&&p.fallT<=0;
    // osnovna postura + karakter: JAY nisko, DRE uspravno, KAI duboko u obrani
    let tc=air?0:(p.moveT>0&&p.moveKind==='legs')?1:p.beatT>0?1:(p.gather||p.fakeT>0)?0.6:onBall?0.8:holder?0.45:defending?0.55:0.25;
    if(!air&&p.beatT<=0) tc=clamp(tc+S.crouch+(defending?S.dcrouch:0),0,1);
    p.crouch+=(tc-p.crouch)*Math.min(1,10*dt);
    p.phase+=sp*dt*2.3*S.stride;
    const sw=Math.sin(p.phase)*run, a=p.crouch*0.62, wide=defending?S.wide:1;
    for(let i=0;i<2;i++){ const Lg=M.legs[i], s=(i?-1:1)*sw;
      if(air){ Lg.thigh.rotation.set(i?-1.0:-0.25,0,0); Lg.knee.rotation.x=i?1.5:0.6; Lg.foot.rotation.x=0.35; }
      else { Lg.thigh.rotation.set(-a+s*0.8,0,(i?1:-1)*p.crouch*0.16*wide); Lg.knee.rotation.x=2*a+Math.max(0,s)*1.3; Lg.foot.rotation.x=-(Lg.thigh.rotation.x+Lg.knee.rotation.x)*0.85; } }
    let hy=M.hipH-(air?0:2*M.legL*(1-Math.cos(a))*(1+(wide-1)*0.12)+run*0.04*Math.abs(Math.sin(p.phase*2)));
    if(idle&&S.idle==='bounce') hy+=Math.abs(Math.sin(time*7+p.idx))*0.03;
    M.hips.position.y=hy;
    M.torso.rotation.x=air?-0.08:p.crouch*0.32+run*0.18;
    M.torso.rotation.z=idle&&S.idle==='shoulders'?Math.sin(time*2.2)*0.05:idle&&S.idle==='sway'?Math.sin(time*1.6+1)*0.03:0;
    M.head.rotation.x=-M.torso.rotation.x*0.7;
    // dres i rep kose prate kretanje
    M.jersey.rotation.x=-run*0.07+Math.sin(p.phase*2)*0.025*run+(air?0.06:0);
    if(M.pony){ M.pony.rotation.x=0.35+run*0.55+(air?-0.4:0)+Math.sin(p.phase*2)*0.15*run; M.pony.rotation.z=Math.sin(p.phase)*0.25*run+(idle?Math.sin(time*1.6)*0.08:0); }
    const [R,Lf]=M.arms, swa=0.9*S.swing;
    setArm(R,-sw*swa,-0.12,-0.25-run*0.9); setArm(Lf,sw*swa,0.12,-0.25-run*0.9);
    if(p.dunking){ const K=p.dunkKind, dn=p.dunkDone;
      if(K==='two'){ const k=dn?-2.75:-3.1; setArm(R,k,-0.18,-0.05); setArm(Lf,k,0.18,-0.05); }
      else if(K==='one'){ const w=clamp(p.dunkT/DUNK_AIR/0.5,0,1); setArm(R,dn?-2.2:-3.1-w*0.8,-0.1,dn?-0.05:-1.3*w); setArm(Lf,-1.5,0.55,-0.6); }
      else if(K==='rev'){ const k=dn?-3.75:-2.9; setArm(R,k,-0.14,-0.1); setArm(Lf,k,0.14,-0.1); }
      else { setArm(R,dn?-2.6:-3.05,-0.1,-0.05); setArm(Lf,-2.3,0.25,-0.3); } }
    else if(holder&&(p.shooting||p.y>0.02||p.fakeT>0.1)){ if(S.gather<1){ setArm(R,-2.95,-0.02,-0.45); setArm(Lf,-2.45,0.3,-0.8); } else { setArm(R,-2.85,-0.05,-0.35); setArm(Lf,-2.6,0.15,-0.6); } }
    else if(holder&&p.gather){ setArm(R,-1.0,-0.2,-1.1); setArm(Lf,-1.0,0.2,-1.1); }
    else if(holder){ const b=Math.sin(ball.dribT*6.5), lo=S.dribH<1?0.25:0; if(p.dribX>=0){ setArm(R,-0.45+lo+b*0.25,-0.32,-0.55); setArm(Lf,-0.9,0.55,-1.0); } else { setArm(Lf,-0.45+lo+b*0.25,0.32,-0.55); setArm(R,-0.9,-0.55,-1.0); } }
    else if(p.relT>0){ setArm(R,-3.0,-0.02,-0.05); setArm(Lf,S.gather<1?-2.2:-2.6,0.3,-0.5); }
    else if(air){ setArm(R,-3.0,-0.1,-0.1); setArm(Lf,-3.0,0.1,-0.1); }
    else if(onBall){ const w=Math.sin(time*6*S.hands+p.idx)*0.15*S.hands, up=S.hands>1?-0.3:0; setArm(R,-0.55+up+w,-1.05,-0.5); setArm(Lf,-0.55+up-w,1.05,-0.5); }
    else if(defending){ setArm(R,-0.3,-0.55*wide*0.8,-0.6); setArm(Lf,-0.3,0.55*wide*0.8,-0.6); }
    else if(idle&&S.idle==='shoulders'){ const k=Math.sin(time*2.2); setArm(R,-0.1+k*0.08,-0.22,-0.3); setArm(Lf,-0.1-k*0.08,0.22,-0.3); }
    if(p.reachT>0) setArm(R,-1.45,-0.1,-0.05);
    const ctrl=(p===game.controlled||(game.local&&game.humans.has(p)))&&game.mode!=='menu';
    const pul=ctrl?1.12+Math.sin(time*6)*0.07:1;
    p.ring.position.set(p.pos.x,0.025,p.pos.z); p.ring.scale.set(pul*PSCALE,pul*PSCALE,1); p.ring.material.opacity=ctrl?1:0.55;
    p.disc.position.set(p.pos.x,0.02,p.pos.z); p.disc.visible=ctrl;
    const ls=ctrl?1.2:0.85; p.label.visible=game.mode!=='menu';
    p.label.position.set(p.pos.x,p.y+3.02+(ctrl?Math.sin(time*5)*0.06:0),p.pos.z); p.label.scale.set(0.5*ls,0.375*ls,1); p.label.material.opacity=ctrl?1:0.7;
  }
  ballMesh.position.copy(ball.pos);
  const bs=ball.state==='held'?Math.hypot(ball.holder.vel.x,ball.holder.vel.z)+3:ball.vel.length();
  ballMesh.rotation.x-=bs*dt*3;
  if(rimShake>0){ rimShake-=dt; rimMesh.rotation.x=Math.PI/2+Math.sin(rimShake*40)*0.07*rimShake/0.5; } else rimMesh.rotation.x=Math.PI/2;
  if(rimFlash>0) rimFlash-=dt;
  rimLight.intensity=0.7+Math.max(0,rimFlash)*4;
  updateNet(dt,time); updateFx(dt); updateCrowd(dt,time); updateAmbience(dt,time); updateTaunt(dt); updateOblacic(dt); updateRebMark(dt,time);
}
