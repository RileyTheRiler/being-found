/* Isometric projection, plane drawing and depth sorting. One world unit = one floor tile (about half a metre). */
'use strict';
BF.iso = (() => {
  const HW = 32, HH = 16, ZS = 36;
  const P = (x, y, z = 0) => [(x - y) * HW, (x + y) * HH - z * ZS];
  const V = (x, y, z = 0) => [(x - y) * HW, (x + y) * HH - z * ZS];
  const {shade} = BF.c;

  /* Draw in a local 2D plane: local (u,v) -> world origin + u*U + v*Vv. Text and rects drawn in fn appear on the plane. */
  function face(ctx, o, U, W, fn) {
    const a = V(...U), c = V(...W), e = P(...o);
    ctx.save(); ctx.transform(a[0], a[1], c[0], c[1], e[0], e[1]); fn(ctx); ctx.restore();
  }
  // Common planes. Each takes a top-left origin as the viewer sees it, with v running downward.
  const plane = {
    floor: (ctx, x, y, z, fn) => face(ctx, [x, y, z], [1, 0, 0], [0, 1, 0], fn),
    // a surface facing +y (lower-left as seen). u runs along +x, v runs down.
    southY: (ctx, x, y, zTop, fn) => face(ctx, [x, y, zTop], [1, 0, 0], [0, 0, -1], fn),
    // a surface facing +x (lower-right as seen). u runs along -y, v runs down.
    eastX: (ctx, x, y, zTop, fn) => face(ctx, [x, y, zTop], [0, -1, 0], [0, 0, -1], fn),
  };

  function poly(ctx, pts, fill, stroke, lw = 1) {
    ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath();
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
  }

  /* An axis-aligned box. col may be a string (auto-shaded) or {top,left,right}. */
  function box(ctx, x, y, z, w, d, h, col, opt = {}) {
    const top = typeof col === 'string' ? shade(col, 1.06) : col.top;
    const left = typeof col === 'string' ? shade(col, .84) : col.left;
    const right = typeof col === 'string' ? shade(col, .68) : col.right;
    const x1 = x + w, y1 = y + d, z1 = z + h;
    const edge = opt.edge === undefined ? 'rgba(20,16,24,.28)' : opt.edge;
    // front-left face (y = y1)
    if (!opt.noLeft) poly(ctx, [P(x, y1, z), P(x1, y1, z), P(x1, y1, z1), P(x, y1, z1)], left, edge, .8);
    // front-right face (x = x1)
    if (!opt.noRight) poly(ctx, [P(x1, y, z), P(x1, y1, z), P(x1, y1, z1), P(x1, y, z1)], right, edge, .8);
    if (!opt.noTop) poly(ctx, [P(x, y, z1), P(x1, y, z1), P(x1, y1, z1), P(x, y1, z1)], top, edge, .8);
    if (opt.hi !== false && !opt.noTop) { // a light rim on the two front top edges reads as bevel
      ctx.beginPath(); const a = P(x, y1, z1), b = P(x1, y1, z1), c = P(x1, y, z1);
      ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]);
      ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.lineWidth = 1; ctx.stroke();
    }
  }
  /* A vertical cylinder (plant pots, cups, lamps) */
  function cyl(ctx, x, y, z, r, h, col, opt = {}) {
    const c = P(x, y, z), t = P(x, y, z + h), rx = r * HW * 1.414, ry = r * HH * 1.414;
    const g = ctx.createLinearGradient(c[0] - rx, 0, c[0] + rx, 0);
    g.addColorStop(0, shade(col, 1.05)); g.addColorStop(.55, shade(col, .85)); g.addColorStop(1, shade(col, .6));
    ctx.beginPath(); ctx.ellipse(c[0], c[1], rx, ry, 0, 0, Math.PI); ctx.lineTo(t[0] - rx, t[1]);
    ctx.ellipse(t[0], t[1], rx, ry, 0, Math.PI, 0, true); ctx.closePath(); ctx.fillStyle = g; ctx.fill();
    if (opt.edge !== false) { ctx.strokeStyle = 'rgba(20,16,24,.25)'; ctx.lineWidth = .8; ctx.stroke(); }
    if (!opt.open) { ctx.beginPath(); ctx.ellipse(t[0], t[1], rx, ry, 0, 0, Math.PI * 2); ctx.fillStyle = opt.top || shade(col, 1.12); ctx.fill(); }
    else { ctx.beginPath(); ctx.ellipse(t[0], t[1], rx, ry, 0, 0, Math.PI * 2); ctx.fillStyle = opt.inner || shade(col, .5); ctx.fill(); }
  }
  function shadow(ctx, x, y, rx, ry, a = .22, z = 0) {
    const c = P(x, y, z);
    const g = ctx.createRadialGradient(c[0], c[1], 0, c[0], c[1], rx * HW * 1.5);
    g.addColorStop(0, `rgba(20,14,30,${a})`); g.addColorStop(1, 'rgba(20,14,30,0)');
    ctx.save(); ctx.translate(c[0], c[1]); ctx.scale(1, ry / rx * .5 + .25);
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, rx * HW * 1.5, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  }
  /* footprint shadow under furniture: a soft parallelogram */
  function footShadow(ctx, x, y, w, d, a = .18) {
    poly(ctx, [P(x - .14, y), P(x + w + .2, y), P(x + w + .26, y + d + .26), P(x - .06, y + d + .26)], `rgba(25,18,30,${a * .45})`);
    poly(ctx, [P(x - .04, y + .06), P(x + w + .1, y + .06), P(x + w + .14, y + d + .14), P(x, y + d + .14)], `rgba(25,18,30,${a * .6})`);
  }

  /* Depth sort: items have bounds b={x0,y0,x1,y1,z0}. A is drawn before B when A lies behind B. */
  function behind(a, b) {
    const A = a.b, B = b.b, e = .001;
    const ax = A.x1 <= B.x0 + e, bx = B.x1 <= A.x0 + e, ay = A.y1 <= B.y0 + e, by = B.y1 <= A.y0 + e;
    if ((ax || ay) && !(bx || by)) return -1;
    if ((bx || by) && !(ax || ay)) return 1;
    if ((ax || ay) && (bx || by)) { // diagonal neighbours: compare by centre
      return ((A.x0 + A.x1) + (A.y0 + A.y1)) - ((B.x0 + B.x1) + (B.y0 + B.y1)) < 0 ? -1 : 1;
    }
    // overlapping footprints: lower things first, then by layer, then by front edge
    if ((A.z0 || 0) !== (B.z0 || 0)) return (A.z0 || 0) - (B.z0 || 0);
    if ((a.layer || 0) !== (b.layer || 0)) return (a.layer || 0) - (b.layer || 0);
    return (A.x1 + A.y1) - (B.x1 + B.y1);
  }
  function sort(items) {
    const n = items.length, out = [], state = new Array(n).fill(0);
    const before = items.map(() => []);
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
      const r = behind(items[i], items[j]);
      if (r < 0) before[j].push(i); else if (r > 0) before[i].push(j);
    }
    const visit = i => {
      if (state[i] === 2) return; if (state[i] === 1) return; // cycle: break it
      state[i] = 1; before[i].forEach(visit); state[i] = 2; out.push(items[i]);
    };
    // visit in rough back-to-front order to keep cycles stable
    items.map((it, i) => [it.b.x0 + it.b.y0 + it.b.x1 + it.b.y1, i]).sort((p, q) => p[0] - q[0]).forEach(p => visit(p[1]));
    return out;
  }
  return {HW, HH, ZS, P, V, face, plane, poly, box, cyl, shadow, footShadow, sort};
})();
