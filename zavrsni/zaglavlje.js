// Zajedničko zaglavlje i podnožje za Obračune (Završni račun, DOH, Neprofitne).
// Uključuje se na kraju <body>:
//   <script src="…/zaglavlje.js" data-app="Neprofitne" data-verzija="2026-11-07"></script>
// - računa visine fiksnog zaglavlja (vidi zaglavlje.css)
// - umeće isto podnožje na kraj stranice
(function () {
  'use strict';
  const me = document.currentScript;
  const app = (me && me.dataset.app) || 'Obračuni';
  const ver = (me && me.dataset.verzija) || '';
  const root = document.documentElement;
  const mob = window.matchMedia('(max-width:699.98px)');

  // --- fiksno zaglavlje ---
  const traka = document.querySelector('[data-zg="traka"]');
  const gumbi = document.querySelector('[data-zg="gumbi"]');
  const blok = document.querySelector('[data-zg="blok"]');
  function izracunaj() {
    if (traka) root.style.setProperty('--zg-h1', traka.offsetHeight + 'px');
    if (gumbi) root.style.setProperty('--zg-h2', gumbi.offsetHeight + 'px');
    if (blok) {
      // tamna traka, red s gumbima i kartice su zasebno ljepljivi: visine, boja i crta iz zaglavlja
      const cs = getComputedStyle(blok), g = blok.querySelector('[data-zg-gumbi]');
      root.style.setProperty('--zg-bg', cs.backgroundColor);
      root.style.setProperty('--zg-crta', cs.borderBottomColor);
      if (g) root.style.setProperty('--zg-h2', g.offsetHeight + 'px');
      const t = blok.querySelector('[data-zg-traka]');
      if (t) root.style.setProperty('--zg-h1', t.offsetHeight + 'px');
    }
  }
  if (traka || gumbi || blok) {
    izracunaj();
    if (window.ResizeObserver) {
      const ro = new ResizeObserver(izracunaj);
      [traka, gumbi, blok, blok && blok.querySelector('[data-zg-gumbi]'), blok && blok.querySelector('[data-zg-traka]')].forEach(el => { if (el) ro.observe(el); });
    }
    window.addEventListener('resize', izracunaj);
    if (mob.addEventListener) mob.addEventListener('change', izracunaj);
  }

  // --- podnožje ---
  if (document.querySelector('.obr-podnozje')) return;
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text) e.textContent = text; return e; };
  const link = (href, text) => { const a = el('a', '', text); a.href = href; return a; };
  const f = el('footer', 'obr-podnozje'); f.setAttribute('role', 'contentinfo');
  const inn = el('div', 'obr-pod-in');
  const l = el('div', 'obr-pod-l');
  l.append(el('strong', '', 'RetroAppLab Obračuni'), el('small', '', 'Podaci klijenata obrađuju se lokalno na vašem računalu i ne šalju se na server.'));
  const s = el('nav', 'obr-pod-s'); s.setAttribute('aria-label', 'Obračuni');
  s.append(link('/zavrsni/', 'Izbornik'), ' · ', link('/kontakt.html', 'Kontakt'), ' · ', link('/privatnost.html', 'Pravila privatnosti'));
  const d = el('div', 'obr-pod-d');
  d.append(el('span', '', 'Licence: PSP net d.o.o., Dubrovnik'), el('small', '', app + (ver ? ', verzija ' + ver : '')));
  inn.append(l, s, d); f.append(inn);
  document.body.append(f);
})();
