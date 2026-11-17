/* Being Found 7.2 — movement quality layer.
 * Designed around the author's existing collision map, character renderer and
 * state machine; never changes actions, authored diagnoses or plot outcomes. */
(() => {
  'use strict';
  if (window.BFMotion) return;
  const S=window.LW?.S;
  if(!S) return;
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  const prefersReduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
  let walkElapsed=0, priorMoving=false, stride=0, priorAt=null;
  const length=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
  const pathLength=(a,route)=>{
    let total=0, prev=a;
    for(const p of route){ total+=length(prev,p);prev=p; }
    return total;
  };
  const shouldAnimate=()=>S.mode==='play' && (S.place==null||S.place==='home') && !S.quiet;
  /* The native grid's `losClear` tests center-line collision. Test both sides of
   * a corridor too, except very close to the start or destination so characters
   * do not clip table and sofa corners when a long route is simplified. */
  function generousClear(a,b,losClear){
    if(!losClear(a,b))return false;
    const d=length(a,b);if(d<.22)return true;
    const px=-(b[1]-a[1])/d*.095,py=(b[0]-a[0])/d*.095;
    const fraction=d>.65?.15:.28;
    const x=a[0]+(b[0]-a[0])*fraction,y=a[1]+(b[1]-a[1])*fraction;
    const X=b[0]-(b[0]-a[0])*fraction,Y=b[1]-(b[1]-a[1])*fraction;
    return losClear([x+px,y+py],[X+px,Y+py])&&losClear([x-px,y-py],[X-px,Y-py]);
  }
  function smoothPath(from,route,losClear){
    if(!Array.isArray(route)||route.length<2||typeof losClear!=='function'||!shouldAnimate())return route;
    const output=[];
    let origin=[from[0],from[1]],i=0;
    while(i<route.length&&output.length<route.length){
      let best=i;
      for(let j=route.length-1;j>i;j--){
        if(generousClear(origin,route[j],losClear)){best=j;break;}
      }
      const point=route[best];
      output.push(point);origin=point;i=best+1;
    }
    return output.length && output.length<=route.length?output:route;
  }
  function onPath(s,route){
    walkElapsed=0;priorMoving=false;priorAt=s.at;stride=0;
    if(Array.isArray(route))s.bfPathLength=pathLength([s.x,s.y],route);
    return route;
  }
  function beforeStep(s,dt){
    if(!shouldAnimate()){priorMoving=false;stride=0;return;}
    const moving=!!(s.path&&s.path.length);
    if(moving){
      if(!priorMoving)walkElapsed=0;
      walkElapsed+=dt;
    }else if(priorMoving){walkElapsed=0;}
    priorMoving=moving;
  }
  function travel(s,dt,speed){
    if(!shouldAnimate()||prefersReduced()||!s.path?.length){stride=1;return speed*dt;}
    const remaining=pathLength([s.x,s.y],s.path);
    /* Accelerate over ~0.3 s and ease into the object over ~0.45 units.
       Floors prevent asymptotic movement or a never-ending action. */
    const accel=clamp(.56+walkElapsed/.3*.44,.56,1);
    const brake=clamp(.48+remaining/.72*.52,.48,1);
    const factor=Math.min(accel,brake);
    stride=factor;
    return speed*factor*dt;
  }
  function actorGesture(s){
    if(!shouldAnimate()||prefersReduced()||!s.act||!Number.isFinite(s.dur)||s.dur<=0)return 0;
    if(s.pose==='lie'||s.pose==='sit'||s.pose==='floor')return 0;
    const u=clamp(s.prog/s.dur,0,1), envelope=Math.pow(Math.sin(Math.PI*u),.9);
    // One deliberate reach instead of repeated twitching for every action.
    return envelope*.75;
  }
  function actorOptions(o,s){
    if(!o || !s)return o;
    o.bfMainActor=true;
    o.bfGesture=actorGesture(s);
    o.bfStride=shouldAnimate()&&!prefersReduced()?clamp(stride,.48,1):1;
    return o;
  }
  function reset(){walkElapsed=0;priorMoving=false;stride=0;priorAt=null;}
  window.addEventListener('pagehide',reset);
  window.BFMotion={version:'7.2',smoothPath,onPath,beforeStep,travel,actorOptions,reset,
    get stride(){return stride;},get moving(){return priorMoving;},
    get enabled(){return shouldAnimate()&&!prefersReduced();}};
})();