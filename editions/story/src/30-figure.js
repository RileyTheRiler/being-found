/* Illustrated characters: one shared, procedurally drawn rig with per-person hair, clothing and build. */
'use strict';
BF.figure = (() => {
  const {shade, alpha} = BF.c;
  const {clamp, lerp} = BF.u;

  /* ---------- cast ---------- */
  const CAST = {
    noor: {name: 'Noor', h: 1.0, w: 1.0, skin: '#8d5a3b', hair: {style: 'puff', color: '#2a1c17'}, top: {kind: 'sweater', color: '#2a9d8f'}, legs: '#2e3a59', shoes: '#ece6da', color: '#2a9d8f'},
    dele: {name: 'Dele', h: 1.06, w: 1.08, skin: '#5b3a28', hair: {style: 'crop', color: '#17110e'}, beard: true, top: {kind: 'hoodie', color: '#d4a12a'}, legs: '#3b3f4a', shoes: '#9aa3ad', socks: true, color: '#d4a12a'},
    mara: {name: 'Mara', h: 1.01, w: 1.0, skin: '#634030', hair: {style: 'braids', color: '#1b1412'}, top: {kind: 'coat', color: '#b5482e', inner: '#efe6d6'}, legs: '#2b2b33', shoes: '#3a2b24', color: '#c4573a', earrings: true},
    leena: {name: 'Leena', h: .98, w: .96, skin: '#f0c9a8', hair: {style: 'bob', color: '#a3492a'}, glasses: '#3b2a26', top: {kind: 'cardigan', color: '#3f6b4f', inner: '#f2efe6', stripe: '#2f4858'}, legs: '#2c3550', shoes: '#6b3b2a', lanyard: '#d64545', color: '#3f6b4f', freckles: true},
    walt: {name: 'Walt', h: .97, w: 1.05, skin: '#e8b99a', hair: {style: 'white', color: '#ece8e1'}, mustache: '#e2ddd5', glasses: '#6b5a4a', top: {kind: 'flannel', color: '#3c5f8a', check: '#a33b2e'}, legs: '#6b5038', shoes: '#3a2b24', stoop: .06, color: '#3c5f8a'},
    june: {name: 'June', h: .93, w: .98, skin: '#efc4a4', hair: {style: 'grey', color: '#c9c4c0'}, top: {kind: 'cardigan', color: '#8a7bb0', inner: '#f4efe8'}, legs: '#4a4a58', shoes: '#5a4a40', color: '#8a7bb0', earrings: true},
    sami: {name: 'Sami', h: 1.02, w: 1.12, skin: '#c48e63', hair: {style: 'bald', color: '#3b2a20'}, mustache: '#3b2a20', top: {kind: 'apron', color: '#f3efe6', inner: '#2f4858'}, legs: '#3a3a42', shoes: '#2a2a2e', color: '#c48e63'},
    nia: {name: 'Nia', h: 1, w: 1, skin: '#7a4a32', hair: {style: 'puff', color: '#151010'}, top: {kind: 'sweater', color: '#e07a5f'}, legs: '#333', shoes: '#eee', color: '#e07a5f'},
    patron: {name: 'Mr. Adeyemi', h: .99, w: 1.04, skin: '#4e3326', hair: {style: 'short', color: '#cfcac4'}, glasses: '#2b2b2b', top: {kind: 'coat', color: '#7a6a4f', inner: '#d9d2c3'}, legs: '#3a3a42', shoes: '#2a2a2e', color: '#7a6a4f'},
  };

  /* ---------- helpers ---------- */
  function limb(ctx, pts, w, col, outline = true) {
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const path = () => { ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); };
    if (outline) { path(); ctx.strokeStyle = alpha(shade(col, .45), .85); ctx.lineWidth = w + 2; ctx.stroke(); }
    path(); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.stroke();
  }
  function ik(A, B, L1, L2, preferDown, fwd) {
    let dx = B[0] - A[0], dy = B[1] - A[1], d = Math.hypot(dx, dy);
    const max = L1 + L2 - .01; if (d > max) { B = [A[0] + dx / d * max, A[1] + dy / d * max]; dx = B[0] - A[0]; dy = B[1] - A[1]; d = max; }
    d = Math.max(d, Math.abs(L1 - L2) + .01);
    const a = Math.acos(clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1)), base = Math.atan2(dy, dx);
    const e1 = [A[0] + Math.cos(base + a) * L1, A[1] + Math.sin(base + a) * L1], e2 = [A[0] + Math.cos(base - a) * L1, A[1] + Math.sin(base - a) * L1];
    let pick;
    if (preferDown === 'arm') pick = (e1[1] - e1[0] * fwd * .55) > (e2[1] - e2[0] * fwd * .55) ? e1 : e2; // elbows down and slightly back
    else if (preferDown === 'fwd') pick = (e1[0] * fwd > e2[0] * fwd) ? e1 : e2; // knee forward
    else if (preferDown === 'back') pick = (e1[0] * fwd < e2[0] * fwd) ? e1 : e2; // elbow back
    else pick = e1[1] > e2[1] ? e1 : e2;
    return [pick, B];
  }

  /* ---------- pose solver: returns anchor points for the current pose (right-facing space) ---------- */
  function solve(ch, o) {
    const back = o.dir[0] === 'b';
    const dv = back ? [1, -.45] : [1, .45];
    const t = o.t || 0, pose = o.pose || 'stand', ph = o.phase || 0;
    const seated = /^sit/.test(pose);
    const stoop = ch.stoop || 0;
    let hipY = -52, bob = 0, lean = stoop * 8;
    let feet, hips = [[-3.5, 1.2], [3, -1]];
    const breathe = Math.sin(t * 1.7 + (ch.seed || 0)) * .6;
    if (pose === 'walk') {
      bob = -Math.abs(Math.cos(ph)) * 2.2 + 1;
      const s0 = Math.sin(ph), s1 = Math.sin(ph + Math.PI);
      feet = [[-3.5 + dv[0] * s0 * 9, 1 + dv[1] * s0 * 9 - Math.max(0, Math.cos(ph)) * 4],
              [3 + dv[0] * s1 * 9, -1 + dv[1] * s1 * 9 - Math.max(0, Math.cos(ph + Math.PI)) * 4]];
    } else if (seated) {
      const sh = o.seat || 32; hipY = -sh; lean = pose === 'sitSlump' ? -6 : pose === 'sitLean' ? 6 : stoop * 8;
      feet = [[-3 + dv[0] * 20, 2 + dv[1] * 20], [4 + dv[0] * 21, dv[1] * 21]];
    } else {
      feet = [[-4, 1.5], [3.5, -1]];
    }
    const hy = hipY + bob;
    const hipC = [0, hy];
    const shoulderY = hy - 38 + (seated ? 0 : breathe * .3);
    const neck = [lean * .6, shoulderY - 3];
    const head = [lean + (o.headX || 0), shoulderY - 15 + (o.headY || 0)];
    // arms: shoulders, hands
    const shN = [-7 + lean * .5, shoulderY + 2], shF = [6 + lean * .5, shoulderY + 1];
    let hN = [shN[0] - 1.5 + lean * .2, shN[1] + 38.5 + breathe * .4], hF = [shF[0] + 1.5 + lean * .2, shF[1] + 38 + breathe * .4];
    const fwd = (k, up) => [dv[0] * k, dv[1] * k + up];
    const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
    const osc = (f, a) => Math.sin(t * f) * a;
    let item = null;
    switch (pose) {
      case 'walk': { const s = Math.sin(ph); hN = [shN[0] - 2 + dv[0] * -s * 7, shN[1] + 34 + dv[1] * -s * 7]; hF = [shF[0] + dv[0] * s * 6, shF[1] + 33 + dv[1] * s * 6]; break; }
      case 'reach': hN = add(shN, fwd(24, 10)); break;
      case 'reachHigh': hN = add(shN, fwd(22, -12)); break;
      case 'reachLow': hN = add(shN, fwd(20, 30)); lean += 4; break;
      case 'hold': case 'holdCup': hN = add(shN, fwd(9, 18)); hF = add(shF, fwd(6, 19)); item = o.item; break;
      case 'drink': hN = [neck[0] + 6, neck[1] - 3]; item = o.item || 'cup'; break;
      case 'phone': hN = add(shN, fwd(10, 15)); item = 'phone'; break;
      case 'call': hN = [head[0] - 6, head[1] + 4]; item = 'phoneEar'; break;
      case 'knock': hN = add(shN, fwd(22 + osc(18, 3), -8)); break;
      case 'paint': hN = add(shN, fwd(26 + osc(5, 2), -10 + osc(3.3, 6))); item = 'brush'; break;
      case 'stir': case 'cook': hN = add(shN, fwd(22 + osc(6, 3), 12 + osc(6, 1.5))); hF = add(shF, fwd(16, 14)); item = pose === 'stir' ? 'spoon' : null; break;
      case 'pour': hN = add(shN, fwd(22, 8)); hF = add(shF, fwd(18, 14)); item = 'kettle'; break;
      case 'sand': hN = add(shN, fwd(22 + osc(7, 5), 16)); hF = add(shF, fwd(20 + osc(7, 5), 17)); lean += 5; break;
      case 'write': hN = add(shN, fwd(18 + osc(4, 1.5), 24)); item = 'pen'; lean += 3; break;
      case 'gesture': hN = add(shN, fwd(12 + osc(2.2, 4), 14 + osc(3.1, 3))); break;
      case 'point': hN = add(shN, fwd(30, -4)); break;
      case 'wave': hN = [shN[0] - 4 + osc(9, 3), shN[1] - 20]; break;
      case 'cross': hN = [4, shoulderY + 14]; hF = [-5, shoulderY + 15]; break;
      case 'hands': hN = add(shN, fwd(8, 26)); hF = add(shF, fwd(5, 26)); break;
      case 'think': hN = [head[0] + 4, head[1] + 10]; break;
      case 'shelve': hN = add(shN, fwd(22, -2 + osc(2, 1))); item = 'book'; break;
      case 'water': hN = add(shN, fwd(22, 12)); item = 'can'; break;
      case 'sitSlump': case 'sit': case 'sitLean':
        hN = [hipC[0] + dv[0] * 12 - 4, hy + dv[1] * 12 - 3]; hF = [hipC[0] + dv[0] * 14 + 5, hy + dv[1] * 14 - 4];
        if (o.item) { hN = add(shN, fwd(10, 17)); item = o.item; }
        if (o.arm === 'gesture') hN = add(shN, fwd(12 + osc(2.2, 4), 13 + osc(3.1, 3)));
        if (o.arm === 'drink') { hN = [neck[0] + 6, neck[1] - 3]; item = o.item || 'cup'; }
        if (o.arm === 'phone') { hN = add(shN, fwd(10, 17)); item = 'phone'; }
        if (o.arm === 'write') { hN = add(shN, fwd(18 + osc(4, 1.5), 16)); item = 'pen'; }
        if (o.arm === 'sand') { hN = add(shN, fwd(20 + osc(7, 4), 14)); hF = add(shF, fwd(18 + osc(7, 4), 15)); }
        break;
      case 'bag': hN = [-10, hy - 2]; item = 'bag'; break;
    }
    if (o.item && !item) item = o.item;
    return {dv, back, seated, feet, hips, hy, hipC, shoulderY, neck, head, shN, shF, hN, hF, lean, item, pose};
  }

  /* ---------- body parts ---------- */
  function drawLegs(ctx, ch, S, o) {
    const fwdSign = 1, L1 = 26, L2 = 26;
    const pants = ch.legs, shoe = ch.shoes;
    const order = [1, 0]; // far leg first
    order.forEach(i => {
      const hp = [S.hips[i][0] + S.lean * .2, S.hy + S.hips[i][1]];
      let foot = S.feet[i];
      let knee;
      if (S.seated) {
        knee = [hp[0] + S.dv[0] * 19, hp[1] + S.dv[1] * 19 - 1];
        foot = [knee[0] + 2, 0 + S.feet[i][1] * .2];
      } else {
        [knee, foot] = ik(hp, foot, L1, L2, 'fwd', S.back ? 1 : 1);
      }
      const col = i === 1 ? shade(pants, .82) : pants;
      limb(ctx, [hp, knee, [foot[0], foot[1] - 4]], 8.5 * (ch.w || 1), col);
      if (ch.socks) { ctx.fillStyle = shade(shoe, i ? .8 : 1); ctx.beginPath(); ctx.ellipse(foot[0] + S.dv[0] * 2, foot[1] - 1.8, 5.2, 2.8, 0, 0, 7); ctx.fill(); }
      else { ctx.fillStyle = shade(shoe, i ? .78 : 1); ctx.beginPath(); ctx.ellipse(foot[0] + S.dv[0] * 2.5, foot[1] - 2, 6, 3.2, S.back ? .2 : -.1, 0, 7); ctx.fill(); ctx.strokeStyle = alpha('#000', .35); ctx.lineWidth = 1; ctx.stroke(); }
    });
  }
  function torsoPath(ctx, S, wscale, len) {
    const sy = S.shoulderY, hy = S.hy, l = S.lean, w = 11.5 * wscale, hw = 10.5 * wscale;
    const bottom = len ? hy + len : hy + 3;
    ctx.beginPath();
    ctx.moveTo(-w + l * .5, sy + 1);
    ctx.quadraticCurveTo(-w - 1.5 + l * .4, (sy + hy) / 2, -hw + l * .1, bottom);
    ctx.lineTo(hw + l * .1, bottom);
    ctx.quadraticCurveTo(w + 1 + l * .4, (sy + hy) / 2, w + l * .5, sy + 1);
    ctx.quadraticCurveTo(l * .5, sy - 3, -w + l * .5, sy + 1);
    ctx.closePath();
    return bottom;
  }
  function drawTorso(ctx, ch, S, o) {
    const top = ch.top, col = top.color, wsc = (ch.w || 1);
    const len = top.kind === 'coat' ? 20 : top.kind === 'apron' ? 4 : 0;
    const bottom = torsoPath(ctx, S, wsc, len);
    const g = ctx.createLinearGradient(-12, 0, 12, 0);
    g.addColorStop(0, shade(col, S.back ? .9 : 1.08)); g.addColorStop(.6, col); g.addColorStop(1, shade(col, .78));
    ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = alpha(shade(col, .4), .8); ctx.lineWidth = 1.2; ctx.stroke();
    ctx.save(); torsoPath(ctx, S, wsc, len); ctx.clip();
    const sy = S.shoulderY, hy = S.hy, l = S.lean;
    if (top.kind === 'flannel') {
      ctx.strokeStyle = alpha(top.check, .45); ctx.lineWidth = 1.4;
      for (let x = -14; x < 16; x += 5) { ctx.beginPath(); ctx.moveTo(x, sy - 5); ctx.lineTo(x + l * .5, bottom); ctx.stroke(); }
      for (let y = sy; y < bottom; y += 5) { ctx.beginPath(); ctx.moveTo(-15, y); ctx.lineTo(15, y); ctx.stroke(); }
    }
    if (top.kind === 'sweater' || top.kind === 'hoodie') { ctx.fillStyle = shade(col, .82); ctx.fillRect(-14, hy - 2, 30, 6); ctx.strokeStyle = alpha(shade(col, .65), .5); ctx.lineWidth = .8; for (let x = -12; x < 14; x += 2.2) { ctx.beginPath(); ctx.moveTo(x, hy - 2); ctx.lineTo(x, hy + 4); ctx.stroke(); } }
    if (!S.back) {
      if (top.kind === 'cardigan') { ctx.fillStyle = top.inner; ctx.beginPath(); ctx.moveTo(1 + l * .5, sy); ctx.lineTo(6 + l * .5, sy); ctx.lineTo(4 + l * .2, bottom); ctx.lineTo(1 + l * .2, bottom); ctx.fill(); if (top.stripe) { ctx.fillStyle = top.stripe; for (let y = sy + 4; y < bottom; y += 4.5) ctx.fillRect(0, y, 7, 1.6); } ctx.fillStyle = shade(col, .7); for (let y = sy + 9; y < bottom - 2; y += 8) { ctx.beginPath(); ctx.arc(.5 + l * .35, y, 1, 0, 7); ctx.fill(); } }
      if (top.kind === 'coat') { ctx.fillStyle = top.inner; ctx.beginPath(); ctx.moveTo(l * .5 - 1, sy - 1); ctx.lineTo(l * .5 + 7, sy - 1); ctx.lineTo(l * .4 + 3, sy + 14); ctx.closePath(); ctx.fill(); ctx.strokeStyle = shade(col, .6); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(l * .4 + 3, sy + 12); ctx.lineTo(l * .2 + 3, bottom); ctx.stroke(); ctx.fillStyle = shade(col, .6); [sy + 18, sy + 28].forEach(y => { ctx.beginPath(); ctx.arc(l * .3 + 5.5, y, 1.1, 0, 7); ctx.fill(); }); }
      if (top.kind === 'hoodie') { ctx.strokeStyle = shade(col, .65); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-6, hy - 12); ctx.quadraticCurveTo(3, hy - 15, 10, hy - 12); ctx.lineTo(10, hy - 3); ctx.lineTo(-6, hy - 3); ctx.closePath(); ctx.stroke(); ctx.strokeStyle = '#f4efe6'; ctx.beginPath(); ctx.moveTo(1 + l * .5, sy + 2); ctx.lineTo(0 + l * .5, sy + 12); ctx.moveTo(5 + l * .5, sy + 2); ctx.lineTo(6 + l * .5, sy + 11); ctx.stroke(); }
      if (top.kind === 'flannel') { ctx.fillStyle = shade(col, .6); for (let y = sy + 6; y < bottom; y += 7) { ctx.beginPath(); ctx.arc(2 + l * .4, y, .9, 0, 7); ctx.fill(); } }
      if (top.kind === 'apron') { ctx.fillStyle = top.inner; ctx.fillRect(-14, sy - 4, 30, 12); ctx.fillStyle = '#fbf8f2'; ctx.beginPath(); ctx.moveTo(-7, sy + 4); ctx.lineTo(9, sy + 4); ctx.lineTo(11, bottom); ctx.lineTo(-9, bottom); ctx.fill(); ctx.fillStyle = alpha('#d9c9a8', .7); ctx.beginPath(); ctx.arc(2, sy + 22, 3, 0, 7); ctx.fill(); }
      if (ch.lanyard) { ctx.strokeStyle = ch.lanyard; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(-3 + l * .5, sy); ctx.lineTo(1 + l * .4, sy + 15); ctx.lineTo(6 + l * .5, sy); ctx.stroke(); ctx.fillStyle = '#fff'; ctx.fillRect(-1.5 + l * .4, sy + 14, 5, 6); }
    } else if (top.kind === 'hoodie') { ctx.fillStyle = shade(col, .8); ctx.beginPath(); ctx.ellipse(l * .5, sy + 3, 8, 5, 0, 0, 7); ctx.fill(); }
    ctx.restore();
    if (top.kind === 'hoodie' && !S.back) { ctx.fillStyle = shade(col, .8); ctx.beginPath(); ctx.ellipse(-4 + S.lean * .5, S.shoulderY - 1, 9, 3.5, 0, 0, 7); ctx.fill(); }
  }
  function drawArm(ctx, ch, S, which) {
    const sh = which === 'N' ? S.shN : S.shF, hand = which === 'N' ? S.hN : S.hF;
    const [elbow, h] = ik(sh, hand, 21, 20, 'arm', 1);
    const col = which === 'N' ? ch.top.color : shade(ch.top.color, .8);
    const sleeve = ch.top.kind === 'apron' ? ch.top.inner : col;
    limb(ctx, [sh, elbow, h], 7 * (ch.w || 1), which === 'N' ? sleeve : shade(sleeve, .85));
    if (ch.top.kind === 'flannel' && which === 'N') { ctx.strokeStyle = alpha(ch.top.check, .4); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo((sh[0] + elbow[0]) / 2 - 3, (sh[1] + elbow[1]) / 2); ctx.lineTo((sh[0] + elbow[0]) / 2 + 3, (sh[1] + elbow[1]) / 2); ctx.stroke(); }
    ctx.fillStyle = which === 'N' ? ch.skin : shade(ch.skin, .85);
    ctx.beginPath(); ctx.arc(h[0], h[1], 3.3, 0, 7); ctx.fill(); ctx.strokeStyle = alpha(shade(ch.skin, .45), .6); ctx.lineWidth = .8; ctx.stroke();
    return h;
  }
  function drawItem(ctx, item, h, S) {
    if (!item) return;
    ctx.save(); ctx.translate(h[0], h[1]);
    if (item === 'cup') { ctx.fillStyle = '#f2efe8'; ctx.fillRect(-3, -8, 7, 8); ctx.strokeStyle = 'rgba(0,0,0,.3)'; ctx.lineWidth = .8; ctx.strokeRect(-3, -8, 7, 8); ctx.fillStyle = '#7b4f33'; ctx.fillRect(-2.5, -7.6, 6, 1.6); }
    if (item === 'phone') { ctx.fillStyle = '#1c1c20'; ctx.fillRect(-3, -9, 6.5, 10); ctx.fillStyle = '#9cc0e0'; ctx.fillRect(-2.2, -8.2, 5, 8); }
    if (item === 'phoneEar') { ctx.fillStyle = '#1c1c20'; ctx.fillRect(-2, -8, 4, 10); }
    if (item === 'brush') { ctx.strokeStyle = '#8a6142'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(-2, 4); ctx.lineTo(S.dv[0] * 12, S.dv[1] * 12 - 6); ctx.stroke(); ctx.fillStyle = '#e07a5f'; ctx.beginPath(); ctx.arc(S.dv[0] * 12, S.dv[1] * 12 - 6, 1.8, 0, 7); ctx.fill(); }
    if (item === 'spoon') { ctx.strokeStyle = '#999'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(4, 8); ctx.stroke(); }
    if (item === 'kettle') { ctx.fillStyle = '#d9d4cc'; ctx.beginPath(); ctx.ellipse(3, 2, 7, 6, 0, 0, 7); ctx.fill(); ctx.strokeStyle = 'rgba(0,0,0,.3)'; ctx.stroke(); }
    if (item === 'book') { ctx.fillStyle = '#3e6e8e'; ctx.fillRect(-3, -10, 6, 11); ctx.fillStyle = '#e2b04a'; ctx.fillRect(-3, -7, 6, 1.4); }
    if (item === 'bag') { ctx.fillStyle = '#d8bf94'; ctx.fillRect(-5, 0, 10, 12); ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.strokeRect(-5, 0, 10, 12); }
    if (item === 'card' || item === 'note') { ctx.fillStyle = '#fffaf0'; ctx.fillRect(-4, -6, 9, 7); ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = .8; ctx.strokeRect(-4, -6, 9, 7); }
    if (item === 'pen') { ctx.strokeStyle = '#1d3557'; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(3, 6); ctx.stroke(); }
    if (item === 'can') { ctx.fillStyle = '#7a9e9f'; ctx.fillRect(-3, -4, 8, 8); ctx.strokeStyle = '#7a9e9f'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(5, -2); ctx.lineTo(11, 2); ctx.stroke(); }
    if (item === 'pastry') { ctx.fillStyle = '#d99a4e'; ctx.beginPath(); ctx.ellipse(0, -2, 5, 3, 0, 0, 7); ctx.fill(); }
    if (item === 'sign') { ctx.fillStyle = '#24476b'; ctx.fillRect(-12, -14, 24, 16); ctx.fillStyle = '#f2c14e'; ctx.fillRect(-9, -9, 18, 2); ctx.fillRect(-9, -5, 18, 2); }
    if (item === 'wrapped') { ctx.fillStyle = '#c9b18a'; ctx.fillRect(-12, -14, 24, 16); ctx.strokeStyle = '#8a6a4a'; ctx.beginPath(); ctx.moveTo(0, -14); ctx.lineTo(0, 2); ctx.stroke(); }
    ctx.restore();
  }

  /* ---------- heads ---------- */
  function hairBack(ctx, ch, hx, hy, back) {
    const c = ch.hair.color, st = ch.hair.style;
    ctx.fillStyle = c;
    if (st === 'puff') { // voluminous curls gathered into a puff
      const blobs = back ? [[0, -6, 13], [-8, -2, 9], [8, -2, 9], [0, 4, 10], [-6, 6, 8], [6, 6, 8], [0, -16, 9]] : [[-9, -2, 8.5], [8, -3, 8], [0, -10, 11.5], [-7, 5, 6.5], [0, -19, 8.5]];
      blobs.forEach(([x, y, r]) => { ctx.beginPath(); ctx.arc(hx + x, hy + y, r, 0, 7); ctx.fill(); });
    }
    if (st === 'braids') { ctx.beginPath(); ctx.arc(hx - 1, hy - 14, 8, 0, 7); ctx.fill(); if (back) { ctx.strokeStyle = c; ctx.lineWidth = 3; for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(hx + i * 3, hy - 8); ctx.quadraticCurveTo(hx + i * 4, hy + 8, hx + i * 3 - 1, hy + 22); ctx.stroke(); } } }
    if (st === 'bob') { ctx.beginPath(); ctx.ellipse(hx - 1, hy + 1, 13, 14, 0, Math.PI * .95, Math.PI * 2.05); ctx.lineTo(hx + 12, hy + 10); ctx.quadraticCurveTo(hx, hy + 14, hx - 13, hy + 10); ctx.fill(); }
    if (st === 'grey') { [[-7, -5, 7], [7, -5, 7], [0, -9, 8], [-8, 2, 5], [8, 2, 5]].forEach(([x, y, r]) => { ctx.beginPath(); ctx.arc(hx + x, hy + y, r, 0, 7); ctx.fill(); }); }
  }
  function head(ctx, ch, hx, hy, o = {}) {
    const back = o.back, skin = ch.skin, c = ch.hair.color, st = ch.hair.style, t = o.t || 0;
    ctx.save(); ctx.translate(hx, hy + 3); ctx.scale(1.14, 1.14); ctx.translate(-hx, -hy - 3);
    if (o.lying) { ctx.translate(hx, hy); ctx.rotate(-1.2); hx = 0; hy = 0; }
    hairBack(ctx, ch, hx, hy, back);
    // neck shadow and head
    const g = ctx.createRadialGradient(hx - 3, hy - 4, 2, hx, hy, 13);
    g.addColorStop(0, shade(skin, 1.08)); g.addColorStop(1, shade(skin, .86));
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(hx, hy, 9.6, 11.2, 0, 0, 7); ctx.fill();
    ctx.strokeStyle = alpha(shade(skin, .45), .7); ctx.lineWidth = 1; ctx.stroke();
    const fo = back ? 0 : 2.6;
    if (!back) {
      // ear (near side)
      ctx.fillStyle = shade(skin, .9); ctx.beginPath(); ctx.ellipse(hx - 8.6, hy + 1, 2, 3, 0, 0, 7); ctx.fill();
      if (ch.earrings) { ctx.fillStyle = '#e3b448'; ctx.beginPath(); ctx.arc(hx - 8.6, hy + 5, 1.4, 0, 7); ctx.fill(); }
      // eyes
      const blink = o.blink ? .12 : 1, ex = hx + fo, ey = hy - 1 + (o.lookDown ? 1.6 : 0);
      const expr = o.expr || 'neutral';
      ctx.fillStyle = '#211a1d';
      if (o.lying || expr === 'closed') { ctx.strokeStyle = '#211a1d'; ctx.lineWidth = 1; [[-3.6, 0], [4, 0]].forEach(([dx]) => { ctx.beginPath(); ctx.arc(ex + dx, ey, 1.8, .2, Math.PI - .2); ctx.stroke(); }); }
      else {
        [[-3.6, 1], [4.2, .82]].forEach(([dx, s]) => { ctx.beginPath(); ctx.ellipse(ex + dx, ey, 1.35 * s, 1.85 * blink, 0, 0, 7); ctx.fill(); });
        if (expr === 'tired' && blink > .5) { ctx.fillStyle = skin; [[-3.6], [4.2]].forEach(([dx]) => ctx.fillRect(ex + dx - 2, ey - 2.6, 4, 1.6)); }
      }
      // brows
      ctx.strokeStyle = st === 'white' || st === 'grey' ? shade(c, .7) : shade(c, .9); ctx.lineWidth = 1.3; ctx.lineCap = 'round';
      const bt = {concern: [1.2, -1.2], frown: [-1.2, 1.2], smile: [0, 0], soft: [.4, -.4], tired: [.6, -.6], neutral: [0, 0], surprise: [-1, -1]}[expr] || [0, 0];
      ctx.beginPath(); ctx.moveTo(ex - 5.6, ey - 4 + bt[0] * .5); ctx.lineTo(ex - 1.8, ey - 4.4 - bt[0] * .5); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(ex + 2.4, ey - 4.4 - bt[1] * .5); ctx.lineTo(ex + 6, ey - 4 + bt[1] * .5); ctx.stroke();
      // nose
      ctx.strokeStyle = alpha(shade(skin, .55), .8); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(ex + 1.4, ey + 1); ctx.quadraticCurveTo(ex + 3.6, ey + 3.6, ex + 1.2, ey + 4.4); ctx.stroke();
      // mouth
      const my = hy + 6.4, mx = hx + fo + .4;
      ctx.strokeStyle = shade(skin, .42); ctx.lineWidth = 1.2;
      if (o.talking && Math.sin(t * 17) > -.2) { ctx.fillStyle = '#5a2a2a'; ctx.beginPath(); ctx.ellipse(mx, my + .3, 2.2, 1.1 + Math.abs(Math.sin(t * 17)) * .9, 0, 0, 7); ctx.fill(); }
      else if (expr === 'smile') { ctx.beginPath(); ctx.arc(mx, my - 1.6, 3, .45, Math.PI - .45); ctx.stroke(); }
      else if (expr === 'soft') { ctx.beginPath(); ctx.arc(mx, my - 3, 3.4, .7, Math.PI - .7); ctx.stroke(); }
      else if (expr === 'frown' || expr === 'concern') { ctx.beginPath(); ctx.arc(mx, my + 2.6, 2.6, Math.PI + .6, -.6); ctx.stroke(); }
      else { ctx.beginPath(); ctx.moveTo(mx - 2.2, my); ctx.lineTo(mx + 2.2, my); ctx.stroke(); }
      // cheeks and freckles
      ctx.fillStyle = alpha('#e0705a', .13); ctx.beginPath(); ctx.ellipse(ex - 4.5, ey + 4, 2.6, 1.6, 0, 0, 7); ctx.fill();
      if (ch.freckles) { ctx.fillStyle = alpha('#9c5a3a', .45); [[-5, 3], [-3.4, 4], [4.6, 3.4], [6, 4.2]].forEach(([dx, dy]) => { ctx.beginPath(); ctx.arc(ex + dx, ey + dy, .45, 0, 7); ctx.fill(); }); }
      if (ch.beard) { ctx.fillStyle = alpha(c, .92); ctx.beginPath(); ctx.moveTo(hx - 8.4, hy + 1); ctx.quadraticCurveTo(hx - 7, hy + 12, hx + fo, hy + 12.4); ctx.quadraticCurveTo(hx + 8, hy + 11, hx + 9, hy + 1); ctx.quadraticCurveTo(hx + 6, hy + 7.5, hx + fo, hy + 8.6); ctx.quadraticCurveTo(hx - 5, hy + 8, hx - 8.4, hy + 1); ctx.fill(); ctx.fillStyle = shade(skin, .42); ctx.fillRect(mx - 2.5, my - .6, 5, 1.3); }
      if (ch.mustache) { ctx.fillStyle = ch.mustache; ctx.beginPath(); ctx.ellipse(mx - 1.4, my - 2, 3.2, 1.5, .1, 0, 7); ctx.ellipse(mx + 2.4, my - 2, 2.8, 1.4, -.1, 0, 7); ctx.fill(); }
      if (ch.glasses) { ctx.strokeStyle = ch.glasses; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(ex - 3.6, ey, 3.1, 2.8, 0, 0, 7); ctx.moveTo(ex + 7, ey); ctx.ellipse(ex + 4.3, ey, 2.7, 2.7, 0, 0, 7); ctx.moveTo(ex - .5, ey - .4); ctx.lineTo(ex + 1.6, ey - .4); ctx.moveTo(ex - 6.7, ey - .4); ctx.lineTo(hx - 8.6, ey - 1.4); ctx.stroke(); }
    } else {
      ctx.fillStyle = shade(skin, .85); ctx.beginPath(); ctx.ellipse(hx - 9, hy + 1, 1.8, 2.8, 0, 0, 7); ctx.ellipse(hx + 9, hy + 1, 1.8, 2.8, 0, 0, 7); ctx.fill();
    }
    // front hair
    ctx.fillStyle = c;
    if (st === 'puff') { ctx.beginPath(); ctx.ellipse(hx + (back ? 0 : -1.5), hy - 8, 10.6, 6.5, back ? 0 : -.15, Math.PI, Math.PI * 2.02); ctx.fill(); if (back) { ctx.beginPath(); ctx.ellipse(hx, hy - 2, 10.4, 10, 0, 0, 7); ctx.fill(); } else { [[-8, -5, 4], [-4, -10, 4.5], [3, -11, 4.5], [8, -7, 3.6], [-9.5, 0, 3]].forEach(([x, y, r]) => { ctx.beginPath(); ctx.arc(hx + x, hy + y, r, 0, 7); ctx.fill(); }); } ctx.fillStyle = alpha('#fff', .08); ctx.beginPath(); ctx.arc(hx - 3, hy - 15, 4, 0, 7); ctx.fill(); }
    if (st === 'crop') { ctx.beginPath(); ctx.ellipse(hx + (back ? 0 : -.5), hy - 4, 10.2, 8.4, 0, Math.PI * (back ? .9 : 1.02), Math.PI * (back ? 2.1 : 1.98)); ctx.fill(); if (back) { ctx.beginPath(); ctx.ellipse(hx, hy, 9.8, 10.6, 0, 0, 7); ctx.fill(); } ctx.fillStyle = alpha('#fff', .06); ctx.beginPath(); ctx.arc(hx - 2, hy - 9, 3.5, 0, 7); ctx.fill(); }
    if (st === 'braids') { ctx.beginPath(); ctx.ellipse(hx, hy - 4, 10.2, 8.6, 0, Math.PI * (back ? .9 : 1.05), Math.PI * (back ? 2.1 : 1.95)); ctx.fill(); if (back) { ctx.beginPath(); ctx.ellipse(hx, hy - 1, 9.8, 10.4, 0, 0, 7); ctx.fill(); } ctx.strokeStyle = alpha('#000', .3); ctx.lineWidth = .6; for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(hx + i * 2.4, hy - 11); ctx.lineTo(hx + i * 2.6, hy - (back ? 0 : 7)); ctx.stroke(); } ctx.fillStyle = c; ctx.beginPath(); ctx.arc(hx - 1, hy - 15, 6.5, 0, 7); ctx.fill(); }
    if (st === 'bob') { ctx.beginPath(); ctx.ellipse(hx, hy - 5, 11, 8, 0, Math.PI, Math.PI * 2); ctx.fill(); if (!back) { ctx.beginPath(); ctx.moveTo(hx - 10, hy - 6); ctx.quadraticCurveTo(hx - 2, hy - 2, hx + 9, hy - 5); ctx.lineTo(hx + 10, hy - 9); ctx.lineTo(hx - 10, hy - 9); ctx.fill(); ctx.beginPath(); ctx.moveTo(hx - 11, hy - 6); ctx.quadraticCurveTo(hx - 12.5, hy + 5, hx - 10, hy + 11); ctx.lineTo(hx - 7, hy + 10); ctx.quadraticCurveTo(hx - 9, hy + 2, hx - 8, hy - 4); ctx.fill(); } else { ctx.beginPath(); ctx.ellipse(hx, hy + 1, 11.5, 11.5, 0, 0, 7); ctx.fill(); } ctx.fillStyle = alpha('#fff', .1); ctx.beginPath(); ctx.ellipse(hx - 3, hy - 9, 5, 2, -.2, 0, 7); ctx.fill(); }
    if (st === 'white') { ctx.beginPath(); ctx.ellipse(hx - 8.2, hy - 1.5, 2.2, 4.4, .25, 0, 7); ctx.fill(); ctx.beginPath(); ctx.ellipse(hx + 8.6, hy - 1.5, 1.8, 4, -.25, 0, 7); ctx.fill(); ctx.beginPath(); ctx.ellipse(hx - 2, hy - 10.4, 4.5, 1.4, -.2, 0, 7); ctx.fill(); if (back) { ctx.beginPath(); ctx.ellipse(hx, hy + 1, 9.4, 7, 0, 0, Math.PI); ctx.fill(); } ctx.fillStyle = alpha('#fff', .25); ctx.beginPath(); ctx.ellipse(hx - 1, hy - 8, 5, 2.5, 0, 0, 7); ctx.fill(); }
    if (st === 'grey') { [[-6, -8, 5], [0, -10, 5.5], [6, -8, 5], [-9, -3, 3.5], [9, -3, 3.5]].forEach(([x, y, r]) => { ctx.beginPath(); ctx.arc(hx + x, hy + y, r, 0, 7); ctx.fill(); }); if (back) { ctx.beginPath(); ctx.ellipse(hx, hy - 1, 10, 9.5, 0, 0, 7); ctx.fill(); } }
    if (st === 'short') { ctx.beginPath(); ctx.ellipse(hx, hy - 5, 10, 7, 0, Math.PI * .95, Math.PI * 2.05); ctx.fill(); if (back) { ctx.beginPath(); ctx.ellipse(hx, hy - 1, 9.8, 9.6, 0, 0, 7); ctx.fill(); } }
    if (st === 'bald') { ctx.fillStyle = alpha('#fff', .15); ctx.beginPath(); ctx.ellipse(hx - 2, hy - 8, 4, 2, -.3, 0, 7); ctx.fill(); ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(hx - 8, hy - 1, 2, 4, 0, 0, 7); ctx.fill(); if (back) { ctx.beginPath(); ctx.ellipse(hx, hy + 3, 9, 4, 0, 0, Math.PI); ctx.fill(); } }
    ctx.restore();
  }

  /* ---------- full figure ---------- */
  function draw(ctx, ch, x, y, o) {
    const S = solve(ch, o);
    const flip = o.dir[1] === 'l';
    ctx.save(); ctx.translate(x, y);
    const sc = (ch.h || 1) * (o.scale || 1); ctx.scale(flip ? -sc : sc, sc);
    if (o.alpha !== undefined) ctx.globalAlpha = o.alpha;
    // the far arm sits behind the torso; in back views the near arm is drawn first too
    const hF = drawArm(ctx, ch, S, 'F');
    if (S.back) drawItem(ctx, S.item, S.hN, S);
    if (S.back) drawArm(ctx, ch, S, 'N');
    drawLegs(ctx, ch, S, o);
    drawTorso(ctx, ch, S, o);
    // neck
    ctx.fillStyle = shade(ch.skin, .88); ctx.fillRect(S.neck[0] - 3, S.neck[1] - 6, 6.5, 8);
    let hN = S.hN;
    const headOpts = {back: S.back, expr: o.expr, talking: o.talking, t: o.t, blink: o.blink, lookDown: o.lookDown || S.pose === 'phone' || S.pose === 'write' || o.arm === 'phone' || o.arm === 'write'};
    if (S.back) head(ctx, ch, S.head[0], S.head[1], headOpts);
    if (!S.back) {
      if (S.pose === 'call') head(ctx, ch, S.head[0], S.head[1], headOpts);
      hN = drawArm(ctx, ch, S, 'N');
      drawItem(ctx, S.item, hN, S);
      if (S.pose !== 'call') head(ctx, ch, S.head[0], S.head[1], headOpts);
    }
    ctx.restore();
  }

  /* dialogue portrait: head and shoulders on a small canvas */
  function portrait(cv, ch, o = {}) {
    const ctx = cv.getContext('2d'), dpr = cv.width / (cv.clientWidth || 72);
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height);
    const s = dpr * 2.05; ctx.setTransform(s, 0, 0, s, cv.width / 2 - 3 * dpr, cv.height * .52 + 106 * (ch.h || 1) * s);
    draw(ctx, ch, 0, 0, {dir: 'fr', pose: 'stand', t: o.t || 0, expr: o.expr, talking: o.talking, blink: o.blink});
  }
  return {CAST, draw, head, portrait, solve};
})();
