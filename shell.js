(function reliable(){
  'use strict';
  if(window.BF83Loaded)return;
  window.BF83Loaded=true;
  window.BF83Status='loaded';
  const $=s=>document.querySelector(s);
  let sheet,focusPrev,reflectPriorAria=null,reflectPriorInert=false;
  function dismiss(){
    if(!sheet||sheet.hidden)return;
    sheet.hidden=true;
    const app=$('#app');
    if(app){
      app.inert=reflectPriorInert;
      if(reflectPriorAria===null)app.removeAttribute('aria-hidden');
      else app.setAttribute('aria-hidden',reflectPriorAria);
    }
    focusPrev?.setAttribute('aria-expanded','false');
    if(focusPrev?.isConnected)focusPrev.focus({preventScroll:true});
  }
  function ensureSheet(){
    if(sheet||!document.body)return;
    sheet=document.createElement('div');
    sheet.id='bf83-layer';sheet.hidden=true;
    sheet.innerHTML='<div class="bf83-backdrop" data-close></div><section class="bf83-panel" role="dialog" aria-modal="true" aria-labelledby="bf83-reflect-title" aria-describedby="bf83-reflect-copy"><button type="button" class="bf83-close">Close</button><h2 id="bf83-reflect-title">Reflect</h2><p id="bf83-reflect-copy">Possibilities in this scene are authored interpretations.</p><div class="bf83-actions"><button data-action="body">Body check-in</button><button data-action="model">Five possibilities</button><button data-action="terms">Study terms</button></div><p class="bf83-note">Fictional perspectives, not clinical assessments.</p></section>';
    document.body.appendChild(sheet);
    // Announce new follow-ups without rereading the complete story card.
    if(!$('#bf83-story-status')){
      const live=document.createElement('div');
      live.id='bf83-story-status';live.className='bf83-sr-only';
      live.setAttribute('role','status');
      live.setAttribute('aria-live','polite');
      live.setAttribute('aria-atomic','true');
      document.body.appendChild(live);
    }
    sheet.addEventListener('click',e=>{
      if(e.target.closest('.bf83-close')||e.target.hasAttribute('data-close')){dismiss();return}
      const a=e.target.closest('[data-action]')?.dataset.action;if(!a)return;
      dismiss();
      if(a==='body')$('#simBtn')?.click();
      if(a==='model')openWorld();
      if(a==='terms')$('#btnTerms')?.click();
    });
  }
  // 8.3.8: "Five possibilities" opens the world readout at every size. Phones use
  // the game's own bottom sheet. Wide screens show the same panel as a side
  // drawer. The sandbox keeps the readout on screen, so there it only scrolls
  // back to the top.
  function closeWorld(){$('#app')?.classList.remove('bf-world-open')}
  function openWorld(){
    const app=$('#app');if(!app)return;
    if(document.body.classList.contains('cl-route'))return;
    if(app.classList.contains('narrow')){$('#wStrip')?.click();return}
    if(app.classList.contains('sandbox')){$('#colRight')?.scrollTo({top:0});return}
    // Laptops already show the readout under the story: bring it to its top.
    const col=$('#colRight');
    if(col&&col.getBoundingClientRect().width>0&&getComputedStyle(col).position!=='fixed'){col.scrollTo({top:0});col.querySelector('#worldPanel')?.scrollIntoView({block:'nearest'});return}
    app.classList.add('bf-world-open');
    $('#colRight .sheet-close')?.focus({preventScroll:true});
  }
  document.addEventListener('click',e=>{
    if(!$('#app')?.classList.contains('bf-world-open'))return;
    if(e.target.closest('#colRight .sheet-close,#scene,#dock,#sdock,.topbar'))closeWorld();
  },true);
  function open(btn){
    ensureSheet();if(!sheet)return;focusPrev=btn;
    const who=($('#flatWho')?.textContent||'this person').trim();
    $('#bf83-reflect-copy').textContent='This fictional moment shows what the room offers to '+who+'. You can inspect body experience, the model, and study terms.';
    // The guided classroom route withholds the world readout on purpose, so
    // its entry leaves the sheet there.
    sheet.querySelector('[data-action="model"]').hidden=document.body.classList.contains('cl-route');
    const app=$('#app');
    reflectPriorAria=app?.getAttribute('aria-hidden')??null;
    reflectPriorInert=!!app?.inert;
    sheet.hidden=false;
    btn.setAttribute('aria-expanded','true');
    // Move keyboard focus first, then isolate the background game.
    sheet.querySelector('.bf83-close').focus({preventScroll:true});
    if(app){app.inert=true;app.setAttribute('aria-hidden','true');}
  }
  document.addEventListener('keydown',e=>{
    if(e.key!=='Escape')return;
    if(sheet&&!sheet.hidden){e.preventDefault();dismiss()}
    else if($('#app')?.classList.contains('bf-world-open')){e.preventDefault();closeWorld()}
  });
  function sync(){
    const app=$('#app'),scene=$('#scene');
    if(!app||!scene||!document.body)return;
    const live=scene.getBoundingClientRect().width>0;
    if(!live)return;
    ensureSheet();
    const header=document.querySelector('.story-header')||document.querySelector('#result')||document.querySelector('.result')||document.querySelector('.dock');
    if(!header)return;
    app.classList.add('bf-shell-ready');
    document.body.classList.add('bf83-body');
    let btn=$('#bf83-reflect-launch');
    if(!btn){
      btn=document.createElement('button');btn.id='bf83-reflect-launch';btn.className='bf83-reflect';btn.type='button';btn.textContent='Reflect';
      btn.setAttribute('aria-haspopup','dialog');
      btn.setAttribute('aria-controls','bf83-layer');
      btn.setAttribute('aria-expanded','false');
      btn.setAttribute('aria-label','Reflect on this moment');
      btn.addEventListener('click',()=>open(btn));
    }
    // 8.3.8: Reflect holds one fixed place, the corner of the room, so it no
    // longer drifts through the story card.
    if(btn.parentElement!==scene)scene.appendChild(btn);
    const nav=$('#bf-room-nav');
    if(nav&&!scene.contains(nav))scene.appendChild(nav);
    for(const n of app.querySelectorAll('.release,.version,.build-tag,.bf-build-tag'))if(/^(release|room edition|version)\s*[0-9]/i.test(n.textContent.trim()))n.dataset.bfInternalLabel='true';
    window.BF83Status='ready';
  }
  // 8.3.8: a follow-up choice, and then the answer to it, arrive on screen. The
  // story area scrolls once to show the whole block, then leaves the scroll to
  // the player.
  let pinKey=null,pinTimer=0,pinUntil=0,playerScrolled=false,watching=null;
  const scrollerOf=el=>{
    for(let p=el.parentElement;p&&p!==document.body;p=p.parentElement){
      const o=getComputedStyle(p).overflowY;
      if((o==='auto'||o==='scroll')&&p.scrollHeight>p.clientHeight+1)return p;
    }
    return document.scrollingElement;
  };
  function showMoment(){
    const m=$('#result .bf-moment');
    if(!m||playerScrolled||performance.now()>pinUntil){clearInterval(pinTimer);pinTimer=0;return}
    const box=scrollerOf(m),page=box===document.scrollingElement;
    const limit=(page?innerHeight:Math.min(box.getBoundingClientRect().bottom,innerHeight))-6;
    const over=m.getBoundingClientRect().bottom-limit;
    if(over>1)box.scrollTop+=Math.ceil(over);
    $('#result .bf-moment-jump')?.remove();
  }
  function watchMoment(){
    const m=$('#result .bf-moment');
    if(!m){pinKey=null;return}
    const key=m.dataset.entry+':'+m.dataset.stage;
    if(key===pinKey)return;
    pinKey=key;playerScrolled=false;pinUntil=performance.now()+3000;
    const live=$('#bf83-story-status');
    const excerpt=m.querySelector('p')?.textContent?.trim()||'';
    if(live)live.textContent=(m.dataset.stage==='choosing'?'A new story choice is available. ':'Story response recorded. ')+excerpt;
    clearInterval(pinTimer);pinTimer=setInterval(showMoment,120);showMoment();
  }
  function watchResult(){
    const r=$('#result');
    if(!r||watching===r)return;
    watching=r;new MutationObserver(watchMoment).observe(r,{childList:true});watchMoment();
  }
  for(const type of ['wheel','touchmove'])document.addEventListener(type,()=>{playerScrolled=true},{passive:true});
  // 8.3.8: four destinations. The title offers Story, Rooms, Sandbox and About.
  // The Rooms menu groups what it holds under four headings. Every button is
  // the game's own, moved or relabelled, so the game's handlers still run them.
  const make=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text)e.textContent=text;return e};
  function regroupTitle(){
    const card=$('#mTitle .mcard');if(!card||card.dataset.bfMenu)return;
    const more=card.querySelector('details.title-more'),row=more?.querySelector('.btnrow');if(!more||!row)return;
    card.dataset.bfMenu='1';
    const dest=make('div','bf-dest');
    const start=row.querySelector('[data-go="start"]');
    // A saved room keeps its Continue button. The separate Noor start lives in Rooms.
    if(start){if(/^continue/i.test(start.textContent.trim()))dest.appendChild(start);else start.hidden=true}
    const rooms=row.querySelector('[data-go="flats"]');if(rooms){rooms.textContent='Rooms';dest.appendChild(rooms)}
    const sandbox=make('button','cta ghost','Sandbox');sandbox.type='button';sandbox.dataset.go='sandbox';dest.appendChild(sandbox);
    for(const s of ['[data-dele]','[data-enc]']){const b=row.querySelector(s);if(b)b.hidden=true}
    more.before(dest);
    const sum=more.querySelector('summary');if(sum)sum.textContent='About';
    more.open=false;
  }
  function regroupRooms(){
    const card=$('#mFlats .mcard');if(!card||card.dataset.bfMenu)return;
    const row=card.querySelector(':scope > .btnrow'),grids=card.querySelectorAll(':scope > .flatgrid');if(!row||!grids.length)return;
    card.dataset.bfMenu='1';
    const heads=card.querySelectorAll(':scope > h2');if(heads[0])heads[0].textContent='Five flats';
    const section=(eyebrow,title)=>{row.before(make('div','eyebrow',eyebrow),make('h2','',title))};
    const encounters=[row.querySelector('[data-dele]'),row.querySelector('[data-enc]')].filter(Boolean);
    if(encounters.length){section('Meet them first','Two encounters');const r=make('div','btnrow bf-menu-row');r.append(...encounters);row.before(r)}
    const visit=card.querySelector('.flatcard[data-go="visitintro"]'),compare=row.querySelector('[data-go="final"]');
    if(visit||compare){
      section('Best after the five flats','Afterwards');
      if(visit){const g=make('div','flatgrid');g.appendChild(visit);row.before(g)}
      if(compare){const r=make('div','btnrow bf-menu-row');r.appendChild(compare);row.before(r)}
    }
    // The sandbox, the guided story, sources and study terms each have one home elsewhere.
    for(const s of ['.flatcard[data-go="sandbox"]','[data-go="terms"]','[data-class]','[data-go="sources"]']){const b=card.querySelector(s);if(b)b.hidden=true}
  }
  // Back in the Rooms menu returns to the title when the title opened it.
  let roomsFromTitle=false;
  document.addEventListener('click',e=>{
    const b=e.target.closest?.('button');if(!b)return;
    if(b.closest('#mTitle')&&b.dataset.go==='flats'){roomsFromTitle=true;return}
    if(!b.closest('#mFlats'))return;
    const back=roomsFromTitle&&b.dataset.go==='close';roomsFromTitle=false;
    if(back)setTimeout(()=>{if(!$('.modal.on'))$('#mTitle')?.classList.add('on')},0);
  },true);
  function watchMenus(){
    for(const [id,fn] of [['#mTitle',regroupTitle],['#mFlats',regroupRooms]]){
      const m=$(id);if(!m)continue;
      if(!m.dataset.bfWatched){m.dataset.bfWatched='1';new MutationObserver(fn).observe(m,{childList:true,subtree:true})}
      fn();
    }
  }
  setInterval(()=>{sync();watchResult();watchMenus()},500);
  document.addEventListener('DOMContentLoaded',watchMenus,{once:true});
  window.addEventListener('DOMContentLoaded',sync);
  window.addEventListener('load',sync);
  window.addEventListener('resize',sync);
  sync();
})();