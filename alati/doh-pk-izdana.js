function parseIssuedPKPages(pages){
 // Čitanje izdane PK kartice, obje vrste (ugrađuje alati/doh-licenca.py):
 // A) nova, "Elektronički zapis": ime i OIB u istom retku (OIB kao 11 zasebnih znamenki), više adresa s datumima, članovi u II.3 na 2. stranici
 // B) stara, bez elektroničkog zapisa: ime počinje s "1.", OIB kao jedan broj, jedna adresa, II.3 prazan
 const result={owner:{},address:null,children:[],isRequest:false,warnings:[],addressHistory:[]};
 const oibOk=v=>{try{validateDependentOIB(v,'OIB');return true;}catch(e){return false;}};
 const rowsOf=items=>{const rows=[];for(const i of [...items].sort((a,b)=>a.y-b.y||a.x-b.x)){let r=rows.find(r=>Math.abs(r.y-i.y)<2.5);if(!r){r={y:i.y,items:[]};rows.push(r);}r.items.push(i);}rows.forEach(r=>r.items.sort((a,b)=>a.x-b.x));return rows;};
 const first=pages.find(items=>items.some(i=>/KARTICA POREZA NA DOHODAK/i.test(i.str)));if(!first)throw Error('Nije pronađeno zaglavlje izdane PK kartice.');
 // Dio I. (OPĆI PODACI): od "I. OPĆI PODACI" do "II. 1.". Nova kartica te naslove nema kao tekst, pa tada vrijedi od naslova
 // kartice do legende oznaka ispod II.1. Uvijek samo stranica s naslovom: na 2. stranici nove kartice je OIB Porezne uprave.
 const title=first.find(i=>/KARTICA POREZA NA DOHODAK/i.test(i.str));
 const startI=first.find(i=>/OPĆI/i.test(i.str)&&i.y>=title.y)?.y??title.y;
 const endI=first.find(i=>/^II\.\s*1\./.test(pkClean(i.str))&&i.y>startI)?.y??first.find(i=>/radnik\s*\/\s*osoba koja ostvaruje/i.test(i.str)&&i.y>startI)?.y??Infinity;
 const partI=rowsOf(first.filter(i=>i.y>startI-1&&i.y<endI-1));
 // 1. OIB obveznika: prvi 11-znamenkasti broj s ispravnom kontrolnom znamenkom (jedan broj ili znamenke jedna do druge)
 let owner=null;
 for(const r of partI){
  const runs=[];let cur=null;
  for(const i of r.items){const t=pkClean(i.str);if(/^\d+$/.test(t)){if(cur&&i.x-cur.lastX<25){cur.digits+=t;cur.items.push(i);}else{cur={digits:t,items:[i]};runs.push(cur);}cur.lastX=i.x;}else cur=null;}
  const hit=runs.find(run=>run.digits.length===11&&oibOk(run.digits));if(hit){owner={row:r,run:hit};break;}
 }
 if(!owner)throw Error('OIB obveznika u izdanoj PK nije pouzdano očitan.');
 result.owner.oib=owner.run.digits;
 // 2. Ime: tekst u istom retku ispred OIB-a, bez "1." na početku
 const oibX=owner.run.items[0].x;
 result.owner.fullName=pkJoin(owner.row.items.filter(i=>i.x<oibX-5&&!/^\d+\.?$/.test(pkClean(i.str)))).replace(/^1\.\s*/,'');
 if(!result.owner.fullName)throw Error('Ime obveznika nije očitano.');
 // 3. Adresa: redci sa šifrom općine/grada; uzima se onaj s najnovijim datumom "podaci vrijede od"
 for(const r of partI){
  const code=r.items.find(i=>/^\d{5}$/.test(pkClean(i.str)));if(!code)continue;
  const dateItem=r.items.find(i=>i.x>code.x&&/\d{2}\.\d{2}\.\d{4}/.test(i.str));
  const raw=pkJoin(r.items.filter(i=>i.x>code.x&&i!==dateItem));const parts=raw.split(',').map(pkClean);
  if(parts.length!==3||!dateItem){result.warnings.push('Adresa „'+raw+'” nije pouzdano razdvojena; provjerite je ručno.');continue;}
  const from=dateItem.str.match(/\d{2}\.\d{2}\.\d{4}/)[0].replaceAll('.','/');
  result.addressHistory.push({raw,place:parts[0],street:parts[1],number:parts[2],from,sort:xmlISODate(from,'Adresa vrijedi od')});
 }
 if(result.addressHistory.length){result.addressHistory.sort((a,b)=>b.sort.localeCompare(a.sort));result.address=result.addressHistory[0];if(result.addressHistory.length>1)result.warnings.push('Odabrana je najnovija adresa, vrijedi od '+result.address.from+'. Starije adrese nisu automatski prenesene.');}
 else result.warnings.push('Adresa iz izdane kartice nije očitana.');
 // 4. Uzdržavani članovi: samo iz II.3; prazna tablica znači da kartica nema uzdržavanih članova
 for(const items of pages){const tableTitle=items.find(i=>/PODACI O OSOBNIM ODBICIMA ZA UZDRŽAVANE/i.test(i.str));if(!tableTitle)continue;
 const footer=items.find(i=>/^POSLOPRIMAC JE DUŽAN/i.test(i.str)&&i.y>tableTitle.y);const zone=items.filter(i=>i.y>tableTitle.y&&(!footer||i.y<footer.y));
 if(!zone.some(i=>/^\d{11}$/.test(pkClean(i.str))))continue;
 if(!footer)throw Error('Granice tablice članova nisu prepoznate.');
 const nameHeader=zone.find(i=>pkClean(i.str)==='IME I PREZIME'),relHeader=zone.find(i=>/^SROD/.test(pkClean(i.str))),oibHeader=zone.find(i=>pkClean(i.str)==='OIB'),invalidHeader=zone.find(i=>pkClean(i.str)==='INVALIDNOST'),dateHeader=zone.find(i=>/^PODACI( VRIJEDE)?$/.test(pkClean(i.str)));
 if(!nameHeader||!relHeader||!oibHeader||!invalidHeader||!dateHeader)throw Error('Stupci izdane PK tablice nisu prepoznati.');
 const numbers=zone.filter(i=>/^[1-9]$/.test(pkClean(i.str))&&i.y>invalidHeader.y&&i.y<invalidHeader.y+45);const gridRow=numbers.find(i=>pkClean(i.str)==='1'&&i.x<nameHeader.x-30);if(!gridRow)throw Error('Numerirano zaglavlje PK tablice nije prepoznato.');
 const rows=zone.filter(i=>/^\d+$/.test(pkClean(i.str))&&i.x<gridRow.x+6&&i.y>gridRow.y+5).sort((a,b)=>a.y-b.y);
 for(let n=0;n<rows.length;n++){const row=zone.filter(i=>i.y>=rows[n].y-2&&i.y<(rows[n+1]?.y-2||(footer?footer.y:Infinity)-2));const oibs=row.filter(i=>/^\d{11}$/.test(pkClean(i.str))&&i.x>oibHeader.x-45&&i.x<invalidHeader.x-12);if(oibs.length!==1)throw Error('OIB člana izdane kartice nije pouzdano očitan.');const full=pkJoin(row.filter(i=>i.x>gridRow.x+8&&i.x<relHeader.x-8));const words=full.split(' '),lastName=words.length>1?words.pop():'',firstName=words.join(' ');const relationship=row.find(i=>/^(D\d+|S|U)$/.test(pkClean(i.str))&&i.x>=relHeader.x-10&&i.x<oibHeader.x-35)?.str;
 const dates=pkJoin(row.filter(i=>i.x>dateHeader.x-15&&i.x<dateHeader.x+85)).match(/\d{2}[/.]\d{2}[/.]\d{4}/g)||[];if(!firstName||!lastName||!relationship||dates.length<1||dates.length>2)throw Error('Ime, srodstvo ili razdoblje člana nisu potpuno očitani.');const from=dates[0].replaceAll('.','/'),to=dates[1]?.replaceAll('.','/')||'';xmlISODate(from,'PK član od');if(to)xmlISODate(to,'PK član do');validateDependentOIB(oibs[0].str,'PK član');
 const extra=row.filter(i=>i.x>=invalidHeader.x-12&&i.x<dateHeader.x-15||i.x>=dateHeader.x+85);if(extra.some(i=>pkClean(i.str)))result.warnings.push('Član '+full+': postoje dodatni podaci o invalidnosti ili dijeljenju odbitka; provjerite ih ručno u dodatnim poljima člana.');
 result.children.push({firstName,lastName,oib:oibs[0].str,relationship,from,to});}
 }
 if(result.children.length>7)throw Error('PDF sadrži više od 7 članova.');if(new Set(result.children.map(c=>c.oib)).size!==result.children.length)throw Error('Kartica ima više redaka istog člana; razdoblja treba ručno provjeriti.');
 if(!result.children.length){result.warnings.push('Kartica nema upisanih uzdržavanih članova (II.3). Prenose se samo podaci o obvezniku i adresa.');return result;}
 result.warnings.push('Provjerite razdvojena imena i prezimena prije prijenosa.');if(result.children.some(c=>!c.to))result.warnings.push('Datum do nije naveden u kartici i ostaje prazan. Za godišnji DOH provjerite primjenjivo razdoblje prije XML izvoza.');return result;
}
