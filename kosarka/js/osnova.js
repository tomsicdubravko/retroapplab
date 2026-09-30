// ===== Košarka 2 na 2 - osnova: pomoćne funkcije, konstante terena, težine, zvuk, stanje igre =====
'use strict';
const V3=THREE.Vector3;
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const rand=(a,b)=>a+Math.random()*(b-a);
const randn=()=>(Math.random()+Math.random()+Math.random()-1.5)*2;
const flat=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
const $=id=>document.getElementById(id);
primijeniTekstove();   // statični natpisi iz HTML-a (data-t…, tekstovi.js), prije nego ih ostale skripte diraju

// ---------- constants (meters) ----------
const PSCALE=1.14;
const G=9.8, PG=16, JUMP_V=4.4, AIR=2*JUMP_V/PG, SHOT_CLOCK=14, DUNK_AIR=0.8, DUNK_PEAK=0.9, GATHER=0.12;
const lerp=(a,b,t)=>a+(b-a)*t;
const RIM_Y=3.05, RIM_R=0.2286, BALL_R=0.12, BOARD_Z=1.2, HOOP_Z=BOARD_Z+0.15+RIM_R;
const THREE_R=6.75, CORNER_X=6.6, CORNER_Z=HOOP_Z+Math.sqrt(THREE_R*THREE_R-CORNER_X*CORNER_X);
const isThree=(x,z)=> z<CORNER_Z ? Math.abs(x)>CORNER_X : Math.hypot(x,z-HOOP_Z)>THREE_R;
const hoopDist=p=>Math.hypot(p.x,p.z-HOOP_Z);
function clampCourt(v){v.x=clamp(v.x,-7.1,7.1);v.z=clamp(v.z,0.7,13.4);return v;}

// perf/bad: šansa savršenog i lošeg AI šuta (ostalo je 'blizu zelenog'); podešeno da AI šutira kao prije promjene tajminga
const DIFFS=[
  {speed:.86,react:.8,steal:.13,jump:.3,block:.2,perf:.06,bad:.39,aiShot:.82},
  {speed:.96,react:.55,steal:.23,jump:.45,block:.3,perf:.11,bad:.36,aiShot:.95},
  {speed:1.04,react:.35,steal:.35,jump:.6,block:.4,perf:.16,bad:.33,aiShot:1.06}];
const MATE={speed:1,react:.45,steal:.2,jump:.5,block:.3,perf:.12,bad:.36,aiShot:1};
let D=DIFFS[1];

// ---------- sound ----------
let actx=null, muted=false;
function audio(){ if(!actx){ try{actx=new (window.AudioContext||window.webkitAudioContext)();}catch(e){} } if(actx&&actx.state==='suspended')actx.resume(); return actx; }
function tone(f,dur,type,vol,f2){ if(muted||!actx)return; const t=actx.currentTime,o=actx.createOscillator(),g=actx.createGain();
  o.type=type||'sine'; o.frequency.setValueAtTime(f,t); if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+dur);
  g.gain.setValueAtTime(vol,t); g.gain.exponentialRampToValueAtTime(0.0001,t+dur); o.connect(g).connect(actx.destination); o.start(t); o.stop(t+dur+0.02); }
function noise(dur,vol,freq){ if(muted||!actx)return; const t=actx.currentTime,n=actx.sampleRate*dur,b=actx.createBuffer(1,n,actx.sampleRate),d=b.getChannelData(0);
  for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*(1-i/n); const s=actx.createBufferSource(); s.buffer=b; const f=actx.createBiquadFilter(); f.type='bandpass'; f.frequency.value=freq; f.Q.value=0.8;
  const g=actx.createGain(); g.gain.value=vol; s.connect(f).connect(g).connect(actx.destination); s.start(t); }
const sfx={
  bounce:v=>tone(130,0.09,'sine',0.28*(v||1),55),
  dribble:()=>tone(110,0.07,'sine',0.14,50),
  rim:()=>{tone(620,0.14,'square',0.05,380);tone(930,0.1,'triangle',0.04);},
  board:()=>tone(200,0.1,'triangle',0.12,120),
  swish:()=>noise(0.28,0.35,2600),
  dunk:()=>{tone(150,0.25,'sawtooth',0.22,55);tone(680,0.18,'square',0.08,300);noise(0.3,0.3,1200);},
  whistle:()=>{tone(2300,0.22,'sine',0.07);tone(2450,0.22,'sine',0.05);},
  pass:()=>noise(0.08,0.12,900),
  cheer:()=>noise(1.1,0.18,700),
  impact:()=>{tone(90,0.45,'sine',0.4,32);tone(60,0.6,'triangle',0.25,28);noise(0.35,0.35,300);},
  ooh:()=>{tone(260,0.7,'sawtooth',0.035,180);tone(330,0.7,'sawtooth',0.03,220);noise(1.4,0.22,600);},
  stamp:()=>{tone(1400,0.08,'square',0.05,700);noise(0.12,0.2,2000);},
  buzzer:()=>tone(170,0.6,'sawtooth',0.07)
};


// ---------- game state ----------
// conns (domaćin): [{c,slot,gin}] — do 3 gosta, svaki upravlja igračem players[slot]; conn (gost): veza prema domaćinu
const mpn={peer:null,conn:null,conns:[],host:false,guest:false,code:'',mode:'coop',me:null,snap:null,lastSend:0,lastIn:'',overShown:false};
// humans: ostali ljudski igrači osim game.controlled → funkcija koja vraća njihov ulaz (online gost ili lokalni kontroler)
// local: više igrača na jednom uređaju (localMain je glavni igrač, ctrlIn njegov ulaz)
const game={mp:false,remote:false,local:false,humans:new Map(),localMain:null,ctrlIn:null,mode:'menu',paused:false,score:[0,0],possession:0,needsClear:[false,false],shotClock:SHOT_CLOCK,pauseT:0,nextCheck:0,target:21,diffIdx:1,controlled:null,naredbe:false,solo:false,soloMade:0,soloShots:0};


const sfx0={...sfx}; for(const k in sfx0) if(k!=='dribble') sfx[k]=(...a)=>{ sfx0[k](...a); if(mpn.host&&game.mp) netSend({t:'x',k,a}); };
