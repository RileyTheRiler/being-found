/* Being Found 8.0 — native side-scroller route system for Noor's flat.
 * The story engine retains its own action state; only the physical travel,
 * room-floor anchor, and arrival coordinates are replaced. Other residents,
 * encounters, and the street preserve their existing movement path.
 */
(() => {
  'use strict';
  if (window.BFNavigation) return;
  const FLOOR=574, LEFT=145, RIGHT=1510;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const anchors=Object.freeze({
    mirror: {x:255, y:FLOOR,face:'back', label:'Mirror'},
    sofa:   {x:464, y:FLOOR,seatX:455,seatY:561,face:'front',label:'Sofa'},
    window: {x:548, y:FLOOR,face:'back',label:'Window'},
    phone:  {x:690, y:FLOOR,face:'front',label:'Phone'},
    bed:    {x:854, y:FLOOR,lieX:836,lieY:485,face:'back',label:'Bed'},
    easel:  {x:984, y:FLOOR,face:'back',label:'Easel'},
    stove:  {x:1200,y:FLOOR,face:'back',label:'Kitchenette'}, // 8.3.8: beside the pan, so the hob and pan no longer read as outstretched arms
    door:   {x:1475,y:FLOOR,face:'back',label:'Front door'}
  });
  // The visible walk lane is in FRONT of all cabinets, sofa, and easel feet.
  // Furniture silhouettes stop above this band; blocking geometry does not
  // use the unrelated isometric 32x32 tile map.
  const floorCorridor={left:LEFT,right:RIGHT,top:560,bottom:625};
  const nodes=[180,275,425,545,670,825,945,1090,1230,1395,1490].map(x=>({x,y:FLOOR}));
  const state={active:false,x:548,y:FLOOR,phase:'',flat:'',route:[],goal:null,startedAt:0,
    distance:0,completed:0,fromX:548,source:[0,0],destination:[0,0],callback:null,
    targetId:null,lastArrival:null,orientation:1};
  const valid=S=>!!S&&S.mode==='play'&&S.flat?.id==='rooted'&&(!S.place||S.place==='home');
  const atHome=()=>valid(window.LW?.S);
  const findTarget=(point,objects)=>Object.keys(anchors).find(id=>{
    const v=objects?.[id]?.stand;
    return v&&Math.hypot(v[0]-point[0],v[1]-point[1])<.08;
  });
  function reset(S){
    const s=S?.sim;if(!s)return;
    state.active=false;state.route=[];state.goal=null;state.callback=null;state.phase=S.phaseKey||'';
    state.flat=S.flat?.id||'';state.targetId=null;state.distance=0;state.completed=0;
    const a=anchors[s.at];state.x=a?.x??548;state.y=a?.y??FLOOR;
    state.fromX=state.x;state.orientation=1;
    s.bfSideX=state.x;s.bfSideY=state.y;s.bfSideVX=0;
  }
  function cancel(S){
    state.active=false;state.route=[];state.goal=null;state.callback=null;state.targetId=null;
    if(S?.sim){S.sim.bfSideVX=0;delete S.sim.bfWalking;}
  }
  function ensure(S){
    if(!valid(S))return false;
    if(state.flat!==S.flat.id||state.phase!==(S.phaseKey||'') || !Number.isFinite(S.sim.bfSideX))reset(S);
    return true;
  }
  // The floor graph is a single connected corridor, with fixed furniture
  // approach nodes. We can simplify a route within that corridor to a direct
  // walk, since its swept body stays below the artwork's collision outlines.
  function plan(from,target){
    const x0=clamp(from,LEFT,RIGHT),x1=clamp(target,LEFT,RIGHT);
    if(Math.abs(x0-x1)<.4)return [];
    const direction=Math.sign(x1-x0);
    const intermediate=nodes.filter(p=>direction>0?p.x>x0&&p.x<x1:p.x<x0&&p.x>x1).sort((a,b)=>direction*(a.x-b.x));
    // Retain semantic doorway/room thresholds as turning/camera milestones;
    // never route through furnishings (their painted extent ends at floor).
    const thresholds=[570,1015].filter(x=>direction>0?x>x0&&x<x1:x<x0&&x>x1).sort((a,b)=>direction*(a-b));
    const list=intermediate.filter(p=>thresholds.some(t=>Math.abs(p.x-t)<90));
    const result=[...list.map(p=>({x:p.x,y:FLOOR})),{x:x1,y:FLOOR}];
    return result.filter((p,i,a)=>i===0||p.x!==a[i-1].x);
  }
  function goTo(S,pt,cb,objects){
    if(!ensure(S))return false;
    const s=S.sim;
    const id=findTarget(pt,objects);
    if(!id)return false; // original game still handles non-furniture destinations
    const a=anchors[id];
    if(s.pose!=='stand'){
      const old=objects[s.at];s.pose='stand';
      if(old){s.x=old.stand[0];s.y=old.stand[1];}
    }
    // A seated occupant leaves from the sofa's floor contact point.
    state.x=clamp(Number.isFinite(s.bfSideX)?s.bfSideX:state.x,LEFT,RIGHT);
    const route=plan(state.x,a.x);
    s.bfSideX=state.x;s.bfSideY=FLOOR;
    if(!route.length){
      s.path=[];s.x=pt[0];s.y=pt[1];s.onArrive=null;
      s.face=a.face;s.flip=a.face==='front'?1:-1;s.bfSideVX=0;
      state.lastArrival=id;state.targetId=null;
      window.BFStageSync?.arrive?.(id,S);cb();return true;
    }
    state.active=true;state.route=route;state.goal={x:a.x,y:a.y};
    state.targetId=id;state.fromX=state.x;state.startedAt=performance.now();
    state.source=[s.x,s.y];state.destination=[pt[0],pt[1]];
    state.distance=Math.abs(a.x-state.x);state.completed=0;state.callback=cb;
    state.orientation=Math.sign(a.x-state.x);
    // Native controls use s.path to suppress other actions while walking.
    // It is deliberately a sentinel, not the old isometric A* route.
    s.path=[[pt[0],pt[1]]];s.onArrive=null;s.at=null;
    s.bfWalking=true;s.bfSideVX=state.orientation;
    s.face='front';s.flip=state.orientation>0?1:-1;
    window.BFMotion?.onPath?.(s,s.path);
    return true;
  }
  function step(S,dt){
    if(!valid(S)||!state.active)return false;
    const s=S.sim;
    if(state.flat!==S.flat.id||state.phase!==(S.phaseKey||'')){cancel(S);return false;}
    const direction=state.orientation;
    const remaining=Math.abs(state.goal.x-state.x);
    const a=((window.BFFlags?.guided || document.body?.classList.contains('cl-route')) && window.BFFlags?.moodSpeed !== true)?'rooted':S.vars?.attune;
    const speed={rooted:182,access:174,upheaval:155,depleted:84,detached:135,uncanny:164,overloaded:120}[a]||154;
    const elapsed=(performance.now()-state.startedAt)/1000;
    const slow=matchMedia('(prefers-reduced-motion:reduce)').matches;
    const accelerate=slow?1:clamp(.38+elapsed/.32*.62,.38,1);
    const decelerate=slow?1:clamp(.28+remaining/90*.72,.28,1);
    const advance=Math.max(.05,speed*Math.min(accelerate,decelerate)*Math.min(dt,.05));
    let left=advance;
    while(left>0 && state.route.length){
      const wp=state.route[0];
      const delta=wp.x-state.x,dist=Math.abs(delta);
      if(dist<=left+.001){state.x=wp.x;state.y=wp.y;left-=dist;state.route.shift();}
      else {state.x+=Math.sign(delta)*left;state.y=wp.y;left=0;}
    }
    state.x=clamp(state.x,LEFT,RIGHT);state.y=FLOOR;
    state.completed=state.distance-Math.abs(state.goal.x-state.x);
    const progress=clamp(state.completed/Math.max(1,state.distance),0,1);
    s.x=state.source[0]+(state.destination[0]-state.source[0])*progress;
    s.y=state.source[1]+(state.destination[1]-state.source[1])*progress;
    s.bfSideX=state.x;s.bfSideY=state.y;s.bfSideVX=direction;
    s.face='front';s.flip=direction>0?1:-1;
    if(!slow)s.ph+=dt*10.5;
    if(!state.route.length&&Math.abs(state.goal.x-state.x)<=.7){
      const cb=state.callback,id=state.targetId;
      s.x=state.destination[0];s.y=state.destination[1];
      s.bfSideX=state.goal.x;s.bfSideY=FLOOR;s.bfSideVX=0;
      s.path=[];s.onArrive=null;delete s.bfWalking;
      state.active=false;state.route=[];state.callback=null;state.lastArrival=id;
      state.targetId=null;state.completed=state.distance;
      window.BFStageSync?.arrive?.(id,S);if(cb)cb();
    }
    return true;
  }
  function position(S){
    if(!ensure(S))return null;
    const s=S.sim,a=anchors[s.at];
    if(!state.active && a){
      state.x=a.x;s.bfSideX=a.x;
      // Physically sit on the sofa cushion; lie in the bed at the correct
      // visual contact point without rewriting the original narrative pose.
      if(s.pose==='sit'&&a.seatX)return [a.seatX,a.seatY];
      if(s.pose==='lie'&&a.lieX)return [a.lieX,a.lieY];
    }
    return [Number.isFinite(s.bfSideX)?s.bfSideX:state.x,FLOOR];
  }
  function section(S){const p=position(S);if(!p)return null;return p[0]<635?'living':p[0]<1020?'sleeping':'kitchen';}
  function debugDraw(ctx){
    if(!location.search.includes('bfnav=debug'))return;
    ctx.save();ctx.lineWidth=2;ctx.strokeStyle='rgba(0,112,108,.88)';
    ctx.strokeRect(floorCorridor.left,floorCorridor.top,floorCorridor.right-floorCorridor.left,floorCorridor.bottom-floorCorridor.top);
    for(const [id,a] of Object.entries(anchors)){
      ctx.beginPath();ctx.arc(a.x,a.y,6,0,Math.PI*2);ctx.fillStyle='#d84f2b';ctx.fill();
      ctx.font='14px sans-serif';ctx.fillStyle='#132f2a';ctx.fillText(id,a.x-15,a.y+27);
    }
    ctx.beginPath();ctx.moveTo(state.x,FLOOR);for(const p of state.route)ctx.lineTo(p.x,p.y);ctx.stroke();ctx.restore();
  }
  window.BFNavigation={version:'8.0',anchors,floorCorridor,nodes,plan,reset,cancel,goTo,step,position,section,debugDraw,
    get enabled(){return atHome();},get active(){return state.active},get x(){return state.x},
    get target(){return state.targetId},get lastArrival(){return state.lastArrival}};
})();