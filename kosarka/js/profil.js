// ===== Košarka 2 na 2 - profil: jedno spremljeno mjesto za sav napredak igrača (localStorage 'kosarka-profil') =====
'use strict';
// Profil.ucitaj() → objekt profila (uvijek isti objekt dok se ne resetira), Profil.spremi(), Profil.reset()
// Uz tvoju strukturu profil čuva i ono što se prije spremalo odvojeno:
//   rivali: { IME:{w,l,active} }   trice: { rekordi:[lako,normalno,teško], top10:[[…],[…],[…]] }
// Stari ključevi (street-rep, street-rivals, trice-best-N, trice-top-N) prenose se pri prvom učitavanju i ostaju netaknuti.
const Profil=(()=>{
  const KLJUC='kosarka-profil', VERZIJA=1;
  const zadano=()=>({
    verzija:VERZIJA,
    igrac:{ ime:T('profil.zadanoIme'),
      izgled:{ koza:0x8d5524, kosa:'#15100c', frizura:'band', broj:'7' },
      osobine:{ sut:40, trica:40, zakucavanje:40, brzina:40, dribling:40, kradja:40, blok:40, skok:40 },
      razina:1, xp:0 },
    novcici:200,
    rep:0,
    // botovi suigrači (botovi.js): {id:{otkljucan, naljepnice, razina 1–5}}; na početku samo BOT_POCETNI (Dre)
    botovi:Object.fromEntries(BOTOVI.map(b=>[b.id,{otkljucan:b.id===BOT_POCETNI,naljepnice:0,razina:1}])),
    odabraniBot:BOT_POCETNI,   // zadnji odabrani suigrač u karijeri
    trening:{ dan:'', odradeno:0 },
    karijera:{ liga:'kvart', bodovi:0, sljedeci:0 },   // sljedeci: koji je par u ligi idući protivnik
    statistika:{ utakmice:0, pobjede:0, poeni:0, trice:0, zakucavanja:0, kradje:0, blokovi:0 },
    postavke:{ zvuk:true, tezina:1, jezik:'hr' },   // jezik: ključ u JEZICI (tekstovi.js); vrijedi nakon ponovnog učitavanja
    rivali:{},
    trice:{ rekordi:[0,0,0], top10:[[],[],[]] }
  });
  // nadogradnje po verziji: NADOGRADNJE[n] pretvara profil verzije n-1 u verziju n (za sada nema nijedne)
  const NADOGRADNJE={};
  let P=null;

  const obj=v=>v&&typeof v==='object'&&!Array.isArray(v);
  // dodaj polja kojih nema (rekurzivno kroz objekte); postojeće vrijednosti i dodatna polja ostaju
  function dopuni(cilj,z){ for(const k in z){ if(!(k in cilj)) cilj[k]=z[k]; else if(obj(cilj[k])&&obj(z[k])) dopuni(cilj[k],z[k]); } return cilj; }
  function nadogradi(p){ let v=+p.verzija||0;
    while(v<VERZIJA){ v++; if(NADOGRADNJE[v]) NADOGRADNJE[v](p); }
    dopuni(p,zadano()); p.verzija=Math.max(+p.verzija||0,VERZIJA); return p; }
  const citaj=(k,d)=>{ try{ const v=localStorage.getItem(k); return v==null?d:v; }catch(e){ return d; } };
  // prvi put: prenesi stare, odvojeno spremljene podatke
  function prenesiStaro(p){
    p.rep=+citaj('street-rep',0)||0;
    try{ const r=JSON.parse(citaj('street-rivals','{}')); if(obj(r)) p.rivali=r; }catch(e){}
    for(let i=0;i<3;i++){ p.trice.rekordi[i]=+citaj('trice-best-'+i,0)||0;
      try{ const a=JSON.parse(citaj('trice-top-'+i,'[]')); if(Array.isArray(a)) p.trice.top10[i]=a; }catch(e){} }
    return p; }
  function ucitaj(){ if(P) return P;
    let s=null; try{ s=localStorage.getItem(KLJUC); }catch(e){}
    let p=null; if(s){ try{ p=JSON.parse(s); }catch(e){ p=null; } }
    if(obj(p)) P=nadogradi(p);
    else { if(s){ try{ localStorage.setItem(KLJUC+'-pokvaren',s); }catch(e){} }   // nečitljiv profil sačuvaj, ne briši
      P=prenesiStaro(zadano()); spremi(); }
    return P; }
  function spremi(){ if(!P) return; try{ localStorage.setItem(KLJUC,JSON.stringify(P)); }catch(e){} }
  function reset(){ P=zadano(); spremi(); return P; }
  // statistika nakon utakmice: zbroj naše (plave) ekipe iz rezultata Utakmica.pokreni
  function upisiUtakmicu(r,nasi){ const p=ucitaj(), s=p.statistika; s.utakmice++; if(r.pobjeda) s.pobjede++;
    for(const ime of nasi){ const x=r.statistika.poIgracu[ime]; if(!x) continue;
      s.poeni+=x.poeni; s.trice+=x.trice; s.zakucavanja+=x.zakucavanja; s.kradje+=x.kradje; s.blokovi+=x.blokovi; }
    spremi(); }
  return {ucitaj, spremi, reset, upisiUtakmicu, zadano};
})();
