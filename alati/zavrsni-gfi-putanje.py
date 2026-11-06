# Prilagodba Završnog računa za smještaj u /zavrsni/gfi/ unutar zajedničkog PWA-a (izbornik na /zavrsni/).
import sys
p=sys.argv[1]; s=open(p,encoding='utf-8').read()
def rep(a,b,n=1):
    global s
    assert s.count(a)==n,(a,s.count(a)); s=s.replace(a,b)
rep('href="manifest.webmanifest"','href="../manifest.webmanifest"')
rep("navigator.serviceWorker.register('sw.js')","navigator.serviceWorker.register('../sw.js')")
rep('<link rel="canonical" href="https://retroapplab.com/zavrsni/">','<link rel="canonical" href="https://retroapplab.com/zavrsni/gfi/">')
rep('<meta property="og:url" content="https://retroapplab.com/zavrsni/">','<meta property="og:url" content="https://retroapplab.com/zavrsni/gfi/">')
rep('"url":"https://retroapplab.com/zavrsni/"','"url":"https://retroapplab.com/zavrsni/gfi/"')
rep('/zavrsni/?demo=1','/zavrsni/gfi/?demo=1')
rep("    el.append(' · ', h('button', { class: 'src', type: 'button', onclick: () => showGate('pwd') }, 'Promijeni lozinku')",
    "    el.append(' · ', h('a', { class: 'src', href: '../' }, 'Izbornik'));\n    el.append(' · ', h('button', { class: 'src', type: 'button', onclick: () => showGate('pwd') }, 'Promijeni lozinku')")
# Administracija u Završnom upravlja samo licencama za Završni; DOH licence uređuju se u izborniku.
rep("    tb.replaceChildren(...data.map(u => {","    tb.replaceChildren(...data.filter(u => !u.product || u.product === 'zavrsni').map(u => {")
# Prijelaz na modul za neprofitne organizacije (/zavrsni/neprofitne.html) u zaglavlju, prije gumba Novi obrazac
rep('      <button class="btn" id="btnNew" type="button" title="Novi obrazac">',
    '      <a class="btn" id="btnNpf" href="../neprofitne.html" title="Neprofitne organizacije" style="text-decoration:none"><svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 21h18"/><path d="M5 21V10l7-5 7 5v11"/><path d="M9 21v-6h6v6"/></svg><span>Neprofitne organizacije</span></a>\n      <button class="btn" id="btnNew" type="button" title="Novi obrazac">')
open(p,'w',encoding='utf-8').write(s); print('gfi ok')
