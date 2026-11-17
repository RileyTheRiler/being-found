/* Being Found 7.0 — authored, optional variations around selected decisions.
   Rolls describe how an attempt unfolds in this FICTIONAL scene. They do not
   simulate a condition, determine a person's capacity, or override existing goals. */
(() => {
  'use strict';
  if (window.BFStory) return;
  const game = window.LW;
  if (!game || !game.S) { console.warn('Being Found story moments: game is unavailable.'); return; }
  const S = game.S;
  const STORAGE = 'being-found.story-moments.v1';
  const CATEGORIES = ['clear','success','partial','complication'];
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const scenes = {
    'rooted:stove:fry': {
      name:'Breakfast', category:'An ordinary morning', flag:'breakfast', extraMinutes:{clear:0,success:0,partial:6,complication:12},
      outcomes:{
        clear:'The pan warms evenly. You slide the egg onto a plate, sit down, and eat while the window is still bright with morning.',
        success:'The yolk breaks in the pan. You swear at it, then eat it anyway. Good egg. The kitchen is still somewhere you know how to be.',
        partial:'The first egg sticks. You turn down the heat, scrape the pan, and make toast as well. Breakfast takes longer; you still eat.',
        complication:'The pan gets too hot while you search for the spatula. You switch off the burner, open the window, and make toast instead. Breakfast changes shape, not the whole day.'
      },
      question:'The dishes are waiting.',
      choices:[
        {id:'wash', label:'Wash the pan', text:'Warm water, a little soap, the pan back on the rack. You turn toward the rest of the morning.'},
        {id:'later',label:'Leave them for later',text:'You set the pan beside the sink. It can wait while you do something else.'}
      ]
    },
    'rooted:stove:cook': {
      name:'Cooking something good', category:'An inviting possibility',flag:'meal', extraMinutes:{clear:0,success:0,partial:9,complication:14},
      outcomes:{
        clear:'Garlic hits the oil. You improvise a little and the kitchen smells better than you expected. There will be leftovers.',
        success:'You chop the vegetables, follow the smell, and make dinner earlier than planned. You want to taste what you made.',
        partial:'You get the seasonings mixed up and start again with what is left. It is a smaller meal than you pictured, but you like it.',
        complication:'The sauce catches at the bottom of the pan. You turn the heat down, rescue what you can, and put bread beside it. It is still your meal.'
      },
      question:'There is enough to keep some.',
      choices:[
        {id:'share',label:'Save a portion for Dani',text:'You cover a plate for Dani. You can already picture the two of you talking over it tonight.'},
        {id:'keep',label:'Put away the leftovers',text:'You pack a container for tomorrow. A small future has been arranged.'}
      ]
    },
    'rooted:phone:call': {
      name:'Jo calls', category:'A shared possibility',flag:'saturday', extraMinutes:{clear:0,success:0,partial:5,complication:8},
      outcomes:{
        clear:'You answer as Jo says your name. She suggests the climbing wall on Saturday. You settle on a time and spend another minute laughing about last weekend.',
        success:'Jo wants to try the climbing wall on Saturday. You say yes, and the two of you find a time that works.',
        partial:'The first call drops. You ring Jo back, and she picks up laughing. You agree to try the climbing wall on Saturday.',
        complication:'You miss the call while the phone slips beneath a cushion. Jo leaves a message about Saturday. You ring her back; the climbing plan is still on.'
      },
      question:'Saturday now has a shape.',
      choices:[
        {id:'calendar',label:'Put it in the calendar',text:'You add the time and the climbing wall. Saturday is there whenever you look.'},
        {id:'check',label:'Check the details with Jo later',text:'You send Jo a quick message: “Let’s confirm the time on Friday.” She sends a thumbs-up.'}
      ]
    },
    'rooted:door:out': {
      name:'Stepping outside', category:'A possibility beyond the flat',flag:'walk', extraMinutes:{clear:0,success:0,partial:6,complication:10},
      outcomes:{
        clear:'Keys, jacket, stairs. You take the long route and stop to watch the bakery set out its bread. The day has room for a detour.',
        success:'You go down the stairs without a particular destination. Outside smells like rain on warm pavement.',
        partial:'You leave, remember you forgot your keys, and climb back up. On the second try you make it to the street.',
        complication:'You reach the landing and notice your shoelace dragging. You sit to retie it, then head outside at your own pace.'
      },
      question:'At the corner, two directions are open.',
      choices:[
        {id:'bakery',label:'Stop at the bakery',text:'You buy a warm roll and carry it home in a paper bag. An unplanned errand is a good one.'},
        {id:'walk',label:'Keep walking',text:'You follow the familiar block until the traffic noise thins. Nothing needs to happen next.'}
      ]
    },
    'depression:stove:fry': {
      name:'Finding a meal',category:'A task that remains difficult',flag:'deleMeal',extraMinutes:{clear:0,success:0,partial:0,complication:0},
      outcomes:{
        clear:'You find the pan and an egg. You make something simple, one movement at a time. You eat standing up. The kitchen does not suddenly feel inviting, but you have eaten.',
        success:'The pan is where you expect it. You begin, stop, and begin again. Breakfast happens in pieces. Finishing it uses most of what you can bring to this morning.',
        partial:'You stand in front of the stove for a long while. The steps will not arrange themselves. You put the pan away and eat a piece of bread. A smaller meal is still a meal.',
        complication:'You get the pan out but cannot begin heating it. You set it down safely. Later you eat something cold from the fridge. This was an effortful morning, not a character flaw.'
      },
      question:'There is no requirement to make the day feel better.',
      choices:[
        {id:'small',label:'Leave an easier option ready',text:'You put bread where it is visible. It might make one decision smaller tomorrow. You do not have to feel hopeful about it.'},
        {id:'rest',label:'Rest after eating',text:'You sit for a while. Eating took effort. Rest is permitted even when it does not change how the room feels.'}
      ]
    },
    'depression:sofa:sit': {
      name:'Sitting down',category:'A practical action with a cost',flag:'deleSit',extraMinutes:{clear:0,success:0,partial:0,complication:0},
      outcomes:{
        clear:'You reach the sofa and sit. For a moment there is nothing else to organize. It is still difficult to picture getting up again.',
        success:'You get to the sofa and sit without much ceremony. The cushion takes your weight. The rest of the room does not become easier.',
        partial:'You remain standing beside the sofa, gathering what it takes to lower yourself onto it. At last you sit. Getting up can be a later decision.',
        complication:'The sofa is only a few steps away, but every movement asks another question. You stand still, then sit on the edge. You have not done this wrong.'
      },
      question:'You can decide about the next step later.',
      choices:[
        {id:'stay',label:'Stay where you are',text:'You stay with the quiet, without requiring it to be restorative.'},
        {id:'water',label:'Put water within reach',text:'You move the glass closer. It is a practical accommodation, not a sudden return of motivation.'}
      ]
    },
    'depression:easel:tidy': {
      name:'The brushes',category:'One manageable part',flag:'deleBrush',extraMinutes:{clear:0,success:0,partial:0,complication:0},
      outcomes:{
        clear:'You rinse two brushes. The water clouds with blue paint. The canvas remains where it was. This small act does not restore the urge to paint.',
        success:'You pick up a brush and wash it carefully. The movement is familiar. Wanting to use it again is another matter.',
        partial:'One brush gets cleaned. The others stay in the jar. One part of the task was possible; the rest does not need to happen now.',
        complication:'You turn on the tap and stand there. You turn it off and place the brush beside the sink. Trying the first step cost something, even without a finished task.'
      },
      question:'The easel will still be here.',
      choices:[
        {id:'leave',label:'Leave the brushes out',text:'You leave them ready. That does not promise a painting tomorrow.'},
        {id:'one',label:'Put one brush away',text:'One brush goes back in the jar. One manageable decision has been made.'}
      ]
    },
    'grief:phone:call': {
      name:'Talking with Bea', category:'Someone remains reachable',flag:'bea', extraMinutes:{clear:0,success:0,partial:4,complication:7},
      outcomes:{
        clear:'You answer, and Bea waits through the silence. You tell her a detail about Ines she had forgotten. She tells the Porto story; you laugh and feel the loss at the same time.',
        success:'Bea asks if she can stay on the line. She tells the story of how Ines got everyone lost in Porto. You laugh, and it hurts, and she stays.',
        partial:'You let the phone ring twice before picking up. Bea does not rush you. You tell her you miss Ines, then listen as she remembers Porto.',
        complication:'You miss the call. Bea texts, “No need to answer straight away.” You call her back. There is a long silence, then her voice and the old Porto story.'
      },
      question:'Before hanging up, Bea asks what would help.',
      choices:[
        {id:'visit',label:'Ask her to visit',text:'“Could you come by this week?” Bea says yes. The visit does not undo the empty place in the flat.'},
        {id:'call',label:'Ask to talk again',text:'You ask if you can call tomorrow. “Of course,” Bea says. Tonight is still difficult, but you know she will pick up.'}
      ]
    }
  };
  const cleanState = () => ({flags:{},history:[]});
  let state = cleanState();
  try {
    const saved = JSON.parse(sessionStorage.getItem(STORAGE)||'null');
    if(saved && typeof saved==='object') {
      state.flags = saved.flags && typeof saved.flags==='object' ? saved.flags : {};
      state.history = Array.isArray(saved.history) ? saved.history.slice(0,25) : [];
    }
  } catch(_) {}
  const persist=()=>{try{sessionStorage.setItem(STORAGE,JSON.stringify(state));}catch(_) {}};
  const momentKey = a => `${a.flatId}:${a.obj}:${a.act}`;
  const isAuthored = a => !!a && a.flatId === S.flat?.id && a.phaseIx === S.phaseIx &&
    S.mode === 'play' && (a.flatId !== 'grief' || a.phaseIx === 0) &&
    Object.prototype.hasOwnProperty.call(scenes,momentKey(a));
  const formatContext = (action, body) => {
    const key=momentKey(action);
    let extra='';
    if(key==='rooted:phone:call') {
      if(state.flags.breakfast==='wash') extra=' The pan is clean and drying by the sink.';
      else if(state.flags.breakfast==='later') extra=' The breakfast pan is still beside the sink. It can wait.';
      if(state.flags.meal==='share') extra+=' Dani’s covered portion waits in the kitchen.';
      else if(state.flags.meal==='keep') extra+=' Tomorrow’s leftovers are already put away.';
    }
    if(key==='rooted:door:out') {
      if(state.flags.saturday==='calendar') extra=' The climbing plan for Saturday is in your calendar.';
      else if(state.flags.saturday==='check') extra=' You and Jo will confirm the time for Saturday later.';
    }
    if(key==='rooted:stove:cook') {
      if(state.flags.walk==='bakery') extra=' The paper bag from the bakery sits on the counter.';
      else if(state.flags.walk==='walk') extra=' Your shoes are still by the door from the walk.';
    }
    return body + extra;
  };
  let expected=null;
  let active=null;
  let card=S.card;
  const journal=document.createElement('dialog');
  journal.id='bf-journal';
  journal.setAttribute('aria-labelledby','bf-journal-heading');
  journal.innerHTML='<div class="bf-journal-head"><div><span class="bf-mini">YOUR STORY</span><h2 id="bf-journal-heading">Moments</h2></div><button type="button" id="bf-journal-close" aria-label="Close story moments">×</button></div><p class="bf-journal-intro">Decisions in this fictional playthrough, not a score or clinical record.</p><div id="bf-journal-entries"></div><button type="button" id="bf-journal-reset">Reset moments and dice checks</button>';
  document.body.appendChild(journal);
  const renderJournal=()=>{
    const items=journal.querySelector('#bf-journal-entries');
    items.innerHTML=state.history.length ? state.history.map(entry=>`<article class="bf-journal-entry"><small>${esc(entry.flat)} · ${esc(entry.category)}</small><h3>${esc(entry.name)}</h3><p>${esc(entry.text)}</p>${entry.choiceText?`<p class="bf-journal-choice">${esc(entry.choiceText)}</p>`:''}</article>`).join('') : '<p class="bf-empty">No decisions recorded yet. Play an authored skill check to begin.</p>';
  };
  journal.querySelector('#bf-journal-close').addEventListener('click',()=>journal.close());
  journal.querySelector('#bf-journal-reset').addEventListener('click',()=>{state=cleanState();persist();window.BFSkillChecks?.resetSession?.();renderJournal();});
  journal.addEventListener('click',e=>{if(e.target===journal)journal.close();});
  const menu=document.querySelector('#viewMenu');
  const insertJournalButton=()=>{
    if(!menu || menu.querySelector('#bf-journal-toggle'))return;
    const btn=document.createElement('button');btn.id='bf-journal-toggle';btn.type='button';
    btn.textContent='Story moments';
    btn.addEventListener('click',e=>{
      e.preventDefault();e.stopPropagation();
      if(!menu.hidden)document.querySelector('#vbView')?.click();
      renderJournal();journal.showModal();
    });
    menu.appendChild(btn);
  };
  insertJournalButton();
  if(menu)new MutationObserver(insertJournalButton).observe(menu,{childList:true});
  function commit(action, result) {
    if(!isAuthored(action) || !result || !CATEGORIES.includes(result.category))return false;
    expected={key:momentKey(action),action:{...action, button:null},result:{...result},since:Date.now()};
    return true;
  }
  // The original game writes its story card after walking/animating. Intercept only
  // the authored card for this exact action; original goals and effects still run.
  Object.defineProperty(S,'card',{
    configurable:true,enumerable:true,get(){return card;},set(next){
      if(next === null) active=null;
      const e=expected;
      if(e && next && Date.now()-e.since < 90000 &&
        S.flat?.id===e.action.flatId && S.phaseIx===e.action.phaseIx &&
        next.kind===e.action.type &&
        next.title===e.action.label) {
        const scene=scenes[e.key];
        if(scene) {
          const body=formatContext(e.action,scene.outcomes[e.result.category]) + (e.result.steps?' You chose to break the attempt into smaller steps; that changed the demands of this moment, not the world around you.':'');
          next.text=body;
          const added=(scene.extraMinutes?.[e.result.category] || 0) + (e.result.steps && S.vars?.time!=='frozen'?8:0);
          if(added){
            S.clock+=added;
            next.fx=Array.isArray(next.fx)?next.fx.concat([{label:`+${added} min`,cls:''}]):[{label:`+${added} min`,cls:''}];
            // The original game saved the goal just before assigning the card.
            // Preserve this extra narrative time when the browser resumes.
            try{
              if(S.cur?.clock!==undefined)S.cur.clock=S.clock;
              const raw=JSON.parse(localStorage.getItem('lifeworld.v1')||'null');
              if(raw?.cur?.flatIx===S.flatIx && raw.cur.phaseIx===S.phaseIx){
                raw.cur.clock=S.clock;localStorage.setItem('lifeworld.v1',JSON.stringify(raw));
              }
            }catch(_){}
          }
          const entry={id:`${Date.now()}-${Math.random().toString(36).slice(2,8)}`,flat:S.flat.name,name:scene.name,
            category:scene.category,text:body,categoryCode:e.result.category,addedMinutes:added,choiceText:''};
          state.history.unshift(entry);state.history=state.history.slice(0,25);persist();
          active={scene,entryId:entry.id,actionKey:e.key,answered:false,answer:null,card:next};
          expected=null;
        }
      }
      if(e && Date.now()-e.since>=90000)expected=null;
      card=next;
    }
  });
  const resultEl=document.getElementById('result');
  function drawFollowUp() {
    if(!resultEl || !active || active.card !== S.card) return;
    const box=resultEl.querySelector('.bf-moment');
    const stage=active.answered?'answered':'choosing';
    if(box?.dataset.entry===active.entryId && box.dataset.stage===stage)return;
    if(box)box.remove();
    resultEl.querySelector('.bf-moment-jump')?.remove();
    const node=document.createElement('div');node.className='bf-moment';node.dataset.entry=active.entryId;node.dataset.stage=stage;
    if(active.answered) {
      node.innerHTML=`<div class="bf-moment-head"><span>YOUR NEXT STEP</span><span>Remembered</span></div><p class="bf-moment-answer">${esc(active.answer.text)}</p>`;
    } else {
      node.innerHTML=`<div class="bf-moment-head"><span>WHAT NEXT?</span><span>Choose one</span></div><p>${esc(active.scene.question)}</p><div class="bf-moment-options">${active.scene.choices.map(choice=>`<button type="button" data-bf-followup="${esc(choice.id)}">${esc(choice.label)}</button>`).join('')}</div>`;
    }
    resultEl.append(node);
    // The original story card may scroll under the classroom guide. Keep an
    // explicit route to the new choices without covering the room or dialogue.
    if(!active.answered && node.getBoundingClientRect().bottom > resultEl.getBoundingClientRect().bottom + 12){
      const jump=document.createElement('button');
      jump.type='button';jump.className='bf-moment-jump';
      jump.textContent='Next step available ↓';
      jump.setAttribute('aria-label','Scroll to the follow-up choices');
      jump.addEventListener('click',()=>{
        const top=Math.max(0,node.offsetTop-resultEl.offsetTop-6);
        resultEl.scrollTo({top,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
        node.querySelector('button')?.focus({preventScroll:true});
      });
      resultEl.prepend(jump);
    }
  }
  if(resultEl) new MutationObserver(drawFollowUp).observe(resultEl,{childList:true});
  resultEl?.addEventListener('click',e=>{
    const btn=e.target?.closest?.('[data-bf-followup]');
    if(!btn || !active || active.answered)return;
    const choice=active.scene.choices.find(c=>c.id===btn.dataset.bfFollowup);
    if(!choice)return;
    active.answered=true;active.answer=choice;
    state.flags[active.scene.flag]=choice.id;
    const entry=state.history.find(h=>h.id===active.entryId);
    if(entry)entry.choiceText=choice.text;
    persist();window.BFPatterns?.recordChoice?.(choice.label,choice.text,S);drawFollowUp();
  });
  // Preserve history when the story card is replaced; follow-ups remain voluntary.
  window.BFStory={version:'7.6',hasBranch:isAuthored,commit,get moments(){return JSON.parse(JSON.stringify(state));},
    reset(){state=cleanState();persist();renderJournal();},get pending(){return !!expected;}};
})();