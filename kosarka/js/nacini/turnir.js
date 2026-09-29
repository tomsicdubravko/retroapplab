// ===== Košarka 2 na 2 - način: ulični turnir, statistika i Street Rep, rivali =====
'use strict';
// ---------- TURNIR ----------

const TOUR=[
  {name:'Četvrtfinale',venue:0,place:'Dnevni teren uz more',team:'Ekipa s Placa',diff:0,target:11,col:{j:0x1f9d55,s:0x14301e,css:'#1f9d55'},pl:[{name:'ANA',she:true,arch:'shooter',pers:'sniper',role:'Šuterica',skin:0xf1c9a5,hairCol:'#6b3e1e',nick:'Snajperica s Placa',line:'Ne promašujem dvaput.'},{name:'MIRO',arch:'power',pers:'showman',role:'Zakucavač',skin:0x8d5524,hairCol:'#1d6b3a',nick:'Kralj rive',line:'Obruč je moj.'}]},
  {name:'Polufinale',venue:1,place:'Teren pod mostom',team:'Lučki Vukovi',diff:1,target:15,col:{j:0x7b3fe4,s:0x24173d,css:'#7b3fe4'},pl:[{name:'NIKA',she:true,arch:'speed',pers:'streetballer',role:'Brza driblerka',skin:0xc68642,hairCol:'#2a1a12',nick:'Munja ispod mosta',line:'Nisi me ni vidio.'},{name:'TONI',arch:'defense',pers:'defender',role:'Obrambeni',skin:0xe0ac69,hairCol:'#3a2e8a',nick:'Zid ispod mosta',line:'Ovuda se ne prolazi.'}]},
  {name:'Finale',venue:2,place:'Noćni teren na krovu',team:'Kraljevi Grada',diff:2,target:21,col:{j:0xd62b24,s:0x221416,css:'#ef3b2f'},pl:[{name:'SARA',she:true,arch:'shooter',pers:'sniper',role:'Šuterica',skin:0xe8b98a,hairCol:'#1a1210',nick:'Hladna ruka',line:'Hladno. Kao uvijek.'},{name:'KAI',arch:'defense',pers:'defender',role:'Obrambeni',skin:0xb07a4f,hairCol:'#b3221b',nick:'Kralj krova',line:'Ovo je MOJ krov.'}]}];
const tour={active:false,round:0,menuDiff:1};
function applyOpponent(R){
  COLS[1].css=R.col.css;
  teams[1].forEach((p,i)=>Utakmica.obuci(p,R.pl[i],R.col));
}
// igrač iz TOUR → opis za Utakmica.pokreni
const opisIgraca=(P,covjek)=>({ime:P.name,arhetip:P.arch,osobnost:P.pers,uloga:P.role,koza:P.skin,kosa:P.hairCol,zensko:!!P.she,nadimak:P.nick,recenica:P.line,covjek});
// naša ekipa (JAY vodi čovjek, DRE računalo; kontrola se prebacuje kao i uvijek)
const mojaEkipa=()=>[{ime:'JAY',arhetip:'brzi',osobnost:'streetballer',covjek:true},{ime:'DRE',arhetip:'zakucavac',osobnost:'slasher',covjek:false}];
// ---------- statistika utakmice (player card) i Street Rep ----------
// ast: asistencija = dodavanje nakon kojeg primač zabije u roku od 4 s
const newStats=()=>({pts:0,fgm:0,fga:0,tpm:0,tpa:0,dunks:0,stl:0,blk:0,ab:0,ast:0});
function resetStats(){ players.forEach(p=>p.stats=newStats()); }
function stat(p,k,n){ if(!p||game.solo) return; if(!p.stats) p.stats=newStats(); p.stats[k]+=n==null?1:n; }
// Street Rep se sprema u profil (Profil.rep)
function loadRep(){ return +Profil.ucitaj().rep||0; }
function saveRep(v){ Profil.ucitaj().rep=v; Profil.spremi(); }
// ukupni REP potreban za razinu L: 0, 150, 450, 900, 1500, 2250…
const repFor=L=>75*L*(L-1);
function repLevel(r){ let L=1; while(r>=repFor(L+1)) L++; return L; }
// REP iz utakmice: doprinos obojice naših igrača + bonus za pobjedu (veći u kasnijim kolima)
function matchRep(win,round){ let r=0;
  for(const p of teams[0]){ const s=p.stats||newStats(); r+=s.pts*3+s.tpm*4+s.dunks*8+s.stl*6+s.blk*6+s.ab*15; }
  return r+(win?60+round*40:15); }
function playerCard(p,mvp){ const s=p.stats||newStats(), c=document.createElement('div'); c.className='pcard'+(mvp?' mvp':'');
  const rows=[['PTS',s.pts,'pts'],['3PT',s.tpm+'/'+s.tpa],['DUNKS',s.dunks,s.dunks?'hi':''],['STEALS',s.stl],['BLOCKS',s.blk],['ANKLE BREAKERS',s.ab,s.ab?'hi':'']];
  c.innerHTML=`<div class="ph"></div><dl>${rows.map(([k,v,cl])=>`<dt class="${cl||''}">${k}</dt><dd class="${cl||''}">${v}</dd>`).join('')}</dl>`;
  const cv=document.createElement('canvas'); cv.width=120; cv.height=88; drawAvatar(cv,p.info,p.team); c.firstChild.appendChild(cv);
  c.firstChild.insertAdjacentHTML('beforeend',`<div><div class="nm">${p.info.name}${mvp?' ⭐':''}</div><div class="rl">${mvp?'MVP · ':''}${p.info.role}</div></div>`);
  return c; }
function renderCards(el){ el.innerHTML='';
  const val=q=>{ const s=q.stats||newStats(); return s.pts*2+s.stl*3+s.blk*3+s.ab*4+s.dunks*2; };
  const [a,b]=teams[0], m=val(a)>=val(b)?a:b; for(const p of teams[0]) el.appendChild(playerCard(p,p===m)); }
// res: {before,after,gain,tourFrom} — bez res samo prikaže trenutnu razinu
function renderRep(el,res){
  const after=res?res.after:loadRep(), before=res?res.before:after, L0=repLevel(before), L=repLevel(after);
  const lo=repFor(L), hi=repFor(L+1), pct=(after-lo)/(hi-lo)*100, pct0=L>L0?0:(before-lo)/(hi-lo)*100;
  el.innerHTML=(res?`<div class="gain">REP +${res.gain}</div>`:'')+
    `<div class="lv">STREET REP · LEVEL ${L}<small>${after} / ${hi}</small></div><div class="bar"><i></i></div>`+
    (res&&res.tourFrom!=null?`<div class="up">TURNIR: LEVEL ${repLevel(res.tourFrom)} → LEVEL ${L}</div>`:L>L0?`<div class="up">LEVEL ${L0} → LEVEL ${L}</div>`:'');
  const bar=el.querySelector('.bar i'); bar.style.transition='none'; bar.style.width=pct0+'%'; void bar.offsetWidth; bar.style.transition=''; bar.style.width=pct+'%'; }
// ---------- RIVALI: protivnik koji te pobijedi pamti te ----------
// {IME:{w,l,active}} — active dok ga ne pobijediš; tada jača obrana, provokacije i poseban intro
// rivali se spremaju u profil (Profil.rivali); load vraća kopiju, promjene vrijede tek nakon saveRivals
function loadRivals(){ return JSON.parse(JSON.stringify(Profil.ucitaj().rivali||{})); }
function saveRivals(r){ Profil.ucitaj().rivali=r; Profil.spremi(); }
function roundRival(R){ const rv=loadRivals(); return R.pl.find(P=>rv[P.name]&&rv[P.name].active)||null; }
const TAUNTS=['Opet ti?','Pamtim te.','Premalo, prekasno.','Idi kući.','Nisi spreman.','Ajde, pokaži nešto.'];
let tauntT=0, tauntP=null;
function taunt(p,text){ if(!p||!p.rival||game.mp) return;
  const el=$('taunt'); el.textContent=text||(Math.random()<0.35?p.rival.line:TAUNTS[(Math.random()*TAUNTS.length)|0]);
  tauntP=p; tauntT=1.9; el.classList.add('show'); }
function updateTaunt(dt){ if(tauntT<=0) return; tauntT-=dt; const el=$('taunt');
  if(tauntT<=0||game.mode==='menu'||game.mode==='over'){ tauntT=0; el.classList.remove('show'); return; }
  _p.set(tauntP.pos.x,tauntP.y+3.0,tauntP.pos.z).project(camera);
  el.style.left=((_p.x+1)/2*innerWidth)+'px'; el.style.top=((1-_p.y)/2*innerHeight)+'px'; }
// rival: jača obrana (def/stl/blk ×1.2) i oznaka na kartici igrača
function applyRivals(R){ const rv=loadRivals();
  teams[1].forEach((p,i)=>{ const P=R.pl[i], e=rv[P.name]; p.rival=null; if(!e||!e.active) return;
    p.rival={nick:P.nick,line:P.line,l:e.l};
    const s=Object.assign({},ARCH[P.arch]); s.def*=1.2; s.stl*=1.2; s.blk*=1.2; p.st=s;
    cardEls[players.indexOf(p)].querySelector('u').textContent='⚔ Rival'; }); }
function rivalBanner(r){ if(!r) return '';
  const p=r.p, cv=document.createElement('canvas'); cv.width=120; cv.height=88; drawAvatar(cv,p.info,1);
  const d=document.createElement('div'); d.className='rvb'+(r.beat?' win':'');
  d.innerHTML=r.beat?`<div><b>RIVAL DEFEATED</b><small>${p.info.name} · „${r.nick}“ · +75 REP</small></div>`
    :`<div><b>${p.info.name} REMEMBERS YOU.</b><small>„${r.nick}“ · ${r.l>1?`pobijedio te ${r.l}×`:'sljedeći put igra jaču obranu'}</small></div>`;
  d.prepend(cv); return d; }
function openTour(title,sub,cls,res){
  $('tourHead').className=cls||''; $('tourHead').innerHTML=`<div class="tt">${title||'🏆 Ulični turnir'}</div><div class="ts">${sub||'Tri utakmice, tri terena, sve jači protivnici. Izgubiš li, igraš to kolo ponovno.'}</div>`;
  const tc=$('tourCards'); if(res) renderCards(tc); else tc.innerHTML='';
  const rb=$('rivalBox'); rb.innerHTML=''; if(res&&res.rival) rb.appendChild(rivalBanner(res.rival));
  $('tourBracket').innerHTML=TOUR.map((R,i)=>{ const done=i<tour.round, cur=i===tour.round, rp=roundRival(R);
    return `<div class="trow${cur?' cur':''}${i>tour.round?' lock':''}"><span class="st">${done?'✅':cur?'▶':'🔒'}</span><span class="sw" style="background:${R.col.css}"></span>
      <span><b>${R.name}: ${R.team}</b><small>${rp?`<em class="rv">⚔ Rival: ${rp.name}</em> · `:''}${R.place} · ${['lako','normalno','teško'][R.diff]}<br>${R.pl.map(P=>`${P.name} <em class="pz">${PERS[P.pers].label}</em>`).join(' · ')}</small></span><span class="to">do ${R.target}</span></div>`; }).join('');
  $('tourPlay').textContent=tour.round>=TOUR.length?'Novi turnir':`Igraj ${TOUR[tour.round].name.toLowerCase()}`;
  ['menu','over','pauseOv','tOver'].forEach(id=>$(id).classList.add('hidden')); $('tourOv').classList.remove('hidden'); $('touch').style.display='none';
  renderRep($('repBox'),res);
}
function startTour(){ if(!tour.active){ tour.menuDiff=game.diffIdx; tour.menuTarget=game.target; } tour.active=true; tour.round=0; tour.repStart=loadRep(); openTour(); }
function playRound(){
  const R=TOUR[tour.round];
  Utakmica.pokreni({plavi:mojaEkipa(), crveni:R.pl.map(P=>opisIgraca(P,false)), boje:{crveni:R.col},
    teren:['dan','most','krov'][R.venue], doBodova:R.target, tezina:R.diff, kolo:tour.round,
    pripremi:()=>{ applyRivals(R); $('tourOv').classList.add('hidden'); },
    uvod:()=>{ flash(R.place.toUpperCase(),`${R.name} protiv ekipe ${R.team}`,1.6);
      // poseban intro: kamera na rivala, natpis i prva provokacija
      const rp=teams[1].find(p=>p.rival);
      if(rp) setTimeout(()=>{ if(!tour.active||game.mode==='menu'||game.mode==='over') return;
        hype('RIVAL: '+rp.info.name,`„${rp.rival.nick}“ · ${rp.rival.l>1?`pobijedio te ${rp.rival.l}×`:'pamti te'}`,'rival',{dur:2.2,shake:0.2,punch:0.4,edge:1,focus:players.indexOf(rp),wob:1});
        sfx.ooh(); crowd('lean',1.6); taunt(rp,rp.rival.line); },1800); },
    kraj:krajKola});
}
// kraj turnirskog kola: rival, REP (+150 za osvojen turnir, +75 za pobijeđenog rivala), sljedeće kolo
function krajKola(r){ const win=r.pobjeda, sc=r.bodovi[0]+' : '+r.bodovi[1];
  // rival: pobjeda nad njim ga skida; poraz → najbolji protivnik te zapamti
  const rv=loadRivals(); let rival=null;
  if(win){ const rp=teams[1].find(p=>p.rival); if(rp){ const e=rv[rp.info.name]||(rv[rp.info.name]={w:0,l:0}); e.active=false; e.w=(e.w||0)+1; rival={p:rp,beat:true,nick:rp.rival.nick}; } }
  else { const val=q=>{ const s=q.stats||newStats(); return s.pts*2+s.stl*3+s.blk*3+s.ab*4+s.dunks*2; };
    const [a,b]=teams[1], top=a.rival?a:b.rival?b:val(a)>=val(b)?a:b, P=TOUR[tour.round].pl[teams[1].indexOf(top)];
    const e=rv[top.info.name]||{w:0,l:0}; e.l++; e.active=true; rv[top.info.name]=e; rival={p:top,beat:false,nick:P.nick,l:e.l}; }
  saveRivals(rv);
  const champ=win&&tour.round===TOUR.length-1, before=loadRep(), gain=r.rep+(champ?150:0)+(rival&&rival.beat?75:0);
  saveRep(before+gain); const res={before,after:before+gain,gain,rival,tourFrom:champ&&tour.repStart!=null?tour.repStart:null};
  if(win){ tour.round++; crowd('jump',3); sfx.cheer();
    if(tour.round>=TOUR.length){ for(let k=0;k<4;k++) setTimeout(()=>burst(rand(-4,4),rand(3,6),rand(3,8),60,6,[0xffd23f,0xffffff,0x2f6bff,0xef3b2f,0x35c46b]),k*350);
      openTour('🏆 Prvaci grada!',`Finale dobiveno ${sc}. Osvojio si ulični turnir!`,'win',res); }
    else openTour(`Pobjeda ${sc}`,`Sljedeće: ${TOUR[tour.round].name} protiv ekipe ${TOUR[tour.round].team}`,'win',res); }
  else { sfx.buzzer(); openTour(`Poraz ${sc}`,`Pokušaj ponovno: ${TOUR[tour.round].name}`,'lose',res); }
}
function resetLook(){ applyOpponent(TOUR[2]); setVenue(2); }
$('tourBtn').onclick=()=>{ audio(); startTour(); };
$('tourPlay').onclick=()=>{ if(tour.round>=TOUR.length){ tour.round=0; tour.repStart=loadRep(); openTour(); return; } playRound(); };
$('tourMenu').onclick=()=>{ $('tourOv').classList.add('hidden'); toMenu(); };
