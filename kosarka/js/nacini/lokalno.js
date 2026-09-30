// ===== Košarka 2 na 2 - način: lokalno 2 na 2 (lobby "pritisni za pridruživanje") =====
'use strict';
// ---------- lokalni 2 na 2: lobby "pritisni za pridruživanje" ----------
// joined: [{src,team,lx}] — redom pridruživanja; slobodna mjesta igra računalo
const LOC={open:false,joined:[]};
function openLocal(){ audio(); LOC.open=true; LOC.joined=[]; ['menu','over','pauseOv','tOver','tourOv','mpOv'].forEach(id=>$(id).classList.add('hidden')); $('locOv').classList.remove('hidden'); renderLoc(); }
function closeLocal(){ LOC.open=false; $('locOv').classList.add('hidden'); }
function renderLoc(){
  const tc=t=>LOC.joined.filter(j=>j.team===t);
  $('locTeams').innerHTML=[0,1].map(t=>{ const arr=tc(t);
    return `<div class="lt ${t?'red':'blue'}"><b>${T(t?'opce.crveni':'opce.plavi')}</b>${[0,1].map(i=>{ const j=arr[i], tag=players[t*2+i].info.tag;
      return `<div class="ls${j?' on':''}"><span>${tag}</span>${j?SRC_NAME[j.src]:T('opce.racunalo')}</div>`; }).join('')}</div>`; }).join('');
  $('locGo').disabled=!LOC.joined.length;
  $('locMsg').textContent=LOC.joined.length?T(LOC.joined.length===1?'lokalno.igrac1':'lokalno.igraca',{n:LOC.joined.length}):T('lokalno.pritisni');
}
function locTick(){ if(!LOC.open) return; let ch=false;
  const srcs=['k1','k2']; PADS.forEach((p,i)=>{ if(p&&p.on) srcs.push('g'+i); });
  // odspojeni kontroler izlazi iz lobbyja
  const before=LOC.joined.length; LOC.joined=LOC.joined.filter(j=>srcs.includes(j.src)); if(LOC.joined.length!==before) ch=true;
  const cnt=t=>LOC.joined.filter(j=>j.team===t).length;
  for(const s of srcs){ const I=srcIn(s), j=LOC.joined.find(q=>q.src===s), pad=s[0]==='g'?PADS[+s.slice(1)]:null;
    if(!j){ if((I.sd||I.pd)&&LOC.joined.length<4){ LOC.joined.push({src:s,team:cnt(0)<=cnt(1)?0:1,lx:0}); ch=true; } continue; }
    const dir=I.x<-0.6?-1:I.x>0.6?1:0;
    if(dir&&dir!==j.lx){ const t=dir<0?0:1; if(t!==j.team&&cnt(t)<2){ j.team=t; ch=true; } }
    j.lx=dir;
    if(I.st||(pad&&pad.back)){ LOC.joined.splice(LOC.joined.indexOf(j),1); ch=true; }
    else if(pad&&pad.start){ locStart(); return; } }
  if(ch) renderLoc(); }
function locStart(){ if(!LOC.open||!LOC.joined.length) return;
  const byTeam=[[],[]]; LOC.joined.forEach(j=>byTeam[j.team].push(j));
  game.humans=new Map(); game.localMain=null; game.ctrlIn=null;
  byTeam.forEach((arr,t)=>arr.forEach((j,i)=>{ const p=teams[t][i], src=j.src;
    if(!game.localMain){ game.localMain=p; game.ctrlIn=()=>srcIn(src); } else game.humans.set(p,()=>srcIn(src)); }));
  game.local=true; closeLocal(); startGame();
  const side=t=>teams[t].map(p=>isHuman(p)?p.info.tag:'AI').join(' + ');
  flash(T('lokalno.naslovIgre'),side(0)+T('opce.protiv')+side(1),1.8); }
function endLocal(){ game.local=false; game.humans=new Map(); game.localMain=null; game.ctrlIn=null; }

$('localBtn').onclick=openLocal; $('locGo').onclick=locStart; $('locBack').onclick=()=>{ closeLocal(); $('menu').classList.remove('hidden'); };
