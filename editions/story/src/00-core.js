/* Being Found: Story Edition. Core utilities, colour, settings and saves. */
'use strict';
const BF = window.BF = {VERSION: '1.0.0'};

BF.u = {
  clamp: (v, a, b) => v < a ? a : v > b ? b : v,
  lerp: (a, b, t) => a + (b - a) * t,
  ease: t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
  easeOut: t => 1 - Math.pow(1 - t, 3),
  easeIn: t => t * t * t,
  smooth: t => t * t * (3 - 2 * t),
  dist: (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]),
  rnd: (a, b) => a + Math.random() * (b - a),
  pick: arr => arr[Math.floor(Math.random() * arr.length)],
  // deterministic noise for static detail (wood grain, book colours)
  hash(n) { n = Math.sin(n * 127.1 + 311.7) * 43758.5453; return n - Math.floor(n); },
  esc: s => String(s).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c])),
};

/* ---------- colour ---------- */
BF.c = (() => {
  const cache = new Map();
  function rgb(hex) {
    if (cache.has(hex)) return cache.get(hex);
    let h = hex.replace('#', '');
    if (h.length === 3) h = h.split('').map(c => c + c).join('');
    const v = [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
    cache.set(hex, v); return v;
  }
  const toHex = v => '#' + v.map(x => Math.round(BF.u.clamp(x, 0, 255)).toString(16).padStart(2, '0')).join('');
  return {
    rgb, toHex,
    shade(hex, k) { const v = rgb(hex); return toHex(v.map(x => k < 1 ? x * k : x + (255 - x) * (k - 1))); },
    mix(a, b, t) { const x = rgb(a), y = rgb(b); return toHex(x.map((v, i) => v + (y[i] - v) * t)); },
    alpha(hex, a) { const v = rgb(hex); return `rgba(${v[0]},${v[1]},${v[2]},${a})`; },
  };
})();

/* ---------- settings ---------- */
BF.settings = (() => {
  const KEY = 'beingfound.story.settings.v1';
  const defaults = {
    music: .7, ambience: .8, effects: .8, textSize: 1, textSpeed: 1, reducedMotion: null,
    soundCaptions: false, notebookPrompts: true, hotspotHints: true, highContrast: false,
  };
  let s = {...defaults};
  try { Object.assign(s, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) {}
  const listeners = [];
  return {
    get: k => s[k],
    set(k, v) { s[k] = v; try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} listeners.forEach(f => f(k, v)); },
    on: f => listeners.push(f),
    reduced() {
      if (s.reducedMotion !== null) return !!s.reducedMotion;
      try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; }
    },
    all: () => ({...s}),
  };
})();

/* ---------- saves ---------- */
BF.save = (() => {
  const KEY = 'beingfound.story.save.v1';
  let mem = null;
  function read() {
    try { const t = localStorage.getItem(KEY); if (t) return JSON.parse(t); } catch (e) {}
    return mem;
  }
  function write(data) {
    data.version = 1; data.saved = Date.now(); mem = data;
    try { localStorage.setItem(KEY, JSON.stringify(data)); return true; } catch (e) { return false; }
  }
  return {
    read, write,
    clear() { mem = null; try { localStorage.removeItem(KEY); } catch (e) {} },
    exists() { const d = read(); return !!(d && d.version === 1 && d.chapter); },
  };
})();

/* ---------- game clock & async waits (pausable) ---------- */
BF.time = {
  now: 0, paused: false, waits: [],
  wait(sec) { return new Promise(res => this.waits.push({at: this.now + Math.max(0, sec), res})); },
  tick(dt) {
    if (this.paused) return;
    this.now += dt;
    if (!this.waits.length) return;
    const due = this.waits.filter(w => w.at <= this.now);
    if (due.length) { this.waits = this.waits.filter(w => w.at > this.now); due.forEach(w => w.res()); }
  },
};

/* ---------- story flags ---------- */
BF.state = {
  flags: {}, chapter: null, completed: [], log: [],
  get notebook() { return BF.essayDiscovery.ids(); },
  get(k) { return this.flags[k]; },
  set(k, v = true) { this.flags[k] = v; },
  inc(k, n = 1) { this.flags[k] = (this.flags[k] || 0) + n; return this.flags[k]; },
  snapshot() { return JSON.parse(JSON.stringify({flags: this.flags, completed: this.completed, notebook: this.notebook, log: this.log.slice(-120)})); },
  restore(d) {
    this.flags = d.flags || {}; this.completed = d.completed || []; this.log = d.log || [];
  },
  reset() { this.flags = {}; this.completed = []; this.log = []; /* notebook pages persist across new stories */ },
};
