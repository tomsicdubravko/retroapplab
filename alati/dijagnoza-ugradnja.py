# Ugradnja Financijske dijagnoze u PWA "Obračuni": /zavrsni/dijagnoza/index.html
# Upotreba: python3 alati/dijagnoza-ugradnja.py <nova financijska-dijagnoza/index.html> zavrsni/dijagnoza/index.html [verzija]
# Logika i izračuni aplikacije ostaju isti. Dodaje se: manifest i ikone PWA-a, prijava i licenca kao u neprofitne.html
# (isti Supabase projekt, ista sesija, ista oznaka računala zr-device-id, check_licence bez programa = licenca 'zavrsni'),
# ujednačeno zaglavlje (tamna traka s naslovom i gumbom „← Izbornik”, učitana tvrtka, traka licence; bijela traka
# s gumbima Jednostavno/Detaljno) i zajedničko podnožje (zaglavlje.js). SheetJS (xlsx 0.18.5) učitava se iz gfi/vendor/ umjesto s cdnjs.
# Demo bez prijave (kao Završni): bez licence stranica radi u demo načinu (3. redak „Demo način · Prijava”, traka iznad aplikacije).
# U demo načinu radi samo „Učitaj DEMO podatke” (izmišljena tvrtka) i sve iz toga: semafor, grafikoni, prognoza i klizači, dijagnoza,
# Jednostavno/Detaljno, kontrola DEMO izračuna i ispis. Učitavanje GFI datoteka (i povlačenjem), ručni unos, izmjene u tablici
# provjere, učitavanje i spremanje analize (.json) i preuzimanje DEMO GFI datoteka su sivi i javljaju poruku o licenci; lokalno
# spremljena analiza licenciranog korisnika se ne nudi. Ograničenja su u zasebnom bloku (DEMO_JS) koji presreće događaje
# prije aplikacije, pa logika i izračuni ostaju isti. Nakon prijave s licencom sve radi bez ponovnog učitavanja; odjava
# ponovno učitava stranicu (u memoriji ne ostaju podaci licenciranog korisnika) i vraća demo.
# Spremljena analiza u pregledniku vezana je uz prijavljenog korisnika: ključ 'fd-analiza-v1:' + Supabase ID korisnika
# (window.fdKorisnik, postavlja ga blok za prijavu tek nakon važeće licence). „Nastavi tu analizu” nudi se samo korisniku koji
# ju je spremio, a „Obriši sve spremljene podatke” briše samo njegovu analizu. Stari ključ bez korisnika se ne nudi.
# Financijski podaci i dalje se obrađuju samo u pregledniku; u Supabase ide samo prijava i provjera licence.
import sys, datetime
src, out = sys.argv[1:3]
VER = sys.argv[3] if len(sys.argv) > 3 else datetime.date.today().isoformat()  # verzija u podnožju
s = open(src, encoding='utf-8').read()

def rep(a, b):
    global s
    assert s.count(a) == 1, (a[:80], s.count(a))
    s = s.replace(a, b)

HEAD = '''<meta name="robots" content="noindex">
<meta name="theme-color" content="#182c46">
<link rel="manifest" href="../manifest.webmanifest">
<link rel="icon" type="image/png" sizes="32x32" href="../icons/favicon-32.png">
<link rel="apple-touch-icon" href="../icons/apple-touch-icon.png">
<link rel="stylesheet" href="../zaglavlje.css">
'''
rep('<title>Financijska dijagnoza – RetroAppLab</title>\n', '<title>Financijska dijagnoza – analiza GFI-POD | Obračuni</title>\n' + HEAD)
# xlsx iz gfi/vendor/ (ista verzija 0.18.5 kao na cdnjs i u Završnom računu)
rep('<script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>', '<script src="../gfi/vendor/xlsx.full.min.js"></script>')
# spremljena analiza po korisniku: ključ ovisi o prijavljenom korisniku (samo ključ pohrane, izračuni ostaju isti)
import re
assert len(re.findall(r'\bSKEY\b', s)) == 6, 'SKEY'
s = re.sub(r'\bSKEY\b', 'SKEY_KEY()', s)
rep("const SKEY_KEY()='fd-analiza-v1';", "// spremljena analiza vezana je uz prijavljenog korisnika (window.fdKorisnik postavlja blok za prijavu nakon važeće licence)\nconst SKEY_KEY=()=>'fd-analiza-v1:'+(window.fdKorisnik||'bez-prijave');")
rep("renderSlots(); offerRestore(); updateButtons();", "renderSlots(); offerRestore(); updateButtons();\nwindow.fdOfferRestore = offerRestore; // ponuda spremljene analize nakon prijave (blok za prijavu)")

# --- zaglavlje (izgled iz zaglavlje.css; boje iste i u tamnom načinu) ---
rep('html{scroll-padding-top:calc(env(safe-area-inset-top,0px) + 64px)}\n', '')
rep('body::before{content:"";position:fixed;inset:0 0 auto;height:env(safe-area-inset-top,0px);z-index:10;background:var(--head2)}',
    'body::before{content:"";position:fixed;inset:0 0 auto;height:env(safe-area-inset-top,0px);z-index:40;background:#182c46}')
rep('''header.top{position:sticky;top:env(safe-area-inset-top,0px);z-index:6;background:linear-gradient(180deg,var(--head),var(--head2));color:var(--headtext)}
header .wrap{display:flex;align-items:center;justify-content:space-between;gap:10px;min-height:54px}
header .brand{font-weight:700;font-size:1.05rem}
header .brand small{display:block;font-weight:400;color:var(--headmuted);font-size:.78rem;line-height:1.1}
header nav{display:flex;gap:6px}
header nav button{background:transparent;border:1px solid rgba(255,255,255,.25);color:var(--headtext)}
header nav button[aria-pressed="true"]{background:#fff;color:var(--head2);border-color:#fff}
''', '''/* Zaglavlje i podnožje kao u ostalim obračunima (DOH, Završni, Neprofitne): ../zaglavlje.css i ../zaglavlje.js.
   Boje su iste i u tamnom načinu. Tamna traka i gumbi su ljepljivi; na mobitelu ostaju samo gumbi. */
html{scroll-padding-top:calc(env(safe-area-inset-top,0px) + var(--zg-h1,0px) + var(--zg-h2,0px) + 8px)}
html header.top[data-zg="blok"] [data-zg-traka]{top:env(safe-area-inset-top,0px)}
html header.top[data-zg="blok"] [data-zg-gumbi]{top:calc(env(safe-area-inset-top,0px) + var(--zg-h1,0px))}
html header.top[data-zg="blok"] [data-zg-gumbi] button[aria-pressed="true"]{background:#213b5a;border-color:#213b5a;color:#fff;font-weight:700}
@media (max-width:699.98px){
  html{scroll-padding-top:calc(env(safe-area-inset-top,0px) + var(--zg-h2,0px) + 8px)}
  html header.top[data-zg="blok"] [data-zg-gumbi]{top:env(safe-area-inset-top,0px)}
}
/* Prijava i licenca (kao u neprofitne.html); bez licence radi demo način (fd-demo), dok se licenca provjerava aplikacija se ne prikazuje */
body:not(.fd-lic):not(.fd-demo) main{display:none}
/* Demo način: traka iznad aplikacije, sivi gumbi za vlastite podatke, poruka o licenci */
.fd-demo-traka,.fd-demo-poruka{display:none}
body.fd-demo .fd-demo-traka{display:block;margin:0 0 14px;padding:10px 14px;border-radius:10px;background:var(--ybg);color:var(--text);border:1px solid var(--line);font-size:.95rem}
body.fd-demo .fd-demo-poruka{display:block;margin:10px 0 0;font-size:.9rem;color:var(--muted)}
.fd-demo-traka button,.fd-demo-poruka a{background:none;border:0;padding:0;font:inherit;font-weight:700;color:var(--accent);text-decoration:underline;cursor:pointer}
body.fd-demo :is(label.slot,#btnManual,label[for="jsonIn"],[data-demo-year],#btnSave,#manualBox){opacity:.45;cursor:not-allowed}
body.fd-demo :is(label.slot,label[for="jsonIn"]) *{cursor:not-allowed}
body.fd-demo #dataTbl :is(input,select){pointer-events:none;background:transparent}
body.fd-demo #storeLine{display:none}
#fdToast{position:fixed;left:50%;bottom:calc(16px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:90;max-width:min(560px,calc(100% - 24px));padding:12px 16px;border-radius:10px;background:#182c46;color:#fff;font-size:.92rem;box-shadow:0 8px 28px rgba(0,0,0,.3)}
#fdToast a{color:#fff;font-weight:700}
#fdToast[hidden]{display:none}
.obr-traka .lic .src{font:inherit}
#gate{position:fixed;inset:0;z-index:100;background:var(--bg);display:grid;place-items:center;padding:16px;overflow-y:auto}
#gate[hidden]{display:none}
.gatecard{background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:26px 28px;width:min(400px,100%);display:flex;flex-direction:column;gap:10px;box-shadow:0 12px 40px rgba(0,0,0,.18)}
.gatecard img{align-self:center;border-radius:14px}
.gatecard h2{text-align:center;font-size:20px;margin:0}
.gatecard .lead{text-align:center;margin:0;color:var(--muted)}
.gatecard label{display:flex;flex-direction:column;gap:4px;font-size:13px;color:var(--muted)}
.gatecard input{border:1px solid var(--inline);background:var(--inbg);color:var(--text);border-radius:6px;padding:9px 10px;font-size:15px}
.gatecard input:focus{outline:none;border-color:var(--accent)}
.gatecard .gbtn{justify-content:center;padding:10px;font-size:15px;background:var(--accent);border-color:var(--accent);color:var(--onaccent)}
.gatecard .glink{align-self:center;background:none;border:0;padding:0;font:inherit;font-size:13px;color:var(--accent);text-decoration:underline;cursor:pointer}
.gatecard .note{font-size:12.5px;color:var(--muted);text-align:center;margin:4px 0 0}
.gatecard .gerr{margin:0;padding:6px 10px;border-radius:8px;background:var(--rbg);color:var(--r);font-size:13.5px;font-weight:600}
.gatecard .gok{margin:0;color:var(--g);font-weight:600}
.gatecard .gback{align-self:center;font-size:13px;color:var(--muted)}
''')
rep('footer{color:var(--muted);font-size:.84rem;text-align:center;padding:8px 0 30px}\n', '.fd-lokalno{color:var(--muted);font-size:.84rem;text-align:center;padding:8px 0 30px}\n')
rep('  header nav button{padding:6px 9px;font-size:.82rem}\n', '')
rep('''<header class="top">
  <div class="wrap">
    <div class="brand">Financijska dijagnoza<small>RetroAppLab Tools</small></div>
    <nav class="noprint" aria-label="Pogled">
      <button type="button" id="vSimple" aria-pressed="true">Jednostavno</button>
      <button type="button" id="vDetail" aria-pressed="false">Detaljno</button>
    </nav>
  </div>
</header>''', '''<header class="top" data-zg="blok">
  <div class="obr-traka" data-zg-traka>
    <div class="obr-r1"><div class="obr-naslov">Financijska dijagnoza – analiza GFI-POD</div><a class="obr-izbornik" href="/zavrsni/">← Izbornik</a></div>
    <p class="obr-r2"><span id="zgTvrtka" class="empty">Tvrtka još nije učitana</span></p>
    <p class="lic obr-r3" id="hLic"></p>
  </div>
  <div class="obr-gumbi noprint" data-zg-gumbi role="group" aria-label="Pogled">
    <button type="button" id="vSimple" aria-pressed="true">Jednostavno</button>
    <button type="button" id="vDetail" aria-pressed="false">Detaljno</button>
  </div>
</header>''')
# napomena i gumb za brisanje ostaju na dnu aplikacije, iznad zajedničkog podnožja (zaglavlje.js)
rep('''  <footer>Sve se obrađuje u ovom pregledniku. Izvještaji se nikamo ne šalju. <button type="button" id="btnWipe" class="noprint" style="font-size:.8rem;padding:3px 9px;margin-left:6px">Obriši sve spremljene podatke</button></footer>''',
    '''  <div class="fd-lokalno noprint">Sve se obrađuje u ovom pregledniku. Izvještaji se nikamo ne šalju. <button type="button" id="btnWipe" class="noprint" style="font-size:.8rem;padding:3px 9px;margin-left:6px">Obriši sve spremljene podatke</button></div>''')

# --- 2. redak tamne trake: učitana tvrtka (samo prikaz) ---
rep("    if(scroll) $('results').scrollIntoView({behavior:'smooth'}); return;\n  }",
    "    zgTvrtka(); if(scroll) $('results').scrollIntoView({behavior:'smooth'}); return;\n  }")
rep("  renderCharts(); renderPatterns(); renderForecast(); renderDetail(); renderTest();\n  if(scroll) $('results').scrollIntoView({behavior:'smooth'});\n}",
"""  renderCharts(); renderPatterns(); renderForecast(); renderDetail(); renderTest();
  if(scroll) $('results').scrollIntoView({behavior:'smooth'});
  zgTvrtka();
}
// 2. redak tamne trake: učitana tvrtka (naziv · OIB · godine), samo prikaz
function zgTvrtka(){
  const el=$('zgTvrtka'); if(!el) return;
  if(!A){ el.textContent='Tvrtka još nije učitana'; el.className='empty'; return; }
  const ys=A.years||[], dio=[A.firma||'Tvrtka bez naziva'];
  if(!A.demo){
    if(A.oib) dio.push('OIB '+A.oib);
    if(ys.length) dio.push(ys[0]+'.'+(ys.length>1?'–'+ys[ys.length-1]+'.':''));
  }
  el.textContent = dio.join(' · ') + (ys.length && ys.length<3 ? ' · djelomična analiza' : '');
  el.className='';
}""")
rep("function resetAll(){ ds=null; A=null; analyzed=false; slots=[null,null,null]; fcBase=null; renderSlots(); $('results').classList.add('hidden'); $('check').classList.add('hidden'); $('demoBanner').classList.add('hidden'); updateButtons(); }",
    "function resetAll(){ ds=null; A=null; analyzed=false; slots=[null,null,null]; fcBase=null; renderSlots(); $('results').classList.add('hidden'); $('check').classList.add('hidden'); $('demoBanner').classList.add('hidden'); updateButtons(); zgTvrtka(); }")

# --- demo bez prijave: traka iznad aplikacije i poruka o licenci uz gumbe ---
rep('<main class="wrap">\n', '<main class="wrap">\n  <div class="fd-demo-traka noprint" role="note">DEMO način – prikaz s izmišljenom tvrtkom. Za analizu vlastitih klijenata prijavite se. <button type="button" data-fd-prijava>Prijava</button></div>\n')
rep('<label class="btn" for="jsonIn">Učitaj spremljenu analizu<input type="file" id="jsonIn" accept=".json,application/json" class="hidden"></label>\n    </div>',
    '<label class="btn" for="jsonIn">Učitaj spremljenu analizu<input type="file" id="jsonIn" accept=".json,application/json" class="hidden"></label>\n    </div>\n    <p class="fd-demo-poruka noprint">Za učitavanje vlastitih GFI izvještaja potrebna je licenca za Završni račun. Kontakt: <a href="/kontakt.html">retroapplab.com/kontakt.html</a></p>')
# ograničenja demo načina u zasebnom bloku: presreće događaje (na window, u fazi hvatanja) prije aplikacije; logiku ne mijenja
DEMO_JS = r"""// ---------- Demo način bez licence: radi samo „Učitaj DEMO podatke” (izmišljena tvrtka) ----------
(function () {
'use strict';
const isDemo = () => document.body.classList.contains('fd-demo');
// sve što bi u aplikaciju unijelo vlastite podatke: GFI datoteke, ručni unos, tablica provjere, .json analiza, preuzimanje DEMO GFI-ja, spremljena analiza
const ZAK = 'label.slot, input[data-slot], [data-clear], [data-id-ok], [data-year-ok], #btnManual, #btnManualGo, #manualBox, label[for="jsonIn"], #jsonIn, [data-demo-year], #btnSave, #btnRestore, #btnRestoreDel, #dataTbl input, #dataTbl select';
const PORUKA = 'Za učitavanje vlastitih GFI izvještaja potrebna je licenca za Završni račun. Kontakt: ';
let toast = null, tt = 0;
function poruka() {
  if (!toast) {
    toast = document.createElement('div'); toast.id = 'fdToast'; toast.className = 'noprint'; toast.setAttribute('role', 'status'); toast.hidden = true;
    const a = document.createElement('a'); a.href = '/kontakt.html'; a.textContent = 'retroapplab.com/kontakt.html';
    toast.append(PORUKA, a); document.body.append(toast);
  }
  toast.hidden = false; clearTimeout(tt); tt = setTimeout(() => { toast.hidden = true; }, 6000);
}
const zakljucano = (t) => t && t.closest && t.closest(ZAK);
const stop = (e) => { e.preventDefault(); e.stopImmediatePropagation(); poruka(); };
window.addEventListener('click', (e) => { if (isDemo() && zakljucano(e.target)) stop(e); }, true);
window.addEventListener('change', (e) => { if (isDemo() && zakljucano(e.target)) { if (e.target.type === 'file') e.target.value = ''; stop(e); } }, true);
window.addEventListener('input', (e) => { if (isDemo() && zakljucano(e.target)) stop(e); }, true);
window.addEventListener('keydown', (e) => { if (isDemo() && zakljucano(e.target) && (e.key === 'Enter' || e.key === ' ')) stop(e); }, true);
window.addEventListener('focusin', (e) => { if (isDemo() && e.target.closest && e.target.closest('#dataTbl') && /^(INPUT|SELECT)$/.test(e.target.tagName)) e.target.blur(); }, true);
// povlačenje datoteke na stranicu ne smije ništa učitati
['dragover', 'drop'].forEach((t) => window.addEventListener(t, (e) => { if (!isDemo()) return; e.preventDefault(); e.stopImmediatePropagation(); if (e.dataTransfer) e.dataTransfer.dropEffect = 'none'; if (t === 'drop') poruka(); }, true));
document.addEventListener('click', (e) => { const b = e.target.closest && e.target.closest('[data-fd-prijava]'); if (b && window.fdPrijava) window.fdPrijava(); });
})();"""

# --- prijava i licenca (prepisano iz neprofitne.html / zavrsni/gfi/index.html, u zasebnom opsegu) ---
LIC = r'''<script src="../gfi/vendor/supabase.js"></script>
<script>
// ---------- Prijava i licenca (kao u neprofitne.html; licenca za Završni račun) ----------
(function () {
'use strict';
const SB_URL = 'https://fctpplyerzmvcjjmiwkx.supabase.co';
const SB_KEY = 'sb_publishable_2MPQsSTjBt-_K7sX-ANNJg_MmSpoK5X';
const LIC = { ok: false, demo: false, until: null, days: null, email: '', uid: '', checkedAt: 0 };
let sbClient = null, IS_ADMIN = false;
function h(tag, attrs, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (k === 'class') el.className = v;
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const c of kids.flat()) if (c != null) el.append(c);
  return el;
}
function deviceId() {
  let id = null;
  try { id = localStorage.getItem('zr-device-id'); } catch (e) {}
  if (!id || id.length < 32) {
    const a = new Uint8Array(16); crypto.getRandomValues(a);
    id = Array.from(a, b => b.toString(16).padStart(2, '0')).join('');
    try { localStorage.setItem('zr-device-id', id); } catch (e) {}
  }
  return id;
}
const LIC_MSG = {
  no_licence: 'Za ovaj korisnički račun nema aktivne licence.',
  expired: 'Licenca je istekla. Za produženje se javite putem retroapplab.com.',
  other_device: 'Licenca je već aktivirana na drugom računalu. Za prijenos licence na ovo računalo javite se podršci putem retroapplab.com.',
  bad_device: 'Ovo računalo nije moguće prepoznati. Javite se podršci.',
  not_logged_in: 'Prijava je istekla, prijavite se ponovno.',
  offline: 'Za rad je potrebna internetska veza. Provjerite vezu i pokušajte ponovno.',
};
async function checkLicence() {
  if (!navigator.onLine) return { ok: false, reason: 'offline' };
  try {
    const { data, error } = await sbClient.rpc('check_licence', { p_device: deviceId() });
    if (error) return { ok: false, reason: /JWT|auth/i.test(error.message || '') ? 'not_logged_in' : 'offline' };
    return data || { ok: false, reason: 'offline' };
  } catch (e) { return { ok: false, reason: 'offline' }; }
}
async function checkAdmin() { try { const { data } = await sbClient.rpc('is_admin'); IS_ADMIN = data === true; } catch (e) { IS_ADMIN = false; } renderLicence(); }
function applyLicence(r) {
  LIC.ok = !!r.ok; LIC.checkedAt = Date.now();
  if (r.ok && !applyLicence.adminChecked) { applyLicence.adminChecked = true; checkAdmin(); }
  if (r.ok) { LIC.until = r.valid_until; LIC.days = r.days_left; LIC.email = r.email || LIC.email; LIC.demo = false; }
  renderLicence();
  // spremljena analiza pripada prijavljenom korisniku: ključ se postavlja tek uz važeću licencu, pa se nudi samo njegova analiza
  const k = r.ok ? (LIC.uid || String(LIC.email || '').toLowerCase()) : '';
  if (k && window.fdKorisnik !== k) { window.fdKorisnik = k; if (window.fdOfferRestore) window.fdOfferRestore(); }
}
function renderLicence() {
  document.body.classList.toggle('fd-lic', !!LIC.ok);
  document.body.classList.toggle('fd-demo', !LIC.ok && LIC.demo);
  const el = document.getElementById('hLic'); if (!el) return;
  el.replaceChildren();
  if (!LIC.ok) { el.className = 'lic obr-r3'; if (LIC.demo) el.append('Demo način · ', h('button', { class: 'src', type: 'button', onclick: () => showGate('login') }, 'Prijava')); return; }
  const fd = (s) => s ? String(s).slice(0, 10).split('-').reverse().join('.') + '.' : '';
  el.className = 'lic obr-r3' + (LIC.days <= 30 ? ' warn' : '');
  const loc = String(LIC.email || '').split('@')[0];
  if (loc) el.append(h('span', { class: 'user' }, 'Korisnik: ' + loc.slice(0, Math.min(6, Math.max(3, loc.length - 2))) + '*******'), ' · ');
  el.append(LIC.days <= 30 ? `Licenca istječe ${fd(LIC.until)} (za ${LIC.days} dana) – produžite na retroapplab.com` : `Licenca vrijedi do ${fd(LIC.until)}`);
  if (IS_ADMIN) el.append(' · ', h('a', { class: 'src', href: '/zavrsni/#admin' }, 'Administracija'));
  el.append(' · ', h('button', { class: 'src', type: 'button', onclick: () => showGate('pwd') }, 'Promijeni lozinku'), ' · ', h('button', { class: 'src', type: 'button', onclick: logout }, 'Odjava'));
}
// odjava ponovno učitava stranicu: u memoriji ne ostaju podaci licenciranog korisnika, a stranica se otvara u demo načinu
async function logout() { try { await sbClient.auth.signOut(); } catch (e) {} LIC.ok = false; location.reload(); }
function enterDemo() { LIC.demo = true; renderLicence(); hideGate(); }
window.fdPrijava = () => showGate('login');
let installEvt = null;
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); installEvt = e; document.querySelectorAll('.installbtn').forEach(b => b.hidden = false); });
function installBtn() {
  return h('button', { class: 'glink installbtn', type: 'button', hidden: !installEvt, onclick: async () => { if (!installEvt) return; installEvt.prompt(); try { await installEvt.userChoice; } catch (e) {} installEvt = null; document.querySelectorAll('.installbtn').forEach(x => x.hidden = true); } }, 'Instaliraj aplikaciju na računalo');
}
function showGate(kind, msg) {
  let g = document.getElementById('gate');
  if (!g) { g = h('div', { id: 'gate', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Prijava' }); document.body.append(g); }
  g.hidden = false;
  const card = h('div', { class: 'gatecard' }, h('img', { src: '../icons/icon-192.png', alt: '', width: 64, height: 64 }), h('h2', {}, 'Financijska dijagnoza'));
  const back = () => [LIC.ok ? null : h('button', { class: 'glink', type: 'button', onclick: enterDemo }, 'Nastavi u demo načinu'), h('a', { class: 'gback', href: '/zavrsni/' }, '← Izbornik')];
  if (kind === 'pwd') {
    const p1 = h('input', { type: 'password', autocomplete: 'new-password', placeholder: 'nova lozinka' });
    const p2 = h('input', { type: 'password', autocomplete: 'new-password', placeholder: 'ponovi novu lozinku' });
    const err = h('p', { class: 'gerr', hidden: true });
    const ok = h('p', { class: 'gok', hidden: true }, '✓ Lozinka je promijenjena. Sljedeći put se prijavite novom lozinkom.');
    const save = async () => {
      err.hidden = true;
      if (p1.value.length < 8) { err.textContent = 'Lozinka mora imati barem 8 znakova.'; err.hidden = false; return; }
      if (p1.value !== p2.value) { err.textContent = 'Lozinke se ne podudaraju.'; err.hidden = false; return; }
      sbtn.disabled = true;
      const { error } = await sbClient.auth.updateUser({ password: p1.value });
      sbtn.disabled = false;
      if (error) { err.textContent = /fetch|network/i.test(error.message || '') ? LIC_MSG.offline : /same|different/i.test(error.message || '') ? 'Nova lozinka mora biti drugačija od stare.' : 'Promjena nije uspjela: ' + error.message; err.hidden = false; return; }
      ok.hidden = false; p1.value = ''; p2.value = ''; sbtn.hidden = true; close.textContent = 'Zatvori';
    };
    const sbtn = h('button', { class: 'gbtn', type: 'button', onclick: save }, 'Spremi novu lozinku');
    const close = h('button', { class: 'glink', type: 'button', style: 'margin-top:8px', onclick: hideGate }, 'Odustani');
    p2.addEventListener('keydown', (e) => { if (e.key === 'Enter') save(); });
    card.append(h('p', { class: 'lead' }, 'Promjena lozinke za ' + (LIC.email || 'Vaš račun')), err, ok,
      h('label', {}, 'Nova lozinka', p1), h('label', {}, 'Ponovi novu lozinku', p2), sbtn, close);
    g.replaceChildren(card); setTimeout(() => p1.focus(), 50); return;
  }
  if (kind === 'loading') card.append(h('p', { class: 'lead' }, 'Provjera licence…'));
  else if (kind === 'offline') {
    card.append(h('p', { class: 'gerr' }, LIC_MSG.offline), h('button', { class: 'gbtn', type: 'button', onclick: () => start() }, 'Pokušaj ponovno'), ...back());
  } else {
    const em = h('input', { type: 'email', autocomplete: 'username', placeholder: 'e-mail', value: LIC.email || '' });
    const pw = h('input', { type: 'password', autocomplete: 'current-password', placeholder: 'lozinka' });
    const err = h('p', { class: 'gerr', hidden: !msg }, msg || '');
    const go = async () => {
      err.hidden = true;
      if (!navigator.onLine) { err.textContent = LIC_MSG.offline; err.hidden = false; return; }
      btn.disabled = true; btn.textContent = 'Prijava…';
      const { data: sd, error } = await sbClient.auth.signInWithPassword({ email: em.value.trim(), password: pw.value });
      btn.disabled = false; btn.textContent = 'Prijava';
      if (error) {
        const m = String(error.message || error.code || '');
        err.textContent = /fetch|network/i.test(m) ? LIC_MSG.offline
          : /invalid login credentials/i.test(m) ? 'Pogrešan e-mail ili lozinka.'
          : /not confirmed/i.test(m) ? 'E-mail adresa nije potvrđena. Javite se podršci.'
          : 'Prijava nije uspjela: ' + m;
        err.hidden = false; console.warn('Supabase prijava:', error); return;
      }
      LIC.email = em.value.trim(); LIC.uid = sd && sd.user && sd.user.id || '';
      const r = await checkLicence(); applyLicence(r);
      if (r.ok) hideGate(); else { err.textContent = LIC_MSG[r.reason] || 'Licencu nije moguće provjeriti.'; err.hidden = false; }
    };
    const btn = h('button', { class: 'gbtn', type: 'button', onclick: go }, 'Prijava');
    pw.addEventListener('keydown', (e) => { if (e.key === 'Enter') go(); });
    em.addEventListener('keydown', (e) => { if (e.key === 'Enter') pw.focus(); });
    card.append(h('p', { class: 'lead' }, 'Prijavite se korisničkim podacima koje ste dobili uz licencu za Završni račun.'), err,
      h('label', {}, 'E-mail', em), h('label', {}, 'Lozinka', pw), btn, installBtn(),
      h('p', { class: 'note' }, 'Licenca vrijedi za jedno računalo. Financijski podaci obrađuju se samo na Vašem računalu.'), ...back());
    setTimeout(() => (em.value ? pw : em).focus(), 50);
  }
  g.replaceChildren(card);
}
function hideGate() { if (!LIC.ok && !LIC.demo) return; const g = document.getElementById('gate'); if (g) g.hidden = true; renderLicence(); }
async function start() {
  renderLicence(); showGate('loading');
  if (!sbClient) sbClient = window.supabase.createClient(SB_URL, SB_KEY, { auth: { persistSession: true, autoRefreshToken: true } });
  let session = null;
  try { session = (await sbClient.auth.getSession()).data.session; } catch (e) { session = null; }
  if (!session) { enterDemo(); return; }  // bez prijave: demo način
  if (!navigator.onLine) { showGate('offline'); return; }
  LIC.email = session.user && session.user.email || ''; LIC.uid = session.user && session.user.id || '';
  const r = await checkLicence(); applyLicence(r);
  if (r.ok) hideGate(); else if (r.reason === 'offline') showGate('offline'); else showGate('login', LIC_MSG[r.reason]);
}
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('../sw.js').catch(() => {});
start();
})();
</script>
<script>
''' + DEMO_JS + '''
</script>
<script src="../zaglavlje.js" data-app="Financijska dijagnoza" data-verzija="''' + VER + '''"></script>
'''
i = s.rindex('</body>')
s = s[:i] + LIC + s[i:]
open(out, 'w', encoding='utf-8').write(s)
print('dijagnoza ok', len(s))
