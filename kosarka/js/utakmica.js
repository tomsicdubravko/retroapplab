// ===== Košarka 2 na 2 - utakmica i trening: jedno mjesto za pokretanje i kraj (Utakmica.pokreni, Trening.pokreni) =====
'use strict';
// Utakmica.pokreni({
//   plavi:[igrač,igrač], crveni:[igrač,igrač],  // igrač: {ime, arhetip, covjek}
//   teren:'dan'|'most'|'krov', doBodova:21, tezina:0|1|2,
//   kraj(rezultat)                              // poziva se kad utakmica završi
// })
// igrač po želji ima i {osobnost, uloga, koza, kosa, zensko, nadimak, recenica, ulaz}; što nije zadano uzima se od
//   izvornog igrača na tom mjestu (JAY, DRE, SARA, KAI). arhetip: 'brzi'|'zakucavac'|'suter'|'obrambeni' (ili 'speed'|'power'|'shooter'|'defense')
// covjek: jedan čovjek na plavima = obična igra (kontrola se prebacuje između plavih igrača);
//   više ljudi na jednom uređaju: svaki osim prvog treba ulaz() koji vraća njegove kontrole (vidi srcIn u kontrole.js).
//   Online i lokalni lobby sami postavljaju ljude, pa se covjek tada ne primjenjuje.
// dodatne opcije: boje {plavi,crveni: {j,s,css}}, kolo (bonus REP-a u turniru), pripremi() prije početka, uvod() odmah nakon početka
// rezultat: {pobjeda, bodovi:[plavi,crveni], trajanje (s igre),
//   statistika:{poIgracu:{IME:{poeni,trice,zakucavanja,kradje,blokovi,asistencije,ankleBreakeri}}}, rep, mvp}
const Utakmica=(()=>{
  const TEREN={dan:0,most:1,krov:2};
  const ARHETIP={brzi:'speed',zakucavac:'power',suter:'shooter',obrambeni:'defense',speed:'speed',power:'power',shooter:'shooter',defense:'defense'};
  const ULOGA={speed:'Brzi dribler',power:'Zakucavač',shooter:'Šuter',defense:'Obrambeni'};
  const IZVORNI=ROSTER.map(t=>t.map(i=>({...i})));   // izgled igrača prije bilo kakvog presvlačenja
  let tek=null;                                     // opcije utakmice u tijeku
  let izbornik=null;                                // težina i bodovi iz izbornika prije prve utakmice (vraća ih vratiIzbornik)

  // opis igrača → interni oblik (isti kao u TOUR)
  function unutarnji(d,t,i){ const o=IZVORNI[t][i], arch=ARHETIP[d.arhetip]||o.arch;
    return {name:d.ime||o.name, arch, pers:d.osobnost||(d.arhetip?undefined:o.pers), role:d.uloga||(d.arhetip?ULOGA[arch]:o.role),
      skin:d.koza!=null?d.koza:o.skin, hairCol:d.kosa||o.hairCol, she:d.zensko!=null?!!d.zensko:!!o.she, nick:d.nadimak, line:d.recenica,
      st:d.osobine?osobineUSt(arch,d.osobine):null}; }   // osobine 0–100 (karijera) → brojke arhetipa
  // presvuci igrača (dres samo ako su zadane boje ekipe)
  function obuci(p,P,col){ const m=p.mesh.mats;
    if(col){ m.jer.color.setHex(col.j); m.jer.emissive.setHex(col.j); m.shorts.color.setHex(col.s); }
    m.skin.color.setHex(P.skin); m.skin.emissive.setHex(P.skin); m.hair.color.set(P.hairCol);
    p.info.name=P.name; p.info.skin=P.skin; p.info.hairCol=P.hairCol; p.info.arch=P.arch; p.info.she=!!P.she; p.info.role=P.role; p.info.pers=P.pers; p.st=P.st||ARCH[P.arch]; p.rival=null;
    const card=cardEls[players.indexOf(p)]; drawAvatar(card.querySelector('canvas'),p.info,p.team); card.querySelector('b').textContent=P.name; card.querySelector('u').textContent=P.role; }

  // tko je čovjek (samo kad kontrole već nisu postavili online ili lokalni lobby)
  function ljudi(o){ if(game.mp||game.local) return;
    const svi=[...(o.plavi||[]),...(o.crveni||[])].map((d,i)=>({d,p:players[i]})).filter(x=>x.d&&x.d.covjek);
    if(svi.length>1&&svi.slice(1).every(x=>typeof x.d.ulaz==='function')){
      game.local=true; game.humans=new Map(); game.localMain=svi[0].p; game.ctrlIn=typeof svi[0].d.ulaz==='function'?svi[0].d.ulaz:null;
      svi.slice(1).forEach(x=>game.humans.set(x.p,x.d.ulaz)); } }

  // početak utakmice s trenutnim postavkama (isti tijek kao nekad startGame)
  function zapocni(){
    audio(); setSolo(false); $('tOver').classList.add('hidden');
    game.score=[0,0]; game.paused=false; game.clock=0; resetStats();
    D=DIFFS[game.diffIdx];
    $('target').textContent='DO '+game.target;
    $('menu').classList.add('hidden'); $('over').classList.add('hidden'); $('pauseOv').classList.add('hidden');
    if(isTouch) $('touch').style.display='block';
    setupCheck(0); flash('Kreni!','Vaša lopta',1); }

  function pokreni(o){
    tek=o;
    if(o.plavi) teams[0].forEach((p,i)=>{ if(o.plavi[i]) obuci(p,unutarnji(o.plavi[i],0,i),o.boje&&o.boje.plavi); });
    if(o.crveni){ const col=(o.boje&&o.boje.crveni)||TOUR[2].col; COLS[1].css=col.css; teams[1].forEach((p,i)=>{ if(o.crveni[i]) obuci(p,unutarnji(o.crveni[i],1,i),col); }); }
    if(o.pripremi) o.pripremi();
    setVenue(TEREN[o.teren]!=null?TEREN[o.teren]:2);
    if(!izbornik) izbornik={diffIdx:game.diffIdx,target:game.target};
    if(o.tezina!=null) game.diffIdx=o.tezina;
    if(o.doBodova) game.target=o.doBodova;
    ljudi(o);
    zapocni();
    if(o.uvod) o.uvod(); }

  const vrijednost=s=>s.pts*2+s.stl*3+s.blk*3+s.ab*4+s.dunks*2;   // ista mjera kao MVP na karticama
  function rezultat(){
    const win=game.score[0]>game.score[1], poIgracu={};
    for(const p of players){ const s=p.stats||newStats();
      poIgracu[p.info.name]={poeni:s.pts,trice:s.tpm,zakucavanja:s.dunks,kradje:s.stl,blokovi:s.blk,asistencije:s.ast||0,ankleBreakeri:s.ab}; }
    const [a,b]=teams[0], mvp=vrijednost(a.stats||newStats())>=vrijednost(b.stats||newStats())?a:b;
    return {pobjeda:win, bodovi:[game.score[0],game.score[1]], trajanje:Math.round((game.clock||0)*10)/10,
      statistika:{poIgracu}, rep:matchRep(win,tek&&tek.kolo||0), mvp:mvp.info.name}; }
  // kraj utakmice (poziva ga pravila.js kad netko dođe do ciljnih bodova)
  function zavrsi(){ game.mode='over'; const r=rezultat();
    Profil.upisiUtakmicu(r,teams[0].map(p=>p.info.name));   // karijerna statistika: naša (plava) ekipa
    if(tek&&tek.kraj) tek.kraj(r); }
  // povratak u izbornik: težina i bodovi opet kako ih je igrač postavio u izborniku
  // uz opciju vratiIzgled (karijera) vraća i zadane igrače: JAY/DRE, SARA/KAI na krovu
  function vratiIzbornik(){ if(izbornik){ game.diffIdx=izbornik.diffIdx; game.target=izbornik.target; izbornik=null; }
    if(tek&&tek.vratiIzgled){ teams[0].forEach((p,i)=>obuci(p,unutarnji({},0,i))); resetLook(); }
    tek=null; }
  return {pokreni, zavrsi, rezultat, vratiIzbornik, obuci, unutarnji};
})();

// Trening.pokreni({vrsta:'trice', tezina:0|1|2, kraj(rezultat)}) → rezultat {bodovi, pogodaka, savrseno}
const Trening=(()=>{
  let zadnje=null;
  function pokreni(o){ zadnje=o||{};
    if((o&&o.vrsta||'trice')==='trice'){ setSolo(false); Trice.start({tezina:o&&o.tezina, kraj:o&&o.kraj}); } }
  const ponovi=()=>pokreni(zadnje);
  return {pokreni, ponovi};
})();
