/* Prologue: One Window Is Still Lit. Chapter One: An Ordinary Morning (Noor). */
'use strict';
(() => {
  const {register} = BF.story, K = BF.kit;

  register({id: 'prologue', number: 0, kicker: 'Prologue', title: 'One Window Is Still Lit', when: 'Saturday, before six',
    async run(G) {
      const W = G.W;
      await G.scene('street', {light: 'dawn', amb: 'prologue', music: 'prologue', day: 'Saturday', time: [5, 52], who: 'Linden Row',
        actors: {sami: {x: 3, y: 4.7, dir: 'fr', visible: false}}});
      BF.ui.showHud(false); G.bars(true);
      W.st('street', {f: 0}); W.st('win2C', {lit: true}); W.st('win2B', {lit: false}); W.st('bakery', {lit: false}); W.st('laundry', {lit: false});
      G.focus([[9, 1, 8]], 1.25, .5); W.fitCamera(true); W.cam.x = W.cam.tx; W.cam.y = W.cam.ty; W.cam.z = W.cam.tz;
      await G.fade(0, 2);
      await G.caption('Linden Row. Saturday, a little before six.', {place: true, hold: 3.6});
      G.focus([[16.3, 1, 7.6]], 1.6, .35);
      await G.caption('Most of the street is still asleep.', {hold: 3.4});
      await G.caption('One window on the second floor has been lit all night.', {hold: 4.2});
      G.focus([[14, 4, 3]], 1.15, .45);
      K.bus(W, -14, 7); await G.wait(2.5);
      W.actors.sami.visible = true; G.walk('sami', 22.6, 3.5);
      await G.caption('The first bus goes by with nobody on it.', {hold: 3.4});
      G.focus([[21, 2, 3]], 1.35, .5); await G.wait(1.6);
      W.st('bakery', {lit: true}); G.sfx('switch');
      await G.caption('At ten past six, the bakery light comes on.', {hold: 3.4});
      K.lightsUp(G, .3, 5);
      G.focus([[14.4, 1, 7.6]], 1.7, .5); await G.wait(2.2);
      W.st('win2B', {lit: true}); G.sfx('switch');
      await G.caption('At half past, another.', {hold: 3.2});
      G.note('background');
      await G.fade(1, 1.6);
      G.bars(false);
    }});

  register({id: 'noor', number: 1, kicker: 'Chapter One', title: 'An Ordinary Morning', when: 'Noor · Saturday morning',
    async run(G, from) {
      const W = G.W, st = BF.state;
      if (!from) {
        await G.card('Chapter One', 'An Ordinary Morning', 'Noor · Saturday');
        await flat(G);
        G.checkpoint('hall');
      }
      if (from !== 'street') { await hall(G); G.checkpoint('street'); }
      await street(G);
    }});

  /* ---------- Noor's flat ---------- */
  async function flat(G) {
    const W = G.W;
    await G.scene('noorFlat', {light: 'morning', amb: 'flat', music: 'noor', day: 'Saturday', time: [8, 40], player: 'noor',
      actors: {noor: {x: 8.75, y: 2.6, dir: 'fr', lie: 'bed'}}, state: {window: {open: .45}}});
    BF.ui.showHud(true);
    await G.fade(0, 1.4);
    G.sfx('buzz'); await G.wait(1.4); G.sfx('buzz'); await G.wait(1.2);
    G.sfx('rustle'); G.standNow('noor'); const n = G.actor('noor'); n.x = 8.75; n.y = 2.6; G.sitNow('noor', 'bedEdge');
    G.expr('noor', 'tired'); await G.wait(1.2); G.expr('noor', 'neutral');
    await G.think('Saturday. The light has already found the canvas.');
    await G.stand('noor');
    const painted = () => G.get('easel').progress ?? .35;
    W.st('easel', {progress: .35});
    let paints = 0, hinted = false;
    const acts = {
      window: () => [
        {label: 'Look outside', run: async () => {
          await G.think('Down on the street, Sami is chalking the board outside Ferro’s. Someone’s dog is very interested in a bin.');
          await G.think('The plane trees have started turning at the edges.');
          G.flag('noorLookedOut');
        }},
        {label: 'Open the curtains', when: () => (G.get('window').open ?? .45) < .9, run: async () => {
          G.pose('noor', 'reachHigh'); G.sfx('rustle'); for (let i = 0; i < 12; i++) { W.st('window', {open: .45 + .55 * i / 11}); await G.wait(.04); }
          G.pose('noor', 'stand'); G.thought('Better.');
        }},
      ],
      easel: () => [
        {label: paints ? 'Keep painting' : 'Paint for a while', run: async () => {
          G.sfx('brush'); await G.anim('noor', 'paint', 3.6);
          paints++; W.st('easel', {progress: Math.min(.9, painted() + .2)}); G.addTime(20);
          const lines = ['The bakery awning wants more red. She gives it more red.', 'The plane tree, finally right. She steps back to check, and it stays right.', 'She could do this all day. Some Saturdays she has.'];
          await G.think(lines[Math.min(paints - 1, 2)]);
          if (paints === 1) { G.know('noor', 'Is painting the whole street, window by window.'); G.note('possibilities'); }
        }},
        {label: 'Look at the empty window', run: async () => {
          await G.think('Every window on the canvas has a life in it. A cat. A man reading. A row of basil.');
          await G.think('One is still blank: second floor, across the landing from hers. She hasn’t decided what goes there.');
          G.flag('sawBlank');
        }},
      ],
      kettle: () => [{label: G.get('tea').made ? 'Make another cup' : 'Make tea', run: async () => { await makeTea(G); }}],
      stove: () => [{label: 'Make eggs and toast', when: () => !G.get('breakfast').made, run: async () => {
        G.set('pan', {cooking: true}); G.sfx('sizzle'); await G.anim('noor', 'cook', 3.2);
        G.set('pan', {cooking: false, food: true}); await G.anim('noor', 'reach', .8);
        G.set('pan', {food: false}); G.set('breakfast', {made: true}); G.addTime(12);
        G.thought('Two eggs, slightly too brown. Exactly how she likes them.');
      }}],
      table: () => [
        {label: 'Sit and eat', when: () => G.get('breakfast').made && !G.get('breakfast').eaten, walk: false, run: async () => {
          await G.sit('noor', 'table'); await G.anim('noor', 'drink', 2.2, {item: 'pastry'}); G.set('breakfast', {eaten: true}); G.flag('ate'); G.addTime(15);
          await G.think('She eats looking out of the window, thinking about the colour of rye bread.'); await G.stand('noor');
        }},
        {label: 'Drink your tea', when: () => G.get('tea').made && !G.get('tea').drunk, walk: false, run: async () => {
          await G.sit('noor', 'table'); G.sfx('clink'); await G.anim('noor', 'drink', 2.4, {item: 'cup'}); G.set('tea', {drunk: true}); G.addTime(10);
          await G.think('Too hot, then just right, then gone.'); await G.stand('noor');
        }},
        {label: 'Take the library books', when: () => !G.get('books').taken, run: async () => {
          await G.anim('noor', 'reachLow', .9); G.set('books', {taken: true}); G.flag('hasBooks');
          G.thought('Two library books, one week overdue. Leena will pretend not to notice.');
        }},
      ],
      phone: () => [{label: 'Read your messages', run: async () => {
        await G.anim('noor', 'reachLow', .6); G.set('phone', {taken: true}); G.pose('noor', 'phone');
        const r = await G.phone({owner: 'Noor', contact: 'Mara', messages: [
          {time: 'Fri 10:14 p.m.', text: 'Bakery at ten? Then the long loop.'},
          {text: 'I’ll text Dele too. Third time lucky.'},
          {time: '8:31 a.m.', text: 'Morning! Still on? I can already smell the knots from here. I live two miles away.'}],
          replies: [{id: 'ten', label: 'See you at ten.', text: 'See you at ten.'}, {id: 'knots', label: 'Save me a knot.', text: 'Save me a knot. Or two.'}, {id: 'late', label: 'Make it half ten?', text: 'Half ten? Slow morning.'}]});
        G.flag('maraReply', r);
        G.sfx('ping'); await G.wait(.6);
        const r2 = await G.phone({owner: 'Noor', contact: 'Leena (Library)', messages: [
          {time: '8:52 a.m.', text: 'Morning Noor! Is the reading-corner sign dry yet? We could hang it this afternoon if you’re passing. No rush at all.'}],
          replies: [{id: 'yes', label: 'Bringing it this afternoon.', text: 'Dry since Thursday. I’ll bring it after lunch!'}, {id: 'maybe', label: 'Not sure I’ll make it today.', text: 'Might be Monday. Saturday is filling up.'}]});
        G.flag('leenaReply1', r2); G.pose('noor', 'stand'); G.set('phone', {taken: false});
        G.know('mara', 'Walks the long loop with Noor on Saturday mornings. Has been texting Dele.');
        G.know('leena', 'Runs the community library. Asked Noor to paint a sign for the reading corner.');
      }}],
      plants: () => [{label: 'Water the plant', run: async () => { G.sfx('water'); await G.anim('noor', 'water', 2); G.thought('A new leaf, still rolled up. Or she has only just noticed it.'); }}],
      record: () => [
        {label: 'Put on a record', when: () => !G.get('record').on, run: async () => {
          await G.anim('noor', 'reachLow', .8); G.sfx('record'); G.set('record', {on: true}); BF.audio.music('record'); BF.audio.addAmb('crackle');
          await G.think('Her dad’s copy. The B-side skips, so she has never turned it over.');
        }},
        {label: 'Turn it off', when: () => G.get('record').on, run: async () => { await G.anim('noor', 'reachLow', .6); G.set('record', {on: false}); BF.audio.music('noor'); BF.audio.ambience('flat'); }},
      ],
      fridge: () => [{label: 'Look at the photo', run: async () => {
        await G.think('Noor, Mara and Dele outside Ferro’s, last spring. Dele is laughing at something out of frame.');
        await G.think('She can’t remember what it was. She remembers that it was very funny.');
        G.know('dele', 'Lives across the landing from Noor. Laughing outside Ferro’s in a photo from last spring.');
      }}],
      books: () => [{label: 'Browse the shelf', run: async () => { await G.think('Half of these are borrowed. A few from the library, most from Mara, who never asks for them back.'); }}],
      sign: () => [
        {label: 'Check the sign', run: async () => { await G.anim('noor', 'reachLow', .8); await G.think('READING CORNER, yellow on blue, under brown paper. Dry since Thursday.'); }},
        {label: 'Take it with you', when: () => !G.get('sign').gone, run: async () => { await G.anim('noor', 'reachLow', .8); G.set('sign', {gone: true}); G.flag('hasSign'); G.thought('She’ll drop it at the library after the walk.'); }},
      ],
      bed: () => [
        {label: 'Make the bed', when: () => W.items.find(i => i.id === 'bed').unmade, run: async () => { G.sfx('rustle'); await G.anim('noor', 'reachLow', 1.4); W.items.find(i => i.id === 'bed').unmade = false; G.thought('There.'); }},
        {label: 'Sit on the edge', walk: false, run: async () => { await G.sit('noor', 'bedEdge'); await G.wait(2.5); await G.stand('noor'); }},
      ],
      armchair: () => [{label: 'Sit for a minute', walk: false, run: async () => {
        await G.sit('noor', 'armchair'); await G.wait(1.5);
        await G.think('From here she can see the whole flat. It isn’t much. All of it is hers.'); G.addTime(5); await G.stand('noor');
      }}],
      door: () => [{label: 'Head out', run: async () => {
        if (!G.get('sign').gone && !G.is('signChecked')) { G.flag('signChecked'); const c = await G.choose('The sign is still leaning by the bookshelf.', [{id: 'take', label: 'Take the sign'}, {id: 'leave', label: 'Leave it for now'}], {thought: true, name: 'Noor'}); if (c === 'take') { await G.walkObj('noor', 'sign'); await G.anim('noor', 'reachLow', .8); G.set('sign', {gone: true}); G.flag('hasSign'); await G.walkObj('noor', 'door'); } }
        G.sfx('keys'); await G.wait(.5); G.sfx('doorOpen'); G.set('door', {open: true}); await G.wait(.4); G.flag('leaveFlat');
      }}],
    };
    await G.explore({acts, until: () => G.is('leaveFlat'), hint: 'Mara said ten. There is time.', hintAfter: 30});
    await G.fade(1, .8); G.sfx('doorClose');
    if (G.W.clockMin < 9 * 60 + 45) G.time(9, 45);
  }
  async function makeTea(G) {
    G.sfx('switch'); await G.anim('noor', 'reach', .6);
    G.set('kettle', {boiling: true}); G.sfx('kettle'); await G.wait(3.8); G.set('kettle', {boiling: false});
    G.sfx('pour'); await G.anim('noor', 'pour', 1.5);
    G.set('tea', {made: true, drunk: false}); G.sfx('clink'); G.addTime(6);
    if (!G.is('teaOnce')) { G.flag('teaOnce'); G.thought('Builder’s tea, in the green mug. It goes on the table.'); }
  }

  /* ---------- the landing ---------- */
  async function hall(G) {
    await G.scene('hallway', {light: 'day', amb: 'hallway', music: 'noor', player: 'noor', actors: {noor: {x: 2.1, y: 1.4, dir: 'fl'}}, state: {door2B: {open: false}}});
    if (G.W.clockMin < 9 * 60 + 45) G.time(9, 45); else G.time();
    G.set('hallBag', {here: false});
    await G.fade(0, .8);
    G.thought('The landing smells of radiator dust and someone’s toast.');
    await G.explore({until: () => G.is('downstairs'), acts: {
      door2C: () => [{label: 'Listen', run: async () => {
        await G.anim('noor', 'stand', 1.4);
        await G.think('A radio, very low. Or a television. A strip of light under the door.');
        await G.think('Dele’s lamp. It was on when she came home last night, too.');
        G.flag('listened'); G.know('dele', 'His lamp was on late into the night, and on again in the morning.');
      }}],
      bike: () => [{label: 'Look at the bike', run: async () => { await G.think('Dele’s bike. The back tyre has been flat since August. The pump is clipped to the frame.'); G.know('dele', 'His bike has had a flat tyre since August.'); }}],
      board: () => [{label: 'Read the noticeboard', run: async () => {
        await G.think('Bins on Tuesday. Someone has lost a blue scarf. A guitar teacher has a very confident font.');
        await G.think('A photocopied flyer: Aphasia conversation group. Thursdays at two, Linden Library. Coffee. No tests.');
      }}],
      stairs: () => [{label: 'Go downstairs', run: async () => { G.flag('downstairs'); }}],
    }, hint: 'Mara will already be at Ferro’s.', hintAfter: 25});
    await G.walk('noor', 12.2, 2.7); await G.fade(1, .7);
  }

  /* ---------- Linden Row, morning ---------- */
  async function street(G) {
    const W = G.W;
    await G.scene('street', {light: 'morning', amb: 'street', music: 'noor', player: 'noor', who: 'Noor',
      actors: {noor: {x: 12.8, y: 3.2, dir: 'fl'}, mara: {x: 20.6, y: 4.4, dir: 'fl', item: null}, sami: {x: 22.8, y: 3.5, dir: 'fl'}}});
    W.st('street', {f: 0}); BF.ui.showHud(true);
    if (W.clockMin < 9 * 60 + 55) G.time(9, 55); else G.time();
    G.sfx('doorClose');
    await G.fade(0, .8);
    G.thought('Linden Row, all of it awake now.');
    const talkedSami = () => G.is('samiTalked');
    await G.explore({people: {mara: 'Mara', sami: 'Sami'}, until: () => G.is('maraDone'), acts: {
      '@sami': () => [{label: 'Say good morning to Sami', run: async () => {
        G.face('sami', 'noor');
        await G.say('sami', 'Noor. Good morning. Mara already paid for your knot. She says next week is your turn, and she says it like a threat.', {expr: 'smile'});
        if (!G.is('ate')) await G.say('sami', 'You also have the face of someone who skipped breakfast. Take two.', {expr: 'smile'});
        const c = await G.choose('', [{id: 'two', label: 'Ask for two, one for later'}, {id: 'one', label: 'Just the one, thanks'}], {speaker: null});
        if (c === 'two') { await G.say('sami', 'Two. One is for Dele, yes? He hasn’t been in. Tell him I am keeping count.'); G.flag('twoKnots'); G.know('dele', 'Usually comes into Ferro’s. Sami has noticed he hasn’t.'); }
        else await G.say('sami', 'One. Very disciplined.');
        G.flag('samiTalked'); G.flag('pastry'); G.actor('noor').item = 'bag';
      }}],
      bakery: () => [{label: 'Look in the window', run: async () => { await G.think('Rye, sourdough, a pyramid of cinnamon knots. Sami has written PLEASE DO NOT LICK THE GLASS on a card, and someone has drawn a dog beside it.'); }}],
      lettering: () => [{label: 'Look at the lettering', run: async () => {
        await G.think('Gold leaf, hand-lettered: Ferro’s. Dele did it three summers ago. People still come in to ask who.');
        await G.think('The F has started to lift at one corner.');
        G.flag('sawLettering'); G.know('dele', 'Hand-lettered the gold sign on Ferro’s window three summers ago. The F has started to lift.');
      }}],
      aboard: () => [{label: 'Read the chalkboard', run: async () => { await G.think('TODAY: cinnamon knots, rye, the good sourdough. Underneath, smaller: the oven says hello.'); }}],
      busstop: () => [{label: 'Read the timetable', run: async () => { await G.think('The 14 to the library, every twenty minutes. A poster: Story hour, Saturdays at eleven.'); }}],
      bench: () => [{label: 'Sit for a moment', walk: true, run: async () => { await G.sit('noor', 'bench'); await G.wait(3); await G.stand('noor'); }}],
      tree: () => [{label: 'Look up', run: async () => { await G.think('The big plane tree by the park. A pigeon is having a very important conversation with another pigeon.'); }}],
      bike: () => [{label: 'Look at the bikes', run: async () => { await G.think('Somebody’s blue bike, locked to the rack by both wheels. An optimist.'); }}],
      '@mara': () => [{label: 'Go over to Mara', run: async () => { await maraTalk(G); }}],
    }, hint: 'Mara is waiting outside Ferro’s.', hintAfter: 20});
  }

  async function maraTalk(G) {
    const W = G.W;
    G.face('mara', 'noor'); G.focus(['noor', 'mara'], 1.35);
    await G.say('mara', G.is('maraReply') === 'late' ? 'You said half ten and arrived at ten. This is personal growth.' : 'There you are. I got here early to stare at the knots.', {expr: 'smile'});
    let c = await G.choose('', [{id: 'word', label: 'Morning. Any word from Dele?'}, {id: 'ate', label: 'Did you already eat yours?'}, {id: 'loop', label: 'Long loop today?'}]);
    if (c === 'ate') { await G.say('mara', 'I ate one. This is my second. Don’t tell my dentist.', {expr: 'smile'}); }
    if (c === 'loop') { await G.say('mara', 'Long loop. Just the two of us, again.', {expr: 'soft'}); }
    await G.say('mara', 'Dele says he’s tired. That’s the whole message. Third Saturday in a row.', {expr: 'concern'});
    await G.say('mara', 'I keep wanting to go over and drag him out by the hood of that yellow jumper. I know that’s about the worst idea I have.', {expr: 'concern'});
    G.know('dele', 'Has skipped the Saturday walk three weeks running. Tells Mara he’s tired.');
    c = await G.choose('', [{id: 'what', label: 'What do you think is going on?'}, {id: 'quiet', label: 'Maybe he needs a quiet stretch.'}, {id: 'knock', label: 'I could knock on his door later.'}, {id: 'napkin', label: '(Say nothing. Hand her a napkin.)', quiet: true}]);
    if (c === 'what') { await G.say('mara', 'I don’t know. That’s the honest part. He answers me. He just answers like he’s reading off a card. “Fine.” “Tired.” “Not today.”', {expr: 'concern'}); }
    if (c === 'quiet') { await G.say('mara', 'Maybe. He’s had quiet stretches before. This one feels longer. Or I’m counting more.', {expr: 'soft'}); }
    if (c === 'knock') { await G.say('mara', 'Would you? You’re right across the landing.', {expr: 'soft'}); await G.say('mara', 'Don’t make it a rescue. Just a knock. If he says no, that’s an answer too.'); G.flag('offeredKnock'); }
    if (c === 'napkin') { await G.say('mara', 'Thank you. I have icing on my face and feelings about my brother.', {expr: 'smile'}); }
    await G.say('mara', 'Come on. If we walk, I’ll stop talking about him for at least half a lap.', {expr: 'smile'});
    G.flag('maraTalked'); BF.ui.closeDlg(); G.camReset();
    // the walk to the park
    G.walk('mara', 30.2, 4.4); await G.walk('noor', 29.2, 4.6);
    G.face('noor', 'mara'); G.face('mara', 'noor');
    await G.say('mara', 'I’ve got a home visit on Tuesday. Retired woodwork teacher. Half this town learned to cut a dovetail from him.', {expr: 'soft'});
    c = await G.choose('', [{id: 'now', label: 'And now?'}, {id: 'like', label: 'Do you like the home visits?'}]);
    if (c === 'now') await G.say('mara', 'Now he’s had a stroke, and some words come slowly. His hands still remember everything.');
    else await G.say('mara', 'I love them. You get to see what someone actually wants to talk about. Usually it isn’t me.', {expr: 'smile'});
    G.know('mara', 'Is a speech-language pathologist. Has a home visit with a retired woodwork teacher on Tuesday.');
    await G.sit('mara', 'bench'); await G.sit('noor', 'bench2');
    await G.wait(1.2);
    if (!G.is('offeredKnock')) {
      await G.say('mara', 'Can I ask you something? You can say no.', {expr: 'soft'});
      await G.say('mara', 'Would you knock on Dele’s door? You don’t have to fix anything. I just want someone to have knocked.');
      c = await G.choose('', [{id: 'yes', label: 'I’ll knock.'}, {id: 'try', label: 'I’ll try. If he doesn’t answer, I’ll leave it.'}, {id: 'unsure', label: 'I’m not sure he’d want me to.'}]);
      if (c === 'unsure') { await G.say('mara', 'Fair. Then don’t. I mean that.', {expr: 'soft'}); await G.say('mara', 'I just hate the not knowing.'); }
      else await G.say('mara', 'Thank you. Really.', {expr: 'smile'});
      G.flag('knockAnswer', c);
    } else await G.say('mara', 'Thanks for saying you’d knock. You don’t have to report back.', {expr: 'soft'});
    await G.wait(.6);
    BF.ui.closeDlg();
    G.thought('They sit until the knots are gone and the bench has gone warm in the sun.', {hold: 3.2});
    await G.wait(3.4);
    G.addTime(55); G.flag('maraDone');
    await G.fade(1, 1.2);
  }
})();
