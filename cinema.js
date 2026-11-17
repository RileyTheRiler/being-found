/* Being Found 7.1 — subtle scene direction and environmental feedback.
   The original engine retains authority over movement, goals, action results and camera.
   This layer never mutates conditions, scores, narrative events or character state. */
(() => {
  'use strict';
  if (window.BFCinema) return;
  const $=s=>document.querySelector(s);
  const S=window.LW?.S;
  const stage=$('#stage'), scene=$('#scene'), result=$('#result');
  if(!S || !stage || !scene || !result) return;
  const motion=()=>!matchMedia('(prefers-reduced-motion: reduce)').matches;
  const optedIn=()=>{
    const b=$('#viewMenu [data-vset="atmosphere"]');
    return !b || b.getAttribute('aria-pressed')!=='false';
  };
  const cameraAllowed=()=>{
    const b=$('#viewMenu [data-vset="direct"]');
    return motion() && (!b || b.getAttribute('aria-pressed')!=='false');
  };
  const playAllowed=()=>S.mode==='play' && !S.quiet && S.place!=='street' &&
    !document.querySelector('.modal.on') && !$('#enc:not([hidden])') && !$('#dele:not([hidden])');
  let seq=0, raf=0, active=null, last=null, effect=null;
  const layer=document.createElement('div');layer.id='bf-cinema-layer';layer.setAttribute('aria-hidden','true');
  stage.append(layer);
  const shade=document.createElement('div');shade.id='bf-cinema-shade';shade.setAttribute('aria-hidden','true');
  scene.append(shade);
  const markers=['stove','phone','door','window','easel','sofa','bed','mirror'];
  const point=id=>{
    const node=stage.querySelector(`.pin[data-obj="${id}"]`);
    if(!node) return null;
    const x=parseFloat(node.style.left),y=parseFloat(node.style.top);
    return Number.isFinite(x) && Number.isFinite(y) ? {x,y,node} : null;
  };
  const clearFocus=()=>{
    scene.classList.remove('bf-cinema-focused');
    scene.style.removeProperty('--bf-spot-x');scene.style.removeProperty('--bf-spot-y');
    stage.querySelectorAll('.bf-cinema-intent').forEach(n=>n.classList.remove('bf-cinema-intent'));
  };
  const cleanEffect=()=>{if(effect){effect.remove();effect=null;}if(!active)cancelAnimationFrame(raf);};
  const reset=()=>{seq++;active=null;clearFocus();cleanEffect();result.classList.remove('bf-result-arrive');};
  function paint(){
    raf=0;
    if(!active && !effect)return;
    if(!playAllowed()){reset();return;}
    const a=active;
    if(a){
      const p=point(a.obj);
      if(p){
        const pr=p.node.getBoundingClientRect(),sr=scene.getBoundingClientRect();
        const x=pr.left+pr.width*.5-sr.left,y=pr.top+pr.height*.5-sr.top;
        scene.style.setProperty('--bf-spot-x',`${x}px`);
        scene.style.setProperty('--bf-spot-y',`${y}px`);
      }
      if(performance.now()>=a.until){active=null;clearFocus();}
    }
    if(effect){
      const p=point(effect.dataset.obj);
      if(p){effect.style.left=p.x+'px';effect.style.top=p.y+'px';}
      if(performance.now() >= Number(effect.dataset.until||0))cleanEffect();
    }
    if(active || effect)raf=requestAnimationFrame(paint);
  }
  function keepPainting(){if(!raf)raf=requestAnimationFrame(paint);}
  function approach(m){
    if(!m || !markers.includes(m.obj) || !playAllowed())return;
    seq++;const token=seq;
    clearFocus();
    const p=point(m.obj);
    if(!p)return;
    last={obj:m.obj,act:m.a?.id||'',kind:m.a?.kind||'',token};
    // No decorative cues for actions that do not feel possible in this authored state.
    if(m.st==='sealed' || !optedIn())return;
    if(motion()){
      p.node.classList.add('bf-cinema-intent');
      scene.classList.add('bf-cinema-focused');
      active={obj:m.obj,until:performance.now()+3400};
      keepPainting();
    }
  }
  const shapes={
    stove:()=>'<i class="bf-heat"></i><i class="bf-wisp w1"></i><i class="bf-wisp w2"></i><i class="bf-wisp w3"></i>',
    phone:()=>'<i class="bf-glow"></i><i class="bf-ring r1"></i><i class="bf-ring r2"></i>',
    door:()=>'<i class="bf-door-light"></i><i class="bf-beam"></i>',
    window:()=>'<i class="bf-window-light"></i><i class="bf-mote m1"></i><i class="bf-mote m2"></i><i class="bf-mote m3"></i>',
    easel:()=>'<i class="bf-paint p1"></i><i class="bf-paint p2"></i><i class="bf-paint p3"></i>',
    sofa:()=>'<i class="bf-soft-shadow"></i><i class="bf-pulse"></i>',
    bed:()=>'<i class="bf-soft-shadow"></i><i class="bf-pulse"></i>',
    mirror:()=>'<i class="bf-mirror-sheen"></i>'
  };
  function resultCategory(m){
    const h=window.BFStory?.moments?.history?.[0];
    if(!h || h.flat!==S.flat?.name || !h.categoryCode)return '';
    const name={fry:'Breakfast',cook:'Cooking something good',call:S.flat.id==='rooted'?'Jo calls':'Talking with Bea',out:'Stepping outside'}[m.a?.id];
    return h.name===name && h.categoryCode ? h.categoryCode : '';
  }
  function resolve(m,sealed){
    if(!m || !markers.includes(m.obj) || !playAllowed()){reset();return;}
    const token=++seq;
    // finishAction calls this at entry. Wait for its authored outcome and the
    // original renderAll() before refreshing any environmental decoration.
    queueMicrotask(()=>{
      if(token!==seq || !playAllowed())return;
      active=null;clearFocus();cleanEffect();
      if(sealed || !optedIn())return;
      const p=point(m.obj);
      if(!p || !shapes[m.obj])return;
      const el=document.createElement('div');el.className=`bf-scene-effect bf-eff-${m.obj}`;
      el.dataset.obj=m.obj;
      el.dataset.until=String(performance.now()+(motion()?2850:1000));
      el.dataset.tone=resultCategory(m)||'ordinary';
      el.setAttribute('aria-hidden','true');el.innerHTML=shapes[m.obj]();
      el.style.left=p.x+'px';el.style.top=p.y+'px';
      layer.append(el);effect=el;
      result.classList.remove('bf-result-arrive');
      if(motion()){void result.offsetWidth;result.classList.add('bf-result-arrive');}
      keepPainting();
      setTimeout(()=>{if(token===seq)result.classList.remove('bf-result-arrive');},480);
    });
  }
  document.addEventListener('visibilitychange',()=>{if(document.hidden)reset();});
  window.addEventListener('pagehide',reset);
  const watched=$('#app');
  if(watched)new MutationObserver(()=>{if(!playAllowed())reset();}).observe(watched,{attributes:true,attributeFilter:['class']});
  window.BFCinema={version:'7.1',approach,resolve,reset,
    get enabled(){return playAllowed()&&optedIn();},
    get cameraAllowed(){return playAllowed()&&cameraAllowed();},
    get currentEffect(){return effect?.dataset.obj||null;},
    get currentTarget(){return active?.obj||null;}};
})();