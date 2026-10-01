// ===== KVART KINGS - trgovina: paketi naljepnica, naljepnice i razine botova, otvaranje paketa, dnevna naljepnica =====
'use strict';
// Podaci (cijene, šanse, koraci razina) su u botovi.js; stanje u profilu: botovi[id].naljepnice (napredak do sljedećeg
// koraka), botovi[id].razina, trgovina.{otvoreno, poklon, dnevna}. Ekrane trgovine i albuma crta karijera.js.
// Trgovina.kupi(vrsta) / otvoriPoklon(vrsta) / uzmiDnevnu() → rezultat {vrsta, zajamceno, karte:[{bot, novi, razina, novcici}]}
//   ili null (premalo novčića / nema poklona / dnevna je već uzeta); Trgovina.prikazi(rezultat, gotovo) otvara karte.
const Trgovina=(()=>{
  const RIJETKOSTI=['obicni','rijetki','epski','legendarni'];
  const prof=()=>Profil.ucitaj();
  const stanje=id=>prof().botovi[id]||(prof().botovi[id]={otkljucan:false,naljepnice:0,razina:1});
  const danas=()=>{ const d=new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); };

  // ---------- naljepnice i razine ----------
  // koliko naljepnica treba za sljedeći korak (otključavanje ili iduća razina); null = bot je na najvišoj razini
  function korak(id){ const s=stanje(id); if(!s.otkljucan) return BOT_NALJEPNICE_KORAK[0];
    return s.razina>=BOT_MAX_RAZINA?null:BOT_NALJEPNICE_KORAK[s.razina]; }
  function napredak(id){ const s=stanje(id); return {ima:s.naljepnice, treba:korak(id), otkljucan:s.otkljucan, razina:s.razina}; }
  // jedna naljepnica botu: napredak, otključavanje ili nova razina; na najvišoj razini postaje novčići
  function dodaj(id){ const s=stanje(id), d={novi:false,razina:0,novcici:0};
    if(s.otkljucan&&s.razina>=BOT_MAX_RAZINA){ prof().novcici+=NALJEPNICA_U_NOVCICE; d.novcici=NALJEPNICA_U_NOVCICE; return d; }
    s.naljepnice++; const k=korak(id);
    if(s.naljepnice>=k){ s.naljepnice-=k;
      if(!s.otkljucan){ s.otkljucan=true; s.razina=1; d.novi=true; } else { s.razina++; d.razina=s.razina; }
      if(s.razina>=BOT_MAX_RAZINA) s.naljepnice=0; }
    return d; }

  // ---------- izvlačenje ----------
  function izvuciRijetkost(sanse,rnd){ let r=rnd(), c=0; for(const k of RIJETKOSTI){ c+=sanse[k]; if(r<c) return k; } return 'obicni'; }
  // bot unutar rijetkosti; još neotključani ispadaju češće (PAKET_NOVI_BOT_BONUS)
  function izvuciBota(rij,rnd){ const kand=BOTOVI.filter(b=>b.rijetkost===rij), w=kand.map(b=>stanje(b.id).otkljucan?1:PAKET_NOVI_BOT_BONUS);
    let r=rnd()*w.reduce((a,x)=>a+x,0); for(let i=0;i<kand.length;i++){ r-=w[i]; if(r<0) return kand[i]; } return kand[kand.length-1]; }
  // karte jednog paketa; zajamčeno: ako nema epske ili bolje, zadnja karta postaje epska
  function izvuci(vrsta,zajamceno,rnd){ rnd=rnd||Math.random; const P=PAKETI[vrsta], r=[];
    for(let i=0;i<P.naljepnica;i++) r.push(izvuciRijetkost(P.sanse,rnd));
    if(zajamceno&&!r.some(x=>x==='epski'||x==='legendarni')) r[r.length-1]='epski';
    return r.map(x=>izvuciBota(x,rnd)); }
  function otvoriPaket(vrsta){ const t=prof().trgovina; t.otvoreno++;
    const zajamceno=t.otvoreno%PAKET_ZAJAMCENO_SVAKI===0;
    const karte=izvuci(vrsta,zajamceno).map(b=>Object.assign({bot:b},dodaj(b.id)));
    Profil.spremi(); return {vrsta,zajamceno,karte}; }

  // ---------- kupnja, pokloni, dnevna naljepnica ----------
  function kupi(vrsta){ const p=prof(), P=PAKETI[vrsta]; if(!P||p.novcici<P.cijena) return null; p.novcici-=P.cijena; return otvoriPaket(vrsta); }
  function otvoriPoklon(vrsta){ const t=prof().trgovina; if(!(t.poklon[vrsta]>0)) return null; t.poklon[vrsta]--; return otvoriPaket(vrsta); }
  const dnevnaDostupna=()=>prof().trgovina.dnevna!==danas();
  function uzmiDnevnu(){ if(!dnevnaDostupna()) return null; prof().trgovina.dnevna=danas();
    const b=izvuciBota(izvuciRijetkost(PAKETI[DNEVNA_NALJEPNICA].sanse,Math.random),Math.random);
    const rez={vrsta:'dnevna',zajamceno:false,karte:[Object.assign({bot:b},dodaj(b.id))]}; Profil.spremi(); return rez; }
  // koliko paketa do zajamčene epske (1 = sljedeći paket)
  const doZajamcene=()=>PAKET_ZAJAMCENO_SVAKI-prof().trgovina.otvoreno%PAKET_ZAJAMCENO_SVAKI;

  // ---------- otvaranje: karte izlete jedna po jedna, okreću se na dodir ----------
  const ov=document.createElement('div'); ov.id='paketOv'; ov.className='hidden';
  ov.innerHTML='<div class="pk-naslov bb"></div><div class="pk-karte"></div><div class="pk-sazetak"></div><button class="big pk-dalje hidden"></button><div class="pk-bljesak"></div>';
  document.body.appendChild(ov);
  const kar=ov.querySelector('.pk-karte'), saz=ov.querySelector('.pk-sazetak'), dalje=ov.querySelector('.pk-dalje');
  let tekuci=null, kraj=null;
  function prikazi(rez,gotovo){ tekuci=rez; kraj=gotovo;
    ov.querySelector('.pk-naslov').textContent=T(rez.vrsta==='dnevna'?'paket.naslovDnevna':'paket.naslov.'+rez.vrsta);
    saz.innerHTML=`<small>${T('paket.dodir')}</small>`; dalje.classList.add('hidden'); dalje.textContent=T('opce.nastavi');
    kar.innerHTML=rez.karte.map((k,i)=>{ const R=BOT_RIJETKOSTI[k.bot.rijetkost];
      const oznaka=k.novi?T('paket.oznakaNovi'):k.razina?T('paket.oznakaRazina',{n:k.razina}):k.novcici?T('paket.oznakaNovcici',{n:k.novcici}):'+1';
      return `<div class="pk-k r-${k.bot.rijetkost}" style="--rc:${R.boja};--i:${i}" data-i="${i}"><div class="pk-in">
        <div class="pk-straga"><span>KK</span></div>
        <div class="pk-lice"><canvas width="120" height="88"></canvas><b>${k.bot.ime}</b><small>${R.ime} · ${BOT_TIPOVI[k.bot.tip].ime}</small><em>${oznaka}</em></div></div></div>`; }).join('');
    kar.querySelectorAll('.pk-k').forEach((el,i)=>{ const iz=rez.karte[i].bot.izgled; drawAvatar(el.querySelector('canvas'),{skin:iz.koza,hair:iz.frizura,hairCol:iz.kosa,num:''},0); });
    ov.classList.remove('hidden'); sfx.pass(); }
  // iskre za legendarnu kartu
  function iskre(el){ const r=el.getBoundingClientRect(), cx=r.left+r.width/2, cy=r.top+r.height/2;
    for(let i=0;i<26;i++){ const s=document.createElement('i'); s.className='pk-iskra'; const a=Math.random()*Math.PI*2, d=rand(70,190);
      s.style.left=cx+'px'; s.style.top=cy+'px'; s.style.setProperty('--dx',Math.cos(a)*d+'px'); s.style.setProperty('--dy',Math.sin(a)*d+'px');
      s.style.animationDelay=(Math.random()*0.15)+'s'; ov.appendChild(s); setTimeout(()=>s.remove(),1300); } }
  function okreni(el){ if(!el||el.classList.contains('okr')) return; el.classList.add('okr');
    const k=tekuci.karte[+el.dataset.i], rij=k.bot.rijetkost;
    if(rij==='legendarni'){ ov.classList.remove('blj'); void ov.offsetWidth; ov.classList.add('blj'); iskre(el);
      [523,659,784,1047].forEach((f,i)=>setTimeout(()=>tone(f,0.35,'triangle',0.08),i*90)); setTimeout(()=>sfx.cheer(),300); }
    else if(rij==='epski'){ tone(660,0.2,'triangle',0.07); setTimeout(()=>tone(990,0.25,'triangle',0.06),90); }
    else if(rij==='rijetki') tone(740,0.16,'triangle',0.06);
    else sfx.swish();
    if(!kar.querySelector('.pk-k:not(.okr)')) setTimeout(sazetak,500); }
  // pregled: "+3 DRE, +1 KIKI (NOVI BOT OTKLJUČAN!)"
  function sazetak(){ const po=new Map();
    for(const k of tekuci.karte){ const e=po.get(k.bot)||{n:0,novi:false,razina:0,novcici:0}; e.n++; e.novi=e.novi||k.novi; e.razina=Math.max(e.razina,k.razina); e.novcici+=k.novcici; po.set(k.bot,e); }
    saz.innerHTML=[...po].map(([b,e])=>`<span style="color:${BOT_RIJETKOSTI[b.rijetkost].boja}">${T('paket.plus',{n:e.n,ime:b.ime})}${e.novi?T('paket.noviBot'):''}${e.razina?T('paket.razina',{n:e.razina}):''}${e.novcici?T('paket.novcici',{n:e.novcici}):''}</span>`).join(', ');
    dalje.classList.remove('hidden'); }
  ov.addEventListener('click',e=>{ audio();
    if(e.target===dalje){ ov.classList.add('hidden'); const f=kraj; kraj=null; tekuci=null; if(f) f(); return; }
    const k=e.target.closest('.pk-k');
    // dodir na kartu okreće nju, dodir bilo gdje drugdje sljedeću neokrenutu
    okreni(k&&!k.classList.contains('okr')?k:kar.querySelector('.pk-k:not(.okr)')); });

  return {kupi, otvoriPoklon, uzmiDnevnu, dnevnaDostupna, doZajamcene, napredak, korak, prikazi, izvuci, dodaj};
})();
