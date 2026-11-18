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

## Release 8.5.1 — heavy-action input parity (browser QA correction pending CI)
- Preserve **the same pointer hold and three-activation action rule** and all state, action outcomes and save behavior. For keyboard and assistive-tech generated clicks, use the existing three-activation path instead of starting a 1.3-second hidden timer. Return focus to the originating room marker after action-menu dismissal when focus was inside the menu.
- Expose the transient instruction as a polite accessibility status and describe heavy actions as an authored input cue, not a motor test. Add `qa_heavy_access.py` for keyboard and pointer input; source/build text guards and a dedicated CI step check the behavior. Manual switch/TalkBack/VoiceOver testing remains necessary.
- Fixed the nested `package-lock.json` version left at 8.4.4 by the prior release script; package and lock entries now both read 8.5.1. The production build still succeeded in 8.5.0, but version metadata should be consistent.
- **CI diagnostic:** the first 8.5.1 implementation `4a6625a62e06956da68dd66cebfc9b6efdbc9c49` failed at `npm run build`: `build.js` still searched for the old keyboard-handler text `if(e.detail===0)`. Its exact-string injection anchor is now updated to the three-activation handler while retaining the `bfBypass` branch. The build-anchor follow-up `0b71d7ace36f7ca0b92f235bc63937daec2ad4a8` built and passed the existing guided/editorial checks, but the new `qa_heavy_access.py` timed out waiting for `BFRoom.navigate` in its initial condition before testing the action (Actions run 44267593062). The new test now follows the verified `LW.startFlat` startup wait used by the other browser tests. This corrective commit requires its own full Actions verification.
- **Previous release verified:** 8.5.0 `11023d8cd8bd844e2db9a040c7000586e161ee99`, [Actions run 44266165147](https://github.com/RileyTheRiler/being-found/actions/runs/44266165147), all 29 steps passed.
- **Not established:** human classroom completion, real motor/assistive-tech usability, living-experience validation, or Vercel deployment.

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
