// ===== Košarka 2 na 2 - hud: poruke, avatari i kartice igrača, minimapa, prikaz rezultata =====
'use strict';
// ---------- UI helpers ----------
let msgT=0, fbT=0;
function isHuman(p){ return p===game.controlled||game.humans.has(p); }
function fbFor(p,t,c){ if(p===game.controlled||(game.local&&game.humans.has(p))) feedback(t,c);
  else if(mpn.host&&game.humans.has(p)){ const g=mpn.conns.find(x=>players[x.slot]===p); if(g) sendTo(g,{t:'fb',a:[t,c]}); } }

function flash(text,sub,dur,cls){ if(mpn.host&&game.mp) netSend({t:'f',a:[text,sub,dur,cls]}); const m=$('msg'); m.className='show '+(cls||''); m.innerHTML=`<span class="t">${text}</span>`+(sub?`<span class="s">${sub}</span>`:''); msgT=dur||1.2; }

function drawAvatar(c,info,team){
  const g=c.getContext('2d'),W=c.width,H=c.height,tc=COLS[team].css, skin='#'+info.skin.toString(16).padStart(6,'0');
  const bg=g.createLinearGradient(0,0,0,H); bg.addColorStop(0,team?'#5a1822':'#15307a'); bg.addColorStop(1,'#070a18'); g.fillStyle=bg; g.fillRect(0,0,W,H);
  const hx=W/2, hy=H*0.47, r=H*0.26;
  g.fillStyle=tc; g.beginPath(); g.ellipse(hx,H*1.05,W*0.4,H*0.32,0,Math.PI,0); g.fill();
  g.fillStyle=skin; g.fillRect(hx-r*0.35,hy+r*0.6,r*0.7,r*0.8);
  if(info.hair==='pony'){ g.fillStyle=info.hairCol; g.beginPath(); g.ellipse(hx+r*0.95,hy+r*0.35,r*0.32,r*0.8,0.35,0,Math.PI*2); g.fill(); }
  g.fillStyle=skin; g.beginPath(); g.arc(hx-r,hy+2,r*0.2,0,Math.PI*2); g.arc(hx+r,hy+2,r*0.2,0,Math.PI*2); g.fill();
  g.beginPath(); g.arc(hx,hy,r,0,Math.PI*2); g.fill();
  if(info.beard){ g.fillStyle=info.hairCol; g.globalAlpha=0.9; g.beginPath(); g.arc(hx,hy+r*0.1,r*0.95,0.12*Math.PI,0.88*Math.PI); g.lineTo(hx,hy+r*0.4); g.fill(); g.globalAlpha=1; }
  g.fillStyle='#1a1010'; g.beginPath(); g.arc(hx-r*0.36,hy+r*0.05,r*0.1,0,Math.PI*2); g.arc(hx+r*0.36,hy+r*0.05,r*0.1,0,Math.PI*2); g.fill();
  g.fillRect(hx-r*0.52,hy-r*0.22,r*0.32,r*0.07); g.fillRect(hx+r*0.2,hy-r*0.22,r*0.32,r*0.07);
  g.strokeStyle='rgba(70,25,25,.85)'; g.lineWidth=2; g.beginPath(); g.arc(hx,hy+r*0.3,r*0.28,0.25,Math.PI-0.25); g.stroke();
  g.fillStyle=info.hairCol;
  if(info.hair==='cap'){ g.beginPath(); g.arc(hx,hy-r*0.12,r*1.06,Math.PI,0); g.fill(); g.beginPath(); g.ellipse(hx,hy-r*0.14,r*1.3,r*0.2,0,0,Math.PI*2); g.fill(); g.fillStyle='rgba(255,255,255,.85)'; crown(g,hx,hy-r*0.6,r*0.5,'rgba(255,255,255,.85)'); }
  else { g.beginPath(); g.ellipse(hx,hy-r*0.45,r*1.02,r*0.62,0,Math.PI,0); g.fill();
    g.fillStyle='#fff'; g.fillRect(hx-r*1.02,hy-r*0.55,r*2.04,info.hair==='pony'?r*0.14:r*0.26); }
  g.fillStyle='#fff'; g.font=`bold ${Math.round(H*0.2)}px sans-serif`; g.textAlign='center'; g.fillText(info.num,hx,H*0.99);
}
const cardEls=[];
players.forEach(p=>{ const d=document.createElement('div'); d.className='pc'; const cv=document.createElement('canvas'); cv.width=120; cv.height=88; drawAvatar(cv,p.info,p.team);
  const b=document.createElement('b'); b.textContent=p.info.name; const i=document.createElement('i'); i.textContent=p.info.tag;
  const u=document.createElement('u'); u.textContent=p.info.role;
  d.appendChild(cv); d.appendChild(u); d.appendChild(b); d.appendChild(i); $(p.team?'cardsRed':'cardsBlue').appendChild(d); cardEls.push(d); });
function feedback(text,color){ const f=$('fb'); f.textContent=text; f.style.color=color||'#fff'; f.style.opacity=1; fbT=0.9; }


const mm=$('minimap'), mg=mm.getContext('2d');
function drawMinimap(){
  const W=mm.width,H=mm.height,pad=16,sx=(W-2*pad)/15,sz=(H-2*pad)/14,X=x=>pad+(x+7.5)*sx,Z=z=>pad+z*sz;
  mg.clearRect(0,0,W,H);
  mg.fillStyle='rgba(210,60,45,.45)'; mg.fillRect(X(-2.45),Z(0),4.9*sx,5.8*sz);
  mg.strokeStyle='rgba(255,255,255,.6)'; mg.lineWidth=2; mg.strokeRect(X(-7.5),Z(0),15*sx,14*sz); mg.strokeRect(X(-2.45),Z(0),4.9*sx,5.8*sz);
  const a0=Math.atan2(CORNER_Z-HOOP_Z,-CORNER_X), a1=Math.atan2(CORNER_Z-HOOP_Z,CORNER_X);
  mg.beginPath(); mg.moveTo(X(-CORNER_X),Z(0)); mg.lineTo(X(-CORNER_X),Z(CORNER_Z)); mg.ellipse(X(0),Z(HOOP_Z),THREE_R*sx,THREE_R*sz,0,a0,a1,true); mg.lineTo(X(CORNER_X),Z(0)); mg.stroke();
  mg.fillStyle='#ff7a1a'; mg.beginPath(); mg.arc(X(0),Z(HOOP_Z),5,0,Math.PI*2); mg.fill();
  mg.textAlign='center'; mg.textBaseline='middle'; mg.font='bold 13px sans-serif';
  for(const p of players){ if(p.active===false) continue; const x=X(p.pos.x), y=Z(p.pos.z);
    mg.fillStyle=p.team?'#ef3b2f':'#2f6bff'; mg.beginPath(); mg.arc(x,y,11,0,Math.PI*2); mg.fill();
    mg.lineWidth=p===game.controlled?4:2; mg.strokeStyle=p===game.controlled?'#ffd23f':'#fff'; mg.stroke();
    mg.fillStyle='#fff'; mg.fillText(p.info.tag[1],x,y+1); }
  mg.fillStyle='#ffa126'; mg.beginPath(); mg.arc(X(ball.pos.x),Z(ball.pos.z),5,0,Math.PI*2); mg.fill();
}
function updateHUD(dt){
  $('s0').textContent=game.score[0]; $('s1').textContent=game.score[1];
  cardEls.forEach((d,i)=>d.classList.toggle('on',(players[i]===game.controlled||(game.local&&game.humans.has(players[i])))&&game.mode!=='menu'));
  const cc=game.controlled; $('stam').style.opacity=(cc&&game.mode==='play'&&cc.stam<0.99)?1:0; if(cc) $('stam').firstElementChild.style.width=(cc.stam*100)+'%';
  if(flashT>0){ flashT-=dt; } $('flashOv').style.opacity=Math.max(0,flashT)/0.22*0.55;
  drawMinimap();
  const scv=Math.max(0,game.shotClock), se=$('shot'); se.textContent=(scv<10?'0':'')+scv.toFixed(1); se.classList.toggle('low',scv<=4&&!game.solo);
  if(game.solo){ $('s0').textContent=game.soloMade; $('s1').textContent=game.soloShots; se.textContent=game.soloShots?Math.round(game.soloMade/game.soloShots*100)+'%':'—'; $('target').textContent=T('hud.solo'); }
  const sb=$('scbar'), fr=scv/SHOT_CLOCK, fl=sb.querySelector('.fl');
  sb.classList.toggle('on',game.mode==='play'||game.mode==='dead'); sb.classList.toggle('low',scv<=3&&game.mode==='play');
  fl.style.width=(fr*100)+'%'; const col=fr>0.5?'#35c46b':fr>0.25?'#ffb020':'#ff3b30'; fl.style.background=col; fl.style.color=col;
  const c=game.controlled, h=ball.holder;
  const showMeter=game.mode==='play'&&c&&c.shooting&&h===c;
  $('meter').style.display=showMeter?'block':'none';
  if(showMeter){ $('mf').style.left=(clamp(c.shootT/AIR,0,1)*100)+'%';
    // zelena zona = stvarni prozor savršenog šuta (±9 % × win; trice još × win3), pri 1 isto kao u CSS-u
    const w=Math.min(4,c.st.win*(c.st.win3&&isThree(c.pos.x,c.pos.z)?c.st.win3:1)), mz=$('mz'); mz.style.left=(50-9*w)+'%'; mz.style.width=(18*w)+'%'; }
  $('hint').style.display=(game.mode==='play'&&ball.state==='held'&&c&&h.team===c.team&&game.needsClear[h.team])?'block':'none';
  if(isTouch&&c){
    setBtn($('bShoot'),h===c?'shoot':'jump',T(h===c?'gumb.sut':'gumb.skok'));
    setBtn($('bPass'),h===c?'pass':game.naredbe?'cmd':'swap',T(h===c?'gumb.dodaj':game.naredbe?'gumb.naredba':'gumb.igrac'));
    setBtn($('bSteal'),h===c?'drib':'steal',T(h===c?'gumb.dribling':'gumb.kradi'));
    $('bPass').querySelector('.hold circle').style.strokeDashoffset=c.passHolding?302*(1-Math.min(1,c.passHold/0.3)):c.cmdHolding?302*(1-Math.min(1,c.cmdHold/0.35)):302;
    $('bPass').classList.toggle('off',game.solo);
    $('bSteal').classList.toggle('off',!(h&&(h.team!==c.team||(h===c&&c.moveCd<=0&&!c.shooting&&!c.dunking))));
  }
  if(msgT>0){ msgT-=dt; if(msgT<=0) $('msg').classList.remove('show'); }
  if(fbT>0){ fbT-=dt; if(fbT<=0) $('fb').style.opacity=0; }
}
