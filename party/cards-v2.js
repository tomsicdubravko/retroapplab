// Visual layer only: the original game script is copied without changes.
(function(){
  var ranks=['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
  var suits=['♠','♥','♣','♦'],suitNames=['pik','herc','tref','karo'];
  function face(value){
    var index=ranks.indexOf(value),suit=suits[(index<0?0:index)%4];
    var face=document.createElement('div');face.className='v2-face'+(suit==='♥'||suit==='♦'?' red-suit':'')+(/[AJQK]/.test(value)?' v2-court':'');
    ['top','bottom'].forEach(function(position){var corner=document.createElement('span');corner.className='v2-corner '+position;var rank=document.createElement('span');rank.textContent=value;var icon=document.createElement('small');icon.textContent=suit;corner.append(rank,icon);face.appendChild(corner);});
    var center=document.createElement('span');center.className='v2-center';center.textContent=suit;face.appendChild(center);return face;
  }
  function back(){
    var back=document.createElement('div');back.className='v2-back';
    var svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 100 100');svg.setAttribute('aria-hidden','true');
    var use=document.createElementNS('http://www.w3.org/2000/svg','use');use.setAttribute('href','#v2-back-logo');svg.appendChild(use);
    var label=document.createElement('span');label.className='v2-back-label';label.textContent='PARTY';var edition=document.createElement('small');edition.textContent='GAMES';label.appendChild(edition);back.append(svg,label);return back;
  }
  function decorate(element){
    if(element.dataset.v2Face)return;
    element.dataset.v2Face='1';
    var rank=element.querySelector('span'),value=rank?rank.textContent.trim():'';
    if(!ranks.includes(value)){element.replaceChildren(back());element.setAttribute('aria-label','Skrivena karta Party Games');return;}
    element.dataset.v2Rank=value;
    if(element.classList.contains('bot-card-big')){
      var inner=document.createElement('div');inner.className='v2-flip-inner';
      var front=document.createElement('div');front.className='v2-flip-front';front.appendChild(face(value));
      var rear=document.createElement('div');rear.className='v2-flip-back';rear.appendChild(back());inner.append(front,rear);element.replaceChildren(inner);
    }else element.replaceChildren(face(value));
    element.setAttribute('aria-label',value+' '+suitNames[ranks.indexOf(value)%4]);
    if(element.classList.contains('card')){
      element.setAttribute('role','button');element.setAttribute('aria-pressed',String(element.classList.contains('selected')));
      var disabled=element.classList.contains('disabled');element.setAttribute('aria-disabled',String(disabled));element.tabIndex=disabled?-1:0;
      if(!disabled)element.addEventListener('keydown',function(event){if(event.key==='Enter'||event.key===' '){event.preventDefault();element.click();}});
    }
  }
  function decorateCards(){
    document.querySelectorAll('.card,.comp-card,.bot-card-big').forEach(decorate);
    document.querySelectorAll('#reveal-results .rr-cards span,#results-section .result-cards span').forEach(function(span){
      var value=span.textContent.match(/^(A|10|[2-9]|J|Q|K)♠/);
      if(!value)return;
      var text=span.textContent.replace(value[0],value[1]+suits[ranks.indexOf(value[1])%4]);
      if(text!==span.textContent)span.textContent=text;
    });
  }
  document.querySelectorAll('.waiting-card').forEach(function(element){element.appendChild(back());});
  var observer=new MutationObserver(decorateCards);
  ['cards-hand','comp-cards','bot-cards-display','reveal-results','results-section'].forEach(function(id){observer.observe(document.getElementById(id),{childList:true,subtree:true});});
  decorateCards();
  document.querySelectorAll('.ready-card').forEach(function(element){element.appendChild(face(element.dataset.rank));});
  // Reuse the existing reveal, sounds and score pass in one table.
  var originalRenderGame=window.renderGame,originalShowScreen=window.showScreen;
  var originalRevealScreen=window.showRevealScreen,originalResults=window.calcAndShowResults;
  var originalRevealAndScore=window.revealAndScore;
  var revealKey='',resultsReady=false,autoRevealPending=false,visibleBotRanks=[];
  function currentRevealKey(){return gameState.round+':'+gameState.compCards.map(function(c){return c.val;}).join(',');}
  function updateGridHits(){
    if(!window.gameState)return;
    var me=gameState.players.find(function(p){return p.id===myPeerId;});
    document.querySelectorAll('#cards-hand .card').forEach(function(card,i){
      card.classList.toggle('hit',!!(me&&me.selected.indexOf(i)>=0&&visibleBotRanks.indexOf(VALUES[i])>=0));
    });
  }
  function watchBotFlips(){
    document.querySelectorAll('#bot-cards-display .bot-card-big').forEach(function(card){
      if(card.dataset.hitObserved||!card.dataset.v2Rank)return;card.dataset.hitObserved='1';
      var value=card.dataset.v2Rank,key=revealKey;
      function revealed(){
        if(!window.gameState||gameState.phase!=='results'||key!==revealKey)return;
        if(visibleBotRanks.indexOf(value)<0)visibleBotRanks.push(value);updateGridHits();
      }
      if(matchMedia('(prefers-reduced-motion: reduce)').matches)revealed();
      else card.addEventListener('animationend',function(event){if(event.animationName==='v2-reveal')revealed();});
    });
  }
  new MutationObserver(watchBotFlips).observe(document.getElementById('bot-cards-display'),{childList:true,subtree:true});
  function syncRoundView(){
    if(!window.gameState)return;
    var waiting=gameState.phase==='waiting',picking=gameState.phase==='picking';
    var endLabel=document.getElementById('reveal-round-label');
    if(waiting&&endLabel.textContent.indexOf('KRAJ IGRE')>=0&&gameState.players.filter(function(p){return !p.eliminated;}).length>1)endLabel.textContent='RUNDA '+gameState.round;
    var over=waiting&&endLabel.textContent.indexOf('KRAJ IGRE')>=0;
    var table=document.getElementById('game-screen');
    table.classList.toggle('inline-game-over',over);table.classList.toggle('cards-round-waiting',waiting&&!over);table.classList.toggle('inline-picking',picking);table.classList.toggle('inline-results',resultsReady);
    document.getElementById('cards-round-ready').hidden=!waiting||over;
    document.getElementById('cards-host-wait').hidden=!(waiting&&gameMode==='online'&&!isHost);
    document.getElementById('reveal-screen').hidden=waiting&&!over;
    if(waiting){revealKey='';resultsReady=false;visibleBotRanks=[];table.classList.remove('inline-results');}
    if(picking){
      document.getElementById('bot-thinking').style.display='block';
      document.getElementById('bot-cards-wrap').style.display='none';document.getElementById('reveal-results').style.display='none';
      document.getElementById('reveal-next-btn').style.display='none';document.getElementById('reveal-newgame-btn').style.display='none';
    }
    var me=gameState.players.find(function(p){return p.id===myPeerId;});
    if(me&&gameState.phase==='results')document.getElementById('hand-title').textContent=resultsReady&&me.eliminated?'ELIMINIRAN 💀':'TVOJE KARTE';
    updateGridHits();
    document.querySelector('#bot-thinking .drawing-label').textContent=picking?'KARTE ČEKAJU OTKRIVANJE':'BOT IZVLAČI...';
    // The original timer auto-fills selections; only the host starts the existing reveal.
    var active=gameState.players.filter(function(p){return !p.eliminated;});
    if(picking&&isHost&&active.length&&active.every(function(p){return p.selected.length===2;})&&!autoRevealPending){
      autoRevealPending=true;queueMicrotask(function(){
        autoRevealPending=false;
        if(gameState.phase==='picking'&&isHost&&gameState.players.filter(function(p){return !p.eliminated;}).every(function(p){return p.selected.length===2;}))window.revealAndScore();
      });
    }
  }
  window.showScreen=function(id){originalShowScreen(id==='reveal-screen'?'game-screen':id);};
  window.renderGame=function(){originalRenderGame();syncRoundView();};
  window.revealAndScore=function(){if(!gameState||gameState.phase!=='picking')return;return originalRevealAndScore();};
  window.showRevealScreen=function(){
    var key=currentRevealKey();if(revealKey===key)return;revealKey=key;resultsReady=false;visibleBotRanks=[];
    originalRenderGame();syncRoundView();originalRevealScreen();
  };
  window.calcAndShowResults=function(){
    if(resultsReady)return;
    originalResults();resultsReady=true;visibleBotRanks=gameState.compCards.map(function(c){return c.val;});syncRoundView();
  };
  new MutationObserver(function(){if(window.gameState&&gameState.phase==='waiting')syncRoundView();}).observe(document.getElementById('reveal-round-label'),{childList:true});
  var bar=document.getElementById('sips-bar');
  function positionTable(){document.body.style.setProperty('--scorebar-space',getComputedStyle(bar).display==='none'?'18px':(bar.getBoundingClientRect().height+14)+'px');}
  new MutationObserver(positionTable).observe(bar,{attributes:true,attributeFilter:['style']});
  new ResizeObserver(positionTable).observe(bar);positionTable();
})();
