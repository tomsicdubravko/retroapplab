# Ugrađuje prijavu i provjeru licence 'doh' u punu verziju DOH-a za /zavrsni/doh/index.html.
# Kod samog obrasca se ne mijenja: dodaju se samo zaglavlje PWA-a, zaslon za provjeru i skripta na kraju.
import sys
src,out=sys.argv[1:3]
s=open(src,encoding='utf-8').read()
HEAD='''<meta name="robots" content="noindex"><meta name="theme-color" content="#1B4B8D"><link rel="manifest" href="../manifest.webmanifest"><link rel="icon" type="image/png" sizes="32x32" href="../icons/favicon-32.png"><link rel="apple-touch-icon" href="../icons/apple-touch-icon.png">
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
.doh-licbar{margin-top:10px;font-size:13px;color:#dce5f0}
.doh-licbar a{color:#fff}
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
  function licBar(r) {
    const head = document.querySelector('header'); if (!head) return;
    let bar = head.querySelector('.doh-licbar');
    if (!bar) { bar = el('p', { class: 'doh-licbar' }); head.append(bar); }
    bar.replaceChildren((r.days_left != null && r.days_left <= 30 ? 'Licenca za DOH istječe ' + fd(r.valid_until) + ' (za ' + r.days_left + ' dana)' : 'Licenca za DOH vrijedi do ' + fd(r.valid_until)) + ' · ', el('a', { href: '../' }, 'Izbornik'));
  }
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
    const r = await check();
    if (r.ok) { checkedAt = Date.now(); gate.hidden = true; licBar(r); return; }
    show(MSG[r.reason] || 'Licencu nije moguće provjeriti.', r.reason === 'offline' ? 'offline' : r.reason === 'not_logged_in' ? 'login' : 'other');
  }
  // ponovna provjera kad se program vrati na zaslon nakon duže pauze
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && checkedAt && Date.now() - checkedAt > 30 * 60000) start(); });
  start();
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('../sw.js').catch(() => {});
})();
</script>'''
assert s.count('</title>')==1 and s.count('<body>')==1 and s.count('</body>')==1
s=s.replace('</title>','</title>'+HEAD,1).replace('<body>','<body>'+GATE,1).replace('</body>',SCRIPT+'</body>',1)
open(out,'w',encoding='utf-8').write(s); print('doh ok', len(s))
