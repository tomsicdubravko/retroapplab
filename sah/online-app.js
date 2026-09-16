const {
  useState,
  useCallback,
  useEffect,
  useRef
} = React;
const GOLD = "#e0b85a";
const DARK = "#1a0f04";
const MID = "#2a1a08";
const BORDER = "#6a4a20";
const TXT = "#e8cc80";
const TXT2 = "#c0964a";
const TXT3 = "#8a6838";
function DubrovnikPiece({
  type,
  color,
  size
}) {
  var s = size || 44;
  var fill = color === "w" ? "#f5ead0" : "#2a1a08";
  var stroke = color === "w" ? "#8a6530" : "#c8a050";
  var hi = color === "w" ? "#fff8ec" : "#4a2e10";
  var sw = 1.2;
  if (type === "K") {
    return /*#__PURE__*/React.createElement("svg", {
      width: s,
      height: s,
      viewBox: "0 0 44 44"
    }, /*#__PURE__*/React.createElement("g", {
      transform: "translate(22,42)"
    }, /*#__PURE__*/React.createElement("ellipse", {
      cx: "0",
      cy: "0",
      rx: "11",
      ry: "2.5",
      fill: stroke,
      opacity: "0.5"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M-11,0 Q-13,-4 -11,-8 L11,-8 Q13,-4 11,0 Z",
      fill: fill,
      stroke: stroke,
      strokeWidth: sw
    }), /*#__PURE__*/React.createElement("path", {
      d: "M-5,-8 Q-6,-16 -5,-20 L5,-20 Q6,-16 5,-8 Z",
      fill: fill,
      stroke: stroke,
      strokeWidth: sw
    }), /*#__PURE__*/React.createElement("ellipse", {
      cx: "0",
      cy: "-20",
      rx: "6",
      ry: "2",
      fill: fill,
      stroke: stroke,
      strokeWidth: sw
    }), /*#__PURE__*/React.createElement("path", {
      d: "M-6,-20 Q-8,-26 -5,-30 L5,-30 Q8,-26 6,-20 Z",
      fill: fill,
      stroke: stroke,
      strokeWidth: sw
    }), /*#__PURE__*/React.createElement("ellipse", {
      cx: "0",
      cy: "-30",
      rx: "5",
      ry: "1.8",
      fill: fill,
      stroke: stroke,
      strokeWidth: sw
    }), /*#__PURE__*/React.createElement("path", {
      d: "M-3,-30 L-3,-34 L3,-34 L3,-30 Z",
      fill: fill,
      stroke: stroke,
      strokeWidth: sw
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "0",
      cy: "-37",
      r: "3.5",
      fill: fill,
      stroke: stroke,
      strokeWidth: sw
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "0",
      cy: "-37",
      r: "1.5",
      fill: hi,
      opacity: "0.6"
    })));
  }
  if (type === "Q") {
    return /*#__PURE__*/React.createElement("svg", {
      width: s,
      height: s,
      viewBox: "0 0 44 44"
    }, /*#__PURE__*/React.createElement("g", {
      transform: "translate(22,42)"
    }, /*#__PURE__*/React.createElement("ellipse", {
      cx: "0",
      cy: "0",
      rx: "10",
      ry: "2.2",
      fill: stroke,
      opacity: "0.5"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M-10,0 Q-12,-3 -10,-7 L10,-7 Q12,-3 10,0 Z",
      fill: fill,
      stroke: stroke,
      strokeWidth: sw
    }), /*#__PURE__*/React.createElement("path", {
      d: "M-6,-7 Q-7,-14 -5,-18 L5,-18 Q7,-14 6,-7 Z",
      fill: fill,
      stroke: stroke,
      strokeWidth: sw
    }), /*#__PURE__*/React.createElement("ellipse", {
      cx: "0",
      cy: "-18",
      rx: "6",
      ry: "2",
      fill: fill,
      stroke: stroke,
      strokeWidth: sw
    }), /*#__PURE__*/React.createElement("path", {
      d: "M-6,-18 L-8,-28 L-4,-24 L0,-30 L4,-24 L8,-28 L6,-18 Z",
      fill: fill,
      stroke: stroke,
      strokeWidth: sw
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "-8",
      cy: "-28",
      r: "2",
      fill: fill,
      stroke: stroke,
      strokeWidth: sw
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "0",
      cy: "-31",
      r: "2.2",
      fill: fill,
      stroke: stroke,
      strokeWidth: sw
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "8",
      cy: "-28",
      r: "2",
      fill: fill,
      stroke: stroke,
      strokeWidth: sw
    })));
  }
  if (type === "R") {
    return /*#__PURE__*/React.createElement("svg", {
      width: s,
      height: s,
      viewBox: "0 0 44 44"
    }, /*#__PURE__*/React.createElement("g", {
      transform: "translate(22,42)"
    }, /*#__PURE__*/React.createElement("ellipse", {
      cx: "0",
      cy: "0",
      rx: "10",
      ry: "2.2",
      fill: stroke,
      opacity: "0.5"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M-10,0 Q-11,-3 -10,-6 L10,-6 Q11,-3 10,0 Z",
      fill: fill,
      stroke: stroke,
      strokeWidth: sw
    }), /*#__PURE__*/React.createElement("ellipse", {
      cx: "0",
      cy: "-6",
      rx: "7",
      ry: "2",
      fill: fill,
      stroke: stroke,
      strokeWidth: sw
    }), /*#__PURE__*/React.createElement("rect", {
      x: "-6",
      y: "-22",
      width: "12",
      height: "16",
      rx: "1",
      fill: fill,
      stroke: stroke,
      strokeWidth: sw
    }), /*#__PURE__*/React.createElement("rect", {
      x: "-7",
      y: "-28",
      width: "4",
      height: "7",
      rx: "0.5",
      fill: fill,
      stroke: stroke,
      strokeWidth: sw
    }), /*#__PURE__*/React.createElement("rect", {
      x: "-1.5",
      y: "-28",
      width: "3",
      height: "7",
      rx: "0.5",
      fill: fill,
      stroke: stroke,
      strokeWidth: sw
    }), /*#__PURE__*/React.createElement("rect", {
      x: "3",
      y: "-28",
      width: "4",
      height: "7",
      rx: "0.5",
      fill: fill,
      stroke: stroke,
      strokeWidth: sw
    })));
  }
  if (type === "B") {
    return /*#__PURE__*/React.createElement("svg", {
      width: s,
      height: s,
      viewBox: "0 0 44 44"
    }, /*#__PURE__*/React.createElement("g", {
      transform: "translate(22,42)"
    }, /*#__PURE__*/React.createElement("ellipse", {
      cx: "0",
      cy: "0",
      rx: "9",
      ry: "2",
      fill: stroke,
      opacity: "0.5"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M-9,0 Q-11,-3 -9,-7 L9,-7 Q11,-3 9,0 Z",
      fill: fill,
      stroke: stroke,
      strokeWidth: sw
    }), /*#__PURE__*/React.createElement("path", {
      d: "M-5,-7 Q-6,-14 -4,-18 L4,-18 Q6,-14 5,-7 Z",
      fill: fill,
      stroke: stroke,
      strokeWidth: sw
    }), /*#__PURE__*/React.createElement("ellipse", {
      cx: "0",
      cy: "-18",
      rx: "5",
      ry: "1.8",
      fill: fill,
      stroke: stroke,
      strokeWidth: sw
    }), /*#__PURE__*/React.createElement("path", {
      d: "M-4,-18 Q-5,-26 -3,-32 L3,-32 Q5,-26 4,-18 Z",
      fill: fill,
      stroke: stroke,
      strokeWidth: sw
    }), /*#__PURE__*/React.createElement("ellipse", {
      cx: "0",
      cy: "-32",
      rx: "4",
      ry: "1.5",
      fill: fill,
      stroke: stroke,
      strokeWidth: sw
    }), /*#__PURE__*/React.createElement("path", {
      d: "M-3,-32 Q-2,-36 0,-38 Q2,-36 3,-32 Z",
      fill: fill,
      stroke: stroke,
      strokeWidth: sw
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "0",
      cy: "-38",
      r: "1.8",
      fill: fill,
      stroke: stroke,
      strokeWidth: sw
    })));
  }
  if (type === "N") {
    return /*#__PURE__*/React.createElement("svg", {
      width: s,
      height: s,
      viewBox: "0 0 44 44"
    }, /*#__PURE__*/React.createElement("g", {
      transform: "translate(22,42)"
    }, /*#__PURE__*/React.createElement("ellipse", {
      cx: "0",
      cy: "0",
      rx: "9",
      ry: "2",
      fill: stroke,
      opacity: "0.5"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M-9,0 Q-11,-3 -9,-6 L9,-6 Q11,-3 9,0 Z",
      fill: fill,
      stroke: stroke,
      strokeWidth: sw
    }), /*#__PURE__*/React.createElement("path", {
      d: "M-5,-6 Q-7,-12 -5,-20 Q-3,-24 1,-25 L5,-22 Q6,-14 5,-6 Z",
      fill: fill,
      stroke: stroke,
      strokeWidth: sw
    }), /*#__PURE__*/React.createElement("path", {
      d: "M-1,-24 Q-5,-26 -6,-31 Q-5,-37 -1,-39 Q3,-40 7,-37 Q10,-33 9,-29 Q7,-25 3,-24 Z",
      fill: fill,
      stroke: stroke,
      strokeWidth: sw
    }), /*#__PURE__*/React.createElement("path", {
      d: "M6,-25 Q10,-27 11,-30 Q10,-34 8,-34 L7,-31 Z",
      fill: fill,
      stroke: stroke,
      strokeWidth: sw
    }), /*#__PURE__*/React.createElement("path", {
      d: "M-3,-37 Q-5,-42 -1,-42 Q1,-41 0,-37 Z",
      fill: fill,
      stroke: stroke,
      strokeWidth: sw
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "3",
      cy: "-33",
      r: "1.4",
      fill: stroke
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "2.5",
      cy: "-33.5",
      r: "0.6",
      fill: hi,
      opacity: "0.65"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M8,-28 Q9,-27 9,-26",
      stroke: stroke,
      strokeWidth: "0.9",
      fill: "none",
      strokeLinecap: "round"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M-5,-20 Q-7,-24 -6,-29",
      stroke: stroke,
      strokeWidth: "1.0",
      fill: "none",
      strokeLinecap: "round"
    })));
  }
  if (type === "P") {
    return /*#__PURE__*/React.createElement("svg", {
      width: s,
      height: s,
      viewBox: "0 0 44 44"
    }, /*#__PURE__*/React.createElement("g", {
      transform: "translate(22,42)"
    }, /*#__PURE__*/React.createElement("ellipse", {
      cx: "0",
      cy: "0",
      rx: "8",
      ry: "1.8",
      fill: stroke,
      opacity: "0.5"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M-8,0 Q-9,-3 -8,-6 L8,-6 Q9,-3 8,0 Z",
      fill: fill,
      stroke: stroke,
      strokeWidth: sw
    }), /*#__PURE__*/React.createElement("path", {
      d: "M-4,-6 Q-5,-11 -4,-14 L4,-14 Q5,-11 4,-6 Z",
      fill: fill,
      stroke: stroke,
      strokeWidth: sw
    }), /*#__PURE__*/React.createElement("ellipse", {
      cx: "0",
      cy: "-14",
      rx: "4.5",
      ry: "1.5",
      fill: fill,
      stroke: stroke,
      strokeWidth: sw
    }), /*#__PURE__*/React.createElement("path", {
      d: "M-2.5,-14 L-2.5,-18 L2.5,-18 L2.5,-14 Z",
      fill: fill,
      stroke: stroke,
      strokeWidth: sw
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "0",
      cy: "-21",
      r: "3.5",
      fill: fill,
      stroke: stroke,
      strokeWidth: sw
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "-0.8",
      cy: "-22",
      r: "1.2",
      fill: hi,
      opacity: "0.5"
    })));
  }
  return null;
}
function OnlineScreen({
  onStart,
  onBack
}) {
  var [phase, setPhase] = useState("menu");
  var [code, setCode] = useState("");
  var [joinInput, setJoinInput] = useState("");
  var [msg, setMsg] = useState("");
  var clientRef = useRef(null);
  function genCode() {
    var ch = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    var s = "";
    for (var i = 0; i < 6; i++) s += ch[Math.floor(Math.random() * ch.length)];
    return s;
  }
  function connect(cb) {
    var cid = "dubch-" + Math.random().toString(36).slice(2, 10);
    var client = window.mqtt.connect("wss://broker.hivemq.com:8884/mqtt", {
      clientId: cid,
      clean: true,
      reconnectPeriod: 0,
      connectTimeout: 12000
    });
    clientRef.current = client;
    client.on("connect", function () {
      cb(client);
    });
    client.on("error", function (e) {
      setMsg("Greška: " + (e.message || e));
      setPhase("error");
    });
    client.on("offline", function () {
      setMsg("Veza izgubljena.");
      setPhase("error");
    });
  }
  function createGame() {
    var nc = genCode();
    setCode(nc);
    setPhase("wait");
    setMsg("Spajam se...");
    connect(function (client) {
      setMsg("Čekam protivnika...");
      client.subscribe("dubch/" + nc + "/ctrl");
      client.publish("dubch/" + nc + "/ctrl", JSON.stringify({
        type: "open"
      }), {
        retain: true,
        qos: 1
      });
      client.on("message", function (topic, raw) {
        var d = JSON.parse(raw.toString());
        if (d.type === "join") {
          client.publish("dubch/" + nc + "/ctrl", JSON.stringify({
            type: "start"
          }), {
            qos: 1
          });
          client.subscribe("dubch/" + nc + "/move");
          clientRef.current = null;
          onStart({
            mode: "online",
            onlineRole: "host",
            roomCode: nc,
            mqttClient: client,
            playerColor: "w"
          });
        }
      });
    });
  }
  function joinGame() {
    var c = joinInput.trim().toUpperCase();
    if (c.length < 4) {
      setMsg("Upiši kod sobe.");
      return;
    }
    setPhase("wait");
    setMsg("Spajam se...");
    connect(function (client) {
      client.subscribe("dubch/" + c + "/ctrl");
      client.subscribe("dubch/" + c + "/move");
      setMsg("Čekam potvrdu...");
      client.on("message", function (topic, raw) {
        var d = JSON.parse(raw.toString());
        if (topic.endsWith("/ctrl") && d.type === "start") {
          clientRef.current = null;
          onStart({
            mode: "online",
            onlineRole: "guest",
            roomCode: c,
            mqttClient: client,
            playerColor: "b"
          });
        }
      });
      client.publish("dubch/" + c + "/ctrl", JSON.stringify({
        type: "join"
      }), {
        qos: 1
      });
    });
  }
  useEffect(function () {
    return function () {
      if (clientRef.current) clientRef.current.end(true);
    };
  }, []);
  var btnStyle = {
    background: "transparent",
    border: "1.5px solid #4a3010",
    color: "#8a6838",
    padding: "12px 28px",
    fontFamily: "Georgia,serif",
    fontSize: 12,
    letterSpacing: 4,
    cursor: "pointer",
    borderRadius: 8,
    transition: "border-color .3s,color .3s"
  };
  var btnHov = {
    borderColor: "#e0b85a",
    color: "#e0b85a"
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: "100vh",
      background: "#0f0804",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "Georgia,serif"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      maxWidth: 360,
      width: "90%",
      padding: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      color: "#e0b85a",
      fontSize: 11,
      letterSpacing: 5,
      marginBottom: 28
    }
  }, "ONLINE IGRA"), phase === "menu" && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("button", {
    style: btnStyle,
    onMouseEnter: function (e) {
      Object.assign(e.target.style, btnHov);
    },
    onMouseLeave: function (e) {
      Object.assign(e.target.style, btnStyle);
    },
    onClick: createGame
  }, "KREIRAJ PARTIJU"), /*#__PURE__*/React.createElement("div", {
    style: {
      color: "#4a3010",
      margin: "20px 0",
      fontSize: 11,
      letterSpacing: 2
    }
  }, "— ILI —"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      justifyContent: "center",
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("input", {
    value: joinInput,
    onChange: function (e) {
      setJoinInput(e.target.value.toUpperCase());
    },
    placeholder: "KOD SOBE",
    maxLength: 8,
    style: {
      background: "#1a1008",
      border: "1.5px solid #4a3010",
      color: "#e0b85a",
      padding: "10px 14px",
      fontFamily: "Georgia,serif",
      fontSize: 13,
      letterSpacing: 4,
      borderRadius: 8,
      width: 140,
      textAlign: "center",
      outline: "none"
    }
  }), /*#__PURE__*/React.createElement("button", {
    style: btnStyle,
    onMouseEnter: function (e) {
      Object.assign(e.target.style, btnHov);
    },
    onMouseLeave: function (e) {
      Object.assign(e.target.style, btnStyle);
    },
    onClick: joinGame
  }, "SPOJI SE")), /*#__PURE__*/React.createElement("button", {
    style: {
      background: "transparent",
      border: "none",
      color: "#4a3010",
      fontFamily: "Georgia,serif",
      fontSize: 11,
      letterSpacing: 3,
      cursor: "pointer",
      marginTop: 8
    },
    onClick: onBack
  }, "NATRAG")), phase === "wait" && /*#__PURE__*/React.createElement("div", null, code && /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      color: "#8a6838",
      fontSize: 11,
      letterSpacing: 3,
      marginBottom: 8
    }
  }, "KOD SOBE"), /*#__PURE__*/React.createElement("div", {
    style: {
      color: "#f0e5c8",
      fontSize: 36,
      fontWeight: "bold",
      letterSpacing: 10,
      border: "1.5px solid #4a3010",
      borderRadius: 10,
      padding: "12px 24px",
      display: "inline-block"
    }
  }, code), /*#__PURE__*/React.createElement("div", {
    style: {
      color: "#4a3010",
      fontSize: 10,
      letterSpacing: 2,
      marginTop: 8
    }
  }, "Podijeli ovaj kod s protivnikom")), /*#__PURE__*/React.createElement("div", {
    style: {
      color: "#8a6838",
      fontSize: 12,
      letterSpacing: 2,
      marginBottom: 20
    }
  }, msg), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "inline-block",
      width: 24,
      height: 24,
      border: "2px solid #4a3010",
      borderTopColor: "#e0b85a",
      borderRadius: "50%",
      animation: "spin 1s linear infinite",
      marginBottom: 20
    }
  }), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("button", {
    style: {
      background: "transparent",
      border: "none",
      color: "#4a3010",
      fontFamily: "Georgia,serif",
      fontSize: 11,
      letterSpacing: 3,
      cursor: "pointer"
    },
    onClick: function () {
      if (clientRef.current) clientRef.current.end(true);
      setPhase("menu");
      setCode("");
    }
  }, "ODUSTANI")), phase === "error" && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      color: "#cc4444",
      fontSize: 12,
      letterSpacing: 1,
      marginBottom: 20
    }
  }, msg), /*#__PURE__*/React.createElement("button", {
    style: btnStyle,
    onClick: function () {
      setPhase("menu");
      setMsg("");
    }
  }, "POKUŠAJ PONOVO"), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("button", {
    style: {
      background: "transparent",
      border: "none",
      color: "#4a3010",
      fontFamily: "Georgia,serif",
      fontSize: 11,
      letterSpacing: 3,
      cursor: "pointer"
    },
    onClick: onBack
  }, "NATRAG"))));
}
function GameScreen({
  config,
  onMenu
}) {
  var mode = config.mode;
  var isOnline = mode === "online";
  var onlineRole = isOnline ? config.onlineRole : null;
  var onlineMqtt = isOnline ? config.mqttClient : null;
  var roomCode = isOnline ? config.roomCode : "";
  var onlineColor = isOnline ? config.playerColor : "w";
  var playerColor = isOnline ? onlineColor : config.playerColor;
  var depth = config.depth;
  var isBot = mode === "bot";
  var botCol = playerColor === "w" ? "b" : "w";
  var [board, setBoard] = useState(function () {
    return initBoard();
  });
  var [turn, setTurn] = useState("w");
  var [sel, setSel] = useState(null);
  var [legal, setLegal] = useState([]);
  var [ep, setEp] = useState(null);
  var [cs, setCs] = useState({
    wK: true,
    wQ: true,
    bK: true,
    bQ: true
  });
  var [status, setStatus] = useState(null);
  var [promo, setPromo] = useState(null);
  var [lastMv, setLastMv] = useState(null);
  var [animKey, setAnimKey] = useState(0);
  var [halfMove, setHalfMove] = useState(0);
  var [thinking, setThinking] = useState(false);
  var [boardSize, setBoardSize] = useState(384);
  var timerRef = useRef(null);
  var botWorkerRef = useRef(null);
  var thinkingRef = useRef(false);
  var gsRef = useRef({});
  useEffect(function () {
    gsRef.current = {
      board: board,
      ep: ep,
      cs: cs,
      turn: turn,
      status: status
    };
  });
  useEffect(function () {
    function updateBoardSize() {
      var availableWidth = window.innerWidth - 32;
      var availableHeight = window.innerHeight - 260;
      var maxSize = Math.min(availableWidth, availableHeight, 560);
      var size = Math.max(240, Math.floor(maxSize / 8) * 8);
      setBoardSize(size);
    }
    updateBoardSize();
    window.addEventListener("resize", updateBoardSize);
    return function () {
      window.removeEventListener("resize", updateBoardSize);
    };
  }, []);
  useEffect(function () {
    if (!isBot || status === "checkmate" || status === "stalemate" || promo || thinkingRef.current || turn !== botCol) return;
    thinkingRef.current = true;
    setThinking(true);
    var b = board,
      e = ep,
      c = cs,
      d = depth,
      bc = botCol,
      t = turn;
    timerRef.current = setTimeout(function () {
      function applyResult(m) {
        thinkingRef.current = false;
        if (!m) {
          setThinking(false);
          return;
        }
        var res = applyMove(b, m.from, m.to, e, c);
        var nb = res.board;
        if (getType(b[m.from[0]][m.from[1]]) === "P" && (m.to[0] === 0 || m.to[0] === 7)) {
          nb[m.to[0]][m.to[1]] = bc + "Q";
        }
        var nt = t === "w" ? "b" : "w";
        var chk = isInCheck(nb, nt);
        var hm = getAllMoves(nb, nt, res.enPassant, res.castling).length > 0;
        var newStatus = !hm ? chk ? "checkmate" : "stalemate" : chk ? "check" : null;
        var isCap = b[m.to[0]][m.to[1]] || getType(b[m.from[0]][m.from[1]]) === "P" && e && m.to[0] === e[0] && m.to[1] === e[1];
        if (isCap) playCapture();else playMove();
        if (newStatus === "checkmate") {
          setTimeout(playCheckmate, 120);
        }
        setBoard(nb);
        setEp(res.enPassant);
        setCs(res.castling);
        setTurn(nt);
        setLastMv([m.from, m.to]);
        setAnimKey(function (k) {
          return k + 1;
        });
        setHalfMove(function (h) {
          return h + 1;
        });
        setStatus(newStatus);
        setThinking(false);
      }
      if (d === 0) {
        var moves = getAllMoves(b, bc, e, c);
        applyResult(moves.length ? moves[Math.floor(Math.random() * moves.length)] : null);
        return;
      }
      if (!botWorkerRef.current) botWorkerRef.current = createBotWorker();
      botWorkerRef.current.onmessage = function (evt) {
        applyResult(evt.data);
      };
      botWorkerRef.current.postMessage({
        board: b,
        botCol: bc,
        ep: e,
        cs: c,
        depth: d
      });
    }, 150);
    return function () {
      clearTimeout(timerRef.current);
      thinkingRef.current = false;
    };
  }, [turn, status, promo, board, ep, cs, depth, botCol, isBot]);
  useEffect(function () {
    if (!isOnline || !onlineMqtt) return;
    function onMsg(topic, raw) {
      if (!topic.endsWith("/move")) return;
      var data;
      try {
        data = JSON.parse(raw.toString());
      } catch (e) {
        return;
      }
      var gs = gsRef.current;
      if (!gs.board || gs.status === "checkmate" || gs.status === "stalemate") return;
      var from = data.from,
        to = data.to,
        promoT = data.promo || null;
      var mvs = getLegalMoves(gs.board, from[0], from[1], gs.ep, gs.cs);
      var legal = mvs.find(function (mv) {
        return mv[0] === to[0] && mv[1] === to[1];
      });
      if (!legal) return;
      var res = applyMove(gs.board, from, to, gs.ep, gs.cs);
      var nb = res.board;
      if (promoT) {
        nb[to[0]][to[1]] = (gs.turn === "w" ? "w" : "b") + promoT;
      }
      var nt = gs.turn === "w" ? "b" : "w";
      var chk = isInCheck(nb, nt);
      var hm = getAllMoves(nb, nt, res.enPassant, res.castling).length > 0;
      var ns = !hm ? chk ? "checkmate" : "stalemate" : chk ? "check" : null;
      var isCap = gs.board[to[0]][to[1]] || getType(gs.board[from[0]][from[1]]) === "P" && gs.ep && to[0] === gs.ep[0] && to[1] === gs.ep[1];
      if (isCap) playCapture();else playMove();
      if (ns === "checkmate") setTimeout(playCheckmate, 120);
      setBoard(nb);
      setTurn(nt);
      setEp(res.enPassant);
      setCs(res.castling);
      setStatus(ns);
      setLastMv([from, to]);
      setAnimKey(function (k) {
        return k + 1;
      });
      setHalfMove(function (h) {
        return h + 1;
      });
    }
    onlineMqtt.on("message", onMsg);
    return function () {
      onlineMqtt.removeListener("message", onMsg);
    };
  }, [isOnline, onlineMqtt]);
  var handleClick = useCallback(function (r, c) {
    if (status === "checkmate" || status === "stalemate" || promo || thinking) return;
    if ((isBot || isOnline) && turn !== playerColor) return;
    var piece = board[r][c];
    if (sel) {
      var found = null;
      for (var i = 0; i < legal.length; i++) {
        if (legal[i][0] === r && legal[i][1] === c) {
          found = legal[i];
          break;
        }
      }
      if (found) {
        var res = applyMove(board, sel, [r, c], ep, cs);
        var nb = res.board;
        if (getType(board[sel[0]][sel[1]]) === "P" && (r === 0 || r === 7)) {
          setBoard(nb);
          setEp(res.enPassant);
          setCs(res.castling);
          setPromo({
            r: r,
            c: c,
            col: turn,
            from: sel
          });
          setLastMv([sel, [r, c]]);
          setSel(null);
          setLegal([]);
          return;
        }
        var nt = turn === "w" ? "b" : "w";
        var chk = isInCheck(nb, nt);
        var hm = getAllMoves(nb, nt, res.enPassant, res.castling).length > 0;
        var newStatus = !hm ? chk ? "checkmate" : "stalemate" : chk ? "check" : null;
        var wasCap = board[r][c] || getType(board[sel[0]][sel[1]]) === "P" && ep && r === ep[0] && c === ep[1];
        if (wasCap) playCapture();else playMove();
        if (newStatus === "checkmate") {
          setTimeout(playCheckmate, 120);
        }
        setBoard(nb);
        setEp(res.enPassant);
        setCs(res.castling);
        setTurn(nt);
        setLastMv([sel, [r, c]]);
        setAnimKey(function (k) {
          return k + 1;
        });
        setHalfMove(function (h) {
          return h + 1;
        });
        setSel(null);
        setLegal([]);
        setStatus(newStatus);
        if (isOnline && onlineMqtt) {
          onlineMqtt.publish("dubch/" + roomCode + "/move", JSON.stringify({
            from: sel,
            to: [r, c],
            promo: null
          }), {
            qos: 1
          });
        }
        return;
      }
      if (piece && getColor(piece) === turn) {
        setSel([r, c]);
        setLegal(getLegalMoves(board, r, c, ep, cs));
        return;
      }
      setSel(null);
      setLegal([]);
    } else {
      if (piece && getColor(piece) === turn) {
        setSel([r, c]);
        setLegal(getLegalMoves(board, r, c, ep, cs));
      }
    }
  }, [board, turn, sel, legal, ep, cs, status, promo, thinking, isBot, playerColor]);
  function handlePromo(t) {
    var r = promo.r;
    var c = promo.c;
    var col = promo.col;
    var nb = [];
    for (var i = 0; i < 8; i++) nb.push(board[i].slice());
    nb[r][c] = col + t;
    var nt = col === "w" ? "b" : "w";
    var chk = isInCheck(nb, nt);
    var hm = getAllMoves(nb, nt, ep, cs).length > 0;
    var newStatus = !hm ? chk ? "checkmate" : "stalemate" : chk ? "check" : null;
    playMove();
    if (newStatus === "checkmate") {
      setTimeout(playCheckmate, 120);
    }
    setBoard(nb);
    setPromo(null);
    setTurn(nt);
    setAnimKey(function (k) {
      return k + 1;
    });
    setHalfMove(function (h) {
      return h + 1;
    });
    setStatus(newStatus);
    if (isOnline && onlineMqtt && promo.from) {
      onlineMqtt.publish("dubch/" + roomCode + "/move", JSON.stringify({
        from: promo.from,
        to: [promo.r, promo.c],
        promo: t
      }), {
        qos: 1
      });
    }
  }
  function restart() {
    setBoard(initBoard());
    setTurn("w");
    setSel(null);
    setLegal([]);
    setEp(null);
    setCs({
      wK: true,
      wQ: true,
      bK: true,
      bQ: true
    });
    setStatus(null);
    setPromo(null);
    setLastMv(null);
    setThinking(false);
    setHalfMove(0);
    setAnimKey(0);
  }
  var flip = false;
  var rows = flip ? [0, 1, 2, 3, 4, 5, 6, 7] : [7, 6, 5, 4, 3, 2, 1, 0];
  var cols = flip ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];
  var files = flip ? ["h", "g", "f", "e", "d", "c", "b", "a"] : ["a", "b", "c", "d", "e", "f", "g", "h"];
  var ranks = flip ? [1, 2, 3, 4, 5, 6, 7, 8] : [8, 7, 6, 5, 4, 3, 2, 1];
  var square = Math.max(32, Math.round(boardSize / 8));
  var labelSize = Math.max(18, Math.round(square * 0.4));
  var boardWidth = square * 8;
  var boardOuterWidth = boardWidth + labelSize;
  function isSel(r, c) {
    return sel && sel[0] === r && sel[1] === c;
  }
  function isLeg(r, c) {
    for (var i = 0; i < legal.length; i++) {
      if (legal[i][0] === r && legal[i][1] === c) return true;
    }
    return false;
  }
  function isLast(r, c) {
    return lastMv && (lastMv[0][0] === r && lastMv[0][1] === c || lastMv[1][0] === r && lastMv[1][1] === c);
  }
  var checkKing = null;
  if (status === "check" || status === "checkmate") {
    outer: for (var kr = 0; kr < 8; kr++) {
      for (var kc = 0; kc < 8; kc++) {
        if (board[kr][kc] === turn + "K") {
          checkKing = [kr, kc];
          break outer;
        }
      }
    }
  }
  var pt = isBot ? turn === playerColor : true;
  var dl = depth === 0 ? "Lagan" : depth === 3 ? "Srednji" : "Tezak";
  var ml = isBot ? "Bot - " + dl : isOnline ? "Online" : "Multiplayer";
  var tl = isBot ? flip ? "Ti" : "Bot" : "Crni";
  var bl = isBot ? flip ? "Bot" : "Ti" : "Bijeli";
  var sbg = status === "checkmate" ? "#5a0000" : status === "check" ? "#5a2c00" : "#1c1208";
  var sbd = status === "checkmate" ? "#ff4444" : status === "check" ? "#ff9944" : BORDER;
  function renderStatus() {
    if (status === "checkmate") {
      if (isBot) {
        var pw = turn === botCol;
        return /*#__PURE__*/React.createElement("span", {
          style: {
            color: pw ? "#88ff88" : "#ff7777",
            fontWeight: "bold",
            fontSize: 14
          }
        }, pw ? "Ti pobjedjes! 🏆" : "Bot pobjeduje!");
      }
      return /*#__PURE__*/React.createElement("span", {
        style: {
          color: "#ffcc44",
          fontWeight: "bold",
          fontSize: 14
        }
      }, turn === "w" ? "Crni pobjeduje! 🏆" : "Bijeli pobjeduje! 🏆");
    }
    if (status === "stalemate") return /*#__PURE__*/React.createElement("span", {
      style: {
        color: TXT2,
        fontSize: 13
      }
    }, "Pat - Remi!");
    if (thinking) return /*#__PURE__*/React.createElement("span", {
      style: {
        color: TXT2,
        fontSize: 13
      }
    }, "Bot razmislja...");
    if (status === "check") {
      var who = isBot ? turn === playerColor ? "Ti si" : "Bot je" : turn === "w" ? "Bijeli je" : "Crni je";
      return /*#__PURE__*/React.createElement("span", {
        style: {
          color: "#ffaa44",
          fontWeight: "bold",
          fontSize: 13
        }
      }, who, " u sahu!");
    }
    if (isBot) return /*#__PURE__*/React.createElement("span", {
      style: {
        color: pt ? GOLD : TXT3,
        fontSize: 13
      }
    }, "Na potezu: ", /*#__PURE__*/React.createElement("b", null, pt ? "Ti" : "Bot"));
    return /*#__PURE__*/React.createElement("span", {
      style: {
        color: GOLD,
        fontSize: 13
      }
    }, "Na potezu: ", /*#__PURE__*/React.createElement("b", null, turn === "w" ? "Bijeli" : "Crni"));
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: "100vh",
      background: "linear-gradient(160deg," + DARK + " 0%," + MID + " 60%," + DARK + " 100%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "Georgia,serif",
      padding: 10,
      boxSizing: "border-box"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      color: GOLD,
      fontSize: 18,
      fontWeight: "bold",
      letterSpacing: 4,
      marginBottom: 1
    }
  }, "SAH"), /*#__PURE__*/React.createElement("div", {
    style: {
      color: TXT3,
      fontSize: 9,
      letterSpacing: 3,
      marginBottom: 6
    }
  }, "DUBROVNIK 1950 - " + ml), /*#__PURE__*/React.createElement("div", {
    style: {
      background: sbg,
      border: "1px solid " + sbd,
      borderRadius: 8,
      padding: "5px 18px",
      marginBottom: 2,
      textAlign: "center",
      minWidth: 230
    }
  }, renderStatus()), /*#__PURE__*/React.createElement("div", {
    style: {
      color: TXT3,
      fontSize: 10,
      letterSpacing: 2,
      marginBottom: 4
    }
  }, "POTEZ " + (Math.floor(halfMove / 2) + 1)), isOnline && /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      color: "#4a3010",
      fontSize: 10,
      letterSpacing: 3,
      marginBottom: 4
    }
  }, onlineRole === "host" ? "BIJELI (domaćin)" : "CRNI (gost)", " — ", roomCode), /*#__PURE__*/React.createElement("div", {
    style: {
      color: TXT3,
      fontSize: 11,
      marginBottom: 1
    }
  }, tl), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 0,
      minHeight: 18,
      marginBottom: 3,
      width: boardOuterWidth,
      paddingLeft: labelSize
    }
  }, getCaptured(board, flip ? "w" : "b").map(function (t, i) {
    return /*#__PURE__*/React.createElement(DubrovnikPiece, {
      key: i,
      type: t,
      color: flip ? "w" : "b",
      size: 18
    });
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      border: "3px solid " + BORDER,
      borderRadius: 3,
      overflow: "hidden",
      boxShadow: "0 8px 48px #00000099",
      width: boardOuterWidth
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      background: "#1a1008"
    }
  }, ranks.map(function (rank) {
    return /*#__PURE__*/React.createElement("div", {
      key: rank,
      style: {
        width: labelSize,
        height: square,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: TXT3,
        fontSize: 10,
        fontFamily: "Georgia, serif",
        letterSpacing: 1
      }
    }, rank);
  })), /*#__PURE__*/React.createElement("div", null, rows.map(function (r) {
    return /*#__PURE__*/React.createElement("div", {
      key: r,
      style: {
        display: "flex"
      }
    }, cols.map(function (c) {
      var light = (r + c) % 2 !== 0;
      var piece = board[r][c];
      var bg = light ? "#e8d5a3" : "#9a6b3a";
      if (isLast(r, c)) bg = light ? "#d4c060" : "#9a8020";
      if (checkKing && checkKing[0] === r && checkKing[1] === c) bg = light ? "#ff9090" : "#cc3333";
      if (isSel(r, c)) bg = light ? "#b8d87a" : "#7aaa44";
      var cc = getColor(piece) === turn && (!isBot || turn === playerColor) && !thinking || isLeg(r, c);
      return /*#__PURE__*/React.createElement("div", {
        key: c,
        onClick: function () {
          handleClick(r, c);
        },
        style: {
          width: square,
          height: square,
          background: bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: cc ? "pointer" : "default",
          position: "relative",
          userSelect: "none"
        }
      }, isLeg(r, c) && /*#__PURE__*/React.createElement("div", {
        style: {
          position: "absolute",
          width: piece ? "100%" : "34%",
          height: piece ? "100%" : "34%",
          borderRadius: piece ? 2 : "50%",
          background: piece ? "rgba(0,0,0,0.28)" : "rgba(0,0,0,0.2)",
          border: piece ? "3px solid rgba(0,0,0,0.28)" : "none",
          boxSizing: "border-box",
          pointerEvents: "none"
        }
      }), piece && /*#__PURE__*/React.createElement(DubrovnikPiece, {
        type: getType(piece),
        color: getColor(piece),
        size: Math.max(30, Math.min(64, Math.round(square * 0.92)))
      }), lastMv && lastMv[1][0] === r && lastMv[1][1] === c && /*#__PURE__*/React.createElement("div", {
        key: animKey,
        className: "sq-anim-dest",
        style: {
          position: "absolute",
          inset: 0,
          pointerEvents: "none"
        }
      }), lastMv && lastMv[0][0] === r && lastMv[0][1] === c && /*#__PURE__*/React.createElement("div", {
        key: animKey + "_s",
        className: "sq-anim-src",
        style: {
          position: "absolute",
          inset: 0,
          pointerEvents: "none"
        }
      }));
    }));
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      paddingLeft: labelSize,
      background: "#1a1008"
    }
  }, files.map(function (f) {
    return /*#__PURE__*/React.createElement("div", {
      key: f,
      style: {
        width: square,
        height: labelSize,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: TXT3,
        fontSize: 10,
        fontFamily: "Georgia, serif",
        letterSpacing: 1
      }
    }, f);
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 0,
      minHeight: 18,
      marginTop: 3,
      width: boardOuterWidth,
      paddingLeft: labelSize
    }
  }, getCaptured(board, flip ? "b" : "w").map(function (t, i) {
    return /*#__PURE__*/React.createElement(DubrovnikPiece, {
      key: i,
      type: t,
      color: flip ? "b" : "w",
      size: 18
    });
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      color: GOLD,
      fontSize: 11,
      marginTop: 1
    }
  }, bl), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      marginTop: 12
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onMenu,
    style: {
      background: MID,
      border: "1.5px solid " + BORDER,
      color: TXT2,
      padding: "11px 20px",
      borderRadius: 8,
      cursor: "pointer",
      fontSize: 13,
      fontFamily: "Georgia,serif"
    }
  }, "Izbornik"), /*#__PURE__*/React.createElement("button", {
    onClick: restart,
    style: {
      background: MID,
      border: "1.5px solid " + BORDER,
      color: TXT2,
      padding: "11px 20px",
      borderRadius: 8,
      cursor: "pointer",
      fontSize: 13,
      fontFamily: "Georgia,serif"
    }
  }, "Restart")), (status === "checkmate" || status === "stalemate") && /*#__PURE__*/React.createElement("div", {
    style: {
      position: "fixed",
      inset: 0,
      background: "#000000dd",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 100,
      animation: "fadeInResult 0.6s ease-out 1.4s both"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#1e140a",
      border: "2px solid " + GOLD,
      borderRadius: 16,
      padding: "32px 36px",
      textAlign: "center",
      maxWidth: 320,
      width: "90%"
    }
  }, status === "stalemate" ? /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      color: GOLD,
      fontSize: 28,
      letterSpacing: 3,
      marginBottom: 8
    }
  }, "PAT"), /*#__PURE__*/React.createElement("div", {
    style: {
      color: TXT2,
      fontSize: 14,
      marginBottom: 24
    }
  }, "Remi — nitko nije pobijedio.")) : /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      color: GOLD,
      fontSize: 13,
      letterSpacing: 4,
      marginBottom: 10
    }
  }, "CESTITAMO"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "center",
      gap: 6,
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement(DubrovnikPiece, {
    type: "K",
    color: turn === "w" ? "b" : "w",
    size: 52
  }), /*#__PURE__*/React.createElement(DubrovnikPiece, {
    type: "Q",
    color: turn === "w" ? "b" : "w",
    size: 52
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      color: "#f5e090",
      fontSize: 20,
      fontWeight: "bold",
      letterSpacing: 2,
      marginBottom: 6
    }
  }, isBot ? turn === botCol ? "Pobijedio si!" : "Bot je pobijedio!" : "Pobjednik je " + (turn === "w" ? "Crni" : "Bijeli") + "!"), /*#__PURE__*/React.createElement("div", {
    style: {
      color: TXT3,
      fontSize: 11,
      marginBottom: 24
    }
  }, "Sah-mat")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onMenu,
    style: {
      background: MID,
      border: "1.5px solid " + BORDER,
      color: TXT2,
      padding: "11px 20px",
      borderRadius: 8,
      cursor: "pointer",
      fontSize: 13,
      fontFamily: "Georgia,serif"
    }
  }, "Pocetak"), /*#__PURE__*/React.createElement("button", {
    onClick: restart,
    style: {
      background: "#3a2510",
      border: "1.5px solid " + GOLD,
      color: GOLD,
      padding: "11px 20px",
      borderRadius: 8,
      cursor: "pointer",
      fontSize: 13,
      fontFamily: "Georgia,serif",
      fontWeight: "bold"
    }
  }, "Nova partija")))), promo && /*#__PURE__*/React.createElement("div", {
    style: {
      position: "fixed",
      inset: 0,
      background: "#000000cc",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 100
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#1e140a",
      border: "2px solid " + GOLD,
      borderRadius: 12,
      padding: 24,
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      color: GOLD,
      fontSize: 15,
      marginBottom: 16
    }
  }, "Promocija pjesaka — odaberi figuru:"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 12,
      justifyContent: "center"
    }
  }, ["Q", "R", "B", "N"].map(function (t) {
    var labels = {
      Q: "Kraljica",
      R: "Top",
      B: "Lovac",
      N: "Konj"
    };
    return /*#__PURE__*/React.createElement("button", {
      key: t,
      onClick: function () {
        handlePromo(t);
      },
      style: {
        background: MID,
        border: "2px solid " + BORDER,
        borderRadius: 8,
        padding: "8px 10px",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4
      }
    }, /*#__PURE__*/React.createElement(DubrovnikPiece, {
      type: t,
      color: promo.col,
      size: 44
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        color: GOLD,
        fontSize: 10
      }
    }, labels[t]));
  })))));
}
function App() {
  var [screen, setScreen] = useState("online");
  var [config, setConfig] = useState(null);
  if (screen === "game") {
    return /*#__PURE__*/React.createElement(GameScreen, {
      config: config,
      onMenu: function () {
        window.location.href = 'index.html';
      }
    });
  }
  return /*#__PURE__*/React.createElement(OnlineScreen, {
    onStart: function (c) {
      setConfig(c);
      setScreen("game");
    },
    onBack: function () {
      window.location.href = 'index.html';
    }
  });
}
ReactDOM.createRoot(document.getElementById("root")).render(/*#__PURE__*/React.createElement(App, null));
