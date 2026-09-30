// ===== Košarka 2 na 2 - karijera: lige, protivnici, finale, turnir, trening trica, nagrade (sve u profilu) =====
'use strict';
const Karijera=(()=>{
  // ---------- lige i protivnici ----------
  const KOZE=[0x8d5524,0xc68642,0xe0ac69,0xf1c27d,0xffdbac,0x6b4423,0xb07a4f,0xe8b98a];
  const KOSE=['#15100c','#2a1a12','#6b3e1e','#3a2e1a','#1a1210','#8a5a2a','#b3221b','#d9b36c'];
  // igrač: ime, arhetip, osobnost, zensko (+ nadimak/recenica za šefa lige)
  const I=(ime,arh,osob,z,extra)=>Object.assign({ime,arhetip:arh,osobnost:osob,zensko:!!z},extra||{});
  const hex=c=>'#'+c.toString(16).padStart(6,'0'), tamnije=c=>((c>>16&255)*0.28<<16)|((c>>8&255)*0.28<<8)|((c&255)*0.28|0);
  const Tim=(tim,j,igraci)=>({tim,boja:{j,s:tamnije(j),css:hex(j)},igraci});
  const LIGE=[
    {id:'kvart',ime:T('karijera.liga.kvart'),razina:35,tezina:0,teren:'dan',parovi:[
      Tim('Dečki s Placa',0x1f9d55,[I('ŠIME','brzi','streetballer'),I('LUCIJA','suter','sniper',1)]),
      Tim('Klupa kod Konzuma',0xe0741c,[I('MATE','zakucavac','slasher'),I('NINA','brzi','streetballer',1)]),
      Tim('Blok B7',0x7d8597,[I('BORNA','obrambeni','defender'),I('IVA','suter','sniper',1)]),
      Tim('Mladi Lavovi',0xd4a017,[I('KREŠO','zakucavac','showman'),I('PETRA','obrambeni','defender',1)]),
      Tim('Park Brigada',0x2aa7a1,[I('LUKA','brzi','slasher'),I('EMA','suter','sniper',1)])],
      sef:Tim('Kraljevi Kvarta',0x8e2de2,[I('BRKO','zakucavac','showman',0,{nadimak:T('karijera.sef.kvart.nadimak'),recenica:T('karijera.sef.kvart.recenica')}),I('ZARA','suter','sniper',1)])},
    {id:'grad',ime:T('karijera.liga.grad'),razina:50,tezina:1,teren:'most',parovi:[
      Tim('Tramvaj 13',0xf2c230,[I('FRANE','brzi','streetballer'),I('MIA','suter','sniper',1)]),
      Tim('Stari Grad',0xb5332e,[I('DUJE','zakucavac','slasher'),I('LANA','obrambeni','defender',1)]),
      Tim('Gradski Sokoli',0x2e8b57,[I('ROKO','obrambeni','defender'),I('TEA','brzi','streetballer',1)]),
      Tim('Noćna Smjena',0x444a5a,[I('VITO','suter','sniper'),I('KLARA','zakucavac','showman',1)]),
      Tim('Riva Crew',0xff7f50,[I('NOA','brzi','slasher'),I('MARTA','suter','sniper',1)])],
      sef:Tim('Gospodari Grada',0xc2185b,[I('DADO','brzi','streetballer',0,{nadimak:T('karijera.sef.grad.nadimak'),recenica:T('karijera.sef.grad.recenica')}),I('IRIS','obrambeni','defender',1)])},
    {id:'regija',ime:T('karijera.liga.regija'),razina:62,tezina:1,teren:'dan',parovi:[
      Tim('Dalmatinski Vjetar',0x3fb6a8,[I('JAKOV','suter','sniper'),I('NIKOLINA','brzi','streetballer',1)]),
      Tim('Zagorski Medvjedi',0x8b5a2b,[I('TOMO','zakucavac','slasher'),I('DORA','obrambeni','defender',1)]),
      Tim('Slavonske Munje',0x9acd32,[I('MARKO','brzi','streetballer'),I('ANJA','suter','sniper',1)]),
      Tim('Istarska Bura',0x5f8f8b,[I('LOVRO','obrambeni','defender'),I('ROZA','zakucavac','showman',1)]),
      Tim('Lički Vukovi',0x7a1f1f,[I('GRGA','zakucavac','showman'),I('NELA','brzi','slasher',1)])],
      sef:Tim('Kraljevi Regije',0xff8c00,[I('STIPE','suter','sniper',0,{nadimak:T('karijera.sef.regija.nadimak'),recenica:T('karijera.sef.regija.recenica')}),I('VESNA','obrambeni','defender',1)])},
    {id:'drzava',ime:T('karijera.liga.drzava'),razina:74,tezina:2,teren:'most',parovi:[
      Tim('Reprezentativci',0xd62b24,[I('DARIO','brzi','streetballer'),I('ELA','suter','sniper',1)]),
      Tim('Olimpijci',0xc9a227,[I('ZVONE','zakucavac','showman'),I('SANJA','obrambeni','defender',1)]),
      Tim('Hrvatski Orlovi',0x1c1c1c,[I('TIN','obrambeni','defender'),I('MAJA','brzi','slasher',1)]),
      Tim('Zelena Zona',0x1faa59,[I('FILIP','suter','sniper'),I('IVONA','zakucavac','slasher',1)]),
      Tim('Crni Biseri',0x2b2b3a,[I('ANTE','brzi','streetballer'),I('KATJA','suter','sniper',1)])],
      sef:Tim('Državni Prvaci',0x9b111e,[I('MAX','zakucavac','slasher',0,{nadimak:T('karijera.sef.drzava.nadimak'),recenica:T('karijera.sef.drzava.recenica')}),I('LEA','suter','sniper',1)])},
    {id:'legende',ime:T('karijera.liga.legende'),razina:85,tezina:2,teren:'krov',parovi:[
      Tim('Zlatna Generacija',0xe6b800,[I('PETAR','suter','sniper'),I('DUNJA','brzi','streetballer',1)]),
      Tim('Stari Majstori',0xa8a9ad,[I('MIRKO','obrambeni','defender'),I('ZORA','suter','sniper',1)]),
      Tim('Noćni Kraljevi',0x5b2c83,[I('SLAVEN','zakucavac','showman'),I('BIANCA','brzi','slasher',1)]),
      Tim('Asfaltni Bogovi',0x222222,[I('KRUNO','brzi','streetballer'),I('HELENA','obrambeni','defender',1)]),
      Tim('Vječni Rivali',0xc0392b,[I('BOŽO','zakucavac','slasher'),I('NORA','suter','sniper',1)])],
      sef:Tim('Besmrtni',0xf0f0f0,[I('ŽAC','brzi','streetballer',0,{nadimak:T('karijera.sef.legende.nadimak'),recenica:T('karijera.sef.legende.recenica')}),I('DIVA','suter','sniper',1)])}];
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

  // ---------- botovi suigrači ----------
  const botPo=id=>BOTOVI.find(b=>b.id===id);
  const stanjeBota=id=>prof().botovi[id]||(prof().botovi[id]={otkljucan:false,naljepnice:0,razina:1});
  // osobine bota na njegovoj razini: +BOT_RAZINA_BONUS po razini iznad prve
  function osobineBota(b){ const r=clamp(stanjeBota(b.id).razina|0,1,BOT_MAX_RAZINA), o={};
    for(const k of OSOBINE) o[k]=Math.min(99,b.osobine[k]+(r-1)*BOT_RAZINA_BONUS); return o; }
  // zadnji odabrani suigrač (ako više nije otključan: početni bot)
  function odabraniBot(){ const p=prof(), b=botPo(p.odabraniBot);
    return b&&stanjeBota(b.id).otkljucan?b:botPo(BOT_POCETNI); }
  function opisBota(b){ const Tip=BOT_TIPOVI[b.tip], iz=b.izgled;
    return {ime:b.ime,arhetip:Tip.arhetip,osobnost:Tip.osobnost,uloga:Tip.ime,tijelo:Tip.tijelo||undefined,
      koza:iz.koza,kosa:iz.kosa,frizura:iz.frizura,zensko:!!iz.zensko,osobine:osobineBota(b),covjek:false}; }
  // moj igrač (osobine iz profila) + odabrani bot suigrač
  function mojaPostava(){ const p=prof(), iz=p.igrac.izgled;
    return [{ime:p.igrac.ime,arhetip:'brzi',osobnost:'streetballer',koza:iz.koza,kosa:iz.kosa,osobine:p.igrac.osobine,covjek:true},
            opisBota(odabraniBot())]; }

  // ---------- utakmice ----------
  // vrsta: 'liga' | 'finale' | 'turnir'
  function igraj(vrsta){ const L=liga(), li=ligaIdx(), p=prof();
    let par, pi, razina=L.razina, doBodova=11, teren=L.teren, naslov;
    if(vrsta==='finale'){ par=L.sef; pi=5; razina=L.razina+5; doBodova=15; teren='krov'; naslov=T('karijera.finaleLige',{liga:L.ime.toUpperCase()}); }
    else if(vrsta==='turnir'){ pi=turnir.parovi[turnir.kolo]; par=L.parovi[pi]; naslov=T('karijera.turnirKolo',{kolo:T('karijera.turnirKolo.'+turnir.kolo)}); }
    else { pi=p.karijera.sljedeci%L.parovi.length; par=L.parovi[pi]; naslov=L.ime.toUpperCase()+' · '+par.tim; }
    $('karOv').classList.add('hidden');
    Utakmica.pokreni({plavi:mojaPostava(), crveni:par.igraci.map((d,k)=>opis(d,li,pi,k,razina)), boje:{crveni:par.boja},
      teren, doBodova, tezina:L.tezina, kolo:li+(vrsta==='finale'?1:0), vratiIzgled:true, naredbe:true,
      pripremi:()=>{ if(vrsta==='finale'){ const s=par.igraci[0]; teams[1][0].rival={nick:s.nadimak,line:s.recenica,l:1}; } },
      uvod:()=>{ flash(naslov,`${par.tim}: ${par.igraci.map(d=>d.ime).join(T('opce.i'))}`,1.8);
        if(vrsta==='finale'){ const b=teams[1][0], s=par.igraci[0];
          setTimeout(()=>{ if(game.mode==='menu'||game.mode==='over') return;
            hype(T('karijera.sefLige',{ime:s.ime}),`„${s.nadimak}“ · ${par.tim}`,'rival',{dur:2.2,shake:0.2,punch:0.4,edge:1,focus:players.indexOf(b),wob:1});
            sfx.ooh(); crowd('lean',1.6); taunt(b,s.recenica); },1800); } },
      kraj:r=>krajUtakmice(r,vrsta,par)}); }

  function krajUtakmice(r,vrsta,par){ const p=prof(), k=p.karijera, L=liga(), redci=[], poruke=[];
    // novčići: pobjeda 60 / poraz 20, +2 po trici, +3 po zakucavanju, +2 po krađi (cijela naša ekipa)
    let tr=0,zk=0,kr=0; for(const pl of teams[0]){ const s=r.statistika.poIgracu[pl.info.name]; if(!s) continue; tr+=s.trice; zk+=s.zakucavanja; kr+=s.kradje; }
    const osnova=r.pobjeda?60:20; let novc=osnova+tr*2+zk*3+kr*2;
    redci.push([T(r.pobjeda?'opce.pobjeda':'opce.poraz'),osnova],[T('karijera.trice',{n:tr}),tr*2],[T('karijera.zakucavanja',{n:zk}),zk*3],[T('karijera.kradje',{n:kr}),kr*2]);
    // liga, finale, turnir
    if(vrsta==='liga'){ k.sljedeci=(k.sljedeci+1)%L.parovi.length; if(r.pobjeda){ k.bodovi+=3; poruke.push(T('karijera.bodaULigi',{liga:L.ime})); } }
    if(vrsta==='finale'&&r.pobjeda){ const li=ligaIdx();
      if(li<LIGE.length-1){ k.liga=LIGE[li+1].id; k.bodovi=0; k.sljedeci=0; poruke.push(T('karijera.prvakLige',{liga:L.ime,nova:LIGE[li+1].ime})); }
      else { k.bodovi=0; k.sljedeci=0; poruke.push(T('karijera.prvakLegendi')); } }
    else if(vrsta==='finale') poruke.push(T('karijera.sefBoljiBio',{ime:par.igraci[0].ime}));
    if(vrsta==='turnir'){
      if(!r.pobjeda){ poruke.push(T('karijera.ispao')); turnir=null; }
      else if(turnir.kolo<2){ turnir.kolo++; poruke.push(T('karijera.prolaz',{kolo:T('karijera.prolazKolo.'+turnir.kolo)})); }
      else { const nag=turnir.kotizacija*5; novc+=nag; redci.push([T('karijera.nagradaTurnira'),nag]); poruke.push(T('karijera.osvojioTurnir')); turnir=null; } }
    // spremi: novčići, Rep, XP i razina igrača
    p.novcici+=novc; p.rep+=r.rep; const razina0=p.igrac.razina; p.igrac.xp+=r.rep;
    while(p.igrac.xp>=XP_RAZINA(p.igrac.razina)){ p.igrac.xp-=XP_RAZINA(p.igrac.razina); p.igrac.razina++; }
    if(p.igrac.razina>razina0) poruke.push(T('karijera.razinaGore',{n:p.igrac.razina}));
    Profil.spremi();
    pokaziNagradu({naslov:T('karijera.rezultat',{ishod:T(r.pobjeda?'opce.pobjeda':'opce.poraz'),a:r.bodovi[0],b:r.bodovi[1]}),pobjeda:r.pobjeda,redci,novc,rep:r.rep,poruke}); }

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
    pokaziNagradu({naslov:T('karijera.trening',{n:r.bodovi}),pobjeda:r.bodovi>=10,novc:0,rep:0,
      redci:[[T('karijera.pogodaka',{n:r.pogodaka,k:Math.floor(r.pogodaka/3)}),null],[T('karijera.savrsenih',{n:r.savrseno}),null]],
      poruke:[T('karijera.sutTricaGore',{d:r1(dobitak),s:o.sut,t:o.trica})]}); }

  // ---------- turnir ----------
  function turnirKreni(){ const p=prof(), c=kotizacija();
    if(!turnir){ if(p.novcici<c) return; p.novcici-=c; Profil.spremi();
      const idx=[0,1,2,3,4].sort(()=>Math.random()-0.5).slice(0,3); turnir={kolo:0,parovi:idx,kotizacija:c}; }
    igraj('turnir'); }

  // ---------- ekrani ----------
  function pokaziNagradu(n){ const el=$('karRez');
    el.querySelector('.kr-t').textContent=n.naslov; el.querySelector('.kr-t').className='kr-t '+(n.pobjeda?'win':'lose');
    el.querySelector('.kr-l').innerHTML=n.redci.map(([a,b])=>`<div><span>${a}</span><b>${b==null?'':'+'+b}</b></div>`).join('')+
      (n.novc?`<div class="sum"><span>${T('karijera.novcici')}</span><b>+${n.novc} 🪙</b></div>`:'')+(n.rep?`<div class="sum"><span>${T('karijera.rep')}</span><b>+${n.rep}</b></div>`:'');
    el.querySelector('.kr-p').innerHTML=n.poruke.map(m=>`<div>${m}</div>`).join('');
    ['over','tOver','menu','pauseOv'].forEach(id=>$(id).classList.add('hidden')); $('touch').style.display='none';
    el.classList.remove('hidden'); }
  const traka=(v,max)=>`<div class="kb"><i style="width:${clamp(v/max*100,0,100)}%"></i></div>`;
  const osobineHtml=o=>`<div class="kc-os">${OSOBINE.map(k=>`<div><span>${T('osobina.'+k)}</span>${traka(o[k],100)}<b>${Math.round(o[k])}</b></div>`).join('')}</div>`;
  // avatari botova (isti crtež kao kartice igrača u utakmici); zaključani su silueta (CSS)
  function silueta(cv,frizura){ const g=cv.getContext('2d'), W=cv.width, H=cv.height, hx=W/2, hy=H*0.47, r=H*0.26;
    const bg=g.createLinearGradient(0,0,0,H); bg.addColorStop(0,'#2a3040'); bg.addColorStop(1,'#0b0d14'); g.fillStyle=bg; g.fillRect(0,0,W,H);
    g.fillStyle='#05060a'; g.beginPath(); g.ellipse(hx,H*1.05,W*0.4,H*0.32,0,Math.PI,0); g.fill(); g.fillRect(hx-r*0.35,hy+r*0.6,r*0.7,r*0.8);
    g.beginPath(); g.arc(hx,hy,r,0,Math.PI*2); g.arc(hx-r,hy+2,r*0.2,0,Math.PI*2); g.arc(hx+r,hy+2,r*0.2,0,Math.PI*2); g.fill();
    if(frizura==='cap'){ g.beginPath(); g.ellipse(hx,hy-r*0.14,r*1.3,r*0.2,0,0,Math.PI*2); g.fill(); }
    if(frizura==='pony'){ g.beginPath(); g.ellipse(hx+r*0.95,hy+r*0.35,r*0.32,r*0.8,0.35,0,Math.PI*2); g.fill(); }
    g.fillStyle='rgba(255,255,255,.35)'; g.font=`bold ${Math.round(H*0.3)}px sans-serif`; g.textAlign='center'; g.textBaseline='middle'; g.fillText('?',hx,hy+2); }
  function nacrtajBotove(){ $('karBody').querySelectorAll('canvas[data-bot]').forEach(cv=>{ const b=botPo(cv.dataset.bot), iz=b.izgled;
    if(!stanjeBota(b.id).otkljucan) return silueta(cv,iz.frizura);
    drawAvatar(cv,{skin:iz.koza,hair:iz.frizura,hairCol:iz.kosa,num:''},0); }); }
  let pogled='glavni';   // 'glavni' | 'ekipa'
  // izbor suigrača prije utakmice: samo otključani botovi, zadnji izbor ostaje zapamćen
  function suigracHtml(){ const odab=odabraniBot();
    return `<div class="kar-sui"><div class="ks-h"><span>${T('karijera.suigrac')}</span><button class="lnk" data-a="ekipa">${T('karijera.ekipa')}</button></div><div class="ks-l">${
      BOTOVI.filter(b=>stanjeBota(b.id).otkljucan).map(b=>`<button class="ks-b${b===odab?' on':''}" data-a="bot" data-id="${b.id}" style="--rc:${BOT_RIJETKOSTI[b.rijetkost].boja}">
        <canvas data-bot="${b.id}" width="60" height="44"></canvas><b>${b.ime}</b><small>${BOT_TIPOVI[b.tip].ime} · ${T('karijera.razinaKratko',{n:stanjeBota(b.id).razina})}</small></button>`).join('')}</div></div>`; }
  function renderEkipa(){ const odab=odabraniBot();
    $('karBody').innerHTML=`<div class="kar-ek-h"><b>${T('karijera.ekipaNaslov')}</b><span>${T('karijera.otkljucano',{n:BOTOVI.filter(b=>stanjeBota(b.id).otkljucan).length,m:BOTOVI.length})}</span></div>
      <div class="bot-grid">${BOTOVI.map(b=>{ const s=stanjeBota(b.id), R=BOT_RIJETKOSTI[b.rijetkost], Tip=BOT_TIPOVI[b.tip];
        const glava=`<canvas data-bot="${b.id}" width="120" height="88"></canvas><div class="bk-h"><b>${b.ime}</b><em>${R.ime}</em></div>`;
        if(!s.otkljucan) return `<div class="kar-card bot-k zak" style="--rc:${R.boja}">${glava}<small>${Tip.ime}</small>
          <div class="bk-lock">${T('karijera.trebaNaljepnica',{n:BOT_NALJEPNICA_ZA_OTKLJUCAVANJE})}</div>${traka(s.naljepnice,BOT_NALJEPNICA_ZA_OTKLJUCAVANJE)}<small>${s.naljepnice} / ${BOT_NALJEPNICA_ZA_OTKLJUCAVANJE}</small></div>`;
        return `<div class="kar-card bot-k${b===odab?' on':''}" style="--rc:${R.boja}" data-a="bot" data-id="${b.id}">${glava}
          <small>${Tip.ime} · ${T('karijera.razinaBota',{n:s.razina,m:BOT_MAX_RAZINA})}${b===odab?` · <b class="ok">${T('karijera.oznakaSuigrac')}</b>`:''}</small>
          ${osobineHtml(osobineBota(b))}<p>${b.posebnost}</p><small class="bk-tip">${Tip.opis}</small></div>`; }).join('')}</div>
      <button class="big alt" data-a="natrag">${T('opce.natrag')}</button>`;
    nacrtajBotove(); }
  function render(){ if(pogled==='ekipa') return renderEkipa();
    const p=prof(), g=p.igrac, L=liga(), li=ligaIdx(), k=p.karijera, t=treningDanas(), c=kotizacija();
    const par=L.parovi[k.sljedeci%L.parovi.length], finaleOk=k.bodovi>=BODOVI_FINALE;
    $('karBody').innerHTML=`
      <div class="kar-card"><div class="kc-h"><b>${g.ime}</b><span>${T('karijera.razina',{n:g.razina})}</span></div>${traka(g.xp,XP_RAZINA(g.razina))}
        <small>${g.xp} / ${XP_RAZINA(g.razina)} XP</small>
        ${osobineHtml(g.osobine)}</div>
      <div class="kar-res"><div><small>${T('karijera.novcici')}</small><b>${p.novcici} 🪙</b></div><div><small>${T('karijera.rep')}</small><b>${p.rep}</b></div><div><small>${T('karijera.liga')}</small><b>${L.ime} <em>${li+1}/5</em></b></div></div>
      <div class="kar-liga"><div><span>${T('karijera.bodoviULigi')}</span><b>${Math.min(k.bodovi,BODOVI_FINALE)} / ${BODOVI_FINALE}</b></div>${traka(k.bodovi,BODOVI_FINALE)}</div>
      ${suigracHtml()}
      <button class="big" data-a="liga">${T('karijera.igrajUtakmicu')}<small>${par.tim} · ${par.igraci.map(d=>d.ime).join(T('opce.i'))}</small></button>
      <button class="big alt" data-a="finale" ${finaleOk?'':'disabled'}>${T(finaleOk?'karijera.finaleOtvoreno':'karijera.finaleZakljucano')}<small>${finaleOk?T('karijera.sef',{ime:L.sef.igraci[0].ime,nadimak:L.sef.igraci[0].nadimak,tim:L.sef.tim}):T('karijera.otkljucavaSe',{n:BODOVI_FINALE})}</small></button>
      <div class="modes">
        <button class="big alt" data-a="turnir" ${turnir||p.novcici>=c?'':'disabled'}>${T('karijera.turnir')}<small>${turnir?T('karijera.turnirNastavi',{n:turnir.kolo+1}):T('karijera.turnirKotizacija',{c,n:c*5})}</small></button>
        <button class="big alt" data-a="trening" ${t.odradeno<3||p.novcici>=50?'':'disabled'}>${T('karijera.treningTrica')}<small>${t.odradeno<3?T('karijera.besplatno',{n:3-t.odradeno}):T('karijera.cijenaTreninga')}</small></button></div>
      <button class="big alt" data-a="izbornik">${T('opce.izbornik')}</button>`;
    nacrtajBotove(); }
  function otvori(){ toMenu(); pogled='glavni'; $('menu').classList.add('hidden'); $('karRez').classList.add('hidden'); render(); $('karOv').classList.remove('hidden'); }
  function zatvori(){ $('karOv').classList.add('hidden'); $('karRez').classList.add('hidden'); toMenu(); }
  // ponovno iscrtaj ako je karijera otvorena (npr. nakon promjene u razvojnom panelu)
  function osvjezi(){ if(!$('karOv').classList.contains('hidden')) render(); }
  $('karOv').addEventListener('click',e=>{ const b=e.target.closest('[data-a]'); if(!b||b.disabled) return; audio(); const a=b.dataset.a;
    if(a==='liga') igraj('liga'); else if(a==='finale') igraj('finale'); else if(a==='turnir') turnirKreni(); else if(a==='trening') trening(); else if(a==='izbornik') zatvori();
    else if(a==='ekipa'){ pogled='ekipa'; render(); $('karOv').scrollTop=0; } else if(a==='natrag'){ pogled='glavni'; render(); }
    else if(a==='bot'&&stanjeBota(b.dataset.id).otkljucan){ prof().odabraniBot=b.dataset.id; Profil.spremi(); render(); } });
  $('karNastavi').onclick=otvori;
  $('karBtn').onclick=()=>{ audio(); otvori(); };
  return {otvori, zatvori, osvjezi, LIGE, osobineZa, get turnir(){ return turnir; }};
})();
