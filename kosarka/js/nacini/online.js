// ===== Košarka 2 na 2 - način: online multiplayer (PeerJS, domaćin + do 3 gosta) =====
'use strict';
// ======================= MULTIPLAYER (PeerJS, peer-to-peer) =======================
// Domaćin (host) vodi cijelu utakmicu i šalje stanje; gost šalje samo svoje kontrole.

// domaćin šalje svim gostima, gost domaćinu
function netSend(o){ try{ if(mpn.host){ for(const g of mpn.conns) if(g.c.open) g.c.send(o); } else if(mpn.conn&&mpn.conn.open) mpn.conn.send(o); }catch(e){} }
function sendTo(g,o){ try{ if(g.c.open) g.c.send(o); }catch(e){} }
// mjesta za goste po načinu igre (indeksi u players: 1=P2, 2=P3, 3=P4); domaćin je uvijek P1
const MP_SLOTS={coop:[1],vs:[2],team:[2,1,3]};
const MP_TITLE={coop:T('online.naslovCoop'),vs:T('online.naslovVs'),team:T('online.naslovTeam')};
const newGin=()=>({x:0,z:0,sprint:false,sd:false,su:false,pd:false,pu:false,ad:false,st:false});
function lobbyStatus(){ const slots=MP_SLOTS[mpn.mode], used=mpn.conns.map(g=>g.slot);
  mpStatus(mpn.conns.length?T('online.spojeni')+slots.map(s=>`${players[s].info.tag} ${used.includes(s)?'✅':'⏳'}`).join(' · ')+(used.length<slots.length?T('online.cekamJos'):''):T('online.posaljiKod'));
  $('mpGo').classList.toggle('hidden',!mpn.conns.length); }
function loadPeer(){ return new Promise((res,rej)=>{ if(window.Peer) return res();
  const srcs=['https://cdn.jsdelivr.net/npm/peerjs@1.5.4/dist/peerjs.min.js','https://cdnjs.cloudflare.com/ajax/libs/peerjs/1.5.4/peerjs.min.js']; let i=0;
  const next=()=>{ if(i>=srcs.length) return rej(new Error('load')); const sc=document.createElement('script'); sc.src=srcs[i++]; sc.onload=()=>window.Peer?res():next(); sc.onerror=next; document.head.appendChild(sc); }; next(); }); }
const PID=c=>'kosarka2na2-'+c;
function mkCode(){ const A='ABCDEFGHJKMNPQRSTUVWXYZ23456789'; let s=''; for(let i=0;i<4;i++) s+=A[Math.floor(Math.random()*A.length)]; return s; }
function mpStatus(t){ $('mpStatus').innerHTML=t; }
function mpReset(){ const c=mpn.conn, cs=mpn.conns, pr=mpn.peer; Object.assign(mpn,{peer:null,conn:null,conns:[],host:false,guest:false,code:'',snap:null,overShown:false,me:null});
  const wasMp=game.mp; game.mp=false; game.remote=false; if(wasMp||!game.local) game.humans=new Map();
  try{ c&&c.close(); }catch(e){} for(const g of cs){ try{ g.c.close(); }catch(e){} } try{ pr&&pr.destroy(); }catch(e){} $('againBtn').style.display='';
  $('segMp').querySelectorAll('button').forEach(b=>b.disabled=false); }
function openMP(){ mpReset(); audio(); ['menu','over','pauseOv','tOver','tourOv'].forEach(id=>$(id).classList.add('hidden')); $('mpOv').classList.remove('hidden');
  $('mpHost').classList.remove('hidden'); $('mpJoin').classList.remove('hidden'); $('mpGo').classList.add('hidden'); $('mpCodeBox').classList.add('hidden');
  mpStatus(T('online.uvod')); try{ const j=new URLSearchParams(location.search).get('join'); if(j) $('mpCodeIn').value=j.toUpperCase().slice(0,4); }catch(e){} }
async function hostGame(){ mpStatus(T('online.pripremam')); try{ await loadPeer(); }catch(e){ mpStatus(T('online.nemaPeer')); return; }
  mpn.host=true; mpn.code=mkCode(); mpn.peer=new Peer(PID(mpn.code),{debug:0});
  mpn.peer.on('open',()=>{ $('mpHost').classList.add('hidden'); $('mpJoin').classList.add('hidden'); $('mpCodeBox').classList.remove('hidden'); $('mpCode').textContent=mpn.code; lobbyStatus(); });
  // svaki gost dobiva prvo slobodno mjesto; igra u tijeku ili puna → odbij
  mpn.peer.on('connection',c=>{ const used=mpn.conns.map(g=>g.slot), free=MP_SLOTS[mpn.mode].find(s=>!used.includes(s));
    if(free==null||game.mp){ c.on('open',()=>{ try{ c.send({t:'full'}); }catch(e){} setTimeout(()=>{ try{ c.close(); }catch(e){} },400); }); return; }
    const g={c,slot:free,gin:newGin()}; mpn.conns.push(g);
    c.on('open',()=>{ lobbyStatus(); sendTo(g,{t:'hello',mode:mpn.mode,you:free}); });
    c.on('data',d=>onHostData(g,d)); c.on('close',()=>onGuestLeft(g)); });
  mpn.peer.on('error',onPeerErr); }
// gost je otišao: u lobbyju oslobodi mjesto, u igri njegov igrač prelazi na računalo
function onGuestLeft(g){ const i=mpn.conns.indexOf(g); if(i<0) return; mpn.conns.splice(i,1);
  if(!game.mp){ lobbyStatus(); return; }
  const p=players[g.slot]; game.humans.delete(p);
  if(!mpn.conns.length){ toMenu(); flash(T('online.vezaPrekinuta'),T('online.sviIzasli'),1.8); }
  else flash(T('online.izasao',{tag:p.info.tag}),T('online.racunaloPreuzima'),1.6); }
async function joinGame(){ const code=$('mpCodeIn').value.trim().toUpperCase(); if(code.length!==4){ mpStatus(T('online.upisiKod')); return; }
  mpStatus(T('online.spajam')); try{ await loadPeer(); }catch(e){ mpStatus(T('online.nemaPeer')); return; }
  mpn.guest=true; mpn.code=code; mpn.peer=new Peer(undefined,{debug:0});
  mpn.peer.on('open',()=>{ const c=mpn.peer.connect(PID(code),{serialization:'json'}); mpn.conn=c;
    c.on('open',()=>{ mpStatus(T('online.spojeno')); $('mpHost').classList.add('hidden'); $('mpJoin').classList.add('hidden'); });
    c.on('data',onGuestData); c.on('close',onDisc); });
  mpn.peer.on('error',onPeerErr); }
function onPeerErr(e){ const t=e&&e.type;
  mpStatus(t==='peer-unavailable'?T('online.nemaIgre'):t==='unavailable-id'?T('online.zauzet'):
    (t==='network'||t==='server-error'||t==='socket-error'||t==='socket-closed')?T('online.nemaServera'):T('online.greska',{t:t||T('online.nepoznato')})); }
function onDisc(){ const was=game.mp, inLobby=!$('mpOv').classList.contains('hidden'); if(!mpn.conn&&!was) return; mpReset();
  if(was){ toMenu(); flash(T('online.vezaPrekinuta'),T('online.prijateljIzasao'),1.8); } else if(inLobby) mpStatus(T('online.pokusajPonovno')); }
// tko igra s kim, npr. "P1 + P2 protiv P3 + AI"
const lineup=()=>teams.map(t=>t.map(p=>isHuman(p)?p.info.tag:'AI').join(' + ')).join(T('opce.protiv'));
function mpStart(){
  if(!mpn.host||!mpn.conns.length) return;
  endLocal(); mpn.me=teams[0][0]; mpn.overShown=false;
  game.humans=new Map(); for(const g of mpn.conns){ g.gin=newGin(); game.humans.set(players[g.slot],()=>takeGuestIn(g)); }
  $('mpOv').classList.add('hidden');
  game.mp=true; startGame(); game.mp=true;
  const lu=lineup();
  for(const g of mpn.conns) sendTo(g,{t:'start',mode:mpn.mode,you:g.slot,target:game.target,lineup:lu});
  flash(MP_TITLE[mpn.mode],T('online.tiSiP1',{sastav:lu}),1.8);
}
// domaćin: primanje kontrola pojedinog gosta
function onHostData(g,d){ if(!d||d.t!=='i') return; const n=g.gin; n.x=clamp(+d.a[0]||0,-1,1); n.z=clamp(+d.a[1]||0,-1,1); n.sprint=!!d.a[2];
  const e=d.e||[]; if(e[0]) n.sd=true; if(e[1]) n.su=true; if(e[2]) n.pd=true; if(e[3]) n.pu=true; if(e[4]) n.ad=true; if(e[5]) n.st=true; }
function takeGuestIn(g){ const n=g.gin, o={...n}; n.sd=n.su=n.pd=n.pu=n.ad=n.st=false; return o; }
const r2=v=>Math.round(v*100)/100, r3=v=>Math.round(v*1000)/1000;
function snapshot(){ return {t:'s',m:game.mode,sc:game.score,clk:r2(game.shotClock),nc:game.needsClear,ps:game.possession,fz:fazaOpis(),
  p:players.map(p=>[r3(p.pos.x),r3(p.pos.z),r3(p.y),r2(p.vel.x),r2(p.vel.z),(p.shooting?1:0)|(p.dunking?2:0)|(p.gather?4:0)|(p.dunkDone?8:0)|(p.passHolding?16:0),
    r3(p.shootT),r2(p.fakeT),r2(p.moveT),p.moveKind,r2(p.dribX),p.dribSide,r2(p.spinA),r2(p.fallT),p.fallMax,r2(p.beatT),r2(p.reachT),r2(p.stam),r2(p.passHold),r2(p.moveCd),p.fallZ,p.dunkKind]),
  b:[r3(ball.pos.x),r3(ball.pos.y),r3(ball.pos.z),ball.state,ball.holder?players.indexOf(ball.holder):-1,r2(ball.vel.x),r2(ball.vel.y),r2(ball.vel.z),ball.touchedRim?1:0,ball.scored?1:0],
  fx:[r2(Math.max(0,shake)),r2(Math.max(0,rimShake)),r2(Math.max(0,netAnim)),r2(Math.max(0,cheerT)),r2(Math.max(0,flashT)),r2(Math.max(0,rimFlash)),CROWD.indexOf(crowdK)]}; }
function hostSend(){ const now=performance.now(); if(now-mpn.lastSend>=50){ mpn.lastSend=now; netSend(snapshot()); } }
// gost
function onGuestData(d){ if(!d||!d.t) return;
  if(d.t==='start'){ game.mp=true; game.remote=true; mpn.overShown=false; setSolo(false);
    const me=players[d.you]; game.controlled=me; mpn.me=me;
    ['menu','over','pauseOv','tOver','tourOv','mpOv'].forEach(id=>$(id).classList.add('hidden')); $('againBtn').style.display='';
    if(isTouch) $('touch').style.display='block'; game.target=d.target; $('target').textContent=T('hud.do',{n:d.target}); game.mode='play';
    flash(MP_TITLE[d.mode]||T('online.multiplayer'),T('online.tiSi',{tag:me.info.tag,boja:T(me.team?'opce.crveniMalo':'opce.plaviMalo')})+(d.lineup?' · '+d.lineup:''),1.8); }
  else if(d.t==='hello'){ const me=players[d.you]; if(me) mpStatus(T('online.spojenoTiSi',{tag:me.info.tag,boja:T(me.team?'opce.crveniMalo':'opce.plaviMalo')})); }
  else if(d.t==='full') mpStatus(T('online.puna'));
  else if(d.t==='s') mpn.snap=d;
  else if(d.t==='f') flash(...d.a);
  else if(d.t==='fb') feedback(...d.a);
  else if(d.t==='h') hype(...d.a);
  else if(d.t==='x'&&sfx0[d.k]) sfx0[d.k](...(d.a||[]));
  else if(d.t==='bu') burst(...d.a);
}
function sendGuestInput(){ const I=localIn(); const ax=[r2(clamp(I.x,-1,1)),r2(clamp(I.z,-1,1)),I.sprint?1:0], e=[I.sd,I.su,I.pd,I.pu,I.ad,I.st].map(v=>v?1:0);
  const key=ax.join()+'|'+e.join(), now=performance.now();
  if(e.some(v=>v)||key!==mpn.lastIn||now-mpn.lastSend>120){ netSend({t:'i',a:ax,e}); mpn.lastIn=key; mpn.lastSend=now; } }
function remoteFrame(dt){
  const S=mpn.snap; if(!S) return;
  const k=1-Math.exp(-16*dt), kb=1-Math.exp(-24*dt);
  game.score=S.sc; game.shotClock=S.clk; game.needsClear=S.nc; game.possession=S.ps; game.mode=S.m;
  players.forEach((p,i)=>{ const a=S.p[i]; p.pos.x+=(a[0]-p.pos.x)*k; p.pos.z+=(a[1]-p.pos.z)*k; p.y=a[2]<0.02?0:p.y+(a[2]-p.y)*kb;   // na tlu odmah točno 0 (inače ostane npr. 0.0001 i lopta "lebdi") p.vel.set(a[3],0,a[4]);
    const f=a[5], wasD=p.dunking; p.shooting=!!(f&1); p.dunking=!!(f&2);
    // gost lokalno prati tijek zakucavanja (za animaciju reverse/one-hand)
    if(p.dunking&&!wasD){ p.dunkT=0; p.dunkKind=a[21]||'norm'; p.dunkFrom.copy(p.pos); dunkTarget(p); } else if(p.dunking&&!(f&8)) p.dunkT+=dt; p.gather=!!(f&4); p.dunkDone=!!(f&8); p.passHolding=!!(f&16);
    p.shootT=a[6]; p.fakeT=a[7]; p.moveT=a[8]; p.moveKind=a[9]; p.dribX=a[10]; p.dribSide=a[11]; p.spinA=a[12]; p.fallT=a[13]; p.fallMax=a[14]; p.beatT=a[15]; p.reachT=a[16]; p.stam=a[17]; p.passHold=a[18]; p.moveCd=a[19]; p.fallZ=a[20]||0; p.dunkKind=a[21]||'norm'; });
  const b=S.b; ball.state=b[3]; ball.holder=b[4]>=0?players[b[4]]:null; ball.touchedRim=!!b[8]; ball.scored=!!b[9];
  if(ball.state==='held'&&ball.holder) updateBall(dt,true);
  else { ball.pos.x+=(b[0]-ball.pos.x)*kb; ball.pos.y+=(b[1]-ball.pos.y)*kb; ball.pos.z+=(b[2]-ball.pos.z)*kb; ball.vel.set(b[5],b[6],b[7]); }
  const fx=S.fx; shake=Math.max(shake,fx[0]); rimShake=Math.max(rimShake,fx[1]); netAnim=Math.max(netAnim,fx[2]); if(fx[3]>0&&CROWD[fx[6]]) crowdK=CROWD[fx[6]]; cheerT=Math.max(cheerT,fx[3]); flashT=Math.max(flashT,fx[4]); rimFlash=Math.max(rimFlash,fx[5]);
  if(S.m==='over'&&!mpn.overShown){ mpn.overShown=true; const my=mpn.me.team, win=game.score[my]>game.score[1-my];
    $('overTitle').textContent=T(win?'opce.pobjeda':'opce.poraz'); $('overTitle').style.color=win?'var(--amber)':'var(--muted)';
    $('overScore').textContent=game.score[0]+' : '+game.score[1]; $('againBtn').style.display='none';
    $('over').classList.remove('hidden'); $('touch').style.display='none'; if(win) sfx0.cheer(); else sfx0.buzzer(); }
}
$('mpBtn').onclick=openMP;
$('mpHostBtn').onclick=hostGame; $('mpJoinBtn').onclick=joinGame; $('mpGo').onclick=mpStart;
$('mpBack').onclick=()=>{ mpReset(); $('mpOv').classList.add('hidden'); $('menu').classList.remove('hidden'); };
$('mpCodeIn').addEventListener('keydown',e=>{ if(e.key==='Enter') joinGame(); });

$('segMp').addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b||mpn.host) return; $('segMp').querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b)); mpn.mode=b.dataset.v; });
$('mpShare').onclick=async()=>{ const url=location.origin+location.pathname+'?join='+mpn.code, txt=T('online.poziv',{kod:mpn.code});
  try{ if(navigator.share){ await navigator.share({title:IME_IGRE,text:txt,url}); return; } }catch(e){ return; }
  try{ await navigator.clipboard.writeText(txt+' '+url); mpStatus(T('online.kopirano')); }catch(e){ mpStatus(T('online.posaljiKodRucno',{kod:mpn.code})); } };
