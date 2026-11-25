/* The world: loads a location, owns actors, paths, camera, lighting, particles and picking. */
'use strict';
BF.world = (() => {
  const {P, HW, HH, ZS, sort, shadow} = BF.iso;
  const {clamp, lerp, dist, hash} = BF.u;
  const {alpha, shade} = BF.c;
  const W = {
    cv: null, ctx: null, lcv: null, lctx: null, dpr: 1, vw: 0, vh: 0,
    loc: null, actors: {}, items: [], objects: {}, state: {}, particles: [], player: null,
    cam: {x: 0, y: 0, z: 1, tx: 0, ty: 0, tz: 1, mode: 'fit', focus: null, shake: 0},
    hover: null, focusObj: null, reveal: 0, light: null, clockMin: 540, tFrame: 0, inset: {top: 0, bottom: 0},
  };

  function init(cv) {
    W.cv = cv; W.ctx = cv.getContext('2d');
    W.lcv = document.createElement('canvas'); W.lctx = W.lcv.getContext('2d');
    resize(); addEventListener('resize', resize);
  }
  function resize() {
    W.dpr = Math.min(2, devicePixelRatio || 1);
    W.vw = W.cv.clientWidth || innerWidth; W.vh = W.cv.clientHeight || innerHeight;
    W.cv.width = Math.round(W.vw * W.dpr); W.cv.height = Math.round(W.vh * W.dpr);
    const ls = .5; W.lcv.width = Math.round(W.vw * W.dpr * ls); W.lcv.height = Math.round(W.vh * W.dpr * ls); W.lscale = ls;
    if (W.loc) fitCamera(true);
  }

  /* ---------- scene state helpers used by art ---------- */
  const S = W.S = {
    objState: id => W.state[id],
    occupant: id => { for (const a of Object.values(W.actors)) if (a.lying === id && a.visible) return a.ch; return null; },
    skyColors: () => W.light ? W.light.sky : ['#9cc6e4', '#e8eef0'],
    clock: () => W.clockMin,
    get night() { return W.light && W.light.night; },
  };
  W.st = (id, patch) => { W.state[id] = Object.assign(W.state[id] || {}, patch || {}); return W.state[id]; };

  /* ---------- loading ---------- */
  function load(locId, opts = {}) {
    const L = BF.locations[locId]; if (!L) throw Error('Unknown location ' + locId);
    if (W.locId !== locId) cache.clear();
    W.loc = L; W.locId = locId; W.actors = {}; W.particles = []; W.hover = null; W.focusObj = null;
    W.state = JSON.parse(JSON.stringify(L.state || {}));
    Object.entries(opts.state || {}).forEach(([k, v]) => W.st(k, v));
    W.items = (L.items || []).map(it => ({...it}));
    W.objects = {};
    Object.entries(L.objects || {}).forEach(([id, o]) => W.objects[id] = {id, ...o});
    W.light = Object.assign({}, BF.lighting[opts.light || L.light || 'day']);
    buildGrid();
    W.cam.mode = opts.cam || L.cam || 'fit';
    fitCamera(true);
    return L;
  }
  function buildGrid() {
    const L = W.loc, gw = Math.ceil(L.w * 2), gd = Math.ceil(L.d * 2); // half-tile resolution
    const g = new Uint8Array(gw * gd).fill(1);
    const block = (x0, y0, x1, y1) => {
      for (let i = Math.floor(x0 * 2); i < Math.ceil(x1 * 2); i++) for (let j = Math.floor(y0 * 2); j < Math.ceil(y1 * 2); j++) if (i >= 0 && j >= 0 && i < gw && j < gd) g[j * gw + i] = 0;
    };
    // a margin along walls and edges
    block(0, 0, L.w, .35); block(0, 0, .35, L.d);
    if (L.edge !== false) { block(0, L.d - .3, L.w, L.d); block(L.w - .3, 0, L.w, L.d); }
    W.items.forEach(it => { if (it.block === false || ['rug', 'shavings'].includes(it.type)) return; const m = it.pad ?? .22; block(it.x - m, it.y - m, it.x + (it.w || 1) + m, it.y + (it.d || 1) + m); });
    (L.blocks || []).forEach(b => block(...b));
    (L.walk || []).forEach(b => { for (let i = Math.floor(b[0] * 2); i < Math.ceil(b[2] * 2); i++) for (let j = Math.floor(b[1] * 2); j < Math.ceil(b[3] * 2); j++) if (i >= 0 && j >= 0 && i < gw && j < gd) g[j * gw + i] = 1; });
    W.grid = {g, gw, gd};
  }
  const walkable = (x, y) => { const {g, gw, gd} = W.grid; const i = Math.floor(x * 2), j = Math.floor(y * 2); return i >= 0 && j >= 0 && i < gw && j < gd && g[j * gw + i] === 1; };
  W.walkable = walkable;
  function nearestWalkable(x, y) {
    if (walkable(x, y)) return [x, y];
    for (let r = .5; r < 6; r += .5) for (let a = 0; a < 16; a++) { const px = x + Math.cos(a / 16 * Math.PI * 2) * r, py = y + Math.sin(a / 16 * Math.PI * 2) * r; if (walkable(px, py)) return [px, py]; }
    return [x, y];
  }
  function los(a, b) { const d = dist(a, b), n = Math.ceil(d * 6); for (let i = 1; i < n; i++) { const t = i / n, x = lerp(a[0], b[0], t), y = lerp(a[1], b[1], t); if (!walkable(x, y) || !walkable(x + .18, y) || !walkable(x - .18, y) || !walkable(x, y + .18) || !walkable(x, y - .18)) return false; } return true; }
  function findPath(from, to) {
    to = nearestWalkable(...to);
    const {g, gw, gd} = W.grid;
    const si = Math.floor(from[0] * 2), sj = Math.floor(from[1] * 2), ti = Math.floor(to[0] * 2), tj = Math.floor(to[1] * 2);
    const key = (i, j) => j * gw + i;
    const open = [[si, sj]], came = new Map(), gs = new Map([[key(si, sj), 0]]), fs = new Map([[key(si, sj), 0]]);
    let found = false, guard = 0;
    while (open.length && guard++ < 6000) {
      open.sort((a, b) => fs.get(key(...a)) - fs.get(key(...b)));
      const [ci, cj] = open.shift();
      if (ci === ti && cj === tj) { found = true; break; }
      for (let di = -1; di <= 1; di++) for (let dj = -1; dj <= 1; dj++) {
        if (!di && !dj) continue; const ni = ci + di, nj = cj + dj;
        if (ni < 0 || nj < 0 || ni >= gw || nj >= gd || !g[key(ni, nj)]) continue;
        if (di && dj && (!g[key(ci + di, cj)] || !g[key(ci, cj + dj)])) continue;
        const ng = gs.get(key(ci, cj)) + (di && dj ? 1.414 : 1);
        if (ng < (gs.get(key(ni, nj)) ?? Infinity)) { came.set(key(ni, nj), [ci, cj]); gs.set(key(ni, nj), ng); fs.set(key(ni, nj), ng + Math.hypot(ti - ni, tj - nj)); if (!open.some(o => o[0] === ni && o[1] === nj)) open.push([ni, nj]); }
      }
    }
    if (!found) return [to];
    const raw = []; let c = [ti, tj];
    while (c && !(c[0] === si && c[1] === sj)) { raw.unshift([(c[0] + .5) / 2, (c[1] + .5) / 2]); c = came.get(key(...c)); }
    raw[raw.length - 1] = to.slice();
    // string pulling
    const out = []; let cur = from;
    for (let i = 0; i < raw.length; i++) { if (i === raw.length - 1 || !los(cur, raw[i + 1])) { out.push(raw[i]); cur = raw[i]; } }
    return out;
  }

  /* ---------- actors ---------- */
  function addActor(id, opts = {}) {
    const ch = BF.figure.CAST[opts.cast || id];
    const a = {id, ch: {...ch, seed: hash(id.length * 7) * 10}, x: opts.x ?? 2, y: opts.y ?? 2, z: 0, dir: opts.dir || 'fr', pose: opts.pose || 'stand', phase: 0, path: [], speed: opts.speed || 2.7,
      expr: opts.expr || 'neutral', talking: false, visible: opts.visible !== false, seat: opts.seat || 32, item: opts.item || null, arm: null, blinkT: 2 + Math.random() * 3, blink: false, poseUntil: 0, lying: opts.lying || null, alpha: 1};
    W.actors[id] = a; return a;
  }
  function dirFrom(dx, dy, prev) {
    if (Math.abs(dx) < .001 && Math.abs(dy) < .001) return prev;
    const sx = dx - dy, sy = dx + dy; // screen-ish
    if (sy >= 0) return sx >= 0 ? (Math.abs(dx) >= Math.abs(dy) ? 'fr' : 'fl') : 'fl';
    return sx >= 0 ? 'br' : 'bl';
  }
  function faceDir(dx, dy) {
    // pick the facing whose world axis best matches the vector
    const opts = [['fr', 1, 0], ['fl', 0, 1], ['bl', -1, 0], ['br', 0, -1]];
    let best = 'fr', bv = -Infinity; opts.forEach(([d, x, y]) => { const v = dx * x + dy * y; if (v > bv) { bv = v; best = d; } });
    return best;
  }
  W.faceDir = faceDir;
  function walkTo(a, tx, ty) {
    return new Promise(res => {
      if (a.pose && /^sit/.test(a.pose)) { a.pose = 'stand'; }
      a.lying = null;
      a.path = findPath([a.x, a.y], [tx, ty]); a.onArrive = res;
      if (!a.path.length) { a.onArrive = null; res(); }
    });
  }
  function stepActor(a, dt) {
    a.blinkT -= dt; if (a.blinkT < 0) { a.blink = !a.blink; a.blinkT = a.blink ? .12 : 2.5 + Math.random() * 3.5; }
    if (a.manual) { // direct keyboard movement
      const [vx, vy] = a.manual; const sp = a.speed * dt;
      if (vx || vy) {
        let nx = a.x + vx * sp, ny = a.y + vy * sp;
        if (!walkable(nx, a.y)) nx = a.x; if (!walkable(nx, ny)) ny = a.y;
        const moved = Math.hypot(nx - a.x, ny - a.y);
        a.x = nx; a.y = ny; a.pose = 'walk'; a.phase += moved * 2.4; a.dir = dirFrom(vx, vy, a.dir); a.path = [];
        if (moved < .0001) a.pose = 'stand';
        return;
      } else if (a.pose === 'walk' && !a.path.length) a.pose = 'stand';
    }
    if (!a.path.length) return;
    const [tx, ty] = a.path[0], dx = tx - a.x, dy = ty - a.y, d = Math.hypot(dx, dy);
    const sp = a.speed * dt;
    a.pose = 'walk';
    if (d <= sp) { a.x = tx; a.y = ty; a.path.shift(); a.phase += d * 2.4; if (!a.path.length) { a.pose = 'stand'; const r = a.onArrive; a.onArrive = null; r && r(); } }
    else { a.x += dx / d * sp; a.y += dy / d * sp; a.phase += sp * 2.4; a.dir = dirFrom(dx, dy, a.dir); }
  }

  /* ---------- camera ---------- */
  function roomScreenBox() {
    const L = W.loc;
    if (L.view) return L.view; // exteriors define their own framing box (world px)
    const wh = (L.wallH || 5.4) * ZS;
    const xs = [P(0, L.d)[0], P(L.w, 0)[0]], ys = [P(0, 0)[1] - wh, P(L.w, L.d)[1] + 20];
    return {x0: xs[0] - 20, x1: xs[1] + 20, y0: ys[0] - 10, y1: ys[1]};
  }
  function fitCamera(snap) {
    const b = roomScreenBox(), vw = W.vw, vh = W.vh - W.inset.top - W.inset.bottom;
    const z = Math.min(vw / (b.x1 - b.x0), vh / (b.y1 - b.y0)) * .94;
    W.cam.fitZ = clamp(z, .35, 2.2);
    W.cam.minZ = W.vw < 600 ? Math.max(W.cam.fitZ, .62) : W.cam.fitZ;
    if (W.cam.mode === 'fit') { W.cam.tz = W.cam.minZ * (W.cam.user || 1); W.cam.tx = (b.x0 + b.x1) / 2; W.cam.ty = (b.y0 + b.y1) / 2 + (W.inset.bottom - W.inset.top) / 2 / W.cam.tz; }
    if (snap) { W.cam.x = W.cam.tx; W.cam.y = W.cam.ty; W.cam.z = W.cam.tz; }
  }
  W.fitCamera = fitCamera;
  function updateCamera(dt) {
    const c = W.cam, b = roomScreenBox(), red = BF.settings.reduced();
    if (c.mode === 'fit') {
      fitCamera(false);
      // when the room is wider than the screen, follow the player horizontally
      const span = (b.x1 - b.x0) * c.tz, vspan = (b.y1 - b.y0) * c.tz;
      if ((span > W.vw || vspan > W.vh - W.inset.bottom) && W.player) {
        const p = P(W.player.x, W.player.y, 0);
        if (span > W.vw) c.tx = clamp(p[0], b.x0 + W.vw / 2 / c.tz, b.x1 - W.vw / 2 / c.tz);
        if (vspan > W.vh - W.inset.bottom - W.inset.top) c.ty = clamp(p[1] - 50, b.y0 + (W.vh / 2 - W.inset.top) / c.tz, b.y1 - (W.vh / 2 - W.inset.bottom) / c.tz);
      }
    } else if (c.mode === 'follow' && W.player) {
      const p = P(W.player.x, W.player.y, 0); c.tz = (c.followZ || 1) * (c.user || 1) * (W.vw < 600 ? .8 : 1);
      c.tx = clamp(p[0], b.x0 + W.vw / 2 / c.tz, Math.max(b.x0 + W.vw / 2 / c.tz, b.x1 - W.vw / 2 / c.tz));
      c.ty = clamp(p[1] - (W.loc.camLift || 40) + (W.inset.bottom - W.inset.top) / 2 / c.tz, b.y0 + W.vh / 2 / c.tz, Math.max(b.y0 + W.vh / 2 / c.tz, b.y1 - W.vh / 2 / c.tz));
    } else if (c.mode === 'focus' && c.focus) {
      c.tx = c.focus[0]; c.ty = c.focus[1] + (W.inset.bottom - W.inset.top) / 2 / c.tz; c.tz = c.focusZ || c.fitZ * 1.4;
    }
    const k = red ? 1 : 1 - Math.exp(-dt * (c.speed || 3.2));
    c.x = lerp(c.x, c.tx, k); c.y = lerp(c.y, c.ty, k); c.z = lerp(c.z, c.tz, k);
  }
  W.focusOn = (pts, zoom, speed) => { // pts: world points [x,y,z]
    const s = pts.map(p => P(p[0], p[1], p[2] || 0)); const cx = s.reduce((a, p) => a + p[0], 0) / s.length, cy = s.reduce((a, p) => a + p[1], 0) / s.length;
    const base = W.loc && W.loc.cam === 'follow' ? (W.cam.followZ || 1) * (W.vw < 600 ? .62 : .8) : W.cam.fitZ; W.cam.mode = 'focus'; W.cam.focus = [cx, cy - 50]; W.cam.focusZ = (zoom || 1.35) * base * (W.vw < 600 ? 1.15 : 1); W.cam.speed = speed || 2.2;
  };
  W.camReset = () => { W.cam.mode = W.loc.cam || 'fit'; W.cam.speed = 3.2; };
  const toScreen = (x, y, z = 0) => { const p = P(x, y, z); return [(p[0] - W.cam.x) * W.cam.z + W.vw / 2, (p[1] - W.cam.y) * W.cam.z + W.vh / 2]; };
  const toWorldFloor = (sx, sy) => { const px = (sx - W.vw / 2) / W.cam.z + W.cam.x, py = (sy - W.vh / 2) / W.cam.z + W.cam.y; const a = px / HW, b = py / HH; return [(a + b) / 2, (b - a) / 2]; };
  W.toScreen = toScreen; W.toWorldFloor = toWorldFloor;

  /* ---------- particles ---------- */
  W.emit = (kind, x, y, z, n = 1, opts = {}) => { for (let i = 0; i < n; i++) W.particles.push({kind, x: x + (Math.random() - .5) * (opts.spread || .1), y: y + (Math.random() - .5) * (opts.spread || .1), z, vz: opts.vz ?? .5, vx: opts.vx ?? 0, vy: opts.vy ?? 0, life: opts.life || 2, t: 0, size: opts.size || 1, color: opts.color}); };
  function stepParticles(dt) {
    W.particles.forEach(p => { p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt; if (p.kind === 'steam') { p.x += Math.sin(p.t * 3 + p.y * 9) * .004; } if (p.kind === 'rain') p.z += p.vz * dt * 4; });
    W.particles = W.particles.filter(p => p.t < p.life && p.z > -1);
    if (W.particles.length > 400) W.particles.splice(0, W.particles.length - 400);
  }
  function drawParticles(ctx) {
    W.particles.forEach(p => {
      const s = P(p.x, p.y, p.z), f = p.t / p.life;
      if (p.kind === 'steam') { ctx.fillStyle = `rgba(255,255,255,${.28 * (1 - f) * Math.min(1, p.t * 4)})`; ctx.beginPath(); ctx.arc(s[0], s[1], 3 + f * 9 * p.size, 0, 7); ctx.fill(); }
      if (p.kind === 'dust') { ctx.fillStyle = `rgba(255,240,210,${.5 * Math.sin(f * Math.PI)})`; ctx.fillRect(s[0], s[1], 1.6, 1.6); }
      if (p.kind === 'spark') { ctx.fillStyle = p.color || '#ffd166'; ctx.globalAlpha = 1 - f; ctx.beginPath(); ctx.arc(s[0], s[1], 2 * p.size, 0, 7); ctx.fill(); ctx.globalAlpha = 1; }
      if (p.kind === 'leaf') { ctx.fillStyle = p.color || '#c8873c'; ctx.save(); ctx.translate(s[0], s[1]); ctx.rotate(p.t * 3); ctx.fillRect(-3, -1.5, 6, 3); ctx.restore(); }
      if (p.kind === 'shaving') { ctx.fillStyle = `rgba(240,217,174,${1 - f})`; ctx.beginPath(); ctx.ellipse(s[0], s[1], 3, 1.4, p.t * 4, 0, 7); ctx.fill(); }
      if (p.kind === 'rain') { const e = P(p.x, p.y, p.z + .5); ctx.strokeStyle = 'rgba(190,205,235,.35)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(s[0], s[1]); ctx.lineTo(e[0] - 2, e[1]); ctx.stroke(); }
      if (p.kind === 'note') { ctx.fillStyle = `rgba(255,255,255,${.7 * (1 - f)})`; ctx.font = '12px serif'; ctx.fillText('♪', s[0], s[1]); }
    });
  }

  /* ---------- sprite cache for static art ---------- */
  const cache = new Map(), CK = 2;
  function sprite(ctx, key, b, fn) {
    let c = cache.get(key);
    if (!c) {
      const w = Math.ceil((b.x1 - b.x0) * CK), h = Math.ceil((b.y1 - b.y0) * CK);
      if (w <= 0 || h <= 0 || w * h > 16e6) { fn(ctx); return; }
      const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
      const cx = cv.getContext('2d'); cx.setTransform(CK, 0, 0, CK, -b.x0 * CK, -b.y0 * CK); fn(cx);
      c = {cv, b}; cache.set(key, c);
      if (cache.size > 220) cache.delete(cache.keys().next().value);
    }
    ctx.drawImage(c.cv, c.b.x0, c.b.y0, c.b.x1 - c.b.x0, c.b.y1 - c.b.y0);
  }
  W.sprite = sprite; W.clearCache = () => cache.clear();
  const STATIC = new Set(['building', 'bookshelf', 'shelves', 'table', 'chair', 'fridge', 'counter', 'bed', 'sofa', 'armchair', 'drawers', 'workbench', 'libdesk', 'bench', 'planter', 'busstop', 'car', 'fence', 'bin', 'rack', 'flowers', 'sidetable', 'box', 'pile', 'basket', 'wood', 'plant', 'cart', 'rocker', 'stool', 'bike', 'radiator']);
  const HMAX = {building: 14, bookshelf: 5, shelves: 5.2, fridge: 4.3, plant: 4, busstop: 6, bed: 2.2, sofa: 2.2, armchair: 2.2, workbench: 3, rocker: 2.5, libdesk: 4, cart: 2.4, bike: 2.2};
  function itemBounds(it) {
    const h = it.type === 'building' ? it.h + 1 : HMAX[it.type] || 3, z = it.z || 0, w = it.w || 1, d = (it.d || 1) + (it.awning ? 1.6 : 0);
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (const a of [it.x - .3, it.x + w + .3]) for (const bb of [it.y - .3, it.y + d + .3]) for (const zz of [z, z + h]) { const p = P(a, bb, zz); x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); }
    const m = it.type === 'plant' ? 50 : 18;
    return {x0: x0 - m, y0: y0 - m, x1: x1 + m, y1: y1 + m};
  }
  function itemKey(it, i) {
    const s = W.state, li = W.light;
    let k = W.locId + '#' + i + '#' + it.type;
    if (it.type === 'building') k += '|' + (li.night ? 1 : 0) + (li.wet ? 1 : 0) + JSON.stringify([s.street, s.bakery, s.laundry, s.lettering, ...(it.windows || []).map(w => w.id ? s[w.id] : 0)]);
    if (it.type === 'counter') k += JSON.stringify((it.parts || []).map(p => p.id ? s[p.id] : 0));
    if (it.type === 'bed' || it.type === 'sofa') { k += '|' + it.unmade; for (const a of Object.values(W.actors)) if (a.lying === it.id && a.visible) k += '|' + a.id; }
    if (it.type === 'cart' || it.type === 'rocker') k += JSON.stringify(s[it.id] || {});
    return k;
  }

  /* ---------- drawing ---------- */
  function drawables() {
    const out = [];
    W.items.forEach((it, i) => {
      if (it.hidden || (it.show && !it.show(W))) return;
      if (['rug', 'shavings'].includes(it.type)) return;
      const z0 = it.z || 0;
      const raw = ctx => it.draw ? it.draw(ctx, W, it) : (BF.art.F[it.type] || BF.ext[it.type])(ctx, it, S, W);
      const draw = !it.draw && STATIC.has(it.type) && it.cache !== false ? ctx => sprite(ctx, itemKey(it, i), itemBounds(it), raw) : raw;
      out.push({b: {x0: it.x, y0: it.y, x1: it.x + (it.w || .5), y1: it.y + (it.d || .5), z0}, layer: it.layer || 0, draw});
    });
    Object.values(W.actors).forEach(a => {
      if (!a.visible || a.lying) return;
      const r = a.seated ? .2 : .26;
      out.push({b: {x0: a.x - r, y0: a.y - r, x1: a.x + r, y1: a.y + r, z0: a.seated ? .6 : (a.z || 0) + .05}, layer: 5, actor: a, draw: ctx => drawActor(ctx, a)});
    });
    return sort(out);
  }
  function drawActor(ctx, a) {
    const p = P(a.x, a.y, a.z || 0);
    if (!a.seated) shadow(ctx, a.x, a.y, .35, .3, .26);
    BF.figure.draw(ctx, a.ch, p[0], p[1], {dir: a.dir, pose: a.pose, phase: a.phase, t: W.tFrame + (a.ch.seed || 0), expr: a.expr, talking: a.talking, blink: a.blink, seat: a.seat, item: a.item, arm: a.arm, lookDown: a.lookDown, alpha: a.alpha});
  }
  W.drawActor = drawActor;

  function render(dt) {
    W.tFrame += dt;
    const ctx = W.ctx, L = W.loc; if (!L) return;
    stepParticles(dt); Object.values(W.actors).forEach(a => stepActor(a, dt)); updateCamera(dt);
    if (W.reveal > 0) W.reveal -= dt;
    if (L.tick) L.tick(W, dt);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    // backdrop
    const li = W.light, g = ctx.createLinearGradient(0, 0, 0, W.cv.height);
    g.addColorStop(0, li.bg[0]); g.addColorStop(1, li.bg[1]); ctx.fillStyle = g; ctx.fillRect(0, 0, W.cv.width, W.cv.height);
    const camT = () => ctx.setTransform(W.cam.z * W.dpr, 0, 0, W.cam.z * W.dpr, (W.vw / 2 - W.cam.x * W.cam.z) * W.dpr, (W.vh / 2 - W.cam.y * W.cam.z) * W.dpr);
    if (L.type === 'exterior') { BF.ext.backdrop(ctx, W, camT); }
    camT();
    { const b = roomScreenBox(); const bb = {x0: b.x0 - 60, y0: b.y0 - 80, x1: b.x1 + 60, y1: b.y1 + 60};
      if (L.type === 'exterior') sprite(ctx, W.locId + '#ground' + (W.light.wet ? 'w' : ''), bb, c => BF.ext.ground(c, L, S, W));
      else { sprite(ctx, W.locId + '#base', bb, c => BF.art.roomBase(c, L, S)); BF.art.roomFeatures(ctx, L, S); } }
    W.items.forEach(it => { if (['rug', 'shavings'].includes(it.type) && !(it.show && !it.show(W))) BF.art.F[it.type](ctx, it, S); });
    if (L.under) L.under(ctx, W);
    // hover / focus ring under objects
    const hl = W.focusObj || W.hover;
    const revealAll = W.reveal > 0 || BF.settings.get('highContrast');
    if (W.exploring) Object.values(W.objects).forEach(o => { if (o.hidden || (o.when && !o.when(W))) return; if (o === hl || revealAll) ring(ctx, o, o === hl ? 1 : .55); });
    drawables().forEach(d => d.draw(ctx));
    if (L.over) L.over(ctx, W);
    drawParticles(ctx);
    // markers above objects
    if (W.exploring) Object.values(W.objects).forEach(o => { if (o.hidden || (o.when && !o.when(W))) return; if (o === hl || revealAll) marker(ctx, o, o === hl); });
    lightPass(ctx, camT);
    if (L.post) { camT(); L.post(ctx, W); }
  }
  function objCenter(o) { const b = o.box; return [(b[0] + b[2]) / 2, (b[1] + b[3]) / 2, b[5] ?? 1]; }
  W.objCenter = objCenter;
  function ring(ctx, o, k) {
    const b = o.box, cx = (b[0] + b[2]) / 2, cy = (b[1] + b[3]) / 2, z = b[4] || 0;
    const p = P(cx, cy, z), rx = Math.max(.6, (b[2] - b[0] + b[3] - b[1]) * .45) * HW;
    const pulse = .75 + Math.sin(W.tFrame * 3.2) * .25;
    ctx.save(); ctx.translate(p[0], p[1]); ctx.scale(1, .5);
    ctx.strokeStyle = `rgba(255,236,190,${.55 * k * pulse})`; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.arc(0, 0, rx, 0, 7); ctx.stroke();
    ctx.restore();
  }
  function marker(ctx, o, strong) {
    const c = objCenter(o), p = P(c[0], c[1], (o.box[5] ?? 1) + .5);
    const bob = Math.sin(W.tFrame * 2.6) * 2.5;
    ctx.save(); ctx.translate(p[0], p[1] - 10 + bob);
    ctx.fillStyle = strong ? 'rgba(255,240,205,.98)' : 'rgba(255,240,205,.7)'; ctx.strokeStyle = 'rgba(40,30,40,.55)'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(0, -6); ctx.lineTo(5, 0); ctx.lineTo(0, 6); ctx.lineTo(-5, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.restore();
  }
  function lightPass(ctx, camT) {
    const li = W.light, lc = W.lctx, s = W.lscale;
    lc.setTransform(1, 0, 0, 1, 0, 0); lc.globalCompositeOperation = 'source-over';
    lc.fillStyle = li.ambient; lc.fillRect(0, 0, W.lcv.width, W.lcv.height);
    lc.setTransform(W.cam.z * W.dpr * s, 0, 0, W.cam.z * W.dpr * s, (W.vw / 2 - W.cam.x * W.cam.z) * W.dpr * s, (W.vh / 2 - W.cam.y * W.cam.z) * W.dpr * s);
    lc.globalCompositeOperation = 'lighter';
    const lights = (W.loc.lights || []).concat(li.extra || []);
    lights.forEach(l => {
      if (l.when && !l.when(W)) return;
      if (l.kind === 'window') { if (li.night) return; windowShaft(lc, l, li); return; }
      if (l.night && !li.night) return; if (l.day && li.night) return;
      const p = P(l.x, l.y, l.z || 0), r = (l.r || 4) * HW * 1.3;
      const fl = l.flicker ? 1 + Math.sin(W.tFrame * 13 + l.x) * .03 + Math.sin(W.tFrame * 7.3) * .03 : 1;
      const g = lc.createRadialGradient(p[0], p[1], 0, p[0], p[1], r * fl);
      g.addColorStop(0, alpha(l.color || '#ffd9a0', (l.i ?? .8))); g.addColorStop(.45, alpha(l.color || '#ffd9a0', (l.i ?? .8) * .45)); g.addColorStop(1, alpha(l.color || '#ffd9a0', 0));
      lc.fillStyle = g; lc.save(); lc.translate(p[0], p[1]); lc.scale(1, l.flat ? .55 : .8); lc.translate(-p[0], -p[1]); lc.beginPath(); lc.arc(p[0], p[1], r * fl, 0, 7); lc.fill(); lc.restore();
    });
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(W.lcv, 0, 0, W.cv.width, W.cv.height);
    ctx.globalCompositeOperation = 'source-over';
    // glow for bulbs and lit windows at night
    camT(); ctx.globalCompositeOperation = 'screen';
    lights.forEach(l => {
      if (!l.bulb || (l.when && !l.when(W)) || (l.night && !li.night)) return;
      const p = P(l.x, l.y, l.bz ?? l.z ?? 2), r = l.bulb * HW;
      const g = ctx.createRadialGradient(p[0], p[1], 0, p[0], p[1], r); g.addColorStop(0, alpha(l.color || '#ffd9a0', .55)); g.addColorStop(1, alpha(l.color || '#ffd9a0', 0));
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p[0], p[1], r, 0, 7); ctx.fill();
    });
    ctx.globalCompositeOperation = 'source-over';
    // vignette
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const v = ctx.createRadialGradient(W.cv.width / 2, W.cv.height * .45, Math.min(W.cv.width, W.cv.height) * .35, W.cv.width / 2, W.cv.height / 2, Math.max(W.cv.width, W.cv.height) * .75);
    v.addColorStop(0, 'rgba(10,6,18,0)'); v.addColorStop(1, `rgba(10,6,18,${li.vignette ?? .45})`); ctx.fillStyle = v; ctx.fillRect(0, 0, W.cv.width, W.cv.height);
  }
  function windowShaft(lc, l, li) {
    // sunlight through a window on the back-right wall (y=0) falling into the room along +y, drifting +x
    const sx = li.sunX ?? .6, len = l.len || 5.5, a0 = l.x, a1 = l.x + l.w;
    BF.iso.plane.floor(lc, 0, 0, .01, c => {
      const g = c.createLinearGradient(0, 0, 0, len); g.addColorStop(0, alpha(li.sun || '#fff1d6', .75)); g.addColorStop(1, alpha(li.sun || '#fff1d6', 0));
      c.fillStyle = g; c.beginPath();
      if (l.wall === 'L') { c.moveTo(0, a0); c.lineTo(0, a1); c.lineTo(len, a1 + sx * len * .5); c.lineTo(len, a0 + sx * len * .5); }
      else { c.moveTo(a0, 0); c.lineTo(a1, 0); c.lineTo(a1 + sx * len, len); c.lineTo(a0 + sx * len, len); }
      c.closePath(); c.fill();
    });
  }

  /* ---------- picking ---------- */
  function hull(pts) {
    pts.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lo = [], up = [];
    for (const p of pts) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
    for (const p of pts.slice().reverse()) { while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
    return lo.slice(0, -1).concat(up.slice(0, -1));
  }
  function objPoly(o) {
    const b = o.box, pts = [];
    for (const x of [b[0], b[2]]) for (const y of [b[1], b[3]]) for (const z of [b[4] || 0, b[5] ?? 1]) pts.push(toScreen(x, y, z));
    return hull(pts);
  }
  W.objPoly = objPoly;
  const inPoly = (pt, poly) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const a = poly[i], b = poly[j]; if ((a[1] > pt[1]) !== (b[1] > pt[1]) && pt[0] < (b[0] - a[0]) * (pt[1] - a[1]) / (b[1] - a[1]) + a[0]) c = !c; } return c; };
  function pick(sx, sy) {
    // front-most object wins: sort by depth (x+y of box front corner, then height)
    const cand = Object.values(W.objects).filter(o => !o.hidden && !(o.when && !o.when(W)) && inPoly([sx, sy], objPoly(o)));
    // actors as objects
    cand.sort((a, b) => (b.box[2] + b.box[3] + (b.pri || 0)) - (a.box[2] + a.box[3] + (a.pri || 0)));
    return cand[0] || null;
  }
  W.pick = pick;
  W.findPath = findPath; W.addActor = addActor; W.walkTo = walkTo; W.load = load; W.init = init; W.render = render; W.nearestWalkable = nearestWalkable; W.dirFrom = dirFrom; W.resize = resize;
  return W;
})();

/* lighting presets */
BF.lighting = {
  dawn: {ambient: '#7d7fa8', bg: ['#1b1b33', '#2b2540'], sky: ['#3c4778', '#e9a27f'], night: true, vignette: .55},
  morning: {ambient: '#e9dfd3', bg: ['#2a2433', '#3a3040'], sky: ['#8fc0e6', '#f6e2c2'], sun: '#fff0cf', sunX: .7, vignette: .38},
  day: {ambient: '#eee7dd', bg: ['#262230', '#352d3d'], sky: ['#8fc0e6', '#e9eef0'], sun: '#fff7e8', sunX: .3, vignette: .35},
  afternoon: {ambient: '#eadbc8', bg: ['#2a2230', '#3d2e38'], sky: ['#94b7d8', '#f6cf9a'], sun: '#ffd9a3', sunX: -.2, vignette: .38},
  golden: {ambient: '#e4c9a8', bg: ['#2d2230', '#47303a'], sky: ['#d98b6a', '#f6c48a'], sun: '#ffc27a', sunX: -.6, vignette: .42},
  dusk: {ambient: '#8b84a6', bg: ['#1d1a2c', '#2c2238'], sky: ['#3d3f73', '#d9877a'], night: true, vignette: .5},
  night: {ambient: '#59587d', bg: ['#121224', '#1d1a2e'], sky: ['#141a36', '#2a2d52'], night: true, vignette: .55},
  dim: {ambient: '#a9a3b4', bg: ['#1d1a26', '#2a2430'], sky: ['#9aa6b5', '#c8c3c0'], sun: '#e9e2d6', sunX: .2, vignette: .5},
  rainy: {ambient: '#6d7090', bg: ['#141626', '#1e1e30'], sky: ['#22273e', '#3a3d58'], night: true, vignette: .55, rain: true, wet: true, stars: 0},
};
