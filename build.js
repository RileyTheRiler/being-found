/* Being Found 8.2 — replacement room renderer; pinned full game, authored branches, responsive UI,
   cinematic details and a collision-aware motion refinement. */
const fs=require('node:fs'),path=require('node:path');
(async()=>{
 const local=path.join(__dirname,'src','index.html');
 if(!fs.existsSync(local))throw Error('Required pinned game source missing: src/index.html. Build stopped; no remote fallback.');
 let html=fs.readFileSync(local,'utf8');
 if(!html.includes('Being Found 6.7')||html.length<200000||!html.includes('window.LW=')||!html.includes('</body>'))
  throw Error('Not the complete original game; refusing to deploy.');
 function inject(original,replacement){
  const matches=html.split(original).length-1;
  if(matches!==1)throw Error(`Unreviewed game-engine drift: expected once, found ${matches}: ${original.slice(0,65)}`);
  html=html.replace(original,replacement);
 }
 // This release replaces the original room rendering path, rather than
 // modifying its CSS appearance. The authored state engine is preserved.
 inject('const SW=548, SH=392, OX=274, OY=108, TWH=32, THH=16, ZH=30;',
        'const SW=1600, SH=720, OX=800, OY=574, TWH=80, THH=1.45, ZH=38;');
 inject('function P3(x,y,z){ z=z||0; return [OX+(x-y)*TWH, OY+(x+y)*THH - z*ZH]; }',
        'function P3(x,y,z){ return window.BFRoom?.projection?.(x,y,z)||[OX+(x-y)*TWH, OY+(x+y)*THH-(z||0)*ZH]; }');
 inject("function camTarget(){ const w=VIEW.w, h=VIEW.h, s=VIEW.s, wide=document.getElementById('app').classList.contains('wide');",
        "function camTarget(){ const bf=window.BFRoom?.cameraTarget?.(VIEW,S);if(bf)return bf; const w=VIEW.w, h=VIEW.h, s=VIEW.s, wide=document.getElementById('app').classList.contains('wide');");
 inject('let st=shotTarget(), moved=false;',
        'let st=window.BFRoom?.active?null:shotTarget(), moved=false;');
 inject('const t=shotTarget()||camTarget(); VIEW.ox=t[0];',
        'const t=(window.BFRoom?.active?null:shotTarget())||camTarget(); VIEW.ox=t[0];');
 inject('VIEW.s0=wide?Math.min(w/SW,(h-reserve)/SH):tabPortrait?Math.min(w/SW*.95,h/SH*.95):Math.min(w/SW*1.7,h/SH);',
        'VIEW.s0=window.BFRoom?.scale?.(w,h,app)??(wide?Math.min(w/SW,(h-reserve)/SH):tabPortrait?Math.min(w/SW*.95,h/SH*.95):Math.min(w/SW*1.7,h/SH));');
 inject('function placePins(){ OBJ_ORDER.forEach(id=>{',
        'function placePins(){ if(window.BFRoom?.placePins?.(VIEW,S,OBJECTS))return; OBJ_ORDER.forEach(id=>{');
 inject("function drawScene(t){ const L=S.flat.look, vis=S.mode==='visit';",
        "function drawScene(t){ if(window.BFRoom?.render?.({ctx,VIEW,S,P,C,drawFigure,simOpts,npcOpts,simFoot}))return; const L=S.flat.look, vis=S.mode==='visit';");
 // Retain all 7.1 narrative and cinema bridges.
 // The authored action engine still calls goTo(pt,cb), while the 8.0
 // resident-only route layer controls pixel-space travel to the furniture.
 inject('function goTo(pt,cb){',
  'function goTo(pt,cb){if(window.BFNavigation?.goTo?.(S,pt,cb,OBJECTS))return;');
 inject('function stepSim(dt){ const s=S.sim;',
  'function stepSim(dt){ const s=S.sim; if(window.BFNavigation?.step?.(S,dt))return;');
 // Explicitly discard any old route when a flat is restarted.
 inject('function resetSim(){ const s=S.sim;',
  'function resetSim(){ window.BFNavigation?.cancel?.(S); const s=S.sim;');
 inject('S.queued=null; applyStart(); }',
  'S.queued=null; applyStart();window.BFNavigation?.reset?.(S);window.BFStageSync?.reset?.(S); }');
 inject('function choose(m){','function choose(m){window.BFStageSync?.begin?.(m,S);window.BFRoom?.approach?.(m);window.BFCinema?.approach?.(m);window.BFArt?.intent?.(m);');
 inject('function finishAction(m,sealed){','function finishAction(m,sealed){window.BFStageSync?.finish?.(m,sealed,S);window.BFDifficulty?.recordAction?.(m,sealed,S);window.BFCinema?.resolve?.(m,sealed);window.BFArt?.resolve?.(m,sealed);');
 inject('const key=dirKey(m);',`const key=dirKey(m);
    if(!key && m.st!=='sealed' && !m.a.walk && window.BFCinema?.cameraAllowed)
      dirRun([{shot:'near',focus:['sim',m.obj],spot:m.obj,hold:2.4},DIR_END]);`);
 // Only phone call/message gestures need enough display time to reach, lift,
 // hold and put the handset back down. Do not alter story outcomes, saves,
 // the authored state-specific costs, or the duration of other actions.
 inject('s.onDone=()=>finishAction(m,false); if(key) dirRun(',
   `if(m.obj==='phone'&&['call','msg'].includes(m.a.id))
      s.dur=Math.max(s.dur,m.a.id==='call'?4.1:3.5);
    // Physical choreography: a sofa descent, a small cooking sequence and
    // a brushstroke need more than the one-second generic action. Limit
    // this pacing pass to Noor's rendered flat, not clinical story logic.
    if(S.flat?.id==='rooted'){
      if(m.obj==='sofa')s.dur=Math.max(s.dur,2.35);
      if(m.obj==='stove'&&['fry','cook','two'].includes(m.a.id))
        s.dur=Math.max(s.dur,3.55);
      if(m.obj==='easel'&&m.a.id==='paint')s.dur=Math.max(s.dur,3.7);
    }
    s.onDone=()=>finishAction(m,false); if(key) dirRun(`);
 // The original pointer hold and three-activation threshold remain in place.
 // Keyboard-generated clicks also count as activations; no hidden keyboard timer.
 // Only authored checks can bypass the requirement after the player opts to roll or skip.
 inject("if(m.st==='heavy'){ if(!t.dataset.held){",
   "if(m.st==='heavy'){ if(t.dataset.bfBypass==='1'||((document.body.classList.contains('cl-route')||window.BFFlags?.guided)&&window.BFFlags?.heavyHold!==true)){choose(m);return;} if(!t.dataset.held){");
 // Compatibility fallback for other residents: their existing A* grid is untouched.
 inject('s.path=findPath([s.x,s.y],pt);',`s.path=findPath([s.x,s.y],pt);
  s.path=window.BFMotion?.smoothPath?.([s.x,s.y],s.path,losClear)||s.path;
  window.BFMotion?.onPath?.(s,s.path);`);
 inject('function stepSim(dt){ const s=S.sim; if(window.BFNavigation?.step?.(S,dt))return;',`function stepSim(dt){ const s=S.sim; if(window.BFNavigation?.step?.(S,dt))return; window.BFMotion?.beforeStep?.(s,dt);`);
 inject('let left=lerp(2.7,base,amt)*dt;',`let left=window.BFMotion?.travel?.(s,dt,lerp(2.7,base,amt))??(lerp(2.7,base,amt)*dt);`);
 // The new 7.3 visual rig replaces the character art only. A direct fallback
 // to the full native figure remains for ghost silhouettes or user preference.
 inject('function drawFigure(fx,fy,o){',
  'function drawFigure(fx,fy,o){if(window.BFRig?.drawActor?.(ctx,fx,fy,o,{S,C,P})||window.BFArt?.drawActor?.(ctx,fx,fy,o,{S,C,P}))return;');
 inject('function drawHead(x,y,o){',
  'function drawHead(x,y,o){if(window.BFArt?.drawHead?.(ctx,x,y,o,{S,C}))return;');
 // Furniture animations use the same isometric coordinates as the original
 // objects, so the characters still physically meet their affordances.
 inject("cyl(5.55,.17,1.96,.08,.14,'#f2b632');",
  "cyl(5.55,.17,1.96,.08,.14,'#f2b632');window.BFArt?.kitchen?.(ctx,{S,P3,C});");
 inject("if(np) drawFigure(A[0],A[1],npcOpts());",
  "window.BFArt?.sofa?.(ctx,{S,P3,C});if(np) drawFigure(A[0],A[1],npcOpts());");
 // The handset leaves the table only when the character actually lifts it.
 inject('const ring=S.ringing, wob=ring?Math.sin(t*38)*.02:0;',
  'const ring=S.ringing, wob=ring?Math.sin(t*38)*.02:0; if(!window.BFArt?.holdingPhone?.(S)){');
 inject("ctx.lineWidth=2; ctx.stroke(); } }\n  }\n};\n\n/* ---------- the tenant ---------- */",
  "ctx.lineWidth=2; ctx.stroke(); } }\n    }\n  }\n};\n\n/* ---------- the tenant ---------- */");
 // Only change the animated protagonist in the renderer; leave seats/NPCs alone.
 // Attach gesture and eased gait to the return value, without changing postureOf.
 const simStart=html.indexOf('function simOpts(){');
 const simEnd=html.indexOf('function npcOpts(){',simStart);
 if(simEnd<0||simEnd-simStart>850)throw Error('simOpts renderer changed');
 const simBody=html.slice(simStart,simEnd);
 if(!simBody.includes('return Object.assign(')||!simBody.includes('postureOf(a,amt));'))throw Error('simOpts format changed');
 html=html.slice(0,simStart)+simBody.replace('return Object.assign(','return window.BFMotion?.actorOptions?.(Object.assign(').replace('postureOf(a,amt));','postureOf(a,amt)),s)||Object.assign({char:vis?VISITOR:S.flat.char,scale:vis?0:(S.flat.char.scale||0),face:s.face,flip:s.flip,ph:s.ph,moving:s.path.length>0,pose:s.pose},postureOf(a,amt));')+html.slice(simEnd);
 // A small visual size adjustment for the protagonist while standing, preserving
 // the furniture's own seat/bed drawing and the shadow's floor anchor.
 inject('ctx.save(); ctx.translate(fx,fy); if(o.scale) ctx.scale(o.scale,o.scale);',
  `ctx.save(); ctx.translate(fx,fy); if(o.scale) ctx.scale(o.scale,o.scale);
  if(o.bfMainActor && o.pose==='stand')ctx.scale(.955,.955);`);
 inject('sw=mv?Math.sin(o.ph)*4*(1-.6*(o.stiff||0)):0',
  'sw=mv?Math.sin(o.ph)*4*(1-.6*(o.stiff||0))*(o.bfStride??1):0');
 inject('bob=mv?-Math.abs(Math.sin(o.ph))*1.6*(1-(o.stiff||0))',
  'bob=mv?-Math.abs(Math.sin(o.ph))*1.6*(1-(o.stiff||0))*(o.bfStride??1)');
 const arm=`rr(8.9+jx+sw*.5,ty+3+au,5.6,18,2.8); fill(ch.shirt); if(!g){ ctx.beginPath(); ctx.arc(11.7+jx+sw*.5,ty+21.5+au,3,0,7); ctx.fillStyle=C(ch.skin); ctx.fill(); }`;
 inject(arm,`ctx.save();
  if(o.bfGesture){const ox=11.7+jx+sw*.5,oy=ty+5+au;
    ctx.translate(ox,oy);ctx.rotate(-o.bfGesture*.9);ctx.translate(-ox,-oy);}
  ${arm}
  ctx.restore();`);
 const version=require('./package.json').version, css=['dice','ui','story','cinema','movement','art','sprite_rig','patterns','interaction','room'], js=['flags','patterns','difficulty','story','dice','ui','cinema','movement','art','sprite_rig','interaction','room','navigation','sync'];
 html=html.replace(/<\/head\s*>/i,'<link rel="preload" as="image" type="image/webp" href="assets/noor_atlas.webp">\n'+css.map(n=>`<link rel="stylesheet" href="${n}.css?v=${version}">`).join('\n')+'\n</head>');
 html=html.replace(/<\/body\s*>/i,js.map(n=>`<script defer src="${n}.js?v=${version}"></script>`).join('\n')+'\n</body>');
 html=html.replace('Being Found 6.7 ·',`Being Found ${version} ·`);
 fs.mkdirSync('dist',{recursive:true});fs.writeFileSync('dist/index.html',html);
 for(const n of css)fs.copyFileSync(n+'.css',path.join('dist',n+'.css'));
 for(const n of js)fs.copyFileSync(n+'.js',path.join('dist',n+'.js'));
 fs.mkdirSync(path.join('dist','assets'),{recursive:true});for(const char of ['noor','dele','tomas'])for(const ext of ['atlas.webp','atlas.json','rig.glb']){const n=char+'_'+ext,from=path.join('assets',n);if(fs.existsSync(from))fs.copyFileSync(from,path.join('dist','assets',n));else if(ext==='atlas.webp')throw Error('Missing sprite atlas: '+n);else console.warn('Optional asset not found, skipped: '+n);}
 console.log(`Being Found ${version} built: ${html.length} bytes`);
})().catch(e=>{console.error(e);process.exit(1)});