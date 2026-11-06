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
# demo poveznica u opisu aplikacije (opis se vraća iz prethodne verzije, pa može već biti prebačen)
s = s.replace('/zavrsni/?demo=1', '/zavrsni/gfi/?demo=1'); assert '/zavrsni/gfi/?demo=1' in s
# Administracija u Završnom upravlja samo licencama za Završni; DOH licence uređuju se u izborniku.
rep("    tb.replaceChildren(...data.map(u => {","    tb.replaceChildren(...data.filter(u => !u.product || u.product === 'zavrsni').map(u => {")
# Zajedničko zaglavlje (fiksno; na mobitelu tamna traka odlazi, ostaju gumbi i kartice) i podnožje (../zaglavlje.css, ../zaglavlje.js).
# Verzija u podnožju: treći argument skripte (datum ZIP-a), inače današnji datum.
import datetime
VER = sys.argv[2] if len(sys.argv) > 2 else datetime.date.today().isoformat()
i = s.index('</head>'); s = s[:i] + '<link rel="stylesheet" href="../zaglavlje.css">\n' + s[i:]
rep('<header class="top">', '<header class="top" data-zg="blok">')
rep('<div class="actions">', '<div class="actions obr-gumbi" data-zg-gumbi>')
# Ujednačena tamna traka (izgled iz DOH-a): naslov i gumb „← Izbornik”, klijent (naziv · OIB · razdoblje), traka licence
rep('<div class="who"><h1 id="hName">ZAVRŠNI RAČUN</h1><p class="period" id="hPeriod"></p><p class="firm" id="hSub"></p><p class="lic" id="hLic"></p></div>',
    '<div class="obr-traka" data-zg-traka><div class="obr-r1"><h1 class="obr-naslov" id="hName">Završni račun – GFI-POD</h1><a class="obr-izbornik" href="/zavrsni/">← Izbornik</a></div><p class="obr-r2"><span class="firm" id="hSub"></span><span class="obr-razd" id="hPeriod"></span></p><p class="lic obr-r3" id="hLic"></p></div>')
rep("  document.getElementById('hName').textContent = ('Završni račun ' + year).trim().toUpperCase();",
    "  document.getElementById('hName').textContent = 'Završni račun ' + (year ? year + ' ' : '') + '– GFI-POD';")
i = s.rindex('</body>'); s = s[:i] + '<script src="../zaglavlje.js" data-app="Završni račun" data-verzija="' + VER + '"></script>\n' + s[i:]
open(p,'w',encoding='utf-8').write(s); print('gfi ok')
