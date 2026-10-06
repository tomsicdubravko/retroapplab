// ===== Pčelica - početni ekran: prozor "Kako se igra", crtić (YouTube playlista), najbolji rezultat =====
const helpBtn = document.getElementById('helpBtn');
const cartoonBtn = document.getElementById('cartoonBtn');
const helpModal = document.getElementById('helpModal');
const cartoonModal = document.getElementById('cartoonModal');
const cartoonFrame = document.getElementById('cartoonFrame');
const subtitleEl = document.getElementById('subtitle');
const bestLine = document.getElementById('bestLine');
const CARTOON_SRC = 'https://www.youtube-nocookie.com/embed/videoseries?list=PLCUbhPOfgGdg&rel=0';
const BEST_KEY = 'pcelica-best';

// dok je otvoren neki prozor, igra ne smije krenuti (core.js doJump i gumbi Start / Igraj u dvoje to provjeravaju)
function uiModalOpen() {
  return !helpModal.classList.contains('hidden') || !cartoonModal.classList.contains('hidden');
}

function openModal(modal) {
  holding = false;
  jumpQueued = false;
  if (document.activeElement) document.activeElement.blur(); // razmak/Enter ne smije "kliknuti" Start ispod prozora
  modal.classList.remove('hidden');
  modal.querySelector('.modalClose').focus();
}

function closeModal(modal) {
  modal.classList.add('hidden');
  if (modal === cartoonModal) cartoonFrame.innerHTML = ''; // uklanjanje iframea zaustavlja video
}

helpBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  showHelpTab('igra');
  openModal(helpModal);
});

cartoonBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  const f = document.createElement('iframe');
  f.src = CARTOON_SRC;
  f.title = 'Pčelica - crtić';
  f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
  f.allowFullscreen = true;
  f.referrerPolicy = 'strict-origin-when-cross-origin'; // bez referrera YouTube javlja "Error 153"
  cartoonFrame.innerHTML = '';
  cartoonFrame.appendChild(f);
  openModal(cartoonModal);
});

for (const modal of [helpModal, cartoonModal]) {
  modal.querySelector('.modalClose').addEventListener('click', (e) => { e.stopPropagation(); closeModal(modal); });
  // klik na zatamnjenu pozadinu zatvara prozor; ništa ne prolazi do igre
  modal.addEventListener('pointerdown', (e) => e.stopPropagation());
  modal.addEventListener('click', (e) => {
    e.stopPropagation();
    if (e.target === modal) closeModal(modal);
  });
}

window.addEventListener('keydown', (e) => {
  if (!uiModalOpen()) return;
  if (e.code === 'Escape') {
    closeModal(helpModal);
    closeModal(cartoonModal);
  }
}, true);

function showHelpTab(name) {
  for (const t of helpModal.querySelectorAll('.helpTab')) t.classList.toggle('active', t.dataset.tab === name);
  for (const p of helpModal.querySelectorAll('.helpPane')) p.classList.toggle('hidden', p.dataset.pane !== name);
  helpModal.querySelector('.modalBody').scrollTop = 0;
}
for (const t of helpModal.querySelectorAll('.helpTab')) {
  t.addEventListener('click', (e) => { e.stopPropagation(); showHelpTab(t.dataset.tab); });
}

// ---------- Naslov i najbolji rezultat ----------
// poziva se kad overlay pokazuje poruku na kraju igre umjesto naslova (podnaslov tada ne treba)
function setOverlayTitle(text) {
  document.querySelector('#overlay h1').textContent = text;
  subtitleEl.classList.add('hidden');
}

function loadBest() {
  try {
    const v = JSON.parse(localStorage.getItem(BEST_KEY));
    if (v && typeof v.score === 'number') return v;
  } catch (err) { /* nema spremljenog ili je pohrana blokirana */ }
  return null;
}

// poziva se iz core.js finalizeGameOver()
function saveBest(sc, dist) {
  const old = loadBest() || { score: 0, dist: 0 };
  const best = { score: Math.max(old.score, sc), dist: Math.max(old.dist, dist) };
  try { localStorage.setItem(BEST_KEY, JSON.stringify(best)); } catch (err) { /* ignore */ }
  showBest();
}

function showBest() {
  const b = loadBest();
  if (!b || (b.score <= 0 && b.dist <= 0)) { bestLine.classList.add('hidden'); return; }
  bestLine.textContent = '🏆 Najbolje: ' + b.score + ' 🌼 · ' + b.dist + ' m';
  bestLine.classList.remove('hidden');
}

showBest();
