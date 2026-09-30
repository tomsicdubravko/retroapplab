// ===== KVART KINGS - splash uvod (učitava se odmah ispod #splash, da se vidi dok se igra učitava) =====
'use strict';
// naslov je IME_IGRE (ime-igre.js), ostali tekstovi idu preko T() (tekstovi.js); slika nema natpis, naslov se crta ovdje

// Splash.spremno() poziva main.js kad je igra učitana. Tijek (s): 0–1 izron iz crnog + zum, 1–1.6 neon kruna se pali,
// 1.6–2.2 naslov udari, 2.2–2.8 podnaslov, 3.0 TAP TO PLAY (ili linija napretka dok igra nije spremna).
const Splash=(()=>{
  const el=document.getElementById('splash');
  const $s=c=>el.querySelector(c);
  const zoom=$s('.sp-zoom'), img=$s('.sp-img'), glow=$s('.sp-glow'), crno=$s('.sp-crno'), sadrzaj=$s('.sp-sadrzaj');
  const naslov=$s('.sp-naslov'), pod=$s('.sp-pod'), tap=$s('.sp-tap'), bar=$s('.sp-bar'), barI=$s('.sp-bar i');
  const SLIKE={landscape:{src:'img/splash-landscape.webp',x:0.44,y:0.73}, portrait:{src:'img/splash-portrait.webp',x:0.34,y:0.75}};
  const mirno=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const KRAJ_UVODA=3.0;
  let t0=null, spremna=false, gotovo=false, izlaz=false, napredak=0, zadnji=performance.now(), vrsta=null;

  // svaka riječ imena u svom retku (KVART / KINGS)
  for(const r of IME_IGRE.split(' ')){ const s=document.createElement('span'); s.textContent=r; naslov.appendChild(s); }
  el.setAttribute('aria-label',IME_IGRE);
  pod.textContent=T('splash.podnaslov');
  $s('.sp-tap b').textContent=T('splash.tap');
  $s('.sp-tap small').textContent=matchMedia('(hover:hover) and (pointer:fine)').matches?T('splash.tipka'):'';
  // obje slike se učitaju odmah, da promjena orijentacije ne čeka mrežu
  for(const k in SLIKE){ const i=new Image(); i.src=SLIKE[k].src; SLIKE[k].img=i; }

  // cover: slika prekriva ekran, višak se odreže; kruna je u postocima slike → pikseli ekrana
  function rasporedi(){
    const W=innerWidth, H=innerHeight, v=W>=H?'landscape':'portrait', S=SLIKE[v];
    if(v!==vrsta){ vrsta=v; img.src=S.src; }
    const iw=S.img.naturalWidth||(v==='landscape'?1920:1080), ih=S.img.naturalHeight||(v==='landscape'?1072:1920);
    const sc=Math.max(W/iw,H/ih), dw=iw*sc, dh=ih*sc, ox=(W-dw)/2, oy=(H-dh)/2;
    const d=Math.min(dw,dh)*0.25;   // promjer sjaja
    glow.style.width=glow.style.height=d+'px';
    glow.style.left=(ox+S.x*dw-d/2)+'px'; glow.style.top=(oy+S.y*dh-d/2)+'px'; }
  addEventListener('resize',rasporedi); addEventListener('orientationchange',rasporedi);
  rasporedi();

  const ease=x=>1-Math.pow(1-clamp01(x),3), clamp01=x=>Math.max(0,Math.min(1,x));
  // neon se pali: kratki treptaji (vrijeme od 1.0 s → sjaj), pa stabilno disanje
  const TREPTAJ=[[0,0],[0.05,0.9],[0.1,0.1],[0.2,1],[0.26,0.15],[0.36,1],[0.42,0.45],[0.6,1]];
  function neon(t){ if(t<0) return 0; if(t>=0.6) return 0.86+0.14*Math.sin((t-0.6)*2.9);
    for(let i=1;i<TREPTAJ.length;i++) if(t<TREPTAJ[i][0]){ const [a,va]=TREPTAJ[i-1], [b,vb]=TREPTAJ[i]; return va+(vb-va)*(t-a)/(b-a); } return 1; }

  function crtaj(t){
    if(mirno){ const f=clamp01(t/0.6);   // bez zuma, treptanja i trzaja: samo kratki fade-in
      crno.style.opacity=1-f; zoom.style.transform='scale(1.02)'; glow.style.opacity=f*0.9;
      naslov.style.opacity=pod.style.opacity=f; naslov.style.transform=pod.style.transform='none'; naslov.style.filter='none'; }
    else {
      crno.style.opacity=1-ease(t/1.0);
      // 1.08 → 1.0 u prvoj sekundi, pa vrlo sporo dalje (sve × 1.02, da se rubovi slike nikad ne vide)
      const s=t<1?1.08-0.08*ease(t):Math.max(0.98,1-0.004*(t-1));
      zoom.style.transform=`scale(${(s*1.02).toFixed(4)})`;
      glow.style.opacity=neon(t-1.0);
      // naslov udari: scale 1.3 → 1, blur → 0, pa mali trzaj ekrana
      const n=clamp01((t-1.6)/0.3), ne=ease(n);
      naslov.style.opacity=clamp01(n*2.5); naslov.style.transform=`scale(${1.3-0.3*ne})`; naslov.style.filter=n<1?`blur(${(1-ne)*14}px)`:'none';
      const tr=t-1.9; sadrzaj.style.transform=tr>0&&tr<0.3?`translate(${Math.sin(tr*90)*7*(1-tr/0.3)}px,${Math.cos(tr*70)*5*(1-tr/0.3)}px)`:'none';
      const p=ease((t-2.2)/0.6); pod.style.opacity=p; pod.style.transform=`translateY(${(1-p)*14}px)`; }
    // kraj uvoda: TAP TO PLAY kad je igra spremna, inače tanka linija napretka
    const kraj=t>=(mirno?0.8:KRAJ_UVODA);
    tap.classList.toggle('on',kraj&&spremna); bar.classList.toggle('on',kraj&&!spremna); }

  function petlja(now){ if(gotovo) return; requestAnimationFrame(petlja);
    const dt=(now-zadnji)/1000; zadnji=now;
    // napredak nije poznat točno: linija se približava kraju, a do kraja skoči kad je igra spremna
    napredak=spremna?1:napredak+(0.92-napredak)*Math.min(1,dt*0.7); barI.style.width=(napredak*100)+'%';
    if(t0==null) return; crtaj((now-t0)/1000); }
  requestAnimationFrame(petlja);
  // uvod kreće kad je slika tu (najkasnije nakon 2 s, da crni ekran ne visi)
  const kreni=()=>{ if(t0==null){ t0=performance.now(); el.classList.add('krenuo'); } };
  if(img.complete&&img.naturalWidth) kreni(); else { img.addEventListener('load',kreni,{once:true}); img.addEventListener('error',kreni,{once:true}); setTimeout(kreni,2000); }

  function vrijeme(){ return t0==null?0:(performance.now()-t0)/1000; }
  // dodir ili tipka: tijekom uvoda preskoči na kraj, poslije (kad je igra spremna) uđi u izbornik
  function akcija(e){ if(gotovo) return;
    e.preventDefault(); e.stopImmediatePropagation();
    if(izlaz) return;
    if(vrijeme()<(mirno?0.8:KRAJ_UVODA)){ kreni(); t0=performance.now()-KRAJ_UVODA*1000; return; }
    if(!spremna) return;
    izlaz=true; try{ audio(); sfx.swish(); }catch(_){}
    el.classList.add('izlaz'); setTimeout(()=>{ gotovo=true; el.remove(); },400); }
  // hvatanje prije ostalih slušača (kontrole, razvojni panel), dok je splash na ekranu
  addEventListener('keydown',e=>{ if(!gotovo&&!e.repeat) akcija(e); else if(!gotovo) e.stopImmediatePropagation(); },true);
  el.addEventListener('click',akcija);
  el.addEventListener('pointerdown',e=>e.preventDefault());
  addEventListener('keyup',e=>{ if(!gotovo) e.stopImmediatePropagation(); },true);

  function spremno(){ spremna=true; }
  return {spremno, get aktivan(){ return !gotovo; }};
})();
