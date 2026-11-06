# RetroAppLab – upute za rad u repozitoriju

## Obračuni: jedan PWA u /zavrsni/

Raspored (jedan PWA, jedan manifest i jedan service worker za sve programe):
- zavrsni/index.html – izbornik nakon prijave (Supabase, my_licences, administracija licenci po programu); novosti u zavrsni/novosti.json
- zavrsni/manifest.webmanifest i zavrsni/sw.js – zajednički; sw.js briše samo predmemorije koje počinju sa 'zavrsni-'
- zavrsni/gfi/ – Završni račun (iz ZIP-a)
- zavrsni/doh/index.html – puni DOH s provjerom licence 'doh'
- /doh/index.html – javni demo DOH-a (bez prijave)
- supabase/ – SQL migracije (samo za evidenciju; pokreću se ručno u Supabase SQL Editoru)

Kod svake nove verzije bilo kojeg programa promijeni CACHE u zavrsni/sw.js (npr. 'zavrsni-GGGGMMDDhhmmss').

### Novi ZIP Završnog računa

ZIP se raspakira u zavrsni/gfi/ (ne u zavrsni/). Iz ZIP-a se NE preuzimaju sw.js i manifest.webmanifest (koriste se zajednički u zavrsni/); ako se raspakiraju, obriši zavrsni/gfi/sw.js i zavrsni/gfi/manifest.webmanifest. Ikone i vendor/ idu u zavrsni/gfi/. Ako se promijenio popis datoteka u vendor/, ažuriraj FILES u zavrsni/sw.js.

Nakon zamjene datoteka najprije vrati portalske dijelove (pravila ispod; to radi python3 alati/zavrsni-vrati-portal.py <stari index.html> <index.html iz ZIP-a> zavrsni/gfi/index.html), a zatim pokreni alati/zavrsni-gfi-putanje.py na zavrsni/gfi/index.html. Skripta prebacuje manifest i service worker na ../, canonical, og:url i JSON-LD url na https://retroapplab.com/zavrsni/gfi/, demo poveznicu na /zavrsni/gfi/?demo=1, dodaje poveznicu „Izbornik” u traku licence i ograničava administraciju u Završnom na licence za Završni.

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

Puni DOH: pokreni python3 alati/doh-licenca.py <nova-puna-datoteka.html> zavrsni/doh/index.html. Skripta dodaje prijavu i provjeru licence check_licence(p_device, 'doh'), manifest i service worker PWA-a; kod obrasca ostaje isti. Puni DOH nikad ne objavljuj bez te provjere.
Javni demo: nova demo datoteka ide nepromijenjena u doh/index.html.
