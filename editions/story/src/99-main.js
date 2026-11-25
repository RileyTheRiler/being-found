/* Boot and the frame loop. */
'use strict';
(() => {
  const cv = document.getElementById('stage');
  BF.world.init(cv); BF.ui.init(); BF.story.bindInput(cv);
  document.getElementById('btnPause').onclick = () => BF.story.openPause();
  document.getElementById('btnNotebook').onclick = () => BF.story.openNotebook();
  document.getElementById('btnLook').onclick = () => { BF.world.reveal = 3.5; };
  document.getElementById('dlgNext').onclick = e => { e.stopPropagation(); BF.ui.takeKey(); };
  let last = performance.now();
  function loop(t) {
    const dt = Math.min(.05, (t - last) / 1000); last = t;
    const sc = BF.time.scale || 1;
    BF.time.tick(dt * sc);
    const d = BF.time.paused ? 0 : dt * sc;
    try { BF.world.render(d); BF.story.frame(d); BF.ui.frame(t / 1000); } catch (e) { console.error(e); }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
  addEventListener('resize', () => BF.ui.reserve());
  document.addEventListener('visibilitychange', () => { if (document.hidden && BF.story.exploring !== undefined && BF.state.chapter && !BF.ui.screen) BF.story.openPause(); });
  const q = new URLSearchParams(location.search);
  if (q.get('fast')) BF.time.scale = +q.get('fast');
  addEventListener('unhandledrejection', e => { if (e.reason && e.reason.abort) e.preventDefault(); });
  if (q.get('chapter')) { BF.audio.init(); const nb = BF.state.notebook; BF.story.startChapter(q.get('chapter'), true); }
  else BF.story.titleScreen();
  window.BFdebug = {W: BF.world, S: BF.story, st: BF.state, G: BF.story.G};
})();
