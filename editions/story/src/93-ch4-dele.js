/* Chapter Four: The Same Door. Dele's evening, an authored perspective. Noor never sees it, and nothing here was earned by choices. */
'use strict';
(() => {
  const {register} = BF.story;
  register({id: 'dele', number: 4, kicker: 'Chapter Four', title: 'The Same Door', when: 'Dele · Saturday night',
    content: 'Dele is in a low period. He is safe. Nothing frightening happens; the chapter is quiet.',
    defaults: {deleOutcome: 'visit'},
    async run(G) {
      const W = G.W, out = G.is('deleOutcome') || 'home';
      await G.card('Chapter Four', 'The Same Door', 'Dele · later that Saturday', {note: 'This chapter is told from Dele’s side. Noor will never see it. It is one authored story, not a picture of how depression feels for everyone.', content: 'Dele is in a low period. He is safe, and nothing frightening happens. The chapter is quiet, and you can skip it.', chapter: 'dele', go: 'Begin'});
      await G.scene('deleFlat', {light: 'night', amb: 'deleRain', music: 'dele', day: 'Saturday', time: [21, 40], player: 'dele', who: 'Dele',
        actors: {dele: {x: 2.6, y: 4.4, dir: 'fl', lie: 'sofa', expr: 'tired'}},
        state: {curtains: {open: .12}, winlamp: {on: true}, leftCup: {here: !!G.is('madeTea'), warm: false}, pastryBag: {here: !!G.is('gaveKnot') && out === 'visit'}, note: {floor: out === 'note'}, dphone: {taken: false}}});
      BF.ui.showHud(true);
      await G.fade(0, 1.4);
      await G.wait(1.5);
      await G.think('The rain started at six. I watched it start.', {name: 'Dele'});
      G.standNow('dele'); const d = G.actor('dele'); d.x = 2.6; d.y = 4.4; G.sitNow('dele', 'sofa'); G.sfx('rustle');
      await G.wait(1);
      await G.think('The lamp has been on since Thursday. Turning it off would mean deciding it’s night.', {name: 'Dele'});
      G.close(); await G.stand('dele');
      const T = (t) => G.think(t, {name: 'Dele'});
      let doorLooks = 0;
      await G.explore({until: () => G.is('deleEnd'), acts: {
        door: () => [
          {label: 'Check the hallway', run: async () => { await G.anim('dele', 'reach', .8); await T('Through the peephole: the landing light on its timer. Noor’s door, with a strip of light under it. She has the radio on.'); doorLooks++; }},
          {label: 'Stand by the door', run: async () => {
            G.pose('dele', 'stand'); BF.audio.music('hush'); await G.wait(2.6);
            await T('Outside is still out there. Ferro’s, the long loop, the 14 to anywhere. I could list all of it.');
            await T('The list doesn’t pull at anything.');
            BF.audio.music('dele'); doorLooks++; G.note('sameDoor');
          }},
          {label: 'Open the door', when: () => !G.is('openedDoor'), run: async () => {
            G.flag('openedDoor'); G.sfx('doorOpen'); G.set('door', {open: true});
            await G.wait(1.2);
            if (G.is('bagOnMat') && !G.is('foundBag')) { G.flag('foundBag'); await T('Sami’s paper bag, on the mat. A cinnamon knot inside, and the smell of the bakery coming up the stairs with it.'); await G.anim('dele', 'reachLow', 1); G.set('pastryBag', {here: true}); }
            await T('The landing smells like someone’s dinner. I stand here until the timer clicks the light off.');
            G.sfx('switch'); await G.wait(1.4);
            G.sfx('doorClose'); G.set('door', {open: false});
          }},
          {label: 'Look at the keys', spot: [1.0, 6.4], run: async () => { G.sfx('keys'); await T('Bike lock. Mara’s spare. The key to Ferro’s from the summer I did the window. I should give that back. I have thought that every week since August.'); }},
        ],
        phone: () => [{label: 'Look at your phone', run: async () => { await phone(G, out); }}],
        case: () => [
          {label: 'Open the case', when: () => !G.get('case').open, run: async () => {
            G.sfx('keys'); await G.anim('dele', 'reachLow', 1); G.set('case', {open: true});
            await T('Size, brushes, a book of gold leaf. My hand knows the weight of the mahl stick before I pick it up.');
            await T('I could pull a clean line right now. I know exactly how.');
            await T('What I can’t find is the reason to.');
            G.note('possibilities');
          }},
          {label: 'Close it', when: () => G.get('case').open, run: async () => { await G.anim('dele', 'reachLow', .7); G.set('case', {open: false}); G.sfx('doorClose'); }},
        ],
        board: () => [{label: 'Look at the practice board', run: async () => { await T('FERRO’S. I painted the S three times before it sat right. On the real window the F is lifting. Sami hasn’t said anything. He wouldn’t.'); }}],
        kettle: () => [{label: 'Make tea', run: async () => {
          G.set('kettle', {boiling: true}); G.sfx('kettle'); await G.anim('dele', 'reach', 3.6); G.set('kettle', {boiling: false}); G.sfx('pour'); await G.anim('dele', 'pour', 1.2);
          G.actor('dele').item = 'cup'; G.addTime(8); await T('Tea, then. Something warm to hold.');
        }}],
        mugs: () => [{label: G.is('washed') ? 'Look at the mugs' : 'Wash the mugs', run: async () => {
          if (G.is('washed')) { await T('Clean already. Noor did them. I said “you don’t have to”. I meant thank you.'); return; }
          G.sfx('water'); await G.anim('dele', 'cook', 3); G.sfx('clink'); G.addTime(4);
          await T('All three. It takes four minutes. The flat is the same flat afterwards.');
        }}],
        table: () => [
          {label: 'Drink the tea Noor left', when: () => G.get('leftCup').here && !G.get('leftCup').drunk, run: async () => { await G.anim('dele', 'drink', 2, {item: 'cup'}); G.set('leftCup', {drunk: true}); await T('Cold. I drink it anyway.'); }},
          {label: 'Eat the cinnamon knot', when: () => G.get('pastryBag').here && !G.is('ateKnot'), run: async () => { await G.anim('dele', 'drink', 2.4, {item: 'pastry'}); G.flag('ateKnot'); await T('Sami’s. I eat it standing up, as if I have somewhere to be.'); }},
          {label: 'Read the note', when: () => G.get('note').table, run: async () => { await showNote(G); }},
        ],
        mail: () => [
          {label: 'Pick up the note', when: () => G.get('note').floor, run: async () => { await G.anim('dele', 'reachLow', .9); G.set('note', {floor: false, table: true}); await showNote(G); }},
          {label: 'Look at the post', when: () => !G.get('note').floor, run: async () => { await T('The envelopes with windows. They can wait one more day. They’ve been waiting one more day for a while.'); }},
        ],
        curtains: () => [
          {label: 'Look through the gap', run: async () => { await T('Rain on Linden Row. Ferro’s is dark. The launderette lights are still on; someone is waiting on a dryer.'); }},
          {label: 'Open the curtains', when: () => (G.get('curtains').open ?? .12) < .5, run: async () => {
            G.sfx('rustle'); await G.anim('dele', 'reachHigh', .4); for (let i = 0; i < 10; i++) { G.set('curtains', {open: .12 + .6 * i / 9}); await G.wait(.05); }
            G.flag('openedCurtains');
            await T('The street, wet and orange under the lamps. All of it a little far off, like a photo of a place I’ve been.');
          }},
        ],
        sofa: () => [{label: 'Sit down', run: async () => { await G.sit('dele', 'sofa'); await G.wait(2.5); await G.stand('dele'); }},
          {label: 'Lie down for the night', when: () => G.is('readPhone'), run: async () => { G.flag('lampChoice', 'on'); G.flag('deleEnd'); G.lie('dele', 'sofa'); await G.wait(2); }}],
        photo: () => [{label: 'Look at the photo', run: async () => { await T('Last spring, outside Ferro’s. Noor said something and I laughed. I can’t remember what she said. I remember laughing.'); }}],
        shelf: () => [{label: G.is('radio') ? 'Turn the radio off' : 'Turn the radio on', run: async () => {
          G.sfx('switch'); G.flag('radio', !G.is('radio'));
          if (G.is('radio')) { BF.audio.music('record'); BF.audio.addAmb('crackle'); await T('Someone else’s Saturday, at low volume.'); } else { BF.audio.music('dele'); BF.audio.ambience('deleRain'); }
        }}],
        lettering: () => [{label: 'Look at the framed lettering', run: async () => { await T('The test piece for the bakery. I was proud of that. I remember being proud of it, which is a different thing.'); }}],
        lamp: () => [
          {label: 'Turn off the lamp', when: () => G.is('readPhone'), run: async () => { G.sfx('switch'); G.set('winlamp', {on: false}); G.flag('lampChoice', 'off'); await G.wait(1.2); await T('Night, then.'); G.flag('deleEnd'); }},
          {label: 'Leave it on', when: () => G.is('readPhone'), run: async () => { G.flag('lampChoice', 'on'); await T('Not yet.'); G.flag('deleEnd'); }},
          {label: 'Look at the lamp', when: () => !G.is('readPhone'), run: async () => { await T('Mara bought it for the flat-warming. It has been the brightest thing in here for three days.'); }},
        ],
      }, hint: 'The phone has been buzzing face down on the table.', hintAfter: 40});
      await G.fade(1, 1.6);
      // the street outside, in the rain
      await G.scene('street', {light: 'rainy', amb: 'streetNight', ambExtra: ['rain'], music: 'dele', time: [23, 52], who: 'Linden Row'});
      BF.ui.showHud(false); G.bars(true);
      W.st('street', {f: .3}); W.st('bakery', {lit: false}); W.st('win2B', {lit: false});
      W.st('win2C', {lit: G.is('lampChoice') !== 'off', curtain: G.is('openedCurtains') ? .7 : .2});
      G.focus([[16.3, 1, 7.6]], 1.7, .4); W.fitCamera(true); W.cam.x = W.cam.tx; W.cam.y = W.cam.ty; W.cam.z = W.cam.tz;
      await G.fade(0, 2);
      await G.caption(G.is('lampChoice') === 'off' ? 'Eleven fifty-two. For the first time in three nights, the second floor is dark.' : 'Eleven fifty-two. One window on the second floor is still lit.', {hold: 4.6});
      G.note('hope'); G.note('others');
      await G.fade(1, 1.6); G.bars(false);
    }});

  async function showNote(G) {
    const t = {knot: 'Brought you a knot from Sami’s. No need to reply. N.', walk: 'Walk next Saturday? Or not. Either is fine. N.', here: 'I’m across the landing. N.'}[G.is('noteText')] || 'I’m across the landing. N.';
    await G.narrate('“' + t + '”', {name: 'Noor’s note'});
    const c = await G.choose('', [{id: 'fridge', label: 'Put it on the fridge'}, {id: 'table', label: 'Leave it on the table'}], {name: 'Dele'});
    if (c === 'fridge') { await G.walkObj('dele', 'fridge'); await G.anim('dele', 'reach', .8); G.set('note', {table: false}); G.flag('noteOnFridge'); await G.think('Next to the photo.', {name: 'Dele'}); }
  }

  async function phone(G, out) {
    G.set('dphone', {taken: true}); await G.anim('dele', 'reachLow', .6); G.pose('dele', 'phone');
    const today = {visit: 'Noor said she came over. No pressure about anything. Love you.', declined: 'Noor said she knocked. Good for you for saying not today. I mean that. Love you.', note: 'Noor said she left you something. No pressure. Love you.', home: 'Thinking about you. No pressure about anything. Love you.'}[out];
    const r = await G.phone({owner: 'Dele', contact: 'Mara', messages: [
      {time: 'Thu 6:02 p.m.', text: 'Walk Saturday? Ferro’s at 10.'}, {me: true, text: 'not this week'},
      {time: 'Sat 9:58 a.m.', text: 'At Ferro’s. There is a knot with your name on it. Sami wrote your name on it. In icing.'},
      {time: 'Sat 1:12 p.m.', text: today},
      {time: 'Sat 9:03 p.m.', text: 'Same time next week. Or not. The knot offer stands indefinitely.'}],
      replies: [{id: 'maybe', label: 'Next Saturday, maybe.', text: 'next saturday maybe'}, {id: 'thanks', label: 'Thanks for sending Noor.', text: 'thanks for sending noor', when: out !== 'home'}, {id: 'ok', label: 'I’m okay.', text: 'im ok'}, {id: 'down', label: '(Put the phone face down.)', quiet: true}].filter(x => x.when !== false)});
    G.pose('dele', 'stand'); G.set('dphone', {taken: false});
    G.flag('deleReply', r || 'down'); G.flag('readPhone');
    const T = (t) => G.think(t, {name: 'Dele'});
    if (r === 'down') await T('She’ll see it’s been read. That will have to be enough tonight.');
    else if (r === 'maybe') await T('Maybe. It looks bigger written down than it felt.');
    else await T('Sent. Three dots appear, then a heart, then nothing. She is good at nothing. She learned it on purpose.');
    G.note('others');
  }
})();
