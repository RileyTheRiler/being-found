/* Issue #17 — Leena, an optional authored story. No FLATS/VISITS or save-schema mutation.
 * Fictional account; NOT lived-experience validated or classroom-pilot approved. */
(function(){
  'use strict';
  if(window.BFLeena)return;
  const qs=s=>document.querySelector(s);
  const objects={
    calendar:{name:'Calendar',kind:'Saturday plan',observation:'Leena opens the library calendar and pauses over Saturday. There is an invitation written in the margin.',choices:[
      ['Ask what she wants to do','“I like having a plan. I also want room to change it,” she says. She writes a question mark, not a decision.'],
      ['Let her consider it','Leena leaves Saturday blank. “I can answer Nia tomorrow,” she says.']
    ]},
    cart:{name:'Book cart',kind:'Unfinished task',observation:'The returns cart is half sorted. A label maker and a mystery novel sit beside it.',choices:[
      ['Offer to sort with her','“You can put the returns in alphabetical order. I’ll do the labels,” Leena says. She sets the order of the task.'],
      ['Ask whether she wants help','“Not right now, thanks. I actually like doing the labels,” she says, and picks up the novel.']
    ]},
    phone:{name:'Message',kind:'Private notification',observation:'Leena glances at a notification on her phone and sets it beside the cart. You cannot read the message.',choices:[
      ['Ask if she wants to reply now','“I’d rather send a real answer later than say yes because the phone is here,” she says.'],
      ['Offer to give her space','“Thanks. Nia knows I sometimes need time to answer,” Leena says.']
    ]}
  };
  let dlg=null,entry=null,view='room',active=null,seen={},inspected={},heard={},disclosed=false,ending='',notice='';
  const dateCurrent='Friday · 20 November 2026';
  function b(label,act,more){return '<button type="button" class="leena-action" data-leena-act="'+act+'"'+(more||'')+'>'+label+'</button>';}
  function escapeHTML(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function title(heading,sub){return '<header class="leena-heading"><div class="leena-eyebrow">Leena · fictional person · optional Rooms story</div><h2 id="leena-heading" tabindex="-1">'+heading+'</h2><p>'+sub+'</p></header>';}
  function top(){return '<div class="leena-top"><span>Being Found / Optional story</span><button type="button" class="leena-close" data-leena-act="exit">Close and return to Rooms</button></div>';}
  // Decorative object detail: no image implies access to Leena's private thoughts or messages.
  // Every close inspection uses an actual crop of the same illustrated room.
  // The bright outline is a visual selection cue, not a changed object or private fact.
  function objectArt(id){
    const name=escapeHTML(objects[id].name.toLowerCase());
    return '<figure class="leena-object-art">'+
      '<picture aria-hidden="true"><source media="(max-width:600px)" srcset="leena_focus_'+id+'_mobile.svg">'+
      '<img src="leena_focus_'+id+'_wide.svg" alt="" decoding="async"></picture>'+
      '<figcaption>Closer view of the visible '+name+' in the library · Leena decides what to share</figcaption></figure>';
  }
  function render(){
    if(!dlg)return;
    let content='';
    const inspectedCount=Object.keys(inspected).length;
    if(view==='room'){
      content=title('A different Saturday',dateCurrent+' · Community library · an ordinary workday')+
       '<p class="leena-lead">You are visiting Leena at the community library. She is deciding what to do this weekend. Notice what is visible before drawing conclusions.</p>'+
       '<section class="leena-scene" aria-label="Illustrated library scene with object buttons; an equivalent list follows">'+
       '<picture class="leena-scene-picture" aria-hidden="true"><source media="(max-width:600px)" srcset="leena_library_mobile.svg"><img src="leena_library_wide.svg" alt="" decoding="async"></picture>'+
       Object.keys(objects).map(id=>'<span class="leena-scene-outline leena-outline-'+id+(inspected[id]?' is-inspected':'')+'" aria-hidden="true"></span>').join('')+
       Object.entries(objects).map(([id,o])=>'<button type="button" class="leena-prop leena-'+id+(inspected[id]?' is-inspected':'')+'" data-leena-act="object" data-obj="'+id+'"><strong>'+o.name+'</strong><small>'+(inspected[id]?'Inspected':'Inspect')+'</small></button>').join('')+
       '</section>'+
       '<nav class="leena-object-index" aria-label="Nonspatial library object controls"><span>Object list</span>'+Object.entries(objects).map(([id,o])=>'<button type="button" class="leena-index-action" data-leena-act="object-list" data-thing="'+id+'">'+o.name+(inspected[id]?' · inspected':'')+'</button>').join('')+'</nav>'+
       '<div class="leena-reading"><p class="leena-spoken" role="status">'+(notice?escapeHTML(notice):'Leena: “I’ve got the weekend to think about. The books can wait five minutes.”')+'</p><p>You may examine the three objects in any order, talk with Leena now, or leave. No interaction is required to continue.</p>'+
       '<p class="leena-progress">Objects inspected: '+inspectedCount+' of 3 (optional)</p>'+
       '<div class="leena-actions">'+b('Talk with Leena','continue')+b('Respect her space and leave','leave')+'</div></div>';
    } else if(view==='object'){
      const o=objects[active];
      content=title(o.name,dateCurrent+' · Something you can observe')+
       objectArt(active)+'<div class="leena-reading"><h3>Observed</h3><p>'+escapeHTML(o.observation)+'</p><h3>Choose how to respond</h3><div class="leena-actions">'+
       o.choices.map((c,i)=>b(escapeHTML(c[0]),'choice','data-choice="'+i+'"')).join('')+
       b('Return without asking','return')+'</div></div>';
    } else if(view==='conversation'){
      content=title('Leena sets the terms',dateCurrent+' · Conversation, not a diagnostic interview')+
       '<div class="leena-reading"><p class="leena-spoken">Leena: “I live with bipolar disorder. It’s part of my history, but it isn’t the reason for every blank on my calendar. I have a job, friends, books I love, and decisions that are mine.”</p>'+
       '<p>She pauses, then asks what you want to know. She can decline any question.</p><div class="leena-actions">'+
       b('Ask permission to hear about earlier periods','permission')+
       b('Ask if she would rather stop talking','refusal')+
       b('Stay with what she wants today','response')+
       b('Leave without further questions','leave')+'</div></div>';
    } else if(view==='recollections'){
      content=title('Memories Leena chose to share','Each account belongs to a separate dated period, not a switchable mood state.')+
       '<div class="leena-reading"><p class="leena-spoken">Leena: “I can tell you about two periods I remember. I don’t want to go into my treatment, and I can change my mind about any of this.”</p>'+
       '<div class="leena-memory-grid">'+
       '<button type="button" class="leena-memory" data-leena-act="memory" data-memory="expansive"><strong>April–May 2025</strong><span>A period she remembers as unusually full of immediate plans'+(heard.expansive?' · heard':'')+'</span></button>'+
       '<button type="button" class="leena-memory" data-leena-act="memory" data-memory="distant"><strong>October–November 2024</strong><span>A different period when future plans felt remote'+(heard.distant?' · heard':'')+'</span></button></div>'+
       '<div class="leena-actions">'+b('Return to the present conversation','response')+b('Thank her and leave','leave')+'</div>'+
       '<p class="leena-caution">These memories are deliberately separated by months and years. They are not clinical criteria, a general pattern, or an episode simulator.</p></div>';
    } else if(view==='memory'){
      const expansive=active==='expansive';
      content=title(expansive?'April–May 2025':'October–November 2024','Leena’s retrospective words · fictional authored speech')+
       '<div class="leena-reading"><p class="leena-spoken">'+(expansive?
       'Leena: “That spring I kept putting things on the calendar. Ideas felt immediately reachable, and I thought I could make every commitment work at once. Looking back, I understand that stretch differently than I did while living it. Some friendships needed repair afterward. That is one part of my story.”':
       'Leena: “The autumn before, even a simple invitation could feel far away. Nia still sent messages, but a date on the calendar did not seem connected to something I could imagine doing. We eventually found ways of staying in touch that worked for both of us. I can tell you that without saying every day was the same.”')+
       '</p><p>This is Leena’s authored recollection, offered in the present. The player has not entered her mind, induced an episode, or determined its cause.</p>'+
       '<div class="leena-actions">'+b('Back to Leena’s recollections','backmem')+b('Return to the present','response')+'</div></div>';
    } else if(view==='response'){
      content=title('What would you offer now?',dateCurrent+' · One invitation is still waiting')+
       '<div class="leena-reading"><p>Leena is looking at the same calendar, cart, and message. She has not asked you to solve them. You can offer something without claiming to know what they feel like to her.</p>'+
       '<div class="leena-actions">'+
       b('Listen without filling the silence','answer','data-answer="listen"')+
       b('Ask what support, if any, she wants','answer','data-answer="support"')+
       b('Say what you do not know','answer','data-answer="uncertain"')+
       b('Accept that she prefers to end here','answer','data-answer="boundary"')+'</div></div>';
    } else if(view==='ending'){
      const responses={
        listen:'Leena checks the calendar again. “Thanks for not deciding for me,” she says. She may reply to Nia tonight, or tomorrow.',
        support:'“Could you put the cart by the returns desk? I can handle the message,” Leena says. The choice remains hers.',
        uncertain:'“That’s fair. I don’t always know what a pause means either,” Leena says. She closes the library book and smiles.',
        boundary:'“I’d like to get back to work now,” Leena says. You leave the conversation there.',
        refusal:'Leena says, “Yes, I’d like to stop here.” You accept her boundary and leave without requesting a personal account.',
        leave:'You leave without asking more. Leena’s weekend and what she wants to disclose remain her own.'
      };
      const observations=Object.keys(inspected).map(id=>objects[id].observation);
      const communicated=Object.values(seen);
      if(disclosed)communicated.push('Leena chose to say she lives with bipolar disorder and that it does not explain every ordinary decision.');
      if(heard.expansive)communicated.push('Leena chose to describe her memories of April–May 2025.');
      if(heard.distant)communicated.push('Leena chose to describe her memories of October–November 2024.');
      content=title('Leaving the library','End of this optional fictional encounter')+
       '<div class="leena-reading"><p class="leena-spoken">'+responses[ending]+'</p>'+
       '<h3>Reflect: what can you actually say?</h3>'+
       '<dl class="leena-debrief"><dt>Observed</dt><dd>'+(observations.length?escapeHTML(observations.join(' ')):'You saw Leena in the library, with three objects available to examine. You did not examine their details.')+'</dd>'+
       '<dt>Communicated</dt><dd>Leena said she had the weekend to think about and the books could wait five minutes. '+(communicated.length?escapeHTML(communicated.join(' ')):'No further personal account was shared.')+'</dd>'+
       '<dt>Inferred, not established</dt><dd>'+(disclosed?'Her disclosure does not establish why she made any particular decision or how she feels today.':'You cannot infer a diagnosis, intentions, mood or ability to work from the room or the decisions you witnessed.')+'</dd>'+
       '<dt>Still unknown</dt><dd>What she will choose next, what she wants to share privately, and how she interprets these moments over her life.</dd></dl>'+
       '<p class="leena-caution"><strong>Editorial status:</strong> Unvalidated fiction. '+(disclosed?'Bipolar disorder does not explain every action.':'No diagnosis or reason for Leena’s behavior has been established by this encounter.')+' No subtype, symptom course, treatment choice, or lived experience can be established by this scene. Independent compensated lived-experience review and accessibility testing are still required.</p>'+
       '<div class="leena-actions">'+b('Replay Leena’s story','replay')+b('Return to Rooms','exit')+'</div></div>';
    }
    dlg.innerHTML=top()+'<div class="leena-body">'+content+'</div>';
    // Each story state is a new page. Do not strand mobile readers midway through it.
    dlg.scrollTop=0;
    dlg.querySelector('#leena-heading')?.focus({preventScroll:true});
  }
  function end(reason){ending=reason;view='ending';render();}
  function close(){
    if(dlg?.open)dlg.close();
  }
  function reset(){view='room';active=null;seen={};inspected={};heard={};disclosed=false;ending='';notice='';}
  function open(trigger){
    entry=trigger||document.activeElement;
    if(!dlg){
      dlg=document.createElement('dialog');dlg.id='bf-leena-dialog';dlg.className='leena-dialog';dlg.setAttribute('aria-labelledby','leena-heading');dlg.setAttribute('aria-label','Leena optional fictional story');
      document.body.append(dlg);
      dlg.addEventListener('cancel',e=>{e.preventDefault();close();});
      // Browser-native modal containment varies at wraparound: keep focus inside.
      dlg.addEventListener('keydown',e=>{
        if(e.key!=='Tab'||!dlg.open)return;
        const controls=[...dlg.querySelectorAll('button:not([disabled]),a[href],input:not([disabled]),[tabindex="0"]')]
          .filter(el=>el.getClientRects().length&&!el.hidden);
        if(!controls.length){e.preventDefault();dlg.focus();return;}
        const index=controls.indexOf(document.activeElement);
        const next=e.shiftKey?(index<0?controls.length-1:(index-1+controls.length)%controls.length):(index<0?0:(index+1)%controls.length);
        e.preventDefault();controls[next].focus({preventScroll:true});
      });
      dlg.addEventListener('close',()=>{if(entry?.isConnected)entry.focus({preventScroll:true});});
      // Spatial targets and nonspatial list preview the same visible object.
      // This is a visual locator only: no new observation, choice or disclosure.
      function preview(el){
        const selector='button[data-leena-act="object"],button[data-leena-act="object-list"]';
        // A keyboard/switch-selected object takes precedence over incidental hover
        // caused by layout scroll under the stationary mouse pointer.
        const focused=document.activeElement?.closest?.(selector);
        const control=focused||el?.closest?.(selector);
        const scene=dlg.querySelector('.leena-scene');
        if(scene)scene.dataset.preview=control?.dataset.obj||control?.dataset.thing||'';
      }
      dlg.addEventListener('focusin',e=>preview(e.target));
      dlg.addEventListener('mouseover',e=>preview(e.target));
      dlg.addEventListener('mouseout',e=>{
        if(!e.relatedTarget?.closest?.('button[data-leena-act="object"],button[data-leena-act="object-list"]'))
          preview(document.activeElement);
      });
      dlg.addEventListener('click',e=>{
        if(e.target===dlg)return;
        const button=e.target.closest('button[data-leena-act]');if(!button||!dlg.contains(button))return;
        const action=button.dataset.leenaAct;
        if(action==='exit'){close();return;}
        if(action==='replay'){reset();render();return;}
        if(action==='leave'){end('leave');return;}
        if(action==='object'||action==='object-list'){active=button.dataset.obj||button.dataset.thing;inspected[active]=true;view='object';}
        else if(action==='return'){view='room';notice='Leena decides what to do next; a visitor does not need to prompt her.';}
        else if(action==='choice'){const o=objects[active];seen[active]=o.choices[Number(button.dataset.choice)][1];notice=seen[active];view='room';}
        else if(action==='continue'){disclosed=true;view='conversation';}
        else if(action==='permission'){view='recollections';}
        else if(action==='refusal'){end('refusal');return;}
        else if(action==='memory'){active=button.dataset.memory;heard[active]=true;view='memory';}
        else if(action==='backmem'){view='recollections';}
        else if(action==='response'){view='response';}
        else if(action==='answer'){end(button.dataset.answer);return;}
        render();
      });
    }
    reset();
    dlg.showModal();
    render();
  }
  function insertCard(){
    const room=qs('#mFlats .mcard'),anchor=room?.querySelector(':scope > .btnrow');
    if(!room||!anchor||room.querySelector('[data-bf-leena]'))return;
    const section=document.createElement('section');
    section.className='leena-entry';section.setAttribute('aria-label','Optional story');
    section.innerHTML='<div class="eyebrow">Optional story · separate from Guided Story</div><h2>Leena’s library</h2>'+
     '<p class="small">A fictional adult with her own work, relationships, and choices. Three ordinary objects, dated recollections shared only with permission, and a complete ending.</p>'+
     '<button type="button" class="flatcard leena-entry-card" data-bf-leena aria-label="Play Leena’s optional fictional library story"><span class="top"><span class="leena-portrait" aria-hidden="true">L</span><span><span class="fno">Optional · fictional person</span><br><span class="fname">Leena</span></span></span><span class="ffeel">A different Saturday</span><p>Time · agency · relationships</p></button>';
    anchor.before(section);
  }
  document.addEventListener('click',e=>{const trigger=e.target.closest?.('button[data-bf-leena]');if(trigger){e.preventDefault();e.stopPropagation();open(trigger);}},true);
  const rooms=qs('#mFlats');
  if(rooms)new MutationObserver(insertCard).observe(rooms,{childList:true,subtree:true});
  insertCard();
  window.BFLeena={open,close,get active(){return !!dlg?.open;},get state(){return {view,seen:Object.keys(seen),inspected:Object.keys(inspected),heard:Object.keys(heard),disclosed,ending};}};
})();