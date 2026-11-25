/* Generate a separate, narrative-first edition from the same reviewed engine.
 * The classroom index and original modules remain byte-for-byte unchanged.
 * Exact anchors fail the build if the shared engine drifts. */
'use strict';
const fs=require('node:fs'),path=require('node:path');
function once(text,from,to){
  const count=text.split(from).length-1;
  if(count!==1)throw Error('Story edition anchor drift ('+count+'): '+from.slice(0,90));
  return text.replace(from,()=>to);
}
function region(text,start,end,replacement){
  const a=text.indexOf(start),b=text.indexOf(end,a+start.length);
  if(a<0||b<0||text.indexOf(start,a+start.length)!==-1)throw Error('Story edition region drift: '+start);
  return text.slice(0,a)+replacement+'\n'+text.slice(b);
}
const note='<details class="story-context"><summary>About the story</summary><p>Matthew Ratcliffe describes existential feelings as a background sense of what is possible, familiar or available in ordinary life. The same room can offer different possibilities to different people.</p><p>These are fictional accounts, not simulations or diagnoses. A visit reveals only what happens and what someone chooses to share. Independent lived-experience and accessibility review is still needed.</p><p><a href="https://doi.org/10.1093/med/9780199206469.003.0002" target="_blank" rel="noopener noreferrer">Read about existential feelings (Ratcliffe, 2008)</a></p></details>';
function generate(html){
  // Isolate room save and opening preference across editions; maintain guided tab-only ownership.
  html=html.replaceAll('lifeworld.','beingfound.story.').replaceAll('beingfound.opening.v1','beingfound.story.opening.v1');
  html=once(html,'<body>','<body class="bf-story-edition">');
  html=html.replace(/<title>[^<]*<\/title>/i,'<title>Being Found — Story Edition</title>');
  html=region(html,'function showTitle(){ const sv=','function showIntro(ix)',[
    'function showTitle(){ modal("mTitle",',
    JSON.stringify('<div class="title-head"><div class="titlelogo"><i class="ring"></i><div><div class="eyebrow">An interactive narrative</div><h1>Being Found</h1></div></div><button class="title-help" type="button" data-how-open aria-label="How to play">? <span>How to play</span></button></div><p class="lede">A window lit before sunrise. A door that may stay closed. A conversation that cannot be hurried.</p><div class="story-title-actions"><button class="cta title-primary" type="button" data-class="open">Begin story</button><button class="cta ghost title-opening" type="button" data-prologue="1">Watch the opening</button><button class="cta ghost" type="button" data-bf-leena>A different Saturday · Leena</button></div>'+note+'<p class="small title-disclaimer">Fictional story · Preview build · Independent review pending.</p>')+'); }'
  ].join('\n'));
  html=once(html,'if(inRoom&&(tabletDock||tabletPortraitDock||desktopDock)){','if(inRoom&&available){');
  html=once(html,'if(desktopDock)dock.appendChild(guide);else dock.prepend(guide);','dock.appendChild(guide);');
  html=once(html,'guide.parentElement!==dock||desktopDock&&guide!==dock.lastElementChild','guide.parentElement!==dock||guide!==dock.lastElementChild');
  // Reuse controller transitions and flags, without requiring classroom tasks.
  html=region(html,'function begin(){if(run.active){resume();return;}','function renderGuide()',[
    "function begin(){if(run.active){resume();return;}run.active=true;run.stage='intro';run.noor.clear();run.dele.clear();run.pre={};run.post={};run.dVisit=null;run.wVisit=null;run.deleOutcome=null;run.guideCollapsed=true;run.paceStarted=null;run.paceMarks=[];document.body.classList.add('cl-route');",
    'try{window.LW.closeModals();}catch(e){} stageNoor();}'
  ].join('\n'));
  html=region(html,'function renderGuide(){const focusAction=','function stageNoor()',[
    "function renderGuide(){if(!run.active||!['noor','room'].includes(run.stage)){guide.hidden=true;return;}",
    "const noor=isStage('noor'),action=noor?'dele':'waltbridge';",
    "if(guide.dataset.storyAction!==action){guide.dataset.storyAction=action;guide.classList.remove('collapsed');guide.innerHTML='<div class=\"story-room-footer\"><button class=\"cl-guide-primary\" data-cl=\"'+action+'\">'+(noor?'Later that morning →':'Continue →')+'</button><button class=\"secondary cl-guide-exit\" data-cl=\"end\">Return to menu</button></div>';}",
    "guide.setAttribute('aria-label','Story navigation');guide.hidden=false;syncGuide();}"
  ].join('\n'));
  html=region(html,'function beforeDele(){','function toDeleRoom()',[
    "function beforeDele(){run.stage='between';",
    'modal('+JSON.stringify('<div class="cl-kicker">Saturday · Later that morning</div><h2>The next door</h2><p>Mara mentioned that Dele hasn’t joined their Saturday walks lately. She hasn’t seen him painting either.</p><p>You stop outside his door.</p><div class="cl-actions"><button data-cl="deledo">Knock</button><button class="secondary" data-cl="end">Return to menu</button></div>')+');}'
  ].join('\n'));
  html=region(html,'function beforeWalt(){','function stageWalt()',[
    "function beforeWalt(){run.stage='waltbridge';hideModal();",
    'modal('+JSON.stringify('<div class="cl-kicker">Tuesday · 10:30</div><h2>Across town</h2><p>June rang the clinic yesterday. Walt has a home visit this morning.</p><div class="cl-actions"><button data-cl="walt">Go to Walt’s house</button><button class="secondary" data-cl="end">Return to menu</button></div>')+');}'
  ].join('\n'));
  html=region(html,'function finale(){','function debrief(){',[
    "function finale(){run.stage='complete';",
    'modal('+JSON.stringify('<div class="cl-kicker">Being Found</div><h2>Outside again</h2><p>The street carries on. Lights come on in the windows, one by one. Behind each, a day you have only partly seen.</p><p>Some things were said. Some were left unsaid.</p><div class="cl-actions"><button data-cl="end">Return to menu</button></div>'+note)+');}'
  ].join('\n'));
  html=once(html,'if(toTitle)showTitle();else window.LW.showFlats();','showTitle();');
  html=once(html,"panel.setAttribute('aria-label','Being Found classroom pathway')","panel.setAttribute('aria-label','Being Found story')");
  // Keep the actual encounter outcome guard; no reflection form or private room unlock.
  html=once(html,"['reflect','Leave and review what was communicated']","['reflect','Leave the visit']");
  html=once(html,"if(a==='reflect')panel(summary());","if(a==='reflect'){if(window.LWClass?.isStage?.('dele'))window.LWClass.toDeleRoom();else panel(summary());}");
  html=once(html,"if(!noTitle){try{window.LW?.showTitle?.();}catch(e){}}","if(!noTitle){if(window.LWClass?.isStage?.('dele'))window.LWClass.leaveWalt();else try{window.LW?.showTitle?.();}catch(e){}}");
  html=once(html,'Dele chose to end this visit. You do not get to complete a checklist of questions.','Dele ends the visit.');
  html=once(html,'The visit has reached a natural ending. Several explanations remain possible.','The visit comes to an end.');
  html=once(html,'Dele accepted a specific offer. Nothing implies that his wider difficulties have been fixed.','You leave the cup within his reach.');
  // Keep Walt's role, referral attribution, optional timing controls and full branching conversation.
  html=region(html,'function showReferral(){ card(', 'const TOPICS=',[
    'function showReferral(){ card('+JSON.stringify('<div class="eyebrow">Tuesday · Walt’s house</div><h2>A home visit</h2><p>You arrive as Walt’s speech-language pathologist. He is a retired woodwork teacher recovering from a stroke.</p><p>June’s message yesterday: “He has stopped trying. The cards are in the drawer.”</p><details class="enc-learn"><summary>Conversation controls</summary><p>Tap the transcript to advance narration. You can choose how long silences last.</p>')+'+paceHTML()+'+JSON.stringify('</details><div class="btnrow enc-sticky"><button class="cta" type="button" data-encgo="knock">Begin visit</button><button class="cta ghost" type="button" data-encgo="leave">Return to menu</button></div>')+'); }'
  ].join('\n'));
  html=once(html,'<h2>What happened here?</h2><p class="lede">This is a record of what was communicated and what you did. It does not explain everything about Walt.</p>','<h2>At the door</h2><p class="lede">The visit has ended.</p><details class="story-context"><summary>Remember the conversation</summary>');
  html=once(html,'<div class="enc-notice">June’s statement that he “has stopped trying” is a caregiver report. It is not a conclusion about Walt’s motivation.</div>','<p>June’s account is hers. Walt’s words are his.</p></details>');
  html=once(html,'<button class="cta" type="button" data-encgo="note">Write a session note</button><button class="cta ghost" type="button" data-encgo="again">Visit on another day</button>','<button class="cta" type="button" data-encgo="classFinal">Step outside</button>');
  // The original guide stays out of the way; no developer/teaching controls are exposed.
  html=html.replace('</head>', '<link rel="stylesheet" href="story-edition.css"></head>');
  html=html.replace(/src="leena\.js\?v=/,'src="leena-story.js?v=');
  html=html.replace(/src="story\.js\?v=/,'src="story-engine-edition.js?v=');
  return html;
}
module.exports=function writeStory(dir,html){
  const css='body.bf-story-edition #app #btnTerms,body.bf-story-edition #app #btnFlats,body.bf-story-edition #app #bf83-reflect-launch,body.bf-story-edition #app #colRight,body.bf-story-edition #app #wStrip,body.bf-story-edition #app #goalPanel,body.bf-story-edition #app #goalBar,body.bf-story-edition #app #noteFloat{display:none!important} .bf-story-edition #clGuide{padding:8px!important;box-shadow:none!important;background:transparent!important;border:0!important} .story-room-footer,.story-title-actions{display:grid;gap:8px}.story-room-footer{grid-template-columns:1fr auto;align-items:center}.story-room-footer button,.story-title-actions button{min-height:44px!important}.story-context{margin:1rem 0;color:inherit;line-height:1.5}.story-context summary{cursor:pointer;padding:.5rem 0;min-height:44px}.bf-story-edition #mTitle .mcard{max-width:530px}.bf-story-edition #clOverlay .cl-card{max-width:580px}.bf-story-edition #clOverlay .cl-card h2{font-family:Georgia,serif;font-weight:500;font-size:clamp(2rem,6vw,3.3rem)} @media(max-width:650px){.bf-story-edition #clGuide{position:relative!important;inset:auto!important;width:100%!important;max-width:100%!important}.story-room-footer{grid-template-columns:1fr auto}}';
  fs.writeFileSync(path.join(dir,'story-edition.css'),css+' body.bf-story-edition.bf-guide-closed #clGuide:not([hidden]){display:block!important} body.bf-story-edition #bf-guide-toggle{display:none!important} body.bf-story-edition #app #dock #clGuide:not([hidden]){position:static!important;width:100%!important;max-width:100%!important;inset:auto!important;max-height:none!important;overflow:visible!important}');
  fs.writeFileSync(path.join(dir,'story-engine-edition.js'),fs.readFileSync(path.join(dir,'story.js'),'utf8').replaceAll('lifeworld.','beingfound.story.'));
  let leena=fs.readFileSync(path.join(dir,'leena.js'),'utf8');
  leena=once(leena,'Leena · fictional person · optional Rooms story','Leena · Community library');
  leena=once(leena,'Being Found / Optional story','Being Found / A different Saturday');
  leena=once(leena,'Close and return to Rooms','Return to menu');
  leena=once(leena,'End of this optional fictional encounter','Saturday afternoon');
  leena=once(leena,'<h3>Reflect: what can you actually say?</h3>','<details class="story-context"><summary>Remember the visit</summary>');
  leena=once(leena,`<div class="leena-actions">'+b('Replay Leena’s story','replay')`,`</details><div class="leena-actions">'+b('Replay Leena’s story','replay')`);
  leena=once(leena,"b('Return to Rooms','exit')","b('Return to menu','exit')");
  fs.writeFileSync(path.join(dir,'leena-story.js'),leena);
  fs.writeFileSync(path.join(dir,'story.html'),generate(html));
};
module.exports.generate=generate;
