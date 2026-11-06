# Ugrađuje prijavu i provjeru licence 'doh' u punu verziju DOH-a za /zavrsni/doh/index.html.
# Kod samog obrasca se ne mijenja: dodaju se samo zaglavlje PWA-a, zaslon za provjeru i skripta na kraju.
import sys
src,out=sys.argv[1:3]
import datetime
VER=sys.argv[3] if len(sys.argv)>3 else datetime.date.today().isoformat()  # verzija u podnožju
s=open(src,encoding='utf-8').read()
HEAD='''<meta name="robots" content="noindex"><meta name="theme-color" content="#1B4B8D"><link rel="manifest" href="../manifest.webmanifest"><link rel="icon" type="image/png" sizes="32x32" href="../icons/favicon-32.png"><link rel="apple-touch-icon" href="../icons/apple-touch-icon.png"><link rel="stylesheet" href="../zaglavlje.css">
<style>/* Provjera licence (Obračuni) */
#doh-gate{position:fixed;inset:0;z-index:2147483000;background:#f3f5f8;display:grid;place-items:center;padding:16px;font:15px/1.5 Arial,Helvetica,sans-serif;color:#1c2635}
#doh-gate[hidden]{display:none}
#doh-gate .dg-box{width:min(440px,100%);background:#fff;border:1px solid #d8e0e9;border-radius:8px;padding:24px;display:flex;flex-direction:column;gap:12px;text-align:center}
#doh-gate h2{margin:0;font-size:20px}
#doh-gate p{margin:0}
#doh-gate .dg-err{background:#fdeaea;color:#a32020;padding:8px 10px;border-radius:6px}
#doh-gate .dg-act{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}
#doh-gate a,#doh-gate button{font:inherit;font-size:14px;border-radius:6px;padding:10px 14px;border:1px solid #d8e0e9;background:#fff;color:#1c2635;text-decoration:none;cursor:pointer}
#doh-gate .dg-primary{background:#213b5a;border-color:#213b5a;color:#fff}
#doh-gate .dg-ok{background:#e6f4ec;color:#1f7a4d;padding:8px 10px;border-radius:6px}
#doh-gate .dg-f{display:flex;flex-direction:column;gap:4px;text-align:left;font-size:13px;color:#59697b}
#doh-gate input{font:inherit;font-size:15px;padding:9px 10px;border:1px solid #d8e0e9;border-radius:6px}
</style>'''
GATE='<div id="doh-gate" role="dialog" aria-modal="true" aria-live="polite"><div class="dg-box"><h2>DOH 2026</h2><p>Provjera licence…</p></div></div>'
SCRIPT='''<script src="../gfi/vendor/supabase.js"></script>
<script>
// Prijava i provjera licence za DOH (zajednički login s izbornikom Obračuni)
(function () {
  const SB_URL = 'https://fctpplyerzmvcjjmiwkx.supabase.co';
  const SB_KEY = 'sb_publishable_2MPQsSTjBt-_K7sX-ANNJg_MmSpoK5X';
  const gate = document.getElementById('doh-gate');
  const MSG = {
    no_licence: 'Za ovaj korisnički račun nema aktivne licence za DOH.',
    expired: 'Licenca za DOH je istekla. Za produženje se javite putem retroapplab.com.',
    other_device: 'Licenca za DOH je već aktivirana na drugom računalu. Za prijenos licence na ovo računalo javite se podršci putem retroapplab.com.',
    bad_device: 'Ovo računalo nije moguće prepoznati. Javite se podršci.',
    not_logged_in: 'Za puni DOH prijavite se u izborniku.',
    offline: 'Za rad je potrebna internetska veza. Provjerite vezu i pokušajte ponovno.'
  };
  let sb = null, checkedAt = 0;
  function el(tag, attrs, text) { const e = document.createElement(tag); for (const k in attrs || {}) e.setAttribute(k, attrs[k]); if (text) e.textContent = text; return e; }
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
  function show(text, kind) {
    const box = el('div', { class: 'dg-box' });
    box.append(el('h2', {}, 'DOH 2026'));
    if (kind === 'loading') box.append(el('p', {}, text));
    else {
      box.append(el('p', { class: 'dg-err' }, text));
      const act = el('div', { class: 'dg-act' });
      if (kind === 'offline') { const b = el('button', { type: 'button', class: 'dg-primary' }, 'Pokušaj ponovno'); b.onclick = start; act.append(b); }
      act.append(el('a', { href: '../', class: kind === 'offline' ? '' : 'dg-primary' }, kind === 'login' ? 'Prijava' : 'Na izbornik'));
      act.append(el('a', { href: '/doh/' }, 'Otvori demo'));
      box.append(act);
    }
    gate.replaceChildren(box); gate.hidden = false;
  }
  const fd = (s) => s ? String(s).slice(0, 10).split('-').reverse().join('.') + '.' : '';
  // 3. redak tamne trake: Korisnik · Licenca · [Administracija] · Promijeni lozinku · Odjava (kao u Završnom računu)
  let email = '', isAdmin = false, lastLic = null;
  function licBar(r) {
    if (r) lastLic = r; r = lastLic; if (!r) return;
    const bar = document.querySelector('header .obr-r3'); if (!bar) return;
    const warn = r.days_left != null && r.days_left <= 30;
    bar.className = 'obr-r3' + (warn ? ' warn' : '');
    const parts = [];
    const loc = String(email || r.email || '').split('@')[0];
    if (loc) { const u = el('span', { class: 'user' }, 'Korisnik: ' + loc.slice(0, Math.min(6, Math.max(3, loc.length - 2))) + '*******'); parts.push(u, ' · '); }
    parts.push(warn ? 'Licenca istječe ' + fd(r.valid_until) + ' (za ' + r.days_left + ' dana) – produžite na retroapplab.com' : 'Licenca vrijedi do ' + fd(r.valid_until));
    if (isAdmin) parts.push(' · ', el('a', { href: '/zavrsni/#admin' }, 'Administracija'));
    const pw = el('button', { type: 'button' }, 'Promijeni lozinku'); pw.onclick = showPwd;
    const out = el('button', { type: 'button' }, 'Odjava'); out.onclick = logout;
    parts.push(' · ', pw, ' · ', out);
    bar.replaceChildren(...parts);
  }
  async function checkAdmin() { try { const { data } = await sb.rpc('is_admin'); isAdmin = data === true; } catch (e) { isAdmin = false; } licBar(); }
  async function logout() { try { await sb.auth.signOut(); } catch (e) {} checkedAt = 0; show(MSG.not_logged_in, 'login'); }
  function showPwd() {
    const box = el('div', { class: 'dg-box' });
    const p1 = el('input', { type: 'password', autocomplete: 'new-password', placeholder: 'nova lozinka' });
    const p2 = el('input', { type: 'password', autocomplete: 'new-password', placeholder: 'ponovi novu lozinku' });
    const err = el('p', { class: 'dg-err' }); err.hidden = true;
    const ok = el('p', { class: 'dg-ok' }, '✓ Lozinka je promijenjena. Sljedeći put se prijavite novom lozinkom.'); ok.hidden = true;
    const save = el('button', { type: 'button', class: 'dg-primary' }, 'Spremi novu lozinku');
    const close = el('button', { type: 'button' }, 'Odustani'); close.onclick = () => { gate.hidden = true; };
    save.onclick = async () => {
      err.hidden = true;
      if (p1.value.length < 8) { err.textContent = 'Lozinka mora imati barem 8 znakova.'; err.hidden = false; return; }
      if (p1.value !== p2.value) { err.textContent = 'Lozinke se ne podudaraju.'; err.hidden = false; return; }
      save.disabled = true;
      const { error } = await sb.auth.updateUser({ password: p1.value });
      save.disabled = false;
      if (error) { err.textContent = /fetch|network/i.test(error.message || '') ? MSG.offline : /same|different/i.test(error.message || '') ? 'Nova lozinka mora biti drugačija od stare.' : 'Promjena nije uspjela: ' + error.message; err.hidden = false; return; }
      ok.hidden = false; save.hidden = true; p1.value = p2.value = ''; close.textContent = 'Zatvori';
    };
    p2.addEventListener('keydown', (e) => { if (e.key === 'Enter') save.click(); });
    const l1 = el('label', { class: 'dg-f' }, 'Nova lozinka'); l1.append(p1);
    const l2 = el('label', { class: 'dg-f' }, 'Ponovi novu lozinku'); l2.append(p2);
    const act = el('div', { class: 'dg-act' }); act.append(save, close);
    box.append(el('h2', {}, 'Promjena lozinke'), el('p', {}, email || ''), err, ok, l1, l2, act);
    gate.replaceChildren(box); gate.hidden = false; setTimeout(() => p1.focus(), 50);
  }
  // 2. redak tamne trake: trenutni klijent (ime i prezime, OIB) iz Osnovnih podataka
  function klijent() {
    const k = document.getElementById('doh-klijent'); if (!k) return;
    const v = (id) => { const e = document.getElementById('basic-' + id); return e ? String(e.value || '').trim() : ''; };
    const ime = [v('ime'), v('prezime')].filter(Boolean).join(' '), oib = v('oib');
    const t = [ime, oib ? 'OIB ' + oib : ''].filter(Boolean).join(' · ') || 'Obveznik još nije upisan';
    if (k.textContent !== t) k.textContent = t;
    k.classList.toggle('empty', t === 'Obveznik još nije upisan');
  }
  klijent(); setInterval(klijent, 1000); document.addEventListener('input', klijent);
  async function check() {
    if (!navigator.onLine) return { ok: false, reason: 'offline' };
    try {
      const { data, error } = await sb.rpc('check_licence', { p_device: deviceId(), p_product: 'doh' });
      if (error) return { ok: false, reason: /JWT|auth/i.test(error.message || '') ? 'not_logged_in' : 'offline' };
      return data || { ok: false, reason: 'offline' };
    } catch (e) { return { ok: false, reason: 'offline' }; }
  }
  async function start() {
    show('Provjera licence…', 'loading');
    if (!navigator.onLine) { show(MSG.offline, 'offline'); return; }
    if (!window.supabase) { show('Provjeru licence nije moguće učitati. Osvježite stranicu.', 'offline'); return; }
    if (!sb) sb = window.supabase.createClient(SB_URL, SB_KEY, { auth: { persistSession: true, autoRefreshToken: true } });
    let session = null;
    try { session = (await sb.auth.getSession()).data.session; } catch (e) { show(MSG.offline, 'offline'); return; }
    if (!session) { show(MSG.not_logged_in, 'login'); return; }
    email = (session.user && session.user.email) || '';
    const r = await check();
    if (r.ok) { checkedAt = Date.now(); gate.hidden = true; licBar(r); if (!checkAdmin.done) { checkAdmin.done = true; checkAdmin(); } return; }
    show(MSG[r.reason] || 'Licencu nije moguće provjeriti.', r.reason === 'offline' ? 'offline' : r.reason === 'not_logged_in' ? 'login' : 'other');
  }
  // ponovna provjera kad se program vrati na zaslon nakon duže pauze
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && checkedAt && Date.now() - checkedAt > 30 * 60000) start(); });
  start();
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('../sw.js').catch(() => {});
})();
</script>'''
assert s.count('</title>')==1 and s.count('<body>')==1 and s.count('</body>')==1
# Čitanje izdane PK kartice (nova "Elektronički zapis" i stara bez njega): funkcija parseIssuedPKPages iz alati/doh-pk-izdana.js
import os
def zamijeni_funkciju(s, ime, nova):
    i = s.index('function ' + ime + '('); j = s.index('{', i); d = 0; k = j
    while True:
        if s[k] == '{': d += 1
        elif s[k] == '}':
            d -= 1
            if d == 0: break
        k += 1
    return s[:i] + nova.strip() + s[k+1:]
assert s.count('function parseIssuedPKPages(') == 1
s = zamijeni_funkciju(s, 'parseIssuedPKPages', open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'doh-pk-izdana.js'), encoding='utf-8').read())
# zajedničko zaglavlje (fiksno pri skrolanju) i podnožje: zavrsni/zaglavlje.css i zaglavlje.js
for x,y in [('<header><h1>DOH 2026 – prijava poreza na dohodak</h1><p>Obrazac DOH, P-PPI i TZ1 na jednom mjestu. Podaci ostaju na ovom računalu.</p></header>',
             '<header class="obr-traka" data-zg="traka"><div class="obr-r1"><h1 class="obr-naslov">DOH 2026 – prijava poreza na dohodak</h1><a class="obr-izbornik" href="/zavrsni/">← Izbornik</a></div><p class="obr-r2"><span id="doh-klijent" class="empty">Obveznik još nije upisan</span></p><p class="obr-r3"></p></header>'),
             ('<div class="toolbar">','<div class="toolbar obr-gumbi" data-zg="gumbi">'),('<nav aria-label="Listovi obrasca">','<nav aria-label="Listovi obrasca" data-zg="kartice">')]:
    assert s.count(x)==1,x; s=s.replace(x,y)
SCRIPT=SCRIPT+'\n<script src="../zaglavlje.js" data-app="DOH" data-verzija="'+VER+'"></script>'
s=s.replace('</title>','</title>'+HEAD,1).replace('<body>','<body>'+GATE,1).replace('</body>',SCRIPT+'</body>',1)
open(out,'w',encoding='utf-8').write(s); print('doh ok', len(s))
