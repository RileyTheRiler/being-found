/* Being Found 6.9 — UI orchestration. Original scenes, dialogue, and choices are unchanged. */
(() => {
 'use strict';
 if (window.BFPresentation) return;
 const $ = sel => document.querySelector(sel);
 const app = $('#app'); if (!app) return;
 const guide = $('#clGuide');
 const menu = $('#viewMenu');
 const bubbles = $('#bubbles');
 const isSmall = () => innerWidth < 900 || (innerWidth <= 1100 && innerHeight > innerWidth) || (innerWidth < 1300 && innerWidth > innerHeight && innerHeight >= 520);
 const savedFocus = (() => {try{return sessionStorage.getItem('being-found.focus-view')==='1';}catch{return false;}})();
 let focus = savedFocus;
 let guideOpen = false;
 let lastNarrow = isSmall();
 const saveFocus = () => {try{sessionStorage.setItem('being-found.focus-view',focus?'1':'0');}catch{}};
 const applyFocus = () => {app.classList.toggle('bf-focus-mode',focus);const b=$('#bf-focus-toggle');if(b){b.setAttribute('aria-pressed',String(focus));b.textContent='Focus view: '+(focus?'On':'Off');}};
 function addViewToggle() {
   if (!menu || menu.querySelector('#bf-focus-toggle')) return;
   const b=document.createElement('button');b.id='bf-focus-toggle';b.type='button';b.textContent='Focus view: '+(focus?'On':'Off');
   b.setAttribute('aria-pressed',String(focus));
   b.addEventListener('click',e=>{e.stopPropagation();focus=!focus;saveFocus();applyFocus();
     // Close the original menu via its own View control, preserving ARIA state.
     if (!menu.hidden) $('#vbView')?.click();
   });
   menu.append(b);
 }
 const guideButton=document.createElement('button');
 guideButton.type='button';guideButton.id='bf-guide-toggle';guideButton.textContent='Guide';
 guideButton.setAttribute('aria-controls','clGuide');guideButton.setAttribute('aria-expanded','false');
 guideButton.setAttribute('aria-label','Show or hide classroom guide');
 guideButton.addEventListener('click',()=>{guideOpen=!guideOpen;refreshGuide();if(guideOpen)guide?.querySelector('button')?.focus({preventScroll:true});});
 const bar=app.querySelector('.topbar');
 if(bar)bar.insertBefore(guideButton,bar.querySelector('#btnFlats'));
 function refreshGuide(){
   const visible=!!guide && !guide.hidden && document.body.classList.contains('cl-route');
   document.body.classList.toggle('bf-guide-closed',isSmall() && visible && !guideOpen);
   guideButton.hidden=!visible || !isSmall();
   guideButton.setAttribute('aria-expanded',String(!!visible && guideOpen));
   guideButton.textContent=guideOpen?'Close guide':'Guide';
 }
 function refreshActions(){
   document.body.classList.toggle('bf-actions-open',!!bubbles?.classList.contains('on'));
 }
 function resized(){
   const narrow=isSmall();if(narrow!==lastNarrow){lastNarrow=narrow;guideOpen=false;}
   refreshGuide();refreshActions();
 }
 if (guide) new MutationObserver(refreshGuide).observe(guide,{attributes:true,attributeFilter:['hidden','style']});
 if (bubbles) new MutationObserver(refreshActions).observe(bubbles,{attributes:true,attributeFilter:['class']});
 if(menu)new MutationObserver(addViewToggle).observe(menu,{childList:true});
 new MutationObserver(refreshGuide).observe(document.body,{attributes:true,attributeFilter:['class']});
 window.addEventListener('resize',resized,{passive:true});
 window.addEventListener('orientationchange',resized,{passive:true});
 document.addEventListener('keydown',e=>{
   if(e.key==='Escape' && guideOpen && isSmall() && guide && !guide.hidden){guideOpen=false;refreshGuide();guideButton.focus({preventScroll:true});}
 });
 addViewToggle();applyFocus();refreshActions();refreshGuide();
 window.BFPresentation={version:'6.9',setFocus(value){focus=!!value;saveFocus();applyFocus();},get focus(){return focus;},showGuide(){guideOpen=true;refreshGuide();}};
})();