// Shared entry checks and session results for all games.
(function () {
  if (sessionStorage.getItem('ageOk') !== '1') {
    window.location.replace('splash.html');
  } else if (!sessionStorage.getItem('playerName')) {
    window.location.replace('index.html');
  }
  var previous = Object.create(null);
  window.resetPartyResultsTracking = function () { previous = Object.create(null); };
  window.savePartyResults = function (counts, allowRefund) {
    var totals;
    try { totals = JSON.parse(sessionStorage.getItem('totalSips') || '{}'); }
    catch (e) { totals = {}; }
    if (!totals || typeof totals !== 'object' || Array.isArray(totals)) totals = {};
    Object.keys(counts).forEach(function (name) {
      var count = Math.max(0, Number(counts[name]) || 0);
      var change = count - (previous[name] || 0);
      if (!allowRefund) change = Math.max(0, change);
      Object.defineProperty(totals, name, {
        value: Math.max(0, (Number(totals[name]) || 0) + change),
        enumerable: true, configurable: true, writable: true
      });
      previous[name] = count;
    });
    sessionStorage.setItem('totalSips', JSON.stringify(totals));
  };
  window.addEventListener('pagehide', function () {
    if (window.peer) window.peer.destroy();
  });
})();

// Six readable characters; IDs are namespaced separately for each game.
function generateRoomCode() {
  var alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  var bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, function (n) { return alphabet[n % alphabet.length]; }).join('');
}
