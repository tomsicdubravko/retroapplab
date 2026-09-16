// chess-engine.js — piece tablice, zvuk, sah engine
// Globalne funkcije koje koriste index.html i online.html

    var PIECE_VAL = { K: 20000, Q: 900, R: 500, B: 330, N: 320, P: 100 };

    var TAB_P = [
      [0,0,0,0,0,0,0,0],[50,50,50,50,50,50,50,50],[10,10,20,30,30,20,10,10],
      [5,5,10,25,25,10,5,5],[0,0,0,20,20,0,0,0],[5,-5,-10,0,0,-10,-5,5],
      [5,10,10,-20,-20,10,10,5],[0,0,0,0,0,0,0,0]
    ];
    var TAB_N = [
      [-50,-40,-30,-30,-30,-30,-40,-50],[-40,-20,0,0,0,0,-20,-40],
      [-30,0,10,15,15,10,0,-30],[-30,5,15,20,20,15,5,-30],
      [-30,0,15,20,20,15,0,-30],[-30,5,10,15,15,10,5,-30],
      [-40,-20,0,5,5,0,-20,-40],[-50,-40,-30,-30,-30,-30,-40,-50]
    ];
    var TAB_B = [
      [-20,-10,-10,-10,-10,-10,-10,-20],[-10,0,0,0,0,0,0,-10],
      [-10,0,5,10,10,5,0,-10],[-10,5,5,10,10,5,5,-10],
      [-10,0,10,10,10,10,0,-10],[-10,10,10,10,10,10,10,-10],
      [-10,5,0,0,0,0,5,-10],[-20,-10,-10,-10,-10,-10,-10,-20]
    ];
    var TAB_R = [
      [0,0,0,0,0,0,0,0],[5,10,10,10,10,10,10,5],[-5,0,0,0,0,0,0,-5],
      [-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],
      [-5,0,0,0,0,0,0,-5],[0,0,0,5,5,0,0,0]
    ];
    var TAB_Q = [
      [-20,-10,-10,-5,-5,-10,-10,-20],[-10,0,0,0,0,0,0,-10],
      [-10,0,5,5,5,5,0,-10],[-5,0,5,5,5,5,0,-5],
      [0,0,5,5,5,5,0,-5],[-10,5,5,5,5,5,0,-10],
      [-10,0,5,0,0,0,0,-10],[-20,-10,-10,-5,-5,-10,-10,-20]
    ];
    var TAB_K = [
      [-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30],
      [-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30],
      [-20,-30,-30,-40,-40,-30,-30,-20],[-10,-20,-20,-20,-20,-20,-20,-10],
      [20,20,0,0,0,0,20,20],[20,30,10,0,0,10,30,20]
    ];
    var TABLES = { P: TAB_P, N: TAB_N, B: TAB_B, R: TAB_R, Q: TAB_Q, K: TAB_K };

    // ── SOUND ENGINE ────────────────────────────────────────────────────────
    var audioCtx = null;

    function getAudioCtx() {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === "suspended") audioCtx.resume();
      return audioCtx;
    }

    // Drveni klik — kratki noise burst s brzim decay-em
    function playMove() {
      try {
        var ctx = getAudioCtx();
        var t = ctx.currentTime;

        // Noise buffer (bijeli šum = drveni udar)
        var bufLen = ctx.sampleRate * 0.08;
        var buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
        var data = buf.getChannelData(0);
        for (var i = 0; i < bufLen; i++) {
          data[i] = (Math.random() * 2 - 1);
        }

        var source = ctx.createBufferSource();
        source.buffer = buf;

        // Bandpass filter — daje "tup drveni" karakter
        var filter = ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.value = 800;
        filter.Q.value = 1.2;

        // Gain s brzim decay-em
        var gain = ctx.createGain();
        gain.gain.setValueAtTime(0.55, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);

        // Drugi sloj — niski "knock"
        var osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(180, t);
        osc.frequency.exponentialRampToValueAtTime(60, t + 0.06);

        var gainOsc = ctx.createGain();
        gainOsc.gain.setValueAtTime(0.4, t);
        gainOsc.gain.exponentialRampToValueAtTime(0.001, t + 0.07);

        source.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.connect(gainOsc);
        gainOsc.connect(ctx.destination);

        source.start(t);
        source.stop(t + 0.08);
        osc.start(t);
        osc.stop(t + 0.08);
      } catch(e) {}
    }

    // Sah-mat — tri silazna tona, dramatican akord
    function playCheckmate() {
      try {
        var ctx = getAudioCtx();
        var t = ctx.currentTime;

        var notes = [220, 174.6, 130.8]; // A3, F3, C3 — moll akord
        for (var n = 0; n < notes.length; n++) {
          (function(freq, delay) {
            var osc = ctx.createOscillator();
            osc.type = "triangle";
            osc.frequency.value = freq;

            var gain = ctx.createGain();
            gain.gain.setValueAtTime(0, t + delay);
            gain.gain.linearRampToValueAtTime(0.3, t + delay + 0.04);
            gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 1.2);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(t + delay);
            osc.stop(t + delay + 1.3);
          })(notes[n], n * 0.18);
        }
      } catch(e) {}
    }

    // Jači udar — figura jede figuru
    function playCapture() {
      try {
        var ctx = getAudioCtx();
        var t = ctx.currentTime;

        var bufLen = ctx.sampleRate * 0.13;
        var buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
        var data = buf.getChannelData(0);
        for (var i = 0; i < bufLen; i++) data[i] = (Math.random() * 2 - 1);

        var source = ctx.createBufferSource();
        source.buffer = buf;
        var filter = ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.value = 500;
        filter.Q.value = 0.8;
        var gain = ctx.createGain();
        gain.gain.setValueAtTime(0.9, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.13);

        var osc1 = ctx.createOscillator();
        osc1.type = "sine";
        osc1.frequency.setValueAtTime(220, t);
        osc1.frequency.exponentialRampToValueAtTime(55, t + 0.11);
        var g1 = ctx.createGain();
        g1.gain.setValueAtTime(0.5, t);
        g1.gain.exponentialRampToValueAtTime(0.001, t + 0.11);

        var osc2 = ctx.createOscillator();
        osc2.type = "sine";
        osc2.frequency.setValueAtTime(110, t + 0.03);
        osc2.frequency.exponentialRampToValueAtTime(38, t + 0.13);
        var g2 = ctx.createGain();
        g2.gain.setValueAtTime(0.35, t + 0.03);
        g2.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

        source.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
        osc1.connect(g1); g1.connect(ctx.destination);
        osc2.connect(g2); g2.connect(ctx.destination);

        source.start(t); source.stop(t + 0.14);
        osc1.start(t); osc1.stop(t + 0.12);
        osc2.start(t + 0.02); osc2.stop(t + 0.15);
      } catch(e) {}
    }

    function initBoard() {
      var b = [];
      for (var i = 0; i < 8; i++) {
        b.push([null,null,null,null,null,null,null,null]);
      }
      var back = ["R","N","B","Q","K","B","N","R"];
      for (var c = 0; c < 8; c++) {
        b[0][c] = "b" + back[c];
        b[1][c] = "bP";
        b[6][c] = "wP";
        b[7][c] = "w" + back[c];
      }
      return b;
    }

    function getColor(p) { return p ? p[0] : null; }
    function getType(p)  { return p ? p[1] : null; }
    function onBoard(r, c) { return r >= 0 && r < 8 && c >= 0 && c < 8; }

    function getRawMoves(board, r, c, ep, cs) {
      var piece = board[r][c];
      if (!piece) return [];
      var col = getColor(piece);
      var t   = getType(piece);
      var opp = col === "w" ? "b" : "w";
      var moves = [];

      function addIfValid(nr, nc) {
        if (onBoard(nr, nc) && getColor(board[nr][nc]) !== col) {
          moves.push([nr, nc]);
        }
      }

      function slideTo(dr, dc) {
        var nr = r + dr;
        var nc = c + dc;
        while (onBoard(nr, nc)) {
          if (board[nr][nc]) {
            if (getColor(board[nr][nc]) === opp) moves.push([nr, nc]);
            break;
          }
          moves.push([nr, nc]);
          nr += dr;
          nc += dc;
        }
      }

      if (t === "P") {
        var dir   = col === "w" ? -1 : 1;
        var start = col === "w" ? 6 : 1;
        if (onBoard(r + dir, c) && !board[r + dir][c]) {
          moves.push([r + dir, c]);
          if (r === start && !board[r + 2 * dir][c]) {
            moves.push([r + 2 * dir, c]);
          }
        }
        var dcs = [-1, 1];
        for (var i = 0; i < dcs.length; i++) {
          var dc = dcs[i];
          if (onBoard(r + dir, c + dc)) {
            if (getColor(board[r + dir][c + dc]) === opp) {
              moves.push([r + dir, c + dc]);
            }
            if (ep && ep[0] === r + dir && ep[1] === c + dc) {
              moves.push([r + dir, c + dc]);
            }
          }
        }
      } else if (t === "N") {
        var knightMoves = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
        for (var i = 0; i < knightMoves.length; i++) {
          addIfValid(r + knightMoves[i][0], c + knightMoves[i][1]);
        }
      } else if (t === "B") {
        slideTo(-1,-1); slideTo(-1,1); slideTo(1,-1); slideTo(1,1);
      } else if (t === "R") {
        slideTo(-1,0); slideTo(1,0); slideTo(0,-1); slideTo(0,1);
      } else if (t === "Q") {
        slideTo(-1,-1); slideTo(-1,1); slideTo(1,-1); slideTo(1,1);
        slideTo(-1,0);  slideTo(1,0);  slideTo(0,-1); slideTo(0,1);
      } else if (t === "K") {
        var kingMoves = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
        for (var i = 0; i < kingMoves.length; i++) {
          addIfValid(r + kingMoves[i][0], c + kingMoves[i][1]);
        }
        if (cs) {
          var row = col === "w" ? 7 : 0;
          if (r === row && c === 4 && !isInCheck(board, col)) {
            if (cs[col + "K"] && !board[row][5] && !board[row][6] &&
                !isAttacked(board, row, 5, opp) && !isAttacked(board, row, 6, opp)) {
              moves.push([row, 6]);
            }
            if (cs[col + "Q"] && !board[row][3] && !board[row][2] && !board[row][1] &&
                !isAttacked(board, row, 3, opp) && !isAttacked(board, row, 2, opp)) {
              moves.push([row, 2]);
            }
          }
        }
      }

      return moves;
    }

    function isInCheck(board, col) {
      var kr = -1;
      var kc = -1;
      for (var r = 0; r < 8; r++) {
        for (var c = 0; c < 8; c++) {
          if (board[r][c] === col + "K") { kr = r; kc = c; }
        }
      }
      var opp = col === "w" ? "b" : "w";
      for (var r = 0; r < 8; r++) {
        for (var c = 0; c < 8; c++) {
          if (getColor(board[r][c]) === opp) {
            var ms = getRawMoves(board, r, c, null, null);
            for (var i = 0; i < ms.length; i++) {
              if (ms[i][0] === kr && ms[i][1] === kc) return true;
            }
          }
        }
      }
      return false;
    }

    function isAttacked(board, tr, tc, byCol) {
      for (var r = 0; r < 8; r++) {
        for (var c = 0; c < 8; c++) {
          if (getColor(board[r][c]) === byCol) {
            var ms = getRawMoves(board, r, c, null, null);
            for (var i = 0; i < ms.length; i++) {
              if (ms[i][0] === tr && ms[i][1] === tc) return true;
            }
          }
        }
      }
      return false;
    }

    function applyMove(board, from, to, ep, cs) {
      var b = [];
      for (var i = 0; i < 8; i++) {
        b.push(board[i].slice());
      }
      var fr = from[0]; var fc = from[1];
      var tr = to[0];   var tc = to[1];
      var piece = b[fr][fc];
      var col = getColor(piece);
      var newEP = null;
      var newCS = { wK: cs.wK, wQ: cs.wQ, bK: cs.bK, bQ: cs.bQ };

      if (getType(piece) === "P" && ep && tr === ep[0] && tc === ep[1]) {
        b[col === "w" ? tr + 1 : tr - 1][tc] = null;
      }
      if (getType(piece) === "P" && Math.abs(tr - fr) === 2) {
        newEP = [(fr + tr) / 2, tc];
      }
      if (getType(piece) === "K") {
        newCS[col + "K"] = false;
        newCS[col + "Q"] = false;
        if (tc === 6 && fc === 4) { b[fr][5] = b[fr][7]; b[fr][7] = null; }
        if (tc === 2 && fc === 4) { b[fr][3] = b[fr][0]; b[fr][0] = null; }
      }
      if (getType(piece) === "R") {
        if (fc === 0) newCS[col + "Q"] = false;
        if (fc === 7) newCS[col + "K"] = false;
      }
      b[tr][tc] = piece;
      b[fr][fc] = null;
      return { board: b, enPassant: newEP, castling: newCS };
    }

    function getLegalMoves(board, r, c, ep, cs) {
      var piece = board[r][c];
      if (!piece) return [];
      var col = getColor(piece);
      var raw = getRawMoves(board, r, c, ep, cs);
      var legal = [];
      for (var i = 0; i < raw.length; i++) {
        var res = applyMove(board, [r, c], raw[i], ep, cs);
        if (!isInCheck(res.board, col)) {
          legal.push(raw[i]);
        }
      }
      return legal;
    }

    function getAllMoves(board, col, ep, cs) {
      var moves = [];
      for (var r = 0; r < 8; r++) {
        for (var c = 0; c < 8; c++) {
          if (getColor(board[r][c]) === col) {
            var legal = getLegalMoves(board, r, c, ep, cs);
            for (var i = 0; i < legal.length; i++) {
              moves.push({ from: [r, c], to: legal[i] });
            }
          }
        }
      }
      return moves;
    }

    function evalBoard(board) {
      var score = 0;
      for (var r = 0; r < 8; r++) {
        for (var c = 0; c < 8; c++) {
          var p = board[r][c];
          if (!p) continue;
          var col = getColor(p);
          var t   = getType(p);
          var tr  = col === "w" ? r : 7 - r;
          var val = PIECE_VAL[t] + (TABLES[t] ? TABLES[t][tr][c] : 0);
          score  += col === "w" ? val : -val;
        }
      }
      return score;
    }

    function mvvSort(moves, board) {
      return moves.slice().sort(function(a, b) {
        var va = board[a.to[0]][a.to[1]] ? PIECE_VAL[getType(board[a.to[0]][a.to[1]])] : 0;
        var vb = board[b.to[0]][b.to[1]] ? PIECE_VAL[getType(board[b.to[0]][b.to[1]])] : 0;
        return vb - va;
      });
    }

    function getCaptured(board, col) {
      var initial = { P: 8, R: 2, N: 2, B: 2, Q: 1 };
      var counts  = { P: 0, R: 0, N: 0, B: 0, Q: 0 };
      for (var r = 0; r < 8; r++)
        for (var c = 0; c < 8; c++) {
          var p = board[r][c];
          if (p && p[0] === col && counts[p[1]] !== undefined) counts[p[1]]++;
        }
      var result = [];
      var order = ['Q','R','B','N','P'];
      for (var i = 0; i < order.length; i++) {
        var t = order[i];
        for (var j = 0; j < initial[t] - counts[t]; j++) result.push(t);
      }
      return result;
    }

    function minimax(board, depth, alpha, beta, isMax, ep, cs) {
      var col   = isMax ? "w" : "b";
      var moves = mvvSort(getAllMoves(board, col, ep, cs), board);
      if (depth === 0 || moves.length === 0) {
        if (moves.length === 0) {
          return isInCheck(board, col) ? (isMax ? -50000 : 50000) : 0;
        }
        return evalBoard(board);
      }
      if (isMax) {
        var best = -Infinity;
        for (var i = 0; i < moves.length; i++) {
          var res = applyMove(board, moves[i].from, moves[i].to, ep, cs);
          var nb = res.board;
          if (getType(board[moves[i].from[0]][moves[i].from[1]]) === "P" &&
              (moves[i].to[0] === 0 || moves[i].to[0] === 7)) {
            nb[moves[i].to[0]][moves[i].to[1]] = "wQ";
          }
          var v = minimax(nb, depth - 1, alpha, beta, false, res.enPassant, res.castling);
          if (v > best) best = v;
          if (best > alpha) alpha = best;
          if (beta <= alpha) break;
        }
        return best;
      } else {
        var best = Infinity;
        for (var i = 0; i < moves.length; i++) {
          var res = applyMove(board, moves[i].from, moves[i].to, ep, cs);
          var nb = res.board;
          if (getType(board[moves[i].from[0]][moves[i].from[1]]) === "P" &&
              (moves[i].to[0] === 0 || moves[i].to[0] === 7)) {
            nb[moves[i].to[0]][moves[i].to[1]] = "bQ";
          }
          var v = minimax(nb, depth - 1, alpha, beta, true, res.enPassant, res.castling);
          if (v < best) best = v;
          if (best < beta) beta = best;
          if (beta <= alpha) break;
        }
        return best;
      }
    }

    function getBotMove(board, botCol, ep, cs, depth) {
      var isMax = botCol === "w";
      var moves = mvvSort(getAllMoves(board, botCol, ep, cs), board);
      if (moves.length === 0) return null;
      if (depth === 0) return moves[Math.floor(Math.random() * moves.length)];
      var bestMove = null;
      var bestVal  = isMax ? -Infinity : Infinity;
      for (var i = 0; i < moves.length; i++) {
        var res = applyMove(board, moves[i].from, moves[i].to, ep, cs);
        var nb  = res.board;
        if (getType(board[moves[i].from[0]][moves[i].from[1]]) === "P" &&
            (moves[i].to[0] === 0 || moves[i].to[0] === 7)) {
          nb[moves[i].to[0]][moves[i].to[1]] = botCol + "Q";
        }
        var v = minimax(nb, depth - 1, -Infinity, Infinity, !isMax, res.enPassant, res.castling);
        if (isMax ? v > bestVal : v < bestVal) {
          bestVal  = v;
          bestMove = moves[i];
        }
      }
      return bestMove;
    }

    // ── PERSONALIZIRANE TABLICE ────────────────────────────────────────────────
    // TRIFUNOVIĆ — zatvorena, solidna, pozicijska igra
    var TABLES_TRIF = {
      P: [[0,0,0,0,0,0,0,0],[50,50,50,50,50,50,50,50],
          [8,8,16,25,25,16,8,8],[4,4,8,22,22,8,4,4],
          [0,0,0,16,16,0,0,0],[5,-4,-8,0,0,-8,-4,5],
          [5,8,8,-18,-18,8,8,5],[0,0,0,0,0,0,0,0]],
      N: [[-50,-40,-30,-30,-30,-30,-40,-50],[-40,-20,0,5,5,0,-20,-40],
          [-30,0,12,16,16,12,0,-30],[-30,5,16,22,22,16,5,-30],
          [-30,0,16,22,22,16,0,-30],[-30,5,12,16,16,12,5,-30],
          [-40,-20,0,5,5,0,-20,-40],[-50,-40,-30,-30,-30,-30,-40,-50]],
      B: [[-20,-10,-10,-10,-10,-10,-10,-20],[-10,0,0,0,0,0,0,-10],
          [-10,0,6,10,10,6,0,-10],[-10,5,6,10,10,6,5,-10],
          [-10,0,10,10,10,10,0,-10],[-10,10,10,10,10,10,10,-10],
          [-10,5,0,0,0,0,5,-10],[-20,-10,-10,-10,-10,-10,-10,-20]],
      R: [[0,0,0,0,0,0,0,0],[3,7,7,7,7,7,7,3],[-5,0,0,0,0,0,0,-5],
          [-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],
          [-5,0,0,0,0,0,0,-5],[0,0,0,3,3,0,0,0]],
      Q: [[-20,-10,-10,-5,-5,-10,-10,-20],[-10,0,0,0,0,0,0,-10],
          [-10,0,3,3,3,3,0,-10],[-5,0,3,5,5,3,0,-5],
          [0,0,3,5,5,3,0,-5],[-10,3,3,5,5,3,0,-10],
          [-10,0,3,0,0,0,0,-10],[-20,-10,-10,-5,-5,-10,-10,-20]],
      K: [[-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30],
          [-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30],
          [-20,-30,-30,-40,-40,-30,-30,-20],[-10,-20,-20,-20,-20,-20,-20,-10],
          [20,20,0,0,0,0,20,20],[20,30,10,0,0,10,30,20]]
    };

    // FISCHER — aktivan, otvoren, agresivno kažnjava greške
    var TABLES_FISH = {
      P: [[0,0,0,0,0,0,0,0],[55,55,55,55,55,55,55,55],
          [12,12,22,32,32,22,12,12],[8,8,14,28,28,14,8,8],
          [2,2,5,24,24,5,2,2],[6,-4,-10,2,2,-10,-4,6],
          [6,10,10,-22,-22,10,10,6],[0,0,0,0,0,0,0,0]],
      N: [[-50,-38,-28,-25,-25,-28,-38,-50],[-38,-15,5,5,5,5,-15,-38],
          [-25,5,14,20,20,14,5,-25],[-25,8,20,28,28,20,8,-25],
          [-25,5,20,28,28,20,5,-25],[-25,8,14,20,20,14,8,-25],
          [-38,-15,5,8,8,5,-15,-38],[-50,-38,-28,-25,-25,-28,-38,-50]],
      B: [[-20,-10,-10,-10,-10,-10,-10,-20],[-10,8,0,0,0,0,8,-10],
          [-10,0,14,18,18,14,0,-10],[-10,8,14,18,18,14,8,-10],
          [-10,0,18,18,18,18,0,-10],[-10,18,18,18,18,18,18,-10],
          [-10,10,5,5,5,5,10,-10],[-20,-10,-10,-10,-10,-10,-10,-20]],
      R: [[2,2,2,5,5,2,2,2],[10,18,18,22,22,18,18,10],
          [-3,0,0,2,2,0,0,-3],[-4,0,0,2,2,0,0,-4],
          [-4,0,0,2,2,0,0,-4],[-4,0,0,2,2,0,0,-4],
          [-5,0,0,2,2,0,0,-5],[0,0,0,6,6,0,0,0]],
      Q: [[-20,-10,-10,-5,-5,-10,-10,-20],[-10,0,5,5,5,5,0,-10],
          [-10,5,8,8,8,8,5,-10],[-5,0,8,10,10,8,0,-5],
          [0,0,8,10,10,8,0,-5],[-10,5,8,10,10,8,5,-10],
          [-10,0,5,5,5,5,0,-10],[-20,-10,-10,-5,-5,-10,-10,-20]],
      K: [[-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30],
          [-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30],
          [-20,-30,-30,-40,-40,-30,-30,-20],[-10,-20,-20,-20,-20,-20,-20,-10],
          [20,20,0,0,0,0,20,20],[20,30,10,0,0,10,30,20]]
    };

    // KASPAROV — dinamički, žrtvuje materijal za inicijativu i napad
    var TABLES_KASP = {
      P: [[0,0,0,0,0,0,0,0],[60,60,60,65,65,60,65,65],
          [15,15,25,35,35,25,22,22],[10,10,18,30,30,18,16,16],
          [5,5,8,26,26,8,12,12],[8,0,-8,2,2,-8,5,8],
          [8,12,12,-22,-22,12,15,15],[0,0,0,0,0,0,0,0]],
      N: [[-50,-38,-28,-25,-25,-28,-38,-50],[-38,-12,8,8,8,8,-12,-38],
          [-22,8,18,25,25,18,8,-22],[-22,10,25,32,32,25,10,-22],
          [-22,8,25,32,32,25,8,-22],[-22,10,18,25,25,18,10,-22],
          [-38,-12,8,10,10,8,-12,-38],[-50,-38,-28,-25,-25,-28,-38,-50]],
      B: [[-18,-8,-8,-8,-8,-8,-8,-18],[-8,15,2,2,2,2,15,-8],
          [-8,5,18,22,22,18,5,-8],[-8,10,18,25,25,18,10,-8],
          [-8,5,22,25,25,22,5,-8],[-8,22,22,22,22,22,22,-8],
          [-8,14,5,5,5,5,14,-8],[-18,-8,-8,-8,-8,-8,-8,-18]],
      R: [[5,5,5,8,8,5,5,5],[15,25,25,28,28,25,25,15],
          [0,3,3,5,5,3,3,0],[-2,0,0,5,5,0,0,-2],
          [-2,0,0,5,5,0,0,-2],[-2,0,0,5,5,0,0,-2],
          [-5,0,0,5,5,0,0,-5],[0,0,3,8,8,3,0,0]],
      Q: [[-18,-8,-8,-2,-2,-8,-8,-18],[-8,5,8,8,8,8,5,-8],
          [-8,8,14,14,14,14,8,-8],[-2,5,14,18,18,14,5,-2],
          [-2,5,14,18,18,14,5,-2],[-8,8,14,14,14,14,8,-8],
          [-8,5,8,8,8,8,5,-8],[-18,-8,-8,-2,-2,-8,-8,-18]],
      K: [[-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30],
          [-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30],
          [-20,-30,-30,-40,-40,-30,-30,-20],[-10,-20,-20,-20,-20,-20,-20,-10],
          [20,20,0,0,0,0,20,20],[20,30,10,0,0,10,30,20]]
    };

    // ── TRIFUNOVIĆ BOT ────────────────────────────────────────────────────────
    function evalBoardTrifunovic(board) {
      var score = 0;
      for (var r = 0; r < 8; r++) for (var c = 0; c < 8; c++) {
        var p = board[r][c]; if (!p) continue;
        var col = getColor(p); var t = getType(p);
        var tr = col === "w" ? r : 7 - r;
        var val = PIECE_VAL[t] + (TABLES_TRIF[t] ? TABLES_TRIF[t][tr][c] : 0);
        score += col === "w" ? val : -val;
      }
      // Remi je OK — kompresija prema 0
      return Math.round(score * 0.85);
    }

    function minimaxTrifunovic(board, depth, alpha, beta, isMax, ep, cs) {
      var col = isMax ? "w" : "b";
      var moves = mvvSort(getAllMoves(board, col, ep, cs), board);
      if (depth === 0 || moves.length === 0) {
        return moves.length === 0
          ? (isInCheck(board, col) ? (isMax ? -50000 : 50000) : 0)
          : evalBoardTrifunovic(board);
      }
      var best = isMax ? -Infinity : Infinity;
      for (var i = 0; i < moves.length; i++) {
        var res = applyMove(board, moves[i].from, moves[i].to, ep, cs);
        var nb = res.board;
        if (getType(board[moves[i].from[0]][moves[i].from[1]])==="P" &&
            (moves[i].to[0]===0||moves[i].to[0]===7))
          nb[moves[i].to[0]][moves[i].to[1]] = (isMax?"w":"b")+"Q";
        var v = minimaxTrifunovic(nb, depth-1, alpha, beta, !isMax, res.enPassant, res.castling);
        if (isMax) { if (v>best) best=v; if (best>alpha) alpha=best; }
        else       { if (v<best) best=v; if (best<beta)  beta=best;  }
        if (beta <= alpha) break;
      }
      return best;
    }

    function getBotMoveTrifunovic(board, botCol, ep, cs, depth) {
      var b = board; var bk = null;
      if (botCol === "w") {
        // 1.d4
        if (b[6][3]==="wP"&&!b[5][3]&&!b[4][3])
          bk={from:[6,3],to:[4,3]};
        // 2.c4 — Kraljičin gambit vs d5
        else if (b[4][3]==="wP"&&b[3][3]==="bP"&&b[6][2]==="wP"&&!b[4][2])
          bk={from:[6,2],to:[4,2]};
        // 2.Nf3 — vs ostale odgovore
        else if (b[4][3]==="wP"&&b[3][3]!=="bP"&&b[7][6]==="wN"&&!b[5][5])
          bk={from:[7,6],to:[5,5]};
        // 3.Nc3 — d4 d5 c4
        else if (b[4][3]==="wP"&&b[3][3]==="bP"&&b[4][2]==="wP"&&b[7][1]==="wN"&&!b[5][2])
          bk={from:[7,1],to:[5,2]};
        // 4.Nf3 — d4 d5 c4 Nf6 Nc3
        else if (b[4][3]==="wP"&&b[3][3]==="bP"&&b[4][2]==="wP"&&b[5][2]==="wN"&&b[2][5]==="bN"&&b[7][6]==="wN"&&!b[5][5])
          bk={from:[7,6],to:[5,5]};
        // 5.Bg5 — klasični QGD (Nf3 Nc3 e6 Nf6)
        else if (b[5][5]==="wN"&&b[5][2]==="wN"&&b[2][5]==="bN"&&b[2][4]==="bP"&&b[7][2]==="wB"&&!b[4][5])
          bk={from:[7,2],to:[3,6]};
        // 6.e3 — solidni nastavak
        else if (b[3][6]==="wB"&&b[5][5]==="wN"&&b[4][3]==="wP"&&b[6][4]==="wP"&&!b[5][4])
          bk={from:[6,4],to:[5,4]};
      } else {
        // 1...d5 vs d4
        if (b[4][3]==="wP"&&b[4][4]!=="wP"&&b[1][3]==="bP"&&!b[3][3])
          bk={from:[1,3],to:[3,3]};
        // 1...e5 vs e4
        else if (b[4][4]==="wP"&&b[4][3]!=="wP"&&b[1][4]==="bP"&&!b[3][4])
          bk={from:[1,4],to:[3,4]};
        // 2...Nf6 — d4 d5 c4
        else if (b[4][3]==="wP"&&b[3][3]==="bP"&&b[4][2]==="wP"&&b[0][6]==="bN"&&!b[2][5])
          bk={from:[0,6],to:[2,5]};
        // 3...e6 — QGD (d4 d5 c4 Nf6)
        else if (b[4][3]==="wP"&&b[3][3]==="bP"&&b[4][2]==="wP"&&b[2][5]==="bN"&&b[1][4]==="bP"&&!b[2][4])
          bk={from:[1,4],to:[2,4]};
        // 2...Nc6 — Španjolska (e4 e5 Nf3)
        else if (b[4][4]==="wP"&&b[3][4]==="bP"&&b[5][5]==="wN"&&b[0][1]==="bN"&&!b[2][2])
          bk={from:[0,1],to:[2,2]};
        // 4...Be7 — solidna Španjolska (e4 e5 Nf3 Nc6 Bb5)
        else if (b[4][4]==="wP"&&b[3][4]==="bP"&&b[2][2]==="bN"&&b[3][1]==="wB"&&b[0][5]==="bB"&&!b[1][4])
          bk={from:[0,5],to:[1,4]};
        // 4...c6 — solidna QGD (d4 d5 c4 Nf6 Nc3 e6)
        else if (b[4][3]==="wP"&&b[3][3]==="bP"&&b[2][5]==="bN"&&b[2][4]==="bP"&&b[1][2]==="bP"&&!b[2][2])
          bk={from:[1,2],to:[2,2]};
      }
      if (bk) {
        var lm=getLegalMoves(board,bk.from[0],bk.from[1],ep,cs);
        if (lm.some(function(m){return m[0]===bk.to[0]&&m[1]===bk.to[1];})) return bk;
      }
      var isMax=botCol==="w";
      var moves=mvvSort(getAllMoves(board,botCol,ep,cs),board);
      if (!moves.length) return null;
      if (depth===0) return moves[Math.floor(Math.random()*moves.length)];
      var best=null,bestVal=isMax?-Infinity:Infinity;
      for (var i=0;i<moves.length;i++) {
        var res=applyMove(board,moves[i].from,moves[i].to,ep,cs);
        var nb=res.board;
        if (getType(board[moves[i].from[0]][moves[i].from[1]])==="P"&&
            (moves[i].to[0]===0||moves[i].to[0]===7))
          nb[moves[i].to[0]][moves[i].to[1]]=botCol+"Q";
        var v=minimaxTrifunovic(nb,depth-1,-Infinity,Infinity,!isMax,res.enPassant,res.castling);
        if (isMax?v>bestVal:v<bestVal){bestVal=v;best=moves[i];}
      }
      return best;
    }

    // ── FISCHER BOT ───────────────────────────────────────────────────────────
    function evalBoardFischer(board) {
      var score = 0;
      for (var r = 0; r < 8; r++) for (var c = 0; c < 8; c++) {
        var p = board[r][c]; if (!p) continue;
        var col = getColor(p); var t = getType(p);
        var tr = col === "w" ? r : 7 - r;
        var val = PIECE_VAL[t] + (TABLES_FISH[t] ? TABLES_FISH[t][tr][c] : 0);
        score += col === "w" ? val : -val;
      }
      // Pojačaj prednosti — agresivno kažnjava greške
      return Math.round(score * 1.20);
    }

    function minimaxFischer(board, depth, alpha, beta, isMax, ep, cs) {
      var col = isMax ? "w" : "b";
      var moves = mvvSort(getAllMoves(board, col, ep, cs), board);
      if (depth === 0 || moves.length === 0) {
        return moves.length === 0
          ? (isInCheck(board, col) ? (isMax ? -50000 : 50000) : 0)
          : evalBoardFischer(board);
      }
      var best = isMax ? -Infinity : Infinity;
      for (var i = 0; i < moves.length; i++) {
        var res = applyMove(board, moves[i].from, moves[i].to, ep, cs);
        var nb = res.board;
        if (getType(board[moves[i].from[0]][moves[i].from[1]])==="P" &&
            (moves[i].to[0]===0||moves[i].to[0]===7))
          nb[moves[i].to[0]][moves[i].to[1]] = (isMax?"w":"b")+"Q";
        var v = minimaxFischer(nb, depth-1, alpha, beta, !isMax, res.enPassant, res.castling);
        if (isMax) { if (v>best) best=v; if (best>alpha) alpha=best; }
        else       { if (v<best) best=v; if (best<beta)  beta=best;  }
        if (beta <= alpha) break;
      }
      return best;
    }

    function getBotMoveFischer(board, botCol, ep, cs, depth) {
      var b = board; var bk = null;
      if (botCol === "w") {
        // 1.e4 — uvijek
        if (b[6][4]==="wP"&&!b[5][4]&&!b[4][4])
          bk={from:[6,4],to:[4,4]};
        // 2.Nf3 — vs e5 ili c5
        else if (b[4][4]==="wP"&&b[7][6]==="wN"&&!b[5][5]&&(b[3][4]==="bP"||b[3][2]==="bP"))
          bk={from:[7,6],to:[5,5]};
        // 3.Bb5 — Ruy Lopez (e4 e5 Nf3 Nc6)
        else if (b[4][4]==="wP"&&b[5][5]==="wN"&&b[3][4]==="bP"&&b[2][2]==="bN"&&b[7][5]==="wB"&&!b[4][5])
          bk={from:[7,5],to:[3,1]};
        // 3.d4 — Open Sicilian (e4 c5 Nf3 d6)
        else if (b[4][4]==="wP"&&b[5][5]==="wN"&&b[3][2]==="bP"&&b[2][3]==="bP"&&b[6][3]==="wP"&&!b[4][3])
          bk={from:[6,3],to:[4,3]};
        // 4.Ba4 — Ruy Lopez Morphy (Bb5 a6)
        else if (b[4][4]==="wP"&&b[5][5]==="wN"&&b[3][4]==="bP"&&b[2][2]==="bN"&&b[3][1]==="wB"&&b[2][0]==="bP")
          bk={from:[3,1],to:[4,0]};
        // 5.O-O — rokada
        else if (b[4][4]==="wP"&&b[5][5]==="wN"&&b[4][0]==="wB"&&b[7][4]==="wK"&&b[7][7]==="wR")
          bk={from:[7,4],to:[7,6]};
      } else {
        // 1...c5 — Siciliana vs e4
        if (b[4][4]==="wP"&&b[1][2]==="bP"&&!b[3][2])
          bk={from:[1,2],to:[3,2]};
        // 1...Nf6 — vs d4 (Grünfeld/KI setup)
        else if (b[4][3]==="wP"&&b[4][4]!=="wP"&&b[0][6]==="bN"&&!b[2][5])
          bk={from:[0,6],to:[2,5]};
        // 2...d6 — Siciliana Najdorf (e4 c5 Nf3)
        else if (b[4][4]==="wP"&&b[3][2]==="bP"&&b[5][5]==="wN"&&b[1][3]==="bP"&&!b[2][3])
          bk={from:[1,3],to:[2,3]};
        // 2...g6 — King's Indian (d4 Nf6 c4)
        else if (b[4][3]==="wP"&&b[4][2]==="wP"&&b[2][5]==="bN"&&b[1][6]==="bP"&&!b[2][6])
          bk={from:[1,6],to:[2,6]};
        // 3...d5 — Grünfeld (d4 Nf6 c4 g6 Nc3)
        else if (b[4][3]==="wP"&&b[4][2]==="wP"&&b[2][5]==="bN"&&b[2][6]==="bP"&&b[5][2]==="wN"&&b[1][3]==="bP"&&!b[3][3])
          bk={from:[1,3],to:[3,3]};
        // 4...a6 — Siciliana Najdorf (e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3)
        else if (b[4][4]==="wP"&&b[2][3]==="bP"&&b[2][5]==="bN"&&b[4][3]==="wP"&&b[5][2]==="wN"&&b[1][0]==="bP"&&!b[2][0])
          bk={from:[1,0],to:[2,0]};
      }
      if (bk) {
        var lm=getLegalMoves(board,bk.from[0],bk.from[1],ep,cs);
        if (lm.some(function(m){return m[0]===bk.to[0]&&m[1]===bk.to[1];})) return bk;
      }
      var isMax=botCol==="w";
      var moves=mvvSort(getAllMoves(board,botCol,ep,cs),board);
      if (!moves.length) return null;
      if (depth===0) return moves[Math.floor(Math.random()*moves.length)];
      var best=null,bestVal=isMax?-Infinity:Infinity;
      for (var i=0;i<moves.length;i++) {
        var res=applyMove(board,moves[i].from,moves[i].to,ep,cs);
        var nb=res.board;
        if (getType(board[moves[i].from[0]][moves[i].from[1]])==="P"&&
            (moves[i].to[0]===0||moves[i].to[0]===7))
          nb[moves[i].to[0]][moves[i].to[1]]=botCol+"Q";
        var v=minimaxFischer(nb,depth-1,-Infinity,Infinity,!isMax,res.enPassant,res.castling);
        if (isMax?v>bestVal:v<bestVal){bestVal=v;best=moves[i];}
      }
      return best;
    }

    // ── KASPAROV BOT ──────────────────────────────────────────────────────────
    function evalBoardKasparov(board) {
      var score = 0;
      for (var r = 0; r < 8; r++) for (var c = 0; c < 8; c++) {
        var p = board[r][c]; if (!p) continue;
        var col = getColor(p); var t = getType(p);
        var tr = col === "w" ? r : 7 - r;
        // Materijal manje bitan (0.82×), pozicija/inicijativa puno važnija (2.2×)
        var val = PIECE_VAL[t]*0.82 + (TABLES_KASP[t] ? TABLES_KASP[t][tr][c]*2.2 : 0);
        score += col === "w" ? val : -val;
      }
      return Math.round(score);
    }

    function minimaxKasparov(board, depth, alpha, beta, isMax, ep, cs) {
      var col = isMax ? "w" : "b";
      var moves = mvvSort(getAllMoves(board, col, ep, cs), board);
      if (depth === 0 || moves.length === 0) {
        return moves.length === 0
          ? (isInCheck(board, col) ? (isMax ? -50000 : 50000) : 0)
          : evalBoardKasparov(board);
      }
      var best = isMax ? -Infinity : Infinity;
      for (var i = 0; i < moves.length; i++) {
        var res = applyMove(board, moves[i].from, moves[i].to, ep, cs);
        var nb = res.board;
        if (getType(board[moves[i].from[0]][moves[i].from[1]])==="P" &&
            (moves[i].to[0]===0||moves[i].to[0]===7))
          nb[moves[i].to[0]][moves[i].to[1]] = (isMax?"w":"b")+"Q";
        var v = minimaxKasparov(nb, depth-1, alpha, beta, !isMax, res.enPassant, res.castling);
        if (isMax) { if (v>best) best=v; if (best>alpha) alpha=best; }
        else       { if (v<best) best=v; if (best<beta)  beta=best;  }
        if (beta <= alpha) break;
      }
      return best;
    }

    function getBotMoveKasparov(board, botCol, ep, cs, depth) {
      var b = board; var bk = null;
      if (botCol === "w") {
        // 1.e4 — agresivni otvor
        if (b[6][4]==="wP"&&!b[5][4]&&!b[4][4])
          bk={from:[6,4],to:[4,4]};
        // 2.d3 — King's Indian Attack setup
        else if (b[4][4]==="wP"&&b[6][3]==="wP"&&!b[5][3])
          bk={from:[6,3],to:[5,3]};
        // 3.Nd2 — KIA razvoj
        else if (b[4][4]==="wP"&&b[5][3]==="wP"&&b[7][1]==="wN"&&!b[5][1]&&!b[5][5])
          bk={from:[7,1],to:[5,1]};
        // 3.Nf3 — KIA konj (ako Nd2 nije moguć)
        else if (b[4][4]==="wP"&&b[5][3]==="wP"&&b[7][6]==="wN"&&!b[5][5])
          bk={from:[7,6],to:[5,5]};
        // 4.g3 — fianchetto priprema
        else if (b[4][4]==="wP"&&b[5][3]==="wP"&&(b[5][5]==="wN"||b[5][1]==="wN")&&b[6][6]==="wP"&&!b[5][6])
          bk={from:[6,6],to:[5,6]};
        // 5.Bg2 — fianchetto lovac
        else if (b[4][4]==="wP"&&b[5][6]==="wP"&&b[7][5]==="wB"&&!b[6][6])
          bk={from:[7,5],to:[6,6]};
        // 6.O-O — rokada
        else if (b[4][4]==="wP"&&b[6][6]==="wB"&&b[7][4]==="wK"&&b[7][7]==="wR"&&!b[7][5]&&!b[7][6])
          bk={from:[7,4],to:[7,6]};
      } else {
        // 1...Nf6 — King's Indian Defence vs d4
        if (b[4][3]==="wP"&&b[4][4]!=="wP"&&b[0][6]==="bN"&&!b[2][5])
          bk={from:[0,6],to:[2,5]};
        // 2...g6 — KID (d4 Nf6 c4)
        else if (b[4][3]==="wP"&&b[4][2]==="wP"&&b[2][5]==="bN"&&b[1][6]==="bP"&&!b[2][6])
          bk={from:[1,6],to:[2,6]};
        // 3...Bg7 — KID lovac na g7
        else if (b[4][3]==="wP"&&b[4][2]==="wP"&&b[2][5]==="bN"&&b[2][6]==="bP"&&b[0][5]==="bB"&&!b[1][6])
          bk={from:[0,5],to:[1,6]};
        // 4...d6 — KID osnovna pozicija
        else if (b[4][3]==="wP"&&b[2][5]==="bN"&&b[2][6]==="bP"&&b[1][6]==="bB"&&b[1][3]==="bP"&&!b[2][3])
          bk={from:[1,3],to:[2,3]};
        // 5...O-O — KID rokada
        else if (b[2][5]==="bN"&&b[1][6]==="bB"&&b[2][3]==="bP"&&b[0][4]==="bK"&&b[0][7]==="bR"&&!b[0][5]&&!b[0][6])
          bk={from:[0,4],to:[0,6]};
        // 1...c5 — Siciliana vs e4
        else if (b[4][4]==="wP"&&b[4][3]!=="wP"&&b[1][2]==="bP"&&!b[3][2])
          bk={from:[1,2],to:[3,2]};
      }
      if (bk) {
        var lm=getLegalMoves(board,bk.from[0],bk.from[1],ep,cs);
        if (lm.some(function(m){return m[0]===bk.to[0]&&m[1]===bk.to[1];})) return bk;
      }
      var isMax=botCol==="w";
      var moves=mvvSort(getAllMoves(board,botCol,ep,cs),board);
      if (!moves.length) return null;
      if (depth===0) return moves[Math.floor(Math.random()*moves.length)];
      var best=null,bestVal=isMax?-Infinity:Infinity;
      for (var i=0;i<moves.length;i++) {
        var res=applyMove(board,moves[i].from,moves[i].to,ep,cs);
        var nb=res.board;
        if (getType(board[moves[i].from[0]][moves[i].from[1]])==="P"&&
            (moves[i].to[0]===0||moves[i].to[0]===7))
          nb[moves[i].to[0]][moves[i].to[1]]=botCol+"Q";
        var v=minimaxKasparov(nb,depth-1,-Infinity,Infinity,!isMax,res.enPassant,res.castling);
        if (isMax?v>bestVal:v<bestVal){bestVal=v;best=moves[i];}
      }
      return best;
    }

    function createBotWorker() {
      var code = [
        "var PIECE_VAL = "   + JSON.stringify(PIECE_VAL)   + ";",
        "var TAB_P = "       + JSON.stringify(TAB_P)       + ";",
        "var TAB_N = "       + JSON.stringify(TAB_N)       + ";",
        "var TAB_B = "       + JSON.stringify(TAB_B)       + ";",
        "var TAB_R = "       + JSON.stringify(TAB_R)       + ";",
        "var TAB_Q = "       + JSON.stringify(TAB_Q)       + ";",
        "var TAB_K = "       + JSON.stringify(TAB_K)       + ";",
        "var TABLES = { P: TAB_P, N: TAB_N, B: TAB_B, R: TAB_R, Q: TAB_Q, K: TAB_K };",
        "var TABLES_TRIF = " + JSON.stringify(TABLES_TRIF) + ";",
        "var TABLES_FISH = " + JSON.stringify(TABLES_FISH) + ";",
        "var TABLES_KASP = " + JSON.stringify(TABLES_KASP) + ";",
        getColor.toString()             + ";",
        getType.toString()              + ";",
        onBoard.toString()              + ";",
        getRawMoves.toString()          + ";",
        isInCheck.toString()            + ";",
        isAttacked.toString()           + ";",
        applyMove.toString()            + ";",
        getLegalMoves.toString()        + ";",
        getAllMoves.toString()           + ";",
        evalBoard.toString()            + ";",
        mvvSort.toString()              + ";",
        minimax.toString()              + ";",
        getBotMove.toString()           + ";",
        evalBoardTrifunovic.toString()  + ";",
        minimaxTrifunovic.toString()    + ";",
        getBotMoveTrifunovic.toString() + ";",
        evalBoardFischer.toString()     + ";",
        minimaxFischer.toString()       + ";",
        getBotMoveFischer.toString()    + ";",
        evalBoardKasparov.toString()    + ";",
        minimaxKasparov.toString()      + ";",
        getBotMoveKasparov.toString()   + ";",
        "self.onmessage = function(e) {",
        "  var p = e.data.personality;",
        "  if (p === 'trifunovic') {",
        "    self.postMessage(getBotMoveTrifunovic(e.data.board,e.data.botCol,e.data.ep,e.data.cs,e.data.depth));",
        "  } else if (p === 'fischer') {",
        "    self.postMessage(getBotMoveFischer(e.data.board,e.data.botCol,e.data.ep,e.data.cs,e.data.depth));",
        "  } else if (p === 'kasparov') {",
        "    self.postMessage(getBotMoveKasparov(e.data.board,e.data.botCol,e.data.ep,e.data.cs,e.data.depth));",
        "  } else {",
        "    self.postMessage(getBotMove(e.data.board,e.data.botCol,e.data.ep,e.data.cs,e.data.depth));",
        "  }",
        "};"
      ].join('\n');
      var blob = new Blob([code], { type: 'application/javascript' });
      return new Worker(URL.createObjectURL(blob));
    }
