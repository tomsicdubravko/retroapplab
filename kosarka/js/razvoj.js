// ===== Košarka 2 na 2 - razvojni panel (samo za testiranje): tipka ` ili 5 dodira na naslov izbornika =====
'use strict';
const Razvoj=(()=>{
  const el=document.createElement('div'); el.id='devOv'; el.className='hidden';
  el.innerHTML=`<div class="dev"><div class="devHead"><b>RAZVOJ · profil</b><button data-a="zatvori" aria-label="Zatvori">✕</button></div>
    <pre id="devJson"></pre>
    <div class="devBtns"><button data-a="novcici">+1000 novčića</button><button data-a="osobine">+10 svim osobinama</button><button data-a="reset" class="danger">Reset profila</button></div>
    <div class="devBtns"><select id="devBot">${BOTOVI.map(b=>`<option value="${b.id}">${b.ime} · ${BOT_TIPOVI[b.tip].ime} · ${BOT_RIJETKOSTI[b.rijetkost].ime}</option>`).join('')}</select>
      <button data-a="botOtk">Otključaj</button><button data-a="botZak">Zaključaj</button><button data-a="botRaz">Razina +1</button><button data-a="botSvi">Otključaj sve</button></div>
    <small>Samo za testiranje. Reset briše REP, rivale, rekorde trica i statistiku u profilu.</small></div>`;
  document.body.appendChild(el);
  let potvrda=0;
  function prikazi(){ $('devJson').textContent=JSON.stringify(Profil.ucitaj(),null,2); }
  function otvori(){ potvrda=0; el.querySelector('[data-a=reset]').textContent='Reset profila'; prikazi(); el.classList.remove('hidden'); }
  function zatvori(){ el.classList.add('hidden'); }
  const toggle=()=>el.classList.contains('hidden')?otvori():zatvori();
  el.addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b){ if(e.target===el) zatvori(); return; }
    const p=Profil.ucitaj(), a=b.dataset.a;
    if(a==='zatvori') return zatvori();
    // botovi suigrači (Dre ostaje otključan)
    const bs=id=>p.botovi[id]||(p.botovi[id]={otkljucan:false,naljepnice:0,razina:1}), id=$('devBot').value;
    if(a==='botOtk') bs(id).otkljucan=true;
    if(a==='botZak'&&id!==BOT_POCETNI) bs(id).otkljucan=false;
    if(a==='botRaz') bs(id).razina=bs(id).razina>=BOT_MAX_RAZINA?1:bs(id).razina+1;
    if(a==='botSvi') BOTOVI.forEach(x=>bs(x.id).otkljucan=true);
    if(a.startsWith('bot')){ Profil.spremi(); Karijera.osvjezi(); }
    if(a==='novcici'){ p.novcici+=1000; Profil.spremi(); }
    if(a==='osobine'){ for(const k in p.igrac.osobine) p.igrac.osobine[k]=Math.min(100,p.igrac.osobine[k]+10); Profil.spremi(); }
    if(a==='reset'){ if(!potvrda){ potvrda=1; b.textContent='Sigurno? Klikni opet'; return; } potvrda=0; b.textContent='Reset profila'; Profil.reset(); Karijera.osvjezi(); }
    prikazi(); });
  addEventListener('keydown',e=>{ if(e.repeat) return; if(e.key==='`'||e.code==='Backquote'){ e.preventDefault(); toggle(); } else if(e.key==='Escape'&&!el.classList.contains('hidden')) zatvori(); });
  // 5 dodira na naslov izbornika unutar 2 s
  let taps=[]; const h=document.querySelector('#menu h1');
  if(h) h.addEventListener('pointerdown',()=>{ const t=performance.now(); taps=taps.filter(x=>t-x<2000); taps.push(t); if(taps.length>=5){ taps=[]; otvori(); } });
  return {otvori,zatvori};
})();
