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
 // Motion follows the device setting unless the player explicitly opts in
 // to walking motion using the View menu.
 let forceWalking=false;
 try{forceWalking=localStorage.getItem('beingfound.walk_motion')==='on';}catch(_){}
 const systemReduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
 const reduce=()=>systemReduced()&&!forceWalking;
 const WALK_CYCLE=92;
 const walkFrame=()=>1+(Math.floor(walkDistance/WALK_CYCLE*6)%6);
 const assets={};
 let enabled=true,lastFlat=null,lastPhase=null,lastX=null,lastY=null,movementDir=2,walkDistance=0,wasMoving=false,totalDraws=0,lastState='idle',lastFrameIndex=0,lastDirection=0;
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
 // The side-scroller supplies screen-space foot coordinates. Track actual distance
 // traveled instead of advancing the walk cycle at one fixed speed for every resident.
 // This keeps a planted foot from sliding while navigation accelerates or slows.
 function onStep(s,foot){
  if(!s||!S)return;
  const flat=S.flat?.id,phase=S.phaseKey;
  ensure(flat);
  if(flat!==lastFlat||phase!==lastPhase){
   lastFlat=flat;lastPhase=phase;lastX=null;lastY=null;
   movementDir=2;walkDistance=0;wasMoving=false;
  }
  const moving=!!s.path?.length&&s.pose==='stand'&&S.mode==='play'&&S.place!=='street';
  const point=Array.isArray(foot)?foot:null;
  const x=point?.[0],y=point?.[1];
  if(moving&&!wasMoving){
   walkDistance=0;
   // At the beginning of the route no position delta exists yet.
   movementDir=s.bfSideVX?(s.bfSideVX>0?2:6):(s.flip===-1?6:2);
  }
  if(Number.isFinite(x)&&Number.isFinite(y)&&lastX!=null&&lastY!=null&&moving&&!reduce()){
   const dx=x-lastX,dy=y-lastY,delta=Math.hypot(dx,dy);
   if(delta>.02&&delta<60){
    walkDistance+=delta;
    if(Math.abs(dx)>.07)movementDir=dx>0?2:6;
   }
  }
  if(Number.isFinite(x)&&Number.isFinite(y)){lastX=x;lastY=y;}
  wasMoving=moving;
 }
 function direction(o){
  // Directions 2 and 6 face screen-right and screen-left, respectively.
  // Never show a front-facing walk for an actor traveling horizontally.
  if(o.moving&&S.sim.bfWalking&&S.sim.bfSideVX)return S.sim.bfSideVX>0?2:6;
  if(o.moving&&S.sim.path?.length)return movementDir;
  if(o.face==='back')return o.flip===-1?5:3;
  if(o.face==='front')return o.flip===-1?7:1;
  return movementDir;
 }
 function frame(o){
  // An arrival can set pose='sit' while its action clock is still in its
  // early 'reach' phase. The seated foot anchor must NEVER draw a standing
  // sprite or the character appears embedded in the sofa.
  if(o.pose==='sit'||o.pose==='floor')return ['sit',11];
  const synced=window.BFStageSync?.frame?.(S,o);if(synced)return synced;
  const sim=S.sim;
  if(o.moving&&sim.path?.length&&!reduce()){
   // A full authored 6-frame cycle advances per 92 scene px. The previous
   // 112 px cycle was difficult to perceive at ordinary room scales.
   return ['walk',walkFrame()];
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
  lastState=anim;lastFrameIndex=col;lastDirection=dir;
  const scale=(o.scale||1)*.55,width=META.w*scale,height=META.h*scale;
  const left=x-META.w*.5*scale,top=y-META.pivotY*scale;
  ctx.save();
  if(o.alpha!=null)ctx.globalAlpha*=o.alpha;
  if(!o.noShadow&&o.pose!=='sit'){ctx.beginPath();ctx.ellipse(x,y,12,4.6,0,0,Math.PI*2);ctx.fillStyle='rgba(22,30,42,.17)';ctx.fill();}
  // The atlas contains six gait poses; provide a visible, small vertical
  // weight shift at each step so the model does not appear to glide.
  // The contact shadow stays fixed at the floor while the feet lift.
  if(anim==='walk'&&!reduce()){
   const phase=walkDistance/WALK_CYCLE*2*Math.PI;
   ctx.translate(x,y);
   ctx.rotate(Math.sin(phase)*.018);
   ctx.translate(-x,-y-1.9*Math.abs(Math.sin(phase)));
  }
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
   if(!menu.querySelector('[data-bf-walk-motion]')){
    const motion=document.createElement('button');
    motion.type='button';motion.className='vrow';motion.dataset.bfWalkMotion='';
    motion.title='Follow the device reduced-motion setting, or explicitly allow the character walking cycle';
    const update=()=>{
     motion.textContent=forceWalking?'Walking animation: On':'Walking animation: Device setting';
     motion.setAttribute('aria-pressed',String(forceWalking));
    };
    motion.addEventListener('click',()=>{
     forceWalking=!forceWalking;
     try{localStorage.setItem('beingfound.walk_motion',forceWalking?'on':'auto');}catch(_){}
     update();
    });
    update();b.insertAdjacentElement('afterend',motion);
   }
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
  get facing(){return movementDir},get walkFrame(){return walkFrame()},get walkDistance(){return walkDistance},
  get lastFrameIndex(){return lastFrameIndex},get lastDirection(){return lastDirection},
  get reducedMotion(){return reduce()},get systemReducedMotion(){return systemReduced()},
  get forceWalking(){return forceWalking},
  get character(){return PAIR[S?.flat?.id]||null},get assetStates(){return Object.fromEntries(Object.entries(assets).map(([k,v])=>[k,{loaded:v.loaded,failed:v.failed}]))}
 };
})();