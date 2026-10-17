// najava.js — tekstualni opis i glasovna najava šahovskih poteza
// Koriste ga index.html, online.html i pristupacni.html (uz chess-engine.js)

var NAJAVA_FIGURE = { K: "kralj", Q: "dama", R: "top", B: "lovac", N: "skakač", P: "pješak" };
var NAJAVA_FIGURE_AK = { K: "kralja", Q: "damu", R: "topa", B: "lovca", N: "skakača", P: "pješaka" };
var NAJAVA_KLJUC = "dubch_najava_poteza";

// [r,c] -> "e4"; za govor "e 4" (slovo i broj odvojeno)
function najavaPolje(r, c) { return "abcdefgh"[c] + (8 - r); }
function najavaPoljeGovor(r, c) { return "abcdefgh"[c] + " " + (8 - r); }

// Opis poteza iz ploče prije i poslije. status: null | "check" | "checkmate" | "stalemate"
function najavaOpis(prije, poslije, from, to, status, opts) {
  opts = opts || {};
  var P = opts.polje || najavaPoljeGovor;
  var piece = prije[from[0]][from[1]];
  if (!piece) return "";
  var col = piece[0], t = piece[1];
  var strana = col === "w" ? "Bijeli" : "Crni";
  var tekst;
  if (t === "K" && Math.abs(to[1] - from[1]) === 2) {
    tekst = strana + ": " + (to[1] === 6 ? "mala rokada" : "velika rokada");
  } else {
    var cilj = prije[to[0]][to[1]];
    var ep = false;
    if (!cilj && t === "P" && from[1] !== to[1]) { cilj = (col === "w" ? "b" : "w") + "P"; ep = true; }
    var nova = poslije[to[0]][to[1]];
    var promo = t === "P" && nova && nova[1] !== "P" ? nova[1] : null;
    if (promo && !cilj) {
      tekst = strana + ": pješak na " + P(to[0], to[1]) + " promovira u " + NAJAVA_FIGURE_AK[promo];
    } else {
      tekst = strana + ": " + NAJAVA_FIGURE[t] + " s " + P(from[0], from[1]);
      if (cilj) tekst += " uzima " + NAJAVA_FIGURE_AK[cilj[1]] + (ep ? " u prolazu" : "") + " na " + P(to[0], to[1]);
      else tekst += " na " + P(to[0], to[1]);
      if (promo) tekst += " i promovira u " + NAJAVA_FIGURE_AK[promo];
    }
  }
  if (status === "checkmate") tekst += ". Šah-mat! Pobijedio je " + (col === "w" ? "bijeli" : "crni") + ".";
  else if (status === "stalemate") tekst += ". Pat, remi.";
  else if (status === "check") tekst += ". Šah!";
  else tekst += ".";
  return tekst;
}

// Opis iz dvije ploče kad nije poznat from/to (traži figuru koja je nestala/pojavila se)
function najavaNadjiPotez(prije, poslije, col) {
  var from = null, to = null, kingFrom = null, kingTo = null;
  for (var r = 0; r < 8; r++) for (var c = 0; c < 8; c++) {
    var a = prije[r][c], b = poslije[r][c];
    if (a === b) continue;
    if (a && a[0] === col && !(b && b[0] === col)) { if (a[1] === "K") kingFrom = [r, c]; else if (!from) from = [r, c]; }
    if (b && b[0] === col && a !== b) { if (b[1] === "K") kingTo = [r, c]; else if (!to) to = [r, c]; }
  }
  if (kingFrom && kingTo) return { from: kingFrom, to: kingTo };
  if (from && to) return { from: from, to: to };
  return null;
}

function najavaUkljucena() {
  try { return localStorage.getItem(NAJAVA_KLJUC) === "1"; } catch (e) { return false; }
}
function najavaPostavi(v) {
  try { localStorage.setItem(NAJAVA_KLJUC, v ? "1" : "0"); } catch (e) {}
}

var najavaGlas = null;
function najavaOdaberiGlas() {
  if (!window.speechSynthesis) return null;
  var glasovi = window.speechSynthesis.getVoices() || [];
  for (var i = 0; i < glasovi.length; i++) if (/^hr/i.test(glasovi[i].lang)) return glasovi[i];
  return null;
}
if (window.speechSynthesis) {
  najavaGlas = najavaOdaberiGlas();
  try { window.speechSynthesis.addEventListener("voiceschanged", function () { najavaGlas = najavaOdaberiGlas(); }); } catch (e) {}
}

// Izgovori tekst; prekida prethodnu najavu. onEnd se zove i kad govor nije dostupan.
function najavaGovori(tekst, opts) {
  opts = opts || {};
  var gotovo = false;
  function kraj() { if (gotovo) return; gotovo = true; if (opts.onEnd) opts.onEnd(); }
  if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) { setTimeout(kraj, 0); return; }
  try {
    window.speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(tekst);
    if (!najavaGlas) najavaGlas = najavaOdaberiGlas();
    if (najavaGlas) { u.voice = najavaGlas; u.lang = najavaGlas.lang; } else { u.lang = "hr-HR"; }
    u.rate = opts.rate || 1;
    u.onend = kraj;
    u.onerror = kraj;
    window.speechSynthesis.speak(u);
    // sigurnosna mreža ako preglednik ne javi kraj govora
    setTimeout(kraj, 1500 + tekst.length * 110 / (opts.rate || 1));
  } catch (e) { setTimeout(kraj, 0); }
}
function najavaStop() {
  try { if (window.speechSynthesis) window.speechSynthesis.cancel(); } catch (e) {}
}
