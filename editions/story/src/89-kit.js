/* Small shared pieces used by several chapters. */
'use strict';
BF.kit = (() => {
  const K = {};
  const esc = BF.u.esc;
  /* A paper planner page. days: {n: 'on'|'pen'|'pencil'|'mark'} ; animate fills 'on' days one by one. */
  K.planner = (o) => new Promise(res => {
    const p = document.getElementById('phone'); p.classList.add('planner');
    let cells = '';
    for (let i = 0; i < 35; i++) { const n = i - (o.offset || 0) + 1; const ok = n >= 1 && n <= (o.len || 30); const cls = ok && o.days && o.days[n] ? o.days[n] : ''; cells += `<div class="pl-d ${o.animate && cls === 'on' ? '' : cls}" data-n="${ok ? n : ''}" data-c="${cls}">${ok ? n : ''}<i></i></div>`; }
    p.innerHTML = `<div class="ph-body" role="dialog" aria-label="Planner, ${esc(o.title)}"><div class="pl-head">${esc(o.title)}<small>${esc(o.sub || '')}</small></div><div class="pl-grid">${cells}</div>${o.note ? `<p class="pl-note">${esc(o.note)}</p>` : ''}<div class="ph-replies"></div></div>`;
    const rep = p.querySelector('.ph-replies');
    const close = id => { p.classList.remove('show'); setTimeout(() => { p.innerHTML = ''; p.classList.remove('planner'); }, 400); res(id); };
    (o.replies || [{id: null, label: 'Close the planner'}]).forEach((r, i) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'ph-rep'; b.innerHTML = `<span class="num" aria-hidden="true">${i + 1}</span>${esc(r.label)}`; b.onclick = () => close(r.id); rep.appendChild(b); });
    p.classList.add('show');
    if (o.animate) { const on = [...p.querySelectorAll('.pl-d[data-c="on"]')]; on.forEach((c, i) => setTimeout(() => { c.classList.add('on'); if (i % 3 === 0) BF.audio.sfx('write'); }, (BF.settings.reduced() ? 0 : 260) * i + 300)); }
    BF.ui.focusSoon(() => rep.querySelector('button'), rep);
  });
  /* The toast card Walt and Mara write. */
  K.toastCard = (words, ms = 3600) => BF.ui.title(`<div class="card-big">${words.map(w => `<span>${esc(w)}</span>`).join('')}</div>`, ms);
  /* Send the 14 bus along the road */
  K.bus = (W, from = -12, speed = 7) => { const b = W.items.find(i => i.id === 'bus'); if (!b) return; b.hidden = false; b.x = from; b.speed = speed; BF.audio.sfx('bus'); };
  K.stopBus = (W, x) => { const b = W.items.find(i => i.id === 'bus'); if (b) { b.x = x; b.speed = 0; } };
  K.goBus = (W, speed = 7) => { const b = W.items.find(i => i.id === 'bus'); if (b) { b.speed = speed; BF.audio.sfx('bus'); } };
  /* Light windows on the street one at a time */
  K.lightsUp = async (G, to = .55, sec = 6) => { const W = G.W; const s = W.state.street || {f: 0}; const from = s.f ?? 0; const n = 30; for (let i = 1; i <= n; i++) { W.st('street', {f: from + (to - from) * i / n}); await G.wait(sec / n); } };
  return K;
})();
