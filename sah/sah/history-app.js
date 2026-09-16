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
function HistoryScreen({
  onBack
}) {
  var initTab = new URLSearchParams(window.location.search).get("tab") || "olimp";
  var [tab, setTab] = useState(initTab);
  var [subTab, setSubTab] = useState("info");
  var [trifTab, setTrifTab] = useState("karijera");
  var tabBarRef = useRef(null);
  function scrollTabs(dir) {
    if (tabBarRef.current) tabBarRef.current.scrollBy({
      left: dir * 120,
      behavior: "smooth"
    });
  }
  var cardStyle = {
    background: "#1c1208",
    border: "1px solid " + BORDER,
    borderRadius: 10,
    padding: "18px 16px",
    marginBottom: 14,
    wordBreak: "break-word",
    overflowWrap: "break-word"
  };
  var secStyle = {
    color: GOLD,
    fontSize: 11,
    letterSpacing: 3,
    marginBottom: 8
  };
  var bodyStyle = {
    color: TXT,
    fontSize: 12,
    lineHeight: 1.9
  };
  var pieceData = [{
    type: "K",
    color: "w",
    name: "KRALJ",
    desc: "Kuglasti završetak umjesto križa. Komunističke vlasti zabranile su vjerske simbole. Šira baza i naglašenija stabilnost u odnosu na Staunton kralja."
  }, {
    type: "Q",
    color: "w",
    name: "KRALJICA",
    desc: "Kruna oblikovana od pet kuglica, umjesto klasičnih nazubaka. Elegantne, uravnotežene proporcije i vrlo prepoznatljiva silueta."
  }, {
    type: "R",
    color: "b",
    name: "TOP",
    desc: "Stilizirano krunište koje podsjeća na klasične bedeme. Široka, stabilna baza, s robusnošću za turnirsku igru."
  }, {
    type: "B",
    color: "b",
    name: "LOVAC",
    desc: "Kapica umjesto mitre — potpis Dubrovnik seta. Elegantna i vitka figura s karakterističnim završnim diskom."
  }, {
    type: "N",
    color: "w",
    name: "KONJ",
    desc: "Najpoznatija figura cijelog seta. Stilizirana, čista i geometrijska konjska glava, potpuno različita od Staunton stila. Mnogi ga smatraju najljepšim konjem ikad dizajniranim."
  }, {
    type: "P",
    color: "w",
    name: "PIJUN",
    desc: "Široka baza, elegantna kuglica na vrhu. Robustan, ali vizualno vrlo skladan, te izrazito funkcionalan za turnirsku igru."
  }];
  var facts = [["Datum", "20. kolovoza - 11. rujna 1950."], ["Mjesto", "Umjetnička galerija Dubrovnik"], ["Drzave", "16 nacija"], ["Igraci", "84 (4 velemajstora GM i 23 međunarodna majstora IM)"], ["Partije", "480 odigranih partija"], ["Zlato", "Jugoslavija (Gligorić, Pirc, Trifunović, Rabar, Vidmar ml., Puc)"], ["Srebro", "Argentina (Najdorf, Bolbochan, Guimard, Rossetto, H. Pilnik, J. Pilnik)"], ["Bronca", "Zapadna Njemacka (Unzicker, Schmid, Tenscher, Kinzel, Rellstab, Diemer)"]];
  var timelineData = [{
    key: "richard",
    year: 1192,
    label: "1192"
  }, {
    key: "ludus",
    year: 1272,
    label: "1272"
  }, {
    key: "trifunovic",
    year: 1910,
    label: "1910"
  }, {
    key: "aljehin",
    year: 1936,
    label: "1936"
  }, {
    key: "olimp",
    year: 1950,
    label: "1950"
  }, {
    key: "prkos",
    year: 1991,
    label: "1991"
  }, {
    key: "fischer",
    year: 1992,
    label: "1992"
  }, {
    key: "kasparov",
    year: 1994,
    label: "1994"
  }];
  function tabBtn(key, label) {
    var active = tab === key;
    return /*#__PURE__*/React.createElement("button", {
      key: key,
      onClick: function () {
        setTab(key);
      },
      style: {
        flexShrink: 0,
        padding: "8px 12px",
        fontSize: 9,
        fontFamily: "Georgia,serif",
        letterSpacing: 0.5,
        cursor: "pointer",
        border: "none",
        borderBottom: "2px solid " + (active ? GOLD : "transparent"),
        background: "transparent",
        color: active ? GOLD : TXT2,
        transition: "all 0.2s",
        whiteSpace: "nowrap"
      }
    }, label);
  }
  function trifTabBtn(key, label) {
    var active = trifTab === key;
    return /*#__PURE__*/React.createElement("button", {
      key: key,
      onClick: function () {
        setTrifTab(key);
      },
      style: {
        flex: 1,
        padding: "6px 4px",
        fontSize: 9,
        fontFamily: "Georgia,serif",
        letterSpacing: 0.5,
        cursor: "pointer",
        border: "none",
        borderBottom: "2px solid " + (active ? TXT2 : "transparent"),
        background: "transparent",
        color: active ? TXT2 : TXT3,
        transition: "all 0.2s"
      }
    }, label);
  }
  function subTabBtn(key, label) {
    var active = subTab === key;
    return /*#__PURE__*/React.createElement("button", {
      key: key,
      onClick: function () {
        setSubTab(key);
      },
      style: {
        flex: 1,
        padding: "6px 4px",
        fontSize: 9,
        fontFamily: "Georgia,serif",
        letterSpacing: 0.5,
        cursor: "pointer",
        border: "none",
        borderBottom: "2px solid " + (active ? TXT2 : "transparent"),
        background: "transparent",
        color: active ? TXT2 : TXT3,
        transition: "all 0.2s"
      }
    }, label);
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: "100vh",
      background: "linear-gradient(160deg," + DARK + " 0%," + MID + " 60%," + DARK + " 100%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      fontFamily: "Georgia,serif",
      padding: "20px 16px",
      boxSizing: "border-box"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      color: TXT3,
      fontSize: 10,
      letterSpacing: 5,
      marginBottom: 4
    }
  }, "SAHOVSKA BASTINA DUBROVNIKA"), /*#__PURE__*/React.createElement("div", {
    style: {
      color: GOLD,
      fontSize: 24,
      fontWeight: "bold",
      letterSpacing: 3
    }
  }, "DUBROVNIK 1950")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-end",
      width: "100%",
      maxWidth: 520,
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: function () {
      scrollTabs(-1);
    },
    style: {
      background: "transparent",
      border: "none",
      color: TXT3,
      fontSize: 20,
      cursor: "pointer",
      padding: "0 6px 4px",
      flexShrink: 0,
      lineHeight: 1
    }
  }, "‹"), /*#__PURE__*/React.createElement("div", {
    ref: tabBarRef,
    className: "tab-scroll",
    style: {
      display: "flex",
      flex: 1,
      overflowX: "auto",
      borderBottom: "1px solid " + BORDER
    }
  }, tabBtn("richard", "RIKARD I. LAVLJEG SRCA"), tabBtn("ludus", "LUDUS SCACCHORUM"), tabBtn("trifunovic", "TRIFUNOVIC"), tabBtn("aljehin", "ALJEHIN"), tabBtn("olimp", "OLIMPIJADA"), tabBtn("prkos", "ŠAH IZ PRKOSA"), tabBtn("fischer", "FISCHER"), tabBtn("kasparov", "KASPAROV")), /*#__PURE__*/React.createElement("button", {
    onClick: function () {
      scrollTabs(1);
    },
    style: {
      background: "transparent",
      border: "none",
      color: TXT3,
      fontSize: 20,
      cursor: "pointer",
      padding: "0 6px 4px",
      flexShrink: 0,
      lineHeight: 1
    }
  }, "›")), /*#__PURE__*/React.createElement("div", {
    style: {
      width: "100%",
      maxWidth: 520,
      marginBottom: 20,
      padding: "10px 8px 4px",
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      display: "flex",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: "8.33%",
      right: "8.33%",
      top: "50%",
      height: 1,
      background: BORDER,
      transform: "translateY(50%)"
    }
  }), timelineData.map(function (item) {
    var isActive = tab === item.key;
    return /*#__PURE__*/React.createElement("div", {
      key: item.key,
      onClick: function () {
        setTab(item.key);
      },
      style: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        cursor: "pointer",
        position: "relative",
        zIndex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: isActive ? 12 : 7,
        height: isActive ? 12 : 7,
        borderRadius: "50%",
        background: isActive ? GOLD : MID,
        border: "1.5px solid " + (isActive ? GOLD : BORDER),
        transition: "all 0.25s",
        marginBottom: 5
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: isActive ? 10 : 9,
        color: isActive ? GOLD : TXT3,
        letterSpacing: isActive ? 1 : 0.3,
        fontWeight: isActive ? "bold" : "normal",
        transition: "all 0.25s"
      }
    }, item.year));
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      width: "100%",
      maxWidth: 520,
      wordBreak: "break-word",
      overflowWrap: "break-word"
    }
  }, tab === "aljehin" && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: cardStyle
  }, /*#__PURE__*/React.createElement("div", {
    style: secStyle
  }, "ALEKSANDAR ALJEHIN U DUBROVNIKU"), /*#__PURE__*/React.createElement("div", {
    style: bodyStyle
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: 0
    }
  }, "Aleksandar Aleksandrovič Aljehin rođen je u Moskvi 31. listopada 1892. Bio je četvrti svjetski prvak u povijesti šaha — titulu je osvojio 1927. godine pobjedom nad dotad nepobjedivim Joseom Raulom Capablancom u Buenos Airesu. Tu je titulu držao, s prekidom od samo dvije godine, sve do smrti 1946. godine. Dvadeset godina na samom vrhu svjetskog šaha."), /*#__PURE__*/React.createElement("p", {
    style: {
      marginBottom: 0
    }
  }, "Aljehin je bio možda i najgenijalniji napadački orijentiran šahist svih vremena. Šah je doživljavao kao umjetnost — svaka njegova partija bila je priča s uvodom, zapletom i vrhuncem."))), /*#__PURE__*/React.createElement("div", {
    style: cardStyle
  }, /*#__PURE__*/React.createElement("div", {
    style: secStyle
  }, "DUBROVNIK, SVIBANJ 1936."), /*#__PURE__*/React.createElement("div", {
    style: bodyStyle
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: 0
    }
  }, "Svjetski prvak Aleksandar Aljehin stigao je u Dubrovnik, koji će 14 godina kasnije ugostiti IX. Šahovsku olimpijadu. Pred njim je sjelo 35 dubrovačkih šahista, odlučnih barem jednom \"uzeti skalp\" svjetskom prvaku."), /*#__PURE__*/React.createElement("p", null, "Veliki broj igrača na simultanci prisilio je velemajstora da primjeni posebnu tehniku. U početku je brzo vukao poteze i kada je utvrdio razinu znanja protivnika obratio je naročitu pažnju na najjače od njih. Aljehin je razvio originalnu metodu: \"obilježavao\" ih je na način da je pored takvih ploča stavljao malo pepela od cigarete."))), /*#__PURE__*/React.createElement("div", {
    style: cardStyle
  }, /*#__PURE__*/React.createElement("div", {
    style: secStyle
  }, "ZASTRAŠUJUĆI ISHOD"), /*#__PURE__*/React.createElement("div", {
    style: bodyStyle
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: 0
    }
  }, "Na kraju nitko nije uspio."), /*#__PURE__*/React.createElement("p", null, "Aljehin je ostvario 33 pobjede, dok su samo dvojica domaćih igrača izborila remi. Prema sačuvanoj fotografiji sa simultanke, dvorana je bila ispunjena do posljednjeg mjesta — posjet svjetskog prvaka bio je veliki događaj za cijeli Dubrovnik, ne samo za šahovske krugove."), /*#__PURE__*/React.createElement("p", {
    style: {
      marginBottom: 0,
      color: GOLD,
      fontStyle: "italic"
    }
  }, "Aljehinov rezime? Ni jedan poraz. Ni jedan.")))), tab === "olimp" && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      width: "100%",
      marginBottom: 16,
      borderBottom: "1px solid #2a1a08"
    }
  }, subTabBtn("info", "OLIMPIJADA"), subTabBtn("figure", "FIGURE"), subTabBtn("partija2", "TRIFUNOVIĆ vs NIEMELÄ")), subTab === "info" && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: cardStyle
  }, /*#__PURE__*/React.createElement("div", {
    style: secStyle
  }, "IX. SAHOVSKA OLIMPIJADA"), /*#__PURE__*/React.createElement("div", {
    style: bodyStyle
  }, "U kolovozu 1950. Dubrovnik je ugostio IX. šahovsku olimpijadu i postao pozornica nastupa vodećih svjetskih majstora šahovske igre.")), /*#__PURE__*/React.createElement("div", {
    style: cardStyle
  }, /*#__PURE__*/React.createElement("div", {
    style: secStyle
  }, "CINJENICE"), facts.map(function (f) {
    return /*#__PURE__*/React.createElement("div", {
      key: f[0],
      style: {
        display: "flex",
        borderBottom: "1px solid #2a1a08",
        padding: "7px 0"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: TXT3,
        fontSize: 11,
        width: 72,
        flexShrink: 0
      }
    }, f[0]), /*#__PURE__*/React.createElement("span", {
      style: {
        color: TXT,
        fontSize: 11
      }
    }, f[1]));
  })), /*#__PURE__*/React.createElement("div", {
    style: cardStyle
  }, /*#__PURE__*/React.createElement("div", {
    style: secStyle
  }, "ZANIMLJIVOSTI"), /*#__PURE__*/React.createElement("div", {
    style: bodyStyle
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: 0
    }
  }, "Oni koji nisu mogli uživo pratiti kraljevsku igru, partije su gledali na velikim šahovskim pločama postavljenima ispred Kneževa dvora. Tisuće Dubrovčana pratilo je uzdasima i oduševljenjem poteze najvećih svjetskih majstora."), /*#__PURE__*/React.createElement("p", null, "Zbog političkog raskola Tito–Staljin 1948. sve zemlje Informbiroa bojkotirale su Olimpijadu (Sovjetski savez, Mađarska, Čehoslovačka, Poljska i ostale). Također nisu nastupile ni reprezentacije SAD-a (organizacijske poteškoće) i Engleske (preklapanja termina s nacionalnim prvenstvom)."), /*#__PURE__*/React.createElement("p", null, "Pobjednički tim Jugoslavije pozvan je u Beograd avionom kojeg je osobno poslao maršal Tito, inače strastveni amaterski šahist. Susret u Bijeloj palači trajao je nekoliko sati."), /*#__PURE__*/React.createElement("p", {
    style: {
      marginBottom: 0
    }
  }, "Šah ima dokumentiranu povijest u Dubrovniku još od 1422. godine — preko 600 godina tradicije."))), /*#__PURE__*/React.createElement("div", {
    style: cardStyle
  }, /*#__PURE__*/React.createElement("div", {
    style: secStyle
  }, "DIZAJN FIGURA"), /*#__PURE__*/React.createElement("div", {
    style: bodyStyle
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: 0
    }
  }, "Originalne drvene šahovske figure „Dubrovnik\" specijalno su izrađene za dubrovačku olimpijadu. Skice je nacrtao poznati umjetnik Andrija Maurović, a izrađene su u radionici majstora Vjekoslava Jakopovića u Zagrebu."), /*#__PURE__*/React.createElement("p", null, "Organizatori su zahtijevali dizajn bez religijskih simbola, pa je tako tradicionalni križ na kralju zamijenjen kuglom."), /*#__PURE__*/React.createElement("p", {
    style: {
      marginBottom: 0
    }
  }, "Izrađeno je tek oko 50 originalnih setova, od kojih su danas gotovo svi nedostupni.")))), subTab === "figure" && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      color: TXT2,
      fontSize: 11,
      textAlign: "center",
      marginBottom: 12,
      lineHeight: 1.7
    }
  }, "Petar Poček — Dubrovnik 1950", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    style: {
      color: TXT3,
      fontSize: 10
    }
  }, "Autor dizajna bio je umjetnik Petar Poček iz Cetinja, koji je spojio modernističku jednostavnost i mediteransku eleganciju u set koji će postati legenda šahovskog svijeta.")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "Dubrovnik set Šah.PNG",
    alt: "Dubrovnik set — originalne figure iz 1950.",
    style: {
      width: "100%",
      borderRadius: 10,
      border: "1px solid " + BORDER,
      display: "block"
    }
  })), pieceData.map(function (pd) {
    return /*#__PURE__*/React.createElement("div", {
      key: pd.type,
      style: {
        background: "#1c1208",
        border: "1px solid " + BORDER,
        borderRadius: 10,
        padding: "14px 16px",
        marginBottom: 12,
        display: "flex",
        gap: 14,
        alignItems: "flex-start"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement(DubrovnikPiece, {
      type: pd.type,
      color: pd.color,
      size: 48
    })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        color: GOLD,
        fontSize: 11,
        letterSpacing: 3,
        marginBottom: 5
      }
    }, pd.name), /*#__PURE__*/React.createElement("div", {
      style: {
        color: TXT,
        fontSize: 11,
        lineHeight: 1.8
      }
    }, pd.desc)));
  })), subTab === "partija2" && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement("iframe", {
    src: "partija2.html",
    style: {
      width: "100%",
      height: 1200,
      border: "none",
      borderRadius: 8
    },
    title: "Trifunović vs Niemelä — Olimpijada 1950."
  }))), tab === "fischer" && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      ...cardStyle,
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "center",
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement(DubrovnikPiece, {
    type: "K",
    color: "w",
    size: 52
  }), /*#__PURE__*/React.createElement(DubrovnikPiece, {
    type: "Q",
    color: "w",
    size: 52
  }), /*#__PURE__*/React.createElement(DubrovnikPiece, {
    type: "K",
    color: "b",
    size: 52
  }), /*#__PURE__*/React.createElement(DubrovnikPiece, {
    type: "Q",
    color: "b",
    size: 52
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      color: "#f5e090",
      fontSize: 16,
      lineHeight: 1.9,
      fontStyle: "italic",
      marginBottom: 12
    }
  }, "\"This is the best set I have ever played on.\""), /*#__PURE__*/React.createElement("div", {
    style: {
      color: TXT2,
      fontSize: 12,
      letterSpacing: 2
    }
  }, "— BOBBY FISCHER"), /*#__PURE__*/React.createElement("div", {
    style: {
      color: TXT3,
      fontSize: 10,
      marginTop: 4
    }
  }, "Sveti Stefan, 1992.")), /*#__PURE__*/React.createElement("div", {
    style: cardStyle
  }, /*#__PURE__*/React.createElement("div", {
    style: secStyle
  }, "FISCHEROVA VEZA S DUBROVNIKOM"), /*#__PURE__*/React.createElement("div", {
    style: bodyStyle
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: 0
    }
  }, "Bobby Fischer prvi je put igrao s Dubrovnik figurama kao petnaestogodišnjak na međunarodnom turniru 1958. u Jugoslaviji. Od tog trenutka postale su njegov omiljeni šahovski set — onaj s kojim se osjećao najudobnije i najinspiriranije."), /*#__PURE__*/React.createElement("p", null, "Fischer je posjedovao vlastiti Dubrovnik set, koji je nosio na putovanja i koristio u brojnim analizama. Pojavljuje se na fotografijama i video‑snimkama iz različitih razdoblja njegove karijere. Taj mu je set, nažalost, kasnije bio ukraden."), /*#__PURE__*/React.createElement("p", null, "Za meč s Kasparovim u Svetom Stefanu 1992. organizatori su posudili originalni set iz 1950. godine — jedan od svega pedesetak ikada izrađenih. Fischer je osobno zatražio da se igra upravo tim setom, fasciniran njegovom gracioznošću, preglednošću i funkcionalnošću."), /*#__PURE__*/React.createElement("p", {
    style: {
      marginBottom: 0
    }
  }, "Za njega je Dubrovnik bio idealna sinteza ljepote i praktičnosti — najbolji šahovski set na kojem je ikada igrao."))), /*#__PURE__*/React.createElement("div", {
    style: cardStyle
  }, /*#__PURE__*/React.createElement("div", {
    style: secStyle
  }, "NASLJEĐE"), /*#__PURE__*/React.createElement("div", {
    style: bodyStyle
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: 0
    }
  }, "Originalni setovi iz 1950. danas su praktično nedostupni. Ako se i pojave na tržištu — što se događa iznimno rijetko — postižu vrtoglave cijene."), /*#__PURE__*/React.createElement("p", null, "Jedina vjerodostojna suvremena reprodukcija dolazi iz radionice NOJ Ltd. (Slovenija), poznate po izradi najpreciznijih replika povijesnih šahovskih setova. Lista čekanja za Dubrovnik set često je dulja od dvije godine."), /*#__PURE__*/React.createElement("p", {
    style: {
      marginBottom: 0
    }
  }, "Dubrovnik dizajn smatra se jednim od najljepših šahovskih setova u povijesti. Fischerova izjava i njegova osobna fascinacija tim mitskim figurama samo su dodatno učvrstile njihov legendaran status.")))), tab === "kasparov" && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: cardStyle
  }, /*#__PURE__*/React.createElement("div", {
    style: secStyle
  }, "KASPAROV U DUBROVNIKU - 1994."), /*#__PURE__*/React.createElement("div", {
    style: bodyStyle
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: 0
    }
  }, "Bio je 23. listopada 1994. Rat još nije bio gotov, Dubrovnik se tek oporavljao od ratnih strahota. I onda je došao Gari Kasparov — svjetski šahovski prvak i 25 ploča postavljenih oko Orlandova stupa."), /*#__PURE__*/React.createElement("p", {
    style: {
      marginBottom: 0
    }
  }, "Pred oko tisuću i pol gledatelja, uz blagi odsjaj mediteranskog sunca koje je zalazilo iza gradskih zidina, odigrala se jedna od najdirljivijih šahovskih simultanki u modernoj povijesti."))), /*#__PURE__*/React.createElement("div", {
    style: cardStyle
  }, /*#__PURE__*/React.createElement("div", {
    style: secStyle
  }, "ČINJENICE"), [["Datum", "23. listopada 1994."], ["Mjesto", "Oko Orlandovog stupa, Dubrovnik"], ["Protivnici", "25 igrača"], ["Gledatelji", "1.500"], ["Početak", "17:00 sati"], ["Rezultat", "Kasparov pobijedio u 23 partije"], ["Remiji", "Dvojica dubrovačkih šahista remizirala su"]].map(function (f) {
    return /*#__PURE__*/React.createElement("div", {
      key: f[0],
      style: {
        display: "flex",
        borderBottom: "1px solid #2a1a08",
        padding: "7px 0"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: TXT3,
        fontSize: 11,
        width: 90,
        flexShrink: 0
      }
    }, f[0]), /*#__PURE__*/React.createElement("span", {
      style: {
        color: TXT,
        fontSize: 11
      }
    }, f[1]));
  })), /*#__PURE__*/React.createElement("div", {
    style: cardStyle
  }, /*#__PURE__*/React.createElement("div", {
    style: secStyle
  }, "POLITIČKI KONTEKST"), /*#__PURE__*/React.createElement("div", {
    style: bodyStyle
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: 0
    }
  }, "Simultanka je bila daleko više od sportskog događaja. Kasparov je bio jedan od rijetkih svjetskih sportskih velikana koji je javno i odrješito stao uz Hrvatsku za vrijeme Domovinskog rata."), /*#__PURE__*/React.createElement("p", null, "Na Šahovskoj olimpijadi u Manili 1992. godine oštro je osudio srpsko-crnogorsku agresiju na Dubrovnik, u trenutku kada je mnogo toga još bilo nejasno zapadnom svijetu. Ta izjava odjeknula je daleko šire od šahovskih krugova, pomogavši mladoj hrvatskoj demokraciji."), /*#__PURE__*/React.createElement("p", {
    style: {
      marginBottom: 0
    }
  }, "Dolaskom u Dubrovnik 1994. godine Kasparov je potvrdio svoju duboku vezu s Hrvatskom i njezinim gradom biserom — i to u trenutku kada je ta gesta bila politički i simbolički najvažnija, gesta koja je zahtijevala hrabrost."))), /*#__PURE__*/React.createElement("div", {
    style: cardStyle
  }, /*#__PURE__*/React.createElement("div", {
    style: secStyle
  }, "ORLANDOV STUP I REMI"), /*#__PURE__*/React.createElement("div", {
    style: bodyStyle
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: 0
    }
  }, "Među 25 protivnika bili su uz dubrovačke šahiste i tadašnji američki i britanski veleposlanici u Hrvatskoj, gradonačelnik Dubrovnika Nikola Obuljen, te ministar turizma Niko Bulić. Šah ne pravi razliku — svi su za šahovske ploče sjeli ravnopravno, za viši cilj."), /*#__PURE__*/React.createElement("p", null, "Dvojica Dubrovčana uspjela su remizirati sa svjetskim prvakom. Jedan od njih, Ivo Sindik, prisjetio se: „Kasparov je pokušavao stvoriti pritisak, ali moja pozicija je bila pravi bunker. Dan poslije, Kasparov je analizirao partije u prostorijama Šahovskog kluba Dubrovnik i rekao da je možda mogao dva-tri poteza odigrati drugačije, ali da ni tada vjerojatno ne bi uspio stići do pobjede.“ Drugi šahist koji je izborio remi bio je jedan od velikana dubrovačkog šaha Vicko Marunčić."), /*#__PURE__*/React.createElement("p", {
    style: {
      marginBottom: 0
    }
  }, "Bajro Sarić, dugogodišnji predsjednik Šahovskog kluba Dubrovnik, pokušao je iznenaditi Kasparova Daminim gambitom — ali ni to nije bilo dovoljno."))), /*#__PURE__*/React.createElement("div", {
    style: cardStyle
  }, /*#__PURE__*/React.createElement("div", {
    style: secStyle
  }, "KASPAROV I HRVATSKA"), /*#__PURE__*/React.createElement("div", {
    style: bodyStyle
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: 0
    }
  }, "Veza Kasparova i Hrvatske ne završava s 1994. godinom. Od 2012. godine redovito dolazi u Hrvatsku u sklopu projekta „Šah uz školu“, promovirajući plemenitu igru u hrvatskim osnovnim školama."), /*#__PURE__*/React.createElement("p", null, "Simultanke je osim u Dubrovniku održao u Zagrebu, Sesvetama, Crikvenici i drugdje, a te su spektakularne priredbe uživo prenošene na državnoj televiziji. Godine 2014. Kasparovu je dodijeljeno hrvatsko državljanstvo kao znak zahvalnosti za sve što je učinio za Hrvatsku."), /*#__PURE__*/React.createElement("p", {
    style: {
      marginBottom: 0
    }
  }, "Od 1950. i šahovske Olimpijade do 1994. i Orlandovog stupa — Dubrovnik i danas ostaje jedno od najznačajnijih šahovskih mjesta na Mediteranu.")))), tab === "trifunovic" && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      width: "100%",
      marginBottom: 16,
      borderBottom: "1px solid #2a1a08"
    }
  }, trifTabBtn("karijera", "TRIFUNOVIĆ"), trifTabBtn("partija", "vs FISCHER 1961")), trifTab === "karijera" && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: cardStyle
  }, /*#__PURE__*/React.createElement("div", {
    style: secStyle
  }, "DR. PETAR TRIFUNOVIĆ — DUBROVČANIN"), /*#__PURE__*/React.createElement("div", {
    style: bodyStyle
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: 0
    }
  }, "Rođen u Dubrovniku 31. kolovoza 1910. Doktorirao je pravo i nosio titulu šahovskog velemajstora. Pet je puta bio prvak Jugoslavije. Čovjek kojeg su zvali \"Tajfunović\" zbog neustrašivih napada koji su protivnike ostavljali bez daha — i često bez rješenja na ploči."), /*#__PURE__*/React.createElement("p", {
    style: {
      marginBottom: 0
    }
  }, "Petar Trifunović bio je jedan od najvećih šahista koje je Dubrovnik ikada dao svijetu i jedan od najzaslužnijih što je reprezentacija Jugoslavije godinama bila druga šahovska nacija na svijetu, odmah iza SSSR-a. Sam Viktor Korčnoj objavio je 1960-ih članak pod naslovom \"Kako pobijediti dr. Trifunovića?\""))), /*#__PURE__*/React.createElement("div", {
    style: cardStyle
  }, /*#__PURE__*/React.createElement("div", {
    style: secStyle
  }, "ČINJENICE"), [["Rođen", "31. kolovoza 1910., Dubrovnik"], ["Umro", "8. prosinca 1980., Beograd"], ["Titula", "Velemajstor (1953.)"], ["Nadimak", '"Tajfunović"'], ["Prvak SFRJ", "5 puta (1945, 1946, 1947, 1952, 1961)"], ["Olimpijade", "7 nastupa (1935. — 1962.)"], ["Olimp. med.", "1 zlatna, 2 srebrne, 2 broncane"], ["Varijanta", "Trifunovićeva varijanta Aljehinove obrane"]].map(function (f) {
    return /*#__PURE__*/React.createElement("div", {
      key: f[0],
      style: {
        display: "flex",
        borderBottom: "1px solid #2a1a08",
        padding: "7px 0"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: TXT3,
        fontSize: 11,
        width: 90,
        flexShrink: 0
      }
    }, f[0]), /*#__PURE__*/React.createElement("span", {
      style: {
        color: TXT,
        fontSize: 11
      }
    }, f[1]));
  })), /*#__PURE__*/React.createElement("div", {
    style: cardStyle
  }, /*#__PURE__*/React.createElement("div", {
    style: secStyle
  }, "TAJFUNOVIĆ"), /*#__PURE__*/React.createElement("div", {
    style: bodyStyle
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: 0
    }
  }, "Šah je naučio kao šesnaestogodišnjak u Šibeniku, gotovo slučajno. Prvi učitelj bio mu je vozač po imenu Kunkov. Briljantan talent bio je očit od prvog dana. Već kao srednjoškolac igrao je simultanke napamet na sedamnaest ploča istovremeno."), /*#__PURE__*/React.createElement("p", null, "U mladosti je bio poznat kao žestoki napadač. Protivnici su strahovali od njegovih kombinacija, a novine su mu nadjenule zastrašujuće šahovsko ime — \"Tajfunović\". Nadimak je postao toliko popularan da su ga u svojim izvještajima s turnira neke redakcije refleksno počele koristiti kao njegovo pravo prezime."), /*#__PURE__*/React.createElement("p", {
    style: {
      marginBottom: 0
    }
  }, "Kasnije se stilom igre transformirao u izuzetnog pozicijskog igrača i majstora remija (700 remija u 1126 mečeva). Međutim, kada je bilo potrebno \"Tajfunović\" bi se vratio svojim munjevitim udarima. Jedan od primjera je veličanstvena pobjeda 1963. godine crnim figurama protiv svjetskog prvaka Mihaila Talja, igrajući vrlo oštri Falkbirov protivgambit (1.e4 e5 2.f4 d5!?)."))), /*#__PURE__*/React.createElement("div", {
    style: cardStyle
  }, /*#__PURE__*/React.createElement("div", {
    style: secStyle
  }, "OLIMPIJADA 1950. — POVRATAK KUĆI"), /*#__PURE__*/React.createElement("div", {
    style: bodyStyle
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: 0
    }
  }, "Trifunović u rujnu 1950. godine autoritativno sjedi za šahovskom pločom u rodnom Dubrovniku. U to vrijeme na vrhuncu karijere i plasiran oko 20. pozicije na svijetu. Nosi sav teret treće ploče jugoslavenske reprezentacije i odgovornost pred publikom koja ga osobno poznaje."), /*#__PURE__*/React.createElement("p", null, "Na kraju turnira ostvaruje rezultat 10 od 13 mogućih bodova (+8 =4 -1) i osvaja zlatnu medalju na trećoj ploči. Jugoslavija pobjeđuje u ukupnom poretku i osvaja svoje prvo šahovsko olimpijsko zlato u povijesti."), /*#__PURE__*/React.createElement("p", {
    style: {
      marginBottom: 0
    }
  }, "Trifunović kasnije piše da je taj trenutak bio jedan od najljepših u njegovom životu. Donio je pobjedu svojoj državi upravo u gradu gdje je rođen. Zaslužena nagrada za šahovskog genija."))), /*#__PURE__*/React.createElement("div", {
    style: cardStyle
  }, /*#__PURE__*/React.createElement("div", {
    style: secStyle
  }, "TRIFUNOVIĆEVA VARIJANTA"), /*#__PURE__*/React.createElement("div", {
    style: bodyStyle
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: 0
    }
  }, "Trifunovićev doprinos šahovskoj teoriji ne stoji samo u odigranim mečevima. Njegovo ime nosi jedna od varijanti Aljehinove obrane — varijanta koja bijelu agresivnu igru dočekuje čvrstom, pozicijskom obranom (1.e4 Sf6 2.e5 Sd5 3.d4 d6 4.c4 Sb6 5.f4 Lf5)."), /*#__PURE__*/React.createElement("p", {
    style: {
      marginBottom: 0
    }
  }, "Tu su varijantu kasnije koristili Viktor Korčnoj, Vasily Smyslov i Leonid Stein, što je potvrda da je Dubrovčanin ostavio trag ne samo svojim rezultatima, već i u doprinosu samoj arhitekturi moderne šahovske teorije."))), /*#__PURE__*/React.createElement("div", {
    style: cardStyle
  }, /*#__PURE__*/React.createElement("div", {
    style: secStyle
  }, "BESMRTAN MEĐU NAJVEĆIMA"), /*#__PURE__*/React.createElement("div", {
    style: bodyStyle
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: 0
    }
  }, "Trifunović se kroz karijeru nadmetao protiv gotovo svakog velikana svog doba. Pamte se njegov remi protiv Botvinnika 1947., pobjeda nad Taljom 1963., te drugo mjesto iza Botvinnika u Noordwijku 1965. (ispred Larsena, Flohra i Donnera), uz brojne druge pobjede koje je teško pobrojati."), /*#__PURE__*/React.createElement("p", null, "Meč Najdorf–Trifunović odigran u Opatiji 1949. godine ostao je trajno zapamćen s 10 remija i s po tek jednom pobjedom svakog."), /*#__PURE__*/React.createElement("p", {
    style: {
      marginBottom: 0
    }
  }, "\"Tajfunović\" je bio igrač kojeg se ekstremno teško pobjeđivalo (9% poraza u karijeri), ali i on je, posebno u kasnijoj \"smirenijoj\" fazi, teško stizao do trijumfa (27% pobjeda). Na turniru u Leipzigu 1965. godine odigrao je svih 15 partija neriješeno. Legenda!")))), trifTab === "partija" && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement("iframe", {
    id: "iframe-partija",
    src: "partija.html?v=3",
    style: {
      width: "100%",
      height: 1200,
      border: "none",
      borderRadius: 8
    },
    title: "Fischer vs Trifunović — Bled 1961."
  }))), tab === "prkos" && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "Šah iz prkosa.PNG",
    alt: "Šah iz prkosa — Dubrovnik 1991.",
    style: {
      width: "100%",
      borderRadius: 10,
      border: "1px solid " + BORDER,
      display: "block"
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: cardStyle
  }, /*#__PURE__*/React.createElement("div", {
    style: secStyle
  }, "BRZOPOTEZNI TURNIR U RATNIM UVJETIMA"), /*#__PURE__*/React.createElement("div", {
    style: bodyStyle
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: 0,
      marginBottom: 0
    }
  }, "17. studenog 1991., u jeku najžešćih ratnih stradanja Dubrovnika, u Gradskoj kavani održan je brzopotezni turnir ", /*#__PURE__*/React.createElement("em", null, "\"Voda, kruh i mlijeko\""), ", s nagradama kakve u šahu nikad nisu viđene, na pozornici koja je bila prekrivena ratnim krhotinama, s agresorskom vojskom koja je u svakom trenutku mogla ispaliti projektile na staru gradsku jezgru."))), /*#__PURE__*/React.createElement("div", {
    style: cardStyle
  }, /*#__PURE__*/React.createElement("div", {
    style: secStyle
  }, "HRABRI ŠAHISTI OKOVANI DASKAMA"), /*#__PURE__*/React.createElement("div", {
    style: bodyStyle
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: 0,
      marginBottom: 0
    }
  }, "Na dan turnira padala je velika kiša i ljudi su s lavandinima skupljali dragocjenu kišnicu s crkve svetog Vlaha. Gradska kavana je bila razrušena, te su je morali zakovati daskama da bi se uopće moglo igrati. Obitelji igrača strepile su hoće li se živi vratiti svojim kućama."))), /*#__PURE__*/React.createElement("div", {
    style: cardStyle
  }, /*#__PURE__*/React.createElement("div", {
    style: secStyle
  }, "NEVIĐEN ŠAHOVSKI PRKOS"), /*#__PURE__*/React.createElement("div", {
    style: bodyStyle
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: 0,
      marginBottom: 0
    }
  }, "Ono što se tog dana događalo nije bio tek bijeg od rata — bio je to čisti prkos. Igrati šah dok granate padaju, dok je grad bez struje i vode, pod opsadom vojske koja je granatirala zaštićenu spomeničku baštinu ostao je čin beskrajne volje i otpora koji se nije mogao slomiti. U svijet je odaslana poruka hrabrosti, zajedništva i ljubavi prema šahu."))), /*#__PURE__*/React.createElement("div", {
    style: cardStyle
  }, /*#__PURE__*/React.createElement("div", {
    style: secStyle
  }, "NAGRADE"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8,
      marginTop: 4
    }
  }, [["1. mjesto", "5 litara pitke vode", "Nikola Bubica"], ["2. mjesto", "Litra mlijeka", "Vicko Marunčić"], ["3. mjesto", "Štruca kruha", "Tomislav Šeparović"]].map(function (r, i) {
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        display: "flex",
        gap: 10,
        fontSize: 12,
        alignItems: "baseline"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: TXT3,
        minWidth: 72,
        flexShrink: 0
      }
    }, r[0]), /*#__PURE__*/React.createElement("span", {
      style: {
        color: TXT2,
        minWidth: 110,
        flexShrink: 0
      }
    }, r[1]), /*#__PURE__*/React.createElement("span", {
      style: {
        color: TXT
      }
    }, r[2]));
  }))), /*#__PURE__*/React.createElement("div", {
    style: cardStyle
  }, /*#__PURE__*/React.createElement("div", {
    style: secStyle
  }, "ŠAH-RAT"), /*#__PURE__*/React.createElement("div", {
    style: bodyStyle
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: 0
    }
  }, "Za vrijeme turnira sudionike je posjetio ratni dozapovjednik obrane grada pukovnik Mirko Katanić. U šali je rekao organizatoru Kulušiću: ", /*#__PURE__*/React.createElement("em", {
    style: {
      color: GOLD
    }
  }, "\"Ili im daj jesti i piti, ili ću te mobilizirati!\"")), /*#__PURE__*/React.createElement("p", null, "O turniru je snimljen dokumentarni film ", /*#__PURE__*/React.createElement("em", null, "\"Šah-Rat\""), " redatelja Nikole Dupera, koji na dojmljiv način prikazuje hrabre šahiste u stravičnom ratnom okruženju."), /*#__PURE__*/React.createElement("p", {
    style: {
      marginBottom: 0
    }
  }, "Turnir je postao tradicija — svake godine se održava Memorijal s istim nagradama kao 1991. godine, nagradama koje su doslovno značile razliku između života i smrti: voda, kruh i mlijeko.")))), tab === "richard" && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "Rikard I brodolom Lookrum.PNG",
    alt: "Rikard I. Lavljeg Srca — brodolom kod Lokruma, 1192.",
    style: {
      width: "100%",
      borderRadius: 10,
      border: "1px solid " + BORDER,
      display: "block"
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: cardStyle
  }, /*#__PURE__*/React.createElement("div", {
    style: secStyle
  }, "ŠAHOVSKA BAŠTINA DUBROVNIKA — OSAM STOLJEĆA \"CRNO-BIJELIH POLJA\""), /*#__PURE__*/React.createElement("div", {
    style: bodyStyle
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: 0
    }
  }, "Priča o šahu u Dubrovniku ne počinje 1950. godine. Ne počinje ni 1933., osnivanjem Šahovskog kluba „Dubrovnik\". Zapravo, ta priča vodi nas sve do 12. stoljeća i legende o engleskom kralju zatečenog olujom na Jadranu."))), /*#__PURE__*/React.createElement("div", {
    style: cardStyle
  }, /*#__PURE__*/React.createElement("div", {
    style: secStyle
  }, "RIKARD I. LAVLJEG SRCA I OTOK LOKRUM"), /*#__PURE__*/React.createElement("div", {
    style: bodyStyle
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: 0
    }
  }, "Engleski kralj Rikard I., poznat kao Lavlje Srce, vraćao se 1192. godine iz Trećeg križarskog rata. Njegovu je flotu u Jadranu zahvatila snažna oluja, zbog čega je kralj bio prisiljen potražiti zaklon i pristati uz otok Lokrum."), /*#__PURE__*/React.createElement("p", null, "Dubrovčani su mu pružili utočište i gostoprimstvo. U znak zahvalnosti, prema legendi, Rikard je Dubrovčanima poklonio skupocjenu šahovsku garnituru — jednu od onih koje su križari donosili s Istoka — predmet koji se u to doba smatrao simbolom plemićkog ugleda i viteške vještine."), /*#__PURE__*/React.createElement("p", null, "Legenda ili istina — ugledni povjesničari potvrđuju da su šah igrali stari Dubrovčani, koji su prihvaćali sva kulturna dostignuća svoga vremena. Šah je iz Perzije i Arabije stigao u Europu upravo u tom razdoblju, što se skladno uklopilo u dubrovačku sklonost učenju, trgovini i kulturnim novinama."), /*#__PURE__*/React.createElement("p", {
    style: {
      marginBottom: 0
    }
  }, "Legenda o kraljevskom daru stoljećima živi u gradu koji je šah uvijek smatrao dijelom svoje kulture, dodatno uzdižući ugled i posebnost dubrovačke šahovske tradicije.")))), tab === "ludus" && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: cardStyle
  }, /*#__PURE__*/React.createElement("div", {
    style: secStyle
  }, "PRVI PISANI DOKAZI O ŠAHU U DUBROVNIKU"), /*#__PURE__*/React.createElement("div", {
    style: bodyStyle
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: 0,
      marginBottom: 0
    }
  }, "Dok legenda govori o Rikardu I. Lavljeg Srca i šahovskoj garnituri iz 12. stoljeća, pisani izvori nude precizan i pouzdan uvid. U Državnom arhivu u Dubrovniku — smještenom u palači Sponza — čuva se jedna od najbogatijih i najsačuvanijih zbirki srednjovjekovnih dokumenata u Europi. Upravo se u toj arhivskoj građi, u latinskim spisima slavne Dubrovačke Republike, šah prvi put spominje kao dio svakodnevice dubrovačke vlastele."))), /*#__PURE__*/React.createElement("div", {
    style: cardStyle
  }, /*#__PURE__*/React.createElement("div", {
    style: secStyle
  }, "DUBROVAČKI STATUT I ZAKON O IGRAMA"), /*#__PURE__*/React.createElement("div", {
    style: bodyStyle
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: 0
    }
  }, "Dubrovačke vlasti 13. i 14. stoljeća pridavale su veliku važnost javnom redu i nadzoru nad igrama. U Statutu Dubrovačke Republike strogo su bile regulirane igre na sreću. Kockanje novcem, osobito igra kockicama (", /*#__PURE__*/React.createElement("em", null, "ludus taxillorum"), "), bili su zabranjivani i kažnjavani."), /*#__PURE__*/React.createElement("p", {
    style: {
      marginBottom: 0
    }
  }, "No, šah je bio (i ostao) posve drugačiji. Kroz 14. i 15. stoljeće, kako se on postupno širio Europom i Mediteranom, u dubrovačkim pravnim spisima počinje se jasno razlikovati kockanje (zabranjeno) od ", /*#__PURE__*/React.createElement("em", null, "ludus scacchorum"), " — šaha. Za razliku od igara na sreću, šah se smatrao igrom razuma i vještine. Stoga je njegovo igranje u privatnim kućama bilo dopušteno."))), /*#__PURE__*/React.createElement("div", {
    style: cardStyle
  }, /*#__PURE__*/React.createElement("div", {
    style: secStyle
  }, "KNJIGE OPORUKA I INVENTARA — SERIJA TESTAMENTA I INVENTARIA"), /*#__PURE__*/React.createElement("div", {
    style: bodyStyle
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: 0
    }
  }, "Kada bi preminuo dubrovački vlastelin ili imućni građanin, državni bilježnik izlazio bi na teren kako bi sastavio detaljan popis cjelokupne imovine. Ti pedantni zapisi — serije Inventaria i Testamenta — danas se čuvaju u Državnom arhivu u Dubrovniku i predstavljaju neprocjenjiv vremenski prozor u svakodnevni život Dubrovačke Republike."), /*#__PURE__*/React.createElement("p", null, "U tim knjigama iz kasnog 14. i 15. stoljeća među popisima tkanina, srebra, nakita i ostalih dragocjenosti pojavljuju se i stavke poput:"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: GOLD,
      fontStyle: "italic",
      paddingLeft: 12,
      borderLeft: "2px solid " + BORDER,
      margin: "10px 0"
    }
  }, /*#__PURE__*/React.createElement("em", null, "tabula de scachis"), " — šahovska ploča"), /*#__PURE__*/React.createElement("p", {
    style: {
      marginBottom: 0
    }
  }, "Uz ploče, povremeno se navode i kompleti figura, svrstani među vrijednije kućne predmete. Posjedovanje šahovske garniture u to je doba predstavljalo statusni simbol — znak obrazovanosti, ugleda i pripadnosti kulturnom krugu u kojem se šah smatrao plemenitom igrom."))), /*#__PURE__*/React.createElement("div", {
    style: cardStyle
  }, /*#__PURE__*/React.createElement("div", {
    style: secStyle
  }, "ŠTO NAM TO GOVORI"), /*#__PURE__*/React.createElement("div", {
    style: bodyStyle
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: 0
    }
  }, "Dubrovnik nije slučajno ugostio IX. Šahovsku olimpijadu 1950. Nije slučajno dao šahovske velikane poput Trifunovića. Nije slučajno privukao Aljehinovu simultanku i Kasparovljev posjet i naklonost."), /*#__PURE__*/React.createElement("p", null, "Šah je u Dubrovniku živi organizam od 14. stoljeća — ne kao egzotična uvozna igra, nego kao dio kulturnog identiteta grada. Dok su vlastela sjedila u vijećnicama i odlučivala o sudbini Republike, u njihovim su domovima ponosno stajale šahovske garniture. Ista strpljivost, ista strategija, ista sposobnost predviđanja protivnikovih poteza oblikovala je život Republike."), /*#__PURE__*/React.createElement("p", {
    style: {
      marginBottom: 0,
      color: GOLD,
      fontStyle: "italic"
    }
  }, "Obliti privatorum publica curate (Zaboravite privatno, brinite za javno) — stajalo je nad ulazom u Knežev dvor. Za šahovskom pločom, vlastela je vježbala tako oblikovan um i upijala mudrost, kojom su upravljali Republikom."))))), /*#__PURE__*/React.createElement("button", {
    onClick: onBack,
    style: {
      marginTop: 16,
      marginBottom: 24,
      background: MID,
      border: "1.5px solid " + BORDER,
      color: GOLD,
      padding: "12px 32px",
      borderRadius: 8,
      cursor: "pointer",
      fontSize: 13,
      fontFamily: "Georgia,serif",
      letterSpacing: 2
    }
  }, "NATRAG"));
}
ReactDOM.createRoot(document.getElementById("root")).render(/*#__PURE__*/React.createElement(HistoryScreen, {
  onBack: function () {
    window.location.href = 'index.html';
  }
}));
