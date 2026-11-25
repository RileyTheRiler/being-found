/* Exterior art: sky, street, facades with lit windows, trees, lamps, the bus. */
'use strict';
BF.ext = (() => {
  const {P, plane, poly, box, cyl, shadow, footShadow, HW, HH, ZS, face} = BF.iso;
  const {shade, alpha, mix} = BF.c;
  const H = BF.u.hash;
  const E = {};

  E.backdrop = (ctx, W, camT) => {
    const li = W.light, w = W.cv.width, h = W.cv.height;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const g = ctx.createLinearGradient(0, 0, 0, h * .85); g.addColorStop(0, li.sky[0]); g.addColorStop(1, li.sky[1]);
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    if (li.night) { for (let i = 0; i < 90; i++) { const tw = .5 + Math.sin(W.tFrame * 1.5 + i) * .5; ctx.fillStyle = `rgba(255,255,240,${.25 + tw * .5 * (li.stars ?? 1)})`; ctx.fillRect(H(i) * w, H(i * 2.3) * h * .5, 1.5 * W.dpr, 1.5 * W.dpr); } }
    // drifting clouds, parallax with camera
    for (let i = 0; i < 6; i++) {
      const cx = ((H(i * 5) * w * 1.6 + W.tFrame * (6 + i * 2) * W.dpr - W.cam.x * .15 * W.dpr) % (w * 1.6)) - w * .3, cy = (H(i * 7) * .3 + .05) * h;
      ctx.fillStyle = alpha(li.night ? '#3a3a5a' : '#ffffff', li.night ? .35 : .55);
      for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.ellipse(cx + k * 34 * W.dpr, cy + (k % 2) * 6 * W.dpr, 40 * W.dpr, 14 * W.dpr, 0, 0, 7); ctx.fill(); }
    }
    // distant skyline
    camT();
    const L = W.loc;
    const sky = BF.c.mix(li.sky[1], li.sky[0], .45), sil = alpha(BF.c.mix(sky, li.night ? '#0d0d1c' : '#4a4f68', .35), li.night ? .8 : .42);
    for (let i = -6; i < 30; i++) { const bx = i * 2.2 - 2, bh = 10.5 + H(i + 3) * 3.5, a = P(bx, -3, 0), b = P(bx, -3, bh), wd = (1.4 + H(i * 5) * 1.2) * HW; ctx.fillStyle = sil; ctx.fillRect(a[0], b[1], wd, a[1] - b[1]); if (li.night) { ctx.fillStyle = alpha('#e9c27a', .55); for (let k = 0; k < 3; k++) if (H(i * 9 + k) > .7) ctx.fillRect(a[0] + 8 + k * 14, b[1] + 14 + H(k + i) * 40, 3, 5); } }
    // the land the street sits on, fading into the dark at the edges
    const g0 = P(-40, -3, -.62), g1 = P(W.loc.w + 40, -3, -.62), g2 = P(W.loc.w + 40, W.loc.d + 40, -.62), g3 = P(-40, W.loc.d + 40, -.62);
    ctx.fillStyle = li.night ? '#17141f' : '#2a2530'; ctx.beginPath(); ctx.moveTo(...g0); ctx.lineTo(...g1); ctx.lineTo(...g2); ctx.lineTo(...g3); ctx.closePath(); ctx.fill();
  };

  E.ground = (ctx, L, S, W) => {
    const night = W.light.night;
    // base slab
    box(ctx, 0, 0, -.6, L.w, L.d, .6, {top: '#000', left: '#3c3540', right: '#2f2933'}, {noTop: true, edge: 'rgba(0,0,0,.3)'});
    plane.floor(ctx, 0, 0, 0, c => {
      // sidewalk
      c.fillStyle = '#b9b2a8'; c.fillRect(0, 0, L.w, L.road[0]);
      c.strokeStyle = alpha('#6f6860', .35); c.lineWidth = .03;
      for (let x = 0; x < L.w; x += 1.5) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, L.road[0]); c.stroke(); }
      for (let y = 0; y < L.road[0]; y += 1.5) { c.beginPath(); c.moveTo(0, y); c.lineTo(L.w, y); c.stroke(); }
      // curb
      c.fillStyle = '#d8d2c8'; c.fillRect(0, L.road[0] - .25, L.w, .25);
      // road
      c.fillStyle = '#4a4650'; c.fillRect(0, L.road[0], L.w, L.road[1] - L.road[0]);
      for (let k = 0; k < 300; k++) { c.fillStyle = alpha(H(k) > .5 ? '#fff' : '#000', .05); c.fillRect(H(k * 1.7) * L.w, L.road[0] + H(k * 3.1) * (L.road[1] - L.road[0]), .15, .15); }
      c.fillStyle = alpha('#f1e9c9', .8); const mid = (L.road[0] + L.road[1]) / 2;
      for (let x = .5; x < L.w; x += 2.6) c.fillRect(x, mid - .06, 1.4, .12);
      // crosswalk
      if (L.crossing) for (let k = 0; k < 6; k++) c.fillRect(L.crossing + k * .55, L.road[0] + .3, .35, L.road[1] - L.road[0] - .6);
      // far sidewalk
      c.fillStyle = '#aaa39a'; c.fillRect(0, L.road[1], L.w, L.d - L.road[1]); c.fillStyle = '#cfc8be'; c.fillRect(0, L.road[1], L.w, .2);
      // park grass
      if (L.park) { c.fillStyle = '#6d8f55'; c.fillRect(L.park[0], 0, L.park[1] - L.park[0], L.road[0] - .3); c.fillStyle = alpha('#8db06b', .7); for (let k = 0; k < 140; k++) c.fillRect(L.park[0] + H(k) * (L.park[1] - L.park[0]), H(k * 2) * (L.road[0] - .4), .08, .16); c.fillStyle = '#c9b79a'; c.fillRect(L.park[0] + 1, 1.6, L.park[1] - L.park[0] - 1, .9); }
      // wet sheen
      if (W.light.wet) { c.fillStyle = alpha('#9fb3d6', .12); c.fillRect(0, 0, L.w, L.d); }
    });
  };

  /* ---------- buildings ---------- */
  E.building = (ctx, it, S, W) => {
    const {x, y, w, d} = it, h = it.h, night = W.light.night;
    const col = it.color;
    box(ctx, x, y, 0, w, d, h, {top: shade(col, .7), left: col, right: shade(col, .75)}, {edge: 'rgba(0,0,0,.25)', hi: false});
    // cornice
    box(ctx, x - .1, y + d - .05, h - .35, w + .2, .3, .35, shade(it.trim || '#e8e0d0', .95), {hi: false});
    plane.southY(ctx, x, y + d + .003, h, c => {
      if (it.brick) { c.strokeStyle = alpha(shade(col, .55), .4); c.lineWidth = .03; for (let yy = .5, r = 0; yy < h; yy += .34, r++) { c.beginPath(); c.moveTo(0, yy); c.lineTo(w, yy); c.stroke(); for (let xx = (r % 2) * .4; xx < w; xx += .8) { c.beginPath(); c.moveTo(xx, yy); c.lineTo(xx, yy + .34); c.stroke(); } } }
      // stucco streaks
      else { for (let k = 0; k < 30; k++) { c.fillStyle = alpha(H(k) > .5 ? '#fff' : '#000', .04); c.fillRect(H(k * 3) * w, H(k * 5) * h, .2, 1 + H(k) * 2); } }
      // windows
      (it.windows || []).forEach(wn => {
        const st = W.state[wn.id] || {}, sl = W.state.street || {}; const hv = H(wn.u * 7 + wn.v * 3 + x); const lit = night ? (st.lit ?? wn.lit ?? (sl.f !== undefined ? hv < sl.f : hv > .45)) : false;
        const wx = wn.u, wy = h - wn.v - (wn.h || 1.9), ww = wn.w || 1.3, wh = wn.h || 1.9;
        c.fillStyle = shade(it.trim || '#e8e0d0', .9); c.fillRect(wx - .12, wy - .12, ww + .24, wh + .3);
        if (lit) { const g = c.createLinearGradient(0, wy, 0, wy + wh); g.addColorStop(0, wn.warm === false ? '#a9c4e8' : '#ffd88f'); g.addColorStop(1, wn.warm === false ? '#6d8fc0' : '#f0a85a'); c.fillStyle = g; }
        else { const g = c.createLinearGradient(0, wy, 0, wy + wh); g.addColorStop(0, night ? '#2a2f4a' : '#9fb8cf'); g.addColorStop(1, night ? '#1a1d30' : '#5f7891'); c.fillStyle = g; }
        c.fillRect(wx, wy, ww, wh);
        if (!lit && !night) { c.fillStyle = alpha('#fff', .25); c.beginPath(); c.moveTo(wx + ww * .2, wy); c.lineTo(wx + ww * .55, wy); c.lineTo(wx + ww * .15, wy + wh); c.lineTo(wx, wy + wh); c.lineTo(wx, wy + wh * .7); c.fill(); }
        if (wn.curtain) { c.fillStyle = alpha(wn.curtain, lit ? .85 : .95); const op = st.curtain ?? wn.open ?? .5; c.fillRect(wx, wy, ww * (1 - op) / 2, wh); c.fillRect(wx + ww - ww * (1 - op) / 2, wy, ww * (1 - op) / 2, wh); }
        if (wn.plant) { c.fillStyle = '#3f7d4e'; for (let k = 0; k < 5; k++) { c.beginPath(); c.arc(wx + .2 + k * .2, wy + wh - .2 - (k % 2) * .12, .14, 0, 7); c.fill(); } }
        if (wn.figure && lit) { c.fillStyle = alpha('#3a2a3a', .55); c.beginPath(); c.ellipse(wx + ww * .55, wy + wh * .45, .16, .2, 0, 0, 7); c.fill(); c.fillRect(wx + ww * .55 - .22, wy + wh * .55, .44, wh * .45); }
        c.strokeStyle = it.trim || '#e8e0d0'; c.lineWidth = .08; c.strokeRect(wx, wy, ww, wh); c.beginPath(); c.moveTo(wx + ww / 2, wy); c.lineTo(wx + ww / 2, wy + wh); c.stroke();
        c.fillStyle = shade(it.trim || '#e8e0d0', .85); c.fillRect(wx - .2, wy + wh, ww + .4, .14);
        if (wn.label && it.labels) { c.fillStyle = alpha('#000', .4); c.font = '.3px sans-serif'; c.fillText(wn.label, wx, wy - .2); }
      });
      // doors and shopfronts
      (it.doors || []).forEach(dr => {
        const dx = dr.u, dw = dr.w || 1.6, dh = dr.h || 3.4;
        c.fillStyle = shade(it.trim || '#e8e0d0', .85); c.fillRect(dx - .2, h - dh - .25, dw + .4, dh + .25);
        c.fillStyle = dr.color || '#2f4858'; c.fillRect(dx, h - dh, dw, dh);
        c.fillStyle = night ? '#ffd88f' : alpha('#9fb8cf', .9); c.fillRect(dx + .2, h - dh + .3, dw - .4, dh * .35);
        c.fillStyle = '#d9b45a'; c.beginPath(); c.arc(dx + dw - .3, h - dh * .45, .07, 0, 7); c.fill();
        if (dr.number) { c.fillStyle = '#f3efe6'; c.font = 'bold .42px Georgia'; c.textAlign = 'center'; c.fillText(dr.number, dx + dw / 2, h - dh - .45); }
        c.fillStyle = '#8a8378'; c.fillRect(dx - .3, h - .12, dw + .6, .12);
      });
      if (it.shop) {
        const sp = it.shop, sh = sp.h || 3.6;
        c.fillStyle = sp.frame || '#5b2c2a'; c.fillRect(sp.u - .2, h - sh - 1.1, sp.w + .4, sh + 1.1);
        // fascia lettering
        c.fillStyle = sp.fascia || '#1d2b3a'; c.fillRect(sp.u, h - sh - .95, sp.w, .8);
        c.fillStyle = '#e3b448'; c.font = 'italic bold .58px Georgia'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(sp.name, sp.u + sp.w / 2, h - sh - .53);
        // window glass
        const gx = sp.u + .15, gw = sp.w - 2.1, gy = h - sh + .1, gh = sh - .9;
        const shopLit = night && ((W.state[sp.kind] || {}).lit ?? true); const gg = c.createLinearGradient(0, gy, 0, gy + gh); gg.addColorStop(0, shopLit ? '#ffcf86' : night ? '#2a2f4a' : '#c6d6df'); gg.addColorStop(1, shopLit ? '#e59a54' : night ? '#1a1d30' : '#7d97a8');
        c.fillStyle = gg; c.fillRect(gx, gy, gw, gh);
        if (!night) { c.fillStyle = alpha('#fff', .3); c.beginPath(); c.moveTo(gx + gw * .1, gy); c.lineTo(gx + gw * .35, gy); c.lineTo(gx + gw * .1, gy + gh); c.lineTo(gx, gy + gh); c.fill(); }
        if (sp.kind === 'laundry') {
          for (let k = 0; k < 4; k++) { const mx = gx + .45 + k * (gw - .7) / 4; c.fillStyle = '#e9ecec'; c.fillRect(mx - .3, gy + gh - 1.3, .6, 1.2); c.fillStyle = night ? '#9fc3d6' : '#6f8fa6'; c.beginPath(); c.arc(mx, gy + gh - .75, .2, 0, 7); c.fill(); c.strokeStyle = '#8a9aa3'; c.lineWidth = .04; c.stroke(); }
          c.fillStyle = '#f3efe6'; c.font = '.22px sans-serif'; c.textAlign = 'center'; c.fillText('SERVICE WASH', gx + gw / 2, gy + .4);
        } else {
        // shelves of bread
        c.fillStyle = '#7a4a2a'; c.fillRect(gx + .2, gy + gh - .9, gw - .4, .08); c.fillRect(gx + .2, gy + gh - 1.7, gw - .4, .08);
        for (let k = 0; k < 9; k++) { c.fillStyle = ['#d99a4e', '#c27f3a', '#e8b46a'][k % 3]; c.beginPath(); c.ellipse(gx + .5 + k * (gw - .8) / 9, gy + gh - 1.05, .22, .13, 0, 0, 7); c.ellipse(gx + .6 + k * (gw - .8) / 9, gy + gh - 1.85, .2, .12, 0, 0, 7); c.fill(); }
        // the gold window lettering
        const lift = (W.state.lettering || {}).lifting ?? true;
        c.fillStyle = '#e8b93f'; c.strokeStyle = '#7a4a12'; c.lineWidth = .025; c.font = 'italic bold .78px Georgia'; c.textAlign = 'center';
        c.save(); c.translate(gx + gw / 2, gy + .85);
        if (lift) { c.save(); c.translate(-1.35, 0); c.rotate(-.06); c.fillText('F', 0, 0); c.strokeText('F', 0, 0); c.restore(); c.fillText('    erro’s', 0, 0); c.strokeText('    erro’s', 0, 0); }
        else { c.fillText('Ferro’s', 0, 0); c.strokeText('Ferro’s', 0, 0); }
        c.font = '.26px Georgia'; c.fillText('BAKERY  ·  SINCE 1971', 0, .45); c.restore();
        }
        // shop door
        c.fillStyle = '#5b2c2a'; c.fillRect(sp.u + sp.w - 1.75, h - sh + .1, 1.55, sh - .1); c.fillStyle = night ? '#ffd88f' : '#a9bfcc'; c.fillRect(sp.u + sp.w - 1.6, h - sh + .3, 1.25, sh * .55);
        c.fillStyle = '#f3efe6'; c.font = '.2px sans-serif'; c.fillText(night ? 'CLOSED' : 'OPEN', sp.u + sp.w - .97, h - sh * .45 + .3);
      }
      if (it.plaque) { c.fillStyle = '#c9a74d'; c.fillRect(it.plaque.u, h - it.plaque.v, .9, .55); c.fillStyle = '#5a4520'; c.font = '.14px Georgia'; c.textAlign = 'center'; c.fillText(it.plaque.text, it.plaque.u + .45, h - it.plaque.v + .3); }
    });
    if (it.awning) { // striped awning sticking out over the shopfront
      const a = it.awning, z = a.z, x0 = x + a.u, x1 = x0 + a.w, y0 = y + d, y1 = y + d + 1.3;
      const pts = [P(x0, y0, z + .9), P(x1, y0, z + .9), P(x1, y1, z), P(x0, y1, z)];
      ctx.save(); ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(...p) : ctx.moveTo(...p)); ctx.closePath(); ctx.clip();
      for (let k = 0; k < 16; k++) { const s0 = P(x0 + k * a.w / 16, y0, z + .9), s1 = P(x0 + (k + 1) * a.w / 16, y0, z + .9), s2 = P(x0 + (k + 1) * a.w / 16, y1, z), s3 = P(x0 + k * a.w / 16, y1, z); poly(ctx, [s0, s1, s2, s3], k % 2 ? '#f3efe6' : a.color); }
      ctx.restore();
      for (let k = 0; k < 16; k++) { const s = P(x0 + (k + .5) * a.w / 16, y1, z); ctx.fillStyle = k % 2 ? '#f3efe6' : a.color; ctx.beginPath(); ctx.arc(s[0], s[1], 6, 0, Math.PI); ctx.fill(); }
    }
  };
  E.tree = (ctx, it, S, W) => {
    const {x, y} = it, s = it.size || 1, autumn = it.autumn;
    shadow(ctx, x + .5, y + .5, 1.2 * s, .8, .22);
    plane.floor(ctx, x - .1, y - .1, .01, c => { c.fillStyle = '#6b5440'; c.fillRect(0, 0, 1.2, 1.2); c.strokeStyle = '#3e3a38'; c.lineWidth = .06; c.strokeRect(0, 0, 1.2, 1.2); });
    const b = P(x + .5, y + .5, 0), t = P(x + .5, y + .5, 4.6 * s);
    ctx.strokeStyle = '#5b4535'; ctx.lineWidth = 7 * s; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(b[0], b[1]); ctx.lineTo(t[0], t[1] + 30); ctx.stroke();
    ctx.lineWidth = 3 * s; ctx.beginPath(); ctx.moveTo(t[0], t[1] + 50); ctx.lineTo(t[0] + 22, t[1] + 20); ctx.moveTo(t[0], t[1] + 42); ctx.lineTo(t[0] - 20, t[1] + 14); ctx.stroke();
    const sway = Math.sin(W.tFrame * .9 + x) * 2;
    const cols = autumn ? ['#c8873c', '#d9a14a', '#a8612e', '#e0b25a'] : ['#4d7a48', '#5f9152', '#3e6a40', '#76a35e'];
    for (let k = 0; k < 14; k++) { const a = H(k + x) * Math.PI * 2, r = H(k * 3 + x) * 38 * s; ctx.fillStyle = cols[k % 4]; ctx.beginPath(); ctx.arc(t[0] + Math.cos(a) * r + sway, t[1] + Math.sin(a) * r * .7, (22 + H(k * 5) * 12) * s, 0, 7); ctx.fill(); }
    ctx.fillStyle = alpha('#fff', .08); ctx.beginPath(); ctx.arc(t[0] - 14 + sway, t[1] - 16, 26 * s, 0, 7); ctx.fill();
  };
  E.lamppost = (ctx, it, S, W) => {
    const b = P(it.x, it.y, 0), t = P(it.x, it.y, 6.4), night = W.light.night;
    shadow(ctx, it.x, it.y, .3, .3, .2);
    ctx.strokeStyle = '#2b2a30'; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(b[0], b[1]); ctx.lineTo(t[0], t[1]); ctx.quadraticCurveTo(t[0] + 2, t[1] - 14, t[0] + 18, t[1] - 10); ctx.stroke();
    ctx.fillStyle = '#2b2a30'; ctx.beginPath(); ctx.moveTo(t[0] + 10, t[1] - 10); ctx.lineTo(t[0] + 26, t[1] - 10); ctx.lineTo(t[0] + 22, t[1] - 3); ctx.lineTo(t[0] + 14, t[1] - 3); ctx.fill();
    ctx.fillStyle = night ? '#ffe2a0' : '#e8e2d6'; ctx.fillRect(t[0] + 14, t[1] - 4, 8, 3);
  };
  E.busstop = (ctx, it, S, W) => {
    const {x, y} = it, w = it.w || 3, d = 1;
    footShadow(ctx, x, y, w, d, .16);
    [[x, y], [x + w - .1, y]].forEach(([a, b]) => box(ctx, a, b, 0, .1, .1, 4.4, '#3c4a57', {hi: false}));
    // back glass panel along y
    face(ctx, [x, y + .05, 4.4], [1, 0, 0], [0, 0, -1], c => { c.fillStyle = alpha('#c9dbe6', .35); c.fillRect(0, 0, w, 4); c.fillStyle = '#f3efe6'; c.fillRect(w - 1.3, .6, 1.1, 1.6); c.fillStyle = '#24476b'; c.fillRect(w - 1.25, .65, 1, .5); c.fillStyle = '#f2c14e'; c.font = 'bold .17px sans-serif'; c.fillText('LIBRARY', w - 1.2, .95); c.fillStyle = '#e07a5f'; c.fillRect(w - 1.25, 1.25, 1, .85); });
    box(ctx, x - .1, y - .1, 4.4, w + .2, d + .2, .15, '#3c4a57');
    box(ctx, x + .3, y + .2, .8, w - .6, .5, .12, '#8a6447');
    // sign
    const s = P(x + w + .2, y + d, 5.4); ctx.fillStyle = '#c0392b'; ctx.beginPath(); ctx.arc(s[0], s[1], 9, 0, 7); ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = 'bold 9px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('14', s[0], s[1] + 3); const sb = P(x + w + .2, y + d, 0); ctx.strokeStyle = '#555'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(sb[0], sb[1]); ctx.lineTo(s[0], s[1] + 9); ctx.stroke();
  };
  E.bin = (ctx, it) => { footShadow(ctx, it.x, it.y, .7, .7, .12); cyl(ctx, it.x + .35, it.y + .35, 0, .3, 1.4, it.color || '#355c4a'); };
  E.rack = (ctx, it) => { for (let i = 0; i < 3; i++) { const a = P(it.x + i * .6, it.y, 0), b = P(it.x + i * .6, it.y + .8, 0), t1 = P(it.x + i * .6, it.y, 1.2), t2 = P(it.x + i * .6, it.y + .8, 1.2); ctx.strokeStyle = '#6f7a82'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(t1[0], t1[1]); ctx.quadraticCurveTo((t1[0] + t2[0]) / 2, t1[1] - 10, t2[0], t2[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); } if (it.bike) BF.art.F.bike(ctx, {x: it.x + .6, y: it.y - .6, color: it.bike}); };
  E.car = (ctx, it, S, W) => {
    const {x, y} = it, w = it.w || 4.4, d = 1.9, col = it.color || '#8a3b3b';
    shadow(ctx, x + w / 2, y + d / 2, w * .5, 1, .3);
    box(ctx, x, y, .35, w, d, .9, col); box(ctx, x + w * .25, y + .1, 1.25, w * .5, d - .2, .75, {top: shade(col, 1.05), left: '#9fb3c4', right: '#8197a8'});
    [[x + .8, y + d], [x + w - .9, y + d]].forEach(([a, b]) => { const p = P(a, b, .35); ctx.fillStyle = '#1b1b1f'; ctx.beginPath(); ctx.ellipse(p[0], p[1], 9, 11, -.5, 0, 7); ctx.fill(); });
    if (W.light.night) { const p = P(x + w, y + .4, .8); ctx.fillStyle = '#fff4c2'; ctx.beginPath(); ctx.arc(p[0], p[1], 3, 0, 7); ctx.fill(); }
  };
  E.bus = (ctx, it, S, W) => {
    const {x, y} = it, w = 8, d = 2, col = '#c8553d';
    shadow(ctx, x + w / 2, y + d / 2, w * .5, 1.2, .3);
    box(ctx, x, y, .4, w, d, 3.2, {top: '#e9e4dc', left: col, right: shade(col, .75)});
    plane.southY(ctx, x, y + d + .003, 3.6, c => { c.fillStyle = W.light.night ? '#ffe0a0' : '#2c3e50'; for (let k = 0; k < 6; k++) c.fillRect(.4 + k * 1.25, .5, 1, 1.1); c.fillStyle = '#f3efe6'; c.fillRect(0, 1.9, w, .2); c.fillStyle = '#1d2b3a'; c.fillRect(w - .9, .5, .7, 2.5); c.fillStyle = '#f2c14e'; c.font = 'bold .4px sans-serif'; c.fillText('14  Library', .3, .35); });
    [[x + 1.2, y + d], [x + w - 1.4, y + d]].forEach(([a, b]) => { const p = P(a, b, .4); ctx.fillStyle = '#1b1b1f'; ctx.beginPath(); ctx.ellipse(p[0], p[1], 10, 13, -.5, 0, 7); ctx.fill(); });
    if (W.light.night) { const p = P(x + w, y + .5, 1); ctx.fillStyle = '#fff4c2'; ctx.beginPath(); ctx.arc(p[0], p[1], 4, 0, 7); ctx.fill(); }
  };
  E.fence = (ctx, it) => { for (let i = 0; i <= it.w / .4; i++) { const a = P(it.x + i * .4, it.y, 0), b = P(it.x + i * .4, it.y, 1.3); ctx.strokeStyle = '#2f3a33'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); } const a = P(it.x, it.y, 1.2), b = P(it.x + it.w, it.y, 1.2); ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); };
  E.planter = (ctx, it) => { footShadow(ctx, it.x, it.y, it.w, it.d, .15); box(ctx, it.x, it.y, 0, it.w, it.d, .9, '#9b8e80'); plane.floor(ctx, it.x + .1, it.y + .1, .91, c => { c.fillStyle = '#5a4535'; c.fillRect(0, 0, it.w - .2, it.d - .2); }); for (let k = 0; k < it.w * 2; k++) BF.art.prop.plant(ctx, it.x + .3 + k * .5, it.y + it.d / 2, .9, .7, k % 3 ? 'leafy' : 'tall'); };
  E.aboard = (ctx, it, S, W) => { // chalk A-board outside the bakery
    face(ctx, [it.x, it.y + .3, 2.2], [1, 0, 0], [0, .25, -1], c => { c.fillStyle = '#7a5236'; c.fillRect(-.06, -.06, 1.32, 2.12); c.fillStyle = '#2b2f2d'; c.fillRect(0, 0, 1.2, 2); c.fillStyle = '#f3efe6'; c.font = 'italic .2px Georgia'; c.textAlign = 'center'; (it.lines || ['Today', 'cinnamon', 'knots', '♥']).forEach((l, i) => c.fillText(l, .6, .4 + i * .4)); });
  };
  E.flowers = (ctx, it) => { for (let k = 0; k < 9; k++) { const p = P(it.x + BF.u.hash(k) * it.w, it.y + BF.u.hash(k * 2) * it.d, .3); ctx.fillStyle = ['#e07a5f', '#f2cc8f', '#f4f1de', '#b56576'][k % 4]; ctx.beginPath(); ctx.arc(p[0], p[1], 3, 0, 7); ctx.fill(); } };
  return E;
})();
