/* Being Found 7.5 — one shared articulated 3D authoring pipeline for three
 * residents. Each character is rendered from their own animated GLB, with
 * consistent perspective and animation states. The native renderer is fallback.
 */
(() => {
 'use strict';
 if(window.BFRig)return;
 const S=window.LW?.S;
 const PAIR={rooted:'noor',grief:'tomas',depression:'dele'};
 const META={w:112,h:144,pivotY:129,cols:15,dirs:8};
 const reduce=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
 const assets={};
 let enabled=true,lastFlat=null,lastX=null,lastY=null,movementDir=0,totalDraws=0,lastState='idle';
 try{enabled=localStorage.getItem('beingfound.model_rig')!=='off';}catch(_){}
 function ensure(flat){
  const id=PAIR[flat];if(!id)return null;
  if(assets[id])return assets[id];
  const a={id,loaded:false,failed:false,atlas:new Image()};
  a.atlas.decoding='async';
  a.atlas.onload=()=>{a.loaded=a.atlas.naturalWidth===META.w*META.cols&&a.atlas.naturalHeight===META.h*META.dirs;a.failed=!a.loaded;};
  a.atlas.onerror=()=>{a.failed=true;a.loaded=false;};
  a.atlas.src=window.__BFRigAssetOverrides?.[id]||`assets/${id}_atlas.webp`;
  assets[id]=a;return a;
 }
 function onStep(s){
  if(!s||!S)return;
  const flat=S.flat?.id;
  ensure(flat);
  if(flat!==lastFlat){lastFlat=flat;lastX=null;lastY=null;movementDir=0;}
  if(lastX!=null&&lastY!=null&&s.path?.length){
   const dx=s.x-lastX,dy=s.y-lastY;
   if(dx*dx+dy*dy>.000005){const sx=dx-dy,sy=dx+dy;movementDir=((Math.round(Math.atan2(sx,sy)*4/Math.PI)%8)+8)%8;}
  }
  lastX=s.x;lastY=s.y;
 }
 function direction(o){
  // Side-scrolling movement is genuinely horizontal in the room renderer.
  // Source-rig direction 2 faces screen-right and direction 6 screen-left.
  if(o.moving&&S.sim.bfWalking&&S.sim.bfSideVX)return S.sim.bfSideVX>0?2:6;
  if(o.moving&&S.sim.path?.length)return movementDir;
  if(o.face==='back')return o.flip===-1?5:3;
  if(o.face==='front')return o.flip===-1?7:1;
  return movementDir;
 }
 function frame(o){
  const synced=window.BFStageSync?.frame?.(S,o);if(synced)return synced;
  const sim=S.sim;
  if(o.pose==='sit'||o.pose==='floor')return ['sit',11];
  if(o.moving&&sim.path?.length&&!reduce()){
   const phase=Number.isFinite(o.ph)?o.ph:0;
   return ['walk',1+Math.floor(((phase/(2*Math.PI))%1+1)%1*6)%6];
  }
  if(sim.act&&o.bfMainActor){
   if(sim.at==='phone'&&window.BFArt?.holdingPhone?.(S))return ['phone',12];
   if(reduce())return ['idle',0];
   const u=Math.max(0,Math.min(1,(sim.prog||0)/Math.max(.1,sim.dur||1)));
   return ['reach',7+Math.min(3,Math.floor(u*4))];
  }
  // Subtle expressions respond to authored interactions, never diagnostic labels.
  if(S.card?.kind==='shared'||S.card?.kind==='entice')return ['attend',13];
  if(S.card?.kind==='practical'||S.card?.kind==='change')return ['reflect',14];
  return ['idle',0];
 }
 function drawActor(ctx,x,y,o){
  const asset=ensure(S?.flat?.id);
  // In the epilogue the player is the visitor, so the tenant's sprite must not stand in for them.
  if(S?.mode==='visit')return false;
  if(!enabled||!asset?.loaded||asset.failed||window.BFArt?.enabled===false||!o?.bfMainActor||!o.char||o.ghost||o.pose==='lie'||S.place==='street')return false;
  const dir=direction(o),[anim,col]=frame(o);
  lastState=anim;
  const scale=(o.scale||1)*.55,width=META.w*scale,height=META.h*scale;
  const left=x-META.w*.5*scale,top=y-META.pivotY*scale;
  ctx.save();
  if(o.alpha!=null)ctx.globalAlpha*=o.alpha;
  if(!o.noShadow){ctx.beginPath();ctx.ellipse(x,y,o.pose==='sit'?14.5:12,4.6,0,0,Math.PI*2);ctx.fillStyle='rgba(22,30,42,.17)';ctx.fill();}
  ctx.drawImage(asset.atlas,col*META.w,dir*META.h,META.w,META.h,left,top,width,height);
  ctx.restore();totalDraws++;return true;
 }
 function initMenu(){
  const menu=document.getElementById('viewMenu');if(!menu)return;
  const add=()=>{
   if(menu.querySelector('[data-bf-rig]'))return;
   const b=document.createElement('button');b.type='button';b.className='vrow bf-rig-toggle';b.dataset.bfRig='';
   b.setAttribute('aria-pressed',String(enabled));
   b.title='Use consistently modeled 3D-authored sprite animations for Noor, Tomas and Dele';
   b.innerHTML='<span>Modeled residents</span><i class="sw"></i>';
   b.addEventListener('click',()=>{enabled=!enabled;b.setAttribute('aria-pressed',String(enabled));try{localStorage.setItem('beingfound.model_rig',enabled?'on':'off');}catch(_){}});
   const art=menu.querySelector('[data-bf-art]');if(art)art.insertAdjacentElement('afterend',b);
   else menu.append(b);
  };
  add();new MutationObserver(add).observe(menu,{childList:true});
 }
 ensure(S?.flat?.id);
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initMenu,{once:true});else initMenu();
 window.BFRig={version:'8.1',drawActor,onStep,
  get loaded(){return !!ensure(S?.flat?.id)?.loaded},
  get failed(){return !!ensure(S?.flat?.id)?.failed},
  get enabled(){return enabled},set enabled(v){enabled=!!v},
  get totalDraws(){return totalDraws},get lastState(){return lastState},
  get character(){return PAIR[S?.flat?.id]||null},get assetStates(){return Object.fromEntries(Object.entries(assets).map(([k,v])=>[k,{loaded:v.loaded,failed:v.failed}]))}
 };
})();