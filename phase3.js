
/* Being Found 8.3.7: resident labels, intro metadata, accessible Reflect focus. */
(()=>{
'use strict';
if(window.BF837Cleanup)return;
window.BF837Cleanup=true;
const $=s=>document.querySelector(s);
function hideInternalReleaseText(){
 // Sometimes an encounter intro is inserted after the initial page load.
 // Remove metadata text nodes, not surrounding player dialogue or actions.
 const root=document.body;if(!root)return;
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
 let node;
 while((node=walker.nextNode())){
  const v=(node.nodeValue||'').trim();
  if(v.length>130||!/^(release\s+5\.[34])\b/i.test(v))continue;
  if(node.parentElement?.closest('style,script,textarea,pre,code'))continue;
  node.nodeValue='';
  const parent=node.parentElement;
  if(parent&&parent.children.length===0&&!parent.textContent.trim()){
    parent.dataset.bfInternalLabel='true';
    parent.setAttribute('hidden','');
  }
 }
}
function tidy(){
 const app=$('#app');if(!app)return;
 const twins=[...document.querySelectorAll('[id="simBtn"]')];
 twins.slice(1).forEach((el,i)=>{el.id='bf-body-secondary-'+(i+1);el.dataset.bfLegacyBody='true';});
 const who=($('#flatWho')?.textContent||'').trim().replace(/\s+/g,' ').slice(0,60);
 if(who){
   const name=who.replace(/^(?:flat|resident)\s+\d+:\s*/i,'');
   const label=name+': check in with the body';
   for(const el of document.querySelectorAll('[id="simBtn"],[data-bf-legacy-body="true"],#app .bodybtn')){
     if(el.getAttribute('aria-label')!==label)el.setAttribute('aria-label',label);
     if(el.getAttribute('title')&&/check.in|body/i.test(el.title)&&el.title!==label)el.title=label;
   }
 }
 hideInternalReleaseText();
}
let scheduled=false;
function queue(){
 if(scheduled)return;
 scheduled=true;requestAnimationFrame(()=>{scheduled=false;tidy()});
}
document.addEventListener('keydown',event=>{
 const modal=$('#bf83-layer');
 if(!modal||modal.hidden||event.key!=='Tab')return;
 const focusable=[...modal.querySelectorAll('button:not([disabled]):not([hidden]),a[href],input:not([disabled])')].filter(el=>el.getClientRects().length>0);
 if(!focusable.length){event.preventDefault();return;}
 const first=focusable[0],last=focusable[focusable.length-1];
 if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
 else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
},true);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',queue,{once:true});else queue();
document.addEventListener('click',()=>setTimeout(queue,75),true);
window.addEventListener('resize',queue);
setInterval(queue,950);
})();
