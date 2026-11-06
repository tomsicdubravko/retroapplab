# Ugradnja modula za neprofitne organizacije u PWA "Obračuni": /zavrsni/neprofitne.html
# Upotreba: python3 alati/neprofitne-ugradnja.py <nova neprofitne.html> zavrsni/neprofitne.html
# Logika modula ostaje ista. Dodaje se: manifest i ikone PWA-a, prijava i licenca kao u zavrsni/gfi/index.html
# (isti Supabase projekt, ista sesija, ista oznaka računala, licenca 'zavrsni'), traka licence s upozorenjem
# o isteku, ujednačeno zaglavlje (tamna traka s gumbom „← Izbornik”, klijent, traka licence) i provjera licence prije istih radnji kao u glavnoj aplikaciji
# (uvoz datoteka, spremanje i učitavanje klijenta, izvoz u FINA obrazac, Word i PDF odluka/bilješki).
import sys
src, out = sys.argv[1:3]
import datetime
VER = sys.argv[3] if len(sys.argv) > 3 else datetime.date.today().isoformat()  # verzija u podnožju
s = open(src, encoding='utf-8').read()

def rep(a, b):
    global s
    assert s.count(a) == 1, (a[:80], s.count(a))
    s = s.replace(a, b)

HEAD = '''<meta name="theme-color" content="#1B4B8D">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" type="image/png" sizes="32x32" href="icons/favicon-32.png">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
<link rel="stylesheet" href="zaglavlje.css">
'''
CSS = '''
/* Prijava i licenca (kao u Završnom računu) */
.lic{margin:4px 0 0;font-size:12px;color:var(--ink2)}
.brand p.lic{white-space:normal;overflow:visible}
.lic.warn{color:var(--man);font-weight:600}
.lic .user{color:var(--ink2)}
.src{display:inline-block;margin-left:6px;font-size:12px;font-weight:500;color:var(--accent);background:none;border:none;padding:0;cursor:pointer;text-decoration:underline;text-underline-offset:2px}
a.btn{text-decoration:none;color:inherit;display:inline-block}
#gate{position:fixed;inset:0;z-index:100;background:rgba(17,22,28,.55);display:grid;place-items:center;padding:16px;backdrop-filter:blur(3px);overflow-y:auto}
#gate[hidden]{display:none}
.gatecard{background:var(--sheet);border-radius:14px;padding:26px 28px;width:min(400px,100%);display:flex;flex-direction:column;gap:10px;box-shadow:0 12px 40px rgba(0,0,0,.25)}
.gatecard img{align-self:center;border-radius:14px}
.gatecard h2{text-align:center;font-size:20px;margin:0}
.gatecard .lead{text-align:center;margin:0}
.gatecard label{display:flex;flex-direction:column;gap:4px;font-size:12px;color:var(--ink2)}
.gatecard input{border:1px solid var(--rule);background:var(--soft);color:var(--ink);border-radius:6px;padding:9px 10px;font-size:15px}
.gatecard input:focus{outline:none;border-color:var(--accent);background:var(--sheet)}
.gatecard .btn.primary{padding:10px;font-size:15px;background:var(--accent);border-color:var(--accent);color:#fff}
.gatecard .src{align-self:center}
.gatecard .note{font-size:12.5px;color:var(--ink2)}
.pill{display:inline-block;padding:2px 8px;border-radius:10px;font-size:12px;font-weight:500}
.pill.bad{background:var(--badbg);color:var(--bad)}
.okline{margin:4px 0;color:var(--ok);font-weight:600}
@media (prefers-color-scheme: dark){:root:not([data-theme="light"]) .gatecard .btn.primary{color:#0f1622}}
'''
JS = r'''
// ---------- Licenca (kao u Završnom računu, zavrsni/gfi/index.html) ----------
const SB_URL = 'https://fctpplyerzmvcjjmiwkx.supabase.co';
const SB_KEY = 'sb_publishable_2MPQsSTjBt-_K7sX-ANNJg_MmSpoK5X';
const LIC = { ok: false, demo: false, until: null, days: null, email: '', checkedAt: 0 };
let sbClient = null;
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
let IS_ADMIN = false;
async function checkAdmin() { try { const { data } = await sbClient.rpc('is_admin'); IS_ADMIN = data === true; } catch (e) { IS_ADMIN = false; } renderLicence(); }
function applyLicence(r) {
  LIC.ok = !!r.ok; LIC.checkedAt = Date.now();
  if (r.ok && !applyLicence.adminChecked) { applyLicence.adminChecked = true; checkAdmin(); }
  if (r.ok) { LIC.until = r.valid_until; LIC.days = r.days_left; LIC.email = r.email || LIC.email; LIC.demo = false; }
  renderLicence();
}
function renderLicence() {
  const el = document.getElementById('hLic'); if (!el) return;
  el.replaceChildren();
  const fd = (s) => s ? String(s).slice(0, 10).split('-').reverse().join('.') + '.' : '';
  if (LIC.ok) {
    el.className = 'lic' + (LIC.days <= 30 ? ' warn' : '');
    const loc = String(LIC.email || '').split('@')[0];
    if (loc) el.append(h('span', { class: 'user' }, 'Korisnik: ' + loc.slice(0, Math.min(6, Math.max(3, loc.length - 2))) + '*******'), ' · ');
    el.append(LIC.days <= 30 ? `Licenca istječe ${fd(LIC.until)} (za ${LIC.days} dana) – produžite na retroapplab.com` : `Licenca vrijedi do ${fd(LIC.until)}`);
    if (IS_ADMIN) el.append(' · ', h('a', { class: 'src', href: '/zavrsni/#admin' }, 'Administracija'));
    el.append(' · ', h('button', { class: 'src', type: 'button', onclick: () => showGate('pwd') }, 'Promijeni lozinku'), ' · ', h('button', { class: 'src', type: 'button', onclick: logout }, 'Odjava'));
  } else {
    el.className = 'lic demo';
    el.append('DEMO – ručni unos. Uvoz, spremanje i izvoz rade uz licencu. ', h('button', { class: 'src', type: 'button', onclick: () => showGate('login') }, 'Prijava'));
  }
}
async function requireLicence() {
  if (LIC.ok && Date.now() - LIC.checkedAt < 60000 && navigator.onLine) return true;
  if (!LIC.ok) { showGate('login', LIC.demo ? 'Ova funkcija radi samo uz licencu. Prijavite se.' : ''); return false; }
  const r = await checkLicence();
  applyLicence(r);
  if (!r.ok) { showGate(r.reason === 'offline' ? 'offline' : 'login', LIC_MSG[r.reason] || ''); return false; }
  return true;
}
async function logout() { try { await sbClient.auth.signOut(); } catch (e) {} LIC.ok = false; LIC.demo = false; renderLicence(); showGate('login'); }
let installEvt = null;
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); installEvt = e; document.querySelectorAll('.installbtn').forEach(b => b.hidden = false); });
function installBtn() {
  const b = h('button', { class: 'btn installbtn', type: 'button', hidden: !installEvt, onclick: async () => { if (!installEvt) return; installEvt.prompt(); try { await installEvt.userChoice; } catch (e) {} installEvt = null; document.querySelectorAll('.installbtn').forEach(x => x.hidden = true); } }, 'Instaliraj aplikaciju na računalo');
  return b;
}
function showGate(kind, msg) {
  let g = document.getElementById('gate');
  if (!g) { g = h('div', { id: 'gate', role: 'dialog', 'aria-modal': 'true' }); document.body.append(g); }
  g.hidden = false;
  const card = h('div', { class: 'gatecard' }, h('img', { src: 'icons/icon-192.png', alt: '', width: 64, height: 64 }), h('h2', {}, 'Neprofitne organizacije'));
  if (kind === 'pwd') {
    const p1 = h('input', { type: 'password', autocomplete: 'new-password', placeholder: 'nova lozinka' });
    const p2 = h('input', { type: 'password', autocomplete: 'new-password', placeholder: 'ponovi novu lozinku' });
    const err = h('p', { class: 'pill bad', hidden: true });
    const ok = h('p', { class: 'okline', hidden: true }, '✓ Lozinka je promijenjena. Sljedeći put se prijavite novom lozinkom.');
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
    const sbtn = h('button', { class: 'btn primary', type: 'button', onclick: save }, 'Spremi novu lozinku');
    const close = h('button', { class: 'src', type: 'button', style: 'margin-top:8px', onclick: hideGate }, 'Odustani');
    p2.addEventListener('keydown', (e) => { if (e.key === 'Enter') save(); });
    card.append(h('p', { class: 'lead' }, 'Promjena lozinke za ' + (LIC.email || 'Vaš račun')), err, ok,
      h('label', {}, 'Nova lozinka', p1), h('label', {}, 'Ponovi novu lozinku', p2), sbtn, close);
    g.replaceChildren(card); setTimeout(() => p1.focus(), 50); return;
  }
  if (kind === 'loading') card.append(h('p', { class: 'lead' }, 'Provjera licence…'));
  else if (kind === 'offline') {
    card.append(h('p', { class: 'pill bad' }, LIC_MSG.offline),
      h('button', { class: 'btn primary', type: 'button', onclick: () => start() }, 'Pokušaj ponovno'));
  } else {
    const em = h('input', { type: 'email', autocomplete: 'username', placeholder: 'e-mail', value: LIC.email || '' });
    const pw = h('input', { type: 'password', autocomplete: 'current-password', placeholder: 'lozinka' });
    const err = h('p', { class: 'pill bad', hidden: !msg }, msg || '');
    const go = async () => {
      err.hidden = true;
      if (!navigator.onLine) { err.textContent = LIC_MSG.offline; err.hidden = false; return; }
      btn.disabled = true; btn.textContent = 'Prijava…';
      const { error } = await sbClient.auth.signInWithPassword({ email: em.value.trim(), password: pw.value });
      btn.disabled = false; btn.textContent = 'Prijava';
      if (error) {
        const m = String(error.message || error.code || '');
        err.textContent = /fetch|network/i.test(m) ? LIC_MSG.offline
          : /invalid login credentials/i.test(m) ? 'Pogrešan e-mail ili lozinka.'
          : /not confirmed/i.test(m) ? 'E-mail adresa nije potvrđena. Javite se podršci.'
          : 'Prijava nije uspjela: ' + m;
        err.hidden = false; console.warn('Supabase prijava:', error); return;
      }
      LIC.email = em.value.trim();
      const r = await checkLicence(); applyLicence(r);
      if (r.ok) hideGate(); else { err.textContent = LIC_MSG[r.reason] || 'Licencu nije moguće provjeriti.'; err.hidden = false; }
    };
    const btn = h('button', { class: 'btn primary', type: 'button', onclick: go }, 'Prijava');
    pw.addEventListener('keydown', (e) => { if (e.key === 'Enter') go(); });
    em.addEventListener('keydown', (e) => { if (e.key === 'Enter') pw.focus(); });
    card.append(h('p', { class: 'lead' }, 'Prijavite se korisničkim podacima koje ste dobili uz licencu.'), err,
      h('label', {}, 'E-mail', em), h('label', {}, 'Lozinka', pw), btn,
      h('button', { class: 'src', type: 'button', style: 'margin-top:10px', onclick: () => { LIC.demo = true; renderLicence(); hideGate(); } }, 'Isprobaj demo (samo ručni unos)'),
      installBtn(),
      h('p', { class: 'note', style: 'border:none;padding:8px 0 0;text-align:center' }, 'Licenca vrijedi za jedno računalo. Podaci iz bilanci ostaju na Vašem računalu.'),
      h('a', { href: '/zavrsni/', style: 'align-self:center;font-size:12px;color:var(--ink2)' }, '← Izbornik'));
    setTimeout(() => (em.value ? pw : em).focus(), 50);
  }
  g.replaceChildren(card);
}
function hideGate() { const g = document.getElementById('gate'); if (g) g.hidden = true; renderLicence(); }
async function start() {
  showGate('loading');
  if (!navigator.onLine) { showGate('offline'); return; }
  if (!sbClient) sbClient = window.supabase.createClient(SB_URL, SB_KEY, { auth: { persistSession: true, autoRefreshToken: true } });
  let session = null;
  try { session = (await sbClient.auth.getSession()).data.session; } catch (e) { showGate('offline'); return; }
  if (!session) {
    if (new URLSearchParams(location.search).has('demo')) { LIC.demo = true; renderLicence(); hideGate(); return; }
    showGate('login'); return;
  }
  LIC.email = session.user && session.user.email || '';
  const r = await checkLicence(); applyLicence(r);
  if (r.ok) hideGate(); else if (r.reason === 'offline') showGate('offline'); else showGate('login', LIC_MSG[r.reason]);
}
window.addEventListener('offline', () => { if (LIC.ok) { LIC.checkedAt = 0; } });
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});

// Iste radnje kao u glavnoj aplikaciji rade samo uz licencu: uvoz datoteka, spremanje i učitavanje klijenta,
// izvoz u FINA obrazac te Word i PDF odluka i bilješki. Ispis obrazaca (s CSS-om obrasca) radi i u demo načinu.
const licGuard = (fn) => async function (...a) { if (!(await requireLicence())) return; return fn.apply(this, a); };
{
  const dz = dropZone;
  dropZone = (id, title, sub, accept, onFile) => dz(id, title, sub, accept, licGuard(onFile));
  saveClient = licGuard(saveClient);
  openClient = licGuard(openClient);
  loadClientFile = licGuard(loadClientFile);
  const dl = download;
  download = licGuard(dl);
  const ph = printHtml;
  printHtml = (title, html, css) => css ? ph(title, html, css) : licGuard(ph)(title, html, css);
}
start();
'''

# pdf.js i xlsx iz gfi/vendor/ (iste verzije 3.11.174 i 0.18.5 i isti način učitavanja kao u zavrsni/gfi/index.html:
# pdf.min.js pa pdf.worker.min.js kao skripte, bez workerSrc). Čitanje PDF-a i .xls-a ostaje isto.
rep("const loadXlsx = () => (xlsxReady ||= loadScript('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js').catch((e) => { xlsxReady = null; throw e; }));",
    "const loadXlsx = () => (xlsxReady ||= new Promise((res, rej) => { const s = document.createElement('script'); s.src = 'gfi/vendor/xlsx.full.min.js'; s.onload = res; s.onerror = () => rej(new Error('Ne mogu učitati čitač Excela')); document.head.append(s); }).catch((e) => { xlsxReady = null; throw e; }));")
rep("const loadPdf = () => (pdfReady ||= loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js').then(() => { window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'; }).catch((e) => { pdfReady = null; throw e; }));",
    "const loadPdf = () => (pdfReady ||= (() => { const base = 'gfi/vendor/'; const load = (src) => new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => rej(new Error('Ne mogu učitati čitač PDF-a (' + src + ')')); document.head.append(s); }); return load(base + 'pdf.min.js').then(() => load(base + 'pdf.worker.min.js')); })().catch((e) => { pdfReady = null; throw e; }));")
rep('<title>Neprofitne organizacije – godišnji financijski izvještaji</title>\n',
    '<title>Neprofitne organizacije – godišnji financijski izvještaji</title>\n' + HEAD)
# CSS na kraj prvog <style>
i = s.index('</style>')
s = s[:i] + CSS + s[i:]
# ujednačena tamna traka (izgled iz DOH-a): naslov s godinom i gumb „← Izbornik”, klijent (naziv · OIB), traka licence
rep('<div class="brand"><h1>Neprofitne organizacije</h1><p id="who">Godišnji financijski izvještaji: Bilanca i PR-RAS-NPF</p></div>',
    '<div class="obr-traka" data-zg-traka><div class="obr-r1"><h1 class="obr-naslov" id="npfNaslov">Neprofitne organizacije – Bilanca i PR-RAS-NPF</h1><a class="obr-izbornik" href="/zavrsni/">← Izbornik</a></div><p class="obr-r2" id="who">Obveznik još nije upisan</p><p class="lic obr-r3" id="hLic"></p></div>')
rep("  document.getElementById('who').textContent = (R.naziv ? R.naziv + ', ' : '') + 'godina ' + year() + (R.oib ? ', OIB ' + R.oib : '');",
    "  document.getElementById('npfNaslov').textContent = 'Neprofitne organizacije ' + year() + ' – Bilanca i PR-RAS-NPF';\n  { const w = document.getElementById('who'), kl = [R.naziv, R.oib ? 'OIB ' + R.oib : ''].filter(Boolean); w.textContent = kl.length ? kl.join(' · ') : 'Obveznik još nije upisan'; w.classList.toggle('empty', !kl.length); }")
# bez gumba za prijelaz u Završni: prijelaz ide preko izbornika
rep("document.getElementById('saveJson').onclick = saveClient;",
    JS.strip('\n') + "\ndocument.getElementById('saveJson').onclick = saveClient;")
# Supabase knjižnica (ista kao u glavnoj aplikaciji) prije skripte modula
last = s.rindex('<script>')
s = s[:last] + '<script src="gfi/vendor/supabase.js"></script>\n' + s[last:]
# zajedničko zaglavlje (fiksno; na mobitelu naslov odlazi, ostaju gumbi i kartice) i podnožje
rep('<header class="top">', '<header class="top" data-zg="blok">')
rep('<div class="acts">', '<div class="acts obr-gumbi" data-zg-gumbi>')
i = s.rindex('</body>')
s = s[:i] + '<script src="zaglavlje.js" data-app="Neprofitne" data-verzija="' + VER + '"></script>\n' + s[i:]
open(out, 'w', encoding='utf-8').write(s)
print('neprofitne ok', len(s))
