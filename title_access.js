/* Release 8.5.3: the title is a real modal while it is the active screen.
 * Keep this separate from authored story/consent code. */
(function titleFocus(){
  'use strict';
  const app=document.getElementById('app');
  const title=document.getElementById('mTitle');
  if(!app||!title)return;
  title.setAttribute('role','dialog');
  title.setAttribute('aria-modal','true');
  title.setAttribute('aria-labelledby','bf-title-heading');
  title.setAttribute('tabindex','-1');
  const snapshots=new Map();
  let ownsFocus=false;
  const focusSelector='a[href],button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled]),summary,[tabindex]:not([tabindex="-1"])';
  function visible(el){
    if(el.closest('[hidden],[inert],[aria-hidden="true"]'))return false;
    const style=getComputedStyle(el);
    return style.display!=='none'&&style.visibility!=='hidden'&&!!el.getClientRects().length;
  }
  function focusables(){
    return [...title.querySelectorAll(focusSelector)].filter(visible);
  }
  function overlayActive(){
    for(const selector of ['#prologue','#howPop','#meaningPop','#enc','#dele','#clOverlay']){
      const el=document.querySelector(selector);
      if(el&&!el.hidden&&getComputedStyle(el).display!=='none')return true;
    }
    return false;
  }
  function isTitleScreen(){
    return title.classList.contains('on')&&!app.inert&&!overlayActive()&&
      ![...app.querySelectorAll(':scope > .modal')].some(el=>el!==title&&el.classList.contains('on'));
  }
  function focusInside(){
    if(!ownsFocus||!isTitleScreen()||title.contains(document.activeElement))return;
    const first=title.querySelector('.title-primary');
    (first&&visible(first)?first:focusables()[0]||title).focus({preventScroll:true});
  }
  function release(){
    if(!ownsFocus)return;
    ownsFocus=false;
    snapshots.forEach((snapshot,el)=>{
      el.inert=snapshot.inert;
      if(snapshot.aria===null)el.removeAttribute('aria-hidden');
      else el.setAttribute('aria-hidden',snapshot.aria);
    });
    snapshots.clear();
  }
  function sync(){
    const heading=title.querySelector('h1');
    if(heading)heading.id='bf-title-heading';
    if(!isTitleScreen()){release();return;}
    if(!ownsFocus){
      for(const el of app.children){
        if(el===title)continue;
        snapshots.set(el,{inert:el.inert,aria:el.getAttribute('aria-hidden')});
        el.inert=true;
        el.setAttribute('aria-hidden','true');
      }
      ownsFocus=true;
    }
    queueMicrotask(focusInside);
  }
  document.addEventListener('keydown',event=>{
    if(event.key!=='Tab'||!ownsFocus||!isTitleScreen())return;
    const items=focusables();
    if(!items.length){event.preventDefault();title.focus({preventScroll:true});return;}
    const current=document.activeElement;
    const index=items.indexOf(current);
    const next=event.shiftKey
      ?(index<0?items.length-1:(index-1+items.length)%items.length)
      :(index<0?0:(index+1)%items.length);
    // Full ownership also avoids browser-specific Tab escape at shadow/summary boundaries.
    event.preventDefault();
    items[next].focus({preventScroll:true});
  },true);
  document.addEventListener('focusin',event=>{
    if(ownsFocus&&isTitleScreen()&&!title.contains(event.target))queueMicrotask(focusInside);
  },true);
  const observer=new MutationObserver(sync);
  observer.observe(title,{attributes:true,attributeFilter:['class'],childList:true});
  observer.observe(app,{attributes:true,attributeFilter:['inert']});
  for(const selector of ['#prologue','#howPop','#meaningPop','#enc','#dele','#clOverlay']){
    const el=document.querySelector(selector);
    if(el)observer.observe(el,{attributes:true,attributeFilter:['hidden','class']});
  }
  for(const el of app.querySelectorAll(':scope > .modal')){
    if(el!==title)observer.observe(el,{attributes:true,attributeFilter:['class']});
  }
  sync();
  window.BFTitleFocus={get active(){return ownsFocus;}};
})();
