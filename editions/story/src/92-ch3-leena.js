/* Chapter Three: A Different Saturday. Leena's shift at the library. Her recollections are hers to open. */
'use strict';
(() => {
  const {register} = BF.story, K = BF.kit;
  register({id: 'leena', number: 3, kicker: 'Chapter Three', title: 'A Different Saturday', when: 'Leena · Saturday afternoon',
    content: 'Leena remembers two periods of her life with bipolar disorder, in her own words, if you choose to look.',
    async run(G) {
      const W = G.W;
      await G.card('Chapter Three', 'A Different Saturday', 'Leena · the same Saturday, across town');
      await G.scene('library', {light: 'afternoon', amb: 'library', music: 'leena', day: 'Saturday', time: [14, 15], player: 'leena',
        actors: {leena: {x: 10.4, y: 4, dir: 'fl'}, patron: {sit: 'armchair', expr: 'neutral'}}, state: {rcSign: {hidden: true}, cart: {left: 3}}});
      G.actor('patron').arm = 'hold'; G.actor('patron').item = 'book';
      BF.ui.showHud(true);
      await G.fade(0, 1);
      await G.think('Saturday shift, two until five. The returns cart is already full. It is always already full.');
      G.know('leena', 'Works Saturday afternoons at Linden Library.');
      let acted = 0, shelved = 0;
      const tick = async () => { acted++; G.addTime(7); if (acted >= 2 && !G.is('noorCame')) await noorVisit(G); };
      const shelfSpots = [[2.6, 1.9, 'br'], [4.5, 3.9, 'br'], [1.9, 3.0, 'bl']];
      const books = [
        ['A slim book of poems. Someone has pressed a violet between pages forty and forty-one.', 'She leaves it exactly where it is.'],
        ['A cookbook with a pencil note in the margin: too much salt!!', 'She agrees, actually. She made that one in March.'],
        ['Walking the Lakes. A pamphlet falls out: a map of cabins around a long thin lake.', 'Nia’s mum’s cabin is on that lake.']];
      await G.explore({people: {patron: 'Mr Adeyemi'}, until: () => G.is('lockedUp'), acts: {
        cart: () => [{label: shelved < 3 ? 'Shelve the next book' : 'Check the cart', run: async () => {
          if (shelved >= 3) { await G.think('Empty. That never lasts.'); return; }
          await G.anim('leena', 'reachLow', .6); G.actor('leena').item = 'book'; G.sfx('page');
          const sp = shelfSpots[shelved]; await G.walk('leena', sp[0], sp[1]); G.face('leena', sp[2]);
          await G.anim('leena', 'shelve', 1.4, {item: 'book'}); G.actor('leena').item = null;
          await G.think(books[shelved][0]); await G.think(books[shelved][1]);
          if (shelved === 2) G.flag('sawLakes');
          shelved++; G.set('cart', {left: 3 - shelved}); await tick();
        }}],
        phone: () => [{label: G.is('readNia') ? 'Read Nia’s message again' : 'Check your phone', run: async () => { await niaMessage(G); await tick(); }}],
        planner: () => [
          {label: 'Open your planner', run: async () => { await plannerNow(G); await tick(); }},
          {label: 'Look at the April page', when: () => G.is('plannerOpened'), run: async () => { await april(G); await tick(); }},
          {label: 'Look at the October page', when: () => G.is('plannerOpened'), run: async () => { await october(G); await tick(); }},
          {label: 'Decide about the 14th', when: () => G.is('readNia') && !G.is('leenaDecision'), run: async () => { await decide(G); await tick(); }},
        ],
        calendar: () => [{label: 'Read the events calendar', run: async () => {
          await G.think('Story hour, Saturdays at eleven. Book sale on the 21st. Aphasia conversation group, Thursdays at two.');
          await G.think('Someone has drawn a small sun beside “Book sale”. She suspects herself.'); await tick();
        }}],
        notice: () => [{label: 'Tidy the noticeboard', run: async () => {
          G.sfx('page'); await G.anim('leena', 'reachHigh', 1.2);
          await G.think('Lost: blue scarf. Guitar lessons. A hand-drawn flyer: Aphasia conversation group. Conversation, coffee, no tests. Speech therapy students welcome.'); await tick();
        }}],
        bench: () => [{label: 'Sit on the bench for a minute', run: async () => {
          await G.sit('leena', 'bench');
          await G.think('A small brass plaque: Made by Linden Secondary Woodshop. Mr W. Brennan’s class. 1998.');
          await G.think('Thirty teenagers, one bench. Someone sanded the armrest until it feels like a sleeve.');
          G.know('walt', 'Taught the school woodshop class that built the library’s bench in 1998.');
          await G.stand('leena'); await tick();
        }}],
        window: () => [{label: 'Look outside', run: async () => { await G.think('The plane trees along Cole Street. A bus pulls in, empties, fills, and pulls away again.'); await tick(); }}],
        shelves: () => [{label: 'Straighten the fiction', run: async () => { await G.anim('leena', 'shelve', 1.2); await G.think('Someone has filed Austen under O. She fixes it without judgement. Mostly without judgement.'); await tick(); }}],
        '@patron': () => [{label: 'Ask Mr Adeyemi if he needs anything', run: async () => { await crossword(G); await tick(); }}],
        signSpot: () => [{label: 'Look at the empty wall', when: () => !G.is('signHung'), run: async () => { await G.think('The reading-corner wall, waiting for Noor’s sign.'); }}],
        door: () => [{label: 'Lock up for the day', when: () => G.is('noorCame'), run: async () => { await lockUp(G); }}],
      }, hint: 'The returns cart, the planner on the desk, a message waiting.', hintAfter: 25});
    }});

  async function crossword(G) {
    G.face('leena', 'patron');
    if (G.is('crossword')) { await G.say('patron', 'Still on 22 down. Don’t help. I’m enjoying suffering.', {expr: 'smile'}); return; }
    await G.say('patron', 'Only the crossword. Fourteen across, seven letters: “a sense of belonging”.', {expr: 'neutral'});
    const c = await G.choose('', [{id: 'kin', label: 'Kinship?'}, {id: 'root', label: 'Rooted?'}, {id: 'later', label: 'Ask me again at four.'}], {name: 'Leena'});
    if (c === 'kin') await G.say('patron', 'K, I, N… yes. Kinship. You’re wasted on books.', {expr: 'smile'});
    if (c === 'root') await G.say('patron', 'Six. So close. I’ll leave a gap for it.', {expr: 'smile'});
    if (c === 'later') await G.say('patron', 'Four o’clock. I’ll hold you to it.', {expr: 'smile'});
    G.flag('crossword');
  }

  async function niaMessage(G) {
    await G.anim('leena', 'reachLow', .5); G.set('lphone', {taken: true}); G.pose('leena', 'phone');
    const first = !G.is('readNia');
    const r = await G.phone({owner: 'Leena', contact: 'Nia', messages: [
      {time: '12:40 p.m.', text: 'Lake weekend, the 14th? Mum’s cabin. Four of us, one canoe, zero plans.'},
      {text: 'Say yes, say maybe, or say ask me Thursday. All three are allowed.'}],
      replies: first ? [{id: 'later', label: 'Think about it later'}, {id: 'now', label: 'Decide now'}] : []});
    G.pose('leena', 'stand'); G.set('lphone', {taken: false});
    G.flag('readNia'); G.know('leena', 'Her friend Nia invited her to a lake weekend on the 14th.');
    if (first) { await G.think('All three are allowed. Nia has always been good at that.'); if (r === 'now') await decide(G); }
  }

  async function plannerNow(G) {
    G.sfx('page'); await G.anim('leena', 'reachLow', .6); G.pose('leena', 'phone');
    const d = {3: 'pen', 7: 'pen', 10: 'pencil', 17: 'pen', 24: 'pencil'}; if (G.is('leenaDecision') === 'pen') d[14] = 'pen'; else if (G.is('leenaDecision') === 'pencil') d[14] = 'pencil'; else d[14] = 'mark';
    await K.planner({title: 'This month', sub: 'present day', offset: 2, len: 30, days: d, note: 'Shifts, Thursday group, dentist, Nia’s birthday. The 14th, circled lightly, nothing written in it yet.'});
    G.pose('leena', 'stand');
    if (!G.is('plannerOpened')) { G.flag('plannerOpened'); await G.think('Two older pages are tucked into the back cover. April, three years ago. October, the year before that.'); await G.think('She keeps them on purpose. She doesn’t always look.'); }
  }

  async function april(G) {
    const W = G.W, prev = W.light;
    G.pose('leena', 'phone');
    const days = {}; for (let i = 1; i <= 30; i++) days[i] = 'on';
    await K.planner({title: 'April', sub: 'three years ago', offset: 4, len: 30, days, animate: true, note: 'Every square, full.'});
    W.light = Object.assign({}, BF.lighting.golden, {ambient: '#f2d2a8'}); BF.audio.music('noor');
    const o = {name: 'Leena, remembering', thought: true};
    await G.say('leena', 'That spring, every square in this planner filled up.', o);
    await G.say('leena', 'Pottery on Mondays. A half-marathon I hadn’t trained for. Two book clubs. Flights to Lisbon, booked at two in the morning.', o);
    await G.say('leena', 'Every idea felt close enough to touch, all at once. The future looked like a corridor with every door open, and I was sure I could walk through all of them.', o);
    await G.say('leena', 'Nia came over one night and asked, very gently, when I had last slept. I was angry with her for a week.', o);
    await G.say('leena', 'I’m not angry now.', o);
    G.close(); W.light = prev; BF.audio.music('leena'); G.pose('leena', 'stand');
    G.flag('sawApril'); await afterMemory(G);
  }
  async function october(G) {
    const W = G.W, prev = W.light;
    G.pose('leena', 'phone');
    await K.planner({title: 'October', sub: 'four years ago', offset: 0, len: 31, days: {6: 'mark', 13: 'mark', 20: 'mark', 27: 'mark'}, note: 'Four Saturdays circled in someone else’s handwriting. Nothing written in them.'});
    W.light = Object.assign({}, BF.lighting.dim, {ambient: '#9aa0ae'}); BF.audio.music('hush');
    const o = {name: 'Leena, remembering', thought: true};
    await G.say('leena', 'The autumn before that, Nia sent an invitation most weeks. She circled the Saturdays for me. I read every message.', o);
    await G.say('leena', 'I liked her. I wanted to want to go.', o);
    await G.say('leena', 'But a date on the page looked like a date on someone else’s page. Saturday was a word. I couldn’t connect it to anything I would be doing in it.', o);
    await G.say('leena', 'The squares stayed empty. That autumn, empty was the honest answer.', o);
    G.close(); W.light = prev; BF.audio.music('leena'); G.pose('leena', 'stand');
    G.flag('sawOctober'); await afterMemory(G);
  }
  async function afterMemory(G) {
    if (G.is('saidHistory')) return;
    G.flag('saidHistory');
    await G.think('I live with bipolar disorder. It’s part of my history.', {name: 'Leena'});
    await G.think('It isn’t the reason for every empty square, or every full one. Some Saturdays are just Saturdays.', {name: 'Leena'});
    G.know('leena', 'Lives with bipolar disorder. Says it is part of her history, and not the reason for everything.');
    G.close(); G.note('time');
  }
  async function decide(G) {
    const c = await G.choose('The 14th. What does she do with it?', [
      {id: 'pen', label: 'Write it in, in pen.'}, {id: 'pencil', label: 'Pencil it in.'}, {id: 'thursday', label: 'Reply to Nia: ask me Thursday.'}, {id: 'blank', label: 'Leave it empty for now.'}], {thought: true, name: 'Leena'});
    G.flag('leenaDecision', c);
    const lines = {pen: 'Ink. Look at that.', pencil: 'Pencil is a promise you’re allowed to rub out. She likes pencil.', thursday: 'Thursday-Leena can decide. She is usually sensible.', blank: 'Empty, for now. Empty can still turn into yes.'};
    if (c === 'thursday') { G.sfx('ping'); await G.phone({owner: 'Leena', contact: 'Nia', messages: [{text: 'Lake weekend, the 14th? Mum’s cabin.'}, {text: 'Say yes, say maybe, or say ask me Thursday. All three are allowed.'}, {me: true, text: 'Ask me Thursday?'}, {text: 'Thursday it is.'}], replies: []}); }
    else { G.sfx('write'); await G.anim('leena', 'write', 1.4); }
    await G.think(lines[c], {name: 'Leena'});
  }

  async function noorVisit(G) {
    const W = G.W; G.flag('noorCame');
    G.sfx('bell'); G.sfx('doorOpen');
    const n = W.addActor('noor', {x: 1.3, y: 9.1, dir: 'fr', item: G.is('hasSign') ? 'wrapped' : null});
    G.set('libDoor', {open: true}); await G.wait(.5); G.set('libDoor', {open: false});
    const L = G.actor('leena');
    const meet = W.nearestWalkable(L.x + 1.2, L.y + 1.4);
    if (L.y < 4.4) { await G.walk('leena', 8, 4.2); }
    await G.walk('noor', 6.8, 5.4); G.face('noor', 'leena'); G.face('leena', 'noor');
    G.focus(['noor', 'leena'], 1.4);
    if (G.is('hasSign')) {
      await G.say('noor', 'Reading corner, as promised.', {expr: 'smile'});
      const c = await G.choose('', [{id: 'perfect', label: 'It’s perfect.'}, {id: 'yellow', label: 'You made the yellow sing.'}, {id: 'hang', label: 'Let’s hang it right now.'}], {name: 'Leena'});
      if (c === 'yellow') await G.say('noor', 'It took four coats. It had better sing.', {expr: 'smile'});
      if (c === 'perfect') await G.say('noor', 'Wait until it’s up. Things look different on a wall.', {expr: 'smile'});
      G.close(); G.camReset();
      G.walk('noor', 2.6, 7.4); await G.walk('leena', 2.2, 6.4); G.face('leena', 'bl'); G.face('noor', 'bl');
      G.actor('noor').item = null;
      await G.anim('leena', 'reachHigh', 1.2); G.sfx('knock'); await G.wait(.3);
      W.st('rcSign', {hidden: false}); G.flag('signHung');
      await G.think('It looks as though it has always been there.');
      G.face('leena', 'noor'); G.face('noor', 'leena'); G.focus(['noor', 'leena'], 1.4);
    } else {
      await G.say('noor', 'I forgot the sign. I came all this way to tell you I forgot the sign.', {expr: 'smile'});
      await G.choose('', [{id: 'ok', label: 'Monday’s fine. I’ll leave the wall empty for it.'}], {name: 'Leena'});
      G.flag('signMonday');
    }
    await G.say('noor', 'How’s your Saturday going?');
    let c = await G.choose('', [{id: 'busy', label: 'Busy, in a good way.'}, {id: 'quiet', label: 'Quiet so far.'}, {id: 'deciding', label: 'I’m deciding whether to say yes to something.'}], {name: 'Leena'});
    if (c === 'deciding') {
      await G.say('noor', 'To what?');
      const d = await G.choose('', [{id: 'lake', label: 'A weekend away with Nia. The 14th.'}, {id: 'thing', label: 'Just a thing. I’ll tell you if I go.'}], {name: 'Leena'});
      await G.say('noor', d === 'lake' ? 'A lake! Whatever you decide, I hope it’s a good one to decide about.' : 'Fair. You can tell me, or not.', {expr: 'soft'});
    } else if (c === 'busy') await G.say('noor', 'You look like you’re having a good one.', {expr: 'smile'});
    else await G.say('noor', 'Quiet is good. Quiet is a library’s whole thing.', {expr: 'smile'});
    const out = G.is('deleOutcome');
    await G.say('noor', out === 'home' ? 'Mine’s been long. I walked past a friend’s door this morning. Twice.' : 'Mine’s been long. I knocked on a friend’s door this morning.', {expr: 'soft'});
    c = await G.choose('', [{id: 'answer', label: out === 'home' ? 'Did you want to knock?' : 'Did they answer?'}, {id: 'talk', label: 'Do you want to talk about it?'}, {id: 'nohave', label: 'You don’t have to tell me.'}], {name: 'Leena'});
    if (c === 'answer') {
      const lines = {visit: 'He did. He let me in. I’m still thinking about it.', declined: 'He did. He said not today. Which is allowed.', note: 'I left a note in the end.', home: 'I think so. I don’t know if he wanted me to.'};
      await G.say('noor', lines[out] || lines.visit, {expr: 'soft'});
    }
    if (c === 'talk') await G.say('noor', 'Not yet. Thank you, though.', {expr: 'soft'});
    if (c === 'nohave') await G.say('noor', 'Thank you. That’s… yes. Thank you.', {expr: 'soft'});
    G.know('noor', 'Told Leena about the knock, and no more than that.');
    if (G.is('hasBooks')) { await G.say('noor', 'Oh. And these are a week late. I know. I’m sorry.', {expr: 'smile'}); await G.choose('', [{id: 'fine', label: 'A week is practically early.'}], {name: 'Leena'}); }
    await G.say('noor', 'I’ll let you get back to the cart.', {expr: 'smile'});
    G.close(); G.camReset();
    await G.walk('noor', 1.3, 9.1); G.sfx('bell'); n.visible = false;
  }

  async function lockUp(G) {
    if (G.is('readNia') && !G.is('leenaDecision')) {
      const c = await G.choose('Nia’s message is still waiting.', [{id: 'decide', label: 'Decide about the 14th first'}, {id: 'later', label: 'It can wait until tonight'}], {thought: true, name: 'Leena'});
      if (c === 'decide') await decide(G); else G.flag('leenaDecision', 'later');
    }
    G.time(17, 0);
    if (G.is('crossword') && G.actor('patron')) { G.face('leena', 'patron'); await G.say('patron', 'Five already. Same time next week, librarian.', {expr: 'smile'}); G.close(); }
    await G.think('Five o’clock. She turns the sign on the door to CLOSED and listens to the building settle.');
    G.flag('lockedUp');
    await G.fade(1, 1.4);
  }
})();
