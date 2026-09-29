// ===== Košarka 2 na 2 - karijera: lige, protivnici, finale, turnir, trening trica, nagrade (sve u profilu) =====
'use strict';
const Karijera=(()=>{
  // ---------- lige i protivnici ----------
  const KOZE=[0x8d5524,0xc68642,0xe0ac69,0xf1c27d,0xffdbac,0x6b4423,0xb07a4f,0xe8b98a];
  const KOSE=['#15100c','#2a1a12','#6b3e1e','#3a2e1a','#1a1210','#8a5a2a','#b3221b','#d9b36c'];
  // igrač: ime, arhetip, osobnost, zensko (+ nadimak/recenica za šefa lige)
  const I=(ime,arh,osob,z,extra)=>Object.assign({ime,arhetip:arh,osobnost:osob,zensko:!!z},extra||{});
  const hex=c=>'#'+c.toString(16).padStart(6,'0'), tamnije=c=>((c>>16&255)*0.28<<16)|((c>>8&255)*0.28<<8)|((c&255)*0.28|0);
  const T=(tim,j,igraci)=>({tim,boja:{j,s:tamnije(j),css:hex(j)},igraci});
  const LIGE=[
    {id:'kvart',ime:'Kvart',razina:35,tezina:0,teren:'dan',parovi:[
      T('Dečki s Placa',0x1f9d55,[I('ŠIME','brzi','streetballer'),I('LUCIJA','suter','sniper',1)]),
      T('Klupa kod Konzuma',0xe0741c,[I('MATE','zakucavac','slasher'),I('NINA','brzi','streetballer',1)]),
      T('Blok B7',0x7d8597,[I('BORNA','obrambeni','defender'),I('IVA','suter','sniper',1)]),
      T('Mladi Lavovi',0xd4a017,[I('KREŠO','zakucavac','showman'),I('PETRA','obrambeni','defender',1)]),
      T('Park Brigada',0x2aa7a1,[I('LUKA','brzi','slasher'),I('EMA','suter','sniper',1)])],
      sef:T('Kraljevi Kvarta',0x8e2de2,[I('BRKO','zakucavac','showman',0,{nadimak:'Šerif kvarta',recenica:'Ovo je moj kvart.'}),I('ZARA','suter','sniper',1)])},
    {id:'grad',ime:'Grad',razina:50,tezina:1,teren:'most',parovi:[
      T('Tramvaj 13',0xf2c230,[I('FRANE','brzi','streetballer'),I('MIA','suter','sniper',1)]),
      T('Stari Grad',0xb5332e,[I('DUJE','zakucavac','slasher'),I('LANA','obrambeni','defender',1)]),
      T('Gradski Sokoli',0x2e8b57,[I('ROKO','obrambeni','defender'),I('TEA','brzi','streetballer',1)]),
      T('Noćna Smjena',0x444a5a,[I('VITO','suter','sniper'),I('KLARA','zakucavac','showman',1)]),
      T('Riva Crew',0xff7f50,[I('NOA','brzi','slasher'),I('MARTA','suter','sniper',1)])],
      sef:T('Gospodari Grada',0xc2185b,[I('DADO','brzi','streetballer',0,{nadimak:'Gradonačelnik terena',recenica:'U mom gradu ja dijelim lopte.'}),I('IRIS','obrambeni','defender',1)])},
    {id:'regija',ime:'Regija',razina:62,tezina:1,teren:'dan',parovi:[
      T('Dalmatinski Vjetar',0x3fb6a8,[I('JAKOV','suter','sniper'),I('NIKOLINA','brzi','streetballer',1)]),
      T('Zagorski Medvjedi',0x8b5a2b,[I('TOMO','zakucavac','slasher'),I('DORA','obrambeni','defender',1)]),
      T('Slavonske Munje',0x9acd32,[I('MARKO','brzi','streetballer'),I('ANJA','suter','sniper',1)]),
      T('Istarska Bura',0x5f8f8b,[I('LOVRO','obrambeni','defender'),I('ROZA','zakucavac','showman',1)]),
      T('Lički Vukovi',0x7a1f1f,[I('GRGA','zakucavac','showman'),I('NELA','brzi','slasher',1)])],
      sef:T('Kraljevi Regije',0xff8c00,[I('STIPE','suter','sniper',0,{nadimak:'Vuk s juga',recenica:'Regija ima samo jednog kralja.'}),I('VESNA','obrambeni','defender',1)])},
    {id:'drzava',ime:'Država',razina:74,tezina:2,teren:'most',parovi:[
      T('Reprezentativci',0xd62b24,[I('DARIO','brzi','streetballer'),I('ELA','suter','sniper',1)]),
      T('Olimpijci',0xc9a227,[I('ZVONE','zakucavac','showman'),I('SANJA','obrambeni','defender',1)]),
      T('Hrvatski Orlovi',0x1c1c1c,[I('TIN','obrambeni','defender'),I('MAJA','brzi','slasher',1)]),
      T('Zelena Zona',0x1faa59,[I('FILIP','suter','sniper'),I('IVONA','zakucavac','slasher',1)]),
      T('Crni Biseri',0x2b2b3a,[I('ANTE','brzi','streetballer'),I('KATJA','suter','sniper',1)])],
      sef:T('Državni Prvaci',0x9b111e,[I('MAX','zakucavac','slasher',0,{nadimak:'Kapetan države',recenica:'Do finala dođu mnogi. Dalje nitko.'}),I('LEA','suter','sniper',1)])},
    {id:'legende',ime:'Legende',razina:85,tezina:2,teren:'krov',parovi:[
      T('Zlatna Generacija',0xe6b800,[I('PETAR','suter','sniper'),I('DUNJA','brzi','streetballer',1)]),
      T('Stari Majstori',0xa8a9ad,[I('MIRKO','obrambeni','defender'),I('ZORA','suter','sniper',1)]),
      T('Noćni Kraljevi',0x5b2c83,[I('SLAVEN','zakucavac','showman'),I('BIANCA','brzi','slasher',1)]),
      T('Asfaltni Bogovi',0x222222,[I('KRUNO','brzi','streetballer'),I('HELENA','obrambeni','defender',1)]),
      T('Vječni Rivali',0xc0392b,[I('BOŽO','zakucavac','slasher'),I('NORA','suter','sniper',1)])],
      sef:T('Besmrtni',0xf0f0f0,[I('ŽAC','brzi','streetballer',0,{nadimak:'Posljednja legenda',recenica:'Svi dođu po krunu. Nitko je ne odnese.'}),I('DIVA','suter','sniper',1)])}];
  const BODOVI_FINALE=12;
  // osobine protivnika: razina lige + naglasak arhetipa + mala razlika po igraču (stalna, ne nasumična)
  const NAGLASAK={brzi:{brzina:8,dribling:8,kradja:3,blok:-6,zakucavanje:-4},zakucavac:{zakucavanje:10,blok:5,skok:6,brzina:-6,trica:-8,dribling:-5},
    suter:{sut:8,trica:10,zakucavanje:-8,blok:-5},obrambeni:{blok:9,kradja:9,skok:4,sut:-5,trica:-6}};
  const OSOBINE=['sut','trica','zakucavanje','brzina','dribling','kradja','blok','skok'];
  function osobineZa(d,razina){ let h=0; for(const c of d.ime) h=(h*31+c.charCodeAt(0))%997; const n=NAGLASAK[d.arhetip]||{}, o={};
    OSOBINE.forEach((k,i)=>o[k]=clamp(Math.round(razina+(n[k]||0)+((h>>i)%7)-3),5,99)); return o; }
  // izgled protivnika (koža i kosa po redu, da svaki par izgleda drukčije)
  function opis(d,li,pi,k,razina){ const n=li*11+pi*2+k;
    return Object.assign({},d,{koza:KOZE[n%KOZE.length],kosa:KOSE[(n*3+1)%KOSE.length],osobine:osobineZa(d,razina),covjek:false}); }

  // ---------- stanje ----------
  let turnir=null;   // karijerni turnir u tijeku (samo u memoriji): {kolo, parovi:[…], kotizacija}
  const prof=()=>Profil.ucitaj();
  const ligaIdx=()=>Math.max(0,LIGE.findIndex(l=>l.id===prof().karijera.liga));
  const liga=()=>LIGE[ligaIdx()];
  const danas=()=>{ const d=new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); };
  function treningDanas(){ const t=prof().trening; if(t.dan!==danas()){ t.dan=danas(); t.odradeno=0; } return t; }
  const kotizacija=()=>100*(ligaIdx()+1);
  const XP_RAZINA=r=>150*r;   // XP potreban za sljedeću razinu igrača

  // moj igrač (osobine iz profila) + DRE, fiksni all-round bot
  const DRE_OSOBINE={sut:55,trica:55,zakucavanje:55,brzina:55,dribling:55,kradja:55,blok:55,skok:55};
  function mojaPostava(){ const p=prof(), iz=p.igrac.izgled;
    return [{ime:p.igrac.ime,arhetip:'brzi',osobnost:'streetballer',koza:iz.koza,kosa:iz.kosa,osobine:p.igrac.osobine,covjek:true},
            {ime:'DRE',arhetip:'zakucavac',osobnost:'allround',uloga:'All-round',osobine:DRE_OSOBINE,covjek:false}]; }

  // ---------- utakmice ----------
  // vrsta: 'liga' | 'finale' | 'turnir'
  function igraj(vrsta){ const L=liga(), li=ligaIdx(), p=prof();
    let par, pi, razina=L.razina, doBodova=11, teren=L.teren, naslov;
    if(vrsta==='finale'){ par=L.sef; pi=5; razina=L.razina+5; doBodova=15; teren='krov'; naslov='FINALE LIGE · '+L.ime.toUpperCase(); }
    else if(vrsta==='turnir'){ pi=turnir.parovi[turnir.kolo]; par=L.parovi[pi]; naslov='TURNIR · '+['ČETVRTFINALE','POLUFINALE','FINALE'][turnir.kolo]; }
    else { pi=p.karijera.sljedeci%L.parovi.length; par=L.parovi[pi]; naslov=L.ime.toUpperCase()+' · '+par.tim; }
    $('karOv').classList.add('hidden');
    Utakmica.pokreni({plavi:mojaPostava(), crveni:par.igraci.map((d,k)=>opis(d,li,pi,k,razina)), boje:{crveni:par.boja},
      teren, doBodova, tezina:L.tezina, kolo:li+(vrsta==='finale'?1:0), vratiIzgled:true,
      pripremi:()=>{ if(vrsta==='finale'){ const s=par.igraci[0]; teams[1][0].rival={nick:s.nadimak,line:s.recenica,l:1}; } },
      uvod:()=>{ flash(naslov,`${par.tim}: ${par.igraci.map(d=>d.ime).join(' i ')}`,1.8);
        if(vrsta==='finale'){ const b=teams[1][0], s=par.igraci[0];
          setTimeout(()=>{ if(game.mode==='menu'||game.mode==='over') return;
            hype('ŠEF LIGE: '+s.ime,`„${s.nadimak}“ · ${par.tim}`,'rival',{dur:2.2,shake:0.2,punch:0.4,edge:1,focus:players.indexOf(b),wob:1});
            sfx.ooh(); crowd('lean',1.6); taunt(b,s.recenica); },1800); } },
      kraj:r=>krajUtakmice(r,vrsta,par)}); }

  function krajUtakmice(r,vrsta,par){ const p=prof(), k=p.karijera, L=liga(), redci=[], poruke=[];
    // novčići: pobjeda 60 / poraz 20, +2 po trici, +3 po zakucavanju, +2 po krađi (cijela naša ekipa)
    let tr=0,zk=0,kr=0; for(const pl of teams[0]){ const s=r.statistika.poIgracu[pl.info.name]; if(!s) continue; tr+=s.trice; zk+=s.zakucavanja; kr+=s.kradje; }
    const osnova=r.pobjeda?60:20; let novc=osnova+tr*2+zk*3+kr*2;
    redci.push([r.pobjeda?'Pobjeda':'Poraz',osnova],[`Trice ${tr} × 2`,tr*2],[`Zakucavanja ${zk} × 3`,zk*3],[`Krađe ${kr} × 2`,kr*2]);
    // liga, finale, turnir
    if(vrsta==='liga'){ k.sljedeci=(k.sljedeci+1)%L.parovi.length; if(r.pobjeda){ k.bodovi+=3; poruke.push(`+3 boda u ligi ${L.ime}`); } }
    if(vrsta==='finale'&&r.pobjeda){ const li=ligaIdx();
      if(li<LIGE.length-1){ k.liga=LIGE[li+1].id; k.bodovi=0; k.sljedeci=0; poruke.push(`🏆 Prvak lige ${L.ime}! Nova liga: ${LIGE[li+1].ime}`); }
      else { k.bodovi=0; k.sljedeci=0; poruke.push('👑 PRVAK LEGENDI! Najbolji na asfaltu.'); } }
    else if(vrsta==='finale') poruke.push(`Šef lige ${par.igraci[0].ime} je bio bolji. Pokušaj ponovno.`);
    if(vrsta==='turnir'){
      if(!r.pobjeda){ poruke.push('Ispao si s turnira.'); turnir=null; }
      else if(turnir.kolo<2){ turnir.kolo++; poruke.push(`Prolaz dalje! Sljedeće: ${['','polufinale','finale'][turnir.kolo]}.`); }
      else { const nag=turnir.kotizacija*5; novc+=nag; redci.push(['🏆 Nagrada turnira',nag]); poruke.push('Osvojio si turnir!'); turnir=null; } }
    // spremi: novčići, Rep, XP i razina igrača
    p.novcici+=novc; p.rep+=r.rep; const razina0=p.igrac.razina; p.igrac.xp+=r.rep;
    while(p.igrac.xp>=XP_RAZINA(p.igrac.razina)){ p.igrac.xp-=XP_RAZINA(p.igrac.razina); p.igrac.razina++; }
    if(p.igrac.razina>razina0) poruke.push(`⬆ Razina igrača ${p.igrac.razina}!`);
    Profil.spremi();
    pokaziNagradu({naslov:(r.pobjeda?'Pobjeda ':'Poraz ')+r.bodovi[0]+' : '+r.bodovi[1],pobjeda:r.pobjeda,redci,novc,rep:r.rep,poruke}); }

  // ---------- trening trica ----------
  function trening(){ const p=prof(), t=treningDanas(), besplatno=t.odradeno<3;
    if(!besplatno&&p.novcici<50) return;
    if(!besplatno) p.novcici-=50; t.odradeno++; Profil.spremi();
    $('karOv').classList.add('hidden');
    Trening.pokreni({vrsta:'trice',tezina:liga().tezina,kraj:krajTreninga}); }
  function krajTreninga(r){ const p=prof(), o=p.igrac.osobine;
    // +0.5 šut i trica za svaka 3 pogotka, +0.2 šut i trica po savršenom
    const dobitak=Math.floor(r.pogodaka/3)*0.5+r.savrseno*0.2, r1=v=>Math.round(v*10)/10;
    o.sut=r1(Math.min(100,o.sut+dobitak)); o.trica=r1(Math.min(100,o.trica+dobitak)); Profil.spremi();
    $('tOver').classList.add('hidden');
    pokaziNagradu({naslov:`Trening: ${r.bodovi} / 18`,pobjeda:r.bodovi>=10,novc:0,rep:0,
      redci:[[`Pogodaka ${r.pogodaka} → ${Math.floor(r.pogodaka/3)} × 0.5`,null],[`Savršenih ${r.savrseno} × 0.2`,null]],
      poruke:[`Šut i trica +${r1(dobitak)} (šut ${o.sut}, trica ${o.trica})`]}); }

  // ---------- turnir ----------
  function turnirKreni(){ const p=prof(), c=kotizacija();
    if(!turnir){ if(p.novcici<c) return; p.novcici-=c; Profil.spremi();
      const idx=[0,1,2,3,4].sort(()=>Math.random()-0.5).slice(0,3); turnir={kolo:0,parovi:idx,kotizacija:c}; }
    igraj('turnir'); }

  // ---------- ekrani ----------
  function pokaziNagradu(n){ const el=$('karRez');
    el.querySelector('.kr-t').textContent=n.naslov; el.querySelector('.kr-t').className='kr-t '+(n.pobjeda?'win':'lose');
    el.querySelector('.kr-l').innerHTML=n.redci.map(([a,b])=>`<div><span>${a}</span><b>${b==null?'':'+'+b}</b></div>`).join('')+
      (n.novc?`<div class="sum"><span>Novčići</span><b>+${n.novc} 🪙</b></div>`:'')+(n.rep?`<div class="sum"><span>Rep</span><b>+${n.rep}</b></div>`:'');
    el.querySelector('.kr-p').innerHTML=n.poruke.map(m=>`<div>${m}</div>`).join('');
    ['over','tOver','menu','pauseOv'].forEach(id=>$(id).classList.add('hidden')); $('touch').style.display='none';
    el.classList.remove('hidden'); }
  const traka=(v,max)=>`<div class="kb"><i style="width:${clamp(v/max*100,0,100)}%"></i></div>`;
  function render(){ const p=prof(), g=p.igrac, L=liga(), li=ligaIdx(), k=p.karijera, t=treningDanas(), c=kotizacija();
    const par=L.parovi[k.sljedeci%L.parovi.length], finaleOk=k.bodovi>=BODOVI_FINALE;
    const OS={sut:'Šut',trica:'Trica',zakucavanje:'Zakucavanje',brzina:'Brzina',dribling:'Dribling',kradja:'Krađa',blok:'Blok',skok:'Skok'};
    $('karBody').innerHTML=`
      <div class="kar-card"><div class="kc-h"><b>${g.ime}</b><span>Razina ${g.razina}</span></div>${traka(g.xp,XP_RAZINA(g.razina))}
        <small>${g.xp} / ${XP_RAZINA(g.razina)} XP</small>
        <div class="kc-os">${OSOBINE.map(o=>`<div><span>${OS[o]}</span>${traka(g.osobine[o],100)}<b>${Math.round(g.osobine[o])}</b></div>`).join('')}</div></div>
      <div class="kar-res"><div><small>Novčići</small><b>${p.novcici} 🪙</b></div><div><small>Rep</small><b>${p.rep}</b></div><div><small>Liga</small><b>${L.ime} <em>${li+1}/5</em></b></div></div>
      <div class="kar-liga"><div><span>Bodovi u ligi</span><b>${Math.min(k.bodovi,BODOVI_FINALE)} / ${BODOVI_FINALE}</b></div>${traka(k.bodovi,BODOVI_FINALE)}</div>
      <button class="big" data-a="liga">Igraj utakmicu<small>${par.tim} · ${par.igraci.map(d=>d.ime).join(' i ')}</small></button>
      <button class="big alt" data-a="finale" ${finaleOk?'':'disabled'}>${finaleOk?'⚔ Finale lige':'🔒 Finale lige'}<small>${finaleOk?`Šef: ${L.sef.igraci[0].ime} „${L.sef.igraci[0].nadimak}“ · ${L.sef.tim}`:`otključava se s ${BODOVI_FINALE} bodova`}</small></button>
      <div class="modes">
        <button class="big alt" data-a="turnir" ${turnir||p.novcici>=c?'':'disabled'}>🏆 Turnir<small>${turnir?`nastavi · kolo ${turnir.kolo+1}/3`:`kotizacija ${c} · nagrada ${c*5}`}</small></button>
        <button class="big alt" data-a="trening" ${t.odradeno<3||p.novcici>=50?'':'disabled'}>🎯 Trening trica<small>${t.odradeno<3?`besplatno ${3-t.odradeno}/3 danas`:'50 novčića'}</small></button></div>
      <button class="big alt" data-a="izbornik">Izbornik</button>`; }
  function otvori(){ toMenu(); $('menu').classList.add('hidden'); $('karRez').classList.add('hidden'); render(); $('karOv').classList.remove('hidden'); }
  function zatvori(){ $('karOv').classList.add('hidden'); $('karRez').classList.add('hidden'); toMenu(); }
  $('karOv').addEventListener('click',e=>{ const b=e.target.closest('button[data-a]'); if(!b||b.disabled) return; audio(); const a=b.dataset.a;
    if(a==='liga') igraj('liga'); else if(a==='finale') igraj('finale'); else if(a==='turnir') turnirKreni(); else if(a==='trening') trening(); else if(a==='izbornik') zatvori(); });
  $('karNastavi').onclick=otvori;
  $('karBtn').onclick=()=>{ audio(); otvori(); };
  return {otvori, zatvori, LIGE, osobineZa, get turnir(){ return turnir; }};
})();
