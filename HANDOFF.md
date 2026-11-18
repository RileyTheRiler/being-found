## Character walking and sofa depth — merged November 18, 2026

**Main implementation:** `d290672bb85a14c8db5b6a31449ed929f342e796`, [PR #5](https://github.com/RileyTheRiler/being-found/pull/5) merged. Pre-merge [GitHub Actions run 44414001551](https://github.com/RileyTheRiler/being-found/actions/runs/44414001551) completed **32/32 successful steps**, including the desktop and phone `qa_character_motion.py` test. Vercel production deployment `dpl_DadtbP9LcVVDYBnw8pmTjcHKE7gs` is `READY` on the same code commit, with `being-found.vercel.app` assigned.

- Three modeled residents' six-frame walking cycles follow actual scene-space travel distance and left/right direction, rather than relying on a disconnected pose clock. Reduced-motion disables stepping animation.
- The 2.5D sofa's front apron now renders behind a passing walker and in front of a truly seated lap. The main seated actor and seated visitor/NPC share the illustrated sofa at aligned cushion positions; seated NPCs appear in visits.
- `qa_character_motion.py` is part of local `npm run qa` and CI. It checks walking direction and frame progress plus Noor, Tomas and Dele seated states at 1440×900 and 390×844, with screenshots in CI artifacts.
- **Not yet independently validated:** detailed real-device/assistive-tech animation review, manual image-based validation of all seating frames, and human usability testing. The authored character sprite atlases were not regenerated.
- The unfinished consent-safe gameplay work remains separate in draft PR #3.

## Desktop opening and classroom reading pass — review branch (November 18, 2026)

**Branch:** `fix/desktop-guide-and-opening` (separate from draft 8.5.2B PR #3). Built on `main` commit `6902786f42b5862cd32a9b087ecbb7775ce433e1`. **Not merged or deployed.** Version and narrative mechanics remain 8.5.1.

- The ~31-second prologue already existed. It auto-launched only when `beingfound.opening.v1` had not been set, reduced motion was off and `noopening` was absent. On revisits, replay was buried under the title's other-options disclosure. The title now exposes a direct **Watch the animated opening (30 seconds)** control, and finishing/skipping updates `LWPrologue.seen` in the current tab.
- On wide landscape desktop (>=1300px), `syncGuide()` now puts the classroom Guide **below** `#result` inside `#dock`, preventing the floating overlay from obscuring room art. The previously existing tablet-landscape and narrow-screen behavior remains.
- `room.js` derives `data-bf-other-room` markers from the same `currentSection()` used by tab ARIA state. Desktop inactive-room markers fade without losing pointer or keyboard access; active/target/ringing markers retain emphasis.
- `qa_smoke.py` now exercises prologue replay and skip, Guide containment and synchronized marker room flags at 1440×900.
- The black circular icon at the right edge of the supplied screenshot is **not yet identified in the running DOM**; no speculative removal was made. Check in an extension-free browser and identify its owner before editing.
- Pending: GitHub Actions green on the review branch, direct browser visual review, real-device/assistive-tech tests, eventual rebase after 8.5.2B. Do not claim these changes are live at `being-found.vercel.app` until merged and deployment verified.

## Vercel production hosting repair — November 18, 2026

**Verified public URL:** https://being-found.vercel.app/ (independent page fetch returned title `Being Found 8.5.1`, not 404). The second assigned domain `https://being-found-rileys-projects-5252c03b.vercel.app/` also returned the game title.

**Root cause of 404:** Previous Vercel deployments uploaded nested source trees (`src/src/...`) with build logs showing `Build Completed ... [69ms]` and **no `npm run build`**, leaving no deployed root `index.html`. Their `READY` status did not mean the website was correctly built.

**Correction:** Updated the existing project `being-found` (`prj_DyoE8rtjWrJeGBJxDFrDflEmvGkT`) to use repository-root build, `npm run build`, `dist` output and framework `null`; then created a **production** deployment via Git source `RileyTheRiler/being-found`, ref `main`, commit `b7c8e15b44500faaafde3bdd923be66c4030a6ae`. Deployment `dpl_GcMZaVbDFbVrJ2BbCLTBuzC94dQf` reached `READY`; build logs printed `Being Found 8.5.1 built: 628647 bytes` followed by `postbuild.js` output. Vercel assigned `being-found.vercel.app`.

**Release caution:** This publishes only the verified `main` branch's **8.5.1 gameplay with 8.5.2A foundation**. Draft 8.5.2B PR #3 is not in production. Later GitHub pushes should still be checked against both GitHub Actions and a new Vercel production deployment; a successful Actions run or Git push alone is not proof of live deployment. Do not re-upload source with nested `src/` as a Vercel static output.

## 8.5.2A foundation — merged and PR checks passed (November 18, 2026)

Merged PR [#1](https://github.com/RileyTheRiler/being-found/pull/1) to main as `4fa9fc5d4145f422d434fb4557700299ef406a0d`. PR GitHub Actions [run 44342886769](https://github.com/RileyTheRiler/being-found/actions/runs/44342886769) completed successfully. Post-merge production deployment and separate main-branch workflow status are not asserted.

This adds `DESIGN_GUARDRAILS.md`, flags infrastructure, local-only/non-pilot overrides, fail-closed pinned source loading, `qa_flags.js`, `qa_all.py` and `npm run qa`. **Game mechanics remain 8.5.1. The flags are not yet wired into guided dice, holds, speed, sealed options or visit logic.** No human pilot has occurred.

**Next:** implement [issue #2](https://github.com/RileyTheRiler/being-found/issues/2) (8.5.2B) on a new branch, starting with explicit Dele exit/permission outcomes and full branch regression. Then connect flags to guided controls and remove apparent privileged world-reveal/answer-key logic. Read `AGENTS.md`, `DESIGN_GUARDRAILS.md`, `ROADMAP.md`, `SAVE_NOTES.md`, `EDITORIAL_REVIEW.md`, and `CLASSROOM_PILOT.md` before changing behavior.

## 8.5.2A foundation branch — implementation pending CI

Branch: `feat/8.5.2a-foundation` from reviewed main `9030ecb2`. Version remains **8.5.1** until the gameplay release is verified. No guided mechanic, dialogue, or encounter behavior has changed in this branch.

- `DESIGN_GUARDRAILS.md` defines five educational invariants and pilot release gates.
- `flags.js` creates dynamic `BFFlags` getters; `build.js` loads it first. The flags have **no behavioral consumers yet**. `qa_flags.js` tests defaults, route entry/exit, allowed localhost overrides, and pilot isolation. Do not claim dice, heavy input, speed, world swap, or sealed controls are fixed yet.
- `build.js` now refuses to build when `src/index.html` is missing; no fetching the latest hosted HTML.
- `npm run qa` builds and runs an explicit `qa_all.py` manifest, starting/stopping a local server if needed. Existing `quality.yml` regression steps remain in place; it also checks `qa_flags.js` and the manifest.
- CI status is **not established** until the PR workflow passes. No human pilot, accessibility device test, or lived-experience review has occurred.

**Next bounded change (8.5.2B):** wire the flags into Guided Story, use explicit Dele encounter exit/permission outcomes (including `depart` before entering), remove the epilogue's privileged world-reveal and answer-key structure, and add an end-to-end branch matrix before proposing release 8.5.2.

# Being Found 8.5.1: repeated-input accessibility and pilot readiness

## Run it
    npm run build        # node build.js && node postbuild.js, no dependencies to install
    python3 -m http.server 8770 --directory dist
    open http://127.0.0.1:8770/index.html

## Layout
- `src/index.html`: pinned 6.7 base. `build.js` applies about 30 string patches and links the overlay modules
  (art, cinema, dice, difficulty, interaction, movement, navigation, patterns, room, sprite_rig, story, sync, ui).
- `postbuild.js`: strips release labels, links the shell files into `dist/`
  (`shell.js/css` -> `bf83.js/css`, `phase2.css` -> `bf835.css`, `phase3.css/js` -> `bf837.css/js`).
- `shell.js` / `shell.css`: 8.3.8 work: menus (Story, Rooms, Sandbox, About), world drawer, Reflect button, story reveal.
- `room.js`: camera, markers, navigation; `sprite_rig.js` + `assets/`: sprite atlases (the `.glb` rigs build them).
- `SAVE_NOTES.md`: step-by-step log through Step 15 and verification. `README.md`: project readme.

## Checks (Playwright for Python, Chrome, server on port 8770)
GitHub Actions `.github/workflows/quality.yml` builds the site and runs regression checks on each push. See [Actions](https://github.com/RileyTheRiler/being-found/actions). On a clean local copy:
```sh
npm run build
python3 -m http.server 8770 --directory dist
# In a second terminal:
python3 qa_smoke.py                 # five viewport smoke check
python3 qa_save_resume.py           # persistent save, sandbox, reload and continue
python3 qa_focus.py                 # Reflect modal isolation, focus and return focus
python3 qa_audio.py                 # opt-in WebAudio, volume and mute
python3 qa_flats_stove.py           # every resident's stove menu; Dele mobile story hint
python3 qa_guided84.py              # guided chapters, Dele silence, debrief, reduced motion
python3 qa_access85.py              # keyboard Guide and reduced-motion field scroll
python3 qa_heavy_access.py          # three activations with keyboard/pointer and accessible action status
python3 qa_editorial.py             # authored source and compiled text guard
python3 qa_js_syntax.py            # parse source and generated JavaScript
python3 qa_wren_ilse.py            # runtime narrative and viewport assertions for both flats
python3 qa_remaining_scenes.py     # runtime text/viewport guard for remaining five residents
python3 menu_check.py
python3 test_prop_states.py
python3 e2e_sync.py 390x844
python3 test_later.py 390x844
python3 dele_check.py
python3 visit_check.py
```
Python Playwright is required. Browser executable auto-detects `google-chrome` or `chromium`; override with `BF_CHROME`. Screenshots go to `qa-artifacts/` by default. Legacy test snapshots from `e2e_sync.py` and `test_prop_states.py` are written to the repository root and ignored by git.

## Release 8.5.1 — heavy-action input parity (verified 30/30)
- Preserve **the same pointer hold and three-activation action rule** and all state, action outcomes and save behavior. For keyboard and assistive-tech generated clicks, use the existing three-activation path instead of starting a 1.3-second hidden timer. Return focus to the originating room marker after action-menu dismissal when focus was inside the menu.
- Expose the transient instruction as a polite accessibility status and describe heavy actions as an authored input cue, not a motor test. Add `qa_heavy_access.py` for keyboard and pointer input; source/build text guards and a dedicated CI step check the behavior. Manual switch/TalkBack/VoiceOver testing remains necessary.
- Fixed the nested `package-lock.json` version left at 8.4.4 by the prior release script; package and lock entries now both read 8.5.1. The production build still succeeded in 8.5.0, but version metadata should be consistent.
- **CI diagnostic:** the first 8.5.1 implementation `4a6625a62e06956da68dd66cebfc9b6efdbc9c49` failed at `npm run build`: `build.js` still searched for the old keyboard-handler text `if(e.detail===0)`. Its exact-string injection anchor is now updated to the three-activation handler while retaining the `bfBypass` branch. The build-anchor follow-up `0b71d7ace36f7ca0b92f235bc63937daec2ad4a8` built and passed the existing guided/editorial checks, but the new `qa_heavy_access.py` timed out waiting for `BFRoom.navigate` in its initial condition before testing the action (Actions run 44267593062). The attempted start-up correction `38e24e6639f72246b191b8594ef44fc28a30fcad` failed in run 44267900023 because Playwright invoked a function returned by `wait_for_function('window.LW?.startFlat')` with no arguments, throwing within `startPhase`. The regression now checks a **boolean** condition (`typeof window.LW.startFlat === 'function'`) matching the passing resident QA scripts. In the subsequent [Actions run 44268140770](https://github.com/RileyTheRiler/being-found/actions/runs/44268140770), the new QA reached the action but incorrectly expected the native triple-activation path while **default-on Story attempts** captured the first click for the dice panel. The new regression explicitly switches Story attempts off through the existing public `BFSkillChecks.setEnabled(false)` API and then tests native triple-activation; the default remains on in production. The test correction `d45d9826f716799aa40ba690c0d678f912567c2b` proved three activations work, but [Actions 44268419799](https://github.com/RileyTheRiler/being-found/actions/runs/44268419799) flagged focus not restored after choosing an action. Root cause: the old `closeMenu()` focused a room pin *before* `interaction.js` removed `#app.inert`; focus was rejected. `interaction.js` now owns restoring focus after `setClosed()` un-inerts the room. [Actions run 44268831550](https://github.com/RileyTheRiler/being-found/actions/runs/44268831550) subsequently failed only the existing `qa_access85.py` desktop reduced-motion scroll check; phone passed, and desktop reached the test before it focused a field but raced the modal's delayed heading autofocus. The regression now waits for its normal heading-focus handoff before field focus. The actual `interaction.js` return-focus correction and this test adjustment remain unverified until the next full run.
- **Previous release verified:** 8.5.0 `11023d8cd8bd844e2db9a040c7000586e161ee99`, [Actions run 44266165147](https://github.com/RileyTheRiler/being-found/actions/runs/44266165147), all 29 steps passed.
- **Latest fully verified implementation:** `c97946c35495f58fbd26e1bbf0dabce485831118`; [GitHub Actions run 44269157774](https://github.com/RileyTheRiler/being-found/actions/runs/44269157774), **30/30 successful steps**. The final focus-return correction belongs to `interaction.js` after the action sheet releases the game's inert state. Keyboard and pointer triple-activation QA passes with optional Story attempts disabled; the default-on d12 interception is preserved. All other browser, narrative and save regressions pass.
- **Not established:** human classroom completion, real motor/assistive-tech usability, lived-experience validation, or Vercel deployment.

## Release 8.5.0 — classroom accessibility and inference (verified)
- The 2.5D scene, chapter routing, dice, outcomes and save rules are preserved. Source changes retain keyboard focus on the classroom Guide when collapsed/expanded, cancel stale modal-heading autofocus and honor reduced-motion preference in focused reflection fields.
- Walt's bridge no longer treats word-finding difficulty as an explanation of participation; the final practice vignette no longer introduces another diagnosis cue. Heavy-action repeated-input text identifies the action as authored, **without changing** the hold/three-tap mechanic; that mechanic remains an accessibility and philosophical review item.
- Added `qa_access85.py` (phone/desktop focus, modal transition and motion preference) and source/production editorial guards. Production build and full regression suite passed at `11023d8cd8bd844e2db9a040c7000586e161ee99` in Actions run 44266165147 (29/29 steps).
- **8.4.4 verified baseline:** `9b884fb26fdeb7a25ab26474def79823509b97db`, [Actions run 44263829397](https://github.com/RileyTheRiler/being-found/actions/runs/44263829397), successful.
- **Outstanding:** first-time student pilot, lived-experience editorial review, real screen-reader and alternate input checks, real-device testing, and Vercel deployment verification. Never interpret repeated-input difficulty as a measure of impairment.

## Release 8.3.10 changes
- Reflect hides the game from focus and screen-reader traversal only while its dialog is open, then restores the prior state and trigger focus on dismissal.
- Follow-up choices and answers announce in a short polite live region; the full story card remains readable without automatic focus moves.
- CI now includes headless Chrome checks for soundtrack off-by-default, opt-in play, volume slider input and mute on phone and desktop.

## Release 8.3.11 changes
- Mobile fictional inner-voice hint wraps with a touch-sized "Show me" button instead of squeezing Dele's longer instruction.
- New cross-flat stove browser regression at 360x640, 390x844, and 1440x900; checks each resident's available actions and Dele's hint accessibility.
- Covered by the verified 8.4.0 Actions baseline below.

## Release 8.4.0 changes
- Guided chapter transitions are brief, nonblocking, and absent when reduced motion is requested. A polite text status announces the chapter without forcing a delay.
- The classroom route proceeds straight to Dele's door after the preceding bridge (Rooms retains the ordinary referral screen). His silence, boundaries and stated wishes remain central.
- Shorter bridges separate the encounter from the fictional authored day, avoiding the implication that the day illustrates something independently verified about Dele.
- The final exercise asks what is observed, what is inferred, and what is unknown. A source-linked Ratcliffe note stays collapsed until the learner chooses to read it.
- Added `qa_guided84.py` for two viewport guided-route checks, Dele's pause and voluntary departure, final reflection, responsive overflow and a motion-preference check.
- The completed 8.4.0 implementation has passed the full production build and browser suite; see the verified run below.

## Release 8.4.1 editorial pass
- Rewrote Dele’s opening, meal/painting/social/temporal study notes, and final debrief to avoid suggesting all depressive experiences follow the same course. Retained one severe fictional case and its mechanics.
- The original Saturday summary insertion silently did nothing because its search text no longer existed. It now appends the actual day-to-day qualification once.
- `EDITORIAL_REVIEW.md` documents source grounding, narrative risks, items not yet reviewed, and recommended paid lived-experience feedback. This was a desk audit only.
- Added `qa_editorial.py` to protect the edited source and production HTML; expanded guided browser regression to confirm edited passages appear in the running game.
- The release’s build/browser status must be verified against its own GitHub Actions run before declaring it passed.

## Release 8.4.2: Wren, Ilse and pacing
- Edited Wren’s fictional depersonalization narrative and Ilse’s psychosis-related narrative to distinguish reported experience from observed action, avoid diagnostic universals and unproven causal models, and keep reflection on uncertainty. Changed both visitors’ suggested actions to request consent before intervention; did not change numeric outcomes or mechanics.
- Added in-tab chapter elapsed timing, with a section-duration summary visible only from **Facilitator questions** and in a user-triggered reflection copy. There is **no telemetry, score, persistent timer or on-screen countdown**. It includes idle time and is not evidence of 10–15-minute completion.
- Added `CLASSROOM_PILOT.md` with instructions to collect independent completion times and comprehension feedback. Updated `EDITORIAL_REVIEW.md` with literature, scene inventory and limits.
- Added `qa_wren_ilse.py`, expanded `qa_editorial.py` and `qa_guided84.py` to cover scene phrasing, runtime content and local pacing. The 8.4.2 code review found missing commas after edited Wren/Ilse scope/intro fields, preventing base-script initialization. Fixed the commas, verified inline script parsing, and added `qa_js_syntax.py` before browser tests. The runtime QA test also waits for startup. **Verified:** commit `046322d5c46ce7b0a9d8d0a133fdbc2f31afaa30`, [GitHub Actions run 44187648896](https://github.com/RileyTheRiler/being-found/actions/runs/44187648896), completed successfully with all **26/26 steps passing**.
- **Baseline at start of this release:** 8.4.1 commit `265cd0db2cebdf360c1844f45384e1194ff0d5c1`, successful Actions run [44181478986](https://github.com/RileyTheRiler/being-found/actions/runs/44181478986) (24/24 steps).

## Release 8.4.3 — narrative accuracy desk review (Actions pending)
- Text-only changes to Tomas, Mika, Walt, Ruth and Kai; detailed inventory in `EDITORIAL_REVIEW.md`.
- Each fictional story now avoids fixed grief recovery, condition-derived competence, inevitable policy outcomes, and deterministic shutdown; no game mechanic, phase variable, branch, save, or guided pacing code changed.
- Added `qa_remaining_scenes.py`, extended `qa_editorial.py`, and added the new browser step to quality.yml.
- This commit must be checked against its own GitHub Actions run before calling 8.4.3 verified.
- Next: classroom pilot instruments, facilitator checklist and dry-run protocol, then separate CI.

## Release 8.4.4 — pilot readiness packet (Actions pending)
- Added `pilot/FACILITATOR_SHEET.md`, `pilot/SCORING_GUIDE.md`, `pilot/ACCESSIBILITY_CHECKLIST.md`, five unfilled pseudonymous rows in `pilot/observations.csv`, and `pilot_summary.py` for local aggregate statistics.
- Local script was self-tested for medians, ranges, denominators, first-action and blocker counts. Added the script self-test and empty-template validation to GitHub Actions. No in-game mechanics or save/timing scripts were changed.
- **Verified preceding implementation:** 8.4.3 `6213ae0ba8f3639b886cfb261bfacc9be43d01a6`, [Actions run 44262661463](https://github.com/RileyTheRiler/being-found/actions/runs/44262661463) **success, all 27 steps**. Do not claim 8.4.4 verified before its own run passes.
- Next: recruit consenting first-time SLP learners for the actual pilot, independently time completion, record blockers and reflections, and separately arrange compensated lived-experience and real-screen-reader tests. No human pilot conducted.

## Verified 8.4.2 baseline for next chat
- **Branch:** `main`; verified implementation SHA `046322d5c46ce7b0a9d8d0a133fdbc2f31afaa30`.
- **Quality:** [run 44187648896](https://github.com/RileyTheRiler/being-found/actions/runs/44187648896) succeeded, 26/26 steps including new JS parser, Wren/Ilse runtime, source wording, guided route and timing, five viewports, menu, save, focus, audio, stove, story and visits.
- **Scope:** 8.4.2 desk-reviewed Dele, Wren and Ilse. No human pilot, lived-experience validation, real-device audio listening, TalkBack/VoiceOver, or Vercel deployment confirmation.
- **Next action:** Continue M2 on Mika/Kai/Walt/Ruth/Tomas; run `CLASSROOM_PILOT.md` with real first-time players before making a 10–15-minute completion claim. Keep the 2.5D renderer.

## Historical verified 8.4.0 baseline
- **Branch:** `main` of `RileyTheRiler/being-found`.
- **Last implementation commit verified by the full suite:** `889ec1edb0b48988ae7fafa8d484585b74fc4dc0`.
- **Successful GitHub Actions run:** [44122144223](https://github.com/RileyTheRiler/being-found/actions/runs/44122144223). The `Being Found quality` workflow completed successfully with all 23 steps passing: production `npm run build`, guided story 8.4 regression, five viewport smoke test, menu routes, save/resume, Reflect keyboard focus, opt-in audio controls, all-five-flat stove interactions, state preservation, existing story/follow-up checks, and separate Dele/visit checks.
- **Historical verified release:** 8.4.0; see above. Package version is now 8.4.2; see the 8.4.2 release section and verify its own Actions before calling it passed.
- **Known bugs fixed while validating:** `syncGuide()` no longer relocates the desktop classroom Guide into a hidden tablet dock at 1440×900; asynchronous stage-start focus no longer steals keyboard focus from Reflect. The mobile Guide is intentionally hidden until the topbar Guide toggle opens it.
- **Untested outside headless Chrome:** physical Android/iPhone/iPad behavior; real screen readers; actual audio listening; classroom learning outcomes and duration; lived-experience review of Dele and other narratives. Do not claim a Vercel deployment from GitHub Actions.
- **Next code priority after 8.4.2:** Audit Mika, Kai, Walt, Ruth and Tomas; collect real first-time 10–15-minute pacing and living-experience feedback; test TalkBack/VoiceOver on actual devices. Do not start a 3D renderer rewrite.

## Next suggested work
- Run the real classroom pilot in `CLASSROOM_PILOT.md`; local timing is available in the facilitator panel but automated tests cannot validate human pacing.
- Observe real classroom users completing the route. Check whether the sequence feels cohesive and the ending takes 10–15 minutes without rushing.
- Add careful lived-experience editorial review of Dele's inner voice, then test TalkBack/VoiceOver and real-device transitions.
- Keep the 8.4.0 scoped release stable before another architectural refactor.

## Not yet checked
Actual listening/audio quality, real devices, real screen readers (TalkBack/VoiceOver/NVDA), real-device stove and Dele hint behavior (automated browser coverage added). CI is not a substitute for assistive-technology validation.

## Notes
- CSS is a specificity war with `!important`; `.layout` is a flex item, so fixed heights need `flex:none!important`.
- `body.cl-route` (guided classroom) withholds the world readout on purpose.

## The rig files
The hosted page cannot serve `.glb`, so `assets/*_rig.glb` ship as `assets/*_rig.glb.b64.txt`. Restore with
`base64 -d noor_rig.glb.b64.txt > noor_rig.glb`. The game does not load them; they only regenerate the sprite atlases.
Python test files ship as `.py.txt` and `.gitignore` as `gitignore.txt`: rename them back.

## Chat handoffs
The user wants proactive advice when a new development chat would help. Recommend one after a significant completed milestone or when long context threatens accuracy, **not** automatically each iteration. Before recommending, record the current branch and commit, test evidence, unresolved problems and next action here and in `SAVE_NOTES.md`. Always read this file first in the next chat.
