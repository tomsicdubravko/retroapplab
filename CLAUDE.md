# RetroAppLab – upute za rad u repozitoriju

## Završni račun (/zavrsni/)

Kad god se objavljuje novi ZIP Završnog računa u /zavrsni/, nakon zamjene datoteka obavezno vrati u <head> datoteke zavrsni/index.html:
- <title>Završni račun i GFI-POD obrazac za knjigovođe | RetroAppLab</title>
- <meta name="description" content="Aplikacija za knjigovođe: od bruto bilance do FINA GFI-POD obrasca i XML-a za ePoreznu. Bilanca, RDG, porez na dobit, članarina TZ i temeljnica zaključnih knjiženja. Isprobajte demo.">
- <link rel="canonical" href="https://retroapplab.com/zavrsni/">
i provjeri da dinamički naslov kartice ima oblik 'Završni račun [godina] — GFI-POD obrazac | RetroAppLab'.

Ako se u novom ZIP-u promijenila konstanta UPUTE_HTML u zavrsni/index.html, ažuriraj i tekst u zavrsni/upute.html: sadržaj unutar <main class="upute"><div class="wrap"> mora biti točno UPUTE_HTML (tablice omotane u <div class="tbl">), a naslov, uvod i tipke ostaju. Nakon zamjene datoteka vrati i poveznicu „Upute za aplikaciju” u prozoru za prijavu (showGate, ispod napomene o licenci).
