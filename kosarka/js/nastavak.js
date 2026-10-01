// ===== KVART KINGS - nastavak igre: izvođenje iz auta, slobodno bacanje, skok za loptu, faul na šutu =====
'use strict';
// Pola terena, jedan koš. Vrijedi u 2 na 2, turniru, karijeri i multiplayeru (ne u solo treningu ni tricama).
// game.faza (dok traje, game.mode ostaje 'play'):
//   {vrsta:'uvod', tim, by, t}   izvođenje: by (igrač najbliži mjestu) stoji izvan terena i dodaje suigraču, obrana smije
//                                presjeći, faul na izvođaču = ponovno izvođenje, rok PRAVILA.uvodRok s
//   {vrsta:'ft', p, t}           slobodno bacanje: p šutira s linije (isti nišan i zelena zona, bez skoka), ostali uz reket
//   {vrsta:'skok', skakaci, t}   skok za loptu u krugu slobodnih bacanja (početak utakmice)
// Nakon izvođenja ekipa mora iznijeti loptu iza linije za 3 (game.needsClear), kao nakon obrambenog skoka.
const FT_Z=5.8;            // linija slobodnih bacanja (i središte kruga)
const PRAVILA={uvodRok:5}; // sekundi za izvođenje (razvojni panel prebacuje 5 ⇄ 3 za probu)
const LOPTA_SKOK_VY=7.3;   // brzina bacanja lopte kod skoka (vrh ~4.4 m)
const SKOK_PROZOR=1.7;     // pokazivač tajminga skoka: od bacanja do 1.7 s
const SKOK_ZELENO=0.07;    // ± s oko idealnog trenutka = zeleno polje pokazivača
// šansa da AI branič faulira šutera kad je uz njega (po šutu): Lako, Normalno, Teško; suigrač bot
const AI_FAUL=[0.04,0.07,0.11], AI_FAUL_SUIGRAC=0.05;

// tko upravlja (kao u setupCheck): online/lokalno/karijera imaju svog igrača, inače pref ili naš igrač najbliži lopti
function postaviKontrolu(pref){
  if(game.mp&&mpn.me) game.controlled=mpn.me;
  else if(game.local&&game.localMain) game.controlled=game.localMain;
  else if(game.naredbe) game.controlled=teams[0][0];
  else game.controlled=pref||teams[0].reduce((a,b)=>flat(b.pos,ball.pos)<flat(a.pos,ball.pos)?b:a); }
const prema=(p,x,z)=>{ p.face=Math.atan2(x-p.pos.x,z-p.pos.z); };   // okreni igrača prema točki

// ---------- faul na šutu ----------
// branič je iza šutera (s leđa): na suprotnoj strani od koša
function sLeda(o,s){ const hx=-s.pos.x, hz=HOOP_Z-s.pos.z, rx=o.pos.x-s.pos.x, rz=o.pos.z-s.pos.z, L=Math.hypot(hx,hz)*Math.hypot(rx,rz)||1;
  return (hx*rx+hz*rz)/L<-0.25; }
// krađa ili blok s leđa na igraču u pokretu šuta: 1 slobodno bacanje (šut se ne broji)
function faulNaSutu(o,s){ s.shooting=false; s.gather=false;
  flash(T('poruka.faulNaslov'),T('poruka.faulSlobodno',{ime:s.info.name}),1.3,'red'); sfx.whistle();
  deadBall(s.team,1.3,{vrsta:'ft',p:s}); }

// ---------- izvođenje ----------
// mjesto izvođenja izvan terena: 'kos' = osnovna linija ispod koša (pored table), inače gdje je lopta izašla
function mjestoUvoda(m){
  if(!m||m==='kos'){ const s=Math.random()<0.5?-1:1; return new V3(s*2.1,0,-0.45); }
  let x=m.x, z=m.z;
  if(z<-0.15){ z=-0.45; x=clamp(x,-7,7); if(Math.abs(x)<1.5) x=(x<0?-1:1)*1.5; }
  else if(z>14.1){ z=14.45; x=clamp(x,-7,7); }
  else { x=(x<0?-1:1)*7.95; z=clamp(z,0.8,13.6); }
  return new V3(x,0,z); }
function pocniUvod(team,mjesto){
  // izvodi bilo koji igrač ekipe: onaj koji je najbliže mjestu izvođenja
  const pos=mjestoUvoda(mjesto), by=teams[team].reduce((a,b)=>flat(b.pos,pos)<flat(a.pos,pos)?b:a), mate=mateOf(by);
  const unutra=new V3(-pos.x,0,7-pos.z).normalize(), bocno=new V3(-unutra.z,0,unutra.x);
  by.pos.copy(pos);
  mate.pos.copy(pos).addScaledVector(unutra,4).addScaledVector(bocno,rand(-1.5,1.5)); clampCourt(mate.pos);
  by.man.pos.copy(pos).addScaledVector(unutra,1.3); clampCourt(by.man.pos);
  const kK=new V3(-mate.pos.x,0,HOOP_Z-mate.pos.z).normalize(); mate.man.pos.copy(mate.pos).addScaledVector(kK,1.0); clampCourt(mate.man.pos);
  resetirajIgrace(team); by.izvan=true; prema(by,mate.pos.x,mate.pos.z);
  Object.assign(ball,{state:'held',holder:by,wasShot:false,lastTouchTeam:team,noPick:null,isAlley:false,dunk:false,alley:false,uvod:false,ft:false}); ball.vel.set(0,0,0);
  game.possession=team; game.needsClear=[false,false]; game.shotClock=SHOT_CLOCK;
  game.faza={vrsta:'uvod',tim:team,by,t:PRAVILA.uvodRok,cekaj:0};
  postaviKontrolu(team===0?by:null); game.mode='play';
  flash(T('poruka.izvodjenje'),T(team===0?'poruka.loptaPlavima':'poruka.loptaCrvenima'),1); }
// dodavanje iz auta: od sada sat napada teče, a ekipa mora iznijeti loptu iza linije za 3
function izvediUvod(p){ if(ball.holder!==p) return;
  doPass(p,mateOf(p)); ball.uvod=true; ball.izAuta=true;   // uvod: ne broji se aut dok ne uđe u teren; izAuta: do hvatanja
  game.needsClear[p.team]=true; game.shotClock=SHOT_CLOCK; p.izvan=false; p.ulaz=true; game.faza=null; }
// AI izvodi: čeka da se suigrač otvori, najkasnije ~1 s prije isteka roka
function aiUvod(p,dt,f){ const mate=mateOf(p); p.vel.set(0,0,0); prema(p,mate.pos.x,mate.pos.z); f.cekaj+=dt;
  // otvoren: branič primatelja nije na putu dodavanja ili je primatelj pobjegao od njega (branič izvođača ne smeta, lopta ide preko njega)
  const d=mate.man, ax=mate.pos.x-p.pos.x, az=mate.pos.z-p.pos.z, L2=ax*ax+az*az||1, u=clamp(((d.pos.x-p.pos.x)*ax+(d.pos.z-p.pos.z)*az)/L2,0,1);
  const odLinije=Math.hypot(p.pos.x+ax*u-d.pos.x,p.pos.z+az*u-d.pos.z), otvoren=flat(mate.pos,p.pos)>1.8&&(odLinije>0.8||flat(d.pos,mate.pos)>1.5);
  if(f.cekaj>0.7&&((otvoren&&Math.random()<dt*2.5)||f.t<1.1)) izvediUvod(p); }
// AI prima: trči lijevo-desno oko mjesta 3–4 m od izvođača da se otvori
function uvodCilj(p,dt,f){ const a=p.ai; a.uvodT=(a.uvodT||0)-dt; if(a.uvodT<=0){ a.uvodT=rand(1.1,1.7); a.uvodS=-(a.uvodS||1); }
  const b=f.by.pos, unutra=new V3(-b.x,0,7-b.z).normalize(), bocno=new V3(-unutra.z,0,unutra.x);
  return clampCourt(b.clone().addScaledVector(unutra,3.4).addScaledVector(bocno,2.2*a.uvodS)); }

// ---------- slobodno bacanje ----------
function pocniSlobodno(p){ const t=p.team, mate=mateOf(p), [d0,d1]=teams[1-t];
  // ostali uz rub reketa: obrana na mjestima bliže košu, suigrač šutera iza
  p.pos.set(0,0,FT_Z+0.2); mate.pos.set(-2.9,0,3.7); d0.pos.set(2.9,0,2.4); d1.pos.set(-2.9,0,2.4);
  resetirajIgrace(t); for(const q of players) prema(q,0,HOOP_Z);
  Object.assign(ball,{state:'held',holder:p,wasShot:false,lastTouchTeam:t,noPick:null,isAlley:false,dunk:false,alley:false,uvod:false,ft:false}); ball.vel.set(0,0,0);
  game.possession=t; game.needsClear=[false,false]; game.shotClock=SHOT_CLOCK;
  game.faza={vrsta:'ft',p,t:0};
  postaviKontrolu(t===0?p:null); game.mode='play';
  flash(T('poruka.slobodnoBacanje'),p.info.name,1.2); }
function pocniSutFT(p){ p.shooting=true; p.shootT=0; p.vel.set(0,0,0); }   // bez skoka: nišan teče, igrač stoji
// isti izračun kao šut (tajming je glavni), bez udaljenosti i braniča; pogodak = 1 bod
function releaseFT(p,q){ p.shooting=false; if(ball.holder!==p) return;
  if(isHuman(p)){ const f=p.shootT/AIR; if(q>=0.99) fbFor(p,T('fb.savrseno'),'#5fe08b'); else fbFor(p,T(f<0.5?'fb.rano':'fb.kasno'),'#ffb35c'); }
  const osnova=q>=0.99?0.88:q>=0.7?0.50:0.10+0.25*q;
  let prob=osnova*p.st.shot; if(p.team===1) prob*=D.aiShot; prob=clamp(prob,0.02,0.95);
  const make=Math.random()<prob, d=hoopDist(p.pos);
  const dir=new V3(-p.pos.x,0,HOOP_Z-p.pos.z).normalize(), p0=new V3(p.pos.x,2.45,p.pos.z).addScaledVector(dir,0.28);
  const ang=Math.random()*Math.PI*2, off=make?Math.random()*0.04:rand(0.2,0.36);
  const tgt=new V3(Math.cos(ang)*off,RIM_Y+0.02,HOOP_Z+Math.sin(ang)*off), tLet=0.82+d*0.07;
  ball.vel.copy(ballistic(p0,tgt,tLet)); ball.pos.copy(p0);
  Object.assign(ball,{state:'shot',holder:null,T:tLet,flightT:0,touchedRim:false,scored:false,shotTeam:p.team,shotValue:1,wasShot:true,noPick:p,lastTouchTeam:p.team,dunk:false,isAlley:false,rebAt:null,ft:true});
  p.relT=0.55; game.faza=null; game.shotClock=SHOT_CLOCK; }
// AI: kratko pričeka, pa šutira s istim šumom kao u igri (perf/bad po težini)
function aiSlobodno(p,f){ const Dx=p.team===1?D:MATE;
  if(!p.shooting&&f.t>1.0){ pocniSutFT(p); const r=Math.random(); p.ai.q=r<Dx.perf?1:r<Dx.perf+Dx.bad?rand(0,0.69):rand(0.7,0.98); p.ai.releaseAt=AIR*0.5; }
  else if(p.shooting&&p.shootT>=p.ai.releaseAt) releaseFT(p,p.ai.q); }

// ---------- skok za loptu (početak utakmice) ----------
// najbolji trenutak skoka: ruka na vrhu skoka dočeka loptu koja pada
function idealniSkok(p){ const v=JUMP_V*p.st.jump, ta=v/PG, ruka=2.55+1.3*v*v/(2*PG), v0=LOPTA_SKOK_VY;
  const t=(v0+Math.sqrt(Math.max(0,v0*v0-2*G*(ruka-1.7))))/G;   // lopta (od 1.7 m) pada kroz visinu ruke
  return t-ta; }
function pocniSkok(){ const a=teams[0][0], b=teams[1][0], ma=mateOf(a), mb=mateOf(b);
  // skakači jedan nasuprot drugome preko kruga (vidljivi iz kamere), suigrači izvan kruga na svojoj strani
  a.pos.set(-0.55,0,FT_Z); b.pos.set(0.55,0,FT_Z); ma.pos.set(-3.4,0,FT_Z+1.4); mb.pos.set(3.4,0,FT_Z+1.4);
  resetirajIgrace(0); prema(a,1,FT_Z); prema(b,-1,FT_Z); prema(ma,0,FT_Z); prema(mb,0,FT_Z);
  Object.assign(ball,{state:'toss',holder:null,wasShot:false,noPick:null,lastTouchTeam:0,isAlley:false,dunk:false,alley:false,uvod:false,ft:false,touchedRim:false,scored:false,flightT:0,rebAt:null});
  ball.pos.set(0,1.7,FT_Z); ball.vel.set(0,LOPTA_SKOK_VY,0);
  game.possession=-1; game.needsClear=[false,false]; game.shotClock=SHOT_CLOCK;
  // AI skače prema težini (rasipanje tajminga) i osobini skoka (visina skoka u jump())
  const plan=new Map(); for(const p of [a,b]) if(!isHuman(p)) plan.set(p,idealniSkok(p)+randn()*(p.team===1?[0.16,0.1,0.055][game.diffIdx]:0.1)/Math.max(0.8,p.st.jump));
  game.faza={vrsta:'skok',skakaci:[a,b],plan,skocili:new Set(),t:0};
  postaviKontrolu(a); game.mode='play';
  flash(T('poruka.skokZaLoptu'),T('poruka.skokPod'),1.6); }
function korakSkoka(dt,f){
  for(const [p,tt] of f.plan) if(f.t>=tt&&!f.skocili.has(p)){ f.skocili.add(p); jump(p,1); }
  ball.vel.y-=G*dt; ball.pos.addScaledVector(ball.vel,dt);
  if(ball.vel.y>=0) return;
  // lopta pada: uzima je viša ruka (2.55 m stojeći, više u skoku); nitko ne skoči → slučajno
  let w=null, best=-1;
  for(const p of f.skakaci){ const r=2.55+1.3*p.y; if(r>=ball.pos.y&&(r>best||(r===best&&Math.random()<0.5))){ best=r; w=p; } }
  if(!w&&ball.pos.y<2.4){ const [a,b]=f.skakaci; w=Math.random()<a.st.jump/(a.st.jump+b.st.jump)?a:b; }
  if(w) tipni(w); }
// pobjednik skoka odbija loptu suigraču
function tipni(w){ const mate=mateOf(w), tgt=new V3(mate.pos.x,1.35,mate.pos.z), tLet=0.55;
  ball.vel.copy(ballistic(ball.pos,tgt,tLet));
  Object.assign(ball,{state:'pass',holder:null,passTo:mate,passTeam:w.team,checked:new Set(),T:tLet,flightT:0,noPick:w,lastTouchTeam:w.team,wasShot:false,isAlley:false,dunk:false,passTgt:tgt.clone(),passDead:false});
  game.faza=null; sfx.pass();
  flash(T('poruka.skokDobio',{ime:w.info.name}),'',0.9,w.team?'red':'blue'); }

// ---------- korak tijekom faze ----------
// vraća true ako je korak potpuno obrađen (slobodno bacanje, skok); kod izvođenja igra teče normalno
function korakFaze(dt){ const f=game.faza;
  if(f.vrsta==='uvod'){ f.t-=dt;
    if(f.t<=0){ flash(T('poruka.petSekundi'),T('poruka.loptaProtivniku'),1.3); sfx.whistle(); deadBall(1-f.tim,1.2,{vrsta:'uvod',mjesto:'kos'}); return true; }
    return false; }
  f.t+=dt;
  updateUser(dt);
  if(f.vrsta==='ft'){ const p=f.p;
    if(!isHuman(p)) aiSlobodno(p,f);
    else if(p.shooting&&p.shootT>AIR*1.15) releaseFT(p,0.1);             // predugo držao
    else if(!p.shooting&&f.t>12){ pocniSutFT(p); p.shootT=AIR*0.9; }      // ne šutira: nišan sam krene
  } else if(f.vrsta==='skok') korakSkoka(dt,f);
  for(const p of players){ if(p.active===false) continue; if(p.y===0) p.vel.multiplyScalar(Math.exp(-10*dt)); physicsPlayer(p,dt); }
  if(ball.state==='held') updateBall(dt,true);
  return true; }
// čovjek tijekom faze: vraća true ako je ulaz potrošen (tada se ne igra normalno)
function fazaHuman(p,I,dt){ const f=game.faza;
  if(f.vrsta==='uvod'){ if(f.by!==p) return false; p.vel.set(0,0,0); if(I.pd||I.ad) izvediUvod(p); return true; }   // izvođač samo dodaje
  p.vel.multiplyScalar(Math.exp(-10*dt));
  if(f.vrsta==='ft'&&f.p===p){ if(I.sd&&!p.shooting) pocniSutFT(p); else if(I.su&&p.shooting) releaseFT(p,qualityFromT(p.shootT,p.st.win)); }
  if(f.vrsta==='skok'&&f.skakaci.includes(p)&&I.sd) jump(p,1);
  return true; }
// za HUD i online gosta: [vrsta, t, tim, indeks igrača]
const fazaOpis=()=>{ const f=game.faza; return f?[f.vrsta,Math.round(f.t*100)/100,f.tim!=null?f.tim:-1,players.indexOf(f.p||f.by||null)]:null; };
