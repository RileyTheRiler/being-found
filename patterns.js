/* Being Found 7.6 — a descriptive record of fictional actions across scenes.
 * No mood score, clinical progress chart, or automatic recovery mechanic.
 * Stored for this browser session; unrelated to the game's saved narrative.
 */
(() => {
  'use strict';
  if(window.BFPatterns)return;
  const KEY='being-found.action-patterns.v1';
  const MAX=100;
  const names={rooted:'Noor',grief:'Tomas',depression:'Dele'};
  const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const clean=()=>({events:[],next:1});
  let data=clean();
  try{const saved=JSON.parse(sessionStorage.getItem(KEY)||'null');if(saved&&Array.isArray(saved.events)){
    data.events=saved.events.slice(-MAX).filter(x=>x&&typeof x==='object');
    data.next=Number.isFinite(saved.next)?saved.next:1;
  }}catch(_){}
  const save=()=>{try{sessionStorage.setItem(KEY,JSON.stringify(data));}catch(_){}};
  const scene=s=>String(s?.flat?.id||'unknown')+':'+String(s?.phaseIx??0);
  const clock=s=>{
    const c=Number(s?.clock);
    if(!Number.isFinite(c))return '';
    const day=s?.phase?.day || '';
    return `${day?day+' ':''}${Math.floor(c/60)%24}:${String(Math.floor(c%60)).padStart(2,'0')}`;
  };
  function write(kind,info={},s){
    if(!s || s.mode!=='play')return null;
    const flatId=String(s.flat?.id||'unknown');
    const ev={id:data.next++,kind,flatId,resident:String(s.flat?.name||names[flatId]||'Resident'),
      scene:scene(s),clock:clock(s),label:String(info.label||''),detail:String(info.detail||''),
      ...info};
    data.events.push(ev);if(data.events.length>MAX)data.events=data.events.slice(-MAX);
    save();notify();return ev.id;
  }
  function recordAction(m,sealed,s){
    if(!m?.a || s?.mode!=='play')return;
    const state=sealed||m.st==='sealed'?'not available':m.st==='heavy'?'effortful':m.st==='dim'?'faintly inviting':m.st==='hollow'?'distant':'available';
    const label=(m.a.lab||m.a.id||'Action').replace(/\{P\}/g,s.flat?.P||'partner').replace(/\{F\}/g,s.flat?.F||'friend');
    const detail=sealed||m.st==='sealed'?'Not offered as an available possibility in this scene.':
      `${m.a.kind||'Activity'} · ${state}.`;
    write('action',{label,detail,availability:m.st,object:m.obj,action:m.a.id},s);
  }
  function recordSupport(thing,s){
    if(!thing)return;
    write('support',{label:thing.name,detail:`A one-use −${thing.value} target modifier is available for a later check in this scene.`,value:thing.value},s);
  }
  function spend(items,s){
    if(!items?.length)return;
    const names=items.map(x=>x.name).join(', '),value=Math.min(2,items.reduce((n,x)=>n+(Number(x.value)||0),0));
    write('spent',{label:names,detail:`Temporary −${value} modifier used for this roll. The room's underlying state did not change.`,value},s);
  }
  function sceneChanged(s,oldScene,expired){
    if(s?.mode!=='play')return;
    const detail=expired?.length?`A new scene begins; earlier temporary support (${expired.map(x=>x.name).join(', ')}) does not carry over.`:
      'A new scene begins. Previous decisions remain in the record; temporary bonuses reset.';
    write('scene',{label:'A new scene',detail,previous:oldScene||''},s);
  }
  function recordCheck(action,result,mode){
    const s=window.LW?.S;
    if(!action||!result||s?.mode!=='play')return null;
    const type={normal:'Standard',focus:'Focus',push:'Push',steps:'Small steps'}[mode]||'Standard';
    const outcome={clear:'Clear opening',success:'Opening',partial:'Partial opening',complication:'Complication'}[result.category]||'Attempt';
    const detail=`${type} · d12 target ${result.target} · rolled ${result.best} · ${outcome}.`;
    return write('check',{label:action.label,detail,category:result.category,mode,
      rolled:result.best,target:result.target,continued:false,linkedKey:action.key,
      support:Number(result.support)||0},s);
  }
  function markCheck(checkId,continued){
    const e=data.events.find(x=>x.id===checkId&&x.kind==='check');
    if(!e)return;
    e.continued=!!continued;
    save();notify();
  }
  function recordChoice(label,detail,s){
    write('choice',{label,detail:detail||'The player selected a follow-up.'},s);
  }
  function snapshot(){return JSON.parse(JSON.stringify(data.events));}
  let filter='current';
  const pane=document.createElement('dialog');pane.id='bf-patterns';pane.setAttribute('aria-labelledby','bf-patterns-heading');
  pane.innerHTML=`<header class="bf-patterns-head"><div><small>A PLAYTHROUGH RECORD</small><h2 id="bf-patterns-heading">Action patterns</h2></div><button id="bf-patterns-close" type="button" aria-label="Close action patterns">×</button></header>
    <p class="bf-patterns-intro">What was attempted, what helped briefly, and what remained difficult. This is fictional play data, not a mood measure or evidence of recovery.</p>
    <div class="bf-patterns-options"><label for="bf-patterns-filter">Show</label><select id="bf-patterns-filter"><option value="current">Current resident</option><option value="all">All residents</option><option value="rooted">Noor</option><option value="grief">Tomas</option><option value="depression">Dele</option></select></div>
    <section class="bf-patterns-snapshot" id="bf-patterns-snapshot" aria-label="Current situation"></section>
    <section id="bf-patterns-timeline" aria-label="Timeline of actions"></section>
    <p class="bf-patterns-foot">Temporary footholds apply to one later check in the same scene. New scenes reset those modifiers, not the character's underlying experience.</p>`;
  document.body.appendChild(pane);
  const select=pane.querySelector('select');
  const timeline=pane.querySelector('#bf-patterns-timeline');
  const snap=pane.querySelector('#bf-patterns-snapshot');
  let lastFocus=null;
  const currentFlat=()=>window.LW?.S?.flat?.id||'';
  function render(){
    const active=currentFlat(),who=filter==='current'?active:filter;
    const events=(who==='all'?data.events:data.events.filter(e=>e.flatId===who));
    const checks=events.filter(e=>e.kind==='check'),actions=events.filter(e=>e.kind==='action'),supports=events.filter(e=>e.kind==='support');
    const now=window.LW?.S,display=who==='all'?'Across residents':who===active?String(now?.flat?.name||names[who]||'Current resident'):names[who]||who;
    const curr=window.BFDifficulty?.state,footholds=who===active && curr?.scene===scene(now)?curr.items:[];
    const currentHelp=footholds?.length?footholds.map(x=>`${esc(x.name)} (−${Number(x.value)||0} next target)`).join(', '):'None currently available';
    snap.innerHTML=`<div class="bf-patterns-situation"><strong>${esc(display)}</strong><span>${who===active && now?.vars?`Current scene: ${esc(now.vars.attune)}.`:'Past activity in this playthrough.'}</span></div>
      <p><b>Available foothold:</b> ${who==='all'?'Select one resident to see current support.':currentHelp}</p>
      <div class="bf-patterns-counts"><span>${actions.length} actions encountered</span><span>${checks.length} checks rolled</span><span>${supports.length} footholds offered</span></div>`;
    const latest=events.slice(-50).reverse();
    let previous='';
    timeline.innerHTML=latest.length?latest.map(e=>{
      const heading=e.resident+' · '+e.scene.split(':').slice(1).join(':');
      const header=heading!==previous?`<div class="bf-patterns-group">${esc(e.resident)} · Scene ${esc(e.scene.split(':').pop())}</div>`:'';
      previous=heading;
      const status=e.kind==='check'?`<span class="bf-patterns-status">${e.continued?'Continued':'Rolled · not continued'}</span>`:'';
      return header+`<article class="bf-patterns-entry bf-kind-${esc(e.kind)}"><div class="bf-patterns-meta"><span>${esc(({action:'Action',check:'Dice check',support:'Foothold',spent:'Used',scene:'Scene',choice:'Follow-up'})[e.kind]||e.kind)}</span><span>${esc(e.clock||'')}</span></div><h3>${esc(e.label)}</h3><p>${esc(e.detail)}</p>${status}</article>`;
    }).join(''):'<p class="bf-patterns-empty">No actions have been recorded for this resident yet. Interact with an object to begin.</p>';
  }
  function open(){
    if(!pane.open){lastFocus=document.activeElement;filter='current';select.value=filter;render();
      const menu=document.querySelector('#viewMenu');if(menu&&!menu.hidden)document.querySelector('#vbView')?.click();
      pane.showModal();pane.querySelector('#bf-patterns-close').focus();}
  }
  function close(){if(pane.open)pane.close();}
  pane.querySelector('#bf-patterns-close').addEventListener('click',close);
  pane.addEventListener('click',e=>{if(e.target===pane)close();});
  pane.addEventListener('close',()=>{lastFocus?.isConnected&&lastFocus.focus({preventScroll:true});lastFocus=null;});
  select.addEventListener('change',()=>{filter=select.value;render();});
  function notify(){if(pane.open)render();const btn=document.querySelector('#bf-patterns-open');if(btn){const count=data.events.filter(e=>e.kind==='action'||e.kind==='check').length;btn.textContent=`Action patterns${count?' · '+count:''}`;}}
  const menu=document.querySelector('#viewMenu');
  function addMenu(){
    if(!menu || menu.querySelector('#bf-patterns-open'))return;
    const btn=document.createElement('button');btn.id='bf-patterns-open';btn.type='button';btn.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();open();});
    menu.appendChild(btn);notify();
  }
  addMenu();if(menu)new MutationObserver(addMenu).observe(menu,{childList:true});
  window.BFPatterns={version:'7.6',recordAction,recordSupport,spend,sceneChanged,recordCheck,markCheck,recordChoice,
    open,close,reset(){data=clean();save();notify();if(pane.open)render();},get events(){return snapshot()}};
})();