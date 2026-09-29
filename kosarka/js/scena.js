// ===== Košarka 2 na 2 - scena: renderer, svjetla, teren, tribine i publika, atmosfera terena, koš i mreža, kamera, tereni (VENUES) =====
'use strict';
// ---------- renderer ----------
const renderer=new THREE.WebGLRenderer({antialias:true});
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.75));
renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
$('game').appendChild(renderer.domElement);
const scene=new THREE.Scene();
const FLOODS=[], GLOWS=[]; let NEON=null, NEONL=null, SKYMAT=null, BRIDGE=null;
function skyTexC(st){ const c=document.createElement('canvas'); c.width=4; c.height=512; const g=c.getContext('2d'); const gr=g.createLinearGradient(0,0,0,512);
  gr.addColorStop(0,st[0]); gr.addColorStop(0.45,st[1]); gr.addColorStop(0.78,st[2]); gr.addColorStop(1,st[3]); g.fillStyle=gr; g.fillRect(0,0,4,512); return new THREE.CanvasTexture(c); }
function skyTex(){ const c=document.createElement('canvas'); c.width=4; c.height=512; const g=c.getContext('2d');
  const gr=g.createLinearGradient(0,0,0,512); gr.addColorStop(0,'#04061a'); gr.addColorStop(0.45,'#14113c'); gr.addColorStop(0.78,'#3b1d5a'); gr.addColorStop(1,'#a44f6a');
  g.fillStyle=gr; g.fillRect(0,0,4,512); return new THREE.CanvasTexture(c); }
scene.background=skyTex();
scene.fog=new THREE.Fog(0x191536,42,100);
const camera=new THREE.PerspectiveCamera(50,1,0.1,260);
camera.position.set(0,8,18.5);
const camLook=new V3(0,0.8,6), camBase=camera.position.clone();
let portrait=false, shake=0, flashT=0;

const hemi=new THREE.HemisphereLight(0x7a86d6,0x1a1020,0.55); scene.add(hemi);
const amb=new THREE.AmbientLight(0x404060,0.3); scene.add(amb);
const fill=new THREE.DirectionalLight(0xcfd8ff,0.32); fill.position.set(0,6,24); fill.target.position.set(0,1,4); scene.add(fill.target); scene.add(fill);
const key=new THREE.SpotLight(0xfff0dc,1.05,0,0.62,0.55);
key.position.set(3,17,21); key.target.position.set(0,0,5.5); scene.add(key.target);
key.castShadow=true; key.shadow.mapSize.set(1024,1024); key.shadow.bias=-0.0006; key.shadow.camera.near=8; key.shadow.camera.far=48; scene.add(key);
for(const sx of [-1,1]){ const f=new THREE.SpotLight(0xdfe8ff,0.8,0,0.8,0.6); f.position.set(sx*9.3,10.5,-7.6); f.target.position.set(-sx*1.5,0,7); scene.add(f.target); scene.add(f); FLOODS.push(f); }

const FONT="'Bebas Neue', Impact, 'Arial Narrow', sans-serif";
function glowTex(){ const c=document.createElement('canvas'); c.width=c.height=64; const g=c.getContext('2d');
  const gr=g.createRadialGradient(32,32,0,32,32,32); gr.addColorStop(0,'rgba(255,255,255,1)'); gr.addColorStop(0.35,'rgba(255,255,255,.45)'); gr.addColorStop(1,'rgba(255,255,255,0)');
  g.fillStyle=gr; g.fillRect(0,0,64,64); return new THREE.CanvasTexture(c); }
const GLOW=glowTex();
function glowSprite(color,scale,opacity){ const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:GLOW,color,transparent:true,opacity:opacity==null?1:opacity,blending:THREE.AdditiveBlending,depthWrite:false})); sp.scale.set(scale,scale,1); return sp; }
const fontJobs=[];
function canvasTex(w,h,draw,repeatX){ const c=document.createElement('canvas'); c.width=w; c.height=h; draw(c); const t=new THREE.CanvasTexture(c);
  if(repeatX){ t.wrapS=THREE.RepeatWrapping; t.repeat.x=repeatX; } fontJobs.push(()=>{ draw(c); t.needsUpdate=true; }); return t; }
function speckle(g,x,y,w,h,n,cols){ for(let i=0;i<n;i++){ g.fillStyle=cols[i%cols.length]; const z=Math.random()*2.2+0.6; g.fillRect(x+Math.random()*w,y+Math.random()*h,z,z); } }
function crown(g,x,y,w,col){ const h=w*0.6; g.save(); g.translate(x,y); g.fillStyle=col; g.beginPath(); g.moveTo(-w/2,h/2); g.lineTo(-w/2,-h/2); g.lineTo(-w/4,0); g.lineTo(0,-h*0.65); g.lineTo(w/4,0); g.lineTo(w/2,-h/2); g.lineTo(w/2,h/2); g.closePath(); g.fill(); g.restore(); }

// ---------- court ----------
function drawFloor(c){
  const S=60,g=c.getContext('2d'),X=x=>(x+8.5)*S,Z=z=>(z+1)*S;
  g.fillStyle='#141925'; g.fillRect(0,0,c.width,c.height);
  speckle(g,0,0,c.width,c.height,9000,['rgba(255,255,255,.05)','rgba(0,0,0,.28)']);
  const cg=g.createRadialGradient(X(0),Z(5),S,X(0),Z(6),S*11); cg.addColorStop(0,'#2659b3'); cg.addColorStop(1,'#15387a');
  g.fillStyle=cg; g.fillRect(X(-7.5),Z(0),15*S,14*S);
  speckle(g,X(-7.5),Z(0),15*S,14*S,14000,['rgba(255,255,255,.06)','rgba(0,0,30,.2)']);
  for(let i=0;i<40;i++){ g.fillStyle=`rgba(${i%2?'255,255,255':'0,0,20'},${Math.random()*0.045})`; g.beginPath(); g.ellipse(X(rand(-7,7)),Z(rand(0.5,13.5)),rand(20,90),rand(10,50),rand(0,3),0,Math.PI*2); g.fill(); }
  const pg=g.createLinearGradient(0,Z(0),0,Z(5.8)); pg.addColorStop(0,'#aa2922'); pg.addColorStop(1,'#d23d2c');
  g.fillStyle=pg; g.fillRect(X(-2.45),Z(0),4.9*S,5.8*S);
  g.fillStyle='#d23d2c'; g.beginPath(); g.arc(X(0),Z(5.8),1.8*S,0,Math.PI); g.fill();
  speckle(g,X(-2.45),Z(0),4.9*S,7.6*S,3000,['rgba(255,220,200,.07)','rgba(60,0,0,.18)']);
  g.save(); g.translate(X(0),Z(11.2)); g.rotate(-0.07);
  crown(g,0,-1.3*S,0.95*S,'rgba(242,165,49,.9)');
  g.textAlign='center'; g.textBaseline='middle'; g.lineJoin='round';
  g.font=`italic ${1.75*S}px ${FONT}`; g.lineWidth=0.13*S; g.strokeStyle='rgba(8,12,30,.55)'; g.strokeText('STREET',0,0);
  g.fillStyle='rgba(232,236,250,.8)'; g.fillText('STREET',0,0);
  g.font=`italic ${1.05*S}px ${FONT}`; g.fillStyle='rgba(242,165,49,.92)'; g.fillText('2 NA 2',0.7*S,1.3*S);
  g.restore();
  g.strokeStyle='#eef2ff'; g.lineWidth=0.065*S;
  g.strokeRect(X(-7.5),Z(0),15*S,14*S);
  g.strokeRect(X(-2.45),Z(0),4.9*S,5.8*S);
  g.beginPath(); g.arc(X(0),Z(5.8),1.8*S,0,Math.PI*2); g.stroke();
  const a0=Math.atan2(CORNER_Z-HOOP_Z,-CORNER_X), a1=Math.atan2(CORNER_Z-HOOP_Z,CORNER_X);
  g.beginPath(); g.moveTo(X(-CORNER_X),Z(0)); g.lineTo(X(-CORNER_X),Z(CORNER_Z)); g.arc(X(0),Z(HOOP_Z),THREE_R*S,a0,a1,true); g.lineTo(X(CORNER_X),Z(0)); g.stroke();
  g.beginPath(); g.arc(X(0),Z(HOOP_Z),1.25*S,Math.PI,0,true); g.stroke();
  g.beginPath(); g.arc(X(0),Z(14),1.8*S,Math.PI,Math.PI*2); g.stroke();
  g.fillStyle='#eef2ff';
  for(const z of [1.75,2.6,3.45,4.3]) for(const sd of [-1,1]) g.fillRect(sd<0?X(-2.45)-0.15*S:X(2.45),Z(z),0.15*S,0.05*S);
}
function drawWall(c,variant){
  const g=c.getContext('2d'),W=c.width,H=c.height;
  g.fillStyle='#262a38'; g.fillRect(0,0,W,H); speckle(g,0,0,W,H,5000,['rgba(255,255,255,.05)','rgba(0,0,0,.22)']);
  g.strokeStyle='rgba(0,0,0,.3)'; g.lineWidth=2; for(let y=H/3;y<H;y+=H/3){ g.beginPath(); g.moveTo(0,y); g.lineTo(W,y); g.stroke(); }
  for(let x=0;x<W;x+=W/8){ g.beginPath(); g.moveTo(x,0); g.lineTo(x,H); g.stroke(); }
  const cols=['#ff3fa4','#2fd3ff','#ffd23f','#7cff6b','#b06bff','#ff7a1a'];
  for(let i=0;i<22;i++){ g.fillStyle=cols[i%cols.length]+'44'; g.beginPath(); g.arc(Math.random()*W,Math.random()*H,rand(8,60),0,Math.PI*2); g.fill(); }
  const words=variant===0?['IGRAJ','BEZ STRAHA']:variant===1?['STREET','BALL']:['2 NA 2','KRALJ TERENA'];
  const grads=[['#ffd23f','#ff3fa4'],['#2fd3ff','#b06bff'],['#7cff6b','#2fd3ff']][variant];
  g.textAlign='center'; g.textBaseline='middle'; g.lineJoin='round';
  words.forEach((w,i)=>{ const x=W*(0.27+i*0.46), y=H*0.54+(i?8:-6), fs=H*0.6;
    g.save(); g.translate(x,y); g.rotate(i?0.05:-0.06); g.font=`italic ${fs}px ${FONT}`;
    g.lineWidth=fs*0.17; g.strokeStyle='#120e1c'; g.strokeText(w,0,0);
    const gr=g.createLinearGradient(0,-fs/2,0,fs/2); gr.addColorStop(0,grads[0]); gr.addColorStop(1,grads[1]);
    g.fillStyle=gr; g.fillText(w,0,0); g.lineWidth=fs*0.03; g.strokeStyle='rgba(255,255,255,.9)'; g.strokeText(w,0,0);
    g.fillStyle=grads[1]; for(let d=0;d<9;d++) g.fillRect(rand(-fs*1.3,fs*1.3),fs*0.34,3,rand(10,38));
    g.restore(); });
  crown(g,W*0.05,H*0.28,H*0.3,'#ffd23f');
}
function drawSkyline(c){
  const g=c.getContext('2d'),W=c.width,H=c.height; g.clearRect(0,0,W,H);
  const haze=g.createLinearGradient(0,H*0.5,0,H); haze.addColorStop(0,'rgba(160,70,110,0)'); haze.addColorStop(1,'rgba(160,70,110,.35)'); g.fillStyle=haze; g.fillRect(0,H*0.5,W,H*0.5);
  for(let layer=0;layer<2;layer++){ let x=-20;
    while(x<W){ const w=rand(40,130), h=layer?rand(60,230):rand(120,430); const top=H-h;
      g.fillStyle=layer?'#161a38':'#0c0f26'; g.fillRect(x,top,w,h);
      if(!layer&&Math.random()<0.25){ g.fillRect(x+w/2-2,top-rand(20,60),4,60); g.fillStyle='#ff4040'; g.fillRect(x+w/2-3,top-rand(20,60),6,6); }
      const wc=['rgba(255,217,138,.85)','rgba(255,179,92,.8)','rgba(159,216,255,.75)'];
      for(let yy=top+8;yy<H-6;yy+=12) for(let xx=x+6;xx<x+w-6;xx+=10) if(Math.random()<(layer?0.12:0.3)){ g.fillStyle=wc[(Math.random()*3)|0]; g.fillRect(xx,yy,5,7); }
      x+=w+rand(2,18); } }
}
function fenceTex(){ const c=document.createElement('canvas'); c.width=c.height=64; const g=c.getContext('2d');
  g.strokeStyle='rgba(200,208,222,1)'; g.lineWidth=3; g.beginPath(); g.moveTo(0,0); g.lineTo(64,64); g.moveTo(64,0); g.lineTo(0,64); g.stroke();
  const t=new THREE.CanvasTexture(c); t.wrapS=t.wrapT=THREE.RepeatWrapping; return t; }
const FENCE=fenceTex();
function fence(w,h,x,y,z,ry){ const t=FENCE.clone(); t.needsUpdate=true; t.repeat.set(w/0.24,h/0.24);
  const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshLambertMaterial({map:t,transparent:true,alphaTest:0.3,side:THREE.DoubleSide,color:0x8a93a8}));
  m.position.set(x,y,z); m.rotation.y=ry; scene.add(m); }

let specs=[], specBody, specHead, specLegs, specArms, specCap, specPhone, cheerT=0;
const FLASHES=[];
// reakcija publike: small (pljesak dijela publike), arms (svi dignu ruke), lean (nagnu se prema terenu), jump (svi skaču)
const CROWD=['small','arms','lean','jump'];
let crowdK='small';
function crowd(k,dur){ if(cheerT<=0.3||CROWD.indexOf(k)>=CROWD.indexOf(crowdK)) crowdK=k; cheerT=Math.max(cheerT,dur); }
function buildArena(){
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(140,140),new THREE.MeshStandardMaterial({color:0x151820,roughness:0.85}));
  ground.rotation.x=-Math.PI/2; ground.position.y=-0.01; ground.receiveShadow=true; scene.add(ground);
  const court=new THREE.Mesh(new THREE.PlaneGeometry(17,16),new THREE.MeshStandardMaterial({map:canvasTex(1020,960,drawFloor),roughness:0.34,metalness:0.05}));
  court.material.map.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
  court.rotation.x=-Math.PI/2; court.position.set(0,0,7); court.receiveShadow=true; scene.add(court);
  // zidovi s grafitima
  const wallT=v=>canvasTex(1024,200,c=>drawWall(c,v),2.2);
  for(const sd of [-1,1]){ const w=new THREE.Mesh(new THREE.PlaneGeometry(24,2.2),new THREE.MeshLambertMaterial({map:wallT(sd<0?0:2)}));
    w.position.set(sd*9.6,1.1,4); w.rotation.y=-sd*Math.PI/2; scene.add(w);
    fence(24,4.3,sd*9.6,2.2+2.15,4,-sd*Math.PI/2); }
  const bw=new THREE.Mesh(new THREE.PlaneGeometry(19.2,2.6),new THREE.MeshLambertMaterial({map:wallT(1)})); bw.position.set(0,1.3,-8.6); scene.add(bw);
  fence(19.2,4.6,0,2.6+2.3,-8.6,0);
  const metal=new THREE.MeshStandardMaterial({color:0x4a5060,metalness:0.6,roughness:0.45});
  for(let z=-8.6;z<=16;z+=4.1) for(const sd of [-1,1]){ const post=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.05,6.5,6),metal); post.position.set(sd*9.6,3.25,z); scene.add(post); }
  for(let x=-9.6;x<=9.6;x+=3.2){ const post=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.05,7.2,6),metal); post.position.set(x,3.6,-8.6); scene.add(post); }
  // tribine iza koša
  const conc=new THREE.MeshLambertMaterial({color:0x363b4e});
  for(let r=0;r<4;r++){ const h=0.45*(r+1); const st=new THREE.Mesh(new THREE.BoxGeometry(15,h,0.9),conc); st.position.set(0,h/2,-4.05-r*0.9); st.receiveShadow=true; scene.add(st); }
  const spk=new THREE.MeshLambertMaterial({color:0x111318});
  for(const sd of [-1,1]){ const b=new THREE.Mesh(new THREE.BoxGeometry(0.75,1.3,0.6),spk); b.position.set(sd*8.2,0.65,-3.4); scene.add(b);
    const cone=new THREE.Mesh(new THREE.CircleGeometry(0.22,16),new THREE.MeshLambertMaterial({color:0x2a2e38})); cone.position.set(sd*8.2,0.8,-3.09); scene.add(cone); }
  // publika
  for(let r=0;r<4;r++) for(let x=-6.8;x<=6.8;x+=0.72) if(Math.random()<0.8) specs.push({x:x+rand(-.12,.12),y:0.45*(r+1),z:-4.05-r*0.9,seat:true});
  for(const sd of [-1,1]) for(let z=0.5;z<=13.5;z+=1.2) if(Math.random()<0.7) specs.push({x:sd*rand(8.5,9.1),y:0,z:z+rand(-.3,.3),seat:false});
  const shirt=[0x2f6bff,0xef3b2f,0xeeeeee,0x2b2b2b,0xffb020,0x6fbf73,0x8e5bb5,0x19b3c9,0xd9d2c0,0xff3fa4];
  const skins=[0x8d5524,0xc68642,0xe0ac69,0xf1c27d,0x6b4423];
  const capC=[0x111111,0xef3b2f,0x2f6bff,0xffffff,0xffb020,0x6fbf73];
  const N=specs.length, lam=()=>new THREE.MeshLambertMaterial({color:0xffffff});
  specBody=new THREE.InstancedMesh(new THREE.BoxGeometry(0.46,0.62,0.3),lam(),N);
  specHead=new THREE.InstancedMesh(new THREE.SphereGeometry(0.14,8,6),lam(),N);
  const standing=specs.filter(q=>!q.seat).length;
  specLegs=new THREE.InstancedMesh(new THREE.BoxGeometry(0.36,0.85,0.24),new THREE.MeshLambertMaterial({color:0x273248}),Math.max(1,standing));
  // ruke s pivotom u ramenu
  const armG=new THREE.BoxGeometry(0.11,0.5,0.11); armG.translate(0,-0.23,0);
  specArms=new THREE.InstancedMesh(armG,lam(),N*2);
  const col=new THREE.Color(); let nCap=0, nPh=0;
  specs.forEach((q,i)=>{ q.yaw=Math.atan2(0-q.x,6-q.z); q.ph=Math.random()*6; q.r=Math.random();
    q.phone=Math.random()<0.3; q.phoneIdle=q.phone&&Math.random()<0.3; q.cap=Math.random()<0.4;
    if(q.cap) q.ci=nCap++; if(q.phone) q.pi=nPh++;
    const sh=shirt[(Math.random()*shirt.length)|0], sk=skins[(Math.random()*skins.length)|0];
    col.setHex(sh); specBody.setColorAt(i,col);
    col.setHex(sk); specHead.setColorAt(i,col);
    col.setHex(Math.random()<0.5?sh:sk); specArms.setColorAt(i*2,col); specArms.setColorAt(i*2+1,col); });
  specCap=new THREE.InstancedMesh(new THREE.CylinderGeometry(0.15,0.15,0.09,8),lam(),Math.max(1,nCap));
  specs.forEach(q=>{ if(q.cap){ col.setHex(capC[(Math.random()*capC.length)|0]); specCap.setColorAt(q.ci,col); } });
  specPhone=new THREE.InstancedMesh(new THREE.BoxGeometry(0.08,0.15,0.025),new THREE.MeshLambertMaterial({color:0x2a2d35}),Math.max(1,nPh));
  // bljeskalice mobitela
  for(let i=0;i<8;i++){ const s=glowSprite(0xf4f8ff,0.9,1); s.visible=false; scene.add(s); FLASHES.push({s,t:0}); }
  for(const m of [specBody,specHead,specLegs,specArms,specCap,specPhone]) scene.add(m);
  updateCrowd(0,0);
  // reflektori
  for(const [x,z] of [[-9.3,-7.9],[9.3,-7.9],[-9.3,6],[9.3,6]]){
    const pole=new THREE.Mesh(new THREE.CylinderGeometry(0.09,0.12,10,8),metal); pole.position.set(x,5,z); scene.add(pole);
    const head=new THREE.Group(); head.position.set(x*0.98,10.2,z); scene.add(head); head.lookAt(0,0,6);
    const fr=new THREE.Mesh(new THREE.BoxGeometry(1.5,0.9,0.2),new THREE.MeshLambertMaterial({color:0x22252e})); head.add(fr);
    for(let i=0;i<3;i++) for(let j=0;j<2;j++){ const l=new THREE.Mesh(new THREE.PlaneGeometry(0.38,0.3),new THREE.MeshBasicMaterial({color:0xfffbe8})); l.position.set(-0.45+i*0.45,-0.18+j*0.36,0.11); head.add(l); }
    const gl=glowSprite(0xfff1d0,4.2,0.75); gl.position.set(x*0.98,10.2,z); scene.add(gl); GLOWS.push(gl); }
  // neonski natpis
  const neon=new THREE.Mesh(new THREE.PlaneGeometry(3.4,1.7),new THREE.MeshBasicMaterial({map:canvasTex(512,256,drawNeon),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));
  neon.position.set(9.5,3.6,0.8); neon.rotation.y=-Math.PI/2; scene.add(neon); NEON=neon;
  const nl=new THREE.PointLight(0xff3fa4,0.9,7); nl.position.set(8.6,3.4,0.8); scene.add(nl); NEONL=nl;
  { BRIDGE=new THREE.Group(); const cm=new THREE.MeshLambertMaterial({color:0x4a4f5e}), dk=new THREE.MeshLambertMaterial({color:0x2c3039});
    const deck=new THREE.Mesh(new THREE.BoxGeometry(90,1.8,7),cm); deck.position.set(0,13,-15); BRIDGE.add(deck);
    const under=new THREE.Mesh(new THREE.BoxGeometry(90,0.6,6),dk); under.position.set(0,11.8,-15); BRIDGE.add(under);
    const rail=new THREE.Mesh(new THREE.BoxGeometry(90,0.9,0.25),cm); rail.position.set(0,14.3,-11.6); BRIDGE.add(rail);
    for(const x of [-24,-9,9,24]){ const pl=new THREE.Mesh(new THREE.BoxGeometry(2.4,12.4,2.4),cm); pl.position.set(x,6.2,-15); BRIDGE.add(pl); }
    for(let x=-40;x<=40;x+=8){ const lm=glowSprite(0xffc27a,1.6,0.7); lm.position.set(x,11.3,-11.8); BRIDGE.add(lm); }
    BRIDGE.visible=false; scene.add(BRIDGE); }
  // grad u pozadini
  const skyMat=new THREE.MeshBasicMaterial({map:canvasTex(2048,512,drawSkyline),transparent:true,fog:false,depthWrite:false}); SKYMAT=skyMat;
  const sky=new THREE.Mesh(new THREE.PlaneGeometry(230,57),skyMat); sky.position.set(0,20,-75); scene.add(sky);
  for(const sd of [-1,1]){ const s2=new THREE.Mesh(new THREE.PlaneGeometry(160,50),skyMat); s2.position.set(sd*85,17,-5); s2.rotation.y=-sd*1.25; scene.add(s2); }
}
// ---------- atmosfera terena: samo izgled, ne utječe na igru ----------
// 0 more: sunce, odsjaj mora, galebovi · 1 pod mostom: tramvaj, auti, golubovi, prašina · 2 krov: neon, vjetar, grad
const AMB=[], AMBU=[]; let VENUE=2, glareEl=null;
const lamb=(c,o)=>new THREE.MeshLambertMaterial(Object.assign({color:c},o));
const box=(w,h,d,m)=>new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);
function flock(parent,n,col,cx,cy,cz,rad){
  const wm=lamb(col,{side:THREE.DoubleSide}), birds=[];
  for(let i=0;i<n;i++){ const b=new THREE.Group(), wg=new THREE.PlaneGeometry(0.46,0.17); wg.rotateX(-Math.PI/2);
    const L=new THREE.Mesh(wg.clone().translate(-0.23,0,0),wm), R=new THREE.Mesh(wg.clone().translate(0.23,0,0),wm);
    b.add(box(0.1,0.09,0.36,wm),L,R); b.scale.setScalar(1.4); parent.add(b);
    birds.push({b,L,R,a:Math.random()*6.3,sp:rand(0.3,0.5)*(Math.random()<0.5?-1:1),r:rad*rand(0.6,1),cy:cy+rand(-0.8,0.8),ph:Math.random()*6}); }
  return (dt,t)=>{ for(const q of birds){ q.a+=q.sp*dt;
    q.b.position.set(cx+Math.cos(q.a)*q.r,q.cy+Math.sin(q.a*2+q.ph)*0.35,cz+Math.sin(q.a)*q.r*0.45);
    q.b.rotation.y=Math.atan2(-Math.sin(q.a)*q.sp,Math.cos(q.a)*0.45*q.sp);
    const amp=Math.sin(t*0.7+q.ph)>-0.2?0.7:0.08, f=Math.sin(t*9+q.ph)*amp; q.L.rotation.z=f; q.R.rotation.z=-f; } };
}
function causticTex(){ const t=canvasTex(256,256,c=>{ const g=c.getContext('2d'); g.clearRect(0,0,256,256);
    for(let i=0;i<60;i++){ const x=Math.random()*256,y=Math.random()*256,r=rand(6,20);
      for(const dx of [-256,0,256]) for(const dy of [-256,0,256]){ const gr=g.createRadialGradient(x+dx,y+dy,0,x+dx,y+dy,r);
        gr.addColorStop(0,'rgba(255,255,255,.9)'); gr.addColorStop(1,'rgba(255,255,255,0)'); g.fillStyle=gr; g.fillRect(x+dx-r,y+dy-r,r*2,r*2); } } });
  t.wrapS=t.wrapT=THREE.RepeatWrapping; return t; }
function buildAmbience(){
  for(let i=0;i<3;i++){ AMB.push(new THREE.Group()); scene.add(AMB[i]); }
  // --- 0: more ---
  { const G=AMB[0], birds=flock(G,5,0xf4f6f8,0,4.6,-7.5,8), layers=[];
    // odsjaj mora koji titra po zidovima
    for(const [x,z,ry,w] of [[-9.55,4,Math.PI/2,24],[9.55,4,-Math.PI/2,24],[0,-8.55,0,19.2]]) for(let k=0;k<2;k++){
      const tx=causticTex(); tx.repeat.set(w/5,0.6);
      const m=new THREE.Mesh(new THREE.PlaneGeometry(w,2.2),new THREE.MeshBasicMaterial({map:tx,color:0xfff1cf,transparent:true,opacity:0.3,blending:THREE.AdditiveBlending,depthWrite:false}));
      m.position.set(x,1.1,z); m.rotation.y=ry; G.add(m); layers.push({tx,k}); }
    // sunce i lens flare preko slike
    glareEl=document.createElement('div'); glareEl.style.cssText='position:absolute;inset:0;pointer-events:none;mix-blend-mode:screen;display:none;overflow:hidden';
    glareEl.innerHTML='<i></i><i></i><i></i><i></i><i></i>'; $('game').appendChild(glareEl);
    const dots=[...glareEl.children], FL=[[0,70,'rgba(255,246,220,.75)'],[0.38,9,'rgba(255,210,140,.22)'],[0.62,5,'rgba(160,220,255,.2)'],[0.85,13,'rgba(255,190,120,.12)'],[1.12,7,'rgba(190,255,220,.14)']];
    dots.forEach((d,i)=>{ const [,s,c]=FL[i]; d.style.cssText=`position:absolute;width:${s}vmax;height:${s}vmax;border-radius:50%;transform:translate(-50%,-50%);background:radial-gradient(circle,${c},transparent 70%)`; });
    AMBU[0]=(dt,t)=>{ birds(dt,t);
      for(const L of layers){ L.tx.offset.x+=dt*(L.k?0.05:-0.035); L.tx.offset.y=Math.sin(t*0.6+L.k*2)*0.08; }
      const sx=88-camBase.x*1.2, sy=4, cx=50, cy=58, pulse=0.85+Math.sin(t*1.3)*0.08+Math.sin(t*3.1)*0.04;
      dots.forEach((d,i)=>{ const k=FL[i][0]; d.style.left=(sx+(cx-sx)*k)+'%'; d.style.top=(sy+(cy-sy)*k)+'%'; d.style.opacity=i?pulse*0.9:pulse; }); }; }
  // --- 1: pod mostom ---
  { const G=AMB[1], birds=flock(G,4,0x8a8f99,-2,4.3,-7,6);
    // tramvaj iza desne ograde
    const tram=new THREE.Group(), body=lamb(0x2d6ea8), win=new THREE.MeshBasicMaterial({color:0xffe3a0});
    tram.add(box(2.5,2.6,11,body)); const st=box(2.52,0.35,11.02,lamb(0xd8dde6)); st.position.y=-0.6; tram.add(st);
    for(let i=0;i<6;i++){ const w=new THREE.Mesh(new THREE.PlaneGeometry(1.3,0.8),win); w.position.set(-1.27,0.45,-4.1+i*1.64); w.rotation.y=-Math.PI/2; tram.add(w); }
    const pan=box(0.08,1,0.08,lamb(0x222222)); pan.position.set(0,1.8,-1); pan.rotation.x=0.5; tram.add(pan);
    const spark=glowSprite(0x9fd8ff,1.4,0); spark.position.set(0,2.3,-1.3); tram.add(spark);
    const head=[glowSprite(0xfff2d0,2,0.9),glowSprite(0xff3030,1,0.8)]; head[0].position.set(0,-0.3,5.6); head[1].position.set(0,-0.3,-5.6); tram.add(...head);
    tram.position.set(14,1.6,0); tram.visible=false; G.add(tram);
    const tr={z:0,dir:1,wait:3};
    // auti iza lijeve ograde
    const cars=[]; for(let i=0;i<3;i++){ const c=new THREE.Group(), col=[0xc0392b,0xe8e8e8,0x2b2b2b][i];
      c.add(box(1.8,0.75,4.2,lamb(col))); const cab=box(1.6,0.6,2.2,lamb(0x223044)); cab.position.set(0,0.65,-0.2); c.add(cab);
      const hl=glowSprite(0xfff2d0,1.8,0.9), tl=glowSprite(0xff3030,0.9,0.8); hl.position.set(0,0.1,2.2); tl.position.set(0,0.1,-2.2); c.add(hl,tl);
      c.position.set(i===1?-12.2:-13.8,0.8,0); G.add(c); cars.push({c,dir:i===1?-1:1,z:rand(-40,40),sp:rand(11,16),wait:rand(0,6)}); }
    // prašina u svjetlu reflektora
    const N=150, pos=new Float32Array(N*3); for(let i=0;i<N;i++){ pos[i*3]=rand(-8,8); pos[i*3+1]=rand(0.3,8); pos[i*3+2]=rand(-4,14); }
    const dg=new THREE.BufferGeometry(); dg.setAttribute('position',new THREE.BufferAttribute(pos,3));
    const dust=new THREE.Points(dg,new THREE.PointsMaterial({color:0xffe2b0,size:0.06,transparent:true,opacity:0.55,blending:THREE.AdditiveBlending,depthWrite:false})); G.add(dust);
    AMBU[1]=(dt,t)=>{ birds(dt,t);
      if(tr.wait>0){ tr.wait-=dt; if(tr.wait<=0){ tr.dir*=-1; tr.z=-50*tr.dir; tram.visible=true; head[0].position.z=5.6*tr.dir; head[1].position.z=-5.6*tr.dir; if(game.mode!=='menu') noise(4,0.05,140); } }
      else { tr.z+=tr.dir*10*dt; tram.position.z=tr.z; spark.material.opacity=Math.random()<0.08?rand(0.5,1):0;
        if(Math.abs(tr.z)>52){ tram.visible=false; tr.wait=rand(10,16); } }
      for(const q of cars){ if(q.wait>0){ q.wait-=dt; q.c.visible=false; continue; } q.c.visible=true;
        q.z+=q.dir*q.sp*dt; q.c.position.z=q.z; q.c.rotation.y=q.dir>0?0:Math.PI;
        if(Math.abs(q.z)>50){ q.z=-48*q.dir; q.wait=rand(1,7); q.sp=rand(11,16); } }
      const a=dg.attributes.position.array;
      for(let i=0;i<N;i++){ a[i*3+1]-=dt*0.12; a[i*3]+=Math.sin(t*0.5+i)*dt*0.1; if(a[i*3+1]<0.2) a[i*3+1]=8; }
      dg.attributes.position.needsUpdate=true; }; }
  // --- 2: krov ---
  { const G=AMB[2];
    // papiri koje nosi vjetar
    const papers=[]; for(let i=0;i<9;i++){ const m=new THREE.Mesh(new THREE.PlaneGeometry(0.42,0.52),lamb(i%2?0xf2eee2:0xd8d1be,{side:THREE.DoubleSide,emissive:0x3a3a40})); G.add(m);
      papers.push({m,x:rand(-13,13),y:0.05,z:rand(-3,16),vy:0,k:rand(0.7,1.3),wait:rand(0,8)}); }
    // grad: susjedne zgrade iza bočnih ograda s osvijetljenim prozorima, crvena svjetla na krovu, TV koji treperi
    const beacons=[], tvs=[];
    for(const sd of [-1,1]){
      const tx=canvasTex(512,256,c=>{ const g=c.getContext('2d'); g.fillStyle='#0c0e1b'; g.fillRect(0,0,512,256);
        for(let y=0;y<10;y++) for(let x=0;x<24;x++){ const r=Math.random();
          g.fillStyle=r<0.22?'#ffd98a':r<0.32?'#9fc4ff':r<0.4?'#ff9ad2':'#1d1f33'; g.fillRect(x*21+5,y*25+6,12,14); } });
      const f=new THREE.Mesh(new THREE.PlaneGeometry(26,14),new THREE.MeshBasicMaterial({map:tx}));
      f.position.set(sd*15.5,-1.5,2); f.rotation.y=-sd*Math.PI/2; G.add(f);
      for(const z of [-4,8]){ const s=glowSprite(0xff2a2a,1.4,0); s.position.set(sd*15.3,5.7,z); G.add(s); beacons.push({s,ph:Math.random()*6}); }
      const tv=glowSprite(0x7fb2ff,1.1,0); tv.position.set(sd*15.3,rand(1,3.5),rand(-2,8)); G.add(tv); tvs.push(tv); }
    const nf={t:rand(3,8),on:0};
    AMBU[2]=(dt,t)=>{
      const W=0.55+0.35*Math.sin(t*0.23)+0.25*Math.sin(t*0.71+1); // udari vjetra
      for(const p of papers){ if(p.wait>0){ p.wait-=dt; p.m.visible=false; continue; } p.m.visible=true;
        p.x+=(1.5+W*5)*p.k*dt; p.vy-=5*dt; p.y+=p.vy*dt;
        if(p.y<0.03){ p.y=0.03; p.vy=Math.random()<W*dt*6?rand(1,3.2)*W:0; }
        p.m.position.set(p.x,p.y+0.02,p.z); p.m.rotation.x+=dt*(p.y>0.05?(3+W*7)*p.k:0); p.m.rotation.z+=dt*W*2*p.k; if(p.y<=0.03) p.m.rotation.x=-Math.PI/2;
        if(p.x>12.5){ p.x=-12.5; p.z=rand(-3,16); p.y=rand(0.03,1.5); p.vy=0; p.wait=rand(0.5,4); } }
      for(const b of beacons) b.s.material.opacity=Math.sin(t*2.4+b.ph)>0.55?1:0.08;
      for(const tv of tvs) if(Math.random()<0.2) tv.material.opacity=rand(0.25,0.8);
      // neon povremeno zatitra
      if(NEON&&NEON.visible){ if(nf.on>0){ nf.on-=dt; const lit=Math.random()<0.45; NEON.material.opacity=lit?1:0.12; NEONL.intensity=lit?0.9:0.1;
          if(nf.on<=0){ NEON.material.opacity=1; NEONL.intensity=0.9; nf.t=rand(5,11); } }
        else if((nf.t-=dt)<=0) nf.on=rand(0.25,0.6); } }; }
  AMB.forEach((g,i)=>g.visible=i===VENUE);
}
function updateAmbience(dt,time){ if(AMBU[VENUE]) AMBU[VENUE](dt,time); }
function drawNeon(c){
  const g=c.getContext('2d'),W=c.width,H=c.height; g.clearRect(0,0,W,H);
  g.textAlign='center'; g.textBaseline='middle'; g.font=`italic ${H*0.52}px ${FONT}`; g.lineJoin='round';
  for(const [blur,lw,col] of [[30,10,'#ff2f9a'],[14,6,'#ff5ab8'],[0,3,'#ffe0f2']]){ g.shadowColor='#ff2f9a'; g.shadowBlur=blur; g.lineWidth=lw; g.strokeStyle=col; g.strokeText('2 NA 2',W/2,H*0.6); }
  g.shadowBlur=18; g.strokeStyle='#ff9ad2'; g.lineWidth=5; g.beginPath(); const w=H*0.34,h=w*0.6,x=W/2,y=H*0.17;
  g.moveTo(x-w/2,y+h/2); g.lineTo(x-w/2,y-h/2); g.lineTo(x-w/4,y); g.lineTo(x,y-h*0.65); g.lineTo(x+w/4,y); g.lineTo(x+w/2,y-h/2); g.lineTo(x+w/2,y+h/2); g.closePath(); g.stroke();
}
const _m=new THREE.Matrix4(), _q=new THREE.Quaternion(), _e=new THREE.Euler(), _s=new V3(1,1,1), _p=new V3();
const _bq=new THREE.Quaternion(), _aq=new THREE.Quaternion(), _lq=new THREE.Quaternion(), _b=new V3(), _o=new V3(), _zero=new THREE.Matrix4().makeScale(0,0,0);
function updateCrowd(dt,time){
  if(!specBody) return;
  if(cheerT>0) cheerT-=dt;
  const e=clamp(cheerT,0,1), K=cheerT>0?crowdK:'', hype=K&&K!=='small'&&e>0.3;
  let li=0; const up=[];
  specs.forEach((q,i)=>{
    const t=time+q.ph, w=K&&(K!=='small'||q.r<0.45)?e:0; // kod običnog koša reagira samo dio publike
    // mirovanje: lagano njihanje, ruke uz tijelo
    let j=0, lean=0, tx=0.08+Math.sin(t*0.7)*0.05, tz=0.12;
    if(K==='small'){ j=Math.max(0,Math.sin(t*9))*0.1; tx=-1.25; tz=-0.25-0.2*Math.sin(t*16); }
    else if(K==='arms'){ j=Math.max(0,Math.sin(t*6))*0.08; tx=-0.15; tz=2.75+Math.sin(t*5)*0.12; }
    else if(K==='jump'){ j=Math.max(0,Math.sin(t*11))*0.32; tx=-0.3; tz=2.45+Math.sin(t*11)*0.35; }
    else if(K==='lean'){ lean=0.4; tx=-2.55; tz=0.55; j=0.02; }
    const ax=lerp(0.08+Math.sin(t*0.7)*0.05,tx,w), az=lerp(0.12,tz,w);
    const by=(q.seat?q.y+0.36:1.16)+j*w;
    _bq.setFromEuler(_e.set(lean*w,q.yaw,Math.sin(t*1.1)*0.04*(1-w),'YXZ'));
    _b.set(q.x,by,q.z);
    _m.compose(_b,_bq,_s); specBody.setMatrixAt(i,_m);
    _o.set(0,0.46,0).applyQuaternion(_bq).add(_b); _m.compose(_o,_bq,_s); specHead.setMatrixAt(i,_m);
    if(q.cap){ _o.set(0,0.58,0).applyQuaternion(_bq).add(_b); _m.compose(_o,_bq,_s); specCap.setMatrixAt(q.ci,_m); }
    // mobitel u desnoj ruci: neki snimaju stalno, većina tek kad se nešto dogodi
    const ph=q.phone&&(q.phoneIdle||hype);
    for(const s of [1,-1]){
      const hold=ph&&s===1, a1=hold?-2.3:ax, a2=hold?0.15:s*az;
      _lq.setFromEuler(_e.set(a1,0,a2,'XYZ')); _aq.copy(_bq).multiply(_lq);
      _o.set(s*0.29,0.24,0).applyQuaternion(_bq).add(_b); _m.compose(_o,_aq,_s); specArms.setMatrixAt(i*2+(s>0?0:1),_m);
      if(hold){ _p.set(0,-0.52,0).applyQuaternion(_aq).add(_o); _m.compose(_p,_bq,_s); specPhone.setMatrixAt(q.pi,_m); up.push(_p.clone()); } }
    if(q.phone&&!ph) specPhone.setMatrixAt(q.pi,_zero);
    if(!q.seat){ _q.setFromEuler(_e.set(0,q.yaw,0)); _m.compose(_p.set(q.x,0.43+j*w,q.z),_q,_s); specLegs.setMatrixAt(li++,_m); } });
  for(const m of [specBody,specHead,specLegs,specArms,specCap,specPhone]) m.instanceMatrix.needsUpdate=true;
  // bljeskalice: rijetko u miru, rafal kod velikih trenutaka
  const rate=hype?(K==='lean'||K==='jump'?14:8):0.35;
  for(const f of FLASHES){ if(f.t>0){ f.t-=dt; f.s.material.opacity=Math.max(0,f.t/0.09); if(f.t<=0) f.s.visible=false; } }
  if(up.length&&Math.random()<rate*dt){ const f=FLASHES.find(f=>f.t<=0);
    if(f){ f.s.position.copy(up[(Math.random()*up.length)|0]); f.s.position.y+=0.03; f.t=0.09; f.s.visible=true; } }
}

// koš
const extraBalls=[];
let net, netAnim=0, rimMesh, rimShake=0, rimLight, netGeo, netBase, netPull=0, rimFlash=0;
const netSway=new V3();
function buildHoop(){
  const metal=new THREE.MeshStandardMaterial({color:0x5b6272,metalness:0.7,roughness:0.35});
  const pole=new THREE.Mesh(new THREE.CylinderGeometry(0.13,0.15,3.7,16),metal); pole.position.set(0,1.85,-1.15); pole.castShadow=true; scene.add(pole);
  const padT=canvasTex(128,256,c=>{ const g=c.getContext('2d'); g.fillStyle='#0d1228'; g.fillRect(0,0,128,256); crown(g,64,110,70,'#f2f2f2'); g.fillStyle='#2f6bff'; g.fillRect(0,236,128,8); });
  const pad=new THREE.Mesh(new THREE.BoxGeometry(0.46,1.9,0.46),new THREE.MeshLambertMaterial({map:padT})); pad.position.set(0,0.95,-1.15); pad.castShadow=true; scene.add(pad);
  for(const y of [3.2,3.58]){ const arm=new THREE.Mesh(new THREE.BoxGeometry(0.13,0.13,2.3),metal); arm.position.set(0,y,0.03); arm.castShadow=true; scene.add(arm); }
  const brace=new THREE.Mesh(new THREE.BoxGeometry(0.08,0.08,1.3),metal); brace.position.set(0,2.9,-0.55); brace.rotation.x=-0.5; scene.add(brace);
  const glass=new THREE.Mesh(new THREE.BoxGeometry(1.8,1.05,0.04),new THREE.MeshStandardMaterial({color:0x9fb8ff,transparent:true,opacity:0.22,roughness:0.05,metalness:0.2}));
  glass.position.set(0,3.425,BOARD_Z-0.02); scene.add(glass);
  const blueM=new THREE.MeshBasicMaterial({color:0x3f86ff}), redM=new THREE.MeshBasicMaterial({color:0xff3b3b}), whiteM=new THREE.MeshBasicMaterial({color:0xffffff});
  const bar=(w,h,x,y,z,m)=>{ const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,0.045),m); b.position.set(x,y,z); scene.add(b); };
  const T=0.05, cy=3.425, bz=BOARD_Z-0.005;
  bar(0.9,T,-0.45,cy+0.525,bz,blueM); bar(0.9,T,0.45,cy+0.525,bz,redM);
  bar(0.9,T,-0.45,cy-0.525,bz,blueM); bar(0.9,T,0.45,cy-0.525,bz,redM);
  bar(T,1.05+T,-0.9,cy,bz,blueM); bar(T,1.05+T,0.9,cy,bz,redM);
  const ic=RIM_Y+0.26, iz=BOARD_Z+0.012;
  bar(0.59,0.03,0,ic+0.225,iz,whiteM); bar(0.59,0.03,0,ic-0.225,iz,whiteM); bar(0.03,0.45,-0.295,ic,iz,whiteM); bar(0.03,0.45,0.295,ic,iz,whiteM);
  const halo=new THREE.Mesh(new THREE.PlaneGeometry(2.7,1.9),new THREE.MeshBasicMaterial({map:canvasTex(256,180,c=>{ const g=c.getContext('2d'); g.clearRect(0,0,256,180);
      const gr=g.createLinearGradient(0,0,256,0); gr.addColorStop(0,'#3f86ff'); gr.addColorStop(0.5,'#b070ff'); gr.addColorStop(1,'#ff3b3b');
      g.strokeStyle=gr; g.lineWidth=10; g.shadowColor='#8a6bff'; g.shadowBlur=26; for(let k=0;k<3;k++) g.strokeRect(32,26,192,128); }),
    transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:0.8}));
  halo.position.set(0,3.425,BOARD_Z-0.03); scene.add(halo);
  const rim=new THREE.Mesh(new THREE.TorusGeometry(RIM_R,0.019,10,32),new THREE.MeshStandardMaterial({color:0xff5a14,emissive:0x551800,metalness:0.4,roughness:0.4}));
  rim.rotation.x=Math.PI/2; rim.position.set(0,RIM_Y,HOOP_Z); rim.castShadow=true; scene.add(rim); rimMesh=rim;
  const br=new THREE.Mesh(new THREE.BoxGeometry(0.1,0.05,0.18),metal); br.position.set(0,RIM_Y,BOARD_Z+0.09); scene.add(br);
  rimLight=new THREE.PointLight(0xffa050,0.7,3.4); rimLight.position.set(0,RIM_Y+0.35,HOOP_Z+0.4); scene.add(rimLight);
  buildNet();
}
const NET_N=14, NET_L=5;
function buildNet(){
  netBase=[]; const idx=[];
  for(let l=0;l<NET_L;l++){ const r=RIM_R-(RIM_R-0.13)*l/(NET_L-1), y=-l*0.115, off=(l%2)*0.5;
    for(let i=0;i<NET_N;i++){ const a=(i+off)/NET_N*Math.PI*2; netBase.push(Math.cos(a)*r,y,Math.sin(a)*r); } }
  for(let l=0;l<NET_L-1;l++) for(let i=0;i<NET_N;i++){ const a=l*NET_N+i;
    const b1=(l+1)*NET_N+i, b2=(l+1)*NET_N+(l%2===0?(i-1+NET_N)%NET_N:(i+1)%NET_N); idx.push(a,b1,a,b2); }
  for(let i=0;i<NET_N;i++) idx.push((NET_L-1)*NET_N+i,(NET_L-1)*NET_N+(i+1)%NET_N);
  netGeo=new THREE.BufferGeometry(); netGeo.setAttribute('position',new THREE.Float32BufferAttribute(netBase.slice(),3)); netGeo.setIndex(idx);
  net=new THREE.LineSegments(netGeo,new THREE.LineBasicMaterial({color:0xffffff,transparent:true,opacity:0.92}));
  net.position.set(0,RIM_Y,HOOP_Z); scene.add(net);
}
function updateNet(dt,time){
  for(const b of extraBalls){ const bx=b.pos.x, bz=b.pos.z-HOOP_Z, by=b.pos.y-RIM_Y;
    if(by<0.05&&by>-0.6&&Math.hypot(bx,bz)<RIM_R+0.06){ netPull=Math.max(netPull,0.55+Math.min(0.6,-b.vel.y*0.08)); netSway.x+=b.vel.x*dt*0.6; netSway.z+=b.vel.z*dt*0.6; } }
  const bx=ball.pos.x, bz=ball.pos.z-HOOP_Z, by=ball.pos.y-RIM_Y;
  if(ball.state!=='held'&&by<0.05&&by>-0.6&&Math.hypot(bx,bz)<RIM_R+0.06){ netPull=Math.max(netPull,0.55+Math.min(0.6,-ball.vel.y*0.08)); netSway.x+=ball.vel.x*dt*0.6; netSway.z+=ball.vel.z*dt*0.6; }
  if(netAnim>0){ netAnim-=dt; netPull=Math.max(netPull,0.75); }
  netPull*=Math.exp(-3.5*dt); netSway.multiplyScalar(Math.exp(-3*dt));
  const wob=Math.sin(time*18)*netPull*0.05, arr=netGeo.attributes.position.array;
  for(let v=0;v<netBase.length/3;v++){ const f=Math.floor(v/NET_N)/(NET_L-1), sq=1-netPull*0.3*f;
    arr[v*3]=netBase[v*3]*sq+(netSway.x+wob)*f*0.5; arr[v*3+1]=netBase[v*3+1]*(1+netPull*0.35); arr[v*3+2]=netBase[v*3+2]*sq+netSway.z*f*0.5; }
  netGeo.attributes.position.needsUpdate=true;
  net.rotation.x=rimMesh.rotation.x-Math.PI/2;
}


function updateCamera(dt){
  const foc=hypeFocus.p&&game.mode!=='menu';
  const f=foc?hypeFocus.p.pos:ball.state==='held'?ball.holder.pos:ball.pos;
  const tx=clamp(f.x*(foc?0.8:0.45),-4,4), zk=game.mode==='menu'?0:foc?1:clamp((6.5-f.z)/4.5,0,1);
  const pos=portrait?new V3(tx*0.5,10.5-zk*1.6,17.5-zk*2.6):new V3(tx,8-zk*0.9,18.5-zk*3);
  const look=portrait?new V3(tx*0.6,0.6+zk*0.4,6.2-zk*1.4):new V3(tx*0.8,0.9+zk*0.35,6-zk*2);
  const k=game.mode==='menu'?1:1-Math.exp(-3*dt);
  camBase.lerp(pos,k); camLook.lerp(look,k); camera.position.copy(camBase);
  if(shake>0){ shake-=dt; const s=Math.max(0,shake)*0.5; camera.position.x+=rand(-s,s); camera.position.y+=rand(-s,s)*0.6; }
  camera.lookAt(camLook);
  // udarni zum kod velikih trenutaka (+ blago približavanje dok traje fokus)
  if(punchT>0) punchT-=dt;
  const pk=Math.max(0,punchT), zf=(pk>0?Math.sin(Math.min(1,pk*2.2)*Math.PI*0.5)*0.16:0)+(foc?0.14:0);
  const fov=baseFov*(1-zf); if(Math.abs(camera.fov-fov)>0.01){ camera.fov+=(fov-camera.fov)*Math.min(1,dt*(pk>0?20:6)); camera.updateProjectionMatrix(); }
}

const VENUES=[
  {sky:['#5da7e6','#a9d3f2','#f3e6cf','#f6d9b0'],fog:0xc9dcea,near:60,far:150,hemi:1.05,hs:0xffffff,hg:0x8a7a60,amb:.45,key:1.0,flood:.15,glow:0,neon:false,sky2:.45,bridge:false},
  {sky:['#16183a','#4a2f66','#d9786a','#f0a878'],fog:0x3d2b4a,near:45,far:115,hemi:.62,hs:0x9a8ad6,hg:0x2a1a24,amb:.32,key:1.0,flood:.7,glow:.5,neon:true,sky2:.9,bridge:true},
  {sky:['#04061a','#14113c','#3b1d5a','#a44f6a'],fog:0x191536,near:42,far:100,hemi:.55,hs:0x7a86d6,hg:0x1a1020,amb:.3,key:1.05,flood:.8,glow:.75,neon:true,sky2:1,bridge:false}];
function setVenue(i){ const v=VENUES[i]; scene.background=skyTexC(v.sky); scene.fog.color.setHex(v.fog); scene.fog.near=v.near; scene.fog.far=v.far;
  hemi.intensity=v.hemi; hemi.color.setHex(v.hs); hemi.groundColor.setHex(v.hg); amb.intensity=v.amb; key.intensity=v.key;
  FLOODS.forEach(f=>f.intensity=v.flood); GLOWS.forEach(g=>{ g.visible=v.glow>0; g.material.opacity=v.glow; });
  if(NEON){ NEON.visible=v.neon; NEON.material.opacity=1; } if(NEONL) NEONL.intensity=v.neon?0.9:0; if(SKYMAT) SKYMAT.opacity=v.sky2; if(BRIDGE) BRIDGE.visible=v.bridge;
  VENUE=i; AMB.forEach((g,k)=>g.visible=k===i); if(glareEl) glareEl.style.display=i===0?'block':'none'; }

function resize(){
  const w=innerWidth,h=innerHeight,a=w/h; renderer.setSize(w,h); camera.aspect=a; portrait=a<0.9;
  const hf=portrait?56:64; const vf=2*Math.atan(Math.tan(hf*Math.PI/360)/a)*180/Math.PI;
  camera.fov=clamp(Math.max(vf,portrait?0:46),40,92); baseFov=camera.fov; camera.updateProjectionMatrix();
}
let baseFov=50;
addEventListener('resize',resize);
