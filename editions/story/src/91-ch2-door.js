/* Chapter Two: Behind the Door. Noor visits Dele. Every outcome is his answer or hers, and the story goes on. */
'use strict';
(() => {
  const {register} = BF.story;
  register({id: 'door', number: 2, kicker: 'Chapter Two', title: 'Behind the Door', when: 'Noor · Saturday, late morning',
    content: 'A friend has withdrawn and seems low. Nothing frightening happens.',
    defaults: {pastry: true, twoKnots: true},
    onSkip(G) { G.flag('deleOutcome', null); G.flag('deleKnocked', null); },
    async run(G, from) {
      await G.card('Chapter Two', 'Behind the Door', 'Noor · Saturday, late morning', {content: 'Dele, a friend of Noor’s, has withdrawn and seems low. Nothing frightening happens, and the visit can end however it ends.', chapter: 'door', go: 'Begin'});
      if (from !== 'inside') await landing(G);
      if (G.is('deleOutcome') === 'visit' || from === 'inside') { if (from === 'inside') G.flag('deleOutcome', 'visit'); await inside(G); await after(G); }
    }});

  async function landing(G) {
    const W = G.W;
    await G.scene('hallway', {light: 'day', amb: 'hallway', music: 'hush', day: 'Saturday', time: [11, 20], player: 'noor',
      actors: {noor: {x: 10.4, y: 2.7, dir: 'bl', item: G.is('pastry') ? 'bag' : null}, dele: {x: 8.9, y: .55, dir: 'fl', visible: false}}});
    BF.ui.showHud(true);
    await G.fade(0, .9);
    await G.walk('noor', 9.6, 2.3);
    if (G.is('twoKnots')) await G.think('Two cinnamon knots in a paper bag. One of them is Dele’s, if he wants it.');
    else if (G.is('pastry')) await G.think('One cinnamon knot, a little squashed. She should have asked Sami for two.');
    else await G.think('His door. Her door. Six steps of carpet between them.');
    G.flag('deleOutcome', null);
    // False means the landing was played without a knock, not a missing legacy flag.
    G.flag('deleKnocked', false);
    await G.explore({until: () => !!G.is('deleOutcome'), acts: {
      door2C: () => [
        {label: 'Knock', run: async () => { await knock(G); }},
        {label: 'Listen', run: async () => { await G.think('The radio, still low. A floorboard. Then nothing for a while.'); }},
        {label: 'Leave a note instead', run: async () => { await leaveNote(G); }},
      ],
      door2B: () => [{label: 'Go home', run: async () => {
        await G.think('She stands in her own doorway and looks back at his.');
        await G.think('Not today. She isn’t sure whether that was for him or for her.');
        G.flag('deleOutcome', 'home'); G.sfx('doorOpen'); G.set('door2B', {open: true}); await G.wait(.6);
      }}],
      bike: () => [{label: 'Look at the bike', run: async () => { await G.think('The flat tyre. The pump, clipped to the frame, right there.'); }}],
    }, hint: 'Door 2C. The light is still on under it.', hintAfter: 20});
    if (G.is('deleOutcome') === 'home' || G.is('deleOutcome') === 'note' || G.is('deleOutcome') === 'declined') {
      if (G.is('deleOutcome') === 'declined') await G.think('A closed door is also an answer. She doesn’t have to like it to respect it.');
      G.note('doorway');
      await G.fade(1, 1.2);
    }
  }

  async function knock(G) {
    const W = G.W, dele = G.actor('dele');
    G.flag('deleKnocked', true);
    G.sfx('knock'); await G.anim('noor', 'knock', 1.1);
    await G.wait(1.8);
    let c = await G.choose('The radio inside goes quiet.', [
      {id: 'wait', label: 'Wait'}, {id: 'again', label: 'Knock again, more softly'}, {id: 'name', label: '“Dele? It’s Noor.”'}, {id: 'go', label: 'Leave it'}], {thought: true, name: 'Noor'});
    if (c === 'go') { G.close(); await G.think('Maybe a note.'); const n = await G.choose('', [{id: 'note', label: 'Write him a note'}, {id: 'home', label: 'Go home'}]); if (n === 'note') return leaveNote(G); G.flag('deleOutcome', 'home'); return; }
    if (c === 'again') { G.sfx('knock'); await G.anim('noor', 'knock', .8); }
    if (c === 'name') { await G.say('noor', 'Dele? It’s Noor.', {to: [8.9, 0]}); }
    G.close();
    if (c === 'wait') await G.wait(2.6); else await G.wait(1.4);
    G.sfx('footsteps'); await G.wait(1);
    G.sfx('doorOpen'); G.set('door2C', {open: true}); dele.visible = true; dele.expr = 'tired'; dele.item = null;
    G.focus(['noor', 'dele'], 1.5);
    await G.wait(.6);
    await G.say('dele', 'Noor.{1} Mara sent you.', {expr: 'tired'});
    G.know('dele', 'Opened the door when Noor knocked.');
    const bag = G.is('pastry');
    c = await G.choose('', [
      {id: 'anyway', label: 'She mentioned you. I wanted to come anyway.'},
      {id: 'knot', label: 'I brought you a cinnamon knot from Sami’s.', when: () => G.is('twoKnots')},
      {id: 'go', label: 'I can go, if today isn’t good.'},
      {id: 'quiet', label: bag ? '(Hold up the paper bag. Say nothing.)' : '(Say nothing. Just stand there.)', quiet: true}]);
    let open = false;
    if (c === 'anyway') await G.say('dele', 'Anyway.{1} Okay.', {expr: 'neutral'});
    if (c === 'knot') { await G.say('dele', 'From Sami’s.{1.2} He’ll ask if I ate it.', {expr: 'neutral'}); G.flag('gaveKnot'); }
    if (c === 'go') { await G.say('dele', '{1.4}No. It’s… you can come in for a bit. It’s a mess.', {expr: 'neutral'}); open = true; }
    if (c === 'quiet') { await G.say('dele', bag ? 'Sami’s bag.{1.2} Come in, if you want.' : '{1.2}You can come in, if you want.', {expr: 'neutral'}); open = true; if (G.is('twoKnots')) G.flag('gaveKnot'); }
    if (!open) {
      await G.say('dele', 'I’m not really up for much today.', {expr: 'tired'});
      c = await G.choose('', [{id: 'little', label: 'Then I won’t ask for much.'}, {id: 'want', label: 'Do you want me to go?'}, {id: 'ten', label: 'Can I come in for ten minutes?'}]);
      if (c === 'little') { await G.say('dele', '{1}Okay. Come in.'); open = true; }
      if (c === 'want') { await G.say('dele', '{1.3}No. Come in.'); open = true; }
      if (c === 'ten') {
        await G.say('dele', '{1.2}Not today, Noor.', {expr: 'tired'});
        if (G.is('gaveKnot')) { G.close(); await G.anim('noor', 'reach', .8); G.actor('noor').item = null; await G.think('She hands him the bag. He takes it.'); }
        G.sfx('doorClose'); G.set('door2C', {open: false}); dele.visible = false;
        G.flag('deleOutcome', 'declined'); G.camReset(); return;
      }
    }
    G.close(); G.flag('deleOutcome', 'visit');
    await G.fade(1, .8);
  }

  async function leaveNote(G) {
    await G.think('She tears a page from the back of her sketchbook.');
    const c = await G.choose('What does she write?', [
      {id: 'knot', label: '“Brought you a knot from Sami’s. No need to reply. N.”', when: () => G.is('pastry')},
      {id: 'walk', label: '“Walk next Saturday? Or not. Either is fine. N.”'},
      {id: 'here', label: '“I’m across the landing. N.”'}], {thought: true, name: 'Noor'});
    G.flag('noteText', c);
    G.sfx('write'); await G.anim('noor', 'write', 1.8);
    await G.anim('noor', 'reachLow', 1); G.sfx('rustle');
    if (G.is('pastry')) { G.set('hallBag', {here: true}); G.actor('noor').item = null; G.flag('bagOnMat'); }
    await G.think('The note goes under the door. The bag waits on the mat.');
    G.flag('deleOutcome', 'note');
  }

  async function inside(G) {
    const W = G.W;
    await G.scene('deleFlat', {light: 'dim', amb: 'dele', music: 'dele', day: 'Saturday', time: [11, 28], player: 'noor', who: 'Noor',
      actors: {noor: {x: 1.2, y: 7.7, dir: 'fr'}, dele: {sit: 'sofa', expr: 'tired'}},
      state: {curtains: {open: .12}, winlamp: {on: true}, pastryBag: {here: !!G.is('gaveKnot')}}});
    G.actor('noor').item = null;
    await G.fade(0, .9);
    G.sfx('doorClose');
    await G.think('The curtains are shut against a bright day. The lamp by the window is on.');
    await G.think('It looks like the flat of someone who used to tidy on Sundays.');
    G.know('dele', 'Keeps his curtains closed. The lamp by the window stays on during the day.');
    let talks = 0;
    await G.explore({people: {dele: 'Dele'}, until: () => G.is('visitEnded'), acts: {
      '@dele': () => [{label: talks ? 'Sit with him again' : 'Sit down with Dele', walk: false, run: async () => { talks++; await converse(G, talks); }}],
      curtains: () => [{label: 'Ask about the curtains', when: () => !G.is('askedCurtains'), run: async () => {
        await G.say('noor', 'Do you want some light in here?', {to: 'dele'});
        await G.say('dele', 'Leave them.{1} Please.', {expr: 'tired'});
        G.close(); G.flag('askedCurtains'); G.thought('She leaves them.');
      }}],
      kettle: () => [{label: 'Offer to make tea', when: () => !G.is('madeTea'), run: async () => { await offerTea(G); }}],
      mugs: () => [{label: 'Offer to wash the mugs', when: () => !G.is('washed'), run: async () => {
        await G.say('noor', 'Mind if I wash these?', {to: 'dele'});
        await G.say('dele', 'You don’t have to.');
        const c = await G.choose('', [{id: 'want', label: 'I know. I’d like to.'}, {id: 'leave', label: 'Okay. I’ll leave them.'}]);
        G.close();
        if (c === 'want') { G.sfx('water'); await G.anim('noor', 'cook', 2.4); G.sfx('clink'); G.flag('washed'); G.thought('Three mugs, clean, upside down on the rack.'); }
        else G.flag('washedAsked');
      }}],
      case: () => [{label: 'Look at the case', run: async () => { await G.think('His sign-writing case, latched. A strip of masking tape on the lid says DELE in neat capitals.'); }}],
      board: () => [{label: 'Look at the practice board', run: async () => {
        await G.think('FERRO’S, gold script on black. The S has been painted over at least twice.');
        if (!G.is('askedBoard')) { G.flag('askedBoard'); await G.say('dele', 'Practice board. From before I did the real window.', {to: 'noor'}); await G.say('dele', 'The F on the real one is lifting. I keep meaning to fix it.'); G.close(); }
      }}],
      mail: () => [{label: 'Look at the post', run: async () => { await G.think('Envelopes, unopened, mostly the kind with little windows.'); }}],
      photo: () => [{label: 'Look at the photo', run: async () => { await G.think('The same photo she has on her fridge. Dele, laughing at something out of frame.'); }}],
      lettering: () => [{label: 'Look at the framed lettering', run: async () => { await G.think('A test piece for the bakery window: Ferro’s, in gold, framed. He was proud of it. He said so, once, which for Dele was a speech.'); }}],
      door: () => [{label: 'Say goodbye', run: async () => { await goodbye(G, 'noor'); }}],
    }, hint: 'Dele is on the sofa.', hintAfter: 15});
  }

  async function offerTea(G) {
    await G.say('noor', 'Can I make us some tea?', {to: 'dele'});
    await G.say('dele', 'If you want.{1} I don’t know if there’s milk.');
    G.close();
    await G.walkObj('noor', 'kettle');
    G.set('kettle', {boiling: true}); G.sfx('kettle'); await G.anim('noor', 'reach', 3.6); G.set('kettle', {boiling: false});
    await G.walkObj('noor', 'fridge');
    G.sfx('doorOpen'); await G.anim('noor', 'reach', 1);
    await G.think('No milk. A jar of mustard and half a lemon.');
    await G.say('dele', 'Black’s fine.', {to: 'noor'}); G.close();
    await G.walkObj('noor', 'kettle'); G.sfx('pour'); await G.anim('noor', 'pour', 1.2);
    await G.walk('noor', 4.4, 4.5); await G.anim('noor', 'reachLow', .8); G.sfx('clink');
    G.set('leftCup', {here: true, warm: true}); G.flag('madeTea');
    G.thought('She puts his cup within reach.');
  }

  async function converse(G, n) {
    const dele = G.actor('dele');
    await G.sit('noor', 'chair'); G.face('dele', 'noor'); G.focus(['noor', 'dele'], 1.45);
    if (n === 1) {
      await G.say('dele', 'Mara’s worried.', {expr: 'tired'});
      const c = await G.choose('', [{id: 'miss', label: 'She is. She also just misses you.'}, {id: 'how', label: 'How are you doing?'}, {id: 'quiet', label: '(Sit quietly with him.)', quiet: true}]);
      if (c === 'miss') { await G.say('dele', 'I know.{1.4} I miss… I don’t know what I miss. The walks were good. I know they were good.'); }
      if (c === 'how') {
        await G.say('dele', 'Fine.{1.2} That’s the answer I’ve been giving. It’s easier than the other one.');
        const d = await G.choose('', [{id: 'other', label: 'What’s the other one?'}, {id: 'wait', label: '(Wait.)', quiet: true}]);
        if (d === 'wait') { G.close(); await G.wait(2.4); }
        await G.say('dele', 'I don’t really have the other one. That’s the trouble.');
      }
      if (c === 'quiet') { G.close(); G.sfx('rustle'); await G.wait(3.2); await G.say('dele', 'Thanks for not saying it’ll pass.'); G.flag('sawQuiet'); }
      G.close(); await G.stand('noor'); G.camReset();
      G.thought('He looks at the curtains, then back at her.');
      return;
    }
    // the second sitting
    await G.say('noor', 'Mara says you haven’t been on the walks.', {to: 'dele'});
    await G.say('dele', 'I know I could go outside.{1.3} I just don’t know what I’d be going out for.', {expr: 'tired'});
    G.know('dele', '“I know I could go outside. I just don’t know what I’d be going out for.”');
    const c = await G.choose('', [
      {id: 'company', label: 'Would you like some company?'}, {id: 'before', label: 'What were your walks like before?'},
      {id: 'tea', label: 'I could make us some tea.', when: () => !G.is('madeTea')}, {id: 'quiet', label: '(Remain quiet.)', quiet: true}]);
    if (c === 'company') {
      await G.say('dele', 'Company’s okay.{1} If you don’t need me to talk.');
      G.close(); G.flag('quietCompany');
      G.thought('So they sit. The radiator ticks. Somebody upstairs drops something soft.', {hold: 4}); await G.wait(4.6); G.addTime(12);
      await G.say('dele', 'The F on Ferro’s window is lifting. I noticed in August.{1.2} I know exactly how to fix it. The size and the leaf are right there in the case.');
      await G.say('dele', 'Knowing how is the easy part.');
    }
    if (c === 'before') {
      await G.say('dele', 'Mara talks the whole loop. I look at signs.', {expr: 'neutral'});
      await G.say('dele', 'The hardware shop on Cole Street has a hand-painted sign from 1962. Nobody’s touched it. The R is perfect.');
      await G.say('dele', '{1.2}I used to notice that kind of thing.', {expr: 'tired'});
      G.know('dele', 'Notices old hand-painted shop signs. Said he “used to”.');
    }
    if (c === 'tea') { await G.stand('noor'); await offerTea(G); await G.sit('noor', 'chair'); await G.say('dele', 'Thanks.{1} It’s nice to hold something warm.', {to: 'noor'}); G.flag('teaInTalk'); }
    if (c === 'quiet') {
      G.close(); await G.wait(3);
      await G.say('dele', 'You can say it’ll get better. Everyone does.');
      const d = await G.choose('', [{id: 'dk', label: 'I don’t know if it will. I’m here anyway.'}, {id: 'might', label: 'It might.'}, {id: 'stay', label: '(Stay quiet.)', quiet: true}]);
      if (d === 'dk') await G.say('dele', '{1.4}Okay.{1} Thanks.');
      if (d === 'might') await G.say('dele', 'Might.', {expr: 'neutral'});
      if (d === 'stay') { G.close(); await G.wait(2); G.thought('He nods, very slightly.'); await G.wait(1.5); }
    }
    G.close(); await G.wait(1);
    await goodbye(G, 'dele');
  }

  async function goodbye(G, who) {
    if (who === 'dele') await G.say('dele', 'I think I’m going to lie down for a bit.', {expr: 'tired'});
    else { G.face('noor', 'dele'); await G.say('noor', 'I should let you be.', {to: 'dele'}); }
    const c = await G.choose('', [{id: 'across', label: 'Okay. I’m right across the landing.'}, {id: 'tomorrow', label: 'Can I come by tomorrow?'}, {id: 'thanks', label: 'Thanks for letting me in.'}]);
    if (c === 'across') await G.say('dele', 'I know.');
    if (c === 'tomorrow') await G.say('dele', '{1}Maybe. Text first.');
    if (c === 'thanks') await G.say('dele', 'Thanks for knocking.{1} I mean it.', {expr: 'soft'});
    G.flag('goodbye', c); G.close();
    if (G.actor('noor').seated) await G.stand('noor');
    if (G.is('twoKnots') && !G.is('gaveKnot')) { G.flag('gaveKnot'); G.set('pastryBag', {here: true}); G.thought('She leaves the second knot on the table.'); }
    G.camReset();
    await G.walkObj('noor', 'door');
    G.sfx('doorOpen'); G.set('door', {open: true}); await G.wait(.5);
    G.flag('visitEnded');
    await G.fade(1, .8);
  }

  async function after(G) {
    await G.scene('hallway', {light: 'day', amb: 'hallway', music: 'hush', player: 'noor', actors: {noor: {x: 8.9, y: 1.5, dir: 'fl'}}, state: {door2C: {open: false}}});
    G.time(11, 55);
    G.sfx('doorClose');
    await G.fade(0, .8);
    await G.wait(.8);
    await G.think('She knows what the visit was like from her side of the door.');
    await G.think('That is the only side she has.');
    G.note('doorway');
    G.close();
    await G.walk('noor', 2.1, 1.4);
    await G.fade(1, 1.2);
  }
})();
