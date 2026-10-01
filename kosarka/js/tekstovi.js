// ===== KVART KINGS - tekstovi: svi natpisi igre na jednom mjestu (priprema za prijevod) =====
'use strict';
// T('kljuc') → tekst na jeziku iz profila (postavke.jezik); T('kljuc',{ime:'ANA'}) zamjenjuje {ime} u tekstu.
// Vrijednost može biti i popis (npr. rival.provokacije) – T ga tada vraća takvog kakav jest.
// Od sada svaki NOVI natpis ide samo preko T(): dodaj ključ u HR, a u kodu piši T('kljuc').
// U HTML-u: data-t="kljuc" (tekst), data-t-html (tekst s oznakama), data-t-aria (aria-label), data-t-ph (placeholder);
//   primijeniTekstove() ih popuni pri pokretanju (main.js).
// Novi jezik: dodaj rječnik (npr. const EN={…}) s istim ključevima i upiši ga u JEZICI; što nedostaje, uzima se iz HR.
// Jezik se čita pri pokretanju: nakon promjene postavke.jezik stranicu treba ponovno učitati.
// Ime igre nije ovdje, nego u IME_IGRE (ime-igre.js).
const HR={
  // ---------- splash ----------
  'splash.podnaslov':'Od kvarta do legende',
  'splash.tap':'TAP TO PLAY',
  'splash.tipka':'ili pritisni bilo koju tipku',

  // ---------- zajedničko ----------
  'opce.izbornik':'Izbornik',
  'opce.nastavi':'Nastavi',
  'opce.natrag':'Natrag',
  'opce.kreni':'Kreni!',
  'opce.pobjeda':'Pobjeda',
  'opce.poraz':'Poraz',
  'opce.i':' i ',
  'opce.protiv':' protiv ',
  'opce.racunalo':'Računalo',
  'opce.plavi':'Plavi',
  'opce.crveni':'Crveni',
  'opce.plaviMalo':'plavi',
  'opce.crveniMalo':'crveni',
  'tezina.0':'Lako', 'tezina.1':'Normalno', 'tezina.2':'Teško',
  'tezinaMalo.0':'lako', 'tezinaMalo.1':'normalno', 'tezinaMalo.2':'teško',

  // ---------- glavni izbornik ----------
  'izbornik.opis':'Pola terena, dva na dva, sa zakucavanjima, fintama i alley-oopom. Ti vodiš plave, računalo igra za suigrača i za crvene.',
  'izbornik.ekipe':'<b style="color:var(--fg)">JAY</b> brzi dribler · <b style="color:var(--fg)">DRE</b> zakucavač<br><b style="color:var(--fg)">SARA</b> šuterica · <b style="color:var(--fg)">KAI</b> obrambeni (blok i krađa)',
  'izbornik.tezina':'Težina',
  'izbornik.igraSeDo':'Igra se do',
  'izbornik.igraj':'Igraj 2 na 2',
  'izbornik.turnir':'🏆 Ulični turnir',
  'izbornik.karijera':'⭐ Karijera',
  'izbornik.trice':'🎯 Gađanje trica',
  'izbornik.solo':'🏀 Solo trening',
  'izbornik.online':'👥 Online 2 na 2',
  'izbornik.lokalno':'🎮 Lokalno 2 na 2',
  'izbornik.pomocTipke':`<b>Kretanje</b> <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> ili strelice<br>
      <b>Šut</b> drži <kbd>Razmak</kbd> i pusti na vrhu skoka (zelena zona). U obrani razmak je skok za blok.<br>
      <b>Finta</b> samo kratko kucni <kbd>Razmak</kbd>, branič često skoči u prazno.<br>
      <b>Zakucavanje</b> zaleti se prema košu i pritisni <kbd>Razmak</kbd> blizu obruča.<br>
      <b>Dodaj</b> <kbd>E</kbd>, a drži <kbd>E</kbd> ili pritisni <kbd>R</kbd> za alley-oop suigraču. U obrani <kbd>E</kbd> mijenja igrača.<br>
      <b>Dribling</b> <kbd>Q</kbd> s loptom: sa smjerom je krosover na tu stranu, bez smjera spin pored braniča, a sa smjerom unatrag (od koša) lopta ide kroz noge i igrač se odmakne za šut. Branič često ostane posađen, a nakon lopte kroz noge zna i pasti.<br>
      <b>Kradi</b> <kbd>Q</kbd> u obrani, ali pazi, previše pokušaja donosi faul<br>
      <b>Sprint</b> drži <kbd>Shift</kbd>, dok traje snaga<br>
      Nakon ukradene lopte ili skoka u obrani loptu treba iznijeti iza linije za 3.<br>
      <b>Igraj s prijateljem:</b> preko koda igre, zajedno protiv računala ili jedan protiv drugoga. <b>Ulični turnir:</b> tri utakmice na tri terena (dan, pod mostom, noćni krov), sve jači protivnici. <b>Gađanje trica:</b> tri stalka po 5 lopti. Prvi pritisak šuta zaustavlja nišan lijevo/desno (X), drugi daljinu (Y). Oba u zelenom = PERFECT. <b>Solo trening:</b> sam na terenu, bez protivnika i sata.`,
  'izbornik.pomocDodir':`<b>Lijevi palac</b> kretanje. <b>Šut</b> drži i pusti na vrhu skoka (zelena zona), u obrani je skok za blok.
      Kratki dodir Šuta je finta, a Šut u zaletu prema košu je zakucavanje.
      <b>Dodaj</b> kratko za dodavanje, drži za alley-oop. U obrani mijenja igrača. Joystick do kraja je sprint. <b>Dribling</b> (isti gumb kao Kradi, kad imaš loptu): s joystickom krosover, bez njega spin, a joystick povučen prema sebi (od koša) je lopta kroz noge s odmakom. <b>Kradi</b> oprezno, previše pokušaja donosi faul.<br>
      Nakon ukradene lopte ili skoka u obrani loptu treba iznijeti iza linije za 3.`,

  // ---------- HUD i kontrole ----------
  'hud.vrijemeNapada':'Vrijeme napada',
  'hud.do':'DO {n}',
  'hud.solo':'SOLO · POGOCI / ŠUTEVI',
  'hud.iznesiLoptu':'Iznesi loptu iza linije za 3!',
  'hud.uvodTi':'Izvođenje: dodaj suigraču (Dodaj) · {s} s',
  'hud.uvod':'Izvođenje: otvori se za dodavanje · {s} s',
  'hud.uvodObrana':'Izvođenje protivnika: presijeci dodavanje · {s} s',
  'hud.slobodno':'Slobodno bacanje: drži šut i pusti u zelenom',
  'hud.slobodnoGledaj':'Slobodno bacanje',
  'hud.skok':'Skok za loptu: pritisni šut kad je oznaka u zelenom!',
  'hud.zvuk':'Zvuk',
  'hud.pauza':'Pauza',
  'legenda.kretanje':'Kretanje',
  'legenda.razmak':'Razmak',
  'legenda.sutBlok':'Šut / blok',
  'legenda.dodaj':'Dodaj (drži: alley-oop)',
  'legenda.dribling':'Dribling / kradi',
  'legenda.sprint':'Sprint',
  'gumb.sut':'Šut',
  'gumb.skok':'Skok',
  'gumb.dodaj':'Dodaj',
  'gumb.igrac':'Igrač',
  'gumb.naredba':'Naredba',
  'gumb.dribling':'Dribling',
  'gumb.kradi':'Kradi',
  'izvor.k1':'Tipkovnica A', 'izvor.k2':'Tipkovnica B',
  'izvor.g0':'Kontroler 1', 'izvor.g1':'Kontroler 2', 'izvor.g2':'Kontroler 3', 'izvor.g3':'Kontroler 4',

  // ---------- pauza i kraj utakmice ----------
  'pauza.naslov':'Pauza',
  'kraj.novaIgra':'Nova igra',

  // ---------- poruke u igri (flash) ----------
  'poruka.kreni':'Kreni!',
  'poruka.vasaLopta':'Vaša lopta',
  'poruka.loptaPlavima':'Lopta plavima',
  'poruka.loptaCrvenima':'Lopta crvenima',
  'poruka.krozNoge':'KROZ NOGE!',
  'poruka.prosao':'PROŠAO!',
  'poruka.prosaoTe':'PROŠAO TE!',
  'poruka.ukradeno':'UKRADENO!',
  'poruka.presjeceno':'PRESJEČENO!',
  'poruka.iznesiLoptu':'Iznesi loptu iza linije za 3',
  'poruka.obruc':'Obruč!',
  'poruka.faul':'Faul',
  'poruka.faulIzvodjenje':'Lopta ostaje napadu · izvođenje ispod koša',
  'poruka.faulUvod':'Faul pri izvođenju · ponovno izvođenje',
  'poruka.faulNaslov':'FAUL!',
  'poruka.faulSlobodno':'Slobodno bacanje · {ime}',
  'poruka.izvodjenje':'Izvođenje',
  'poruka.petSekundi':'5 SEKUNDI!',
  'poruka.loptaProtivniku':'Lopta protivniku',
  'poruka.slobodnoBacanje':'SLOBODNO BACANJE',
  'poruka.slobodnoPogodak':'SLOBODNO!',
  'poruka.skokZaLoptu':'SKOK ZA LOPTU',
  'poruka.skokPod':'Šut = skok · skoči kad je oznaka u zelenom',
  'poruka.skokDobio':'{ime} dobiva skok!',
  'poruka.kos':'KOŠ!',
  'poruka.swish':'SWISH!',
  'poruka.trica':'TRICA!',
  'poruka.tricaSwish':'TRICA! SWISH!',
  'poruka.neVrijedi':'Ne vrijedi',
  'poruka.nijeIznesena':'Lopta nije iznesena iza linije za 3',
  'poruka.plaviPlus':'Plavi +{n}',
  'poruka.crveniPlus':'Crveni +{n}',
  'poruka.aut':'Aut',
  'poruka.isteklo':'Isteklo vrijeme napada',

  // ---------- veliki natpisi (hype) ----------
  'hype.ankleBreaker':'ANKLE BREAKER!',
  'hype.slomioTi':'{ime} ti je slomio gležnjeve',
  'hype.naPodu':'{ime} je na podu',
  'hype.sjeoSi':'SJEO SI!',
  'hype.sheSatDown':'SHE SAT DOWN!',
  'hype.heSatDown':'HE SAT DOWN!',
  'hype.krosover':'KROSOVER!',
  'hype.ostavio':'{ime} ga je ostavio',
  'hype.prosaoTe':'{ime} te prošao',
  'hype.zakucavanje':'ZAKUCAVANJE!',
  'hype.twoHand':'TWO-HAND SLAM!',
  'hype.oneHand':'ONE-HAND JAM!',
  'hype.reverse':'REVERSE!',
  'hype.alleyOop':'ALLEY-OOP!',
  'hype.blok':'BLOK!',
  'hype.kazeNe':'{ime} kaže ne',
  'hype.poster':'POSTER!',
  'hype.posterTwo':'Two-hand · ',
  'hype.posterOne':'One-hand · ',
  'hype.posterRev':'Reverse · ',
  'hype.preko':'{ime} preko: ',

  // ---------- kratke poruke igraču (feedback) ----------
  'fb.krozNoge':'Kroz noge',
  'fb.krosover':'Krosover',
  'fb.spin':'Spin',
  'fb.finta':'Finta',
  'fb.prvoIznesi':'Prvo iznesi loptu',
  'fb.alleyOop':'Alley-oop',
  'fb.savrseno':'Savršeno',
  'fb.rano':'Rano',
  'fb.kasno':'Kasno',
  'fb.iznesena':'Iznesena',

  // ---------- naredbe botu suigraču (oblačić) ----------
  'naredba.pritisni':'Pritisni!',
  'naredba.sutiraj':'Šutiraj!',
  'naredba.dajLoptu':'Daj loptu!',
  'naredba.alleySkoci':'Alley-oop! Skoči!',

  // ---------- rivali i provokacije ----------
  'rival.provokacije':['Opet ti?','Pamtim te.','Premalo, prekasno.','Idi kući.','Nisi spreman.','Ajde, pokaži nešto.'],
  'rival.sjedi':'Sjedi.',
  'rival.neUMojojKuci':'Ne u mojoj kući.',
  'rival.oznaka':'⚔ Rival',
  'rival.porazen':'RIVAL DEFEATED',
  'rival.porazenPod':'{ime} · „{nadimak}“ · +75 REP',
  'rival.pamti':'{ime} REMEMBERS YOU.',
  'rival.pobijedioTe':'pobijedio te {n}×',
  'rival.jacaObrana':'sljedeći put igra jaču obranu',
  'rival.pamtiTe':'pamti te',
  'rival.naslov':'RIVAL: {ime}',

  // ---------- uloge i osobnosti igrača ----------
  'uloga.brziDribler':'Brzi dribler',
  'uloga.brzaDriblerka':'Brza driblerka',
  'uloga.zakucavac':'Zakucavač',
  'uloga.suter':'Šuter',
  'uloga.suterica':'Šuterica',
  'uloga.obrambeni':'Obrambeni',
  'osobnost.streetballer':'Streetballer',
  'osobnost.sniper':'Sniper',
  'osobnost.slasher':'Slasher',
  'osobnost.defender':'Defender',
  'osobnost.showman':'Showman',

  // ---------- natpisi na zidovima terena ----------
  'zid.street':'STREET', 'zid.ball':'BALL',
  'zid.igraj':'IGRAJ', 'zid.bezStraha':'BEZ STRAHA',
  'zid.2na2':'2 NA 2', 'zid.kraljTerena':'KRALJ TERENA',

  // ---------- profil ----------
  'profil.zadanoIme':'IGRAČ',   // ime igrača u novom profilu (poslije ga igrač može promijeniti)

  // ---------- solo trening ----------
  'solo.naslov':'Solo trening',
  'solo.pod':'Šutiraj, zakucavaj i driblaj koliko želiš',

  // ---------- ulični turnir ----------
  'turnir.naslov':'🏆 Ulični turnir',
  'turnir.opis':'Tri utakmice, tri terena, sve jači protivnici. Izgubiš li, igraš to kolo ponovno.',
  'turnir.igraj':'Igraj',
  'turnir.igrajKolo':'Igraj {kolo}',
  'turnir.noviTurnir':'Novi turnir',
  'turnir.do':'do {n}',
  'turnir.protivEkipe':'{kolo} protiv ekipe {tim}',
  'turnir.prvaci':'🏆 Prvaci grada!',
  'turnir.prvaciPod':'Finale dobiveno {rez}. Osvojio si ulični turnir!',
  'turnir.pobjeda':'Pobjeda {rez}',
  'turnir.sljedece':'Sljedeće: {kolo} protiv ekipe {tim}',
  'turnir.poraz':'Poraz {rez}',
  'turnir.ponovno':'Pokušaj ponovno: {kolo}',
  'turnir.kolo.0':'Četvrtfinale', 'turnir.kolo.1':'Polufinale', 'turnir.kolo.2':'Finale',
  'turnir.mjesto.0':'Dnevni teren uz more', 'turnir.mjesto.1':'Teren pod mostom', 'turnir.mjesto.2':'Noćni teren na krovu',
  'turnir.ana.nadimak':'Snajperica s Placa', 'turnir.ana.recenica':'Ne promašujem dvaput.',
  'turnir.miro.nadimak':'Kralj rive', 'turnir.miro.recenica':'Obruč je moj.',
  'turnir.nika.nadimak':'Munja ispod mosta', 'turnir.nika.recenica':'Nisi me ni vidio.',
  'turnir.toni.nadimak':'Zid ispod mosta', 'turnir.toni.recenica':'Ovuda se ne prolazi.',
  'turnir.sara.nadimak':'Hladna ruka', 'turnir.sara.recenica':'Hladno. Kao uvijek.',
  'turnir.kai.nadimak':'Kralj krova', 'turnir.kai.recenica':'Ovo je MOJ krov.',
  // statistika igrača (kartice nakon utakmice) i Street Rep
  'stat.pts':'PTS', 'stat.3pt':'3PT', 'stat.dunks':'DUNKS', 'stat.steals':'STEALS', 'stat.blocks':'BLOCKS', 'stat.ankle':'ANKLE BREAKERS',
  'stat.mvp':'MVP · ',
  'rep.dobitak':'REP +{n}',
  'rep.razina':'STREET REP · LEVEL {n}',
  'rep.turnir':'TURNIR: LEVEL {a} → LEVEL {b}',
  'rep.gore':'LEVEL {a} → LEVEL {b}',

  // ---------- gađanje trica ----------
  'trice.bodovi':'bodovi',
  'trice.rekord':'rekord',
  'trice.noviRekord':'Novi rekord!',
  'trice.opet':'Opet',
  'trice.stalak.0':'Lijevi kut', 'trice.stalak.1':'Sredina', 'trice.stalak.2':'Desni kut',
  'trice.spremni':'Spremni?',
  'trice.upute':'1. pritisak: smjer (X) · 2. pritisak: daljina (Y)',
  'trice.perfect':'PERFECT! +{n} s',
  'trice.miss':'MISS · ',
  'trice.good':'GOOD · ',
  'trice.lijevo':'lijevo', 'trice.desno':'desno', 'trice.predugo':'predugo', 'trice.prekratko':'prekratko',
  'trice.moneyBall':'MONEY BALL!',
  'trice.vrijeme':'Vrijeme!',
  'trice.ocjena.18':'Savršeno!', 'trice.ocjena.14':'Vatra!', 'trice.ocjena.10':'Snajperist', 'trice.ocjena.6':'Solidno', 'trice.ocjena.0':'Treba još treninga',
  'trice.info':'Pogođeno {m} od 15 lopti · PERFECT ×{p}',
  'trice.preostalo':' · preostalo {s} s',
  'trice.top':'LOCAL BEST · TOP 10 · {tezina}',
  'trice.redak':'{m}/15 · perfect {p} · {dan}',

  // ---------- online ----------
  'online.naslov':'👥 Igraj s prijateljem',
  'online.nacin':'Način igre',
  'online.coop':'Zajedno protiv računala',
  'online.vs':'1 na 1 + AI',
  'online.team':'2 na 2 (do 4)',
  'online.napravi':'Napravi igru',
  'online.kodIgre':'Kod igre',
  'online.posalji':'📤 Pošalji poziv',
  'online.imasKod':'Imaš kod od prijatelja?',
  'online.primjer':'npr. KX7P',
  'online.pridruzi':'Pridruži se',
  'online.naslovCoop':'ZAJEDNO!', 'online.naslovVs':'1 NA 1 + AI', 'online.naslovTeam':'2 NA 2', 'online.multiplayer':'MULTIPLAYER',
  'online.spojeni':'✅ Spojeni: ',
  'online.cekamJos':' · Čekam još igrača ili klikni Kreni.',
  'online.posaljiKod':'Pošalji kod prijateljima. Čekam da se spoje…',
  'online.uvod':'Jedan igrač napravi igru, a ostali upišu njegov kod.',
  'online.pripremam':'Pripremam igru…',
  'online.nemaPeer':'⚠️ Ne mogu učitati PeerJS. Provjeri internet vezu.',
  'online.vezaPrekinuta':'Veza prekinuta',
  'online.sviIzasli':'Svi prijatelji su izašli',
  'online.izasao':'{tag} je izašao',
  'online.racunaloPreuzima':'Računalo preuzima',
  'online.upisiKod':'Upiši kod od 4 znaka.',
  'online.spajam':'Spajam se…',
  'online.spojeno':'✅ Spojeno! Čeka se da domaćin pokrene utakmicu…',
  'online.nemaIgre':'⚠️ Nema igre s tim kodom. Provjeri kod.',
  'online.zauzet':'⚠️ Kod je zauzet, klikni ponovno Napravi igru.',
  'online.nemaServera':'⚠️ Nema veze sa serverom za spajanje. Multiplayer radi kad je igra na tvom https serveru, ne unutar Claude pregleda.',
  'online.greska':'⚠️ Greška pri spajanju ({t}).',
  'online.nepoznato':'nepoznato',
  'online.prijateljIzasao':'Prijatelj je izašao iz igre',
  'online.pokusajPonovno':'Veza prekinuta. Pokušaj ponovno.',
  'online.tiSiP1':'Ti si P1 · {sastav}',
  'online.tiSi':'Ti si {tag} ({boja})',
  'online.spojenoTiSi':'✅ Spojeno! Ti si {tag} ({boja}). Čeka se da domaćin pokrene utakmicu…',
  'online.puna':'⚠️ Igra je puna ili je već počela.',
  'online.poziv':'Igraj košarku sa mnom! Kod igre: {kod}',
  'online.kopirano':'📋 Poziv je kopiran, zalijepi ga prijatelju u poruku.',
  'online.posaljiKodRucno':'Pošalji prijatelju kod: <b>{kod}</b>',

  // ---------- lokalno ----------
  'lokalno.naslov':'🎮 Lokalno 2 na 2',
  'lokalno.opis':'Do 4 igrača na jednom uređaju. Svatko pritisne <b>šut</b> na svojim kontrolama da se pridruži, <b>lijevo/desno</b> bira ekipu, <b>dribling</b> izlazi. Prazna mjesta igra računalo.',
  'lokalno.tipkeA':'<b>Tipkovnica A</b> WASD · <kbd>Space</kbd> šut · <kbd>E</kbd> dodaj · <kbd>Q</kbd> dribling · <kbd>R</kbd> alley · lijevi <kbd>Shift</kbd> sprint',
  'lokalno.tipkeB':'<b>Tipkovnica B</b> strelice · <kbd>J</kbd> šut · <kbd>K</kbd> dodaj · <kbd>L</kbd> dribling · <kbd>U</kbd> alley · desni <kbd>Shift</kbd> sprint',
  'lokalno.kontroler':'<b>Kontroler</b> palica · <kbd>A</kbd> šut · <kbd>X</kbd> dodaj · <kbd>B</kbd> dribling · <kbd>Y</kbd> alley · <kbd>RB</kbd> sprint · <kbd>Start</kbd> kreni',
  'lokalno.igrac1':'{n} igrač · Enter ili Start za početak',
  'lokalno.igraca':'{n} igrača · Enter ili Start za početak',
  'lokalno.pritisni':'Pritisni šut na svojoj tipkovnici ili kontroleru',
  'lokalno.naslovIgre':'LOKALNO!',

  // ---------- karijera ----------
  'karijera.naslov':'⭐ Karijera',
  'karijera.liga.kvart':'Kvart', 'karijera.liga.grad':'Grad', 'karijera.liga.regija':'Regija', 'karijera.liga.drzava':'Država', 'karijera.liga.legende':'Legende',
  'karijera.sef.kvart.nadimak':'Šerif kvarta', 'karijera.sef.kvart.recenica':'Ovo je moj kvart.',
  'karijera.sef.grad.nadimak':'Gradonačelnik terena', 'karijera.sef.grad.recenica':'U mom gradu ja dijelim lopte.',
  'karijera.sef.regija.nadimak':'Vuk s juga', 'karijera.sef.regija.recenica':'Regija ima samo jednog kralja.',
  'karijera.sef.drzava.nadimak':'Kapetan države', 'karijera.sef.drzava.recenica':'Do finala dođu mnogi. Dalje nitko.',
  'karijera.sef.legende.nadimak':'Posljednja legenda', 'karijera.sef.legende.recenica':'Svi dođu po krunu. Nitko je ne odnese.',
  'karijera.finaleLige':'FINALE LIGE · {liga}',
  'karijera.turnirKolo':'TURNIR · {kolo}',
  'karijera.turnirKolo.0':'ČETVRTFINALE', 'karijera.turnirKolo.1':'POLUFINALE', 'karijera.turnirKolo.2':'FINALE',
  'karijera.sefLige':'ŠEF LIGE: {ime}',
  'karijera.trice':'Trice {n} × 2',
  'karijera.zakucavanja':'Zakucavanja {n} × 3',
  'karijera.kradje':'Krađe {n} × 2',
  'karijera.bodaULigi':'+3 boda u ligi {liga}',
  'karijera.prvakLige':'🏆 Prvak lige {liga}! Nova liga: {nova}',
  'karijera.prvakLegendi':'👑 PRVAK LEGENDI! Najbolji na asfaltu.',
  'karijera.sefBoljiBio':'Šef lige {ime} je bio bolji. Pokušaj ponovno.',
  'karijera.ispao':'Ispao si s turnira.',
  'karijera.prolaz':'Prolaz dalje! Sljedeće: {kolo}.',
  'karijera.prolazKolo.1':'polufinale', 'karijera.prolazKolo.2':'finale',
  'karijera.nagradaTurnira':'🏆 Nagrada turnira',
  'karijera.osvojioTurnir':'Osvojio si turnir!',
  'karijera.razinaGore':'⬆ Razina igrača {n}!',
  'karijera.rezultat':'{ishod} {a} : {b}',
  'karijera.trening':'Trening: {n} / 18',
  'karijera.pogodaka':'Pogodaka {n} → {k} × 0.5',
  'karijera.savrsenih':'Savršenih {n} × 0.2',
  'karijera.sutTricaGore':'Šut i trica +{d} (šut {s}, trica {t})',
  'karijera.novcici':'Novčići',
  'karijera.rep':'Rep',
  'karijera.liga':'Liga',
  'karijera.razina':'Razina {n}',
  'karijera.bodoviULigi':'Bodovi u ligi',
  'karijera.igrajUtakmicu':'Igraj utakmicu',
  'karijera.finaleOtvoreno':'⚔ Finale lige',
  'karijera.finaleZakljucano':'🔒 Finale lige',
  'karijera.sef':'Šef: {ime} „{nadimak}“ · {tim}',
  'karijera.otkljucavaSe':'otključava se s {n} bodova',
  'karijera.turnir':'🏆 Turnir',
  'karijera.turnirNastavi':'nastavi · kolo {n}/3',
  'karijera.turnirKotizacija':'kotizacija {c} · nagrada {n}',
  'karijera.treningTrica':'🎯 Trening trica',
  'karijera.besplatno':'besplatno {n}/3 danas',
  'karijera.cijenaTreninga':'50 novčića',
  'karijera.suigrac':'Suigrač',
  'karijera.album':'📒 Album',
  'karijera.ekipaNaslov':'ALBUM',
  'karijera.trgovina':'🛒 Trgovina',
  'karijera.trgovinaPod':'paketi naljepnica od {n} 🪙',
  'karijera.dnevna':'🎁 Dnevna naljepnica',
  'karijera.dnevnaSpremna':'besplatno, jednom dnevno',
  'karijera.dnevnaSutra':'uzeta · nova sutra',
  'album.doOtkljucavanja':'{n} / {m} do otključavanja',
  'album.doRazine':'{n} / {m} do razine {r}',
  'album.maks':'Najviša razina',

  // ---------- trgovina i paketi naljepnica (trgovina.js) ----------
  'trgovina.naslov':'TRGOVINA',
  'trgovina.naljepnica':'naljepnica: {n}',
  'trgovina.kupi':'Kupi · {c} 🪙',
  'trgovina.otvoriPoklon':'🎁 Otvori besplatni ({n})',
  'trgovina.zajamcenoSljedeci':'⭐ Sljedeći paket ima zajamčenu epsku naljepnicu!',
  'trgovina.zajamceno':'Zajamčena epska naljepnica za {n} paketa.',
  'trgovina.pravila':'Svaki {s}. paket ima barem jednu epsku naljepnicu. Botovi koje još nemaš ispadaju češće. Naljepnica bota na najvišoj razini vrijedi {c} 🪙.',
  'paket.ime.obicni':'Obični paket', 'paket.ime.veliki':'Veliki paket',
  'paket.naslov.obicni':'OBIČNI PAKET', 'paket.naslov.veliki':'VELIKI PAKET', 'paket.naslovDnevna':'DNEVNA NALJEPNICA',
  'paket.dodir':'Dodirni kartu da je okreneš',
  'paket.oznakaNovi':'NOVI BOT!',
  'paket.oznakaRazina':'RAZINA {n}!',
  'paket.oznakaNovcici':'+{n} 🪙',
  'paket.plus':'+{n} {ime}',
  'paket.noviBot':' (NOVI BOT OTKLJUČAN!)',
  'paket.razina':' (RAZINA {n}!)',
  'paket.novcici':' (+{n} 🪙)',
  'karijera.otkljucano':'{n} / {m} otključano',
  'karijera.trebaNaljepnica':'🔒 treba {n} naljepnica',
  'karijera.razinaBota':'Razina {n} / {m}',
  'karijera.oznakaSuigrac':'suigrač',
  'karijera.razinaKratko':'R{n}',
  'osobina.sut':'Šut', 'osobina.trica':'Trica', 'osobina.zakucavanje':'Zakucavanje', 'osobina.brzina':'Brzina',
  'osobina.dribling':'Dribling', 'osobina.kradja':'Krađa', 'osobina.blok':'Blok', 'osobina.skok':'Skok',

  // ---------- botovi suigrači (botovi.js) ----------
  'botTip.suter':'Šuter', 'botTip.suter.opis':'Čeka na liniji za 3 i šutira trice',
  'botTip.centar':'Centar', 'botTip.centar.opis':'Ostaje pod košem, skače na odbijance i blokira',
  'botTip.allround':'All-round', 'botTip.allround.opis':'Pomalo od svega',
  'botTip.organizator':'Organizator', 'botTip.organizator.opis':'Više dodaje i traži alley-oop',
  'botTip.branic':'Branič', 'botTip.branic.opis':'Agresivno pritišće igrača s loptom i krade',
  'botTip.zakucavac':'Zakucavač', 'botTip.zakucavac.opis':'Reže prema košu i zakucava',
  'rijetkost.obicni':'Obični', 'rijetkost.rijetki':'Rijetki', 'rijetkost.epski':'Epski', 'rijetkost.legendarni':'Legendarni',
  'bot.dre.posebnost':'Pouzdan u svemu. Tvoj prvi suigrač s kvarta.',
  'bot.kiki.posebnost':'Iz kuta ne promašuje. Ispod koša se izgubi.',
  'bot.bruno.posebnost':'Širok kao ormar. Svaka odbijanca je njegova.',
  'bot.leo.posebnost':'Vidi dodavanje prije nego što se otvori.',
  'bot.vera.posebnost':'Diše ti za vratom od check linije do koša.',
  'bot.jole.posebnost':'Ne zna za polaganje. Samo zakucavanje.',
  'bot.tara.posebnost':'Hladna ruka: pod pritiskom šutira još bolje.',
  'bot.medo.posebnost':'Tko uđe u reket, izađe bez lopte.',
  'bot.ogi.posebnost':'Dodaje iza leđa, a da ni ne pogleda.',
  'bot.vuk.posebnost':'Lovi loptu kao vuk. Nitko ne dribla lagano pored njega.',
  'bot.iskra.posebnost':'Leti iznad svih. Obruč joj se boji.',
  'bot.maestro.posebnost':'Legenda asfalta. Igra dirigira kao orkestar.'};

const JEZICI={hr:HR};
// jezik iz spremljenog profila (postavke.jezik), pročitan jednom pri pokretanju izravno iz localStorage:
// tekstovi.js se učitava prije profil.js, a Profil pri stvaranju novog profila i sam treba T()
const jezik=(()=>{ let j=null;
  return ()=>{ if(j) return j;
    try{ const p=JSON.parse(localStorage.getItem('kosarka-profil')); j=p&&p.postavke&&JEZICI[p.postavke.jezik]?p.postavke.jezik:'hr'; }catch(e){ j='hr'; }
    return j; }; })();
function T(k,par){ const r=(JEZICI[jezik()]||HR)[k]??HR[k];
  if(r==null){ console.warn('T: nema teksta za ključ',k); return k; }
  if(!par||typeof r!=='string') return r;
  return r.replace(/\{(\w+)\}/g,(m,x)=>par[x]!=null?par[x]:m); }
// statični natpisi u HTML-u (data-t, data-t-html, data-t-aria, data-t-ph)
function primijeniTekstove(root){ const R=root||document;
  R.querySelectorAll('[data-t]').forEach(el=>el.textContent=T(el.dataset.t));
  R.querySelectorAll('[data-t-html]').forEach(el=>el.innerHTML=T(el.dataset.tHtml));
  R.querySelectorAll('[data-t-aria]').forEach(el=>el.setAttribute('aria-label',T(el.dataset.tAria)));
  R.querySelectorAll('[data-t-ph]').forEach(el=>el.setAttribute('placeholder',T(el.dataset.tPh))); }
document.documentElement.lang=jezik();
