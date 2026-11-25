/* The optional Notebook: short pages on the ideas behind each scene. Never required to progress. */
'use strict';
BF.notebook = (() => {
  const FoB = '<i>Feelings of Being: Phenomenology, Psychiatry and the Sense of Reality</i> (Oxford University Press, 2008)';
  const EoD = '<i>Experiences of Depression: A Study in Phenomenology</i> (Oxford University Press, 2015)';
  const pages = {
    background: {title: 'The feeling of being somewhere', scene: 'Prologue and Chapter One',
      body: `<p>Most mornings you never notice the shape of your world. The kettle is for tea. The door leads to the bakery. Saturday is for walking. Things show up as worth doing, or not, before you think about them at all.</p>
      <p>The philosopher Matthew Ratcliffe calls this background <b>existential feeling</b>: a bodily sense of belonging to the world, of what is real and what is possible. It differs from emotions such as fear or joy, which are about particular things. Existential feeling shapes how everything shows up in the first place.</p>
      <p>Ratcliffe points out that we tend to notice this background only when it shifts. Noor’s morning is the kind that usually goes unnoticed.</p>`,
      refs: [`Ratcliffe, M. ${FoB}, chapters 1 and 2.`, 'Ratcliffe, M. “Existential feeling and psychopathology.” <i>Philosophy, Psychiatry, &amp; Psychology</i> 16(2), 2009.']},
    possibilities: {title: 'Things that invite you', scene: 'Chapter One',
      body: `<p>A wet brush invites the next stroke. A message invites a reply. A chalkboard outside a bakery invites you in. We meet the world as a web of possibilities that matter to us, and most of it never needs a decision.</p>
      <p>Ratcliffe ties existential feeling to this sense of possibility. The same door can offer a walk to one person and nothing in particular to another. The door has not changed. What it offers has.</p>
      <p>In Noor’s flat, almost everything invites something. Keep an eye on how objects present themselves later in the story.</p>`,
      refs: [`Ratcliffe, M. ${FoB}, chapter 4.`, `Ratcliffe, M. ${EoD}, chapter 2.`]},
    doorway: {title: 'From the doorway', scene: 'Chapter Two',
      body: `<p>From a doorway you can see a lot: drawn curtains, three mugs, a closed case, a lamp left on at noon. These are facts. What they mean to the person who lives there is something you can only learn from them, and only as much as they choose to share.</p>
      <p>Ratcliffe argues that understanding someone whose world has changed starts with an openness: setting aside the assumption that they live in the same space of possibilities you do. That openness is the beginning of understanding, and it leaves room to be wrong.</p>
      <p>Noor’s visit could end in several ways. None of them is a score.</p>`,
      refs: [`Ratcliffe, M. ${EoD}, chapter “Empathy as Exploration”, pp. 242–249.`]},
    time: {title: 'A future that opens and closes', scene: 'Chapter Three',
      body: `<p>Every plan assumes a future able to hold it. A date in a planner is a small bet that Saturday will be a Saturday you can live in.</p>
      <p>Ratcliffe describes how our sense of the future can change shape. It can feel crowded with possibilities that all seem close at once, with each idea pulling you into an exciting present cut off from longer plans. It can also feel distant, so that a date on the page connects to nothing you can imagine doing.</p>
      <p>Leena’s two recollections are hers, told in her words, about two different times in her life. She chooses whether to look at them. So do you.</p>`,
      refs: [`Ratcliffe, M. ${EoD}, chapter “Loss of Significance”, pp. 180–181, on drive, the present and the future.`]},
    sameDoor: {title: 'When possibilities change', scene: 'Chapter Four',
      body: `<p>Dele can open his door. He does, once. Nothing stops him from walking down to Ferro’s. The door is the same door Noor uses every day.</p>
      <p>Ratcliffe collected many first-person accounts of depression. A theme that recurs is a change in the <i>kinds</i> of possibility the world seems to hold. Things can still be done. What changes is whether anything shows up as mattering, or as able to change. One respondent wrote: <q>I could go anywhere and do anything and nothing for me would change.</q></p>
      <p>Ratcliffe also stresses that these accounts vary a great deal. Dele’s evening is one authored story, not a picture of how depression feels for everyone.</p>`,
      refs: [`Ratcliffe, M. ${EoD}, chapter “Eternal Incarceration”, p. 67.`]},
    hope: {title: 'Hope beneath hopes', scene: 'Chapter Four',
      body: `<p>Most hopes have an object: the bus coming on time, a friend saying yes. Ratcliffe distinguishes these from a deeper, background hope: a sense that the future holds possibilities for things to go well at all. Particular hopes take shape inside it.</p>
      <p>When that background shifts, a person can lose more than particular hopes. The sense that hoping makes sense can fade. This is why “it’ll get better” can land so strangely: it offers a hope with an object to someone for whom the ground of hoping has moved.</p>`,
      refs: [`Ratcliffe, M. ${EoD}, chapter “Loss of Hope”, pp. 109–110.`, 'Ratcliffe, M. “What is it to lose hope?” <i>Phenomenology and the Cognitive Sciences</i> 12, 2013.']},
    others: {title: 'Other people are part of what is possible', scene: 'Chapter Four',
      body: `<p>Mara’s messages arrive. Dele reads them. Whether they reach him is a different question.</p>
      <p>Ratcliffe argues that our sense of an open future is bound up with other people. Part of what makes a situation feel changeable is the anticipation that others could change it with us. In many accounts of depression, the loss of possibility and a felt loss of connection with people turn out to be the same change seen from two sides.</p>
      <p>That is one reason Mara keeps texting, and keeps her texts light.</p>`,
      refs: ['Ratcliffe, M. “The interpersonal structure of depression.” <i>Psychoanalytic Psychotherapy</i> 32(2), 2018.']},
    between: {title: 'Understanding happens between people', scene: 'Chapter Five',
      body: `<p>In Walt’s kitchen, understanding is something Mara and Walt build together: a pause, a pointed finger, a circle drawn in the air, a word written in pencil.</p>
      <p>Ratcliffe argues that most everyday understanding of other people does not come from privately working out their beliefs and desires. It comes from shared situations, from perceiving expression and gesture, and from talking things through.</p>
      <p>Speech-language pathologists use related ideas. <b>Supported conversation</b> gives a person with aphasia time, writes down key words, and checks meaning with yes-or-no questions, so the person’s competence can show. The <b>Life Participation Approach to Aphasia</b> puts the person’s own goals, such as a toast at a birthday, at the centre of therapy.</p>`,
      refs: ['Ratcliffe, M. <i>Rethinking Commonsense Psychology</i> (Palgrave, 2007), chapters 6 and 7.', 'Kagan, A. “Supported conversation for adults with aphasia.” <i>Aphasiology</i> 12(9), 1998.', 'LPAA Project Group. “Life participation approach to aphasia: a statement of values for the future.” <i>The ASHA Leader</i>, 2000.']},
    exploration: {title: 'Empathy as exploration', scene: 'Chapter Five',
      body: `<p>Ratcliffe describes empathy as a process two people carry out together. It begins with openness to difference, then moves through a shared, sometimes slow exploration of what the other person’s world is like.</p>
      <p>He draws on the psychiatrist Leston Havens, for whom entering someone’s world never means becoming them. You learn about their world, and you learn what you had been taking for granted in your own.</p>
      <p>An exploration can also stall, for example when the other person does not feel understood. That is part of it, too.</p>`,
      refs: [`Ratcliffe, M. ${EoD}, chapter “Empathy as Exploration”, pp. 242–249.`]},
    partial: {title: 'Understood, partly', scene: 'Outside Again',
      body: `<p>Noor never sees Dele’s evening. Mara will hear about Walt’s toast secondhand. Leena tells Noor exactly as much as she wants to. Everyone in this story understands everyone else partly.</p>
      <p>Ratcliffe rejects the idea that this makes understanding impossible. Empathy with a world unlike your own is possible, he argues, and it has limits. You can grasp something real about another person without being able to grasp, or describe, all of it.</p>
      <p>That is what the title means: the possibility of being understood without having to be understood completely.</p>`,
      refs: ['Ratcliffe, M. “Phenomenology as a form of empathy.” <i>Inquiry</i> 55(5), 2012.']},
    belonging: {title: 'A place among people', scene: 'Outside Again',
      body: `<p>People describe existential feelings in ordinary words: feeling at home, part of things, settled, out of place, cut off, far away. Ratcliffe collected many of them. They describe how a person finds themselves among things and among other people.</p>
      <p>A street can hold several of these at once. Each window on Linden Row has a different way of belonging to the same morning.</p>`,
      refs: ['Ratcliffe, M. “Existential feeling and psychopathology.” <i>Philosophy, Psychiatry, &amp; Psychology</i> 16(2), 2009.', `Ratcliffe, M. ${FoB}.`]},
    about: {title: 'About this story', scene: 'Always available',
      body: `<p>Every character in Being Found is fictional. Dele’s low period, Leena’s history with bipolar disorder, and Walt’s aphasia each belong to one invented person. Real experiences vary widely.</p>
      <p>Dele’s evening and Leena’s recollections are authored perspectives. They have not yet been reviewed by people with lived experience; that review is planned.</p>
      <p>If any of this touches something in your own life, it is fine to put the story down and talk to someone you trust.</p>`},
  };
  const people = [
    {id: 'noor', name: 'Noor', color: '#2a9d8f'}, {id: 'dele', name: 'Dele', color: '#c9921f'}, {id: 'mara', name: 'Mara', color: '#c4573a'},
    {id: 'leena', name: 'Leena', color: '#4f8a64'}, {id: 'walt', name: 'Walt', color: '#3c5f8a'}, {id: 'june', name: 'June', color: '#8a7bb0'},
  ];
  return {pages, people};
})();
BF.state.notebook.push('about');
