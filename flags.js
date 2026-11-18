/* Being Found 8.5.2A — centralized guided-route mechanic policy.
   The mode changes when the classroom route begins; getters must stay dynamic.
   These flags are infrastructure only until call sites use them in 8.5.2B. */
(() => {
  'use strict';
  if (window.BFFlags) return;
  const params = new URLSearchParams(location.search);
  const pilot = params.get('pilot') === '1';
  const local = ['localhost', '127.0.0.1', '::1'].includes(location.hostname);
  const guided = () => pilot || !!document.body?.classList.contains('cl-route');
  const enabled = (name, fallback) => {
    // Never permit developer query parameters to modify a pilot run.
    const override = local && !pilot ? params.get('bf_' + name) : null;
    return override === '0' ? false : override === '1' ? true : fallback();
  };
  window.BFFlags = Object.freeze({
    get pilot() { return pilot; },
    get guided() { return guided(); },
    get dice() { return enabled('dice', () => !guided()); },
    get heavyHold() { return enabled('heavyHold', () => !guided()); },
    get moodSpeed() { return enabled('moodSpeed', () => !guided()); },
    get worldSwap() { return enabled('worldSwap', () => !guided()); },
    get sealedLegacy() { return enabled('sealedLegacy', () => !guided()); }
  });
})();
