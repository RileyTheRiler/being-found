/* Being Found 7.6.1 — make the action sheet a correctly stacked, accessible
   top-level interaction without replacing the original choice handler. */
(() => {
  'use strict';
  if (window.BFInteraction) return;
  const app=document.getElementById('app');
  const scene=document.getElementById('scene');
  const bubbles=document.getElementById('bubbles');
  if(!app||!scene||!bubbles)return;
  const shade=document.createElement('div');
  shade.id='bf-action-backdrop';shade.hidden=true;
  shade.setAttribute('aria-hidden','true');
  document.body.appendChild(shade);
  const priorAria=app.getAttribute('aria-hidden');
  let focusReturn=null,open=false,lastTrigger=null;
  const isVisible=el=>!!el&&el.isConnected&&!!(el.offsetWidth||el.offsetHeight||el.getClientRects().length);
  function focusReturnToTrigger(){
    const node=lastTrigger;
    if(isVisible(node)&&!document.querySelector('#bf-check:not([hidden])')){
      try{node.focus({preventScroll:true});}catch{}
    }
  }
  function setOpen(){
    if(open)return;
    open=true;
    const obj=window.LW?.S?.menu;
    const pin=obj==='sim'?document.getElementById('simBtn'):
      obj==='npc'?document.querySelector('.pin.npc'):
      obj?document.querySelector(`.pin[data-obj="${CSS.escape(obj)}"]`):null;
    lastTrigger=pin;
    focusReturn=document.activeElement;
    document.body.appendChild(bubbles);
    shade.hidden=false;
    document.body.classList.add('bf-action-dialog-open');
    bubbles.classList.add('bf-action-sheet');
    bubbles.setAttribute('role','dialog');
    bubbles.setAttribute('aria-modal','true');
    const title=bubbles.querySelector('.bub-head')?.textContent?.trim()||'Object actions';
    bubbles.setAttribute('aria-label',title);
    // Remove inline placement from the original in-scene call. Responsive
    // styles now own position; desktop is positioned below.
    bubbles.style.left='';bubbles.style.right='';bubbles.style.top='';bubbles.style.bottom='';bubbles.style.width='';
    app.inert=true;
    app.setAttribute('aria-hidden','true');
    align();
    const first=bubbles.querySelector('.bub, .bub-dismiss');
    if(first && !bubbles.contains(document.activeElement))first.focus({preventScroll:true});
  }
  function align(){
    if(!open)return;
    const portrait=innerHeight>=innerWidth;
    const short=innerWidth>innerHeight&&innerHeight<=520;
    if(portrait||short){
      bubbles.style.left='';bubbles.style.right='';bubbles.style.top='';bubbles.style.bottom='';
      bubbles.style.width='';return;
    }
    // Wide desktop/tablet: keep the menu close to the chosen furniture,
    // but entirely inside the viewport and below the header.
    const pin=lastTrigger?.getBoundingClientRect();
    const width=Math.min(340,Math.max(255,innerWidth*.27));
    const height=Math.min(bubbles.scrollHeight,Math.max(180,innerHeight-94));
    const left=pin?Math.max(12,Math.min(innerWidth-width-12,
      pin.right+width+16>innerWidth?pin.left-width-16:pin.right+16)):(innerWidth-width)/2;
    const top=pin?Math.max(56,Math.min(innerHeight-height-12,pin.top+pin.height/2-height/2)):(innerHeight-height)/2;
    bubbles.style.width=width+'px';
    bubbles.style.left=left+'px';bubbles.style.right='auto';
    bubbles.style.top=top+'px';bubbles.style.bottom='auto';
    bubbles.style.maxHeight=`calc(100dvh - ${Math.max(68,top+12)}px)`;
  }
  function setClosed(){
    if(!open)return;
    // The parent game is inert while the sheet is open. Restore focus only
    // after restoring game interactivity; an immediate focus() is ignored.
    const returnFocus=bubbles.contains(document.activeElement) || document.activeElement===document.body;
    open=false;
    document.body.classList.remove('bf-action-dialog-open');
    shade.hidden=true;
    app.inert=false;
    if(priorAria===null)app.removeAttribute('aria-hidden');else app.setAttribute('aria-hidden',priorAria);
    bubbles.classList.remove('bf-action-sheet');
    bubbles.removeAttribute('role');bubbles.removeAttribute('aria-modal');bubbles.removeAttribute('aria-label');
    bubbles.style.left='';bubbles.style.right='';bubbles.style.top='';bubbles.style.bottom='';bubbles.style.width='';bubbles.style.maxHeight='';
    scene.appendChild(bubbles);
    if(returnFocus)focusReturnToTrigger();
  }
  const observer=new MutationObserver(()=>{
    if(bubbles.classList.contains('on'))setOpen();
    else setClosed();
  });
  observer.observe(bubbles,{attributes:true,attributeFilter:['class']});
  shade.addEventListener('click',()=>{
    if(!open)return;
    window.closeMenu?.();
    // If an external interaction system bypasses the native close hook,
    // still ensure the sheet disappears.
    if(bubbles.classList.contains('on'))bubbles.classList.remove('on');
    focusReturnToTrigger();
  });
  document.addEventListener('keydown',e=>{
    if(!open||document.body.classList.contains('bf-check-open'))return;
    if(e.key==='Escape'){
      e.preventDefault();e.stopPropagation();
      window.closeMenu?.();
      if(bubbles.classList.contains('on'))bubbles.classList.remove('on');
      focusReturnToTrigger();
    } else if(e.key==='Tab') {
      const focusable=[...bubbles.querySelectorAll('button:not([disabled]),[tabindex="0"]')].filter(isVisible);
      if(!focusable.length)return;
      const ix=focusable.indexOf(document.activeElement);
      const next=e.shiftKey?(ix<=0?focusable.length-1:ix-1):(ix<0||ix===focusable.length-1?0:ix+1);
      e.preventDefault();focusable[next].focus({preventScroll:true});
    }
  },true);
  bubbles.addEventListener('click',e=>{
    if(e.target.closest('[data-bubclose]')){
      queueMicrotask(focusReturnToTrigger);
    }
  },true);
  window.addEventListener('resize',align,{passive:true});
  window.addEventListener('orientationchange',align,{passive:true});
  window.BFInteraction={version:'7.6.1',get open(){return open;},align};
})();