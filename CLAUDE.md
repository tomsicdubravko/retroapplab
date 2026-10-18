# RetroAppLab – upute za rad u repozitoriju

## Završni račun (/zavrsni/)

Kad god se objavljuje novi ZIP Završnog računa u /zavrsni/, nakon zamjene datoteka obavezno vrati u <head> datoteke zavrsni/index.html:
- <title>Završni račun i GFI-POD obrazac za knjigovođe | RetroAppLab</title>
- <meta name="description" content="Aplikacija za knjigovođe: od bruto bilance do FINA GFI-POD obrasca i XML-a za ePoreznu. Bilanca, RDG, porez na dobit, članarina TZ i temeljnica zaključnih knjiženja. Isprobajte demo.">
- <link rel="canonical" href="https://retroapplab.com/zavrsni/">
i provjeri da dinamički naslov kartice ima oblik 'Završni račun [godina] — GFI-POD obrazac | RetroAppLab'.

Ako se u novom ZIP-u promijenila konstanta UPUTE_HTML u zavrsni/index.html, ažuriraj i tekst u zavrsni/upute.html: sadržaj unutar <main class="upute"><div class="wrap"> mora biti točno UPUTE_HTML (tablice omotane u <div class="tbl">), a naslov, uvod i tipke ostaju. Nakon zamjene datoteka vrati i poveznicu „Upute za aplikaciju” u prozoru za prijavu (showGate, ispod napomene o licenci).

Uz to, nakon zamjene datoteka iz ZIP-a vrati i opis aplikacije za posjetitelje i tražilice (prethodna verzija zavrsni/index.html u gitu):
- <section id="o-aplikaciji" class="about"> odmah iza <main id="main"></main>, zajedno s CSS-om za .about i #gate (komentar „Opis aplikacije za posjetitelje i tražilice”);
- og:title, og:description, og:image i og:url u <head>;
- u JS-u: document.body.classList.toggle('zr-licenced', !!LIC.ok) na početku renderLicence(), aboutHome() na početku showGate(), premještanje opisa u prozor za prijavu na kraju showGate() te funkcije aboutEl() i aboutHome() i poziv aboutHome() u hideGate().
Provjeri da se opis vidi ispod prijave i ispod demo aplikacije, a skriva kad je licenca aktivna.
