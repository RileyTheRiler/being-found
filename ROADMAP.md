# Being Found — Development Roadmap

**Status:** Active roadmap. Release 8.5.0 passed 29/29 Actions steps; 8.5.1 adds keyboard parity for repeated-input heavy actions and passed 30/30 GitHub Actions steps at commit `c97946c35495f58fbd26e1bbf0dabce485831118` (run 44269157774); no human pilot or assistive-technology validation has occurred. M0 regression baseline completed; 8.4.0 implements the guided narrative; 8.4.1–8.4.3 include initial textual desk reviews of all eight fictional residents. A local-only facilitator pacing readout is implemented. Human pacing, lived-experience validation and accessibility testing remain outstanding. Lived-experience consultation and classroom pilot remain outstanding. Browser validation is documented in `HANDOFF.md`.  
**Canonical repository:** `RileyTheRiler/being-found`  
**Baseline:** 8.3.11 on `main` before the 8.4 implementation. Read `HANDOFF.md` before any implementation.

## Product thesis

Being Found should be a **short, authored, replayable exploration of existential feelings and the possibilities a situation seems to offer**. It should help speech-language pathology learners notice the distance between **what an observer sees**, **what a fictional person reports**, and **what the learner assumes**.

It is **not** a diagnostic simulation or an experience of "what it is like to have depression/grief." The perspectives are fiction, not representative of every person with a given diagnosis. Players should leave with better questions and more humility, not a claim to have acquired somebody else's experience.

### Intended learning outcomes

After playing, the learner can:
1. Explain that an existential feeling structures how actions, relationships, time, and the surroundings *show up as possible*, beyond an isolated mood label.
2. Compare how an unchanged object/action may feel different across authored situations without interpreting it as laziness, weakness, or lack of motivation.
3. Separate observable behavior from inferred inner experience.
4. Choose a compassionate clinical response without assuming the clinician knows what the person feels.
5. Recognize variation within each person and across people; avoid one-to-one labels of diagnosis and experience.

## Product structure to keep

1. **Guided Story — primary/classroom experience.** Target a complete, cohesive 10–15 minute experience. Prioritize encounter, ordinary moments, difference in possibility, and reflection. Make a full playable ending, not a collection of disconnected mini-features.
2. **Rooms — optional exploration.** Preserve the current five flats, four client narratives, two encounters, and afterwards/Compare sections, but verify all are complete and comprehensible.
3. **Sandbox — optional explanatory tool.** Show the five variables and possibilities with clear caveats: an interpretive teaching model, not measured clinical dimensions.
4. **About / Sources — accessible context.** Ground interpretations in Ratcliffe and lived-experience research. Mark fictional voice clearly. Explain the game's limits without putting an instructional paragraph over the first scene.

### Current rendering decision

**Keep the existing illustrated side-scrolling / room-first implementation for the next milestones**, rather than rewriting in 3D or returning to isometric rendering now. The actual 8.3.8 implementation has a custom side-scroll corridor, room camera, object markers, sprite atlases, and working narrative interactions. The goal is a polished, coherent 2.5D editorial/cinematic presentation, not a change of game engine. Reconsider camera perspective only with comparative usability evidence after the vertical slice is stable.

## Review findings: actual 8.3.8 code

- `src/index.html` is a ~619 KB pinned base. `build.js` modifies it with numerous exact string replacements. This is brittle and should be reduced gradually, **not** rewritten all at once.
- `shell.css` contains substantial layers of `!important` overrides; `shell.js` relocates existing UI nodes, observes dynamic content and polls every 500 ms. This creates state/layout regression risk.
- `room.js` intentionally centralizes camera/room navigation selection, which is a valuable invariant. Keep one source for the visible room and active nav.
- Current game state is split between the base game's `localStorage` save and session-scoped story, dice, support and pattern data. Clarify which state survives reloads and unify save/version behavior intentionally.
- `dice.js` has a default-on d12 check system with selected authored branches; `difficulty.js` derives target modifiers from fictional situation variables, and explicitly rejects converting closed possibilities into open ones. Preserve this boundary. Test whether dice are educationally helpful or distract from the experience; make them clearly optional and consider off-by-default for the guided classroom route.
- `SAVE_NOTES.md` documents significant improvements in 8.3.8 (menu organization, responsive reading, Dele encounter and epilogue bug fixes). Do **not** discard these.
- `HANDOFF.md` explicitly leaves sound, real devices, screen readers, multiple residents at the stove, and Dele's phone hint line unverified.

## Prioritized milestones

### M0 — Stabilize and establish a reliable baseline (next)

**Goal:** Make 8.3.8 dependable before expanding the art or content.

Work:
- Build from clean source using `npm run build`; report the result.
- Run existing `menu_check.py`, `visit_check.py`, `dele_check.py`, `e2e_sync.py`, `test_later.py`, `test_prop_states.py` where the environment supports Chrome/Playwright.
- Capture screenshots and console errors across phone small (360×640), phone standard (390×844), tablet portrait (820×1180), tablet landscape (1180×820) and desktop (1440×900).
- Test guided story start-to-finish, five flats, each encounter, epilogue, Compare, Sandbox, back/continue, and saved-state resume.
- Address known untested areas: sound toggle, real-device behavior, keyboard focus and screen reader semantics, reduced motion, the Dele phone hint line, and interactions around shared stove.
- Introduce a concise QA checklist and automatic smoke tests for **navigation, open/close overlays, save/restore, pointer/keyboard input, scene transitions, and absence of duplicate controls**.
- Ensure build and test failures block a proposed production release. Confirm Vercel deploy status separately from GitHub pushes.

Acceptance:
- No known flow-blocking defect in the guided route or encounters.
- No active-room/navigation mismatch, inaccessible overlay, blocked choice button, horizontal overflow or console error on target viewports.
- A reproducible build and recorded QA report.

### M1 — Author one complete classroom vertical slice

**Goal:** Make the primary experience satisfying without requiring optional modes.

Suggested experience:
1. **Opening (brief):** a grounded, cinematic ordinary place; one line inviting observation, with Skip and reduced-motion support.
2. **Noor's morning:** an object, a possibility, a choice, an aftermath; let environment and narrative do most of the explanation.
3. **Encounter:** meet Dele through behavior and conversation *before* any explanatory framing. Include listening or silence as a valid response.
4. **Return / comparison:** revisit a familiar affordance or ordinary gesture, now recognizing that the same visible thing may have different significance.
5. **Debrief:** ask what was observed, what was inferred, and what remains unknown; then show a short Ratcliffe note and source link.

Retain the already authored routes; edit/gate only where required. **Do not imply every person's experience follows this sequence.**

Acceptance:
- A new player knows what to tap within the first 20 seconds.
- The guided route has one clear ending, no dead ends, and works on phone and tablet.
- The debrief tests a distinction between observation and interpretation, not memorization of a diagnosis.

### M2 — Phenomenological and narrative review

**8.4.1–8.4.3 progress:** Completed source-grounded desk passes on Dele, Wren, Ilse, Tomas, Mika, Walt, Ruth and Kai, including first-person accounts, visitor consent and non-deterministic interpretation. See `EDITORIAL_REVIEW.md`; these are **not** lived-experience reviews or M2 acceptance.

**Goal:** Prevent mechanics from making misleading claims about people.

Work:
- Inventory every condition/state label, fictional inner-voice passage, outcome, chance modifier, and informational popup.
- For each, note the author's intended phenomenon, relevant peer-reviewed/lived-experience source, and the risk of generalization.
- Audit failure/effort language: checks describe one situated attempt, **never someone's overall capability**; difficulty modifiers do not turn diagnosis into ability.
- Keep narration subjective, avoid universal statements and simple "do an activity → feel better" logic.
- Use a small review group that includes people with relevant lived experience; compensate reviewers where possible; give them an explicit correction process.
- Make authored uncertainty visible in optional reflection, not through intrusive caveats over every choice.

Acceptance:
- Each sensitive scene has a source note and editorial review record.
- No clinical scoring of people, compulsory "correct empathy" option, or deterministic diagnosis = difficulty mechanic.

### M3 — Visual, audio and accessibility coherence

**Goal:** Make the room, characters, sound and interactions feel like one product.

Work:
- Freeze the mobile/tablet/desktop UI system (one navigation control, one narrative card, predictable overlays, stable focus and readable text).
- Consolidate CSS ownership gradually; replace unnecessary `!important` overrides only after screenshots and interaction tests.
- Make sprite scale, feet/contact points, walk cycles, furniture occlusion, camera tracking, and tap markers consistent across flats and visits.
- Add restrained ambient/situational audio only after explicit sound testing. Provide mute and independent volume control, preserve reduced-motion and accessibility preferences; avoid treating sounds as a literal reproduction of diagnosis.
- Use progressive enhancement: the experience stays understandable with no audio.

Acceptance:
- No overlay collisions or missing readable UI at tested viewports, and the character/object staging looks intentional.
- Keyboard and screen reader can complete the critical path.
- Audio never hides narrative information or autoplays unexpectedly.

### M4 — Sustainable codebase

**Goal:** Reduce regression risk without a hazardous ground-up rewrite.

Work:
- Establish explicit state/action interfaces for story, room camera, menu, modal, save and dice.
- Replace fragile HTML text patches in small batches with stable source anchors or extracted modules, each backed by functional parity tests.
- Untangle multiple MutationObservers / polling loops where event-driven updates are feasible.
- Introduce fixtures for scripted story decisions and save migration; make reload behavior consistent and documented.
- Add CI checks for build + smoke tests and preview deploy for changes. Ship finished milestones, not unverified mixed batches.

Acceptance:
- New story/content changes can be made without modifying old HTML string fragments in `build.js`.
- Regression suite proves the same story actions, outcomes, and UI state across refactors.

### M5 — Classroom pilot and revision

**8.4.4 preparation:** Retains local-only chapter timing and adds an anonymized pilot data sheet, a non-graded concept rubric, facilitator script, manual accessibility checklist and local summary tool. No participants tested or 10–15 minute completion time established.

**Goal:** Verify learning and usability, not merely aesthetic appeal.

Ask classmates to play independently, then check:
- Can they describe the distinction between mood and the background sense of what is possible?
- Can they separate what they saw from what they inferred?
- Do they avoid treating a fictional experience as exhaustive of a diagnosis?
- Did any UI failure or mechanic prevent attention to the story?

Collect completion, blockers, comprehension, and open-ended feedback (not only an "empathy score"). Revise based on observed errors. Expand to other flats only after the guided path works.

## Immediate first implementation batch (proposed 8.3.9)

1. Add reproducible build/smoke testing and a viewport screenshot baseline.
2. Audit save-and-resume behavior and modal/room state synchronization.
3. Fix reproducible top-priority blockers from `HANDOFF.md`.
4. Keep all story branches, current artwork and menus intact. No perspective or engine rewrite.
5. Update `SAVE_NOTES.md`, verify the build/test results, and push the commit.

## Change workflow

Read `HANDOFF.md` first for **every** update. Edit the GitHub repository source. Make small, named changes; run the available tests; push every completed update; report commit, test results and untested items. A push is not proof of a Vercel deployment.

## Research starting points

- Ratcliffe, *Feelings of Being* (2008), existential feelings: https://doi.org/10.1093/med/9780199206469.003.0002
- Ratcliffe, *The interpersonal structure of depression* (2018): https://doi.org/10.1080/02668734.2018.1455729
- Ratcliffe, *On feeling unable to continue as oneself* (2024): https://doi.org/10.1111/ejop.12958
- Nario-Redmond et al., *Crip for a day: The unintended negative consequences of disability simulations* (2017): https://pubmed.ncbi.nlm.nih.gov/28287757/
- Meta-analysis of mobility disability simulation attitudes (2022): https://doi.org/10.1371/journal.pone.0269357

**Editorial rule:** Evidence informs design but does not validate a fictional character as a universal patient portrait. In particular, disability-simulation findings are relevant cautions, not direct experimental evaluations of Being Found.
