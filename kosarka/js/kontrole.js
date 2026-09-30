// ===== Košarka 2 na 2 - kontrole: tipkovnica (A/B), kontroleri, dodirni joystick, upravljanje igračem =====
'use strict';
// ---------- input ----------
const input={kx:0,kz:0,jx:0,jz:0,shootDown:false,shootUp:false,passDown:false,passUp:false,alleyDown:false,stealDown:false};
// lokalno: tipkovnica je podijeljena na A (WASD, Space, E, Q, R, lijevi Shift) i B (strelice, J, K, L, U, desni Shift)
const input2={kx:0,kz:0,shootDown:false,shootUp:false,passDown:false,passUp:false,alleyDown:false,stealDown:false};
const K={}, CODES={};
const splitKeys=()=>game.local||LOC.open;
addEventListener('keydown',e=>{
  const k=e.key.toLowerCase();
  if([' ','arrowup','arrowdown','arrowleft','arrowright'].includes(k)) e.preventDefault();
  audio();
  if(e.repeat) return;
  K[k]=true; CODES[e.code]=true;
  if(splitKeys()&&'jklu'.includes(k)&&k.length===1){
    if(k==='j') input2.shootDown=true; if(k==='k') input2.passDown=true; if(k==='l') input2.stealDown=true; if(k==='u') input2.alleyDown=true; }
  else {
    if(k===' '||k==='j') input.shootDown=true;
    if(k==='e'||k==='k') input.passDown=true;
    if(k==='q'||k==='l'||k==='f') input.stealDown=true;
    if(k==='r') input.alleyDown=true; }
  if(LOC.open&&k==='enter') locStart();
  if((k==='p'||k==='escape')&&(game.mode==='play'||game.mode==='dead'||game.mode==='trice')) togglePause();
});
addEventListener('keyup',e=>{ const k=e.key.toLowerCase(); K[k]=false; CODES[e.code]=false;
  if(splitKeys()){ if(k==='j') input2.shootUp=true; if(k==='k') input2.passUp=true; if(k===' ') input.shootUp=true; if(k==='e') input.passUp=true; return; }
  if(k===' '||k==='j') input.shootUp=true; if(k==='e'||k==='k') input.passUp=true; });
addEventListener('blur',()=>{ for(const k in K) K[k]=false; for(const c in CODES) CODES[c]=false; });
function readKeys(){
  if(splitKeys()){
    input.kx=(K.d?1:0)-(K.a?1:0); input.kz=(K.s?1:0)-(K.w?1:0);
    input2.kx=(K.arrowright?1:0)-(K.arrowleft?1:0); input2.kz=(K.arrowdown?1:0)-(K.arrowup?1:0); }
  else {
    input.kx=((K.d||K.arrowright)?1:0)-((K.a||K.arrowleft)?1:0);
    input.kz=((K.s||K.arrowdown)?1:0)-((K.w||K.arrowup)?1:0); }
  pollPads();
}
function clearEdges(){ for(const o of [input,input2]) o.shootDown=o.shootUp=o.passDown=o.passUp=o.alleyDown=o.stealDown=false; }
// kontroleri (standardni raspored): lijeva palica/križ kretanje · A šut · X dodaj · B dribling/krađa · Y alley · RB/RT sprint · Start
const PADS=[];
function pollPads(){ let gp=[]; try{ gp=navigator.getGamepads?navigator.getGamepads():[]; }catch(e){}
  for(let i=0;i<4;i++){ const g=gp[i], s=PADS[i]||(PADS[i]={on:false,x:0,z:0,sprint:false,prev:[]});
    s.on=!!(g&&g.connected); if(!s.on){ s.x=s.z=0; s.prev=[]; continue; }
    const b=n=>!!(g.buttons[n]&&g.buttons[n].pressed), dz=v=>Math.abs(v)<0.22?0:v;
    let x=dz(g.axes[0]||0), z=dz(g.axes[1]||0); if(b(14)) x=-1; if(b(15)) x=1; if(b(12)) z=-1; if(b(13)) z=1;
    s.x=x; s.z=z; s.sprint=b(5)||b(7)||b(10);
    const now=[b(0),b(2),b(1),b(3),b(9),b(8)], P=s.prev;
    s.sd=now[0]&&!P[0]; s.su=!now[0]&&!!P[0]; s.pd=now[1]&&!P[1]; s.pu=!now[1]&&!!P[1]; s.st=now[2]&&!P[2]; s.ad=now[3]&&!P[3]; s.start=now[4]&&!P[4]; s.back=now[5]&&!P[5]; s.prev=now; } }
// ulaz po izvoru: 'k1' tipkovnica A, 'k2' tipkovnica B, 'g0'..'g3' kontroleri
function srcIn(s){
  if(s==='k1') return {x:input.kx,z:input.kz,sprint:!!CODES.ShiftLeft,sd:input.shootDown,su:input.shootUp,pd:input.passDown,pu:input.passUp,ad:input.alleyDown,st:input.stealDown};
  if(s==='k2') return {x:input2.kx,z:input2.kz,sprint:!!CODES.ShiftRight,sd:input2.shootDown,su:input2.shootUp,pd:input2.passDown,pu:input2.passUp,ad:input2.alleyDown,st:input2.stealDown};
  const p=PADS[+s.slice(1)]; return p&&p.on?p:{x:0,z:0}; }
const SRC_NAME={k1:T('izvor.k1'),k2:T('izvor.k2'),g0:T('izvor.g0'),g1:T('izvor.g1'),g2:T('izvor.g2'),g3:T('izvor.g3')};


const isTouch=(window.matchMedia&&matchMedia('(pointer:coarse)').matches)||navigator.maxTouchPoints>0;
if(isTouch){ $('helpKeys').style.display='none'; $('helpTouch').style.display='block'; document.body.classList.add('touch'); }
const joy={id:null,cx:0,cy:0};
const jz=$('joyZone'), jb=$('joyBase'), jk=$('joyKnob');
jz.addEventListener('pointerdown',e=>{ audio(); if(joy.id!==null)return; joy.id=e.pointerId; jz.setPointerCapture(e.pointerId);
  const r=jz.getBoundingClientRect(); joy.cx=e.clientX; joy.cy=e.clientY; jb.style.left=(e.clientX-r.left)+'px'; jb.style.top=(e.clientY-r.top)+'px'; jb.style.bottom='auto'; jb.classList.add('active'); jk.style.transform=''; });
jz.addEventListener('pointermove',e=>{ if(e.pointerId!==joy.id)return; let dx=e.clientX-joy.cx,dy=e.clientY-joy.cy; const L=Math.hypot(dx,dy),R=52;
  if(L>R){dx*=R/L;dy*=R/L;} jk.style.transform=`translate(${dx}px,${dy}px)`; input.jx=L>6?dx/Math.max(L,1)*Math.min(1,L/R):0; input.jz=L>6?dy/Math.max(L,1)*Math.min(1,L/R):0; input.jSprint=L>=R*0.98; jb.classList.toggle('sprint',input.jSprint); });
const joyEnd=e=>{ if(e.pointerId!==joy.id)return; joy.id=null; input.jx=0; input.jz=0; input.jSprint=false; jb.classList.remove('active','sprint'); jb.style.left=jb.style.top=jb.style.bottom=''; jk.style.transform=''; };
jz.addEventListener('pointerup',joyEnd); jz.addEventListener('pointercancel',joyEnd);
const ICONS={
  shoot:'<svg viewBox="0 0 48 48" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"><circle cx="24" cy="24" r="17"/><path d="M7 24h34M24 7v34M12 11c6 6 6 20 0 26M36 11c-6 6-6 20 0 26"/></svg>',
  jump:'<svg viewBox="0 0 48 48" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M24 38V12M13 22l11-11 11 11"/><path d="M14 42h20" opacity=".6"/></svg>',
  pass:'<svg viewBox="0 0 48 48" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><circle cx="13" cy="33" r="6"/><path d="M20 27l16-14M25 12h11v11"/></svg>',
  cmd:'<svg viewBox="0 0 48 48" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M8 12h32v18H22l-9 8v-8H8z"/><path d="M18 21h12" stroke-width="3"/></svg>',
  swap:'<svg viewBox="0 0 48 48" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M10 18h26l-7-7M38 30H12l7 7"/></svg>',
  drib:'<svg viewBox="0 0 48 48" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M8 38l10-10-6-6 12-12"/><path d="M17 10h7v7"/><circle cx="34" cy="34" r="7" stroke-width="3"/></svg>',
  steal:'<svg viewBox="0 0 48 48" fill="#fff"><path d="M14 26V14a3 3 0 016 0v9h1V10a3 3 0 016 0v13h1V12a3 3 0 016 0v12h1v-7a3 3 0 016 0v12c0 9-6 15-14 15h-2c-5 0-9-3-12-8l-5-8a3 3 0 015-3z"/></svg>'};
function setBtn(el,k,label){ if(el.dataset.k===k) return; el.dataset.k=k; el.querySelector('.ic').innerHTML=ICONS[k]; el.querySelector('span').textContent=label; el.setAttribute('aria-label',label); }
function bindBtn(el,down,up){
  el.addEventListener('pointerdown',e=>{ e.preventDefault(); audio(); el.setPointerCapture(e.pointerId); el.classList.add('down'); if(navigator.vibrate) try{navigator.vibrate(8);}catch(_){} down(); });
  const u=e=>{ el.classList.remove('down'); if(up) up(); };
  el.addEventListener('pointerup',u); el.addEventListener('pointercancel',u);
}
bindBtn($('bShoot'),()=>input.shootDown=true,()=>input.shootUp=true);
bindBtn($('bPass'),()=>input.passDown=true,()=>input.passUp=true);
bindBtn($('bSteal'),()=>input.stealDown=true);

// ---------- user control ----------
function updateUser(dt){
  if(game.controlled) updateHuman(game.controlled,game.ctrlIn?game.ctrlIn():localIn(),dt);
  for(const [p,inp] of game.humans) if(p!==game.controlled) updateHuman(p,inp(),dt);
}
function updateHuman(p,I,dt){
  let ix=I.x, iz=I.z; const m=Math.hypot(ix,iz); if(m>1){ix/=m;iz/=m;}
  const holder=ball.holder===p;
  if(p.y===0&&!p.shooting&&!p.dunking){
    if(p.moveT>0){ /* zadrži zalet poteza */ }
    else if(p.beatT>0) p.vel.multiplyScalar(Math.exp(-8*dt));
    else if(p.gather||p.fakeT>0) p.vel.multiplyScalar(Math.exp(-14*dt));
    else { const sprint=I.sprint&&m>0.3&&p.stam>0.02; p.stam=sprint?Math.max(0,p.stam-dt*0.4):Math.min(1,p.stam+dt*0.22);
      const sp=(holder?5.2:5.6)*(sprint?1.22:1)*p.st.spd, a=Math.min(1,12*dt); p.vel.x+=(ix*sp-p.vel.x)*a; p.vel.z+=(iz*sp-p.vel.z)*a; }
  }
  // šut: kratki dodir = finta, držanje = skok šut, zalet prema košu = zakucavanje
  if(I.sd){
    if(holder&&!p.shooting&&!p.dunking&&!p.gather&&p.y===0&&p.fakeT<=0){ if(canDunk(p)) startDunk(p); else { p.gather=true; p.gatherT=0; } }
    else if(!holder) jump(p,1);
  }
  if(p.gather){
    p.gatherT+=dt;
    if(!holder) p.gather=false;
    else if(I.su){ p.gather=false; pumpFake(p); }
    else if(p.gatherT>=GATHER*p.st.gather){ p.gather=false; startShot(p); }
  } else if(I.su&&p.shooting&&holder) releaseShot(p,qualityFromT(p.shootT,p.st.win*(p.st.win3&&isThree(p.pos.x,p.pos.z)?p.st.win3:1)));
  // dodavanje: kratki dodir = dodaj, držanje = alley-oop lob
  if(I.pd){
    if(game.solo){}
    else if(holder&&!p.shooting&&!p.dunking&&!p.gather){ p.passHolding=true; p.passHold=0; }
    else if(game.naredbe){ p.cmdHolding=true; p.cmdHold=0; }
    else if(!game.mp&&!game.local&&(!ball.holder||ball.holder.team!==p.team)) setControlled(mateOf(p));
  }
  // karijera: naredbe botu (kratki dodir "Daj loptu!" / u obrani "Pritisni!", držanje "Šutiraj!")
  if(p.cmdHolding){ p.cmdHold+=dt;
    if(holder||!game.naredbe) p.cmdHolding=false;
    else if(I.pu){ p.cmdHolding=false; naredi(p,'dodir'); }
    else if(p.cmdHold>=0.35){ p.cmdHolding=false; naredi(p,'drzi'); } }
  if(p.passHolding){
    if(!holder||p.shooting||p.dunking) p.passHolding=false;
    else { p.passHold+=dt;
      if(I.pu){ p.passHolding=false; doPass(p,mateOf(p)); }
      else if(p.passHold>=0.3){ p.passHolding=false; tryAlley(p); } }
  }
  if(I.ad&&!game.solo&&holder&&!p.shooting&&!p.dunking&&!p.gather) tryAlley(p);
  if(I.st){ if(holder) dribbleMove(p,ix,iz); else userSteal(p); }
}


function naredi(p,kako){ const bot=mateOf(p), h=ball.holder;
  if(h&&h.team!==p.team){ bot.ai.pressT=5; bot.ai.cmd=null; oblacic(bot,T('naredba.pritisni')); return; }   // obrana
  if(kako==='drzi'){ bot.ai.cmd={k:'sut',t:3}; oblacic(bot,T('naredba.sutiraj')); }
  else { bot.ai.cmd={k:'lopta',t:2.5}; oblacic(bot,T('naredba.dajLoptu')); } }
// oblačić iznad igrača (naredbe botu, alley-oop poziv)
const oblEl=document.createElement('div'); oblEl.id='oblacic'; document.body.appendChild(oblEl);
let oblT=0, oblP=null;
function oblacic(p,text){ oblEl.textContent=text; oblP=p; oblT=1.4; oblEl.classList.add('show'); }
function updateOblacic(dt){ if(oblT<=0) return; oblT-=dt;
  if(oblT<=0||game.mode==='menu'||game.mode==='over'){ oblT=0; oblEl.classList.remove('show'); return; }
  _p.set(oblP.pos.x,oblP.y+3.0,oblP.pos.z).project(camera);
  oblEl.style.left=((_p.x+1)/2*innerWidth)+'px'; oblEl.style.top=((1-_p.y)/2*innerHeight)+'px'; }

function localIn(){ return {x:input.kx+input.jx,z:input.kz+input.jz,sprint:!!(K.shift||input.jSprint),sd:input.shootDown,su:input.shootUp,pd:input.passDown,pu:input.passUp,ad:input.alleyDown,st:input.stealDown}; }
