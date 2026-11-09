# RetroAppLab – upute za rad u repozitoriju

## Obračuni: jedan PWA u /zavrsni/

Raspored (jedan PWA, jedan manifest i jedan service worker za sve programe):
- zavrsni/index.html – izbornik nakon prijave (Supabase, my_licences, administracija licenci po programu); novosti u zavrsni/novosti.json
- zavrsni/manifest.webmanifest i zavrsni/sw.js – zajednički; sw.js briše samo predmemorije koje počinju sa 'zavrsni-'
- zavrsni/gfi/ – Završni račun (iz ZIP-a)
- zavrsni/doh/index.html – puni DOH s provjerom licence 'doh'
- zavrsni/neprofitne.html – modul za neprofitne organizacije (ista prijava i licenca 'zavrsni' kao Završni račun)
- zavrsni/dijagnoza/index.html – Financijska dijagnoza (analiza GFI-POD izvještaja; ista prijava i licenca 'zavrsni' kao Završni račun, bez licence demo samo s izmišljenom tvrtkom); demo/ su izmišljeni GFI-POD izvještaji za test uvoza; stara adresa /financijska-dijagnoza/ samo preusmjerava na /zavrsni/
- /doh/index.html – javni demo DOH-a (bez prijave)
- zavrsni/zaglavlje.css i zavrsni/zaglavlje.js – ujednačeno zaglavlje (izgled tamne trake DOH-a: naslov i „← Izbornik”, klijent, traka licence; bijela traka s gumbima istog izgleda; kartice u jednom redu), fiksno pri skrolanju (na mobitelu ostaju samo gumbi i kartice) i zajedničko podnožje sve tri aplikacije, s verzijom (data-verzija); skripte u alati/ ih ugrađuju, a treći argument skripte je verzija (datum), inače današnji datum
- supabase/ – SQL migracije (samo za evidenciju; pokreću se ručno u Supabase SQL Editoru)

Kod svake nove verzije bilo kojeg programa promijeni CACHE u zavrsni/sw.js (npr. 'zavrsni-GGGGMMDDhhmmss').

### Novi ZIP Završnog računa

ZIP se raspakira u zavrsni/gfi/ (ne u zavrsni/). Iz ZIP-a se NE preuzimaju sw.js i manifest.webmanifest (koriste se zajednički u zavrsni/); ako se raspakiraju, obriši zavrsni/gfi/sw.js i zavrsni/gfi/manifest.webmanifest. Ikone i vendor/ idu u zavrsni/gfi/. Ako se promijenio popis datoteka u vendor/, ažuriraj FILES u zavrsni/sw.js.

Nakon zamjene datoteka najprije vrati portalske dijelove (pravila ispod; to radi python3 alati/zavrsni-vrati-portal.py <stari index.html> <index.html iz ZIP-a> zavrsni/gfi/index.html), a zatim pokreni alati/zavrsni-gfi-putanje.py na zavrsni/gfi/index.html. Skripta prebacuje manifest i service worker na ../, canonical, og:url i JSON-LD url na https://retroapplab.com/zavrsni/gfi/, demo poveznicu na /zavrsni/gfi/?demo=1, slaže ujednačeno zaglavlje (tamna traka: naslov „Završni račun {godina} – GFI-POD” i gumb „← Izbornik”, klijent s OIB-om i razdobljem, traka licence; bijela traka s gumbima), dodaje zajedničko podnožje i ograničava administraciju u Završnom na licence za Završni. Treći argument je verzija za podnožje (datum ZIP-a).

Kad god se objavljuje novi ZIP Završnog računa, nakon zamjene datoteka obavezno vrati u <head> datoteke zavrsni/gfi/index.html:
- <title>Završni račun i GFI-POD obrazac za knjigovođe | RetroAppLab</title>
- <meta name="description" content="Aplikacija za knjigovođe: od bruto bilance do FINA GFI-POD obrasca i XML-a za ePoreznu. Bilanca, RDG, porez na dobit, članarina TZ i temeljnica zaključnih knjiženja. Isprobajte demo.">
- <link rel="canonical" href="https://retroapplab.com/zavrsni/"> (alati/zavrsni-gfi-putanje.py ga zatim mijenja u https://retroapplab.com/zavrsni/gfi/)
i provjeri da dinamički naslov kartice ima oblik 'Završni račun [godina] — GFI-POD obrazac | RetroAppLab'.

Ako se u novom ZIP-u promijenila konstanta UPUTE_HTML u zavrsni/gfi/index.html, ažuriraj i tekst u zavrsni/gfi/upute.html: sadržaj unutar <main class="upute"><div class="wrap"> mora biti točno UPUTE_HTML (tablice omotane u <div class="tbl">), a naslov, uvod i tipke ostaju. Nakon zamjene datoteka vrati i poveznicu „Upute za aplikaciju” u prozoru za prijavu (showGate, ispod napomene o licenci).

Uz to, nakon zamjene datoteka iz ZIP-a vrati i opis aplikacije za posjetitelje i tražilice (prethodna verzija zavrsni/gfi/index.html u gitu):
- <section id="o-aplikaciji" class="about"> odmah iza <main id="main"></main>, zajedno s CSS-om za .about i #gate (komentar „Opis aplikacije za posjetitelje i tražilice”);
- og:title, og:description, og:image i og:url u <head>;
- u JS-u: document.body.classList.toggle('zr-licenced', !!LIC.ok) na početku renderLicence(), aboutHome() na početku showGate(), premještanje opisa u prozor za prijavu na kraju showGate() te funkcije aboutEl() i aboutHome() i poziv aboutHome() u hideGate().
Provjeri da se opis vidi ispod prijave i ispod demo aplikacije, a skriva kad je licenca aktivna.

### Nova verzija DOH-a

Puni DOH: pokreni python3 alati/doh-licenca.py <nova-puna-datoteka.html> zavrsni/doh/index.html. Skripta dodaje prijavu i provjeru licence check_licence(p_device, 'doh'), ujednačeno zaglavlje (tamna traka s gumbom „← Izbornik”, klijent iz Osnovnih podataka, traka licence s promjenom lozinke i odjavom), podnožje, manifest i service worker PWA-a; kod obrasca ostaje isti. Treći argument je verzija za podnožje. Puni DOH nikad ne objavljuj bez te provjere.
Skripta zamjenjuje i funkciju parseIssuedPKPages funkcijom iz alati/doh-pk-izdana.js (čitanje izdane PK kartice: nova „Elektronički zapis” i stara bez njega; OIB obveznika samo iz dijela I. uz provjeru kontrolne znamenke, ime bez „1.”, najnovija adresa po datumu, uzdržavani samo iz II.3). Testne PK kartice (Obrazac_PK__8_.pdf, PoreznaKartica__5_.pdf) su u testni-podaci/, koja je u .gitignore i ne ide u repozitorij; nakon svake nove verzije DOH-a provjeri da obje daju očekivane podatke.
Raspored STR. 1-9 (alati/doh-raspored.js: širine stupaca, visine redova i područje ispisa iz Excel obrasca; logiku i polja ne dira, a stupac skriven u Excelu ostaje vidljiv ako u njemu ima polja za unos) umeće se na kraj <body> u oba DOH-a: puni DOH preko alati/doh-licenca.py, javni demo preko alati/doh-demo.py. Nakon svake nove verzije provjeri da spremljeni JSON ima ista polja kao bez rasporeda. Raspored kod ispisa stavlja svaki list STR. 1-9 na jednu A4 stranicu uspravno (mjerilo se samo smanjuje, kao „prilagodi jednoj stranici” u Excelu); ostali dijelovi ispisa ostaju položeni. Provjeri da „Ispiši sve listove” daje po jednu stranicu za svaki STR. list.
Javni demo: python3 alati/doh-demo.py <nova demo datoteka.html> doh/index.html (demo ostaje isti, umeće se samo raspored).

### Nova verzija modula za neprofitne organizacije

Pokreni python3 alati/neprofitne-ugradnja.py <nova neprofitne.html> zavrsni/neprofitne.html. Skripta dodaje manifest i ikone PWA-a, prijavu i licencu prepisane iz zavrsni/gfi/index.html (isti Supabase projekt, ista sesija, zr-device-id, check_licence bez programa = 'zavrsni', upozorenje o isteku), ujednačeno zaglavlje (tamna traka s naslovom „Neprofitne organizacije {godina} – Bilanca i PR-RAS-NPF”, gumbom „← Izbornik”, klijentom i trakom licence) i provjeru licence prije uvoza, spremanja i učitavanja klijenta, izvoza u FINA obrazac te Word/PDF odluka. pdf.js i xlsx učitava iz zavrsni/gfi/vendor/ (iste verzije i isti način kao Završni, bez cdnjs). Logika modula ostaje ista. Kartica „Neprofitne organizacije” u izborniku koristi licencu za Završni račun. Modul koristi localStorage npf_state_v1 i npf_tab te IndexedDB npf_fs. Prijelaz između Završnog i Neprofitnih ide preko izbornika. Nakon nove verzije promijeni CACHE u zavrsni/sw.js.

### Nova verzija Financijske dijagnoze

Pokreni python3 alati/dijagnoza-ugradnja.py <nova financijska-dijagnoza/index.html> zavrsni/dijagnoza/index.html <verzija>. Skripta dodaje manifest i ikone PWA-a, prijavu i licencu prepisane iz neprofitne.html (isti Supabase projekt, ista sesija, zr-device-id, check_licence bez programa = 'zavrsni'; prozor za prijavu s „← Izbornik”), ujednačeno zaglavlje (tamna traka „Financijska dijagnoza – analiza GFI-POD” s gumbom „← Izbornik”, učitana tvrtka iz funkcije zgTvrtka() koja se poziva na kraju runAnalysis() i u resetAll(), traka licence; bijela traka s gumbima Jednostavno/Detaljno) i zajedničko podnožje (zaglavlje.js; gumb „Obriši sve spremljene podatke” ostaje iznad podnožja). xlsx učitava iz zavrsni/gfi/vendor/ (ista verzija 0.18.5, bez cdnjs). Logika i izračuni ostaju isti; financijski podaci obrađuju se samo u pregledniku. Nove demo datoteke idu u zavrsni/dijagnoza/demo/. Demo bez prijave (kao Završni): bez licence stranica radi u demo načinu (3. redak „Demo način · Prijava”, traka „DEMO način – prikaz s izmišljenom tvrtkom…” iznad aplikacije). U demo načinu radi samo „Učitaj DEMO podatke” i sve iz toga (semafor, grafikoni, prognoza i klizači, dijagnoza, Jednostavno/Detaljno, kontrola DEMO izračuna, ispis); učitavanje GFI datoteka (i povlačenjem), ručni unos, izmjene u tablici provjere, učitavanje i spremanje .json analize i preuzimanje DEMO GFI datoteka su sivi i javljaju poruku o licenci, a lokalno spremljena analiza se ne nudi. Ograničenja su u zasebnom bloku (DEMO_JS u skripti) koji presreće događaje prije aplikacije; ne smije postojati način da se u demo načinu analiziraju vlastiti podaci. Prijava s licencom otključava sve bez ponovnog učitavanja, a odjava ponovno učitava stranicu u demo načinu. Spremljena analiza u pregledniku vezana je uz prijavljenog korisnika (ključ 'fd-analiza-v1:' + Supabase ID korisnika, postavlja se tek uz važeću licencu): „Nastavi tu analizu” nudi se samo korisniku koji ju je spremio, a „Obriši sve spremljene podatke” briše samo njegove podatke. Kartica u izborniku (gumb „Otvori demo” vodi na dijagnoza/?demo=1) i filtar novosti „Dijagnoza” imaju ključ 'dij'. Nakon nove verzije promijeni CACHE u zavrsni/sw.js i provjeri: DEMO daje ŽUTO 54/100, Detaljno → Kontrola DEMO izračuna „Prošlo 72 od 72 provjera”, DEMO GFI 2024 i 2025 daju 2023.–2025. bez djelomične analize.
