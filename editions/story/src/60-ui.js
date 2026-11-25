/* Interface: captions, dialogue, choices, object menus, the phone, chapter cards, Notebook, menus. */
'use strict';
BF.ui = (() => {
  const $ = s => document.querySelector(s);
  const esc = BF.u.esc, set = BF.settings;
  const U = {busy: false, screen: null};
  let el = {};
  const ICON = {
    eye: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="3.2" fill="currentColor"/></svg>',
    book: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4.5h6.5a2.5 2.5 0 0 1 2.5 2.5v13a2 2 0 0 0-2-2H4z M20 4.5h-6.5A2.5 2.5 0 0 0 11 7v13a2 2 0 0 1 2-2h7z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>',
    menu: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14M16 5v14" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>',
    next: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  };
  U.ICON = ICON;

  function init() {
    el = {
      app: $('#app'), hud: $('#hud'), who: $('#hudWho'), time: $('#hudTime'), hot: $('#hotspots'), prompt: $('#prompt'), actions: $('#actions'),
      caption: $('#caption'), sndcap: $('#sndcap'), dlg: $('#dialogue'), dlgName: $('#dlgName'), dlgText: $('#dlgText'), dlgChoices: $('#dlgChoices'), dlgNext: $('#dlgNext'), portrait: $('#portrait'),
      phone: $('#phone'), toast: $('#toast'), card: $('#card'), fade: $('#fade'), bars: $('#bars'), screen: $('#screen'), live: $('#live'),
    };
    $('#btnLook').innerHTML = ICON.eye; $('#btnNotebook').innerHTML = ICON.book; $('#btnPause').innerHTML = ICON.menu; el.dlgNext.innerHTML = ICON.next;
    applySettings(); set.on(applySettings);
    BF.audio.captions = t => soundCaption(t);
  }
  function applySettings() {
    document.documentElement.style.setProperty('--ts', set.get('textSize'));
    document.body.classList.toggle('reduced', set.reduced());
    document.body.classList.toggle('hc', !!set.get('highContrast'));
  }
  /* focus an element once its panel has finished appearing */
  U.focusSoon = (getEl, root) => { [30, 180, 420].forEach(ms => setTimeout(() => { const e = getEl(); if (!e) return; if (root && root.contains(document.activeElement) && document.activeElement !== document.body) return; e.focus({preventScroll: true}); }, ms)); };
  U.announce = t => { el.live.textContent = ''; setTimeout(() => el.live.textContent = t, 30); };

  /* ---------- HUD ---------- */
  U.hud = (who, time) => { if (who !== undefined) el.who.textContent = who; if (time !== undefined) el.time.textContent = time; };
  U.showHud = on => el.hud.classList.toggle('hidden', !on);

  /* ---------- captions (narration & thoughts) ---------- */
  let capTimer = null, capResolve = null;
  U.caption = (text, o = {}) => new Promise(res => {
    clearTimeout(capTimer); if (capResolve) capResolve();
    el.caption.className = 'caption show' + (o.thought ? ' thought' : '') + (o.place ? ' place' : '');
    el.caption.innerHTML = (o.label ? `<span class="cap-label">${esc(o.label)}</span>` : '') + `<span class="cap-text">${esc(text)}</span>` + (o.wait ? '<span class="cap-more" aria-hidden="true">' + ICON.next + '</span>' : '');
    U.announce(text);
    BF.state.log.push({who: o.label || (o.thought ? 'thought' : ''), text});
    const done = () => { clearTimeout(capTimer); el.caption.classList.remove('show'); capResolve = null; el.caption.onclick = null; res(); };
    capResolve = done;
    if (o.wait) { el.caption.onclick = done; U.waitKey(done); }
    else { const ms = (o.hold ? o.hold * 1000 : Math.max(2600, text.length * 55 + 1200) * (set.get('textSpeed') > 1.5 ? .7 : 1)) / (BF.time.scale || 1); capTimer = setTimeout(done, ms); el.caption.onclick = done; }
  });
  U.clearCaption = () => { if (capResolve) capResolve(); };
  let keyWaiter = null;
  U.waitKey = fn => { keyWaiter = fn; };
  U.takeKey = () => { const f = keyWaiter; keyWaiter = null; if (f) { f(); return true; } return false; };
  let sndTimer;
  function soundCaption(t) { el.sndcap.textContent = '[' + t + ']'; el.sndcap.classList.add('show'); clearTimeout(sndTimer); sndTimer = setTimeout(() => el.sndcap.classList.remove('show'), 2200); }

  /* ---------- dialogue ---------- */
  let dlgOpen = false, typing = null, portraitActor = null;
  U.dlgOpen = () => dlgOpen;
  function openDlg() { if (dlgOpen) return; dlgOpen = true; el.dlg.classList.add('show'); el.dlg.setAttribute('aria-hidden', 'false'); BF.audio.duck(.6); U.reserve(); }
  U.closeDlg = () => { if (!dlgOpen) return; dlgOpen = false; el.dlg.classList.remove('show'); el.dlg.setAttribute('aria-hidden', 'true'); BF.audio.duck(1); portraitActor = null; Object.values(BF.world.actors).forEach(a => a.talking = false); U.reserve(); };
  U.reserve = () => { const h = dlgOpen ? Math.min(el.dlg.offsetHeight + 24, innerHeight * .5) : 0; BF.world.inset.bottom = h; };
  /* say(): speaker is an actor id, or null for narration in the panel. Text may contain {1.2} pauses. */
  U.say = (speaker, text, o = {}) => new Promise(res => {
    openDlg();
    const ch = speaker ? (BF.figure.CAST[speaker] || {name: speaker}) : null;
    const actor = speaker ? BF.world.actors[speaker] : null;
    el.dlg.classList.toggle('narr', !ch); el.dlg.classList.toggle('thought', !!o.thought);
    el.dlgName.textContent = o.name || (ch ? ch.name : '');
    el.dlgName.style.color = ch ? (ch.color || '#f2d7a8') : '';
    el.portrait.style.display = ch && ch.skin ? '' : 'none';
    portraitActor = ch && ch.skin ? {ch, actor, expr: o.expr || (actor && actor.expr)} : null;
    el.dlgChoices.innerHTML = ''; el.dlgChoices.hidden = true; el.dlgNext.hidden = true;
    const plain = text.replace(/\{[\d.]+\}/g, '');
    BF.state.log.push({who: el.dlgName.textContent || '', text: plain});
    U.announce((el.dlgName.textContent ? el.dlgName.textContent + ': ' : '') + plain);
    // build segments
    const segs = []; text.split(/(\{[\d.]+\})/).forEach(p => { const m = p.match(/^\{([\d.]+)\}$/); if (m) segs.push({pause: +m[1]}); else if (p) segs.push({t: p}); });
    el.dlgText.innerHTML = ''; el.dlgText.className = 'dlg-text' + (o.thought ? ' thought' : '');
    const speed = set.get('textSpeed'), instant = speed >= 3 || set.reduced() && speed > 1;
    let si = 0, ci = 0, wait = 0, done = false, node = document.createTextNode(''); el.dlgText.appendChild(node);
    if (actor && !o.silent) actor.talking = true;
    const finish = () => { if (done) return; done = true; clearInterval(typing); typing = null; el.dlgText.textContent = plain; if (actor) actor.talking = false; el.dlgNext.hidden = !!o.choices; if (o.choices) showChoices(o.choices, res); else { const go = () => { el.dlg.onclick = null; res(); }; el.dlg.onclick = e => { if (e.target.closest('button') && e.target !== el.dlgNext && !el.dlgNext.contains(e.target)) return; go(); }; U.waitKey(go); if (o.auto) setTimeout(() => { if (el.dlg.onclick) { U.takeKey(); } }, o.auto * 1000); } U.reserve(); };
    const step = 1000 / 60;
    if (instant) { finish(); return; }
    el.dlg.onclick = () => finish(); U.waitKey(finish);
    typing = setInterval(() => {
      if (BF.time.paused) return;
      if (wait > 0) { wait -= step; return; }
      const s = segs[si]; if (!s) { U.takeKey(); return finish(); }
      if (s.pause !== undefined) { wait = s.pause * 1000 / Math.max(.5, speed * .8); si++; if (actor) actor.talking = false; node = document.createTextNode(''); el.dlgText.appendChild(node); return; }
      if (actor && !o.silent) actor.talking = true;
      const n = Math.max(1, Math.round(speed * 1.2));
      node.textContent += s.t.slice(ci, ci + n); ci += n;
      const last = s.t[ci - 1];
      if (last && /[.,?!…]/.test(last)) wait = (last === ',' ? 90 : 220) / speed;
      if (ci >= s.t.length) { si++; ci = 0; }
    }, step);
  });
  function showChoices(choices, res) {
    el.dlgChoices.hidden = false; el.dlgChoices.innerHTML = '';
    choices.forEach((c, i) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'choice' + (c.quiet ? ' quiet' : '');
      b.innerHTML = `<span class="num" aria-hidden="true">${i + 1}</span><span>${esc(c.label)}</span>`;
      b.onclick = e => {
        e.stopPropagation(); el.dlg.onclick = null; keyChoices = null; BF.state.log.push({who: 'You', text: c.label});
        // replace the options with the line that was chosen, so nothing stale stays clickable
        el.dlgChoices.innerHTML = ''; el.dlgChoices.hidden = true; el.dlg.classList.add('narr'); el.portrait.style.display = 'none';
        const pl = BF.world.player; el.dlgName.textContent = pl ? pl.ch.name : ''; el.dlgName.style.color = pl ? pl.ch.color : '';
        el.dlgText.className = 'dlg-text chosen'; el.dlgText.textContent = c.label; U.reserve(); res(c.id);
      };
      el.dlgChoices.appendChild(b);
    });
    keyChoices = choices.map((c, i) => () => el.dlgChoices.children[i].click());
    el.dlg.onclick = null;
    setTimeout(() => { const f = el.dlgChoices.querySelector('button'); if (f && U.kbd) f.focus({preventScroll: true}); }, 30);
  }
  let keyChoices = null;
  U.keyChoice = n => { if (keyChoices && keyChoices[n]) { keyChoices[n](); return true; } return false; };
  U.choose = (prompt, choices, o = {}) => U.say(o.speaker || null, prompt, {...o, choices});

  /* portrait animation runs each frame */
  U.frame = (t) => {
    if (portraitActor && dlgOpen) {
      const a = portraitActor.actor;
      BF.figure.portrait(el.portrait, portraitActor.ch, {t, talking: a ? a.talking : false, expr: a ? a.expr : portraitActor.expr, blink: a ? a.blink : false});
    }
    positionHotspots();
  };

  /* ---------- object action menu ---------- */
  U.menu = (title, actions, at) => new Promise(res => {
    const m = el.actions; m.innerHTML = `<div class="act-title">${esc(title)}</div>`;
    actions.forEach((a, i) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'act'; b.textContent = a.label; b.onclick = e => { e.stopPropagation(); close(i); }; m.appendChild(b); });
    const x = document.createElement('button'); x.type = 'button'; x.className = 'act act-close'; x.textContent = 'Never mind'; x.onclick = e => { e.stopPropagation(); close(-1); }; m.appendChild(x);
    m.classList.add('show'); m.setAttribute('aria-hidden', 'false');
    const r = m.getBoundingClientRect(), vw = innerWidth, vh = innerHeight;
    let left = at[0] - r.width / 2, top = at[1] - r.height - 18;
    if (vw < 600) { left = (vw - r.width) / 2; top = vh - r.height - 16 - (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--sab')) || 0); }
    m.style.left = BF.u.clamp(left, 8, vw - r.width - 8) + 'px'; m.style.top = BF.u.clamp(top, 60, vh - r.height - 8) + 'px';
    U.focusSoon(() => m.querySelector('.act'), m);
    U.menuOpen = close;
    function close(i) { m.classList.remove('show'); m.setAttribute('aria-hidden', 'true'); U.menuOpen = null; res(i); }
  });

  /* ---------- hotspots for keyboard and screen readers ---------- */
  let hsList = [];
  U.setHotspots = (objs, onAct) => {
    el.hot.innerHTML = ''; hsList = [];
    objs.forEach(o => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'hs'; b.textContent = o.name; b.setAttribute('aria-label', o.name);
      b.onfocus = () => { BF.world.focusObj = o; showPrompt(o); }; b.onblur = () => { if (BF.world.focusObj === o) BF.world.focusObj = null; hidePrompt(); };
      b.onclick = () => onAct(o);
      el.hot.appendChild(b); hsList.push([b, o]);
    });
  };
  U.clearHotspots = () => { el.hot.innerHTML = ''; hsList = []; };
  function positionHotspots() {
    const W = BF.world;
    hsList.forEach(([b, o]) => { const c = W.objCenter(o), p = W.toScreen(c[0], c[1], c[2]); b.style.transform = `translate(${p[0] - 40}px,${p[1] - 20}px)`; b.hidden = !!(o.hidden || (o.when && !o.when(W))); });
    if (promptObj) { const c = W.objCenter(promptObj), p = W.toScreen(c[0], c[1], (promptObj.box[5] ?? 1) + .9); el.prompt.style.transform = `translate(${p[0]}px,${p[1] - 26}px) translate(-50%,-100%)`; }
  }
  let promptObj = null;
  function showPrompt(o, key) { promptObj = o; el.prompt.innerHTML = (key ? `<kbd>${key}</kbd> ` : '') + esc(o.name); el.prompt.classList.add('show'); }
  function hidePrompt() { promptObj = null; el.prompt.classList.remove('show'); }
  U.showPrompt = showPrompt; U.hidePrompt = hidePrompt;

  /* ---------- the phone ---------- */
  U.phone = (o) => new Promise(res => {
    const p = el.phone;
    const msgs = o.messages.map(m => `<div class="msg ${m.me ? 'me' : 'them'}">${m.time ? `<span class="mt">${esc(m.time)}</span>` : ''}${esc(m.text)}</div>`).join('');
    p.innerHTML = `<div class="ph-body" role="dialog" aria-label="${esc(o.owner)}’s phone"><div class="ph-top"><span>${esc(o.clock || '')}</span><span>${esc(o.contact)}</span><span></span></div><div class="ph-msgs">${msgs}</div><div class="ph-replies"></div></div>`;
    const rep = p.querySelector('.ph-replies');
    const close = id => { p.classList.remove('show'); setTimeout(() => p.innerHTML = '', 400); keyChoices = null; res(id); };
    (o.replies || []).forEach((r, i) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'ph-rep' + (r.quiet ? ' quiet' : ''); b.innerHTML = `<span class="num" aria-hidden="true">${i + 1}</span>${esc(r.label)}`; b.onclick = () => { if (r.text) { const d = document.createElement('div'); d.className = 'msg me'; d.textContent = r.text; p.querySelector('.ph-msgs').appendChild(d); BF.audio.sfx('ping'); rep.innerHTML = ''; setTimeout(() => close(r.id), 1100); } else close(r.id); }; rep.appendChild(b); });
    if (!(o.replies || []).length) { const b = document.createElement('button'); b.type = 'button'; b.className = 'ph-rep quiet'; b.textContent = 'Put the phone down'; b.onclick = () => close(null); rep.appendChild(b); }
    keyChoices = [...rep.children].map(b => () => b.click());
    p.classList.add('show');
    const box = p.querySelector('.ph-msgs'); box.scrollTop = box.scrollHeight;
    U.focusSoon(() => rep.querySelector('button'), rep);
  });

  /* ---------- notebook toast ---------- */
  let toastTimer;
  U.toast = (title, onOpen) => {
    if (!set.get('notebookPrompts')) return;
    el.toast.innerHTML = `<span class="t-ico">${ICON.book}</span><span class="t-txt"><span class="t-k">New page in your notebook</span><span class="t-t">${esc(title)}</span></span><button type="button" class="t-open">Read</button><button type="button" class="t-x" aria-label="Dismiss">×</button>`;
    el.toast.classList.add('show'); BF.audio.sfx('chime');
    el.toast.querySelector('.t-open').onclick = () => { el.toast.classList.remove('show'); onOpen(); };
    el.toast.querySelector('.t-x').onclick = () => el.toast.classList.remove('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => el.toast.classList.remove('show'), 9000);
  };

  /* ---------- chapter cards, fades, bars ---------- */
  U.card = (kicker, title, sub, o = {}) => new Promise(res => {
    const c = el.card;
    c.innerHTML = `<div class="card-in"><div class="card-k">${esc(kicker)}</div><h2>${esc(title)}</h2>${sub ? `<div class="card-s">${esc(sub)}</div>` : ''}${o.note ? `<p class="card-note">${esc(o.note)}</p>` : ''}${o.content ? `<button type="button" class="card-cw">Content note</button>` : ''}<button type="button" class="card-go">${o.go || 'Continue'}</button></div>`;
    c.classList.add('show'); U.announce(kicker + '. ' + title + (sub ? '. ' + sub : ''));
    BF.audio.sfx('swell');
    let t = null; const done = () => { clearTimeout(t); c.classList.remove('show'); U.takeKey(); res(); };
    c.querySelector('.card-go').onclick = done;
    if (o.content) c.querySelector('.card-cw').onclick = e => { e.stopPropagation(); clearTimeout(t); U.contentNote(o.content, o.chapter); };
    U.waitKey(done);
    U.focusSoon(() => c.querySelector('.card-go'), c);
    if (!o.content) t = setTimeout(done, (set.reduced() ? 2.2 : 4.2) * 1000);
  });
  U.contentNote = (text, chapter) => {
    U.openScreen(`<div class="scr-card narrow"><h2>About this chapter</h2><p>${esc(text)}</p><p class="muted">You can pause at any time, and you can skip this chapter from here or later from the Chapters menu.</p><div class="row"><button type="button" class="btn" data-x="back">Back to the story</button><button type="button" class="btn ghost" data-x="skip">Skip this chapter</button></div></div>`, {back: () => U.closeScreen(), skip: () => { U.closeScreen(); BF.story.skipChapter(chapter); }});
  };
  U.fade = (to, sec = .8) => new Promise(res => { const f = el.fade; const d = set.reduced() ? .15 : sec; f.style.transition = `opacity ${d}s ease`; f.style.opacity = to; setTimeout(res, d * 1000 + 30); });
  U.bars = on => el.bars.classList.toggle('show', !!on);
  U.title = (html, ms = 3200) => new Promise(res => { const c = el.card; c.innerHTML = `<div class="card-in lite">${html}</div>`; c.classList.add('show'); setTimeout(() => { c.classList.remove('show'); setTimeout(res, 600); }, ms); });

  /* ---------- full screens: title, pause, settings, chapters, notebook ---------- */
  let screenKeys = null, lastFocus = null;
  U.openScreen = (html, handlers = {}, o = {}) => {
    lastFocus = document.activeElement;
    el.screen.innerHTML = html; el.screen.className = 'screen show' + (o.cls ? ' ' + o.cls : '');
    el.screen.setAttribute('aria-hidden', 'false');
    el.screen.querySelectorAll('[data-x]').forEach(b => b.addEventListener('click', e => { const h = handlers[b.dataset.x]; if (h) h(b, e); }));
    U.screen = o.name || 'screen';
    U.focusSoon(() => el.screen.querySelector('[autofocus]') || el.screen.querySelector('button,[tabindex="0"]'), el.screen);
  };
  U.closeScreen = () => { el.screen.className = 'screen'; el.screen.setAttribute('aria-hidden', 'true'); el.screen.innerHTML = ''; U.screen = null; if (lastFocus && lastFocus.focus) try { lastFocus.focus({preventScroll: true}); } catch (e) {} };
  U.trapTab = e => { // keep focus within an open screen or dialog
    const root = U.screen ? el.screen : (el.phone.classList.contains('show') ? el.phone : (dlgOpen && !el.dlgChoices.hidden ? el.dlg : null));
    if (!root) return false;
    const f = [...root.querySelectorAll('button,input,select,[tabindex="0"],a[href]')].filter(n => !n.disabled && n.offsetParent !== null);
    if (!f.length) return false; const i = f.indexOf(document.activeElement);
    e.preventDefault(); (e.shiftKey ? f[(i - 1 + f.length) % f.length] : f[(i + 1) % f.length]).focus(); return true;
  };

  U.settingsHTML = () => {
    const s = set.all();
    const slider = (k, label) => `<label class="set"><span>${label}</span><input type="range" min="0" max="1" step=".05" value="${s[k]}" data-set="${k}"></label>`;
    const tog = (k, label, v) => `<label class="set tog"><span>${label}</span><input type="checkbox" data-set="${k}" ${v ? 'checked' : ''}></label>`;
    const sel = (k, label, opts) => `<label class="set"><span>${label}</span><select data-set="${k}">${opts.map(([v, l]) => `<option value="${v}" ${String(s[k]) === String(v) ? 'selected' : ''}>${l}</option>`).join('')}</select></label>`;
    return `<div class="scr-card"><h2>Settings</h2>
      <h3>Sound</h3>${slider('music', 'Music')}${slider('ambience', 'Ambient sound')}${slider('effects', 'Interaction sounds')}${tog('soundCaptions', 'Sound captions', s.soundCaptions)}
      <h3>Reading</h3>${sel('textSize', 'Text size', [[.9, 'Small'], [1, 'Medium'], [1.15, 'Large'], [1.3, 'Extra large']])}${sel('textSpeed', 'Text speed', [[.6, 'Slow'], [1, 'Normal'], [1.8, 'Fast'], [3, 'Instant']])}
      <h3>Motion and help</h3>${sel('reducedMotion', 'Reduced motion', [['null', 'Match my device'], ['true', 'On'], ['false', 'Off']])}${tog('notebookPrompts', 'Notebook pop-ups', s.notebookPrompts)}${tog('highContrast', 'Always show interactive objects', s.highContrast)}
      <div class="row"><button type="button" class="btn" data-x="back">Done</button></div></div>`;
  };
  U.bindSettings = () => el.screen.querySelectorAll('[data-set]').forEach(inp => inp.addEventListener(inp.type === 'range' ? 'input' : 'change', () => {
    const k = inp.dataset.set; let v = inp.type === 'checkbox' ? inp.checked : inp.type === 'range' ? +inp.value : inp.value;
    if (k === 'reducedMotion') v = v === 'null' ? null : v === 'true'; else if (k === 'textSize' || k === 'textSpeed') v = +v;
    set.set(k, v);
  }));
  return Object.assign(U, {init, el: () => el});
})();
