/* Procedural sound: layered ambience, interaction sounds and a shared musical motif for every character. */
'use strict';
BF.audio = (() => {
  const A = {ready: false, theme: null, amb: null, captions: null};
  let ctx, master, musicBus, ambBus, sfxBus, verb, musicFilter, noise = {}, schedTimer = null;
  const set = BF.settings;
  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);

  function init() {
    if (A.ready) { if (ctx.state === 'suspended') ctx.resume(); return; }
    try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
    master = ctx.createGain(); master.gain.value = .9;
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -18; comp.ratio.value = 3;
    master.connect(comp); comp.connect(ctx.destination);
    musicFilter = ctx.createBiquadFilter(); musicFilter.type = 'lowpass'; musicFilter.frequency.value = 18000;
    musicBus = ctx.createGain(); ambBus = ctx.createGain(); sfxBus = ctx.createGain();
    musicFilter.connect(musicBus); musicBus.connect(master); ambBus.connect(master); sfxBus.connect(master);
    verb = ctx.createConvolver(); verb.buffer = impulse(2.8, 2.6); const vg = ctx.createGain(); vg.gain.value = .35; verb.connect(vg); vg.connect(master);
    ['white', 'pink', 'brown'].forEach(k => noise[k] = makeNoise(k));
    A.ready = true; volumes(); set.on(volumes);
    if (A.pendingAmb) ambience(A.pendingAmb); if (A.pendingTheme) music(A.pendingTheme);
  }
  function volumes() {
    if (!ctx) return; const t = ctx.currentTime;
    musicBus.gain.setTargetAtTime(set.get('music') * .55 * (A.duckK || 1), t, .3);
    ambBus.gain.setTargetAtTime(set.get('ambience') * .9, t, .3);
    sfxBus.gain.setTargetAtTime(set.get('effects') * .9, t, .1);
  }
  function impulse(sec, decay) {
    const len = ctx.sampleRate * sec, b = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay); }
    return b;
  }
  function makeNoise(kind) {
    const len = ctx.sampleRate * 3, b = ctx.createBuffer(1, len, ctx.sampleRate), d = b.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, last = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      if (kind === 'white') d[i] = w;
      else if (kind === 'pink') { b0 = .99765 * b0 + w * .099046; b1 = .963 * b1 + w * .2965164; b2 = .57 * b2 + w * 1.0526913; d[i] = (b0 + b1 + b2 + w * .1848) * .2; }
      else { last = (last + .02 * w) / 1.02; d[i] = last * 3.5; }
    }
    return b;
  }
  const src = (kind, loop = true) => { const s = ctx.createBufferSource(); s.buffer = noise[kind]; s.loop = loop; return s; };
  const filt = (type, f, q = 1) => { const b = ctx.createBiquadFilter(); b.type = type; b.frequency.value = f; b.Q.value = q; return b; };
  const gainN = v => { const g = ctx.createGain(); g.gain.value = v; return g; };
  const pan = v => { const p = ctx.createStereoPanner ? ctx.createStereoPanner() : ctx.createGain(); if (p.pan) p.pan.value = v; return p; };
  function chain(...n) { for (let i = 0; i < n.length - 1; i++) n[i].connect(n[i + 1]); return n[n.length - 1]; }

  /* ---------- one-shot helpers ---------- */
  function burst(out, {kind = 'white', type = 'lowpass', f = 1000, q = 1, dur = .1, gain = .3, attack = .005, at = 0, panV = 0, sweep}) {
    const t = ctx.currentTime + at, s = src(kind, false), fl = filt(type, f, q), g = gainN(0), p = pan(panV);
    s.connect(fl); fl.connect(g); g.connect(p); p.connect(out);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(gain, t + attack); g.gain.exponentialRampToValueAtTime(.0008, t + dur);
    if (sweep) fl.frequency.exponentialRampToValueAtTime(sweep, t + dur);
    s.start(t, Math.random() * 2); s.stop(t + dur + .05);
    return g;
  }
  function tone(out, {f = 440, type = 'sine', dur = .3, gain = .2, attack = .005, at = 0, to, panV = 0, send = 0}) {
    const t = ctx.currentTime + at, o = ctx.createOscillator(), g = gainN(0), p = pan(panV);
    o.type = type; o.frequency.setValueAtTime(f, t); if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
    o.connect(g); g.connect(p); p.connect(out); if (send) { const sg = gainN(send); g.connect(sg); sg.connect(verb); }
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(gain, t + attack); g.gain.exponentialRampToValueAtTime(.0008, t + dur);
    o.start(t); o.stop(t + dur + .05); return o;
  }

  /* ---------- sound effects ---------- */
  const CAPTION = {knock: 'knocking', doorOpen: 'a door opens', doorClose: 'a door closes', kettle: 'the kettle boils', pour: 'pouring', clink: 'a cup clinks', sizzle: 'sizzling', brush: 'brush strokes', page: 'pages turn', buzz: 'phone buzzes', ping: 'message tone', bell: 'shop bell', bus: 'a bus passes', sand: 'sanding', water: 'water running', keys: 'keys jingle', rustle: 'blanket rustles', chair: 'chair creaks', write: 'pen on paper', record: 'record crackles', switch: 'a switch clicks', footsteps: 'footsteps'};
  const SFX = {
    step(o) { burst(sfxBus, {kind: 'brown', f: o.street ? 900 : 520, dur: .09, gain: .22 + Math.random() * .1, panV: o.pan || 0}); burst(sfxBus, {kind: 'white', type: 'bandpass', f: o.street ? 2600 : 1600, q: 2, dur: .04, gain: .03}); },
    knock() { [0, .32, .6].forEach(at => { tone(sfxBus, {f: 95, dur: .2, gain: .55, at, send: .2}); burst(sfxBus, {kind: 'white', f: 1300, dur: .06, gain: .25, at}); }); },
    doorOpen() { const o = tone(sfxBus, {f: 160, type: 'sawtooth', dur: .9, gain: .04, to: 230, attack: .1}); burst(sfxBus, {kind: 'white', type: 'highpass', f: 3000, dur: .05, gain: .2}); },
    doorClose() { tone(sfxBus, {f: 70, dur: .3, gain: .5, send: .25}); burst(sfxBus, {kind: 'brown', f: 700, dur: .18, gain: .5}); burst(sfxBus, {kind: 'white', type: 'highpass', f: 3500, dur: .04, gain: .12, at: .02}); },
    kettle() { const s = src('white'), fl = filt('lowpass', 300), g = gainN(0); chain(s, fl, g, sfxBus); const t = ctx.currentTime; g.gain.linearRampToValueAtTime(.18, t + 2.4); fl.frequency.exponentialRampToValueAtTime(2200, t + 3); g.gain.linearRampToValueAtTime(0, t + 4.6); s.start(); s.stop(t + 4.8); const o = ctx.createOscillator(), og = gainN(0), lfo = ctx.createOscillator(), lg = gainN(18); lfo.frequency.value = 7; lfo.connect(lg); lg.connect(o.frequency); o.frequency.value = 1950; chain(o, og, sfxBus); og.gain.setValueAtTime(0, t + 2.6); og.gain.linearRampToValueAtTime(.05, t + 3.2); og.gain.linearRampToValueAtTime(0, t + 4.5); o.start(t + 2.5); lfo.start(t + 2.5); o.stop(t + 4.6); lfo.stop(t + 4.6); },
    pour() { for (let i = 0; i < 14; i++) burst(sfxBus, {kind: 'white', type: 'bandpass', f: 700 + Math.random() * 900, q: 6, dur: .12, gain: .2, at: i * .09}); },
    clink() { [2100, 3350, 5200].forEach((f, i) => tone(sfxBus, {f, dur: .5 - i * .1, gain: .07, send: .3})); },
    sizzle() { const s = src('white'), fl = filt('highpass', 3500), g = gainN(0); chain(s, fl, g, sfxBus); const t = ctx.currentTime; g.gain.linearRampToValueAtTime(.12, t + .3); g.gain.setValueAtTime(.12, t + 2.4); g.gain.linearRampToValueAtTime(0, t + 3); s.start(); s.stop(t + 3.1); for (let i = 0; i < 25; i++) burst(sfxBus, {kind: 'white', type: 'highpass', f: 4000, dur: .02, gain: .2, at: Math.random() * 2.6}); },
    brush() { for (let i = 0; i < 4; i++) burst(sfxBus, {kind: 'pink', type: 'bandpass', f: 2400, q: 1.5, dur: .4, gain: .12, attack: .15, at: i * .55}); },
    page() { burst(sfxBus, {kind: 'white', type: 'bandpass', f: 3000, q: .7, dur: .28, gain: .15, attack: .08, sweep: 1500}); },
    buzz() { [0, .45].forEach(at => { const t = ctx.currentTime + at, o = ctx.createOscillator(), g = gainN(0), fl = filt('lowpass', 700); o.type = 'square'; o.frequency.value = 165; chain(o, fl, g, sfxBus); g.gain.setValueAtTime(.08, t); g.gain.setValueAtTime(0, t + .3); o.start(t); o.stop(t + .32); }); },
    ping() { tone(sfxBus, {f: 1318, dur: .35, gain: .1, send: .3}); tone(sfxBus, {f: 1760, dur: .5, gain: .08, at: .12, send: .3}); },
    bell() { [2637, 3951, 3136].forEach((f, i) => tone(sfxBus, {f, dur: 1.6, gain: .06, at: i * .09, send: .4})); },
    bus() { const t = ctx.currentTime, o = ctx.createOscillator(), og = gainN(0), p = pan(-1); o.type = 'sawtooth'; o.frequency.value = 55; const fl = filt('lowpass', 260); chain(o, fl, og, p, ambBus); og.gain.linearRampToValueAtTime(.12, t + 2); og.gain.linearRampToValueAtTime(0, t + 6); if (p.pan) p.pan.linearRampToValueAtTime(1, t + 6); o.start(); o.stop(t + 6.2); const s = src('pink'), sf = filt('bandpass', 500, .6), sg = gainN(0); chain(s, sf, sg, p); sg.gain.linearRampToValueAtTime(.2, t + 2.2); sg.gain.linearRampToValueAtTime(0, t + 6); s.start(); s.stop(t + 6.2); burst(ambBus, {kind: 'white', type: 'highpass', f: 2500, dur: 1.2, gain: .05, attack: .3, at: 2.5}); },
    footsteps() { for (let i = 0; i < 4; i++) burst(sfxBus, {kind: 'brown', f: 420, dur: .1, gain: .25 - i * .03, at: i * .42}); },
    sand() { for (let i = 0; i < 6; i++) burst(sfxBus, {kind: 'white', type: 'bandpass', f: 1800, q: 1.2, dur: .3, gain: .12, attack: .1, at: i * .33}); },
    water() { const s = src('white'), fl = filt('bandpass', 1100, .8), g = gainN(0); chain(s, fl, g, sfxBus); const t = ctx.currentTime; g.gain.linearRampToValueAtTime(.12, t + .2); g.gain.setValueAtTime(.12, t + 1.6); g.gain.linearRampToValueAtTime(0, t + 2); s.start(); s.stop(t + 2.1); },
    keys() { for (let i = 0; i < 6; i++) tone(sfxBus, {f: 3000 + Math.random() * 3000, dur: .15, gain: .04, at: i * .05 + Math.random() * .03}); },
    rustle() { burst(sfxBus, {kind: 'pink', f: 1800, dur: .7, gain: .15, attack: .25}); },
    chair() { tone(sfxBus, {f: 130, type: 'sawtooth', dur: .35, gain: .03, to: 95, attack: .05}); },
    write() { for (let i = 0; i < 8; i++) burst(sfxBus, {kind: 'white', type: 'highpass', f: 4500, dur: .05, gain: .06, at: i * .12 + Math.random() * .05}); },
    record() { for (let i = 0; i < 12; i++) burst(sfxBus, {kind: 'white', type: 'highpass', f: 5000, dur: .015, gain: .1, at: Math.random() * 1.5}); },
    switch() { burst(sfxBus, {kind: 'white', type: 'highpass', f: 3000, dur: .03, gain: .2}); },
    chime() { tone(sfxBus, {f: 1568, dur: 1.2, gain: .05, send: .5}); tone(sfxBus, {f: 2093, dur: 1.4, gain: .04, at: .15, send: .5}); },
    swell() { [50, 57, 62, 66].forEach(m => tone(musicBus, {f: mtof(m), type: 'triangle', dur: 3.5, gain: .04, attack: 1.4, send: .6})); },
  };
  function sfx(name, o = {}) {
    if (CAPTION[name] && set.get('soundCaptions') && A.captions) A.captions(CAPTION[name]);
    if (!A.ready) return; const f = SFX[name]; if (f) try { f(o); } catch (e) {}
  }

  /* ---------- ambience ---------- */
  function layer() { const g = gainN(0); g.connect(ambBus); g.gain.setTargetAtTime(1, ctx.currentTime, 1); const L = {g, nodes: [], timers: [], alive: true}; return L; }
  function loopNoise(L, kind, type, f, q, gain) { const s = src(kind), fl = filt(type, f, q), g = gainN(gain); chain(s, fl, g, L.g); s.start(0, Math.random() * 2); L.nodes.push(s); return {s, fl, g}; }
  function every(L, min, max, fn) { const go = () => { if (!L.alive) return; try { fn(); } catch (e) {} L.timers.push(setTimeout(go, (min + Math.random() * (max - min)) * 1000)); }; L.timers.push(setTimeout(go, Math.random() * max * 1000)); }
  const AMB = {
    room: L => loopNoise(L, 'brown', 'lowpass', 260, .7, .16),
    fridge: L => { const o = ctx.createOscillator(), g = gainN(.008); o.frequency.value = 59; chain(o, g, L.g); o.start(); L.nodes.push(o); const o2 = ctx.createOscillator(), g2 = gainN(.004); o2.frequency.value = 118; chain(o2, g2, L.g); o2.start(); L.nodes.push(o2); },
    street: L => { const n = loopNoise(L, 'pink', 'bandpass', 380, .5, .1); every(L, 5, 12, () => { const t = ctx.currentTime, s = src('pink', false), fl = filt('bandpass', 600, .8), g = gainN(0), p = pan(Math.random() < .5 ? -1 : 1); chain(s, fl, g, p, L.g); g.gain.linearRampToValueAtTime(.16, t + 1.4); g.gain.linearRampToValueAtTime(0, t + 3.2); if (p.pan) p.pan.linearRampToValueAtTime(-p.pan.value, t + 3.2); fl.frequency.linearRampToValueAtTime(900, t + 1.5); fl.frequency.linearRampToValueAtTime(500, t + 3.2); s.start(t); s.stop(t + 3.3); }); },
    distantStreet: L => { loopNoise(L, 'pink', 'lowpass', 300, .5, .07); every(L, 9, 20, () => burst(L.g, {kind: 'pink', type: 'lowpass', f: 400, dur: 3, gain: .06, attack: 1.2})); },
    birds: L => every(L, 1.5, 5, () => { const n = 2 + Math.floor(Math.random() * 4), base = 2600 + Math.random() * 2200, pv = Math.random() * 1.6 - .8; for (let i = 0; i < n; i++) tone(L.g, {f: base, to: base * (1.2 + Math.random() * .4), dur: .07 + Math.random() * .05, gain: .025, at: i * .13, panV: pv}); }),
    rain: L => { loopNoise(L, 'white', 'bandpass', 2500, .4, .07); loopNoise(L, 'pink', 'lowpass', 900, .5, .08); every(L, .05, .25, () => burst(L.g, {kind: 'white', type: 'bandpass', f: 3000 + Math.random() * 3000, q: 4, dur: .03, gain: .05, panV: Math.random() * 2 - 1})); },
    clock: L => { let k = 0; const tick = () => { if (!L.alive) return; burst(L.g, {kind: 'white', type: 'highpass', f: k++ % 2 ? 3800 : 4600, dur: .025, gain: .05}); L.timers.push(setTimeout(tick, 1000)); }; tick(); },
    hvac: L => loopNoise(L, 'pink', 'lowpass', 500, .5, .05),
    wind: L => { const n = loopNoise(L, 'pink', 'bandpass', 500, .6, .06); const lfo = ctx.createOscillator(), lg = gainN(250); lfo.frequency.value = .07; lfo.connect(lg); lg.connect(n.fl.frequency); lfo.start(); L.nodes.push(lfo); },
    pages: L => every(L, 6, 14, () => SFX.page()),
    crackle: L => every(L, .08, .5, () => burst(L.g, {kind: 'white', type: 'highpass', f: 5000, dur: .012, gain: .06})),
  };
  const SETS = {
    prologue: ['wind', 'distantStreet'], flat: ['room', 'fridge', 'distantStreet', 'birds'], flatNight: ['room', 'fridge', 'distantStreet'],
    hallway: ['room', 'distantStreet'], street: ['street', 'birds', 'wind'], streetNight: ['street', 'wind'], dele: ['room', 'fridge', 'distantStreet'], deleRain: ['room', 'fridge', 'rain'],
    library: ['room', 'hvac', 'clock', 'pages', 'birds'], walt: ['room', 'fridge', 'birds', 'distantStreet'], silence: ['room'],
  };
  function ambience(name, extra = []) {
    if (!A.ready) { A.pendingAmb = name; return; }
    const old = A.amb; if (old) { old.alive = false; old.g.gain.setTargetAtTime(0, ctx.currentTime, .8); setTimeout(() => { old.nodes.forEach(n => { try { n.stop(); } catch (e) {} }); old.timers.forEach(clearTimeout); old.g.disconnect(); }, 4000); }
    if (!name) { A.amb = null; return; }
    const L = layer(); (SETS[name] || [name]).concat(extra).forEach(k => AMB[k] && AMB[k](L)); A.amb = L; A.ambName = name;
  }
  A.addAmb = k => { if (A.amb && AMB[k]) AMB[k](A.amb); };

  /* ---------- music ---------- */
  // The shared motif: four falling notes (5-3-2-1). Each person's theme bends it differently.
  const MOTIF = [7, 4, 2, 0];
  function piano(m, at, dur, vel = .5, out = musicFilter) {
    const f = mtof(m), t = ctx.currentTime + at;
    [[1, 'triangle', 1], [2, 'sine', .35], [3, 'sine', .12]].forEach(([h, type, k]) => { const o = ctx.createOscillator(), g = gainN(0); o.type = type; o.frequency.value = f * h * (1 + (Math.random() - .5) * .0015); o.connect(g); g.connect(out); const sg = gainN(.5); g.connect(sg); sg.connect(verb); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.09 * vel * k, t + .008); g.gain.exponentialRampToValueAtTime(.0006, t + dur); o.start(t); o.stop(t + dur + .1); });
  }
  function pad(ms, at, dur, vel = .4) {
    const t = ctx.currentTime + at; ms.forEach(m => { [-4, 4].forEach(dt => { const o = ctx.createOscillator(), g = gainN(0), fl = filt('lowpass', 900, .5); o.type = 'sawtooth'; o.frequency.value = mtof(m); o.detune.value = dt; chain(o, fl, g, musicFilter); const sg = gainN(.6); g.connect(sg); sg.connect(verb); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.012 * vel, t + dur * .35); g.gain.linearRampToValueAtTime(0, t + dur); o.start(t); o.stop(t + dur + .1); }); });
  }
  function mallet(m, at, vel = .5) { const t = ctx.currentTime + at; [[1, .9], [4, .2]].forEach(([h, k]) => { const o = ctx.createOscillator(), g = gainN(0); o.frequency.value = mtof(m) * h; chain(o, g, musicFilter); const sg = gainN(.4); g.connect(sg); sg.connect(verb); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.1 * vel * k, t + .005); g.gain.exponentialRampToValueAtTime(.0006, t + (h > 1 ? .25 : 1.2)); o.start(t); o.stop(t + 1.3); }); }
  function pluck(m, at, vel = .5) { const t = ctx.currentTime + at, o = ctx.createOscillator(), g = gainN(0), fl = filt('lowpass', 2200); o.type = 'triangle'; o.frequency.value = mtof(m); chain(o, fl, g, musicFilter); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.07 * vel, t + .004); g.gain.exponentialRampToValueAtTime(.0006, t + .5); o.start(t); o.stop(t + .6); }
  const triad = (r, minor) => [r, r + (minor ? 3 : 4), r + 7];

  const THEMES = {
    title: {bpm: 58, beats: 4, prog: [[62, 0], [59, 1], [55, 0], [57, 0]], bar(b, spb) { const [r, mi] = this.prog[b % 4]; pad(triad(r - 12, mi), 0, spb * 4.2, .5); [0, 1, 2, 3].forEach(i => piano(triad(r, mi)[i % 3] + (i === 3 ? 12 : 0), i * spb, spb * 3, .32)); if (b % 4 === 3) MOTIF.forEach((d, i) => piano(74 + d, i * spb * .75 + spb * .2, spb * 3, .5)); }},
    prologue: {bpm: 50, beats: 4, bar(b, spb) { pad([50, 57, 62], 0, spb * 4.3, .45); if (b % 2) piano(MOTIF[b % 4] + 74, spb * 1.5, spb * 4, .25); if (b % 4 === 3) piano(69, spb * 3, spb * 3, .2); }},
    noor: {bpm: 76, beats: 4, prog: [[65, 0], [69, 1], [70, 0], [65, 0], [62, 1], [70, 0], [72, 0], [65, 0]], bar(b, spb) { const [r, mi] = this.prog[b % 8], c = triad(r, mi); pad(triad(r - 12, mi), 0, spb * 4.2, .3); for (let i = 0; i < 8; i++) piano(c[[0, 1, 2, 1, 0, 2, 1, 2][i]] + (i > 3 ? 12 : 0), i * spb / 2, spb * 1.5, .22 + (i === 0 ? .1 : 0)); if (b % 8 === 7) MOTIF.forEach((d, i) => piano(77 + d, i * spb, spb * 2, .45)); }},
    record: {bpm: 70, beats: 4, prog: [[60, 0], [57, 1], [65, 0], [67, 0]], bar(b, spb) { const [r, mi] = this.prog[b % 4], c = triad(r, mi); piano(r - 24, 0, spb * 2, .4); piano(r - 17, spb * 2, spb * 2, .3); [1, 3].forEach(i => c.forEach(m => piano(m, i * spb, spb * .8, .18))); [0, 1.5, 2, 3, 3.5].forEach((p, i) => piano(c[i % 3] + 12 + (i === 4 ? 2 : 0), p * spb, spb, .28)); }},
    dele: {bpm: 52, beats: 4, prog: [[57, 1], [53, 0], [48, 0], [55, 0]], bar(b, spb) { const [r, mi] = this.prog[b % 4]; pad(triad(r - 12, mi), 0, spb * 4.5, .45); if (b % 3 === 1) [7, 4, 2].forEach((d, i) => piano(69 + d, i * spb * 1.3 + spb * .5, spb * 3, .26)); if (b % 4 === 2) piano(r, spb * 2.5, spb * 3, .18); }},
    leena: {bpm: 88, beats: 5, prog: [[64, 0], [61, 1], [69, 0], [71, 0]], bar(b, spb) { const [r, mi] = this.prog[b % 4], c = triad(r, mi); pad(triad(r - 12, mi), 0, spb * 5.2, .28); for (let i = 0; i < 5; i++) pluck(c[i % 3] + 12, i * spb, i === 0 ? .7 : .4); if (b % 4 === 3) MOTIF.forEach((d, i) => piano(76 + d + (i === 1 ? 1 : 0), i * spb * 1.2, spb * 2, .42)); }},
    walt: {bpm: 66, beats: 4, prog: [[67, 0], [64, 1], [60, 0], [62, 0]], bar(b, spb) { const [r, mi] = this.prog[b % 4], c = triad(r, mi); pad(triad(r - 12, mi), 0, spb * 4.2, .32); mallet(c[0], 0, .5); mallet(c[2], spb * 1.5, .35); if (b % 2) mallet(c[1] + 12, spb * 3, .3); if (b % 4 === 3) MOTIF.forEach((d, i) => mallet(79 + d, i * spb * (i === 2 ? 1.8 : 1), .5)); }},
    finale: {bpm: 62, beats: 4, prog: [[62, 0], [66, 1], [67, 0], [69, 0], [62, 0], [59, 1], [67, 0], [62, 0]], bar(b, spb) { const [r, mi] = this.prog[b % 8], c = triad(r, mi); pad(triad(r - 12, mi), 0, spb * 4.3, .5); for (let i = 0; i < 4; i++) piano(c[i % 3] + (i === 3 ? 12 : 0), i * spb, spb * 2, .25); if (b % 4 === 3) MOTIF.forEach((d, i) => piano(74 + d, i * spb, spb * 3, .55)); }},
    hush: {bpm: 50, beats: 4, bar(b, spb) { if (b % 2 === 0) pad([45, 52, 57], 0, spb * 8.5, .3); }},
  };
  function music(name, opts = {}) {
    if (!A.ready) { A.pendingTheme = name; return; }
    if (A.theme === name && !opts.restart) return;
    A.theme = name; clearInterval(schedTimer); schedTimer = null;
    const t = ctx.currentTime;
    musicFilter.frequency.cancelScheduledValues(t);
    musicFilter.frequency.setTargetAtTime(name === 'record' ? 1800 : 18000, t, .5);
    if (!name) return;
    const th = THEMES[name]; if (!th) return;
    const spb = 60 / th.bpm; let bar = 0, next = ctx.currentTime + .15;
    schedTimer = setInterval(() => { if (A.theme !== name) return; while (next < ctx.currentTime + .4) { const lead = next - ctx.currentTime; try { th.bar.call(th, bar, spb, lead); } catch (e) {} bar++; next += spb * th.beats; } }, 100);
  }
  // The theme functions schedule relative to "now"; nudge them to their bar start.
  const _piano = piano, _pad = pad, _mallet = mallet, _pluck = pluck;
  let offset = 0;
  piano = (m, at, d, v, o) => _piano(m, at + offset, d, v, o); pad = (ms, at, d, v) => _pad(ms, at + offset, d, v); mallet = (m, at, v) => _mallet(m, at + offset, v); pluck = (m, at, v) => _pluck(m, at + offset, v);
  Object.values(THEMES).forEach(th => { const bar = th.bar; th.bar = function (b, spb, lead) { offset = lead || 0; bar.call(this, b, spb); offset = 0; }; });

  function duck(k) { A.duckK = k; volumes(); }
  Object.assign(A, {init, sfx, ambience, music, duck, volumes});
  return A;
})();
