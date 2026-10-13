PUSHLINE v1.5 — RETROAPPLAB ARCADE
Finalni statički paket, 13.10.2026.

OBJAVA
1. Prenesite SVIH šest datoteka iz ove mape u web-direktorij /pushline/ na retroapplab.com:
   index.html, favicon.svg, icon-192.png, icon-512.png, og-image.png, README.txt.
   Prenosi se sadržaj mape, bez dodatne ugniježđene mape pushline-release.
2. Poslužite index.html kao početnu datoteku tog direktorija preko HTTPS-a.
   Nisu potrebni build, npm, vanjske biblioteke, API ili baza podataka.
3. Provjerite https://retroapplab.com/pushline/ te javnu dostupnost slika i favicona.
   PNG datoteke moraju imati Content-Type: image/png, a SVG image/svg+xml.
4. Nakon zamjene ranije verzije očistite cache/CDN za HTML i promijenjene slike.
   Društvene mreže mogu zasebno zadržati prethodnu Open Graph sliku.
5. Prije javne najave otvorite stranicu na stvarnom iPhoneu i Androidu te desktopu:
   splash/skip, PLAY, povlačenje, pauza, postavke/glasnoća, restart i Game Over.

NAPOMENE
- Ovaj paket pripremljen je lokalno; nije automatski prenesen na javni server.
- Canonical i social meta URL-ovi ciljaju https://retroapplab.com/pushline/.
- og-image.png: 1200x630; ikone: 192x192 i 512x512. To su stvarne PNG slike.
- Zvuk se otključava korisničkom interakcijom; ugrađeni OGG i Web Audio FX ne traže mrežu.
- Postavke i rekordi koriste localStorage u korisnikovu pregledniku; zadržani su postojeći ključevi.
  Privatni/blokirani storage može onemogućiti trajno spremanje. Lokalna file verzija i javna domena imaju zaseban storage.
- Nema oglasa, analitike ni vanjskih biblioteka. Gameplay/CSS/JavaScript/audio nepromijenjeni su u odnosu na v1.4.
- Stvarni iPhone/Android i subjektivni zvuk još zahtijevaju provjeru. Na najsporijim uređajima puna ploča može imati povremeno skuplje frameove.
