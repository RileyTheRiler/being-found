/* Interior art: rooms, walls, windows, furniture and small props. Everything is drawn procedurally. */
'use strict';
BF.art = (() => {
  const {P, face, plane, poly, box, cyl, shadow, footShadow, HW, HH, ZS} = BF.iso;
  const {shade, mix, alpha} = BF.c;
  const H = BF.u.hash;
  const A = {};

  /* ---------- the room shell ---------- */
  A.roomBase = function (ctx, R, S) {
    const W = R.w, D = R.d, WH = R.wallH || 5.4, base = .55;
    // diorama base slab
    box(ctx, 0, 0, -base, W, D, base, {top: '#000', left: shade(R.slab || '#4a3c46', 1), right: shade(R.slab || '#4a3c46', .78)}, {noTop: true, edge: 'rgba(0,0,0,.35)'});
    // floor
    plane.floor(ctx, 0, 0, 0, c => drawFloor(c, R, W, D));
    // walls: back-right (y=0) and back-left (x=0), with a thickness cap
    const t = .28, wr = R.wallR || R.wall, wl = R.wallL || R.wall;
    box(ctx, -t, -t, 0, W + t, t, WH, {top: shade(wr.cap || '#5b4c55', 1), left: wr.color, right: wr.color}, {noRight: true, edge: 'rgba(0,0,0,.15)', hi: false});
    box(ctx, -t, 0, 0, t, D, WH, {top: shade(wl.cap || '#5b4c55', 1), left: wl.color, right: wl.color}, {noLeft: true, edge: 'rgba(0,0,0,.15)', hi: false});
    // wall surface detail
    plane.southY(ctx, 0, 0, WH, c => drawWall(c, wr, W, WH, R, 'R', S));
    plane.eastX(ctx, 0, D, WH, c => drawWall(c, wl, D, WH, R, 'L', S));
    // corner shading and floor contact shadow
    ctx.save();
    const c0 = P(0, 0, 0), c1 = P(0, 0, WH);
    const g = ctx.createLinearGradient(c0[0] - 30, 0, c0[0] + 30, 0);
    g.addColorStop(0, 'rgba(30,20,35,0)'); g.addColorStop(.5, 'rgba(30,20,35,.10)'); g.addColorStop(1, 'rgba(30,20,35,0)');
    ctx.fillStyle = g; ctx.fillRect(c0[0] - 30, c1[1], 60, c0[1] - c1[1]);
    ctx.restore();
    plane.floor(ctx, 0, 0, 0, c => {
      let g2 = c.createLinearGradient(0, 0, 0, .9); g2.addColorStop(0, 'rgba(25,15,30,.22)'); g2.addColorStop(1, 'rgba(25,15,30,0)');
      c.fillStyle = g2; c.fillRect(0, 0, W, .9);
      g2 = c.createLinearGradient(0, 0, .9, 0); g2.addColorStop(0, 'rgba(25,15,30,.22)'); g2.addColorStop(1, 'rgba(25,15,30,0)');
      c.fillStyle = g2; c.fillRect(0, 0, .9, D);
    });
  };
  A.roomFeatures = (ctx, R, S) => (R.walls || []).forEach(f => A.wallFeature(ctx, f, R, S));
  A.room = (ctx, R, S) => { A.roomBase(ctx, R, S); A.roomFeatures(ctx, R, S); };

  function drawFloor(c, R, W, D) {
    const f = R.floor;
    c.fillStyle = f.color; c.fillRect(0, 0, W, D);
    if (f.type === 'planks') {
      for (let j = 0; j < D * 3; j++) {
        const y = j / 3;
        c.fillStyle = shade(f.color, .93 + H(j * 7.1) * .12); c.fillRect(0, y, W, 1 / 3);
        c.strokeStyle = alpha(shade(f.color, .55), .45); c.lineWidth = .02;
        c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke();
        let x = -H(j) * 3;
        while (true) { x += 2.2 + H(j * 3 + x) * 2.4; if (x >= W) break; c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 1 / 3); c.stroke(); }
      }
    } else if (f.type === 'tiles') {
      for (let i = 0; i < W; i++) for (let j = 0; j < D; j++) {
        c.fillStyle = (i + j) % 2 ? f.color : (f.alt || shade(f.color, .9)); c.fillRect(i, j, 1, 1);
      }
      c.strokeStyle = alpha('#000', .08); c.lineWidth = .03;
      for (let i = 0; i <= W; i++) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i, D); c.stroke(); }
      for (let j = 0; j <= D; j++) { c.beginPath(); c.moveTo(0, j); c.lineTo(W, j); c.stroke(); }
    } else if (f.type === 'carpet') {
      for (let k = 0; k < W * D * 6; k++) { c.fillStyle = alpha(H(k) > .5 ? '#fff' : '#000', .03); c.fillRect(H(k * 1.3) * W, H(k * 2.7) * D, .12, .12); }
    } else if (f.type === 'concrete') {
      for (let k = 0; k < W * D * 3; k++) { c.fillStyle = alpha(H(k) > .5 ? '#fff' : '#000', .035); c.beginPath(); c.arc(H(k * 1.3) * W, H(k * 2.7) * D, .05 + H(k * 9) * .2, 0, 7); c.fill(); }
      c.strokeStyle = alpha('#000', .08); c.lineWidth = .03; for (let i = 3; i < W; i += 3) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i, D); c.stroke(); }
    }
    (f.zones || []).forEach(z => {
      c.save(); c.beginPath(); c.rect(z.x, z.y, z.w, z.d); c.clip();
      drawFloor(c, {floor: z}, W, D); c.restore();
    });
  }

  function drawWall(c, w, len, WH, R, side, S) {
    // wallpaper or paint
    const g = c.createLinearGradient(0, 0, 0, WH);
    g.addColorStop(0, shade(w.color, side === 'R' ? 1.02 : .9)); g.addColorStop(1, shade(w.color, side === 'R' ? .95 : .84));
    c.fillStyle = g; c.fillRect(0, 0, len, WH);
    if (w.pattern === 'stripe') { c.fillStyle = alpha(shade(w.color, .8), .25); for (let x = 0; x < len; x += .6) c.fillRect(x, 0, .22, WH); }
    if (w.pattern === 'dots') { c.fillStyle = alpha(shade(w.color, .75), .3); for (let x = .2; x < len; x += .5) for (let y = .3; y < WH; y += .5) { c.beginPath(); c.arc(x + ((y * 2) % 1 > .5 ? .25 : 0), y, .04, 0, 7); c.fill(); } }
    if (w.pattern === 'brick') {
      c.strokeStyle = alpha(shade(w.color, .6), .35); c.lineWidth = .03;
      for (let y = 0, r = 0; y < WH; y += .32, r++) { c.beginPath(); c.moveTo(0, y); c.lineTo(len, y); c.stroke(); for (let x = (r % 2) * .45; x < len; x += .9) { c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + .32); c.stroke(); } }
    }
    if (w.wainscot) { // lower panelling
      c.fillStyle = w.wainscot; c.fillRect(0, WH - 1.9, len, 1.9);
      c.fillStyle = alpha('#fff', .25); c.fillRect(0, WH - 1.95, len, .07);
      c.strokeStyle = alpha('#000', .12); c.lineWidth = .03;
      for (let x = .5; x < len; x += 1.4) c.strokeRect(x, WH - 1.65, 1, 1.35);
    }
    // skirting board
    c.fillStyle = w.skirting || shade(w.color, .7); c.fillRect(0, WH - .28, len, .28);
    c.fillStyle = alpha('#fff', .2); c.fillRect(0, WH - .28, len, .04);
  }

  /* map wall-relative coordinates: for side R, `at` is x; for side L, `at` is y. Returns drawing in plane coords (u,v). */
  function onWall(ctx, R, side, at, w, zTop, fn) {
    if (side === 'R') plane.southY(ctx, at, 0.001, zTop, fn);
    else plane.eastX(ctx, 0.001, at + w, zTop, fn);
  }
  A.onWall = onWall;

  A.wallFeature = function (ctx, f, R, S) {
    const k = WALL[f.type]; if (k) k(ctx, f, R, S);
  };
  const WALL = {};
  WALL.window = (ctx, f, R, S) => {
    const zTop = f.z + f.h;
    onWall(ctx, R, f.wall, f.at, f.w, zTop + .25, c => {
      const w = f.w, h = f.h, sky = S.skyColors ? S.skyColors() : ['#9cc6e4', '#e8eef0'];
      // recess
      c.fillStyle = shade(f.frame || '#f3efe6', .7); c.fillRect(-.12, .1, w + .24, h + .3);
      const g = c.createLinearGradient(0, .25, 0, h + .25); g.addColorStop(0, sky[0]); g.addColorStop(1, sky[1]);
      c.fillStyle = g; c.fillRect(0, .25, w, h);
      // what is outside: rooftops or trees silhouette
      if (f.view === 'roofs') {
        c.fillStyle = alpha(S.night ? '#1a1d33' : '#6b7690', S.night ? .95 : .55);
        for (let i = 0; i < 5; i++) { const bx = i * w / 4 - .2, bh = .6 + H(i + f.at) * .9; c.fillRect(bx, h + .25 - bh, w / 4 + .05, bh); }
        if (S.night) { c.fillStyle = '#ffd68a'; for (let i = 0; i < 7; i++) c.fillRect(H(i * 3 + f.at) * w, h + .25 - H(i * 5) * .7, .08, .1); }
      } else if (f.view === 'trees') {
        c.fillStyle = alpha(S.night ? '#141a26' : '#4d7a52', S.night ? .9 : .6);
        for (let i = 0; i < 4; i++) { c.beginPath(); c.arc(i * w / 3, h + .1, .5 + H(i + 2) * .4, 0, 7); c.fill(); }
      } else if (f.view === 'street') {
        c.fillStyle = alpha(S.night ? '#20243c' : '#8a7f86', S.night ? .95 : .55); c.fillRect(0, h * .55 + .25, w, h * .45);
        c.fillStyle = S.night ? '#ffd68a' : alpha('#fff', .5);
        for (let i = 0; i < 6; i++) c.fillRect(.15 + i * (w - .3) / 6, h * .62 + .25, .1, .14);
      }
      // glass reflection
      c.fillStyle = alpha('#fff', .16); c.beginPath(); c.moveTo(w * .15, .25); c.lineTo(w * .45, .25); c.lineTo(w * .1, h + .25); c.lineTo(0, h + .25); c.lineTo(0, h * .7); c.fill();
      // frame and mullions
      c.strokeStyle = f.frame || '#f3efe6'; c.lineWidth = .12; c.strokeRect(0, .25, w, h);
      c.lineWidth = .07; c.beginPath(); c.moveTo(w / 2, .25); c.lineTo(w / 2, h + .25); c.moveTo(0, .25 + h * .42); c.lineTo(w, .25 + h * .42); c.stroke();
      // sill
      c.fillStyle = shade(f.frame || '#f3efe6', .92); c.fillRect(-.25, h + .25, w + .5, .14);
      c.fillStyle = alpha('#000', .15); c.fillRect(-.25, h + .39, w + .5, .06);
      // curtains
      if (f.curtain) {
        const open = S.objState ? (S.objState(f.id) || {}).open ?? f.open ?? .8 : .8;
        const cw = BF.u.lerp(w / 2 + .15, .35, open);
        [0, 1].forEach(side => {
          const x0 = side ? w + .25 - cw : -.25;
          const gg = c.createLinearGradient(x0, 0, x0 + cw, 0);
          for (let i = 0; i <= 6; i++) gg.addColorStop(i / 6, shade(f.curtain, i % 2 ? .82 : 1.04));
          c.fillStyle = gg; c.beginPath(); c.moveTo(x0, -.05); c.lineTo(x0 + cw, -.05);
          c.quadraticCurveTo(x0 + cw + (side ? -.05 : .05), h * .6, x0 + cw + (side ? .08 : -.08), h + .5); c.lineTo(x0, h + .5); c.fill();
        });
        c.fillStyle = '#5b4b3c'; c.fillRect(-.4, -.12, w + .8, .07);
      }
    });
  };
  WALL.door = (ctx, f, R, S) => {
    const h = f.h || 4.1, st = S.objState ? S.objState(f.id) || {} : {};
    onWall(ctx, R, f.wall, f.at, f.w, h + .2, c => {
      const w = f.w;
      c.fillStyle = shade(f.frame || '#efe7da', .95); c.fillRect(-.18, 0, w + .36, h + .2);
      if (st.open) {
        c.fillStyle = f.beyond || '#3a3140'; c.fillRect(0, .2, w, h);
        const g = c.createLinearGradient(0, 0, w, 0); g.addColorStop(0, alpha('#ffe2b0', .35)); g.addColorStop(1, alpha('#ffe2b0', 0));
        c.fillStyle = g; c.fillRect(0, .2, w, h);
        c.fillStyle = shade(f.color || '#7b5b46', .8); c.fillRect(0, .2, w * .18, h);
      } else {
        const g = c.createLinearGradient(0, 0, w, 0); g.addColorStop(0, shade(f.color || '#7b5b46', 1.05)); g.addColorStop(1, shade(f.color || '#7b5b46', .9));
        c.fillStyle = g; c.fillRect(0, .2, w, h);
        c.strokeStyle = alpha('#000', .18); c.lineWidth = .04;
        c.strokeRect(.22, .5, w - .44, h * .38); c.strokeRect(.22, .6 + h * .42, w - .44, h * .44);
        c.fillStyle = '#d9b45a'; c.beginPath(); c.arc(f.handle === 'L' ? .25 : w - .25, .2 + h * .52, .08, 0, 7); c.fill();
        if (f.label) { c.fillStyle = '#d9b45a'; c.font = 'bold .35px Georgia'; c.textAlign = 'center'; c.fillText(f.label, w / 2, .5 + h * .18); }
        if (f.peephole) { c.fillStyle = '#222'; c.beginPath(); c.arc(w / 2, .2 + h * .3, .05, 0, 7); c.fill(); }
      }
      if (f.lightUnder) { const g = c.createLinearGradient(0, h + .2, 0, h + .05); g.addColorStop(0, alpha('#ffd88a', .9)); g.addColorStop(1, alpha('#ffd88a', 0)); c.fillStyle = g; c.fillRect(.05, h + .02, w - .1, .18); }
    });
  };
  WALL.frame = (ctx, f, R, S) => onWall(ctx, R, f.wall, f.at, f.w, f.z + f.h, c => {
    c.fillStyle = alpha('#000', .18); c.fillRect(.06, .08, f.w, f.h);
    c.fillStyle = f.frame || '#2c2a2e'; c.fillRect(0, 0, f.w, f.h);
    const m = f.mat === false ? .07 : .16; c.fillStyle = f.matColor || '#f6f1e7'; c.fillRect(m * .5, m * .5, f.w - m, f.h - m);
    const ix = m + .02, iy = m + .02, iw = f.w - 2 * ix, ih = f.h - 2 * iy;
    c.save(); c.beginPath(); c.rect(ix, iy, iw, ih); c.clip();
    ART[f.art || 'abstract'](c, ix, iy, iw, ih, f);
    c.restore();
  });
  const ART = {
    abstract(c, x, y, w, h, f) { const p = f.palette || ['#e07a5f', '#3d405b', '#81b29a', '#f2cc8f']; c.fillStyle = p[3]; c.fillRect(x, y, w, h); c.fillStyle = p[0]; c.beginPath(); c.arc(x + w * .35, y + h * .45, Math.min(w, h) * .28, 0, 7); c.fill(); c.fillStyle = p[1]; c.fillRect(x + w * .5, y + h * .3, w * .4, h * .55); c.fillStyle = p[2]; c.fillRect(x, y + h * .78, w, h * .22); },
    photo(c, x, y, w, h, f) { const g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#d6b98c'); g.addColorStop(1, '#8a6e55'); c.fillStyle = g; c.fillRect(x, y, w, h); const ppl = f.people || ['#2a8f84', '#e0b028', '#b5442f']; ppl.forEach((col, i) => { const px = x + w * (.22 + i * .28); c.fillStyle = col; c.fillRect(px - w * .09, y + h * .5, w * .18, h * .5); c.fillStyle = '#5a3a2a'; c.beginPath(); c.arc(px, y + h * .4, w * .07, 0, 7); c.fill(); }); },
    landscape(c, x, y, w, h) { let g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#f3c48a'); g.addColorStop(1, '#e98b6d'); c.fillStyle = g; c.fillRect(x, y, w, h); c.fillStyle = '#6d5a8a'; c.beginPath(); c.moveTo(x, y + h * .7); c.lineTo(x + w * .3, y + h * .45); c.lineTo(x + w * .6, y + h * .65); c.lineTo(x + w, y + h * .4); c.lineTo(x + w, y + h); c.lineTo(x, y + h); c.fill(); c.fillStyle = '#3f3a5e'; c.fillRect(x, y + h * .82, w, h * .2); },
    child(c, x, y, w, h) { c.fillStyle = '#fffdf6'; c.fillRect(x, y, w, h); c.strokeStyle = '#e94f37'; c.lineWidth = .05; c.beginPath(); c.arc(x + w * .3, y + h * .3, w * .14, 0, 7); c.stroke(); c.strokeStyle = '#3f88c5'; c.beginPath(); c.moveTo(x + w * .15, y + h * .8); c.lineTo(x + w * .5, y + h * .5); c.lineTo(x + w * .85, y + h * .8); c.stroke(); c.fillStyle = '#44bba4'; c.fillRect(x + w * .55, y + h * .2, w * .25, h * .2); },
    lettering(c, x, y, w, h, f) { c.fillStyle = '#1d2b3a'; c.fillRect(x, y, w, h); c.fillStyle = '#e3b448'; c.font = `italic bold ${h * .38}px Georgia`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(f.text || 'Ferro', x + w / 2, y + h / 2); },
  };
  A.paintArt = ART;
  WALL.shelf = (ctx, f, R, S) => onWall(ctx, R, f.wall, f.at, f.w, f.z + .5, c => {
    c.fillStyle = alpha('#000', .15); c.fillRect(.05, .45, f.w, .14);
    (f.things || 'books').split(',').forEach((kind, i, all) => {
      const seg = f.w / all.length, x0 = i * seg;
      if (kind === 'books') for (let k = 0; k < seg / .14 - 1; k++) { const bh = .3 + H(k + f.at * 3 + i) * .14; c.fillStyle = ['#c0533c', '#3e6e8e', '#e2b04a', '#5b8c5a', '#7a4f7a', '#d9d2c3'][Math.floor(H(k * 3 + i) * 6)]; c.fillRect(x0 + .06 + k * .14, .4 - bh, .12, bh); }
      if (kind === 'plant') { c.fillStyle = '#c96f4a'; c.fillRect(x0 + seg / 2 - .12, .22, .24, .18); c.fillStyle = '#4f8a54'; for (let k = 0; k < 5; k++) { c.beginPath(); c.ellipse(x0 + seg / 2 + (k - 2) * .07, .2 - (k % 2) * .08, .07, .16, (k - 2) * .4, 0, 7); c.fill(); } c.strokeStyle = '#4f8a54'; c.lineWidth = .03; c.beginPath(); c.moveTo(x0 + seg / 2 + .1, .35); c.quadraticCurveTo(x0 + seg / 2 + .35, .7, x0 + seg / 2 + .2, 1.1); c.stroke(); }
      if (kind === 'jars') for (let k = 0; k < 3; k++) { c.fillStyle = ['#e9c46a', '#b5651d', '#f4f1de'][k]; c.fillRect(x0 + .1 + k * seg / 3, .18, seg / 3 - .1, .22); c.fillStyle = '#7b6a58'; c.fillRect(x0 + .1 + k * seg / 3, .14, seg / 3 - .1, .05); }
      if (kind === 'mugs') for (let k = 0; k < 3; k++) { c.fillStyle = ['#e07a5f', '#f2cc8f', '#81b29a'][k]; c.fillRect(x0 + .12 + k * seg / 3, .24, .16, .16); }
      if (kind === 'radio') { c.fillStyle = '#b5523b'; c.fillRect(x0 + .1, .1, seg - .2, .3); c.fillStyle = '#efe1c6'; c.beginPath(); c.arc(x0 + .3, .25, .08, 0, 7); c.fill(); }
    });
    c.fillStyle = f.color || '#8c6a4f'; c.fillRect(0, .4, f.w, .07);
  });
  WALL.clock = (ctx, f, R, S) => onWall(ctx, R, f.wall, f.at, .7, f.z + .7, c => {
    const t = S.clock ? S.clock() : 600;
    c.fillStyle = alpha('#000', .15); c.beginPath(); c.arc(.39, .39, .33, 0, 7); c.fill();
    c.fillStyle = '#fbf6ec'; c.beginPath(); c.arc(.35, .35, .33, 0, 7); c.fill(); c.strokeStyle = f.color || '#2f2a33'; c.lineWidth = .05; c.stroke();
    c.lineWidth = .02; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; c.beginPath(); c.moveTo(.35 + Math.cos(a) * .26, .35 + Math.sin(a) * .26); c.lineTo(.35 + Math.cos(a) * .3, .35 + Math.sin(a) * .3); c.stroke(); }
    const hr = (t / 60) % 12, mn = t % 60, sec = (performance.now() / 1000) % 60;
    const hand = (a, l, wd, col) => { c.strokeStyle = col; c.lineWidth = wd; c.beginPath(); c.moveTo(.35, .35); c.lineTo(.35 + Math.sin(a) * l, .35 - Math.cos(a) * l); c.stroke(); };
    hand(hr / 12 * Math.PI * 2, .16, .04, '#2f2a33'); hand(mn / 60 * Math.PI * 2, .24, .03, '#2f2a33'); if (f.seconds) hand(Math.floor(sec) / 60 * Math.PI * 2, .26, .012, '#c0392b');
  });
  WALL.calendar = (ctx, f, R, S) => onWall(ctx, R, f.wall, f.at, f.w || .8, f.z + (f.h || 1.1), c => {
    const w = f.w || .8, h = f.h || 1.1;
    c.fillStyle = alpha('#000', .15); c.fillRect(.05, .06, w, h);
    c.fillStyle = '#fffdf7'; c.fillRect(0, 0, w, h); c.fillStyle = f.color || '#c0533c'; c.fillRect(0, 0, w, h * .18);
    c.fillStyle = alpha('#333', .5); for (let i = 0; i < 5; i++) for (let j = 0; j < 7; j++) c.fillRect(.06 + j * (w - .12) / 7, h * .26 + i * h * .14, (w - .12) / 7 - .02, .015);
    (f.marks || []).forEach(m => { c.strokeStyle = m.c || '#c0392b'; c.lineWidth = .03; c.beginPath(); c.arc(.06 + m.d * (w - .12) / 7 + .05, h * .26 + m.r * h * .14 + .04, .07, 0, 7); c.stroke(); });
  });
  WALL.board = (ctx, f, R, S) => onWall(ctx, R, f.wall, f.at, f.w, f.z + f.h, c => {
    c.fillStyle = alpha('#000', .15); c.fillRect(.06, .08, f.w, f.h);
    c.fillStyle = '#6b4a33'; c.fillRect(0, 0, f.w, f.h); c.fillStyle = '#c99d6a'; c.fillRect(.08, .08, f.w - .16, f.h - .16);
    (f.notes || []).forEach((n, i) => { c.save(); c.translate(n.x, n.y); c.rotate((H(i + 4) - .5) * .12); c.fillStyle = n.c || '#fffaf0'; c.fillRect(0, 0, n.w || .5, n.h || .6); c.fillStyle = alpha('#333', .55); for (let k = 0; k < 4; k++) c.fillRect(.06, .12 + k * .1, (n.w || .5) - .14, .02); c.fillStyle = '#d64545'; c.beginPath(); c.arc((n.w || .5) / 2, .05, .035, 0, 7); c.fill(); c.restore(); });
  });
  WALL.pegboard = (ctx, f, R, S) => onWall(ctx, R, f.wall, f.at, f.w, f.z + f.h, c => {
    c.fillStyle = '#c8a77b'; c.fillRect(0, 0, f.w, f.h); c.fillStyle = alpha('#5a4530', .4);
    for (let x = .15; x < f.w; x += .25) for (let y = .15; y < f.h; y += .25) { c.beginPath(); c.arc(x, y, .025, 0, 7); c.fill(); }
    const tool = (x, y, kind) => { c.save(); c.translate(x, y);
      if (kind === 'saw') { c.fillStyle = '#c7ccd1'; c.beginPath(); c.moveTo(0, 0); c.lineTo(.9, .05); c.lineTo(.9, .22); c.lineTo(0, .3); c.fill(); c.fillStyle = '#8b3a2b'; c.fillRect(-.25, 0, .28, .3); }
      if (kind === 'hammer') { c.fillStyle = '#8b5a2b'; c.fillRect(.08, 0, .07, .6); c.fillStyle = '#555'; c.fillRect(-.02, 0, .27, .1); }
      if (kind === 'chisel') { c.fillStyle = '#b07a3e'; c.fillRect(0, 0, .07, .25); c.fillStyle = '#aab'; c.fillRect(.01, .25, .05, .25); }
      if (kind === 'square') { c.fillStyle = '#9aa1a6'; c.fillRect(0, 0, .06, .55); c.fillRect(0, .5, .35, .06); }
      if (kind === 'clamp') { c.strokeStyle = '#3b6ea5'; c.lineWidth = .06; c.strokeRect(0, 0, .3, .45); }
      c.restore(); };
    (f.tools || ['saw', 'hammer', 'chisel', 'chisel', 'square', 'clamp']).forEach((t, i) => tool(.3 + i * (f.w - .5) / 6, .3 + (i % 2) * .2, t));
  });
  WALL.hooks = (ctx, f, R, S) => onWall(ctx, R, f.wall, f.at, f.w, f.z + .2, c => {
    c.fillStyle = '#5b4b3c'; c.fillRect(0, 0, f.w, .12);
    (f.coats || []).forEach((col, i) => { const x = .2 + i * (f.w - .3) / Math.max(1, f.coats.length); c.fillStyle = alpha('#000', .15); c.fillRect(x - .2, .2, .5, 1.4); c.fillStyle = col; c.beginPath(); c.moveTo(x, .08); c.lineTo(x + .25, .25); c.lineTo(x + .3, 1.5); c.lineTo(x - .28, 1.5); c.lineTo(x - .24, .25); c.fill(); });
    (f.keys ? [1] : []).forEach(() => { c.strokeStyle = '#c9a74d'; c.lineWidth = .03; c.beginPath(); c.arc(f.w - .2, .3, .07, 0, 7); c.stroke(); c.fillStyle = '#c9a74d'; c.fillRect(f.w - .22, .36, .04, .18); c.fillRect(f.w - .13, .33, .03, .14); });
  });
  WALL.cabinets = (ctx, f, R, S) => onWall(ctx, R, f.wall, f.at, f.w, f.z + f.h, c => {
    c.fillStyle = alpha('#000', .2); c.fillRect(.04, f.h, f.w, .12);
    const n = Math.round(f.w / .9);
    for (let i = 0; i < n; i++) { const x = i * f.w / n; c.fillStyle = shade(f.color, i % 2 ? .96 : 1); c.fillRect(x + .02, 0, f.w / n - .04, f.h); c.strokeStyle = alpha('#000', .15); c.lineWidth = .03; c.strokeRect(x + .08, .08, f.w / n - .16, f.h - .16); c.fillStyle = '#c8b38a'; c.fillRect(x + f.w / n / 2 - .1, f.h - .2, .2, .04); }
  });
  WALL.splash = (ctx, f, R, S) => onWall(ctx, R, f.wall, f.at, f.w, f.z + f.h, c => {
    c.fillStyle = f.color || '#e9eef0'; c.fillRect(0, 0, f.w, f.h); c.strokeStyle = alpha('#7a8a90', .35); c.lineWidth = .02;
    for (let x = 0; x <= f.w; x += .3) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, f.h); c.stroke(); } for (let y = 0; y <= f.h; y += .15) { c.beginPath(); c.moveTo(0, y); c.lineTo(f.w, y); c.stroke(); }
  });
  WALL.sign = (ctx, f, R, S) => onWall(ctx, R, f.wall, f.at, f.w, f.z + f.h, c => {
    if (S.objState && (S.objState(f.id) || {}).hidden) return;
    c.fillStyle = alpha('#000', .2); c.fillRect(.06, .08, f.w, f.h);
    c.fillStyle = f.bg || '#24476b'; c.fillRect(0, 0, f.w, f.h);
    c.strokeStyle = f.fg || '#f2c14e'; c.lineWidth = .04; c.strokeRect(.08, .08, f.w - .16, f.h - .16);
    c.fillStyle = f.fg || '#f2c14e'; c.textAlign = 'center'; c.textBaseline = 'middle'; let fs = f.h * .34; c.font = `bold ${fs}px Georgia`; const tw = c.measureText(f.text || '').width; if (tw > f.w * .84) { fs *= f.w * .84 / tw; c.font = `bold ${fs}px Georgia`; } c.fillText(f.text || '', f.w / 2, f.h / 2 + .02);
  });
  WALL.mirror = (ctx, f, R, S) => onWall(ctx, R, f.wall, f.at, f.w, f.z + f.h, c => {
    c.fillStyle = '#b8964f'; c.beginPath(); c.ellipse(f.w / 2, f.h / 2, f.w / 2, f.h / 2, 0, 0, 7); c.fill();
    const g = c.createLinearGradient(0, 0, f.w, f.h); g.addColorStop(0, '#dfe9ee'); g.addColorStop(1, '#9fb2bd'); c.fillStyle = g;
    c.beginPath(); c.ellipse(f.w / 2, f.h / 2, f.w / 2 - .06, f.h / 2 - .06, 0, 0, 7); c.fill();
  });
  WALL.radiator = (ctx, f, R, S) => onWall(ctx, R, f.wall, f.at, f.w, f.z + f.h, c => {
    c.fillStyle = alpha('#000', .15); c.fillRect(.04, .06, f.w, f.h); for (let x = 0; x < f.w; x += .16) { c.fillStyle = shade('#e8e4dc', x % .32 < .16 ? 1 : .9); c.fillRect(x, 0, .14, f.h); }
  });
  WALL.switch = (ctx, f, R, S) => onWall(ctx, R, f.wall, f.at, .25, f.z + .35, c => { c.fillStyle = '#f6f3ec'; c.fillRect(0, 0, .25, .35); c.fillStyle = '#ccc'; c.fillRect(.09, .1, .07, .15); });
  WALL.tv = (ctx, f, R, S) => onWall(ctx, R, f.wall, f.at, f.w, f.z + f.h, c => { c.fillStyle = '#16161a'; c.fillRect(0, 0, f.w, f.h); c.fillStyle = (S.objState && (S.objState(f.id) || {}).on) ? '#5b84b1' : '#24252b'; c.fillRect(.06, .06, f.w - .12, f.h - .12); });
  A.WALL = WALL;

  /* ---------- free-standing furniture ---------- */
  const F = A.F = {};
  const wood = '#9b6b45';

  F.rug = (ctx, it) => plane.floor(ctx, it.x, it.y, .01, c => {
    c.fillStyle = it.color; c.beginPath();
    if (it.round) c.ellipse(it.w / 2, it.d / 2, it.w / 2, it.d / 2, 0, 0, 7); else c.rect(0, 0, it.w, it.d);
    c.fill();
    c.strokeStyle = it.trim || shade(it.color, .7); c.lineWidth = .1;
    if (it.round) { c.beginPath(); c.ellipse(it.w / 2, it.d / 2, it.w / 2 - .25, it.d / 2 - .25, 0, 0, 7); c.stroke(); }
    else { c.strokeRect(.25, .25, it.w - .5, it.d - .5); if (it.pattern) { c.lineWidth = .06; for (let i = 1; i < 4; i++) { c.beginPath(); c.moveTo(it.w * i / 4, .45); c.lineTo(it.w * i / 4, it.d - .45); c.stroke(); } } }
  });

  F.bed = (ctx, it, S) => {
    const {x, y, w, d} = it, alongX = it.head === 'W';
    footShadow(ctx, x, y, w, d, .22);
    const frame = it.frame || '#8a6447';
    box(ctx, x, y, 0, w, d, .7, frame);
    // headboard
    if (alongX) box(ctx, x, y, .7, .3, d, 1.5, shade(frame, .95)); else box(ctx, x, y, .7, w, .3, 1.5, shade(frame, .95));
    // mattress
    const mx = alongX ? x + .3 : x + .08, my = alongX ? y + .08 : y + .3, mw = alongX ? w - .38 : w - .16, md = alongX ? d - .16 : d - .38;
    box(ctx, mx, my, .7, mw, md, .4, '#f4efe7');
    // pillows
    if (alongX) { box(ctx, mx + .08, my + .1, 1.1, .7, md / 2 - .15, .28, '#fbf8f3'); box(ctx, mx + .08, my + md / 2 + .05, .7, md / 2 - .15, .28, '#fbf8f3'); }
    else { box(ctx, mx + .1, my + .08, 1.1, mw / 2 - .15, .7, .28, '#fbf8f3'); box(ctx, mx + mw / 2 + .05, my + .08, 1.1, mw / 2 - .15, .7, .28, '#fbf8f3'); }
    // occupant under the duvet (lying)
    const occ = S && S.occupant ? S.occupant(it.id) : null;
    const dx = alongX ? mx + .95 : mx, dy = alongX ? my : my + .95, dw = alongX ? mw - .95 : mw, dd = alongX ? md : md - .95;
    if (occ) {
      const hp = alongX ? P(mx + .5, my + md / 2, 1.45) : P(mx + mw / 2, my + .5, 1.45);
      BF.figure.head(ctx, occ, hp[0], hp[1], {lying: true});
    }
    const rum = it.unmade ? .18 : .05;
    box(ctx, dx, dy, 1.1, dw, dd, occ ? .38 : .12 + rum, {top: shade(it.duvet, 1.05), left: shade(it.duvet, .86), right: shade(it.duvet, .72)});
    if (it.unmade) { const p = P(dx + dw * .5, dy + dd * .45, 1.35); ctx.fillStyle = alpha(shade(it.duvet, .8), .5); ctx.beginPath(); ctx.ellipse(p[0], p[1], 26, 8, -.3, 0, 7); ctx.fill(); }
    plane.floor(ctx, dx, dy, 1.11 + (occ ? .38 : .12 + rum), c => { c.strokeStyle = alpha('#fff', .3); c.lineWidth = .04; for (let i = 1; i < 4; i++) { c.beginPath(); if (alongX) { c.moveTo(dw * i / 4, 0); c.lineTo(dw * i / 4, dd); } else { c.moveTo(0, dd * i / 4); c.lineTo(dw, dd * i / 4); } c.stroke(); } });
  };

  F.sofa = (ctx, it, S) => {
    const {x, y, w, d} = it, col = it.color, f = it.face || 'S';
    footShadow(ctx, x, y, w, d, .22);
    const occ = S && S.occupant ? S.occupant(it.id) : null;
    if (f === 'S') {
      box(ctx, x, y, .35, w, .55, 1.65, shade(col, .95)); // back
      box(ctx, x, y, 0, .5, d, 1.25, col); // left arm
      box(ctx, x + .5, y + .5, 0, w - 1, d - .5, .9, shade(col, .9)); // seat base
      const n = Math.max(2, Math.round((w - 1) / 1.6));
      for (let i = 0; i < n; i++) box(ctx, x + .5 + i * (w - 1) / n + .03, y + .55, .9, (w - 1) / n - .06, d - .62, .22, shade(col, 1.02));
      if (it.throw) box(ctx, x + w - 1.6, y + .1, .9, .8, d - .2, .3, {top: shade(it.throw, 1.05), left: it.throw, right: shade(it.throw, .8)});
      if (occ) { const hp = P(x + .9, y + d * .55, 1.55); BF.figure.head(ctx, occ, hp[0], hp[1], {lying: true}); box(ctx, x + 1.25, y + .6, 1.12, w - 1.9, d - .75, .35, {top: shade(it.blanket || '#8c7a9b', 1.05), left: it.blanket || '#8c7a9b', right: shade(it.blanket || '#8c7a9b', .8)}); }
      box(ctx, x + w - .5, y, 0, .5, d, 1.25, col); // right arm
    } else {
      box(ctx, x, y, .35, .55, d, 1.65, shade(col, .95));
      box(ctx, x, y, 0, w, .5, 1.25, col);
      box(ctx, x + .5, y + .5, 0, w - .5, d - 1, .9, shade(col, .9));
      const n = Math.max(2, Math.round((d - 1) / 1.6));
      for (let i = 0; i < n; i++) box(ctx, x + .55, y + .5 + i * (d - 1) / n + .03, .9, w - .62, (d - 1) / n - .06, .22, shade(col, 1.02));
      if (it.throw) box(ctx, x + .1, y + d - 1.6, .9, w - .2, .8, .3, {top: shade(it.throw, 1.05), left: it.throw, right: shade(it.throw, .8)});
      if (occ) { const hp = P(x + w * .55, y + .9, 1.55); BF.figure.head(ctx, occ, hp[0], hp[1], {lying: true}); box(ctx, x + .6, y + 1.25, 1.12, w - .75, d - 1.9, .35, {top: shade(it.blanket || '#8c7a9b', 1.05), left: it.blanket || '#8c7a9b', right: shade(it.blanket || '#8c7a9b', .8)}); }
      box(ctx, x, y + d - .5, 0, w, .5, 1.25, col);
    }
  };
  F.armchair = (ctx, it) => { const {x, y} = it; const s = {...it, w: it.w || 2, d: it.d || 2}; F.sofa(ctx, s); };

  F.table = (ctx, it) => {
    const {x, y, w, d} = it, h = it.h || 1.55, col = it.color || wood;
    footShadow(ctx, x + .1, y + .1, w - .2, d - .2, .14);
    const leg = (lx, ly) => box(ctx, lx, ly, 0, .14, .14, h - .12, shade(col, .85), {hi: false});
    if (it.round) {
      cyl(ctx, x + w / 2, y + d / 2, 0, .12, h - .1, shade(col, .8));
      cyl(ctx, x + w / 2, y + d / 2, h - .12, Math.min(w, d) / 2.05, .12, col);
    } else {
      leg(x + .1, y + .1); leg(x + w - .24, y + .1); leg(x + .1, y + d - .24); leg(x + w - .24, y + d - .24);
      box(ctx, x, y, h - .12, w, d, .12, col);
      if (it.cloth) plane.floor(ctx, x, y, h + .005, c => { c.fillStyle = it.cloth; c.fillRect(w * .2, 0, w * .25, d); });
    }
  };
  F.chair = (ctx, it) => {
    const {x, y} = it, f = it.face || 'S', col = it.color || '#7a5236', s = .9;
    footShadow(ctx, x, y, s, s, .12);
    const leg = (lx, ly, hh) => box(ctx, lx, ly, 0, .1, .1, hh, shade(col, .85), {hi: false});
    const back = {N: () => box(ctx, x, y, .9, s, .12, 1.15, col), S: () => box(ctx, x, y + s - .12, .9, s, .12, 1.15, col), W: () => box(ctx, x, y, .9, .12, s, 1.15, col), E: () => box(ctx, x + s - .12, y, .9, .12, s, 1.15, col)};
    // chair facing f has its back on the opposite side
    const opp = {S: 'N', N: 'S', E: 'W', W: 'E'}[f];
    if (opp === 'N' || opp === 'W') back[opp]();
    leg(x + .05, y + .05, .9); leg(x + s - .15, y + .05, .9); leg(x + .05, y + s - .15, .9); leg(x + s - .15, y + s - .15, .9);
    box(ctx, x, y, .82, s, s, .1, col);
    if (it.cushion) box(ctx, x + .08, y + .08, .92, s - .16, s - .16, .08, it.cushion);
    if (opp === 'S' || opp === 'E') back[opp]();
  };
  F.stool = (ctx, it) => { const {x, y} = it; cyl(ctx, x + .35, y + .35, 0, .06, 1.1, '#6d4c33'); cyl(ctx, x + .35, y + .35, 1.1, .3, .1, it.color || '#8a5b3a'); };

  F.counter = (ctx, it, S) => {
    const {x, y, w, d} = it, col = it.color || '#dcd5c8', top = it.top || '#3f3a40', alongX = it.face !== 'E';
    footShadow(ctx, x, y, w, d, .2);
    box(ctx, x, y, 0, w, d, 1.72, col);
    // doors/drawers on the visible front
    if (alongX) plane.southY(ctx, x, y + d + .001, 1.72, c => { const n = Math.round(w / 1.1); for (let i = 0; i < n; i++) { c.strokeStyle = alpha('#000', .18); c.lineWidth = .03; c.strokeRect(i * w / n + .06, .1, w / n - .12, 1.5); c.fillStyle = '#b9a68a'; c.fillRect(i * w / n + w / n / 2 - .15, .22, .3, .05); } c.fillStyle = alpha('#000', .25); c.fillRect(0, 1.6, w, .12); });
    else plane.eastX(ctx, x + w + .001, y + d, 1.72, c => { const n = Math.round(d / 1.1); for (let i = 0; i < n; i++) { c.strokeStyle = alpha('#000', .18); c.lineWidth = .03; c.strokeRect(i * d / n + .06, .1, d / n - .12, 1.5); c.fillStyle = '#b9a68a'; c.fillRect(i * d / n + d / n / 2 - .15, .22, .3, .05); } c.fillStyle = alpha('#000', .25); c.fillRect(0, 1.6, d, .12); });
    box(ctx, x - .04, y - .04, 1.72, w + .08, d + .08, .1, top);
    (it.parts || []).forEach(p => {
      const px = x + p.at, py = y + (p.dy || .15);
      if (p.kind === 'stove') { plane.floor(ctx, px, py, 1.83, c => { c.fillStyle = '#26232a'; c.fillRect(0, 0, 1.4, 1.3); c.strokeStyle = '#555'; c.lineWidth = .05; [[.35, .35], [1.05, .35], [.35, .95], [1.05, .95]].forEach(([u, v]) => { c.beginPath(); c.arc(u, v, .22, 0, 7); c.stroke(); }); const on = S && S.objState && (S.objState(p.id) || {}).on; if (on) { c.strokeStyle = '#ff7b39'; c.lineWidth = .07; c.beginPath(); c.arc(.35, .95, .2, 0, 7); c.stroke(); } }); }
      if (p.kind === 'sink') { plane.floor(ctx, px, py, 1.83, c => { c.fillStyle = '#b9c2c7'; c.fillRect(0, 0, 1.3, 1.1); c.fillStyle = '#8d979d'; c.fillRect(.12, .12, 1.06, .86); }); cyl(ctx, px + .65, y + .12, 1.83, .05, .55, '#c9d0d4'); }
      if (p.kind === 'kettle') { const st = S && S.objState ? S.objState(p.id) || {} : {}; if (!st.gone) A.prop.kettle(ctx, px, py + .4, 1.83, p.color || '#d9d4cc', st); }
      if (p.kind === 'board') { box(ctx, px, py + .2, 1.83, 1, .7, .06, '#c99d6a'); }
      if (p.kind === 'bread') { box(ctx, px, py + .3, 1.83, .7, .4, .25, '#c98a4a'); }
      if (p.kind === 'pan') { const st = S && S.objState ? S.objState(p.id) || {} : {}; cyl(ctx, px + .35, py + .9, 1.85, .38, .1, '#2d2a2f', {open: true, inner: st.food ? '#f4d35e' : '#3a363c'}); }
      if (p.kind === 'mugs') ['#e07a5f', '#f2cc8f', '#81b29a'].slice(0, p.n || 3).forEach((m, i) => A.prop.cup(ctx, px + i * .35, py + .5, 1.83, m));
      if (p.kind === 'radio') box(ctx, px, py + .2, 1.83, .9, .45, .55, '#b5523b');
      if (p.kind === 'fruit') { cyl(ctx, px + .4, py + .5, 1.83, .38, .14, '#ddd3c0', {open: true, inner: '#c6b79b'}); ['#e94f37', '#f2c14e', '#7bb661'].forEach((fc, i) => { const q = P(px + .3 + i * .12, py + .45 + (i % 2) * .1, 2.05); ctx.fillStyle = fc; ctx.beginPath(); ctx.arc(q[0], q[1], 4.2, 0, 7); ctx.fill(); }); }
      if (p.kind === 'microwave') box(ctx, px, py, 1.83, 1.2, .9, .75, '#2f2e33');
      if (p.kind === 'plant') A.prop.plant(ctx, px + .35, py + .5, 1.83, .7);
      if (p.kind === 'bag') { const st = S && S.objState ? S.objState(p.id) || {} : {}; if (st.here) box(ctx, px, py + .2, 1.83, .55, .4, .55, '#d8bf94'); }
    });
  };
  F.fridge = (ctx, it, S) => {
    const {x, y, w, d} = it, col = it.color || '#e9ece9';
    footShadow(ctx, x, y, w, d, .22);
    box(ctx, x, y, 0, w, d, 4, col);
    const front = it.face === 'E' ? plane.eastX : plane.southY;
    front(ctx, it.face === 'E' ? x + w + .002 : x, it.face === 'E' ? y + d : y + d + .002, 4, c => {
      const L = it.face === 'E' ? d : w;
      c.strokeStyle = alpha('#000', .2); c.lineWidth = .03; c.beginPath(); c.moveTo(0, 1.4); c.lineTo(L, 1.4); c.stroke();
      c.fillStyle = '#a9b0b3'; c.fillRect(L - .25, .5, .06, .7); c.fillRect(L - .25, 1.6, .06, 1);
      (it.magnets || []).forEach((m, i) => { c.save(); c.translate(.2 + i * .45, 1.7 + (i % 2) * .5); c.rotate((H(i) - .5) * .2); c.fillStyle = m; c.fillRect(0, 0, .4, .5); c.restore(); });
    });
  };
  F.bookshelf = (ctx, it, S) => {
    const {x, y, w, d} = it, h = it.h || 4.2, col = it.color || '#6f4e37', alongX = it.face !== 'E';
    footShadow(ctx, x, y, w, d, .2);
    box(ctx, x, y, 0, w, d, h, col);
    const front = alongX ? plane.southY : plane.eastX;
    front(ctx, alongX ? x : x + w + .002, alongX ? y + d + .002 : y + d, h, c => {
      const L = alongX ? w : d, rows = Math.floor(h / 1.05);
      c.fillStyle = shade(col, .55); c.fillRect(.1, .1, L - .2, h - .2);
      for (let r = 0; r < rows; r++) {
        const sy = .15 + r * (h - .3) / rows, sh = (h - .3) / rows;
        let bx = .15;
        while (bx < L - .25) {
          const bw = .12 + H(bx * 13 + r * 7 + x) * .14, bh = sh * (.6 + H(bx * 3 + r) * .3);
          if (H(bx * 5 + r * 11 + y) > .93) { bx += .3; continue; }
          c.fillStyle = (it.books || ['#c0533c', '#3e6e8e', '#e2b04a', '#5b8c5a', '#7a4f7a', '#d9d2c3', '#2f4858', '#b56576'])[Math.floor(H(bx * 9 + r * 3) * 8) % (it.books || [1, 1, 1, 1, 1, 1, 1, 1]).length];
          c.fillRect(bx, sy + sh - bh - .05, Math.min(bw, L - .2 - bx), bh);
          c.fillStyle = alpha('#fff', .18); c.fillRect(bx, sy + sh - bh - .05 + bh * .2, Math.min(bw, L - .2 - bx), .03);
          bx += bw + .01;
        }
        c.fillStyle = col; c.fillRect(.1, sy + sh - .06, L - .2, .08);
      }
    });
  };
  F.easel = (ctx, it, S) => {
    const {x, y} = it, st = S && S.objState ? S.objState(it.id) || {} : {};
    const a = P(x + .2, y + .5, 0), b = P(x + 1.2, y + .5, 0), t = P(x + .7, y + .3, 4.4), r = P(x + .7, y + 1.2, 0);
    ctx.strokeStyle = '#8a6142'; ctx.lineWidth = 3.2; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(t[0], t[1]); ctx.moveTo(b[0], b[1]); ctx.lineTo(t[0], t[1]); ctx.moveTo(r[0], r[1]); ctx.lineTo(t[0], t[1] + 8); ctx.stroke();
    // canvas faces +y (lower left), tilted slightly
    face(ctx, [x - .15, y + .55, 4.2], [1, 0, 0], [0, .1, -1], c => {
      const W = 1.8, Hh = 2.1;
      c.fillStyle = '#efe7d8'; c.fillRect(0, 0, W, Hh);
      A.painting(c, W, Hh, st.progress ?? it.progress ?? .4, st.window || null, S);
      c.strokeStyle = '#c9b89a'; c.lineWidth = .06; c.strokeRect(0, 0, W, Hh);
    });
    const ledge = P(x + .15, y + .7, 2.05); ctx.fillStyle = '#8a6142'; ctx.fillRect(ledge[0], ledge[1], 60, 4);
  };
  /* Noor's painting of the street. progress 0..1 fills windows with colour; `win` is what she put in the last window. */
  A.painting = (c, W, Hh, prog, win, S) => {
    const g = c.createLinearGradient(0, 0, 0, Hh); g.addColorStop(0, '#f6c98a'); g.addColorStop(.6, '#e7967a'); g.addColorStop(1, '#7c6c9a');
    c.globalAlpha = .35 + prog * .65; c.fillStyle = g; c.fillRect(.1, .1, W - .2, Hh * .45); c.globalAlpha = 1;
    c.fillStyle = '#4e4a6e'; c.fillRect(.15, Hh * .3, W * .55, Hh * .66); c.fillStyle = '#6c5a7e'; c.fillRect(W * .66, Hh * .42, W * .28, Hh * .54);
    const wins = [[.3, .4], [.65, .4], [1, .4], [.3, .62], [.65, .62], [1, .62], [.3, .82], [.65, .82]];
    wins.forEach(([u, v], i) => {
      const lit = i / wins.length < prog;
      c.fillStyle = lit ? ['#ffd68a', '#ffe9b8', '#f7b267'][i % 3] : '#efe7d8';
      if (i === 4) c.fillStyle = win === 'lamp' ? '#ffcc66' : win === 'curtain' ? '#c98b5e' : '#efe7d8';
      c.fillRect(u - .1, Hh * v - .1, .22, .2);
      if (i === 4 && !win) { c.strokeStyle = alpha('#7a6a5a', .7); c.lineWidth = .02; c.setLineDash([.03, .03]); c.strokeRect(u - .1, Hh * v - .1, .22, .2); c.setLineDash([]); }
      if (i === 4 && win === 'curtain') { c.fillStyle = '#ffcc66'; c.fillRect(u - .02, Hh * v - .1, .06, .2); }
      if (lit && i === 1) { c.fillStyle = '#4e8a4e'; c.fillRect(u - .08, Hh * v + .03, .18, .06); }
      if (lit && i === 6) { c.fillStyle = '#333'; c.beginPath(); c.arc(u, Hh * v + .02, .04, 0, 7); c.fill(); }
    });
    c.fillStyle = '#c98b5e'; c.fillRect(W * .66, Hh * .8, W * .28, Hh * .16);
    c.fillStyle = '#e3b448'; c.font = 'italic .09px Georgia'; c.fillText('Ferro', W * .72, Hh * .84);
  };
  F.plant = (ctx, it) => A.prop.plant(ctx, it.x + .4, it.y + .4, 0, it.size || 1.4, it.kind);
  F.lamp = (ctx, it, S) => {
    const on = S && S.objState ? (S.objState(it.id) || {}).on ?? it.on : it.on;
    cyl(ctx, it.x + .3, it.y + .3, 0, .22, .1, '#2f2b30');
    cyl(ctx, it.x + .3, it.y + .3, .1, .03, (it.h || 3.6) - .9, '#2f2b30');
    const z = (it.h || 3.6) - .9; const t = P(it.x + .3, it.y + .3, z), b = P(it.x + .3, it.y + .3, z + .8);
    ctx.fillStyle = on ? '#ffe3a6' : (it.shade || '#e8dcc6'); ctx.beginPath(); ctx.moveTo(t[0] - 16, t[1]); ctx.lineTo(b[0] - 9, b[1]); ctx.lineTo(b[0] + 9, b[1]); ctx.lineTo(t[0] + 16, t[1]); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,.2)'; ctx.stroke();
  };
  F.deskLamp = (ctx, it, S) => { const on = S && S.objState ? (S.objState(it.id) || {}).on ?? it.on : it.on; const z = it.z || 1.6; cyl(ctx, it.x, it.y, z, .14, .06, '#2f2b30'); const a = P(it.x, it.y, z), b = P(it.x + .15, it.y, z + .9); ctx.strokeStyle = '#2f2b30'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); ctx.fillStyle = on ? '#ffe3a6' : '#2e6b63'; ctx.beginPath(); ctx.ellipse(b[0] + 4, b[1] + 3, 8, 5, .4, 0, 7); ctx.fill(); };
  F.crate = (ctx, it, S) => {
    const {x, y, w, d} = it; footShadow(ctx, x, y, w, d, .15); box(ctx, x, y, 0, w, d, it.h || 1.2, it.color || '#b9895b');
    plane.southY(ctx, x, y + d + .002, it.h || 1.2, c => { c.strokeStyle = alpha('#000', .2); c.lineWidth = .04; for (let k = .3; k < (it.h || 1.2); k += .3) { c.beginPath(); c.moveTo(0, k); c.lineTo(w, k); c.stroke(); } });
    if (it.record) { const st = S && S.objState ? S.objState(it.id) || {} : {}; box(ctx, x + .1, y + .1, it.h || 1.2, w - .2, d - .2, .25, '#5a3b2a'); const c = P(x + w / 2, y + d / 2, (it.h || 1.2) + .26); ctx.save(); ctx.translate(c[0], c[1]); ctx.scale(1, .5); ctx.fillStyle = '#141414'; ctx.beginPath(); ctx.arc(0, 0, 18, 0, 7); ctx.fill(); ctx.fillStyle = st.on ? '#e07a5f' : '#b94e3c'; ctx.beginPath(); ctx.arc(0, 0, 5, 0, 7); ctx.fill(); if (st.on) { ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(0, 0, 12, performance.now() / 300, performance.now() / 300 + 1); ctx.stroke(); } ctx.restore(); }
    if (it.records) for (let i = 0; i < 6; i++) { const p0 = P(x + .15 + i * .1, y + d - .1, .15); ctx.fillStyle = ['#e07a5f', '#3d405b', '#81b29a', '#f2cc8f', '#222', '#b56576'][i]; ctx.fillRect(p0[0], p0[1] - 26, 3, 26); }
  };
  F.desk = (ctx, it, S) => { F.table(ctx, {...it, h: it.h || 1.55}); };
  F.box = (ctx, it) => { footShadow(ctx, it.x, it.y, it.w, it.d, .15); box(ctx, it.x, it.y, it.z || 0, it.w, it.d, it.h || .8, it.color || '#c9a77b'); if (it.tape) plane.floor(ctx, it.x, it.y, (it.z || 0) + (it.h || .8) + .003, c => { c.fillStyle = '#d8c79f'; c.fillRect(0, it.d / 2 - .08, it.w, .16); }); };
  F.bike = (ctx, it) => {
    const {x, y} = it; const wheel = (wx, wy, flat) => { const c = P(wx, wy, .65); ctx.save(); ctx.translate(c[0], c[1]); ctx.strokeStyle = '#26262b'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(0, 0, 14, flat ? 18 : 22, -.95, 0, 7); ctx.stroke(); ctx.restore(); };
    wheel(x + .2, y + .3); wheel(x + .2, y + 2.1, it.flat);
    const a = P(x + .2, y + .3, .65), b = P(x + .2, y + 1.2, 1.4), cc = P(x + .2, y + 2.1, .65), s = P(x + .2, y + 1.7, 1.6), hb = P(x + .2, y + .5, 1.8);
    ctx.strokeStyle = it.color || '#3a7ca5'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(cc[0], cc[1]); ctx.moveTo(b[0], b[1]); ctx.lineTo(s[0], s[1]); ctx.moveTo(a[0], a[1]); ctx.lineTo(hb[0], hb[1]); ctx.stroke();
    ctx.fillStyle = '#222'; ctx.fillRect(s[0] - 6, s[1] - 2, 12, 4); ctx.strokeStyle = '#222'; ctx.beginPath(); ctx.moveTo(hb[0] - 8, hb[1] - 2); ctx.lineTo(hb[0] + 8, hb[1] + 2); ctx.stroke();
  };
  F.case = (ctx, it, S) => { // Dele's sign-writing case
    const st = S && S.objState ? S.objState(it.id) || {} : {}; const {x, y} = it;
    footShadow(ctx, x, y, 1.6, .9, .18);
    box(ctx, x, y, 0, 1.6, .9, .55, '#5a3826');
    if (st.open) { box(ctx, x, y - .05, .55, 1.6, .12, .9, '#6b4430'); plane.floor(ctx, x + .1, y + .1, .56, c => { ['#e3b448', '#c0533c', '#f2f2f2', '#2f4858', '#7a4f7a'].forEach((col, i) => { c.fillStyle = col; c.fillRect(.1 + i * .27, .15, .18, .2); }); c.fillStyle = '#d9c29b'; for (let i = 0; i < 6; i++) c.fillRect(.1 + i * .22, .45, .05, .3); }); }
    else { const h = P(x + .8, y + .9, .45); ctx.fillStyle = '#c9a74d'; ctx.fillRect(h[0] - 5, h[1] - 2, 10, 3); }
  };
  F.board = (ctx, it, S) => { // practice sign leaning on the wall, faces +y
    face(ctx, [it.x, it.y + .25, it.h || 2], [1, 0, 0], [0, .12, -1], c => {
      const w = it.w || 2.2, h = it.h || 2;
      c.fillStyle = it.bg || '#1d2b3a'; c.fillRect(0, 0, w, h);
      c.fillStyle = it.fg || '#e3b448'; c.font = `italic bold ${h * .26}px Georgia`; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText(it.text || 'Ferro’s', w / 2, h * .42);
      if (it.sub) { c.font = `${h * .1}px Georgia`; c.fillText(it.sub, w / 2, h * .72); }
      c.strokeStyle = it.fg || '#e3b448'; c.lineWidth = .03; c.strokeRect(.1, .1, w - .2, h - .2);
    });
  };
  F.cart = (ctx, it, S) => {
    const {x, y} = it, st = S && S.objState ? S.objState(it.id) || {} : {}; const left = st.left ?? 3;
    footShadow(ctx, x, y, 2, 1, .18);
    [[x + .15, y + .15], [x + 1.75, y + .15], [x + .15, y + .85], [x + 1.75, y + .85]].forEach(([a, b]) => cyl(ctx, a, b, 0, .08, .18, '#222'));
    box(ctx, x, y, .25, 2, 1, .1, '#7c8a94'); box(ctx, x, y, 1.2, 2, 1, .1, '#7c8a94');
    [[x, y], [x + 1.9, y], [x, y + .9], [x + 1.9, y + .9]].forEach(([a, b]) => box(ctx, a, b, .25, .1, .1, 1.05, '#5d6a73', {hi: false}));
    for (let i = 0; i < 8 + left * 2; i++) { const bx = x + .1 + (i % 9) * .2, row = i < 9 ? 1.3 : .35; const bh = .5 + H(i) * .3; box(ctx, bx, y + .2, row, .17, .6, bh, ['#c0533c', '#3e6e8e', '#e2b04a', '#5b8c5a', '#7a4f7a', '#d9d2c3'][i % 6], {hi: false}); }
  };
  F.libdesk = (ctx, it, S) => {
    const {x, y, w, d} = it; footShadow(ctx, x, y, w, d, .2);
    box(ctx, x, y, 0, w, d, 2.1, '#8a5e3c');
    plane.southY(ctx, x, y + d + .002, 2.1, c => { c.fillStyle = alpha('#000', .12); for (let i = .3; i < w; i += .5) c.fillRect(i, .2, .05, 1.8); });
    box(ctx, x - .1, y - .1, 2.1, w + .2, d + .2, .12, '#5e3d27');
    // monitor & stamp
    box(ctx, x + w - 1.3, y + .2, 2.22, .7, .5, .12, '#333'); box(ctx, x + w - 1.1, y + .35, 2.3, .1, .1, .6, '#333');
    face(ctx, [x + w - 1.6, y + .55, 3.6], [1, 0, 0], [0, 0, -1], c => { c.fillStyle = '#222'; c.fillRect(0, 0, 1.3, .85); c.fillStyle = '#7fa3c4'; c.fillRect(.06, .06, 1.18, .73); });
    cyl(ctx, x + .5, y + .6, 2.22, .14, .3, '#3e3a40');
  };
  F.shelves = (ctx, it) => F.bookshelf(ctx, {...it, h: it.h || 4.6, color: it.color || '#7a5538'});
  F.bench = (ctx, it, S) => {
    const {x, y, w, d} = it, col = it.color || '#a87a4f', alongX = it.face !== 'E';
    footShadow(ctx, x, y, w, d, .16);
    if (alongX) { box(ctx, x + .1, y + .1, 0, .2, d - .2, .85, shade(col, .8)); box(ctx, x + w - .3, y + .1, 0, .2, d - .2, .85, shade(col, .8)); for (let i = 0; i < 3; i++) box(ctx, x, y + i * d / 3 + .02, .85, w, d / 3 - .05, .1, col); if (it.back) { box(ctx, x, y, .95, w, .15, 1.1, col); } }
    else { box(ctx, x + .1, y + .1, 0, w - .2, .2, .85, shade(col, .8)); box(ctx, x + .1, y + d - .3, 0, w - .2, .2, .85, shade(col, .8)); for (let i = 0; i < 3; i++) box(ctx, x + i * w / 3 + .02, y, .85, w / 3 - .05, d, .1, col); if (it.back) box(ctx, x, y, .95, .15, d, 1.1, col); }
    if (it.plaque) { const p = P(x + w / 2, y + d, .9); ctx.fillStyle = '#c9a74d'; ctx.fillRect(p[0] - 7, p[1] - 2, 14, 4); }
  };
  F.workbench = (ctx, it, S) => {
    const {x, y, w, d} = it; footShadow(ctx, x, y, w, d, .2);
    [[x + .1, y + .1], [x + w - .3, y + .1], [x + .1, y + d - .3], [x + w - .3, y + d - .3]].forEach(([a, b]) => box(ctx, a, b, 0, .2, .2, 1.75, '#7d5a3a', {hi: false}));
    box(ctx, x + .1, y + .1, .5, w - .2, d - .2, .1, '#7d5a3a');
    box(ctx, x, y, 1.75, w, d, .2, '#b88a55');
    plane.floor(ctx, x, y, 1.951, c => { c.strokeStyle = alpha('#5a3f25', .3); c.lineWidth = .02; for (let i = .2; i < d; i += .25) { c.beginPath(); c.moveTo(0, i); c.lineTo(w, i + H(i) * .1); c.stroke(); } c.fillStyle = alpha('#f2e2c4', .8); for (let k = 0; k < 18; k++) { c.beginPath(); c.ellipse(H(k) * w, H(k * 2) * d, .12, .05, H(k * 3) * 3, 0, 7); c.fill(); } });
    box(ctx, x + w - .8, y + .2, 1.95, .5, .9, .45, '#4a6fa5'); // vise
  };
  F.rocker = (ctx, it, S) => { // Walt's small rocking chair in progress, facing +y
    const {x, y} = it, st = S && S.objState ? S.objState(it.id) || {} : {}; const z = it.z || 0, col = '#d9a86c';
    const rk = (yy) => { const a = P(x, yy, z + .25), b = P(x + 1.3, yy, z + .25), m = P(x + .65, yy, z - .05); ctx.strokeStyle = shade(col, .75); ctx.lineWidth = 3.5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.quadraticCurveTo(m[0], m[1] + 8, b[0], b[1]); ctx.stroke(); };
    rk(y + .1); rk(y + .9);
    [[x + .25, y + .1], [x + 1.05, y + .1], [x + .25, y + .9], [x + 1.05, y + .9]].forEach(([a, b]) => box(ctx, a, b, z + .1, .1, .1, .7, shade(col, .85), {hi: false}));
    box(ctx, x + .15, y, z + .8, 1, 1.05, .1, col);
    box(ctx, x + .15, y, z + .9, .1, 1.05, 1.2, col); // back (toward -x)
    for (let i = 0; i < 3; i++) box(ctx, x + .17, y + .15 + i * .3, z + 1.1, .06, .1, .9, shade(col, .95), {hi: false});
    box(ctx, x + .15, y, z + 2, .14, 1.05, .14, col);
    if (st.arm) box(ctx, x + .2, y - .02, z + 1.25, .95, .1, .1, shade(col, st.sanded ? 1.12 : .95));
  };
  F.tvstand = (ctx, it, S) => { const {x, y, w, d} = it; box(ctx, x, y, 0, w, d, 1, '#4a3a34'); const on = S && S.objState && (S.objState(it.id) || {}).on; box(ctx, x + .2, y + .3, 1, w - .4, .2, 1.9, '#1a1a1e'); face(ctx, [x + .25, y + .5, 2.85], [1, 0, 0], [0, 0, -1], c => { c.fillStyle = on ? '#5b84b1' : '#25262c'; c.fillRect(0, 0, w - .5, 1.75); }); };
  F.sidetable = (ctx, it) => { const {x, y} = it, w = it.w || .9, d = it.d || .9; footShadow(ctx, x, y, w, d, .12); box(ctx, x, y, 0, w, d, it.h || 1.1, it.color || '#8a6447'); };
  F.radiator = (ctx, it) => { box(ctx, it.x, it.y, .3, it.w, it.d, 1.3, '#e8e4dc'); };
  F.pile = (ctx, it) => { for (let i = 0; i < (it.n || 5); i++) { const p = P(it.x + H(i) * .5, it.y + H(i * 2) * .4, (it.z || 0) + i * .03); ctx.fillStyle = ['#f3efe6', '#e8dcc6', '#dfe8ef', '#f6e3d3'][i % 4]; ctx.save(); ctx.translate(p[0], p[1]); ctx.rotate(H(i * 3) - .5); ctx.fillRect(-9, -5, 18, 11); ctx.strokeStyle = 'rgba(0,0,0,.15)'; ctx.strokeRect(-9, -5, 18, 11); ctx.restore(); } };
  F.basket = (ctx, it) => { cyl(ctx, it.x + .4, it.y + .4, 0, .4, .9, '#c9a46c', {open: true, inner: it.inner || '#7d8fa6'}); };
  F.coatrack = (ctx, it) => { const b = P(it.x, it.y, 0), t = P(it.x, it.y, 4.2); ctx.strokeStyle = '#5b4535'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(b[0], b[1]); ctx.lineTo(t[0], t[1]); ctx.stroke(); (it.coats || []).forEach((col, i) => { ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(t[0] + (i ? 4 : -4), t[1] + 8); ctx.lineTo(t[0] + (i ? 14 : -14), t[1] + 60); ctx.lineTo(t[0] + (i ? 2 : -2), t[1] + 62); ctx.fill(); }); };
  F.cane = (ctx, it) => { const b = P(it.x, it.y, 0), t = P(it.x, it.y + .1, 2.4); ctx.strokeStyle = '#3b2a20'; ctx.lineWidth = 2.4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(b[0], b[1]); ctx.lineTo(t[0], t[1]); ctx.quadraticCurveTo(t[0] + 8, t[1] - 6, t[0] + 9, t[1] + 2); ctx.stroke(); };
  F.drawers = (ctx, it, S) => { const {x, y, w, d} = it; footShadow(ctx, x, y, w, d, .16); box(ctx, x, y, 0, w, d, it.h || 1.8, it.color || '#8a6447'); const f = it.face === 'E' ? plane.eastX : plane.southY; f(ctx, it.face === 'E' ? x + w + .002 : x, it.face === 'E' ? y + d : y + d + .002, it.h || 1.8, c => { const L = it.face === 'E' ? d : w; for (let i = 0; i < 3; i++) { c.strokeStyle = alpha('#000', .2); c.lineWidth = .03; c.strokeRect(.08, .1 + i * .55, L - .16, .48); c.fillStyle = '#d9c29b'; c.fillRect(L / 2 - .12, .3 + i * .55, .24, .05); } }); };
  F.wood = (ctx, it) => { for (let i = 0; i < 4; i++) box(ctx, it.x + i * .05, it.y + i * .25, i * .02, 2.2 - i * .3, .2, .2, ['#d9a86c', '#c4925a', '#e0b57d', '#b9844f'][i]); };
  F.shavings = (ctx, it) => plane.floor(ctx, it.x, it.y, .01, c => { c.fillStyle = alpha('#f0d9ae', .9); for (let k = 0; k < 40; k++) { c.beginPath(); c.ellipse(H(k) * it.w, H(k * 7) * it.d, .1, .04, H(k * 3) * 3, 0, 7); c.fill(); } });

  /* ---------- small props ---------- */
  A.prop = {
    cup(ctx, x, y, z, col = '#f2efe8', st = {}) {
      cyl(ctx, x, y, z, .12, .28, col, {open: true, inner: st.full ? (st.drink || '#8a5a3b') : shade(col, .55)});
      const a = P(x + .12, y, z + .2); ctx.strokeStyle = shade(col, .8); ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(a[0] + 2, a[1], 2.8, -1.3, 1.3); ctx.stroke();
    },
    kettle(ctx, x, y, z, col, st = {}) {
      cyl(ctx, x, y, z, .28, .55, col); const t = P(x, y, z + .55);
      ctx.strokeStyle = '#2f2b30'; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.arc(t[0], t[1] - 2, 9, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
      const s = P(x + .3, y + .05, z + .38); ctx.fillStyle = shade(col, .8); ctx.beginPath(); ctx.moveTo(s[0] - 4, s[1] + 4); ctx.lineTo(s[0] + 9, s[1] - 5); ctx.lineTo(s[0] + 9, s[1] - 1); ctx.lineTo(s[0] - 2, s[1] + 8); ctx.fill();
    },
    plant(ctx, x, y, z, size = 1.4, kind = 'leafy') {
      const potH = .45 * size; cyl(ctx, x, y, z, .22 * size, potH, kind === 'dry' ? '#9c7b5c' : '#c96f4a');
      const b = P(x, y, z + potH);
      const leaves = kind === 'dry' ? ['#a39466', '#8c7d52'] : ['#3f7d4e', '#5a9a5f', '#2f6b45'];
      const n = kind === 'tall' ? 9 : 7;
      for (let i = 0; i < n; i++) {
        const a = -Math.PI / 2 + (H(i + size) - .5) * 2.4, len = (kind === 'tall' ? 34 : 22) * size * (.7 + H(i * 2) * .5);
        const ex = b[0] + Math.cos(a) * len * .7, ey = b[1] + Math.sin(a) * len;
        ctx.strokeStyle = leaves[2] || leaves[0]; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(b[0], b[1]); ctx.lineTo(ex, ey); ctx.stroke();
        ctx.fillStyle = leaves[i % leaves.length]; ctx.beginPath(); ctx.ellipse(ex, ey, 5 * size, (kind === 'dry' ? 7 : 9) * size, a + Math.PI / 2, 0, 7); ctx.fill();
        if (kind === 'dry') { ctx.fillStyle = 'rgba(120,90,50,.4)'; ctx.beginPath(); ctx.ellipse(ex, ey + 3, 3, 3, 0, 0, 7); ctx.fill(); }
      }
    },
    plate(ctx, x, y, z, food) { const c = P(x, y, z + .02); ctx.save(); ctx.translate(c[0], c[1]); ctx.scale(1, .5); ctx.fillStyle = '#f7f4ee'; ctx.beginPath(); ctx.arc(0, 0, 11, 0, 7); ctx.fill(); ctx.strokeStyle = 'rgba(0,0,0,.15)'; ctx.stroke(); if (food) { ctx.fillStyle = '#f4d35e'; ctx.beginPath(); ctx.arc(-2, 0, 4, 0, 7); ctx.fill(); ctx.fillStyle = '#c98a4a'; ctx.fillRect(2, -4, 7, 7); } ctx.restore(); },
    phone(ctx, x, y, z, down) { BF.iso.plane.floor(ctx, x, y, z + .01, c => { c.fillStyle = '#1c1c20'; c.fillRect(0, 0, .25, .45); if (!down) { c.fillStyle = '#4b6c8f'; c.fillRect(.02, .03, .21, .39); } }); },
    note(ctx, x, y, z) { BF.iso.plane.floor(ctx, x, y, z + .005, c => { c.fillStyle = '#fffaf0'; c.save(); c.rotate(.2); c.fillRect(0, 0, .5, .38); c.fillStyle = 'rgba(40,40,60,.5)'; for (let i = 0; i < 3; i++) c.fillRect(.06, .08 + i * .09, .36, .02); c.restore(); }); },
    bag(ctx, x, y, z) { BF.iso.box(ctx, x, y, z, .5, .35, .6, '#d8bf94'); const t = P(x + .25, y + .17, z + .6); ctx.fillStyle = '#b5482e'; ctx.font = 'italic 6px Georgia'; ctx.fillText('F', t[0] - 2, t[1] + 12); },
    books(ctx, x, y, z, n = 3) { for (let i = 0; i < n; i++) BF.iso.box(ctx, x, y, z + i * .15, .7, .5, .14, ['#3e6e8e', '#c0533c', '#e2b04a', '#5b8c5a'][i % 4]); },
    keys(ctx, x, y, z) { const c = P(x, y, z + .01); ctx.strokeStyle = '#c9a74d'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(c[0], c[1], 3, 0, 7); ctx.stroke(); ctx.fillStyle = '#c9a74d'; ctx.fillRect(c[0] + 2, c[1], 7, 2); },
    cards(ctx, x, y, z) { BF.iso.box(ctx, x, y, z, .45, .6, .2, '#f4efe2'); const c = P(x + .2, y + .3, z + .21); ctx.strokeStyle = '#c0392b'; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(c[0], c[1], 8, 4, 0, 0, 7); ctx.stroke(); },
    sign(ctx, x, y, z, wrapped) { face(ctx, [x, y + .2, z + 1.6], [1, 0, 0], [0, .15, -1], c => { c.fillStyle = wrapped ? '#c9b18a' : '#24476b'; c.fillRect(0, 0, 2.2, 1.6); if (wrapped) { c.strokeStyle = '#8a6a4a'; c.lineWidth = .04; c.beginPath(); c.moveTo(1.1, 0); c.lineTo(1.1, 1.6); c.moveTo(0, .8); c.lineTo(2.2, .8); c.stroke(); } else { c.fillStyle = '#f2c14e'; c.font = 'bold .32px Georgia'; c.textAlign = 'center'; c.fillText('READING', 1.1, .7); c.fillText('CORNER', 1.1, 1.1); } }); },
  };
  return A;
})();
