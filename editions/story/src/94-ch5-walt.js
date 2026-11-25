/* Chapter Five: The Words Between Us. Mara visits Walt. Conversation is something they build together. */
'use strict';
(() => {
  const {register} = BF.story, K = BF.kit;
  register({id: 'walt', number: 5, kicker: 'Chapter Five', title: 'The Words Between Us', when: 'Mara · Tuesday morning',
    content: 'Walt has aphasia after a stroke. The chapter is about finding words, waiting, and being understood.',
    async run(G) {
      const W = G.W;
      await G.card('Chapter Five', 'The Words Between Us', 'Mara · Tuesday morning');
      await G.scene('waltHouse', {light: 'day', amb: 'walt', music: 'walt', day: 'Tuesday', time: [10, 30], player: 'mara',
        actors: {mara: {x: 1.1, y: 7.8, dir: 'fr', item: null}, june: {x: 2.6, y: 6.6, dir: 'bl', expr: 'smile'}, walt: {sit: 'walt', expr: 'neutral'}}});
      BF.ui.showHud(true);
      G.set('frontDoor', {open: true});
      await G.fade(0, 1);
      G.sfx('doorClose'); G.set('frontDoor', {open: false});
      G.face('june', 'mara'); G.focus(['mara', 'june'], 1.45);
      await G.say('june', 'Come in, come in. He’s been up since six. The kettle’s just boiled.', {expr: 'smile'});
      await G.say('june', 'I should tell you, before you sit down.{1} He’s stopped with the cards. They’re in the drawer.', {expr: 'concern'});
      await G.say('june', 'He just… stopped trying.', {expr: 'concern'});
      G.know('june', 'Walt’s wife. Told Mara that Walt “stopped trying” with his picture cards.');
      const c = await G.choose('', [{id: 'thanks', label: 'Thanks for telling me. I’ll ask him about it.'}, {id: 'instead', label: 'What has he been doing instead?'}, {id: 'first', label: 'Can I talk with Walt first, and then with you?'}], {name: 'Mara'});
      if (c === 'thanks') await G.say('june', 'He’ll say he’s fine. He says that word very well.', {expr: 'soft'});
      if (c === 'instead') { await G.say('june', 'Hours in the garage. Hours. I hear the plane going.', {expr: 'soft'}); G.know('walt', 'Spends hours in his workshop since the stroke.'); }
      if (c === 'first') await G.say('june', 'Of course. Yes. Sorry. I talk for him. Forty-one years of practice.', {expr: 'smile'});
      G.close(); G.camReset();
      G.walk('june', 2.2, 2.2).then(() => G.face('june', 'br'));
      G.know('walt', 'Retired woodwork teacher. Has aphasia after a stroke four months ago.');
      await G.explore({people: {walt: 'Walt', june: 'June'}, until: () => G.is('waltDone'), acts: {
        '@walt': () => [{label: G.is('talkedWalt') ? 'Sit back down with Walt' : 'Sit down with Walt', walk: false, run: async () => { await visit(G); }}],
        '@june': () => [{label: 'Talk to June', run: async () => {
          G.face('june', 'mara');
          if (!G.is('juneTea')) { await G.say('june', 'Tea? I’ve made you one anyway.', {expr: 'smile'}); G.set('tea2', {here: true}); G.flag('juneTea'); }
          else await G.say('june', 'Don’t mind me. I’m pretending to clean the sink so I can listen.', {expr: 'smile'});
        }}],
        calendar: () => [{label: 'Look at the calendar', run: async () => { await G.think('Sunday is circled twice in red. Above it, in careful capitals: ROSIE 1.', {name: 'Mara'}); G.flag('sawCalendar'); G.know('walt', 'His granddaughter Rosie turns one on Sunday.'); }}],
        photo: () => [{label: 'Look at the family photo', run: async () => { await G.think('Walt, June, a man with June’s chin, and a baby in a woolly hat held up to the camera like a prize.', {name: 'Mara'}); }}],
        drawer: () => [
          {label: 'Look in the drawer', when: () => !G.is('sawCards'), run: async () => { G.sfx('doorOpen'); await G.anim('mara', 'reachLow', .8); await G.think('Picture cards, rubber-banded together. Dog. Key. Kettle. Chair.', {name: 'Mara'}); G.flag('sawCards'); }},
          {label: 'Bring the cards to the table', when: () => G.is('sawCards') && G.is('talkedWalt') && !G.get('cards').out, run: async () => { await cards(G); }},
        ],
        rocker: () => [{label: 'Look at the small chair', run: async () => { await G.think('A child’s rocking chair, nearly done. The joints hold without glue. One armrest is still rough.', {name: 'Mara'}); }}],
        bench: () => [{label: 'Look at the workbench', run: async () => { await G.think('Shavings in curls. A pencil behind a pencil behind a pencil. A list on the wall in big capitals: ARM. SAND. OIL. SUNDAY.', {name: 'Mara'}); }}],
        pegboard: () => [{label: 'Look at the tools', run: async () => { await G.think('Every tool has its outline painted on the board, so you can see what’s missing. Nothing is.', {name: 'Mara'}); }}],
        kettle: () => [{label: 'Look at the kettle', run: async () => { await G.think('Red, enamel, older than Mara. Still boiling.', {name: 'Mara'}); }}],
        window: () => [{label: 'Look outside', run: async () => { await G.think('A small garden. A bird feeder made from what is very clearly a leftover table leg.', {name: 'Mara'}); }}],
        door: () => [{label: 'Leave', when: () => G.is('toastDone'), run: async () => { await leave(G); }}],
      }, hint: 'Walt is at the kitchen table.', hintAfter: 15});
      await G.fade(1, 1.4);
    }});

  const M = {name: 'Mara'};
  async function visit(G) {
    const W = G.W;
    await G.sit('mara', 'mara'); G.face('walt', 'mara'); G.focus(['mara', 'walt'], 1.5);
    if (G.is('talkedWalt')) { await G.say('walt', 'Back.{.8} Good.', {expr: 'smile'}); if (!G.is('toastDone')) await toast(G); else { await G.say('walt', 'Card. Pocket.{1} Sunday.', {expr: 'smile'}); G.close(); await G.stand('mara'); } return; }
    G.flag('talkedWalt');
    await G.say('walt', 'Mara.{.8} Good. Good to… see.', {expr: 'smile'});
    await G.say('mara', 'Good to see you too, Walt. How’s your week been?', {expr: 'smile'});
    await G.say('walt', 'Busy. Very.{1} The… the…{1.4}', {expr: 'neutral', pose: 'gesture'});
    G.pose('walt', 'point'); G.face('walt', 'fr');
    await G.say('walt', '…for the…{1} small.{1.2} She’s…{1.4}', {expr: 'concern'});
    G.pose('walt', 'sit'); G.face('walt', 'mara');
    let c = await G.choose('He holds up one finger.', [
      {id: 'wait', label: '(Wait.)', quiet: true}, {id: 'guess', label: 'Offer a word: “A toy?”'}, {id: 'yn', label: 'Ask: “Is it something you’re making?”'}, {id: 'write', label: 'Write ROSIE on your notepad and turn it to him.', when: () => G.is('sawCalendar')}], M);
    if (c === 'wait') { G.close(); await G.wait(2.6); await G.say('walt', '…Rosie.{1} One. Sunday.{1.2} I make a…{1.4} chair. Rocking.', {expr: 'smile'}); }
    if (c === 'guess') { await G.say('walt', 'No. No.', {expr: 'frown'}); await G.say('walt', '{1.2}Chair. Sit. Small.{1} For Rosie. She’s one. Sunday.', {expr: 'neutral'}); G.flag('wrongGuess'); }
    if (c === 'yn') { await G.say('walt', 'Yes! Yes.', {expr: 'smile'}); await G.say('walt', 'For Rosie. One. Sunday.{1} Chair.'); }
    if (c === 'write') { G.close(); G.sfx('write'); await G.anim('mara', 'write', 1.2); G.set('paper', {here: true}); await G.say('walt', 'Yes.{.8} Rosie. One.{1} Sunday.', {expr: 'smile'}); }
    G.flag('firstTool', c);
    G.note('between');
    await G.say('walt', 'Come.{.8} Show you.', {expr: 'smile'});
    G.close(); G.camReset();
    await G.stand('mara'); G.standNow('walt');
    G.walk('walt', 11.2, 4.9); await G.walk('mara', 13.7, 4.9);
    G.face('walt', 'rocker'); G.face('mara', 'rocker'); await G.wait(.4);
    G.face('walt', 'mara'); G.focus(['mara', 'walt', 'rocker'], 1.4);
    await G.say('walt', 'Look.{1} No glue. Tight. The…{1.5}', {expr: 'smile', pose: 'hands'});
    c = await G.choose('He slides one hand into the other, fingers locking.', [{id: 'grown', label: 'Like it grew that way.'}, {id: 'mortise', label: 'Mortise and tenon?'}, {id: 'watch', label: '(Watch his hands.)', quiet: true}], M);
    if (c === 'mortise') await G.say('walt', 'Yes! Mortise.{.8} You know.', {expr: 'smile'});
    if (c === 'grown') await G.say('walt', 'Grew. Yes. Hm.{1} I like that.', {expr: 'smile'});
    if (c === 'watch') { G.close(); G.pose('walt', 'hands'); await G.wait(2.2); await G.say('walt', 'Like that.{1} Like… hands.', {expr: 'smile'}); }
    await G.say('walt', 'Arm. Rough still.{1} You…{1} try?', {expr: 'neutral'});
    G.close();
    await G.walkObj('mara', 'rocker'); G.set('rocker', {arm: true});
    G.set('sanding', {on: true}); G.sfx('sand'); await G.anim('mara', 'sand', 2.2); G.set('sanding', {on: false});
    await G.say('walt', 'With. With the…{1.4}', {expr: 'concern', pose: 'point'});
    c = await G.choose('He runs one finger along the wood.', [{id: 'grain', label: 'With the grain?'}, {id: 'follow', label: '(Follow his finger with the paper.)', quiet: true}], M);
    G.close();
    if (c === 'follow') { G.set('sanding', {on: true}); G.sfx('sand'); await G.anim('mara', 'sand', 2); G.set('sanding', {on: false}); await G.say('walt', 'Yes. Grain.{.8} With grain.', {expr: 'smile'}); }
    else await G.say('walt', 'Grain! Yes.{.8} With grain.', {expr: 'smile'});
    G.close(); G.set('sanding', {on: true}); G.sfx('sand'); await G.anim('mara', 'sand', 2); G.set('sanding', {on: false}); G.set('rocker', {arm: true, sanded: true});
    G.thought('Soft as a sleeve.');
    await G.wait(1.4);
    G.face('walt', 'mara'); G.focus(['mara', 'walt'], 1.5);
    await G.say('walt', 'Sunday. Party. Everybody.{1} Hal, his… wife, the baby.', {expr: 'neutral'});
    await G.say('walt', 'I want to say.{1} Say a thing. To her.', {expr: 'neutral'});
    await G.say('walt', '{1.3}Words go. When people look.{1} Words go.', {expr: 'concern'});
    G.know('walt', 'Wants to say something to Rosie himself at her first birthday.');
    c = await G.choose('', [{id: 'what', label: 'What would you want to say to her?'}, {id: 'work', label: 'We could work on it together. Today, if you like.'}, {id: 'june', label: 'June could read something out for you.'}, {id: 'wait', label: '(Wait.)', quiet: true}], M);
    if (c === 'what') { await G.say('walt', 'That she…{1.6} that I…{2}', {expr: 'concern'}); G.pose('walt', 'hands'); await G.say('walt', 'Help. You help?', {expr: 'neutral'}); }
    if (c === 'work') await G.say('walt', 'Today.{.8} Yes.', {expr: 'smile'});
    if (c === 'june') { await G.say('walt', 'No.{1} Me.{1} My… me.', {expr: 'frown'}); await G.say('mara', 'Okay. You, then.', {expr: 'soft'}); await G.say('walt', 'Me.{.8} With help.', {expr: 'neutral'}); G.flag('saidMe'); }
    if (c === 'wait') { G.close(); await G.wait(3); await G.say('walt', 'Help.{1} Maybe. You help?', {expr: 'neutral'}); }
    G.close(); G.camReset();
    G.walk('walt', 2.6, 5.6).then(() => G.sitNow('walt', 'walt'));
    await G.walk('mara', 5.75, 5.4);
    await toast(G);
  }

  async function toast(G) {
    const W = G.W;
    await G.sit('mara', 'mara'); G.face('walt', 'mara'); G.focus(['mara', 'walt'], 1.5);
    G.set('paper', {here: true}); G.sfx('page');
    await G.say('mara', 'Let’s make a card. Your words, big enough to read with people looking.', {expr: 'soft'});
    const words = [];
    // first word: easy
    await G.say('walt', 'Her name first.{1} Rosie.{.8} Rosie I can say.', {expr: 'smile'});
    G.sfx('write'); await G.anim('mara', 'write', 1.2); words.push('ROSIE');
    // second word
    await G.say('walt', 'Then…{1.4} one. One…{1.6} the…{1.2} round.', {expr: 'concern', pose: 'gesture'});
    let c = await G.choose('He draws a circle in the air, slowly, twice.', [
      {id: 'guess', label: 'Offer a word: “One year?”'}, {id: 'wait', label: '(Wait.)', quiet: true}, {id: 'yn', label: 'Ask: “Is it about time?”'}, {id: 'draw', label: 'Draw a circle on the card and wait.'}], M);
    if (c === 'guess') await G.say('walt', 'Year!{.8} One year.', {expr: 'smile'});
    if (c === 'wait') { G.close(); await G.wait(2.8); await G.say('walt', '…Year.{1} One year.', {expr: 'smile'}); }
    if (c === 'yn') await G.say('walt', 'Yes. Time.{1} One… year.', {expr: 'smile'});
    if (c === 'draw') { G.close(); G.sfx('write'); await G.anim('mara', 'write', 1); await G.wait(1.4); await G.say('walt', 'Yes. That.{1} Year. One year.', {expr: 'smile'}); }
    G.sfx('write'); await G.anim('mara', 'write', 1); words.push('ONE YEAR');
    // third word: the hard one
    G.face('walt', 'bl');
    await G.say('walt', 'And she is…{2} she is…{2}', {expr: 'concern', pose: 'think'});
    G.walk('june', 4.1, 3.1);
    c = await G.choose('He looks over at the family photo.', [{id: 'wait', label: '(Wait.)', quiet: true}, {id: 'guess', label: 'Offer a word: “Precious?”'}, {id: 'yn', label: 'Ask: “Is it a feeling?”'}], M);
    if (c === 'guess') { await G.say('walt', 'No.{1} Not… no.', {expr: 'frown'}); G.flag('wrongGuess2'); }
    if (c === 'yn') await G.say('walt', 'Yes.{1} Feeling. Big.', {expr: 'neutral'});
    if (c === 'wait') { G.close(); await G.wait(2.4); }
    G.face('june', 'walt');
    await G.say('june', 'Loved, love. He means loved.', {expr: 'soft'});
    G.face('walt', 'june'); G.expr('walt', 'frown');
    c = await G.choose('Walt’s mouth closes on whatever he was about to say.', [{id: 'moment', label: '“Let’s give Walt a moment.”'}, {id: 'thanks', label: '“Thanks, June.”'}, {id: 'wait', label: '(Wait.)', quiet: true}], M);
    if (c === 'moment') {
      await G.say('june', 'Sorry. Habit.', {expr: 'smile'});
      await G.say('walt', '{1}Forty… one. Years.{.8} Habit.', {expr: 'smile'});
      await G.say('walt', '{1.2}But. Yes.{1} Loved.{1} She is loved.', {expr: 'smile'});
    }
    if (c === 'thanks') { await G.say('walt', 'Hm.{1.2} Yes.{1} Loved.', {expr: 'neutral'}); G.flag('juneFinished'); }
    if (c === 'wait') { G.close(); G.pose('june', 'hands'); await G.wait(2); await G.say('walt', '{1}Loved.{1} She is… loved.', {expr: 'smile'}); }
    G.flag('juneMoment', c);
    G.sfx('write'); await G.anim('mara', 'write', 1); words.push('LOVED');
    G.close();
    await K.toastCard(words, 3800);
    G.face('walt', 'mara');
    await G.say('walt', 'Rosie.{1.2} One year.{1.4} You are…{1.2} loved.', {expr: 'smile'});
    await G.say('walt', '{1}Badly. I say it badly.', {expr: 'neutral'});
    c = await G.choose('', [{id: 'said', label: 'You said it. That’s the part that counts.'}, {id: 'practise', label: 'Want to practise it a few times?'}, {id: 'badly', label: 'Badly counts.'}], M);
    if (c === 'practise') { await G.say('walt', 'Rosie. One year.{1} You are loved.', {expr: 'smile'}); await G.say('walt', 'Rosie. One year. You are loved.', {expr: 'smile'}); await G.say('walt', 'Better.{1} Still… badly. Good badly.', {expr: 'smile'}); }
    else if (c === 'badly') await G.say('walt', 'Badly counts.{1} Hm. I keep that.', {expr: 'smile'});
    else await G.say('walt', 'Counts.{1} Yes.', {expr: 'smile'});
    G.know('walt', 'Made a card for Rosie’s birthday: ROSIE · ONE YEAR · LOVED. Says he says it “badly”.');
    G.flag('toastDone'); G.close(); G.camReset();
    await G.stand('mara');
    G.thought('Walt folds the card twice and puts it in his shirt pocket, behind the pencil.');
  }

  async function cards(G) {
    await G.walkObj('mara', 'drawer'); await G.anim('mara', 'reachLow', .8);
    await G.walk('mara', 5.75, 5.4); G.set('cards', {out: true});
    G.face('walt', 'mara');
    await G.say('walt', 'Not… school.{1} Not today.', {expr: 'frown'});
    const c = await G.choose('', [{id: 'ok', label: 'Okay. They can go back.'}, {id: 'one', label: 'Any of them useful for Sunday?'}], M);
    if (c === 'one') { await G.say('walt', '{1.4}Hm.', {expr: 'neutral'}); G.thought('He fishes one card out of the pile: a birthday cake.'); await G.wait(1.6); await G.say('walt', 'This one.{1} For Sunday.{1} Cake I can point.', {expr: 'smile'}); }
    else { await G.say('walt', 'Thank you.', {expr: 'soft'}); G.set('cards', {out: false}); }
    G.close();
  }

  async function leave(G) {
    G.standNow('walt'); const w = G.actor('walt'); w.x = 2.4; w.y = 6.4;
    G.walk('walt', 1.6, 6.9); G.walk('june', 2.4, 7.4);
    G.face('mara', 'walt'); G.focus(['mara', 'walt', 'june'], 1.4);
    await G.wait(1);
    await G.say('june', 'Same time next week?', {expr: 'smile'});
    await G.say('mara', 'Same time.', {expr: 'smile'});
    await G.say('walt', 'Sunday.{1} I say it.', {expr: 'smile'});
    G.close();
    await G.think('She will hear about Sunday from June, probably in a voice note, probably with somebody crying in the background. Walt, or the baby.', {name: 'Mara'});
    G.close(); G.note('exploration');
    G.sfx('doorOpen'); G.set('frontDoor', {open: true}); await G.wait(.6);
    G.flag('waltDone');
  }
})();
