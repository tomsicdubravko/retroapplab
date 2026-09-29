// ===== Košarka 2 na 2 - efekti: trag lopte, iskre, arcade trenutci (hype, usporeno, zum) =====
'use strict';
// efekti: trag lopte i iskre
const TRAIL=[], trailPts=[];
for(let i=0;i<12;i++){ const sp=glowSprite(0xffa040,0.3,0); sp.visible=false; scene.add(sp); TRAIL.push(sp); }
const PMAX=160, pPos=new Float32Array(PMAX*3), pCol=new Float32Array(PMAX*3), pGeo=new THREE.BufferGeometry();
pGeo.setAttribute('position',new THREE.BufferAttribute(pPos,3)); pGeo.setAttribute('color',new THREE.BufferAttribute(pCol,3));
const pts=new THREE.Points(pGeo,new THREE.PointsMaterial({size:0.16,map:GLOW,vertexColors:true,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));
pts.frustumCulled=false; scene.add(pts);
const parts=[];
function burst(x,y,z,n,spd,cols){ if(game.mp&&mpn.host) netSend({t:'bu',a:[x,y,z,n,spd,cols]}); for(let i=0;i<n;i++){ if(parts.length>=PMAX) parts.shift();
  const a=Math.random()*Math.PI*2, e=rand(-0.2,1.2), v=spd*rand(0.4,1);
  parts.push({x,y,z,vx:Math.cos(a)*Math.cos(e)*v,vy:Math.sin(e)*v,vz:Math.sin(a)*Math.cos(e)*v,life:rand(0.5,1),c:new THREE.Color(cols[(Math.random()*cols.length)|0])}); } }
function updateFx(dt){
  for(let i=parts.length-1;i>=0;i--){ const q=parts[i]; q.life-=dt; if(q.life<=0){ parts.splice(i,1); continue; }
    q.vy-=7*dt; q.x+=q.vx*dt; q.y+=q.vy*dt; q.z+=q.vz*dt; if(q.y<0.03){ q.y=0.03; q.vy*=-0.4; } }
  for(let i=0;i<PMAX;i++){ const q=parts[i];
    if(q){ pPos[i*3]=q.x; pPos[i*3+1]=q.y; pPos[i*3+2]=q.z; const f=Math.min(1,q.life*1.6); pCol[i*3]=q.c.r*f; pCol[i*3+1]=q.c.g*f; pCol[i*3+2]=q.c.b*f; }
    else pPos[i*3+1]=-50; }
  pGeo.attributes.position.needsUpdate=true; pGeo.attributes.color.needsUpdate=true;
  const fast=(ball.state==='shot'||ball.state==='pass')&&ball.vel.length()>6.5;
  if(fast) trailPts.push(ball.pos.clone()); else if(trailPts.length) trailPts.shift();
  while(trailPts.length>12) trailPts.shift();
  TRAIL.forEach((sp,i)=>{ const pt=trailPts[trailPts.length-1-i]; if(!pt||i===0){ sp.visible=false; return; }
    sp.visible=true; sp.position.copy(pt); const f=1-i/12; sp.material.opacity=0.55*f; const sc=0.36*f+0.08; sp.scale.set(sc,sc,1); });
}


// arcade trenutak: veliki natpis + trešnja + bljesak + usporeno + zum kamere
// o: {dur,shake,flash,slow,punch,edge,focus(indeks igrača),wob}
let hypeT=0, slowT=0, slowF=0.3, punchT=0, edgeT=0;
const hypeFocus={p:null,t:0};
function hype(text,sub,cls,o){
  o=o||{};
  if(mpn.host&&game.mp) netSend({t:'h',a:[text,sub,cls,o]});
  const h=$('hype'); h.className=cls||''; h.querySelector('.t').textContent=text; h.querySelector('.s').textContent=sub||'';
  void h.offsetWidth; h.classList.add('show','go'); if(o.wob) h.classList.add('wob');
  $('msg').classList.remove('show'); msgT=0;
  hypeT=o.dur||1.4;
  if(o.shake) shake=Math.max(shake,o.shake);
  if(o.flash) flashT=Math.max(flashT,o.flash);
  if(o.slow){ slowT=Math.max(slowT,o.slow); slowF=Math.min(slowT>o.slow?slowF:1,o.slowF||0.3); }
  if(o.punch) punchT=Math.max(punchT,o.punch);
  if(o.edge){ edgeT=0.7; $('edge').style.setProperty('--c',getComputedStyle(h).getPropertyValue('--c')); }
  if(o.focus!=null&&players[o.focus]){ hypeFocus.p=players[o.focus]; hypeFocus.t=o.slow?o.slow+0.5:0.8; }
  sfx0.stamp();
}
function updateHype(dt){
  if(hypeT>0){ hypeT-=dt; if(hypeT<=0) $('hype').className='out'; }
  if(edgeT>0){ edgeT-=dt; } $('edge').style.opacity=Math.max(0,edgeT)/0.7;
  if(hypeFocus.t>0){ hypeFocus.t-=dt; if(hypeFocus.t<=0) hypeFocus.p=null; }
}
