/* Story runtime: the scripting API used by chapters, free exploration, input, saving and menus. */
'use strict';
BF.story = (() => {
  const W = BF.world, ui = BF.ui, au = BF.audio, st = BF.state, set = BF.settings;
  const ABORT = {abort: true};
  let gen = 0, locked = false, exploring = null, day = 'Saturday';
  const chapters = [];
  const check = g => { if (g !== gen) throw ABORT; };

  /* ---------- the scripting API ---------- */
  const G = {
    get W() { return W; },
    actor: id => W.actors[id],
    get player() { return W.player; },
    async scene(loc, o = {}) {
      const g = gen; W.load(loc, {light: o.light, state: o.state, cam: o.cam});
      Object.entries(o.actors || {}).forEach(([id, a]) => {
        const ac = W.addActor(id, a);
        if (a.sit) G.sitNow(id, a.sit); if (a.lie) { ac.lying = a.lie; }
      });
      if (o.player) W.player = W.actors[o.player];
      if (o.day) day = o.day;
      if (o.time) G.time(...o.time);
      ui.hud(o.who ?? (W.player ? W.player.ch.name : ''), undefined); G.time();
      if (o.amb !== undefined) au.ambience(o.amb, o.ambExtra);
      if (o.music !== undefined) au.music(o.music);
      W.cam.user = 1; W.camReset(); W.fitCamera(true);
      check(g);
    },
    time(h, m) { if (h !== undefined) W.clockMin = h * 60 + (m || 0); const mm = W.clockMin % 60, hh = Math.floor(W.clockMin / 60) % 24; const ap = hh < 12 ? 'a.m.' : 'p.m.', h12 = ((hh + 11) % 12) + 1; ui.hud(undefined, `${day} · ${h12}:${String(mm).padStart(2, '0')} ${ap}`); },
    addTime(min) { W.clockMin += min; G.time(); },
    setDay(d) { day = d; G.time(); },
    async wait(s) { const g = gen; await BF.time.wait(s); check(g); },
    async walk(id, x, y) { const g = gen; const a = W.actors[id]; if (a.seated) G.standNow(id); await W.walkTo(a, x, y); check(g); },
    async walkObj(id, obj) { const o = W.objects[obj]; await G.walk(id, ...o.spot); G.face(id, o.face); },
    face(id, t) {
      const a = W.actors[id]; if (!a) return;
      if (typeof t === 'string' && t.length === 2) a.dir = t;
      else { let p = null; if (Array.isArray(t)) p = t; else if (W.actors[t]) p = [W.actors[t].x, W.actors[t].y]; else if (W.objects[t]) p = W.objCenter(W.objects[t]); if (p) a.dir = W.faceDir(p[0] - a.x, p[1] - a.y); }
    },
    async anim(id, pose, sec, o = {}) { const g = gen; const a = W.actors[id]; const prev = a.pose; const pa = a.arm; if (a.seated) a.arm = pose; else a.pose = pose; if (o.item !== undefined) a.item = o.item; await BF.time.wait(sec); check(g); if (o.keep) return; if (a.seated) a.arm = pa; else a.pose = prev === 'walk' ? 'stand' : (/^sit/.test(prev) ? prev : 'stand'); if (o.item !== undefined && !o.keepItem) a.item = null; },
    pose(id, pose, o = {}) { const a = W.actors[id]; if (a.seated && !/^sit/.test(pose)) a.arm = pose; else a.pose = pose; if (o.item !== undefined) a.item = o.item; },
    expr(id, e) { W.actors[id].expr = e; },
    sitNow(id, key) { const s = W.loc.seats[key], a = W.actors[id]; a.x = s.x; a.y = s.y; a.dir = s.dir; a.seat = s.seat; a.seated = key; a.pose = s.pose || 'sit'; a.path = []; a.lying = null; a.visible = true; },
    standNow(id) { const a = W.actors[id]; if (!a.seated && !a.lying) return; a.seated = null; a.lying = null; a.pose = 'stand'; a.arm = null; const p = W.nearestWalkable(a.x + .6, a.y + .6); a.x = p[0]; a.y = p[1]; },
    async sit(id, key) { const s = W.loc.seats[key]; const p = W.nearestWalkable(s.x + .7, s.y + .7); await G.walk(id, p[0], p[1]); au.sfx('chair'); G.sitNow(id, key); await G.wait(.3); },
    async stand(id) { G.standNow(id); au.sfx('chair'); await G.wait(.25); },
    lie(id, furn) { const a = W.actors[id]; a.lying = furn; a.seated = null; a.path = []; au.sfx('rustle'); },
    set: (id, patch) => W.st(id, patch),
    get: id => W.state[id] || {},
    flag: (k, v = true) => st.set(k, v), is: k => st.get(k), inc: (k, n) => st.inc(k, n), val: k => st.get(k),
    sfx: (n, o) => au.sfx(n, o), music: n => au.music(n), amb: (n, x) => au.ambience(n, x),
    async say(id, text, o = {}) {
      const g = gen; const a = W.actors[id];
      if (a && o.expr) a.expr = o.expr;
      if (a && o.to) G.face(id, o.to);
      if (a && o.pose) G.pose(id, o.pose);
      await ui.say(id, text, o); check(g);
      if (a && o.pose && !o.keepPose) G.pose(id, a.seated ? 'sit' : 'stand');
    },
    async think(text, o = {}) { const g = gen; await ui.say(null, text, {...o, thought: true, name: o.name || (W.player ? W.player.ch.name : '')}); check(g); },
    async narrate(text, o = {}) { const g = gen; await ui.say(null, text, o); check(g); },
    async choose(prompt, options, o = {}) {
      const g = gen; const opts = options.filter(x => !x.when || x.when()); if (!o.speaker && o.name === undefined && W.player) o = {...o, name: W.player.ch.name};
      const id = await ui.say(o.speaker || null, prompt, {...o, choices: opts, thought: o.thought, name: o.name}); check(g); return id;
    },
    close() { ui.closeDlg(); },
    async caption(text, o = {}) { const g = gen; await ui.caption(text, o); check(g); },
    thought(text, o = {}) { ui.caption(text, {thought: true, ...o}); },
    async phone(o) { const g = gen; ui.closeDlg(); const r = await ui.phone({clock: ui.el().time.textContent.split('·')[1] || '', ...o}); check(g); return r; },
    async fade(to = 1, s) { const g = gen; await ui.fade(to, s); check(g); },
    focus(targets, zoom, speed) { const pts = targets.map(t => typeof t === 'string' ? (W.actors[t] ? [W.actors[t].x, W.actors[t].y, 2.2] : W.objCenter(W.objects[t])) : t); W.focusOn(pts, zoom, speed); },
    camReset() { W.camReset(); },
    note(id) { if (st.notebook.includes(id)) return; st.notebook.push(id); const p = BF.notebook.pages[id]; if (p) ui.toast(p.title, () => openNotebook(id, true)); },
    know(who, line) { const k = 'know_' + who; const arr = st.get(k) || []; if (!arr.includes(line)) arr.push(line); st.set(k, arr); },
    checkpoint(beat) { saveNow(st.chapter, beat); },
    lock(v) { locked = v; },
    reveal(sec = 3.5) { W.reveal = sec; },
    async explore(cfg) { return explore(cfg); },
    endExplore() { if (exploring) exploring.end(); },
    async title(html, ms) { const g = gen; await ui.title(html, ms); check(g); },
    async card(k, t, s, o) { const g = gen; await ui.card(k, t, s, o); check(g); },
    bars: on => ui.bars(on),
    get gen() { return gen; },
  };

  /* ---------- free exploration ---------- */
  function actsFor(o) { if (!exploring) return []; const f = exploring.cfg.acts[o.id]; if (!f) return []; const r = (typeof f === 'function' ? f() : f) || []; return r.filter(a => a && (!a.when || a.when())); }
  function refreshObjects() {
    if (!exploring) return;
    Object.values(W.objects).forEach(o => { o.hidden = !actsFor(o).length; });
    ui.setHotspots(Object.values(W.objects).filter(o => !o.hidden), openObj);
  }
  async function openObj(o) {
    if (locked || !exploring || ui.menuOpen) return;
    const list = actsFor(o); if (!list.length) return;
    const c = W.objCenter(o), sp = W.toScreen(c[0], c[1], c[2]);
    W.focusObj = o;
    const i = await ui.menu(o.name, list, sp);
    W.focusObj = null;
    if (i < 0) return;
    await runAction(o, list[i]);
  }
  async function runAction(o, a) {
    const g = gen; locked = true; ui.hidePrompt(); W.player.manual = null;
    try {
      if (a.walk !== false && (a.spot || o.spot)) { const s = a.spot || o.spot; await G.walk(W.player.id, s[0], s[1]); G.face(W.player.id, a.face || o.face); }
      await a.run();
    } catch (e) { if (e !== ABORT) console.error(e); }
    if (g !== gen) return;
    locked = false; ui.closeDlg(); refreshObjects();
    if (exploring && exploring.cfg.until && exploring.cfg.until()) exploring.end();
  }
  function explore(cfg) {
    return new Promise(res => {
      const g = gen;
      exploring = {cfg, end: () => { if (!exploring) return; exploring = null; W.exploring = false; Object.keys(W.objects).forEach(k => { if (k[0] === '@') delete W.objects[k]; }); ui.clearHotspots(); ui.hidePrompt(); Object.values(W.objects).forEach(o => o.hidden = false); W.player && (W.player.manual = null); res(); }};
      // talkable actors become objects whose box follows them
      Object.entries(cfg.people || {}).forEach(([id, name]) => { W.objects['@' + id] = {id: '@' + id, name, actor: id, box: [0, 0, 0, 0, 0, 0], spot: [0, 0], pri: 3}; cfg.acts['@' + id] = cfg.acts['@' + id] || cfg.acts[id]; });
      W.exploring = true; refreshObjects(); locked = false; ui.closeDlg();
      if (cfg.reveal !== false) W.reveal = 3;
      if (cfg.until && cfg.until()) exploring.end();
      if (cfg.hint) setTimeout(() => { if (g === gen && exploring && exploring.cfg === cfg && !locked) G.thought(cfg.hint); }, (cfg.hintAfter || 1.2) * 1000);
    });
  }
  function updatePeople() {
    if (!exploring) return;
    Object.values(W.objects).forEach(o => {
      if (!o.actor) return; const a = W.actors[o.actor]; if (!a) { o.hidden = true; return; }
      o.box = [a.x - .45, a.y - .45, a.x + .45, a.y + .45, 0, 3.3];
      const p = W.player; const dx = p.x - a.x, dy = p.y - a.y, d = Math.hypot(dx, dy) || 1;
      o.spot = W.nearestWalkable(a.x + dx / d * 1.3, a.y + dy / d * 1.3); o.face = W.faceDir(-dx, -dy);
    });
  }

  /* ---------- input ---------- */
  let down = null, keys = new Set(), lastStepPhase = 0, kbdMove = 0;
  function bindInput(cv) {
    cv.addEventListener('pointerdown', e => { down = {x: e.clientX, y: e.clientY, t: performance.now()}; ui.kbd = false; });
    cv.addEventListener('pointerup', e => { if (!down) return; const d = Math.hypot(e.clientX - down.x, e.clientY - down.y); if (d < 14 && performance.now() - down.t < 700) tap(e.clientX, e.clientY); down = null; });
    cv.addEventListener('pointermove', e => { if (e.pointerType !== 'mouse' || !exploring || locked) { if (W.hover) { W.hover = null; cv.style.cursor = ''; } return; } const o = W.pick(e.clientX, e.clientY); W.hover = o; cv.style.cursor = o ? 'pointer' : ''; if (o) ui.showPrompt(o); else if (!W.focusObj) ui.hidePrompt(); });
    cv.addEventListener('wheel', e => { if (!W.loc) return; W.cam.user = BF.u.clamp((W.cam.user || 1) * (e.deltaY > 0 ? .92 : 1.08), .8, 1.8); e.preventDefault(); }, {passive: false});
    addEventListener('keydown', onKey); addEventListener('keyup', e => { keys.delete(e.key.toLowerCase()); updateManual(); });
    addEventListener('blur', () => { keys.clear(); updateManual(); });
  }
  function tap(x, y) {
    if (ui.menuOpen) { ui.menuOpen(-1); return; }
    if (ui.takeKey()) return; // tap advances captions/dialogue
    if (!exploring || locked || !W.player) return;
    const o = W.pick(x, y);
    if (o) { openObj(o); return; }
    const f = W.toWorldFloor(x, y);
    if (f[0] < -1 || f[1] < -1 || f[0] > W.loc.w + 1 || f[1] > W.loc.d + 1) return;
    const p = W.nearestWalkable(BF.u.clamp(f[0], .4, W.loc.w - .4), BF.u.clamp(f[1], .4, W.loc.d - .4));
    W.walkTo(W.player, p[0], p[1]);
    W.emit('spark', p[0], p[1], .05, 1, {vz: 0, life: .5, size: 1.4, color: 'rgba(255,240,200,.7)'});
  }
  function onKey(e) {
    const k = e.key.toLowerCase();
    if (k === 'tab') { ui.kbd = true; if (ui.trapTab(e)) return; return; }
    if (k === 'escape') { e.preventDefault(); if (ui.menuOpen) { ui.menuOpen(-1); return; } if (ui.screen) { if (ui.screen === 'pause' || ui.screen === 'screen' || ui.screen === 'notebook' || ui.screen === 'settings') backFromScreen(); return; } openPause(); return; }
    if (ui.screen) return;
    if (/^[1-9]$/.test(k) && ui.keyChoice(+k - 1)) { e.preventDefault(); return; }
    if ((k === 'enter' || k === ' ') && !(document.activeElement && document.activeElement.closest('#actions,#screen,#dialogue .choice,#phone,#hotspots,#hud,#toast'))) { if (ui.takeKey()) { e.preventDefault(); return; } }
    if (k === 'e' && exploring && !locked) { const o = nearestObj(); if (o) { e.preventDefault(); openObj(o); } return; }
    if (k === 'q') { W.reveal = 3.5; return; }
    if (k === 'n' && !e.ctrlKey && !e.metaKey) { openNotebook(); return; }
    if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)) { if (document.activeElement && /INPUT|SELECT/.test(document.activeElement.tagName)) return; keys.add(k); updateManual(); if (k.startsWith('arrow')) e.preventDefault(); }
  }
  function updateManual() {
    if (!W.player) return;
    let sx = 0, sy = 0;
    if (keys.has('w') || keys.has('arrowup')) sy -= 1; if (keys.has('s') || keys.has('arrowdown')) sy += 1;
    if (keys.has('a') || keys.has('arrowleft')) sx -= 1; if (keys.has('d') || keys.has('arrowright')) sx += 1;
    if (!exploring || locked || ui.dlgOpen() || ui.screen) { W.player.manual = null; return; }
    // screen direction to world: right = (+x,-y), down = (+x,+y)
    let vx = sx + sy, vy = -sx + sy; const n = Math.hypot(vx, vy);
    W.player.manual = n ? [vx / n, vy / n] : [0, 0]; if (n) { kbdMove = 3; W.player.path = []; }
  }
  function nearestObj() {
    let best = null, bd = 2.1; const p = W.player;
    Object.values(W.objects).forEach(o => { if (o.hidden || !o.spot) return; const d = Math.hypot(o.spot[0] - p.x, o.spot[1] - p.y); if (d < bd) { bd = d; best = o; } });
    return best;
  }

  /* ---------- frame ---------- */
  function frame(dt) {
    updatePeople();
    const p = W.player;
    if (p && p.pose === 'walk' && p.visible) { const ph = Math.floor(p.phase / Math.PI); if (ph !== lastStepPhase) { lastStepPhase = ph; au.sfx('step', {street: W.loc.type === 'exterior'}); } }
    if (kbdMove > 0) { kbdMove -= dt; if (exploring && !locked && !W.hover && !W.focusObj) { const o = nearestObj(); if (o) ui.showPrompt(o, 'E'); else ui.hidePrompt(); } }
  }

  /* ---------- saving ---------- */
  let chapterEntries = {};
  function saveNow(chapter, from) { if (!chapter) return; const snap = st.snapshot(); BF.save.write({chapter, from: from || null, state: snap, chapterEntries}); }

  /* ---------- chapter flow ---------- */
  function register(ch) { chapters.push(ch); }
  async function play(index, from) {
    const g = ++gen; hideAll();
    ui.showHud(true);
    for (let i = index; i < chapters.length; i++) {
      const ch = chapters[i]; st.chapter = ch.id;
      if (!from) chapterEntries[ch.id] = st.snapshot();
      saveNow(ch.id, from);
      try { await ch.run(G, from); } catch (e) { if (e === ABORT) return; console.error(e); }
      if (g !== gen) return;
      from = null;
      if (!st.completed.includes(ch.id)) st.completed.push(ch.id);

    }
    saveNow('complete', null);
    titleScreen();
  }
  function hideAll() {
    exploring = null; W.exploring = false; locked = false; ui.closeDlg(); ui.clearHotspots(); ui.hidePrompt(); ui.clearCaption(); ui.bars(false);
    if (ui.menuOpen) ui.menuOpen(-1);
    BF.time.waits = []; BF.time.paused = false;
    const ph = ui.el().phone; ph.classList.remove('show'); ph.innerHTML = '';
  }
  // Older saves have no chapter-entry snapshot. Carry forward only facts
  // that an earlier chapter could have established and a later scene uses.
  const legacyCarry = {
    noor: ['pastry', 'twoKnots', 'hasBooks', 'hasSign'],
    door: ['deleOutcome', 'deleKnocked', 'madeTea', 'gaveKnot', 'bagOnMat', 'washed', 'noteText'],
    leena: ['leenaDecision', 'noorDoorDisclosure'],
    dele: ['deleReply', 'openedCurtains'],
  };
  // Witness lines in saves predating chapter-entry snapshots had no source ID.
  const legacyWitnessLines = {
    noor: [
      "Is painting the whole street, window by window.",
      "Walks the long loop with Noor on Saturday mornings. Has been texting Dele.",
      "Runs the community library. Asked Noor to paint a sign for the reading corner.",
      "Lives across the landing from Noor. Laughing outside Ferro’s in a photo from last spring.",
      "His lamp was on late into the night, and on again in the morning.",
      "His bike has had a flat tyre since August.",
      "Usually comes into Ferro’s. Sami has noticed he hasn’t.",
      "Hand-lettered the gold sign on Ferro’s window three summers ago. The F has started to lift.",
      "Has skipped the Saturday walk three weeks running. Tells Mara he’s tired.",
      "Is a speech-language pathologist. Has a home visit with a retired woodwork teacher on Tuesday.",
    ],
    door: [
      "Opened the door when Noor knocked.",
      "Keeps his curtains closed. The lamp by the window stays on during the day.",
      "“I know I could go outside. I just don’t know what I’d be going out for.”",
      "Notices old hand-painted shop signs. Said he “used to”.",
    ],
    leena: [
      "Works Saturday afternoons at Linden Library.",
      "Taught the school woodshop class that built the library’s bench in 1998.",
      "Her friend Nia invited her to a lake weekend on the 14th.",
      "Lives with bipolar disorder. Says it is part of her history, and not the reason for everything.",
      "Told Leena about the knock, and no more than that.",
    ],
    walt: [
      "Walt’s wife. Told Mara that Walt “stopped trying” with his picture cards.",
      "Spends hours in his workshop since the stroke.",
      "Retired woodwork teacher. Has aphasia after a stroke four months ago.",
      "His granddaughter Rosie turns one on Sunday.",
      "Wants to say something to Rosie himself at her first birthday.",
      "Made a card for Rosie’s birthday: ROSIE · ONE YEAR · LOVED. Says he says it “badly”.",
    ],
  };
  function legacyEntry(save, index) {
    const earlier = chapters.slice(0, index).map(ch => ch.id);
    const flags = {};
    for (const id of earlier) {
      for (const key of legacyCarry[id] || []) {
        if (Object.hasOwn(save.state.flags || {}, key)) flags[key] = save.state.flags[key];
      }
    }
    const witnessed = new Set(earlier.flatMap(id => legacyWitnessLines[id] || []));
    for (const [key, value] of Object.entries(save.state.flags || {})) {
      if (key.startsWith('know_') && Array.isArray(value)) flags[key] = value.filter(line => witnessed.has(line));
    }
    // These optional essays persist across new stories, independently of witness records.
    return {flags, completed: (save.state.completed || []).filter(id => earlier.includes(id)),
      notebook: save.state.notebook || ['about'], log: []};
  }
  function startChapter(id) {
    const i = chapters.findIndex(c => c.id === id); if (i < 0) return;
    ui.closeScreen();
    const save = BF.save.read();
    chapterEntries = {...save?.chapterEntries};
    if (save?.state) {
      const entry = chapterEntries[id] || (save.chapter === id && !save.from
        ? save.state : legacyEntry(save, i));
      // Essays are persistent discoveries; witness flags and dialogue remain route-specific.
      const earned = [...new Set([...(entry.notebook || []), ...(save.state.notebook || [])])];
      st.restore(structuredClone({...entry, notebook: earned}));
      for (const later of chapters.slice(i)) delete chapterEntries[later.id];
    } else if (chapters[i].defaults) {
      Object.entries(chapters[i].defaults).forEach(([k, v]) => st.set(k, v));
    }
    ui.fade(1, .3).then(() => { play(i, null); });
  }
  function resumeCheckpoint(save) {
    const index = chapters.findIndex(chapter => chapter.id === save.chapter);
    if (index < 0 || !save.state) return;
    au.init();
    chapterEntries = {...save.chapterEntries};
    st.restore(structuredClone(save.state));
    ui.closeScreen();
    ui.fade(1, .4).then(() => play(index, save.from));
  }
  function skipChapter(id) {
    const i = chapters.findIndex(c => c.id === (id || st.chapter)); if (i < 0) return;
    if (chapters[i].defaults) Object.entries(chapters[i].defaults).forEach(([k, v]) => { if (st.get(k) === undefined) st.set(k, v); });
    if (chapters[i].onSkip) chapters[i].onSkip(G);
    if (!st.completed.includes(chapters[i].id)) st.completed.push(chapters[i].id);
    if (i + 1 < chapters.length) { gen++; hideAll(); ui.fade(1, .3).then(() => play(i + 1, null)); } else { gen++; hideAll(); titleScreen(); }
  }

  /* ---------- menus ---------- */
  function titleScreen() {
    gen++; hideAll(); ui.showHud(false); BF.time.paused = false;
    W.load('street', {light: 'dusk'}); W.actors = {}; W.player = null;
    W.st('win2B', {lit: true}); W.st('win2C', {lit: true});
    W.focusOn([[12.5, 1, 6]], 1, 1);
    W.cam.focusZ = W.cam.fitZ * (innerWidth < 600 ? 1.35 : 1.05);
    W.fitCamera(true); const narrow = innerWidth < 600; W.cam.x = W.cam.tx = BF.iso.P(narrow ? 14 : 13, 1, 0)[0]; W.cam.y = W.cam.ty = BF.iso.P(13, 1, narrow ? 1 : 6)[1] + (narrow ? 140 : 0);
    W.cam.mode = 'focus'; W.cam.focus = [W.cam.x, W.cam.y];
    au.ambience('streetNight'); au.music('title');
    ui.fade(0, 1.2);
    const save = BF.save.read();
    const ch = save && save.state && chapters.find(c => c.id === save.chapter);
    const can = !!ch;
    ui.openScreen(`<div class="title">
      <div class="title-k">A story in five rooms and one street</div>
      <h1>Being Found</h1>
      <p class="title-line">Every window holds a life you have only partly seen.</p>
      <div class="title-menu">
        ${can ? `<button type="button" class="btn big" data-x="cont" autofocus>Continue<span class="sub">${ch ? BF.u.esc(ch.title) : ''}</span></button>` : ''}
        <button type="button" class="btn ${can ? 'ghost' : 'big'}" data-x="new" ${can ? '' : 'autofocus'}>New story</button>
        <button type="button" class="btn ghost" data-x="chapters">Chapters</button>
        ${st.notebook.length || (save && save.state && save.state.notebook && save.state.notebook.length) ? '<button type="button" class="btn ghost" data-x="notebook">Notebook</button>' : ''}
        <button type="button" class="btn ghost" data-x="settings">Settings</button>
        <button type="button" class="btn ghost" data-x="about">About</button>
      </div>
      <p class="title-foot">Headphones recommended. Tap or click to move and interact; keyboard works too.</p>
    </div>`, {
      cont: () => resumeCheckpoint(save),
      new: () => { au.init(); if (can) confirmNew(); else newStory(); },
      chapters: () => { au.init(); chapterScreen('title'); },
      notebook: () => { if (save?.state) st.restore(structuredClone(save.state)); openNotebook(null, false, 'title'); },
      settings: () => settingsScreen('title'), about: () => aboutScreen('title'),
    }, {name: 'title', cls: 'title-scr'});
    document.addEventListener('pointerdown', () => au.init(), {once: true});
  }
  function confirmNew() {
    ui.openScreen(`<div class="scr-card narrow"><h2>Start a new story?</h2><p>Your current place in the story will be replaced. Notebook pages you have found stay.</p><div class="row"><button type="button" class="btn" data-x="yes">Start again</button><button type="button" class="btn ghost" data-x="no" autofocus>Keep my place</button></div></div>`, {yes: newStory, no: titleScreen});
  }
  function newStory() { chapterEntries = {}; const nb = [...new Set([...st.notebook, ...(BF.save.read()?.state?.notebook || [])])]; st.reset(); st.notebook = nb; ui.closeScreen(); ui.fade(1, .6).then(() => play(0, null)); }
  let screenFrom = null;
  function backFromScreen() { if (screenFrom === 'title') titleScreen(); else if (screenFrom === 'pause') openPause(); else resume(); }
  function openPause() {
    if (!W.loc || !st.chapter || ui.screen === 'title') return;
    BF.time.paused = true; screenFrom = null;
    ui.openScreen(`<div class="scr-card narrow"><h2>Paused</h2><p class="muted">${BF.u.esc((chapters.find(c => c.id === st.chapter) || {}).title || '')}</p><div class="col">
      <button type="button" class="btn" data-x="resume" autofocus>Resume</button>
      <button type="button" class="btn ghost" data-x="notebook">Notebook</button>
      <button type="button" class="btn ghost" data-x="history">Recent lines</button>
      <button type="button" class="btn ghost" data-x="settings">Settings</button>
      <button type="button" class="btn ghost" data-x="chapters">Chapters</button>
      <button type="button" class="btn ghost" data-x="quit">Save and return to title</button></div>
      <p class="muted small">Your place is saved at the start of each chapter and at major scene changes.</p></div>`, {
      resume, notebook: () => openNotebook(null, false, 'pause'), history: () => historyScreen(), settings: () => settingsScreen('pause'), chapters: () => chapterScreen('pause'), quit: () => { ui.closeScreen(); titleScreen(); },
    }, {name: 'pause'});
  }
  function resume() { ui.closeScreen(); BF.time.paused = false; screenFrom = null; }
  function settingsScreen(from) { screenFrom = from; ui.openScreen(ui.settingsHTML(), {back: () => backFromScreen()}, {name: 'settings'}); ui.bindSettings(); }
  function historyScreen() {
    screenFrom = 'pause';
    const lines = st.log.slice(-40).map(l => `<li>${l.who ? `<b>${BF.u.esc(l.who)}</b> ` : ''}${BF.u.esc(l.text)}</li>`).join('') || '<li class="muted">Nothing yet.</li>';
    ui.openScreen(`<div class="scr-card"><h2>Recent lines</h2><ol class="hist">${lines}</ol><div class="row"><button type="button" class="btn" data-x="back" autofocus>Back</button></div></div>`, {back: backFromScreen}, {name: 'screen'});
    const h = document.querySelector('.hist'); if (h) h.scrollTop = h.scrollHeight;
  }
  function chapterScreen(from) {
    screenFrom = from;
    const save = BF.save.read(); const done = new Set((save && save.state && save.state.completed) || st.completed);
    const cur = save && save.chapter;
    const items = chapters.filter(c => c.number !== undefined).map((c, i) => {
      const open = done.has(c.id) || c.id === cur || i === 0;
      const atCheckpoint = c.id === cur && !done.has(c.id);
      return `<li class="chap ${open ? '' : 'locked'}"><div><span class="ck">${BF.u.esc(c.kicker)}</span><span class="ct">${BF.u.esc(c.title)}</span><span class="cw">${BF.u.esc(c.when || '')}</span>${c.content ? `<span class="cn">${BF.u.esc(c.content)}</span>` : ''}</div>${open ? `<button type="button" class="btn small" data-x="${atCheckpoint ? 'resume' : 'go'}" data-id="${c.id}">${atCheckpoint ? 'Resume' : 'Play'}</button>` : '<span class="muted small">Not yet reached</span>'}</li>`;
    }).join('');
    ui.openScreen(`<div class="scr-card wide"><h2>Chapters</h2><p class="muted">Replaying a chapter keeps what happened before it.</p><ul class="chaps">${items}</ul><div class="row"><button type="button" class="btn ghost" data-x="back">Back</button></div></div>`, {
      back: backFromScreen, resume: () => resumeCheckpoint(save), go: b => { au.init(); startChapter(b.dataset.id); },
    }, {name: 'screen'});
  }
  function openNotebook(pageId, fromToast, from) {
    if (fromToast) { BF.time.paused = true; screenFrom = 'resume'; }
    else if (from) screenFrom = from; else if (!ui.screen) { BF.time.paused = true; screenFrom = 'resume'; }
    const pages = st.notebook.map(id => [id, BF.notebook.pages[id]]).filter(p => p[1]);
    const people = BF.notebook.people.map(p => {
      let lines = st.get('know_' + p.id) || [];
      if (p.id === 'noor') {
        // v1 saves may contain the old unconditional claim. It cannot establish
        // what she actually said; do not reconstruct disclosure from outcome.
        const old = 'Told Leena about the knock, and no more than that.';
        const hadOld = lines.includes(old);
        lines = lines.filter(line => line !== old);
        const disclosed = st.get('noorDoorDisclosure');
        if (Array.isArray(disclosed)) lines = lines.concat(disclosed);
        else if (hadOld) lines.push('Earlier saved conversation details are unavailable.');
      }
      return lines.length ? `<section class="person"><h4 style="color:${p.color}">${BF.u.esc(p.name)}</h4><ul>${lines.map(l => `<li>${BF.u.esc(l)}</li>`).join('')}</ul></section>` : '';
    }).join('');
    const list = pages.map(([id, p]) => `<button type="button" class="nb-item ${id === pageId ? 'on' : ''}" data-x="page" data-id="${id}"><span>${BF.u.esc(p.title)}</span><span class="muted small">${BF.u.esc(p.scene || '')}</span></button>`).join('') || '<p class="muted">Pages appear here as the story goes on. They are optional.</p>';
    const page = pageId && BF.notebook.pages[pageId];
    const view = page ? `<article class="nb-page"><div class="nb-k">${BF.u.esc(page.scene || '')}</div><h3>${BF.u.esc(page.title)}</h3>${page.body}${page.refs ? `<div class="nb-refs"><h5>Further reading</h5><ul>${page.refs.map(r => `<li>${r}</li>`).join('')}</ul></div>` : ''}</article>` : `<div class="nb-intro"><h3>Notebook</h3><p>Some of the ideas behind this story come from the philosopher Matthew Ratcliffe, who writes about how people find themselves in the world: what seems possible, familiar, or out of reach. These pages are here if you want them. The story never asks you to read them.</p>${people ? `<h4 class="nb-sub">What you have seen</h4>${people}` : ''}</div>`;
    ui.openScreen(`<div class="scr-card wide nb"><div class="nb-head"><h2>Notebook</h2><button type="button" class="btn small ghost" data-x="back">Close</button></div><div class="nb-grid"><nav class="nb-list"><button type="button" class="nb-item ${!pageId ? 'on' : ''}" data-x="home">Contents and people</button>${list}</nav><div class="nb-view" tabindex="0">${view}</div></div></div>`, {
      back: () => { if (screenFrom === 'resume') resume(); else backFromScreen(); }, page: b => { const keep = screenFrom; openNotebook(b.dataset.id, false, keep); setTimeout(() => { const v = document.querySelector('.nb-view'); v && v.focus({preventScroll: true}); }, 60); }, home: () => openNotebook(null, false, screenFrom),
    }, {name: 'notebook'});
  }
  function aboutScreen(from) {
    screenFrom = from;
    ui.openScreen(`<div class="scr-card"><h2>About Being Found</h2>
      <p>Being Found is a short narrative game about neighbours on one street. You spend a Saturday with Noor, visit her landing, work a library shift as Leena, spend an evening in Dele’s flat, and visit Walt with Mara.</p>
      <p>Its ideas come from Matthew Ratcliffe’s philosophy of “existential feeling”: the background sense of what is possible, familiar, and worth doing that shapes everything else. You can play without knowing any of that. The optional Notebook explains it if you want.</p>
      <p>Every character is fictional. Experiences of depression, bipolar disorder, and aphasia vary widely, and no chapter shows how any one person feels. Dele’s and Leena’s perspectives are authored stories, written with care, and not yet reviewed by people with lived experience.</p>
      <h3>Content</h3><p>The story touches on low mood and withdrawal (Dele), past mood episodes (Leena), and life after a stroke (Walt). There is no self-harm, no crisis, and no violence. Any chapter can be skipped.</p>
      <h3>Playing</h3><p>Tap or click a place to walk; tap things and people to see what you can do. On a keyboard: arrows or WASD to walk, E to interact, Q to show what you can interact with, N for the Notebook, Esc to pause. Tab reaches every object and button.</p>
      <p class="muted small">Story Edition ${BF.VERSION}. A story by Riley Reso.</p>
      <div class="row"><button type="button" class="btn" data-x="back" autofocus>Back</button></div></div>`, {back: backFromScreen}, {name: 'screen'});
  }
  async function credits() {
    ui.showHud(false); saveNow('complete', null);
    await ui.title(`<div class="cred"><h2>Being Found</h2><p>A story by Riley Reso</p></div>`, 4200);
    await ui.title(`<div class="cred"><p class="ck">With ideas from</p><p>Matthew Ratcliffe<br><i>Feelings of Being</i> (2008) · <i>Experiences of Depression</i> (2015)<br><i>Rethinking Commonsense Psychology</i> (2007)</p></div>`, 5200);
    await ui.title(`<div class="cred"><p>Noor, Dele, Mara, Leena, Walt and June are fictional.<br>Their lives go on past the edge of this story.</p></div>`, 5200);
  }

  const debug = {
    objects: () => exploring ? Object.values(W.objects).filter(o => !o.hidden).map(o => ({id: o.id, acts: actsFor(o).map(a => a.label)})) : null,
    act: (id, i) => { const o = W.objects[id]; const a = actsFor(o)[i]; if (a && !locked) runAction(o, a); return !!a; },
    get locked() { return locked; }, get exploring() { return !!exploring; },
  };
  return {G, register, chapters, play, debug, titleScreen, openPause, openNotebook, skipChapter, startChapter, credits, frame, bindInput, ABORT, get exploring() { return exploring; }, get locked() { return locked; }};
})();
