// ===== Košarka 2 na 2 - botovi: suigrači u karijeri (samo podaci; logika je u karijera.js i ai.js) =====
'use strict';
// bot: id, ime, tip (BOT_TIPOVI), rijetkost (BOT_RIJETKOSTI), osobine 0–100 na razini 1,
//   izgled {koza, kosa, frizura:'band'|'cap'|'pony', zensko}, posebnost (opis za karticu)
// razina 1–5: svaka razina iznad prve +BOT_RAZINA_BONUS na sve osobine
// legendarni: ~+15 na jake osobine tipa u odnosu na običnog bota istog tipa
const BOT_MAX_RAZINA=5, BOT_RAZINA_BONUS=4, BOT_NALJEPNICA_ZA_OTKLJUCAVANJE=10;
const BOT_POCETNI='dre';   // otključan od početka

// tip → arhetip (brojke u igri), osobnost (ponašanje AI-a, PERS u ai.js), tijelo (TIJELO u igraci.js)
const BOT_TIPOVI={
  suter:      {ime:T('botTip.suter'),       arhetip:'suter',     osobnost:'bot_suter',     tijelo:'sut',       opis:T('botTip.suter.opis')},
  centar:     {ime:T('botTip.centar'),      arhetip:'zakucavac', osobnost:'bot_centar',    tijelo:'centar',    opis:T('botTip.centar.opis')},
  allround:   {ime:T('botTip.allround'),   arhetip:'zakucavac', osobnost:'allround',      tijelo:null,        opis:T('botTip.allround.opis')},
  organizator:{ime:T('botTip.organizator'), arhetip:'brzi',      osobnost:'bot_organizator',tijelo:'allround', opis:T('botTip.organizator.opis')},
  branic:     {ime:T('botTip.branic'),      arhetip:'obrambeni', osobnost:'bot_branic',    tijelo:'branic',    opis:T('botTip.branic.opis')},
  zakucavac:  {ime:T('botTip.zakucavac'),   arhetip:'zakucavac', osobnost:'bot_zakucavac', tijelo:'zakucavac', opis:T('botTip.zakucavac.opis')}};

const BOT_RIJETKOSTI={
  obicni:    {ime:T('rijetkost.obicni'),     boja:'#9aa3b5'},
  rijetki:   {ime:T('rijetkost.rijetki'),    boja:'#3fa3ff'},
  epski:     {ime:T('rijetkost.epski'),      boja:'#b35cff'},
  legendarni:{ime:T('rijetkost.legendarni'), boja:'#ffb020'}};

// osobine: sut, trica, zakucavanje, brzina, dribling, kradja, blok, skok
const BOTOVI=[
  // --- obični: po jedan od svakog tipa ---
  {id:'dre', ime:'DRE', tip:'allround', rijetkost:'obicni',
   osobine:{sut:55,trica:55,zakucavanje:55,brzina:55,dribling:55,kradja:55,blok:55,skok:55},
   izgled:{koza:0xc68642,kosa:'#1d3f9e',frizura:'cap'}, posebnost:T('bot.dre.posebnost')},
  {id:'kiki', ime:'KIKI', tip:'suter', rijetkost:'obicni',
   osobine:{sut:62,trica:64,zakucavanje:38,brzina:52,dribling:50,kradja:46,blok:40,skok:46},
   izgled:{koza:0xf1c27d,kosa:'#6b3e1e',frizura:'pony',zensko:true}, posebnost:T('bot.kiki.posebnost')},
  {id:'bruno', ime:'BRUNO', tip:'centar', rijetkost:'obicni',
   osobine:{sut:44,trica:32,zakucavanje:62,brzina:44,dribling:40,kradja:46,blok:64,skok:62},
   izgled:{koza:0x6b4423,kosa:'#15100c',frizura:'band'}, posebnost:T('bot.bruno.posebnost')},
  {id:'leo', ime:'LEO', tip:'organizator', rijetkost:'obicni',
   osobine:{sut:52,trica:50,zakucavanje:44,brzina:60,dribling:64,kradja:54,blok:40,skok:48},
   izgled:{koza:0xe0ac69,kosa:'#2a1a12',frizura:'band'}, posebnost:T('bot.leo.posebnost')},
  {id:'vera', ime:'VERA', tip:'branic', rijetkost:'obicni',
   osobine:{sut:44,trica:42,zakucavanje:44,brzina:56,dribling:48,kradja:64,blok:58,skok:54},
   izgled:{koza:0x8d5524,kosa:'#1a1210',frizura:'pony',zensko:true}, posebnost:T('bot.vera.posebnost')},
  {id:'jole', ime:'JOLE', tip:'zakucavac', rijetkost:'obicni',
   osobine:{sut:46,trica:36,zakucavanje:66,brzina:58,dribling:52,kradja:46,blok:48,skok:62},
   izgled:{koza:0xb07a4f,kosa:'#3a2e1a',frizura:'cap'}, posebnost:T('bot.jole.posebnost')},
  // --- rijetki ---
  {id:'tara', ime:'TARA', tip:'suter', rijetkost:'rijetki',
   osobine:{sut:68,trica:70,zakucavanje:40,brzina:55,dribling:54,kradja:48,blok:42,skok:48},
   izgled:{koza:0xffdbac,kosa:'#d9b36c',frizura:'pony',zensko:true}, posebnost:T('bot.tara.posebnost')},
  {id:'medo', ime:'MEDO', tip:'centar', rijetkost:'rijetki',
   osobine:{sut:46,trica:34,zakucavanje:68,brzina:46,dribling:42,kradja:48,blok:70,skok:68},
   izgled:{koza:0xc68642,kosa:'#8a5a2a',frizura:'cap'}, posebnost:T('bot.medo.posebnost')},
  {id:'ogi', ime:'OGI', tip:'organizator', rijetkost:'rijetki',
   osobine:{sut:55,trica:54,zakucavanje:46,brzina:64,dribling:70,kradja:58,blok:42,skok:50},
   izgled:{koza:0x6b4423,kosa:'#b3221b',frizura:'band'}, posebnost:T('bot.ogi.posebnost')},
  // --- epski ---
  {id:'vuk', ime:'VUK', tip:'branic', rijetkost:'epski',
   osobine:{sut:50,trica:48,zakucavanje:52,brzina:64,dribling:54,kradja:76,blok:70,skok:62},
   izgled:{koza:0xe8b98a,kosa:'#15100c',frizura:'cap'}, posebnost:T('bot.vuk.posebnost')},
  {id:'iskra', ime:'ISKRA', tip:'zakucavac', rijetkost:'epski',
   osobine:{sut:52,trica:42,zakucavanje:76,brzina:68,dribling:60,kradja:52,blok:54,skok:74},
   izgled:{koza:0x8d5524,kosa:'#ff5a14',frizura:'pony',zensko:true}, posebnost:T('bot.iskra.posebnost')},
  // --- legendarni ---
  {id:'maestro', ime:'MAESTRO', tip:'organizator', rijetkost:'legendarni',
   osobine:{sut:62,trica:60,zakucavanje:50,brzina:75,dribling:80,kradja:69,blok:46,skok:56},
   izgled:{koza:0xb07a4f,kosa:'#e6b800',frizura:'band'}, posebnost:T('bot.maestro.posebnost')}];
