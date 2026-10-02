/* RetroAppLab · Fond sati: kalendar za odabir razdoblja
   Klik na mjesec u tablici otvori kalendar. Klik na početni i završni dan
   pokaže broj dana po danima u tjednu, radne dane, blagdane, subote i nedjelje. */
(function () {
  var m = location.pathname.match(/(20\d\d)/) ||
          (document.querySelector('tr.total-row td') || { textContent: '' }).textContent.match(/(20\d\d)/);
  if (!m) return;
  var GODINA = +m[1];
  var rows = document.querySelectorAll('tbody tr:not(.total-row)');
  if (rows.length !== 12) return;

  var MJESECI = ['Siječanj','Veljača','Ožujak','Travanj','Svibanj','Lipanj','Srpanj','Kolovoz','Rujan','Listopad','Studeni','Prosinac'];
  var MJ_GEN = ['siječnja','veljače','ožujka','travnja','svibnja','lipnja','srpnja','kolovoza','rujna','listopada','studenoga','prosinca'];
  var DANI = ['Pon','Uto','Sri','Čet','Pet','Sub','Ned'];

  /* ---------- hrvatski blagdani ---------- */
  function uskrs(y) {
    var a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4,
        f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30,
        i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, mm = Math.floor((a + 11 * h + 22 * l) / 451),
        mj = Math.floor((h + l - 7 * mm + 114) / 31), dan = ((h + l - 7 * mm + 114) % 31) + 1;
    return new Date(y, mj - 1, dan);
  }
  function kljuc(d) { return d.getMonth() + '-' + d.getDate(); }
  var BLAGDANI = {};
  (function () {
    var y = GODINA, u = uskrs(y);
    function dodaj(d, ime) { BLAGDANI[kljuc(d)] = ime; }
    function plus(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }
    dodaj(new Date(y, 0, 1), 'Nova godina');
    dodaj(new Date(y, 0, 6), 'Sveta tri kralja');
    dodaj(u, 'Uskrs');
    dodaj(plus(u, 1), 'Uskrsni ponedjeljak');
    dodaj(new Date(y, 4, 1), 'Praznik rada');
    dodaj(new Date(y, 4, 30), 'Dan državnosti');
    dodaj(plus(u, 60), 'Tijelovo');
    dodaj(new Date(y, 5, 22), 'Dan antifašističke borbe');
    dodaj(new Date(y, 7, 5), 'Dan pobjede i domovinske zahvalnosti');
    dodaj(new Date(y, 7, 15), 'Velika Gospa');
    dodaj(new Date(y, 10, 1), 'Svi sveti');
    dodaj(new Date(y, 10, 18), 'Dan sjećanja na žrtve Domovinskog rata');
    dodaj(new Date(y, 11, 25), 'Božić');
    dodaj(new Date(y, 11, 26), 'Sveti Stjepan');
  })();
  function danUTjednu(d) { return (d.getDay() + 6) % 7; } // 0 = ponedjeljak

  /* ---------- stil ---------- */
  var css = `
  tbody tr.fk-klik{cursor:pointer}
  tbody tr.fk-klik td:first-child::after{content:" 📅";font-size:.8em;opacity:.55}
  tbody tr.fk-klik:hover td{background:rgba(255,255,255,.04)}
  .fk-pozadina{position:fixed;inset:0;background:rgba(3,3,10,.72);z-index:999;display:flex;align-items:center;justify-content:center;padding:14px}
  .fk-panel{background:#100e22;border:1px solid rgba(0,242,254,.35);border-radius:14px;box-shadow:0 0 30px rgba(0,242,254,.15);
    width:100%;max-width:430px;max-height:94vh;overflow:auto;padding:16px 16px 18px;color:#f8fafc;font-family:inherit}
  .fk-vrh{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px}
  .fk-vrh h3{margin:0;font-size:1.15rem;color:#00f2fe}
  .fk-x{background:none;border:0;color:#94a3b8;font-size:1.5rem;cursor:pointer;line-height:1}
  .fk-uputa{color:#94a3b8;font-size:.85rem;margin:0 0 10px}
  .fk-mreza{display:grid;grid-template-columns:repeat(7,1fr);gap:4px}
  .fk-dn{text-align:center;font-size:.72rem;color:#94a3b8;padding:2px 0;font-weight:700}
  .fk-d{aspect-ratio:1;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.03);color:#f8fafc;border-radius:8px;
    font:600 .95rem inherit;cursor:pointer;display:flex;align-items:center;justify-content:center;position:relative;padding:0}
  .fk-d.vikend{color:#94a3b8}
  .fk-d.blagdan{color:#f59e0b;border-color:rgba(245,158,11,.5)}
  .fk-d.blagdan::after{content:"";position:absolute;bottom:4px;width:5px;height:5px;border-radius:50%;background:#f59e0b}
  .fk-d.u{background:rgba(0,242,254,.16);border-color:rgba(0,242,254,.4)}
  .fk-d.rub{background:#00f2fe;color:#04131a;border-color:#00f2fe}
  .fk-d:focus-visible{outline:2px solid #ff007f;outline-offset:1px}
  .fk-gumbi{display:flex;gap:6px;flex-wrap:wrap;margin:10px 0 4px}
  .fk-gumbi button{flex:1;min-width:110px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.15);color:#f8fafc;
    border-radius:8px;padding:7px 6px;font:600 .8rem inherit;cursor:pointer}
  .fk-gumbi button:hover{border-color:#00f2fe}
  .fk-rez{margin-top:12px;border-top:1px solid rgba(255,255,255,.1);padding-top:12px}
  .fk-razdoblje{font-weight:700;margin-bottom:8px}
  .fk-tjedan{display:grid;grid-template-columns:repeat(7,1fr);text-align:center;background:rgba(255,255,255,.04);border-radius:8px;padding:6px 0;margin-bottom:10px}
  .fk-tjedan span{display:block;font-size:.72rem;color:#94a3b8;font-weight:700}
  .fk-tjedan b{font-size:1.15rem}
  .fk-tjedan .vk b{color:#ff007f}
  .fk-red{display:flex;justify-content:space-between;padding:4px 0;font-size:.95rem}
  .fk-red b{font-variant-numeric:tabular-nums}
  .fk-red.glavni{font-size:1.05rem;color:#00f2fe}
  .fk-bl{font-size:.82rem;color:#f59e0b;margin:2px 0 0 0}
  .fk-kopiraj{margin-top:12px;width:100%;background:#ff007f;border:0;color:#fff;border-radius:8px;padding:9px;font:700 .9rem inherit;cursor:pointer}
  `;
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  /* ---------- kalendar ---------- */
  var mjesec = 0, odabran = [], pozadina = null;

  function datum(dan) { return new Date(GODINA, mjesec, dan); }
  function brojDana() { return new Date(GODINA, mjesec + 1, 0).getDate(); }
  function fmt(dan) { return dan + '. ' + MJ_GEN[mjesec]; }

  function otvori(i) {
    mjesec = i; odabran = [];
    pozadina = document.createElement('div');
    pozadina.className = 'fk-pozadina';
    pozadina.addEventListener('click', function (e) { if (e.target === pozadina) zatvori(); });
    document.body.appendChild(pozadina);
    crtaj();
    document.addEventListener('keydown', esc);
  }
  function zatvori() {
    if (pozadina) pozadina.remove(); pozadina = null;
    document.removeEventListener('keydown', esc);
  }
  function esc(e) { if (e.key === 'Escape') zatvori(); }

  function klikDan(d) {
    if (odabran.length !== 1) odabran = [d];
    else odabran = [Math.min(odabran[0], d), Math.max(odabran[0], d)];
    crtaj();
  }
  function postavi(a, b) { odabran = [a, b]; crtaj(); }

  function crtaj() {
    var n = brojDana(), prvi = danUTjednu(datum(1));
    var od = odabran[0], doo = odabran.length === 2 ? odabran[1] : odabran[0];
    var h = '<div class="fk-panel" role="dialog" aria-label="Kalendar ' + MJESECI[mjesec] + ' ' + GODINA + '">';
    h += '<div class="fk-vrh"><h3>' + MJESECI[mjesec] + ' ' + GODINA + '.</h3><button class="fk-x" aria-label="Zatvori">×</button></div>';
    h += '<p class="fk-uputa">' + (odabran.length === 0 ? 'Klikni početni dan razdoblja.' :
         odabran.length === 1 ? 'Klikni završni dan, ili odaberi brzi gumb ispod.' : 'Klikni bilo koji dan za novo razdoblje.') + '</p>';
    h += '<div class="fk-mreza">';
    DANI.forEach(function (x) { h += '<div class="fk-dn">' + x + '</div>'; });
    for (var p = 0; p < prvi; p++) h += '<div></div>';
    for (var d = 1; d <= n; d++) {
      var dt = datum(d), w = danUTjednu(dt), bl = BLAGDANI[kljuc(dt)];
      var kl = 'fk-d' + (w >= 5 ? ' vikend' : '') + (bl ? ' blagdan' : '');
      if (od && d >= od && d <= doo) kl += (d === od || d === doo) ? ' rub' : ' u';
      h += '<button class="' + kl + '" data-d="' + d + '"' + (bl ? ' title="' + bl + '"' : '') + '>' + d + '</button>';
    }
    h += '</div>';
    if (odabran.length === 1) {
      h += '<div class="fk-gumbi"><button data-brzo="kraj">' + od + '. → kraj mjeseca</button>' +
           '<button data-brzo="pocetak">1. → ' + od + '.</button></div>';
    } else if (odabran.length === 0) {
      h += '<div class="fk-gumbi"><button data-brzo="cijeli">Cijeli mjesec</button></div>';
    }
    if (od) h += rezultat(od, doo);
    h += '</div>';
    pozadina.innerHTML = h;

    pozadina.querySelector('.fk-x').onclick = zatvori;
    pozadina.querySelectorAll('.fk-d').forEach(function (b) { b.onclick = function () { klikDan(+b.dataset.d); }; });
    pozadina.querySelectorAll('[data-brzo]').forEach(function (b) {
      b.onclick = function () {
        var t = b.dataset.brzo;
        if (t === 'kraj') postavi(od, n); else if (t === 'pocetak') postavi(1, od); else postavi(1, n);
      };
    });
    var kop = pozadina.querySelector('.fk-kopiraj');
    if (kop) kop.onclick = function () {
      var txt = kop.dataset.tekst;
      (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(
        function () { kop.textContent = '✓ Kopirano'; },
        function () { window.prompt('Kopiraj tekst:', txt); });
    };
  }

  function rezultat(od, doo) {
    var poDanu = [0, 0, 0, 0, 0, 0, 0], radni = 0, blRadni = [], blVikend = [];
    for (var d = od; d <= doo; d++) {
      var dt = datum(d), w = danUTjednu(dt), bl = BLAGDANI[kljuc(dt)];
      poDanu[w]++;
      if (bl) (w < 5 ? blRadni : blVikend).push(d + '. ' + DANI[w].toLowerCase() + ' – ' + bl);
      else if (w < 5) radni++;
    }
    var ukupno = doo - od + 1;
    var h = '<div class="fk-rez"><div class="fk-razdoblje">' + fmt(od) + (od !== doo ? ' – ' + fmt(doo) : '') +
            ' ' + GODINA + '. <span style="color:#94a3b8;font-weight:400">(' + ukupno + (ukupno === 1 ? ' dan' : ' dana') + ')</span></div>';
    h += '<div class="fk-tjedan">';
    DANI.forEach(function (x, i) { h += '<div' + (i >= 5 ? ' class="vk"' : '') + '><span>' + x + '</span><b>' + poDanu[i] + '</b></div>'; });
    h += '</div>';
    h += '<div class="fk-red glavni"><span>Radni dani (pon–pet, bez blagdana)</span><b>' + radni + '</b></div>';
    h += '<div class="fk-red"><span>Blagdani na radni dan</span><b>' + blRadni.length + '</b></div>';
    blRadni.forEach(function (x) { h += '<div class="fk-bl">• ' + x + '</div>'; });
    h += '<div class="fk-red"><span>Subote</span><b>' + poDanu[5] + '</b></div>';
    h += '<div class="fk-red"><span>Nedjelje</span><b>' + poDanu[6] + '</b></div>';
    if (blVikend.length) {
      h += '<div class="fk-red"><span>Blagdani na vikend</span><b>' + blVikend.length + '</b></div>';
      blVikend.forEach(function (x) { h += '<div class="fk-bl">• ' + x + '</div>'; });
    }
    var tekst = 'Razdoblje: ' + od + '.' + (mjesec + 1) + '.–' + doo + '.' + (mjesec + 1) + '.' + GODINA + '. (' + ukupno + ' dana)\n' +
      DANI.map(function (x, i) { return x + ' ' + poDanu[i]; }).join(', ') + '\n' +
      'Radni dani (pon–pet): ' + radni + '\nBlagdani na radni dan: ' + blRadni.length +
      '\nSubote: ' + poDanu[5] + '\nNedjelje: ' + poDanu[6];
    h += '<button class="fk-kopiraj" data-tekst="' + tekst.replace(/"/g, '&quot;') + '">Kopiraj rezultat</button></div>';
    return h;
  }

  /* ---------- klik na mjesec u tablici ---------- */
  rows.forEach(function (r, i) {
    r.classList.add('fk-klik');
    r.setAttribute('tabindex', '0');
    r.setAttribute('title', 'Otvori kalendar za ' + MJESECI[i].toLowerCase());
    r.addEventListener('click', function () { otvori(i); });
    r.addEventListener('keydown', function (e) { if (e.key === 'Enter') otvori(i); });
  });
})();
