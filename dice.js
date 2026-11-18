/* Being Found — story-linked action checks (7.0)
   Chance belongs to the player's chosen approach, not to a character's diagnosis.
   Existing authored narrative always remains reachable. */
(() => {
  'use strict';
  if (window.BFSkillChecks) return;

  const STORE = 'being-found.skill-checks.v3';
  const DIE_STEPS = [12]; // One fair d12; situated targets replace die-size penalties
  const SKILLS = {
    practical: {label:'Follow through', starting:12, color:'#4f806d'},
    entice:    {label:'Take initiative', starting:12, color:'#b67c36'},
    shared:    {label:'Reach out', starting:12, color:'#b66481'},
    change:    {label:'Adapt', starting:12, color:'#6787ad'}
  };
  const fresh = () => ({ enabled:true, dice:{practical:12,entice:12,shared:12,change:12},
    progress:{practical:0,entice:0,shared:0,change:0}, effort:0, focusScene:'', focusUsed:false,
    checked:[], logs:[], practiceByFlat:{}, currentFlat:'' });
  let saved;
  try { saved = JSON.parse(sessionStorage.getItem(STORE) || 'null');
    if (!saved) { const old = JSON.parse(sessionStorage.getItem('being-found.skill-checks.v2') || 'null');
      if(old) saved={...old,checked:[],practiceByFlat:{},currentFlat:''}; } } catch (_) {}
  const state = Object.assign(fresh(), saved || {});
  state.dice = fresh().dice; // A d12 everywhere; no legacy die upgrade leakage
  state.practiceByFlat=(state.practiceByFlat && typeof state.practiceByFlat==='object')?state.practiceByFlat:{};
  state.progress = Object.assign(fresh().progress, state.progress || {});
  state.checked = Array.isArray(state.checked) ? state.checked.slice(-90) : [];
  state.logs = Array.isArray(state.logs) ? state.logs.slice(-25) : [];
  const persist = () => { try {sessionStorage.setItem(STORE, JSON.stringify(state));} catch (_) {} };

  let pending = null;
  let mode = 'normal';
  let rolling = false;
  let previousFocus = null;
  let lastResult = null;
  let patternCheckId=null;
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = sel => document.querySelector(sel);
  const safe = value => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const die = sides => {
    if (globalThis.crypto?.getRandomValues) {
      const b = new Uint32Array(1); const lim = Math.floor(4294967296/sides)*sides;
      do { crypto.getRandomValues(b); } while (b[0] >= lim);
      return (b[0]%sides)+1;
    }
    return Math.floor(Math.random()*sides)+1;
  };

  function storyScene() {
    const s = window.LW?.S;
    const client = s?.flat?.id || s?.flat?.name || 'first-flat';
    const beat = s?.phase?.id || s?.phase?.name || 'room';
    return `${client}:${beat}`;
  }
  function currentAction(button) {
    const label = button.querySelector('.lab')?.textContent?.trim() || button.textContent.trim();
    const type = Object.keys(SKILLS).find(k => button.classList.contains('k-'+k)) || 'practical';
    const s = window.LW?.S;
    const flat = s?.flat?.name || $('.atpill')?.textContent?.trim() || 'the scene';
    const scene = storyScene();
    const item = button.dataset.i || '';
    const object = s?.menu || button.closest('#bubbles')?.querySelector('.bub-head')?.textContent?.trim() || 'object';
    const chosen = s?.menuItems?.[Number(item)];
    const selected = chosen?.a;
    const flatId=s?.flat?.id||'';
    if (state.currentFlat!==flatId){state.currentFlat=flatId;state.effort=0;persist();}
    const rank=state.practiceByFlat?.[flatId]?.[type] || 0;
    const data={button,type,label,scene,flat,obj:object,act:selected?.id||'',state:chosen?.st||'open',flatId,phaseIx:s?.phaseIx,
      key:`${scene}:${object}:${selected?.id||item}:${label}`};
    const plan=window.BFDifficulty?.plan(data,s,{load:state.effort,practice:rank})||{available:true,sides:12,target:5,parts:[],support:0,chance:67};
    return {...data,plan,target:plan.target};
  }
  function canCheck(button) {
    if ((window.BFFlags?.guided || document.body?.classList.contains('cl-route')) && window.BFFlags?.dice !== true) return false;
    if (!state.enabled || pending || rolling || !button?.matches?.('button.bub')) return false;
    if (button.classList.contains('s-sealed') || button.classList.contains('s-closed')) return false;
    if (!button.querySelector('.lab') && !button.dataset.i) return false;
    if (!Object.keys(SKILLS).some(k=>button.classList.contains('k-'+k))) return false;
    const s = window.LW?.S;
    if (s?.mode === 'sandbox' || s?.mode === 'visit') return false;
    const action=currentAction(button);
    return !!window.BFStory?.hasBranch(action) && !state.checked.includes(action.key);
  }

  const el = document.createElement('div');
  el.id = 'bf-check';
  el.hidden = true;
  el.innerHTML = `<div class="bf-shade" data-bf-dismiss></div>
    <section class="bf-dialog" role="dialog" aria-modal="true" aria-labelledby="bf-heading" aria-describedby="bf-description" tabindex="-1">
      <header class="bf-header"><span class="bf-kicker">AN ATTEMPT</span>
        <button class="bf-x" type="button" title="Use the original action without rolling" aria-label="Continue without rolling" data-bf-dismiss>×</button></header>
      <h2 id="bf-heading">Follow through</h2><p class="bf-act" id="bf-act"></p>
      <p class="bf-description" id="bf-description">This fictional attempt depends on the situation, not a diagnosis.</p>
      <div id="bf-context" class="bf-context" aria-label="What helps and what makes this moment harder"></div>
      <details class="bf83-mechanics"><summary>Show attempt numbers</summary><div class="bf-dice-row"><div class="bf-cube" aria-hidden="true"><div id="bf-face">8</div></div>
        <div class="bf-numbers"><strong id="bf-difficulty">d8 · target 5</strong><span id="bf-info">Roll 5 or higher.</span>
        <small id="bf-effort">Effort 0/4 · Focus ready</small></div></div></details>
      <div id="bf-choose"><div class="bf-modes" role="group" aria-label="Choose an approach">
          <button type="button" data-bf-mode="normal" aria-pressed="true">As you are</button>
          <button type="button" data-bf-mode="focus" aria-pressed="false">Steady first <small>d12 + d10</small></button>
          <button type="button" data-bf-mode="push" aria-pressed="false">Push through <small>+effort</small></button>
          <button type="button" data-bf-mode="steps" aria-pressed="false" hidden>Break it down <small>−2 target</small></button>
        </div><div class="bf-cta"><button id="bf-roll" type="button">Try</button>
          <button class="bf-subtle" id="bf-skip" type="button">Continue without rolling</button></div></div>
      <div id="bf-reveal" hidden><div class="bf-outcome" aria-live="polite">
          <strong id="bf-outcome-title"></strong><p id="bf-outcome-body"></p>
          <details class="bf83-result-details"><summary>Show how this resolved</summary><small id="bf-roll-details"></small></details></div>
        <div class="bf-cta"><button id="bf-continue" type="button">Continue the action</button>
          <button class="bf-subtle" id="bf-reconsider" type="button">Choose another action</button></div></div>
      <p class="bf-footer"><label><input type="checkbox" id="bf-enabled" checked> Show attempts</label><span>Authored moments · Unscored</span></p>
    </section>`;
  document.body.append(el);
  const dialog = el.querySelector('.bf-dialog');
  const face = el.querySelector('#bf-face');
  const choose = el.querySelector('#bf-choose');
  const reveal = el.querySelector('#bf-reveal');
  const modeButtons = [...el.querySelectorAll('[data-bf-mode]')];
  const setText = (selector,text) => { el.querySelector(selector).textContent=text; };
  const renderMode = () => {
    modeButtons.forEach(b => {
      b.setAttribute('aria-pressed', String(b.dataset.bfMode===mode));
      b.disabled = (b.dataset.bfMode==='focus' && state.focusUsed);
      if(b.dataset.bfMode==='steps')b.hidden=pending.target<7;
    });
    const n = state.dice[pending.type];
    const target=mode==='steps'?Math.max(3,pending.target-2):pending.target;
    setText('#bf-difficulty',`d${n} · target ${target}`);
    setText('#bf-roll','Try');
    setText('#bf-info', mode==='focus'?'Take the higher of two dice.':mode==='push'?'Take the higher roll. Gain 1 effort.':mode==='steps'?'Break it down. A smaller attempt takes extra time.':`Roll ${target} or higher.`);
    setText('#bf-effort', `Effort ${state.effort}/4 · ${state.focusUsed?'Focus used':'Focus ready'} · ${mode==='steps'?'smaller steps':'one attempt'}`);
  };

  function show(action) {
    if (state.focusScene !== action.scene) {
      state.focusScene = action.scene; state.focusUsed = false; persist();
    }
    pending = action;
    lastResult = null; patternCheckId=null; rolling = false; mode = 'normal';
    previousFocus = document.activeElement;
    el.hidden = false; document.body.classList.add('bf-check-open');
    choose.hidden = false; reveal.hidden = true;
    const cfg = SKILLS[action.type];
    setText('#bf-heading',cfg.label);
    setText('#bf-act', action.label);
    setText('#bf-description',action.plan.description||'The situation affects the difficulty of this fictional action.');
    const ctx=el.querySelector('#bf-context');
    ctx.innerHTML=action.plan.parts.map(part=>`<span class="bf-factor ${part.value<0?'good':''}">${safe(part.name)} <b>${part.value>0?'+':''}${part.value}</b></span>`).join('');
    if(action.plan.support)ctx.setAttribute('title','Temporary support from an earlier action; used by this roll. The scene itself is unchanged.');
    let hint=el.querySelector('#bf-foothold-hint');if(!hint){hint=document.createElement('p');hint.id='bf-foothold-hint';hint.className='bf-foothold-hint';ctx.after(hint);}
    hint.hidden=!action.plan.support;hint.textContent=action.plan.support?`Earlier: ${action.plan.source.join(', ')}. Temporary help for this check, not a change in mood.`:'';
    setText('#bf-difficulty', `d12 · target ${action.target}`);
    face.textContent = state.dice[action.type];
    face.style.setProperty('--bf-face-accent',cfg.color);
    el.querySelector('#bf-enabled').checked=state.enabled;
    renderMode();
    el.querySelector('#bf-roll').focus({preventScroll:true});
  }
  function hide() {
    rolling=false; el.hidden = true; document.body.classList.remove('bf-check-open');
    pending=null; lastResult=null;
    if (previousFocus?.isConnected) previousFocus.focus({preventScroll:true});
  }
  function originalAction(shouldContinue, useRoll=false) {
    const action = pending;
    if (patternCheckId != null) {window.BFPatterns?.markCheck?.(patternCheckId,!!shouldContinue);patternCheckId=null;}
    if (shouldContinue && useRoll && lastResult && action) window.BFStory?.commit(action,lastResult);
    hide();
    if (!action || !shouldContinue) return;
    const btn = action.button?.isConnected ? action.button : [...document.querySelectorAll('button.bub')].find(b =>
      b.dataset.i===action.button?.dataset.i && b.querySelector('.lab')?.textContent?.trim()===action.label);
    if (!btn) return;
    /* One-shot bypass keeps the game's own choose() and classroom event listeners untouched. */
    btn.dataset.bfBypass='1';
    btn.click();
    if (btn.isConnected) delete btn.dataset.bfBypass;
  }
  function remember(result) {
    if (!pending) return;
    const action = pending;
    if (!state.checked.includes(action.key)) state.checked.push(action.key);
    state.checked=state.checked.slice(-90);
    if (result) {
      state.logs.unshift({skill:action.type,flat:action.flatId,action:action.label,die:result.base,
        rolls:result.rolls,threshold:result.target,startingTarget:action.target,context:result.context,support:result.support,outcome:result.category});
      state.logs=state.logs.slice(0,25);
      // Practice develops planning familiarity, not immunity to a condition.
      const flat=action.flatId;
      state.practiceByFlat[flat] ||= {};
      const key=`${flat}:${action.type}`;
      const p=(state.progress[key]=(state.progress[key]||0)+1);
      if(p>=4 && (state.practiceByFlat[flat][action.type]||0)<2){
        state.practiceByFlat[flat][action.type]=(state.practiceByFlat[flat][action.type]||0)+1;
        state.progress[key]=0;
        result.upgrade='A familiar approach adds +1 on future checks in this flat';
      }

    }
    persist();
  }
  const narrative = {
    clear: ['A clear opening','This attempt has room to develop. The next part still depends on the scene and the people in it.'],
    success:['An opening','You find a way to try. The story will show how the moment unfolds.'],
    partial:['A partial opening','The attempt is possible, but it may require time or a different form of support.'],
    complication:['A complication','This attempt feels harder than expected. You can continue, or choose another approach. This is not a verdict on anyone’s ability.']
  };
  const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
  async function roll() {
    if(!pending || rolling) return;
    rolling=true;
    const action = pending, base=12, selected=mode;
    const target=selected==='steps'?Math.max(3,action.target-2):action.target;
    el.querySelector('#bf-roll').disabled=true;
    const rolls = [die(base)];
    if(selected==='focus'){rolls.push(die(10));state.focusUsed=true;}
    if(selected==='push'){rolls.push(die(base));state.effort=Math.min(4,state.effort+1);}
    const best=Math.max(...rolls);
    let category = best>=target?(best>=target+3?'clear':'success'):
      ((best>=target-2?'partial':'complication'));
    if(category==='complication')state.effort=Math.min(4,state.effort+1);
    if(category==='clear')state.effort=Math.max(0,state.effort-1);
    const total = reduced()?70:550;
    face.classList.add('bf-tumbling');
    const start=performance.now();
    while(performance.now()-start<total && el.isConnected && pending===action) {
      face.textContent=1+Math.floor(Math.random()*base);
      await delay(reduced()?70:65);
    }
    face.classList.remove('bf-tumbling');
    if(pending!==action)return;
    face.textContent=best;
    face.classList.add('bf-land');setTimeout(()=>face.classList.remove('bf-land'),380);
    const outcome={base,rolls,best,category,target,steps:selected==='steps',support:action.plan.support,context:action.plan.parts};
    remember(outcome);
    patternCheckId=window.BFPatterns?.recordCheck?.(action,outcome,selected)??null;
    window.BFDifficulty?.consume(window.LW?.S);
    lastResult=outcome;
    choose.hidden=true;reveal.hidden=false;
    const [title,description] = narrative[category];
    setText('#bf-outcome-title',title);
    setText('#bf-outcome-body',description+(outcome.upgrade?` Your ${SKILLS[action.type].label.toLowerCase()} die advanced: ${outcome.upgrade}.`:''));
    setText('#bf-roll-details', `${rolls.map((r,i)=>`${i?' + ':''}${i===1&&selected==='focus'?'d10':`d${base}`}: ${r}`).join('')} · best ${best} / ${target} · effort ${state.effort}/4`);
    el.querySelector('#bf-continue').focus({preventScroll:true});
    rolling=false;
    el.querySelector('#bf-roll').disabled=false;
  }
  document.addEventListener('pointerdown', event=>{
    const btn=event.target?.closest?.('button.bub.s-heavy');
    if(!btn || !canCheck(btn))return;
    // Prevent the original 1300ms hold from bypassing the authored check.
    event.stopImmediatePropagation();event.preventDefault();
    show(currentAction(btn));
  },true);
  document.addEventListener('click', event => {
    const btn = event.target?.closest?.('button.bub');
    if (!btn) return;
    if(btn.dataset.bfBypass==='1')return;
    if(pending){event.preventDefault();event.stopImmediatePropagation();return;}
    if (!canCheck(btn)) return;
    event.preventDefault();event.stopImmediatePropagation();
    show(currentAction(btn));
  }, true);
  modeButtons.forEach(b=>b.addEventListener('click',()=>{if(!rolling&&pending){mode=b.dataset.bfMode;renderMode();}}));
  el.querySelector('#bf-roll').addEventListener('click',roll);
  el.querySelector('#bf-skip').addEventListener('click',()=>{if(!rolling){remember(null);originalAction(true);}});
  el.querySelector('#bf-continue').addEventListener('click',()=>originalAction(true,true));
  el.querySelector('#bf-reconsider').addEventListener('click',()=>originalAction(false));
  el.querySelectorAll('[data-bf-dismiss]').forEach(b=>b.addEventListener('click',()=>{
    if(!rolling){remember(null);originalAction(true);}
  }));
  el.querySelector('#bf-enabled').addEventListener('change',e=>{state.enabled=e.target.checked;persist();});
  document.addEventListener('keydown',e=>{
    if(el.hidden)return;
    if(e.key==='Escape'&&!rolling){e.preventDefault();e.stopImmediatePropagation();remember(null);originalAction(true);}
    if(e.key==='Tab'){
      const tabbable=[...el.querySelectorAll('button:not(:disabled),input:not(:disabled)')].filter(n=>n.offsetParent!==null);
      if(!tabbable.length)return;
      const i=tabbable.indexOf(document.activeElement);
      if(e.shiftKey&&i<=0){e.preventDefault();tabbable.at(-1).focus();}
      else if(!e.shiftKey&&i===tabbable.length-1){e.preventDefault();tabbable[0].focus();}
    }
  },true);

  /* Add a compact opt-in switch to the existing View menu without changing the room canvas. */
  const insertMenuSwitch = () => {
    const menu=$('#viewMenu');
    if(!menu || menu.querySelector('#bf-menu-toggle'))return;
    const b=document.createElement('button');b.id='bf-menu-toggle';b.type='button';
    b.textContent='Story attempts: '+(state.enabled?'On':'Off');
    b.setAttribute('aria-pressed',String(state.enabled));
    b.addEventListener('click',e=>{
      e.preventDefault();e.stopPropagation();
      state.enabled=!state.enabled;persist();b.textContent='Story attempts: '+(state.enabled?'On':'Off');
      b.setAttribute('aria-pressed',String(state.enabled));
    });
    menu.append(b);
  };
  insertMenuSwitch();
  const observer=new MutationObserver(()=>insertMenuSwitch());
  const menu=$('#viewMenu'); if(menu)observer.observe(menu,{childList:true});
  window.BFSkillChecks={version:'7.6',resetSession(){Object.assign(state,fresh());window.BFDifficulty?.reset?.();window.BFPatterns?.reset?.();persist();const m=$('#bf-menu-toggle');if(m)m.textContent='Story attempts: On';},get state(){return JSON.parse(JSON.stringify(state));},setEnabled(v){state.enabled=!!v;persist();insertMenuSwitch();}};
})();