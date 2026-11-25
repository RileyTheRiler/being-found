/* Epilogue: Outside Again. The next Saturday. Some things have changed; others have not. */
'use strict';
(() => {
  const {register} = BF.story, K = BF.kit;
  register({id: 'outside', number: 6, kicker: 'Epilogue', title: 'Outside Again', when: 'Noor · the next Saturday',
    defaults: {deleReply: 'down', leenaDecision: 'pencil'},
    async run(G) {
      const W = G.W;
      await G.card('Epilogue', 'Outside Again', 'Noor · the next Saturday');
      await G.scene('noorFlat', {light: 'morning', amb: 'flat', music: 'noor', day: 'Saturday', time: [9, 35], player: 'noor',
        actors: {noor: {x: 6.4, y: 3.7, dir: 'bl'}}, state: {window: {open: 1}, easel: {progress: .9}, books: {taken: true}, sign: {gone: true}}});
      W.items.find(i => i.id === 'bed').unmade = false;
      BF.ui.showHud(true);
      await G.fade(0, 1);
      await G.think('A week later. The painting has every window filled except one.');
      await G.explore({until: () => G.is('leftAgain'), acts: {
        easel: () => [{label: G.is('paintedWindow') ? 'Look at the painting' : 'Finish the last window', run: async () => {
          if (G.is('paintedWindow')) { await G.think('Linden Row, early, every window holding something.'); return; }
          const c = await G.choose('Second floor, across the landing from hers. What goes in it?', [
            {id: 'lamp', label: 'A lamp, lit.'}, {id: 'curtain', label: 'Curtains, half open.'}, {id: 'blank', label: 'Leave it blank. It’s his window.'}], {thought: true, name: 'Noor'});
          G.flag('paintedWindow', c);
          if (c !== 'blank') { G.sfx('brush'); await G.anim('noor', 'paint', 3.2); }
          W.st('easel', {window: c, progress: 1});
          const lines = {lamp: 'A small warm square. It’s what she saw from the landing. That much she can paint honestly.', curtain: 'Curtains, a little open. A guess, so she paints it lightly, where it can be painted over.', blank: 'She leaves it. Some things are his to fill in.'};
          await G.think(lines[c]);
        }}],
        window: () => [{label: 'Look outside', run: async () => { await G.think('Mara is already outside Ferro’s, holding two coffees and looking up at the building.'); }}],
        kettle: () => [{label: 'Make tea', run: async () => { G.set('kettle', {boiling: true}); G.sfx('kettle'); await G.anim('noor', 'reach', 3.6); G.set('kettle', {boiling: false}); G.thought('Builder’s tea, in the green mug.'); }}],
        door: () => [{label: 'Head out', run: async () => { G.sfx('keys'); G.sfx('doorOpen'); G.set('door', {open: true}); await G.wait(.4); G.flag('leftAgain'); }}],
      }, hint: 'The painting by the window.', hintAfter: 12});
      await G.fade(1, .9);
      await street(G);
    }});

  async function street(G) {
    const W = G.W;
    const reply = G.is('deleReply') || 'down', deleHere = reply === 'maybe';
    const actors = {noor: {x: 12.8, y: 3.2, dir: 'fl'}, mara: {x: 20.4, y: 4.4, dir: 'fl', item: 'cup'}, sami: {x: 22.8, y: 3.5, dir: 'fl'},
      walt: {x: 33, y: 4.6, dir: 'bl'}, june: {x: 33.6, y: 4.2, dir: 'bl'}};
    if (deleHere) actors.dele = {x: 19.4, y: 4.6, dir: 'br', item: 'cup', expr: 'neutral'};
    const dec = G.is('leenaDecision');
    actors.leena = {x: -1, y: 4.6, dir: 'fr', visible: false, item: (dec === 'pen' || dec === 'pencil') ? 'bag' : 'book'};
    await G.scene('street', {light: 'morning', amb: 'street', music: 'finale', time: [9, 50], player: 'noor', who: 'Noor', actors});
    W.st('street', {f: 0}); W.st('win2C', {curtain: G.is('openedCurtains') ? .7 : .25});
    BF.ui.showHud(true);
    G.sfx('doorClose');
    await G.fade(0, .9);
    G.thought('Linden Row, the same as last week, mostly.');
    // Walt and June pass by on their way to the market
    G.walk('june', 22.4, 4.1); await G.walk('walt', 21.6, 4.7);
    G.face('walt', 'mara'); G.face('june', 'mara'); G.face('mara', 'walt'); G.focus(['mara', 'walt', 'june'], 1.35);
    await G.say('walt', 'Mara!', {expr: 'smile', pose: 'wave'});
    await G.say('june', 'He did it, you know. Sunday. He said it. Then he said it again, because Hal’s wife missed the first one.', {expr: 'smile'});
    await G.say('walt', 'Twice.{1} Badly.{.8} Twice.', {expr: 'smile'});
    await G.say('mara', 'Twice counts double.', {expr: 'smile'});
    G.close(); G.camReset();
    G.walk('june', 2, 4.4); G.walk('walt', 2.6, 4.9).then(() => { const w = G.actor('walt'); if (w) w.visible = false; const j = G.actor('june'); if (j) j.visible = false; }).catch(() => {});
    G.know('walt', 'Gave his toast at Rosie’s birthday. Twice.');
    // Leena, on her way somewhere
    W.actors.leena.visible = true;
    G.walk('leena', 11.4, 4.7).then(() => leenaPass(G, dec)).catch(() => {});
    await G.explore({people: {mara: 'Mara', sami: 'Sami', ...(deleHere ? {dele: 'Dele'} : {})}, until: () => G.is('finaleWalk'), acts: {
      '@mara': () => [{label: 'Go over to Mara', run: async () => { await mara(G, reply, deleHere); }}],
      '@sami': () => [{label: 'Say good morning to Sami', run: async () => {
        G.face('sami', 'noor');
        if (deleHere) await G.say('sami', 'He came in. He bought a knot. He paid for it, which I did not allow, and then I allowed it.', {expr: 'smile'});
        else await G.say('sami', 'Two knots? One is still for Dele, yes. I keep count. The count is very patient.', {expr: 'smile'});
        G.close();
      }}],
      '@dele': () => [{label: 'Say good morning to Dele', run: async () => {
        G.face('dele', 'noor');
        await G.say('dele', 'Morning.', {expr: 'neutral'});
        const c = await G.choose('', [{id: 'good', label: 'Good to see you.'}, {id: 'loop', label: 'Coming on the loop?'}, {id: 'nod', label: '(Nod. Stand with him for a minute.)', quiet: true}]);
        if (c === 'good') await G.say('dele', 'It’s… yeah.{1} I came for the knot. Mostly.', {expr: 'soft'});
        if (c === 'loop') await G.say('dele', 'I’ll do the bench. Not the loop.{1} Not yet.', {expr: 'neutral'});
        if (c === 'nod') { G.close(); await G.wait(2.2); await G.say('dele', 'The F’s still lifting.{1.2} I know.', {expr: 'neutral'}); }
        G.close(); G.know('dele', 'Came down to Ferro’s for a knot the next Saturday. Said he would do the bench, not the loop.');
      }}],
      lettering: () => [{label: 'Look at the lettering', run: async () => { await G.think('Ferro’s, in gold. The F still lifting at one corner.'); }}],
      bakery: () => [{label: 'Look in the window', run: async () => { await G.think('The pyramid of knots, already smaller. The card about licking the glass has a second dog on it now.'); }}],
      busstop: () => [{label: 'Read the timetable', run: async () => { await G.think('The 14 to the library, every twenty minutes. Someone has written “and to the lake” under it in pencil.'); }}],
      bench: () => [{label: 'Sit for a moment', run: async () => { await G.sit('noor', 'bench'); await G.wait(2.5); await G.stand('noor'); }}],
    }, hint: 'Mara is waiting with two coffees.', hintAfter: 18});
    await finale(G);
  }

  async function leenaPass(G, dec) {
    if (!G.actor('leena') || BF.story.locked) { G.walk('leena', 26, 4.6).catch(() => {}); return; }
    const n = G.actor('noor'); if (Math.abs(n.x - 11.4) > 8) { await G.walk('leena', 26, 4.6); return; }
    G.face('leena', 'noor');
    const lines = {pen: 'Off to a lake. The pen held.', pencil: 'Off to a lake! The pencil turned into pen on Thursday.', thursday: 'Thursday-me said next time. She was right. We’re going in the spring.', blank: 'Still empty, the 14th. It’s been a good week, actually.', later: 'I said yes on Sunday night. To spring. Baby steps, lake-sized.'};
    G.thought('Leena: ' + (lines[dec] || lines.blank), {hold: 4});
    await G.walk('leena', 26, 4.6);
    if (dec === 'pen' || dec === 'pencil') { K.bus(G.W, -12, 9); await G.wait(3.4); K.stopBus(G.W, 22); await G.wait(1.5); const l = G.actor('leena'); if (l) l.visible = false; await G.wait(1); K.goBus(G.W, 7); }
  }

  async function mara(G, reply, deleHere) {
    G.face('mara', 'noor'); G.focus(['noor', 'mara'], 1.35);
    await G.say('mara', 'One coffee, oat milk, and one knot I have only slightly eaten.', {expr: 'smile'});
    if (deleHere) {
      await G.say('mara', 'He said maybe. Then he was here at ten past ten. I’m trying very hard not to make it a big deal.', {expr: 'smile'});
      G.face('dele', 'mara'); await G.say('dele', 'She is not trying very hard.', {expr: 'soft'});
      await G.say('mara', 'I’m trying medium hard.', {expr: 'smile'});
    } else {
      const lines = {thanks: 'He texted on Saturday night. “Thanks for sending Noor.” I didn’t send you, I asked. I’m keeping the text anyway.', ok: 'He texted “im ok”. No capitals, no apostrophe. I have read it about forty times.', down: 'He read my message. Two little ticks. That’s the whole update, and I’m taking it.'};
      await G.say('mara', lines[reply] || lines.down, {expr: 'soft'});
      await G.say('mara', 'I’m going to keep asking. Quietly. He’s allowed to keep saying no.', {expr: 'soft'});
    }
    await G.say('mara', 'Did you finish the street?', {expr: 'smile'});
    const p = G.is('paintedWindow');
    const lines = {lamp: 'I painted a lamp in his window. It’s what I saw.', curtain: 'I painted the curtains half open. A guess. I did it lightly.', blank: 'I left his window blank. It’s his.'};
    await G.say('noor', p ? lines[p] : 'Nearly. One window left. I haven’t decided.', {expr: 'soft'});
    await G.say('mara', p === 'blank' || !p ? 'That’s a very you answer. I mean that kindly.' : 'He’d notice that. He notices every sign on this street.', {expr: 'soft'});
    const c = await G.choose('', [{id: 'long', label: 'Long loop?'}, {id: 'short', label: 'Short loop, then more knots?'}]);
    await G.say('mara', c === 'long' ? 'Long loop.' : 'You’re a genius. Short loop.', {expr: 'smile'});
    G.flag('finaleWalk'); G.close(); G.camReset();
  }

  async function finale(G) {
    const W = G.W;
    if (W.actors.dele) G.walk('dele', 30.4, 3.6).then(() => G.sitNow('dele', 'bench')).catch(() => {});
    G.walk('mara', 27.6, 4.8); await G.walk('noor', 26.8, 4.6);
    await G.caption('They take the ' + (G.is('finaleWalk') ? 'loop' : 'long way') + ', and the morning does what mornings do.', {hold: 3.6});
    await G.fade(1, 1.6);
    BF.ui.showHud(false); G.bars(true);
    Object.values(W.actors).forEach(a => a.visible = false);
    W.light = Object.assign({}, BF.lighting.dusk); W.st('street', {f: 0}); W.st('win2B', {lit: false}); W.st('win2C', {lit: false, curtain: G.is('openedCurtains') ? .7 : .3});
    BF.audio.ambience('streetNight'); BF.audio.music('finale');
    G.focus([[10, 1, 7]], 1.15, .3); W.fitCamera(true); W.cam.x = W.cam.tx; W.cam.y = W.cam.ty; W.cam.z = W.cam.tz;
    G.time(18, 40);
    await G.fade(0, 2);
    await G.caption('By evening, Linden Row lights up one window at a time.', {hold: 3.6});
    G.focus([[15.5, 1, 7.2]], 1.3, .25);
    K.lightsUp(G, .6, 7);
    await G.wait(2.4); W.st('win2B', {lit: true}); G.sfx('switch');
    await G.wait(1.6); W.st('win2C', {lit: true});
    await G.caption('Behind each one, a day you have only partly seen.', {hold: 4.2});
    G.note('partial'); G.note('belonging');
    await G.wait(1);
    await G.title('<div class="cred"><h2>Being Found</h2><p><i>Every window holds a life you have only partly seen.</i></p></div>', 5200);
    await G.fade(1, 2); G.bars(false);
    await BF.story.credits();
  }
})();
