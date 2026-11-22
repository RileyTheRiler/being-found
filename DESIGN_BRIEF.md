# Being Found: design brief

**What this file is.** The stable design reference for Being Found: what the game is for, the rules it keeps, the Ratcliffe ideas it relies on, and which design questions are decided or still open. It changes only when a design decision changes. It holds no release facts (commit IDs, test counts, PR status, deployment state). For those, read `HANDOFF.md` and `CURRENT_STATE.md`.

**Owner.** Riley Reso decides design questions. Agents propose options and implement decisions; they do not settle open questions on their own.

**Last design change:** 2026-11-22 (first version).

## How agents use this file

- Read it after `HANDOFF.md` and before any change to story text, mechanics, characters, UI wording, reflection prompts or pilot materials.
- Cite IDs in PR descriptions: outcomes (L1 to L4), rules (R1 to R5), grounding (G1 to G12), decisions (D-xx).
- If a change would break a rule, stop and ask Riley. If it depends on an open decision, ask before building it. Build a labelled prototype branch only when Riley asks for one.
- When Riley rules on an open decision, move it to "Decided" with the date and PR number, in the same PR that implements it.
- Keep release facts out of this file. Keep design rationale out of `HANDOFF.md`.
- Attribute to Ratcliffe only what section 4 sources. The five colored kinds of possibility, the five Sandbox variables, "friction", the marker state names and every character are this project's constructions.

## 1. Thesis

Being Found is a short, authored, replayable narrative for speech-language pathology learners. Its rooms stay physically the same while what they offer a person changes: what shows up as worth doing, reachable, shared, open to change or threatening. The game then asks the learner to meet people whose experience they cannot see, and to learn about it the way a clinician has to: by observing, asking, offering communication access and accepting the answer.

It is teaching fiction. It does not simulate a diagnosis, measure anyone or prove that playing builds empathy.

## 2. Learning outcomes

A learner who finishes the Guided Story can:

- **L1. Separate ability, wanting and felt possibility.** Explain how a person can know how to do something and want to, while the activity no longer shows up as possible for them, and why that differs from laziness or low motivation. (G1, G4, G5)
- **L2. Keep four kinds of information apart:** what they observed, what the person communicated, what they inferred and what remains unknown. A third-party report counts as a report, separate from anything they observed. (R4)
- **L3. Choose a next step with the person:** ask, offer a communication channel, wait or end the encounter, guided by the person's stated preference. (R2, G7)
- **L4. Treat "unknown" as the start of an exploration.** Name what they would ask next, and recognize that asking can produce real, partial understanding. (G7)

**Current gaps.** The required route teaches L2 and L3. It barely reaches L1, because nothing in it shows a sense of possibility shifting (G2, D-01). The final reflection has no prompt for L4 (D-02).

## 3. Rules

R1 to R5 are the five invariants in `DESIGN_GUARDRAILS.md`, with the same numbers and meaning. This table adds where each is checked. Automated checks prove software behavior only; the last column lists what needs people.

| Rule | In practice | Automated checks | Needs people |
|---|---|---|---|
| **R1 No privileged access** | No color, state, score, room view or choice certifies a person's private experience. Authored first-person text is labelled as authored, or as a story the character chooses to tell. Debriefs report only what the player saw or was told on that branch. | `qa_consent_branches.py`, `qa_guided84.py`, `qa_leena.py` | Pilot: do players treat authored text as a patient report? |
| **R2 Resident agency and consent** | Residents control disclosure, can refuse and can end a visit. Leaving, or being asked to leave, is a complete ending. No disclosure is a reward for the "right" question or a finished checklist. | `qa_consent_branches.py`, `qa_guided84.py`, `qa_leena.py` | Lived-experience review: do refusals read as respected? |
| **R3 Equal input effort** | A character's difficulty never becomes the player's motor difficulty: no required holds, multi-taps, dice or mood-based speed on the guided route or in pilot mode. Reduced motion removes waits and keeps meaning (Walt's word-search time stays). | `qa_route_no_capability.py`, `qa_speed_parity.js`, `qa_flags.js`, `qa_reduced_motion_walt.py`, `qa_reduced_motion_fade.py`, `qa_title_focus.py`, `qa_axe.py` | Physical VoiceOver, TalkBack, switch access and zoom |
| **R4 Clinical uncertainty** | Third-party report, observation, the person's communication, inference and next action stay visibly distinct. Communication access and stated preference come before assumptions about motivation or diagnosis. | `qa_guided84.py`, `qa_leena.py` | Pilot: do learners keep Mara's report apart from Dele's words? |
| **R5 Evidence limits** | No character, state or variable stands for everyone with a condition. Sources motivate and constrain scenes; they cannot validate an invented person. | `qa_editorial.py` | Compensated lived-experience review |

## 4. Ratcliffe grounding

Each entry gives the idea, the source, what the design needs and what it rules out. Page numbers refer to the copies in Riley's Ratcliffe project.

**G1. Existential feelings.** A background sense of reality and belonging that shapes all experience. Each is at once a bodily feeling and a way of finding oneself in the world, and none is about a specific object. *Source:* Feelings of Being (2008), Introduction and ch. 1. *Needs:* scenes that change how many things show up at once, with narration that carries the bodily side (heaviness, distance, being on edge) in the character's own words. *Rules out:* treating an existential feeling as a mood label, and carrying its bodily side through the player's controls (R3).

**G2. Shifts make it visible.** Existential feelings are most open to reflection when they shift, because the background becomes conspicuous in its absence. *Source:* Feelings of Being, ch. 1. *Needs:* at least one contrast inside the required route. *Rules out:* relying on one baseline (Noor) to teach the concept. See D-01.

**G3. No single normal.** There is no one constant "natural attitude"; existential feelings vary subtly between people and over time. *Source:* Feelings of Being, Introduction. *Needs:* Noor framed as one orientation among many. *Rules out:* "normal" versus "broken" labels or visual coding.

**G4. Kinds of possibility depend on each other.** Depression can remove whole kinds of possibility, such as the possibility of significant change, as well as particular ones. Ratcliffe adds that these kinds are interdependent and cannot be adjusted one at a time. *Source:* Experiences of Depression (2015), ch. 2, pp. 54-55. *Needs:* states that apply to a kind (as `STATES.sealed` already does: "the whole kind has dropped out"), presented as one connected structure. *Rules out:* describing the five kinds or the Sandbox variables as independent dials whose total is the experience. See D-03.

**G5. Felt impossibility differs from inability.** A person can experience something as utterly impossible and then do it with ease when coaxed into it. *Source:* "The interpersonal structure of depression" (Psychoanalytic Psychotherapy, 2018), section 6. *Needs:* L1. *Rules out:* capability penalties as a stand-in for depression (R3).

**G6. Possibility has an interpersonal structure.** How a person anticipates others (trust) shapes which possibilities the world offers. Connection sits at the center of depression care, and some possibilities make sense only once trust returns. *Sources:* "The interpersonal structure of depression" (2018); Ratcliffe, Ruddell and Smith, "What is a 'sense of foreshortened future'?" (Frontiers in Psychology, 2014). *Needs:* other people as part of what opens or closes a scene. *Rules out:* claims that support causes recovery (see Mika).

**G7. Empathy as second-person exploration.** Radical empathy means engaging with someone's experience while suspending the assumption that both people share the same space of possibilities. That openness starts a collaborative exploration with the person, which can yield real, partial understanding. One empathizes with a person, placing their experiences within their life; replicating an isolated experience falls short. Ratcliffe rejects the sceptical claim that such understanding is impossible. *Sources:* Experiences of Depression, ch. 9, pp. 242-249; "Phenomenology as a Form of Empathy" (Inquiry, 2012), p. 487. *Needs:* encounters first, voluntary first-person accounts, and a reflection that ends in a next question. *Rules out:* an authored inner day as the reward for a visit (R1, R2), and any lesson that nothing can be known (L4).

**G8. Interaction over simulation.** Theory and simulation accounts picture understanding as an observer inferring hidden states. Ratcliffe argues that most understanding happens in second-person interaction within shared situations. *Sources:* Rethinking Commonsense Psychology (2007), "The Second Person", pp. 177-178; Feelings of Being, chapter on the Capgras delusion. *Needs:* the game's teaching value to come from staged encounters. This settles the simulation paradox: the guided route stages encounters and claims no simulation. *Rules out:* text or UI that promises to put players "in someone's shoes" or let them "experience" a condition.

**G9. Grief.** After a death, a person's world stays organized around the one who died, in tension with their explicit knowledge of the death, and reorganizes over time. Continuing bonds are common and varied, with no clear end point; no type of bond is reliably helpful or harmful. *Sources:* Grief Worlds (2022), ch. 6, pp. 143-150; Real Hallucinations (2017), ch. 7.4. *Needs:* Tomas's habits that still expect Ines, and an uneven path. *Rules out:* stages, timelines and "moving on" as the goal.

**G10. Hope.** Feeling hopeless about something differs from losing the capacity to hope. *Source:* Experiences of Depression, ch. 4 (summary on p. 11). *Used in:* Mika's two Augusts note.

**G11. Depersonalization.** The body can be an object of experience, the medium of experience or a background sense of being, and depersonalization changes these in different ways. *Source:* Colombetti and Ratcliffe, "Bodily feeling in depersonalization" (Emotion Review, 2012). *Used in:* Wren.

**G12. Psychosis and the shared world.** Psychosis can involve estrangement from the public, shared world, which changes how a person believes as well as what they believe. Delusional atmosphere and trust belong to this picture. *Sources:* "The interpersonal world of psychosis" (World Psychiatry, 2015); Real Hallucinations, ch. 5.1. *Used in:* Ilse and Jun's call.

**Method note.** Ratcliffe built Experiences of Depression partly on first-person questionnaire accounts (Preface; ch. 1). A character's voluntary account in their own words therefore follows the theory's own method, provided R1 labelling holds.

## 5. Structure

- **Guided Story (required classroom route):** optional field notes, then Noor's morning (one practical and one enticing action), Dele at his door (encounter with four tested endings), Walt's session (clinical encounter), and a final reflection on a new vignette followed by an optional Ratcliffe note. No score.
- **Rooms (optional):** nine flats: Noor, Tomas, Dele, Wren and Ilse, plus clinic flats Mika, Walt, Ruth and Kai. Visits and Compare live here. Legacy mechanics still run here outside pilot mode (D-04).
- **Leena (optional):** a separate library story in its own module. Not a flat; no save-schema change.
- **Sandbox (optional):** the invented resident Ari and five designed variables. An explanatory model, never a measurement (D-03).
- **About and Reflect:** sources, terms and body check-ins.
- **Pilot mode (`?pilot=1`):** `flags.js` blocks capability mechanics everywhere and ignores developer overrides.

## 6. Characters

No character has had lived-experience review as of 2026-11-22. Desk reviews are in `EDITORIAL_REVIEW.md` and `LEENA_EDITORIAL.md`.

**Noor** (Guided 1; flat 1). Shows a background of possibility that works without being noticed: breakfast, the easel, Jo's call about Saturday, Dani home at six. Small setbacks (a stuck egg) change details and leave the background intact. *SLP link:* what ordinary participation rests on. *Must not imply:* a norm that others fall short of. *Grounding:* G1, G3.

**Dele** (Guided 2 at his door; flat 3 authored day). In the guided route the player has Mara's third-party report, then Dele himself, who may talk, stay silent, set a boundary or end the visit. Rooms holds one authored depressive day, labelled as authored. *SLP link:* reading reduced participation without assigning a motive. *Must not imply:* that depression equals inability, that silence equals hopelessness, or that a good question unlocks his inner life. *Grounding:* G4, G5, G6, G7.

**Walt** (Guided 3; flat 7). Age 68, anomic aphasia eleven weeks after a stroke; a woodwork teacher and family storyteller who wants to give a wedding toast. Partners who finish his sentences replace his message. His preferred support changes with fatigue (time first, a first sound, a written word, a confirmation question). *SLP link:* supported conversation (Kagan, 1998), communication partner training, and participation goals in the sense of the ICF (WHO, 2001) and the Life Participation Approach to Aphasia (LPAA Project Group, 2000). *Must not imply:* that structured naming practice is an empathy failure (D-06), that word-finding latency is a chosen silence, or that one cueing hierarchy fits everyone. *Grounding:* G7.

**Tomas** (flat 2). Ines died five weeks before his first scene, and his habits still expect her. Scenes run at five weeks, four months, thirteen months and her birthday near fourteen months, when longing returns sharply. His friend is Bea. *SLP link:* functional participation does not show whether someone has "moved on". *Must not imply:* stages, a timeline or forgetting as progress. *Grounding:* G9.

**Wren** (flat 4). Depersonalization and derealization: she knows the face in the mirror is hers and it still feels unfamiliar. *SLP link:* a competent performance does not show whether someone feels present. *Must not imply:* that a grounding moment is treatment, or one cause for her checking. *Grounding:* G1, G11.

**Ilse** (flat 5). Ordinary things feel charged with significance she cannot name (delusional atmosphere). Jun's reassuring call is hard for her to read; her partner is Marek. *SLP link:* offering control, such as where the visitor sits, makes conversation more predictable. *Must not imply:* danger, a fixed delusion or one psychotic trajectory. Sound, tilt and color never outrank what Ilse says. *Grounding:* G12.

**Mika** (flat 6; clinic encounter). Age 10, transgender, goalkeeper for the Comets. A fictional composite law excludes her from the team and unsettles her care. She has seen the school SLP for /s/ and /r/ since first grade. Two authored Augusts under the same law: in one, adults withdraw; in the other, Coach Abby, Zoe and a teacher keep things open. *SLP link:* scope of practice (ASHA counseling practice portal): notice, listen, use her name, tell the family what you see and refer. *Must not imply:* that the two Augusts show cause and effect, or that transgender children are depressed. Her flat defaults to the "depleted" attunement used for Dele (D-05). Outside pilot scope; needs specialist review before classroom use. *Grounding:* G6, G10.

**Ruth** (flat 8). Age 57, librarian and alto; ALS with mixed spastic-flaccid dysarthria. Language and thinking are unaffected in this profile only. A barista talks loudly, or talks to her partner Ben instead of her. She chooses whether to bank her voice, and later speaks through a personal or a stock synthetic voice, texting, a letter board and AAC. *SLP link:* partner behavior and AAC as routes to participation (Cave and Bloch, 2021). *Must not imply:* intact cognition in all ALS, one right banking decision, or that AAC fixes partner timing. *Precision note:* her recorded lines ("I love you", "Leave it, Ben") are closer to message banking; a personalized synthetic voice is voice banking. The scene could name both.

**Kai** (flat 9). Age 15, autistic, loves transit maps. After a demanding school day he can answer his father aloud, type, gesture or come back later, and all four count as communication. Rocking, humming and headphones are useful to him (Kapp et al., 2019). *SLP link:* spoken compliance differs from communicative choice. *Must not imply:* one sensory profile, an obligation to speak or a fixed recovery time. His flat starts at the "rooted" attunement, like Noor's.

**Leena** (optional library story). An adult library worker who may choose to say she lives with bipolar disorder and, with permission, tell two dated recollections. The debrief reports only what the player saw or heard, which makes her module the reference pattern for R1. *SLP link:* none stated yet (D-07). *Must not imply:* a subtype, an episode timeline or treatment claims.

## 7. Decision log

### Decided

| ID | Date and source | Decision | Grounds |
|---|---|---|---|
| D-A1 | 2026-11-19, 8.5.2 (PR #3) | The guided route never enters Dele's authored day. That day stays in Rooms, labelled as authored. The guided controller still contains an unreachable `stageRoom` / `roomgo` path; remove it or cover it with a test. | R1, R2, G7 |
| D-A2 | 2026-11-19, 8.5.2 | No dice, holds, multi-taps or mood-based speed on the guided route or in pilot mode. | R3, G5 |
| D-A3 | 8.5.2 | The guided route hides the five-variable readout. | R1, G4 |
| D-A4 | 2026-11-21, 8.5.4 (PR #19) | Debriefs report only what the player saw or was told on that branch. Speaking with a resident never requires a checklist first. | R1, R2 |
| D-A5 | 8.4.0 to 8.4.4 | No score or empathy grade. Reflection answers stay in the browser session unless the learner copies them. | R5 |
| D-A6 | ROADMAP.md, ANIMATION_ARCHITECTURE.md | Keep the 2.5D room-first renderer. No engine rewrite before the pilot. | Access and consent stability |
| D-A7 | 2026-11-21 (PR #18) | Leena is a separate module, not a tenth flat, with no save-schema change. | Save compatibility |
| D-A8 | 8.4.3 desk review (`EDITORIAL_REVIEW.md`) | Mika's law is a fictional composite and describes no real state's law. Her two Augusts make no causal prediction. | R5 |

### Open (Riley rules)

**D-01. How does the required route show a shift in felt possibility?** (G2, L1)
- (a) A second authored Noor day in which the same room offers less. `CURRENT_STATE.md` prefers this. It shows the shift directly, but repeats the access the player has to Noor.
- (b) Dele, if he chooses, describes in his own words how things seem to him, following Leena's voluntary-account pattern. This keeps the second-person stance (G7, method note), but tells the shift rather than showing it.
- (c) Both.
- Constraints: R1, R2, R3.

**D-02. Add a reflection prompt for L4.** For example: "What did you understand from what the person told you, and what would you ask next?" (G7)

**D-03. The Sandbox model.** (a) Keep five independent sliders and add a note that the kinds depend on each other; (b) replace free sliders with whole-orientation presets; (c) link the variables so a change in one moves the others. (G4)

**D-04. Legacy mechanics in Rooms outside pilot mode** (dice, holds, sealed styling, mood-based speed). Remove them, label them as experimental design history, or keep them until pilot evidence comes in. Pilot mode already blocks them. (R3, G5)

**D-05. Diagnosis-first labels.** The flat picker shows a `dx` line under each clinic resident's name (for example "Age 15 · autistic"), and Mika's flat defaults to "depleted". Options: lead with the person (role, interest) and move the label to About; change Mika's default attunement. (G3, R5)

**D-06. Walt and naming practice.** The Rooms visit offers "Set daily naming flashcards" as the outsider option and narrates the cards as a test he expects to fail. The guided encounter offers picture cards alongside asking what he would rather say. Decide whether to add a path where naming practice is chosen with Walt toward a goal he names, such as the toast. (L3, LPAA)

**D-07. Leena's role.** Decide her SLP connection, if any, and whether she stays outside pilot scope.

**D-08. Pilot materials.** `CLASSROOM_PILOT.md` (8.4.4) still asks observers about Dele's authored day and heavy holds, which the guided route no longer contains. Update it to the current route and add an L1 probe, such as: "Can someone know how to do something, want to, and still not find it possible? Use an example from the game."

**D-09. Reading load.** The 10 to 15 minute target is unmeasured. The 8.5.1 review counted roughly 2,200 to 2,900 words on a minimal guided path against an 1,800-word target. Recount, then decide what to cut. Per `ROADMAP.md`, cut repeated explanation before agency or meaningful silence.

### Rejected

| ID | Proposal | Reason |
|---|---|---|
| X-1 | Randomly assign diagnoses to world parameters for replayability | Arbitrary pairings replace authored, reviewed cases (R5) |
| X-2 | Self-rated empathy as a pilot outcome | Invites socially desirable answers; a five-person pilot can find barriers and cannot show effects |
| X-3 | Full runtime 3D rewrite before the pilot | Risks the access and consent behavior (D-A6) |

## 8. Priorities

Work on the route the pilot uses first.

1. Fix anything in the guided route that breaks R1 to R5.
2. Rule on D-01, D-02 and D-08. Without them a pilot cannot test L1 to L4.
3. Human checks for the guided route: compensated lived-experience review of Dele (depression) and Walt (aphasia), physical assistive-technology testing, then a formative pilot with about five first-time learners (`CLASSROOM_PILOT.md`). Confirm institutional review first if results may be shared as research.
4. Then optional content: D-03 to D-07, Leena's review, art and animation.

New characters or conditions wait for pilot findings.

## Related files

- `DESIGN_GUARDRAILS.md`: normative wording of R1 to R5, mode boundaries, review process
- `ROADMAP.md`: product thesis history and milestones
- `EDITORIAL_REVIEW.md`, `LEENA_EDITORIAL.md`: scene-by-scene desk reviews and citations
- `CLASSROOM_PILOT.md`, `pilot/`: pilot protocol and blank instruments
- `ANIMATION_ARCHITECTURE.md`: renderer and rig decisions
- `HANDOFF.md`, `CURRENT_STATE.md`: current release facts
